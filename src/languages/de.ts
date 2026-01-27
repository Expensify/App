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
/* eslint-disable max-len */
const translations: TranslationDeepObject<typeof en> = {
    common: {
        // @context Used as a noun meaning a numerical total or quantity, not the verb “to count.”
        count: 'Anzahl',
        cancel: 'Abbrechen',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: 'Schließen',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: 'Fortfahren',
        unshare: 'Freigabe aufheben',
        yes: 'Ja',
        no: 'Nein',
        // @context Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.
        ok: 'OK',
        notNow: 'Nicht jetzt',
        noThanks: 'Nein danke',
        learnMore: 'Mehr erfahren',
        buttonConfirm: 'Verstanden',
        name: 'Name',
        attachment: 'Anhang',
        attachments: 'Anhänge',
        center: 'Zentrieren',
        from: 'Von',
        to: 'AnAn',
        in: 'In',
        optional: 'Optional',
        new: 'Neu',
        search: 'Suche',
        reports: 'Berichte',
        find: 'Suchen',
        searchWithThreeDots: 'Suchen...',
        next: 'Weiter',
        previous: 'Zurück',
        // @context Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.
        goBack: 'Zurück',
        create: 'Erstellen',
        add: 'Hinzufügen',
        resend: 'Erneut senden',
        save: 'Speichern',
        select: 'Auswählen',
        deselect: 'Auswahl aufheben',
        // @context Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.
        selectMultiple: 'Mehrfachauswahl',
        saveChanges: 'Änderungen speichern',
        submit: 'Senden',
        // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        submitted: 'Eingereicht',
        rotate: 'Drehen',
        zoom: 'Zoom',
        password: 'Passwort',
        magicCode: 'Magischer Code',
        digits: 'Ziffern',
        twoFactorCode: 'Zwei-Faktor-Code',
        workspaces: 'Workspaces',
        inbox: 'Posteingang',
        // @context Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”
        success: 'Erfolgreich',
        group: 'Gruppe',
        profile: 'Profil',
        referral: 'Empfehlung',
        payments: 'Zahlungen',
        approvals: 'Genehmigungen',
        wallet: 'Wallet',
        preferences: 'Einstellungen',
        view: 'Anzeigen',
        review: (reviewParams?: ReviewParams) => `Überprüfen${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Nicht',
        signIn: 'Anmelden',
        signInWithGoogle: 'Mit Google anmelden',
        signInWithApple: 'Mit Apple anmelden',
        signInWith: 'Anmelden mit',
        continue: 'Weiter',
        firstName: 'Vorname',
        lastName: 'Nachname',
        scanning: 'Scanvorgang läuft',
        analyzing: 'Analysiere …',
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
        privacyPolicy: 'Datenschutzrichtlinie',
        hidden: 'Ausgeblendet',
        visible: 'Sichtbar',
        delete: 'Löschen',
        // @context UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.
        archived: 'archiviert',
        contacts: 'Kontakte',
        recents: 'Zuletzt verwendet',
        close: 'Schließen',
        comment: 'Kommentar',
        download: 'Herunterladen',
        downloading: 'Wird heruntergeladen',
        // @context Indicates that a file is currently being uploaded (sent to the server), not downloaded.
        uploading: 'Wird hochgeladen',
        // @context as a verb, not a noun
        pin: 'Anheften',
        unPin: 'Lösen',
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
        ssnFull9: 'Vollständige 9 Ziffern der SSN',
        addressLine: (lineNumber: number) => `Adresszeile ${lineNumber}`,
        personalAddress: 'Persönliche Adresse',
        companyAddress: 'Firmenadresse',
        noPO: 'Bitte keine Postfach- oder Maildrop-Adressen.',
        city: 'Stadt',
        state: 'Status',
        streetAddress: 'Straße und Hausnummer',
        stateOrProvince: 'Bundesstaat / Provinz',
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
        recentDestinations: 'Kürzliche Ziele',
        timePrefix: 'Es ist',
        conjunctionFor: 'für',
        todayAt: 'Heute um',
        tomorrowAt: 'Morgen um',
        yesterdayAt: 'Gestern um',
        conjunctionAt: 'um',
        conjunctionTo: 'bis',
        genericErrorMessage: 'Ups ... etwas ist schiefgelaufen und deine Anfrage konnte nicht abgeschlossen werden. Bitte versuche es später noch einmal.',
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
            invalidDateShouldBeFuture: 'Bitte wähle heute oder ein zukünftiges Datum',
            invalidTimeShouldBeFuture: 'Bitte wähle eine Uhrzeit, die mindestens eine Minute in der Zukunft liegt',
            invalidCharacter: 'Ungültiges Zeichen',
            enterMerchant: 'Gib einen Händlernamen ein',
            enterAmount: 'Betrag eingeben',
            missingMerchantName: 'Fehlender Händlername',
            missingAmount: 'Fehlender Betrag',
            missingDate: 'Datum fehlt',
            enterDate: 'Gib ein Datum ein',
            invalidTimeRange: 'Bitte gib eine Uhrzeit im 12-Stunden-Format ein (z. B. 2:30 PM)',
            pleaseCompleteForm: 'Bitte fülle das obige Formular aus, um fortzufahren',
            pleaseSelectOne: 'Bitte wähle oben eine Option aus',
            invalidRateError: 'Bitte gib einen gültigen Satz ein',
            lowRateError: 'Der Satz muss größer als 0 sein',
            email: 'Bitte gib eine gültige E-Mail-Adresse ein',
            login: 'Beim Anmelden ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        comma: 'Komma',
        semicolon: 'Semikolon',
        please: 'Bitte',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'Kontakt aufnehmen',
        pleaseEnterEmailOrPhoneNumber: 'Bitte E-Mail-Adresse oder Telefonnummer eingeben',
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: 'Behebe die Fehler',
        inTheFormBeforeContinuing: 'im Formular, bevor du fortfährst',
        confirm: 'Bestätigen',
        reset: 'Zurücksetzen',
        // @context Status or button indicating that an action or process has been completed. Should reflect completion.
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
        // @context Instruction telling the user to input data manually. Refers to entering text or values in a field.
        enterManually: 'Manuell eingeben',
        message: 'Nachricht',
        leaveThread: 'Thread verlassen',
        you: 'Du',
        // @context Refers to the current user in the UI. Should follow capitalization rules for labels/pronouns in the target language.
        me: 'Ich',
        youAfterPreposition: 'du',
        your: 'dein',
        conciergeHelp: 'Bitte wende dich für Hilfe an Concierge.',
        youAppearToBeOffline: 'Sie scheinen offline zu sein.',
        thisFeatureRequiresInternet: 'Diese Funktion erfordert eine aktive Internetverbindung.',
        attachmentWillBeAvailableOnceBackOnline: 'Der Anhang wird verfügbar, sobald du wieder online bist.',
        errorOccurredWhileTryingToPlayVideo: 'Beim Versuch, dieses Video abzuspielen, ist ein Fehler aufgetreten.',
        areYouSure: 'Bist du sicher?',
        verify: 'Bestätigen',
        yesContinue: 'Ja, fortfahren',
        // @context Provides an example format for a website URL.
        websiteExample: 'z. B. https://www.expensify.com',
        // @context Provides an example format for a ZIP/postal code.
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `z. B. ${zipSampleFormat}` : ''),
        description: 'Beschreibung',
        title: 'Titel',
        assignee: 'Zuständige Person',
        createdBy: 'Erstellt von',
        with: 'mit',
        shareCode: 'Code teilen',
        share: 'Teilen',
        per: 'pro',
        // @context Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.
        mi: 'Meile',
        km: 'Kilometer',
        copied: 'Kopiert!',
        someone: 'Jemand',
        total: 'Gesamt',
        edit: 'Bearbeiten',
        letsDoThis: `Los geht's!`,
        letsStart: `Los geht’s`,
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
        verified: 'Bestätigt',
        replace: 'Ersetzen',
        distance: 'Entfernung',
        mile: 'Meile',
        // @context Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.
        miles: 'Meilen',
        kilometer: 'Kilometer',
        kilometers: 'Kilometer',
        recent: 'Zuletzt',
        all: 'Alle',
        am: 'Vorm.',
        pm: 'PM',
        // @context Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.
        tbd: 'Wird noch festgelegt',
        selectCurrency: 'Währung auswählen',
        selectSymbolOrCurrency: 'Wähle ein Symbol oder eine Währung aus',
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
            title: 'Juhu! Alles aufgeholt.',
            subtitleText1: 'Finde einen Chat über die',
            subtitleText2: 'Schaltfläche oben oder erstelle etwas mit der',
            subtitleText3: 'Schaltfläche unten.',
        },
        businessName: 'Firmenname',
        clear: 'Löschen',
        type: 'Typ',
        reportName: 'Berichtsname',
        action: 'Aktion',
        expenses: 'Ausgaben',
        totalSpend: 'Gesamtausgaben',
        tax: 'Steuer',
        shared: 'Freigegeben',
        drafts: 'Entwürfe',
        // @context as a noun, not a verb
        draft: 'Entwurf',
        finished: 'Abgeschlossen',
        upgrade: 'Upgrade',
        downgradeWorkspace: 'Workspace herabstufen',
        companyID: 'Unternehmens-ID',
        userID: 'Benutzer-ID',
        disable: 'Deaktivieren',
        export: 'Export',
        initialValue: 'Anfangswert',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: 'Aktuelles Datum',
        value: 'Wert',
        downloadFailedTitle: 'Download fehlgeschlagen',
        downloadFailedDescription: 'Ihr Download konnte nicht abgeschlossen werden. Bitte versuchen Sie es später erneut.',
        filterLogs: 'Protokolle filtern',
        network: 'Netzwerk',
        reportID: 'Berichts-ID',
        longReportID: 'Langer Bericht-ID',
        withdrawalID: 'Auszahlungs-ID',
        bankAccounts: 'Bankkonten',
        chooseFile: 'Datei auswählen',
        chooseFiles: 'Dateien auswählen',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: 'Loslassen',
        // @context Instruction for dropping one or more files into an upload area.
        dropMessage: 'Datei hier ablegen',
        ignore: 'Ignorieren',
        enabled: 'Aktiviert',
        disabled: 'Deaktiviert',
        // @context Action button for importing a file or data. Should use the verb form, not the noun form.
        import: 'Importieren',
        offlinePrompt: 'Diese Aktion kann derzeit nicht ausgeführt werden.',
        // @context meaning "remaining to be paid, done, or dealt with", not "exceptionally good"
        outstanding: 'Ausstehend',
        chats: 'Chats',
        tasks: 'Aufgaben',
        unread: 'Ungelesen',
        sent: 'Gesendet',
        links: 'Links',
        // @context Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).
        day: 'Tag',
        days: 'Tage',
        rename: 'Umbenennen',
        address: 'Adresse',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Überspringen',
        chatWithAccountManager: (accountManagerDisplayName: string) => `Sie brauchen etwas Bestimmtes? Chatten Sie mit Ihrer/Ihrem Kundenbetreuer: ${accountManagerDisplayName}.`,
        chatNow: 'Jetzt chatten',
        workEmail: 'Arbeits-E-Mail',
        destination: 'Ziel',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: 'Nebensatzrate',
        perDiem: 'Tagegeld',
        validate: 'Validieren',
        downloadAsPDF: 'Als PDF herunterladen',
        downloadAsCSV: 'Als CSV herunterladen',
        help: 'Hilfe',
        expenseReport: 'Spesenabrechnung',
        expenseReports: 'Spesenabrechnungen',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'Satz außerhalb der Richtlinie',
        leaveWorkspace: 'Arbeitsbereich verlassen',
        leaveWorkspaceConfirmation: 'Wenn du diesen Workspace verlässt, kannst du keine Ausgaben mehr dafür einreichen.',
        leaveWorkspaceConfirmationAuditor: 'Wenn du diesen Workspace verlässt, kannst du seine Berichte und Einstellungen nicht mehr anzeigen.',
        leaveWorkspaceConfirmationAdmin: 'Wenn du diesen Workspace verlässt, kannst du seine Einstellungen nicht mehr verwalten.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Workspace verlässt, wirst du im Genehmigungs-Workflow durch ${workspaceOwner}, den Workspace-Inhaber, ersetzt.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Workspace verlässt, wirst du als bevorzugte*r Exporteur*in durch ${workspaceOwner}, den/die Workspace-Inhaber*in, ersetzt.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Arbeitsbereich verlässt, wirst du als technischer Kontakt durch ${workspaceOwner}, den/die Arbeitsbereichsinhaber·in, ersetzt.`,
        leaveWorkspaceReimburser:
            'Sie können diesen Workspace als Erstattungsverantwortliche*r nicht verlassen. Bitte legen Sie unter „Workspaces > Zahlungen veranlassen oder nachverfolgen“ eine*n neue*n Erstattungsverantwortliche*n fest und versuchen Sie es dann erneut.',
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
        reschedule: 'Verschieben',
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
        frequency: 'Frequenz',
        link: 'Link',
        pinned: 'Angeheftet',
        read: 'Lesen',
        copyToClipboard: 'In Zwischenablage kopieren',
        thisIsTakingLongerThanExpected: 'Das dauert länger als erwartet ...',
        domains: 'Domains',
        actionRequired: 'Handlung erforderlich',
        duplicate: 'Duplizieren',
        duplicated: 'Dupliziert',
        duplicateExpense: 'Doppelte Ausgabe',
        exchangeRate: 'Wechselkurs',
        reimbursableTotal: 'Erstattungsfähiger Gesamtbetrag',
        nonReimbursableTotal: 'Nicht erstattungsfähiger Gesamtbetrag',
        originalAmount: 'Ursprünglicher Betrag',
        insights: 'Einblicke',
        duplicateExpense: 'Doppelte Ausgabe',
        newFeature: 'Neue Funktion',
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
        description: 'Sie dürfen diese Aktion nicht ausführen, da dieses Konto gesperrt wurde. Bitte wenden Sie sich an concierge@expensify.com, um die nächsten Schritte zu erfahren.',
    },
    location: {
        useCurrent: 'Aktuellen Standort verwenden',
        notFound: 'Wir konnten Ihren Standort nicht finden. Bitte versuchen Sie es erneut oder geben Sie eine Adresse manuell ein.',
        permissionDenied: 'Es scheint, dass du den Zugriff auf deinen Standort verweigert hast.',
        please: 'Bitte',
        allowPermission: 'Standortzugriff in den Einstellungen erlauben',
        tryAgain: 'und versuche es erneut.',
    },
    contact: {
        importContacts: 'Kontakte importieren',
        importContactsTitle: 'Kontakte importieren',
        importContactsText: 'Importiere Kontakte von deinem Handy, damit deine Lieblingsmenschen immer nur einen Fingertipp entfernt sind.',
        importContactsExplanation: 'damit deine Lieblingsmenschen immer nur einen Tipp entfernt sind.',
        importContactsNativeText: 'Nur noch ein Schritt! Erteilen Sie uns die Freigabe, um Ihre Kontakte zu importieren.',
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
        sizeNotMet: 'Die Anhangsgröße muss größer als 240 Bytes sein',
        wrongFileType: 'Ungültiger Dateityp',
        notAllowedExtension: 'Dieser Dateityp ist nicht erlaubt. Bitte versuchen Sie es mit einem anderen Dateityp.',
        folderNotAllowedMessage: 'Das Hochladen eines Ordners ist nicht erlaubt. Bitte versuchen Sie es mit einer anderen Datei.',
        protectedPDFNotSupported: 'Passwortgeschützte PDF-Datei wird nicht unterstützt',
        attachmentImageResized: 'Dieses Bild wurde für die Vorschau verkleinert. Für die volle Auflösung herunterladen.',
        attachmentImageTooLarge: 'Dieses Bild ist zu groß, um eine Vorschau vor dem Hochladen anzuzeigen.',
        tooManyFiles: (fileLimit: number) => `Sie können jeweils nur bis zu ${fileLimit} Dateien hochladen.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Dateien überschreiten ${maxUploadSizeInMB} MB. Bitte versuche es erneut.`,
        someFilesCantBeUploaded: 'Einige Dateien können nicht hochgeladen werden',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Dateien müssen kleiner als ${maxUploadSizeInMB} MB sein. Größere Dateien werden nicht hochgeladen.`,
        maxFileLimitExceeded: 'Sie können bis zu 30 Belege auf einmal hochladen. Weitere Belege werden nicht hochgeladen.',
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
        supportingText: 'Du kannst dieses Fenster schließen und zur Expensify-App zurückkehren.',
    },
    avatarCropModal: {
        title: 'Foto bearbeiten',
        description: 'Ziehe, zoome und drehe dein Bild, wie du möchtest.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Keine Erweiterung für MIME-Typ gefunden',
        problemGettingImageYouPasted: 'Beim Abrufen des eingefügten Bildes ist ein Problem aufgetreten',
        commentExceededMaxLength: (formattedMaxLength: string) => `Die maximale Kommentarlänge beträgt ${formattedMaxLength} Zeichen.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `Die maximale Länge des Aufgabentitels beträgt ${formattedMaxLength} Zeichen.`,
    },
    baseUpdateAppModal: {
        updateApp: 'App aktualisieren',
        updatePrompt: 'Eine neue Version dieser App ist verfügbar.\nAktualisiere jetzt oder starte die App später neu, um die neuesten Änderungen herunterzuladen.',
    },
    deeplinkWrapper: {
        launching: 'Expensify wird gestartet',
        expired: 'Ihre Sitzung ist abgelaufen.',
        signIn: 'Bitte melden Sie sich erneut an.',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: 'Biometrie-Test',
            authenticationSuccessful: 'Authentifizierung erfolgreich',
            successfullyAuthenticatedUsing: ({authType}: MultifactorAuthenticationTranslationParams) => `Du hast dich erfolgreich mit ${authType} authentifiziert.`,
            troubleshootBiometricsStatus: ({registered}: MultifactorAuthenticationTranslationParams) => `Biometrische Daten (${registered ? 'Registriert' : 'Nicht registriert'})`,
            yourAttemptWasUnsuccessful: 'Ihr Authentifizierungsversuch war nicht erfolgreich.',
            youCouldNotBeAuthenticated: 'Sie konnten nicht authentifiziert werden',
            areYouSureToReject: 'Sind Sie sicher? Der Authentifizierungsversuch wird abgelehnt, wenn Sie diesen Bildschirm schließen.',
            rejectAuthentication: 'Authentifizierung ablehnen',
            test: 'Test',
            biometricsAuthentication: 'Biometrische Authentifizierung',
        },
        pleaseEnableInSystemSettings: {
            start: 'Bitte aktiviere die Gesichts-/Fingerabdrucküberprüfung oder richte einen Gerätecode ein in deinen',
            link: 'Systemeinstellungen',
            end: '.',
        },
        oops: 'Ups, da ist etwas schiefgelaufen',
        looksLikeYouRanOutOfTime: 'Anscheinend ist Ihre Zeit abgelaufen! Bitte versuchen Sie es erneut beim Händler.',
        youRanOutOfTime: 'Die Zeit ist abgelaufen',
        letsVerifyItsYou: 'Bestätigen wir, dass du es bist',
        verifyYourself: {
            biometrics: 'Bestätige dich mit deinem Gesicht oder Fingerabdruck',
        },
        enableQuickVerification: {
            biometrics: 'Aktiviere eine schnelle, sichere Verifizierung mit deinem Gesicht oder Fingerabdruck. Keine Passwörter oder Codes erforderlich.',
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
            Bitte geben Sie den Code von dem Gerät ein,
            auf dem er ursprünglich angefordert wurde
        `),
        doNotShare: dedent(`
            Gib deinen Code an niemanden weiter.  
            Expensify wird dich niemals danach fragen!
        `),
        or: 'oder',
        signInHere: 'Melde dich einfach hier an',
        expiredCodeTitle: 'Magic Code abgelaufen',
        expiredCodeDescription: 'Geh zum ursprünglichen Gerät zurück und fordere einen neuen Code an',
        successfulNewCodeRequest: 'Code angefordert. Bitte überprüfe dein Gerät.',
        tfaRequiredTitle: dedent(`
            Zwei-Faktor-Authentifizierung erforderlich
        `),
        tfaRequiredDescription: dedent(`
            Bitte gib den Zwei-Faktor-Authentifizierungscode dort ein, wo du dich anzumelden versuchst.
        `),
        requestOneHere: 'Fordere hier eine an.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Bezahlt von',
        whatsItFor: 'Wozu ist das?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Name, E-Mail-Adresse oder Telefonnummer',
        findMember: 'Mitglied finden',
        searchForSomeone: 'Nach jemandem suchen',
    },
    customApprovalWorkflow: {
        title: 'Benutzerdefinierter Genehmigungsworkflow',
        description: 'Ihr Unternehmen verwendet in diesem Workspace einen benutzerdefinierten Genehmigungsworkflow. Bitte führen Sie diese Aktion in Expensify Classic aus',
        goToExpensifyClassic: 'Zu Expensify Classic wechseln',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Reiche eine Ausgabe ein, wirb dein Team',
            subtitleText: 'Möchtest du, dass dein Team Expensify auch nutzt? Reiche ihnen einfach eine Ausgabe ein, und wir kümmern uns um den Rest.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Termin buchen',
    },
    hello: 'Hallo',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Leg jetzt unten los.',
        anotherLoginPageIsOpen: 'Eine weitere Anmeldeseite ist geöffnet.',
        anotherLoginPageIsOpenExplanation: 'Sie haben die Anmeldeseite in einem separaten Tab geöffnet. Bitte melden Sie sich in diesem Tab an.',
        welcome: 'Willkommen!',
        welcomeWithoutExclamation: 'Willkommen',
        phrase2: 'Geld spricht Bände. Und jetzt, da Chat und Zahlungen an einem Ort sind, ist es auch einfach.',
        phrase3: 'Deine Zahlungen erreichen dich so schnell, wie du dein Anliegen rüberbringen kannst.',
        enterPassword: 'Bitte gib dein Passwort ein',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, es ist immer schön, ein neues Gesicht hier zu sehen!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Bitte gib den Magic Code ein, der an ${login} gesendet wurde. Er sollte innerhalb ein bis zwei Minuten ankommen.`,
    },
    login: {
        hero: {
            header: 'Reisen und Ausgaben in Chat-Geschwindigkeit',
            body: 'Willkommen bei der nächsten Generation von Expensify, in der Ihre Reisen und Ausgaben mit Hilfe von kontextbezogenem Echtzeit‑Chat noch schneller verwaltet werden.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Mit Single Sign-On weiter anmelden:',
        orContinueWithMagicCode: 'Sie können sich auch mit einem magischen Code anmelden',
        useSingleSignOn: 'Einmalanmeldung verwenden',
        useMagicCode: 'Magischen Code verwenden',
        launching: 'Wird gestartet ...',
        oneMoment: 'Einen Moment, wir leiten dich zu deinem Single-Sign-On-Portal deines Unternehmens weiter.',
    },
    reportActionCompose: {
        dropToUpload: 'Zum Hochladen ablegen',
        sendAttachment: 'Anhang senden',
        addAttachment: 'Anhang hinzufügen',
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
            return `Möchtest du dieses ${type} wirklich löschen?`;
        },
        onlyVisible: 'Nur sichtbar für',
        replyInThread: 'Im Thread antworten',
        joinThread: 'Thread beitreten',
        leaveThread: 'Thread verlassen',
        copyOnyxData: 'Onyx-Daten kopieren',
        flagAsOffensive: 'Als anstößig melden',
        menu: 'Menü',
    },
    emojiReactions: {
        addReactionTooltip: 'Reaktion hinzufügen',
        reactedWith: 'reagierte mit',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `Du hast die Party in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> verpasst, hier gibt es nichts zu sehen.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `Dieser Chat ist mit allen Expensify-Mitgliedern in der Domain <strong>${domainRoom}</strong>. Nutze ihn, um mit Kolleg:innen zu chatten, Tipps auszutauschen und Fragen zu stellen.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Dieser Chat ist mit dem/der <strong>${workspaceName}</strong>-Admin. Verwende ihn, um über die Einrichtung des Arbeitsbereichs und mehr zu chatten.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `Dieser Chat ist mit allen in <strong>${workspaceName}</strong>. Verwende ihn für die wichtigsten Ankündigungen.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Dieser Chatraum ist für alles gedacht, was mit <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> zu tun hat.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Dieser Chat ist für Rechnungen zwischen <strong>${invoicePayer}</strong> und <strong>${invoiceReceiver}</strong>. Verwende die +‑Schaltfläche, um eine Rechnung zu senden.`,
        beginningOfChatHistory: (users: string) => `Dieser Chat ist mit ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `Hier reicht <strong>${submitterDisplayName}</strong> Ausgaben bei <strong>${workspaceName}</strong> ein. Verwende einfach die +-Taste.`,
        beginningOfChatHistorySelfDM: 'Dies ist dein persönlicher Bereich. Nutze ihn für Notizen, Aufgaben, Entwürfe und Erinnerungen.',
        beginningOfChatHistorySystemDM: 'Willkommen! Legen wir los mit deiner Einrichtung.',
        chatWithAccountManager: 'Hier mit Ihrer Kundenbetreuung chatten',
        sayHello: 'Sag hallo!',
        yourSpace: 'Dein Bereich',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Willkommen in ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Verwende die +‑Taste, um eine Ausgabe zu ${additionalText}.`,
        askConcierge: 'Stelle Fragen und erhalte rund um die Uhr Echtzeit-Support.',
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
            `hat diesen Bericht für alle angehaltenen Ausgaben aus <a href="${reportUrl}">${reportName}</a> erstellt`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Alle in diesem Gespräch benachrichtigen',
    },
    newMessages: 'Neue Nachrichten',
    latestMessages: 'Neueste Nachrichten',
    youHaveBeenBanned: 'Hinweis: Du wurdest vom Chatten in diesem Kanal ausgeschlossen.',
    reportTypingIndicator: {
        isTyping: 'schreibt …',
        areTyping: 'tippen gerade...',
        multipleMembers: 'Mehrere Mitglieder',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Dieser Chatraum wurde archiviert.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Dieser Chat ist nicht mehr aktiv, weil ${displayName} ihr Konto geschlossen hat.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${oldDisplayName} sein Konto mit ${displayName} zusammengeführt hat.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Dieser Chat ist nicht mehr aktiv, weil <strong>du</strong> kein Mitglied des ${policyName}-Workspaces mehr bist.`
                : `Dieser Chat ist nicht mehr aktiv, da ${displayName} kein Mitglied des Workspaces ${policyName} mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${policyName} kein aktiver Workspace mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${policyName} kein aktiver Workspace mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Diese Buchung ist archiviert.',
    },
    writeCapabilityPage: {
        label: 'Wer darf posten',
        writeCapability: {
            all: 'Alle Mitglieder',
            admins: 'Nur Administratoren',
        },
    },
    sidebarScreen: {
        buttonFind: 'Finde etwas ...',
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
                'Wir nehmen noch ein paar letzte Feinabstimmungen an New Expensify vor, um es an Ihre spezielle Konfiguration anzupassen. In der Zwischenzeit können Sie Expensify Classic verwenden.',
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
        upload: 'Tabellendatei hochladen',
        import: 'Tabellendokument importieren',
        dragAndDrop:
            '<muted-link>Ziehen Sie Ihre Tabellenkalkulation hierher und legen Sie sie ab oder wählen Sie unten eine Datei aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Ziehe deine Tabelle hierher oder wähle unten eine Datei aus. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Erfahre mehr</a> über unterstützte Dateiformate.</muted-link>`,
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
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `${rates} Tagegeldsätze wurden hinzugefügt.` : '1 Tagegeldsatz wurde hinzugefügt.'),
        importFailedTitle: 'Import fehlgeschlagen',
        importFailedDescription:
            'Bitte stellen Sie sicher, dass alle Felder korrekt ausgefüllt sind, und versuchen Sie es erneut. Wenn das Problem weiterhin besteht, wenden Sie sich bitte an Concierge.',
        importDescription: 'Wählen Sie aus, welche Felder aus Ihrer Tabelle zugeordnet werden sollen, indem Sie unten neben jeder importierten Spalte auf das Dropdown-Menü klicken.',
        sizeNotMet: 'Dateigröße muss größer als 0 Byte sein',
        invalidFileMessage:
            'Die Datei, die du hochgeladen hast, ist entweder leer oder enthält ungültige Daten. Bitte stelle sicher, dass die Datei korrekt formatiert ist und alle erforderlichen Informationen enthält, bevor du sie erneut hochlädst.',
        importSpreadsheetLibraryError: 'Laden des Tabellenkalkulationsmoduls fehlgeschlagen. Bitte überprüfe deine Internetverbindung und versuche es erneut.',
        importSpreadsheet: 'Tabellendokument importieren',
        downloadCSV: 'CSV herunterladen',
        importMemberConfirmation: () => ({
            one: `Bitte bestätige die untenstehenden Details für ein neues Arbeitsbereichsmitglied, das im Rahmen dieses Uploads hinzugefügt wird. Bestehende Mitglieder erhalten keine Aktualisierungen ihrer Rollen und keine Einladungsnachrichten.`,
            other: (count: number) =>
                `Bitte bestätige die folgenden Details für die ${count} neuen Workspace-Mitglieder, die im Rahmen dieses Uploads hinzugefügt werden. Bestehende Mitglieder erhalten keine Rollenaktualisierungen oder Einladungsnachrichten.`,
        }),
    },
    receipt: {
        upload: 'Beleg hochladen',
        uploadMultiple: 'Belege hochladen',
        desktopSubtitleSingle: `oder ziehe sie hierheroder ziehe sie hierher`,
        desktopSubtitleMultiple: `oder hierher ziehen und ablegen`,
        alternativeMethodsTitle: 'Weitere Möglichkeiten, Belege hinzuzufügen:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">Lade die App herunter</a>, um vom Handy aus zu scannen</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Leite Belege weiter an <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Füge deine Nummer hinzu</a>, um Belege an ${phoneNumber} zu senden</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Sende Belege per SMS an ${phoneNumber} (nur US-Nummern)</label-text>`,
        takePhoto: 'Foto aufnehmen',
        cameraAccess: 'Für das Fotografieren von Belegen ist Kamerazugriff erforderlich.',
        deniedCameraAccess: `Der Kamerazugriff wurde immer noch nicht gewährt, bitte folge <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">diesen Anweisungen</a>.`,
        cameraErrorTitle: 'Kamerafehler',
        cameraErrorMessage: 'Beim Aufnehmen eines Fotos ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        locationAccessTitle: 'Standortzugriff erlauben',
        locationAccessMessage: 'Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall korrekt zu halten.',
        locationErrorTitle: 'Standortzugriff erlauben',
        locationErrorMessage: 'Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall korrekt zu halten.',
        allowLocationFromSetting: `Der Zugriff auf deinen Standort hilft uns, deine Zeitzone und Währung überall korrekt zu halten. Bitte erlaube den Standortzugriff in den Berechtigungseinstellungen deines Geräts.`,
        dropTitle: 'Lass es los',
        dropMessage: 'Datei hier ablegen',
        flash: 'Blitz',
        multiScan: 'Mehrfach-Scan',
        shutter: 'Verschluss',
        gallery: 'Galerie',
        deleteReceipt: 'Beleg löschen',
        deleteConfirmation: 'Möchten Sie diesen Beleg wirklich löschen?',
        addReceipt: 'Beleg hinzufügen',
        scanFailed: 'Die Quittung konnte nicht gescannt werden, da der Händler, das Datum oder der Betrag fehlt.',
        addAReceipt: {
            phrase1: 'Beleg hinzufügen',
            phrase2: 'oder hierher ziehen und ablegen',
        },
    },
    quickAction: {
        scanReceipt: 'Beleg scannen',
        recordDistance: 'Entfernung verfolgen',
        requestMoney: 'Ausgabe erstellen',
        perDiem: 'Tagespauschale erstellen',
        splitBill: 'Ausgabe aufteilen',
        splitScan: 'Beleg teilen',
        splitDistance: 'Strecke aufteilen',
        paySomeone: ({name}: PaySomeoneParams = {}) => `${name ?? 'jemand'} bezahlen`,
        assignTask: 'Aufgabe zuweisen',
        header: 'Schnellaktion',
        noLongerHaveReportAccess: 'Du hast keinen Zugriff mehr auf dein bisheriges Ziel für Schnellaktionen. Wähle unten ein neues aus.',
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
        splitDates: 'Datumsaufteilung',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} bis ${endDate} (${count} Tage)`,
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} von ${merchant}`,
        splitByPercentage: 'Nach Prozent aufteilen',
        splitByDate: 'Nach Datum aufteilen',
        addSplit: 'Aufteilung hinzufügen',
        makeSplitsEven: 'Aufteilungen ausgleichen',
        editSplits: 'Splits bearbeiten',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist um ${amount} höher als die ursprüngliche Ausgabe.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist um ${amount} geringer als die ursprüngliche Ausgabe.`,
        splitExpenseZeroAmount: 'Bitte gib einen gültigen Betrag ein, bevor du fortfährst.',
        splitExpenseOneMoreSplit: 'Keine Aufteilungen hinzugefügt. Füge mindestens eine hinzu, um zu speichern.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `${amount} für ${merchant} bearbeiten`,
        removeSplit: 'Aufteilung entfernen',
        splitExpenseCannotBeEditedModalTitle: 'Diese Ausgabe kann nicht bearbeitet werden',
        splitExpenseCannotBeEditedModalDescription: 'Genehmigte oder bezahlte Ausgaben können nicht bearbeitet werden',
        paySomeone: ({name}: PaySomeoneParams = {}) => `${name ?? 'jemand'} bezahlen`,
        expense: 'Ausgabe',
        categorize: 'Kategorisieren',
        share: 'Teilen',
        participants: 'Teilnehmende',
        createExpense: 'Ausgabe erstellen',
        trackDistance: 'Entfernung verfolgen',
        createExpenses: (expensesNumber: number) => `${expensesNumber} Ausgaben erstellen`,
        removeExpense: 'Ausgabe entfernen',
        removeThisExpense: 'Diesen Beleg entfernen',
        removeExpenseConfirmation: 'Möchtest du diesen Beleg wirklich entfernen? Diese Aktion kann nicht rückgängig gemacht werden.',
        addExpense: 'Ausgabe hinzufügen',
        chooseRecipient: 'Empfänger auswählen',
        createExpenseWithAmount: ({amount}: {amount: string}) => `${amount}-Ausgabe erstellen`,
        confirmDetails: 'Details bestätigen',
        pay: 'Bezahlen',
        cancelPayment: 'Zahlung stornieren',
        cancelPaymentConfirmation: 'Sind Sie sicher, dass Sie diese Zahlung stornieren möchten?',
        viewDetails: 'Details anzeigen',
        pending: 'Ausstehend',
        canceled: 'Abgebrochen',
        posted: 'Gebucht',
        deleteReceipt: 'Beleg löschen',
        findExpense: 'Ausgabe finden',
        deletedTransaction: (amount: string, merchant: string) => `hat eine Ausgabe gelöscht (${amount} für ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `hat eine Ausgabe verschoben${reportName ? `von ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `hat diese Ausgabe verschoben${reportName ? `an <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `hat diese Ausgabe verschoben${reportName ? `von <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `hat diese Ausgabe in deinen <a href="${reportUrl}">persönlichen Bereich</a> verschoben`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `hat diesen Bericht in den Workspace <a href="${newParentReportUrl}">${toPolicyName}</a> verschoben`;
            }
            return `hat diesen <a href="${movedReportUrl}">Report</a> in den Workspace <a href="${newParentReportUrl}">${toPolicyName}</a> verschoben`;
        },
        pendingMatchWithCreditCard: 'Beleg wartet auf Abgleich mit Kartentransaktion',
        pendingMatch: 'Ausstehende Zuordnung',
        pendingMatchWithCreditCardDescription: 'Beleg wartet auf Abgleich mit Kartenumsatz. Als Barzahlung markieren, um abzubrechen.',
        markAsCash: 'Als Bar markieren',
        routePending: 'Weiterleitung ausstehend...',
        receiptScanning: () => ({
            one: 'Beleg wird gescannt ...',
            other: 'Belege werden gescannt ...',
        }),
        scanMultipleReceipts: 'Mehrere Belege scannen',
        scanMultipleReceiptsDescription: 'Fotografiere alle deine Belege auf einmal und bestätige dann die Details selbst – oder wir übernehmen das für dich.',
        receiptScanInProgress: 'Belegscan wird durchgeführt',
        receiptScanInProgressDescription: 'Belegerfassung läuft. Später zurückkommen oder Details jetzt eingeben.',
        removeFromReport: 'Aus Bericht entfernen',
        moveToPersonalSpace: 'Ausgaben in deinen persönlichen Bereich verschieben',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Potenzielle doppelte Ausgaben erkannt. Überprüfe die Duplikate, um das Einreichen zu ermöglichen.'
                : 'Mögliche doppelte Ausgaben erkannt. Überprüfe die Duplikate, um die Genehmigung zu ermöglichen.',
        receiptIssuesFound: () => ({
            one: 'Problem gefunden',
            other: 'Gefundene Probleme',
        }),
        fieldPending: 'Ausstehend ...',
        defaultRate: 'Standardtarif',
        receiptMissingDetails: 'Belegangaben fehlen',
        missingAmount: 'Fehlender Betrag',
        missingMerchant: 'Fehlender Händler',
        receiptStatusTitle: 'Scannen …',
        receiptStatusText: 'Nur du kannst diesen Beleg sehen, während er gescannt wird. Schau später noch einmal vorbei oder gib die Details jetzt ein.',
        receiptScanningFailed: 'Belegerfassung fehlgeschlagen. Bitte gib die Details manuell ein.',
        transactionPendingDescription: 'Transaktion ausstehend. Die Verbuchung kann einige Tage dauern.',
        companyInfo: 'Firmeninformationen',
        companyInfoDescription: 'Wir benötigen noch ein paar weitere Angaben, bevor du deine erste Rechnung senden kannst.',
        yourCompanyName: 'Ihr Firmenname',
        yourCompanyWebsite: 'Website Ihres Unternehmens',
        yourCompanyWebsiteNote: 'Wenn Sie keine Website haben, können Sie stattdessen das LinkedIn- oder Social-Media-Profil Ihres Unternehmens angeben.',
        invalidDomainError: 'Du hast eine ungültige Domain eingegeben. Um fortzufahren, gib bitte eine gültige Domain ein.',
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
            other: 'Möchtest du diese Ausgaben wirklich löschen?',
        }),
        deleteReport: 'Bericht löschen',
        deleteReportConfirmation: 'Sind Sie sicher, dass Sie diesen Bericht löschen möchten?',
        settledExpensify: 'Bezahlt',
        done: 'Fertig',
        settledElsewhere: 'Anderswo bezahlt',
        individual: 'Einzelperson',
        business: 'Geschäft',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Bezahle ${formattedAmount} mit Expensify` : `Mit Expensify bezahlen`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als Privatperson bezahlen` : `Mit privatem Konto bezahlen`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} mit Wallet bezahlen` : `Mit Wallet bezahlen`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `${formattedAmount} bezahlen`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als Unternehmen bezahlen` : `Mit Geschäftskonto bezahlen`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als bezahlt markieren` : `Als bezahlt markieren`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `hat ${amount} mit privatem Konto ${last4Digits} bezahlt` : `Mit privatem Konto bezahlt`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `${amount} mit Geschäftskonto ${last4Digits} bezahlt` : `Mit Geschäftskonto bezahlt`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Bezahle ${formattedAmount} über ${policyName}` : `Bezahle über ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `${amount} mit Bankkonto ${last4Digits} bezahlt` : `bezahlt mit Bankkonto ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `${amount ? `${amount} ` : ''} mit Bankkonto ${last4Digits} über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a> bezahlt`,
        invoicePersonalBank: (lastFour: string) => `Persönliches Konto • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Geschäftskonto • ${lastFour}`,
        nextStep: 'Nächste Schritte',
        finished: 'Abgeschlossen',
        flip: 'Drehen',
        sendInvoice: ({amount}: RequestAmountParams) => `Sende Rechnung über ${amount}`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `für ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `eingereicht${memo ? `, mit Vermerk ${memo}` : ''}`,
        automaticallySubmitted: `eingereicht über <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">Übermittlung verzögern</a>`,
        queuedToSubmitViaDEW: 'zur Einreichung über benutzerdefinierten Genehmigungsworkflow vorgemerkt',
        trackedAmount: (formattedAmount: string, comment?: string) => `verfolge ${formattedAmount}${comment ? `für ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `${amount} aufteilen`,
        didSplitAmount: (formattedAmount: string, comment: string) => `aufteilen ${formattedAmount}${comment ? `für ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Dein Anteil ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} schuldet ${amount}${comment ? `für ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} schuldet:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}hat ${amount} bezahlt`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} hat bezahlt:`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} hat ${amount} ausgegeben`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} hat ausgegeben:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} hat genehmigt:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} hat ${amount} genehmigt`,
        payerSettled: (amount: number | string) => `${amount} bezahlt`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `hat ${amount} bezahlt. Füge ein Bankkonto hinzu, um deine Zahlung zu erhalten.`,
        automaticallyApproved: `genehmigt durch <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a>`,
        approvedAmount: (amount: number | string) => `${amount} genehmigt`,
        approvedMessage: `genehmigt`,
        unapproved: `nicht genehmigt`,
        automaticallyForwarded: `genehmigt durch <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a>`,
        forwarded: `genehmigt`,
        rejectedThisReport: 'hat diesen Bericht abgelehnt',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `hat die Zahlung gestartet, wartet aber darauf, dass ${submitterDisplayName} ein Bankkonto hinzufügt.`,
        adminCanceledRequest: 'hat die Zahlung storniert',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `hat die Zahlung über ${amount} storniert, weil ${submitterDisplayName} sein/ihr Expensify Wallet nicht innerhalb von 30 Tagen aktiviert hat`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} hat ein Bankkonto hinzugefügt. Die Zahlung über ${amount} wurde vorgenommen.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}als bezahlt markiert${comment ? `und sagt: „${comment}“` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}mit Wallet bezahlt`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}mit Expensify bezahlt über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a>`,
        noReimbursableExpenses: 'Dieser Bericht enthält einen ungültigen Betrag',
        pendingConversionMessage: 'Der Gesamtbetrag wird aktualisiert, sobald du wieder online bist',
        changedTheExpense: 'hat die Ausgabe geändert',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `den ${valueName} in ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `lege ${translatedChangedField} auf ${newMerchant} fest, wodurch der Betrag auf ${newAmountToDisplay} gesetzt wurde`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `der/die/das ${valueName} (zuvor ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `die/den/das ${valueName} auf ${newValueToDisplay} (zuvor ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `hat ${translatedChangedField} in ${newMerchant} geändert (zuvor ${oldMerchant}), wodurch der Betrag auf ${newAmountToDisplay} aktualisiert wurde (zuvor ${oldAmountToDisplay})`,
        basedOnAI: 'basierend auf bisherigen Aktivitäten',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `basierend auf den <a href="${rulesLink}">Workspace-Regeln</a>` : 'basierend auf dem Arbeitsbereichsregeln'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `für ${comment}` : 'Ausgabe'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Rechnungsbericht Nr. ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} gesendet${comment ? `für ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `Ausgabe von privatem Bereich nach ${workspaceName ?? `Chat mit ${reportName}`} verschoben`,
        movedToPersonalSpace: 'Ausgabe in persönlichen Bereich verschoben',
        error: {
            invalidCategoryLength: 'Der Kategoriename überschreitet 255 Zeichen. Bitte kürze ihn oder wähle eine andere Kategorie.',
            invalidTagLength: 'Der Schlagwortname überschreitet 255 Zeichen. Bitte kürze ihn oder wähle ein anderes Schlagwort.',
            invalidAmount: 'Bitte gib einen gültigen Betrag ein, bevor du fortfährst',
            invalidDistance: 'Bitte gib eine gültige Entfernung ein, bevor du fortfährst',
            invalidReadings: 'Bitte gib sowohl den Start- als auch den Endstand ein',
            negativeDistanceNotAllowed: 'Endstand muss größer als Startstand sein',
            invalidIntegerAmount: 'Bitte gib vor dem Fortfahren einen ganzen Dollarbetrag ein',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Der maximale Steuerbetrag beträgt ${amount}`,
            invalidSplit: 'Die Summe der Aufteilungen muss dem Gesamtbetrag entsprechen',
            invalidSplitParticipants: 'Bitte gib für mindestens zwei Teilnehmende einen Betrag größer als null ein',
            invalidSplitYourself: 'Bitte gib einen von Null verschiedenen Betrag für deine Aufteilung ein',
            noParticipantSelected: 'Bitte wähle eine:n Teilnehmer:in aus',
            other: 'Unerwarteter Fehler. Bitte versuche es später erneut.',
            genericCreateFailureMessage: 'Unerwarteter Fehler beim Einreichen dieser Ausgabe. Bitte versuche es später noch einmal.',
            genericCreateInvoiceFailureMessage: 'Unerwarteter Fehler beim Senden dieser Rechnung. Bitte versuche es später erneut.',
            genericHoldExpenseFailureMessage: 'Unerwarteter Fehler beim Zurückhalten dieser Ausgabe. Bitte versuche es später noch einmal.',
            genericUnholdExpenseFailureMessage: 'Unerwarteter Fehler beim Entfernen dieser Spesen aus dem Haltestatus. Bitte versuche es später noch einmal.',
            receiptDeleteFailureError: 'Unerwarteter Fehler beim Löschen dieses Belegs. Bitte versuche es später erneut.',
            receiptFailureMessage:
                '<rbr>Beim Hochladen Ihres Belegs ist ein Fehler aufgetreten. Bitte <a href="download">speichern Sie den Beleg</a> und <a href="retry">versuchen Sie es</a> später erneut.</rbr>',
            receiptFailureMessageShort: 'Beim Hochladen Ihres Belegs ist ein Fehler aufgetreten.',
            genericDeleteFailureMessage: 'Unerwarteter Fehler beim Löschen dieses Speseneintrags. Bitte versuche es später erneut.',
            genericEditFailureMessage: 'Unerwarteter Fehler beim Bearbeiten dieser Ausgabe. Bitte versuche es später noch einmal.',
            genericSmartscanFailureMessage: 'Der Transaktion fehlen Felder',
            duplicateWaypointsErrorMessage: 'Bitte entferne doppelte Wegpunkte',
            atLeastTwoDifferentWaypoints: 'Bitte gib mindestens zwei verschiedene Adressen ein',
            splitExpenseMultipleParticipantsErrorMessage:
                'Eine Ausgabe kann nicht zwischen einem Arbeitsbereich und anderen Mitgliedern aufgeteilt werden. Bitte aktualisiere deine Auswahl.',
            invalidMerchant: 'Bitte geben Sie einen gültigen Händler ein',
            atLeastOneAttendee: 'Es muss mindestens eine teilnehmende Person ausgewählt werden',
            invalidQuantity: 'Bitte eine gültige Menge eingeben',
            quantityGreaterThanZero: 'Die Menge muss größer als null sein',
            invalidSubrateLength: 'Es muss mindestens einen Untertarif geben',
            invalidRate: 'Satz für diesen Workspace ungültig. Bitte wähle einen verfügbaren Satz aus dem Workspace aus.',
            endDateBeforeStartDate: 'Das Enddatum darf nicht vor dem Startdatum liegen',
            endDateSameAsStartDate: 'Das Enddatum darf nicht mit dem Startdatum übereinstimmen',
            manySplitsProvided: `Die maximale Anzahl zulässiger Aufteilungen ist ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `Der Datumsbereich darf ${CONST.IOU.SPLITS_LIMIT} Tage nicht überschreiten.`,
        },
        dismissReceiptError: 'Fehler ausblenden',
        dismissReceiptErrorConfirmation: 'Achtung! Wenn du diesen Fehler ausblendest, wird deine hochgeladene Quittung vollständig entfernt. Bist du sicher?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `hat mit dem Ausgleich begonnen. Die Zahlung wird zurückgehalten, bis ${submitterDisplayName} ihr Wallet aktiviert.`,
        enableWallet: 'Wallet aktivieren',
        hold: 'Halten',
        unhold: 'Sperre aufheben',
        holdExpense: () => ({
            one: 'Ausgabe zurückhalten',
            other: 'Spesen zurückhalten',
        }),
        unholdExpense: 'Spesenfreigabe aufheben',
        heldExpense: 'hat diese Ausgabe zurückgehalten',
        unheldExpense: 'hat diese Ausgabe freigegeben',
        moveUnreportedExpense: 'Nicht gemeldete Ausgabe verschieben',
        addUnreportedExpense: 'Nicht gemeldete Ausgabe hinzufügen',
        selectUnreportedExpense: 'Wähle mindestens eine Ausgabe aus, die dem Bericht hinzugefügt werden soll.',
        emptyStateUnreportedExpenseTitle: 'Keine nicht gemeldeten Ausgaben',
        emptyStateUnreportedExpenseSubtitle: 'Sie scheinen keine nicht eingereichten Ausgaben zu haben. Erstellen Sie unten eine.',
        addUnreportedExpenseConfirm: 'Zu Bericht hinzufügen',
        newReport: 'Neuer Bericht',
        explainHold: () => ({
            one: 'Erkläre, warum du diese Ausgabe zurückhältst.',
            other: 'Erkläre, warum du diese Ausgaben zurückhältst.',
        }),
        retracted: 'zurückgezogen',
        retract: 'Zurückziehen',
        reopened: 'wiedereröffnet',
        reopenReport: 'Bericht erneut öffnen',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Dieser Bericht wurde bereits nach ${connectionName} exportiert. Änderungen können zu Datenabweichungen führen. Sind Sie sicher, dass Sie diesen Bericht wieder öffnen möchten?`,
        reason: 'Grund',
        holdReasonRequired: 'Beim Zurückhalten ist ein Grund erforderlich.',
        expenseWasPutOnHold: 'Ausgabe wurde zurückgestellt',
        expenseOnHold: 'Diese Ausgabe wurde zurückgestellt. Bitte lies die Kommentare für die nächsten Schritte.',
        expensesOnHold: 'Alle Ausgaben wurden angehalten. Bitte überprüfe die Kommentare für die nächsten Schritte.',
        expenseDuplicate: 'Diese Ausgabe hat ähnliche Details wie eine andere. Bitte überprüfe die Duplikate, um fortzufahren.',
        someDuplicatesArePaid: 'Einige dieser Duplikate wurden bereits genehmigt oder bezahlt.',
        reviewDuplicates: 'Duplikate überprüfen',
        keepAll: 'Alle behalten',
        confirmApprove: 'Bestätige den Genehmigungsbetrag',
        confirmApprovalAmount: 'Nur konforme Ausgaben genehmigen oder den gesamten Bericht genehmigen.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist zurückgestellt. Möchtest du sie trotzdem genehmigen?',
            other: 'Diese Ausgaben sind angehalten. Möchtest du sie trotzdem genehmigen?',
        }),
        confirmPay: 'Zahlungsbetrag bestätigen',
        confirmPayAmount: 'Bezahle, was nicht zurückgestellt ist, oder bezahle den gesamten Bericht.',
        confirmPayAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist ausgesetzt. Möchtest du sie trotzdem bezahlen?',
            other: 'Diese Ausgaben sind angehalten. Möchtest du sie trotzdem bezahlen?',
        }),
        payOnly: 'Nur bezahlen',
        approveOnly: 'Nur genehmigen',
        holdEducationalTitle: 'Soll diese Ausgabe zurückgestellt werden?',
        whatIsHoldExplain: '„Halten“ ist wie auf „Pause“ drücken bei einer Ausgabe, bis du bereit bist, sie einzureichen.',
        holdIsLeftBehind: 'Zurückgehaltene Ausgaben bleiben unberührt, selbst wenn du einen gesamten Bericht einreichst.',
        unholdWhenReady: 'Ausgesetzte Ausgaben wieder freigeben, wenn du bereit bist, sie einzureichen.',
        changePolicyEducational: {
            title: 'Du hast diesen Bericht verschoben!',
            description: 'Überprüfen Sie diese Punkte genau, da sie sich beim Verschieben von Berichten in einen neuen Workspace häufig ändern.',
            reCategorize: '<strong>Kategorisiere alle Ausgaben neu</strong>, um die Arbeitsbereichsregeln einzuhalten.',
            workflows: 'Für diesen Bericht gilt jetzt möglicherweise ein anderer <strong>Genehmigungsablauf.</strong>',
        },
        changeWorkspace: 'Arbeitsbereich wechseln',
        set: 'festlegen',
        changed: 'geändert',
        removed: 'entfernt',
        transactionPending: 'Transaktion ausstehend.',
        chooseARate: 'Wähle einen Workspace-Erstattungssatz pro Meile oder Kilometer',
        unapprove: 'Freigabe aufheben',
        unapproveReport: 'Abrechnung ablehnen',
        headsUp: 'Achtung!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Dieser Bericht wurde bereits nach ${accountingIntegration} exportiert. Änderungen können zu Datenabweichungen führen. Bist du sicher, dass du die Freigabe dieses Berichts zurücknehmen möchtest?`,
        reimbursable: 'erstattungsfähig',
        nonReimbursable: 'nicht erstattungsfähig',
        bookingPending: 'Diese Buchung ist ausstehend',
        bookingPendingDescription: 'Diese Buchung ist ausstehend, weil sie noch nicht bezahlt wurde.',
        bookingArchived: 'Diese Buchung ist archiviert',
        bookingArchivedDescription: 'Diese Buchung ist archiviert, weil das Reisedatum verstrichen ist. Füge bei Bedarf eine Ausgabe über den Endbetrag hinzu.',
        attendees: 'Teilnehmende',
        whoIsYourAccountant: 'Wer ist Ihre Steuerberaterin bzw. Ihr Steuerberater?',
        paymentComplete: 'Zahlung abgeschlossen',
        time: 'Zeit',
        startDate: 'Startdatum',
        endDate: 'Enddatum',
        startTime: 'Startzeit',
        endTime: 'Endzeit',
        deleteSubrate: 'Unterrate löschen',
        deleteSubrateConfirmation: 'Möchtest du diesen Untertarif wirklich löschen?',
        quantity: 'Menge',
        subrateSelection: 'Wähle einen Untertarif aus und gib eine Menge ein.',
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
        reject: {
            educationalTitle: 'Solltest du zurückhalten oder ablehnen?',
            educationalText: 'Wenn du eine Ausgabe noch nicht genehmigen oder bezahlen möchtest, kannst du sie zurückstellen oder ablehnen.',
            holdExpenseTitle: 'Behalte eine Ausgabe zurück, um vor der Genehmigung oder Zahlung nach weiteren Details zu fragen.',
            approveExpenseTitle: 'Genehmige andere Ausgaben, während zurückgestellte Ausgaben weiter dir zugewiesen bleiben.',
            heldExpenseLeftBehindTitle: 'Angehaltene Ausgaben werden ausgelassen, wenn du einen gesamten Bericht genehmigst.',
            rejectExpenseTitle: 'Weise eine Ausgabe ab, die du nicht genehmigen oder bezahlen möchtest.',
            reasonPageTitle: 'Ausgabe ablehnen',
            reasonPageDescription: 'Erkläre, warum du diese Ausgabe ablehnst.',
            rejectReason: 'Ablehnungsgrund',
            markAsResolved: 'Als gelöst markieren',
            rejectedStatus: 'Diese Ausgabe wurde abgelehnt. Bitte behebe die Probleme und markiere sie als gelöst, damit sie eingereicht werden kann.',
            reportActions: {
                rejectedExpense: 'hat diese Ausgabe abgelehnt',
                markedAsResolved: 'hat den Ablehnungsgrund als gelöst markiert',
            },
        },
        moveExpenses: () => ({one: 'Ausgabe verschieben', other: 'Ausgaben verschieben'}),
        moveExpensesError: 'Sie können Pauschalspesen nicht in Berichte anderer Arbeitsbereiche verschieben, da die Tagessätze zwischen den Arbeitsbereichen unterschiedlich sein können.',
        changeApprover: {
            title: 'Genehmigende Person ändern',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Wählen Sie eine Option, um die/den Genehmigenden für diesen Bericht zu ändern. (Aktualisieren Sie Ihre <a href="${workflowSettingLink}">Workspace-Einstellungen</a>, um dies dauerhaft für alle Berichte zu ändern.)`,
            changedApproverMessage: (managerID: number) => `hat die/den Genehmigenden in <mention-user accountID="${managerID}"/> geändert`,
            actions: {
                addApprover: 'Genehmigenden hinzufügen',
                addApproverSubtitle: 'Fügen Sie dem bestehenden Workflow eine weitere genehmigende Person hinzu.',
                bypassApprovers: 'Genehmigende umgehen',
                bypassApproversSubtitle: 'Dich selbst als endgültige*n Genehmiger*in zuweisen und alle verbleibenden Genehmiger überspringen.',
            },
            addApprover: {
                subtitle: 'Wähle eine zusätzliche genehmigende Person für diesen Bericht, bevor wir ihn durch den restlichen Genehmigungsworkflow weiterleiten.',
            },
        },
        chooseWorkspace: 'Arbeitsbereich auswählen',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `Bericht aufgrund des benutzerdefinierten Genehmigungsworkflows an ${to} weitergeleitet`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'Stunde' : 'Stunden'} @ ${rate} / Stunde`,
            hrs: 'Std.',
            hours: 'Stunden',
            ratePreview: (rate: string) => `${rate} / Stunde`,
            amountTooLargeError: 'Der Gesamtbetrag ist zu hoch. Verringere die Stunden oder reduziere den Satz.',
        },
        correctDistanceRateError: 'Behebe den Fehler beim Entfernungssatz und versuche es erneut.',
    },
    transactionMerge: {
        listPage: {
            header: 'Ausgaben zusammenführen',
            noEligibleExpenseFound: 'Keine berechtigten Ausgaben gefunden',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Du hast keine Ausgaben, die mit dieser zusammengeführt werden können. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Weitere Informationen</a> zu berechtigten Ausgaben.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Wähle eine <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">berechtigte Ausgabe</a> zum Zusammenführen mit <strong>${reportName}</strong> aus.`,
        },
        receiptPage: {
            header: 'Beleg auswählen',
            pageTitle: 'Wähle den Beleg aus, den du behalten möchtest:',
        },
        detailsPage: {
            header: 'Details auswählen',
            pageTitle: 'Wähle die Details aus, die du behalten möchtest:',
            noDifferences: 'Keine Unterschiede zwischen den Transaktionen gefunden',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? 'an' : 'a';
                return `Bitte ${article} ${field} auswählen`;
            },
            pleaseSelectAttendees: 'Bitte Teilnehmer auswählen',
            selectAllDetailsError: 'Wähle alle Details aus, bevor du fortfährst.',
        },
        confirmationPage: {
            header: 'Details bestätigen',
            pageTitle: 'Bestätige die Details, die du behältst. Die Details, die du nicht behältst, werden gelöscht.',
            confirmButton: 'Ausgaben zusammenführen',
        },
    },
    share: {
        shareToExpensify: 'In Expensify teilen',
        messageInputLabel: 'Nachricht',
    },
    notificationPreferencesPage: {
        header: 'Benachrichtigungseinstellungen',
        label: 'Mich über neue Nachrichten benachrichtigen',
        notificationPreferences: {
            always: 'Sofort',
            daily: 'Täglich',
            mute: 'Stumm schalten',
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: 'Ausgeblendet',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Die Nummer wurde noch nicht verifiziert. Klicke auf die Schaltfläche, um den Bestätigungslink per SMS erneut zu senden.',
        emailHasNotBeenValidated: 'Die E-Mail wurde nicht verifiziert. Klicke auf die Schaltfläche, um den Bestätigungslink per SMS erneut zu senden.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Foto hochladen',
        removePhoto: 'Foto entfernen',
        editImage: 'Foto bearbeiten',
        viewPhoto: 'Foto anzeigen',
        imageUploadFailed: 'Bild-Upload fehlgeschlagen',
        deleteWorkspaceError: 'Entschuldigung, es ist ein unerwartetes Problem beim Löschen deines Workspace-Avatars aufgetreten',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Das ausgewählte Bild überschreitet die maximale Uploadgröße von ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Bitte lade ein Bild hoch, das größer als ${minHeightInPx}x${minWidthInPx} Pixel und kleiner als ${maxHeightInPx}x${maxWidthInPx} Pixel ist.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `Profilbild muss einer der folgenden Typen sein: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: 'Profilbild bearbeiten',
        upload: 'Hochladen',
        uploadPhoto: 'Foto hochladen',
        selectAvatar: 'Avatar auswählen',
        choosePresetAvatar: 'Oder wähle einen benutzerdefinierten Avatar',
    },
    modal: {
        backdropLabel: 'Modales Overlay',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> Ausgaben hinzufügst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> Ausgaben hinzufügt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf eine*n Admin, der/die Spesen hinzufügt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> Spesen einreichst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf <strong>${actor}</strong>, um Auslagen einzureichen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf eine*n Admin, der/die Spesen einreicht.`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Keine weiteren Maßnahmen erforderlich!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wir warten darauf, dass <strong>du</strong> ein Bankkonto hinzufügst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warte darauf, dass <strong>${actor}</strong> ein Bankkonto hinzufügt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf Administrator, um ein Bankkonto hinzuzufügen.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `am ${eta}` : ` ${eta}`;
                }
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>deine</strong> Ausgaben automatisch eingereicht werden${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass die Ausgaben von <strong>${actor}</strong> automatisch eingereicht werden${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass die Ausgaben eines Admins automatisch eingereicht werden${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> die Probleme behebst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf <strong>${actor}</strong>, um die Probleme zu beheben.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warte darauf, dass ein Admin die Probleme behebt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wartet auf <strong>dich</strong>, um Spesen freizugeben.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf die Genehmigung der Ausgaben durch <strong>${actor}</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf die Genehmigung der Ausgaben durch eine Administratorin oder einen Administrator.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten auf <strong>dich</strong>, um diesen Bericht zu exportieren.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warte darauf, dass <strong>${actor}</strong> diesen Bericht exportiert.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf eine*n Admin, um diesen Bericht zu exportieren.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> Spesen bezahlst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf die Zahlung der Spesen durch <strong>${actor}</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass ein Admin Spesen bezahlt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> die Einrichtung eines Geschäftskontos abschließt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> das Geschäftskonto einrichtet.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass ein Admin die Einrichtung eines Geschäftskontos abschließt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `bis ${eta}` : ` ${eta}`;
                }
                return `Warten, bis die Zahlung abgeschlossen ist${formattedETA}.`;
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `Ups! Du scheinst diesen Bericht bei <strong>dir selbst</strong> einzureichen. Das Genehmigen eigener Berichte ist in deinem Workspace <strong>verboten</strong>. Bitte reiche diesen Bericht bei jemand anderem ein oder kontaktiere deine Adminperson, um die Person zu ändern, an die du Berichte einreichst.`,
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'in Kürze',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'später heute',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'am Sonntag',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: 'am 1. und 16. eines jeden Monats',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'am letzten Werktag des Monats',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: 'am letzten Tag des Monats',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: 'am Ende Ihrer Reise',
        },
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Bevorzugte Pronomen',
        selectYourPronouns: 'Wähle deine Pronomen aus',
        selfSelectYourPronoun: 'Wähle dein Pronomen selbst aus',
        emailAddress: 'E-Mail-Adresse',
        setMyTimezoneAutomatically: 'Zeitzone automatisch einstellen',
        timezone: 'Zeitzone',
        invalidFileMessage: 'Ungültige Datei. Bitte versuche ein anderes Bild.',
        avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchronisieren',
        profileAvatar: 'Profil-Avatar',
        publicSection: {
            title: 'Öffentlich',
            subtitle: 'Diese Angaben werden in deinem öffentlichen Profil angezeigt. Jeder kann sie sehen.',
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
        placeholderText: 'Suchen, um Optionen zu sehen',
    },
    contacts: {
        contactMethods: 'Kontaktmethoden',
        featureRequiresValidate: 'Für diese Funktion müssen Sie Ihr Konto verifizieren.',
        validateAccount: 'Bestätige dein Konto',
        helpText: ({email}: {email: string}) =>
            `Füge weitere Möglichkeiten hinzu, dich anzumelden und Belege an Expensify zu senden.<br/><br/>Füge eine E-Mail-Adresse hinzu, um Belege an <a href="mailto:${email}">${email}</a> weiterzuleiten, oder füge eine Telefonnummer hinzu, um Belege per SMS an 47777 zu senden (nur US-Nummern).`,
        pleaseVerify: 'Bitte bestätige diese Kontaktmethode.',
        getInTouch: 'Wir verwenden diese Methode, um Sie zu kontaktieren.',
        enterMagicCode: (contactMethod: string) => `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde. Er sollte innerhalb ein bis zwei Minuten ankommen.`,
        setAsDefault: 'Als Standard festlegen',
        yourDefaultContactMethod:
            'Dies ist Ihre aktuelle Standard-Kontaktmethode. Bevor Sie sie löschen können, müssen Sie eine andere Kontaktmethode auswählen und auf „Als Standard festlegen“ klicken.',
        removeContactMethod: 'Kontaktmethode entfernen',
        removeAreYouSure: 'Möchtest du diese Kontaktmethode wirklich entfernen? Diese Aktion kann nicht rückgängig gemacht werden.',
        failedNewContact: 'Diese Kontaktmethode konnte nicht hinzugefügt werden.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Senden eines neuen magischen Codes fehlgeschlagen. Bitte warte einen Moment und versuche es erneut.',
            validateSecondaryLogin: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            deleteContactMethod: 'Kontaktmethode konnte nicht gelöscht werden. Bitte wende dich an Concierge, um Hilfe zu erhalten.',
            setDefaultContactMethod: 'Fehler beim Festlegen einer neuen Standardkontaktmethode. Bitte wenden Sie sich für Hilfe an Concierge.',
            addContactMethod: 'Diese Kontaktmethode konnte nicht hinzugefügt werden. Bitte wende dich zur Hilfe an Concierge.',
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
        heHimHisTheyThemTheirs: 'Er / Ihn / Sein / Sie / Ihnen / Ihre',
        sheHerHers: 'Sie / Ihr / Ihre',
        sheHerHersTheyThemTheirs: 'Sie / Ihr / Ihre / Sie / Ihnen / Ihre',
        merMers: 'Meilen / Meilen',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Pro Person / Personen',
        theyThemTheirs: 'they / them / theirs',
        thonThons: 'Thon / Thon',
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
        getLocationAutomatically: 'Standort automatisch bestimmen',
    },
    updateRequiredView: {
        updateRequired: 'Aktualisierung erforderlich',
        pleaseInstall: 'Bitte auf die neueste Version von New Expensify aktualisieren',
        pleaseInstallExpensifyClassic: 'Bitte installiere die neueste Version von Expensify',
        toGetLatestChanges: 'Für Mobilgeräte lade die neueste Version herunter und installiere sie. Für das Web aktualisiere deinen Browser.',
        newAppNotAvailable: 'Die New-Expensify-App ist nicht mehr verfügbar.',
    },
    initialSettingsPage: {
        about: 'Info',
        aboutPage: {
            description: 'Die neue Expensify-App wird von einer Community aus Open-Source-Entwickler:innen auf der ganzen Welt entwickelt. Hilf uns, die Zukunft von Expensify zu gestalten.',
            appDownloadLinks: 'App-Download-Links',
            viewKeyboardShortcuts: 'Tastenkürzel anzeigen',
            viewTheCode: 'Code anzeigen',
            viewOpenJobs: 'Offene Jobs anzeigen',
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
            viewConsole: 'Debugkonsole anzeigen',
            debugConsole: 'Debug-Konsole',
            description:
                '<muted-text>Verwende die Tools unten, um Probleme mit Expensify zu beheben. Wenn ein Problem auftritt, kannst du bitte <concierge-link>einen Fehler melden</concierge-link>.</muted-text>',
            confirmResetDescription: 'Alle nicht gesendeten Entwürfe gehen verloren, aber der Rest deiner Daten ist sicher.',
            resetAndRefresh: 'Zurücksetzen und aktualisieren',
            clientSideLogging: 'Clientseitige Protokollierung',
            noLogsToShare: 'Keine Protokolle zum Teilen',
            useProfiling: 'Profiling verwenden',
            profileTrace: 'Profil-Trace',
            results: 'Ergebnisse',
            releaseOptions: 'Freigabeoptionen',
            testingPreferences: 'Testeinstellungen',
            useStagingServer: 'Staging-Server verwenden',
            forceOffline: 'Offline erzwingen',
            simulatePoorConnection: 'Schlechte Internetverbindung simulieren',
            simulateFailingNetworkRequests: 'Fehlgeschlagene Netzwerkanforderungen simulieren',
            authenticationStatus: 'Authentifizierungsstatus',
            deviceCredentials: 'Geräteanmeldedaten',
            invalidate: 'Ungültig machen',
            destroy: 'Löschen',
            maskExportOnyxStateData: 'Fragile Mitgliederdaten beim Exportieren des Onyx-Status maskieren',
            exportOnyxState: 'Onyx-Status exportieren',
            importOnyxState: 'Onyx-Status importieren',
            testCrash: 'Testabsturz',
            resetToOriginalState: 'Auf ursprünglichen Zustand zurücksetzen',
            usingImportedState: 'Sie verwenden importierten Status. Tippen Sie hier, um ihn zu löschen.',
            debugMode: 'Debug-Modus',
            invalidFile: 'Ungültige Datei',
            invalidFileDescription: 'Die Datei, die Sie zu importieren versuchen, ist ungültig. Bitte versuchen Sie es erneut.',
            invalidateWithDelay: 'Mit Verzögerung ungültig machen',
            leftHandNavCache: 'Cache für linke Navigation',
            clearleftHandNavCache: 'Löschen',
            recordTroubleshootData: 'Fehlerdaten aufzeichnen',
            softKillTheApp: 'App sanft beenden',
            kill: 'Beenden',
            sentryDebug: 'Sentry-Debug',
            sentryDebugDescription: 'Sentry-Anfragen in der Konsole protokollieren',
            sentryHighlightedSpanOps: 'Hervorgehobene Spann-Namen',
            sentryHighlightedSpanOpsPlaceholder: 'UI-Interaktion.Klick, Navigation, UI.Laden',
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
        restoreStashed: 'Gespeicherten Login wiederherstellen',
        signOutConfirmationText: 'Alle Offline-Änderungen gehen verloren, wenn du dich abmeldest.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Lies die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und die <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzerklärung</a>.</muted-text-micro>`,
        help: 'Hilfe',
        whatIsNew: 'Neuigkeiten',
        accountSettings: 'Kontoeinstellungen',
        account: 'Konto',
        general: 'Allgemein',
    },
    closeAccountPage: {
        // @context close as a verb, not an adjective
        closeAccount: 'Konto schließen',
        reasonForLeavingPrompt: 'Wir würden es sehr bedauern, wenn du gehst! Würdest du uns bitte sagen, warum, damit wir uns verbessern können?',
        enterMessageHere: 'Nachricht hier eingeben',
        closeAccountWarning: 'Das Schließen Ihres Kontos kann nicht rückgängig gemacht werden.',
        closeAccountPermanentlyDeleteData: 'Möchtest du dein Konto wirklich löschen? Dadurch werden alle ausstehenden Ausgaben dauerhaft gelöscht.',
        enterDefaultContactToConfirm: 'Bitte gib deine Standard-Kontaktmethode ein, um zu bestätigen, dass du dein Konto schließen möchtest. Deine Standard-Kontaktmethode ist:',
        enterDefaultContact: 'Gib deine Standard-Kontaktmethode ein',
        defaultContact: 'Standard-Kontaktmethode:',
        enterYourDefaultContactMethod: 'Bitte geben Sie Ihre Standard-Kontaktmethode ein, um Ihr Konto zu schließen.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Konten zusammenführen',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Gib das Konto ein, das du mit <strong>${login}</strong> zusammenführen möchtest.`,
            notReversibleConsent: 'Ich verstehe, dass dies nicht rückgängig gemacht werden kann',
        },
        accountValidate: {
            confirmMerge: 'Möchtest du Konten wirklich zusammenführen?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `Das Zusammenführen deiner Konten ist unwiderruflich und führt zum Verlust aller noch nicht eingereichten Ausgaben für <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Um fortzufahren, gib bitte den magischen Code ein, der an <strong>${login}</strong> gesendet wurde.`,
            errors: {
                incorrectMagicCode: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
                fallback: 'Etwas ist schiefgelaufen. Bitte versuche es später noch einmal.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konten zusammengeführt!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Du hast alle Daten von <strong>${from}</strong> erfolgreich mit <strong>${to}</strong> zusammengeführt. Zukünftig kannst du für dieses Konto entweder die eine oder die andere Anmeldung verwenden.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Wir arbeiten daran',
            limitedSupport: 'Wir unterstützen das Zusammenführen von Konten in New Expensify noch nicht. Bitte führen Sie diese Aktion stattdessen in Expensify Classic durch.',
            reachOutForHelp: '<muted-text><centered-text>Wende dich gerne an den <concierge-link>Concierge</concierge-link>, wenn du Fragen hast!</centered-text></muted-text>',
            goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Du kannst <strong>${email}</strong> nicht zusammenführen, weil es von <strong>${email.split('@').at(1) ?? ''}</strong> verwaltet wird. Bitte <concierge-link>wende dich an Concierge</concierge-link> für Unterstützung.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Du kannst <strong>${email}</strong> nicht mit anderen Konten zusammenführen, weil deine Domain-Administration es als deine primäre Anmeldung festgelegt hat. Bitte führe stattdessen andere Konten mit diesem Konto zusammen.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Du kannst Konten nicht zusammenführen, weil für <strong>${email}</strong> die Zwei-Faktor-Authentifizierung (2FA) aktiviert ist. Deaktiviere bitte 2FA für <strong>${email}</strong> und versuche es erneut.</centered-text></muted-text>`,
            learnMore: 'Erfahre mehr über das Zusammenführen von Konten.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Du kannst <strong>${email}</strong> nicht zusammenführen, weil sie gesperrt ist. Bitte <concierge-link>wende dich für Unterstützung an Concierge</concierge-link>.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Du kannst keine Konten zusammenführen, weil <strong>${email}</strong> kein Expensify-Konto hat. Bitte <a href="${contactMethodLink}">füge sie stattdessen als Kontaktmethode hinzu</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Sie können <strong>${email}</strong> nicht mit anderen Konten zusammenführen. Bitte führen Sie stattdessen andere Konten mit diesem zusammen.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Konten können nicht mit dem Konto <strong>${email}</strong> zusammengeführt werden, da dieses Konto eine abgerechnete Abonnementbeziehung besitzt.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Versuche es später noch einmal',
            description: 'Es gab zu viele Versuche, Konten zusammenzuführen. Bitte versuche es später erneut.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Du kannst nicht mit anderen Konten zusammenführen, weil dieses Konto nicht verifiziert ist. Bitte verifiziere das Konto und versuche es erneut.',
        },
        mergeFailureSelfMerge: {
            description: 'Du kannst ein Konto nicht mit sich selbst zusammenführen.',
        },
        mergeFailureGenericHeading: 'Konten können nicht zusammengeführt werden',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Verdächtige Aktivität melden',
        lockAccount: 'Konto sperren',
        unlockAccount: 'Konto entsperren',
        compromisedDescription:
            'Ist Ihnen etwas Ungewöhnliches bei Ihrem Konto aufgefallen? Wenn Sie es melden, wird Ihr Konto sofort gesperrt, neue Expensify Card-Transaktionen werden blockiert und alle Kontoänderungen verhindert.',
        domainAdminsDescription: 'Für Domain-Admins: Dadurch werden auch alle Expensify-Kartenaktivitäten und Admin-Aktionen in deiner/deinen Domain(s) pausiert.',
        areYouSure: 'Möchten Sie Ihr Expensify-Konto wirklich sperren?',
        onceLocked: 'Sobald gesperrt, wird dein Konto eingeschränkt, bis eine Entsperranfrage gestellt und eine Sicherheitsprüfung durchgeführt wurde',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Konto konnte nicht gesperrt werden',
        failedToLockAccountDescription: `Wir konnten Ihr Konto nicht sperren. Bitte chatten Sie mit Concierge, um dieses Problem zu beheben.`,
        chatWithConcierge: 'Mit Concierge chatten',
    },
    unlockAccountPage: {
        accountLocked: 'Konto gesperrt',
        yourAccountIsLocked: 'Dein Konto ist gesperrt',
        chatToConciergeToUnlock: 'Chatte mit Concierge, um Sicherheitsbedenken zu klären und dein Konto wieder zu entsperren.',
        chatWithConcierge: 'Mit Concierge chatten',
    },
    twoFactorAuth: {
        headerTitle: 'Zwei-Faktor-Authentifizierung',
        twoFactorAuthEnabled: 'Zwei-Faktor-Authentifizierung aktiviert',
        whatIsTwoFactorAuth:
            'Die Zwei-Faktor-Authentifizierung (2FA) hilft dabei, dein Konto sicher zu halten. Beim Anmelden musst du einen Code eingeben, der von deiner bevorzugten Authentifizierungs-App generiert wird.',
        disableTwoFactorAuth: 'Zwei-Faktor-Authentifizierung deaktivieren',
        explainProcessToRemove: 'Um die Zwei-Faktor-Authentifizierung (2FA) zu deaktivieren, gib bitte einen gültigen Code aus deiner Authentifizierungs-App ein.',
        explainProcessToRemoveWithRecovery: 'Um die Zwei-Faktor-Authentifizierung (2FA) zu deaktivieren, gib bitte einen gültigen Wiederherstellungscode ein.',
        disabled: 'Zwei-Faktor-Authentifizierung ist jetzt deaktiviert',
        noAuthenticatorApp: 'Sie benötigen keine Authentifizierungs-App mehr, um sich bei Expensify anzumelden.',
        stepCodes: 'Wiederherstellungscodes',
        keepCodesSafe: 'Bewahre diese Wiederherstellungscodes sicher auf!',
        codesLoseAccess: dedent(`
            Wenn du den Zugriff auf deine Authentifizierungs-App verlierst und diese Codes nicht hast, verlierst du den Zugriff auf dein Konto.

            Hinweis: Das Einrichten der Zwei-Faktor-Authentifizierung meldet dich von allen anderen aktiven Sitzungen ab.
        `),
        errorStepCodes: 'Bitte kopieren oder laden Sie die Codes herunter, bevor Sie fortfahren',
        stepVerify: 'Bestätigen',
        scanCode: 'Scannen Sie den QR-Code mit Ihrem',
        authenticatorApp: 'Authentifizierungs-App',
        addKey: 'Oder füge diesen geheimen Schlüssel zu deiner Authenticator-App hinzu:',
        enterCode: 'Gib dann den sechsstelligen Code ein, der von deiner Authenticator-App generiert wurde.',
        stepSuccess: 'Abgeschlossen',
        enabled: 'Zwei-Faktor-Authentifizierung aktiviert',
        congrats: 'Glückwunsch! Jetzt hast du diese zusätzliche Sicherheit.',
        copy: 'Kopieren',
        disable: 'Deaktivieren',
        enableTwoFactorAuth: 'Zwei-Faktor-Authentifizierung aktivieren',
        pleaseEnableTwoFactorAuth: 'Bitte aktiviere die Zwei-Faktor-Authentifizierung.',
        twoFactorAuthIsRequiredDescription: 'Aus Sicherheitsgründen verlangt Xero eine Zwei-Faktor-Authentifizierung, um die Integration zu verbinden.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Zwei-Faktor-Authentifizierung erforderlich',
        twoFactorAuthIsRequiredForAdminsTitle: 'Bitte aktivieren Sie die Zwei-Faktor-Authentifizierung',
        twoFactorAuthIsRequiredXero: 'Ihre Xero-Buchhaltungsverbindung erfordert eine Zwei-Faktor-Authentifizierung.',
        twoFactorAuthIsRequiredCompany: 'Ihr Unternehmen erfordert eine Zwei-Faktor-Authentifizierung.',
        twoFactorAuthCannotDisable: '2FA kann nicht deaktiviert werden',
        twoFactorAuthRequired: 'Für Ihre Xero-Verbindung ist die Zwei-Faktor-Authentifizierung (2FA) erforderlich und kann nicht deaktiviert werden.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Bitte gib deinen Wiederherstellungscode ein',
            incorrectRecoveryCode: 'Falscher Wiederherstellungscode. Bitte versuche es noch einmal.',
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
        personalNoteMessage: 'Notizen zu diesem Chat kannst du hier festhalten. Nur du kannst diese Notizen hinzufügen, bearbeiten oder ansehen.',
        sharedNoteMessage: 'Notizen zu diesem Chat hier festhalten. Expensify-Mitarbeitende und andere Mitglieder mit der Domain team.expensify.com können diese Notizen einsehen.',
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
        paymentCurrencyDescription: 'Wähle eine einheitliche Währung aus, in die alle persönlichen Ausgaben umgerechnet werden sollen',
        note: `Hinweis: Wenn Sie Ihre Zahlungswährung ändern, kann sich dies darauf auswirken, wie viel Sie für Expensify bezahlen. Weitere Details finden Sie auf unserer <a href="${CONST.PRICING}">Preisseite</a>.`,
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
            invalidName: 'Name darf nur Buchstaben enthalten',
            addressZipCode: 'Bitte gib eine gültige Postleitzahl ein',
            debitCardNumber: 'Bitte gib eine gültige Debitkartennummer ein',
            expirationDate: 'Bitte wähle ein gültiges Ablaufdatum aus',
            securityCode: 'Bitte gib einen gültigen Sicherheitscode ein',
            addressStreet: 'Bitte gib eine gültige Rechnungsadresse ein, die kein Postfach ist',
            addressState: 'Bitte wählen Sie einen Bundesstaat aus',
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
            invalidName: 'Name darf nur Buchstaben enthalten',
            addressZipCode: 'Bitte gib eine gültige Postleitzahl ein',
            paymentCardNumber: 'Bitte gib eine gültige Kartennummer ein',
            expirationDate: 'Bitte wähle ein gültiges Ablaufdatum aus',
            securityCode: 'Bitte gib einen gültigen Sicherheitscode ein',
            addressStreet: 'Bitte gib eine gültige Rechnungsadresse ein, die kein Postfach ist',
            addressState: 'Bitte wählen Sie einen Bundesstaat aus',
            addressCity: 'Bitte eine Stadt eingeben',
            genericFailureMessage: 'Beim Hinzufügen Ihrer Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            password: 'Bitte gib dein Expensify-Passwort ein',
        },
    },
    walletPage: {
        balance: 'Kontostand',
        paymentMethodsTitle: 'Zahlungsmethoden',
        setDefaultConfirmation: 'Als Standardzahlungsmethode festlegen',
        setDefaultSuccess: 'Standardzahlungsmethode festgelegt!',
        deleteAccount: 'Konto löschen',
        deleteConfirmation: 'Sind Sie sicher, dass Sie dieses Konto löschen möchten?',
        error: {
            notOwnerOfBankAccount: 'Beim Festlegen dieses Bankkontos als deine Standardzahlungsmethode ist ein Fehler aufgetreten',
            invalidBankAccount: 'Dieses Bankkonto ist vorübergehend gesperrt',
            notOwnerOfFund: 'Beim Festlegen dieser Karte als deine Standard-Zahlungsmethode ist ein Fehler aufgetreten',
            setDefaultFailure: 'Etwas ist schiefgelaufen. Bitte chatte mit Concierge, um weitere Unterstützung zu erhalten.',
        },
        addBankAccountFailure: 'Beim Hinzufügen Ihres Bankkontos ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        getPaidFaster: 'Schneller bezahlt werden',
        addPaymentMethod: 'Füge eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        getPaidBackFaster: 'Schneller zurückgezahlt werden',
        secureAccessToYourMoney: 'Sicherer Zugriff auf Ihr Geld',
        receiveMoney: 'Geld in deiner lokalen Währung erhalten',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Sende und empfange Geld mit Freund:innen. Nur US-Bankkonten.',
        enableWallet: 'Wallet aktivieren',
        addBankAccountToSendAndReceive: 'Füge ein Bankkonto hinzu, um Zahlungen zu senden oder zu empfangen.',
        addDebitOrCreditCard: 'Debit- oder Kreditkarte hinzufügen',
        assignedCards: 'Zugewiesene Karten',
        assignedCardsDescription: 'Das sind Karten, die von einem Arbeitsbereichs-Admin zugewiesen wurden, um die Ausgaben des Unternehmens zu verwalten.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Wir überprüfen Ihre Angaben. Bitte schauen Sie in ein paar Minuten noch einmal vorbei!',
        walletActivationFailed: 'Leider kann deine Wallet derzeit nicht aktiviert werden. Bitte chatte mit Concierge, um weitere Unterstützung zu erhalten.',
        addYourBankAccount: 'Füge dein Bankkonto hinzu',
        addBankAccountBody: 'Verbinden wir Ihr Bankkonto mit Expensify, damit Sie so einfach wie nie zuvor direkt in der App Zahlungen senden und empfangen können.',
        chooseYourBankAccount: 'Wähle dein Bankkonto aus',
        chooseAccountBody: 'Stellen Sie sicher, dass Sie die richtige Option auswählen.',
        confirmYourBankAccount: 'Bestätige dein Bankkonto',
        personalBankAccounts: 'Persönliche Bankkonten',
        businessBankAccounts: 'Geschäftsbankkonten',
        shareBankAccount: 'Bankkonto teilen',
        bankAccountShared: 'Gemeinschaftsbankkonto',
        shareBankAccountTitle: 'Wählen Sie die Admins aus, mit denen dieses Bankkonto geteilt werden soll:',
        shareBankAccountSuccess: 'Bankkonto geteilt!',
        shareBankAccountSuccessDescription: 'Die ausgewählten Admins erhalten eine Bestätigungsnachricht von Concierge.',
        shareBankAccountFailure: 'Beim Versuch, das Bankkonto zu teilen, ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut.',
        shareBankAccountEmptyTitle: 'Keine Admins verfügbar',
        shareBankAccountEmptyDescription: 'Es gibt keine Workspace-Admins, mit denen du dieses Bankkonto teilen kannst.',
        shareBankAccountNoAdminsSelected: 'Bitte wähle vor dem Fortfahren eine*n Admin aus',
        unshareBankAccount: 'Bankkonto-Freigabe aufheben',
        unshareBankAccountDescription:
            'Alle unten aufgeführten Personen haben Zugriff auf dieses Bankkonto. Du kannst den Zugriff jederzeit entfernen. Wir werden alle laufenden Zahlungen trotzdem abschließen.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} verliert den Zugriff auf dieses Geschäftskonto. Wir führen alle laufenden Zahlungen trotzdem aus.`,
        reachOutForHelp: 'Sie wird mit der Expensify Card verwendet. <concierge-link>Kontaktiere Concierge</concierge-link>, wenn du sie nicht mehr teilen möchtest.',
        unshareErrorModalTitle: 'Bankkonto kann nicht freigegeben werden',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: 'Verbleibendes Limit',
        smartLimit: {
            name: 'Smart-Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Sie können bis zu ${formattedLimit} mit dieser Karte ausgeben, und das Limit wird zurückgesetzt, sobald Ihre eingereichten Ausgaben genehmigt wurden.`,
        },
        fixedLimit: {
            name: 'Fester Grenzwert',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Mit dieser Karte kannst du bis zu ${formattedLimit} ausgeben, danach wird sie deaktiviert.`,
        },
        monthlyLimit: {
            name: 'Monatslimit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Sie können mit dieser Karte bis zu ${formattedLimit} pro Monat ausgeben. Das Limit wird am 1. Tag jedes Kalendermonats zurückgesetzt.`,
        },
        virtualCardNumber: 'Nummer der virtuellen Karte',
        travelCardCvv: 'Reisekarten-CVV',
        physicalCardNumber: 'Physische Kartennummer',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Physische Karte bestellen',
        reportFraud: 'Virtuelle Kartenbetrugsfälle melden',
        reportTravelFraud: 'Reisekartenbetrug melden',
        reviewTransaction: 'Transaktion prüfen',
        suspiciousBannerTitle: 'Verdächtige Transaktion',
        suspiciousBannerDescription: 'Wir haben verdächtige Transaktionen auf Ihrer Karte festgestellt. Tippen Sie unten, um sie zu überprüfen.',
        cardLocked: 'Ihre Karte ist vorübergehend gesperrt, während unser Team das Konto Ihres Unternehmens überprüft.',
        cardDetails: {
            cardNumber: 'Nummer der virtuellen Karte',
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
            `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um deine Kartendetails anzuzeigen. Er sollte innerhalb von ein bis zwei Minuten ankommen.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) =>
            `Bitte <a href="${missingDetailsLink}">füge deine persönlichen Daten hinzu</a> und versuche es dann erneut.`,
        unexpectedError: 'Beim Abrufen deiner Expensify-Kartendaten ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        cardFraudAlert: {
            confirmButtonText: 'Ja, das tue ich',
            reportFraudButtonText: 'Nein, das war ich nicht',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `hat die verdächtige Aktivität bereinigt und Karte x${cardLastFour} wieder aktiviert. Alles bereit, um weiter Ausgaben zu erfassen!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `hat die Karte mit der Endziffer ${cardLastFour} deaktiviert`,
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
            }) => `verdächtige Aktivität bei der Karte mit Endziffern ${cardLastFour} festgestellt. Erkennen Sie diese Abbuchung wieder?

${amount} bei ${merchant} – ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Ausgaben',
        workflowDescription: 'Konfiguriere einen Workflow ab dem Zeitpunkt der Ausgabe, einschließlich Genehmigung und Zahlung.',
        submissionFrequency: 'Einreichungen',
        submissionFrequencyDescription: 'Wähle einen benutzerdefinierten Plan für das Einreichen von Ausgaben.',
        submissionFrequencyDateOfMonth: 'Tag des Monats',
        disableApprovalPromptDescription: 'Das Deaktivieren von Genehmigungen löscht alle vorhandenen Genehmigungs-Workflows.',
        addApprovalsTitle: 'Genehmigungen',
        addApprovalButton: 'Genehmigungs-Workflow hinzufügen',
        addApprovalTip: 'Dieser Standard-Workflow gilt für alle Mitglieder, sofern kein spezifischerer Workflow vorhanden ist.',
        approver: 'Genehmigende Person',
        addApprovalsDescription: 'Zusätzliche Genehmigung einholen, bevor eine Zahlung autorisiert wird.',
        makeOrTrackPaymentsTitle: 'Zahlungen',
        makeOrTrackPaymentsDescription:
            'Fügen Sie eine autorisierte zahlende Person für Zahlungen hinzu, die in Expensify erfolgen, oder verfolgen Sie Zahlungen, die anderswo geleistet wurden.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>In diesem Workspace ist ein benutzerdefinierter Genehmigungs-Workflow aktiviert. Um diesen Workflow zu prüfen oder zu ändern, wende dich bitte an deine(n) <account-manager-link>Account Manager</account-manager-link> oder <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Für diesen Workspace ist ein benutzerdefinierter Genehmigungs-Workflow aktiviert. Um diesen Workflow zu überprüfen oder zu ändern, wende dich bitte an <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Wähle aus, wie lange Expensify warten soll, bevor fehlerfreie Ausgaben geteilt werden.',
        },
        frequencyDescription: 'Wählen Sie, wie oft Ausgaben automatisch eingereicht werden sollen, oder stellen Sie auf manuell um',
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
                one: 'St.',
                two: 'nd',
                few: 'rd',
                other: 'Do.',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Erste',
                '2': 'Sekunde',
                '3': 'Dritter',
                '4': 'Vierte',
                '5': 'Fünfte',
                '6': 'Sechste',
                '7': 'Siebte',
                '8': 'Achte',
                '9': 'Neunter',
                '10': 'Zehnte',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Dieses Mitglied gehört bereits zu einem anderen Genehmigungsworkflow. Alle Aktualisierungen hier werden sich auch dort auswirken.',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> genehmigt bereits Berichte an <strong>${name2}</strong>. Bitte wähle eine andere approvierende Person, um einen zirkulären Workflow zu vermeiden.`,
        emptyContent: {
            title: 'Keine Mitglieder zum Anzeigen',
            expensesFromSubtitle: 'Alle Workspace-Mitglieder gehören bereits zu einem vorhandenen Genehmigungsworkflow.',
            approverSubtitle: 'Alle Genehmigenden gehören zu einem bestehenden Workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Die Einreichungshäufigkeit konnte nicht geändert werden. Bitte versuche es erneut oder kontaktiere den Support.',
        monthlyOffsetErrorMessage: 'Die monatliche Häufigkeit konnte nicht geändert werden. Bitte versuche es erneut oder kontaktiere den Support.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Bestätigen',
        header: 'Füge weitere Genehmigende hinzu und bestätige.',
        additionalApprover: 'Zusätzliche Genehmigerin / zusätzlicher Genehmiger',
        submitButton: 'Workflow hinzufügen',
    },
    workflowsEditApprovalsPage: {
        title: 'Freigabeworkflow bearbeiten',
        deleteTitle: 'Genehmigungsablauf löschen',
        deletePrompt: 'Möchtest du diesen Genehmigungs-Workflow wirklich löschen? Alle Mitglieder werden anschließend dem Standard-Workflow folgen.',
    },
    workflowsExpensesFromPage: {
        title: 'Ausgaben ab',
        header: 'Wenn die folgenden Mitglieder Ausgaben einreichen:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Die genehmigende Person konnte nicht geändert werden. Bitte versuche es erneut oder kontaktiere den Support.',
        title: 'Genehmigenden festlegen',
        description: 'Diese Person wird die Ausgaben genehmigen.',
    },
    workflowsApprovalLimitPage: {
        title: 'Genehmigende Person',
        header: '(Optional) Möchten Sie ein Genehmigungslimit hinzufügen?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Füge eine weitere genehmigende Person hinzu, wenn <strong>${approverName}</strong> Genehmigende*r ist und der Bericht den untenstehenden Betrag überschreitet:`
                : 'Füge eine weitere approver:in hinzu, wenn ein Bericht den folgenden Betrag überschreitet:',
        reportAmountLabel: 'Berichtsbetrag',
        additionalApproverLabel: 'Zusätzliche Genehmigerin / zusätzlicher Genehmiger',
        skip: 'Überspringen',
        next: 'Weiter',
        removeLimit: 'Limit entfernen',
        enterAmountError: 'Bitte gib einen gültigen Betrag ein',
        enterApproverError: 'Ein Genehmigender ist erforderlich, wenn du ein Berichtslimit festlegst',
        enterBothError: 'Berichtsbetrag und zusätzliche:n Genehmiger:in eingeben',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `Berichte über ${approvalLimit} werden an ${approverName} weitergeleitet`,
    },
    workflowsPayerPage: {
        title: 'Autorisierte zahlende Person',
        genericErrorMessage: 'Der berechtigte Zahler konnte nicht geändert werden. Bitte versuche es erneut.',
        admins: 'Admins',
        payer: 'Zahler',
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
        description: 'Wir haben Ihre bestehende Karte dauerhaft deaktiviert. Wenn Sie zurückkehren, um Ihre Kartendetails anzusehen, steht Ihnen eine neue virtuelle Karte zur Verfügung.',
        buttonText: 'Verstanden, danke!',
    },
    activateCardPage: {
        activateCard: 'Karte aktivieren',
        pleaseEnterLastFour: 'Bitte gib die letzten vier Ziffern deiner Karte ein.',
        activatePhysicalCard: 'Physische Karte aktivieren',
        error: {
            thatDidNotMatch: 'Das stimmt nicht mit den letzten 4 Ziffern Ihrer Karte überein. Bitte versuchen Sie es erneut.',
            throttled:
                'Du hast die letzten 4 Ziffern deiner Expensify Card zu oft falsch eingegeben. Wenn du sicher bist, dass die Nummern korrekt sind, wende dich bitte an Concierge, um das Problem zu lösen. Andernfalls versuche es später noch einmal.',
        },
    },
    getPhysicalCard: {
        header: 'Physische Karte bestellen',
        nameMessage: 'Gib deinen Vor- und Nachnamen ein, da dieser auf deiner Karte angezeigt wird.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        phoneMessage: 'Gib deine Telefonnummer ein.',
        phoneNumber: 'Telefonnummer',
        address: 'Adresse',
        addressMessage: 'Gib deine Versandadresse ein.',
        streetAddress: 'Straßenadresse',
        city: 'Stadt',
        state: 'Status',
        zipPostcode: 'PLZ/Postleitzahl',
        country: 'Land',
        confirmMessage: 'Bitte bestätige unten deine Angaben.',
        estimatedDeliveryMessage: 'Ihre physische Karte wird in 2–3 Werktagen eintreffen.',
        next: 'Weiter',
        getPhysicalCard: 'Physische Karte bestellen',
        shipCard: 'Karte versenden',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Überweisen${amount ? ` ${amount}` : ''}`,
        instant: 'Sofort (Debitkarte)',
        instantSummary: (rate: string, minAmount: string) => `${rate}% Gebühr (mindestens ${minAmount})`,
        ach: '1–3 Werktage (Bankkonto)',
        achSummary: 'Keine Gebühr',
        whichAccount: 'Welches Konto?',
        fee: 'Gebühr',
        transferSuccess: 'Überweisung erfolgreich!',
        transferDetailBankAccount: 'Dein Geld sollte in den nächsten 1–3 Werktagen eingehen.',
        transferDetailDebitCard: 'Dein Geld sollte sofort ankommen.',
        failedTransfer: 'Ihr Guthaben ist noch nicht vollständig ausgeglichen. Bitte überweise es auf ein Bankkonto.',
        notHereSubTitle: 'Bitte überweise dein Guthaben von der Wallet-Seite.',
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
        subtitle: 'Diese Regeln gelten für deine Ausgaben. Wenn du in einen Workspace einreichst, können die Workspace-Regeln diese gegebenenfalls außer Kraft setzen.',
        findRule: 'Regel finden',
        emptyRules: {title: 'Du hast noch keine Regeln erstellt', subtitle: 'Füge eine Regel hinzu, um Spesenberichte zu automatisieren.'},
        changes: {
            billableUpdate: (value: boolean) => `Ausgabe ${value ? 'verrechenbar' : 'nicht abrechenbar'} aktualisieren`,
            categoryUpdate: (value: string) => `Kategorie auf „${value}“ aktualisieren`,
            commentUpdate: (value: string) => `Beschreibung in „${value}“ ändern`,
            merchantUpdate: (value: string) => `Händler aktualisieren auf „${value}“`,
            reimbursableUpdate: (value: boolean) => `Ausgabe ${value ? 'erstattungsfähig' : 'nicht erstattungsfähig'} aktualisieren`,
            tagUpdate: (value: string) => `Tag auf „${value}“ aktualisieren`,
            taxUpdate: (value: string) => `Steuersatz auf ${value} aktualisieren`,
            billable: (value: boolean) => `ausgabe ${value ? 'verrechenbar' : 'nicht abrechenbar'}`,
            category: (value: string) => `kategorie auf „${value}“`,
            comment: (value: string) => `beschreibung in „${value}“ ändern`,
            merchant: (value: string) => `händler auf „${value}“`,
            reimbursable: (value: boolean) => `ausgabe ${value ? 'erstattungsfähig' : 'nicht erstattungsfähig'}`,
            tag: (value: string) => `tag auf „${value}“`,
            tax: (value: string) => `steuersatz auf ${value}`,
            report: (value: string) => `zu einem Bericht mit dem Namen „${value}“ hinzufügen`,
        },
        newRule: 'Neue Regel',
        addRule: {
            title: 'Regel hinzufügen',
            expenseContains: 'Wenn Ausgabe enthält:',
            applyUpdates: 'Wenden Sie dann diese Aktualisierungen an:',
            merchantHint: 'Gib * ein, um eine Regel zu erstellen, die für alle Händler gilt',
            addToReport: 'Zu einem Bericht mit dem Namen hinzufügen',
            createReport: 'Bericht bei Bedarf erstellen',
            applyToExistingExpenses: 'Auf bestehende passende Ausgaben anwenden',
            confirmError: 'Händler eingeben und mindestens eine Aktualisierung anwenden',
            confirmErrorMerchant: 'Bitte Händler eingeben',
            confirmErrorUpdate: 'Bitte nimm mindestens eine Aktualisierung vor',
            saveRule: 'Regel speichern',
        },
        editRule: {
            title: 'Regel bearbeiten',
        },
        deleteRule: {
            deleteSingle: 'Regel löschen',
            deleteMultiple: 'Regeln löschen',
            deleteSinglePrompt: 'Möchtest du diese Regel wirklich löschen?',
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
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Relevante Funktionsupdates und Expensify-Neuigkeiten erhalten',
        muteAllSounds: 'Alle Expensify-Sounds stummschalten',
    },
    priorityModePage: {
        priorityMode: 'Prioritätsmodus',
        explainerText:
            'Wähle, ob du dich nur auf ungelesene und angeheftete Chats konzentrieren möchtest, oder ob du alles anzeigen willst, wobei die neuesten und angehefteten Chats oben stehen.',
        priorityModes: {
            default: {
                label: 'Neueste',
                description: 'Alle Chats nach neuestem sortiert anzeigen',
            },
            gsd: {
                label: '#Fokus',
                description: 'Nur ungelesene anzeigen, alphabetisch sortiert',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
        generatingPDF: 'PDF erstellen',
        waitForPDF: 'Bitte warten, während wir das PDF erstellen.',
        errorPDF: 'Beim Versuch, Ihr PDF zu erstellen, ist ein Fehler aufgetreten',
        successPDF: 'Dein PDF wurde erstellt! Wenn es nicht automatisch heruntergeladen wurde, verwende die Schaltfläche unten.',
    },
    reportDescriptionPage: {
        roomDescription: 'Zimmerbeschreibung',
        roomDescriptionOptional: 'Raumbeschreibung (optional)',
        explainerText: 'Lege eine benutzerdefinierte Beschreibung für den Raum fest.',
    },
    groupChat: {
        lastMemberTitle: 'Achtung!',
        lastMemberWarning: 'Da du die letzte Person hier bist, wird dieser Chat für alle Mitglieder unzugänglich, wenn du ihn verlässt. Bist du sicher, dass du ihn verlassen möchtest?',
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
        chooseThemeBelowOrSync: 'Wähle unten ein Design aus oder synchronisiere mit den Einstellungen deines Geräts.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Durch die Anmeldung stimmst du den <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und der <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzerklärung</a> zu.</muted-text-xs>`,
        license: `<muted-text-xs>Die Übermittlung von Geldmitteln erfolgt durch ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS-ID:2017010) gemäß dessen <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">Lizenzen</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Keinen Magic Code erhalten?',
        enterAuthenticatorCode: 'Bitte gib deinen Authentifikatorcode ein',
        enterRecoveryCode: 'Bitte gib deinen Wiederherstellungscode ein',
        requiredWhen2FAEnabled: 'Erforderlich, wenn 2FA aktiviert ist',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Fordere in <a>${timeRemaining}</a> einen neuen Code an`,
        requestNewCodeAfterErrorOccurred: 'Neuen Code anfordern',
        error: {
            pleaseFillMagicCode: 'Bitte gib deinen magischen Code ein',
            incorrectMagicCode: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            pleaseFillTwoFactorAuth: 'Bitte gib deinen Zwei-Faktor-Authentifizierungscode ein',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Bitte alle Felder ausfüllen',
        pleaseFillPassword: 'Bitte gib dein Passwort ein',
        pleaseFillTwoFactorAuth: 'Bitte gib deinen Zwei-Faktor-Code ein',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Gib deinen Zwei-Faktor-Authentifizierungscode ein, um fortzufahren',
        forgot: 'Vergessen?',
        requiredWhen2FAEnabled: 'Erforderlich, wenn 2FA aktiviert ist',
        error: {
            incorrectPassword: 'Falsches Passwort. Bitte versuche es erneut.',
            incorrectLoginOrPassword: 'Falscher Benutzername oder falsches Passwort. Bitte versuche es erneut.',
            incorrect2fa: 'Falscher Zwei-Faktor-Authentifizierungscode. Bitte versuche es erneut.',
            twoFactorAuthenticationEnabled: 'Du hast 2FA für dieses Konto aktiviert. Bitte melde dich mit deiner E-Mail-Adresse oder Telefonnummer an.',
            invalidLoginOrPassword: 'Ungültiger Login oder Passwort. Bitte versuche es erneut oder setze dein Passwort zurück.',
            unableToResetPassword:
                'Wir konnten Ihr Passwort nicht ändern. Das liegt vermutlich an einem abgelaufenen Link zum Zurücksetzen des Passworts in einer älteren E-Mail. Wir haben Ihnen einen neuen Link geschickt, damit Sie es erneut versuchen können. Prüfen Sie Ihren Posteingang und Ihren Spam-Ordner; die E-Mail sollte in wenigen Minuten ankommen.',
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
        cannotGetAccountDetails: 'Kontodetails konnten nicht abgerufen werden. Bitte versuchen Sie, sich erneut anzumelden.',
        loginForm: 'Anmeldeformular',
        notYou: ({user}: NotYouParams) => `Nicht ${user}?`,
    },
    onboarding: {
        welcome: 'Willkommen!',
        welcomeSignOffTitleManageTeam: 'Sobald du die Aufgaben oben abgeschlossen hast, können wir weitere Funktionen wie Genehmigungs-Workflows und Regeln erkunden!',
        welcomeSignOffTitle: 'Es ist schön, dich kennenzulernen!',
        explanationModal: {
            title: 'Willkommen bei Expensify',
            description:
                'Eine App, um deine geschäftlichen und privaten Ausgaben mit der Geschwindigkeit eines Chats zu verwalten. Probier sie aus und sag uns, was du denkst. Da kommt noch viel mehr!',
            secondaryDescription: 'Um zurück zu Expensify Classic zu wechseln, tippe einfach auf dein Profilbild > Gehe zu Expensify Classic.',
        },
        getStarted: 'Loslegen',
        whatsYourName: 'Wie heißt du?',
        peopleYouMayKnow: 'Menschen, die du vielleicht kennst, sind schon hier! Bestätige deine E-Mail-Adresse, um mitzumachen.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `Jemand von ${domain} hat bereits einen Arbeitsbereich erstellt. Bitte gib den magischen Code ein, der an ${email} gesendet wurde.`,
        joinAWorkspace: 'Einem Arbeitsbereich beitreten',
        listOfWorkspaces: 'Hier ist die Liste der Arbeitsbereiche, denen du beitreten kannst. Keine Sorge, du kannst jederzeit später beitreten, wenn du möchtest.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} Mitglied${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Wo arbeitest du?',
        errorSelection: 'Wähle eine Option, um fortzufahren',
        purpose: {
            title: 'Was möchtest du heute machen?',
            errorContinue: 'Bitte wähle „Weiter“, um die Einrichtung abzuschließen',
            errorBackButton: 'Bitte beende die Einrichtungsfragen, um die App zu nutzen',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Von meinem Arbeitgeber erstatten lassen',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Spesen meines Teams verwalten',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Ausgaben verfolgen und budgetieren',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Mit Freund:innen chatten und Ausgaben teilen',
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
            addWorkEmail: 'Geschäftliche E-Mail hinzufügen',
        },
        workEmailValidation: {
            title: 'Bestätige deine Arbeits-E-Mail-Adresse',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Bitte gib den magischen Code ein, der an ${workEmail} gesendet wurde. Er sollte in ein bis zwei Minuten ankommen.`,
        },
        workEmailValidationError: {
            publicEmail: 'Bitte gib eine gültige geschäftliche E-Mail-Adresse von einer eigenen Domain ein, z. B. mitch@company.com',
            offline: 'Wir konnten deine geschäftliche E-Mail nicht hinzufügen, da du offenbar offline bist',
        },
        mergeBlockScreen: {
            title: 'Arbeits-E-Mail konnte nicht hinzugefügt werden',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Wir konnten ${workEmail} nicht hinzufügen. Bitte versuche es später erneut in den Einstellungen oder chatte mit Concierge, um Unterstützung zu erhalten.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Mach eine [Probefahrt](${testDriveURL})`,
                description: ({testDriveURL}) => `[Machen Sie eine kurze Produkttour](${testDriveURL}), um zu sehen, warum Expensify der schnellste Weg ist, Ihre Spesen abzurechnen.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Mach eine [Probefahrt](${testDriveURL})`,
                description: ({testDriveURL}) => `Machen Sie mit uns eine [Probefahrt](${testDriveURL}) und sichern Sie sich für Ihr Team *3 kostenlose Monate Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Ausgabengenehmigungen hinzufügen',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Füge Spesengenehmigungen hinzu*, um die Ausgaben deines Teams zu überprüfen und unter Kontrolle zu halten.

                        So geht’s:

                        1. Gehe zu *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Weitere Funktionen*.
                        4. Aktiviere *Workflows*.
                        5. Navigiere zu *Workflows* im Workspace-Editor.
                        6. Aktiviere *Genehmigungen hinzufügen*.
                        7. Du wirst als Spesengenehmiger:in festgelegt. Du kannst dies auf eine:n beliebige:n Admin ändern, sobald du dein Team einlädst.

                        [Zu den weiteren Funktionen](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Erstelle](${workspaceConfirmationLink}) einen Arbeitsbereich`,
                description: 'Erstelle einen Workspace und konfiguriere die Einstellungen mit Hilfe deiner Setup-Spezialistin/deines Setup-Spezialisten!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Erstelle einen [Workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Erstelle einen Workspace*, um Ausgaben zu verfolgen, Belege zu scannen, zu chatten und mehr.

                        1. Klicke auf *Workspaces* > *Neuer Workspace*.

                        *Dein neuer Workspace ist fertig!* [Schau ihn dir an](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[Ausgabenkategorien](${workspaceCategoriesLink}) einrichten`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Richten Sie Kategorien ein*, damit Ihr Team Ausgaben für eine einfachere Berichterstattung codieren kann.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *Categories*.
                        4. Deaktivieren Sie alle Kategorien, die Sie nicht benötigen.
                        5. Fügen Sie oben rechts Ihre eigenen Kategorien hinzu.

                        [Zu den Workspace-Kategorieeinstellungen](${workspaceCategoriesLink}).

                        ![Kategorien einrichten](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Spesen einreichen',
                description: dedent(`
                    *Reiche eine Ausgabe ein*, indem du einen Betrag eingibst oder einen Beleg scannst.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Ausgabe erstellen*.
                    3. Gib einen Betrag ein oder scanne einen Beleg.
                    4. Füge die E‑Mail-Adresse oder Telefonnummer deiner/deines Vorgesetzten hinzu.
                    5. Klicke auf *Erstellen*.

                    Und schon bist du fertig!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Spesen einreichen',
                description: dedent(`
                    *Reiche eine Ausgabe ein*, indem du einen Betrag eingibst oder einen Beleg scannst.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Ausgabe erstellen*.
                    3. Gib einen Betrag ein oder scanne einen Beleg.
                    4. Bestätige die Details.
                    5. Klicke auf *Erstellen*.

                    Und fertig!
                `),
            },
            trackExpenseTask: {
                title: 'Ausgabe erfassen',
                description: dedent(`
                    *Verfolge eine Ausgabe* in jeder Währung – mit oder ohne Beleg.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Ausgabe erstellen*.
                    3. Gib einen Betrag ein oder scanne einen Beleg.
                    4. Wähle deinen *privaten* Bereich.
                    5. Klicke auf *Erstellen*.

                    Und schon bist du fertig! Ja, so einfach ist das.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Verbinden${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'nach'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'dein' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Verbinden Sie ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'dein' : 'bis'} ${integrationName} für automatische Spesenkodierung und Synchronisation, die den Monatsabschluss zum Kinderspiel macht.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *Accounting*.
                        4. Suchen Sie ${integrationName}.
                        5. Klicken Sie auf *Connect*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? `[Bring mich zur Buchhaltung](${workspaceAccountingLink}).

                        ![Mit ${integrationName} verbinden](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
        : `[Zum Rechnungswesen](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[Unternehmenskarten verbinden](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Verbinde die Karten, die du bereits hast, für den automatischen Transaktionsimport, Belegabgleich und die Abstimmung.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Company cards*.
                        4. Folge den Anweisungen, um deine Karten zu verbinden.

                        [Zu den Firmenkarten](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[your team](${workspaceMembersLink}) einladen`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Lade dein Team ein*, Expensify zu nutzen, damit sie noch heute mit dem Erfassen von Ausgaben beginnen können.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Members* > *Invite member*.
                        4. Gib E‑Mail-Adressen oder Telefonnummern ein.
                        5. Füge bei Bedarf eine individuelle Einladung hinzu!

                        [Zu den Workspace-Mitgliedern](${workspaceMembersLink}).

                        ![Lade dein Team ein](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Richte [Kategorien](${workspaceCategoriesLink}) und [Tags](${workspaceTagsLink}) ein`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Richten Sie Kategorien und Tags ein*, damit Ihr Team Ausgaben für eine einfache Berichterstattung kodieren kann.

                        Importieren Sie sie automatisch, indem Sie [Ihre Buchhaltungssoftware verbinden](${workspaceAccountingLink}), oder richten Sie sie manuell in Ihren [Workspace-Einstellungen](${workspaceCategoriesLink}) ein.`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Richte [Tags](${workspaceTagsLink}) ein`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Verwende Tags, um zusätzliche Ausgabendetails wie Projekte, Kund:innen, Standorte und Abteilungen hinzuzufügen. Wenn du mehrere Tag-Ebenen benötigst, kannst du auf den Control-Tarif upgraden.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *More features*.
                        4. Aktiviere *Tags*.
                        5. Navigiere im Workspace-Editor zu *Tags*.
                        6. Klicke auf *+ Add tag*, um eigene Tags zu erstellen.

                        [Zu More features](${workspaceMoreFeaturesLink}).

                        ![Tags einrichten](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Lade deine[n Steuerberater](${workspaceMembersLink}) ein`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Laden Sie Ihre*n Buchhalter*in ein*, um in Ihrem Workspace zusammenzuarbeiten und Ihre Geschäftsausgaben zu verwalten.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *Members*.
                        4. Klicken Sie auf *Invite member*.
                        5. Geben Sie die E-Mail-Adresse Ihre*r Buchhalter*in ein.

                        [Laden Sie Ihre*n Buchhalter*in jetzt ein](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Chat starten',
                description: dedent(`
                    *Starte einen Chat* mit jeder Person über ihre E‑Mail-Adresse oder Telefonnummer.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Chat starten*.
                    3. Gib eine E‑Mail-Adresse oder Telefonnummer ein.

                    Wenn sie Expensify noch nicht nutzen, werden sie automatisch eingeladen.

                    Jeder Chat wird außerdem in eine E‑Mail oder SMS umgewandelt, auf die sie direkt antworten können.
                `),
            },
            splitExpenseTask: {
                title: 'Ausgabe aufteilen',
                description: dedent(`
                    *Ausgaben aufteilen* mit einer oder mehreren Personen.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Chat starten*.
                    3. Gib E‑Mail-Adressen oder Telefonnummern ein.
                    4. Klicke im Chat auf die graue *+*-Schaltfläche > *Ausgabe aufteilen*.
                    5. Erstelle die Ausgabe, indem du *Manuell*, *Scan* oder *Strecke* auswählst.

                    Du kannst bei Bedarf weitere Details hinzufügen oder es einfach abschicken. So wirst du dein Geld schnell zurückbekommen!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Überprüfen Sie Ihre [Arbeitsbereichseinstellungen](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        So kannst du die Einstellungen deines Arbeitsbereichs überprüfen und aktualisieren:
                        1. Klicke auf „Arbeitsbereiche“.
                        2. Wähle deinen Arbeitsbereich aus.
                        3. Überprüfe und aktualisiere deine Einstellungen.
                        [Zu deinem Arbeitsbereich gehen.](${workspaceSettingsLink})`),
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
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Mach eine [Probefahrt](${testDriveURL})` : 'Mach eine Probefahrt'),
            embeddedDemoIframeTitle: 'Probefahrt',
            employeeFakeReceipt: {
                description: 'Mein Probefahrtbeleg!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Geld zurückzubekommen ist so einfach wie das Senden einer Nachricht. Gehen wir die Grundlagen durch.',
            onboardingPersonalSpendMessage: 'So verfolgen Sie Ihre Ausgaben mit nur wenigen Klicks.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Deine kostenlose Testversion hat gestartet! Lass uns mit der Einrichtung beginnen.
                        👋 Hallo, ich bin deine Expensify-Einrichtungsspezialistin. Ich habe bereits einen Workspace erstellt, um die Belege und Ausgaben deines Teams zu verwalten. Um das Beste aus deiner 30-tägigen kostenlosen Testversion herauszuholen, folge einfach den verbleibenden Einrichtungsschritten unten!
                    `)
                    : dedent(`
                        # Deine kostenlose Testphase hat begonnen! Lass uns mit der Einrichtung starten.
                        👋 Hallo, ich bin deine Expensify-Einrichtungsspezialist*in. Da du jetzt einen Workspace erstellt hast, nutze deine 30-tägige kostenlose Testphase optimal, indem du die folgenden Schritte befolgst!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Lass uns mit deiner Einrichtung beginnen\n👋 Hallo, ich bin deine Expensify-Einrichtungsspezialist:in. Ich habe bereits einen Workspace erstellt, um dir beim Verwalten deiner Belege und Ausgaben zu helfen. Um das Beste aus deiner 30-tägigen kostenlosen Testversion herauszuholen, folge einfach den restlichen Einrichtungsschritten unten!',
            onboardingChatSplitMessage: 'Rechnungen mit Freund*innen zu teilen ist so einfach wie eine Nachricht zu senden. So geht’s.',
            onboardingAdminMessage: 'Erfahre, wie du als Admin den Workspace deines Teams verwaltest und deine eigenen Ausgaben einreichst.',
            onboardingLookingAroundMessage:
                'Expensify ist vor allem für Spesen-, Reise- und Firmenkartenverwaltung bekannt, aber wir können noch viel mehr. Sag mir, was dich interessiert, und ich helfe dir beim Einstieg.',
            onboardingTestDriveReceiverMessage: '*Du erhältst 3 Monate kostenlos! Lege unten los.*',
        },
        workspace: {
            title: 'Bleib mit einem Arbeitsbereich organisiert',
            subtitle: 'Schalte leistungsstarke Tools frei, um dein Ausgabenmanagement an einem zentralen Ort zu vereinfachen. Mit einem Workspace kannst du:',
            explanationModal: {
                descriptionOne: 'Belege erfassen und organisieren',
                descriptionTwo: 'Ausgaben kategorisieren und taggen',
                descriptionThree: 'Berichte erstellen und teilen',
            },
            price: 'Teste es 30 Tage kostenlos und upgrade dann für nur <strong>5 $/Nutzer/Monat</strong>.',
            createWorkspace: 'Workspace erstellen',
        },
        confirmWorkspace: {
            title: 'Workspace bestätigen',
            subtitle:
                'Erstelle einen Arbeitsbereich, um Belege zu erfassen, Auslagen zu erstatten, Reisen zu verwalten, Berichte zu erstellen und mehr – alles mit der Geschwindigkeit eines Chats.',
        },
        inviteMembers: {
            title: 'Mitglieder einladen',
            subtitle: 'Füge dein Team hinzu oder lade deine Buchhalterin bzw. deinen Buchhalter ein. Je mehr, desto besser!',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Nicht noch einmal anzeigen',
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: 'Name darf keine Sonderzeichen enthalten',
            containsReservedWord: 'Der Name darf die Wörter Expensify oder Concierge nicht enthalten',
            hasInvalidCharacter: 'Der Name darf kein Komma oder Semikolon enthalten',
            requiredFirstName: 'Der Vorname darf nicht leer sein',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Wie lautet dein gesetzlicher Name?',
        enterDateOfBirth: 'Wie ist Ihr Geburtsdatum?',
        enterAddress: 'Wie lautet deine Adresse?',
        enterPhoneNumber: 'Wie lautet deine Telefonnummer?',
        personalDetails: 'Persönliche Angaben',
        privateDataMessage: 'Diese Angaben werden für Reisen und Zahlungen verwendet. Sie werden niemals in deinem öffentlichen Profil angezeigt.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        address: 'Adresse',
        error: {
            dateShouldBeBefore: (dateString: string) => `Datum muss vor ${dateString} liegen`,
            dateShouldBeAfter: (dateString: string) => `Datum muss nach ${dateString} liegen`,
            hasInvalidCharacter: 'Name darf nur lateinische Buchstaben enthalten',
            incorrectZipFormat: (zipFormat?: string) => `Ungültiges Postleitzahlformat${zipFormat ? `Zulässiges Format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Bitte stelle sicher, dass die Telefonnummer gültig ist (z. B. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link wurde erneut gesendet',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `Ich habe einen magischen Anmelde-Link an ${login} gesendet. Bitte überprüfe dein ${loginType}, um dich anzumelden.`,
        resendLink: 'Link erneut senden',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Um ${secondaryLogin} zu verifizieren, sende den Magic Code bitte erneut aus den Kontoeinstellungen von ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Wenn du keinen Zugriff mehr auf ${primaryLogin} hast, entferne bitte die Verknüpfung deiner Konten.`,
        unlink: 'Verknüpfung aufheben',
        linkSent: 'Link gesendet!',
        successfullyUnlinkedLogin: 'Sekundäres Login erfolgreich getrennt!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Unser E-Mail-Anbieter hat E-Mails an ${login} aufgrund von Zustellungsproblemen vorübergehend ausgesetzt. Um dein Login zu entsperren, befolge bitte diese Schritte:`,
        confirmThat: (login: string) =>
            `<strong>Bestätige, dass ${login} richtig geschrieben ist und eine echte, zustellbare E-Mail-Adresse ist.</strong> E-Mail-Aliasse wie „expenses@domain.com“ müssen Zugriff auf ihr eigenes E-Mail-Postfach haben, damit sie ein gültiger Expensify-Login sind.`,
        ensureYourEmailClient: `<strong>Stelle sicher, dass dein E-Mail-Client E-Mails von expensify.com zulässt.</strong> Anleitungen zur Durchführung dieses Schritts findest du <a href="${CONST.SET_NOTIFICATION_LINK}">hier</a>, eventuell benötigst du jedoch die Hilfe deiner IT-Abteilung, um deine E-Mail-Einstellungen zu konfigurieren.`,
        onceTheAbove: `Sobald die oben genannten Schritte abgeschlossen sind, wenden Sie sich bitte an <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a>, um Ihre Anmeldung zu entsperren.`,
    },
    openAppFailureModal: {
        title: 'Etwas ist schiefgelaufen ...',
        subtitle: `Wir konnten nicht alle deine Daten laden. Wir wurden benachrichtigt und untersuchen das Problem. Wenn es weiterhin besteht, wende dich bitte an`,
        refreshAndTryAgain: 'Aktualisieren und erneut versuchen',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Wir konnten keine SMS-Nachrichten an ${login} zustellen und haben sie daher vorübergehend gesperrt. Bitte versuche, deine Nummer zu bestätigen:`,
        validationSuccess: 'Deine Nummer wurde bestätigt! Klicke unten, um einen neuen Magic-Anmeldecode zu senden.',
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
            return `Bitte hab etwas Geduld! Du musst ${timeText} warten, bevor du erneut versuchst, deine Nummer zu bestätigen.`;
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
        title: 'Willkommen im #Focus-Modus!',
        prompt: (priorityModePageUrl: string) =>
            `Behalte den Überblick, indem du nur ungelesene Chats oder Chats siehst, die deine Aufmerksamkeit benötigen. Keine Sorge, du kannst das jederzeit in den <a href="${priorityModePageUrl}">Einstellungen</a> ändern.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Der Chat, den du suchst, kann nicht gefunden werden.',
        getMeOutOfHere: 'Hol mich hier raus',
        iouReportNotFound: 'Die gesuchten Zahlungsdetails können nicht gefunden werden.',
        notHere: 'Hmm ... es ist nicht hier',
        pageNotFound: 'Ups, diese Seite wurde nicht gefunden',
        noAccess: 'Dieser Chat oder diese Ausgabe wurde möglicherweise gelöscht oder du hast keinen Zugriff darauf.\n\nBei Fragen wende dich bitte an concierge@expensify.com',
        goBackHome: 'Zur Startseite zurückkehren',
        commentYouLookingForCannotBeFound: 'Der Kommentar, den du suchst, kann nicht gefunden werden.',
        goToChatInstead: 'Geh stattdessen zum Chat.',
        contactConcierge: 'Bei Fragen wenden Sie sich bitte an concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ups ... ${isBreakLine ? '\n' : ''}Etwas ist schiefgelaufen`,
        subtitle: 'Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es später noch einmal.',
        wrongTypeSubtitle: 'Diese Suche ist ungültig. Versuch, deine Suchkriterien anzupassen.',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Füge ein Emoji hinzu, damit deine Kolleg:innen und Freund:innen leicht erkennen, was los ist. Optional kannst du auch eine Nachricht hinzufügen!',
        today: 'Heute',
        clearStatus: 'Status zurücksetzen',
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
        clearAfter: 'Löschen nach',
        whenClearStatus: 'Wann sollen wir deinen Status zurücksetzen?',
        vacationDelegate: 'Urlaubsvertretung',
        setVacationDelegate: `Legen Sie eine Urlaubsvertretung fest, die Berichte in Ihrer Abwesenheit in Ihrem Namen genehmigt.`,
        vacationDelegateError: 'Beim Aktualisieren Ihrer Vertretung im Urlaub ist ein Fehler aufgetreten.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `als Urlaubsvertretung für ${nameOrEmail}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `an ${submittedToName} als Urlaubsvertretung für ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Sie legen ${nameOrEmail} als Ihre Urlaubsvertretung fest. Diese Person ist noch nicht in all Ihren Arbeitsbereichen. Wenn Sie fortfahren, wird eine E-Mail an alle Admins Ihrer Arbeitsbereiche gesendet, damit sie hinzugefügt wird.`,
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
        confirmBankInfo: 'Bankdaten bestätigen',
        manuallyAdd: 'Füge dein Bankkonto manuell hinzu',
        letsDoubleCheck: 'Lass uns noch einmal prüfen, ob alles richtig aussieht.',
        accountEnding: 'Konto endet auf',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in Ihrem Workspace verwendet',
        accountNumber: 'Kontonummer',
        routingNumber: 'Routing-Nummer',
        chooseAnAccountBelow: 'Wähle unten ein Konto aus',
        addBankAccount: 'Bankkonto hinzufügen',
        chooseAnAccount: 'Wähle ein Konto',
        connectOnlineWithPlaid: 'Melde dich bei deiner Bank an',
        connectManually: 'Manuell verbinden',
        desktopConnection:
            'Hinweis: Um eine Verbindung mit Chase, Wells Fargo, Capital One oder Bank of America herzustellen, klicke bitte hier, um diesen Vorgang in einem Browser abzuschließen.',
        yourDataIsSecure: 'Ihre Daten sind sicher',
        toGetStarted: 'Füge ein Bankkonto hinzu, um Ausgaben zu erstatten, Expensify Cards auszugeben, Rechnungzahlungen zu empfangen und Rechnungen bequem an einem Ort zu bezahlen.',
        plaidBodyCopy: 'Geben Sie Ihren Mitarbeitenden eine einfachere Möglichkeit, Unternehmensausgaben zu bezahlen – und erstattet zu bekommen.',
        checkHelpLine: 'Ihre Bankleitzahl und Kontonummer finden Sie auf einem Scheck für das Konto.',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Um ein Bankkonto zu verknüpfen, bitte <a href="${contactMethodRoute}">füge eine E-Mail-Adresse als deinen primären Login hinzu</a> und versuche es erneut. Du kannst deine Telefonnummer als sekundären Login hinzufügen.`,
        hasBeenThrottledError: 'Beim Hinzufügen deines Bankkontos ist ein Fehler aufgetreten. Bitte warte ein paar Minuten und versuche es dann erneut.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Ups! Es scheint, dass die Währung deines Arbeitsbereichs auf eine andere Währung als USD eingestellt ist. Um fortzufahren, gehe bitte zu <a href="${workspaceRoute}">deinen Arbeitsbereichseinstellungen</a>, stelle sie auf USD ein und versuche es erneut.`,
        bbaAdded: 'Geschäftskonto hinzugefügt!',
        bbaAddedDescription: 'Es ist bereit, für Zahlungen verwendet zu werden.',
        error: {
            youNeedToSelectAnOption: 'Bitte wählen Sie eine Option, um fortzufahren',
            noBankAccountAvailable: 'Es tut uns leid, es ist kein Bankkonto verfügbar',
            noBankAccountSelected: 'Bitte wähle ein Konto aus',
            taxID: 'Bitte eine gültige Steuernummer eingeben',
            website: 'Bitte eine gültige Website eingeben',
            zipCode: `Bitte gib eine gültige Postleitzahl im folgenden Format ein: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Bitte gib eine gültige Telefonnummer ein',
            email: 'Bitte gib eine gültige E-Mail-Adresse ein',
            companyName: 'Bitte gib einen gültigen Unternehmensnamen ein',
            addressCity: 'Bitte gib eine gültige Stadt ein',
            addressStreet: 'Bitte gib eine gültige Straßenadresse ein',
            addressState: 'Bitte wähle einen gültigen Bundesstaat aus',
            incorporationDateFuture: 'Das Gründungsdatum darf nicht in der Zukunft liegen',
            incorporationState: 'Bitte wähle einen gültigen Bundesstaat aus',
            industryCode: 'Bitte geben Sie einen gültigen Branchenklassifizierungscode mit sechs Ziffern ein',
            restrictedBusiness: 'Bitte bestätigen Sie, dass das Unternehmen nicht auf der Liste der eingeschränkten Unternehmen steht',
            routingNumber: 'Bitte eine gültige Bankleitzahl eingeben',
            accountNumber: 'Bitte gib eine gültige Kontonummer ein',
            routingAndAccountNumberCannotBeSame: 'Bankleitzahl und Kontonummer dürfen nicht übereinstimmen',
            companyType: 'Bitte wähle einen gültigen Unternehmenstyp aus',
            tooManyAttempts:
                'Aufgrund einer hohen Anzahl von Anmeldeversuchen wurde diese Option für 24 Stunden deaktiviert. Bitte versuchen Sie es später erneut oder geben Sie die Daten stattdessen manuell ein.',
            address: 'Bitte gib eine gültige Adresse ein',
            dob: 'Bitte wähle ein gültiges Geburtsdatum aus',
            age: 'Muss über 18 Jahre alt sein',
            ssnLast4: 'Bitte gib die gültigen letzten 4 Ziffern deiner Sozialversicherungsnummer ein',
            firstName: 'Bitte gib einen gültigen Vornamen ein',
            lastName: 'Bitte geben Sie einen gültigen Nachnamen ein',
            noDefaultDepositAccountOrDebitCardAvailable: 'Bitte füge ein Standard-Einzahlungskonto oder eine Debitkarte hinzu',
            validationAmounts: 'Die Validierungsbeträge, die du eingegeben hast, sind falsch. Bitte überprüfe deinen Kontoauszug und versuche es erneut.',
            fullName: 'Bitte gib einen gültigen vollständigen Namen ein',
            ownershipPercentage: 'Bitte gib eine gültige Prozentzahl ein',
            deletePaymentBankAccount:
                'Dieses Bankkonto kann nicht gelöscht werden, weil es für Expensify Card-Zahlungen verwendet wird. Wenn du dieses Konto trotzdem löschen möchtest, wende dich bitte an Concierge.',
            sameDepositAndWithdrawalAccount: 'Das Einzahlungs- und Auszahlungskonto sind identisch.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Wo befindet sich Ihr Bankkonto?',
        accountDetailsStepHeader: 'Wie lauten deine Kontodaten?',
        accountTypeStepHeader: 'Was für ein Konto ist das?',
        bankInformationStepHeader: 'Wie lauten deine Bankdaten?',
        accountHolderInformationStepHeader: 'Wie lauten die Kontoinhaberdaten?',
        howDoWeProtectYourData: 'Wie schützen wir Ihre Daten?',
        currencyHeader: 'Was ist die Währung Ihres Bankkontos?',
        confirmationStepHeader: 'Überprüfe deine Angaben.',
        confirmationStepSubHeader: 'Überprüfe die Daten unten sorgfältig und markiere das Kontrollkästchen mit den Bedingungen zur Bestätigung.',
        toGetStarted: 'Füge ein persönliches Bankkonto hinzu, um Rückerstattungen zu erhalten, Rechnungen zu bezahlen oder das Expensify Wallet zu aktivieren.',
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
            linkText: 'Passwort eingeben',
            afterLinkText: 'um sie anzusehen.',
            formLabel: 'PDF anzeigen',
        },
        attachmentNotFound: 'Anhang nicht gefunden',
        retry: 'Erneut versuchen',
    },
    messages: {
        errorMessageInvalidPhone: `Bitte gib eine gültige Telefonnummer ohne Klammern oder Bindestriche ein. Wenn du außerhalb der USA bist, gib bitte deine Landesvorwahl an (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Ungültige E-Mail',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} ist bereits Mitglied von ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} ist bereits Administrator*in von ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Indem Sie mit der Anfrage zur Aktivierung Ihrer Expensify Wallet fortfahren, bestätigen Sie, dass Sie Folgendes gelesen haben, verstehen und akzeptieren',
        facialScan: 'Onfidos Richtlinie und Freigabeerklärung für Gesichtsscan',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfidos Richtlinie und Freigabe für Gesichtsscans</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Datenschutz</a> und <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Nutzungsbedingungen</a>.</muted-text-micro>`,
        tryAgain: 'Erneut versuchen',
        verifyIdentity: 'Identität verifizieren',
        letsVerifyIdentity: 'Lass uns deine Identität bestätigen',
        butFirst: `Aber zuerst das Langweilige. Lies dir im nächsten Schritt die juristischen Details durch und klicke auf „Akzeptieren“, wenn du bereit bist.`,
        genericError: 'Beim Verarbeiten dieses Schritts ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        cameraPermissionsNotGranted: 'Kamera­zugriff aktivieren',
        cameraRequestMessage: 'Wir benötigen Zugriff auf Ihre Kamera, um die Bankkontoverifizierung abzuschließen. Bitte aktivieren Sie dies über Einstellungen > New Expensify.',
        microphonePermissionsNotGranted: 'Mikrofonzugriff aktivieren',
        microphoneRequestMessage: 'Wir benötigen Zugriff auf dein Mikrofon, um die Bankkontoverifizierung abzuschließen. Bitte aktiviere dies über Einstellungen > New Expensify.',
        originalDocumentNeeded: 'Bitte lade ein Originalfoto deines Ausweises hoch, nicht einen Screenshot oder einen Scan.',
        documentNeedsBetterQuality:
            'Ihr Ausweis scheint beschädigt zu sein oder es fehlen Sicherheitsmerkmale. Bitte lade ein Originalbild eines unbeschädigten Ausweises hoch, der vollständig sichtbar ist.',
        imageNeedsBetterQuality: 'Es gibt ein Problem mit der Bildqualität Ihres Ausweises. Bitte laden Sie ein neues Bild hoch, auf dem Ihr gesamter Ausweis deutlich zu sehen ist.',
        selfieIssue: 'Mit deinem Selfie/Video gibt es ein Problem. Bitte lade ein aktuelles Selfie/Video hoch.',
        selfieNotMatching: 'Dein Selfie/Video stimmt nicht mit deinem Ausweis überein. Bitte lade ein neues Selfie/Video hoch, auf dem dein Gesicht klar erkennbar ist.',
        selfieNotLive: 'Dein Selfie/Video scheint kein Live-Foto/-Video zu sein. Bitte lade ein Live-Selfie/-Video hoch.',
    },
    additionalDetailsStep: {
        headerTitle: 'Weitere Details',
        helpText: 'Wir müssen die folgenden Informationen bestätigen, bevor du mit deinem Wallet Geld senden und empfangen kannst.',
        helpTextIdologyQuestions: 'Wir müssen dir nur noch ein paar Fragen stellen, um deine Identität abschließend zu verifizieren.',
        helpLink: 'Erfahre mehr darüber, warum wir das brauchen.',
        legalFirstNameLabel: 'Gesetzlicher Vorname',
        legalMiddleNameLabel: 'Zweiter Vorname laut Ausweis',
        legalLastNameLabel: 'Rechtlicher Nachname',
        selectAnswer: 'Bitte wählen Sie eine Antwort aus, um fortzufahren',
        ssnFull9Error: 'Bitte gib eine gültige neunstellige Sozialversicherungsnummer ein',
        needSSNFull9: 'Wir können Ihre Sozialversicherungsnummer nicht verifizieren. Bitte geben Sie alle neun Ziffern Ihrer Sozialversicherungsnummer ein.',
        weCouldNotVerify: 'Wir konnten nicht verifizieren',
        pleaseFixIt: 'Bitte korrigiere diese Angaben, bevor du fortfährst',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Wir konnten Ihre Identität nicht verifizieren. Bitte versuchen Sie es später erneut oder wenden Sie sich an <a href="mailto:${conciergeEmail}">${conciergeEmail}</a>, wenn Sie Fragen haben.`,
    },
    termsStep: {
        headerTitle: 'Bedingungen und Gebühren',
        headerTitleRefactor: 'Gebühren und Bedingungen',
        haveReadAndAgreePlain: 'Ich habe die Hinweise gelesen und bin mit dem Erhalt elektronischer Mitteilungen einverstanden.',
        haveReadAndAgree: `Ich habe gelesen und stimme zu, <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">elektronische Hinweise</a> zu erhalten.`,
        agreeToThePlain: 'Ich stimme der Datenschutz- und Wallet-Vereinbarung zu.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Ich stimme der <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzerklärung</a> und der <a href="${walletAgreementUrl}">Wallet-Vereinbarung</a> zu.`,
        enablePayments: 'Zahlungen aktivieren',
        monthlyFee: 'Monatliche Gebühr',
        inactivity: 'Inaktivität',
        noOverdraftOrCredit: 'Keine Überziehungs- oder Kreditfunktion.',
        electronicFundsWithdrawal: 'Elektronische Geldabhebung',
        standard: 'Standard',
        reviewTheFees: 'Schau dir einige Gebühren an.',
        checkTheBoxes: 'Bitte kreuze die Kästchen unten an.',
        agreeToTerms: 'Stimme den Bedingungen zu und du bist startklar!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Die Expensify Wallet wird von ${walletProgram} herausgegeben.`,
            perPurchase: 'Pro Einkauf',
            atmWithdrawal: 'Geldautomatabhebung',
            cashReload: 'Baraufladung',
            inNetwork: 'im Netzwerk',
            outOfNetwork: 'außerhalb des Netzwerks',
            atmBalanceInquiry: 'Kontostandabfrage am Geldautomaten (im eigenen oder fremden Netzwerk)',
            customerService: 'Kundenservice (automatisiert oder Live-Agent)',
            inactivityAfterTwelveMonths: 'Inaktivität (nach 12 Monaten ohne Transaktionen)',
            weChargeOneFee: 'Wir berechnen 1 andere Art von Gebühr. Diese ist:',
            fdicInsurance: 'Ihre Gelder sind für eine FDIC-Versicherung berechtigt.',
            generalInfo: `Allgemeine Informationen zu Prepaid-Konten finden Sie unter <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Details und Bedingungen zu allen Gebühren und Dienstleistungen finden Sie unter <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> oder telefonisch unter +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektronische Mittelabbuchung (sofort)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(Mind. ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Eine Liste aller Expensify-Wallet-Gebühren',
            typeOfFeeHeader: 'Alle Gebühren',
            feeAmountHeader: 'Betrag',
            moreDetailsHeader: 'Details',
            openingAccountTitle: 'Kontoeröffnung',
            openingAccountDetails: 'Es fällt keine Gebühr an, um ein Konto zu eröffnen.',
            monthlyFeeDetails: 'Es gibt keine monatliche Gebühr.',
            customerServiceTitle: 'Kundenservice',
            customerServiceDetails: 'Es fallen keine Servicegebühren für Kund:innen an.',
            inactivityDetails: 'Es gibt keine Inaktivitätsgebühr.',
            sendingFundsTitle: 'Geld an eine andere Kontoinhaber*in senden',
            sendingFundsDetails: 'Es fällt keine Gebühr an, wenn du mit deinem Guthaben, Bankkonto oder deiner Debitkarte Geld an eine*n andere*n Kontoinhaber*in sendest.',
            electronicFundsStandardDetails:
                'Für Überweisungen von Ihrem Expensify Wallet auf Ihr Bankkonto über die Standardoption fällt keine Gebühr an. Diese Überweisung wird in der Regel innerhalb von 1–3 Werktagen abgeschlossen.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Für Überweisungen von deinem Expensify-Guthaben auf deine verknüpfte Debitkarte per Sofortüberweisung fällt eine Gebühr an. Diese Überweisung wird in der Regel innerhalb von einigen Minuten abgeschlossen.' +
                `Die Gebühr beträgt ${percentage}% des Überweisungsbetrags (mit einer Mindestgebühr von ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Ihre Gelder sind für eine FDIC-Versicherung berechtigt. Ihre Gelder werden bei ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, einer von der FDIC versicherten Institution, gehalten oder dorthin übertragen.` +
                `Sobald sie dort sind, sind Ihre Gelder im Falle eines Ausfalls von ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} durch die FDIC bis zu ${amount} versichert, sofern bestimmte Anforderungen an die Einlagensicherung erfüllt sind und Ihre Karte registriert ist. Einzelheiten finden Sie unter ${CONST.TERMS.FDIC_PREPAID}.`,
            contactExpensifyPayments: `Kontaktieren Sie ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} telefonisch unter +1 833-400-0904, per E-Mail an ${CONST.EMAIL.CONCIERGE} oder melden Sie sich bei ${CONST.NEW_EXPENSIFY_URL} an.`,
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
        activatedMessage: 'Glückwunsch, dein Wallet ist eingerichtet und bereit für Zahlungen.',
        checkBackLaterTitle: 'Nur eine Minute ...',
        checkBackLaterMessage: 'Wir prüfen Ihre Angaben noch. Bitte versuchen Sie es später erneut.',
        continueToPayment: 'Weiter zur Zahlung',
        continueToTransfer: 'Mit Überweisung fortfahren',
    },
    companyStep: {
        headerTitle: 'Unternehmensinformationen',
        subtitle: 'Fast geschafft! Aus Sicherheitsgründen müssen wir einige Informationen bestätigen:',
        legalBusinessName: 'Rechtlicher Unternehmensname',
        companyWebsite: 'Unternehmenswebsite',
        taxIDNumber: 'Steuernummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        companyType: 'Unternehmenstyp',
        incorporationDate: 'Gründungsdatum',
        incorporationState: 'Bundesstaat der Gründung',
        industryClassificationCode: 'Branchenklassifizierungscode',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der',
        listOfRestrictedBusinesses: 'Liste eingeschränkter Unternehmen',
        incorporationDatePlaceholder: 'Startdatum (jjjj-mm-tt)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Unternehmen',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Kooperative',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Sonstiges',
        },
        industryClassification: 'Unter welcher Branche ist das Unternehmen eingestuft?',
        industryClassificationCodePlaceholder: 'Nach Branchencode suchen',
    },
    requestorStep: {
        headerTitle: 'Persönliche Angaben',
        learnMore: 'Mehr erfahren',
        isMyDataSafe: 'Sind meine Daten sicher?',
    },
    personalInfoStep: {
        personalInfo: 'Persönliche Daten',
        enterYourLegalFirstAndLast: 'Wie lautet dein gesetzlicher Name?',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        legalName: 'Rechtlicher Name',
        enterYourDateOfBirth: 'Wie ist Ihr Geburtsdatum?',
        enterTheLast4: 'Wie lauten die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4SSN: 'Letzte 4 der SSN',
        enterYourAddress: 'Wie lautet deine Adresse?',
        address: 'Adresse',
        letsDoubleCheck: 'Lass uns noch einmal prüfen, ob alles richtig aussieht.',
        byAddingThisBankAccount: 'Durch Hinzufügen dieses Bankkontos bestätigst du, dass du Folgendes gelesen, verstanden und akzeptiert hast:',
        whatsYourLegalName: 'Wie lautet Ihr gesetzlicher Name?',
        whatsYourDOB: 'Wie ist dein Geburtsdatum?',
        whatsYourAddress: 'Wie lautet deine Adresse?',
        whatsYourSSN: 'Wie lauten die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        noPersonalChecks: 'Keine Sorge, hier gibt es keine persönlichen Bonitätsprüfungen!',
        whatsYourPhoneNumber: 'Wie lautet deine Telefonnummer?',
        weNeedThisToVerify: 'Wir benötigen dies, um deine Wallet zu verifizieren.',
    },
    businessInfoStep: {
        businessInfo: 'Firmeninformationen',
        enterTheNameOfYourBusiness: 'Wie heißt dein Unternehmen?',
        businessName: 'Rechtlicher Firmenname',
        enterYourCompanyTaxIdNumber: 'Wie lautet die Steuer-ID Ihres Unternehmens?',
        taxIDNumber: 'Steuernummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        enterYourCompanyWebsite: 'Wie lautet die Website Ihres Unternehmens?',
        companyWebsite: 'Unternehmenswebsite',
        enterYourCompanyPhoneNumber: 'Wie lautet die Telefonnummer Ihres Unternehmens?',
        enterYourCompanyAddress: 'Wie lautet die Adresse Ihres Unternehmens?',
        selectYourCompanyType: 'Welche Art von Unternehmen ist es?',
        companyType: 'Unternehmenstyp',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Unternehmen',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Kooperative',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Sonstiges',
        },
        selectYourCompanyIncorporationDate: 'Wie lautet das Gründungsdatum Ihres Unternehmens?',
        incorporationDate: 'Gründungsdatum',
        incorporationDatePlaceholder: 'Startdatum (jjjj-mm-tt)',
        incorporationState: 'Bundesstaat der Gründung',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In welchem Bundesstaat wurde Ihr Unternehmen gegründet?',
        letsDoubleCheck: 'Lass uns noch einmal prüfen, ob alles richtig aussieht.',
        companyAddress: 'Firmenadresse',
        listOfRestrictedBusinesses: 'Liste eingeschränkter Unternehmen',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der',
        businessInfoTitle: 'Geschäftsinformationen',
        legalBusinessName: 'Rechtlicher Unternehmensname',
        whatsTheBusinessName: 'Wie lautet der Firmenname?',
        whatsTheBusinessAddress: 'Wie lautet die Geschäftsadresse?',
        whatsTheBusinessContactInformation: 'Wie lauten die geschäftlichen Kontaktdaten?',
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
                    return 'Was ist die Business Number (BN)?';
                case CONST.COUNTRY.GB:
                    return 'Wie lautet die Umsatzsteuer-Identifikationsnummer (VRN)?';
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
        whatsYourExpectedAverageReimbursements: 'Wie hoch ist dein erwarteter durchschnittlicher Erstattungsbetrag?',
        registrationNumber: 'Registrierungsnummer',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Employer Identification Number (EIN)';
                case CONST.COUNTRY.CA:
                    return 'BN';
                case CONST.COUNTRY.GB:
                    return 'USt-IdNr.';
                case CONST.COUNTRY.AU:
                    return 'ABN';
                default:
                    return 'EU-Umsatzsteuer';
            }
        },
        businessAddress: 'Geschäftsadresse',
        businessType: 'Unternehmensart',
        incorporation: 'Firmengründung',
        incorporationCountry: 'Gründungsland',
        incorporationTypeName: 'Art der Gesellschaftsform',
        businessCategory: 'Geschäftskategorie',
        annualPaymentVolume: 'Jährliches Zahlungsvolumen',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Jährliches Zahlungsvolumen in ${currencyCode}`,
        averageReimbursementAmount: 'Durchschnittliche Erstattungsbetrag',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Durchschnittlicher Erstattungsbetrag in ${currencyCode}`,
        selectIncorporationType: 'Wählen Sie die Rechtsform aus',
        selectBusinessCategory: 'Geschäftskategorie auswählen',
        selectAnnualPaymentVolume: 'Jährliches Zahlungsvolumen auswählen',
        selectIncorporationCountry: 'Gründungsland auswählen',
        selectIncorporationState: 'Gründungsstaat auswählen',
        selectAverageReimbursement: 'Durchschnittliche Erstattungssumme auswählen',
        selectBusinessType: 'Unternehmenskategorie auswählen',
        findIncorporationType: 'Rechtsform finden',
        findBusinessCategory: 'Geschäftskategorie finden',
        findAnnualPaymentVolume: 'Jährliches Zahlungsvolumen finden',
        findIncorporationState: 'Bundesstaat der Gründung finden',
        findAverageReimbursement: 'Durchschnittliche Erstattungsbeträge finden',
        findBusinessType: 'Unternehmenstyp finden',
        error: {
            registrationNumber: 'Bitte gib eine gültige Registrierungsnummer ein',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Bitte geben Sie eine gültige Arbeitgeber-Identifikationsnummer (EIN) ein';
                    case CONST.COUNTRY.CA:
                        return 'Bitte gib eine gültige Betriebsnummer (BN) ein';
                    case CONST.COUNTRY.GB:
                        return 'Bitte geben Sie eine gültige Umsatzsteuer-Identifikationsnummer (USt-IdNr.) an';
                    case CONST.COUNTRY.AU:
                        return 'Bitte gib eine gültige Australian Business Number (ABN) ein';
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
        regulationRequiresUsToVerifyTheIdentity: 'Vorschriften verlangen, dass wir die Identität aller Personen überprüfen, die mehr als 25 % des Unternehmens besitzen.',
        companyOwner: 'Unternehmensinhaber',
        enterLegalFirstAndLastName: 'Wie lautet der gesetzliche Name des/der Inhaber(s)?',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        enterTheDateOfBirthOfTheOwner: 'Wie lautet das Geburtsdatum des:der Inhaber:in?',
        enterTheLast4: 'Wie lauten die letzten 4 Ziffern der Sozialversicherungsnummer des Inhabers?',
        last4SSN: 'Letzte 4 der SSN',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        enterTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        address: 'Adresse',
        byAddingThisBankAccount: 'Durch Hinzufügen dieses Bankkontos bestätigst du, dass du Folgendes gelesen, verstanden und akzeptiert hast:',
        owners: 'Eigentümer',
    },
    ownershipInfoStep: {
        ownerInfo: 'Eigentümerinfos',
        businessOwner: 'Unternehmensinhaber',
        signerInfo: 'Unterzeichnerinformationen',
        doYouOwn: (companyName: string) => `Besitzen Sie 25 % oder mehr von ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `Besitzen einzelne Personen 25 % oder mehr von ${companyName}?`,
        regulationsRequire: 'Vorschriften verlangen, dass wir die Identität jeder Person überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        whatsTheOwnersName: 'Wie lautet der gesetzliche Name des/der Inhaber(s)?',
        whatsYourName: 'Wie lautet dein gesetzlicher Name?',
        whatPercentage: 'Wie viel Prozent des Unternehmens gehören dem/der Inhaber*in?',
        whatsYoursPercentage: 'Wie viel Prozent des Unternehmens besitzen Sie?',
        ownership: 'Eigentum',
        whatsTheOwnersDOB: 'Wie lautet das Geburtsdatum des:der Inhaber:in?',
        whatsYourDOB: 'Wie ist Ihr Geburtsdatum?',
        whatsTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        whatsYourAddress: 'Wie lautet deine Adresse?',
        whatAreTheLast: 'Wie lauten die letzten 4 Ziffern der Sozialversicherungsnummer des Inhabers?',
        whatsYourLast: 'Wie lauten die letzten 4 Ziffern Ihrer Sozialversicherungsnummer?',
        whatsYourNationality: 'Wie lautet Ihr Staatsangehörigkeitsland?',
        whatsTheOwnersNationality: 'In welchem Land ist der/die Inhaber:in Staatsbürger:in?',
        countryOfCitizenship: 'Staatsangehörigkeit',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4: 'Letzte 4 der SSN',
        whyDoWeAsk: 'Warum fragen wir danach?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        ownershipPercentage: 'Eigentumsanteil',
        areThereOther: (companyName: string) => `Gibt es andere Personen, die 25 % oder mehr von ${companyName} besitzen?`,
        owners: 'Eigentümer',
        addCertified: 'Fügen Sie ein zertifiziertes Organigramm hinzu, das die wirtschaftlich Berechtigten zeigt',
        regulationRequiresChart:
            'Aufgrund gesetzlicher Vorgaben müssen wir eine beglaubigte Kopie des Eigentumsdiagramms einholen, das jede Person oder juristische Einheit ausweist, die 25 % oder mehr des Unternehmens besitzt.',
        uploadEntity: 'Diagram zur Eigentümerstruktur hochladen',
        noteEntity:
            'Hinweis: Das Beteiligungsdiagramm der Gesellschaft muss von Ihrer Steuerberaterin/Ihrem Steuerberater, Ihrer Rechtsberaterin/Ihrem Rechtsberater unterschrieben oder notariell beglaubigt sein.',
        certified: 'Beglaubigtes Eigentumsdiagramm der juristischen Person',
        selectCountry: 'Land auswählen',
        findCountry: 'Land auswählen',
        address: 'Adresse',
        chooseFile: 'Datei auswählen',
        uploadDocuments: 'Zusätzliche Unterlagen hochladen',
        pleaseUpload:
            'Bitte laden Sie unten zusätzliche Unterlagen hoch, damit wir Ihre Identität als direkte*n oder indirekte*n Eigentümer*in von 25 % oder mehr der juristischen Person überprüfen können.',
        acceptedFiles: 'Akzeptierte Dateiformate: PDF, PNG, JPEG. Die Gesamtdateigröße für jeden Abschnitt darf 5 MB nicht überschreiten.',
        proofOfBeneficialOwner: 'Nachweis des wirtschaftlich Berechtigten',
        proofOfBeneficialOwnerDescription:
            'Bitte legen Sie eine unterschriebene Bestätigung und ein Organigramm vor, die von einem Wirtschaftsprüfer, Notar oder Rechtsanwalt ausgestellt wurden und die Eigentumsverhältnisse von 25 % oder mehr am Unternehmen bestätigen. Das Dokument muss innerhalb der letzten drei Monate datiert sein und die Zulassungsnummer der unterzeichnenden Person enthalten.',
        copyOfID: 'Ausweiskopie für wirtschaftlich berechtigte Person',
        copyOfIDDescription: 'Beispiele: Reisepass, Führerschein usw.',
        proofOfAddress: 'Adressnachweis für wirtschaftlich Berechtigten',
        proofOfAddressDescription: 'Beispiele: Nebenkostenrechnung, Mietvertrag usw.',
        codiceFiscale: 'Codice fiscale/Steuer-ID',
        codiceFiscaleDescription:
            'Bitte laden Sie ein Video von einem Vor-Ort-Besuch oder einem aufgezeichneten Gespräch mit der zeichnungsberechtigten Person hoch. Die zeichnungsberechtigte Person muss Folgendes angeben: vollständiger Name, Geburtsdatum, Firmenname, Handelsregisternummer, Steuernummer, eingetragene Anschrift, Unternehmensgegenstand und Verwendungszweck des Kontos.',
    },
    completeVerificationStep: {
        completeVerification: 'Verifizierung abschließen',
        confirmAgreements: 'Bitte bestätigen Sie die folgende Vereinbarungen.',
        certifyTrueAndAccurate: 'Ich bestätige, dass die bereitgestellten Informationen wahr und korrekt sind',
        certifyTrueAndAccurateError: 'Bitte bestätigen Sie, dass die Angaben wahr und korrekt sind',
        isAuthorizedToUseBankAccount: 'Ich bin berechtigt, dieses Geschäftskonto für Geschäftsausgaben zu verwenden',
        isAuthorizedToUseBankAccountError: 'Sie müssen eine vertretungsberechtigte Führungsperson mit Vollmacht zur Führung des Geschäftskontos sein',
        termsAndConditions: 'Geschäftsbedingungen',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Bestätige dein Bankkonto',
        validateButtonText: 'Validieren',
        validationInputLabel: 'Transaktion',
        maxAttemptsReached: 'Die Verifizierung dieses Bankkontos wurde aufgrund zu vieler falscher Versuche deaktiviert.',
        description: `Innerhalb von 1–2 Werktagen senden wir drei (3) kleine Transaktionen auf Ihr Bankkonto von einem Namen wie „Expensify, Inc. Validation“.`,
        descriptionCTA: 'Bitte geben Sie jeden Transaktionsbetrag in die Felder unten ein. Beispiel: 1.51.',
        letsChatText: 'Fast geschafft! Wir brauchen noch kurz deine Hilfe, um ein paar letzte Informationen im Chat zu bestätigen. Bereit?',
        enable2FATitle: 'Betrug verhindern, Zwei-Faktor-Authentifizierung (2FA) aktivieren',
        enable2FAText: 'Wir nehmen Ihre Sicherheit sehr ernst. Bitte richten Sie jetzt 2FA ein, um Ihrem Konto eine zusätzliche Schutzebene hinzuzufügen.',
        secureYourAccount: 'Konto sichern',
    },
    countryStep: {
        confirmBusinessBank: 'Bestätige Währung und Land des Geschäftskontos',
        confirmCurrency: 'Währung und Land bestätigen',
        yourBusiness: 'Die Währung Ihres Geschäftskontos muss mit der Währung Ihres Arbeitsbereichs übereinstimmen.',
        youCanChange: 'Sie können die Währung Ihres Arbeitsbereichs ändern in Ihren',
        findCountry: 'Land auswählen',
        selectCountry: 'Land auswählen',
    },
    bankInfoStep: {
        whatAreYour: 'Wie lauten die Daten Ihres Geschäftskontos?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles in Ordnung ist.',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in Ihrem Workspace verwendet',
        accountNumber: 'Kontonummer',
        accountHolderNameDescription: 'Vollständiger Name der zeichnungsberechtigten Person',
    },
    signerInfoStep: {
        signerInfo: 'Unterzeichnerinformationen',
        areYouDirector: (companyName: string) => `Sind Sie Director bei ${companyName}?`,
        regulationRequiresUs: 'Vorschriften verlangen, dass wir überprüfen, ob die unterzeichnende Person befugt ist, diese Aktion im Namen des Unternehmens vorzunehmen.',
        whatsYourName: 'Wie lautet dein vollständiger, rechtlicher Name?',
        fullName: 'Vollständiger gesetzlicher Name',
        whatsYourJobTitle: 'Wie lautet deine Berufsbezeichnung?',
        jobTitle: 'Berufsbezeichnung',
        whatsYourDOB: 'Wie ist Ihr Geburtsdatum?',
        uploadID: 'Lade Ausweis und Adressnachweis hoch',
        personalAddress: 'Nachweis der Privatadresse (z. B. Nebenkostenabrechnung)',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        proofOf: 'Nachweis der Privatadresse',
        enterOneEmail: (companyName: string) => `Gib die E-Mail-Adresse einer:s Direktors:in bei ${companyName} ein`,
        regulationRequiresOneMoreDirector: 'Regulatorische Vorschriften erfordern mindestens eine weitere Direktorin bzw. einen weiteren Direktor als Unterzeichner.',
        hangTight: 'Bitte warten …',
        enterTwoEmails: (companyName: string) => `Gib die E-Mail-Adressen von zwei Direktoren bei ${companyName} ein`,
        sendReminder: 'Erinnerung senden',
        chooseFile: 'Datei auswählen',
        weAreWaiting: 'Wir warten darauf, dass andere ihre Identität als Unternehmensdirektor:innen verifizieren.',
        id: 'Kopie des Ausweises',
        proofOfDirectors: 'Nachweis des/der Direktors/Direktorin',
        proofOfDirectorsDescription: 'Beispiele: Oncorp-Unternehmensprofil oder Unternehmensregistrierung.',
        codiceFiscale: 'Codice fiscale',
        codiceFiscaleDescription: 'Codice Fiscale für Unterzeichner, Bevollmächtigte und wirtschaftlich Berechtigte.',
        PDSandFSG: 'PDS- und FSG-Offenlegungsunterlagen',
        PDSandFSGDescription: dedent(`
            Unsere Partnerschaft mit Corpay nutzt eine API-Verbindung, um das umfangreiche Netzwerk internationaler Bankpartner von Corpay zu nutzen und globale Erstattungen in Expensify zu ermöglichen. Gemäß den australischen Vorschriften stellen wir Ihnen den Financial Services Guide (FSG) und die Product Disclosure Statement (PDS) von Corpay zur Verfügung.

            Bitte lesen Sie die FSG- und PDS-Dokumente sorgfältig durch, da sie vollständige Details und wichtige Informationen zu den Produkten und Dienstleistungen enthalten, die Corpay anbietet. Bewahren Sie diese Dokumente für zukünftige Referenz auf.
        `),
        pleaseUpload: 'Bitte laden Sie unten zusätzliche Unterlagen hoch, damit wir Ihre Identität als Geschäftsführer:in des Unternehmens überprüfen können.',
        enterSignerInfo: 'Signaturinformationen eingeben',
        thisStep: 'Dieser Schritt wurde abgeschlossen',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `verbindet ein ${currency}-Geschäftsbankkonto mit der Endnummer ${bankAccountLastFour} mit Expensify, um Mitarbeitende in ${currency} zu bezahlen. Der nächste Schritt erfordert Unterzeichnerinformationen von einer Geschäftsführungsperson.`,
        error: {
            emailsMustBeDifferent: 'E-Mail-Adressen müssen unterschiedlich sein',
        },
    },
    agreementsStep: {
        agreements: 'Vereinbarungen',
        pleaseConfirm: 'Bitte bestätigen Sie die untenstehenden Vereinbarungen',
        regulationRequiresUs: 'Vorschriften verlangen, dass wir die Identität aller Personen überprüfen, die mehr als 25 % des Unternehmens besitzen.',
        iAmAuthorized: 'Ich bin berechtigt, das Geschäftskonto für Geschäftsausgaben zu verwenden.',
        iCertify: 'Ich bestätige, dass die bereitgestellten Angaben wahr und korrekt sind.',
        iAcceptTheTermsAndConditions: `Ich akzeptiere die <a href="https://cross-border.corpay.com/tc/">Allgemeinen Geschäftsbedingungen</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Ich akzeptiere die Geschäftsbedingungen.',
        accept: 'Akzeptieren und Bankkonto hinzufügen',
        iConsentToThePrivacyNotice: 'Ich stimme der <a href="https://payments.corpay.com/compliance">Datenschutzerklärung</a> zu.',
        iConsentToThePrivacyNoticeAccessibility: 'Ich stimme der Datenschutzerklärung zu.',
        error: {
            authorized: 'Sie müssen eine vertretungsberechtigte Führungsperson mit Vollmacht zur Führung des Geschäftskontos sein',
            certify: 'Bitte bestätigen Sie, dass die Angaben wahr und korrekt sind',
            consent: 'Bitte stimmen Sie der Datenschutzerklärung zu',
        },
    },
    docusignStep: {
        subheader: 'Docusign-Formular',
        pleaseComplete:
            'Bitte füllen Sie das ACH-Autorisierungsformular über den Docusign-Link unten aus und laden Sie die unterschriebene Kopie anschließend hier hoch, damit wir Beträge direkt von Ihrem Bankkonto einziehen können.',
        pleaseCompleteTheBusinessAccount: 'Bitte füllen Sie den Antrag auf Lastschriftvereinbarung für das Geschäftskonto aus',
        pleaseCompleteTheDirect:
            'Bitte füllen Sie die Lastschriftvereinbarung über den untenstehenden DocuSign-Link aus und laden Sie die unterschriebene Kopie anschließend hier hoch, damit wir Gelder direkt von Ihrem Bankkonto einziehen können.',
        takeMeTo: 'Zu DocuSign wechseln',
        uploadAdditional: 'Zusätzliche Unterlagen hochladen',
        pleaseUpload: 'Bitte laden Sie das DEFT-Formular und die Docusign-Unterschriftsseite hoch',
        pleaseUploadTheDirect: 'Bitte laden Sie die Lastschriftvereinbarungen und die Docusign-Unterschriftsseite hoch',
    },
    finishStep: {
        letsFinish: 'Lass uns im Chat fertigstellen!',
        thanksFor:
            'Vielen Dank für diese Details. Eine zuständige Support-Mitarbeitende Person wird Ihre Angaben nun überprüfen. Wir melden uns wieder, falls wir noch etwas von Ihnen benötigen, aber bis dahin können Sie sich bei Fragen jederzeit an uns wenden.',
        iHaveA: 'Ich habe eine Frage',
        enable2FA: 'Aktiviere die Zwei-Faktor-Authentifizierung (2FA), um Betrug zu verhindern',
        weTake: 'Wir nehmen Ihre Sicherheit sehr ernst. Bitte richten Sie jetzt 2FA ein, um Ihrem Konto eine zusätzliche Schutzebene hinzuzufügen.',
        secure: 'Konto sichern',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Einen Moment',
        explanationLine: 'Wir überprüfen gerade deine Angaben. Du kannst in Kürze mit den nächsten Schritten fortfahren.',
    },
    session: {
        offlineMessageRetry: 'Du scheinst offline zu sein. Bitte überprüfe deine Verbindung und versuche es erneut.',
    },
    travel: {
        header: 'Reise buchen',
        title: 'Reise clever',
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
            header: 'Bevor wir fortfahren ...',
            title: 'Geschäftsbedingungen',
            label: 'Ich stimme den Allgemeinen Geschäftsbedingungen zu',
            subtitle: `Bitte stimme den Expensify Travel-<a href="${CONST.TRAVEL_TERMS_URL}">Geschäftsbedingungen</a> zu.`,
            error: 'Sie müssen den Expensify Travel-Geschäftsbedingungen zustimmen, um fortzufahren',
            defaultWorkspaceError:
                'Sie müssen einen Standard-Arbeitsbereich festlegen, um Expensify Travel zu aktivieren. Gehen Sie zu Einstellungen > Arbeitsbereiche > klicken Sie auf die drei vertikalen Punkte neben einem Arbeitsbereich > Als Standard-Arbeitsbereich festlegen und versuchen Sie es dann erneut!',
        },
        flight: 'Flug',
        flightDetails: {
            passenger: 'Passagier',
            layover: (layover: string) => `<muted-text-label>Sie haben einen <strong>${layover}-Aufenthalt</strong> vor diesem Flug</muted-text-label>`,
            takeOff: 'StartAbflug',
            landing: 'Landung',
            seat: 'Platz',
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
            cancellation: 'Stornierungsrichtlinie',
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
            cancellation: 'Stornierungsrichtlinie',
            cancellationUntil: 'Kostenlose Stornierung bis',
            freeCancellation: 'Kostenlose Stornierung',
            confirmation: 'Bestätigungsnummer',
        },
        train: 'Schiene',
        trainDetails: {
            passenger: 'Passagier',
            departs: 'Abfahrt',
            arrives: 'Kommt an',
            coachNumber: 'Busnummer',
            seat: 'Platz',
            fareDetails: 'Tarifdetails',
            confirmation: 'Bestätigungsnummer',
        },
        viewTrip: 'Reise anzeigen',
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
            `<rbr>Bitte <a href="${phoneErrorMethodsRoute}">fügen Sie eine geschäftliche E-Mail als primäre Anmeldung hinzu</a>, um Reisen zu buchen.</rbr>`,
        domainSelector: {
            title: 'Domain',
            subtitle: 'Wähle eine Domain für die Expensify Travel-Einrichtung aus.',
            recommended: 'Empfohlen',
        },
        domainPermissionInfo: {
            title: 'Domain',
            restriction: (domain: string) =>
                `Du hast keine Berechtigung, Expensify Travel für die Domain <strong>${domain}</strong> zu aktivieren. Bitte bitte stattdessen jemanden aus dieser Domain, Travel zu aktivieren.`,
            accountantInvitation: `Wenn Sie Buchhalter:in sind, sollten Sie dem <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved!-Programm für Buchhalter:innen</a> beitreten, um Reisen für diese Domain zu aktivieren.`,
        },
        publicDomainError: {
            title: 'Loslegen mit Expensify Travel',
            message: `Sie müssen bei Expensify Travel Ihre Arbeits-E-Mail-Adresse (z. B. name@company.com) verwenden, nicht Ihre private E-Mail-Adresse (z. B. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel wurde deaktiviert',
            message: `Ihre*e* Admin hat Expensify Travel deaktiviert. Bitte halten Sie sich für Reisebuchungen an die Reiserichtlinien Ihres Unternehmens.`,
        },
        verifyCompany: {
            title: 'Wir prüfen Ihre Anfrage …',
            message: `Wir führen ein paar Überprüfungen durch, um sicherzustellen, dass dein Konto für Expensify Travel bereit ist. Wir melden uns in Kürze bei dir!`,
            confirmText: 'Verstanden',
            conciergeMessage: ({domain}: {domain: string}) => `Reiseaktivierung für die Domain ${domain} ist fehlgeschlagen. Bitte überprüfe diese Domain und aktiviere Reisen dafür.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde gebucht. Bestätigungsnummer: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Ticket für den Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde annulliert.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Ticket für den Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde erstattet oder umgebucht.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate}} wurde von der Fluggesellschaft storniert.`,
            flightScheduleChangePending: (airlineCode: string) => `Die Fluggesellschaft hat eine Flugplanänderung für den Flug ${airlineCode} vorgeschlagen; wir warten auf die Bestätigung.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Planänderung bestätigt: Flug ${airlineCode} startet jetzt um ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde aktualisiert.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Ihre Beförderungsklasse wurde auf ${cabinClass} im Flug ${airlineCode} aktualisiert.`,
            flightSeatConfirmed: (airlineCode: string) => `Ihre Sitzplatzzuweisung für den Flug ${airlineCode} wurde bestätigt.`,
            flightSeatChanged: (airlineCode: string) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde geändert.`,
            flightSeatCancelled: (airlineCode: string) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde entfernt.`,
            paymentDeclined: 'Die Zahlung für Ihre Flugbuchung ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Du hast deine ${type}-Reservierung ${id} storniert.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Der Anbieter hat deine ${type}-Reservierung ${id} storniert.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Ihre ${type}-Reservierung wurde erneut gebucht. Neue Bestätigung Nr.: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Ihre ${type}-Buchung wurde aktualisiert. Prüfen Sie die neuen Details in der Reiseroute.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Ihr Bahnticket für ${origin} → ${destination} am ${startDate} wurde erstattet. Eine Gutschrift wird veranlasst.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Dein Bahnticket für ${origin} → ${destination} am ${startDate} wurde umgetauscht.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Dein Bahnticket für ${origin} → ${destination} am ${startDate} wurde aktualisiert.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Ihre ${type}-Reservierung wurde aktualisiert.`,
        },
        flightTo: 'Flug nach',
        trainTo: 'Zug nach',
        carRental: 'Mietwagen',
        nightIn: 'Übernachtung in',
        nightsIn: 'Nächte in',
    },
    workspace: {
        common: {
            card: 'Karten',
            expensifyCard: 'Expensify Card',
            companyCards: 'Firmenkarten',
            workflows: 'Workflows',
            workspace: 'Arbeitsbereich',
            findWorkspace: 'Workspace finden',
            edit: 'Workspace bearbeiten',
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
            reportFields: 'Berichts­felder',
            reportTitle: 'Berichtstitel',
            reportField: 'Berichts­feld',
            taxes: 'Steuern',
            bills: 'Rechnungen',
            invoices: 'Rechnungen',
            perDiem: 'Tagegeld',
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
            reconcileCards: 'Karten abgleichen',
            selectAll: 'Alle auswählen',
            selected: () => ({
                one: '1 ausgewählt',
                other: (count: number) => `${count} ausgewählt`,
            }),
            settlementFrequency: 'Auszahlungsfrequenz',
            setAsDefault: 'Als Standard-Arbeitsbereich festlegen',
            defaultNote: `Belege, die an ${CONST.EMAIL.RECEIPTS} gesendet werden, erscheinen in diesem Workspace.`,
            deleteConfirmation: 'Möchten Sie diesen Arbeitsbereich wirklich löschen?',
            deleteWithCardsConfirmation: 'Möchtest du diesen Workspace wirklich löschen? Dadurch werden alle Kartenfeeds und zugewiesenen Karten entfernt.',
            unavailable: 'Arbeitsbereich nicht verfügbar',
            memberNotFound: 'Mitglied nicht gefunden. Um ein neues Mitglied in den Workspace einzuladen, verwende bitte die Einladen-Schaltfläche oben.',
            notAuthorized: `Du hast keinen Zugriff auf diese Seite. Wenn du versuchst, diesem Workspace beizutreten, bitte einfach den Workspace-Inhaber, dich als Mitglied hinzuzufügen. Etwas anderes? Wende dich an ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Zum Workspace',
            duplicateWorkspace: 'Arbeitsbereich duplizieren',
            duplicateWorkspacePrefix: 'Duplizieren',
            goToWorkspaces: 'Zu Arbeitsbereichen',
            clearFilter: 'Filter löschen',
            workspaceName: 'Workspace-Name',
            workspaceOwner: 'Eigentümer',
            workspaceType: 'Workspace-Typ',
            workspaceAvatar: 'Workspace-Avatar',
            mustBeOnlineToViewMembers: 'Du musst online sein, um die Mitglieder dieses Arbeitsbereichs zu sehen.',
            moreFeatures: 'Mehr Funktionen',
            requested: 'Angefordert',
            distanceRates: 'Entfernungssätze',
            defaultDescription: 'Ein Ort für all deine Belege und Ausgaben.',
            descriptionHint: 'Information über diesen Workspace mit allen Mitgliedern teilen.',
            welcomeNote: 'Bitte nutze Expensify, um deine Belege zur Erstattung einzureichen, danke!',
            subscription: 'Abonnement',
            markAsEntered: 'Als manuell erfasst markieren',
            markAsExported: 'Als exportiert markieren',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exportieren nach ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Lass uns noch einmal prüfen, ob alles richtig aussieht.',
            lineItemLevel: 'Positionsebene',
            reportLevel: 'Berichtsebene',
            topLevel: 'Oberste Ebene',
            appliedOnExport: 'Nicht in Expensify importiert, beim Export angewendet',
            shareNote: {
                header: 'Teile deinen Workspace mit anderen Mitgliedern',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Teile diesen QR-Code oder kopiere den Link unten, damit Mitglieder ganz einfach Zugang zu deinem Workspace anfordern können. Alle Anfragen zum Beitritt zum Workspace werden zur Überprüfung im Raum <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> angezeigt.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Verbinden mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Neue Verbindung erstellen',
            reuseExistingConnection: 'Vorhandene Verbindung wiederverwenden',
            existingConnections: 'Bestehende Verbindungen',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Da du zuvor bereits eine Verbindung zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} hergestellt hast, kannst du eine bestehende Verbindung wiederverwenden oder eine neue erstellen.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} – Zuletzt synchronisiert am ${formattedDate}`,
            authenticationError: (connectionName: string) => `Verbindung mit ${connectionName} aufgrund eines Authentifizierungsfehlers nicht möglich.`,
            learnMore: 'Mehr erfahren',
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
            planType: 'Tarifart',
            youCantDowngradeInvoicing:
                'Sie können Ihren Tarif bei einem Rechnungsabonnement nicht herabstufen. Wenden Sie sich an Ihre*n Account Manager*in oder Concierge, um Ihre Abonnementdetails zu besprechen oder zu ändern.',
            defaultCategory: 'Standardkategorie',
            viewTransactions: 'Transaktionen anzeigen',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Ausgaben von ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card-Transaktionen werden automatisch in ein „Expensify Card Liability Account“ exportiert, das mit <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">unserer Integration</a> erstellt wurde.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Verbunden mit ${organizationName}` : 'Automatisieren Sie Reise- und Essenslieferungskosten in Ihrem gesamten Unternehmen.',
                sendInvites: 'Einladungen senden',
                sendInvitesDescription: 'Diese Arbeitsbereichsmitglieder haben noch kein Uber for Business-Konto. Wählen Sie alle Mitglieder ab, die Sie derzeit nicht einladen möchten.',
                confirmInvite: 'Einladung bestätigen',
                manageInvites: 'Einladungen verwalten',
                confirm: 'Bestätigen',
                allSet: 'Alles erledigt',
                readyToRoll: 'Du bist startklar',
                takeBusinessRideMessage: 'Mach eine Geschäftsreise und deine Uber-Belege werden in Expensify importiert. Los geht’s!',
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
                invitationFailure: 'Einladen des Mitglieds zu Uber for Business fehlgeschlagen',
                autoInvite: 'Neue Arbeitsbereichsmitglieder zu Uber for Business einladen',
                autoRemove: 'Entfernte Arbeitsbereichsmitglieder in Uber for Business deaktivieren',
                emptyContent: {
                    title: 'Keine ausstehenden Einladungen',
                    subtitle: 'Hurra! Wir haben überall nachgesehen und keine offenen Einladungen gefunden.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Legen Sie Pauschalspesen fest, um die täglichen Ausgaben von Mitarbeitenden zu steuern. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Mehr erfahren</a>.</muted-text>`,
            amount: 'Betrag',
            deleteRates: () => ({
                one: 'Satz löschen',
                other: 'Sätze löschen',
            }),
            deletePerDiemRate: 'Tagessatz löschen',
            findPerDiemRate: 'Tagespauschale finden',
            areYouSureDelete: () => ({
                one: 'Möchtest du diesen Satz wirklich löschen?',
                other: 'Möchtest du diese Tarife wirklich löschen?',
            }),
            emptyList: {
                title: 'Tagegeld',
                subtitle: 'Setze Tagegeldsätze fest, um die täglichen Ausgaben der Mitarbeitenden zu steuern. Importiere Sätze aus einer Tabellenkalkulation, um zu beginnen.',
            },
            importPerDiemRates: 'Pauschalspesen-Sätze importieren',
            editPerDiemRate: 'Tagessatz bearbeiten',
            editPerDiemRates: 'Tagessätze bearbeiten',
            editDestinationSubtitle: (destination: string) => `Wenn Sie dieses Ziel aktualisieren, wird es für alle ${destination}-Pauschalnebensätze geändert.`,
            editCurrencySubtitle: (destination: string) => `Wenn Sie diese Währung aktualisieren, wird sie für alle ${destination}-Tagesgeld-Teilbeträge geändert.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie aus der eigenen Tasche bezahlte Ausgaben nach QuickBooks Desktop exportiert werden.',
            exportOutOfPocketExpensesCheckToggle: 'Schecks als „später drucken“ markieren',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach QuickBooks Desktop exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify-Kartentransaktionen exportieren als',
            account: 'Konto',
            accountDescription: 'Wählen Sie aus, wo Buchungsjournale gebucht werden sollen.',
            accountsPayable: 'Verbindlichkeiten aus Lieferungen und Leistungen',
            accountsPayableDescription: 'Wähle aus, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wähle aus, von wo Schecks versendet werden.',
            creditCardAccount: 'Kreditkartenkonto',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Export von Berichten nach QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der jüngsten Ausgabe in diesem Bericht.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach QuickBooks Desktop exportiert wurde.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Eingereicht am',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            exportCheckDescription: 'Wir erstellen für jeden Expensify-Bericht einen aufgeschlüsselten Scheck und senden ihn von dem untenstehenden Bankkonto.',
            exportJournalEntryDescription: 'Wir erstellen für jeden Expensify-Bericht einen Buchungssatz mit Einzelposten und buchen ihn auf das untenstehende Konto.',
            exportVendorBillDescription:
                'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. Tag des nächsten offenen Zeitraums.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop unterstützt keine Steuern beim Export von Journalbuchungen. Da in deinem Workspace Steuern aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Buchungssätze sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wähle eine andere Exportoption.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Buchungssatz',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Scheck',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Wir erstellen für jeden Expensify-Bericht einen aufgeschlüsselten Scheck und senden ihn von dem untenstehenden Bankkonto.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Kreditkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Wenn keine Lieferanten vorhanden sind, erstellen wir einen „Credit Card Misc.“-Lieferanten zur Zuordnung.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Wir erstellen für jeden Expensify-Bericht eine Einzelposten-Lieferantenrechnung mit dem Datum der letzten Ausgabe und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir auf den 1. des nächsten offenen Zeitraums.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]:
                    'Wähle aus, wohin die Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wähle einen Anbieter aus, der auf alle Kreditkartentransaktionen angewendet wird.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Wähle aus, von wo Schecks versendet werden.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wähle eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wähle eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Buchungssätze sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wähle eine andere Exportoption.',
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Fügen Sie das Konto in QuickBooks Desktop hinzu und synchronisieren Sie die Verbindung erneut',
            qbdSetup: 'QuickBooks Desktop-Einrichtung',
            requiredSetupDevice: {
                title: 'Von diesem Gerät aus keine Verbindung möglich',
                body1: 'Sie müssen diese Verbindung von dem Computer aus einrichten, auf dem Ihre QuickBooks Desktop-Firmendatei gespeichert ist.',
                body2: 'Sobald du verbunden bist, kannst du von überall aus synchronisieren und exportieren.',
            },
            setupPage: {
                title: 'Öffne diesen Link, um die Verbindung herzustellen',
                body: 'Um die Einrichtung abzuschließen, öffne den folgenden Link auf dem Computer, auf dem QuickBooks Desktop ausgeführt wird.',
                setupErrorTitle: 'Etwas ist schiefgelaufen',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>Die Verbindung zu QuickBooks Desktop funktioniert im Moment nicht. Bitte versuche es später erneut oder <a href="${conciergeLink}">kontaktiere Concierge</a>, wenn das Problem weiterhin besteht.</centered-text></muted-text>`,
            },
            importDescription: 'Wähle aus, welche Coding-Konfigurationen aus QuickBooks Desktop nach Expensify importiert werden sollen.',
            classes: 'Klassen',
            items: 'Positionen',
            customers: 'Kunden/Projekte',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Firmenkartenkäufe nach QuickBooks Desktop exportiert werden.',
            defaultVendorDescription: 'Lege einen Standardlieferanten fest, der beim Export auf alle Kreditkartentransaktionen angewendet wird.',
            accountsDescription: 'Ihr QuickBooks Desktop-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern bei der Erstellung ihrer Ausgaben zur Auswahl.',
            classesDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Klassen in Expensify behandelt werden sollen.',
            tagsDisplayedAsDescription: 'Positionsebene',
            reportFieldsDisplayedAsDescription: 'Berichtsebene',
            customersDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Kunden/Projekte in Expensify behandelt werden sollen.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit QuickBooks Desktop synchronisiert.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription: 'Expensify erstellt in QuickBooks Desktop automatisch Lieferanten, wenn sie noch nicht vorhanden sind.',
            },
            itemsDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Posten in Expensify behandelt werden sollen.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wähle aus, wann die Spesen exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach endgültiger Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bar-Auslagen werden beim Bezahlen exportiert',
                },
            },
        },
        qbo: {
            connectedTo: 'Verbunden mit',
            importDescription: 'Wählen Sie aus, welche Kontokonfigurationen aus QuickBooks Online nach Expensify importiert werden sollen.',
            classes: 'Klassen',
            locations: 'Standorte',
            customers: 'Kunden/Projekte',
            accountsDescription: 'Ihr QuickBooks Online-Kontenplan wird als Kategorien in Expensify importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern bei der Erstellung ihrer Ausgaben zur Auswahl.',
            classesDescription: 'Wählen Sie aus, wie QuickBooks Online-Klassen in Expensify gehandhabt werden sollen.',
            customersDescription: 'Wähle aus, wie QuickBooks Online-Kunden/Projekte in Expensify gehandhabt werden sollen.',
            locationsDescription: 'Wähle aus, wie QuickBooks-Online-Standorte in Expensify behandelt werden sollen.',
            taxesDescription: 'Wähle aus, wie QuickBooks-Online-Steuern in Expensify gehandhabt werden sollen.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online unterstützt keine Standorte auf Zeilenebene für Schecks oder Lieferantenrechnungen. Wenn du Standorte auf Zeilenebene verwenden möchtest, stelle sicher, dass du Buchungsjournaleinträge und Kredit-/Debitkartenausgaben verwendest.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online unterstützt keine Steuern in Journalbuchungen. Bitte ändern Sie Ihre Exportoption auf Lieferantenrechnung oder Scheck.',
            exportDescription: 'Konfiguriere, wie Expensify-Daten nach QuickBooks Online exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify-Kartentransaktionen exportieren als',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwende dieses Datum beim Exportieren von Berichten zu QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der jüngsten Ausgabe in diesem Bericht.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach QuickBooks Online exportiert wurde.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Eingereicht am',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            receivable: 'Forderungen aus Lieferungen und Leistungen', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Debitorenarchiv', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Verwende dieses Konto beim Exportieren von Rechnungen nach QuickBooks Online.',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Käufe mit der Firmenkarte nach QuickBooks Online exportiert werden.',
            vendor: 'Lieferant',
            defaultVendorDescription: 'Lege einen Standardlieferanten fest, der beim Export auf alle Kreditkartentransaktionen angewendet wird.',
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie aus der eigenen Tasche gezahlte Ausgaben nach QuickBooks Online exportiert werden.',
            exportCheckDescription: 'Wir erstellen für jeden Expensify-Bericht einen aufgeschlüsselten Scheck und senden ihn von dem untenstehenden Bankkonto.',
            exportJournalEntryDescription: 'Wir erstellen für jeden Expensify-Bericht einen Buchungssatz mit Einzelposten und buchen ihn auf das untenstehende Konto.',
            exportVendorBillDescription:
                'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. Tag des nächsten offenen Zeitraums.',
            account: 'Konto',
            accountDescription: 'Wählen Sie aus, wo Buchungsjournale gebucht werden sollen.',
            accountsPayable: 'Verbindlichkeiten aus Lieferungen und Leistungen',
            accountsPayableDescription: 'Wähle aus, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wähle aus, von wo Schecks versendet werden.',
            creditCardAccount: 'Kreditkartenkonto',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online unterstützt keine Standorte beim Export von Lieferantenrechnungen. Da in deinem Workspace Standorte aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online unterstützt keine Steuern bei Journalbuchungsexporten. Da Steuern in deinem Workspace aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Buchungssätze sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wähle eine andere Exportoption.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit QuickBooks Online synchronisiert.',
                inviteEmployees: 'Mitarbeitende einladen',
                inviteEmployeesDescription: 'QuickBooks Online-Mitarbeiterdatensätze importieren und Mitarbeitende in diesen Workspace einladen.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription:
                    'Expensify erstellt in QuickBooks Online automatisch Lieferanten, wenn sie noch nicht vorhanden sind, und legt Kunden automatisch an, wenn Rechnungen exportiert werden.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im unten stehenden QuickBooks Online-Konto erstellt.',
                qboBillPaymentAccount: 'QuickBooks-Rechnungskonto',
                qboInvoiceCollectionAccount: 'QuickBooks-Konto für Rechnungseinzug',
                accountSelectDescription: 'Wählen Sie aus, von wo aus Rechnungen bezahlt werden sollen, und wir erstellen die Zahlung in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wähle, wo Zahlungseingänge für Rechnungen empfangen werden sollen, und wir erstellen die Zahlung in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Debitkarte',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Buchungssatz',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Scheck',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Debitkartentransaktion automatisch mit entsprechenden Lieferanten in QuickBooks ab. Falls keine Lieferanten vorhanden sind, erstellen wir einen Lieferanten „Debit Card Misc.“ zur Zuordnung.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Kreditkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Wenn keine Lieferanten vorhanden sind, erstellen wir einen „Credit Card Misc.“-Lieferanten zur Zuordnung.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Wir erstellen für jeden Expensify-Bericht eine Einzelposten-Lieferantenrechnung mit dem Datum der letzten Ausgabe und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir auf den 1. des nächsten offenen Zeitraums.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Wähle aus, wohin Debitkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wähle aus, wohin die Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wähle einen Anbieter aus, der auf alle Kreditkartentransaktionen angewendet wird.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wähle eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wähle eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Buchungssätze sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wähle eine andere Exportoption.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Wähle ein gültiges Konto für den Export der Lieferantenrechnung',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wählen Sie ein gültiges Konto für den Export des Buchungsjournals',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Wähle ein gültiges Konto für den Scheckexport',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Um den Export von Lieferantenrechnungen zu verwenden, richte ein Kreditorenkonto in QuickBooks Online ein',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Um den Export von Journalbuchungen zu verwenden, richte ein Journal-Konto in QuickBooks Online ein',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Um den Scheckexport zu verwenden, richte ein Bankkonto in QuickBooks Online ein',
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Fügen Sie das Konto in QuickBooks Online hinzu und synchronisieren Sie die Verbindung erneut.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wähle aus, wann die Spesen exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach endgültiger Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bar-Auslagen werden beim Bezahlen exportiert',
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
            importDescription: 'Wähle aus, welche Buchungskonfigurationen aus Xero nach Expensify importiert werden sollen.',
            accountsDescription: 'Ihr Xero-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern bei der Erstellung ihrer Ausgaben zur Auswahl.',
            trackingCategories: 'Verfolgungskategorien',
            trackingCategoriesDescription: 'Wählen Sie aus, wie Xero-Trackingkategorien in Expensify gehandhabt werden sollen.',
            mapTrackingCategoryTo: (categoryName: string) => `Xero-${categoryName} zuordnen zu`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Wählen Sie aus, wohin ${categoryName} beim Export nach Xero zugeordnet werden soll.`,
            customers: 'Kunden erneut abrechnen',
            customersDescription:
                'Wählen Sie, ob Kunden in Expensify erneut belastet werden sollen. Ihre Xero-Kundenkontakte können Ausgaben zugeordnet werden und werden als Verkaufsrechnung nach Xero exportiert.',
            taxesDescription: 'Wähle, wie mit Xero-Steuern in Expensify umgegangen werden soll.',
            notImported: 'Nicht importiert',
            notConfigured: 'Nicht konfiguriert',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero-Kontaktstandard',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Berichts­felder',
            },
            exportDescription: 'Konfiguriere, wie Expensify-Daten nach Xero exportiert werden.',
            purchaseBill: 'Einkaufsrechnung',
            exportDeepDiveCompanyCard:
                'Exportierte Ausgaben werden als Banktransaktionen auf das untenstehende Xero-Bankkonto gebucht, und die Buchungsdaten entsprechen den Daten auf Ihrem Kontoauszug.',
            bankTransactions: 'Banktransaktionen',
            xeroBankAccount: 'Xero-Bankkonto',
            xeroBankAccountDescription: 'Wählen Sie, wo Ausgaben als Banktransaktionen gebucht werden.',
            exportExpensesDescription: 'Berichte werden als Eingangsrechnung mit dem unten ausgewählten Datum und Status exportiert.',
            purchaseBillDate: 'Kaufrechnungsdatum',
            exportInvoices: 'Rechnungen exportieren als',
            salesInvoice: 'Verkaufsrechnung',
            exportInvoicesDescription: 'Verkaufsrechnungen zeigen immer das Datum an, an dem die Rechnung versendet wurde.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit Xero synchronisiert.',
                purchaseBillStatusTitle: 'Status der Einkaufsrechnung',
                reimbursedReportsDescription: 'Jedes Mal, wenn ein Bericht mit Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden Xero-Konto erstellt.',
                xeroBillPaymentAccount: 'Xero-Rechnungskonto',
                xeroInvoiceCollectionAccount: 'Xero-Forderungskonto',
                xeroBillPaymentAccountDescription: 'Wählen Sie aus, von wo aus Rechnungen bezahlt werden sollen, und wir erstellen die Zahlung in Xero.',
                invoiceAccountSelectorDescription: 'Wähle, wohin Rechnungsgutschriften eingehen sollen, und wir erstellen die Zahlung in Xero.',
            },
            exportDate: {
                label: 'Kaufrechnungsdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten nach Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der jüngsten Ausgabe in diesem Bericht.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach Xero exportiert wurde.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Eingereicht am',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status der Einkaufsrechnung',
                description: 'Verwenden Sie diesen Status beim Exportieren von Einkaufsrechnungen nach Xero.',
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
                description: 'Wähle aus, wann die Spesen exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach endgültiger Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bar-Auslagen werden beim Bezahlen exportiert',
                },
            },
        },
        sageIntacct: {
            preferredExporter: 'Bevorzugtes Exportformat',
            taxSolution: 'Steuerlösung',
            notConfigured: 'Nicht konfiguriert',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwende dieses Datum beim Exportieren von Berichten nach Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der jüngsten Ausgabe in diesem Bericht.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach Sage Intacct exportiert wurde.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Eingereicht am',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Legen Sie fest, wie aus der eigenen Tasche bezahlte Ausgaben nach Sage Intacct exportiert werden.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Spesenabrechnungen',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Lieferantenrechnungen',
                },
            },
            nonReimbursableExpenses: {
                description: 'Legen Sie fest, wie Firmenkartenkäufe nach Sage Intacct exportiert werden.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Kreditkarten',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Lieferantenrechnungen',
                },
            },
            creditCardAccount: 'Kreditkartenkonto',
            defaultVendor: 'Standardlieferant',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Legen Sie einen Standardlieferanten fest, der auf ${isReimbursable ? '' : 'nicht-'}erstattungsfähige Ausgaben angewendet wird, für die in Sage Intacct kein passender Lieferant vorhanden ist.`,
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach Sage Intacct exportiert werden.',
            exportPreferredExporterNote:
                'Die bevorzugte exportierende Person kann jede:r Workspace-Admin sein, muss aber auch Domain-Admin sein, wenn du in den Domaineinstellungen für einzelne Firmenkarten unterschiedliche Exportkonten festlegst.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur in seinem Konto Berichte zum Export.',
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: `Bitte fügen Sie das Konto in Sage Intacct hinzu und synchronisieren Sie die Verbindung erneut`,
            autoSync: 'Automatische Synchronisierung',
            autoSyncDescription: 'Expensify wird jeden Tag automatisch mit Sage Intacct synchronisiert.',
            inviteEmployees: 'Mitarbeitende einladen',
            inviteEmployeesDescription:
                'Importiere Sage Intacct-Mitarbeiterdatensätze und lade Mitarbeitende in diesen Workspace ein. Dein Genehmigungsworkflow wird standardmäßig auf Managergenehmigung eingestellt und kann auf der Seite „Mitglieder“ weiter konfiguriert werden.',
            syncReimbursedReports: 'Erstattete Berichte synchronisieren',
            syncReimbursedReportsDescription: 'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im Sage Intacct-Konto unten erstellt.',
            paymentAccount: 'Sage Intacct-Zahlungskonto',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wähle aus, wann die Spesen exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach endgültiger Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bar-Auslagen werden beim Bezahlen exportiert',
                },
            },
        },
        netsuite: {
            subsidiary: 'Tochtergesellschaft',
            subsidiarySelectDescription: 'Wählen Sie die Tochtergesellschaft in NetSuite aus, aus der Sie Daten importieren möchten.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach NetSuite exportiert werden.',
            exportInvoices: 'Rechnungen exportieren nach',
            journalEntriesTaxPostingAccount: 'Steuerbuchungskonto für Journalbuchungen',
            journalEntriesProvTaxPostingAccount: 'Journalbuchungen Konto für die Verbuchung der Provinzsteuer',
            foreignCurrencyAmount: 'Betrag in Fremdwährung exportieren',
            exportToNextOpenPeriod: 'In die nächste offene Periode exportieren',
            nonReimbursableJournalPostingAccount: 'Nicht erstattungsfähiges Journalbuchungskonto',
            reimbursableJournalPostingAccount: 'Erstattungsfähiges Journalkonto',
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
                        description: 'Wir erstellen beim Export eine „Expensify-Rechnungsposition“ für dich (falls noch keine vorhanden ist).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Vorhandenes auswählen',
                        description: 'Wir verknüpfen Rechnungen aus Expensify mit dem unten ausgewählten Eintrag.',
                    },
                },
            },
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwende dieses Datum beim Exportieren von Berichten nach NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der jüngsten Ausgabe in diesem Bericht.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach NetSuite exportiert wurde.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Eingereicht am',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Spesenabrechnungen',
                        reimbursableDescription: 'Auslagen werden als Spesenabrechnungen nach NetSuite exportiert.',
                        nonReimbursableDescription: 'Ausgaben von Firmenkarten werden als Spesenabrechnungen nach NetSuite exportiert.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Lieferantenrechnungen',
                        reimbursableDescription: dedent(`
                            Auslagen werden als Rechnungen exportiert, die an den unten angegebenen NetSuite-Lieferanten zahlbar sind.

                            Wenn Sie für jede Karte einen bestimmten Lieferanten festlegen möchten, gehen Sie zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Firmenkartenausgaben werden als Rechnungen exportiert, die an den unten angegebenen NetSuite-Lieferanten zahlbar sind.

                            Wenn du für jede Karte einen eigenen Lieferanten festlegen möchtest, gehe zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Journalbuchungen',
                        reimbursableDescription: dedent(`
                            Auslagen werden als Buchungssätze in das unten angegebene NetSuite-Konto exportiert.

                            Wenn du für jede Karte einen bestimmten Lieferanten festlegen möchtest, gehe zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Firmenkartenabrechnungen werden als Buchungssätze in das unten angegebene NetSuite-Konto exportiert.

                            Wenn du für jede Karte einen bestimmten Lieferanten festlegen möchtest, gehe zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Wenn du die Export-Einstellung für Firmenkarten auf Spesenabrechnungen umstellst, werden NetSuite-Lieferanten und Buchungskonten für einzelne Karten deaktiviert.\n\nKeine Sorge, wir speichern deine bisherigen Auswahlen, falls du später wieder zurückwechseln möchtest.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit NetSuite synchronisiert.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden NetSuite-Konto erstellt.',
                reimbursementsAccount: 'Erstattungskonto',
                reimbursementsAccountDescription: 'Wähle das Bankkonto, das du für Rückerstattungen verwendest, und wir erstellen die zugehörige Zahlung in NetSuite.',
                collectionsAccount: 'Inkassokonto',
                collectionsAccountDescription: 'Sobald eine Rechnung in Expensify als bezahlt markiert und nach NetSuite exportiert wurde, wird sie dem untenstehenden Konto zugeordnet.',
                approvalAccount: 'Kreditorenfreigabekonto',
                approvalAccountDescription:
                    'Wählen Sie das Konto aus, gegen das Transaktionen in NetSuite genehmigt werden. Wenn Sie erstattete Berichte synchronisieren, ist dies auch das Konto, gegen das Rechnungszahlungen erstellt werden.',
                defaultApprovalAccount: 'NetSuite-Standard',
                inviteEmployees: 'Mitarbeitende einladen und Genehmigungen festlegen',
                inviteEmployeesDescription:
                    'Importiere NetSuite-Mitarbeiterdaten und lade Mitarbeiter in diesen Workspace ein. Dein Genehmigungsworkflow wird standardmäßig auf Managergenehmigung gesetzt und kann auf der Seite *Mitglieder* weiter konfiguriert werden.',
                autoCreateEntities: 'Mitarbeitende/Lieferanten automatisch erstellen',
                enableCategories: 'Neu importierte Kategorien aktivieren',
                customFormID: 'Benutzerdefinierte Formular-ID',
                customFormIDDescription:
                    'Standardmäßig erstellt Expensify Buchungen mit dem bevorzugten Transaktionsformular, das in NetSuite festgelegt ist. Alternativ können Sie ein bestimmtes Transaktionsformular festlegen, das verwendet werden soll.',
                customFormIDReimbursable: 'Auslage',
                customFormIDNonReimbursable: 'Firmenkarten-Ausgabe',
                exportReportsTo: {
                    label: 'Genehmigungsstufe für Spesenabrechnungen',
                    description:
                        'Sobald ein Spesenbericht in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Verbuchung eine zusätzliche Genehmigungsebene festlegen.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Standardvorgabe für NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Nur von Vorgesetzten genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Nur von der Buchhaltung genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Von Vorgesetzter und Buchhaltung genehmigt',
                    },
                },
                accountingMethods: {
                    label: 'Wann exportieren',
                    description: 'Wähle aus, wann die Spesen exportiert werden sollen:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach endgültiger Genehmigung exportiert',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bar-Auslagen werden beim Bezahlen exportiert',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Genehmigungsstufe für Lieferantenrechnung',
                    description:
                        'Sobald eine Lieferantenrechnung in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Verbuchung eine zusätzliche Genehmigungsstufe festlegen.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Standardvorgabe für NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zur Buchung freigegeben',
                    },
                },
                exportJournalsTo: {
                    label: 'Genehmigungsstufe für Buchungssatz',
                    description:
                        'Sobald eine Buchung in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor dem Buchen eine zusätzliche Genehmigungsstufe festlegen.',
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
            noAccountsFoundDescription: 'Bitte fügen Sie das Konto in NetSuite hinzu und synchronisieren Sie die Verbindung erneut',
            noVendorsFound: 'Keine Anbieter gefunden',
            noVendorsFoundDescription: 'Bitte fügen Sie Lieferanten in NetSuite hinzu und synchronisieren Sie die Verbindung erneut',
            noItemsFound: 'Keine Rechnungsposten gefunden',
            noItemsFoundDescription: 'Bitte fügen Sie Rechnungspositionen in NetSuite hinzu und synchronisieren Sie die Verbindung erneut',
            noSubsidiariesFound: 'Keine Tochtergesellschaften gefunden',
            noSubsidiariesFoundDescription: 'Bitte fügen Sie in NetSuite ein Tochterunternehmen hinzu und synchronisieren Sie die Verbindung erneut',
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
                        description: 'Gehe in NetSuite zu *Setup > Company > Enable Features > SuiteCloud* und aktiviere *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Zugriffstoken erstellen',
                        description:
                            'Gehe in NetSuite zu *Setup > Users/Roles > Access Tokens* und erstelle ein Zugriffstoken für die „Expensify“-App und entweder die Rolle „Expensify Integration“ oder „Administrator“.\n\n*Wichtig:* Stelle sicher, dass du die *Token-ID* und das *Token Secret* aus diesem Schritt speicherst. Du wirst sie für den nächsten Schritt benötigen.',
                    },
                    enterCredentials: {
                        title: 'Gib deine NetSuite-Anmeldedaten ein',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Konto-ID',
                            netSuiteTokenID: 'Token-ID',
                            netSuiteTokenSecret: 'Token-Secret',
                        },
                        netSuiteAccountIDDescription: 'Wechsel in NetSuite zu *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Ausgabenkategorien',
                expenseCategoriesDescription: 'Ihre NetSuite-Spesenkategorien werden als Kategorien in Expensify importiert.',
                crossSubsidiaryCustomers: 'Mandantenübergreifende Kunden/Projekte',
                importFields: {
                    departments: {
                        title: 'Abteilungen',
                        subtitle: 'Wählen Sie aus, wie die NetSuite-*Abteilungen* in Expensify behandelt werden sollen.',
                    },
                    classes: {
                        title: 'Klassen',
                        subtitle: 'Wählen Sie aus, wie *Klassen* in Expensify behandelt werden sollen.',
                    },
                    locations: {
                        title: 'Standorte',
                        subtitle: 'Wähle aus, wie in Expensify mit *Standorten* umgegangen wird.',
                    },
                },
                customersOrJobs: {
                    title: 'Kunden/Projekte',
                    subtitle: 'Wählen Sie, wie NetSuite-*Kunden* und -*Projekte* in Expensify behandelt werden sollen.',
                    importCustomers: 'Kunden importieren',
                    importJobs: 'Projekte importieren',
                    customers: 'Kund:innen',
                    jobs: 'Projekte',
                    label: (importFields: string[], importType: string) => `${importFields.join('und')}, ${importType}`,
                },
                importTaxDescription: 'Steuergruppen aus NetSuite importieren.',
                importCustomFields: {
                    chooseOptionBelow: 'Wähle eine Option unten aus:',
                    label: (importedTypes: string[]) => `Importiert als ${importedTypes.join('und')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Bitte gib ${fieldName} ein`,
                    customSegments: {
                        title: 'Benutzerdefinierte Segmente/Datensätze',
                        addText: 'Benutzerdefinierten Abschnitt/Datensatz hinzufügen',
                        recordTitle: 'Benutzerdefiniertes Segment/Datensatz',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Detaillierte Anweisungen anzeigen',
                        helpText: 'zur Konfiguration benutzerdefinierter Segmente/Datensätze.',
                        emptyTitle: 'Benutzerdefinierten Segment- oder benutzerdefinierten Datensatz hinzufügen',
                        fields: {
                            segmentName: 'Name',
                            internalID: 'Interne ID',
                            scriptID: 'Skript-ID',
                            customRecordScriptID: 'Transaktionsspalten-ID',
                            mapping: 'Angezeigt als',
                        },
                        removeTitle: 'Benutzerdefiniertes Segment/Datensatz entfernen',
                        removePrompt: 'Möchtest du dieses benutzerdefinierte Segment/den benutzerdefinierten Eintrag wirklich entfernen?',
                        addForm: {
                            customSegmentName: 'Benutzerdefinierter Segmentname',
                            customRecordName: 'Benutzerdefinierter Datensatzname',
                            segmentTitle: 'Benutzerdefinierter Abschnitt',
                            customSegmentAddTitle: 'Benutzerdefinierten Abschnitt hinzufügen',
                            customRecordAddTitle: 'Benutzerdefinierten Datensatz hinzufügen',
                            recordTitle: 'Benutzerdefinierter Datensatz',
                            segmentRecordType: 'Möchten Sie ein benutzerdefiniertes Segment oder einen benutzerdefinierten Eintrag hinzufügen?',
                            customSegmentNameTitle: 'Wie lautet der Name des benutzerdefinierten Segments?',
                            customRecordNameTitle: 'Wie lautet der Name des benutzerdefinierten Datensatzes?',
                            customSegmentNameFooter: `Benutzerdefinierte Segmentnamen finden Sie in NetSuite auf der Seite *Customizations > Links, Records & Fields > Custom Segments*.

_Auf unserer Hilfeseite finden Sie eine ausführlichere Anleitung_ [hier](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS}).`,
                            customRecordNameFooter: `Sie können benutzerdefinierte Datensatznamen in NetSuite finden, indem Sie „Transaction Column Field“ in die globale Suche eingeben.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfe-Seite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})._`,
                            customSegmentInternalIDTitle: 'Was ist die interne ID?',
                            customSegmentInternalIDFooter: `Stellen Sie zunächst sicher, dass Sie interne IDs in NetSuite unter *Home > Set Preferences > Show Internal ID* aktiviert haben.

Sie finden die internen IDs benutzerdefinierter Segmente in NetSuite unter:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klicken Sie auf ein benutzerdefiniertes Segment.
3. Klicken Sie auf den Hyperlink neben *Custom Record Type*.
4. Suchen Sie die interne ID in der Tabelle unten.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})._`,
                            customRecordInternalIDFooter: `Sie können interne IDs benutzerdefinierter Datensätze in NetSuite wie folgt finden:

1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.
2. Klicken Sie auf einen benutzerdefinierten Datensatz.
3. Suchen Sie die interne ID auf der linken Seite.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})._`,
                            customSegmentScriptIDTitle: 'Wie lautet die Skript-ID?',
                            customSegmentScriptIDFooter: `Benutzerdefinierte Segmentskript-IDs findest du in NetSuite unter:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klicke auf ein benutzerdefiniertes Segment.
3. Klicke unten auf die Registerkarte *Application and Sourcing* und dann:
    a. Wenn du das benutzerdefinierte Segment als *Tag* (auf Positionsebene) in Expensify anzeigen möchtest, klicke auf die Unterregisterkarte *Transaction Columns* und verwende die *Field ID*.
    b. Wenn du das benutzerdefinierte Segment als *Berichts­feld* (auf Berichtsebene) in Expensify anzeigen möchtest, klicke auf die Unterregisterkarte *Transactions* und verwende die *Field ID*.

_Für detailliertere Anweisungen [besuche unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Wie lautet die Transaktionsspalten-ID?',
                            customRecordScriptIDFooter: `Sie finden benutzerdefinierte Datensatz-Skript-IDs in NetSuite unter:

1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.
2. Klicken Sie auf einen benutzerdefinierten Datensatz.
3. Finden Sie die Skript-ID auf der linken Seite.

_Für ausführlichere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})._`,
                            customSegmentMappingTitle: 'Wie soll dieses benutzerdefinierte Segment in Expensify angezeigt werden?',
                            customRecordMappingTitle: 'Wie soll dieser benutzerdefinierte Eintrag in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Ein benutzerdefiniertes Segment/Datensatz mit dieser ${fieldName?.toLowerCase()} existiert bereits`,
                        },
                    },
                    customLists: {
                        title: 'Benutzerdefinierte Listen',
                        addText: 'Eigene Liste hinzufügen',
                        recordTitle: 'Benutzerdefinierte Liste',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Detaillierte Anweisungen anzeigen',
                        helpText: 'zur Konfiguration benutzerdefinierter Listen.',
                        emptyTitle: 'Eigene Liste hinzufügen',
                        fields: {
                            listName: 'Name',
                            internalID: 'Interne ID',
                            transactionFieldID: 'Transaktionsfeld-ID',
                            mapping: 'Angezeigt als',
                        },
                        removeTitle: 'Benutzerdefinierte Liste entfernen',
                        removePrompt: 'Möchtest du diese benutzerdefinierte Liste wirklich entfernen?',
                        addForm: {
                            listNameTitle: 'Wähle eine benutzerdefinierte Liste',
                            transactionFieldIDTitle: 'Wie lautet die Transaktionsfeld-ID?',
                            transactionFieldIDFooter: `Sie finden die Transaktionsfeld-IDs in NetSuite, indem Sie folgende Schritte ausführen:

1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.
2. Klicken Sie in eine benutzerdefinierte Liste.
3. Suchen Sie die Transaktionsfeld-ID auf der linken Seite.

_Für ausführlichere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})._`,
                            mappingTitle: 'Wie soll diese benutzerdefinierte Liste in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Eine benutzerdefinierte Liste mit dieser Transaktionsfeld-ID existiert bereits`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Standardwert für NetSuite-Mitarbeiter',
                        description: 'Nicht in Expensify importiert, beim Export angewendet',
                        footerContent: (importField: string) =>
                            `Wenn du ${importField} in NetSuite verwendest, wenden wir beim Export zur Spesenabrechnung oder zum Journaleintrag den Standardwert an, der im Mitarbeitendendatensatz festgelegt ist.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'Positionsebene',
                        footerContent: (importField: string) => `${startCase(importField)} kann für jede einzelne Ausgabe in dem Bericht eines Mitarbeitenden ausgewählt werden.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Berichts­felder',
                        description: 'Berichtsebene',
                        footerContent: (importField: string) => `Die Auswahl von ${startCase(importField)} wird auf alle Ausgaben im Bericht eines Mitarbeitenden angewendet.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct-Einrichtung',
            prerequisitesTitle: 'Bevor du dich verbindest …',
            downloadExpensifyPackage: 'Lade das Expensify-Paket für Sage Intacct herunter',
            followSteps: 'Folge den Schritten in unserer Anleitung „How-to: Mit Sage Intacct verbinden“',
            enterCredentials: 'Gib deine Sage Intacct-Zugangsdaten ein',
            entity: 'Juristische Person',
            employeeDefault: 'Standardwert für Sage Intacct-Mitarbeiter',
            employeeDefaultDescription: 'Die Standardabteilung der Mitarbeiterin oder des Mitarbeiters wird, sofern vorhanden, in Sage Intacct auf ihre Ausgaben angewendet.',
            displayedAsTagDescription: 'Die Abteilung kann für jede einzelne Ausgabe im Bericht eines Mitarbeitenden ausgewählt werden.',
            displayedAsReportFieldDescription: 'Die Abteilungsauswahl wird auf alle Ausgaben in den Berichten der Mitarbeitenden angewendet.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Wähle aus, wie Sage Intacct-<strong>${mappingTitle}</strong> in Expensify gehandhabt werden soll.`,
            expenseTypes: 'Ausgabenarten',
            expenseTypesDescription: 'Ihre Sage Intacct-Spesenarten werden in Expensify als Kategorien importiert.',
            accountTypesDescription: 'Ihr Sage Intacct-Kontenplan wird in Expensify als Kategorien importiert.',
            importTaxDescription: 'Kaufortsteuersatz aus Sage Intacct importieren.',
            userDefinedDimensions: 'Benutzerdefinierte Dimensionen',
            addUserDefinedDimension: 'Benutzerdefinierte Dimension hinzufügen',
            integrationName: 'Integrationsname',
            dimensionExists: 'Eine Dimension mit diesem Namen existiert bereits.',
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
            collect: 'Einsammeln',
        },
        companyCards: {
            addCards: 'Karten hinzufügen',
            selectCards: 'Karten auswählen',
            addNewCard: {
                other: 'Sonstiges',
                cardProviders: {
                    gl1025: 'American Express Firmenkarten',
                    cdf: 'Mastercard Firmenkarten',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Stripe-Karten',
                },
                yourCardProvider: `Wer ist Ihr Kartenanbieter?`,
                whoIsYourBankAccount: 'Bei welcher Bank bist du?',
                whereIsYourBankLocated: 'Wo befindet sich Ihre Bank?',
                howDoYouWantToConnect: 'Wie möchtest du deine Bank verbinden?',
                learnMoreAboutOptions: `<muted-text>Erfahren Sie mehr über diese <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">Optionen</a>.</muted-text>`,
                commercialFeedDetails:
                    'Erfordert eine Einrichtung mit Ihrer Bank. Dies wird in der Regel von größeren Unternehmen genutzt und ist oft die beste Option, sofern Sie dafür in Frage kommen.',
                commercialFeedPlaidDetails: `Erfordert eine Einrichtung mit Ihrer Bank, aber wir führen Sie durch den Prozess. Dies ist in der Regel auf größere Unternehmen beschränkt.`,
                directFeedDetails: 'Der einfachste Ansatz. Verbinde dich direkt mit deinen Hauptzugangsdaten. Diese Methode ist am gebräuchlichsten.',
                enableFeed: {
                    title: (provider: string) => `Aktiviere deinen ${provider}-Feed`,
                    heading:
                        'Wir verfügen über eine direkte Integration mit Ihrem Kartenanbieter und können Ihre Transaktionsdaten schnell und zuverlässig in Expensify importieren.\n\nSo beginnen Sie:',
                    visa: 'Wir verfügen über globale Integrationen mit Visa, allerdings hängt die Verfügbarkeit von der jeweiligen Bank und dem Kartenprogramm ab.\n\nSo legen Sie los:',
                    mastercard:
                        'Wir verfügen über globale Integrationen mit Mastercard, allerdings hängt die Berechtigung von der Bank und dem Kartenprogramm ab.\n\nUm loszulegen, machen Sie einfach Folgendes:',
                    vcf: `1. Lies dir [diesen Hilfeartikel](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) durch, um detaillierte Anweisungen zum Einrichten deiner Visa Commercial Cards zu erhalten.

2. [Kontaktiere deine Bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), um zu bestätigen, dass sie einen Commercial-Feed für dein Programm unterstützt, und bitte sie, ihn zu aktivieren.

3. *Sobald der Feed aktiviert ist und du seine Details hast, fahre mit dem nächsten Bildschirm fort.*`,
                    gl1025: `1. Rufe [diesen Hilfeartikel](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) auf, um herauszufinden, ob American Express für dein Programm einen Commercial Feed aktivieren kann.

2. Sobald der Feed aktiviert ist, schickt dir Amex ein Produktionsschreiben.

3. *Sobald du die Feed-Informationen hast, fahre mit dem nächsten Bildschirm fort.*`,
                    cdf: `1. Lies dir [diesen Hilfeartikel](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) für detaillierte Anweisungen zum Einrichten deiner Mastercard Commercial Cards durch.

2. [Kontaktiere deine Bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), um zu bestätigen, dass sie einen Commercial Feed für dein Programm unterstützt, und bitte sie, ihn zu aktivieren.

3. *Sobald der Feed aktiviert ist und du die Details dazu hast, fahre mit dem nächsten Bildschirm fort.*`,
                    stripe: `1. Öffne das Stripe-Dashboard und gehe zu [Einstellungen](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Klicke unter „Produktintegrationen“ auf „Aktivieren“ neben Expensify.

3. Sobald der Feed aktiviert ist, klicke unten auf „Senden“ und wir kümmern uns um die Einrichtung.`,
                },
                whatBankIssuesCard: 'Welche Bank gibt diese Karten aus?',
                enterNameOfBank: 'Namen der Bank eingeben',
                feedDetails: {
                    vcf: {
                        title: 'Wie lauten die Visa-Feed-Details?',
                        processorLabel: 'Prozessor-ID',
                        bankLabel: 'Finanzinstitut (Bank)-ID',
                        companyLabel: 'Unternehmens-ID',
                        helpLabel: 'Wo finde ich diese IDs?',
                    },
                    gl1025: {
                        title: `Wie lautet der Dateiname der Amex-Lieferdatei?`,
                        fileNameLabel: 'Name der Lieferdatei',
                        helpLabel: 'Wo finde ich den Namen der Lieferdatei?',
                    },
                    cdf: {
                        title: `Wie lautet die Mastercard-Vertriebs-ID?`,
                        distributionLabel: 'Verteilungs-ID',
                        helpLabel: 'Wo finde ich die Distributions-ID?',
                    },
                },
                amexCorporate: 'Wähle dies aus, wenn auf der Vorderseite deiner Karten „Corporate“ steht',
                amexBusiness: 'Wählen Sie dies aus, wenn auf der Vorderseite Ihrer Karten „Business“ steht',
                amexPersonal: 'Wähle dies aus, wenn deine Karten privat sind',
                error: {
                    pleaseSelectProvider: 'Bitte wählen Sie einen Kartenanbieter aus, bevor Sie fortfahren',
                    pleaseSelectBankAccount: 'Bitte wähle ein Bankkonto aus, bevor du fortfährst',
                    pleaseSelectBank: 'Bitte wählen Sie vor dem Fortfahren eine Bank aus',
                    pleaseSelectCountry: 'Bitte wähle ein Land aus, bevor du fortfährst',
                    pleaseSelectFeedType: 'Bitte wähle einen Feed-Typ aus, bevor du fortfährst',
                },
                exitModal: {
                    title: 'Funktioniert etwas nicht?',
                    prompt: 'Wir haben festgestellt, dass du das Hinzufügen deiner Karten nicht abgeschlossen hast. Wenn du auf ein Problem gestoßen bist, sag uns bitte Bescheid, damit wir dir helfen können, alles wieder ins Lot zu bringen.',
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
            chooseCardFor: (assignee: string) =>
                `Wählen Sie eine Karte für <strong>${assignee}</strong> aus. Können Sie die gesuchte Karte nicht finden? <concierge-link>Teilen Sie uns das mit.</concierge-link>`,
            noActiveCards: 'Keine aktiven Karten in diesem Feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Oder etwas ist möglicherweise kaputt. So oder so, wenn du Fragen hast, <concierge-link>wende dich einfach an Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Wähle ein Startdatum für die Transaktion',
            startDateDescription: 'Wähle dein Startdatum für den Import. Wir synchronisieren alle Transaktionen ab diesem Datum.',
            fromTheBeginning: 'Von Anfang an',
            customStartDate: 'Benutzerdefiniertes Startdatum',
            customCloseDate: 'Benutzerdefiniertes Abschlussdatum',
            letsDoubleCheck: 'Lass uns noch einmal prüfen, ob alles richtig aussieht.',
            confirmationDescription: 'Wir beginnen sofort mit dem Import der Transaktionen.',
            card: 'Karte',
            cardName: 'Kartenname',
            brokenConnectionError:
                '<rbr>Die Karten-Feed-Verbindung ist unterbrochen. Bitte <a href="#">melden Sie sich bei Ihrer Bank an</a>, damit wir die Verbindung wiederherstellen können.</rbr>',
            assignedCard: (assignee: string, link: string) => `${assignee} wurde ein ${link} zugewiesen! Importierte Transaktionen werden in diesem Chat angezeigt.`,
            companyCard: 'Firmenkarte',
            chooseCardFeed: 'Kartenfeed wählen',
            ukRegulation:
                'Expensify Limited ist als Vertreter von Plaid Financial Ltd. tätig, einem zugelassenen Zahlungsinstitut, das von der Financial Conduct Authority gemäß den Payment Services Regulations 2017 (Firm Reference Number: 804718) reguliert wird. Plaid stellt Ihnen über Expensify Limited als seinen Vertreter regulierte Kontoinformationsdienste zur Verfügung.',
            assignCardFailedError: 'Kartenzuweisung fehlgeschlagen.',
            cardAlreadyAssignedError: 'This card is already assigned to a user in another workspace.',
            unassignCardFailedError: 'Aufhebung der Kartenzuweisung fehlgeschlagen.',
        },
        expensifyCard: {
            issueAndManageCards: 'Expensify Cards ausgeben und verwalten',
            getStartedIssuing: 'Beginne, indem du deine erste virtuelle oder physische Karte ausstellst.',
            verificationInProgress: 'Verifizierung läuft ...',
            verifyingTheDetails: 'Wir überprüfen ein paar Details. Concierge informiert dich, sobald Expensify Cards ausgestellt werden können.',
            disclaimer:
                'Die Expensify Visa® Commercial Card wird von der The Bancorp Bank, N.A., Mitglied der FDIC, gemäß einer Lizenz von Visa U.S.A. Inc. herausgegeben und kann nicht bei allen Händlern verwendet werden, die Visa-Karten akzeptieren. Apple® und das Apple-Logo® sind Marken der Apple Inc., eingetragen in den USA und anderen Ländern. App Store ist eine Dienstleistungsmarke der Apple Inc. Google Play und das Google Play-Logo sind Marken von Google LLC.',
            euUkDisclaimer:
                'Karten, die Einwohnern des EWR zur Verfügung gestellt werden, werden von Transact Payments Malta Limited ausgegeben, und Karten, die Einwohnern des Vereinigten Königreichs zur Verfügung gestellt werden, werden von Transact Payments Limited gemäß einer Lizenz von Visa Europe Limited ausgegeben. Transact Payments Malta Limited ist ordnungsgemäß von der Malta Financial Services Authority als Finanzinstitut nach dem Financial Institution Act 1994 zugelassen und beaufsichtigt. Registrierungsnummer C 91879. Transact Payments Limited ist von der Gibraltar Financial Service Commission zugelassen und beaufsichtigt.',
            issueCard: 'Karte ausgeben',
            findCard: 'Karte finden',
            newCard: 'Neue Karte',
            name: 'Name',
            lastFour: 'Letzte 4',
            limit: 'Limit',
            currentBalance: 'Aktueller Kontostand',
            currentBalanceDescription: 'Der aktuelle Saldo ist die Summe aller gebuchten Expensify Card-Transaktionen, die seit dem letzten Abrechnungsdatum angefallen sind.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Der Saldo wird am ${settlementDate} ausgeglichen`,
            settleBalance: 'Saldo ausgleichen',
            cardLimit: 'Kartenlimit',
            remainingLimit: 'Verbleibendes Limit',
            requestLimitIncrease: 'Limit­erhöhung anfordern',
            remainingLimitDescription:
                'Wir berücksichtigen eine Reihe von Faktoren, wenn wir Ihren verbleibenden Verfügungsrahmen berechnen: Ihre Dauer als Kund*in, die geschäftsbezogenen Informationen, die Sie bei der Registrierung angegeben haben, sowie das verfügbare Guthaben auf Ihrem Geschäftskonto. Ihr verbleibender Verfügungsrahmen kann täglich schwanken.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Der Cashback-Saldo basiert auf den abgerechneten monatlichen Expensify-Card-Ausgaben in deinem Workspace.',
            issueNewCard: 'Neue Karte ausstellen',
            finishSetup: 'Einrichtung abschließen',
            chooseBankAccount: 'Bankkonto auswählen',
            chooseExistingBank: 'Wähle ein bestehendes Geschäftskonto, um deinen Expensify Card-Saldo zu bezahlen, oder füge ein neues Bankkonto hinzu',
            accountEndingIn: 'Konto endet auf',
            addNewBankAccount: 'Neues Bankkonto hinzufügen',
            settlementAccount: 'Abwicklungskonto',
            settlementAccountDescription: 'Wähle ein Konto aus, um den Saldo deiner Expensify Card zu bezahlen.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Stellen Sie sicher, dass dieses Konto mit Ihrem <a href="${reconciliationAccountSettingsLink}">Abstimmungskonto</a> (${accountNumber}) übereinstimmt, damit die Laufende Abstimmung ordnungsgemäß funktioniert.`,
            settlementFrequency: 'Auszahlungsfrequenz',
            settlementFrequencyDescription: 'Wählen Sie, wie oft Sie Ihren Expensify-Card-Saldo bezahlen.',
            settlementFrequencyInfo:
                'Wenn du auf eine monatliche Abrechnung umstellen möchtest, musst du dein Bankkonto über Plaid verknüpfen und eine positive Kontohistorie der letzten 90 Tage vorweisen.',
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
            fixedLimitWarning: (limit: number | string) => `Wenn du das Limit dieser Karte auf ${limit} änderst, werden neue Transaktionen abgelehnt.`,
            changeCardLimitType: 'Kartentyp für Limit ändern',
            changeLimitType: 'Limittyp ändern',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `Wenn du den Limittyp dieser Karte auf Smart Limit änderst, werden neue Transaktionen abgelehnt, weil das nicht genehmigte Limit von ${limit} bereits erreicht wurde.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Wenn du den Limit-Typ dieser Karte auf „Monatlich“ änderst, werden neue Transaktionen abgelehnt, da das monatliche Limit von ${limit} bereits erreicht wurde.`,
            addShippingDetails: 'Versanddetails hinzufügen',
            issuedCard: (assignee: string) => `hat ${assignee} eine Expensify Card ausgestellt! Die Karte wird in 2–3 Werktagen ankommen.`,
            issuedCardNoShippingDetails: (assignee: string) => `hat ${assignee} eine Expensify Card ausgestellt! Die Karte wird versendet, sobald die Versanddetails bestätigt sind.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `hat ${assignee} eine virtuelle Expensify Card ausgestellt! Der/die/das ${link} kann sofort verwendet werden.`,
            addedShippingDetails: (assignee: string) => `${assignee} hat Versanddetails hinzugefügt. Die Expensify Card wird in 2–3 Werktagen ankommen.`,
            replacedCard: (assignee: string) => `${assignee} hat ihre Expensify Card ersetzt. Die neue Karte trifft in 2–3 Werktagen ein.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} hat ihre virtuelle Expensify Card ersetzt! Die ${link} kann sofort verwendet werden.`,
            card: 'Karte',
            replacementCard: 'Ersatzkarte',
            verifyingHeader: 'Wird überprüft',
            bankAccountVerifiedHeader: 'Bankkonto verifiziert',
            verifyingBankAccount: 'Bankkonto wird verifiziert ...',
            verifyingBankAccountDescription: 'Bitte warten Sie, während wir bestätigen, dass dieses Konto zur Ausgabe von Expensify-Karten verwendet werden kann.',
            bankAccountVerified: 'Bankkonto verifiziert!',
            bankAccountVerifiedDescription: 'Sie können jetzt Expensify-Karten an die Mitglieder Ihres Arbeitsbereichs ausgeben.',
            oneMoreStep: 'Noch ein Schritt …',
            oneMoreStepDescription: 'Es sieht so aus, als müssten wir dein Bankkonto manuell verifizieren. Bitte wechsle zu Concierge, wo bereits Anweisungen auf dich warten.',
            gotIt: 'Verstanden',
            goToConcierge: 'Zu Concierge',
        },
        categories: {
            deleteCategories: 'Kategorien löschen',
            deleteCategoriesPrompt: 'Möchten Sie diese Kategorien wirklich löschen?',
            deleteCategory: 'Kategorie löschen',
            deleteCategoryPrompt: 'Sind Sie sicher, dass Sie diese Kategorie löschen möchten?',
            disableCategories: 'Kategorien deaktivieren',
            disableCategory: 'Kategorie deaktivieren',
            enableCategories: 'Kategorien aktivieren',
            enableCategory: 'Kategorie aktivieren',
            defaultSpendCategories: 'Standard-Ausgabenkategorien',
            spendCategoriesDescription: 'Lege fest, wie Händlerausgaben für Kreditkartentransaktionen und gescannte Belege kategorisiert werden.',
            deleteFailureMessage: 'Beim Löschen der Kategorie ist ein Fehler aufgetreten, bitte versuche es erneut',
            categoryName: 'Kategoriename',
            requiresCategory: 'Mitglieder müssen alle Ausgaben kategorisieren',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Alle Ausgaben müssen kategorisiert werden, um nach ${connectionName} exportiert werden zu können.`,
            subtitle: 'Verschaffe dir einen besseren Überblick darüber, wofür Geld ausgegeben wird. Verwende unsere Standardkategorien oder füge eigene hinzu.',
            emptyCategories: {
                title: 'Du hast noch keine Kategorien erstellt',
                subtitle: 'Fügen Sie eine Kategorie hinzu, um Ihre Ausgaben zu organisieren.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Deine Kategorien werden derzeit über eine Buchhaltungsanbindung importiert. Gehe zu <a href="${accountingPageURL}">Buchhaltung</a>, um Änderungen vorzunehmen.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Beim Aktualisieren der Kategorie ist ein Fehler aufgetreten, bitte versuche es erneut.',
            createFailureMessage: 'Beim Erstellen der Kategorie ist ein Fehler aufgetreten, bitte versuche es erneut.',
            addCategory: 'Kategorie hinzufügen',
            editCategory: 'Kategorie bearbeiten',
            editCategories: 'Kategorien bearbeiten',
            findCategory: 'Kategorie finden',
            categoryRequiredError: 'Kategoriename ist erforderlich',
            existingCategoryError: 'Eine Kategorie mit diesem Namen existiert bereits',
            invalidCategoryName: 'Ungültiger Kategoriename',
            importedFromAccountingSoftware: 'Die untenstehenden Kategorien werden importiert von Ihrem',
            payrollCode: 'Lohnabrechnungscode',
            updatePayrollCodeFailureMessage: 'Beim Aktualisieren des Lohnabrechnungscodes ist ein Fehler aufgetreten, bitte versuche es erneut',
            glCode: 'Sachkonto-Code',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des Hauptbuchcodes ist ein Fehler aufgetreten, bitte versuche es erneut.',
            importCategories: 'Kategorien importieren',
            cannotDeleteOrDisableAllCategories: {
                title: 'Alle Kategorien können nicht gelöscht oder deaktiviert werden',
                description: `Mindestens eine Kategorie muss aktiviert bleiben, da in Ihrem Workspace Kategorien erforderlich sind.`,
            },
        },
        moreFeatures: {
            subtitle:
                'Verwende die Schalter unten, um mit deinem Wachstum weitere Funktionen zu aktivieren. Jede Funktion wird im Navigationsmenü angezeigt und kann dort weiter angepasst werden.',
            spendSection: {
                title: 'Ausgaben',
                subtitle: 'Aktiviere Funktionen, die dir helfen, dein Team zu skalieren.',
            },
            manageSection: {
                title: 'Verwalten',
                subtitle: 'Fügen Sie Kontrollen hinzu, die helfen, Ausgaben im Budget zu halten.',
            },
            earnSection: {
                title: 'Verdienen',
                subtitle: 'Optimieren Sie Ihren Umsatz und lassen Sie sich schneller bezahlen.',
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
                subtitle: 'Raten hinzufügen, aktualisieren und durchsetzen.',
            },
            perDiem: {
                title: 'Tagegeld',
                subtitle: 'Legen Sie Pauschalbeträge fest, um die täglichen Ausgaben der Mitarbeitenden zu steuern.',
            },
            travel: {
                title: 'Reisen',
                subtitle: 'Buchen, verwalten und abstimmen Sie alle Ihre Geschäftsreisen.',
                getStarted: {
                    title: 'Loslegen mit Expensify Travel',
                    subtitle: 'Wir brauchen nur noch ein paar weitere Informationen zu deinem Unternehmen, dann bist du startklar.',
                    ctaText: "Los geht's",
                },
                reviewingRequest: {
                    title: 'Koffer packen, wir haben deine Anfrage erhalten ...',
                    subtitle: 'Wir prüfen derzeit deine Anfrage zur Aktivierung von Expensify Travel. Keine Sorge, wir sagen dir Bescheid, sobald alles bereit ist.',
                    ctaText: 'Anfrage gesendet',
                },
                bookOrManageYourTrip: {
                    title: 'Reise buchen oder verwalten',
                    subtitle: 'Nutze Expensify Travel, um die besten Reiseangebote zu erhalten und all deine Geschäftsausgaben an einem Ort zu verwalten.',
                    ctaText: 'Buchen oder verwalten',
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: 'Reisebuchung',
                        subtitle: 'Glückwunsch! Du kannst in diesem Workspace jetzt Reisen buchen und verwalten.',
                        manageTravelLabel: 'Reisen verwalten',
                    },
                    centralInvoicingSection: {
                        title: 'Zentrale Rechnungsstellung',
                        subtitle: 'Zentralisiere alle Reisekosten in einer monatlichen Rechnung, anstatt sie direkt beim Kauf zu bezahlen.',
                        learnHow: 'Mehr erfahren.',
                        subsections: {
                            currentTravelSpendLabel: 'Aktuelle Reisekosten',
                            currentTravelSpendCta: 'Saldo bezahlen',
                            currentTravelLimitLabel: 'Aktuelles Reisekontingent',
                            settlementAccountLabel: 'Abwicklungskonto',
                            settlementFrequencyLabel: 'Auszahlungsfrequenz',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Gewinnen Sie Einblicke und Kontrolle über Ausgaben.',
                disableCardTitle: 'Expensify Card deaktivieren',
                disableCardPrompt: 'Du kannst die Expensify Card nicht deaktivieren, da sie bereits verwendet wird. Wende dich an Concierge, um die nächsten Schritte zu erfahren.',
                disableCardButton: 'Mit Concierge chatten',
                feed: {
                    title: 'Expensify Card bestellen',
                    subTitle: 'Vereinfachen Sie Ihre Geschäftsausgaben und sparen Sie bis zu 50 % auf Ihrer Expensify-Rechnung, plus:',
                    features: {
                        cashBack: 'Rabatt auf jeden Einkauf in den USA',
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
                    subtitle: 'Verknüpfe die Karten, die du bereits hast, für den automatischen Transaktionsimport, Belegabgleich und die Abstimmung.',
                    features: {
                        support: 'Karten von über 10.000 Banken verknüpfen',
                        assignCards: 'Verknüpfe die vorhandenen Karten deines Teams',
                        automaticImport: 'Wir ziehen Transaktionen automatisch ein',
                    },
                },
                bankConnectionError: 'Problem mit Bankverbindung',
                connectWithPlaid: 'Über Plaid verbinden',
                connectWithExpensifyCard: 'probiere die Expensify Card aus.',
                bankConnectionDescription: `Bitte versuchen Sie, Ihre Karten erneut hinzuzufügen. Andernfalls können Sie`,
                disableCardTitle: 'Firmenkarten deaktivieren',
                disableCardPrompt: 'Du kannst die Firmenkarten nicht deaktivieren, da diese Funktion in Verwendung ist. Wende dich an Concierge, um die nächsten Schritte zu erfahren.',
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
                    `Wählen Sie das ${integration}-Konto, in das Transaktionen exportiert werden sollen. Wählen Sie eine andere <a href="${exportPageLink}">Exportoption</a>, um die verfügbaren Konten zu ändern.`,
                lastUpdated: 'Zuletzt aktualisiert',
                transactionStartDate: 'Startdatum der Transaktion',
                updateCard: 'Karte aktualisieren',
                unassignCard: 'Karte zuweisen aufheben',
                unassign: 'Zuweisung aufheben',
                unassignCardDescription:
                    'Wenn Sie diese Karte entfernen, werden alle Transaktionen auf Entwürfen von Berichten aus dem Konto der Karteninhaberin oder des Karteninhabers gelöscht.',
                assignCard: 'Karte zuweisen',
                cardFeedName: 'Name des Kartenfeeds',
                cardFeedNameDescription: 'Gib dem Kartenfeed einen eindeutigen Namen, damit du ihn von den anderen unterscheiden kannst.',
                cardFeedTransaction: 'Transaktionen löschen',
                cardFeedTransactionDescription: 'Lege fest, ob Karteninhaber Kartenumsätze löschen können. Neue Umsätze folgen diesen Regeln.',
                cardFeedRestrictDeletingTransaction: 'Löschen von Transaktionen einschränken',
                cardFeedAllowDeletingTransaction: 'Löschen von Transaktionen erlauben',
                removeCardFeed: 'Kartenfeed entfernen',
                removeCardFeedTitle: (feedName: string) => `${feedName}-Feed entfernen`,
                removeCardFeedDescription: 'Möchtest du diesen Karten-Feed wirklich entfernen? Dadurch werden alle Karten zugewiesen.',
                error: {
                    feedNameRequired: 'Kartenfeed-Name ist erforderlich',
                    statementCloseDateRequired: 'Bitte wähle ein Abschlussdatum für den Kontoauszug aus.',
                },
                corporate: 'Löschen von Transaktionen einschränken',
                personal: 'Löschen von Transaktionen erlauben',
                setFeedNameDescription: 'Gib dem Kartenfeed einen eindeutigen Namen, damit du ihn von den anderen unterscheiden kannst',
                setTransactionLiabilityDescription: 'Wenn aktiviert, können Karteninhaber Kartentransaktionen löschen. Neue Transaktionen folgen dieser Regel.',
                emptyAddedFeedTitle: 'Keine Karten in diesem Feed',
                emptyAddedFeedDescription: 'Stellen Sie sicher, dass im Karten-Feed Ihrer Bank Karten vorhanden sind.',
                pendingFeedTitle: `Wir prüfen Ihre Anfrage …`,
                pendingFeedDescription: `Wir überprüfen derzeit Ihre Feed-Details. Sobald das erledigt ist, werden wir Sie kontaktieren über`,
                pendingBankTitle: 'Überprüfe dein Browserfenster',
                pendingBankDescription: (bankName: string) =>
                    `Bitte stellen Sie über das Browserfenster, das sich gerade geöffnet hat, eine Verbindung zu ${bankName} her. Falls sich kein Fenster geöffnet hat,`,
                pendingBankLink: 'bitte hier klicken',
                giveItNameInstruction: 'Gib der Karte einen Namen, der sie von anderen abhebt.',
                updating: 'Aktualisierung läuft ...',
                neverUpdated: 'Nie',
                noAccountsFound: 'Keine Konten gefunden',
                defaultCard: 'Standardkarte',
                downgradeTitle: `Arbeitsbereich kann nicht herabgestuft werden`,
                downgradeSubTitle: `Dieser Workspace kann nicht herabgestuft werden, da mehrere Karten-Feeds verbunden sind (außer Expensify Cards). Bitte <a href="#">nur einen Karten-Feed behalten</a>, um fortzufahren.`,
                noAccountsFoundDescription: (connection: string) => `Bitte füge das Konto in ${connection} hinzu und synchronisiere die Verbindung erneut`,
                expensifyCardBannerTitle: 'Expensify Card bestellen',
                expensifyCardBannerSubtitle:
                    'Profitiere von Cashback bei jedem Einkauf in den USA, bis zu 50 % Rabatt auf deine Expensify-Rechnung, unbegrenzt viele virtuelle Karten und vieles mehr.',
                expensifyCardBannerLearnMoreButton: 'Mehr erfahren',
                statementCloseDateTitle: 'Abrechnungsabschlussdatum',
                statementCloseDateDescription: 'Teile uns mit, wann dein Kartenkontoauszug abgeschlossen wird, und wir erstellen einen passenden Auszug in Expensify.',
            },
            workflows: {
                title: 'Workflows',
                subtitle: 'Konfiguriere, wie Ausgaben genehmigt und bezahlt werden.',
                disableApprovalPrompt:
                    'Expensify Cards aus diesem Workspace verwenden derzeit Genehmigungen, um ihre Smart Limits festzulegen. Bitte ändere die Limitarten aller Expensify Cards mit Smart Limits, bevor du Genehmigungen deaktivierst.',
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
                subtitle: 'Dokumentiere und fordere erstattungsfähige Steuern zurück.',
            },
            reportFields: {
                title: 'Berichts­felder',
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
                featureEnabledText: 'Um diese Funktion zu aktivieren oder zu deaktivieren, musst du deine Einstellungen für den Buchhaltungsimport ändern.',
                disconnectText: 'Um die Buchhaltung zu deaktivieren, musst du die Buchhaltungsverbindung von deinem Arbeitsbereich trennen.',
                manageSettings: 'Einstellungen verwalten',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Uber-Verknüpfung trennen',
                disconnectText: 'Um diese Funktion zu deaktivieren, trenne bitte zuerst die Uber for Business-Integration.',
                description: 'Möchtest du diese Integration wirklich trennen?',
                confirmText: 'Verstanden',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Nicht so schnell …',
                featureEnabledText:
                    'Expensify Cards in diesem Workspace verwenden Genehmigungs-Workflows, um ihre Smart Limits festzulegen.\n\nBitte ändere die Limittypen aller Karten mit Smart Limits, bevor du Workflows deaktivierst.',
                confirmText: 'Zu Expensify Cards gehen',
            },
            rules: {
                title: 'Regeln',
                subtitle: 'Belege anfordern, hohe Ausgaben kennzeichnen und mehr.',
            },
            timeTracking: {title: 'Zeit', subtitle: 'Legen Sie einen abrechenbaren Stundensatz fest, damit Mitarbeitende für ihre Zeit bezahlt werden.'},
        },
        reports: {
            reportsCustomTitleExamples: 'Beispiele:',
            customReportNamesSubtitle: `<muted-text>Pass die Berichtstitel mit unseren <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">umfangreichen Formeln</a> an.</muted-text>`,
            customNameTitle: 'Standardmäßiger Berichtstitel',
            customNameDescription: `Wähle einen individuellen Namen für Spesenabrechnungen, indem du unsere <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">umfangreichen Formeln</a> verwendest.`,
            customNameInputLabel: 'Name',
            customNameEmailPhoneExample: 'E-Mail-Adresse oder Telefonnummer des Mitglieds: {report:submit:from}',
            customNameStartDateExample: 'Berichtsanfang: {report:startdate}',
            customNameWorkspaceNameExample: 'Workspace-Name: {report:workspacename}',
            customNameReportIDExample: 'Berichts-ID: {report:id}',
            customNameTotalExample: 'Gesamt: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Verhindern, dass Mitglieder benutzerdefinierte Berichtstitel ändern',
        },
        reportFields: {
            addField: 'Feld hinzufügen',
            delete: 'Feld löschen',
            deleteFields: 'Felder löschen',
            findReportField: 'Berichtsfeld finden',
            deleteConfirmation: 'Möchtest du dieses Berichtsfeld wirklich löschen?',
            deleteFieldsConfirmation: 'Bist du sicher, dass du diese Berichtsfelder löschen möchtest?',
            emptyReportFields: {
                title: 'Sie haben keine Berichts­felder erstellt',
                subtitle: 'Füge ein benutzerdefiniertes Feld (Text, Datum oder Dropdown) hinzu, das in Berichten erscheint.',
            },
            subtitle: 'Berichtsfelder gelten für alle Ausgaben und können hilfreich sein, wenn du nach zusätzlichen Informationen fragen möchtest.',
            disableReportFields: 'Berichts­felder deaktivieren',
            disableReportFieldsConfirmation: 'Bist du sicher? Text- und Datumsfelder werden gelöscht und Listen werden deaktiviert.',
            importedFromAccountingSoftware: 'Die folgenden Berichtsfelder werden importiert aus Ihrer/Ihrem',
            textType: 'Text',
            dateType: 'Datum',
            dropdownType: 'Liste',
            formulaType: 'Formel',
            textAlternateText: 'Füge ein Feld für freie Texteingabe hinzu.',
            dateAlternateText: 'Füge einen Kalender zur Datumsauswahl hinzu.',
            dropdownAlternateText: 'Füge eine Liste von Auswahlmöglichkeiten hinzu.',
            formulaAlternateText: 'Füge ein Formelfeld hinzu.',
            nameInputSubtitle: 'Wähle einen Namen für das Berichtsfeld.',
            typeInputSubtitle: 'Wählen Sie aus, welchen Typ von Berichtsfeld Sie verwenden möchten.',
            initialValueInputSubtitle: 'Gib einen Startwert ein, der im Berichtsfeld angezeigt wird.',
            listValuesInputSubtitle: 'Diese Werte werden im Dropdown-Menü für das Berichts­feld angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            listInputSubtitle: 'Diese Werte erscheinen in der Feldliste Ihres Berichts. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            deleteValue: 'Wert löschen',
            deleteValues: 'Werte löschen',
            disableValue: 'Wert deaktivieren',
            disableValues: 'Werte deaktivieren',
            enableValue: 'Wert aktivieren',
            enableValues: 'Werte aktivieren',
            emptyReportFieldsValues: {
                title: 'Sie haben noch keine Listenwerte erstellt',
                subtitle: 'Füge benutzerdefinierte Werte hinzu, die in Berichten angezeigt werden.',
            },
            deleteValuePrompt: 'Sind Sie sicher, dass Sie diesen Listenwert löschen möchten?',
            deleteValuesPrompt: 'Möchtest du diese Listenwerte wirklich löschen?',
            listValueRequiredError: 'Bitte gib einen Listenwertnamen ein',
            existingListValueError: 'Ein Listenwert mit diesem Namen ist bereits vorhanden',
            editValue: 'Wert bearbeiten',
            listValues: 'Werte auflisten',
            addValue: 'Wert hinzufügen',
            existingReportFieldNameError: 'Ein Berichtsfeld mit diesem Namen ist bereits vorhanden',
            reportFieldNameRequiredError: 'Bitte gib einen Berichts-Feldnamen ein',
            reportFieldTypeRequiredError: 'Bitte wählen Sie einen Berichtsfeldtyp aus',
            circularReferenceError: 'Dieses Feld kann nicht auf sich selbst verweisen. Bitte aktualisieren.',
            reportFieldInitialValueRequiredError: 'Bitte wähle einen Anfangswert für das Berichtsfeld',
            genericFailureMessage: 'Beim Aktualisieren des Berichtsfelds ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        tags: {
            tagName: 'Tag-Name',
            requiresTag: 'Mitglieder müssen alle Ausgaben taggen',
            trackBillable: 'Abrechenbare Ausgaben nachverfolgen',
            customTagName: 'Benutzerdefinierter Tag-Name',
            enableTag: 'Tag aktivieren',
            enableTags: 'Tags aktivieren',
            requireTag: 'Tag erforderlich',
            requireTags: 'Tags erforderlich',
            notRequireTags: 'Nicht erforderlich',
            disableTag: 'Tag deaktivieren',
            disableTags: 'Tags deaktivieren',
            addTag: 'Tag hinzufügen',
            editTag: 'Tag bearbeiten',
            editTags: 'Tags bearbeiten',
            findTag: 'Tag suchen',
            subtitle: 'Tags bieten detailliertere Möglichkeiten, Kosten zu klassifizieren.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>Sie verwenden <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">abhängige Tags</a>. Sie können eine <a href="${importSpreadsheetLink}">Tabelle erneut importieren</a>, um Ihre Tags zu aktualisieren.</muted-text>`,
            emptyTags: {
                title: 'Sie haben noch keine Tags erstellt',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Füge ein Tag hinzu, um Projekte, Standorte, Abteilungen und mehr zu verfolgen.',
                subtitleHTML: `<muted-text><centered-text>Fügen Sie Tags hinzu, um Projekte, Standorte, Abteilungen und mehr zu verfolgen. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Erfahren Sie mehr</a> über das Formatieren von Tag-Dateien für den Import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Ihre Tags werden derzeit über eine Buchhaltungsanbindung importiert. Gehen Sie zu <a href="${accountingPageURL}">Buchhaltung</a>, um Änderungen vorzunehmen.</centered-text></muted-text>`,
            },
            deleteTag: 'Tag löschen',
            deleteTags: 'Tags löschen',
            deleteTagConfirmation: 'Möchtest du dieses Tag wirklich löschen?',
            deleteTagsConfirmation: 'Sind Sie sicher, dass Sie diese Tags löschen möchten?',
            deleteFailureMessage: 'Beim Löschen des Tags ist ein Fehler aufgetreten, bitte versuche es erneut',
            tagRequiredError: 'Tagname ist erforderlich',
            existingTagError: 'Ein Tag mit diesem Namen existiert bereits',
            invalidTagNameError: 'Der Tag-Name darf nicht 0 sein. Bitte wähle einen anderen Wert.',
            genericFailureMessage: 'Beim Aktualisieren des Tags ist ein Fehler aufgetreten, bitte versuche es erneut',
            importedFromAccountingSoftware: 'Die folgenden Tags werden importiert von deinem',
            glCode: 'Sachkonto-Code',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des Hauptbuchcodes ist ein Fehler aufgetreten, bitte versuche es erneut.',
            tagRules: 'Tag-Regeln',
            approverDescription: 'Genehmigende Person',
            importTags: 'Tags importieren',
            importTagsSupportingText: 'Kategorisiere deine Ausgaben mit einem Tag oder mit mehreren.',
            configureMultiLevelTags: 'Konfiguriere deine Tag-Liste für mehrstufiges Tagging.',
            importMultiLevelTagsSupportingText: `Hier ist eine Vorschau deiner Tags. Wenn alles gut aussieht, klicke unten, um sie zu importieren.`,
            importMultiLevelTags: {
                firstRowTitle: 'Die erste Zeile ist die Überschrift für jede Tag-Liste',
                independentTags: 'Dies sind unabhängige Tags',
                glAdjacentColumn: 'In der angrenzenden Spalte befindet sich ein Hauptbuchcode (GL-Code).',
            },
            tagLevel: {
                singleLevel: 'Einstufige Tags',
                multiLevel: 'Mehrstufige Tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Tag-Ebenen wechseln',
                prompt1: 'Das Wechseln der Tag-Ebenen löscht alle aktuellen Tags.',
                prompt2: 'Wir empfehlen Ihnen zuerst',
                prompt3: 'Sicherung herunterladen',
                prompt4: 'indem Sie Ihre Tags exportieren.',
                prompt5: 'Mehr erfahren',
                prompt6: 'über Tag-Ebenen.',
            },
            overrideMultiTagWarning: {
                title: 'Tags importieren',
                prompt1: 'Bist du sicher?',
                prompt2: 'Die vorhandenen Tags werden überschrieben, aber Sie können',
                prompt3: 'Sicherung herunterladen',
                prompt4: 'zuerst.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `Wir haben *${columnCounts} Spalten* in Ihrer Tabelle gefunden. Wählen Sie *Name* neben der Spalte aus, die die Tags-Namen enthält. Sie können auch *Aktiviert* neben der Spalte auswählen, die den Tags-Status festlegt.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Es können nicht alle Tags gelöscht oder deaktiviert werden',
                description: `Mindestens ein Tag muss aktiviert bleiben, da dein Workspace Tags erfordert.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Alle Tags können nicht optional gemacht werden',
                description: `Mindestens ein Tag muss erforderlich bleiben, da Ihre Workspace-Einstellungen Tags vorschreiben.`,
            },
            cannotMakeTagListRequired: {
                title: 'Tagliste kann nicht als erforderlich festgelegt werden',
                description: 'Sie können eine Tagliste nur erforderlich machen, wenn in Ihrer Richtlinie mehrere Taguebenen konfiguriert sind.',
            },
            tagCount: () => ({
                one: '1 Tag',
                other: (count: number) => `${count} Tage`,
            }),
        },
        taxes: {
            subtitle: 'Steuernamen und -sätze hinzufügen und Standardwerte festlegen.',
            addRate: 'Rate hinzufügen',
            workspaceDefault: 'Standardwährung des Arbeitsbereichs',
            foreignDefault: 'Standardwährung für Fremdwährungen',
            customTaxName: 'Benutzerdefinierter Steuername',
            value: 'Wert',
            taxReclaimableOn: 'Steuererstattungsfähig auf',
            taxRate: 'Steuersatz',
            findTaxRate: 'Steuersatz finden',
            error: {
                taxRateAlreadyExists: 'Dieser Steuername wird bereits verwendet',
                taxCodeAlreadyExists: 'Dieser Steuerschlüssel wird bereits verwendet',
                valuePercentageRange: 'Bitte gib einen gültigen Prozentsatz zwischen 0 und 100 ein',
                customNameRequired: 'Individueller Steuername ist erforderlich',
                deleteFailureMessage: 'Beim Löschen des Steuersatzes ist ein Fehler aufgetreten. Bitte versuche es erneut oder bitte Concierge um Hilfe.',
                updateFailureMessage: 'Beim Aktualisieren des Steuersatzes ist ein Fehler aufgetreten. Bitte versuche es erneut oder bitte Concierge um Hilfe.',
                createFailureMessage: 'Beim Erstellen des Steuersatzes ist ein Fehler aufgetreten. Bitte versuche es erneut oder bitte Concierge um Hilfe.',
                updateTaxClaimableFailureMessage: 'Der erstattungsfähige Anteil muss geringer sein als der Distanzpauschalbetrag',
            },
            deleteTaxConfirmation: 'Möchten Sie diese Steuer wirklich löschen?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Möchten Sie ${taxAmount} Steuern wirklich löschen?`,
            actions: {
                delete: 'Satz löschen',
                deleteMultiple: 'Sätze löschen',
                enable: 'Kurs aktivieren',
                disable: 'Rate deaktivieren',
                enableTaxRates: () => ({
                    one: 'Kurs aktivieren',
                    other: 'Tarife aktivieren',
                }),
                disableTaxRates: () => ({
                    one: 'Rate deaktivieren',
                    other: 'Tarife deaktivieren',
                }),
            },
            importedFromAccountingSoftware: 'Die folgenden Steuern werden importiert von Ihrer',
            taxCode: 'Steuerschlüssel',
            updateTaxCodeFailureMessage: 'Beim Aktualisieren des Steuercodes ist ein Fehler aufgetreten, bitte versuche es erneut.',
        },
        duplicateWorkspace: {
            title: 'Benennen Sie Ihren neuen Workspace',
            selectFeatures: 'Zu kopierende Funktionen auswählen',
            whichFeatures: 'Welche Funktionen möchtest du in deinen neuen Workspace übernehmen?',
            confirmDuplicate: 'Möchtest du fortfahren?',
            categories: 'Kategorien und deine Regeln zur automatischen Kategorisierung',
            reimbursementAccount: 'Erstattungskonto',
            welcomeNote: 'Bitte verwenden Sie meinen neuen Arbeitsbereich',
            delayedSubmission: 'verspätete Einreichung',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Sie sind dabei, ${newWorkspaceName ?? ''} zu erstellen und mit ${totalMembers ?? 0} Mitgliedern aus dem ursprünglichen Arbeitsbereich zu teilen.`,
            error: 'Beim Duplizieren deines neuen Arbeitsbereichs ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        emptyWorkspace: {
            title: 'Sie haben keine Arbeitsbereiche',
            subtitle: 'Belege erfassen, Ausgaben erstatten, Reisen verwalten, Rechnungen versenden und mehr.',
            createAWorkspaceCTA: 'Loslegen',
            features: {
                trackAndCollect: 'Belege nachverfolgen und sammeln',
                reimbursements: 'Mitarbeitende erstatten',
                companyCards: 'Firmenkarten verwalten',
            },
            notFound: 'Kein Arbeitsbereich gefunden',
            description:
                'Räume sind ein großartiger Ort, um sich mit mehreren Personen zu unterhalten und zusammenzuarbeiten. Erstelle oder tritt einem Arbeitsplatz bei, um mit der Zusammenarbeit zu beginnen',
        },
        new: {
            newWorkspace: 'Neuer Workspace',
            getTheExpensifyCardAndMore: 'Hol dir die Expensify Card und mehr',
            confirmWorkspace: 'Workspace bestätigen',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mein Gruppenarbeitsbereich${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `${userName}s Workspace${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Beim Entfernen eines Mitglieds aus dem Workspace ist ein Fehler aufgetreten, bitte versuche es erneut.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Möchtest du ${memberName} wirklich entfernen?`,
                other: 'Bist du sicher, dass du diese Mitglieder entfernen möchtest?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} ist Genehmiger:in in diesem Workspace. Wenn du diesen Workspace nicht mehr mit dieser Person teilst, ersetzen wir sie im Genehmigungsworkflow durch die/den Workspace-Eigentümer:in ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Mitglied entfernen',
                other: 'Mitglieder entfernen',
            }),
            findMember: 'Mitglied finden',
            removeWorkspaceMemberButtonTitle: 'Aus dem Workspace entfernen',
            removeGroupMemberButtonTitle: 'Aus Gruppe entfernen',
            removeRoomMemberButtonTitle: 'Aus Chat entfernen',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Möchtest du ${memberName} wirklich entfernen?`,
            removeMemberTitle: 'Mitglied entfernen',
            transferOwner: 'Inhaberschaft übertragen',
            makeMember: () => ({
                one: 'Mitglied machen',
                other: 'Mitglieder erstellen',
            }),
            makeAdmin: () => ({
                one: 'Zum Admin machen',
                other: 'Zu Admins machen',
            }),
            makeAuditor: () => ({
                one: 'Zum Prüfer machen',
                other: 'Prüfer erstellen',
            }),
            selectAll: 'Alle auswählen',
            error: {
                genericAdd: 'Beim Hinzufügen dieses Workspace-Mitglieds ist ein Problem aufgetreten',
                cannotRemove: 'Du kannst dich selbst oder den Workspace-Eigentümer nicht entfernen',
                genericRemove: 'Beim Entfernen dieses Workspace-Mitglieds ist ein Problem aufgetreten',
            },
            addedWithPrimary: 'Einige Mitglieder wurden mit ihren primären Logins hinzugefügt.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Hinzugefügt durch sekundären Login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Gesamtanzahl der Workspace-Mitglieder: ${count}`,
            importMembers: 'Mitglieder importieren',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Wenn du ${approver} aus diesem Workspace entfernst, ersetzen wir diese Person im Genehmigungsworkflow durch ${workspaceOwner}, die/den Workspace-Inhaber·in.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} hat ausstehende Spesenberichte zur Genehmigung. Bitte bitten Sie die Person, diese zu genehmigen, oder übernehmen Sie die Kontrolle über ihre Berichte, bevor Sie sie aus dem Workspace entfernen.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Sie können ${memberName} nicht aus diesem Workspace entfernen. Bitte legen Sie unter Workflows > Zahlungen erstellen oder verfolgen eine:n neue:n Erstattungsverantwortliche:n fest und versuchen Sie es dann erneut.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Wenn du ${memberName} aus diesem Workspace entfernst, ersetzen wir sie bzw. ihn als bevorzugte:n Exporteur:in durch ${workspaceOwner}, den/die Workspace-Inhaber:in.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Wenn du ${memberName} aus diesem Workspace entfernst, ersetzen wir sie/ihn als technischen Kontakt durch ${workspaceOwner}, den Workspace-Inhaber.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} hat einen ausstehenden Verarbeitungsbericht, zu dem eine Aktion erforderlich ist. Bitte bitten Sie die Person, die erforderliche Aktion abzuschließen, bevor Sie sie aus dem Workspace entfernen.`,
        },
        card: {
            getStartedIssuing: 'Beginne, indem du deine erste virtuelle oder physische Karte ausstellst.',
            issueCard: 'Karte ausgeben',
            issueNewCard: {
                whoNeedsCard: 'Wer braucht eine Karte?',
                inviteNewMember: 'Neues Mitglied einladen',
                findMember: 'Mitglied finden',
                chooseCardType: 'Kartentyp auswählen',
                physicalCard: 'Physische Karte',
                physicalCardDescription: 'Ideal für Vielfachausgeber',
                virtualCard: 'Virtuelle Karte',
                virtualCardDescription: 'Sofort und flexibel',
                chooseLimitType: 'Wähle einen Limittyp',
                smartLimit: 'Smart Limit',
                smartLimitDescription: 'Bis zu einem bestimmten Betrag ausgeben, bevor eine Genehmigung erforderlich ist',
                monthly: 'Monatlich',
                monthlyDescription: 'Bis zu einem bestimmten Betrag pro Monat ausgeben',
                fixedAmount: 'Fester Betrag',
                fixedAmountDescription: 'Einmalig bis zu einem bestimmten Betrag ausgeben',
                setLimit: 'Limit festlegen',
                cardLimitError: 'Bitte gib einen Betrag unter 21.474.836 $ ein',
                giveItName: 'Gib ihm einen Namen',
                giveItNameInstruction: 'Mach es eindeutig genug, um es von anderen Karten zu unterscheiden. Konkrete Anwendungsfälle sind sogar noch besser!',
                cardName: 'Kartenname',
                letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
                willBeReadyToUse: 'Diese Karte ist sofort einsatzbereit.',
                willBeReadyToShip: 'Diese Karte ist sofort versandbereit.',
                cardholder: 'Karteninhaber',
                cardType: 'Kartentyp',
                limit: 'Limit',
                limitType: 'Limittyp',
                disabledApprovalForSmartLimitError: 'Bitte aktiviere Genehmigungen unter <strong>Workflows > Genehmigungen hinzufügen</strong>, bevor du Smart Limits einrichtest',
            },
            deactivateCardModal: {
                deactivate: 'Deaktivieren',
                deactivateCard: 'Karte deaktivieren',
                deactivateConfirmation: 'Wenn Sie diese Karte deaktivieren, werden alle zukünftigen Transaktionen abgelehnt und dies kann nicht rückgängig gemacht werden.',
            },
        },
        accounting: {
            settings: 'Einstellungen',
            title: 'Verbindungen',
            subtitle: 'Verbinde dein Buchhaltungssystem, um Transaktionen mit deinem Kontenplan zu kodieren, Zahlungen automatisch abzugleichen und deine Finanzen synchron zu halten.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chatte mit deiner Einrichtungsfachkraft.',
            talkYourAccountManager: 'Chatte mit deiner Kundenbetreuung.',
            talkToConcierge: 'Chat mit Concierge.',
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
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `In Expensify Classic ist ein Fehler mit einer eingerichteten Verbindung aufgetreten. [Wechsle zu Expensify Classic, um dieses Problem zu beheben.](${oldDotPolicyConnectionsURL})`,
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
            connectTitle: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'Buchhaltungsintegration'} verbinden`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Verbindung zu QuickBooks Online kann nicht hergestellt werden';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Verbindung mit Xero nicht möglich';
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
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Als Berichtsfelder importiert',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Standardwert für NetSuite-Mitarbeiter',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'diese Integration';
                return `Möchten Sie ${integrationName} wirklich trennen?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Sind Sie sicher, dass Sie ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'diese Buchhaltungsintegration'} verbinden möchten? Dadurch werden alle bestehenden Buchhaltungsverbindungen entfernt.`,
            enterCredentials: 'Gib deine Zugangsdaten ein',
            claimOffer: {
                badgeText: 'Angebot verfügbar!',
                xero: {
                    headline: 'Hol dir Xero 6 Monate lang kostenlos!',
                    description: '<muted-text><centered-text>Neu bei Xero? Expensify-Kunden erhalten 6 Monate gratis. Fordern Sie Ihr Angebot unten an.</centered-text></muted-text>',
                    connectButton: 'Mit Xero verbinden',
                },
                uber: {
                    headerTitle: 'Uber for Business',
                    headline: 'Erhalte 5 % Rabatt auf Uber-Fahrten',
                    description: `<muted-text><centered-text>Aktiviere Uber for Business über Expensify und spare 5 % auf alle Geschäftsfahrten bis Juni. <a href="${CONST.UBER_TERMS_LINK}">Es gelten die Nutzungsbedingungen.</a></centered-text></muted-text>`,
                    connectButton: 'Mit Uber for Business verbinden',
                },
            },
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Kunden werden importiert';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Mitarbeitende werden importiert';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Konten werden importiert';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Kategorien importieren';
                        case 'quickbooksOnlineImportLocations':
                            return 'Standorte werden importiert';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Importierte Daten werden verarbeitet';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Synchronisation erstatteter Berichte und Rechnungszahlungen';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Steuercodes werden importiert';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Verbindung zu QuickBooks Online wird überprüft';
                        case 'quickbooksOnlineImportMain':
                            return 'QuickBooks-Online-Daten werden importiert';
                        case 'startingImportXero':
                            return 'Xero-Daten werden importiert';
                        case 'startingImportQBO':
                            return 'QuickBooks-Online-Daten werden importiert';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importieren von QuickBooks Desktop-Daten';
                        case 'quickbooksDesktopImportTitle':
                            return 'Titel wird importiert';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Zertifikat zum Genehmigen wird importiert';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Dimensionen werden importiert';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Sparrichtlinie wird importiert';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Daten werden noch mit QuickBooks synchronisiert … Bitte stelle sicher, dass der Web Connector ausgeführt wird';
                        case 'quickbooksOnlineSyncTitle':
                            return 'QuickBooks Online-Daten werden synchronisiert';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Daten werden geladen';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Kategorien werden aktualisiert';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Kunden/Projekte werden aktualisiert';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Personenliste wird aktualisiert';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Berichts­felder aktualisieren';
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
                            return 'Xero-Rechnungen und -Gutschriften als bezahlt markieren';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Verfolge-Kategorien werden synchronisiert';
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
                            return 'Kunden werden importiert';
                        case 'netSuiteSyncInitData':
                            return 'Daten werden aus NetSuite abgerufen';
                        case 'netSuiteSyncImportTaxes':
                            return 'Steuern importieren';
                        case 'netSuiteSyncImportItems':
                            return 'Elemente werden importiert';
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
                            return 'Sage-Intacct-Verbindung wird überprüft';
                        case 'intacctImportDimensions':
                            return 'Sage-Intacct-Dimensionen werden importiert';
                        case 'intacctImportTitle':
                            return 'Sage-Intacct-Daten importieren';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Übersetzung fehlt für Stufe: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Bevorzugtes Exportformat',
            exportPreferredExporterNote:
                'Die bevorzugte exportierende Person kann jede:r Workspace-Admin sein, muss aber auch Domain-Admin sein, wenn du in den Domaineinstellungen für einzelne Firmenkarten unterschiedliche Exportkonten festlegst.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur in seinem Konto Berichte zum Export.',
            exportAs: 'Exportieren als',
            exportOutOfPocket: 'Auslagen exportieren als',
            exportCompanyCard: 'Exportiere Firmenkartenausgaben als',
            exportDate: 'Exportdatum',
            defaultVendor: 'Standardlieferant',
            autoSync: 'Automatische Synchronisierung',
            autoSyncDescription: 'Synchronisiere NetSuite und Expensify automatisch, jeden Tag. Exportiere abgeschlossene Berichte in Echtzeit',
            reimbursedReports: 'Erstattete Berichte synchronisieren',
            cardReconciliation: 'Kartenabstimmung',
            reconciliationAccount: 'Abstimmkonto',
            continuousReconciliation: 'Kontinuierlicher Abgleich',
            saveHoursOnReconciliation:
                'Sparen Sie in jedem Abrechnungszeitraum Stunden bei der Abstimmung, indem Expensify fortlaufend Expensify-Kartenabrechnungen und -Auszahlungen automatisch für Sie abstimmt.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Um die kontinuierliche Abstimmung zu aktivieren, aktiviere bitte für ${connectionName} die <a href="${accountingAdvancedSettingsLink}">automatische Synchronisierung</a>.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wähle das Bankkonto aus, mit dem deine Expensify-Card-Zahlungen abgeglichen werden.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Stellen Sie sicher, dass dieses Konto mit Ihrem <a href="${settlementAccountUrl}">Expensify Card-Abwicklungskonto</a> (endet auf ${lastFourPAN}) übereinstimmt, damit die fortlaufende Abstimmung ordnungsgemäß funktioniert.`,
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
            invoicingDetailsDescription: 'Diese Informationen werden auf deinen Rechnungen erscheinen.',
            companyName: 'Firmenname',
            companyWebsite: 'Unternehmenswebsite',
            paymentMethods: {
                personal: 'Persönlich',
                business: 'Geschäft',
                chooseInvoiceMethod: 'Wähle unten eine Zahlungsmethode aus:',
                payingAsIndividual: 'Als Privatperson bezahlen',
                payingAsBusiness: 'Als Unternehmen bezahlen',
            },
            invoiceBalance: 'Rechnungsbetrag',
            invoiceBalanceSubtitle:
                'Dies ist Ihr aktuelles Guthaben aus eingegangenen Rechnungszahlungen. Es wird automatisch auf Ihr Bankkonto überwiesen, wenn Sie eines hinzugefügt haben.',
            bankAccountsSubtitle: 'Füge ein Bankkonto hinzu, um Rechnungszahlungen zu senden und zu empfangen.',
        },
        invite: {
            member: 'Mitglied einladen',
            members: 'Mitglieder einladen',
            invitePeople: 'Neue Mitglieder einladen',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Workspace ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            pleaseEnterValidLogin: `Bitte stelle sicher, dass die E-Mail-Adresse oder Telefonnummer gültig ist (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'Benutzer',
            users: 'Nutzer',
            invited: 'eingeladen',
            removed: 'entfernt',
            to: 'bis',
            from: 'von',
        },
        inviteMessage: {
            confirmDetails: 'Details bestätigen',
            inviteMessagePrompt: 'Mach deine Einladung besonders persönlich, indem du unten eine Nachricht hinzufügst!',
            personalMessagePrompt: 'Nachricht',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Workspace ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            inviteNoMembersError: 'Bitte wähle mindestens ein Mitglied zum Einladen aus',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} hat beantragt, ${workspaceName} beizutreten`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ups! Nicht so schnell …',
            workspaceNeeds: 'Ein Workspace benötigt mindestens einen aktivierten Entfernungssatz.',
            distance: 'Entfernung',
            centrallyManage: 'Tarife zentral verwalten, in Meilen oder Kilometern nachverfolgen und eine Standardkategorie festlegen.',
            rate: 'Bewerten',
            addRate: 'Rate hinzufügen',
            findRate: 'Kurs finden',
            trackTax: 'Steuern verfolgen',
            deleteRates: () => ({
                one: 'Satz löschen',
                other: 'Sätze löschen',
            }),
            enableRates: () => ({
                one: 'Kurs aktivieren',
                other: 'Tarife aktivieren',
            }),
            disableRates: () => ({
                one: 'Rate deaktivieren',
                other: 'Tarife deaktivieren',
            }),
            enableRate: 'Kurs aktivieren',
            status: 'Status',
            unit: 'Einheit',
            taxFeatureNotEnabledMessage:
                '<muted-text>Steuern müssen im Workspace aktiviert sein, um diese Funktion zu verwenden. Gehe zu <a href="#">Weitere Funktionen</a>, um dies zu ändern.</muted-text>',
            deleteDistanceRate: 'Entfernungssatz löschen',
            areYouSureDelete: () => ({
                one: 'Möchtest du diesen Satz wirklich löschen?',
                other: 'Möchtest du diese Tarife wirklich löschen?',
            }),
            errors: {
                rateNameRequired: 'Tarifname ist erforderlich',
                existingRateName: 'Eine Entfernungsrate mit diesem Namen existiert bereits',
            },
        },
        editor: {
            descriptionInputLabel: 'Beschreibung',
            nameInputLabel: 'Name',
            typeInputLabel: 'Typ',
            initialValueInputLabel: 'Anfangswert',
            nameInputHelpText: 'Dies ist der Name, den du in deinem Arbeitsbereich siehst.',
            nameIsRequiredError: 'Du musst deinem Workspace einen Namen geben',
            currencyInputLabel: 'Standardwährung',
            currencyInputHelpText: 'Alle Ausgaben in diesem Workspace werden in diese Währung umgerechnet.',
            currencyInputDisabledText: (currency: string) => `Die Standardwährung kann nicht geändert werden, da dieser Arbeitsbereich mit einem ${currency}-Bankkonto verknüpft ist.`,
            save: 'Speichern',
            genericFailureMessage: 'Beim Aktualisieren des Arbeitsbereichs ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            addressContext: 'Für die Aktivierung von Expensify Travel ist eine Workspace-Adresse erforderlich. Bitte gib eine Adresse ein, die mit deinem Unternehmen verknüpft ist.',
            policy: 'Spesenrichtlinie',
        },
        bankAccount: {
            continueWithSetup: 'Einrichtung fortsetzen',
            youAreAlmostDone:
                'Du bist fast fertig mit der Einrichtung deines Bankkontos. Damit kannst du Firmenkarten ausgeben, Auslagen erstatten, Rechnungen einziehen und Rechnungen bezahlen.',
            streamlinePayments: 'Zahlungen optimieren',
            connectBankAccountNote: 'Hinweis: Persönliche Bankkonten können nicht für Zahlungen in Workspaces verwendet werden.',
            oneMoreThing: 'Noch eine Sache!',
            allSet: 'Du bist startklar!',
            accountDescriptionWithCards: 'Dieses Bankkonto wird verwendet, um Firmenkarten auszugeben, Auslagen zu erstatten, Rechnungen einzuziehen und Zahlungen zu leisten.',
            letsFinishInChat: 'Lass uns im Chat fertigstellen!',
            finishInChat: 'Im Chat abschließen',
            almostDone: 'Fast geschafft!',
            disconnectBankAccount: 'Bankkonto trennen',
            startOver: 'Neu beginnen',
            updateDetails: 'Details aktualisieren',
            yesDisconnectMyBankAccount: 'Ja, mein Bankkonto trennen',
            yesStartOver: 'Ja, neu starten',
            disconnectYourBankAccount: (bankName: string) => `Trenne dein <strong>${bankName}</strong>-Bankkonto. Ausstehende Transaktionen für dieses Konto werden trotzdem abgeschlossen.`,
            clearProgress: 'Neustart löscht den bisherigen Fortschritt.',
            areYouSure: 'Bist du sicher?',
            workspaceCurrency: 'Währungsraum-Währung',
            updateCurrencyPrompt:
                'Es sieht so aus, als wäre deine Arbeitsumgebung derzeit auf eine andere Währung als USD eingestellt. Bitte klicke auf die Schaltfläche unten, um deine Währung jetzt auf USD zu aktualisieren.',
            updateToUSD: 'Auf USD aktualisieren',
            updateWorkspaceCurrency: 'Währung des Arbeitsbereichs aktualisieren',
            workspaceCurrencyNotSupported: 'Arbeitsbereichswährung wird nicht unterstützt',
            yourWorkspace: `Dein Arbeitsbereich ist auf eine nicht unterstützte Währung eingestellt. Sieh dir die <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">Liste der unterstützten Währungen</a> an.`,
            chooseAnExisting: 'Wähle ein bestehendes Bankkonto zum Bezahlen von Ausgaben oder füge ein neues hinzu.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Inhaberschaft übertragen',
            addPaymentCardTitle: 'Gib deine Zahlungskarte ein, um die Inhaberschaft zu übertragen',
            addPaymentCardButtonText: 'Bedingungen akzeptieren & Zahlungskarte hinzufügen',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Lies und akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und die <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutz</a>richtlinie, um deine Karte hinzuzufügen.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS-konform',
            addPaymentCardBankLevelEncrypt: 'Verschlüsselung auf Bankniveau',
            addPaymentCardRedundant: 'Redundante Infrastruktur',
            addPaymentCardLearnMore: `<muted-text>Erfahre mehr über unsere <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">Sicherheit</a>.</muted-text>`,
            amountOwedTitle: 'Offener Saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Dieses Konto hat einen ausstehenden Saldo aus einem vorherigen Monat.\n\nMöchten Sie den Saldo ausgleichen und die Abrechnung für diesen Workspace übernehmen?',
            ownerOwesAmountTitle: 'Offener Saldo',
            ownerOwesAmountButtonText: 'Saldo übertragen',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `Das Konto, dem dieser Workspace gehört (${email}), hat einen offenen Saldo aus einem früheren Monat.

Möchtest du diesen Betrag (${amount}) überweisen, um die Abrechnung für diesen Workspace zu übernehmen? Deine Zahlungskarte wird sofort belastet.`,
            subscriptionTitle: 'Jahresabonnement übernehmen',
            subscriptionButtonText: 'Abonnement übertragen',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Wenn Sie diesen Workspace übernehmen, wird dessen jährliches Abonnement mit Ihrem aktuellen Abonnement zusammengeführt. Dadurch erhöht sich die Größe Ihres Abonnements um ${usersCount} Mitglieder, sodass Ihr neues Abonnement insgesamt ${finalCount} Mitglieder umfasst. Möchten Sie fortfahren?`,
            duplicateSubscriptionTitle: 'Warnung: Doppelte Abonnements',
            duplicateSubscriptionButtonText: 'Weiter',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Es sieht so aus, als ob du versuchen möchtest, die Abrechnung für die Workspaces von ${email} zu übernehmen. Dafür musst du jedoch zuerst Administrator*in in allen diesen Workspaces sein.

Klicke auf „Weiter“, wenn du die Abrechnung nur für den Workspace ${workspaceName} übernehmen möchtest.

Wenn du die Abrechnung für ihr gesamtes Abonnement übernehmen möchtest, bitte sie zuerst, dich in allen ihren Workspaces als Administrator*in hinzuzufügen, bevor du die Abrechnung übernimmst.`,
            hasFailedSettlementsTitle: 'Besitzübertragung nicht möglich',
            hasFailedSettlementsButtonText: 'Verstanden',
            hasFailedSettlementsText: (email: string) =>
                `Sie können die Abrechnung nicht übernehmen, weil ${email} einen überfälligen Expensify Card-Ausgleich hat. Bitten Sie diese Person, sich zur Klärung des Problems an concierge@expensify.com zu wenden. Danach können Sie die Abrechnung für diesen Workspace übernehmen.`,
            failedToClearBalanceTitle: 'Kontostand konnte nicht ausgeglichen werden',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Wir konnten den Saldo nicht ausgleichen. Bitte versuche es später erneut.',
            successTitle: 'Juhu! Alles erledigt.',
            successDescription: 'Sie sind jetzt Eigentümer:in dieses Arbeitsbereichs.',
            errorTitle: 'Ups! Nicht so schnell …',
            errorDescription: `<muted-text><centered-text>Beim Übertragen des Besitzes dieses Arbeitsbereichs ist ein Problem aufgetreten. Versuche es erneut oder <concierge-link>wende dich für Hilfe an Concierge</concierge-link>.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Vorsicht!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `Die folgenden Reports wurden bereits nach ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} exportiert:

${reportName}

Möchten Sie sie wirklich noch einmal exportieren?`,
            confirmText: 'Ja, erneut exportieren',
            cancelText: 'Abbrechen',
        },
        upgrade: {
            reportFields: {
                title: 'Berichts­felder',
                description: `Berichtsfelder ermöglichen es dir, Details auf Kopfzeilenebene anzugeben, im Unterschied zu Tags, die sich auf Ausgaben einzelner Positionen beziehen. Diese Details können spezifische Projektnamen, Informationen zu Geschäftsreisen, Standorte und mehr umfassen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Berichts­felder sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Profitiere von automatischer Synchronisierung und reduziere manuelle Eingaben mit der Expensify + NetSuite-Integration. Erhalte detaillierte Finanzinformationen in Echtzeit mit Unterstützung für native und benutzerdefinierte Segmente, einschließlich Projekt- und Kunden-Zuordnung.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere NetSuite-Integration ist nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Profitiere von automatischer Synchronisierung und reduziere manuelle Eingaben mit der Integration von Expensify + Sage Intacct. Gewinne detaillierte, nahezu in Echtzeit verfügbare Finanzanalysen mit benutzerdefinierten Dimensionen sowie Spesencodierung nach Abteilung, Klasse, Standort, Kunde und Projekt (Job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere Sage Intacct-Integration ist nur im Control-Tarif verfügbar, beginnend ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Profitiere von automatischer Synchronisierung und reduziere manuelle Eingaben mit der Integration von Expensify + QuickBooks Desktop. Erziele maximale Effizienz mit einer Echtzeit-Zwei-Wege-Verbindung und Spesencodierung nach Klasse, Artikel, Kunde und Projekt.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere QuickBooks Desktop-Integration ist nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Erweiterte Genehmigungen',
                description: `Wenn du weitere Genehmigungsebenen hinzufügen möchtest – oder einfach sicherstellen willst, dass die größten Ausgaben noch einmal überprüft werden – bist du bei uns richtig. Erweiterte Genehmigungen helfen dir, auf jeder Ebene die richtigen Kontrollmechanismen einzurichten, damit du die Ausgaben deines Teams im Griff behältst.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Erweiterte Genehmigungen sind nur im Control-Tarif verfügbar, der bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`} beginnt</muted-text>`,
            },
            categories: {
                title: 'Kategorien',
                description: 'Kategorien helfen dir, Ausgaben zu verfolgen und zu organisieren. Verwende unsere Standardkategorien oder füge deine eigenen hinzu.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kategorien sind im Collect-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            glCodes: {
                title: 'Hauptbuchcodes',
                description: `Fügen Sie Ihren Kategorien und Tags Sachkonten-Codes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Lohnabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Hauptbuchcodes sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Hauptbuch- und Lohnabrechnungscodes',
                description: `Fügen Sie Ihren Kategorien Hauptbuch- und Lohnabrechnungscodes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Lohnabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Hauptbuch- und Lohnabrechnungscodes sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Steuercodes',
                description: `Fügen Sie Ihren Steuern Steuercodes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Gehaltssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Steuercodes sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            companyCards: {
                title: 'Unbegrenzte Firmenkarten',
                description: `Müssen Sie weitere Kartenfeeds hinzufügen? Schalten Sie unbegrenzt viele Firmenkarten frei, um Transaktionen von allen großen Kartenausstellern zu synchronisieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dies ist nur im Control-Tarif verfügbar, beginnend ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            rules: {
                title: 'Regeln',
                description: `Regeln laufen im Hintergrund und halten Ihre Ausgaben unter Kontrolle, damit Sie sich nicht um Kleinigkeiten kümmern müssen.

Verlangen Sie Spesendetails wie Belege und Beschreibungen, legen Sie Grenzen und Standardwerte fest und automatisieren Sie Genehmigungen und Zahlungen – alles an einem Ort.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Regeln sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            perDiem: {
                title: 'Tagegeld',
                description:
                    'Per Diem ist eine großartige Möglichkeit, Ihre täglichen Kosten konform und planbar zu halten, wenn Ihre Mitarbeitenden auf Reisen sind. Profitieren Sie von Funktionen wie individuellen Sätzen, Standardkategorien und detaillierteren Angaben wie Reisezielen und Untersätzen.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Tagesspesen sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            travel: {
                title: 'Reisen',
                description:
                    'Expensify Travel ist eine neue Plattform für die Buchung und Verwaltung von Geschäftsreisen, über die Mitglieder Unterkünfte, Flüge, Transportmittel und mehr buchen können.',
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
                    'Mehrstufige Tags helfen Ihnen, Ausgaben noch präziser zu verfolgen. Weisen Sie jeder Position mehrere Tags zu – etwa Abteilung, Kunde oder Kostenstelle –, um den vollständigen Kontext jeder Ausgabe zu erfassen. So sind detailliertere Berichte, Genehmigungs-Workflows und Buchhaltungsexporte möglich.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Mehrstufige Tags sind nur im Control-Abo verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Entfernungssätze',
                description: 'Erstelle und verwalte deine eigenen Sätze, verfolge Distanzen in Meilen oder Kilometern und lege Standardkategorien für Entfernungskosten fest.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Entfernungsraten sind im Collect-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            auditor: {
                title: 'Prüfer',
                description: 'Prüfer erhalten Nur-Lesezugriff auf alle Berichte für volle Transparenz und Überwachung der Compliance.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Prüfer sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
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
                `<muted-text>Führe ein Upgrade durch, um auf diese Funktion zuzugreifen, oder <a href="${subscriptionLink}">erfahre mehr</a> über unsere Pläne und Preise.</muted-text>`,
            upgradeToUnlock: 'Diese Funktion freischalten',
            completed: {
                headline: `Du hast deinen Workspace aktualisiert!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Sie haben ${policyName} erfolgreich auf den Control-Tarif hochgestuft! <a href="${subscriptionLink}">Abonnement ansehen</a> für weitere Details.</centered-text>`,
                categorizeMessage: `Du hast erfolgreich auf den Collect‑Tarif umgestellt. Jetzt kannst du deine Ausgaben kategorisieren!`,
                travelMessage: `Du hast erfolgreich auf den Collect‑Tarif upgegradet. Jetzt kannst du mit dem Buchen und Verwalten von Reisen beginnen!`,
                distanceRateMessage: `Du hast erfolgreich auf den Collect-Tarif upgegradet. Jetzt kannst du den Distanzsatz ändern!`,
                gotIt: 'Verstanden, danke',
                createdWorkspace: `Du hast einen Arbeitsbereich erstellt!`,
            },
            commonFeatures: {
                title: 'Wechsle zum Control-Tarif',
                note: 'Schalte unsere leistungsstärksten Funktionen frei, einschließlich:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Der Control-Tarif beginnt bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}. <a href="${learnMoreMethodsRoute}">Erfahre mehr</a> über unsere Tarife und Preise.</muted-text>`,
                    benefit1: 'Erweiterte Buchhaltungsanbindungen (NetSuite, Sage Intacct und mehr)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Genehmigungsworkflows mit mehreren Ebenen',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    toUpgrade: 'Zum Upgrade klicke',
                    selectWorkspace: 'wähle einen Workspace aus und ändere den Plantyp in',
                },
                upgradeWorkspaceWarning: `Arbeitsbereich kann nicht aktualisiert werden`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt:
                    'Ihr Unternehmen hat das Erstellen von Arbeitsbereichen eingeschränkt. Bitte wenden Sie sich an eine:n Admin, um Hilfe zu erhalten.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Auf den Collect-Tarif downgraden',
                note: 'Wenn du ein Downgrade durchführst, verlierst du den Zugriff auf diese und weitere Funktionen:',
                benefits: {
                    note: 'Für einen vollständigen Vergleich unserer Tarife, sieh dir unsere',
                    pricingPage: 'Preisseite',
                    confirm: 'Möchtest du wirklich ein Downgrade durchführen und deine Konfigurationen entfernen?',
                    warning: 'Dies kann nicht rückgängig gemacht werden.',
                    benefit1: 'Buchhaltungsverbindungen (außer QuickBooks Online und Xero)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Genehmigungsworkflows mit mehreren Ebenen',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    headsUp: 'Achtung!',
                    multiWorkspaceNote:
                        'Du musst alle deine Workspaces herabstufen, bevor deine erste monatliche Zahlung fällig wird, um ein Abonnement zum Collect-Tarif zu beginnen. Klicke',
                    selectStep: '> Wähle jeden Workspace aus > ändere den Plantyp zu',
                },
            },
            completed: {
                headline: 'Dein Arbeitsbereich wurde herabgestuft',
                description: 'Sie haben andere Arbeitsbereiche im Control-Tarif. Damit Ihnen der Collect-Tarif berechnet wird, müssen Sie alle Arbeitsbereiche herabstufen.',
                gotIt: 'Verstanden, danke',
            },
        },
        payAndDowngrade: {
            title: 'Bezahlen & Downgrade durchführen',
            headline: 'Ihre letzte Zahlung',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Ihre endgültige Rechnung für dieses Abonnement beträgt <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Sieh dir unten deine Aufschlüsselung für den ${date} an:`,
            subscription:
                'Achtung! Diese Aktion beendet dein Expensify-Abonnement, löscht diesen Workspace und entfernt alle Workspace-Mitglieder. Wenn du diesen Workspace behalten und nur dich selbst entfernen möchtest, lass zunächst eine andere Adminperson die Abrechnung übernehmen.',
            genericFailureMessage: 'Beim Bezahlen Ihrer Rechnung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        restrictedAction: {
            restricted: 'Eingeschränkt',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Aktionen im Workspace ${workspaceName} sind derzeit eingeschränkt`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Der/die Workspace-Inhaber·in ${workspaceOwnerName} muss die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Workspace-Aktivitäten freizuschalten.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Du musst die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Arbeitsbereichsaktivitäten freizuschalten.',
            addPaymentCardToUnlock: 'Füge eine Zahlungskarte hinzu, um freizuschalten!',
            addPaymentCardToContinueUsingWorkspace: 'Füge eine Zahlungsmethode hinzu, um diesen Workspace weiterhin zu nutzen',
            pleaseReachOutToYourWorkspaceAdmin: 'Wende dich bei Fragen bitte an deine Workspace-Admin.',
            chatWithYourAdmin: 'Mit deiner Adminperson chatten',
            chatInAdmins: 'Chat in #admins',
            addPaymentCard: 'Zahlungskarte hinzufügen',
            goToSubscription: 'Zu Abo wechseln',
        },
        rules: {
            individualExpenseRules: {
                title: 'Ausgaben',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Lege Ausgabenkontrollen und Standardwerte für einzelne Ausgaben fest. Du kannst auch Regeln für <a href="${categoriesPageLink}">Kategorien</a> und <a href="${tagsPageLink}">Tags</a> erstellen.</muted-text>`,
                receiptRequiredAmount: 'Erforderlicher Belegbetrag',
                receiptRequiredAmountDescription: 'Belege verlangen, wenn die Ausgaben diesen Betrag überschreiten, sofern dies nicht durch eine Kategorienregel außer Kraft gesetzt wird.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `Der Betrag darf nicht höher sein als der für detaillierte Belege erforderliche Betrag (${amount})`,
                itemizedReceiptRequiredAmount: 'Detaillierter Beleg erforderlicher Betrag',
                itemizedReceiptRequiredAmountDescription:
                    'Detaillierte Belege anfordern, wenn die Ausgaben diesen Betrag überschreiten, es sei denn, eine Kategorievorschrift hebt dies auf.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `Der Betrag darf nicht niedriger sein als der für reguläre Belege erforderliche Betrag (${amount})`,
                maxExpenseAmount: 'Maximaler Spesenbetrag',
                maxExpenseAmountDescription: 'Ausgaben markieren, die diesen Betrag überschreiten, sofern dies nicht durch eine Kategorienregel außer Kraft gesetzt wird.',
                maxAge: 'Maximales Alter',
                maxExpenseAge: 'Maximales Ausgabenalter',
                maxExpenseAgeDescription: 'Ausgaben markieren, die älter als eine bestimmte Anzahl von Tagen sind.',
                maxExpenseAgeDays: () => ({
                    one: '1 Tag',
                    other: (count: number) => `${count} Tage`,
                }),
                cashExpenseDefault: 'Standard für Barausgaben',
                cashExpenseDefaultDescription:
                    'Wählen Sie, wie Barauslagen erstellt werden sollen. Eine Ausgabe gilt als Barauslage, wenn sie keine importierte Firmenkartentransaktion ist. Dazu gehören manuell erstellte Ausgaben, Belege, Pauschalen, Entfernungs- und Zeitausgaben.',
                reimbursableDefault: 'Erstattungsfähig',
                reimbursableDefaultDescription: 'Auslagen werden meistens an Mitarbeitende zurückgezahlt',
                nonReimbursableDefault: 'Nicht erstattungsfähig',
                nonReimbursableDefaultDescription: 'Spesen werden gelegentlich an Mitarbeitende zurückgezahlt',
                alwaysReimbursable: 'Immer erstattungsfähig',
                alwaysReimbursableDescription: 'Auslagen werden immer an Mitarbeitende zurückgezahlt',
                alwaysNonReimbursable: 'Immer nicht erstattungsfähig',
                alwaysNonReimbursableDescription: 'Auslagen werden Mitarbeitenden niemals zurückerstattet',
                billableDefault: 'Standardmäßig berechenbar',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Wählen Sie, ob Bar- und Kreditkartenausgaben standardmäßig abrechenbar sein sollen. Abrechenbare Ausgaben werden in <a href="${tagsPageLink}">Tags</a> aktiviert oder deaktiviert.</muted-text>`,
                billable: 'Abrechenbar',
                billableDescription: 'Ausgaben werden meist an Kund:innen weiterberechnet',
                nonBillable: 'Nicht abrechenbar',
                nonBillableDescription: 'Auslagen werden gelegentlich an Kunden weiterberechnet',
                eReceipts: 'eBelege',
                eReceiptsHint: `E-Belege werden automatisch erstellt [für die meisten Kreditkartentransaktionen in USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Teilnehmernachverfolgung',
                attendeeTrackingHint: 'Verfolge die Pro‑Person‑Kosten für jede Ausgabe.',
                prohibitedDefaultDescription:
                    'Markiere alle Belege, auf denen Alkohol, Glücksspiel oder andere eingeschränkte Artikel erscheinen. Ausgaben mit Belegen, auf denen diese Positionen vorkommen, müssen manuell geprüft werden.',
                prohibitedExpenses: 'Unzulässige Ausgaben',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Nebenkosten im Hotel',
                gambling: 'Glücksspiel',
                tobacco: 'Tabak',
                adultEntertainment: 'Erwachsenenunterhaltung',
                requireCompanyCard: 'Firmenkarten für alle Einkäufe vorschreiben',
                requireCompanyCardDescription: 'Kennzeichne alle Barausgaben, einschließlich Kilometer- und Tagegeld.',
            },
            expenseReportRules: {
                title: 'Erweitert',
                subtitle: 'Automatisiere die Einhaltung von Spesenrichtlinien, Genehmigungen und Zahlungen.',
                preventSelfApprovalsTitle: 'Eigene Genehmigungen verhindern',
                preventSelfApprovalsSubtitle: 'Verhindere, dass Workspace-Mitglieder ihre eigenen Spesenabrechnungen genehmigen.',
                autoApproveCompliantReportsTitle: 'Konforme Berichte automatisch genehmigen',
                autoApproveCompliantReportsSubtitle: 'Legen Sie fest, welche Spesenabrechnungen für die automatische Genehmigung infrage kommen.',
                autoApproveReportsUnderTitle: 'Berichte automatisch genehmigen bis',
                autoApproveReportsUnderDescription: 'Vollständig konforme Spesenberichte unter diesem Betrag werden automatisch genehmigt.',
                randomReportAuditTitle: 'Zufällige Berichtprüfung',
                randomReportAuditDescription: 'Verlange, dass einige Berichte manuell genehmigt werden, selbst wenn sie für die automatische Genehmigung infrage kommen.',
                autoPayApprovedReportsTitle: 'Berichte mit Autozahlung freigeben',
                autoPayApprovedReportsSubtitle: 'Legen Sie fest, welche Spesenabrechnungen für die automatische Zahlung infrage kommen.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Bitte gib einen Betrag ein, der kleiner als ${currency ?? ''}20.000 ist`,
                autoPayApprovedReportsLockedSubtitle: 'Gehe zu „Weitere Funktionen“ und aktiviere Workflows, dann füge Zahlungen hinzu, um diese Funktion freizuschalten.',
                autoPayReportsUnderTitle: 'Berichte unter automatisch bezahlen',
                autoPayReportsUnderDescription: 'Vollständig konforme Spesenabrechnungen unter diesem Betrag werden automatisch bezahlt.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Füge ${featureName} hinzu, um diese Funktion freizuschalten.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Gehe zu [weitere Funktionen](${moreFeaturesLink}) und aktiviere ${featureName}, um diese Funktion freizuschalten.`,
            },
            categoryRules: {
                title: 'Kategorienregeln',
                approver: 'Genehmigende Person',
                requireDescription: 'Beschreibung erforderlich',
                requireFields: 'Pflichtfelder',
                requiredFieldsTitle: 'Pflichtfelder',
                requiredFieldsDescription: (categoryName: string) => `Dies gilt für alle Ausgaben, die als <strong>${categoryName}</strong> kategorisiert sind.`,
                requireAttendees: 'Teilnehmende verpflichten',
                descriptionHint: 'Beschreibungshinweis',
                descriptionHintDescription: (categoryName: string) =>
                    `Erinnere Mitarbeitende daran, zusätzliche Informationen für Ausgaben in der Kategorie „${categoryName}“ anzugeben. Dieser Hinweis erscheint im Beschreibungsfeld von Ausgaben.`,
                descriptionHintLabel: 'Hinweis',
                descriptionHintSubtitle: 'Profi-Tipp: Je kürzer, desto besser!',
                maxAmount: 'Höchstbetrag',
                flagAmountsOver: 'Beträge markieren über',
                flagAmountsOverDescription: (categoryName: string) => `Gilt für die Kategorie „${categoryName}“.`,
                flagAmountsOverSubtitle: 'Dies setzt den Höchstbetrag für alle Ausgaben außer Kraft.',
                expenseLimitTypes: {
                    expense: 'Einzelausgabe',
                    expenseSubtitle: 'Betrag von Ausgaben nach Kategorie kennzeichnen. Diese Regel überschreibt die allgemeine Workspace-Regel für den maximalen Ausgabenbetrag.',
                    daily: 'Kategoriesumme',
                    dailySubtitle: 'Tägliche Gesamtausgaben pro Kategorie je Spesenbericht kennzeichnen.',
                },
                requireReceiptsOver: 'Belege erforderlich über',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standard`,
                    never: 'Belege niemals erforderlich',
                    always: 'Belege immer erforderlich',
                },
                requireItemizedReceiptsOver: 'Detaillierte Belege über erforderlich',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standard`,
                    never: 'Detaillierte Belege niemals verlangen',
                    always: 'Immer detaillierte Belege anfordern',
                },
                defaultTaxRate: 'Standardsteuersatz',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Gehe zu [Weitere Funktionen](${moreFeaturesLink}) und aktiviere Workflows, dann füge Genehmigungen hinzu, um diese Funktion freizuschalten.`,
            },
            customRules: {
                title: 'Spesenrichtlinie',
                cardSubtitle: 'Hier befindet sich die Spesenrichtlinie deines Teams, damit alle wissen, was abgedeckt ist.',
            },
            merchantRules: {
                title: 'Händler',
                subtitle: 'Legen Sie Händlerregeln fest, damit Ausgaben korrekt codiert ankommen und weniger Nachbearbeitung erfordern.',
                addRule: 'Händlerregel hinzufügen',
                ruleSummaryTitle: (merchantName: string) => `Wenn Händler „${merchantName}“ enthält`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Händler in „${merchantName}“ umbenennen`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `Aktualisiere ${fieldName} zu „${fieldValue}“`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Als "${reimbursable ? 'erstattungsfähig' : 'nicht erstattungsfähig'}" markieren`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Als „${billable ? 'Abrechenbar' : 'nicht abrechenbar'}“ markieren`,
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Einsammeln',
                    description: 'Für Teams, die ihre Prozesse automatisieren möchten.',
                },
                corporate: {
                    label: 'Steuerung',
                    description: 'Für Organisationen mit erweiterten Anforderungen.',
                },
            },
            description: 'Wähle den passenden Tarif für dich. Eine detaillierte Liste mit Funktionen und Preisen findest du in unserer',
            subscriptionLink: 'Hilfeseite zu Plantypen und Preisen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Sie haben sich bis zum Ende Ihres Jahresabonnements am ${annualSubscriptionEndDate} zu 1 aktivem Mitglied im Control-Tarif verpflichtet. Ab dem ${annualSubscriptionEndDate} können Sie zu einem nutzungsbasierten Abonnement wechseln und zum Collect-Tarif herabstufen, indem Sie die automatische Verlängerung in отключить.`,
                other: `Sie haben sich bis zum Ende Ihres Jahresabonnements am ${annualSubscriptionEndDate} zu ${count} aktiven Mitgliedern im Control-Tarif verpflichtet. Ab dem ${annualSubscriptionEndDate} können Sie durch Deaktivieren der automatischen Verlängerung in eine nutzungsabhängige Abrechnung wechseln und zum Collect-Tarif herabstufen in`,
            }),
            subscriptions: 'Abonnements',
        },
    },
    getAssistancePage: {
        title: 'Hilfe erhalten',
        subtitle: 'Wir sind hier, um dir den Weg zur Größe zu ebnen!',
        description: 'Wähle eine der folgenden Supportoptionen aus:',
        chatWithConcierge: 'Mit Concierge chatten',
        scheduleSetupCall: 'Einrichtungsgespräch planen',
        scheduleACall: 'Anruf planen',
        questionMarkButtonTooltip: 'Holen Sie sich Unterstützung von unserem Team',
        exploreHelpDocs: 'Hilfedokumentation durchsuchen',
        registerForWebinar: 'Für Webinar registrieren',
        onboardingHelp: 'Onboarding-Hilfe',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Standard-Hautton ändern',
        headers: {
            frequentlyUsed: 'Häufig verwendet',
            smileysAndEmotion: 'Smileys & Emotionen',
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
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Jede Person kann diesen Raum finden',
        createRoom: 'Raum erstellen',
        roomAlreadyExistsError: 'Ein Raum mit diesem Namen existiert bereits',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} ist ein Standardraum in allen Arbeitsbereichen. Bitte wähle einen anderen Namen.`,
        roomNameInvalidError: 'Raumnamen dürfen nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
        pleaseEnterRoomName: 'Bitte gib einen Raumnamen ein',
        pleaseSelectWorkspace: 'Bitte wähle einen Workspace aus',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}umbenannt zu „${newName}“ (zuvor „${oldName}“)` : `${actor}hat diesen Raum in „${newName}“ umbenannt (zuvor „${oldName}“)`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Raum in ${newName} umbenannt`,
        social: 'sozial',
        selectAWorkspace: 'Wähle einen Arbeitsbereich aus',
        growlMessageOnRenameError: 'Arbeitsbereichsraum kann nicht umbenannt werden. Bitte überprüfe deine Verbindung und versuche es erneut.',
        visibilityOptions: {
            restricted: 'Arbeitsbereich', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privat',
            public: 'Öffentlich',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Öffentliche Ankündigung',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Senden und schließen',
        submitAndApprove: 'Einreichen und genehmigen',
        advanced: 'ERWEITERT',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `das Standard-Geschäftsbankkonto auf „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}“ festlegen`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `hat das Standard-Geschäftsbankkonto „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}“ entfernt`,
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
            `hat das Standardgeschäftsbankkonto in „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}“ geändert (zuvor „${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}“)`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `hat die Firmenadresse in „${newAddress}“ geändert (zuvor „${previousAddress}“)` : `Firmenadresse auf „${newAddress}“ festlegen`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `${approverName} (${approverEmail}) als Genehmiger:in für das Feld ${field} „${name}“ hinzugefügt`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `${approverName} (${approverEmail}) als Genehmigenden für das Feld ${field} „${name}“ entfernt`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `hat die/den Genehmigenden für das Feld ${field} „${name}“ in ${formatApprover(newApproverName, newApproverEmail)} geändert (zuvor ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `hat die Kategorie „${categoryName}“ hinzugefügt`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `hat die Kategorie „${categoryName}“ entfernt`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'deaktiviert' : 'aktiviert'} die Kategorie „${categoryName}“`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `die Lohnabrechnungscode „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            if (!newValue && oldValue) {
                return `hat den Lohnabrechnungscode „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `hat den Lohnabrechnungscode der Kategorie „${categoryName}“ in „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `den Sachkonto-Code „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            if (!newValue && oldValue) {
                return `hat den Sachkontocode „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `hat den Sachkonto-Code der Kategorie „${categoryName}“ in „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `hat die Beschreibung der Kategorie „${categoryName}“ in ${!oldValue ? 'erforderlich' : 'nicht erforderlich'} geändert (zuvor ${!oldValue ? 'nicht erforderlich' : 'erforderlich'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `hat einen maximalen Betrag von ${newAmount} zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            if (oldAmount && !newAmount) {
                return `den Höchstbetrag von ${oldAmount} aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `hat den Maximalbetrag der Kategorie „${categoryName}“ auf ${newAmount} geändert (zuvor ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `hat einen Grenztyp von ${newValue} zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            return `hat den Grenztyp der Kategorie „${categoryName}“ in ${newValue} geändert (zuvor ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `hat die Kategorie „${categoryName}“ aktualisiert, indem Belege auf ${newValue} geändert wurden`;
            }
            return `hat die Kategorie „${categoryName}“ in ${newValue} geändert (zuvor ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `hat die Kategorie "${categoryName}" aktualisiert, indem Detaillierte Belege in ${newValue} geändert wurden`;
            }
            return `hat die Detaillierte Belege der Kategorie "${categoryName}" auf ${newValue} geändert (vorher ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `hat die Kategorie „${oldName}" in „${newName}" umbenannt`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `hat den Beschreibungshinweis „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return !oldValue
                ? `die Beschreibungshinweis „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`
                : `hat den Beschreibungshinweis der Kategorie „${categoryName}“ zu „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `hat den Taglisten-Namen in „${newName}“ geändert (zuvor „${oldName}“)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `hat das Tag „${tagName}“ zur Liste „${tagListName}“ hinzugefügt`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) =>
            `hat die Tag-Liste „${tagListName}“ aktualisiert, indem der Tag „${oldName}“ in „${newName}“ geändert wurde`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'aktiviert' : 'deaktiviert'} das Tag „${tagName}“ in der Liste „${tagListName}“`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `hat das Tag „${tagName}“ aus der Liste „${tagListName}“ entfernt`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `„${count}“ Tags aus der Liste „${tagListName}“ entfernt`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `hat die Kategorie „${tagName}“ in der Liste „${tagListName}“ aktualisiert, indem ${updatedField} in „${newValue}“ geändert wurde (zuvor „${oldValue}“)`;
            }
            return `hat das Tag „${tagName}“ in der Liste „${tagListName}“ aktualisiert, indem ein(e) ${updatedField} mit dem Wert „${newValue}“ hinzugefügt wurde`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `hat die/den ${customUnitName} ${updatedField} in „${newValue}“ geändert (zuvor „${oldValue}“)`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'aktiviert' : 'deaktiviert'} Steuerverfolgung bei Entfernungssätzen`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `hat einen neuen „${customUnitName}“-Satz „${rateName}“ hinzugefügt`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `hat den Satz des/der ${customUnitName} ${updatedField} „${customUnitRateName}“ auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `hat den Steuersatz für den Entfernungssatz „${customUnitRateName}“ auf „${newValue} (${newTaxPercentage})“ geändert (zuvor „${oldValue} (${oldTaxPercentage})“)`;
            }
            return `hat den Steuersatz „${newValue} (${newTaxPercentage})“ zum Distanzsatz „${customUnitRateName}“ hinzugefügt`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `hat den rückforderbaren Steueranteil am Distanzsatz „${customUnitRateName}“ auf „${newValue}“ geändert (zuvor „${oldValue}“)`;
            }
            return `hat einen erstattungsfähigen Steueranteil von „${newValue}“ zum Distanzsatz „${customUnitRateName} hinzugefügt`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? 'aktiviert' : 'deaktiviert'} den ${customUnitName}-Satz „${customUnitRateName}“`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `hat den „${customUnitName}“-Satz „${rateName}“ entfernt`,
        addedReportField: (fieldType: string, fieldName?: string) => `${fieldType}-Berichtsfeld „${fieldName}“ hinzugefügt`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `Standardwert des Berichtsfelds „${fieldName}“ auf „${defaultValue}“ festlegen`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `hat die Option „${optionName}“ zum Berichtsfeld „${fieldName}“ hinzugefügt`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `hat die Option „${optionName}“ aus dem Berichtsfeld „${fieldName}“ entfernt`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'aktiviert' : 'deaktiviert'} die Option „${optionName}“ für das Berichts­feld „${fieldName}“`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'aktiviert' : 'deaktiviert'} alle Optionen für das Berichtsfeld „${fieldName}“`;
            }
            return `${allEnabled ? 'aktiviert' : 'deaktiviert'} die Option „${optionName}“ für das Berichtsfeld „${fieldName}“, wodurch alle Optionen ${allEnabled ? 'aktiviert' : 'deaktiviert'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `${fieldType}-Berichtsfeld „${fieldName}“ entfernt`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `„Selbstgenehmigung verhindern“ auf „${newValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}“ aktualisiert (zuvor „${oldValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}“)`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `Monatliches Berichtsabgabedatum auf „${newValue}“ festlegen`;
            }
            return `das Einreichungsdatum des Monatsberichts auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `„Auslagen erneut an Kund:innen weiterberechnen“ auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `„Standard für Barausgaben“ auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `hat „Standardberichtstitel erzwingen“ aktiviert ${value ? 'an' : 'aus'}`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `hat die Formel für den benutzerdefinierten Berichtsnamen in „${newValue}“ geändert (zuvor „${oldValue}“)`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `den Namen dieses Arbeitsbereichs auf „${newName}“ aktualisiert (zuvor „${oldName}“)`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `setze die Beschreibung dieses Arbeitsbereichs auf „${newDescription}“`
                : `hat die Beschreibung dieses Arbeitsbereichs auf „${newDescription}“ aktualisiert (zuvor „${oldDescription}“)`,
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
                one: `hat dich aus dem Genehmigungsworkflow und dem Ausgabenchat von ${joinedNames} entfernt. Zuvor eingereichte Berichte bleiben in deinem Posteingang zur Genehmigung verfügbar.`,
                other: `hat dich aus den Genehmigungsabläufen und Spesen-Chats von ${joinedNames} entfernt. Zuvor eingereichte Reports bleiben in deinem Posteingang zur Genehmigung verfügbar.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `hat deine Rolle in ${policyName} von ${oldRole} zu Nutzer:in geändert. Du wurdest aus allen Einreicher-Spesen-Chats entfernt, außer aus deinem eigenen.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `hat die Standardwährung auf ${newCurrency} aktualisiert (zuvor ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `hat die automatische Berichtshäufigkeit auf „${newFrequency}“ aktualisiert (zuvor „${oldFrequency}“)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `hat den Genehmigungsmodus auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        upgradedWorkspace: 'hat diesen Workspace auf den Control-Tarif hochgestuft',
        forcedCorporateUpgrade: `Dieser Workspace wurde auf den Control-Tarif hochgestuft. Klicken Sie <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">hier</a> für weitere Informationen.`,
        downgradedWorkspace: 'hat diesen Workspace auf den Collect-Tarif herabgestuft',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `hat den Anteil der Berichte, die zufällig zur manuellen Genehmigung weitergeleitet werden, auf ${Math.round(newAuditRate * 100)}% geändert (zuvor ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `hat das manuelle Genehmigungslimit für alle Ausgaben auf ${newLimit} geändert (zuvor ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Kategorien`;
                case 'tags':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Tags`;
                case 'workflows':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'}-Workflows`;
                case 'distance rates':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Entfernungssätze`;
                case 'accounting':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Buchhaltung`;
                case 'Expensify Cards':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Expensify Cards`;
                case 'company cards':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Firmenkarten`;
                case 'invoicing':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Rechnungsstellung`;
                case 'per diem':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Tagegeld`;
                case 'receipt partners':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Belegpartner`;
                case 'rules':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Regeln`;
                case 'tax tracking':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Steuerverfolgung`;
                default:
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? 'aktiviert' : 'deaktiviert'} Teilnehmendenverfolgung`,
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `hat die Standardgenehmiger:in auf ${newApprover} geändert (zuvor ${previousApprover})` : `Standardgenehmigende*n in ${newApprover} geändert`,
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
            let text = `den Genehmigungs-Workflow für ${members} geändert, damit Berichte an ${approver} eingereicht werden`;
            if (wasDefaultApprover && previousApprover) {
                text += `(zuvor Standardgenehmiger ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(früher Standardgenehmiger)';
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
                ? `den Genehmigungsworkflow für ${members} geändert, damit Berichte an die/den Standardgenehmiger:in ${approver} eingereicht werden`
                : `hat den Genehmigungsworkflow für ${members} geändert, sodass Berichte an die Standardgenehmiger:in eingereicht werden`;
            if (wasDefaultApprover && previousApprover) {
                text += `(zuvor Standardgenehmiger ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(früher Standardgenehmiger)';
            } else if (previousApprover) {
                text += `(zuvor ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `den Genehmigungsworkflow für ${approver} geändert, sodass genehmigte Berichte an ${forwardsTo} weitergeleitet werden (zuvor weitergeleitet an ${previousForwardsTo})`
                : `hat den Genehmigungsworkflow für ${approver} geändert, sodass genehmigte Berichte an ${forwardsTo} weitergeleitet werden (zuvor endgültig genehmigte Berichte)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `den Genehmigungsablauf für ${approver} so geändert, dass genehmigte Berichte nicht mehr weitergeleitet werden (zuvor weitergeleitet an ${previousForwardsTo})`
                : `den Genehmigungs-Workflow für ${approver} geändert, damit genehmigte Berichte nicht mehr weitergeleitet werden`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `hat den Firmennamen der Rechnung in „${newValue}“ geändert (zuvor „${oldValue}“)` : `setze den Firmennamen der Rechnung auf „${newValue}“`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `hat die Firmenwebsite der Rechnung in „${newValue}“ geändert (zuvor „${oldValue}“)` : `setze die Firmenwebsite der Rechnung auf „${newValue}“`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser
                ? `hat den autorisierten Zahler in „${newReimburser}“ geändert (zuvor „${previousReimburser}“)`
                : `hat den autorisierten Zahler in „${newReimburser}“ geändert`,
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
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `Belegpflichtigen Betrag auf „${newValue}“ festlegen`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `Belegpflichtbetrag auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `erforderlichen Belegbetrag entfernt (zuvor „${oldValue}“)`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximalen Spesenbetrag auf „${newValue}“ festlegen`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `Maximalen Spesenbetrag auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximalen Ausgabenbetrag entfernt (zuvor „${oldValue}“)`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximales Ausgabenalter auf „${newValue}“ Tage festlegen`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximales Spesenalter auf „${newValue}“ Tage geändert (zuvor „${oldValue}“)`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `Höchstalter für Ausgaben entfernt (zuvor „${oldValue}“ Tage)`,
    },
    roomMembersPage: {
        memberNotFound: 'Mitglied nicht gefunden.',
        useInviteButton: 'Um ein neues Mitglied zum Chat einzuladen, verwende bitte die Einladungsschaltfläche oben.',
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
        confirmError: 'Bitte geben Sie einen Titel ein und wählen Sie ein Freigabeziel aus',
        descriptionOptional: 'Beschreibung (optional)',
        pleaseEnterTaskName: 'Bitte geben Sie einen Titel ein',
        pleaseEnterTaskDestination: 'Bitte wähle aus, wo du diese Aufgabe teilen möchtest',
    },
    task: {
        task: 'Aufgabe',
        title: 'Titel',
        description: 'Beschreibung',
        assignee: 'Zuständige Person',
        completed: 'Abgeschlossen',
        action: 'Abgeschlossen',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `Aufgabe für ${title}`,
            completed: 'als erledigt markiert',
            canceled: 'gelöschte Aufgabe',
            reopened: 'als unvollständig markiert',
            error: 'Sie haben keine Berechtigung, die angeforderte Aktion auszuführen',
        },
        markAsComplete: 'Als erledigt markieren',
        markAsIncomplete: 'Als unvollständig markieren',
        assigneeError: 'Beim Zuweisen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie eine andere zugewiesene Person.',
        genericCreateTaskFailureMessage: 'Beim Erstellen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.',
        deleteTask: 'Aufgabe löschen',
        deleteConfirmation: 'Sind Sie sicher, dass Sie diese Aufgabe löschen möchten?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Abrechnung ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Tastenkombinationen',
        subtitle: 'Sparen Sie Zeit mit diesen praktischen Tastenkombinationen:',
        shortcuts: {
            openShortcutDialog: 'Öffnet den Dialog für Tastenkürzel',
            markAllMessagesAsRead: 'Alle Nachrichten als gelesen markieren',
            escape: 'Dialoge schließen',
            search: 'Suchdialog öffnen',
            newChat: 'Neuer Chat-Bildschirm',
            copy: 'Kommentar kopieren',
            openDebug: 'Einstellungsdialog für Tests öffnen',
        },
    },
    guides: {
        screenShare: 'Bildschirmfreigabe',
        screenShareRequest: 'Expensify lädt dich zu einer Bildschirmfreigabe ein',
    },
    search: {
        resultsAreLimited: 'Suchergebnisse sind begrenzt.',
        viewResults: 'Ergebnisse anzeigen',
        resetFilters: 'Filter zurücksetzen',
        searchResults: {
            emptyResults: {
                title: 'Nichts anzuzeigen',
                subtitle: `Versuche, deine Suchkriterien anzupassen oder etwas mit der +-Taste zu erstellen.`,
            },
            emptyExpenseResults: {
                title: 'Sie haben noch keine Ausgaben erstellt',
                subtitle: 'Erstelle eine Ausgabe oder mach eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwende die grüne Schaltfläche unten, um eine Ausgabe zu erstellen.',
            },
            emptyReportResults: {
                title: 'Du hast noch keine Berichte erstellt',
                subtitle: 'Erstelle einen Bericht oder mach eine Probefahrt mit Expensify, um mehr zu erfahren.',
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
                title: 'Keine Ausgaben zu bezahlen',
                subtitle: 'Glückwunsch! Du hast die Ziellinie überquert.',
            },
            emptyExportResults: {
                title: 'Keine Ausgaben zum Exportieren',
                subtitle: 'Zeit, es ruhig angehen zu lassen – gute Arbeit.',
            },
            emptyStatementsResults: {
                title: 'Keine Ausgaben zum Anzeigen',
                subtitle: 'Keine Ergebnisse. Bitte passe deine Filter an.',
            },
            emptyUnapprovedResults: {
                title: 'Keine Ausgaben zu genehmigen',
                subtitle: 'Null Ausgaben. Maximale Entspannung. Gut gemacht!',
            },
        },
        columns: 'Spalten',
        resetColumns: 'Spalten zurücksetzen',
        groupColumns: 'Spalten gruppieren',
        expenseColumns: 'Ausgabenspalten',
        statements: 'Abrechnungen',
        unapprovedCash: 'Nicht genehmigtes Bargeld',
        unapprovedCard: 'Nicht genehmigte Karte',
        reconciliation: 'Abstimmung',
        topSpenders: 'Top-Ausgeber',
        saveSearch: 'Suche speichern',
        deleteSavedSearch: 'Gespeicherte Suche löschen',
        deleteSavedSearchConfirm: 'Möchtest du diese Suche wirklich löschen?',
        searchName: 'Name suchen',
        savedSearchesMenuItemTitle: 'Gespeichert',
        topCategories: 'Top-Kategorien',
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
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Letzter Auszug',
                },
            },
            status: 'Status',
            keyword: 'Schlüsselwort',
            keywords: 'Schlüsselwörter',
            limit: 'Limit',
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
            past: 'Vergangenheit',
            submitted: 'Übermittelt',
            approved: 'Genehmigt',
            paid: 'Bezahlt',
            exported: 'Exportiert',
            posted: 'Gebucht',
            withdrawn: 'Zurückgezogen',
            billable: 'Abrechenbar',
            reimbursable: 'Erstattungsfähig',
            purchaseCurrency: 'Kaufwährung',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'Von',
                [CONST.SEARCH.GROUP_BY.CARD]: 'Karte',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'Auszahlungs-ID',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Kategorie',
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
        moneyRequestReport: {
            emptyStateTitle: 'Dieser Bericht enthält keine Ausgaben.',
            accessPlaceHolder: 'Zum Anzeigen öffnen',
        },
        noCategory: 'Keine Kategorie',
        noTag: 'Kein Tag',
        expenseType: 'Ausgabenart',
        withdrawalType: 'Auszahlungsart',
        recentSearches: 'Letzte Suchanfragen',
        recentChats: 'Letzte Chats',
        searchIn: 'Suchen in',
        searchPlaceholder: 'Nach etwas suchen',
        suggestions: 'Vorschläge',
        exportSearchResults: {
            title: 'Export erstellen',
            description: 'Wow, das sind eine Menge Positionen! Wir bündeln sie, und Concierge schickt dir in Kürze eine Datei.',
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
            helpTextMobile: 'Bitte die App schließen und erneut öffnen oder wechseln zu',
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
                'Überprüfe deinen Fotos- oder Download-Ordner auf eine Kopie deines QR-Codes. Profi-Tipp: Füge ihn einer Präsentation hinzu, damit dein Publikum ihn scannen und direkt mit dir Kontakt aufnehmen kann.',
        },
        generalError: {
            title: 'Anlagenfehler',
            message: 'Anhang kann nicht heruntergeladen werden',
        },
        permissionError: {
            title: 'Speicherzugriff',
            message: 'Expensify kann Anhänge ohne Speicherzugriff nicht speichern. Tippe auf „Einstellungen“, um die Berechtigungen zu aktualisieren.',
        },
    },
    settlement: {
        status: {
            pending: 'Ausstehend',
            cleared: 'Ausgeglichen',
            failed: 'Fehlgeschlagen',
        },
        failedError: ({link}: {link: string}) => `Wir versuchen diese Abrechnung erneut, sobald du <a href="${link}">dein Konto entsperrst</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • Auszahlung-ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Berichts-Layout',
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
            chooseWorkspace: 'Wähle einen Workspace für diesen Bericht aus.',
            emptyReportConfirmationTitle: 'Du hast bereits einen leeren Bericht',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Möchtest du wirklich einen weiteren Bericht in ${workspaceName} erstellen? Du kannst auf deine leeren Berichte zugreifen in`,
            emptyReportConfirmationPromptLink: 'Berichte',
            emptyReportConfirmationDontShowAgain: 'Nicht noch einmal anzeigen',
            genericWorkspaceName: 'dieser Arbeitsbereich',
        },
        genericCreateReportFailureMessage: 'Unerwarteter Fehler beim Erstellen dieses Chats. Bitte versuche es später erneut.',
        genericAddCommentFailureMessage: 'Unerwarteter Fehler beim Veröffentlichen des Kommentars. Bitte versuche es später noch einmal.',
        genericUpdateReportFieldFailureMessage: 'Unerwarteter Fehler beim Aktualisieren des Feldes. Bitte versuche es später noch einmal.',
        genericUpdateReportNameEditFailureMessage: 'Unerwarteter Fehler beim Umbenennen des Berichts. Bitte versuche es später erneut.',
        noActivityYet: 'Noch keine Aktivitäten',
        connectionSettings: 'Verbindungseinstellungen',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `${fieldName} geändert in „${newValue}“ (zuvor „${oldValue}“)`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `setze ${fieldName} auf „${newValue}“`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `hat den Workspace ${fromPolicyName ? `(früher ${fromPolicyName})` : ''} geändert`;
                    }
                    return `hat den Workspace in ${toPolicyName}${fromPolicyName ? `(früher ${fromPolicyName})` : ''} geändert`;
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
                    nonReimbursableLink: 'Firmenkarten-Ausgaben',
                    pending: (label: string) => `hat begonnen, diesen Bericht nach ${label} zu exportieren …`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `Export dieses Berichts nach ${label} fehlgeschlagen („${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}“)`,
                managerAttachReceipt: `Beleg hinzugefügt`,
                managerDetachReceipt: `hat einen Beleg entfernt`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `hat ${currency}${amount} anderweitig bezahlt`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `${currency}${amount} über Integration bezahlt`,
                outdatedBankAccount: `Die Zahlung konnte aufgrund eines Problems mit dem Bankkonto des Zahlenden nicht verarbeitet werden`,
                reimbursementACHBounce: `Die Zahlung konnte wegen eines Problems mit dem Bankkonto nicht verarbeitet werden`,
                reimbursementACHCancelled: `hat die Zahlung storniert`,
                reimbursementAccountChanged: `Die Zahlung konnte nicht verarbeitet werden, da der Zahlende das Bankkonto gewechselt hat.`,
                reimbursementDelayed: `hat die Zahlung verarbeitet, aber sie verzögert sich um 1–2 weitere Werktage`,
                selectedForRandomAudit: `zufällig zur Prüfung ausgewählt`,
                selectedForRandomAuditMarkdown: `zufällig für eine Überprüfung [ausgewählt](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule)`,
                share: ({to}: ShareParams) => `hat Mitglied ${to} eingeladen`,
                unshare: ({to}: UnshareParams) => `Mitglied ${to} entfernt`,
                stripePaid: ({amount, currency}: StripePaidParams) => `bezahlt ${amount} ${currency}`,
                takeControl: `übernahm die Kontrolle`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `Beim Abgleichen mit ${label}${errorMessage ? ` ("${errorMessage}")` : ''} ist ein Problem aufgetreten. Bitte behebe das Problem in den <a href="${workspaceAccountingLink}">Workspace-Einstellungen</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `Die Verbindung zu ${feedName} ist unterbrochen. Um den Kartenimport wiederherzustellen, <a href='${workspaceCompanyCardRoute}'>melden Sie sich bei Ihrer Bank an</a>`,
                addEmployee: (email: string, role: string) => `${email} als ${role === 'member' ? 'a' : 'an'} ${role} hinzugefügt`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `hat die Rolle von ${email} in ${newRole} geändert (zuvor ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `benutzerdefiniertes Feld 1 von ${email} entfernt (zuvor „${previousValue}“)`;
                    }
                    return !previousValue
                        ? `„${newValue}“ zu benutzerdefiniertem Feld 1 von ${email} hinzugefügt`
                        : `benutzerdefiniertes Feld 1 von ${email} in „${newValue}“ geändert (zuvor „${previousValue}“)`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `benutzerdefiniertes Feld 2 von ${email} entfernt (zuvor „${previousValue}“)`;
                    }
                    return !previousValue
                        ? `„${newValue}“ zum benutzerdefinierten Feld 2 von ${email} hinzugefügt`
                        : `benutzerdefiniertes Feld 2 von ${email} auf „${newValue}“ geändert (zuvor „${previousValue}“)`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} hat den Workspace verlassen`,
                removeMember: (email: string, role: string) => `${role} ${email} entfernt`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `Verbindung zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} entfernt`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `verbunden mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'hat den Chat verlassen',
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
        CPACard: 'CPA-Karte',
        payroll: 'Lohnabrechnung',
        travel: 'Reisen',
        resources: 'Ressourcen',
        expensifyApproved: 'Von Expensify genehmigt!',
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
        createAccount: 'Neues Konto erstellen',
        logIn: 'Anmelden',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Zur Chatliste zurück navigieren',
        chatWelcomeMessage: 'Chat-Begrüßungsnachricht',
        navigatesToChat: 'Navigiert zu einem Chat',
        newMessageLineIndicator: 'Neue Nachrichtenzeilen-Anzeige',
        chatMessage: 'Chatnachricht',
        lastChatMessagePreview: 'Vorschau der letzten Chatnachricht',
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
        hiddenMessage: 'Verborgene Nachricht',
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
        intimidationDescription: 'Aggressive Verfolgung einer Agenda trotz berechtigter Einwände',
        bullying: 'Mobbing',
        bullyingDescription: 'Eine einzelne Person ins Visier nehmen, um Gehorsam zu erzwingen',
        harassment: 'Belästigung',
        harassmentDescription: 'Rassistisches, frauenfeindliches oder anderweitig stark diskriminierendes Verhalten',
        assault: 'Übergriff',
        assaultDescription: 'Gezielter emotionaler Angriff mit der Absicht, Schaden zuzufügen',
        flaggedContent: 'Diese Nachricht wurde als Verstoß gegen unsere Community-Regeln markiert und ihr Inhalt wurde verborgen.',
        hideMessage: 'Nachricht ausblenden',
        revealMessage: 'Nachricht anzeigen',
        levelOneResult: 'Sendet eine anonyme Warnung und die Nachricht wird zur Überprüfung gemeldet.',
        levelTwoResult: 'Nachricht im Kanal ausgeblendet, anonyme Verwarnung gesendet und Nachricht zur Überprüfung gemeldet.',
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
        submit: 'An jemanden senden',
        categorize: 'Kategorisiere es',
        share: 'Mit meinem Steuerberater teilen',
        nothing: 'Fürs Erste nichts',
    },
    teachersUnitePage: {
        teachersUnite: 'Lehrkräfte vereinigen sich',
        joinExpensifyOrg:
            'Schließe dich Expensify.org an, um Ungerechtigkeit auf der ganzen Welt zu beseitigen. Die aktuelle Kampagne „Teachers Unite“ unterstützt Lehrkräfte überall, indem sie die Kosten für wichtige Schulmaterialien teilt.',
        iKnowATeacher: 'Ich kenne eine Lehrkraft',
        iAmATeacher: 'Ich bin Lehrer',
        getInTouch: 'Ausgezeichnet! Bitte teilen Sie ihre Kontaktdaten, damit wir sie kontaktieren können.',
        introSchoolPrincipal: 'Vorstellung bei Ihrer Schulleitung',
        schoolPrincipalVerifyExpense:
            'Expensify.org teilt die Kosten für wichtige Schulmaterialien auf, damit Schüler aus einkommensschwachen Haushalten eine bessere Lernerfahrung haben können. Ihre Schulleitung wird gebeten, Ihre Ausgaben zu bestätigen.',
        principalFirstName: 'Vorname der verantwortlichen Person',
        principalLastName: 'Nachname der verantwortlichen Person',
        principalWorkEmail: 'Hauptgeschäftliche E-Mail-Adresse',
        updateYourEmail: 'Aktualisiere deine E-Mail-Adresse',
        updateEmail: 'E-Mail-Adresse aktualisieren',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Bevor du fortfährst, stelle bitte sicher, dass deine Schul-E-Mail als deine Standardkontaktmethode festgelegt ist. Du kannst dies unter Einstellungen > Profil > <a href="${contactMethodsRoute}">Kontaktmethoden</a> tun.`,
        error: {
            enterPhoneEmail: 'Gib eine gültige E-Mail-Adresse oder Telefonnummer ein',
            enterEmail: 'E-Mail eingeben',
            enterValidEmail: 'Gib eine gültige E-Mail-Adresse ein',
            tryDifferentEmail: 'Bitte versuche eine andere E-Mail-Adresse',
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
            selectSuggestedAddress: 'Bitte wähle eine vorgeschlagene Adresse aus oder verwende den aktuellen Standort',
        },
        odometer: {
            startReading: 'Mit dem Lesen beginnen',
            endReading: 'Lesen beenden',
            saveForLater: 'Für später speichern',
            totalDistance: 'Gesamtentfernung',
        },
    },
    gps: {
        tooltip: 'GPS-Tracking läuft! Wenn du fertig bist, stoppe die Aufzeichnung unten.',
        disclaimer: 'Verwende GPS, um aus deiner Fahrt eine Ausgabe zu erstellen. Tippe unten auf „Start“, um die Aufzeichnung zu beginnen.',
        error: {
            failedToStart: 'Starten der Standortverfolgung fehlgeschlagen.',
            failedToGetPermissions: 'Erforderliche Standortberechtigungen konnten nicht abgerufen werden.',
        },
        trackingDistance: 'Entfernung wird erfasst ...',
        stopped: 'Angehalten',
        start: 'Start',
        stop: 'Stopp',
        discard: 'Verwerfen',
        stopGpsTrackingModal: {
            title: 'GPS-Tracking beenden',
            prompt: 'Bist du sicher? Dadurch wird dein aktueller Ablauf beendet.',
            cancel: 'Verfolgung fortsetzen',
            confirm: 'GPS-Tracking beenden',
        },
        discardDistanceTrackingModal: {
            title: 'Streckenverfolgung verwerfen',
            prompt: 'Bist du sicher? Dadurch wird dein aktueller Ablauf verworfen und dies kann nicht rückgängig gemacht werden.',
            confirm: 'Streckenverfolgung verwerfen',
        },
        zeroDistanceTripModal: {
            title: 'Ausgabe kann nicht erstellt werden',
            prompt: 'Du kannst keine Ausgabe mit demselben Start- und Endort erstellen.',
        },
        locationRequiredModal: {
            title: 'Standortzugriff erforderlich',
            prompt: 'Bitte erlaube den Standortzugriff in den Geräteeinstellungen, um die GPS-Entfernungsverfolgung zu starten.',
            allow: 'Zulassen',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Standortzugriff im Hintergrund erforderlich',
            prompt: 'Bitte erlaube in den Einstellungen deines Geräts den Zugriff auf den Standort im Hintergrund (Option „Immer zulassen“), um die GPS-Distanzaufzeichnung zu starten.',
        },
        preciseLocationRequiredModal: {
            title: 'Genaue Standortangabe erforderlich',
            prompt: 'Bitte aktiviere in den Einstellungen deines Geräts die Option „Präziser Standort“, um die GPS‑Distanzverfolgung zu starten.',
        },
        desktop: {
            title: 'Strecke auf deinem Handy verfolgen',
            subtitle: 'Strecke automatisch per GPS in Meilen oder Kilometern erfassen und Fahrten sofort in Ausgaben umwandeln.',
            button: 'App herunterladen',
        },
        notification: {
            title: 'GPS-Tracking läuft',
            body: 'Wechsle zur App, um abzuschließen',
        },
        locationServicesRequiredModal: {
            title: 'Standortzugriff erforderlich',
            confirm: 'Einstellungen öffnen',
            prompt: 'Bitte erlaube den Standortzugriff in den Geräteeinstellungen, um die GPS-Entfernungsverfolgung zu starten.',
        },
        fabGpsTripExplained: 'Zur GPS-Ansicht wechseln (Schnellaktion)',
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Zeugnis verloren oder beschädigt',
        nextButtonLabel: 'Weiter',
        reasonTitle: 'Warum brauchst du eine neue Karte?',
        cardDamaged: 'Meine Karte wurde beschädigt',
        cardLostOrStolen: 'Meine Karte wurde verloren oder gestohlen',
        confirmAddressTitle: 'Bitte bestätigen Sie die Postanschrift für Ihre neue Karte.',
        cardDamagedInfo: 'Ihre neue Karte trifft in 2–3 Werktagen ein. Ihre aktuelle Karte funktioniert weiter, bis Sie Ihre neue Karte aktivieren.',
        cardLostOrStolenInfo: 'Ihre aktuelle Karte wird dauerhaft deaktiviert, sobald Ihre Bestellung aufgegeben wurde. Die meisten Karten treffen in wenigen Werktagen ein.',
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
            buttonText: 'Starte einen Chat, <success><strong>wirb eine:n Freund:in</strong></success>.',
            header: 'Chat starten, Freund:in werben',
            body: 'Möchtest du, dass deine Freunde Expensify auch nutzen? Starte einfach einen Chat mit ihnen und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Reiche eine Ausgabe ein, <success><strong>empfiehl dein Team</strong></success>.',
            header: 'Reiche eine Ausgabe ein, wirb dein Team',
            body: 'Möchtest du, dass dein Team Expensify auch nutzt? Reiche ihnen einfach eine Ausgabe ein, und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Empfehle eine:n Freund:in',
            body: 'Möchtest du, dass deine Freunde Expensify auch nutzen? Chatte einfach mit ihnen, bezahle oder teile eine Ausgabe – wir kümmern uns um den Rest. Oder teile einfach deinen Einladungslink!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Empfehle eine:n Freund:in',
            header: 'Empfehle eine:n Freund:in',
            body: 'Möchtest du, dass deine Freunde Expensify auch nutzen? Chatte einfach mit ihnen, bezahle oder teile eine Ausgabe – wir kümmern uns um den Rest. Oder teile einfach deinen Einladungslink!',
        },
        copyReferralLink: 'Einladungslink kopieren',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chatte mit deiner Einrichtungsfachkraft in <a href="${href}">${adminReportName}</a>, um Hilfe zu erhalten`,
        default: `Sende eine Nachricht an <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> für Hilfe bei der Einrichtung`,
    },
    violations: {
        allTagLevelsRequired: 'Alle Tags erforderlich',
        autoReportedRejectedExpense: 'Diese Ausgabe wurde abgelehnt.',
        billableExpense: 'Verrechenbar nicht mehr gültig',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Beleg erforderlich${formattedLimit ? `über ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategorie nicht mehr gültig',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `${surcharge}% Umrechnungszuschlag angewendet`,
        customUnitOutOfPolicy: 'Preis ist für diesen Workspace ungültig',
        duplicatedTransaction: 'Möglicher Duplikat',
        fieldRequired: 'Berichts­felder sind erforderlich',
        futureDate: 'Zukünftiges Datum nicht zulässig',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Aufschlag um ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Datum ist älter als ${maxAge} Tage`,
        missingCategory: 'Fehlende Kategorie',
        missingComment: 'Beschreibung für die ausgewählte Kategorie erforderlich',
        missingAttendees: 'Für diese Kategorie sind mehrere Teilnehmende erforderlich',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Fehlend ${tagName ?? 'Tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Betrag weicht von berechneter Entfernung ab';
                case 'card':
                    return 'Betrag größer als Kartenumsatz';
                default:
                    if (displayPercentVariance) {
                        return `Betrag ist um ${displayPercentVariance}% höher als der gescannte Beleg`;
                    }
                    return 'Betrag höher als gescannter Beleg';
            }
        },
        modifiedDate: 'Datum weicht vom gescannten Beleg ab',
        nonExpensiworksExpense: 'Ausgabe außerhalb von Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Ausgabe überschreitet das automatische Genehmigungslimit von ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Betrag über dem Kategorie-Limit von ${formattedLimit}/Person`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit} pro Person`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit}/Reise`,
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
                return `Beleg erforderlich bei Überschreitung des Kategorienlimits`;
            }
            return 'Beleg erforderlich';
        },
        itemizedReceiptRequired: ({formattedLimit}: {formattedLimit?: string}) => `Detaillierter Beleg erforderlich${formattedLimit ? ` über ${formattedLimit}` : ''}`,
        prohibitedExpense: ({prohibitedExpenseTypes}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Verbotener Aufwand:';
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
                    ? `Bankverbindung getrennt. <a href="${companyCardPageURL}">Erneut verbinden, um Beleg abzugleichen</a>`
                    : 'Bankverbindung unterbrochen. Bitte eine*n Admin bitten, die Verbindung wiederherzustellen, um den Beleg abzugleichen.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Bitte ${member} entweder, es als Barzahlung zu markieren, oder warte 7 Tage und versuche es dann erneut.` : 'Wartet auf Abgleich mit Kartenumsatz.';
            }
            return '';
        },
        brokenConnection530Error: 'Beleg ausstehend wegen unterbrochener Bankverbindung',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung. Bitte im Bereich <a href="${workspaceCompanyCardRoute}">Firmenkarten</a> beheben.</muted-text-label>`,
        memberBrokenConnectionError: 'Beleg ausstehend wegen unterbrochener Bankverbindung. Bitte bitte eine:n Workspace-Admin, dies zu beheben.',
        markAsCashToIgnore: 'Als Barzahlung markieren, um sie zu ignorieren und Zahlung anzufordern.',
        smartscanFailed: ({canEdit = true}) => `Belegerfassung fehlgeschlagen.${canEdit ? 'Details manuell eingeben.' : ''}`,
        receiptGeneratedWithAI: 'Mögliche KI-generierte Quittung',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Fehlende ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} nicht mehr gültig`,
        taxAmountChanged: 'Steuerbetrag wurde geändert',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Steuer'} nicht mehr gültig`,
        taxRateChanged: 'Steuersatz wurde geändert',
        taxRequired: 'Fehlender Steuersatz',
        none: 'Keine',
        taxCodeToKeep: 'Wählen Sie, welchen Steuerschlüssel Sie behalten möchten',
        tagToKeep: 'Wähle aus, welches Tag beibehalten werden soll',
        isTransactionReimbursable: 'Wähle, ob die Transaktion erstattungsfähig ist',
        merchantToKeep: 'Wähle, welchen Händler du behalten möchtest',
        descriptionToKeep: 'Wähle aus, welche Beschreibung beibehalten werden soll',
        categoryToKeep: 'Wähle aus, welche Kategorie beibehalten werden soll',
        isTransactionBillable: 'Wählen, ob die Transaktion abrechnungsfähig ist',
        keepThisOne: 'Dieses behalten',
        confirmDetails: `Bestätige die Details, die du behältst`,
        confirmDuplicatesInfo: `Die Duplikate, die du nicht behältst, werden für die einreichende Person zur Löschung bereitgehalten.`,
        hold: 'Diese Ausgabe wurde zurückgestellt',
        resolvedDuplicates: 'Duplikat behoben',
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
            manual: 'Duplikat behoben',
        },
    },
    videoPlayer: {
        play: 'Wiedergeben',
        pause: 'Pause',
        fullscreen: 'Vollbild',
        playbackSpeed: 'Wiedergabegeschwindigkeit',
        expand: 'Erweitern',
        mute: 'Stumm schalten',
        unmute: 'Stummschaltung aufheben',
        normal: 'Normal',
    },
    exitSurvey: {
        header: 'Bevor du gehst',
        reasonPage: {
            title: 'Bitte teilen Sie uns mit, warum Sie gehen',
            subtitle: 'Bevor du gehst, sag uns bitte, warum du zu Expensify Classic wechseln möchtest.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ich brauche eine Funktion, die nur in Expensify Classic verfügbar ist.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Ich verstehe nicht, wie ich New Expensify verwenden soll.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Ich verstehe, wie man das neue Expensify verwendet, aber ich bevorzuge Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Welche Funktion benötigst du, die in New Expensify nicht verfügbar ist?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Was möchten Sie tun?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Warum bevorzugen Sie Expensify Classic?',
        },
        responsePlaceholder: 'Ihre Antwort',
        thankYou: 'Vielen Dank für das Feedback!',
        thankYouSubtitle: 'Ihre Antworten helfen uns, ein besseres Produkt zu entwickeln, mit dem man Dinge erledigen kann. Vielen Dank!',
        goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        offlineTitle: 'Sie scheinst hier festzustecken …',
        offline:
            'Du scheinst offline zu sein. Leider funktioniert Expensify Classic nicht offline, aber das neue Expensify schon. Wenn du Expensify Classic bevorzugst, versuche es erneut, sobald du eine Internetverbindung hast.',
        quickTip: 'Kurzer Tipp ...',
        quickTipSubTitle: 'Du kannst direkt zu Expensify Classic gehen, indem du expensify.com besuchst. Setze ein Lesezeichen dafür, um eine schnelle Verknüpfung zu haben!',
        bookACall: 'Termin buchen',
        bookACallTitle: 'Möchten Sie mit einem Produktmanager sprechen?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Direkt über Ausgaben und Berichte chatten',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Alles auf dem Handy erledigen',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Reisen und Ausgaben in Chat-Geschwindigkeit',
        },
        bookACallTextTop: 'Wenn du zu Expensify Classic wechselst, verpasst du Folgendes:',
        bookACallTextBottom:
            'Wir würden uns freuen, mit Ihnen telefonisch zu sprechen, um den Grund zu erfahren. Sie können einen Anruf mit einer*einem unserer leitenden Produktmanager*innen buchen, um Ihre Anforderungen zu besprechen.',
        takeMeToExpensifyClassic: 'Bring mich zu Expensify Classic',
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
            freeTrial: (numOfDays: number) => `Kostenlose Testphase: Noch ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Ihre Zahlungsinformationen sind veraltet',
                subtitle: (date: string) => `Aktualisiere deine Zahlungskarte bis zum ${date}, um weiterhin alle deine Lieblingsfunktionen zu nutzen.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Ihre Zahlung konnte nicht verarbeitet werden',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `Ihre Belastung vom ${date} über ${purchaseAmountOwed} konnte nicht verarbeitet werden. Bitte fügen Sie eine Zahlungskarte hinzu, um den ausstehenden Betrag zu begleichen.`
                        : 'Bitte füge eine Zahlungskarte hinzu, um den fälligen Betrag zu begleichen.',
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
                    `Sie haben die Belastung über ${amountOwed} für die Karte mit der Endziffer ${cardEnding} angefochten. Ihr Konto bleibt gesperrt, bis die Angelegenheit mit Ihrer Bank geklärt ist.`,
            },
            cardAuthenticationRequired: {
                title: 'Ihre Zahlungskarte wurde nicht vollständig authentifiziert.',
                subtitle: (cardEnding: string) => `Bitte schließe den Authentifizierungsvorgang ab, um deine Zahlungskarte mit der Endung ${cardEnding} zu aktivieren.`,
            },
            insufficientFunds: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: (amountOwed: number) =>
                    `Ihre Zahlungskarte wurde aufgrund unzureichender Deckung abgelehnt. Bitte versuchen Sie es erneut oder fügen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Saldo von ${amountOwed} zu begleichen.`,
            },
            cardExpired: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: (amountOwed: number) =>
                    `Ihre Zahlungskarte ist abgelaufen. Bitte fügen Sie eine neue Zahlungskarte hinzu, um Ihren offenen Betrag von ${amountOwed} zu begleichen.`,
            },
            cardExpireSoon: {
                title: 'Ihre Karte läuft bald ab',
                subtitle:
                    'Ihre Zahlungskarte läuft am Ende dieses Monats ab. Klicken Sie unten auf das Drei-Punkte-Menü, um sie zu aktualisieren und alle Ihre Lieblingsfunktionen weiterhin zu nutzen.',
            },
            retryBillingSuccess: {
                title: 'Erfolgreich!',
                subtitle: 'Ihre Karte wurde erfolgreich belastet.',
            },
            retryBillingError: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle:
                    'Bevor du es erneut versuchst, rufe bitte direkt bei deiner Bank an, um Expensify-Abbuchungen zu autorisieren und eventuelle Sperren aufzuheben. Andernfalls versuche, eine andere Zahlungskarte hinzuzufügen.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Sie haben die Belastung über ${amountOwed} für die Karte mit der Endziffer ${cardEnding} angefochten. Ihr Konto bleibt gesperrt, bis die Angelegenheit mit Ihrer Bank geklärt ist.`,
            preTrial: {
                title: 'Kostenlose Testphase starten',
                subtitle: 'Als nächsten Schritt <a href="#">schließen Sie Ihre Einrichtungs-Checkliste ab</a>, damit Ihr Team mit der Spesenabrechnung beginnen kann.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Testversion: Noch ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'} übrig!`,
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
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `Fordere innerhalb von ${days > 0 ? `${days}T :` : ''}${hours}h : ${minutes}m : ${seconds}s an`,
            },
        },
        cardSection: {
            title: 'Zahlung',
            subtitle: 'Füge eine Karte hinzu, um dein Expensify-Abonnement zu bezahlen.',
            addCardButton: 'Zahlungskarte hinzufügen',
            cardInfo: (name: string, expiration: string, currency: string) => `Name: ${name}, Ablaufdatum: ${expiration}, Währung: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Ihr nächstes Zahlungsdatum ist der ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Karte endet auf ${cardNumber}`,
            changeCard: 'Zahlungskarte ändern',
            changeCurrency: 'Zahlungswährung ändern',
            cardNotFound: 'Keine Zahlungskarte hinzugefügt',
            retryPaymentButton: 'Zahlung erneut versuchen',
            authenticatePayment: 'Zahlung authentifizieren',
            requestRefund: 'Rückerstattung anfordern',
            requestRefundModal: {
                full: 'Eine Rückerstattung zu erhalten ist ganz einfach: Stufen Sie Ihr Konto vor Ihrem nächsten Abrechnungsdatum herab und Sie erhalten eine Rückerstattung. <br /> <br /> Hinweis: Wenn Sie Ihr Konto herabstufen, werden Ihre Arbeitsbereiche gelöscht. Diese Aktion kann nicht rückgängig gemacht werden, aber Sie können jederzeit einen neuen Arbeitsbereich erstellen, falls Sie es sich anders überlegen.',
                confirm: 'Arbeitsbereich(e) löschen und Downgrade durchführen',
            },
            viewPaymentHistory: 'Zahlungshistorie anzeigen',
        },
        yourPlan: {
            title: 'Ihr Tarif',
            exploreAllPlans: 'Alle Tarife anzeigen',
            customPricing: 'Individuelle Preise',
            asLowAs: ({price}: YourPlanPriceValueParams) => `bereits ab ${price} pro aktivem Mitglied/Monat`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied/Monat`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied und Monat`,
            perMemberMonth: 'pro Mitglied/Monat',
            collect: {
                title: 'Einsammeln',
                description: 'Der Kleinunternehmensplan, der Ihnen Spesen, Reisen und Chat bietet.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                benefit1: 'Belegerfassung',
                benefit2: 'Erstattungen',
                benefit3: 'Firmenkartenverwaltung',
                benefit4: 'Spesen- und Reisegenehmigungen',
                benefit5: 'Reisebuchungen und -richtlinien',
                benefit6: 'QuickBooks-/Xero-Integrationen',
                benefit7: 'Chat zu Ausgaben, Berichten und Räumen',
                benefit8: 'KI- und menschlicher Support',
            },
            control: {
                title: 'Steuerung',
                description: 'Spesen, Reisen und Chat für größere Unternehmen.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
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
            downgrade: 'Downgrade zu Collect',
            upgrade: 'Upgrade auf Control',
            addMembers: 'Mitglieder hinzufügen',
            saveWithExpensifyTitle: 'Sparen mit der Expensify Card',
            saveWithExpensifyDescription: 'Nutze unseren Sparrechner, um zu sehen, wie das Cashback der Expensify Card deine Expensify-Rechnung senken kann.',
            saveWithExpensifyButton: 'Mehr erfahren',
        },
        compareModal: {
            comparePlans: 'Tarife vergleichen',
            subtitle: `<muted-text>Schalte die Funktionen frei, die du brauchst, mit dem Tarif, der zu dir passt. <a href="${CONST.PRICING}">Sieh dir unsere Preisseite an</a> oder eine vollständige Funktionsübersicht der einzelnen Tarife.</muted-text>`,
        },
        details: {
            title: 'Abonnementdetails',
            annual: 'Jahresabonnement',
            taxExempt: 'Steuerbefreiung beantragen',
            taxExemptEnabled: 'Steuerbefreit',
            taxExemptStatus: 'Steuerbefreiungsstatus',
            payPerUse: 'Nutzungsabhängig',
            subscriptionSize: 'Abonnementgröße',
            headsUp:
                'Hinweis: Wenn du deine Abo-Größe jetzt nicht festlegst, setzen wir sie automatisch auf die Anzahl der aktiven Mitglieder in deinem ersten Monat. Du verpflichtest dich dann, für mindestens diese Anzahl an Mitgliedern für die nächsten 12 Monate zu bezahlen. Du kannst deine Abo-Größe jederzeit erhöhen, aber du kannst sie erst verringern, wenn dein Abonnement abgelaufen ist.',
            zeroCommitment: 'Keine Bindung beim ermäßigten Jahresabonnementpreis',
        },
        subscriptionSize: {
            title: 'Abonnementgröße',
            yourSize: 'Die Größe deines Abonnements ist die Anzahl offener Plätze, die in einem bestimmten Monat von beliebigen aktiven Mitgliedern belegt werden können.',
            eachMonth:
                'Jeden Monat deckt dein Abonnement bis zu der oben festgelegten Anzahl aktiver Mitglieder ab. Jedes Mal, wenn du die Größe deines Abonnements erhöhst, startest du ein neues 12‑Monats-Abonnement mit dieser neuen Größe.',
            note: 'Hinweis: Ein aktives Mitglied ist jede Person, die Ausgabendaten, die mit dem Workspace Ihres Unternehmens verknüpft sind, erstellt, bearbeitet, eingereicht, genehmigt, erstattet oder exportiert hat.',
            confirmDetails: 'Bestätige die Details deines neuen Jahresabonnements:',
            subscriptionSize: 'Abonnementgröße',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} aktive Mitglieder/Monat`,
            subscriptionRenews: 'Abonnement verlängert sich',
            youCantDowngrade: 'Während deines Jahresabonnements kannst du kein Downgrade durchführen.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Sie haben sich bereits bis zum ${date} für ein Jahresabonnement mit ${size} aktiven Mitgliedern pro Monat verpflichtet. Sie können am ${date} zu einem nutzungsbasierten Abonnement wechseln, indem Sie die automatische Verlängerung deaktivieren.`,
            error: {
                size: 'Bitte gib eine gültige Abonnementgröße ein',
                sameSize: 'Bitte gib eine andere Zahl als deine aktuelle Abonnementgröße ein',
            },
        },
        paymentCard: {
            addPaymentCard: 'Zahlungskarte hinzufügen',
            enterPaymentCardDetails: 'Gib deine Kartenzahlungsdetails ein',
            security: 'Expensify ist PCI-DSS-konform, verwendet Verschlüsselung auf Bankniveau und nutzt redundante Infrastruktur, um Ihre Daten zu schützen.',
            learnMoreAboutSecurity: 'Erfahren Sie mehr über unsere Sicherheit.',
        },
        subscriptionSettings: {
            title: 'Abonnementeinstellungen',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Abonnementstyp: ${subscriptionType}, Abonnementsumfang: ${subscriptionSize}, Automatische Verlängerung: ${autoRenew}, Automatische jährliche Sitzplatzerhöhung: ${autoIncrease}`,
            none: 'keine',
            on: 'an',
            off: 'aus',
            annual: 'Jährlich',
            autoRenew: 'Automatische Verlängerung',
            autoIncrease: 'Jährliche Plätze automatisch erhöhen',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Spare bis zu ${amountWithCurrency}/Monat pro aktivem Mitglied`,
            automaticallyIncrease:
                'Erhöhe deine jährlichen Plätze automatisch, um aktive Mitglieder aufzunehmen, die deine Abonnementgröße überschreiten. Hinweis: Dadurch wird das Enddatum deines Jahresabonnements verlängert.',
            disableAutoRenew: 'Automatische Verlängerung deaktivieren',
            helpUsImprove: 'Hilf uns, Expensify zu verbessern',
            whatsMainReason: 'Was ist der Hauptgrund, warum du die automatische Verlängerung deaktivierst?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Wird am ${date} verlängert.`,
            pricingConfiguration: 'Die Preise hängen von der Konfiguration ab. Für den niedrigsten Preis wähle ein Jahresabonnement und nutze die Expensify Card.',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>Erfahre mehr auf unserer <a href="${CONST.PRICING}">Preisseite</a> oder chatte mit unserem Team in deinem ${hasAdminsRoom ? `<a href="adminsRoom">#admins-Raum.</a>` : '#admins-Raum.'}</muted-text>`,
            estimatedPrice: 'Geschätzter Preis',
            changesBasedOn: 'Dies ändert sich je nach Nutzung Ihrer Expensify Card und den untenstehenden Abonnementoptionen.',
        },
        requestEarlyCancellation: {
            title: 'Vorzeitige Kündigung anfordern',
            subtitle: 'Was ist der Hauptgrund, warum du eine vorzeitige Kündigung beantragst?',
            subscriptionCanceled: {
                title: 'Abonnement gekündigt',
                subtitle: 'Ihr Jahresabonnement wurde gekündigt.',
                info: 'Wenn du deine(n) Workspace(s) weiterhin nutzungsbasiert verwenden möchtest, bist du startklar.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Wenn du zukünftige Aktivitäten und Abbuchungen verhindern möchtest, musst du deinen/deine <a href="${workspacesListRoute}">Workspace(s) löschen</a>. Beachte, dass dir beim Löschen deines/deiner Workspace(s) alle offenen Aktivitäten in Rechnung gestellt werden, die im laufenden Kalendermonat angefallen sind.`,
            },
            requestSubmitted: {
                title: 'Anfrage eingereicht',
                subtitle:
                    'Danke, dass Sie uns mitgeteilt haben, dass Sie Ihr Abonnement kündigen möchten. Wir prüfen Ihre Anfrage und melden uns in Kürze über Ihren Chat mit <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Indem ich eine vorzeitige Kündigung beantrage, erkenne ich an und stimme zu, dass Expensify gemäß den Expensify-<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Nutzungsbedingungen</a> oder einer anderen anwendbaren Dienstleistungsvereinbarung zwischen mir und Expensify nicht verpflichtet ist, einem solchen Antrag stattzugeben und dass Expensify nach eigenem Ermessen allein darüber entscheidet, ob einem solchen Antrag stattgegeben wird.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Die Funktionen müssen verbessert werden',
        tooExpensive: 'Zu teuer',
        inadequateSupport: 'Unzureichender Kundensupport',
        businessClosing: 'Unternehmensschließung, Verkleinerung oder Übernahme',
        additionalInfoTitle: 'Zu welcher Software wechselst du und warum?',
        additionalInfoInputLabel: 'Ihre Antwort',
    },
    roomChangeLog: {
        updateRoomDescription: 'setze die Raumbeschreibung auf:',
        clearRoomDescription: 'hat die Raumbeschreibung gelöscht',
        changedRoomAvatar: 'hat den Raum-Avatar geändert',
        removedRoomAvatar: 'hat den Raum-Avatar entfernt',
    },
    delegate: {
        switchAccount: 'Konten wechseln:',
        copilotDelegatedAccess: 'Copilot: Delegierter Zugriff',
        copilotDelegatedAccessDescription: 'Anderen Mitgliedern erlauben, auf dein Konto zuzugreifen.',
        addCopilot: 'Copilot hinzufügen',
        membersCanAccessYourAccount: 'Diese Mitglieder haben Zugriff auf dein Konto:',
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
        genericError: 'Ups, da ist etwas schiefgelaufen. Bitte versuche es erneut.',
        onBehalfOfMessage: (delegator: string) => `im Namen von ${delegator}`,
        accessLevel: 'Zugriffsebene',
        confirmCopilot: 'Bestätige unten deinen Copiloten.',
        accessLevelDescription: 'Wähle unten eine Zugriffsstufe. Sowohl Vollzugriff als auch Eingeschränkter Zugriff erlauben Copilots, alle Unterhaltungen und Ausgaben einzusehen.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Erlauben Sie einem anderen Mitglied, alle Aktionen in Ihrem Konto in Ihrem Namen durchzuführen. Beinhaltet Chat, Einreichungen, Genehmigungen, Zahlungen, Einstellungsaktualisierungen und mehr.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Erlaube einem anderen Mitglied, die meisten Aktionen in deinem Konto in deinem Namen auszuführen. Ausgenommen sind Genehmigungen, Zahlungen, Ablehnungen und Sperren.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copilot entfernen',
        removeCopilotConfirmation: 'Sind Sie sicher, dass Sie diesen Copilot entfernen möchten?',
        changeAccessLevel: 'Zugriffsebene ändern',
        makeSureItIsYou: 'Stellen wir sicher, dass du es bist',
        enterMagicCode: (contactMethod: string) =>
            `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um eine:n Copilot:in hinzuzufügen. Er sollte innerhalb von ein bis zwei Minuten ankommen.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um deinen Copilot zu aktualisieren.`,
        notAllowed: 'Nicht so schnell …',
        noAccessMessage: dedent(`
            Als Copilot hast du keinen Zugriff auf diese Seite. Entschuldigung!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `Als <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">Copilot</a> für ${accountOwnerEmail} hast du keine Berechtigung, diese Aktion auszuführen. Tut uns leid!`,
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
        reportAction: 'Reportaktion',
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
        createTransactionViolation: 'Verstoß bei Transaktion erstellen',
        reasonVisibleInLHN: {
            hasDraftComment: 'Hat Kommentarentwurf',
            hasGBR: 'Hat GBR',
            hasRBR: 'Hat RBR',
            pinnedByUser: 'Angeheftet von Mitglied',
            hasIOUViolations: 'Hat IOU-Verstöße',
            hasAddWorkspaceRoomErrors: 'Workspace-Raum konnte nicht hinzugefügt werden',
            isUnread: 'Ist ungelesen (Fokusmodus)',
            isArchived: 'Ist archiviert (neuester Modus)',
            isSelfDM: 'Ist eigene Direktnachricht',
            isFocused: 'Ist vorübergehend fokussiert',
        },
        reasonGBR: {
            hasJoinRequest: 'Hat Beitrittsanfrage (Admin-Raum)',
            isUnreadWithMention: 'Ist ungelesen mit Erwähnung',
            isWaitingForAssigneeToCompleteAction: 'Wartet darauf, dass die zugewiesene Person die Aktion abschließt',
            hasChildReportAwaitingAction: 'Hat untergeordneten Bericht, der auf Aktion wartet',
            hasMissingInvoiceBankAccount: 'Fehlendes Rechnungsbankkonto vorhanden',
            hasUnresolvedCardFraudAlert: 'Hat eine ungelöste Kartenbetrugswarnung',
        },
        reasonRBR: {
            hasErrors: 'Enthält Fehler in Berichts- oder Berichtaktionsdaten',
            hasViolations: 'Hat Verstöße',
            hasTransactionThreadViolations: 'Hat Transaktions-Thread-Verstöße',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Ein Bericht wartet auf eine Aktion',
            theresAReportWithErrors: 'Es gibt einen Bericht mit Fehlern',
            theresAWorkspaceWithCustomUnitsErrors: 'Es gibt einen Arbeitsbereich mit Fehlern bei benutzerdefinierten Einheiten',
            theresAProblemWithAWorkspaceMember: 'Es gibt ein Problem mit einem Arbeitsbereichsmitglied',
            theresAProblemWithAWorkspaceQBOExport: 'Es gab ein Problem mit einer Exporteinstellung für die Workspace-Verbindung.',
            theresAProblemWithAContactMethod: 'Es gibt ein Problem mit einer Kontaktmethode',
            aContactMethodRequiresVerification: 'Eine Kontaktmethode erfordert eine Verifizierung',
            theresAProblemWithAPaymentMethod: 'Es gibt ein Problem mit einer Zahlungsmethode',
            theresAProblemWithAWorkspace: 'Es gibt ein Problem mit einem Workspace',
            theresAProblemWithYourReimbursementAccount: 'Es gibt ein Problem mit deinem Erstattungskonto',
            theresABillingProblemWithYourSubscription: 'Es gibt ein Abrechnungsproblem mit Ihrem Abonnement',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Ihr Abonnement wurde erfolgreich verlängert',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Während der Synchronisierung der Workspace-Verbindung ist ein Problem aufgetreten',
            theresAProblemWithYourWallet: 'Es gibt ein Problem mit deiner Wallet',
            theresAProblemWithYourWalletTerms: 'Es gibt ein Problem mit deinen Wallet-Bedingungen',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Mach eine Probefahrt',
    },
    migratedUserWelcomeModal: {
        title: 'Willkommen bei New Expensify!',
        subtitle: 'Es enthält alles, was du an unserem klassischen Erlebnis liebst, plus jede Menge Upgrades, die dir das Leben noch einfacher machen:',
        confirmText: "Los geht's!",
        helpText: '2-min-Demo ausprobieren',
        features: {
            search: 'Leistungsstärkere Suche auf Mobilgerät, Web und Desktop',
            concierge: 'Integrierte Concierge-AI zur Automatisierung deiner Spesen',
            chat: 'Chatte zu jeder Ausgabe, um Fragen schnell zu klären',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>Leg jetzt <strong>hier los!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Benenne deine gespeicherten Suchvorgänge um</strong> – hier!</tooltip>',
        accountSwitcher: '<tooltip>Greife hier auf deine <strong>Copilot-Konten</strong> zu</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Scanne unsere Testquittung</strong>, um zu sehen, wie es funktioniert!</tooltip>',
            manager: '<tooltip>Wählen Sie unseren <strong>Testmanager</strong>, um es auszuprobieren!</tooltip>',
            confirmation: '<tooltip>Reiche jetzt deine <strong>Ausgabe ein</strong> und schau zu, wie die Magie passiert!</tooltip>',
            tryItOut: 'Probiere es aus',
        },
        outstandingFilter: '<tooltip>Nach Ausgaben filtern,\ndie <strong>genehmigt werden müssen</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Quittung senden, um\n<strong>die Probefahrt abzuschließen!</strong></tooltip>',
        gpsTooltip: '<tooltip>GPS-Verfolgung läuft! Wenn du fertig bist, stoppe die Verfolgung unten.</tooltip>',
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
            description: 'Stelle sicher, dass die Details unten für dich passen. Sobald du den Anruf bestätigst, senden wir dir eine Einladung mit weiteren Informationen.',
            setupSpecialist: 'Ihre*R Einrichtungsspezialist*in',
            meetingLength: 'Besprechungsdauer',
            dateTime: 'Datum & Uhrzeit',
            minutes: '30 Minuten',
        },
        callScheduled: 'Anruf geplant',
    },
    autoSubmitModal: {
        title: 'Alles klar und eingereicht!',
        description: 'Alle Warnungen und Verstöße wurden bereinigt, also:',
        submittedExpensesTitle: 'Diese Ausgaben wurden eingereicht',
        submittedExpensesDescription: 'Diese Ausgaben wurden an Ihre:n Genehmiger:in gesendet, können aber bis zur Genehmigung weiterhin bearbeitet werden.',
        pendingExpensesTitle: 'Ausstehende Ausgaben wurden verschoben',
        pendingExpensesDescription: 'Alle ausstehenden Kartenausgaben wurden in einen separaten Bericht verschoben, bis sie gebucht sind.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Mach eine 2-minütige Probefahrt',
        },
        modal: {
            title: 'Probier uns aus',
            description: 'Machen Sie eine kurze Produkttour, um schnell auf dem neuesten Stand zu sein.',
            confirmText: 'Probefahrt starten',
            helpText: 'Überspringen',
            employee: {
                description:
                    '<muted-text>Verschaffe deinem Team <strong>3 kostenlose Monate Expensify!</strong> Gib einfach unten die E-Mail-Adresse deiner Chefin/deines Chefs ein und sende ihr/ihm eine Testausgabe.</muted-text>',
                email: 'Gib die E-Mail-Adresse deines Chefs ein',
                error: 'Dieses Mitglied besitzt einen Workspace, bitte gib ein neues Mitglied zum Testen ein.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Du testest Expensify gerade ausprobierst',
            readyForTheRealThing: 'Bereit für das Richtige?',
            getStarted: 'Loslegen',
        },
        employeeInviteMessage: (name: string) => `# ${name} hat dich eingeladen, Expensify auszuprobieren
Hey! Ich habe gerade für uns *3 Monate gratis* bekommen, um Expensify auszuprobieren – die schnellste Art, Spesen abzurechnen.

Hier ist ein *Testbeleg*, um dir zu zeigen, wie es funktioniert:`,
    },
    export: {
        basicExport: 'Standardexport',
        reportLevelExport: 'Alle Daten – Berichtsebene',
        expenseLevelExport: 'Alle Daten – Ausgabenebene',
        exportInProgress: 'Export wird ausgeführt',
        conciergeWillSend: 'Concierge sendet dir die Datei in Kürze.',
    },
    domain: {
        notVerified: 'Nicht verifiziert',
        retry: 'Erneut versuchen',
        verifyDomain: {
            title: 'Domain überprüfen',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Bevor du fortfährst, überprüfe, dass du <strong>${domainName}</strong> besitzt, indem du die DNS-Einstellungen dafür aktualisierst.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Rufe deinen DNS-Anbieter auf und öffne die DNS-Einstellungen für <strong>${domainName}</strong>.`,
            addTXTRecord: 'Fügen Sie den folgenden TXT-Eintrag hinzu:',
            saveChanges: 'Änderungen speichern und hierher zurückkehren, um Ihre Domain zu verifizieren.',
            youMayNeedToConsult: `Möglicherweise müssen Sie sich zur vollständigen Verifizierung an die IT-Abteilung Ihrer Organisation wenden. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Weitere Informationen</a>.`,
            warning: 'Nach der Verifizierung erhalten alle Expensify-Mitglieder in Ihrer Domain eine E-Mail, dass ihr Konto unter Ihrer Domain verwaltet wird.',
            codeFetchError: 'Bestätigungscode konnte nicht abgerufen werden',
            genericError: 'Wir konnten Ihre Domain nicht verifizieren. Bitte versuchen Sie es erneut und wenden Sie sich an Concierge, wenn das Problem weiterhin besteht.',
        },
        domainVerified: {
            title: 'Domain verifiziert',
            header: 'Wooo! Deine Domain wurde verifiziert',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Die Domain <strong>${domainName}</strong> wurde erfolgreich verifiziert und Sie können nun SAML und andere Sicherheitsfunktionen einrichten.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML Single Sign-On (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML-SSO</a> ist ein Sicherheitsfeature, das Ihnen mehr Kontrolle darüber gibt, wie sich Mitglieder mit E-Mail-Adressen von <strong>${domainName}</strong> bei Expensify anmelden. Um es zu aktivieren, müssen Sie sich als autorisierte*r Unternehmensadministrator*in verifizieren.</muted-text>`,
            fasterAndEasierLogin: 'Schnelleres und einfacheres Anmelden',
            moreSecurityAndControl: 'Mehr Sicherheit und Kontrolle',
            onePasswordForAnything: 'Ein Passwort für alles',
        },
        goToDomain: 'Zur Domain wechseln',
        samlLogin: {
            title: 'SAML-Anmeldung',
            subtitle: `<muted-text>Konfiguriere die Anmeldung von Mitgliedern mit <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO).</a></muted-text>`,
            enableSamlLogin: 'SAML-Anmeldung aktivieren',
            allowMembers: 'Mitgliederanmeldung per SAML zulassen.',
            requireSamlLogin: 'SAML-Anmeldung erforderlich',
            anyMemberWillBeRequired: 'Alle Mitglieder, die mit einer anderen Methode angemeldet sind, müssen sich erneut über SAML authentifizieren.',
            enableError: 'SAML-Aktivierungseinstellung konnte nicht aktualisiert werden',
            requireError: 'SAML-Anforderungseinstellung konnte nicht aktualisiert werden',
            disableSamlRequired: 'SAML-Pflicht deaktivieren',
            oktaWarningPrompt: 'Bist du sicher? Dadurch wird auch Okta SCIM deaktiviert.',
            requireWithEmptyMetadataError: 'Bitte fügen Sie unten die Identity-Provider-Metadaten hinzu, um zu aktivieren',
        },
        samlConfigurationDetails: {
            title: 'SAML-Konfigurationsdetails',
            subtitle: 'Verwende diese Angaben, um SAML einzurichten.',
            identityProviderMetadata: 'Metadaten des Identitätsanbieters',
            entityID: 'Entitäts-ID',
            nameIDFormat: 'Name-ID-Format',
            loginUrl: 'Anmelde-URL',
            acsUrl: 'ACS-URL (Assertion Consumer Service-URL)',
            logoutUrl: 'Abmelde-URL',
            sloUrl: 'SLO-URL (Single-Logout-URL)',
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
            accountCreationAndDeletion: 'Erstellung und Löschung von Konten',
            workspaceCreation: 'Arbeitsbereichserstellung',
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
            description: 'Als Nächstes müssen Sie den Besitz der Domain verifizieren und Ihre Sicherheitseinstellungen anpassen.',
            configure: 'Konfigurieren',
        },
        enhancedSecurity: {
            title: 'Erweiterte Sicherheit',
            subtitle: 'Verlange, dass Mitglieder in deiner Domain sich per Single Sign-On anmelden, beschränke das Erstellen von Workspaces und mehr.',
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
            consolidatedDomainBilling: 'Konsolidierte Domainabrechnung',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Wenn diese Option aktiviert ist, bezahlt der Hauptansprechpartner für alle Workspaces, die Mitgliedern von <strong>${domainName}</strong> gehören, und erhält alle Rechnungsbelege.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'Die konsolidierte Domain-Abrechnung konnte nicht geändert werden. Bitte versuche es später erneut.',
            addAdmin: 'Admin hinzufügen',
            addAdminError: 'Dieser Benutzer kann nicht als Admin hinzugefügt werden. Bitte versuche es erneut.',
            revokeAdminAccess: 'Administratorzugriff widerrufen',
            cantRevokeAdminAccess: 'Adminzugriff kann dem technischen Ansprechpartner nicht entzogen werden',
            error: {
                removeAdmin: 'Dieser Benutzer kann nicht als Administrator entfernt werden. Bitte versuche es erneut.',
                removeDomain: 'Diese Domain kann nicht entfernt werden. Bitte versuche es erneut.',
                removeDomainNameInvalid: 'Bitte gib deinen Domainnamen ein, um ihn zurückzusetzen.',
            },
            resetDomain: 'Domain zurücksetzen',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Bitte gib zur Bestätigung der Zurücksetzung der Domain <strong>${domainName}</strong> ein.`,
            enterDomainName: 'Gib hier deinen Domainnamen ein',
            resetDomainInfo: `Diese Aktion ist <strong>dauerhaft</strong> und die folgenden Daten werden gelöscht: <br/> <ul><li>Firmenkartenzuordnungen und alle nicht eingereichten Ausgaben dieser Karten</li> <li>SAML- und Gruppeneinstellungen</li> </ul> Alle Konten, Arbeitsbereiche, Berichte, Ausgaben und andere Daten bleiben erhalten. <br/><br/>Hinweis: Sie können diese Domain aus Ihrer Domainliste entfernen, indem Sie die zugehörige E-Mail-Adresse aus Ihren <a href="#">Kontaktmethoden</a> löschen.`,
        },
        members: {
            title: 'Mitglieder',
            findMember: 'Mitglied suchen',
            addMember: 'Mitglied hinzufügen',
            email: 'E-Mail-Adresse',
            errors: {addMember: 'Dieses Mitglied kann nicht hinzugefügt werden. Bitte versuche es erneut.'},
        },
        domainAdmins: 'Domain-Admins',
    },
    gps: {
        disclaimer: 'Benutze GPS, um eine Ausgabe von deiner Reise zu erstellen. Tippe unten auf „Start“, um mit der Aufzeichnung zu beginnen.',
        error: {failedToStart: 'Standortverfolgung konnte nicht gestartet werden.', failedToGetPermissions: 'Die erforderlichen Standortberechtigungen konnten nicht abgerufen werden.'},
        trackingDistance: 'Strecke wird verfolgt...',
        stopped: 'Angehalten',
        start: 'Start',
        stop: 'Stopp',
        discard: 'Verwerfen',
        stopGpsTrackingModal: {
            title: 'GPS-Tracking stoppen',
            prompt: 'Bist du sicher? Dadurch wird deine aktuelle Reise beendet.',
            cancel: 'Verfolgung fortsetzen',
            confirm: 'GPS-Tracking stoppen',
        },
        discardDistanceTrackingModal: {
            title: 'Entfernungsverfolgung verwerfen',
            prompt: 'Bist du sicher? Dadurch wird deine aktuelle Reise verworfen und kann nicht rückgängig gemacht werden.',
            confirm: 'Entfernungsverfolgung verwerfen',
        },
        zeroDistanceTripModal: {title: 'Ausgabe kann nicht erstellt werden', prompt: 'Sie können keine Ausgabe mit demselben Start- und Zielort erstellen.'},
        locationRequiredModal: {
            title: 'Standortzugriff erforderlich',
            prompt: 'Bitte erlaube den Standortzugriff in den Einstellungen deines Geräts, um die GPS-Distanzverfolgung zu starten.',
            allow: 'Erlauben',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Zugriff auf den Standort im Hintergrund erforderlich',
            prompt: 'Bitte erlaube den Zugriff auf den Standort im Hintergrund in den Geräteeinstellungen (Option „Immer zulassen“), um die GPS-Distanzverfolgung zu starten.',
        },
        preciseLocationRequiredModal: {
            title: 'Genaue Position erforderlich',
            prompt: 'Bitte aktiviere „genaue Standortbestimmung“ in den Einstellungen deines Geräts, um die GPS‑Streckenverfolgung zu starten.',
        },
        desktop: {
            title: 'Entfernung auf deinem Handy verfolgen',
            subtitle: 'Protokolliere Meilen oder Kilometer automatisch mit GPS und verwandle Fahrten sofort in Ausgaben.',
            button: 'App herunterladen',
        },
        notification: {title: 'GPS-Tracking läuft', body: 'Zur App gehen, um abzuschließen'},
        signOutWarningTripInProgress: {title: 'GPS-Tracking läuft', prompt: 'Sind Sie sicher, dass Sie die Reise verwerfen und sich abmelden möchten?', confirm: 'Verwerfen und abmelden'},
        locationServicesRequiredModal: {
            title: 'Standortzugriff erforderlich',
            confirm: 'Einstellungen öffnen',
            prompt: 'Bitte erlaube den Standortzugriff in den Einstellungen deines Geräts, um die GPS-Distanzverfolgung zu starten.',
        },
        fabGpsTripExplained: 'Zur GPS-Ansicht wechseln (Schnellaktion)',
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
