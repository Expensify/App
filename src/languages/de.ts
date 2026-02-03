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
import StringUtils from '@libs/StringUtils';
import dedent from '@libs/StringUtils/dedent';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type OriginalMessage from '@src/types/onyx/OriginalMessage';
import type {OriginalMessageSettlementAccountLocked, PolicyRulesModifiedFields} from '@src/types/onyx/OriginalMessage';
import ObjectUtils from '@src/types/utils/ObjectUtils';
import type en from './en';
import type {
    ChangeFieldParams,
    ConnectionNameParams,
    CreatedReportForUnapprovedTransactionsParams,
    DelegateRoleParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    EditActionParams,
    ExportAgainModalDescriptionParams,
    ExportIntegrationSelectedParams,
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
    MultifactorAuthenticationTranslationParams,
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
    ParentNavigationSummaryParams,
    PayAndDowngradeDescriptionParams,
    PayerOwesParams,
    PayerPaidParams,
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
    RequiredFieldParams,
    ResolutionConstraintsParams,
    ReviewParams,
    RoleNamesParams,
    RoomNameReservedErrorParams,
    RoomRenamedToParams,
    RoutedDueToDEWParams,
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
    SplitDateRangeParams,
    SplitExpenseEditTitleParams,
    SplitExpenseSubtitleParams,
    StatementTitleParams,
    StepCounterParams,
    StripePaidParams,
    SubmitsToParams,
    SubmittedToVacationDelegateParams,
    SubmittedWithMemoParams,
    SubscriptionCommitmentParams,
    SubscriptionSettingsLearnMoreParams,
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
    UpdatedPolicyCustomUnitRateEnabledParams,
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
    UpdatedPolicyReimburserParams,
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
const translations: TranslationDeepObject<typeof en> = {
    common: {
        count: 'Anzahl',
        cancel: 'Abbrechen',
        dismiss: 'Schließen',
        proceed: 'Weiter',
        unshare: 'Freigabe aufheben',
        yes: 'Ja',
        no: 'Nein',
        ok: 'OK',
        notNow: 'Nicht jetzt',
        noThanks: 'Nein danke',
        learnMore: 'Erfahre mehr',
        buttonConfirm: 'Verstanden',
        name: 'Name',
        attachment: 'Anhang',
        attachments: 'Anhänge',
        center: 'Zentrieren',
        from: 'Von',
        to: 'AnBis',
        in: 'In',
        optional: 'Optional',
        new: 'Neu',
        newFeature: 'Neue Funktion',
        search: 'Suchen',
        reports: 'Berichte',
        find: 'Finden',
        searchWithThreeDots: 'Suchen...',
        next: 'Weiter',
        previous: 'Zurück',
        goBack: 'Zurück',
        create: 'Erstellen',
        add: 'Hinzufügen',
        resend: 'Erneut senden',
        save: 'Speichern',
        select: 'Auswählen',
        deselect: 'Auswählen aufheben',
        selectMultiple: 'Mehrfachauswahl',
        saveChanges: 'Änderungen speichern',
        submit: 'Senden',
        submitted: 'Eingereicht',
        rotate: 'Drehen',
        zoom: 'Zoom',
        password: 'Passwort',
        magicCode: 'Magischer Code',
        digits: 'Ziffern',
        twoFactorCode: 'Zwei-Faktor-Code',
        workspaces: 'Workspaces',
        home: 'Startseite',
        inbox: 'Posteingang',
        success: 'Erfolgreich',
        group: 'Gruppe',
        profile: 'Profil',
        referral: 'Empfehlung',
        payments: 'Zahlungen',
        approvals: 'Genehmigungen',
        wallet: 'Wallet',
        preferences: 'Einstellungen',
        view: 'Anzeigen',
        review: (reviewParams?: ReviewParams) => `Bewerten${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Nicht',
        signIn: 'Anmelden',
        signInWithGoogle: 'Mit Google anmelden',
        signInWithApple: 'Bei Apple anmelden',
        signInWith: 'Anmelden mit',
        continue: 'Weiter',
        firstName: 'Vorname',
        lastName: 'Nachname',
        scanning: 'Scannen',
        analyzing: 'Analysiere …',
        addCardTermsOfService: 'Expensify-Nutzungsbedingungen',
        perPerson: 'pro Person',
        phone: 'Telefon',
        phoneNumber: 'Telefonnummer',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'E-Mail',
        and: 'und',
        or: 'oder',
        details: 'Details',
        privacy: 'Datenschutz',
        privacyPolicy: 'Datenschutzerklärung',
        hidden: 'Ausgeblendet',
        visible: 'Sichtbar',
        delete: 'Löschen',
        archived: 'archiviert',
        contacts: 'Kontakte',
        recents: 'Zuletzt verwendet',
        close: 'Schließen',
        comment: 'Kommentar',
        download: 'Herunterladen',
        downloading: 'Wird heruntergeladen',
        uploading: 'Wird hochgeladen',
        pin: 'Anheften',
        unPin: 'Anheften aufheben',
        back: 'Zurück',
        saveAndContinue: 'Speichern & weiter',
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
        ssnFull9: 'Volle 9 Ziffern der Sozialversicherungsnummer',
        addressLine: (lineNumber: number) => `Adresszeile ${lineNumber}`,
        personalAddress: 'Privatadresse',
        companyAddress: 'Firmenadresse',
        noPO: 'Bitte keine Postfächer oder Maildrop-Adressen.',
        city: 'Stadt',
        state: 'Status',
        streetAddress: 'Straßenadresse',
        stateOrProvince: 'Bundesland / Provinz',
        country: 'Land',
        zip: 'Postleitzahl',
        zipPostCode: 'PLZ / Postleitzahl',
        whatThis: 'Was ist das?',
        iAcceptThe: 'Ich akzeptiere die',
        acceptTermsAndPrivacy: `Ich akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify-Nutzungsbedingungen</a> und die <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzrichtlinie</a>`,
        acceptTermsAndConditions: `Ich akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">Allgemeinen Geschäftsbedingungen</a>`,
        acceptTermsOfService: `Ich akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify-Nutzungsbedingungen</a>`,
        remove: 'Entfernen',
        admin: 'Admin',
        owner: 'Eigentümer',
        dateFormat: 'JJJJ-MM-TT',
        send: 'Senden',
        na: 'k. A.',
        noResultsFound: 'Keine Ergebnisse gefunden',
        noResultsFoundMatching: (searchString: string) => `Keine Ergebnisse gefunden für „${searchString}“`,
        recentDestinations: 'Letzte Ziele',
        timePrefix: 'Es ist',
        conjunctionFor: 'für',
        todayAt: 'Heute um',
        tomorrowAt: 'Morgen um',
        yesterdayAt: 'Gestern um',
        conjunctionAt: 'um',
        conjunctionTo: 'bis',
        genericErrorMessage: 'Ups ... etwas ist schiefgelaufen und Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es später noch einmal.',
        percentage: 'Prozentsatz',
        converted: 'Umgewandelt',
        error: {
            invalidAmount: 'Ungültiger Betrag',
            acceptTerms: 'Sie müssen die Nutzungsbedingungen akzeptieren, um fortzufahren',
            phoneNumber: `Bitte gib eine vollständige Telefonnummer ein
(z. B. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Dieses Feld ist erforderlich',
            requestModified: 'Diese Anfrage wird von einem anderen Mitglied bearbeitet',
            characterLimitExceedCounter: (length: number, limit: number) => `Zeichenlimit überschritten (${length}/${limit})`,
            dateInvalid: 'Bitte wähle ein gültiges Datum aus',
            invalidDateShouldBeFuture: 'Bitte wähle das heutige Datum oder ein zukünftiges Datum',
            invalidTimeShouldBeFuture: 'Bitte wähle eine Uhrzeit, die mindestens eine Minute in der Zukunft liegt',
            invalidCharacter: 'Ungültiges Zeichen',
            enterMerchant: 'Gib einen Händlernamen ein',
            enterAmount: 'Betrag eingeben',
            missingMerchantName: 'Fehlender Händlernamen',
            missingAmount: 'Fehlender Betrag',
            missingDate: 'Fehlendes Datum',
            enterDate: 'Gib ein Datum ein',
            invalidTimeRange: 'Bitte gib eine Uhrzeit im 12-Stunden-Format ein (z. B. 2:30 PM)',
            pleaseCompleteForm: 'Bitte füllen Sie das Formular oben aus, um fortzufahren',
            pleaseSelectOne: 'Bitte wählen Sie oben eine Option aus',
            invalidRateError: 'Bitte gib einen gültigen Tarif ein',
            lowRateError: 'Der Satz muss größer als 0 sein',
            email: 'Bitte gib eine gültige E-Mail-Adresse ein',
            login: 'Beim Anmelden ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        comma: 'Komma',
        semicolon: 'Semikolon',
        please: 'Bitte',
        contactUs: 'Kontaktiere uns',
        pleaseEnterEmailOrPhoneNumber: 'Bitte E-Mail-Adresse oder Telefonnummer eingeben',
        fixTheErrors: 'Behebe die Fehler',
        inTheFormBeforeContinuing: 'im Formular, bevor du fortfährst',
        confirm: 'Bestätigen',
        reset: 'Zurücksetzen',
        done: 'Fertig',
        more: 'Mehr',
        debitCard: 'Debitkarte',
        bankAccount: 'Bankkonto',
        personalBankAccount: 'Persönliches Bankkonto',
        businessBankAccount: 'Geschäftsbankkonto',
        join: 'Beitreten',
        leave: 'Verlassen',
        decline: 'Ablehnen',
        reject: 'Ablehnen',
        transferBalance: 'Saldo übertragen',
        enterManually: 'Manuell eingeben',
        message: 'Nachricht',
        leaveThread: 'Unterhaltung verlassen',
        you: 'Du',
        me: 'Ich',
        youAfterPreposition: 'du',
        your: 'dein',
        conciergeHelp: 'Bitte wende dich für Hilfe an Concierge.',
        youAppearToBeOffline: 'Es scheint, dass du offline bist.',
        thisFeatureRequiresInternet: 'Diese Funktion erfordert eine aktive Internetverbindung.',
        attachmentWillBeAvailableOnceBackOnline: 'Der Anhang wird verfügbar, sobald du wieder online bist.',
        errorOccurredWhileTryingToPlayVideo: 'Beim Versuch, dieses Video abzuspielen, ist ein Fehler aufgetreten.',
        areYouSure: 'Bist du sicher?',
        verify: 'Bestätigen',
        yesContinue: 'Ja, fortfahren',
        websiteExample: 'z.B. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `z. B. ${zipSampleFormat}` : ''),
        description: 'Beschreibung',
        title: 'Titel',
        assignee: 'Zuständige Person',
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
        letsDoThis: `Los geht's!`,
        letsStart: `Lass uns anfangen`,
        showMore: 'Mehr anzeigen',
        showLess: 'Weniger anzeigen',
        merchant: 'Händler',
        change: 'Ändern',
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
        recent: 'Zuletzt',
        all: 'Alle',
        am: 'vorm.',
        pm: 'PM',
        tbd: 'Noch festzulegen',
        selectCurrency: 'Währung auswählen',
        selectSymbolOrCurrency: 'Wähle ein Symbol oder eine Währung',
        card: 'Karte',
        whyDoWeAskForThis: 'Warum fragen wir danach?',
        required: 'Erforderlich',
        showing: 'Wird angezeigt',
        of: 'von',
        default: 'Standard',
        update: 'Aktualisieren',
        member: 'Mitglied',
        auditor: 'Prüfer',
        role: 'Rolle',
        currency: 'Währung',
        groupCurrency: 'Gruppenwährung',
        rate: 'Bewerten',
        emptyLHN: {
            title: 'Juhu! Alles erledigt.',
            subtitleText1: 'Finde einen Chat mit der',
            subtitleText2: 'Schaltfläche oben oder erstelle etwas mit der',
            subtitleText3: 'Schaltfläche unten.',
        },
        businessName: 'Firmenname',
        clear: 'Löschen',
        type: 'Art',
        reportName: 'Berichtsname',
        action: 'Aktion',
        expenses: 'Ausgaben',
        totalSpend: 'Gesamtausgaben',
        tax: 'Steuer',
        shared: 'Geteilt',
        drafts: 'Entwürfe',
        draft: 'Entwurf',
        finished: 'Abgeschlossen',
        upgrade: 'Upgrade',
        downgradeWorkspace: 'Arbeitsbereich herabstufen',
        companyID: 'Firmen-ID',
        userID: 'Benutzer-ID',
        disable: 'Deaktivieren',
        export: 'Export',
        initialValue: 'Anfangswert',
        currentDate: 'Aktuelles Datum',
        value: 'Wert',
        downloadFailedTitle: 'Download fehlgeschlagen',
        downloadFailedDescription: 'Ihr Download konnte nicht abgeschlossen werden. Bitte versuchen Sie es später noch einmal.',
        filterLogs: 'Protokolle filtern',
        network: 'Netzwerk',
        reportID: 'Berichts-ID',
        longReportID: 'Langer Berichts-ID',
        withdrawalID: 'Auszahlungs-ID',
        bankAccounts: 'Bankkonten',
        chooseFile: 'Datei auswählen',
        chooseFiles: 'Dateien auswählen',
        dropTitle: 'Loslassen',
        dropMessage: 'Datei hier ablegen',
        ignore: 'Ignorieren',
        enabled: 'Aktiviert',
        disabled: 'Deaktiviert',
        import: 'Importieren',
        offlinePrompt: 'Diese Aktion kann derzeit nicht ausgeführt werden.',
        outstanding: 'Offen',
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
        secondAbbreviation: 's',
        skip: 'Überspringen',
        chatWithAccountManager: (accountManagerDisplayName: string) => `Brauchen Sie etwas Bestimmtes? Chatten Sie mit Ihrer/Ihrem Account Manager: ${accountManagerDisplayName}.`,
        chatNow: 'Jetzt chatten',
        workEmail: 'Geschäftliche E-Mail',
        destination: 'Ziel',
        subrate: 'Nebensatz',
        perDiem: 'Tagespauschale',
        validate: 'Validieren',
        downloadAsPDF: 'Als PDF herunterladen',
        downloadAsCSV: 'Als CSV herunterladen',
        help: 'Hilfe',
        expenseReport: 'Spesenabrechnung',
        expenseReports: 'Spesenabrechnungen',
        rateOutOfPolicy: 'Tarif außerhalb der Richtlinie',
        leaveWorkspace: 'Arbeitsbereich verlassen',
        leaveWorkspaceConfirmation: 'Wenn du diesen Workspace verlässt, kannst du keine Ausgaben mehr dafür einreichen.',
        leaveWorkspaceConfirmationAuditor: 'Wenn du diesen Workspace verlässt, kannst du seine Berichte und Einstellungen nicht mehr anzeigen.',
        leaveWorkspaceConfirmationAdmin: 'Wenn du diesen Workspace verlässt, kannst du seine Einstellungen nicht mehr verwalten.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Workspace verlässt, wirst du im Genehmigungsworkflow durch ${workspaceOwner}, den/die Workspace-Inhaber(in), ersetzt.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Workspace verlässt, wirst du als bevorzugte exportierende Person durch ${workspaceOwner}, die Workspace-Inhaberin bzw. den Workspace-Inhaber, ersetzt.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Workspace verlässt, wirst du als technische Kontaktperson durch ${workspaceOwner}, den/die Workspace-Inhaber·in, ersetzt.`,
        leaveWorkspaceReimburser:
            'Du kannst diesen Workspace als Erstattungsverantwortliche*r nicht verlassen. Bitte lege unter „Workspaces > Zahlungen ausführen oder nachverfolgen“ eine*n neue*n Erstattungsverantwortliche*n fest und versuche es dann erneut.',
        reimbursable: 'Erstattungsfähig',
        editYourProfile: 'Profil bearbeiten',
        comments: 'Kommentare',
        sharedIn: 'Geteilt in',
        unreported: 'Nicht gemeldet',
        explore: 'Entdecken',
        insights: 'Analysen',
        todo: 'To-do',
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
        workspacesTabTitle: 'Workspaces',
        headsUp: 'Achtung!',
        submitTo: 'Einreichen bei',
        forwardTo: 'Weiterleiten an',
        merge: 'Zusammenführen',
        none: 'Keine',
        unstableInternetConnection: 'Instabile Internetverbindung. Bitte überprüfe dein Netzwerk und versuche es erneut.',
        enableGlobalReimbursements: 'Globale Rückerstattungen aktivieren',
        purchaseAmount: 'Kaufbetrag',
        originalAmount: 'Ursprünglicher Betrag',
        frequency: 'Häufigkeit',
        link: 'Link',
        pinned: 'Angeheftet',
        read: 'Lesen',
        copyToClipboard: 'In die Zwischenablage kopieren',
        thisIsTakingLongerThanExpected: 'Das dauert länger als erwartet ...',
        domains: 'Domains',
        actionRequired: 'Aktion erforderlich',
        duplicate: 'Duplizieren',
        duplicated: 'Dupliziert',
        duplicateExpense: 'Doppelte Ausgabe',
        exchangeRate: 'Wechselkurs',
        reimbursableTotal: 'Erstattungsfähiger Gesamtbetrag',
        nonReimbursableTotal: 'Nicht erstattungsfähige Gesamtsumme',
        month: 'Monat',
        week: 'Woche',
        year: 'Jahr',
        quarter: 'Quartal',
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
        description: 'Sie dürfen diese Aktion nicht ausführen, da dieses Konto gesperrt wurde. Bitte wenden Sie sich für die nächsten Schritte an concierge@expensify.com.',
    },
    location: {
        useCurrent: 'Aktuellen Standort verwenden',
        notFound: 'Wir konnten deinen Standort nicht finden. Bitte versuche es erneut oder gib eine Adresse manuell ein.',
        permissionDenied: 'Es sieht so aus, als hätten Sie den Zugriff auf Ihren Standort verweigert.',
        please: 'Bitte',
        allowPermission: 'Standortzugriff in den Einstellungen erlauben',
        tryAgain: 'und versuche es erneut.',
    },
    contact: {
        importContacts: 'Kontakte importieren',
        importContactsTitle: 'Kontakte importieren',
        importContactsText: 'Importiere Kontakte von deinem Handy, damit deine Lieblingsmenschen immer nur einen Tipp entfernt sind.',
        importContactsExplanation: 'damit deine Lieblingsmenschen immer nur einen Tipp entfernt sind.',
        importContactsNativeText: 'Nur noch ein Schritt! Gib uns grünes Licht, damit wir deine Kontakte importieren können.',
    },
    anonymousReportFooter: {
        logoTagline: 'Beteilige dich an der Diskussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Kamerazugriff',
        expensifyDoesNotHaveAccessToCamera: 'Expensify kann ohne Zugriff auf deine Kamera keine Fotos aufnehmen. Tippe auf „Einstellungen“, um die Berechtigungen zu aktualisieren.',
        attachmentError: 'Anlagenfehler',
        errorWhileSelectingAttachment: 'Beim Auswählen eines Anhangs ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        errorWhileSelectingCorruptedAttachment: 'Beim Auswählen eines beschädigten Anhangs ist ein Fehler aufgetreten. Bitte versuchen Sie es mit einer anderen Datei.',
        takePhoto: 'Foto aufnehmen',
        chooseFromGallery: 'Aus Galerie auswählen',
        chooseDocument: 'Datei auswählen',
        attachmentTooLarge: 'Anhang ist zu groß',
        sizeExceeded: 'Die Anhangsgröße überschreitet das Limit von 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Die Anhangsgröße überschreitet das Limit von ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Anhang ist zu klein',
        sizeNotMet: 'Die Anhangsgröße muss größer als 240 Byte sein',
        wrongFileType: 'Ungültiger Dateityp',
        notAllowedExtension: 'Dieser Dateityp ist nicht zulässig. Bitte versuchen Sie einen anderen Dateityp.',
        folderNotAllowedMessage: 'Das Hochladen eines Ordners ist nicht erlaubt. Bitte versuche eine andere Datei.',
        protectedPDFNotSupported: 'Passwortgeschützte PDF-Datei wird nicht unterstützt',
        attachmentImageResized: 'Dieses Bild wurde für die Vorschau verkleinert. Lade es für die volle Auflösung herunter.',
        attachmentImageTooLarge: 'Dieses Bild ist zu groß, um vor dem Hochladen eine Vorschau anzuzeigen.',
        tooManyFiles: (fileLimit: number) => `Sie können jeweils nur bis zu ${fileLimit} Dateien hochladen.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Dateien überschreiten ${maxUploadSizeInMB} MB. Bitte versuche es erneut.`,
        someFilesCantBeUploaded: 'Einige Dateien können nicht hochgeladen werden',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Dateien müssen kleiner als ${maxUploadSizeInMB} MB sein. Größere Dateien werden nicht hochgeladen.`,
        maxFileLimitExceeded: 'Sie können bis zu 30 Belege auf einmal hochladen. Alle darüber hinausgehenden werden nicht hochgeladen.',
        unsupportedFileType: (fileType: string) => `${fileType}-Dateien werden nicht unterstützt. Es werden nur unterstützte Dateitypen hochgeladen.`,
        learnMoreAboutSupportedFiles: 'Weitere Informationen zu unterstützten Formaten.',
        passwordProtected: 'Passwortgeschützte PDFs werden nicht unterstützt. Es werden nur unterstützte Dateien hochgeladen.',
    },
    dropzone: {
        addAttachments: 'Anhänge hinzufügen',
        addReceipt: 'Beleg hinzufügen',
        scanReceipts: 'Belege scannen',
        replaceReceipt: 'Beleg ersetzen',
    },
    filePicker: {
        fileError: 'Dateifehler',
        errorWhileSelectingFile: 'Beim Auswählen einer Datei ist ein Fehler aufgetreten. Bitte versuche es erneut.',
    },
    connectionComplete: {
        title: 'Verbindung hergestellt',
        supportingText: 'Sie können dieses Fenster schließen und zur Expensify-App zurückkehren.',
    },
    avatarCropModal: {
        title: 'Foto bearbeiten',
        description: 'Ziehe, zoome und drehe dein Bild, wie du möchtest.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Keine Erweiterung für MIME-Typ gefunden',
        problemGettingImageYouPasted: 'Beim Abrufen des von dir eingefügten Bildes ist ein Problem aufgetreten',
        commentExceededMaxLength: (formattedMaxLength: string) => `Die maximale Kommentarlänge beträgt ${formattedMaxLength} Zeichen.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `Die maximale Aufgabenditztellänge beträgt ${formattedMaxLength} Zeichen.`,
    },
    baseUpdateAppModal: {
        updateApp: 'App aktualisieren',
        updatePrompt: 'Eine neue Version dieser App ist verfügbar.\nAktualisiere sie jetzt oder starte die App später neu, um die neuesten Änderungen herunterzuladen.',
    },
    deeplinkWrapper: {
        launching: 'Expensify wird gestartet',
        expired: 'Ihre Sitzung ist abgelaufen.',
        signIn: 'Bitte melden Sie sich erneut an.',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: 'Biometrischer Test',
            authenticationSuccessful: 'Authentifizierung erfolgreich',
            successfullyAuthenticatedUsing: ({authType}: MultifactorAuthenticationTranslationParams) => `Du hast dich erfolgreich mit ${authType} authentifiziert.`,
            troubleshootBiometricsStatus: ({registered}: MultifactorAuthenticationTranslationParams) => `Biometrische Daten (${registered ? 'Registriert' : 'Nicht registriert'})`,
            yourAttemptWasUnsuccessful: 'Dein Authentifizierungsversuch war nicht erfolgreich.',
            youCouldNotBeAuthenticated: 'Sie konnten nicht authentifiziert werden',
            areYouSureToReject: 'Sind Sie sicher? Der Authentifizierungsversuch wird abgelehnt, wenn Sie diesen Bildschirm schließen.',
            rejectAuthentication: 'Authentifizierung ablehnen',
            test: 'Test',
            biometricsAuthentication: 'Biometrische Authentifizierung',
        },
        pleaseEnableInSystemSettings: {
            start: 'Bitte aktivieren Sie die Gesichts-/Fingerabdruckprüfung oder richten Sie einen Gerätecode ein in Ihrem',
            link: 'Systemeinstellungen',
            end: '.',
        },
        oops: 'Ups, da ist etwas schiefgelaufen',
        looksLikeYouRanOutOfTime: 'Anscheinend ist Ihre Zeit abgelaufen! Bitte versuchen Sie es erneut beim Händler.',
        youRanOutOfTime: 'Dir ist die Zeit ausgegangen',
        letsVerifyItsYou: 'Bestätigen wir Ihre Identität',
        verifyYourself: {
            biometrics: 'Bestätige dich mit deinem Gesicht oder Fingerabdruck',
        },
        enableQuickVerification: {
            biometrics: 'Aktiviere eine schnelle, sichere Verifizierung mit Gesicht oder Fingerabdruck. Keine Passwörter oder Codes erforderlich.',
        },
        revoke: {
            remove: 'Entfernen',
            title: 'Gesicht/Fingerabdruck & Passkeys',
            explanation:
                'Gesichts-/Fingerabdruck- oder Passkey-Verifizierung ist auf einem oder mehreren Geräten aktiviert. Das Widerrufen des Zugriffs erfordert bei der nächsten Verifizierung auf einem beliebigen Gerät einen magischen Code.',
            confirmationPrompt: 'Bist du sicher? Du benötigst einen magischen Code für die nächste Verifizierung auf jedem Gerät.',
            cta: 'Zugriff widerrufen',
            noDevices: 'Du hast keine Geräte für die Gesichts-/Fingerabdruck- oder Passkey-Verifizierung registriert. Wenn du welche registrierst, kannst du diesen Zugriff hier widerrufen.',
            dismiss: 'Verstanden',
            error: 'Anfrage fehlgeschlagen. Versuche es später erneut.',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abrakadabra,
            du bist angemeldet!
        `),
        successfulSignInDescription: 'Wechsle zurück zu deinem ursprünglichen Tab, um fortzufahren.',
        title: 'Hier ist dein magischer Code',
        description: dedent(`
            Bitte gib den Code auf dem Gerät ein,  
            auf dem er ursprünglich angefordert wurde
        `),
        doNotShare: dedent(`
            Gib deinen Code nicht an andere weiter.  
            Expensify wird dich niemals danach fragen!
        `),
        or: 'oder',
        signInHere: 'melden Sie sich einfach hier an',
        expiredCodeTitle: 'Magischer Code abgelaufen',
        expiredCodeDescription: 'Geh zurück zum ursprünglichen Gerät und fordere einen neuen Code an',
        successfulNewCodeRequest: 'Code angefordert. Bitte überprüfe dein Gerät.',
        tfaRequiredTitle: dedent(`
            Zwei-Faktor-Authentifizierung
            erforderlich
        `),
        tfaRequiredDescription: dedent(`
            Bitte gib den Zwei-Faktor-Authentifizierungscode dort ein, wo du versuchst, dich anzumelden.
        `),
        requestOneHere: 'Fordern Sie hier eine an.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Bezahlt von',
        whatsItFor: 'Wofür ist das?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Name, E-Mail-Adresse oder Telefonnummer',
        findMember: 'Mitglied suchen',
        searchForSomeone: 'Nach jemandem suchen',
    },
    customApprovalWorkflow: {
        title: 'Benutzerdefinierter Genehmigungsworkflow',
        description: 'Ihr Unternehmen verwendet in diesem Workspace einen benutzerdefinierten Genehmigungsworkflow. Bitte führen Sie diese Aktion in Expensify Classic aus',
        goToExpensifyClassic: 'Zu Expensify Classic wechseln',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Reiche eine Ausgabe ein, empfehle dein Team weiter',
            subtitleText: 'Möchtest du, dass dein Team Expensify auch nutzt? Reiche ihnen einfach eine Ausgabe ein, und wir kümmern uns um den Rest.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Termin buchen',
    },
    hello: 'Hallo',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Leg direkt unten los.',
        anotherLoginPageIsOpen: 'Eine andere Anmeldeseite ist geöffnet.',
        anotherLoginPageIsOpenExplanation: 'Sie haben die Anmeldeseite in einem separaten Tab geöffnet. Bitte melden Sie sich in diesem Tab an.',
        welcome: 'Willkommen!',
        welcomeWithoutExclamation: 'Willkommen',
        phrase2: 'Geld spricht. Und jetzt, da Chat und Zahlungen an einem Ort sind, ist es auch einfach.',
        phrase3: 'Deine Zahlungen kommen so schnell zu dir, wie du deinen Standpunkt klarmachen kannst.',
        enterPassword: 'Bitte gib dein Passwort ein',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, es ist immer schön, ein neues Gesicht hier zu sehen!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) =>
            `Bitte gib den magischen Code ein, der an ${login} gesendet wurde. Er sollte innerhalb von ein bis zwei Minuten ankommen.`,
    },
    login: {
        hero: {
            header: 'Reisen und Ausgaben in Chatgeschwindigkeit',
            body: 'Willkommen bei der nächsten Generation von Expensify, in der Ihre Reisen und Ausgaben mit Hilfe eines kontextbezogenen Echtzeit-Chats schneller abgewickelt werden.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Mit Single Sign-On weiter anmelden:',
        orContinueWithMagicCode: 'Sie können sich auch mit einem magischen Code anmelden',
        useSingleSignOn: 'Einmalanmeldung verwenden',
        useMagicCode: 'Magischen Code verwenden',
        launching: 'Wird gestartet ...',
        oneMoment: 'Einen Moment, wir leiten Sie zum Single-Sign-On-Portal Ihres Unternehmens weiter.',
    },
    reportActionCompose: {
        dropToUpload: 'Zum Hochladen hierher ziehen',
        sendAttachment: 'Anhang senden',
        addAttachment: 'Anlage hinzufügen',
        writeSomething: 'Schreibe etwas ...',
        blockedFromConcierge: 'Kommunikation ist untersagt',
        fileUploadFailed: 'Upload fehlgeschlagen. Datei wird nicht unterstützt.',
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
        copyURLToClipboard: 'URL in Zwischenablage kopieren',
        copyEmailToClipboard: 'E-Mail in Zwischenablage kopieren',
        markAsUnread: 'Als ungelesen markieren',
        markAsRead: 'Als gelesen markieren',
        editAction: ({action}: EditActionParams) => `${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'Ausgabe' : 'Kommentar'} bearbeiten`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'Kommentar';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `${type} löschen`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'Kommentar';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Möchtest du diesen ${type} wirklich löschen?`;
        },
        onlyVisible: 'Nur sichtbar für',
        explain: 'Erklären',
        explainMessage: 'Bitte erklären Sie mir das.',
        replyInThread: 'Im Thread antworten',
        joinThread: 'Thread beitreten',
        leaveThread: 'Unterhaltung verlassen',
        copyOnyxData: 'Onyx-Daten kopieren',
        flagAsOffensive: 'Als anstößig melden',
        menu: 'Menü',
    },
    emojiReactions: {
        addReactionTooltip: 'Reaktion hinzufügen',
        reactedWith: 'reagiert mit',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `Du hast die Party in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> verpasst, hier gibt es nichts zu sehen.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `Dieser Chat ist mit allen Expensify-Mitgliedern in der Domain <strong>${domainRoom}</strong>. Nutze ihn, um mit Kolleg:innen zu chatten, Tipps zu teilen und Fragen zu stellen.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Dieser Chat ist mit dem/der <strong>${workspaceName}</strong>-Admin. Verwende ihn, um über die Einrichtung des Arbeitsbereichs und mehr zu chatten.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `Dieser Chat ist mit allen in <strong>${workspaceName}</strong>. Verwende ihn für die wichtigsten Ankündigungen.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Dieser Chatraum ist für alles, was mit <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> zu tun hat.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Dieser Chat ist für Rechnungen zwischen <strong>${invoicePayer}</strong> und <strong>${invoiceReceiver}</strong>. Verwende die +‑Taste, um eine Rechnung zu senden.`,
        beginningOfChatHistory: (users: string) => `Dieser Chat ist mit ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `Hier reichen <strong>${submitterDisplayName}</strong> Ausgaben bei <strong>${workspaceName}</strong> ein. Verwende einfach die +-Schaltfläche.`,
        beginningOfChatHistorySelfDM: 'Dies ist dein persönlicher Bereich. Verwende ihn für Notizen, Aufgaben, Entwürfe und Erinnerungen.',
        beginningOfChatHistorySystemDM: 'Willkommen! Lassen Sie uns Ihr Konto einrichten.',
        chatWithAccountManager: 'Hier mit Ihrer*Ihrem Account Manager*in chatten',
        askMeAnything: 'Frag mich alles!',
        sayHello: 'Sag Hallo!',
        yourSpace: 'Dein Bereich',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Willkommen in ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Verwende die +‑Taste, um eine Ausgabe zu ${additionalText}.`,
        askConcierge: 'Stelle Fragen und erhalte rund um die Uhr Support in Echtzeit.',
        conciergeSupport: 'Support rund um die Uhr',
        create: 'erstellen',
        iouTypes: {
            pay: 'bezahlen',
            split: 'aufteilen',
            submit: 'Senden',
            track: 'verfolgen',
            invoice: 'Rechnung',
        },
    },
    adminOnlyCanPost: 'Nur Admins können in diesem Raum Nachrichten senden.',
    reportAction: {
        asCopilot: 'als Copilot für',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `hat diesen Bericht erstellt, um alle Ausgaben aus <a href="${reportUrl}">${reportName}</a> aufzunehmen, die nicht mit der von dir gewählten Häufigkeit eingereicht werden konnten`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `hat diesen Bericht für alle zurückgehaltenen Ausgaben aus <a href="${reportUrl}">${reportName}</a> erstellt`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Alle in dieser Unterhaltung benachrichtigen',
    },
    newMessages: 'Neue Nachrichten',
    latestMessages: 'Neueste Nachrichten',
    youHaveBeenBanned: 'Hinweis: Du wurdest vom Chatten in diesem Kanal ausgeschlossen.',
    reportTypingIndicator: {
        isTyping: 'schreibt...',
        areTyping: 'tippen ...',
        multipleMembers: 'Mehrere Mitglieder',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Dieser Chatraum wurde archiviert.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Dieser Chat ist nicht mehr aktiv, weil ${displayName} ihr Konto geschlossen hat.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${oldDisplayName} sein Konto mit ${displayName} zusammengelegt hat.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Dieser Chat ist nicht mehr aktiv, weil <strong>du</strong> kein Mitglied des Workspaces ${policyName} mehr bist.`
                : `Dieser Chat ist nicht mehr aktiv, weil ${displayName} kein Mitglied des Workspaces ${policyName} mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${policyName} keine aktive Arbeitsumgebung mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${policyName} keine aktive Arbeitsumgebung mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Diese Buchung ist archiviert.',
    },
    writeCapabilityPage: {
        label: 'Wer darf posten',
        writeCapability: {
            all: 'Alle Mitglieder',
            admins: 'Nur Admins',
        },
    },
    sidebarScreen: {
        buttonFind: 'Etwas finden ...',
        buttonMySettings: 'Meine Einstellungen',
        fabNewChat: 'Chat starten',
        fabNewChatExplained: 'Aktionsmenü öffnen',
        fabScanReceiptExplained: 'Beleg scannen',
        chatPinned: 'Chat angeheftet',
        draftedMessage: 'Entwurf erstellt',
        listOfChatMessages: 'Liste der Chatnachrichten',
        listOfChats: 'Chatliste',
        saveTheWorld: 'Rette die Welt',
        tooltip: 'Leg hier los!',
        redirectToExpensifyClassicModal: {
            title: 'Demnächst verfügbar',
            description:
                'Wir feilen noch an ein paar Details von New Expensify, um es an deine spezifische Einrichtung anzupassen. In der Zwischenzeit kannst du Expensify Classic verwenden.',
        },
    },
    homePage: {
        forYou: 'Für dich',
        timeSensitiveSection: {
            title: 'Zeitkritisch',
            cta: 'Anspruch',
            offer50off: {
                title: 'Erhalten Sie 50 % Rabatt auf Ihr erstes Jahr!',
                subtitle: ({formattedTime}: {formattedTime: string}) => `${formattedTime} verbleibend`,
            },
            offer25off: {
                title: 'Erhalten Sie 25 % Rabatt auf Ihr erstes Jahr!',
                subtitle: ({days}: {days: number}) => `${days} ${days === 1 ? 'Tag' : 'Tage'} verbleibend`,
            },
            addShippingAddress: {
                title: 'Wir benötigen deine Versandadresse',
                subtitle: 'Gib eine Adresse an, um deine Expensify Card zu erhalten.',
                cta: 'Adresse hinzufügen',
            },
            activateCard: {
                title: 'Aktiviere deine Expensify Card',
                subtitle: 'Validieren Sie Ihre Karte und beginnen Sie mit dem Ausgeben.',
                cta: 'Aktivieren',
            },
        },
        announcements: 'Ankündigungen',
        discoverSection: {
            title: 'Entdecken',
            menuItemTitleNonAdmin: 'Erfahren Sie, wie Sie Ausgaben erstellen und Berichte einreichen.',
            menuItemTitleAdmin: 'Erfahre, wie du Mitglieder einlädst, Genehmigungs-Workflows bearbeitest und Firmenkarten abstimmst.',
            menuItemDescription: 'Sieh dir in 2 Minuten an, was Expensify kann',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `${count} ${count === 1 ? 'Bericht' : 'Berichte'} einreichen`,
            approve: ({count}: {count: number}) => `${count} ${count === 1 ? 'Bericht' : 'Berichte'} genehmigen`,
            pay: ({count}: {count: number}) => `Zahle ${count} ${count === 1 ? 'Bericht' : 'Berichte'}`,
            export: ({count}: {count: number}) => `${count} ${count === 1 ? 'Bericht' : 'Berichte'} exportieren`,
            begin: 'Begin',
            emptyStateMessages: {
                nicelyDone: 'Gut gemacht',
                keepAnEyeOut: 'Behalte im Blick, was als Nächstes kommt!',
                allCaughtUp: 'Du bist auf dem neuesten Stand',
                upcomingTodos: 'Anstehende To-dos werden hier angezeigt.',
            },
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
        manual: 'Anleitung',
        scan: 'Scannen',
        map: 'Karte',
        gps: 'GPS',
        odometer: 'Kilometerzähler',
    },
    spreadsheet: {
        upload: 'Tabelle hochladen',
        import: 'Tabellendokument importieren',
        dragAndDrop: '<muted-link>Ziehe deine Tabellenkalkulation hierher und lasse sie los oder wähle unten eine Datei aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Ziehen Sie Ihre Tabelle hierher und legen Sie sie ab, oder wählen Sie unten eine Datei aus. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Erfahren Sie mehr</a> über unterstützte Dateiformate.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Wähle eine Tabellenkalkulationsdatei zum Importieren aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Wähle eine Tabellenkalkulationsdatei zum Importieren aus. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Erfahre mehr</a> über unterstützte Dateiformate.</muted-link>`,
        fileContainsHeader: 'Datei enthält Spaltenüberschriften',
        column: (name: string) => `Spalte ${name}`,
        fieldNotMapped: (fieldName: string) => `Ups! Ein erforderliches Feld („${fieldName}“) wurde nicht zugeordnet. Bitte überprüfe es und versuche es erneut.`,
        singleFieldMultipleColumns: (fieldName: string) => `Ups! Du hast ein einzelnes Feld („${fieldName}“) mehreren Spalten zugeordnet. Bitte überprüfe dies und versuche es erneut.`,
        emptyMappedField: (fieldName: string) => `Ups! Das Feld („${fieldName}“) enthält einen oder mehrere leere Werte. Bitte überprüfe es und versuche es erneut.`,
        importSuccessfulTitle: 'Import erfolgreich',
        importCategoriesSuccessfulDescription: ({categories}: {categories: number}) => (categories > 1 ? `${categories} Kategorien wurden hinzugefügt.` : '1 Kategorie wurde hinzugefügt.'),
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
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
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `${tags} Tags wurden hinzugefügt.` : '1 Tag wurde hinzugefügt.'),
        importMultiLevelTagsSuccessfulDescription: 'Mehrstufige Tags wurden hinzugefügt.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `${rates} Tagespauschalen wurden hinzugefügt.` : '1 Pauschale wurde hinzugefügt.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `${transactions} Transaktionen wurden importiert.` : '1 Transaktion wurde importiert.',
        importFailedTitle: 'Import fehlgeschlagen',
        importFailedDescription: 'Bitte stelle sicher, dass alle Felder korrekt ausgefüllt sind, und versuche es erneut. Wenn das Problem weiterhin besteht, wende dich bitte an Concierge.',
        importDescription: 'Wähle aus, welche Felder aus deiner Tabelle zugeordnet werden sollen, indem du unten in der Dropdown-Liste neben jeder importierten Spalte klickst.',
        sizeNotMet: 'Die Dateigröße muss größer als 0 Byte sein',
        invalidFileMessage:
            'Die von Ihnen hochgeladene Datei ist entweder leer oder enthält ungültige Daten. Bitte stellen Sie sicher, dass die Datei korrekt formatiert ist und alle erforderlichen Informationen enthält, bevor Sie sie erneut hochladen.',
        importSpreadsheetLibraryError: 'Laden des Tabellenkalkulationsmoduls fehlgeschlagen. Bitte überprüfe deine Internetverbindung und versuche es erneut.',
        importSpreadsheet: 'Tabellendokument importieren',
        downloadCSV: 'CSV herunterladen',
        importMemberConfirmation: () => ({
            one: `Bitte bestätige die folgenden Details für ein neues Workspace-Mitglied, das im Rahmen dieses Uploads hinzugefügt wird. Bestehende Mitglieder erhalten keine Rollenaktualisierungen oder Einladungsnachrichten.`,
            other: (count: number) =>
                `Bitte bestätige die untenstehenden Details für die ${count} neuen Arbeitsbereichsmitglieder, die mit diesem Upload hinzugefügt werden. Bestehende Mitglieder erhalten keine Aktualisierung ihrer Rollen und keine Einladungnachrichten.`,
        }),
    },
    receipt: {
        upload: 'Beleg hochladen',
        uploadMultiple: 'Belege hochladen',
        desktopSubtitleSingle: `oder hierher ziehen und ablegen`,
        desktopSubtitleMultiple: `oder hierher ziehen und ablegen`,
        alternativeMethodsTitle: 'Andere Möglichkeiten, Belege hinzuzufügen:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">Lade die App herunter</a>, um vom Handy zu scannen</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Leite Belege weiter an <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Füge deine Nummer hinzu</a>, um Belege an ${phoneNumber} zu senden</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Sende Belege per SMS an ${phoneNumber} (nur US-Nummern)</label-text>`,
        takePhoto: 'Foto aufnehmen',
        cameraAccess: 'Für das Fotografieren von Belegen ist der Kamerazugriff erforderlich.',
        deniedCameraAccess: `Der Kamera­zugriff wurde noch nicht gewährt, bitte folge <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">diesen Anweisungen</a>.`,
        cameraErrorTitle: 'Kamerafehler',
        cameraErrorMessage: 'Beim Aufnehmen eines Fotos ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        locationAccessTitle: 'Zugriff auf Standort erlauben',
        locationAccessMessage: 'Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall dort, wo Sie sich aufhalten, korrekt zu halten.',
        locationErrorTitle: 'Zugriff auf Standort erlauben',
        locationErrorMessage: 'Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall dort, wo Sie sich aufhalten, korrekt zu halten.',
        allowLocationFromSetting: `Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall korrekt zu halten. Bitte erlauben Sie den Standortzugriff in den Berechtigungseinstellungen Ihres Geräts.`,
        dropTitle: 'Lass es los',
        dropMessage: 'Datei hier ablegen',
        flash: 'Blitz',
        multiScan: 'Mehrfach-Scan',
        shutter: 'Verschluss',
        gallery: 'Galerie',
        deleteReceipt: 'Beleg löschen',
        deleteConfirmation: 'Möchtest du diesen Beleg wirklich löschen?',
        addReceipt: 'Beleg hinzufügen',
        scanFailed: 'Der Beleg konnte nicht gescannt werden, da Händler, Datum oder Betrag fehlen.',
        addAReceipt: {
            phrase1: 'Beleg hinzufügen',
            phrase2: 'oder hierher ziehen und ablegen',
        },
    },
    quickAction: {
        scanReceipt: 'Beleg scannen',
        recordDistance: 'Entfernung erfassen',
        requestMoney: 'Ausgabe erstellen',
        perDiem: 'Tagespauschale erstellen',
        splitBill: 'Ausgabe aufteilen',
        splitScan: 'Beleg aufteilen',
        splitDistance: 'Strecke aufteilen',
        paySomeone: ({name}: PaySomeoneParams = {}) => `${name ?? 'jemand'} bezahlen`,
        assignTask: 'Aufgabe zuweisen',
        header: 'Schnellaktion',
        noLongerHaveReportAccess: 'Du hast keinen Zugriff mehr auf dein bisheriges Schnellzugriffs‑Ziel. Wähle unten ein neues aus.',
        updateDestination: 'Ziel aktualisieren',
        createReport: 'Bericht erstellen',
    },
    iou: {
        amount: 'Betrag',
        percent: 'Prozent',
        date: 'Datum',
        taxAmount: 'Steuerbetrag',
        taxRate: 'Steuersatz',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `${formattedAmount} genehmigen` : 'Genehmigen'),
        approved: 'Genehmigt',
        cash: 'Bargeld',
        card: 'Karte',
        original: 'Original',
        split: 'Aufteilen',
        splitExpense: 'Ausgabe aufteilen',
        splitDates: 'Datumsbereiche aufteilen',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} bis ${endDate} (${count} Tage)`,
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} von ${merchant}`,
        splitByPercentage: 'Nach Prozentsatz aufteilen',
        splitByDate: 'Nach Datum aufteilen',
        addSplit: 'Teilung hinzufügen',
        makeSplitsEven: 'Aufteilungen ausgleichen',
        editSplits: 'Aufteilungen bearbeiten',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist um ${amount} höher als die ursprüngliche Ausgabe.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist um ${amount} geringer als die ursprüngliche Ausgabe.`,
        splitExpenseZeroAmount: 'Bitte gib einen gültigen Betrag ein, bevor du fortfährst.',
        splitExpenseOneMoreSplit: 'Keine Aufteilungen hinzugefügt. Füge mindestens eine hinzu, um zu speichern.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `${amount} für ${merchant} bearbeiten`,
        removeSplit: 'Split entfernen',
        splitExpenseCannotBeEditedModalTitle: 'Diese Ausgabe kann nicht bearbeitet werden',
        splitExpenseCannotBeEditedModalDescription: 'Genehmigte oder bezahlte Ausgaben können nicht bearbeitet werden',
        splitExpenseDistanceErrorModalDescription: 'Bitte behebe den Fehler beim Entfernungssatz und versuche es erneut.',
        paySomeone: ({name}: PaySomeoneParams = {}) => `${name ?? 'jemand'} bezahlen`,
        expense: 'Ausgabe',
        categorize: 'Kategorisieren',
        share: 'Teilen',
        participants: 'Teilnehmende',
        createExpense: 'Ausgabe erstellen',
        trackDistance: 'Entfernung erfassen',
        createExpenses: (expensesNumber: number) => `${expensesNumber} Ausgaben erstellen`,
        removeExpense: 'Ausgabe entfernen',
        removeThisExpense: 'Diese Ausgabe entfernen',
        removeExpenseConfirmation: 'Sind Sie sicher, dass Sie diese Quittung entfernen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
        addExpense: 'Ausgabe hinzufügen',
        chooseRecipient: 'Empfänger wählen',
        createExpenseWithAmount: ({amount}: {amount: string}) => `${amount}-Ausgabe erstellen`,
        confirmDetails: 'Details bestätigen',
        pay: 'Bezahlen',
        cancelPayment: 'Zahlung stornieren',
        cancelPaymentConfirmation: 'Sind Sie sicher, dass Sie diese Zahlung stornieren möchten?',
        viewDetails: 'Details anzeigen',
        pending: 'Ausstehend',
        canceled: 'Storniert',
        posted: 'Gebucht',
        deleteReceipt: 'Beleg löschen',
        findExpense: 'Ausgabe suchen',
        deletedTransaction: (amount: string, merchant: string) => `hat eine Ausgabe gelöscht (${amount} bei ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `hat eine Ausgabe verschoben${reportName ? `von ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `hat diese Ausgabe verschoben${reportName ? `an <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `hat diese Ausgabe verschoben${reportName ? `von <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `hat diese Ausgabe in deinen <a href="${reportUrl}">persönlichen Bereich</a> verschoben`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `hat diesen Bericht in den Workspace <a href="${newParentReportUrl}">${toPolicyName}</a> verschoben`;
            }
            return `hat diesen <a href="${movedReportUrl}">Beleg</a> in den Workspace <a href="${newParentReportUrl}">${toPolicyName}</a> verschoben`;
        },
        pendingMatchWithCreditCard: 'Beleg wartet auf Zuordnung zu Kartenumsatz',
        pendingMatch: 'Ausstehende Zuordnung',
        pendingMatchWithCreditCardDescription: 'Beleg wartet auf Abgleich mit Kartentransaktion. Als Barzahlung markieren, um abzubrechen.',
        markAsCash: 'Als Barzahlung markieren',
        routePending: 'Weiterleitung ausstehend...',
        receiptScanning: () => ({
            one: 'Belegerfassung läuft...',
            other: 'Belege werden gescannt …',
        }),
        scanMultipleReceipts: 'Mehrere Belege scannen',
        scanMultipleReceiptsDescription: 'Fotografiere alle deine Belege auf einmal und bestätige dann die Details selbst – oder wir übernehmen das für dich.',
        receiptScanInProgress: 'Belegscan läuft',
        receiptScanInProgressDescription: 'Belegerfassung läuft. Später erneut prüfen oder Details jetzt eingeben.',
        removeFromReport: 'Aus Bericht entfernen',
        moveToPersonalSpace: 'Verschiebe Ausgaben in deinen persönlichen Bereich',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Mögliche doppelte Ausgaben erkannt. Prüfe die Duplikate, um die Einreichung zu ermöglichen.'
                : 'Mögliche doppelte Spesen erkannt. Überprüfe die Duplikate, um die Genehmigung zu ermöglichen.',
        receiptIssuesFound: () => ({
            one: 'Problem gefunden',
            other: 'Gefundene Probleme',
        }),
        fieldPending: 'Ausstehend ...',
        defaultRate: 'Standardrate',
        receiptMissingDetails: 'Belegdaten fehlen',
        missingAmount: 'Fehlender Betrag',
        missingMerchant: 'Fehlender Händler',
        receiptStatusTitle: 'Wird gescannt …',
        receiptStatusText: 'Nur du kannst diese Quittung sehen, während sie gescannt wird. Schau später noch einmal vorbei oder gib die Details jetzt ein.',
        receiptScanningFailed: 'Belegerfassung fehlgeschlagen. Bitte gib die Details manuell ein.',
        transactionPendingDescription: 'Transaktion ausstehend. Die Verbuchung kann einige Tage dauern.',
        companyInfo: 'Firmeninfos',
        companyInfoDescription: 'Wir benötigen noch ein paar weitere Angaben, bevor du deine erste Rechnung senden kannst.',
        yourCompanyName: 'Ihr Firmenname',
        yourCompanyWebsite: 'Website deines Unternehmens',
        yourCompanyWebsiteNote: 'Wenn Sie keine Website haben, können Sie stattdessen das LinkedIn- oder Social-Media-Profil Ihres Unternehmens angeben.',
        invalidDomainError: 'Sie haben eine ungültige Domain eingegeben. Um fortzufahren, geben Sie bitte eine gültige Domain ein.',
        publicDomainError: 'Sie haben eine öffentliche Domain eingegeben. Um fortzufahren, geben Sie bitte eine private Domain ein.',
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
            other: 'Möchten Sie diese Ausgaben wirklich löschen?',
        }),
        deleteReport: 'Bericht löschen',
        deleteReportConfirmation: 'Sind Sie sicher, dass Sie diesen Bericht löschen möchten?',
        settledExpensify: 'Bezahlt',
        done: 'Fertig',
        settledElsewhere: 'Anderswo bezahlt',
        individual: 'Einzelperson',
        business: 'Geschäft',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} mit Expensify bezahlen` : `Mit Expensify bezahlen`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als Privatperson zahlen` : `Mit privatem Konto bezahlen`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} mit Wallet bezahlen` : `Mit Wallet bezahlen`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `${formattedAmount} bezahlen`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als Unternehmen bezahlen` : `Mit Geschäftskonto zahlen`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als bezahlt markieren` : `Als bezahlt markieren`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `${amount} mit privatem Konto ${last4Digits} bezahlt` : `Mit privatem Konto bezahlt`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `${amount} mit Geschäftskonto ${last4Digits} bezahlt` : `Mit Geschäftskonto bezahlt`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `${formattedAmount} über ${policyName} bezahlen` : `Bezahlen über ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `hat ${amount} mit Bankkonto ${last4Digits} bezahlt` : `bezahlt mit Bankkonto ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `${amount ? `${amount} ` : ''} mit Bankkonto ${last4Digits} über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a> bezahlt`,
        invoicePersonalBank: (lastFour: string) => `Persönliches Konto • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Geschäftskonto • ${lastFour}`,
        nextStep: 'Nächste Schritte',
        finished: 'Abgeschlossen',
        flip: 'Drehen',
        sendInvoice: ({amount}: RequestAmountParams) => `${amount}-Rechnung senden`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `für ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `eingereicht${memo ? `, mit dem Vermerk ${memo}` : ''}`,
        automaticallySubmitted: `eingereicht über <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">verzögerte Einreichungen</a>`,
        queuedToSubmitViaDEW: 'zum Einreichen über benutzerdefinierten Genehmigungsworkflow in Warteschlange',
        queuedToApproveViaDEW: 'zur Genehmigung über benutzerdefinierten Genehmigungs-Workflow eingereiht',
        trackedAmount: (formattedAmount: string, comment?: string) => `Nachverfolgung von ${formattedAmount}${comment ? `für ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `${amount} aufteilen`,
        didSplitAmount: (formattedAmount: string, comment: string) => `aufteilen ${formattedAmount}${comment ? `für ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Ihr Anteil ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} schuldet ${amount}${comment ? `für ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} schuldet:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''} hat ${amount} bezahlt`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} hat bezahlt:`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} hat ${amount} ausgegeben`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} hat ausgegeben:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} hat genehmigt:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} hat ${amount} genehmigt`,
        payerSettled: (amount: number | string) => `${amount} bezahlt`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `${amount} bezahlt. Füge ein Bankkonto hinzu, um deine Zahlung zu erhalten.`,
        automaticallyApproved: `genehmigt über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a>`,
        approvedAmount: (amount: number | string) => `genehmigt: ${amount}`,
        approvedMessage: `genehmigt`,
        unapproved: `nicht genehmigt`,
        automaticallyForwarded: `genehmigt über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a>`,
        forwarded: `genehmigt`,
        rejectedThisReport: 'hat diesen Bericht abgelehnt',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `hat die Zahlung gestartet, wartet aber darauf, dass ${submitterDisplayName} ein Bankkonto hinzufügt.`,
        adminCanceledRequest: 'hat die Zahlung storniert',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `hat die Zahlung über ${amount} storniert, weil ${submitterDisplayName} ihre*n Expensify Wallet nicht innerhalb von 30 Tagen aktiviert hat`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} hat ein Bankkonto hinzugefügt. Die Zahlung über ${amount} wurde durchgeführt.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}als bezahlt markiert${comment ? `und sagte: „${comment}“` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}mit Wallet bezahlt`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''} mit Expensify über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a> bezahlt`,
        noReimbursableExpenses: 'Dieser Bericht enthält einen ungültigen Betrag',
        pendingConversionMessage: 'Die Gesamtsumme wird aktualisiert, sobald du wieder online bist',
        changedTheExpense: 'hat die Ausgabe geändert',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `den Wert ${valueName} in ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `setzte ${translatedChangedField} auf ${newMerchant}, wodurch der Betrag auf ${newAmountToDisplay} gesetzt wurde`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `die/der/das ${valueName} (zuvor ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `das ${valueName} auf ${newValueToDisplay} (zuvor ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `hat ${translatedChangedField} in ${newMerchant} geändert (zuvor ${oldMerchant}), wodurch der Betrag auf ${newAmountToDisplay} aktualisiert wurde (zuvor ${oldAmountToDisplay})`,
        basedOnAI: 'basierend auf bisherigen Aktivitäten',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `basierend auf den <a href="${rulesLink}">Arbeitsbereichsregeln</a>` : 'basierend auf dem Arbeitsbereichsregel'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `für ${comment}` : 'Ausgabe'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Rechnung – Bericht Nr. ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} gesendet${comment ? `für ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `Ausgabe von persönlichem Bereich nach ${workspaceName ?? `Chat mit ${reportName}`} verschoben`,
        movedToPersonalSpace: 'Ausgabe in persönlichen Bereich verschoben',
        error: {
            invalidCategoryLength: 'Der Kategoriename überschreitet 255 Zeichen. Bitte kürzen Sie ihn oder wählen Sie eine andere Kategorie.',
            invalidTagLength: 'Der Tag-Name überschreitet 255 Zeichen. Bitte kürze ihn oder wähle einen anderen Tag.',
            invalidAmount: 'Bitte gib einen gültigen Betrag ein, bevor du fortfährst',
            invalidDistance: 'Bitte gib eine gültige Entfernung ein, bevor du fortfährst',
            invalidReadings: 'Bitte geben Sie sowohl Anfangs- als auch Endstand ein',
            negativeDistanceNotAllowed: 'Endstand muss größer als Anfangsstand sein',
            invalidIntegerAmount: 'Bitte gib vor dem Fortfahren einen ganzen Dollarbetrag ein',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Der maximale Steuerbetrag ist ${amount}`,
            invalidSplit: 'Die Summe der Aufteilungen muss dem Gesamtbetrag entsprechen',
            invalidSplitParticipants: 'Bitte gib für mindestens zwei Teilnehmende einen Betrag größer als null ein',
            invalidSplitYourself: 'Bitte gib für deine Aufteilung einen von Null verschiedenen Betrag ein',
            noParticipantSelected: 'Bitte wählen Sie eine teilnehmende Person aus',
            other: 'Unerwarteter Fehler. Bitte versuchen Sie es später noch einmal.',
            genericCreateFailureMessage: 'Unerwarteter Fehler beim Einreichen dieser Ausgabe. Bitte versuche es später noch einmal.',
            genericCreateInvoiceFailureMessage: 'Unerwarteter Fehler beim Senden dieser Rechnung. Bitte versuche es später noch einmal.',
            genericHoldExpenseFailureMessage: 'Unerwarteter Fehler beim Zurückhalten dieser Ausgabe. Bitte versuche es später erneut.',
            genericUnholdExpenseFailureMessage: 'Unerwarteter Fehler beim Entfernen dieser Ausgabe von der Warteschleife. Bitte versuche es später erneut.',
            receiptDeleteFailureError: 'Unerwarteter Fehler beim Löschen dieses Belegs. Bitte versuche es später noch einmal.',
            receiptFailureMessage:
                '<rbr>Beim Hochladen Ihrer Quittung ist ein Fehler aufgetreten. Bitte <a href="download">speichern Sie die Quittung</a> und <a href="retry">versuchen Sie es</a> später erneut.</rbr>',
            receiptFailureMessageShort: 'Beim Hochladen deiner Quittung ist ein Fehler aufgetreten.',
            genericDeleteFailureMessage: 'Unerwarteter Fehler beim Löschen dieser Ausgabe. Bitte versuche es später noch einmal.',
            genericEditFailureMessage: 'Unerwarteter Fehler beim Bearbeiten dieser Ausgabe. Bitte versuche es später noch einmal.',
            genericSmartscanFailureMessage: 'Der Transaktion fehlen Felder',
            duplicateWaypointsErrorMessage: 'Bitte doppelte Wegpunkte entfernen',
            atLeastTwoDifferentWaypoints: 'Bitte gib mindestens zwei unterschiedliche Adressen ein',
            splitExpenseMultipleParticipantsErrorMessage: 'Eine Ausgabe kann nicht zwischen einem Workspace und anderen Mitgliedern aufgeteilt werden. Bitte aktualisiere deine Auswahl.',
            invalidMerchant: 'Bitte gib einen gültigen Händler ein',
            atLeastOneAttendee: 'Mindestens eine teilnehmende Person muss ausgewählt werden',
            invalidQuantity: 'Bitte gib eine gültige Menge ein',
            quantityGreaterThanZero: 'Die Menge muss größer als null sein',
            invalidSubrateLength: 'Es muss mindestens einen Untertarif geben',
            invalidRate: 'Satz für diesen Workspace nicht gültig. Bitte wähle einen verfügbaren Satz aus dem Workspace aus.',
            endDateBeforeStartDate: 'Das Enddatum darf nicht vor dem Startdatum liegen',
            endDateSameAsStartDate: 'Das Enddatum darf nicht mit dem Startdatum identisch sein',
            manySplitsProvided: `Die maximale Anzahl zulässiger Aufteilungen ist ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `Der Datumsbereich darf ${CONST.IOU.SPLITS_LIMIT} Tage nicht überschreiten.`,
        },
        dismissReceiptError: 'Fehler ausblenden',
        dismissReceiptErrorConfirmation: 'Achtung! Wenn du diesen Fehler ausblendest, wird dein hochgeladener Beleg vollständig entfernt. Bist du sicher?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `hat mit dem Ausgleich begonnen. Die Zahlung ist pausiert, bis ${submitterDisplayName} das Wallet aktiviert.`,
        enableWallet: 'Wallet aktivieren',
        hold: 'Halten',
        unhold: 'Sperre aufheben',
        holdExpense: () => ({
            one: 'Ausgabe zurückhalten',
            other: 'Spesen zurückhalten',
        }),
        unholdExpense: 'Ausgabe freigeben',
        heldExpense: 'hat diese Ausgabe zurückgehalten',
        unheldExpense: 'Blockierung dieser Ausgabe aufgehoben',
        moveUnreportedExpense: 'Nicht gemeldete Ausgabe verschieben',
        addUnreportedExpense: 'Nicht gemeldete Ausgabe hinzufügen',
        selectUnreportedExpense: 'Wähle mindestens eine Ausgabe aus, die dem Bericht hinzugefügt werden soll.',
        emptyStateUnreportedExpenseTitle: 'Keine nicht gemeldeten Ausgaben',
        emptyStateUnreportedExpenseSubtitle: 'Anscheinend hast du keine nicht abgerechneten Ausgaben. Erstelle unten eine.',
        addUnreportedExpenseConfirm: 'Zu Bericht hinzufügen',
        newReport: 'Neuer Bericht',
        explainHold: () => ({
            one: 'Erklären Sie, warum Sie diese Ausgabe zurückhalten.',
            other: 'Erklären Sie, warum Sie diese Ausgaben zurückhalten.',
        }),
        retracted: 'zurückgezogen',
        retract: 'Zurückziehen',
        reopened: 'wiedereröffnet',
        reopenReport: 'Bericht wieder öffnen',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Dieser Bericht wurde bereits nach ${connectionName} exportiert. Änderungen können zu Datenabweichungen führen. Sind Sie sicher, dass Sie diesen Bericht wieder öffnen möchten?`,
        reason: 'Grund',
        holdReasonRequired: 'Beim Anhalten ist eine Begründung erforderlich.',
        expenseWasPutOnHold: 'Ausgabe wurde zurückgestellt',
        expenseOnHold: 'Diese Ausgabe wurde zurückgestellt. Bitte lies die Kommentare, um die nächsten Schritte zu sehen.',
        expensesOnHold: 'Alle Ausgaben wurden angehalten. Bitte überprüfe die Kommentare für die nächsten Schritte.',
        expenseDuplicate: 'Diese Ausgabe enthält ähnliche Details wie eine andere. Bitte überprüfe die Duplikate, um fortzufahren.',
        someDuplicatesArePaid: 'Einige dieser Duplikate wurden bereits genehmigt oder bezahlt.',
        reviewDuplicates: 'Duplikate überprüfen',
        keepAll: 'Alle behalten',
        confirmApprove: 'Genehmigungsbetrag bestätigen',
        confirmApprovalAmount: 'Nur konforme Ausgaben genehmigen oder den gesamten Bericht genehmigen.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist angehalten. Möchtest du sie trotzdem genehmigen?',
            other: 'Diese Ausgaben sind zurückgestellt. Möchtest du sie trotzdem genehmigen?',
        }),
        confirmPay: 'Zahlungsbetrag bestätigen',
        confirmPayAmount: 'Zahlen Sie, was nicht zurückgestellt ist, oder zahlen Sie den gesamten Bericht.',
        confirmPayAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist zurückgestellt. Möchtest du sie trotzdem bezahlen?',
            other: 'Diese Ausgaben sind zurückgestellt. Möchtest du sie trotzdem bezahlen?',
        }),
        payOnly: 'Nur zahlen',
        approveOnly: 'Nur genehmigen',
        holdEducationalTitle: 'Solltest du diese Ausgabe zurückhalten?',
        whatIsHoldExplain: 'Hold ist wie das Drücken der „Pause“-Taste für eine Ausgabe, bis du bereit bist, sie einzureichen.',
        holdIsLeftBehind: 'Zurückgehaltene Ausgaben werden nicht eingereicht, selbst wenn du einen gesamten Bericht einreichst.',
        unholdWhenReady: 'Spesen freigeben, sobald du sie einreichen möchtest.',
        changePolicyEducational: {
            title: 'Du hast diesen Bericht verschoben!',
            description: 'Überprüfe diese Punkte sorgfältig, da sie sich beim Verschieben von Berichten in einen neuen Workspace häufig ändern.',
            reCategorize: '<strong>Kategorisiere alle Ausgaben neu</strong>, um die Arbeitsbereichsregeln einzuhalten.',
            workflows: 'Dieser Bericht kann nun einem anderen <strong>Genehmigungs-Workflow</strong> unterliegen.',
        },
        changeWorkspace: 'Arbeitsbereich wechseln',
        set: 'festlegen',
        changed: 'geändert',
        removed: 'entfernt',
        transactionPending: 'Transaktion ausstehend.',
        chooseARate: 'Wähle einen Erstattungssatz pro Meile oder Kilometer für den Workspace aus',
        unapprove: 'Freigabe aufheben',
        unapproveReport: 'Abrechnung freigabe aufheben',
        headsUp: 'Achtung!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Dieser Bericht wurde bereits nach ${accountingIntegration} exportiert. Änderungen können zu Datenabweichungen führen. Sind Sie sicher, dass Sie die Genehmigung für diesen Bericht aufheben möchten?`,
        reimbursable: 'erstattungsfähig',
        nonReimbursable: 'nicht erstattungsfähig',
        bookingPending: 'Diese Buchung ist ausstehend',
        bookingPendingDescription: 'Diese Buchung ist ausstehend, weil sie noch nicht bezahlt wurde.',
        bookingArchived: 'Diese Buchung ist archiviert',
        bookingArchivedDescription: 'Diese Buchung ist archiviert, weil das Reisedatum verstrichen ist. Füge bei Bedarf eine Ausgabe über den Endbetrag hinzu.',
        attendees: 'Teilnehmende',
        whoIsYourAccountant: 'Wer ist Ihre Steuerberaterin/Ihr Steuerberater?',
        paymentComplete: 'Zahlung abgeschlossen',
        time: 'Zeit',
        startDate: 'Startdatum',
        endDate: 'Enddatum',
        startTime: 'Startzeit',
        endTime: 'Endzeit',
        deleteSubrate: 'Unterrate löschen',
        deleteSubrateConfirmation: 'Möchtest du diese Unterrate wirklich löschen?',
        quantity: 'Menge',
        subrateSelection: 'Wähle einen Untersatz aus und gib eine Menge ein.',
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
        rates: 'Sätze',
        submitsTo: ({name}: SubmitsToParams) => `Sendet an ${name}`,
        reject: {
            educationalTitle: 'Solltest du halten oder ablehnen?',
            educationalText: 'Wenn du eine Ausgabe noch nicht genehmigen oder bezahlen möchtest, kannst du sie zurückstellen oder ablehnen.',
            holdExpenseTitle: 'Eine Ausgabe zurückhalten, um vor der Genehmigung oder Zahlung nach weiteren Details zu fragen.',
            approveExpenseTitle: 'Genehmige andere Ausgaben, während zurückgestellte Ausgaben weiterhin dir zugewiesen bleiben.',
            heldExpenseLeftBehindTitle: 'Zurückgehaltene Ausgaben bleiben zurück, wenn du einen gesamten Bericht genehmigst.',
            rejectExpenseTitle: 'Lehne eine Ausgabe ab, die du nicht genehmigen oder bezahlen möchtest.',
            reasonPageTitle: 'Ausgabe ablehnen',
            reasonPageDescription: 'Erklären Sie, warum Sie diese Ausgabe ablehnen.',
            rejectReason: 'Ablehnungsgrund',
            markAsResolved: 'Als gelöst markieren',
            rejectedStatus: 'Diese Ausgabe wurde abgelehnt. Wir warten darauf, dass du die Probleme behebst und sie als gelöst markierst, damit sie eingereicht werden kann.',
            reportActions: {
                rejectedExpense: 'hat diese Ausgabe abgelehnt',
                markedAsResolved: 'hat den Ablehnungsgrund als gelöst markiert',
            },
        },
        moveExpenses: () => ({one: 'Ausgabe verschieben', other: 'Ausgaben verschieben'}),
        moveExpensesError: 'Sie können Pauschalen nicht in Berichte anderer Arbeitsbereiche verschieben, da die Pauschalsätze zwischen den Arbeitsbereichen unterschiedlich sein können.',
        changeApprover: {
            title: 'Genehmiger ändern',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Wähle eine Option, um die genehmigende Person für diesen Bericht zu ändern. (Aktualisiere deine <a href="${workflowSettingLink}">Workspace-Einstellungen</a>, um dies dauerhaft für alle Berichte zu ändern.)`,
            changedApproverMessage: (managerID: number) => `hat die genehmigende Person in <mention-user accountID="${managerID}"/> geändert`,
            actions: {
                addApprover: 'Genehmigenden hinzufügen',
                addApproverSubtitle: 'Füge einen weiteren Genehmigenden zum bestehenden Workflow hinzu.',
                bypassApprovers: 'Genehmigende überspringen',
                bypassApproversSubtitle: 'Sich selbst als letzte:n Genehmiger:in zuweisen und alle verbleibenden Genehmiger:innen überspringen.',
            },
            addApprover: {
                subtitle: 'Wähle eine zusätzliche genehmigende Person für diesen Bericht, bevor wir ihn durch den restlichen Genehmigungsworkflow leiten.',
            },
        },
        chooseWorkspace: 'Wähle einen Workspace',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `Abrechnung wurde aufgrund des benutzerdefinierten Genehmigungs-Workflows an ${to} weitergeleitet`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'Stunde' : 'Stunden'} @ ${rate} / Stunde`,
            hrs: 'Std.',
            hours: 'Stunden',
            ratePreview: (rate: string) => `${rate} / Stunde`,
            amountTooLargeError: 'Der Gesamtbetrag ist zu hoch. Verringere die Stunden oder senke den Satz.',
        },
        correctDistanceRateError: 'Behebe den Fehler beim Entfernungs­tarif und versuche es erneut.',
        AskToExplain: `. <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}"><strong>Erklären</strong></a> &#x2728;`,
        policyRulesModifiedFields: (policyRulesModifiedFields: PolicyRulesModifiedFields, policyRulesRoute: string, formatList: (list: string[]) => string) => {
            const entries = ObjectUtils.typedEntries(policyRulesModifiedFields);
            const fragments = entries.map(([key, value], i) => {
                const isFirst = i === 0;
                if (key === 'reimbursable') {
                    return value ? 'hat die Ausgabe als „erstattungsfähig“ markiert' : 'hat die Ausgabe als „nicht erstattungsfähig“ markiert';
                }
                if (key === 'billable') {
                    return value ? 'hat die Ausgabe als „verrechenbar“ markiert' : 'hat die Ausgabe als „nicht abrechenbar“ markiert';
                }
                if (key === 'tax') {
                    const taxEntry = value as PolicyRulesModifiedFields['tax'];
                    const taxRateName = taxEntry?.field_id_TAX.name ?? '';
                    if (isFirst) {
                        return `Steuersatz auf „${taxRateName}“ festlegen`;
                    }
                    return `Steuersatz auf „${taxRateName}“`;
                }
                const updatedValue = value as string | boolean;
                if (isFirst) {
                    return `Setze ${translations.common[key].toLowerCase()} auf „${updatedValue}“`;
                }
                return `${translations.common[key].toLowerCase()} zu „${updatedValue}“`;
            });
            return `${formatList(fragments)} über <a href="${policyRulesRoute}">Workspace-Regeln</a>`;
        },
    },
    transactionMerge: {
        listPage: {
            header: 'Ausgaben zusammenführen',
            noEligibleExpenseFound: 'Keine berechtigten Ausgaben gefunden',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Sie haben keine Ausgaben, die mit dieser zusammengeführt werden können. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Erfahren Sie mehr</a> über berechtigte Ausgaben.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Wähle eine <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">berechtigte Ausgabe</a> aus, um sie mit <strong>${reportName}</strong> zusammenzuführen.`,
        },
        receiptPage: {
            header: 'Beleg auswählen',
            pageTitle: 'Wähle den Beleg aus, den du behalten möchtest:',
        },
        detailsPage: {
            header: 'Details auswählen',
            pageTitle: 'Wählen Sie die Details aus, die Sie behalten möchten:',
            noDifferences: 'Keine Unterschiede zwischen den Transaktionen gefunden',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? 'an' : 'a';
                return `Bitte wähle ${article} ${field} aus`;
            },
            pleaseSelectAttendees: 'Bitte Teilnehmende auswählen',
            selectAllDetailsError: 'Wähle alle Details aus, bevor du fortfährst.',
        },
        confirmationPage: {
            header: 'Details bestätigen',
            pageTitle: 'Bestätige die Angaben, die du behältst. Die Angaben, die du nicht behältst, werden gelöscht.',
            confirmButton: 'Ausgaben zusammenführen',
        },
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
            mute: 'Stummschalten',
            hidden: 'Ausgeblendet',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Die Nummer wurde noch nicht verifiziert. Klicke auf die Schaltfläche, um den Bestätigungslink erneut per SMS zu senden.',
        emailHasNotBeenValidated: 'Die E-Mail wurde nicht verifiziert. Klicke auf die Schaltfläche, um den Bestätigungslink per SMS erneut zu senden.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Foto hochladen',
        removePhoto: 'Foto entfernen',
        editImage: 'Foto bearbeiten',
        viewPhoto: 'Foto anzeigen',
        imageUploadFailed: 'Bildupload fehlgeschlagen',
        deleteWorkspaceError: 'Entschuldigung, beim Löschen deines Workspace-Avatars ist ein unerwartetes Problem aufgetreten',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Das ausgewählte Bild überschreitet die maximale Uploadgröße von ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Bitte laden Sie ein Bild hoch, das größer als ${minHeightInPx}x${minWidthInPx} Pixel und kleiner als ${maxHeightInPx}x${maxWidthInPx} Pixel ist.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `Das Profilbild muss einer der folgenden Typen sein: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: 'Profilbild bearbeiten',
        upload: 'Hochladen',
        uploadPhoto: 'Foto hochladen',
        selectAvatar: 'Avatar auswählen',
        choosePresetAvatar: 'Oder wählen Sie einen benutzerdefinierten Avatar',
    },
    modal: {
        backdropLabel: 'Modale Hintergrundfläche',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>du</strong> Ausgaben hinzufügst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf <strong>${actor}</strong>, um Ausgaben hinzuzufügen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warte darauf, dass ein Admin Ausgaben hinzufügt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> Ausgaben einreichst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf <strong>${actor}</strong>, um Ausgaben einzureichen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass eine Adminperson Spesen einreicht.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Kein weiterer Schritt erforderlich!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>du</strong> ein Bankkonto hinzufügst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> ein Bankkonto hinzufügt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf eine*n Admin, der ein Bankkonto hinzufügt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `am ${eta}` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>deine</strong> Ausgaben automatisch eingereicht werden${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass die Spesen von <strong>${actor}</strong> automatisch eingereicht werden${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass die Ausgaben eines Admins automatisch eingereicht werden${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>du</strong> die Probleme behebst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf <strong>${actor}</strong>, um die Probleme zu beheben.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf eine Adminperson, um die Probleme zu beheben.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wartet auf <strong>dich</strong>, um Ausgaben zu genehmigen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf die Genehmigung der Ausgaben durch <strong>${actor}</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf die Genehmigung der Ausgaben durch eine Adminperson.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> diesen Bericht exportierst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warte darauf, dass <strong>${actor}</strong> diesen Bericht exportiert.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf eine*n Admin, um diesen Bericht zu exportieren.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> Spesen bezahlst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf Zahlung der Ausgaben durch <strong>${actor}</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass ein Admin Spesen bezahlt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>du</strong> die Einrichtung eines Geschäftskontos abschließt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> die Einrichtung eines Geschäftskontos abschließt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf eine:n Admin, um die Einrichtung eines Geschäftskontos abzuschließen.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `bis ${eta}` : ` ${eta}`;
                }
                return `Warten, bis die Zahlung abgeschlossen ist${formattedETA}.`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `Ups! Sie scheinen diesen Bericht bei <strong>sich selbst</strong> einzureichen. Das Genehmigen eigener Berichte ist in Ihrem Arbeitsbereich <strong>verboten</strong>. Bitte reichen Sie diesen Bericht bei jemand anderem ein oder wenden Sie sich an Ihre Admin-Person, um die Person zu ändern, an die Sie Berichte einreichen.`,
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'in Kürze',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'später heute',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'am Sonntag',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: 'am 1. und 16. jedes Monats',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'am letzten Werktag des Monats',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: 'am letzten Tag des Monats',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: 'am Ende deiner Reise',
        },
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Bevorzugte Pronomen',
        selectYourPronouns: 'Wähle deine Pronomen aus',
        selfSelectYourPronoun: 'Wähle dein Pronomen selbst aus',
        emailAddress: 'E-Mail-Adresse',
        setMyTimezoneAutomatically: 'Meine Zeitzone automatisch einstellen',
        timezone: 'Zeitzone',
        invalidFileMessage: 'Ungültige Datei. Bitte versuche es mit einem anderen Bild.',
        avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchronisieren',
        profileAvatar: 'Profilavatar',
        publicSection: {
            title: 'Öffentlich',
            subtitle: 'Diese Angaben werden in deinem öffentlichen Profil angezeigt. Alle können sie sehen.',
        },
        privateSection: {
            title: 'Privat',
            subtitle: 'Diese Angaben werden für Reisen und Zahlungen verwendet. Sie werden niemals in deinem öffentlichen Profil angezeigt.',
        },
    },
    securityPage: {
        title: 'Sicherheitsoptionen',
        subtitle: 'Aktiviere die Zwei-Faktor-Authentifizierung, um dein Konto zu schützen.',
        goToSecurity: 'Zur Sicherheitsseite zurückkehren',
    },
    shareCodePage: {
        title: 'Ihr Code',
        subtitle: 'Lade Mitglieder zu Expensify ein, indem du deinen persönlichen QR-Code oder Empfehlungslink teilst.',
    },
    pronounsPage: {
        pronouns: 'Pronomen',
        isShownOnProfile: 'Deine Pronomen werden in deinem Profil angezeigt.',
        placeholderText: 'Suche, um Optionen zu sehen',
    },
    contacts: {
        contactMethods: 'Kontaktmethoden',
        featureRequiresValidate: 'Für diese Funktion musst du dein Konto verifizieren.',
        validateAccount: 'Bestätige dein Konto',
        helpText: ({email}: {email: string}) =>
            `Füge weitere Möglichkeiten hinzu, dich anzumelden und Belege an Expensify zu senden.<br/><br/>Füge eine E-Mail-Adresse hinzu, um Belege an <a href="mailto:${email}">${email}</a> weiterzuleiten, oder füge eine Telefonnummer hinzu, um Belege per SMS an 47777 zu senden (nur für US-Nummern).`,
        pleaseVerify: 'Bitte bestätige diese Kontaktmethode.',
        getInTouch: 'Wir verwenden diese Methode, um Sie zu kontaktieren.',
        enterMagicCode: (contactMethod: string) => `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde. Er sollte in ein bis zwei Minuten ankommen.`,
        setAsDefault: 'Als Standard festlegen',
        yourDefaultContactMethod:
            'Dies ist Ihre aktuelle Standard-Kontaktmethode. Bevor Sie sie löschen können, müssen Sie eine andere Kontaktmethode auswählen und auf „Als Standard festlegen“ klicken.',
        removeContactMethod: 'Kontaktmethode entfernen',
        removeAreYouSure: 'Möchtest du diese Kontaktmethode wirklich entfernen? Diese Aktion kann nicht rückgängig gemacht werden.',
        failedNewContact: 'Diese Kontaktmethode konnte nicht hinzugefügt werden.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Senden eines neuen Magic Codes fehlgeschlagen. Bitte warte einen Moment und versuche es erneut.',
            validateSecondaryLogin: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            deleteContactMethod: 'Kontaktmethode konnte nicht gelöscht werden. Bitte wende dich für Hilfe an Concierge.',
            setDefaultContactMethod: 'Das Festlegen einer neuen Standard-Kontaktmethode ist fehlgeschlagen. Bitte wende dich für Hilfe an Concierge.',
            addContactMethod: 'Diese Kontaktmethode konnte nicht hinzugefügt werden. Bitte wende dich für Hilfe an Concierge.',
            enteredMethodIsAlreadySubmitted: 'Diese Kontaktmethode existiert bereits',
            passwordRequired: 'Passwort erforderlich.',
            contactMethodRequired: 'Kontaktmethode ist erforderlich',
            invalidContactMethod: 'Ungültige Kontaktmethode',
        },
        newContactMethod: 'Neue Kontaktmethode',
        goBackContactMethods: 'Zurück zu den Kontaktmethoden',
    },
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Er / Ihn / Sein',
        heHimHisTheyThemTheirs: 'Er / Ihm / Sein / Sie / Ihnen / Ihre',
        sheHerHers: 'Sie / Ihr / Ihre',
        sheHerHersTheyThemTheirs: 'Sie / Ihr / Ihre / Sie / Ihnen / Ihre',
        merMers: 'Mer / Mehrs',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Pro Person / Personen',
        theyThemTheirs: 'They / Them / Theirs',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Nenn mich bei meinem Namen',
    },
    displayNamePage: {
        headerTitle: 'Anzeigename',
        isShownOnProfile: 'Ihr Anzeigename wird in Ihrem Profil angezeigt.',
    },
    timezonePage: {
        timezone: 'Zeitzone',
        isShownOnProfile: 'Ihre Zeitzone wird in Ihrem Profil angezeigt.',
        getLocationAutomatically: 'Standort automatisch bestimmen',
    },
    updateRequiredView: {
        updateRequired: 'Aktualisierung erforderlich',
        pleaseInstall: 'Bitte auf die neueste Version von New Expensify aktualisieren',
        pleaseInstallExpensifyClassic: 'Bitte installiere die neueste Version von Expensify',
        toGetLatestChanges: 'Für Mobilgeräte lade die neueste Version herunter und installiere sie. Für das Web aktualisiere deinen Browser.',
        newAppNotAvailable: 'Die New Expensify App ist nicht mehr verfügbar.',
    },
    initialSettingsPage: {
        about: 'Info',
        aboutPage: {
            description: 'Die neue Expensify-App wird von einer Community aus Open-Source-Entwickler:innen auf der ganzen Welt entwickelt. Hilf mit, die Zukunft von Expensify zu gestalten.',
            appDownloadLinks: 'App-Downloadlinks',
            viewKeyboardShortcuts: 'Tastenkürzel anzeigen',
            viewTheCode: 'Code anzeigen',
            viewOpenJobs: 'Offene Stellen anzeigen',
            reportABug: 'Fehler melden',
            troubleshoot: 'Problembehebung',
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
            clearCacheAndRestart: 'Cache leeren und neu starten',
            viewConsole: 'Debug-Konsole anzeigen',
            debugConsole: 'Debug-Konsole',
            description:
                '<muted-text>Verwende die folgenden Tools, um Probleme mit der Expensify-Nutzung zu beheben. Wenn du auf Probleme stößt, bitte <concierge-link>melde einen Fehler</concierge-link>.</muted-text>',
            confirmResetDescription: 'Alle ungesendeten Nachrichtenentwürfe gehen verloren, aber der Rest deiner Daten ist sicher.',
            resetAndRefresh: 'Zurücksetzen und aktualisieren',
            clientSideLogging: 'Clientseitiges Logging',
            noLogsToShare: 'Keine Protokolle zum Teilen',
            useProfiling: 'Profiling verwenden',
            profileTrace: 'Profil-Trace',
            results: 'Ergebnisse',
            releaseOptions: 'Freigabeoptionen',
            testingPreferences: 'Testeinstellungen',
            useStagingServer: 'Staging-Server verwenden',
            forceOffline: 'Offline erzwingen',
            simulatePoorConnection: 'Schlechte Internetverbindung simulieren',
            simulateFailingNetworkRequests: 'Fehlgeschlagene Netzwerkanfragen simulieren',
            authenticationStatus: 'Authentifizierungsstatus',
            deviceCredentials: 'Geräteanmeldedaten',
            invalidate: 'Ungültig machen',
            destroy: 'Zerstören',
            maskExportOnyxStateData: 'Empfindliche Mitgliedsdaten beim Export des Onyx-Status maskieren',
            exportOnyxState: 'Onyx-Status exportieren',
            importOnyxState: 'Onyx-Status importieren',
            testCrash: 'Absturz testen',
            resetToOriginalState: 'Auf ursprünglichen Zustand zurücksetzen',
            usingImportedState: 'Sie verwenden importierten Status. Tippen Sie hier, um ihn zu löschen.',
            debugMode: 'Debug-Modus',
            invalidFile: 'Ungültige Datei',
            invalidFileDescription: 'Die Datei, die Sie zu importieren versuchen, ist ungültig. Bitte versuchen Sie es erneut.',
            invalidateWithDelay: 'Mit Verzögerung ungültig machen',
            leftHandNavCache: 'Cache der linken Navigation',
            clearleftHandNavCache: 'Löschen',
            recordTroubleshootData: 'Fehlerdaten aufzeichnen',
            softKillTheApp: 'App sanft beenden',
            kill: 'Beenden',
            sentryDebug: 'Sentry-Debug',
            sentryDebugDescription: 'Sentry-Anfragen in der Konsole protokollieren',
            sentryHighlightedSpanOps: 'Hervorgehobene Span-Namen',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaktion.klick, navigation, ui.laden',
        },
        debugConsole: {
            saveLog: 'Protokoll speichern',
            shareLog: 'Protokoll teilen',
            enterCommand: 'Befehl eingeben',
            execute: 'Ausführen',
            noLogsAvailable: 'Keine Protokolle verfügbar',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `Protokollgröße überschreitet das Limit von ${size} MB. Bitte verwende „Protokoll speichern“, um die Protokolldatei stattdessen herunterzuladen.`,
            logs: 'Protokolle',
            viewConsole: 'Konsole anzeigen',
        },
        security: 'Sicherheit',
        signOut: 'Abmelden',
        restoreStashed: 'Zwischengespeicherten Login wiederherstellen',
        signOutConfirmationText: 'Alle Offline-Änderungen gehen verloren, wenn du dich abmeldest.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Lies die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und die <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzerklärung</a>.</muted-text-micro>`,
        help: 'Hilfe',
        whatIsNew: 'Was ist neu',
        accountSettings: 'Kontoeinstellungen',
        account: 'Konto',
        general: 'Allgemein',
    },
    closeAccountPage: {
        closeAccount: 'Konto schließen',
        reasonForLeavingPrompt: 'Wir würden es sehr bedauern, wenn du gehst! Würdest du uns bitte sagen, warum, damit wir uns verbessern können?',
        enterMessageHere: 'Nachricht hier eingeben',
        closeAccountWarning: 'Das Schließen Ihres Kontos kann nicht rückgängig gemacht werden.',
        closeAccountPermanentlyDeleteData: 'Bist du sicher, dass du dein Konto löschen möchtest? Dadurch werden alle ausstehenden Ausgaben dauerhaft gelöscht.',
        enterDefaultContactToConfirm: 'Bitte gib deine Standard-Kontaktmethode ein, um zu bestätigen, dass du dein Konto schließen möchtest. Deine Standard-Kontaktmethode ist:',
        enterDefaultContact: 'Gib deine Standardkontaktmethode ein',
        defaultContact: 'Standard-Kontaktmethode:',
        enterYourDefaultContactMethod: 'Bitte gib deine bevorzugte Kontaktmethode ein, um dein Konto zu schließen.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Konten zusammenführen',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Gib das Konto ein, das du mit <strong>${login}</strong> zusammenführen möchtest.`,
            notReversibleConsent: 'Ich verstehe, dass dies nicht rückgängig gemacht werden kann',
        },
        accountValidate: {
            confirmMerge: 'Sind Sie sicher, dass Sie Konten zusammenführen möchten?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `Das Zusammenführen deiner Konten ist unumkehrbar und führt zum Verlust aller nicht eingereichten Ausgaben für <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Um fortzufahren, gib bitte den magischen Code ein, der an <strong>${login}</strong> gesendet wurde.`,
            errors: {
                incorrectMagicCode: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
                fallback: 'Etwas ist schiefgelaufen. Bitte versuche es später noch einmal.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konten zusammengeführt!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Du hast erfolgreich alle Daten von <strong>${from}</strong> in <strong>${to}</strong> zusammengeführt. Künftig kannst du für dieses Konto entweder die eine oder die andere Anmeldung verwenden.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Wir arbeiten daran',
            limitedSupport: 'Wir unterstützen das Zusammenführen von Konten in New Expensify noch nicht. Bitte führen Sie diese Aktion stattdessen in Expensify Classic aus.',
            reachOutForHelp: '<muted-text><centered-text>Wende dich gern an den <concierge-link>Concierge</concierge-link>, wenn du Fragen hast!</centered-text></muted-text>',
            goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Sie können <strong>${email}</strong> nicht zusammenführen, da es von <strong>${email.split('@').at(1) ?? ''}</strong> verwaltet wird. Bitte <concierge-link>wenden Sie sich für Unterstützung an Concierge</concierge-link>.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Du kannst <strong>${email}</strong> nicht mit anderen Konten zusammenführen, weil deine Domain-Administration es als deine primäre Anmeldung festgelegt hat. Bitte führe stattdessen andere Konten mit diesem Konto zusammen.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Sie können die Konten nicht zusammenführen, weil für <strong>${email}</strong> die Zwei-Faktor-Authentifizierung (2FA) aktiviert ist. Bitte deaktivieren Sie 2FA für <strong>${email}</strong> und versuchen Sie es erneut.</centered-text></muted-text>`,
            learnMore: 'Erfahre mehr über das Zusammenführen von Konten.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Du kannst <strong>${email}</strong> nicht zusammenführen, weil sie gesperrt ist. Bitte <concierge-link>kontaktiere Concierge</concierge-link> für Unterstützung.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Konten können nicht zusammengeführt werden, weil <strong>${email}</strong> kein Expensify-Konto hat. Bitte <a href="${contactMethodLink}">füge sie stattdessen als Kontaktmethode hinzu</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Du kannst <strong>${email}</strong> nicht mit anderen Konten zusammenführen. Bitte führe stattdessen andere Konten damit zusammen.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Sie können keine Konten mit <strong>${email}</strong> zusammenführen, weil dieses Konto eine abgerechnete Zahlungsbeziehung besitzt.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Versuche es später erneut',
            description: 'Es gab zu viele Versuche, Konten zusammenzuführen. Bitte versuche es später erneut.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Du kannst nicht mit anderen Konten zusammenführen, weil dieses Konto nicht verifiziert ist. Bitte verifiziere das Konto und versuche es erneut.',
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
        compromisedDescription:
            'Ist Ihnen etwas Ungewöhnliches bei Ihrem Konto aufgefallen? Wenn Sie es melden, wird Ihr Konto sofort gesperrt, neue Expensify Card‑Transaktionen werden blockiert und alle Kontenänderungen verhindert.',
        domainAdminsDescription: 'Für Domain-Admins: Dies pausiert außerdem alle Expensify Card-Aktivitäten und Admin-Aktionen in deinen Domain(s).',
        areYouSure: 'Möchtest du dein Expensify-Konto wirklich sperren?',
        onceLocked: 'Sobald das Konto gesperrt ist, wird es eingeschränkt, bis eine Entsperrungsanfrage gestellt und eine Sicherheitsüberprüfung durchgeführt wurde.',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Konto konnte nicht gesperrt werden',
        failedToLockAccountDescription: `Wir konnten dein Konto nicht sperren. Bitte chatte mit Concierge, um dieses Problem zu beheben.`,
        chatWithConcierge: 'Mit Concierge chatten',
    },
    unlockAccountPage: {
        accountLocked: 'Konto gesperrt',
        yourAccountIsLocked: 'Dein Konto ist gesperrt',
        chatToConciergeToUnlock: 'Kontaktiere Concierge, um Sicherheitsbedenken zu klären und dein Konto zu entsperren.',
        chatWithConcierge: 'Mit Concierge chatten',
    },
    twoFactorAuth: {
        headerTitle: 'Zwei-Faktor-Authentifizierung',
        twoFactorAuthEnabled: 'Zwei-Faktor-Authentifizierung aktiviert',
        whatIsTwoFactorAuth:
            'Die Zwei-Faktor-Authentifizierung (2FA) hilft, dein Konto sicher zu halten. Beim Anmelden musst du einen Code eingeben, der von deiner bevorzugten Authentifizierungs-App generiert wird.',
        disableTwoFactorAuth: 'Zwei-Faktor-Authentifizierung deaktivieren',
        explainProcessToRemove: 'Um die Zwei-Faktor-Authentifizierung (2FA) zu deaktivieren, gib bitte einen gültigen Code aus deiner Authentifizierungs-App ein.',
        explainProcessToRemoveWithRecovery: 'Um die Zwei-Faktor-Authentifizierung (2FA) zu deaktivieren, gib bitte einen gültigen Wiederherstellungscode ein.',
        disabled: 'Die Zwei-Faktor-Authentifizierung ist jetzt deaktiviert',
        noAuthenticatorApp: 'Du benötigst keine Authentifizierungs-App mehr, um dich bei Expensify anzumelden.',
        stepCodes: 'Wiederherstellungscodes',
        keepCodesSafe: 'Bewahre diese Wiederherstellungscodes sicher auf!',
        codesLoseAccess: dedent(`
            Wenn du den Zugriff auf deine Authentifizierungs-App verlierst und diese Codes nicht hast, verlierst du den Zugriff auf dein Konto.

            Hinweis: Das Einrichten der Zwei-Faktor-Authentifizierung meldet dich von allen anderen aktiven Sitzungen ab.
        `),
        errorStepCodes: 'Bitte kopiere oder lade die Codes herunter, bevor du fortfährst',
        stepVerify: 'Bestätigen',
        scanCode: 'Scannen Sie den QR-Code mit Ihrem',
        authenticatorApp: 'Authentifizierungs-App',
        addKey: 'Oder füge diesen geheimen Schlüssel zu deiner Authentifikator-App hinzu:',
        enterCode: 'Gib dann den sechsstelligen Code ein, der von deiner Authentifizierungs-App generiert wurde.',
        stepSuccess: 'Abgeschlossen',
        enabled: 'Zwei-Faktor-Authentifizierung aktiviert',
        congrats: 'Glückwunsch! Jetzt hast du diese zusätzliche Sicherheit.',
        copy: 'Kopieren',
        disable: 'Deaktivieren',
        enableTwoFactorAuth: 'Zwei-Faktor-Authentifizierung aktivieren',
        pleaseEnableTwoFactorAuth: 'Bitte aktiviere die Zwei-Faktor-Authentifizierung.',
        twoFactorAuthIsRequiredDescription: 'Aus Sicherheitsgründen erfordert Xero zur Verbindung der Integration eine Zwei-Faktor-Authentifizierung.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Zwei-Faktor-Authentifizierung erforderlich',
        twoFactorAuthIsRequiredForAdminsTitle: 'Bitte die Zwei-Faktor-Authentifizierung aktivieren',
        twoFactorAuthIsRequiredXero: 'Ihre Xero-Buchhaltungsverbindung erfordert eine Zwei-Faktor-Authentifizierung.',
        twoFactorAuthIsRequiredCompany: 'Ihr Unternehmen erfordert eine Zwei-Faktor-Authentifizierung.',
        twoFactorAuthCannotDisable: '2FA kann nicht deaktiviert werden',
        twoFactorAuthRequired: 'Für Ihre Xero-Verbindung ist eine Zwei-Faktor-Authentifizierung (2FA) erforderlich und sie kann nicht deaktiviert werden.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Bitte gib deinen Wiederherstellungscode ein',
            incorrectRecoveryCode: 'Falscher Wiederherstellungscode. Bitte versuche es erneut.',
        },
        useRecoveryCode: 'Wiederherstellungscode verwenden',
        recoveryCode: 'Wiederherstellungscode',
        use2fa: 'Zwei-Faktor-Authentifizierungscode verwenden',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Bitte gib deinen Zwei-Faktor-Authentifizierungscode ein',
            incorrect2fa: 'Falscher Zwei-Faktor-Authentifizierungscode. Bitte versuche es erneut.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Passwort aktualisiert!',
        allSet: 'Alles erledigt. Bewahre dein neues Passwort sicher auf.',
    },
    privateNotes: {
        title: 'Private Notizen',
        personalNoteMessage: 'Notizen zu diesem Chat hier festhalten. Nur du kannst diese Notizen hinzufügen, bearbeiten oder ansehen.',
        sharedNoteMessage:
            'Notizen zu diesem Chat hier festhalten. Expensify-Mitarbeitende und andere Mitglieder mit einer E-Mail-Adresse in der team.expensify.com-Domain können diese Notizen sehen.',
        composerLabel: 'Notizen',
        myNote: 'Meine Notiz',
        error: {
            genericFailureMessage: 'Private Notizen konnten nicht gespeichert werden',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Bitte gib einen gültigen Sicherheitscode ein',
        },
        securityCode: 'Sicherheitscode',
        changeBillingCurrency: 'Abrechnungswährung ändern',
        changePaymentCurrency: 'Zahlungswährung ändern',
        paymentCurrency: 'Zahlungswährung',
        paymentCurrencyDescription: 'Wählen Sie eine standardisierte Währung, in die alle privaten Ausgaben umgerechnet werden sollen',
        note: `Hinweis: Wenn du deine Zahlungwährung änderst, kann sich das darauf auswirken, wie viel du für Expensify bezahlst. Sieh dir unsere <a href="${CONST.PRICING}">Preisseite</a> an, um alle Details zu erfahren.`,
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
        expensifyPassword: 'Expensify-Passwort',
        error: {
            invalidName: 'Der Name darf nur Buchstaben enthalten',
            addressZipCode: 'Bitte eine gültige Postleitzahl eingeben',
            debitCardNumber: 'Bitte gib eine gültige Debitkartennummer ein',
            expirationDate: 'Bitte wählen Sie ein gültiges Ablaufdatum aus',
            securityCode: 'Bitte gib einen gültigen Sicherheitscode ein',
            addressStreet: 'Bitte gib eine gültige Rechnungsadresse ein, die kein Postfach ist',
            addressState: 'Bitte wählen Sie ein Bundesland aus',
            addressCity: 'Bitte eine Stadt eingeben',
            genericFailureMessage: 'Beim Hinzufügen Ihrer Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            password: 'Bitte gib dein Expensify-Passwort ein',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Zahlungskarte hinzufügen',
        nameOnCard: 'Name auf der Karte',
        paymentCardNumber: 'Kartennummer',
        expiration: 'Ablaufdatum',
        expirationDate: 'MM/JJ',
        cvv: 'CVV',
        billingAddress: 'Rechnungsadresse',
        growlMessageOnSave: 'Ihre Zahlungskarte wurde erfolgreich hinzugefügt',
        expensifyPassword: 'Expensify-Passwort',
        error: {
            invalidName: 'Der Name darf nur Buchstaben enthalten',
            addressZipCode: 'Bitte eine gültige Postleitzahl eingeben',
            paymentCardNumber: 'Bitte gib eine gültige Kartennummer ein',
            expirationDate: 'Bitte wählen Sie ein gültiges Ablaufdatum aus',
            securityCode: 'Bitte gib einen gültigen Sicherheitscode ein',
            addressStreet: 'Bitte gib eine gültige Rechnungsadresse ein, die kein Postfach ist',
            addressState: 'Bitte wählen Sie ein Bundesland aus',
            addressCity: 'Bitte eine Stadt eingeben',
            genericFailureMessage: 'Beim Hinzufügen Ihrer Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            password: 'Bitte gib dein Expensify-Passwort ein',
        },
    },
    walletPage: {
        balance: 'Kontostand',
        paymentMethodsTitle: 'Zahlungsmethoden',
        setDefaultConfirmation: 'Als Standard-Zahlungsmethode festlegen',
        setDefaultSuccess: 'Standardzahlungsmethode festgelegt!',
        deleteAccount: 'Konto löschen',
        deleteConfirmation: 'Sind Sie sicher, dass Sie dieses Konto löschen möchten?',
        deleteCard: 'Karte löschen',
        deleteCardConfirmation:
            'Alle nicht eingereichten Kartenumsätze, einschließlich der in offenen Berichten, werden entfernt. Möchtest du diese Karte wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
        error: {
            notOwnerOfBankAccount: 'Beim Festlegen dieses Bankkontos als Ihre Standardzahlungsmethode ist ein Fehler aufgetreten',
            invalidBankAccount: 'Dieses Bankkonto ist vorübergehend gesperrt',
            notOwnerOfFund: 'Beim Festlegen dieser Karte als deine Standardzahlungsmethode ist ein Fehler aufgetreten',
            setDefaultFailure: 'Es ist ein Fehler aufgetreten. Bitte chatte mit Concierge, um weitere Unterstützung zu erhalten.',
        },
        addBankAccountFailure: 'Beim Hinzufügen Ihres Bankkontos ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        getPaidFaster: 'Schneller bezahlt werden',
        addPaymentMethod: 'Füge eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        getPaidBackFaster: 'Lass dich schneller zurückzahlen',
        secureAccessToYourMoney: 'Sicherer Zugriff auf Ihr Geld',
        receiveMoney: 'Geld in Ihrer lokalen Währung empfangen',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Sende und empfange Geld mit Freunden. Nur für US-Bankkonten.',
        enableWallet: 'Wallet aktivieren',
        addBankAccountToSendAndReceive: 'Füge ein Bankkonto hinzu, um Zahlungen zu senden oder zu empfangen.',
        addDebitOrCreditCard: 'Debit- oder Kreditkarte hinzufügen',
        assignedCards: 'Zugewiesene Karten',
        assignedCardsDescription: 'Transaktionen von diesen Karten werden automatisch synchronisiert.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Wir überprüfen gerade Ihre Angaben. Bitte versuchen Sie es in ein paar Minuten erneut!',
        walletActivationFailed: 'Leider kann deine Wallet derzeit nicht aktiviert werden. Bitte chatte mit Concierge, um weitere Unterstützung zu erhalten.',
        addYourBankAccount: 'Füge dein Bankkonto hinzu',
        addBankAccountBody: 'Verbinden wir jetzt Ihr Bankkonto mit Expensify, damit Sie so einfach wie nie zuvor direkt in der App Zahlungen senden und empfangen können.',
        chooseYourBankAccount: 'Wählen Sie Ihr Bankkonto',
        chooseAccountBody: 'Stell sicher, dass du die richtige Option auswählst.',
        confirmYourBankAccount: 'Bestätige dein Bankkonto',
        personalBankAccounts: 'Persönliche Bankkonten',
        businessBankAccounts: 'Geschäftsbankkonten',
        shareBankAccount: 'Bankkonto freigeben',
        bankAccountShared: 'Bankkonto geteilt',
        shareBankAccountTitle: 'Wähle die Admins aus, mit denen dieses Bankkonto geteilt werden soll:',
        shareBankAccountSuccess: 'Bankkonto geteilt!',
        shareBankAccountSuccessDescription: 'Die ausgewählten Admins erhalten eine Bestätigungsnachricht von Concierge.',
        shareBankAccountFailure: 'Beim Versuch, das Bankkonto zu teilen, ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut.',
        shareBankAccountEmptyTitle: 'Keine Admins verfügbar',
        shareBankAccountEmptyDescription: 'Es gibt keine Workspace-Admins, mit denen du dieses Bankkonto teilen kannst.',
        shareBankAccountNoAdminsSelected: 'Bitte wähle eine*n Admin aus, bevor du fortfährst',
        unshareBankAccount: 'Bankkonto-Freigabe aufheben',
        unshareBankAccountDescription:
            'Alle unten aufgeführten Personen haben Zugriff auf dieses Bankkonto. Du kannst den Zugriff jederzeit entfernen. Wir werden laufende Zahlungen trotzdem abschließen.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} verliert den Zugriff auf dieses Geschäftskonto. Laufende Zahlungen werden dennoch abgeschlossen.`,
        reachOutForHelp: 'Es wird mit der Expensify Card verwendet. <concierge-link>Wende dich an Concierge</concierge-link>, wenn du die Freigabe aufheben musst.',
        unshareErrorModalTitle: 'Bankkonto kann nicht freigegeben werden',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify-Reisekarte',
        availableSpend: 'Verbleibendes Limit',
        smartLimit: {
            name: 'Intelligentes Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Sie können bis zu ${formattedLimit} mit dieser Karte ausgeben, und das Limit wird zurückgesetzt, sobald Ihre eingereichten Ausgaben genehmigt wurden.`,
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
        physicalCardNumber: 'Nummer der physischen Karte',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Physische Karte bestellen',
        reportFraud: 'Virtuelle Kartenbetrugsfälle melden',
        reportTravelFraud: 'Reisekartenbetrug melden',
        reviewTransaction: 'Transaktion prüfen',
        suspiciousBannerTitle: 'Verdächtige Transaktion',
        suspiciousBannerDescription: 'Wir haben verdächtige Transaktionen auf Ihrer Karte festgestellt. Tippen Sie unten, um sie zu überprüfen.',
        cardLocked: 'Ihre Karte ist vorübergehend gesperrt, während unser Team das Konto Ihres Unternehmens überprüft.',
        markTransactionsAsReimbursable: 'Transaktionen als erstattungsfähig markieren',
        markTransactionsDescription: 'Wenn diese Option aktiviert ist, werden Transaktionen, die von dieser Karte importiert werden, standardmäßig als erstattungsfähig markiert.',
        csvCardDescription: 'CSV-Import',
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
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Zu ${platform} Wallet hinzugefügt`,
        cardDetailsLoadingFailure: 'Beim Laden der Kartendetails ist ein Fehler aufgetreten. Bitte überprüfe deine Internetverbindung und versuche es erneut.',
        validateCardTitle: 'Stellen wir sicher, dass du es bist',
        enterMagicCode: (contactMethod: string) =>
            `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um deine Kartendaten anzuzeigen. Er sollte innerhalb ein bis zwei Minuten ankommen.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) =>
            `Bitte <a href="${missingDetailsLink}">füge deine persönlichen Daten hinzu</a> und versuche es dann noch einmal.`,
        unexpectedError: 'Beim Abrufen deiner Expensify-Kartendetails ist ein Fehler aufgetreten. Bitte versuch es noch einmal.',
        cardFraudAlert: {
            confirmButtonText: 'Ja, das tue ich.',
            reportFraudButtonText: 'Nein, das war ich nicht',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `hat die verdächtige Aktivität geklärt und Karte x${cardLastFour} wieder aktiviert. Alles bereit, weiter Ausgaben zu erfassen!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `hat die Karte mit der Endung ${cardLastFour} deaktiviert`,
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
            }) => `verdächtige Aktivität auf der Karte mit der Endziffer ${cardLastFour} festgestellt. Erkennen Sie diese Abbuchung wieder?

${amount} für ${merchant} – ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Ausgaben',
        workflowDescription: 'Konfiguriere einen Workflow ab dem Moment, in dem Ausgaben anfallen – einschließlich Genehmigung und Zahlung.',
        submissionFrequency: 'Einsendungen',
        submissionFrequencyDescription: 'Wähle einen benutzerdefinierten Zeitplan zum Einreichen von Spesen.',
        submissionFrequencyDateOfMonth: 'Tag des Monats',
        disableApprovalPromptDescription: 'Das Deaktivieren von Genehmigungen löscht alle vorhandenen Genehmigungs-Workflows.',
        addApprovalsTitle: 'Genehmigungen',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `Ausgaben von ${members} und der Genehmigende ist ${approvers}`,
        addApprovalButton: 'Genehmigungs-Workflow hinzufügen',
        addApprovalTip: 'Dieser Standard-Workflow gilt für alle Mitglieder, sofern kein spezifischerer Workflow vorhanden ist.',
        approver: 'Genehmigende Person',
        addApprovalsDescription: 'Zusätzliche Genehmigung einholen, bevor eine Zahlung autorisiert wird.',
        makeOrTrackPaymentsTitle: 'Zahlungen',
        makeOrTrackPaymentsDescription:
            'Fügen Sie eine autorisierte zahlende Person für Zahlungen hinzu, die in Expensify getätigt werden, oder verfolgen Sie Zahlungen, die anderswo getätigt wurden.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Für diesen Workspace ist ein benutzerdefinierter Genehmigungsworkflow aktiviert. Um diesen Workflow zu überprüfen oder zu ändern, wende dich bitte an deine:n <account-manager-link>Account Manager</account-manager-link> oder an <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Für diesen Workspace ist ein benutzerdefinierter Genehmigungs-Workflow aktiviert. Um diesen Workflow zu überprüfen oder zu ändern, wende dich bitte an <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Wähle, wie lange Expensify warten soll, bevor fehlerfreie Ausgaben geteilt werden.',
        },
        frequencyDescription: 'Wähle, wie oft Ausgaben automatisch eingereicht werden sollen, oder stelle es auf manuell',
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
                one: 'Std.',
                two: 'nd',
                few: '3.',
                other: 'th',
                '1': 'Erste',
                '2': 'Sekunde',
                '3': 'Dritte',
                '4': 'Vierter',
                '5': 'Fünfte',
                '6': 'Sechster',
                '7': 'Siebter',
                '8': 'Achter',
                '9': 'Neunte',
                '10': 'Zehnte',
            },
        },
        approverInMultipleWorkflows: 'Dieses Mitglied gehört bereits zu einem anderen Genehmigungs-Workflow. Alle Aktualisierungen hier werden sich auch dort widerspiegeln.',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> genehmigt bereits Berichte für <strong>${name2}</strong>. Bitte wähle eine andere approbierende Person, um einen zirkulären Workflow zu vermeiden.`,
        emptyContent: {
            title: 'Keine Mitglieder zum Anzeigen',
            expensesFromSubtitle: 'Alle Mitglieder des Arbeitsbereichs gehören bereits zu einem bestehenden Genehmigungsworkflow.',
            approverSubtitle: 'Alle Genehmigenden gehören zu einem bestehenden Workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Häufigkeit der Einreichung konnte nicht geändert werden. Bitte versuche es erneut oder kontaktiere den Support.',
        monthlyOffsetErrorMessage: 'Die monatliche Häufigkeit konnte nicht geändert werden. Bitte versuche es erneut oder kontaktiere den Support.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Bestätigen',
        header: 'Füge weitere Genehmigende hinzu und bestätige.',
        additionalApprover: 'Zusätzliche freigebende Person',
        submitButton: 'Workflow hinzufügen',
    },
    workflowsEditApprovalsPage: {
        title: 'Genehmigungsworkflow bearbeiten',
        deleteTitle: 'Genehmigungs-Workflow löschen',
        deletePrompt: 'Möchtest du diesen Genehmigungs-Workflow wirklich löschen? Alle Mitglieder werden anschließend dem Standard-Workflow folgen.',
    },
    workflowsExpensesFromPage: {
        title: 'Ausgaben ab',
        header: 'Wenn die folgenden Mitglieder Spesen einreichen:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Die:der Genehmigende konnte nicht geändert werden. Bitte versuche es erneut oder kontaktiere den Support.',
        title: 'Genehmigenden festlegen',
        description: 'Diese Person wird die Ausgaben genehmigen.',
    },
    workflowsApprovalLimitPage: {
        title: 'Genehmigende Person',
        header: '(Optional) Möchten Sie ein Genehmigungslimit hinzufügen?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Einen weiteren Genehmigenden hinzufügen, wenn <strong>${approverName}</strong> Genehmigender ist und der Bericht den folgenden Betrag überschreitet:`
                : 'Füge eine weitere genehmigende Person hinzu, wenn ein Bericht den folgenden Betrag überschreitet:',
        reportAmountLabel: 'Berichtsbetrag',
        additionalApproverLabel: 'Zusätzliche freigebende Person',
        skip: 'Überspringen',
        next: 'Weiter',
        removeLimit: 'Limit aufheben',
        enterAmountError: 'Bitte gib einen gültigen Betrag ein',
        enterApproverError: 'Genehmigende Person ist erforderlich, wenn Sie ein Berichtslimit festlegen',
        enterBothError: 'Einen Berichtsbetrag und eine zusätzliche Genehmigungsinstanz eingeben',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `Berichte über ${approvalLimit} werden an ${approverName} weitergeleitet`,
    },
    workflowsPayerPage: {
        title: 'Autorisierte zahlende Person',
        genericErrorMessage: 'Der/die autorisierte Zahler*in konnte nicht geändert werden. Bitte versuchen Sie es erneut.',
        admins: 'Admins',
        payer: 'Zahlende Person',
        paymentAccount: 'Zahlungskonto',
    },
    reportFraudPage: {
        title: 'Virtuelle Kartenbetrugsfälle melden',
        description:
            'Wenn Ihre virtuellen Kartendaten gestohlen oder kompromittiert wurden, deaktivieren wir Ihre bestehende Karte dauerhaft und stellen Ihnen eine neue virtuelle Karte mit neuer Nummer zur Verfügung.',
        deactivateCard: 'Karte deaktivieren',
        reportVirtualCardFraud: 'Virtuelle Kartenbetrugsfälle melden',
    },
    reportFraudConfirmationPage: {
        title: 'Kartenbetrug gemeldet',
        description: 'Wir haben Ihre bestehende Karte dauerhaft deaktiviert. Wenn Sie Ihre Kartendaten erneut aufrufen, steht Ihnen eine neue virtuelle Karte zur Verfügung.',
        buttonText: 'Verstanden, danke!',
    },
    activateCardPage: {
        activateCard: 'Karte aktivieren',
        pleaseEnterLastFour: 'Bitte gib die letzten vier Ziffern deiner Karte ein.',
        activatePhysicalCard: 'Physische Karte aktivieren',
        error: {
            thatDidNotMatch: 'Das stimmt nicht mit den letzten 4 Ziffern deiner Karte überein. Bitte versuche es erneut.',
            throttled:
                'Sie haben die letzten 4 Ziffern Ihrer Expensify Card zu oft falsch eingegeben. Wenn Sie sicher sind, dass die Nummern korrekt sind, wenden Sie sich bitte an Concierge, um das Problem zu lösen. Andernfalls versuchen Sie es später noch einmal.',
        },
    },
    getPhysicalCard: {
        header: 'Physische Karte bestellen',
        nameMessage: 'Gib deinen Vor- und Nachnamen ein, da dieser auf deiner Karte angezeigt wird.',
        legalName: 'Juristischer Name',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        phoneMessage: 'Gib deine Telefonnummer ein.',
        phoneNumber: 'Telefonnummer',
        address: 'Adresse',
        addressMessage: 'Gib deine Lieferadresse ein.',
        streetAddress: 'Straße und Hausnummer',
        city: 'Stadt',
        state: 'Status',
        zipPostcode: 'Postleitzahl',
        country: 'Land',
        confirmMessage: 'Bitte bestätige unten deine Angaben.',
        estimatedDeliveryMessage: 'Ihre physische Karte wird in 2–3 Werktagen eintreffen.',
        next: 'Weiter',
        getPhysicalCard: 'Physische Karte bestellen',
        shipCard: 'Karte versenden',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Überweisung${amount ? ` ${amount}` : ''}`,
        instant: 'Sofort (Debitkarte)',
        instantSummary: (rate: string, minAmount: string) => `${rate}% Gebühr (mindestens ${minAmount})`,
        ach: '1–3 Werktage (Bankkonto)',
        achSummary: 'Keine Gebühr',
        whichAccount: 'Welches Konto?',
        fee: 'Gebühr',
        transferSuccess: 'Überweisung erfolgreich!',
        transferDetailBankAccount: 'Ihr Geld sollte in den nächsten 1–3 Werktagen eintreffen.',
        transferDetailDebitCard: 'Ihr Geld sollte sofort eintreffen.',
        failedTransfer: 'Dein Saldo ist noch nicht vollständig ausgeglichen. Bitte überweise auf ein Bankkonto.',
        notHereSubTitle: 'Bitte überweise dein Guthaben von der Wallet-Seite',
        goToWallet: 'Zur Brieftasche',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Konto auswählen',
    },
    paymentMethodList: {
        addPaymentMethod: 'Zahlungsmethode hinzufügen',
        addNewDebitCard: 'Neue Debitkarte hinzufügen',
        addNewBankAccount: 'Neues Bankkonto hinzufügen',
        accountLastFour: 'Endet auf',
        cardLastFour: 'Karte endet auf',
        addFirstPaymentMethod: 'Füge eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        defaultPaymentMethod: 'Standard',
        bankAccountLastFour: (lastFour: string) => `Bankkonto • ${lastFour}`,
    },
    expenseRulesPage: {
        title: 'Ausgabenregeln',
        subtitle: 'Diese Regeln gelten für deine Ausgaben. Wenn du bei einem Workspace einreichst, können die Workspace-Regeln diese außer Kraft setzen.',
        findRule: 'Regel finden',
        emptyRules: {
            title: 'Sie haben noch keine Regeln erstellt',
            subtitle: 'Füge eine Regel hinzu, um die Spesenabrechnung zu automatisieren.',
        },
        changes: {
            billableUpdate: (value: boolean) => `Ausgabe ${value ? 'abrechenbar' : 'nicht berechenbar'} aktualisieren`,
            categoryUpdate: (value: string) => `Kategorie auf „${value}“ aktualisieren`,
            commentUpdate: (value: string) => `Beschreibung zu „${value}“ aktualisieren`,
            merchantUpdate: (value: string) => `Händler auf „${value}“ aktualisieren`,
            reimbursableUpdate: (value: boolean) => `Ausgabe ${value ? 'erstattungsfähig' : 'nicht erstattungsfähig'} aktualisieren`,
            tagUpdate: (value: string) => `Tag aktualisieren auf „${value}“`,
            taxUpdate: (value: string) => `Steuersatz auf „${value}“ aktualisieren`,
            billable: (value: boolean) => `Ausgabe ${value ? 'abrechenbar' : 'nicht berechenbar'}`,
            category: (value: string) => `Kategorie auf „${value}“`,
            comment: (value: string) => `Beschreibung in „${value}“ ändern`,
            merchant: (value: string) => `Händler auf „${value}“`,
            reimbursable: (value: boolean) => `Ausgabe ${value ? 'erstattungsfähig' : 'nicht erstattungsfähig'}`,
            tag: (value: string) => `markiere als „${value}“`,
            tax: (value: string) => `Steuersatz auf „${value}“`,
            report: (value: string) => `zu einem Bericht mit dem Namen „${value}“ hinzufügen`,
        },
        newRule: 'Neue Regel',
        addRule: {
            title: 'Regel hinzufügen',
            expenseContains: 'Wenn Ausgabe enthält:',
            applyUpdates: 'Wenden Sie dann diese Aktualisierungen an:',
            merchantHint: 'Gib . ein, um eine Regel zu erstellen, die für alle Händler gilt',
            addToReport: 'Zu einem Bericht mit dem Namen hinzufügen',
            createReport: 'Bericht erstellen, falls erforderlich',
            applyToExistingExpenses: 'Auf bereits passende Ausgaben anwenden',
            confirmError: 'Händler eingeben und mindestens eine Aktualisierung anwenden',
            confirmErrorMerchant: 'Bitte Händlernamen eingeben',
            confirmErrorUpdate: 'Bitte nimm mindestens eine Aktualisierung vor',
            saveRule: 'Regel speichern',
        },
        editRule: {
            title: 'Regel bearbeiten',
        },
        deleteRule: {
            deleteSingle: 'Regel löschen',
            deleteMultiple: 'Regeln löschen',
            deleteSinglePrompt: 'Sind Sie sicher, dass Sie diese Regel löschen möchten?',
            deleteMultiplePrompt: 'Möchtest du diese Regeln wirklich löschen?',
        },
    },
    preferencesPage: {
        appSection: {
            title: 'App-Einstellungen',
        },
        testSection: {
            title: 'Testeinstellungen',
            subtitle: 'Einstellungen zur Unterstützung von Debugging und Tests der App in der Staging-Umgebung.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Erhalte relevante Funktionsupdates und Expensify-Neuigkeiten',
        muteAllSounds: 'Alle Expensify‑Töne stummschalten',
    },
    priorityModePage: {
        priorityMode: 'Prioritätsmodus',
        explainerText:
            'Wähle, ob du dich nur auf ungelesene und angeheftete Chats #konzentrieren möchtest oder alles anzeigen willst, wobei die neuesten und angehefteten Chats oben stehen.',
        priorityModes: {
            default: {
                label: 'Neueste',
                description: 'Alle Chats nach neuestem sortiert anzeigen',
            },
            gsd: {
                label: '#Fokus',
                description: 'Nur ungelesene, alphabetisch sortiert anzeigen',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
        generatingPDF: 'PDF erstellen',
        waitForPDF: 'Bitte warten, während wir das PDF erstellen.',
        errorPDF: 'Beim Versuch, dein PDF zu erstellen, ist ein Fehler aufgetreten',
        successPDF: 'Ihre PDF wurde erstellt! Falls der Download nicht automatisch gestartet wurde, verwenden Sie die Schaltfläche unten.',
    },
    reportDescriptionPage: {
        roomDescription: 'Zimmerbeschreibung',
        roomDescriptionOptional: 'Zimmerbeschreibung (optional)',
        explainerText: 'Lege eine benutzerdefinierte Beschreibung für den Raum fest.',
    },
    groupChat: {
        lastMemberTitle: 'Achtung!',
        lastMemberWarning: 'Da du die letzte Person hier bist, wird dieser Chat für alle Mitglieder unzugänglich, wenn du ihn verlässt. Bist du sicher, dass du den Chat verlassen möchtest?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Gruppenchat von ${displayName}`,
    },
    languagePage: {
        language: 'Sprache',
        aiGenerated: 'Die Übersetzungen für diese Sprache werden automatisch erstellt und können Fehler enthalten.',
    },
    themePage: {
        theme: 'Design',
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
        chooseThemeBelowOrSync: 'Wähle unten ein Design aus oder synchronisiere es mit den Einstellungen deines Geräts.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Mit der Anmeldung stimmst du den <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und der <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzerklärung</a> zu.</muted-text-xs>`,
        license: `<muted-text-xs>Die Geldübermittlung wird von ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS-ID:2017010) gemäß seinen <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">Lizenzen</a> bereitgestellt.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Keinen Magic-Code erhalten?',
        enterAuthenticatorCode: 'Bitte gib deinen Authentifikator-Code ein',
        enterRecoveryCode: 'Bitte gib deinen Wiederherstellungscode ein',
        requiredWhen2FAEnabled: 'Erforderlich, wenn 2FA aktiviert ist',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Fordere in <a>${timeRemaining}</a> einen neuen Code an`,
        requestNewCodeAfterErrorOccurred: 'Neuen Code anfordern',
        error: {
            pleaseFillMagicCode: 'Bitte gib deinen Magic-Code ein',
            incorrectMagicCode: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            pleaseFillTwoFactorAuth: 'Bitte gib deinen Zwei-Faktor-Authentifizierungscode ein',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Bitte füllen Sie alle Felder aus',
        pleaseFillPassword: 'Bitte gib dein Passwort ein',
        pleaseFillTwoFactorAuth: 'Bitte gib deinen Zwei-Faktor-Code ein',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Gib deinen Zwei-Faktor-Authentifizierungscode ein, um fortzufahren',
        forgot: 'Passwort vergessen?',
        requiredWhen2FAEnabled: 'Erforderlich, wenn 2FA aktiviert ist',
        error: {
            incorrectPassword: 'Falsches Passwort. Bitte versuche es erneut.',
            incorrectLoginOrPassword: 'Falscher Login oder falsches Passwort. Bitte versuche es erneut.',
            incorrect2fa: 'Falscher Zwei-Faktor-Authentifizierungscode. Bitte versuche es erneut.',
            twoFactorAuthenticationEnabled: 'Für dieses Konto ist die Zwei-Faktor-Authentifizierung (2FA) aktiviert. Bitte melde dich mit deiner E-Mail-Adresse oder Telefonnummer an.',
            invalidLoginOrPassword: 'Ungültige Anmelde-ID oder ungültiges Passwort. Bitte versuchen Sie es erneut oder setzen Sie Ihr Passwort zurück.',
            unableToResetPassword:
                'Wir konnten Ihr Passwort nicht ändern. Dies liegt wahrscheinlich an einem abgelaufenen Link zum Zurücksetzen des Passworts in einer älteren E-Mail zum Zurücksetzen. Wir haben Ihnen einen neuen Link per E-Mail gesendet, damit Sie es erneut versuchen können. Überprüfen Sie Ihren Posteingang und Ihren Spam-Ordner; die E-Mail sollte in wenigen Minuten ankommen.',
            noAccess: 'Du hast keinen Zugriff auf diese Anwendung. Bitte füge deinen GitHub-Benutzernamen hinzu, um Zugriff zu erhalten.',
            accountLocked: 'Dein Konto wurde nach zu vielen fehlgeschlagenen Versuchen gesperrt. Bitte versuche es in 1 Stunde erneut.',
            fallback: 'Etwas ist schiefgelaufen. Bitte versuche es später noch einmal.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefon oder E-Mail',
        error: {
            invalidFormatEmailLogin: 'Die eingegebene E-Mail-Adresse ist ungültig. Bitte korrigiere das Format und versuche es erneut.',
        },
        cannotGetAccountDetails: 'Kontodetails konnten nicht abgerufen werden. Bitte melden Sie sich erneut an.',
        loginForm: 'Anmeldeformular',
        notYou: ({user}: NotYouParams) => `Nicht ${user}?`,
    },
    onboarding: {
        welcome: 'Willkommen!',
        welcomeSignOffTitleManageTeam: 'Sobald du die oben genannten Aufgaben abgeschlossen hast, können wir weitere Funktionen wie Genehmigungs-Workflows und Regeln erkunden!',
        welcomeSignOffTitle: 'Es ist schön, dich kennenzulernen!',
        explanationModal: {
            title: 'Willkommen bei Expensify',
            description:
                'Eine App, um deine geschäftlichen und privaten Ausgaben mit der Geschwindigkeit eines Chats zu verwalten. Probier sie aus und sag uns, was du denkst. Da kommt noch viel mehr!',
            secondaryDescription: 'Um zurück zu Expensify Classic zu wechseln, tippe einfach auf dein Profilbild > Gehe zu Expensify Classic.',
        },
        getStarted: 'Loslegen',
        whatsYourName: 'Wie heißt du?',
        peopleYouMayKnow: 'Personen, die du vielleicht kennst, sind schon hier! Bestätige deine E-Mail-Adresse, um mitzumachen.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `Jemand von ${domain} hat bereits einen Arbeitsbereich erstellt. Bitte gib den magischen Code ein, der an ${email} gesendet wurde.`,
        joinAWorkspace: 'Arbeitsbereich beitreten',
        listOfWorkspaces: 'Hier ist die Liste der Arbeitsbereiche, denen du beitreten kannst. Keine Sorge, du kannst später jederzeit beitreten, wenn du möchtest.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} Mitglied${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Wo arbeitest du?',
        errorSelection: 'Wähle eine Option, um fortzufahren',
        purpose: {
            title: 'Was möchtest du heute tun?',
            errorContinue: 'Bitte auf „Weiter“ tippen, um die Einrichtung abzuschließen',
            errorBackButton: 'Bitte beantworte die Einrichtungsfragen, um die App nutzen zu können',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Von meinem Arbeitgeber zurückerstattet werden',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Ausgaben meines Teams verwalten',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Ausgaben verfolgen und budgetieren',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chatten und Ausgaben mit Freunden aufteilen',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Etwas anderes',
        },
        employees: {
            title: 'Wie viele Mitarbeitende haben Sie?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1–10 Mitarbeitende',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11–50 Mitarbeitende',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51–100 Mitarbeitende',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101–1.000 Mitarbeitende',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Mehr als 1.000 Mitarbeitende',
        },
        accounting: {
            title: 'Verwendest du eine Buchhaltungssoftware?',
            none: 'Keine',
        },
        interestedFeatures: {
            title: 'Für welche Funktionen interessierst du dich?',
            featuresAlreadyEnabled: 'Hier sind unsere beliebtesten Funktionen:',
            featureYouMayBeInterestedIn: 'Zusätzliche Funktionen aktivieren:',
        },
        error: {
            requiredFirstName: 'Bitte gib deinen Vornamen ein, um fortzufahren',
        },
        workEmail: {
            title: 'Wie lautet deine geschäftliche E-Mail-Adresse?',
            subtitle: 'Expensify funktioniert am besten, wenn du deine geschäftliche E-Mail-Adresse verbindest.',
            explanationModal: {
                descriptionOne: 'An Belege@expensify.com zum Scannen weiterleiten',
                descriptionTwo: 'Schließe dich deinen Kolleg:innen an, die Expensify bereits nutzen',
                descriptionThree: 'Genieße ein noch individuelleres Erlebnis',
            },
            addWorkEmail: 'Arbeits-E-Mail hinzufügen',
        },
        workEmailValidation: {
            title: 'Bestätige deine geschäftliche E-Mail-Adresse',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Bitte gib den magischen Code ein, der an ${workEmail} gesendet wurde. Er sollte in ein bis zwei Minuten ankommen.`,
        },
        workEmailValidationError: {
            publicEmail: 'Bitte gib eine gültige geschäftliche E-Mail-Adresse von einer eigenen Domain ein, z. B. mitch@company.com',
            offline: 'Wir konnten deine geschäftliche E-Mail-Adresse nicht hinzufügen, da du anscheinend offline bist',
        },
        mergeBlockScreen: {
            title: 'Geschäftliche E-Mail-Adresse konnte nicht hinzugefügt werden',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Wir konnten ${workEmail} nicht hinzufügen. Bitte versuche es später in den Einstellungen erneut oder chatte mit Concierge, um Hilfe zu erhalten.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Machen Sie eine [Probefahrt](${testDriveURL})`,
                description: ({testDriveURL}) => `[Machen Sie eine kurze Produkt-Tour](${testDriveURL}), um zu sehen, warum Expensify der schnellste Weg ist, Ihre Spesen abzurechnen.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Machen Sie eine [Probefahrt](${testDriveURL})`,
                description: ({testDriveURL}) => `Machen Sie mit uns eine [Probefahrt](${testDriveURL}) und sichern Sie sich für Ihr Team *3 kostenlose Monate Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Ausgabengenehmigungen hinzufügen',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Füge Spesengenehmigungen hinzu*, um die Ausgaben deines Teams zu prüfen und unter Kontrolle zu halten.

                        So geht’s:

                        1. Gehe zu *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *More features*.
                        4. Aktiviere *Workflows*.
                        5. Gehe im Workspace-Editor zu *Workflows*.
                        6. Aktiviere *Approvals*.
                        7. Du wirst als Spesengenehmigende:r festgelegt. Du kannst dies auf eine:n beliebige:n Admin ändern, sobald du dein Team einlädst.

                        [Bring mich zu More features](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Erstelle](${workspaceConfirmationLink}) einen Workspace`,
                description: 'Erstellen Sie einen Workspace und konfigurieren Sie die Einstellungen mit Hilfe Ihrer Einrichtungsspezialist·in!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Erstelle einen [Workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Erstelle einen Arbeitsbereich*, um Ausgaben zu verfolgen, Belege zu scannen, zu chatten und mehr.

                        1. Klicke auf *Arbeitsbereiche* > *Neuer Arbeitsbereich*.

                        *Dein neuer Arbeitsbereich ist bereit!* [Sieh ihn dir an](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[Kostenstellen](${workspaceCategoriesLink}) einrichten`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Richte Kategorien ein*, damit dein Team Ausgaben für eine einfache Berichterstellung kodieren kann.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Kategorien*.
                        4. Deaktiviere alle Kategorien, die du nicht benötigst.
                        5. Füge oben rechts deine eigenen Kategorien hinzu.

                        [Zu den Kategorien-Einstellungen des Workspaces](${workspaceCategoriesLink}).

                        ![Kategorien einrichten](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Ausgabe einreichen',
                description: dedent(`
                    *Reiche eine Ausgabe ein*, indem du einen Betrag eingibst oder einen Beleg scannst.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Ausgabe erstellen*.
                    3. Gib einen Betrag ein oder scanne einen Beleg.
                    4. Füge die E-Mail-Adresse oder Telefonnummer deiner vorgesetzten Person hinzu.
                    5. Klicke auf *Erstellen*.

                    Und schon bist du fertig!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Ausgabe einreichen',
                description: dedent(`
                    *Reiche eine Ausgabe ein*, indem du einen Betrag eingibst oder einen Beleg scannst.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Ausgabe erstellen*.
                    3. Gib einen Betrag ein oder scanne einen Beleg.
                    4. Bestätige die Details.
                    5. Klicke auf *Erstellen*.

                    Und schon bist du fertig!
                `),
            },
            trackExpenseTask: {
                title: 'Ausgabe erfassen',
                description: dedent(`
                    *Verfolge eine Ausgabe* in beliebiger Währung – mit oder ohne Beleg.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Ausgabe erstellen*.
                    3. Gib einen Betrag ein oder scanne einen Beleg.
                    4. Wähle deinen *persönlichen* Bereich.
                    5. Klicke auf *Erstellen*.

                    Und schon bist du fertig! Ja, so einfach ist das.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Verbinde${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'nach'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'dein' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Verbinde ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'dein' : 'bis'} ${integrationName} für automatische Spesenkodierung und Synchronisierung, die deinen Monatsabschluss zum Kinderspiel macht.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Accounting*.
                        4. Suche ${integrationName}.
                        5. Klicke auf *Connect*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? `[Bring mich zur Buchhaltung](${workspaceAccountingLink}).

                        ![Mit ${integrationName} verbinden](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
        : `[Zur Buchhaltung](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[Unternehmenskarten verbinden](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Verbinden Sie die Karten, die Sie bereits haben, für den automatischen Transaktionsimport, Belegabgleich und die Abstimmung.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *Company cards*.
                        4. Folgen Sie den Anweisungen, um Ihre Karten zu verbinden.

                        [Zu den Company cards](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[your team](${workspaceMembersLink}) einladen`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Lade dein Team ein* zu Expensify, damit es noch heute mit dem Erfassen von Ausgaben beginnen kann.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Members* > *Invite member*.
                        4. Gib E-Mail-Adressen oder Telefonnummern ein.
                        5. Füge eine persönliche Einladung hinzu, wenn du möchtest!

                        [Zu den Workspace-Mitgliedern](${workspaceMembersLink}).

                        ![Lade dein Team ein](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Richten Sie [Kategorien](${workspaceCategoriesLink}) und [Tags](${workspaceTagsLink}) ein`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Richte Kategorien und Tags ein*, damit dein Team Ausgaben für eine einfache Berichterstattung kodieren kann.

                        Importiere sie automatisch, indem du [deine Buchhaltungssoftware verbindest](${workspaceAccountingLink}), oder richte sie manuell in deinen [Workspace-Einstellungen](${workspaceCategoriesLink}) ein.`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Richte [Tags](${workspaceTagsLink}) ein`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Verwende Tags, um zusätzliche Ausgabendetails wie Projekte, Kunden, Standorte und Abteilungen hinzuzufügen. Wenn du mehrere Ebenen von Tags benötigst, kannst du auf den Control-Tarif upgraden.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace.
                        3. Klicke auf *Weitere Funktionen*.
                        4. Aktiviere *Tags*.
                        5. Navigiere zu *Tags* im Workspace-Editor.
                        6. Klicke auf *+ Tag hinzufügen*, um dein eigenes zu erstellen.

                        [Zu weiteren Funktionen](${workspaceMoreFeaturesLink}).

                        ![Tags einrichten](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Lade deine[n Steuerberater](${workspaceMembersLink}) ein`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Laden Sie Ihre:n Steuerberater:in ein*, um in Ihrem Workspace zusammenzuarbeiten und Ihre Geschäftsausgaben zu verwalten.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *Members*.
                        4. Klicken Sie auf *Invite member*.
                        5. Geben Sie die E-Mail-Adresse Ihrer:s Steuerberater:in ein.

                        [Ihre:n Steuerberater:in jetzt einladen](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Chat starten',
                description: dedent(`
                    *Starte einen Chat* mit jeder Person über ihre E‑Mail-Adresse oder Telefonnummer.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Chat starten*.
                    3. Gib eine E‑Mail-Adresse oder Telefonnummer ein.

                    Wenn sie Expensify noch nicht verwenden, werden sie automatisch eingeladen.

                    Jeder Chat wird auch als E‑Mail oder SMS versendet, auf die sie direkt antworten können.
                `),
            },
            splitExpenseTask: {
                title: 'Ausgabe aufteilen',
                description: dedent(`
                    *Teile Ausgaben* mit einer oder mehreren Personen.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Chat starten*.
                    3. Gib E-Mails oder Telefonnummern ein.
                    4. Klicke im Chat auf die graue Schaltfläche *+* > *Ausgabe teilen*.
                    5. Erstelle die Ausgabe, indem du *Manuell*, *Scan* oder *Strecke* auswählst.

                    Du kannst gern weitere Details hinzufügen oder sie einfach abschicken. So bekommst du dein Geld schnell zurück!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Überprüfe deine [Workspace-Einstellungen](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        So überprüfst und aktualisierst du deine Workspace-Einstellungen:
                        1. Klicke auf „Workspaces“.
                        2. Wähle deinen Workspace aus.
                        3. Überprüfe und aktualisiere deine Einstellungen.
                        [Gehe zu deinem Workspace.](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: 'Erstelle deinen ersten Bericht',
                description: dedent(`
                    So erstellst du einen Bericht:

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Bericht erstellen*.
                    3. Klicke auf *Ausgabe hinzufügen*.
                    4. Füge deine erste Ausgabe hinzu.

                    Und schon bist du fertig!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Machen Sie eine [Probefahrt](${testDriveURL})` : 'Mach eine Probefahrt'),
            embeddedDemoIframeTitle: 'Probefahrt',
            employeeFakeReceipt: {
                description: 'Meine Probefahrtquittung!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Geld zurückzubekommen ist so einfach wie das Versenden einer Nachricht. Gehen wir die Grundlagen durch.',
            onboardingPersonalSpendMessage: 'So kannst du deine Ausgaben mit wenigen Klicks nachverfolgen.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Deine kostenlose Testversion hat gestartet! Lass uns mit der Einrichtung beginnen.
                        👋 Hallo, ich bin deine Expensify-Einrichtungsspezialist:in. Ich habe bereits einen Workspace erstellt, um die Belege und Ausgaben deines Teams zu verwalten. Um das Beste aus deiner 30-tägigen kostenlosen Testversion herauszuholen, folge einfach den verbleibenden Einrichtungsschritten unten!
                    `)
                    : dedent(`
                        # Deine kostenlose Testphase hat begonnen! Lass uns mit der Einrichtung starten.
                        👋 Hallo, ich bin deine Expensify-Einrichtungsspezialist*in. Jetzt, da du einen Arbeitsbereich erstellt hast, nutze deine 30-tägige kostenlose Testphase optimal, indem du die folgenden Schritte befolgst!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Lass uns deinen Account einrichten\n👋 Hallo, ich bin deine Expensify-Einrichtungsspezialist:in. Ich habe bereits einen Workspace erstellt, um dir beim Verwalten deiner Belege und Ausgaben zu helfen. Um das Beste aus deiner 30-tägigen kostenlosen Testphase herauszuholen, folge einfach den restlichen Einrichtungsschritten unten!',
            onboardingChatSplitMessage: 'Rechnungen mit Freund*innen zu teilen ist so einfach wie das Senden einer Nachricht. So geht’s.',
            onboardingAdminMessage: 'Erfahren Sie, wie Sie als Administrator:in den Arbeitsbereich Ihres Teams verwalten und Ihre eigenen Ausgaben einreichen.',
            onboardingLookingAroundMessage:
                'Expensify ist vor allem für Spesen-, Reise- und Firmenkartenverwaltung bekannt, aber wir können noch viel mehr. Sag mir, woran du interessiert bist, und ich helfe dir beim Einstieg.',
            onboardingTestDriveReceiverMessage: '*Du erhältst 3 Monate gratis! Leg unten los.*',
        },
        workspace: {
            title: 'Bleib mit einem Workspace organisiert',
            subtitle: 'Schalte leistungsstarke Tools frei, um dein Spesenmanagement an einem Ort zu vereinfachen. Mit einem Workspace kannst du:',
            explanationModal: {
                descriptionOne: 'Belege erfassen und organisieren',
                descriptionTwo: 'Ausgaben kategorisieren und taggen',
                descriptionThree: 'Berichte erstellen und teilen',
            },
            price: 'Teste es 30 Tage kostenlos und steige dann für nur <strong>5 $/Nutzer/Monat</strong> auf.',
            createWorkspace: 'Arbeitsbereich erstellen',
        },
        confirmWorkspace: {
            title: 'Arbeitsbereich bestätigen',
            subtitle:
                'Erstelle einen Workspace, um Belege zu verfolgen, Auslagen zu erstatten, Reisen zu verwalten, Berichte zu erstellen und mehr – alles mit der Geschwindigkeit eines Chats.',
        },
        inviteMembers: {
            title: 'Mitglieder einladen',
            subtitle: 'Füge dein Team hinzu oder lade deine*n Buchhalter*in ein. Je mehr, desto besser!',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Zeige mir das nicht mehr an',
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: 'Name darf keine Sonderzeichen enthalten',
            containsReservedWord: 'Name darf nicht die Wörter Expensify oder Concierge enthalten',
            hasInvalidCharacter: 'Name darf kein Komma oder Semikolon enthalten',
            requiredFirstName: 'Der Vorname darf nicht leer sein',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Wie lautet Ihr gesetzlicher Name?',
        enterDateOfBirth: 'Wie ist dein Geburtsdatum?',
        enterAddress: 'Wie lautet deine Adresse?',
        enterPhoneNumber: 'Wie lautet deine Telefonnummer?',
        personalDetails: 'Persönliche Daten',
        privateDataMessage: 'Diese Angaben werden für Reisen und Zahlungen verwendet. Sie werden niemals in deinem öffentlichen Profil angezeigt.',
        legalName: 'Juristischer Name',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        address: 'Adresse',
        error: {
            dateShouldBeBefore: (dateString: string) => `Datum muss vor ${dateString} liegen`,
            dateShouldBeAfter: (dateString: string) => `Datum muss nach ${dateString} liegen`,
            hasInvalidCharacter: 'Name darf nur lateinische Zeichen enthalten',
            incorrectZipFormat: (zipFormat?: string) => `Ungültiges Postleitzahlformat${zipFormat ? `Zulässiges Format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Bitte stellen Sie sicher, dass die Telefonnummer gültig ist (z. B. ${CONST.EXAMPLE_PHONE_NUMBER})`,
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
            `Um ${secondaryLogin} zu bestätigen, sende den magischen Code bitte erneut aus den Kontoeinstellungen von ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Wenn du keinen Zugriff mehr auf ${primaryLogin} hast, verknüpfe bitte deine Konten.`,
        unlink: 'Verknüpfung aufheben',
        linkSent: 'Link gesendet!',
        successfullyUnlinkedLogin: 'Sekundäres Login erfolgreich getrennt!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Unser E-Mail-Anbieter hat E-Mails an ${login} aufgrund von Zustellungsproblemen vorübergehend ausgesetzt. Um dein Login zu entsperren, befolge bitte diese Schritte:`,
        confirmThat: (login: string) =>
            `<strong>Bestätige, dass ${login} richtig geschrieben ist und eine echte, zustellbare E-Mail-Adresse ist.</strong> E-Mail-Aliasse wie „expenses@domain.com“ müssen Zugriff auf ihr eigenes E-Mail-Postfach haben, damit sie ein gültiger Expensify-Login sind.`,
        ensureYourEmailClient: `<strong>Stellen Sie sicher, dass Ihr E-Mail-Client E-Mails von expensify.com zulässt.</strong> Eine Anleitung, wie Sie diesen Schritt ausführen, finden Sie <a href="${CONST.SET_NOTIFICATION_LINK}">hier</a>, eventuell benötigen Sie jedoch die Hilfe Ihrer IT-Abteilung, um Ihre E-Mail-Einstellungen zu konfigurieren.`,
        onceTheAbove: `Sobald die oben genannten Schritte abgeschlossen sind, wende dich bitte an <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a>, um deine Anmeldung zu entsperren.`,
    },
    openAppFailureModal: {
        title: 'Etwas ist schiefgelaufen …',
        subtitle: `Wir konnten nicht alle Ihre Daten laden. Wir wurden benachrichtigt und untersuchen das Problem. Wenn es weiterhin besteht, wenden Sie sich bitte an`,
        refreshAndTryAgain: 'Aktualisieren und erneut versuchen',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Wir konnten SMS-Nachrichten nicht an ${login} zustellen und haben es daher vorübergehend gesperrt. Bitte versuche, deine Nummer zu bestätigen:`,
        validationSuccess: 'Deine Nummer wurde bestätigt! Klicke unten, um einen neuen magischen Anmeldecode zu senden.',
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
                return 'Bitte warte einen Moment, bevor du es erneut versuchst.';
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
            return `Bitte hab einen Moment Geduld! Du musst ${timeText} warten, bevor du erneut versuchst, deine Nummer zu bestätigen.`;
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
        selectYear: 'Bitte wähle ein Jahr aus',
    },
    focusModeUpdateModal: {
        title: 'Willkommen im #Fokusmodus!',
        prompt: (priorityModePageUrl: string) =>
            `Behalte den Überblick, indem du nur ungelesene Chats oder Chats siehst, die deine Aufmerksamkeit erfordern. Keine Sorge, du kannst das jederzeit in den <a href="${priorityModePageUrl}">Einstellungen</a> ändern.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Der Chat, den du suchst, kann nicht gefunden werden.',
        getMeOutOfHere: 'Hol mich hier raus',
        iouReportNotFound: 'Die gesuchten Zahlungsdetails können nicht gefunden werden.',
        notHere: 'Hmm … es ist nicht hier',
        pageNotFound: 'Ups, diese Seite konnte nicht gefunden werden',
        noAccess: 'Dieser Chat oder diese Ausgabe wurde möglicherweise gelöscht oder Sie haben keinen Zugriff darauf.\n\nBei Fragen wenden Sie sich bitte an concierge@expensify.com',
        goBackHome: 'Zurück zur Startseite',
        commentYouLookingForCannotBeFound: 'Der gesuchte Kommentar kann nicht gefunden werden.',
        goToChatInstead: 'Geh stattdessen zum Chat.',
        contactConcierge: 'Bei Fragen wende dich bitte an concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ups … ${isBreakLine ? '\n' : ''}Etwas ist schiefgelaufen`,
        subtitle: 'Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es später noch einmal.',
        wrongTypeSubtitle: 'Diese Suche ist ungültig. Versuche, deine Suchkriterien anzupassen.',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Füge ein Emoji hinzu, damit deine Kolleg:innen und Freund:innen leicht sehen, was los ist. Du kannst optional auch eine Nachricht hinzufügen!',
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
        clearAfter: 'Danach löschen',
        whenClearStatus: 'Wann sollen wir deinen Status zurücksetzen?',
        vacationDelegate: 'Urlaubsvertretung',
        setVacationDelegate: `Legen Sie eine Urlaubsvertretung fest, die Berichte in Ihrer Abwesenheit in Ihrem Namen freigibt.`,
        vacationDelegateError: 'Beim Aktualisieren deiner Urlaubsvertretung ist ein Fehler aufgetreten.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `als Urlaubsvertretung von ${nameOrEmail}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `an ${submittedToName} als Urlaubsvertretung für ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Sie benennen ${nameOrEmail} als Ihre Urlaubsvertretung. Diese Person ist noch nicht in all Ihren Arbeitsbereichen. Wenn Sie fortfahren, wird eine E-Mail an alle Admins Ihrer Arbeitsbereiche gesendet, damit sie hinzugefügt wird.`,
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
        confirmBankInfo: 'Bankdaten bestätigen',
        manuallyAdd: 'Bankkonto manuell hinzufügen',
        letsDoubleCheck: 'Lass uns zur Sicherheit noch einmal prüfen, ob alles richtig aussieht.',
        accountEnding: 'Konto endet auf',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in deinem Workspace verwendet',
        accountNumber: 'Kontonummer',
        routingNumber: 'Routing-Nummer',
        chooseAnAccountBelow: 'Wähle unten ein Konto aus',
        addBankAccount: 'Bankkonto hinzufügen',
        chooseAnAccount: 'Konto auswählen',
        connectOnlineWithPlaid: 'Melden Sie sich bei Ihrer Bank an',
        connectManually: 'Manuell verbinden',
        desktopConnection:
            'Hinweis: Um eine Verbindung mit Chase, Wells Fargo, Capital One oder Bank of America herzustellen, klicke bitte hier, um diesen Vorgang in einem Browser abzuschließen.',
        yourDataIsSecure: 'Ihre Daten sind sicher',
        toGetStarted: 'Füge ein Bankkonto hinzu, um Ausgaben zu erstatten, Expensify Cards auszugeben, Rechnungsgelder einzuziehen und Rechnungen – alles an einem Ort – zu bezahlen.',
        plaidBodyCopy: 'Geben Sie Ihren Mitarbeitenden eine einfachere Möglichkeit, Unternehmensausgaben zu bezahlen – und erstattet zu bekommen.',
        checkHelpLine: 'Ihre Routing-Nummer und Kontonummer finden Sie auf einem Scheck für dieses Konto.',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Um ein Bankkonto zu verknüpfen, bitte <a href="${contactMethodRoute}">füge eine E-Mail-Adresse als deine primäre Anmeldung hinzu</a> und versuche es erneut. Du kannst deine Telefonnummer als sekundäre Anmeldung hinzufügen.`,
        hasBeenThrottledError: 'Beim Hinzufügen deines Bankkontos ist ein Fehler aufgetreten. Bitte warte ein paar Minuten und versuche es dann erneut.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Ups! Es scheint, dass die Währung deines Arbeitsbereichs auf eine andere Währung als USD eingestellt ist. Um fortzufahren, gehe bitte zu <a href="${workspaceRoute}">den Einstellungen deines Arbeitsbereichs</a>, stelle sie auf USD ein und versuche es erneut.`,
        bbaAdded: 'Geschäftsbankkonto hinzugefügt!',
        bbaAddedDescription: 'Es ist bereit zur Verwendung für Zahlungen.',
        error: {
            youNeedToSelectAnOption: 'Bitte wählen Sie eine Option, um fortzufahren',
            noBankAccountAvailable: 'Leider ist kein Bankkonto verfügbar',
            noBankAccountSelected: 'Bitte wähle ein Konto',
            taxID: 'Bitte gib eine gültige Steueridentifikationsnummer ein',
            website: 'Bitte eine gültige Website eingeben',
            zipCode: `Bitte gib eine gültige Postleitzahl im folgenden Format ein: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Bitte gib eine gültige Telefonnummer ein',
            email: 'Bitte gib eine gültige E-Mail-Adresse ein',
            companyName: 'Bitte gib einen gültigen Firmennamen ein',
            addressCity: 'Bitte gib eine gültige Stadt ein',
            addressStreet: 'Bitte gib eine gültige Straßenadresse ein',
            addressState: 'Bitte wähle einen gültigen Bundesstaat aus',
            incorporationDateFuture: 'Das Gründungsdatum darf nicht in der Zukunft liegen',
            incorporationState: 'Bitte wähle einen gültigen Bundesstaat aus',
            industryCode: 'Bitte geben Sie einen gültigen Branchenklassifizierungscode mit sechs Ziffern ein',
            restrictedBusiness: 'Bitte bestätigen Sie, dass das Unternehmen nicht auf der Liste der eingeschränkten Unternehmen steht.',
            routingNumber: 'Bitte gib eine gültige Bankleitzahl ein',
            accountNumber: 'Bitte eine gültige Kontonummer eingeben',
            routingAndAccountNumberCannotBeSame: 'Routing- und Kontonummer dürfen nicht identisch sein',
            companyType: 'Bitte wählen Sie einen gültigen Unternehmenstyp aus',
            tooManyAttempts:
                'Aufgrund einer hohen Anzahl von Anmeldeversuchen wurde diese Option für 24 Stunden deaktiviert. Bitte versuche es später erneut oder gib die Angaben stattdessen manuell ein.',
            address: 'Bitte gib eine gültige Adresse ein',
            dob: 'Bitte ein gültiges Geburtsdatum auswählen',
            age: 'Muss über 18 Jahre alt sein',
            ssnLast4: 'Bitte gib die letzten 4 Ziffern einer gültigen SSN ein',
            firstName: 'Bitte gib einen gültigen Vornamen ein',
            lastName: 'Bitte gib einen gültigen Nachnamen ein',
            noDefaultDepositAccountOrDebitCardAvailable: 'Bitte ein Standard-Einzahlungskonto oder eine Debitkarte hinzufügen',
            validationAmounts: 'Die von Ihnen eingegebenen Verifizierungsbeträge sind falsch. Bitte prüfen Sie Ihren Kontoauszug noch einmal und versuchen Sie es erneut.',
            fullName: 'Bitte gib einen gültigen vollständigen Namen ein',
            ownershipPercentage: 'Bitte geben Sie eine gültige Prozentzahl ein',
            deletePaymentBankAccount:
                'Dieses Bankkonto kann nicht gelöscht werden, da es für Expensify Card-Zahlungen verwendet wird. Wenn du dieses Konto trotzdem löschen möchtest, kontaktiere bitte Concierge.',
            sameDepositAndWithdrawalAccount: 'Die Einzahlungs- und Auszahlungskonten sind identisch.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Wo befindet sich dein Bankkonto?',
        accountDetailsStepHeader: 'Wie lauten Ihre Kontodaten?',
        accountTypeStepHeader: 'Um welche Art von Konto handelt es sich?',
        bankInformationStepHeader: 'Wie lauten Ihre Bankverbindungsdaten?',
        accountHolderInformationStepHeader: 'Wie lauten die Kontoinhaberdaten?',
        howDoWeProtectYourData: 'Wie schützen wir Ihre Daten?',
        currencyHeader: 'Was ist die Währung deines Bankkontos?',
        confirmationStepHeader: 'Überprüfe deine Angaben.',
        confirmationStepSubHeader: 'Überprüfe die folgenden Angaben sorgfältig und aktiviere das Kontrollkästchen für die Bedingungen, um zu bestätigen.',
        toGetStarted: 'Füge ein persönliches Bankkonto hinzu, um Erstattungen zu erhalten, Rechnungen zu bezahlen oder die Expensify Wallet zu aktivieren.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Expensify-Passwort eingeben',
        alreadyAdded: 'Dieses Konto wurde bereits hinzugefügt.',
        chooseAccountLabel: 'Konto',
        successTitle: 'Persönliches Bankkonto hinzugefügt!',
        successMessage: 'Glückwunsch, dein Bankkonto ist eingerichtet und bereit, Rückerstattungen zu empfangen.',
    },
    attachmentView: {
        unknownFilename: 'Unbekannter Dateiname',
        passwordRequired: 'Bitte ein Passwort eingeben',
        passwordIncorrect: 'Falsches Passwort. Bitte versuche es erneut.',
        failedToLoadPDF: 'PDF-Datei konnte nicht geladen werden',
        pdfPasswordForm: {
            title: 'Passwortgeschützte PDF',
            infoText: 'Diese PDF ist passwortgeschützt.',
            beforeLinkText: 'Bitte',
            linkText: 'Gib das Passwort ein',
            afterLinkText: 'um sie anzusehen.',
            formLabel: 'PDF anzeigen',
        },
        attachmentNotFound: 'Anhang nicht gefunden',
        retry: 'Erneut versuchen',
    },
    messages: {
        errorMessageInvalidPhone: `Bitte gib eine gültige Telefonnummer ohne Klammern oder Bindestriche ein. Wenn du außerhalb der USA bist, gib bitte deine Ländervorwahl an (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Ungültige E-Mail',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} ist bereits Mitglied von ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} ist bereits Admin von ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Indem Sie mit der Anfrage zur Aktivierung Ihres Expensify Wallets fortfahren, bestätigen Sie, dass Sie Folgendes gelesen haben, verstehen und akzeptieren',
        facialScan: 'Onfidos Richtlinie und Freigabe zur Gesichtserkennung',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfidos Richtlinie zur Gesichtserkennung und Einwilligung</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Datenschutz</a> und <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Nutzungsbedingungen</a>.</muted-text-micro>`,
        tryAgain: 'Erneut versuchen',
        verifyIdentity: 'Identität bestätigen',
        letsVerifyIdentity: 'Lass uns deine Identität bestätigen',
        butFirst: `Aber zuerst das Langweilige. Lies dir im nächsten Schritt den juristischen Text durch und klicke auf „Akzeptieren“, wenn du bereit bist.`,
        genericError: 'Beim Verarbeiten dieses Schritts ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        cameraPermissionsNotGranted: 'Kamerazugriff aktivieren',
        cameraRequestMessage: 'Wir benötigen Zugriff auf deine Kamera, um die Bankkontoverifizierung abzuschließen. Bitte aktiviere sie über Einstellungen > New Expensify.',
        microphonePermissionsNotGranted: 'Mikrofonzugriff aktivieren',
        microphoneRequestMessage: 'Wir benötigen Zugriff auf dein Mikrofon, um die Bankkontoverifizierung abzuschließen. Bitte aktiviere dies unter Einstellungen > New Expensify.',
        originalDocumentNeeded: 'Bitte laden Sie ein Originalfoto Ihres Ausweises hoch, nicht einen Screenshot oder einen Scan.',
        documentNeedsBetterQuality:
            'Ihr Ausweis scheint beschädigt zu sein oder es fehlen Sicherheitsmerkmale. Bitte laden Sie ein Originalbild eines unbeschädigten Ausweises hoch, der vollständig sichtbar ist.',
        imageNeedsBetterQuality: 'Es gibt ein Problem mit der Bildqualität deines Ausweises. Bitte lade ein neues Bild hoch, auf dem dein gesamter Ausweis deutlich zu sehen ist.',
        selfieIssue: 'Es gibt ein Problem mit deinem Selfie/Video. Bitte lade ein aktuelles Selfie/Video hoch.',
        selfieNotMatching: 'Dein Selfie/Video stimmt nicht mit deinem Ausweis überein. Bitte lade ein neues Selfie/Video hoch, auf dem dein Gesicht deutlich zu erkennen ist.',
        selfieNotLive: 'Dein Selfie/Video scheint kein Live‑Foto/Live‑Video zu sein. Bitte lade ein Live‑Selfie/Live‑Video hoch.',
    },
    additionalDetailsStep: {
        headerTitle: 'Zusätzliche Details',
        helpText: 'Wir müssen die folgenden Informationen bestätigen, bevor du mit deinem Wallet Geld senden und empfangen kannst.',
        helpTextIdologyQuestions: 'Wir müssen dir nur noch ein paar weitere Fragen stellen, um deine Identität abschließend zu bestätigen.',
        helpLink: 'Erfahre mehr darüber, warum wir das benötigen.',
        legalFirstNameLabel: 'Gesetzlicher Vorname',
        legalMiddleNameLabel: 'Zweiter Vorname (amtlich)',
        legalLastNameLabel: 'Rechtlicher Nachname',
        selectAnswer: 'Bitte wählen Sie eine Antwort aus, um fortzufahren',
        ssnFull9Error: 'Bitte gib eine gültige neunstelligе Sozialversicherungsnummer (SSN) ein',
        needSSNFull9: 'Wir können Ihre Sozialversicherungsnummer (SSN) nicht verifizieren. Bitte geben Sie alle neun Ziffern Ihrer SSN ein.',
        weCouldNotVerify: 'Wir konnten nicht verifizieren',
        pleaseFixIt: 'Bitte korrigiere diese Angaben, bevor du fortfährst',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Wir konnten Ihre Identität nicht verifizieren. Bitte versuchen Sie es später noch einmal oder wenden Sie sich an <a href="mailto:${conciergeEmail}">${conciergeEmail}</a>, wenn Sie Fragen haben.`,
    },
    termsStep: {
        headerTitle: 'Bedingungen und Gebühren',
        headerTitleRefactor: 'Gebühren und Bedingungen',
        haveReadAndAgreePlain: 'Ich habe die Hinweise gelesen und stimme zu, elektronische Mitteilungen zu erhalten.',
        haveReadAndAgree: `Ich habe gelesen und stimme zu, <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">elektronische Mitteilungen</a> zu erhalten.`,
        agreeToThePlain: 'Ich stimme der Datenschutz- und Wallet-Vereinbarung zu.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Ich stimme der <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzerklärung</a> und der <a href="${walletAgreementUrl}">Wallet-Vereinbarung</a> zu.`,
        enablePayments: 'Zahlungen aktivieren',
        monthlyFee: 'Monatliche Gebühr',
        inactivity: 'Inaktivität',
        noOverdraftOrCredit: 'Keine Überziehungs- oder Kreditfunktion.',
        electronicFundsWithdrawal: 'Elektronische Abbuchung von Geldmitteln',
        standard: 'Standard',
        reviewTheFees: 'Schau dir einige Gebühren an.',
        checkTheBoxes: 'Bitte markieren Sie die Kästchen unten.',
        agreeToTerms: 'Stimme den Bedingungen zu, und du bist startklar!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Die Expensify Wallet wird von ${walletProgram} ausgegeben.`,
            perPurchase: 'Pro Einkauf',
            atmWithdrawal: 'Geldautomat-Abhebung',
            cashReload: 'Bargeldaufladung',
            inNetwork: 'im Netzwerk',
            outOfNetwork: 'außermobilfunknetz',
            atmBalanceInquiry: 'Abfrage des Geldautomatenkontostands (im eigenen oder fremden Netz)',
            customerService: 'Kundendienst (automatisiert oder Live-Agent)',
            inactivityAfterTwelveMonths: 'Inaktivität (nach 12 Monaten ohne Transaktionen)',
            weChargeOneFee: 'Wir berechnen 1 weitere Art von Gebühr. Sie ist:',
            fdicInsurance: 'Ihre Gelder sind für eine FDIC-Versicherung berechtigt.',
            generalInfo: `Allgemeine Informationen zu Prepaid-Konten finden Sie unter <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Details und Bedingungen zu allen Gebühren und Dienstleistungen finden Sie unter <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> oder telefonisch unter +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektronische Mittelabbuchung (sofort)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min. ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Eine Liste aller Expensify Wallet-Gebühren',
            typeOfFeeHeader: 'Alle Gebühren',
            feeAmountHeader: 'Betrag',
            moreDetailsHeader: 'Details',
            openingAccountTitle: 'Konto eröffnen',
            openingAccountDetails: 'Für die Kontoeröffnung fällt keine Gebühr an.',
            monthlyFeeDetails: 'Es gibt keine monatliche Gebühr.',
            customerServiceTitle: 'Kundenservice',
            customerServiceDetails: 'Es fallen keine Servicegebühren für Kund:innen an.',
            inactivityDetails: 'Es gibt keine Inaktivitätsgebühr.',
            sendingFundsTitle: 'Überweisung von Geld an eine*n andere*n Kontoinhaber*in',
            sendingFundsDetails: 'Es fällt keine Gebühr an, wenn du mit deinem Guthaben, Bankkonto oder deiner Debitkarte Geld an eine andere Kontoinhaber*in sendest.',
            electronicFundsStandardDetails:
                'Für Überweisungen von deinem Expensify Wallet auf dein Bankkonto mit der Standardoption fällt keine Gebühr an. Diese Überweisung wird in der Regel innerhalb von 1–3 Werktagen abgeschlossen.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Für die Überweisung von Guthaben aus deinem Expensify Wallet auf deine verknüpfte Debitkarte mit der Option „Sofortüberweisung“ fällt eine Gebühr an. Diese Überweisung wird normalerweise innerhalb weniger Minuten abgeschlossen.' +
                `Die Gebühr beträgt ${percentage} % des Überweisungsbetrags (mit einer Mindestgebühr von ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Ihr Guthaben ist für eine FDIC-Versicherung geeignet. Ihr Guthaben wird bei oder an ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, ein von der FDIC versichertes Institut, gehalten oder übertragen.` +
                `Sobald sie dort eingezahlt sind, sind Ihre Gelder durch die FDIC bis zu ${amount} versichert, falls ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} ausfällt, sofern bestimmte Einlagensicherungsanforderungen erfüllt sind und Ihre Karte registriert ist. Einzelheiten finden Sie unter ${CONST.TERMS.FDIC_PREPAID}.`,
            contactExpensifyPayments: `Kontaktieren Sie ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} telefonisch unter +1 833-400-0904, per E-Mail an ${CONST.EMAIL.CONCIERGE} oder melden Sie sich unter ${CONST.NEW_EXPENSIFY_URL} an.`,
            generalInformation: `Allgemeine Informationen zu Prepaid-Konten finden Sie unter ${CONST.TERMS.CFPB_PREPAID}. Wenn Sie eine Beschwerde zu einem Prepaid-Konto haben, rufen Sie das Consumer Financial Protection Bureau unter 1-855-411-2372 an oder besuchen Sie ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Druckfreundliche Version anzeigen',
            automated: 'Automatisiert',
            liveAgent: 'Live-Agent',
            instant: 'Sofort',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Mind. ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Zahlungen aktivieren',
        activatedTitle: 'Wallet aktiviert!',
        activatedMessage: 'Glückwunsch, deine Wallet ist eingerichtet und bereit, Zahlungen zu tätigen.',
        checkBackLaterTitle: 'Nur eine Minute ...',
        checkBackLaterMessage: 'Wir prüfen Ihre Angaben noch. Bitte schauen Sie später noch einmal vorbei.',
        continueToPayment: 'Weiter zur Zahlung',
        continueToTransfer: 'Mit Überweisung fortfahren',
    },
    companyStep: {
        headerTitle: 'Unternehmensinformationen',
        subtitle: 'Fast geschafft! Aus Sicherheitsgründen müssen wir einige Angaben bestätigen:',
        legalBusinessName: 'Gesetzlicher Unternehmensname',
        companyWebsite: 'Firmenwebsite',
        taxIDNumber: 'Steuer-ID-Nummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        companyType: 'Unternehmensart',
        incorporationDate: 'Gründungsdatum',
        incorporationState: 'Gründungsstaat',
        industryClassificationCode: 'Branchencode für die Branchenklassifikation',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der',
        listOfRestrictedBusinesses: 'Liste eingeschränkt zugelassener Unternehmen',
        incorporationDatePlaceholder: 'Startdatum (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Genossenschaft',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Sonstiges',
        },
        industryClassification: 'Unter welcher Branche ist das Unternehmen eingestuft?',
        industryClassificationCodePlaceholder: 'Nach Branchenklassifizierungscode suchen',
    },
    requestorStep: {
        headerTitle: 'Persönliche Angaben',
        learnMore: 'Erfahre mehr',
        isMyDataSafe: 'Sind meine Daten sicher?',
    },
    personalInfoStep: {
        personalInfo: 'Persönliche Daten',
        enterYourLegalFirstAndLast: 'Wie lautet Ihr gesetzlicher Name?',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        legalName: 'Juristischer Name',
        enterYourDateOfBirth: 'Wie ist dein Geburtsdatum?',
        enterTheLast4: 'Wie lauten die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4SSN: 'Letzte 4 der Sozialversicherungsnummer',
        enterYourAddress: 'Wie lautet deine Adresse?',
        address: 'Adresse',
        letsDoubleCheck: 'Lass uns zur Sicherheit noch einmal prüfen, ob alles richtig aussieht.',
        byAddingThisBankAccount: 'Durch Hinzufügen dieses Bankkontos bestätigst du, dass du Folgendes gelesen hast, verstehst und akzeptierst',
        whatsYourLegalName: 'Wie lautet Ihr gesetzlicher Name?',
        whatsYourDOB: 'Wie ist dein Geburtsdatum?',
        whatsYourAddress: 'Wie lautet deine Adresse?',
        whatsYourSSN: 'Wie lauten die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        noPersonalChecks: 'Keine Sorge, hier gibt es keine persönlichen Bonitätsprüfungen!',
        whatsYourPhoneNumber: 'Wie lautet deine Telefonnummer?',
        weNeedThisToVerify: 'Wir benötigen dies, um deine Wallet zu verifizieren.',
    },
    businessInfoStep: {
        businessInfo: 'Firmeninfos',
        enterTheNameOfYourBusiness: 'Wie heißt dein Unternehmen?',
        businessName: 'Juristischer Firmenname',
        enterYourCompanyTaxIdNumber: 'Wie lautet die Steueridentifikationsnummer Ihres Unternehmens?',
        taxIDNumber: 'Steuer-ID-Nummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        enterYourCompanyWebsite: 'Wie lautet die Website Ihres Unternehmens?',
        companyWebsite: 'Firmenwebsite',
        enterYourCompanyPhoneNumber: 'Wie lautet die Telefonnummer Ihres Unternehmens?',
        enterYourCompanyAddress: 'Wie lautet die Adresse Ihres Unternehmens?',
        selectYourCompanyType: 'Was für ein Unternehmen ist es?',
        companyType: 'Unternehmensart',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Genossenschaft',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Sonstiges',
        },
        selectYourCompanyIncorporationDate: 'Was ist das Gründungsdatum Ihres Unternehmens?',
        incorporationDate: 'Gründungsdatum',
        incorporationDatePlaceholder: 'Startdatum (yyyy-mm-dd)',
        incorporationState: 'Gründungsstaat',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In welchem US-Bundesstaat wurde Ihr Unternehmen eingetragen?',
        letsDoubleCheck: 'Lass uns zur Sicherheit noch einmal prüfen, ob alles richtig aussieht.',
        companyAddress: 'Firmenadresse',
        listOfRestrictedBusinesses: 'Liste eingeschränkt zugelassener Unternehmen',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der',
        businessInfoTitle: 'Geschäftsinformationen',
        legalBusinessName: 'Gesetzlicher Unternehmensname',
        whatsTheBusinessName: 'Wie lautet der Firmenname?',
        whatsTheBusinessAddress: 'Wie lautet die Geschäftsadresse?',
        whatsTheBusinessContactInformation: 'Wie lauten die geschäftlichen Kontaktinformationen?',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Was ist die Unternehmensregisternummer (CRN)?';
                default:
                    return 'Wie lautet die Handelsregisternummer?';
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Was ist die Arbeitgeber-Identifikationsnummer (EIN)?';
                case CONST.COUNTRY.CA:
                    return 'Was ist die Unternehmensnummer (BN)?';
                case CONST.COUNTRY.GB:
                    return 'Wie lautet die Umsatzsteuer-Identifikationsnummer (USt-IdNr.)?';
                case CONST.COUNTRY.AU:
                    return 'Was ist die Australian Business Number (ABN)?';
                default:
                    return 'Wie lautet die EU-Umsatzsteuer-Identifikationsnummer?';
            }
        },
        whatsThisNumber: 'Was ist diese Nummer?',
        whereWasTheBusinessIncorporated: 'Wo wurde das Unternehmen gegründet?',
        whatTypeOfBusinessIsIt: 'Um welche Art von Unternehmen handelt es sich?',
        whatsTheBusinessAnnualPayment: 'Wie hoch ist das jährliche Zahlungsvolumen des Unternehmens?',
        whatsYourExpectedAverageReimbursements: 'Wie hoch ist Ihr voraussichtlicher durchschnittlicher Erstattungsbetrag?',
        registrationNumber: 'Registrierungsnummer',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'EIN';
                case CONST.COUNTRY.CA:
                    return 'BN';
                case CONST.COUNTRY.GB:
                    return 'USt-IdNr.';
                case CONST.COUNTRY.AU:
                    return 'ABN';
                default:
                    return 'EU-Mehrwertsteuer';
            }
        },
        businessAddress: 'Geschäftsadresse',
        businessType: 'Geschäftsart',
        incorporation: 'Gründung',
        incorporationCountry: 'Gründungsland',
        incorporationTypeName: 'Gründungsart',
        businessCategory: 'Geschäftskategorie',
        annualPaymentVolume: 'Jährliches Zahlungsvolumen',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Jährliches Zahlungsvolumen in ${currencyCode}`,
        averageReimbursementAmount: 'Durchschnittliche Erstattungsbetrag',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Durchschnittliche Rückerstattungssumme in ${currencyCode}`,
        selectIncorporationType: 'Rechtsform auswählen',
        selectBusinessCategory: 'Geschäftskategorie auswählen',
        selectAnnualPaymentVolume: 'Jährliches Zahlungsvolumen auswählen',
        selectIncorporationCountry: 'Gründungsland auswählen',
        selectIncorporationState: 'Bundesstaat der Gründung auswählen',
        selectAverageReimbursement: 'Durchschnittliche Erstattungsbetrag auswählen',
        selectBusinessType: 'Geschäftstyp auswählen',
        findIncorporationType: 'Art der Unternehmensgründung finden',
        findBusinessCategory: 'Geschäftskategorie suchen',
        findAnnualPaymentVolume: 'Jährliches Zahlungsvolumen finden',
        findIncorporationState: 'Bundesstaat der Gründung finden',
        findAverageReimbursement: 'Durchschnittliche Erstattungssumme finden',
        findBusinessType: 'Geschäftsart finden',
        error: {
            registrationNumber: 'Bitte gib eine gültige Registrierungsnummer ein',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Bitte eine gültige Arbeitgeber-Identifikationsnummer (EIN) angeben';
                    case CONST.COUNTRY.CA:
                        return 'Bitte gib eine gültige Business Number (BN) ein';
                    case CONST.COUNTRY.GB:
                        return 'Bitte gib eine gültige Umsatzsteuer-Identifikationsnummer (USt-IdNr.) an';
                    case CONST.COUNTRY.AU:
                        return 'Bitte eine gültige Australian Business Number (ABN) angeben';
                    default:
                        return 'Bitte gib eine gültige EU-Umsatzsteuernummer ein';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `Besitzen Sie 25 % oder mehr von ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `Besitzen einzelne Personen 25 % oder mehr von ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Gibt es weitere Personen, die 25 % oder mehr von ${companyName} besitzen?`,
        regulationRequiresUsToVerifyTheIdentity: 'Aufgrund gesetzlicher Vorschriften müssen wir die Identität jeder Person überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        companyOwner: 'Geschäftsinhaber·in',
        enterLegalFirstAndLastName: 'Wie lautet der rechtliche Name des/der Inhaber(s)?',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        enterTheDateOfBirthOfTheOwner: 'Wie lautet das Geburtsdatum der Inhaberperson?',
        enterTheLast4: 'Wie lauten die letzten 4 Ziffern der Sozialversicherungsnummer der Inhaberperson?',
        last4SSN: 'Letzte 4 der Sozialversicherungsnummer',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        enterTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Juristischer Name',
        address: 'Adresse',
        byAddingThisBankAccount: 'Durch Hinzufügen dieses Bankkontos bestätigst du, dass du Folgendes gelesen hast, verstehst und akzeptierst',
        owners: 'Eigentümer',
    },
    ownershipInfoStep: {
        ownerInfo: 'Eigentümerinfos',
        businessOwner: 'Geschäftsinhaber·in',
        signerInfo: 'Unterzeichnerinfos',
        doYouOwn: (companyName: string) => `Besitzen Sie 25 % oder mehr von ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `Besitzen einzelne Personen 25 % oder mehr von ${companyName}?`,
        regulationsRequire: 'Vorschriften verpflichten uns, die Identität jeder Person zu überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        whatsTheOwnersName: 'Wie lautet der rechtliche Name des/der Inhaber(s)?',
        whatsYourName: 'Wie lautet Ihr gesetzlicher Name?',
        whatPercentage: 'Wie viel Prozent des Unternehmens gehören dem*der Eigentümer*in?',
        whatsYoursPercentage: 'Wie viel Prozent des Unternehmens besitzen Sie?',
        ownership: 'Eigentumsrechte',
        whatsTheOwnersDOB: 'Wie lautet das Geburtsdatum der Inhaberperson?',
        whatsYourDOB: 'Wie ist dein Geburtsdatum?',
        whatsTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        whatsYourAddress: 'Wie lautet deine Adresse?',
        whatAreTheLast: 'Wie lauten die letzten 4 Ziffern der Sozialversicherungsnummer des*der Kontoinhaber*in?',
        whatsYourLast: 'Wie lauten die letzten 4 Ziffern Ihrer Sozialversicherungsnummer?',
        whatsYourNationality: 'Was ist Ihr Staatsangehörigkeitsland?',
        whatsTheOwnersNationality: 'Aus welchem Land ist der/die Eigentümer:in Staatsbürger:in?',
        countryOfCitizenship: 'Staatsangehörigkeitsland',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4: 'Letzte 4 der Sozialversicherungsnummer',
        whyDoWeAsk: 'Warum fragen wir danach?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Juristischer Name',
        ownershipPercentage: 'Eigentumsanteil',
        areThereOther: (companyName: string) => `Gibt es andere Personen, die mindestens 25 % von ${companyName} besitzen?`,
        owners: 'Eigentümer',
        addCertified: 'Füge ein beglaubigtes Organigramm hinzu, das die wirtschaftlich Berechtigten zeigt',
        regulationRequiresChart:
            'Vorschriften verpflichten uns, eine beglaubigte Kopie des Eigentumsdiagramms zu erfassen, das jede Person oder juristische Einheit ausweist, die 25 % oder mehr des Unternehmens besitzt.',
        uploadEntity: 'Diagram zur Unternehmenseigentümerstruktur hochladen',
        noteEntity:
            'Hinweis: Das Diagramm zur Eigentümerstruktur der Gesellschaft muss von Ihrer buchhalterischen Betreuung, Ihrer Rechtsberatung unterschrieben oder notariell beglaubigt werden.',
        certified: 'Bestätigtes Diagramm der Eigentümerstruktur der Organisation',
        selectCountry: 'Land auswählen',
        findCountry: 'Land finden',
        address: 'Adresse',
        chooseFile: 'Datei auswählen',
        uploadDocuments: 'Zusätzliche Dokumentation hochladen',
        pleaseUpload:
            'Bitte laden Sie unten zusätzliche Unterlagen hoch, damit wir Ihre Identität als direkte*r oder indirekte*r Eigentümer*in von 25 % oder mehr der Geschäftseinheit überprüfen können.',
        acceptedFiles: 'Akzeptierte Dateiformate: PDF, PNG, JPEG. Die Gesamtdateigröße für jeden Abschnitt darf 5 MB nicht überschreiten.',
        proofOfBeneficialOwner: 'Nachweis des wirtschaftlich Berechtigten',
        proofOfBeneficialOwnerDescription:
            'Bitte legen Sie eine unterschriebene Bescheinigung und ein Organigramm von einem Wirtschaftsprüfer, Notar oder Rechtsanwalt vor, die den Besitz von 25 % oder mehr des Unternehmens bestätigen. Das Dokument muss innerhalb der letzten drei Monate datiert sein und die Lizenznummer der unterzeichnenden Person enthalten.',
        copyOfID: 'Ausweiskopie für wirtschaftlich Berechtigte*n',
        copyOfIDDescription: 'Beispiele: Reisepass, Führerschein usw.',
        proofOfAddress: 'Adressnachweis für wirtschaftlich Berechtigte',
        proofOfAddressDescription: 'Beispiele: Nebenkostenabrechnung, Mietvertrag usw.',
        codiceFiscale: 'Codice fiscale/Steuer-ID',
        codiceFiscaleDescription:
            'Bitte laden Sie ein Video von einem Standortbesuch oder einem aufgezeichneten Gespräch mit der vertretungsberechtigten Person hoch. Die Person muss Folgendes angeben: vollständiger Name, Geburtsdatum, Firmenname, Handelsregister- bzw. Registernummer, Steuernummer, eingetragene Adresse, Unternehmensgegenstand und den Verwendungszweck des Kontos.',
    },
    completeVerificationStep: {
        completeVerification: 'Verifizierung abschließen',
        confirmAgreements: 'Bitte bestätigen Sie die folgenden Vereinbarungen.',
        certifyTrueAndAccurate: 'Ich bestätige, dass die gemachten Angaben wahr und korrekt sind',
        certifyTrueAndAccurateError: 'Bitte bestätigen Sie, dass die Angaben wahrheitsgemäß und korrekt sind',
        isAuthorizedToUseBankAccount: 'Ich bin berechtigt, dieses Geschäftskonto für Geschäftsausgaben zu verwenden',
        isAuthorizedToUseBankAccountError: 'Sie müssen zeichnungsberechtigte*r vertretungsberechtigte*r Geschäftsführer*in sein, um das Geschäftskonto führen zu dürfen',
        termsAndConditions: 'Allgemeine Geschäftsbedingungen',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Bestätige dein Bankkonto',
        validateButtonText: 'Validieren',
        validationInputLabel: 'Transaktion',
        maxAttemptsReached: 'Die Verifizierung dieses Bankkontos wurde wegen zu vieler falscher Versuche deaktiviert.',
        description: `Innerhalb von 1–2 Werktagen senden wir drei (3) kleine Transaktionen auf Ihr Bankkonto von einem Namen wie „Expensify, Inc. Validation“.`,
        descriptionCTA: 'Bitte gib jeden Transaktionsbetrag in die Felder unten ein. Beispiel: 1.51.',
        letsChatText: 'Fast geschafft! Wir brauchen noch deine Hilfe, um ein paar letzte Informationen im Chat zu bestätigen. Bereit?',
        enable2FATitle: 'Betrug verhindern, Zwei-Faktor-Authentifizierung (2FA) aktivieren',
        enable2FAText: 'Wir nehmen Ihre Sicherheit sehr ernst. Bitte richten Sie jetzt 2FA ein, um Ihrem Konto eine zusätzliche Schutzebene hinzuzufügen.',
        secureYourAccount: 'Sichern Sie Ihr Konto',
    },
    countryStep: {
        confirmBusinessBank: 'Bestätige Währung und Land des Geschäftskontos',
        confirmCurrency: 'Währung und Land bestätigen',
        yourBusiness: 'Die Währung Ihres Geschäftskontos muss mit der Währung Ihres Workspace übereinstimmen.',
        youCanChange: 'Sie können die Währung Ihres Arbeitsbereichs in Ihren',
        findCountry: 'Land finden',
        selectCountry: 'Land auswählen',
    },
    bankInfoStep: {
        whatAreYour: 'Wie lauten die Daten Ihres Geschäftskontos?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles gut aussieht.',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in deinem Workspace verwendet',
        accountNumber: 'Kontonummer',
        accountHolderNameDescription: 'Vollständiger Name der zeichnungsberechtigten Person',
    },
    signerInfoStep: {
        signerInfo: 'Unterzeichnerinfos',
        areYouDirector: (companyName: string) => `Sind Sie Geschäftsführer:in bei ${companyName}?`,
        regulationRequiresUs: 'Vorschriften verpflichten uns zu prüfen, ob die unterzeichnende Person befugt ist, diese Aktion im Namen des Unternehmens vorzunehmen.',
        whatsYourName: 'Wie lautet Ihr gesetzlicher Name',
        fullName: 'Vollständiger gesetzlicher Name',
        whatsYourJobTitle: 'Wie lautet deine Berufsbezeichnung?',
        jobTitle: 'Berufsbezeichnung',
        whatsYourDOB: 'Wie ist dein Geburtsdatum?',
        uploadID: 'Lade Ausweis und Adressnachweis hoch',
        personalAddress: 'Adressnachweis (z. B. Versorgungsrechnung)',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Juristischer Name',
        proofOf: 'Adressnachweis der Privatanschrift',
        enterOneEmail: (companyName: string) => `Gib die E-Mail-Adresse einer Führungskraft bei ${companyName} ein`,
        regulationRequiresOneMoreDirector: 'Die Vorschriften erfordern mindestens eine weitere/n Direktor/in als Unterzeichner/in.',
        hangTight: 'Einen Moment bitte …',
        enterTwoEmails: (companyName: string) => `Gib die E-Mail-Adressen von zwei Geschäftsführenden bei ${companyName} ein`,
        sendReminder: 'Erinnerung senden',
        chooseFile: 'Datei auswählen',
        weAreWaiting: 'Wir warten darauf, dass andere ihre Identität als Geschäftsführende des Unternehmens verifizieren.',
        id: 'Ausweiskopie',
        proofOfDirectors: 'Nachweis der Geschäftsführung',
        proofOfDirectorsDescription: 'Beispiele: Oncorp-Firmenprofil oder Unternehmensregistrierung.',
        codiceFiscale: 'Steuernummer',
        codiceFiscaleDescription: 'Steuernummer für Zeichnungsberechtigte, Autorisierte Nutzende und Wirtschaftlich Berechtigte.',
        PDSandFSG: 'PDS- und FSG-Offenlegungsunterlagen',
        PDSandFSGDescription: dedent(`
            Unsere Partnerschaft mit Corpay nutzt eine API-Verbindung, um das umfangreiche Netzwerk internationaler Bankpartner zu verwenden und so Globale Erstattungen in Expensify zu ermöglichen. Gemäß den australischen Vorschriften stellen wir Ihnen den Financial Services Guide (FSG) und die Product Disclosure Statement (PDS) von Corpay zur Verfügung.

            Bitte lesen Sie die FSG- und PDS-Dokumente sorgfältig durch, da sie vollständige Details und wichtige Informationen zu den von Corpay angebotenen Produkten und Dienstleistungen enthalten. Bewahren Sie diese Dokumente für zukünftige Nachschlagezwecke auf.
        `),
        pleaseUpload: 'Bitte laden Sie unten zusätzliche Unterlagen hoch, damit wir Ihre Identität als Geschäftsführungsmitglied des Unternehmens überprüfen können.',
        enterSignerInfo: 'Unterschriftsdaten eingeben',
        thisStep: 'Dieser Schritt wurde abgeschlossen',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `verbindet ein ${currency}-Geschäftsbankkonto mit der Endziffer ${bankAccountLastFour} mit Expensify, um Mitarbeitende in ${currency} zu bezahlen. Der nächste Schritt erfordert Unterzeichnungsdaten von einer Geschäftsführungsperson.`,
        error: {
            emailsMustBeDifferent: 'E-Mail-Adressen müssen unterschiedlich sein',
        },
    },
    agreementsStep: {
        agreements: 'Vereinbarungen',
        pleaseConfirm: 'Bitte bestätigen Sie die folgenden Vereinbarungen',
        regulationRequiresUs: 'Aufgrund gesetzlicher Vorschriften müssen wir die Identität jeder Person überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        iAmAuthorized: 'Ich bin berechtigt, das Geschäftskonto für Geschäftsausgaben zu verwenden.',
        iCertify: 'Hiermit bestätige ich, dass die bereitgestellten Angaben wahrheitsgemäß und korrekt sind.',
        iAcceptTheTermsAndConditions: `Ich akzeptiere die <a href="https://cross-border.corpay.com/tc/">Allgemeinen Geschäftsbedingungen</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Ich akzeptiere die Allgemeinen Geschäftsbedingungen.',
        accept: 'Akzeptieren und Bankkonto hinzufügen',
        iConsentToThePrivacyNotice: 'Ich stimme der <a href="https://payments.corpay.com/compliance">Datenschutzerklärung</a> zu.',
        iConsentToThePrivacyNoticeAccessibility: 'Ich stimme der Datenschutzerklärung zu.',
        error: {
            authorized: 'Sie müssen zeichnungsberechtigte*r vertretungsberechtigte*r Geschäftsführer*in sein, um das Geschäftskonto führen zu dürfen',
            certify: 'Bitte bestätigen Sie, dass die Angaben wahrheitsgemäß und korrekt sind',
            consent: 'Bitte stimmen Sie der Datenschutzrichtlinie zu',
        },
    },
    docusignStep: {
        subheader: 'Docusign-Formular',
        pleaseComplete:
            'Bitte füllen Sie das ACH-Autorisierungsformular über den Docusign-Link unten aus und laden Sie die unterschriebene Kopie anschließend hier hoch, damit wir Gelder direkt von Ihrem Bankkonto einziehen können.',
        pleaseCompleteTheBusinessAccount: 'Bitte vervollständigen Sie den Antrag auf Geschäftskonto für das Lastschriftabkommen',
        pleaseCompleteTheDirect:
            'Bitte füllen Sie die Lastschriftvereinbarung über den untenstehenden DocuSign-Link aus und laden Sie die unterzeichnete Kopie anschließend hier hoch, damit wir Gelder direkt von Ihrem Bankkonto einziehen können.',
        takeMeTo: 'Führ mich zu DocuSign',
        uploadAdditional: 'Zusätzliche Dokumentation hochladen',
        pleaseUpload: 'Bitte laden Sie das DEFT-Formular und die Docusign-Unterschriftsseite hoch',
        pleaseUploadTheDirect: 'Bitte lade die Lastschriftvereinbarungen und die Docusign-Unterschriftsseite hoch',
    },
    finishStep: {
        letsFinish: 'Lass uns im Chat fertig machen!',
        thanksFor:
            'Danke für diese Angaben. Eine zuständige Support-Mitarbeiter*in wird Ihre Informationen nun prüfen. Wir melden uns, falls wir noch etwas von Ihnen benötigen. In der Zwischenzeit können Sie sich bei Fragen jederzeit gerne an uns wenden.',
        iHaveA: 'Ich habe eine Frage',
        enable2FA: 'Aktiviere die Zwei-Faktor-Authentifizierung (2FA), um Betrug zu verhindern',
        weTake: 'Wir nehmen Ihre Sicherheit sehr ernst. Bitte richten Sie jetzt 2FA ein, um Ihrem Konto eine zusätzliche Schutzebene hinzuzufügen.',
        secure: 'Sichern Sie Ihr Konto',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Einen Moment',
        explanationLine: 'Wir überprüfen gerade deine Angaben. Du kannst in Kürze mit den nächsten Schritten fortfahren.',
    },
    session: {
        offlineMessageRetry: 'Sie scheinen offline zu sein. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    },
    travel: {
        header: 'Reise buchen',
        title: 'Smart reisen',
        subtitle: 'Nutze Expensify Travel, um die besten Reiseangebote zu erhalten und alle deine Geschäftsausgaben an einem Ort zu verwalten.',
        features: {
            saveMoney: 'Spare Geld bei deinen Buchungen',
            alerts: 'Erhalte Echtzeitbenachrichtigungen, wenn sich deine Reisepläne ändern',
        },
        bookTravel: 'Reise buchen',
        bookDemo: 'Demo buchen',
        bookADemo: 'Demo buchen',
        toLearnMore: 'um mehr zu erfahren.',
        termsAndConditions: {
            header: 'Bevor wir fortfahren …',
            title: 'Geschäftsbedingungen',
            label: 'Ich stimme den Allgemeinen Geschäftsbedingungen zu',
            subtitle: `Bitte stimmen Sie den <a href="${CONST.TRAVEL_TERMS_URL}">Allgemeinen Geschäftsbedingungen</a> von Expensify Travel zu.`,
            error: 'Sie müssen den Expensify Travel Geschäftsbedingungen zustimmen, um fortzufahren',
            defaultWorkspaceError:
                'Sie müssen einen Standard-Arbeitsbereich festlegen, um Expensify Travel zu aktivieren. Gehen Sie zu Einstellungen > Arbeitsbereiche > klicken Sie auf die drei vertikalen Punkte neben einem Arbeitsbereich > Als Standardarbeitsbereich festlegen und versuchen Sie es dann erneut!',
        },
        flight: 'Flug',
        flightDetails: {
            passenger: 'Passagier',
            layover: (layover: string) => `<muted-text-label>Sie haben einen <strong>${layover} Zwischenstopp</strong> vor diesem Flug</muted-text-label>`,
            takeOff: 'Abflug',
            landing: 'Landing',
            seat: 'Sitz',
            class: 'Kabinenklasse',
            recordLocator: 'Buchungsnummer',
            cabinClasses: {
                unknown: 'Unbekannt',
                economy: 'Economy',
                premiumEconomy: 'Premium Economy',
                business: 'Geschäft',
                first: 'Erste',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Gast',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
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
        train: 'Schiene',
        trainDetails: {
            passenger: 'Passagier',
            departs: 'Abfahrt',
            arrives: 'Trifft ein',
            coachNumber: 'Wagennummer',
            seat: 'Sitz',
            fareDetails: 'Tarifdetails',
            confirmation: 'Bestätigungsnummer',
        },
        viewTrip: 'Reise ansehen',
        modifyTrip: 'Reise bearbeiten',
        tripSupport: 'Reiseunterstützung',
        tripDetails: 'Reisedetails',
        viewTripDetails: 'Reisedetails anzeigen',
        trip: 'Reise',
        trips: 'Reisen',
        tripSummary: 'Reiseübersicht',
        departs: 'Abfahrt',
        errorMessage: 'Etwas ist schiefgelaufen. Bitte versuche es später noch einmal.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>Bitte <a href="${phoneErrorMethodsRoute}">fügen Sie eine geschäftliche E-Mail-Adresse als Ihre primäre Anmeldung hinzu</a>, um Reisen zu buchen.</rbr>`,
        domainSelector: {
            title: 'Domain',
            subtitle: 'Wähle eine Domain für die Expensify Travel-Einrichtung.',
            recommended: 'Empfohlen',
        },
        domainPermissionInfo: {
            title: 'Domain',
            restriction: (domain: string) =>
                `Sie haben keine Berechtigung, Expensify Travel für die Domain <strong>${domain}</strong> zu aktivieren. Bitten Sie stattdessen jemanden aus dieser Domain, Travel zu aktivieren.`,
            accountantInvitation: `Wenn Sie Buchhalter:in sind, sollten Sie dem <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved!-Programm für Buchhalter:innen</a> beitreten, um Reisen für diese Domain zu aktivieren.`,
        },
        publicDomainError: {
            title: 'Starte mit Expensify Travel',
            message: `Du musst für Expensify Travel deine geschäftliche E-Mail-Adresse (z. B. name@company.com) verwenden, nicht deine private E-Mail-Adresse (z. B. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel wurde deaktiviert',
            message: `Ihre*e Admin* hat Expensify Travel deaktiviert. Bitte halten Sie sich bei Reisebuchungen an die Reiserichtlinie Ihres Unternehmens.`,
        },
        verifyCompany: {
            title: 'Wir prüfen Ihre Anfrage …',
            message: `Wir führen ein paar Prüfungen auf unserer Seite durch, um zu bestätigen, dass dein Konto für Expensify Travel bereit ist. Wir melden uns in Kürze bei dir!`,
            confirmText: 'Verstanden',
            conciergeMessage: ({domain}: {domain: string}) => `Reiseaktivierung für die Domain ${domain} fehlgeschlagen. Bitte überprüfe diese Domain und aktiviere Reisen dafür.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde gebucht. Bestätigungscode: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Ticket für den Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde storniert.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Ticket für den Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde erstattet oder umgebucht.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate}} wurde von der Fluggesellschaft storniert.`,
            flightScheduleChangePending: (airlineCode: string) => `Die Fluggesellschaft hat eine Flugplanänderung für Flug ${airlineCode} vorgeschlagen; wir warten auf die Bestätigung.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Änderung des Flugplans bestätigt: Flug ${airlineCode} startet jetzt um ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde aktualisiert.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Ihre Reiseklasse wurde auf ${cabinClass} auf Flug ${airlineCode} aktualisiert.`,
            flightSeatConfirmed: (airlineCode: string) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde bestätigt.`,
            flightSeatChanged: (airlineCode: string) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde geändert.`,
            flightSeatCancelled: (airlineCode: string) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde entfernt.`,
            paymentDeclined: 'Die Zahlung für Ihre Flugbuchung ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Du hast deine ${type}-Reservierung ${id} storniert.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Der Anbieter hat deine ${type}-Reservierung ${id} storniert.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Ihre ${type}-Reservierung wurde erneut gebucht. Neue Bestätigungsnummer: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Ihre ${type}-Buchung wurde aktualisiert. Prüfen Sie die neuen Details in der Reiseroute.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Ihr Bahnticket von ${origin} nach ${destination} am ${startDate} wurde erstattet. Eine Gutschrift wird bearbeitet.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Dein Bahnticket für ${origin} → ${destination} am ${startDate} wurde umgetauscht.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Dein Bahnticket für ${origin} → ${destination} am ${startDate} wurde aktualisiert.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Ihre ${type}-Reservierung wurde aktualisiert.`,
        },
        flightTo: 'Flug nach',
        trainTo: 'Zug nach',
        carRental: 'Autovermietung',
        nightIn: 'Nacht in',
        nightsIn: 'Nächte in',
    },
    workspace: {
        common: {
            card: 'Karten',
            expensifyCard: 'Expensify Card',
            companyCards: 'Firmenkarten',
            workflows: 'Workflows',
            workspace: 'Arbeitsbereich',
            findWorkspace: 'Workspace suchen',
            edit: 'Arbeitsbereich bearbeiten',
            enabled: 'Aktiviert',
            disabled: 'Deaktiviert',
            everyone: 'Alle',
            delete: 'Workspace löschen',
            settings: 'Einstellungen',
            reimburse: 'Erstattungen',
            categories: 'Kategorien',
            tags: 'Tags',
            customField1: 'Benutzerdefiniertes Feld 1',
            customField2: 'Benutzerdefiniertes Feld 2',
            customFieldHint: 'Füge benutzerdefinierte Codierung hinzu, die für alle Ausgaben dieses Mitglieds gilt.',
            reports: 'Berichte',
            reportFields: 'Berichtsfelder',
            reportTitle: 'Berichtstitel',
            reportField: 'Berichts­feld',
            taxes: 'Steuern',
            bills: 'Rechnungen',
            invoices: 'Rechnungen',
            perDiem: 'Tagespauschale',
            travel: 'Reisen',
            members: 'Mitglieder',
            accounting: 'Buchhaltung',
            receiptPartners: 'Belegpartner',
            rules: 'Regeln',
            displayedAs: 'Angezeigt als',
            plan: 'Plan',
            profile: 'Übersicht',
            bankAccount: 'Bankkonto',
            testTransactions: 'Testtransaktionen',
            issueAndManageCards: 'Karten ausgeben und verwalten',
            reconcileCards: 'Karten abstimmen',
            selectAll: 'Alle auswählen',
            selected: () => ({
                one: '1 ausgewählt',
                other: (count: number) => `${count} ausgewählt`,
            }),
            settlementFrequency: 'Auszahlungsfrequenz',
            setAsDefault: 'Als Standard-Arbeitsbereich festlegen',
            defaultNote: `Belege, die an ${CONST.EMAIL.RECEIPTS} gesendet werden, erscheinen in diesem Workspace.`,
            deleteConfirmation: 'Möchtest du diesen Workspace wirklich löschen?',
            deleteWithCardsConfirmation: 'Möchtest du diesen Workspace wirklich löschen? Dadurch werden alle Kartenfeeds und zugewiesenen Karten entfernt.',
            unavailable: 'Arbeitsbereich nicht verfügbar',
            memberNotFound: 'Mitglied nicht gefunden. Um ein neues Mitglied in den Workspace einzuladen, verwende bitte die Einladungsschaltfläche oben.',
            notAuthorized: `Du hast keinen Zugriff auf diese Seite. Wenn du versuchst, diesem Workspace beizutreten, bitte einfach den Workspace-Inhaber, dich als Mitglied hinzuzufügen. Etwas anderes? Wende dich an ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Zum Arbeitsbereich',
            duplicateWorkspace: 'Arbeitsbereich duplizieren',
            duplicateWorkspacePrefix: 'Duplizieren',
            goToWorkspaces: 'Zu Arbeitsbereichen',
            clearFilter: 'Filter löschen',
            workspaceName: 'Workspace-Name',
            workspaceOwner: 'Eigentümer',
            workspaceType: 'Arbeitsbereichstyp',
            workspaceAvatar: 'Arbeitsbereichsavatar',
            mustBeOnlineToViewMembers: 'Sie müssen online sein, um die Mitglieder dieses Arbeitsbereichs anzeigen zu können.',
            moreFeatures: 'Mehr Funktionen',
            requested: 'Angefordert',
            distanceRates: 'Entfernungssätze',
            defaultDescription: 'Ein zentraler Ort für alle deine Belege und Ausgaben.',
            descriptionHint: 'Informationen zu diesem Workspace mit allen Mitgliedern teilen.',
            welcomeNote: 'Bitte nutze Expensify, um deine Belege zur Erstattung einzureichen, danke!',
            subscription: 'Abonnement',
            markAsEntered: 'Als manuell eingegeben markieren',
            markAsExported: 'Als exportiert markieren',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Export nach ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Lass uns zur Sicherheit noch einmal prüfen, ob alles richtig aussieht.',
            lineItemLevel: 'Positionsebene',
            reportLevel: 'Berichtsebene',
            topLevel: 'Oberste Ebene',
            appliedOnExport: 'Nicht in Expensify importiert, beim Export angewendet',
            shareNote: {
                header: 'Teile deinen Arbeitsbereich mit anderen Mitgliedern',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Teile diesen QR-Code oder kopiere den Link unten, damit Mitglieder einfach Zugriff auf deinen Workspace anfordern können. Alle Beitrittsanfragen zum Workspace werden zur Überprüfung im Raum <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> angezeigt.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Verknüpfen mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Neue Verbindung erstellen',
            reuseExistingConnection: 'Vorhandene Verbindung wiederverwenden',
            existingConnections: 'Bestehende Verbindungen',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Da du zuvor schon eine Verbindung zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} hergestellt hast, kannst du eine bestehende Verbindung wiederverwenden oder eine neue erstellen.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} – Zuletzt synchronisiert am ${formattedDate}`,
            authenticationError: (connectionName: string) => `Verbindung mit ${connectionName} aufgrund eines Authentifizierungsfehlers nicht möglich.`,
            learnMore: 'Erfahre mehr',
            memberAlternateText: 'Berichte einreichen und genehmigen.',
            adminAlternateText: 'Berichte und Workspace-Einstellungen verwalten.',
            auditorAlternateText: 'Berichte anzeigen und kommentieren.',
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
            youCantDowngradeInvoicing:
                'Du kannst dein Abo bei einer Rechnungslizenz nicht herabstufen. Wende dich an deine*n Account Manager*in oder an Concierge, um deine Aboeinstellungen zu besprechen oder zu ändern.',
            defaultCategory: 'Standardkategorie',
            viewTransactions: 'Transaktionen anzeigen',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Spesen von ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card-Transaktionen werden mit <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">unserer Integration</a> automatisch in ein „Expensify Card Liability Account“ exportiert, das dafür erstellt wird.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Verbunden mit ${organizationName}` : 'Automatisieren Sie Reise- und Essenslieferungskosten in Ihrem gesamten Unternehmen.',
                sendInvites: 'Einladungen senden',
                sendInvitesDescription: 'Diese Arbeitsbereichsmitglieder haben noch kein Uber for Business-Konto. Wähle alle Mitglieder ab, die du derzeit nicht einladen möchtest.',
                confirmInvite: 'Einladung bestätigen',
                manageInvites: 'Einladungen verwalten',
                confirm: 'Bestätigen',
                allSet: 'Alles erledigt',
                readyToRoll: 'Du bist startklar',
                takeBusinessRideMessage: 'Mach eine Geschäfts­fahrt und deine Uber-Belege werden in Expensify importiert. Los geht’s!',
                all: 'Alle',
                linked: 'Verknüpft',
                outstanding: 'Ausstehend',
                status: {
                    resend: 'Erneut senden',
                    invite: 'Einladen',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Verknüpft',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'Ausstehend',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Ausgesetzt',
                },
                centralBillingAccount: 'Zentrales Abrechnungskonto',
                centralBillingDescription: 'Wähle aus, wohin alle Uber-Belege importiert werden sollen.',
                invitationFailure: 'Mitglied konnte nicht zu Uber for Business eingeladen werden',
                autoInvite: 'Neue Arbeitsbereichsmitglieder zu Uber for Business einladen',
                autoRemove: 'Entfernte Arbeitsbereichsmitglieder in Uber for Business deaktivieren',
                emptyContent: {
                    title: 'Keine ausstehenden Einladungen',
                    subtitle: 'Hurra! Wir haben überall nachgesehen und keine ausstehenden Einladungen gefunden.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Lege Pauschalspesensätze fest, um die täglichen Ausgaben von Mitarbeitenden zu steuern. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Mehr erfahren</a>.</muted-text>`,
            amount: 'Betrag',
            deleteRates: () => ({
                one: 'Satz löschen',
                other: 'Tarife löschen',
            }),
            deletePerDiemRate: 'Tagespauschale löschen',
            findPerDiemRate: 'Tagespauschale finden',
            areYouSureDelete: () => ({
                one: 'Sind Sie sicher, dass Sie diesen Satz löschen möchten?',
                other: 'Möchtest du diese Sätze wirklich löschen?',
            }),
            emptyList: {
                title: 'Tagespauschale',
                subtitle: 'Legen Sie Pauschalbeträge fest, um die täglichen Ausgaben von Mitarbeitenden zu steuern. Importieren Sie die Sätze aus einer Tabellenkalkulation, um zu beginnen.',
            },
            importPerDiemRates: 'Pauschalspesensätze importieren',
            editPerDiemRate: 'Tagessatz bearbeiten',
            editPerDiemRates: 'Pauschalspesen-Sätze bearbeiten',
            editDestinationSubtitle: (destination: string) => `Wenn Sie dieses Ziel aktualisieren, wird es für alle ${destination}-Tagespauschalen-Unterraten geändert.`,
            editCurrencySubtitle: (destination: string) => `Wenn Sie diese Währung aktualisieren, wird sie für alle ${destination}-Tagessatz-Teilbeträge geändert.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie Auslagen in QuickBooks Desktop exportiert werden.',
            exportOutOfPocketExpensesCheckToggle: 'Schecks als „später drucken“ markieren',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach QuickBooks Desktop exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Card-Transaktionen exportieren als',
            account: 'Konto',
            accountDescription: 'Wählen Sie aus, wo Buchungszeilen gebucht werden sollen.',
            accountsPayable: 'Verbindlichkeiten aus Lieferungen und Leistungen',
            accountsPayableDescription: 'Wählen Sie, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wähle aus, von wo Schecks gesendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwende dieses Datum beim Exportieren von Berichten nach QuickBooks Desktop.',
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
            exportCheckDescription: 'Wir erstellen für jeden Expensify-Bericht einen Einzelposten-Scheck und senden ihn von dem untenstehenden Bankkonto.',
            exportJournalEntryDescription: 'Wir erstellen für jeden Expensify-Bericht einen detaillierten Buchungssatz und buchen ihn auf das untenstehende Konto.',
            exportVendorBillDescription:
                'Wir erstellen eine aufgeschlüsselte Lieferantenrechnung für jeden Expensify-Bericht und fügen sie dem unten stehenden Konto hinzu. Wenn dieser Zeitraum abgeschlossen ist, buchen wir auf den 1. des nächsten offenen Zeitraums.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop unterstützt keine Steuern beim Export von Buchungsjournalen. Da in deinem Workspace Steuern aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Buchungsjournale sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Buchungsjournal',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Scheck',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Wir erstellen für jeden Expensify-Bericht einen Einzelposten-Scheck und senden ihn von dem untenstehenden Bankkonto.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Kreditkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Falls keine Lieferanten vorhanden sind, erstellen wir zur Zuordnung einen „Credit Card Misc.“-Lieferanten.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung mit dem Datum der letzten Ausgabe und fügen sie dem untenstehenden Konto hinzu. Ist dieser Zeitraum abgeschlossen, buchen wir auf den 1. Tag des nächsten offenen Zeitraums.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wählen Sie, wohin Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Wähle einen Lieferanten aus, der auf alle Kreditkartentransaktionen angewendet wird.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Wähle aus, von wo Schecks gesendet werden sollen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Buchungsjournale sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Fügen Sie das Konto in QuickBooks Desktop hinzu und synchronisieren Sie die Verbindung erneut',
            qbdSetup: 'QuickBooks Desktop-Einrichtung',
            requiredSetupDevice: {
                title: 'Verbindung von diesem Gerät nicht möglich',
                body1: 'Sie müssen diese Verbindung von dem Computer aus einrichten, auf dem Ihre QuickBooks Desktop-Firmendatei gespeichert ist.',
                body2: 'Sobald du verbunden bist, kannst du von überall synchronisieren und exportieren.',
            },
            setupPage: {
                title: 'Öffne diesen Link, um die Verbindung herzustellen',
                body: 'Um die Einrichtung abzuschließen, öffne den folgenden Link auf dem Computer, auf dem QuickBooks Desktop ausgeführt wird.',
                setupErrorTitle: 'Etwas ist schiefgelaufen',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>Die Verbindung zu QuickBooks Desktop funktioniert im Moment nicht. Bitte versuche es später erneut oder <a href="${conciergeLink}">kontaktiere Concierge</a>, falls das Problem weiterhin besteht.</centered-text></muted-text>`,
            },
            importDescription: 'Wählen Sie aus, welche Kontierungskonfigurationen aus QuickBooks Desktop nach Expensify importiert werden sollen.',
            classes: 'Klassen',
            items: 'Posten',
            customers: 'Kunden/Projekte',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Firmenkarteneinkäufe nach QuickBooks Desktop exportiert werden.',
            defaultVendorDescription: 'Lege einen Standardanbieter fest, der beim Export auf alle Kreditkartentransaktionen angewendet wird.',
            accountsDescription: 'Ihr QuickBooks Desktop-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            classesDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Klassen in Expensify behandelt werden sollen.',
            tagsDisplayedAsDescription: 'Positionsebene',
            reportFieldsDisplayedAsDescription: 'Berichtsebene',
            customersDescription: 'Wähle, wie QuickBooks Desktop-Kunden/Projekte in Expensify behandelt werden sollen.',
            advancedConfig: {
                autoSyncDescription: 'Expensify synchronisiert sich jeden Tag automatisch mit QuickBooks Desktop.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription: 'Expensify erstellt in QuickBooks Desktop automatisch Lieferanten, falls diese noch nicht vorhanden sind.',
            },
            itemsDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Artikel in Expensify behandelt werden sollen.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach der endgültigen Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagenerstattungen werden beim Bezahlen exportiert',
                },
            },
        },
        qbo: {
            connectedTo: 'Verbunden mit',
            importDescription: 'Wählen Sie aus, welche Kodierungskonfigurationen aus QuickBooks Online nach Expensify importiert werden sollen.',
            classes: 'Klassen',
            locations: 'Standorte',
            customers: 'Kunden/Projekte',
            accountsDescription: 'Ihr QuickBooks Online-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            classesDescription: 'Wählen Sie aus, wie QuickBooks Online-Klassen in Expensify behandelt werden sollen.',
            customersDescription: 'Wähle aus, wie QuickBooks Online-Kunden/Projekte in Expensify behandelt werden sollen.',
            locationsDescription: 'Wählen Sie aus, wie QuickBooks Online-Standorte in Expensify behandelt werden sollen.',
            taxesDescription: 'Wählen Sie aus, wie QuickBooks Online-Steuern in Expensify behandelt werden sollen.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online unterstützt Standorte auf Zeilenebene nicht für Schecks oder Lieferantenrechnungen. Wenn Sie Standorte auf Zeilenebene verwenden möchten, stellen Sie sicher, dass Sie Buchungsjournaleinträge und Kredit-/Debitkartenausgaben verwenden.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online unterstützt keine Steuern bei Journalbuchungen. Bitte ändere deine Exportoption auf Lieferantenrechnung oder Scheck.',
            exportDescription: 'Konfigurieren, wie Expensify-Daten nach QuickBooks Online exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Card-Transaktionen exportieren als',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwende dieses Datum beim Exportieren von Berichten nach QuickBooks Online.',
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
            receivable: 'Forderungen aus Lieferungen und Leistungen',
            archive: 'Archiv Forderungen aus Lieferungen und Leistungen',
            exportInvoicesDescription: 'Verwenden Sie dieses Konto beim Exportieren von Rechnungen nach QuickBooks Online.',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Firmenkarteneinkäufe nach QuickBooks Online exportiert werden.',
            vendor: 'Lieferant',
            defaultVendorDescription: 'Lege einen Standardanbieter fest, der beim Export auf alle Kreditkartentransaktionen angewendet wird.',
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie aus der eigenen Tasche bezahlte Ausgaben nach QuickBooks Online exportiert werden.',
            exportCheckDescription: 'Wir erstellen für jeden Expensify-Bericht einen Einzelposten-Scheck und senden ihn von dem untenstehenden Bankkonto.',
            exportJournalEntryDescription: 'Wir erstellen für jeden Expensify-Bericht einen detaillierten Buchungssatz und buchen ihn auf das untenstehende Konto.',
            exportVendorBillDescription:
                'Wir erstellen eine aufgeschlüsselte Lieferantenrechnung für jeden Expensify-Bericht und fügen sie dem unten stehenden Konto hinzu. Wenn dieser Zeitraum abgeschlossen ist, buchen wir auf den 1. des nächsten offenen Zeitraums.',
            account: 'Konto',
            accountDescription: 'Wählen Sie aus, wo Buchungszeilen gebucht werden sollen.',
            accountsPayable: 'Verbindlichkeiten aus Lieferungen und Leistungen',
            accountsPayableDescription: 'Wählen Sie, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wähle aus, von wo Schecks gesendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online unterstützt keine Standorte beim Export von Lieferantenrechnungen. Da in deinem Arbeitsbereich Standorte aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online unterstützt keine Steuern beim Export von Buchungssätzen. Da du Steuern in deinem Workspace aktiviert hast, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Buchungsjournale sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit QuickBooks Online synchronisiert.',
                inviteEmployees: 'Mitarbeitende einladen',
                inviteEmployeesDescription: 'QuickBooks Online-Mitarbeiterdatensätze importieren und Mitarbeitende zu diesem Workspace einladen.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription:
                    'Expensify erstellt automatisch Lieferanten in QuickBooks Online, wenn diese noch nicht vorhanden sind, und legt beim Exportieren von Rechnungen automatisch Kunden an.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden QuickBooks Online-Konto erstellt.',
                qboBillPaymentAccount: 'QuickBooks-Rechnungskonto',
                qboInvoiceCollectionAccount: 'QuickBooks-Konto für Rechnungseingänge',
                accountSelectDescription: 'Wählen Sie, von wo aus Sie Rechnungen bezahlen möchten, und wir erstellen die Zahlung in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wählen Sie aus, wo Sie Zahlungen für Rechnungen erhalten möchten, und wir erstellen die Zahlung in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Debitkarte',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Buchungsjournal',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Scheck',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Debitkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Wenn keine Lieferanten vorhanden sind, erstellen wir einen „Debit Card Misc.“-Lieferanten zur Zuordnung.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Kreditkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Falls keine Lieferanten vorhanden sind, erstellen wir zur Zuordnung einen „Credit Card Misc.“-Lieferanten.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung mit dem Datum der letzten Ausgabe und fügen sie dem untenstehenden Konto hinzu. Ist dieser Zeitraum abgeschlossen, buchen wir auf den 1. Tag des nächsten offenen Zeitraums.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Wählen Sie aus, wohin Debitkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wählen Sie, wohin Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wähle einen Lieferanten aus, der auf alle Kreditkartentransaktionen angewendet wird.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Buchungsjournale sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Wähle ein gültiges Konto für den Lieferantenrechnungs-Export',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wähle ein gültiges Konto für den Export von Buchungsjournalen aus',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Wähle ein gültiges Konto für den Scheckexport',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Um den Export von Lieferantenrechnungen zu verwenden, richte in QuickBooks Online ein Kreditorenkonto ein',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Um den Export von Journalbuchungen zu verwenden, richte ein Journal­konto in QuickBooks Online ein',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Um den Scheckexport zu verwenden, richte ein Bankkonto in QuickBooks Online ein',
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Fügen Sie das Konto in QuickBooks Online hinzu und synchronisieren Sie die Verbindung erneut.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach der endgültigen Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagenerstattungen werden beim Bezahlen exportiert',
                },
            },
        },
        workspaceList: {
            joinNow: 'Jetzt beitreten',
            askToJoin: 'Beitritt anfragen',
        },
        xero: {
            organization: 'Xero-Organisation',
            organizationDescription: 'Wähle die Xero-Organisation aus, aus der du Daten importieren möchtest.',
            importDescription: 'Wähle aus, welche Kodierungskonfigurationen aus Xero in Expensify importiert werden sollen.',
            accountsDescription: 'Ihr Xero-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            trackingCategories: 'Verfolgungskategorien',
            trackingCategoriesDescription: 'Wähle aus, wie Xero-Trackingkategorien in Expensify behandelt werden sollen.',
            mapTrackingCategoryTo: (categoryName: string) => `Xero-Kategorie ${categoryName} zuordnen zu`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Wähle aus, wohin ${categoryName} beim Export nach Xero zugeordnet werden soll.`,
            customers: 'Kunden erneut in Rechnung stellen',
            customersDescription:
                'Wähle, ob Kund:innen in Expensify erneut abgerechnet werden sollen. Deine Xero-Kundenkontakte können Ausgaben zugeordnet werden und werden als Verkaufsrechnung nach Xero exportiert.',
            taxesDescription: 'Wähle aus, wie Xero-Steuern in Expensify behandelt werden sollen.',
            notImported: 'Nicht importiert',
            notConfigured: 'Nicht konfiguriert',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero-Kontaktstandard',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Berichtsfelder',
            },
            exportDescription: 'Konfiguriere, wie Expensify-Daten nach Xero exportiert werden.',
            purchaseBill: 'Einkaufsrechnung',
            exportDeepDiveCompanyCard:
                'Exportierte Ausgaben werden als Banktransaktionen auf das unten angegebene Xero-Bankkonto gebucht, und die Transaktionsdaten entsprechen den Daten auf Ihrem Kontoauszug.',
            bankTransactions: 'Banktransaktionen',
            xeroBankAccount: 'Xero-Bankkonto',
            xeroBankAccountDescription: 'Wähle aus, wo Spesen als Banktransaktionen verbucht werden.',
            exportExpensesDescription: 'Berichte werden als Einkaufsrechnung mit dem unten ausgewählten Datum und Status exportiert.',
            purchaseBillDate: 'Einkaufsrechnungsdatum',
            exportInvoices: 'Rechnungen exportieren als',
            salesInvoice: 'Verkaufsrechnung',
            exportInvoicesDescription: 'Verkaufsrechnungen zeigen immer das Datum an, an dem die Rechnung versendet wurde.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit Xero synchronisiert.',
                purchaseBillStatusTitle: 'Status der Einkaufsrechnung',
                reimbursedReportsDescription: 'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im Xero-Konto unten erstellt.',
                xeroBillPaymentAccount: 'Xero-Rechnungskonto',
                xeroInvoiceCollectionAccount: 'Xero-Forderungskonto für Rechnungen',
                xeroBillPaymentAccountDescription: 'Wählen Sie, von wo aus Rechnungen bezahlt werden sollen, und wir erstellen die Zahlung in Xero.',
                invoiceAccountSelectorDescription: 'Wähle, wohin Rechnungzahlungen empfangen werden sollen, und wir erstellen die Zahlung in Xero.',
            },
            exportDate: {
                label: 'Einkaufsrechnungsdatum',
                description: 'Verwende dieses Datum beim Exportieren von Berichten nach Xero.',
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
                label: 'Status der Einkaufsrechnung',
                description: 'Verwenden Sie diesen Status beim Export von Einkaufsrechnungen nach Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Entwurf',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Ausstehende Genehmigung',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Zahlung ausstehend',
                },
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Bitte fügen Sie das Konto in Xero hinzu und synchronisieren Sie die Verbindung erneut',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach der endgültigen Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagenerstattungen werden beim Bezahlen exportiert',
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
                description: 'Legen Sie fest, wie aus eigener Tasche bezahlte Ausgaben nach Sage Intacct exportiert werden.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Spesenabrechnungen',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Lieferantenrechnungen',
                },
            },
            nonReimbursableExpenses: {
                description: 'Legen Sie fest, wie Einkäufe mit Firmenkarten nach Sage Intacct exportiert werden.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Kreditkarten',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Lieferantenrechnungen',
                },
            },
            creditCardAccount: 'Kreditkartenkonto',
            defaultVendor: 'Standardanbieter',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Legen Sie einen Standardlieferanten fest, der auf ${isReimbursable ? '' : 'nicht-'}erstattungsfähige Ausgaben angewendet wird, für die es in Sage Intacct keinen passenden Lieferanten gibt.`,
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach Sage Intacct exportiert werden.',
            exportPreferredExporterNote:
                'Der bevorzugte Exporteur kann jede Workspace-Administration sein, muss aber auch Domain-Administrator*in sein, wenn du in den Domaineinstellungen unterschiedliche Exportkonten für einzelne Firmenkarten festlegst.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur in seinem Konto Berichte zum Export.',
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: `Bitte fügen Sie das Konto in Sage Intacct hinzu und synchronisieren Sie die Verbindung erneut`,
            autoSync: 'Automatische Synchronisierung',
            autoSyncDescription: 'Expensify wird jeden Tag automatisch mit Sage Intacct synchronisiert.',
            inviteEmployees: 'Mitarbeitende einladen',
            inviteEmployeesDescription:
                'Importieren Sie Sage Intacct-Mitarbeiterdaten und laden Sie Mitarbeitende in diesen Workspace ein. Ihr Genehmigungs-Workflow ist standardmäßig auf Genehmigung durch die/den Vorgesetzte:n eingestellt und kann auf der Seite „Mitglieder“ weiter konfiguriert werden.',
            syncReimbursedReports: 'Erstattete Berichte synchronisieren',
            syncReimbursedReportsDescription:
                'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im folgenden Sage-Intacct-Konto erstellt.',
            paymentAccount: 'Sage Intacct-Zahlungskonto',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach der endgültigen Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagenerstattungen werden beim Bezahlen exportiert',
                },
            },
        },
        netsuite: {
            subsidiary: 'Tochtergesellschaft',
            subsidiarySelectDescription: 'Wähle die Tochtergesellschaft in NetSuite aus, aus der du Daten importieren möchtest.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach NetSuite exportiert werden.',
            exportInvoices: 'Rechnungen exportieren nach',
            journalEntriesTaxPostingAccount: 'Steuerbuchungskonto für Journalbuchungen',
            journalEntriesProvTaxPostingAccount: 'Buchungszeilen Konto für Provinzsteuerbuchung',
            foreignCurrencyAmount: 'Betrag in Fremdwährung exportieren',
            exportToNextOpenPeriod: 'In nächste offene Periode exportieren',
            nonReimbursableJournalPostingAccount: 'Nicht erstattungsfähiges Buchungskonto',
            reimbursableJournalPostingAccount: 'Erstattungsfähiges Konto für Journalbuchungen',
            journalPostingPreference: {
                label: 'Buchungspräferenz für Journalbuchungen',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Einzelner, aufgeschlüsselter Eintrag für jeden Bericht',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Einzelner Eintrag für jede Ausgabe',
                },
            },
            invoiceItem: {
                label: 'Rechnungsposition',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Erstelle eins für mich',
                        description: 'Wir erstellen beim Export eine „Expensify-Rechnungszeile“ für dich (falls noch keine vorhanden ist).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Vorhandenes auswählen',
                        description: 'Wir verknüpfen Rechnungen aus Expensify mit dem unten ausgewählten Element.',
                    },
                },
            },
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwende dieses Datum beim Exportieren von Berichten nach NetSuite.',
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
                        reimbursableDescription: 'Auslagen aus eigener Tasche werden als Spesenberichte nach NetSuite exportiert.',
                        nonReimbursableDescription: 'Firmenkarten-Ausgaben werden als Spesenabrechnungen nach NetSuite exportiert.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Lieferantenrechnungen',
                        reimbursableDescription: dedent(`
                            Auslagen werden als Rechnungen exportiert, die an den unten angegebenen NetSuite-Lieferanten zahlbar sind.

                            Wenn du für jede Karte einen bestimmten Lieferanten festlegen möchtest, gehe zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Firmenkarten-Ausgaben werden als Rechnungen exportiert, die an den unten angegebenen NetSuite-Lieferanten zahlbar sind.

                            Wenn du für jede Karte einen bestimmten Lieferanten festlegen möchtest, gehe zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Buchungssätze',
                        reimbursableDescription: dedent(`
                            Auslagen werden als Buchungssätze auf das unten angegebene NetSuite-Konto exportiert.

                            Wenn du für jede Karte einen bestimmten Lieferanten festlegen möchtest, gehe zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Spesen von Firmenkarten werden als Buchungssätze in das unten angegebene NetSuite-Konto exportiert.

                            Wenn du für jede Karte einen bestimmten Lieferanten festlegen möchtest, gehe zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Wenn du die Export-Einstellung für Firmenkarten auf Spesenberichte umstellst, werden NetSuite-Lieferant:innen und Buchungskonten für einzelne Karten deaktiviert.\n\nKeine Sorge, wir speichern deine bisherigen Auswahloptionen, falls du später wieder zurückwechseln möchtest.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit NetSuite synchronisiert.',
                reimbursedReportsDescription: 'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im folgenden NetSuite-Konto erstellt.',
                reimbursementsAccount: 'Erstattungskonto',
                reimbursementsAccountDescription: 'Wähle das Bankkonto, das du für Rückerstattungen verwenden möchtest, und wir erstellen die zugehörige Zahlung in NetSuite.',
                collectionsAccount: 'Inkassokonto',
                collectionsAccountDescription: 'Sobald eine Rechnung in Expensify als bezahlt markiert und nach NetSuite exportiert wurde, wird sie dem untenstehenden Konto zugeordnet.',
                approvalAccount: 'Kreditorengenehmigungskonto',
                approvalAccountDescription:
                    'Wählen Sie das Konto aus, dem Transaktionen in NetSuite gutgeschrieben werden. Wenn Sie erstattete Berichte synchronisieren, ist dies auch das Konto, gegen das Rechnungszahlungen erstellt werden.',
                defaultApprovalAccount: 'NetSuite-Standard',
                inviteEmployees: 'Mitarbeitende einladen und Genehmigungen festlegen',
                inviteEmployeesDescription:
                    'Importiere NetSuite-Mitarbeiterdatensätze und lade Mitarbeitende in diesen Workspace ein. Dein Genehmigungsworkflow ist standardmäßig auf Managergenehmigung eingestellt und kann auf der Seite *Mitglieder* weiter konfiguriert werden.',
                autoCreateEntities: 'Mitarbeiter/Lieferanten automatisch erstellen',
                enableCategories: 'Neu importierte Kategorien aktivieren',
                customFormID: 'Benutzerdefinierte Formular-ID',
                customFormIDDescription:
                    'Standardmäßig erstellt Expensify Buchungen mit dem in NetSuite festgelegten bevorzugten Transaktionsformular. Alternativ können Sie ein bestimmtes Transaktionsformular festlegen, das verwendet werden soll.',
                customFormIDReimbursable: 'Auslage',
                customFormIDNonReimbursable: 'Firmenkartenausgabe',
                exportReportsTo: {
                    label: 'Genehmigungsstufe für Spesenabrechnungen',
                    description:
                        'Sobald ein Spesenbericht in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Verbuchung eine zusätzliche Genehmigungsstufe einrichten.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Standardvorgabe für NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Nur von Aufsichtsperson genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Nur Buchhaltung genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Von Aufsicht und Buchhaltung genehmigt',
                    },
                },
                accountingMethods: {
                    label: 'Wann exportieren',
                    description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach der endgültigen Genehmigung exportiert',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagenerstattungen werden beim Bezahlen exportiert',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Genehmigungsstufe für Lieferantenrechnungen',
                    description:
                        'Sobald eine Lieferantenrechnung in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Verbuchung eine zusätzliche Genehmigungsstufe festlegen.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Standardvorgabe für NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zur Buchung freigegeben',
                    },
                },
                exportJournalsTo: {
                    label: 'Genehmigungsstufe für Buchungssätze',
                    description:
                        'Sobald ein Buchungsjournal in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Verbuchung eine weitere Genehmigungsstufe festlegen.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Standardvorgabe für NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Zur Buchung freigegeben',
                    },
                },
                error: {
                    customFormID: 'Bitte gib eine gültige numerische benutzerdefinierte Formular-ID ein',
                },
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Bitte füge das Konto in NetSuite hinzu und synchronisiere die Verbindung erneut',
            noVendorsFound: 'Keine Anbieter gefunden',
            noVendorsFoundDescription: 'Bitte fügen Sie Lieferanten in NetSuite hinzu und synchronisieren Sie die Verbindung erneut',
            noItemsFound: 'Keine Rechnungspositionen gefunden',
            noItemsFoundDescription: 'Bitte fügen Sie die Rechnungspositionen in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noSubsidiariesFound: 'Keine Tochtergesellschaften gefunden',
            noSubsidiariesFoundDescription: 'Bitte fügen Sie eine Tochtergesellschaft in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            tokenInput: {
                title: 'NetSuite-Einrichtung',
                formSteps: {
                    installBundle: {
                        title: 'Installiere das Expensify-Paket',
                        description: 'Gehe in NetSuite zu *Customization > SuiteBundler > Search & Install Bundles* > suche nach „Expensify“ > installiere das Bundle.',
                    },
                    enableTokenAuthentication: {
                        title: 'Tokenbasierte Authentifizierung aktivieren',
                        description: 'Gehe in NetSuite zu *Setup > Company > Enable Features > SuiteCloud* und aktiviere *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'SOAP-Webdienste aktivieren',
                        description: 'Wechsel in NetSuite zu *Setup > Company > Enable Features > SuiteCloud* und aktiviere *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Zugriffstoken erstellen',
                        description:
                            'Wechsle in NetSuite zu *Setup > Users/Roles > Access Tokens* und erstelle ein Zugriffstoken für die App „Expensify“ und entweder die Rolle „Expensify Integration“ oder „Administrator“.\n\n*Wichtig:* Stelle sicher, dass du die *Token ID* und das *Token Secret* aus diesem Schritt speicherst. Du benötigst sie für den nächsten Schritt.',
                    },
                    enterCredentials: {
                        title: 'Gib deine NetSuite-Zugangsdaten ein',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite-Konto-ID',
                            netSuiteTokenID: 'Token-ID',
                            netSuiteTokenSecret: 'Tokengeheimnis',
                        },
                        netSuiteAccountIDDescription: 'Gehen Sie in NetSuite zu *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Ausgabenkategorien',
                expenseCategoriesDescription: 'Ihre NetSuite-Spesenkategorien werden als Kategorien in Expensify importiert.',
                crossSubsidiaryCustomers: 'Unternehmensübergreifende Kunden/Projekte',
                importFields: {
                    departments: {
                        title: 'Abteilungen',
                        subtitle: 'Wähle aus, wie die NetSuite-*Abteilungen* in Expensify behandelt werden sollen.',
                    },
                    classes: {
                        title: 'Klassen',
                        subtitle: 'Wähle, wie *Klassen* in Expensify behandelt werden sollen.',
                    },
                    locations: {
                        title: 'Standorte',
                        subtitle: 'Wähle, wie du *Standorte* in Expensify verwalten möchtest.',
                    },
                },
                customersOrJobs: {
                    title: 'Kunden/Projekte',
                    subtitle: 'Wählen Sie aus, wie NetSuite-*Kunden* und *Projekte* in Expensify verarbeitet werden sollen.',
                    importCustomers: 'Kunden importieren',
                    importJobs: 'Projekte importieren',
                    customers: 'Kund:innen',
                    jobs: 'Projekte',
                    label: (importFields: string[], importType: string) => `${importFields.join('und')}, ${importType}`,
                },
                importTaxDescription: 'Steuergruppen aus NetSuite importieren.',
                importCustomFields: {
                    chooseOptionBelow: 'Wähle unten eine Option aus:',
                    label: (importedTypes: string[]) => `Importiert als ${importedTypes.join('und')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Bitte ${fieldName} eingeben`,
                    customSegments: {
                        title: 'Benutzerdefinierte Segmente/Datensätze',
                        addText: 'Benutzerdefinierten Abschnitt/Datensatz hinzufügen',
                        recordTitle: 'Benutzerdefinierter Segment/Datensatz',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Detaillierte Anweisungen anzeigen',
                        helpText: 'zur Konfiguration benutzerdefinierter Segmente/Datensätze.',
                        emptyTitle: 'Benutzerdefiniertes Segment oder benutzerdefinierten Datensatz hinzufügen',
                        fields: {
                            segmentName: 'Name',
                            internalID: 'Interne ID',
                            scriptID: 'Skript-ID',
                            customRecordScriptID: 'Transaktionsspalten-ID',
                            mapping: 'Angezeigt als',
                        },
                        removeTitle: 'Benutzerdefiniertes Segment/Datensatz entfernen',
                        removePrompt: 'Möchten Sie dieses benutzerdefinierte Segment/Objekt wirklich entfernen?',
                        addForm: {
                            customSegmentName: 'Benutzerdefinierter Segmentname',
                            customRecordName: 'benutzerdefinierter Datensatzname',
                            segmentTitle: 'Benutzerdefiniertes Segment',
                            customSegmentAddTitle: 'Benutzerdefinierten Abschnitt hinzufügen',
                            customRecordAddTitle: 'Benutzerdefinierten Datensatz hinzufügen',
                            recordTitle: 'Benutzerdefinierter Datensatz',
                            segmentRecordType: 'Möchten Sie ein benutzerdefiniertes Segment oder einen benutzerdefinierten Datensatz hinzufügen?',
                            customSegmentNameTitle: 'Wie lautet der Name des benutzerdefinierten Segments?',
                            customRecordNameTitle: 'Wie lautet der Name des benutzerdefinierten Datensatzes?',
                            customSegmentNameFooter: `Benutzerdefinierte Segmentnamen finden Sie in NetSuite auf der Seite *Customizations > Links, Records & Fields > Custom Segments*.

_Ausführlichere Anweisungen finden Sie auf unserer [Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})._`,
                            customRecordNameFooter: `Sie finden benutzerdefinierte Datensatznamen in NetSuite, indem Sie „Transaction Column Field“ in die globale Suche eingeben.

_Für ausführlichere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Wie lautet die interne ID?',
                            customSegmentInternalIDFooter: `Stelle zuerst sicher, dass du in NetSuite die internen IDs aktiviert hast unter *Home > Set Preferences > Show Internal ID.*

Du findest die internen IDs von benutzerdefinierten Segmenten in NetSuite unter:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klicke auf ein benutzerdefiniertes Segment.
3. Klicke auf den Hyperlink neben *Custom Record Type*.
4. Suche die interne ID in der Tabelle am unteren Rand.

_Für ausführlichere Anweisungen [besuche unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Sie finden die internen IDs benutzerdefinierter Datensätze in NetSuite, indem Sie wie folgt vorgehen:

1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.
2. Klicken Sie auf einen benutzerdefinierten Datensatz.
3. Suchen Sie die interne ID auf der linken Seite.

_Für ausführlichere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Wie lautet die Skript-ID?',
                            customSegmentScriptIDFooter: `Sie finden benutzerdefinierte Segment-Skript-IDs in NetSuite unter:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klicken Sie auf ein benutzerdefiniertes Segment.
3. Klicken Sie unten auf die Registerkarte *Application and Sourcing* und dann wie folgt:
    a. Wenn Sie das benutzerdefinierte Segment als *Tag* (auf Positionsebene) in Expensify anzeigen möchten, klicken Sie auf die Unterregisterkarte *Transaction Columns* und verwenden Sie die *Field ID*.
    b. Wenn Sie das benutzerdefinierte Segment als *Report Field* (auf Berichtsebene) in Expensify anzeigen möchten, klicken Sie auf die Unterregisterkarte *Transactions* und verwenden Sie die *Field ID*.

_Für ausführlichere Anleitungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})._`,
                            customRecordScriptIDTitle: 'Wie lautet die Transaktionsspalten-ID?',
                            customRecordScriptIDFooter: `Die Skript-IDs benutzerdefinierter Datensätze finden Sie in NetSuite unter:

1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.
2. Klicken Sie auf einen benutzerdefinierten Datensatz.
3. Suchen Sie die Skript-ID auf der linken Seite.

_Für eine ausführlichere Anleitung [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})._`,
                            customSegmentMappingTitle: 'Wie soll dieses benutzerdefinierte Segment in Expensify angezeigt werden?',
                            customRecordMappingTitle: 'Wie soll dieser benutzerdefinierte Datensatz in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Ein benutzerdefiniertes Segment/Datensatz mit dieser ${fieldName?.toLowerCase()} ist bereits vorhanden`,
                        },
                    },
                    customLists: {
                        title: 'Benutzerdefinierte Listen',
                        addText: 'Eigene Liste hinzufügen',
                        recordTitle: 'Benutzerdefinierte Liste',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Detaillierte Anweisungen anzeigen',
                        helpText: 'zur Konfiguration benutzerdefinierter Listen.',
                        emptyTitle: 'Benutzerdefinierte Liste hinzufügen',
                        fields: {
                            listName: 'Name',
                            internalID: 'Interne ID',
                            transactionFieldID: 'Transaktionsfeld-ID',
                            mapping: 'Angezeigt als',
                        },
                        removeTitle: 'Benutzerdefinierte Liste entfernen',
                        removePrompt: 'Möchtest du diese benutzerdefinierte Liste wirklich entfernen?',
                        addForm: {
                            listNameTitle: 'Benutzerdefinierte Liste auswählen',
                            transactionFieldIDTitle: 'Wie lautet die Transaktionsfeld-ID?',
                            transactionFieldIDFooter: `Sie finden die Transaktionsfeld-IDs in NetSuite, indem Sie die folgenden Schritte ausführen:

1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.
2. Klicken Sie auf eine benutzerdefinierte Liste.
3. Suchen Sie die Transaktionsfeld-ID auf der linken Seite.

_Für ausführlichere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Wie soll diese benutzerdefinierte Liste in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Eine benutzerdefinierte Liste mit dieser Transaktionsfeld-ID existiert bereits`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Standard-NetSuite-Mitarbeiter',
                        description: 'Nicht in Expensify importiert, beim Export angewendet',
                        footerContent: (importField: string) =>
                            `Wenn Sie ${importField} in NetSuite verwenden, wenden wir beim Export zu Spesenbericht oder Buchungsbeleg den auf dem Mitarbeitendendatensatz festgelegten Standard an.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'Positionsebene',
                        footerContent: (importField: string) =>
                            `${startCase(importField)} wird für jede einzelne Ausgabe im Bericht einer Mitarbeiterin oder eines Mitarbeiters auswählbar sein.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Berichtsfelder',
                        description: 'Berichtsebene',
                        footerContent: (importField: string) => `Die Auswahl ${startCase(importField)} gilt für alle Ausgaben im Bericht der Mitarbeiter*innen.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct-Konfiguration',
            prerequisitesTitle: 'Bevor du verbindest …',
            downloadExpensifyPackage: 'Lade das Expensify-Paket für Sage Intacct herunter',
            followSteps: 'Folge den Schritten in unserer Anleitung „How-to: Connect to Sage Intacct“',
            enterCredentials: 'Gib deine Sage Intacct-Zugangsdaten ein',
            entity: 'Entität',
            employeeDefault: 'Standardwerte für Sage Intacct-Mitarbeiter',
            employeeDefaultDescription: 'Die Standardabteilung der Mitarbeiter:innen wird auf ihre Ausgaben in Sage Intacct angewendet, sofern eine vorhanden ist.',
            displayedAsTagDescription: 'Die Abteilung kann für jede einzelne Ausgabe im Bericht eines Mitarbeitenden ausgewählt werden.',
            displayedAsReportFieldDescription: 'Die Abteilungsauswahl wird auf alle Ausgaben im Bericht eines Mitarbeiters angewendet.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Wähle aus, wie Sage Intacct-<strong>${mappingTitle}</strong> in Expensify behandelt werden soll.`,
            expenseTypes: 'Spesenarten',
            expenseTypesDescription: 'Ihre Sage Intacct-Spesenarten werden als Kategorien in Expensify importiert.',
            accountTypesDescription: 'Ihr Sage Intacct-Kontenplan wird als Kategorien in Expensify importiert.',
            importTaxDescription: 'Steuer auf Einkäufe aus Sage Intacct importieren.',
            userDefinedDimensions: 'Benutzerdefinierte Dimensionen',
            addUserDefinedDimension: 'Benutzerdefinierte Dimension hinzufügen',
            integrationName: 'Integrationsname',
            dimensionExists: 'Eine Dimension mit diesem Namen ist bereits vorhanden.',
            removeDimension: 'Benutzerdefinierte Dimension entfernen',
            removeDimensionPrompt: 'Sind Sie sicher, dass Sie diese benutzerdefinierte Dimension entfernen möchten?',
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
                        return 'Kund:innen';
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
            collect: 'Einziehen',
        },
        companyCards: {
            addCards: 'Karten hinzufügen',
            selectCards: 'Karten auswählen',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'Kartendaten konnten nicht geladen werden',
                workspaceFeedsCouldNotBeLoadedMessage: 'Beim Laden der Workspace-Kartenfeeds ist ein Fehler aufgetreten. Bitte versuche es erneut oder kontaktiere deine Verwaltung.',
                feedCouldNotBeLoadedTitle: 'Dieser Feed konnte nicht geladen werden',
                feedCouldNotBeLoadedMessage: 'Beim Laden dieses Feeds ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder wenden Sie sich an Ihre Administration.',
                tryAgain: 'Erneut versuchen',
            },
            addNewCard: {
                other: 'Sonstiges',
                cardProviders: {
                    gl1025: 'American Express Firmenkarten',
                    cdf: 'Mastercard Firmenkarten',
                    vcf: 'Visa Firmenkarten',
                    stripe: 'Stripe-Karten',
                },
                yourCardProvider: `Wer ist Ihr Kartenaussteller?`,
                whoIsYourBankAccount: 'Was ist Ihre Bank?',
                whereIsYourBankLocated: 'Wo befindet sich Ihre Bank?',
                howDoYouWantToConnect: 'Wie möchtest du eine Verbindung zu deiner Bank herstellen?',
                learnMoreAboutOptions: `<muted-text>Erfahren Sie mehr über diese <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">Optionen</a>.</muted-text>`,
                commercialFeedDetails:
                    'Erfordert eine Einrichtung mit Ihrer Bank. Dies wird typischerweise von größeren Unternehmen genutzt und ist oft die beste Option, sofern Sie dafür infrage kommen.',
                commercialFeedPlaidDetails: `Erfordert eine Einrichtung mit Ihrer Bank, aber wir führen Sie durch den Prozess. Dies ist in der Regel auf größere Unternehmen beschränkt.`,
                directFeedDetails: 'Der einfachste Ansatz. Verbinde dich sofort mit deinen Hauptzugangsdaten. Diese Methode ist am gebräuchlichsten.',
                enableFeed: {
                    title: (provider: string) => `Aktiviere deinen ${provider}-Feed`,
                    heading:
                        'Wir verfügen über eine direkte Integration mit Ihrem Kartenanbieter und können Ihre Transaktionsdaten schnell und zuverlässig in Expensify importieren.\n\nSo legen Sie los:',
                    visa: 'Wir haben globale Integrationen mit Visa, allerdings hängt die Verfügbarkeit von der Bank und dem Kartenprogramm ab.\n\nUm loszulegen, musst du nur Folgendes tun:',
                    mastercard: 'Wir verfügen über globale Integrationen mit Mastercard, allerdings variiert die Verfügbarkeit je nach Bank und Kartenprogramm.\n\nSo starten Sie einfach:',
                    vcf: `1. Lies dir [diesen Hilfeartikel](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) durch, um detaillierte Anweisungen zum Einrichten deiner Visa Commercial Cards zu erhalten.

2. [Kontaktiere deine Bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), um zu bestätigen, dass sie einen Commercial Feed für dein Programm unterstützt, und bitte sie, ihn zu aktivieren.

3. *Sobald der Feed aktiviert ist und du seine Details hast, fahre mit dem nächsten Bildschirm fort.*`,
                    gl1025: `1. Lies dir [diesen Hilfeartikel](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) durch, um herauszufinden, ob American Express für dein Programm einen Commercial Feed aktivieren kann.

2. Sobald der Feed aktiviert ist, sendet dir Amex ein Produktionsschreiben.

3. *Sobald du die Feed-Informationen hast, fahre mit dem nächsten Bildschirm fort.*`,
                    cdf: `1. Lies dir [diesen Hilfeartikel](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) für detaillierte Anweisungen zum Einrichten deiner Mastercard Commercial Cards durch.

2. [Kontaktiere deine Bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), um zu bestätigen, dass sie einen Commercial Feed für dein Programm unterstützt, und bitte sie, ihn zu aktivieren.

3. *Sobald der Feed aktiviert ist und du seine Details hast, fahre mit dem nächsten Bildschirm fort.*`,
                    stripe: `1. Öffne das Stripe-Dashboard und gehe zu [Einstellungen](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Klicke unter „Produktintegrationen“ auf „Aktivieren“ neben Expensify.

3. Sobald der Feed aktiviert ist, klicke unten auf „Senden“ und wir kümmern uns um das Hinzufügen.`,
                },
                whatBankIssuesCard: 'Welche Bank gibt diese Karten aus?',
                enterNameOfBank: 'Name der Bank eingeben',
                feedDetails: {
                    vcf: {
                        title: 'Wie lauten die Details des Visa-Feeds?',
                        processorLabel: 'Prozessor-ID',
                        bankLabel: 'Kennung des Finanzinstituts (Bank)',
                        companyLabel: 'Firmen-ID',
                        helpLabel: 'Wo finde ich diese IDs?',
                    },
                    gl1025: {
                        title: `Wie lautet der Name der Amex-Übertragungsdatei?`,
                        fileNameLabel: 'Name der Lieferdatei',
                        helpLabel: 'Wo finde ich den Namen der Lieferdatei?',
                    },
                    cdf: {
                        title: `Wie lautet die Mastercard-Verteilungs-ID?`,
                        distributionLabel: 'Verteilungs-ID',
                        helpLabel: 'Wo finde ich die Verteilungs-ID?',
                    },
                },
                amexCorporate: 'Wählen Sie dies aus, wenn auf der Vorderseite Ihrer Karten „Corporate“ steht',
                amexBusiness: 'Wählen Sie dies aus, wenn auf der Vorderseite Ihrer Karten „Business“ steht',
                amexPersonal: 'Wähle dies aus, wenn deine Karten privat sind',
                error: {
                    pleaseSelectProvider: 'Bitte wählen Sie vor dem Fortfahren einen Kartenanbieter aus',
                    pleaseSelectBankAccount: 'Bitte wähle ein Bankkonto aus, bevor du fortfährst',
                    pleaseSelectBank: 'Bitte wählen Sie vor dem Fortfahren ein Bankkonto aus',
                    pleaseSelectCountry: 'Bitte wähle ein Land aus, bevor du fortfährst',
                    pleaseSelectFeedType: 'Bitte wähle einen Feed-Typ aus, bevor du fortfährst',
                },
                exitModal: {
                    title: 'Funktioniert etwas nicht?',
                    prompt: 'Wir haben festgestellt, dass du das Hinzufügen deiner Karten nicht abgeschlossen hast. Wenn du auf ein Problem gestoßen bist, lass es uns wissen, damit wir dir helfen können, alles wieder in Ordnung zu bringen.',
                    confirmText: 'Problem melden',
                    cancelText: 'Überspringen',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Letzter Tag des Monats',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Letzter Geschäftstag des Monats',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Benutzerdefinierter Tag des Monats',
            },
            assign: 'Zuweisen',
            assignCard: 'Karte zuweisen',
            findCard: 'Karte finden',
            cardNumber: 'Kartennummer',
            commercialFeed: 'Kommerzieller Feed',
            feedName: (feedName: string) => `${feedName}-Karten`,
            directFeed: 'Direkt-Feed',
            whoNeedsCardAssigned: 'Wer braucht eine zugewiesene Karte?',
            chooseTheCardholder: 'Wähle den Karteninhaber',
            chooseCard: 'Wähle eine Karte',
            chooseCardFor: (assignee: string) => `Wähle eine Karte für <strong>${assignee}</strong>. Du findest die gesuchte Karte nicht? <concierge-link>Gib uns Bescheid.</concierge-link>`,
            noActiveCards: 'Keine aktiven Karten in diesem Feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Oder es ist etwas kaputt. So oder so: Wenn du Fragen hast, <concierge-link>kontaktiere einfach Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Wähle ein Startdatum für Transaktionen',
            startDateDescription: 'Wähle dein Startdatum für den Import. Wir synchronisieren alle Transaktionen ab diesem Datum.',
            editStartDateDescription:
                'Wählen Sie ein neues Startdatum für Transaktionen. Wir synchronisieren alle Transaktionen ab diesem Datum, ausgenommen diejenigen, die wir bereits importiert haben.',
            fromTheBeginning: 'Von Anfang an',
            customStartDate: 'Benutzerdefiniertes Startdatum',
            customCloseDate: 'Benutzerdefiniertes Abschlussdatum',
            letsDoubleCheck: 'Lass uns zur Sicherheit noch einmal prüfen, ob alles richtig aussieht.',
            confirmationDescription: 'Wir beginnen sofort mit dem Import der Transaktionen.',
            card: 'Karte',
            cardName: 'Kartenname',
            brokenConnectionError:
                '<rbr>Die Kartenfeed-Verbindung ist unterbrochen. Bitte <a href="#">melden Sie sich bei Ihrer Bank an</a>, damit wir die Verbindung erneut herstellen können.</rbr>',
            assignedCard: (assignee: string, link: string) => `${assignee} wurde ein ${link} zugewiesen! Importierte Transaktionen erscheinen in diesem Chat.`,
            companyCard: 'Firmenkarte',
            chooseCardFeed: 'Kartenfeed auswählen',
            ukRegulation:
                'Expensify Limited ist ein Vertreter von Plaid Financial Ltd., einem zugelassenen Zahlungsinstitut, das von der Financial Conduct Authority gemäß den Payment Services Regulations 2017 reguliert wird (Firm Reference Number: 804718). Plaid stellt Ihnen über Expensify Limited als dessen Vertreter regulierte Kontoinformationsdienste zur Verfügung.',
            assignCardFailedError: 'Kartenzuweisung fehlgeschlagen.',
            unassignCardFailedError: 'Kartenzuordnung konnte nicht aufgehoben werden.',
            cardAlreadyAssignedError: 'Diese Karte ist bereits einem Benutzer in einem anderen Workspace zugeordnet.',
            importTransactions: {
                title: 'Transaktionen aus Datei importieren',
                description: 'Bitte passe die Einstellungen für deine Datei an, die beim Import angewendet werden.',
                cardDisplayName: 'Anzeigename der Karte',
                currency: 'Währung',
                transactionsAreReimbursable: 'Transaktionen sind erstattungsfähig',
                flipAmountSign: 'Vorzeichen des Betrags umkehren',
                importButton: 'Transaktionen importieren',
            },
        },
        expensifyCard: {
            issueAndManageCards: 'Expensify Cards ausgeben und verwalten',
            getStartedIssuing: 'Beginne, indem du deine erste virtuelle oder physische Karte ausgibst.',
            verificationInProgress: 'Verifizierung läuft...',
            verifyingTheDetails: 'Wir überprüfen ein paar Angaben. Concierge informiert dich, sobald Expensify Cards ausgegeben werden können.',
            disclaimer:
                'Die Expensify Visa® Commercial Card wird von The Bancorp Bank, N.A., Mitglied der FDIC, gemäß einer Lizenz von Visa U.S.A. Inc. herausgegeben und kann nicht bei allen Händlern verwendet werden, die Visa Karten akzeptieren. Apple® und das Apple Logo® sind Marken von Apple Inc., eingetragen in den USA und anderen Ländern. App Store ist eine Dienstleistungsmarke von Apple Inc. Google Play und das Google Play Logo sind Marken von Google LLC.',
            euUkDisclaimer:
                'Von Transact Payments Malta Limited ausgegebene Karten werden EWR-Ansässigen zur Verfügung gestellt, und von Transact Payments Limited ausgegebene Karten werden Einwohnern des Vereinigten Königreichs gemäß einer Lizenz von Visa Europe Limited zur Verfügung gestellt. Transact Payments Malta Limited ist ordnungsgemäß von der Malta Financial Services Authority als Finanzinstitut nach dem Financial Institution Act 1994 zugelassen und reguliert. Registrierungsnummer C 91879. Transact Payments Limited ist von der Gibraltar Financial Service Commission zugelassen und reguliert.',
            issueCard: 'Karte ausstellen',
            findCard: 'Karte finden',
            newCard: 'Neue Karte',
            name: 'Name',
            lastFour: 'Letzte 4',
            limit: 'Limit',
            currentBalance: 'Aktueller Saldo',
            currentBalanceDescription: 'Der aktuelle Saldo ist die Summe aller verbuchten Expensify Card-Transaktionen, die seit dem letzten Abrechnungsdatum erfolgt sind.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Der Saldo wird am ${settlementDate} ausgeglichen`,
            settleBalance: 'Saldo ausgleichen',
            cardLimit: 'Kartenlimit',
            remainingLimit: 'Verbleibendes Limit',
            requestLimitIncrease: 'Erhöhung des Anfragekontingents beantragen',
            remainingLimitDescription:
                'Wir berücksichtigen mehrere Faktoren, wenn wir Ihr verbleibendes Limit berechnen: Ihre Dauer als Kund:in, die geschäftsbezogenen Informationen, die Sie bei der Registrierung angegeben haben, sowie das verfügbare Guthaben auf Ihrem Geschäftskonto. Ihr verbleibendes Limit kann täglich schwanken.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Die Cashback-Gutschrift basiert auf den abgeschlossenen monatlichen Expensify-Card-Ausgaben in deinem Workspace.',
            issueNewCard: 'Neue Karte ausstellen',
            finishSetup: 'Einrichtung abschließen',
            chooseBankAccount: 'Bankkonto auswählen',
            chooseExistingBank: 'Wähle ein bestehendes Geschäftskonto aus, um deinen Expensify Card‑Saldo zu bezahlen, oder füge ein neues Bankkonto hinzu',
            accountEndingIn: 'Konto endet auf',
            addNewBankAccount: 'Neues Bankkonto hinzufügen',
            settlementAccount: 'Abrechnungskonto',
            settlementAccountDescription: 'Wähle ein Konto aus, um deinen Expensify Card-Saldo zu begleichen.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Stelle sicher, dass dieses Konto mit deinem <a href="${reconciliationAccountSettingsLink}">Abstimmungskonto</a> (${accountNumber}) übereinstimmt, damit die kontinuierliche Abstimmung ordnungsgemäß funktioniert.`,
            settlementFrequency: 'Auszahlungsfrequenz',
            settlementFrequencyDescription: 'Wähle aus, wie oft du den Saldo deiner Expensify Card bezahlst.',
            settlementFrequencyInfo: 'Wenn du zur monatlichen Abrechnung wechseln möchtest, musst du dein Bankkonto über Plaid verbinden und eine positive 90‑Tage-Saldohistorie vorweisen.',
            frequency: {
                daily: 'Täglich',
                monthly: 'Monatlich',
            },
            cardDetails: 'Kartendetails',
            cardPending: ({name}: {name: string}) => `Die Karte ist derzeit ausstehend und wird ausgegeben, sobald das Konto von ${name} verifiziert wurde.`,
            virtual: 'Virtuell',
            physical: 'Physisch',
            deactivate: 'Karte deaktivieren',
            changeCardLimit: 'Kartenlimit ändern',
            changeLimit: 'Limit ändern',
            smartLimitWarning: (limit: number | string) =>
                `Wenn du das Limit dieser Karte auf ${limit} änderst, werden neue Transaktionen abgelehnt, bis du weitere Ausgaben auf der Karte genehmigst.`,
            monthlyLimitWarning: (limit: number | string) => `Wenn du das Limit dieser Karte auf ${limit} änderst, werden neue Transaktionen bis zum nächsten Monat abgelehnt.`,
            fixedLimitWarning: (limit: number | string) => `Wenn Sie das Limit dieser Karte auf ${limit} ändern, werden neue Transaktionen abgelehnt.`,
            changeCardLimitType: 'Kartentyp für Limit ändern',
            changeLimitType: 'Limittyp ändern',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `Wenn du den Limit-Typ dieser Karte auf Smart Limit änderst, werden neue Transaktionen abgelehnt, weil das nicht genehmigte Limit von ${limit} bereits erreicht wurde.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Wenn du den Limittyp dieser Karte auf „Monatlich“ änderst, werden neue Transaktionen abgelehnt, weil das monatliche Limit von ${limit} bereits erreicht wurde.`,
            addShippingDetails: 'Versanddetails hinzufügen',
            issuedCard: (assignee: string) => `${assignee} eine Expensify Card ausgestellt! Die Karte wird in 2–3 Werktagen ankommen.`,
            issuedCardNoShippingDetails: (assignee: string) => `hat ${assignee} eine Expensify Card ausgegeben! Die Karte wird versandt, sobald die Versanddetails bestätigt sind.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `hat ${assignee} eine virtuelle Expensify Card ausgestellt! Der/die/das ${link} kann sofort verwendet werden.`,
            addedShippingDetails: (assignee: string) => `${assignee} hat Versanddetails hinzugefügt. Die Expensify Card wird in 2–3 Werktagen ankommen.`,
            replacedCard: (assignee: string) => `${assignee} hat ihre Expensify Card ersetzt. Die neue Karte wird in 2–3 Werktagen ankommen.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} hat die virtuelle Expensify Card ersetzt! Der ${link} kann sofort verwendet werden.`,
            card: 'Karte',
            replacementCard: 'Ersatzkarte',
            verifyingHeader: 'Wird verifiziert',
            bankAccountVerifiedHeader: 'Bankkonto verifiziert',
            verifyingBankAccount: 'Bankkonto wird verifiziert ...',
            verifyingBankAccountDescription: 'Bitte warten, während wir bestätigen, dass dieses Konto zur Ausgabe von Expensify Cards verwendet werden kann.',
            bankAccountVerified: 'Bankkonto verifiziert!',
            bankAccountVerifiedDescription: 'Sie können jetzt Expensify Cards an die Mitglieder Ihres Arbeitsbereichs ausgeben.',
            oneMoreStep: 'Noch ein Schritt …',
            oneMoreStepDescription: 'Es sieht so aus, als müssten wir dein Bankkonto manuell verifizieren. Bitte gehe zu Concierge, wo deine Anweisungen bereits auf dich warten.',
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
            defaultSpendCategories: 'Standard-Ausgabenkategorien',
            spendCategoriesDescription: 'Passen Sie an, wie Händlerausgaben für Kreditkartentransaktionen und gescannte Belege kategorisiert werden.',
            deleteFailureMessage: 'Beim Löschen der Kategorie ist ein Fehler aufgetreten, bitte versuche es erneut',
            categoryName: 'Kategoriename',
            requiresCategory: 'Mitglieder müssen alle Ausgaben kategorisieren',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Alle Ausgaben müssen kategorisiert werden, um nach ${connectionName} exportiert werden zu können.`,
            subtitle: 'Verschaffe dir einen besseren Überblick darüber, wofür Geld ausgegeben wird. Nutze unsere Standardkategorien oder füge deine eigenen hinzu.',
            emptyCategories: {
                title: 'Du hast noch keine Kategorien erstellt',
                subtitle: 'Füge eine Kategorie hinzu, um deine Ausgaben zu organisieren.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Ihre Kategorien werden derzeit über eine Buchhaltungsverbindung importiert. Gehen Sie zu <a href="${accountingPageURL}">Buchhaltung</a>, um Änderungen vorzunehmen.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Beim Aktualisieren der Kategorie ist ein Fehler aufgetreten, bitte versuche es erneut.',
            createFailureMessage: 'Beim Erstellen der Kategorie ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            addCategory: 'Kategorie hinzufügen',
            editCategory: 'Kategorie bearbeiten',
            editCategories: 'Kategorien bearbeiten',
            findCategory: 'Kategorie finden',
            categoryRequiredError: 'Kategoriename ist erforderlich',
            existingCategoryError: 'Eine Kategorie mit diesem Namen existiert bereits',
            invalidCategoryName: 'Ungültiger Kategoriename',
            importedFromAccountingSoftware: 'Die untenstehenden Kategorien werden importiert aus Ihrer',
            payrollCode: 'Lohnabrechnungscode',
            updatePayrollCodeFailureMessage: 'Beim Aktualisieren des Gehaltsabrechnungscodes ist ein Fehler aufgetreten, bitte versuche es erneut.',
            glCode: 'Hauptbuchcode',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des Hauptbuchcodes ist ein Fehler aufgetreten, bitte versuche es erneut.',
            importCategories: 'Kategorien importieren',
            cannotDeleteOrDisableAllCategories: {
                title: 'Es können nicht alle Kategorien gelöscht oder deaktiviert werden',
                description: `Mindestens eine Kategorie muss aktiviert bleiben, da Ihr Workspace Kategorien erfordert.`,
            },
        },
        moreFeatures: {
            subtitle:
                'Verwende die Schalter unten, um beim Wachstum weitere Funktionen zu aktivieren. Jede Funktion wird im Navigationsmenü angezeigt und kann dort weiter angepasst werden.',
            spendSection: {
                title: 'Ausgaben',
                subtitle: 'Aktiviere Funktionen, die dir helfen, dein Team zu skalieren.',
            },
            manageSection: {
                title: 'Verwalten',
                subtitle: 'Füge Kontrollmechanismen hinzu, die helfen, Ausgaben im Budget zu halten.',
            },
            earnSection: {
                title: 'Verdienen',
                subtitle: 'Optimieren Sie Ihre Einnahmen und lassen Sie sich schneller bezahlen.',
            },
            organizeSection: {
                title: 'Organisieren',
                subtitle: 'Ausgaben gruppieren und analysieren, jede gezahlte Steuer erfassen.',
            },
            integrateSection: {
                title: 'Integrieren',
                subtitle: 'Verbinde Expensify mit beliebten Finanzprodukten.',
            },
            distanceRates: {
                title: 'Entfernungssätze',
                subtitle: 'Sätze Tarife hinzu, aktualisiere sie und setze sie durch.',
            },
            perDiem: {
                title: 'Tagespauschale',
                subtitle: 'Setze Tagegeldsätze fest, um die täglichen Mitarbeiterausgaben zu steuern.',
            },
            travel: {
                title: 'Reisen',
                subtitle: 'Buchen, verwalten und abstimmen Sie alle Ihre Geschäftsreisen.',
                getStarted: {
                    title: 'Starte mit Expensify Travel',
                    subtitle: 'Wir brauchen nur noch ein paar weitere Informationen zu deinem Unternehmen, dann bist du startklar.',
                    ctaText: "Los geht's",
                },
                reviewingRequest: {
                    title: 'Koffer packen, wir kümmern uns um deine Anfrage ...',
                    subtitle: 'Wir prüfen derzeit deine Anfrage zur Aktivierung von Expensify Travel. Keine Sorge, wir sagen dir Bescheid, sobald alles bereit ist.',
                    ctaText: 'Anfrage gesendet',
                },
                bookOrManageYourTrip: {
                    title: 'Reise buchen oder verwalten',
                    subtitle: 'Nutze Expensify Travel, um die besten Reiseangebote zu erhalten und alle deine Geschäftsausgaben an einem Ort zu verwalten.',
                    ctaText: 'Buchen oder verwalten',
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: 'Reisebuchung',
                        subtitle: 'Glückwunsch! Du kannst jetzt in diesem Workspace Reisen buchen und verwalten.',
                        manageTravelLabel: 'Reisen verwalten',
                    },
                    centralInvoicingSection: {
                        title: 'Zentrale Rechnungsstellung',
                        subtitle: 'Bündeln Sie alle Reisekosten in einer monatlichen Rechnung, statt zum Zeitpunkt des Kaufs zu bezahlen.',
                        learnHow: 'Erfahre wie.',
                        subsections: {
                            currentTravelSpendLabel: 'Aktuelle Reisekosten',
                            currentTravelSpendCta: 'Saldo bezahlen',
                            currentTravelLimitLabel: 'Aktuelles Reisekontingent',
                            settlementAccountLabel: 'Abrechnungskonto',
                            settlementFrequencyLabel: 'Auszahlungsfrequenz',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Gewinne Einblicke und Kontrolle über Ausgaben.',
                disableCardTitle: 'Expensify Card deaktivieren',
                disableCardPrompt: 'Du kannst die Expensify Card nicht deaktivieren, weil sie bereits verwendet wird. Wende dich an Concierge, um die nächsten Schritte zu erfahren.',
                disableCardButton: 'Mit Concierge chatten',
                feed: {
                    title: 'Expensify Card bestellen',
                    subTitle: 'Optimieren Sie Ihre Geschäftsausgaben und sparen Sie bis zu 50 % bei Ihrer Expensify-Rechnung, außerdem:',
                    features: {
                        cashBack: 'Cashback auf jeden Einkauf in den USA',
                        unlimited: 'Unbegrenzte virtuelle Karten',
                        spend: 'Ausgabenkontrollen und benutzerdefinierte Limits',
                    },
                    ctaTitle: 'Neue Karte ausstellen',
                },
            },
            companyCards: {
                title: 'Firmenkarten',
                subtitle: 'Verbinde die Karten, die du bereits hast.',
                feed: {
                    title: 'Eigene Karten verwenden (BYOC)',
                    subtitle: 'Verknüpfe deine vorhandenen Karten für den automatischen Import von Transaktionen, Belegabgleich und Abstimmung.',
                    features: {
                        support: 'Karten von über 10.000 Banken verbinden',
                        assignCards: 'Verknüpfe die vorhandenen Karten deines Teams',
                        automaticImport: 'Wir rufen Transaktionen automatisch ab',
                    },
                },
                bankConnectionError: 'Problem mit Bankverbindung',
                connectWithPlaid: 'Mit Plaid verbinden',
                connectWithExpensifyCard: 'probiere die Expensify Card aus.',
                bankConnectionDescription: `Bitte versuche, deine Karten erneut hinzuzufügen. Andernfalls kannst du`,
                disableCardTitle: 'Firmenkarten deaktivieren',
                disableCardPrompt: 'Firmenkarten können nicht deaktiviert werden, da diese Funktion in Verwendung ist. Wende dich an den Concierge, um die nächsten Schritte zu erfahren.',
                disableCardButton: 'Mit Concierge chatten',
                cardDetails: 'Kartendetails',
                cardNumber: 'Kartennummer',
                cardholder: 'Karteninhaber',
                cardName: 'Kartenname',
                allCards: 'Alle Karten',
                assignedCards: 'Zugewiesen',
                unassignedCards: 'Nicht zugewiesen',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()}-Export` : `${integration}-Export`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Wähle das ${integration}-Konto, in das Transaktionen exportiert werden sollen.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Wähle das ${integration}-Konto, in das Transaktionen exportiert werden sollen. Wähle eine andere <a href="${exportPageLink}">Exportoption</a>, um die verfügbaren Konten zu ändern.`,
                lastUpdated: 'Zuletzt aktualisiert',
                transactionStartDate: 'Transaktionsstartdatum',
                updateCard: 'Karte aktualisieren',
                unassignCard: 'Karte zuweisen aufheben',
                unassign: 'Zuweisung aufheben',
                unassignCardDescription: 'Durch das Aufheben der Zuweisung dieser Karte werden alle Transaktionen in Entwürfen von Berichten aus dem Konto des Karteninhabers entfernt.',
                assignCard: 'Karte zuweisen',
                cardFeedName: 'Kartenfeed-Name',
                cardFeedNameDescription: 'Gib dem Kartendatenfeed einen eindeutigen Namen, damit du ihn von den anderen unterscheiden kannst.',
                cardFeedTransaction: 'Transaktionen löschen',
                cardFeedTransactionDescription: 'Legen Sie fest, ob Karteninhaber Kartenumsätze löschen können. Neue Umsätze folgen diesen Regeln.',
                cardFeedRestrictDeletingTransaction: 'Löschen von Transaktionen einschränken',
                cardFeedAllowDeletingTransaction: 'Löschen von Transaktionen erlauben',
                removeCardFeed: 'Kartenfeed entfernen',
                removeCardFeedTitle: (feedName: string) => `${feedName}-Feed entfernen`,
                removeCardFeedDescription: 'Möchtest du diesen Karten-Feed wirklich entfernen? Dadurch werden alle Karten zugewiesen.',
                error: {
                    feedNameRequired: 'Name des Kartenfeeds ist erforderlich',
                    statementCloseDateRequired: 'Bitte wähle ein Abrechnungsdatum aus.',
                },
                corporate: 'Löschen von Transaktionen einschränken',
                personal: 'Löschen von Transaktionen erlauben',
                setFeedNameDescription: 'Gib dem Kartenfeed einen eindeutigen Namen, damit du ihn von den anderen unterscheiden kannst',
                setTransactionLiabilityDescription: 'Wenn aktiviert, können Karteninhaber Kartenumsätze löschen. Neue Umsätze folgen dieser Regel.',
                emptyAddedFeedTitle: 'Keine Karten in diesem Feed',
                emptyAddedFeedDescription: 'Stellen Sie sicher, dass im Karten-Feed Ihrer Bank Karten vorhanden sind.',
                pendingFeedTitle: `Wir prüfen Ihre Anfrage …`,
                pendingFeedDescription: `Wir überprüfen derzeit Ihre Feed-Details. Sobald das erledigt ist, melden wir uns bei Ihnen über`,
                pendingBankTitle: 'Überprüfe dein Browserfenster',
                pendingBankDescription: (bankName: string) =>
                    `Bitte stelle über das soeben geöffnete Browserfenster eine Verbindung zu ${bankName} her. Wenn sich kein Fenster geöffnet hat,`,
                pendingBankLink: 'bitte hier klicken',
                giveItNameInstruction: 'Gib der Karte einen Namen, der sie von anderen abhebt.',
                updating: 'Aktualisiere ...',
                neverUpdated: 'Nie',
                noAccountsFound: 'Keine Konten gefunden',
                defaultCard: 'Standardkarte',
                downgradeTitle: `Arbeitsbereich kann nicht herabgestuft werden`,
                downgradeSubTitle: `Dieser Workspace kann nicht herabgestuft werden, da mehrere Karten-Feeds verbunden sind (ausgenommen Expensify Cards). Bitte <a href="#">nur einen Karten-Feed beibehalten</a>, um fortzufahren.`,
                noAccountsFoundDescription: (connection: string) => `Bitte fügen Sie das Konto in ${connection} hinzu und synchronisieren Sie die Verbindung erneut`,
                expensifyCardBannerTitle: 'Expensify Card bestellen',
                expensifyCardBannerSubtitle:
                    'Genieße Cashback bei jedem Einkauf in den USA, bis zu 50 % Rabatt auf deine Expensify-Rechnung, unbegrenzt viele virtuelle Karten und vieles mehr.',
                expensifyCardBannerLearnMoreButton: 'Erfahre mehr',
                statementCloseDateTitle: 'Datum des Kontoabschlusses',
                statementCloseDateDescription: 'Teile uns mit, wann deine Kreditkartenabrechnung abgeschlossen wird, und wir erstellen einen passenden Auszug in Expensify.',
            },
            workflows: {
                title: 'Workflows',
                subtitle: 'Konfigurieren Sie, wie Ausgaben genehmigt und bezahlt werden.',
                disableApprovalPrompt:
                    'Expensify Cards aus diesem Workspace nutzen derzeit Genehmigungen, um ihre Smart Limits zu definieren. Bitte passe die Limitarten aller Expensify Cards mit Smart Limits an, bevor du Genehmigungen deaktivierst.',
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
                subtitle: 'Kosten klassifizieren und verrechenbare Ausgaben nachverfolgen.',
            },
            taxes: {
                title: 'Steuern',
                subtitle: 'Dokumentieren und erstattungsfähige Steuern zurückfordern.',
            },
            reportFields: {
                title: 'Berichtsfelder',
                subtitle: 'Richte benutzerdefinierte Felder für Ausgaben ein.',
            },
            connections: {
                title: 'Buchhaltung',
                subtitle: 'Synchronisiere deinen Kontenplan und mehr.',
            },
            receiptPartners: {
                title: 'Belegpartner',
                subtitle: 'Belege automatisch importieren.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Nicht so schnell …',
                featureEnabledText: 'Um diese Funktion zu aktivieren oder zu deaktivieren, musst du deine Buchhaltungsimport-Einstellungen ändern.',
                disconnectText: 'Um die Buchhaltung zu deaktivieren, musst du die Buchhaltungsanbindung von deinem Arbeitsbereich trennen.',
                manageSettings: 'Einstellungen verwalten',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Verbindung mit Uber trennen',
                disconnectText: 'Um diese Funktion zu deaktivieren, trenne bitte zuerst die Uber for Business-Integration.',
                description: 'Möchten Sie diese Integration wirklich trennen?',
                confirmText: 'Verstanden',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Nicht so schnell …',
                featureEnabledText:
                    'Expensify Cards in diesem Workspace basieren auf Genehmigungs-Workflows, um ihre Smart Limits festzulegen.\n\nBitte ändere die Limitarten aller Karten mit Smart Limits, bevor du Workflows deaktivierst.',
                confirmText: 'Zu Expensify Cards wechseln',
            },
            rules: {
                title: 'Regeln',
                subtitle: 'Belege anfordern, hohe Ausgaben kennzeichnen und mehr.',
            },
            timeTracking: {
                title: 'Zeit',
                subtitle: 'Lege einen abrechenbaren Stundensatz für die Zeiterfassung fest.',
                defaultHourlyRate: 'Standardstundensatz',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Beispiele:',
            customReportNamesSubtitle: `<muted-text>Passen Sie Berichtstitel mit unseren <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">umfangreichen Formeln</a> an.</muted-text>`,
            customNameTitle: 'Standardmäßiger Berichtstitel',
            customNameDescription: `Wähle einen eigenen Namen für Spesenberichte mit Hilfe unserer <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">umfassenden Formeln</a>.`,
            customNameInputLabel: 'Name',
            customNameEmailPhoneExample: 'E-Mail-Adresse oder Telefonnummer des Mitglieds: {report:submit:from}',
            customNameStartDateExample: 'Berichtsanfangsdatum: {report:startdate}',
            customNameWorkspaceNameExample: 'Arbeitsbereichsname: {report:workspacename}',
            customNameReportIDExample: 'Berichts-ID: {report:id}',
            customNameTotalExample: 'Summe: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Verhindern, dass Mitglieder benutzerdefinierte Berichtstitel ändern',
        },
        reportFields: {
            addField: 'Feld hinzufügen',
            delete: 'Feld löschen',
            deleteFields: 'Felder löschen',
            findReportField: 'Berichtsfeld finden',
            deleteConfirmation: 'Möchten Sie dieses Berichtsfeld wirklich löschen?',
            deleteFieldsConfirmation: 'Möchten Sie diese Berichts­felder wirklich löschen?',
            emptyReportFields: {
                title: 'Sie haben noch keine Berichts­felder erstellt',
                subtitle: 'Füge ein benutzerdefiniertes Feld (Text, Datum oder Dropdown) hinzu, das in Berichten angezeigt wird.',
            },
            subtitle: 'Berichtsfelder gelten für alle Ausgaben und können hilfreich sein, wenn du nach zusätzlichen Informationen fragen möchtest.',
            disableReportFields: 'Berichtsfelder deaktivieren',
            disableReportFieldsConfirmation: 'Bist du sicher? Text- und Datumsfelder werden gelöscht und Listen werden deaktiviert.',
            importedFromAccountingSoftware: 'Die folgenden Berichtsfelder werden importiert aus Ihrem',
            textType: 'Text',
            dateType: 'Datum',
            dropdownType: 'Liste',
            formulaType: 'Formel',
            textAlternateText: 'Feld für freie Texteingabe hinzufügen.',
            dateAlternateText: 'Fügen Sie einen Kalender zur Datumswahl hinzu.',
            dropdownAlternateText: 'Füge eine Liste von Optionen hinzu, aus denen ausgewählt werden kann.',
            formulaAlternateText: 'Füge ein Formelfeld hinzu.',
            nameInputSubtitle: 'Wählen Sie einen Namen für das Berichtsfeld.',
            typeInputSubtitle: 'Wähle aus, welchen Typ von Berichtsfeld du verwenden möchtest.',
            initialValueInputSubtitle: 'Geben Sie einen Startwert ein, der im Berichtsfeld angezeigt wird.',
            listValuesInputSubtitle: 'Diese Werte werden in der Dropdown-Liste des Berichtsfeldes angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            listInputSubtitle: 'Diese Werte werden in Ihrer Berichtsfeldliste angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            deleteValue: 'Wert löschen',
            deleteValues: 'Werte löschen',
            disableValue: 'Wert deaktivieren',
            disableValues: 'Werte deaktivieren',
            enableValue: 'Wert aktivieren',
            enableValues: 'Werte aktivieren',
            emptyReportFieldsValues: {
                title: 'Sie haben noch keine Listenwerte erstellt',
                subtitle: 'Füge benutzerdefinierte Werte hinzu, damit sie in Berichten erscheinen.',
            },
            deleteValuePrompt: 'Sind Sie sicher, dass Sie diesen Listenwert löschen möchten?',
            deleteValuesPrompt: 'Sind Sie sicher, dass Sie diese Listenwerte löschen möchten?',
            listValueRequiredError: 'Bitte gib einen Listennamen ein',
            existingListValueError: 'Ein Listeneintrag mit diesem Namen existiert bereits',
            editValue: 'Wert bearbeiten',
            listValues: 'Werte auflisten',
            addValue: 'Wert hinzufügen',
            existingReportFieldNameError: 'Ein Berichtsfeld mit diesem Namen existiert bereits',
            reportFieldNameRequiredError: 'Bitte gib einen Berichtsfeldnamen ein',
            reportFieldTypeRequiredError: 'Bitte wähle einen Berichts-Feldtyp aus',
            circularReferenceError: 'Dieses Feld kann nicht auf sich selbst verweisen. Bitte aktualisieren.',
            reportFieldInitialValueRequiredError: 'Bitte wählen Sie einen Anfangswert für ein Berichts­feld',
            genericFailureMessage: 'Beim Aktualisieren des Berichtsfelds ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        tags: {
            tagName: 'Tag-Name',
            requiresTag: 'Mitglieder müssen alle Ausgaben taggen',
            trackBillable: 'Abrechenbare Ausgaben verfolgen',
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
            subtitle: 'Tags bieten detailliertere Möglichkeiten, Kosten zu klassifizieren.',
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>Du verwendest <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">abhängige Tags</a>. Du kannst <a href="${importSpreadsheetLink}">eine Tabelle erneut importieren</a>, um deine Tags zu aktualisieren.</muted-text>`,
            emptyTags: {
                title: 'Du hast noch keine Tags erstellt',
                subtitle: 'Füge ein Tag hinzu, um Projekte, Standorte, Abteilungen und mehr zu verfolgen.',
                subtitleHTML: `<muted-text><centered-text>Füge Tags hinzu, um Projekte, Standorte, Abteilungen und mehr nachzuverfolgen. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Erfahre mehr</a> über das Formatieren von Tag-Dateien für den Import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Ihre Tags werden derzeit aus einer Buchhaltungsverbindung importiert. Gehen Sie zu <a href="${accountingPageURL}">Buchhaltung</a>, um Änderungen vorzunehmen.</centered-text></muted-text>`,
            },
            deleteTag: 'Tag löschen',
            deleteTags: 'Tags löschen',
            deleteTagConfirmation: 'Möchtest du dieses Tag wirklich löschen?',
            deleteTagsConfirmation: 'Möchtest du diese Tags wirklich löschen?',
            deleteFailureMessage: 'Beim Löschen des Tags ist ein Fehler aufgetreten, bitte versuche es erneut',
            tagRequiredError: 'Tag-Name ist erforderlich',
            existingTagError: 'Ein Tag mit diesem Namen existiert bereits',
            invalidTagNameError: 'Tag-Name kann nicht 0 sein. Bitte wählen Sie einen anderen Wert.',
            genericFailureMessage: 'Beim Aktualisieren des Tags ist ein Fehler aufgetreten, bitte versuche es erneut.',
            importedFromAccountingSoftware: 'Die unten stehenden Tags werden importiert von Ihrem',
            glCode: 'Hauptbuchcode',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des Hauptbuchcodes ist ein Fehler aufgetreten, bitte versuche es erneut.',
            tagRules: 'Tag-Regeln',
            approverDescription: 'Genehmigende Person',
            importTags: 'Tags importieren',
            importTagsSupportingText: 'Ordne deine Ausgaben mit einem oder vielen Tags zu.',
            configureMultiLevelTags: 'Konfiguriere deine Schlagwortliste für mehrstufiges Tagging.',
            importMultiLevelTagsSupportingText: `Hier ist eine Vorschau deiner Tags. Wenn alles gut aussieht, klicke unten, um sie zu importieren.`,
            importMultiLevelTags: {
                firstRowTitle: 'Die erste Zeile ist der Titel für jede Tag-Liste.',
                independentTags: 'Dies sind unabhängige Tags',
                glAdjacentColumn: 'In der angrenzenden Spalte befindet sich ein Hauptbuchcode (GL-Code).',
            },
            tagLevel: {
                singleLevel: 'Einstufige Tags',
                multiLevel: 'Mehrstufige Tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Tag-Ebenen wechseln',
                prompt1: 'Das Wechseln der Tag-Stufen löscht alle aktuellen Tags.',
                prompt2: 'Wir empfehlen Ihnen zuerst',
                prompt3: 'Backup herunterladen',
                prompt4: 'indem Sie Ihre Tags exportieren.',
                prompt5: 'Mehr erfahren',
                prompt6: 'über Tag-Ebenen.',
            },
            overrideMultiTagWarning: {
                title: 'Tags importieren',
                prompt1: 'Bist du sicher?',
                prompt2: 'Die vorhandenen Tags werden überschrieben, aber Sie können',
                prompt3: 'Backup herunterladen',
                prompt4: 'zuerst.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `Wir haben *${columnCounts} Spalten* in Ihrer Tabelle gefunden. Wählen Sie *Name* neben der Spalte, die die Tag-Namen enthält. Sie können auch *Aktiviert* neben der Spalte auswählen, die den Tag-Status festlegt.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Es können nicht alle Tags gelöscht oder deaktiviert werden',
                description: `Mindestens ein Tag muss aktiviert bleiben, da in deinem Workspace Tags erforderlich sind.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Kann nicht alle Tags optional machen',
                description: `Mindestens ein Tag muss verpflichtend bleiben, da in deinen Workspace-Einstellungen Tags erforderlich sind.`,
            },
            cannotMakeTagListRequired: {
                title: 'Tagliste kann nicht als erforderlich festgelegt werden',
                description: 'Sie können eine Tagliste nur als erforderlich festlegen, wenn in Ihrer Richtlinie mehrere Tag-Ebenen konfiguriert sind.',
            },
            tagCount: () => ({
                one: '1 Tag',
                other: (count: number) => `${count} Tags`,
            }),
        },
        taxes: {
            subtitle: 'Steuernamen und -sätze hinzufügen und Standardwerte festlegen.',
            addRate: 'Satz hinzufügen',
            workspaceDefault: 'Standardwährung des Workspaces',
            foreignDefault: 'Standardwährung für Fremdwährungen',
            customTaxName: 'Benutzerdefinierter Steuername',
            value: 'Wert',
            taxReclaimableOn: 'Steuererstattungsfähig für',
            taxRate: 'Steuersatz',
            findTaxRate: 'Steuersatz finden',
            error: {
                taxRateAlreadyExists: 'Dieser Steuername wird bereits verwendet',
                taxCodeAlreadyExists: 'Dieser Steuerschlüssel wird bereits verwendet',
                valuePercentageRange: 'Bitte gib einen gültigen Prozentsatz zwischen 0 und 100 ein',
                customNameRequired: 'Benutzerdefinierter Steuername ist erforderlich',
                deleteFailureMessage: 'Beim Löschen des Steuersatzes ist ein Fehler aufgetreten. Bitte versuche es erneut oder bitte Concierge um Hilfe.',
                updateFailureMessage: 'Beim Aktualisieren des Steuersatzes ist ein Fehler aufgetreten. Bitte versuche es erneut oder bitte Concierge um Hilfe.',
                createFailureMessage: 'Beim Erstellen des Steuersatzes ist ein Fehler aufgetreten. Bitte versuche es erneut oder bitte Concierge um Hilfe.',
                updateTaxClaimableFailureMessage: 'Der erstattungsfähige Anteil muss geringer sein als der Betrag des Kilometersatzes',
            },
            deleteTaxConfirmation: 'Möchtest du diese Steuer wirklich löschen?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Sind Sie sicher, dass Sie ${taxAmount} Steuern löschen möchten?`,
            actions: {
                delete: 'Satz löschen',
                deleteMultiple: 'Tarife löschen',
                enable: 'Rate aktivieren',
                disable: 'Rate deaktivieren',
                enableTaxRates: () => ({
                    one: 'Rate aktivieren',
                    other: 'Tarife aktivieren',
                }),
                disableTaxRates: () => ({
                    one: 'Rate deaktivieren',
                    other: 'Tarife deaktivieren',
                }),
            },
            importedFromAccountingSoftware: 'Die unten aufgeführten Steuern werden importiert aus Ihrer',
            taxCode: 'Steuercode',
            updateTaxCodeFailureMessage: 'Beim Aktualisieren des Steuercodes ist ein Fehler aufgetreten, bitte versuche es erneut',
        },
        duplicateWorkspace: {
            title: 'Benennen Sie Ihren neuen Workspace',
            selectFeatures: 'Funktionen zum Kopieren auswählen',
            whichFeatures: 'Welche Funktionen möchten Sie in Ihren neuen Workspace übernehmen?',
            confirmDuplicate: 'Möchtest du fortfahren?',
            categories: 'Kategorien und Ihre automatischen Kategorisierungsregeln',
            reimbursementAccount: 'Erstattungskonto',
            welcomeNote: 'Bitte verwende meinen neuen Workspace',
            delayedSubmission: 'verspätete Einreichung',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Sie sind dabei, ${newWorkspaceName ?? ''} mit ${totalMembers ?? 0} Mitgliedern aus dem ursprünglichen Arbeitsbereich zu erstellen und zu teilen.`,
            error: 'Beim Duplizieren deines neuen Arbeitsbereichs ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        emptyWorkspace: {
            title: 'Du hast keine Arbeitsbereiche',
            subtitle: 'Belege erfassen, Auslagen erstatten, Reisen verwalten, Rechnungen versenden und mehr.',
            createAWorkspaceCTA: 'Loslegen',
            features: {
                trackAndCollect: 'Belege erfassen und sammeln',
                reimbursements: 'Mitarbeitende erstatten',
                companyCards: 'Firmenkarten verwalten',
            },
            notFound: 'Kein Arbeitsbereich gefunden',
            description:
                'Räume sind ein großartiger Ort, um sich mit mehreren Personen auszutauschen und zusammenzuarbeiten. Um mit der Zusammenarbeit zu beginnen, erstelle oder tritt einem Workspace bei',
        },
        new: {
            newWorkspace: 'Neuer Workspace',
            getTheExpensifyCardAndMore: 'Hol dir die Expensify Card und mehr',
            confirmWorkspace: 'Workspace bestätigen',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mein Gruppenarbeitsbereich${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Workspace von ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Beim Entfernen eines Mitglieds aus dem Workspace ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Sind Sie sicher, dass Sie ${memberName} entfernen möchten?`,
                other: 'Möchtest du diese Mitglieder wirklich entfernen?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} ist Genehmiger in diesem Workspace. Wenn du diesen Workspace nicht mehr mit dieser Person teilst, ersetzen wir sie im Genehmigungsworkflow durch die Workspace-Inhaber:in ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Mitglied entfernen',
                other: 'Mitglieder entfernen',
            }),
            findMember: 'Mitglied finden',
            removeWorkspaceMemberButtonTitle: 'Aus Workspace entfernen',
            removeGroupMemberButtonTitle: 'Aus Gruppe entfernen',
            removeRoomMemberButtonTitle: 'Aus Chat entfernen',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Sind Sie sicher, dass Sie ${memberName} entfernen möchten?`,
            removeMemberTitle: 'Mitglied entfernen',
            transferOwner: 'Inhaberschaft übertragen',
            makeMember: () => ({
                one: 'Mitglied machen',
                other: 'Mitglieder erstellen',
            }),
            makeAdmin: () => ({
                one: 'Admin zuweisen',
                other: 'Zu Admins machen',
            }),
            makeAuditor: () => ({
                one: 'Zum Prüfer machen',
                other: 'Prüfende erstellen',
            }),
            selectAll: 'Alle auswählen',
            error: {
                genericAdd: 'Beim Hinzufügen dieses Workspace-Mitglieds ist ein Problem aufgetreten',
                cannotRemove: 'Du kannst dich selbst oder den/die Arbeitsbereichsinhaber:in nicht entfernen',
                genericRemove: 'Beim Entfernen dieses Workspace-Mitglieds ist ein Problem aufgetreten',
            },
            addedWithPrimary: 'Einige Mitglieder wurden mit ihren primären Logins hinzugefügt.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Hinzugefügt durch sekundäres Login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Gesamtanzahl der Workspace-Mitglieder: ${count}`,
            importMembers: 'Mitglieder importieren',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Wenn du ${approver} aus diesem Workspace entfernst, ersetzen wir diese Person im Genehmigungsworkflow durch ${workspaceOwner}, die/den Workspace-Inhaber·in.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} hat ausstehende Spesenabrechnungen zur Genehmigung. Bitte bitten Sie die Person, diese zu genehmigen, oder übernehmen Sie die Kontrolle über ihre Abrechnungen, bevor Sie sie aus dem Workspace entfernen.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Du kannst ${memberName} nicht aus diesem Workspace entfernen. Bitte lege in Workflows > Zahlungen erstellen oder nachverfolgen eine neue erstattende Person fest und versuche es dann erneut.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Wenn du ${memberName} aus diesem Workspace entfernst, ersetzen wir diese Person als bevorzugte*n Exporteur*in durch ${workspaceOwner}, den/die Workspace-Inhaber*in.`,
            removeMemberPromptTechContact: ({
                memberName,
                workspaceOwner,
            }: {
                memberName: string;
                workspaceOwner: string;
            }) => `Wenn du ${memberName} aus diesem Workspace entfernst, ersetzen wir sie* als technische Ansprechperson durch ${workspaceOwner}, den* Workspace-Inhaber.

\\*gemeint ist die jeweilige Person unabhängig vom Geschlecht`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} hat einen ausstehenden zu bearbeitenden Bericht. Bitte bitten Sie diese Person, die erforderliche Aktion abzuschließen, bevor Sie sie aus dem Arbeitsbereich entfernen.`,
        },
        card: {
            getStartedIssuing: 'Beginne, indem du deine erste virtuelle oder physische Karte ausgibst.',
            issueCard: 'Karte ausstellen',
            issueNewCard: {
                whoNeedsCard: 'Wer braucht eine Karte?',
                inviteNewMember: 'Neues Mitglied einladen',
                findMember: 'Mitglied finden',
                chooseCardType: 'Wähle einen Kartentyp',
                physicalCard: 'Physische Karte',
                physicalCardDescription: 'Ideal für alle, die häufig ausgeben',
                virtualCard: 'Virtuelle Karte',
                virtualCardDescription: 'Sofort und flexibel',
                chooseLimitType: 'Wähle einen Grenztyp',
                smartLimit: 'Smart-Limit',
                smartLimitDescription: 'Bis zu einem bestimmten Betrag ausgeben, bevor eine Genehmigung erforderlich ist',
                monthly: 'Monatlich',
                monthlyDescription: 'Bis zu einem bestimmten Betrag pro Monat ausgeben',
                fixedAmount: 'Fester Betrag',
                fixedAmountDescription: 'Einmalig bis zu einem bestimmten Betrag ausgeben',
                setLimit: 'Limit festlegen',
                cardLimitError: 'Bitte gib einen Betrag ein, der kleiner als 21.474.836 $ ist',
                giveItName: 'Gib ihm einen Namen',
                giveItNameInstruction: 'Mach ihn so einzigartig, dass er sich von anderen Karten unterscheiden lässt. Konkrete Anwendungsfälle sind noch besser!',
                cardName: 'Kartenname',
                letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
                willBeReadyToUse: 'Diese Karte ist sofort einsatzbereit.',
                willBeReadyToShip: 'Diese Karte ist sofort versandbereit.',
                cardholder: 'Karteninhaber',
                cardType: 'Kartentyp',
                limit: 'Limit',
                limitType: 'Limittyp',
                disabledApprovalForSmartLimitError: 'Bitte aktiviere Genehmigungen in <strong>Workflows > Genehmigungen hinzufügen</strong>, bevor du smarte Limits einrichtest',
            },
            deactivateCardModal: {
                deactivate: 'Deaktivieren',
                deactivateCard: 'Karte deaktivieren',
                deactivateConfirmation: 'Durch das Deaktivieren dieser Karte werden alle zukünftigen Transaktionen abgelehnt und dieser Vorgang kann nicht rückgängig gemacht werden.',
            },
        },
        accounting: {
            settings: 'Einstellungen',
            title: 'Verbindungen',
            subtitle: 'Verbinde dein Buchhaltungssystem, um Transaktionen mit deinem Kontenplan zu codieren, Zahlungen automatisch zuzuordnen und deine Finanzen synchron zu halten.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chatte mit deiner Setup-Spezialkraft.',
            talkYourAccountManager: 'Chatte mit deiner/deinem Kundenbetreuer·in.',
            talkToConcierge: 'Mit Concierge chatten.',
            needAnotherAccounting: 'Du brauchst eine andere Buchhaltungssoftware?',
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
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `Es gibt einen Fehler bei einer Verbindung, die in Expensify Classic eingerichtet wurde. [Gehe zu Expensify Classic, um dieses Problem zu beheben.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Wechsle zu Expensify Classic, um deine Einstellungen zu verwalten.',
            setup: 'Verbinden',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Zuletzt synchronisiert ${relativeDate}`,
            notSync: 'Nicht synchronisiert',
            import: 'Import',
            export: 'Export',
            advanced: 'Erweitert',
            other: 'Sonstiges',
            syncNow: 'Jetzt synchronisieren',
            disconnect: 'Trennen',
            reinstall: 'Connector neu installieren',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'Integration';
                return `${integrationName} trennen`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'Buchhaltungsintegration'} verknüpfen`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Verbindung zu QuickBooks Online nicht möglich';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Verbindung zu Xero nicht möglich';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Verbindung zu NetSuite nicht möglich';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Verbindung zu QuickBooks Desktop nicht möglich';
                    default: {
                        return 'Verbindung zur Integration kann nicht hergestellt werden';
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
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Als Berichts­felder importiert',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Standard-NetSuite-Mitarbeiter',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'diese Integration';
                return `Möchten Sie ${integrationName} wirklich trennen?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Sind Sie sicher, dass Sie ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'diese Buchhaltungsintegration'} verbinden möchten? Dadurch werden alle vorhandenen Buchhaltungsverbindungen entfernt.`,
            enterCredentials: 'Gib deine Zugangsdaten ein',
            claimOffer: {
                badgeText: 'Angebot verfügbar!',
                xero: {
                    headline: 'Hol dir Xero 6 Monate lang kostenlos!',
                    description: '<muted-text><centered-text>Neu bei Xero? Expensify-Kund:innen erhalten 6 Monate gratis. Fordern Sie Ihr Angebot unten an.</centered-text></muted-text>',
                    connectButton: 'Mit Xero verbinden',
                },
                uber: {
                    headerTitle: 'Uber für Unternehmen',
                    headline: 'Erhalte 5 % Rabatt auf Uber-Fahrten',
                    description: `<muted-text><centered-text>Aktiviere Uber for Business über Expensify und spare 5 % auf alle Geschäftsfahrten bis Juni. <a href="${CONST.UBER_TERMS_LINK}">Es gelten die Bedingungen.</a></centered-text></muted-text>`,
                    connectButton: 'Verknüpfe dich mit Uber for Business',
                },
            },
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
                            return 'Mitarbeitende importieren';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Konten werden importiert';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Kategorien werden importiert';
                        case 'quickbooksOnlineImportLocations':
                            return 'Standorte werden importiert';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Importierte Daten werden verarbeitet';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Synchronisierung erstatteter Berichte und Rechnungszahlungen';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Steuercodes importieren';
                        case 'quickbooksOnlineCheckConnection':
                            return 'QuickBooks Online-Verbindung wird überprüft';
                        case 'quickbooksOnlineImportMain':
                            return 'QuickBooks Online-Daten werden importiert';
                        case 'startingImportXero':
                            return 'Xero-Daten werden importiert';
                        case 'startingImportQBO':
                            return 'QuickBooks Online-Daten werden importiert';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'QuickBooks Desktop-Daten werden importiert';
                        case 'quickbooksDesktopImportTitle':
                            return 'Titel wird importiert';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Genehmigungszertifikat wird importiert';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importiere Dimensionen';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Speicherrichtlinie wird importiert';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Daten werden noch mit QuickBooks synchronisiert … Bitte stell sicher, dass der Web Connector ausgeführt wird';
                        case 'quickbooksOnlineSyncTitle':
                            return 'QuickBooks Online-Daten werden synchronisiert';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Daten werden geladen';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Kategorien werden aktualisiert';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Aktualisierung von Kunden/Projekten';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Personenliste wird aktualisiert';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Berichtsfelder aktualisieren';
                        case 'jobDone':
                            return 'Warten auf das Laden der importierten Daten';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Kontenplan wird synchronisiert';
                        case 'xeroSyncImportCategories':
                            return 'Kategorien werden synchronisiert';
                        case 'xeroSyncImportCustomers':
                            return 'Kund:innen werden synchronisiert';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Expensify-Berichte als erstattet markieren';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Xero-Rechnungen und -Gutschriften als bezahlt markieren';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Tracking-Kategorien werden synchronisiert';
                        case 'xeroSyncImportBankAccounts':
                            return 'Bankkonten werden synchronisiert';
                        case 'xeroSyncImportTaxRates':
                            return 'Steuersätze werden synchronisiert';
                        case 'xeroCheckConnection':
                            return 'Xero-Verbindung wird überprüft';
                        case 'xeroSyncTitle':
                            return 'Xero-Daten werden synchronisiert';
                        case 'netSuiteSyncConnection':
                            return 'Verbindung zu NetSuite wird initialisiert';
                        case 'netSuiteSyncCustomers':
                            return 'Kunden importieren';
                        case 'netSuiteSyncInitData':
                            return 'Daten werden von NetSuite abgerufen';
                        case 'netSuiteSyncImportTaxes':
                            return 'Steuern importieren';
                        case 'netSuiteSyncImportItems':
                            return 'Artikel werden importiert';
                        case 'netSuiteSyncData':
                            return 'Daten in Expensify importieren';
                        case 'netSuiteSyncAccounts':
                            return 'Konten werden synchronisiert';
                        case 'netSuiteSyncCurrencies':
                            return 'Währungen werden synchronisiert';
                        case 'netSuiteSyncCategories':
                            return 'Kategorien werden synchronisiert';
                        case 'netSuiteSyncReportFields':
                            return 'Daten als Expensify-Berichts­felder importieren';
                        case 'netSuiteSyncTags':
                            return 'Daten als Expensify-Tags importieren';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Verbindungsinformationen werden aktualisiert';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensify-Berichte als erstattet markieren';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuite-Rechnungen und -Gutschriften als bezahlt markieren';
                        case 'netSuiteImportVendorsTitle':
                            return 'Lieferanten importieren';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Benutzerdefinierte Listen importieren';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Benutzerdefinierte Listen importieren';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Import von Tochtergesellschaften';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Lieferanten importieren';
                        case 'intacctCheckConnection':
                            return 'Sage Intacct-Verbindung wird überprüft';
                        case 'intacctImportDimensions':
                            return 'Sage Intacct-Dimensionen werden importiert';
                        case 'intacctImportTitle':
                            return 'Importieren von Sage-Intacct-Daten';
                        default: {
                            return `Übersetzung für Stufe fehlt: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Bevorzugter Exporteur',
            exportPreferredExporterNote:
                'Der bevorzugte Exporteur kann jede Workspace-Administration sein, muss aber auch Domain-Administrator*in sein, wenn du in den Domaineinstellungen unterschiedliche Exportkonten für einzelne Firmenkarten festlegst.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur in seinem Konto Berichte zum Export.',
            exportAs: 'Exportieren als',
            exportOutOfPocket: 'Persönliche Auslagen exportieren als',
            exportCompanyCard: 'Firmenkartenausgaben exportieren als',
            exportDate: 'Exportdatum',
            defaultVendor: 'Standardanbieter',
            autoSync: 'Automatische Synchronisierung',
            autoSyncDescription: 'NetSuite und Expensify automatisch, täglich synchronisieren. Finalisierte Berichte in Echtzeit exportieren',
            reimbursedReports: 'Erstattete Berichte synchronisieren',
            cardReconciliation: 'Kartenabstimmung',
            reconciliationAccount: 'Abstimmungskonto',
            continuousReconciliation: 'Kontinuierliche Abstimmung',
            saveHoursOnReconciliation:
                'Sparen Sie in jeder Abrechnungsperiode Stunden bei der Abstimmung, indem Expensify fortlaufend Expensify Card-Kontoauszüge und -Abrechnungen automatisch für Sie abstimmt.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Um die kontinuierliche Abstimmung zu aktivieren, aktiviere bitte die <a href="${accountingAdvancedSettingsLink}">Auto-Synchronisierung</a> für ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wähle das Bankkonto aus, mit dem deine Expensify Card-Zahlungen abgeglichen werden.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Stellen Sie sicher, dass dieses Konto mit Ihrem <a href="${settlementAccountUrl}">Expensify Card-Abwicklungskonto</a> (endet auf ${lastFourPAN}) übereinstimmt, damit die kontinuierliche Abstimmung ordnungsgemäß funktioniert.`,
            },
        },
        export: {
            notReadyHeading: 'Nicht bereit zum Exportieren',
            notReadyDescription:
                'Entwürfe oder ausstehende Spesenabrechnungen können nicht in das Buchhaltungssystem exportiert werden. Bitte genehmigen oder bezahlen Sie diese Spesen, bevor Sie sie exportieren.',
        },
        invoices: {
            sendInvoice: 'Rechnung senden',
            sendFrom: 'Senden von',
            invoicingDetails: 'Rechnungsdetails',
            invoicingDetailsDescription: 'Diese Informationen erscheinen auf deinen Rechnungen.',
            companyName: 'Firmenname',
            companyWebsite: 'Firmenwebsite',
            paymentMethods: {
                personal: 'Persönlich',
                business: 'Geschäft',
                chooseInvoiceMethod: 'Wähle unten eine Zahlungsmethode aus:',
                payingAsIndividual: 'Als Privatperson bezahlen',
                payingAsBusiness: 'Als Unternehmen bezahlen',
            },
            invoiceBalance: 'Rechnungsbetrag',
            invoiceBalanceSubtitle:
                'Das ist Ihr aktueller Kontostand aus eingegangenen Rechnungszahlungen. Er wird automatisch auf Ihr Bankkonto überwiesen, wenn Sie eines hinzugefügt haben.',
            bankAccountsSubtitle: 'Füge ein Bankkonto hinzu, um Rechnungen zu bezahlen und Zahlungen zu empfangen.',
        },
        invite: {
            member: 'Mitglied einladen',
            members: 'Mitglieder einladen',
            invitePeople: 'Neue Mitglieder einladen',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Arbeitsbereich ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            pleaseEnterValidLogin: `Bitte stellen Sie sicher, dass die E-Mail-Adresse oder Telefonnummer gültig ist (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'Benutzer',
            users: 'Nutzende',
            invited: 'eingeladen',
            removed: 'entfernt',
            to: 'bis',
            from: 'von',
        },
        inviteMessage: {
            confirmDetails: 'Details bestätigen',
            inviteMessagePrompt: 'Machen Sie Ihre Einladung noch besonderer, indem Sie unten eine Nachricht hinzufügen!',
            personalMessagePrompt: 'Nachricht',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Arbeitsbereich ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            inviteNoMembersError: 'Bitte wähle mindestens ein Mitglied zum Einladen aus',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} hat beantragt, ${workspaceName} beizutreten`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ups! Nicht so schnell ...',
            workspaceNeeds: 'Ein Workspace benötigt mindestens einen aktivierten Entfernungssatz.',
            distance: 'Entfernung',
            centrallyManage: 'Kilometersätze zentral verwalten, in Meilen oder Kilometern nachverfolgen und eine Standardkategorie festlegen.',
            rate: 'Bewerten',
            addRate: 'Satz hinzufügen',
            findRate: 'Kurs finden',
            trackTax: 'Steuern verfolgen',
            deleteRates: () => ({
                one: 'Satz löschen',
                other: 'Tarife löschen',
            }),
            enableRates: () => ({
                one: 'Rate aktivieren',
                other: 'Tarife aktivieren',
            }),
            disableRates: () => ({
                one: 'Rate deaktivieren',
                other: 'Tarife deaktivieren',
            }),
            enableRate: 'Rate aktivieren',
            status: 'Status',
            unit: 'Einheit',
            taxFeatureNotEnabledMessage:
                '<muted-text>Steuern müssen im Workspace aktiviert sein, um diese Funktion zu nutzen. Geh zu <a href="#">Weitere Funktionen</a>, um diese Änderung vorzunehmen.</muted-text>',
            deleteDistanceRate: 'Streckenpauschale löschen',
            areYouSureDelete: () => ({
                one: 'Sind Sie sicher, dass Sie diesen Satz löschen möchten?',
                other: 'Möchtest du diese Sätze wirklich löschen?',
            }),
            errors: {
                rateNameRequired: 'Tarifname ist erforderlich',
                existingRateName: 'Ein Kilometersatz mit diesem Namen ist bereits vorhanden',
            },
        },
        editor: {
            descriptionInputLabel: 'Beschreibung',
            nameInputLabel: 'Name',
            typeInputLabel: 'Art',
            initialValueInputLabel: 'Anfangswert',
            nameInputHelpText: 'Dies ist der Name, den Sie in Ihrem Workspace sehen.',
            nameIsRequiredError: 'Du musst deinem Arbeitsbereich einen Namen geben',
            currencyInputLabel: 'Standardwährung',
            currencyInputHelpText: 'Alle Ausgaben in diesem Workspace werden in diese Währung umgerechnet.',
            currencyInputDisabledText: (currency: string) => `Die Standardwährung kann nicht geändert werden, da dieser Workspace mit einem Bankkonto in ${currency} verknüpft ist.`,
            save: 'Speichern',
            genericFailureMessage: 'Beim Aktualisieren des Arbeitsbereichs ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            addressContext: 'Eine Workspace-Adresse ist erforderlich, um Expensify Travel zu aktivieren. Bitte gib eine Adresse ein, die mit deinem Unternehmen verbunden ist.',
            policy: 'Spesenrichtlinie',
        },
        bankAccount: {
            continueWithSetup: 'Einrichtung fortsetzen',
            youAreAlmostDone:
                'Sie sind fast fertig mit der Einrichtung Ihres Bankkontos. Danach können Sie Firmenkarten ausgeben, Ausgaben erstatten, Rechnungen einziehen und Zahlungen tätigen.',
            streamlinePayments: 'Zahlungen optimieren',
            connectBankAccountNote: 'Hinweis: Persönliche Bankkonten können nicht für Zahlungen in Arbeitsbereichen verwendet werden.',
            oneMoreThing: 'Noch eine Sache!',
            allSet: 'Alles bereit!',
            accountDescriptionWithCards: 'Dieses Bankkonto wird verwendet, um Firmenkarten auszustellen, Ausgaben zu erstatten, Rechnungen einzuziehen und Rechnungen zu bezahlen.',
            letsFinishInChat: 'Lass uns im Chat fertig machen!',
            finishInChat: 'Im Chat abschließen',
            almostDone: 'Fast geschafft!',
            disconnectBankAccount: 'Bankkonto trennen',
            startOver: 'Neu starten',
            updateDetails: 'Details aktualisieren',
            yesDisconnectMyBankAccount: 'Ja, mein Bankkonto trennen',
            yesStartOver: 'Ja, neu beginnen',
            disconnectYourBankAccount: (bankName: string) =>
                `Trenne dein <strong>${bankName}</strong>-Bankkonto. Alle ausstehenden Transaktionen für dieses Konto werden trotzdem abgeschlossen.`,
            clearProgress: 'Wenn du neu beginnst, wird dein bisheriger Fortschritt gelöscht.',
            areYouSure: 'Bist du sicher?',
            workspaceCurrency: 'Workspace-Währung',
            updateCurrencyPrompt:
                'Ihr Workspace ist derzeit auf eine andere Währung als USD eingestellt. Bitte klicken Sie auf die Schaltfläche unten, um Ihre Währung jetzt auf USD zu aktualisieren.',
            updateToUSD: 'Auf USD aktualisieren',
            updateWorkspaceCurrency: 'Arbeitsbereichswährung aktualisieren',
            workspaceCurrencyNotSupported: 'Workspace-Währung wird nicht unterstützt',
            yourWorkspace: `Ihr Arbeitsbereich ist auf eine nicht unterstützte Währung eingestellt. Sehen Sie sich die <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">Liste der unterstützten Währungen</a> an.`,
            chooseAnExisting: 'Wählen Sie ein bestehendes Bankkonto, um Ausgaben zu bezahlen, oder fügen Sie ein neues hinzu.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Inhaberschaft übertragen',
            addPaymentCardTitle: 'Gib deine Zahlungskarte ein, um die Inhaberschaft zu übertragen',
            addPaymentCardButtonText: 'Bedingungen akzeptieren & Zahlungskarte hinzufügen',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Lies und akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und die <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutz</a>-Richtlinie, um deine Karte hinzuzufügen.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS-konform',
            addPaymentCardBankLevelEncrypt: 'Verschlüsselung auf Bankniveau',
            addPaymentCardRedundant: 'Redundante Infrastruktur',
            addPaymentCardLearnMore: `<muted-text>Erfahre mehr über unsere <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">Sicherheit</a>.</muted-text>`,
            amountOwedTitle: 'Offener Saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Dieses Konto hat einen ausstehenden Saldo aus einem vorherigen Monat.\n\nMöchtest du den Saldo ausgleichen und die Abrechnung für diesen Workspace übernehmen?',
            ownerOwesAmountTitle: 'Offener Saldo',
            ownerOwesAmountButtonText: 'Saldo übertragen',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `Das Konto, dem dieser Workspace gehört (${email}), hat einen ausstehenden Saldo aus einem vorherigen Monat.

Möchtest du diesen Betrag (${amount}) überweisen, um die Abrechnung für diesen Workspace zu übernehmen? Deine Zahlungskarte wird sofort belastet.`,
            subscriptionTitle: 'Jahresabonnement übernehmen',
            subscriptionButtonText: 'Abonnement übertragen',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Die Übernahme dieses Workspaces führt dazu, dass dessen Jahresabonnement mit Ihrem aktuellen Abonnement zusammengelegt wird. Dadurch erhöht sich die Größe Ihres Abonnements um ${usersCount} Mitglieder und Ihre neue Abonnementgröße beträgt ${finalCount}. Möchten Sie fortfahren?`,
            duplicateSubscriptionTitle: 'Warnung zu doppeltem Abonnement',
            duplicateSubscriptionButtonText: 'Weiter',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Es sieht so aus, als ob du versuchst, die Abrechnung für die Workspaces von ${email} zu übernehmen. Dafür musst du jedoch zunächst in allen ihren Workspaces Admin sein.

Klicke auf „Weiter“, wenn du die Abrechnung nur für den Workspace ${workspaceName} übernehmen möchtest.

Wenn du die Abrechnung für ihr gesamtes Abonnement übernehmen möchtest, bitte sie zuerst, dich in allen ihren Workspaces als Admin hinzuzufügen, bevor du die Abrechnung übernimmst.`,
            hasFailedSettlementsTitle: 'Eigentumsübertragung nicht möglich',
            hasFailedSettlementsButtonText: 'Verstanden',
            hasFailedSettlementsText: (email: string) =>
                `Du kannst die Abrechnung nicht übernehmen, weil ${email} einen überfälligen Expensify Card-Ausgleich hat. Bitte bitte diese Person, sich an concierge@expensify.com zu wenden, um das Problem zu lösen. Danach kannst du die Abrechnung für diesen Workspace übernehmen.`,
            failedToClearBalanceTitle: 'Ausgleich konnte nicht gelöscht werden',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Wir konnten den Saldo nicht ausgleichen. Bitte versuche es später erneut.',
            successTitle: 'Juhu! Alles eingerichtet.',
            successDescription: 'Sie sind jetzt Eigentümer*in dieses Arbeitsbereichs.',
            errorTitle: 'Ups! Nicht so schnell ...',
            errorDescription: `<muted-text><centered-text>Beim Übertragen der Inhaberschaft dieses Arbeitsbereichs ist ein Problem aufgetreten. Versuche es erneut oder <concierge-link>wende dich für Hilfe an Concierge</concierge-link>.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Vorsicht!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `Die folgenden Berichte wurden bereits nach ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} exportiert:

${reportName}

Möchtest du sie wirklich noch einmal exportieren?`,
            confirmText: 'Ja, erneut exportieren',
            cancelText: 'Abbrechen',
        },
        upgrade: {
            reportFields: {
                title: 'Berichtsfelder',
                description: `Berichts­felder ermöglichen es Ihnen, Details auf Kopfebene anzugeben, die sich von Tags unterscheiden, welche sich auf Ausgaben einzelner Positionen beziehen. Diese Details können spezifische Projektnamen, Informationen zu Geschäftsreisen, Standorte und mehr umfassen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Berichts­felder sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Profitiere von automatischer Synchronisierung und reduziere manuelle Eingaben mit der Expensify + NetSuite-Integration. Erhalte detaillierte, nahezu in Echtzeit verfügbare Finanzanalysen mit Unterstützung für native und benutzerdefinierte Segmente, einschließlich Projekt- und Kundenabgleich.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere NetSuite-Integration ist nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Profitieren Sie von automatischer Synchronisierung und reduzieren Sie manuelle Eingaben mit der Expensify + Sage Intacct-Integration. Erhalten Sie detaillierte Finanzanalysen in Echtzeit mit benutzerdefinierten Dimensionen sowie Spesencodierung nach Abteilung, Klasse, Standort, Kunde und Projekt (Job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere Sage Intacct-Integration ist nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Profitiere von automatischer Synchronisierung und reduziere manuelle Eingaben mit der Expensify + QuickBooks Desktop-Integration. Erreiche maximale Effizienz mit einer Echtzeit-Zwei-Wege-Verbindung und Spesencodierung nach Klasse, Artikel, Kunde und Projekt.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere QuickBooks Desktop-Integration ist nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Erweiterte Genehmigungen',
                description: `Wenn du weitere Genehmigungsstufen hinzufügen möchtest – oder einfach sicherstellen willst, dass besonders hohe Ausgaben noch einmal geprüft werden – bist du bei uns richtig. Erweiterte Genehmigungen helfen dir, auf jeder Ebene die passenden Kontrollen einzurichten, damit du die Ausgaben deines Teams im Griff behältst.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Erweiterte Genehmigungen sind nur im Control-Tarif verfügbar, der bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`} beginnt</muted-text>`,
            },
            categories: {
                title: 'Kategorien',
                description: 'Kategorien helfen dir, Ausgaben zu verfolgen und zu organisieren. Nutze unsere Standardkategorien oder füge eigene hinzu.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kategorien sind im Collect-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            glCodes: {
                title: 'Sachkonten-Codes',
                description: `Füge deinen Kategorien und Tags Sachkonten hinzu, um Ausgaben einfach in deine Buchhaltungs- und Gehaltssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kontenpläne (GL-Codes) sind nur im Control-Tarif verfügbar, beginnend ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Hauptbuch- und Lohnabrechnungscodes',
                description: `Fügen Sie Ihren Kategorien Hauptbuch- und Lohnabrechnungscodes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Lohnabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Sachkonten- und Lohnabrechnungscodes sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Steuercodes',
                description: `Fügen Sie Ihren Steuern Steuerschlüssel hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Lohnabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Steuerschlüssel sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            companyCards: {
                title: 'Unbegrenzte Firmenkarten',
                description: `Müssen Sie weitere Kartenfeeds hinzufügen? Schalten Sie unbegrenzt viele Firmenkarten frei, um Transaktionen von allen großen Kartenausstellern zu synchronisieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dies ist nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            rules: {
                title: 'Regeln',
                description: `Regeln laufen im Hintergrund und halten Ihre Ausgaben unter Kontrolle, damit Sie sich nicht um Kleinigkeiten kümmern müssen.

Fordern Sie Ausgabendetails wie Belege und Beschreibungen an, legen Sie Grenzen und Standardwerte fest und automatisieren Sie Genehmigungen und Zahlungen – alles an einem Ort.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Regeln sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            perDiem: {
                title: 'Tagespauschale',
                description:
                    'Tagespauschalen sind eine hervorragende Möglichkeit, die täglichen Kosten bei Dienstreisen Ihrer Mitarbeitenden regelkonform und planbar zu halten. Nutzen Sie Funktionen wie individuelle Pauschalsätze, Standardkategorien und detaillierte Einstellungen wie Reiseziele und Teilpauschalen.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Tagessätze sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            travel: {
                title: 'Reisen',
                description:
                    'Expensify Travel ist eine neue Plattform für die Buchung und Verwaltung von Geschäftsreisen, mit der Mitglieder Unterkünfte, Flüge, Transport und mehr buchen können.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Reisen ist im Collect-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            reports: {
                title: 'Berichte',
                description: 'Berichte ermöglichen es dir, Ausgaben zur einfacheren Nachverfolgung und Organisation zu gruppieren.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Berichte sind im Collect-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Mehrstufige Tags',
                description:
                    'Mehrstufige Tags helfen Ihnen, Ausgaben präziser zu verfolgen. Weisen Sie jeder Position mehrere Tags zu – etwa Abteilung, Kunde oder Kostenstelle –, um den vollständigen Kontext jeder Ausgabe zu erfassen. So werden detailliertere Berichte, Genehmigungsabläufe und Buchhaltungsexporte ermöglicht.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Mehrstufige Tags sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Entfernungssätze',
                description: 'Erstelle und verwalte deine eigenen Sätze, verfolge Entfernungen in Meilen oder Kilometern und lege Standardkategorien für Entfernungskosten fest.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Entfernungsraten sind im Collect-Tarif verfügbar, beginnend ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            auditor: {
                title: 'Prüfer',
                description: 'Prüfer erhalten schreibgeschützten Zugriff auf alle Berichte für vollständige Transparenz und Überwachung der Compliance.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Prüfer:innen sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Mehrere Genehmigungsebenen',
                description:
                    'Mehrere Genehmigungsstufen sind ein Workflow-Tool für Unternehmen, die mehr als eine Person benötigen, um einen Bericht zu genehmigen, bevor er erstattet werden kann.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Mehrere Genehmigungsstufen sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'pro aktivem Mitglied und Monat.',
                perMember: 'pro Mitglied und Monat.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Upgrade durchführen, um auf diese Funktion zuzugreifen, oder <a href="${subscriptionLink}">weitere Informationen</a> zu unseren Tarifen und Preisen erhalten.</muted-text>`,
            upgradeToUnlock: 'Diese Funktion freischalten',
            completed: {
                headline: `Du hast deinen Workspace aktualisiert!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Du hast ${policyName} erfolgreich auf den Control-Tarif hochgestuft! <a href="${subscriptionLink}">Abonnement anzeigen</a> für weitere Details.</centered-text>`,
                categorizeMessage: `Du hast erfolgreich auf den Collect‑Tarif upgegradet. Jetzt kannst du deine Ausgaben kategorisieren!`,
                travelMessage: `Du hast erfolgreich auf den Collect‑Tarif upgegradet. Jetzt kannst du mit der Buchung und Verwaltung von Reisen beginnen!`,
                distanceRateMessage: `Du hast erfolgreich auf den Collect‑Tarif upgegradet. Jetzt kannst du den Entfernungssatz ändern!`,
                gotIt: 'Verstanden, danke',
                createdWorkspace: `Sie haben einen Arbeitsbereich erstellt!`,
            },
            commonFeatures: {
                title: 'Zum Control-Tarif upgraden',
                note: 'Schalte unsere leistungsstärksten Funktionen frei, einschließlich:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Der Control-Tarif beginnt bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}. <a href="${learnMoreMethodsRoute}">Erfahre mehr</a> über unsere Tarife und Preise.</muted-text>`,
                    benefit1: 'Erweiterte Buchhaltungsverbindungen (NetSuite, Sage Intacct und mehr)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Genehmigungsworkflows mit mehreren Ebenen',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    toUpgrade: 'Zum Upgrade klicke',
                    selectWorkspace: 'Wähle einen Arbeitsbereich aus und ändere den Plantyp in',
                },
                upgradeWorkspaceWarning: `Workspace kann nicht aktualisiert werden`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt:
                    'Ihr Unternehmen hat die Erstellung von Workspaces eingeschränkt. Bitte wenden Sie sich an eine:n Admin, um Hilfe zu erhalten.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Auf den Collect-Tarif downgraden',
                note: 'Wenn du ein Downgrade durchführst, verlierst du den Zugriff auf diese und weitere Funktionen:',
                benefits: {
                    note: 'Eine vollständige Übersicht über unsere Tarife finden Sie in unserer',
                    pricingPage: 'Preisseite',
                    confirm: 'Möchtest du wirklich ein Downgrade durchführen und deine Konfigurationen entfernen?',
                    warning: 'Dies kann nicht rückgängig gemacht werden.',
                    benefit1: 'Buchhaltungsverbindungen (außer QuickBooks Online und Xero)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Genehmigungsworkflows mit mehreren Ebenen',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    headsUp: 'Achtung!',
                    multiWorkspaceNote: 'Sie müssen alle Ihre Arbeitsbereiche vor Ihrer ersten monatlichen Zahlung herabstufen, um ein Abonnement zum Collect-Tarif zu beginnen. Klicken Sie',
                    selectStep: '> Wähle jeden Workspace aus > ändere den Plantyp in',
                },
            },
            completed: {
                headline: 'Dein Workspace wurde herabgestuft',
                description: 'Sie haben weitere Arbeitsbereiche mit dem Control‑Tarif. Damit Sie zum Collect‑Tarif abgerechnet werden, müssen Sie alle Arbeitsbereiche herabstufen.',
                gotIt: 'Verstanden, danke',
            },
        },
        payAndDowngrade: {
            title: 'Bezahlen & Downgrade',
            headline: 'Ihre letzte Zahlung',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Ihre endgültige Rechnung für dieses Abonnement beträgt <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Sieh dir unten deine Aufschlüsselung für ${date} an:`,
            subscription:
                'Achtung! Diese Aktion beendet dein Expensify-Abo, löscht diesen Workspace und entfernt alle Workspace-Mitglieder. Wenn du diesen Workspace behalten und nur dich selbst entfernen möchtest, lass zuerst eine andere Adminperson die Abrechnung übernehmen.',
            genericFailureMessage: 'Beim Bezahlen Ihrer Rechnung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        restrictedAction: {
            restricted: 'Eingeschränkt',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Aktionen im Workspace ${workspaceName} sind derzeit eingeschränkt`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Der/die Workspace-Inhaber:in ${workspaceOwnerName} muss die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Workspace-Aktivitäten freizuschalten.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Sie müssen die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Aktivitäten im Arbeitsbereich freizuschalten.',
            addPaymentCardToUnlock: 'Füge eine Zahlungskarte hinzu, um alles freizuschalten!',
            addPaymentCardToContinueUsingWorkspace: 'Füge eine Zahlungsmethode hinzu, um diesen Workspace weiter zu nutzen',
            pleaseReachOutToYourWorkspaceAdmin: 'Bitte wende dich bei Fragen an deine Workspace-Administration.',
            chatWithYourAdmin: 'Chatte mit deiner Adminperson',
            chatInAdmins: 'Chat in #admins',
            addPaymentCard: 'Zahlungskarte hinzufügen',
            goToSubscription: 'Zu Abo wechseln',
        },
        rules: {
            individualExpenseRules: {
                title: 'Ausgaben',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Lege Ausgabenkontrollen und Standardwerte für einzelne Ausgaben fest. Du kannst außerdem Regeln für <a href="${categoriesPageLink}">Kategorien</a> und <a href="${tagsPageLink}">Tags</a> erstellen.</muted-text>`,
                receiptRequiredAmount: 'Erforderlicher Belegbetrag',
                receiptRequiredAmountDescription: 'Belege verlangen, wenn die Ausgaben diesen Betrag überschreiten, außer wenn dies durch eine Kategorienregel überschrieben wird.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `Der Betrag darf den für den Einzelbeleg erforderlichen Betrag (${amount}) nicht überschreiten`,
                itemizedReceiptRequiredAmount: 'Erforderlicher Betrag für Einzelbeleg',
                itemizedReceiptRequiredAmountDescription:
                    'Positionierte Belege verlangen, wenn die Ausgaben diesen Betrag überschreiten, es sei denn, eine Kategorienregel setzt dies außer Kraft.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `Der Betrag darf nicht niedriger sein als der für reguläre Belege erforderliche Betrag (${amount})`,
                maxExpenseAmount: 'Maximaler Ausgabenbetrag',
                maxExpenseAmountDescription: 'Kennzeichne Ausgaben, die diesen Betrag überschreiten, es sei denn, sie werden durch eine Kategorieregel außer Kraft gesetzt.',
                maxAge: 'Maximalalter',
                maxExpenseAge: 'Maximales Spesenalter',
                maxExpenseAgeDescription: 'Ausgaben markieren, die älter als eine bestimmte Anzahl von Tagen sind.',
                maxExpenseAgeDays: () => ({
                    one: '1 Tag',
                    other: (count: number) => `${count} Tage`,
                }),
                cashExpenseDefault: 'Standardwert für Barausgaben',
                cashExpenseDefaultDescription:
                    'Wählen Sie aus, wie Barausgaben erstellt werden sollen. Eine Ausgabe gilt als Barausgabe, wenn sie keine importierte Firmenkartentransaktion ist. Dazu gehören manuell erstellte Ausgaben, Belege, Pauschalen, Entfernungs- und Zeitausgaben.',
                reimbursableDefault: 'Erstattungsfähig',
                reimbursableDefaultDescription: 'Spesen werden meist an Mitarbeitende zurückgezahlt',
                nonReimbursableDefault: 'Nicht erstattungsfähig',
                nonReimbursableDefaultDescription: 'Spesen werden gelegentlich an Mitarbeitende zurückgezahlt',
                alwaysReimbursable: 'Immer erstattungsfähig',
                alwaysReimbursableDescription: 'Auslagen werden Mitarbeitenden immer zurückerstattet',
                alwaysNonReimbursable: 'Immer nicht erstattungsfähig',
                alwaysNonReimbursableDescription: 'Auslagen werden Mitarbeitenden niemals erstattet',
                billableDefault: 'Standardwert für verrechenbar',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Wähle, ob Bar- und Kreditkartenausgaben standardmäßig verrechenbar sein sollen. Verrechenbare Ausgaben werden in den <a href="${tagsPageLink}">Tags</a> aktiviert oder deaktiviert.</muted-text>`,
                billable: 'Abrechenbar',
                billableDescription: 'Spesen werden meist an Kund:innen weiterberechnet',
                nonBillable: 'Nicht abrechenbar',
                nonBillableDescription: 'Spesen werden gelegentlich an Kund:innen weiterverrechnet',
                eReceipts: 'eBelege',
                eReceiptsHint: `eBelege werden automatisch erstellt [für die meisten Kreditkartentransaktionen in USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Teilnehmerverfolgung',
                attendeeTrackingHint: 'Verfolge die Pro-Kopf-Kosten für jede Ausgabe.',
                prohibitedDefaultDescription:
                    'Markiere alle Belege, auf denen Alkohol, Glücksspiel oder andere eingeschränkte Artikel erscheinen. Ausgaben mit Belegen, auf denen diese Positionen vorkommen, müssen manuell überprüft werden.',
                prohibitedExpenses: 'Unzulässige Ausgaben',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Nebenkosten im Hotel',
                gambling: 'Glücksspiel',
                tobacco: 'Tabak',
                adultEntertainment: 'Erwachsenenunterhaltung',
                requireCompanyCard: 'Firmenkarten für alle Einkäufe erforderlich',
                requireCompanyCardDescription: 'Kennzeichne alle Barausgaben, einschließlich Kilometer- und Tagegeldspesen.',
            },
            expenseReportRules: {
                title: 'Erweitert',
                subtitle: 'Automatisieren Sie die Einhaltung von Spesenrichtlinien, Genehmigungen und Zahlungen.',
                preventSelfApprovalsTitle: 'Selbstgenehmigungen verhindern',
                preventSelfApprovalsSubtitle: 'Verhindere, dass Arbeitsbereichsmitglieder ihre eigenen Spesenabrechnungen genehmigen.',
                autoApproveCompliantReportsTitle: 'Regelkonforme Berichte automatisch genehmigen',
                autoApproveCompliantReportsSubtitle: 'Konfigurieren Sie, welche Spesenabrechnungen für die automatische Genehmigung infrage kommen.',
                autoApproveReportsUnderTitle: 'Berichte automatisch genehmigen unter',
                autoApproveReportsUnderDescription: 'Vollständig konforme Spesenabrechnungen unter diesem Betrag werden automatisch genehmigt.',
                randomReportAuditTitle: 'Stichprobenprüfung von Berichten',
                randomReportAuditDescription: 'Verlange, dass einige Berichte manuell genehmigt werden, selbst wenn sie für die automatische Genehmigung infrage kommen.',
                autoPayApprovedReportsTitle: 'Berichte mit Auto-Zahlung genehmigen',
                autoPayApprovedReportsSubtitle: 'Konfigurieren, welche Spesenabrechnungen für die automatische Zahlung infrage kommen.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Bitte gib einen Betrag ein, der kleiner ist als ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle: 'Gehe zu „Weitere Funktionen“ und aktiviere „Workflows“, dann füge Zahlungen hinzu, um diese Funktion freizuschalten.',
                autoPayReportsUnderTitle: 'Berichte automatisch bezahlen unter',
                autoPayReportsUnderDescription: 'Vollständig konforme Spesenberichte unter diesem Betrag werden automatisch bezahlt.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Füge ${featureName} hinzu, um diese Funktion freizuschalten.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Gehe zu [weitere Funktionen](${moreFeaturesLink}) und aktiviere ${featureName}, um diese Funktion freizuschalten.`,
            },
            merchantRules: {
                title: 'Händler',
                subtitle: 'Legen Sie Händlerregeln fest, damit Spesen korrekt codiert ankommen und weniger Nachbearbeitung erfordern.',
                addRule: 'Händlerregel hinzufügen',
                addRuleTitle: 'Regel hinzufügen',
                editRuleTitle: 'Regel bearbeiten',
                expensesWith: 'Für Ausgaben mit:',
                expensesExactlyMatching: 'Für Ausgaben mit genau folgender Übereinstimmung:',
                applyUpdates: 'Diese Aktualisierungen anwenden:',
                saveRule: 'Regel speichern',
                previewMatches: 'Übereinstimmungen anzeigen',
                confirmError: 'Händler eingeben und mindestens eine Aktualisierung anwenden',
                confirmErrorMerchant: 'Bitte Händlernamen eingeben',
                confirmErrorUpdate: 'Bitte nimm mindestens eine Aktualisierung vor',
                previewMatchesEmptyStateTitle: 'Nichts anzuzeigen',
                previewMatchesEmptyStateSubtitle: 'Keine nicht eingereichten Ausgaben entsprechen dieser Regel.',
                deleteRule: 'Regel löschen',
                deleteRuleConfirmation: 'Sind Sie sicher, dass Sie diese Regel löschen möchten?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `Wenn Händler ${isExactMatch ? 'stimmt genau überein' : 'enthält'} „${merchantName}“`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Händler in „${merchantName}“ umbenennen`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `${fieldName} auf „${fieldValue}“ aktualisieren`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Als „${reimbursable ? 'erstattungsfähig' : 'nicht erstattungsfähig'}“ markieren`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Als „${billable ? 'abrechenbar' : 'nicht berechenbar'}“ markieren`,
                matchType: 'Übereinstimmungstyp',
                matchTypeContains: 'Enthält',
                matchTypeExact: 'Genau passend',
                duplicateRuleTitle: 'Ähnliche Händlerregel existiert bereits',
                duplicateRulePrompt: (merchantName: string) => `Möchtest du eine neue Regel für „${merchantName}“ speichern, obwohl du bereits eine bestehende hast?`,
                saveAnyway: 'Trotzdem speichern',
                applyToExistingUnsubmittedExpenses: 'Auf bereits vorhandene nicht eingereichte Ausgaben anwenden',
            },
            categoryRules: {
                title: 'Kategorienregeln',
                approver: 'Genehmigende Person',
                requireDescription: 'Beschreibung erforderlich',
                requireFields: 'Felder erforderlich',
                requiredFieldsTitle: 'Pflichtfelder',
                requiredFieldsDescription: (categoryName: string) => `Dies gilt für alle Ausgaben, die als <strong>${categoryName}</strong> kategorisiert sind.`,
                requireAttendees: 'Teilnehmer erforderlich',
                descriptionHint: 'Beschreibungshinweis',
                descriptionHintDescription: (categoryName: string) =>
                    `Mitarbeitende daran erinnern, zusätzliche Informationen für Ausgaben der Kategorie „${categoryName}“ anzugeben. Dieser Hinweis erscheint im Beschreibungsfeld von Ausgaben.`,
                descriptionHintLabel: 'Hinweis',
                descriptionHintSubtitle: 'Profi-Tipp: Je kürzer, desto besser!',
                maxAmount: 'Maximalbetrag',
                flagAmountsOver: 'Beträge markieren über',
                flagAmountsOverDescription: (categoryName: string) => `Gilt für die Kategorie „${categoryName}“.`,
                flagAmountsOverSubtitle: 'Dadurch wird der Höchstbetrag für alle Spesen überschrieben.',
                expenseLimitTypes: {
                    expense: 'Einzelne Ausgabe',
                    expenseSubtitle: 'Markiere Ausgabenbeträge nach Kategorie. Diese Regel überschreibt die allgemeine Workspace-Regel für den maximalen Ausgabenbetrag.',
                    daily: 'Kategoriegesamtbetrag',
                    dailySubtitle: 'Tägliche Gesamtausgaben pro Kategorie je Spesenbericht kennzeichnen.',
                },
                requireReceiptsOver: 'Belege erforderlich ab',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standard`,
                    never: 'Belege niemals anfordern',
                    always: 'Belege immer erforderlich',
                },
                requireItemizedReceiptsOver: 'Einzelne Positionen auf Belegen erforderlich über',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standard`,
                    never: 'Niemals detaillierte Belege anfordern',
                    always: 'Immer Einzelbelege verlangen',
                },
                defaultTaxRate: 'Standardsteuersatz',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Gehe zu [Weitere Funktionen](${moreFeaturesLink}) und aktiviere Workflows, füge dann Genehmigungen hinzu, um diese Funktion freizuschalten.`,
            },
            customRules: {
                title: 'Spesenrichtlinie',
                cardSubtitle: 'Hier findest du die Spesenrichtlinie deines Teams, damit alle wissen, was abgedeckt ist.',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Einziehen',
                    description: 'Für Teams, die ihre Prozesse automatisieren möchten.',
                },
                corporate: {
                    label: 'Steuerung',
                    description: 'Für Unternehmen mit erweiterten Anforderungen.',
                },
            },
            description: 'Wähle ein passendes Abo für dich. Eine detaillierte Liste der Funktionen und Preise findest du in unserer',
            subscriptionLink: 'Hilfeseite zu Plantypen und Preisen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Sie haben sich bis zum Ende Ihres Jahresabonnements am ${annualSubscriptionEndDate} zu 1 aktivem Mitglied im Control-Tarif verpflichtet. Sie können ab dem ${annualSubscriptionEndDate} zu einem nutzungsbasierten Abonnement wechseln und auf den Collect-Tarif herabstufen, indem Sie die automatische Verlängerung in deaktivieren`,
                other: `Sie haben sich bis zum Ende Ihres Jahresabonnements am ${annualSubscriptionEndDate} zu ${count} aktiven Mitgliedern im Control-Tarif verpflichtet. Sie können ab dem ${annualSubscriptionEndDate} zu einem nutzungsabhängigen Abonnement wechseln und zum Collect-Tarif herabstufen, indem Sie die automatische Verlängerung in`,
            }),
            subscriptions: 'Abonnements',
        },
    },
    getAssistancePage: {
        title: 'Hilfe erhalten',
        subtitle: 'Wir sind hier, um dir den Weg zur Großartigkeit zu ebnen!',
        description: 'Wähle aus den folgenden Supportoptionen:',
        chatWithConcierge: 'Mit Concierge chatten',
        scheduleSetupCall: 'Einrichtungsgespräch planen',
        scheduleACall: 'Anruf planen',
        questionMarkButtonTooltip: 'Hilfe von unserem Team erhalten',
        exploreHelpDocs: 'Hilfedokumente durchsuchen',
        registerForWebinar: 'Für Webinar registrieren',
        onboardingHelp: 'Onboarding-Hilfe',
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
            flags: 'Markierungen',
        },
    },
    newRoomPage: {
        newRoom: 'Neuer Raum',
        groupName: 'Gruppenname',
        roomName: 'Raumname',
        visibility: 'Sichtbarkeit',
        restrictedDescription: 'Personen in deinem Arbeitsbereich können diesen Raum finden',
        privateDescription: 'Eingeladene Personen können diesen Raum finden',
        publicDescription: 'Jede Person kann diesen Raum finden',
        public_announceDescription: 'Jede Person kann diesen Raum finden',
        createRoom: 'Raum erstellen',
        roomAlreadyExistsError: 'Ein Raum mit diesem Namen existiert bereits',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} ist ein Standardraum in allen Workspaces. Bitte wähle einen anderen Namen.`,
        roomNameInvalidError: 'Raumnamen dürfen nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
        pleaseEnterRoomName: 'Bitte gib einen Raumnamen ein',
        pleaseSelectWorkspace: 'Bitte wähle einen Arbeitsbereich aus',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}in "${newName}" umbenannt (zuvor "${oldName}")` : `${actor}hat diesen Raum in „${newName}“ umbenannt (zuvor „${oldName}“)`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Raum in ${newName} umbenannt`,
        social: 'sozial',
        selectAWorkspace: 'Arbeitsbereich auswählen',
        growlMessageOnRenameError: 'Arbeitsbereichsraum kann nicht umbenannt werden. Bitte überprüfe deine Verbindung und versuche es erneut.',
        visibilityOptions: {
            restricted: 'Arbeitsbereich',
            private: 'Privat',
            public: 'Öffentlich',
            public_announce: 'Öffentliche Ankündigung',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Einreichen und schließen',
        submitAndApprove: 'Einreichen und Genehmigen',
        advanced: 'ERWEITERT',
        dynamicExternal: 'DYNAMISCH_EXTERN',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `das Standard-Geschäftsbankkonto auf „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}“ festlegen`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `hat das Standardgeschäftsbankkonto „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}“ entfernt`,
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
            `hat das Standard-Geschäftsbankkonto in „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}“ geändert (zuvor „${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}“)`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `hat die Firmenadresse in „${newAddress}“ geändert (zuvor „${previousAddress}“)` : `Firmenadresse auf „${newAddress}“ festlegen`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `${approverName} (${approverEmail}) als Genehmiger:in für das Feld ${field} „${name}“ hinzugefügt`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `${approverName} (${approverEmail}) als Genehmiger:in für das Feld ${field} „${name}“ entfernt`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `Genehmigenden für das Feld ${field} „${name}“ auf ${formatApprover(newApproverName, newApproverEmail)} geändert (zuvor ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `hat die Kategorie „${categoryName}“ hinzugefügt`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `hat die Kategorie „${categoryName}“ entfernt`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'deaktiviert' : 'aktiviert'} die Kategorie „${categoryName}“`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `die Lohnabrechnungscode-Nummer „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            if (!newValue && oldValue) {
                return `hat den Lohnabrechnungscode „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `hat den Lohnabrechnungscode der Kategorie „${categoryName}“ in „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `hat den Hauptbuchcode „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            if (!newValue && oldValue) {
                return `hat den Hauptbuchcode „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `hat den GK-Code der Kategorie „${categoryName}“ in „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `hat die Beschreibung der Kategorie „${categoryName}“ in ${!oldValue ? 'erforderlich' : 'nicht erforderlich'} geändert (zuvor ${!oldValue ? 'nicht erforderlich' : 'erforderlich'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `hat einen maximalen Betrag von ${newAmount} zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            if (oldAmount && !newAmount) {
                return `hat den Maximalbetrag von ${oldAmount} aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `hat den Höchstbetrag der Kategorie „${categoryName}“ auf ${newAmount} geändert (vorher ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `hat einen Grenztyp von ${newValue} zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            return `hat den Limittyp der Kategorie „${categoryName}“ in ${newValue} geändert (zuvor ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `hat die Kategorie „${categoryName}“ aktualisiert, indem Belege auf ${newValue} geändert wurden`;
            }
            return `"${categoryName}"-Kategorie in ${newValue} geändert (zuvor ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `hat die Kategorie „${categoryName}“ aktualisiert, indem die Position „Einzeln aufgeschlüsselte Belege“ in ${newValue} geändert wurde`;
            }
            return `hat für die Kategorie „${categoryName}“ die Position „Belegte Belege“ auf ${newValue} geändert (zuvor ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `hat die Kategorie „${oldName}“ in „${newName}“ umbenannt`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `hat den Beschreibungshinweis „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return !oldValue
                ? `hat den Beschreibungshinweis „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`
                : `hat den Beschreibungshinweis der Kategorie „${categoryName}“ zu „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `hat den Taglisten-Namen in „${newName}“ geändert (zuvor „${oldName}“)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `hat das Tag „${tagName}“ zur Liste „${tagListName}“ hinzugefügt`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) =>
            `hat die Tagliste „${tagListName}“ aktualisiert, indem der Tag „${oldName}“ in „${newName}“ geändert wurde`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'aktiviert' : 'deaktiviert'} das Tag „${tagName}“ in der Liste „${tagListName}“`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `hat das Tag „${tagName}“ aus der Liste „${tagListName}“ entfernt`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `„${count}“ Tags aus der Liste „${tagListName}“ entfernt`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `hat das Tag „${tagName}“ in der Liste „${tagListName}“ aktualisiert, indem das Feld ${updatedField} auf „${newValue}“ geändert wurde (zuvor „${oldValue}“)`;
            }
            return `hat das Tag „${tagName}“ in der Liste „${tagListName}“ aktualisiert, indem ein(e) ${updatedField} mit dem Wert „${newValue}“ hinzugefügt wurde`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `hat ${updatedField} der benutzerdefinierten Einheit ${customUnitName} in „${newValue}“ geändert (zuvor „${oldValue}“)`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'aktiviert' : 'deaktiviert'} Steuerverfolgung bei Distanzsätzen`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `hat einen neuen „${customUnitName}“-Satz „${rateName}“ hinzugefügt`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `hat den Satz des/der ${customUnitName} ${updatedField} „${customUnitRateName}“ auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `hat den Steuersatz des Streckentarifs „${customUnitRateName}“ auf „${newValue} (${newTaxPercentage})“ geändert (zuvor „${oldValue} (${oldTaxPercentage})“)`;
            }
            return `den Steuersatz „${newValue} (${newTaxPercentage})“ zum Distanzsatz „${customUnitRateName}“ hinzugefügt`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `hat den rückforderbaren Steueranteil des Distanzsatzes „${customUnitRateName}“ auf „${newValue}“ geändert (zuvor „${oldValue}“)`;
            }
            return `hat einen erstattungsfähigen Steueranteil von „${newValue}“ zum Distanzsatz „${customUnitRateName} hinzugefügt`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? 'aktiviert' : 'deaktiviert'} den ${customUnitName}-Satz „${customUnitRateName}“`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `hat den „${customUnitName}“-Satz „${rateName}“ entfernt`,
        addedReportField: (fieldType: string, fieldName?: string) => `${fieldType}-Berichtsfeld „${fieldName}“ hinzugefügt`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `Standardwert des Berichts­feldes „${fieldName}“ auf „${defaultValue}“ setzen`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `hat die Option „${optionName}“ zum Berichtsfeld „${fieldName}“ hinzugefügt`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `hat die Option „${optionName}“ aus dem Berichtsfeld „${fieldName}“ entfernt`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'aktiviert' : 'deaktiviert'} die Option „${optionName}“ für das Berichts­feld „${fieldName}“`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'aktiviert' : 'deaktiviert'} alle Optionen für das Berichtsfeld „${fieldName}“`;
            }
            return `${allEnabled ? 'aktiviert' : 'deaktiviert'} die Option „${optionName}“ für das Berichtsfeld „${fieldName}“ und macht alle Optionen ${allEnabled ? 'aktiviert' : 'deaktiviert'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `${fieldType}-Berichtsfeld „${fieldName}“ entfernt`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `„Selbstgenehmigung verhindern“ auf „${newValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}“ aktualisiert (zuvor „${oldValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}“)`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `Stelle das monatliche Berichtsabsendedatum auf „${newValue}“ ein`;
            }
            return `hat das Einreichungsdatum des Monatsberichts auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `„Spesen erneut an Kunden weiterberechnen“ auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `„Standard für Barausgaben“ auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `hat „Standard-Berichtstitel erzwingen“ umgeschaltet ${value ? 'an' : 'aus'}`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `hat die benutzerdefinierte Berichtsnamensformel in „${newValue}“ geändert (zuvor „${oldValue}“)`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `den Namen dieses Arbeitsbereichs auf „${newName}“ aktualisiert (zuvor „${oldName}“)`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `setze die Beschreibung dieses Arbeitsbereichs auf „${newDescription}“`
                : `hat die Beschreibung dieses Workspace auf „${newDescription}“ aktualisiert (zuvor „${oldDescription}“)`,
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
                one: `hat dich aus ${joinedNames}s Genehmigungsworkflow und Spesenchats entfernt. Bereits eingereichte Berichte bleiben in deinem Posteingang zur Genehmigung verfügbar.`,
                other: `hat dich aus den Genehmigungs-Workflows und Spesen-Chats von ${joinedNames} entfernt. Bereits eingereichte Abrechnungen bleiben in deinem Posteingang zur Genehmigung verfügbar.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `hat deine Rolle in ${policyName} von ${oldRole} zu Nutzer aktualisiert. Du wurdest aus allen Einreicher-Spesen-Chats entfernt, außer aus deinem eigenen.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `hat die Standardwährung auf ${newCurrency} aktualisiert (zuvor ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `hat die automatische Berichtshäufigkeit auf „${newFrequency}“ aktualisiert (zuvor „${oldFrequency}“)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `Hat den Genehmigungsmodus auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        upgradedWorkspace: 'hat diesen Workspace auf den Control-Tarif hochgestuft',
        forcedCorporateUpgrade: `Dieser Workspace wurde auf den Control-Tarif hochgestuft. Klicken Sie <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">hier</a> für weitere Informationen.`,
        downgradedWorkspace: 'hat diesen Workspace auf den Collect-Tarif herabgestuft',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `hat die Rate der zufällig zur manuellen Genehmigung weitergeleiteten Berichte auf ${Math.round(newAuditRate * 100)}% geändert (zuvor ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `hat das manuelle Genehmigungslimit für alle Ausgaben auf ${newLimit} geändert (zuvor ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Kategorien`;
                case 'tags':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Tags`;
                case 'workflows':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Workflows`;
                case 'distance rates':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Entfernungsraten`;
                case 'accounting':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Buchhaltung`;
                case 'Expensify Cards':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Expensify Cards`;
                case 'company cards':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Firmenkarten`;
                case 'invoicing':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'}-Rechnungsstellung`;
                case 'per diem':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Tagegeld`;
                case 'receipt partners':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Belegpartner`;
                case 'rules':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'}-Regeln`;
                case 'tax tracking':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Steuerverfolgung`;
                default:
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? 'aktiviert' : 'deaktiviert'} Teilnehmernachverfolgung`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? 'aktiviert' : 'deaktiviert'} automatisch bezahlte genehmigte Berichte`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `Setze den Schwellenwert für automatisch bezahlte genehmigte Berichte auf „${newLimit}“`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `hat den Schwellenwert für automatisch bezahlte genehmigte Berichte auf „${newLimit}“ geändert (zuvor „${oldLimit}“)`,
        removedAutoPayApprovedReportsLimit: 'hat den Schwellenwert für automatisch zu bezahlende genehmigte Berichte entfernt',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `Standardgenehmiger/-in auf ${newApprover} geändert (zuvor ${previousApprover})` : `hat die* Standardgenehmiger*in in ${newApprover} geändert`,
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
            let text = `hat den Genehmigungsworkflow für ${members} geändert, damit Berichte an ${approver} eingereicht werden`;
            if (wasDefaultApprover && previousApprover) {
                text += `(zuvor Standardgenehmiger ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(bisherige*r Standardgenehmiger*in)';
            } else if (previousApprover) {
                text += `(zuvor ${previousApprover})`;
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
                ? `hat den Genehmigungs-Workflow für ${members} geändert, sodass Berichte an die Standard-Genehmigenden ${approver} eingereicht werden`
                : `hat den Genehmigungsworkflow für ${members} so geändert, dass Berichte an die Standardgenehmiger:in eingereicht werden`;
            if (wasDefaultApprover && previousApprover) {
                text += `(zuvor Standardgenehmiger ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(bisherige*r Standardgenehmiger*in)';
            } else if (previousApprover) {
                text += `(zuvor ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `den Genehmigungsworkflow für ${approver} geändert, damit genehmigte Berichte an ${forwardsTo} weitergeleitet werden (zuvor weitergeleitet an ${previousForwardsTo})`
                : `den Genehmigungs-Workflow für ${approver} geändert, sodass genehmigte Berichte an ${forwardsTo} weitergeleitet werden (zuvor abschließend genehmigte Berichte)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `hat den Genehmigungsworkflow für ${approver} so geändert, dass genehmigte Berichte nicht mehr weitergeleitet werden (zuvor weitergeleitet an ${previousForwardsTo})`
                : `den Genehmigungsworkflow für ${approver} so geändert, dass genehmigte Berichte nicht mehr weitergeleitet werden`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `hat den Rechnungsfirmennamen in „${newValue}“ geändert (zuvor „${oldValue}“)` : `setzt den Rechnungsfirmennamen auf „${newValue}“`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `hat die Firmenwebsite der Rechnung zu „${newValue}“ geändert (zuvor „${oldValue}“)` : `Firmenwebsite der Rechnung auf „${newValue}“ festgelegt`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser
                ? `hat den autorisierten Zahler in „${newReimburser}“ geändert (zuvor „${previousReimburser}“)`
                : `hat den autorisierten Zahlenden in „${newReimburser}“ geändert`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'aktiviert' : 'deaktiviert'} Erstattungen`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `hat die Steuer „${taxName}“ hinzugefügt`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `hat die Steuer „${taxName}“ entfernt`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `hat die Steuer „${oldValue}“ in „${newValue}“ umbenannt`;
                }
                case 'code': {
                    return `hat den Steuercode für „${taxName}“ von „${oldValue}“ in „${newValue}“ geändert`;
                }
                case 'rate': {
                    return `hat den Steuersatz für „${taxName}“ von „${oldValue}“ auf „${newValue}“ geändert`;
                }
                case 'enabled': {
                    return `${oldValue ? 'deaktiviert' : 'aktiviert'} die Steuer „${taxName}“`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `Belegdifferenzbetrag auf „${newValue}“ festlegen`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `hat den erforderlichen Belegbetrag auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `erforderlichen Belegbetrag entfernt (zuvor „${oldValue}“)`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximalen Ausgabenbetrag auf „${newValue}“ festlegen`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `Maximalbetrag für Ausgaben auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximalen Ausgabenbetrag entfernt (zuvor „${oldValue}“)`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximales Ausgabenalter auf „${newValue}“ Tage festlegen`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximales Spesenalter auf „${newValue}“ Tage geändert (zuvor „${oldValue}“)`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `Maximales Ausgabenalter entfernt (zuvor „${oldValue}“ Tage)`,
    },
    roomMembersPage: {
        memberNotFound: 'Mitglied nicht gefunden.',
        useInviteButton: 'Um ein neues Mitglied zum Chat einzuladen, verwende bitte die Einladen-Schaltfläche oben.',
        notAuthorized: `Du hast keinen Zugriff auf diese Seite. Wenn du versuchst, diesem Raum beizutreten, bitte einfach ein Mitglied des Raums, dich hinzuzufügen. Etwas anderes? Wende dich an ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Es sieht so aus, als wäre dieser Raum archiviert worden. Bei Fragen wende dich an ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Möchtest du ${memberName} wirklich aus dem Raum entfernen?`,
            other: 'Möchtest du die ausgewählten Mitglieder wirklich aus dem Raum entfernen?',
        }),
        error: {
            genericAdd: 'Beim Hinzufügen dieses Raummitglieds ist ein Problem aufgetreten',
        },
    },
    newTaskPage: {
        assignTask: 'Aufgabe zuweisen',
        assignMe: 'Mir zuweisen',
        confirmTask: 'Aufgabe bestätigen',
        confirmError: 'Bitte gib einen Titel ein und wähle ein Freigabeziel aus',
        descriptionOptional: 'Beschreibung (optional)',
        pleaseEnterTaskName: 'Bitte einen Titel eingeben',
        pleaseEnterTaskDestination: 'Bitte auswählen, wo du diese Aufgabe teilen möchtest',
    },
    task: {
        task: 'Aufgabe',
        title: 'Titel',
        description: 'Beschreibung',
        assignee: 'Zuständige Person',
        completed: 'Abgeschlossen',
        action: 'Abschließen',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `Aufgabe für ${title}`,
            completed: 'als erledigt markiert',
            canceled: 'gelöschte Aufgabe',
            reopened: 'als unvollständig markiert',
            error: 'Sie haben keine Berechtigung, die angeforderte Aktion auszuführen',
        },
        markAsComplete: 'Als abgeschlossen markieren',
        markAsIncomplete: 'Als unvollständig markieren',
        assigneeError: 'Beim Zuweisen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie eine andere zuständige Person.',
        genericCreateTaskFailureMessage: 'Beim Erstellen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
        deleteTask: 'Aufgabe löschen',
        deleteConfirmation: 'Sind Sie sicher, dass Sie diese Aufgabe löschen möchten?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Abrechnung ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Tastenkürzel',
        subtitle: 'Sparen Sie Zeit mit diesen praktischen Tastenkombinationen:',
        shortcuts: {
            openShortcutDialog: 'Öffnet den Dialog für Tastenkürzel',
            markAllMessagesAsRead: 'Alle Nachrichten als gelesen markieren',
            escape: 'Dialoge schließen',
            search: 'Suchdialog öffnen',
            newChat: 'Neuer Chat-Bildschirm',
            copy: 'Kommentar kopieren',
            openDebug: 'Dialogfeld „Testeinstellungen“ öffnen',
        },
    },
    guides: {
        screenShare: 'Bildschirmfreigabe',
        screenShareRequest: 'Expensify lädt dich zu einer Bildschirmfreigabe ein',
    },
    search: {
        resultsAreLimited: 'Suchergebnisse sind eingeschränkt.',
        viewResults: 'Ergebnisse anzeigen',
        resetFilters: 'Filter zurücksetzen',
        searchResults: {
            emptyResults: {
                title: 'Nichts anzuzeigen',
                subtitle: `Versuche, deine Suchkriterien anzupassen oder mit der +‑Schaltfläche etwas zu erstellen.`,
            },
            emptyExpenseResults: {
                title: 'Du hast noch keine Ausgaben erstellt',
                subtitle: 'Erfasse eine Ausgabe oder mache eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwende die grüne Schaltfläche unten, um eine Ausgabe zu erstellen.',
            },
            emptyReportResults: {
                title: 'Du hast noch keine Berichte erstellt',
                subtitle: 'Erstelle einen Bericht oder mache eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwende die grüne Schaltfläche unten, um einen Bericht zu erstellen.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Sie haben noch keine Rechnungen erstellt
                `),
                subtitle: 'Sende eine Rechnung oder mache eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwende die grüne Schaltfläche unten, um eine Rechnung zu senden.',
            },
            emptyTripResults: {
                title: 'Keine Reisen zum Anzeigen',
                subtitle: 'Beginne, indem du unten deine erste Reise buchst.',
                buttonText: 'Reise buchen',
            },
            emptySubmitResults: {
                title: 'Keine Ausgaben zum Einreichen',
                subtitle: 'Alles erledigt. Dreh eine Ehrenrunde!',
                buttonText: 'Bericht erstellen',
            },
            emptyApproveResults: {
                title: 'Keine Ausgaben zu genehmigen',
                subtitle: 'Null Ausgaben. Maximale Entspannung. Gut gemacht!',
            },
            emptyPayResults: {
                title: 'Keine ausstehenden Ausgaben',
                subtitle: 'Glückwunsch! Du hast die Ziellinie überquert.',
            },
            emptyExportResults: {
                title: 'Keine Ausgaben zum Exportieren',
                subtitle: 'Zeit, es ruhig angehen zu lassen – gute Arbeit.',
            },
            emptyStatementsResults: {
                title: 'Keine Ausgaben zum Anzeigen',
                subtitle: 'Keine Ergebnisse. Bitte versuchen Sie, Ihre Filter anzupassen.',
            },
            emptyUnapprovedResults: {
                title: 'Keine Ausgaben zu genehmigen',
                subtitle: 'Null Ausgaben. Maximale Entspannung. Gut gemacht!',
            },
        },
        columns: 'Spalten',
        resetColumns: 'Spalten zurücksetzen',
        groupColumns: 'Spalten gruppieren',
        expenseColumns: 'Spalten für Ausgaben',
        statements: 'Abrechnungen',
        unapprovedCash: 'Nicht genehmigtes Bargeld',
        unapprovedCard: 'Nicht genehmigte Karte',
        reconciliation: 'Abstimmung',
        topSpenders: 'Top-Ausgaben',
        saveSearch: 'Suche speichern',
        deleteSavedSearch: 'Gespeicherte Suche löschen',
        deleteSavedSearchConfirm: 'Möchten Sie diese Suche wirklich löschen?',
        searchName: 'Namen suchen',
        savedSearchesMenuItemTitle: 'Gespeichert',
        topCategories: 'Top-Kategorien',
        topMerchants: 'Top-Händler',
        groupedExpenses: 'gruppierte Ausgaben',
        bulkActions: {
            approve: 'Genehmigen',
            pay: 'Bezahlen',
            delete: 'Löschen',
            hold: 'Halten',
            unhold: 'Sperre aufheben',
            reject: 'Ablehnen',
            noOptionsAvailable: 'Für die ausgewählte Ausgabengruppe sind keine Optionen verfügbar.',
        },
        filtersHeader: 'Filter',
        filters: {
            date: {
                before: (date?: string) => `Vor ${date ?? ''}`,
                after: (date?: string) => `Nach ${date ?? ''}`,
                on: (date?: string) => `Am ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Nie',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Letzter Monat',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Diesen Monat',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: 'Jahr bis heute',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Letzter Kontoauszug',
                },
            },
            status: 'Status',
            keyword: 'Schlüsselwort',
            keywords: 'Schlüsselwörter',
            limit: 'Limit',
            limitDescription: 'Lege ein Limit für die Ergebnisse deiner Suche fest.',
            currency: 'Währung',
            completed: 'Abgeschlossen',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Weniger als ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Größer als ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `Zwischen ${greaterThan} und ${lessThan}`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Gleich ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Individuelle Karten',
                closedCards: 'Geschlossene Karten',
                cardFeeds: 'Kartenfeeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Alle ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Alle importierten CSV-Karten${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} ist ${value}`,
            current: 'Aktuell',
            past: 'Vergangenes',
            submitted: 'Übermittelt',
            approved: 'Genehmigt',
            paid: 'Bezahlt',
            exported: 'Exportiert',
            posted: 'Gebucht',
            withdrawn: 'Zurückgezogen',
            billable: 'Abrechenbar',
            reimbursable: 'Erstattungsfähig',
            purchaseCurrency: 'Einkaufswährung',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'Von',
                [CONST.SEARCH.GROUP_BY.CARD]: 'Karte',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'Auszahlungs-ID',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Kategorie',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Händler',
                [CONST.SEARCH.GROUP_BY.TAG]: 'Tag',
                [CONST.SEARCH.GROUP_BY.MONTH]: 'Monat',
                [CONST.SEARCH.GROUP_BY.WEEK]: 'Woche',
                [CONST.SEARCH.GROUP_BY.YEAR]: 'Jahr',
                [CONST.SEARCH.GROUP_BY.QUARTER]: 'Quartal',
            },
            feed: 'Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: 'Erstattung',
            },
            is: 'Ist',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Senden',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Genehmigen',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Bezahlen',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Export',
            },
        },
        has: 'Hat',
        groupBy: 'Gruppieren nach',
        view: {
            label: 'Anzeigen',
            table: 'Tabelle',
            bar: 'Bar',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: 'Von',
            [CONST.SEARCH.GROUP_BY.CARD]: 'Karten',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'Exporte',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Kategorien',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Händler',
            [CONST.SEARCH.GROUP_BY.TAG]: 'Tags',
            [CONST.SEARCH.GROUP_BY.MONTH]: 'Monate',
            [CONST.SEARCH.GROUP_BY.WEEK]: 'Wochen',
            [CONST.SEARCH.GROUP_BY.YEAR]: 'Jahre',
            [CONST.SEARCH.GROUP_BY.QUARTER]: 'Viertel',
        },
        moneyRequestReport: {
            emptyStateTitle: 'Dieser Bericht enthält keine Ausgaben.',
            accessPlaceHolder: 'Zum Anzeigen öffnen',
        },
        noCategory: 'Keine Kategorie',
        noMerchant: 'Kein Händler',
        noTag: 'Kein Tag',
        expenseType: 'Spesenart',
        withdrawalType: 'Abhebungsart',
        recentSearches: 'Letzte Suchanfragen',
        recentChats: 'Letzte Chats',
        searchIn: 'Suchen in',
        searchPlaceholder: 'Etwas suchen',
        suggestions: 'Vorschläge',
        exportSearchResults: {
            title: 'Export erstellen',
            description: 'Wow, das sind aber viele Einträge! Wir packen sie zusammen, und Concierge schickt dir in Kürze eine Datei.',
        },
        exportedTo: 'Exportiert nach',
        exportAll: {
            selectAllMatchingItems: 'Alle passenden Elemente auswählen',
            allMatchingItemsSelected: 'Alle passenden Elemente ausgewählt',
        },
    },
    genericErrorPage: {
        title: 'Ups, da ist etwas schiefgelaufen!',
        body: {
            helpTextMobile: 'Bitte schließen und öffnen Sie die App erneut oder wechseln Sie zu',
            helpTextWeb: 'Web.',
            helpTextConcierge: 'Wenn das Problem weiterhin besteht, wende dich an',
        },
        refresh: 'Aktualisieren',
    },
    fileDownload: {
        success: {
            title: 'Heruntergeladen!',
            message: 'Anhang erfolgreich heruntergeladen!',
            qrMessage:
                'Überprüfe deinen Fotos- oder Download-Ordner auf eine Kopie deines QR-Codes. Profi-Tipp: Füge ihn einer Präsentation hinzu, damit dein Publikum ihn scannen und direkt mit dir in Kontakt treten kann.',
        },
        generalError: {
            title: 'Anlagenfehler',
            message: 'Anhang kann nicht heruntergeladen werden',
        },
        permissionError: {
            title: 'Speicherzugriff',
            message: 'Expensify kann Anhänge ohne Zugriff auf den Speicher nicht speichern. Tippe auf „Einstellungen“, um die Berechtigungen zu aktualisieren.',
        },
    },
    settlement: {
        status: {
            pending: 'Ausstehend',
            cleared: 'Ausgeglichen',
            failed: 'Fehlgeschlagen',
        },
        failedError: ({link}: {link: string}) => `Wir versuchen diese Abrechnung erneut, sobald du dein Konto <a href="${link}">entsperrt hast</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • Auszahlungs-ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Berichts­layout',
        groupByLabel: 'Gruppieren nach:',
        selectGroupByOption: 'Wähle aus, wie die Berichtsausgaben gruppiert werden sollen',
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
            createExpense: 'Ausgabe erstellen',
            createReport: 'Bericht erstellen',
            chooseWorkspace: 'Wähle einen Arbeitsbereich für diesen Bericht aus.',
            emptyReportConfirmationTitle: 'Sie haben bereits einen leeren Bericht',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Möchtest du wirklich einen weiteren Bericht in ${workspaceName} erstellen? Du kannst auf deine leeren Berichte zugreifen in`,
            emptyReportConfirmationPromptLink: 'Berichte',
            emptyReportConfirmationDontShowAgain: 'Zeige mir das nicht mehr an',
            genericWorkspaceName: 'diese Arbeitsfläche',
        },
        genericCreateReportFailureMessage: 'Unerwarteter Fehler beim Erstellen dieses Chats. Bitte versuche es später noch einmal.',
        genericAddCommentFailureMessage: 'Unerwarteter Fehler beim Posten des Kommentars. Bitte versuche es später noch einmal.',
        genericUpdateReportFieldFailureMessage: 'Unerwarteter Fehler beim Aktualisieren des Feldes. Bitte versuchen Sie es später noch einmal.',
        genericUpdateReportNameEditFailureMessage: 'Unerwarteter Fehler beim Umbenennen des Berichts. Bitte versuchen Sie es später erneut.',
        noActivityYet: 'Noch keine Aktivitäten',
        connectionSettings: 'Verbindungseinstellungen',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `${fieldName} in „${newValue}“ geändert (zuvor „${oldValue}“)`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `setze ${fieldName} auf „${newValue}“`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `hat den Workspace ${fromPolicyName ? `(vormals ${fromPolicyName})` : ''} geändert`;
                    }
                    return `hat den Arbeitsbereich zu ${toPolicyName}${fromPolicyName ? `(vormals ${fromPolicyName})` : ''} geändert`;
                },
                changeType: (oldType: string, newType: string) => `Typ von ${oldType} in ${newType} geändert`,
                exportedToCSV: `als CSV exportiert`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `exportiert nach ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `exportiert nach ${label} über`,
                    automaticActionTwo: 'Buchhaltungseinstellungen',
                    manual: (label: string) => `hat diesen Bericht als manuell nach ${label} exportiert markiert.`,
                    automaticActionThree: 'und erfolgreich einen Eintrag erstellt für',
                    reimburseableLink: 'Auslagen',
                    nonReimbursableLink: 'Firmenkartenausgaben',
                    pending: (label: string) => `hat begonnen, diesen Bericht nach ${label} zu exportieren...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `Fehler beim Exportieren dieses Berichts nach ${label} („${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}“)`,
                managerAttachReceipt: `hat eine Quittung hinzugefügt`,
                managerDetachReceipt: `hat eine Quittung entfernt`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `${currency}${amount} anderweitig bezahlt`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `${currency}${amount} über Integration bezahlt`,
                outdatedBankAccount: `Die Zahlung konnte aufgrund eines Problems mit dem Bankkonto des Zahlenden nicht verarbeitet werden`,
                reimbursementACHBounce: `Die Zahlung konnte aufgrund eines Bankkontoproblems nicht verarbeitet werden`,
                reimbursementACHCancelled: `hat die Zahlung storniert`,
                reimbursementAccountChanged: `Die Zahlung konnte nicht verarbeitet werden, da der Zahlende das Bankkonto gewechselt hat.`,
                reimbursementDelayed: `hat die Zahlung verarbeitet, aber sie verzögert sich um 1–2 weitere Werktage`,
                selectedForRandomAudit: `zufällig zur Überprüfung ausgewählt`,
                selectedForRandomAuditMarkdown: `[zufällig ausgewählt](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) zur Überprüfung`,
                share: ({to}: ShareParams) => `hat Mitglied ${to} eingeladen`,
                unshare: ({to}: UnshareParams) => `Mitglied ${to} entfernt`,
                stripePaid: ({amount, currency}: StripePaidParams) => `bezahlt: ${currency}${amount}`,
                takeControl: `hat die Kontrolle übernommen`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `Beim Synchronisieren mit ${label}${errorMessage ? ` ("${errorMessage}")` : ''} ist ein Problem aufgetreten. Bitte behebe das Problem in den <a href="${workspaceAccountingLink}">Workspace-Einstellungen</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `Die Verbindung zu ${feedName} ist unterbrochen. Um Kartenimporte wiederherzustellen, <a href='${workspaceCompanyCardRoute}'>melden Sie sich bei Ihrer Bank an</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `Die Plaid-Verbindung zu Ihrem Geschäftskonto ist unterbrochen. Bitte <a href='${walletRoute}'>verbinden Sie Ihr Bankkonto ${maskedAccountNumber} erneut</a>, damit Sie Ihre Expensify Cards weiterhin nutzen können.`,
                addEmployee: (email: string, role: string) => `${email} als ${role === 'member' ? 'a' : 'an'} ${role} hinzugefügt`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `hat die Rolle von ${email} in ${newRole} geändert (zuvor ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `benutzerdefiniertes Feld 1 von ${email} entfernt (zuvor „${previousValue}“)`;
                    }
                    return !previousValue
                        ? `„${newValue}“ zu benutzerdefiniertem Feld 1 von ${email} hinzugefügt`
                        : `hat benutzerdefiniertes Feld 1 von ${email} auf „${newValue}“ geändert (zuvor „${previousValue}“)`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `benutzerdefiniertes Feld 2 von ${email} entfernt (zuvor „${previousValue}“)`;
                    }
                    return !previousValue
                        ? `„${newValue}“ zu benutzerdefiniertem Feld 2 von ${email} hinzugefügt`
                        : `benutzerdefiniertes Feld 2 von ${email} auf „${newValue}“ geändert (zuvor „${previousValue}“)`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} hat den Workspace verlassen`,
                removeMember: (email: string, role: string) => `${role} ${email} entfernt`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `Verbindung zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} entfernt`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `verbunden mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'hat den Chat verlassen',
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `Geschäftsbankkonto ${maskedBankAccountNumber} wurde aufgrund eines Problems mit entweder der Rückerstattung oder der Expensify Card-Abrechnung automatisch gesperrt. Bitte behebe das Problem in deinen <a href="${linkURL}">Workspace-Einstellungen</a>.`,
            },
            error: {
                invalidCredentials: 'Ungültige Anmeldedaten, bitte überprüfe die Konfiguration deiner Verbindung.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} für ${dayCount} ${dayCount === 1 ? 'Tag' : 'Tage'} bis ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} vom ${timePeriod} am ${date}`,
    },
    footer: {
        features: 'Funktionen',
        expenseManagement: 'Spesenverwaltung',
        spendManagement: 'Ausgabenverwaltung',
        expenseReports: 'Spesenabrechnungen',
        companyCreditCard: 'Firmenkreditkarte',
        receiptScanningApp: 'Belegscanner-App',
        billPay: 'Rechnungszahlung',
        invoicing: 'Rechnungsstellung',
        CPACard: 'Steuerberaterkarte',
        payroll: 'Lohn- und Gehaltsabrechnung',
        travel: 'Reisen',
        resources: 'Ressourcen',
        expensifyApproved: 'ExpensifyGenehmigt!',
        pressKit: 'Pressekit',
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
        createAccount: 'Neues Konto erstellen',
        logIn: 'Anmelden',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Zurück zur Chatliste navigieren',
        chatWelcomeMessage: 'Chat-Begrüßungsnachricht',
        navigatesToChat: 'Navigiert zu einem Chat',
        newMessageLineIndicator: 'Neue Nachrichtenzeilenanzeige',
        chatMessage: 'Chatnachricht',
        lastChatMessagePreview: 'Vorschau der letzten Chat-Nachricht',
        workspaceName: 'Workspace-Name',
        chatUserDisplayNames: 'Anzeigenamen von Chatmitgliedern',
        scrollToNewestMessages: 'Zum neuesten Beitrag scrollen',
        preStyledText: 'Vorgestalteter Text',
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
        flagDescription: 'Alle gemeldeten Nachrichten werden zur Überprüfung an eine Moderation gesendet.',
        chooseAReason: 'Wähle unten einen Grund zum Melden aus:',
        spam: 'Spam',
        spamDescription: 'Unaufgeforderte themenfremde Werbung',
        inconsiderate: 'Rücksichtslos',
        inconsiderateDescription: 'Beleidigende oder respektlose Formulierungen mit fragwürdigen Absichten',
        intimidation: 'Einschüchterung',
        intimidationDescription: 'Das energische Verfolgen einer Agenda trotz berechtigter Einwände',
        bullying: 'Mobbing',
        bullyingDescription: 'Gezielte Ansprache einer Person, um Gehorsam zu erzwingen',
        harassment: 'Belästigung',
        harassmentDescription: 'Rassistisches, frauenfeindliches oder anderweitig diskriminierendes Verhalten',
        assault: 'Angriff',
        assaultDescription: 'Gezielter emotionaler Angriff mit der Absicht, Schaden zuzufügen',
        flaggedContent: 'Diese Nachricht wurde als Verstoß gegen unsere Community-Regeln markiert und der Inhalt wurde verborgen.',
        hideMessage: 'Nachricht ausblenden',
        revealMessage: 'Nachricht anzeigen',
        levelOneResult: 'Sendet anonyme Warnung und Meldung wird zur Überprüfung gemeldet.',
        levelTwoResult: 'Nachricht im Kanal verborgen, anonyme Warnung gesendet und Nachricht zur Überprüfung gemeldet.',
        levelThreeResult: 'Nachricht aus dem Kanal entfernt, anonyme Warnung gesendet und Nachricht zur Überprüfung gemeldet.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Zum Einreichen von Ausgaben einladen',
        inviteToChat: 'Nur zum Chat einladen',
        nothing: 'Nichts tun',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Akzeptieren',
        decline: 'Ablehnen',
    },
    actionableMentionTrackExpense: {
        submit: 'An jemand einreichen',
        categorize: 'Kategorisieren',
        share: 'Mit meinem Steuerberater teilen',
        nothing: 'Im Moment nichts',
    },
    teachersUnitePage: {
        teachersUnite: 'Lehrer*innen vereinigt euch',
        joinExpensifyOrg:
            'Schließe dich Expensify.org an, um Ungerechtigkeit auf der ganzen Welt zu beseitigen. Die aktuelle Kampagne „Teachers Unite“ unterstützt Lehrkräfte überall, indem sie die Kosten für grundlegende Schulmaterialien teilt.',
        iKnowATeacher: 'Ich kenne eine Lehrkraft',
        iAmATeacher: 'Ich bin Lehrer',
        getInTouch: 'Ausgezeichnet! Bitte teilen Sie deren Kontaktdaten, damit wir sie kontaktieren können.',
        introSchoolPrincipal: 'Einführung bei Ihrer Schulleitung',
        schoolPrincipalVerifyExpense:
            'Expensify.org teilt die Kosten für wichtige Schulmaterialien, damit Schüler*innen aus einkommensschwachen Haushalten bessere Lernbedingungen haben. Ihre Schulleitung wird gebeten, Ihre Ausgaben zu bestätigen.',
        principalFirstName: 'Vorname der verantwortlichen Person',
        principalLastName: 'Nachname der Hauptansprechperson',
        principalWorkEmail: 'Hauptgeschäftliche E-Mail-Adresse',
        updateYourEmail: 'Aktualisiere deine E-Mail-Adresse',
        updateEmail: 'E-Mail-Adresse aktualisieren',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Bevor du fortfährst, stelle bitte sicher, dass du deine Schul-E-Mail als Standard-Kontaktmethode festlegst. Du kannst dies unter Einstellungen > Profil > <a href="${contactMethodsRoute}">Kontaktmethoden</a> tun.`,
        error: {
            enterPhoneEmail: 'Gib eine gültige E‑Mail-Adresse oder Telefonnummer ein',
            enterEmail: 'E-Mail-Adresse eingeben',
            enterValidEmail: 'Gib eine gültige E-Mail-Adresse ein',
            tryDifferentEmail: 'Bitte versuche eine andere E-Mail-Adresse',
        },
    },
    cardTransactions: {
        notActivated: 'Nicht aktiviert',
        outOfPocket: 'Auslagen',
        companySpend: 'Ausgaben des Unternehmens',
    },
    distance: {
        addStop: 'Stopp hinzufügen',
        deleteWaypoint: 'Wegpunkt löschen',
        deleteWaypointConfirmation: 'Möchtest du diesen Wegpunkt wirklich löschen?',
        address: 'Adresse',
        waypointDescription: {
            start: 'Start',
            stop: 'Stopp',
        },
        mapPending: {
            title: 'Zuordnung ausstehend',
            subtitle: 'Die Karte wird erstellt, sobald du wieder online bist',
            onlineSubtitle: 'Einen Moment, wir richten die Karte ein',
            errorTitle: 'Kartenfehler',
            errorSubtitle: 'Beim Laden der Karte ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        error: {
            selectSuggestedAddress: 'Bitte wählen Sie eine vorgeschlagene Adresse aus oder verwenden Sie den aktuellen Standort',
        },
        odometer: {
            startReading: 'Mit dem Lesen beginnen',
            endReading: 'Lesen beenden',
            saveForLater: 'Für später speichern',
            totalDistance: 'Gesamtdistanz',
        },
    },
    gps: {
        disclaimer: 'Verwende GPS, um aus deiner Fahrt eine Ausgabe zu erstellen. Tippe unten auf „Start“, um mit der Aufzeichnung zu beginnen.',
        error: {
            failedToStart: 'Standortverfolgung konnte nicht gestartet werden.',
            failedToGetPermissions: 'Erforderliche Standortberechtigungen konnten nicht abgerufen werden.',
        },
        trackingDistance: 'Entfernung wird erfasst …',
        stopped: 'Angehalten',
        start: 'Start',
        stop: 'Stopp',
        discard: 'Verwerfen',
        stopGpsTrackingModal: {
            title: 'GPS-Tracking stoppen',
            prompt: 'Bist du sicher? Dadurch wird deine aktuelle Sitzung beendet.',
            cancel: 'Tracking fortsetzen',
            confirm: 'GPS-Tracking stoppen',
        },
        discardDistanceTrackingModal: {
            title: 'Entfernungsverfolgung verwerfen',
            prompt: 'Bist du sicher? Dadurch wird dein aktueller Ablauf verworfen und dies kann nicht rückgängig gemacht werden.',
            confirm: 'Entfernungsverfolgung verwerfen',
        },
        zeroDistanceTripModal: {
            title: 'Ausgabe kann nicht erstellt werden',
            prompt: 'Sie können keine Ausgabe mit demselben Start- und Zielort erstellen.',
        },
        locationRequiredModal: {
            title: 'Standortzugriff erforderlich',
            prompt: 'Bitte erlaube in den Einstellungen deines Geräts den Standortzugriff, um die GPS-Distanzverfolgung zu starten.',
            allow: 'Zulassen',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Zugriff auf Standort im Hintergrund erforderlich',
            prompt: 'Bitte erlaube den Zugriff auf den Standort im Hintergrund in deinen Geräteeinstellungen (Option „Immer zulassen“), um die GPS-Distanzverfolgung zu starten.',
        },
        preciseLocationRequiredModal: {
            title: 'Genaue Position erforderlich',
            prompt: 'Bitte aktiviere „Genauen Standort“ in den Geräteeinstellungen, um die GPS-Distanzverfolgung zu starten.',
        },
        desktop: {
            title: 'Entfernung auf deinem Handy erfassen',
            subtitle: 'Strecken automatisch per GPS in Meilen oder Kilometern erfassen und Fahrten sofort in Ausgaben umwandeln.',
            button: 'App herunterladen',
        },
        notification: {
            title: 'GPS-Tracking läuft',
            body: 'Wechsle zur App, um abzuschließen',
        },
        continueGpsTripModal: {
            title: 'GPS-Aufzeichnung der Fahrt fortsetzen?',
            prompt: 'Sieht so aus, als wurde die App während deiner letzten GPS-Fahrt geschlossen. Möchtest du die Aufzeichnung dieser Fahrt fortsetzen?',
            confirm: 'Reise fortsetzen',
            cancel: 'Reise ansehen',
        },
        signOutWarningTripInProgress: {
            title: 'GPS-Tracking läuft',
            prompt: 'Bist du sicher, dass du die Reise verwerfen und dich abmelden möchtest?',
            confirm: 'Verwerfen und abmelden',
        },
        locationServicesRequiredModal: {
            title: 'Standortzugriff erforderlich',
            confirm: 'Einstellungen öffnen',
            prompt: 'Bitte erlaube in den Einstellungen deines Geräts den Standortzugriff, um die GPS-Distanzverfolgung zu starten.',
        },
        fabGpsTripExplained: 'Zum GPS-Bildschirm wechseln (Floating Action)',
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Zeugnis verloren oder beschädigt',
        nextButtonLabel: 'Weiter',
        reasonTitle: 'Warum benötigst du eine neue Karte?',
        cardDamaged: 'Meine Karte wurde beschädigt',
        cardLostOrStolen: 'Meine Karte wurde verloren oder gestohlen',
        confirmAddressTitle: 'Bitte bestätigen Sie die Postadresse für Ihre neue Karte.',
        cardDamagedInfo: 'Ihre neue Karte wird in 2–3 Werktagen ankommen. Ihre aktuelle Karte funktioniert weiter, bis Sie Ihre neue Karte aktivieren.',
        cardLostOrStolenInfo: 'Ihre aktuelle Karte wird dauerhaft deaktiviert, sobald Ihre Bestellung aufgegeben wurde. Die meisten Karten treffen nach wenigen Werktagen ein.',
        address: 'Adresse',
        deactivateCardButton: 'Karte deaktivieren',
        shipNewCardButton: 'Neue Karte versenden',
        addressError: 'Adresse ist erforderlich',
        reasonError: 'Grund ist erforderlich',
        successTitle: 'Ihre neue Karte ist unterwegs!',
        successDescription: 'Sobald sie in einigen Werktagen ankommt, musst du sie aktivieren. In der Zwischenzeit kannst du eine virtuelle Karte verwenden.',
    },
    eReceipt: {
        guaranteed: 'Garantierte eQuittung',
        transactionDate: 'Transaktionsdatum',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Starte einen Chat, <success><strong>empfiehl eine:n Freund:in</strong></success>.',
            header: 'Chat starten, Freund/in empfehlen',
            body: 'Möchtest du, dass deine Freunde Expensify auch nutzen? Starte einfach einen Chat mit ihnen und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Reiche eine Ausgabe ein, <success><strong>wirb dein Team an</strong></success>.',
            header: 'Reiche eine Ausgabe ein, empfehle dein Team weiter',
            body: 'Möchtest du, dass dein Team Expensify auch nutzt? Reiche ihnen einfach eine Ausgabe ein, und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Freund*in empfehlen',
            body: 'Möchtest du, dass deine Freunde Expensify auch nutzen? Chatte einfach mit ihnen, bezahle oder teile eine Ausgabe – wir kümmern uns um den Rest. Oder teile einfach deinen Einladungslink!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Freund*in empfehlen',
            header: 'Freund*in empfehlen',
            body: 'Möchtest du, dass deine Freunde Expensify auch nutzen? Chatte einfach mit ihnen, bezahle oder teile eine Ausgabe – wir kümmern uns um den Rest. Oder teile einfach deinen Einladungslink!',
        },
        copyReferralLink: 'Einladungslink kopieren',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chatte mit deiner Einrichtungsspezialist:in in <a href="${href}">${adminReportName}</a>, um Hilfe zu erhalten`,
        default: `Schreibe eine Nachricht an <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link>, um Hilfe bei der Einrichtung zu erhalten`,
    },
    violations: {
        allTagLevelsRequired: 'Alle Tags erforderlich',
        autoReportedRejectedExpense: 'Diese Ausgabe wurde abgelehnt.',
        billableExpense: 'Belastbar nicht mehr gültig',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Beleg erforderlich${formattedLimit ? `über ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategorie nicht mehr gültig',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `${surcharge}% Umrechnungszuschlag angewendet`,
        customUnitOutOfPolicy: 'Kurs für diesen Workspace ungültig',
        duplicatedTransaction: 'Mögliches Duplikat',
        fieldRequired: 'Berichtsfelder sind erforderlich',
        futureDate: 'Zukünftiges Datum nicht zulässig',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Aufgeschlagen um ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Datum ist älter als ${maxAge} Tage`,
        missingCategory: 'Fehlende Kategorie',
        missingComment: 'Beschreibung für ausgewählte Kategorie erforderlich',
        missingAttendees: 'Für diese Kategorie sind mehrere Teilnehmende erforderlich',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Fehlend ${tagName ?? 'Tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Betrag weicht von berechneter Entfernung ab';
                case 'card':
                    return 'Betrag höher als Kartenumsatz';
                default:
                    if (displayPercentVariance) {
                        return `Betrag ist ${displayPercentVariance} % höher als der gescannte Beleg`;
                    }
                    return 'Betrag höher als gescannter Beleg';
            }
        },
        modifiedDate: 'Datum weicht von gescanntem Beleg ab',
        nonExpensiworksExpense: 'Nicht-Expensiworks-Ausgabe',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Ausgabe überschreitet das automatische Genehmigungslimit von ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Betrag über dem Kategorienlimit von ${formattedLimit}/Person`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit} pro Person`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über ${formattedLimit}/Reise-Limit`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit} pro Person`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Betrag über dem täglichen Kategorienlimit von ${formattedLimit}/Person`,
        receiptNotSmartScanned: 'Beleg- und Ausgabendetails manuell hinzugefügt.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Beleg erforderlich bei Überschreitung des Kategorienlimits von ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Beleg erforderlich über ${formattedLimit}`;
            }
            if (category) {
                return `Beleg über Kategoriegrenze erforderlich`;
            }
            return 'Beleg erforderlich';
        },
        itemizedReceiptRequired: ({formattedLimit}: {formattedLimit?: string}) => `Detaillierte Quittung erforderlich${formattedLimit ? `über ${formattedLimit}` : ''}`,
        prohibitedExpense: ({prohibitedExpenseTypes}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Unzulässige Ausgabe:';
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
                return 'Beleg kann aufgrund einer unterbrochenen Bankverbindung nicht automatisch zugeordnet werden';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Bankverbindung unterbrochen. <a href="${companyCardPageURL}">Erneut verbinden, um Belege abzugleichen</a>`
                    : 'Bankverbindung unterbrochen. Bitte Admin bitten, sie wieder zu verbinden, um den Beleg abzugleichen.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Bitte ${member} darum, die Ausgabe als Barzahlung zu markieren, oder warte 7 Tage und versuche es erneut` : 'Wartet auf Abgleich mit Kartentransaktion.';
            }
            return '';
        },
        brokenConnection530Error: 'Beleg ausstehend wegen unterbrochener Bankverbindung',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Beleg ausstehend wegen fehlerhafter Bankverbindung. Bitte unter <a href="${workspaceCompanyCardRoute}">Firmenkarten</a> beheben.</muted-text-label>`,
        memberBrokenConnectionError: 'Beleg ausstehend wegen unterbrochener Bankverbindung. Bitte eine(n) Workspace-Admin um Behebung bitten.',
        markAsCashToIgnore: 'Als Barzahlung markieren, um sie zu ignorieren und eine Zahlung anzufordern.',
        smartscanFailed: ({canEdit = true}) => `Belegerfassung fehlgeschlagen.${canEdit ? 'Details manuell eingeben.' : ''}`,
        receiptGeneratedWithAI: 'Mögliche KI-generierte Quittung',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Fehlende ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} ist nicht mehr gültig`,
        taxAmountChanged: 'Steuerbetrag wurde geändert',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Steuer'} ist nicht mehr gültig`,
        taxRateChanged: 'Steuersatz wurde geändert',
        taxRequired: 'Fehlender Steuersatz',
        none: 'Keine',
        taxCodeToKeep: 'Wähle, welcher Steuerschlüssel beibehalten werden soll',
        tagToKeep: 'Wähle aus, welches Tag beibehalten werden soll',
        isTransactionReimbursable: 'Wählen, ob die Transaktion erstattungsfähig ist',
        merchantToKeep: 'Wähle, welchen Händler du behalten möchtest',
        descriptionToKeep: 'Wähle aus, welche Beschreibung beibehalten werden soll',
        categoryToKeep: 'Wähle aus, welche Kategorie beibehalten werden soll',
        isTransactionBillable: 'Wählen, ob die Transaktion abrechenbar ist',
        keepThisOne: 'Behalte diesen',
        confirmDetails: `Bestätige die Details, die du behältst`,
        confirmDuplicatesInfo: `Die Duplikate, die du nicht behältst, werden für die einreichende Person zur Löschung zurückgehalten.`,
        hold: 'Diese Ausgabe wurde zurückgestellt',
        resolvedDuplicates: 'Duplikat wurde behoben',
        companyCardRequired: 'Firmenkartenkäufe erforderlich',
        noRoute: 'Bitte wähle eine gültige Adresse aus',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} ist erforderlich`,
        reportContainsExpensesWithViolations: 'Der Bericht enthält Ausgaben mit Verstößen.',
    },
    violationDismissal: {
        rter: {
            manual: 'hat diesen Beleg als Barzahlung markiert',
        },
        duplicatedTransaction: {
            manual: 'Duplikat wurde behoben',
        },
    },
    videoPlayer: {
        play: 'Wiedergeben',
        pause: 'Pause',
        fullscreen: 'Vollbild',
        playbackSpeed: 'Wiedergabegeschwindigkeit',
        expand: 'Erweitern',
        mute: 'Stummschalten',
        unmute: 'Stummschaltung aufheben',
        normal: 'Normal',
    },
    exitSurvey: {
        header: 'Bevor du gehst',
        reasonPage: {
            title: 'Bitte teilen Sie uns mit, warum Sie uns verlassen.',
            subtitle: 'Bevor du gehst, sag uns bitte, warum du zu Expensify Classic wechseln möchtest.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ich brauche eine Funktion, die nur in Expensify Classic verfügbar ist.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Ich verstehe nicht, wie ich New Expensify nutzen soll.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Ich verstehe, wie man New Expensify benutzt, aber ich bevorzuge Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Welche Funktion benötigst du, die in New Expensify nicht verfügbar ist?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Was möchten Sie tun?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Warum bevorzugst du Expensify Classic?',
        },
        responsePlaceholder: 'Ihre Antwort',
        thankYou: 'Danke für das Feedback!',
        thankYouSubtitle: 'Ihre Antworten helfen uns, ein besseres Produkt zu entwickeln, mit dem man Dinge erledigen kann. Vielen Dank!',
        goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        offlineTitle: 'Sie scheinst hier festzustecken …',
        offline:
            'Sie scheinen offline zu sein. Leider funktioniert Expensify Classic nicht offline, aber New Expensify schon. Wenn Sie Expensify Classic verwenden möchten, versuchen Sie es erneut, sobald Sie eine Internetverbindung haben.',
        quickTip: 'Kurzer Tipp ...',
        quickTipSubTitle: 'Du kannst direkt zu Expensify Classic gehen, indem du expensify.com besuchst. Setze ein Lesezeichen, um eine praktische Abkürzung zu haben!',
        bookACall: 'Termin buchen',
        bookACallTitle: 'Möchtest du mit einer Produktmanagerin oder einem Produktmanager sprechen?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Direktes Chatten zu Ausgaben und Berichten',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Alles mobil erledigen',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Reisen und Ausgaben mit der Geschwindigkeit eines Chats',
        },
        bookACallTextTop: 'Wenn du zu Expensify Classic wechselst, verpasst du:',
        bookACallTextBottom:
            'Wir würden uns freuen, mit Ihnen zu telefonieren, um den Grund zu verstehen. Sie können ein Gespräch mit einem unserer leitenden Product Manager buchen, um Ihre Bedürfnisse zu besprechen.',
        takeMeToExpensifyClassic: 'Zu Expensify Classic wechseln',
    },
    listBoundary: {
        errorMessage: 'Beim Laden weiterer Nachrichten ist ein Fehler aufgetreten',
        tryAgain: 'Erneut versuchen',
    },
    systemMessage: {
        mergedWithCashTransaction: 'hat einen Beleg mit dieser Transaktion abgeglichen',
    },
    subscription: {
        authenticatePaymentCard: 'Zahlungskarte authentifizieren',
        mobileReducedFunctionalityMessage: 'Sie können Ihre Abonnement-Einstellungen in der mobilen App nicht ändern.',
        badge: {
            freeTrial: (numOfDays: number) => `Kostenlose Testversion: Noch ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Ihre Zahlungsinformationen sind veraltet',
                subtitle: (date: string) => `Aktualisiere deine Zahlungskarte bis zum ${date}, um weiterhin alle deine Lieblingsfunktionen nutzen zu können.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Ihre Zahlung konnte nicht verarbeitet werden',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `Ihre Belastung vom ${date} über ${purchaseAmountOwed} konnte nicht verarbeitet werden. Bitte fügen Sie eine Zahlungskarte hinzu, um den geschuldeten Betrag zu begleichen.`
                        : 'Bitte füge eine Zahlungsmethode hinzu, um den ausstehenden Betrag zu begleichen.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Ihre Zahlungsinformationen sind veraltet',
                subtitle: (date: string) => `Ihre Zahlung ist überfällig. Bitte begleichen Sie Ihre Rechnung bis zum ${date}, um eine Unterbrechung des Dienstes zu vermeiden.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Ihre Zahlungsinformationen sind veraltet',
                subtitle: 'Ihre Zahlung ist überfällig. Bitte begleichen Sie Ihre Rechnung.',
            },
            billingDisputePending: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `Sie haben die Belastung über ${amountOwed} auf der Karte mit der Endziffer ${cardEnding} angefochten. Ihr Konto bleibt gesperrt, bis die Angelegenheit mit Ihrer Bank geklärt ist.`,
            },
            cardAuthenticationRequired: {
                title: 'Ihre Zahlungskarte wurde nicht vollständig authentifiziert.',
                subtitle: (cardEnding: string) => `Bitte schließen Sie den Authentifizierungsprozess ab, um Ihre Zahlungskarte mit der Endziffer ${cardEnding} zu aktivieren.`,
            },
            insufficientFunds: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: (amountOwed: number) =>
                    `Ihre Zahlungskarte wurde aufgrund unzureichender Deckung abgelehnt. Bitte versuchen Sie es erneut oder fügen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Saldo von ${amountOwed} zu begleichen.`,
            },
            cardExpired: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: (amountOwed: number) =>
                    `Ihre Zahlungskarte ist abgelaufen. Bitte fügen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Saldo von ${amountOwed} zu begleichen.`,
            },
            cardExpireSoon: {
                title: 'Ihre Karte läuft bald ab',
                subtitle:
                    'Ihre Zahlungskarte läuft am Ende dieses Monats ab. Klicken Sie unten auf das Drei-Punkte-Menü, um sie zu aktualisieren und alle Ihre Lieblingsfunktionen weiterhin zu nutzen.',
            },
            retryBillingSuccess: {
                title: 'Erfolg!',
                subtitle: 'Ihre Karte wurde erfolgreich belastet.',
            },
            retryBillingError: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle:
                    'Bevor du es erneut versuchst, rufe bitte direkt deine Bank an, um Belastungen durch Expensify zu autorisieren und eventuelle Sperren aufzuheben. Andernfalls versuche, eine andere Zahlungskarte hinzuzufügen.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Sie haben die Belastung über ${amountOwed} auf der Karte mit der Endziffer ${cardEnding} angefochten. Ihr Konto bleibt gesperrt, bis die Angelegenheit mit Ihrer Bank geklärt ist.`,
            preTrial: {
                title: 'Kostenlose Testversion starten',
                subtitle: 'Als nächsten Schritt <a href="#">führe deine Einrichtungs-Checkliste aus</a>, damit dein Team mit dem Einreichen von Ausgaben beginnen kann.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Testversion: Noch ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'} verbleibend!`,
                subtitle: 'Füge eine Zahlungskarte hinzu, um alle deine Lieblingsfunktionen weiterhin nutzen zu können.',
            },
            trialEnded: {
                title: 'Ihre kostenlose Testversion ist abgelaufen',
                subtitle: 'Füge eine Zahlungskarte hinzu, um alle deine Lieblingsfunktionen weiterhin nutzen zu können.',
            },
            earlyDiscount: {
                claimOffer: 'Angebot einlösen',
                subscriptionPageTitle: (discountType: number) =>
                    `<strong>${discountType}% Rabatt im ersten Jahr!</strong> Füge einfach eine Zahlungsmethode hinzu und starte ein Jahresabonnement.`,
                onboardingChatTitle: (discountType: number) => `Zeitlich begrenztes Angebot: ${discountType}% Rabatt auf dein erstes Jahr!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) =>
                    `Fordere innerhalb von ${days > 0 ? `${days}T :` : ''}${hours}Std : ${minutes}Min : ${seconds}Sek an`,
            },
        },
        cardSection: {
            title: 'Zahlung',
            subtitle: 'Füge eine Karte hinzu, um dein Expensify-Abonnement zu bezahlen.',
            addCardButton: 'Zahlungskarte hinzufügen',
            cardInfo: (name: string, expiration: string, currency: string) => `Name: ${name}, Ablaufdatum: ${expiration}, Währung: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Ihr nächstes Zahlungsdatum ist der ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Karte mit Endziffern ${cardNumber}`,
            changeCard: 'Zahlungskarte ändern',
            changeCurrency: 'Zahlungswährung ändern',
            cardNotFound: 'Keine Zahlungskarte hinzugefügt',
            retryPaymentButton: 'Zahlung erneut versuchen',
            authenticatePayment: 'Zahlung authentifizieren',
            requestRefund: 'Rückerstattung anfordern',
            requestRefundModal: {
                full: 'Eine Rückerstattung zu erhalten ist einfach: Stufe dein Konto vor deinem nächsten Abrechnungsdatum herab und du erhältst eine Rückerstattung. <br /> <br /> Hinweis: Wenn du dein Konto herabstufst, werden deine Arbeitsbereiche gelöscht. Diese Aktion kann nicht rückgängig gemacht werden, aber du kannst jederzeit einen neuen Arbeitsbereich erstellen, wenn du es dir anders überlegst.',
                confirm: 'Workspace(s) löschen und Downgrade durchführen',
            },
            viewPaymentHistory: 'Zahlungsverlauf anzeigen',
        },
        yourPlan: {
            title: 'Ihr Tarif',
            exploreAllPlans: 'Alle Tarife anzeigen',
            customPricing: 'Individuelle Preisgestaltung',
            asLowAs: ({price}: YourPlanPriceValueParams) => `ab nur ${price} pro aktivem Mitglied/Monat`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied/Monat`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied und Monat`,
            perMemberMonth: 'pro Mitglied/Monat',
            collect: {
                title: 'Einziehen',
                description: 'Der Small-Business-Tarif, der Ihnen Spesen, Reisen und Chat bietet.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktiven Mitgliedern mit der Expensify Card, ${upper}/aktiven Mitgliedern ohne die Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktiven Mitgliedern mit der Expensify Card, ${upper}/aktiven Mitgliedern ohne die Expensify Card.`,
                benefit1: 'Belegerfassung',
                benefit2: 'Erstattungen',
                benefit3: 'Verwaltung von Firmenkarten',
                benefit4: 'Spesen- und Reisegenehmigungen',
                benefit5: 'Reisebuchung und Richtlinien',
                benefit6: 'QuickBooks/Xero-Integrationen',
                benefit7: 'Chat über Ausgaben, Berichte und Räume',
                benefit8: 'KI- und menschlicher Support',
            },
            control: {
                title: 'Steuerung',
                description: 'Ausgaben, Reisen und Chat für größere Unternehmen.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktiven Mitgliedern mit der Expensify Card, ${upper}/aktiven Mitgliedern ohne die Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktiven Mitgliedern mit der Expensify Card, ${upper}/aktiven Mitgliedern ohne die Expensify Card.`,
                benefit1: 'Alles im Collect-Tarif',
                benefit2: 'Genehmigungsworkflows mit mehreren Ebenen',
                benefit3: 'Benutzerdefinierte Ausgabenregeln',
                benefit4: 'ERP-Integrationen (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'HR-Integrationen (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Individuelle Einblicke und Berichte',
                benefit8: 'Budgetierung',
            },
            thisIsYourCurrentPlan: 'Dies ist Ihr aktueller Tarif',
            downgrade: 'Downgrade auf Collect',
            upgrade: 'Upgrade auf Control',
            addMembers: 'Mitglieder hinzufügen',
            saveWithExpensifyTitle: 'Sparen mit der Expensify Card',
            saveWithExpensifyDescription: 'Nutze unseren Sparrechner, um zu sehen, wie das Cashback der Expensify Card deine Expensify-Rechnung senken kann.',
            saveWithExpensifyButton: 'Erfahre mehr',
        },
        compareModal: {
            comparePlans: 'Tarife vergleichen',
            subtitle: `<muted-text>Schalte die Funktionen frei, die du brauchst, mit dem Tarif, der zu dir passt. <a href="${CONST.PRICING}">Sieh dir unsere Preisseite an</a> für eine vollständige Funktionsübersicht aller unserer Tarife.</muted-text>`,
        },
        details: {
            title: 'Abonnementdetails',
            annual: 'Jahresabonnement',
            taxExempt: 'Steuerbefreiungsstatus beantragen',
            taxExemptEnabled: 'Steuerbefreit',
            taxExemptStatus: 'Steuerbefreiungsstatus',
            payPerUse: 'Nutzungsabhängig',
            subscriptionSize: 'Abonnementgröße',
            headsUp:
                'Achtung: Wenn du deine Abonnementgröße jetzt nicht festlegst, setzen wir sie automatisch auf die Anzahl der aktiven Mitglieder in deinem ersten Monat. Du verpflichtest dich dann, für mindestens diese Anzahl an Mitgliedern in den nächsten 12 Monaten zu bezahlen. Du kannst deine Abonnementgröße jederzeit erhöhen, aber du kannst sie erst verringern, wenn dein Abonnement abgelaufen ist.',
            zeroCommitment: 'Keine Verpflichtung zum ermäßigten jährlichen Abonnementpreis',
        },
        subscriptionSize: {
            title: 'Abonnementgröße',
            yourSize: 'Die Größe Ihres Abonnements ist die Anzahl offener Plätze, die in einem bestimmten Monat von beliebigen aktiven Mitgliedern belegt werden können.',
            eachMonth:
                'Jeden Monat deckt Ihr Abonnement bis zu der oben festgelegten Anzahl aktiver Mitglieder ab. Jedes Mal, wenn Sie Ihre Abonnementgröße erhöhen, starten Sie ein neues 12-monatiges Abonnement in dieser neuen Größe.',
            note: 'Hinweis: Ein aktives Mitglied ist jede Person, die Ausgabendaten erstellt, bearbeitet, eingereicht, genehmigt, erstattet oder exportiert hat, die mit dem Workspace Ihres Unternehmens verknüpft sind.',
            confirmDetails: 'Bestätige die Details deines neuen Jahresabonnements:',
            subscriptionSize: 'Abonnementgröße',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} aktive Mitglieder/Monat`,
            subscriptionRenews: 'Abonnement verlängert sich',
            youCantDowngrade: 'Sie können während Ihres Jahresabonnements kein Downgrade durchführen.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Sie haben sich bereits zu einem jährlichen Abonnement mit ${size} aktiven Mitgliedern pro Monat bis zum ${date} verpflichtet. Sie können am ${date} zu einem nutzungsabhängigen Abonnement wechseln, indem Sie die automatische Verlängerung deaktivieren.`,
            error: {
                size: 'Bitte gib eine gültige Abonnementgröße ein',
                sameSize: 'Bitte gib eine andere Zahl als deine aktuelle Abonnementgröße ein',
            },
        },
        paymentCard: {
            addPaymentCard: 'Zahlungskarte hinzufügen',
            enterPaymentCardDetails: 'Gib deine Zahlungs kartendaten ein',
            security: 'Expensify ist PCI-DSS-konform, verwendet Verschlüsselung auf Bankenniveau und nutzt redundante Infrastruktur, um Ihre Daten zu schützen.',
            learnMoreAboutSecurity: 'Erfahre mehr über unsere Sicherheit.',
        },
        subscriptionSettings: {
            title: 'Abonnementseinstellungen',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Abonnementstyp: ${subscriptionType}, Abonnementgröße: ${subscriptionSize}, Automatische Verlängerung: ${autoRenew}, Automatische jährliche Sitzplatzerhöhung: ${autoIncrease}`,
            none: 'keine',
            on: 'an',
            off: 'aus',
            annual: 'Jährlich',
            autoRenew: 'Automatisch verlängern',
            autoIncrease: 'Jährliche Sitze automatisch erhöhen',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Spare bis zu ${amountWithCurrency}/Monat pro aktivem Mitglied`,
            automaticallyIncrease:
                'Erhöhe deine jährlichen Plätze automatisch, um aktive Mitglieder aufzunehmen, die deine Abonnementgröße überschreiten. Hinweis: Dadurch wird das Enddatum deines Jahresabonnements verlängert.',
            disableAutoRenew: 'Automatische Verlängerung deaktivieren',
            helpUsImprove: 'Hilf uns, Expensify zu verbessern',
            whatsMainReason: 'Was ist der Hauptgrund, warum du die automatische Verlängerung deaktivierst?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Wird am ${date} verlängert.`,
            pricingConfiguration: 'Die Preise hängen von der Konfiguration ab. Wählen Sie für den niedrigsten Preis ein Jahresabonnement und holen Sie sich die Expensify Card.',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>Erfahre mehr auf unserer <a href="${CONST.PRICING}">Preisseite</a> oder chatte mit unserem Team in deinem ${hasAdminsRoom ? `<a href="adminsRoom">#admins-Raum.</a>` : '#admins-Raum.'}</muted-text>`,
            estimatedPrice: 'Geschätzter Preis',
            changesBasedOn: 'Dies ändert sich basierend auf deiner Expensify Card-Nutzung und den untenstehenden Abo-Optionen.',
        },
        requestEarlyCancellation: {
            title: 'Frühzeitige Kündigung beantragen',
            subtitle: 'Was ist der Hauptgrund, warum du eine vorzeitige Kündigung beantragst?',
            subscriptionCanceled: {
                title: 'Abonnement gekündigt',
                subtitle: 'Dein Jahresabonnement wurde gekündigt.',
                info: 'Wenn du deine(n) Arbeitsbereich(e) weiterhin nutzungsbasiert verwenden möchtest, bist du schon fertig.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Wenn du zukünftige Aktivitäten und Abbuchungen verhindern möchtest, musst du deinen/deine <a href="${workspacesListRoute}">Workspace(s) löschen</a>. Beachte, dass dir beim Löschen deines/deiner Workspace(s) alle ausstehenden Aktivitäten in Rechnung gestellt werden, die im aktuellen Kalendermonat angefallen sind.`,
            },
            requestSubmitted: {
                title: 'Anfrage gesendet',
                subtitle:
                    'Danke, dass Sie uns wissen lassen, dass Sie Ihr Abonnement kündigen möchten. Wir prüfen Ihre Anfrage und melden uns in Kürze über Ihren Chat mit <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Indem ich eine vorzeitige Kündigung beantrage, erkenne ich an und stimme zu, dass Expensify gemäß den Expensify-<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Nutzungsbedingungen</a> oder einer anderen zwischen mir und Expensify geltenden Servicevereinbarung nicht verpflichtet ist, einem solchen Antrag stattzugeben, und dass Expensify allein nach eigenem Ermessen über die Genehmigung eines solchen Antrags entscheidet.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Funktionalität muss verbessert werden',
        tooExpensive: 'Zu teuer',
        inadequateSupport: 'Unzureichender Kundenservice',
        businessClosing: 'Unternehmensschließung, Verkleinerung oder Übernahme',
        additionalInfoTitle: 'Zu welcher Software wechselst du und warum?',
        additionalInfoInputLabel: 'Ihre Antwort',
    },
    roomChangeLog: {
        updateRoomDescription: 'Raumbeschreibung festlegen auf:',
        clearRoomDescription: 'hat die Raumbeschreibung gelöscht',
        changedRoomAvatar: 'hat den Raum-Avatar geändert',
        removedRoomAvatar: 'hat den Raum-Avatar entfernt',
    },
    delegate: {
        switchAccount: 'Konten wechseln:',
        copilotDelegatedAccess: 'Copilot: Delegierter Zugriff',
        copilotDelegatedAccessDescription: 'Anderen Mitgliedern erlauben, auf Ihr Konto zuzugreifen.',
        addCopilot: 'Copilot hinzufügen',
        membersCanAccessYourAccount: 'Diese Mitglieder können auf Ihr Konto zugreifen:',
        youCanAccessTheseAccounts: 'Du kannst auf diese Konten über den Kontowechsler zugreifen:',
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
        genericError: 'Ups, da ist etwas schiefgelaufen. Bitte versuche es noch einmal.',
        onBehalfOfMessage: (delegator: string) => `im Namen von ${delegator}`,
        accessLevel: 'Zugriffslevel',
        confirmCopilot: 'Bestätige unten deinen Copiloten.',
        accessLevelDescription: 'Wähle unten eine Zugriffsstufe. Sowohl Vollzugriff als auch Eingeschränkter Zugriff erlauben Co-Piloten, alle Unterhaltungen und Ausgaben zu sehen.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Erlaube einem anderen Mitglied, in deinem Konto alle Aktionen in deinem Namen auszuführen. Dazu gehören Chat, Einreichungen, Genehmigungen, Zahlungen, das Aktualisieren von Einstellungen und mehr.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Ermögliche einem anderen Mitglied, die meisten Aktionen in deinem Konto in deinem Namen durchzuführen. Ausgenommen sind Genehmigungen, Zahlungen, Ablehnungen und Sperrungen.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copilot entfernen',
        removeCopilotConfirmation: 'Sind Sie sicher, dass Sie diesen Copilot entfernen möchten?',
        changeAccessLevel: 'Zugriffsstufe ändern',
        makeSureItIsYou: 'Stellen wir sicher, dass du es bist',
        enterMagicCode: (contactMethod: string) =>
            `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um eine:n Copilot:in hinzuzufügen. Er sollte innerhalb ein bis zwei Minuten ankommen.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um deinen Copilot zu aktualisieren.`,
        notAllowed: 'Nicht so schnell …',
        noAccessMessage: dedent(`
            Als Copilot hast du keinen Zugriff auf diese Seite. Entschuldigung!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `Als <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">Copilot</a> für ${accountOwnerEmail} hast du keine Berechtigung, diese Aktion durchzuführen. Entschuldigung!`,
        copilotAccess: 'Copilot-Zugriff',
    },
    debug: {
        debug: 'Debug',
        details: 'Details',
        JSON: 'JSON',
        reportActions: 'Aktionen',
        reportActionPreview: 'Vorschau',
        nothingToPreview: 'Nichts zur Vorschau',
        editJson: 'JSON bearbeiten:',
        preview: 'Vorschau:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `${propertyName} fehlt`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Ungültige Eigenschaft: ${propertyName} – Erwartet: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Ungültiger Wert – erwartet: ${expectedValues}`,
        missingValue: 'Fehlender Wert',
        createReportAction: 'Berichtaktion erstellen',
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
        visibleInLHN: 'Sichtbar in LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'wahr',
        false: 'falsch',
        viewReport: 'Bericht anzeigen',
        viewTransaction: 'Transaktion anzeigen',
        createTransactionViolation: 'Transaktionsverstoß erstellen',
        reasonVisibleInLHN: {
            hasDraftComment: 'Hat Kommentarentwurf',
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
            isWaitingForAssigneeToCompleteAction: 'Wartet darauf, dass die zuständige Person die Aktion ausführt',
            hasChildReportAwaitingAction: 'Hat untergeordneten Bericht, der auf Aktion wartet',
            hasMissingInvoiceBankAccount: 'Hat fehlendes Rechnungskonto',
            hasUnresolvedCardFraudAlert: 'Hat ungelöste Kartenbetrugswarnung',
            hasDEWApproveFailed: 'DEW-Genehmigung fehlgeschlagen',
        },
        reasonRBR: {
            hasErrors: 'Enthält Fehler in Berichts- oder Berichtaktionsdaten',
            hasViolations: 'Verstöße vorhanden',
            hasTransactionThreadViolations: 'Hat Transaktions-Thread-Verstöße',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Es gibt einen Bericht, der auf eine Aktion wartet',
            theresAReportWithErrors: 'Es gibt einen Bericht mit Fehlern',
            theresAWorkspaceWithCustomUnitsErrors: 'Es gibt einen Workspace mit Fehlern bei benutzerdefinierten Einheiten',
            theresAProblemWithAWorkspaceMember: 'Es gibt ein Problem mit einem Workspace-Mitglied',
            theresAProblemWithAWorkspaceQBOExport: 'Es gab ein Problem mit einer Exporteinstellung für die Workspace-Verbindung.',
            theresAProblemWithAContactMethod: 'Es gibt ein Problem mit einer Kontaktmethode',
            aContactMethodRequiresVerification: 'Eine Kontaktmethode erfordert eine Verifizierung',
            theresAProblemWithAPaymentMethod: 'Es gibt ein Problem mit einer Zahlungsmethode',
            theresAProblemWithAWorkspace: 'Es gibt ein Problem mit einem Workspace',
            theresAProblemWithYourReimbursementAccount: 'Es gibt ein Problem mit deinem Erstattungskonto',
            theresABillingProblemWithYourSubscription: 'Es gibt ein Abrechnungsproblem mit deinem Abonnement',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Dein Abonnement wurde erfolgreich verlängert',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Während der Synchronisierung der Workspace-Verbindung ist ein Problem aufgetreten',
            theresAProblemWithYourWallet: 'Es gibt ein Problem mit deinem Wallet',
            theresAProblemWithYourWalletTerms: 'Es gibt ein Problem mit den Bedingungen Ihrer Wallet',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Mach eine Probefahrt',
    },
    migratedUserWelcomeModal: {
        title: 'Willkommen bei New Expensify!',
        subtitle: 'Es enthält alles, was du an unserem klassischen Erlebnis liebst, plus eine ganze Reihe von Verbesserungen, die dir das Leben noch leichter machen:',
        confirmText: 'Los geht’s!',
        helpText: '2-min-Demo testen',
        features: {
            search: 'Leistungsstärkere Suche auf Mobilgerät, Web und Desktop',
            concierge: 'Integrierte Concierge-KI zur Automatisierung deiner Spesen',
            chat: 'Zu jeder Ausgabe chatten, um Fragen schnell zu klären',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '<tooltip>Leg hier <strong>los!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Benenne deine gespeicherten Suchanfragen um</strong> – hier!</tooltip>',
        accountSwitcher: '<tooltip>Greifen Sie hier auf Ihre <strong>Copilot-Konten</strong> zu</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Scanne unseren Testbeleg</strong>, um zu sehen, wie es funktioniert!</tooltip>',
            manager: '<tooltip>Wähle unseren <strong>Testmanager</strong>, um es auszuprobieren!</tooltip>',
            confirmation: '<tooltip>Jetzt <strong>reiche deine Ausgabe ein</strong> und sieh zu, wie die Magie passiert!</tooltip>',
            tryItOut: 'Probiere es aus',
        },
        outstandingFilter: '<tooltip>Filter für Ausgaben,\ndie <strong>genehmigt werden müssen</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Schicke diesen Beleg, um\n<strong>die Probefahrt abzuschließen!</strong></tooltip>',
        gpsTooltip: '<tooltip>GPS-Tracking läuft! Wenn du fertig bist, stoppe die Aufzeichnung unten.</tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Änderungen verwerfen?',
        body: 'Bist du sicher, dass du die von dir vorgenommenen Änderungen verwerfen möchtest?',
        confirmText: 'Änderungen verwerfen',
    },
    scheduledCall: {
        book: {
            title: 'Anruf planen',
            description: 'Finde eine Zeit, die für dich passt.',
            slots: ({date}: {date: string}) => `<muted-text>Verfügbare Zeiten für <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Anruf bestätigen',
            description: 'Stell sicher, dass die Details unten für dich gut aussehen. Sobald du den Anruf bestätigst, senden wir dir eine Einladung mit weiteren Infos.',
            setupSpecialist: 'Ihre*e Setup-Spezialist*in',
            meetingLength: 'Meetingdauer',
            dateTime: 'Datum & Uhrzeit',
            minutes: '30 Minuten',
        },
        callScheduled: 'Anruf geplant',
    },
    autoSubmitModal: {
        title: 'Alles klar und eingereicht!',
        description: 'Alle Warnungen und Verstöße wurden gelöscht, daher:',
        submittedExpensesTitle: 'Diese Ausgaben wurden eingereicht',
        submittedExpensesDescription: 'Diese Ausgaben wurden an Ihre:n Genehmiger:in gesendet, können aber bis zur Genehmigung weiterhin bearbeitet werden.',
        pendingExpensesTitle: 'Ausstehende Ausgaben wurden verschoben',
        pendingExpensesDescription: 'Alle ausstehenden Kartenausgaben wurden in einen separaten Bericht verschoben, bis sie gebucht sind.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Mach eine zweiminütige Probefahrt',
        },
        modal: {
            title: 'Probier uns aus',
            description: 'Machen Sie eine kurze Produkttour, um schnell auf den neuesten Stand zu kommen.',
            confirmText: 'Testlauf starten',
            helpText: 'Überspringen',
            employee: {
                description:
                    '<muted-text>Verschaffe deinem Team <strong>3 kostenlose Monate Expensify!</strong> Gib einfach unten die E-Mail-Adresse deiner/deines Vorgesetzten ein und sende eine Testausgabe.</muted-text>',
                email: 'Gib die E-Mail-Adresse deiner Führungskraft ein',
                error: 'Dieses Mitglied besitzt einen Workspace, bitte gib ein neues Mitglied zum Testen ein.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Du testest Expensify gerade ausprobieren',
            readyForTheRealThing: 'Bereit für das Richtige?',
            getStarted: 'Loslegen',
        },
        employeeInviteMessage: (name: string) => `# ${name} hat dich eingeladen, Expensify auszuprobieren
Hey! Ich habe gerade *3 Monate kostenlos* bekommen, damit wir Expensify testen können – die schnellste Art, Spesen zu erfassen.

Hier ist ein *Beleg zum Testen*, um dir zu zeigen, wie es funktioniert:`,
    },
    export: {
        basicExport: 'Basisexport',
        reportLevelExport: 'Alle Daten – Berichtsebene',
        expenseLevelExport: 'Alle Daten – Ausgabenebene',
        exportInProgress: 'Export wird ausgeführt',
        conciergeWillSend: 'Concierge sendet dir die Datei in Kürze.',
    },
    domain: {
        notVerified: 'Nicht verifiziert',
        retry: 'Erneut versuchen',
        verifyDomain: {
            title: 'Domain verifizieren',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Bevor du fortfährst, bestätige, dass du <strong>${domainName}</strong> besitzt, indem du seine DNS-Einstellungen aktualisierst.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Rufe deinen DNS-Anbieter auf und öffne die DNS-Einstellungen für <strong>${domainName}</strong>.`,
            addTXTRecord: 'Fügen Sie den folgenden TXT-Eintrag hinzu:',
            saveChanges: 'Änderungen speichern und hierher zurückkehren, um Ihre Domain zu verifizieren.',
            youMayNeedToConsult: `Möglicherweise müssen Sie die IT-Abteilung Ihrer Organisation konsultieren, um die Verifizierung abzuschließen. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Weitere Informationen</a>.`,
            warning: 'Nach der Verifizierung erhalten alle Expensify-Mitglieder in Ihrer Domain eine E-Mail, dass ihr Konto unter Ihrer Domain verwaltet wird.',
            codeFetchError: 'Bestätigungscode konnte nicht abgerufen werden',
            genericError: 'Wir konnten Ihre Domain nicht überprüfen. Bitte versuchen Sie es erneut und wenden Sie sich an Concierge, wenn das Problem weiterhin besteht.',
        },
        domainVerified: {
            title: 'Domain verifiziert',
            header: 'Wooo! Deine Domain wurde verifiziert',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Die Domain <strong>${domainName}</strong> wurde erfolgreich verifiziert und Sie können jetzt SAML und andere Sicherheitsfunktionen einrichten.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML Single Sign-On (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML-SSO</a> ist eine Sicherheitsfunktion, mit der Sie besser steuern können, wie sich Mitglieder mit <strong>${domainName}</strong>-E-Mails bei Expensify anmelden. Um sie zu aktivieren, müssen Sie sich als autorisierte*r Unternehmensadmin verifizieren.</muted-text>`,
            fasterAndEasierLogin: 'Schnelleres und einfacheres Anmelden',
            moreSecurityAndControl: 'Mehr Sicherheit und Kontrolle',
            onePasswordForAnything: 'Ein Passwort für alles',
        },
        goToDomain: 'Zur Domain wechseln',
        samlLogin: {
            title: 'SAML-Anmeldung',
            subtitle: `<muted-text>Konfiguriere die Anmeldung von Mitgliedern mit <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO).</a></muted-text>`,
            enableSamlLogin: 'SAML-Anmeldung aktivieren',
            allowMembers: 'Mitgliedern die Anmeldung mit SAML erlauben.',
            requireSamlLogin: 'SAML-Anmeldung erzwingen',
            anyMemberWillBeRequired: 'Jedes Mitglied, das mit einer anderen Methode angemeldet ist, muss sich erneut per SAML authentifizieren.',
            enableError: 'SAML-Aktivierungseinstellung konnte nicht aktualisiert werden',
            requireError: 'Die SAML-Anforderungseinstellung konnte nicht aktualisiert werden',
            disableSamlRequired: 'Deaktivierung von SAML erforderlich',
            oktaWarningPrompt: 'Bist du sicher? Dadurch wird auch Okta SCIM deaktiviert.',
            requireWithEmptyMetadataError: 'Bitte fügen Sie unten die Metadaten des Identitätsanbieters hinzu, um zu aktivieren',
        },
        samlConfigurationDetails: {
            title: 'SAML-Konfigurationsdetails',
            subtitle: 'Verwende diese Angaben, um SAML einzurichten.',
            identityProviderMetadata: 'Identitätsanbieter-Metadaten',
            entityID: 'Entitäts-ID',
            nameIDFormat: 'Name-ID-Format',
            loginUrl: 'Login-URL',
            acsUrl: 'ACS-URL (Assertion Consumer Service)',
            logoutUrl: 'Logout-URL',
            sloUrl: 'SLO-(Single-Logout-)URL',
            serviceProviderMetaData: 'Service-Provider-Metadaten',
            oktaScimToken: 'Okta-SCIM-Token',
            revealToken: 'Token anzeigen',
            fetchError: 'SAML-Konfigurationsdetails konnten nicht abgerufen werden',
            setMetadataGenericError: 'SAML-Metadaten konnten nicht festgelegt werden',
        },
        accessRestricted: {
            title: 'Zugriff eingeschränkt',
            subtitle: (domainName: string) =>
                `Bitte bestätigen Sie sich als autorisierte*r Unternehmensadministrator*in für <strong>${domainName}</strong>, wenn Sie Kontrolle benötigen über:`,
            companyCardManagement: 'Firmenkartenverwaltung',
            accountCreationAndDeletion: 'Kontoerstellung und -löschung',
            workspaceCreation: 'Erstellung des Arbeitsbereichs',
            samlSSO: 'SAML-SSO',
        },
        addDomain: {
            title: 'Domain hinzufügen',
            subtitle: 'Gib den Namen der privaten Domain ein, auf die du zugreifen möchtest (z. B. expensify.com).',
            domainName: 'Domainname',
            newDomain: 'Neue Domain',
        },
        domainAdded: {
            title: 'Domain hinzugefügt',
            description: 'Als Nächstes musst du den Besitz der Domain verifizieren und deine Sicherheitseinstellungen anpassen.',
            configure: 'Konfigurieren',
        },
        enhancedSecurity: {
            title: 'Erhöhte Sicherheit',
            subtitle: 'Erzwingen Sie für Mitglieder Ihrer Domain die Anmeldung über Single Sign-On, beschränken Sie die Erstellung von Workspaces und mehr.',
            enable: 'Aktivieren',
        },
        domainAdmins: 'Domain-Admins',
        admins: {
            title: 'Admins',
            findAdmin: 'Admin finden',
            primaryContact: 'Hauptansprechpartner',
            addPrimaryContact: 'Primären Kontakt hinzufügen',
            setPrimaryContactError: 'Primären Kontakt konnte nicht festgelegt werden. Bitte versuche es später erneut.',
            settings: 'Einstellungen',
            consolidatedDomainBilling: 'Konsolidierte Domain-Abrechnung',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Wenn diese Option aktiviert ist, bezahlt die Hauptansprechperson alle Arbeitsbereiche, die Mitgliedern von <strong>${domainName}</strong> gehören, und erhält alle Zahlungsbelege.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'Die konsolidierte Domain-Abrechnung konnte nicht geändert werden. Bitte versuche es später noch einmal.',
            addAdmin: 'Admin hinzufügen',
            addAdminError: 'Dieses Mitglied kann nicht als Admin hinzugefügt werden. Bitte versuche es erneut.',
            revokeAdminAccess: 'Adminzugriff entziehen',
            cantRevokeAdminAccess: 'Administratorzugriff kann beim technischen Kontakt nicht widerrufen werden',
            error: {
                removeAdmin: 'Dieser Benutzer kann nicht als Administrator entfernt werden. Bitte versuche es erneut.',
                removeDomain: 'Diese Domain kann nicht entfernt werden. Bitte versuche es erneut.',
                removeDomainNameInvalid: 'Bitte gib deinen Domainnamen ein, um ihn zurückzusetzen.',
            },
            resetDomain: 'Domain zurücksetzen',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Bitte gib zur Bestätigung des Domäne-Resets <strong>${domainName}</strong> ein.`,
            enterDomainName: 'Gib hier deinen Domainnamen ein',
            resetDomainInfo: `Diese Aktion ist <strong>dauerhaft</strong> und die folgenden Daten werden gelöscht: <br/> <ul><li>Firmenkarten-Verbindungen und alle nicht eingereichten Ausgaben von diesen Karten</li> <li>SAML- und Gruppeneinstellungen</li> </ul> Alle Konten, Workspaces, Berichte, Ausgaben und anderen Daten bleiben erhalten. <br/><br/>Hinweis: Sie können diese Domain aus Ihrer Domainliste entfernen, indem Sie die zugehörige E-Mail aus Ihren <a href="#">Kontaktmethoden</a> entfernen.`,
        },
        members: {
            title: 'Mitglieder',
            findMember: 'Mitglied finden',
            addMember: 'Mitglied hinzufügen',
            email: 'E-Mail-Adresse',
            errors: {
                addMember: 'Dieses Mitglied kann nicht hinzugefügt werden. Bitte versuche es erneut.',
            },
        },
    },
};
export default translations;
