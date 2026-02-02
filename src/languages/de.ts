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
import {OriginalMessageSettlementAccountLocked, PolicyRulesModifiedFields} from '@src/types/onyx/OriginalMessage';
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
        unshare: 'Nicht teilen',
        yes: 'Ja',
        no: 'Nein',
        // @context Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.
        ok: 'OK',
        notNow: 'Nicht jetzt',
        noThanks: 'Nein, danke',
        learnMore: 'Mehr erfahren',
        buttonConfirm: 'Verstanden',
        name: 'Name',
        attachment: 'Anhang',
        attachments: 'Anhänge',
        center: 'Zentriert',
        from: 'Von',
        to: 'An',
        in: 'In',
        optional: 'Optional',
        new: 'Neu',
        search: 'Suchen',
        reports: 'Berichte',
        find: 'Suchen',
        searchWithThreeDots: 'Suchen …',
        next: 'Weiter',
        previous: 'Zurück',
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
        analyzing: 'Analysiere…',
        addCardTermsOfService: 'Expensify-Nutzungsbedingungen',
        perPerson: 'pro Person',
        phone: 'Telefon',
        phoneNumber: 'Telefonnummer',
        phoneNumberPlaceholder: '(XXX) XXX-XXXX',
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
        archived: 'Archiviert',
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
        saveAndContinue: 'Speichern & fortfahren',
        settings: 'Einstellungen',
        termsOfService: 'Nutzungsbedingungen',
        members: 'Mitglieder',
        invite: 'Einladen',
        here: 'Hier',
        date: 'Datum',
        dob: 'Geburtsdatum',
        currentYear: 'Aktuelles Jahr',
        currentMonth: 'Aktueller Monat',
        ssnLast4: 'Letzte 4 Ziffern der SSN',
        ssnFull9: 'Alle 9 Ziffern der SSN',
        addressLine: (lineNumber: number) => `Adresszeile ${lineNumber}`,
        personalAddress: 'Privatadresse',
        companyAddress: 'Firmenadresse',
        noPO: 'Bitte keine Postfächer oder Maildrop-Adressen.',
        city: 'Stadt',
        state: 'Bundesstaat',
        streetAddress: 'Straße und Hausnummer',
        stateOrProvince: 'Bundesland / Provinz',
        country: 'Land',
        zip: 'Postleitzahl',
        zipPostCode: 'PLZ / Postleitzahl',
        whatThis: 'Was ist das?',
        iAcceptThe: 'Ich akzeptiere die',
        acceptTermsAndPrivacy: `Ich akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify-Nutzungsbedingungen</a> und die <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzerklärung</a>`,
        acceptTermsAndConditions: `Ich akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">Allgemeinen Geschäftsbedingungen</a>`,
        acceptTermsOfService: `Ich akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify-Nutzungsbedingungen</a>`,
        remove: 'Entfernen',
        admin: 'Admin',
        owner: 'Eigentümer',
        dateFormat: 'JJJJ-MM-TT',
        send: 'Senden',
        na: 'Nicht verfügbar',
        noResultsFound: 'Keine Ergebnisse gefunden',
        noResultsFoundMatching: (searchString: string) => `Keine Ergebnisse gefunden, die mit „${searchString}“ übereinstimmen`,
        recentDestinations: 'Letzte Ziele',
        timePrefix: 'Es ist',
        conjunctionFor: 'für',
        todayAt: 'Heute um',
        tomorrowAt: 'Morgen um',
        yesterdayAt: 'Gestern um',
        conjunctionAt: 'bei',
        conjunctionTo: 'bis',
        genericErrorMessage: 'Ups ... Etwas ist schiefgelaufen und Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es später erneut.',
        percentage: 'Prozentsatz',
        converted: 'Konvertiert',
        error: {
            invalidAmount: 'Ungültiger Betrag',
            acceptTerms: 'Sie müssen die Nutzungsbedingungen akzeptieren, um fortzufahren',
            phoneNumber: `Bitte gib eine vollständige Telefonnummer ein (z. B. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Dieses Feld ist erforderlich',
            requestModified: 'Diese Anfrage wird von einem anderen Mitglied bearbeitet',
            characterLimitExceedCounter: (length: number, limit: number) => `Zeichenlimit überschritten (${length}/${limit})`,
            dateInvalid: 'Bitte wählen Sie ein gültiges Datum aus',
            invalidDateShouldBeFuture: 'Bitte wähle heute oder ein zukünftiges Datum aus',
            invalidTimeShouldBeFuture: 'Bitte wähle eine Uhrzeit, die mindestens eine Minute in der Zukunft liegt',
            invalidCharacter: 'Ungültiges Zeichen',
            enterMerchant: 'Gib einen Händlernamen ein',
            enterAmount: 'Geben Sie einen Betrag ein',
            missingMerchantName: 'Fehlender Händlername',
            missingAmount: 'Fehlender Betrag',
            missingDate: 'Fehlendes Datum',
            enterDate: 'Datum eingeben',
            invalidTimeRange: 'Bitte geben Sie eine Zeit im 12-Stunden-Format ein (z. B. 14:30 Uhr).',
            pleaseCompleteForm: 'Bitte füllen Sie das obige Formular aus, um fortzufahren',
            pleaseSelectOne: 'Bitte wähle oben eine Option aus',
            invalidRateError: 'Bitte geben Sie einen gültigen Satz ein',
            lowRateError: 'Der Kurs muss größer als 0 sein',
            email: 'Bitte gib eine gültige E‑Mail‑Adresse ein',
            login: 'Beim Anmelden ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        comma: 'Komma',
        semicolon: 'Semikolon',
        please: 'Bitte',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'Kontaktieren Sie uns',
        pleaseEnterEmailOrPhoneNumber: 'Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer ein',
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: 'Beheben Sie die Fehler',
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
        transferBalance: 'Guthaben übertragen',
        // @context Instruction telling the user to input data manually. Refers to entering text or values in a field.
        enterManually: 'Manuell eingeben',
        message: 'Nachricht',
        leaveThread: 'Thread verlassen',
        you: 'Du',
        // @context Refers to the current user in the UI. Should follow capitalization rules for labels/pronouns in the target language.
        me: 'Ich',
        youAfterPreposition: 'Sie',
        your: 'Ihr',
        conciergeHelp: 'Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
        youAppearToBeOffline: 'Sie scheinen offline zu sein.',
        thisFeatureRequiresInternet: 'Diese Funktion erfordert eine aktive Internetverbindung.',
        attachmentWillBeAvailableOnceBackOnline: 'Anhang wird verfügbar, sobald du wieder online bist.',
        errorOccurredWhileTryingToPlayVideo: 'Beim Versuch, dieses Video abzuspielen, ist ein Fehler aufgetreten.',
        areYouSure: 'Bist du sicher?',
        verify: 'Verifizieren',
        yesContinue: 'Ja, weiter',
        // @context Provides an example format for a website URL.
        websiteExample: 'z. B. https://www.expensify.com',
        // @context Provides an example format for a ZIP/postal code.
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `z. B. ${zipSampleFormat}` : ''),
        description: 'Beschreibung',
        title: 'Titel',
        assignee: 'Beauftragte/r',
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
        letsStart: `Los geht's`,
        showMore: 'Mehr anzeigen',
        showLess: 'Weniger anzeigen',
        merchant: 'Händler',
        change: 'Ändern',
        category: 'Kategorie',
        report: 'Bericht',
        billable: 'Verrechenbar',
        nonBillable: 'Nicht abrechenbar',
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
        recent: 'Neueste',
        all: 'Alle',
        am: 'vorm.',
        pm: 'PM',
        // @context Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.
        tbd: 'Wird noch festgelegt',
        selectCurrency: 'Währung auswählen',
        selectSymbolOrCurrency: 'Wählen Sie ein Symbol oder eine Währung aus',
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
            subtitleText2: 'Schaltfläche oben oder erstellen Sie etwas mit der',
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
        export: 'Exportieren',
        initialValue: 'Anfangswert',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: 'Aktuelles Datum',
        value: 'Wert',
        downloadFailedTitle: 'Download fehlgeschlagen',
        downloadFailedDescription: 'Ihr Download konnte nicht abgeschlossen werden. Bitte versuchen Sie es später noch einmal.',
        filterLogs: 'Protokolle filtern',
        network: 'Netzwerk',
        reportID: 'Berichts-ID',
        longReportID: 'Lange Bericht-ID',
        withdrawalID: 'Auszahlungs-ID',
        bankAccounts: 'Bankkonten',
        chooseFile: 'Datei auswählen',
        chooseFiles: 'Dateien auswählen',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: 'Loslassen',
        // @context Instruction for dropping one or more files into an upload area.
        dropMessage: 'Legen Sie Ihre Datei hier ab',
        ignore: 'Ignorieren',
        enabled: 'Aktiviert',
        disabled: 'Deaktiviert',
        // @context Action button for importing a file or data. Should use the verb form, not the noun form.
        import: 'Importieren',
        offlinePrompt: 'Du kannst diese Aktion im Moment nicht ausführen.',
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
        chatWithAccountManager: (accountManagerDisplayName: string) => `Brauchen Sie etwas Bestimmtes? Chatten Sie mit Ihrem Account Manager, ${accountManagerDisplayName}.`,
        chatNow: 'Jetzt chatten',
        workEmail: 'Arbeits-E-Mail',
        destination: 'Ziel',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: 'Unterrate',
        perDiem: 'Tagegeld',
        validate: 'Validieren',
        downloadAsPDF: 'Als PDF herunterladen',
        downloadAsCSV: 'Als CSV herunterladen',
        help: 'Hilfe',
        expenseReport: 'Spesenabrechnung',
        expenseReports: 'Spesenabrechnungen',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'Satz außerhalb der Richtlinie',
        leaveWorkspace: 'Workspace verlassen',
        leaveWorkspaceConfirmation: 'Wenn du diesen Workspace verlässt, kannst du keine Ausgaben mehr dafür einreichen.',
        leaveWorkspaceConfirmationAuditor: 'Wenn du diesen Workspace verlässt, kannst du seine Berichte und Einstellungen nicht mehr anzeigen.',
        leaveWorkspaceConfirmationAdmin: 'Wenn du diesen Workspace verlässt, kannst du seine Einstellungen nicht mehr verwalten.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Workspace verlässt, wirst du im Genehmigungs-Workflow durch ${workspaceOwner}, den Workspace-Inhaber, ersetzt.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Workspace verlässt, wirst du als bevorzugte exportierende Person durch ${workspaceOwner}, den Workspace-Inhaber, ersetzt.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Workspace verlässt, wirst du als technischer Kontakt durch ${workspaceOwner}, den Workspace-Inhaber, ersetzt.`,
        leaveWorkspaceReimburser:
            'Du kannst diesen Workspace nicht verlassen, da du als Erstattungsverantwortliche:r festgelegt bist. Bitte lege unter Workspaces > Zahlungen senden oder nachverfolgen eine:n neue:n Erstattungsverantwortliche:n fest und versuche es dann erneut.',
        reimbursable: 'Erstattungsfähig',
        editYourProfile: 'Profil bearbeiten',
        comments: 'Kommentare',
        sharedIn: 'Geteilt in',
        unreported: 'Nicht eingereicht',
        explore: 'Entdecken',
        todo: 'Aufgabe',
        invoice: 'Rechnung',
        expense: 'Ausgabe',
        chat: 'Chat',
        task: 'Aufgabe',
        trip: 'Reise',
        apply: 'Anwenden',
        status: 'Status',
        on: 'Ein',
        before: 'Vorher',
        after: 'Nach',
        reschedule: 'Neu planen',
        general: 'Allgemein',
        workspacesTabTitle: 'Arbeitsbereiche',
        headsUp: 'Achtung!',
        submitTo: 'Einreichen bei',
        forwardTo: 'Weiterleiten an',
        merge: 'Zusammenführen',
        none: 'Keine',
        unstableInternetConnection: 'Instabile Internetverbindung. Bitte überprüfe dein Netzwerk und versuche es erneut.',
        enableGlobalReimbursements: 'Globale Rückerstattungen aktivieren',
        purchaseAmount: 'Kaufbetrag',
        frequency: 'Häufigkeit',
        link: 'Link',
        pinned: 'Angeheftet',
        read: 'Lesen',
        copyToClipboard: 'In die Zwischenablage kopieren',
        thisIsTakingLongerThanExpected: 'Das dauert länger als erwartet ...',
        domains: 'Domänen',
        actionRequired: 'Aktion erforderlich',
        duplicate: 'Duplizieren',
        duplicated: 'Dupliziert',
        exchangeRate: 'Wechselkurs',
        reimbursableTotal: 'Erstattungsfähiger Gesamtbetrag',
        nonReimbursableTotal: 'Nicht erstattungsfähiger Gesamtbetrag',
        originalAmount: 'Ursprünglicher Betrag',
        insights: 'Einblicke',
        duplicateExpense: 'Doppelte Ausgabe',
        newFeature: 'Neue Funktion',
        month: 'Monat',
        home: 'Startseite',
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
            `Sie sind nicht berechtigt, diese Aktion auszuführen, während der Support eingeloggt ist (Befehl: ${command ?? ''}). Wenn Sie der Meinung sind, dass Success diese Aktion ausführen können sollte, starten Sie bitte ein Gespräch in Slack.`,
    },
    lockedAccount: {
        title: 'Gesperrtes Konto',
        description: 'Diese Aktion kann nicht ausgeführt werden, da dieses Konto gesperrt wurde. Bitte wende dich an concierge@expensify.com, um die nächsten Schritte zu erfahren.',
    },
    location: {
        useCurrent: 'Aktuellen Standort verwenden',
        notFound: 'Wir konnten deinen Standort nicht finden. Bitte versuche es erneut oder gib eine Adresse manuell ein.',
        permissionDenied: 'Es sieht so aus, als hättest du den Zugriff auf deinen Standort verweigert.',
        please: 'Bitte',
        allowPermission: 'Standortzugriff in den Einstellungen erlauben',
        tryAgain: 'und versuche es erneut.',
    },
    contact: {
        importContacts: 'Kontakte importieren',
        importContactsTitle: 'Importieren Sie Ihre Kontakte',
        importContactsText: 'Importiere Kontakte von deinem Telefon, damit deine Lieblingspersonen immer nur einen Tipp entfernt sind.',
        importContactsExplanation: 'damit deine Lieblingspersonen immer nur einen Tipp entfernt sind.',
        importContactsNativeText: 'Nur noch ein Schritt! Gib uns grünes Licht, um deine Kontakte zu importieren.',
    },
    anonymousReportFooter: {
        logoTagline: 'Beteiligen Sie sich an der Diskussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Kamerazugriff',
        expensifyDoesNotHaveAccessToCamera: 'Expensify kann ohne Zugriff auf deine Kamera keine Fotos aufnehmen. Tippe auf „Einstellungen“, um die Berechtigungen zu aktualisieren.',
        attachmentError: 'Anlagenfehler',
        errorWhileSelectingAttachment: 'Beim Auswählen eines Anhangs ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        errorWhileSelectingCorruptedAttachment: 'Beim Auswählen eines beschädigten Anhangs ist ein Fehler aufgetreten. Bitte versuchen Sie es mit einer anderen Datei.',
        takePhoto: 'Foto aufnehmen',
        chooseFromGallery: 'Aus Galerie wählen',
        chooseDocument: 'Datei auswählen',
        attachmentTooLarge: 'Anhang ist zu groß',
        sizeExceeded: 'Die Anhangsgröße überschreitet das Limit von 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Die Anlagengröße überschreitet das Limit von ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Anhang ist zu klein',
        sizeNotMet: 'Anhangsgröße muss größer als 240 Bytes sein',
        wrongFileType: 'Ungültiger Dateityp',
        notAllowedExtension: 'Dieser Dateityp ist nicht zulässig. Bitte versuchen Sie es mit einem anderen Dateityp.',
        folderNotAllowedMessage: 'Das Hochladen eines Ordners ist nicht erlaubt. Bitte versuchen Sie es mit einer anderen Datei.',
        protectedPDFNotSupported: 'Passwortgeschützte PDF-Datei wird nicht unterstützt',
        attachmentImageResized: 'Dieses Bild wurde für die Vorschau verkleinert. Für die volle Auflösung herunterladen.',
        attachmentImageTooLarge: 'Dieses Bild ist zu groß, um vor dem Hochladen eine Vorschau anzuzeigen.',
        tooManyFiles: (fileLimit: number) => `Sie können jeweils nur bis zu ${fileLimit} Dateien hochladen.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Datei überschreitet ${maxUploadSizeInMB} MB. Bitte versuche es erneut.`,
        someFilesCantBeUploaded: 'Einige Dateien können nicht hochgeladen werden',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Dateien müssen kleiner als ${maxUploadSizeInMB} MB sein. Größere Dateien werden nicht hochgeladen.`,
        maxFileLimitExceeded: 'Sie können bis zu 30 Belege auf einmal hochladen. Alle weiteren werden nicht hochgeladen.',
        unsupportedFileType: (fileType: string) => `${fileType}-Dateien werden nicht unterstützt. Es werden nur unterstützte Dateitypen hochgeladen.`,
        learnMoreAboutSupportedFiles: 'Erfahren Sie mehr über unterstützte Formate.',
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
        errorWhileSelectingFile: 'Beim Auswählen einer Datei ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
    },
    connectionComplete: {
        title: 'Verbindung hergestellt',
        supportingText: 'Du kannst dieses Fenster schließen und zur Expensify-App zurückkehren.',
    },
    avatarCropModal: {
        title: 'Foto bearbeiten',
        description: 'Ziehe, zoome und drehe dein Bild ganz nach Belieben.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Keine Erweiterung für diesen MIME-Typ gefunden',
        problemGettingImageYouPasted: 'Es gab ein Problem beim Abrufen des von dir eingefügten Bildes',
        commentExceededMaxLength: (formattedMaxLength: string) => `Die maximale Kommentarlänge beträgt ${formattedMaxLength} Zeichen.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `Die maximale Aufgabenüberschrift darf ${formattedMaxLength} Zeichen lang sein.`,
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
            successfullyAuthenticatedUsing: ({authType}) => `Du hast dich erfolgreich mit ${authType} authentifiziert.`,
            troubleshootBiometricsStatus: ({registered}) => `Biometrie (${registered ? 'Registriert' : 'Nicht registriert'})`,
            yourAttemptWasUnsuccessful: 'Dein Authentifizierungsversuch war nicht erfolgreich.',
            youCouldNotBeAuthenticated: 'Sie konnten nicht authentifiziert werden',
            areYouSureToReject: 'Bist du sicher? Der Authentifizierungsversuch wird abgelehnt, wenn du diesen Bildschirm schließt.',
            rejectAuthentication: 'Authentifizierung ablehnen',
            test: 'Test',
            biometricsAuthentication: 'Biometrie-Authentifizierung',
        },
        pleaseEnableInSystemSettings: {
            start: 'Bitte aktivieren Sie die Gesichts-/Fingerabdrucküberprüfung oder setzen Sie eine Geräte-Passcode in Ihren ',
            link: 'Systemeinstellungen',
            end: '.',
        },
        oops: 'Hoppla, etwas ist schief gelaufen',
        looksLikeYouRanOutOfTime: 'Sieht aus, als wäre deine Zeit abgelaufen! Bitte versuche es erneut beim Händler.',
        youRanOutOfTime: 'Die Zeit ist abgelaufen',
        letsVerifyItsYou: 'Lass uns überprüfen, ob du es bist',
        verifyYourself: {
            biometrics: 'Verifiziere dich mit deinem Gesicht oder Fingerabdruck',
        },
        enableQuickVerification: {
            biometrics: 'Schnelle, sichere Verifizierung mit deinem Gesicht oder Fingerabdruck aktivieren. Keine Passwörter oder Codes erforderlich.',
        },
        revoke: {
            revoke: 'Widerrufen',
            title: 'Gesicht/Fingerabdruck & Passkeys',
            explanation:
                'Die Gesichts-/Fingerabdruck- oder Passkey-Verifizierung ist auf einem oder mehreren Geräten aktiviert. Durch das Widerrufen des Zugriffs wird für die nächste Verifizierung auf jedem Gerät ein magischer Code erforderlich',
            confirmationPrompt: 'Bist du sicher? Du benötigst einen magischen Code für die nächste Verifizierung auf jedem Gerät',
            cta: 'Zugriff widerrufen',
            noDevices: 'Du hast keine Geräte für Gesichts-/Fingerabdruck- oder Passkey-Verifizierung registriert. Wenn du welche registrierst, kannst du den Zugriff hier widerrufen.',
            dismiss: 'Verstanden',
            error: 'Anfrage fehlgeschlagen. Versuchen Sie es später noch einmal.',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abrakadabra,
            du bist angemeldet!
        `),
        successfulSignInDescription: 'Wechsel zurück zu deinem ursprünglichen Tab, um fortzufahren.',
        title: 'Hier ist dein magischer Code',
        description: dedent(`
            Bitte gib den Code auf dem Gerät ein,
            auf dem er ursprünglich angefordert wurde
        `),
        doNotShare: dedent(`
            Geben Sie Ihren Code niemandem weiter.
            Expensify wird Sie niemals danach fragen!
        `),
        or: ', oder',
        signInHere: 'einfach hier anmelden',
        expiredCodeTitle: 'Magischer Code ist abgelaufen',
        expiredCodeDescription: 'Gehe zurück zum ursprünglichen Gerät und fordere einen neuen Code an',
        successfulNewCodeRequest: 'Code angefordert. Bitte überprüfe dein Gerät.',
        tfaRequiredTitle: dedent(`
            Zwei-Faktor-Authentifizierung
            erforderlich
        `),
        tfaRequiredDescription: dedent(`
            Bitte gib den Zwei-Faktor-Authentifizierungscode ein,
            an dem Ort, an dem du dich anzumelden versuchst.
        `),
        requestOneHere: 'Anfrage eins hier.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Bezahlt von',
        whatsItFor: 'Wozu ist das?',
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
            title: 'Reiche eine Ausgabe ein, wirb dein Team an',
            subtitleText: 'Möchten Sie, dass Ihr Team Expensify ebenfalls nutzt? Reichen Sie ihnen einfach eine Ausgabe ein, und wir kümmern uns um den Rest.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Ein Gespräch buchen',
    },
    hello: 'Hallo',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Leg unten los.',
        anotherLoginPageIsOpen: 'Eine weitere Anmeldeseite ist geöffnet.',
        anotherLoginPageIsOpenExplanation: 'Du hast die Anmeldeseite in einem separaten Tab geöffnet. Bitte melde dich in diesem Tab an.',
        welcome: 'Willkommen!',
        welcomeWithoutExclamation: 'Willkommen',
        phrase2: 'Geld spricht Bände. Und jetzt, da Chat und Zahlungen an einem Ort sind, ist es auch einfach.',
        phrase3: 'Ihre Zahlungen erreichen Sie so schnell, wie Sie Ihren Standpunkt klarmachen können.',
        enterPassword: 'Bitte geben Sie Ihr Passwort ein',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, es ist immer schön, ein neues Gesicht hier zu sehen!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) =>
            `Bitte gib den magischen Code ein, der an ${login} gesendet wurde. Er sollte innerhalb einer oder zwei Minuten ankommen.`,
    },
    login: {
        hero: {
            header: 'Reisen und Ausgaben – mit der Geschwindigkeit eines Chats',
            body: 'Willkommen bei der nächsten Generation von Expensify, in der Ihre Reisen und Ausgaben dank kontextbezogenem Chat in Echtzeit schneller abgewickelt werden.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Mit Single Sign-On weiter anmelden:',
        orContinueWithMagicCode: 'Sie können sich auch mit einem magischen Code anmelden',
        useSingleSignOn: 'Einmalanmeldung verwenden',
        useMagicCode: 'Magischen Code verwenden',
        launching: 'Wird gestartet...',
        oneMoment: 'Einen Moment bitte, wir leiten Sie zu Ihrem Single-Sign-On-Portal Ihres Unternehmens weiter.',
    },
    reportActionCompose: {
        dropToUpload: 'Zum Hochladen ablegen',
        sendAttachment: 'Anhang senden',
        addAttachment: 'Anhang hinzufügen',
        writeSomething: 'Etwas schreiben ...',
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
            return `Sind Sie sicher, dass Sie diesen ${type} löschen möchten?`;
        },
        onlyVisible: 'Nur sichtbar für',
        explain: 'Erklären',
        explainMessage: 'Bitte erkläre mir das.',
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
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `Du hast die Party in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> verpasst, hier gibt es nichts zu sehen.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `Dieser Chat ist mit allen Expensify-Mitgliedern in der Domain <strong>${domainRoom}</strong>. Verwende ihn, um mit Kolleg:innen zu chatten, Tipps auszutauschen und Fragen zu stellen.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Dieser Chat ist mit dem Admin von <strong>${workspaceName}</strong>. Verwende ihn, um über das Einrichten des Workspaces und mehr zu chatten.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `Dieser Chat ist mit allen in <strong>${workspaceName}</strong>. Verwenden Sie ihn für die wichtigsten Ankündigungen.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Dieser Chatraum ist für alles, was mit <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> zu tun hat.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Dieser Chat ist für Rechnungen zwischen <strong>${invoicePayer}</strong> und <strong>${invoiceReceiver}</strong>. Verwende die +‑Taste, um eine Rechnung zu senden.`,
        beginningOfChatHistory: (users: string) => `Dieser Chat ist mit ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `Hier reicht <strong>${submitterDisplayName}</strong> Ausgaben bei <strong>${workspaceName}</strong> ein. Verwende einfach die +‑Schaltfläche.`,
        beginningOfChatHistorySelfDM: 'Dies ist dein persönlicher Bereich. Verwende ihn für Notizen, Aufgaben, Entwürfe und Erinnerungen.',
        beginningOfChatHistorySystemDM: 'Willkommen! Lass uns alles für dich einrichten.',
        chatWithAccountManager: 'Chatten Sie hier mit Ihrem Account Manager',
        askMeAnything: 'Frag mich alles!',
        sayHello: 'Sag Hallo!',
        yourSpace: 'Ihr Bereich',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Willkommen bei ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Verwende die +‑Taste, um eine Ausgabe zu ${additionalText}.`,
        askConcierge: 'Stellen Sie Fragen und erhalten Sie rund um die Uhr Echtzeit-Support.',
        conciergeSupport: 'Support rund um die Uhr',
        create: 'Erstellen',
        iouTypes: {
            pay: 'bezahlen',
            split: 'Aufteilen',
            submit: 'Senden',
            track: 'verfolgen',
            invoice: 'Rechnung',
        },
    },
    adminOnlyCanPost: 'Nur Administratoren können Nachrichten in diesem Raum senden.',
    reportAction: {
        asCopilot: 'als Copilot für',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `hat diesen Bericht erstellt, um alle Ausgaben aus <a href="${reportUrl}">${reportName}</a> aufzunehmen, die mit der von dir gewählten Frequenz nicht eingereicht werden konnten`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `hat diesen Bericht für alle zurückgehaltenen Ausgaben aus <a href="${reportUrl}">${reportName}</a> erstellt`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Alle in dieser Unterhaltung benachrichtigen',
    },
    newMessages: 'Neue Nachrichten',
    latestMessages: 'Neueste Nachrichten',
    youHaveBeenBanned: 'Hinweis: Du wurdest für den Chat in diesem Kanal gesperrt.',
    reportTypingIndicator: {
        isTyping: 'schreibt …',
        areTyping: 'schreiben...',
        multipleMembers: 'Mehrere Mitglieder',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Dieser Chatraum wurde archiviert.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${displayName} sein Konto geschlossen hat.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${oldDisplayName} sein Konto mit ${displayName} zusammengeführt hat.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Dieser Chat ist nicht mehr aktiv, weil <strong>Sie</strong> kein Mitglied des Workspaces ${policyName} mehr sind.`
                : `Dieser Chat ist nicht mehr aktiv, da ${displayName} kein Mitglied des Workspaces ${policyName} mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${policyName} kein aktiver Workspace mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${policyName} kein aktiver Workspace mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Diese Buchung ist archiviert.',
    },
    writeCapabilityPage: {
        label: 'Wer kann posten',
        writeCapability: {
            all: 'Alle Mitglieder',
            admins: 'Nur für Admins',
        },
    },
    sidebarScreen: {
        buttonFind: 'Etwas suchen …',
        buttonMySettings: 'Meine Einstellungen',
        fabNewChat: 'Chat starten',
        fabNewChatExplained: 'Aktionsmenü öffnen',
        fabScanReceiptExplained: 'Beleg scannen (Schwebende Aktion)',
        chatPinned: 'Chat angeheftet',
        draftedMessage: 'Entwurfsnachricht',
        listOfChatMessages: 'Liste der Chatnachrichten',
        listOfChats: 'Chatliste',
        saveTheWorld: 'Rette die Welt',
        tooltip: 'Hier geht’s los!',
        redirectToExpensifyClassicModal: {
            title: 'Demnächst verfügbar',
            description:
                'Wir passen noch ein paar weitere Details von New Expensify an, um Ihre spezifische Konfiguration zu berücksichtigen. In der Zwischenzeit wechseln Sie zu Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Abonnement',
        domains: 'Domänen',
    },
    tabSelector: {chat: 'Chat', room: 'Raum', distance: 'Entfernung', manual: 'Manuell', scan: 'Scannen', map: 'Karte', gps: 'GPS', odometer: 'Kilometerzähler'},
    spreadsheet: {
        upload: 'Eine Tabellenkalkulation hochladen',
        import: 'Tabellenkalkulation importieren',
        dragAndDrop: '<muted-link>Ziehen Sie Ihre Tabellenkalkulation hierher, oder wählen Sie unten eine Datei aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Ziehen Sie Ihre Tabellenkalkulation hierher und legen Sie sie ab, oder wählen Sie unten eine Datei aus. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Erfahren Sie mehr</a> über unterstützte Dateiformate.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Wählen Sie eine Tabellenkalkulationsdatei zum Importieren aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Wähle eine Tabellenkalkulationsdatei zum Importieren aus. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Erfahre mehr</a> über unterstützte Dateiformate.</muted-link>`,
        fileContainsHeader: 'Datei enthält Spaltenüberschriften',
        column: (name: string) => `Spalte ${name}`,
        fieldNotMapped: (fieldName: string) => `Ups! Ein erforderliches Feld („${fieldName}“) wurde nicht zugeordnet. Bitte überprüfen und erneut versuchen.`,
        singleFieldMultipleColumns: (fieldName: string) => `Ups! Du hast ein einzelnes Feld („${fieldName}“) mehreren Spalten zugeordnet. Bitte überprüfe dies und versuche es erneut.`,
        emptyMappedField: (fieldName: string) => `Ups! Das Feld („${fieldName}“) enthält einen oder mehrere leere Werte. Bitte überprüfen Sie es und versuchen Sie es erneut.`,
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
        importMultiLevelTagsSuccessfulDescription: 'Hierarchische Tags wurden hinzugefügt.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `${rates} Übernachtungspauschalen wurden hinzugefügt.` : '1 Pauschale wurde hinzugefügt.'),
        importFailedTitle: 'Import fehlgeschlagen',
        importFailedDescription: 'Bitte stelle sicher, dass alle Felder korrekt ausgefüllt sind, und versuche es erneut. Wenn das Problem weiterhin besteht, wende dich bitte an Concierge.',
        importDescription: 'Wählen Sie aus, welche Felder aus Ihrer Tabelle zugeordnet werden sollen, indem Sie auf das Dropdown-Menü neben jeder der importierten Spalten unten klicken.',
        sizeNotMet: 'Dateigröße muss größer als 0 Bytes sein',
        invalidFileMessage:
            'Die Datei, die du hochgeladen hast, ist entweder leer oder enthält ungültige Daten. Bitte stelle sicher, dass die Datei korrekt formatiert ist und alle erforderlichen Informationen enthält, bevor du sie erneut hochlädst.',
        importSpreadsheetLibraryError: 'Laden des Tabellenmoduls fehlgeschlagen. Bitte überprüfe deine Internetverbindung und versuche es erneut.',
        importSpreadsheet: 'Tabellenkalkulation importieren',
        downloadCSV: 'CSV herunterladen',
        importMemberConfirmation: () => ({
            one: `Bitte bestätige die folgenden Angaben für ein neues Workspace-Mitglied, das im Rahmen dieses Uploads hinzugefügt wird. Bestehende Mitglieder erhalten keine Aktualisierung ihrer Rollen und keine Einladungsnachrichten.`,
            other: (count: number) =>
                `Bitte bestätige die folgenden Details für die ${count} neuen Workspace-Mitglieder, die im Rahmen dieses Uploads hinzugefügt werden. Bestehende Mitglieder erhalten keine Rollenaktualisierungen oder Einladung Nachrichten.`,
        }),
    },
    receipt: {
        upload: 'Beleg hochladen',
        uploadMultiple: 'Belege hochladen',
        desktopSubtitleSingle: `oder hierher ziehen und ablegen`,
        desktopSubtitleMultiple: `oder hierher ziehen und ablegen`,
        alternativeMethodsTitle: 'Weitere Möglichkeiten, Belege hinzuzufügen:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) =>
            `<label-text><a href="${downloadUrl}">Lade die App herunter</a>, um mit deinem Handy zu scannen</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Leite Belege weiter an <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Füge deine Nummer hinzu</a>, um Belege an ${phoneNumber} zu senden</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Belege per SMS an ${phoneNumber} senden (nur US-Nummern)</label-text>`,
        takePhoto: 'Foto aufnehmen',
        cameraAccess: 'Für das Fotografieren von Belegen ist der Kamerazugriff erforderlich.',
        deniedCameraAccess: `Der Kamerazugriff wurde noch nicht gewährt, bitte befolge <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">diese Anweisungen</a>.`,
        cameraErrorTitle: 'Kamerafehler',
        cameraErrorMessage: 'Beim Aufnehmen eines Fotos ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        locationAccessTitle: 'Standortzugriff erlauben',
        locationAccessMessage: 'Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall genau zu halten.',
        locationErrorTitle: 'Standortzugriff erlauben',
        locationErrorMessage: 'Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall genau zu halten.',
        allowLocationFromSetting: `Der Zugriff auf den Standort hilft uns, Ihre Zeitzone und Währung überall korrekt zu halten. Bitte erlauben Sie den Standortzugriff in den Berechtigungseinstellungen Ihres Geräts.`,
        dropTitle: 'Lass es los',
        dropMessage: 'Datei hier ablegen',
        flash: 'Blitz',
        multiScan: 'Mehrfachscan',
        shutter: 'Verschluss',
        gallery: 'Galerie',
        deleteReceipt: 'Beleg löschen',
        deleteConfirmation: 'Sind Sie sicher, dass Sie diesen Beleg löschen möchten?',
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
        splitScan: 'Beleg aufteilen',
        splitDistance: 'Strecke aufteilen',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Bezahle ${name ?? 'jemand'}`,
        assignTask: 'Aufgabe zuweisen',
        header: 'Schnellaktion',
        noLongerHaveReportAccess: 'Du hast keinen Zugriff mehr auf dein bisheriges Ziel für Schnellaktionen. Wähle unten ein neues aus.',
        updateDestination: 'Ziel aktualisieren',
        createReport: 'Bericht erstellen',
    },
    iou: {
        amount: 'Betrag',
        percent: 'Prozent',
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
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} von ${merchant}`,
        splitByPercentage: 'Nach Prozentsatz aufteilen',
        addSplit: 'Aufteilung hinzufügen',
        makeSplitsEven: 'Aufteilungen gleichmäßig machen',
        editSplits: 'Aufteilungen bearbeiten',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist um ${amount} höher als die ursprüngliche Ausgabe.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist um ${amount} geringer als die ursprüngliche Ausgabe.`,
        splitExpenseZeroAmount: 'Bitte gib vor dem Fortfahren einen gültigen Betrag ein.',
        splitExpenseOneMoreSplit: 'Keine Aufteilungen hinzugefügt. Fügen Sie mindestens eine hinzu, um zu speichern.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `${amount} für ${merchant} bearbeiten`,
        removeSplit: 'Aufteilung entfernen',
        splitExpenseCannotBeEditedModalTitle: 'Diese Ausgabe kann nicht bearbeitet werden',
        splitExpenseCannotBeEditedModalDescription: 'Genehmigte oder bezahlte Ausgaben können nicht bearbeitet werden',
        splitExpenseDistanceErrorModalDescription: 'Bitte beheben Sie den Fehler bei der Entfernungsrate und versuchen Sie es erneut.',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Bezahle ${name ?? 'jemand'}`,
        expense: 'Ausgabe',
        categorize: 'Kategorisieren',
        share: 'Teilen',
        participants: 'Teilnehmende',
        createExpense: 'Ausgabe erstellen',
        trackDistance: 'Entfernung verfolgen',
        createExpenses: (expensesNumber: number) => `${expensesNumber} Ausgaben erstellen`,
        removeExpense: 'Ausgabe entfernen',
        removeThisExpense: 'Diese Ausgabe entfernen',
        removeExpenseConfirmation: 'Sind Sie sicher, dass Sie diese Quittung entfernen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
        addExpense: 'Ausgabe hinzufügen',
        chooseRecipient: 'Empfänger auswählen',
        createExpenseWithAmount: ({amount}: {amount: string}) => `${amount} Ausgabe erstellen`,
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
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `hat diese Ausgabe verschoben${reportName ? `zu <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `hat diese Ausgabe verschoben${reportName ? `von <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `hat diese Ausgabe in deinen <a href="${reportUrl}">persönlichen Bereich</a> verschoben`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `hat diesen Bericht in den <a href="${newParentReportUrl}">${toPolicyName}</a>-Workspace verschoben`;
            }
            return `hat diesen <a href="${movedReportUrl}">Bericht</a> in den Workspace <a href="${newParentReportUrl}">${toPolicyName}</a> verschoben`;
        },
        pendingMatchWithCreditCard: 'Beleg wartet auf Abgleich mit Kartentransaktion',
        pendingMatch: 'Ausstehende Zuordnung',
        pendingMatchWithCreditCardDescription: 'Beleg wartet auf Zuordnung zu Kartentransaktion. Als bar markieren, um abzubrechen.',
        markAsCash: 'Als Barzahlung markieren',
        routePending: 'Route ausstehend...',
        receiptScanning: () => ({
            one: 'Belegerfassung läuft...',
            other: 'Belege werden gescannt ...',
        }),
        scanMultipleReceipts: 'Mehrere Belege scannen',
        scanMultipleReceiptsDescription: 'Mache auf einmal Fotos von all deinen Belegen und bestätige die Details selbst – oder wir erledigen das für dich.',
        receiptScanInProgress: 'Belegerfassung läuft',
        receiptScanInProgressDescription: 'Belegerfassung läuft. Später erneut prüfen oder die Details jetzt eingeben.',
        removeFromReport: 'Aus Bericht entfernen',
        moveToPersonalSpace: 'Verschiebe Ausgaben in deinen persönlichen Bereich',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Mögliche doppelte Ausgaben erkannt. Überprüfen Sie die Duplikate, um die Einreichung zu ermöglichen.'
                : 'Mögliche doppelte Ausgaben erkannt. Überprüfe die Duplikate, um die Genehmigung zu ermöglichen.',
        receiptIssuesFound: () => ({
            one: 'Problem gefunden',
            other: 'Gefundene Probleme',
        }),
        fieldPending: 'Ausstehend...',
        defaultRate: 'Standardtarif',
        receiptMissingDetails: 'Beleg mit fehlenden Angaben',
        missingAmount: 'Fehlender Betrag',
        missingMerchant: 'Fehlender Händler',
        receiptStatusTitle: 'Scannen…',
        receiptStatusText: 'Nur du kannst diese Quittung sehen, während sie gescannt wird. Schau später noch einmal vorbei oder gib die Details jetzt ein.',
        receiptScanningFailed: 'Belegerfassung fehlgeschlagen. Bitte gib die Details manuell ein.',
        transactionPendingDescription: 'Transaktion ausstehend. Die Buchung kann ein paar Tage dauern.',
        companyInfo: 'Unternehmensinformationen',
        companyInfoDescription: 'Wir benötigen noch ein paar Details, bevor du deine erste Rechnung senden kannst.',
        yourCompanyName: 'Name Ihres Unternehmens',
        yourCompanyWebsite: 'Die Website Ihres Unternehmens',
        yourCompanyWebsiteNote: 'Wenn Sie keine Website haben, können Sie stattdessen das LinkedIn- oder Social-Media-Profil Ihres Unternehmens angeben.',
        invalidDomainError: 'Sie haben eine ungültige Domain eingegeben. Um fortzufahren, geben Sie bitte eine gültige Domain ein.',
        publicDomainError: 'Sie haben eine öffentliche Domäne eingegeben. Um fortzufahren, geben Sie bitte eine private Domäne ein.',
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
        individual: 'Einzelperson',
        business: 'Geschäft',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} mit Expensify bezahlen` : `Mit Expensify bezahlen`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als Privatperson bezahlen` : `Mit privatem Konto bezahlen`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} mit Wallet bezahlen` : `Mit Wallet bezahlen`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `${formattedAmount} bezahlen`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als Unternehmen zahlen` : `Mit Geschäftskonto bezahlen`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als bezahlt markieren` : `Als bezahlt markieren`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `${amount} mit Privatkonto ${last4Digits} bezahlt` : `Mit privatem Konto bezahlt`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `${amount} mit dem Geschäftskonto ${last4Digits} bezahlt` : `Mit Geschäftskonto bezahlt`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Bezahle ${formattedAmount} über ${policyName}` : `Per ${policyName} bezahlen`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `${amount} mit Bankkonto ${last4Digits} bezahlt` : `bezahlt mit Bankkonto ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `${amount ? `${amount} ` : ''} mit Bankkonto ${last4Digits} über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a> bezahlt`,
        invoicePersonalBank: (lastFour: string) => `Persönliches Konto • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Geschäftskonto • ${lastFour}`,
        nextStep: 'Nächste Schritte',
        finished: 'Fertig',
        flip: 'Drehen',
        sendInvoice: ({amount}: RequestAmountParams) => `${amount} Rechnung senden`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `für ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `Eingereicht${memo ? `, mit dem Hinweis ${memo}` : ''}`,
        automaticallySubmitted: `eingereicht über <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">verspätete Einreichungen</a>`,
        queuedToSubmitViaDEW: 'in die Warteschlange gestellt zur Einreichung über benutzerdefinierten Genehmigungsworkflow',
        queuedToApproveViaDEW: 'in die Warteschlange gestellt zur Genehmigung über benutzerdefinierten Genehmigungsworkflow',
        trackedAmount: (formattedAmount: string, comment?: string) => `Verfolgung von ${formattedAmount}${comment ? `für ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `Split ${amount}`,
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
        payerSettled: (amount: number | string) => `bezahlt ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `${amount} bezahlt. Füge ein Bankkonto hinzu, um deine Zahlung zu erhalten.`,
        automaticallyApproved: `über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a> genehmigt`,
        approvedAmount: (amount: number | string) => `${amount} genehmigt`,
        approvedMessage: `Genehmigt`,
        unapproved: `nicht genehmigt`,
        automaticallyForwarded: `über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a> genehmigt`,
        forwarded: `Genehmigt`,
        rejectedThisReport: 'hat diesen Bericht abgelehnt',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `hat die Zahlung gestartet, wartet aber darauf, dass ${submitterDisplayName} ein Bankkonto hinzufügt.`,
        adminCanceledRequest: 'hat die Zahlung storniert',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `hat die Zahlung über ${amount} storniert, weil ${submitterDisplayName} seine Expensify Wallet nicht innerhalb von 30 Tagen aktiviert hat`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} hat ein Bankkonto hinzugefügt. Die Zahlung über ${amount} wurde durchgeführt.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}als bezahlt markiert${comment ? `, mit dem Kommentar "${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}mit Wallet bezahlt`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}mit Expensify über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a> bezahlt`,
        noReimbursableExpenses: 'Dieser Bericht enthält einen ungültigen Betrag',
        pendingConversionMessage: 'Die Gesamtsumme wird aktualisiert, sobald du wieder online bist',
        changedTheExpense: 'die Ausgabe geändert',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `${valueName} auf ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `setze ${translatedChangedField} auf ${newMerchant}, wodurch der Betrag auf ${newAmountToDisplay} gesetzt wurde`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `das ${valueName} (zuvor ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `${valueName} auf ${newValueToDisplay} (zuvor ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `änderte ${translatedChangedField} zu ${newMerchant} (zuvor ${oldMerchant}), wodurch der Betrag auf ${newAmountToDisplay} aktualisiert wurde (zuvor ${oldAmountToDisplay})`,
        basedOnAI: 'basierend auf bisherigen Aktivitäten',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `basierend auf den <a href="${rulesLink}">Arbeitsbereichsregeln</a>` : 'basierend auf Arbeitsbereichsregel'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `für ${comment}` : 'Ausgabe'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Rechnung ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} gesendet${comment ? `für ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `Ausgabe von persönlichem Bereich nach ${workspaceName ?? `Chat mit ${reportName}`} verschoben`,
        movedToPersonalSpace: 'Ausgabe in den persönlichen Bereich verschoben',
        error: {
            invalidCategoryLength: 'Der Kategoriename überschreitet 255 Zeichen. Bitte kürze ihn oder wähle eine andere Kategorie.',
            invalidTagLength: 'Der Tagname überschreitet 255 Zeichen. Bitte verkürze ihn oder wähle einen anderen Tag.',
            invalidAmount: 'Bitte geben Sie einen gültigen Betrag ein, bevor Sie fortfahren',
            invalidDistance: 'Bitte geben Sie vor dem Fortfahren eine gültige Entfernung ein',
            invalidIntegerAmount: 'Bitte geben Sie einen ganzen Dollarbetrag ein, bevor Sie fortfahren',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Der maximale Steuerbetrag beträgt ${amount}`,
            invalidSplit: 'Die Summe der Aufteilungen muss dem Gesamtbetrag entsprechen',
            invalidSplitParticipants: 'Bitte geben Sie für mindestens zwei Teilnehmende einen Betrag größer als null ein',
            invalidSplitYourself: 'Bitte geben Sie einen von Null verschiedenen Betrag für Ihre Aufteilung ein',
            noParticipantSelected: 'Bitte wähle einen Teilnehmer aus',
            other: 'Unerwarteter Fehler. Bitte versuchen Sie es später noch einmal.',
            genericCreateFailureMessage: 'Unerwarteter Fehler beim Einreichen dieser Ausgabe. Bitte versuche es später erneut.',
            genericCreateInvoiceFailureMessage: 'Unerwarteter Fehler beim Senden dieser Rechnung. Bitte versuchen Sie es später erneut.',
            genericHoldExpenseFailureMessage: 'Unerwarteter Fehler beim Zurückhalten dieser Ausgabe. Bitte versuchen Sie es später noch einmal.',
            genericUnholdExpenseFailureMessage: 'Unerwarteter Fehler beim Entfernen der Sperre für diese Ausgabe. Bitte versuche es später noch einmal.',
            receiptDeleteFailureError: 'Unerwarteter Fehler beim Löschen dieses Belegs. Bitte versuchen Sie es später noch einmal.',
            receiptFailureMessage:
                '<rbr>Beim Hochladen Ihres Belegs ist ein Fehler aufgetreten. Bitte <a href="download">speichern Sie den Beleg</a> und <a href="retry">versuchen Sie es</a> später erneut.</rbr>',
            receiptFailureMessageShort: 'Beim Hochladen Ihres Belegs ist ein Fehler aufgetreten.',
            genericDeleteFailureMessage: 'Unerwarteter Fehler beim Löschen dieser Ausgabe. Bitte versuche es später erneut.',
            genericEditFailureMessage: 'Unerwarteter Fehler beim Bearbeiten dieser Ausgabe. Bitte versuche es später erneut.',
            genericSmartscanFailureMessage: 'Transaktion hat fehlende Felder',
            duplicateWaypointsErrorMessage: 'Bitte entfernen Sie doppelte Wegpunkte',
            atLeastTwoDifferentWaypoints: 'Bitte gib mindestens zwei verschiedene Adressen ein',
            splitExpenseMultipleParticipantsErrorMessage: 'Eine Ausgabe kann nicht zwischen einem Workspace und anderen Mitgliedern aufgeteilt werden. Bitte aktualisiere deine Auswahl.',
            invalidMerchant: 'Bitte gib einen gültigen Händler ein',
            atLeastOneAttendee: 'Mindestens ein Teilnehmer muss ausgewählt werden',
            invalidQuantity: 'Bitte gib eine gültige Menge ein',
            quantityGreaterThanZero: 'Die Menge muss größer als Null sein',
            invalidSubrateLength: 'Es muss mindestens einen Untertarif geben',
            invalidRate: 'Satz für diesen Workspace ungültig. Bitte wählen Sie einen verfügbaren Satz aus dem Workspace aus.',
            endDateBeforeStartDate: 'Das Enddatum darf nicht vor dem Startdatum liegen',
            endDateSameAsStartDate: 'Das Enddatum darf nicht mit dem Startdatum identisch sein',
            manySplitsProvided: `Die maximale Anzahl zulässiger Aufteilungen beträgt ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `Der Datumsbereich darf ${CONST.IOU.SPLITS_LIMIT} Tage nicht überschreiten.`,
            invalidReadings: 'Bitte geben Sie sowohl Anfangs- als auch Endstand ein',
            negativeDistanceNotAllowed: 'Endablesung muss größer als Startablesung sein',
        },
        dismissReceiptError: 'Fehler ausblenden',
        dismissReceiptErrorConfirmation: 'Achtung! Wenn du diesen Fehler verwirfst, wird dein hochgeladener Beleg vollständig entfernt. Bist du sicher?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `hat mit dem Ausgleich begonnen. Die Zahlung ist angehalten, bis ${submitterDisplayName} sein Wallet aktiviert.`,
        enableWallet: 'Wallet aktivieren',
        hold: 'Halten',
        unhold: 'Sperre aufheben',
        holdExpense: () => ({
            one: 'Ausgabe zurückhalten',
            other: 'Ausgaben zurückhalten',
        }),
        unholdExpense: 'Ausgabe entsperren',
        heldExpense: 'hat diese Ausgabe zurückgestellt',
        unheldExpense: 'Sperre für diese Ausgabe aufgehoben',
        moveUnreportedExpense: 'Nicht gemeldete Ausgabe verschieben',
        addUnreportedExpense: 'Nicht gemeldete Ausgabe hinzufügen',
        selectUnreportedExpense: 'Wählen Sie mindestens eine Ausgabe aus, die dem Bericht hinzugefügt werden soll.',
        emptyStateUnreportedExpenseTitle: 'Keine nicht gemeldeten Ausgaben',
        emptyStateUnreportedExpenseSubtitle: 'Sie scheinen keine nicht gemeldeten Ausgaben zu haben. Versuchen Sie, unten eine zu erstellen.',
        addUnreportedExpenseConfirm: 'Zum Bericht hinzufügen',
        newReport: 'Neuer Bericht',
        explainHold: () => ({
            one: 'Erklären Sie, warum Sie diese Ausgabe zurückhalten.',
            other: 'Erklären Sie, warum Sie diese Ausgaben zurückhalten.',
        }),
        retracted: 'zurückgezogen',
        retract: 'Zurückziehen',
        reopened: 'Wiedereröffnet',
        reopenReport: 'Bericht wieder öffnen',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Dieser Bericht wurde bereits nach ${connectionName} exportiert. Änderungen daran können zu Datenabweichungen führen. Sind Sie sicher, dass Sie diesen Bericht wieder öffnen möchten?`,
        reason: 'Grund',
        holdReasonRequired: 'Beim Zurückhalten ist eine Begründung erforderlich.',
        expenseWasPutOnHold: 'Ausgabe wurde zurückgestellt',
        expenseOnHold: 'Diese Ausgabe wurde zurückgestellt. Bitte überprüfe die Kommentare für die nächsten Schritte.',
        expensesOnHold: 'Alle Ausgaben wurden angehalten. Bitte überprüfen Sie die Kommentare für die nächsten Schritte.',
        expenseDuplicate: 'Diese Ausgabe weist ähnliche Details wie eine andere auf. Bitte überprüfe die Duplikate, um fortzufahren.',
        someDuplicatesArePaid: 'Einige dieser Duplikate wurden bereits genehmigt oder bezahlt.',
        reviewDuplicates: 'Duplikate prüfen',
        keepAll: 'Alle behalten',
        confirmApprove: 'Genehmigungsbetrag bestätigen',
        confirmApprovalAmount: 'Nur konforme Ausgaben genehmigen oder den gesamten Bericht genehmigen.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist zurückgestellt. Möchtest du sie trotzdem genehmigen?',
            other: 'Diese Ausgaben sind zurückgestellt. Möchtest du sie trotzdem genehmigen?',
        }),
        confirmPay: 'Zahlungsbetrag bestätigen',
        confirmPayAmount: 'Bezahle, was nicht zurückgestellt ist, oder bezahle den gesamten Bericht.',
        confirmPayAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist ausgesetzt. Möchtest du sie trotzdem bezahlen?',
            other: 'Diese Ausgaben sind angehalten. Möchtest du sie trotzdem bezahlen?',
        }),
        payOnly: 'Nur bezahlen',
        approveOnly: 'Nur genehmigen',
        holdEducationalTitle: 'Solltest du diese Ausgabe zurückhalten?',
        whatIsHoldExplain: '„Anhalten“ ist wie auf „Pause“ drücken bei einer Ausgabe, bis du bereit bist, sie einzureichen.',
        holdIsLeftBehind: 'Zurückgehaltene Ausgaben werden nicht eingereicht, selbst wenn du einen gesamten Bericht einreichst.',
        unholdWhenReady: 'Gib Ausgaben wieder frei, wenn du bereit bist, sie einzureichen.',
        changePolicyEducational: {
            title: 'Du hast diesen Bericht verschoben!',
            description: 'Überprüfen Sie diese Punkte noch einmal, da sie sich häufig ändern, wenn Berichte in einen neuen Workspace verschoben werden.',
            reCategorize: '<strong>Kategorisiere alle Ausgaben neu</strong>, um die Workspace-Regeln einzuhalten.',
            workflows: 'Für diesen Bericht kann jetzt ein anderer <strong>Genehmigungsworkflow</strong> gelten.',
        },
        changeWorkspace: 'Arbeitsbereich wechseln',
        set: 'Festlegen',
        changed: 'Geändert',
        removed: 'Entfernt',
        transactionPending: 'Transaktion ausstehend.',
        chooseARate: 'Wählen Sie einen Erstattungsbetrag pro Meile oder Kilometer für den Workspace aus',
        unapprove: 'Genehmigung aufheben',
        unapproveReport: 'Berichtsgenehmigung aufheben',
        headsUp: 'Achtung!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Dieser Bericht wurde bereits nach ${accountingIntegration} exportiert. Änderungen können zu Datenabweichungen führen. Sind Sie sicher, dass Sie die Genehmigung dieses Berichts zurückziehen möchten?`,
        reimbursable: 'erstattungsfähig',
        nonReimbursable: 'nicht erstattungsfähig',
        bookingPending: 'Diese Buchung ist ausstehend',
        bookingPendingDescription: 'Diese Buchung ist ausstehend, da sie noch nicht bezahlt wurde.',
        bookingArchived: 'Diese Buchung ist archiviert',
        bookingArchivedDescription: 'Diese Buchung ist archiviert, weil das Reisedatum bereits vorbei ist. Fügen Sie bei Bedarf eine Ausgabe für den Endbetrag hinzu.',
        attendees: 'Teilnehmer',
        whoIsYourAccountant: 'Wer ist Ihr Buchhalter?',
        paymentComplete: 'Zahlung abgeschlossen',
        time: 'Zeit',
        startDate: 'Startdatum',
        endDate: 'Enddatum',
        startTime: 'Startzeit',
        endTime: 'Endzeit',
        deleteSubrate: 'Unterrate löschen',
        deleteSubrateConfirmation: 'Sind Sie sicher, dass Sie diesen Untertarif löschen möchten?',
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
            one: `Reise: 1 ganzer Tag`,
            other: (count: number) => `Reise: ${count} volle Tage`,
        }),
        dates: 'Daten',
        rates: 'Tarife',
        submitsTo: ({name}: SubmitsToParams) => `Sendet an ${name}`,
        reject: {
            educationalTitle: 'Solltest du annehmen oder ablehnen?',
            educationalText: 'Wenn du eine Ausgabe noch nicht genehmigen oder bezahlen möchtest, kannst du sie zurückstellen oder ablehnen.',
            holdExpenseTitle: 'Eine Ausgabe zurückhalten, um vor der Genehmigung oder Bezahlung weitere Details anzufordern.',
            approveExpenseTitle: 'Genehmigen Sie andere Spesen, während zurückgehaltene Spesen weiterhin Ihnen zugewiesen bleiben.',
            heldExpenseLeftBehindTitle: 'Zurückgestellte Ausgaben bleiben zurück, wenn du einen gesamten Bericht freigibst.',
            rejectExpenseTitle: 'Lehne eine Ausgabe ab, die du nicht genehmigen oder bezahlen möchtest.',
            reasonPageTitle: 'Ausgabe ablehnen',
            reasonPageDescription: 'Erklären Sie, warum Sie diese Ausgabe ablehnen.',
            rejectReason: 'Ablehnungsgrund',
            markAsResolved: 'Als erledigt markieren',
            rejectedStatus: 'Diese Ausgabe wurde abgelehnt. Wir warten darauf, dass du die Probleme behebst und sie als gelöst markierst, um die Einreichung zu ermöglichen.',
            reportActions: {
                rejectedExpense: 'hat diese Ausgabe abgelehnt',
                markedAsResolved: 'hat den Ablehnungsgrund als behoben markiert',
            },
        },
        moveExpenses: () => ({one: 'Auslage verschieben', other: 'Ausgaben verschieben'}),
        moveExpensesError: 'Sie können Per Diem-Ausgaben nicht in Berichte auf anderen Arbeitsbereichen verschieben, da sich die Tagessätze zwischen Arbeitsbereichen unterscheiden können.',
        changeApprover: {
            title: 'Genehmigenden ändern',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Wählen Sie eine Option, um den Genehmiger für diesen Bericht zu ändern. (Aktualisieren Sie Ihre <a href="${workflowSettingLink}">Arbeitsbereichseinstellungen</a>, um diese Änderung dauerhaft für alle Berichte zu übernehmen.)`,
            changedApproverMessage: (managerID: number) => `Genehmigenden in <mention-user accountID="${managerID}"/> geändert`,
            actions: {
                addApprover: 'Genehmiger hinzufügen',
                addApproverSubtitle: 'Fügen Sie dem bestehenden Workflow einen zusätzlichen Genehmiger hinzu.',
                bypassApprovers: 'Genehmiger überspringen',
                bypassApproversSubtitle: 'Weisen Sie sich selbst als endgültige:r Genehmiger:in zu und überspringen Sie alle verbleibenden Genehmiger.',
            },
            addApprover: {
                subtitle: 'Wählen Sie eine zusätzliche genehmigende Person für diesen Bericht aus, bevor wir ihn durch den restlichen Genehmigungs-Workflow weiterleiten.',
            },
        },
        chooseWorkspace: 'Arbeitsbereich auswählen',
        date: 'Datum',
        splitDates: 'Datumsangaben aufteilen',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} bis ${endDate} (${count} Tage)`,
        splitByDate: 'Nach Datum aufteilen',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `bericht aufgrund eines benutzerdefinierten Genehmigungsworkflows an ${to} weitergeleitet`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'Stunde' : 'Stunden'} @ ${rate} / Stunde`,
            hrs: 'Std.',
            hours: 'Stunden',
            ratePreview: (rate: string) => `${rate} / Stunde`,
            amountTooLargeError: 'Der Gesamtbetrag ist zu hoch. Verringere die Stunden oder reduziere den Satz.',
        },
        correctDistanceRateError: 'Beheben Sie den Fehler beim Entfernungssatz und versuchen Sie es erneut.',
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
                    return `Steuersatz zu „${taxRateName}“`;
                }
                const updatedValue = value as string | boolean;
                if (isFirst) {
                    return `Setzen Sie ${translations.common[key].toLowerCase()} auf „${updatedValue}“`;
                }
                return `${translations.common[key].toLowerCase()} zu "${updatedValue}"`;
            });
            return `${formatList(fragments)} über <a href="${policyRulesRoute}">Workspace-Regeln</a>`;
        },
    },
    transactionMerge: {
        listPage: {
            header: 'Ausgaben zusammenführen',
            noEligibleExpenseFound: 'Keine berechtigten Spesen gefunden',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Du hast keine Ausgaben, die mit dieser zusammengeführt werden können. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Erfahre mehr</a> über berechtigte Ausgaben.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Wähle eine <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">berechtigte Ausgabe</a> aus, die mit <strong>${reportName}</strong> zusammengeführt werden soll.`,
        },
        receiptPage: {
            header: 'Beleg auswählen',
            pageTitle: 'Wählen Sie den Beleg aus, den Sie behalten möchten:',
        },
        detailsPage: {
            header: 'Details auswählen',
            pageTitle: 'Wählen Sie die Details aus, die Sie behalten möchten:',
            noDifferences: 'Keine Unterschiede zwischen den Transaktionen gefunden',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? 'ein' : 'a';
                return `Bitte wählen Sie ${article} ${field} aus`;
            },
            pleaseSelectAttendees: 'Bitte wählen Sie Teilnehmer aus',
            selectAllDetailsError: 'Wähle alle Details aus, bevor du fortfährst.',
        },
        confirmationPage: {
            header: 'Details bestätigen',
            pageTitle: 'Bestätigen Sie die Details, die Sie behalten. Die Details, die Sie nicht behalten, werden gelöscht.',
            confirmButton: 'Ausgaben zusammenführen',
        },
    },
    share: {
        shareToExpensify: 'Mit Expensify teilen',
        messageInputLabel: 'Nachricht',
    },
    notificationPreferencesPage: {
        header: 'Benachrichtigungseinstellungen',
        label: 'Benachrichtige mich über neue Nachrichten',
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
        viewPhoto: 'Foto ansehen',
        imageUploadFailed: 'Bild-Upload fehlgeschlagen',
        deleteWorkspaceError: 'Entschuldigung, beim Löschen deines Workspace-Avatars ist ein unerwartetes Problem aufgetreten',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Das ausgewählte Bild überschreitet die maximale Uploadgröße von ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Bitte laden Sie ein Bild hoch, das größer als ${minHeightInPx}x${minWidthInPx} Pixel und kleiner als ${maxHeightInPx}x${maxWidthInPx} Pixel ist.`,
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
        backdropLabel: 'Modal-Hintergrund',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten auf <strong>dich</strong>, um Ausgaben hinzuzufügen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten, bis <strong>${actor}</strong> Ausgaben hinzufügt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass ein Admin Ausgaben hinzufügt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> Spesen einreichst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> Ausgaben einreicht.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf einen Admin, der Ausgaben einreicht.`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Keine weiteren Maßnahmen erforderlich!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten auf <strong>dich</strong>, um ein Bankkonto hinzuzufügen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> ein Bankkonto hinzufügt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf einen Admin, der ein Bankkonto hinzufügt.`;
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
                        return `Warten darauf, dass <strong>deine</strong> Spesen automatisch eingereicht werden${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass die Ausgaben von <strong>${actor}</strong> automatisch eingereicht werden${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass die Spesen eines Admins automatisch eingereicht werden${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> die Probleme behebst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf <strong>${actor}</strong>, um die Probleme zu beheben.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf einen Admin, um die Probleme zu beheben.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> Ausgaben genehmigst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf <strong>${actor}</strong>, um Spesen zu genehmigen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf die Genehmigung von Spesen durch einen Admin.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> diesen Bericht exportierst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten, bis <strong>${actor}</strong> diesen Bericht exportiert.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf einen Admin, um diesen Bericht zu exportieren.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> Spesen bezahlst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf <strong>${actor}</strong>, um Spesen zu bezahlen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf einen Admin, der Spesen bezahlt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> die Einrichtung eines Geschäftskontos abschließt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten, bis <strong>${actor}</strong> die Einrichtung eines Geschäftskontos abgeschlossen hat.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf einen Admin, der das Geschäftskonto fertig einrichtet.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `bis ${eta}` : ` ${eta}`;
                }
                return `Warten auf Abschluss der Zahlung${formattedETA}.`;
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `Ups! Sie scheinen diesen Bericht bei <strong>sich selbst</strong> einzureichen. Das Genehmigen eigener Berichte ist in Ihrem Workspace <strong>verboten</strong>. Bitte reichen Sie diesen Bericht bei jemand anderem ein oder kontaktieren Sie Ihren Admin, um die Person zu ändern, an die Sie Berichte einreichen.`,
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
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Bevorzugte Pronomen',
        selectYourPronouns: 'Wähle deine Pronomen',
        selfSelectYourPronoun: 'Wähle dein Pronomen selbst aus',
        emailAddress: 'E-Mail-Adresse',
        setMyTimezoneAutomatically: 'Meine Zeitzone automatisch einstellen',
        timezone: 'Zeitzone',
        invalidFileMessage: 'Ungültige Datei. Bitte versuche ein anderes Bild.',
        avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchronisierung',
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
        placeholderText: 'Suchen, um Optionen anzuzeigen',
    },
    contacts: {
        contactMethods: 'Kontaktmethoden',
        featureRequiresValidate: 'Für diese Funktion müssen Sie Ihr Konto verifizieren.',
        validateAccount: 'Überprüfe dein Konto',
        helpText: ({email}: {email: string}) =>
            `Füge weitere Möglichkeiten hinzu, dich anzumelden und Belege an Expensify zu senden.<br/><br/>Füge eine E‑Mail-Adresse hinzu, um Belege an <a href="mailto:${email}">${email}</a> weiterzuleiten, oder füge eine Telefonnummer hinzu, um Belege per SMS an 47777 zu senden (nur US-Nummern).`,
        pleaseVerify: 'Bitte verifiziere diese Kontaktmethode.',
        getInTouch: 'Wir verwenden diese Methode, um Sie zu kontaktieren.',
        enterMagicCode: (contactMethod: string) => `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde. Er sollte innerhalb ein bis zwei Minuten ankommen.`,
        setAsDefault: 'Als Standard festlegen',
        yourDefaultContactMethod:
            'Dies ist Ihre aktuelle Standardkontaktmethode. Bevor Sie sie löschen können, müssen Sie eine andere Kontaktmethode auswählen und auf „Als Standard festlegen“ klicken.',
        removeContactMethod: 'Kontaktmethode entfernen',
        removeAreYouSure: 'Sind Sie sicher, dass Sie diese Kontaktmethode entfernen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
        failedNewContact: 'Diese Kontaktmethode konnte nicht hinzugefügt werden.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Senden eines neuen Magic-Codes fehlgeschlagen. Bitte warten Sie einen Moment und versuchen Sie es erneut.',
            validateSecondaryLogin: 'Falscher oder ungültiger magischer Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            deleteContactMethod: 'Löschen der Kontaktmethode fehlgeschlagen. Bitte wende dich an Concierge, um Hilfe zu erhalten.',
            setDefaultContactMethod: 'Fehler beim Festlegen einer neuen Standardkontaktmethode. Bitte wenden Sie sich für Hilfe an Concierge.',
            addContactMethod: 'Diese Kontaktmethode konnte nicht hinzugefügt werden. Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
            enteredMethodIsAlreadySubmitted: 'Diese Kontaktmethode existiert bereits',
            passwordRequired: 'Passwort erforderlich.',
            contactMethodRequired: 'Kontaktmethode ist erforderlich',
            invalidContactMethod: 'Ungültige Kontaktmethode',
        },
        newContactMethod: 'Neue Kontaktmethode',
        goBackContactMethods: 'Zurück zu Kontaktmethoden',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Er / Ihn / Sein',
        heHimHisTheyThemTheirs: 'Er / Ihn / Sein / Sie / Ihnen / Ihrer',
        sheHerHers: 'Sie / Ihr / Ihre',
        sheHerHersTheyThemTheirs: 'Sie / Ihr / Ihre / Sie / Ihnen / Ihre',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Pro / Pers',
        theyThemTheirs: 'Sie / ihnen / ihre',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Sie / Ihnen',
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
        getLocationAutomatically: 'Ihren Standort automatisch ermitteln',
    },
    updateRequiredView: {
        updateRequired: 'Update erforderlich',
        pleaseInstall: 'Bitte auf die neueste Version von New Expensify aktualisieren',
        pleaseInstallExpensifyClassic: 'Bitte installiere die neueste Version von Expensify',
        toGetLatestChanges: 'Für Mobilgeräte laden Sie die neueste Version herunter und installieren Sie sie. Für das Web aktualisieren Sie Ihren Browser.',
        newAppNotAvailable: 'Die neue Expensify-App ist nicht mehr verfügbar.',
    },
    initialSettingsPage: {
        about: 'Info',
        aboutPage: {
            description: 'Die neue Expensify App wird von einer Community aus Open-Source-Entwicklern auf der ganzen Welt entwickelt. Hilf uns, die Zukunft von Expensify zu gestalten.',
            appDownloadLinks: 'App-Downloadlinks',
            viewKeyboardShortcuts: 'Tastenkürzel anzeigen',
            viewTheCode: 'Code anzeigen',
            viewOpenJobs: 'Offene Jobs anzeigen',
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
                '<muted-text>Nutze die folgenden Tools, um Probleme mit der Expensify-Nutzung zu beheben. Wenn du auf Probleme stößt, <concierge-link>reiche bitte einen Bug ein</concierge-link>.</muted-text>',
            confirmResetDescription: 'Alle nicht gesendeten Entwürfe von Nachrichten gehen verloren, aber alle anderen Daten sind sicher.',
            resetAndRefresh: 'Zurücksetzen und aktualisieren',
            clientSideLogging: 'Clientseitige Protokollierung',
            noLogsToShare: 'Keine Protokolle zum Teilen',
            useProfiling: 'Profiling verwenden',
            profileTrace: 'Profil-Trace',
            results: 'Ergebnisse',
            releaseOptions: 'Veröffentlichungsoptionen',
            testingPreferences: 'Testeinstellungen',
            useStagingServer: 'Staging-Server verwenden',
            forceOffline: 'Offline erzwingen',
            simulatePoorConnection: 'Schlechte Internetverbindung simulieren',
            simulateFailingNetworkRequests: 'Fehlgeschlagene Netzwerkanfragen simulieren',
            authenticationStatus: 'Authentifizierungsstatus',
            deviceCredentials: 'Geräteanmeldedaten',
            invalidate: 'Ungültig machen',
            destroy: 'Zerstören',
            maskExportOnyxStateData: 'Fragile Mitgliederdaten beim Exportieren des Onyx-Status maskieren',
            exportOnyxState: 'Onyx-Status exportieren',
            importOnyxState: 'Onyx-Status importieren',
            testCrash: 'Absturz testen',
            resetToOriginalState: 'Auf ursprünglichen Zustand zurücksetzen',
            usingImportedState: 'Du verwendest importierten Status. Drücke hier, um ihn zu löschen.',
            debugMode: 'Debug-Modus',
            invalidFile: 'Ungültige Datei',
            invalidFileDescription: 'Die Datei, die Sie zu importieren versuchen, ist ungültig. Bitte versuchen Sie es erneut.',
            invalidateWithDelay: 'Mit Verzögerung ungültig machen',
            recordTroubleshootData: 'Fehlerdaten aufzeichnen',
            softKillTheApp: 'App sanft beenden',
            kill: 'Beenden',
            sentryDebug: 'Sentry-Debug',
            sentryDebugDescription: 'Sentry-Anfragen in der Konsole protokollieren',
            sentryHighlightedSpanOps: 'Hervorgehobene Span-Namen',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaction.click, navigation, ui.load',
            leftHandNavCache: 'Cache für linke Seitenleiste',
            clearleftHandNavCache: 'Löschen',
        },
        debugConsole: {
            saveLog: 'Protokoll speichern',
            shareLog: 'Protokoll freigeben',
            enterCommand: 'Befehl eingeben',
            execute: 'Ausführen',
            noLogsAvailable: 'Keine Protokolle verfügbar',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `Die Protokollgröße überschreitet das Limit von ${size} MB. Bitte verwenden Sie „Protokoll speichern“, um die Protokolldatei stattdessen herunterzuladen.`,
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
        whatIsNew: 'Was ist neu',
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
        closeAccountPermanentlyDeleteData: 'Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Dadurch werden alle ausstehenden Spesen endgültig gelöscht.',
        enterDefaultContactToConfirm: 'Bitte geben Sie Ihre bevorzugte Kontaktmethode ein, um zu bestätigen, dass Sie Ihr Konto schließen möchten. Ihre bevorzugte Kontaktmethode ist:',
        enterDefaultContact: 'Geben Sie Ihre Standardkontaktmethode ein',
        defaultContact: 'Standardkontaktmethode',
        enterYourDefaultContactMethod: 'Bitte geben Sie Ihre bevorzugte Kontaktmethode ein, um Ihr Konto zu schließen.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Konten zusammenführen',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Geben Sie das Konto ein, das Sie mit <strong>${login}</strong> zusammenführen möchten.`,
            notReversibleConsent: 'Ich verstehe, dass dies nicht rückgängig gemacht werden kann',
        },
        accountValidate: {
            confirmMerge: 'Bist du sicher, dass du Konten zusammenführen möchtest?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `Das Zusammenführen deiner Konten kann nicht rückgängig gemacht werden und führt zum Verlust aller nicht eingereichten Ausgaben für <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Um fortzufahren, gib bitte den magischen Code ein, der an <strong>${login}</strong> gesendet wurde.`,
            errors: {
                incorrectMagicCode: 'Falscher oder ungültiger magischer Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
                fallback: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konten zusammengeführt!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Du hast alle Daten erfolgreich von <strong>${from}</strong> in <strong>${to}</strong> zusammengeführt. Künftig kannst du für dieses Konto beide Logins verwenden.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Wir arbeiten daran',
            limitedSupport: 'Wir unterstützen das Zusammenführen von Konten in New Expensify noch nicht. Bitte führen Sie diese Aktion stattdessen in Expensify Classic aus.',
            reachOutForHelp: '<muted-text><centered-text>Wende dich gerne an den <concierge-link>Concierge</concierge-link>, wenn du Fragen hast!</centered-text></muted-text>',
            goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Du kannst <strong>${email}</strong> nicht zusammenführen, weil es von <strong>${email.split('@').at(1) ?? ''}</strong> verwaltet wird. Bitte <concierge-link>wende dich an Concierge</concierge-link>, um Unterstützung zu erhalten.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Du kannst <strong>${email}</strong> nicht mit anderen Konten zusammenführen, weil dein Domain-Administrator es als deine primäre Anmeldung festgelegt hat. Bitte führe stattdessen andere Konten damit zusammen.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Du kannst Konten nicht zusammenführen, weil für <strong>${email}</strong> die Zwei-Faktor-Authentifizierung (2FA) aktiviert ist. Bitte deaktiviere 2FA für <strong>${email}</strong> und versuche es erneut.</centered-text></muted-text>`,
            learnMore: 'Erfahre mehr über das Zusammenführen von Konten.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Sie können <strong>${email}</strong> nicht zusammenführen, da sie gesperrt ist. Bitte <concierge-link>wenden Sie sich für Unterstützung an Concierge</concierge-link>.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Du kannst keine Konten zusammenführen, weil <strong>${email}</strong> kein Expensify-Konto hat. Bitte <a href="${contactMethodLink}">füge sie stattdessen als Kontaktmethode hinzu</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Sie können <strong>${email}</strong> nicht mit anderen Konten zusammenführen. Bitte führen Sie stattdessen andere Konten mit diesem zusammen.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Sie können keine Konten in <strong>${email}</strong> zusammenführen, da dieses Konto eine abgerechnete Abonnementbeziehung besitzt.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Versuche es später noch einmal',
            description: 'Es wurden zu viele Versuche unternommen, Konten zusammenzuführen. Bitte versuchen Sie es später erneut.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Sie können nicht mit anderen Konten zusammenführen, weil dieses nicht verifiziert ist. Bitte verifizieren Sie das Konto und versuchen Sie es erneut.',
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
            'Ist Ihnen etwas Ungewöhnliches an Ihrem Konto aufgefallen? Eine Meldung sperrt Ihr Konto sofort, blockiert neue Expensify Card‑Transaktionen und verhindert alle Kontoänderungen.',
        domainAdminsDescription: 'Für Domain-Admins: Dadurch werden außerdem alle Expensify Card-Aktivitäten und Admin-Aktionen in deinen Domains pausiert.',
        areYouSure: 'Sind Sie sicher, dass Sie Ihr Expensify-Konto sperren möchten?',
        onceLocked: 'Sobald Ihr Konto gesperrt ist, wird es eingeschränkt, bis eine Entsperrungsanfrage gestellt und eine Sicherheitsüberprüfung durchgeführt wurde',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Konto konnte nicht gesperrt werden',
        failedToLockAccountDescription: `Wir konnten Ihr Konto nicht sperren. Bitte chatten Sie mit Concierge, um dieses Problem zu lösen.`,
        chatWithConcierge: 'Chat mit Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Konto gesperrt',
        yourAccountIsLocked: 'Ihr Konto ist gesperrt',
        chatToConciergeToUnlock: 'Chatte mit Concierge, um Sicherheitsbedenken zu klären und dein Konto wieder freizuschalten.',
        chatWithConcierge: 'Chat mit Concierge',
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
        noAuthenticatorApp: 'Du benötigst keine Authentifizierungs-App mehr, um dich bei Expensify anzumelden.',
        stepCodes: 'Wiederherstellungscodes',
        keepCodesSafe: 'Bewahre diese Wiederherstellungscodes sicher auf!',
        codesLoseAccess: dedent(`
            Wenn du den Zugriff auf deine Authentifizierungs-App verlierst und diese Codes nicht hast, verlierst du den Zugriff auf dein Konto.

            Hinweis: Das Einrichten der Zwei-Faktor-Authentifizierung meldet dich von allen anderen aktiven Sitzungen ab.
        `),
        errorStepCodes: 'Bitte kopieren oder laden Sie die Codes herunter, bevor Sie fortfahren',
        stepVerify: 'Verifizieren',
        scanCode: 'Scannen Sie den QR-Code mit Ihrem',
        authenticatorApp: 'Authentifizierungs-App',
        addKey: 'Oder füge diesen geheimen Schlüssel zu deiner Authentifikator-App hinzu:',
        enterCode: 'Gib dann den sechsstelligen Code ein, der von deiner Authentifizierungs-App generiert wurde.',
        stepSuccess: 'Fertig',
        enabled: 'Zwei-Faktor-Authentifizierung aktiviert',
        congrats: 'Glückwunsch! Jetzt hast du diese zusätzliche Sicherheit.',
        copy: 'Kopieren',
        disable: 'Deaktivieren',
        enableTwoFactorAuth: 'Zwei-Faktor-Authentifizierung aktivieren',
        pleaseEnableTwoFactorAuth: 'Bitte die Zwei-Faktor-Authentifizierung aktivieren.',
        twoFactorAuthIsRequiredDescription: 'Aus Sicherheitsgründen erfordert Xero eine Zwei-Faktor-Authentifizierung, um die Integration zu verbinden.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Zwei-Faktor-Authentifizierung erforderlich',
        twoFactorAuthIsRequiredForAdminsTitle: 'Bitte aktivieren Sie die Zwei-Faktor-Authentifizierung',
        twoFactorAuthIsRequiredXero: 'Für Ihre Xero-Buchhaltungsverbindung ist eine Zwei-Faktor-Authentifizierung erforderlich.',
        twoFactorAuthIsRequiredCompany: 'Ihr Unternehmen erfordert eine Zwei-Faktor-Authentifizierung.',
        twoFactorAuthCannotDisable: '2FA kann nicht deaktiviert werden',
        twoFactorAuthRequired: 'Für Ihre Xero-Verbindung ist eine Zwei-Faktor-Authentifizierung (2FA) erforderlich und sie kann nicht deaktiviert werden.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Bitte geben Sie Ihren Wiederherstellungscode ein',
            incorrectRecoveryCode: 'Falscher Wiederherstellungscode. Bitte versuche es erneut.',
        },
        useRecoveryCode: 'Wiederherstellungscode verwenden',
        recoveryCode: 'Wiederherstellungscode',
        use2fa: 'Zwei-Faktor-Authentifizierungscode verwenden',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Bitte geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein',
            incorrect2fa: 'Falscher Zwei-Faktor-Authentifizierungscode. Bitte versuche es erneut.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Passwort aktualisiert!',
        allSet: 'Alles erledigt. Bewahre dein neues Passwort sicher auf.',
    },
    privateNotes: {
        title: 'Private Notizen',
        personalNoteMessage: 'Notizen zu diesem Chat hier festhalten. Du bist die einzige Person, die diese Notizen hinzufügen, bearbeiten oder ansehen kann.',
        sharedNoteMessage: 'Hier kannst du Notizen zu diesem Chat machen. Expensify-Mitarbeiter und andere Mitglieder der Domain team.expensify.com können diese Notizen einsehen.',
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
        paymentCurrencyDescription: 'Wählen Sie eine standardisierte Währung aus, in die alle privaten Ausgaben umgerechnet werden sollen',
        note: `Hinweis: Das Ändern Ihrer Zahlungswährung kann beeinflussen, wie viel Sie für Expensify bezahlen. Vollständige Details finden Sie auf unserer <a href="${CONST.PRICING}">Preisseite</a>.`,
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
            addressZipCode: 'Bitte geben Sie eine gültige Postleitzahl ein',
            debitCardNumber: 'Bitte gib eine gültige Debitkartennummer ein',
            expirationDate: 'Bitte wählen Sie ein gültiges Ablaufdatum aus',
            securityCode: 'Bitte gib einen gültigen Sicherheitscode ein',
            addressStreet: 'Bitte gib eine gültige Rechnungsadresse ein, die kein Postfach ist',
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
        expirationDate: 'MM/JJ',
        cvv: 'CVV',
        billingAddress: 'Rechnungsadresse',
        growlMessageOnSave: 'Ihre Zahlungskarte wurde erfolgreich hinzugefügt',
        expensifyPassword: 'Expensify-Passwort',
        error: {
            invalidName: 'Name darf nur Buchstaben enthalten',
            addressZipCode: 'Bitte geben Sie eine gültige Postleitzahl ein',
            paymentCardNumber: 'Bitte gib eine gültige Kartennummer ein',
            expirationDate: 'Bitte wählen Sie ein gültiges Ablaufdatum aus',
            securityCode: 'Bitte gib einen gültigen Sicherheitscode ein',
            addressStreet: 'Bitte gib eine gültige Rechnungsadresse ein, die kein Postfach ist',
            addressState: 'Bitte wählen Sie einen Bundesstaat aus',
            addressCity: 'Bitte geben Sie eine Stadt ein',
            genericFailureMessage: 'Beim Hinzufügen Ihrer Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            password: 'Bitte geben Sie Ihr Expensify-Passwort ein',
        },
    },
    walletPage: {
        balance: 'Kontostand',
        paymentMethodsTitle: 'Zahlungsmethoden',
        setDefaultConfirmation: 'Standardzahlungsmethode festlegen',
        setDefaultSuccess: 'Standard-Zahlungsmethode festgelegt!',
        deleteAccount: 'Konto löschen',
        deleteConfirmation: 'Sind Sie sicher, dass Sie dieses Konto löschen möchten?',
        error: {
            notOwnerOfBankAccount: 'Beim Festlegen dieses Bankkontos als Ihre Standard-Zahlungsmethode ist ein Fehler aufgetreten',
            invalidBankAccount: 'Dieses Bankkonto ist vorübergehend gesperrt',
            notOwnerOfFund: 'Beim Festlegen dieser Karte als deine Standardzahlungsmethode ist ein Fehler aufgetreten',
            setDefaultFailure: 'Etwas ist schiefgelaufen. Bitte chatte mit Concierge, um weitere Unterstützung zu erhalten.',
        },
        addBankAccountFailure: 'Beim Hinzufügen deines Bankkontos ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut.',
        getPaidFaster: 'Schneller bezahlt werden',
        addPaymentMethod: 'Fügen Sie eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        getPaidBackFaster: 'Lass dich schneller auszahlen',
        secureAccessToYourMoney: 'Sicherer Zugriff auf Ihr Geld',
        receiveMoney: 'Geld in deiner lokalen Währung empfangen',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Sende und empfange Geld mit Freunden. Nur für US‑Bankkonten.',
        enableWallet: 'Wallet aktivieren',
        addBankAccountToSendAndReceive: 'Fügen Sie ein Bankkonto hinzu, um Zahlungen zu senden oder zu empfangen.',
        addDebitOrCreditCard: 'Debit- oder Kreditkarte hinzufügen',
        assignedCards: 'Zugewiesene Karten',
        assignedCardsDescription: 'Transaktionen von diesen Karten werden automatisch synchronisiert.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Wir überprüfen gerade Ihre Angaben. Bitte schauen Sie in ein paar Minuten noch einmal vorbei!',
        walletActivationFailed: 'Leider kann deine Wallet derzeit nicht aktiviert werden. Bitte chatte mit Concierge, um weitere Unterstützung zu erhalten.',
        addYourBankAccount: 'Füge dein Bankkonto hinzu',
        addBankAccountBody: 'Verbinden wir Ihr Bankkonto mit Expensify, damit Sie so einfach wie nie zuvor direkt in der App Zahlungen senden und empfangen können.',
        chooseYourBankAccount: 'Wähle dein Bankkonto',
        chooseAccountBody: 'Stelle sicher, dass du die richtige Option auswählst.',
        confirmYourBankAccount: 'Bestätigen Sie Ihr Bankkonto',
        personalBankAccounts: 'Persönliche Bankkonten',
        businessBankAccounts: 'Geschäftsbankkonten',
        shareBankAccount: 'Bankkonto teilen',
        bankAccountShared: 'Geteiltes Bankkonto',
        shareBankAccountTitle: 'Wählen Sie die Administratoren aus, mit denen dieses Bankkonto geteilt werden soll:',
        shareBankAccountSuccess: 'Bankkonto geteilt!',
        shareBankAccountSuccessDescription: 'Die ausgewählten Administratoren erhalten eine Bestätigungsnachricht vom Concierge.',
        shareBankAccountFailure: 'Beim Versuch, das Bankkonto freizugeben, ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        shareBankAccountEmptyTitle: 'Keine Administratoren verfügbar',
        shareBankAccountEmptyDescription: 'Es gibt keine Workspace-Administratoren, mit denen Sie dieses Bankkonto teilen können.',
        shareBankAccountNoAdminsSelected: 'Bitte wählen Sie einen Administrator aus, bevor Sie fortfahren',
        unshareBankAccount: 'Bankkonto freigeben',
        unshareBankAccountDescription:
            'Alle unten aufgeführten Personen haben Zugriff auf dieses Bankkonto. Sie können den Zugriff jederzeit entfernen. Laufende Zahlungen werden weiterhin ausgeführt.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} verliert den Zugriff auf dieses Geschäftskonto. Laufende Zahlungen werden weiterhin ausgeführt.`,
        reachOutForHelp: 'Dieses Konto wird mit der Expensify Card verwendet. <concierge-link>Wenden Sie sich an den Concierge</concierge-link>, wenn Sie die Freigabe aufheben möchten.',
        unshareErrorModalTitle: 'Bankkonto kann nicht freigegeben werden',
        deleteCard: 'Karte löschen',
        deleteCardConfirmation:
            'Alle nicht eingereichten Kartentransaktionen, einschließlich der auf offenen Berichten, werden entfernt. Möchten Sie diese Karte wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: 'Verbleibendes Limit',
        smartLimit: {
            name: 'Smart-Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Du kannst bis zu ${formattedLimit} mit dieser Karte ausgeben, und das Limit wird zurückgesetzt, sobald deine eingereichten Ausgaben genehmigt wurden.`,
        },
        fixedLimit: {
            name: 'Festes Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Du kannst bis zu ${formattedLimit} mit dieser Karte ausgeben, danach wird sie deaktiviert.`,
        },
        monthlyLimit: {
            name: 'Monatliches Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Sie können mit dieser Karte bis zu ${formattedLimit} pro Monat ausgeben. Das Limit wird am 1. Tag eines jeden Kalendermonats zurückgesetzt.`,
        },
        virtualCardNumber: 'Virtuelle Kartennummer',
        travelCardCvv: 'CVV der Reisekarte',
        physicalCardNumber: 'Physische Kartennummer',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Physische Karte bestellen',
        reportFraud: 'Virtuelle Kartenbetrugsfälle melden',
        reportTravelFraud: 'Reisekartenbetrug melden',
        reviewTransaction: 'Transaktion überprüfen',
        suspiciousBannerTitle: 'Verdächtige Transaktion',
        suspiciousBannerDescription: 'Wir haben verdächtige Transaktionen auf Ihrer Karte festgestellt. Tippen Sie unten, um sie zu überprüfen.',
        cardLocked: 'Ihre Karte ist vorübergehend gesperrt, während unser Team das Konto Ihres Unternehmens überprüft.',
        markTransactionsAsReimbursable: 'Transaktionen als erstattungsfähig markieren',
        markTransactionsDescription: 'Wenn aktiviert, werden von dieser Karte importierte Transaktionen standardmäßig als erstattungsfähig markiert.',
        cardDetails: {
            cardNumber: 'Virtuelle Kartennummer',
            expiration: 'Ablauf',
            cvv: 'CVV',
            address: 'Adresse',
            revealDetails: 'Details einblenden',
            revealCvv: 'CVV anzeigen',
            copyCardNumber: 'Kartennummer kopieren',
            updateAddress: 'Adresse aktualisieren',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Zum ${platform}-Wallet hinzugefügt`,
        cardDetailsLoadingFailure: 'Beim Laden der Kartendetails ist ein Fehler aufgetreten. Bitte überprüfe deine Internetverbindung und versuche es erneut.',
        validateCardTitle: 'Stellen wir sicher, dass du es bist',
        enterMagicCode: (contactMethod: string) =>
            `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um deine Kartendaten anzusehen. Er sollte innerhalb von ein bis zwei Minuten ankommen.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) =>
            `Bitte <a href="${missingDetailsLink}">füge deine persönlichen Daten hinzu</a> und versuche es dann erneut.`,
        unexpectedError: 'Beim Abrufen deiner Expensify-Kartendaten ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        cardFraudAlert: {
            confirmButtonText: 'Ja, das tue ich',
            reportFraudButtonText: 'Nein, das war ich nicht',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `verdächtige Aktivität gelöscht und Karte x${cardLastFour} wieder aktiviert. Alles bereit, um weiter Ausgaben zu erfassen!`,
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
            }) => `verdächtige Aktivität auf der Karte mit der Endnummer ${cardLastFour} festgestellt. Erkennen Sie diese Belastung?

${amount} für ${merchant} – ${date}`,
        },
        csvCardDescription: 'CSV-Import',
    },
    workflowsPage: {
        workflowTitle: 'Ausgabe',
        workflowDescription: 'Konfigurieren Sie einen Workflow ab dem Zeitpunkt, an dem Ausgaben entstehen, einschließlich Genehmigung und Zahlung.',
        submissionFrequency: 'Einreichungen',
        submissionFrequencyDescription: 'Wählen Sie einen benutzerdefinierten Zeitplan zum Einreichen von Ausgaben.',
        submissionFrequencyDateOfMonth: 'Tag des Monats',
        disableApprovalPromptDescription: 'Das Deaktivieren von Genehmigungen löscht alle vorhandenen Genehmigungs-Workflows.',
        addApprovalsTitle: 'Genehmigungen',
        addApprovalButton: 'Genehmigungs-Workflow hinzufügen',
        addApprovalTip: 'Dieser Standard-Workflow gilt für alle Mitglieder, sofern kein spezifischerer Workflow vorhanden ist.',
        approver: 'Genehmiger',
        addApprovalsDescription: 'Zusätzliche Genehmigung anfordern, bevor eine Zahlung autorisiert wird.',
        makeOrTrackPaymentsTitle: 'Zahlungen',
        makeOrTrackPaymentsDescription:
            'Fügen Sie eine autorisierte zahlende Person für Zahlungen hinzu, die in Expensify getätigt werden, oder verfolgen Sie Zahlungen, die andernorts vorgenommen wurden.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Für diesen Workspace ist ein benutzerdefinierter Genehmigungsworkflow aktiviert. Um diesen Workflow zu überprüfen oder zu ändern, wenden Sie sich bitte an Ihren <account-manager-link>Account Manager</account-manager-link> oder <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Ein benutzerdefinierter Genehmigungs-Workflow ist in diesem Workspace aktiviert. Um diesen Workflow zu überprüfen oder zu ändern, wende dich bitte an <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Wähle, wie lange Expensify warten soll, bevor fehlerfreie Ausgaben geteilt werden.',
        },
        frequencyDescription: 'Wählen Sie, wie oft Ausgaben automatisch eingereicht werden sollen, oder stellen Sie es auf manuell ein',
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
                two: 'und',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Erste',
                '2': 'Sekunde',
                '3': 'Dritte',
                '4': 'Vierte',
                '5': 'Fünfte',
                '6': 'Sechste',
                '7': 'Siebte',
                '8': 'Achte',
                '9': 'Neunte',
                '10': 'Zehnte',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Dieses Mitglied gehört bereits zu einem anderen Genehmigungs-Workflow. Alle Änderungen hier werden sich auch dort auswirken.',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> genehmigt bereits Berichte für <strong>${name2}</strong>. Bitte wählen Sie eine andere approver, um einen zirkulären Workflow zu vermeiden.`,
        emptyContent: {
            title: 'Keine Mitglieder zum Anzeigen',
            expensesFromSubtitle: 'Alle Arbeitsbereichsmitglieder gehören bereits zu einem bestehenden Genehmigungsworkflow.',
            approverSubtitle: 'Alle Genehmigenden gehören zu einem bestehenden Workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Die Einreichungshäufigkeit konnte nicht geändert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
        monthlyOffsetErrorMessage: 'Die monatliche Häufigkeit konnte nicht geändert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Bestätigen',
        header: 'Fügen Sie weitere Genehmiger hinzu und bestätigen Sie.',
        additionalApprover: 'Zusätzliche Genehmiger',
        submitButton: 'Workflow hinzufügen',
    },
    workflowsEditApprovalsPage: {
        title: 'Genehmigungs-Workflow bearbeiten',
        deleteTitle: 'Genehmigungs-Workflow löschen',
        deletePrompt: 'Sind Sie sicher, dass Sie diesen Genehmigungsworkflow löschen möchten? Alle Mitglieder werden anschließend dem Standard-Workflow folgen.',
    },
    workflowsExpensesFromPage: {
        title: 'Auslagen von',
        header: 'Wenn die folgenden Mitglieder Ausgaben einreichen:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Der Genehmiger konnte nicht geändert werden. Bitte versuche es erneut oder kontaktiere den Support.',
        title: 'Zur Genehmigung an dieses Mitglied senden:',
        description: 'Diese Person wird die Ausgaben genehmigen.',
    },
    workflowsApprovalLimitPage: {
        title: 'Genehmiger',
        header: '(Optional) Möchten Sie ein Genehmigungslimit hinzufügen?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Fügen Sie einen weiteren Genehmiger hinzu, wenn <strong>${approverName}</strong> Genehmiger ist und der Bericht den folgenden Betrag überschreitet:`
                : 'Fügen Sie einen weiteren Genehmiger hinzu, wenn der Bericht den folgenden Betrag überschreitet:',
        reportAmountLabel: 'Berichtsbetrag',
        additionalApproverLabel: 'Zusätzlicher Genehmiger',
        skip: 'Überspringen',
        next: 'Weiter',
        removeLimit: 'Limit entfernen',
        enterAmountError: 'Bitte geben Sie einen gültigen Betrag ein',
        enterApproverError: 'Ein Genehmiger ist erforderlich, wenn Sie ein Berichtslimit festlegen',
        enterBothError: 'Geben Sie einen Berichtsbetrag und einen zusätzlichen Genehmiger ein',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `Berichte über ${approvalLimit} werden an ${approverName} weitergeleitet`,
    },
    workflowsPayerPage: {
        title: 'Autorisierter Zahler',
        genericErrorMessage: 'Der autorisierte Zahler konnte nicht geändert werden. Bitte versuche es erneut.',
        admins: 'Admins',
        payer: 'Zahler',
        paymentAccount: 'Zahlungskonto',
    },
    reportFraudPage: {
        title: 'Virtuelle Kartenbetrugsfälle melden',
        description:
            'Wenn Ihre virtuellen Kartendaten gestohlen oder kompromittiert wurden, werden wir Ihre bestehende Karte dauerhaft deaktivieren und Ihnen eine neue virtuelle Karte mit neuer Nummer zur Verfügung stellen.',
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
            thatDidNotMatch: 'Das stimmt nicht mit den letzten 4 Ziffern Ihrer Karte überein. Bitte versuchen Sie es erneut.',
            throttled:
                'Du hast die letzten 4 Ziffern deiner Expensify Card zu oft falsch eingegeben. Wenn du sicher bist, dass die Nummern korrekt sind, wende dich bitte an Concierge, um das Problem zu lösen. Andernfalls versuche es später noch einmal.',
        },
    },
    getPhysicalCard: {
        header: 'Physische Karte bestellen',
        nameMessage: 'Gib deinen Vor- und Nachnamen ein, da dieser auf deiner Karte angezeigt wird.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Amtlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        phoneMessage: 'Gib deine Telefonnummer ein.',
        phoneNumber: 'Telefonnummer',
        address: 'Adresse',
        addressMessage: 'Gib deine Versandadresse ein.',
        streetAddress: 'Straße und Hausnummer',
        city: 'Stadt',
        state: 'Bundesstaat',
        zipPostcode: 'Postleitzahl',
        country: 'Land',
        confirmMessage: 'Bitte bestätigen Sie unten Ihre Daten.',
        estimatedDeliveryMessage: 'Ihre physische Karte wird in 2–3 Werktagen ankommen.',
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
        transferDetailBankAccount: 'Dein Geld sollte in den nächsten 1–3 Werktagen eintreffen.',
        transferDetailDebitCard: 'Dein Geld sollte sofort ankommen.',
        failedTransfer: 'Ihr Guthaben ist noch nicht vollständig ausgeglichen. Bitte überweisen Sie es auf ein Bankkonto.',
        notHereSubTitle: 'Bitte überweisen Sie Ihr Guthaben von der Wallet-Seite.',
        goToWallet: 'Zu Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Konto auswählen',
    },
    paymentMethodList: {
        addPaymentMethod: 'Zahlungsmethode hinzufügen',
        addNewDebitCard: 'Neue Debitkarte hinzufügen',
        addNewBankAccount: 'Neues Bankkonto hinzufügen',
        accountLastFour: 'Endet auf',
        cardLastFour: 'Karte mit Endziffern',
        addFirstPaymentMethod: 'Fügen Sie eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
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
            merchantHint: 'Gib . ein, um eine Regel zu erstellen, die für alle Händler gilt',
            addToReport: 'Zu einem Bericht mit dem Namen hinzufügen',
            createReport: 'Bericht bei Bedarf erstellen',
            applyToExistingExpenses: 'Auf passende vorhandene Spesen anwenden',
            confirmError: 'Geben Sie einen Händler ein und nehmen Sie mindestens eine Änderung vor',
            confirmErrorMerchant: 'Bitte Händler eingeben',
            confirmErrorUpdate: 'Bitte wende mindestens eine Aktualisierung an',
            saveRule: 'Regel speichern',
        },
        editRule: {title: 'Regel bearbeiten'},
        deleteRule: {
            deleteSingle: 'Regel löschen',
            deleteMultiple: 'Regeln löschen',
            deleteSinglePrompt: 'Sind Sie sicher, dass Sie diese Regel löschen möchten?',
            deleteMultiplePrompt: 'Möchten Sie diese Regeln wirklich löschen?',
        },
    },
    preferencesPage: {
        appSection: {
            title: 'App-Einstellungen',
        },
        testSection: {
            title: 'Testeinstellungen',
            subtitle: 'Einstellungen, um die App im Staging zu debuggen und zu testen.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Erhalte relevante Funktionsupdates und Expensify-Neuigkeiten',
        muteAllSounds: 'Alle Töne von Expensify stummschalten',
    },
    priorityModePage: {
        priorityMode: 'Prioritätsmodus',
        explainerText: 'Wähle, ob du dich nur auf ungelesene und angeheftete Chats #fokussieren möchtest oder alles anzeigen willst, wobei die neuesten und angehefteten Chats oben stehen.',
        priorityModes: {
            default: {
                label: 'Neueste',
                description: 'Alle Chats anzeigen, nach Datum (neueste zuerst) sortiert',
            },
            gsd: {
                label: '#fokus',
                description: 'Nur ungelesene, alphabetisch sortiert',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
        generatingPDF: 'PDF wird erstellt ...',
        waitForPDF: 'Bitte warten, während wir das PDF generieren.',
        errorPDF: 'Beim Versuch, Ihr PDF zu erstellen, ist ein Fehler aufgetreten.',
        successPDF: 'Dein PDF wurde erstellt! Falls es nicht automatisch heruntergeladen wurde, verwende die Schaltfläche unten.',
    },
    reportDescriptionPage: {
        roomDescription: 'Raumbeschreibung',
        roomDescriptionOptional: 'Zimmerbeschreibung (optional)',
        explainerText: 'Legen Sie eine benutzerdefinierte Beschreibung für den Raum fest.',
    },
    groupChat: {
        lastMemberTitle: 'Achtung!',
        lastMemberWarning: 'Da du die letzte Person hier bist, wird dieser Chat für alle Mitglieder unzugänglich, wenn du ihn verlässt. Bist du sicher, dass du gehen möchtest?',
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
        terms: `<muted-text-xs>Mit der Anmeldung stimmen Sie den <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und der <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzrichtlinie</a> zu.</muted-text-xs>`,
        license: `<muted-text-xs>Der Geldtransfer wird von ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS-ID:2017010) gemäß seinen <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">Lizenzen</a> bereitgestellt.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Keinen Magic-Code erhalten?',
        enterAuthenticatorCode: 'Bitte gib deinen Authentifikatorcode ein',
        enterRecoveryCode: 'Bitte geben Sie Ihren Wiederherstellungscode ein',
        requiredWhen2FAEnabled: 'Erforderlich, wenn 2FA aktiviert ist',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Neuen Code in <a>${timeRemaining}</a> anfordern`,
        requestNewCodeAfterErrorOccurred: 'Neuen Code anfordern',
        error: {
            pleaseFillMagicCode: 'Bitte geben Sie Ihren Magic Code ein',
            incorrectMagicCode: 'Falscher oder ungültiger magischer Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            pleaseFillTwoFactorAuth: 'Bitte geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Bitte füllen Sie alle Felder aus',
        pleaseFillPassword: 'Bitte geben Sie Ihr Passwort ein',
        pleaseFillTwoFactorAuth: 'Bitte gib deinen Zwei-Faktor-Code ein',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Gib deinen Zwei-Faktor-Authentifizierungscode ein, um fortzufahren',
        forgot: 'Passwort vergessen?',
        requiredWhen2FAEnabled: 'Erforderlich, wenn 2FA aktiviert ist',
        error: {
            incorrectPassword: 'Falsches Passwort. Bitte versuche es erneut.',
            incorrectLoginOrPassword: 'Falscher Login oder Passwort. Bitte versuche es erneut.',
            incorrect2fa: 'Falscher Zwei-Faktor-Authentifizierungscode. Bitte versuche es erneut.',
            twoFactorAuthenticationEnabled: 'Für dieses Konto ist die Zwei-Faktor-Authentifizierung (2FA) aktiviert. Bitte melden Sie sich mit Ihrer E‑Mail-Adresse oder Telefonnummer an.',
            invalidLoginOrPassword: 'Ungültiger Login oder Passwort. Bitte versuche es erneut oder setze dein Passwort zurück.',
            unableToResetPassword:
                'Wir konnten Ihr Passwort nicht ändern. Dies liegt wahrscheinlich an einem abgelaufenen Link zum Zurücksetzen des Passworts in einer älteren E-Mail zum Zurücksetzen. Wir haben Ihnen einen neuen Link per E-Mail geschickt, damit Sie es erneut versuchen können. Überprüfen Sie Ihren Posteingang und Ihren Spam-Ordner; die E-Mail sollte in wenigen Minuten ankommen.',
            noAccess: 'Sie haben keinen Zugriff auf diese Anwendung. Bitte fügen Sie Ihren GitHub-Benutzernamen hinzu, um Zugriff zu erhalten.',
            accountLocked: 'Ihr Konto wurde nach zu vielen erfolglosen Versuchen gesperrt. Bitte versuchen Sie es in 1 Stunde erneut.',
            fallback: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefon oder E-Mail',
        error: {
            invalidFormatEmailLogin: 'Die eingegebene E-Mail-Adresse ist ungültig. Bitte korrigieren Sie das Format und versuchen Sie es erneut.',
        },
        cannotGetAccountDetails: 'Kontodetails konnten nicht abgerufen werden. Bitte versuchen Sie, sich erneut anzumelden.',
        loginForm: 'Anmeldeformular',
        notYou: ({user}: NotYouParams) => `Nicht ${user}?`,
    },
    onboarding: {
        welcome: 'Willkommen!',
        welcomeSignOffTitleManageTeam: 'Sobald du die oben genannten Aufgaben abgeschlossen hast, können wir weitere Funktionen wie Genehmigungs-Workflows und -Regeln erkunden!',
        welcomeSignOffTitle: 'Es ist schön, dich kennenzulernen!',
        explanationModal: {
            title: 'Willkommen bei Expensify',
            description:
                'Eine App, um Ihre geschäftlichen und privaten Ausgaben mit der Geschwindigkeit eines Chats zu verwalten. Probieren Sie sie aus und lassen Sie uns wissen, was Sie denken. Es kommt noch viel mehr!',
            secondaryDescription: 'Um zurück zu Expensify Classic zu wechseln, tippe einfach auf dein Profilbild > Zu Expensify Classic wechseln.',
        },
        getStarted: 'Loslegen',
        whatsYourName: 'Wie heißt du?',
        peopleYouMayKnow: 'Personen, die du vielleicht kennst, sind bereits hier! Bestätige deine E-Mail-Adresse, um dich ihnen anzuschließen.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `Jemand von ${domain} hat bereits einen Workspace erstellt. Bitte gib den Magic-Code ein, der an ${email} gesendet wurde.`,
        joinAWorkspace: 'Einem Workspace beitreten',
        listOfWorkspaces: 'Hier ist die Liste der Arbeitsbereiche, denen du beitreten kannst. Keine Sorge, du kannst später jederzeit beitreten, wenn du das bevorzugst.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} Mitglied${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Wo arbeitest du?',
        errorSelection: 'Wähle eine Option, um fortzufahren',
        purpose: {
            title: 'Was möchtest du heute tun?',
            errorContinue: 'Bitte klicken Sie auf „Weiter“, um die Einrichtung abzuschließen',
            errorBackButton: 'Bitte schließen Sie die Einrichtungsfragen ab, um die App nutzen zu können',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Von meinem Arbeitgeber zurückbezahlt werden',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Die Ausgaben meines Teams verwalten',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Ausgaben nachverfolgen und budgetieren',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Mit Freunden chatten und Ausgaben teilen',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Etwas anderes',
        },
        employees: {
            title: 'Wie viele Mitarbeitende haben Sie?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1–10 Mitarbeitende',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11–50 Mitarbeiter',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51–100 Mitarbeiter',
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
            requiredFirstName: 'Bitte geben Sie Ihren Vornamen ein, um fortzufahren',
        },
        workEmail: {
            title: 'Wie lautet deine geschäftliche E-Mail-Adresse?',
            subtitle: 'Expensify funktioniert am besten, wenn du deine Arbeits-E-Mail verbindest.',
            explanationModal: {
                descriptionOne: 'An receipts@expensify.com zur Erfassung weiterleiten',
                descriptionTwo: 'Schließe dich deinen Kollegen an, die bereits Expensify nutzen',
                descriptionThree: 'Genieße ein individuelleres Erlebnis',
            },
            addWorkEmail: 'Arbeits-E-Mail hinzufügen',
        },
        workEmailValidation: {
            title: 'Bestätige deine geschäftliche E-Mail-Adresse',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Bitte gib den magischen Code ein, der an ${workEmail} gesendet wurde. Er sollte in ein bis zwei Minuten ankommen.`,
        },
        workEmailValidationError: {
            publicEmail: 'Bitte gib eine gültige geschäftliche E‑Mail-Adresse von einer privaten Domain ein, z. B. mitch@company.com',
            offline: 'Wir konnten deine geschäftliche E-Mail-Adresse nicht hinzufügen, da du anscheinend offline bist',
        },
        mergeBlockScreen: {
            title: 'Geschäftliche E-Mail-Adresse konnte nicht hinzugefügt werden',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Wir konnten ${workEmail} nicht hinzufügen. Bitte versuche es später erneut in den Einstellungen oder chatte mit Concierge, um Hilfe zu erhalten.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Machen Sie eine [Probefahrt](${testDriveURL})`,
                description: ({testDriveURL}) => `[Machen Sie eine kurze Produkttour](${testDriveURL}), um zu sehen, warum Expensify der schnellste Weg ist, Ihre Spesen abzurechnen.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Machen Sie eine [Probefahrt](${testDriveURL})`,
                description: ({testDriveURL}) => `Machen Sie mit uns eine [Probefahrt](${testDriveURL}) und sichern Sie sich für Ihr Team *3 kostenlose Monate Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Spesengenehmigungen hinzufügen',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Fügen Sie Ausgabengenehmigungen hinzu*, um die Ausgaben Ihres Teams zu überprüfen und unter Kontrolle zu halten.

                        So geht's:

                        1. Gehen Sie zu *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *More features*.
                        4. Aktivieren Sie *Workflows*.
                        5. Navigieren Sie zu *Workflows* im Workspace-Editor.
                        6. Aktivieren Sie *Approvals*.
                        7. Sie werden als Genehmiger für Ausgaben festgelegt. Sie können dies auf einen beliebigen Admin ändern, sobald Sie Ihr Team eingeladen haben.

                        [Zu More features wechseln](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Arbeitsbereich erstellen](${workspaceConfirmationLink})`,
                description: 'Erstelle einen Workspace und konfiguriere die Einstellungen mit Hilfe deiner Setup-Spezialist*in!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Erstellen Sie einen [Arbeitsbereich](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Erstelle einen Workspace*, um Ausgaben zu verfolgen, Belege zu scannen, zu chatten und mehr.

                        1. Klicke auf *Workspaces* > *Neuer Workspace*.

                        *Dein neuer Workspace ist bereit!* [Sieh ihn dir an](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[Categories](${workspaceCategoriesLink}) einrichten`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Richten Sie Kategorien ein*, damit Ihr Team Ausgaben für eine einfache Berichterstattung codieren kann.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace.
                        3. Klicken Sie auf *Categories*.
                        4. Deaktivieren Sie alle Kategorien, die Sie nicht benötigen.
                        5. Fügen Sie oben rechts Ihre eigenen Kategorien hinzu.

                        [Zu den Workspace-Kategorieeinstellungen](${workspaceCategoriesLink}).

                        ![Kategorien einrichten](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Ausgabe einreichen',
                description: dedent(`
                    *Reiche eine Ausgabe ein*, indem du einen Betrag eingibst oder einen Beleg scannst.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Ausgabe erstellen*.
                    3. Gib einen Betrag ein oder scanne einen Beleg.
                    4. Füge die E-Mail-Adresse oder Telefonnummer deiner Chefin/deines Chefs hinzu.
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
                title: 'Ausgabe nachverfolgen',
                description: dedent(`
                    *Verfolge eine Ausgabe* in jeder Währung – egal, ob du einen Beleg hast oder nicht.

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
                    `Verbinden${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'bis'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'Ihr' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Verbinden Sie ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'Ihr' : 'bis'} ${integrationName} für automatische Spesencodierung und Synchronisierung, die den Monatsabschluss zum Kinderspiel macht.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *Accounting*.
                        4. Suchen Sie ${integrationName}.
                        5. Klicken Sie auf *Connect*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? `[Bring mich zur Buchhaltung](${workspaceAccountingLink}).

                        ![Mit ${integrationName} verbinden](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
        : `[Zur Buchhaltung wechseln](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[Unternehmens­kreditkarten verbinden](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Verbinden Sie die Karten, die Sie bereits haben, um Transaktionen automatisch zu importieren, Belege abzugleichen und Abstimmungen durchzuführen.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *Company cards*.
                        4. Folgen Sie den Anweisungen, um Ihre Karten zu verbinden.

                        [Zu Company cards wechseln](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[your team](${workspaceMembersLink}) einladen`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Laden Sie Ihr Team ein*, Expensify zu nutzen, damit es noch heute mit der Spesenerfassung beginnen kann.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *Members* > *Invite member*.
                        4. Geben Sie E-Mail-Adressen oder Telefonnummern ein.
                        5. Fügen Sie eine individuelle Einladung hinzu, wenn Sie möchten!

                        [Zu den Workspace-Mitgliedern wechseln](${workspaceMembersLink}).

                        ![Laden Sie Ihr Team ein](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Richten Sie [Kategorien](${workspaceCategoriesLink}) und [Tags](${workspaceTagsLink}) ein`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Richten Sie Kategorien und Tags ein*, damit Ihr Team Ausgaben für eine einfache Berichterstattung kodieren kann.

                        Importieren Sie sie automatisch, indem Sie [Ihre Buchhaltungssoftware verbinden](${workspaceAccountingLink}), oder richten Sie sie manuell in Ihren [Workspace-Einstellungen](${workspaceCategoriesLink}) ein.`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[Tags](${workspaceTagsLink}) einrichten`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Verwenden Sie Tags, um zusätzliche Ausgabendetails wie Projekte, Kunden, Standorte und Abteilungen hinzuzufügen. Wenn Sie mehrere Ebenen von Tags benötigen, können Sie auf den Control-Tarif upgraden.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *More features*.
                        4. Aktivieren Sie *Tags*.
                        5. Navigieren Sie im Workspace-Editor zu *Tags*.
                        6. Klicken Sie auf *+ Add tag*, um Ihre eigenen zu erstellen.

                        [Zu More features wechseln](${workspaceMoreFeaturesLink}).

                        ![Tags einrichten](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Laden Sie Ihren [Buchhalter](${workspaceMembersLink}) ein`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Laden Sie Ihre:n Buchhalter:in ein*, in Ihrem Workspace mitzuarbeiten und Ihre Geschäftsausgaben zu verwalten.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *Mitglieder*.
                        4. Klicken Sie auf *Mitglied einladen*.
                        5. Geben Sie die E-Mail-Adresse Ihrer:s Buchhalter:in ein.

                        [Jetzt Ihre:n Buchhalter:in einladen](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Chat starten',
                description: dedent(`
                    *Starte einen Chat* mit jeder Person über ihre E-Mail-Adresse oder Telefonnummer.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Chat starten*.
                    3. Gib eine E-Mail-Adresse oder Telefonnummer ein.

                    Wenn sie Expensify noch nicht verwenden, werden sie automatisch eingeladen.

                    Jeder Chat wird außerdem in eine E-Mail oder SMS umgewandelt, auf die sie direkt antworten können.
                `),
            },
            splitExpenseTask: {
                title: 'Ausgabe aufteilen',
                description: dedent(`
                    *Spalte Ausgaben* mit einer oder mehreren Personen.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Chat starten*.
                    3. Gib E-Mail-Adressen oder Telefonnummern ein.
                    4. Klicke im Chat auf die graue *+*-Schaltfläche > *Ausgabe aufteilen*.
                    5. Erstelle die Ausgabe, indem du *Manuell*, *Scan* oder *Strecke* auswählst.

                    Du kannst bei Bedarf weitere Details hinzufügen oder sie einfach direkt senden. Lass uns dafür sorgen, dass du dein Geld zurückbekommst!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Überprüfe deine [Workspace-Einstellungen](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        So kannst du deine Workspace-Einstellungen überprüfen und aktualisieren:
                        1. Klicke auf „Workspaces“.
                        2. Wähle deinen Workspace aus.
                        3. Überprüfe und aktualisiere deine Einstellungen.
                        [Zu deinem Workspace gehen.](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: 'Erstellen Sie Ihren ersten Bericht',
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
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Machen Sie eine [Probefahrt](${testDriveURL})` : 'Machen Sie eine Probefahrt'),
            embeddedDemoIframeTitle: 'Testversion',
            employeeFakeReceipt: {
                description: 'Mein Probefahrtbeleg!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Zurückgezahlt zu werden ist so einfach wie das Senden einer Nachricht. Gehen wir die Grundlagen durch.',
            onboardingPersonalSpendMessage: 'So kannst du deine Ausgaben mit nur wenigen Klicks verfolgen.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Deine kostenlose Testphase hat begonnen! Lass uns dich einrichten.
                        👋 Hallo, ich bin dein Expensify-Einrichtungsspezialist. Ich habe bereits einen Workspace erstellt, um die Belege und Ausgaben deines Teams zu verwalten. Um das Beste aus deiner 30-tägigen kostenlosen Testphase herauszuholen, folge einfach den verbleibenden Einrichtungsschritten unten!
                    `)
                    : dedent(`
                        # Deine kostenlose Testphase hat begonnen! Lass uns dich einrichten.
                        👋 Hallo, ich bin dein Expensify-Einrichtungsspezialist. Jetzt, da du einen Workspace erstellt hast, nutze deine 30-tägige kostenlose Testphase optimal, indem du die folgenden Schritte befolgst!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Richten wir dich ein\n👋 Hallo, ich bin dein Expensify-Einrichtungsspezialist. Ich habe bereits einen Workspace erstellt, um dir beim Verwalten deiner Belege und Ausgaben zu helfen. Um deine 30-tägige kostenlose Testphase optimal zu nutzen, folge einfach den verbleibenden Einrichtungsschritten unten!',
            onboardingChatSplitMessage: 'Rechnungen mit Freunden zu teilen ist so einfach wie das Senden einer Nachricht. So geht’s.',
            onboardingAdminMessage: 'Erfahren Sie, wie Sie als Admin den Workspace Ihres Teams verwalten und Ihre eigenen Ausgaben einreichen.',
            onboardingLookingAroundMessage:
                'Expensify ist vor allem für Ausgaben-, Reise- und Firmenkartenverwaltung bekannt, aber wir bieten noch viel mehr. Sag mir, woran du interessiert bist, und ich helfe dir beim Einstieg.',
            onboardingTestDriveReceiverMessage: '*Du erhältst 3 Monate gratis! Leg unten los.*',
        },
        workspace: {
            title: 'Bleiben Sie mit einem Workspace organisiert',
            subtitle: 'Schalte leistungsstarke Tools frei, um dein Ausgabenmanagement zu vereinfachen – alles an einem Ort. Mit einem Workspace kannst du:',
            explanationModal: {
                descriptionOne: 'Belege nachverfolgen und organisieren',
                descriptionTwo: 'Ausgaben kategorisieren und markieren',
                descriptionThree: 'Berichte erstellen und teilen',
            },
            price: 'Teste es 30 Tage lang kostenlos und upgrade dann für nur <strong>5 $/Nutzer/Monat</strong>.',
            createWorkspace: 'Workspace erstellen',
        },
        confirmWorkspace: {
            title: 'Arbeitsbereich bestätigen',
            subtitle:
                'Erstelle einen Workspace, um Belege zu verfolgen, Ausgaben zu erstatten, Reisen zu verwalten, Berichte zu erstellen und mehr – alles mit der Geschwindigkeit eines Chats.',
        },
        inviteMembers: {
            title: 'Mitglieder einladen',
            subtitle: 'Füge dein Team hinzu oder lade deinen Buchhalter ein. Je mehr, desto besser!',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Nicht mehr anzeigen',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Der Name darf die Wörter Expensify oder Concierge nicht enthalten',
            hasInvalidCharacter: 'Name darf kein Komma oder Semikolon enthalten',
            requiredFirstName: 'Der Vorname darf nicht leer sein',
            cannotContainSpecialCharacters: 'Der Name darf keine Sonderzeichen enthalten',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Wie lautet Ihr amtlicher Name?',
        enterDateOfBirth: 'Wie ist dein Geburtsdatum?',
        enterAddress: 'Wie lautet Ihre Adresse?',
        enterPhoneNumber: 'Wie lautet deine Telefonnummer?',
        personalDetails: 'Persönliche Angaben',
        privateDataMessage: 'Diese Angaben werden für Reisen und Zahlungen verwendet. Sie werden niemals in deinem öffentlichen Profil angezeigt.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Amtlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        address: 'Adresse',
        error: {
            dateShouldBeBefore: (dateString: string) => `Das Datum sollte vor dem ${dateString} liegen`,
            dateShouldBeAfter: (dateString: string) => `Datum muss nach ${dateString} liegen`,
            hasInvalidCharacter: 'Name darf nur lateinische Zeichen enthalten',
            incorrectZipFormat: (zipFormat?: string) => `Ungültiges Postleitzahlformat${zipFormat ? `Akzeptables Format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Bitte stelle sicher, dass die Telefonnummer gültig ist (z. B. ${CONST.EXAMPLE_PHONE_NUMBER})`,
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
            `Um ${secondaryLogin} zu verifizieren, sende den Magic Code bitte erneut aus den Kontoeinstellungen von ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Wenn du keinen Zugriff mehr auf ${primaryLogin} hast, bitte entkopple deine Konten.`,
        unlink: 'Verknüpfung aufheben',
        linkSent: 'Link gesendet!',
        successfullyUnlinkedLogin: 'Sekundäre Anmeldung erfolgreich getrennt!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Unser E-Mail-Anbieter hat E-Mails an ${login} vorübergehend aufgrund von Zustellungsproblemen ausgesetzt. Um Ihren Login zu entsperren, folgen Sie bitte diesen Schritten:`,
        confirmThat: (login: string) =>
            `<strong>Bestätige, dass ${login} richtig geschrieben ist und eine echte, zustellbare E‑Mail-Adresse ist.</strong> E-Mail-Aliase wie „expenses@domain.com“ müssen Zugriff auf ihr eigenes E-Mail-Postfach haben, damit sie ein gültiger Expensify-Login sind.`,
        ensureYourEmailClient: `<strong>Stellen Sie sicher, dass Ihr E-Mail-Client E-Mails von expensify.com zulässt.</strong> Anweisungen zur Durchführung dieses Schritts finden Sie <a href="${CONST.SET_NOTIFICATION_LINK}">hier</a>, eventuell benötigen Sie jedoch Hilfe von Ihrer IT-Abteilung, um Ihre E-Mail-Einstellungen zu konfigurieren.`,
        onceTheAbove: `Sobald die oben genannten Schritte abgeschlossen sind, wenden Sie sich bitte an <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a>, um Ihre Anmeldung wieder zu entsperren.`,
    },
    openAppFailureModal: {
        title: 'Etwas ist schiefgelaufen …',
        subtitle: `Wir konnten nicht alle deine Daten laden. Wir wurden benachrichtigt und untersuchen das Problem. Wenn es weiterhin besteht, wende dich bitte an`,
        refreshAndTryAgain: 'Aktualisieren und erneut versuchen',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Wir konnten SMS-Nachrichten nicht an ${login} zustellen, daher haben wir ihn vorübergehend gesperrt. Bitte versuchen Sie, Ihre Nummer zu bestätigen:`,
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
            return `Bitte warten! Du musst ${timeText} abwarten, bevor du erneut versuchst, deine Nummer zu bestätigen.`;
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
            `Behalte den Überblick, indem du nur ungelesene Chats oder Chats siehst, die deine Aufmerksamkeit erfordern. Keine Sorge, du kannst dies jederzeit in den <a href="${priorityModePageUrl}">Einstellungen</a> ändern.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Der gesuchte Chat kann nicht gefunden werden.',
        getMeOutOfHere: 'Hol mich hier raus',
        iouReportNotFound: 'Die gesuchten Zahlungsdetails können nicht gefunden werden.',
        notHere: 'Hmm ... es ist nicht da',
        pageNotFound: 'Ups, diese Seite kann nicht gefunden werden',
        noAccess: 'Dieser Chat oder diese Ausgabe wurde möglicherweise gelöscht oder du hast keinen Zugriff darauf.\n\nBei Fragen wende dich bitte an concierge@expensify.com',
        goBackHome: 'Zurück zur Startseite',
        commentYouLookingForCannotBeFound: 'Der gesuchte Kommentar konnte nicht gefunden werden.',
        goToChatInstead: 'Gehe stattdessen zum Chat.',
        contactConcierge: 'Bei Fragen wenden Sie sich bitte an concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ups … ${isBreakLine ? '\n' : ''}Etwas ist schiefgelaufen`,
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
        whenClearStatus: 'Wann sollen wir deinen Status löschen?',
        vacationDelegate: 'Urlaubsvertreter',
        setVacationDelegate: `Legen Sie eine Urlaubsvertretung fest, die Berichte in Ihrer Abwesenheit in Ihrem Namen genehmigt.`,
        vacationDelegateError: 'Beim Aktualisieren deines Urlaubsvertreters ist ein Fehler aufgetreten.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `als Urlaubsvertretung von ${nameOrEmail}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `an ${submittedToName} als Urlaubsvertreter für ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Sie weisen ${nameOrEmail} als Ihre Urlaubsvertretung zu. Diese Person ist noch nicht in all Ihren Workspaces. Wenn Sie fortfahren, wird eine E-Mail an alle Ihre Workspace-Admins gesendet, damit sie hinzugefügt wird.`,
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
        manuallyAdd: 'Fügen Sie Ihr Bankkonto manuell hinzu',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        accountEnding: 'Konto mit Endziffer',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in deinem Workspace verwendet',
        accountNumber: 'Kontonummer',
        routingNumber: 'Routing-Nummer',
        chooseAnAccountBelow: 'Wählen Sie unten ein Konto aus',
        addBankAccount: 'Bankkonto hinzufügen',
        chooseAnAccount: 'Konto auswählen',
        connectOnlineWithPlaid: 'Melden Sie sich bei Ihrer Bank an',
        connectManually: 'Manuell verbinden',
        desktopConnection:
            'Hinweis: Um eine Verbindung mit Chase, Wells Fargo, Capital One oder Bank of America herzustellen, klicke bitte hier, um diesen Vorgang in einem Browser abzuschließen.',
        yourDataIsSecure: 'Ihre Daten sind sicher',
        toGetStarted: 'Füge ein Bankkonto hinzu, um Ausgaben zu erstatten, Expensify Cards auszugeben, Rechnungzahlungen einzuziehen und Rechnungen zu bezahlen – alles an einem Ort.',
        plaidBodyCopy: 'Geben Sie Ihren Mitarbeitenden eine einfachere Möglichkeit, Unternehmensausgaben zu bezahlen – und erstattet zu bekommen.',
        checkHelpLine: 'Ihre Bankleitzahl und Kontonummer finden Sie auf einem Scheck für das Konto.',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Um ein Bankkonto zu verbinden, bitte <a href="${contactMethodRoute}">füge eine E-Mail-Adresse als deinen primären Login hinzu</a> und versuche es erneut. Du kannst deine Telefonnummer als sekundären Login hinzufügen.`,
        hasBeenThrottledError: 'Beim Hinzufügen Ihres Bankkontos ist ein Fehler aufgetreten. Bitte warten Sie ein paar Minuten und versuchen Sie es dann erneut.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Ups! Es scheint, dass die Währung deines Arbeitsbereichs auf eine andere Währung als USD eingestellt ist. Um fortzufahren, gehe bitte zu <a href="${workspaceRoute}">deinen Arbeitsbereichseinstellungen</a>, stelle sie auf USD ein und versuche es erneut.`,
        bbaAdded: 'Geschäftsbankkonto hinzugefügt!',
        bbaAddedDescription: 'Es ist bereit, für Zahlungen verwendet zu werden.',
        error: {
            youNeedToSelectAnOption: 'Bitte wählen Sie eine Option, um fortzufahren',
            noBankAccountAvailable: 'Entschuldigung, es ist kein Bankkonto verfügbar',
            noBankAccountSelected: 'Bitte wähle ein Konto aus',
            taxID: 'Bitte gib eine gültige Steuer-ID-Nummer ein',
            website: 'Bitte gib eine gültige Website ein',
            zipCode: `Bitte geben Sie eine gültige Postleitzahl im folgenden Format ein: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Bitte gib eine gültige Telefonnummer ein',
            email: 'Bitte gib eine gültige E‑Mail‑Adresse ein',
            companyName: 'Bitte geben Sie einen gültigen Firmennamen ein',
            addressCity: 'Bitte gib eine gültige Stadt ein',
            addressStreet: 'Bitte gib eine gültige Straßenadresse ein',
            addressState: 'Bitte wähle einen gültigen Bundesstaat aus',
            incorporationDateFuture: 'Das Gründungsdatum darf nicht in der Zukunft liegen',
            incorporationState: 'Bitte wähle einen gültigen Bundesstaat aus',
            industryCode: 'Bitte geben Sie einen gültigen Branchenklassifikationscode mit sechs Ziffern ein',
            restrictedBusiness: 'Bitte bestätigen Sie, dass das Unternehmen nicht auf der Liste der eingeschränkten Unternehmen steht.',
            routingNumber: 'Bitte geben Sie eine gültige Bankleitzahl ein',
            accountNumber: 'Bitte geben Sie eine gültige Kontonummer ein',
            routingAndAccountNumberCannotBeSame: 'Routing- und Kontonummer dürfen nicht übereinstimmen',
            companyType: 'Bitte wählen Sie einen gültigen Unternehmenstyp aus',
            tooManyAttempts:
                'Aufgrund einer hohen Anzahl von Anmeldeversuchen wurde diese Option für 24 Stunden deaktiviert. Bitte versuchen Sie es später erneut oder geben Sie die Daten stattdessen manuell ein.',
            address: 'Bitte gib eine gültige Adresse ein',
            dob: 'Bitte ein gültiges Geburtsdatum auswählen',
            age: 'Muss über 18 Jahre alt sein',
            ssnLast4: 'Bitte gib die letzten 4 gültigen Ziffern der SSN ein',
            firstName: 'Bitte gib einen gültigen Vornamen ein',
            lastName: 'Bitte geben Sie einen gültigen Nachnamen ein',
            noDefaultDepositAccountOrDebitCardAvailable: 'Bitte fügen Sie ein Standard-Einzahlungskonto oder eine Debitkarte hinzu',
            validationAmounts: 'Die eingegebenen Verifizierungsbeträge sind nicht korrekt. Bitte überprüfen Sie Ihren Kontoauszug und versuchen Sie es erneut.',
            fullName: 'Bitte geben Sie einen gültigen vollständigen Namen ein',
            ownershipPercentage: 'Bitte gib eine gültige Prozentzahl ein',
            deletePaymentBankAccount:
                'Dieses Bankkonto kann nicht gelöscht werden, weil es für Expensify Card-Zahlungen verwendet wird. Wenn Sie dieses Konto trotzdem löschen möchten, wenden Sie sich bitte an Concierge.',
            sameDepositAndWithdrawalAccount: 'Die Einzahlungs- und Auszahlungskonten sind identisch.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Wo befindet sich dein Bankkonto?',
        accountDetailsStepHeader: 'Wie lauten Ihre Kontodetails?',
        accountTypeStepHeader: 'Welche Art von Konto ist das?',
        bankInformationStepHeader: 'Wie lauten deine Bankdaten?',
        accountHolderInformationStepHeader: 'Was sind die Kontoinhaberdaten?',
        howDoWeProtectYourData: 'Wie schützen wir Ihre Daten?',
        currencyHeader: 'Was ist die Währung deines Bankkontos?',
        confirmationStepHeader: 'Überprüfen Sie Ihre Angaben.',
        confirmationStepSubHeader: 'Überprüfen Sie die untenstehenden Angaben und aktivieren Sie das Kontrollkästchen für die Bedingungen, um zu bestätigen.',
        toGetStarted: 'Fügen Sie ein persönliches Bankkonto hinzu, um Erstattungen zu erhalten, Rechnungen zu bezahlen oder die Expensify Wallet zu aktivieren.',
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
        passwordRequired: 'Bitte geben Sie ein Passwort ein',
        passwordIncorrect: 'Falsches Passwort. Bitte versuche es erneut.',
        failedToLoadPDF: 'PDF-Datei konnte nicht geladen werden',
        pdfPasswordForm: {
            title: 'Passwortgeschützte PDF',
            infoText: 'Diese PDF ist passwortgeschützt.',
            beforeLinkText: 'Bitte',
            linkText: 'Passwort eingeben',
            afterLinkText: 'anzuzeigen.',
            formLabel: 'PDF anzeigen',
        },
        attachmentNotFound: 'Anhang nicht gefunden',
        retry: 'Erneut versuchen',
    },
    messages: {
        errorMessageInvalidPhone: `Bitte gib eine gültige Telefonnummer ohne Klammern oder Bindestriche ein. Wenn du außerhalb der USA bist, gib bitte deine Ländervorwahl an (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Ungültige E-Mail',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} ist bereits Mitglied von ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} ist bereits ein Admin von ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Indem Sie mit der Anfrage zur Aktivierung Ihres Expensify Wallets fortfahren, bestätigen Sie, dass Sie gelesen, verstanden und akzeptiert haben',
        facialScan: 'Onfidos Richtlinie und Einverständniserklärung zur Gesichtserfassung',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfidos Richtlinie und Einverständniserklärung zur Gesichtserfassung</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Datenschutz</a> und <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Nutzungsbedingungen</a>.</muted-text-micro>`,
        tryAgain: 'Erneut versuchen',
        verifyIdentity: 'Identität bestätigen',
        letsVerifyIdentity: 'Lass uns deine Identität bestätigen',
        butFirst: `Aber zuerst das langweilige Zeug. Lies dir im nächsten Schritt den Juristendeutsch-Text durch und klicke auf „Akzeptieren“, wenn du bereit bist.`,
        genericError: 'Beim Verarbeiten dieses Schrittes ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        cameraPermissionsNotGranted: 'Kamerazugriff aktivieren',
        cameraRequestMessage: 'Wir benötigen Zugriff auf deine Kamera, um die Verifizierung deines Bankkontos abzuschließen. Bitte aktiviere dies über Einstellungen > New Expensify.',
        microphonePermissionsNotGranted: 'Mikrofonzugriff aktivieren',
        microphoneRequestMessage: 'Wir benötigen Zugriff auf dein Mikrofon, um die Bankkontoverifizierung abzuschließen. Bitte aktiviere dies über Einstellungen > New Expensify.',
        originalDocumentNeeded: 'Bitte laden Sie ein Originalfoto Ihres Ausweises hoch, keine Bildschirmaufnahme oder gescannte Kopie.',
        documentNeedsBetterQuality:
            'Ihr Ausweis scheint beschädigt zu sein oder es fehlen Sicherheitsmerkmale. Bitte laden Sie ein Originalbild eines unbeschädigten Ausweises hoch, das vollständig sichtbar ist.',
        imageNeedsBetterQuality: 'Es gibt ein Problem mit der Bildqualität deines Ausweises. Bitte lade ein neues Bild hoch, auf dem dein gesamter Ausweis deutlich zu sehen ist.',
        selfieIssue: 'Es gibt ein Problem mit deinem Selfie/Video. Bitte lade ein aktuelles Selfie/Video hoch.',
        selfieNotMatching: 'Dein Selfie/Video stimmt nicht mit deinem Ausweis überein. Bitte lade ein neues Selfie/Video hoch, auf dem dein Gesicht deutlich zu sehen ist.',
        selfieNotLive: 'Dein Selfie/Video scheint kein Live-Foto/-Video zu sein. Bitte lade ein Live-Selfie/-Video hoch.',
    },
    additionalDetailsStep: {
        headerTitle: 'Weitere Details',
        helpText: 'Wir müssen die folgenden Angaben bestätigen, bevor du mit deinem Wallet Geld senden und empfangen kannst.',
        helpTextIdologyQuestions: 'Wir müssen dir nur noch ein paar Fragen stellen, um deine Identität abschließend zu bestätigen.',
        helpLink: 'Erfahren Sie mehr darüber, warum wir dies benötigen.',
        legalFirstNameLabel: 'Amtlicher Vorname',
        legalMiddleNameLabel: 'Zweiter Vorname (laut Ausweis)',
        legalLastNameLabel: 'Rechtlicher Nachname',
        selectAnswer: 'Bitte wählen Sie eine Antwort aus, um fortzufahren',
        ssnFull9Error: 'Bitte gib eine gültige neunstellige SSN ein',
        needSSNFull9: 'Wir haben Probleme, Ihre Sozialversicherungsnummer zu verifizieren. Bitte geben Sie die vollständigen neun Ziffern Ihrer Sozialversicherungsnummer ein.',
        weCouldNotVerify: 'Wir konnten nicht verifizieren',
        pleaseFixIt: 'Bitte korrigieren Sie diese Informationen, bevor Sie fortfahren',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Wir konnten Ihre Identität nicht verifizieren. Bitte versuchen Sie es später noch einmal oder wenden Sie sich an <a href="mailto:${conciergeEmail}">${conciergeEmail}</a>, wenn Sie Fragen haben.`,
    },
    termsStep: {
        headerTitle: 'Bedingungen und Gebühren',
        headerTitleRefactor: 'Gebühren und Bedingungen',
        haveReadAndAgreePlain: 'Ich habe gelesen und stimme zu, elektronische Offenlegungen zu erhalten.',
        haveReadAndAgree: `Ich habe die <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">elektronischen Offenlegungen</a> gelesen und stimme ihrem Erhalt zu.`,
        agreeToThePlain: 'Ich stimme der Datenschutz- und Wallet-Vereinbarung zu.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Ich stimme der <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzerklärung</a> und der <a href="${walletAgreementUrl}">Wallet-Vereinbarung</a> zu.`,
        enablePayments: 'Zahlungen aktivieren',
        monthlyFee: 'Monatliche Gebühr',
        inactivity: 'Inaktivität',
        noOverdraftOrCredit: 'Keine Überziehungs-/Kreditfunktion.',
        electronicFundsWithdrawal: 'Elektronische Abbuchung von Geldmitteln',
        standard: 'Standard',
        reviewTheFees: 'Sieh dir einige Gebühren an.',
        checkTheBoxes: 'Bitte markieren Sie die Kästchen unten.',
        agreeToTerms: 'Stimmen Sie den Bedingungen zu und schon kann es losgehen!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Die Expensify Wallet wird von ${walletProgram} ausgegeben.`,
            perPurchase: 'Pro Einkauf',
            atmWithdrawal: 'Geldautomat-Abhebung',
            cashReload: 'Bargeldaufladung',
            inNetwork: 'im Netzwerk',
            outOfNetwork: 'außerhalb des Netzwerks',
            atmBalanceInquiry: 'Geldautomaten-Saldoabfrage (im oder außerhalb des Netzwerks)',
            customerService: 'Kundenservice (automatisiert oder Live-Agent)',
            inactivityAfterTwelveMonths: 'Inaktivität (nach 12 Monaten ohne Transaktionen)',
            weChargeOneFee: 'Wir berechnen 1 andere Art von Gebühr. Sie ist:',
            fdicInsurance: 'Ihre Gelder sind für eine FDIC-Versicherung berechtigt.',
            generalInfo: `Allgemeine Informationen über Prepaid-Konten finden Sie unter <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Ausführliche Informationen und Bedingungen zu allen Gebühren und Dienstleistungen finden Sie unter <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> oder telefonisch unter +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektronische Guthabenabbuchung (sofort)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(mind. ${amount})`,
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
            customerServiceDetails: 'Es fallen keine Kundendienstgebühren an.',
            inactivityDetails: 'Es gibt keine Inaktivitätsgebühr.',
            sendingFundsTitle: 'Senden von Geld an einen anderen Kontoinhaber',
            sendingFundsDetails: 'Es fällt keine Gebühr an, wenn du mit deinem Guthaben, Bankkonto oder deiner Debitkarte Geld an einen anderen Kontoinhaber sendest.',
            electronicFundsStandardDetails:
                'Für Überweisungen von deinem Expensify Wallet auf dein Bankkonto mit der Standardoption fällt keine Gebühr an. Diese Überweisung wird in der Regel innerhalb von 1–3 Werktagen abgeschlossen.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Für Überweisungen von deinem Expensify Wallet auf deine verknüpfte Debitkarte per Sofortüberweisung fällt eine Gebühr an. Diese Überweisung wird in der Regel innerhalb weniger Minuten abgeschlossen.' +
                `Die Gebühr beträgt ${percentage}% des Überweisungsbetrags (mit einer Mindestgebühr von ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Ihre Gelder sind für eine FDIC-Versicherung berechtigt. Ihre Gelder werden bei ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, einem von der FDIC versicherten Institut, gehalten oder dorthin übertragen.` +
                `Sobald sie dort sind, sind Ihre Gelder bis zu ${amount} durch die FDIC versichert, falls ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} ausfällt, sofern bestimmte Einlagensicherungsanforderungen erfüllt sind und Ihre Karte registriert ist. Einzelheiten finden Sie unter ${CONST.TERMS.FDIC_PREPAID}.`,
            contactExpensifyPayments: `Kontaktieren Sie ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} telefonisch unter +1 833-400-0904, per E‑Mail an ${CONST.EMAIL.CONCIERGE} oder melden Sie sich unter ${CONST.NEW_EXPENSIFY_URL} an.`,
            generalInformation: `Allgemeine Informationen zu Prepaid-Konten finden Sie unter ${CONST.TERMS.CFPB_PREPAID}. Wenn Sie eine Beschwerde über ein Prepaid-Konto haben, rufen Sie das Consumer Financial Protection Bureau unter 1-855-411-2372 an oder besuchen Sie ${CONST.TERMS.CFPB_COMPLAINT}.`,
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
        activatedMessage: 'Glückwunsch, deine Wallet ist eingerichtet und bereit, Zahlungen zu senden.',
        checkBackLaterTitle: 'Nur eine Minute …',
        checkBackLaterMessage: 'Wir überprüfen Ihre Angaben noch. Bitte schauen Sie später noch einmal vorbei.',
        continueToPayment: 'Weiter zur Zahlung',
        continueToTransfer: 'Weiter übertragen',
    },
    companyStep: {
        headerTitle: 'Firmeninformationen',
        subtitle: 'Fast geschafft! Aus Sicherheitsgründen müssen wir einige Angaben bestätigen:',
        legalBusinessName: 'Rechtlicher Unternehmensname',
        companyWebsite: 'Firmenwebsite',
        taxIDNumber: 'Steuernummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        companyType: 'Unternehmenstyp',
        incorporationDate: 'Gründungsdatum',
        incorporationState: 'Bundesstaat der Gründung',
        industryClassificationCode: 'Branchensklassifizierungscode',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der',
        listOfRestrictedBusinesses: 'Liste der eingeschränkten Unternehmen',
        incorporationDatePlaceholder: 'Startdatum (JJJJ-MM-TT)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Konzern',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Kooperativ',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Sonstiges',
        },
        industryClassification: 'Unter welcher Branche ist das Unternehmen klassifiziert?',
        industryClassificationCodePlaceholder: 'Nach Branchenschlüssel suchen',
    },
    requestorStep: {
        headerTitle: 'Persönliche Informationen',
        learnMore: 'Mehr erfahren',
        isMyDataSafe: 'Sind meine Daten sicher?',
    },
    personalInfoStep: {
        personalInfo: 'Persönliche Daten',
        enterYourLegalFirstAndLast: 'Wie lautet Ihr amtlicher Name?',
        legalFirstName: 'Amtlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        legalName: 'Rechtlicher Name',
        enterYourDateOfBirth: 'Wie ist dein Geburtsdatum?',
        enterTheLast4: 'Wie lauten die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4SSN: 'Letzte 4 der Sozialversicherungsnummer',
        enterYourAddress: 'Wie lautet Ihre Adresse?',
        address: 'Adresse',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        byAddingThisBankAccount: 'Durch Hinzufügen dieses Bankkontos bestätigst du, dass du Folgendes gelesen, verstanden und akzeptiert hast',
        whatsYourLegalName: 'Wie lautet Ihr gesetzlicher Name?',
        whatsYourDOB: 'Wie ist dein Geburtsdatum?',
        whatsYourAddress: 'Wie lautet deine Adresse?',
        whatsYourSSN: 'Wie lauten die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        noPersonalChecks: 'Keine Sorge, hier werden keine persönlichen Bonitätsprüfungen durchgeführt!',
        whatsYourPhoneNumber: 'Wie lautet deine Telefonnummer?',
        weNeedThisToVerify: 'Wir benötigen dies, um Ihre Wallet zu verifizieren.',
    },
    businessInfoStep: {
        businessInfo: 'Unternehmensinformationen',
        enterTheNameOfYourBusiness: 'Wie heißt dein Unternehmen?',
        businessName: 'Rechtlicher Firmenname',
        enterYourCompanyTaxIdNumber: 'Wie lautet die Steuernummer Ihres Unternehmens?',
        taxIDNumber: 'Steuernummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        enterYourCompanyWebsite: 'Wie lautet die Website Ihres Unternehmens?',
        companyWebsite: 'Firmenwebsite',
        enterYourCompanyPhoneNumber: 'Wie lautet die Telefonnummer Ihres Unternehmens?',
        enterYourCompanyAddress: 'Wie lautet die Adresse Ihres Unternehmens?',
        selectYourCompanyType: 'Um welchen Unternehmenstyp handelt es sich?',
        companyType: 'Unternehmenstyp',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Konzern',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Kooperativ',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Sonstiges',
        },
        selectYourCompanyIncorporationDate: 'Wie lautet das Gründungsdatum Ihres Unternehmens?',
        incorporationDate: 'Gründungsdatum',
        incorporationDatePlaceholder: 'Startdatum (JJJJ-MM-TT)',
        incorporationState: 'Bundesstaat der Gründung',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In welchem Bundesstaat wurde Ihr Unternehmen gegründet?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        companyAddress: 'Firmenadresse',
        listOfRestrictedBusinesses: 'Liste der eingeschränkten Unternehmen',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der',
        businessInfoTitle: 'Geschäftsinformationen',
        legalBusinessName: 'Rechtlicher Unternehmensname',
        whatsTheBusinessName: 'Wie lautet der Geschäftsname?',
        whatsTheBusinessAddress: 'Wie lautet die Geschäftsadresse?',
        whatsTheBusinessContactInformation: 'Wie lauten die geschäftlichen Kontaktdaten?',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Was ist die Unternehmensregistrierungsnummer (CRN)?';
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
                    return 'Wie lautet die Umsatzsteuer-Identifikationsnummer (USt-IdNr.)?';
                case CONST.COUNTRY.AU:
                    return 'Was ist die Australian Business Number (ABN)?';
                default:
                    return 'Was ist die EU-Umsatzsteuer-Identifikationsnummer?';
            }
        },
        whatsThisNumber: 'Was ist diese Zahl?',
        whereWasTheBusinessIncorporated: 'Wo wurde das Unternehmen gegründet?',
        whatTypeOfBusinessIsIt: 'Um welche Art von Unternehmen handelt es sich?',
        whatsTheBusinessAnnualPayment: 'Wie hoch ist das jährliche Zahlungsvolumen des Unternehmens?',
        whatsYourExpectedAverageReimbursements: 'Wie hoch ist Ihr erwarteter durchschnittlicher Erstattungsbetrag?',
        registrationNumber: 'Registrierungsnummer',
        taxIDEIN: (country: string) => {
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
                    return 'EU-Mehrwertsteuer';
            }
        },
        businessAddress: 'Geschäftsadresse',
        businessType: 'Geschäftsart',
        incorporation: 'Gründung',
        incorporationCountry: 'Gründungsland',
        incorporationTypeName: 'Art der Gesellschaftsform',
        businessCategory: 'Geschäftskategorie',
        annualPaymentVolume: 'Jährliches Zahlungsvolumen',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Jährliches Zahlungsvolumen in ${currencyCode}`,
        averageReimbursementAmount: 'Durchschnittlicher Erstattungsbetrag',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Durchschnittliche Erstattungsbetrag in ${currencyCode}`,
        selectIncorporationType: 'Rechtsform auswählen',
        selectBusinessCategory: 'Geschäftskategorie auswählen',
        selectAnnualPaymentVolume: 'Jährliches Zahlungsvolumen auswählen',
        selectIncorporationCountry: 'Gründungsland auswählen',
        selectIncorporationState: 'Inkorporationsstaat auswählen',
        selectAverageReimbursement: 'Durchschnittlichen Erstattungsbetrag auswählen',
        selectBusinessType: 'Geschäftsart auswählen',
        findIncorporationType: 'Rechtsform finden',
        findBusinessCategory: 'Unternehmenskategorie finden',
        findAnnualPaymentVolume: 'Jährliches Zahlungsvolumen ermitteln',
        findIncorporationState: 'Staat der Gründung finden',
        findAverageReimbursement: 'Durchschnittlichen Erstattungsbetrag finden',
        findBusinessType: 'Unternehmensart finden',
        error: {
            registrationNumber: 'Bitte gib eine gültige Registrierungsnummer ein',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Bitte gib eine gültige Arbeitgeber-Identifikationsnummer (EIN) ein';
                    case CONST.COUNTRY.CA:
                        return 'Bitte gib eine gültige Business Number (BN) ein';
                    case CONST.COUNTRY.GB:
                        return 'Bitte gib eine gültige Umsatzsteuer-Identifikationsnummer (USt-IdNr.) ein';
                    case CONST.COUNTRY.AU:
                        return 'Bitte geben Sie eine gültige Australian Business Number (ABN) ein';
                    default:
                        return 'Bitte gib eine gültige EU-Umsatzsteuer-Identifikationsnummer an';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `Besitzen Sie 25 % oder mehr von ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `Besitzen einzelne Personen 25 % oder mehr von ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Gibt es weitere Personen, die 25 % oder mehr von ${companyName} besitzen?`,
        regulationRequiresUsToVerifyTheIdentity: 'Vorschriften verlangen, dass wir die Identität jeder Person überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        companyOwner: 'Geschäftsinhaber',
        enterLegalFirstAndLastName: 'Wie lautet der gesetzliche Name des Eigentümers?',
        legalFirstName: 'Amtlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        enterTheDateOfBirthOfTheOwner: 'Wie lautet das Geburtsdatum des Besitzers?',
        enterTheLast4: 'Was sind die letzten 4 Ziffern der Sozialversicherungsnummer des Inhabers?',
        last4SSN: 'Letzte 4 der Sozialversicherungsnummer',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        enterTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        address: 'Adresse',
        byAddingThisBankAccount: 'Durch Hinzufügen dieses Bankkontos bestätigst du, dass du Folgendes gelesen, verstanden und akzeptiert hast',
        owners: 'Eigentümer',
    },
    ownershipInfoStep: {
        ownerInfo: 'Inhaberinformationen',
        businessOwner: 'Geschäftsinhaber',
        signerInfo: 'Information zum Unterzeichner',
        doYouOwn: (companyName: string) => `Besitzen Sie 25 % oder mehr von ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `Besitzen einzelne Personen 25 % oder mehr von ${companyName}?`,
        regulationsRequire: 'Vorschriften verlangen, dass wir die Identität jeder Person überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        legalFirstName: 'Amtlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        whatsTheOwnersName: 'Wie lautet der gesetzliche Name des Eigentümers?',
        whatsYourName: 'Wie lautet Ihr amtlicher Name?',
        whatPercentage: 'Wie viel Prozent des Unternehmens gehören dem Eigentümer?',
        whatsYoursPercentage: 'Wie viel Prozent des Unternehmens besitzen Sie?',
        ownership: 'Eigentum',
        whatsTheOwnersDOB: 'Wie lautet das Geburtsdatum des Besitzers?',
        whatsYourDOB: 'Wie ist dein Geburtsdatum?',
        whatsTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        whatsYourAddress: 'Wie lautet Ihre Adresse?',
        whatAreTheLast: 'Wie lauten die letzten 4 Ziffern der Sozialversicherungsnummer des Eigentümers?',
        whatsYourLast: 'Was sind die letzten 4 Ziffern Ihrer Sozialversicherungsnummer?',
        whatsYourNationality: 'Was ist Ihr Staatsangehörigkeitsland?',
        whatsTheOwnersNationality: 'Wie lautet das Staatsangehörigkeitsland des Eigentümers?',
        countryOfCitizenship: 'Staatsangehörigkeitsland',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4: 'Letzte 4 der Sozialversicherungsnummer',
        whyDoWeAsk: 'Warum fragen wir danach?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        ownershipPercentage: 'Eigentumsanteil',
        areThereOther: (companyName: string) => `Gibt es andere Personen, die 25 % oder mehr von ${companyName} besitzen?`,
        owners: 'Eigentümer',
        addCertified: 'Füge ein zertifiziertes Organigramm hinzu, das die wirtschaftlich Berechtigten zeigt',
        regulationRequiresChart:
            'Aufgrund gesetzlicher Vorschriften müssen wir eine beglaubigte Kopie des Eigentumsdiagramms einholen, das jede Person oder juristische Einheit ausweist, die 25 % oder mehr des Unternehmens besitzt.',
        uploadEntity: 'Diagramm zur Eigentümerstruktur der Einheit hochladen',
        noteEntity: 'Hinweis: Das Organigramm der Unternehmenseigentümer muss von Ihrem Steuerberater, Rechtsbeistand unterschrieben oder notariell beglaubigt werden.',
        certified: 'Zertifiziertes Beteiligungsdiagramm der juristischen Person',
        selectCountry: 'Land auswählen',
        findCountry: 'Land suchen',
        address: 'Adresse',
        chooseFile: 'Datei auswählen',
        uploadDocuments: 'Zusätzliche Unterlagen hochladen',
        pleaseUpload:
            'Bitte laden Sie unten zusätzliche Dokumente hoch, damit wir Ihre Identität als direkte oder indirekte Eigentümerin bzw. Eigentümer von 25 % oder mehr der juristischen Person verifizieren können.',
        acceptedFiles: 'Akzeptierte Dateiformate: PDF, PNG, JPEG. Die gesamte Dateigröße für jeden Abschnitt darf 5 MB nicht überschreiten.',
        proofOfBeneficialOwner: 'Nachweis des wirtschaftlich Berechtigten',
        proofOfBeneficialOwnerDescription:
            'Bitte legen Sie eine unterzeichnete Bescheinigung und ein Organigramm von einem vereidigten Buchhalter, Notar oder Rechtsanwalt vor, in denen der Besitz von 25 % oder mehr des Unternehmens bestätigt wird. Die Unterlagen müssen innerhalb der letzten drei Monate datiert sein und die Zulassungsnummer des Unterzeichners enthalten.',
        copyOfID: 'Ausweiskopie für wirtschaftlich Berechtigten',
        copyOfIDDescription: 'Beispiele: Reisepass, Führerschein usw.',
        proofOfAddress: 'Adressnachweis für wirtschaftlich Berechtigten',
        proofOfAddressDescription: 'Beispiele: Nebenkostenabrechnung, Mietvertrag usw.',
        codiceFiscale: 'Codice fiscale/Steuer-ID',
        codiceFiscaleDescription:
            'Bitte laden Sie ein Video eines Vor-Ort-Termins oder eines aufgezeichneten Gesprächs mit dem zeichnungsberechtigten Bevollmächtigten hoch. Der Bevollmächtigte muss folgende Angaben machen: vollständiger Name, Geburtsdatum, Firmenname, Handelsregisternummer, Steuerkennnummer, eingetragene Adresse, Geschäftsart und Verwendungszweck des Kontos.',
    },
    completeVerificationStep: {
        completeVerification: 'Verifizierung abschließen',
        confirmAgreements: 'Bitte bestätigen Sie die Vereinbarungen unten.',
        certifyTrueAndAccurate: 'Ich bestätige, dass die bereitgestellten Informationen wahr und korrekt sind',
        certifyTrueAndAccurateError: 'Bitte bestätigen Sie, dass die Angaben wahrheitsgemäß und korrekt sind',
        isAuthorizedToUseBankAccount: 'Ich bin berechtigt, dieses Geschäftskonto für Geschäftsausgaben zu verwenden',
        isAuthorizedToUseBankAccountError: 'Sie müssen ein bevollmächtigter Zeichnungsberechtigter mit Autorisierung zur Führung des Geschäftskontos sein',
        termsAndConditions: 'Allgemeine Geschäftsbedingungen',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Bestätige dein Bankkonto',
        validateButtonText: 'Validieren',
        validationInputLabel: 'Transaktion',
        maxAttemptsReached: 'Die Validierung für dieses Bankkonto wurde aufgrund zu vieler falscher Versuche deaktiviert.',
        description: `Innerhalb von 1–2 Werktagen senden wir drei (3) kleine Transaktionen auf Ihr Bankkonto von einem Namen wie „Expensify, Inc. Validation“.`,
        descriptionCTA: 'Bitte geben Sie jeden Transaktionsbetrag in die Felder unten ein. Beispiel: 1,51.',
        letsChatText: 'Fast geschafft! Wir brauchen deine Hilfe, um ein paar letzte Informationen im Chat zu bestätigen. Bereit?',
        enable2FATitle: 'Betrug verhindern, Zwei-Faktor-Authentifizierung (2FA) aktivieren',
        enable2FAText: 'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt 2FA ein, um Ihr Konto mit einer zusätzlichen Schutzebene zu versehen.',
        secureYourAccount: 'Sichern Sie Ihr Konto',
    },
    countryStep: {
        confirmBusinessBank: 'Bestätigen Sie die Währung und das Land Ihres Geschäftskontos',
        confirmCurrency: 'Währung und Land bestätigen',
        yourBusiness: 'Die Währung Ihres Geschäftskontos muss mit der Währung Ihres Arbeitsbereichs übereinstimmen.',
        youCanChange: 'Sie können die Währung Ihres Arbeitsbereichs in Ihren',
        findCountry: 'Land suchen',
        selectCountry: 'Land auswählen',
    },
    bankInfoStep: {
        whatAreYour: 'Wie lauten die Bankverbindungsdaten Ihres Geschäftskontos?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles in Ordnung aussieht.',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in deinem Workspace verwendet',
        accountNumber: 'Kontonummer',
        accountHolderNameDescription: 'Vollständiger Name des zeichnungsberechtigten Unterzeichners',
    },
    signerInfoStep: {
        signerInfo: 'Information zum Unterzeichner',
        areYouDirector: (companyName: string) => `Sind Sie Geschäftsführer bei ${companyName}?`,
        regulationRequiresUs: 'Vorschriften verpflichten uns zu überprüfen, ob die unterzeichnende Person befugt ist, diese Aktion im Namen des Unternehmens vorzunehmen.',
        whatsYourName: 'Wie lautet Ihr gesetzlicher Name',
        fullName: 'Vollständiger gesetzlicher Name',
        whatsYourJobTitle: 'Wie lautet deine Berufsbezeichnung?',
        jobTitle: 'Berufsbezeichnung',
        whatsYourDOB: 'Wie ist dein Geburtsdatum?',
        uploadID: 'Ausweis und Adressnachweis hochladen',
        personalAddress: 'Nachweis der Privatadresse (z. B. Nebenkostenabrechnung)',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        proofOf: 'Nachweis der privaten Anschrift',
        enterOneEmail: (companyName: string) => `Geben Sie die E-Mail-Adresse eines Direktors bei ${companyName} ein`,
        regulationRequiresOneMoreDirector: 'Die Vorschriften erfordern mindestens einen weiteren Geschäftsführer als Unterzeichner.',
        hangTight: 'Einen Moment...',
        enterTwoEmails: (companyName: string) => `Gib die E-Mail-Adressen von zwei Direktoren bei ${companyName} ein`,
        sendReminder: 'Erinnerung senden',
        chooseFile: 'Datei auswählen',
        weAreWaiting: 'Wir warten darauf, dass andere ihre Identität als Geschäftsleiter verifizieren.',
        id: 'Kopie des Ausweises',
        proofOfDirectors: 'Nachweis der Geschäftsführung',
        proofOfDirectorsDescription: 'Beispiele: Oncorp Unternehmensprofil oder Unternehmensregistrierung.',
        codiceFiscale: 'Steuernummer',
        codiceFiscaleDescription: 'Steuernummer für Unterzeichner, Bevollmächtigte Benutzer und wirtschaftlich Berechtigte.',
        PDSandFSG: 'PDS- und FSG-Offenlegungsunterlagen',
        PDSandFSGDescription: dedent(`
            Unsere Partnerschaft mit Corpay nutzt eine API-Verbindung, um deren umfangreiches Netzwerk internationaler Bankpartner zu verwenden und so Globale Erstattungen in Expensify zu ermöglichen. Gemäß australischer Gesetzgebung stellen wir Ihnen den Financial Services Guide (FSG) und die Product Disclosure Statement (PDS) von Corpay zur Verfügung.

            Bitte lesen Sie die FSG- und PDS-Dokumente sorgfältig durch, da sie vollständige Details und wichtige Informationen zu den Produkten und Dienstleistungen enthalten, die Corpay anbietet. Bewahren Sie diese Dokumente für zukünftige Zwecke auf.
        `),
        pleaseUpload: 'Bitte laden Sie unten zusätzliche Unterlagen hoch, damit wir Ihre Identität als Geschäftsführer des Unternehmens verifizieren können.',
        enterSignerInfo: 'Unterschriftsinformationen eingeben',
        thisStep: 'Dieser Schritt wurde abgeschlossen',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `verbindet ein ${currency}-Geschäftsbankkonto mit der Endung ${bankAccountLastFour} mit Expensify, um Mitarbeitende in ${currency} zu bezahlen. Der nächste Schritt erfordert Zeichnungsberechtigteninformationen von einer Geschäftsführungsperson.`,
        error: {
            emailsMustBeDifferent: 'E-Mail-Adressen müssen unterschiedlich sein',
        },
    },
    agreementsStep: {
        agreements: 'Vereinbarungen',
        pleaseConfirm: 'Bitte bestätigen Sie die folgenden Vereinbarungen',
        regulationRequiresUs: 'Vorschriften verlangen, dass wir die Identität jeder Person überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        iAmAuthorized: 'Ich bin berechtigt, das Geschäftskonto für Geschäftsausgaben zu verwenden.',
        iCertify: 'Ich bestätige, dass die bereitgestellten Informationen wahr und korrekt sind.',
        iAcceptTheTermsAndConditions: `Ich akzeptiere die <a href="https://cross-border.corpay.com/tc/">Allgemeinen Geschäftsbedingungen</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Ich akzeptiere die Geschäftsbedingungen.',
        accept: 'Bankkonto akzeptieren und hinzufügen',
        iConsentToThePrivacyNotice: 'Ich stimme der <a href="https://payments.corpay.com/compliance">Datenschutzerklärung</a> zu.',
        iConsentToThePrivacyNoticeAccessibility: 'Ich stimme der Datenschutzerklärung zu.',
        error: {
            authorized: 'Sie müssen ein bevollmächtigter Zeichnungsberechtigter mit Autorisierung zur Führung des Geschäftskontos sein',
            certify: 'Bitte bestätigen Sie, dass die Angaben wahrheitsgemäß und korrekt sind',
            consent: 'Bitte stimmen Sie der Datenschutzerklärung zu',
        },
    },
    docusignStep: {
        subheader: 'DocuSign-Formular',
        pleaseComplete:
            'Bitte füllen Sie das ACH-Autorisierungsformular über den untenstehenden Docusign-Link aus und laden Sie anschließend die unterschriebene Kopie hier hoch, damit wir Geld direkt von Ihrem Bankkonto abbuchen können',
        pleaseCompleteTheBusinessAccount: 'Bitte füllen Sie den Antrag für das Geschäftskonto-Lastschriftabkommen aus',
        pleaseCompleteTheDirect:
            'Bitte füllen Sie die Lastschriftvereinbarung über den untenstehenden DocuSign-Link aus und laden Sie anschließend die unterschriebene Kopie hier hoch, damit wir Gelder direkt von Ihrem Bankkonto einziehen können.',
        takeMeTo: 'Bring mich zu Docusign',
        uploadAdditional: 'Zusätzliche Unterlagen hochladen',
        pleaseUpload: 'Bitte laden Sie das DEFT-Formular und die Docusign-Unterschriftsseite hoch',
        pleaseUploadTheDirect: 'Bitte laden Sie die Abbuchungsvereinbarungen und die Docusign-Unterschriftsseite hoch',
    },
    finishStep: {
        letsFinish: 'Lass uns den Chat beenden!',
        thanksFor:
            'Vielen Dank für diese Angaben. Ein*e dedizierte*r Support-Mitarbeiter*in wird Ihre Informationen nun prüfen. Wir melden uns, falls wir noch etwas von Ihnen benötigen, aber in der Zwischenzeit können Sie sich bei Fragen gerne an uns wenden.',
        iHaveA: 'Ich habe eine Frage',
        enable2FA: 'Aktiviere die Zwei-Faktor-Authentifizierung (2FA), um Betrug zu verhindern',
        weTake: 'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt 2FA ein, um Ihr Konto mit einer zusätzlichen Schutzebene zu versehen.',
        secure: 'Sichern Sie Ihr Konto',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Einen Moment',
        explanationLine: 'Wir überprüfen gerade deine Angaben. Du kannst in Kürze mit den nächsten Schritten fortfahren.',
    },
    session: {
        offlineMessageRetry: 'Sie scheinen offline zu sein. Bitte prüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    },
    travel: {
        header: 'Reise buchen',
        title: 'Reise clever',
        subtitle: 'Nutze Expensify Travel, um die besten Reiseangebote zu erhalten und all deine Geschäftsausgaben an einem Ort zu verwalten.',
        features: {
            saveMoney: 'Spare Geld bei deinen Buchungen',
            alerts: 'Erhalten Sie Echtzeit-Benachrichtigungen, wenn sich Ihre Reisepläne ändern',
        },
        bookTravel: 'Reise buchen',
        bookDemo: 'Demo buchen',
        bookADemo: 'Demo buchen',
        toLearnMore: 'um mehr zu erfahren.',
        termsAndConditions: {
            header: 'Bevor wir fortfahren …',
            title: 'Geschäftsbedingungen',
            label: 'Ich stimme den Geschäftsbedingungen zu',
            subtitle: `Bitte stimmen Sie den Expensify Travel-<a href="${CONST.TRAVEL_TERMS_URL}">Geschäftsbedingungen</a> zu.`,
            error: 'Sie müssen den Expensify Travel‑Geschäftsbedingungen zustimmen, um fortzufahren',
            defaultWorkspaceError:
                'Du musst einen Standard-Arbeitsbereich festlegen, um Expensify Travel zu aktivieren. Gehe zu Einstellungen > Arbeitsbereiche > klicke auf die drei vertikalen Punkte neben einem Arbeitsbereich > Als Standard-Arbeitsbereich festlegen und versuche es dann erneut!',
        },
        flight: 'Flug',
        flightDetails: {
            passenger: 'Passagier',
            layover: (layover: string) => `<muted-text-label>Sie haben einen <strong>${layover} Zwischenstopp</strong> vor diesem Flug</muted-text-label>`,
            takeOff: 'Abflug',
            landing: 'Startseite',
            seat: 'Sitz',
            class: 'Reiseklasse',
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
            carType: 'Autotyp',
            cancellation: 'Stornierungsbedingungen',
            cancellationUntil: 'Kostenlose Stornierung bis',
            freeCancellation: 'Kostenlose Stornierung',
            confirmation: 'Bestätigungsnummer',
        },
        train: 'Bahn',
        trainDetails: {
            passenger: 'Passagier',
            departs: 'Abreise',
            arrives: 'Kommt an',
            coachNumber: 'Wagennummer',
            seat: 'Sitz',
            fareDetails: 'Fahrpreisinformationen',
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
        departs: 'Abreise',
        errorMessage: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>Bitte <a href="${phoneErrorMethodsRoute}">fügen Sie eine geschäftliche E-Mail-Adresse als Ihre primäre Anmeldung hinzu</a>, um Reisen zu buchen.</rbr>`,
        domainSelector: {
            title: 'Domain',
            subtitle: 'Wählen Sie eine Domain für die Einrichtung von Expensify Travel.',
            recommended: 'Empfohlen',
        },
        domainPermissionInfo: {
            title: 'Domain',
            restriction: (domain: string) =>
                `Sie haben keine Berechtigung, Expensify Travel für die Domain <strong>${domain}</strong> zu aktivieren. Bitten Sie stattdessen jemanden aus dieser Domain, Travel zu aktivieren.`,
            accountantInvitation: `Wenn Sie Buchhalter sind, sollten Sie dem <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! Accountants-Programm</a> beitreten, um Reisen für diese Domain zu ermöglichen.`,
        },
        publicDomainError: {
            title: 'Loslegen mit Expensify Travel',
            message: `Für Expensify Travel musst du deine geschäftliche E-Mail-Adresse (z. B. name@company.com) verwenden, nicht deine private E-Mail-Adresse (z. B. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel wurde deaktiviert',
            message: `Ihr Admin hat Expensify Travel deaktiviert. Bitte halten Sie sich bei Reisebuchungen an die Reiserichtlinien Ihres Unternehmens.`,
        },
        verifyCompany: {
            title: 'Wir prüfen gerade Ihre Anfrage…',
            message: `Wir führen einige Überprüfungen durch, um sicherzustellen, dass dein Konto für Expensify Travel bereit ist. Wir melden uns in Kürze bei dir!`,
            confirmText: 'Verstanden',
            conciergeMessage: ({domain}: {domain: string}) =>
                `Aktivierung von Reisen für die Domain ${domain} fehlgeschlagen. Bitte überprüfen Sie diese Domain und aktivieren Sie Reisen dafür.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde gebucht. Bestätigungscode: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Ticket für den Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde storniert.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Ticket für Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde erstattet oder umgebucht.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate}} wurde von der Fluggesellschaft storniert.`,
            flightScheduleChangePending: (airlineCode: string) => `Die Fluggesellschaft hat eine Flugplanänderung für Flug ${airlineCode} vorgeschlagen; wir warten auf die Bestätigung.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Flugplanänderung bestätigt: Flug ${airlineCode} startet jetzt um ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde aktualisiert.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Ihre Kabinenklasse wurde für den Flug ${airlineCode} auf ${cabinClass} aktualisiert.`,
            flightSeatConfirmed: (airlineCode: string) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde bestätigt.`,
            flightSeatChanged: (airlineCode: string) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde geändert.`,
            flightSeatCancelled: (airlineCode: string) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde entfernt.`,
            paymentDeclined: 'Die Zahlung für Ihre Flugbuchung ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Sie haben Ihre ${type}-Reservierung ${id} storniert.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Der Anbieter hat Ihre ${type}-Reservierung ${id} storniert.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Ihre ${type}-Reservierung wurde neu gebucht. Neue Bestätigungsnummer: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Ihre ${type}-Buchung wurde aktualisiert. Prüfen Sie die neuen Details in der Reiseroute.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Ihr Bahnticket für ${origin} → ${destination} am ${startDate} wurde erstattet. Eine Gutschrift wird bearbeitet.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Ihr Bahnticket für ${origin} → ${destination} am ${startDate} wurde umgetauscht.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Ihr Bahnticket für ${origin} → ${destination} am ${startDate} wurde aktualisiert.`,
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
            findWorkspace: 'Workspace finden',
            edit: 'Arbeitsbereich bearbeiten',
            enabled: 'Aktiviert',
            disabled: 'Deaktiviert',
            everyone: 'Alle',
            delete: 'Arbeitsbereich löschen',
            settings: 'Einstellungen',
            reimburse: 'Rückerstattungen',
            categories: 'Kategorien',
            tags: 'Stichwörter',
            customField1: 'Benutzerdefiniertes Feld 1',
            customField2: 'Benutzerdefiniertes Feld 2',
            customFieldHint: 'Fügen Sie benutzerdefinierte Kodierung hinzu, die auf alle Ausgaben dieses Mitglieds angewendet wird.',
            reports: 'Berichte',
            reportFields: 'Berichtsfelder',
            reportTitle: 'Berichtstitel',
            reportField: 'Berichtsfeld',
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
            reconcileCards: 'Kartenabgleich',
            selectAll: 'Alle auswählen',
            selected: () => ({
                one: '1 ausgewählt',
                other: (count: number) => `${count} ausgewählt`,
            }),
            settlementFrequency: 'Abrechnungshäufigkeit',
            setAsDefault: 'Als Standardarbeitsbereich festlegen',
            defaultNote: `Belege, die an ${CONST.EMAIL.RECEIPTS} gesendet werden, erscheinen in diesem Workspace.`,
            deleteConfirmation: 'Sind Sie sicher, dass Sie diesen Workspace löschen möchten?',
            deleteWithCardsConfirmation: 'Möchtest du diesen Workspace wirklich löschen? Dadurch werden alle Karten-Feeds und zugewiesenen Karten entfernt.',
            unavailable: 'Nicht verfügbiger Workspace',
            memberNotFound: 'Mitglied nicht gefunden. Um ein neues Mitglied zum Workspace einzuladen, verwende bitte die Einladen-Schaltfläche oben.',
            notAuthorized: `Du hast keinen Zugriff auf diese Seite. Wenn du versuchst, diesem Workspace beizutreten, bitte einfach den Workspace-Eigentümer, dich als Mitglied hinzuzufügen. Etwas anderes? Wende dich an ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Zum Workspace gehen',
            duplicateWorkspace: 'Arbeitsbereich duplizieren',
            duplicateWorkspacePrefix: 'Duplikat',
            goToWorkspaces: 'Zu Arbeitsbereichen gehen',
            clearFilter: 'Filter löschen',
            workspaceName: 'Arbeitsbereichsname',
            workspaceOwner: 'Eigentümer',
            workspaceType: 'Arbeitsbereichstyp',
            workspaceAvatar: 'Workspace-Avatar',
            mustBeOnlineToViewMembers: 'Sie müssen online sein, um die Mitglieder dieses Arbeitsbereichs anzuzeigen.',
            moreFeatures: 'Weitere Funktionen',
            requested: 'Angefordert',
            distanceRates: 'Entfernungsvergütung',
            defaultDescription: 'Ein Ort für all Ihre Belege und Ausgaben.',
            descriptionHint: 'Informationen über diesen Workspace mit allen Mitgliedern teilen.',
            welcomeNote: 'Bitte nutze Expensify, um deine Belege zur Erstattung einzureichen, danke!',
            subscription: 'Abonnement',
            markAsEntered: 'Als manuell eingegeben markieren',
            markAsExported: 'Als exportiert markieren',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exportieren nach ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
            lineItemLevel: 'Auf Positionsebene',
            reportLevel: 'Berichtsebene',
            topLevel: 'Top-Ebene',
            appliedOnExport: 'Nicht in Expensify importiert, beim Export angewendet',
            shareNote: {
                header: 'Geben Sie Ihren Arbeitsbereich für andere Mitglieder frei',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Teile diesen QR-Code oder kopiere den Link unten, um es Mitgliedern zu erleichtern, den Zugriff auf deinen Workspace anzufordern. Alle Anfragen zum Beitritt zum Workspace werden zur Überprüfung im Raum <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> angezeigt.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} verbinden`,
            createNewConnection: 'Neue Verbindung erstellen',
            reuseExistingConnection: 'Vorhandene Verbindung wiederverwenden',
            existingConnections: 'Vorhandene Verbindungen',
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
            defaultCategory: 'Standardkategorie',
            viewTransactions: 'Transaktionen anzeigen',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Spesen von ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card-Transaktionen werden automatisch in ein „Expensify Card Liability Account“ exportiert, das mit <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">unserer Integration</a> erstellt wurde.</muted-text-label>`,
            youCantDowngradeInvoicing:
                'Sie können Ihren Tarif bei einem per Rechnung abgerechneten Abonnement nicht herabstufen. Um Ihr Abonnement zu besprechen oder Änderungen daran vorzunehmen, wenden Sie sich an Ihren Account Manager oder Concierge, um Hilfe zu erhalten.',
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Verbunden mit ${organizationName}` : 'Automatisieren Sie Reise- und Essenslieferungskosten in Ihrer gesamten Organisation.',
                sendInvites: 'Einladungen senden',
                sendInvitesDescription:
                    'Diese Workspace-Mitglieder haben noch kein Uber for Business-Konto. Entfernen Sie die Auswahl bei allen Mitgliedern, die Sie derzeit nicht einladen möchten.',
                confirmInvite: 'Einladung bestätigen',
                manageInvites: 'Einladungen verwalten',
                confirm: 'Bestätigen',
                allSet: 'Alles erledigt',
                readyToRoll: 'Alles ist startklar',
                takeBusinessRideMessage: 'Machen Sie eine Geschäftsreise und Ihre Uber-Belege werden in Expensify importiert. Ab die Post!',
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
                centralBillingDescription: 'Wählen Sie aus, wohin alle Uber-Belege importiert werden sollen.',
                invitationFailure: 'Einladen des Mitglieds zu Uber for Business fehlgeschlagen',
                autoInvite: 'Neue Workspace-Mitglieder zu Uber for Business einladen',
                autoRemove: 'Entfernte Arbeitsbereichsmitglieder in Uber for Business deaktivieren',
                emptyContent: {
                    title: 'Keine ausstehenden Einladungen',
                    subtitle: 'Hurra! Wir haben überall nachgesehen und keine offenen Einladungen gefunden.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Legen Sie Pauschalspesensätze fest, um die täglichen Ausgaben der Mitarbeitenden zu steuern. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Mehr erfahren</a>.</muted-text>`,
            amount: 'Betrag',
            deleteRates: () => ({
                one: 'Rate löschen',
                other: 'Sätze löschen',
            }),
            deletePerDiemRate: 'Tagespauschale löschen',
            findPerDiemRate: 'Tagespauschale finden',
            areYouSureDelete: () => ({
                one: 'Möchten Sie diesen Satz wirklich löschen?',
                other: 'Sind Sie sicher, dass Sie diese Sätze löschen möchten?',
            }),
            emptyList: {
                title: 'Tagegeld',
                subtitle: 'Setzen Sie Pauschalbeträge, um die täglichen Ausgaben Ihrer Mitarbeitenden zu steuern. Importieren Sie die Sätze aus einer Tabellenkalkulation, um loszulegen.',
            },
            importPerDiemRates: 'Tagespauschalen importieren',
            editPerDiemRate: 'Tagessatz bearbeiten',
            editPerDiemRates: 'Tagessätze bearbeiten',
            editDestinationSubtitle: (destination: string) => `Wenn dieses Ziel aktualisiert wird, ändert es sich für alle ${destination}-Tagessatz-Untersätze.`,
            editCurrencySubtitle: (destination: string) => `Wenn Sie diese Währung aktualisieren, wird sie für alle ${destination} Tagegeld-Teilbeträge geändert.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie Auslagen in QuickBooks Desktop exportiert werden.',
            exportOutOfPocketExpensesCheckToggle: 'Markierungen als „später drucken“ markieren',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach QuickBooks Desktop exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Card-Transaktionen exportieren als',
            account: 'Konto',
            accountDescription: 'Wählen Sie aus, wo Journalbuchungen gebucht werden sollen.',
            accountsPayable: 'Kreditorenbuchhaltung',
            accountsPayableDescription: 'Wählen Sie aus, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wähle, von wo Schecks gesendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwende dieses Datum beim Exportieren von Berichten nach QuickBooks Desktop.',
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
                        label: 'Eingereicht am Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            exportCheckDescription: 'Wir erstellen einen aufgeschlüsselten Scheck für jeden Expensify-Bericht und senden ihn von dem untenstehenden Bankkonto.',
            exportJournalEntryDescription: 'Wir erstellen für jeden Expensify-Bericht einen aufgeschlüsselten Buchungssatz und buchen ihn auf das unten stehende Konto.',
            exportVendorBillDescription:
                'Wir erstellen eine Einzelposten-Lieferantenrechnung für jeden Expensify-Bericht und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir auf den ersten Tag des nächsten offenen Zeitraums.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop unterstützt keine Steuern beim Export von Journalbuchungen. Da in Ihrem Workspace Steuern aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Buchungssatz',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Scheck',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Wir erstellen einen aufgeschlüsselten Scheck für jeden Expensify-Bericht und senden ihn von dem untenstehenden Bankkonto.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Kreditkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Falls keine Lieferanten vorhanden sind, erstellen wir einen „Credit Card Misc.“-Lieferanten zur Verknüpfung.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung mit dem Datum der letzten Ausgabe und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir auf den 1. des nächsten offenen Zeitraums.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]:
                    'Wählen Sie aus, wohin Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Wählen Sie einen Lieferanten aus, der auf alle Kreditkartentransaktionen angewendet werden soll.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Wähle, von wo Schecks gesendet werden sollen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Fügen Sie das Konto in QuickBooks Desktop hinzu und synchronisieren Sie die Verbindung erneut',
            qbdSetup: 'QuickBooks Desktop-Einrichtung',
            requiredSetupDevice: {
                title: 'Von diesem Gerät aus keine Verbindung möglich',
                body1: 'Sie müssen diese Verbindung von dem Computer aus einrichten, auf dem Ihre QuickBooks Desktop-Firmendatei gespeichert ist.',
                body2: 'Sobald Sie verbunden sind, können Sie von überall aus synchronisieren und exportieren.',
            },
            setupPage: {
                title: 'Öffne diesen Link, um eine Verbindung herzustellen',
                body: 'Um die Einrichtung abzuschließen, öffne den folgenden Link auf dem Computer, auf dem QuickBooks Desktop ausgeführt wird.',
                setupErrorTitle: 'Etwas ist schiefgelaufen',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>Die Verbindung zu QuickBooks Desktop funktioniert im Moment nicht. Bitte versuche es später noch einmal oder <a href="${conciergeLink}">wende dich an Concierge</a>, wenn das Problem weiterhin besteht.</centered-text></muted-text>`,
            },
            importDescription: 'Wähle aus, welche Codierungskonfigurationen aus QuickBooks Desktop in Expensify importiert werden sollen.',
            classes: 'Klassen',
            items: 'Artikel',
            customers: 'Kunden/Projekte',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Einkäufe mit Firmenkarten nach QuickBooks Desktop exportiert werden.',
            defaultVendorDescription: 'Legen Sie einen Standardlieferanten fest, der beim Export auf alle Kreditkartentransaktionen angewendet wird.',
            accountsDescription: 'Ihr QuickBooks Desktop-Kontenplan wird als Kategorien in Expensify importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            classesDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Klassen in Expensify gehandhabt werden sollen.',
            tagsDisplayedAsDescription: 'Positionsebene',
            reportFieldsDisplayedAsDescription: 'Berichtsebene',
            customersDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Kunden/Projekte in Expensify gehandhabt werden sollen.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit QuickBooks Desktop synchronisiert.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription: 'Expensify erstellt automatisch Lieferanten in QuickBooks Desktop, wenn sie noch nicht vorhanden sind.',
            },
            itemsDescription: 'Wähle aus, wie QuickBooks Desktop-Positionen in Expensify behandelt werden sollen.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagenausgaben werden nach der endgültigen Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden beim Bezahlen exportiert',
                },
            },
        },
        qbo: {
            connectedTo: 'Verbunden mit',
            importDescription: 'Wähle aus, welche Kontierungskonfigurationen aus QuickBooks Online in Expensify importiert werden sollen.',
            classes: 'Klassen',
            locations: 'Standorte',
            customers: 'Kunden/Projekte',
            accountsDescription: 'Ihr Kontenplan aus QuickBooks Online wird als Kategorien in Expensify importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            classesDescription: 'Wählen Sie aus, wie QuickBooks Online-Klassen in Expensify behandelt werden sollen.',
            customersDescription: 'Wählen Sie aus, wie Kunden/Projekte aus QuickBooks Online in Expensify behandelt werden sollen.',
            locationsDescription: 'Wählen Sie aus, wie QuickBooks Online-Standorte in Expensify behandelt werden sollen.',
            taxesDescription: 'Wählen Sie aus, wie QuickBooks Online-Steuern in Expensify behandelt werden sollen.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online unterstützt keine Standorte auf Positionsebene für Schecks oder Lieferantenrechnungen. Wenn du Standorte auf Positionsebene verwenden möchtest, stelle sicher, dass du Journalbuchungen und Kredit-/Debitkartenausgaben verwendest.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online unterstützt keine Steuern bei Journalbuchungen. Bitte ändere deine Exportoption auf Lieferantenrechnung oder Scheck.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach QuickBooks Online exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Card-Transaktionen exportieren als',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten zu QuickBooks Online.',
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
                        label: 'Eingereicht am Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            receivable: 'Debitorenbuchhaltung', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archiv der Debitorenbuchhaltung', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Verwende dieses Konto beim Exportieren von Rechnungen nach QuickBooks Online.',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Firmenkarteneinkäufe nach QuickBooks Online exportiert werden.',
            vendor: 'Lieferant',
            defaultVendorDescription: 'Legen Sie einen Standardlieferanten fest, der beim Export auf alle Kreditkartentransaktionen angewendet wird.',
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie Auslagen zu QuickBooks Online exportiert werden.',
            exportCheckDescription: 'Wir erstellen einen aufgeschlüsselten Scheck für jeden Expensify-Bericht und senden ihn von dem untenstehenden Bankkonto.',
            exportJournalEntryDescription: 'Wir erstellen für jeden Expensify-Bericht einen aufgeschlüsselten Buchungssatz und buchen ihn auf das unten stehende Konto.',
            exportVendorBillDescription:
                'Wir erstellen eine Einzelposten-Lieferantenrechnung für jeden Expensify-Bericht und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir auf den ersten Tag des nächsten offenen Zeitraums.',
            account: 'Konto',
            accountDescription: 'Wählen Sie aus, wo Journalbuchungen gebucht werden sollen.',
            accountsPayable: 'Kreditorenbuchhaltung',
            accountsPayableDescription: 'Wählen Sie aus, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wähle, von wo Schecks gesendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online unterstützt keine Standorte beim Export von Lieferantenrechnungen. Da in Ihrem Workspace Standorte aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online unterstützt keine Steuern beim Export von Journalbuchungen. Da in Ihrem Arbeitsbereich Steuern aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird sich jeden Tag automatisch mit QuickBooks Online synchronisieren.',
                inviteEmployees: 'Mitarbeitende einladen',
                inviteEmployeesDescription: 'QuickBooks Online-Mitarbeiterdatensätze importieren und Mitarbeiter in diesen Workspace einladen.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription:
                    'Expensify erstellt automatisch Lieferanten in QuickBooks Online, wenn sie noch nicht vorhanden sind, und erstellt beim Exportieren von Rechnungen automatisch Kunden.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht mit Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden QuickBooks Online-Konto erstellt.',
                qboBillPaymentAccount: 'QuickBooks-Rechnungskonto',
                qboInvoiceCollectionAccount: 'Inkassokonto für QuickBooks-Rechnungen',
                accountSelectDescription: 'Wählen Sie aus, von wo Sie Rechnungen bezahlen möchten, und wir erstellen die Zahlung in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wähle aus, wo du Rechnungszahlungen erhalten möchtest, und wir erstellen die Zahlung in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Debitkarte',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Buchungssatz',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Scheck',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Debitkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Falls keine Lieferanten vorhanden sind, erstellen wir einen „Debit Card Misc.“-Lieferanten zur Zuordnung.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Kreditkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Falls keine Lieferanten vorhanden sind, erstellen wir einen „Credit Card Misc.“-Lieferanten zur Verknüpfung.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung mit dem Datum der letzten Ausgabe und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir auf den 1. des nächsten offenen Zeitraums.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Wähle aus, wohin Debitkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wählen Sie aus, wohin Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Wählen Sie einen Lieferanten aus, der auf alle Kreditkartentransaktionen angewendet werden soll.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Wähle ein gültiges Konto für den Export der Kreditorenrechnung',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wähle ein gültiges Konto für den Export des Buchungssatzes',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Wähle ein gültiges Konto für den Scheckexport',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Um den Export von Kreditorenrechnungen zu verwenden, richten Sie in QuickBooks Online ein Kreditorenkonto ein',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Um den Export von Journalbuchungen zu verwenden, richte ein Journal-Konto in QuickBooks Online ein',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Um den Scheckexport zu verwenden, richten Sie ein Bankkonto in QuickBooks Online ein',
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
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagenausgaben werden nach der endgültigen Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden beim Bezahlen exportiert',
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
            importDescription: 'Wählen Sie aus, welche Kodierungskonfigurationen aus Xero in Expensify importiert werden sollen.',
            accountsDescription: 'Ihr Xero-Kontenplan wird als Kategorien in Expensify importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            trackingCategories: 'Tracking-Kategorien',
            trackingCategoriesDescription: 'Wählen Sie aus, wie Xero-Trackingkategorien in Expensify behandelt werden sollen.',
            mapTrackingCategoryTo: (categoryName: string) => `Xero-Konto ${categoryName} zuordnen zu`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Wählen Sie, wohin ${categoryName} beim Export nach Xero zugeordnet werden soll.`,
            customers: 'Kunden erneut in Rechnung stellen',
            customersDescription:
                'Wählen Sie, ob Kunden in Expensify erneut abgerechnet werden sollen. Ihre Xero-Kundenkontakte können Ausgaben zugeordnet werden und werden als Verkaufsrechnung nach Xero exportiert.',
            taxesDescription: 'Wählen Sie aus, wie Xero-Steuern in Expensify gehandhabt werden sollen.',
            notImported: 'Nicht importiert',
            notConfigured: 'Nicht konfiguriert',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Standard-Xero-Kontakt',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Stichwörter',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Berichtsfelder',
            },
            exportDescription: 'Konfiguriere, wie Expensify-Daten nach Xero exportiert werden.',
            purchaseBill: 'Einkaufsrechnung',
            exportDeepDiveCompanyCard:
                'Exportierte Ausgaben werden als Banktransaktionen auf das untenstehende Xero-Bankkonto gebucht, und die Transaktionsdaten entsprechen den Daten auf Ihrem Kontoauszug.',
            bankTransactions: 'Banktransaktionen',
            xeroBankAccount: 'Xero-Bankkonto',
            xeroBankAccountDescription: 'Wählen Sie aus, wo Ausgaben als Banktransaktionen verbucht werden.',
            exportExpensesDescription: 'Berichte werden als Einkaufsrechnung mit dem unten ausgewählten Datum und Status exportiert.',
            purchaseBillDate: 'Einkaufsrechnungsdatum',
            exportInvoices: 'Rechnungen exportieren als',
            salesInvoice: 'Verkaufsrechnung',
            exportInvoicesDescription: 'Verkaufsrechnungen zeigen immer das Datum an, an dem die Rechnung versendet wurde.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird automatisch jeden Tag mit Xero synchronisiert.',
                purchaseBillStatusTitle: 'Status der Rechnungskäufe',
                reimbursedReportsDescription: 'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden Xero-Konto erstellt.',
                xeroBillPaymentAccount: 'Xero-Rechnungsauszahlungskonto',
                xeroInvoiceCollectionAccount: 'Xero-Forderungskonto für Rechnungen',
                xeroBillPaymentAccountDescription: 'Wählen Sie, von wo aus Sie Rechnungen bezahlen möchten, und wir erstellen die Zahlung in Xero.',
                invoiceAccountSelectorDescription: 'Wählen Sie aus, wohin Rechnungzahlungen empfangen werden sollen, und wir erstellen die Zahlung in Xero.',
            },
            exportDate: {
                label: 'Einkaufsrechnungsdatum',
                description: 'Verwende dieses Datum beim Exportieren von Berichten nach Xero.',
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
                        label: 'Eingereicht am Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status der Rechnungskäufe',
                description: 'Verwenden Sie diesen Status beim Exportieren von Einkaufsrechnungen nach Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Entwurf',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Genehmigung ausstehend',
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
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagenausgaben werden nach der endgültigen Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden beim Bezahlen exportiert',
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
                        label: 'Eingereicht am Datum',
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
                description: 'Legen Sie fest, wie Firmenkartenkäufe nach Sage Intacct exportiert werden.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Kreditkarten',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Lieferantenrechnungen',
                },
            },
            creditCardAccount: 'Kreditkartenkonto',
            defaultVendor: 'Standardlieferant',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Legen Sie einen Standard-Lieferanten fest, der auf ${isReimbursable ? '' : 'nicht-'}erstattungsfähige Ausgaben angewendet wird, für die in Sage Intacct kein übereinstimmender Lieferant vorhanden ist.`,
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach Sage Intacct exportiert werden.',
            exportPreferredExporterNote:
                'Der bevorzugte Exporteur kann jeder Workspace-Admin sein, muss jedoch auch ein Domain-Admin sein, wenn du in den Domaineinstellungen unterschiedliche Exportkonten für einzelne Firmenkarten festlegst.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur in seinem Konto Berichte zum Export.',
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: `Bitte fügen Sie das Konto in Sage Intacct hinzu und synchronisieren Sie die Verbindung erneut`,
            autoSync: 'Automatische Synchronisierung',
            autoSyncDescription: 'Expensify wird automatisch jeden Tag mit Sage Intacct synchronisiert.',
            inviteEmployees: 'Mitarbeitende einladen',
            inviteEmployeesDescription:
                'Sage Intacct-Mitarbeiterdatensätze importieren und Mitarbeiter zu diesem Workspace einladen. Ihr Genehmigungsworkflow wird standardmäßig auf Managergenehmigung festgelegt und kann auf der Seite „Mitglieder“ weiter konfiguriert werden.',
            syncReimbursedReports: 'Erstattete Berichte synchronisieren',
            syncReimbursedReportsDescription:
                'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden Sage Intacct-Konto erstellt.',
            paymentAccount: 'Sage Intacct-Zahlungskonto',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Bargeld',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagenausgaben werden nach der endgültigen Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden beim Bezahlen exportiert',
                },
            },
        },
        netsuite: {
            subsidiary: 'Tochtergesellschaft',
            subsidiarySelectDescription: 'Wählen Sie die Tochtergesellschaft in NetSuite aus, aus der Sie Daten importieren möchten.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach NetSuite exportiert werden.',
            exportInvoices: 'Rechnungen exportieren nach',
            journalEntriesTaxPostingAccount: 'Steuerbuchungskonto für Journalbuchungen',
            journalEntriesProvTaxPostingAccount: 'Konto für die Verbuchung der Provinzsteuer in Journalbuchungen',
            foreignCurrencyAmount: 'Betrag in Fremdwährung exportieren',
            exportToNextOpenPeriod: 'In das nächste offene Periode exportieren',
            nonReimbursableJournalPostingAccount: 'Konto für nicht erstattungsfähige Journalbuchungen',
            reimbursableJournalPostingAccount: 'Erstattungsfähiges Journalbuchungskonto',
            journalPostingPreference: {
                label: 'Buchungspräferenz für Journalbuchungen',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Einzelner, aufgegliederter Eintrag für jeden Bericht',
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
                        label: 'Vorhandene auswählen',
                        description: 'Wir verknüpfen Rechnungen aus Expensify mit dem unten ausgewählten Eintrag.',
                    },
                },
            },
            exportDate: {
                label: 'Exportdatum',
                description: 'Dieses Datum beim Exportieren von Berichten nach NetSuite verwenden.',
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
                        label: 'Eingereicht am Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Spesenabrechnungen',
                        reimbursableDescription: 'Auslagen werden als Spesenabrechnungen nach NetSuite exportiert.',
                        nonReimbursableDescription: 'Firmenkartenausgaben werden als Spesenberichte nach NetSuite exportiert.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Lieferantenrechnungen',
                        reimbursableDescription: dedent(`
                            Auslagen werden als Rechnungen exportiert, die an den unten angegebenen NetSuite-Lieferanten zahlbar sind.

                            Wenn du für jede Karte einen bestimmten Lieferanten festlegen möchtest, gehe zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Firmenkartenausgaben werden als Rechnungen exportiert, die an den unten angegebenen NetSuite-Lieferanten zahlbar sind.

                            Wenn Sie für jede Karte einen bestimmten Lieferanten festlegen möchten, gehen Sie zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Journalbuchungen',
                        reimbursableDescription: dedent(`
                            Auslagen aus eigener Tasche werden als Journalbuchungen in das unten angegebene NetSuite-Konto exportiert.

                            Wenn Sie für jede Karte einen bestimmten Lieferanten festlegen möchten, gehen Sie zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Firmenkartenabrechnungen werden als Journalbuchungen in das unten angegebene NetSuite-Konto exportiert.

                            Wenn Sie für jede Karte einen bestimmten Lieferanten festlegen möchten, gehen Sie zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Wenn Sie die Export-Einstellung für Firmenkarten auf Spesenberichte umstellen, werden NetSuite-Lieferanten und Buchungskonten für einzelne Karten deaktiviert.\n\nKeine Sorge, wir speichern Ihre bisherigen Auswahlen für den Fall, dass Sie später wieder zurückwechseln möchten.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify wird sich jeden Tag automatisch mit NetSuite synchronisieren.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden NetSuite-Konto erstellt.',
                reimbursementsAccount: 'Rückerstattungskonto',
                reimbursementsAccountDescription: 'Wähle das Bankkonto, das du für Rückerstattungen verwenden möchtest, und wir erstellen die zugehörige Zahlung in NetSuite.',
                collectionsAccount: 'Inkasso-Konto',
                collectionsAccountDescription: 'Sobald eine Rechnung in Expensify als bezahlt markiert und nach NetSuite exportiert wurde, erscheint sie im folgenden Konto.',
                approvalAccount: 'Konto für Kreditorenfreigabe',
                approvalAccountDescription:
                    'Wählen Sie das Konto, gegen das Transaktionen in NetSuite genehmigt werden. Wenn Sie erstattete Berichte synchronisieren, ist dies außerdem das Konto, gegen das Rechnungszahlungen erstellt werden.',
                defaultApprovalAccount: 'NetSuite-Standard',
                inviteEmployees: 'Mitarbeiter einladen und Genehmigungen festlegen',
                inviteEmployeesDescription:
                    'Importieren Sie NetSuite-Mitarbeiterdatensätze und laden Sie Mitarbeiter in diesen Workspace ein. Ihr Genehmigungsworkflow wird standardmäßig auf Managergenehmigung gesetzt und kann auf der Seite *Mitglieder* weiter konfiguriert werden.',
                autoCreateEntities: 'Mitarbeiter/Anbieter automatisch erstellen',
                enableCategories: 'Neu importierte Kategorien aktivieren',
                customFormID: 'Benutzerdefinierte Formular-ID',
                customFormIDDescription:
                    'Standardmäßig erstellt Expensify Buchungen mithilfe des in NetSuite festgelegten bevorzugten Transaktionsformulars. Alternativ können Sie ein bestimmtes Transaktionsformular festlegen, das verwendet werden soll.',
                customFormIDReimbursable: 'Auslage',
                customFormIDNonReimbursable: 'Firmenkartenausgabe',
                exportReportsTo: {
                    label: 'Genehmigungsstufe für Spesenberichte',
                    description:
                        'Sobald ein Spesenbericht in Expensify genehmigt und zu NetSuite exportiert wurde, können Sie in NetSuite vor der Verbuchung eine zusätzliche Genehmigungsstufe festlegen.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Standardpräferenz für NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Nur vom Vorgesetzten genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Nur von der Buchhaltung genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Vorgesetzter und Buchhaltung genehmigt',
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
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagenausgaben werden nach der endgültigen Genehmigung exportiert',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden beim Bezahlen exportiert',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Genehmigungsebene für Lieferantenrechnungen',
                    description:
                        'Sobald eine Lieferantenrechnung in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Verbuchung eine zusätzliche Genehmigungsstufe festlegen.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Standardpräferenz für NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zur Verbuchung freigegeben',
                    },
                },
                exportJournalsTo: {
                    label: 'Genehmigungsstufe für Buchungssatz',
                    description:
                        'Sobald ein Journalbuchungssatz in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Verbuchung eine zusätzliche Genehmigungsstufe festlegen.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Standardpräferenz für NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Zur Verbuchung freigegeben',
                    },
                },
                error: {
                    customFormID: 'Bitte geben Sie eine gültige numerische benutzerdefinierte Formular-ID ein',
                },
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Bitte fügen Sie das Konto in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noVendorsFound: 'Keine Lieferanten gefunden',
            noVendorsFoundDescription: 'Bitte fügen Sie Lieferanten in NetSuite hinzu und synchronisieren Sie die Verbindung erneut',
            noItemsFound: 'Keine Rechnungspositionen gefunden',
            noItemsFoundDescription: 'Bitte fügen Sie Rechnungsposten in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noSubsidiariesFound: 'Keine Tochtergesellschaften gefunden',
            noSubsidiariesFoundDescription: 'Bitte füge eine Tochtergesellschaft in NetSuite hinzu und synchronisiere die Verbindung dann erneut',
            tokenInput: {
                title: 'NetSuite-Einrichtung',
                formSteps: {
                    installBundle: {
                        title: 'Expensify-Bundle installieren',
                        description: 'In NetSuite gehe zu *Customization > SuiteBundler > Search & Install Bundles* > suche nach „Expensify“ > installiere das Bundle.',
                    },
                    enableTokenAuthentication: {
                        title: 'Tokenbasierte Authentifizierung aktivieren',
                        description: 'In NetSuite gehe zu *Setup > Company > Enable Features > SuiteCloud* und aktiviere *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'SOAP-Webdienste aktivieren',
                        description: 'In NetSuite unter *Setup > Company > Enable Features > SuiteCloud* gehen und *SOAP Web Services* aktivieren.',
                    },
                    createAccessToken: {
                        title: 'Zugriffstoken erstellen',
                        description:
                            'Gehen Sie in NetSuite zu *Setup > Users/Roles > Access Tokens* und erstellen Sie ein Zugriffstoken für die App „Expensify“ und entweder die Rolle „Expensify Integration“ oder „Administrator“.\n\n*Wichtig:* Speichern Sie unbedingt die *Token ID* und das *Token Secret* aus diesem Schritt. Sie benötigen sie für den nächsten Schritt.',
                    },
                    enterCredentials: {
                        title: 'Gib deine NetSuite-Anmeldedaten ein',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite-Konto-ID',
                            netSuiteTokenID: 'Token-ID',
                            netSuiteTokenSecret: 'Token Secret',
                        },
                        netSuiteAccountIDDescription: 'Gehen Sie in NetSuite zu *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Ausgabenkategorien',
                expenseCategoriesDescription: 'Ihre NetSuite-Spesenkategorien werden als Kategorien in Expensify importiert.',
                crossSubsidiaryCustomers: 'Tochtergesellschaftsübergreifende Kunden/Projekte',
                importFields: {
                    departments: {
                        title: 'Abteilungen',
                        subtitle: 'Wählen Sie aus, wie mit den NetSuite-*Abteilungen* in Expensify verfahren werden soll.',
                    },
                    classes: {
                        title: 'Klassen',
                        subtitle: 'Wählen Sie aus, wie *Klassen* in Expensify behandelt werden sollen.',
                    },
                    locations: {
                        title: 'Standorte',
                        subtitle: 'Wähle aus, wie mit *Standorten* in Expensify umgegangen werden soll.',
                    },
                },
                customersOrJobs: {
                    title: 'Kunden/Projekte',
                    subtitle: 'Wähle, wie mit NetSuite-*Kunden* und *Projekten* in Expensify umgegangen werden soll.',
                    importCustomers: 'Kunden importieren',
                    importJobs: 'Projekte importieren',
                    customers: 'Kunden',
                    jobs: 'Projekte',
                    label: (importFields: string[], importType: string) => `${importFields.join('und')}, ${importType}`,
                },
                importTaxDescription: 'Steuergruppen aus NetSuite importieren.',
                importCustomFields: {
                    chooseOptionBelow: 'Wähle eine der folgenden Optionen:',
                    label: (importedTypes: string[]) => `Importiert als ${importedTypes.join('und')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Bitte geben Sie das ${fieldName} ein`,
                    customSegments: {
                        title: 'Benutzerdefinierte Segmente/Einträge',
                        addText: 'Benutzerdefinierten Abschnitt/Datensatz hinzufügen',
                        recordTitle: 'Benutzerdefiniertes Segment/benutzerdefinierter Datensatz',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Detaillierte Anweisungen anzeigen',
                        helpText: 'zur Konfiguration benutzerdefinierter Segmente/Datensätze.',
                        emptyTitle: 'Füge ein benutzerdefiniertes Segment oder einen benutzerdefinierten Datensatz hinzu',
                        fields: {
                            segmentName: 'Name',
                            internalID: 'Interne ID',
                            scriptID: 'Skript-ID',
                            customRecordScriptID: 'Transaktionsspalten-ID',
                            mapping: 'Angezeigt als',
                        },
                        removeTitle: 'Benutzerdefinierten Abschnitt/Datensatz entfernen',
                        removePrompt: 'Sind Sie sicher, dass Sie dieses benutzerdefinierte Segment/den benutzerdefinierten Datensatz entfernen möchten?',
                        addForm: {
                            customSegmentName: 'benutzerdefinierter Segmentname',
                            customRecordName: 'benutzerdefinierter Datensatzname',
                            segmentTitle: 'Benutzerdefiniertes Segment',
                            customSegmentAddTitle: 'Benutzerdefiniertes Segment hinzufügen',
                            customRecordAddTitle: 'Benutzerdefinierten Datensatz hinzufügen',
                            recordTitle: 'Benutzerdefinierter Datensatz',
                            segmentRecordType: 'Möchten Sie ein benutzerdefiniertes Segment oder einen benutzerdefinierten Datensatz hinzufügen?',
                            customSegmentNameTitle: 'Wie lautet der Name des benutzerdefinierten Segments?',
                            customRecordNameTitle: 'Wie lautet der Name des benutzerdefinierten Datensatzes?',
                            customSegmentNameFooter: `Sie finden benutzerdefinierte Segmentnamen in NetSuite auf der Seite *Customizations > Links, Records & Fields > Custom Segments*.

_Für eine ausführlichere Anleitung [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Sie finden benutzerdefinierte Datensatznamen in NetSuite, indem Sie im globalen Suchfeld „Transaction Column Field“ eingeben.

_Für ausführlichere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Wie lautet die interne ID?',
                            customSegmentInternalIDFooter: `Stelle zunächst sicher, dass du interne IDs in NetSuite aktiviert hast unter *Home > Set Preferences > Show Internal ID.*

Du findest die internen IDs benutzerdefinierter Segmente in NetSuite unter:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klicke auf ein benutzerdefiniertes Segment.
3. Klicke auf den Hyperlink neben *Custom Record Type*.
4. Suche die interne ID in der Tabelle unten.

_Für detailliertere Anweisungen [besuche unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Sie können interne IDs benutzerdefinierter Datensätze in NetSuite wie folgt finden:

1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.
2. Klicken Sie auf einen benutzerdefinierten Datensatz.
3. Suchen Sie die interne ID auf der linken Seite.

_Für ausführlichere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Wie lautet die Skript-ID?',
                            customSegmentScriptIDFooter: `Sie finden die Skript-IDs für benutzerdefinierte Segmente in NetSuite unter:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klicken Sie auf ein benutzerdefiniertes Segment.
3. Klicken Sie unten auf die Registerkarte *Application and Sourcing* und dann:
    a. Wenn Sie das benutzerdefinierte Segment als *Tag* (auf Positionsebene) in Expensify anzeigen möchten, klicken Sie auf die Unterregisterkarte *Transaction Columns* und verwenden Sie die *Field ID*.
    b. Wenn Sie das benutzerdefinierte Segment als *Berichts-Feld* (auf Berichtsebene) in Expensify anzeigen möchten, klicken Sie auf die Unterregisterkarte *Transactions* und verwenden Sie die *Field ID*.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Wie lautet die Transaktionsspalten-ID?',
                            customRecordScriptIDFooter: `Sie finden die Skript-IDs benutzerdefinierter Datensätze in NetSuite unter:

1. Geben Sie „Transaction Line Fields“ in der globalen Suche ein.
2. Klicken Sie auf einen benutzerdefinierten Datensatz.
3. Suchen Sie die Skript-ID auf der linken Seite.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Wie soll dieses benutzerdefinierte Segment in Expensify angezeigt werden?',
                            customRecordMappingTitle: 'Wie soll dieser benutzerdefinierte Datensatz in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Ein benutzerdefiniertes Segment/Datensatz mit diesem ${fieldName?.toLowerCase()} ist bereits vorhanden`,
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
                        removePrompt: 'Möchten Sie diese benutzerdefinierte Liste wirklich entfernen?',
                        addForm: {
                            listNameTitle: 'Benutzerdefinierte Liste auswählen',
                            transactionFieldIDTitle: 'Wie lautet die Transaktionsfeld-ID?',
                            transactionFieldIDFooter: `Sie können Transaktionsfeld-IDs in NetSuite finden, indem Sie die folgenden Schritte ausführen:

1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.
2. Klicken Sie auf eine benutzerdefinierte Liste.
3. Suchen Sie die Transaktionsfeld-ID auf der linken Seite.

_Für ausführlichere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
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
                            `Wenn du ${importField} in NetSuite verwendest, wenden wir den Standardwert an, der im Mitarbeitendendatensatz festgelegt ist, sobald nach „Expense Report“ oder „Journal Entry“ exportiert wird.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Stichwörter',
                        description: 'Auf Positionsebene',
                        footerContent: (importField: string) => `${startCase(importField)} wird für jede einzelne Ausgabe im Bericht eines Mitarbeiters auswählbar sein.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Berichtsfelder',
                        description: 'Berichtsebene',
                        footerContent: (importField: string) => `${startCase(importField)}-Auswahl gilt für alle Ausgaben auf dem Bericht eines Mitarbeiters.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct-Einrichtung',
            prerequisitesTitle: 'Bevor Sie eine Verbindung herstellen ...',
            downloadExpensifyPackage: 'Lade das Expensify-Paket für Sage Intacct herunter',
            followSteps: 'Folgen Sie den Schritten in unserer Anleitung „How-to: Verbindung mit Sage Intacct herstellen“',
            enterCredentials: 'Geben Sie Ihre Sage Intacct-Anmeldedaten ein',
            entity: 'Entität',
            employeeDefault: 'Standardwerte für Sage Intacct-Mitarbeiter',
            employeeDefaultDescription: 'Die Standardabteilung des Mitarbeiters wird, sofern vorhanden, in Sage Intacct auf seine Ausgaben angewendet.',
            displayedAsTagDescription: 'Die Abteilung kann für jede einzelne Ausgabe im Bericht eines Mitarbeiters ausgewählt werden.',
            displayedAsReportFieldDescription: 'Die Abteilungsauswahl wird auf alle Ausgaben im Bericht eines Mitarbeiters angewendet.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Wählen Sie aus, wie Sage Intacct-<strong>${mappingTitle}</strong> in Expensify verarbeitet werden soll.`,
            expenseTypes: 'Ausgabenarten',
            expenseTypesDescription: 'Ihre Sage Intacct-Spesentypen werden in Expensify als Kategorien importiert.',
            accountTypesDescription: 'Ihr Sage Intacct-Kontenplan wird als Kategorien in Expensify importiert.',
            importTaxDescription: 'Steuersatz für Einkäufe aus Sage Intacct importieren.',
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
                        return 'Zuordnungen';
                }
            },
        },
        type: {
            free: 'Kostenlos',
            control: 'Kontrolle',
            collect: 'Einziehen',
        },
        companyCards: {
            addCards: 'Karten hinzufügen',
            selectCards: 'Karten auswählen',
            addNewCard: {
                other: 'Sonstiges',
                cardProviders: {
                    gl1025: 'American Express Firmenkarten',
                    cdf: 'Mastercard Firmenkarten',
                    vcf: 'Visa Firmenkarten',
                    stripe: 'Stripe-Karten',
                },
                yourCardProvider: `Wer ist Ihr Kartenanbieter?`,
                whoIsYourBankAccount: 'Wie heißt deine Bank?',
                whereIsYourBankLocated: 'Wo befindet sich Ihre Bank?',
                howDoYouWantToConnect: 'Wie möchten Sie Ihre Bank verbinden?',
                learnMoreAboutOptions: `<muted-text>Erfahre mehr über diese <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">Optionen</a>.</muted-text>`,
                commercialFeedDetails:
                    'Erfordert die Einrichtung mit Ihrer Bank. Dies wird in der Regel von größeren Unternehmen verwendet und ist oft die beste Option, wenn Sie die Voraussetzungen erfüllen.',
                commercialFeedPlaidDetails: `Erfordert die Einrichtung mit Ihrer Bank, aber wir führen Sie durch den Prozess. Dies ist in der Regel auf größere Unternehmen beschränkt.`,
                directFeedDetails: 'Der einfachste Ansatz. Verbinde dich direkt mit deinen Master-Zugangsdaten. Diese Methode ist am gebräuchlichsten.',
                enableFeed: {
                    title: (provider: string) => `Aktiviere deinen ${provider}-Feed`,
                    heading:
                        'Wir verfügen über eine direkte Integration mit Ihrem Kartenaussteller und können Ihre Transaktionsdaten schnell und genau in Expensify importieren.\n\nUm zu beginnen, gehen Sie einfach wie folgt vor:',
                    visa: 'Wir verfügen über globale Integrationen mit Visa, wobei die Berechtigung je nach Bank und Kartenprogramm variiert.\n\nUm loszulegen, gehen Sie einfach wie folgt vor:',
                    mastercard:
                        'Wir haben globale Integrationen mit Mastercard, allerdings variiert die Berechtigung je nach Bank und Kartenprogramm.\n\nUm loszulegen, gehen Sie einfach wie folgt vor:',
                    vcf: `1. Rufen Sie [diesen Hilfeartikel](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) auf, um detaillierte Anweisungen zum Einrichten Ihrer Visa Commercial Cards zu erhalten.

2. [Kontaktieren Sie Ihre Bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), um zu bestätigen, dass sie einen kommerziellen Feed für Ihr Programm unterstützt, und bitten Sie sie, diesen zu aktivieren.

3. *Sobald der Feed aktiviert ist und Sie die Details haben, fahren Sie mit dem nächsten Bildschirm fort.*`,
                    gl1025: `1. Besuchen Sie [diesen Hilfeartikel](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}), um herauszufinden, ob American Express einen Commercial-Feed für Ihr Programm aktivieren kann.

2. Sobald der Feed aktiviert ist, sendet Amex Ihnen ein Produktionsschreiben.

3. *Sobald Sie die Feed-Informationen haben, fahren Sie mit dem nächsten Bildschirm fort.*`,
                    cdf: `1. Lies dir [diesen Hilfeartikel](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) durch, um detaillierte Anweisungen zum Einrichten deiner Mastercard Commercial Cards zu erhalten.

2. [Kontaktiere deine Bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), um zu bestätigen, dass sie einen kommerziellen Feed für dein Programm unterstützt, und bitte sie, diesen zu aktivieren.

3. *Sobald der Feed aktiviert ist und du seine Details hast, fahre mit dem nächsten Bildschirm fort.*`,
                    stripe: `1. Öffnen Sie das Stripe-Dashboard und gehen Sie zu [Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Klicken Sie unter „Product Integrations“ auf „Enable“ neben Expensify.

3. Sobald der Feed aktiviert ist, klicken Sie unten auf „Submit“ und wir kümmern uns darum, ihn hinzuzufügen.`,
                },
                whatBankIssuesCard: 'Welche Bank gibt diese Karten aus?',
                enterNameOfBank: 'Namen der Bank eingeben',
                feedDetails: {
                    vcf: {
                        title: 'Was sind die Details des Visa-Feeds?',
                        processorLabel: 'Prozessor-ID',
                        bankLabel: 'Kennung des Finanzinstituts (Bank)',
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
                        helpLabel: 'Wo finde ich die Distributions-ID?',
                    },
                },
                amexCorporate: 'Wählen Sie dies aus, wenn auf der Vorderseite Ihrer Karten „Corporate“ steht',
                amexBusiness: 'Wählen Sie dies aus, wenn auf der Vorderseite Ihrer Karten „Business“ steht',
                amexPersonal: 'Wähle dies aus, wenn deine Karten privat sind',
                error: {
                    pleaseSelectProvider: 'Bitte wählen Sie vor dem Fortfahren einen Kartenanbieter aus',
                    pleaseSelectBankAccount: 'Bitte wählen Sie ein Bankkonto aus, bevor Sie fortfahren',
                    pleaseSelectBank: 'Bitte wählen Sie vor dem Fortfahren eine Bank aus',
                    pleaseSelectCountry: 'Bitte wählen Sie ein Land aus, bevor Sie fortfahren',
                    pleaseSelectFeedType: 'Bitte wähle einen Feed-Typ aus, bevor du fortfährst',
                },
                exitModal: {
                    title: 'Funktioniert etwas nicht?',
                    prompt: 'Wir haben bemerkt, dass du das Hinzufügen deiner Karten nicht abgeschlossen hast. Wenn du auf ein Problem gestoßen bist, lass es uns wissen, damit wir dir helfen können, wieder auf Kurs zu kommen.',
                    confirmText: 'Problem melden',
                    cancelText: 'Überspringen',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Letzter Tag des Monats',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Letzter Geschäftstag des Monats',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Benutzerdefinierter Tag des Monats',
            },
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
                `Wähle eine Karte für <strong>${assignee}</strong>. Du findest die Karte, die du suchst, nicht? <concierge-link>Teile es uns mit.</concierge-link>`,
            noActiveCards: 'Keine aktiven Karten in diesem Feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Oder etwas ist möglicherweise defekt. So oder so: Wenn du Fragen hast, kannst du jederzeit <concierge-link>Concierge kontaktieren</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Wähle ein Startdatum für die Transaktion',
            startDateDescription: 'Wir importieren alle Transaktionen ab diesem Datum. Wenn kein Datum angegeben ist, gehen wir so weit zurück, wie es Ihre Bank zulässt.',
            fromTheBeginning: 'Von Anfang an',
            customStartDate: 'Benutzerdefiniertes Startdatum',
            customCloseDate: 'Benutzerdefiniertes Abschlussdatum',
            letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
            confirmationDescription: 'Wir beginnen sofort mit dem Import der Transaktionen.',
            card: 'Karte',
            cardName: 'Kartenname',
            brokenConnectionError:
                '<rbr>Die Karten-Feed-Verbindung ist unterbrochen. Bitte <a href="#">melden Sie sich bei Ihrer Bank an</a>, damit wir die Verbindung erneut herstellen können.</rbr>',
            assignedCard: (assignee: string, link: string) => `${assignee} ein ${link} zugewiesen! Importierte Transaktionen werden in diesem Chat erscheinen.`,
            companyCard: 'Firmenkarte',
            chooseCardFeed: 'Kartenfeed auswählen',
            ukRegulation:
                'Expensify Limited ist als Vertreter von Plaid Financial Ltd. tätig, einem zugelassenen Zahlungsinstitut, das von der Financial Conduct Authority gemäß den Payment Services Regulations 2017 reguliert wird (Firm Reference Number: 804718). Plaid stellt Ihnen über Expensify Limited als dessen Vertreter regulierte Kontoinformationsdienste zur Verfügung.',
            assign: 'Zuweisen',
            assignCardFailedError: 'Kartenzuweisung fehlgeschlagen.',
            cardAlreadyAssignedError: 'This card is already assigned to a user in another workspace.',
            editStartDateDescription:
                'Wählen Sie ein neues Startdatum für Transaktionen. Wir synchronisieren alle Transaktionen ab diesem Datum, ausgenommen diejenigen, die wir bereits importiert haben.',
            unassignCardFailedError: 'Aufhebung der Kartenzuweisung fehlgeschlagen.',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'Kartenfeeds konnten nicht geladen werden',
                workspaceFeedsCouldNotBeLoadedMessage:
                    'Beim Laden der Workspace-Kartenfeeds ist ein Fehler aufgetreten. Bitte versuche es erneut oder wende dich an deine Administratorin bzw. deinen Administrator.',
                feedCouldNotBeLoadedTitle: 'Dieser Feed konnte nicht geladen werden',
                feedCouldNotBeLoadedMessage: 'Beim Laden dieses Feeds ist ein Fehler aufgetreten. Bitte versuche es erneut oder kontaktiere deine Administratorin/deinen Administrator.',
                tryAgain: 'Erneut versuchen',
            },
        },
        expensifyCard: {
            issueAndManageCards: 'Expensify Cards ausstellen und verwalten',
            getStartedIssuing: 'Beginne, indem du deine erste virtuelle oder physische Karte ausstellst.',
            verificationInProgress: 'Verifizierung läuft …',
            verifyingTheDetails: 'Wir überprüfen ein paar Details. Concierge informiert dich, sobald Expensify Cards ausgegeben werden können.',
            disclaimer:
                'Die Expensify Visa® Commercial Card wird von The Bancorp Bank, N.A., Mitglied der FDIC, gemäß einer Lizenz von Visa U.S.A. Inc. herausgegeben und kann nicht bei allen Händlern verwendet werden, die Visa-Karten akzeptieren. Apple® und das Apple Logo® sind Marken von Apple Inc., eingetragen in den USA und anderen Ländern. App Store ist eine Dienstleistungsmarke von Apple Inc. Google Play und das Google Play Logo sind Marken von Google LLC.',
            euUkDisclaimer:
                'Von Transact Payments Malta Limited ausgegebene Karten werden EWR-Ansässigen zur Verfügung gestellt und von Transact Payments Limited ausgegebene Karten werden UK-Ansässigen gemäß einer Lizenz von Visa Europe Limited zur Verfügung gestellt. Transact Payments Malta Limited ist ordnungsgemäß von der Malta Financial Services Authority als Finanzinstitut nach dem Financial Institution Act 1994 zugelassen und reguliert. Registrierungsnummer C 91879. Transact Payments Limited ist von der Gibraltar Financial Service Commission zugelassen und reguliert.',
            issueCard: 'Karte ausstellen',
            findCard: 'Karte finden',
            newCard: 'Neue Karte',
            name: 'Name',
            lastFour: 'Letzte 4 Ziffern',
            limit: 'Limit',
            currentBalance: 'Aktueller Kontostand',
            currentBalanceDescription: 'Der aktuelle Saldo ist die Summe aller verbuchten Expensify-Card-Transaktionen, die seit dem letzten Abrechnungsdatum erfolgt sind.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Der Saldo wird am ${settlementDate} ausgeglichen`,
            settleBalance: 'Saldo ausgleichen',
            cardLimit: 'Kartenlimit',
            remainingLimit: 'Verbleibendes Limit',
            requestLimitIncrease: 'Erhöhung des Anfragekontingents',
            remainingLimitDescription:
                'Bei der Berechnung Ihres verbleibenden Limits berücksichtigen wir mehrere Faktoren: Ihre Dauer als Kunde, die geschäftsbezogenen Informationen, die Sie bei der Registrierung angegeben haben, sowie das verfügbare Guthaben auf Ihrem Geschäftskonto. Ihr verbleibendes Limit kann sich täglich ändern.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Der Cash-Back-Saldo basiert auf den abgerechneten monatlichen Expensify-Card-Ausgaben in Ihrem Workspace.',
            issueNewCard: 'Neue Karte ausstellen',
            finishSetup: 'Einrichtung abschließen',
            chooseBankAccount: 'Bankkonto auswählen',
            chooseExistingBank: 'Wählen Sie ein bestehendes Geschäftskonto aus, um Ihr Expensify Card-Guthaben zu begleichen, oder fügen Sie ein neues Bankkonto hinzu',
            accountEndingIn: 'Konto mit Endziffer',
            addNewBankAccount: 'Neues Bankkonto hinzufügen',
            settlementAccount: 'Verrechnungskonto',
            settlementAccountDescription: 'Wählen Sie ein Konto aus, um Ihren Expensify Card-Saldo zu bezahlen.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Stelle sicher, dass dieses Konto mit deinem <a href="${reconciliationAccountSettingsLink}">Abstimmungskonto</a> (${accountNumber}) übereinstimmt, damit die kontinuierliche Abstimmung ordnungsgemäß funktioniert.`,
            settlementFrequency: 'Abrechnungshäufigkeit',
            settlementFrequencyDescription: 'Wähle aus, wie oft du deinen Expensify Card‑Saldo bezahlen möchtest.',
            settlementFrequencyInfo: 'Wenn du zur monatlichen Abrechnung wechseln möchtest, musst du dein Bankkonto über Plaid verbinden und eine positive 90‑Tage-Saldohistorie vorweisen.',
            frequency: {
                daily: 'Täglich',
                monthly: 'Monatlich',
            },
            cardDetails: 'Kartendetails',
            cardPending: ({name}: {name: string}) => `Karte ist derzeit ausstehend und wird ausgegeben, sobald das Konto von ${name} verifiziert wurde.`,
            virtual: 'Virtuell',
            physical: 'Physisch',
            deactivate: 'Karte deaktivieren',
            changeCardLimit: 'Kartenlimit ändern',
            changeLimit: 'Limit ändern',
            smartLimitWarning: (limit: number | string) =>
                `Wenn du das Limit dieser Karte auf ${limit} änderst, werden neue Transaktionen abgelehnt, bis du weitere Ausgaben auf der Karte genehmigst.`,
            monthlyLimitWarning: (limit: number | string) => `Wenn Sie das Limit dieser Karte auf ${limit} ändern, werden neue Transaktionen bis zum nächsten Monat abgelehnt.`,
            fixedLimitWarning: (limit: number | string) => `Wenn du das Limit dieser Karte auf ${limit} änderst, werden neue Transaktionen abgelehnt.`,
            changeCardLimitType: 'Kartengrenzentyp ändern',
            changeLimitType: 'Limittyp ändern',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `Wenn du den Limittyp dieser Karte auf Smart Limit änderst, werden neue Transaktionen abgelehnt, weil das nicht genehmigte Limit von ${limit} bereits erreicht wurde.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Wenn du den Limittyp dieser Karte auf „Monatlich“ änderst, werden neue Transaktionen abgelehnt, da das monatliche Limit von ${limit} bereits erreicht wurde.`,
            addShippingDetails: 'Versanddetails hinzufügen',
            issuedCard: (assignee: string) => `hat ${assignee} eine Expensify Card ausgestellt! Die Karte wird in 2–3 Werktagen ankommen.`,
            issuedCardNoShippingDetails: (assignee: string) => `hat ${assignee} eine Expensify Card ausgestellt! Die Karte wird versendet, sobald die Versanddetails bestätigt wurden.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `hat ${assignee} eine virtuelle Expensify Card ausgestellt! Die ${link} kann sofort verwendet werden.`,
            addedShippingDetails: (assignee: string) => `${assignee} hat Versanddetails hinzugefügt. Die Expensify Card wird in 2–3 Werktagen ankommen.`,
            replacedCard: (assignee: string) => `${assignee} hat ihre Expensify Card ersetzt. Die neue Karte wird in 2–3 Werktagen ankommen.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} hat ihre virtuelle Expensify Card ersetzt! Die ${link} kann sofort verwendet werden.`,
            card: 'Karte',
            replacementCard: 'Ersatzkarte',
            verifyingHeader: 'Wird überprüft',
            bankAccountVerifiedHeader: 'Bankkonto verifiziert',
            verifyingBankAccount: 'Bankkonto wird verifiziert ...',
            verifyingBankAccountDescription: 'Bitte warten Sie, während wir bestätigen, dass dieses Konto zur Ausgabe von Expensify Cards verwendet werden kann.',
            bankAccountVerified: 'Bankkonto bestätigt!',
            bankAccountVerifiedDescription: 'Sie können nun Expensify Cards an die Mitglieder Ihres Arbeitsbereichs ausgeben.',
            oneMoreStep: 'Noch ein Schritt …',
            oneMoreStepDescription: 'Es sieht so aus, als müssten wir Ihr Bankkonto manuell verifizieren. Bitte gehen Sie zu Concierge, wo Ihre Anweisungen bereits auf Sie warten.',
            gotIt: 'Verstanden',
            goToConcierge: 'Zu Concierge gehen',
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
            spendCategoriesDescription: 'Passen Sie an, wie Händleraussgaben für Kreditkartentransaktionen und gescannte Belege kategorisiert werden.',
            deleteFailureMessage: 'Beim Löschen der Kategorie ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            categoryName: 'Kategoriename',
            requiresCategory: 'Mitglieder müssen alle Ausgaben kategorisieren',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Alle Ausgaben müssen kategorisiert werden, um nach ${connectionName} exportiert zu werden.`,
            subtitle: 'Verschaffe dir einen besseren Überblick darüber, wofür Geld ausgegeben wird. Verwende unsere Standardkategorien oder füge deine eigenen hinzu.',
            emptyCategories: {
                title: 'Du hast noch keine Kategorien erstellt',
                subtitle: 'Fügen Sie eine Kategorie hinzu, um Ihre Ausgaben zu organisieren.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Ihre Kategorien werden derzeit über eine Buchhaltungsanbindung importiert. Gehen Sie zu <a href="${accountingPageURL}">Buchhaltung</a>, um Änderungen vorzunehmen.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Beim Aktualisieren der Kategorie ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            createFailureMessage: 'Beim Erstellen der Kategorie ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            addCategory: 'Kategorie hinzufügen',
            editCategory: 'Kategorie bearbeiten',
            editCategories: 'Kategorien bearbeiten',
            findCategory: 'Kategorie finden',
            categoryRequiredError: 'Kategoriename ist erforderlich',
            existingCategoryError: 'Eine Kategorie mit diesem Namen existiert bereits',
            invalidCategoryName: 'Ungültiger Kategoriename',
            importedFromAccountingSoftware: 'Die folgenden Kategorien werden importiert aus deinem',
            payrollCode: 'Lohnabrechnungscode',
            updatePayrollCodeFailureMessage: 'Beim Aktualisieren des Gehaltsabrechnungscodes ist ein Fehler aufgetreten, bitte versuche es erneut.',
            glCode: 'Sachkontocode',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des Sachkontos ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            importCategories: 'Kategorien importieren',
            cannotDeleteOrDisableAllCategories: {
                title: 'Kann nicht alle Kategorien löschen oder deaktivieren',
                description: `Mindestens eine Kategorie muss aktiviert bleiben, da Ihr Arbeitsbereich Kategorien erfordert.`,
            },
        },
        moreFeatures: {
            subtitle:
                'Verwenden Sie die Schalter unten, um mit Ihrem Wachstum weitere Funktionen zu aktivieren. Jede Funktion wird im Navigationsmenü angezeigt, wo Sie sie weiter anpassen können.',
            spendSection: {
                title: 'Ausgabe',
                subtitle: 'Aktivieren Sie Funktionen, die Ihnen helfen, Ihr Team zu skalieren.',
            },
            manageSection: {
                title: 'Verwalten',
                subtitle: 'Fügen Sie Kontrollen hinzu, die helfen, Ausgaben im Budget zu halten.',
            },
            earnSection: {
                title: 'Verdienen',
                subtitle: 'Optimieren Sie Ihre Einnahmen und lassen Sie sich schneller bezahlen.',
            },
            organizeSection: {
                title: 'Organisieren',
                subtitle: 'Gruppieren und analysieren Sie Ausgaben, und erfassen Sie jede gezahlte Steuer.',
            },
            integrateSection: {
                title: 'Integrieren',
                subtitle: 'Verbinde Expensify mit beliebten Finanzprodukten.',
            },
            distanceRates: {
                title: 'Entfernungsvergütung',
                subtitle: 'Sätze hinzufügen, aktualisieren und durchsetzen.',
            },
            perDiem: {
                title: 'Tagegeld',
                subtitle: 'Legen Sie Pauschalspesen fest, um die täglichen Ausgaben der Mitarbeitenden zu steuern.',
            },
            travel: {
                title: 'Reisen',
                subtitle: 'Buchen, verwalten und abrechnen Sie alle Ihre Geschäftsreisen.',
                getStarted: {
                    title: 'Erste Schritte mit Expensify Travel',
                    subtitle: 'Wir benötigen nur noch ein paar weitere Informationen über Ihr Unternehmen, dann sind Sie bereit für den Start.',
                    ctaText: "Los geht's",
                },
                reviewingRequest: {
                    title: 'Packen Sie Ihre Koffer, wir haben Ihre Anfrage...',
                    subtitle: 'Wir prüfen derzeit Ihre Anfrage zur Aktivierung von Expensify Travel. Keine Sorge, wir lassen Sie wissen, wenn es bereit ist.',
                    ctaText: 'Anfrage gesendet',
                },
                bookOrManageYourTrip: {
                    title: 'Buchen oder verwalten Sie Ihre Reise',
                    subtitle: 'Nutzen Sie Expensify Travel für die besten Reiseangebote und verwalten Sie alle Ihre Geschäftsausgaben an einem Ort.',
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
                        subtitle: 'Zentralisieren Sie alle Reisekosten in einer monatlichen Rechnung, anstatt zum Zeitpunkt des Kaufs zu bezahlen.',
                        learnHow: "So funktioniert's.",
                        subsections: {
                            currentTravelSpendLabel: 'Aktuelle Reisekosten',
                            currentTravelSpendCta: 'Saldo bezahlen',
                            currentTravelLimitLabel: 'Aktuelles Reiselimit',
                            settlementAccountLabel: 'Ausgleichskonto',
                            settlementFrequencyLabel: 'Abrechnungshäufigkeit',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Verschaffen Sie sich Einblicke in Ihre Ausgaben und behalten Sie die Kontrolle darüber.',
                disableCardTitle: 'Expensify-Karte deaktivieren',
                disableCardPrompt: 'Du kannst die Expensify Card nicht deaktivieren, weil sie bereits verwendet wird. Wende dich an Concierge, um weitere Schritte zu erfahren.',
                disableCardButton: 'Chat mit Concierge',
                feed: {
                    title: 'Expensify-Karte anfordern',
                    subTitle: 'Optimieren Sie Ihre Geschäftsausgaben und sparen Sie bis zu 50 % auf Ihre Expensify-Rechnung, außerdem:',
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
                subtitle: 'Verbinde die Karten, die du bereits hast.',
                feed: {
                    title: 'Eigene Karten mitbringen (BYOC)',
                    features: {
                        support: 'Karten von über 10.000 Banken verbinden',
                        assignCards: 'Verknüpfen Sie die vorhandenen Karten Ihres Teams',
                        automaticImport: 'Wir werden Transaktionen automatisch abrufen',
                    },
                    subtitle: 'Verknüpfe die Karten, die du bereits hast, um Transaktionen automatisch zu importieren, Belege abzugleichen und Abstimmungen durchzuführen.',
                },
                bankConnectionError: 'Problem mit Bankverbindung',
                connectWithPlaid: 'Über Plaid verbinden',
                connectWithExpensifyCard: 'Probiere die Expensify Card aus.',
                bankConnectionDescription: `Bitte versuchen Sie, Ihre Karten erneut hinzuzufügen. Andernfalls können Sie`,
                disableCardTitle: 'Firmenkarten deaktivieren',
                disableCardPrompt:
                    'Sie können Firmenkarten nicht deaktivieren, da diese Funktion derzeit verwendet wird. Wenden Sie sich an den Concierge, um die nächsten Schritte zu erfahren.',
                disableCardButton: 'Chat mit Concierge',
                cardDetails: 'Kartendetails',
                cardNumber: 'Kartennummer',
                cardholder: 'Karteninhaber',
                cardName: 'Kartenname',
                allCards: 'Alle Karten',
                assignedCards: 'Zugewiesen',
                unassignedCards: 'Nicht zugewiesen',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} Export` : `${integration}-Export`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Wählen Sie das ${integration}-Konto, in das die Transaktionen exportiert werden sollen.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Wählen Sie das ${integration}-Konto, in das die Transaktionen exportiert werden sollen. Wählen Sie eine andere <a href="${exportPageLink}">Exportoption</a>, um die verfügbaren Konten zu ändern.`,
                lastUpdated: 'Zuletzt aktualisiert',
                transactionStartDate: 'Transaktionsanfangsdatum',
                updateCard: 'Karte aktualisieren',
                unassignCard: 'Karte zuweisen aufheben',
                unassign: 'Zuweisung aufheben',
                unassignCardDescription: 'Wenn diese Karte zugewiesen wird, werden alle Transaktionen in Entwurfsberichten aus dem Konto des Karteninhabers entfernt.',
                assignCard: 'Karte zuweisen',
                cardFeedName: 'Name des Kartenfeeds',
                cardFeedNameDescription: 'Gib dem Kartenfeed einen eindeutigen Namen, damit du ihn von den anderen unterscheiden kannst.',
                cardFeedTransaction: 'Transaktionen löschen',
                cardFeedTransactionDescription: 'Wählen Sie aus, ob Karteninhaber Kartenbuchungen löschen können. Neue Buchungen folgen diesen Regeln.',
                cardFeedRestrictDeletingTransaction: 'Löschen von Transaktionen einschränken',
                cardFeedAllowDeletingTransaction: 'Löschen von Transaktionen zulassen',
                removeCardFeed: 'Kartenfeed entfernen',
                removeCardFeedTitle: (feedName: string) => `${feedName}-Feed entfernen`,
                removeCardFeedDescription: 'Möchten Sie diese Kartenquelle wirklich entfernen? Dadurch werden alle Karten zugewiesen.',
                error: {
                    feedNameRequired: 'Name des Kartenfeeds ist erforderlich',
                    statementCloseDateRequired: 'Bitte wählen Sie ein Abrechnungsendedatum aus.',
                },
                corporate: 'Löschen von Transaktionen einschränken',
                personal: 'Löschen von Transaktionen zulassen',
                setFeedNameDescription: 'Gib dem Kartenfeed einen eindeutigen Namen, damit du ihn von den anderen unterscheiden kannst',
                setTransactionLiabilityDescription: 'Wenn diese Option aktiviert ist, können Karteninhaber Kartenumsätze löschen. Neue Umsätze werden dieser Regel folgen.',
                emptyAddedFeedTitle: 'Firmenkarten zuweisen',
                emptyAddedFeedDescription: 'Legen Sie los, indem Sie Ihre erste Karte einem Mitglied zuweisen.',
                pendingFeedTitle: `Wir prüfen gerade Ihre Anfrage…`,
                pendingFeedDescription: `Wir überprüfen derzeit Ihre Feed-Details. Sobald das erledigt ist, werden wir Sie kontaktieren über`,
                pendingBankTitle: 'Überprüfen Sie Ihr Browserfenster',
                pendingBankDescription: (bankName: string) => `Bitte verbinden Sie sich über das soeben geöffnete Browserfenster mit ${bankName}. Falls sich keines geöffnet hat,`,
                pendingBankLink: 'Bitte hier klicken',
                giveItNameInstruction: 'Gib der Karte einen Namen, der sie von anderen abhebt.',
                updating: 'Wird aktualisiert...',
                neverUpdated: 'Nie',
                noAccountsFound: 'Keine Konten gefunden',
                defaultCard: 'Standardkarte',
                downgradeTitle: `Workspace kann nicht herabgestuft werden`,
                downgradeSubTitle: `Dieser Workspace kann nicht herabgestuft werden, da mehrere Kartenfeeds verbunden sind (außer Expensify Cards). Bitte <a href="#">behalten Sie nur einen Kartenfeed bei</a>, um fortzufahren.`,
                noAccountsFoundDescription: (connection: string) => `Bitte fügen Sie das Konto in ${connection} hinzu und synchronisieren Sie die Verbindung erneut`,
                expensifyCardBannerTitle: 'Expensify-Karte anfordern',
                expensifyCardBannerSubtitle:
                    'Genieße Cashback auf jeden Einkauf in den USA, bis zu 50 % Rabatt auf deine Expensify-Rechnung, unbegrenzt viele virtuelle Karten und vieles mehr.',
                expensifyCardBannerLearnMoreButton: 'Mehr erfahren',
                statementCloseDateTitle: 'Abschlussdatum der Abrechnung',
                statementCloseDateDescription: 'Lassen Sie uns wissen, wann Ihr Kreditkartenkontoauszug abgeschlossen wird, und wir erstellen einen entsprechenden Auszug in Expensify.',
            },
            workflows: {
                title: 'Workflows',
                subtitle: 'Konfigurieren Sie, wie Ausgaben genehmigt und bezahlt werden.',
                disableApprovalPrompt:
                    'Expensify Cards aus diesem Workspace hängen derzeit von Genehmigungen ab, um ihre Smart Limits festzulegen. Bitte passen Sie die Limitarten aller Expensify Cards mit Smart Limits an, bevor Sie Genehmigungen deaktivieren.',
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
                title: 'Stichwörter',
                subtitle: 'Kosten klassifizieren und verrechenbare Ausgaben nachverfolgen.',
            },
            taxes: {
                title: 'Steuern',
                subtitle: 'Dokumentiere und fordere erstattungsfähige Steuern zurück.',
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
                title: 'Belegpartner',
                subtitle: 'Belege automatisch importieren.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Nicht so schnell …',
                featureEnabledText: 'Um diese Funktion zu aktivieren oder zu deaktivieren, müssen Sie Ihre Einstellungen für den Buchhaltungsimport ändern.',
                disconnectText: 'Um die Buchhaltung zu deaktivieren, musst du die Buchhaltungsverbindung von deinem Workspace trennen.',
                manageSettings: 'Einstellungen verwalten',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Uber trennen',
                disconnectText: 'Um diese Funktion zu deaktivieren, trenne bitte zuerst die Uber for Business-Integration.',
                description: 'Sind Sie sicher, dass Sie diese Integration trennen möchten?',
                confirmText: 'Verstanden',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Nicht so schnell …',
                featureEnabledText:
                    'Expensify Cards in diesem Workspace verwenden Genehmigungsworkflows, um ihre Smart Limits festzulegen.\n\nBitte ändern Sie die Limittypen aller Karten mit Smart Limits, bevor Sie Workflows deaktivieren.',
                confirmText: 'Zu Expensify Cards gehen',
            },
            rules: {
                title: 'Regeln',
                subtitle: 'Belege verlangen, hohe Ausgaben kennzeichnen und mehr.',
            },
            timeTracking: {
                title: 'Zeit',
                subtitle: 'Legen Sie einen abrechenbaren Stundensatz für die Zeiterfassung fest.',
                defaultHourlyRate: 'Standardstundensatz',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Beispiele:',
            customReportNamesSubtitle: `<muted-text>Passen Sie Berichtstitel mit unseren <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">umfangreichen Formeln</a> an.</muted-text>`,
            customNameTitle: 'Standardmäßiger Berichtsname',
            customNameDescription: `Wählen Sie einen eigenen Namen für Spesenabrechnungen mit Hilfe unserer <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">umfangreichen Formeln</a>.`,
            customNameInputLabel: 'Name',
            customNameEmailPhoneExample: 'E-Mail-Adresse oder Telefonnummer des Mitglieds: {report:submit:from}',
            customNameStartDateExample: 'Berichtsstartdatum: {report:startdate}',
            customNameWorkspaceNameExample: 'Arbeitsbereichsname: {report:workspacename}',
            customNameReportIDExample: 'Berichts-ID: {report:id}',
            customNameTotalExample: 'Gesamt: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Verhindern, dass Mitglieder benutzerdefinierte Berichtstitel ändern',
        },
        reportFields: {
            addField: 'Feld hinzufügen',
            delete: 'Feld löschen',
            deleteFields: 'Felder löschen',
            findReportField: 'Berichtsfeld finden',
            deleteConfirmation: 'Sind Sie sicher, dass Sie dieses Berichtsfeld löschen möchten?',
            deleteFieldsConfirmation: 'Möchten Sie diese Berichtsfelder wirklich löschen?',
            emptyReportFields: {
                title: 'Sie haben noch keine Berichtsfelder erstellt',
                subtitle: 'Fügen Sie ein benutzerdefiniertes Feld (Text, Datum oder Dropdown) hinzu, das in Berichten angezeigt wird.',
            },
            subtitle: 'Berichtsfelder gelten für alle Ausgaben und können hilfreich sein, wenn Sie nach zusätzlichen Informationen fragen möchten.',
            disableReportFields: 'Berichtsfelder deaktivieren',
            disableReportFieldsConfirmation: 'Bist du sicher? Text- und Datumsfelder werden gelöscht und Listen werden deaktiviert.',
            importedFromAccountingSoftware: 'Die folgenden Berichtsfelder werden importiert aus Ihrem',
            textType: 'Text',
            dateType: 'Datum',
            dropdownType: 'Liste',
            formulaType: 'Formel',
            textAlternateText: 'Feld für Freitexteingabe hinzufügen.',
            dateAlternateText: 'Fügen Sie einen Kalender zur Datumauswahl hinzu.',
            dropdownAlternateText: 'Fügen Sie eine Liste von Optionen zur Auswahl hinzu.',
            formulaAlternateText: 'Ein Formel-Feld hinzufügen.',
            nameInputSubtitle: 'Wählen Sie einen Namen für das Berichtsfeld.',
            typeInputSubtitle: 'Wähle aus, welchen Typ von Berichtsfeld du verwenden möchtest.',
            initialValueInputSubtitle: 'Geben Sie einen Startwert ein, der im Berichtsfeld angezeigt werden soll.',
            listValuesInputSubtitle: 'Diese Werte werden in der Dropdown-Liste Ihres Berichtsfeldes angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            listInputSubtitle: 'Diese Werte werden in Ihrer Berichtsfeldliste angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            deleteValue: 'Wert löschen',
            deleteValues: 'Werte löschen',
            disableValue: 'Wert deaktivieren',
            disableValues: 'Werte deaktivieren',
            enableValue: 'Wert aktivieren',
            enableValues: 'Werte aktivieren',
            emptyReportFieldsValues: {
                title: 'Sie haben noch keine Listenwerte erstellt',
                subtitle: 'Fügen Sie benutzerdefinierte Werte hinzu, die in Berichten erscheinen sollen.',
            },
            deleteValuePrompt: 'Möchtest du diesen Listenwert wirklich löschen?',
            deleteValuesPrompt: 'Möchten Sie diese Listenwerte wirklich löschen?',
            listValueRequiredError: 'Bitte geben Sie einen Namen für den Listenwert ein',
            existingListValueError: 'Ein Listenwert mit diesem Namen ist bereits vorhanden',
            editValue: 'Wert bearbeiten',
            listValues: 'Werte auflisten',
            addValue: 'Wert hinzufügen',
            existingReportFieldNameError: 'Ein Berichtsfeld mit diesem Namen existiert bereits',
            reportFieldNameRequiredError: 'Bitte geben Sie einen Berichtsfeldnamen ein',
            reportFieldTypeRequiredError: 'Bitte wählen Sie einen Berichtsfeldtyp',
            circularReferenceError: 'Dieses Feld kann nicht auf sich selbst verweisen. Bitte aktualisieren.',
            reportFieldInitialValueRequiredError: 'Bitte wählen Sie einen Anfangswert für das Berichtsfeld',
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
            subtitle: 'Tags fügen detailliertere Möglichkeiten hinzu, Kosten zu klassifizieren.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>Sie verwenden <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">abhängige Tags</a>. Sie können eine <a href="${importSpreadsheetLink}">Tabellenkalkulation erneut importieren</a>, um Ihre Tags zu aktualisieren.</muted-text>`,
            emptyTags: {
                title: 'Sie haben noch keine Tags erstellt',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Füge ein Tag hinzu, um Projekte, Standorte, Abteilungen und mehr zu verfolgen.',
                subtitleHTML: `<muted-text><centered-text>Fügen Sie Tags hinzu, um Projekte, Standorte, Abteilungen und mehr nachzuverfolgen. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Erfahren Sie mehr</a> über das Formatieren von Tag-Dateien für den Import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Ihre Tags werden derzeit über eine Buchhaltungsverbindung importiert. Gehen Sie zu <a href="${accountingPageURL}">Buchhaltung</a>, um Änderungen vorzunehmen.</centered-text></muted-text>`,
            },
            deleteTag: 'Tag löschen',
            deleteTags: 'Tags löschen',
            deleteTagConfirmation: 'Sind Sie sicher, dass Sie dieses Tag löschen möchten?',
            deleteTagsConfirmation: 'Sind Sie sicher, dass Sie diese Tags löschen möchten?',
            deleteFailureMessage: 'Beim Löschen des Tags ist ein Fehler aufgetreten, bitte versuche es erneut',
            tagRequiredError: 'Tag-Name ist erforderlich',
            existingTagError: 'Ein Tag mit diesem Namen existiert bereits',
            invalidTagNameError: 'Tag-Name kann nicht 0 sein. Bitte wählen Sie einen anderen Wert.',
            genericFailureMessage: 'Beim Aktualisieren des Tags ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            importedFromAccountingSoftware: 'Die untenstehenden Tags werden importiert von Ihrer',
            glCode: 'Sachkontocode',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des Sachkontos ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            tagRules: 'Tag-Regeln',
            approverDescription: 'Genehmiger',
            importTags: 'Tags importieren',
            importTagsSupportingText: 'Verschlüssele deine Ausgaben mit einem Tagtyp oder mit mehreren.',
            configureMultiLevelTags: 'Konfiguriere deine Liste von Tags für die mehrstufige Verschlagwortung.',
            importMultiLevelTagsSupportingText: `Hier ist eine Vorschau deiner Tags. Wenn alles gut aussieht, klicke unten, um sie zu importieren.`,
            importMultiLevelTags: {
                firstRowTitle: 'Die erste Zeile ist der Titel für jede Tagliste',
                independentTags: 'Dies sind unabhängige Tags',
                glAdjacentColumn: 'In der benachbarten Spalte befindet sich ein Sachkonto-Code',
            },
            tagLevel: {
                singleLevel: 'Einstufige Tags',
                multiLevel: 'Tags auf mehreren Ebenen',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Tag-Ebenen wechseln',
                prompt1: 'Das Ändern der Tag-Ebenen löscht alle aktuellen Tags.',
                prompt2: 'Wir empfehlen Ihnen zuerst',
                prompt3: 'Ein Backup herunterladen',
                prompt4: 'indem Sie Ihre Tags exportieren.',
                prompt5: 'Mehr erfahren',
                prompt6: 'über Tag-Ebenen.',
            },
            overrideMultiTagWarning: {
                title: 'Tags importieren',
                prompt1: 'Bist du sicher?',
                prompt2: 'Die vorhandenen Tags werden überschrieben, aber Sie können',
                prompt3: 'Ein Backup herunterladen',
                prompt4: 'zuerst.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `Wir haben *${columnCounts} Spalten* in Ihrer Tabelle gefunden. Wählen Sie *Name* neben der Spalte aus, die die Tag-Namen enthält. Sie können außerdem *Aktiviert* neben der Spalte auswählen, die den Tag-Status festlegt.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Es können nicht alle Tags gelöscht oder deaktiviert werden',
                description: `Mindestens ein Tag muss aktiviert bleiben, da in Ihrem Workspace Tags erforderlich sind.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Es können nicht alle Tags optional gemacht werden',
                description: `Mindestens ein Tag muss verpflichtend bleiben, da Ihre Arbeitsbereicheinstellungen Tags erfordern.`,
            },
            cannotMakeTagListRequired: {
                title: 'Tagliste kann nicht als erforderlich festgelegt werden',
                description: 'Sie können eine Tagliste nur dann als erforderlich festlegen, wenn Ihre Richtlinie mehrere Tag-Ebenen konfiguriert hat.',
            },
            tagCount: () => ({
                one: '1 Tag',
                other: (count: number) => `${count} Tags`,
            }),
        },
        taxes: {
            subtitle: 'Steuersätze und -namen hinzufügen und Standardwerte festlegen.',
            addRate: 'Rate hinzufügen',
            workspaceDefault: 'Standardwährung des Workspaces',
            foreignDefault: 'Standard-Fremdwährung',
            customTaxName: 'Benutzerdefinierter Steuername',
            value: 'Wert',
            taxReclaimableOn: 'Steuer rückforderbar auf',
            taxRate: 'Steuersatz',
            findTaxRate: 'Steuersatz finden',
            error: {
                taxRateAlreadyExists: 'Dieser Steuername wird bereits verwendet',
                taxCodeAlreadyExists: 'Dieser Steuercode wird bereits verwendet',
                valuePercentageRange: 'Bitte gib einen gültigen Prozentsatz zwischen 0 und 100 ein',
                customNameRequired: 'Benutzerdefinierter Steuername ist erforderlich',
                deleteFailureMessage: 'Beim Löschen des Steuersatzes ist ein Fehler aufgetreten. Bitte versuche es erneut oder bitte Concierge um Hilfe.',
                updateFailureMessage: 'Beim Aktualisieren des Steuersatzes ist ein Fehler aufgetreten. Bitte versuche es erneut oder bitte Concierge um Hilfe.',
                createFailureMessage: 'Beim Erstellen des Steuersatzes ist ein Fehler aufgetreten. Bitte versuche es erneut oder bitte Concierge um Hilfe.',
                updateTaxClaimableFailureMessage: 'Der rückerstattungsfähige Anteil muss geringer sein als der Kilometersatzbetrag',
            },
            deleteTaxConfirmation: 'Sind Sie sicher, dass Sie diese Steuer löschen möchten?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Möchten Sie wirklich ${taxAmount} Steuern löschen?`,
            actions: {
                delete: 'Rate löschen',
                deleteMultiple: 'Sätze löschen',
                enable: 'Satz aktivieren',
                disable: 'Rate deaktivieren',
                enableTaxRates: () => ({
                    one: 'Satz aktivieren',
                    other: 'Tarife aktivieren',
                }),
                disableTaxRates: () => ({
                    one: 'Rate deaktivieren',
                    other: 'Kurse deaktivieren',
                }),
            },
            importedFromAccountingSoftware: 'Die unten aufgeführten Steuern werden importiert aus deinem',
            taxCode: 'Steuerschlüssel',
            updateTaxCodeFailureMessage: 'Beim Aktualisieren des Steuercodes ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        duplicateWorkspace: {
            title: 'Benennen Sie Ihren neuen Workspace',
            selectFeatures: 'Funktionen zum Kopieren auswählen',
            whichFeatures: 'Welche Funktionen möchten Sie in Ihren neuen Arbeitsbereich übernehmen?',
            confirmDuplicate: 'Möchten Sie fortfahren?',
            categories: 'Kategorien und Ihre automatischen Kategorisierungsregeln',
            reimbursementAccount: 'Erstattungskonto',
            welcomeNote: 'Bitte verwenden Sie meinen neuen Arbeitsbereich',
            delayedSubmission: 'verspätete Einreichung',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Sie sind dabei, ${newWorkspaceName ?? ''} zu erstellen und mit ${totalMembers ?? 0} Mitgliedern aus dem ursprünglichen Workspace zu teilen.`,
            error: 'Beim Duplizieren deines neuen Arbeitsbereichs ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        emptyWorkspace: {
            title: 'Du hast keine Arbeitsbereiche',
            subtitle: 'Belege erfassen, Ausgaben erstatten, Reisen verwalten, Rechnungen versenden und mehr.',
            createAWorkspaceCTA: 'Erste Schritte',
            features: {
                trackAndCollect: 'Belege nachverfolgen und sammeln',
                reimbursements: 'Mitarbeitende erstatten',
                companyCards: 'Firmenkarten verwalten',
            },
            notFound: 'Kein Workspace gefunden',
            description:
                'Räume sind ein großartiger Ort, um sich mit mehreren Personen zu unterhalten und zusammenzuarbeiten. Um mit der Zusammenarbeit zu beginnen, erstelle oder tritt einem Workspace bei',
        },
        new: {
            newWorkspace: 'Neuer Workspace',
            getTheExpensifyCardAndMore: 'Hol dir die Expensify Card und mehr',
            confirmWorkspace: 'Workspace bestätigen',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mein Gruppen-Arbeitsbereich${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Workspace von ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Beim Entfernen eines Mitglieds aus dem Workspace ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Möchtest du ${memberName} wirklich entfernen?`,
                other: 'Möchten Sie diese Mitglieder wirklich entfernen?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} ist ein Genehmigender in diesem Workspace. Wenn du diesen Workspace nicht mehr mit ihnen teilst, ersetzen wir sie im Genehmigungs-Workflow durch den Workspace-Inhaber, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Mitglied entfernen',
                other: 'Mitglieder entfernen',
            }),
            findMember: 'Mitglied suchen',
            removeWorkspaceMemberButtonTitle: 'Aus Arbeitsbereich entfernen',
            removeGroupMemberButtonTitle: 'Aus Gruppe entfernen',
            removeRoomMemberButtonTitle: 'Aus Chat entfernen',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Möchtest du ${memberName} wirklich entfernen?`,
            removeMemberTitle: 'Mitglied entfernen',
            transferOwner: 'Besitzer übertragen',
            makeMember: () => ({
                one: 'Zum Mitglied machen',
                other: 'Zu Mitgliedern machen',
            }),
            makeAdmin: () => ({
                one: 'Zum Administrator machen',
                other: 'Zu Administratoren machen',
            }),
            makeAuditor: () => ({
                one: 'Zum Prüfer machen',
                other: 'Zu Prüfern machen',
            }),
            selectAll: 'Alle auswählen',
            error: {
                genericAdd: 'Beim Hinzufügen dieses Workspace-Mitglieds ist ein Problem aufgetreten',
                cannotRemove: 'Du kannst dich selbst oder den Arbeitsbereichs-Eigentümer nicht entfernen',
                genericRemove: 'Beim Entfernen dieses Arbeitsbereichsmitglieds ist ein Problem aufgetreten',
            },
            addedWithPrimary: 'Einige Mitglieder wurden mit ihren primären Logins hinzugefügt.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Hinzugefügt durch sekundären Login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Gesamtanzahl Workspace-Mitglieder: ${count}`,
            importMembers: 'Mitglieder importieren',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Wenn du ${approver} aus diesem Workspace entfernst, werden wir sie im Genehmigungs-Workflow durch ${workspaceOwner}, den Workspace-Inhaber, ersetzen.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} hat ausstehende Spesenberichte zur Genehmigung. Bitte bitten Sie sie, diese zu genehmigen, oder übernehmen Sie die Kontrolle über ihre Berichte, bevor Sie sie aus dem Workspace entfernen.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Sie können ${memberName} nicht aus diesem Workspace entfernen. Bitte legen Sie unter Workflows > Zahlungen erstellen oder nachverfolgen einen neuen Erstattungsverantwortlichen fest und versuchen Sie es dann erneut.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Wenn du ${memberName} aus diesem Workspace entfernst, ersetzen wir sie/ihn als bevorzugte/n Exporteur/in durch ${workspaceOwner}, den Workspace-Inhaber.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Wenn Sie ${memberName} aus diesem Workspace entfernen, ersetzen wir sie als technischen Ansprechpartner durch ${workspaceOwner}, den Workspace-Inhaber.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} hat einen ausstehenden zu bearbeitenden Bericht, zu dem eine Aktion erforderlich ist. Bitte bitten Sie sie, die erforderliche Aktion abzuschließen, bevor Sie sie aus dem Workspace entfernen.`,
        },
        card: {
            getStartedIssuing: 'Beginne, indem du deine erste virtuelle oder physische Karte ausstellst.',
            issueCard: 'Karte ausstellen',
            issueNewCard: {
                whoNeedsCard: 'Wer braucht eine Karte?',
                inviteNewMember: 'Neues Mitglied einladen',
                findMember: 'Mitglied suchen',
                chooseCardType: 'Kartentyp auswählen',
                physicalCard: 'Physische Karte',
                physicalCardDescription: 'Ideal für Vielausgeber',
                virtualCard: 'Virtuelle Karte',
                virtualCardDescription: 'Sofort und flexibel',
                chooseLimitType: 'Wähle einen Grenztyp',
                smartLimit: 'Smart Limit',
                smartLimitDescription: 'Bis zu einem bestimmten Betrag ausgeben, bevor eine Genehmigung erforderlich ist',
                monthly: 'Monatlich',
                monthlyDescription: 'Bis zu einem bestimmten Betrag pro Monat ausgeben',
                fixedAmount: 'Fester Betrag',
                fixedAmountDescription: 'Bis zu einem bestimmten Betrag einmal ausgeben',
                setLimit: 'Ein Limit festlegen',
                cardLimitError: 'Bitte gib einen Betrag ein, der kleiner als 21.474.836 $ ist',
                giveItName: 'Gib ihm einen Namen',
                giveItNameInstruction: 'Mach sie eindeutig genug, um sie von anderen Karten unterscheiden zu können. Konkrete Anwendungsfälle sind sogar noch besser!',
                cardName: 'Kartenname',
                letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
                willBeReadyToUse: 'Diese Karte ist sofort einsatzbereit.',
                willBeReadyToShip: 'Diese Karte ist sofort versandbereit.',
                cardholder: 'Karteninhaber',
                cardType: 'Kartentyp',
                limit: 'Limit',
                limitType: 'Limittyp',
                disabledApprovalForSmartLimitError: 'Bitte aktiviere Genehmigungen unter <strong>Workflows > Genehmigungen hinzufügen</strong>, bevor du intelligente Limits einrichtest',
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
            subtitle: 'Verbinden Sie Ihr Buchhaltungssystem, um Transaktionen mit Ihrem Kontenplan zu codieren, Zahlungen automatisch abzugleichen und Ihre Finanzen synchron zu halten.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chatten Sie mit Ihrer Einrichtungsfachkraft.',
            talkYourAccountManager: 'Chatten Sie mit Ihrem Account Manager.',
            talkToConcierge: 'Mit Concierge chatten.',
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
                `Bei einer in Expensify Classic eingerichteten Verbindung ist ein Fehler aufgetreten. [Gehe zu Expensify Classic, um dieses Problem zu beheben.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Gehe zu Expensify Classic, um deine Einstellungen zu verwalten.',
            setup: 'Verbinden',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Zuletzt synchronisiert ${relativeDate}`,
            notSync: 'Nicht synchronisiert',
            import: 'Importieren',
            export: 'Exportieren',
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
                        return 'Keine Verbindung zu Xero möglich';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Verbindung zu NetSuite nicht möglich';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Verbindung mit QuickBooks Desktop nicht möglich';
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
                `Sind Sie sicher, dass Sie ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'diese Buchhaltungsintegration'} verbinden möchten? Dadurch werden alle bestehenden Buchhaltungsverbindungen entfernt.`,
            enterCredentials: 'Geben Sie Ihre Anmeldedaten ein',
            claimOffer: {
                badgeText: 'Angebot verfügbar!',
                xero: {
                    headline: '6 Monate kostenlos mit Xero!',
                    description: '<muted-text><centered-text>Neu bei Xero? Expensify-Kunden erhalten 6 Monate kostenlos. Fordern Sie Ihr Angebot unten an.</centered-text></muted-text>',
                    connectButton: 'Mit Xero verbinden',
                },
                uber: {
                    headerTitle: 'Uber for Business',
                    headline: '5% Rabatt auf Uber-Fahrten',
                    description: `<muted-text><centered-text>Aktivieren Sie Uber for Business über Expensify und sparen Sie 5% bei allen Geschäftsreisen bis Juni. <a href="${CONST.UBER_TERMS_LINK}">Bedingungen gelten.</a></centered-text></muted-text>`,
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
                            return 'Mitarbeiter werden importiert';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Konten werden importiert';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importieren von Klassen';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importieren von Standorten';
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
                            return 'Importieren von QuickBooks Online-Daten';
                        case 'startingImportXero':
                            return 'Xero-Daten werden importiert';
                        case 'startingImportQBO':
                            return 'Importieren von QuickBooks Online-Daten';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importieren von QuickBooks Desktop-Daten';
                        case 'quickbooksDesktopImportTitle':
                            return 'Titel wird importiert';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Genehmigungszertifikat wird importiert';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importiere Dimensionen';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Richtlinie zum Speichern wird importiert';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Daten werden noch mit QuickBooks synchronisiert … Bitte stelle sicher, dass der Web Connector ausgeführt wird';
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
                            return 'Xero-Rechnungen und -Gutschriften als bezahlt markieren';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Tracking-Kategorien werden synchronisiert';
                        case 'xeroSyncImportBankAccounts':
                            return 'Bankkonten werden synchronisiert';
                        case 'xeroSyncImportTaxRates':
                            return 'Steuersätze werden synchronisiert';
                        case 'xeroCheckConnection':
                            return 'Xero-Verbindung wird geprüft';
                        case 'xeroSyncTitle':
                            return 'Xero-Daten werden synchronisiert';
                        case 'netSuiteSyncConnection':
                            return 'Verbindung zu NetSuite wird initialisiert';
                        case 'netSuiteSyncCustomers':
                            return 'Kunden werden importiert';
                        case 'netSuiteSyncInitData':
                            return 'Daten von NetSuite werden abgerufen';
                        case 'netSuiteSyncImportTaxes':
                            return 'Steuern werden importiert';
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
                            return 'Importieren von Daten als Expensify-Berichts­felder';
                        case 'netSuiteSyncTags':
                            return 'Daten werden als Expensify-Tags importiert';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Verbindungsinformationen werden aktualisiert';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensify-Berichte als erstattet markieren';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuite-Rechnungen und -Gutschriften als bezahlt markieren';
                        case 'netSuiteImportVendorsTitle':
                            return 'Lieferanten werden importiert';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Benutzerdefinierte Listen importieren';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Benutzerdefinierte Listen importieren';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Import von Tochtergesellschaften';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Lieferanten werden importiert';
                        case 'intacctCheckConnection':
                            return 'Sage Intacct-Verbindung wird überprüft';
                        case 'intacctImportDimensions':
                            return 'Importieren von Sage Intacct-Dimensionen';
                        case 'intacctImportTitle':
                            return 'Sage Intacct-Daten werden importiert';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Übersetzung fehlt für Phase: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Bevorzugter Exporteur',
            exportPreferredExporterNote:
                'Der bevorzugte Exporteur kann jeder Workspace-Admin sein, muss jedoch auch ein Domain-Admin sein, wenn du in den Domaineinstellungen unterschiedliche Exportkonten für einzelne Firmenkarten festlegst.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur in seinem Konto Berichte zum Export.',
            exportAs: 'Als exportieren',
            exportOutOfPocket: 'Auslagenausgaben exportieren als',
            exportCompanyCard: 'Firmenkartenausgaben exportieren als',
            exportDate: 'Exportdatum',
            defaultVendor: 'Standardlieferant',
            autoSync: 'Automatische Synchronisierung',
            autoSyncDescription: 'Synchronisiere NetSuite und Expensify automatisch, jeden Tag. Exportiere den finalisierten Bericht in Echtzeit',
            reimbursedReports: 'Erstattete Berichte synchronisieren',
            cardReconciliation: 'Kartenabgleich',
            reconciliationAccount: 'Abstimmkonto',
            continuousReconciliation: 'Kontinuierliche Abstimmung',
            saveHoursOnReconciliation:
                'Sparen Sie bei jedem Abrechnungszeitraum Stunden bei der Abstimmung, indem Sie Expensify die Auszüge und Ausgleichszahlungen der Expensify Card fortlaufend automatisch für Sie abstimmen lassen.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Um die kontinuierliche Abstimmung zu aktivieren, aktiviere bitte die <a href="${accountingAdvancedSettingsLink}">automatische Synchronisierung</a> für ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wählen Sie das Bankkonto aus, mit dem Ihre Expensify Card-Zahlungen abgeglichen werden.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Stellen Sie sicher, dass dieses Konto mit Ihrem <a href="${settlementAccountUrl}">Expensify Card-Abrechnungskonto</a> (endet auf ${lastFourPAN}) übereinstimmt, damit die fortlaufende Abstimmung ordnungsgemäß funktioniert.`,
            },
        },
        export: {
            notReadyHeading: 'Noch nicht bereit zum Exportieren',
            notReadyDescription:
                'Entwürfe oder ausstehende Spesenabrechnungen können nicht in das Buchhaltungssystem exportiert werden. Bitte genehmigen oder bezahlen Sie diese Spesen, bevor Sie sie exportieren.',
        },
        invoices: {
            sendInvoice: 'Rechnung senden',
            sendFrom: 'Senden von',
            invoicingDetails: 'Rechnungsdetails',
            invoicingDetailsDescription: 'Diese Informationen werden auf Ihren Rechnungen angezeigt.',
            companyName: 'Firmenname',
            companyWebsite: 'Firmenwebsite',
            paymentMethods: {
                personal: 'Persönlich',
                business: 'Geschäft',
                chooseInvoiceMethod: 'Wählen Sie unten eine Zahlungsmethode aus:',
                payingAsIndividual: 'Als Privatperson bezahlen',
                payingAsBusiness: 'Bezahlen als Unternehmen',
            },
            invoiceBalance: 'Rechnungsbetrag',
            invoiceBalanceSubtitle:
                'Das ist dein aktuelles Guthaben aus eingegangenen Rechnungszahlungen. Es wird automatisch auf dein Bankkonto überwiesen, wenn du eines hinzugefügt hast.',
            bankAccountsSubtitle: 'Füge ein Bankkonto hinzu, um Rechnungszahlungen zu senden und zu empfangen.',
        },
        invite: {
            member: 'Mitglied einladen',
            members: 'Mitglieder einladen',
            invitePeople: 'Neue Mitglieder einladen',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Workspace ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            pleaseEnterValidLogin: `Bitte stelle sicher, dass die E-Mail-Adresse oder Telefonnummer gültig ist (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'Benutzer',
            users: 'Benutzer',
            invited: 'eingeladen',
            removed: 'Entfernt',
            to: 'bis',
            from: 'von',
        },
        inviteMessage: {
            confirmDetails: 'Details bestätigen',
            inviteMessagePrompt: 'Machen Sie Ihre Einladung besonders persönlich, indem Sie unten eine Nachricht hinzufügen!',
            personalMessagePrompt: 'Nachricht',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Workspace ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            inviteNoMembersError: 'Bitte wähle mindestens ein Mitglied zum Einladen aus',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} hat beantragt, ${workspaceName} beizutreten`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ups! Nicht so schnell …',
            workspaceNeeds: 'Ein Arbeitsbereich benötigt mindestens einen aktivierten Entfernungs­tarif.',
            distance: 'Entfernung',
            centrallyManage: 'Verwalte Sätze zentral, verfolge Entfernungen in Meilen oder Kilometern und lege eine Standardkategorie fest.',
            rate: 'Bewerten',
            addRate: 'Rate hinzufügen',
            findRate: 'Tarif finden',
            trackTax: 'Steuer nachverfolgen',
            deleteRates: () => ({
                one: 'Rate löschen',
                other: 'Sätze löschen',
            }),
            enableRates: () => ({
                one: 'Satz aktivieren',
                other: 'Tarife aktivieren',
            }),
            disableRates: () => ({
                one: 'Rate deaktivieren',
                other: 'Kurse deaktivieren',
            }),
            enableRate: 'Satz aktivieren',
            status: 'Status',
            unit: 'Einheit',
            taxFeatureNotEnabledMessage:
                '<muted-text>Steuern müssen im Workspace aktiviert sein, um diese Funktion zu verwenden. Gehe zu <a href="#">Weitere Funktionen</a>, um diese Änderung vorzunehmen.</muted-text>',
            deleteDistanceRate: 'Entfernungsrate löschen',
            areYouSureDelete: () => ({
                one: 'Möchten Sie diesen Satz wirklich löschen?',
                other: 'Sind Sie sicher, dass Sie diese Sätze löschen möchten?',
            }),
            errors: {
                rateNameRequired: 'Ratenname ist erforderlich',
                existingRateName: 'Ein Distanzsatz mit diesem Namen existiert bereits',
            },
        },
        editor: {
            descriptionInputLabel: 'Beschreibung',
            nameInputLabel: 'Name',
            typeInputLabel: 'Typ',
            initialValueInputLabel: 'Anfangswert',
            nameInputHelpText: 'Dies ist der Name, den du in deinem Arbeitsbereich sehen wirst.',
            nameIsRequiredError: 'Sie müssen Ihrem Workspace einen Namen geben',
            currencyInputLabel: 'Standardwährung',
            currencyInputHelpText: 'Alle Ausgaben in diesem Workspace werden in diese Währung umgerechnet.',
            currencyInputDisabledText: (currency: string) => `Die Standardwährung kann nicht geändert werden, weil dieser Workspace mit einem ${currency}-Bankkonto verknüpft ist.`,
            save: 'Speichern',
            genericFailureMessage: 'Beim Aktualisieren des Workspace ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            addressContext: 'Für die Aktivierung von Expensify Travel ist eine Arbeitsbereichsadresse erforderlich. Bitte geben Sie eine Adresse ein, die Ihrem Unternehmen zugeordnet ist.',
            policy: 'Spesenrichtlinie',
        },
        bankAccount: {
            continueWithSetup: 'Einrichtung fortsetzen',
            youAreAlmostDone:
                'Du bist fast fertig mit dem Einrichten deines Bankkontos, mit dem du Firmenkarten ausgeben, Ausgaben erstatten, Rechnungen einziehen und Zahlungen tätigen kannst.',
            streamlinePayments: 'Zahlungen optimieren',
            connectBankAccountNote: 'Hinweis: Persönliche Bankkonten können nicht für Zahlungen in Arbeitsbereichen verwendet werden.',
            oneMoreThing: 'Noch eine Sache!',
            allSet: 'Alles erledigt!',
            accountDescriptionWithCards: 'Dieses Bankkonto wird verwendet, um Firmenkarten auszugeben, Ausgaben zu erstatten, Rechnungen einzuziehen und Rechnungen zu bezahlen.',
            letsFinishInChat: 'Lass uns den Chat beenden!',
            finishInChat: 'Im Chat abschließen',
            almostDone: 'Fast fertig!',
            disconnectBankAccount: 'Bankkonto trennen',
            startOver: 'Neu beginnen',
            updateDetails: 'Details aktualisieren',
            yesDisconnectMyBankAccount: 'Ja, mein Bankkonto trennen',
            yesStartOver: 'Ja, neu beginnen',
            disconnectYourBankAccount: (bankName: string) =>
                `Trenne dein <strong>${bankName}</strong>-Bankkonto. Alle ausstehenden Transaktionen für dieses Konto werden weiterhin ausgeführt.`,
            clearProgress: 'Ein Neustart löscht den bisherigen Fortschritt.',
            areYouSure: 'Bist du sicher?',
            workspaceCurrency: 'Währung des Workspaces',
            updateCurrencyPrompt:
                'Es scheint, dass Ihr Workspace derzeit auf eine andere Währung als USD eingestellt ist. Bitte klicken Sie auf die Schaltfläche unten, um Ihre Währung jetzt auf USD zu aktualisieren.',
            updateToUSD: 'Auf USD aktualisieren',
            updateWorkspaceCurrency: 'Arbeitsbereichswährung aktualisieren',
            workspaceCurrencyNotSupported: 'Arbeitsbereichswährung wird nicht unterstützt',
            yourWorkspace: `Dein Arbeitsbereich ist auf eine nicht unterstützte Währung eingestellt. Sieh dir die <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">Liste der unterstützten Währungen</a> an.`,
            chooseAnExisting: 'Wähle ein bestehendes Bankkonto, um Ausgaben zu bezahlen, oder füge ein neues hinzu.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Besitzer übertragen',
            addPaymentCardTitle: 'Gib deine Zahlungskarte ein, um die Inhaberschaft zu übertragen',
            addPaymentCardButtonText: 'Bedingungen akzeptieren & Zahlungskarte hinzufügen',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Lies und akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und die <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzrichtlinie</a>, um deine Karte hinzuzufügen.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS-konform',
            addPaymentCardBankLevelEncrypt: 'Verschlüsselung auf Bankniveau',
            addPaymentCardRedundant: 'Redundante Infrastruktur',
            addPaymentCardLearnMore: `<muted-text>Erfahre mehr über unsere <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">Sicherheit</a>.</muted-text>`,
            amountOwedTitle: 'Offener Saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Dieses Konto hat einen ausstehenden Saldo aus einem vorherigen Monat.\n\nMöchten Sie den Saldo ausgleichen und die Abrechnung für diesen Workspace übernehmen?',
            ownerOwesAmountTitle: 'Offener Saldo',
            ownerOwesAmountButtonText: 'Guthaben übertragen',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `Das Konto, dem dieser Workspace gehört (${email}), hat einen ausstehenden Saldo aus einem vorherigen Monat.

Möchten Sie diesen Betrag (${amount}) überweisen, um die Abrechnung für diesen Workspace zu übernehmen? Ihre Zahlungskarte wird sofort belastet.`,
            subscriptionTitle: 'Jahresabonnement übernehmen',
            subscriptionButtonText: 'Abonnement übertragen',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Die Übernahme dieses Workspaces führt dazu, dass sein Jahresabonnement mit Ihrem aktuellen Abonnement zusammengeführt wird. Dadurch erhöht sich die Größe Ihres Abonnements um ${usersCount} Mitglieder, sodass Ihr neues Abonnement eine Größe von ${finalCount} hat. Möchten Sie fortfahren?`,
            duplicateSubscriptionTitle: 'Warnung: Doppelte Abonnements',
            duplicateSubscriptionButtonText: 'Weiter',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Es sieht so aus, als ob du versuchst, die Abrechnung für die Workspaces von ${email} zu übernehmen. Dafür musst du jedoch zuerst Administrator in all ihren Workspaces sein.

Klicke auf „Weiter“, wenn du nur die Abrechnung für den Workspace ${workspaceName} übernehmen möchtest.

Wenn du die Abrechnung für ihr gesamtes Abonnement übernehmen möchtest, bitte sie zunächst, dich als Administrator zu all ihren Workspaces hinzuzufügen, bevor du die Abrechnung übernimmst.`,
            hasFailedSettlementsTitle: 'Besitz kann nicht übertragen werden',
            hasFailedSettlementsButtonText: 'Verstanden',
            hasFailedSettlementsText: (email: string) =>
                `Sie können die Abrechnung nicht übernehmen, weil ${email} eine überfällige Expensify Card-Abrechnung hat. Bitte bitten Sie diese Person, sich an concierge@expensify.com zu wenden, um das Problem zu lösen. Danach können Sie die Abrechnung für diesen Workspace übernehmen.`,
            failedToClearBalanceTitle: 'Saldo konnte nicht ausgeglichen werden',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Wir konnten den Saldo nicht ausgleichen. Bitte versuchen Sie es später noch einmal.',
            successTitle: 'Juhu! Alles bereit.',
            successDescription: 'Du bist jetzt der Inhaber dieses Arbeitsbereichs.',
            errorTitle: 'Ups! Nicht so schnell …',
            errorDescription: `<muted-text><centered-text>Beim Übertragen der Inhaberschaft für diesen Workspace ist ein Problem aufgetreten. Versuche es erneut oder <concierge-link>wende dich für Hilfe an Concierge</concierge-link>.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Vorsicht!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `Die folgenden Reports wurden bereits zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} exportiert:

${reportName}

Möchtest du sie wirklich noch einmal exportieren?`,
            confirmText: 'Ja, erneut exportieren',
            cancelText: 'Abbrechen',
        },
        upgrade: {
            reportFields: {
                title: 'Berichtsfelder',
                description: `Berichtsfelder ermöglichen es Ihnen, Details auf Kopfzeilenebene anzugeben, die sich von Tags unterscheiden, die sich auf Ausgaben in einzelnen Positionen beziehen. Diese Details können spezielle Projektnamen, Informationen zu Geschäftsreisen, Standorte und mehr umfassen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Berichtsfelder sind nur im Control-Tarif verfügbar, beginnend ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Profitieren Sie von automatischer Synchronisierung und verringern Sie manuelle Eingaben mit der Expensify + NetSuite-Integration. Gewinnen Sie tiefgehende, Echtzeit-Finanzübersichten mit Unterstützung für native und benutzerdefinierte Segmente, einschließlich Projekt- und Kundenzuordnung.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere NetSuite-Integration ist nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Profitieren Sie von automatischer Synchronisierung und reduzieren Sie manuelle Eingaben mit der Expensify + Sage Intacct-Integration. Gewinnen Sie detaillierte, aktuelle Finanzanalysen mit benutzerdefinierten Dimensionen sowie Spesencodierung nach Abteilung, Kategorie, Standort, Kunde und Projekt (Job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere Sage Intacct-Integration ist nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Genießen Sie die automatische Synchronisierung und verringern Sie manuelle Eingaben mit der Integration von Expensify + QuickBooks Desktop. Erzielen Sie maximale Effizienz mit einer Echtzeit-Zwei-Wege-Verbindung und der Spesenkodierung nach Klasse, Artikel, Kunde und Projekt.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere QuickBooks Desktop-Integration ist nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Erweiterte Genehmigungen',
                description: `Wenn du weitere Genehmigungsebenen hinzufügen möchtest – oder einfach sicherstellen willst, dass die höchsten Ausgaben von einer weiteren Person geprüft werden – bist du bei uns richtig. Erweiterte Genehmigungen helfen dir, auf jeder Ebene die richtigen Kontrollen einzurichten, damit du die Ausgaben deines Teams im Griff behältst.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Erweiterte Genehmigungen sind nur im Control-Tarif verfügbar, der bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`} beginnt</muted-text>`,
            },
            categories: {
                title: 'Kategorien',
                description: 'Kategorien ermöglichen es Ihnen, Ausgaben zu verfolgen und zu organisieren. Verwenden Sie unsere Standardkategorien oder fügen Sie Ihre eigenen hinzu.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kategorien sind im Collect-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            glCodes: {
                title: 'Sachkonten',
                description: `Fügen Sie Ihren Kategorien und Tags Sachkonten-Codes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Lohnabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Hauptbuchcodes sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Hauptbuch- & Lohnabrechnungscodes',
                description: `Fügen Sie Ihren Kategorien Sachkonten- und Lohnabrechnungscodes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Lohnabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Sachkonten- und Lohnabrechnungscodes sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Steuercodes',
                description: `Fügen Sie Ihren Steuern Steuerschlüssel hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Lohnabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Steuercodes sind nur im Control-Abo verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            companyCards: {
                title: 'Unbegrenzte Firmenkarten',
                description: `Sie müssen weitere Kartenfeeds hinzufügen? Schalten Sie unbegrenzt viele Firmenkarten frei, um Transaktionen von allen großen Kartenausstellern zu synchronisieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dies ist nur im Control-Tarif verfügbar, beginnend ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            rules: {
                title: 'Regeln',
                description: `Regeln laufen im Hintergrund und halten deine Ausgaben unter Kontrolle, damit du dir um Kleinigkeiten keine Sorgen machen musst.

Fordere Spesendetails wie Belege und Beschreibungen an, lege Limits und Standardwerte fest und automatisiere Genehmigungen und Zahlungen – alles an einem Ort.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Regeln sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            perDiem: {
                title: 'Tagegeld',
                description:
                    'Tagespauschalen sind eine großartige Möglichkeit, Ihre täglichen Kosten konform und vorhersehbar zu halten, wenn Ihre Mitarbeitenden reisen. Profitieren Sie von Funktionen wie benutzerdefinierten Sätzen, Standardkategorien und detaillierteren Angaben wie Reisezielen und Untersätzen.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Spesenpauschalen sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            travel: {
                title: 'Reisen',
                description:
                    'Expensify Travel ist eine neue Plattform für die Buchung und Verwaltung von Geschäftsreisen, mit der Mitglieder Unterkünfte, Flüge, Transportmittel und mehr buchen können.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Reisen ist im Collect-Tarif verfügbar, beginnend ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            reports: {
                title: 'Berichte',
                description: 'Berichte ermöglichen es Ihnen, Ausgaben zur einfacheren Nachverfolgung und Organisation zu gruppieren.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Reports sind im Collect-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Tags auf mehreren Ebenen',
                description:
                    'Mehrstufige Tags helfen Ihnen, Ausgaben mit größerer Genauigkeit nachzuverfolgen. Weisen Sie jedem Posten mehrere Tags zu – etwa Abteilung, Kunde oder Kostenstelle –, um den vollständigen Kontext jeder Ausgabe zu erfassen. Dies ermöglicht detailliertere Berichte, Genehmigungs-Workflows und Buchhaltungs-Exporte.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Mehrstufige Tags sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Entfernungsvergütung',
                description: 'Erstelle und verwalte deine eigenen Sätze, verfolge Entfernungen in Meilen oder Kilometern und lege Standardkategorien für Fahrtkosten fest.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Entfernungsraten sind im Collect-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            auditor: {
                title: 'Prüfer',
                description: 'Prüfer erhalten schreibgeschützten Zugriff auf alle Berichte für vollständige Transparenz und Überwachungs­einhaltung.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Prüfer sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Mehrere Genehmigungsstufen',
                description:
                    'Mehrere Genehmigungsstufen sind ein Workflow-Tool für Unternehmen, die mehr als eine Person benötigen, um einen Bericht zu genehmigen, bevor er erstattet werden kann.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Mehrere Genehmigungsstufen sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'pro aktivem Mitglied pro Monat.',
                perMember: 'pro Mitglied und Monat.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Upgraden Sie, um auf diese Funktion zuzugreifen, oder <a href="${subscriptionLink}">erfahren Sie mehr</a> über unsere Tarife und Preise.</muted-text>`,
            upgradeToUnlock: 'Dieses Feature freischalten',
            completed: {
                headline: `Du hast deinen Workspace aktualisiert!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Sie haben ${policyName} erfolgreich auf den Control-Tarif hochgestuft! <a href="${subscriptionLink}">Abonnement anzeigen</a> für weitere Details.</centered-text>`,
                categorizeMessage: `Du hast dein Konto erfolgreich auf den Collect‑Tarif umgestellt. Jetzt kannst du deine Ausgaben kategorisieren!`,
                travelMessage: `Du hast erfolgreich auf den Collect-Tarif upgegradet. Jetzt kannst du mit der Buchung und Verwaltung von Reisen beginnen!`,
                distanceRateMessage: `Du hast erfolgreich auf den Collect-Tarif upgegradet. Jetzt kannst du den Kilometersatz ändern!`,
                gotIt: 'Verstanden, danke',
                createdWorkspace: `Du hast einen Workspace erstellt!`,
            },
            commonFeatures: {
                title: 'Auf den Control-Tarif upgraden',
                note: 'Schalte unsere leistungsstärksten Funktionen frei, darunter:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Der Control-Tarif beginnt bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied pro Monat.`}. <a href="${learnMoreMethodsRoute}">Erfahre mehr</a> über unsere Tarife und Preise.</muted-text>`,
                    benefit1: 'Erweiterte Buchhaltungsverbindungen (NetSuite, Sage Intacct und mehr)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Mehrstufige Genehmigungs-Workflows',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    toUpgrade: 'Zum Aktualisieren klicken',
                    selectWorkspace: 'Wähle einen Workspace aus und ändere den Plantyp in',
                },
                upgradeWorkspaceWarning: 'Arbeitsbereich kann nicht aktualisiert werden',
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt:
                    'Ihr Unternehmen hat die Erstellung von Arbeitsbereichen eingeschränkt. Bitte wenden Sie sich an einen Administrator.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Zum Collect-Tarif wechseln',
                note: 'Wenn du ein Downgrade durchführst, verlierst du den Zugriff auf diese und weitere Funktionen:',
                benefits: {
                    note: 'Eine vollständige Übersicht über unsere Tarife finden Sie in unserer',
                    pricingPage: 'Preisseite',
                    confirm: 'Sind Sie sicher, dass Sie ein Downgrade durchführen und Ihre Konfigurationen entfernen möchten?',
                    warning: 'Dies kann nicht rückgängig gemacht werden.',
                    benefit1: 'Buchhaltungsverbindungen (außer QuickBooks Online und Xero)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Mehrstufige Genehmigungs-Workflows',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    headsUp: 'Achtung!',
                    multiWorkspaceNote:
                        'Du musst alle deine Arbeitsbereiche herabstufen, bevor deine erste monatliche Zahlung fällig wird, um ein Abonnement zum Collect-Tarif zu starten. Klicke',
                    selectStep: '> Wählen Sie jeden Workspace aus > ändern Sie den Plantyp in',
                },
            },
            completed: {
                headline: 'Ihr Workspace wurde herabgestuft',
                description: 'Du hast weitere Workspaces im Control-Tarif. Damit alle zum Collect-Tarif abgerechnet werden, musst du alle Workspaces herabstufen.',
                gotIt: 'Verstanden, danke',
            },
        },
        payAndDowngrade: {
            title: 'Bezahlen & Downgrade',
            headline: 'Ihre endgültige Zahlung',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Ihre letzte Rechnung für dieses Abonnement beträgt <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Sieh dir unten deine Aufschlüsselung für ${date} an:`,
            subscription:
                'Achtung! Diese Aktion beendet dein Expensify‑Abonnement, löscht diesen Workspace und entfernt alle Workspace-Mitglieder. Wenn du diesen Workspace behalten und nur dich selbst entfernen möchtest, lass zuerst einen anderen Admin die Abrechnung übernehmen.',
            genericFailureMessage: 'Beim Bezahlen Ihrer Rechnung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        restrictedAction: {
            restricted: 'Eingeschränkt',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Aktionen im Workspace ${workspaceName} sind derzeit eingeschränkt`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Der Workspace-Inhaber ${workspaceOwnerName} muss die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Workspace-Aktivitäten freizuschalten.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Du musst die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Aktivitäten im Workspace freizuschalten.',
            addPaymentCardToUnlock: 'Füge eine Zahlungskarte hinzu, um sie freizuschalten!',
            addPaymentCardToContinueUsingWorkspace: 'Fügen Sie eine Zahlungskarte hinzu, um diesen Workspace weiterhin zu nutzen',
            pleaseReachOutToYourWorkspaceAdmin: 'Wende dich bei Fragen bitte an den Admin deines Arbeitsbereichs.',
            chatWithYourAdmin: 'Mit Ihrem Admin chatten',
            chatInAdmins: 'Im Kanal #admins chatten',
            addPaymentCard: 'Zahlungskarte hinzufügen',
            goToSubscription: 'Zu Abonnement',
        },
        rules: {
            individualExpenseRules: {
                title: 'Ausgaben',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Legen Sie Ausgabenkontrollen und Standardwerte für einzelne Ausgaben fest. Sie können auch Regeln für <a href="${categoriesPageLink}">Kategorien</a> und <a href="${tagsPageLink}">Tags</a> erstellen.</muted-text>`,
                receiptRequiredAmount: 'Erforderlicher Belegbetrag',
                receiptRequiredAmountDescription: 'Belege verlangen, wenn die Ausgaben diesen Betrag überschreiten, sofern dies nicht durch eine Kategorienregel außer Kraft gesetzt wird.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `Der Betrag darf nicht höher sein als der für detaillierte Belege erforderliche Betrag (${amount})`,
                itemizedReceiptRequiredAmount: 'Detaillierter Beleg erforderlicher Betrag',
                itemizedReceiptRequiredAmountDescription:
                    'Detaillierte Belege anfordern, wenn die Ausgaben diesen Betrag überschreiten, es sei denn, eine Kategorievorschrift hebt dies auf.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `Der Betrag darf nicht niedriger sein als der für reguläre Belege erforderliche Betrag (${amount})`,
                maxExpenseAmount: 'Maximaler Spesenbetrag',
                maxExpenseAmountDescription: 'Ausgaben kennzeichnen, die diesen Betrag überschreiten, sofern sie nicht durch eine Kategorienregel außer Kraft gesetzt werden.',
                maxAge: 'Maximales Alter',
                maxExpenseAge: 'Maximales Ausgabenalter',
                maxExpenseAgeDescription: 'Ausgaben kennzeichnen, die älter als eine bestimmte Anzahl von Tagen sind.',
                maxExpenseAgeDays: () => ({
                    one: '1 Tag',
                    other: (count: number) => `${count} Tage`,
                }),
                cashExpenseDefault: 'Standardwert für Barausgabe',
                cashExpenseDefaultDescription:
                    'Wähle aus, wie Barausgaben erstellt werden sollen. Eine Ausgabe gilt als Barausgabe, wenn sie keine importierte Firmenkarten-Transaktion ist. Dazu gehören manuell erstellte Ausgaben, Belege, Pauschalen, Entfernungs- und Zeitausgaben.',
                reimbursableDefault: 'Erstattungsfähig',
                reimbursableDefaultDescription: 'Auslagen werden am häufigsten an Mitarbeitende zurückerstattet',
                nonReimbursableDefault: 'Nicht erstattungsfähig',
                nonReimbursableDefaultDescription: 'Auslagen werden gelegentlich an Mitarbeitende zurückerstattet',
                alwaysReimbursable: 'Immer erstattungsfähig',
                alwaysReimbursableDescription: 'Ausgaben werden immer an Mitarbeitende zurückerstattet',
                alwaysNonReimbursable: 'Immer nicht erstattungsfähig',
                alwaysNonReimbursableDescription: 'Auslagen werden Mitarbeitern niemals zurückerstattet',
                billableDefault: 'Standardmäßige Verrechenbarkeit',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Wählen Sie, ob Bar- und Kreditkartenausgaben standardmäßig verrechenbar sein sollen. Verrechenbare Ausgaben werden in <a href="${tagsPageLink}">Tags</a> aktiviert oder deaktiviert.</muted-text>`,
                billable: 'Verrechenbar',
                billableDescription: 'Ausgaben werden am häufigsten an Kunden weiterberechnet',
                nonBillable: 'Nicht abrechenbar',
                nonBillableDescription: 'Spesen werden gelegentlich den Kunden erneut in Rechnung gestellt',
                eReceipts: 'eReceipts',
                eReceiptsHint: `eBelege werden automatisch [für die meisten Kreditkartentransaktionen in USD](${CONST.DEEP_DIVE_ERECEIPTS}) erstellt.`,
                attendeeTracking: 'Teilnehmerverfolgung',
                attendeeTrackingHint: 'Verfolge die Kosten pro Person für jede Ausgabe.',
                prohibitedDefaultDescription:
                    'Markiere alle Belege, auf denen Alkohol, Glücksspiele oder andere eingeschränkte Artikel erscheinen. Spesen mit Belegen, auf denen diese Posten vorkommen, erfordern eine manuelle Prüfung.',
                prohibitedExpenses: 'Unzulässige Ausgaben',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Nebenkosten im Hotel',
                gambling: 'Glücksspiel',
                tobacco: 'Tabak',
                adultEntertainment: 'Unterhaltung für Erwachsene',
                requireCompanyCard: 'Firmenkarten für alle Einkäufe erforderlich machen',
                requireCompanyCardDescription: 'Kennzeichnen Sie alle Barausgaben, einschließlich Kilometer- und Tagegeldspesen.',
            },
            expenseReportRules: {
                title: 'Fortgeschritten',
                subtitle: 'Automatisieren Sie die Einhaltung von Spesenrichtlinien, Genehmigungen und Zahlungen.',
                preventSelfApprovalsTitle: 'Selbstgenehmigungen verhindern',
                preventSelfApprovalsSubtitle: 'Verhindern Sie, dass Workspace-Mitglieder ihre eigenen Spesenberichte genehmigen.',
                autoApproveCompliantReportsTitle: 'Regelkonforme Berichte automatisch genehmigen',
                autoApproveCompliantReportsSubtitle: 'Legen Sie fest, welche Spesenabrechnungen für die automatische Genehmigung infrage kommen.',
                autoApproveReportsUnderTitle: 'Berichte automatisch genehmigen unter',
                autoApproveReportsUnderDescription: 'Vollständig konforme Spesenberichte unter diesem Betrag werden automatisch genehmigt.',
                randomReportAuditTitle: 'Stichprobenprüfung von Berichten',
                randomReportAuditDescription: 'Erfordert, dass einige Berichte manuell genehmigt werden, selbst wenn sie für die automatische Genehmigung in Frage kommen.',
                autoPayApprovedReportsTitle: 'Automatische Bezahlung genehmigter Berichte',
                autoPayApprovedReportsSubtitle: 'Legen Sie fest, welche Spesenabrechnungen für die automatische Zahlung berechtigt sind.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Bitte geben Sie einen Betrag ein, der kleiner als ${currency ?? ''}20.000 ist`,
                autoPayApprovedReportsLockedSubtitle: 'Gehen Sie zu „Weitere Funktionen“ und aktivieren Sie „Workflows“, dann fügen Sie „Zahlungen“ hinzu, um diese Funktion freizuschalten.',
                autoPayReportsUnderTitle: 'Berichte automatisch bezahlen unter',
                autoPayReportsUnderDescription: 'Vollständig konforme Spesenabrechnungen unter diesem Betrag werden automatisch bezahlt.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Fügen Sie ${featureName} hinzu, um diese Funktion freizuschalten.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Gehe zu [Weitere Funktionen](${moreFeaturesLink}) und aktiviere ${featureName}, um diese Funktion freizuschalten.`,
            },
            categoryRules: {
                title: 'Kategorierichtlinien',
                approver: 'Genehmiger',
                requireDescription: 'Beschreibung erforderlich',
                requireFields: 'Felder verpflichtend machen',
                requiredFieldsTitle: 'Pflichtfelder',
                requiredFieldsDescription: (categoryName: string) => `Dies gilt für alle Ausgaben, die als <strong>${categoryName}</strong> kategorisiert sind.`,
                requireAttendees: 'Teilnehmer erforderlich machen',
                descriptionHint: 'Hinweis zur Beschreibung',
                descriptionHintDescription: (categoryName: string) =>
                    `Mitarbeitende daran erinnern, zusätzliche Informationen für Ausgaben der Kategorie „${categoryName}“ anzugeben. Dieser Hinweis erscheint im Beschreibungsfeld von Ausgaben.`,
                descriptionHintLabel: 'Hinweis',
                descriptionHintSubtitle: 'Profi-Tipp: Je kürzer, desto besser!',
                maxAmount: 'Maximalbetrag',
                flagAmountsOver: 'Beträge kennzeichnen über',
                flagAmountsOverDescription: (categoryName: string) => `Gilt für die Kategorie „${categoryName}“.`,
                flagAmountsOverSubtitle: 'Dies überschreibt den Maximalbetrag für alle Ausgaben.',
                expenseLimitTypes: {
                    expense: 'Einzelausgabe',
                    expenseSubtitle: 'Spesenkosten nach Kategorie kennzeichnen. Diese Regel überschreibt die allgemeine Workspace-Regel für den maximalen Spesenbetrag.',
                    daily: 'Kategoriesumme',
                    dailySubtitle: 'Gesamtausgaben pro Kategorie pro Tag je Spesenbericht kennzeichnen.',
                },
                requireReceiptsOver: 'Belege erforderlich über',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standard`,
                    never: 'Belege nie erforderlich',
                    always: 'Quittungen immer erforderlich',
                },
                requireItemizedReceiptsOver: 'Detaillierte Belege über erforderlich',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standard`,
                    never: 'Detaillierte Belege niemals verlangen',
                    always: 'Immer detaillierte Belege anfordern',
                },
                defaultTaxRate: 'Standardsteuersatz',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Gehe zu [Weitere Funktionen](${moreFeaturesLink}) und aktiviere Workflows. Füge dann Genehmigungen hinzu, um diese Funktion freizuschalten.`,
            },
            customRules: {
                title: 'Spesenrichtlinie',
                cardSubtitle: 'Hier befindet sich die Spesenrichtlinie eures Teams, damit alle genau wissen, was abgedeckt ist.',
            },
            merchantRules: {
                title: 'Händler',
                subtitle: 'Legen Sie Händlerregeln fest, damit Ausgaben korrekt codiert ankommen und weniger Nachbearbeitung erfordern.',
                addRule: 'Händlerregel hinzufügen',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `Wenn Händler ${isExactMatch ? 'stimmt genau überein' : 'enthält'} „${merchantName}“`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Händler in „${merchantName}“ umbenennen`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `Aktualisiere ${fieldName} zu „${fieldValue}“`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Als "${reimbursable ? 'erstattungsfähig' : 'nicht erstattungsfähig'}" markieren`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Als „${billable ? 'Abrechenbar' : 'nicht abrechenbar'}“ markieren`,
                addRuleTitle: 'Regel hinzufügen',
                expensesWith: 'Für Ausgaben mit:',
                applyUpdates: 'Diese Updates anwenden:',
                saveRule: 'Regel speichern',
                confirmError: 'Geben Sie den Händler ein und nehmen Sie mindestens eine Änderung vor',
                confirmErrorMerchant: 'Bitte geben Sie den Händler ein',
                confirmErrorUpdate: 'Bitte wenden Sie mindestens eine Aktualisierung an',
                editRuleTitle: 'Regel bearbeiten',
                deleteRule: 'Regel löschen',
                deleteRuleConfirmation: 'Sind Sie sicher, dass Sie diese Regel löschen möchten?',
                previewMatches: 'Übereinstimmungen anzeigen',
                previewMatchesEmptyStateTitle: 'Nichts anzuzeigen',
                previewMatchesEmptyStateSubtitle: 'Keine nicht eingereichten Ausgaben entsprechen dieser Regel.',
                matchType: 'Abgleichstyp',
                matchTypeContains: 'Enthält',
                matchTypeExact: 'Exakte Übereinstimmung',
                expensesExactlyMatching: 'Für Ausgaben mit genau folgender Übereinstimmung:',
                duplicateRuleTitle: 'Eine ähnliche Händlerregel existiert bereits',
                duplicateRulePrompt: (merchantName: string) => `Möchten Sie eine neue Regel für „${merchantName}“ speichern, obwohl Sie bereits eine vorhandene haben?`,
                saveAnyway: 'Trotzdem speichern',
                applyToExistingUnsubmittedExpenses: 'Auf bereits vorhandene, noch nicht eingereichte Ausgaben anwenden',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Einziehen',
                    description: 'Für Teams, die ihre Prozesse automatisieren möchten.',
                },
                corporate: {
                    label: 'Kontrolle',
                    description: 'Für Unternehmen mit erweiterten Anforderungen.',
                },
            },
            description: 'Wählen Sie den Tarif, der zu Ihnen passt. Eine detaillierte Liste der Funktionen und Preise finden Sie in unserer',
            subscriptionLink: 'Hilfeseite zu Tariftypen und Preisen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Du hast dich bis zum Ende deines Jahresabonnements am ${annualSubscriptionEndDate} zu 1 aktivem Mitglied im Control-Tarif verpflichtet. Du kannst ab dem ${annualSubscriptionEndDate} zu einem nutzungsbasierten Abonnement wechseln und auf den Collect-Tarif downgraden, indem du die automatische Verlängerung deaktivierst in`,
                other: `Sie haben sich bis zum Ende Ihres Jahresabonnements am ${annualSubscriptionEndDate} zu ${count} aktiven Mitgliedern im Control-Tarif verpflichtet. Sie können ab dem ${annualSubscriptionEndDate} zu einem nutzungsbasierten Abonnement wechseln und auf den Collect-Tarif downgraden, indem Sie die automatische Verlängerung deaktivieren in`,
            }),
            subscriptions: 'Abonnements',
        },
    },
    getAssistancePage: {
        title: 'Hilfe erhalten',
        subtitle: 'Wir sind hier, um dir den Weg zur Größe zu ebnen!',
        description: 'Wähle eine der folgenden Supportoptionen:',
        chatWithConcierge: 'Chat mit Concierge',
        scheduleSetupCall: 'Einrichtungstermin vereinbaren',
        scheduleACall: 'Anruf planen',
        questionMarkButtonTooltip: 'Holen Sie sich Unterstützung von unserem Team',
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
        privateDescription: 'Personen, die zu diesem Raum eingeladen wurden, können ihn finden',
        publicDescription: 'Jeder kann diesen Raum finden',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Jeder kann diesen Raum finden',
        createRoom: 'Raum erstellen',
        roomAlreadyExistsError: 'Ein Raum mit diesem Namen existiert bereits',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} ist ein Standardraum in allen Workspaces. Bitte wähle einen anderen Namen.`,
        roomNameInvalidError: 'Raumnamen dürfen nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
        pleaseEnterRoomName: 'Bitte gib einen Raumnamen ein',
        pleaseSelectWorkspace: 'Bitte wähle einen Workspace aus',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor} wurde umbenannt in „${newName}“ (zuvor „${oldName}“)` : `${actor}hat diesen Raum in „${newName}“ umbenannt (zuvor „${oldName}“)`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Raum umbenannt in ${newName}`,
        social: 'Sozial',
        selectAWorkspace: 'Arbeitsbereich auswählen',
        growlMessageOnRenameError: 'Workspace-Raum kann nicht umbenannt werden. Bitte überprüfe deine Verbindung und versuche es erneut.',
        visibilityOptions: {
            restricted: 'Workspace', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privat',
            public: 'Öffentlich',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Öffentliche Ankündigung',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Senden und schließen',
        submitAndApprove: 'Einreichen und Genehmigen',
        advanced: 'Erweitert',
        dynamicExternal: 'DYNAMISCH_EXTERN',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `Firmenadresse geändert zu „${newAddress}“ (zuvor „${previousAddress}“)` : `Unternehmensadresse auf „${newAddress}“ festlegen`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `${approverName} (${approverEmail}) als Genehmiger für das Feld ${field} „${name}“ hinzugefügt`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `hat ${approverName} (${approverEmail}) als Genehmigenden für das ${field} „${name}“ entfernt`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `Genehmigende Person für ${field} „${name}“ zu ${formatApprover(newApproverName, newApproverEmail)} geändert (zuvor ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `hat die Kategorie „${categoryName}“ hinzugefügt`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `hat die Kategorie „${categoryName}“ entfernt`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'deaktiviert' : 'aktiviert'} die Kategorie „${categoryName}“`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `den Gehaltsabrechnungscode „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            if (!newValue && oldValue) {
                return `hat den Lohnabrechnungscode „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `hat den Gehaltsabrechnungscode der Kategorie „${categoryName}“ in „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `den Hauptbuchcode „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            if (!newValue && oldValue) {
                return `hat den Hauptbuchcode „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `den Kontenplan-Code der Kategorie „${categoryName}“ in „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `Beschreibung der Kategorie „${categoryName}“ in ${!oldValue ? 'Erforderlich' : 'nicht erforderlich'} geändert (zuvor ${!oldValue ? 'nicht erforderlich' : 'Erforderlich'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `einen maximalen Betrag von ${newAmount} zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            if (oldAmount && !newAmount) {
                return `hat den Maximalbetrag von ${oldAmount} aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `hat den Maximalbetrag der Kategorie „${categoryName}“ auf ${newAmount} geändert (zuvor ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `hat einen Grenzwerttyp von ${newValue} zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            return `den Kategoriegrenztyp von „${categoryName}“ zu ${newValue} geändert (zuvor ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `Kategorie „${categoryName}“ aktualisiert, indem Belege in ${newValue} geändert wurden`;
            }
            return `Kategorie „${categoryName}“ zu ${newValue} geändert (zuvor ${oldValue})`;
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
                return `den Beschreibungshinweis „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return !oldValue
                ? `den Beschreibungshinweis „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`
                : `den Beschreibungshinweis der Kategorie „${categoryName}“ zu „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `hat den Tag-Listen-Namen in „${newName}“ geändert (zuvor „${oldName}“)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `hat das Tag „${tagName}“ zur Liste „${tagListName}“ hinzugefügt`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) =>
            `die Tag-Liste „${tagListName}“ aktualisiert, indem das Tag „${oldName}“ in „${newName}“ geändert wurde`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'aktiviert' : 'deaktiviert'} das Tag „${tagName}“ in der Liste „${tagListName}“`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `den Tag „${tagName}“ aus der Liste „${tagListName}“ entfernt`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `„${count}“ Tags aus der Liste „${tagListName}“ entfernt`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `hat das Tag „${tagName}“ in der Liste „${tagListName}“ aktualisiert, indem ${updatedField} in „${newValue}“ geändert wurde (zuvor „${oldValue}“)`;
            }
            return `hat das Tag „${tagName}“ in der Liste „${tagListName}“ aktualisiert, indem ein(e) ${updatedField} mit dem Wert „${newValue}“ hinzugefügt wurde`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `den/die/das ${customUnitName} ${updatedField} in „${newValue}“ geändert (zuvor „${oldValue}“)`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'aktiviert' : 'deaktiviert'} Steuerverfolgung bei Entfernungsraten`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `hat einen neuen „${customUnitName}“-Satz „${rateName}“ hinzugefügt`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `hat den Satz für ${customUnitName} ${updatedField} „${customUnitRateName}“ auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `den Steuersatz für den Entfernungssatz „${customUnitRateName}“ zu „${newValue} (${newTaxPercentage})“ geändert (zuvor „${oldValue} (${oldTaxPercentage})“)`;
            }
            return `den Steuersatz „${newValue} (${newTaxPercentage})“ zum Kilometersatz „${customUnitRateName}“ hinzugefügt`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `hat den erstattungsfähigen Steueranteil am Distanzsatz „${customUnitRateName}“ auf „${newValue}“ geändert (zuvor „${oldValue}“)`;
            }
            return `hat einen steuererstattungsfähigen Anteil von „${newValue}“ zum Entfernungssatz „${customUnitRateName}“ hinzugefügt`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? 'aktiviert' : 'deaktiviert'} den ${customUnitName}-Satz „${customUnitRateName}“`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `hat den Preis „${rateName}“ für „${customUnitName}“ entfernt`,
        addedReportField: (fieldType: string, fieldName?: string) => `${fieldType}-Berichtsfield „${fieldName}“ hinzugefügt`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `Standardwert des Berichtsfelds „${fieldName}“ auf „${defaultValue}“ festlegen`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `die Option „${optionName}“ zum Berichts­feld „${fieldName}“ hinzugefügt`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `hat die Option „${optionName}“ aus dem Berichtsfeld „${fieldName}“ entfernt`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'aktiviert' : 'deaktiviert'} die Option „${optionName}“ für das Berichtsfeld „${fieldName}“`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'aktiviert' : 'deaktiviert'} alle Optionen für das Berichtsfeld „${fieldName}“`;
            }
            return `${allEnabled ? 'aktiviert' : 'deaktiviert'} die Option "${optionName}" für das Berichtsfeld "${fieldName}", sodass alle Optionen ${allEnabled ? 'aktiviert' : 'deaktiviert'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `${fieldType}-Berichts­feld „${fieldName}“ entfernt`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `„Verhinderung der Selbstgenehmigung“ aktualisiert auf „${newValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}“ (zuvor „${oldValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}“)`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `Das Datum für die monatliche Berichtseinreichung auf „${newValue}“ festlegen`;
            }
            return `das monatliche Berichtseinreichungsdatum auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `„Spesen an Kunden weiterberechnen“ wurde auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `„Standard für Barausgaben“ auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `„Standard-Berichtstitel erzwingen“ ${value ? 'Ein' : 'Aus'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `hat den Namen dieses Workspace in „${newName}“ geändert (zuvor „${oldName}“)`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `die Beschreibung dieses Arbeitsbereichs auf „${newDescription}“ festlegen`
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
                one: `hat dich aus dem Genehmigungsworkflow und dem Spesen-Chat von ${joinedNames} entfernt. Bereits eingereichte Berichte bleiben in deinem Posteingang zur Genehmigung verfügbar.`,
                other: `hat dich aus den Genehmigungsabläufen und Spesen-Chats von ${joinedNames} entfernt. Bereits eingereichte Reports bleiben in deinem Posteingang zur Genehmigung verfügbar.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `hat deine Rolle in ${policyName} von ${oldRole} zu Nutzer aktualisiert. Du wurdest aus allen Ausgabenchats von Einreichenden entfernt, außer aus deinen eigenen.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `Standardwährung auf ${newCurrency} aktualisiert (zuvor ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `die automatische Berichtshäufigkeit auf „${newFrequency}“ aktualisiert (zuvor „${oldFrequency}“)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `den Genehmigungsmodus auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        upgradedWorkspace: 'hat diesen Workspace auf den Control-Tarif hochgestuft',
        forcedCorporateUpgrade: `Dieser Workspace wurde auf den Control-Tarif aktualisiert. Klicken Sie <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">hier</a> für weitere Informationen.`,
        downgradedWorkspace: 'hat diesen Workspace auf den Collect-Tarif herabgestuft',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `hat den Prozentsatz der Berichte, die zufällig zur manuellen Genehmigung weitergeleitet werden, auf ${Math.round(newAuditRate * 100)}% geändert (zuvor ${Math.round(oldAuditRate * 100)}%)`,
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
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? 'aktiviert' : 'deaktiviert'} Teilnehmerverfolgung`,
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `Standardgenehmiger auf ${newApprover} geändert (zuvor ${previousApprover})` : `den Standardgenehmiger auf ${newApprover} geändert`,
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
            let text = `hat den Genehmigungsworkflow für ${members} geändert, sodass Berichte an ${approver} eingereicht werden`;
            if (wasDefaultApprover && previousApprover) {
                text += `(bisheriger Standardgenehmiger ${previousApprover})`;
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
                ? `hat den Genehmigungsworkflow für ${members} so geändert, dass Berichte an den Standardgenehmiger ${approver} eingereicht werden`
                : `den Genehmigungsworkflow für ${members} geändert, sodass Berichte beim Standardgenehmiger eingereicht werden`;
            if (wasDefaultApprover && previousApprover) {
                text += `(bisheriger Standardgenehmiger ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(früher Standardgenehmiger)';
            } else if (previousApprover) {
                text += `(zuvor ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `Genehmigungsworkflow für ${approver} geändert, um genehmigte Berichte an ${forwardsTo} weiterzuleiten (zuvor weitergeleitet an ${previousForwardsTo})`
                : `Genehmigungs-Workflow für ${approver} geändert, um genehmigte Berichte an ${forwardsTo} weiterzuleiten (zuvor endgültig genehmigte Berichte)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `hat den Genehmigungsworkflow für ${approver} so geändert, dass genehmigte Berichte nicht mehr weitergeleitet werden (zuvor weitergeleitet an ${previousForwardsTo})`
                : `hat den Genehmigungsworkflow für ${approver} so geändert, dass genehmigte Berichte nicht mehr weitergeleitet werden`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'aktiviert' : 'deaktiviert'} Erstattungen`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `die Steuer „${taxName}“ hinzugefügt`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `hat die Steuer „${taxName}“ entfernt`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `die Steuer „${oldValue}“ in „${newValue}“ umbenannt`;
                }
                case 'code': {
                    return `hat den Steuerschlüssel für „${taxName}“ von „${oldValue}“ in „${newValue}“ geändert`;
                }
                case 'rate': {
                    return `Steuersatz für „${taxName}“ von „${oldValue}“ auf „${newValue}“ geändert`;
                }
                case 'enabled': {
                    return `${oldValue ? 'deaktiviert' : 'aktiviert'} die Steuer „${taxName}“`;
                }
                default: {
                    return '';
                }
            }
        },
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `das Standardgeschäftsbankkonto auf „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}“ festlegen`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `das Standard-Geschäftsbankkonto „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}“ entfernt`,
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
            `Standard-Geschäftsbankkonto geändert zu „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}“ (zuvor „${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}“)`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `den Firmennamen der Rechnung in „${newValue}“ geändert (zuvor „${oldValue}“)` : `den Rechnungsfirmennamen auf „${newValue}“ festlegen`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `die Firmenwebsite der Rechnung wurde in „${newValue}“ geändert (zuvor „${oldValue}“)` : `setzen Sie die Firmenwebsite der Rechnung auf „${newValue}“`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `benutzerdefinierte Berichtsnamensformel in „${newValue}“ geändert (zuvor „${oldValue}“)`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser ? `hat den autorisierten Zahler in „${newReimburser}“ geändert (zuvor „${previousReimburser}“)` : `den autorisierten Zahler in „${newReimburser}“ geändert`,
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `erforderlichen Belegbetrag auf „${newValue}“ festlegen`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `Betrag für erforderlichen Beleg auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `Betrag für erforderlichen Beleg entfernt (zuvor „${oldValue}“)`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximalen Spesenbetrag auf „${newValue}“ festlegen`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximalen Ausgabenbetrag auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximalen Ausgabenbetrag entfernt (zuvor „${oldValue}“)`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximales Ausgabenalter auf „${newValue}“ Tage festlegen`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximales Ausgabenalter auf „${newValue}“ Tage geändert (zuvor „${oldValue}“)`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximales Ausgabenalter entfernt (zuvor „${oldValue}“ Tage)`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? 'aktiviert' : 'Deaktiviert'} automatisch bezahlte genehmigte Berichte`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `Stelle den Schwellenwert für die automatische Zahlung genehmigter Berichte auf „${newLimit}“ ein`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `den Schwellenwert für die automatische Bezahlung genehmigter Berichte auf „${newLimit}“ geändert (zuvor „${oldLimit}“)`,
        removedAutoPayApprovedReportsLimit: 'den Grenzwert für automatisch bezahlte genehmigte Reports entfernt',
    },
    roomMembersPage: {
        memberNotFound: 'Mitglied nicht gefunden.',
        useInviteButton: 'Um ein neues Mitglied zum Chat einzuladen, verwende bitte die Einladungsschaltfläche oben.',
        notAuthorized: `Du hast keinen Zugriff auf diese Seite. Wenn du versuchst, diesem Raum beizutreten, bitte einfach ein Raummitglied, dich hinzuzufügen. Etwas anderes? Wende dich an ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Es sieht so aus, als wäre dieser Raum archiviert worden. Bei Fragen wende dich an ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Sind Sie sicher, dass Sie ${memberName} aus dem Raum entfernen möchten?`,
            other: 'Bist du sicher, dass du die ausgewählten Mitglieder aus dem Raum entfernen möchtest?',
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
        pleaseEnterTaskName: 'Bitte geben Sie einen Titel ein',
        pleaseEnterTaskDestination: 'Bitte wählen Sie aus, wo Sie diese Aufgabe teilen möchten',
    },
    task: {
        task: 'Aufgabe',
        title: 'Titel',
        description: 'Beschreibung',
        assignee: 'Beauftragte/r',
        completed: 'Abgeschlossen',
        action: 'Abschließen',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `Aufgabe für ${title}`,
            completed: 'als erledigt markiert',
            canceled: 'Gelöschte Aufgabe',
            reopened: 'als unvollständig markiert',
            error: 'Du hast keine Berechtigung, die angeforderte Aktion auszuführen',
        },
        markAsComplete: 'Als erledigt markieren',
        markAsIncomplete: 'Als unvollständig markieren',
        assigneeError: 'Bei der Zuweisung dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie es mit einer anderen zuständigen Person.',
        genericCreateTaskFailureMessage: 'Beim Erstellen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
        deleteTask: 'Aufgabe löschen',
        deleteConfirmation: 'Möchten Sie diese Aufgabe wirklich löschen?',
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
            newChat: 'Neuer Chatbildschirm',
            copy: 'Kommentar kopieren',
            openDebug: 'Dialogfeld für Testeinstellungen öffnen',
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
                subtitle: 'Erstelle eine Ausgabe oder mache eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwende den grünen Button unten, um eine Ausgabe zu erstellen.',
            },
            emptyReportResults: {
                title: 'Du hast noch keine Berichte erstellt',
                subtitle: 'Erstellen Sie einen Bericht oder machen Sie eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwende die grüne Schaltfläche unten, um einen Bericht zu erstellen.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Du hast noch keine
                    Rechnungen erstellt
                `),
                subtitle: 'Senden Sie eine Rechnung oder machen Sie eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwende die grüne Schaltfläche unten, um eine Rechnung zu senden.',
            },
            emptyTripResults: {
                title: 'Keine Reisen zum Anzeigen',
                subtitle: 'Beginnen Sie, indem Sie unten Ihre erste Reise buchen.',
                buttonText: 'Reise buchen',
            },
            emptySubmitResults: {
                title: 'Keine Ausgaben zur Einreichung',
                subtitle: 'Alles erledigt. Dreh eine Ehrenrunde!',
                buttonText: 'Bericht erstellen',
            },
            emptyApproveResults: {
                title: 'Keine Ausgaben zum Genehmigen',
                subtitle: 'Null Spesen. Maximale Entspannung. Gut gemacht!',
            },
            emptyPayResults: {
                title: 'Keine Ausgaben zu bezahlen',
                subtitle: 'Glückwunsch! Sie haben die Ziellinie überquert.',
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
                title: 'Keine Ausgaben zum Genehmigen',
                subtitle: 'Null Spesen. Maximale Entspannung. Gut gemacht!',
            },
        },
        columns: 'Spalten',
        resetColumns: 'Spalten zurücksetzen',
        groupColumns: 'Gruppenspalten',
        expenseColumns: 'Spalten für Ausgaben',
        statements: 'Abrechnungen',
        unapprovedCash: 'Nicht genehmigtes Bargeld',
        unapprovedCard: 'Nicht genehmigte Karte',
        reconciliation: 'Abstimmung',
        saveSearch: 'Suche speichern',
        deleteSavedSearch: 'Gespeicherte Suche löschen',
        deleteSavedSearchConfirm: 'Möchten Sie diese Suche wirklich löschen?',
        searchName: 'Name suchen',
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
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Dieser Monat',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: 'Laufendes Jahr',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Letzter Kontoauszug',
                },
            },
            status: 'Status',
            keyword: 'Schlüsselwort',
            keywords: 'Schlüsselwörter',
            limit: 'Limit',
            limitDescription: 'Legen Sie eine Obergrenze für die Ergebnisse Ihrer Suche fest.',
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
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Alle CSV-importierten Karten${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} ist ${value}`,
            current: 'Aktuell',
            past: 'Vergangenheit',
            submitted: 'Eingereicht',
            approved: 'Genehmigt',
            paid: 'Bezahlt',
            exported: 'Exportiert',
            posted: 'Gebucht',
            withdrawn: 'Zurückgezogen',
            billable: 'Verrechenbar',
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
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Exportieren',
            },
        },
        has: 'Hat',
        groupBy: 'Gruppieren nach',
        moneyRequestReport: {
            emptyStateTitle: 'Dieser Bericht enthält keine Ausgaben.',
            accessPlaceHolder: 'Für Details öffnen',
        },
        noCategory: 'Keine Kategorie',
        noMerchant: 'Kein Händler',
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
            description: 'Wow, das sind viele Elemente! Wir bündeln sie, und Concierge sendet dir in Kürze eine Datei.',
        },
        exportedTo: 'Exported to',
        exportAll: {
            selectAllMatchingItems: 'Alle passenden Elemente auswählen',
            allMatchingItemsSelected: 'Alle passenden Elemente ausgewählt',
        },
        topSpenders: 'Top-Ausgaben',
        view: {label: 'Ansehen', table: 'Tabelle', bar: 'Bar'},
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
    },
    genericErrorPage: {
        title: 'Oh je, etwas ist schiefgelaufen!',
        body: {
            helpTextMobile: 'Bitte schließen Sie die App und öffnen Sie sie erneut, oder wechseln Sie zu',
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
                'Überprüfe deinen Fotos- oder Downloads-Ordner auf eine Kopie deines QR-Codes. Profi-Tipp: Füge ihn einer Präsentation hinzu, damit dein Publikum ihn scannen und sich direkt mit dir verbinden kann.',
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
            cleared: 'Abgeglichen',
            failed: 'Fehlgeschlagen',
        },
        failedError: ({link}: {link: string}) => `Wir werden diese Ausgleichszahlung erneut versuchen, sobald du dein Konto <a href="${link}">entsperrt hast</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • Auszahlungs-ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Berichts-Layout',
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
            createExpense: 'Ausgabe erstellen',
            createReport: 'Bericht erstellen',
            chooseWorkspace: 'Wähle einen Arbeitsbereich für diesen Bericht aus.',
            emptyReportConfirmationTitle: 'Du hast bereits einen leeren Bericht',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Sind Sie sicher, dass Sie einen weiteren Bericht in ${workspaceName} erstellen möchten? Sie können auf Ihre leeren Berichte zugreifen in`,
            emptyReportConfirmationPromptLink: 'Berichte',
            emptyReportConfirmationDontShowAgain: 'Nicht mehr anzeigen',
            genericWorkspaceName: 'dieser Workspace',
        },
        genericCreateReportFailureMessage: 'Unerwarteter Fehler beim Erstellen dieses Chats. Bitte versuche es später erneut.',
        genericAddCommentFailureMessage: 'Unerwarteter Fehler beim Posten des Kommentars. Bitte versuchen Sie es später erneut.',
        genericUpdateReportFieldFailureMessage: 'Unerwarteter Fehler beim Aktualisieren des Feldes. Bitte versuchen Sie es später erneut.',
        genericUpdateReportNameEditFailureMessage: 'Unerwarteter Fehler beim Umbenennen des Berichts. Bitte versuchen Sie es später noch einmal.',
        noActivityYet: 'Noch keine Aktivität',
        connectionSettings: 'Verbindungseinstellungen',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `${fieldName} geändert in „${newValue}“ (zuvor „${oldValue}“)`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `setze ${fieldName} auf „${newValue}“`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `den Workspace geändert${fromPolicyName ? `(zuvor ${fromPolicyName})` : ''}`;
                    }
                    return `Arbeitsbereich in ${toPolicyName}${fromPolicyName ? `(zuvor ${fromPolicyName})` : ''} geändert`;
                },
                changeType: (oldType: string, newType: string) => `Typ von ${oldType} in ${newType} geändert`,
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
                    manual: (label: string) => `hat diesen Bericht als manuell exportiert nach ${label} markiert.`,
                    automaticActionThree: 'und erfolgreich einen Datensatz erstellt für',
                    reimburseableLink: 'Auslagen',
                    nonReimbursableLink: 'Firmenkarten-Ausgaben',
                    pending: (label: string) => `Begann mit dem Exportieren dieses Berichts nach ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `Fehler beim Exportieren dieses Berichts nach ${label} („${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}“)`,
                managerAttachReceipt: `hat eine Quittung hinzugefügt`,
                managerDetachReceipt: `hat einen Beleg entfernt`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `${currency}${amount} anderweitig bezahlt`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `${currency}${amount} über Integration bezahlt`,
                outdatedBankAccount: `konnte die Zahlung aufgrund eines Problems mit dem Bankkonto des Zahlers nicht verarbeiten`,
                reimbursementACHBounce: `Die Zahlung konnte aufgrund eines Problems mit dem Bankkonto nicht verarbeitet werden`,
                reimbursementACHCancelled: `hat die Zahlung storniert`,
                reimbursementAccountChanged: `Die Zahlung konnte nicht verarbeitet werden, da der Zahlungspflichtige das Bankkonto gewechselt hat`,
                reimbursementDelayed: `die Zahlung verarbeitet, aber sie verzögert sich um weitere 1–2 Werktage`,
                selectedForRandomAudit: `zufällig zur Überprüfung ausgewählt`,
                selectedForRandomAuditMarkdown: `[zufällig ausgewählt](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) zur Überprüfung`,
                share: ({to}: ShareParams) => `eingeladenes Mitglied ${to}`,
                unshare: ({to}: UnshareParams) => `entferntes Mitglied ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `bezahlt ${currency}${amount}`,
                takeControl: `Kontrolle übernommen`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `Beim Synchronisieren mit ${label}${errorMessage ? ` ("${errorMessage}")` : ''} ist ein Problem aufgetreten. Bitte behebe das Problem in den <a href="${workspaceAccountingLink}">Workspace-Einstellungen</a>.`,
                addEmployee: (email: string, role: string) => `${email} als ${role === 'member' ? 'a' : 'ein'} ${role} hinzugefügt`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `hat die Rolle von ${email} in ${newRole} geändert (zuvor ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `Benutzerdefiniertes Feld 1 von ${email} entfernt (zuvor „${previousValue}“)`;
                    }
                    return !previousValue
                        ? `„${newValue}“ zu benutzerdefiniertem Feld 1 von ${email} hinzugefügt`
                        : `benutzerdefiniertes Feld 1 von ${email} in „${newValue}“ geändert (zuvor „${previousValue}“)`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `Benutzerdefiniertes Feld 2 von ${email} entfernt (zuvor „${previousValue}“)`;
                    }
                    return !previousValue
                        ? `„${newValue}“ zu benutzerdefiniertem Feld 2 von ${email} hinzugefügt`
                        : `Benutzerdefiniertes Feld 2 von ${email} wurde in „${newValue}“ geändert (zuvor „${previousValue}“)`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} hat den Workspace verlassen`,
                removeMember: (email: string, role: string) => `${role} ${email} entfernt`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `Verbindung zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} entfernt`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `verbunden mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'hat den Chat verlassen',
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `Die ${feedName}-Verbindung ist unterbrochen. Um Kartenimporte wiederherzustellen, <a href='${workspaceCompanyCardRoute}'>melden Sie sich bei Ihrer Bank an</a>`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `die Plaid-Verbindung zu Ihrem Geschäftsbankkonto ist unterbrochen. Bitte <a href='${walletRoute}'>verbinden Sie Ihr Bankkonto ${maskedAccountNumber} erneut</a>, damit Sie Ihre Expensify-Karten weiterhin nutzen können.`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `Geschäftsbankkonto ${maskedBankAccountNumber} wurde aufgrund eines Problems mit der Erstattung oder der Expensify Card-Abrechnung automatisch gesperrt. Bitte behebe das Problem in deinen <a href="${linkURL}">Workspace-Einstellungen</a>.`,
            },
            error: {
                invalidCredentials: 'Ungültige Anmeldedaten. Bitte überprüfen Sie die Konfiguration Ihrer Verbindung.',
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
        expensifyHelp: 'Expensify-Hilfe',
        terms: 'Nutzungsbedingungen',
        privacy: 'Datenschutz',
        learnMore: 'Erfahre mehr',
        aboutExpensify: 'Über Expensify',
        blog: 'Blog',
        jobs: 'Jobs',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Investor Relations',
        getStarted: 'Erste Schritte',
        createAccount: 'Neues Konto erstellen',
        logIn: 'Anmelden',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Zurück zur Chatliste navigieren',
        chatWelcomeMessage: 'Begrüßungsnachricht im Chat',
        navigatesToChat: 'Navigiert zu einem Chat',
        newMessageLineIndicator: 'Neue Nachrichtenzeilenanzeige',
        chatMessage: 'Chatnachricht',
        lastChatMessagePreview: 'Vorschau der letzten Chat-Nachricht',
        workspaceName: 'Arbeitsbereichsname',
        chatUserDisplayNames: 'Anzeigenamen von Chatmitgliedern',
        scrollToNewestMessages: 'Zum neuesten Nachrichtenverlauf scrollen',
        preStyledText: 'Vorformatierter Text',
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
        chooseAReason: 'Wählen Sie unten einen Grund zum Melden aus:',
        spam: 'Spam',
        spamDescription: 'Unaufgeforderte themenfremde Werbung',
        inconsiderate: 'Rücksichtslos',
        inconsiderateDescription: 'Beleidigende oder respektlose Formulierung mit fragwürdigen Absichten',
        intimidation: 'Einschüchterung',
        intimidationDescription: 'Aggressives Verfolgen einer Agenda trotz berechtigter Einwände',
        bullying: 'Mobbing',
        bullyingDescription: 'Eine einzelne Person ins Visier nehmen, um Gehorsam zu erlangen',
        harassment: 'Belästigung',
        harassmentDescription: 'Rassistisches, misogynes oder anderweitig allgemein diskriminierendes Verhalten',
        assault: 'Angriff',
        assaultDescription: 'Gezielter emotionaler Angriff mit der Absicht, Schaden zuzufügen',
        flaggedContent: 'Diese Nachricht wurde als Verstoß gegen unsere Gemeinschaftsregeln markiert und der Inhalt wurde ausgeblendet.',
        hideMessage: 'Nachricht ausblenden',
        revealMessage: 'Nachricht anzeigen',
        levelOneResult: 'Sendet anonyme Warnung und die Nachricht wird zur Überprüfung gemeldet.',
        levelTwoResult: 'Nachricht im Kanal ausgeblendet, anonyme Warnung und Nachricht wird zur Überprüfung gemeldet.',
        levelThreeResult: 'Nachricht aus dem Kanal entfernt, anonyme Warnung gesendet und Nachricht zur Überprüfung gemeldet.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Zur Einreichung von Ausgaben einladen',
        inviteToChat: 'Nur zum Chat einladen',
        nothing: 'Nichts tun',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Akzeptieren',
        decline: 'Ablehnen',
    },
    actionableMentionTrackExpense: {
        submit: 'An jemanden einreichen',
        categorize: 'Kategorisieren',
        share: 'Mit meinem Buchhalter teilen',
        nothing: 'Im Moment nichts',
    },
    teachersUnitePage: {
        teachersUnite: 'Lehrer vereinigen sich',
        joinExpensifyOrg:
            'Schließe dich Expensify.org an, um Ungerechtigkeit auf der ganzen Welt zu beseitigen. Die aktuelle Kampagne „Teachers Unite“ unterstützt Lehrkräfte überall, indem sie die Kosten für wichtige Schulmaterialien teilt.',
        iKnowATeacher: 'Ich kenne eine Lehrkraft',
        iAmATeacher: 'Ich bin Lehrer',
        getInTouch: 'Ausgezeichnet! Bitte teilen Sie ihre Kontaktdaten, damit wir mit ihnen Kontakt aufnehmen können.',
        introSchoolPrincipal: 'Einführung bei Ihrer Schulleitung',
        schoolPrincipalVerifyExpense:
            'Expensify.org teilt die Kosten für grundlegende Schulmaterialien, damit Schüler aus einkommensschwachen Haushalten besser lernen können. Ihr Schulleiter bzw. Ihre Schulleiterin wird gebeten, Ihre Ausgaben zu bestätigen.',
        principalFirstName: 'Vorname des Hauptansprechpartners',
        principalLastName: 'Nachname der verantwortlichen Person',
        principalWorkEmail: 'Primäre geschäftliche E-Mail',
        updateYourEmail: 'Aktualisieren Sie Ihre E-Mail-Adresse',
        updateEmail: 'E-Mail-Adresse aktualisieren',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Bevor du fortfährst, stelle bitte sicher, dass deine Schul-E-Mail als deine Standardkontaktmethode festgelegt ist. Du kannst dies unter Einstellungen > Profil > <a href="${contactMethodsRoute}">Kontaktmethoden</a> tun.`,
        error: {
            enterPhoneEmail: 'Gib eine gültige E‑Mail-Adresse oder Telefonnummer ein',
            enterEmail: 'E-Mail eingeben',
            enterValidEmail: 'Gib eine gültige E-Mail-Adresse ein',
            tryDifferentEmail: 'Bitte versuche eine andere E-Mail-Adresse',
        },
    },
    cardTransactions: {
        notActivated: 'Nicht aktiviert',
        outOfPocket: 'Auslagen',
        companySpend: 'Firmenausgaben',
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
            title: 'Zuordnung ausstehend',
            subtitle: 'Die Karte wird erstellt, sobald du wieder online bist',
            onlineSubtitle: 'Einen Moment, während wir die Karte einrichten',
            errorTitle: 'Kartenfehler',
            errorSubtitle: 'Beim Laden der Karte ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        error: {
            selectSuggestedAddress: 'Bitte wählen Sie eine vorgeschlagene Adresse aus oder verwenden Sie den aktuellen Standort',
        },
        odometer: {startReading: 'Mit dem Lesen beginnen', endReading: 'Lesen beenden', saveForLater: 'Für später speichern', totalDistance: 'Gesamtdistanz'},
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Zeugnis verloren oder beschädigt',
        nextButtonLabel: 'Weiter',
        reasonTitle: 'Warum benötigst du eine neue Karte?',
        cardDamaged: 'Meine Karte wurde beschädigt',
        cardLostOrStolen: 'Meine Karte wurde verloren oder gestohlen',
        confirmAddressTitle: 'Bitte bestätigen Sie die Postanschrift für Ihre neue Karte.',
        cardDamagedInfo: 'Ihre neue Karte wird in 2–3 Werktagen ankommen. Ihre aktuelle Karte funktioniert weiterhin, bis Sie Ihre neue Karte aktivieren.',
        cardLostOrStolenInfo: 'Ihre aktuelle Karte wird dauerhaft deaktiviert, sobald Ihre Bestellung aufgegeben wurde. Die meisten Karten treffen innerhalb weniger Werktage ein.',
        address: 'Adresse',
        deactivateCardButton: 'Karte deaktivieren',
        shipNewCardButton: 'Neue Karte versenden',
        addressError: 'Adresse ist erforderlich',
        reasonError: 'Grund ist erforderlich',
        successTitle: 'Ihre neue Karte ist unterwegs!',
        successDescription: 'Du musst sie aktivieren, sobald sie in ein paar Werktagen ankommt. In der Zwischenzeit kannst du eine virtuelle Karte verwenden.',
    },
    eReceipt: {
        guaranteed: 'Garantierte eReceipt',
        transactionDate: 'Transaktionsdatum',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Starte einen Chat, <success><strong>empfiehl einen Freund</strong></success>.',
            header: 'Chat starten, Freund empfehlen',
            body: 'Möchtest du, dass deine Freunde Expensify auch nutzen? Starte einfach einen Chat mit ihnen und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Reiche eine Ausgabe ein, <success><strong>empfiehl dein Team weiter</strong></success>.',
            header: 'Reiche eine Ausgabe ein, wirb dein Team an',
            body: 'Möchten Sie, dass Ihr Team Expensify ebenfalls nutzt? Reichen Sie ihnen einfach eine Ausgabe ein, und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Einen Freund empfehlen',
            body: 'Möchtest du, dass deine Freunde Expensify ebenfalls nutzen? Chatte einfach mit ihnen, bezahle oder teile eine Ausgabe, und wir kümmern uns um den Rest. Oder teile einfach deinen Einladungslink!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Einen Freund empfehlen',
            header: 'Einen Freund empfehlen',
            body: 'Möchtest du, dass deine Freunde Expensify ebenfalls nutzen? Chatte einfach mit ihnen, bezahle oder teile eine Ausgabe, und wir kümmern uns um den Rest. Oder teile einfach deinen Einladungslink!',
        },
        copyReferralLink: 'Einladungslink kopieren',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chatten Sie mit Ihrem Einrichtungsspezialisten in <a href="${href}">${adminReportName}</a>, um Hilfe zu erhalten`,
        default: `Schreibe eine Nachricht an <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link>, um Hilfe beim Einrichten zu erhalten`,
    },
    violations: {
        allTagLevelsRequired: 'Alle Tags erforderlich',
        autoReportedRejectedExpense: 'Diese Ausgabe wurde abgelehnt.',
        billableExpense: 'Abrechenbar nicht mehr gültig',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Beleg erforderlich${formattedLimit ? `über ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategorie nicht mehr gültig',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Angewendeter ${surcharge}% Umrechnungsaufschlag`,
        customUnitOutOfPolicy: 'Satz für diesen Workspace ungültig',
        duplicatedTransaction: 'Mögliches Duplikat',
        fieldRequired: 'Berichtsfelder sind erforderlich',
        futureDate: 'Zukünftiges Datum nicht zulässig',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Mit ${invoiceMarkup}% Aufschlag`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Datum älter als ${maxAge} Tage`,
        missingCategory: 'Fehlende Kategorie',
        missingComment: 'Beschreibung für ausgewählte Kategorie erforderlich',
        missingAttendees: 'Für diese Kategorie sind mehrere Teilnehmer erforderlich',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Fehlende ${tagName ?? 'Tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Betrag weicht von berechneter Entfernung ab';
                case 'card':
                    return 'Betrag ist höher als die Kartentransaktion';
                default:
                    if (displayPercentVariance) {
                        return `Betrag ist um ${displayPercentVariance}% höher als der gescannte Beleg`;
                    }
                    return 'Betrag ist höher als der gescannte Beleg';
            }
        },
        modifiedDate: 'Datum weicht vom gescannten Beleg ab',
        nonExpensiworksExpense: 'Spesen außerhalb von Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Ausgabe überschreitet das automatische Genehmigungslimit von ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Betrag über dem Kategorienlimit von ${formattedLimit}/Person`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit}/Person`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit} pro Reise`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit}/Person`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Betrag über dem täglichen Kategorienlimit von ${formattedLimit}/Person`,
        receiptNotSmartScanned: 'Beleg- und Ausgabendetails manuell hinzugefügt.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Beleg erforderlich über ${formattedLimit} Kategorielimit`;
            }
            if (formattedLimit) {
                return `Beleg über ${formattedLimit} erforderlich`;
            }
            if (category) {
                return `Beleg bei Überschreitung des Kategorienlimits erforderlich`;
            }
            return 'Beleg erforderlich';
        },
        itemizedReceiptRequired: ({formattedLimit}: {formattedLimit?: string}) => `Detaillierter Beleg erforderlich${formattedLimit ? ` über ${formattedLimit}` : ''}`,
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
                        return `Unterhaltung für Erwachsene`;
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
                return 'Beleg kann aufgrund einer unterbrochenen Bankverbindung nicht automatisch zugeordnet werden';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Bankverbindung unterbrochen. <a href="${companyCardPageURL}">Erneut verbinden, um Beleg abzugleichen</a>`
                    : 'Bankverbindung unterbrochen. Bitte einen Admin bitten, die Verbindung wiederherzustellen, um den Beleg abzugleichen.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Bitte ${member} bitten, es als Barzahlung zu markieren, oder warte 7 Tage und versuche es erneut` : 'Ausstehende Zusammenführung mit Kartenumsatz.';
            }
            return '';
        },
        brokenConnection530Error: 'Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung. Bitte beheben Sie dies unter <a href="${workspaceCompanyCardRoute}">Firmenkarten</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Beleg ausstehend wegen unterbrochener Bankverbindung. Bitte wende dich an eine/n Workspace-Admin, um das Problem zu beheben.',
        markAsCashToIgnore: 'Als Barzahlung markieren, um zu ignorieren und Zahlung anzufordern.',
        smartscanFailed: ({canEdit = true}) => `Belegerfassung fehlgeschlagen.${canEdit ? 'Details manuell eingeben.' : ''}`,
        receiptGeneratedWithAI: 'Mögliche KI-generierte Quittung',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Fehlende ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} nicht mehr gültig`,
        taxAmountChanged: 'Steuerbetrag wurde geändert',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Steuer'} nicht mehr gültig`,
        taxRateChanged: 'Steuersatz wurde geändert',
        taxRequired: 'Fehlender Steuersatz',
        none: 'Keine',
        taxCodeToKeep: 'Wähle aus, welcher Steuercode beibehalten werden soll',
        tagToKeep: 'Wähle aus, welchen Tag du behalten möchtest',
        isTransactionReimbursable: 'Wählen Sie, ob die Transaktion erstattungsfähig ist',
        merchantToKeep: 'Wähle, welchen Händler du behalten möchtest',
        descriptionToKeep: 'Wählen Sie die Beschreibung aus, die beibehalten werden soll',
        categoryToKeep: 'Wähle, welche Kategorie beibehalten werden soll',
        isTransactionBillable: 'Auswählen, ob die Transaktion verrechenbar ist',
        keepThisOne: 'Diesen behalten',
        confirmDetails: `Bestätige die Details, die du behältst`,
        confirmDuplicatesInfo: `Die Duplikate, die du nicht behältst, werden für die einreichende Person zurückgehalten, damit sie sie löschen kann.`,
        hold: 'Diese Ausgabe wurde zurückgestellt',
        resolvedDuplicates: 'Duplikat behoben',
        companyCardRequired: 'Firmenkartenkäufe erforderlich',
        noRoute: 'Bitte wählen Sie eine gültige Adresse aus',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} ist erforderlich`,
        reportContainsExpensesWithViolations: 'Der Bericht enthält Ausgaben mit Verstößen.',
    },
    violationDismissal: {
        rter: {
            manual: 'hat diese Quittung als Barzahlung markiert',
        },
        duplicatedTransaction: {
            manual: 'Duplikat behoben',
        },
    },
    videoPlayer: {
        play: 'Abspielen',
        pause: 'Pausieren',
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
            subtitle: 'Bevor Sie gehen, sagen Sie uns bitte, warum Sie zu Expensify Classic wechseln möchten.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ich brauche eine Funktion, die nur in Expensify Classic verfügbar ist.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Ich verstehe nicht, wie ich New Expensify verwenden soll.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Ich verstehe, wie man das neue Expensify verwendet, aber ich bevorzuge Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Welche Funktion benötigen Sie, die in New Expensify nicht verfügbar ist?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Was versuchst du zu tun?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Warum bevorzugen Sie Expensify Classic?',
        },
        responsePlaceholder: 'Ihre Antwort',
        thankYou: 'Danke für das Feedback!',
        thankYouSubtitle: 'Deine Antworten helfen uns, ein besseres Produkt zu entwickeln, mit dem man Dinge erledigen kann. Vielen Dank!',
        goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        offlineTitle: 'Sie scheinen hier festzustecken …',
        offline:
            'Du scheinst offline zu sein. Leider funktioniert Expensify Classic nicht offline, aber das neue Expensify schon. Wenn du Expensify Classic verwenden möchtest, versuche es erneut, sobald du eine Internetverbindung hast.',
        quickTip: 'Kurzer Tipp ...',
        quickTipSubTitle: 'Du kannst direkt zu Expensify Classic gehen, indem du expensify.com besuchst. Setze ein Lesezeichen dafür, um eine einfache Verknüpfung zu haben!',
        bookACall: 'Ein Gespräch buchen',
        bookACallTitle: 'Möchten Sie mit einem Product Manager sprechen?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Direktes Chatten zu Ausgaben und Berichten',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Möglichkeit, alles mobil zu erledigen',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Reisen und Ausgaben mit der Geschwindigkeit des Chats',
        },
        bookACallTextTop: 'Wenn du zu Expensify Classic wechselst, wirst du Folgendes verpassen:',
        bookACallTextBottom:
            'Wir würden uns freuen, mit Ihnen zu telefonieren, um den Grund zu verstehen. Sie können einen Termin für ein Gespräch mit einem unserer Senior Product Manager buchen, um Ihren Bedarf zu besprechen.',
        takeMeToExpensifyClassic: 'Bring mich zu Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Beim Laden weiterer Nachrichten ist ein Fehler aufgetreten',
        tryAgain: 'Erneut versuchen',
    },
    systemMessage: {
        mergedWithCashTransaction: 'einen Beleg mit dieser Transaktion abgeglichen',
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
                subtitle: (date: string) => `Aktualisieren Sie Ihre Zahlungskarte bis zum ${date}, um weiterhin alle Ihre Lieblingsfunktionen nutzen zu können.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Ihre Zahlung konnte nicht verarbeitet werden',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `Ihre Belastung vom ${date} über ${purchaseAmountOwed} konnte nicht verarbeitet werden. Bitte fügen Sie eine Zahlungskarte hinzu, um den offenen Betrag zu begleichen.`
                        : 'Bitte füge eine Zahlungskarte hinzu, um den ausstehenden Betrag zu begleichen.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Ihre Zahlungsinformationen sind veraltet',
                subtitle: (date: string) => `Ihre Zahlung ist überfällig. Bitte begleichen Sie Ihre Rechnung bis zum ${date}, um eine Unterbrechung des Service zu vermeiden.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Ihre Zahlungsinformationen sind veraltet',
                subtitle: 'Ihre Zahlung ist überfällig. Bitte begleichen Sie Ihre Rechnung.',
            },
            billingDisputePending: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `Du hast die Belastung über ${amountOwed} auf der Karte mit der Endung ${cardEnding} angefochten. Dein Konto bleibt gesperrt, bis die Angelegenheit mit deiner Bank geklärt ist.`,
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
                    'Bevor Sie es erneut versuchen, rufen Sie bitte direkt Ihre Bank an, um Expensify‑Abbuchungen zu autorisieren und eventuelle Sperrungen aufzuheben. Andernfalls versuchen Sie, eine andere Zahlungskarte hinzuzufügen.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Du hast die Belastung über ${amountOwed} auf der Karte mit der Endung ${cardEnding} angefochten. Dein Konto bleibt gesperrt, bis die Angelegenheit mit deiner Bank geklärt ist.`,
            preTrial: {
                title: 'Kostenlose Testversion starten',
                subtitle: 'Als nächsten Schritt <a href="#">schließen Sie Ihre Einrichtungs-Checkliste ab</a>, damit Ihr Team mit dem Spesenmanagement beginnen kann.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Testversion: Noch ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'} übrig!`,
                subtitle: 'Fügen Sie eine Zahlungskarte hinzu, um weiterhin alle Ihre Lieblingsfunktionen zu nutzen.',
            },
            trialEnded: {
                title: 'Ihre kostenlose Testversion ist abgelaufen',
                subtitle: 'Fügen Sie eine Zahlungskarte hinzu, um weiterhin alle Ihre Lieblingsfunktionen zu nutzen.',
            },
            earlyDiscount: {
                claimOffer: 'Angebot einlösen',
                subscriptionPageTitle: (discountType: number) =>
                    `<strong>${discountType}% Rabatt im ersten Jahr!</strong> Fügen Sie einfach eine Zahlungsmethode hinzu und starten Sie ein Jahresabonnement.`,
                onboardingChatTitle: (discountType: number) => `Zeitlich begrenztes Angebot: ${discountType}% Rabatt auf dein erstes Jahr!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) =>
                    `Einlösen innerhalb von ${days > 0 ? `${days}T :` : ''}${hours}Std : ${minutes}Min : ${seconds}Sek`,
            },
        },
        cardSection: {
            title: 'Zahlung',
            subtitle: 'Fügen Sie eine Karte hinzu, um Ihr Expensify-Abonnement zu bezahlen.',
            addCardButton: 'Zahlungskarte hinzufügen',
            cardInfo: (name: string, expiration: string, currency: string) => `Name: ${name}, Ablaufdatum: ${expiration}, Währung: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Ihr nächstes Zahlungsdatum ist der ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Karte mit Endziffern ${cardNumber}`,
            changeCard: 'Zahlungskarte ändern',
            changeCurrency: 'Zahlungswährung ändern',
            cardNotFound: 'Keine Zahlungskarte hinzugefügt',
            retryPaymentButton: 'Zahlung erneut versuchen',
            authenticatePayment: 'Zahlung authentifizieren',
            requestRefund: 'Erstattung anfordern',
            requestRefundModal: {
                full: 'Eine Rückerstattung zu erhalten ist ganz einfach: Stufen Sie Ihr Konto vor Ihrem nächsten Abrechnungsdatum herab, und Sie erhalten eine Rückerstattung. <br /> <br /> Hinweis: Wenn Sie Ihr Konto herabstufen, werden Ihre Arbeitsbereiche gelöscht. Diese Aktion kann nicht rückgängig gemacht werden, aber Sie können jederzeit einen neuen Arbeitsbereich erstellen, wenn Sie es sich anders überlegen.',
                confirm: 'Workspace(s) löschen und Downgrade durchführen',
            },
            viewPaymentHistory: 'Zahlungsverlauf anzeigen',
        },
        yourPlan: {
            title: 'Ihr Tarif',
            exploreAllPlans: 'Alle Tarife erkunden',
            customPricing: 'Individuelle Preisgestaltung',
            asLowAs: ({price}: YourPlanPriceValueParams) => `schon ab ${price} pro aktivem Mitglied/Monat`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied/Monat`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied und Monat`,
            perMemberMonth: 'pro Mitglied/Monat',
            collect: {
                title: 'Einziehen',
                description: 'Der Kleinunternehmensplan, der Ihnen Spesen, Reisen und Chat bietet.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                benefit1: 'Belegerfassung',
                benefit2: 'Rückerstattungen',
                benefit3: 'Firmenkartenverwaltung',
                benefit4: 'Spesen- und Reisegenehmigungen',
                benefit5: 'Reisebuchung und Regeln',
                benefit6: 'QuickBooks-/Xero-Integrationen',
                benefit7: 'Chat über Ausgaben, Berichte und Räume',
                benefit8: 'KI- und menschlicher Support',
            },
            control: {
                title: 'Kontrolle',
                description: 'Ausgaben, Reisen und Chat für größere Unternehmen.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                benefit1: 'Alles im Collect-Tarif',
                benefit2: 'Mehrstufige Genehmigungs-Workflows',
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
            saveWithExpensifyDescription: 'Verwende unseren Sparrechner, um zu sehen, wie das Cashback der Expensify Card deine Expensify-Rechnung reduzieren kann.',
            saveWithExpensifyButton: 'Mehr erfahren',
        },
        compareModal: {
            comparePlans: 'Tarife vergleichen',
            subtitle: `<muted-text>Schalte die Funktionen frei, die du brauchst – mit dem Tarif, der zu dir passt. <a href="${CONST.PRICING}">Sieh dir unsere Preisseite an</a> für eine vollständige Funktionsübersicht aller unserer Tarife.</muted-text>`,
        },
        details: {
            title: 'Abonnementdetails',
            annual: 'Jahresabonnement',
            taxExempt: 'Steuerbefreiungsstatus anfordern',
            taxExemptEnabled: 'Steuerbefreit',
            taxExemptStatus: 'Steuerbefreiungsstatus',
            payPerUse: 'Bezahlmodell nach Nutzung',
            subscriptionSize: 'Abonnementgröße',
            headsUp:
                'Achtung: Wenn du deine Abonnementgröße jetzt nicht festlegst, setzen wir sie automatisch auf die Anzahl der aktiven Mitglieder in deinem ersten Monat. Du verpflichtest dich dann, für mindestens diese Anzahl an Mitgliedern in den nächsten 12 Monaten zu bezahlen. Du kannst deine Abonnementgröße jederzeit erhöhen, aber du kannst sie erst verringern, wenn dein Abonnement abgelaufen ist.',
            zeroCommitment: 'Keine Verpflichtung zum vergünstigten jährlichen Abonnementpreis',
        },
        subscriptionSize: {
            title: 'Abonnementgröße',
            yourSize: 'Die Größe Ihres Abonnements ist die Anzahl der offenen Plätze, die in einem bestimmten Monat von beliebigen aktiven Mitgliedern belegt werden können.',
            eachMonth:
                'Jeden Monat deckt Ihr Abonnement bis zu der oben festgelegten Anzahl aktiver Mitglieder ab. Jedes Mal, wenn Sie Ihre Abonnementgröße erhöhen, beginnen Sie ein neues 12‑monatiges Abonnement in dieser neuen Größe.',
            note: 'Hinweis: Ein aktives Mitglied ist jeder, der Ausgabendaten, die mit Ihrem Unternehmensarbeitsbereich verknüpft sind, erstellt, bearbeitet, eingereicht, genehmigt, erstattet oder exportiert hat.',
            confirmDetails: 'Bestätigen Sie Ihre neuen jährlichen Abonnementdetails:',
            subscriptionSize: 'Abonnementgröße',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} aktive Mitglieder/Monat`,
            subscriptionRenews: 'Abonnement wird verlängert',
            youCantDowngrade: 'Während Ihres Jahresabonnements ist ein Downgrade nicht möglich.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Sie haben sich bereits für ein jährliches Abonnement mit ${size} aktiven Mitgliedern pro Monat bis zum ${date} verpflichtet. Sie können ab dem ${date} zu einem nutzungsbasierten Abonnement wechseln, indem Sie die automatische Verlängerung deaktivieren.`,
            error: {
                size: 'Bitte eine gültige Abonnementgröße eingeben',
                sameSize: 'Bitte geben Sie eine Zahl ein, die sich von Ihrer aktuellen Abonnementgröße unterscheidet',
            },
        },
        paymentCard: {
            addPaymentCard: 'Zahlungskarte hinzufügen',
            enterPaymentCardDetails: 'Geben Sie Ihre Zahlungs kartendaten ein',
            security: 'Expensify ist PCI-DSS-konform, verwendet eine Verschlüsselung auf Bankniveau und nutzt redundante Infrastruktur, um Ihre Daten zu schützen.',
            learnMoreAboutSecurity: 'Erfahren Sie mehr über unsere Sicherheit.',
        },
        subscriptionSettings: {
            title: 'Abonnementeinstellungen',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Abonnementstyp: ${subscriptionType}, Abonnementgröße: ${subscriptionSize}, Automatische Verlängerung: ${autoRenew}, Automatische jährliche Sitzplatzerhöhung: ${autoIncrease}`,
            none: 'keine',
            on: 'Ein',
            off: 'Aus',
            annual: 'Jährlich',
            autoRenew: 'Automatische Verlängerung',
            autoIncrease: 'Jährliche Plätze automatisch erhöhen',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Sparen Sie bis zu ${amountWithCurrency}/Monat pro aktivem Mitglied`,
            automaticallyIncrease:
                'Erhöhe deine jährlichen Plätze automatisch, um aktive Mitglieder abzudecken, die deine Abogröße überschreiten. Hinweis: Dadurch wird das Enddatum deines Jahresabonnements verlängert.',
            disableAutoRenew: 'Automatische Verlängerung deaktivieren',
            helpUsImprove: 'Helfen Sie uns, Expensify zu verbessern',
            whatsMainReason: 'Was ist der Hauptgrund, warum du die automatische Verlängerung deaktivierst?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Wird am ${date} verlängert.`,
            pricingConfiguration: 'Die Preise hängen von der Konfiguration ab. Wählen Sie für den niedrigsten Preis ein Jahresabonnement und holen Sie sich die Expensify Card.',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>Erfahren Sie mehr auf unserer <a href="${CONST.PRICING}">Preisseite</a> oder chatten Sie mit unserem Team in Ihrem ${hasAdminsRoom ? `<a href="adminsRoom">#admins-Raum.</a>` : '#admins-Raum.'}</muted-text>`,
            estimatedPrice: 'Geschätzter Preis',
            changesBasedOn: 'Dies ändert sich basierend auf deiner Expensify Card-Nutzung und den untenstehenden Abonnementoptionen.',
        },
        requestEarlyCancellation: {
            title: 'Vorzeitige Kündigung anfordern',
            subtitle: 'Was ist der Hauptgrund, warum du eine vorzeitige Kündigung beantragst?',
            subscriptionCanceled: {
                title: 'Abonnement gekündigt',
                subtitle: 'Ihr Jahresabonnement wurde gekündigt.',
                info: 'Wenn du deine(n) Workspace(s) weiterhin auf Pay-per-Use-Basis nutzen möchtest, bist du startklar.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Wenn du zukünftige Aktivitäten und Abbuchungen verhindern möchtest, musst du deinen <a href="${workspacesListRoute}">Workspace bzw. deine Workspaces löschen</a>. Beachte, dass dir beim Löschen deines/deiner Workspace(s) alle ausstehenden Aktivitäten berechnet werden, die im aktuellen Kalendermonat angefallen sind.`,
            },
            requestSubmitted: {
                title: 'Anfrage gesendet',
                subtitle:
                    'Danke, dass Sie uns mitgeteilt haben, dass Sie Ihr Abonnement kündigen möchten. Wir prüfen Ihre Anfrage und werden uns in Kürze über Ihren Chat mit <concierge-link>Concierge</concierge-link> bei Ihnen melden.',
            },
            acknowledgement: `Indem ich eine vorzeitige Kündigung beantrage, erkenne ich an und stimme zu, dass Expensify gemäß den Expensify-<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Nutzungsbedingungen</a> oder einer anderen geltenden Dienstleistungsvereinbarung zwischen mir und Expensify nicht verpflichtet ist, einem solchen Antrag stattzugeben, und dass Expensify hinsichtlich der Genehmigung eines solchen Antrags ausschließlich nach eigenem Ermessen entscheidet.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Funktionalität muss verbessert werden',
        tooExpensive: 'Zu teuer',
        inadequateSupport: 'Unzureichender Kundensupport',
        businessClosing: 'Unternehmensschließung, Personalabbau oder Übernahme',
        additionalInfoTitle: 'Zu welcher Software wechselst du und warum?',
        additionalInfoInputLabel: 'Ihre Antwort',
    },
    roomChangeLog: {
        updateRoomDescription: 'Lege die Raumbeschreibung fest auf:',
        clearRoomDescription: 'hat die Raumbeschreibung gelöscht',
        changedRoomAvatar: 'hat den Raum-Avatar geändert',
        removedRoomAvatar: 'hat den Raum-Avatar entfernt',
    },
    delegate: {
        switchAccount: 'Konten wechseln:',
        copilotDelegatedAccess: 'Copilot: Delegierter Zugriff',
        copilotDelegatedAccessDescription: 'Anderen Mitgliedern erlauben, auf dein Konto zuzugreifen.',
        addCopilot: 'Copilot hinzufügen',
        membersCanAccessYourAccount: 'Diese Mitglieder können auf Ihr Konto zugreifen:',
        youCanAccessTheseAccounts: 'Sie können auf diese Konten über den Kontowechsel zugreifen:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Vollständig';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Begrenzt';
                default:
                    return '';
            }
        },
        genericError: 'Ups, etwas ist schiefgelaufen. Bitte versuche es erneut.',
        onBehalfOfMessage: (delegator: string) => `im Namen von ${delegator}`,
        accessLevel: 'Zugriffsberechtigung',
        confirmCopilot: 'Bestätigen Sie unten Ihren Copilot.',
        accessLevelDescription: 'Wähle unten eine Zugriffsebene aus. Sowohl Vollzugriff als auch Eingeschränkter Zugriff erlauben Copilots, alle Konversationen und Ausgaben einzusehen.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Erlaube einem anderen Mitglied, in deinem Namen alle Aktionen in deinem Konto auszuführen. Dies umfasst Chat, Einreichungen, Genehmigungen, Zahlungen, Aktualisierungen von Einstellungen und mehr.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Erlaube einem anderen Mitglied, die meisten Aktionen in deinem Konto in deinem Namen durchzuführen. Ausgenommen sind Genehmigungen, Zahlungen, Ablehnungen und Sperren.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copilot entfernen',
        removeCopilotConfirmation: 'Möchten Sie diesen Copilot wirklich entfernen?',
        changeAccessLevel: 'Zugriffsebene ändern',
        makeSureItIsYou: 'Stellen wir sicher, dass du es bist',
        enterMagicCode: (contactMethod: string) =>
            `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um einen Copilot hinzuzufügen. Er sollte innerhalb von ein bis zwei Minuten ankommen.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um deinen Copilot zu aktualisieren.`,
        notAllowed: 'Nicht so schnell …',
        noAccessMessage: dedent(`
            Als Copilot hast du keinen Zugriff auf
            diese Seite. Entschuldigung!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `Als <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">Copilot</a> für ${accountOwnerEmail} hast du keine Berechtigung, diese Aktion auszuführen. Entschuldigung!`,
        copilotAccess: 'Copilot-Zugriff',
    },
    debug: {
        debug: 'Debuggen',
        details: 'Details',
        JSON: 'JSON',
        reportActions: 'Aktionen',
        reportActionPreview: 'Vorschau',
        nothingToPreview: 'Nichts zur Vorschau',
        editJson: 'JSON bearbeiten:',
        preview: 'Vorschau:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Fehlende(s) ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Ungültige Eigenschaft: ${propertyName} – Erwartet: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Ungültiger Wert – Erwartet: ${expectedValues}`,
        missingValue: 'Fehlender Wert',
        createReportAction: 'Bericht erstellen Aktion',
        reportAction: 'Aktion melden',
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
        visibleInLHN: 'Sichtbar in der LHN',
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
            pinnedByUser: 'Angeheftet von Mitglied',
            hasIOUViolations: 'Hat IOU-Verstöße',
            hasAddWorkspaceRoomErrors: 'Hat Fehler beim Hinzufügen des Workspace-Raums',
            isUnread: 'Ist ungelesen (Fokusmodus)',
            isArchived: 'Ist archiviert (neuester Modus)',
            isSelfDM: 'Ist Selbst-DM',
            isFocused: 'Ist vorübergehend fokussiert',
        },
        reasonGBR: {
            hasJoinRequest: 'Hat Beitrittsanfrage (Admin-Raum)',
            isUnreadWithMention: 'Ist ungelesen mit Erwähnung',
            isWaitingForAssigneeToCompleteAction: 'Wartet darauf, dass der Zuständige die Aktion ausführt',
            hasChildReportAwaitingAction: 'Untergeordneter Bericht wartet auf Aktion',
            hasMissingInvoiceBankAccount: 'Fehlendes Rechnungs-Bankkonto',
            hasUnresolvedCardFraudAlert: 'Hat ungelöste Kreditkartenbetrugswarnung',
            hasDEWApproveFailed: 'DEW-Genehmigung fehlgeschlagen',
        },
        reasonRBR: {
            hasErrors: 'Enthält Fehler in den Berichtsdaten oder den Berichtsvorgangsdatens',
            hasViolations: 'Hat Verstöße',
            hasTransactionThreadViolations: 'Hat Transaktions-Thread-Verstöße',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Es gibt einen Bericht, der auf eine Aktion wartet',
            theresAReportWithErrors: 'Es gibt einen Bericht mit Fehlern',
            theresAWorkspaceWithCustomUnitsErrors: 'Es gibt einen Arbeitsbereich mit Fehlern bei benutzerdefinierten Einheiten',
            theresAProblemWithAWorkspaceMember: 'Es gibt ein Problem mit einem Workspace-Mitglied',
            theresAProblemWithAWorkspaceQBOExport: 'Es gab ein Problem mit einer Exporteinstellung der Workspace-Verbindung.',
            theresAProblemWithAContactMethod: 'Es gibt ein Problem mit einer Kontaktmethode',
            aContactMethodRequiresVerification: 'Eine Kontaktmethode erfordert eine Verifizierung',
            theresAProblemWithAPaymentMethod: 'Es gibt ein Problem mit einer Zahlungsmethode',
            theresAProblemWithAWorkspace: 'Es gibt ein Problem mit einem Workspace',
            theresAProblemWithYourReimbursementAccount: 'Es gibt ein Problem mit deinem Erstattungskonto',
            theresABillingProblemWithYourSubscription: 'Es gibt ein Abrechnungsproblem mit deinem Abonnement',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Ihr Abonnement wurde erfolgreich verlängert',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Während der Synchronisierung der Arbeitsbereichsverbindung ist ein Problem aufgetreten',
            theresAProblemWithYourWallet: 'Es gibt ein Problem mit Ihrem Wallet',
            theresAProblemWithYourWalletTerms: 'Es gibt ein Problem mit den Bedingungen deiner Wallet',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Machen Sie eine Probefahrt',
    },
    migratedUserWelcomeModal: {
        title: 'Willkommen bei New Expensify!',
        subtitle: 'Es enthält alles, was du an unserer klassischen Erfahrung liebst, plus eine ganze Reihe von Verbesserungen, die dein Leben noch einfacher machen:',
        confirmText: "Los geht's!",
        helpText: '2-min-Demo ausprobieren',
        features: {
            search: 'Leistungsstärkere Suche auf Mobilgerät, Web und Desktop',
            concierge: 'Integrierte Concierge-KI zur Automatisierung Ihrer Spesen',
            chat: 'Mit jeder Ausgabe chatten, um Fragen schnell zu klären',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>Starten Sie <strong>hier!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Benenne deine gespeicherten Suchen um</strong> hier!</tooltip>',
        accountSwitcher: '<tooltip>Greifen Sie hier auf Ihre <strong>Copilot-Konten</strong> zu</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Scannen Sie unseren Testbeleg</strong>, um zu sehen, wie es funktioniert!</tooltip>',
            manager: '<tooltip>Wähle unseren <strong>Testmanager</strong>, um es auszuprobieren!</tooltip>',
            confirmation: '<tooltip>Jetzt <strong>reiche deine Ausgabe ein</strong> und sieh zu, wie die Magie geschieht!</tooltip>',
            tryItOut: 'Ausprobieren',
        },
        outstandingFilter: '<tooltip>Nach Ausgaben filtern,\ndie <strong>genehmigt werden müssen</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Quittung senden, um\n<strong>die Probefahrt abzuschließen!</strong></tooltip>',
        gpsTooltip: '<tooltip>GPS-Verfolgung läuft! Wenn du fertig bist, stoppe die Verfolgung unten.</tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Änderungen verwerfen?',
        body: 'Möchten Sie die von Ihnen vorgenommenen Änderungen wirklich verwerfen?',
        confirmText: 'Änderungen verwerfen',
    },
    scheduledCall: {
        book: {
            title: 'Anruf planen',
            description: 'Finde eine Uhrzeit, die für dich passt.',
            slots: ({date}: {date: string}) => `<muted-text>Verfügbare Zeiten für <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Anruf bestätigen',
            description: 'Stellen Sie sicher, dass die folgenden Details für Sie passend sind. Sobald Sie den Anruf bestätigen, senden wir eine Einladung mit weiteren Informationen.',
            setupSpecialist: 'Ihr Einrichtungsspezialist',
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
        submittedExpensesDescription: 'Diese Ausgaben wurden an Ihre/n Genehmiger/in gesendet, können aber bis zur Genehmigung weiterhin bearbeitet werden.',
        pendingExpensesTitle: 'Ausstehende Spesen wurden verschoben',
        pendingExpensesDescription: 'Alle ausstehenden Kartenausgaben wurden in einen separaten Bericht verschoben, bis sie gebucht werden.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Mach eine 2-minütige Probefahrt',
        },
        modal: {
            title: 'Probieren Sie uns aus',
            description: 'Machen Sie eine kurze Produkt-Tour, um sich schnell zurechtzufinden.',
            confirmText: 'Testfahrt starten',
            helpText: 'Überspringen',
            employee: {
                description:
                    '<muted-text>Verschaffe deinem Team <strong>3 kostenlose Monate Expensify!</strong> Gib einfach unten die E-Mail-Adresse deiner Chefin/deines Chefs ein und schicke ihr/ihm eine Testausgabe.</muted-text>',
                email: 'Gib die E-Mail-Adresse deines Chefs ein',
                error: 'Dieses Mitglied besitzt einen Arbeitsbereich, bitte gib ein neues Mitglied zum Testen ein.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Sie testen Expensify derzeit in der Probeversion',
            readyForTheRealThing: 'Bereit für das Richtige?',
            getStarted: 'Loslegen',
        },
        employeeInviteMessage: (name: string) => `# ${name} hat dich eingeladen, Expensify auszuprobieren
Hey! Ich habe uns gerade *3 kostenlose Monate* gesichert, um Expensify auszuprobieren, den schnellsten Weg, Spesen abzurechnen.

Hier ist ein *Testbeleg*, um dir zu zeigen, wie es funktioniert:`,
    },
    export: {
        basicExport: 'Einfacher Export',
        reportLevelExport: 'Alle Daten – Berichtsebene',
        expenseLevelExport: 'Alle Daten – Ausgabenebene',
        exportInProgress: 'Export wird ausgeführt',
        conciergeWillSend: 'Concierge wird dir die Datei in Kürze zusenden.',
    },
    domain: {
        notVerified: 'Nicht verifiziert',
        retry: 'Erneut versuchen',
        verifyDomain: {
            title: 'Domain verifizieren',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Bevor Sie fortfahren, verifizieren Sie, dass Sie <strong>${domainName}</strong> besitzen, indem Sie dessen DNS-Einstellungen aktualisieren.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Greife auf deinen DNS-Anbieter zu und öffne die DNS-Einstellungen für <strong>${domainName}</strong>.`,
            addTXTRecord: 'Fügen Sie den folgenden TXT-Eintrag hinzu:',
            saveChanges: 'Änderungen speichern und hierher zurückkehren, um Ihre Domain zu verifizieren.',
            youMayNeedToConsult: `Möglicherweise müssen Sie sich zur Durchführung der Verifizierung an die IT-Abteilung Ihrer Organisation wenden. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Mehr erfahren</a>.`,
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
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML-SSO</a> ist ein Sicherheitsfeature, das Ihnen mehr Kontrolle darüber gibt, wie Mitglieder mit <strong>${domainName}</strong>-E-Mails sich bei Expensify anmelden. Um es zu aktivieren, müssen Sie sich als autorisierte*r Unternehmensadministrator*in verifizieren.</muted-text>`,
            fasterAndEasierLogin: 'Schnelleres und einfacheres Anmelden',
            moreSecurityAndControl: 'Mehr Sicherheit und Kontrolle',
            onePasswordForAnything: 'Ein Passwort für alles',
        },
        goToDomain: 'Zur Domain wechseln',
        samlLogin: {
            title: 'SAML-Login',
            subtitle: `<muted-text>Mitgliedsanmeldung mit <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO)</a> konfigurieren.</muted-text>`,
            enableSamlLogin: 'SAML-Anmeldung aktivieren',
            allowMembers: 'Mitgliedern die Anmeldung mit SAML erlauben.',
            requireSamlLogin: 'SAML-Anmeldung erforderlich',
            anyMemberWillBeRequired: 'Alle Mitglieder, die mit einer anderen Methode angemeldet sind, müssen sich erneut mit SAML authentifizieren.',
            enableError: 'SAML-Aktivierungseinstellung konnte nicht aktualisiert werden',
            requireError: 'SAML-Anforderungseinstellung konnte nicht aktualisiert werden',
            disableSamlRequired: 'SAML-Anforderung deaktivieren',
            oktaWarningPrompt: 'Bist du sicher? Dadurch wird auch Okta SCIM deaktiviert.',
            requireWithEmptyMetadataError: 'Bitte fügen Sie unten die Identity-Provider-Metadaten hinzu, um zu aktivieren',
        },
        samlConfigurationDetails: {
            title: 'SAML-Konfigurationsdetails',
            subtitle: 'Verwenden Sie diese Details, um SAML einzurichten.',
            identityProviderMetadata: 'Identitätsanbieter-Metadaten',
            entityID: 'Entitäts-ID',
            nameIDFormat: 'Namens-ID-Format',
            loginUrl: 'Login-URL',
            acsUrl: 'ACS (Assertion Consumer Service)-URL',
            logoutUrl: 'Logout-URL',
            sloUrl: 'SLO-URL (Single Logout)',
            serviceProviderMetaData: 'Serviceanbieter-Metadaten',
            oktaScimToken: 'Okta-SCIM-Token',
            revealToken: 'Token anzeigen',
            fetchError: 'SAML-Konfigurationsdetails konnten nicht abgerufen werden',
            setMetadataGenericError: 'SAML-Metadaten konnten nicht festgelegt werden',
        },
        accessRestricted: {
            title: 'Zugriff eingeschränkt',
            subtitle: (domainName: string) =>
                `Bitte verifizieren Sie sich als autorisierte/r Unternehmensadministrator/in für <strong>${domainName}</strong>, wenn Sie Kontrolle über Folgendes benötigen:`,
            companyCardManagement: 'Firmenkartenverwaltung',
            accountCreationAndDeletion: 'Kontoerstellung und -löschung',
            workspaceCreation: 'Erstellung des Arbeitsbereichs',
            samlSSO: 'SAML-SSO',
        },
        addDomain: {
            title: 'Domain hinzufügen',
            subtitle: 'Geben Sie den Namen der privaten Domain ein, auf die Sie zugreifen möchten (z. B. expensify.com).',
            domainName: 'Domainname',
            newDomain: 'Neue Domain',
        },
        domainAdded: {
            title: 'Domain hinzugefügt',
            description: 'Als Nächstes müssen Sie die Inhaberschaft der Domain bestätigen und Ihre Sicherheitseinstellungen anpassen.',
            configure: 'Konfigurieren',
        },
        enhancedSecurity: {
            title: 'Verbesserte Sicherheit',
            subtitle: 'Erzwingen Sie für Mitglieder Ihrer Domain die Anmeldung per Single Sign-On, schränken Sie die Erstellung von Workspaces ein und vieles mehr.',
            enable: 'Aktivieren',
        },
        admins: {
            title: 'Admins',
            findAdmin: 'Admin finden',
            primaryContact: 'Hauptansprechpartner',
            addPrimaryContact: 'Primären Kontakt hinzufügen',
            setPrimaryContactError: 'Primären Kontakt kann nicht festgelegt werden. Bitte versuchen Sie es später erneut.',
            settings: 'Einstellungen',
            consolidatedDomainBilling: 'Konsolidierte Domain-Abrechnung',
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
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Bitte geben Sie <strong>${domainName}</strong> ein, um das Zurücksetzen der Domain zu bestätigen.`,
            enterDomainName: 'Geben Sie hier Ihren Domänennamen ein',
            resetDomainInfo: `Diese Aktion ist <strong>dauerhaft</strong> und die folgenden Daten werden gelöscht: <br/> <ul><li>Firmenkarten-Verbindungen und alle nicht eingereichten Ausgaben von diesen Karten</li> <li>SAML- und Gruppeneinstellungen</li> </ul> Alle Konten, Workspaces, Berichte, Ausgaben und anderen Daten bleiben erhalten. <br/><br/>Hinweis: Sie können diese Domain aus Ihrer Domainliste entfernen, indem Sie die zugehörige E-Mail aus Ihren <a href="#">Kontaktmethoden</a> löschen.`,
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
        continueGpsTripModal: {
            title: 'GPS-Aufzeichnung der Fahrt fortsetzen?',
            prompt: 'Es sieht so aus, als ob die App während deiner letzten GPS-Fahrt geschlossen wurde. Möchtest du die Aufzeichnung dieser Fahrt fortsetzen?',
            confirm: 'Reise fortsetzen',
            cancel: 'Reise anzeigen',
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
    homePage: {
        forYou: 'Für dich',
        announcements: 'Ankündigungen',
        discoverSection: {
            title: 'Entdecken',
            menuItemTitleNonAdmin: 'Erfahren Sie, wie Sie Ausgaben erstellen und Berichte einreichen.',
            menuItemTitleAdmin: 'Erfahren Sie, wie Sie Mitglieder einladen, Genehmigungs-Workflows bearbeiten und Firmenkarten abstimmen.',
            menuItemDescription: 'Sieh dir in 2 Minuten an, was Expensify kann',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `Sende ${count} ${count === 1 ? 'Bericht' : 'Berichte'}`,
            approve: ({count}: {count: number}) => `Genehmige ${count} ${count === 1 ? 'Bericht' : 'Berichte'}`,
            pay: ({count}: {count: number}) => `Bezahlen ${count} ${count === 1 ? 'Bericht' : 'Berichte'}`,
            export: ({count}: {count: number}) => `${count} ${count === 1 ? 'Bericht' : 'Berichte'} exportieren`,
            begin: 'Beginnen',
            emptyStateMessages: {
                nicelyDone: 'Gut gemacht',
                keepAnEyeOut: 'Behalte im Blick, was als Nächstes kommt!',
                allCaughtUp: 'Du bist auf dem neuesten Stand',
                upcomingTodos: 'Anstehende To-dos werden hier angezeigt.',
            },
        },
        timeSensitiveSection: {
            title: 'Zeitkritisch',
            cta: 'Antrag',
            offer50off: {title: 'Erhalte 50 % Rabatt auf dein erstes Jahr!', subtitle: ({formattedTime}: {formattedTime: string}) => `${formattedTime} verbleibend`},
            offer25off: {title: 'Erhalten Sie 25 % Rabatt auf Ihr erstes Jahr!', subtitle: ({days}: {days: number}) => `${days} ${days === 1 ? 'Tag' : 'Tage'} verbleiben`},
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
