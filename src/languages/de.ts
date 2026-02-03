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
/* eslint-disable max-len */
const translations: TranslationDeepObject<typeof en> = {
    common: {
        // @context Used as a noun meaning a numerical total or quantity, not the verb “to count.”
        count: 'Anzahl',
        cancel: 'Abbrechen',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: 'Schließen',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: 'Weiter',
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
        to: 'An',
        in: 'In',
        optional: 'Optional',
        new: 'Neu',
        newFeature: 'Neue Funktion',
        search: 'Suchen',
        reports: 'Berichte',
        find: 'Suchen',
        searchWithThreeDots: 'Suchen ...',
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
        workspaces: 'Arbeitsbereiche',
        home: 'Startseite',
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
        scanning: 'Scannen',
        analyzing: 'Analysiere ...',
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
        ssnFull9: 'Vollständige 9-stellige SSN',
        addressLine: (lineNumber: number) => `Adresszeile ${lineNumber}`,
        personalAddress: 'Persönliche Adresse',
        companyAddress: 'Firmenadresse',
        noPO: 'Bitte keine Postfächer oder Postannahmestellen.',
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
        owner: 'Inhaber',
        dateFormat: 'YYYY-MM-DD',
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
        genericErrorMessage: 'Ups ... etwas ist schiefgelaufen und deine Anfrage konnte nicht abgeschlossen werden. Bitte versuche es später noch einmal.',
        percentage: 'Prozentsatz',
        converted: 'Konvertiert',
        error: {
            invalidAmount: 'Ungültiger Betrag',
            acceptTerms: 'Sie müssen die Nutzungsbedingungen akzeptieren, um fortzufahren',
            phoneNumber: `Bitte gib eine vollständige Telefonnummer ein
(z. B. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Dieses Feld ist erforderlich',
            requestModified: 'Diese Anfrage wird gerade von einem anderen Mitglied bearbeitet',
            characterLimitExceedCounter: (length: number, limit: number) => `Zeichenlimit überschritten (${length}/${limit})`,
            dateInvalid: 'Bitte wähle ein gültiges Datum aus',
            invalidDateShouldBeFuture: 'Bitte wähle das heutige oder ein zukünftiges Datum',
            invalidTimeShouldBeFuture: 'Bitte wähle eine Uhrzeit, die mindestens eine Minute in der Zukunft liegt',
            invalidCharacter: 'Ungültiges Zeichen',
            enterMerchant: 'Gib einen Händlernamen ein',
            enterAmount: 'Gib einen Betrag ein',
            missingMerchantName: 'Fehlender Händlername',
            missingAmount: 'Fehlender Betrag',
            missingDate: 'Fehlendes Datum',
            enterDate: 'Datum eingeben',
            invalidTimeRange: 'Bitte gib eine Uhrzeit im 12-Stunden-Format ein (z. B. 2:30 PM)',
            pleaseCompleteForm: 'Bitte füllen Sie das Formular oben aus, um fortzufahren',
            pleaseSelectOne: 'Bitte wählen Sie oben eine Option aus',
            invalidRateError: 'Bitte einen gültigen Satz eingeben',
            lowRateError: 'Der Satz muss größer als 0 sein',
            email: 'Bitte eine gültige E-Mail-Adresse eingeben',
            login: 'Beim Anmelden ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        comma: 'Komma',
        semicolon: 'Semikolon',
        please: 'Bitte',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'Kontaktiere uns',
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
        transferBalance: 'Kontostand übertragen',
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
        verify: 'Verifizieren',
        yesContinue: 'Ja, fortfahren',
        // @context Provides an example format for a website URL.
        websiteExample: 'z. B. https://www.expensify.com',
        // @context Provides an example format for a ZIP/postal code.
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `z. B. ${zipSampleFormat}` : ''),
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
        letsDoThis: `Los geht’s!`,
        letsStart: `Lass uns anfangen`,
        showMore: 'Mehr anzeigen',
        showLess: 'Weniger anzeigen',
        merchant: 'Händler',
        change: 'Ändern',
        category: 'Kategorie',
        report: 'Bericht',
        billable: 'Abrechenbar',
        nonBillable: 'Nicht verrechenbar',
        tag: 'Tag',
        receipt: 'Beleg',
        verified: 'Verifiziert',
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
        tbd: 'Noch festzulegen',
        selectCurrency: 'Währung auswählen',
        selectSymbolOrCurrency: 'Symbol oder Währung auswählen',
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
        shared: 'Geteilt',
        drafts: 'Entwürfe',
        // @context as a noun, not a verb
        draft: 'Entwurf',
        finished: 'Fertig',
        upgrade: 'Upgrade',
        downgradeWorkspace: 'Arbeitsbereich herabstufen',
        companyID: 'Unternehmens-ID',
        userID: 'Benutzer-ID',
        disable: 'Deaktivieren',
        export: 'Export',
        initialValue: 'Anfangswert',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: 'Aktuelles Datum',
        value: 'Wert',
        downloadFailedTitle: 'Download fehlgeschlagen',
        downloadFailedDescription: 'Dein Download konnte nicht abgeschlossen werden. Bitte versuche es später noch einmal.',
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
        secondAbbreviation: 's',
        skip: 'Überspringen',
        chatWithAccountManager: (accountManagerDisplayName: string) => `Sie brauchen etwas Bestimmtes? Chatten Sie mit Ihrer/Ihrem Kundenbetreuer(in), ${accountManagerDisplayName}.`,
        chatNow: 'Jetzt chatten',
        workEmail: 'Geschäftliche E-Mail-Adresse',
        destination: 'Ziel',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: 'Nebensatzsatz',
        perDiem: 'Tagespauschale',
        validate: 'Validieren',
        downloadAsPDF: 'Als PDF herunterladen',
        downloadAsCSV: 'Als CSV herunterladen',
        help: 'Hilfe',
        expenseReport: 'Spesenabrechnung',
        expenseReports: 'Spesenberichte',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'Satz außerhalb der Richtlinie',
        leaveWorkspace: 'Arbeitsbereich verlassen',
        leaveWorkspaceConfirmation: 'Wenn du diesen Workspace verlässt, kannst du keine Ausgaben mehr dafür einreichen.',
        leaveWorkspaceConfirmationAuditor: 'Wenn du diesen Arbeitsbereich verlässt, kannst du seine Berichte und Einstellungen nicht mehr anzeigen.',
        leaveWorkspaceConfirmationAdmin: 'Wenn du diesen Workspace verlässt, kannst du seine Einstellungen nicht mehr verwalten.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Arbeitsbereich verlässt, wirst du im Genehmigungsworkflow durch ${workspaceOwner}, den/die Arbeitsbereichseigentümer(in), ersetzt.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Workspace verlässt, wirst du als bevorzugte*r Exporteur*in durch ${workspaceOwner}, den/die Workspace-Inhaber*in, ersetzt.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Workspace verlässt, wirst du als technischer Kontakt durch ${workspaceOwner}, den Workspace-Inhaber, ersetzt.`,
        leaveWorkspaceReimburser:
            'Du kannst diesen Workspace als Erstattende*r nicht verlassen. Bitte lege unter „Workspaces > Zahlungen senden oder nachverfolgen“ eine*n neue*n Erstattende*n fest und versuche es dann erneut.',
        reimbursable: 'Erstattungsfähig',
        editYourProfile: 'Profil bearbeiten',
        comments: 'Kommentare',
        sharedIn: 'Geteilt in',
        unreported: 'Nicht gemeldet',
        explore: 'Entdecken',
        insights: 'Einblicke',
        todo: 'To-do',
        invoice: 'Rechnung',
        expense: 'Ausgabe',
        chat: 'Chat',
        task: 'Aufgabe',
        trip: 'Reise',
        apply: 'Anwenden',
        status: 'Status',
        on: 'Ein',
        before: 'Vor',
        after: 'Nach',
        reschedule: 'Verschieben',
        general: 'Allgemein',
        workspacesTabTitle: 'Arbeitsbereiche',
        headsUp: 'Achtung!',
        submitTo: 'Senden an',
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
        read: 'Gelesen',
        copyToClipboard: 'In Zwischenablage kopieren',
        thisIsTakingLongerThanExpected: 'Das dauert länger als erwartet ...',
        domains: 'Domänen',
        actionRequired: 'Aktion erforderlich',
        duplicate: 'Duplizieren',
        duplicated: 'Dupliziert',
        duplicateExpense: 'Ausgabe duplizieren',
        exchangeRate: 'Wechselkurs',
        reimbursableTotal: 'Erstattungsfähiger Gesamtbetrag',
        nonReimbursableTotal: 'Nicht erstattungsfähiger Gesamtbetrag',
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
            `Sie sind nicht berechtigt, diese Aktion auszuführen, wenn der Support angemeldet ist (Befehl: ${command ?? ''}). Wenn Sie der Meinung sind, dass Success diese Aktion ausführen können sollte, beginnen Sie bitte ein Gespräch in Slack.`,
    },
    lockedAccount: {
        title: 'Gesperrtes Konto',
        description: 'Sie dürfen diese Aktion nicht ausführen, da dieses Konto gesperrt wurde. Bitte wenden Sie sich an concierge@expensify.com, um die nächsten Schritte zu erfahren.',
    },
    location: {
        useCurrent: 'Aktuellen Standort verwenden',
        notFound: 'Wir konnten Ihren Standort nicht finden. Bitte versuchen Sie es erneut oder geben Sie eine Adresse manuell ein.',
        permissionDenied: 'Es sieht so aus, als hättest du den Zugriff auf deinen Standort verweigert.',
        please: 'Bitte',
        allowPermission: 'Standortzugriff in den Einstellungen erlauben',
        tryAgain: 'und versuche es erneut.',
    },
    contact: {
        importContacts: 'Kontakte importieren',
        importContactsTitle: 'Importiere deine Kontakte',
        importContactsText: 'Importiere Kontakte von deinem Handy, damit deine Lieblingsmenschen immer nur einen Tipp entfernt sind.',
        importContactsExplanation: 'damit deine Lieblingsmenschen immer nur einen Fingertipp entfernt sind.',
        importContactsNativeText: 'Nur noch ein Schritt! Gib uns grünes Licht, um deine Kontakte zu importieren.',
    },
    anonymousReportFooter: {
        logoTagline: 'Beteilige dich an der Diskussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Kamerazugriff',
        expensifyDoesNotHaveAccessToCamera: 'Expensify kann ohne Zugriff auf deine Kamera keine Fotos aufnehmen. Tippe auf „Einstellungen“, um die Berechtigungen zu aktualisieren.',
        attachmentError: 'Anhangfehler',
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
        folderNotAllowedMessage: 'Das Hochladen eines Ordners ist nicht erlaubt. Bitte versuchen Sie es mit einer anderen Datei.',
        protectedPDFNotSupported: 'Passwortgeschützte PDF-Datei wird nicht unterstützt',
        attachmentImageResized: 'Dieses Bild wurde für die Vorschau verkleinert. Lade es für die volle Auflösung herunter.',
        attachmentImageTooLarge: 'Dieses Bild ist zu groß, um vor dem Hochladen eine Vorschau anzuzeigen.',
        tooManyFiles: (fileLimit: number) => `Sie können jeweils nur bis zu ${fileLimit} Dateien hochladen.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Dateien überschreiten ${maxUploadSizeInMB} MB. Bitte versuche es erneut.`,
        someFilesCantBeUploaded: 'Einige Dateien können nicht hochgeladen werden',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Dateien müssen kleiner als ${maxUploadSizeInMB} MB sein. Größere Dateien werden nicht hochgeladen.`,
        maxFileLimitExceeded: 'Du kannst bis zu 30 Belege auf einmal hochladen. Weitere Belege werden nicht hochgeladen.',
        unsupportedFileType: (fileType: string) => `${fileType}-Dateien werden nicht unterstützt. Es werden nur unterstützte Dateitypen hochgeladen.`,
        learnMoreAboutSupportedFiles: 'Erfahre mehr über unterstützte Formate.',
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
        title: 'Verbindung abgeschlossen',
        supportingText: 'Sie können dieses Fenster schließen und zur Expensify-App zurückkehren.',
    },
    avatarCropModal: {
        title: 'Foto bearbeiten',
        description: 'Ziehe, zoome und drehe dein Bild, wie du möchtest.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Keine Erweiterung für MIME-Typ gefunden',
        problemGettingImageYouPasted: 'Beim Abrufen des eingefügten Bildes ist ein Problem aufgetreten',
        commentExceededMaxLength: (formattedMaxLength: string) => `Die maximale Kommentarlänge beträgt ${formattedMaxLength} Zeichen.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `Die maximale Aufgaben-Titellänge beträgt ${formattedMaxLength} Zeichen.`,
    },
    baseUpdateAppModal: {
        updateApp: 'App aktualisieren',
        updatePrompt: 'Eine neue Version dieser App ist verfügbar.\nAktualisiere sie jetzt oder starte die App später neu, um die neuesten Änderungen herunterzuladen.',
    },
    deeplinkWrapper: {
        launching: 'Expensify wird gestartet',
        expired: 'Ihre Sitzung ist abgelaufen.',
        signIn: 'Bitte melde dich erneut an.',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: 'Biometrie-Test',
            authenticationSuccessful: 'Authentifizierung erfolgreich',
            successfullyAuthenticatedUsing: ({authType}: MultifactorAuthenticationTranslationParams) => `Du hast dich erfolgreich mit ${authType} authentifiziert.`,
            troubleshootBiometricsStatus: ({registered}: MultifactorAuthenticationTranslationParams) => `Biometrie (${registered ? 'Registriert' : 'Nicht registriert'})`,
            yourAttemptWasUnsuccessful: 'Ihr Authentifizierungsversuch war nicht erfolgreich.',
            youCouldNotBeAuthenticated: 'Sie konnten nicht authentifiziert werden',
            areYouSureToReject: 'Bist du sicher? Der Authentifizierungsversuch wird abgelehnt, wenn du diesen Bildschirm schließt.',
            rejectAuthentication: 'Authentifizierung ablehnen',
            test: 'Test',
            biometricsAuthentication: 'Biometrische Authentifizierung',
        },
        pleaseEnableInSystemSettings: {
            start: 'Bitte aktivieren Sie die Gesichts-/Fingerabdrucküberprüfung oder legen Sie einen Gerätecode fest in Ihren',
            link: 'Systemeinstellungen',
            end: '.',
        },
        oops: 'Ups, etwas ist schiefgelaufen',
        looksLikeYouRanOutOfTime: 'Anscheinend ist Ihre Zeit abgelaufen! Bitte versuchen Sie es erneut beim Händler.',
        youRanOutOfTime: 'Die Zeit ist abgelaufen',
        letsVerifyItsYou: 'Bestätigen Sie bitte Ihre Identität',
        verifyYourself: {
            biometrics: 'Bestätige dich mit deinem Gesicht oder Fingerabdruck',
        },
        enableQuickVerification: {
            biometrics: 'Aktiviere eine schnelle, sichere Verifizierung mit deinem Gesicht oder Fingerabdruck. Keine Passwörter oder Codes erforderlich.',
        },
        revoke: {
            remove: 'Entfernen',
            title: 'Gesicht/Fingerabdruck & Passkeys',
            explanation:
                'Gesichts-/Fingerabdruck- oder Passkey-Verifizierung ist auf einem oder mehreren Geräten aktiviert. Das Widerrufen des Zugriffs erfordert einen magischen Code für die nächste Verifizierung auf jedem Gerät.',
            confirmationPrompt: 'Bist du sicher? Du brauchst einen magischen Code für die nächste Verifizierung auf jedem Gerät.',
            cta: 'Zugriff entziehen',
            noDevices: 'Du hast keine Geräte für Gesichts-/Fingerabdruck- oder Passkey-Verifizierung registriert. Wenn du welche registrierst, kannst du den Zugriff hier widerrufen.',
            dismiss: 'Verstanden',
            error: 'Anfrage fehlgeschlagen. Versuche es später noch einmal.',
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
            Bitte gib den Code von dem Gerät ein,
            auf dem er ursprünglich angefordert wurde
        `),
        doNotShare: dedent(`
            Teilen Sie Ihren Code mit niemandem.
            Expensify wird Sie niemals danach fragen!
        `),
        or: 'oder',
        signInHere: 'hier einfach anmelden',
        expiredCodeTitle: 'Magic-Code abgelaufen',
        expiredCodeDescription: 'Geh zurück zum ursprünglichen Gerät und fordere einen neuen Code an',
        successfulNewCodeRequest: 'Code angefordert. Bitte überprüfen Sie Ihr Gerät.',
        tfaRequiredTitle: dedent(`
            Zwei-Faktor-Authentifizierung erforderlich
        `),
        tfaRequiredDescription: dedent(`
            Bitte gib den Zwei-Faktor-Authentifizierungscode dort ein, wo du versuchst, dich anzumelden.
        `),
        requestOneHere: 'Fordere hier eine an.',
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
        description: 'Ihr Unternehmen verwendet in diesem Workspace einen benutzerdefinierten Genehmigungs-Workflow. Bitte führen Sie diese Aktion in Expensify Classic aus',
        goToExpensifyClassic: 'Zu Expensify Classic wechseln',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Reiche eine Ausgabe ein, empfehle dein Team',
            subtitleText: 'Möchtest du, dass dein Team Expensify auch nutzt? Reiche ihnen einfach eine Ausgabe ein, und wir kümmern uns um den Rest.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Einen Anruf buchen',
    },
    hello: 'Hallo',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Fange unten an.',
        anotherLoginPageIsOpen: 'Eine weitere Anmeldeseite ist geöffnet.',
        anotherLoginPageIsOpenExplanation: 'Du hast die Anmeldeseite in einem separaten Tab geöffnet. Bitte melde dich in diesem Tab an.',
        welcome: 'Willkommen!',
        welcomeWithoutExclamation: 'Willkommen',
        phrase2: 'Geld spricht Bände. Und jetzt, da Chat und Zahlungen an einem Ort sind, ist es auch einfach.',
        phrase3: 'Deine Zahlungen erreichen dich so schnell, wie du deinen Standpunkt klarmachen kannst.',
        enterPassword: 'Bitte gib dein Passwort ein',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, es ist immer schön, ein neues Gesicht hier zu sehen!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Bitte gib den magischen Code ein, der an ${login} gesendet wurde. Er sollte in ein bis zwei Minuten ankommen.`,
    },
    login: {
        hero: {
            header: 'Reisen und Ausgaben mit der Geschwindigkeit von Chats',
            body: 'Willkommen bei der nächsten Generation von Expensify, in der Ihre Reisen und Ausgaben mit kontextbezogenem Echtzeit-Chat noch schneller erledigt werden.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Mit Single Sign-On weiter anmelden:',
        orContinueWithMagicCode: 'Sie können sich auch mit einem magischen Code anmelden',
        useSingleSignOn: 'Einmalanmeldung verwenden',
        useMagicCode: 'Magischen Code verwenden',
        launching: 'Wird gestartet...',
        oneMoment: 'Einen Moment, wir leiten dich zu deinem Single-Sign-on-Portal deines Unternehmens weiter.',
    },
    reportActionCompose: {
        dropToUpload: 'Zum Hochladen hierher ziehen',
        sendAttachment: 'Anhang senden',
        addAttachment: 'Anhang hinzufügen',
        writeSomething: 'Schreib etwas …',
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
        copyURLToClipboard: 'URL in die Zwischenablage kopieren',
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
            return `Möchten Sie dieses ${type} wirklich löschen?`;
        },
        onlyVisible: 'Nur sichtbar für',
        explain: 'Erklären',
        explainMessage: 'Bitte erklären Sie mir das.',
        replyInThread: 'Im Thread antworten',
        joinThread: 'Thread beitreten',
        leaveThread: 'Thread verlassen',
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
            `Dieser Chat ist mit allen Expensify-Mitgliedern in der Domäne <strong>${domainRoom}</strong>. Nutze ihn, um mit Kolleg*innen zu chatten, Tipps auszutauschen und Fragen zu stellen.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Dieser Chat ist mit dem*der Admin von <strong>${workspaceName}</strong>. Verwende ihn, um über die Einrichtung des Workspaces und mehr zu chatten.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `Dieser Chat ist mit allen in <strong>${workspaceName}</strong>. Verwende ihn für die wichtigsten Ankündigungen.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Dieser Chatraum ist für alles gedacht, was mit <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> zu tun hat.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Dieser Chat ist für Rechnungen zwischen <strong>${invoicePayer}</strong> und <strong>${invoiceReceiver}</strong>. Verwende die +‑Taste, um eine Rechnung zu senden.`,
        beginningOfChatHistory: (users: string) => `Dieser Chat ist mit ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `Hier wird <strong>${submitterDisplayName}</strong> Ausgaben bei <strong>${workspaceName}</strong> einreichen. Verwende einfach die +‑Schaltfläche.`,
        beginningOfChatHistorySelfDM: 'Dies ist dein persönlicher Bereich. Nutze ihn für Notizen, Aufgaben, Entwürfe und Erinnerungen.',
        beginningOfChatHistorySystemDM: 'Willkommen! Lass uns dein Konto einrichten.',
        chatWithAccountManager: 'Hier mit Ihrer Kundenbetreuung chatten',
        askMeAnything: 'Frag mich alles!',
        sayHello: 'Sag Hallo!',
        yourSpace: 'Ihr Bereich',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Willkommen bei ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Verwende die +‑Schaltfläche, um eine Ausgabe zu ${additionalText}.`,
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
    adminOnlyCanPost: 'Nur Admins können Nachrichten in diesem Raum senden.',
    reportAction: {
        asCopilot: 'als Copilot für',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `hat diesen Bericht erstellt, um alle Ausgaben aus <a href="${reportUrl}">${reportName}</a> aufzunehmen, die nicht mit deiner gewählten Häufigkeit eingereicht werden konnten`,
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
        isTyping: 'tippt...',
        areTyping: 'tippen ...',
        multipleMembers: 'Mehrere Mitglieder',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Dieser Chatraum wurde archiviert.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${displayName} sein Konto geschlossen hat.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${oldDisplayName} ihr Konto mit ${displayName} zusammengelegt hat.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Dieser Chat ist nicht mehr aktiv, da <strong>du</strong> kein Mitglied des Workspaces ${policyName} mehr bist.`
                : `Dieser Chat ist nicht mehr aktiv, weil ${displayName} kein Mitglied des Workspace ${policyName} mehr ist.`,
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
            admins: 'Nur Admins',
        },
    },
    sidebarScreen: {
        buttonFind: 'Etwas finden …',
        buttonMySettings: 'Meine Einstellungen',
        fabNewChat: 'Chat starten',
        fabNewChatExplained: 'Aktionsmenü öffnen',
        fabScanReceiptExplained: 'Beleg scannen',
        chatPinned: 'Chat angeheftet',
        draftedMessage: 'Entwurfene Nachricht',
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
            cta: 'Erstattung',
            offer50off: {
                title: 'Sichere dir 50 % Rabatt im ersten Jahr!',
                subtitle: ({formattedTime}: {formattedTime: string}) => `${formattedTime} verbleibend`,
            },
            offer25off: {
                title: 'Erhalte 25 % Rabatt im ersten Jahr!',
                subtitle: ({days}: {days: number}) => `${days} ${days === 1 ? 'Tag' : 'Tage'} verbleibend`,
            },
            addShippingAddress: {
                title: 'Wir benötigen Ihre Versandadresse',
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
            menuItemTitleNonAdmin: 'Erfahre, wie du Ausgaben erstellst und Berichte einreichst.',
            menuItemTitleAdmin: 'Erfahren Sie, wie Sie Mitglieder einladen, Genehmigungs-Workflows bearbeiten und Firmenkarten abstimmen.',
            menuItemDescription: 'Sieh dir in 2 Minuten an, was Expensify kann',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `${count} ${count === 1 ? 'Bericht' : 'Berichte'} einreichen`,
            approve: ({count}: {count: number}) => `${count} ${count === 1 ? 'Bericht' : 'Berichte'} genehmigen`,
            pay: ({count}: {count: number}) => `${count} ${count === 1 ? 'Bericht' : 'Berichte'} zahlen`,
            export: ({count}: {count: number}) => `${count} ${count === 1 ? 'Bericht' : 'Berichte'} exportieren`,
            begin: 'Beginnen',
            emptyStateMessages: {
                nicelyDone: 'Gut gemacht',
                keepAnEyeOut: 'Bleib gespannt auf das, was als Nächstes kommt!',
                allCaughtUp: 'Du bist auf dem neuesten Stand',
                upcomingTodos: 'Anstehende Aufgaben werden hier angezeigt.',
            },
        },
    },
    allSettingsScreen: {
        subscription: 'Abonnement',
        domains: 'Domänen',
    },
    tabSelector: {
        chat: 'Chat',
        room: 'Raum',
        distance: 'Entfernung',
        manual: 'Handbuch',
        scan: 'Scannen',
        map: 'Karte',
        gps: 'GPS',
        odometer: 'Kilometerzähler',
    },
    spreadsheet: {
        upload: 'Tabellenkalkulation hochladen',
        import: 'Tabellendokument importieren',
        dragAndDrop: '<muted-link>Ziehen Sie Ihre Tabelle hierher und legen Sie sie ab, oder wählen Sie unten eine Datei aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Ziehen Sie Ihre Tabelle per Drag &amp; Drop hierher oder wählen Sie unten eine Datei aus. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Erfahren Sie mehr</a> über unterstützte Dateiformate.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Wähle eine Tabellenkalkulationsdatei zum Importieren aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Wähle eine Tabellenkalkulationsdatei zum Importieren aus. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Erfahre mehr</a> über unterstützte Dateiformate.</muted-link>`,
        fileContainsHeader: 'Datei enthält Spaltenüberschriften',
        column: (name: string) => `Spalte ${name}`,
        fieldNotMapped: (fieldName: string) => `Oops! Ein erforderliches Feld („${fieldName}“) wurde nicht zugeordnet. Bitte überprüfe alles und versuche es erneut.`,
        singleFieldMultipleColumns: (fieldName: string) => `Ups! Du hast ein einzelnes Feld („${fieldName}“) mehreren Spalten zugeordnet. Bitte überprüfe dies und versuche es erneut.`,
        emptyMappedField: (fieldName: string) => `Ups! Das Feld („${fieldName}“) enthält einen oder mehrere leere Werte. Bitte überprüfen und versuche es erneut.`,
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
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `${rates} Tagessätze wurden hinzugefügt.` : '1 Pauschale wurde hinzugefügt.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `${transactions} Transaktionen wurden importiert.` : '1 Transaktion wurde importiert.',
        importFailedTitle: 'Import fehlgeschlagen',
        importFailedDescription:
            'Bitte stellen Sie sicher, dass alle Felder korrekt ausgefüllt sind, und versuchen Sie es erneut. Wenn das Problem weiterhin besteht, wenden Sie sich bitte an Concierge.',
        importDescription: 'Wähle aus, welche Felder aus deiner Tabelle zugeordnet werden sollen, indem du unten auf das Dropdown-Menü neben jeder importierten Spalte klickst.',
        sizeNotMet: 'Dateigröße muss größer als 0 Byte sein',
        invalidFileMessage:
            'Die von dir hochgeladene Datei ist entweder leer oder enthält ungültige Daten. Bitte stelle sicher, dass die Datei korrekt formatiert ist und alle erforderlichen Informationen enthält, bevor du sie erneut hochlädst.',
        importSpreadsheetLibraryError: 'Das Tabellenkalkulationsmodul konnte nicht geladen werden. Bitte überprüfe deine Internetverbindung und versuche es erneut.',
        importSpreadsheet: 'Tabellendokument importieren',
        downloadCSV: 'CSV herunterladen',
        importMemberConfirmation: () => ({
            one: `Bitte bestätige die folgenden Details für ein neues Workspace-Mitglied, das mit diesem Upload hinzugefügt wird. Vorhandene Mitglieder erhalten keine Rollenaktualisierungen oder Einladungsnachrichten.`,
            other: (count: number) =>
                `Bitte bestätige die folgenden Details für die ${count} neuen Workspace-Mitglieder, die im Rahmen dieses Uploads hinzugefügt werden. Bestehende Mitglieder erhalten keine Rollenaktualisierungen oder Einladungsnachrichten.`,
        }),
    },
    receipt: {
        upload: 'Beleg hochladen',
        uploadMultiple: 'Belege hochladen',
        desktopSubtitleSingle: `oder hierher ziehen und ablegen`,
        desktopSubtitleMultiple: `oder hierher ziehen und ablegen`,
        alternativeMethodsTitle: 'Weitere Möglichkeiten, Belege hinzuzufügen:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">App herunterladen</a>, um vom Handy aus zu scannen</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Leite Belege weiter an <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Füge deine Nummer hinzu</a>, um Belege an ${phoneNumber} zu senden</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Sende Beleg-SMS an ${phoneNumber} (nur US-Nummern)</label-text>`,
        takePhoto: 'Foto aufnehmen',
        cameraAccess: 'Kamerazugriff ist erforderlich, um Belege zu fotografieren.',
        deniedCameraAccess: `Der Kamerazugriff wurde noch nicht erteilt. Bitte folge <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">diesen Anweisungen</a>.`,
        cameraErrorTitle: 'Kamerafehler',
        cameraErrorMessage: 'Beim Aufnehmen eines Fotos ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        locationAccessTitle: 'Standortzugriff erlauben',
        locationAccessMessage: 'Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall korrekt zu halten.',
        locationErrorTitle: 'Standortzugriff erlauben',
        locationErrorMessage: 'Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall korrekt zu halten.',
        allowLocationFromSetting: `Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall korrekt zu halten. Bitte erlauben Sie den Standortzugriff in den Berechtigungseinstellungen Ihres Geräts.`,
        dropTitle: 'Lass es los',
        dropMessage: 'Datei hier ablegen',
        flash: 'Blitz',
        multiScan: 'Mehrfachscan',
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
        noLongerHaveReportAccess: 'Sie haben keinen Zugriff mehr auf Ihr bisheriges Schnellaktionsziel. Wählen Sie unten ein neues aus.',
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
        cash: 'Barzahlung',
        card: 'Karte',
        original: 'Original',
        split: 'Aufteilen',
        splitExpense: 'Ausgabe aufteilen',
        splitDates: 'Aufteilungsdaten',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} bis ${endDate} (${count} Tage)`,
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} von ${merchant}`,
        splitByPercentage: 'Nach Prozentsatz aufteilen',
        splitByDate: 'Nach Datum aufteilen',
        addSplit: 'Aufteilung hinzufügen',
        makeSplitsEven: 'Aufteilungen ausgleichen',
        editSplits: 'Splits bearbeiten',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist um ${amount} höher als die ursprüngliche Ausgabe.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist um ${amount} niedriger als die ursprüngliche Ausgabe.`,
        splitExpenseZeroAmount: 'Bitte gib einen gültigen Betrag ein, bevor du fortfährst.',
        splitExpenseOneMoreSplit: 'Keine Aufteilungen hinzugefügt. Füge mindestens eine hinzu, um zu speichern.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `${amount} für ${merchant} bearbeiten`,
        removeSplit: 'Aufteilung entfernen',
        splitExpenseCannotBeEditedModalTitle: 'Diese Ausgabe kann nicht bearbeitet werden',
        splitExpenseCannotBeEditedModalDescription: 'Genehmigte oder bezahlte Ausgaben können nicht bearbeitet werden',
        splitExpenseDistanceErrorModalDescription: 'Bitte behebe den Fehler beim Kilometer-Satz und versuche es erneut.',
        paySomeone: ({name}: PaySomeoneParams = {}) => `${name ?? 'jemand'} bezahlen`,
        expense: 'Ausgabe',
        categorize: 'Kategorisieren',
        share: 'Teilen',
        participants: 'Teilnehmende',
        createExpense: 'Ausgabe erstellen',
        trackDistance: 'Entfernung erfassen',
        createExpenses: (expensesNumber: number) => `${expensesNumber} Ausgaben erstellen`,
        removeExpense: 'Ausgabe entfernen',
        removeThisExpense: 'Diesen Beleg entfernen',
        removeExpenseConfirmation: 'Möchtest du diesen Beleg wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
        addExpense: 'Ausgabe hinzufügen',
        chooseRecipient: 'Empfänger auswählen',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Erstelle Ausgabe über ${amount}`,
        confirmDetails: 'Details bestätigen',
        pay: 'Bezahlen',
        cancelPayment: 'Zahlung stornieren',
        cancelPaymentConfirmation: 'Sind Sie sicher, dass Sie diese Zahlung stornieren möchten?',
        viewDetails: 'Details ansehen',
        pending: 'Ausstehend',
        canceled: 'Storniert',
        posted: 'Gebucht',
        deleteReceipt: 'Beleg löschen',
        findExpense: 'Ausgabe suchen',
        deletedTransaction: (amount: string, merchant: string) => `hat eine Ausgabe gelöscht (${amount} für ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `hat eine Ausgabe verschoben${reportName ? `von ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `diese Ausgabe verschoben${reportName ? `zu <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `hat diese Ausgabe verschoben${reportName ? `von <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `hat diese Ausgabe in deinen <a href="${reportUrl}">persönlichen Bereich</a> verschoben`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `hat diesen Bericht in den Workspace <a href="${newParentReportUrl}">${toPolicyName}</a> verschoben`;
            }
            return `hat diesen <a href="${movedReportUrl}">Bericht</a> in den Workspace <a href="${newParentReportUrl}">${toPolicyName}</a> verschoben`;
        },
        pendingMatchWithCreditCard: 'Beleg wartet auf Abgleich mit Kartenumsatz',
        pendingMatch: 'Ausstehende Zuordnung',
        pendingMatchWithCreditCardDescription: 'Beleg wartet auf Abgleich mit Kartenumsatz. Als Barzahlung markieren, um dies abzubrechen.',
        markAsCash: 'Als Bar markieren',
        routePending: 'Weiterleitung ausstehend …',
        receiptScanning: () => ({
            one: 'Beleg wird gescannt ...',
            other: 'Belege werden gescannt …',
        }),
        scanMultipleReceipts: 'Mehrere Belege scannen',
        scanMultipleReceiptsDescription: 'Fotografiere alle deine Belege auf einmal und bestätige anschließend die Details selbst – oder wir erledigen das für dich.',
        receiptScanInProgress: 'Belegscan wird ausgeführt',
        receiptScanInProgressDescription: 'Belegscan läuft. Schau später noch einmal nach oder gib die Details jetzt ein.',
        removeFromReport: 'Aus Bericht entfernen',
        moveToPersonalSpace: 'Ausgaben in deinen persönlichen Bereich verschieben',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Mögliche doppelte Ausgaben erkannt. Überprüfe die Duplikate, um die Einreichung zu ermöglichen.'
                : 'Mögliche doppelte Ausgaben erkannt. Bitte überprüfen Sie die Duplikate, um die Genehmigung zu ermöglichen.',
        receiptIssuesFound: () => ({
            one: 'Problem gefunden',
            other: 'Gefundene Probleme',
        }),
        fieldPending: 'Ausstehend ...',
        defaultRate: 'Standardkurs',
        receiptMissingDetails: 'Belegangaben fehlen',
        missingAmount: 'Fehlender Betrag',
        missingMerchant: 'Fehlender Händler',
        receiptStatusTitle: 'Wird gescannt …',
        receiptStatusText: 'Nur du kannst diese Quittung sehen, während sie gescannt wird. Schau später noch einmal nach oder gib die Details jetzt ein.',
        receiptScanningFailed: 'Belegerfassung fehlgeschlagen. Bitte gib die Details manuell ein.',
        transactionPendingDescription: 'Transaktion ausstehend. Die Buchung kann ein paar Tage dauern.',
        companyInfo: 'Unternehmensinfos',
        companyInfoDescription: 'Wir benötigen noch ein paar Details, bevor du deine erste Rechnung senden kannst.',
        yourCompanyName: 'Ihr Firmenname',
        yourCompanyWebsite: 'Die Website Ihres Unternehmens',
        yourCompanyWebsiteNote: 'Wenn Sie keine Website haben, können Sie stattdessen das LinkedIn- oder ein Social-Media-Profil Ihres Unternehmens angeben.',
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
            other: 'Sind Sie sicher, dass Sie diese Ausgaben löschen möchten?',
        }),
        deleteReport: 'Bericht löschen',
        deleteReportConfirmation: 'Möchten Sie diesen Bericht wirklich löschen?',
        settledExpensify: 'Bezahlt',
        done: 'Fertig',
        settledElsewhere: 'Anderswo bezahlt',
        individual: 'Privatperson',
        business: 'Geschäft',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} mit Expensify bezahlen` : `Mit Expensify bezahlen`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als Privatperson bezahlen` : `Mit Privatkonto bezahlen`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} mit Wallet bezahlen` : `Mit Wallet bezahlen`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `${formattedAmount} bezahlen`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als Unternehmen bezahlen` : `Mit Geschäftskonto bezahlen`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als bezahlt markieren` : `Als bezahlt markieren`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `${amount} mit privatem Konto ${last4Digits} bezahlt` : `Mit Privatkonto bezahlt`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `${amount} mit Geschäftskonto ${last4Digits} bezahlt` : `Mit Geschäftskonto bezahlt`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `${formattedAmount} über ${policyName} bezahlen` : `Bezahlen über ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `${amount} mit Bankkonto ${last4Digits} bezahlt` : `mit Bankkonto ${last4Digits} bezahlt`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `${amount ? `${amount} ` : ''} mit Bankkonto ${last4Digits} über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a> bezahlt`,
        invoicePersonalBank: (lastFour: string) => `Persönliches Konto • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Geschäftskonto • ${lastFour}`,
        nextStep: 'Nächste Schritte',
        finished: 'Fertig',
        flip: 'Drehen',
        sendInvoice: ({amount}: RequestAmountParams) => `Sende ${amount}-Rechnung`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `für ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `eingereicht${memo ? `, mit dem Verwendungszweck ${memo}` : ''}`,
        automaticallySubmitted: `übermittelt über <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">Einreichungen verzögern</a>`,
        queuedToSubmitViaDEW: 'zur Einreichung über benutzerdefinierten Genehmigungs-Workflow eingereiht',
        queuedToApproveViaDEW: 'zur Freigabe über benutzerdefinierten Genehmigungsworkflow vorgemerkt',
        trackedAmount: (formattedAmount: string, comment?: string) => `Verfolge ${formattedAmount}${comment ? `für ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `${amount} aufteilen`,
        didSplitAmount: (formattedAmount: string, comment: string) => `aufteilen ${formattedAmount}${comment ? `für ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Dein Anteil ${amount}`,
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
        automaticallyApproved: `über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Arbeitsbereichsregeln</a> genehmigt`,
        approvedAmount: (amount: number | string) => `${amount} genehmigt`,
        approvedMessage: `genehmigt`,
        unapproved: `nicht genehmigt`,
        automaticallyForwarded: `über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Arbeitsbereichsregeln</a> genehmigt`,
        forwarded: `genehmigt`,
        rejectedThisReport: 'hat diesen Bericht abgelehnt',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `hat die Zahlung gestartet, wartet aber darauf, dass ${submitterDisplayName} ein Bankkonto hinzufügt.`,
        adminCanceledRequest: 'hat die Zahlung storniert',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `hat die Zahlung über ${amount} storniert, weil ${submitterDisplayName} sein*ihr Expensify Wallet nicht innerhalb von 30 Tagen aktiviert hat`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} hat ein Bankkonto hinzugefügt. Die Zahlung über ${amount} wurde vorgenommen.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}als bezahlt markiert${comment ? `und sagte „${comment}“` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}mit Wallet bezahlt`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}mit Expensify über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Arbeitsbereichsregeln</a> bezahlt`,
        noReimbursableExpenses: 'Dieser Bericht hat einen ungültigen Betrag',
        pendingConversionMessage: 'Der Gesamtbetrag wird aktualisiert, sobald du wieder online bist',
        changedTheExpense: 'hat die Ausgabe geändert',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `den Wert von ${valueName} auf ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `setze ${translatedChangedField} auf ${newMerchant}, wodurch der Betrag auf ${newAmountToDisplay} gesetzt wurde`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `die ${valueName} (zuvor ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `den Wert ${valueName} auf ${newValueToDisplay} (zuvor ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `hat ${translatedChangedField} in ${newMerchant} geändert (zuvor ${oldMerchant}), wodurch der Betrag auf ${newAmountToDisplay} aktualisiert wurde (zuvor ${oldAmountToDisplay})`,
        basedOnAI: 'basierend auf früheren Aktivitäten',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `basierend auf den <a href="${rulesLink}">Workspace-Regeln</a>` : 'basierend auf Arbeitsbereichsregel'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `für ${comment}` : 'Ausgabe'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Rechnungsbericht Nr. ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} gesendet${comment ? `für ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `Ausgabe von persönlichem Bereich nach ${workspaceName ?? `Chat mit ${reportName}`} verschoben`,
        movedToPersonalSpace: 'Ausgabe in persönlichen Bereich verschoben',
        error: {
            invalidCategoryLength: 'Der Kategoriename überschreitet 255 Zeichen. Bitte kürze ihn oder wähle eine andere Kategorie.',
            invalidTagLength: 'Der Tag-Name überschreitet 255 Zeichen. Bitte kürzen Sie ihn oder wählen Sie einen anderen Tag.',
            invalidAmount: 'Bitte gib vor dem Fortfahren einen gültigen Betrag ein',
            invalidDistance: 'Bitte gib eine gültige Entfernung ein, bevor du fortfährst',
            invalidReadings: 'Bitte gib sowohl Start- als auch Endstand ein',
            negativeDistanceNotAllowed: 'Endstand muss größer als Anfangsstand sein',
            invalidIntegerAmount: 'Bitte geben Sie vor dem Fortfahren einen ganzen Dollarbetrag ein',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Der maximale Steuerbetrag ist ${amount}`,
            invalidSplit: 'Die Summe der Aufteilungen muss dem Gesamtbetrag entsprechen',
            invalidSplitParticipants: 'Bitte gib für mindestens zwei Teilnehmende einen Betrag größer als null ein',
            invalidSplitYourself: 'Bitte gib für deine Aufteilung einen von Null verschiedenen Betrag ein',
            noParticipantSelected: 'Bitte wähle eine:n Teilnehmer:in aus',
            other: 'Unerwarteter Fehler. Bitte versuchen Sie es später erneut.',
            genericCreateFailureMessage: 'Beim Einreichen dieser Spesen ist ein unerwarteter Fehler aufgetreten. Bitte versuche es später erneut.',
            genericCreateInvoiceFailureMessage: 'Unerwarteter Fehler beim Senden dieser Rechnung. Bitte versuche es später noch einmal.',
            genericHoldExpenseFailureMessage: 'Unerwarteter Fehler beim Zurückhalten dieser Ausgabe. Bitte versuche es später noch einmal.',
            genericUnholdExpenseFailureMessage: 'Unerwarteter Fehler beim Entfernen dieses Spesenbelegs aus der Warteschleife. Bitte versuche es später erneut.',
            receiptDeleteFailureError: 'Unerwarteter Fehler beim Löschen dieses Belegs. Bitte versuchen Sie es später erneut.',
            receiptFailureMessage:
                '<rbr>Beim Hochladen Ihrer Quittung ist ein Fehler aufgetreten. Bitte <a href="download">speichern Sie die Quittung</a> und <a href="retry">versuchen Sie es</a> später erneut.</rbr>',
            receiptFailureMessageShort: 'Beim Hochladen deiner Quittung ist ein Fehler aufgetreten.',
            genericDeleteFailureMessage: 'Unerwarteter Fehler beim Löschen dieser Ausgabe. Bitte versuche es später noch einmal.',
            genericEditFailureMessage: 'Unerwarteter Fehler beim Bearbeiten dieses Belegs. Bitte versuche es später noch einmal.',
            genericSmartscanFailureMessage: 'Der Buchung fehlen Felder',
            duplicateWaypointsErrorMessage: 'Bitte entfernen Sie doppelte Wegpunkte',
            atLeastTwoDifferentWaypoints: 'Bitte gib mindestens zwei verschiedene Adressen ein',
            splitExpenseMultipleParticipantsErrorMessage: 'Eine Ausgabe kann nicht zwischen einem Workspace und anderen Mitgliedern aufgeteilt werden. Bitte aktualisiere deine Auswahl.',
            invalidMerchant: 'Bitte gib einen gültigen Händler ein',
            atLeastOneAttendee: 'Mindestens eine teilnehmende Person muss ausgewählt werden',
            invalidQuantity: 'Bitte eine gültige Menge eingeben',
            quantityGreaterThanZero: 'Die Menge muss größer als null sein',
            invalidSubrateLength: 'Es muss mindestens einen Untertarif geben',
            invalidRate: 'Satz für diesen Workspace nicht gültig. Bitte wähle einen verfügbaren Satz aus dem Workspace aus.',
            endDateBeforeStartDate: 'Das Enddatum darf nicht vor dem Startdatum liegen',
            endDateSameAsStartDate: 'Das Enddatum darf nicht mit dem Startdatum identisch sein',
            manySplitsProvided: `Die maximale Anzahl zulässiger Aufteilungen ist ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `Der Datumsbereich darf ${CONST.IOU.SPLITS_LIMIT} Tage nicht überschreiten.`,
        },
        dismissReceiptError: 'Fehler verwerfen',
        dismissReceiptErrorConfirmation: 'Achtung! Wenn du diesen Fehler ausblendest, wird dein hochgeladener Beleg vollständig entfernt. Bist du sicher?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `hat mit dem Ausgleich begonnen. Die Zahlung ist angehalten, bis ${submitterDisplayName} sein Wallet aktiviert.`,
        enableWallet: 'Wallet aktivieren',
        hold: 'Halten',
        unhold: 'Sperre aufheben',
        holdExpense: () => ({
            one: 'Ausgabe zurückhalten',
            other: 'Ausgaben zurückhalten',
        }),
        unholdExpense: 'Aus gesetzt entnehmen',
        heldExpense: 'hat diese Ausgabe zurückgehalten',
        unheldExpense: 'Sperrung für diese Ausgabe aufgehoben',
        moveUnreportedExpense: 'Nicht gemeldete Ausgabe verschieben',
        addUnreportedExpense: 'Nicht gemeldete Ausgabe hinzufügen',
        selectUnreportedExpense: 'Wähle mindestens eine Ausgabe aus, die dem Bericht hinzugefügt werden soll.',
        emptyStateUnreportedExpenseTitle: 'Keine nicht gemeldeten Ausgaben',
        emptyStateUnreportedExpenseSubtitle: 'Sie scheinen keine nicht eingereichten Ausgaben zu haben. Erstellen Sie unten eine neue.',
        addUnreportedExpenseConfirm: 'Zu Bericht hinzufügen',
        newReport: 'Neuer Bericht',
        explainHold: () => ({
            one: 'Erklären Sie, warum Sie diese Ausgabe zurückhalten.',
            other: 'Erklären Sie, warum Sie diese Ausgaben zurückhalten.',
        }),
        retracted: 'zurückgezogen',
        retract: 'Zurückziehen',
        reopened: 'wiedereröffnet',
        reopenReport: 'Bericht wiedereröffnen',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Dieser Report wurde bereits nach ${connectionName} exportiert. Änderungen können zu Datenabweichungen führen. Sind Sie sicher, dass Sie diesen Report wieder öffnen möchten?`,
        reason: 'Grund',
        holdReasonRequired: 'Ein Grund ist beim Zurückhalten erforderlich.',
        expenseWasPutOnHold: 'Ausgabe wurde zurückgestellt',
        expenseOnHold: 'Diese Ausgabe wurde angehalten. Bitte lies die Kommentare für die nächsten Schritte.',
        expensesOnHold: 'Alle Ausgaben wurden angehalten. Bitte überprüfen Sie die Kommentare für die nächsten Schritte.',
        expenseDuplicate: 'Diese Spesenabrechnung weist ähnliche Details wie eine andere auf. Bitte überprüfe die Duplikate, um fortzufahren.',
        someDuplicatesArePaid: 'Einige dieser Duplikate wurden bereits genehmigt oder bezahlt.',
        reviewDuplicates: 'Duplikate prüfen',
        keepAll: 'Alle behalten',
        confirmApprove: 'Genehmigungsbetrag bestätigen',
        confirmApprovalAmount: 'Nur regelkonforme Ausgaben genehmigen oder den gesamten Bericht genehmigen.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist angehalten. Möchtest du sie trotzdem genehmigen?',
            other: 'Diese Ausgaben sind vorerst gesperrt. Möchtest du sie trotzdem genehmigen?',
        }),
        confirmPay: 'Zahlungsbetrag bestätigen',
        confirmPayAmount: 'Bezahle, was nicht zurückgehalten wird, oder bezahle den gesamten Bericht.',
        confirmPayAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist angehalten. Möchtest du sie trotzdem bezahlen?',
            other: 'Diese Ausgaben sind zurückgestellt. Möchtest du sie trotzdem bezahlen?',
        }),
        payOnly: 'Nur bezahlen',
        approveOnly: 'Nur genehmigen',
        holdEducationalTitle: 'Soll diese Ausgabe zurückgehalten werden?',
        whatIsHoldExplain: '„Anhalten“ ist wie eine Pausetaste für eine Ausgabe, bis du bereit bist, sie einzureichen.',
        holdIsLeftBehind: 'Zurückgehaltene Spesen bleiben bestehen, selbst wenn du einen gesamten Bericht einreichst.',
        unholdWhenReady: 'Entsperre Ausgaben, wenn du sie einreichen möchtest.',
        changePolicyEducational: {
            title: 'Du hast diesen Bericht verschoben!',
            description: 'Überprüfe diese Punkte sorgfältig, da sie sich beim Verschieben von Berichten in einen neuen Arbeitsbereich häufig ändern.',
            reCategorize: '<strong>Kategorisiere alle Spesen neu</strong>, um die Arbeitsbereichsregeln einzuhalten.',
            workflows: 'Für diesen Bericht gilt nun möglicherweise ein anderer <strong>Genehmigungsworkflow.</strong>',
        },
        changeWorkspace: 'Arbeitsbereich wechseln',
        set: 'festlegen',
        changed: 'geändert',
        removed: 'entfernt',
        transactionPending: 'Transaktion ausstehend.',
        chooseARate: 'Wähle einen Workspace-Erstattungssatz pro Meile oder Kilometer aus',
        unapprove: 'Genehmigung aufheben',
        unapproveReport: 'Abrechnung zurückziehen',
        headsUp: 'Achtung!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Dieser Bericht wurde bereits nach ${accountingIntegration} exportiert. Änderungen können zu Datenabweichungen führen. Bist du sicher, dass du die Genehmigung für diesen Bericht aufheben möchtest?`,
        reimbursable: 'erstattungsfähig',
        nonReimbursable: 'nicht erstattungsfähig',
        bookingPending: 'Diese Buchung ist ausstehend',
        bookingPendingDescription: 'Diese Buchung ist ausstehend, weil sie noch nicht bezahlt wurde.',
        bookingArchived: 'Diese Buchung ist archiviert',
        bookingArchivedDescription: 'Diese Buchung ist archiviert, weil das Reisedatum verstrichen ist. Füge bei Bedarf eine Ausgabe für den Endbetrag hinzu.',
        attendees: 'Teilnehmende',
        whoIsYourAccountant: 'Wer ist Ihre Buchhalterin/Ihr Buchhalter?',
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
        rates: 'Tarife',
        submitsTo: ({name}: SubmitsToParams) => `Sendet an ${name}`,
        reject: {
            educationalTitle: 'Solltest du halten oder ablehnen?',
            educationalText: 'Wenn du noch nicht bereit bist, eine Ausgabe zu genehmigen oder zu bezahlen, kannst du sie zurückstellen oder ablehnen.',
            holdExpenseTitle: 'Eine Ausgabe zurückhalten, um vor der Genehmigung oder Zahlung nach weiteren Details zu fragen.',
            approveExpenseTitle: 'Genehmige andere Spesen, während zurückgestellte Spesen weiterhin dir zugewiesen bleiben.',
            heldExpenseLeftBehindTitle: 'Zurückgehaltene Ausgaben bleiben unberührt, wenn du einen gesamten Bericht genehmigst.',
            rejectExpenseTitle: 'Lehne eine Ausgabe ab, die du nicht genehmigen oder bezahlen möchtest.',
            reasonPageTitle: 'Ausgabe ablehnen',
            reasonPageDescription: 'Erkläre, warum du diese Ausgabe ablehnst.',
            rejectReason: 'Ablehnungsgrund',
            markAsResolved: 'Als gelöst markieren',
            rejectedStatus: 'Diese Ausgabe wurde abgelehnt. Wir warten darauf, dass du die Probleme behebst und sie als gelöst markierst, um das Einreichen zu ermöglichen.',
            reportActions: {
                rejectedExpense: 'hat diese Ausgabe abgelehnt',
                markedAsResolved: 'hat den Ablehnungsgrund als gelöst markiert',
            },
        },
        moveExpenses: () => ({one: 'Ausgabe verschieben', other: 'Ausgaben verschieben'}),
        moveExpensesError: 'Sie können Pauschalspesen nicht in Berichte anderer Arbeitsbereiche verschieben, da sich die Pauschalsätze zwischen den Arbeitsbereichen unterscheiden können.',
        changeApprover: {
            title: 'Genehmigenden ändern',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Wähle eine Option, um die/den Genehmigenden für diesen Bericht zu ändern. (Aktualisiere deine <a href="${workflowSettingLink}">Workspace-Einstellungen</a>, um dies dauerhaft für alle Berichte zu ändern.)`,
            changedApproverMessage: (managerID: number) => `hat die/den Genehmigenden zu <mention-user accountID="${managerID}"/> geändert`,
            actions: {
                addApprover: 'Genehmigenden hinzufügen',
                addApproverSubtitle: 'Füge dem bestehenden Workflow eine zusätzliche genehmigende Person hinzu.',
                bypassApprovers: 'Genehmigende umgehen',
                bypassApproversSubtitle: 'Weise dich selbst als endgültige:n Genehmiger:in zu und überspringe alle verbleibenden Genehmiger:innen.',
            },
            addApprover: {
                subtitle: 'Wähle eine zusätzliche genehmigende Person für diesen Bericht aus, bevor wir ihn durch den restlichen Genehmigungs-Workflow weiterleiten.',
            },
        },
        chooseWorkspace: 'Arbeitsbereich auswählen',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `Abrechnung aufgrund eines benutzerdefinierten Genehmigungsworkflows an ${to} weitergeleitet`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'Stunde' : 'Stunden'} @ ${rate} / Stunde`,
            hrs: 'Std.',
            hours: 'Stunden',
            ratePreview: (rate: string) => `${rate} / Stunde`,
            amountTooLargeError: 'Der Gesamtbetrag ist zu hoch. Verringere die Stunden oder reduziere den Stundensatz.',
        },
        correctDistanceRateError: 'Behebe den Fehler beim Entfernungssatz und versuche es erneut.',
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
                    return `setze ${translations.common[key].toLowerCase()} auf „${updatedValue}“`;
                }
                return `${translations.common[key].toLowerCase()} zu „${updatedValue}“`;
            });
            return `${formatList(fragments)} über <a href="${policyRulesRoute}">Workspace-Regeln</a>`;
        },
    },
    transactionMerge: {
        listPage: {
            header: 'Ausgaben zusammenführen',
            noEligibleExpenseFound: 'Keine geeigneten Ausgaben gefunden',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Sie haben keine Spesen, die mit dieser zusammengeführt werden können. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Erfahren Sie mehr</a> über berechtigte Spesen.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Wählen Sie eine <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">berechtigte Ausgabe</a> aus, die mit <strong>${reportName}</strong> zusammengeführt werden soll.`,
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
                return `Bitte wähle ${article} ${field} aus`;
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
        label: 'Über neue Nachrichten benachrichtigen',
        notificationPreferences: {
            always: 'Sofort',
            daily: 'Täglich',
            mute: 'Stummschalten',
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: 'Ausgeblendet',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Die Nummer wurde nicht bestätigt. Klicke auf die Schaltfläche, um den Bestätigungslink per SMS erneut zu senden.',
        emailHasNotBeenValidated: 'Die E-Mail wurde nicht verifiziert. Klicke auf die Schaltfläche, um den Bestätigungslink per SMS erneut zu senden.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Foto hochladen',
        removePhoto: 'Foto entfernen',
        editImage: 'Foto bearbeiten',
        viewPhoto: 'Foto anzeigen',
        imageUploadFailed: 'Bild-Upload fehlgeschlagen',
        deleteWorkspaceError: 'Leider ist beim Löschen deines Workspace-Avatars ein unerwartetes Problem aufgetreten',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Das ausgewählte Bild überschreitet die maximale Uploadgröße von ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Bitte lade ein Bild hoch, das größer als ${minHeightInPx}x${minWidthInPx} Pixel und kleiner als ${maxHeightInPx}x${maxWidthInPx} Pixel ist.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `Profilbild muss einen der folgenden Typen haben: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: 'Profilbild bearbeiten',
        upload: 'Hochladen',
        uploadPhoto: 'Foto hochladen',
        selectAvatar: 'Avatar auswählen',
        choosePresetAvatar: 'Oder wähle einen eigenen Avatar',
    },
    modal: {
        backdropLabel: 'Modal-Hintergrund',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>du</strong> Ausgaben hinzufügst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf <strong>${actor}</strong>, um Ausgaben hinzuzufügen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass ein Admin Ausgaben hinzufügt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Es wird darauf gewartet, dass <strong>du</strong> Spesen einreichst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf <strong>${actor}</strong>, um Auslagen einzureichen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass ein Admin Spesen einreicht.`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Kein weiteres Handeln erforderlich!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>du</strong> ein Bankkonto hinzufügst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warte darauf, dass <strong>${actor}</strong> ein Bankkonto hinzufügt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass eine*e Administrator*in ein Bankkonto hinzufügt.`;
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
                        return `Warten, bis <strong>deine</strong> Ausgaben automatisch eingereicht werden${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass die Spesen von <strong>${actor}</strong> automatisch eingereicht werden${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass die Spesen eines Admins automatisch eingereicht werden${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>du</strong> die Probleme behebst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf <strong>${actor}</strong>, um die Probleme zu beheben.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass ein Admin die Probleme behebt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> Spesen genehmigst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf die Freigabe der Ausgaben durch <strong>${actor}</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf die Genehmigung der Ausgaben durch eine Adminperson.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
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
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Es wird darauf gewartet, dass <strong>du</strong> Spesen bezahlst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warte darauf, dass <strong>${actor}</strong> die Spesen bezahlt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf eine:n Admin, um Spesen zu bezahlen.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>du</strong> die Einrichtung eines Geschäftskontos abschließt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warte darauf, dass <strong>${actor}</strong> die Einrichtung eines Geschäftskontos abschließt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass eine Adminperson die Einrichtung eines Geschäftskontos abschließt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `bis ${eta}` : ` ${eta}`;
                }
                return `Warte, bis die Zahlung abgeschlossen ist${formattedETA}.`;
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `Ups! Es sieht so aus, als würdest du diesen Bericht an <strong>dich selbst</strong> einreichen. Das Genehmigen eigener Berichte ist in deinem Arbeitsbereich <strong>verboten</strong>. Bitte reiche diesen Bericht bei einer anderen Person ein oder kontaktiere deine Admins, um die Person zu ändern, an die du Berichte einreichst.`,
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
        selfSelectYourPronoun: 'Wähle deine Pronomen selbst aus',
        emailAddress: 'E-Mail-Adresse',
        setMyTimezoneAutomatically: 'Meine Zeitzone automatisch einstellen',
        timezone: 'Zeitzone',
        invalidFileMessage: 'Ungültige Datei. Bitte versuchen Sie es mit einem anderen Bild.',
        avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Wird synchronisiert',
        profileAvatar: 'Profil-Avatar',
        publicSection: {
            title: 'Öffentlich',
            subtitle: 'Diese Angaben werden in deinem öffentlichen Profil angezeigt. Jede*r kann sie sehen.',
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
        title: 'Dein Code',
        subtitle: 'Lade Mitglieder zu Expensify ein, indem du deinen persönlichen QR-Code oder Empfehlungslink teilst.',
    },
    pronounsPage: {
        pronouns: 'Pronomen',
        isShownOnProfile: 'Deine Pronomen werden in deinem Profil angezeigt.',
        placeholderText: 'Suche, um Optionen zu sehen',
    },
    contacts: {
        contactMethods: 'Kontaktmethoden',
        featureRequiresValidate: 'Für diese Funktion müssen Sie Ihr Konto verifizieren.',
        validateAccount: 'Bestätige dein Konto',
        helpText: ({email}: {email: string}) =>
            `Füge weitere Möglichkeiten hinzu, dich anzumelden und Belege an Expensify zu senden.<br/><br/>Füge eine E‑Mail‑Adresse hinzu, um Belege an <a href="mailto:${email}">${email}</a> weiterzuleiten, oder füge eine Telefonnummer hinzu, um Belege per SMS an 47777 zu senden (nur US‑Nummern).`,
        pleaseVerify: 'Bitte verifiziere diese Kontaktmethode.',
        getInTouch: 'Wir werden diese Methode verwenden, um Sie zu kontaktieren.',
        enterMagicCode: (contactMethod: string) => `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde. Er sollte innerhalb ein bis zwei Minuten ankommen.`,
        setAsDefault: 'Als Standard festlegen',
        yourDefaultContactMethod:
            'Dies ist Ihre aktuelle Standardkontaktmethode. Bevor Sie sie löschen können, müssen Sie eine andere Kontaktmethode auswählen und auf „Als Standard festlegen“ klicken.',
        removeContactMethod: 'Kontaktmethode entfernen',
        removeAreYouSure: 'Bist du sicher, dass du diese Kontaktmethode entfernen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.',
        failedNewContact: 'Diese Kontaktmethode konnte nicht hinzugefügt werden.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Das Senden eines neuen Magic-Codes ist fehlgeschlagen. Bitte warte einen Moment und versuche es erneut.',
            validateSecondaryLogin: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            deleteContactMethod: 'Kontaktmethode konnte nicht gelöscht werden. Bitte wende dich für Hilfe an Concierge.',
            setDefaultContactMethod: 'Neue Standardkontaktmethode konnte nicht festgelegt werden. Bitte wende dich für Hilfe an Concierge.',
            addContactMethod: 'Diese Kontaktmethode konnte nicht hinzugefügt werden. Bitte wende dich für Hilfe an Concierge.',
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
        heHimHisTheyThemTheirs: 'Er / Ihn / Sein / Sie / Ihnen / Ihrer',
        sheHerHers: 'Sie / Ihr / Ihre',
        sheHerHersTheyThemTheirs: 'Sie / Ihr / Ihre / They / Them / Theirs',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Pro Person / Personen',
        theyThemTheirs: 'Sie / Ihnen / Ihre',
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
        isShownOnProfile: 'Dein Anzeigename wird in deinem Profil angezeigt.',
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
            description: 'Die neue Expensify-App wird von einer Community aus Open-Source-Entwickler:innen aus der ganzen Welt entwickelt. Hilf uns, die Zukunft von Expensify zu gestalten.',
            appDownloadLinks: 'App-Download-Links',
            viewKeyboardShortcuts: 'Tastenkombinationen anzeigen',
            viewTheCode: 'Code anzeigen',
            viewOpenJobs: 'Offene Aufgaben anzeigen',
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
        },
        troubleshoot: {
            clearCacheAndRestart: 'Cache leeren und neu starten',
            viewConsole: 'Debugkonsole anzeigen',
            debugConsole: 'Debug-Konsole',
            description:
                '<muted-text>Verwenden Sie die folgenden Tools, um Probleme mit der Expensify-Erfahrung zu beheben. Wenn Probleme auftreten, <concierge-link>melden Sie bitte einen Fehler</concierge-link>.</muted-text>',
            confirmResetDescription: 'Alle ungesendeten Entwurfsnachrichten gehen verloren, aber der Rest Ihrer Daten ist sicher.',
            resetAndRefresh: 'Zurücksetzen und aktualisieren',
            clientSideLogging: 'Clientseitige Protokollierung',
            noLogsToShare: 'Keine Protokolle zum Teilen',
            useProfiling: 'Profiling verwenden',
            profileTrace: 'Profilverfolgung',
            results: 'Ergebnisse',
            releaseOptions: 'Release-Optionen',
            testingPreferences: 'Testeinstellungen',
            useStagingServer: 'Staging-Server verwenden',
            forceOffline: 'Offline erzwingen',
            simulatePoorConnection: 'Schlechte Internetverbindung simulieren',
            simulateFailingNetworkRequests: 'Fehlgeschlagene Netzwerkanforderungen simulieren',
            authenticationStatus: 'Authentifizierungsstatus',
            deviceCredentials: 'Geräteanmeldedaten',
            invalidate: 'Ungültig machen',
            destroy: 'Löschen',
            maskExportOnyxStateData: 'Fragile Mitgliederdaten beim Export des Onyx-Status maskieren',
            exportOnyxState: 'Onyx-Status exportieren',
            importOnyxState: 'Onyx-Status importieren',
            testCrash: 'Testabsturz',
            resetToOriginalState: 'Auf ursprünglichen Zustand zurücksetzen',
            usingImportedState: 'Sie verwenden importierten Status. Tippen Sie hier, um ihn zu löschen.',
            debugMode: 'Debug-Modus',
            invalidFile: 'Ungültige Datei',
            invalidFileDescription: 'Die Datei, die du zu importieren versuchst, ist nicht gültig. Bitte versuche es erneut.',
            invalidateWithDelay: 'Mit Verzögerung ungültig machen',
            leftHandNavCache: 'Cache für linke Navigation',
            clearleftHandNavCache: 'Löschen',
            recordTroubleshootData: 'Problembehandlungsdaten aufzeichnen',
            softKillTheApp: 'App sanft beenden',
            kill: 'Beenden',
            sentryDebug: 'Sentry-Debug',
            sentryDebugDescription: 'Sentry-Anfragen in der Konsole protokollieren',
            sentryHighlightedSpanOps: 'Hervorgehobene Span-Namen',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaction.click, Navigation, ui.laden',
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
        restoreStashed: 'Gepufferten Login wiederherstellen',
        signOutConfirmationText: 'Alle nicht synchronisierten Änderungen gehen verloren, wenn du dich abmeldest.',
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
        reasonForLeavingPrompt: 'Wir würden es sehr bedauern, wenn Sie gehen. Würden Sie uns bitte sagen, warum, damit wir uns verbessern können?',
        enterMessageHere: 'Nachricht hier eingeben',
        closeAccountWarning: 'Das Schließen Ihres Kontos kann nicht rückgängig gemacht werden.',
        closeAccountPermanentlyDeleteData: 'Möchtest du dein Konto wirklich löschen? Dadurch werden alle ausstehenden Ausgaben endgültig gelöscht.',
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
                `Das Zusammenführen deiner Konten kann nicht rückgängig gemacht werden und führt zum Verlust aller nicht eingereichten Ausgaben für <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Um fortzufahren, gib bitte den magischen Code ein, der an <strong>${login}</strong> gesendet wurde.`,
            errors: {
                incorrectMagicCode: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
                fallback: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später erneut.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konten zusammengeführt!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Du hast alle Daten von <strong>${from}</strong> erfolgreich mit <strong>${to}</strong> zusammengeführt. Künftig kannst du für dieses Konto entweder die eine oder die andere Anmeldung verwenden.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Wir arbeiten daran',
            limitedSupport: 'Das Zusammenführen von Konten wird in New Expensify noch nicht unterstützt. Bitte führe diese Aktion stattdessen in Expensify Classic durch.',
            reachOutForHelp: '<muted-text><centered-text>Wende dich gern an den <concierge-link>Concierge</concierge-link>, wenn du Fragen hast!</centered-text></muted-text>',
            goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Du kannst <strong>${email}</strong> nicht zusammenführen, weil es von <strong>${email.split('@').at(1) ?? ''}</strong> verwaltet wird. Bitte <concierge-link>wende dich für Unterstützung an Concierge</concierge-link>.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Du kannst <strong>${email}</strong> nicht mit anderen Konten zusammenführen, weil deine Domain-Adminperson es als deine primäre Anmeldung festgelegt hat. Bitte führe stattdessen andere Konten mit diesem Konto zusammen.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Konten können nicht zusammengeführt werden, da für <strong>${email}</strong> die Zwei-Faktor-Authentifizierung (2FA) aktiviert ist. Bitte deaktiviere 2FA für <strong>${email}</strong> und versuche es erneut.</centered-text></muted-text>`,
            learnMore: 'Erfahre mehr über das Zusammenführen von Konten.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Sie können <strong>${email}</strong> nicht zusammenführen, da es gesperrt ist. Bitte <concierge-link>wenden Sie sich für Unterstützung an Concierge</concierge-link>.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Konten können nicht zusammengeführt werden, da <strong>${email}</strong> kein Expensify-Konto hat. Bitte <a href="${contactMethodLink}">füge sie stattdessen als Kontaktmethode hinzu</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Sie können <strong>${email}</strong> nicht mit anderen Konten zusammenführen. Bitte führen Sie stattdessen andere Konten mit diesem zusammen.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Konten können nicht in <strong>${email}</strong> zusammengeführt werden, da dieses Konto eine abgerechnete Rechnungsbeziehung besitzt.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Versuche es später noch einmal',
            description: 'Es wurden zu viele Versuche unternommen, Konten zusammenzuführen. Bitte versuche es später erneut.',
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
            'Ist Ihnen etwas Ungewöhnliches bei Ihrem Konto aufgefallen? Wenn Sie es melden, wird Ihr Konto sofort gesperrt, neue Expensify Card-Transaktionen werden blockiert und alle Änderungen an Ihrem Konto verhindert.',
        domainAdminsDescription: 'Für Domain-Admins: Dadurch werden außerdem alle Expensify Card-Aktivitäten und Admin-Aktionen in deinen Domain(s) pausiert.',
        areYouSure: 'Möchtest du dein Expensify-Konto wirklich sperren?',
        onceLocked: 'Sobald Ihr Konto gesperrt ist, wird es eingeschränkt, bis eine Entsperrungsanfrage gestellt und eine Sicherheitsprüfung durchgeführt wurde',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Konto konnte nicht gesperrt werden',
        failedToLockAccountDescription: `Wir konnten Ihr Konto nicht sperren. Bitte chatten Sie mit Concierge, um dieses Problem zu lösen.`,
        chatWithConcierge: 'Mit Concierge chatten',
    },
    unlockAccountPage: {
        accountLocked: 'Konto gesperrt',
        yourAccountIsLocked: 'Ihr Konto ist gesperrt',
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
        disabled: 'Die Zwei-Faktor-Authentifizierung ist jetzt deaktiviert',
        noAuthenticatorApp: 'Sie benötigen keine Authentifizierungs-App mehr, um sich bei Expensify anzumelden.',
        stepCodes: 'Wiederherstellungscodes',
        keepCodesSafe: 'Bewahre diese Wiederherstellungscodes sicher auf!',
        codesLoseAccess: dedent(`
            Wenn du den Zugriff auf deine Authentifizierungs-App verlierst und diese Codes nicht hast, verlierst du den Zugriff auf dein Konto.

            Hinweis: Wenn du die Zwei-Faktor-Authentifizierung einrichtest, wirst du aus allen anderen aktiven Sitzungen abgemeldet.
        `),
        errorStepCodes: 'Bitte kopiere oder lade die Codes herunter, bevor du fortfährst',
        stepVerify: 'Verifizieren',
        scanCode: 'Scanne den QR-Code mit deinem',
        authenticatorApp: 'Authentifikator-App',
        addKey: 'Oder füge diesen geheimen Schlüssel zu deiner Authentifizierungs-App hinzu:',
        enterCode: 'Gib dann den sechsstelligen Code ein, der von deiner Authentifizierungs-App generiert wurde.',
        stepSuccess: 'Fertig',
        enabled: 'Zwei-Faktor-Authentifizierung aktiviert',
        congrats: 'Glückwunsch! Jetzt hast du diese zusätzliche Sicherheit.',
        copy: 'Kopieren',
        disable: 'Deaktivieren',
        enableTwoFactorAuth: 'Zwei-Faktor-Authentifizierung aktivieren',
        pleaseEnableTwoFactorAuth: 'Bitte aktiviere die Zwei-Faktor-Authentifizierung.',
        twoFactorAuthIsRequiredDescription: 'Aus Sicherheitsgründen erfordert Xero eine Zwei-Faktor-Authentifizierung, um die Integration zu verbinden.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Zwei-Faktor-Authentifizierung erforderlich',
        twoFactorAuthIsRequiredForAdminsTitle: 'Bitte die Zwei-Faktor-Authentifizierung aktivieren',
        twoFactorAuthIsRequiredXero: 'Ihre Xero-Buchhaltungsverbindung erfordert eine Zwei-Faktor-Authentifizierung.',
        twoFactorAuthIsRequiredCompany: 'Ihr Unternehmen verlangt eine Zwei-Faktor-Authentifizierung.',
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
        personalNoteMessage: 'Notizen zu diesem Chat kannst du hier festhalten. Du bist die einzige Person, die diese Notizen hinzufügen, bearbeiten oder ansehen kann.',
        sharedNoteMessage: 'Führen Sie hier Notizen zu diesem Chat. Expensify-Mitarbeitende und andere Mitglieder in der Domain team.expensify.com können diese Notizen sehen.',
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
        paymentCurrencyDescription: 'Wählen Sie eine standardisierte Währung aus, in die alle persönlichen Ausgaben umgerechnet werden sollen',
        note: `Hinweis: Die Änderung deiner Zahlungwährung kann beeinflussen, wie viel du für Expensify zahlst. Details findest du auf unserer <a href="${CONST.PRICING}">Preisseite</a>.`,
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
            addressZipCode: 'Bitte eine gültige Postleitzahl eingeben',
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
            addressZipCode: 'Bitte eine gültige Postleitzahl eingeben',
            paymentCardNumber: 'Bitte eine gültige Kartennummer eingeben',
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
        balance: 'Saldo',
        paymentMethodsTitle: 'Zahlungsmethoden',
        setDefaultConfirmation: 'Als Standardzahlungsmethode festlegen',
        setDefaultSuccess: 'Standard-Zahlungsmethode festgelegt!',
        deleteAccount: 'Konto löschen',
        deleteConfirmation: 'Sind Sie sicher, dass Sie dieses Konto löschen möchten?',
        deleteCard: 'Karte löschen',
        deleteCardConfirmation:
            'Alle nicht eingereichten Kartenumsätze, einschließlich der auf offenen Berichten, werden entfernt. Bist du sicher, dass du diese Karte löschen möchtest? Diese Aktion kann nicht rückgängig gemacht werden.',
        error: {
            notOwnerOfBankAccount: 'Beim Festlegen dieses Bankkontos als deine Standardzahlungsmethode ist ein Fehler aufgetreten',
            invalidBankAccount: 'Dieses Bankkonto ist vorübergehend gesperrt',
            notOwnerOfFund: 'Beim Festlegen dieser Karte als deine Standardzahlungsmethode ist ein Fehler aufgetreten',
            setDefaultFailure: 'Etwas ist schiefgelaufen. Bitte chatte für weitere Unterstützung mit Concierge.',
        },
        addBankAccountFailure: 'Beim Hinzufügen Ihres Bankkontos ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        getPaidFaster: 'Schneller bezahlt werden',
        addPaymentMethod: 'Füge eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        getPaidBackFaster: 'Lass dich schneller auszahlen',
        secureAccessToYourMoney: 'Sicherer Zugriff auf Ihr Geld',
        receiveMoney: 'Geld in Ihrer Landeswährung empfangen',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Sende und empfange Geld mit Freund*innen. Nur für US-Bankkonten.',
        enableWallet: 'Wallet aktivieren',
        addBankAccountToSendAndReceive: 'Füge ein Bankkonto hinzu, um Zahlungen zu senden oder zu empfangen.',
        addDebitOrCreditCard: 'Debit- oder Kreditkarte hinzufügen',
        assignedCards: 'Zugewiesene Karten',
        assignedCardsDescription: 'Transaktionen von diesen Karten werden automatisch synchronisiert.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Wir überprüfen gerade Ihre Angaben. Bitte schauen Sie in ein paar Minuten noch einmal vorbei!',
        walletActivationFailed: 'Leider kann deine Wallet derzeit nicht aktiviert werden. Bitte chatte mit Concierge, um weitere Unterstützung zu erhalten.',
        addYourBankAccount: 'Füge dein Bankkonto hinzu',
        addBankAccountBody: 'Verbinden wir dein Bankkonto mit Expensify, damit du so einfach wie noch nie direkt in der App Zahlungen senden und empfangen kannst.',
        chooseYourBankAccount: 'Wähle dein Bankkonto aus',
        chooseAccountBody: 'Stellen Sie sicher, dass Sie die richtige Option auswählen.',
        confirmYourBankAccount: 'Bestätige dein Bankkonto',
        personalBankAccounts: 'Private Bankkonten',
        businessBankAccounts: 'Geschäftsbankkonten',
        shareBankAccount: 'Bankkonto freigeben',
        bankAccountShared: 'Bankkonto geteilt',
        shareBankAccountTitle: 'Wähle die Administratoren aus, mit denen dieses Bankkonto geteilt werden soll:',
        shareBankAccountSuccess: 'Bankkonto freigegeben!',
        shareBankAccountSuccessDescription: 'Die ausgewählten Admins erhalten eine Bestätigungsnachricht von Concierge.',
        shareBankAccountFailure: 'Beim Versuch, das Bankkonto zu teilen, ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut.',
        shareBankAccountEmptyTitle: 'Keine Admins verfügbar',
        shareBankAccountEmptyDescription: 'Es gibt keine Workspace-Admins, mit denen du dieses Bankkonto teilen kannst.',
        shareBankAccountNoAdminsSelected: 'Bitte wähle vor dem Fortfahren eine:n Admin aus',
        unshareBankAccount: 'Bankkonto nicht mehr teilen',
        unshareBankAccountDescription:
            'Alle unten aufgeführten Personen haben Zugriff auf dieses Bankkonto. Du kannst den Zugriff jederzeit entfernen. Wir schließen dennoch alle laufenden Zahlungen ab.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} verliert den Zugriff auf dieses Geschäftskonto. Wir schließen laufende Zahlungen trotzdem ab.`,
        reachOutForHelp: 'Es wird mit der Expensify Card verwendet. <concierge-link>Wende dich an Concierge</concierge-link>, wenn du es nicht mehr teilen möchtest.',
        unshareErrorModalTitle: 'Bankkonto kann nicht freigegeben werden',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: 'Verbleibendes Limit',
        smartLimit: {
            name: 'Smartes Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Sie können bis zu ${formattedLimit} mit dieser Karte ausgeben, und das Limit wird zurückgesetzt, sobald Ihre eingereichten Ausgaben genehmigt werden.`,
        },
        fixedLimit: {
            name: 'Fester Betrag',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Sie können bis zu ${formattedLimit} mit dieser Karte ausgeben, danach wird sie deaktiviert.`,
        },
        monthlyLimit: {
            name: 'Monatliches Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Sie können mit dieser Karte bis zu ${formattedLimit} pro Monat ausgeben. Das Limit wird am 1. Tag eines jeden Kalendermonats zurückgesetzt.`,
        },
        virtualCardNumber: 'Virtuelle Kartennummer',
        travelCardCvv: 'Reisekarten-CVV',
        physicalCardNumber: 'Nummer der physischen Karte',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Physische Karte bestellen',
        reportFraud: 'Virtuelle Kartenbetrugsfälle melden',
        reportTravelFraud: 'Reisezahlungskartenbetrug melden',
        reviewTransaction: 'Transaktion prüfen',
        suspiciousBannerTitle: 'Verdächtige Transaktion',
        suspiciousBannerDescription: 'Wir haben verdächtige Transaktionen auf Ihrer Karte festgestellt. Tippen Sie unten, um sie zu überprüfen.',
        cardLocked: 'Ihre Karte ist vorübergehend gesperrt, während unser Team das Konto Ihres Unternehmens prüft.',
        markTransactionsAsReimbursable: 'Transaktionen als erstattungsfähig markieren',
        markTransactionsDescription: 'Wenn aktiviert, werden Transaktionen, die von dieser Karte importiert werden, standardmäßig als erstattungsfähig markiert.',
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
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Zur ${platform}-Wallet hinzugefügt`,
        cardDetailsLoadingFailure: 'Beim Laden der Kartendetails ist ein Fehler aufgetreten. Bitte überprüfe deine Internetverbindung und versuche es erneut.',
        validateCardTitle: 'Stellen wir sicher, dass du es bist',
        enterMagicCode: (contactMethod: string) =>
            `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um deine Kartendaten anzuzeigen. Er sollte innerhalb von ein bis zwei Minuten ankommen.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) =>
            `Bitte <a href="${missingDetailsLink}">fügen Sie Ihre persönlichen Daten hinzu</a> und versuchen Sie es dann erneut.`,
        unexpectedError: 'Beim Abrufen deiner Expensify-Kartendaten ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        cardFraudAlert: {
            confirmButtonText: 'Ja, das tue ich',
            reportFraudButtonText: 'Nein, ich war das nicht',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `hat die verdächtige Aktivität geklärt und Karte x${cardLastFour} wieder aktiviert. Alles bereit, um weiter Ausgaben zu erfassen!`,
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
            }) => `verdächtige Aktivität auf der Karte mit Endziffern ${cardLastFour} festgestellt. Erkennen Sie diese Abbuchung wieder?

${amount} für ${merchant} – ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Ausgaben',
        workflowDescription: 'Konfiguriere einen Workflow ab dem Moment, in dem Ausgaben anfallen, einschließlich Genehmigung und Zahlung.',
        submissionFrequency: 'Eingaben',
        submissionFrequencyDescription: 'Wähle einen benutzerdefinierten Zeitplan zum Einreichen von Ausgaben.',
        submissionFrequencyDateOfMonth: 'Tag des Monats',
        disableApprovalPromptDescription: 'Das Deaktivieren von Genehmigungen löscht alle bestehenden Genehmigungs-Workflows.',
        addApprovalsTitle: 'Genehmigungen',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `Ausgaben von ${members}, und die/der Genehmigende ist ${approvers}`,
        addApprovalButton: 'Genehmigungs-Workflow hinzufügen',
        addApprovalTip: 'Dieser Standard-Workflow gilt für alle Mitglieder, sofern kein spezifischerer Workflow existiert.',
        approver: 'Genehmigende Person',
        addApprovalsDescription: 'Zusätzliche Genehmigung einholen, bevor eine Zahlung autorisiert wird.',
        makeOrTrackPaymentsTitle: 'Zahlungen',
        makeOrTrackPaymentsDescription:
            'Fügen Sie eine bevollmächtigte zahlungspflichtige Person für Zahlungen hinzu, die in Expensify erfolgen, oder verfolgen Sie Zahlungen, die anderswo getätigt wurden.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Für diesen Workspace ist ein benutzerdefinierter Genehmigungs-Workflow aktiviert. Um diesen Workflow zu überprüfen oder zu ändern, wenden Sie sich bitte an Ihre:n <account-manager-link>Account Manager</account-manager-link> oder an <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Für diesen Workspace ist ein benutzerdefinierter Genehmigungsworkflow aktiviert. Um diesen Workflow zu überprüfen oder zu ändern, wende dich bitte an <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Wähle, wie lange Expensify warten soll, bevor fehlerfreie Ausgaben geteilt werden.',
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
                one: 'Std.',
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
                '8': 'Achter',
                '9': 'Neunte',
                '10': 'Zehnte',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Dieses Mitglied gehört bereits zu einem anderen Genehmigungsworkflow. Alle Aktualisierungen hier werden sich auch dort widerspiegeln.',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> genehmigt bereits Berichte an <strong>${name2}</strong>. Bitte wähle eine andere genehmigende Person, um einen zirkulären Workflow zu vermeiden.`,
        emptyContent: {
            title: 'Keine Mitglieder zum Anzeigen',
            expensesFromSubtitle: 'Alle Mitglieder des Arbeitsbereichs gehören bereits zu einem bestehenden Genehmigungsworkflow.',
            approverSubtitle: 'Alle Genehmigenden gehören zu einem bestehenden Workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Übermittlungshäufigkeit konnte nicht geändert werden. Bitte versuche es erneut oder kontaktiere den Support.',
        monthlyOffsetErrorMessage: 'Die monatliche Häufigkeit konnte nicht geändert werden. Bitte versuche es erneut oder kontaktiere den Support.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Bestätigen',
        header: 'Fügen Sie weitere Genehmigende hinzu und bestätigen Sie.',
        additionalApprover: 'Zusätzliche:r Genehmigende:r',
        submitButton: 'Workflow hinzufügen',
    },
    workflowsEditApprovalsPage: {
        title: 'Genehmigungsworkflow bearbeiten',
        deleteTitle: 'Genehmigungsworkflow löschen',
        deletePrompt: 'Möchtest du diesen Genehmigungsworkflow wirklich löschen? Alle Mitglieder folgen anschließend dem Standard-Workflow.',
    },
    workflowsExpensesFromPage: {
        title: 'Spesen ab',
        header: 'Wenn die folgenden Mitglieder Ausgaben einreichen:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Die Genehmiger:in konnte nicht geändert werden. Bitte versuche es erneut oder kontaktiere den Support.',
        title: 'Genehmigende Person festlegen',
        description: 'Diese Person genehmigt die Ausgaben.',
    },
    workflowsApprovalLimitPage: {
        title: 'Genehmigende Person',
        header: '(Optional) Möchtest du ein Genehmigungslimit hinzufügen?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Füge eine*n weitere*n Genehmiger*in hinzu, wenn <strong>${approverName}</strong> Genehmiger*in ist und der Bericht den folgenden Betrag überschreitet:`
                : 'Füge eine weitere Genehmigungsperson hinzu, wenn ein Bericht den untenstehenden Betrag überschreitet:',
        reportAmountLabel: 'Berichtsbetrag',
        additionalApproverLabel: 'Zusätzliche:r Genehmigende:r',
        skip: 'Überspringen',
        next: 'Weiter',
        removeLimit: 'Limit aufheben',
        enterAmountError: 'Bitte gib einen gültigen Betrag ein',
        enterApproverError: 'Genehmigende Person ist erforderlich, wenn Sie ein Berichtslimit festlegen',
        enterBothError: 'Gib einen Berichtsbetrag und eine zusätzliche Genehmigungsperson ein',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `Berichte über ${approvalLimit} werden an ${approverName} weitergeleitet`,
    },
    workflowsPayerPage: {
        title: 'Autorisierte zahlende Person',
        genericErrorMessage: 'Der berechtigte Zahlungspflichtige konnte nicht geändert werden. Bitte versuche es erneut.',
        admins: 'Admins',
        payer: 'Zahler',
        paymentAccount: 'Zahlungskonto',
    },
    reportFraudPage: {
        title: 'Virtuelle Kartenbetrugsfälle melden',
        description:
            'Wenn die Daten Ihrer virtuellen Karte gestohlen oder kompromittiert wurden, deaktivieren wir Ihre bestehende Karte dauerhaft und stellen Ihnen eine neue virtuelle Karte mit neuer Kartennummer zur Verfügung.',
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
        legalLastName: 'Gesetzlicher Nachname',
        phoneMessage: 'Gib deine Telefonnummer ein.',
        phoneNumber: 'Telefonnummer',
        address: 'Adresse',
        addressMessage: 'Gib deine Versandadresse ein.',
        streetAddress: 'Straße und Hausnummer',
        city: 'Stadt',
        state: 'Status',
        zipPostcode: 'PLZ/Postleitzahl',
        country: 'Land',
        confirmMessage: 'Bitte bestätige unten deine Angaben.',
        estimatedDeliveryMessage: 'Deine physische Karte wird in 2–3 Werktagen ankommen.',
        next: 'Weiter',
        getPhysicalCard: 'Physische Karte bestellen',
        shipCard: 'Karte versenden',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Überweisung${amount ? ` ${amount}` : ''}`,
        instant: 'Sofort (Debitkarte)',
        instantSummary: (rate: string, minAmount: string) => `${rate} % Gebühr (mindestens ${minAmount})`,
        ach: '1–3 Werktage (Bankkonto)',
        achSummary: 'Keine Gebühr',
        whichAccount: 'Welches Konto?',
        fee: 'Gebühr',
        transferSuccess: 'Überweisung erfolgreich!',
        transferDetailBankAccount: 'Dein Geld sollte in den nächsten 1–3 Werktagen ankommen.',
        transferDetailDebitCard: 'Dein Geld sollte sofort ankommen.',
        failedTransfer: 'Ihr Saldo ist noch nicht vollständig ausgeglichen. Bitte überweisen Sie auf ein Bankkonto.',
        notHereSubTitle: 'Bitte überweise dein Guthaben von der Wallet-Seite.',
        goToWallet: 'Zur Geldbörse',
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
        subtitle: 'Diese Regeln gelten für deine Ausgaben. Wenn du bei einem Arbeitsbereich einreichst, können dessen Regeln diese außer Kraft setzen.',
        findRule: 'Regel finden',
        emptyRules: {
            title: 'Du hast noch keine Regeln erstellt',
            subtitle: 'Füge eine Regel hinzu, um die Spesenabrechnung zu automatisieren.',
        },
        changes: {
            billableUpdate: (value: boolean) => `Ausgabe ${value ? 'fakturierbar' : 'nicht verrechenbar'} aktualisieren`,
            categoryUpdate: (value: string) => `Kategorie auf „${value}“ aktualisieren`,
            commentUpdate: (value: string) => `Beschreibung auf „${value}“ aktualisieren`,
            merchantUpdate: (value: string) => `Händler auf „${value}“ aktualisieren`,
            reimbursableUpdate: (value: boolean) => `Ausgabe ${value ? 'erstattungsfähig' : 'nicht erstattungsfähig'} aktualisieren`,
            tagUpdate: (value: string) => `Tag zu „${value}“ aktualisieren`,
            taxUpdate: (value: string) => `Steuersatz auf „${value}“ aktualisieren`,
            billable: (value: boolean) => `Ausgabe ${value ? 'fakturierbar' : 'nicht verrechenbar'}`,
            category: (value: string) => `Kategorie zu „${value}“`,
            comment: (value: string) => `Beschreibung zu „${value}“`,
            merchant: (value: string) => `Händler auf „${value}“`,
            reimbursable: (value: boolean) => `Ausgabe ${value ? 'erstattungsfähig' : 'nicht erstattungsfähig'}`,
            tag: (value: string) => `Tag auf „${value}“`,
            tax: (value: string) => `Steuersatz auf „${value}“`,
            report: (value: string) => `zu einem Bericht namens „${value}“ hinzufügen`,
        },
        newRule: 'Neue Regel',
        addRule: {
            title: 'Regel hinzufügen',
            expenseContains: 'Wenn Ausgabe Folgendes enthält:',
            applyUpdates: 'Wenden Sie dann diese Aktualisierungen an:',
            merchantHint: 'Gib . ein, um eine Regel zu erstellen, die für alle Händler gilt',
            addToReport: 'Zu einem Bericht mit dem Namen hinzufügen',
            createReport: 'Bericht bei Bedarf erstellen',
            applyToExistingExpenses: 'Auf passende bestehende Ausgaben anwenden',
            confirmError: 'Gib den Händler ein und nimm mindestens eine Änderung vor',
            confirmErrorMerchant: 'Bitte Händler eingeben',
            confirmErrorUpdate: 'Bitte mindestens eine Aktualisierung anwenden',
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
            subtitle: 'Einstellungen zum Debuggen und Testen der App in der Staging-Umgebung.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Relevante Funktionsupdates und Expensify-Neuigkeiten erhalten',
        muteAllSounds: 'Alle Expensify‑Töne stummschalten',
    },
    priorityModePage: {
        priorityMode: 'Prioritätsmodus',
        explainerText:
            'Wähle, ob nur ungelesene und angeheftete Chats im #focus angezeigt werden sollen, oder ob alles angezeigt werden soll, wobei die neuesten und angehefteten Chats oben stehen.',
        priorityModes: {
            default: {
                label: 'Neueste',
                description: 'Alle Chats anzeigen, nach neuestem sortiert',
            },
            gsd: {
                label: '#fokus',
                description: 'Nur ungelesene anzeigen, alphabetisch sortiert',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
        generatingPDF: 'PDF erstellen',
        waitForPDF: 'Bitte warten, während wir das PDF erstellen.',
        errorPDF: 'Beim Versuch, Ihr PDF zu erstellen, ist ein Fehler aufgetreten',
        successPDF: 'Dein PDF wurde erstellt! Falls es nicht automatisch heruntergeladen wurde, verwende die Schaltfläche unten.',
    },
    reportDescriptionPage: {
        roomDescription: 'Zimmerbeschreibung',
        roomDescriptionOptional: 'Raumbeschreibung (optional)',
        explainerText: 'Legen Sie eine benutzerdefinierte Beschreibung für den Raum fest.',
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
        chooseThemeBelowOrSync: 'Wähle unten ein Design aus oder synchronisiere es mit den Einstellungen deines Geräts.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Durch die Anmeldung stimmst du den <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und der <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzrichtlinie</a> zu.</muted-text-xs>`,
        license: `<muted-text-xs>Die Geldübermittlung wird von ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS-ID:2017010) gemäß seinen <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">Lizenzen</a> bereitgestellt.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Keinen magischen Code erhalten?',
        enterAuthenticatorCode: 'Bitte gib deinen Authentifikatorcode ein',
        enterRecoveryCode: 'Bitte gib deinen Wiederherstellungscode ein',
        requiredWhen2FAEnabled: 'Erforderlich, wenn 2FA aktiviert ist',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Fordere einen neuen Code in <a>${timeRemaining}</a> an`,
        requestNewCodeAfterErrorOccurred: 'Neuen Code anfordern',
        error: {
            pleaseFillMagicCode: 'Bitte gib deinen magischen Code ein',
            incorrectMagicCode: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            pleaseFillTwoFactorAuth: 'Bitte gib deinen Zwei-Faktor-Authentifizierungscode ein',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Bitte fülle alle Felder aus',
        pleaseFillPassword: 'Bitte gib dein Passwort ein',
        pleaseFillTwoFactorAuth: 'Bitte gib deinen Zwei-Faktor-Code ein',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Gib deinen Zwei-Faktor-Authentifizierungscode ein, um fortzufahren',
        forgot: 'Vergessen?',
        requiredWhen2FAEnabled: 'Erforderlich, wenn 2FA aktiviert ist',
        error: {
            incorrectPassword: 'Falsches Passwort. Bitte versuche es erneut.',
            incorrectLoginOrPassword: 'Falscher Login oder falsches Passwort. Bitte versuche es erneut.',
            incorrect2fa: 'Falscher Zwei-Faktor-Authentifizierungscode. Bitte versuche es erneut.',
            twoFactorAuthenticationEnabled: 'Für dieses Konto ist 2FA aktiviert. Bitte melde dich mit deiner E‑Mail-Adresse oder deiner Telefonnummer an.',
            invalidLoginOrPassword: 'Ungültiger Benutzername oder Passwort. Bitte versuche es erneut oder setze dein Passwort zurück.',
            unableToResetPassword:
                'Wir konnten Ihr Passwort nicht ändern. Dies liegt wahrscheinlich an einem abgelaufenen Link zum Zurücksetzen des Passworts in einer älteren E-Mail. Wir haben Ihnen einen neuen Link per E-Mail geschickt, damit Sie es erneut versuchen können. Überprüfen Sie Ihren Posteingang und Ihren Spam-Ordner; die E-Mail sollte in wenigen Minuten eintreffen.',
            noAccess: 'Du hast keinen Zugriff auf diese Anwendung. Bitte füge deinen GitHub-Benutzernamen hinzu, um Zugriff zu erhalten.',
            accountLocked: 'Dein Konto wurde nach zu vielen erfolglosen Versuchen gesperrt. Bitte versuche es in 1 Stunde erneut.',
            fallback: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später erneut.',
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
        welcomeSignOffTitleManageTeam: 'Sobald Sie die oben genannten Aufgaben abgeschlossen haben, können wir weitere Funktionen wie Genehmigungs-Workflows und Regeln erkunden!',
        welcomeSignOffTitle: 'Es ist schön, dich kennenzulernen!',
        explanationModal: {
            title: 'Willkommen bei Expensify',
            description: 'Eine App, um geschäftliche und private Ausgaben in Chat-Geschwindigkeit zu verwalten. Probiere sie aus und sag uns, was du davon hältst. Vieles mehr folgt!',
            secondaryDescription: 'Um zurück zu Expensify Classic zu wechseln, tippe einfach auf dein Profilbild > Gehe zu Expensify Classic.',
        },
        getStarted: 'Loslegen',
        whatsYourName: 'Wie heißt du?',
        peopleYouMayKnow: 'Personen, die du vielleicht kennst, sind bereits hier! Bestätige deine E-Mail-Adresse, um dich ihnen anzuschließen.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `Jemand aus ${domain} hat bereits einen Workspace erstellt. Bitte gib den magischen Code ein, der an ${email} gesendet wurde.`,
        joinAWorkspace: 'Workspace beitreten',
        listOfWorkspaces: 'Hier ist die Liste der Arbeitsbereiche, denen du beitreten kannst. Keine Sorge, du kannst ihnen auch später jederzeit beitreten, wenn du möchtest.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} Mitglied${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Wo arbeitest du?',
        errorSelection: 'Wähle eine Option, um fortzufahren',
        purpose: {
            title: 'Was möchtest du heute tun?',
            errorContinue: 'Bitte auf „Weiter“ drücken, um die Einrichtung abzuschließen',
            errorBackButton: 'Bitte beantworte die Einrichtungsfragen, um die App verwenden zu können',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Von meinem Arbeitgeber zurückgezahlt werden',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Ausgaben meines Teams verwalten',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Ausgaben verfolgen und budgetieren',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Mit Freund*innen chatten und Ausgaben teilen',
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
            title: 'An welchen Funktionen bist du interessiert?',
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
                descriptionTwo: 'Schließe dich deinen Kolleg:innen an, die bereits Expensify nutzen',
                descriptionThree: 'Genieße ein individuelleres Erlebnis',
            },
            addWorkEmail: 'Arbeits-E-Mail hinzufügen',
        },
        workEmailValidation: {
            title: 'Bestätige deine Arbeits-E-Mail-Adresse',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Bitte gib den magischen Code ein, der an ${workEmail} gesendet wurde. Er sollte in ein bis zwei Minuten ankommen.`,
        },
        workEmailValidationError: {
            publicEmail: 'Bitte gib eine gültige geschäftliche E-Mail-Adresse von einer eigenen Domain ein, z. B. mitch@company.com',
            offline: 'Wir konnten deine Arbeits-E-Mail nicht hinzufügen, da du anscheinend offline bist',
        },
        mergeBlockScreen: {
            title: 'Geschäftliche E-Mail-Adresse konnte nicht hinzugefügt werden',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Wir konnten ${workEmail} nicht hinzufügen. Bitte versuche es später erneut in den Einstellungen oder chatte mit Concierge, um Hilfe zu erhalten.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Mach eine [Probefahrt](${testDriveURL})`,
                description: ({testDriveURL}) => `[Machen Sie eine kurze Produkt-Tour](${testDriveURL}), um zu sehen, warum Expensify der schnellste Weg ist, Ihre Spesen abzurechnen.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Mach eine [Probefahrt](${testDriveURL})`,
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
                        3. Klicke auf *Weitere Funktionen*.
                        4. Aktiviere *Workflows*.
                        5. Wechsle zu *Workflows* im Workspace-Editor.
                        6. Aktiviere *Genehmigungen*.
                        7. Du wirst als Spesengenehmiger:in festgelegt. Du kannst dies auf eine:n Admin ändern, sobald du dein Team einlädst.

                        [Zu den weiteren Funktionen](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Erstelle](${workspaceConfirmationLink}) einen Arbeitsbereich`,
                description: 'Erstelle einen Arbeitsbereich und konfiguriere die Einstellungen mit Hilfe deiner Setup-Spezialist*in!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Erstelle einen [Arbeitsbereich](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Erstelle einen Workspace*, um Ausgaben zu verfolgen, Belege zu scannen, zu chatten und mehr.

                        1. Klicke auf *Workspaces* > *Neuer Workspace*.

                        *Dein neuer Workspace ist bereit!* [Sieh ihn dir an](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[ Kategorien](${workspaceCategoriesLink}) einrichten`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Richte Kategorien ein*, damit dein Team Ausgaben für eine einfache Berichterstattung codieren kann.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Categories*.
                        4. Deaktiviere alle Kategorien, die du nicht brauchst.
                        5. Füge oben rechts deine eigenen Kategorien hinzu.

                        [Zu den Workspace-Kategorieneinstellungen](${workspaceCategoriesLink}).

                        ![Kategorien einrichten](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Ausgabe einreichen',
                description: dedent(`
                    *Reiche eine Ausgabe ein*, indem du einen Betrag eingibst oder eine Quittung scannst.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Ausgabe erstellen*.
                    3. Gib einen Betrag ein oder scanne eine Quittung.
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

                    Und fertig!
                `),
            },
            trackExpenseTask: {
                title: 'Ausgabe verfolgen',
                description: dedent(`
                    *Verfolge eine Ausgabe* in beliebiger Währung, egal ob du eine Belegquittung hast oder nicht.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Ausgabe erstellen*.
                    3. Gib einen Betrag ein oder scanne einen Beleg.
                    4. Wähle deinen *persönlichen* Bereich.
                    5. Klicke auf *Erstellen*.

                    Und fertig! Genau, so einfach ist das.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Verbinden${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'bis'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'dein' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Verbinde ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'dein' : 'bis'} ${integrationName} für eine automatische Spesenkodierung und Synchronisierung, die den Monatsabschluss zum Kinderspiel macht.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Accounting*.
                        4. Suche ${integrationName}.
                        5. Klicke auf *Connect*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? `[Zur Buchhaltung](${workspaceAccountingLink}).

                        ![Mit ${integrationName} verbinden](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
        : `[Bring mich zur Buchhaltung](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[your corporate cards](${corporateCardLink}) verbinden`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Verknüpfen Sie die Karten, die Sie bereits haben, für den automatischen Transaktionsimport, Belegabgleich und die Abstimmung.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *Firmenkarten*.
                        4. Folgen Sie den Anweisungen, um Ihre Karten zu verknüpfen.

                        [Zu den Firmenkarten](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[your team](${workspaceMembersLink}) einladen`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Lade dein Team ein*, Expensify zu nutzen, damit alle noch heute mit der Spesenerfassung starten können.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Members* > *Invite member*.
                        4. Gib E-Mail-Adressen oder Telefonnummern ein.
                        5. Füge eine individuelle Einladung hinzu, wenn du möchtest!

                        [Zu den Workspace-Mitgliedern](${workspaceMembersLink}).

                        ![Lade dein Team ein](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[Richtlinien](${workspaceCategoriesLink}) und [Tags](${workspaceTagsLink}) einrichten`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Richte Kategorien und Tags ein*, damit dein Team Ausgaben für eine einfache Berichterstattung kodieren kann.

                        Importiere sie automatisch, indem du [deine Buchhaltungssoftware verbindest](${workspaceAccountingLink}), oder richte sie manuell in deinen [Workspace-Einstellungen](${workspaceCategoriesLink}) ein.`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[Tags](${workspaceTagsLink}) einrichten`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Verwende Tags, um zusätzliche Ausgabendetails wie Projekte, Kunden, Standorte und Abteilungen hinzuzufügen. Wenn du mehrere Ebenen von Tags benötigst, kannst du auf den Control-Tarif upgraden.

                        1. Klicke auf *Arbeitsbereiche*.
                        2. Wähle deinen Arbeitsbereich aus.
                        3. Klicke auf *Weitere Funktionen*.
                        4. Aktiviere *Tags*.
                        5. Navigiere im Arbeitsbereich-Editor zu *Tags*.
                        6. Klicke auf *+ Tag hinzufügen*, um eigene Tags zu erstellen.

                        [Zu weiteren Funktionen](${workspaceMoreFeaturesLink}).

                        ![Tags einrichten](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Lade deine[n Steuerberater](${workspaceMembersLink}) ein`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Laden Sie Ihre*n Steuerberater*in ein*, mit Ihnen in Ihrem Workspace zusammenzuarbeiten und Ihre Geschäftsausgaben zu verwalten.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *Mitglieder*.
                        4. Klicken Sie auf *Mitglied einladen*.
                        5. Geben Sie die E-Mail-Adresse Ihres/Ihrer Steuerberater*in ein.

                        [Steuerberater*in jetzt einladen](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Chat starten',
                description: dedent(`
                    *Starte einen Chat* mit jeder Person über ihre E-Mail-Adresse oder Telefonnummer.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Chat starten*.
                    3. Gib eine E-Mail-Adresse oder Telefonnummer ein.

                    Wenn die Person Expensify noch nicht nutzt, wird sie automatisch eingeladen.

                    Jeder Chat wird außerdem in eine E-Mail oder SMS umgewandelt, auf die sie direkt antworten kann.
                `),
            },
            splitExpenseTask: {
                title: 'Ausgabe aufteilen',
                description: dedent(`
                    *Teile Ausgaben* mit einer oder mehreren Personen.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Chat starten*.
                    3. Gib E-Mail-Adressen oder Telefonnummern ein.
                    4. Klicke im Chat auf die graue *+*-Schaltfläche > *Ausgabe teilen*.
                    5. Erstelle die Ausgabe, indem du *Manuell*, *Scan* oder *Strecke* auswählst.

                    Du kannst bei Bedarf weitere Details hinzufügen oder sie einfach abschicken. So bekommst du dein Geld zurück!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Überprüfe deine [Workspace-Einstellungen](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        So überprüfst und aktualisierst du deine Arbeitsbereichseinstellungen:
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

                    Und fertig!
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
            onboardingEmployerOrSubmitMessage: 'Geld zurückzubekommen ist so einfach wie eine Nachricht zu senden. Schauen wir uns die Grundlagen an.',
            onboardingPersonalSpendMessage: 'So verfolgen Sie Ihre Ausgaben mit wenigen Klicks.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Deine kostenlose Testversion wurde gestartet! Lass uns alles einrichten.
                        👋 Hallo, ich bin deine Expensify-Einrichtungsfachkraft. Ich habe bereits einen Workspace erstellt, um die Belege und Ausgaben deines Teams zu verwalten. Um das Beste aus deiner 30-tägigen kostenlosen Testversion herauszuholen, folge einfach den verbleibenden Einrichtungsschritten unten!
                    `)
                    : dedent(`
                        # Ihre kostenlose Testversion hat begonnen! Lassen Sie uns alles einrichten.
                        👋 Hallo, ich bin Ihre Expensify-Einrichtungsspezialist*in. Da Sie jetzt einen Workspace erstellt haben, nutzen Sie Ihre 30-tägige kostenlose Testversion optimal, indem Sie die folgenden Schritte ausführen!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Lass uns mit deiner Einrichtung beginnen\n👋 Hallo, ich bin deine Expensify-Einrichtungsspezialist*in. Ich habe bereits einen Workspace erstellt, mit dem du deine Belege und Ausgaben verwalten kannst. Um das Beste aus deiner 30-tägigen kostenlosen Testphase herauszuholen, folge einfach den verbleibenden Einrichtungsschritten unten!',
            onboardingChatSplitMessage: 'Rechnungen mit Freund*innen zu teilen ist so einfach wie das Senden einer Nachricht. So geht’s.',
            onboardingAdminMessage: 'Erfahre, wie du als Admin den Arbeitsbereich deines Teams verwaltest und deine eigenen Ausgaben einreichst.',
            onboardingLookingAroundMessage:
                'Expensify ist vor allem für Spesen, Reisen und die Verwaltung von Firmenkarten bekannt, kann aber viel mehr. Sag mir einfach, was dich interessiert, und ich helfe dir beim Einstieg.',
            onboardingTestDriveReceiverMessage: '*Du erhältst 3 Monate gratis! Leg unten los.*',
        },
        workspace: {
            title: 'Bleib organisiert mit einem Workspace',
            subtitle: 'Schalte leistungsstarke Tools frei, um dein Kostenmanagement zu vereinfachen – alles an einem Ort. Mit einem Workspace kannst du:',
            explanationModal: {
                descriptionOne: 'Belege verfolgen und organisieren',
                descriptionTwo: 'Ausgaben kategorisieren und verschlagworten',
                descriptionThree: 'Berichte erstellen und teilen',
            },
            price: '30 Tage kostenlos testen, dann für nur <strong>5 $/Nutzer/Monat</strong> upgraden.',
            createWorkspace: 'Arbeitsbereich erstellen',
        },
        confirmWorkspace: {
            title: 'Workspace bestätigen',
            subtitle:
                'Erstelle einen Workspace, um Belege zu erfassen, Ausgaben zu erstatten, Reisen zu verwalten, Berichte zu erstellen und mehr – alles in der Geschwindigkeit eines Chats.',
        },
        inviteMembers: {
            title: 'Mitglieder einladen',
            subtitle: 'Füge dein Team hinzu oder lade deine*n Steuerberater*in ein. Je mehr, desto besser!',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Zeig mir das nicht mehr an',
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: 'Name darf keine Sonderzeichen enthalten',
            containsReservedWord: 'Name darf die Wörter Expensify oder Concierge nicht enthalten',
            hasInvalidCharacter: 'Name darf kein Komma oder Semikolon enthalten',
            requiredFirstName: 'Der Vorname darf nicht leer sein',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Wie lautet Ihr gesetzlicher Name?',
        enterDateOfBirth: 'Wie ist dein Geburtsdatum?',
        enterAddress: 'Wie lautet deine Adresse?',
        enterPhoneNumber: 'Wie lautet deine Telefonnummer?',
        personalDetails: 'Persönliche Angaben',
        privateDataMessage: 'Diese Angaben werden für Reisen und Zahlungen verwendet. Sie werden niemals in deinem öffentlichen Profil angezeigt.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Gesetzlicher Nachname',
        address: 'Adresse',
        error: {
            dateShouldBeBefore: (dateString: string) => `Datum muss vor dem ${dateString} liegen`,
            dateShouldBeAfter: (dateString: string) => `Datum muss nach ${dateString} liegen`,
            hasInvalidCharacter: 'Name darf nur lateinische Zeichen enthalten',
            incorrectZipFormat: (zipFormat?: string) => `Ungültiges Postleitzahlformat${zipFormat ? `Zulässiges Format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Bitte stelle sicher, dass die Telefonnummer gültig ist (z. B. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link wurde erneut gesendet',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `Ich habe einen magischen Anmeldelink an ${login} gesendet. Bitte prüfe dein ${loginType}, um dich anzumelden.`,
        resendLink: 'Link erneut senden',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Um ${secondaryLogin} zu verifizieren, sende bitte den magischen Code erneut aus den Kontoeinstellungen von ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Wenn du keinen Zugriff mehr auf ${primaryLogin} hast, trenne bitte die Verknüpfung deiner Konten.`,
        unlink: 'Verknüpfung aufheben',
        linkSent: 'Link gesendet!',
        successfullyUnlinkedLogin: 'Zusätzlicher Login wurde erfolgreich getrennt!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Unser E-Mail-Anbieter hat E-Mails an ${login} aufgrund von Zustellungsproblemen vorübergehend ausgesetzt. Um Ihr Login zu entsperren, führen Sie bitte die folgenden Schritte aus:`,
        confirmThat: (login: string) =>
            `<strong>Bestätige, dass ${login} richtig geschrieben ist und eine echte, zustellbare E-Mail-Adresse ist.</strong> E-Mail-Aliasse wie „expenses@domain.com“ müssen Zugriff auf ihr eigenes E-Mail-Postfach haben, damit sie ein gültiger Expensify-Login sind.`,
        ensureYourEmailClient: `<strong>Stellen Sie sicher, dass Ihr E-Mail-Client E-Mails von expensify.com zulässt.</strong> Anweisungen zur Durchführung dieses Schritts finden Sie <a href="${CONST.SET_NOTIFICATION_LINK}">hier</a>, eventuell benötigen Sie jedoch Unterstützung Ihrer IT-Abteilung, um Ihre E-Mail-Einstellungen zu konfigurieren.`,
        onceTheAbove: `Sobald die oben genannten Schritte abgeschlossen sind, kontaktiere bitte <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a>, um deine Anmeldung zu entsperren.`,
    },
    openAppFailureModal: {
        title: 'Etwas ist schiefgelaufen ...',
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
        selectYear: 'Bitte wählen Sie ein Jahr aus',
    },
    focusModeUpdateModal: {
        title: 'Willkommen im #Fokusmodus!',
        prompt: (priorityModePageUrl: string) =>
            `Behalte den Überblick, indem du nur ungelesene Chats oder Chats siehst, die deine Aufmerksamkeit benötigen. Keine Sorge, du kannst das jederzeit in den <a href="${priorityModePageUrl}">Einstellungen</a> ändern.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Der Chat, den du suchst, kann nicht gefunden werden.',
        getMeOutOfHere: 'Hol mich hier raus',
        iouReportNotFound: 'Die gesuchten Zahlungsdetails konnten nicht gefunden werden.',
        notHere: 'Hm … es ist nicht hier',
        pageNotFound: 'Ups, diese Seite kann nicht gefunden werden',
        noAccess: 'Dieser Chat oder diese Ausgabe wurde möglicherweise gelöscht oder du hast keinen Zugriff darauf.\n\nBei Fragen wende dich bitte an concierge@expensify.com',
        goBackHome: 'Zurück zur Startseite',
        commentYouLookingForCannotBeFound: 'Der gesuchte Kommentar kann nicht gefunden werden.',
        goToChatInstead: 'Geh stattdessen zum Chat.',
        contactConcierge: 'Bei Fragen wende dich bitte an concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ups ... ${isBreakLine ? '\n' : ''}Etwas ist schiefgelaufen`,
        subtitle: 'Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es später noch einmal.',
        wrongTypeSubtitle: 'Diese Suche ist ungültig. Versuche, deine Suchkriterien anzupassen.',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Füge ein Emoji hinzu, damit deine Kolleg:innen und Freund:innen leicht sehen können, was los ist. Du kannst optional auch eine Nachricht hinzufügen!',
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
        clearAfter: 'Leeren nach',
        whenClearStatus: 'Wann sollen wir deinen Status zurücksetzen?',
        vacationDelegate: 'Urlaubsvertretung',
        setVacationDelegate: `Legen Sie eine Vertretung für den Urlaub fest, die Berichte in Ihrer Abwesenheit in Ihrem Namen genehmigt.`,
        vacationDelegateError: 'Beim Aktualisieren Ihrer Urlaubsvertretung ist ein Fehler aufgetreten.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `als Urlaubsvertretung von ${nameOrEmail}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `an ${submittedToName} als Urlaubsvertretung für ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Sie weisen ${nameOrEmail} als Ihre Urlaubsvertretung zu. Diese Person ist noch nicht in all Ihren Workspaces. Wenn Sie fortfahren, wird eine E-Mail an alle Admins Ihrer Workspaces gesendet, damit sie hinzugefügt wird.`,
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
        manuallyAdd: 'Bankkonto manuell hinzufügen',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        accountEnding: 'Konto endet auf',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in Ihrem Arbeitsbereich verwendet.',
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
        toGetStarted:
            'Fügen Sie ein Bankkonto hinzu, um Ausgaben zu erstatten, Expensify Cards auszugeben, Rechnungszahlungen zu erhalten und Rechnungen von einem zentralen Ort aus zu bezahlen.',
        plaidBodyCopy: 'Geben Sie Ihren Mitarbeitenden eine einfachere Möglichkeit, Firmenausgaben zu bezahlen – und erstattet zu bekommen.',
        checkHelpLine: 'Ihre Routing-Nummer und Kontonummer finden Sie auf einem Scheck für dieses Konto.',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Um ein Bankkonto zu verbinden, <a href="${contactMethodRoute}">füge bitte eine E-Mail-Adresse als primäre Anmeldung hinzu</a> und versuche es erneut. Du kannst deine Telefonnummer als sekundäre Anmeldung hinzufügen.`,
        hasBeenThrottledError: 'Beim Hinzufügen deines Bankkontos ist ein Fehler aufgetreten. Bitte warte ein paar Minuten und versuche es dann erneut.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Ups! Es scheint, dass die Währung deines Arbeitsbereichs auf eine andere Währung als USD eingestellt ist. Um fortzufahren, gehe bitte zu den <a href="${workspaceRoute}">Einstellungen deines Arbeitsbereichs</a>, stelle sie auf USD ein und versuche es erneut.`,
        bbaAdded: 'Geschäftskonto hinzugefügt!',
        bbaAddedDescription: 'Es ist zur Verwendung für Zahlungen bereit.',
        error: {
            youNeedToSelectAnOption: 'Bitte wählen Sie eine Option, um fortzufahren',
            noBankAccountAvailable: 'Es ist leider kein Bankkonto verfügbar',
            noBankAccountSelected: 'Bitte wähle ein Konto aus',
            taxID: 'Bitte gib eine gültige Steuer-ID ein',
            website: 'Bitte eine gültige Website eingeben',
            zipCode: `Bitte gib eine gültige Postleitzahl im folgenden Format ein: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Bitte gib eine gültige Telefonnummer ein',
            email: 'Bitte eine gültige E-Mail-Adresse eingeben',
            companyName: 'Bitte gib einen gültigen Firmennamen ein',
            addressCity: 'Bitte eine gültige Stadt eingeben',
            addressStreet: 'Bitte gib eine gültige Straßenadresse ein',
            addressState: 'Bitte wähle einen gültigen Bundesstaat aus',
            incorporationDateFuture: 'Das Gründungsdatum darf nicht in der Zukunft liegen',
            incorporationState: 'Bitte wähle einen gültigen Bundesstaat aus',
            industryCode: 'Bitte geben Sie einen gültigen Branchencode mit sechs Ziffern ein',
            restrictedBusiness: 'Bitte bestätigen Sie, dass das Unternehmen nicht auf der Liste der eingeschränkten Unternehmen steht',
            routingNumber: 'Bitte gib eine gültige Routingnummer ein',
            accountNumber: 'Bitte gib eine gültige Kontonummer ein',
            routingAndAccountNumberCannotBeSame: 'Routing- und Kontonummer dürfen nicht übereinstimmen',
            companyType: 'Bitte wähle einen gültigen Unternehmenstyp aus',
            tooManyAttempts:
                'Aufgrund einer hohen Anzahl von Anmeldeversuchen wurde diese Option für 24 Stunden deaktiviert. Bitte versuchen Sie es später erneut oder geben Sie die Angaben stattdessen manuell ein.',
            address: 'Bitte gib eine gültige Adresse ein',
            dob: 'Bitte wähle ein gültiges Geburtsdatum aus',
            age: 'Muss über 18 Jahre alt sein',
            ssnLast4: 'Bitte gib die gültigen letzten 4 Ziffern deiner SSN ein',
            firstName: 'Bitte gib einen gültigen Vornamen ein',
            lastName: 'Bitte gib einen gültigen Nachnamen ein',
            noDefaultDepositAccountOrDebitCardAvailable: 'Bitte füge ein Standard-Einzahlungskonto oder eine Debitkarte hinzu',
            validationAmounts: 'Die von Ihnen eingegebenen Validierungsbeträge sind falsch. Bitte überprüfen Sie Ihren Kontoauszug und versuchen Sie es erneut.',
            fullName: 'Bitte gib einen gültigen vollständigen Namen ein',
            ownershipPercentage: 'Bitte gib eine gültige Prozentzahl ein',
            deletePaymentBankAccount:
                'Dieses Bankkonto kann nicht gelöscht werden, da es für Expensify Card-Zahlungen verwendet wird. Wenn du dieses Konto trotzdem löschen möchtest, wende dich bitte an Concierge.',
            sameDepositAndWithdrawalAccount: 'Das Einzahlungs- und das Auszahlungskonto sind identisch.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Wo befindet sich Ihr Bankkonto?',
        accountDetailsStepHeader: 'Wie lauten Ihre Kontodaten?',
        accountTypeStepHeader: 'Um welchen Kontotyp handelt es sich?',
        bankInformationStepHeader: 'Wie lauten deine Bankdaten?',
        accountHolderInformationStepHeader: 'Wie lauten die Kontoinhaberdaten?',
        howDoWeProtectYourData: 'Wie schützen wir Ihre Daten?',
        currencyHeader: 'Welche Währung hat Ihr Bankkonto?',
        confirmationStepHeader: 'Überprüfen Sie Ihre Angaben.',
        confirmationStepSubHeader: 'Überprüfe die Details unten und setze ein Häkchen bei den Bedingungen, um zu bestätigen.',
        toGetStarted: 'Fügen Sie ein persönliches Bankkonto hinzu, um Rückerstattungen zu erhalten, Rechnungen zu bezahlen oder die Expensify Wallet zu aktivieren.',
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
        passwordRequired: 'Bitte ein Passwort eingeben',
        passwordIncorrect: 'Falsches Passwort. Bitte versuche es erneut.',
        failedToLoadPDF: 'PDF-Datei konnte nicht geladen werden',
        pdfPasswordForm: {
            title: 'Passwortgeschützte PDF',
            infoText: 'Diese PDF-Datei ist passwortgeschützt.',
            beforeLinkText: 'Bitte',
            linkText: 'Passwort eingeben',
            afterLinkText: 'um es anzusehen.',
            formLabel: 'PDF ansehen',
        },
        attachmentNotFound: 'Anhang nicht gefunden',
        retry: 'Erneut versuchen',
    },
    messages: {
        errorMessageInvalidPhone: `Bitte gib eine gültige Telefonnummer ohne Klammern oder Bindestriche ein. Wenn du außerhalb der USA bist, füge bitte deine Ländervorwahl hinzu (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Ungültige E-Mail',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} ist bereits Mitglied von ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} ist bereits Admin von ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Wenn Sie mit der Aktivierung Ihres Expensify Wallet fortfahren, bestätigen Sie, dass Sie Folgendes gelesen, verstanden und akzeptiert haben',
        facialScan: 'Onfidos Richtlinie und Freigabe für Gesichtsscan',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfidos Richtlinie und Freigabe für Gesichtsscans</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Datenschutz</a> und <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Nutzungsbedingungen</a>.</muted-text-micro>`,
        tryAgain: 'Versuch es noch einmal',
        verifyIdentity: 'Identität bestätigen',
        letsVerifyIdentity: 'Lass uns deine Identität bestätigen',
        butFirst: `Aber zuerst das Langweilige. Lies dir im nächsten Schritt den juristischen Text durch und klicke auf „Akzeptieren“, wenn du bereit bist.`,
        genericError: 'Bei der Verarbeitung dieses Schritts ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        cameraPermissionsNotGranted: 'Kamera­zugriff aktivieren',
        cameraRequestMessage: 'Wir benötigen Zugriff auf Ihre Kamera, um die Bankkontoverifizierung abzuschließen. Bitte aktivieren Sie dies über Einstellungen > New Expensify.',
        microphonePermissionsNotGranted: 'Mikrofonzugriff aktivieren',
        microphoneRequestMessage: 'Wir benötigen Zugriff auf dein Mikrofon, um die Bankkontoverifizierung abzuschließen. Bitte aktiviere dies unter Einstellungen > New Expensify.',
        originalDocumentNeeded: 'Bitte laden Sie ein Originalfoto Ihres Ausweises hoch, nicht einen Screenshot oder einen Scan.',
        documentNeedsBetterQuality:
            'Ihr Ausweis scheint beschädigt zu sein oder es fehlen Sicherheitsmerkmale. Bitte laden Sie ein Originalbild eines unbeschädigten, vollständig sichtbaren Ausweises hoch.',
        imageNeedsBetterQuality: 'Es gibt ein Problem mit der Bildqualität deines Ausweises. Bitte lade ein neues Bild hoch, auf dem dein gesamter Ausweis deutlich zu sehen ist.',
        selfieIssue: 'Es gibt ein Problem mit deinem Selfie/Video. Bitte lade ein aktuelles Selfie/Video hoch.',
        selfieNotMatching: 'Dein Selfie/Video stimmt nicht mit deinem Ausweis überein. Bitte lade ein neues Selfie/Video hoch, auf dem dein Gesicht deutlich zu erkennen ist.',
        selfieNotLive: 'Dein Selfie/Video scheint kein Livefoto/-video zu sein. Bitte lade ein Live-Selfie/-video hoch.',
    },
    additionalDetailsStep: {
        headerTitle: 'Zusätzliche Details',
        helpText: 'Wir müssen die folgenden Informationen bestätigen, bevor du mit deinem Wallet Geld senden und empfangen kannst.',
        helpTextIdologyQuestions: 'Wir müssen Ihnen nur noch ein paar Fragen stellen, um Ihre Identität abschließend zu bestätigen.',
        helpLink: 'Erfahre mehr darüber, warum wir das benötigen.',
        legalFirstNameLabel: 'Gesetzlicher Vorname',
        legalMiddleNameLabel: 'Zweiter Vorname laut Ausweis',
        legalLastNameLabel: 'Gesetzlicher Nachname',
        selectAnswer: 'Bitte wähle eine Antwort aus, um fortzufahren',
        ssnFull9Error: 'Bitte geben Sie eine gültige neunstellige Sozialversicherungsnummer ein',
        needSSNFull9: 'Wir können Ihre Sozialversicherungsnummer nicht verifizieren. Bitte geben Sie alle neun Stellen Ihrer Sozialversicherungsnummer ein.',
        weCouldNotVerify: 'Wir konnten nicht verifizieren',
        pleaseFixIt: 'Bitte korrigiere diese Angaben, bevor du fortfährst',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Wir konnten Ihre Identität nicht verifizieren. Bitte versuchen Sie es später erneut oder wenden Sie sich an <a href="mailto:${conciergeEmail}">${conciergeEmail}</a>, wenn Sie Fragen haben.`,
    },
    termsStep: {
        headerTitle: 'Bedingungen und Gebühren',
        headerTitleRefactor: 'Gebühren und Bedingungen',
        haveReadAndAgreePlain: 'Ich habe die elektronischen Hinweise gelesen und stimme zu, sie elektronisch zu erhalten.',
        haveReadAndAgree: `Ich habe gelesen und bin damit einverstanden, <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">elektronische Offenlegungen</a> zu erhalten.`,
        agreeToThePlain: 'Ich stimme der Datenschutz- und Wallet-Vereinbarung zu.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Ich stimme der <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzerklärung</a> und der <a href="${walletAgreementUrl}">Wallet-Vereinbarung</a> zu.`,
        enablePayments: 'Zahlungen aktivieren',
        monthlyFee: 'Monatliche Gebühr',
        inactivity: 'Inaktivität',
        noOverdraftOrCredit: 'Keine Überziehungs- oder Kreditfunktion.',
        electronicFundsWithdrawal: 'Abbuchung elektronischer Geldmittel',
        standard: 'Standard',
        reviewTheFees: 'Schau dir einige Gebühren an.',
        checkTheBoxes: 'Bitte kreuzen Sie die Kästchen unten an.',
        agreeToTerms: 'Stimme den Bedingungen zu und du bist startklar!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Das Expensify Wallet wird von ${walletProgram} ausgegeben.`,
            perPurchase: 'Pro Kauf',
            atmWithdrawal: 'Geldautomat-Abhebung',
            cashReload: 'Bargeldaufladung',
            inNetwork: 'im Netzwerk',
            outOfNetwork: 'außerhalb des Netzwerks',
            atmBalanceInquiry: 'Geldautomaten-Saldoabfrage (im eigenen oder fremden Netzwerk)',
            customerService: 'Kundenservice (automatisiert oder Live-Agent)',
            inactivityAfterTwelveMonths: 'Inaktivität (nach 12 Monaten ohne Transaktionen)',
            weChargeOneFee: 'Wir berechnen 1 andere Art von Gebühr. Sie ist:',
            fdicInsurance: 'Ihre Gelder sind für eine FDIC-Versicherung berechtigt.',
            generalInfo: `Allgemeine Informationen zu Prepaid-Konten finden Sie unter <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Details und Bedingungen zu allen Gebühren und Dienstleistungen finden Sie unter <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> oder unter der Telefonnummer +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektronische Mittelentnahme (sofort)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(Min. ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Eine Liste aller Expensify-Wallet-Gebühren',
            typeOfFeeHeader: 'Alle Gebühren',
            feeAmountHeader: 'Betrag',
            moreDetailsHeader: 'Details',
            openingAccountTitle: 'Kontoeröffnung',
            openingAccountDetails: 'Für die Kontoeröffnung fällt keine Gebühr an.',
            monthlyFeeDetails: 'Es gibt keine monatliche Gebühr.',
            customerServiceTitle: 'Kundendienst',
            customerServiceDetails: 'Es fallen keine Kundenservicegebühren an.',
            inactivityDetails: 'Es gibt keine Inaktivitätsgebühr.',
            sendingFundsTitle: 'Geld an ein anderes Kontoinhaber·innenkonto senden',
            sendingFundsDetails: 'Es fallen keine Gebühren an, wenn du mit deinem Guthaben, Bankkonto oder deiner Debitkarte Geld an eine andere Kontoinhaber*in sendest.',
            electronicFundsStandardDetails:
                'Für Überweisungen von deinem Expensify Wallet auf dein Bankkonto mit der Standardoption fällt keine Gebühr an. Diese Überweisung wird in der Regel innerhalb von 1–3 Werktagen abgeschlossen.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Für die Überweisung von Guthaben aus deinem Expensify Wallet auf deine verknüpfte Debitkarte mit der Option „Sofortüberweisung“ fällt eine Gebühr an. Diese Überweisung wird normalerweise innerhalb weniger Minuten abgeschlossen.' +
                `Die Gebühr beträgt ${percentage}% des Überweisungsbetrags (mit einer Mindestgebühr von ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Ihre Gelder sind für eine FDIC-Versicherung berechtigt. Ihre Gelder werden bei ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, einem von der FDIC versicherten Institut, gehalten oder dorthin übertragen.` +
                `Sobald sie dort sind, sind Ihre Gelder durch die FDIC bis zu ${amount} versichert, falls ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} ausfällt, sofern bestimmte Einlagensicherungsanforderungen erfüllt sind und Ihre Karte registriert ist. Einzelheiten finden Sie unter ${CONST.TERMS.FDIC_PREPAID}.`,
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
        subtitle: 'Fast geschafft! Aus Sicherheitsgründen müssen wir einige Angaben bestätigen:',
        legalBusinessName: 'Rechtlicher Geschäftsname',
        companyWebsite: 'Firmenwebsite',
        taxIDNumber: 'Steuer-ID-Nummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        companyType: 'Unternehmensart',
        incorporationDate: 'Gründungsdatum',
        incorporationState: 'Gründungsstaat',
        industryClassificationCode: 'Branchenklassifizierungscode',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der',
        listOfRestrictedBusinesses: 'Liste eingeschränkter Unternehmen',
        incorporationDatePlaceholder: 'Startdatum (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Unternehmen',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Kooperativ',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Sonstiges',
        },
        industryClassification: 'Unter welcher Branche ist das Unternehmen eingeordnet?',
        industryClassificationCodePlaceholder: 'Nach Branchencode suchen',
    },
    requestorStep: {
        headerTitle: 'Persönliche Angaben',
        learnMore: 'Mehr erfahren',
        isMyDataSafe: 'Sind meine Daten sicher?',
    },
    personalInfoStep: {
        personalInfo: 'Persönliche Daten',
        enterYourLegalFirstAndLast: 'Wie lautet Ihr gesetzlicher Name?',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Gesetzlicher Nachname',
        legalName: 'Rechtlicher Name',
        enterYourDateOfBirth: 'Wie ist dein Geburtsdatum?',
        enterTheLast4: 'Wie lauten die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4SSN: 'Letzte 4 Ziffern der SSN',
        enterYourAddress: 'Wie lautet deine Adresse?',
        address: 'Adresse',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        byAddingThisBankAccount: 'Durch Hinzufügen dieses Bankkontos bestätigst du, dass du Folgendes gelesen hast, verstehst und akzeptierst',
        whatsYourLegalName: 'Wie lautet dein gesetzlicher Name?',
        whatsYourDOB: 'Wie ist dein Geburtsdatum?',
        whatsYourAddress: 'Wie lautet deine Adresse?',
        whatsYourSSN: 'Wie lauten die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        noPersonalChecks: 'Keine Sorge, hier gibt es keine persönlichen Bonitätsprüfungen!',
        whatsYourPhoneNumber: 'Wie lautet deine Telefonnummer?',
        weNeedThisToVerify: 'Wir benötigen dies, um dein Wallet zu verifizieren.',
    },
    businessInfoStep: {
        businessInfo: 'Unternehmensinfos',
        enterTheNameOfYourBusiness: 'Wie heißt Ihr Unternehmen?',
        businessName: 'Rechtlicher Unternehmensname',
        enterYourCompanyTaxIdNumber: 'Wie lautet die Steuer-ID Ihres Unternehmens?',
        taxIDNumber: 'Steuer-ID-Nummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        enterYourCompanyWebsite: 'Wie lautet die Website Ihres Unternehmens?',
        companyWebsite: 'Firmenwebsite',
        enterYourCompanyPhoneNumber: 'Wie lautet die Telefonnummer Ihres Unternehmens?',
        enterYourCompanyAddress: 'Wie lautet die Adresse Ihres Unternehmens?',
        selectYourCompanyType: 'Um welche Art von Unternehmen handelt es sich?',
        companyType: 'Unternehmensart',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Unternehmen',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Kooperativ',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Sonstiges',
        },
        selectYourCompanyIncorporationDate: 'Was ist das Gründungsdatum Ihres Unternehmens?',
        incorporationDate: 'Gründungsdatum',
        incorporationDatePlaceholder: 'Startdatum (yyyy-mm-dd)',
        incorporationState: 'Gründungsstaat',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In welchem Bundesstaat wurde Ihr Unternehmen gegründet?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        companyAddress: 'Firmenadresse',
        listOfRestrictedBusinesses: 'Liste eingeschränkter Unternehmen',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der',
        businessInfoTitle: 'Geschäftsinformationen',
        legalBusinessName: 'Rechtlicher Geschäftsname',
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
                    return 'Was ist die Business-Nummer (BN)?';
                case CONST.COUNTRY.GB:
                    return 'Wie lautet die Umsatzsteuer-Identifikationsnummer (USt-IdNr.)?';
                case CONST.COUNTRY.AU:
                    return 'Was ist die Australian Business Number (ABN)?';
                default:
                    return 'Was ist die EU-Umsatzsteuer-Identifikationsnummer?';
            }
        },
        whatsThisNumber: 'Was ist das für eine Zahl?',
        whereWasTheBusinessIncorporated: 'Wo wurde das Unternehmen gegründet?',
        whatTypeOfBusinessIsIt: 'Welche Art von Unternehmen ist es?',
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
        incorporationTypeName: 'Gesellschaftsform',
        businessCategory: 'Geschäftskategorie',
        annualPaymentVolume: 'Jährliches Zahlungsvolumen',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Jährliches Zahlungsvolumen in ${currencyCode}`,
        averageReimbursementAmount: 'Durchschnittliche Erstattungsbeträge',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Durchschnittliche Erstattungsbetrag in ${currencyCode}`,
        selectIncorporationType: 'Rechtsform auswählen',
        selectBusinessCategory: 'Geschäftskategorie auswählen',
        selectAnnualPaymentVolume: 'Jährliches Zahlungsvolumen auswählen',
        selectIncorporationCountry: 'Gründungsland auswählen',
        selectIncorporationState: 'Gründungsstaat auswählen',
        selectAverageReimbursement: 'Durchschnittlichen Erstattungsbetrag auswählen',
        selectBusinessType: 'Geschäftsart auswählen',
        findIncorporationType: 'Rechtsform finden',
        findBusinessCategory: 'Geschäftskategorie finden',
        findAnnualPaymentVolume: 'Jährliches Zahlungsvolumen finden',
        findIncorporationState: 'Gründungsstaat finden',
        findAverageReimbursement: 'Durchschnittliche Erstattungsbetragssumme finden',
        findBusinessType: 'Geschäftsart finden',
        error: {
            registrationNumber: 'Bitte gib eine gültige Registrierungsnummer ein',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Bitte gib eine gültige Arbeitgeber-Identifikationsnummer (EIN) ein';
                    case CONST.COUNTRY.CA:
                        return 'Bitte gib eine gültige Unternehmensnummer (BN) ein';
                    case CONST.COUNTRY.GB:
                        return 'Bitte gib eine gültige Umsatzsteuer-Identifikationsnummer (USt-IdNr.) an';
                    case CONST.COUNTRY.AU:
                        return 'Bitte geben Sie eine gültige australische Unternehmensnummer (ABN) ein';
                    default:
                        return 'Bitte gib eine gültige EU-Umsatzsteuer-Identifikationsnummer ein';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `Besitzen Sie 25 % oder mehr von ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `Gehören einzelnen Personen 25 % oder mehr von ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Gibt es weitere Personen, die 25 % oder mehr von ${companyName} besitzen?`,
        regulationRequiresUsToVerifyTheIdentity: 'Gesetzliche Vorschriften verlangen, dass wir die Identität jeder Person überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        companyOwner: 'Unternehmensinhaber',
        enterLegalFirstAndLastName: 'Wie lautet der gesetzliche Name der Eigentümer:in?',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Gesetzlicher Nachname',
        enterTheDateOfBirthOfTheOwner: 'Was ist das Geburtsdatum der:des Inhaber:in?',
        enterTheLast4: 'Wie lauten die letzten 4 Ziffern der Sozialversicherungsnummer des/der Inhaber(s)?',
        last4SSN: 'Letzte 4 Ziffern der SSN',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        enterTheOwnersAddress: 'Wie lautet die Adresse des/der Eigentümer·in?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        address: 'Adresse',
        byAddingThisBankAccount: 'Durch Hinzufügen dieses Bankkontos bestätigst du, dass du Folgendes gelesen hast, verstehst und akzeptierst',
        owners: 'Eigentümer*innen',
    },
    ownershipInfoStep: {
        ownerInfo: 'Eigentümerinformationen',
        businessOwner: 'Unternehmensinhaber',
        signerInfo: 'Signer-Informationen',
        doYouOwn: (companyName: string) => `Besitzen Sie 25 % oder mehr von ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `Gehören einzelnen Personen 25 % oder mehr von ${companyName}?`,
        regulationsRequire: 'Vorschriften verpflichten uns, die Identität jeder Person zu überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Gesetzlicher Nachname',
        whatsTheOwnersName: 'Wie lautet der gesetzliche Name der Eigentümer:in?',
        whatsYourName: 'Wie lautet Ihr gesetzlicher Name?',
        whatPercentage: 'Wie viel Prozent des Unternehmens gehören der Inhaber:in?',
        whatsYoursPercentage: 'Wie viel Prozent des Unternehmens besitzen Sie?',
        ownership: 'Eigentum',
        whatsTheOwnersDOB: 'Was ist das Geburtsdatum der:des Inhaber:in?',
        whatsYourDOB: 'Wie ist dein Geburtsdatum?',
        whatsTheOwnersAddress: 'Wie lautet die Adresse des/der Eigentümer·in?',
        whatsYourAddress: 'Wie lautet deine Adresse?',
        whatAreTheLast: 'Wie lauten die letzten 4 Ziffern der Sozialversicherungsnummer des Inhabers?',
        whatsYourLast: 'Wie lauten die letzten 4 Ziffern Ihrer Sozialversicherungsnummer?',
        whatsYourNationality: 'Wie lautet Ihr Staatsangehörigkeitsland?',
        whatsTheOwnersNationality: 'In welchem Land ist der/die Eigentümer:in Staatsbürger:in?',
        countryOfCitizenship: 'Staatsangehörigkeit',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4: 'Letzte 4 Ziffern der SSN',
        whyDoWeAsk: 'Warum fragen wir danach?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        ownershipPercentage: 'Eigentumsanteil',
        areThereOther: (companyName: string) => `Gibt es andere Personen, die ${companyName} zu 25 % oder mehr besitzen?`,
        owners: 'Eigentümer*innen',
        addCertified: 'Füge ein zertifiziertes Organigramm hinzu, das die wirtschaftlich Berechtigten zeigt',
        regulationRequiresChart:
            'Behördliche Vorschriften verpflichten uns, eine beglaubigte Kopie des Eigentumsdiagramms einzuholen, das jede Person oder jedes Unternehmen ausweist, die bzw. das 25 % oder mehr des Unternehmens besitzt.',
        uploadEntity: 'Diagramm zur Eigentümerstruktur der Einheit hochladen',
        noteEntity: 'Hinweis: Das Diagramm der Eigentumsverhältnisse der Gesellschaft muss von Ihrer/m Steuerberater*in, Rechtsbeistand oder notariell beglaubigt unterschrieben werden.',
        certified: 'Zertifiziertes Eigentumsdiagramm der Unternehmen',
        selectCountry: 'Land auswählen',
        findCountry: 'Land finden',
        address: 'Adresse',
        chooseFile: 'Datei auswählen',
        uploadDocuments: 'Zusätzliche Dokumentation hochladen',
        pleaseUpload:
            'Bitte laden Sie unten zusätzliche Unterlagen hoch, damit wir Ihre Identität als direkte:n oder indirekte:n Eigentümer:in von 25 % oder mehr der juristischen Person überprüfen können.',
        acceptedFiles: 'Akzeptierte Dateiformate: PDF, PNG, JPEG. Die Gesamtdateigröße für jeden Abschnitt darf 5 MB nicht überschreiten.',
        proofOfBeneficialOwner: 'Nachweis des wirtschaftlich Berechtigten',
        proofOfBeneficialOwnerDescription:
            'Bitte legen Sie eine unterschriebene Bescheinigung und ein Organigramm von einer Wirtschaftsprüferin/einem Wirtschaftsprüfer, einer Notarin/einem Notar oder einer Rechtsanwältin/einem Rechtsanwalt vor, die bzw. das den Besitz von 25 % oder mehr des Unternehmens bestätigt. Das Dokument muss innerhalb der letzten drei Monate datiert sein und die Zulassungsnummer der unterzeichnenden Person enthalten.',
        copyOfID: 'Ausweiskopie des wirtschaftlich Berechtigten',
        copyOfIDDescription: 'Beispiele: Reisepass, Führerschein usw.',
        proofOfAddress: 'Adressnachweis für wirtschaftlich Berechtigte',
        proofOfAddressDescription: 'Beispiele: Nebenkostenabrechnung, Mietvertrag usw.',
        codiceFiscale: 'Steuernummer/Tax ID',
        codiceFiscaleDescription:
            'Bitte laden Sie ein Video von einem Vor-Ort-Besuch oder einem aufgezeichneten Gespräch mit dem zeichnungsberechtigten Bevollmächtigten hoch. Die verantwortliche Person muss Folgendes angeben: vollständiger Name, Geburtsdatum, Firmenname, Handelsregisternummer, Steuernummer, eingetragene Anschrift, Art des Geschäfts und Zweck des Kontos.',
    },
    completeVerificationStep: {
        completeVerification: 'Verifizierung abschließen',
        confirmAgreements: 'Bitte bestätige die folgenden Vereinbarungen.',
        certifyTrueAndAccurate: 'Ich bestätige, dass die gemachten Angaben wahr und korrekt sind',
        certifyTrueAndAccurateError: 'Bitte bestätigen Sie, dass die Angaben wahrheitsgemäß und korrekt sind',
        isAuthorizedToUseBankAccount: 'Ich bin berechtigt, dieses Geschäftskonto für Geschäftsausgaben zu verwenden',
        isAuthorizedToUseBankAccountError: 'Sie müssen eine vertretungsberechtigte Führungsperson mit Berechtigung zur Nutzung des Geschäftskontos sein',
        termsAndConditions: 'Allgemeine Geschäftsbedingungen',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Bestätige dein Bankkonto',
        validateButtonText: 'Validieren',
        validationInputLabel: 'Transaktion',
        maxAttemptsReached: 'Die Verifizierung dieses Bankkontos wurde aufgrund zu vieler falscher Versuche deaktiviert.',
        description: `Innerhalb von 1–2 Werktagen senden wir drei (3) kleine Transaktionen auf Ihr Bankkonto von einem Namen wie „Expensify, Inc. Validation“.`,
        descriptionCTA: 'Bitte gib den Betrag jeder Transaktion in die Felder unten ein. Beispiel: 1.51.',
        letsChatText: 'Fast geschafft! Wir brauchen noch kurz deine Hilfe, um ein paar letzte Informationen im Chat zu bestätigen. Bereit?',
        enable2FATitle: 'Betrug verhindern, Zwei-Faktor-Authentifizierung (2FA) aktivieren',
        enable2FAText: 'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt 2FA ein, um Ihrem Konto eine zusätzliche Schutzebene hinzuzufügen.',
        secureYourAccount: 'Konto absichern',
    },
    countryStep: {
        confirmBusinessBank: 'Bestätige Währung und Land des Geschäftskontos',
        confirmCurrency: 'Währung und Land bestätigen',
        yourBusiness: 'Die Währung Ihres Geschäftskontos muss mit der Währung Ihres Arbeitsbereichs übereinstimmen.',
        youCanChange: 'Sie können die Währung Ihres Arbeitsbereichs ändern in Ihrem',
        findCountry: 'Land finden',
        selectCountry: 'Land auswählen',
    },
    bankInfoStep: {
        whatAreYour: 'Wie lauten die Details Ihres Geschäftskontos?',
        letsDoubleCheck: 'Lassen wir noch einmal überprüfen, ob alles gut aussieht.',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in Ihrem Arbeitsbereich verwendet.',
        accountNumber: 'Kontonummer',
        accountHolderNameDescription: 'Vollständiger Name der zeichnungsberechtigten Person',
    },
    signerInfoStep: {
        signerInfo: 'Signer-Informationen',
        areYouDirector: (companyName: string) => `Sind Sie Director bei ${companyName}?`,
        regulationRequiresUs: 'Vorschriften verlangen, dass wir überprüfen, ob die unterzeichnende Person befugt ist, diese Aktion im Namen des Unternehmens durchzuführen.',
        whatsYourName: 'Wie lautet dein gesetzlicher Name?',
        fullName: 'Vollständiger gesetzlicher Name',
        whatsYourJobTitle: 'Wie lautet deine Berufsbezeichnung?',
        jobTitle: 'Berufsbezeichnung',
        whatsYourDOB: 'Wie ist dein Geburtsdatum?',
        uploadID: 'Lade Ausweis und Adressnachweis hoch',
        personalAddress: 'Nachweis der Privatadresse (z. B. Versorgungsrechnung)',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        proofOf: 'Nachweis der persönlichen Anschrift',
        enterOneEmail: (companyName: string) => `Gib die E-Mail-Adresse einer Führungskraft bei ${companyName} ein`,
        regulationRequiresOneMoreDirector: 'Die Vorschriften erfordern mindestens eine weitere Person im Vorstand als Unterzeichner.',
        hangTight: 'Einen Moment bitte ...',
        enterTwoEmails: (companyName: string) => `Gib die E-Mail-Adressen von zwei Direktoren von ${companyName} ein`,
        sendReminder: 'Erinnerung senden',
        chooseFile: 'Datei auswählen',
        weAreWaiting: 'Wir warten darauf, dass andere ihre Identität als Geschäftsführende des Unternehmens verifizieren.',
        id: 'Ausweiskopie',
        proofOfDirectors: 'Nachweis der Direktor(en)',
        proofOfDirectorsDescription: 'Beispiele: Oncorp Firmenprofil oder Unternehmensregistrierung.',
        codiceFiscale: 'Steuernummer',
        codiceFiscaleDescription: 'Steuernummer für Unterzeichner, autorisierte Nutzer und wirtschaftlich Berechtigte.',
        PDSandFSG: 'PDS- und FSG-Offenlegungsunterlagen',
        PDSandFSGDescription: dedent(`
            Unsere Partnerschaft mit Corpay nutzt eine API-Verbindung, um das umfangreiche Netzwerk internationaler Bankpartner von Corpay zu verwenden und damit Globale Erstattungen in Expensify zu ermöglichen. Gemäß der australischen Gesetzgebung stellen wir Ihnen den Financial Services Guide (FSG) und die Product Disclosure Statement (PDS) von Corpay zur Verfügung.

            Bitte lesen Sie die FSG- und PDS-Dokumente sorgfältig durch, da sie vollständige Details und wichtige Informationen zu den Produkten und Dienstleistungen enthalten, die Corpay anbietet. Bewahren Sie diese Dokumente für zukünftige Zwecke auf.
        `),
        pleaseUpload: 'Bitte laden Sie unten zusätzliche Unterlagen hoch, damit wir Ihre Identität als Geschäftsführer*in des Unternehmens überprüfen können.',
        enterSignerInfo: 'Signaturinformationen eingeben',
        thisStep: 'Dieser Schritt wurde abgeschlossen',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `verbindet ein ${currency}-Geschäftsbankkonto mit der Endziffer ${bankAccountLastFour} mit Expensify, um Mitarbeitende in ${currency} zu bezahlen. Der nächste Schritt erfordert Unterzeichnungsinformationen von einer bzw. einem Director.`,
        error: {
            emailsMustBeDifferent: 'E-Mail-Adressen müssen unterschiedlich sein',
        },
    },
    agreementsStep: {
        agreements: 'Vereinbarungen',
        pleaseConfirm: 'Bitte bestätige die folgenden Vereinbarungen',
        regulationRequiresUs: 'Gesetzliche Vorschriften verlangen, dass wir die Identität jeder Person überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        iAmAuthorized: 'Ich bin berechtigt, das Geschäftskonto für Geschäftsausgaben zu verwenden.',
        iCertify: 'Ich bestätige, dass die bereitgestellten Angaben wahrheitsgemäß und korrekt sind.',
        iAcceptTheTermsAndConditions: `Ich akzeptiere die <a href="https://cross-border.corpay.com/tc/">Allgemeinen Geschäftsbedingungen</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Ich akzeptiere die Allgemeinen Geschäftsbedingungen.',
        accept: 'Akzeptieren und Bankkonto hinzufügen',
        iConsentToThePrivacyNotice: 'Ich stimme der <a href="https://payments.corpay.com/compliance">Datenschutzerklärung</a> zu.',
        iConsentToThePrivacyNoticeAccessibility: 'Ich stimme der Datenschutzerklärung zu.',
        error: {
            authorized: 'Sie müssen eine vertretungsberechtigte Führungsperson mit Berechtigung zur Nutzung des Geschäftskontos sein',
            certify: 'Bitte bestätigen Sie, dass die Angaben wahrheitsgemäß und korrekt sind',
            consent: 'Bitte stimmen Sie der Datenschutzerklärung zu',
        },
    },
    docusignStep: {
        subheader: 'Docusign-Formular',
        pleaseComplete:
            'Bitte fülle das ACH-Autorisierungsformular über den Docusign-Link unten aus und lade die unterschriebene Kopie anschließend hier hoch, damit wir Gelder direkt von deinem Bankkonto abbuchen können.',
        pleaseCompleteTheBusinessAccount: 'Bitte füllen Sie den Antrag für das Business-Konto mit Lastschriftvereinbarung aus',
        pleaseCompleteTheDirect:
            'Bitte fülle die Lastschrifteinzug-vereinbarung über den untenstehenden Docusign-Link aus und lade die unterschriebene Kopie anschließend hier hoch, damit wir Beträge direkt von deinem Bankkonto einziehen können.',
        takeMeTo: 'Bring mich zu DocuSign',
        uploadAdditional: 'Zusätzliche Dokumentation hochladen',
        pleaseUpload: 'Bitte laden Sie das DEFT-Formular und die Docusign-Unterschriftsseite hoch',
        pleaseUploadTheDirect: 'Bitte laden Sie die Lastschriftvereinbarungen und die Docusign-Unterschriftsseite hoch',
    },
    finishStep: {
        letsFinish: 'Lass uns im Chat fertig machen!',
        thanksFor:
            'Danke für diese Angaben. Eine zuständige Support-Mitarbeiter*in wird Ihre Informationen nun prüfen. Wir melden uns, falls wir noch etwas von Ihnen benötigen, aber in der Zwischenzeit können Sie sich bei Fragen jederzeit gerne an uns wenden.',
        iHaveA: 'Ich habe eine Frage',
        enable2FA: 'Aktiviere die Zwei-Faktor-Authentifizierung (2FA), um Betrug zu verhindern',
        weTake: 'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt 2FA ein, um Ihrem Konto eine zusätzliche Schutzebene hinzuzufügen.',
        secure: 'Konto absichern',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Einen Moment',
        explanationLine: 'Wir überprüfen gerade Ihre Angaben. Sie können in Kürze mit den nächsten Schritten fortfahren.',
    },
    session: {
        offlineMessageRetry: 'Sie scheinen offline zu sein. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    },
    travel: {
        header: 'Reise buchen',
        title: 'Reise smart',
        subtitle: 'Nutze Expensify Travel, um die besten Reiseangebote zu erhalten und all deine Geschäftsausgaben an einem Ort zu verwalten.',
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
            title: 'Allgemeine Geschäftsbedingungen',
            label: 'Ich stimme den Geschäftsbedingungen zu',
            subtitle: `Bitte stimmen Sie den Expensify Travel-<a href="${CONST.TRAVEL_TERMS_URL}">Allgemeinen Geschäftsbedingungen</a> zu.`,
            error: 'Sie müssen den Expensify Travel Geschäftsbedingungen zustimmen, um fortzufahren',
            defaultWorkspaceError:
                'Sie müssen einen Standard-Arbeitsbereich festlegen, um Expensify Travel zu aktivieren. Gehen Sie zu Einstellungen > Arbeitsbereiche > klicken Sie auf die drei vertikalen Punkte neben einem Arbeitsbereich > Als Standard-Arbeitsbereich festlegen und versuchen Sie es dann erneut!',
        },
        flight: 'Flug',
        flightDetails: {
            passenger: 'Passagier',
            layover: (layover: string) => `<muted-text-label>Sie haben einen <strong>${layover}-Zwischenstopp</strong> vor diesem Flug</muted-text-label>`,
            takeOff: 'StartAbflug',
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
            roomType: 'Zimmerart',
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
            departs: 'Abflug',
            arrives: 'Kommt an',
            coachNumber: 'Wagennummer',
            seat: 'Sitz',
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
        departs: 'Abflug',
        errorMessage: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später erneut.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>Bitte <a href="${phoneErrorMethodsRoute}">füge eine geschäftliche E-Mail-Adresse als deinen primären Login hinzu</a>, um Reisen zu buchen.</rbr>`,
        domainSelector: {
            title: 'Domain',
            subtitle: 'Wählen Sie eine Domain für die Einrichtung von Expensify Travel.',
            recommended: 'Empfohlen',
        },
        domainPermissionInfo: {
            title: 'Domain',
            restriction: (domain: string) =>
                `Sie haben keine Berechtigung, Expensify Travel für die Domain <strong>${domain}</strong> zu aktivieren. Bitten Sie stattdessen jemanden aus dieser Domain, Travel zu aktivieren.`,
            accountantInvitation: `Wenn Sie Buchhalter:in sind, ziehen Sie es in Betracht, dem <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved!-Programm für Buchhalter:innen</a> beizutreten, um Reisen für diese Domain zu aktivieren.`,
        },
        publicDomainError: {
            title: 'Starte mit Expensify Travel',
            message: `Für Expensify Travel musst du deine geschäftliche E-Mail-Adresse (z. B. name@company.com) verwenden, nicht deine private E-Mail-Adresse (z. B. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel wurde deaktiviert',
            message: `Ihre Administration hat Expensify Travel deaktiviert. Bitte halten Sie sich für Reisebuchungen an die Reiserichtlinie Ihres Unternehmens.`,
        },
        verifyCompany: {
            title: 'Wir prüfen Ihre Anfrage ...',
            message: `Wir führen ein paar Prüfungen auf unserer Seite durch, um zu bestätigen, dass dein Konto für Expensify Travel bereit ist. Wir melden uns in Kürze bei dir!`,
            confirmText: 'Verstanden',
            conciergeMessage: ({domain}: {domain: string}) => `Reiseaktivierung für die Domain ${domain} ist fehlgeschlagen. Bitte überprüfe diese Domain und aktiviere Reisen dafür.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde gebucht. Bestätigungscode: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Dein Ticket für den Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde annulliert.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Ticket für Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde erstattet oder umgebucht.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate}} wurde von der Fluggesellschaft storniert.`,
            flightScheduleChangePending: (airlineCode: string) => `Die Fluggesellschaft hat eine Flugplanänderung für Flug ${airlineCode} vorgeschlagen; wir warten auf Bestätigung.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Flugplanänderung bestätigt: Flug ${airlineCode} startet jetzt um ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde aktualisiert.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Ihre Beförderungsklasse wurde auf ${cabinClass} für den Flug ${airlineCode} aktualisiert.`,
            flightSeatConfirmed: (airlineCode: string) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde bestätigt.`,
            flightSeatChanged: (airlineCode: string) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde geändert.`,
            flightSeatCancelled: (airlineCode: string) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde entfernt.`,
            paymentDeclined: 'Die Zahlung für Ihre Flugbuchung ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Sie haben Ihre ${type}-Reservierung ${id} storniert.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Der Anbieter hat deine ${type}-Reservierung ${id} storniert.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Ihre ${type}-Reservierung wurde erneut gebucht. Neue Bestätigungsnummer: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Ihre ${type}-Buchung wurde aktualisiert. Prüfen Sie die neuen Details in der Reiseroute.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Dein Bahnticket von ${origin} nach ${destination} am ${startDate} wurde erstattet. Eine Gutschrift wird veranlasst.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Ihr Bahnticket für ${origin} → ${destination} am ${startDate} wurde umgetauscht.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Dein Bahnticket für ${origin} → ${destination} am ${startDate} wurde aktualisiert.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Ihre ${type}-Reservierung wurde aktualisiert.`,
        },
        flightTo: 'Flug nach',
        trainTo: 'Zug nach',
        carRental: 'Mietwagen',
        nightIn: 'Nacht in',
        nightsIn: 'Nächte in',
    },
    workspace: {
        common: {
            card: 'Karten',
            expensifyCard: 'Expensify Card',
            companyCards: 'Firmenkarten',
            workflows: 'Workflows',
            workspace: 'Workspace',
            findWorkspace: 'Arbeitsbereich finden',
            edit: 'Workspace bearbeiten',
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
            reconcileCards: 'Kartenabgleich durchführen',
            selectAll: 'Alle auswählen',
            selected: () => ({
                one: '1 ausgewählt',
                other: (count: number) => `${count} ausgewählt`,
            }),
            settlementFrequency: 'Auszahlungsfrequenz',
            setAsDefault: 'Als Standard-Arbeitsbereich festlegen',
            defaultNote: `Belege, die an ${CONST.EMAIL.RECEIPTS} gesendet werden, erscheinen in diesem Workspace.`,
            deleteConfirmation: 'Sind Sie sicher, dass Sie diesen Workspace löschen möchten?',
            deleteWithCardsConfirmation: 'Möchtest du diesen Workspace wirklich löschen? Dadurch werden alle Kartenfeeds und zugewiesenen Karten entfernt.',
            unavailable: 'Arbeitsbereich nicht verfügbar',
            memberNotFound: 'Mitglied nicht gefunden. Um ein neues Mitglied in den Workspace einzuladen, verwende bitte oben die Einladen-Schaltfläche.',
            notAuthorized: `Du hast keinen Zugriff auf diese Seite. Wenn du versuchst, diesem Workspace beizutreten, bitte einfach den/die Workspace-Inhaber:in, dich als Mitglied hinzuzufügen. Etwas anderes? Wende dich an ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Zum Arbeitsbereich',
            duplicateWorkspace: 'Arbeitsbereich duplizieren',
            duplicateWorkspacePrefix: 'Duplizieren',
            goToWorkspaces: 'Zu Arbeitsbereichen',
            clearFilter: 'Filter löschen',
            workspaceName: 'Workspace-Name',
            workspaceOwner: 'Inhaber',
            workspaceType: 'Workspace-Typ',
            workspaceAvatar: 'Workspace-Avatar',
            mustBeOnlineToViewMembers: 'Sie müssen online sein, um die Mitglieder dieses Arbeitsbereichs sehen zu können.',
            moreFeatures: 'Mehr Funktionen',
            requested: 'Angefordert',
            distanceRates: 'Entfernungssätze',
            defaultDescription: 'Ein Ort für alle Ihre Belege und Ausgaben.',
            descriptionHint: 'Teile Informationen über diesen Workspace mit allen Mitgliedern.',
            welcomeNote: 'Bitte nutze Expensify, um deine Belege zur Erstattung einzureichen, danke!',
            subscription: 'Abonnement',
            markAsEntered: 'Als manuell eingegeben markieren',
            markAsExported: 'Als exportiert markieren',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Export nach ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
            lineItemLevel: 'Positionsebene',
            reportLevel: 'Berichtsebene',
            topLevel: 'Oberste Ebene',
            appliedOnExport: 'Nicht in Expensify importiert, beim Export angewendet',
            shareNote: {
                header: 'Gib deinen Workspace für andere Mitglieder frei',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Teile diesen QR-Code oder kopiere den Link unten, damit Mitglieder einfach Zugriff auf deinen Workspace anfordern können. Alle Anfragen zum Beitritt zum Workspace werden zur Überprüfung im Raum <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> angezeigt.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} verbinden`,
            createNewConnection: 'Neue Verbindung erstellen',
            reuseExistingConnection: 'Vorhandene Verbindung wiederverwenden',
            existingConnections: 'Bestehende Verbindungen',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Da du zuvor bereits eine Verbindung zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} hergestellt hast, kannst du entweder eine bestehende Verbindung wiederverwenden oder eine neue erstellen.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} – Zuletzt synchronisiert am ${formattedDate}`,
            authenticationError: (connectionName: string) => `Verbindung mit ${connectionName} aufgrund eines Authentifizierungsfehlers nicht möglich.`,
            learnMore: 'Mehr erfahren',
            memberAlternateText: 'Berichte einreichen und genehmigen.',
            adminAlternateText: 'Berichte und Arbeitsbereichseinstellungen verwalten.',
            auditorAlternateText: 'Berichte ansehen und kommentieren.',
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
                'Sie können Ihren Tarif bei einem abgerechneten Abonnement nicht herabstufen. Um Ihre Abonnementdetails zu besprechen oder zu ändern, wenden Sie sich bitte an Ihre*n Account Manager*in oder an Concierge.',
            defaultCategory: 'Standardkategorie',
            viewTransactions: 'Transaktionen anzeigen',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Spesen von ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card-Transaktionen werden automatisch in ein „Expensify Card Liability Account“ exportiert, das mit <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">unserer Integration</a> erstellt wurde.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Verbunden mit ${organizationName}` : 'Automatisiere Reise- und Essenslieferungskosten in deinem gesamten Unternehmen.',
                sendInvites: 'Einladungen senden',
                sendInvitesDescription: 'Diese Workspace-Mitglieder haben noch kein Uber for Business-Konto. Wähle alle Mitglieder ab, die du derzeit nicht einladen möchtest.',
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
            subtitle: `<muted-text>Legen Sie Pauschalen fest, um die täglichen Ausgaben von Mitarbeitenden zu steuern. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Mehr erfahren</a>.</muted-text>`,
            amount: 'Betrag',
            deleteRates: () => ({
                one: 'Tarif löschen',
                other: 'Sätze löschen',
            }),
            deletePerDiemRate: 'Tagessatz löschen',
            findPerDiemRate: 'Tagessatz finden',
            areYouSureDelete: () => ({
                one: 'Bist du sicher, dass du diesen Satz löschen möchtest?',
                other: 'Möchtest du diese Tarife wirklich löschen?',
            }),
            emptyList: {
                title: 'Tagespauschale',
                subtitle: 'Legen Sie Pauschalspesen fest, um tägliche Mitarbeiterausgaben zu steuern. Importieren Sie die Sätze aus einer Tabellenkalkulation, um zu beginnen.',
            },
            importPerDiemRates: 'Pauschalspesen importieren',
            editPerDiemRate: 'Tagespauschale bearbeiten',
            editPerDiemRates: 'Tagespauschalen bearbeiten',
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
            accountDescription: 'Wählen Sie aus, wo Journalbuchungen gebucht werden sollen.',
            accountsPayable: 'Verbindlichkeiten aus Lieferungen und Leistungen',
            accountsPayableDescription: 'Wählen Sie aus, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wähle aus, von wo Schecks gesendet werden.',
            creditCardAccount: 'Kreditkartenkonto',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwende dieses Datum beim Exportieren von Berichten in QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der jüngsten Ausgabe in dem Bericht.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach QuickBooks Desktop exportiert wurde.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Abgesendet am Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            exportCheckDescription: 'Wir erstellen für jeden Expensify-Bericht einen aufgeschlüsselten Scheck und senden ihn von dem untenstehenden Bankkonto.',
            exportJournalEntryDescription: 'Wir erstellen für jeden Expensify-Bericht einen aufgeschlüsselten Buchungssatz und buchen ihn auf das untenstehende Konto.',
            exportVendorBillDescription:
                'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung und fügen sie dem untenstehenden Konto hinzu. Ist dieser Zeitraum abgeschlossen, buchen wir auf den 1. Tag des nächsten offenen Zeitraums.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop unterstützt keine Steuern beim Export von Buchungsjournalen. Da in Ihrem Workspace Steuern aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Buchungsjournale sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wähle eine andere Exportoption.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Buchungssatz',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Prüfen',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Wir erstellen für jeden Expensify-Bericht einen aufgeschlüsselten Scheck und senden ihn von dem untenstehenden Bankkonto.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Kreditkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Falls keine Lieferanten vorhanden sind, erstellen wir zur Zuordnung einen „Credit Card Misc.“-Lieferanten.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Wir erstellen für jeden Expensify-Bericht eine Einzelposten-Lieferantenrechnung mit dem Datum der letzten Ausgabe und fügen sie dem unten stehenden Konto hinzu. Ist dieser Zeitraum geschlossen, buchen wir auf den 1. Tag der nächsten offenen Periode.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]:
                    'Wählen Sie aus, wohin die Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wähle einen Anbieter aus, der auf alle Kreditkartentransaktionen angewendet wird.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Wähle aus, von wo Schecks gesendet werden.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wähle eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wähle eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Buchungsjournale sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wähle eine andere Exportoption.',
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Füge das Konto in QuickBooks Desktop hinzu und synchronisiere die Verbindung erneut',
            qbdSetup: 'QuickBooks Desktop-Einrichtung',
            requiredSetupDevice: {
                title: 'Von diesem Gerät kann keine Verbindung hergestellt werden',
                body1: 'Sie müssen diese Verbindung von dem Computer aus einrichten, auf dem Ihre QuickBooks Desktop-Unternehmensdatei gespeichert ist.',
                body2: 'Sobald du verbunden bist, kannst du von überall synchronisieren und exportieren.',
            },
            setupPage: {
                title: 'Öffne diesen Link, um die Verbindung herzustellen',
                body: 'Um die Einrichtung abzuschließen, öffnen Sie den folgenden Link auf dem Computer, auf dem QuickBooks Desktop ausgeführt wird.',
                setupErrorTitle: 'Etwas ist schiefgelaufen',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>Die Verbindung zu QuickBooks Desktop funktioniert im Moment nicht. Bitte versuche es später erneut oder <a href="${conciergeLink}">kontaktiere Concierge</a>, wenn das Problem weiterhin besteht.</centered-text></muted-text>`,
            },
            importDescription: 'Wählen Sie aus, welche Codierungskonfigurationen aus QuickBooks Desktop nach Expensify importiert werden sollen.',
            classes: 'Klassen',
            items: 'Posten',
            customers: 'Kunden/Projekte',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Firmenkarteneinkäufe nach QuickBooks Desktop exportiert werden.',
            defaultVendorDescription: 'Legen Sie einen Standardlieferanten fest, der beim Export auf alle Kreditkartentransaktionen angewendet wird.',
            accountsDescription: 'Ihr QuickBooks Desktop-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern bei der Erstellung ihrer Ausgaben zur Auswahl.',
            classesDescription: 'Wähle aus, wie QuickBooks Desktop-Klassen in Expensify behandelt werden sollen.',
            tagsDisplayedAsDescription: 'Positionsebene',
            reportFieldsDisplayedAsDescription: 'Berichtsebene',
            customersDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Kunden/Projekte in Expensify gehandhabt werden sollen.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird sich jeden Tag automatisch mit QuickBooks Desktop synchronisieren.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription: 'Expensify erstellt automatisch Kreditoren in QuickBooks Desktop, wenn sie noch nicht vorhanden sind.',
            },
            itemsDescription: 'Wähle aus, wie QuickBooks Desktop-Posten in Expensify gehandhabt werden sollen.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach endgültiger Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen aus eigener Tasche werden beim Bezahlen exportiert',
                },
            },
        },
        qbo: {
            connectedTo: 'Verbunden mit',
            importDescription: 'Wähle aus, welche Kodierungskonfigurationen aus QuickBooks Online in Expensify importiert werden sollen.',
            classes: 'Klassen',
            locations: 'Standorte',
            customers: 'Kunden/Projekte',
            accountsDescription: 'Ihr QuickBooks Online-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern bei der Erstellung ihrer Ausgaben zur Auswahl.',
            classesDescription: 'Wähle, wie QuickBooks Online-Klassen in Expensify behandelt werden sollen.',
            customersDescription: 'Wählen Sie aus, wie QuickBooks Online-Kunden/Projekte in Expensify verarbeitet werden sollen.',
            locationsDescription: 'Wählen Sie aus, wie QuickBooks Online-Standorte in Expensify behandelt werden sollen.',
            taxesDescription: 'Wähle aus, wie QuickBooks Online-Steuern in Expensify gehandhabt werden sollen.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online unterstützt bei Schecks oder Lieferantenrechnungen keine Standorte auf Positionsebene. Wenn du Standorte auf Positionsebene verwenden möchtest, stelle sicher, dass du Buchungsbelege sowie Kredit-/Debitkartenausgaben nutzt.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online unterstützt keine Steuern in Journalbuchungen. Bitte ändern Sie Ihre Exportoption auf Lieferantenrechnung oder Scheck.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach QuickBooks Online exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Card-Transaktionen exportieren als',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwende dieses Datum beim Exportieren von Berichten nach QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der jüngsten Ausgabe in dem Bericht.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach QuickBooks Online exportiert wurde.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Abgesendet am Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            receivable: 'Debitoren', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archiv der Debitorenbuchhaltung', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Verwende dieses Konto beim Exportieren von Rechnungen nach QuickBooks Online.',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Firmenkartenkäufe nach QuickBooks Online exportiert werden.',
            vendor: 'Lieferant',
            defaultVendorDescription: 'Legen Sie einen Standardlieferanten fest, der beim Export auf alle Kreditkartentransaktionen angewendet wird.',
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie aus der eigenen Tasche bezahlte Ausgaben nach QuickBooks Online exportiert werden.',
            exportCheckDescription: 'Wir erstellen für jeden Expensify-Bericht einen aufgeschlüsselten Scheck und senden ihn von dem untenstehenden Bankkonto.',
            exportJournalEntryDescription: 'Wir erstellen für jeden Expensify-Bericht einen aufgeschlüsselten Buchungssatz und buchen ihn auf das untenstehende Konto.',
            exportVendorBillDescription:
                'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung und fügen sie dem untenstehenden Konto hinzu. Ist dieser Zeitraum abgeschlossen, buchen wir auf den 1. Tag des nächsten offenen Zeitraums.',
            account: 'Konto',
            accountDescription: 'Wählen Sie aus, wo Journalbuchungen gebucht werden sollen.',
            accountsPayable: 'Verbindlichkeiten aus Lieferungen und Leistungen',
            accountsPayableDescription: 'Wählen Sie aus, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wähle aus, von wo Schecks gesendet werden.',
            creditCardAccount: 'Kreditkartenkonto',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online unterstützt keine Standorte beim Export von Kreditorenrechnungen. Da in Ihrem Workspace Standorte aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online unterstützt keine Steuern beim Export von Buchungsjournalen. Da in Ihrem Arbeitsbereich Steuern aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Buchungsjournale sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wähle eine andere Exportoption.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird sich täglich automatisch mit QuickBooks Online synchronisieren.',
                inviteEmployees: 'Mitarbeitende einladen',
                inviteEmployeesDescription: 'QuickBooks Online-Mitarbeiterdatensätze importieren und Mitarbeitende in diesen Workspace einladen.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription:
                    'Expensify erstellt in QuickBooks Online automatisch Lieferanten, wenn sie noch nicht vorhanden sind, und erstellt Kund:innen automatisch beim Export von Rechnungen.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden QuickBooks-Online-Konto erstellt.',
                qboBillPaymentAccount: 'QuickBooks-Rechnungskonto',
                qboInvoiceCollectionAccount: 'QuickBooks-Forderungskonto für Rechnungen',
                accountSelectDescription: 'Wähle aus, von wo aus Rechnungen bezahlt werden sollen, und wir erstellen die Zahlung in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wähle, wohin Rechnungseinzahlungen eingehen sollen, und wir erstellen die Zahlung in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Debitkarte',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Buchungssatz',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Prüfen',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Debitkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Wenn keine Lieferanten vorhanden sind, erstellen wir einen Lieferanten „Debit Card Misc.“ für die Zuordnung.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Kreditkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Falls keine Lieferanten vorhanden sind, erstellen wir zur Zuordnung einen „Credit Card Misc.“-Lieferanten.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Wir erstellen für jeden Expensify-Bericht eine Einzelposten-Lieferantenrechnung mit dem Datum der letzten Ausgabe und fügen sie dem unten stehenden Konto hinzu. Ist dieser Zeitraum geschlossen, buchen wir auf den 1. Tag der nächsten offenen Periode.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Wählen Sie aus, wohin Debitkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wählen Sie aus, wohin die Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Wähle einen Anbieter aus, der auf alle Kreditkartentransaktionen angewendet wird.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wähle eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wähle eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Buchungsjournale sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wähle eine andere Exportoption.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Wähle ein gültiges Konto für den Export von Lieferantenrechnungen',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wähle ein gültiges Konto für den Journalexport aus',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Wählen Sie ein gültiges Konto für den Scheckexport aus',
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
                description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach endgültiger Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen aus eigener Tasche werden beim Bezahlen exportiert',
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
            importDescription: 'Wähle aus, welche Kontierungskonfigurationen aus Xero nach Expensify importiert werden sollen.',
            accountsDescription: 'Ihr Xero-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern bei der Erstellung ihrer Ausgaben zur Auswahl.',
            trackingCategories: 'Verfolgungskategorien',
            trackingCategoriesDescription: 'Wähle aus, wie Xero-Trackingkategorien in Expensify behandelt werden sollen.',
            mapTrackingCategoryTo: (categoryName: string) => `Xero-${categoryName} zuordnen zu`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Wählen Sie aus, wohin ${categoryName} beim Export nach Xero zugeordnet werden soll.`,
            customers: 'Kunden erneut abrechnen',
            customersDescription:
                'Wähle aus, ob Kund:innen in Expensify erneut abgerechnet werden sollen. Deine Xero-Kundenkontakte können Ausgaben zugeordnet werden und werden als Verkaufsrechnung nach Xero exportiert.',
            taxesDescription: 'Wähle, wie Xero-Steuern in Expensify behandelt werden sollen.',
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
                'Exportierte Ausgaben werden als Banktransaktionen auf das unten angegebene Xero-Bankkonto gebucht, und die Buchungsdaten entsprechen den Daten auf Ihrem Kontoauszug.',
            bankTransactions: 'Banktransaktionen',
            xeroBankAccount: 'Xero-Bankkonto',
            xeroBankAccountDescription: 'Wählen Sie aus, wo Ausgaben als Banktransaktionen verbucht werden.',
            exportExpensesDescription: 'Berichte werden als Einkaufsrechnung mit dem unten ausgewählten Datum und Status exportiert.',
            purchaseBillDate: 'Rechnungsdatum des Einkaufs',
            exportInvoices: 'Rechnungen exportieren als',
            salesInvoice: 'Rechnung',
            exportInvoicesDescription: 'Verkaufsrechnungen zeigen immer das Datum an, an dem die Rechnung gesendet wurde.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird automatisch jeden Tag mit Xero synchronisiert.',
                purchaseBillStatusTitle: 'Status der Eingangsrechnung',
                reimbursedReportsDescription: 'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im unten stehenden Xero-Konto erstellt.',
                xeroBillPaymentAccount: 'Xero-Rechnung-Zahlungskonto',
                xeroInvoiceCollectionAccount: 'Inkassokonto für Xero-Rechnungen',
                xeroBillPaymentAccountDescription: 'Wählen Sie aus, von wo aus Rechnungen bezahlt werden sollen, und wir erstellen die Zahlung in Xero.',
                invoiceAccountSelectorDescription: 'Wählen Sie aus, wohin Rechnungzahlungen eingehen sollen, und wir erstellen die Zahlung in Xero.',
            },
            exportDate: {
                label: 'Rechnungsdatum des Einkaufs',
                description: 'Verwende dieses Datum beim Exportieren von Berichten nach Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der jüngsten Ausgabe in dem Bericht.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach Xero exportiert wurde.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Abgesendet am Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status der Eingangsrechnung',
                description: 'Verwende diesen Status beim Exportieren von Einkaufsrechnungen nach Xero.',
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
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach endgültiger Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen aus eigener Tasche werden beim Bezahlen exportiert',
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
                        description: 'Datum der jüngsten Ausgabe in dem Bericht.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach Sage Intacct exportiert wurde.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Abgesendet am Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Legen Sie fest, wie aus eigener Tasche gezahlte Ausgaben nach Sage Intacct exportiert werden.',
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
            defaultVendor: 'Standardlieferant',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Legen Sie einen Standardanbieter fest, der auf ${isReimbursable ? '' : 'nicht-'}erstattungsfähige Ausgaben angewendet wird, für die in Sage Intacct kein passender Anbieter vorhanden ist.`,
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach Sage Intacct exportiert werden.',
            exportPreferredExporterNote:
                'Die bevorzugte exportierende Person kann beliebige:r Workspace-Admin sein, muss aber auch Domain-Admin sein, wenn du in den Domaineinstellungen unterschiedliche Exportkonten für einzelne Firmenkarten festlegst.',
            exportPreferredExporterSubNote: 'Sobald dies festgelegt ist, sieht die bevorzugte Exportperson in ihrem Konto die Berichte zum Export.',
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: `Bitte fügen Sie das Konto in Sage Intacct hinzu und synchronisieren Sie die Verbindung erneut`,
            autoSync: 'Automatische Synchronisierung',
            autoSyncDescription: 'Expensify wird automatisch jeden Tag mit Sage Intacct synchronisiert.',
            inviteEmployees: 'Mitarbeitende einladen',
            inviteEmployeesDescription:
                'Importieren Sie Sage Intacct-Mitarbeiterdatensätze und laden Sie Mitarbeitende in diesen Workspace ein. Ihr Genehmigungsworkflow ist standardmäßig auf Genehmigung durch die/den Vorgesetzte:n eingestellt und kann auf der Seite „Mitglieder“ weiter konfiguriert werden.',
            syncReimbursedReports: 'Erstattete Berichte synchronisieren',
            syncReimbursedReportsDescription: 'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnung im unten stehenden Sage-Intacct-Konto erstellt.',
            paymentAccount: 'Sage Intacct-Zahlungskonto',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach endgültiger Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen aus eigener Tasche werden beim Bezahlen exportiert',
                },
            },
        },
        netsuite: {
            subsidiary: 'Tochtergesellschaft',
            subsidiarySelectDescription: 'Wählen Sie die Tochtergesellschaft in NetSuite aus, aus der Sie Daten importieren möchten.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach NetSuite exportiert werden.',
            exportInvoices: 'Rechnungen exportieren nach',
            journalEntriesTaxPostingAccount: 'Steuerbuchungskonto für Buchungssätze',
            journalEntriesProvTaxPostingAccount: 'Buchungsjournal-Konto für die Verbuchung der Provinzsteuer',
            foreignCurrencyAmount: 'Betrag in Fremdwährung exportieren',
            exportToNextOpenPeriod: 'In die nächste offene Periode exportieren',
            nonReimbursableJournalPostingAccount: 'Nicht erstattungsfähiges Journalbuchungskonto',
            reimbursableJournalPostingAccount: 'Konto für erstattungsfähige Journalbuchungen',
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
                        label: 'Erstelle eins für mich',
                        description: 'Wir erstellen beim Export eine „Expensify-Rechnungsposition“ für dich (falls noch keine vorhanden ist).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Vorhandenes auswählen',
                        description: 'Wir verknüpfen Rechnungen aus Expensify mit dem unten ausgewählten Posten.',
                    },
                },
            },
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwende dieses Datum beim Export von Berichten nach NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der jüngsten Ausgabe in dem Bericht.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach NetSuite exportiert wurde.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Abgesendet am Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Spesenabrechnungen',
                        reimbursableDescription: 'Auslagen aus eigener Tasche werden als Spesenberichte nach NetSuite exportiert.',
                        nonReimbursableDescription: 'Ausgaben mit Firmenkarten werden als Spesenberichte nach NetSuite exportiert.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Lieferantenrechnungen',
                        reimbursableDescription: dedent(`
                            Auslagen aus eigener Tasche werden als Rechnungen exportiert, die an den unten angegebenen NetSuite-Lieferanten zahlbar sind.

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
                            Auslagen aus eigener Tasche werden als Buchungssätze in das unten angegebene NetSuite-Konto exportiert.

                            Wenn du für jede Karte einen bestimmten Lieferanten festlegen möchtest, gehe zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Firmenkartenausgaben werden als Buchungszeilen in das unten angegebene NetSuite-Konto exportiert.

                            Wenn du für jede Karte einen bestimmten Lieferanten festlegen möchtest, gehe zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Wenn du die Export-Einstellung für Firmenkarten auf Spesenabrechnungen umstellst, werden NetSuite-Lieferanten und Buchungskonten für einzelne Karten deaktiviert.\n\nKeine Sorge, wir speichern deine bisherigen Auswahlen, falls du später wieder zurückwechseln möchtest.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit NetSuite synchronisiert.',
                reimbursedReportsDescription: 'Immer wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden NetSuite-Konto erstellt.',
                reimbursementsAccount: 'Erstattungskonto',
                reimbursementsAccountDescription: 'Wählen Sie das Bankkonto aus, das Sie für Erstattungen verwenden möchten, und wir erstellen die zugehörige Zahlung in NetSuite.',
                collectionsAccount: 'Inkassokonto',
                collectionsAccountDescription: 'Sobald eine Rechnung in Expensify als bezahlt markiert und nach NetSuite exportiert wurde, erscheint sie auf dem untenstehenden Konto.',
                approvalAccount: 'Kreditorengenehmigungskonto',
                approvalAccountDescription:
                    'Wählen Sie das Konto, gegen das Transaktionen in NetSuite genehmigt werden. Wenn Sie erstattete Berichte synchronisieren, ist dies auch das Konto, gegen das Rechnungszahlungen erstellt werden.',
                defaultApprovalAccount: 'NetSuite-Standard',
                inviteEmployees: 'Mitarbeitende einladen und Genehmigungen festlegen',
                inviteEmployeesDescription:
                    'NetSuite-Mitarbeiterdatensätze importieren und Mitarbeitende in diesen Workspace einladen. Ihr Genehmigungsworkflow wird standardmäßig auf Genehmigung durch die/den Vorgesetzte:n gesetzt und kann auf der Seite *Mitglieder* weiter konfiguriert werden.',
                autoCreateEntities: 'Mitarbeitende/Lieferanten automatisch erstellen',
                enableCategories: 'Neu importierte Kategorien aktivieren',
                customFormID: 'Benutzerdefinierte Formular-ID',
                customFormIDDescription:
                    'Standardmäßig erstellt Expensify Buchungen mit dem in NetSuite festgelegten bevorzugten Transaktionsformular. Alternativ können Sie ein bestimmtes Transaktionsformular festlegen, das verwendet werden soll.',
                customFormIDReimbursable: 'Auslage',
                customFormIDNonReimbursable: 'Firmenkarten-Ausgabe',
                exportReportsTo: {
                    label: 'Genehmigungsstufe für Spesenabrechnungen',
                    description:
                        'Sobald ein Spesenbericht in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Buchung eine weitere Genehmigungsstufe festlegen.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Standardpräferenz für NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Nur mit Genehmigung der vorgesetzten Person',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Nur von Buchhaltung genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Vorgesetzte*r und Buchhaltung genehmigt',
                    },
                },
                accountingMethods: {
                    label: 'Wann exportieren',
                    description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach endgültiger Genehmigung exportiert',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen aus eigener Tasche werden beim Bezahlen exportiert',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Genehmigungsstufe für Lieferantenrechnungen',
                    description:
                        'Sobald eine Lieferantenrechnung in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Verbuchung eine zusätzliche Genehmigungsstufe festlegen.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Standardpräferenz für NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zur Buchung freigegeben',
                    },
                },
                exportJournalsTo: {
                    label: 'Genehmigungsstufe für Buchungssätze',
                    description:
                        'Sobald ein Buchungssatz in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Buchung eine zusätzliche Genehmigungsstufe festlegen.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Standardpräferenz für NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Zur Buchung freigegeben',
                    },
                },
                error: {
                    customFormID: 'Bitte gib eine gültige numerische benutzerdefinierte Formular-ID ein',
                },
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Bitte das Konto in NetSuite hinzufügen und die Verbindung erneut synchronisieren',
            noVendorsFound: 'Keine Lieferanten gefunden',
            noVendorsFoundDescription: 'Bitte fügen Sie Lieferanten in NetSuite hinzu und synchronisieren Sie die Verbindung erneut',
            noItemsFound: 'Keine Rechnungspositionen gefunden',
            noItemsFoundDescription: 'Bitte füge Rechnungsposten in NetSuite hinzu und synchronisiere die Verbindung erneut',
            noSubsidiariesFound: 'Keine Tochtergesellschaften gefunden',
            noSubsidiariesFoundDescription: 'Bitte fügen Sie eine Tochtergesellschaft in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            tokenInput: {
                title: 'NetSuite-Einrichtung',
                formSteps: {
                    installBundle: {
                        title: 'Installiere das Expensify-Bundle',
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
                            'Gehe in NetSuite zu *Setup > Users/Roles > Access Tokens* und erstelle ein Zugriffstoken für die App „Expensify“ und entweder die Rolle „Expensify Integration“ oder „Administrator“.\n\n*Wichtig:* Stelle sicher, dass du die *Token-ID* und das *Token Secret* aus diesem Schritt speicherst. Du benötigst sie für den nächsten Schritt.',
                    },
                    enterCredentials: {
                        title: 'Gib deine NetSuite-Zugangsdaten ein',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite-Konto-ID',
                            netSuiteTokenID: 'Token-ID',
                            netSuiteTokenSecret: 'Token-Geheimnis',
                        },
                        netSuiteAccountIDDescription: 'Gehe in NetSuite zu *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Ausgabenkategorien',
                expenseCategoriesDescription: 'Ihre NetSuite-Spesenkategorien werden als Kategorien in Expensify importiert.',
                crossSubsidiaryCustomers: 'Konzernübergreifende Kunden/Projekte',
                importFields: {
                    departments: {
                        title: 'Abteilungen',
                        subtitle: 'Wählen Sie aus, wie die NetSuite-*Abteilungen* in Expensify behandelt werden sollen.',
                    },
                    classes: {
                        title: 'Klassen',
                        subtitle: 'Wähle, wie *Klassen* in Expensify behandelt werden sollen.',
                    },
                    locations: {
                        title: 'Standorte',
                        subtitle: 'Wählen Sie aus, wie *Standorte* in Expensify gehandhabt werden sollen.',
                    },
                },
                customersOrJobs: {
                    title: 'Kunden/Projekte',
                    subtitle: 'Wähle aus, wie NetSuite-*Kunden* und *Projekte* in Expensify behandelt werden sollen.',
                    importCustomers: 'Kund:innen importieren',
                    importJobs: 'Projekte importieren',
                    customers: 'Kunden',
                    jobs: 'Projekte',
                    label: (importFields: string[], importType: string) => `${importFields.join('und')}, ${importType}`,
                },
                importTaxDescription: 'Steuergruppen aus NetSuite importieren.',
                importCustomFields: {
                    chooseOptionBelow: 'Wähle eine der folgenden Optionen aus:',
                    label: (importedTypes: string[]) => `Importiert als ${importedTypes.join('und')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Bitte ${fieldName} eingeben`,
                    customSegments: {
                        title: 'Benutzerdefinierte Segmente/Datensätze',
                        addText: 'Benutzerdefinierten Abschnitt/Eintrag hinzufügen',
                        recordTitle: 'Benutzerdefiniertes Segment/Datensatz',
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
                        removePrompt: 'Möchtest du dieses benutzerdefinierte Segment/den benutzerdefinierten Eintrag wirklich entfernen?',
                        addForm: {
                            customSegmentName: 'Benutzerdefinierter Segmentname',
                            customRecordName: 'benutzerdefinierter Datensatzname',
                            segmentTitle: 'Benutzerdefinierter Abschnitt',
                            customSegmentAddTitle: 'Benutzerdefinierten Abschnitt hinzufügen',
                            customRecordAddTitle: 'Benutzerdefinierten Eintrag hinzufügen',
                            recordTitle: 'Benutzerdefinierter Datensatz',
                            segmentRecordType: 'Möchtest du ein benutzerdefiniertes Segment oder einen benutzerdefinierten Datensatz hinzufügen?',
                            customSegmentNameTitle: 'Wie lautet der Name des benutzerdefinierten Segments?',
                            customRecordNameTitle: 'Wie lautet der Name des benutzerdefinierten Datensatzes?',
                            customSegmentNameFooter: `Benutzerdefinierte Segmentnamen finden Sie in NetSuite auf der Seite *Customizations > Links, Records & Fields > Custom Segments*.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfe-Seite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})._`,
                            customRecordNameFooter: `Sie finden benutzerdefinierte Datensatznamen in NetSuite, indem Sie „Transaction Column Field“ in die globale Suche eingeben.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfe-Seite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})._`,
                            customSegmentInternalIDTitle: 'Wie lautet die interne ID?',
                            customSegmentInternalIDFooter: `Stelle zuerst sicher, dass du in NetSuite interne IDs aktiviert hast unter *Home > Set Preferences > Show Internal ID.*

Die internen IDs von benutzerdefinierten Segmenten findest du in NetSuite unter:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klicke auf ein benutzerdefiniertes Segment.
3. Klicke auf den Hyperlink neben *Custom Record Type*.
4. Suche die interne ID in der Tabelle unten.

_Für eine ausführlichere Anleitung, [besuche unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Sie können interne IDs benutzerdefinierter Datensätze in NetSuite wie folgt finden:

1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.
2. Klicken Sie auf einen benutzerdefinierten Datensatz.
3. Suchen Sie die interne ID auf der linken Seite.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Wie lautet die Skript-ID?',
                            customSegmentScriptIDFooter: `Benutzerdefinierte Segmentskript-IDs finden Sie in NetSuite unter:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klicken Sie auf ein benutzerdefiniertes Segment.
3. Klicken Sie unten auf die Registerkarte *Application and Sourcing* und dann:
    a. Wenn Sie das benutzerdefinierte Segment als *Tag* (auf Positionsebene) in Expensify anzeigen möchten, klicken Sie auf die Unterregisterkarte *Transaction Columns* und verwenden Sie die *Field ID*.
    b. Wenn Sie das benutzerdefinierte Segment als *Berichts­feld* (auf Berichtsebene) in Expensify anzeigen möchten, klicken Sie auf die Unterregisterkarte *Transactions* und verwenden Sie die *Field ID*.

_Für ausführlichere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Wie lautet die Transaktionsspalten-ID?',
                            customRecordScriptIDFooter: `Benutzerdefinierte Datensatz-Skript-IDs findest du in NetSuite unter:

1. Gib „Transaction Line Fields“ in die globale Suche ein.
2. Klicke auf einen benutzerdefinierten Datensatz.
3. Finde die Skript-ID auf der linken Seite.

_Für eine detailliertere Anleitung, [besuche unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Wie soll dieses benutzerdefinierte Segment in Expensify angezeigt werden?',
                            customRecordMappingTitle: 'Wie soll dieser benutzerdefinierte Eintrag in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Ein benutzerdefiniertes Segment/Datensatz mit dieser ${fieldName?.toLowerCase()} ist bereits vorhanden`,
                        },
                    },
                    customLists: {
                        title: 'Benutzerdefinierte Listen',
                        addText: 'Benutzerdefinierte Liste hinzufügen',
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
                        removePrompt: 'Sind Sie sicher, dass Sie diese benutzerdefinierte Liste entfernen möchten?',
                        addForm: {
                            listNameTitle: 'Wähle eine benutzerdefinierte Liste aus',
                            transactionFieldIDTitle: 'Wie lautet die Transaktionsfeld-ID?',
                            transactionFieldIDFooter: `Sie finden Transaktionsfeld-IDs in NetSuite, indem Sie wie folgt vorgehen:

1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.
2. Klicken Sie auf eine benutzerdefinierte Liste.
3. Suchen Sie die Transaktionsfeld-ID auf der linken Seite.

_Für ausführlichere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})._`,
                            mappingTitle: 'Wie soll diese benutzerdefinierte Liste in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Es existiert bereits eine benutzerdefinierte Liste mit dieser Transaktionsfeld-ID`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Standard-NetSuite-Mitarbeiter',
                        description: 'Nicht in Expensify importiert, beim Export angewendet',
                        footerContent: (importField: string) =>
                            `Wenn Sie ${importField} in NetSuite verwenden, wenden wir den Standardwert an, der im Mitarbeitendendatensatz festgelegt ist, sobald nach „Expense Report“ oder „Journal Entry“ exportiert wird.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'Positionsebene',
                        footerContent: (importField: string) => `${startCase(importField)} wird für jede einzelne Ausgabe im Bericht eines Mitarbeitenden auswählbar sein.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Berichtsfelder',
                        description: 'Berichtsebene',
                        footerContent: (importField: string) => `Die Auswahl ${startCase(importField)} wird auf alle Ausgaben im Bericht der Mitarbeitenden angewendet.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct-Einrichtung',
            prerequisitesTitle: 'Bevor du dich verbindest …',
            downloadExpensifyPackage: 'Lade das Expensify-Paket für Sage Intacct herunter',
            followSteps: 'Befolge die Schritte in unserer Anleitung: So verbindest du dich mit Sage Intacct',
            enterCredentials: 'Gib deine Sage Intacct-Zugangsdaten ein',
            entity: 'Unternehmen',
            employeeDefault: 'Sage Intacct-Standardwert für Mitarbeitende',
            employeeDefaultDescription: 'Die Standardabteilung der beschäftigten Person wird, falls vorhanden, in Sage Intacct auf ihre Ausgaben angewendet.',
            displayedAsTagDescription: 'Die Abteilung kann für jede einzelne Ausgabe in einem Mitarbeitendenbericht ausgewählt werden.',
            displayedAsReportFieldDescription: 'Die Abteilungsauswahl wird auf alle Ausgaben im Bericht einer beschäftigten Person angewendet.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Wähle aus, wie Sage Intacct-<strong>${mappingTitle}</strong> in Expensify behandelt werden soll.`,
            expenseTypes: 'Spesenarten',
            expenseTypesDescription: 'Ihre Sage Intacct-Ausgabentypen werden in Expensify als Kategorien importiert.',
            accountTypesDescription: 'Ihr Sage Intacct-Kontenplan wird als Kategorien in Expensify importiert.',
            importTaxDescription: 'Kaufsteuersatz aus Sage Intacct importieren.',
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
            collect: 'Einsammeln',
        },
        companyCards: {
            addCards: 'Karten hinzufügen',
            selectCards: 'Karten auswählen',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'Kartendaten konnten nicht geladen werden',
                workspaceFeedsCouldNotBeLoadedMessage: 'Beim Laden der Workspace-Kartenfeeds ist ein Fehler aufgetreten. Bitte versuche es erneut oder kontaktiere deine Administration.',
                feedCouldNotBeLoadedTitle: 'Dieser Feed konnte nicht geladen werden',
                feedCouldNotBeLoadedMessage: 'Beim Laden dieses Feeds ist ein Fehler aufgetreten. Bitte versuche es erneut oder kontaktiere deine Verwaltungsperson.',
                tryAgain: 'Versuch es noch einmal',
            },
            addNewCard: {
                other: 'Sonstiges',
                cardProviders: {
                    gl1025: 'American Express Firmenkarten',
                    cdf: 'Mastercard Firmenkarten',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Stripe-Karten',
                },
                yourCardProvider: `Wer ist dein Kartenanbieter?`,
                whoIsYourBankAccount: 'Wie heißt deine Bank?',
                whereIsYourBankLocated: 'Wo befindet sich Ihre Bank?',
                howDoYouWantToConnect: 'Wie möchtest du dich mit deiner Bank verbinden?',
                learnMoreAboutOptions: `<muted-text>Erfahren Sie mehr über diese <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">Optionen</a>.</muted-text>`,
                commercialFeedDetails:
                    'Erfordert die Einrichtung mit Ihrer Bank. Dies wird in der Regel von größeren Unternehmen verwendet und ist oft die beste Option, sofern Sie dafür in Frage kommen.',
                commercialFeedPlaidDetails: `Erfordert eine Einrichtung mit Ihrer Bank, aber wir führen Sie durch den Prozess. Dies ist in der Regel auf größere Unternehmen beschränkt.`,
                directFeedDetails: 'Der einfachste Ansatz. Verbinde dich direkt mit deinen Hauptzugangsdaten. Diese Methode ist am gebräuchlichsten.',
                enableFeed: {
                    title: (provider: string) => `Aktiviere deinen ${provider}-Feed`,
                    heading:
                        'Wir haben eine direkte Integration mit Ihrem Kartenaussteller und können Ihre Transaktionsdaten schnell und zuverlässig in Expensify importieren.\n\nUm loszulegen, gehen Sie einfach wie folgt vor:',
                    visa: 'Wir verfügen über globale Integrationen mit Visa, allerdings variiert die Verfügbarkeit je nach Bank und Kartenprogramm.\n\nUm loszulegen, gehen Sie einfach wie folgt vor:',
                    mastercard:
                        'Wir bieten globale Integrationen mit Mastercard an, allerdings variiert die Berechtigung je nach Bank und Kartenprogramm.\n\nUm loszulegen, musst du nur Folgendes tun:',
                    vcf: `1. Lies dir [diesen Hilfeartikel](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) durch, um detaillierte Anweisungen zum Einrichten deiner Visa Commercial Cards zu erhalten.

2. [Kontaktiere deine Bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), um zu bestätigen, dass sie einen Commercial-Feed für dein Programm unterstützt, und bitte sie, diesen zu aktivieren.

3. *Sobald der Feed aktiviert ist und du seine Details hast, fahre mit dem nächsten Bildschirm fort.*`,
                    gl1025: `1. Lies dir [diesen Hilfeartikel](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) durch, um herauszufinden, ob American Express für dein Programm einen Commercial-Feed aktivieren kann.

2. Sobald der Feed aktiviert ist, sendet Amex dir ein Produktionsschreiben.

3. *Sobald du die Feed-Informationen hast, fahre mit dem nächsten Bildschirm fort.*`,
                    cdf: `1. Lies dir [diesen Hilfeartikel](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) durch, um detaillierte Anweisungen zum Einrichten deiner Mastercard Commercial Cards zu erhalten.

2. [Kontaktiere deine Bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), um zu prüfen, ob sie einen Commercial-Feed für dein Programm unterstützt, und bitte sie, diesen zu aktivieren.

3. *Sobald der Feed aktiviert ist und du die Details dazu hast, fahre mit dem nächsten Bildschirm fort.*`,
                    stripe: `1. Öffnen Sie das Stripe-Dashboard und gehen Sie zu [Einstellungen](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Klicken Sie unter „Produktintegrationen“ auf „Aktivieren“ neben Expensify.

3. Sobald der Feed aktiviert ist, klicken Sie unten auf „Senden“ und wir kümmern uns um das Hinzufügen.`,
                },
                whatBankIssuesCard: 'Welche Bank gibt diese Karten aus?',
                enterNameOfBank: 'Name der Bank eingeben',
                feedDetails: {
                    vcf: {
                        title: 'Was sind die Details des Visa-Feeds?',
                        processorLabel: 'Prozessor-ID',
                        bankLabel: 'ID des Finanzinstituts (Bank)',
                        companyLabel: 'Unternehmens-ID',
                        helpLabel: 'Wo finde ich diese IDs?',
                    },
                    gl1025: {
                        title: `Wie lautet der Name der Amex-Übermittlungsdatei?`,
                        fileNameLabel: 'Name der Lieferdatei',
                        helpLabel: 'Wo finde ich den Namen der Lieferdatei?',
                    },
                    cdf: {
                        title: `Wie lautet die Mastercard-Vertriebs-ID?`,
                        distributionLabel: 'Verteilungs-ID',
                        helpLabel: 'Wo finde ich die Verteilungs-ID?',
                    },
                },
                amexCorporate: 'Wählen Sie dies aus, wenn auf der Vorderseite Ihrer Karten „Corporate“ steht',
                amexBusiness: 'Wählen Sie diese Option, wenn auf der Vorderseite Ihrer Karten „Business“ steht',
                amexPersonal: 'Wählen Sie dies aus, wenn Ihre Karten privat sind',
                error: {
                    pleaseSelectProvider: 'Bitte wählen Sie einen Kartenanbieter aus, bevor Sie fortfahren',
                    pleaseSelectBankAccount: 'Bitte wähle vor dem Fortfahren ein Bankkonto aus',
                    pleaseSelectBank: 'Bitte wähle eine Bank aus, bevor du fortfährst',
                    pleaseSelectCountry: 'Bitte wählen Sie ein Land aus, bevor Sie fortfahren',
                    pleaseSelectFeedType: 'Bitte wähle einen Feed-Typ aus, bevor du fortfährst',
                },
                exitModal: {
                    title: 'Funktioniert etwas nicht?',
                    prompt: 'Wir haben bemerkt, dass du das Hinzufügen deiner Karten nicht abgeschlossen hast. Wenn du auf ein Problem gestoßen bist, sag uns bitte Bescheid, damit wir dir helfen können, alles wieder in Ordnung zu bringen.',
                    confirmText: 'Problem melden',
                    cancelText: 'Überspringen',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Letzter Tag des Monats',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Letzter Geschäftstag des Monats',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Benutzerdefinierter Tag im Monat',
            },
            assign: 'Zuweisen',
            assignCard: 'Karte zuweisen',
            findCard: 'Karte finden',
            cardNumber: 'Kartennummer',
            commercialFeed: 'Kommerzieller Feed',
            feedName: (feedName: string) => `${feedName}-Karten`,
            directFeed: 'Direktzufuhr',
            whoNeedsCardAssigned: 'Wer braucht eine zugewiesene Karte?',
            chooseTheCardholder: 'Wähle die Karteninhaber·in',
            chooseCard: 'Wähle eine Karte',
            chooseCardFor: (assignee: string) =>
                `Wähle eine Karte für <strong>${assignee}</strong>. Du findest die gesuchte Karte nicht? <concierge-link>Lass es uns wissen.</concierge-link>`,
            noActiveCards: 'Keine aktiven Karten in diesem Feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Oder es ist etwas kaputt. So oder so, wenn du Fragen hast, <concierge-link>kontaktiere einfach Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Wähle ein Startdatum für Transaktionen',
            startDateDescription: 'Wähle dein Import-Startdatum. Wir synchronisieren alle Transaktionen ab diesem Datum.',
            editStartDateDescription:
                'Wähle ein neues Startdatum für Transaktionen. Wir synchronisieren alle Transaktionen ab diesem Datum, ausgenommen diejenigen, die wir bereits importiert haben.',
            fromTheBeginning: 'Von Anfang an',
            customStartDate: 'Benutzerdefiniertes Startdatum',
            customCloseDate: 'Benutzerdefiniertes Abschlussdatum',
            letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
            confirmationDescription: 'Wir beginnen sofort mit dem Import der Transaktionen.',
            card: 'Karte',
            cardName: 'Kartenname',
            brokenConnectionError:
                '<rbr>Die Kartenfeed-Verbindung ist unterbrochen. Bitte <a href="#">melden Sie sich bei Ihrer Bank an</a>, damit wir die Verbindung erneut herstellen können.</rbr>',
            assignedCard: (assignee: string, link: string) => `${assignee} eine/n ${link} zugewiesen! Importierte Transaktionen werden in diesem Chat angezeigt.`,
            companyCard: 'Firmenkarte',
            chooseCardFeed: 'Kartenfeed auswählen',
            ukRegulation:
                'Expensify Limited ist ein Vertreter von Plaid Financial Ltd., einem zugelassenen Zahlungsinstitut, das von der Financial Conduct Authority gemäß den Payment Services Regulations 2017 reguliert wird (Firmenreferenznummer: 804718). Plaid stellt Ihnen regulierte Kontoinformationsdienste über Expensify Limited als seinen Vertreter zur Verfügung.',
            assignCardFailedError: 'Kartenzuordnung fehlgeschlagen.',
            unassignCardFailedError: 'Kartenzuordnung konnte nicht aufgehoben werden.',
            cardAlreadyAssignedError: 'Diese Karte ist bereits einem:r Nutzer:in in einem anderen Workspace zugewiesen.',
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
            getStartedIssuing: 'Beginne, indem du deine erste virtuelle oder physische Karte ausstellst.',
            verificationInProgress: 'Überprüfung läuft ...',
            verifyingTheDetails: 'Wir überprüfen ein paar Details. Concierge informiert dich, sobald Expensify Cards ausgegeben werden können.',
            disclaimer:
                'Die Expensify Visa® Commercial Card wird von The Bancorp Bank, N.A., Mitglied der FDIC, gemäß einer Lizenz von Visa U.S.A. Inc. herausgegeben und kann nicht bei allen Händlern verwendet werden, die Visa-Karten akzeptieren. Apple® und das Apple-Logo® sind Marken von Apple Inc., eingetragen in den USA und anderen Ländern. App Store ist eine Dienstleistungsmarke von Apple Inc. Google Play und das Google Play-Logo sind Marken von Google LLC.',
            euUkDisclaimer:
                'Für im EWR ansässige Personen ausgegebene Karten werden von Transact Payments Malta Limited ausgegeben, und für im Vereinigten Königreich ansässige Personen ausgegebene Karten werden von Transact Payments Limited gemäß einer Lizenz von Visa Europe Limited ausgegeben. Transact Payments Malta Limited ist ordnungsgemäß als Finanzinstitut gemäß dem Financial Institution Act 1994 von der Malta Financial Services Authority zugelassen und reguliert. Registrierungsnummer C 91879. Transact Payments Limited ist von der Gibraltar Financial Service Commission zugelassen und reguliert.',
            issueCard: 'Karte ausstellen',
            findCard: 'Karte finden',
            newCard: 'Neue Karte',
            name: 'Name',
            lastFour: 'Letzte 4',
            limit: 'Limit',
            currentBalance: 'Aktueller Kontostand',
            currentBalanceDescription: 'Der aktuelle Saldo ist die Summe aller verbuchten Expensify-Card-Transaktionen, die seit dem letzten Abrechnungsdatum stattgefunden haben.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Der Saldo wird am ${settlementDate} ausgeglichen`,
            settleBalance: 'Saldo ausgleichen',
            cardLimit: 'Kartenlimit',
            remainingLimit: 'Verbleibendes Limit',
            requestLimitIncrease: 'Erhöhung des Anfragelimits',
            remainingLimitDescription:
                'Wir berücksichtigen mehrere Faktoren, wenn wir Ihr verbleibendes Limit berechnen: Ihre Dauer als Kund*in, die geschäftsbezogenen Informationen, die Sie bei der Registrierung angegeben haben, sowie das verfügbare Guthaben auf Ihrem Geschäftskonto. Ihr verbleibendes Limit kann sich täglich ändern.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Der Cashback-Saldo basiert auf den abgerechneten monatlichen Ausgaben mit der Expensify Card in deinem Workspace.',
            issueNewCard: 'Neue Karte ausstellen',
            finishSetup: 'Einrichtung abschließen',
            chooseBankAccount: 'Bankkonto auswählen',
            chooseExistingBank: 'Wähle ein vorhandenes Geschäftskonto, um dein Expensify Card‑Guthaben zu bezahlen, oder füge ein neues Bankkonto hinzu',
            accountEndingIn: 'Konto endet auf',
            addNewBankAccount: 'Neues Bankkonto hinzufügen',
            settlementAccount: 'Verrechnungskonto',
            settlementAccountDescription: 'Wähle ein Konto aus, um den Saldo deiner Expensify Card zu bezahlen.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Stelle sicher, dass dieses Konto mit deinem <a href="${reconciliationAccountSettingsLink}">Abstimmungskonto</a> (${accountNumber}) übereinstimmt, damit die kontinuierliche Abstimmung ordnungsgemäß funktioniert.`,
            settlementFrequency: 'Auszahlungsfrequenz',
            settlementFrequencyDescription: 'Wähle aus, wie oft du deinen Expensify-Card-Saldo bezahlen möchtest.',
            settlementFrequencyInfo:
                'Wenn du zur monatlichen Abrechnung wechseln möchtest, musst du dein Bankkonto über Plaid verbinden und über eine positive Kontohistorie der letzten 90 Tage verfügen.',
            frequency: {
                daily: 'Täglich',
                monthly: 'Monatlich',
            },
            cardDetails: 'Kartendaten',
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
                `Wenn du den Limittyp dieser Karte auf Monatlich änderst, werden neue Transaktionen abgelehnt, da das monatliche Limit von ${limit} bereits erreicht wurde.`,
            addShippingDetails: 'Versanddetails hinzufügen',
            issuedCard: (assignee: string) => `hat ${assignee} eine Expensify Card ausgestellt! Die Karte kommt in 2–3 Werktagen an.`,
            issuedCardNoShippingDetails: (assignee: string) => `hat ${assignee} eine Expensify Card ausgestellt! Die Karte wird versendet, sobald die Versanddetails bestätigt sind.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `hat ${assignee} eine virtuelle Expensify Card ausgestellt! Die ${link} kann sofort verwendet werden.`,
            addedShippingDetails: (assignee: string) => `${assignee} hat Versanddetails hinzugefügt. Die Expensify Card kommt in 2–3 Werktagen an.`,
            replacedCard: (assignee: string) => `${assignee} hat ihre Expensify Card ersetzt. Die neue Karte wird in 2–3 Werktagen ankommen.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} hat ihre virtuelle Expensify Card ersetzt! Die ${link} kann sofort verwendet werden.`,
            card: 'Karte',
            replacementCard: 'Ersatzkarte',
            verifyingHeader: 'Wird überprüft',
            bankAccountVerifiedHeader: 'Bankkonto verifiziert',
            verifyingBankAccount: 'Bankkonto wird verifiziert …',
            verifyingBankAccountDescription: 'Bitte warten, während wir bestätigen, dass dieses Konto zur Ausstellung von Expensify-Karten verwendet werden kann.',
            bankAccountVerified: 'Bankkonto verifiziert!',
            bankAccountVerifiedDescription: 'Sie können jetzt Expensify Cards an Ihre Workspace-Mitglieder ausgeben.',
            oneMoreStep: 'Noch ein Schritt …',
            oneMoreStepDescription: 'Sieht so aus, als müssten wir Ihr Bankkonto manuell verifizieren. Bitte gehen Sie zu Concierge, dort warten bereits Ihre Anweisungen auf Sie.',
            gotIt: 'Verstanden',
            goToConcierge: 'Gehe zu Concierge',
        },
        categories: {
            deleteCategories: 'Kategorien löschen',
            deleteCategoriesPrompt: 'Möchtest du diese Kategorien wirklich löschen?',
            deleteCategory: 'Kategorie löschen',
            deleteCategoryPrompt: 'Sind Sie sicher, dass Sie diese Kategorie löschen möchten?',
            disableCategories: 'Kategorien deaktivieren',
            disableCategory: 'Kategorie deaktivieren',
            enableCategories: 'Kategorien aktivieren',
            enableCategory: 'Kategorie aktivieren',
            defaultSpendCategories: 'Standard-Ausgabenkategorien',
            spendCategoriesDescription: 'Lege fest, wie Händlera usgaben für Kreditkartentransaktionen und gescannte Belege kategorisiert werden.',
            deleteFailureMessage: 'Beim Löschen der Kategorie ist ein Fehler aufgetreten, bitte versuche es erneut',
            categoryName: 'Kategoriename',
            requiresCategory: 'Mitglieder müssen alle Ausgaben kategorisieren',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Alle Ausgaben müssen kategorisiert werden, um nach ${connectionName} exportieren zu können.`,
            subtitle: 'Verschaffe dir einen besseren Überblick darüber, wofür Geld ausgegeben wird. Nutze unsere Standardkategorien oder füge eigene hinzu.',
            emptyCategories: {
                title: 'Sie haben noch keine Kategorien erstellt',
                subtitle: 'Füge eine Kategorie hinzu, um deine Ausgaben zu organisieren.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Ihre Kategorien werden derzeit über eine Buchhaltungsanbindung importiert. Gehen Sie zu <a href="${accountingPageURL}">Buchhaltung</a>, um Änderungen vorzunehmen.</centered-text></muted-text>`,
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
            importedFromAccountingSoftware: 'Die untenstehenden Kategorien werden importiert aus Ihrem',
            payrollCode: 'Lohnabrechnungscode',
            updatePayrollCodeFailureMessage: 'Beim Aktualisieren des Lohnabrechnungscodes ist ein Fehler aufgetreten, bitte versuche es erneut.',
            glCode: 'Sachkonto-Code',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des Hauptbuchcodes ist ein Fehler aufgetreten, bitte versuche es erneut.',
            importCategories: 'Kategorien importieren',
            cannotDeleteOrDisableAllCategories: {
                title: 'Es können nicht alle Kategorien gelöscht oder deaktiviert werden',
                description: `Mindestens eine Kategorie muss aktiviert bleiben, da dein Arbeitsbereich Kategorien erfordert.`,
            },
        },
        moreFeatures: {
            subtitle: 'Nutze die Schalter unten, um beim Wachstum weitere Funktionen zu aktivieren. Jede Funktion erscheint dann im Navigationsmenü zur weiteren Anpassung.',
            spendSection: {
                title: 'Ausgaben',
                subtitle: 'Aktiviere Funktionen, die dir beim Skalieren deines Teams helfen.',
            },
            manageSection: {
                title: 'Verwalten',
                subtitle: 'Fügen Sie Steuerelemente hinzu, die helfen, Ausgaben im Budget zu halten.',
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
                subtitle: 'Tarife hinzufügen, aktualisieren und durchsetzen.',
            },
            perDiem: {
                title: 'Tagespauschale',
                subtitle: 'Legen Sie Pauschalen fest, um die täglichen Ausgaben der Mitarbeitenden zu steuern.',
            },
            travel: {
                title: 'Reisen',
                subtitle: 'Buche, verwalte und gleiche deine gesamte Geschäftsreise ab.',
                getStarted: {
                    title: 'Starte mit Expensify Travel',
                    subtitle: 'Wir brauchen nur noch ein paar weitere Informationen zu deinem Unternehmen, dann bist du startklar.',
                    ctaText: "Los geht's",
                },
                reviewingRequest: {
                    title: 'Koffer gepackt, wir haben deine Anfrage erhalten …',
                    subtitle: 'Wir überprüfen derzeit Ihre Anfrage zur Aktivierung von Expensify Travel. Keine Sorge, wir informieren Sie, sobald alles bereit ist.',
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
                        subtitle: 'Glückwunsch! Du kannst in diesem Workspace jetzt Reisen buchen und verwalten.',
                        manageTravelLabel: 'Reisen verwalten',
                    },
                    centralInvoicingSection: {
                        title: 'Zentrale Rechnungsstellung',
                        subtitle: 'Zentralisiere alle Reisekosten in einer monatlichen Rechnung, anstatt sie zum Zeitpunkt des Kaufs zu bezahlen.',
                        learnHow: 'So geht’s.',
                        subsections: {
                            currentTravelSpendLabel: 'Aktuelle Reisekosten',
                            currentTravelSpendCta: 'Saldo bezahlen',
                            currentTravelLimitLabel: 'Aktuelles Reisekontingent',
                            settlementAccountLabel: 'Verrechnungskonto',
                            settlementFrequencyLabel: 'Auszahlungsfrequenz',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Erhalten Sie Einblicke und Kontrolle über Ausgaben.',
                disableCardTitle: 'Expensify-Karte deaktivieren',
                disableCardPrompt: 'Du kannst die Expensify Card nicht deaktivieren, weil sie bereits verwendet wird. Wende dich an Concierge, um die nächsten Schritte zu erfahren.',
                disableCardButton: 'Mit Concierge chatten',
                feed: {
                    title: 'Hol dir die Expensify Card',
                    subTitle: 'Optimieren Sie Ihre Geschäftsausgaben und sparen Sie bis zu 50 % auf Ihrer Expensify-Rechnung, plus:',
                    features: {
                        cashBack: 'Cashback auf jeden Einkauf in den USA',
                        unlimited: 'Unbegrenzte virtuelle Karten',
                        spend: 'Ausgabenkontrollen und individuelle Limits',
                    },
                    ctaTitle: 'Neue Karte ausstellen',
                },
            },
            companyCards: {
                title: 'Firmenkarten',
                subtitle: 'Verknüpfe die Karten, die du bereits hast.',
                feed: {
                    title: 'Eigene Karten verwenden (BYOC)',
                    subtitle: 'Verknüpfe deine vorhandenen Karten, um Transaktionen automatisch zu importieren, Belege abzugleichen und die Abstimmung durchzuführen.',
                    features: {
                        support: 'Karten von über 10.000 Banken verknüpfen',
                        assignCards: 'Verknüpfe die vorhandenen Karten deines Teams',
                        automaticImport: 'Wir rufen die Transaktionen automatisch ab',
                    },
                },
                bankConnectionError: 'Problem mit Bankverbindung',
                connectWithPlaid: 'über Plaid verbinden',
                connectWithExpensifyCard: 'probiere die Expensify Card aus.',
                bankConnectionDescription: `Bitte versuche, deine Karten erneut hinzuzufügen. Andernfalls kannst du`,
                disableCardTitle: 'Firmenkarten deaktivieren',
                disableCardPrompt: 'Du kannst Firmenkarten nicht deaktivieren, da diese Funktion verwendet wird. Wende dich an den Concierge, um die nächsten Schritte zu erfahren.',
                disableCardButton: 'Mit Concierge chatten',
                cardDetails: 'Kartendaten',
                cardNumber: 'Kartennummer',
                cardholder: 'Karteninhaber',
                cardName: 'Kartenname',
                allCards: 'Alle Karten',
                assignedCards: 'Zugewiesen',
                unassignedCards: 'Nicht zugewiesen',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()}-Export` : `${integration}-Export`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Wähle das ${integration}-Konto aus, in das Transaktionen exportiert werden sollen.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Wähle das ${integration}-Konto, in das die Transaktionen exportiert werden sollen. Wähle eine andere <a href="${exportPageLink}">Exportoption</a>, um die verfügbaren Konten zu ändern.`,
                lastUpdated: 'Zuletzt aktualisiert',
                transactionStartDate: 'Transaktionsstartdatum',
                updateCard: 'Karte aktualisieren',
                unassignCard: 'Karte zuweisen entfernen',
                unassign: 'Zuweisung aufheben',
                unassignCardDescription: 'Das Aufheben der Zuweisung dieser Karte entfernt alle Transaktionen in Entwürfen von Berichten aus dem Konto der Karteninhaber*in.',
                assignCard: 'Karte zuweisen',
                cardFeedName: 'Name des Kartenfeeds',
                cardFeedNameDescription: 'Gib dem Kartenfeed einen eindeutigen Namen, damit du ihn von den anderen unterscheiden kannst.',
                cardFeedTransaction: 'Transaktionen löschen',
                cardFeedTransactionDescription: 'Wählen Sie aus, ob Karteninhaber Kartentransaktionen löschen können. Neue Transaktionen folgen diesen Regeln.',
                cardFeedRestrictDeletingTransaction: 'Löschen von Transaktionen einschränken',
                cardFeedAllowDeletingTransaction: 'Löschen von Transaktionen erlauben',
                removeCardFeed: 'Kartenfeed entfernen',
                removeCardFeedTitle: (feedName: string) => `Feed ${feedName} entfernen`,
                removeCardFeedDescription: 'Möchtest du diesen Kartenfeed wirklich entfernen? Dadurch werden alle Karten zugewiesen.',
                error: {
                    feedNameRequired: 'Name des Kartenfeeds ist erforderlich',
                    statementCloseDateRequired: 'Bitte wähle ein Abrechnungsendedatum aus.',
                },
                corporate: 'Löschen von Transaktionen einschränken',
                personal: 'Löschen von Transaktionen erlauben',
                setFeedNameDescription: 'Gib dem Kartenfeed einen eindeutigen Namen, damit du ihn von den anderen unterscheiden kannst',
                setTransactionLiabilityDescription: 'Wenn aktiviert, können Karteninhaber Kartentransaktionen löschen. Neue Transaktionen werden dieser Regel folgen.',
                emptyAddedFeedTitle: 'Keine Karten in diesem Feed',
                emptyAddedFeedDescription: 'Stellen Sie sicher, dass in der Kartenübersicht Ihrer Bank Karten vorhanden sind.',
                pendingFeedTitle: `Wir prüfen Ihre Anfrage ...`,
                pendingFeedDescription: `Wir überprüfen derzeit Ihre Feed-Details. Sobald das erledigt ist, werden wir Sie kontaktieren über`,
                pendingBankTitle: 'Überprüfe dein Browserfenster',
                pendingBankDescription: (bankName: string) => `Bitte verbinden Sie sich im soeben geöffneten Browserfenster mit ${bankName}. Falls sich keines geöffnet hat,`,
                pendingBankLink: 'bitte hier klicken',
                giveItNameInstruction: 'Gib der Karte einen Namen, der sie von anderen abhebt.',
                updating: 'Wird aktualisiert ...',
                neverUpdated: 'Nie',
                noAccountsFound: 'Keine Konten gefunden',
                defaultCard: 'Standardkarte',
                downgradeTitle: `Arbeitsbereich kann nicht herabgestuft werden`,
                downgradeSubTitle: `Dieser Workspace kann nicht herabgestuft werden, da mehrere Kartenfeeds verbunden sind (Expensify Cards ausgenommen). Bitte <a href="#">nur einen Kartenfeed beibehalten</a>, um fortzufahren.`,
                noAccountsFoundDescription: (connection: string) => `Bitte füge das Konto in ${connection} hinzu und synchronisiere die Verbindung erneut`,
                expensifyCardBannerTitle: 'Hol dir die Expensify Card',
                expensifyCardBannerSubtitle:
                    'Genieße Cashback auf jeden Einkauf in den USA, bis zu 50 % Rabatt auf deine Expensify-Rechnung, unbegrenzt viele virtuelle Karten und vieles mehr.',
                expensifyCardBannerLearnMoreButton: 'Mehr erfahren',
                statementCloseDateTitle: 'Abrechnungsstichtag',
                statementCloseDateDescription: 'Teile uns mit, wann dein Kartenkontoauszug abgeschlossen wird, und wir erstellen einen passenden Auszug in Expensify.',
            },
            workflows: {
                title: 'Workflows',
                subtitle: 'Legen Sie fest, wie Ausgaben genehmigt und bezahlt werden.',
                disableApprovalPrompt:
                    'Expensify Cards in diesem Workspace verwenden derzeit Genehmigungen, um ihre Smart Limits zu definieren. Bitte passe die Limittypen aller Expensify Cards mit Smart Limits an, bevor du Genehmigungen deaktivierst.',
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
                subtitle: 'Kosten klassifizieren und abrechenbare Ausgaben nachverfolgen.',
            },
            taxes: {
                title: 'Steuern',
                subtitle: 'Dokumentiere und fordere erstattungsfähige Steuern zurück.',
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
                featureEnabledText: 'Um diese Funktion zu aktivieren oder zu deaktivieren, musst du deine Buchhaltungsimporteinstellungen ändern.',
                disconnectText: 'Um die Buchhaltung zu deaktivieren, musst du die Buchhaltungsverbindung von deinem Workspace trennen.',
                manageSettings: 'Einstellungen verwalten',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Verbindung mit Uber trennen',
                disconnectText: 'Um diese Funktion zu deaktivieren, trenne bitte zuerst die Uber for Business-Integration.',
                description: 'Bist du sicher, dass du diese Integration trennen möchtest?',
                confirmText: 'Verstanden',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Nicht so schnell …',
                featureEnabledText:
                    'Expensify Cards in diesem Workspace verwenden Genehmigungs-Workflows, um ihre Smart Limits festzulegen.\n\nBitte ändere die Limit-Typen aller Karten mit Smart Limits, bevor du Workflows deaktivierst.',
                confirmText: 'Zu Expensify Cards gehen',
            },
            rules: {
                title: 'Regeln',
                subtitle: 'Belege verlangen, hohe Ausgaben markieren und mehr.',
            },
            timeTracking: {
                title: 'Zeit',
                subtitle: 'Legen Sie einen abrechenbaren Stundensatz für die Zeiterfassung fest.',
                defaultHourlyRate: 'Standard-Stundensatz',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Beispiele:',
            customReportNamesSubtitle: `<muted-text>Passen Sie Berichtstitel mit unseren <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">umfangreichen Formeln</a> an.</muted-text>`,
            customNameTitle: 'Standardmäßiger Berichtstitel',
            customNameDescription: `Wählen Sie einen eigenen Namen für Spesenabrechnungen mithilfe unserer <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">umfangreichen Formeln</a>.`,
            customNameInputLabel: 'Name',
            customNameEmailPhoneExample: 'E-Mail oder Telefonnummer des Mitglieds: {report:submit:from}',
            customNameStartDateExample: 'Berichtsstartdatum: {report:startdate}',
            customNameWorkspaceNameExample: 'Arbeitsbereichsname: {report:workspacename}',
            customNameReportIDExample: 'Berichts-ID: {report:id}',
            customNameTotalExample: 'Summe: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Mitglieder am Ändern benutzerdefinierter Berichtstitel hindern',
        },
        reportFields: {
            addField: 'Feld hinzufügen',
            delete: 'Feld löschen',
            deleteFields: 'Felder löschen',
            findReportField: 'Berichtsfeld suchen',
            deleteConfirmation: 'Möchtest du dieses Berichtsfeld wirklich löschen?',
            deleteFieldsConfirmation: 'Möchten Sie diese Berichtsfelder wirklich löschen?',
            emptyReportFields: {
                title: 'Du hast noch keine Berichtsfelder erstellt',
                subtitle: 'Füge ein benutzerdefiniertes Feld (Text, Datum oder Dropdown) hinzu, das in Berichten erscheint.',
            },
            subtitle: 'Berichtsfelder gelten für alle Ausgaben und können hilfreich sein, wenn du nach zusätzlichen Informationen fragen möchtest.',
            disableReportFields: 'Berichts­felder deaktivieren',
            disableReportFieldsConfirmation: 'Sind Sie sicher? Text- und Datumsfelder werden gelöscht und Listen werden deaktiviert.',
            importedFromAccountingSoftware: 'Die folgenden Berichtsfelder werden importiert von Ihrem',
            textType: 'Text',
            dateType: 'Datum',
            dropdownType: 'Liste',
            formulaType: 'Formel',
            textAlternateText: 'Feld für freie Texteingabe hinzufügen.',
            dateAlternateText: 'Füge einen Kalender zur Datumsauswahl hinzu.',
            dropdownAlternateText: 'Füge eine Liste von Optionen hinzu, aus denen du auswählen kannst.',
            formulaAlternateText: 'Füge ein Formel­feld hinzu.',
            nameInputSubtitle: 'Wählen Sie einen Namen für das Berichtsfeld.',
            typeInputSubtitle: 'Wählen Sie aus, welchen Typ von Berichtsfeld Sie verwenden möchten.',
            initialValueInputSubtitle: 'Geben Sie einen Startwert ein, der im Berichtsfeld angezeigt werden soll.',
            listValuesInputSubtitle: 'Diese Werte werden in der Dropdown-Liste des Berichtsfelds angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            listInputSubtitle: 'Diese Werte werden in Ihrer Berichtsfeldliste angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            deleteValue: 'Wert löschen',
            deleteValues: 'Werte löschen',
            disableValue: 'Wert deaktivieren',
            disableValues: 'Werte deaktivieren',
            enableValue: 'Wert aktivieren',
            enableValues: 'Werte aktivieren',
            emptyReportFieldsValues: {
                title: 'Sie haben noch keine Listenwerte erstellt',
                subtitle: 'Füge benutzerdefinierte Werte hinzu, die in Berichten erscheinen.',
            },
            deleteValuePrompt: 'Möchtest du diesen Listenwert wirklich löschen?',
            deleteValuesPrompt: 'Möchtest du diese Listenwerte wirklich löschen?',
            listValueRequiredError: 'Bitte gib einen Namen für den Listenwert ein',
            existingListValueError: 'Ein Listenwert mit diesem Namen existiert bereits',
            editValue: 'Wert bearbeiten',
            listValues: 'Werte auflisten',
            addValue: 'Wert hinzufügen',
            existingReportFieldNameError: 'Ein Berichtsfeld mit diesem Namen existiert bereits',
            reportFieldNameRequiredError: 'Bitte einen Berichtsfeldnamen eingeben',
            reportFieldTypeRequiredError: 'Bitte wählen Sie einen Berichtsfeldtyp aus',
            circularReferenceError: 'Dieses Feld kann nicht auf sich selbst verweisen. Bitte aktualisieren.',
            reportFieldInitialValueRequiredError: 'Bitte wähle einen Anfangswert für ein Berichts­feld aus',
            genericFailureMessage: 'Beim Aktualisieren des Berichtfelds ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        tags: {
            tagName: 'Tag-Name',
            requiresTag: 'Mitglieder müssen alle Ausgaben taggen',
            trackBillable: 'Abrechenbare Ausgaben verfolgen',
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
            findTag: 'Tag finden',
            subtitle: 'Tags bieten eine detailliertere Möglichkeit, Kosten zu klassifizieren.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>Sie verwenden <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">abhängige Tags</a>. Sie können eine <a href="${importSpreadsheetLink}">Tabelle erneut importieren</a>, um Ihre Tags zu aktualisieren.</muted-text>`,
            emptyTags: {
                title: 'Sie haben noch keine Tags erstellt',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Füge einen Tag hinzu, um Projekte, Standorte, Abteilungen und mehr zu verfolgen.',
                subtitleHTML: `<muted-text><centered-text>Fügen Sie Tags hinzu, um Projekte, Standorte, Abteilungen und mehr zu verfolgen. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Erfahren Sie mehr</a> über das Formatieren von Tag-Dateien für den Import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Ihre Tags werden derzeit über eine Buchhaltungsverbindung importiert. Gehen Sie zu <a href="${accountingPageURL}">Buchhaltung</a>, um Änderungen vorzunehmen.</centered-text></muted-text>`,
            },
            deleteTag: 'Tag löschen',
            deleteTags: 'Tags löschen',
            deleteTagConfirmation: 'Sind Sie sicher, dass Sie dieses Tag löschen möchten?',
            deleteTagsConfirmation: 'Sind Sie sicher, dass Sie diese Tags löschen möchten?',
            deleteFailureMessage: 'Beim Löschen des Tags ist ein Fehler aufgetreten, bitte versuche es erneut',
            tagRequiredError: 'Tagname ist erforderlich',
            existingTagError: 'Ein Tag mit diesem Namen existiert bereits',
            invalidTagNameError: 'Tag-Name kann nicht 0 sein. Bitte wählen Sie einen anderen Wert.',
            genericFailureMessage: 'Beim Aktualisieren des Tags ist ein Fehler aufgetreten, bitte versuche es erneut',
            importedFromAccountingSoftware: 'Die folgenden Tags werden importiert von Ihrem',
            glCode: 'Sachkonto-Code',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des Hauptbuchcodes ist ein Fehler aufgetreten, bitte versuche es erneut.',
            tagRules: 'Tag-Regeln',
            approverDescription: 'Genehmigende Person',
            importTags: 'Tags importieren',
            importTagsSupportingText: 'Verschlüssele deine Ausgaben mit einem Tag-Typ oder mit mehreren.',
            configureMultiLevelTags: 'Konfiguriere deine Tag-Liste für mehrstufiges Tagging.',
            importMultiLevelTagsSupportingText: `Hier ist eine Vorschau deiner Tags. Wenn alles gut aussieht, klicke unten, um sie zu importieren.`,
            importMultiLevelTags: {
                firstRowTitle: 'Die erste Zeile ist die Überschrift für jede Tag-Liste',
                independentTags: 'Dies sind unabhängige Tags',
                glAdjacentColumn: 'In der angrenzenden Spalte befindet sich ein Hauptbuchcode (GL-Code)',
            },
            tagLevel: {
                singleLevel: 'Einstufige Tags',
                multiLevel: 'Mehrstufige Tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Tag-Ebenen wechseln',
                prompt1: 'Das Wechseln der Tag-Ebenen löscht alle aktuellen Tags.',
                prompt2: 'Wir empfehlen Ihnen zunächst',
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
                `Wir haben *${columnCounts} Spalten* in Ihrer Tabelle gefunden. Wählen Sie *Name* neben der Spalte aus, die die Namen der Tags enthält. Sie können außerdem *Aktiviert* neben der Spalte auswählen, die den Status der Tags festlegt.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Es können nicht alle Tags gelöscht oder deaktiviert werden',
                description: `Mindestens ein Tag muss aktiviert bleiben, da Ihre Arbeitsumgebung Tags erfordert.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Nicht alle Tags können optional gemacht werden',
                description: `Mindestens ein Tag muss weiterhin erforderlich sein, da deine Workspace-Einstellungen Tags erfordern.`,
            },
            cannotMakeTagListRequired: {
                title: 'Tagliste kann nicht als Pflichtfeld festgelegt werden',
                description: 'Sie können eine Tagliste nur als erforderlich festlegen, wenn in Ihrer Richtlinie mehrere Tag-Ebenen konfiguriert sind.',
            },
            tagCount: () => ({
                one: '1 Tag',
                other: (count: number) => `${count} Tags`,
            }),
        },
        taxes: {
            subtitle: 'Steuersätze und -namen hinzufügen und Standardwerte festlegen.',
            addRate: 'Kurs hinzufügen',
            workspaceDefault: 'Standardwährung des Arbeitsbereichs',
            foreignDefault: 'Standardwährung für Fremdwährung',
            customTaxName: 'Benutzerdefinierter Steuername',
            value: 'Wert',
            taxReclaimableOn: 'Erstattungsfähige Steuer auf',
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
                updateTaxClaimableFailureMessage: 'Der erstattungsfähige Anteil muss geringer sein als der Kilometerpauschalbetrag',
            },
            deleteTaxConfirmation: 'Sind Sie sicher, dass Sie diese Steuer löschen möchten?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Sind Sie sicher, dass Sie ${taxAmount} Steuern löschen möchten?`,
            actions: {
                delete: 'Tarif löschen',
                deleteMultiple: 'Sätze löschen',
                enable: 'Rate aktivieren',
                disable: 'Gebühr deaktivieren',
                enableTaxRates: () => ({
                    one: 'Rate aktivieren',
                    other: 'Tarife aktivieren',
                }),
                disableTaxRates: () => ({
                    one: 'Gebühr deaktivieren',
                    other: 'Preise deaktivieren',
                }),
            },
            importedFromAccountingSoftware: 'Die unten aufgeführten Steuern werden importiert aus Ihrer',
            taxCode: 'Steuercode',
            updateTaxCodeFailureMessage: 'Beim Aktualisieren des Steuercodes ist ein Fehler aufgetreten, bitte versuche es erneut.',
        },
        duplicateWorkspace: {
            title: 'Benenne deinen neuen Workspace',
            selectFeatures: 'Zu kopierende Funktionen auswählen',
            whichFeatures: 'Welche Funktionen möchtest du in deinen neuen Workspace übernehmen?',
            confirmDuplicate: 'Möchtest du fortfahren?',
            categories: 'Kategorien und Ihre Regeln zur automatischen Kategorisierung',
            reimbursementAccount: 'Erstattungskonto',
            welcomeNote: 'Bitte nutze meinen neuen Workspace',
            delayedSubmission: 'verspätete Einreichung',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Sie sind dabei, ${newWorkspaceName ?? ''} zu erstellen und mit ${totalMembers ?? 0} Mitgliedern aus dem ursprünglichen Workspace zu teilen.`,
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
            notFound: 'Kein Workspace gefunden',
            description:
                'Räume sind ideal, um sich mit mehreren Personen zu unterhalten und zusammenzuarbeiten. Um mit der Zusammenarbeit zu beginnen, erstelle einen Arbeitsbereich oder tritt einem bei',
        },
        new: {
            newWorkspace: 'Neuer Workspace',
            getTheExpensifyCardAndMore: 'Hol dir die Expensify Card und mehr',
            confirmWorkspace: 'Workspace bestätigen',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mein Gruppenarbeitsbereich${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Workspace von ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Beim Entfernen eines Mitglieds aus dem Workspace ist ein Fehler aufgetreten, bitte versuche es erneut.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Möchtest du ${memberName} wirklich entfernen?`,
                other: 'Möchtest du diese Mitglieder wirklich entfernen?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} ist ein Genehmiger in diesem Arbeitsbereich. Wenn du diesen Arbeitsbereich nicht mehr mit ihnen teilst, ersetzen wir sie im Genehmigungs-Workflow durch den Arbeitsbereichsinhaber ${ownerName}`,
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
            transferOwner: 'Eigentümer übertragen',
            makeMember: () => ({
                one: 'Mitglied machen',
                other: 'Mitglieder erstellen',
            }),
            makeAdmin: () => ({
                one: 'Als Admin festlegen',
                other: 'Adminrechte vergeben',
            }),
            makeAuditor: () => ({
                one: 'Zum Prüfer machen',
                other: 'Prüfer erstellen',
            }),
            selectAll: 'Alle auswählen',
            error: {
                genericAdd: 'Beim Hinzufügen dieses Workspace-Mitglieds ist ein Problem aufgetreten',
                cannotRemove: 'Du kannst dich selbst oder den/die Workspace-Inhaber:in nicht entfernen',
                genericRemove: 'Beim Entfernen dieses Workspace-Mitglieds ist ein Problem aufgetreten',
            },
            addedWithPrimary: 'Einige Mitglieder wurden mit ihren primären Logins hinzugefügt.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Hinzugefügt durch sekundären Login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Gesamtzahl der Workspace-Mitglieder: ${count}`,
            importMembers: 'Mitglieder importieren',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Wenn du ${approver} aus diesem Workspace entfernst, ersetzen wir diese Person im Genehmigungsworkflow durch ${workspaceOwner}, die/den Workspace-Inhaber·in.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} hat ausstehende Spesenabrechnungen zur Genehmigung. Bitte bitten Sie diese Person, sie zu genehmigen, oder übernehmen Sie die Kontrolle über ihre Abrechnungen, bevor Sie sie aus dem Workspace entfernen.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Sie können ${memberName} nicht aus diesem Workspace entfernen. Bitte legen Sie unter Workflows > Zahlungen erstellen oder nachverfolgen eine neue erstattende Person fest und versuchen Sie es dann erneut.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Wenn du ${memberName} aus diesem Workspace entfernst, ersetzen wir diese Person als bevorzugte:n Exporteur:in durch ${workspaceOwner}, den/die Workspace-Inhaber:in.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Wenn du ${memberName} aus diesem Workspace entfernst, ersetzen wir sie*als technischen Kontakt durch ${workspaceOwner}, den Workspace-Inhaber.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} hat einen ausstehenden zu bearbeitenden Bericht. Bitte fordere sie auf, die erforderliche Aktion abzuschließen, bevor du sie aus dem Workspace entfernst.`,
        },
        card: {
            getStartedIssuing: 'Beginne, indem du deine erste virtuelle oder physische Karte ausstellst.',
            issueCard: 'Karte ausstellen',
            issueNewCard: {
                whoNeedsCard: 'Wer braucht eine Karte?',
                inviteNewMember: 'Neues Mitglied einladen',
                findMember: 'Mitglied finden',
                chooseCardType: 'Kartentyp auswählen',
                physicalCard: 'Physische Karte',
                physicalCardDescription: 'Ideal für Vielausgeber',
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
                cardLimitError: 'Bitte geben Sie einen Betrag kleiner als 21.474.836 $ ein',
                giveItName: 'Gib ihr einen Namen',
                giveItNameInstruction: 'Gestalte sie eindeutig genug, um sie von anderen Karten zu unterscheiden. Konkrete Anwendungsfälle sind noch besser!',
                cardName: 'Kartenname',
                letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
                willBeReadyToUse: 'Diese Karte kann sofort verwendet werden.',
                willBeReadyToShip: 'Diese Karte ist sofort versandbereit.',
                cardholder: 'Karteninhaber',
                cardType: 'Kartentyp',
                limit: 'Limit',
                limitType: 'Limittyp',
                disabledApprovalForSmartLimitError: 'Bitte aktiviere Genehmigungen in <strong>Workflows > Genehmigungen hinzufügen</strong>, bevor du intelligente Limits einrichtest',
            },
            deactivateCardModal: {
                deactivate: 'Deaktivieren',
                deactivateCard: 'Karte deaktivieren',
                deactivateConfirmation: 'Wenn du diese Karte deaktivierst, werden alle zukünftigen Transaktionen abgelehnt und dies kann nicht rückgängig gemacht werden.',
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
            talkYourOnboardingSpecialist: 'Chatte mit deiner Einrichtungsfachperson.',
            talkYourAccountManager: 'Chatte mit deiner Kundenbetreuung.',
            talkToConcierge: 'Mit Concierge chatten.',
            needAnotherAccounting: 'Sie brauchen eine andere Buchhaltungssoftware?',
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
                `In Expensify Classic ist ein Fehler bei einer eingerichteten Verbindung aufgetreten. [Wechsel zu Expensify Classic, um dieses Problem zu beheben.](${oldDotPolicyConnectionsURL})`,
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
                        return 'Verbindung mit QuickBooks Online nicht möglich';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Verbindung zu Xero nicht möglich';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Verbindung zu NetSuite nicht möglich';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Verbindung zu QuickBooks Desktop nicht möglich';
                    default: {
                        return 'Verbindung zur Integration nicht möglich';
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
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Standard-NetSuite-Mitarbeiter',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'diese Integration';
                return `Sind Sie sicher, dass Sie die Verbindung zu ${integrationName} trennen möchten?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Möchtest du ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'diese Buchhaltungsintegration'} wirklich verbinden? Dadurch werden alle vorhandenen Buchhaltungsverbindungen entfernt.`,
            enterCredentials: 'Gib deine Anmeldedaten ein',
            claimOffer: {
                badgeText: 'Angebot verfügbar!',
                xero: {
                    headline: 'Hol dir Xero 6 Monate lang kostenlos!',
                    description: '<muted-text><centered-text>Neu bei Xero? Expensify-Kund:innen erhalten 6 Monate gratis. Hol dir unten dein Angebot.</centered-text></muted-text>',
                    connectButton: 'Mit Xero verbinden',
                },
                uber: {
                    headerTitle: 'Uber for Business',
                    headline: 'Erhalte 5 % Rabatt auf Uber-Fahrten',
                    description: `<muted-text><centered-text>Aktiviere Uber for Business über Expensify und spare 5 % auf alle Geschäftsfahrten bis Juni. <a href="${CONST.UBER_TERMS_LINK}">Es gelten die Bedingungen.</a></centered-text></muted-text>`,
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
                            return 'Mitarbeitende importieren';
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
                            return 'Synchronisierung erstatteter Berichte und Rechnungszahlungen';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Steuercodes importieren';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Verbindung zu QuickBooks Online wird überprüft';
                        case 'quickbooksOnlineImportMain':
                            return 'QuickBooks Online-Daten werden importiert';
                        case 'startingImportXero':
                            return 'Xero-Daten werden importiert';
                        case 'startingImportQBO':
                            return 'QuickBooks Online-Daten werden importiert';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'QuickBooks Desktop-Daten importieren';
                        case 'quickbooksDesktopImportTitle':
                            return 'Titel wird importiert';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Genehmigungszertifikat wird importiert';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Dimensionen werden importiert';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Speicherungsrichtlinie wird importiert';
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
                            return 'Kunden/Projekte aktualisieren';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Personenliste wird aktualisiert';
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
                            return 'Xero-Rechnungen und -Belege als bezahlt markieren';
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
                            return 'Kunden werden importiert';
                        case 'netSuiteSyncInitData':
                            return 'Daten von NetSuite abrufen';
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
                            return 'Daten als Expensify-Berichtsfelder importieren';
                        case 'netSuiteSyncTags':
                            return 'Daten als Expensify-Tags importieren';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Aktualisiere Verbindungsinformationen';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensify-Berichte als erstattet markieren';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuite-Rechnungen und -Belege als bezahlt markieren';
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
                            return 'Sage-Intacct-Daten werden importiert';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Übersetzung fehlt für Stufe: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Bevorzugter Exporteur',
            exportPreferredExporterNote:
                'Die bevorzugte exportierende Person kann beliebige:r Workspace-Admin sein, muss aber auch Domain-Admin sein, wenn du in den Domaineinstellungen unterschiedliche Exportkonten für einzelne Firmenkarten festlegst.',
            exportPreferredExporterSubNote: 'Sobald dies festgelegt ist, sieht die bevorzugte Exportperson in ihrem Konto die Berichte zum Export.',
            exportAs: 'Exportieren als',
            exportOutOfPocket: 'Auslagen exportieren als',
            exportCompanyCard: 'Firmenkartenausgaben exportieren als',
            exportDate: 'Exportdatum',
            defaultVendor: 'Standardlieferant',
            autoSync: 'Automatische Synchronisierung',
            autoSyncDescription: 'NetSuite und Expensify automatisch jeden Tag synchronisieren. Finalisierte Berichte in Echtzeit exportieren',
            reimbursedReports: 'Erstattete Berichte synchronisieren',
            cardReconciliation: 'Kartenabstimmung',
            reconciliationAccount: 'Abstimmungskonto',
            continuousReconciliation: 'Kontinuierliche Abstimmung',
            saveHoursOnReconciliation:
                'Sparen Sie in jedem Abrechnungszeitraum Stunden bei der Abstimmung, indem Expensify fortlaufend Expensify Card Kontoauszüge und Abrechnungen automatisch für Sie abstimmt.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Um die kontinuierliche Abstimmung zu aktivieren, aktiviere bitte die <a href="${accountingAdvancedSettingsLink}">Auto-Synchronisierung</a> für ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wähle das Bankkonto aus, mit dem deine Expensify-Card-Zahlungen abgestimmt werden.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Stelle sicher, dass dieses Konto mit deinem <a href="${settlementAccountUrl}">Expensify Card-Verrechnungskonto</a> (endet auf ${lastFourPAN}) übereinstimmt, damit die kontinuierliche Abstimmung ordnungsgemäß funktioniert.`,
            },
        },
        export: {
            notReadyHeading: 'Nicht bereit zum Exportieren',
            notReadyDescription:
                'Entwürfe oder ausstehende Spesenabrechnungen können nicht in das Buchhaltungssystem exportiert werden. Bitte genehmige oder bezahle diese Ausgaben, bevor du sie exportierst.',
        },
        invoices: {
            sendInvoice: 'Rechnung senden',
            sendFrom: 'Senden von',
            invoicingDetails: 'Rechnungsdetails',
            invoicingDetailsDescription: 'Diese Informationen werden auf deinen Rechnungen erscheinen.',
            companyName: 'Firmenname',
            companyWebsite: 'Firmenwebsite',
            paymentMethods: {
                personal: 'Persönlich',
                business: 'Geschäft',
                chooseInvoiceMethod: 'Wähle unten eine Zahlungsmethode aus:',
                payingAsIndividual: 'Zahlung als Privatperson',
                payingAsBusiness: 'Als Unternehmen bezahlen',
            },
            invoiceBalance: 'Rechnungsbetrag',
            invoiceBalanceSubtitle:
                'Dies ist Ihr aktuelles Guthaben aus eingegangenen Rechnungszahlungen. Es wird automatisch auf Ihr Bankkonto überwiesen, sofern Sie eines hinzugefügt haben.',
            bankAccountsSubtitle: 'Füge ein Bankkonto hinzu, um Rechnungen zu bezahlen und Zahlungen zu erhalten.',
        },
        invite: {
            member: 'Mitglied einladen',
            members: 'Mitglieder einladen',
            invitePeople: 'Neue Mitglieder einladen',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Workspace ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            pleaseEnterValidLogin: `Bitte stelle sicher, dass die E‑Mail-Adresse oder Telefonnummer gültig ist (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'Benutzer',
            users: 'Benutzer',
            invited: 'eingeladen',
            removed: 'entfernt',
            to: 'bis',
            from: 'von',
        },
        inviteMessage: {
            confirmDetails: 'Details bestätigen',
            inviteMessagePrompt: 'Machen Sie Ihre Einladung noch besonderer, indem Sie unten eine Nachricht hinzufügen!',
            personalMessagePrompt: 'Nachricht',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Workspace ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            inviteNoMembersError: 'Bitte wähle mindestens ein Mitglied zum Einladen aus',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} hat beantragt, ${workspaceName} beizutreten`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ups! Nicht so schnell ...',
            workspaceNeeds: 'Ein Workspace benötigt mindestens einen aktivierten Entfernungssatz.',
            distance: 'Entfernung',
            centrallyManage: 'Tarife zentral verwalten, in Meilen oder Kilometern nachverfolgen und eine Standardkategorie festlegen.',
            rate: 'Bewerten',
            addRate: 'Kurs hinzufügen',
            findRate: 'Kurs finden',
            trackTax: 'Steuer verfolgen',
            deleteRates: () => ({
                one: 'Tarif löschen',
                other: 'Sätze löschen',
            }),
            enableRates: () => ({
                one: 'Rate aktivieren',
                other: 'Tarife aktivieren',
            }),
            disableRates: () => ({
                one: 'Gebühr deaktivieren',
                other: 'Preise deaktivieren',
            }),
            enableRate: 'Rate aktivieren',
            status: 'Status',
            unit: 'Einheit',
            taxFeatureNotEnabledMessage:
                '<muted-text>Steuern müssen im Workspace aktiviert sein, um diese Funktion nutzen zu können. Gehe zu <a href="#">Weitere Funktionen</a>, um diese Änderung vorzunehmen.</muted-text>',
            deleteDistanceRate: 'Entfernungsrate löschen',
            areYouSureDelete: () => ({
                one: 'Bist du sicher, dass du diesen Satz löschen möchtest?',
                other: 'Möchtest du diese Tarife wirklich löschen?',
            }),
            errors: {
                rateNameRequired: 'Ratenname ist erforderlich',
                existingRateName: 'Ein Entfernungs­tarif mit diesem Namen existiert bereits',
            },
        },
        editor: {
            descriptionInputLabel: 'Beschreibung',
            nameInputLabel: 'Name',
            typeInputLabel: 'Typ',
            initialValueInputLabel: 'Anfangswert',
            nameInputHelpText: 'Dies ist der Name, den du in deinem Arbeitsbereich siehst.',
            nameIsRequiredError: 'Du musst deinem Arbeitsbereich einen Namen geben',
            currencyInputLabel: 'Standardwährung',
            currencyInputHelpText: 'Alle Ausgaben in diesem Workspace werden in diese Währung umgerechnet.',
            currencyInputDisabledText: (currency: string) => `Die Standardwährung kann nicht geändert werden, da dieser Workspace mit einem ${currency}-Bankkonto verknüpft ist.`,
            save: 'Speichern',
            genericFailureMessage: 'Beim Aktualisieren des Arbeitsbereichs ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            addressContext: 'Eine Workspace-Adresse ist erforderlich, um Expensify Travel zu aktivieren. Bitte geben Sie eine Adresse ein, die mit Ihrem Unternehmen verknüpft ist.',
            policy: 'Spesenrichtlinie',
        },
        bankAccount: {
            continueWithSetup: 'Einrichtung fortsetzen',
            youAreAlmostDone:
                'Du bist fast fertig mit dem Einrichten deines Bankkontos. Damit kannst du Firmenkarten ausgeben, Ausgaben erstatten, Rechnungen einziehen und Rechnungen bezahlen.',
            streamlinePayments: 'Zahlungen optimieren',
            connectBankAccountNote: 'Hinweis: Persönliche Bankkonten können nicht für Zahlungen in Workspaces verwendet werden.',
            oneMoreThing: 'Noch eine Sache!',
            allSet: 'Alles erledigt!',
            accountDescriptionWithCards: 'Dieses Bankkonto wird verwendet, um Firmenkarten auszugeben, Auslagen zu erstatten, Rechnungen einzuziehen und Zahlungen zu leisten.',
            letsFinishInChat: 'Lass uns im Chat fertig machen!',
            finishInChat: 'Im Chat abschließen',
            almostDone: 'Fast geschafft!',
            disconnectBankAccount: 'Bankkonto trennen',
            startOver: 'Neu beginnen',
            updateDetails: 'Details aktualisieren',
            yesDisconnectMyBankAccount: 'Ja, mein Bankkonto trennen',
            yesStartOver: 'Ja, neu beginnen',
            disconnectYourBankAccount: (bankName: string) =>
                `Trenne dein Bankkonto bei <strong>${bankName}</strong>. Alle ausstehenden Transaktionen für dieses Konto werden trotzdem abgeschlossen.`,
            clearProgress: 'Wenn du neu beginnst, wird dein bisheriger Fortschritt gelöscht.',
            areYouSure: 'Bist du sicher?',
            workspaceCurrency: 'Workspace-Währung',
            updateCurrencyPrompt:
                'Ihr Workspace ist derzeit offenbar auf eine andere Währung als USD eingestellt. Bitte klicken Sie unten auf die Schaltfläche, um Ihre Währung jetzt auf USD zu aktualisieren.',
            updateToUSD: 'Auf USD aktualisieren',
            updateWorkspaceCurrency: 'Arbeitsbereichswährung aktualisieren',
            workspaceCurrencyNotSupported: 'Workspace-Währung wird nicht unterstützt',
            yourWorkspace: `Dein Arbeitsbereich ist auf eine nicht unterstützte Währung eingestellt. Sieh dir die <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">Liste der unterstützten Währungen</a> an.`,
            chooseAnExisting: 'Wählen Sie ein bestehendes Bankkonto aus, um Ausgaben zu bezahlen, oder fügen Sie ein neues hinzu.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Eigentümer übertragen',
            addPaymentCardTitle: 'Gib deine Zahlungskarte ein, um die Inhaberschaft zu übertragen',
            addPaymentCardButtonText: 'Geschäftsbedingungen akzeptieren & Zahlungskarte hinzufügen',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Lies und akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und die <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutz</a>-Richtlinie, um deine Karte hinzuzufügen.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS-konform',
            addPaymentCardBankLevelEncrypt: 'Verschlüsselung auf Bankniveau',
            addPaymentCardRedundant: 'Redundante Infrastruktur',
            addPaymentCardLearnMore: `<muted-text>Erfahre mehr über unsere <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">Sicherheit</a>.</muted-text>`,
            amountOwedTitle: 'Offener Saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Dieses Konto hat einen ausstehenden Saldo aus einem vorherigen Monat.\n\nMöchtest du den Saldo ausgleichen und die Abrechnung für diesen Workspace übernehmen?',
            ownerOwesAmountTitle: 'Offener Saldo',
            ownerOwesAmountButtonText: 'Kontostand übertragen',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `Das Konto, dem dieser Workspace gehört (${email}), hat einen ausstehenden Saldo aus einem früheren Monat.

Möchtest du diesen Betrag (${amount}) überweisen, um die Abrechnung für diesen Workspace zu übernehmen? Deine Zahlungskarte wird sofort belastet.`,
            subscriptionTitle: 'Jahresabonnement übernehmen',
            subscriptionButtonText: 'Abonnement übertragen',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Wenn Sie diesen Workspace übernehmen, wird dessen Jahresabonnement mit Ihrem aktuellen Abonnement zusammengeführt. Dadurch erhöht sich die Größe Ihres Abonnements um ${usersCount} Mitglieder, sodass Ihr neues Abonnement insgesamt ${finalCount} Mitglieder umfasst. Möchten Sie fortfahren?`,
            duplicateSubscriptionTitle: 'Doppelte Abonnementwarnung',
            duplicateSubscriptionButtonText: 'Weiter',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Es sieht so aus, als ob du die Abrechnung für die Workspaces von ${email} übernehmen möchtest. Dafür musst du jedoch zuerst in allen Workspaces als Admin eingetragen sein.

Klicke auf „Weiter“, wenn du nur die Abrechnung für den Workspace ${workspaceName} übernehmen möchtest.

Wenn du die Abrechnung für das gesamte Abonnement übernehmen möchtest, bitte die Person zunächst, dich in allen ihren Workspaces als Admin hinzuzufügen, bevor du die Abrechnung übernimmst.`,
            hasFailedSettlementsTitle: 'Eigentumsübertragung nicht möglich',
            hasFailedSettlementsButtonText: 'Verstanden',
            hasFailedSettlementsText: (email: string) =>
                `Sie können die Abrechnung nicht übernehmen, weil ${email} einen überfälligen Expensify Card-Ausgleich hat. Bitte bitten Sie diese Person, sich zur Klärung des Problems an concierge@expensify.com zu wenden. Danach können Sie die Abrechnung für diesen Workspace übernehmen.`,
            failedToClearBalanceTitle: 'Guthaben konnte nicht ausgeglichen werden',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Wir konnten den Saldo nicht ausgleichen. Bitte versuche es später noch einmal.',
            successTitle: 'Juhu! Alles bereit.',
            successDescription: 'Du bist jetzt Eigentümer:in dieses Arbeitsbereichs.',
            errorTitle: 'Ups! Nicht so schnell ...',
            errorDescription: `<muted-text><centered-text>Beim Übertragen der Eigentümerschaft dieses Arbeitsbereichs ist ein Problem aufgetreten. Versuch es noch einmal oder <concierge-link>wende dich für Hilfe an Concierge</concierge-link>.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Vorsicht!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `Die folgenden Abrechnungen wurden bereits nach ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} exportiert:

${reportName}

Möchtest du sie wirklich noch einmal exportieren?`,
            confirmText: 'Ja, nochmal exportieren',
            cancelText: 'Abbrechen',
        },
        upgrade: {
            reportFields: {
                title: 'Berichtsfelder',
                description: `Berichts­felder ermöglichen es dir, Details auf Kopfzeilenebene festzulegen, die sich von Tags unterscheiden, welche sich auf Ausgaben in einzelnen Positionen beziehen. Diese Details können unter anderem bestimmte Projektnamen, Informationen zu Geschäftsreisen, Standorte und mehr umfassen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Berichts­felder sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Genieße automatisierte Synchronisierung und reduziere manuelle Eingaben mit der Expensify + NetSuite-Integration. Erhalte detaillierte Finanzanalysen in Echtzeit mit Unterstützung für native und benutzerdefinierte Segmente, einschließlich Projekt- und Kundenzuordnung.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere NetSuite-Integration ist nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Profitiere von automatischer Synchronisierung und reduziere manuelle Eingaben mit der Integration von Expensify + Sage Intacct. Gewinne detaillierte, aktuelle Finanzanalysen mit benutzerdefinierten Dimensionen sowie Spesencodierung nach Abteilung, Klasse, Standort, Kunde und Projekt (Job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere Sage Intacct-Integration ist nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Genieße die automatische Synchronisierung und reduziere manuelle Eingaben mit der Integration von Expensify + QuickBooks Desktop. Erreiche maximale Effizienz mit einer Echtzeit-Zwei-Wege-Verbindung und der Spesencodierung nach Klasse, Artikel, Kunde und Projekt.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere QuickBooks Desktop-Integration ist nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Erweiterte Genehmigungen',
                description: `Wenn du weitere Genehmigungsebenen hinzufügen möchtest – oder einfach sicherstellen willst, dass besonders hohe Ausgaben noch einmal überprüft werden –, bist du bei uns richtig. Erweiterte Genehmigungen helfen dir, auf jeder Ebene die passenden Kontrollmechanismen einzurichten, damit du die Ausgaben deines Teams im Griff behältst.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Erweiterte Genehmigungen sind nur im Control-Tarif verfügbar, der bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`} beginnt</muted-text>`,
            },
            categories: {
                title: 'Kategorien',
                description: 'Kategorien ermöglichen es dir, Ausgaben nachzuverfolgen und zu organisieren. Verwende unsere Standardkategorien oder füge deine eigenen hinzu.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kategorien sind im Collect-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            glCodes: {
                title: 'Sachkonten-Codes',
                description: `Füge deinen Kategorien und Tags G/L-Codes hinzu, um Ausgaben einfach in deine Buchhaltungs- und Lohnabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Sachkonten stehen nur im Control-Tarif zur Verfügung, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Hauptbuch- und Lohnbuchhaltungscodes',
                description: `Fügen Sie Ihren Kategorien Hauptbuch- und Lohnabrechnungscodes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Lohnabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Finanz- und Lohnabrechnungscodes sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Steuerschlüssel',
                description: `Füge deinen Steuern Steuerschlüssel hinzu, um Ausgaben einfach in deine Buchhaltungs- und Lohnabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Steuerschlüssel sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            companyCards: {
                title: 'Unbegrenzte Firmenkarten',
                description: `Müssen Sie weitere Kartenfeeds hinzufügen? Schalten Sie unbegrenzt viele Firmenkarten frei, um Transaktionen von allen großen Kartenanbietern zu synchronisieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dies ist nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            rules: {
                title: 'Regeln',
                description: `Regeln laufen im Hintergrund und halten Ihre Ausgaben unter Kontrolle, damit Sie sich nicht um Kleinigkeiten kümmern müssen.

Fordern Sie Ausgabendetails wie Belege und Beschreibungen an, legen Sie Limits und Standardwerte fest und automatisieren Sie Genehmigungen und Zahlungen – alles an einem Ort.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Regeln sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            perDiem: {
                title: 'Tagespauschale',
                description:
                    'Tagespauschalen sind eine großartige Möglichkeit, die täglichen Kosten auf Dienstreisen Ihrer Mitarbeitenden regelkonform und planbar zu halten. Profitieren Sie von Funktionen wie individuellen Sätzen, Standardkategorien und detaillierteren Angaben wie Reisezielen und Untersätzen.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Tagegelder sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
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
                    'Mehrstufige Tags helfen Ihnen, Ausgaben präziser zu verfolgen. Weisen Sie jedem Posten mehrere Tags zu – etwa Abteilung, Kunde oder Kostenstelle –, um den vollständigen Kontext jeder Ausgabe zu erfassen. Dies ermöglicht detailliertere Berichte, Genehmigungs-Workflows und Buchhaltungsexporte.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Mehrstufige Tags sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Entfernungssätze',
                description: 'Erstellen und verwalten Sie Ihre eigenen Sätze, verfolgen Sie in Meilen oder Kilometern und legen Sie Standardkategorien für Entfernungskosten fest.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Entfernungsraten sind im Collect-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            auditor: {
                title: 'Prüfer',
                description: 'Prüfer:innen erhalten schreibgeschützten Zugriff auf alle Reports für vollständige Transparenz und Compliance-Überwachung.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Prüfer sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Mehrere Genehmigungsstufen',
                description:
                    'Mehrere Genehmigungsebenen sind ein Workflow-Tool für Unternehmen, die mehr als eine Person benötigen, um einen Bericht zu genehmigen, bevor er erstattet werden kann.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Mehrere Genehmigungsstufen sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'pro aktivem Mitglied und Monat.',
                perMember: 'pro Mitglied und Monat.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Führe ein Upgrade durch, um auf diese Funktion zuzugreifen, oder <a href="${subscriptionLink}">erfahre mehr</a> über unsere Tarife und Preise.</muted-text>`,
            upgradeToUnlock: 'Diese Funktion freischalten',
            completed: {
                headline: `Du hast deinen Workspace aktualisiert!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Du hast ${policyName} erfolgreich auf den Control-Tarif hochgestuft! <a href="${subscriptionLink}">Abonnement anzeigen</a> für weitere Details.</centered-text>`,
                categorizeMessage: `Du hast erfolgreich auf den Collect-Tarif upgegradet. Jetzt kannst du deine Ausgaben kategorisieren!`,
                travelMessage: `Du hast dein Abonnement erfolgreich auf den Collect-Tarif aktualisiert. Jetzt kannst du mit dem Buchen und Verwalten von Reisen beginnen!`,
                distanceRateMessage: `Du hast erfolgreich auf den Collect‑Tarif upgegradet. Jetzt kannst du den Kilometerpreis ändern!`,
                gotIt: 'Verstanden, danke',
                createdWorkspace: `Du hast einen Workspace erstellt!`,
            },
            commonFeatures: {
                title: 'Zum Control-Tarif upgraden',
                note: 'Schalte unsere leistungsstärksten Funktionen frei, darunter:',
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
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: 'Ihr Unternehmen hat die Erstellung von Workspaces eingeschränkt. Bitte wenden Sie sich für Hilfe an eine*n Admin.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Zum Collect-Tarif wechseln',
                note: 'Wenn du ein Downgrade durchführst, verlierst du den Zugriff auf diese und weitere Funktionen:',
                benefits: {
                    note: 'Für einen vollständigen Vergleich unserer Tarife sieh dir unsere',
                    pricingPage: 'Preisseite',
                    confirm: 'Möchtest du wirklich ein Downgrade durchführen und deine Konfigurationen entfernen?',
                    warning: 'Dies kann nicht rückgängig gemacht werden.',
                    benefit1: 'Buchhaltungsverbindungen (außer QuickBooks Online und Xero)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Genehmigungsworkflows mit mehreren Ebenen',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    headsUp: 'Achtung!',
                    multiWorkspaceNote: 'Sie müssen alle Ihre Workspaces vor Ihrer ersten monatlichen Zahlung downgraden, um ein Abonnement zum Collect-Tarif zu beginnen. Klicken Sie',
                    selectStep: '> Wähle jeden Workspace aus > ändere den Plantyp auf',
                },
            },
            completed: {
                headline: 'Ihr Arbeitsbereich wurde herabgestuft',
                description: 'Sie haben andere Arbeitsbereiche im Control-Tarif. Damit Ihnen der Collect-Tarif berechnet wird, müssen Sie alle Arbeitsbereiche herabstufen.',
                gotIt: 'Verstanden, danke',
            },
        },
        payAndDowngrade: {
            title: 'Bezahlen & Downgrade',
            headline: 'Ihre letzte Zahlung',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Ihre endgültige Rechnung für dieses Abonnement beträgt <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Sieh dir unten deine Aufschlüsselung für ${date} an:`,
            subscription:
                'Achtung! Diese Aktion beendet dein Expensify-Abonnement, löscht diesen Arbeitsbereich und entfernt alle Mitglieder aus dem Arbeitsbereich. Wenn du diesen Arbeitsbereich behalten und dich nur selbst entfernen möchtest, lass zuerst eine andere Adminperson die Abrechnung übernehmen.',
            genericFailureMessage: 'Beim Bezahlen Ihrer Rechnung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        restrictedAction: {
            restricted: 'Eingeschränkt',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Aktionen im Workspace ${workspaceName} sind derzeit eingeschränkt`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Der/die Arbeitsbereichs-Inhaber:in ${workspaceOwnerName} muss die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Aktivitäten im Arbeitsbereich freizuschalten.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Du musst die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Aktivität im Arbeitsbereich freizuschalten.',
            addPaymentCardToUnlock: 'Füge eine Zahlungskarte hinzu, um alles freizuschalten!',
            addPaymentCardToContinueUsingWorkspace: 'Füge eine Zahlungsmethode hinzu, um diesen Arbeitsbereich weiter zu nutzen',
            pleaseReachOutToYourWorkspaceAdmin: 'Bitte wenden Sie sich bei Fragen an Ihre Workspace-Admin.',
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
                receiptRequiredAmountDescription: 'Belege verlangen, wenn die Ausgaben diesen Betrag überschreiten, außer wenn eine Kategorieregel dies außer Kraft setzt.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `Der Betrag darf nicht höher sein als der für die Einzelpostenabrechnung erforderliche Betrag (${amount})`,
                itemizedReceiptRequiredAmount: 'Erforderlicher Betrag für detaillierte Quittung',
                itemizedReceiptRequiredAmountDescription:
                    'Positionierte Belege verlangen, wenn die Ausgaben diesen Betrag überschreiten, sofern dies nicht durch eine Kategoriebestimmung außer Kraft gesetzt wird.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `Der Betrag darf nicht niedriger sein als der für reguläre Belege erforderliche Betrag (${amount})`,
                maxExpenseAmount: 'Maximaler Spesenbetrag',
                maxExpenseAmountDescription: 'Markiere Ausgaben, die diesen Betrag überschreiten, es sei denn, sie werden durch eine Kategorienregel außer Kraft gesetzt.',
                maxAge: 'Maximalalter',
                maxExpenseAge: 'Maximales Ausgabenalter',
                maxExpenseAgeDescription: 'Ausgaben markieren, die älter als eine bestimmte Anzahl von Tagen sind.',
                maxExpenseAgeDays: () => ({
                    one: '1 Tag',
                    other: (count: number) => `${count} Tage`,
                }),
                cashExpenseDefault: 'Standardzahlung aus eigener Tasche',
                cashExpenseDefaultDescription:
                    'Wählen Sie aus, wie Barausgaben erstellt werden sollen. Eine Ausgabe gilt als Barausgabe, wenn sie keine importierte Firmenkartentransaktion ist. Dazu gehören manuell erstellte Ausgaben, Belege, Pauschalen, Entfernungs- und Zeitausgaben.',
                reimbursableDefault: 'Erstattungsfähig',
                reimbursableDefaultDescription: 'Auslagen werden meist an Mitarbeitende zurückerstattet',
                nonReimbursableDefault: 'Nicht erstattungsfähig',
                nonReimbursableDefaultDescription: 'Spesen werden gelegentlich an Mitarbeitende zurückgezahlt',
                alwaysReimbursable: 'Immer erstattungsfähig',
                alwaysReimbursableDescription: 'Auslagen werden immer an Mitarbeitende zurückgezahlt',
                alwaysNonReimbursable: 'Immer nicht erstattungsfähig',
                alwaysNonReimbursableDescription: 'Spesen werden Mitarbeitenden niemals zurückerstattet',
                billableDefault: 'Abrechenbar (Standard)',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Wähle, ob Bar- und Kreditkartenausgaben standardmäßig verrechenbar sein sollen. Verrechenbare Ausgaben werden in den <a href="${tagsPageLink}">Tags</a> aktiviert oder deaktiviert.</muted-text>`,
                billable: 'Abrechenbar',
                billableDescription: 'Ausgaben werden meist den Kund:innen weiterberechnet',
                nonBillable: 'Nicht verrechenbar',
                nonBillableDescription: 'Ausgaben werden gelegentlich an Kund:innen weiterverrechnet',
                eReceipts: 'eBelege',
                eReceiptsHint: `eReceipts werden automatisch erstellt [für die meisten Kreditkartentransaktionen in USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Teilnehmer-Tracking',
                attendeeTrackingHint: 'Verfolge die Pro-Kopf-Kosten für jede Ausgabe.',
                prohibitedDefaultDescription:
                    'Markiere alle Belege, auf denen Alkohol, Glücksspiel oder andere eingeschränkte Artikel erscheinen. Ausgaben mit Belegen, auf denen diese Positionen vorkommen, müssen manuell geprüft werden.',
                prohibitedExpenses: 'Unzulässige Ausgaben',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Hotelnebenkosten',
                gambling: 'Glücksspiel',
                tobacco: 'Tabak',
                adultEntertainment: 'Erwachsenenunterhaltung',
                requireCompanyCard: 'Firmenkarten für alle Käufe vorschreiben',
                requireCompanyCardDescription: 'Kennzeichne alle Barausgaben, einschließlich Fahrtkosten und Tagesspesenausgaben.',
            },
            expenseReportRules: {
                title: 'Erweitert',
                subtitle: 'Automatisieren Sie die Einhaltung von Spesenrichtlinien, Genehmigungen und Zahlungen.',
                preventSelfApprovalsTitle: 'Selbstgenehmigungen verhindern',
                preventSelfApprovalsSubtitle: 'Verhindere, dass Workspace-Mitglieder ihre eigenen Spesenberichte genehmigen.',
                autoApproveCompliantReportsTitle: 'Regelkonforme Berichte automatisch genehmigen',
                autoApproveCompliantReportsSubtitle: 'Legen Sie fest, welche Spesenabrechnungen für die automatische Genehmigung infrage kommen.',
                autoApproveReportsUnderTitle: 'Berichte automatisch genehmigen unter',
                autoApproveReportsUnderDescription: 'Vollständig konforme Spesenabrechnungen unter diesem Betrag werden automatisch genehmigt.',
                randomReportAuditTitle: 'Zufällige Prüfungsberichte',
                randomReportAuditDescription: 'Verlangen, dass einige Berichte manuell genehmigt werden, selbst wenn sie für die automatische Genehmigung infrage kommen.',
                autoPayApprovedReportsTitle: 'Genehmigte Berichte automatisch bezahlen',
                autoPayApprovedReportsSubtitle: 'Legen Sie fest, welche Spesenabrechnungen für die automatische Bezahlung infrage kommen.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Bitte gib einen Betrag ein, der kleiner ist als ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle: 'Gehe zu „Weitere Funktionen“ und aktiviere „Workflows“, dann füge „Zahlungen“ hinzu, um diese Funktion freizuschalten.',
                autoPayReportsUnderTitle: 'Berichte automatisch begleichen unter',
                autoPayReportsUnderDescription: 'Vollständig konforme Spesenabrechnungen unter diesem Betrag werden automatisch bezahlt.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `${featureName} hinzufügen, um diese Funktion freizuschalten.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Gehe zu [weitere Funktionen](${moreFeaturesLink}) und aktiviere ${featureName}, um diese Funktion freizuschalten.`,
            },
            merchantRules: {
                title: 'Händler',
                subtitle: 'Lege Händlerrichtlinien fest, damit Ausgaben korrekt codiert ankommen und weniger Nacharbeit erfordern.',
                addRule: 'Händlerregel hinzufügen',
                addRuleTitle: 'Regel hinzufügen',
                editRuleTitle: 'Regel bearbeiten',
                expensesWith: 'Für Ausgaben mit:',
                expensesExactlyMatching: 'Für Ausgaben mit genau folgender Übereinstimmung:',
                applyUpdates: 'Diese Aktualisierungen anwenden:',
                saveRule: 'Regel speichern',
                previewMatches: 'Übereinstimmungen anzeigen',
                confirmError: 'Gib den Händler ein und nimm mindestens eine Änderung vor',
                confirmErrorMerchant: 'Bitte Händler eingeben',
                confirmErrorUpdate: 'Bitte mindestens eine Aktualisierung anwenden',
                previewMatchesEmptyStateTitle: 'Nichts anzuzeigen',
                previewMatchesEmptyStateSubtitle: 'Keine nicht eingereichten Ausgaben entsprechen dieser Regel.',
                deleteRule: 'Regel löschen',
                deleteRuleConfirmation: 'Sind Sie sicher, dass Sie diese Regel löschen möchten?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `Wenn Händler ${isExactMatch ? 'entspricht genau' : 'enthält'} „${merchantName}“`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Händler in „${merchantName}“ umbenennen`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `${fieldName} auf „${fieldValue}“ aktualisieren`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Als „${reimbursable ? 'erstattungsfähig' : 'nicht erstattungsfähig'}“ markieren`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Als „${billable ? 'fakturierbar' : 'nicht verrechenbar'}“ markieren`,
                matchType: 'Übereinstimmungstyp',
                matchTypeContains: 'Enthält',
                matchTypeExact: 'Exakte Übereinstimmung',
                duplicateRuleTitle: 'Ähnliche Händlerregel existiert bereits',
                duplicateRulePrompt: (merchantName: string) => `Möchtest du eine neue Regel für „${merchantName}“ speichern, obwohl bereits eine existiert?`,
                saveAnyway: 'Trotzdem speichern',
                applyToExistingUnsubmittedExpenses: 'Auf vorhandene, noch nicht eingereichte Ausgaben anwenden',
            },
            categoryRules: {
                title: 'Kategorienregeln',
                approver: 'Genehmigende Person',
                requireDescription: 'Beschreibung erforderlich',
                requireFields: 'Pflichtfelder',
                requiredFieldsTitle: 'Pflichtfelder',
                requiredFieldsDescription: (categoryName: string) => `Dies gilt für alle Ausgaben, die als <strong>${categoryName}</strong> kategorisiert sind.`,
                requireAttendees: 'Teilnehmende verpflichtend machen',
                descriptionHint: 'Beschreibungshinweis',
                descriptionHintDescription: (categoryName: string) =>
                    `Mitarbeitende daran erinnern, zusätzliche Informationen zu Ausgaben der Kategorie „${categoryName}“ anzugeben. Dieser Hinweis erscheint im Beschreibungsfeld von Ausgaben.`,
                descriptionHintLabel: 'Hinweis',
                descriptionHintSubtitle: 'Profi-Tipp: Je kürzer, desto besser!',
                maxAmount: 'Maximalbetrag',
                flagAmountsOver: 'Beträge kennzeichnen über',
                flagAmountsOverDescription: (categoryName: string) => `Gilt für die Kategorie „${categoryName}“.`,
                flagAmountsOverSubtitle: 'Dies setzt den Höchstbetrag für alle Ausgaben außer Kraft.',
                expenseLimitTypes: {
                    expense: 'Einzelne Ausgabe',
                    expenseSubtitle: 'Kennzeichne Spesenbeträge nach Kategorie. Diese Regel überschreibt die allgemeine Workspace-Regel für den maximalen Spesenbetrag.',
                    daily: 'Kategoriesumme',
                    dailySubtitle: 'Gesamtausgaben pro Tag und Kategorie für jeden Spesenbericht markieren.',
                },
                requireReceiptsOver: 'Belege erforderlich über',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standard`,
                    never: 'Belege nie erforderlich',
                    always: 'Belege immer erforderlich',
                },
                requireItemizedReceiptsOver: 'Aufschlüsselung von Belegen erforderlich über',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standard`,
                    never: 'Niemals Einzelbelege verlangen',
                    always: 'Immer Einzelbelege verlangen',
                },
                defaultTaxRate: 'Standardsteuersatz',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Gehe zu [Weitere Funktionen](${moreFeaturesLink}) und aktiviere Workflows, dann füge Genehmigungen hinzu, um diese Funktion freizuschalten.`,
            },
            customRules: {
                title: 'Spesenrichtlinie',
                cardSubtitle: 'Hier befindet sich die Spesenrichtlinie deines Teams, damit alle genau wissen, was abgedeckt ist.',
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
                    description: 'Für Unternehmen mit erweiterten Anforderungen.',
                },
            },
            description: 'Wählen Sie den passenden Tarif für sich. Eine ausführliche Liste mit Funktionen und Preisen finden Sie in unserem',
            subscriptionLink: 'Hilfeseite zu Plantypen und Preisen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Sie haben sich bis zum Ende Ihres Jahresabonnements am ${annualSubscriptionEndDate} zu 1 aktivem Mitglied im Control-Tarif verpflichtet. Sie können ab dem ${annualSubscriptionEndDate} zu einem nutzungsbasierten Abonnement wechseln und zum Collect-Tarif herabstufen, indem Sie die automatische Verlängerung in отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление отключить автообновление`,
                other: `Sie haben sich bis zum Ende Ihres Jahresabonnements am ${annualSubscriptionEndDate} zu ${count} aktiven Mitgliedern im Control-Tarif verpflichtet. Sie können ab dem ${annualSubscriptionEndDate} zu einem nutzungsbasierten Abonnement wechseln und auf den Collect-Tarif herabstufen, indem Sie die automatische Verlängerung deaktivieren in`,
            }),
            subscriptions: 'Abonnements',
        },
    },
    getAssistancePage: {
        title: 'Hilfe erhalten',
        subtitle: 'Wir sind hier, um dir den Weg zur Großartigkeit zu ebnen!',
        description: 'Wählen Sie eine der folgenden Supportoptionen aus:',
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
        publicDescription: 'Jede*r kann diesen Raum finden',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Jede*r kann diesen Raum finden',
        createRoom: 'Raum erstellen',
        roomAlreadyExistsError: 'Ein Raum mit diesem Namen existiert bereits',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} ist ein Standardraum in allen Arbeitsbereichen. Bitte wähle einen anderen Namen.`,
        roomNameInvalidError: 'Raumnamen dürfen nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
        pleaseEnterRoomName: 'Bitte gib einen Raumnamen ein',
        pleaseSelectWorkspace: 'Bitte wähle einen Arbeitsbereich aus',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}in „${newName}“ umbenannt (zuvor „${oldName}“)` : `${actor}hat diesen Raum in „${newName}“ umbenannt (vorher „${oldName}“)`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Raum in ${newName} umbenannt`,
        social: 'Sozial',
        selectAWorkspace: 'Wähle einen Workspace',
        growlMessageOnRenameError: 'Arbeitsbereichsraum kann nicht umbenannt werden. Bitte überprüfe deine Verbindung und versuche es erneut.',
        visibilityOptions: {
            restricted: 'Workspace', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privat',
            public: 'Öffentlich',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Öffentliche Ankündigung',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Einreichen und schließen',
        submitAndApprove: 'Einreichen und Genehmigen',
        advanced: 'ERWEITERT',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `das Standardgeschäftskonto auf „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}“ festlegen`,
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
            `hat ${approverName} (${approverEmail}) als Genehmiger:in für das Feld ${field} „${name}“ hinzugefügt`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `${approverName} (${approverEmail}) als Genehmiger:in für das Feld ${field} „${name}“ entfernt`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `hat die/den Genehmiger:in für ${field} „${name}“ in ${formatApprover(newApproverName, newApproverEmail)} geändert (zuvor ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `hat die Kategorie „${categoryName}“ hinzugefügt`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `hat die Kategorie „${categoryName}“ entfernt`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'deaktiviert' : 'aktiviert'} die Kategorie „${categoryName}“`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `hat den Lohnabrechnungscode „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`;
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
                return `hat den Sachkontencode „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
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
                return `hat den Maximalbetrag ${oldAmount} aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `hat den Maximalbetrag der Kategorie „${categoryName}“ auf ${newAmount} geändert (zuvor ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `hat einen Limittyp von ${newValue} zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            return `hat den Limittyp der Kategorie „${categoryName}“ auf ${newValue} geändert (zuvor ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `hat die Kategorie „${categoryName}“ aktualisiert, indem Belege in ${newValue} geändert wurden`;
            }
            return `hat die Kategorie „${categoryName}“ in ${newValue} geändert (zuvor ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `hat die Kategorie „${categoryName}“ aktualisiert, indem „Aufgeschlüsselte Belege“ in ${newValue} geändert wurde`;
            }
            return `hat die Kategorie „${categoryName}“ für aufgeschlüsselte Belege auf ${newValue} geändert (zuvor ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `hat die Kategorie „${oldName}“ in „${newName}“ umbenannt`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `hat den Beschreibungshinweis „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return !oldValue
                ? `hat den Beschreibungshinweis „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`
                : `hat den Beschreibungshinweis der Kategorie „${categoryName}“ in „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `hat den Schlagwortlisten-Namen in „${newName}“ geändert (zuvor „${oldName}“)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `das Tag „${tagName}“ zur Liste „${tagListName}“ hinzugefügt`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) =>
            `hat die Schlagwortliste „${tagListName}“ aktualisiert, indem das Schlagwort „${oldName}“ in „${newName}“ geändert wurde`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'aktiviert' : 'deaktiviert'} das Tag „${tagName}“ in der Liste „${tagListName}“`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `hat das Tag „${tagName}“ aus der Liste „${tagListName}“ entfernt`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `„${count}“ Tags aus der Liste „${tagListName}“ entfernt`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `hat das Tag „${tagName}“ in der Liste „${tagListName}“ aktualisiert, indem ${updatedField} auf „${newValue}“ geändert wurde (zuvor „${oldValue}“)`;
            }
            return `hat das Tag „${tagName}“ in der Liste „${tagListName}“ aktualisiert, indem ein(e) ${updatedField} mit dem Wert „${newValue}“ hinzugefügt wurde`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `hat ${updatedField} von ${customUnitName} auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'aktiviert' : 'deaktiviert'} Steuerverfolgung bei Entfernungsraten`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `hat einen neuen „${customUnitName}“-Satz „${rateName}“ hinzugefügt`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `hat den Satz des/der ${customUnitName} ${updatedField} „${customUnitRateName}“ auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `hat den Steuersatz für den Entfernungs­satz „${customUnitRateName}“ auf „${newValue} (${newTaxPercentage})“ geändert (zuvor „${oldValue} (${oldTaxPercentage})“)`;
            }
            return `hat den Steuersatz „${newValue} (${newTaxPercentage})“ zum Entfernungssatz „${customUnitRateName}“ hinzugefügt`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `hat den steuerlich erstattungsfähigen Anteil am Distanzsatz „${customUnitRateName}“ auf „${newValue}“ geändert (zuvor „${oldValue}“)`;
            }
            return `hat einen steuererstattungsfähigen Anteil von „${newValue}“ zum Entfernungssatz „${customUnitRateName} hinzugefügt`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? 'aktiviert' : 'deaktiviert'} den ${customUnitName}-Satz „${customUnitRateName}“`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `hat den „${customUnitName}“-Tarif „${rateName}“ entfernt`,
        addedReportField: (fieldType: string, fieldName?: string) => `${fieldType}-Berichtsfeld „${fieldName}“ hinzugefügt`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `den Standardwert des Berichtsfelds „${fieldName}“ auf „${defaultValue}“ festlegen`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `hat die Option „${optionName}“ zum Berichtsfeld „${fieldName}“ hinzugefügt`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `hat die Option „${optionName}“ aus dem Berichtsfeld „${fieldName}“ entfernt`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'aktiviert' : 'deaktiviert'} die Option „${optionName}“ für das Berichts­feld „${fieldName}“`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'aktiviert' : 'deaktiviert'} alle Optionen für das Berichtsfeld „${fieldName}“`;
            }
            return `${allEnabled ? 'aktiviert' : 'deaktiviert'} die Option „${optionName}“ für das Berichtsfeld „${fieldName}“ und macht damit alle Optionen ${allEnabled ? 'aktiviert' : 'deaktiviert'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `hat Berichts-Feld ${fieldType} „${fieldName}“ entfernt`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `„Selbstgenehmigung verhindern“ auf „${newValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}“ aktualisiert (zuvor „${oldValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}“)`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `das monatliche Berichtsübermittlungsdatum auf „${newValue}“ festlegen`;
            }
            return `hat das Einreichungsdatum des Monatsberichts auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `„Spesen Kunden erneut in Rechnung stellen“ wurde auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `„Bargeldausgabe-Standard“ auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `hat „Standardberichtetitel erzwingen“ aktiviert ${value ? 'an' : 'Aus'}`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `hat die benutzerdefinierte Berichtsnamensformel in „${newValue}“ geändert (zuvor „${oldValue}“)`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `den Namen dieses Arbeitsbereichs in „${newName}“ geändert (zuvor „${oldName}“)`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `Lege die Beschreibung dieses Arbeitsbereichs auf „${newDescription}“ fest`
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
                one: `hat dich aus dem Genehmigungsworkflow und dem Ausgaben-Chat von ${joinedNames} entfernt. Zuvor eingereichte Berichte bleiben zur Genehmigung in deinem Posteingang verfügbar.`,
                other: `hat dich aus den Genehmigungs-Workflows und Spesen-Chats von ${joinedNames} entfernt. Bereits eingereichte Berichte bleiben in deinem Posteingang zur Genehmigung verfügbar.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `hat Ihre Rolle in ${policyName} von ${oldRole} zu Nutzer aktualisiert. Sie wurden aus allen Spesen-Chats von Einreichenden entfernt, außer aus Ihren eigenen.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `hat die Standardwährung auf ${newCurrency} aktualisiert (zuvor ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `hat die automatische Berichtshäufigkeit auf „${newFrequency}“ aktualisiert (zuvor „${oldFrequency}“)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `hat den Genehmigungsmodus auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        upgradedWorkspace: 'hat diesen Arbeitsbereich auf den Control-Tarif hochgestuft',
        forcedCorporateUpgrade: `Dieser Workspace wurde auf den Control-Tarif hochgestuft. Klicken Sie <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">hier</a> für weitere Informationen.`,
        downgradedWorkspace: 'hat diesen Workspace auf den Collect-Tarif herabgestuft',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `hat die Quote der Berichte, die zufällig zur manuellen Genehmigung weitergeleitet werden, auf ${Math.round(newAuditRate * 100)}% geändert (zuvor ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `hat das manuelle Genehmigungslimit für alle Ausgaben auf ${newLimit} geändert (zuvor ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Kategorien`;
                case 'tags':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Stichwörter`;
                case 'workflows':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Workflows`;
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
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Tagespauschale`;
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
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? 'aktiviert' : 'deaktiviert'} automatisch zu zahlende genehmigte Berichte`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `setze den Schwellenwert für automatisch bezahlte genehmigte Berichte auf „${newLimit}“`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `hat den Schwellenwert für automatisch bezahlte genehmigte Berichte auf „${newLimit}“ geändert (zuvor „${oldLimit}“)`,
        removedAutoPayApprovedReportsLimit: 'hat den Schwellenwert für automatisch zu zahlende genehmigte Berichte entfernt',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `Standardgenehmigenden in ${newApprover} geändert (zuvor ${previousApprover})` : `Standardgenehmiger in ${newApprover} geändert`,
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
            let text = `den Genehmigungsworkflow für ${members} geändert, damit Berichte an ${approver} eingereicht werden`;
            if (wasDefaultApprover && previousApprover) {
                text += `(zuvor Standardgenehmiger ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(zuvor Standardgenehmigende*r)';
            } else if (previousApprover) {
                text += `(vorher ${previousApprover})`;
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
                ? `hat den Genehmigungs-Workflow für ${members} geändert, sodass diese Berichte an den Standardgenehmiger ${approver} einreichen`
                : `hat den Genehmigungsworkflow für ${members} geändert, damit Berichte an die Standardgenehmiger:in eingereicht werden`;
            if (wasDefaultApprover && previousApprover) {
                text += `(zuvor Standardgenehmiger ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(zuvor Standardgenehmigende*r)';
            } else if (previousApprover) {
                text += `(vorher ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `hat den Genehmigungsworkflow für ${approver} geändert, um genehmigte Berichte an ${forwardsTo} weiterzuleiten (zuvor weitergeleitet an ${previousForwardsTo})`
                : `hat den Genehmigungs-Workflow für ${approver} geändert, um genehmigte Berichte an ${forwardsTo} weiterzuleiten (zuvor abschließend genehmigte Berichte)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `den Genehmigungsworkflow für ${approver} so geändert, dass genehmigte Berichte nicht mehr weitergeleitet werden (zuvor weitergeleitet an ${previousForwardsTo})`
                : `den Genehmigungsworkflow für ${approver} geändert, sodass genehmigte Berichte nicht mehr weitergeleitet werden`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `hat den Firmennamen der Rechnung in „${newValue}“ geändert (zuvor „${oldValue}“)` : `den Rechnungsfirmennamen auf „${newValue}“ setzen`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `hat die Firmenwebsite der Rechnung in „${newValue}“ geändert (zuvor „${oldValue}“)` : `Firmenwebsite der Rechnung auf „${newValue}“ festgelegt`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser
                ? `hat den autorisierten Zahler in „${newReimburser}“ geändert (zuvor „${previousReimburser}“)`
                : `hat die autorisierte zahlende Person in „${newReimburser}“ geändert`,
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
                    return `hat den Steuerschlüssel für „${taxName}“ von „${oldValue}“ in „${newValue}“ geändert`;
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
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `Beleg erforderlichen Betrag auf „${newValue}“ festlegen`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `Belegpflichtbetrag auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `erforderlichen Belegbetrag entfernt (zuvor „${oldValue}“)`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `Maximalen Ausgabenbetrag auf „${newValue}“ festlegen`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximalen Ausgabenbetrag auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `Maximalausgabenbetrag entfernt (zuvor „${oldValue}“)`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximales Spesenalter auf „${newValue}“ Tage festlegen`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximales Ausgabenalter auf „${newValue}“ Tage geändert (zuvor „${oldValue}“)`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximales Ausgabenalter entfernt (zuvor „${oldValue}“ Tage)`,
    },
    roomMembersPage: {
        memberNotFound: 'Mitglied nicht gefunden.',
        useInviteButton: 'Um ein neues Mitglied zum Chat einzuladen, verwende bitte die Einladen-Schaltfläche oben.',
        notAuthorized: `Du hast keinen Zugriff auf diese Seite. Wenn du versuchst, diesem Raum beizutreten, bitte einfach ein Mitglied des Raums, dich hinzuzufügen. Etwas anderes? Wende dich an ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Anscheinend wurde dieser Raum archiviert. Bei Fragen wende dich an ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Möchtest du ${memberName} wirklich aus dem Raum entfernen?`,
            other: 'Möchtest du die ausgewählten Mitglieder wirklich aus dem Raum entfernen?',
        }),
        error: {
            genericAdd: 'Beim Hinzufügen dieses Raum-Mitglieds ist ein Problem aufgetreten',
        },
    },
    newTaskPage: {
        assignTask: 'Aufgabe zuweisen',
        assignMe: 'Mir zuweisen',
        confirmTask: 'Aufgabe bestätigen',
        confirmError: 'Bitte gib einen Titel ein und wähle ein Freigabeziel aus',
        descriptionOptional: 'Beschreibung (optional)',
        pleaseEnterTaskName: 'Bitte gib einen Titel ein',
        pleaseEnterTaskDestination: 'Bitte wähle aus, wo du diese Aufgabe teilen möchtest',
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
            completed: 'als abgeschlossen markiert',
            canceled: 'gelöschte Aufgabe',
            reopened: 'als unvollständig markiert',
            error: 'Sie haben keine Berechtigung, die angeforderte Aktion auszuführen',
        },
        markAsComplete: 'Als erledigt markieren',
        markAsIncomplete: 'Als unvollständig markieren',
        assigneeError: 'Beim Zuweisen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie eine andere zuweisende Person.',
        genericCreateTaskFailureMessage: 'Beim Erstellen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuche es später noch einmal.',
        deleteTask: 'Aufgabe löschen',
        deleteConfirmation: 'Sind Sie sicher, dass Sie diese Aufgabe löschen möchten?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Abrechnung ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Tastenkombinationen',
        subtitle: 'Sparen Sie Zeit mit diesen praktischen Tastaturkürzeln:',
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
                subtitle: `Versuche, deine Suchkriterien anzupassen oder etwas mit der +‑Schaltfläche zu erstellen.`,
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
                    Du hast noch keine Rechnungen erstellt
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
        groupColumns: 'Gruppenspalten',
        expenseColumns: 'Ausgabenspalten',
        statements: 'Kontoauszüge',
        unapprovedCash: 'Nicht genehmigtes Bargeld',
        unapprovedCard: 'Nicht genehmigte Karte',
        reconciliation: 'Abstimmung',
        topSpenders: 'Top-Ausgaben',
        saveSearch: 'Suche speichern',
        deleteSavedSearch: 'Gespeicherte Suche löschen',
        deleteSavedSearchConfirm: 'Möchtest du diese Suche wirklich löschen?',
        searchName: 'Namen suchen',
        savedSearchesMenuItemTitle: 'Gespeichert',
        topCategories: 'Topkategorien',
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
                before: (date?: string) => `Vor dem ${date ?? ''}`,
                after: (date?: string) => `Nach ${date ?? ''}`,
                on: (date?: string) => `Am ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Nie',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Letzter Monat',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Diesen Monat',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: 'Seit Jahresbeginn',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Letzte Abrechnung',
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
                individualCards: 'Einzelne Karten',
                closedCards: 'Geschlossene Karten',
                cardFeeds: 'Karten-Feeds',
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
            bar: 'Leiste',
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
            [CONST.SEARCH.GROUP_BY.QUARTER]: 'Quartale',
        },
        moneyRequestReport: {
            emptyStateTitle: 'Dieser Bericht enthält keine Ausgaben.',
            accessPlaceHolder: 'Für Details öffnen',
        },
        noCategory: 'Keine Kategorie',
        noMerchant: 'Kein Händler',
        noTag: 'Kein Tag',
        expenseType: 'Ausgabentyp',
        withdrawalType: 'Auszahlungsart',
        recentSearches: 'Letzte Suchanfragen',
        recentChats: 'Letzte Chats',
        searchIn: 'Suchen in',
        searchPlaceholder: 'Nach etwas suchen',
        suggestions: 'Vorschläge',
        exportSearchResults: {
            title: 'Export erstellen',
            description: 'Wow, das sind aber viele Einträge! Wir packen sie zusammen und Concierge schickt dir in Kürze eine Datei.',
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
            helpTextMobile: 'Bitte schließe und öffne die App erneut oder wechsle zu',
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
                'Überprüfe deinen Fotos- oder Downloads-Ordner auf eine Kopie deines QR-Codes. Profi-Tipp: Füge ihn einer Präsentation hinzu, damit dein Publikum ihn scannen und direkt mit dir in Kontakt treten kann.',
        },
        generalError: {
            title: 'Anhangfehler',
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
        failedError: ({link}: {link: string}) => `Wir versuchen diese Abrechnung erneut, sobald du dein Konto <a href="${link}">entsperrst</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • Auszahlungs-ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Berichts-Layout',
        groupByLabel: 'Gruppieren nach:',
        selectGroupByOption: 'Wählen Sie aus, wie Berichtsausgaben gruppiert werden sollen',
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
            chooseWorkspace: 'Wähle einen Workspace für diesen Bericht.',
            emptyReportConfirmationTitle: 'Sie haben bereits einen leeren Bericht',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Möchtest du wirklich einen weiteren Bericht in ${workspaceName} erstellen? Du kannst auf deine leeren Berichte zugreifen in`,
            emptyReportConfirmationPromptLink: 'Berichte',
            emptyReportConfirmationDontShowAgain: 'Zeig mir das nicht mehr an',
            genericWorkspaceName: 'dieser Workspace',
        },
        genericCreateReportFailureMessage: 'Unerwarteter Fehler beim Erstellen dieses Chats. Bitte versuche es später noch einmal.',
        genericAddCommentFailureMessage: 'Unerwarteter Fehler beim Veröffentlichen des Kommentars. Bitte versuchen Sie es später erneut.',
        genericUpdateReportFieldFailureMessage: 'Unerwarteter Fehler beim Aktualisieren des Feldes. Bitte versuche es später noch einmal.',
        genericUpdateReportNameEditFailureMessage: 'Unerwarteter Fehler beim Umbenennen des Berichts. Bitte versuchen Sie es später erneut.',
        noActivityYet: 'Noch keine Aktivitäten',
        connectionSettings: 'Verbindungseinstellungen',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `${fieldName} auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `setze ${fieldName} auf „${newValue}“`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `hat den Workspace geändert${fromPolicyName ? `(zuvor ${fromPolicyName})` : ''}`;
                    }
                    return `hat den Workspace in ${toPolicyName}${fromPolicyName ? `(zuvor ${fromPolicyName})` : ''} geändert`;
                },
                changeType: (oldType: string, newType: string) => `Typ von ${oldType} zu ${newType} geändert`,
                exportedToCSV: `in CSV exportiert`,
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
                    pending: (label: string) => `hat begonnen, diesen Bericht nach ${label} zu exportieren ...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `Export dieses Berichts nach ${label} fehlgeschlagen („${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}“)`,
                managerAttachReceipt: `hat eine Quittung hinzugefügt`,
                managerDetachReceipt: `hat einen Beleg entfernt`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `${currency}${amount} anderweitig bezahlt`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `${currency}${amount} über Integration bezahlt`,
                outdatedBankAccount: `Die Zahlung konnte aufgrund eines Problems mit dem Bankkonto des Zahlenden nicht verarbeitet werden`,
                reimbursementACHBounce: `Die Zahlung konnte aufgrund eines Bankkontoproblems nicht verarbeitet werden`,
                reimbursementACHCancelled: `hat die Zahlung storniert`,
                reimbursementAccountChanged: `Die Zahlung konnte nicht verarbeitet werden, da der Zahlende die Bankverbindung geändert hat.`,
                reimbursementDelayed: `hat die Zahlung verarbeitet, aber sie verzögert sich um 1–2 weitere Werktage`,
                selectedForRandomAudit: `zufällig zur Überprüfung ausgewählt`,
                selectedForRandomAuditMarkdown: `[zufällig ausgewählt](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) zur Überprüfung`,
                share: ({to}: ShareParams) => `Mitglied ${to} eingeladen`,
                unshare: ({to}: UnshareParams) => `Mitglied ${to} entfernt`,
                stripePaid: ({amount, currency}: StripePaidParams) => `bezahlt ${amount}${currency}`,
                takeControl: `hat die Kontrolle übernommen`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `Beim Synchronisieren mit ${label}${errorMessage ? ` ("${errorMessage}")` : ''} ist ein Problem aufgetreten. Bitte behebe das Problem in den <a href="${workspaceAccountingLink}">Workspace-Einstellungen</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `Die Verbindung zu ${feedName} ist unterbrochen. Um Kartenimporte wiederherzustellen, <a href='${workspaceCompanyCardRoute}'>melde dich bei deiner Bank an</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `Die Plaid-Verbindung zu Ihrem Geschäftskonto ist unterbrochen. Bitte <a href='${walletRoute}'>verbinden Sie Ihr Bankkonto ${maskedAccountNumber} erneut</a>, damit Sie Ihre Expensify Cards weiter verwenden können.`,
                addEmployee: (email: string, role: string) => `${email} als ${role === 'member' ? 'a' : 'an'} ${role} hinzugefügt`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `hat die Rolle von ${email} auf ${newRole} aktualisiert (zuvor ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `benutzerdefiniertes Feld 1 von ${email} entfernt (zuvor „${previousValue}“)`;
                    }
                    return !previousValue
                        ? `„${newValue}“ zu benutzerdefiniertem Feld 1 von ${email} hinzugefügt`
                        : `hat benutzerdefiniertes Feld 1 von ${email} auf „${newValue}“ geändert (zuvor „${previousValue}“)`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `benutzerdefiniertes Feld 2 von ${email} entfernt (vorher „${previousValue}“)`;
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
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `Das Geschäftskonto ${maskedBankAccountNumber} wurde aufgrund eines Problems mit entweder der Erstattung oder dem Ausgleich der Expensify Card automatisch gesperrt. Bitte behebe das Problem in deinen <a href="${linkURL}">Workspace-Einstellungen</a>.`,
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
        spendManagement: 'Ausgabenmanagement',
        expenseReports: 'Spesenberichte',
        companyCreditCard: 'Firmenkreditkarte',
        receiptScanningApp: 'Belegscanner-App',
        billPay: 'Rechnungszahlung',
        invoicing: 'Rechnungsstellung',
        CPACard: 'CPA-Karte',
        payroll: 'Lohnabrechnung',
        travel: 'Reisen',
        resources: 'Ressourcen',
        expensifyApproved: 'Von Expensify genehmigt!',
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
        newMessageLineIndicator: 'Kennzeichnung für neue Nachrichtenzeile',
        chatMessage: 'Chatnachricht',
        lastChatMessagePreview: 'Vorschau der letzten Chatnachricht',
        workspaceName: 'Workspace-Name',
        chatUserDisplayNames: 'Anzeigename des Chat-Mitglieds',
        scrollToNewestMessages: 'Zum neuesten Beitrag scrollen',
        preStyledText: 'Vorgestylter Text',
        viewAttachment: 'Anhang anzeigen',
    },
    parentReportAction: {
        deletedReport: 'Gelöschter Bericht',
        deletedMessage: 'Gelöschte Nachricht',
        deletedExpense: 'Gelöschter Beleg',
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
        flagDescription: 'Alle markierten Nachrichten werden zur Überprüfung an eine Moderation gesendet.',
        chooseAReason: 'Wähle unten einen Grund zum Melden aus:',
        spam: 'Spam',
        spamDescription: 'Unaufgeforderte themenfremde Werbung',
        inconsiderate: 'Rücksichtslos',
        inconsiderateDescription: 'Beleidigende oder respektlose Formulierungen mit fragwürdigen Absichten',
        intimidation: 'Einschüchterung',
        intimidationDescription: 'Eine Agenda trotz berechtigter Einwände aggressiv vorantreiben',
        bullying: 'Mobbing',
        bullyingDescription: 'Gezielte Einflussnahme auf eine Person, um Gehorsam zu erreichen',
        harassment: 'Belästigung',
        harassmentDescription: 'Rassistisches, misogynes oder anderweitig stark diskriminierendes Verhalten',
        assault: 'Angriff',
        assaultDescription: 'Gezielter emotionaler Angriff mit der Absicht, Schaden zuzufügen',
        flaggedContent: 'Diese Nachricht wurde als Verstoß gegen unsere Gemeinschaftsregeln markiert und der Inhalt wurde ausgeblendet.',
        hideMessage: 'Nachricht ausblenden',
        revealMessage: 'Nachricht anzeigen',
        levelOneResult: 'Sendet eine anonyme Warnung und die Nachricht wird zur Überprüfung gemeldet.',
        levelTwoResult: 'Nachricht im Kanal verborgen, anonyme Verwarnung hinzugefügt und Nachricht zur Überprüfung gemeldet.',
        levelThreeResult: 'Nachricht aus dem Kanal entfernt, anonyme Verwarnung gesendet und Nachricht zur Überprüfung gemeldet.',
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
        share: 'Mit meinem Buchhalter teilen',
        nothing: 'Im Moment nichts',
    },
    teachersUnitePage: {
        teachersUnite: 'Lehrkräfte vereint',
        joinExpensifyOrg:
            'Schließe dich Expensify.org an, um Ungerechtigkeit auf der ganzen Welt zu beseitigen. Die aktuelle Kampagne „Teachers Unite“ unterstützt Lehrkräfte überall, indem sie die Kosten für wichtige Schulmaterialien aufteilt.',
        iKnowATeacher: 'Ich kenne eine Lehrkraft',
        iAmATeacher: 'Ich bin Lehrer',
        getInTouch: 'Ausgezeichnet! Bitte teilen Sie ihre Kontaktdaten, damit wir sie erreichen können.',
        introSchoolPrincipal: 'Einführung für Ihre Schulleitung',
        schoolPrincipalVerifyExpense:
            'Expensify.org teilt die Kosten für grundlegende Schulmaterialien, damit Schüler*innen aus Haushalten mit geringem Einkommen besser lernen können. Ihre Schulleitung wird gebeten, Ihre Ausgaben zu bestätigen.',
        principalFirstName: 'Vorname der verantwortlichen Person',
        principalLastName: 'Nachname der Hauptansprechperson',
        principalWorkEmail: 'Hauptgeschäftliche E-Mail-Adresse',
        updateYourEmail: 'Aktualisiere deine E‑Mail-Adresse',
        updateEmail: 'E-Mail-Adresse aktualisieren',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Bevor du fortfährst, stelle bitte sicher, dass deine Schul-E-Mail als Standardkontaktmethode festgelegt ist. Du kannst dies unter Einstellungen > Profil > <a href="${contactMethodsRoute}">Kontaktmethoden</a> tun.`,
        error: {
            enterPhoneEmail: 'Gib eine gültige E‑Mail-Adresse oder Telefonnummer ein',
            enterEmail: 'E-Mail-Adresse eingeben',
            enterValidEmail: 'Gib eine gültige E-Mail-Adresse ein',
            tryDifferentEmail: 'Bitte versuche eine andere E-Mail-Adresse',
        },
    },
    cardTransactions: {
        notActivated: 'Nicht aktiviert',
        outOfPocket: 'Auslagen-Ausgaben',
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
        trackingDistance: 'Entfernung wird aufgezeichnet …',
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
            title: 'Entfernungserfassung verwerfen',
            prompt: 'Bist du sicher? Dadurch wird deine aktuelle Sitzung verworfen und dies kann nicht rückgängig gemacht werden.',
            confirm: 'Entfernungserfassung verwerfen',
        },
        zeroDistanceTripModal: {
            title: 'Ausgabe kann nicht erstellt werden',
            prompt: 'Sie können keine Ausgabe mit demselben Start- und Zielort erstellen.',
        },
        locationRequiredModal: {
            title: 'Standortzugriff erforderlich',
            prompt: 'Bitte erlaube den Standortzugriff in den Geräteeinstellungen, um die GPS-Distanzverfolgung zu starten.',
            allow: 'Zulassen',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Zugriff auf Standort im Hintergrund erforderlich',
            prompt: 'Bitte erlaube den Zugriff auf deinen Standort im Hintergrund in den Geräteeinstellungen (Option „Immer erlauben“), um die GPS-Distanzverfolgung zu starten.',
        },
        preciseLocationRequiredModal: {
            title: 'Genaue Position erforderlich',
            prompt: 'Bitte aktiviere „Genauer Standort“ in den Einstellungen deines Geräts, um die GPS-Distanzverfolgung zu starten.',
        },
        desktop: {
            title: 'Entfernung auf deinem Telefon erfassen',
            subtitle: 'Lege Meilen oder Kilometer automatisch per GPS zurück und verwandle Fahrten sofort in Spesen.',
            button: 'App herunterladen',
        },
        notification: {
            title: 'GPS-Tracking wird ausgeführt',
            body: 'Gehe zur App, um abzuschließen',
        },
        continueGpsTripModal: {
            title: 'GPS-Trip-Aufzeichnung fortsetzen?',
            prompt: 'Es sieht so aus, als ob die App während deiner letzten GPS-Fahrt geschlossen wurde. Möchtest du die Aufzeichnung dieser Fahrt fortsetzen?',
            confirm: 'Reise fortsetzen',
            cancel: 'Reise anzeigen',
        },
        signOutWarningTripInProgress: {
            title: 'GPS-Tracking wird ausgeführt',
            prompt: 'Möchtest du die Reise wirklich verwerfen und dich abmelden?',
            confirm: 'Verwerfen und abmelden',
        },
        locationServicesRequiredModal: {
            title: 'Standortzugriff erforderlich',
            confirm: 'Einstellungen öffnen',
            prompt: 'Bitte erlaube den Standortzugriff in den Geräteeinstellungen, um die GPS-Distanzverfolgung zu starten.',
        },
        fabGpsTripExplained: 'Zur GPS-Ansicht (Schwebende Aktion)',
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Zeugnis verloren oder beschädigt',
        nextButtonLabel: 'Weiter',
        reasonTitle: 'Warum benötigen Sie eine neue Karte?',
        cardDamaged: 'Meine Karte wurde beschädigt',
        cardLostOrStolen: 'Meine Karte wurde verloren oder gestohlen',
        confirmAddressTitle: 'Bitte bestätige die Postanschrift für deine neue Karte.',
        cardDamagedInfo: 'Ihre neue Karte kommt in 2–3 Werktagen an. Ihre aktuelle Karte funktioniert weiter, bis Sie Ihre neue Karte aktiviert haben.',
        cardLostOrStolenInfo: 'Ihre aktuelle Karte wird dauerhaft deaktiviert, sobald Ihre Bestellung aufgegeben wurde. Die meisten Karten kommen innerhalb weniger Werktage an.',
        address: 'Adresse',
        deactivateCardButton: 'Karte deaktivieren',
        shipNewCardButton: 'Neue Karte versenden',
        addressError: 'Adresse ist erforderlich',
        reasonError: 'Grund ist erforderlich',
        successTitle: 'Ihre neue Karte ist unterwegs!',
        successDescription: 'Sobald sie in ein paar Werktagen ankommt, musst du sie aktivieren. In der Zwischenzeit kannst du eine virtuelle Karte verwenden.',
    },
    eReceipt: {
        guaranteed: 'Garantierte eQuittung',
        transactionDate: 'Buchungsdatum',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Starte einen Chat, <success><strong>wirb eine:n Freund:in</strong></success>.',
            header: 'Chat starten, Freund*in empfehlen',
            body: 'Möchtest du, dass deine Freund*innen Expensify auch benutzen? Starte einfach einen Chat mit ihnen, und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Reiche eine Ausgabe ein, <success><strong>wirb dein Team an</strong></success>.',
            header: 'Reiche eine Ausgabe ein, empfehle dein Team',
            body: 'Möchtest du, dass dein Team Expensify auch nutzt? Reiche ihnen einfach eine Ausgabe ein, und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Freund/in empfehlen',
            body: 'Möchtest du, dass deine Freunde Expensify auch nutzen? Chatte einfach mit ihnen, bezahle oder teile eine Ausgabe, und wir kümmern uns um den Rest. Oder teile einfach deinen Einladungslink!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Freund/in empfehlen',
            header: 'Freund/in empfehlen',
            body: 'Möchtest du, dass deine Freunde Expensify auch nutzen? Chatte einfach mit ihnen, bezahle oder teile eine Ausgabe, und wir kümmern uns um den Rest. Oder teile einfach deinen Einladungslink!',
        },
        copyReferralLink: 'Einladungslink kopieren',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chatte mit deiner Setup-Spezialist:in in <a href="${href}">${adminReportName}</a>, um Hilfe zu erhalten`,
        default: `Sende eine Nachricht an <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link>, um Hilfe bei der Einrichtung zu erhalten`,
    },
    violations: {
        allTagLevelsRequired: 'Alle Tags erforderlich',
        autoReportedRejectedExpense: 'Diese Ausgabe wurde abgelehnt.',
        billableExpense: 'Abrechenbar nicht mehr gültig',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Beleg erforderlich${formattedLimit ? `über ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategorie nicht mehr gültig',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `${surcharge}% Umrechnungszuschlag angewendet`,
        customUnitOutOfPolicy: 'Satz für diesen Workspace ungültig',
        duplicatedTransaction: 'Mögliches Duplikat',
        fieldRequired: 'Berichts­felder sind erforderlich',
        futureDate: 'Zukünftiges Datum nicht zulässig',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Um ${invoiceMarkup}% verteuert`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Datum ist älter als ${maxAge} Tage`,
        missingCategory: 'Fehlende Kategorie',
        missingComment: 'Beschreibung für ausgewählte Kategorie erforderlich',
        missingAttendees: 'Für diese Kategorie sind mehrere Teilnehmende erforderlich',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Fehlende ${tagName ?? 'Tag'}`,
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
        nonExpensiworksExpense: 'Spesen außerhalb von Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Spesen überschreiten das automatische Genehmigungslimit von ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Betrag über dem Kategorienlimit von ${formattedLimit}/Person`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit}/Person`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über ${formattedLimit}/Reise-Limit`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit}/Person`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Betrag über dem täglichen Kategorienlimit von ${formattedLimit}/Person`,
        receiptNotSmartScanned: 'Beleg- und Ausgabendetails manuell hinzugefügt.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Beleg erforderlich, Kategoriegrenze von ${formattedLimit} überschritten`;
            }
            if (formattedLimit) {
                return `Beleg erforderlich über ${formattedLimit}`;
            }
            if (category) {
                return `Beleg erforderlich bei Überschreitung des Kategorienlimits`;
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
                        return `Nebenkosten im Hotel`;
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
                return 'Beleg kann wegen fehlerhafter Bankverbindung nicht automatisch zugeordnet werden';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Bankverbindung unterbrochen. <a href="${companyCardPageURL}">Erneut verbinden, um den Beleg abzugleichen</a>`
                    : 'Bankverbindung unterbrochen. Bitte Admin bitten, die Verbindung wiederherzustellen, um den Beleg abzugleichen.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Bitte ${member} darum, dies als Barzahlung zu markieren, oder warte 7 Tage und versuche es erneut` : 'Wartet auf Zusammenführung mit Kartentransaktion.';
            }
            return '';
        },
        brokenConnection530Error: 'Beleg ausstehend wegen unterbrochener Bankverbindung',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung. Bitte beheben Sie dies unter <a href="${workspaceCompanyCardRoute}">Firmenkarten</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung. Bitte bitte eine:n Workspace-Admin, dies zu beheben.',
        markAsCashToIgnore: 'Als Barzahlung markieren, um zu ignorieren und Zahlung anzufordern.',
        smartscanFailed: ({canEdit = true}) => `Belegerfassung fehlgeschlagen.${canEdit ? 'Details manuell eingeben.' : ''}`,
        receiptGeneratedWithAI: 'Mögliche KI-generierte Quittung',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Fehlende ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} nicht mehr gültig`,
        taxAmountChanged: 'Steuerbetrag wurde geändert',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Steuer'} ist nicht mehr gültig`,
        taxRateChanged: 'Steuersatz wurde geändert',
        taxRequired: 'Fehlender Steuersatz',
        none: 'Keine',
        taxCodeToKeep: 'Wähle aus, welcher Steuercode beibehalten werden soll',
        tagToKeep: 'Wähle, welches Tag beibehalten werden soll',
        isTransactionReimbursable: 'Wählen Sie, ob die Transaktion erstattungsfähig ist',
        merchantToKeep: 'Wähle, welchen Händler du behalten möchtest',
        descriptionToKeep: 'Wähle aus, welche Beschreibung beibehalten werden soll',
        categoryToKeep: 'Wähle aus, welche Kategorie beibehalten werden soll',
        isTransactionBillable: 'Wählen, ob die Transaktion verrechenbar ist',
        keepThisOne: 'Diesen behalten',
        confirmDetails: `Bestätige die Details, die du behältst`,
        confirmDuplicatesInfo: `Die Duplikate, die du nicht behältst, werden für die/den Einreichende*n zur Löschung zurückgehalten.`,
        hold: 'Diese Ausgabe wurde angehalten',
        resolvedDuplicates: 'hat das Duplikat gelöst',
        companyCardRequired: 'Firmenkartenkäufe erforderlich',
        noRoute: 'Bitte eine gültige Adresse auswählen',
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
            manual: 'hat das Duplikat gelöst',
        },
    },
    videoPlayer: {
        play: 'Abspielen',
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
            title: 'Bitte teilen Sie uns mit, warum Sie gehen',
            subtitle: 'Bevor du gehst, sag uns bitte, warum du zu Expensify Classic wechseln möchtest.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ich benötige eine Funktion, die nur in Expensify Classic verfügbar ist.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Ich verstehe nicht, wie ich New Expensify verwenden soll.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Ich verstehe, wie man das neue Expensify benutzt, aber ich bevorzuge Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Welche Funktion benötigst du, die in New Expensify nicht verfügbar ist?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Was möchten Sie tun?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Warum bevorzugst du Expensify Classic?',
        },
        responsePlaceholder: 'Ihre Antwort',
        thankYou: 'Danke für das Feedback!',
        thankYouSubtitle: 'Ihre Antworten helfen uns, ein besseres Produkt zu entwickeln, mit dem Sie Dinge erledigen können. Vielen Dank!',
        goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        offlineTitle: 'Sie scheinst hier festzustecken …',
        offline:
            'Sie scheinen offline zu sein. Leider funktioniert Expensify Classic nicht offline, aber das neue Expensify schon. Wenn Sie Expensify Classic bevorzugen, versuchen Sie es erneut, sobald Sie eine Internetverbindung haben.',
        quickTip: 'Kurzer Tipp ...',
        quickTipSubTitle: 'Du kannst direkt zu Expensify Classic gehen, indem du expensify.com besuchst. Setze ein Lesezeichen dafür, um eine einfache Abkürzung zu haben!',
        bookACall: 'Einen Anruf buchen',
        bookACallTitle: 'Möchtest du mit einem Produktmanager sprechen?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Direktes Chatten zu Ausgaben und Berichten',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Alles auf dem Handy erledigen',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Reise und Spesen in Chat-Geschwindigkeit',
        },
        bookACallTextTop: 'Wenn Sie zu Expensify Classic wechseln, entgehen Ihnen:',
        bookACallTextBottom:
            'Wir würden uns freuen, mit dir zu telefonieren, um die Gründe zu verstehen. Du kannst einen Anruf mit einem unserer leitenden Produktmanager buchen, um deine Anforderungen zu besprechen.',
        takeMeToExpensifyClassic: 'Bring mich zu Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Beim Laden weiterer Nachrichten ist ein Fehler aufgetreten',
        tryAgain: 'Versuch es noch einmal',
    },
    systemMessage: {
        mergedWithCashTransaction: 'hat eine Quittung mit dieser Transaktion abgeglichen',
    },
    subscription: {
        authenticatePaymentCard: 'Zahlungskarte authentifizieren',
        mobileReducedFunctionalityMessage: 'Sie können Ihr Abonnement in der mobilen App nicht ändern.',
        badge: {
            freeTrial: (numOfDays: number) => `Kostenlose Testversion: Noch ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'} übrig`,
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
                        ? `Ihre Belastung vom ${date} über ${purchaseAmountOwed} konnte nicht verarbeitet werden. Bitte fügen Sie eine Zahlungskarte hinzu, um den geschuldeten Betrag zu begleichen.`
                        : 'Bitte füge eine Zahlungskarte hinzu, um den ausstehenden Betrag zu begleichen.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Ihre Zahlungsinformationen sind veraltet',
                subtitle: (date: string) => `Ihre Zahlung ist überfällig. Bitte begleichen Sie Ihre Rechnung bis zum ${date}, um Unterbrechungen des Dienstes zu vermeiden.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Ihre Zahlungsinformationen sind veraltet',
                subtitle: 'Ihre Zahlung ist überfällig. Bitte begleichen Sie Ihre Rechnung.',
            },
            billingDisputePending: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `Sie haben die Belastung über ${amountOwed} für die Karte mit der Endziffer ${cardEnding} angefochten. Ihr Konto bleibt gesperrt, bis der Streitfall mit Ihrer Bank geklärt ist.`,
            },
            cardAuthenticationRequired: {
                title: 'Ihre Zahlungskarte wurde nicht vollständig authentifiziert.',
                subtitle: (cardEnding: string) => `Bitte schließen Sie den Authentifizierungsprozess ab, um Ihre Zahlungskarte mit der Endung ${cardEnding} zu aktivieren.`,
            },
            insufficientFunds: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: (amountOwed: number) =>
                    `Ihre Zahlungskarte wurde aufgrund unzureichender Deckung abgelehnt. Bitte versuchen Sie es erneut oder fügen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Saldo von ${amountOwed} zu begleichen.`,
            },
            cardExpired: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: (amountOwed: number) =>
                    `Ihre Zahlungskarte ist abgelaufen. Bitte fügen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Saldo von ${amountOwed} auszugleichen.`,
            },
            cardExpireSoon: {
                title: 'Ihre Karte läuft bald ab',
                subtitle:
                    'Ihre Zahlungskarte läuft Ende dieses Monats ab. Klicken Sie unten auf das Dreipunktmenü, um sie zu aktualisieren und alle Ihre Lieblingsfunktionen weiterhin zu nutzen.',
            },
            retryBillingSuccess: {
                title: 'Erfolg!',
                subtitle: 'Ihre Karte wurde erfolgreich belastet.',
            },
            retryBillingError: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle:
                    'Bevor du es erneut versuchst, rufe bitte direkt bei deiner Bank an, um Expensify‑Abbuchungen zu autorisieren und eventuelle Sperren aufzuheben. Andernfalls versuche, eine andere Zahlungskarte hinzuzufügen.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Sie haben die Belastung über ${amountOwed} für die Karte mit der Endziffer ${cardEnding} angefochten. Ihr Konto bleibt gesperrt, bis der Streitfall mit Ihrer Bank geklärt ist.`,
            preTrial: {
                title: 'Kostenlose Testversion starten',
                subtitle: 'Als nächsten Schritt <a href="#">führe deine Einrichtungs‑Checkliste aus</a>, damit dein Team mit dem Einreichen von Ausgaben beginnen kann.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Testversion: Noch ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'}!`,
                subtitle: 'Füge eine Zahlungsmethode hinzu, um weiterhin alle deine Lieblingsfunktionen nutzen zu können.',
            },
            trialEnded: {
                title: 'Ihre kostenlose Testphase ist abgelaufen',
                subtitle: 'Füge eine Zahlungsmethode hinzu, um weiterhin alle deine Lieblingsfunktionen nutzen zu können.',
            },
            earlyDiscount: {
                claimOffer: 'Angebot einlösen',
                subscriptionPageTitle: (discountType: number) =>
                    `<strong>${discountType}% Rabatt im ersten Jahr!</strong> Fügen Sie einfach eine Zahlungskarte hinzu und starten Sie ein Jahresabonnement.`,
                onboardingChatTitle: (discountType: number) => `Angebot für begrenzte Zeit: ${discountType}% Rabatt auf dein erstes Jahr!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) =>
                    `Beantrage innerhalb von ${days > 0 ? `${days}T :` : ''}${hours}Std : ${minutes}Min : ${seconds}Sek`,
            },
        },
        cardSection: {
            title: 'Zahlung',
            subtitle: 'Fügen Sie eine Karte hinzu, um Ihr Expensify-Abonnement zu bezahlen.',
            addCardButton: 'Zahlungskarte hinzufügen',
            cardInfo: (name: string, expiration: string, currency: string) => `Name: ${name}, Ablaufdatum: ${expiration}, Währung: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Ihr nächstes Zahlungsdatum ist ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Karte endet auf ${cardNumber}`,
            changeCard: 'Zahlungskarte ändern',
            changeCurrency: 'Zahlungswährung ändern',
            cardNotFound: 'Keine Zahlungskarte hinzugefügt',
            retryPaymentButton: 'Zahlung erneut versuchen',
            authenticatePayment: 'Zahlung authentifizieren',
            requestRefund: 'Rückerstattung anfordern',
            requestRefundModal: {
                full: 'Eine Rückerstattung zu erhalten ist ganz einfach: Stufen Sie Ihr Konto einfach vor Ihrem nächsten Abrechnungsdatum herab, und Sie erhalten eine Rückerstattung. <br /> <br /> Hinweis: Wenn Sie Ihr Konto herabstufen, werden Ihre Arbeitsbereiche gelöscht. Diese Aktion kann nicht rückgängig gemacht werden, aber Sie können jederzeit einen neuen Arbeitsbereich erstellen, wenn Sie es sich anders überlegen.',
                confirm: 'Arbeitsbereich(e) löschen und Downgrade durchführen',
            },
            viewPaymentHistory: 'Zahlungsverlauf anzeigen',
        },
        yourPlan: {
            title: 'Ihr Tarif',
            exploreAllPlans: 'Alle Tarife anzeigen',
            customPricing: 'Individuelle Preise',
            asLowAs: ({price}: YourPlanPriceValueParams) => `ab nur ${price} pro aktivem Mitglied/Monat`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied/Monat`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied und Monat`,
            perMemberMonth: 'pro Mitglied/Monat',
            collect: {
                title: 'Einsammeln',
                description: 'Der Kleinunternehmens-Tarif, der Ihnen Ausgaben, Reisen und Chat bietet.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                benefit1: 'Belegerfassung',
                benefit2: 'Erstattungen',
                benefit3: 'Verwaltung von Firmenkarten',
                benefit4: 'Genehmigungen für Ausgaben und Reisen',
                benefit5: 'Reisebuchung und -richtlinien',
                benefit6: 'QuickBooks-/Xero-Integrationen',
                benefit7: 'Chat über Auslagen, Berichte und Räume',
                benefit8: 'KI- und menschlicher Support',
            },
            control: {
                title: 'Steuerung',
                description: 'Ausgaben, Reisen und Chat für größere Unternehmen.',
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
            thisIsYourCurrentPlan: 'Dies ist dein aktueller Plan',
            downgrade: 'Downgrade auf Collect',
            upgrade: 'Upgrade auf Control',
            addMembers: 'Mitglieder hinzufügen',
            saveWithExpensifyTitle: 'Sparen mit der Expensify Card',
            saveWithExpensifyDescription: 'Nutze unseren Sparrechner, um zu sehen, wie das Cashback der Expensify Card deine Expensify-Rechnung senken kann.',
            saveWithExpensifyButton: 'Mehr erfahren',
        },
        compareModal: {
            comparePlans: 'Tarife vergleichen',
            subtitle: `<muted-text>Schalte die Funktionen frei, die du brauchst, mit dem passenden Abo für dich. <a href="${CONST.PRICING}">Sieh dir unsere Preisseite an</a> für eine vollständige Funktionsübersicht aller unserer Tarife.</muted-text>`,
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
                'Achtung: Wenn du deine Abonnementgröße jetzt nicht festlegst, setzen wir sie automatisch auf die Anzahl der aktiven Mitglieder in deinem ersten Monat. Du verpflichtest dich dann, für mindestens diese Anzahl von Mitgliedern in den nächsten 12 Monaten zu zahlen. Du kannst deine Abonnementgröße jederzeit erhöhen, aber du kannst sie erst verringern, wenn dein Abonnement abgelaufen ist.',
            zeroCommitment: 'Keine Verpflichtung beim reduzierten jährlichen Abonnementpreis',
        },
        subscriptionSize: {
            title: 'Abonnementgröße',
            yourSize: 'Die Größe deines Abonnements ist die Anzahl offener Plätze, die in einem bestimmten Monat von beliebigen aktiven Mitgliedern belegt werden können.',
            eachMonth:
                'Jeden Monat deckt dein Abonnement bis zu der oben festgelegten Anzahl aktiver Mitglieder ab. Jedes Mal, wenn du deine Abonnementgröße erhöhst, startest du ein neues 12-monatiges Abonnement in dieser neuen Größe.',
            note: 'Hinweis: Ein aktives Mitglied ist jede Person, die Ausgabedaten, die mit dem Unternehmensarbeitsbereich verknüpft sind, erstellt, bearbeitet, eingereicht, genehmigt, erstattet oder exportiert hat.',
            confirmDetails: 'Bestätige die Details deines neuen Jahresabonnements:',
            subscriptionSize: 'Abonnementgröße',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} aktive Mitglieder/Monat`,
            subscriptionRenews: 'Abonnement verlängert sich',
            youCantDowngrade: 'Während deines jährlichen Abos kannst du kein Downgrade durchführen.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Du hast dich bereits bis zum ${date} für ein jährliches Abonnement mit ${size} aktiven Mitgliedern pro Monat verpflichtet. Du kannst am ${date} zu einem nutzungsbasierten Abonnement wechseln, indem du die automatische Verlängerung deaktivierst.`,
            error: {
                size: 'Bitte gib eine gültige Abonnementgröße ein',
                sameSize: 'Bitte gib eine andere Zahl als deine aktuelle Abonnementgröße ein',
            },
        },
        paymentCard: {
            addPaymentCard: 'Zahlungskarte hinzufügen',
            enterPaymentCardDetails: 'Gib deine Zahlungskartendaten ein',
            security: 'Expensify ist PCI-DSS-konform, verwendet eine Verschlüsselung auf Bankniveau und nutzt redundante Infrastruktur, um Ihre Daten zu schützen.',
            learnMoreAboutSecurity: 'Erfahren Sie mehr über unsere Sicherheit.',
        },
        subscriptionSettings: {
            title: 'Abonnementseinstellungen',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Abonnementstyp: ${subscriptionType}, Abonnementsumfang: ${subscriptionSize}, Automatische Verlängerung: ${autoRenew}, Automatische jährliche Sitzplatzerhöhung: ${autoIncrease}`,
            none: 'keine',
            on: 'an',
            off: 'Aus',
            annual: 'Jährlich',
            autoRenew: 'Automatische Verlängerung',
            autoIncrease: 'Jährliche Plätze automatisch erhöhen',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Spare bis zu ${amountWithCurrency}/Monat pro aktivem Mitglied`,
            automaticallyIncrease:
                'Erhöhe deine jährlichen Plätze automatisch, um aktive Mitglieder zu berücksichtigen, die deine Abonnementgröße überschreiten. Hinweis: Dadurch wird das Enddatum deines Jahresabonnements verlängert.',
            disableAutoRenew: 'Automatische Verlängerung deaktivieren',
            helpUsImprove: 'Hilf uns, Expensify zu verbessern',
            whatsMainReason: 'Was ist der Hauptgrund dafür, dass du die automatische Verlängerung deaktivierst?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Verlängert sich am ${date}.`,
            pricingConfiguration: 'Die Preise hängen von der Konfiguration ab. Für den niedrigsten Preis wähle ein Jahresabonnement und besorge dir die Expensify Card.',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>Erfahre mehr auf unserer <a href="${CONST.PRICING}">Preisseite</a> oder chatte mit unserem Team in deinem ${hasAdminsRoom ? `<a href="adminsRoom">#admins-Raum.</a>` : '#admins-Raum.'}</muted-text>`,
            estimatedPrice: 'Geschätzter Preis',
            changesBasedOn: 'Dies ändert sich basierend auf deiner Expensify Card-Nutzung und den untenstehenden Abonnementoptionen.',
        },
        requestEarlyCancellation: {
            title: 'Vorzeitige Kündigung anfordern',
            subtitle: 'Was ist der Hauptgrund, warum du eine vorzeitige Kündigung beantragst?',
            subscriptionCanceled: {
                title: 'Abonnement gekündigt',
                subtitle: 'Ihr Jahresabonnement wurde gekündigt.',
                info: 'Wenn du deine(n) Workspace(s) weiterhin nutzungsbasiert verwenden möchtest, bist du startklar.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Wenn du zukünftige Aktivitäten und Belastungen verhindern möchtest, musst du <a href="${workspacesListRoute}">deinen/die Workspace(s) löschen</a>. Beachte, dass dir beim Löschen deines/deiner Workspace(s) alle ausstehenden Aktivitäten in Rechnung gestellt werden, die im aktuellen Kalendermonat angefallen sind.`,
            },
            requestSubmitted: {
                title: 'Anfrage übermittelt',
                subtitle:
                    'Vielen Dank, dass Sie uns mitgeteilt haben, dass Sie Ihr Abonnement kündigen möchten. Wir prüfen Ihre Anfrage und melden uns in Kürze über Ihren Chat mit <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Mit der Beantragung einer vorzeitigen Kündigung erkenne ich an und stimme zu, dass Expensify gemäß den Expensify-<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Nutzungsbedingungen</a> oder einer anderen zwischen mir und Expensify geltenden Dienstleistungsvereinbarung nicht verpflichtet ist, einem solchen Antrag stattzugeben, und dass Expensify das alleinige Ermessen hinsichtlich der Genehmigung eines solchen Antrags behält.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Funktionalität muss verbessert werden',
        tooExpensive: 'Zu teuer',
        inadequateSupport: 'Unzureichender Kundensupport',
        businessClosing: 'Unternehmensschließung, Verkleinerung oder Übernahme',
        additionalInfoTitle: 'Zu welcher Software wechselst du und warum?',
        additionalInfoInputLabel: 'Ihre Antwort',
    },
    roomChangeLog: {
        updateRoomDescription: 'setze die Raumbeschreibung auf:',
        clearRoomDescription: 'hat die Raumbeschreibung gelöscht',
        changedRoomAvatar: 'hat das Raum-Avatar geändert',
        removedRoomAvatar: 'hat den Raumavatar entfernt',
    },
    delegate: {
        switchAccount: 'Konten wechseln:',
        copilotDelegatedAccess: 'Copilot: Delegierter Zugriff',
        copilotDelegatedAccessDescription: 'Anderen Mitgliedern den Zugriff auf dein Konto erlauben.',
        addCopilot: 'Copiloten hinzufügen',
        membersCanAccessYourAccount: 'Diese Mitglieder können auf Ihr Konto zugreifen:',
        youCanAccessTheseAccounts: 'Du kannst auf diese Konten über den Kontowechsel zugreifen:',
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
        onBehalfOfMessage: (delegator: string) => `im Namen von ${delegator}`,
        accessLevel: 'Zugriffsebene',
        confirmCopilot: 'Bestätige unten deine Copilot-Person.',
        accessLevelDescription: 'Wähle unten eine Zugriffsstufe. Sowohl voller als auch eingeschränkter Zugriff erlauben Copilots, alle Unterhaltungen und Ausgaben zu sehen.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Erlaube einem anderen Mitglied, alle Aktionen in deinem Konto in deinem Namen durchzuführen. Dies umfasst Chat, Einreichungen, Genehmigungen, Zahlungen, Einstellungsaktualisierungen und mehr.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Ermöglicht einem anderen Mitglied, die meisten Aktionen in deinem Konto in deinem Namen auszuführen. Schließt Genehmigungen, Zahlungen, Ablehnungen und Zurückhaltungen aus.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copilot entfernen',
        removeCopilotConfirmation: 'Möchtest du diesen Copilot wirklich entfernen?',
        changeAccessLevel: 'Zugriffsstufe ändern',
        makeSureItIsYou: 'Stellen wir sicher, dass du es bist',
        enterMagicCode: (contactMethod: string) =>
            `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um eine:n Copilot:in hinzuzufügen. Er sollte innerhalb von ein bis zwei Minuten ankommen.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um deinen Copilot zu aktualisieren.`,
        notAllowed: 'Nicht so schnell …',
        noAccessMessage: dedent(`
            Als Copilot hast du keinen Zugriff auf
            diese Seite. Entschuldigung!
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
        createReportAction: 'Berichtsaktion erstellen',
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
        dateTimeFields: 'Datum-/Uhrzeitfelder',
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
            hasGBR: 'Hat GBR',
            hasRBR: 'Hat RBR',
            pinnedByUser: 'Von Mitglied angeheftet',
            hasIOUViolations: 'Hat Vorschüsse mit Verstößen',
            hasAddWorkspaceRoomErrors: 'Fehler beim Hinzufügen eines Arbeitsbereich-Raums',
            isUnread: 'Ist ungelesen (Fokusmodus)',
            isArchived: 'Ist archiviert (neuester Modus)',
            isSelfDM: 'Ist eigene Direktnachricht',
            isFocused: 'Ist vorübergehend fokussiert',
        },
        reasonGBR: {
            hasJoinRequest: 'Hat Beitrittsanfrage (Admin-Raum)',
            isUnreadWithMention: 'Ist ungelesen mit Erwähnung',
            isWaitingForAssigneeToCompleteAction: 'Wartet darauf, dass die zuständige Person die Aktion ausführt',
            hasChildReportAwaitingAction: 'Hat untergeordneten Bericht, der auf Aktion wartet',
            hasMissingInvoiceBankAccount: 'Hat fehlendes Rechnungskonto',
            hasUnresolvedCardFraudAlert: 'Hat ungeklärte Kartenbetrugswarnung',
            hasDEWApproveFailed: 'DEW-Genehmigung fehlgeschlagen',
        },
        reasonRBR: {
            hasErrors: 'Enthält Fehler in den Bericht- oder Berichtaktionsdaten',
            hasViolations: 'Verstöße vorhanden',
            hasTransactionThreadViolations: 'Hat Transaktions-Thread-Verstöße',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Es gibt einen Bericht, der auf eine Aktion wartet',
            theresAReportWithErrors: 'Es gibt einen Bericht mit Fehlern',
            theresAWorkspaceWithCustomUnitsErrors: 'Es gibt einen Workspace mit Fehlern bei benutzerdefinierten Einheiten',
            theresAProblemWithAWorkspaceMember: 'Es gibt ein Problem mit einem Workspace-Mitglied',
            theresAProblemWithAWorkspaceQBOExport: 'Es gab ein Problem mit einer Exporteinstellung der Workspace-Verbindung.',
            theresAProblemWithAContactMethod: 'Es gibt ein Problem mit einer Kontaktmethode',
            aContactMethodRequiresVerification: 'Eine Kontaktmethode erfordert eine Verifizierung',
            theresAProblemWithAPaymentMethod: 'Es gibt ein Problem mit einer Zahlungsmethode',
            theresAProblemWithAWorkspace: 'Mit einem Arbeitsbereich liegt ein Problem vor',
            theresAProblemWithYourReimbursementAccount: 'Es gibt ein Problem mit deinem Erstattungskonto',
            theresABillingProblemWithYourSubscription: 'Es gibt ein Abrechnungsproblem mit deinem Abonnement',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Dein Abonnement wurde erfolgreich verlängert',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Bei der Synchronisierung der Workspace-Verbindung ist ein Problem aufgetreten',
            theresAProblemWithYourWallet: 'Es gibt ein Problem mit deinem Wallet',
            theresAProblemWithYourWalletTerms: 'Es gibt ein Problem mit deinen Wallet-Bedingungen',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Mach eine Probefahrt',
    },
    migratedUserWelcomeModal: {
        title: 'Willkommen bei New Expensify!',
        subtitle: 'Es enthält alles, was du an unserem klassischen Erlebnis liebst, plus eine ganze Reihe von Upgrades, die dein Leben noch einfacher machen:',
        confirmText: "Los geht's!",
        helpText: '2-Minuten-Demo testen',
        features: {
            search: 'Leistungsstärkere Suche auf Mobilgerät, Web und Desktop',
            concierge: 'Integrierte Concierge-KI zur Automatisierung Ihrer Spesen',
            chat: 'Direkt bei jeder Ausgabe chatten, um Fragen schnell zu klären',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>Leg jetzt <strong>hier los!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Benenne deine gespeicherten Suchvorgänge um</strong> – hier!</tooltip>',
        accountSwitcher: '<tooltip>Greifen Sie hier auf Ihre <strong>Copilot-Konten</strong> zu</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Scannen Sie unseren Testbeleg</strong>, um zu sehen, wie es funktioniert!</tooltip>',
            manager: '<tooltip>Wähle unseren <strong>Testmanager</strong>, um es auszuprobieren!</tooltip>',
            confirmation: '<tooltip>Reiche jetzt <strong>deine Ausgabe ein</strong> und sieh zu, wie die Magie passiert!</tooltip>',
            tryItOut: 'Probiere es aus',
        },
        outstandingFilter: '<tooltip>Filter für Ausgaben,\ndie <strong>genehmigt werden müssen</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Sende diese Quittung, um\n<strong>die Probefahrt abzuschließen!</strong></tooltip>',
        gpsTooltip: '<tooltip>GPS-Tracking läuft! Wenn du fertig bist, beende die Aufzeichnung unten.</tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Änderungen verwerfen?',
        body: 'Möchtest du die von dir vorgenommenen Änderungen wirklich verwerfen?',
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
            description: 'Stell sicher, dass die untenstehenden Details für dich gut aussehen. Sobald du den Anruf bestätigst, schicken wir dir eine Einladung mit weiteren Infos.',
            setupSpecialist: 'Ihre Einrichtungsspezialist',
            meetingLength: 'Meetingdauer',
            dateTime: 'Datum & Uhrzeit',
            minutes: '30 Minuten',
        },
        callScheduled: 'Anruf geplant',
    },
    autoSubmitModal: {
        title: 'Alles klar und eingereicht!',
        description: 'Alle Warnungen und Verstöße wurden gelöscht, sodass:',
        submittedExpensesTitle: 'Diese Ausgaben wurden eingereicht',
        submittedExpensesDescription: 'Diese Ausgaben wurden an Ihre:n Genehmiger:in gesendet, können aber bis zur Genehmigung noch bearbeitet werden.',
        pendingExpensesTitle: 'Ausstehende Ausgaben wurden verschoben',
        pendingExpensesDescription: 'Alle ausstehenden Kartenausgaben wurden in einen separaten Bericht verschoben, bis sie verbucht sind.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Mach eine 2-minütige Probefahrt',
        },
        modal: {
            title: 'Probier uns aus',
            description: 'Mach eine kurze Produkttour, um schnell auf den neuesten Stand zu kommen.',
            confirmText: 'Testlauf starten',
            helpText: 'Überspringen',
            employee: {
                description:
                    '<muted-text>Sichere deinem Team <strong>3 kostenlose Monate Expensify!</strong> Gib einfach unten die E-Mail-Adresse deiner Chefin/deines Chefs ein und schick ihr/ihm eine Testausgabe.</muted-text>',
                email: 'Gib die E-Mail-Adresse deines Chefs ein',
                error: 'Dieses Mitglied besitzt einen Workspace, bitte gib ein neues Mitglied zum Testen ein.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Sie probieren Expensify gerade aus',
            readyForTheRealThing: 'Bereit für das Original?',
            getStarted: 'Loslegen',
        },
        employeeInviteMessage: (name: string) => `# ${name} hat dich eingeladen, Expensify zu testen
Hey! Ich habe gerade *3 Monate gratis* bekommen, damit wir Expensify testen können – die schnellste Art, Spesen abzurechnen.

Hier ist ein *Testbeleg*, um dir zu zeigen, wie es funktioniert:`,
    },
    export: {
        basicExport: 'Standardexport',
        reportLevelExport: 'Alle Daten – Berichtsebene',
        expenseLevelExport: 'Alle Daten – Ausgabenebene',
        exportInProgress: 'Export läuft',
        conciergeWillSend: 'Concierge wird dir die Datei in Kürze zusenden.',
    },
    domain: {
        notVerified: 'Nicht verifiziert',
        retry: 'Erneut versuchen',
        verifyDomain: {
            title: 'Domain verifizieren',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Bevor du fortfährst, bestätige, dass du <strong>${domainName}</strong> besitzt, indem du seine DNS-Einstellungen aktualisierst.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Greife auf deinen DNS-Anbieter zu und öffne die DNS-Einstellungen für <strong>${domainName}</strong>.`,
            addTXTRecord: 'Füge den folgenden TXT-Eintrag hinzu:',
            saveChanges: 'Änderungen speichern und hierher zurückkehren, um Ihre Domain zu verifizieren.',
            youMayNeedToConsult: `Möglicherweise müssen Sie sich zur vollständigen Verifizierung an die IT-Abteilung Ihrer Organisation wenden. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Weitere Informationen</a>.`,
            warning: 'Nach der Verifizierung erhalten alle Expensify-Mitglieder in Ihrer Domain eine E-Mail, dass ihr Konto unter Ihrer Domain verwaltet wird.',
            codeFetchError: 'Bestätigungscode konnte nicht abgerufen werden',
            genericError: 'Wir konnten Ihre Domain nicht verifizieren. Bitte versuchen Sie es erneut und wenden Sie sich an Concierge, falls das Problem weiterhin besteht.',
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
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML-SSO</a> ist eine Sicherheitsfunktion, die dir mehr Kontrolle darüber gibt, wie Mitglieder mit <strong>${domainName}</strong>-E‑Mails sich bei Expensify anmelden. Um sie zu aktivieren, musst du dich als autorisierte*r Unternehmensadministrator*in verifizieren.</muted-text>`,
            fasterAndEasierLogin: 'Schnelleres und einfacheres Anmelden',
            moreSecurityAndControl: 'Mehr Sicherheit und Kontrolle',
            onePasswordForAnything: 'Ein Passwort für alles',
        },
        goToDomain: 'Zur Domain wechseln',
        samlLogin: {
            title: 'SAML-Anmeldung',
            subtitle: `<muted-text>Richte die Anmeldung von Mitgliedern mit <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO)</a> ein.</muted-text>`,
            enableSamlLogin: 'SAML-Anmeldung aktivieren',
            allowMembers: 'Mitgliedern die Anmeldung mit SAML erlauben.',
            requireSamlLogin: 'SAML-Anmeldung erzwingen',
            anyMemberWillBeRequired: 'Alle Mitglieder, die mit einer anderen Methode angemeldet sind, müssen sich erneut über SAML authentifizieren.',
            enableError: 'Die SAML-Aktivierungseinstellung konnte nicht aktualisiert werden',
            requireError: 'SAML-Anforderungseinstellung konnte nicht aktualisiert werden',
            disableSamlRequired: 'Deaktivierung von SAML erforderlich',
            oktaWarningPrompt: 'Bist du sicher? Dadurch wird auch Okta SCIM deaktiviert.',
            requireWithEmptyMetadataError: 'Bitte füge unten die Identity-Provider-Metadaten hinzu, um zu aktivieren',
        },
        samlConfigurationDetails: {
            title: 'SAML-Konfigurationsdetails',
            subtitle: 'Verwende diese Details, um SAML einzurichten.',
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
                `Bitte bestätigen Sie sich als autorisierte*r Unternehmensadministrator*in für <strong>${domainName}</strong>, wenn Sie die Kontrolle über Folgendes benötigen:`,
            companyCardManagement: 'Firmenkartenverwaltung',
            accountCreationAndDeletion: 'Kontoerstellung und -löschung',
            workspaceCreation: 'Workspace-Erstellung',
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
            description: 'Als Nächstes musst du die Inhaberschaft der Domain verifizieren und deine Sicherheitseinstellungen anpassen.',
            configure: 'Konfigurieren',
        },
        enhancedSecurity: {
            title: 'Erhöhte Sicherheit',
            subtitle: 'Verlange von Mitgliedern deiner Domain die Anmeldung über Single Sign-On, beschränke das Erstellen von Workspaces und mehr.',
            enable: 'Aktivieren',
        },
        domainAdmins: 'Domain-Admins',
        admins: {
            title: 'Admins',
            findAdmin: 'Admin finden',
            primaryContact: 'Hauptkontakt',
            addPrimaryContact: 'Primäre Kontaktperson hinzufügen',
            setPrimaryContactError: 'Primären Kontakt kann nicht festgelegt werden. Bitte versuche es später noch einmal.',
            settings: 'Einstellungen',
            consolidatedDomainBilling: 'Konsolidierte Domänenabrechnung',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Wenn aktiviert, bezahlt die primäre Kontaktperson alle Arbeitsbereiche, die Mitgliedern von <strong>${domainName}</strong> gehören, und erhält alle Rechnungsbelege.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'Die konsolidierte Domain-Abrechnung konnte nicht geändert werden. Bitte versuche es später erneut.',
            addAdmin: 'Admin hinzufügen',
            addAdminError: 'Dieses Mitglied kann nicht als Admin hinzugefügt werden. Bitte versuche es erneut.',
            revokeAdminAccess: 'Administratorzugriff widerrufen',
            cantRevokeAdminAccess: 'Administratorzugriff kann nicht vom technischen Kontakt entzogen werden',
            error: {
                removeAdmin: 'Dieser Benutzer kann nicht als Admin entfernt werden. Bitte versuche es erneut.',
                removeDomain: 'Diese Domain kann nicht entfernt werden. Bitte versuche es erneut.',
                removeDomainNameInvalid: 'Bitte geben Sie Ihren Domainnamen ein, um ihn zurückzusetzen.',
            },
            resetDomain: 'Domain zurücksetzen',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Bitte gib zur Bestätigung des Domain-Resets <strong>${domainName}</strong> ein.`,
            enterDomainName: 'Gib hier deinen Domainnamen ein',
            resetDomainInfo: `Diese Aktion ist <strong>dauerhaft</strong> und die folgenden Daten werden gelöscht: <br/> <ul><li>Firmenkartenverbindungen und alle noch nicht eingereichten Ausgaben von diesen Karten</li> <li>SAML- und Gruppeneinstellungen</li> </ul> Alle Konten, Workspaces, Berichte, Ausgaben und anderen Daten bleiben erhalten. <br/><br/>Hinweis: Sie können diese Domain aus Ihrer Domainliste entfernen, indem Sie die zugehörige E-Mail aus Ihren <a href="#">Kontaktmethoden</a> entfernen.`,
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
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
