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
    MultifactorAuthenticationTranslationParams,
    NextStepParams,
    NotAllowedExtensionParams,
    OptionalParam,
    PaidElsewhereParams,
    ParentNavigationSummaryParams,
    RemovedFromApprovalWorkflowParams,
    RemovedPolicyCustomUnitSubRateParams,
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
    UpdatedBudgetParams,
    UpdatedPolicyApprovalRuleParams,
    UpdatedPolicyBudgetNotificationParams,
    UpdatedPolicyCategoryMaxAmountNoReceiptParams,
    UpdatedPolicyCurrencyDefaultTaxParams,
    UpdatedPolicyCustomTaxNameParams,
    UpdatedPolicyCustomUnitSubRateParams,
    UpdatedPolicyDefaultTitleParams,
    UpdatedPolicyForeignCurrencyDefaultTaxParams,
    UpdatedPolicyManualApprovalThresholdParams,
    UpdatedPolicyOwnershipParams,
    UpdatedPolicyPreventSelfApprovalParams,
    UpdatedPolicyReimbursementChoiceParams,
    UpdatedPolicyReimburserParams,
    UpdatedPolicyReportFieldDefaultValueParams,
    UpdatedPolicyTagFieldParams,
    UpdatedPolicyTagListRequiredParams,
    UpdatedPolicyTagNameParams,
    UpdatedPolicyTagParams,
    UpdatedPolicyTaxParams,
    UpdatedPolicyTimeRateParams,
    UpdatedTheDistanceMerchantParams,
    UpdatedTheRequestParams,
    UpdatePolicyCustomUnitDefaultCategoryParams,
    UpdatePolicyCustomUnitParams,
    UpdateRoleParams,
    UpgradeSuccessMessageParams,
    UserIsAlreadyMemberParams,
    ViolationsIncreasedDistanceParams,
    ViolationsMissingTagParams,
    ViolationsModifiedAmountParams,
    ViolationsProhibitedExpenseParams,
    ViolationsReceiptRequiredParams,
    ViolationsRterParams,
    ViolationsTagOutOfPolicyParams,
    ViolationsTaxOutOfPolicyParams,
    WeSentYouMagicSignInLinkParams,
    WorkspaceLockedPlanTypeParams,
    WorkspaceMemberList,
    WorkspaceYouMayJoin,
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
        newFeature: 'Neue Funktion',
        search: 'Suche',
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
        deselect: 'Auswahl aufheben',
        selectMultiple: 'Mehrfachauswahl',
        saveChanges: 'Änderungen speichern',
        submit: 'Senden',
        submitted: 'Übermittelt',
        rotate: 'Drehen',
        zoom: 'Zoom',
        password: 'Passwort',
        magicCode: 'Magischer Code',
        digits: 'Ziffern',
        twoFactorCode: 'Zwei-Faktor-Code',
        workspaces: 'Workspaces',
        home: 'Startseite',
        inbox: 'Posteingang',
        yourReviewIsRequired: 'Ihre Überprüfung ist erforderlich',
        actionBadge: {
            submit: 'Senden',
            approve: 'Genehmigen',
            pay: 'Bezahlen',
            fix: 'Beheben',
        },
        success: 'Erfolgreich',
        group: 'Gruppe',
        profile: 'Profil',
        referral: 'Empfehlung',
        payments: 'Zahlungen',
        approvals: 'Genehmigungen',
        wallet: 'Brieftasche',
        preferences: 'Einstellungen',
        view: 'Anzeigen',
        review: (amount?: string) => `Prüfen${amount ? ` ${amount}` : ''}`,
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
        thinking: 'Concierge denkt nach...',
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
        unPin: 'Loslösen',
        back: 'Zurück',
        saveAndContinue: 'Speichern & fortfahren',
        settings: 'Einstellungen',
        termsOfService: 'Nutzungsbedingungen',
        members: 'Mitglieder',
        invite: 'Einladen',
        here: 'hier',
        date: 'Datum',
        dob: 'Geburtsdatum',
        currentYear: 'Laufendes Jahr',
        currentMonth: 'Aktueller Monat',
        ssnLast4: 'Letzte 4 Ziffern der Sozialversicherungsnummer',
        ssnFull9: 'Vollständige 9-stellige SSN',
        addressLine: (lineNumber: number) => `Adresszeile ${lineNumber}`,
        personalAddress: 'Persönliche Adresse',
        companyAddress: 'Firmenadresse',
        noPO: 'Keine Postfächer oder Postannahmestellen, bitte.',
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
        downloadFailedEmptyReportDescription: () => ({
            one: 'Sie können keinen leeren Bericht exportieren.',
            other: () => 'Sie können keine leeren Berichte exportieren.',
        }),
        remove: 'Entfernen',
        admin: 'Admin',
        owner: 'Inhaber',
        dateFormat: 'YYYY-MM-DD',
        send: 'Senden',
        na: 'k. A.',
        noResultsFound: 'Keine Ergebnisse gefunden',
        noResultsFoundMatching: (searchString: string) => `Keine Ergebnisse gefunden für „${searchString}”`,
        suggestionsAvailableFor: (searchString: string) => (searchString ? `Vorschläge verfügbar für „${searchString}”.` : 'Vorschläge verfügbar.'),
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
        progressBarLabel: 'Onboarding-Fortschritt',
        converted: 'Umgewandelt',
        error: {
            invalidAmount: 'Ungültiger Betrag',
            acceptTerms: 'Sie müssen die Nutzungsbedingungen akzeptieren, um fortzufahren',
            phoneNumber: `Bitte gib eine vollständige Telefonnummer ein
(z. B. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Dieses Feld ist erforderlich',
            requestModified: 'Diese Anfrage wird gerade von einem anderen Mitglied bearbeitet',
            characterLimitExceedCounter: (length: number, limit: number) => `Zeichenlimit überschritten (${length}/${limit})`,
            dateInvalid: 'Bitte wähle ein gültiges Datum aus',
            invalidDateShouldBeFuture: 'Bitte wähle das heutige oder ein zukünftiges Datum aus',
            invalidTimeShouldBeFuture: 'Bitte wähle eine Zeit, die mindestens eine Minute in der Zukunft liegt',
            invalidCharacter: 'Ungültiges Zeichen',
            enterMerchant: 'Geben Sie einen Händlernamen ein',
            enterAmount: 'Betrag eingeben',
            missingMerchantName: 'Fehlender Händlername',
            missingAmount: 'Fehlender Betrag',
            missingDate: 'Fehlendes Datum',
            enterDate: 'Datum eingeben',
            invalidTimeRange: 'Bitte gib eine Uhrzeit im 12-Stunden-Format ein (z. B. 2:30 PM).',
            pleaseCompleteForm: 'Bitte fülle das obige Formular aus, um fortzufahren',
            pleaseSelectOne: 'Bitte wähle oben eine Option aus',
            invalidRateError: 'Bitte einen gültigen Satz eingeben',
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
        transferBalance: 'Guthaben übertragen',
        enterManually: 'Manuell eingeben',
        message: 'Nachricht',
        leaveThread: 'Thread verlassen',
        you: 'Du',
        me: 'Ich',
        youAfterPreposition: 'du',
        your: 'dein',
        conciergeHelp: 'Bitte wende dich an Concierge, um Hilfe zu erhalten.',
        youAppearToBeOffline: 'Sie scheinen offline zu sein.',
        thisFeatureRequiresInternet: 'Diese Funktion erfordert eine aktive Internetverbindung.',
        attachmentWillBeAvailableOnceBackOnline: 'Anhang wird verfügbar, sobald du wieder online bist.',
        errorOccurredWhileTryingToPlayVideo: 'Beim Versuch, dieses Video abzuspielen, ist ein Fehler aufgetreten.',
        areYouSure: 'Bist du sicher?',
        verify: 'Bestätigen',
        yesContinue: 'Ja, fortfahren',
        websiteExample: 'z.&nbsp;B. https://www.expensify.com',
        zipCodeExampleFormat: (zipSampleFormat: string) => (zipSampleFormat ? `z. B. ${zipSampleFormat}` : ''),
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
        milesAbbreviated: 'mi',
        kilometersAbbreviated: 'km',
        copied: 'Kopiert!',
        someone: 'Jemand',
        total: 'Gesamt',
        edit: 'Bearbeiten',
        letsDoThis: `Auf geht’s!`,
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
        am: 'AM',
        pm: 'PM',
        tbd: 'Wird noch festgelegt',
        selectCurrency: 'Wähle eine Währung',
        selectSymbolOrCurrency: 'Wähle ein Symbol oder eine Währung aus',
        card: 'Karte',
        whyDoWeAskForThis: 'Warum fragen wir danach?',
        required: 'Erforderlich',
        automatic: 'Automatisch',
        showing: 'Wird angezeigt',
        of: 'von',
        default: 'Standard',
        update: 'Aktualisieren',
        member: 'Mitglied',
        auditor: 'Prüfer',
        role: 'Rolle',
        roleCannotBeChanged: (workflowsLinkPage: string) =>
            `Die Rolle kann nicht geändert werden, da dieses Mitglied ein <a href="${workflowsLinkPage}">zahler</a> in diesem Arbeitsbereich ist.`,
        currency: 'Währung',
        groupCurrency: 'Gruppenwährung',
        rate: 'Bewerten',
        emptyLHN: {
            title: 'Juhu! Alles erledigt.',
            subtitleText1: 'Finde einen Chat über die',
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
        shared: 'Freigegeben',
        drafts: 'Entwürfe',
        draft: 'Entwurf',
        finished: 'Fertig',
        upgrade: 'Upgrade',
        downgradeWorkspace: 'Arbeitsbereich herabstufen',
        companyID: 'Unternehmens-ID',
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
        longReportID: 'Langer Bericht-ID',
        withdrawalID: 'Auszahlungs-ID',
        withdrawalStatus: 'Auszahlungsstatus',
        bankAccounts: 'Bankkonten',
        chooseFile: 'Datei auswählen',
        chooseFiles: 'Dateien auswählen',
        dropTitle: 'Loslassen',
        dropMessage: 'Datei hier ablegen',
        ignore: 'Ignorieren',
        enabled: 'Aktiviert',
        disabled: 'Deaktiviert',
        import: 'Importieren',
        offlinePrompt: 'Sie können diese Aktion derzeit nicht ausführen.',
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
        chatWithAccountManager: (accountManagerDisplayName: string) => `Brauchen Sie etwas Bestimmtes? Chatten Sie mit Ihrer/Ihrem Kundenbetreuer·in, ${accountManagerDisplayName}.`,
        chatNow: 'Jetzt chatten',
        workEmail: 'Arbeits-E-Mail',
        destination: 'Ziel',
        subrate: 'Nebensatzrate',
        perDiem: 'Tagegeld',
        validate: 'Validieren',
        downloadAsPDF: 'Als PDF herunterladen',
        downloadAsCSV: 'Als CSV herunterladen',
        print: 'Drucken',
        help: 'Hilfe',
        collapsed: 'Eingeklappt',
        expanded: 'Ausgeklappt',
        expenseReport: 'Spesenabrechnung',
        expenseReports: 'Spesenabrechnungen',
        rateOutOfPolicy: 'Satz außerhalb der Richtlinie',
        leaveWorkspace: 'Arbeitsbereich verlassen',
        leaveWorkspaceConfirmation: 'Wenn du diesen Workspace verlässt, kannst du keine Ausgaben mehr dafür einreichen.',
        leaveWorkspaceConfirmationAuditor: 'Wenn du diesen Workspace verlässt, kannst du seine Berichte und Einstellungen nicht mehr anzeigen.',
        leaveWorkspaceConfirmationAdmin: 'Wenn du diesen Workspace verlässt, kannst du seine Einstellungen nicht mehr verwalten.',
        leaveWorkspaceConfirmationApprover: (workspaceOwner: string) =>
            `Wenn du diesen Workspace verlässt, wirst du im Genehmigungsworkflow durch ${workspaceOwner}, den/die Workspace-Inhaber(in), ersetzt.`,
        leaveWorkspaceConfirmationExporter: (workspaceOwner: string) =>
            `Wenn du diesen Workspace verlässt, wirst du als bevorzugte exportierende Person durch ${workspaceOwner}, die Workspace-Inhaber*in, ersetzt.`,
        leaveWorkspaceConfirmationTechContact: (workspaceOwner: string) =>
            `Wenn du diesen Workspace verlässt, wirst du als technischer Kontakt durch ${workspaceOwner}, den Workspace-Inhaber, ersetzt.`,
        leaveWorkspaceReimburser:
            'Du kannst diesen Workspace als Erstattungsverantwortliche·r nicht verlassen. Bitte lege unter „Workspaces > Zahlungen senden oder nachverfolgen“ eine·n neue·n Erstattungsverantwortliche·n fest und versuche es erneut.',
        reimbursable: 'Erstattungsfähig',
        editYourProfile: 'Profil bearbeiten',
        comments: 'Kommentare',
        sharedIn: 'Geteilt in',
        unreported: 'Nicht gemeldet',
        explore: 'Entdecken',
        insights: 'Insights',
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
        workspacesTabTitle: 'Workspaces',
        headsUp: 'Achtung!',
        submitTo: 'Einreichen bei',
        forwardTo: 'Weiterleiten an',
        approvalLimit: 'Genehmigungslimit',
        overLimitForwardTo: 'Weiterleiten bei Überschreitung',
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
        copyToClipboard: 'In Zwischenablage kopieren',
        thisIsTakingLongerThanExpected: 'Das dauert länger als erwartet ...',
        domains: 'Domains',
        actionRequired: 'Aktion erforderlich',
        duplicate: 'Duplizieren',
        duplicated: 'Dupliziert',
        duplicateExpense: 'Doppelte Ausgabe',
        exchangeRate: 'Wechselkurs',
        reimbursableTotal: 'Erstattungsfähiger Gesamtbetrag',
        nonReimbursableTotal: 'Nicht erstattungsfähige Gesamtsumme',
        opensInNewTab: 'Wird in einem neuen Tab geöffnet',
        locked: 'Gesperrt',
        month: 'Monat',
        week: 'Woche',
        year: 'Jahr',
        quarter: 'Quartal',
        vacationDelegate: 'Urlaubsvertretung',
        expensifyLogo: 'Expensify-Logo',
        concierge: {sidePanelGreeting: 'Hallo, wie kann ich helfen?', showHistory: 'Verlauf anzeigen'},
        duplicateReport: 'Duplizierten Bericht',
        approver: 'Genehmiger',
        enterDigitLabel: ({digitIndex, totalDigits}: {digitIndex: number; totalDigits: number}) => `Ziffer ${digitIndex} von ${totalDigits} eingeben`,
        copyOfReportName: (reportName: string) => `Kopie von ${reportName}`,
    },
    socials: {
        podcast: 'Folgen Sie uns auf Podcast',
        twitter: 'Folgen Sie uns auf Twitter',
        instagram: 'Folgen Sie uns auf Instagram',
        facebook: 'Folgen Sie uns auf Facebook',
        linkedin: 'Folgen Sie uns auf LinkedIn',
    },
    concierge: {
        collapseReasoning: 'Begründung einklappen',
        expandReasoning: 'Begründung erweitern',
    },
    supportalNoAccess: {
        title: 'Nicht so schnell',
        descriptionWithCommand: (command?: string) =>
            `Sie sind nicht berechtigt, diese Aktion auszuführen, wenn der Support eingeloggt ist (Befehl: ${command ?? ''}). Wenn Sie der Meinung sind, dass Success in der Lage sein sollte, diese Aktion auszuführen, beginnen Sie bitte ein Gespräch in Slack.`,
    },
    lockedAccount: {
        title: 'Gesperrtes Konto',
        description: 'Sie dürfen diese Aktion nicht ausführen, da dieses Konto gesperrt wurde. Bitte wenden Sie sich an concierge@expensify.com, um die nächsten Schritte zu erfahren.',
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
        importContactsText: 'Importiere Kontakte von deinem Telefon, damit deine Lieblingsmenschen immer nur einen Fingertipp entfernt sind.',
        importContactsExplanation: 'damit deine Lieblingsmenschen immer nur einen Fingertipp entfernt sind.',
        importContactsNativeText: 'Nur noch ein Schritt! Gib uns grünes Licht, um deine Kontakte zu importieren.',
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
        chooseFromGallery: 'Aus Galerie wählen',
        chooseDocument: 'Datei auswählen',
        attachmentTooLarge: 'Anhang ist zu groß',
        sizeExceeded: 'Die Anhangsgröße überschreitet das Limit von 24 MB',
        sizeExceededWithLimit: (maxUploadSizeInMB: number) => `Die Anhangsgröße überschreitet das Limit von ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Anhang ist zu klein',
        sizeNotMet: 'Die Anhangsgröße muss größer als 240 Bytes sein',
        wrongFileType: 'Ungültiger Dateityp',
        notAllowedExtension: 'Dieser Dateityp ist nicht zulässig. Bitte versuche einen anderen Dateityp.',
        folderNotAllowedMessage: 'Das Hochladen eines Ordners ist nicht erlaubt. Bitte versuche es mit einer anderen Datei.',
        protectedPDFNotSupported: 'Passwortgeschützte PDF wird nicht unterstützt',
        attachmentImageResized: 'Dieses Bild wurde für die Vorschau verkleinert. Für die volle Auflösung herunterladen.',
        attachmentImageTooLarge: 'Dieses Bild ist zu groß, um vor dem Hochladen eine Vorschau anzuzeigen.',
        imageDimensionsTooLarge: 'Die Bildabmessungen sind zu groß zum Verarbeiten. Bitte verwenden Sie ein kleineres Bild.',
        tooManyFiles: (fileLimit: number) => `Sie können jeweils nur bis zu ${fileLimit} Dateien hochladen.`,
        sizeExceededWithValue: (maxUploadSizeInMB: number) => `Dateien überschreiten ${maxUploadSizeInMB} MB. Bitte versuche es erneut.`,
        someFilesCantBeUploaded: 'Einige Dateien können nicht hochgeladen werden',
        sizeLimitExceeded: (maxUploadSizeInMB: number) => `Dateien dürfen nicht größer als ${maxUploadSizeInMB} MB sein. Größere Dateien werden nicht hochgeladen.`,
        maxFileLimitExceeded: 'Sie können bis zu 30 Belege auf einmal hochladen. Weitere darüber hinaus werden nicht hochgeladen.',
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
        problemGettingImageYouPasted: 'Beim Abrufen des von dir eingefügten Bildes ist ein Problem aufgetreten',
        commentExceededMaxLength: (formattedMaxLength: string) => `Die maximale Kommentarlänge beträgt ${formattedMaxLength} Zeichen.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `Die maximale Aufgaben-Titellänge beträgt ${formattedMaxLength} Zeichen.`,
    },
    baseUpdateAppModal: {
        updateApp: 'App aktualisieren',
        updatePrompt: 'Eine neue Version dieser App ist verfügbar.\nAktualisiere jetzt oder starte die App später neu, um die neuesten Änderungen herunterzuladen.',
    },
    deeplinkWrapper: {
        launching: 'Expensify wird gestartet',
        expired: 'Ihre Sitzung ist abgelaufen.',
        signIn: 'Bitte melde dich erneut an.',
    },
    multifactorAuthentication: {
        reviewTransaction: {
            reviewTransaction: 'Transaktion prüfen',
            pleaseReview: 'Bitte überprüfe diese Transaktion',
            requiresYourReview: 'Eine Expensify Card-Transaktion erfordert unten Ihre Überprüfung.',
            transactionDetails: 'Transaktionsdetails',
            deny: 'Ablehnen',
            approve: 'Genehmigen',
            denyTransaction: 'Transaktion ablehnen',
            transactionDenied: 'Transaktion abgelehnt',
            transactionApproved: 'Transaktion genehmigt!',
            areYouSureToDeny: 'Bist du sicher? Die Transaktion wird abgelehnt, wenn du diesen Bildschirm schließt.',
            youCanTryAgainAtMerchantOrReachOut:
                'Du kannst es erneut beim Händler versuchen. Wenn du diese Transaktion nicht versucht hast, <concierge-link>wende dich an Concierge</concierge-link>, um möglichen Betrug zu melden.',
            youNeedToTryAgainAtMerchant: 'Diese Transaktion wurde nicht verifiziert, daher haben wir sie abgelehnt. Bitte versuch es erneut direkt beim Händler.',
            goBackToTheMerchant: 'Gehe zurück zur Händlerseite, um die Transaktion fortzusetzen.',
            attemptedTransaction: 'Versuchte Transaktion',
            transactionFailed: 'Transaktion fehlgeschlagen',
            transactionCouldNotBeCompleted: 'Ihre Transaktion konnte nicht abgeschlossen werden. Bitte versuchen Sie es erneut beim Händler.',
            transactionCouldNotBeCompletedReachOut:
                'Ihre Transaktion konnte nicht abgeschlossen werden. Wenn Sie diese Transaktion nicht versucht haben, <concierge-link>wenden Sie sich an Concierge</concierge-link>, um möglichen Betrug zu melden.',
            reviewFailed: 'Überprüfung fehlgeschlagen',
            alreadyReviewedSubtitle:
                'Sie haben diese Transaktion bereits überprüft. Bitte prüfen Sie Ihren <transaction-history-link>Transaktionsverlauf</transaction-history-link> oder kontaktieren Sie <concierge-link>Concierge</concierge-link>, um Probleme zu melden.',
        },
        biometricsTest: {
            biometricsTest: 'Biometrie-Test',
            authenticationSuccessful: 'Authentifizierung erfolgreich',
            successfullyAuthenticatedUsing: ({authType}: MultifactorAuthenticationTranslationParams) => `Sie haben sich erfolgreich mit ${authType} authentifiziert.`,
            troubleshootBiometricsStatus: ({status}: MultifactorAuthenticationTranslationParams) => `Biometrische Daten (${status})`,
            yourAttemptWasUnsuccessful: 'Dein Authentifizierungsversuch war nicht erfolgreich.',
            youCouldNotBeAuthenticated: 'Du konntest nicht authentifiziert werden',
            areYouSureToReject: 'Sind Sie sicher? Der Authentifizierungsversuch wird abgelehnt, wenn Sie diesen Bildschirm schließen.',
            rejectAuthentication: 'Authentifizierung ablehnen',
            test: 'Test',
            biometricsAuthentication: 'Biometrische Authentifizierung',
            authType: {
                unknown: 'Unbekannt',
                none: 'Keine',
                credentials: 'Anmeldedaten',
                biometrics: 'Biometrie',
                faceId: 'Face ID',
                touchId: 'Touch ID',
                opticId: 'Optic ID',
                passkey: 'Passkey',
            },
            statusNeverRegistered: 'Nie registriert',
            statusNotRegistered: 'Nicht registriert',
            statusRegisteredThisDevice: 'Registriert',
            statusRegisteredOtherDevice: () => ({one: 'Anderes Gerät registriert', other: 'Andere Geräte registriert'}),
        },
        pleaseEnableInSystemSettings: {
            start: 'Bitte aktiviere die Gesichts-/Fingerabdrucküberprüfung oder richte einen Gerätecode auf deinem Gerät ein',
            link: 'Systemeinstellungen',
            end: '.',
        },
        oops: 'Ups, da ist etwas schiefgelaufen',
        looksLikeYouRanOutOfTime: 'Anscheinend ist deine Zeit abgelaufen! Bitte versuche es noch einmal beim Händler.',
        youRanOutOfTime: 'Die Zeit ist abgelaufen',
        letsVerifyItsYou: 'Lass uns bestätigen, dass du es bist',
        nowLetsAuthenticateYou: 'Lassen Sie uns Sie jetzt authentifizieren …',
        letsAuthenticateYou: 'Lass uns dich authentifizieren …',
        verifyYourself: {biometrics: 'Bestätige dich mit deinem Gesicht oder Fingerabdruck', passkeys: 'Bestätigen Sie sich mit einem Passkey'},
        enableQuickVerification: {
            biometrics: 'Aktiviere eine schnelle, sichere Verifizierung mit deinem Gesicht oder Fingerabdruck. Keine Passwörter oder Codes erforderlich.',
            passkeys: 'Aktivieren Sie eine schnelle, sichere Verifizierung mit einem Passkey. Keine Passwörter oder Codes erforderlich.',
        },
        revoke: {
            title: 'Gesicht/Fingerabdruck & Zugangsschlüssel',
            explanation:
                'Gesichts-/Fingerabdruck- oder Passkey-Verifizierung ist auf einem oder mehreren Geräten aktiviert. Beim Entziehen des Zugriffs ist für die nächste Verifizierung auf diesem Gerät ein magischer Code erforderlich.',
            confirmationPrompt: 'Sind Sie sicher? Sie benötigen einen magischen Code für die nächste Verifizierung auf diesem Gerät.',
            cta: 'Zugriff entziehen',
            noDevices: 'Sie haben keine Geräte für Gesichts-/Fingerabdruck- oder Passkey-Verifizierung registriert. Wenn Sie welche registrieren, können Sie deren Zugriff hier widerrufen.',
            dismiss: 'Verstanden',
            error: 'Anfrage fehlgeschlagen. Versuche es später noch einmal.',
            revoke: 'Widerrufen',
            confirmationPromptAll: 'Sind Sie sicher? Sie benötigen einen Magic Code für die nächste Verifizierung auf jedem Gerät.',
            ctaAll: 'Alle widerrufen',
            thisDevice: 'Dieses Gerät',
            otherDevices: ({otherDeviceCount}: MultifactorAuthenticationTranslationParams) => {
                const numberWords = ['Eins', 'Zwei', 'Drei', 'Vier', 'Fünf', 'Sechs', 'Sieben', 'Acht', 'Neun'];
                const displayCount = otherDeviceCount !== undefined && otherDeviceCount >= 1 && otherDeviceCount <= 9 ? numberWords.at(otherDeviceCount - 1) : `${otherDeviceCount}`;
                return `${displayCount} weitere ${otherDeviceCount === 1 ? 'Gerät' : 'Geräte'}`;
            },
            confirmationPromptThisDevice: 'Sind Sie sicher? Sie benötigen einen Magic-Code für die nächste Verifizierung auf diesem Gerät.',
            confirmationPromptMultiple: 'Sind Sie sicher? Sie benötigen einen magischen Code für die nächste Verifizierung auf diesen Geräten.',
        },
        unsupportedDevice: {
            unsupportedDevice: 'Nicht unterstütztes Gerät',
            pleaseDownloadMobileApp: `Diese Aktion wird auf deinem Gerät nicht unterstützt. Bitte lade die Expensify-App aus dem <a href="${CONST.APP_DOWNLOAD_LINKS.IOS}">App Store</a> oder dem <a href="${CONST.APP_DOWNLOAD_LINKS.ANDROID}">Google Play Store</a> herunter und versuche es erneut.`,
            pleaseUseWebApp: `Diese Aktion wird auf deinem Gerät nicht unterstützt. Bitte verwende die <a href="${CONST.NEW_EXPENSIFY_URL}">Expensify-Webanwendung</a> und versuche es erneut.`,
        },
        verificationFailed: 'Überprüfung fehlgeschlagen',
        setPin: {didNotShipCard: 'Wir haben Ihre Karte nicht versendet. Bitte versuchen Sie es erneut.'},
        revealPin: {couldNotReveal: 'Wir konnten Ihre PIN nicht anzeigen. Bitte versuchen Sie es erneut.'},
        changePin: {didNotChange: 'Wir haben Ihre PIN nicht geändert. Bitte versuchen Sie es erneut.'},
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
            Gib deinen Code an niemanden weiter.
            Expensify wird niemals danach fragen!
        `),
        or: 'oder',
        signInHere: 'melde dich einfach hier an',
        expiredCodeTitle: 'Magic Code abgelaufen',
        expiredCodeDescription: 'Gehe zurück zum ursprünglichen Gerät und fordere einen neuen Code an',
        successfulNewCodeRequest: 'Code angefordert. Bitte überprüfe dein Gerät.',
        tfaRequiredTitle: dedent(`
            Zwei-Faktor-Authentifizierung erforderlich
        `),
        tfaRequiredDescription: dedent(`
            Bitte gib den Zwei-Faktor-Authentifizierungscode ein,
            wo du versuchst, dich anzumelden.
        `),
        requestOneHere: 'Fordere hier eine an.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Bezahlt von',
        whatsItFor: 'Wofür ist das?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Name, E-Mail-Adresse oder Telefonnummer',
        findMember: 'Mitglied finden',
        searchForSomeone: 'Nach jemandem suchen',
        userSelected: (username: string) => `${username} ausgewählt`,
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Reiche eine Ausgabe ein, wirb dein Team an',
            subtitleText: 'Möchtest du, dass dein Team Expensify auch nutzt? Reiche ihnen einfach eine Ausgabe ein und wir kümmern uns um den Rest.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Einen Anruf buchen',
    },
    hello: 'Hallo',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Leg unten los.',
        anotherLoginPageIsOpen: 'Eine weitere Anmeldeseite ist geöffnet.',
        anotherLoginPageIsOpenExplanation: 'Du hast die Anmeldeseite in einem separaten Tab geöffnet. Bitte melde dich in diesem Tab an.',
        welcome: 'Willkommen!',
        welcomeWithoutExclamation: 'Willkommen',
        phrase2: 'Geld spricht. Und jetzt, da Chat und Zahlungen an einem Ort sind, ist es auch einfach.',
        phrase3: 'Deine Zahlungen kommen so schnell bei dir an, wie du deinen Standpunkt klarmachen kannst.',
        enterPassword: 'Bitte geben Sie Ihr Passwort ein',
        welcomeNewFace: (login: string) => `${login}, es ist immer schön, ein neues Gesicht hier zu sehen!`,
        welcomeEnterMagicCode: (login: string) => `Bitte gib den magischen Code ein, der an ${login} gesendet wurde. Er sollte innerhalb einer oder zwei Minuten ankommen.`,
    },
    login: {
        hero: {
            header: 'Reisen und Ausgaben mit der Geschwindigkeit von Chat',
            body: 'Willkommen bei der nächsten Generation von Expensify, in der Ihre Reisen und Ausgaben mit Hilfe von kontextuellem Echtzeit-Chat schneller bearbeitet werden.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Mit Single Sign-On weiter anmelden:',
        orContinueWithMagicCode: 'Sie können sich auch mit einem magischen Code anmelden',
        useSingleSignOn: 'Einmalanmeldung verwenden',
        useMagicCode: 'Magischen Code verwenden',
        launching: 'Wird gestartet ...',
        oneMoment: 'Einen Moment, wir leiten dich zum Single-Sign-On-Portal deines Unternehmens weiter.',
    },
    reportActionCompose: {
        dropToUpload: 'Zum Hochladen hierher ziehen',
        sendAttachment: 'Anhang senden',
        addAttachment: 'Anhang hinzufügen',
        writeSomething: 'Schreibe etwas ...',
        blockedFromConcierge: 'Kommunikation ist untersagt',
        fileUploadFailed: 'Upload fehlgeschlagen. Datei wird nicht unterstützt.',
        localTime: (user: string, time: string) => `Es ist ${time} für ${user}`,
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
        copyEmailToClipboard: 'E-Mail in die Zwischenablage kopieren',
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
            `Dieser Chat ist mit allen Expensify-Mitgliedern in der Domain <strong>${domainRoom}</strong>. Verwende ihn, um mit Kolleg:innen zu chatten, Tipps zu teilen und Fragen zu stellen.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Dieser Chat ist mit dem/der <strong>${workspaceName}</strong>-Admin. Verwende ihn, um über die Einrichtung des Arbeitsbereichs und mehr zu chatten.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `Dieser Chat ist mit allen in <strong>${workspaceName}</strong>. Verwende ihn für die wichtigsten Ankündigungen.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Dieser Chatraum ist für alles, was mit <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> zu tun hat.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Dieser Chat ist für Rechnungen zwischen <strong>${invoicePayer}</strong> und <strong>${invoiceReceiver}</strong>. Verwende die +‑Taste, um eine Rechnung zu senden.`,
        beginningOfChatHistory: (users: string) => `Dieser Chat ist mit ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `Hier reicht <strong>${submitterDisplayName}</strong> Auslagen bei <strong>${workspaceName}</strong> ein. Nutze einfach die +-Taste.`,
        beginningOfChatHistorySelfDM: 'Dies ist dein persönlicher Bereich. Nutze ihn für Notizen, Aufgaben, Entwürfe und Erinnerungen.',
        beginningOfChatHistorySystemDM: 'Willkommen! Lassen Sie uns Ihre Einrichtung vornehmen.',
        chatWithAccountManager: 'Chatte hier mit deiner/deinem Account Manager',
        askMeAnything: 'Frag mich alles!',
        sayHello: 'Sag hallo!',
        yourSpace: 'Dein Bereich',
        welcomeToRoom: (roomName: string) => `Willkommen in ${roomName}!`,
        usePlusButton: (additionalText: string) => `Verwende die +‑Taste, um eine Ausgabe zu ${additionalText}.`,
        askConcierge: 'Dies ist dein Chat mit Concierge, deinem persönlichen KI-Agenten. Ich kann fast alles, probier es aus!',
        conciergeSupport: 'Dein persönlicher KI-Agent',
        create: 'erstellen',
        iouTypes: {
            pay: 'bezahlen',
            split: 'aufteilen',
            submit: 'senden',
            track: 'verfolgen',
            invoice: 'Rechnung',
        },
    },
    adminOnlyCanPost: 'Nur Admins können Nachrichten in diesem Raum senden.',
    reportAction: {
        asCopilot: 'als Copilot für',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `hat diesen Bericht erstellt, um alle Ausgaben aus <a href="${reportUrl}">${reportName}</a> aufzunehmen, die nicht mit der von dir gewählten Häufigkeit eingereicht werden konnten`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName, reportID, isReportDeleted}: CreatedReportForUnapprovedTransactionsParams) =>
            isReportDeleted
                ? `hat diesen Bericht für alle zurückgehaltenen Ausgaben aus dem gelöschten Bericht #${reportID} erstellt`
                : `hat diesen Bericht für alle zurückgehaltenen Ausgaben aus <a href="${reportUrl}">${reportName}</a> erstellt`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Alle in dieser Unterhaltung benachrichtigen',
    },
    newMessages: 'Neue Nachrichten',
    latestMessages: 'Neueste Nachrichten',
    youHaveBeenBanned: 'Hinweis: Du wurdest vom Chatten in diesem Kanal ausgeschlossen.',
    reportTypingIndicator: {
        isTyping: 'schreibt …',
        areTyping: 'tippen ...',
        multipleMembers: 'Mehrere Mitglieder',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Dieser Chatraum wurde archiviert.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Dieser Chat ist nicht mehr aktiv, weil ${displayName} ihr Konto geschlossen hat.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${oldDisplayName} sein Konto mit ${displayName} zusammengeführt hat.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Dieser Chat ist nicht mehr aktiv, weil <strong>du</strong> kein Mitglied des Arbeitsbereichs ${policyName} mehr bist.`
                : `Dieser Chat ist nicht mehr aktiv, weil ${displayName} kein Mitglied des Workspaces ${policyName} mehr ist.`,
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
        buttonFind: 'Etwas finden ...',
        buttonMySettings: 'Meine Einstellungen',
        fabNewChat: 'Chat starten',
        fabNewChatExplained: 'Aktionsmenü öffnen',
        fabScanReceiptExplained: 'Beleg scannen',
        chatPinned: 'Chat angeheftet',
        draftedMessage: 'Entwurfene Nachricht',
        listOfChatMessages: 'Liste der Chatnachrichten',
        listOfChats: 'Chatliste',
        saveTheWorld: 'Rette die Welt',
        tooltip: 'Starte hier!',
        redirectToExpensifyClassicModal: {
            title: 'Bald verfügbar',
            description:
                'Wir nehmen noch ein paar letzte Anpassungen an New Expensify vor, damit alles zu deiner speziellen Einrichtung passt. In der Zwischenzeit kannst du Expensify Classic verwenden.',
        },
    },
    homePage: {
        forYou: 'Für dich',
        timeSensitiveSection: {
            title: 'Zeitkritisch',
            addShippingAddress: {title: 'Wir benötigen deine Versandadresse', subtitle: 'Geben Sie eine Adresse an, um Ihre Expensify Karte zu erhalten.', cta: 'Adresse hinzufügen'},
            addPaymentCard: {title: 'Fügen Sie eine Zahlungskarte hinzu, um Expensify weiter zu nutzen', subtitle: 'Konto > Abonnement', cta: 'Hinzufügen'},
            activateCard: {title: 'Aktivieren Sie Ihre Expensify Karte', subtitle: 'Validieren Sie Ihre Karte und beginnen Sie mit dem Ausgeben.', cta: 'Aktivieren'},
            reviewCardFraud: {
                title: 'Möglichen Betrug mit Ihrer Expensify Karte überprüfen',
                titleWithDetails: ({amount, merchant}: {amount: string; merchant: string}) => `Überprüfe mögliche betrügerische ${amount} bei ${merchant}`,
                subtitle: 'Expensify Karte',
                cta: 'Überprüfen',
            },
            ctaFix: 'Beheben',
            fixCompanyCardConnection: {
                title: ({feedName}: {feedName: string}) => (feedName ? `${feedName}-Firmenkartenverbindung reparieren` : 'Firmenkarte reparieren Verbindung der Firmenkarte reparieren'),
                defaultSubtitle: 'Arbeitsbereich',
                subtitle: ({policyName}: {policyName: string}) => `${policyName} > Unternehmenskarten`,
            },
            fixAccountingConnection: {
                title: ({integrationName}: {integrationName: string}) => `${integrationName}-Verbindung reparieren`,
                defaultSubtitle: 'Arbeitsbereich',
                subtitle: ({policyName}: {policyName: string}) => `${policyName} > Buchhaltung`,
            },
            fixPersonalCardConnection: {
                title: ({cardName}: {cardName?: string}) => (cardName ? `Verbindung der persönlichen Karte ${cardName} reparieren` : 'Verbindung der persönlichen Karte reparieren'),
                subtitle: 'Wallet',
            },
            validateAccount: {title: 'Bestätigen Sie Ihr Konto, um Expensify weiter zu verwenden', subtitle: 'Konto', cta: 'Bestätigen'},
            fixFailedBilling: {title: 'Wir konnten Ihre hinterlegte Karte nicht belasten', subtitle: 'Abonnement'},
        },
        assignedCards: 'Ihre Expensify Karten',
        assignedCardsRemaining: ({amount}: {amount: string}) => `${amount} verbleibend`,
        announcements: 'Ankündigungen',
        discoverSection: {
            title: 'Entdecken',
            menuItemTitleNonAdmin: 'Erfahren Sie, wie Sie Ausgaben erstellen und Berichte einreichen.',
            menuItemTitleAdmin: 'Erfahren Sie, wie Sie Mitglieder einladen, Genehmigungsworkflows bearbeiten und Firmenkarten abstimmen.',
            menuItemDescription: 'Sieh dir an, was Expensify in 2 Minuten kann',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `${count} ${count === 1 ? 'Bericht' : 'Berichte'} einreichen`,
            approve: ({count}: {count: number}) => `${count} ${count === 1 ? 'Bericht' : 'Berichte'} genehmigen`,
            pay: ({count}: {count: number}) => `Zahle ${count} ${count === 1 ? 'Bericht' : 'Berichte'}`,
            export: ({count}: {count: number}) => `${count} ${count === 1 ? 'Bericht' : 'Berichte'} exportieren`,
            begin: 'Begin',
            emptyStateMessages: {
                thumbsUpStarsTitle: 'Sie sind fertig!',
                thumbsUpStarsDescription: 'Daumen hoch für Sie, bleiben Sie gespannt auf weitere Aufgaben.',
                smallRocketTitle: 'Alles erledigt',
                smallRocketDescription: 'Anstehende To-dos werden hier angezeigt.',
                cowboyHatTitle: 'Sie sind fertig!',
                cowboyHatDescription: 'Alle Aufgaben sind erledigt, halten Sie Ausschau nach weiteren.',
                trophy1Title: 'Nichts anzuzeigen',
                trophy1Description: 'Geschafft! Halten Sie Ausschau nach weiteren Aufgaben.',
                palmTreeTitle: 'Alles erledigt',
                palmTreeDescription: 'Zeit zum Entspannen, aber bleiben Sie gespannt auf zukünftige Aufgaben.',
                fishbowlBlueTitle: 'Sie sind fertig!',
                fishbowlBlueDescription: 'Zukünftige Aufgaben werden hier angezeigt.',
                targetTitle: 'Alles erledigt',
                targetDescription: 'Weiter so, Sie bleiben auf Kurs. Schauen Sie später nach weiteren Aufgaben!',
                chairTitle: 'Nichts anzuzeigen',
                chairDescription: 'Entspannen Sie sich, wir listen anstehende Aufgaben hier auf.',
                broomTitle: 'Sie sind fertig!',
                broomDescription: 'Aufgaben sind erledigt, bleiben Sie aber gespannt auf weitere To-dos.',
                houseTitle: 'Alles erledigt',
                houseDescription: 'Hier ist Ihre Zentrale für anstehende Aufgaben.',
                conciergeBotTitle: 'Nichts anzuzeigen',
                conciergeBotDescription: 'Biep biep biep biep, schauen Sie später nach weiteren Aufgaben!',
                checkboxTextTitle: 'Alles erledigt',
                checkboxTextDescription: 'Haken Sie hier Ihre anstehenden Aufgaben ab.',
                flashTitle: 'Sie sind fertig!',
                flashDescription: 'Zukünftige Aufgaben werden hier blitzschnell angezeigt.',
                sunglassesTitle: 'Nichts anzuzeigen',
                sunglassesDescription: 'Zeit zum Entspannen, aber bleiben Sie gespannt auf das, was kommt!',
                f1FlagsTitle: 'Alles erledigt',
                f1FlagsDescription: 'Sie haben alle offenen Aufgaben abgeschlossen.',
                fireworksTitle: 'Alles erledigt',
                fireworksDescription: 'Anstehende Aufgaben erscheinen hier.',
            },
        },
        upcomingTravel: 'Bevorstehende Reisen',
        upcomingTravelSection: {
            flightTo: ({destination}: {destination: string}) => `Flug nach ${destination}`,
            trainTo: ({destination}: {destination: string}) => `Zug nach ${destination}`,
            hotelIn: ({destination}: {destination: string}) => `Hotel in ${destination}`,
            carRentalIn: ({destination}: {destination: string}) => `Mietwagen in ${destination}`,
            inOneWeek: 'In 1 Woche',
            inDays: () => ({one: 'In 1 Tag', other: (count: number) => `In ${count} Tagen`}),
            today: 'Heute',
        },
        freeTrialSection: {
            title: ({days}: {days: number}) => `Kostenlose Testversion: Noch ${days} ${days === 1 ? 'Tag' : 'Tage'}!`,
            offer50Body: 'Sparen Sie 50 % im ersten Jahr!',
            offer25Body: 'Erhalten Sie 25 % Rabatt auf Ihr erstes Jahr!',
            addCardBody: 'Warten Sie nicht! Fügen Sie jetzt Ihre Zahlungskarte hinzu.',
            ctaClaim: 'Anspruch',
            ctaAdd: 'Karte hinzufügen',
            timeRemaining: ({formattedTime}: {formattedTime: string}) => `Verbleibende Zeit: ${formattedTime}`,
            timeRemainingDays: () => ({
                one: 'Verbleibende Zeit: 1 Tag',
                other: (pluralCount: number) => `Verbleibende Zeit: ${pluralCount} Tage`,
            }),
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
        gps: 'GPS',
        odometer: 'Kilometerzähler',
    },
    spreadsheet: {
        upload: 'Tabellendokument hochladen',
        import: 'Tabellenkalkulation importieren',
        dragAndDrop: '<muted-link>Ziehen Sie Ihre Tabelle hierher und legen Sie sie ab oder wählen Sie unten eine Datei aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Ziehen Sie Ihre Tabelle hierher und legen Sie sie ab oder wählen Sie unten eine Datei aus. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Erfahren Sie mehr</a> über unterstützte Dateiformate.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Wähle eine Tabellenkalkulationsdatei zum Importieren aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Wählen Sie eine Tabellenkalkulationsdatei zum Importieren aus. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Weitere Informationen</a> zu unterstützten Dateiformaten.</muted-link>`,
        fileContainsHeader: 'Datei enthält Spaltenüberschriften',
        column: (name: string) => `Spalte ${name}`,
        fieldNotMapped: (fieldName: string) => `Ups! Ein erforderliches Feld („${fieldName}“) wurde nicht zugeordnet. Bitte überprüfe es und versuche es erneut.`,
        singleFieldMultipleColumns: (fieldName: string) => `Ups! Du hast ein einzelnes Feld („${fieldName}“) mehreren Spalten zugeordnet. Bitte überprüfe dies und versuche es erneut.`,
        emptyMappedField: (fieldName: string) => `Ups! Das Feld („${fieldName}“) enthält einen oder mehrere leere Werte. Bitte überprüfe es und versuche es erneut.`,
        importSuccessfulTitle: 'Import erfolgreich',
        importCategoriesSuccessfulDescription: ({categories}: {categories: number}) => (categories > 1 ? `${categories} Kategorien wurden hinzugefügt.` : '1 Kategorie wurde hinzugefügt.'),
        importCompanyCardTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `${transactions} Transaktionen wurden hinzugefügt.` : '1 Transaktion wurde hinzugefügt.',
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
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `${rates} Tagessätze wurden hinzugefügt.` : '1 Tagegeldsatz wurde hinzugefügt.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `${transactions} Buchungen wurden importiert.` : '1 Transaktion wurde importiert.',
        importFailedTitle: 'Import fehlgeschlagen',
        importFailedDescription: 'Bitte stelle sicher, dass alle Felder korrekt ausgefüllt sind, und versuche es erneut. Wenn das Problem weiterhin besteht, wende dich bitte an Concierge.',
        importDescription: 'Wähle aus, welche Felder aus deiner Tabelle zugeordnet werden sollen, indem du unten in der Dropdown-Liste neben jeder importierten Spalte klickst.',
        sizeNotMet: 'Dateigröße muss größer als 0 Bytes sein',
        invalidFileMessage:
            'Die hochgeladene Datei ist entweder leer oder enthält ungültige Daten. Bitte stelle sicher, dass die Datei korrekt formatiert ist und alle erforderlichen Informationen enthält, bevor du sie erneut hochlädst.',
        importSpreadsheetLibraryError: 'Laden des Tabellenmoduls fehlgeschlagen. Bitte überprüfe deine Internetverbindung und versuche es erneut.',
        importSpreadsheet: 'Tabellenkalkulation importieren',
        downloadCSV: 'CSV herunterladen',
        importMemberConfirmation: () => ({
            one: `Bitte bestätige die folgenden Details für ein neues Workspace-Mitglied, das im Rahmen dieses Uploads hinzugefügt wird. Bestehende Mitglieder erhalten keine Rollenaktualisierungen oder Einladungsnachrichten.`,
            other: (count: number) =>
                `Bitte bestätige die folgenden Details für die ${count} neuen Workspace-Mitglieder, die im Rahmen dieses Uploads hinzugefügt werden. Bestehende Mitglieder erhalten keine Rollenaktualisierungen oder Einladungsnachrichten.`,
        }),
    },
    receipt: {
        upload: 'Beleg hochladen',
        uploadMultiple: 'Belege hochladen',
        desktopSubtitleSingle: `oder hierher ziehen und ablegen`,
        desktopSubtitleMultiple: `oder hierher ziehen und ablegen`,
        alternativeMethodsTitle: 'Andere Möglichkeiten, Belege hinzuzufügen:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) =>
            `<label-text><a href="${downloadUrl}">Lade die App herunter</a>, um mit deinem Telefon zu scannen</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Leite Belege weiter an <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Füge deine Nummer hinzu</a>, um Belege an ${phoneNumber} zu senden</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Belege per SMS an ${phoneNumber} senden (nur US-Nummern)</label-text>`,
        takePhoto: 'Foto aufnehmen',
        cameraAccess: 'Für das Fotografieren von Belegen ist Kamerazugriff erforderlich.',
        deniedCameraAccess: `Der Kamerazugriff wurde noch nicht gewährt. Bitte folge <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">diesen Anweisungen</a>.`,
        cameraErrorTitle: 'Kamerafehler',
        cameraErrorMessage: 'Beim Aufnehmen eines Fotos ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        locationAccessTitle: 'Standortzugriff erlauben',
        locationAccessMessage: 'Der Zugriff auf deinen Standort hilft uns, deine Zeitzone und Währung überall korrekt zu halten.',
        locationErrorTitle: 'Standortzugriff erlauben',
        locationErrorMessage: 'Der Zugriff auf deinen Standort hilft uns, deine Zeitzone und Währung überall korrekt zu halten.',
        allowLocationFromSetting: `Der Zugriff auf den Standort hilft uns, Ihre Zeitzone und Währung überall korrekt zu halten. Bitte erlauben Sie den Standortzugriff in den Berechtigungseinstellungen Ihres Geräts.`,
        dropTitle: 'Lass es los',
        dropMessage: 'Datei hierher ziehen',
        flash: 'Blitz',
        multiScan: 'Mehrfachscan',
        shutter: 'Verschluss',
        flipCamera: 'Kamera wechseln',
        gallery: 'Galerie',
        deleteReceipt: 'Beleg löschen',
        deleteConfirmation: 'Sind Sie sicher, dass Sie diesen Beleg löschen möchten?',
        addReceipt: 'Beleg hinzufügen',
        addAdditionalReceipt: 'Zusätzlichen Beleg hinzufügen',
        scanFailed: 'Der Beleg konnte nicht gescannt werden, da Händler, Datum oder Betrag fehlen.',
        crop: 'Zuschneiden',
        addAReceipt: {
            phrase1: 'Beleg hinzufügen',
            phrase2: 'oder ziehe eine hierher und lege sie ab',
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
        paySomeone: (name?: string) => `${name ?? 'jemand'} bezahlen`,
        assignTask: 'Aufgabe zuweisen',
        header: 'Schnellaktion',
        noLongerHaveReportAccess: 'Sie haben keinen Zugriff mehr auf Ihr bisheriges Ziel für Schnellaktionen. Wählen Sie unten ein neues aus.',
        updateDestination: 'Ziel aktualisieren',
        createReport: 'Bericht erstellen',
        createTimeExpense: 'Zeitaufwand erstellen',
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
        splitDates: 'Geteilte Daten',
        splitDateRange: (startDate: string, endDate: string, count: number) => `${startDate} bis ${endDate} (${count} Tage)`,
        splitExpenseSubtitle: (amount: string, merchant: string) => `${amount} von ${merchant}`,
        splitByPercentage: 'Nach Prozentsatz aufteilen',
        splitByDate: 'Nach Datum aufteilen',
        addSplit: 'Aufteilung hinzufügen',
        makeSplitsEven: 'Aufteilungen ausgleichen',
        editSplits: 'Aufteilungen bearbeiten',
        totalAmountGreaterThanOriginal: (amount: string) => `Der Gesamtbetrag ist um ${amount} höher als die ursprüngliche Ausgabe.`,
        totalAmountLessThanOriginal: (amount: string) => `Der Gesamtbetrag ist um ${amount} geringer als die ursprüngliche Ausgabe.`,
        splitExpenseZeroAmount: 'Bitte gib einen gültigen Betrag ein, bevor du fortfährst.',
        splitExpenseOneMoreSplit: 'Keine Aufteilungen hinzugefügt. Füge mindestens eine hinzu, um zu speichern.',
        splitExpenseEditTitle: (amount: string, merchant: string) => `${amount} für ${merchant} bearbeiten`,
        removeSplit: 'Aufteilung entfernen',
        splitExpenseCannotBeEditedModalTitle: 'Diese Ausgabe kann nicht bearbeitet werden',
        splitExpenseCannotBeEditedModalDescription: 'Genehmigte oder bezahlte Ausgaben können nicht bearbeitet werden',
        splitExpenseDistanceErrorModalDescription: 'Bitte behebe den Fehler beim Distanzsatz und versuche es erneut.',
        splitExpensePerDiemRateErrorModalDescription: 'Bitte beheben Sie den Fehler beim Tagessatz und versuchen Sie es erneut.',
        paySomeone: (name?: string) => `${name ?? 'jemand'} bezahlen`,
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
        canceled: 'Storniert',
        posted: 'Gebucht',
        deleteReceipt: 'Beleg löschen',
        findExpense: 'Ausgabe finden',
        deletedTransaction: (amount: string, merchant: string) => `hat eine Ausgabe gelöscht (${amount} für ${merchant})`,
        movedFromReport: (reportName: string) => `hat eine Ausgabe verschoben${reportName ? `von ${reportName}` : ''}`,
        movedTransactionTo: (reportUrl: string, reportName?: string) => `hat diese Ausgabe verschoben${reportName ? `zu <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: (reportUrl: string, reportName?: string) => `hat diese Ausgabe verschoben${reportName ? `von <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: (reportUrl: string) => `hat diese Ausgabe in deinen <a href="${reportUrl}">persönlichen Bereich</a> verschoben`,
        movedAction: (shouldHideMovedReportUrl: boolean, movedReportUrl: string, newParentReportUrl: string, toPolicyName: string) => {
            if (shouldHideMovedReportUrl) {
                return `hat diesen Bericht in den Workspace <a href="${newParentReportUrl}">${toPolicyName}</a> verschoben`;
            }
            return `hat diesen <a href="${movedReportUrl}">Report</a> in den Workspace <a href="${newParentReportUrl}">${toPolicyName}</a> verschoben`;
        },
        pendingMatchWithCreditCard: 'Beleg wartet auf Abgleich mit Kartenumsatz',
        pendingMatch: 'Ausstehende Zuordnung',
        pendingMatchWithCreditCardDescription: 'Beleg wartet auf Abgleich mit Kartenumsatz. Als Barzahlung markieren, um abzubrechen.',
        markAsCash: 'Als Bar markieren',
        pendingMatchSubmitTitle: 'Bericht einreichen',
        pendingMatchSubmitDescription: 'Einige Ausgaben warten auf die Zuordnung mit einer Kreditkartentransaktion. Möchten Sie sie als Bar markieren?',
        routePending: 'Routing ausstehend ...',
        automaticallyEnterExpenseDetails: 'Concierge wird automatisch die Ausgabendetails für Sie eingeben, oder Sie können sie manuell hinzufügen.',
        receiptScanning: () => ({
            one: 'Beleg wird gescannt ...',
            other: 'Belege werden gescannt …',
        }),
        scanMultipleReceipts: 'Mehrere Belege scannen',
        scanMultipleReceiptsDescription: 'Fotografiere alle deine Belege auf einmal und bestätige dann die Details selbst – oder wir erledigen das für dich.',
        receiptScanInProgress: 'Belegscan wird ausgeführt',
        receiptScanInProgressDescription: 'Beleg-Scan läuft. Später erneut prüfen oder Details jetzt eingeben.',
        removeFromReport: 'Aus Bericht entfernen',
        moveToPersonalSpace: 'Belege in deinen persönlichen Bereich verschieben',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Mögliche doppelte Ausgaben erkannt. Überprüfe die Duplikate, um das Einreichen zu ermöglichen.'
                : 'Mögliche doppelte Ausgaben erkannt. Überprüfe die Duplikate, um die Genehmigung zu ermöglichen.',
        receiptIssuesFound: () => ({
            one: 'Problem gefunden',
            other: 'Gefundene Probleme',
        }),
        fieldPending: 'Ausstehend …',
        defaultRate: 'Standardrate',
        receiptMissingDetails: 'Belegangaben fehlen',
        missingAmount: 'Fehlender Betrag',
        missingMerchant: 'Händler fehlt',
        receiptStatusTitle: 'Scannen …',
        receiptStatusText: 'Nur du kannst diesen Beleg sehen, während er gescannt wird. Schau später noch einmal vorbei oder gib die Details jetzt ein.',
        receiptScanningFailed: 'Belegerkennung fehlgeschlagen. Bitte geben Sie die Details manuell ein.',
        transactionPendingDescription: 'Transaktion ausstehend. Die Buchung kann ein paar Tage dauern.',
        companyInfo: 'Unternehmensinfos',
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
            other: 'Möchten Sie diese Ausgaben wirklich löschen?',
        }),
        deleteReport: () => ({
            one: 'Bericht löschen',
            other: 'Berichte löschen',
        }),
        deleteReportConfirmation: () => ({
            one: 'Möchten Sie diesen Bericht wirklich löschen?',
            other: 'Möchten Sie diese Berichte wirklich löschen?',
        }),
        settledExpensify: 'Bezahlt',
        done: 'Fertig',
        settledElsewhere: 'Anderswo bezahlt',
        individual: 'Einzelperson',
        business: 'Business',
        settlePersonal: (formattedAmount?: string) => (formattedAmount ? `${formattedAmount} als Privatperson bezahlen` : `Mit Privatkonto bezahlen`),
        settleWallet: (formattedAmount?: string) => (formattedAmount ? `${formattedAmount} mit Wallet bezahlen` : `Mit Wallet bezahlen`),
        settlePayment: (formattedAmount: string) => `${formattedAmount} bezahlen`,
        settleBusiness: (formattedAmount?: string) => (formattedAmount ? `${formattedAmount} als Unternehmen bezahlen` : `Mit Geschäftskonto bezahlen`),
        payElsewhere: (formattedAmount?: string) => (formattedAmount ? `${formattedAmount} als bezahlt markieren` : `Als bezahlt markieren`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `${amount} mit persönlichem Konto ${last4Digits} bezahlt` : `Mit Privatkonto bezahlt`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `${amount} mit Geschäftskonto ${last4Digits} bezahlt` : `Mit Geschäftskonto bezahlt`),
        payWithPolicy: (policyName: string, formattedAmount?: string) => (formattedAmount ? `Bezahle ${formattedAmount} über ${policyName}` : `Bezahlen über ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `${amount} mit Bankkonto ${last4Digits} bezahlt` : `bezahlt mit Bankkonto ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `${amount ? `${amount} ` : ''} mit Bankkonto ${last4Digits} über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a> bezahlt`,
        invoicePersonalBank: (lastFour: string) => `Persönliches Konto • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Geschäftskonto • ${lastFour}`,
        nextStep: 'Nächste Schritte',
        finished: 'Fertig',
        flip: 'Flip',
        sendInvoice: (amount: string) => `${amount}-Rechnung senden`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `für ${comment}` : ''}`,
        submitted: (memo?: string) => `eingereicht${memo ? `, mit dem Vermerk ${memo}` : ''}`,
        automaticallySubmitted: `eingereicht über <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">Einreichungen verzögern</a>`,
        queuedToSubmitViaDEW: 'zur Einreichung über benutzerdefinierten Genehmigungsworkflow eingereiht',
        queuedToApproveViaDEW: 'Zur Genehmigung über benutzerdefinierten Genehmigungsworkflow eingereiht',
        trackedAmount: (formattedAmount: string, comment?: string) => `Verfolgen ${formattedAmount}${comment ? `für ${comment}` : ''}`,
        splitAmount: (amount: string) => `${amount} aufteilen`,
        didSplitAmount: (formattedAmount: string, comment?: string) => `aufteilen ${formattedAmount}${comment ? `für ${comment}` : ''}`,
        yourSplit: (amount: string) => `Dein Anteil ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} schuldet ${amount}${comment ? `für ${comment}` : ''}`,
        payerOwes: (payer: string) => `${payer} schuldet:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}hat ${amount} bezahlt`,
        payerPaid: (payer: string) => `${payer} hat bezahlt:`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} hat ${amount} ausgegeben`,
        payerSpent: (payer: string) => `${payer} hat ausgegeben:`,
        managerApproved: (manager: string) => `${manager} hat genehmigt:`,
        managerApprovedAmount: (manager: string, amount: number | string) => `${manager} hat ${amount} genehmigt`,
        payerSettled: (amount: number | string) => `${amount} bezahlt`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `${amount} bezahlt. Füge ein Bankkonto hinzu, um deine Zahlung zu erhalten.`,
        automaticallyApproved: `über Genehmigung durch <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a>`,
        approvedAmount: (amount: number | string) => `${amount} genehmigt`,
        approvedMessage: `genehmigt`,
        unapproved: `nicht genehmigt`,
        automaticallyForwarded: `über Genehmigung durch <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a>`,
        forwarded: `genehmigt`,
        rejectedThisReport: 'abgelehnt',
        waitingOnBankAccount: (submitterDisplayName: string) => `hat die Zahlung gestartet, wartet aber darauf, dass ${submitterDisplayName} ein Bankkonto hinzufügt.`,
        adminCanceledRequest: 'hat die Zahlung storniert',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `${amount} Zahlung storniert, weil ${submitterDisplayName} ihr Expensify Wallet nicht innerhalb von 30 Tagen aktiviert hat`,
        settledAfterAddedBankAccount: (submitterDisplayName: string, amount: string) =>
            `${submitterDisplayName} hat ein Bankkonto hinzugefügt. Die Zahlung über ${amount} wurde vorgenommen.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}als bezahlt markiert${comment ? `und sagt „${comment}“` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}mit Wallet bezahlt`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}mit Expensify über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a> bezahlt`,
        noReimbursableExpenses: 'Dieser Bericht enthält einen ungültigen Betrag',
        pendingConversionMessage: 'Die Gesamtsumme wird aktualisiert, sobald du wieder online bist',
        changedTheExpense: 'hat die Ausgabe geändert',
        setTheRequest: (valueName: string, newValueToDisplay: string) => `den Wert ${valueName} auf ${newValueToDisplay}`,
        setTheDistanceMerchant: (translatedChangedField: string, newMerchant: string, newAmountToDisplay: string) =>
            `lege ${translatedChangedField} auf ${newMerchant} fest, wodurch der Betrag auf ${newAmountToDisplay} gesetzt wurde`,
        removedTheRequest: (valueName: string, oldValueToDisplay: string) => `der/die/das ${valueName} (zuvor ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `die/den/das ${valueName} auf ${newValueToDisplay} (zuvor ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `hat ${translatedChangedField} in ${newMerchant} geändert (vorher ${oldMerchant}), wodurch der Betrag auf ${newAmountToDisplay} aktualisiert wurde (vorher ${oldAmountToDisplay})`,
        basedOnAI: 'basierend auf bisherigen Aktivitäten',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `basierend auf den <a href="${rulesLink}">Workspace-Regeln</a>` : 'basierend auf dem Workspace-Regelwerk'),
        threadExpenseReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} ${comment ? `für ${comment}` : 'Ausgabe'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Rechnungsbericht Nr. ${linkedReportID}`,
        threadPaySomeoneReportName: (formattedAmount: string, comment?: string) => `${formattedAmount} gesendet${comment ? `für ${comment}` : ''}`,
        movedFromPersonalSpace: ({reportName, workspaceName}: MovedFromPersonalSpaceParams) =>
            `Ausgabe von persönlichem Bereich nach ${workspaceName ?? `Chat mit ${reportName}`} verschoben`,
        movedToPersonalSpace: 'Ausgabe in persönlichen Bereich verschoben',
        error: {
            invalidCategoryLength: 'Der Kategoriename überschreitet 255 Zeichen. Bitte kürzen Sie ihn oder wählen Sie eine andere Kategorie.',
            invalidTagLength: 'Der Tagname überschreitet 255 Zeichen. Bitte kürzen Sie ihn oder wählen Sie einen anderen Tag.',
            invalidAmount: 'Bitte gib vor dem Fortfahren einen gültigen Betrag ein',
            invalidDistance: 'Bitte gib eine gültige Entfernung ein, bevor du fortfährst',
            invalidReadings: 'Bitte geben Sie sowohl Start- als auch Endstand ein',
            negativeDistanceNotAllowed: 'Endstand muss größer als Anfangsstand sein',
            distanceAmountTooLarge: 'Der Gesamtbetrag ist zu hoch. Verringere die Entfernung oder reduziere den Satz.',
            distanceAmountTooLargeReduceDistance: 'Der Gesamtbetrag ist zu hoch. Verringere die Entfernung.',
            distanceAmountTooLargeReduceRate: 'Der Gesamtbetrag ist zu hoch. Reduziere den Satz.',
            odometerReadingTooLarge: (formattedMax: string) => `Kilometerstände dürfen ${formattedMax} nicht überschreiten.`,
            invalidIntegerAmount: 'Bitte gib einen vollen Dollarbetrag ein, bevor du fortfährst',
            invalidTaxAmount: (amount: string) => `Der maximale Steuerbetrag ist ${amount}`,
            invalidSplit: 'Die Summe der Aufteilungen muss dem Gesamtbetrag entsprechen',
            invalidSplitParticipants: 'Bitte gib für mindestens zwei Teilnehmende einen Betrag größer als null ein',
            invalidSplitYourself: 'Bitte gib für deine Aufteilung einen von null verschiedenen Betrag ein',
            noParticipantSelected: 'Bitte wählen Sie eine:n Teilnehmende:n aus',
            other: 'Unerwarteter Fehler. Bitte versuchen Sie es später erneut.',
            genericCreateFailureMessage: 'Unerwarteter Fehler beim Einreichen dieser Ausgabe. Bitte versuche es später noch einmal.',
            genericCreateInvoiceFailureMessage: 'Unerwarteter Fehler beim Senden dieser Rechnung. Bitte versuche es später noch einmal.',
            genericHoldExpenseFailureMessage: 'Unerwarteter Fehler beim Zurückhalten dieser Ausgabe. Bitte versuche es später erneut.',
            genericUnholdExpenseFailureMessage: 'Unerwarteter Fehler beim Aufheben der Sperre für diese Ausgabe. Bitte versuche es später noch einmal.',
            receiptDeleteFailureError: 'Unerwarteter Fehler beim Löschen dieses Belegs. Bitte versuche es später noch einmal.',
            receiptFailureMessage:
                '<rbr>Beim Hochladen deiner Quittung ist ein Fehler aufgetreten. Bitte <a href="download">speichere die Quittung</a> und <a href="retry">versuche es später erneut</a>.</rbr>',
            receiptFailureMessageShort: 'Beim Hochladen Ihres Belegs ist ein Fehler aufgetreten.',
            genericDeleteFailureMessage: 'Unerwarteter Fehler beim Löschen dieses Belegs. Bitte versuche es später erneut.',
            genericEditFailureMessage: 'Unerwarteter Fehler beim Bearbeiten dieser Ausgabe. Bitte versuche es später noch einmal.',
            genericSmartscanFailureMessage: 'Der Transaktion fehlen Felder',
            duplicateWaypointsErrorMessage: 'Bitte entferne doppelte Wegpunkte',
            atLeastTwoDifferentWaypoints: 'Bitte gib mindestens zwei verschiedene Adressen ein',
            splitExpenseMultipleParticipantsErrorMessage: 'Eine Ausgabe kann nicht zwischen einem Workspace und anderen Mitgliedern aufgeteilt werden. Bitte aktualisiere deine Auswahl.',
            invalidMerchant: 'Bitte gib einen gültigen Händler ein',
            atLeastOneAttendee: 'Mindestens eine teilnehmende Person muss ausgewählt werden',
            invalidQuantity: 'Bitte gib eine gültige Menge ein',
            quantityGreaterThanZero: 'Die Menge muss größer als null sein',
            invalidSubrateLength: 'Es muss mindestens einen Untertarif geben',
            invalidRate: 'Satz nicht gültig für diesen Workspace. Bitte wähle einen verfügbaren Satz aus dem Workspace aus.',
            endDateBeforeStartDate: 'Das Enddatum darf nicht vor dem Startdatum liegen',
            endDateSameAsStartDate: 'Das Enddatum darf nicht mit dem Startdatum übereinstimmen',
            manySplitsProvided: `Die maximale Anzahl zulässiger Aufteilungen beträgt ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `Der Datumsbereich darf ${CONST.IOU.SPLITS_LIMIT} Tage nicht überschreiten.`,
            stitchOdometerImagesFailed: 'Kilometerzählerbilder konnten nicht zusammengeführt werden. Bitte versuchen Sie es später noch einmal.',
        },
        dismissReceiptError: 'Fehler ausblenden',
        dismissReceiptErrorConfirmation: 'Achtung! Wenn du diesen Fehler schließt, wird deine hochgeladene Quittung vollständig entfernt. Bist du sicher?',
        waitingOnEnabledWallet: (submitterDisplayName: string) => `hat mit dem Ausgleich begonnen. Die Zahlung ist ausgesetzt, bis ${submitterDisplayName} das Wallet aktiviert.`,
        enableWallet: 'Wallet aktivieren',
        hold: 'Warteschleife',
        unhold: 'Zurückhalten aufheben',
        holdExpense: () => ({
            one: 'Ausgabe zurückhalten',
            other: 'Ausgaben anhalten',
        }),
        unholdExpense: 'Ausgabe freigeben',
        heldExpense: 'hat diese Ausgabe zurückgehalten',
        unheldExpense: 'Zurückgehaltene Ausgabe freigegeben',
        moveUnreportedExpense: 'Nicht gemeldete Ausgabe verschieben',
        addUnreportedExpense: 'Nicht gemeldete Ausgabe hinzufügen',
        selectUnreportedExpense: 'Wähle mindestens eine Ausgabe aus, um sie dem Bericht hinzuzufügen.',
        emptyStateUnreportedExpenseTitle: 'Keine nicht gemeldeten Ausgaben',
        emptyStateUnreportedExpenseSubtitle: 'Sie scheinen keine nicht eingereichten Ausgaben zu haben. Erstellen Sie unten eine.',
        addUnreportedExpenseConfirm: 'Zu Bericht hinzufügen',
        newReport: 'Neuer Bericht',
        explainHold: () => ({
            one: 'Erkläre, warum du diese Ausgabe zurückhältst.',
            other: 'Erklären Sie, warum Sie diese Ausgaben zurückhalten.',
        }),
        explainHoldApprover: () => ({
            one: 'Erkläre, was du vor der Genehmigung dieser Ausgabe benötigst.',
            other: 'Erkläre, was du vor der Genehmigung dieser Ausgaben benötigst.',
        }),
        retracted: 'zurückgezogen',
        retract: 'Zurückziehen',
        reopened: 'wiedereröffnet',
        reopenReport: 'Bericht wieder öffnen',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Dieser Bericht wurde bereits nach ${connectionName} exportiert. Änderungen können zu Datenabweichungen führen. Bist du sicher, dass du diesen Bericht wieder öffnen möchtest?`,
        reason: 'Grund',
        holdReasonRequired: 'Beim Zurückhalten ist ein Grund erforderlich.',
        expenseWasPutOnHold: 'Spesen wurden zurückgehalten',
        expenseOnHold: 'Diese Ausgabe wurde zurückgestellt. Bitte lies die Kommentare, um die nächsten Schritte zu erfahren.',
        expensesOnHold: 'Alle Ausgaben wurden angehalten. Bitte prüfen Sie die Kommentare für die nächsten Schritte.',
        expenseDuplicate: 'Diese Ausgabe hat ähnliche Details wie eine andere. Bitte überprüfe die Duplikate, um fortzufahren.',
        someDuplicatesArePaid: 'Einige dieser Duplikate wurden bereits genehmigt oder bezahlt.',
        reviewDuplicates: 'Duplikate prüfen',
        keepAll: 'Alle behalten',
        noDuplicatesTitle: 'Alles erledigt!',
        noDuplicatesDescription: 'Es gibt hier keine doppelten Transaktionen zur Überprüfung.',
        confirmApprove: 'Genehmigungsbetrag bestätigen',
        confirmApprovalAmount: 'Nur regelkonforme Ausgaben genehmigen oder den gesamten Bericht genehmigen.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist zurückgestellt. Möchtest du sie trotzdem genehmigen?',
            other: 'Diese Ausgaben sind zurückgestellt. Möchtest du sie trotzdem genehmigen?',
        }),
        confirmPay: 'Zahlungsbetrag bestätigen',
        confirmPayAmount: 'Bezahle, was nicht zurückgestellt ist, oder bezahle den gesamten Bericht.',
        confirmPayAllHoldAmount: () => ({
            one: 'Diese Ausgabe ist angehalten. Möchtest du trotzdem bezahlen?',
            other: 'Diese Ausgaben sind angehalten. Möchtest du sie trotzdem bezahlen?',
        }),
        payOnly: 'Nur zahlen',
        approveOnly: 'Nur genehmigen',
        holdEducationalTitle: 'Soll diese Ausgabe zurückgestellt werden?',
        whatIsHoldExplain: 'Hold ist wie ein „Pause“-Knopf für eine Ausgabe, bis du bereit bist, sie einzureichen.',
        holdIsLeftBehind: 'Zurückgehaltene Ausgaben werden ausgelassen, selbst wenn du einen gesamten Bericht einreichst.',
        unholdWhenReady: 'Gib Ausgaben wieder frei, wenn du bereit bist, sie einzureichen.',
        changePolicyEducational: {
            title: 'Du hast diesen Bericht verschoben!',
            description: 'Überprüfe diese Punkte sorgfältig, da sie sich beim Verschieben von Berichten in einen neuen Workspace häufig ändern.',
            reCategorize: '<strong>Kategorisiere alle Ausgaben neu</strong>, um die Regeln des Arbeitsbereichs einzuhalten.',
            workflows: 'Für diesen Bericht gilt jetzt möglicherweise ein anderer <strong>Genehmigungs-Workflow.</strong>',
        },
        changeWorkspace: 'Arbeitsbereich wechseln',
        set: 'festlegen',
        changed: 'geändert',
        removed: 'entfernt',
        transactionPending: 'Transaktion ausstehend.',
        chooseARate: 'Wähle einen Rückerstattungssatz pro Meile oder Kilometer für den Workspace aus',
        unapprove: 'Genehmigung aufheben',
        unapproveReport: 'Bericht ablehnen',
        headsUp: 'Achtung!',
        unapproveWithIntegrationWarning: (accountingIntegration: string) =>
            `Dieser Bericht wurde bereits nach ${accountingIntegration} exportiert. Änderungen können zu Datenabweichungen führen. Möchtest du die Freigabe dieses Berichts wirklich aufheben?`,
        reimbursable: 'erstattungsfähig',
        nonReimbursable: 'nicht erstattungsfähig',
        bookingPending: 'Diese Buchung ist ausstehend',
        bookingPendingDescription: 'Diese Buchung ist ausstehend, weil sie noch nicht bezahlt wurde.',
        bookingArchived: 'Diese Buchung ist archiviert',
        bookingArchivedDescription: 'Diese Buchung ist archiviert, weil das Reisedatum verstrichen ist. Füge bei Bedarf eine Ausgabe für den endgültigen Betrag hinzu.',
        attendees: 'Teilnehmende',
        whoIsYourAccountant: 'Wer ist Ihre Steuerberaterin bzw. Ihr Steuerberater?',
        paymentComplete: 'Zahlung abgeschlossen',
        time: 'Zeit',
        startDate: 'Startdatum',
        endDate: 'Enddatum',
        startTime: 'Startzeit',
        endTime: 'Endzeit',
        deleteSubrate: 'Untertarif löschen',
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
            one: `Reise: 1 ganzer Tag`,
            other: (count: number) => `Reise: ${count} volle Tage`,
        }),
        dates: 'Daten',
        rates: 'Sätze',
        submitsTo: (name: string) => `Reicht bei ${name} ein`,
        reject: {
            educationalTitle: 'Solltest du zurückhalten oder ablehnen?',
            educationalText: 'Wenn du noch nicht bereit bist, eine Ausgabe zu genehmigen oder zu bezahlen, kannst du sie zurückstellen oder ablehnen.',
            holdExpenseTitle: 'Belege zurückstellen, um vor der Genehmigung oder Zahlung weitere Details anzufordern.',
            approveExpenseTitle: 'Genehmige andere Ausgaben, während zurückgehaltene Ausgaben dir weiterhin zugewiesen bleiben.',
            heldExpenseLeftBehindTitle: 'Zurückgehaltene Ausgaben werden ausgelassen, wenn du einen gesamten Bericht genehmigst.',
            rejectExpenseTitle: 'Lehne eine Ausgabe ab, die du nicht genehmigen oder bezahlen möchtest.',
            reasonPageTitle: 'Ausgabe ablehnen',
            reasonPageDescription: 'Erkläre, warum du diese Ausgabe nicht genehmigen wirst.',
            rejectReason: 'Ablehnungsgrund',
            markAsResolved: 'Als gelöst markieren',
            rejectedStatus: 'Diese Ausgabe wurde abgelehnt. Wir warten darauf, dass du die Probleme behebst und als gelöst markierst, um das Einreichen zu ermöglichen.',
            reportActions: {
                rejectedExpense: 'hat diese Ausgabe abgelehnt',
                markedAsResolved: 'hat den Ablehnungsgrund als gelöst markiert',
            },
        },
        rejectReport: {
            title: 'Bericht ablehnen',
            description: 'Erläutern Sie, warum Sie diesen Bericht nicht genehmigen werden:',
            rejectReason: 'Ablehnungsgrund',
            selectTarget: 'Wählen Sie das Mitglied aus, an das dieser Bericht zur Überprüfung zurückgewiesen werden soll:',
            lastApprover: 'Letzte*r Genehmigende*r',
            submitter: 'Einreicher',
            rejectedReportMessage: 'Dieser Bericht wurde abgelehnt.',
            rejectedNextStep: 'Dieser Bericht wurde abgelehnt. Wir warten darauf, dass Sie die Probleme beheben und ihn manuell erneut einreichen.',
            selectMemberError: 'Wählen Sie ein Mitglied aus, an das dieser Bericht zurückgewiesen werden soll.',
            couldNotReject: 'Der Bericht konnte nicht abgelehnt werden. Bitte versuchen Sie es erneut.',
        },
        moveExpenses: 'Zum Bericht verschieben',
        moveExpensesError: 'Sie können Pauschalspesen nicht in Berichte anderer Arbeitsbereiche verschieben, da die Pauschalsätze je nach Arbeitsbereich unterschiedlich sein können.',
        changeApprover: {
            title: 'Genehmigende Person ändern',
            header: (workflowSettingLink: string) =>
                `Wähle eine Option, um die approvierende Person für diesen Bericht zu ändern. (Aktualisiere deine <a href="${workflowSettingLink}">Workspace-Einstellungen</a>, um dies dauerhaft für alle Berichte zu ändern.)`,
            changedApproverMessage: (managerID: number) => `Genehmigenden in <mention-user accountID="${managerID}"/> geändert`,
            actions: {
                addApprover: 'Genehmiger hinzufügen',
                addApproverSubtitle: 'Füge dem bestehenden Workflow eine weitere genehmigende Person hinzu.',
                bypassApprovers: 'Genehmigende umgehen',
                bypassApproversSubtitle: 'Sich selbst als finale:n Genehmiger:in zuweisen und alle verbleibenden Genehmiger:innen überspringen.',
            },
            addApprover: {
                subtitle: 'Wählen Sie eine zusätzliche genehmigende Person für diesen Bericht, bevor wir ihn durch den restlichen Genehmigungsworkflow leiten.',
            },
        },
        chooseWorkspace: 'Wähle einen Arbeitsbereich',
        routedDueToDEW: (to: string, reason?: string) => `Bericht weitergeleitet an ${to}${reason ? ` weil ${reason}` : ''}`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'Stunde' : 'Stunden'} @ ${rate} / Stunde`,
            hrs: 'Std.',
            hours: 'Stunden',
            ratePreview: (rate: string) => `${rate} / Stunde`,
            amountTooLargeError: 'Der Gesamtbetrag ist zu hoch. Verringere die Stunden oder reduziere den Satz.',
        },
        correctRateError: 'Beheben Sie den Kursfehler und versuchen Sie es erneut.',
        AskToExplain: `. <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}">Erklären<sparkles-icon/></a>`,
        duplicateNonDefaultWorkspacePerDiemError:
            'Sie können Per-Diem-Ausgaben nicht über mehrere Workspaces hinweg duplizieren, da sich die Sätze zwischen den Workspaces unterscheiden können.',
        rulesModifiedFields: {
            reimbursable: (value: boolean) => (value ? 'hat die Ausgabe als „erstattungsfähig“ markiert' : 'hat die Ausgabe als „nicht erstattungsfähig“ markiert'),
            billable: (value: boolean) => (value ? 'hat die Ausgabe als „verrechenbar“ markiert' : 'hat die Ausgabe als „nicht abrechenbar“ markiert'),
            tax: (value: string, isFirst: boolean) => (isFirst ? `Steuersatz auf „${value}“ festlegen` : `Steuersatz auf „${value}“`),
            reportName: (value: string) => `hat diese Ausgabe in den Bericht „${value}“ verschoben`,
            common: (key: keyof PolicyRulesModifiedFields | keyof PersonalRulesModifiedFields, value: string, isFirst: boolean) => {
                const field = translations.common[key].toLowerCase();
                return isFirst ? `setze ${field} auf „${value}“` : `${field} zu „${value}“`;
            },
            formatPersonalRules: (fragments: string, route: string) => `${fragments} über <a href="${route}">Regeln für persönliche Ausgaben</a>`,
            formatPolicyRules: (fragments: string, route: string) => `${fragments} über <a href="${route}">Workspace-Regeln</a>`,
        },
        failedToAutoSubmitViaDEW: (reason: string) => `Senden des Berichts über <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">Übermittlungen verzögern</a> fehlgeschlagen. ${reason}`,
        failedToSubmitViaDEW: (reason: string) => `Der Bericht konnte nicht übermittelt werden. ${reason}`,
        failedToAutoApproveViaDEW: (reason: string) => `Genehmigung über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a> fehlgeschlagen. ${reason}`,
        failedToApproveViaDEW: (reason: string) => `Genehmigung fehlgeschlagen. ${reason}`,
        cannotDuplicateDistanceExpense:
            'Sie können Entfernungsausgaben nicht über mehrere Arbeitsbereiche hinweg duplizieren, da sich die Sätze zwischen den Arbeitsbereichen unterscheiden können.',
        deleted: 'Gelöscht',
    },
    transactionMerge: {
        listPage: {
            header: 'Ausgaben zusammenführen',
            noEligibleExpenseFound: 'Keine berechtigten Ausgaben gefunden',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Sie haben keine Ausgaben, die mit dieser zusammengeführt werden können. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Erfahren Sie mehr</a> über berechtigte Ausgaben.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Wähle eine <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">berechtigte Ausgabe</a> zum Zusammenführen mit <strong>${reportName}</strong> aus.`,
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
                const article = StringUtils.startsWithVowel(field) ? 'an' : 'a';
                return `Bitte wählen Sie ${article} ${field} aus`;
            },
            pleaseSelectAttendees: 'Bitte wählen Sie Teilnehmende aus',
            selectAllDetailsError: 'Wähle alle Details aus, bevor du fortfährst.',
        },
        confirmationPage: {
            header: 'Details bestätigen',
            pageTitle: 'Bestätige die Details, die du behältst. Die Details, die du nicht behältst, werden gelöscht.',
            confirmButton: 'Ausgaben zusammenführen',
        },
    },
    share: {
        shareToExpensify: 'Zu Expensify teilen',
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
        numberHasNotBeenValidated: 'Die Nummer wurde noch nicht verifiziert. Klicke auf die Schaltfläche, um den Bestätigungslink per SMS erneut zu senden.',
        emailHasNotBeenValidated: 'Die E‑Mail wurde noch nicht verifiziert. Klicke auf die Schaltfläche, um den Bestätigungslink per SMS erneut zu senden.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Foto hochladen',
        removePhoto: 'Foto entfernen',
        editImage: 'Foto bearbeiten',
        viewPhoto: 'Foto ansehen',
        imageUploadFailed: 'Bildupload fehlgeschlagen',
        deleteWorkspaceError: 'Entschuldigung, beim Löschen deines Arbeitsbereichsavatars ist ein unerwartetes Problem aufgetreten',
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
        choosePresetAvatar: 'Oder wähle einen eigenen Avatar',
    },
    modal: {
        backdropLabel: 'Modal-Hintergrund',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>Sie</strong> Spesen hinzufügen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> Ausgaben hinzufügt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf eine:n Admin, der Ausgaben hinzufügt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wartet darauf, dass <strong>Sie</strong> Spesen einreichen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> Ausgaben einreicht.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass ein Admin Spesen einreicht.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Kein weiterer Handlungsbedarf!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>Sie</strong> ein Bankkonto hinzufügen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> ein Bankkonto hinzufügt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten Sie darauf, dass ein Admin ein Bankkonto hinzufügt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `am ${eta} eines jeden Monats` : ` ${eta}`;
                }
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>Ihre</strong> Ausgaben automatisch eingereicht werden${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Es wird darauf gewartet, dass die Ausgaben von <strong>${actor}</strong> automatisch eingereicht werden${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Es wird darauf gewartet, dass die Ausgaben eines Admins automatisch eingereicht werden${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten auf <strong>Sie</strong>, um die Probleme zu beheben.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> die Probleme behebt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf eine*n Admin, um die Probleme zu beheben.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Es wird darauf gewartet, dass <strong>Sie</strong> Spesen genehmigen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf die Genehmigung der Ausgaben durch <strong>${actor}</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf Genehmigung der Ausgaben durch eine Adminperson.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>Sie</strong> diesen Bericht exportieren.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> diesen Bericht exportiert.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf eine Administratorin oder einen Administrator, um diesen Bericht zu exportieren.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wartet darauf, dass <strong>Sie</strong> Spesen bezahlen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf <strong>${actor}</strong>, um Auslagen zu bezahlen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass eine Adminperson Spesen bezahlt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>Sie</strong> die Einrichtung eines Geschäftskontos abschließen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> die Einrichtung eines Geschäftskontos abschließt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf eine Administration, um das Einrichten eines geschäftlichen Bankkontos abzuschließen.`;
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
                `Ups! Sie scheinen diesen Bericht bei <strong>sich selbst</strong> einzureichen. Die Genehmigung eigener Berichte ist in Ihrem Workspace <strong>verboten</strong>. Bitte reichen Sie diesen Bericht bei jemand anderem ein oder kontaktieren Sie Ihre Admin, um die Person zu ändern, an die Sie Berichte einreichen.`,
            [CONST.NEXT_STEP.MESSAGE_KEY.REJECTED_REPORT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Dieser Bericht wurde abgelehnt. Es wird darauf gewartet, dass <strong>Sie</strong> die Probleme beheben und ihn manuell erneut einreichen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Dieser Bericht wurde abgelehnt. Es wird darauf gewartet, dass <strong>${actor}</strong> die Probleme behebt und den Bericht manuell erneut einreicht.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Dieser Bericht wurde abgelehnt. Es wird darauf gewartet, dass ein Admin die Probleme behebt und ihn manuell erneut einreicht.`;
                }
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'in Kürze',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'heute später',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'am Sonntag',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: 'am 1. und 16. eines jeden Monats',
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
        invalidFileMessage: 'Ungültige Datei. Bitte versuchen Sie ein anderes Bild.',
        avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchronisierung',
        profileAvatar: 'Profil-Avatar',
        publicSection: {
            title: 'Öffentlich',
            subtitle: 'Diese Angaben werden in deinem öffentlichen Profil angezeigt. Jede:r kann sie sehen.',
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
        featureRequiresValidate: 'Für diese Funktion müssen Sie Ihr Konto verifizieren.',
        validateAccount: 'Bestätige dein Konto',
        helpText: ({email}: {email: string}) =>
            `Füge weitere Möglichkeiten hinzu, dich anzumelden und Belege an Expensify zu senden.<br/><br/>Füge eine E‑Mail-Adresse hinzu, um Belege an <a href="mailto:${email}">${email}</a> weiterzuleiten, oder füge eine Telefonnummer hinzu, um Belege per SMS an 47777 zu senden (nur US-Nummern).`,
        pleaseVerify: 'Bitte bestätige diese Kontaktmethode.',
        getInTouch: 'Wir verwenden diese Methode, um Sie zu kontaktieren.',
        enterMagicCode: (contactMethod: string) => `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde. Er sollte innerhalb einer oder zwei Minuten ankommen.`,
        setAsDefault: 'Als Standard festlegen',
        yourDefaultContactMethod:
            'Dies ist Ihre aktuelle Standard-Kontaktmethode. Bevor Sie sie löschen können, müssen Sie eine andere Kontaktmethode auswählen und auf „Als Standard festlegen“ klicken.',
        removeContactMethod: 'Kontaktmethode entfernen',
        removeAreYouSure: 'Sind Sie sicher, dass Sie diese Kontaktmethode entfernen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
        failedNewContact: 'Das Hinzufügen dieser Kontaktmethode ist fehlgeschlagen.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Senden eines neuen Magic-Codes fehlgeschlagen. Bitte warten Sie einen Moment und versuchen Sie es erneut.',
            validateSecondaryLogin: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            deleteContactMethod: 'Kontaktmethode konnte nicht gelöscht werden. Bitte wende dich für Hilfe an Concierge.',
            setDefaultContactMethod: 'Fehler beim Festlegen einer neuen Standardkontaktmethode. Bitte wende dich für Hilfe an Concierge.',
            addContactMethod: 'Diese Kontaktmethode konnte nicht hinzugefügt werden. Bitte wende dich für Hilfe an Concierge.',
            enteredMethodIsAlreadySubmitted: 'Diese Kontaktmethode existiert bereits',
            passwordRequired: 'Passwort erforderlich.',
            contactMethodRequired: 'Kontaktmethode ist erforderlich',
            invalidContactMethod: 'Ungültige Kontaktmethode',
        },
        newContactMethod: 'Neue Kontaktmethode',
        goBackContactMethods: 'Zurück zu den Kontaktmethoden',
        yourDefaultContactMethodRestrictedSwitch: 'Dies ist Ihre derzeitige standardmäßige Kontaktmethode. Ihr Unternehmen hat das Entfernen oder Ändern eingeschränkt.',
    },
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Er / Ihn / Sein',
        heHimHisTheyThemTheirs: 'Er / Ihn / Sein / Dey / Dem / Deren',
        sheHerHers: 'Sie / Ihr / Ihre',
        sheHerHersTheyThemTheirs: 'Sie / Ihr / Ihre / Sie / Ihnen / Ihre',
        merMers: 'Meer / Meere',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'pro Person / Personen',
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
            appDownloadLinks: 'App-Downloadlinks',
            viewKeyboardShortcuts: 'Tastenkombinationen anzeigen',
            viewTheCode: 'Code anzeigen',
            viewOpenJobs: 'Offene Aufträge anzeigen',
            reportABug: 'Fehler melden',
            troubleshoot: 'Problembehandlung',
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
            description:
                '<muted-text>Verwende die folgenden Tools, um Probleme mit Expensify zu beheben. Wenn du auf Probleme stößt, <concierge-link>melde bitte einen Fehler</concierge-link>.</muted-text>',
            confirmResetDescription: 'Alle nicht gesendeten Entwurfsnachrichten gehen verloren, aber alle anderen Daten sind sicher.',
            resetAndRefresh: 'Zurücksetzen und aktualisieren',
            clientSideLogging: 'Clientseitige Protokollierung',
            noLogsToShare: 'Keine Protokolle zum Teilen',
            useProfiling: 'Profiling verwenden',
            profileTrace: 'Profil-Trace',
            results: 'Ergebnisse',
            releaseOptions: 'Release-Optionen',
            testingPreferences: 'Testeinstellungen',
            useStagingServer: 'Staging-Server verwenden',
            forceOffline: 'Offline erzwingen',
            simulatePoorConnection: 'Schlechte Internetverbindung simulieren',
            simulateFailingNetworkRequests: 'Fehlgeschlagene Netzwerk­anfragen simulieren',
            authenticationStatus: 'Authentifizierungsstatus',
            deviceCredentials: 'Geräteanmeldedaten',
            invalidate: 'Ungültig machen',
            destroy: 'Vernichten',
            maskExportOnyxStateData: 'Empfindliche Mitgliedsdaten beim Export des Onyx-Status maskieren',
            exportOnyxState: 'Onyx-Status exportieren',
            importOnyxState: 'Onyx-Status importieren',
            testCrash: 'Testabsturz',
            resetToOriginalState: 'Auf ursprünglichen Zustand zurücksetzen',
            usingImportedState: 'Du verwendest importierten Status. Tippe hier, um ihn zu löschen.',
            debugMode: 'Debug-Modus',
            invalidFile: 'Ungültige Datei',
            invalidFileDescription: 'Die Datei, die Sie zu importieren versuchen, ist ungültig. Bitte versuchen Sie es erneut.',
            invalidateWithDelay: 'Mit Verzögerung ungültig machen',
            leftHandNavCache: 'Cache der linken Navigation',
            clearleftHandNavCache: 'Löschen',
            softKillTheApp: 'App sanft beenden',
            kill: 'Töten',
            sentryDebug: 'Sentry-Debug',
            sentrySendDescription: 'Daten an Sentry senden',
            sentryDebugDescription: 'Sentry-Anfragen in der Konsole protokollieren',
            sentryHighlightedSpanOps: 'Hervorgehobene Spannen-Namen',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaktion.klick, navigation, ui.laden',
        },
        security: 'Sicherheit',
        signOut: 'Abmelden',
        restoreStashed: 'Gespeicherten Login wiederherstellen',
        signOutConfirmationText: 'Alle Offline-Änderungen gehen verloren, wenn du dich abmeldest.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `Lesen Sie die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und die <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzerklärung</a>.`,
        help: 'Hilfe',
        whatIsNew: 'Was ist neu',
        accountSettings: 'Kontoeinstellungen',
        account: 'Konto',
        general: 'Allgemein',
        helpPage: {title: 'Hilfe und Support', description: 'Wir sind rund um die Uhr für Sie da', helpSite: 'Hilfeseite'},
    },
    closeAccountPage: {
        closeAccount: 'Konto schließen',
        reasonForLeavingPrompt: 'Wir würden es sehr bedauern, wenn du gehst! Würdest du uns bitte sagen, warum, damit wir uns verbessern können?',
        enterMessageHere: 'Nachricht hier eingeben',
        closeAccountWarning: 'Das Schließen Ihres Kontos kann nicht rückgängig gemacht werden.',
        closeAccountPermanentlyDeleteData: 'Möchtest du dein Konto wirklich löschen? Dadurch werden alle offenen Ausgaben dauerhaft gelöscht.',
        enterDefaultContactToConfirm: 'Bitte gib deine Standard-Kontaktmethode ein, um zu bestätigen, dass du dein Konto schließen möchtest. Deine Standard-Kontaktmethode ist:',
        enterDefaultContact: 'Gib deine Standard-Kontaktmethode ein',
        defaultContact: 'Standard-Kontaktmethode:',
        enterYourDefaultContactMethod: 'Bitte gib deine Standard-Kontaktmethode ein, um dein Konto zu schließen.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Konten zusammenführen',
        accountDetails: {
            accountToMergeInto: (login: string) => `Gib das Konto ein, das du mit <strong>${login}</strong> zusammenführen möchtest.`,
            notReversibleConsent: 'Ich verstehe, dass dies nicht rückgängig gemacht werden kann',
        },
        accountValidate: {
            confirmMerge: 'Sind Sie sicher, dass Sie Konten zusammenführen möchten?',
            lossOfUnsubmittedData: (login: string) => `Das Zusammenführen Ihrer Konten ist endgültig und führt zum Verlust aller nicht eingereichten Ausgaben für <strong>${login}</strong>.`,
            enterMagicCode: (login: string) => `Um fortzufahren, gib bitte den magischen Code ein, der an <strong>${login}</strong> gesendet wurde.`,
            errors: {
                incorrectMagicCode: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
                fallback: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konten zusammengeführt!',
            description: (from: string, to: string) =>
                `<muted-text><centered-text>Du hast erfolgreich alle Daten von <strong>${from}</strong> in <strong>${to}</strong> zusammengeführt. Zukünftig kannst du für dieses Konto entweder die eine oder die andere Anmeldung verwenden.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Wir arbeiten daran',
            limitedSupport: 'Wir unterstützen das Zusammenführen von Konten in New Expensify noch nicht. Bitte führe diese Aktion stattdessen in Expensify Classic aus.',
            reachOutForHelp: '<muted-text><centered-text>Wende dich bei Fragen gerne an den <concierge-link>Concierge</concierge-link>!</centered-text></muted-text>',
            goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        },
        mergeFailureSAMLDomainControlDescription: (email: string) =>
            `<muted-text><centered-text>Du kannst <strong>${email}</strong> nicht zusammenführen, da es von <strong>${email.split('@').at(1) ?? ''}</strong> verwaltet wird. Bitte <concierge-link>wende dich für Unterstützung an Concierge</concierge-link>.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: (email: string) =>
            `<muted-text><centered-text>Du kannst <strong>${email}</strong> nicht mit anderen Konten zusammenführen, weil deine Domain-Administration es als deine primäre Anmeldung festgelegt hat. Bitte führe stattdessen andere Konten mit diesem Konto zusammen.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: (email: string) =>
                `<muted-text><centered-text>Konten können nicht zusammengeführt werden, weil für <strong>${email}</strong> die Zwei-Faktor-Authentifizierung (2FA) aktiviert ist. Bitte deaktiviere 2FA für <strong>${email}</strong> und versuche es erneut.</centered-text></muted-text>`,
            learnMore: 'Erfahre mehr über das Zusammenführen von Konten.',
        },
        mergeFailureAccountLockedDescription: (email: string) =>
            `<muted-text><centered-text>Du kannst <strong>${email}</strong> nicht zusammenführen, da sie gesperrt ist. Bitte <concierge-link>wende dich für Unterstützung an Concierge</concierge-link>.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: (email: string, contactMethodLink: string) =>
            `<muted-text><centered-text>Du kannst keine Konten zusammenführen, weil <strong>${email}</strong> kein Expensify-Konto hat. Bitte <a href="${contactMethodLink}">füge sie stattdessen als Kontaktmethode hinzu</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: (email: string) =>
            `<muted-text><centered-text>Sie können <strong>${email}</strong> nicht mit anderen Konten zusammenführen. Bitte führen Sie stattdessen andere Konten mit diesem zusammen.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: (email: string) =>
            `<muted-text><centered-text>Du kannst keine Konten mit <strong>${email}</strong> zusammenführen, weil dieses Konto eine abgerechnete Rechnungsbeziehung besitzt.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Versuche es später erneut',
            description: 'Es gab zu viele Versuche, Konten zusammenzuführen. Bitte versuche es später erneut.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Sie können nicht mit anderen Konten zusammenführen, weil dieses Konto nicht verifiziert ist. Bitte verifizieren Sie das Konto und versuchen Sie es erneut.',
        },
        mergeFailureSelfMerge: {
            description: 'Ein Konto kann nicht mit sich selbst zusammengeführt werden.',
        },
        mergeFailureGenericHeading: 'Konten können nicht zusammengeführt werden',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Verdächtige Aktivität melden',
        lockAccount: 'Konto sperren',
        unlockAccount: 'Konto entsperren',
        compromisedDescription:
            'Ist Ihnen etwas Ungewöhnliches mit Ihrem Konto aufgefallen? Wenn Sie es melden, wird Ihr Konto sofort gesperrt, neue Expensify Karte-Transaktionen werden blockiert und alle Kontenänderungen verhindert.',
        domainAdminsDescription: 'Für Domain-Admins: Dadurch werden auch alle Aktivitäten der Expensify Karte und alle Administratoraktionen in Ihrer/Ihren Domain(s) pausiert.',
        areYouSure: 'Möchtest du dein Expensify-Konto wirklich sperren?',
        onceLocked: 'Sobald Ihr Konto gesperrt ist, wird es eingeschränkt, bis eine Entsperrungsanfrage gestellt und eine Sicherheitsprüfung durchgeführt wurde',
        unlockTitle: 'Wir haben Ihre Anfrage erhalten',
        unlockDescription: 'Wir überprüfen das Konto, um sicherzustellen, dass es sicher entsperrt werden kann, und melden uns bei Fragen über Concierge.',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Konto konnte nicht gesperrt werden',
        failedToLockAccountDescription: `Wir konnten Ihr Konto nicht sperren. Bitte chatten Sie mit Concierge, um dieses Problem zu beheben.`,
        chatWithConcierge: 'Mit Concierge chatten',
    },
    unlockAccountPage: {
        accountLocked: 'Konto gesperrt',
        yourAccountIsLocked: 'Dein Konto ist gesperrt',
        chatToConciergeToUnlock: 'Chatte mit Concierge, um Sicherheitsbedenken zu klären und dein Konto zu entsperren.',
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

            Hinweis: Das Einrichten der Zwei-Faktor-Authentifizierung meldet dich von allen anderen aktiven Sitzungen ab.
        `),
        errorStepCodes: 'Bitte kopiere oder lade die Codes herunter, bevor du fortfährst',
        stepVerify: 'Bestätigen',
        scanCode: 'Scanne den QR-Code mit deinem',
        authenticatorApp: 'Authentifizierungs-App',
        addKey: 'Oder füge diesen geheimen Schlüssel zu deiner Authentifizierungs-App hinzu:',
        secretKey: 'geheimer Schlüssel',
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
        twoFactorAuthIsRequiredForAdminsTitle: 'Bitte aktiviere die Zwei-Faktor-Authentifizierung',
        twoFactorAuthIsRequiredXero: 'Ihre Xero-Buchhaltungsverbindung erfordert eine Zwei-Faktor-Authentifizierung.',
        twoFactorAuthIsRequiredCompany: 'Ihr Unternehmen verlangt eine Zwei-Faktor-Authentifizierung.',
        twoFactorAuthCannotDisable: '2FA kann nicht deaktiviert werden',
        twoFactorAuthRequired: 'Die Zwei-Faktor-Authentifizierung (2FA) ist für Ihre Xero-Verbindung erforderlich und kann nicht deaktiviert werden.',
        replaceDevice: 'Gerät ersetzen',
        replaceDeviceTitle: 'Zwei-Faktor-Gerät ersetzen',
        verifyOldDeviceTitle: 'Altes Gerät verifizieren',
        verifyOldDeviceDescription: 'Geben Sie den sechsstelligen Code aus Ihrer aktuellen Authentifizierungs-App ein, um zu bestätigen, dass Sie Zugriff darauf haben.',
        verifyNewDeviceTitle: 'Neues Gerät einrichten',
        verifyNewDeviceDescription: 'Scannen Sie den QR-Code mit Ihrem neuen Gerät und geben Sie dann den Code ein, um die Einrichtung abzuschließen.',
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
        personalNoteMessage: 'Notizen zu diesem Chat hier festhalten. Nur du kannst diese Notizen hinzufügen, bearbeiten oder anzeigen.',
        sharedNoteMessage: 'Führe hier Notizen zu diesem Chat. Expensify-Mitarbeitende und andere Mitglieder mit der Domain team.expensify.com können diese Notizen einsehen.',
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
        changeBillingCurrency: 'Rechnungswährung ändern',
        changePaymentCurrency: 'Zahlungswährung ändern',
        paymentCurrency: 'Zahlungswährung',
        paymentCurrencyDescription: 'Wähle eine standardisierte Währung, in die alle privaten Ausgaben umgerechnet werden sollen',
        note: `Hinweis: Wenn du deine Zahlungssprache änderst, kann sich das darauf auswirken, wie viel du für Expensify bezahlst. Sieh dir unsere <a href="${CONST.PRICING}">Preisseite</a> an, um alle Details zu erfahren.`,
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
            addressCity: 'Bitte geben Sie eine Stadt ein',
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
            paymentCardNumber: 'Bitte gib eine gültige Kartennummer ein',
            expirationDate: 'Bitte wähle ein gültiges Ablaufdatum aus',
            securityCode: 'Bitte gib einen gültigen Sicherheitscode ein',
            addressStreet: 'Bitte gib eine gültige Rechnungsadresse ein, die kein Postfach ist',
            addressState: 'Bitte wählen Sie einen Bundesstaat aus',
            addressCity: 'Bitte geben Sie eine Stadt ein',
            genericFailureMessage: 'Beim Hinzufügen Ihrer Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            password: 'Bitte gib dein Expensify-Passwort ein',
        },
    },
    personalCard: {
        addPersonalCard: 'Persönliche Karte hinzufügen',
        addCompanyCard: 'Firmenkarte hinzufügen',
        lookingForCompanyCards: 'Müssen Sie Firmenkarten hinzufügen?',
        lookingForCompanyCardsDescription: 'Verbinden Sie Ihre eigenen Karten von über 10.000 Banken weltweit.',
        personalCardAdded: 'Persönliche Karte hinzugefügt!',
        personalCardAddedDescription: 'Herzlichen Glückwunsch! Wir beginnen nun mit dem Import von Transaktionen Ihrer Karte.',
        isPersonalCard: 'Ist dies eine private Karte?',
        thisIsPersonalCard: 'Dies ist eine private Karte',
        thisIsCompanyCard: 'Dies ist eine Firmenkarte',
        askAdmin: 'Fragen Sie Ihren Administrator',
        warningDescription: ({isAdmin}: {isAdmin?: boolean}) =>
            `Wenn ja, super! Aber wenn es eine <strong>Firmen</strong>karte ist, weisen Sie sie bitte ${isAdmin ? 'stattdessen über Ihren Workspace zu.' : 'bitten Sie Ihren Administrator, sie Ihnen stattdessen über den Workspace zuzuweisen.'}`,
        bankConnectionError: 'Bankverbindungsproblem',
        bankConnectionDescription: 'Bitte versuchen Sie, Ihre Karten erneut hinzuzufügen. Andernfalls können Sie',
        connectWithPlaid: 'eine Verbindung über Plaid herstellen.',
        brokenConnection: 'Ihre Kartenverbindung ist unterbrochen.',
        conciergeBrokenConnection: ({cardName, connectionLink}: ConciergeBrokenCardConnectionParams) =>
            connectionLink
                ? `Die Verbindung Ihrer ${cardName}-Karte ist unterbrochen. <a href="${connectionLink}">Melden Sie sich bei Ihrer Bank an</a>, um die Karte zu reparieren.`
                : `Die Verbindung Ihrer ${cardName}-Karte ist unterbrochen. Melden Sie sich bei Ihrer Bank an, um die Karte zu reparieren.`,
        fixCard: 'Karte reparieren',
        addAdditionalCards: 'Weitere Karten hinzufügen',
        upgradeDescription: 'Müssen Sie weitere Karten hinzufügen? Erstellen Sie einen Workspace, um weitere persönliche Karten hinzuzufügen oder Firmenkarten dem gesamten Team zuzuweisen.',
        onlyAvailableOnPlan: ({formattedPrice}: {formattedPrice: string}) =>
            `<muted-text>Dies ist im Collect-Tarif verfügbar, der <strong>${formattedPrice}</strong> pro Mitglied und Monat kostet.</muted-text>`,
        note: (subscriptionLink: string) =>
            `<muted-text>Erstellen Sie einen Workspace, um auf diese Funktion zuzugreifen, oder <a href="${subscriptionLink}">erfahren Sie mehr</a> über unsere Tarife und Preise.</muted-text>`,
        workspaceCreated: 'Workspace erstellt',
        newWorkspace: 'Sie haben einen Workspace erstellt!',
        successMessage: ({subscriptionLink}: {subscriptionLink: string}) =>
            `<centered-text>Sie können jetzt weitere Karten hinzufügen. <a href="${subscriptionLink}">Zeigen Sie Ihr Abonnement an</a> für weitere Details.</centered-text>`,
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
            'Alle nicht eingereichten Kartenumsätze, einschließlich der auf offenen Berichten, werden entfernt. Möchtest du diese Karte wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
        error: {
            notOwnerOfBankAccount: 'Beim Festlegen dieses Bankkontos als deine Standardzahlungsmethode ist ein Fehler aufgetreten',
            invalidBankAccount: 'Dieses Bankkonto ist vorübergehend gesperrt',
            notOwnerOfFund: 'Beim Festlegen dieser Karte als deine Standardzahlungsmethode ist ein Fehler aufgetreten',
            setDefaultFailure: 'Etwas ist schiefgelaufen. Bitte chatte mit Concierge, um weitere Unterstützung zu erhalten.',
        },
        addBankAccountFailure: 'Beim Hinzufügen Ihres Bankkontos ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        getPaidFaster: 'Schneller bezahlt werden',
        addPaymentMethod: 'Fügen Sie eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        getPaidBackFaster: 'Lass dich schneller auszahlen',
        secureAccessToYourMoney: 'Sicherer Zugriff auf Ihr Geld',
        receiveMoney: 'Geld in Ihrer Landeswährung empfangen',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Sende und empfange Geld mit Freunden. Nur für US-Bankkonten.',
        enableWallet: 'Wallet aktivieren',
        addBankAccountToSendAndReceive: 'Füge ein Bankkonto hinzu, um Zahlungen zu senden oder zu empfangen.',
        addDebitOrCreditCard: 'Debit- oder Kreditkarte hinzufügen',
        assignedCards: 'Zugewiesene Karten',
        assignedCardsDescription: 'Transaktionen von diesen Karten werden automatisch synchronisiert.',
        expensifyCard: 'Expensify Karte',
        walletActivationPending: 'Wir überprüfen gerade Ihre Angaben. Bitte schauen Sie in ein paar Minuten noch einmal vorbei!',
        walletActivationFailed: 'Leider kann Ihre Wallet derzeit nicht aktiviert werden. Bitte chatten Sie mit Concierge, um weitere Unterstützung zu erhalten.',
        addYourBankAccount: 'Füge dein Bankkonto hinzu',
        addBankAccountBody: 'Verbinden wir dein Bankkonto mit Expensify, damit du so einfach wie nie zuvor Zahlungen direkt in der App senden und empfangen kannst.',
        chooseYourBankAccount: 'Wähle dein Bankkonto aus',
        chooseAccountBody: 'Stellen Sie sicher, dass Sie die richtige Option auswählen.',
        confirmYourBankAccount: 'Bestätige dein Bankkonto',
        personalBankAccounts: 'Persönliche Bankkonten',
        businessBankAccounts: 'Geschäftsbankkonten',
        shareBankAccount: 'Bankkonto freigeben',
        bankAccountShared: 'Bankkonto geteilt',
        shareBankAccountTitle: 'Wähle die Admins aus, mit denen dieses Bankkonto geteilt werden soll:',
        shareBankAccountSuccess: 'Bankkonto geteilt!',
        shareBankAccountSuccessDescription: 'Die ausgewählten Admins erhalten eine Bestätigungsnachricht von Concierge.',
        shareBankAccountFailure: 'Beim Versuch, das Bankkonto zu teilen, ist ein unerwarteter Fehler aufgetreten. Bitte versuche es erneut.',
        shareBankAccountEmptyTitle: 'Keine Administratoren verfügbar',
        shareBankAccountEmptyDescription: 'Es gibt keine Arbeitsbereich-Admins, mit denen du dieses Bankkonto teilen kannst.',
        shareBankAccountNoAdminsSelected: 'Bitte wähle eine:n Admin aus, bevor du fortfährst',
        unshareBankAccount: 'Bankkonto freigeben beenden',
        unshareBankAccountDescription:
            'Alle unten aufgeführten Personen haben Zugriff auf dieses Bankkonto. Du kannst den Zugriff jederzeit entfernen. Wir werden dennoch alle laufenden Zahlungen abschließen.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} wird den Zugriff auf dieses Geschäftskonto verlieren. Wir schließen dennoch alle laufenden Zahlungen ab.`,
        reachOutForHelp: 'Sie wird mit der Expensify Karte verwendet. <concierge-link>Wenden Sie sich an Concierge</concierge-link>, wenn Sie sie nicht mehr teilen möchten.',
        unshareErrorModalTitle: 'Bankkonto kann nicht freigegeben werden',
        travelCVV: {
            title: 'Reise-CVV',
            subtitle: 'Verwenden Sie dies bei der Buchung von Reisen',
            description: 'Verwende diese Karte für deine Expensify Travel-Buchungen. Sie wird beim Bezahlen als “Travel Card” angezeigt.',
        },
        chaseAccountNumberDifferent: 'Warum ist meine Kontonummer anders?',
    },
    cardPage: {
        expensifyCard: 'Expensify Karte',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: 'Verbleibendes Limit',
        smartLimit: {
            name: 'Smartes Limit',
            title: (formattedLimit: string) =>
                `Sie können mit dieser Karte bis zu ${formattedLimit} ausgeben, und das Limit wird zurückgesetzt, sobald Ihre eingereichten Ausgaben genehmigt wurden.`,
        },
        fixedLimit: {
            name: 'Fester Grenzwert',
            title: (formattedLimit: string) => `Sie können bis zu ${formattedLimit} mit dieser Karte ausgeben, danach wird sie deaktiviert.`,
        },
        monthlyLimit: {
            name: 'Monatliches Limit',
            title: (formattedLimit: string) => `Sie können mit dieser Karte bis zu ${formattedLimit} pro Monat ausgeben. Das Limit wird am 1. Tag eines jeden Kalendermonats zurückgesetzt.`,
        },
        virtualCardNumber: 'Virtuelle Kartennummer',
        travelCardCvv: 'Reisekarten-CVV',
        physicalCardNumber: 'Nummer der physischen Karte',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Physische Karte bestellen',
        reportFraud: 'Virtuelle Kartenbetrugsfälle melden',
        reportTravelFraud: 'Reise­karte als betrügerisch melden',
        reviewTransaction: 'Transaktion prüfen',
        suspiciousBannerTitle: 'Verdächtige Transaktion',
        suspiciousBannerDescription: 'Wir haben verdächtige Transaktionen auf Ihrer Karte festgestellt. Tippen Sie unten, um sie zu überprüfen.',
        cardLocked: 'Ihre Karte ist vorübergehend gesperrt, während unser Team das Konto Ihres Unternehmens überprüft.',
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
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Zu ${platform} Wallet hinzugefügt`,
        cardDetailsLoadingFailure: 'Beim Laden der Kartendetails ist ein Fehler aufgetreten. Bitte überprüfe deine Internetverbindung und versuche es erneut.',
        validateCardTitle: 'Stellen wir sicher, dass du es bist',
        enterMagicCode: (contactMethod: string) =>
            `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um deine Kartendetails anzusehen. Er sollte innerhalb ein bis zwei Minuten ankommen.`,
        unexpectedError: 'Beim Abrufen deiner Expensify-Kartendaten ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        cardFraudAlert: {
            confirmButtonText: 'Ja, das tue ich',
            reportFraudButtonText: 'Nein, ich war das nicht',
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
            }) => `verdächtige Aktivität auf der Karte mit der Endziffer ${cardLastFour} festgestellt. Erkennen Sie diese Abbuchung?

${amount} für ${merchant} – ${date}`,
        },
        setYourPin: 'Legen Sie Ihre PIN fest.',
        confirmYourPin: 'Bestätigen Sie Ihre PIN.',
        changeYourPin: 'Geben Sie eine neue PIN für Ihre Karte ein.',
        confirmYourChangedPin: 'Bestätigen Sie Ihre neue PIN.',
        pinMustBeFourDigits: 'Die PIN muss genau 4 Ziffern lang sein.',
        invalidPin: 'Bitte wählen Sie eine sicherere PIN.',
        pinMismatch: 'PINs stimmen nicht überein. Bitte versuchen Sie es erneut.',
        revealPin: 'PIN anzeigen',
        hidePin: 'PIN ausblenden',
        pin: 'PIN',
        changePin: 'PIN ändern',
        pinChanged: 'PIN geändert!',
        pinChangedHeader: 'PIN geändert',
        pinChangedDescription: 'Sie können Ihre PIN jetzt verwenden.',
        changePinAtATM: 'Ändern Sie Ihre PIN an jedem Geldautomaten',
        changePinAtATMDescription: 'Dies ist in Ihrer Region erforderlich. <concierge-link>Kontaktieren Sie Concierge</concierge-link> falls Sie Fragen haben.',
        freezeCard: 'Karte sperren',
        unfreeze: 'Entsperren',
        unfreezeCard: 'Karte entsperren',
        askToUnfreeze: 'Entsperrung anfragen',
        freezeDescription: 'Eine gesperrte Karte kann nicht für Käufe und Transaktionen verwendet werden. Du kannst sie jederzeit entsperren.',
        unfreezeDescription:
            'Durch das Entsperren dieser Karte werden Käufe und Transaktionen wieder zugelassen. Fahre nur fort, wenn du sicher bist, dass die Karte sicher verwendet werden kann.',
        frozen: 'Gesperrt',
        youFroze: ({date}: {date: string}) => `Du hast diese Karte am ${date} gesperrt.`,
        frozenBy: ({person, date}: {person: string; date: string}) => `${person} hat diese Karte am ${date} gesperrt.`,
        frozenByAdminPrefix: ({date}: {date: string}) => `Diese Karte wurde am ${date} gesperrt von `,
        frozenByAdminNeedsUnfreezePrefix: 'Diese Karte wurde von ',
        frozenByAdminNeedsUnfreezeSuffix: ' gesperrt. Bitte kontaktiere einen Admin, um sie zu entsperren.',
        frozenByAdminNeedsUnfreeze: ({person}: {person: string}) => `Diese Karte wurde von ${person} gesperrt. Bitte kontaktiere einen Admin, um sie zu entsperren.`,
    },
    workflowsPage: {
        workflowTitle: 'Ausgaben',
        workflowDescription: 'Konfiguriere einen Workflow vom Zeitpunkt der Ausgabe an, einschließlich Genehmigung und Zahlung.',
        submissionFrequency: 'Einreichungen',
        submissionFrequencyDescription: 'Wähle einen benutzerdefinierten Zeitplan zum Einreichen von Ausgaben.',
        submissionFrequencyDateOfMonth: 'Tag des Monats',
        disableApprovalPromptDescription: 'Das Deaktivieren von Genehmigungen löscht alle vorhandenen Genehmigungs-Workflows.',
        addApprovalsTitle: 'Genehmigungen',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `Ausgaben von ${members} und die genehmigende Person ist ${approvers}`,
        addApprovalButton: 'Genehmigungsablauf hinzufügen',
        findWorkflow: 'Workflow suchen',
        addApprovalTip: 'Dieser Standard-Workflow gilt für alle Mitglieder, sofern kein spezifischerer Workflow vorhanden ist.',
        approver: 'Genehmiger',
        addApprovalsDescription: 'Zusätzliche Genehmigung einholen, bevor eine Zahlung autorisiert wird.',
        makeOrTrackPaymentsTitle: 'Zahlungen',
        makeOrTrackPaymentsDescription:
            'Fügen Sie eine bevollmächtigte zahlende Person für in Expensify getätigte Zahlungen hinzu oder verfolgen Sie Zahlungen, die andernorts getätigt wurden.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Für diesen Workspace ist ein benutzerdefinierter Genehmigungsworkflow aktiviert. Um diesen Workflow zu überprüfen oder zu ändern, wende dich bitte an deine:n <account-manager-link>Account Manager</account-manager-link> oder an <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>In diesem Workspace ist ein benutzerdefinierter Genehmigungsworkflow aktiviert. Um diesen Workflow zu überprüfen oder zu ändern, wende dich bitte an <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Wähle, wie lange Expensify warten soll, bevor fehlerfreie Ausgaben geteilt werden.',
        },
        frequencyDescription: 'Wähle, wie häufig Ausgaben automatisch eingereicht werden sollen, oder stelle es auf manuell um',
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
                few: 'rd.',
                other: 'Do.',
                '1': 'Erste',
                '2': 'Sekunde',
                '3': 'Dritter',
                '4': 'Vierte',
                '5': 'Fünfte',
                '6': 'Sechste',
                '7': 'Siebter',
                '8': 'Achter',
                '9': 'Neuntel',
                '10': 'Zehntel',
            },
        },
        approverInMultipleWorkflows: 'Dieses Mitglied gehört bereits zu einem anderen Genehmigungsworkflow. Alle Aktualisierungen hier werden sich auch dort auswirken.',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> genehmigt bereits Berichte für <strong>${name2}</strong>. Bitte wähle eine andere approvierende Person, um einen zirkulären Workflow zu vermeiden.`,
        emptyContent: {
            title: 'Keine Mitglieder zum Anzeigen',
            expensesFromSubtitle: 'Alle Workspace-Mitglieder gehören bereits zu einem bestehenden Genehmigungsworkflow.',
            approverSubtitle: 'Alle Genehmigenden gehören zu einem bestehenden Workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Sendehäufigkeit konnte nicht geändert werden. Bitte versuche es erneut oder kontaktiere den Support.',
        monthlyOffsetErrorMessage: 'Die monatliche Häufigkeit konnte nicht geändert werden. Bitte versuche es erneut oder kontaktiere den Support.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Bestätigen',
        header: 'Fügen Sie weitere Genehmigende hinzu und bestätigen Sie.',
        additionalApprover: 'Zusätzliche*r Genehmiger*in',
        submitButton: 'Workflow hinzufügen',
    },
    workflowsEditApprovalsPage: {
        title: 'Genehmigungsworkflow bearbeiten',
        deleteTitle: 'Genehmigungsworkflow löschen',
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
        title: 'Genehmiger',
        header: '(Optional) Möchten Sie ein Genehmigungslimit hinzufügen?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Füge eine weitere Genehmigungsperson hinzu, wenn <strong>${approverName}</strong> Genehmigungsperson ist und der Bericht den untenstehenden Betrag überschreitet:`
                : 'Weitere:n Genehmiger:in hinzufügen, wenn ein Bericht den folgenden Betrag überschreitet:',
        reportAmountLabel: 'Berichtsbetrag',
        additionalApproverLabel: 'Zusätzliche*r Genehmiger*in',
        skip: 'Überspringen',
        next: 'Weiter',
        removeLimit: 'Limit entfernen',
        enterAmountError: 'Bitte gib einen gültigen Betrag ein',
        enterApproverError: 'Ein Genehmiger ist erforderlich, wenn du ein Berichtslimit festlegst',
        enterBothError: 'Geben Sie einen Berichtsbetrag und eine zusätzliche genehmigende Person ein',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) => `Berichte über ${approvalLimit} werden an ${approverName} weitergeleitet`,
    },
    workflowsPayerPage: {
        title: 'Autorisierte zahlende Person',
        genericErrorMessage: 'Der berechtigte Zahler konnte nicht geändert werden. Bitte versuche es erneut.',
        admins: 'Admins',
        payer: 'Zahler',
        paymentAccount: 'Zahlungskonto',
        shareBankAccount: {
            shareTitle: 'Bankkontozugriff teilen?',
            shareDescription: ({admin}: {admin: string}) => `Sie müssen ${admin} den Bankkontozugriff gewähren, damit dieser als Zahler eingetragen werden kann.`,
            validationTitle: 'Bankkonto wartet auf Validierung',
            validationDescription: ({admin}: {admin: string}) =>
                `Sie müssen <a href="#">dieses Bankkonto validieren</a>. Anschließend können Sie den Zugriff auf das Bankkonto mit ${admin} teilen, um ihn/sie als Zahler festzulegen.`,
            errorTitle: 'Zahler kann nicht geändert werden',
            errorDescription: ({admin, owner}: {admin: string; owner: string}) =>
                `${admin} hat keinen Zugriff auf dieses Bankkonto, daher kann er nicht als Zahler festgelegt werden. <a href="#">Kontaktieren Sie ${owner}</a>, falls das Bankkonto freigegeben werden soll.`,
        },
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
        description: 'Wir haben Ihre bestehende Karte dauerhaft deaktiviert. Wenn Sie Ihre Kartendetails erneut aufrufen, steht Ihnen eine neue virtuelle Karte zur Verfügung.',
        buttonText: 'Verstanden, danke!',
    },
    activateCardPage: {
        activateCard: 'Karte aktivieren',
        pleaseEnterLastFour: 'Bitte gib die letzten vier Ziffern deiner Karte ein.',
        activatePhysicalCard: 'Physische Karte aktivieren',
        error: {
            thatDidNotMatch: 'Das stimmt nicht mit den letzten 4 Ziffern Ihrer Karte überein. Bitte versuchen Sie es erneut.',
            throttled:
                'Sie haben die letzten 4 Ziffern Ihrer Expensify Karte zu oft falsch eingegeben. Wenn Sie sicher sind, dass die Zahlen korrekt sind, wenden Sie sich bitte an Concierge, um das Problem zu lösen. Andernfalls versuchen Sie es später noch einmal.',
        },
    },
    getPhysicalCard: {
        header: 'Physische Karte bestellen',
        nameMessage: 'Gib deinen Vor- und Nachnamen ein, da dieser auf deiner Karte angezeigt wird.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Rechtlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        phoneMessage: 'Gib deine Telefonnummer ein.',
        phoneNumber: 'Telefonnummer',
        address: 'Adresse',
        addressMessage: 'Gib deine Versandadresse ein.',
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
        transfer: (amount: string) => `Überweisung${amount ? ` ${amount}` : ''}`,
        instant: 'Sofort (Debitkarte)',
        instantSummary: (rate: string, minAmount: string) => `${rate}% Gebühr (mindestens ${minAmount})`,
        ach: '1–3 Werktage (Bankkonto)',
        achSummary: 'Keine Gebühr',
        whichAccount: 'Welches Konto?',
        fee: 'Gebühr',
        transferSuccess: 'Überweisung erfolgreich!',
        transferDetailBankAccount: 'Dein Geld sollte innerhalb der nächsten 1–3 Werktage ankommen.',
        transferDetailDebitCard: 'Dein Geld sollte sofort ankommen.',
        failedTransfer: 'Ihr Saldo ist noch nicht vollständig ausgeglichen. Bitte überweisen Sie auf ein Bankkonto.',
        notHereSubTitle: 'Bitte überweise dein Guthaben von der Wallet-Seite.',
        goToWallet: 'Zur Wallet',
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
        addFirstPaymentMethod: 'Fügen Sie eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        defaultPaymentMethod: 'Standard',
        bankAccountLastFour: (lastFour: string) => `Bankkonto • ${lastFour}`,
    },
    expenseRulesPage: {
        title: 'Ausgabenregeln',
        findRule: 'Regel finden',
        emptyRules: {
            title: 'Du hast noch keine Regeln erstellt',
            subtitle: 'Füge eine Regel hinzu, um die Spesenabrechnung zu automatisieren.',
        },
        changes: {
            billableUpdate: (value: boolean) => `Ausgabe ${value ? 'verrechenbar' : 'nicht abrechenbar'} aktualisieren`,
            categoryUpdate: (value: string) => `Kategorie auf „${value}“ aktualisieren`,
            commentUpdate: (value: string) => `Beschreibung auf „${value}“ aktualisieren`,
            merchantUpdate: (value: string) => `Händler auf „${value}“ aktualisieren`,
            reimbursableUpdate: (value: boolean) => `Ausgabe ${value ? 'erstattungsfähig' : 'nicht erstattungsfähig'} aktualisieren`,
            tagUpdate: (value: string) => `Tag auf „${value}“ aktualisieren`,
            taxUpdate: (value: string) => `Steuersatz auf „${value}“ aktualisieren`,
            billable: (value: boolean) => `Ausgabe ${value ? 'verrechenbar' : 'nicht abrechenbar'}`,
            category: (value: string) => `Kategorie in „${value}“`,
            comment: (value: string) => `Beschreibung zu „${value}“`,
            merchant: (value: string) => `Händler auf „${value}“`,
            reimbursable: (value: boolean) => `Ausgabe ${value ? 'erstattungsfähig' : 'nicht erstattungsfähig'}`,
            tag: (value: string) => `Tag auf „${value}“`,
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
            createReport: 'Bericht bei Bedarf erstellen',
            applyToExistingExpenses: 'Auf passende vorhandene Ausgaben anwenden',
            confirmError: 'Gib ein Händlerunternehmen ein und nimm mindestens eine Aktualisierung vor',
            confirmErrorMerchant: 'Bitte Händler eingeben',
            confirmErrorUpdate: 'Bitte wende mindestens ein Update an',
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
        subtitle: 'Diese Regeln gelten für deine Ausgaben.',
    },
    preferencesPage: {
        appSection: {
            title: 'App-Einstellungen',
        },
        testSection: {
            title: 'Testeinstellungen',
            subtitle: 'Einstellungen zum Debuggen und Testen der App in der Staging-Umgebung.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Erhalten Sie relevante Funktionsupdates und Expensify-Neuigkeiten',
        muteAllSounds: 'Alle Expensify-Sounds stummschalten',
    },
    priorityModePage: {
        priorityMode: 'Prioritätsmodus',
        explainerText: 'Wähle, ob du dich nur auf ungelesene und angeheftete Chats #fokussieren möchtest oder alles anzeigen willst, wobei die neuesten und angehefteten Chats oben stehen.',
        priorityModes: {
            default: {
                label: 'Neueste',
                description: 'Alle Chats nach Neuestem sortiert anzeigen',
            },
            gsd: {
                label: '#fokus',
                description: 'Nur ungelesene alphabetisch sortiert anzeigen',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: (policyName: string) => `in ${policyName}`,
        generatingPDF: 'PDF erstellen',
        waitForPDF: 'Bitte warten, während wir das PDF erstellen.',
        errorPDF: 'Beim Versuch, Ihre PDF zu erstellen, ist ein Fehler aufgetreten',
        successPDF: 'Dein PDF wurde erstellt! Falls es nicht automatisch heruntergeladen wurde, verwende die Schaltfläche unten.',
    },
    reportDescriptionPage: {
        roomDescription: 'Zimmerbeschreibung',
        roomDescriptionOptional: 'Zimmerbeschreibung (optional)',
        explainerText: 'Legen Sie eine benutzerdefinierte Beschreibung für den Raum fest.',
    },
    groupChat: {
        lastMemberTitle: 'Achtung!',
        lastMemberWarning: 'Da du die letzte Person hier bist, wird dieser Chat für alle Mitglieder unzugänglich, wenn du gehst. Bist du sicher, dass du den Chat verlassen möchtest?',
        defaultReportName: (displayName: string) => `Gruppenchat von ${displayName}`,
    },
    languagePage: {
        language: 'Sprache',
        aiGenerated: 'Die Übersetzungen für diese Sprache werden automatisch erzeugt und können Fehler enthalten.',
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
        highContrastMode: 'Hoher Kontrast',
        chooseThemeBelowOrSync: 'Wählen Sie unten ein Design aus oder synchronisieren Sie es mit den Einstellungen Ihres Geräts.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Durch das Einloggen stimmst du den <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und der <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzerklärung</a> zu.</muted-text-xs>`,
        license: `Die Geldübermittlung wird von ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS-ID:2017010) gemäß seinen <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">Lizenzen</a> bereitgestellt.`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Keinen magischen Code erhalten?',
        enterAuthenticatorCode: 'Bitte gib deinen Authentifizierungscode ein',
        enterRecoveryCode: 'Bitte gib deinen Wiederherstellungscode ein',
        requiredWhen2FAEnabled: 'Erforderlich, wenn 2FA aktiviert ist',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Fordere einen neuen Code an in <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Neuen Code anfordern',
        timeRemainingAnnouncement: ({timeRemaining}) => `Verbleibende Zeit: ${timeRemaining} ${timeRemaining === 1 ? 'Sekunde' : 'Sekunden'}`,
        timeExpiredAnnouncement: 'Die Zeit ist abgelaufen',
        error: {
            pleaseFillMagicCode: 'Bitte gib deinen Magic Code ein',
            incorrectMagicCode: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            pleaseFillTwoFactorAuth: 'Bitte gib deinen Zwei-Faktor-Authentifizierungscode ein',
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
            incorrectLoginOrPassword: 'Falscher Login oder falsches Passwort. Bitte versuche es erneut.',
            incorrect2fa: 'Falscher Zwei-Faktor-Authentifizierungscode. Bitte versuche es erneut.',
            twoFactorAuthenticationEnabled: 'Für dieses Konto ist die Zwei-Faktor-Authentifizierung (2FA) aktiviert. Bitte melde dich mit deiner E‑Mail-Adresse oder Telefonnummer an.',
            invalidLoginOrPassword: 'Ungültiger Benutzername oder Passwort. Bitte versuche es erneut oder setze dein Passwort zurück.',
            unableToResetPassword:
                'Wir konnten Ihr Passwort nicht ändern. Dies liegt wahrscheinlich an einem abgelaufenen Link zum Zurücksetzen des Passworts in einer alten E-Mail zum Zurücksetzen. Wir haben Ihnen einen neuen Link per E-Mail geschickt, damit Sie es erneut versuchen können. Überprüfen Sie Ihren Posteingang und Ihren Spam-Ordner; die E-Mail sollte in wenigen Minuten ankommen.',
            noAccess: 'Sie haben keinen Zugriff auf diese Anwendung. Bitte fügen Sie Ihren GitHub-Benutzernamen hinzu, um Zugriff zu erhalten.',
            accountLocked: 'Dein Konto wurde nach zu vielen erfolglosen Versuchen gesperrt. Bitte versuche es in 1 Stunde erneut.',
            fallback: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefon oder E-Mail',
        error: {
            invalidFormatEmailLogin: 'Die eingegebene E-Mail-Adresse ist ungültig. Bitte korrigiere das Format und versuche es erneut.',
        },
        cannotGetAccountDetails: 'Kontodetails konnten nicht abgerufen werden. Bitte melde dich erneut an.',
        loginForm: 'Anmeldeformular',
        notYou: (user: string) => `Nicht ${user}?`,
    },
    onboarding: {
        welcome: 'Willkommen!',
        welcomeSignOffTitleManageTeam: 'Sobald du die Aufgaben oben abgeschlossen hast, können wir weitere Funktionen wie Genehmigungs-Workflows und Regeln erkunden!',
        welcomeSignOffTitle: 'Schön, dich kennenzulernen!',
        explanationModal: {
            title: 'Willkommen bei Expensify',
            description:
                'Eine App, um Ihre geschäftlichen und privaten Ausgaben in Chat-Geschwindigkeit zu verwalten. Probieren Sie es aus und sagen Sie uns, was Sie denken. Da kommt noch viel mehr!',
            secondaryDescription: 'Um zurück zu Expensify Classic zu wechseln, tippe einfach auf dein Profilbild > Gehe zu Expensify Classic.',
        },
        getStarted: 'Loslegen',
        whatsYourName: 'Wie heißt du?',
        peopleYouMayKnow: 'Personen, die du vielleicht kennst, sind bereits hier! Bestätige deine E-Mail-Adresse, um dich ihnen anzuschließen.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `Jemand von ${domain} hat bereits einen Workspace erstellt. Bitte gib den magischen Code ein, der an ${email} gesendet wurde.`,
        joinAWorkspace: 'Einem Arbeitsbereich beitreten',
        listOfWorkspaces: 'Hier ist die Liste der Arbeitsbereiche, denen du beitreten kannst. Keine Sorge, du kannst ihnen auch später jederzeit beitreten, wenn du möchtest.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} Mitglied${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Wo arbeitest du?',
        errorSelection: 'Wähle eine Option, um fortzufahren',
        purpose: {
            title: 'Was möchtest du heute tun?',
            errorContinue: 'Bitte auf „Weiter“ drücken, um die Einrichtung abzuschließen',
            errorBackButton: 'Bitte beantworte die Einrichtungsfragen, um die App verwenden zu können',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Von meinem Arbeitgeber zurückerstattet werden',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Verwalte die Ausgaben meines Teams',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Ausgaben nachverfolgen und budgetieren',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chatten und Ausgaben mit Freunden aufteilen',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Etwas anderes',
        },
        employees: {
            title: 'Wie viele Mitarbeitende haben Sie?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1–10 Beschäftigte',
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
            subtitle: 'Expensify funktioniert am besten, wenn du deine Arbeits-E-Mail verbindest.',
            explanationModal: {
                descriptionOne: 'An Belege@expensify.com zum Scannen weiterleiten',
                descriptionTwo: 'Schließe dich deinen Kolleg:innen an, die Expensify bereits nutzen',
                descriptionThree: 'Genieße ein noch individuelleres Erlebnis',
            },
            addWorkEmail: 'Arbeits-E-Mail hinzufügen',
        },
        workEmailValidation: {
            title: 'Bestätige deine Arbeits-E-Mail-Adresse',
            magicCodeSent: (workEmail: string | undefined) => `Bitte gib den magischen Code ein, der an ${workEmail} gesendet wurde. Er sollte in ein bis zwei Minuten ankommen.`,
        },
        workEmailValidationError: {
            publicEmail: 'Bitte gib eine gültige geschäftliche E-Mail-Adresse von einer privaten Domain ein, z. B. mitch@company.com',
            sameAsSignupEmail: 'Bitte geben Sie eine andere E-Mail-Adresse ein als die, mit der Sie sich registriert haben',
            offline: 'Wir konnten deine geschäftliche E-Mail nicht hinzufügen, da du offenbar offline bist',
        },
        mergeBlockScreen: {
            title: 'Arbeits-E-Mail konnte nicht hinzugefügt werden',
            subtitle: (workEmail: string | undefined) =>
                `Wir konnten ${workEmail} nicht hinzufügen. Bitte versuche es später in den Einstellungen erneut oder chatte mit Concierge, um Unterstützung zu erhalten.`,
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
                title: 'Ausgabengenehmigungen hinzufügen',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Füge Spesenfreigaben hinzu*, um die Ausgaben deines Teams zu prüfen und unter Kontrolle zu halten.

                        So geht’s:

                        1. Gehe zu *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Weitere Funktionen*.
                        4. Aktiviere *Workflows*.
                        5. Wechsle im Workspace-Editor zu *Workflows*.
                        6. Aktiviere *Freigaben*.
                        7. Du wirst als Spesenfreigebende:r festgelegt. Sobald du dein Team einlädst, kannst du dies auf eine:n beliebige:n Admin ändern.

                        [Zu den weiteren Funktionen](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Erstelle](${workspaceConfirmationLink}) einen Workspace`,
                description: 'Erstelle einen Arbeitsbereich und konfiguriere die Einstellungen mit Hilfe deiner Einrichtungsexpertin/deines Einrichtungsexperten!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[Workspace] erstellen (${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Erstelle einen Arbeitsbereich*, um Ausgaben zu verfolgen, Belege zu scannen, zu chatten und mehr.

                        1. Klicke auf *Arbeitsbereiche* > *Neuer Arbeitsbereich*.

                        *Dein neuer Arbeitsbereich ist bereit!* [Sieh ihn dir an](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Richte [Kategorien](${workspaceCategoriesLink}) ein`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Richten Sie Kategorien ein*, damit Ihr Team Ausgaben für eine einfache Berichterstattung verschlüsseln kann.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *Categories*.
                        4. Deaktivieren Sie alle Kategorien, die Sie nicht benötigen.
                        5. Fügen Sie oben rechts Ihre eigenen Kategorien hinzu.

                        [Zu den Workspace-Kategorieneinstellungen](${workspaceCategoriesLink}).
                    `),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Ausgabe einreichen',
                description: dedent(`
                    *Reiche eine Ausgabe ein*, indem du einen Betrag eingibst oder einen Beleg einscannst.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Ausgabe erstellen*.
                    3. Gib einen Betrag ein oder scanne einen Beleg.
                    4. Füge die E-Mail-Adresse oder Telefonnummer deiner Führungskraft hinzu.
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
                    *Verfolge eine Ausgabe* in jeder Währung, egal ob du eine Quittung hast oder nicht.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Ausgabe erstellen*.
                    3. Gib einen Betrag ein oder scanne eine Quittung.
                    4. Wähle deinen *persönlichen* Bereich.
                    5. Klicke auf *Erstellen*.

                    Und fertig! Ja, so einfach ist das.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Verbinden${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'zu'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'dein' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Verbinde ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'dein' : 'bis'} ${integrationName} für automatische Spesenkodierung und Synchronisierung, die den Monatsabschluss zum Kinderspiel macht.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Accounting*.
                        4. Suche nach ${integrationName}.
                        5. Klicke auf *Connect*.

                        [Zur Buchhaltung](${workspaceAccountingLink}).
                    `),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[Geschäftskarten verbinden](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Verbinde die Karten, die du bereits hast, für den automatischen Transaktionsimport, das Belegabgleichen und die Abstimmung.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Company cards*.
                        4. Folge den Anweisungen, um deine Karten zu verbinden.

                        [Zu den Company cards](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[your team](${workspaceMembersLink}) einladen`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Lade dein Team* zu Expensify ein, damit alle noch heute mit der Spesenerfassung starten können.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Members* > *Invite member*.
                        4. Gib E-Mail-Adressen oder Telefonnummern ein.
                        5. Füge eine individuelle Einladung hinzu, wenn du möchtest!

                        [Zu den Workspace-Mitgliedern](${workspaceMembersLink}).

                    `),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Richte [Kategorien](${workspaceCategoriesLink}) und [Tags](${workspaceTagsLink}) ein`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Richten Sie Kategorien und Tags ein*, damit Ihr Team Ausgaben für eine einfache Berichterstattung codieren kann.

                        Importieren Sie sie automatisch, indem Sie [Ihre Buchhaltungssoftware verbinden](${workspaceAccountingLink}), oder richten Sie sie manuell in Ihren [Workspace-Einstellungen](${workspaceCategoriesLink}) ein.`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Richte [Tags](${workspaceTagsLink}) ein`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Verwende Tags, um zusätzliche Ausgabendetails wie Projekte, Kunden, Standorte und Abteilungen hinzuzufügen. Wenn du mehrere Tag-Ebenen benötigst, kannst du auf den Control-Tarif upgraden.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Weitere Funktionen*.
                        4. Aktiviere *Tags*.
                        5. Navigiere im Workspace-Editor zu *Tags*.
                        6. Klicke auf *+ Tag hinzufügen*, um eigene Tags zu erstellen.

                        [Zu den zusätzlichen Funktionen](${workspaceMoreFeaturesLink}).
                    `),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Laden Sie Ihre(n) [Buchhalter(in)](${workspaceMembersLink}) ein`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Laden Sie Ihre*n Steuerberater*in ein*, um in Ihrem Arbeitsbereich zusammenzuarbeiten und Ihre Geschäftsausgaben zu verwalten.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Arbeitsbereich aus.
                        3. Klicken Sie auf *Members*.
                        4. Klicken Sie auf *Invite member*.
                        5. Geben Sie die E-Mail-Adresse Ihres*r Steuerberater*in ein.

                        [Laden Sie Ihre*n Steuerberater*in jetzt ein](${workspaceMembersLink}).`),
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
                title: 'Spesen aufteilen',
                description: dedent(`
                    *Spalte Ausgaben* mit einer oder mehreren Personen.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Chat starten*.
                    3. Gib E-Mail-Adressen oder Telefonnummern ein.
                    4. Klicke im Chat auf die graue *+*-Schaltfläche > *Ausgabe aufteilen*.
                    5. Erstelle die Ausgabe, indem du *Manuell*, *Scan* oder *Entfernung* auswählst.

                    Du kannst bei Bedarf weitere Details hinzufügen oder sie einfach senden. So bekommst du dein Geld zurück!
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
            embeddedDemoIframeTitle: 'Testversion',
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
                        # Ihre kostenlose Testphase hat begonnen! Lassen Sie uns mit der Einrichtung starten.
                        👋 Hallo, ich bin Ihre Expensify-Einrichtungsspezialist*in. Ich habe bereits einen Arbeitsbereich erstellt, um die Belege und Ausgaben Ihres Teams zu verwalten. Um Ihre 30-tägige kostenlose Testphase optimal zu nutzen, folgen Sie einfach den restlichen untenstehenden Einrichtungsschritten!
                    `)
                    : dedent(`
                        # Deine kostenlose Testversion hat begonnen! Lass uns alles einrichten.
                        👋 Hallo, ich bin deine Expensify-Einrichtungsspezialist*in. Nachdem du jetzt einen Arbeitsbereich erstellt hast, nutze deine 30-tägige kostenlose Testversion optimal, indem du die folgenden Schritte befolgst!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Lass uns alles einrichten\n👋 Hallo, ich bin deine Expensify-Einrichtungsspezialist*in. Ich habe bereits einen Workspace erstellt, um dir bei der Verwaltung deiner Belege und Ausgaben zu helfen. Um das Beste aus deiner 30-tägigen kostenlosen Testphase herauszuholen, folge einfach den verbleibenden Einrichtungsschritten unten!',
            onboardingChatSplitMessage: 'Rechnungen mit Freund*innen zu teilen ist so einfach wie das Senden einer Nachricht. So geht’s.',
            onboardingAdminMessage: 'Erfahre, wie du als Admin den Arbeitsbereich deines Teams verwaltest und deine eigenen Ausgaben einreichst.',
            onboardingTestDriveReceiverMessage: '*Du erhältst 3 Monate gratis! Leg unten los.*',
        },
        workspace: {
            title: 'Bleib mit einem Workspace organisiert',
            subtitle: 'Leistungsstarke Tools freischalten, um Ihr Ausgabenmanagement zu vereinfachen – alles an einem Ort. Mit einem Workspace können Sie:',
            explanationModal: {
                descriptionOne: 'Belege erfassen und organisieren',
                descriptionTwo: 'Ausgaben kategorisieren und taggen',
                descriptionThree: 'Berichte erstellen und teilen',
            },
            price: (price?: string) => `Teste es 30 Tage kostenlos und upgrade dann für nur <strong>${price ?? '5 $'}/Nutzer/Monat</strong>.`,
            createWorkspace: 'Workspace erstellen',
        },
        confirmWorkspace: {
            title: 'Workspace bestätigen',
            subtitle:
                'Erstelle einen Workspace, um Belege nachzuverfolgen, Ausgaben zu erstatten, Reisen zu verwalten, Berichte zu erstellen und mehr – alles mit der Geschwindigkeit eines Chats.',
        },
        inviteMembers: {
            title: 'Mitglieder einladen',
            subtitle: 'Füge dein Team hinzu oder lade deine Steuerberatung ein. Je mehr, desto besser!',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Nicht mehr anzeigen',
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
        legalFirstName: 'Rechtlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        address: 'Adresse',
        error: {
            dateShouldBeBefore: (dateString: string) => `Datum muss vor dem ${dateString} liegen`,
            dateShouldBeAfter: (dateString: string) => `Datum muss nach ${dateString} liegen`,
            hasInvalidCharacter: 'Name darf nur lateinische Zeichen enthalten',
            incorrectZipFormat: (zipFormat?: string) => `Ungültiges Postleitzahlenformat${zipFormat ? `Zulässiges Format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Bitte stelle sicher, dass die Telefonnummer gültig ist (z. B. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link wurde erneut gesendet',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `Ich habe einen magischen Anmeldelink an ${login} gesendet. Bitte überprüfe dein ${loginType}, um dich anzumelden.`,
        resendLink: 'Link erneut senden',
    },
    unlinkLoginForm: {
        toValidateLogin: (primaryLogin: string, secondaryLogin: string) =>
            `Um ${secondaryLogin} zu bestätigen, sende den magischen Code bitte erneut aus den Kontoeinstellungen von ${primaryLogin}.`,
        noLongerHaveAccess: (primaryLogin: string) => `Wenn du keinen Zugriff mehr auf ${primaryLogin} hast, trenne bitte die Verknüpfung deiner Konten.`,
        unlink: 'Verknüpfung aufheben',
        linkSent: 'Link gesendet!',
        successfullyUnlinkedLogin: 'Sekundäres Login wurde erfolgreich getrennt!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: (login: string) =>
            `Unser E-Mail-Anbieter hat E-Mails an ${login} vorübergehend aufgrund von Zustellproblemen ausgesetzt. Um Ihren Login zu entsperren, führen Sie bitte folgende Schritte aus:`,
        confirmThat: (login: string) =>
            `<strong>Bestätige, dass ${login} richtig geschrieben ist und eine echte, zustellbare E‑Mail-Adresse ist.</strong> E-Mail-Aliasse wie „expenses@domain.com“ müssen Zugriff auf ein eigenes E-Mail-Postfach haben, damit sie ein gültiger Expensify-Login sind.`,
        ensureYourEmailClient: `<strong>Stellen Sie sicher, dass Ihr E-Mail-Client E-Mails von expensify.com zulässt.</strong> Eine Anleitung zur Durchführung dieses Schrittes finden Sie <a href="${CONST.SET_NOTIFICATION_LINK}">hier</a>, eventuell benötigen Sie jedoch die Hilfe Ihrer IT-Abteilung, um Ihre E-Mail-Einstellungen zu konfigurieren.`,
        onceTheAbove: `Sobald die oben genannten Schritte abgeschlossen sind, kontaktiere bitte <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a>, um deine Anmeldung wieder freizuschalten.`,
    },
    openAppFailureModal: {
        title: 'Etwas ist schiefgelaufen ...',
        subtitle: `Wir konnten nicht alle Ihre Daten laden. Wir wurden benachrichtigt und prüfen das Problem. Wenn es weiterhin besteht, wenden Sie sich bitte an`,
        refreshAndTryAgain: 'Aktualisieren und erneut versuchen',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: (login: string) =>
            `Wir konnten SMS-Nachrichten nicht an ${login} zustellen und haben es daher vorübergehend deaktiviert. Bitte versuche, deine Nummer zu bestätigen:`,
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
            return `Bitte hab noch etwas Geduld! Du musst ${timeText} warten, bevor du erneut versuchst, deine Nummer zu bestätigen.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Beitreten',
    },
    detailsPage: {
        localTime: 'Ortszeit',
    },
    newChatPage: {startGroup: 'Gruppe starten', addToGroup: 'Zur Gruppe hinzufügen', addUserToGroup: (username: string) => `${username} zur Gruppe hinzufügen`},
    yearPickerPage: {
        year: 'Jahr',
        selectYear: 'Bitte ein Jahr auswählen',
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
        pageNotFound: 'Ups, diese Seite konnte nicht gefunden werden',
        noAccess: 'Dieser Chat oder diese Ausgabe wurde möglicherweise gelöscht oder du hast keinen Zugriff darauf.\n\nBei Fragen wende dich bitte an concierge@expensify.com',
        goBackHome: 'Zurück zur Startseite',
        commentYouLookingForCannotBeFound: 'Der Kommentar, den du suchst, kann nicht gefunden werden.',
        goToChatInstead: 'Wechsle stattdessen zum Chat.',
        contactConcierge: 'Bei Fragen wende dich bitte an concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ups ... ${isBreakLine ? '\n' : ''}Etwas ist schiefgelaufen`,
        subtitle: 'Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es später noch einmal.',
        wrongTypeSubtitle: 'Diese Suche ist ungültig. Versuche, deine Suchkriterien anzupassen.',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Füge ein Emoji hinzu, damit Kolleg:innen und Freund:innen leicht sehen, was los ist. Optional kannst du auch eine Nachricht hinzufügen!',
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
        untilTime: (time: string) => `Bis ${time}`,
        date: 'Datum',
        time: 'Zeit',
        clearAfter: 'Nach Ablauf löschen',
        whenClearStatus: 'Wann sollen wir deinen Status zurücksetzen?',
        setVacationDelegate: `Lege eine Vertretung für den Urlaub fest, die Berichte in deiner Abwesenheit in deinem Namen genehmigt.`,
        cannotSetVacationDelegate: `Du kannst keinen Urlaubsvertreter festlegen, da du derzeit der Vertreter für die folgenden Mitglieder bist:`,
        vacationDelegateError: 'Beim Aktualisieren Ihrer Vertretung im Urlaub ist ein Fehler aufgetreten.',
        asVacationDelegate: (nameOrEmail: string) => `als Urlaubsvertretung von ${nameOrEmail}`,
        toAsVacationDelegate: (submittedToName: string, vacationDelegateName: string) => `an ${submittedToName} als Urlaubsvertretung für ${vacationDelegateName}`,
        vacationDelegateWarning: (nameOrEmail: string) =>
            `Sie weisen ${nameOrEmail} als Ihre Urlaubsvertretung zu. Diese Person ist noch nicht in all Ihren Arbeitsbereichen. Wenn Sie fortfahren, wird eine E-Mail an alle Admins Ihrer Arbeitsbereiche gesendet, damit sie hinzugefügt wird.`,
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
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        accountEnding: 'Konto mit Endziffern',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in deinem Workspace verwendet',
        accountNumber: 'Kontonummer',
        routingNumber: 'Routing-Nummer',
        chooseAnAccountBelow: 'Wähle unten ein Konto aus',
        addBankAccount: 'Bankkonto hinzufügen',
        chooseAnAccount: 'Konto auswählen',
        connectOnlineWithPlaid: 'Melde dich bei deiner Bank an',
        connectManually: 'Manuell verbinden',
        desktopConnection:
            'Hinweis: Um eine Verbindung mit Chase, Wells Fargo, Capital One oder Bank of America herzustellen, klicke bitte hier, um diesen Vorgang in einem Browser abzuschließen.',
        yourDataIsSecure: 'Ihre Daten sind sicher',
        toGetStarted: 'Fügen Sie ein Bankkonto hinzu, um Ausgaben zu erstatten, Expensify Karten auszugeben, Rechnungszahlungen zu erhalten und Rechnungen zentral zu bezahlen.',
        plaidBodyCopy: 'Geben Sie Ihren Mitarbeitenden eine einfachere Möglichkeit, Firmenausgaben zu bezahlen – und erstattet zu bekommen.',
        checkHelpLine: 'Ihre Bankleitzahl und Kontonummer finden Sie auf einem Scheck für dieses Konto.',
        bankAccountPurposeTitle: 'Was möchten Sie mit Ihrem Bankkonto machen?',
        getReimbursed: 'Erstattung erhalten',
        getReimbursedDescription: 'Vom Arbeitgeber oder anderen',
        makePayments: 'Zahlungen tätigen',
        makePaymentsDescription: 'Spesen bezahlen oder Expensify Karten ausgeben',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Um ein Bankkonto zu verknüpfen, bitte <a href="${contactMethodRoute}">füge eine E-Mail-Adresse als deine primäre Anmeldung hinzu</a> und versuche es erneut. Du kannst deine Telefonnummer als sekundäre Anmeldung hinzufügen.`,
        hasBeenThrottledError: 'Beim Hinzufügen Ihres Bankkontos ist ein Fehler aufgetreten. Bitte warten Sie ein paar Minuten und versuchen Sie es erneut.',
        hasCurrencyError: (workspaceRoute: string) =>
            `Ups! Es scheint, dass die Währung deines Arbeitsbereichs auf eine andere Währung als USD eingestellt ist. Um fortzufahren, gehe bitte zu <a href="${workspaceRoute}">deinen Arbeitsbereichseinstellungen</a>, stelle sie auf USD ein und versuche es erneut.`,
        bbaAdded: 'Geschäftsbankkonto hinzugefügt!',
        bbaAddedDescription: 'Es ist bereit, für Zahlungen verwendet zu werden.',
        lockedBankAccount: 'Gesperrtes Bankkonto',
        unlockBankAccount: 'Bankkonto entsperren',
        youCantPayThis: `Du kannst diesen Bericht nicht bezahlen, weil du ein <a href="${CONST.UNLOCK_BANK_ACCOUNT_HELP_URL}">gesperrtes Bankkonto</a> hast. Tippe unten und der Concierge hilft dir bei den nächsten Schritten zur Entsperrung.`,
        htmlUnlockMessage: (maskedAccountNumber: string) =>
            `<h1>Expensify Business Bank Account ${maskedAccountNumber}</h1><p>Vielen Dank für Ihre Anfrage zur Entsperrung Ihres Bankkontos. Auszahlungsanfragen können aufgrund unzureichender Deckung oder weil das Bankkonto nicht für Lastschriften aktiviert wurde, abgelehnt werden. Wir werden Ihren Fall prüfen und uns bei Ihnen melden, falls wir weitere Informationen zur Lösung dieses Problems benötigen.</p>`,
        textUnlockMessage: (maskedAccountNumber: string) =>
            `Expensify Business Bank Account ${maskedAccountNumber}\nVielen Dank für Ihre Anfrage zur Entsperrung Ihres Bankkontos. Auszahlungsanfragen können aufgrund unzureichender Deckung oder weil das Bankkonto nicht für Lastschriften aktiviert wurde, abgelehnt werden. Wir werden Ihren Fall prüfen und uns bei Ihnen melden, falls wir weitere Informationen zur Lösung dieses Problems benötigen.`,
        error: {
            youNeedToSelectAnOption: 'Bitte wählen Sie eine Option, um fortzufahren',
            noBankAccountAvailable: 'Leider ist kein Bankkonto verfügbar',
            noBankAccountSelected: 'Bitte wähle ein Konto aus',
            taxID: 'Bitte geben Sie eine gültige Steueridentifikationsnummer ein',
            website: 'Bitte eine gültige Website eingeben',
            zipCode: `Bitte gib eine gültige Postleitzahl im folgenden Format ein: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Bitte gib eine gültige Telefonnummer ein',
            email: 'Bitte gib eine gültige E-Mail-Adresse ein',
            companyName: 'Bitte gib einen gültigen Unternehmensnamen ein',
            addressCity: 'Bitte eine gültige Stadt eingeben',
            addressStreet: 'Bitte gib eine gültige Straßenadresse ein',
            addressState: 'Bitte wähle einen gültigen Bundesstaat aus',
            incorporationDateFuture: 'Das Gründungsdatum darf nicht in der Zukunft liegen',
            incorporationState: 'Bitte wähle einen gültigen Bundesstaat aus',
            industryCode: 'Bitte geben Sie einen gültigen Branchenschlüssel mit sechs Ziffern ein',
            restrictedBusiness: 'Bitte bestätigen Sie, dass das Unternehmen nicht auf der Liste der eingeschränkten Unternehmen steht.',
            routingNumber: 'Bitte geben Sie eine gültige Bankleitzahl ein',
            accountNumber: 'Bitte eine gültige Kontonummer eingeben',
            routingAndAccountNumberCannotBeSame: 'Bankleitzahl und Kontonummer dürfen nicht identisch sein',
            companyType: 'Bitte wähle einen gültigen Unternehmenstyp aus',
            tooManyAttempts:
                'Aufgrund einer hohen Anzahl von Anmeldeversuchen wurde diese Option für 24 Stunden deaktiviert. Bitte versuche es später erneut oder gib die Details stattdessen manuell ein.',
            address: 'Bitte gib eine gültige Adresse ein',
            dob: 'Bitte wähle ein gültiges Geburtsdatum aus',
            age: 'Muss über 18 Jahre alt sein',
            ssnLast4: 'Bitte gib die letzten 4 gültigen Ziffern der Sozialversicherungsnummer ein',
            firstName: 'Bitte gib einen gültigen Vornamen ein',
            lastName: 'Bitte gib einen gültigen Nachnamen ein',
            noDefaultDepositAccountOrDebitCardAvailable: 'Bitte fügen Sie ein Standard-Einzahlungskonto oder eine Debitkarte hinzu',
            validationAmounts: 'Die von Ihnen eingegebenen Validierungsbeträge sind falsch. Bitte prüfen Sie Ihren Kontoauszug noch einmal und versuchen Sie es erneut.',
            fullName: 'Bitte gib einen gültigen vollständigen Namen ein',
            ownershipPercentage: 'Bitte gib eine gültige Prozentzahl ein',
            deletePaymentBankAccount:
                'Dieses Bankkonto kann nicht gelöscht werden, da es für Zahlungen mit der Expensify Karte verwendet wird. Wenn Sie dieses Konto trotzdem löschen möchten, wenden Sie sich bitte an Concierge.',
            sameDepositAndWithdrawalAccount: 'Die Einzahlungs- und Auszahlungskonten sind identisch.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Wo befindet sich dein Bankkonto?',
        accountDetailsStepHeader: 'Wie lauten deine Kontodetails?',
        accountTypeStepHeader: 'Was für ein Konto ist das?',
        bankInformationStepHeader: 'Wie lauten deine Bankdaten?',
        accountHolderInformationStepHeader: 'Wie lauten die Angaben zur kontoinhabenden Person?',
        howDoWeProtectYourData: 'Wie schützen wir Ihre Daten?',
        currencyHeader: 'In welcher Währung ist Ihr Bankkonto?',
        confirmationStepHeader: 'Überprüfe deine Angaben.',
        confirmationStepSubHeader: 'Prüfen Sie die untenstehenden Angaben sorgfältig und aktivieren Sie das Kontrollkästchen für die Bedingungen, um zu bestätigen.',
        toGetStarted: 'Fügen Sie ein persönliches Bankkonto hinzu, um Erstattungen zu erhalten, Rechnungen zu bezahlen oder die Expensify Wallet zu aktivieren.',
        updatePersonalInfo: 'Bankkonto aktualisieren',
        updatePersonalInfoFailure: 'Die Bankkontoinformationen konnten nicht aktualisiert werden. Bitte versuchen Sie es später erneut.',
        updateSuccessTitle: 'Bankkonto aktualisiert!',
        updateSuccessHeader: 'Bankkonto aktualisiert',
        updateSuccessMessage: 'Glückwunsch, dein Bankkonto ist eingerichtet und bereit, Rückerstattungen zu empfangen.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Expensify-Passwort eingeben',
        alreadyAdded: 'Dieses Konto wurde bereits hinzugefügt.',
        chooseAccountLabel: 'Konto',
        successTitle: 'Persönliches Bankkonto hinzugefügt!',
        successMessage: 'Glückwunsch, dein Bankkonto ist eingerichtet und bereit, Erstattungen zu empfangen.',
    },
    attachmentView: {
        unknownFilename: 'Unbekannter Dateiname',
        passwordRequired: 'Bitte ein Passwort eingeben',
        passwordIncorrect: 'Falsches Passwort. Bitte versuche es erneut.',
        failedToLoadPDF: 'PDF-Datei konnte nicht geladen werden',
        pdfPasswordForm: {
            title: 'Passwortgeschützte PDF',
            infoText: 'Dieses PDF ist passwortgeschützt.',
            beforeLinkText: 'Bitte',
            linkText: 'Gib das Passwort ein',
            afterLinkText: 'um sie anzuzeigen.',
            formLabel: 'PDF anzeigen',
        },
        attachmentNotFound: 'Anhang nicht gefunden',
        retry: 'Wiederholen',
    },
    messages: {
        errorMessageInvalidPhone: `Bitte gib eine gültige Telefonnummer ohne Klammern oder Bindestriche ein. Wenn du außerhalb der USA bist, füge bitte deine Ländervorwahl hinzu (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Ungültige E-Mail',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} ist bereits Mitglied von ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} ist bereits Administrator*in von ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Indem Sie mit der Anfrage zur Aktivierung Ihres Expensify Wallets fortfahren, bestätigen Sie, dass Sie dies gelesen haben, verstehen und akzeptieren',
        facialScan: 'Richtlinie und Einverständniserklärung zur Gesichtserfassung von Onfido',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfidos Richtlinie und Einverständniserklärung zur Gesichtserkennung</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Datenschutz</a> und <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Nutzungsbedingungen</a>.</muted-text-micro>`,
        tryAgain: 'Erneut versuchen',
        verifyIdentity: 'Identität bestätigen',
        letsVerifyIdentity: 'Lass uns deine Identität bestätigen',
        butFirst: `Aber zuerst das Langweilige. Lies dir im nächsten Schritt den Rechtstext durch und klicke auf „Akzeptieren“, wenn du bereit bist.`,
        genericError: 'Bei der Verarbeitung dieses Schritts ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        cameraPermissionsNotGranted: 'Kamerazugriff aktivieren',
        cameraRequestMessage: 'Wir benötigen Zugriff auf deine Kamera, um die Bankkontoverifizierung abzuschließen. Bitte aktiviere dies unter Einstellungen > New Expensify.',
        microphonePermissionsNotGranted: 'Mikrofonzugriff aktivieren',
        microphoneRequestMessage: 'Wir benötigen Zugriff auf dein Mikrofon, um die Bankkontoverifizierung abzuschließen. Bitte aktiviere es über Einstellungen > New Expensify.',
        originalDocumentNeeded: 'Bitte lade ein Originalfoto deines Ausweises hoch und nicht einen Screenshot oder einen Scan.',
        documentNeedsBetterQuality:
            'Ihr Ausweis scheint beschädigt zu sein oder es fehlen Sicherheitsmerkmale. Bitte laden Sie ein Originalbild eines unbeschädigten Ausweises hoch, der vollständig sichtbar ist.',
        imageNeedsBetterQuality: 'Es gibt ein Problem mit der Bildqualität deines Ausweises. Bitte lade ein neues Bild hoch, auf dem dein gesamter Ausweis deutlich zu sehen ist.',
        selfieIssue: 'Mit deinem Selfie/Video stimmt etwas nicht. Bitte lade ein aktuelles Selfie/Video hoch.',
        selfieNotMatching: 'Dein Selfie/Video stimmt nicht mit deinem Ausweis überein. Bitte lade ein neues Selfie/Video hoch, auf dem dein Gesicht gut zu erkennen ist.',
        selfieNotLive: 'Dein Selfie/Video scheint kein Live-Foto/-Video zu sein. Bitte lade ein Live-Selfie/-Video hoch.',
    },
    additionalDetailsStep: {
        headerTitle: 'Zusätzliche Details',
        helpText: 'Wir müssen die folgenden Informationen bestätigen, bevor du mit deinem Wallet Geld senden und empfangen kannst.',
        helpTextIdologyQuestions: 'Wir müssen dir nur noch ein paar weitere Fragen stellen, um deine Identität endgültig zu bestätigen.',
        helpLink: 'Erfahre mehr darüber, warum wir das benötigen.',
        legalFirstNameLabel: 'Rechtlicher Vorname',
        legalMiddleNameLabel: 'Zweiter Vorname laut Ausweis',
        legalLastNameLabel: 'Rechtlicher Nachname',
        selectAnswer: 'Bitte wähle eine Antwort aus, um fortzufahren',
        ssnFull9Error: 'Bitte eine gültige neunstellige Sozialversicherungsnummer eingeben',
        needSSNFull9: 'Wir können Ihre Sozialversicherungsnummer (SSN) nicht verifizieren. Bitte geben Sie alle neun Ziffern Ihrer SSN ein.',
        weCouldNotVerify: 'Wir konnten nicht verifizieren',
        pleaseFixIt: 'Bitte korrigiere diese Angaben, bevor du fortfährst',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Wir konnten Ihre Identität nicht verifizieren. Bitte versuchen Sie es später erneut oder wenden Sie sich an <a href="mailto:${conciergeEmail}">${conciergeEmail}</a>, wenn Sie Fragen haben.`,
    },
    termsStep: {
        headerTitle: 'Bedingungen und Gebühren',
        headerTitleRefactor: 'Gebühren und Bedingungen',
        haveReadAndAgreePlain: 'Ich habe die Informationen gelesen und bin damit einverstanden, elektronische Hinweise zu erhalten.',
        haveReadAndAgree: `Ich habe die <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">elektronischen Hinweise</a> gelesen und stimme zu, sie zu erhalten.`,
        agreeToThePlain: 'Ich stimme der Datenschutz- und Wallet-Vereinbarung zu.',
        agreeToThe: (walletAgreementUrl: string) =>
            `Ich stimme der <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzerklärung</a> und der <a href="${walletAgreementUrl}">Wallet-Vereinbarung</a> zu.`,
        enablePayments: 'Zahlungen aktivieren',
        monthlyFee: 'Monatliche Gebühr',
        inactivity: 'Inaktivität',
        noOverdraftOrCredit: 'Keine Überziehungs- oder Kreditfunktion.',
        electronicFundsWithdrawal: 'Elektronische Lastschrift',
        standard: 'Standard',
        reviewTheFees: 'Sieh dir einige Gebühren an.',
        checkTheBoxes: 'Bitte kreuzen Sie die Kästchen unten an.',
        agreeToTerms: 'Stimme den Bedingungen zu und du bist startklar!',
        shortTermsForm: {
            expensifyPaymentsAccount: (walletProgram: string) => `Die Expensify-Wallet wird von ${walletProgram} herausgegeben.`,
            perPurchase: 'Pro Einkauf',
            atmWithdrawal: 'Geldautomat-Abhebung',
            cashReload: 'Bargeldaufladung',
            inNetwork: 'im Netzwerk',
            outOfNetwork: 'außerhalb des Netzwerks',
            atmBalanceInquiry: 'Geldautomaten-Saldoabfrage (im Netzwerk oder außerhalb des Netzwerks)',
            customerService: 'Kundendienst (automatisiert oder Live-Agent)',
            inactivityAfterTwelveMonths: 'Inaktivität (nach 12 Monaten ohne Transaktionen)',
            weChargeOneFee: 'Wir berechnen 1 andere Art von Gebühr. Diese ist:',
            fdicInsurance: 'Ihre Guthaben sind für eine FDIC-Versicherung berechtigt.',
            generalInfo: `Allgemeine Informationen zu Prepaid-Konten finden Sie unter <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Details und Bedingungen zu allen Gebühren und Dienstleistungen finden Sie unter <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> oder telefonisch unter +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektronische Abbuchung (sofort)',
            electronicFundsInstantFeeMin: (amount: string) => `(Min. ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Eine Liste aller Expensify-Wallet-Gebühren',
            typeOfFeeHeader: 'Alle Gebühren',
            feeAmountHeader: 'Betrag',
            moreDetailsHeader: 'Details',
            openingAccountTitle: 'Kontoeröffnung',
            openingAccountDetails: 'Für die Kontoeröffnung fällt keine Gebühr an.',
            monthlyFeeDetails: 'Es gibt keine monatliche Gebühr.',
            customerServiceTitle: 'Kundenservice',
            customerServiceDetails: 'Es fallen keine Servicegebühren für Kunden an.',
            inactivityDetails: 'Es gibt keine Inaktivitätsgebühr.',
            sendingFundsTitle: 'Geld an eine andere Kontoinhaber*in senden',
            sendingFundsDetails: 'Es fällt keine Gebühr an, wenn du mit deinem Guthaben, Bankkonto oder deiner Debitkarte Geld an eine andere Kontoinhaber*in sendest.',
            electronicFundsStandardDetails:
                'Für Überweisungen von deinem Expensify Wallet auf dein Bankkonto mit der Standardoption fällt keine Gebühr an. Diese Überweisung wird normalerweise innerhalb von 1–3 Werktagen abgeschlossen.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Für das Überweisen von Geld von deinem Expensify-Wallet auf deine verknüpfte Debitkarte über die Option „Sofortüberweisung“ fällt eine Gebühr an. Diese Überweisung wird in der Regel innerhalb weniger Minuten abgeschlossen.' +
                `Die Gebühr beträgt ${percentage}% des Überweisungsbetrags (mit einer Mindestgebühr von ${amount}).`,
            fdicInsuranceBancorp: (amount: string) =>
                `Ihre Gelder sind für eine FDIC-Versicherung berechtigt. Ihre Gelder werden bei oder an ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, ein durch die FDIC versichertes Institut, gehalten oder übertragen.` +
                `Sobald sie dort sind, sind Ihre Gelder bis zu ${amount} durch die FDIC versichert, falls ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} ausfällt, sofern bestimmte Anforderungen an die Einlagensicherung erfüllt sind und Ihre Karte registriert ist. Einzelheiten finden Sie unter ${CONST.TERMS.FDIC_PREPAID}.`,
            contactExpensifyPayments: `Kontaktieren Sie ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} telefonisch unter +1 833-400-0904, per E-Mail an ${CONST.EMAIL.CONCIERGE} oder melden Sie sich bei ${CONST.NEW_EXPENSIFY_URL} an.`,
            generalInformation: `Allgemeine Informationen zu Prepaid-Konten finden Sie unter ${CONST.TERMS.CFPB_PREPAID}. Wenn Sie eine Beschwerde zu einem Prepaid-Konto haben, rufen Sie das Consumer Financial Protection Bureau unter 1-855-411-2372 an oder besuchen Sie ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Druckfreundliche Version anzeigen',
            automated: 'Automatisiert',
            liveAgent: 'Live-Agent',
            instant: 'Sofort',
            electronicFundsInstantFeeMin: (amount: string) => `Mind. ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Zahlungen aktivieren',
        activatedTitle: 'Wallet aktiviert!',
        activatedMessage: 'Glückwunsch, deine Wallet ist eingerichtet und bereit für Zahlungen.',
        checkBackLaterTitle: 'Nur eine Minute …',
        checkBackLaterMessage: 'Wir prüfen Ihre Angaben noch. Bitte schauen Sie später noch einmal vorbei.',
        continueToPayment: 'Weiter zur Zahlung',
        continueToTransfer: 'Mit Überweisung fortfahren',
    },
    companyStep: {
        headerTitle: 'Unternehmensinformationen',
        subtitle: 'Fast geschafft! Aus Sicherheitsgründen müssen wir einige Angaben bestätigen:',
        legalBusinessName: 'Rechtlicher Firmenname',
        companyWebsite: 'Firmenwebsite',
        taxIDNumber: 'Steueridentifikationsnummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        companyType: 'Unternehmensart',
        incorporationDate: 'Gründungsdatum',
        incorporationState: 'Gründungsstaat',
        industryClassificationCode: 'Branchenklassifizierungscode',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der',
        listOfRestrictedBusinesses: 'Liste der eingeschränkten Unternehmen',
        incorporationDatePlaceholder: 'Startdatum (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC (Limited Liability Company)',
            CORPORATION: 'Unternehmen',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Genossenschaft',
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
        enterYourLegalFirstAndLast: 'Wie lautet Ihr gesetzlicher Name?',
        legalFirstName: 'Rechtlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        legalName: 'Rechtlicher Name',
        enterYourDateOfBirth: 'Wie ist dein Geburtsdatum?',
        enterTheLast4: 'Wie lauten die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4SSN: 'Letzte 4 Ziffern der SSN',
        enterYourAddress: 'Wie lautet deine Adresse?',
        address: 'Adresse',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        byAddingThisBankAccount: 'Durch Hinzufügen dieses Bankkontos bestätigst du, dass du Folgendes gelesen hast, verstehst und akzeptierst',
        whatsYourLegalName: 'Wie lautet Ihr gesetzlicher Name?',
        whatsYourDOB: 'Was ist dein Geburtsdatum?',
        whatsYourAddress: 'Wie ist deine Adresse?',
        whatsYourSSN: 'Wie lauten die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        noPersonalChecks: 'Keine Sorge, hier gibt es keine persönlichen Bonitätsprüfungen!',
        whatsYourPhoneNumber: 'Wie lautet deine Telefonnummer?',
        weNeedThisToVerify: 'Wir benötigen dies, um deine Wallet zu verifizieren.',
    },
    businessInfoStep: {
        businessInfo: 'Unternehmensinfos',
        enterTheNameOfYourBusiness: 'Wie heißt Ihre Firma?',
        businessName: 'Rechtlicher Firmenname',
        enterYourCompanyTaxIdNumber: 'Wie lautet die Steuernummer Ihres Unternehmens?',
        taxIDNumber: 'Steueridentifikationsnummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        enterYourCompanyWebsite: 'Wie lautet die Website Ihres Unternehmens?',
        companyWebsite: 'Firmenwebsite',
        enterYourCompanyPhoneNumber: 'Wie lautet die Telefonnummer Ihres Unternehmens?',
        enterYourCompanyAddress: 'Wie lautet die Adresse Ihres Unternehmens?',
        selectYourCompanyType: 'Um welche Art von Unternehmen handelt es sich?',
        companyType: 'Unternehmensart',
        incorporationType: {
            LLC: 'LLC (Limited Liability Company)',
            CORPORATION: 'Unternehmen',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Genossenschaft',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Sonstiges',
        },
        selectYourCompanyIncorporationDate: 'Was ist das Gründungsdatum Ihres Unternehmens?',
        incorporationDate: 'Gründungsdatum',
        incorporationDatePlaceholder: 'Startdatum (yyyy-mm-dd)',
        incorporationState: 'Gründungsstaat',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In welchem US-Bundesstaat wurde Ihr Unternehmen gegründet?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        companyAddress: 'Firmenadresse',
        listOfRestrictedBusinesses: 'Liste der eingeschränkten Unternehmen',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der',
        businessInfoTitle: 'Geschäftsinformationen',
        legalBusinessName: 'Rechtlicher Firmenname',
        whatsTheBusinessName: 'Wie lautet der Firmenname?',
        whatsTheBusinessAddress: 'Wie lautet die Geschäftsadresse?',
        whatsTheBusinessContactInformation: 'Wie lauten die geschäftlichen Kontaktdaten?',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Was ist die Handelsregisternummer (CRN)?';
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
        whatTypeOfBusinessIsIt: 'Welche Art von Unternehmen ist es?',
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
                    return 'USt-IdNr.';
                case CONST.COUNTRY.AU:
                    return 'ABN';
                default:
                    return 'EU-Mehrwertsteuer';
            }
        },
        businessAddress: 'Geschäftsadresse',
        businessType: 'Unternehmensart',
        incorporation: 'Gründung',
        incorporationCountry: 'Gründungsland',
        incorporationTypeName: 'Rechtsform der Gesellschaft',
        businessCategory: 'Geschäftskategorie',
        annualPaymentVolume: 'Jährliches Zahlungsvolumen',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Jährliches Zahlungsvolumen in ${currencyCode}`,
        averageReimbursementAmount: 'Durchschnittlicher Erstattungsbetrag',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Durchschnittlicher Erstattungsbetrag in ${currencyCode}`,
        selectIncorporationType: 'Rechtsform auswählen',
        selectBusinessCategory: 'Geschäftskategorie auswählen',
        selectAnnualPaymentVolume: 'Jährliches Zahlungsvolumen auswählen',
        selectIncorporationCountry: 'Gründungsland auswählen',
        selectIncorporationState: 'Incorporierungsstaat auswählen',
        selectAverageReimbursement: 'Wähle den durchschnittlichen Erstattungsbetrag aus',
        selectBusinessType: 'Geschäftstyp auswählen',
        findIncorporationType: 'Rechtsform finden',
        findBusinessCategory: 'Geschäftskategorie finden',
        findAnnualPaymentVolume: 'Jährliches Zahlungsvolumen finden',
        findIncorporationState: 'Gründungsstaat finden',
        findAverageReimbursement: 'Durchschnittliche Erstattungsbeträge finden',
        findBusinessType: 'Unternehmenstyp finden',
        error: {
            registrationNumber: 'Bitte gib eine gültige Registrierungsnummer ein',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Bitte geben Sie eine gültige Arbeitgeber-Identifikationsnummer (EIN) ein';
                    case CONST.COUNTRY.CA:
                        return 'Bitte gib eine gültige Business-Nummer (BN) ein';
                    case CONST.COUNTRY.GB:
                        return 'Bitte geben Sie eine gültige Umsatzsteuer-Identifikationsnummer (USt-IdNr.) ein';
                    case CONST.COUNTRY.AU:
                        return 'Bitte gib eine gültige Australian Business Number (ABN) ein';
                    default:
                        return 'Bitte eine gültige EU-Umsatzsteuer-Identifikationsnummer eingeben';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `Besitzen Sie 25 % oder mehr von ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `Besitzen einzelne Personen 25 % oder mehr von ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Gibt es noch weitere Personen, die 25 % oder mehr von ${companyName} besitzen?`,
        regulationRequiresUsToVerifyTheIdentity: 'Vorschriften verpflichten uns, die Identität jeder Person zu überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        companyOwner: 'Unternehmensinhaber',
        enterLegalFirstAndLastName: 'Wie lautet der gesetzliche Name der*des Eigentümer*in?',
        legalFirstName: 'Rechtlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        enterTheDateOfBirthOfTheOwner: 'Wie lautet das Geburtsdatum des Eigentümers?',
        enterTheLast4: 'Wie lauten die letzten 4 Ziffern der Sozialversicherungsnummer des Inhabers?',
        last4SSN: 'Letzte 4 Ziffern der SSN',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        enterTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        address: 'Adresse',
        byAddingThisBankAccount: 'Durch Hinzufügen dieses Bankkontos bestätigst du, dass du Folgendes gelesen hast, verstehst und akzeptierst',
        owners: 'Eigentümer',
    },
    ownershipInfoStep: {
        ownerInfo: 'Inhaberinfos',
        businessOwner: 'Unternehmensinhaber',
        signerInfo: 'Unterzeichnerdetails',
        doYouOwn: (companyName: string) => `Besitzen Sie 25 % oder mehr von ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `Besitzen einzelne Personen 25 % oder mehr von ${companyName}?`,
        regulationsRequire: 'Vorschriften verpflichten uns, die Identität jeder Person zu überprüfen, der mehr als 25 % des Unternehmens gehören.',
        legalFirstName: 'Rechtlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        whatsTheOwnersName: 'Wie lautet der gesetzliche Name der*des Eigentümer*in?',
        whatsYourName: 'Wie lautet Ihr gesetzlicher Name?',
        whatPercentage: 'Wie viel Prozent des Unternehmens gehören dem/der Inhaber:in?',
        whatsYoursPercentage: 'Wie viel Prozent des Unternehmens besitzen Sie?',
        ownership: 'Eigentum',
        whatsTheOwnersDOB: 'Wie lautet das Geburtsdatum des Eigentümers?',
        whatsYourDOB: 'Wie ist dein Geburtsdatum?',
        whatsTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        whatsYourAddress: 'Wie lautet deine Adresse?',
        whatAreTheLast: 'Wie lauten die letzten 4 Ziffern der Sozialversicherungsnummer des Inhabers?',
        whatsYourLast: 'Wie lauten die letzten 4 Ziffern Ihrer Sozialversicherungsnummer?',
        whatsYourNationality: 'Was ist dein Staatsangehörigkeitsland?',
        whatsTheOwnersNationality: 'In welchem Land ist der/die Inhaber:in Staatsbürger:in?',
        countryOfCitizenship: 'Staatsangehörigkeit',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4: 'Letzte 4 Ziffern der SSN',
        whyDoWeAsk: 'Warum fragen wir danach?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        ownershipPercentage: 'Eigentumsanteil',
        areThereOther: (companyName: string) => `Gibt es andere Personen, die ${companyName} zu 25 % oder mehr besitzen?`,
        owners: 'Eigentümer',
        addCertified: 'Fügen Sie ein zertifiziertes Organigramm hinzu, das die wirtschaftlich Berechtigten zeigt',
        regulationRequiresChart:
            'Aufgrund gesetzlicher Vorgaben müssen wir eine beglaubigte Kopie des Eigentumsdiagramms einholen, das jede Person oder juristische Einheit ausweist, die 25 % oder mehr des Unternehmens besitzt.',
        uploadEntity: 'Diagramm zur Beteiligungsstruktur hochladen',
        noteEntity:
            'Hinweis: Das Organigramm der Unternehmenseigentümer muss von Ihrer Steuerberaterin/Ihrem Steuerberater, Ihrer Rechtsberaterin/Ihrem Rechtsberater unterschrieben oder notariell beglaubigt sein.',
        certified: 'Beglaubigtes Beteiligungsdiagramm der juristischen Person',
        selectCountry: 'Land auswählen',
        findCountry: 'Land finden',
        address: 'Adresse',
        chooseFile: 'Datei auswählen',
        uploadDocuments: 'Zusätzliche Dokumente hochladen',
        pleaseUpload:
            'Bitte laden Sie unten zusätzliche Unterlagen hoch, damit wir Ihre Identität als direkte*r oder indirekte*r Eigentümer*in von 25 % oder mehr der Geschäftseinheit überprüfen können.',
        acceptedFiles: 'Akzeptierte Dateiformate: PDF, PNG, JPEG. Die Gesamtdateigröße für jeden Abschnitt darf 5 MB nicht überschreiten.',
        proofOfBeneficialOwner: 'Nachweis des wirtschaftlich Berechtigten',
        proofOfBeneficialOwnerDescription:
            'Bitte legen Sie eine unterzeichnete Bescheinigung und ein Organigramm vor, ausgestellt von einem vereidigten Buchhalter, Notar oder Rechtsanwalt, die den Besitz von 25 % oder mehr des Unternehmens bestätigt. Das Dokument muss innerhalb der letzten drei Monate datiert sein und die Lizenznummer der unterzeichnenden Person enthalten.',
        copyOfID: 'Kopie des Ausweises des wirtschaftlich Berechtigten',
        copyOfIDDescription: 'Beispiele: Reisepass, Führerschein usw.',
        proofOfAddress: 'Adressnachweis für wirtschaftlich Berechtigte',
        proofOfAddressDescription: 'Beispiele: Stromrechnung, Mietvertrag usw.',
        codiceFiscale: 'Steuer-ID/Codice Fiscale',
        codiceFiscaleDescription:
            'Bitte laden Sie ein Video von einem Standortbesuch oder einem aufgezeichneten Gespräch mit dem zeichnungsberechtigten Bevollmächtigten hoch. Die Person muss Folgendes angeben: vollständiger Name, Geburtsdatum, Firmenname, Handelsregisternummer, Steuernummer, eingetragene Anschrift, Geschäftsart und Verwendungszweck des Kontos.',
    },
    completeVerificationStep: {
        completeVerification: 'Verifizierung abschließen',
        confirmAgreements: 'Bitte bestätige die untenstehenden Vereinbarungen.',
        certifyTrueAndAccurate: 'Ich bestätige, dass die angegebenen Informationen wahr und korrekt sind',
        certifyTrueAndAccurateError: 'Bitte bestätigen Sie, dass die Angaben wahrheitsgemäß und korrekt sind',
        isAuthorizedToUseBankAccount: 'Ich bin berechtigt, dieses Geschäftskonto für Geschäftsausgaben zu verwenden',
        isAuthorizedToUseBankAccountError: 'Sie müssen eine vertretungsberechtigte Führungskraft mit Vollmacht zur Führung des Geschäftskontos sein',
        termsAndConditions: 'Allgemeine Geschäftsbedingungen',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Bestätige dein Bankkonto',
        validateButtonText: 'Validieren',
        validationInputLabel: 'Transaktion',
        maxAttemptsReached: 'Die Validierung für dieses Bankkonto wurde aufgrund zu vieler falscher Versuche deaktiviert.',
        description: `Innerhalb von 1–2 Werktagen senden wir drei (3) kleine Transaktionen auf Ihr Bankkonto von einem Namen wie „Expensify, Inc. Validation“.`,
        descriptionCTA: 'Bitte gib unten in die Felder die einzelnen Transaktionsbeträge ein. Beispiel: 1.51.',
        letsChatText: 'Fast geschafft! Wir brauchen noch kurz deine Hilfe, um ein paar letzte Informationen im Chat zu bestätigen. Bereit?',
        enable2FATitle: 'Betrug verhindern, Zwei-Faktor-Authentifizierung (2FA) aktivieren',
        enable2FAText: 'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt 2FA ein, um Ihrem Konto eine zusätzliche Schutzebene hinzuzufügen.',
        secureYourAccount: 'Schütze dein Konto',
    },
    countryStep: {
        confirmBusinessBank: 'Bestätige Währung und Land des Geschäftskontos',
        confirmCurrency: 'Währung und Land bestätigen',
        yourBusiness: 'Die Währung Ihres Geschäftskontos muss mit der Währung Ihres Workspaces übereinstimmen.',
        youCanChange: 'Sie können die Währung Ihres Arbeitsbereichs in Ihren',
        findCountry: 'Land finden',
        selectCountry: 'Land auswählen',
    },
    bankInfoStep: {
        whatAreYour: 'Wie lauten die Bankdaten Ihres Geschäftskontos?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles gut aussieht.',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in deinem Workspace verwendet',
        accountNumber: 'Kontonummer',
        accountHolderNameDescription: 'Vollständiger Name der zeichnungsberechtigten Person',
    },
    signerInfoStep: {
        signerInfo: 'Unterzeichnerdetails',
        areYouDirector: (companyName: string) => `Sind Sie eine Führungskraft bei ${companyName}?`,
        regulationRequiresUs: 'Gesetzliche Vorschriften verlangen, dass wir überprüfen, ob die unterzeichnende Person befugt ist, diese Aktion im Namen des Unternehmens vorzunehmen.',
        whatsYourName: 'Wie lautet dein gesetzlicher Name',
        fullName: 'Vollständiger gesetzlicher Name',
        whatsYourJobTitle: 'Wie lautet deine Berufsbezeichnung?',
        jobTitle: 'Berufsbezeichnung',
        whatsYourDOB: 'Wie ist dein Geburtsdatum?',
        uploadID: 'Lade Ausweis und Adressnachweis hoch',
        personalAddress: 'Nachweis der privaten Anschrift (z. B. Versorgungsrechnung)',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        proofOf: 'Nachweis der Privatadresse',
        enterOneEmail: (companyName: string) => `Gib die E-Mail-Adresse einer Geschäftsführungsperson von ${companyName} ein`,
        regulationRequiresOneMoreDirector: 'Vorschriften erfordern mindestens eine weitere:n Geschäftsführer:in als Unterzeichner:in.',
        hangTight: 'Einen Moment bitte ...',
        enterTwoEmails: (companyName: string) => `Gib die E-Mail-Adressen von zwei Direktoren bei ${companyName} ein`,
        sendReminder: 'Erinnerung senden',
        chooseFile: 'Datei auswählen',
        weAreWaiting: 'Wir warten darauf, dass andere ihre Identität als Geschäftsführende des Unternehmens verifizieren.',
        id: 'Ausweiskopie',
        proofOfDirectors: 'Nachweis der Direktor(en)',
        proofOfDirectorsDescription: 'Beispiele: Oncorp-Unternehmensprofil oder Unternehmensregistrierung.',
        codiceFiscale: 'Steuernummer',
        codiceFiscaleDescription: 'Codice Fiscale für Unterzeichnende, Bevollmächtigte und wirtschaftlich Berechtigte.',
        PDSandFSG: 'PDS- und FSG-Offenlegungsunterlagen',
        PDSandFSGDescription: dedent(`
            Unsere Partnerschaft mit Corpay nutzt eine API-Verbindung, um deren umfangreiches Netzwerk internationaler Bankpartner zu verwenden und so Globale Erstattungen in Expensify zu ermöglichen. Gemäß den australischen Vorschriften stellen wir Ihnen den Financial Services Guide (FSG) und die Product Disclosure Statement (PDS) von Corpay zur Verfügung.

            Bitte lesen Sie die FSG- und PDS-Dokumente sorgfältig, da sie vollständige Details und wichtige Informationen zu den Produkten und Dienstleistungen enthalten, die Corpay anbietet. Bewahren Sie diese Dokumente für zukünftige Referenzzwecke auf.
        `),
        pleaseUpload: 'Bitte laden Sie unten zusätzliche Unterlagen hoch, damit wir Ihre Identität als Geschäftsführer*in des Unternehmens verifizieren können.',
        enterSignerInfo: 'Unterzeichnerinformationen eingeben',
        thisStep: 'Dieser Schritt wurde abgeschlossen',
        isConnecting: (bankAccountLastFour: string | undefined, currency: string | undefined) =>
            `verknüpft ein ${currency}-Geschäftskonto mit der Endung ${bankAccountLastFour} mit Expensify, um Mitarbeitende in ${currency} zu bezahlen. Der nächste Schritt erfordert Unterzeichnungsinformationen von einer Führungsperson.`,
        error: {
            emailsMustBeDifferent: 'E-Mail-Adressen müssen unterschiedlich sein',
        },
    },
    agreementsStep: {
        agreements: 'Vereinbarungen',
        pleaseConfirm: 'Bitte bestätige die folgenden Vereinbarungen',
        regulationRequiresUs: 'Vorschriften verpflichten uns, die Identität jeder Person zu überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        iAmAuthorized: 'Ich bin berechtigt, das Geschäftskonto für Geschäftsausgaben zu verwenden.',
        iCertify: 'Ich bestätige, dass die bereitgestellten Angaben wahr und korrekt sind.',
        iAcceptTheTermsAndConditions: `Ich akzeptiere die <a href="https://cross-border.corpay.com/tc/">Allgemeinen Geschäftsbedingungen</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Ich akzeptiere die Geschäftsbedingungen.',
        accept: 'Akzeptieren und Bankkonto hinzufügen',
        iConsentToThePrivacyNotice: 'Ich stimme der <a href="https://payments.corpay.com/compliance">Datenschutzerklärung</a> zu.',
        iConsentToThePrivacyNoticeAccessibility: 'Ich stimme der Datenschutzerklärung zu.',
        error: {
            authorized: 'Sie müssen eine vertretungsberechtigte Führungskraft mit Vollmacht zur Führung des Geschäftskontos sein',
            certify: 'Bitte bestätigen Sie, dass die Angaben wahrheitsgemäß und korrekt sind',
            consent: 'Bitte willigen Sie in den Datenschutzhinweis ein',
        },
    },
    docusignStep: {
        subheader: 'DocuSign-Formular',
        pleaseComplete:
            'Bitte füllen Sie das ACH-Autorisierungsformular über den DocuSign-Link unten aus und laden Sie die unterschriebene Kopie anschließend hier hoch, damit wir Gelder direkt von Ihrem Bankkonto abbuchen können.',
        pleaseCompleteTheBusinessAccount: 'Bitte füllen Sie den Antrag auf Lastschrifteinzug für das Geschäftskonto aus',
        pleaseCompleteTheDirect:
            'Bitte füllen Sie die Lastschriftvereinbarung über den Docusign-Link unten aus und laden Sie anschließend die unterschriebene Kopie hier hoch, damit wir Gelder direkt von Ihrem Bankkonto einziehen können.',
        takeMeTo: 'Bring mich zu DocuSign',
        uploadAdditional: 'Zusätzliche Dokumente hochladen',
        pleaseUpload: 'Bitte laden Sie das DEFT-Formular und die Docusign-Unterschriftsseite hoch',
        pleaseUploadTheDirect: 'Bitte lade die Einzugsermächtigungen und die Docusign-Unterschriftsseite hoch',
    },
    finishStep: {
        letsFinish: 'Lass uns den Chat hier beenden!',
        thanksFor:
            'Vielen Dank für diese Angaben. Eine feste Support-Ansprechperson wird Ihre Informationen nun prüfen. Wir melden uns, falls wir noch etwas von Ihnen benötigen, aber Sie können sich in der Zwischenzeit jederzeit mit Fragen an uns wenden.',
        iHaveA: 'Ich habe eine Frage',
        enable2FA: 'Aktiviere die Zwei-Faktor-Authentifizierung (2FA), um Betrug zu verhindern',
        weTake: 'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt 2FA ein, um Ihrem Konto eine zusätzliche Schutzebene hinzuzufügen.',
        secure: 'Schütze dein Konto',
    },
    documentsStep: {
        beforeYouGo: 'Bevor du fortfährst, benötigen wir einige Dokumente, um bestimmte Angaben zu überprüfen',
        subheader: 'Verifizierung',
        verificationFailed: 'Die Verifizierung ist fehlgeschlagen, daher benötigen wir zusätzliche Dokumente, um dich und dein Unternehmen zu überprüfen',
        taxIDVerification: 'Steuer-ID-Verifizierung',
        taxIDVerificationDescription: dedent(`
        Bitte lade eine der folgenden Dateien hoch:
        • IRS TIN/EIN-Zuweisungsschreiben
        • IRS TIN/EIN-Antragsbestätigung (enthält normalerweise „Congratulations! The EIN has been successfully assigned“)
        • IRS-Steuerbefreiungsschreiben mit Firmenname und EIN`),
        nameChangeDocument: 'Dokument zur Namensänderung',
        nameChangeDocumentDescription:
            'Wenn sich der Name deines Unternehmens seit der Beantragung der TIN/EIN geändert hat, benötigen wir dieses Dokument zur Verifizierung der angegebenen Steuer-ID',
        companyAddressVerification: 'Verifizierung der Unternehmensadresse',
        companyAddressVerificationDescription: dedent(`
        Bitte lade eine der folgenden Dateien hoch:
        • Aktuelle Strom-, Wasser- oder Gasrechnung mit Firmenname und Adresse
        • Kontoauszug mit Firmenname und Adresse
        • Aktueller Miet- oder Leasingvertrag inkl. Unterschriftsseite mit Firmenname und aktueller Adresse
        • Versicherungsnachweis mit Firmenname und Adresse
        • TIN-Zuweisungsdokument mit Firmenname und Adresse`),
        userAddressVerification: 'Adressverifizierung',
        userAddressVerificationDescription: dedent(`
        Bitte lade eine der folgenden Dateien hoch:
        • Wählerregistrierungskarte
        • Führerschein
        • Kontoauszug
        • Versorgungsrechnung`),
        userDOBVerification: 'Geburtsdatumsverifizierung',
        userDOBVerificationDescription: 'Bitte lade einen in den USA ausgestellten Ausweis hoch',
        finishViaChat: 'Über Chat abschließen',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Einen Moment',
        explanationLine: 'Wir überprüfen gerade Ihre Angaben. Sie können in Kürze mit den nächsten Schritten fortfahren.',
    },
    session: {
        offlineMessageRetry: 'Anscheinend bist du offline. Bitte prüfe deine Verbindung und versuche es erneut.',
    },
    travel: {
        header: 'Reise buchen',
        title: 'Reise clever',
        subtitle: 'Nutze Expensify Travel, um die besten Reiseangebote zu erhalten und all deine geschäftlichen Ausgaben an einem Ort zu verwalten.',
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
            title: 'Allgemeine Geschäftsbedingungen',
            label: 'Ich stimme den Geschäftsbedingungen zu',
            subtitle: `Bitte stimme den Expensify Travel-<a href="${CONST.TRAVEL_TERMS_URL}">Geschäftsbedingungen</a> zu.`,
            error: 'Sie müssen den Expensify Travel Geschäftsbedingungen zustimmen, um fortzufahren',
            defaultWorkspaceError:
                'Sie müssen einen Standard-Arbeitsbereich festlegen, um Expensify Travel zu aktivieren. Gehen Sie zu Einstellungen > Arbeitsbereiche > klicken Sie auf die drei vertikalen Punkte neben einem Arbeitsbereich > Als Standard-Arbeitsbereich festlegen und versuchen Sie es dann erneut!',
        },
        flight: 'Flug',
        flightDetails: {
            passenger: 'Passagier',
            layover: (layover: string) => `<muted-text-label>Sie haben einen <strong>${layover} Zwischenstopp</strong> vor diesem Flug</muted-text-label>`,
            takeOff: 'Abflug',
            landing: 'Landung',
            seat: 'Sitz',
            class: 'Kabinenklasse',
            recordLocator: 'Buchungsnummer',
            cabinClasses: {
                unknown: 'Unbekannt',
                economy: 'Economy',
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
        tripSummary: 'Reisezusammenfassung',
        departs: 'Abfahrt',
        errorMessage: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.',
        phoneError: (phoneErrorMethodsRoute: string) =>
            `<rbr>Bitte <a href="${phoneErrorMethodsRoute}">fügen Sie eine geschäftliche E-Mail als primäre Anmeldung hinzu</a>, um Reisen zu buchen.</rbr>`,
        domainSelector: {
            title: 'Domain',
            subtitle: 'Wählen Sie eine Domain für die Expensify Travel-Einrichtung.',
            recommended: 'Empfohlen',
        },
        domainPermissionInfo: {
            title: 'Domain',
            restriction: (domain: string) =>
                `Sie haben keine Berechtigung, Expensify Travel für die Domain <strong>${domain}</strong> zu aktivieren. Bitten Sie stattdessen jemanden aus dieser Domain, Travel zu aktivieren.`,
            accountantInvitation: `Wenn Sie Buchhalter:in sind, sollten Sie dem <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved!-Programm für Buchhalter:innen</a> beitreten, um Reisen für diese Domain zu aktivieren.`,
        },
        publicDomainError: {
            title: 'Los geht’s mit Expensify Travel',
            message: `Du musst bei Expensify Travel deine geschäftliche E‑Mail-Adresse verwenden (z. B. name@company.com), nicht deine private E‑Mail-Adresse (z. B. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel wurde deaktiviert',
            message: `Ihre Administration hat Expensify Travel deaktiviert. Bitte halten Sie sich für Reisebuchungen an die Reiserichtlinie Ihres Unternehmens.`,
        },
        verifyCompany: {
            title: 'Wir überprüfen Ihre Anfrage …',
            message: `Wir führen ein paar Überprüfungen durch, um sicherzustellen, dass dein Konto für Expensify Travel bereit ist. Wir melden uns in Kürze bei dir!`,
            confirmText: 'Verstanden',
            conciergeMessage: ({domain}: {domain: string}) =>
                `Aktivierung von Reisen für die Domain ${domain} fehlgeschlagen. Bitte überprüfen Sie diese Domain und aktivieren Sie Reisen dafür.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde gebucht. Bestätigungscode: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Dein Ticket für den Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde storniert.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Ticket für den Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde erstattet oder umgebucht.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate}} wurde von der Fluggesellschaft storniert.`,
            flightScheduleChangePending: (airlineCode: string) => `Die Fluggesellschaft hat eine Flugplanänderung für Flug ${airlineCode} vorgeschlagen; wir warten auf die Bestätigung.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Änderung des Flugplans bestätigt: Flug ${airlineCode} startet jetzt um ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde aktualisiert.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Ihre Kabinenklasse wurde auf ${cabinClass} auf Flug ${airlineCode} aktualisiert.`,
            flightSeatConfirmed: (airlineCode: string) => `Ihre Sitzplatzzuweisung für Flug ${airlineCode} wurde bestätigt.`,
            flightSeatChanged: (airlineCode: string) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde geändert.`,
            flightSeatCancelled: (airlineCode: string) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde entfernt.`,
            paymentDeclined: 'Die Zahlung für Ihre Flugbuchung ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
            bookingCancelledByTraveler: (type: string, id = '') => `Sie haben Ihre ${type}-Reservierung ${id} storniert.`,
            bookingCancelledByVendor: (type: string, id = '') => `Der Anbieter hat deine ${type}-Reservierung ${id} storniert.`,
            bookingRebooked: (type: string, id = '') => `Ihre ${type}-Reservierung wurde erneut gebucht. Neue Bestätigungsnummer: ${id}.`,
            bookingUpdated: (type: string) => `Ihre ${type}-Buchung wurde aktualisiert. Prüfen Sie die neuen Details in der Reiseroute.`,
            railTicketRefund: (origin: string, destination: string, startDate: string) =>
                `Ihr Bahnticket für ${origin} → ${destination} am ${startDate} wurde erstattet. Eine Gutschrift wird verarbeitet.`,
            railTicketExchange: (origin: string, destination: string, startDate: string) => `Ihr Bahnticket für ${origin} → ${destination} am ${startDate} wurde umgetauscht.`,
            railTicketUpdate: (origin: string, destination: string, startDate: string) => `Dein Zugticket von ${origin} nach ${destination} am ${startDate} wurde aktualisiert.`,
            defaultUpdate: (type: string) => `Ihre ${type}-Reservierung wurde aktualisiert.`,
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
            expensifyCard: 'Expensify Karte',
            companyCards: 'Firmenkarten',
            personalCards: 'Persönliche Karten',
            workflows: 'Workflows',
            workspace: 'Workspace',
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
            customFieldHint: 'Füge benutzerdefinierte Codierung hinzu, die für alle Ausgaben dieses Mitglieds gilt.',
            reports: 'Berichte',
            reportFields: 'Berichtsfelder',
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
            deleteConfirmation: 'Möchten Sie diesen Workspace wirklich löschen?',
            deleteWithCardsConfirmation: 'Möchtest du diesen Workspace wirklich löschen? Dadurch werden alle Kartenfeeds und zugewiesenen Karten entfernt.',
            outstandingBalanceWarning:
                'Sie haben einen offenen Saldo, der beglichen werden muss, bevor Sie Ihren letzten Workspace löschen können. Bitte gehen Sie zu Ihren Abonnementeinstellungen, um die Zahlung abzuschließen.',
            settleBalance: 'Zu Abo wechseln',
            unavailable: 'Nicht verfügbiger Arbeitsbereich',
            memberNotFound: 'Mitglied nicht gefunden. Um ein neues Mitglied zum Arbeitsbereich einzuladen, verwende bitte die Einladungsschaltfläche oben.',
            notAuthorized: `Du hast keinen Zugriff auf diese Seite. Wenn du versuchst, diesem Arbeitsbereich beizutreten, bitte einfach die/den Arbeitsbereichsinhaber·in, dich als Mitglied hinzuzufügen. Etwas anderes? Wende dich an ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Zum Arbeitsbereich',
            duplicateWorkspace: 'Arbeitsbereich duplizieren',
            duplicateWorkspacePrefix: 'Duplizieren',
            goToWorkspaces: 'Zu Workspaces wechseln',
            clearFilter: 'Filter zurücksetzen',
            workspaceName: 'Arbeitsbereichsname',
            workspaceOwner: 'Inhaber',
            keepMeAsAdmin: 'Behalte mich als Administrator',
            workspaceType: 'Arbeitsbereichstyp',
            workspaceAvatar: 'Workspace-Avatar',
            clientID: 'Kunden-ID',
            clientIDInputHint: 'Geben Sie die eindeutige Kennung des Kunden ein',
            mustBeOnlineToViewMembers: 'Du musst online sein, um die Mitglieder dieses Arbeitsbereichs anzeigen zu können.',
            moreFeatures: 'Mehr Funktionen',
            requested: 'Angefordert',
            distanceRates: 'Kilometersätze',
            defaultDescription: 'Ein Ort für all Ihre Belege und Ausgaben.',
            descriptionHint: 'Teile Informationen über diesen Arbeitsbereich mit allen Mitgliedern.',
            welcomeNote: 'Bitte nutze Expensify, um deine Belege zur Erstattung einzureichen, danke!',
            subscription: 'Abonnement',
            markAsEntered: 'Als manuell erfasst markieren',
            markAsExported: 'Als exportiert markieren',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exportieren nach ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
            lineItemLevel: 'Positionsebene',
            reportLevel: 'Report-Ebene',
            topLevel: 'Oberste Ebene',
            appliedOnExport: 'Nicht in Expensify importiert, beim Export angewendet',
            shareNote: {
                header: 'Teile deinen Workspace mit anderen Mitgliedern',
                content: (adminsRoomLink: string) =>
                    `Teile diesen QR-Code oder kopiere den Link unten, damit Mitglieder ganz einfach Zugriff auf deinen Workspace anfordern können. Alle Anfragen zum Beitritt zum Workspace werden zur Überprüfung im Raum <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> angezeigt.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} verbinden`,
            createNewConnection: 'Neue Verbindung erstellen',
            reuseExistingConnection: 'Vorhandene Verbindung wiederverwenden',
            existingConnections: 'Bestehende Verbindungen',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Da du zuvor bereits eine Verbindung zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} hergestellt hast, kannst du entweder eine bestehende Verbindung wiederverwenden oder eine neue erstellen.`,
            lastSyncDate: (connectionName: string, formattedDate: string) => `${connectionName} – Zuletzt synchronisiert am ${formattedDate}`,
            authenticationError: (connectionName: string) => `Verbindung mit ${connectionName} aufgrund eines Authentifizierungsfehlers nicht möglich.`,
            learnMore: 'Mehr erfahren',
            memberAlternateText: 'Berichte einreichen und freigeben.',
            adminAlternateText: 'Berichte und Arbeitsbereichseinstellungen verwalten.',
            auditorAlternateText: 'Berichte anzeigen und kommentieren.',
            roleName: (role?: string) => {
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
                'Sie können Ihren Tarif bei einem abgerechneten Abonnement nicht herabstufen. Um Ihre Optionen zu besprechen oder Änderungen an Ihrem Abonnement vorzunehmen, wenden Sie sich bitte an Ihre* Ihren* Account Manager*in oder an Concierge.',
            defaultCategory: 'Standardkategorie',
            viewTransactions: 'Transaktionen anzeigen',
            policyExpenseChatName: (displayName: string) => `Spesen von ${displayName}`,
            reimbursementChoice: {
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES]: 'Direkt',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO]: 'Keine',
                [CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL]: 'Indirekt',
            },
            budgetFrequency: {monthly: 'monatlich', yearly: 'jährlich'},
            budgetFrequencyUnit: {monthly: 'Monat', yearly: 'Jahr'},
            budgetTypeForNotificationMessage: {tag: 'Tag', category: 'Kategorie'},
            deepDiveExpensifyCard: `<muted-text-label>Transaktionen der Expensify Karte werden automatisch in ein „Expensify Karte Verbindlichkeitskonto“ exportiert, das mit <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">unserer Integration</a> erstellt wird.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: (organizationName: string) =>
                    organizationName ? `Verbunden mit ${organizationName}` : 'Automatisiere Reise- und Essenslieferkosten in deinem gesamten Unternehmen.',
                sendInvites: 'Einladungen senden',
                sendInvitesDescription:
                    'Diese Workspace-Mitglieder haben noch kein Uber for Business-Konto. Entferne die Auswahl bei allen Mitgliedern, die du derzeit nicht einladen möchtest.',
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
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Gesperrt',
                },
                centralBillingAccount: 'Zentrales Abrechnungskonto',
                centralBillingDescription: 'Wähle aus, wohin alle Uber-Belege importiert werden sollen.',
                invitationFailure: 'Mitglied konnte nicht zu Uber for Business eingeladen werden',
                autoInvite: 'Neue Workspace-Mitglieder zu Uber for Business einladen',
                autoRemove: 'Entfernte Mitglieder des Arbeitsbereichs in Uber for Business deaktivieren',
                emptyContent: {
                    title: 'Keine ausstehenden Einladungen',
                    subtitle: 'Hurra! Wir haben überall gesucht und keine offenen Einladungen gefunden.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Setzen Sie Pauschalspesen, um die täglichen Ausgaben von Mitarbeitenden zu steuern. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Mehr erfahren</a>.</muted-text>`,
            amount: 'Betrag',
            deleteRates: () => ({
                one: 'Satz löschen',
                other: 'Tarife löschen',
            }),
            deletePerDiemRate: 'Pauschale löschen',
            findPerDiemRate: 'Tagessatz finden',
            areYouSureDelete: () => ({
                one: 'Sind Sie sicher, dass Sie diesen Satz löschen möchten?',
                other: 'Möchten Sie diese Tarife wirklich löschen?',
            }),
            emptyList: {
                title: 'Tagegeld',
                subtitle: 'Legen Sie Pauschalbeträge fest, um die täglichen Ausgaben der Mitarbeitenden zu steuern. Importieren Sie zu Beginn die Sätze aus einer Tabellenkalkulation.',
            },
            importPerDiemRates: 'Tagespauschalen importieren',
            editPerDiemRate: 'Tagessatz bearbeiten',
            editPerDiemRates: 'Pauschalvergütungssätze bearbeiten',
            editDestinationSubtitle: (destination: string) => `Wenn Sie dieses Ziel aktualisieren, wird es für alle ${destination}-Tagespauschalen-Teilbeträge geändert.`,
            editCurrencySubtitle: (destination: string) => `Wenn Sie diese Währung aktualisieren, wird sie für alle ${destination}-Tagesgeld-Teilbeträge geändert.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie aus eigener Tasche bezahlte Ausgaben nach QuickBooks Desktop exportiert werden.',
            exportOutOfPocketExpensesCheckToggle: 'Schecks als „später drucken“ markieren',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach QuickBooks Desktop exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Karte-Transaktionen exportieren als',
            account: 'Konto',
            accountDescription: 'Wähle aus, wo Buchungssätze gebucht werden sollen.',
            accountsPayable: 'Verbindlichkeiten aus Lieferungen und Leistungen',
            accountsPayableDescription: 'Wählen Sie aus, wo Kreditorenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wähle aus, von wo Schecks versendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwende dieses Datum beim Exportieren von Berichten in QuickBooks Desktop.',
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
            exportCheckDescription: 'Wir erstellen für jeden Expensify-Bericht einen Einzelpostenscheck und senden ihn von dem unten stehenden Bankkonto.',
            exportJournalEntryDescription: 'Wir erstellen für jeden Expensify-Bericht einen detaillierten Buchungssatz und buchen ihn auf das untenstehende Konto.',
            exportVendorBillDescription:
                'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung und fügen sie dem untenstehenden Konto hinzu. Ist dieser Zeitraum geschlossen, buchen wir zum 1. des nächsten offenen Zeitraums.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop unterstützt keine Steuern bei Exporten von Buchungssätzen. Da in Ihrem Arbeitsbereich Steuern aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Buchungssätze sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wähle eine andere Exportoption.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Buchung',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Prüfen',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Wir erstellen für jeden Expensify-Bericht einen Einzelpostenscheck und senden ihn von dem unten stehenden Bankkonto.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Kreditkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Falls keine Lieferanten vorhanden sind, erstellen wir für die Verknüpfung einen Lieferanten „Credit Card Misc.“.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung mit dem Datum der letzten Ausgabe und fügen sie dem untenstehenden Konto hinzu. Ist dieser Zeitraum abgeschlossen, buchen wir auf den 1. Tag der nächsten offenen Periode.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]:
                    'Wähle aus, wohin die Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Wähle einen Lieferanten aus, der auf alle Kreditkartentransaktionen angewendet werden soll.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Wähle aus, von wo Schecks versendet werden sollen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wähle eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Buchungssätze sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wähle eine andere Exportoption.',
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Füge das Konto in QuickBooks Desktop hinzu und synchronisiere die Verbindung erneut',
            qbdSetup: 'QuickBooks Desktop-Einrichtung',
            requiredSetupDevice: {
                title: 'Von diesem Gerät aus keine Verbindung möglich',
                body1: 'Sie müssen diese Verbindung von dem Computer aus einrichten, auf dem Ihre QuickBooks Desktop-Unternehmensdatei gespeichert ist.',
                body2: 'Sobald du verbunden bist, kannst du von überall aus synchronisieren und exportieren.',
            },
            setupPage: {
                title: 'Diesen Link öffnen, um die Verbindung herzustellen',
                body: 'Um die Einrichtung abzuschließen, öffne den folgenden Link auf dem Computer, auf dem QuickBooks Desktop ausgeführt wird.',
                setupErrorTitle: 'Etwas ist schiefgelaufen',
                setupErrorBody: (conciergeLink: string) =>
                    `<muted-text><centered-text>Die Verbindung zu QuickBooks Desktop funktioniert im Moment nicht. Bitte versuche es später noch einmal oder <a href="${conciergeLink}">kontaktiere Concierge</a>, wenn das Problem weiterhin besteht.</centered-text></muted-text>`,
            },
            importDescription: 'Wählen Sie aus, welche Kontierungskonfigurationen aus QuickBooks Desktop nach Expensify importiert werden sollen.',
            classes: 'Kategorien',
            items: 'Posten',
            customers: 'Kunden/Projekte',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Einkäufe mit der Firmenkarte nach QuickBooks Desktop exportiert werden.',
            defaultVendorDescription: 'Legen Sie einen Standardanbieter fest, der beim Export auf alle Kreditkartentransaktionen angewendet wird.',
            accountsDescription: 'Ihr QuickBooks Desktop-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern bei der Erstellung ihrer Ausgaben zur Auswahl.',
            classesDescription: 'Wählen Sie, wie QuickBooks Desktop-Klassen in Expensify behandelt werden sollen.',
            tagsDisplayedAsDescription: 'Positionsebene',
            reportFieldsDisplayedAsDescription: 'Report-Ebene',
            customersDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Kunden/Projekte in Expensify behandelt werden sollen.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird automatisch jeden Tag mit QuickBooks Desktop synchronisiert.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription: 'Expensify erstellt in QuickBooks Desktop automatisch Kreditoren, wenn sie noch nicht vorhanden sind.',
            },
            itemsDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Positionen in Expensify verarbeitet werden sollen.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wähle aus, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach endgültiger Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagenausgaben werden beim Bezahlen exportiert',
                },
            },
        },
        qbo: {
            connectedTo: 'Verbunden mit',
            importDescription: 'Wähle aus, welche Buchungskonfigurationen aus QuickBooks Online nach Expensify importiert werden sollen.',
            classes: 'Kategorien',
            locations: 'Standorte',
            customers: 'Kunden/Projekte',
            accountsDescription: 'Ihr QuickBooks Online-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern bei der Erstellung ihrer Ausgaben zur Auswahl.',
            classesDescription: 'Wählen Sie, wie QuickBooks Online-Klassen in Expensify behandelt werden sollen.',
            customersDescription: 'Wählen Sie aus, wie QuickBooks Online-Kunden/Projekte in Expensify behandelt werden sollen.',
            locationsDescription: 'Wählen Sie aus, wie QuickBooks Online-Standorte in Expensify behandelt werden sollen.',
            taxesDescription: 'Wählen Sie aus, wie QuickBooks Online-Steuern in Expensify behandelt werden sollen.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online unterstützt bei Schecks oder Lieferantenrechnungen keine Standorte auf Positionsebene. Wenn du Standorte auf Positionsebene verwenden möchtest, stelle sicher, dass du Journaleinträge sowie Kreditkarten-/Debitkartenausgaben nutzt.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online unterstützt keine Steuern bei Buchungsbelegen. Bitte ändere deine Exportoption auf Lieferantenrechnung oder Scheck.',
            exportDescription: 'Konfiguriere, wie Expensify-Daten nach QuickBooks Online exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Karte-Transaktionen exportieren als',
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
                        label: 'Eingereichtes Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            receivable: 'Forderungen aus Lieferungen und Leistungen',
            archive: 'Archiv der Forderungen aus Lieferungen und Leistungen',
            exportInvoicesDescription: 'Verwenden Sie dieses Konto beim Exportieren von Rechnungen nach QuickBooks Online.',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Unternehmenskartenkäufe nach QuickBooks Online exportiert werden.',
            vendor: 'Lieferant',
            defaultVendorDescription: 'Legen Sie einen Standardanbieter fest, der beim Export auf alle Kreditkartentransaktionen angewendet wird.',
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie Auslagen in QuickBooks Online exportiert werden.',
            exportCheckDescription: 'Wir erstellen für jeden Expensify-Bericht einen Einzelpostenscheck und senden ihn von dem unten stehenden Bankkonto.',
            exportJournalEntryDescription: 'Wir erstellen für jeden Expensify-Bericht einen detaillierten Buchungssatz und buchen ihn auf das untenstehende Konto.',
            exportVendorBillDescription:
                'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung und fügen sie dem untenstehenden Konto hinzu. Ist dieser Zeitraum geschlossen, buchen wir zum 1. des nächsten offenen Zeitraums.',
            account: 'Konto',
            accountDescription: 'Wähle aus, wo Buchungssätze gebucht werden sollen.',
            accountsPayable: 'Verbindlichkeiten aus Lieferungen und Leistungen',
            accountsPayableDescription: 'Wählen Sie aus, wo Kreditorenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wähle aus, von wo Schecks versendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online unterstützt keine Standorte beim Export von Kreditorenrechnungen. Da in deinem Workspace Standorte aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online unterstützt keine Steuern beim Export von Journalbuchungen. Da in Ihrem Workspace Steuern aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Buchungssätze sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wähle eine andere Exportoption.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird sich jeden Tag automatisch mit QuickBooks Online synchronisieren.',
                inviteEmployees: 'Mitarbeitende einladen',
                inviteEmployeesDescription: 'QuickBooks Online-Mitarbeiterdatensätze importieren und Mitarbeitende zu diesem Arbeitsbereich einladen.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription:
                    'Expensify legt automatisch Lieferanten in QuickBooks Online an, wenn sie noch nicht existieren, und erstellt beim Export von Rechnungen automatisch Kunden.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden QuickBooks Online-Konto erstellt.',
                qboBillPaymentAccount: 'QuickBooks-Rechnungskonto',
                qboInvoiceCollectionAccount: 'QuickBooks-Konto für Rechnungseingänge',
                accountSelectDescription: 'Wählen Sie, von welchem Konto Sie Rechnungen bezahlen möchten, und wir erstellen die Zahlung in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wähle aus, wo Rechnungszahlungen eingehen sollen, und wir erstellen die Zahlung in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Debitkarte',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Buchung',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Prüfen',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Debitkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Falls keine Lieferanten vorhanden sind, erstellen wir zur Zuordnung einen Lieferanten „Debit Card Misc.“.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Kreditkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Falls keine Lieferanten vorhanden sind, erstellen wir für die Verknüpfung einen Lieferanten „Credit Card Misc.“.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung mit dem Datum der letzten Ausgabe und fügen sie dem untenstehenden Konto hinzu. Ist dieser Zeitraum abgeschlossen, buchen wir auf den 1. Tag der nächsten offenen Periode.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Wähle aus, wohin Debitkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wähle aus, wohin die Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Wähle einen Lieferanten aus, der auf alle Kreditkartentransaktionen angewendet werden soll.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wähle eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Buchungssätze sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wähle eine andere Exportoption.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Wähle ein gültiges Konto für den Export von Lieferantenrechnungen aus',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wähle ein gültiges Konto für den Export des Buchungssatzes',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Wähle ein gültiges Konto für den Scheckexport',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Um den Export von Kreditorenrechnungen zu verwenden, richte in QuickBooks Online ein Kreditorenkonto ein',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Um den Export von Buchungsjournalen zu verwenden, richte ein Journal-Konto in QuickBooks Online ein',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Um den Scheck-Export zu verwenden, richte ein Bankkonto in QuickBooks Online ein',
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Fügen Sie das Konto in QuickBooks Online hinzu und synchronisieren Sie die Verbindung erneut.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wähle aus, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach endgültiger Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagenausgaben werden beim Bezahlen exportiert',
                },
            },
            travelInvoicing: 'Reiseabrechnung',
            travelInvoicingVendor: 'Reiseanbieter',
            travelInvoicingPayableAccount: 'Verbindlichkeitenkonto Reisen',
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
            trackingCategoriesDescription: 'Wählen Sie aus, wie Xero-Trackingkategorien in Expensify behandelt werden sollen.',
            mapTrackingCategoryTo: (categoryName: string) => `Xero-Kategorie ${categoryName} zuordnen zu`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Wähle, wohin ${categoryName} beim Export nach Xero zugeordnet werden soll.`,
            customers: 'Kunden erneut abrechnen',
            customersDescription:
                'Wähle aus, ob Kund:innen in Expensify erneut abgerechnet werden sollen. Deine Xero-Kundenkontakte können Ausgaben zugeordnet werden und werden als Verkaufsrechnung nach Xero exportiert.',
            taxesDescription: 'Wählen Sie aus, wie Xero-Steuern in Expensify gehandhabt werden sollen.',
            notImported: 'Nicht importiert',
            notConfigured: 'Nicht konfiguriert',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Standardkontakt für Xero',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Berichtsfelder',
            },
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach Xero exportiert werden.',
            purchaseBill: 'Einkaufsrechnung',
            exportDeepDiveCompanyCard:
                'Exportierte Ausgaben werden als Banktransaktionen auf das unten angegebene Xero-Bankkonto gebucht, und die Buchungsdaten entsprechen den Daten auf Ihrem Kontoauszug.',
            bankTransactions: 'Banktransaktionen',
            xeroBankAccount: 'Xero-Bankkonto',
            xeroBankAccountDescription: 'Wählen Sie, wo Spesen als Banktransaktionen verbucht werden.',
            exportExpensesDescription: 'Berichte werden als Einkaufsrechnung mit dem unten ausgewählten Datum und Status exportiert.',
            purchaseBillDate: 'Rechnungsdatum des Einkaufs',
            exportInvoices: 'Rechnungen exportieren als',
            salesInvoice: 'Verkaufsrechnung',
            exportInvoicesDescription: 'Verkaufsrechnungen zeigen immer das Datum an, an dem die Rechnung versendet wurde.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird sich jeden Tag automatisch mit Xero synchronisieren.',
                purchaseBillStatusTitle: 'Status der Einkaufsrechnung',
                reimbursedReportsDescription: 'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden Xero-Konto erstellt.',
                xeroBillPaymentAccount: 'Xero-Rechnungszahlungskonto',
                xeroInvoiceCollectionAccount: 'Xero-Forderungskonto für Rechnungen',
                xeroBillPaymentAccountDescription: 'Wählen Sie, von wo aus Sie Rechnungen bezahlen möchten, und wir erstellen die Zahlung in Xero.',
                invoiceAccountSelectorDescription: 'Wählen Sie aus, wohin Rechnungzahlungen eingehen sollen, und wir erstellen die Zahlung in Xero.',
            },
            exportDate: {
                label: 'Rechnungsdatum des Einkaufs',
                description: 'Verwenden Sie dieses Datum beim Export von Berichten nach Xero.',
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
                label: 'Status der Einkaufsrechnung',
                description: 'Verwende diesen Status beim Exportieren von Einkaufsrechnungen nach Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Entwurf',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Ausstehende Genehmigung',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Ausstehende Zahlung',
                },
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Bitte fügen Sie das Konto in Xero hinzu und synchronisieren Sie die Verbindung erneut',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wähle aus, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach endgültiger Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagenausgaben werden beim Bezahlen exportiert',
                },
            },
        },
        sageIntacct: {
            preferredExporter: 'Bevorzugte*r Exporteur*in',
            taxSolution: 'Steuerlösung',
            notConfigured: 'Nicht konfiguriert',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwende dieses Datum beim Exportieren von Reports nach Sage Intacct.',
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
                description: 'Legen Sie fest, wie aus eigener Tasche bezahlte Ausgaben nach Sage Intacct exportiert werden.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Spesenabrechnungen',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Lieferantenrechnungen',
                },
            },
            nonReimbursableExpenses: {
                description: 'Legen Sie fest, wie Firmenkarteneinkäufe nach Sage Intacct exportiert werden.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Kreditkarten',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Lieferantenrechnungen',
                },
            },
            creditCardAccount: 'Kreditkartenkonto',
            defaultVendor: 'Standardanbieter',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Legen Sie einen Standardlieferanten fest, der auf ${isReimbursable ? '' : 'nicht-'}erstattungsfähige Ausgaben angewendet wird, für die in Sage Intacct kein übereinstimmender Lieferant vorhanden ist.`,
            exportDescription: 'Konfigurieren Sie, wie Expensify Daten nach Sage Intacct exportiert.',
            exportPreferredExporterNote:
                'Der bevorzugte Exporteur kann jede Workspace-Adminperson sein, muss jedoch auch Domain-Admin sein, wenn du in den Domaineinstellungen unterschiedliche Exportkonten für einzelne Firmenkarten festlegst.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht die bevorzugte exportierende Person die zu exportierenden Berichte in ihrem Konto.',
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: `Bitte fügen Sie das Konto in Sage Intacct hinzu und synchronisieren Sie die Verbindung erneut`,
            autoSync: 'Automatische Synchronisierung',
            autoSyncDescription: 'Expensify wird jeden Tag automatisch mit Sage Intacct synchronisiert.',
            inviteEmployees: 'Mitarbeitende einladen',
            inviteEmployeesDescription:
                'Importiere Sage Intacct-Mitarbeiterdatensätze und lade Mitarbeitende in diesen Workspace ein. Dein Genehmigungsworkflow ist standardmäßig auf Managergenehmigung eingestellt und kann auf der Seite „Mitglieder“ weiter konfiguriert werden.',
            syncReimbursedReports: 'Erstattete Berichte synchronisieren',
            syncReimbursedReportsDescription:
                'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden Sage-Intacct-Konto erstellt.',
            paymentAccount: 'Sage Intacct Zahlungskonto',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wähle aus, wann die Ausgaben exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach endgültiger Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagenausgaben werden beim Bezahlen exportiert',
                },
            },
        },
        netsuite: {
            subsidiary: 'Tochtergesellschaft',
            subsidiarySelectDescription: 'Wähle die Tochtergesellschaft in NetSuite aus, aus der du Daten importieren möchtest.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach NetSuite exportiert werden.',
            exportInvoices: 'Rechnungen exportieren nach',
            journalEntriesTaxPostingAccount: 'Steuerbuchungskonto für Buchungssätze',
            journalEntriesProvTaxPostingAccount: 'Buchungszeilen-Konto für Provinzsteuerbuchungen',
            foreignCurrencyAmount: 'Betrag in Fremdwährung exportieren',
            exportToNextOpenPeriod: 'In die nächste offene Periode exportieren',
            nonReimbursableJournalPostingAccount: 'Nicht erstattungsfähiges Konto für Buchungssätze',
            reimbursableJournalPostingAccount: 'Konto für die Verbuchung erstattungsfähiger Posten',
            journalPostingPreference: {
                label: 'Bevorzugte Verbuchung von Journalbuchungen',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Einzelner, aufgeschlüsselter Eintrag für jeden Bericht',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Einzelner Eintrag für jede Ausgabe',
                },
            },
            invoiceItem: {
                label: 'Rechnungsposition',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Erstelle eine für mich',
                        description: 'Wir erstellen beim Export eine „Expensify-Rechnungsposition“ für dich, falls noch keine vorhanden ist.',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Vorhandene auswählen',
                        description: 'Wir verknüpfen Rechnungen von Expensify mit dem unten ausgewählten Eintrag.',
                    },
                },
            },
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwende dieses Datum beim Exportieren von Berichten nach NetSuite.',
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
                        reimbursableDescription: 'Auslagen aus eigener Tasche werden als Spesenberichte nach NetSuite exportiert.',
                        nonReimbursableDescription: 'Firmenkartenausgaben werden als Spesenabrechnungen nach NetSuite exportiert.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Lieferantenrechnungen',
                        reimbursableDescription: dedent(`
                            Auslagen aus eigener Tasche werden als Rechnungen exportiert, die an den unten angegebenen NetSuite-Lieferanten zahlbar sind.

                            Wenn du für jede Karte einen bestimmten Lieferanten festlegen möchtest, gehe zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Ausgaben mit Firmenkarten werden als Rechnungen exportiert, die an den unten angegebenen NetSuite-Lieferanten zahlbar sind.

                            Wenn du für jede Karte einen eigenen Lieferanten festlegen möchtest, gehe zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Buchungssätze',
                        reimbursableDescription: dedent(`
                            Auslagen werden als Buchungssätze auf das unten angegebene NetSuite-Konto exportiert.

                            Wenn Sie für jede Karte einen bestimmten Lieferanten festlegen möchten, gehen Sie zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Firmenkartenausgaben werden als Buchungssätze in das unten angegebene NetSuite-Konto exportiert.

                            Wenn du für jede Karte einen bestimmten Lieferanten festlegen möchtest, gehe zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Wenn Sie die Export-Einstellung für Unternehmenskarten auf Spesenabrechnungen umstellen, werden NetSuite-Lieferanten und Buchungskonten für einzelne Karten deaktiviert.\n\nKeine Sorge, wir speichern Ihre bisherigen Auswahlen, falls Sie später wieder zurückwechseln möchten.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify wird automatisch jeden Tag mit NetSuite synchronisiert.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden NetSuite-Konto erstellt.',
                reimbursementsAccount: 'Konto für Erstattungen',
                reimbursementsAccountDescription: 'Wähle das Bankkonto, das du für Rückerstattungen verwenden möchtest, und wir erstellen die zugehörige Zahlung in NetSuite.',
                collectionsAccount: 'Inkassokonto',
                collectionsAccountDescription: 'Sobald eine Rechnung in Expensify als bezahlt markiert und nach NetSuite exportiert wurde, erscheint sie auf dem untenstehenden Konto.',
                approvalAccount: 'Kreditorenfreigabekonto',
                approvalAccountDescription:
                    'Wählen Sie das Konto aus, gegen das Transaktionen in NetSuite genehmigt werden. Wenn Sie erstattete Berichte synchronisieren, ist dies auch das Konto, gegen das Rechnungszahlungen erstellt werden.',
                defaultApprovalAccount: 'NetSuite-Standard',
                inviteEmployees: 'Mitarbeitende einladen und Freigaben festlegen',
                inviteEmployeesDescription:
                    'NetSuite-Mitarbeitendendaten importieren und Mitarbeitende zu diesem Arbeitsbereich einladen. Ihr Genehmigungs-Workflow wird standardmäßig auf Managergenehmigung eingestellt und kann auf der Seite *Mitglieder* weiter konfiguriert werden.',
                autoCreateEntities: 'Mitarbeitende/Lieferanten automatisch erstellen',
                enableCategories: 'Neu importierte Kategorien aktivieren',
                customFormID: 'Benutzerdefinierte Formular-ID',
                customFormIDDescription:
                    'Standardmäßig erstellt Expensify Buchungen mit dem in NetSuite festgelegten bevorzugten Transaktionsformular. Alternativ können Sie ein bestimmtes Transaktionsformular zur Verwendung festlegen.',
                customFormIDReimbursable: 'Auslage',
                customFormIDNonReimbursable: 'Firmenkartenausgabe',
                exportReportsTo: {
                    label: 'Genehmigungsstufe für Spesenabrechnungen',
                    description:
                        'Sobald ein Spesenbericht in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Verbuchung eine zusätzliche Genehmigungsstufe festlegen.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Standardvorgabe für NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Nur von Vorgesetzten genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Nur Buchhaltung genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Von Vorgesetzter und Buchhaltung genehmigt',
                    },
                },
                accountingMethods: {
                    label: 'Wann exportieren',
                    description: 'Wähle aus, wann die Ausgaben exportiert werden sollen:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagen aus eigener Tasche werden nach endgültiger Genehmigung exportiert',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagenausgaben werden beim Bezahlen exportiert',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Genehmigungsstufe für Lieferantenrechnungen',
                    description:
                        'Sobald eine Lieferantenrechnung in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Verbuchung eine weitere Genehmigungsstufe festlegen.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Standardvorgabe für NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zur Buchung freigegeben',
                    },
                },
                exportJournalsTo: {
                    label: 'Genehmigungsstufe für Buchungssätze',
                    description:
                        'Sobald eine Buchungszeile in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Verbuchung eine weitere Genehmigungsstufe festlegen.',
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
            noAccountsFoundDescription: 'Bitte fügen Sie das Konto in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noVendorsFound: 'Keine Anbieter gefunden',
            noVendorsFoundDescription: 'Bitte fügen Sie Lieferanten in NetSuite hinzu und synchronisieren Sie die Verbindung erneut',
            noItemsFound: 'Keine Rechnungspositionen gefunden',
            noItemsFoundDescription: 'Bitte fügen Sie Rechnungsposten in NetSuite hinzu und synchronisieren Sie die Verbindung erneut',
            noSubsidiariesFound: 'Keine Tochtergesellschaften gefunden',
            noSubsidiariesFoundDescription: 'Bitte füge in NetSuite eine Tochtergesellschaft hinzu und synchronisiere die Verbindung erneut',
            tokenInput: {
                title: 'NetSuite-Einrichtung',
                formSteps: {
                    installBundle: {
                        title: 'Expensify-Bundle installieren',
                        description: 'Wechsel in NetSuite zu *Customization > SuiteBundler > Search & Install Bundles*, suche nach „Expensify“ und installiere das Bundle.',
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
                            'Gehe in NetSuite zu *Setup > Users/Roles > Access Tokens* und erstelle ein Zugriffstoken für die App „Expensify“ und entweder die Rolle „Expensify Integration“ oder „Administrator“.\n\n*Wichtig:* Stelle sicher, dass du die *Token ID* und das *Token Secret* aus diesem Schritt speicherst. Du brauchst sie für den nächsten Schritt.',
                    },
                    enterCredentials: {
                        title: 'Gib deine NetSuite-Anmeldedaten ein',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite-Konto-ID',
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
                crossSubsidiaryCustomers: 'Konzernübergreifende Kunden/Projekte',
                importFields: {
                    departments: {
                        title: 'Abteilungen',
                        subtitle: 'Wählen Sie aus, wie die NetSuite-*Abteilungen* in Expensify behandelt werden sollen.',
                    },
                    classes: {
                        title: 'Kategorien',
                        subtitle: 'Wählen Sie aus, wie *Klassen* in Expensify behandelt werden sollen.',
                    },
                    locations: {
                        title: 'Standorte',
                        subtitle: 'Wählen Sie, wie *Standorte* in Expensify behandelt werden sollen.',
                    },
                },
                customersOrJobs: {
                    title: 'Kunden/Projekte',
                    subtitle: 'Wähle aus, wie NetSuite-*Kunden* und *Projekte* in Expensify behandelt werden sollen.',
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
                    requiredFieldError: (fieldName: string) => `Bitte gib ${fieldName} ein`,
                    customSegments: {
                        title: 'Benutzerdefinierte Segmente/Datensätze',
                        addText: 'Benutzerdefiniertes Segment/Datensatz hinzufügen',
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
                        removePrompt: 'Möchten Sie dieses benutzerdefinierte Segment/den benutzerdefinierten Datensatz wirklich entfernen?',
                        addForm: {
                            customSegmentName: 'Benutzerdefinierter Segmentname',
                            customRecordName: 'benutzerdefinierter Datensatzname',
                            segmentTitle: 'Benutzerdefiniertes Segment',
                            customSegmentAddTitle: 'Benutzerdefinierten Abschnitt hinzufügen',
                            customRecordAddTitle: 'Benutzerdefinierten Eintrag hinzufügen',
                            recordTitle: 'Benutzerdefinierter Datensatz',
                            segmentRecordType: 'Möchtest du ein benutzerdefiniertes Segment oder einen benutzerdefinierten Datensatz hinzufügen?',
                            customSegmentNameTitle: 'Wie heißt das benutzerdefinierte Segment?',
                            customRecordNameTitle: 'Wie lautet der Name des benutzerdefinierten Datensatzes?',
                            customSegmentNameFooter: `Benutzerdefinierte Segmentnamen finden Sie in NetSuite auf der Seite *Customizations > Links, Records & Fields > Custom Segments*.

_Für ausführlichere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})._`,
                            customRecordNameFooter: `Sie finden benutzerdefinierte Datensatznamen in NetSuite, indem Sie „Transaction Column Field“ in die globale Suche eingeben.

_Für ausführlichere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})._`,
                            customSegmentInternalIDTitle: 'Wie lautet die interne ID?',
                            customSegmentInternalIDFooter: `Stelle zunächst sicher, dass du die internen IDs in NetSuite unter *Home > Set Preferences > Show Internal ID* aktiviert hast.

Du findest die internen IDs benutzerdefinierter Segmente in NetSuite unter:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klicke auf ein benutzerdefiniertes Segment.
3. Klicke auf den Hyperlink neben *Custom Record Type*.
4. Suche die interne ID in der Tabelle unten.

_Für detailliertere Anweisungen [besuche unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Sie finden die internen IDs benutzerdefinierter Datensätze in NetSuite, indem Sie wie folgt vorgehen:

1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.
2. Klicken Sie auf einen benutzerdefinierten Datensatz.
3. Suchen Sie die interne ID auf der linken Seite.

_Für ausführlichere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Wie lautet die Skript-ID?',
                            customSegmentScriptIDFooter: `Sie finden die Skript-IDs benutzerdefinierter Segmente in NetSuite unter:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klicken Sie auf ein benutzerdefiniertes Segment.
3. Klicken Sie unten auf die Registerkarte *Application and Sourcing* und dann:
    a. Wenn Sie das benutzerdefinierte Segment in Expensify als *Tag* (auf Positionsebene) anzeigen möchten, klicken Sie auf die Unterregisterkarte *Transaction Columns* und verwenden Sie die *Field ID*.
    b. Wenn Sie das benutzerdefinierte Segment in Expensify als *Berichts­feld* (auf Berichtsebene) anzeigen möchten, klicken Sie auf die Unterregisterkarte *Transactions* und verwenden Sie die *Field ID*.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Wie lautet die Transaktionsspalten-ID?',
                            customRecordScriptIDFooter: `Benutzerdefinierte Datensatz-Skript-IDs finden Sie in NetSuite unter:

1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.
2. Öffnen Sie einen benutzerdefinierten Datensatz.
3. Suchen Sie die Skript-ID auf der linken Seite.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})._`,
                            customSegmentMappingTitle: 'Wie soll dieses benutzerdefinierte Segment in Expensify angezeigt werden?',
                            customRecordMappingTitle: 'Wie soll dieser benutzerdefinierte Datensatz in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueFieldError: (fieldName: string) => `Ein benutzerdefiniertes Segment/Datensatz mit dieser ${fieldName?.toLowerCase()} existiert bereits`,
                        },
                    },
                    customLists: {
                        title: 'Benutzerdefinierte Listen',
                        addText: 'Benutzerdefinierte Liste hinzufügen',
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
                            listNameTitle: 'Benutzerdefinierte Liste auswählen',
                            transactionFieldIDTitle: 'Wie lautet die Transaktionsfeld-ID?',
                            transactionFieldIDFooter: `Sie finden Transaktionsfeld-IDs in NetSuite, indem Sie diese Schritte ausführen:

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
                        label: 'Standardmäßige NetSuite-Mitarbeiterperson',
                        description: 'Nicht in Expensify importiert, beim Export angewendet',
                        footerContent: (importField: string) =>
                            `Wenn Sie ${importField} in NetSuite verwenden, wenden wir beim Export in den Spesenbericht oder die Journalbuchung den auf dem Mitarbeitendendatensatz festgelegten Standardwert an.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'Positionsebene',
                        footerContent: (importField: string) => `${startCase(importField)} wird für jede einzelne Ausgabe in einem Mitarbeitendenbericht auswählbar sein.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Berichtsfelder',
                        description: 'Report-Ebene',
                        footerContent: (importField: string) => `${startCase(importField)}-Auswahl wird auf alle Ausgaben im Bericht der Mitarbeitenden angewendet.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct-Einrichtung',
            prerequisitesTitle: 'Bevor du verbindest …',
            downloadExpensifyPackage: 'Lade das Expensify-Paket für Sage Intacct herunter',
            followSteps: 'Folge den Schritten in unserer Anleitung „How-to: Connect to Sage Intacct“',
            enterCredentials: 'Gib deine Sage Intacct-Anmeldedaten ein',
            entity: 'Rechtsträger',
            employeeDefault: 'Standardwert für Sage Intacct-Mitarbeiter',
            employeeDefaultDescription: 'Die Standardabteilung der*des Mitarbeitenden wird auf ihre Ausgaben in Sage Intacct angewendet, sofern eine vorhanden ist.',
            displayedAsTagDescription: 'Die Abteilung kann für jede einzelne Ausgabe im Bericht eines Mitarbeitenden ausgewählt werden.',
            displayedAsReportFieldDescription: 'Die Abteilungsauswahl wird auf alle Ausgaben im Bericht einer*s Mitarbeitenden angewendet.',
            toggleImportTitle: (mappingTitle: string) => `Wähle aus, wie Sage Intacct-<strong>${mappingTitle}</strong> in Expensify behandelt werden soll.`,
            expenseTypes: 'Ausgabenarten',
            expenseTypesDescription: 'Ihre Sage Intacct-Spesenarten werden in Expensify als Kategorien importiert.',
            accountTypesDescription: 'Ihr Sage Intacct-Kontenplan wird in Expensify als Kategorien importiert.',
            importTaxDescription: 'Steuersatz für Einkäufe aus Sage Intacct importieren.',
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
            collect: 'Einziehen',
        },
        companyCards: {
            addCards: 'Karten hinzufügen',
            selectCards: 'Karten auswählen',
            fromOtherWorkspaces: 'Aus anderen Workspaces',
            addWorkEmail: 'Fügen Sie Ihre Arbeits-E-Mail hinzu',
            addWorkEmailDescription: 'Bitte fügen Sie Ihre Arbeits-E-Mail hinzu, um vorhandene Feeds aus anderen Workspaces zu nutzen.',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'Kartendaten konnten nicht geladen werden',
                workspaceFeedsCouldNotBeLoadedMessage:
                    'Beim Laden der Workspace-Kartenfeeds ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder wenden Sie sich an Ihre Administra­tion.',
                feedCouldNotBeLoadedTitle: 'Dieser Feed konnte nicht geladen werden',
                feedCouldNotBeLoadedMessage:
                    'Beim Laden dieses Feeds ist ein Fehler aufgetreten. Bitte versuche es erneut oder wende dich an deine Administratorin bzw. deinen Administrator.',
                tryAgain: 'Erneut versuchen',
            },
            addNewCard: {
                other: 'Sonstiges',
                fileImport: 'Transaktionen aus Datei importieren',
                createFileFeedHelpText: `<muted-text>Bitte folge dieser <a href="${CONST.COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL}">Hilfsanleitung</a>, um die Ausgaben deiner Firmenkarte zu importieren!</muted-text>`,
                companyCardLayoutName: 'Name des Firmenkarten-Layouts',
                cardLayoutNameRequired: 'Der Name des Firmenkarten-Layouts ist erforderlich',
                useAdvancedFields: 'Erweiterte Felder verwenden (nicht empfohlen)',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard Firmenkarten',
                    vcf: 'Visa Firmenkarten',
                    stripe: 'Stripe-Karten',
                },
                yourCardProvider: `Wer ist dein Kartenanbieter?`,
                whoIsYourBankAccount: 'Bei welcher Bank bist du?',
                whereIsYourBankLocated: 'Wo befindet sich Ihre Bank?',
                howDoYouWantToConnect: 'Wie möchten Sie Ihre Bankverbindung herstellen?',
                learnMoreAboutOptions: `<muted-text>Erfahre mehr über diese <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">Optionen</a>.</muted-text>`,
                commercialFeedDetails:
                    'Erfordert eine Einrichtung mit Ihrer Bank. Dies wird in der Regel von größeren Unternehmen genutzt und ist oft die beste Option, wenn Sie die Voraussetzungen erfüllen.',
                commercialFeedPlaidDetails: `Erfordert die Einrichtung mit Ihrer Bank, aber wir führen Sie durch den Prozess. Dies ist in der Regel auf größere Unternehmen beschränkt.`,
                directFeedDetails: 'Der einfachste Ansatz. Verbinde dich direkt mit deinen Hauptzugangsdaten. Diese Methode ist am gebräuchlichsten.',
                enableFeed: {
                    title: (provider: string) => `Aktiviere deinen ${provider}-Feed`,
                    heading:
                        'Wir verfügen über eine direkte Integration mit Ihrem Kartenanbieter und können Ihre Transaktionsdaten schnell und präzise in Expensify importieren.\n\nUm zu beginnen, gehen Sie einfach wie folgt vor:',
                    visa: 'Wir verfügen über globale Integrationen mit Visa, allerdings variiert die Berechtigung je nach Bank und Kartenprogramm.\n\nUm loszulegen, gehen Sie einfach wie folgt vor:',
                    mastercard:
                        'Wir verfügen über globale Integrationen mit Mastercard, allerdings variiert die Berechtigung je nach Bank und Kartenprogramm.\n\nUm loszulegen, müssen Sie nur Folgendes tun:',
                    vcf: `1. Lies dir [diesen Hilfeartikel](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) durch, um detaillierte Anweisungen zum Einrichten deiner Visa Commercial Cards zu erhalten.

2. [Kontaktiere deine Bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), um zu bestätigen, dass sie einen Commercial Feed für dein Programm unterstützt, und bitte sie, diesen zu aktivieren.

3. *Sobald der Feed aktiviert ist und du die Details dazu hast, fahre mit dem nächsten Bildschirm fort.*`,
                    gl1025: `1. Lies dir [diesen Hilfeartikel](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) durch, um herauszufinden, ob American Express für dein Programm einen Commercial-Feed aktivieren kann.

2. Sobald der Feed aktiviert ist, sendet dir Amex einen Produktionsbrief.

3. *Sobald du die Feed-Informationen hast, fahre mit dem nächsten Bildschirm fort.*`,
                    cdf: `1. Lies dir [diesen Hilfeartikel](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) für eine ausführliche Anleitung zur Einrichtung deiner Mastercard Commercial Cards durch.

2. [Kontaktiere deine Bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), um zu bestätigen, dass sie einen Commercial-Feed für dein Programm unterstützt, und bitte sie, diesen zu aktivieren.

3. *Sobald der Feed aktiviert ist und du seine Details hast, fahre mit dem nächsten Bildschirm fort.*`,
                    stripe: `1. Rufen Sie das Stripe-Dashboard auf und gehen Sie zu [Einstellungen](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Klicken Sie unter „Product Integrations“ auf „Enable“ neben Expensify.

3. Sobald der Feed aktiviert ist, klicken Sie unten auf „Senden“ und wir kümmern uns um die Einrichtung.`,
                },
                whatBankIssuesCard: 'Welche Bank gibt diese Karten aus?',
                enterNameOfBank: 'Name der Bank eingeben',
                feedDetails: {
                    vcf: {
                        title: 'Wie lauten die Visa-Feed-Details?',
                        processorLabel: 'Prozessor-ID',
                        bankLabel: 'Finanzinstitut-(Bank-)ID',
                        companyLabel: 'Unternehmens-ID',
                        helpLabel: 'Wo finde ich diese IDs?',
                    },
                    gl1025: {
                        title: `Wie lautet der Amex-Übertragungsdateiname?`,
                        fileNameLabel: 'Name der Lieferdatei',
                        helpLabel: 'Wo finde ich den Namen der Lieferdatei?',
                    },
                    cdf: {
                        title: `Wie lautet die Mastercard-Vertriebs-ID?`,
                        distributionLabel: 'Distributions-ID',
                        helpLabel: 'Wo finde ich die Verteilungs-ID?',
                    },
                },
                amexCorporate: 'Wähle dies aus, wenn auf der Vorderseite deiner Karten „Corporate“ steht',
                amexBusiness: 'Wähle dies aus, wenn auf der Vorderseite deiner Karten „Business“ steht',
                amexPersonal: 'Wähle dies aus, wenn deine Karten privat sind',
                error: {
                    pleaseSelectProvider: 'Bitte wählen Sie einen Kartenanbieter aus, bevor Sie fortfahren',
                    pleaseSelectBankAccount: 'Bitte wähle ein Bankkonto aus, bevor du fortfährst',
                    pleaseSelectBank: 'Bitte wähle ein Bankkonto aus, bevor du fortfährst',
                    pleaseSelectCountry: 'Bitte wähle ein Land aus, bevor du fortfährst',
                    pleaseSelectFeedType: 'Bitte wähle einen Feed-Typ aus, bevor du fortfährst',
                },
                exitModal: {
                    title: 'Funktioniert etwas nicht?',
                    prompt: 'Wir haben bemerkt, dass du das Hinzufügen deiner Karten nicht abgeschlossen hast. Wenn du auf ein Problem gestoßen bist, gib uns bitte Bescheid, damit wir dir helfen können, alles wieder auf Kurs zu bringen.',
                    confirmText: 'Problem melden',
                    cancelText: 'Überspringen',
                },
                csvColumns: {
                    cardNumber: 'Kartennummer',
                    postedDate: 'Datum',
                    merchant: 'Händler',
                    amount: 'Betrag',
                    currency: 'Währung',
                    ignore: 'Ignorieren',
                    originalTransactionDate: 'Ursprüngliches Transaktionsdatum',
                    originalAmount: 'Ursprünglicher Betrag',
                    originalCurrency: 'Ursprüngliche Währung',
                    comment: 'Kommentar',
                    category: 'Kategorie',
                    tag: 'Tag',
                },
                csvErrors: {
                    requiredColumns: (missingColumns: string) => `Bitte weisen Sie jeder der folgenden Eigenschaften eine Spalte zu: ${missingColumns}.`,
                    duplicateColumns: (duplicateColumn: string) =>
                        `Ups! Du hast ein einzelnes Feld („${duplicateColumn}“) mehreren Spalten zugeordnet. Bitte überprüfe die Zuordnung und versuche es erneut.`,
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
            directFeed: 'Direktfeed',
            whoNeedsCardAssigned: 'Wer braucht eine zugewiesene Karte?',
            chooseTheCardholder: 'Wähle den Karteninhaber',
            chooseCard: 'Wähle eine Karte',
            chooseCardFor: (assignee: string) => `Wähle eine Karte für <strong>${assignee}</strong>. Du findest die gesuchte Karte nicht? <concierge-link>Gib uns Bescheid.</concierge-link>`,
            noActiveCards: 'Keine aktiven Karten in diesem Feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Oder es ist etwas kaputt. Wie auch immer, wenn du Fragen hast, <concierge-link>wende dich einfach an Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Wähle ein Startdatum für Transaktionen',
            startDateDescription: 'Wähle dein Import-Startdatum. Wir synchronisieren alle Transaktionen ab diesem Datum.',
            editStartDateDescription:
                'Wähle ein neues Startdatum für Transaktionen. Wir synchronisieren alle Transaktionen ab diesem Datum, mit Ausnahme derer, die wir bereits importiert haben.',
            fromTheBeginning: 'Von Anfang an',
            customStartDate: 'Benutzerdefiniertes Startdatum',
            customCloseDate: 'Benutzerdefiniertes Abschlussdatum',
            letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
            confirmationDescription: 'Wir beginnen sofort mit dem Import der Transaktionen.',
            card: 'Karte',
            cardName: 'Kartenname',
            brokenConnectionError:
                '<rbr>Die Verbindung zum Kartenfeed ist unterbrochen. Bitte <a href="#">melde dich bei deiner Bank an</a>, damit wir die Verbindung erneut herstellen können.</rbr>',
            assignedCard: (assignee: string, link: string) => `${assignee} wurde ${link} zugewiesen! Importierte Transaktionen werden in diesem Chat angezeigt.`,
            companyCard: 'Firmenkarte',
            chooseCardFeed: 'Kartenfeed auswählen',
            ukRegulation:
                'Expensify Limited ist ein Vertreter von Plaid Financial Ltd., einem zugelassenen Zahlungsinstitut, das nach den Payment Services Regulations 2017 von der Financial Conduct Authority beaufsichtigt wird (Firm Reference Number: 804718). Plaid stellt Ihnen regulierte Kontoinformationsdienste über Expensify Limited als seinen Vertreter zur Verfügung.',
            deletedFeed: 'Gelöschter Feed',
            assignCardFailedError: 'Kartenzuweisung fehlgeschlagen.',
            unassignCardFailedError: 'Kartenaufhebung fehlgeschlagen.',
            cardAlreadyAssignedError: 'Diese Karte ist bereits einem Nutzenden in einem anderen Workspace zugeordnet.',
            importTransactions: {
                title: 'Transaktionen aus Datei importieren',
                description: 'Bitte passe die Einstellungen für deine Datei an, die beim Import angewendet werden.',
                cardDisplayName: 'Anzeigename der Karte',
                currency: 'Währung',
                transactionsAreReimbursable: 'Transaktionen sind erstattungsfähig',
                flipAmountSign: 'Betragsvorzeichen umkehren',
                importButton: 'Transaktionen importieren',
            },
            deletedCard: 'Gelöschte Karte',
            assignNewCards: {title: 'Neue Karten zuweisen', description: 'Holen Sie die neuesten Karten zum Zuweisen von Ihrer Bank'},
        },
        expensifyCard: {
            issueAndManageCards: 'Geben Sie Expensify Karten aus und verwalten Sie sie',
            getStartedIssuing: 'Beginne, indem du deine erste virtuelle oder physische Karte ausstellst.',
            verificationInProgress: 'Verifizierung läuft ...',
            verifyingTheDetails: 'Wir überprüfen ein paar Details. Concierge informiert Sie, sobald Expensify Karten ausgegeben werden können.',
            disclaimer:
                'Die Expensify Visa® Commercial Card wird von der The Bancorp Bank, N.A., Mitglied der FDIC, gemäß einer Lizenz von Visa U.S.A. Inc. herausgegeben und kann nicht bei allen Händlern verwendet werden, die Visa-Karten akzeptieren. Apple® und das Apple-Logo® sind Marken von Apple Inc., eingetragen in den USA und anderen Ländern. App Store ist eine Dienstleistungsmarke von Apple Inc. Google Play und das Google-Play-Logo sind Marken von Google LLC.',
            euUkDisclaimer:
                'Von Transact Payments Malta Limited ausgestellte Karten werden an Einwohner des EWR ausgegeben und von Transact Payments Limited ausgestellte Karten an Einwohner des Vereinigten Königreichs, jeweils gemäß einer Lizenz von Visa Europe Limited. Transact Payments Malta Limited ist ordnungsgemäß von der Malta Financial Services Authority als Finanzinstitut nach dem Financial Institution Act 1994 zugelassen und beaufsichtigt. Registrierungsnummer C 91879. Transact Payments Limited ist von der Gibraltar Financial Service Commission zugelassen und beaufsichtigt.',
            issueCard: 'Karte ausstellen',
            findCard: 'Karte finden',
            newCard: 'Neue Karte',
            name: 'Name',
            lastFour: 'Letzte 4',
            limit: 'Limit',
            currentBalance: 'Aktueller Kontostand',
            currentBalanceDescription: 'Der aktuelle Saldo ist die Summe aller verbuchten Expensify Karte-Transaktionen, die seit dem letzten Abrechnungsdatum erfolgt sind.',
            balanceWillBeSettledOn: (settlementDate: string) => `Der Saldo wird am ${settlementDate} ausgeglichen.`,
            settleBalance: 'Saldo ausgleichen',
            cardLimit: 'Kartenlimit',
            remainingLimit: 'Verbleibendes Limit',
            requestLimitIncrease: 'Anhebung des Anfragelimits',
            remainingLimitDescription:
                'Wir berücksichtigen mehrere Faktoren, wenn wir Ihr verbleibendes Limit berechnen: Ihre Dauer als Kund*in, die geschäftsbezogenen Angaben, die Sie bei der Registrierung gemacht haben, sowie das verfügbare Guthaben auf Ihrem Geschäftskonto. Ihr verbleibendes Limit kann täglich schwanken.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Der Cashback-Saldo basiert auf den abgerechneten monatlichen Ausgaben mit der Expensify Karte in Ihrem Arbeitsbereich.',
            issueNewCard: 'Neue Karte ausstellen',
            finishSetup: 'Einrichtung abschließen',
            chooseBankAccount: 'Bankkonto auswählen',
            chooseExistingBank: 'Wählen Sie ein bestehendes Geschäftskonto aus, um den Saldo Ihrer Expensify Karte zu bezahlen, oder fügen Sie ein neues Bankkonto hinzu',
            accountEndingIn: 'Konto mit Endziffern',
            addNewBankAccount: 'Neues Bankkonto hinzufügen',
            settlementAccount: 'Verrechnungskonto',
            settlementAccountDescription: 'Wählen Sie ein Konto aus, um den Saldo Ihrer Expensify Karte zu begleichen.',
            settlementAccountInfo: (reconciliationAccountSettingsLink: string, accountNumber: string) =>
                `Stelle sicher, dass dieses Konto mit deinem <a href="${reconciliationAccountSettingsLink}">Abstimmungskonto</a> (${accountNumber}) übereinstimmt, damit die kontinuierliche Abstimmung ordnungsgemäß funktioniert.`,
            settlementFrequency: 'Auszahlungsfrequenz',
            settlementFrequencyDescription: 'Wählen Sie, wie oft Sie den Saldo Ihrer Expensify Karte begleichen.',
            settlementFrequencyInfo:
                'Wenn du zur monatlichen Abrechnung wechseln möchtest, musst du dein Bankkonto über Plaid verbinden und eine positive Kontohistorie der letzten 90 Tage haben.',
            frequency: {
                daily: 'Täglich',
                monthly: 'Monatlich',
            },
            cardDetails: 'Kartendaten',
            cardPending: ({name}: {name: string}) => `Die Karte ist derzeit ausstehend und wird ausgestellt, sobald das Konto von ${name} verifiziert wurde.`,
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
                `Wenn Sie den Limittyp dieser Karte auf Smart Limit ändern, werden neue Transaktionen abgelehnt, da das nicht genehmigte Limit von ${limit} bereits erreicht wurde.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Wenn Sie den Limittyp dieser Karte auf Monatlich ändern, werden neue Transaktionen abgelehnt, da das monatliche Limit von ${limit} bereits erreicht wurde.`,
            addShippingDetails: 'Versanddetails hinzufügen',
            issuedCard: (assignee: string) => `hat ${assignee} eine Expensify Karte ausgestellt! Die Karte wird in 2–3 Werktagen ankommen.`,
            issuedCardNoShippingDetails: (assignee: string) => `hat ${assignee} eine Expensify Karte ausgestellt! Die Karte wird versendet, sobald die Versanddaten bestätigt sind.`,
            issuedCardVirtual: (assignee: string, link: string) => `hat ${assignee} eine virtuelle Expensify Karte ausgestellt! Die ${link} kann sofort verwendet werden.`,
            addedShippingDetails: (assignee: string) => `${assignee} hat Versanddetails hinzugefügt. Die Expensify Karte wird in 2–3 Werktagen ankommen.`,
            replacedCard: (assignee: string) => `${assignee} hat ihre Expensify Karte ersetzt. Die neue Karte wird in 2–3 Werktagen ankommen.`,
            replacedVirtualCard: (assignee: string, link: string) => `${assignee} hat ihre virtuelle Expensify Karte ersetzt! Der ${link} kann sofort verwendet werden.`,
            card: 'Karte',
            replacementCard: 'Ersatzkarte',
            verifyingHeader: 'Wird überprüft',
            bankAccountVerifiedHeader: 'Bankkonto verifiziert',
            verifyingBankAccount: 'Bankkonto wird verifiziert ...',
            verifyingBankAccountDescription: 'Bitte warten Sie, während wir bestätigen, dass dieses Konto zur Ausgabe von Expensify Karten verwendet werden kann.',
            bankAccountVerified: 'Bankkonto verifiziert!',
            bankAccountVerifiedDescription: 'Sie können Ihren Workspace-Mitgliedern jetzt Expensify Karten ausstellen.',
            oneMoreStep: 'Noch ein Schritt …',
            oneMoreStepDescription: 'Es sieht so aus, als müssten wir Ihr Bankkonto manuell verifizieren. Bitte gehen Sie zu Concierge, wo bereits Anweisungen auf Sie warten.',
            gotIt: 'Verstanden',
            goToConcierge: 'Zu Concierge gehen',
        },
        categories: {
            deleteCategories: 'Kategorien löschen',
            deleteCategoriesPrompt: 'Sind Sie sicher, dass Sie diese Kategorien löschen möchten?',
            deleteCategory: 'Kategorie löschen',
            deleteCategoryPrompt: 'Möchten Sie diese Kategorie wirklich löschen?',
            disableCategories: 'Kategorien deaktivieren',
            disableCategory: 'Kategorie deaktivieren',
            enableCategories: 'Kategorien aktivieren',
            enableCategory: 'Kategorie aktivieren',
            defaultSpendCategories: 'Standard-Ausgabenkategorien',
            spendCategoriesDescription: 'Legen Sie fest, wie Händlera usgaben für Kreditkartentransaktionen und gescannte Belege kategorisiert werden.',
            deleteFailureMessage: 'Beim Löschen der Kategorie ist ein Fehler aufgetreten, bitte versuche es erneut.',
            categoryName: 'Kategoriename',
            requiresCategory: 'Mitglieder müssen alle Ausgaben kategorisieren',
            needCategoryForExportToIntegration: (connectionName: string) => `Alle Ausgaben müssen kategorisiert werden, um nach ${connectionName} exportiert zu werden.`,
            subtitle: 'Verschaffe dir einen besseren Überblick darüber, wofür Geld ausgegeben wird. Verwende unsere Standardkategorien oder füge eigene hinzu.',
            emptyCategories: {
                title: 'Sie haben noch keine Kategorien erstellt',
                subtitle: 'Füge eine Kategorie hinzu, um deine Ausgaben zu organisieren.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Ihre Kategorien werden derzeit über eine Buchhaltungsverbindung importiert. Gehen Sie zu <a href="${accountingPageURL}">Buchhaltung</a>, um Änderungen vorzunehmen.</centered-text></muted-text>`,
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
            importedFromAccountingSoftware: 'Die folgenden Kategorien werden importiert aus Ihrem',
            payrollCode: 'Lohnabrechnungscode',
            updatePayrollCodeFailureMessage: 'Beim Aktualisieren des Lohnabrechnungscodes ist ein Fehler aufgetreten, bitte versuche es erneut.',
            glCode: 'Hauptbuchcode',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des Hauptbuchcodes ist ein Fehler aufgetreten, bitte versuche es erneut.',
            importCategories: 'Kategorien importieren',
            cannotDeleteOrDisableAllCategories: {
                title: 'Es können nicht alle Kategorien gelöscht oder deaktiviert werden',
                description: `Mindestens eine Kategorie muss aktiviert bleiben, da dein Workspace Kategorien erfordert.`,
            },
        },
        moreFeatures: {
            subtitle: 'Verwende die Schalter unten, um beim Wachsen weitere Funktionen zu aktivieren. Jede Funktion wird im Navigationsmenü angezeigt, wo du sie weiter anpassen kannst.',
            spendSection: {
                title: 'Ausgaben',
                subtitle: 'Aktiviere Funktionen, die dir helfen, dein Team zu skalieren.',
            },
            manageSection: {
                title: 'Verwalten',
                subtitle: 'Füge Steuerelemente hinzu, die helfen, Ausgaben im Budget zu halten.',
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
                title: 'Kilometersätze',
                subtitle: 'Sätze Tarife fest, aktualisiere sie und setze sie durch.',
            },
            perDiem: {
                title: 'Tagegeld',
                subtitle: 'Legen Sie Pauschalspesen fest, um die täglichen Ausgaben der Mitarbeitenden zu steuern.',
            },
            travel: {
                title: 'Reisen',
                subtitle: 'Buchen, verwalten und abstimmen Sie all Ihre Geschäftsreisen.',
                getStarted: {
                    title: 'Los geht’s mit Expensify Travel',
                    subtitle: 'Wir brauchen nur noch ein paar weitere Informationen zu deinem Unternehmen, dann bist du startklar.',
                    ctaText: "Los geht's",
                },
                reviewingRequest: {
                    title: 'Pack deine Koffer, wir kümmern uns um deine Anfrage …',
                    subtitle: 'Wir prüfen derzeit deine Anfrage zur Aktivierung von Expensify Travel. Keine Sorge, wir sagen dir Bescheid, sobald alles bereit ist.',
                    ctaText: 'Anfrage gesendet',
                },
                bookOrManageYourTrip: {title: 'Reisebuchung', subtitle: 'Glückwunsch! Du kannst in diesem Arbeitsbereich jetzt Reisen buchen und verwalten.', ctaText: 'Reisen verwalten'},
                settings: {
                    autoAddTripName: {title: 'Reisenamen zu Ausgaben hinzufügen', subtitle: 'Reisenamen für in Expensify gebuchte Reisen automatisch zu Spesenbeschreibungen hinzufügen.'},
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: 'Reisebuchung',
                        subtitle: 'Glückwunsch! Du kannst jetzt in diesem Workspace Reisen buchen und verwalten.',
                        manageTravelLabel: 'Reisen verwalten',
                    },
                    centralInvoicingSection: {
                        title: 'Zentrale Rechnungsstellung',
                        subtitle: 'Zentralisiere alle Reisekosten in einer monatlichen Rechnung, statt sie direkt beim Kauf zu bezahlen.',
                        learnHow: 'Mehr erfahren.',
                        subsections: {
                            currentTravelSpendLabel: 'Aktuelle Reisekosten',
                            currentTravelSpendPaymentQueued: (amount: string) => `Die Zahlung über ${amount} ist in der Warteschlange und wird in Kürze bearbeitet.`,
                            currentTravelSpendCta: 'Saldo bezahlen',
                            currentTravelLimitLabel: 'Aktuelles Reisekontingent',
                            settlementAccountLabel: 'Verrechnungskonto',
                            settlementFrequencyLabel: 'Auszahlungsfrequenz',
                            settlementFrequencyDescription: 'Wie oft Expensify Ihr Geschäftskonto belastet, um aktuelle Expensify Travel-Transaktionen zu begleichen.',
                        },
                    },
                    disableModal: {
                        title: 'Reiseabrechnung deaktivieren?',
                        body: 'Bevorstehende Hotel- und Mietwagenreservierungen müssen möglicherweise mit einer anderen Zahlungsmethode erneut gebucht werden, um eine Stornierung zu vermeiden.',
                        confirm: 'Ausschalten',
                    },
                    outstandingBalanceModal: {
                        title: 'Reiseabrechnung kann nicht deaktiviert werden',
                        body: 'Sie haben noch einen offenen Reisensaldo. Bitte begleichen Sie zuerst Ihren Saldo.',
                        confirm: 'Verstanden',
                    },
                    payBalanceModal: {
                        title: (amount: string) => `Saldo von ${amount} bezahlen?`,
                        body: 'Die Zahlung wird in die Warteschlange gestellt und kurz darauf verarbeitet. Diese Aktion kann nach dem Start nicht mehr rückgängig gemacht werden.',
                    },
                    exportToPDF: 'Als PDF exportieren',
                    exportToCSV: 'Als CSV exportieren',
                    selectDateRangeError: 'Bitte wählen Sie einen Datumsbereich für den Export aus',
                    invalidDateRangeError: 'Das Startdatum muss vor dem Enddatum liegen',
                    enabled: 'Zentrale Rechnungsstellung aktiviert!',
                    enabledDescription: 'Alle Reisekosten in diesem Workspace werden nun in einer monatlichen Rechnung zentralisiert.',
                },
                personalDetailsDescription: 'Um eine Reise zu buchen, gib bitte deinen amtlichen Namen genau so ein, wie er auf deinem amtlichen Ausweis steht.',
            },
            expensifyCard: {
                title: 'Expensify Karte',
                subtitle: 'Gewinne Einblicke und Kontrolle über Ausgaben.',
                disableCardTitle: 'Expensify Karte deaktivieren',
                disableCardPrompt: 'Sie können die Expensify Karte nicht deaktivieren, weil sie bereits verwendet wird. Wenden Sie sich an Concierge, um die nächsten Schritte zu erfahren.',
                disableCardButton: 'Mit Concierge chatten',
                feed: {
                    title: 'Holen Sie sich die Expensify Karte',
                    subTitle: 'Optimieren Sie Ihre Geschäftsausgaben und sparen Sie bis zu 50 % bei Ihrer Expensify-Rechnung, plus:',
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
                    subtitle: 'Verknüpfe deine vorhandenen Karten für den automatischen Transaktionsimport, Belegabgleich und die Abstimmung.',
                    features: {
                        support: 'Karten von über 10.000 Banken verbinden',
                        assignCards: 'Verknüpfe die bestehenden Karten deines Teams',
                        automaticImport: 'Wir ziehen Transaktionen automatisch ein',
                    },
                },
                bankConnectionError: 'Problem mit Bankverbindung',
                connectWithPlaid: 'über Plaid verbinden',
                connectWithExpensifyCard: 'probieren Sie die Expensify Karte aus.',
                bankConnectionDescription: `Bitte versuchen Sie, Ihre Karten erneut hinzuzufügen. Andernfalls können Sie`,
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
                integrationExport: (integration: string, type?: string) => (integration && type ? `${integration} ${type.toLowerCase()}-Export` : `${integration}-Export`),
                integrationExportTitleXero: (integration: string) => `Wähle das ${integration}-Konto, in das Transaktionen exportiert werden sollen.`,
                integrationExportTitle: (integration: string, exportPageLink: string) =>
                    `Wähle das ${integration}-Konto, in das Transaktionen exportiert werden sollen. Wähle eine andere <a href="${exportPageLink}">Exportoption</a>, um die verfügbaren Konten zu ändern.`,
                lastUpdated: 'Zuletzt aktualisiert',
                transactionStartDate: 'Transaktionsstartdatum',
                updateCard: 'Karte aktualisieren',
                unassignCard: 'Karte zuweisen aufheben',
                unassign: 'Zuweisung aufheben',
                unassignCardDescription: 'Das Entfernen der Zuweisung dieser Karte wird alle nicht eingereichten Transaktionen löschen.',
                removeCard: 'Karte entfernen',
                remove: 'Entfernen',
                removeCardDescription: 'Wenn Sie diese Karte entfernen, werden alle nicht eingereichten Transaktionen gelöscht.',
                assignCard: 'Karte zuweisen',
                cardFeedName: 'Name des Kartenfeeds',
                cardFeedNameDescription: 'Gib dem Kartenfeed einen eindeutigen Namen, damit du ihn von den anderen unterscheiden kannst.',
                cardFeedTransaction: 'Transaktionen löschen',
                cardFeedTransactionDescription: 'Wähle aus, ob Karteninhaber Kartenumsätze löschen können. Neue Umsätze folgen diesen Regeln.',
                cardFeedRestrictDeletingTransaction: 'Löschen von Transaktionen einschränken',
                cardFeedAllowDeletingTransaction: 'Löschen von Transaktionen erlauben',
                removeCardFeed: 'Kartenfeed entfernen',
                removeCardFeedTitle: (feedName: string) => `${feedName}-Feed entfernen`,
                removeCardFeedDescription: 'Möchtest du diesen Kartenfeed wirklich entfernen? Dadurch werden alle Karten zugewiesen.',
                error: {
                    feedNameRequired: 'Name des Kartenfeeds ist erforderlich',
                    statementCloseDateRequired: 'Bitte wählen Sie ein Abrechnungsenddatum aus.',
                },
                corporate: 'Löschen von Transaktionen einschränken',
                personal: 'Löschen von Transaktionen erlauben',
                setFeedNameDescription: 'Gib dem Karten-Feed einen eindeutigen Namen, damit du ihn von den anderen unterscheiden kannst',
                setTransactionLiabilityDescription: 'Wenn aktiviert, können Karteninhaber Kartentransaktionen löschen. Neue Transaktionen folgen dieser Regel.',
                emptyAddedFeedTitle: 'Keine Karten in diesem Feed',
                emptyAddedFeedDescription: 'Stelle sicher, dass sich Karten im Kartenfeed deiner Bank befinden.',
                pendingFeedTitle: `Wir überprüfen Ihre Anfrage …`,
                pendingFeedDescription: `Wir überprüfen gerade Ihre Feed-Details. Sobald das erledigt ist, melden wir uns bei Ihnen über`,
                pendingBankTitle: 'Überprüfe dein Browserfenster',
                pendingBankDescription: (bankName: string) => `Bitte verbinden Sie sich über das soeben geöffnete Browserfenster mit ${bankName}. Falls sich keines geöffnet hat,`,
                pendingBankLink: 'bitte hier klicken',
                giveItNameInstruction: 'Gib der Karte einen Namen, der sie von anderen abhebt.',
                updating: 'Aktualisierung läuft …',
                neverUpdated: 'Nie',
                noAccountsFound: 'Keine Konten gefunden',
                defaultCard: 'Standardkarte',
                downgradeTitle: `Arbeitsbereich kann nicht herabgestuft werden`,
                downgradeSubTitle: `Dieser Arbeitsbereich kann nicht herabgestuft werden, da mehrere Kartenfeeds verbunden sind (ohne Expensify Karten). Bitte <a href="#">lassen Sie nur einen Kartenfeed verbunden</a>, um fortzufahren.`,
                noAccountsFoundDescription: (connection: string) => `Bitte fügen Sie das Konto in ${connection} hinzu und synchronisieren Sie die Verbindung erneut.`,
                expensifyCardBannerTitle: 'Holen Sie sich die Expensify Karte',
                expensifyCardBannerSubtitle:
                    'Profitiere von Cashback auf jeden Einkauf in den USA, bis zu 50 % Rabatt auf deine Expensify-Rechnung, unbegrenzt viele virtuelle Karten und vieles mehr.',
                expensifyCardBannerLearnMoreButton: 'Mehr erfahren',
                statementCloseDateTitle: 'Abrechnungsschlussdatum',
                statementCloseDateDescription: 'Teile uns mit, wann dein Kreditkartenkontoauszug abgeschlossen wird, und wir erstellen einen passenden Auszug in Expensify.',
            },
            workflows: {
                title: 'Workflows',
                subtitle: 'Konfigurieren Sie, wie Ausgaben genehmigt und bezahlt werden.',
                disableApprovalPrompt:
                    'Expensify Karten in diesem Workspace verwenden derzeit Genehmigungen, um ihre Smart Limits zu definieren. Bitte ändern Sie die Limittypen aller Expensify Karten mit Smart Limits, bevor Sie Genehmigungen deaktivieren.',
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
                subtitle: 'Erfasse und mache erstattungsfähige Steuern geltend.',
            },
            reportFields: {
                title: 'Berichtsfelder',
                subtitle: 'Richte benutzerdefinierte Felder für Ausgaben ein.',
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
                featureEnabledTitle: 'Nicht so schnell ...',
                featureEnabledText: 'Um diese Funktion zu aktivieren oder zu deaktivieren, musst du deine Einstellungen für den Buchhaltungsimport ändern.',
                disconnectText: 'Um die Buchhaltung zu deaktivieren, musst du die Buchhaltungsanbindung von deinem Workspace trennen.',
                manageSettings: 'Einstellungen verwalten',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Uber-Verknüpfung trennen',
                disconnectText: 'Um diese Funktion zu deaktivieren, trenne bitte zuerst die Uber for Business-Integration.',
                description: 'Möchtest du diese Integration wirklich trennen?',
                confirmText: 'Verstanden',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Nicht so schnell ...',
                featureEnabledText:
                    'Expensify Karten in diesem Workspace verwenden Genehmigungsworkflows, um ihre Smart Limits festzulegen.\n\nBitte ändern Sie die Limittypen aller Karten mit Smart Limits, bevor Sie Workflows deaktivieren.',
                confirmText: 'Zu Expensify Karten',
            },
            rules: {
                title: 'Regeln',
                subtitle: 'Belege anfordern, hohe Ausgaben markieren und mehr.',
            },
            timeTracking: {
                title: 'Zeit',
                subtitle: 'Legen Sie einen abrechnungsfähigen Stundensatz für die Zeiterfassung fest.',
                defaultHourlyRate: 'Standardstundensatz',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Beispiele:',
            customReportNamesSubtitle: `<muted-text>Berichtstitel mit unseren <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">umfangreichen Formeln</a> anpassen.</muted-text>`,
            customNameTitle: 'Standard-Berichtstitel',
            customNameDescription: `Wählen Sie einen benutzerdefinierten Namen für Spesenabrechnungen mit Hilfe unserer <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">umfangreichen Formeln</a>.`,
            customNameInputLabel: 'Name',
            customNameEmailPhoneExample: 'E-Mail-Adresse oder Telefonnummer des Mitglieds: {report:submit:from}',
            customNameStartDateExample: 'Berichtsstartdatum: {report:startdate}',
            customNameWorkspaceNameExample: 'Workspace-Name: {report:workspacename}',
            customNameReportIDExample: 'Berichts-ID: {report:id}',
            customNameTotalExample: 'Summe: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Mitglieder daran hindern, benutzerdefinierte Berichtstitel zu ändern',
        },
        reportFields: {
            addField: 'Feld hinzufügen',
            delete: 'Feld löschen',
            deleteFields: 'Felder löschen',
            findReportField: 'Berichtsfeld suchen',
            deleteConfirmation: 'Sind Sie sicher, dass Sie dieses Berichts­feld löschen möchten?',
            deleteFieldsConfirmation: 'Möchten Sie diese Berichtsfelder wirklich löschen?',
            emptyReportFields: {
                title: 'Du hast noch keine Berichtsfelder erstellt',
                subtitle: 'Füge ein benutzerdefiniertes Feld (Text, Datum oder Dropdown) hinzu, das in Berichten erscheint.',
            },
            subtitle: 'Berichtsfelder gelten für alle Ausgaben und können hilfreich sein, wenn du nach zusätzlichen Informationen fragen möchtest.',
            disableReportFields: 'Berichtsfelder deaktivieren',
            disableReportFieldsConfirmation: 'Bist du sicher? Text- und Datumsfelder werden gelöscht und Listen werden deaktiviert.',
            importedFromAccountingSoftware: 'Die folgenden Berichtsfelder werden importiert aus Ihrem',
            textType: 'Text',
            dateType: 'Datum',
            dropdownType: 'Liste',
            formulaType: 'Formel',
            textAlternateText: 'Fügen Sie ein Feld für freie Texteingabe hinzu.',
            dateAlternateText: 'Fügen Sie einen Kalender zur Datumsauswahl hinzu.',
            dropdownAlternateText: 'Füge eine Liste von Optionen hinzu, aus denen du wählen kannst.',
            formulaAlternateText: 'Füge ein Formel­feld hinzu.',
            nameInputSubtitle: 'Wähle einen Namen für das Berichtsfeld.',
            typeInputSubtitle: 'Wähle aus, welchen Typ von Berichts­feld du verwenden möchtest.',
            initialValueInputSubtitle: 'Geben Sie einen Startwert ein, der im Berichtsfeld angezeigt werden soll.',
            listValuesInputSubtitle: 'Diese Werte werden in der Dropdown-Liste des Berichtsfelds angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            listInputSubtitle: 'Diese Werte werden in Ihrer Liste der Berichtsfelder angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
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
            deleteValuePrompt: 'Sind Sie sicher, dass Sie diesen Listenwert löschen möchten?',
            deleteValuesPrompt: 'Bist du sicher, dass du diese Listenwerte löschen möchtest?',
            listValueRequiredError: 'Bitte gib einen Namen für den Listeneintrag ein',
            existingListValueError: 'Ein Listenwert mit diesem Namen existiert bereits',
            editValue: 'Wert bearbeiten',
            listValues: 'Werte auflisten',
            addValue: 'Wert hinzufügen',
            existingReportFieldNameError: 'Ein Berichts­feld mit diesem Namen existiert bereits',
            reportFieldNameRequiredError: 'Bitte gib einen Berichtsfeldnamen ein',
            reportFieldTypeRequiredError: 'Bitte wähle einen Berichtsfeldtyp aus',
            circularReferenceError: 'Dieses Feld kann nicht auf sich selbst verweisen. Bitte aktualisieren.',
            reportFieldInitialValueRequiredError: 'Bitte wähle einen Anfangswert für ein Berichtsfeld aus',
            genericFailureMessage: 'Beim Aktualisieren des Berichtfelds ist ein Fehler aufgetreten. Bitte versuche es erneut.',
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
            findTag: 'Tag finden',
            subtitle: 'Tags bieten detailliertere Möglichkeiten, Kosten zu klassifizieren.',
            subtitleWithDependentTags: (importSpreadsheetLink: string) =>
                `<muted-text>Tags bieten detailliertere Möglichkeiten, Kosten zu klassifizieren. Sie verwenden <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">abhängige Tags</a>. Sie können <a href="${importSpreadsheetLink}">eine Tabelle erneut importieren</a>, um Ihre Tags zu aktualisieren.</muted-text>`,
            emptyTags: {
                title: 'Sie haben noch keine Tags erstellt',
                subtitle: 'Füge ein Tag hinzu, um Projekte, Standorte, Abteilungen und mehr zu verfolgen.',
                subtitleHTML: `<muted-text><centered-text>Fügen Sie Tags hinzu, um Projekte, Standorte, Abteilungen und mehr nachzuverfolgen. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Erfahren Sie mehr</a> über das Formatieren von Tag-Dateien für den Import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Ihre Tags werden derzeit über eine Buchhaltungsverbindung importiert. Gehen Sie zu <a href="${accountingPageURL}">Buchhaltung</a>, um Änderungen vorzunehmen.</centered-text></muted-text>`,
            },
            deleteTag: 'Tag löschen',
            deleteTags: 'Tags löschen',
            deleteTagConfirmation: 'Möchten Sie dieses Tag wirklich löschen?',
            deleteTagsConfirmation: 'Sind Sie sicher, dass Sie diese Tags löschen möchten?',
            deleteFailureMessage: 'Beim Löschen des Tags ist ein Fehler aufgetreten, bitte versuche es erneut',
            tagRequiredError: 'Tag-Name ist erforderlich',
            existingTagError: 'Ein Tag mit diesem Namen existiert bereits',
            invalidTagNameError: 'Tag-Name darf nicht 0 sein. Bitte wählen Sie einen anderen Wert.',
            genericFailureMessage: 'Beim Aktualisieren des Tags ist ein Fehler aufgetreten, bitte versuche es erneut',
            importedFromAccountingSoftware: 'Tags werden in Ihrem',
            employeesSeeTagsAs: 'Mitarbeitende sehen Tags als',
            glCode: 'Hauptbuchcode',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des Hauptbuchcodes ist ein Fehler aufgetreten, bitte versuche es erneut.',
            tagRules: 'Tag-Regeln',
            approverDescription: 'Genehmiger',
            importTags: 'Tags importieren',
            importTagsSupportingText: 'Kategorisiere deine Ausgaben mit einem oder mehreren Tags.',
            configureMultiLevelTags: 'Konfiguriere deine Liste von Tags für mehrstufiges Tagging.',
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
                prompt1: 'Beim Wechseln der Tag-Ebenen werden alle aktuellen Tags gelöscht.',
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
                `Wir haben *${columnCounts} Spalten* in Ihrer Tabelle gefunden. Wählen Sie *Name* neben der Spalte aus, die die Tag-Namen enthält. Sie können außerdem *Aktiviert* neben der Spalte auswählen, die den Tag-Status festlegt.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Es können nicht alle Tags gelöscht oder deaktiviert werden',
                description: `Mindestens ein Tag muss aktiviert bleiben, da in deinem Workspace Tags erforderlich sind.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Nicht alle Tags können optional sein',
                description: `Mindestens ein Tag muss erforderlich bleiben, da deine Workspace-Einstellungen Tags vorschreiben.`,
            },
            cannotMakeTagListRequired: {
                title: 'Tag-Liste kann nicht als erforderlich festgelegt werden',
                description: 'Sie können eine Tag-Liste nur dann als erforderlich festlegen, wenn in Ihrer Richtlinie mehrere Tag-Ebenen konfiguriert sind.',
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
                updateTaxClaimableFailureMessage: 'Der erstattungsfähige Anteil muss geringer sein als der Betrag des Kilometerpauschalsatzes',
            },
            deleteTaxConfirmation: 'Sind Sie sicher, dass Sie diese Steuer löschen möchten?',
            deleteMultipleTaxConfirmation: (taxAmount: number) => `Möchtest du die Steuern in Höhe von ${taxAmount} wirklich löschen?`,
            actions: {
                delete: 'Satz löschen',
                deleteMultiple: 'Tarife löschen',
                enable: 'Kurs aktivieren',
                disable: 'Rate deaktivieren',
                enableTaxRates: () => ({
                    one: 'Kurs aktivieren',
                    other: 'Gebühren aktivieren',
                }),
                disableTaxRates: () => ({
                    one: 'Rate deaktivieren',
                    other: 'Sätze deaktivieren',
                }),
            },
            importedFromAccountingSoftware: 'Die Steuern unten werden importiert aus Ihrer',
            taxCode: 'Steuerschlüssel',
            updateTaxCodeFailureMessage: 'Beim Aktualisieren des Steuercodes ist ein Fehler aufgetreten, bitte versuche es erneut.',
        },
        duplicateWorkspace: {
            title: 'Benennen Sie Ihren neuen Arbeitsbereich',
            selectFeatures: 'Zu kopierende Funktionen auswählen',
            whichFeatures: 'Welche Funktionen möchtest du in deinen neuen Arbeitsbereich übernehmen?',
            confirmDuplicate: 'Möchten Sie fortfahren?',
            categories: 'Kategorien und deine automatischen Kategorisierungsregeln',
            reimbursementAccount: 'Erstattungskonto',
            welcomeNote: 'Bitte verwende meinen neuen Arbeitsbereich',
            delayedSubmission: 'verspätete Einreichung',
            merchantRules: 'Händlerregeln',
            merchantRulesCount: () => ({
                one: '1 Händlerregel',
                other: (count: number) => `${count} Händlerregeln`,
            }),
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Sie sind dabei, ${newWorkspaceName ?? ''} mit ${totalMembers ?? 0} Mitgliedern aus dem ursprünglichen Workspace zu erstellen und zu teilen.`,
            error: 'Beim Duplizieren deines neuen Workspace ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        emptyWorkspace: {
            title: 'Du hast keine Arbeitsbereiche',
            subtitle: 'Belege erfassen, Auslagen erstatten, Reisen verwalten, Rechnungen versenden und mehr.',
            createAWorkspaceCTA: 'Loslegen',
            features: {
                trackAndCollect: 'Belege nachverfolgen und sammeln',
                reimbursements: 'Mitarbeiter erstatten',
                companyCards: 'Firmenkarten verwalten',
            },
            notFound: 'Kein Workspace gefunden',
            description:
                'Räume sind ein großartiger Ort, um sich mit mehreren Personen auszutauschen und zusammenzuarbeiten. Erstelle oder tritt einem Workspace bei, um mit der Zusammenarbeit zu beginnen',
        },
        new: {
            newWorkspace: 'Neuer Arbeitsbereich',
            getTheExpensifyCardAndMore: 'Holen Sie sich die Expensify Karte und mehr',
            confirmWorkspace: 'Workspace bestätigen',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mein Gruppen-Arbeitsbereich${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: (userName: string, workspaceNumber?: number) => `Workspace von ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Beim Entfernen eines Mitglieds aus dem Workspace ist ein Fehler aufgetreten, bitte versuche es erneut',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Möchtest du ${memberName} wirklich entfernen?`,
                other: 'Sind Sie sicher, dass Sie diese Mitglieder entfernen möchten?',
            }),
            removeMembersWarningPrompt: (memberName: string, ownerName: string) =>
                `${memberName} ist eine approvierende Person in diesem Workspace. Wenn du diesen Workspace nicht mehr mit ihr teilst, ersetzen wir sie im Genehmigungsworkflow durch die/den Workspace-Inhaber·in, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Mitglied entfernen',
                other: 'Mitglieder entfernen',
            }),
            findMember: 'Mitglied finden',
            removeWorkspaceMemberButtonTitle: 'Aus Arbeitsbereich entfernen',
            removeGroupMemberButtonTitle: 'Aus Gruppe entfernen',
            removeRoomMemberButtonTitle: 'Aus Chat entfernen',
            removeMemberPrompt: (memberName: string) => `Möchtest du ${memberName} wirklich entfernen?`,
            removeMemberTitle: 'Mitglied entfernen',
            transferOwner: 'Besitz übertragen',
            makeMember: () => ({
                one: 'Mitglied machen',
                other: 'Mitglieder erstellen',
            }),
            makeAdmin: () => ({
                one: 'Als Admin festlegen',
                other: 'Admins ernennen',
            }),
            makeAuditor: () => ({
                one: 'Zum Prüfer machen',
                other: 'Prüfende hinzufügen',
            }),
            selectAll: 'Alle auswählen',
            error: {
                genericAdd: 'Beim Hinzufügen dieses Workspace-Mitglieds ist ein Problem aufgetreten',
                cannotRemove: 'Du kannst dich selbst oder den/die Workspace-Inhaber:in nicht entfernen',
                genericRemove: 'Beim Entfernen dieses Workspace-Mitglieds ist ein Problem aufgetreten',
            },
            addedWithPrimary: 'Einige Mitglieder wurden mit ihren primären Anmeldungen hinzugefügt.',
            invitedBySecondaryLogin: (secondaryLogin: string) => `Hinzugefügt durch sekundären Login ${secondaryLogin}.`,
            workspaceMembersCount: (count: number) => `Gesamtzahl der Workspace-Mitglieder: ${count}`,
            importMembers: 'Mitglieder importieren',
            removeMemberPromptApprover: (approver: string, workspaceOwner: string) =>
                `Wenn du ${approver} aus diesem Workspace entfernst, ersetzen wir diese Person im Freigabe-Workflow durch ${workspaceOwner}, den/die Workspace-Inhaber:in.`,
            removeMemberPromptPendingApproval: (memberName: string) =>
                `${memberName} hat ausstehende Spesenabrechnungen zur Genehmigung. Bitte bitten Sie diese Person, sie zu genehmigen, oder übernehmen Sie die Kontrolle über ihre Abrechnungen, bevor Sie sie aus dem Workspace entfernen.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Sie können ${memberName} nicht aus diesem Workspace entfernen. Bitte legen Sie unter Workflows > Zahlungen ausführen oder nachverfolgen eine*n neue*n Erstattungsverantwortliche*n fest und versuchen Sie es dann erneut.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Wenn du ${memberName} aus diesem Workspace entfernst, ersetzen wir diese Person als bevorzugte*n Exporteur*in durch ${workspaceOwner}, den/die Workspace-Inhaber*in.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Wenn du ${memberName} aus diesem Workspace entfernst, ersetzen wir sie/ihn als technischen Kontakt durch ${workspaceOwner}, den/die Workspace-Inhaber:in.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} hat einen ausstehenden Bericht in Bearbeitung, zu dem eine Aktion erforderlich ist. Bitte bitten Sie diese Person, die erforderliche Aktion abzuschließen, bevor Sie sie aus dem Workspace entfernen.`,
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
                physicalCardDescription: 'Ideal für Viel-Ausgeber',
                virtualCard: 'Virtuelle Karte',
                virtualCardDescription: 'Sofort und flexibel',
                chooseLimitType: 'Wähle einen Limittyp',
                smartLimit: 'Intelligentes Limit',
                smartLimitDescription: 'Bis zu einem bestimmten Betrag ausgeben, bevor eine Genehmigung erforderlich ist',
                monthly: 'Monatlich',
                monthlyDescription: 'Bis zu einem bestimmten Betrag pro Monat ausgeben',
                fixedAmount: 'Fester Betrag',
                fixedAmountDescription: 'Bis zu einem bestimmten Betrag einmal ausgeben',
                setLimit: 'Limit festlegen',
                cardLimitError: 'Bitte gib einen Betrag ein, der kleiner als 21.474.836 $ ist',
                giveItName: 'Gib ihm einen Namen',
                giveItNameInstruction: 'Gestalte sie eindeutig genug, um sie von anderen Karten unterscheiden zu können. Konkrete Anwendungsfälle sind sogar noch besser!',
                cardName: 'Kartenname',
                letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
                willBeReadyToUse: 'Diese Karte ist sofort einsatzbereit.',
                willBeReadyToShip: 'Diese Karte ist sofort versandbereit.',
                cardholder: 'Karteninhaber',
                cardType: 'Kartentyp',
                limit: 'Limit',
                limitType: 'Limittyp',
                disabledApprovalForSmartLimitError: 'Bitte aktivieren Sie Genehmigungen unter <strong>Workflows > Genehmigungen hinzufügen</strong>, bevor Sie Smart Limits einrichten',
                singleUse: 'Einmalig verwendbar',
                singleUseDescription: 'Läuft nach einer Transaktion ab',
                validFrom: 'Gültig ab',
                startDate: 'Startdatum',
                endDate: 'Enddatum',
                noExpirationHint: 'Eine Karte ohne Ablaufdatum läuft nicht ab',
                validFromTo: ({startDate, endDate}: {startDate: string; endDate: string}) => `Gültig vom ${startDate} bis ${endDate}`,
                validFromToWithoutText: ({startDate, endDate}: {startDate: string; endDate: string}) => `${startDate} bis ${endDate}`,
                combineWithExpiration: 'Mit Ablaufoptionen kombinieren für zusätzliche Ausgabenkontrolle',
                enterValidDate: 'Gib ein gültiges Datum ein',
                expirationDate: 'Ablaufdatum',
                limitAmount: 'Limitbetrag',
                setExpiryOptions: 'Ablaufoptionen festlegen',
                setExpiryDate: 'Ablaufdatum festlegen',
                setExpiryDateDescription: 'Die Karte läuft ab, wie auf der Karte angegeben',
                amount: 'Betrag',
            },
            deactivateCardModal: {
                deactivate: 'Deaktivieren',
                deactivateCard: 'Karte deaktivieren',
                deactivateConfirmation: 'Wenn du diese Karte deaktivierst, werden alle zukünftigen Transaktionen abgelehnt und dies kann nicht rückgängig gemacht werden.',
            },
        },
        accounting: {
            settings: 'Einstellungen',
            title: 'Verknüpfungen',
            subtitle: 'Verbinde dein Buchhaltungssystem, um Transaktionen mit deinem Kontenrahmen zu kodieren, Zahlungen automatisch abzugleichen und deine Finanzen synchron zu halten.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chatte mit deiner Einrichtungsexpertin/deinem Einrichtungsexperten.',
            talkYourAccountManager: 'Chatte mit deiner/deinem Account Manager/in.',
            talkToConcierge: 'Chatte mit Concierge.',
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
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `Bei einer in Expensify Classic eingerichteten Verbindung ist ein Fehler aufgetreten. [Wechsle zu Expensify Classic, um dieses Problem zu beheben.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Wechsle zu Expensify Classic, um deine Einstellungen zu verwalten.',
            setup: 'Verbinden',
            lastSync: (relativeDate: string) => `Zuletzt synchronisiert ${relativeDate}`,
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
                        return 'Verbindung zu QuickBooks Online nicht möglich';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Verbindung mit Xero nicht möglich';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Verbindung mit NetSuite nicht möglich';
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
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Als Berichtsfelder importiert',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Standardmäßige NetSuite-Mitarbeiterperson',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'diese Integration';
                return `Möchtest du ${integrationName} wirklich trennen?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Sind Sie sicher, dass Sie ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'diese Buchhaltungsintegration'} verbinden möchten? Dadurch werden alle bestehenden Buchhaltungsverbindungen entfernt.`,
            enterCredentials: 'Gib deine Anmeldedaten ein',
            claimOffer: {
                badgeText: 'Angebot verfügbar!',
                xero: {
                    headline: 'Hol dir Xero 6 Monate lang kostenlos!',
                    description: '<muted-text><centered-text>Neu bei Xero? Expensify-Kund*innen erhalten 6 Monate kostenlos. Fordern Sie unten Ihr Angebot an.</centered-text></muted-text>',
                    connectButton: 'Mit Xero verbinden',
                },
                uber: {
                    headerTitle: 'Uber for Business',
                    headline: 'Erhalte 5 % Rabatt auf Uber-Fahrten',
                    description: `<muted-text><centered-text>Aktiviere Uber for Business über Expensify und spare 5 % auf alle Geschäftsfahrten bis Juni. <a href="${CONST.UBER_TERMS_LINK}">Es gelten Bedingungen.</a></centered-text></muted-text>`,
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
                            return 'Importieren von Klassen';
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
                            return 'QuickBooks Online-Verbindung wird geprüft';
                        case 'quickbooksOnlineImportMain':
                            return 'QuickBooks-Online-Daten werden importiert';
                        case 'startingImportXero':
                            return 'Xero-Daten werden importiert';
                        case 'startingImportQBO':
                            return 'QuickBooks-Online-Daten werden importiert';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'QuickBooks-Desktop-Daten importieren';
                        case 'quickbooksDesktopImportTitle':
                            return 'Titel wird importiert';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importieren des Genehmigungszertifikats';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Dimensionen werden importiert';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Speicherrichtlinie wird importiert';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Synchronisiere weiterhin Daten mit QuickBooks … Bitte stelle sicher, dass der Web Connector ausgeführt wird';
                        case 'quickbooksOnlineSyncTitle':
                            return 'QuickBooks Online-Daten werden synchronisiert';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Daten werden geladen';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Kategorien werden aktualisiert';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Kund:innen/Projekte werden aktualisiert';
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
                            return 'Importiere Positionen';
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
                            return 'Sage Intacct-Daten importieren';
                        default: {
                            return `Übersetzung fehlt für Stufe: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Bevorzugte*r Exporteur*in',
            exportPreferredExporterNote:
                'Der bevorzugte Exporteur kann jede Workspace-Adminperson sein, muss jedoch auch Domain-Admin sein, wenn du in den Domaineinstellungen unterschiedliche Exportkonten für einzelne Firmenkarten festlegst.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht die bevorzugte exportierende Person die zu exportierenden Berichte in ihrem Konto.',
            exportAs: 'Exportieren als',
            exportOutOfPocket: 'Auslagen exportieren als',
            exportCompanyCard: 'Firmenkartenausgaben exportieren als',
            exportDate: 'Exportdatum',
            defaultVendor: 'Standardanbieter',
            autoSync: 'Automatische Synchronisierung',
            autoSyncDescription: 'NetSuite und Expensify automatisch jeden Tag synchronisieren. Finalisierte Berichte in Echtzeit exportieren',
            reimbursedReports: 'Erstattete Berichte synchronisieren',
            cardReconciliation: 'Kartenabstimmung',
            reconciliationAccount: 'Abstimkonto',
            continuousReconciliation: 'Laufende Abstimmung',
            saveHoursOnReconciliation:
                'Sparen Sie in jedem Abrechnungszeitraum Stunden bei der Abstimmung, indem Expensify fortlaufend Kontoauszüge und Abrechnungen der Expensify Karte für Sie abstimmt.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Um die kontinuierliche Abstimmung zu aktivieren, aktiviere bitte die <a href="${accountingAdvancedSettingsLink}">automatische Synchronisierung</a> für ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wählen Sie das Bankkonto aus, mit dem Ihre Zahlungen mit der Expensify Karte abgeglichen werden.',
                settlementAccountReconciliation: (settlementAccountUrl: string, lastFourPAN: string) =>
                    `Stellen Sie sicher, dass dieses Konto mit Ihrem <a href="${settlementAccountUrl}">Expensify Karte-Abrechnungskonto</a> (endend auf ${lastFourPAN}) übereinstimmt, damit die fortlaufende Abstimmung richtig funktioniert.`,
            },
        },
        export: {
            notReadyHeading: 'Nicht bereit zum Export',
            notReadyDescription:
                'Entwürfe oder ausstehende Spesenabrechnungen können nicht in das Buchhaltungssystem exportiert werden. Bitte genehmige oder bezahle diese Spesen, bevor du sie exportierst.',
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
                business: 'Business',
                chooseInvoiceMethod: 'Wähle unten eine Zahlungsmethode aus:',
                payingAsIndividual: 'Als Privatperson bezahlen',
                payingAsBusiness: 'Als Unternehmen bezahlen',
            },
            invoiceBalance: 'Rechnungsbetrag',
            invoiceBalanceSubtitle:
                'Dies ist Ihr aktuelles Guthaben aus eingegangenen Rechnungszahlungen. Es wird automatisch auf Ihr Bankkonto überwiesen, wenn Sie eines hinzugefügt haben.',
            bankAccountsSubtitle: 'Füge ein Bankkonto hinzu, um Rechnungen zu bezahlen und zu empfangen.',
        },
        invite: {
            member: 'Mitglied einladen',
            members: 'Mitglieder einladen',
            invitePeople: 'Neue Mitglieder einladen',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Workspace ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            pleaseEnterValidLogin: `Bitte stelle sicher, dass die E‑Mail-Adresse oder Telefonnummer gültig ist (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'Benutzer',
            users: 'Nutzer',
            invited: 'eingeladen',
            removed: 'entfernt',
            to: 'bis',
            from: 'von',
        },
        inviteMessage: {
            confirmDetails: 'Details bestätigen',
            inviteMessagePrompt: 'Machen Sie Ihre Einladung mit einer Nachricht unten noch besonderer!',
            personalMessagePrompt: 'Nachricht',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Workspace ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            inviteNoMembersError: 'Bitte wähle mindestens ein Mitglied zum Einladen aus',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} hat beantragt, ${workspaceName} beizutreten`,
        },
        distanceRates: {
            oopsNotSoFast: 'Ups! Nicht so schnell ...',
            workspaceNeeds: 'Ein Arbeitsbereich benötigt mindestens einen aktivierten Entfernungssatz.',
            distance: 'Entfernung',
            centrallyManage: 'Tarife zentral verwalten, in Meilen oder Kilometern nachverfolgen und eine Standardkategorie festlegen.',
            rate: 'Bewerten',
            addRate: 'Satz hinzufügen',
            findRate: 'Kurs finden',
            trackTax: 'Steuern nachverfolgen',
            deleteRates: () => ({
                one: 'Satz löschen',
                other: 'Tarife löschen',
            }),
            enableRates: () => ({
                one: 'Kurs aktivieren',
                other: 'Gebühren aktivieren',
            }),
            disableRates: () => ({
                one: 'Rate deaktivieren',
                other: 'Sätze deaktivieren',
            }),
            enableRate: 'Kurs aktivieren',
            status: 'Status',
            unit: 'Einheit',
            taxFeatureNotEnabledMessage:
                '<muted-text>Steuern müssen im Workspace aktiviert sein, um diese Funktion zu verwenden. Gehe zu <a href="#">Weitere Funktionen</a>, um das zu ändern.</muted-text>',
            deleteDistanceRate: 'Entfernungsrate löschen',
            areYouSureDelete: () => ({
                one: 'Sind Sie sicher, dass Sie diesen Satz löschen möchten?',
                other: 'Möchten Sie diese Tarife wirklich löschen?',
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
            nameInputHelpText: 'Dies ist der Name, den du in deinem Arbeitsbereich siehst.',
            nameIsRequiredError: 'Du musst deinem Workspace einen Namen geben',
            currencyInputLabel: 'Standardwährung',
            currencyInputHelpText: 'Alle Ausgaben in diesem Workspace werden in diese Währung umgerechnet.',
            currencyInputDisabledText: (currency: string) => `Die Standardwährung kann nicht geändert werden, da dieser Workspace mit einem ${currency}-Bankkonto verknüpft ist.`,
            save: 'Speichern',
            genericFailureMessage: 'Beim Aktualisieren des Arbeitsbereichs ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            addressContext: 'Für die Aktivierung von Expensify Travel ist eine Workspace-Adresse erforderlich. Bitte gib eine Adresse ein, die deinem Unternehmen zugeordnet ist.',
            policy: 'Spesenrichtlinie',
        },
        bankAccount: {
            continueWithSetup: 'Einrichtung fortsetzen',
            youAreAlmostDone:
                'Sie sind fast fertig mit der Einrichtung Ihres Bankkontos. Damit können Sie Firmenkarten ausgeben, Ausgaben erstatten, Rechnungen einsammeln und Zahlungen tätigen.',
            streamlinePayments: 'Zahlungen optimieren',
            connectBankAccountNote: 'Hinweis: Private Bankkonten können nicht für Zahlungen in Arbeitsbereichen verwendet werden.',
            oneMoreThing: 'Noch etwas!',
            allSet: 'Alles erledigt!',
            accountDescriptionWithCards: 'Dieses Bankkonto wird verwendet, um Firmenkarten auszugeben, Ausgaben zu erstatten, Rechnungen einzuziehen und Zahlungen zu leisten.',
            letsFinishInChat: 'Lass uns den Chat hier beenden!',
            finishInChat: 'Im Chat abschließen',
            almostDone: 'Fast geschafft!',
            disconnectBankAccount: 'Bankkonto trennen',
            startOver: 'Neu beginnen',
            updateDetails: 'Details aktualisieren',
            yesDisconnectMyBankAccount: 'Ja, mein Bankkonto trennen',
            yesStartOver: 'Ja, neu starten',
            disconnectYourBankAccount: (bankName: string) =>
                `Trenne dein <strong>${bankName}</strong>-Bankkonto. Alle ausstehenden Transaktionen für dieses Konto werden trotzdem abgeschlossen.`,
            clearProgress: 'Wenn du neu beginnst, wird dein bisheriger Fortschritt gelöscht.',
            areYouSure: 'Bist du sicher?',
            workspaceCurrency: 'Workspace-Währung',
            updateCurrencyPrompt:
                'Es sieht so aus, als wäre deine Arbeitsumgebung derzeit auf eine andere Währung als USD eingestellt. Bitte klicke auf die Schaltfläche unten, um deine Währung jetzt auf USD zu aktualisieren.',
            updateToUSD: 'Auf USD aktualisieren',
            updateWorkspaceCurrency: 'Arbeitsbereichswährung aktualisieren',
            workspaceCurrencyNotSupported: 'Workspace-Währung wird nicht unterstützt',
            yourWorkspace: `Dein Arbeitsbereich ist auf eine nicht unterstützte Währung eingestellt. Sieh dir die <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">Liste der unterstützten Währungen</a> an.`,
            chooseAnExisting: 'Wähle ein bestehendes Bankkonto zum Bezahlen von Ausgaben oder füge ein neues hinzu.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Besitz übertragen',
            addPaymentCardTitle: 'Gib deine Zahlungskarte ein, um die Inhaberschaft zu übertragen',
            addPaymentCardButtonText: 'Bedingungen akzeptieren & Zahlungskarte hinzufügen',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Lies und akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und die <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutz</a>-richtlinie, um deine Karte hinzuzufügen.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS-konform',
            addPaymentCardBankLevelEncrypt: 'Bankenübliche Verschlüsselung',
            addPaymentCardRedundant: 'Redundante Infrastruktur',
            addPaymentCardLearnMore: `<muted-text>Erfahre mehr über unsere <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">Sicherheit</a>.</muted-text>`,
            amountOwedTitle: 'Offener Saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Dieses Konto hat einen offenen Saldo aus einem vorherigen Monat.\n\nMöchtest du den Saldo ausgleichen und die Abrechnung für diesen Workspace übernehmen?',
            ownerOwesAmountTitle: 'Offener Saldo',
            ownerOwesAmountButtonText: 'Guthaben übertragen',
            ownerOwesAmountText: (email: string, amount: string) => `Das Konto, dem dieser Workspace gehört (${email}), hat einen ausstehenden Saldo aus einem vorherigen Monat.

Möchtest du diesen Betrag (${amount}) übernehmen, um die Abrechnung für diesen Workspace zu übernehmen? Deine Zahlungskarte wird sofort belastet.`,
            subscriptionTitle: 'Jahresabonnement übernehmen',
            subscriptionButtonText: 'Abonnement übertragen',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Wenn Sie diesen Workspace übernehmen, wird dessen Jahresabonnement mit Ihrem aktuellen Abonnement zusammengeführt. Dadurch erhöht sich Ihre Abonnementgröße um ${usersCount} Mitglieder und Ihre neue Abonnementgröße beträgt ${finalCount}. Möchten Sie fortfahren?`,
            duplicateSubscriptionTitle: 'Warnung vor doppeltem Abonnement',
            duplicateSubscriptionButtonText: 'Weiter',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Es sieht so aus, als ob du die Abrechnung für die Arbeitsbereiche von ${email} übernehmen möchtest. Dafür musst du jedoch zunächst in allen ihren Arbeitsbereichen Admin sein.

Klicke auf „Weiter“, wenn du nur die Abrechnung für den Arbeitsbereich ${workspaceName} übernehmen möchtest.

Wenn du die Abrechnung für das gesamte Abonnement übernehmen willst, bitte sie zuerst, dich in allen ihren Arbeitsbereichen als Admin hinzuzufügen, bevor du die Abrechnung übernimmst.`,
            hasFailedSettlementsTitle: 'Eigentumsübertragung nicht möglich',
            hasFailedSettlementsButtonText: 'Verstanden',
            hasFailedSettlementsText: (email: string) =>
                `Sie können die Abrechnung nicht übernehmen, weil ${email} eine überfällige Expensify Karte-Abrechnung hat. Bitte bitten Sie diese Person, sich an concierge@expensify.com zu wenden, um das Problem zu lösen. Danach können Sie die Abrechnung für diesen Arbeitsbereich übernehmen.`,
            failedToClearBalanceTitle: 'Kontostand konnte nicht ausgeglichen werden',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Wir konnten den Saldo nicht ausgleichen. Bitte versuche es später noch einmal.',
            successTitle: 'Juhu! Alles fertig.',
            successDescription: 'Sie sind jetzt der/die Besitzer:in dieses Arbeitsbereichs.',
            errorTitle: 'Ups! Nicht so schnell ...',
            errorDescription: `<muted-text><centered-text>Beim Übertragen der Inhaberschaft für diesen Workspace ist ein Problem aufgetreten. Versuche es erneut oder <concierge-link>wende dich für Hilfe an Concierge</concierge-link>.</centered-text></muted-text>`,
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
                title: 'Berichtsfelder',
                description: `Berichtsfelder ermöglichen es Ihnen, Details auf Kopfzeilenebene anzugeben, die sich von Tags unterscheiden, die sich auf Ausgaben in einzelnen Positionen beziehen. Diese Details können spezifische Projektnamen, Informationen zu Geschäftsreisen, Standorte und mehr umfassen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Berichtsfelder sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Profitiere von automatischer Synchronisierung und reduziere manuelle Eingaben mit der Expensify + NetSuite-Integration. Gewinne detaillierte Finanzanalysen in Echtzeit mit nativer und benutzerdefinierter Segmentunterstützung, einschließlich Projekt- und Kundenzuordnung.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere NetSuite-Integration ist nur im Control-Tarif verfügbar, beginnend ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Profitieren Sie von automatischer Synchronisierung und reduzieren Sie manuelle Eingaben mit der Expensify + Sage Intacct-Integration. Erhalten Sie detaillierte Finanzanalysen in Echtzeit mit benutzerdefinierten Dimensionen sowie einer Spesencodierung nach Abteilung, Kategorie, Standort, Kunde und Projekt (Auftrag).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere Integration mit Sage Intacct ist nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Profitiere von automatischer Synchronisierung und reduziere manuelle Eingaben mit der Integration Expensify + QuickBooks Desktop. Erziele maximale Effizienz mit einer Echtzeit-Zwei-Wege-Verbindung und der Spesenkodierung nach Klasse, Artikel, Kunde und Projekt.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere QuickBooks Desktop-Integration ist nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Erweiterte Genehmigungen',
                description: `Wenn du weitere Genehmigungsstufen hinzufügen möchtest – oder einfach sicherstellen willst, dass die höchsten Ausgaben noch einmal geprüft werden – bist du bei uns richtig. Erweiterte Genehmigungen helfen dir, auf jeder Ebene die passenden Kontrollen einzurichten, damit du die Ausgaben deines Teams im Griff behältst.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Erweiterte Genehmigungen sind nur im Control-Tarif verfügbar, der bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`} beginnt</muted-text>`,
            },
            categories: {
                title: 'Kategorien',
                description: 'Kategorien ermöglichen es dir, Ausgaben nachzuverfolgen und zu organisieren. Verwende unsere Standardkategorien oder füge deine eigenen hinzu.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kategorien sind im Collect-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            glCodes: {
                title: 'Sachkonten-Codes',
                description: `Füge deinen Kategorien und Tags Sachkonten-Codes hinzu, um Ausgaben einfach in deine Buchhaltungs- und Lohnabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Sachkonten sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Hauptbuch- und Lohnabrechnungscodes',
                description: `Fügen Sie Ihren Kategorien Hauptbuch- und Lohnabrechnungscodes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Gehaltssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Hauptbuch- und Lohnabrechnungscodes sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Steuerschlüssel',
                description: `Fügen Sie Ihren Steuern Steuerschlüssel hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Lohnabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Steuercodes sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            companyCards: {
                title: 'Unbegrenzte Firmenkarten',
                description: `Müssen Sie weitere Kartenfeeds hinzufügen? Schalten Sie unbegrenzt viele Firmenkarten frei, um Transaktionen von allen großen Kartenausstellern zu synchronisieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dies ist nur im Tarif Control verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            rules: {
                title: 'Regeln',
                description: `Regeln laufen im Hintergrund und halten Ihre Ausgaben unter Kontrolle, damit Sie sich nicht um Kleinigkeiten kümmern müssen.

Fordern Sie Spesendetails wie Belege und Beschreibungen an, legen Sie Limits und Standardwerte fest und automatisieren Sie Genehmigungen und Zahlungen – alles an einem Ort.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Regeln sind nur im Control-Tarif verfügbar, beginnend ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            perDiem: {
                title: 'Tagegeld',
                description:
                    'Per Diem ist eine hervorragende Möglichkeit, Ihre täglichen Kosten bei Geschäftsreisen Ihrer Mitarbeitenden konform und planbar zu halten. Nutzen Sie Funktionen wie individuelle Sätze, Standardkategorien und detailliertere Angaben wie Zielorte und Untersätze.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Tagesspesen sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            travel: {
                title: 'Reisen',
                description:
                    'Expensify Travel ist eine neue Plattform für die Buchung und Verwaltung von Geschäftsreisen, mit der Mitglieder Unterkünfte, Flüge, Transportmittel und mehr buchen können.',
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
                    'Mehrstufige Tags helfen Ihnen, Ausgaben präziser zu verfolgen. Weisen Sie jeder Position mehrere Tags zu – etwa Abteilung, Kunde oder Kostenstelle –, um den vollständigen Kontext jeder Ausgabe zu erfassen. So werden detailliertere Berichte, Genehmigungs-Workflows und Buchhaltungs-Exporte ermöglicht.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Mehrstufige Tags sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Kilometersätze',
                description: 'Erstelle und verwalte deine eigenen Sätze, verfolge Entfernungen in Meilen oder Kilometern und lege Standardkategorien für Fahrtkosten fest.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Entfernungsraten sind im Collect-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            auditor: {
                title: 'Prüfer',
                description: 'Prüfer erhalten schreibgeschützten Zugriff auf alle Berichte für vollständige Transparenz und Compliance-Überwachung.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Auditor:innen sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Mehrere Genehmigungsstufen',
                description:
                    'Mehrere Genehmigungsstufen sind ein Workflow-Tool für Unternehmen, die mehr als eine Person benötigen, um einen Bericht zu genehmigen, bevor er erstattet werden kann.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Mehrere Genehmigungsebenen sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'pro aktivem Mitglied und Monat.',
                perMember: 'pro Mitglied und Monat.',
            },
            note: (subscriptionLink: string) =>
                `<muted-text>Upgrade, um auf diese Funktion zuzugreifen, oder <a href="${subscriptionLink}">erfahre mehr</a> über unsere Tarife und Preise.</muted-text>`,
            upgradeToUnlock: 'Diese Funktion freischalten',
            completed: {
                headline: `Du hast deinen Arbeitsbereich aktualisiert!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Du hast ${policyName} erfolgreich auf den Control-Tarif hochgestuft! <a href="${subscriptionLink}">Abonnement ansehen</a> für mehr Details.</centered-text>`,
                categorizeMessage: `Du hast erfolgreich auf den Collect‑Tarif upgegradet. Jetzt kannst du deine Ausgaben kategorisieren!`,
                travelMessage: `Du hast erfolgreich auf den Collect‑Tarif upgegradet. Jetzt kannst du mit dem Buchen und Verwalten von Reisen beginnen!`,
                distanceRateMessage: `Du hast erfolgreich auf den Collect-Tarif upgegradet. Jetzt kannst du den Kilometersatz ändern!`,
                gotIt: 'Verstanden, danke',
                createdWorkspace: `Du hast einen Arbeitsbereich erstellt!`,
            },
            commonFeatures: {
                title: 'Upgrade auf den Control-Tarif',
                note: 'Schalte unsere leistungsstärksten Funktionen frei, darunter:',
                benefits: {
                    startsAtFull: (learnMoreMethodsRoute: string, formattedPrice: string, hasTeam2025Pricing: boolean) =>
                        `<muted-text>Der Control-Tarif beginnt bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied und Monat.` : `pro aktivem Mitglied und Monat.`}. <a href="${learnMoreMethodsRoute}">Erfahre mehr</a> über unsere Tarife und Preise.</muted-text>`,
                    benefit1: 'Erweiterte Buchhaltungsverbindungen (NetSuite, Sage Intacct und mehr)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Genehmigungs-Workflows mit mehreren Ebenen',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    toUpgrade: 'Zum Upgrade klicken Sie',
                    selectWorkspace: 'wähle einen Workspace aus und ändere den Plantyp in',
                },
                upgradeWorkspaceWarning: `Arbeitsbereich kann nicht aktualisiert werden`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt:
                    'Ihr Unternehmen hat das Erstellen von Arbeitsbereichen eingeschränkt. Bitte wenden Sie sich an eine*n Admin, um Hilfe zu erhalten.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Herabstufen auf Collect',
                note: 'Sie verlieren den Zugriff auf die folgenden Funktionen',
                benefits: {
                    confirm: 'Sie müssen den „Plantyp“ jedes Arbeitsbereichs auf „Collect“ ändern, um den Collect-Tarif zu sichern.',
                    benefit1: 'NetSuite, Sage Intacct, QuickBooks Desktop, Oracle, Microsoft Dynamics',
                    benefit2: 'Workday, Certinia',
                    benefit3: 'SSO/SAML',
                    benefit4: 'Intelligente Spesenregeln, Tagegelder, Genehmigungen mit mehreren Ebenen, benutzerdefinierte Berichte und Budgetierung',
                    headsUp: 'Achtung!',
                    multiWorkspaceNote:
                        'Sie müssen alle Ihre Workspaces herabstufen, bevor Ihre erste monatliche Zahlung fällig ist, um ein Abonnement zum Collect-Tarif zu beginnen. Klicken Sie',
                    selectStep: '> Wähle jeden Workspace aus > ändere den Plantyp in',
                    benefit1Label: 'ERP-Integrationen',
                    benefit2Label: 'HR-Integrationen',
                    benefit3Label: 'Sicherheit',
                    benefit4Label: 'Erweitert',
                    important: 'WICHTIG:',
                },
                noteAndMore: 'und mehr:',
            },
            completed: {
                headline: 'Dein Workspace wurde herabgestuft',
                description: 'Sie haben andere Workspaces im Control-Tarif. Um zum Collect-Tarif abgerechnet zu werden, müssen Sie alle Workspaces herabstufen.',
                gotIt: 'Verstanden, danke',
            },
        },
        payAndDowngrade: {
            title: 'Bezahlen & Downgrade',
            headline: 'Ihre letzte Zahlung',
            description1: (formattedAmount: string) => `Ihre letzte Rechnung für dieses Abonnement beträgt <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Sieh dir unten deine Aufschlüsselung für den ${date} an:`,
            subscription:
                'Achtung! Diese Aktion beendet dein Expensify-Abonnement, löscht diesen Workspace und entfernt alle Workspace-Mitglieder. Wenn du diesen Workspace behalten und nur dich selbst entfernen möchtest, lass zuerst eine andere Admin-Person die Abrechnung übernehmen.',
            genericFailureMessage: 'Beim Bezahlen deiner Rechnung ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        restrictedAction: {
            restricted: 'Eingeschränkt',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Aktionen im Workspace ${workspaceName} sind derzeit eingeschränkt`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: (workspaceOwnerName: string) =>
                `Der/die Workspace-Inhaber:in ${workspaceOwnerName} muss die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Workspace-Aktivitäten freizuschalten.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Du musst die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Aktivitäten im Workspace freizuschalten.',
            addPaymentCardToUnlock: 'Füge eine Zahlungskarte hinzu, um das freizuschalten!',
            addPaymentCardToContinueUsingWorkspace: 'Füge eine Zahlungsmethode hinzu, um diesen Workspace weiterhin zu verwenden',
            pleaseReachOutToYourWorkspaceAdmin: 'Bitte wende dich bei Fragen an deine Workspace-Admin.',
            chatWithYourAdmin: 'Mit Ihrer Adminperson chatten',
            chatInAdmins: 'Chat in #admins',
            addPaymentCard: 'Zahlungskarte hinzufügen',
            goToSubscription: 'Zu Abo wechseln',
        },
        rules: {
            individualExpenseRules: {
                title: 'Ausgaben',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Legen Sie Ausgabenkontrollen und Standardwerte für einzelne Ausgaben fest. Sie können auch Regeln für <a href="${categoriesPageLink}">Kategorien</a> und <a href="${tagsPageLink}">Tags</a> erstellen.</muted-text>`,
                receiptRequiredAmount: 'Belegpflichtiger Betrag',
                receiptRequiredAmountDescription: 'Belege verlangen, wenn die Ausgaben diesen Betrag überschreiten, außer wenn dies durch eine Kategorienregel außer Kraft gesetzt wird.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `Der Betrag darf den für den detaillierten Beleg erforderlichen Betrag (${amount}) nicht überschreiten`,
                itemizedReceiptRequiredAmount: 'Erforderlicher Betrag für detaillierte Quittung',
                itemizedReceiptRequiredAmountDescription: 'Postenweise Belege verlangen, wenn die Ausgaben diesen Betrag überschreiten, es sei denn, eine Kategorienregel hebt dies auf.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `Der Betrag darf nicht niedriger sein als der für reguläre Belege erforderliche Betrag (${amount})`,
                maxExpenseAmount: 'Maximaler Spesenbetrag',
                maxExpenseAmountDescription: 'Kennzeichne Ausgaben, die diesen Betrag überschreiten, es sei denn, sie werden von einer Kategorienregel außer Kraft gesetzt.',
                maxAge: 'Maximalalter',
                maxExpenseAge: 'Maximales Spesenalter',
                maxExpenseAgeDescription: 'Ausgaben markieren, die älter als eine bestimmte Anzahl von Tagen sind.',
                maxExpenseAgeDays: () => ({
                    one: '1 Tag',
                    other: (count: number) => `${count} Tage`,
                }),
                cashExpenseDefault: 'Standard für Barausgaben',
                cashExpenseDefaultDescription:
                    'Wähle, wie Barausgaben erstellt werden sollen. Eine Ausgabe gilt als Barausgabe, wenn sie keine importierte Firmenkartentransaktion ist. Dazu gehören manuell erstellte Ausgaben, Belege, Tagegelder, Entfernungs- und Zeitausgaben.',
                reimbursableDefault: 'Erstattungsfähig',
                reimbursableDefaultDescription: 'Auslagen werden meist an Mitarbeitende zurückgezahlt',
                nonReimbursableDefault: 'Nicht erstattungsfähig',
                nonReimbursableDefaultDescription: 'Spesen werden gelegentlich an Mitarbeitende zurückerstattet',
                alwaysReimbursable: 'Immer erstattungsfähig',
                alwaysReimbursableDescription: 'Spesen werden immer an Mitarbeitende zurückgezahlt',
                alwaysNonReimbursable: 'Immer nicht erstattungsfähig',
                alwaysNonReimbursableDescription: 'Auslagen werden Mitarbeitenden nie erstattet',
                billableDefault: 'Standardmäßig verrechenbar',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Wähle, ob Bar- und Kreditkartenausgaben standardmäßig verrechenbar sein sollen. Verrechenbare Ausgaben werden in <a href="${tagsPageLink}">Tags</a> aktiviert oder deaktiviert.</muted-text>`,
                billable: 'Abrechenbar',
                billableDescription: 'Spesen werden meist an Kund:innen weiterberechnet',
                nonBillable: 'Nicht abrechenbar',
                nonBillableDescription: 'Spesen werden gelegentlich an Kund:innen weiterberechnet',
                eReceipts: 'eBelege',
                eReceiptsHint: `eBelege werden automatisch erstellt [für die meisten Kreditkartentransaktionen in USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Teilnehmernachverfolgung',
                attendeeTrackingHint: 'Verfolge die Pro-Kopf-Kosten für jede Ausgabe.',
                prohibitedDefaultDescription: 'Markieren Sie Belege mit diesen Positionen zur manuellen Überprüfung.',
                prohibitedExpenses: 'Verbotene Ausgaben',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Nebenkosten im Hotel',
                gambling: 'Glücksspiel',
                tobacco: 'Tabak',
                adultEntertainment: 'Erwachsenenunterhaltung',
                requireCompanyCard: 'Firmenkarten für alle Käufe vorschreiben',
                requireCompanyCardDescription: 'Kennzeichne alle Barausgaben, einschließlich Kilometer- und Tagegeldspesen.',
                requireCompanyCardDisabledTooltip: 'Aktiviere Firmenkarten (unter Weitere Funktionen), um dies freizuschalten.',
            },
            expenseReportRules: {
                title: 'Erweitert',
                subtitle: 'Automatisiere die Einhaltung von Spesenrichtlinien, Genehmigungen und Zahlungen.',
                preventSelfApprovalsTitle: 'Selbstgenehmigungen verhindern',
                preventSelfApprovalsSubtitle: 'Verhindere, dass Workspace-Mitglieder ihre eigenen Spesenabrechnungen genehmigen.',
                autoApproveCompliantReportsTitle: 'Konforme Berichte automatisch genehmigen',
                autoApproveCompliantReportsSubtitle: 'Konfiguriere, welche Spesenabrechnungen für die automatische Genehmigung infrage kommen.',
                autoApproveReportsUnderTitle: 'Berichte automatisch genehmigen, wenn alle Ausgaben unter',
                autoApproveReportsUnderDescription: 'Vollständig konforme Spesenabrechnungen, bei denen alle Ausgaben unter diesem Betrag liegen, werden automatisch genehmigt.',
                randomReportAuditTitle: 'Stichprobenprüfung von Berichten',
                randomReportAuditDescription: 'Verlange, dass einige Berichte manuell genehmigt werden, selbst wenn sie für die automatische Genehmigung infrage kommen.',
                autoPayApprovedReportsTitle: 'Genehmigte Berichte automatisch bezahlen',
                autoPayApprovedReportsSubtitle: 'Legen Sie fest, welche Spesenabrechnungen für die automatische Zahlung infrage kommen.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Bitte gib einen Betrag ein, der kleiner als ${currency ?? ''}20.000 ist`,
                autoPayApprovedReportsLockedSubtitle: 'Gehe zu „Weitere Funktionen“ und aktiviere Workflows, dann füge Zahlungen hinzu, um diese Funktion freizuschalten.',
                autoPayReportsUnderTitle: 'Berichte für automatische Bezahlung unter',
                autoPayReportsUnderDescription: 'Vollständig konforme Spesenabrechnungen unter diesem Betrag werden automatisch bezahlt.',
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
                confirmError: 'Gib ein Händlerunternehmen ein und nimm mindestens eine Aktualisierung vor',
                confirmErrorMerchant: 'Bitte Händler eingeben',
                confirmErrorUpdate: 'Bitte wende mindestens ein Update an',
                previewMatchesEmptyStateTitle: 'Nichts anzuzeigen',
                previewMatchesEmptyStateSubtitle: 'Keine nicht eingereichten Ausgaben entsprechen dieser Regel.',
                deleteRule: 'Regel löschen',
                deleteRuleConfirmation: 'Sind Sie sicher, dass Sie diese Regel löschen möchten?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `Wenn Händler ${isExactMatch ? 'stimmt genau überein' : 'enthält'} „${merchantName}“`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Händler in „${merchantName}“ umbenennen`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `${fieldName} auf „${fieldValue}“ aktualisieren`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Als „${reimbursable ? 'erstattungsfähig' : 'nicht erstattungsfähig'}“ markieren`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Als „${billable ? 'verrechenbar' : 'nicht abrechenbar'}“ markieren`,
                matchType: 'Abgleichstyp',
                matchTypeContains: 'Enthält',
                matchTypeExact: 'Exakte Übereinstimmung',
                duplicateRuleTitle: 'Ähnliche Händlerregel existiert bereits',
                duplicateRulePrompt: (merchantName: string) => `Ihre bestehende Regel für „${merchantName}“ hat Vorrang vor dieser. Trotzdem speichern?`,
                saveAnyway: 'Trotzdem speichern',
                applyToExistingUnsubmittedExpenses: 'Auf bestehende nicht eingereichte Ausgaben anwenden',
            },
            categoryRules: {
                title: 'Kategorienregeln',
                approver: 'Genehmiger',
                requireDescription: 'Beschreibung erforderlich',
                requireFields: 'Pflichtfelder',
                requiredFieldsTitle: 'Pflichtfelder',
                requiredFieldsDescription: (categoryName: string) => `Dies gilt für alle Ausgaben, die der Kategorie <strong>${categoryName}</strong> zugeordnet sind.`,
                requireAttendees: 'Teilnehmende verpflichten',
                descriptionHint: 'Beschreibungshinweis',
                descriptionHintDescription: (categoryName: string) =>
                    `Erinnere Mitarbeitende daran, zusätzliche Informationen zu Ausgaben der Kategorie „${categoryName}“ anzugeben. Dieser Hinweis erscheint im Beschreibungsfeld von Ausgaben.`,
                descriptionHintLabel: 'Hinweis',
                descriptionHintSubtitle: 'Profi-Tipp: Je kürzer, desto besser!',
                maxAmount: 'Maximalbetrag',
                flagAmountsOver: 'Beträge kennzeichnen über',
                flagAmountsOverDescription: (categoryName: string) => `Gilt für die Kategorie „${categoryName}“.`,
                flagAmountsOverSubtitle: 'Dadurch wird der Höchstbetrag für alle Ausgaben überschrieben.',
                expenseLimitTypes: {
                    expense: 'Einzelne Ausgabe',
                    expenseSubtitle: 'Betrag von Ausgaben nach Kategorie kennzeichnen. Diese Regel überschreibt die allgemeine Arbeitsbereichsregel für den maximalen Ausgabenbetrag.',
                    daily: 'Kategoriesumme',
                    dailySubtitle: 'Markiere die gesamte tägliche Kategorienaussage pro Spesenbericht.',
                },
                requireReceiptsOver: 'Belege erforderlich über',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standard`,
                    never: 'Belege niemals verlangen',
                    always: 'Belege immer erforderlich',
                },
                requireItemizedReceiptsOver: 'Detaillierte Belege erforderlich für Beträge über',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standard`,
                    never: 'Niemals Einzelquittungen verlangen',
                    always: 'Immer detaillierte Belege verlangen',
                },
                defaultTaxRate: 'Standardsteuersatz',
                enableWorkflows: (moreFeaturesLink: string) =>
                    `Gehe zu [Weitere Funktionen](${moreFeaturesLink}) und aktiviere Workflows, füge dann Genehmigungen hinzu, um diese Funktion freizuschalten.`,
            },
            customRules: {
                title: 'Spesenrichtlinie',
                cardSubtitle: 'Hier ist die Spesenrichtlinie deines Teams hinterlegt, damit alle denselben Stand haben, was abgedeckt ist.',
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
                    description: 'Für Organisationen mit erweiterten Anforderungen.',
                },
            },
            description: 'Wähle ein passendes Abo für dich. Eine detaillierte Liste der Funktionen und Preise findest du in unserem',
            subscriptionLink: 'Hilfeseite zu Plantypen und Preisen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Sie haben sich bis zum Ende Ihres Jahresabonnements am ${annualSubscriptionEndDate} zu 1 aktivem Mitglied im Control-Tarif verpflichtet. Sie können ab dem ${annualSubscriptionEndDate} zu einem nutzungsbasierten Abonnement wechseln und in den Collect-Tarif herabstufen, indem Sie die automatische Verlängerung in`,
                other: `Sie haben sich bis zum Ende Ihres Jahresabonnements am ${annualSubscriptionEndDate} zu ${count} aktiven Mitgliedern im Control-Tarif verpflichtet. Ab dem ${annualSubscriptionEndDate} können Sie durch Deaktivieren der automatischen Verlängerung in ein nutzungsabhängiges Abonnement wechseln und auf den Collect-Tarif herabstufen in`,
            }),
            subscriptions: 'Abonnements',
        },
    },
    getAssistancePage: {
        title: 'Hilfe erhalten',
        subtitle: 'Wir sind hier, um dir den Weg zur Größe zu ebnen!',
        description: 'Wähle eine der folgenden Supportoptionen aus:',
        chatWithConcierge: 'Mit Concierge chatten',
        scheduleSetupCall: 'Einen Einrichtungstermin vereinbaren',
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
        emojiNotSelected: 'Emoji nicht ausgewählt',
    },
    newRoomPage: {
        newRoom: 'Neuer Raum',
        groupName: 'Gruppenname',
        roomName: 'Raumname',
        visibility: 'Sichtbarkeit',
        restrictedDescription: 'Personen in deinem Arbeitsbereich können diesen Raum finden',
        privateDescription: 'Eingeladene Personen zu diesem Raum können ihn finden',
        publicDescription: 'Jede Person kann diesen Raum finden',
        public_announceDescription: 'Jede Person kann diesen Raum finden',
        createRoom: 'Raum erstellen',
        roomAlreadyExistsError: 'Ein Raum mit diesem Namen existiert bereits',
        roomNameReservedError: (reservedName: string) => `${reservedName} ist ein Standardraum in allen Arbeitsbereichen. Bitte wähle einen anderen Namen.`,
        roomNameInvalidError: 'Raumnamen dürfen nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
        pleaseEnterRoomName: 'Bitte gib einen Raumnamen ein',
        pleaseSelectWorkspace: 'Bitte wähle einen Workspace aus',
        renamedRoomAction: (oldName: string, newName: string, isExpenseReport: boolean, actorName?: string) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}umbenannt in „${newName}“ (zuvor „${oldName}“)` : `${actor}hat diesen Raum in „${newName}“ umbenannt (zuvor „${oldName}“)`;
        },
        roomRenamedTo: (newName: string) => `Raum in ${newName} umbenannt`,
        social: 'sozial',
        selectAWorkspace: 'Arbeitsbereich auswählen',
        growlMessageOnRenameError: 'Arbeitsbereichsraum kann nicht umbenannt werden. Bitte überprüfe deine Verbindung und versuche es erneut.',
        visibilityOptions: {
            restricted: 'Workspace',
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
            `Standard-Geschäftsbankkonto auf „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}“ festlegen`,
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
            `hat das standardmäßige Geschäftskonto auf „${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}“ geändert (zuvor „${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}“)`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `hat die Firmenadresse in „${newAddress}“ geändert (zuvor „${previousAddress}“)` : `Firmenadresse auf „${newAddress}“ festlegen`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `${approverName} (${approverEmail}) als Genehmiger:in für das Feld ${field} „${name}“ hinzugefügt`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `${approverName} (${approverEmail}) als Genehmiger:in für das Feld ${field} „${name}“ entfernt`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `Genehmigende Person für ${field} „${name}“ auf ${formatApprover(newApproverName, newApproverEmail)} geändert (zuvor ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: (categoryName: string) => `Kategorie „${categoryName}“ hinzugefügt`,
        deleteCategory: (categoryName: string) => `hat die Kategorie „${categoryName}“ entfernt`,
        updateCategory: (categoryName: string, oldValue: boolean) => `${oldValue ? 'deaktiviert' : 'aktiviert'} die Kategorie „${categoryName}“`,
        updateCategoryPayrollCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `die Lohnabrechnungscode-Nummer „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            if (!newValue && oldValue) {
                return `hat den Lohnabrechnungscode „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `hat den Lohnabrechnungscode der Kategorie „${categoryName}“ in „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateCategoryGLCode: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!oldValue) {
                return `hat den Hauptbuchcode „${newValue}” zur Kategorie „${categoryName}” hinzugefügt`;
            }
            if (!newValue && oldValue) {
                return `hat den Hauptbuchcode „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `hat den SKR-Code der Kategorie „${categoryName}“ in „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateAreCommentsRequired: (categoryName: string, oldValue: boolean) => {
            return `die Beschreibung der Kategorie „${categoryName}“ zu ${!oldValue ? 'erforderlich' : 'nicht erforderlich'} geändert (zuvor ${!oldValue ? 'nicht erforderlich' : 'erforderlich'})`;
        },
        updateCategoryMaxExpenseAmount: (categoryName: string, newAmount?: string, oldAmount?: string) => {
            if (newAmount && !oldAmount) {
                return `hat einen maximalen Betrag von ${newAmount} zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            if (oldAmount && !newAmount) {
                return `hat den Maximalbetrag von ${oldAmount} aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `hat den Maximalbetrag der Kategorie „${categoryName}“ auf ${newAmount} geändert (zuvor ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `hat den Grenztyp ${newValue} zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            return `hat den Limittyp der Kategorie „${categoryName}“ in ${newValue} geändert (zuvor ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: (categoryName: string, newValue: string, oldValue?: string) => {
            if (!oldValue) {
                return `hat die Kategorie „${categoryName}“ aktualisiert, indem Belege auf ${newValue} geändert wurden`;
            }
            return `hat die Kategorie „${categoryName}“ zu ${newValue} geändert (zuvor ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `hat die Kategorie „${categoryName}“ aktualisiert, indem Einzelpostenbelege in ${newValue} geändert wurden`;
            }
            return `hat die Positionenbelege der Kategorie „${categoryName}“ auf ${newValue} geändert (zuvor ${oldValue})`;
        },
        setCategoryName: (oldName: string, newName: string) => `hat die Kategorie „${oldName}“ in „${newName}“ umbenannt`,
        updatedDescriptionHint: (categoryName: string, newValue?: string, oldValue?: string) => {
            if (!newValue) {
                return `hat den Beschreibungshinweis „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return !oldValue
                ? `hat den Beschreibungshinweis „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`
                : `hat den Hinweis zur Beschreibung der Kategorie „${categoryName}“ in „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateTagListName: (oldName: string, newName: string) => `hat den Schlagwortlistennamen in „${newName}“ geändert (zuvor „${oldName}“)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `den Tag „${tagName}“ zur Liste „${tagListName}“ hinzugefügt`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) =>
            `hat die Tag-Liste „${tagListName}“ aktualisiert, indem der Tag „${oldName}“ in „${newName}“ geändert wurde`,
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
            `hat ${updatedField} der benutzerdefinierten Einheit ${customUnitName} von „${oldValue}“ auf „${newValue}“ geändert`,
        updateCustomUnitTaxEnabled: (newValue: boolean) => `${newValue ? 'aktiviert' : 'deaktiviert'} Steuerverfolgung bei Entfernungsraten`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `hat einen neuen ${customUnitName}-Satz „${rateName}“ hinzugefügt`,
        updatedCustomUnitRate: (customUnitName: string, customUnitRateName: string, updatedField: string, newValue: string, oldValue: string) =>
            `hat den Satz des/der ${customUnitName} ${updatedField} „${customUnitRateName}“ auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        updatedCustomUnitTaxRateExternalID: (customUnitRateName: string, newValue: string, newTaxPercentage: string, oldTaxPercentage?: string, oldValue?: string) => {
            if (oldTaxPercentage && oldValue) {
                return `hat den Steuersatz für den Kilometersatz „${customUnitRateName}“ auf „${newValue} (${newTaxPercentage})“ geändert (zuvor „${oldValue} (${oldTaxPercentage})“)`;
            }
            return `die Steuerquote „${newValue} (${newTaxPercentage})“ zum Entfernungssatz „${customUnitRateName}“ hinzugefügt`;
        },
        updatedCustomUnitTaxClaimablePercentage: (customUnitRateName: string, newValue: number, oldValue?: number) => {
            if (oldValue) {
                return `hat den erstattungsfähigen Steueranteil im Distanzsatz „${customUnitRateName}“ auf „${newValue}“ geändert (zuvor „${oldValue}“)`;
            }
            return `eine steuerlich rückforderbare Komponente von „${newValue}“ zum Distanzsatz „${customUnitRateName}“ hinzugefügt`;
        },
        updatedCustomUnitRateEnabled: (customUnitName: string, customUnitRateName: string, newValue: boolean) => {
            return `${newValue ? 'aktiviert' : 'deaktiviert'} den ${customUnitName}-Satz „${customUnitRateName}“`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `hat den „${customUnitName}“-Satz „${rateName}“ entfernt`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `Standardwert des Berichts­feldes „${fieldName}“ auf „${defaultValue}“ festlegen`,
        addedReportFieldOption: (fieldName: string, optionName: string) => `die Option „${optionName}“ zum Berichtsfeld „${fieldName}“ hinzugefügt`,
        removedReportFieldOption: (fieldName: string, optionName: string) => `hat die Option „${optionName}“ aus dem Berichtsfeld „${fieldName}“ entfernt`,
        updateReportFieldOptionDisabled: (fieldName: string, optionName: string, optionEnabled: boolean) =>
            `${optionEnabled ? 'aktiviert' : 'deaktiviert'} die Option „${optionName}“ für das Berichtsfeld „${fieldName}“`,
        updateReportFieldAllOptionsDisabled: (fieldName: string, optionName: string, allEnabled: boolean, toggledOptionsCount?: number) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'aktiviert' : 'deaktiviert'} alle Optionen für das Berichtsfeld „${fieldName}“`;
            }
            return `${allEnabled ? 'aktiviert' : 'deaktiviert'} die Option „${optionName}“ für das Berichtsfeld „${fieldName}“, wodurch alle Optionen ${allEnabled ? 'aktiviert' : 'deaktiviert'}`;
        },
        deleteReportField: ({fieldType, fieldName}: {fieldType: string; fieldName?: string}) => `${fieldType}-Berichts-Feld „${fieldName}“ entfernt`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `aktualisierte „Selbstgenehmigung verhindern“ auf „${newValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}“ (zuvor „${oldValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}“)`,
        updateMonthlyOffset: (oldValue: string, newValue: string) => {
            if (!oldValue) {
                return `monatliches Berichtsabgabedatum auf „${newValue}“ festlegen`;
            }
            return `hat das Einreichungsdatum des Monatsberichts auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`;
        },
        updateDefaultBillable: (oldValue: string, newValue: string) => `„Spesen an Kunden weiterberechnen“ wurde auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        changedCustomReportNameFormula: (oldValue: string, newValue: string) => `hat die Formel für den benutzerdefinierten Berichtsnamen in „${newValue}“ geändert (zuvor „${oldValue}“)`,
        renamedWorkspaceNameAction: (oldName: string, newName: string) => `hat den Namen dieses Workspaces zu „${newName}“ geändert (zuvor „${oldName}“)`,
        updateDefaultReimbursable: (oldValue: string, newValue: string) => `„Standard für Barausgaben“ auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        updateDefaultTitleEnforced: (value: boolean) => `„Standard-Berichtstitel erzwingen“ aktiviert ${value ? 'an' : 'aus'}`,
        updateWorkspaceDescription: (newDescription: string, oldDescription: string) =>
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
                other: `hat Sie aus den Genehmigungs-Workflows und Spesen-Chats von ${joinedNames} entfernt. Zuvor eingereichte Berichte bleiben in Ihrem Posteingang zur Genehmigung verfügbar.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `hat Ihre Rolle in ${policyName} von ${oldRole} zu Nutzer geändert. Sie wurden aus allen Einreicher-Spesen-Chats entfernt, außer aus Ihrem eigenen.`,
        updatedWorkspaceCurrencyAction: (oldCurrency: string, newCurrency: string) => `Standardwährung auf ${newCurrency} aktualisiert (zuvor ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: (oldFrequency: string, newFrequency: string) => `die automatische Berichtshäufigkeit auf „${newFrequency}“ aktualisiert (zuvor „${oldFrequency}“)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `hat den Genehmigungsmodus auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        upgradedWorkspace: 'hat diesen Workspace auf den Control-Tarif hochgestuft',
        forcedCorporateUpgrade: `Dieser Workspace wurde auf den Control-Tarif hochgestuft. Klicken Sie <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">hier</a> für weitere Informationen.`,
        downgradedWorkspace: 'hat diesen Workspace auf den Collect-Tarif heruntergestuft',
        updatedAuditRate: (oldAuditRate: number, newAuditRate: number) =>
            `hat die Rate der Berichte, die zufällig zur manuellen Genehmigung zugewiesen werden, auf ${Math.round(newAuditRate * 100)}% geändert (zuvor ${Math.round(oldAuditRate * 100)}%)`,
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
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Expensify Karten`;
                case 'travel invoicing':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Reiserechnungsstellung`;
                case 'company cards':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Firmenkarten`;
                case 'invoicing':
                    return `${enabled ? 'aktiviert' : 'deaktiviert'} Rechnungsstellung`;
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
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? 'aktiviert' : 'deaktiviert'} Teilnehmenden-Tracking`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? 'aktiviert' : 'deaktiviert'} automatisch bezahlte genehmigte Berichte`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `automatisch bezahlte genehmigte Berichte auf den Schwellenwert „${newLimit}“ festlegen`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `hat den Schwellenwert für automatisch bezahlte genehmigte Berichte auf „${newLimit}“ geändert (zuvor „${oldLimit}“)`,
        removedAutoPayApprovedReportsLimit: 'den Schwellenwert für automatisch zu zahlende genehmigte Berichte entfernt',
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover
                ? `hat die standardmäßige genehmigende Person in ${newApprover} geändert (zuvor ${previousApprover})`
                : `hat die* Standardgenehmiger*in auf ${newApprover} geändert`,
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
                text += `(bisherige*r Standardgenehmigende*r ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(zuvor Standardgenehmiger)';
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
                ? `hat den Genehmigungsworkflow für ${members} geändert, damit Berichte an den Standardgenehmigenden ${approver} eingereicht werden`
                : `hat den Genehmigungs-Workflow für ${members} geändert, damit diese Berichte an die Standardgenehmiger:in einreichen`;
            if (wasDefaultApprover && previousApprover) {
                text += `(bisherige*r Standardgenehmigende*r ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(zuvor Standardgenehmiger)';
            } else if (previousApprover) {
                text += `(zuvor ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `hat den Genehmigungsworkflow für ${approver} geändert, um genehmigte Berichte an ${forwardsTo} weiterzuleiten (zuvor weitergeleitet an ${previousForwardsTo})`
                : `hat den Genehmigungsworkflow für ${approver} geändert, sodass genehmigte Berichte an ${forwardsTo} weitergeleitet werden (zuvor endgültig genehmigte Berichte)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `den Genehmigungsworkflow für ${approver} geändert, um das Weiterleiten genehmigter Berichte zu stoppen (zuvor weitergeleitet an ${previousForwardsTo})`
                : `den Genehmigungsworkflow für ${approver} geändert, damit genehmigte Berichte nicht mehr weitergeleitet werden`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `hat den Firmennamen der Rechnung in „${newValue}“ geändert (zuvor „${oldValue}“)` : `setze den Rechnungsfirmennamen auf „${newValue}“`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `hat die Unternehmenswebsite der Rechnung in „${newValue}“ geändert (zuvor „${oldValue}“)` : `Rechnungsunternehmens-Website auf „${newValue}“ festlegen`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser
                ? `hat die/den autorisierte:n Zahler:in in „${newReimburser}“ geändert (zuvor „${previousReimburser}“)`
                : `den/die autorisierte/n Zahler/in in „${newReimburser}“ geändert`,
        updateReimbursementEnabled: (enabled: boolean) => `${enabled ? 'aktiviert' : 'deaktiviert'} Rückerstattungen`,
        updateCustomTaxName: ({oldName, newName}: UpdatedPolicyCustomTaxNameParams) => `benutzerdefinierten Steuernamen in „${newName}" geändert (zuvor „${oldName}")`,
        updateCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyCurrencyDefaultTaxParams) => `Standard-Steuerbetrag der Workspace-Währung auf „${newName}" geändert (zuvor „${oldName}")`,
        updateForeignCurrencyDefaultTax: ({oldName, newName}: UpdatedPolicyForeignCurrencyDefaultTaxParams) =>
            `den Standardsteuersatz für Fremdwährungen in „${newName}" geändert (zuvor „${oldName}")`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `die Steuer „${taxName}" hinzugefügt`,
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
        setReceiptRequiredAmount: (newValue: string) => `Belegpflichtigen Betrag auf „${newValue}“ festlegen`,
        changedReceiptRequiredAmount: (oldValue: string, newValue: string) => `Belegpflichtbetrag auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        removedReceiptRequiredAmount: (oldValue: string) => `Belegpflichtigen Betrag entfernt (zuvor „${oldValue}“)`,
        setMaxExpenseAmount: (newValue: string) => `maximalen Ausgabenbetrag auf „${newValue}“ festlegen`,
        changedMaxExpenseAmount: (oldValue: string, newValue: string) => `hat den maximalen Ausgabenbetrag auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        removedMaxExpenseAmount: (oldValue: string) => `maximale Ausgabenhöhe entfernt (zuvor „${oldValue}“)`,
        setMaxExpenseAge: (newValue: string) => `maximales Ausgabenalter auf „${newValue}“ Tage festlegen`,
        changedMaxExpenseAge: (oldValue: string, newValue: string) => `maximales Ausgabenalter auf „${newValue}“ Tage geändert (zuvor „${oldValue}“)`,
        updateCategories: (count: number) => `${count} Kategorien aktualisiert`,
        updateTagList: (tagListName: string) => `Tags in der Liste „${tagListName}“ aktualisiert`,
        updateTagListRequired: ({tagListsName, isRequired}: UpdatedPolicyTagListRequiredParams) =>
            `Tag-Liste „${tagListsName}“ in ${isRequired ? 'erforderlich' : 'nicht erforderlich'} geändert`,
        importTags: 'Tags aus einer Tabelle importiert',
        deletedAllTags: 'alle Tags gelöscht',
        updateCustomUnitDefaultCategory: ({customUnitName, newValue, oldValue}: UpdatePolicyCustomUnitDefaultCategoryParams) =>
            `hat die Standardkategorie für ${customUnitName} in „${newValue}“ geändert ${oldValue ? `(zuvor „${oldValue}“)` : ''}`,
        importCustomUnitRates: (customUnitName: string) => `importierte Preise für benutzerdefinierte Einheit „${customUnitName}“`,
        updateCustomUnitSubRate: ({customUnitName, customUnitRateName, customUnitSubRateName, oldValue, newValue, updatedField}: UpdatedPolicyCustomUnitSubRateParams) =>
            `hat Tarif „${customUnitName}“ mit Satz „${customUnitRateName}“ und Untersatz „${customUnitSubRateName}“ ${updatedField} auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        removedCustomUnitSubRate: ({customUnitName, customUnitRateName, removedSubRateName}: RemovedPolicyCustomUnitSubRateParams) =>
            `entfernte „${customUnitName}“-Rate „${customUnitRateName}“ Unterrate „${removedSubRateName}“`,
        addBudget: ({frequency, entityName, entityType, shared, individual, notificationThreshold}: AddBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `mit Benachrichtigungsschwelle von „${notificationThreshold}%“` : '';
            if (typeof shared !== 'undefined' && typeof individual !== 'undefined') {
                return `${frequency} individuelles Budget „${individual}“ und ${frequency} gemeinsames Budget „${shared}“${thresholdSuffix} zum/zur ${entityType} „${entityName}“ hinzugefügt`;
            }
            if (typeof individual !== 'undefined') {
                return `${frequency} individuelles Budget von „${individual}“${thresholdSuffix} zum ${entityType} „${entityName}“ hinzugefügt`;
            }
            return `${frequency} gemeinsames Budget „${shared}“${thresholdSuffix} zum ${entityType} „${entityName}“ hinzugefügt`;
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
                changesList.push(`Budgetfrequenz auf „${newFrequency}“ geändert (zuvor „${oldFrequency}“)`);
            }
            if (sharedChanged) {
                changesList.push(`hat das gesamte Arbeitsbereichsbudget auf „${newShared}“ geändert (zuvor „${oldShared}“)`);
            }
            if (individualChanged) {
                changesList.push(`individuelles Budget auf „${newIndividual}“ geändert (zuvor „${oldIndividual}“)`);
            }
            if (thresholdChanged) {
                changesList.push(`Benachrichtigungsschwelle auf „${newNotificationThreshold}%“ geändert (zuvor „${oldNotificationThreshold}%“)`);
            }
            if (!frequencyChanged && !sharedChanged && !individualChanged && !thresholdChanged) {
                return `Budget für ${entityType} „${entityName}“ aktualisiert`;
            }
            if (changesList.length === 1) {
                if (frequencyChanged) {
                    return `Budgetfrequenz für ${entityType} „${entityName}“ auf „${newFrequency}“ geändert (zuvor „${oldFrequency}“)`;
                }
                if (sharedChanged) {
                    return `Gesamtarbeitsbereichsbudget für den ${entityType} „${entityName}“ auf „${newShared}“ geändert (zuvor „${oldShared}“)`;
                }
                if (individualChanged) {
                    return `hat das individuelle Budget für den/die/das ${entityType} „${entityName}“ auf „${newIndividual}“ geändert (zuvor „${oldIndividual}“)`;
                }
                return `Benachrichtigungsschwelle für ${entityType} „${entityName}“ auf „${newNotificationThreshold}%“ geändert (zuvor „${oldNotificationThreshold}%“)`;
            }
            return `Budget für ${entityType} „${entityName}“ aktualisiert: ${changesList.join('; ')}`;
        },
        deleteBudget: ({entityType, entityName, frequency, individual, shared, notificationThreshold}: DeleteBudgetParams) => {
            const thresholdSuffix = typeof notificationThreshold === 'number' ? `mit Benachrichtigungsschwelle von „${notificationThreshold}%“` : '';
            if (shared && individual) {
                return `hat ${frequency} gemeinsames Budget von „${shared}“ und individuelles Budget von „${individual}“${thresholdSuffix} aus dem/der ${entityType} „${entityName}“ entfernt`;
            }
            if (shared) {
                return `${frequency} geteiltes Budget „${shared}“${thresholdSuffix} aus dem ${entityType} „${entityName}“ entfernt`;
            }
            if (individual) {
                return `${frequency} individuelles Budget von „${individual}“${thresholdSuffix} aus dem/der ${entityType} „${entityName}“ entfernt`;
            }
            return `Budget aus dem ${entityType} „${entityName}“ entfernt`;
        },
        updatedTimeEnabled: (enabled?: boolean) => {
            return `${enabled ? 'aktiviert' : 'deaktiviert'} Zeiterfassung`;
        },
        updatedTimeRate: ({newRate, oldRate}: UpdatedPolicyTimeRateParams) => {
            return `Stundensatz auf „${newRate}“ geändert (zuvor „${oldRate}“)`;
        },
        addedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `„${prohibitedExpense}“ zu verbotenen Ausgaben hinzugefügt`,
        removedProhibitedExpense: ({prohibitedExpense}: {prohibitedExpense: string}) => `„${prohibitedExpense}“ aus verbotenen Ausgaben entfernt`,
        updatedReimbursementChoice: ({newReimbursementChoice, oldReimbursementChoice}: UpdatedPolicyReimbursementChoiceParams) =>
            `Erstattungmethode zu „${newReimbursementChoice}“ geändert (vorher „${oldReimbursementChoice}“)`,
        setAutoJoin: ({enabled}: {enabled: boolean}) => `${enabled ? 'aktiviert' : 'deaktiviert'} Vorabgenehmigung von Arbeitsbereich-Beitrittsanfragen`,
        updatedDefaultTitle: ({newDefaultTitle, oldDefaultTitle}: UpdatedPolicyDefaultTitleParams) =>
            `benutzerdefinierte Berichtstitelformel in „${newDefaultTitle}“ geändert (zuvor „${oldDefaultTitle}“)`,
        updatedOwnership: ({oldOwnerEmail, oldOwnerName, policyName}: UpdatedPolicyOwnershipParams) =>
            `hat die Inhaberschaft von ${policyName} von ${oldOwnerName} (${oldOwnerEmail}) übernommen`,
        updatedAutoHarvesting: (enabled: boolean) => `${enabled ? 'aktiviert' : 'deaktiviert'} geplante Einreichung`,
        updatedIndividualBudgetNotification: ({
            budgetAmount,
            budgetFrequency,
            budgetName,
            budgetTypeForNotificationMessage,
            summaryLink,
            thresholdPercentage,
            totalSpend,
            unsubmittedSpend,
            userEmail,
            awaitingApprovalSpend,
            approvedReimbursedClosedSpend,
        }: UpdatedPolicyBudgetNotificationParams) =>
            `Achtung! Dieser Workspace hat ein ${budgetFrequency}-Budget von „${budgetAmount}“ für den/die/das ${budgetTypeForNotificationMessage} „${budgetName}“. ${userEmail} liegt derzeit bei ${approvedReimbursedClosedSpend}, was über ${thresholdPercentage}% des Budgets liegt. Außerdem warten ${awaitingApprovalSpend} noch auf Genehmigung und ${unsubmittedSpend} wurden noch nicht eingereicht, für insgesamt ${totalSpend}.${summaryLink ? `<a href="${summaryLink}">Hier ist ein Bericht</a> mit all diesen Ausgaben für Ihre Unterlagen!` : ''}`,
        updatedSharedBudgetNotification: ({
            budgetAmount,
            budgetFrequency,
            budgetName,
            budgetTypeForNotificationMessage,
            summaryLink,
            thresholdPercentage,
            totalSpend,
            unsubmittedSpend,
            awaitingApprovalSpend,
            approvedReimbursedClosedSpend,
        }: UpdatedPolicyBudgetNotificationParams) =>
            `Achtung! Dieser Workspace hat ein ${budgetFrequency}-Budget von „${budgetAmount}“ für den ${budgetTypeForNotificationMessage} „${budgetName}“. Du liegst derzeit bei ${approvedReimbursedClosedSpend}, was über ${thresholdPercentage}% des Budgets liegt. Außerdem warten ${awaitingApprovalSpend} auf Genehmigung und ${unsubmittedSpend} wurden noch nicht eingereicht, für insgesamt ${totalSpend}. ${summaryLink ? `<a href="${summaryLink}">Hier ist ein Bericht</a> mit all diesen Ausgaben für Ihre Unterlagen!` : ''}`,
        removedMaxExpenseAge: (oldValue: string) => `maximales Spesenalter entfernt (zuvor „${oldValue}“ Tage)`,
        addedCardFeed: (feedName: string) => `Kartenfeed „${feedName}“ hinzugefügt`,
        removedCardFeed: (feedName: string) => `Kartenfeed „${feedName}“ entfernt`,
        renamedCardFeed: (newName: string, oldName: string) => `Kartenfeed in „${newName}“ umbenannt (zuvor „${oldName}“)`,
        assignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `hat ${email} ${feedName ? `„${feedName}" ` : ''}Firmenkreditkarte mit der Endziffer ${cardLastFour} zugewiesen`,
        unassignedCompanyCard: (email: string, feedName: string, cardLastFour: string) =>
            `nicht zugewiesene ${feedName ? `„${feedName}" ` : ''}Firmenkarte ${email}, endet auf ${cardLastFour}`,
        updatedCardFeedLiability: (feedName: string, enabled: boolean) =>
            `${enabled ? 'aktiviert' : 'deaktiviert'} Karteninhaber:innen können Kartentransaktionen für Kartenfeed „${feedName}“ löschen`,
        updatedCardFeedStatementPeriod: (feedName: string, newValue?: string, previousValue?: string) =>
            `Kartenfeed-Tag für das Abrechnungsperiodenende von „${feedName}“ geändert${newValue ? ` in „${newValue}“` : ''}${previousValue ? ` (zuvor „${previousValue}“)` : ''}`,
        addedReportField: ({fieldType, fieldName, defaultValue}: AddedOrDeletedPolicyReportFieldParams) =>
            `${fieldType}-Berichtsfeld „${fieldName}“${defaultValue ? ` mit Standardwert „${defaultValue}“` : ''} hinzugefügt`,
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
        confirmError: 'Bitte gib einen Titel ein und wähle ein Ziel zum Teilen aus',
        descriptionOptional: 'Beschreibung (optional)',
        pleaseEnterTaskName: 'Bitte geben Sie einen Titel ein',
        pleaseEnterTaskDestination: 'Bitte wählen Sie aus, wo Sie diese Aufgabe teilen möchten',
    },
    task: {
        task: 'Aufgabe',
        title: 'Titel',
        description: 'Beschreibung',
        assignee: 'Zuständige Person',
        completed: 'Abgeschlossen',
        action: 'Abschließen',
        messages: {
            created: (title: string) => `Aufgabe für ${title}`,
            completed: 'als erledigt markiert',
            canceled: 'gelöschte Aufgabe',
            reopened: 'als unvollständig markiert',
            error: 'Sie haben keine Berechtigung, die angeforderte Aktion auszuführen',
        },
        markAsComplete: 'Als erledigt markieren',
        markAsIncomplete: 'Als unvollständig markieren',
        assigneeError: 'Beim Zuweisen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie eine andere zuständige Person.',
        genericCreateTaskFailureMessage: 'Beim Erstellen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuche es später erneut.',
        deleteTask: 'Aufgabe löschen',
        deleteConfirmation: 'Sind Sie sicher, dass Sie diese Aufgabe löschen möchten?',
    },
    statementPage: {
        title: (year: number | string, monthName: string) => `Abrechnung ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Tastenkürzel',
        subtitle: 'Spare Zeit mit diesen praktischen Tastaturkürzeln:',
        shortcuts: {
            openShortcutDialog: 'Öffnet den Dialog für Tastenkürzel',
            markAllMessagesAsRead: 'Alle Nachrichten als gelesen markieren',
            escape: 'Dialoge schließen',
            search: 'Suchdialog öffnen',
            newChat: 'Neuer Chat-Bildschirm',
            copy: 'Kommentar kopieren',
            openDebug: 'Testeinstellungen öffnen',
        },
    },
    guides: {
        screenShare: 'Bildschirmfreigabe',
        screenShareRequest: 'Expensify lädt dich zu einer Bildschirmfreigabe ein',
    },
    search: {
        resultsAreLimited: 'Suchergebnisse sind begrenzt.',
        viewResults: 'Ergebnisse anzeigen',
        appliedFilters: 'Angewandte filter',
        resetFilters: 'Filter zurücksetzen',
        searchResults: {
            emptyResults: {
                title: 'Nichts anzuzeigen',
                subtitle: `Versuche, deine Suchkriterien anzupassen oder etwas mit der +‑Schaltfläche zu erstellen.`,
            },
            emptyExpenseResults: {
                title: 'Du hast noch keine Ausgaben erstellt',
                subtitle: 'Erstelle eine Ausgabe oder mache eine Probefahrt mit Expensify, um mehr zu erfahren.',
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
                title: 'Keine Ausgaben zum Genehmigen',
                subtitle: 'Null Ausgaben. Maximale Entspannung. Gut gemacht!',
            },
            emptyPayResults: {
                title: 'Keine zu bezahlenden Ausgaben',
                subtitle: 'Glückwunsch! Du hast die Ziellinie überquert.',
            },
            emptyExportResults: {
                title: 'Keine Spesen zum Exportieren',
                subtitle: 'Zeit, es ruhig angehen zu lassen – gute Arbeit.',
            },
            emptyStatementsResults: {
                title: 'Keine Ausgaben zum Anzeigen',
                subtitle: 'Keine Ergebnisse. Bitte passe deine Filter an.',
            },
            emptyUnapprovedResults: {
                title: 'Keine Ausgaben zum Genehmigen',
                subtitle: 'Null Ausgaben. Maximale Entspannung. Gut gemacht!',
            },
        },
        columns: 'Spalten',
        editColumns: 'Spalten bearbeiten',
        resetColumns: 'Spalten zurücksetzen',
        groupColumns: 'Spalten gruppieren',
        expenseColumns: 'Spalten für Ausgaben',
        statements: 'Abrechnungen',
        cardStatements: 'Kartenabrechnungen',
        monthlyAccrual: 'Monatliche Abgrenzung',
        unapprovedCash: 'Nicht genehmigtes Bargeld',
        unapprovedCard: 'Nicht genehmigte Karte',
        reconciliation: 'Abstimmung',
        topSpenders: 'Top-Ausgaben',
        saveSearch: 'Suche speichern',
        deleteSavedSearch: 'Gespeicherte Suche löschen',
        deleteSavedSearchConfirm: 'Möchtest du diese Suche wirklich löschen?',
        searchName: 'Namen suchen',
        savedSearchesMenuItemTitle: 'Gespeichert',
        topCategories: 'Top-Kategorien',
        topMerchants: 'Top-Händler',
        groupedExpenses: 'gruppierte Ausgaben',
        bulkActions: {
            editMultiple: 'Mehrere bearbeiten',
            editMultipleTitle: 'Mehrere Ausgaben bearbeiten',
            editMultipleDescription: 'Änderungen werden für alle ausgewählten Ausgaben festgelegt und überschreiben alle zuvor festgelegten Werte.',
            approve: 'Genehmigen',
            pay: 'Bezahlen',
            delete: 'Löschen',
            hold: 'Warteschleife',
            unhold: 'Zurückhalten aufheben',
            reject: 'Ablehnen',
            noOptionsAvailable: 'Für die ausgewählte Ausgabengruppe sind keine Optionen verfügbar.',
            undelete: 'Wiederherstellen',
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
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: 'Laufendes Jahr',
                    [CONST.SEARCH.DATE_PRESETS.LAST_12_MONTHS]: 'Letzte 12 Monate',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Letzter Auszug',
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
                lessThan: (amount?: string) => `Weniger als ${amount ?? ''}`,
                greaterThan: (amount?: string) => `Größer als ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `Zwischen ${greaterThan} und ${lessThan}`,
                equalTo: (amount?: string) => `Gleich ${amount ?? ''}`,
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
            reportField: (name: string, value: string) => `${name} ist ${value}`,
            current: 'Aktuell',
            past: 'Vergangenes',
            submitted: 'Eingereicht',
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
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Expensify Karte',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: 'Rückerstattung',
            },
            is: 'Ist',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Senden',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Genehmigen',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Bezahlen',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Export',
            },
        },
        display: {
            label: 'Anzeige',
            sortBy: 'Sortieren nach',
            groupBy: 'Gruppieren nach',
            limitResults: 'Ergebnisse einschränken',
        },
        has: 'Hat',
        view: {
            label: 'Anzeigen',
            table: 'Tabelle',
            bar: 'Leiste',
            line: 'Linie',
            pie: 'Kreisdiagramm',
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
        expenseType: 'Ausgabenart',
        withdrawalType: 'Auszahlungsart',
        recentSearches: 'Letzte Suchen',
        recentChats: 'Neueste Chats',
        searchIn: 'Suchen in',
        searchPlaceholder: 'Nach etwas suchen',
        suggestions: 'Vorschläge',
        suggestionsAvailable: (
            {
                count,
            }: {
                count: number;
            },
            query = '',
        ) => ({
            one: `Vorschläge verfügbar${query ? ` für ${query}` : ''}. ${count} Ergebnis.`,
            other: (resultCount: number) => `Vorschläge verfügbar${query ? ` für ${query}` : ''}. ${resultCount} Ergebnisse.`,
        }),
        exportSearchResults: {
            title: 'Export erstellen',
            description: 'Wow, das sind aber viele Elemente! Wir bündeln sie, und Concierge schickt dir in Kürze eine Datei.',
        },
        exportedTo: 'Exportiert nach',
        exportAll: {
            selectAllMatchingItems: 'Alle passenden Einträge auswählen',
            allMatchingItemsSelected: 'Alle passenden Elemente ausgewählt',
        },
        spendOverTime: 'Ausgaben im Zeitverlauf',
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
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • Auszahlungs-ID: ${withdrawalID}`,
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
            chooseWorkspace: 'Wähle einen Workspace für diesen Bericht.',
            emptyReportConfirmationTitle: 'Sie haben bereits einen leeren Bericht',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Möchtest du wirklich einen weiteren Bericht in ${workspaceName} erstellen? Du kannst auf deine leeren Berichte zugreifen in`,
            emptyReportConfirmationPromptLink: 'Berichte',
            emptyReportConfirmationDontShowAgain: 'Nicht mehr anzeigen',
            genericWorkspaceName: 'dieser Workspace',
        },
        genericCreateReportFailureMessage: 'Unerwarteter Fehler beim Erstellen dieses Chats. Bitte versuchen Sie es später erneut.',
        genericAddCommentFailureMessage: 'Unerwarteter Fehler beim Senden des Kommentars. Bitte versuche es später noch einmal.',
        genericUpdateReportFieldFailureMessage: 'Unerwarteter Fehler beim Aktualisieren des Feldes. Bitte versuchen Sie es später noch einmal.',
        genericUpdateReportNameEditFailureMessage: 'Unerwarteter Fehler beim Umbenennen des Berichts. Bitte versuche es später noch einmal.',
        noActivityYet: 'Noch keine Aktivität',
        connectionSettings: 'Verbindungseinstellungen',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `${fieldName} auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `setze ${fieldName} auf „${newValue}“`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `hat den Arbeitsbereich${fromPolicyName ? `(zuvor ${fromPolicyName})` : ''} geändert`;
                    }
                    return `hat den Workspace in ${toPolicyName}${fromPolicyName ? `(zuvor ${fromPolicyName})` : ''} geändert`;
                },
                changeType: (oldType: string, newType: string) => `Typ von ${oldType} zu ${newType} geändert`,
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
                    automaticActionThree: 'und erfolgreich einen Datensatz erstellt für',
                    reimburseableLink: 'Auslagen',
                    nonReimbursableLink: 'Firmenkarten-Ausgaben',
                    pending: (label: string) => `hat begonnen, diesen Bericht nach ${label} zu exportieren...`,
                },
                integrationsMessage: (errorMessage: string, label: string, linkText?: string, linkURL?: string) =>
                    `Fehler beim Exportieren dieses Berichts nach ${label} („${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}“)`,
                managerAttachReceipt: `Beleg hinzugefügt`,
                managerDetachReceipt: `hat eine Quittung entfernt`,
                markedReimbursed: (amount: string, currency: string) => `hat ${currency}${amount} anderweitig bezahlt`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `${currency}${amount} über Integration bezahlt`,
                outdatedBankAccount: `Konnte die Zahlung aufgrund eines Problems mit dem Bankkonto des Zahlenden nicht verarbeiten`,
                reimbursementACHBounceDefault: `Zahlung konnte wegen einer falschen Bankleitzahl/Kontonummer oder eines geschlossenen Kontos nicht verarbeitet werden`,
                reimbursementACHBounceWithReason: ({returnReason}: {returnReason: string}) => `Die Zahlung konnte nicht verarbeitet werden: ${returnReason}`,
                reimbursementACHCancelled: `hat die Zahlung storniert`,
                reimbursementAccountChanged: `Die Zahlung konnte nicht verarbeitet werden, da der Zahlungspflichtige das Bankkonto gewechselt hat`,
                reimbursementDelayed: `hat die Zahlung verarbeitet, aber sie verzögert sich um weitere 1–2 Werktage`,
                selectedForRandomAudit: `zufällig zur Überprüfung ausgewählt`,
                selectedForRandomAuditMarkdown: `zufällig zur Überprüfung [ausgewählt](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule)`,
                share: ({to}: ShareParams) => `Mitglied ${to} eingeladen`,
                unshare: ({to}: UnshareParams) => `Mitglied ${to} entfernt`,
                stripePaid: (amount: string, currency: string) => `bezahlt: ${currency}${amount}`,
                takeControl: `Kontrolle übernommen`,
                integrationSyncFailed: (label: string, errorMessage: string, workspaceAccountingLink?: string) =>
                    `Beim Synchronisieren mit ${label}${errorMessage ? ` ("${errorMessage}")` : ''} ist ein Problem aufgetreten. Bitte behebe das Problem in den <a href="${workspaceAccountingLink}">Workspace-Einstellungen</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `Die Verbindung für ${feedName} ist unterbrochen. Um Kartenimporte wiederherzustellen, <a href='${workspaceCompanyCardRoute}'>melden Sie sich bei Ihrer Bank an</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `Die Plaid-Verbindung zu Ihrem Geschäftskonto ist unterbrochen. Bitte <a href='${walletRoute}'>verbinden Sie Ihr Bankkonto ${maskedAccountNumber} erneut</a>, damit Sie Ihre Expensify Karten weiterhin verwenden können.`,
                addEmployee: (email: string, role: string, didJoinPolicy?: boolean) =>
                    didJoinPolicy ? `${email} ist über den Arbeitsbereichs-Einladungslink beigetreten` : `${email} als ${role === 'member' ? 'a' : 'an'} ${role} hinzugefügt`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `hat die Rolle von ${email} in ${newRole} geändert (zuvor ${currentRole})`,
                updatedCustomField1: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `Benutzerdefiniertes Feld 1 von ${email} entfernt (zuvor „${previousValue}“)`;
                    }
                    return !previousValue
                        ? `„${newValue}“ zu benutzerdefiniertem Feld 1 von ${email} hinzugefügt`
                        : `benutzerdefiniertes Feld 1 von ${email} auf „${newValue}“ geändert (zuvor „${previousValue}“)`;
                },
                updatedCustomField2: (email: string, newValue: string, previousValue: string) => {
                    if (!newValue) {
                        return `benutzerdefiniertes Feld 2 von ${email} entfernt (vorher „${previousValue}“)`;
                    }
                    return !previousValue
                        ? `„${newValue}“ zu benutzerdefiniertem Feld 2 von ${email} hinzugefügt`
                        : `benutzerdefiniertes Feld 2 von ${email} auf „${newValue}“ geändert (zuvor „${previousValue}“)`;
                },
                leftWorkspace: (nameOrEmail: string) => `${nameOrEmail} hat den Arbeitsbereich verlassen`,
                removeMember: (email: string, role: string) => `${role} ${email} entfernt`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `Verbindung zu ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} entfernt`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `verbunden mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'hat den Chat verlassen',
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `Das Geschäftskonto ${maskedBankAccountNumber} wurde aufgrund eines Problems mit entweder der Erstattung oder dem Ausgleich der Expensify Karte automatisch gesperrt. Bitte beheben Sie das Problem in Ihren <a href="${linkURL}">Workspace-Einstellungen</a>.`,
                leftTheChatWithName: (nameOrEmail: string) => `${nameOrEmail ? `${nameOrEmail}: ` : ''} hat den Chat verlassen`,
                actionableCard3DSTransactionApproval: (amount: string, merchant: string | undefined) => {
                    const amountAndMerchantText = [amount, merchant].filter((s) => !!s?.length).join(' ');
                    return `Öffne die Expensify Mobile-App, um deine${amountAndMerchantText ? ` ${amountAndMerchantText}-` : ' '}Transaktion zu prüfen`;
                },
            },
            error: {
                invalidCredentials: 'Ungültige Anmeldedaten, bitte überprüfen Sie die Konfiguration Ihrer Verbindung.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: (summary: string, dayCount: number, date: string) => `${summary} für ${dayCount} ${dayCount === 1 ? 'Tag' : 'Tage'} bis ${date}`,
        oooEventSummaryPartialDay: (summary: string, timePeriod: string, date: string) => `${summary} von ${timePeriod} am ${date}`,
    },
    footer: {
        features: 'Funktionen',
        expenseManagement: 'Ausgabenverwaltung',
        spendManagement: 'Ausgabenverwaltung',
        expenseReports: 'Spesenabrechnungen',
        companyCreditCard: 'Firmenkreditkarte',
        receiptScanningApp: 'Belegerfassungs-App',
        billPay: 'Rechnungszahlung',
        invoicing: 'Rechnungsstellung',
        CPACard: 'CPA-Karte',
        payroll: 'Lohn- und Gehaltsabrechnung',
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
        navigateToChatsList: 'Zurück zur Chatliste navigieren',
        chatWelcomeMessage: 'Chat-Begrüßungsnachricht',
        navigatesToChat: 'Navigiert zu einem Chat',
        newMessageLineIndicator: 'Anzeige für neue Nachrichtenzeile',
        chatMessage: 'Chatnachricht',
        lastChatMessagePreview: 'Vorschau der letzten Chatnachricht',
        workspaceName: 'Arbeitsbereichsname',
        chatUserDisplayNames: 'Anzeigenamen von Chatmitgliedern',
        scrollToNewestMessages: 'Zu neuesten Nachrichten scrollen',
        preStyledText: 'Vorgestylter Text',
        viewAttachment: 'Anhang anzeigen',
        contextMenuAvailable: 'Kontextmenü verfügbar. Drücken Sie Shift+F10, um es zu öffnen.',
        contextMenuAvailableMacOS: 'Kontextmenü verfügbar. Drücken Sie VO-Shift-M, um es zu öffnen.',
        contextMenuAvailableNative: 'Kontextmenü verfügbar. Doppeltippen und halten, um es zu öffnen.',
        selectAllFeatures: 'Alle Funktionen auswählen',
        selectAllTransactions: 'Alle Transaktionen auswählen',
        selectAllItems: 'Alle Einträge auswählen',
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
        qrCode: 'QR-Code',
        copy: 'URL kopieren',
        copied: 'Kopiert!',
    },
    moderation: {
        flagDescription: 'Alle markierten Nachrichten werden zur Überprüfung an eine Moderation gesendet.',
        chooseAReason: 'Wähle unten einen Grund für die Meldung aus:',
        spam: 'Spam',
        spamDescription: 'Unerbetene themenfremde Werbung',
        inconsiderate: 'Rücksichtslos',
        inconsiderateDescription: 'Beleidigende oder respektlose Formulierung mit fragwürdigen Absichten',
        intimidation: 'Einschüchterung',
        intimidationDescription: 'Aggressives Verfolgen einer Agenda trotz berechtigter Einwände',
        bullying: 'Mobbing',
        bullyingDescription: 'Eine einzelne Person ins Visier nehmen, um Gehorsam zu erzwingen',
        harassment: 'Belästigung',
        harassmentDescription: 'Rassistisches, frauenfeindliches oder anderweitig diskriminierendes Verhalten',
        assault: 'Angriff',
        assaultDescription: 'Gezielter emotionaler Angriff mit der Absicht, Schaden zuzufügen',
        flaggedContent: 'Diese Nachricht wurde als Verstoß gegen unsere Community-Regeln markiert und der Inhalt wurde ausgeblendet.',
        hideMessage: 'Nachricht ausblenden',
        revealMessage: 'Nachricht anzeigen',
        levelOneResult: 'Sendet anonyme Warnung und Nachricht wird zur Überprüfung gemeldet.',
        levelTwoResult: 'Nachricht im Kanal verborgen, anonyme Warnung hinzugefügt und Nachricht zur Überprüfung gemeldet.',
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
        categorize: 'Kategorisieren',
        share: 'Mit meinem Steuerberater teilen',
        nothing: 'Im Moment nichts',
    },
    teachersUnitePage: {
        teachersUnite: 'Lehrkräfte vereint',
        joinExpensifyOrg:
            'Schließ dich Expensify.org an, um Ungerechtigkeit auf der ganzen Welt zu beseitigen. Die aktuelle „Teachers Unite“-Kampagne unterstützt Lehrkräfte überall, indem sie die Kosten für grundlegende Schulmaterialien teilt.',
        iKnowATeacher: 'Ich kenne eine Lehrkraft',
        iAmATeacher: 'Ich bin Lehrer',
        getInTouch: 'Ausgezeichnet! Bitte teile ihre Kontaktdaten, damit wir sie erreichen können.',
        introSchoolPrincipal: 'Einführung für Ihre Schulleitung',
        schoolPrincipalVerifyExpense:
            'Expensify.org teilt die Kosten für grundlegende Schulmaterialien, damit Schüler*innen aus einkommensschwachen Haushalten besser lernen können. Ihre Schulleitung wird gebeten, Ihre Ausgaben zu bestätigen.',
        principalFirstName: 'Vorname der hauptverantwortlichen Person',
        principalLastName: 'Nachname der Hauptansprechperson',
        principalWorkEmail: 'Hauptdienst-E-Mail',
        updateYourEmail: 'Aktualisiere deine E-Mail-Adresse',
        updateEmail: 'E-Mail-Adresse aktualisieren',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Bevor du fortfährst, stelle bitte sicher, dass deine Schul-E-Mail als deine standardmäßige Kontaktmethode festgelegt ist. Du kannst dies unter Einstellungen > Profil > <a href="${contactMethodsRoute}">Kontaktmethoden</a> tun.`,
        error: {
            enterPhoneEmail: 'Gib eine gültige E‑Mail-Adresse oder Telefonnummer ein',
            enterEmail: 'E-Mail eingeben',
            enterValidEmail: 'Gib eine gültige E-Mail-Adresse ein',
            tryDifferentEmail: 'Bitte versuche eine andere E-Mail-Adresse',
        },
    },
    cardTransactions: {
        notActivated: 'Nicht aktiviert',
        outOfPocket: 'Erstattungsfähig',
        companySpend: 'Nicht erstattungsfähig',
        personalCard: 'Private Karte',
        companyCard: 'Firmenkarte',
        expensifyCard: 'Expensify Karte',
    },
    distance: {
        addStop: 'Stopp hinzufügen',
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
            startMessageWeb: 'Füge ein Foto deines Kilometerzählers vom <strong>Beginn</strong> deiner Fahrt hinzu. Ziehe eine Datei hierher oder wähle eine zum Hochladen aus.',
            endMessageWeb: 'Fügen Sie ein Foto Ihres Kilometerzählers vom <strong>Ende</strong> Ihrer Fahrt hinzu. Ziehen Sie eine Datei hierher oder wählen Sie eine zum Hochladen aus.',
            startTitle: 'Foto des Kilometerzähler-Starts',
            endTitle: 'Kilometerzähler-Endfoto',
            deleteOdometerPhoto: 'Kilometerzähler-Foto löschen',
            deleteOdometerPhotoConfirmation: 'Möchtest du dieses Kilometerzählerfoto wirklich löschen?',
            cameraAccessRequired: 'Für das Aufnehmen von Bildern ist der Kamerazugriff erforderlich.',
            snapPhotoStart: '<muted-text-label>Machen Sie zu <strong>Beginn</strong> Ihrer Fahrt ein Foto von Ihrem Kilometerzähler.</muted-text-label>',
            snapPhotoEnd: '<muted-text-label>Machen Sie ein Foto von Ihrem Kilometerzähler am <strong>Ende</strong> Ihrer Fahrt.</muted-text-label>',
        },
    },
    gps: {
        error: {
            failedToStart: 'Standortverfolgung konnte nicht gestartet werden.',
            failedToGetPermissions: 'Erforderliche Standortberechtigungen konnten nicht abgerufen werden.',
        },
        trackingDistance: 'Entfernung wird erfasst …',
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
            prompt: 'Bist du sicher? Dadurch wird dein aktueller Ablauf verworfen und das kann nicht rückgängig gemacht werden.',
            confirm: 'Entfernungsverfolgung verwerfen',
        },
        zeroDistanceTripModal: {
            title: 'Ausgabe kann nicht erstellt werden',
            prompt: 'Sie können keine Ausgabe mit demselben Start- und Zielort erstellen.',
        },
        locationRequiredModal: {
            title: 'Standortzugriff erforderlich',
            prompt: 'Bitte erlaube den Standortzugriff in den Einstellungen deines Geräts, um die GPS‑Streckenverfolgung zu starten.',
            allow: 'Zulassen',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Standortzugriff im Hintergrund erforderlich',
            prompt: 'Bitte erlaube in den Geräteeinstellungen den Zugriff auf deinen Standort im Hintergrund (Option „Immer zulassen“), um die GPS-Distanzverfolgung zu starten.',
        },
        preciseLocationRequiredModal: {
            title: 'Genaue Standortangabe erforderlich',
            prompt: 'Bitte aktiviere in den Einstellungen deines Geräts die Option „Genauer Standort“, um die GPS‑Streckenverfolgung zu starten.',
        },
        desktop: {
            title: 'Strecke auf deinem Handy verfolgen',
            subtitle: 'Streckenkilometer automatisch per GPS erfassen und Fahrten sofort in Ausgaben umwandeln.',
            button: 'App herunterladen',
        },
        notification: {
            title: 'GPS-Tracking läuft',
            body: 'Gehe zur App, um abzuschließen',
        },
        continueGpsTripModal: {
            title: 'GPS-Fahrtaufzeichnung fortsetzen?',
            prompt: 'Es sieht so aus, als ob die App während deiner letzten GPS-Fahrt geschlossen wurde. Möchtest du die Aufzeichnung dieser Fahrt fortsetzen?',
            confirm: 'Reise fortsetzen',
            cancel: 'Reise anzeigen',
        },
        signOutWarningTripInProgress: {
            title: 'GPS-Tracking läuft',
            prompt: 'Bist du sicher, dass du die Reise verwerfen und dich abmelden möchtest?',
            confirm: 'Verwerfen und abmelden',
        },
        switchToODWarningTripInProgress: {
            title: 'GPS-Tracking läuft',
            prompt: 'Sind Sie sicher, dass Sie die GPS-Verfolgung beenden und zu Expensify Classic wechseln möchten?',
            confirm: 'Anhalten und wechseln',
        },
        switchAccountWarningTripInProgress: {
            title: 'GPS-Tracking läuft',
            prompt: 'Sind Sie sicher, dass Sie die GPS-Verfolgung beenden und das Konto wechseln möchten?',
            confirm: 'Anhalten und wechseln',
        },
        locationServicesRequiredModal: {
            title: 'Standortzugriff erforderlich',
            confirm: 'Einstellungen öffnen',
            prompt: 'Bitte erlaube den Standortzugriff in den Einstellungen deines Geräts, um die GPS‑Streckenverfolgung zu starten.',
        },
        gpsFloatingPillText: 'GPS-Verfolgung läuft...',
        liveActivity: {subtitle: 'Entfernungserfassung', button: 'Fortschritt anzeigen'},
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Zeugnis verloren oder beschädigt',
        nextButtonLabel: 'Weiter',
        reasonTitle: 'Warum benötigen Sie eine neue Karte?',
        cardDamaged: 'Meine Karte wurde beschädigt',
        cardLostOrStolen: 'Meine Karte wurde verloren oder gestohlen',
        confirmAddressTitle: 'Bitte bestätigen Sie die Postanschrift für Ihre neue Karte.',
        cardDamagedInfo: 'Ihre neue Karte kommt in 2–3 Werktagen an. Ihre aktuelle Karte funktioniert weiter, bis Sie Ihre neue Karte aktivieren.',
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
        guaranteed: 'Garantierte eQuittung',
        transactionDate: 'Transaktionsdatum',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Beginne einen Chat, <success><strong>empfiehl eine:n Freund:in</strong></success>.',
            header: 'Chat starten, Freund empfehlen',
            closeAccessibilityLabel: 'Schließen, einen Chat starten, einen Freund empfehlen, Banner',
            body: 'Möchtest du, dass deine Freund*innen Expensify auch nutzen? Starte einfach einen Chat mit ihnen, und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Reiche eine Ausgabe ein, <success><strong>wirb dein Team</strong></success>.',
            header: 'Reiche eine Ausgabe ein, wirb dein Team an',
            closeAccessibilityLabel: 'Schließen, eine Ausgabe einreichen, dein Team einladen, Banner',
            body: 'Möchtest du, dass dein Team Expensify auch nutzt? Reiche ihnen einfach eine Ausgabe ein und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Eine:n Freund:in empfehlen',
            body: 'Möchtest du, dass deine Freunde Expensify auch nutzen? Chatte einfach mit ihnen, bezahle oder teile eine Ausgabe – wir kümmern uns um den Rest. Oder teile einfach deinen Einladungslink!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Eine:n Freund:in empfehlen',
            header: 'Eine:n Freund:in empfehlen',
            body: 'Möchtest du, dass deine Freunde Expensify auch nutzen? Chatte einfach mit ihnen, bezahle oder teile eine Ausgabe – wir kümmern uns um den Rest. Oder teile einfach deinen Einladungslink!',
        },
        copyReferralLink: 'Einladungslink kopieren',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chatte mit deiner Setup-Fachperson in <a href="${href}">${adminReportName}</a>, um Hilfe zu erhalten`,
        default: `Sende eine Nachricht an <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link>, um Hilfe bei der Einrichtung zu erhalten`,
    },
    violations: {
        allTagLevelsRequired: 'Alle Tags erforderlich',
        autoReportedRejectedExpense: 'Diese Ausgabe wurde abgelehnt.',
        billableExpense: 'Abrechenbar nicht mehr gültig',
        cashExpenseWithNoReceipt: (formattedLimit?: string) => `Beleg erforderlich${formattedLimit ? `über ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategorie nicht mehr gültig',
        conversionSurcharge: (surcharge: number) => `${surcharge}% Umrechnungszuschlag angewendet`,
        customUnitOutOfPolicy: 'Satz für diesen Workspace ungültig',
        duplicatedTransaction: 'Möglicherweise dupliziert',
        fieldRequired: 'Berichtsfelder sind erforderlich',
        futureDate: 'Zukünftiges Datum nicht erlaubt',
        invoiceMarkup: (invoiceMarkup: number) => `Um ${invoiceMarkup}% erhöht`,
        maxAge: (maxAge: number) => `Datum ist älter als ${maxAge} Tage`,
        missingCategory: 'Fehlende Kategorie',
        missingComment: 'Beschreibung für die ausgewählte Kategorie erforderlich',
        missingAttendees: 'Für diese Kategorie sind mehrere Teilnehmende erforderlich',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Fehlend ${tagName ?? 'Tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Betrag weicht von der berechneten Entfernung ab';
                case 'card':
                    return 'Betrag größer als Kartenumsatz';
                default:
                    if (displayPercentVariance) {
                        return `Betrag ist ${displayPercentVariance}% höher als der gescannte Beleg`;
                    }
                    return 'Betrag höher als gescannter Beleg';
            }
        },
        modifiedDate: 'Datum weicht vom gescannten Beleg ab',
        increasedDistance: ({formattedRouteDistance}: ViolationsIncreasedDistanceParams) =>
            formattedRouteDistance ? `Die Entfernung übersteigt die berechnete Route von ${formattedRouteDistance}` : 'Entfernung übersteigt die berechnete Route',
        nonExpensiworksExpense: 'Nicht-Expensiworks-Ausgabe',
        overAutoApprovalLimit: (formattedLimit: string) => `Ausgabe überschreitet das Auto-Genehmigungslimit von ${formattedLimit}`,
        overCategoryLimit: (formattedLimit: string) => `Betrag über dem Kategorie-Limit von ${formattedLimit}/Person`,
        overLimit: (formattedLimit: string) => `Betrag über dem Limit von ${formattedLimit}/Person`,
        overTripLimit: (formattedLimit: string) => `Betrag über dem Limit von ${formattedLimit}/Reise`,
        overLimitAttendee: (formattedLimit: string) => `Betrag über dem Limit von ${formattedLimit}/Person`,
        perDayLimit: (formattedLimit: string) => `Betrag über dem täglichen Kategorienlimit von ${formattedLimit}/Person`,
        receiptNotSmartScanned: 'Beleg- und Ausgabendetails manuell hinzugefügt.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Beleg erforderlich bei Überschreitung der Kategoriegrenze von ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Beleg erforderlich über ${formattedLimit}`;
            }
            if (category) {
                return `Beleg erforderlich über Kategorielimit`;
            }
            return 'Beleg erforderlich';
        },
        itemizedReceiptRequired: (formattedLimit?: string) => `Einzelpostenbeleg erforderlich${formattedLimit ? `über ${formattedLimit}` : ''}`,
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
        customRules: (message: string) => message,
        reviewRequired: 'Überprüfung erforderlich',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL, connectionLink, isPersonalCard, isMarkAsCash}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Beleg kann wegen unterbrochener Bankverbindung nicht automatisch zugeordnet werden.';
            }
            if (isPersonalCard && (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || brokenBankConnection)) {
                if (!connectionLink) {
                    return 'Beleg kann wegen unterbrochener Bankverbindung nicht automatisch zugeordnet werden.';
                }
                return isMarkAsCash
                    ? `Beleg kann wegen einer unterbrochenen Kartenverbindung nicht automatisch zugeordnet werden. Markiere ihn als Barzahlung, um ihn zu ignorieren, oder <a href="${connectionLink}">repariere die Karte</a>, um den Beleg zuzuordnen.`
                    : `Quittung kann aufgrund einer unterbrochenen Kartenverbindung nicht automatisch zugeordnet werden. <a href="${connectionLink}">Karte reparieren</a>, um die Quittung zuzuordnen.`;
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Bankverbindung unterbrochen. <a href="${companyCardPageURL}">Erneut verbinden, um Beleg zuzuordnen</a>`
                    : 'Bankverbindung unterbrochen. Bitte eine:n Admin bitten, die Verbindung wiederherzustellen, um den Beleg abzugleichen.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Bitte ${member} darum, es als Barzahlung zu markieren, oder warte 7 Tage und versuche es dann erneut` : 'Wartet auf Abgleich mit Kartentransaktion.';
            }
            return '';
        },
        brokenConnection530Error: 'Beleg ausstehend wegen unterbrochener Bankverbindung',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Beleg ausstehend wegen unterbrochener Bankverbindung. Bitte in <a href="${workspaceCompanyCardRoute}">Firmenkarten</a> beheben.</muted-text-label>`,
        memberBrokenConnectionError: 'Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung. Bitte wende dich an eine Workspace-Admin, um das Problem zu beheben.',
        markAsCashToIgnore: 'Als Barzahlung markieren, um sie zu ignorieren und Zahlung anzufordern.',
        smartscanFailed: ({canEdit = true}) => `Beleg-Scan fehlgeschlagen.${canEdit ? 'Details manuell eingeben.' : ''}`,
        receiptGeneratedWithAI: 'Mögliche KI-generierte Quittung',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Fehlende ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} nicht mehr gültig`,
        taxAmountChanged: 'Steuerbetrag wurde geändert',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Steuer'} nicht mehr gültig`,
        taxRateChanged: 'Steuersatz wurde geändert',
        taxRequired: 'Fehlender Steuersatz',
        none: 'Keine',
        taxCodeToKeep: 'Wählen Sie, welchen Steuercode Sie beibehalten möchten',
        tagToKeep: 'Wählen Sie, welches Tag beibehalten werden soll',
        isTransactionReimbursable: 'Wähle, ob die Transaktion erstattungsfähig ist',
        merchantToKeep: 'Wähle aus, welchen Händler du behalten möchtest',
        descriptionToKeep: 'Wählen Sie aus, welche Beschreibung beibehalten werden soll',
        categoryToKeep: 'Wählen Sie aus, welche Kategorie beibehalten werden soll',
        isTransactionBillable: 'Wählen, ob die Transaktion abrechenbar ist',
        keepThisOne: 'Diesen behalten',
        confirmDetails: `Bestätige die Details, die du behältst`,
        confirmDuplicatesInfo: `Die Duplikate, die du nicht behältst, werden für die einreichende Person zur Löschung zurückgehalten.`,
        hold: 'Diese Ausgabe wurde zurückgestellt',
        resolvedDuplicates: 'Duplikat behoben',
        companyCardRequired: 'Firmenkartenkäufe erforderlich',
        noRoute: 'Bitte wähle eine gültige Adresse aus',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: (fieldName: string) => `${fieldName} ist erforderlich`,
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
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ich benötige eine Funktion, die nur in Expensify Classic verfügbar ist.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Ich verstehe nicht, wie ich New Expensify verwenden soll.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Ich verstehe, wie man das neue Expensify verwendet, aber ich bevorzuge das klassische Expensify.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Welche Funktion benötigen Sie, die in New Expensify noch nicht verfügbar ist?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Was möchten Sie tun?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Warum bevorzugst du Expensify Classic?',
        },
        responsePlaceholder: 'Ihre Antwort',
        thankYou: 'Danke für das Feedback!',
        thankYouSubtitle: 'Ihre Antworten helfen uns, ein besseres Produkt zu entwickeln, mit dem Sie mehr erledigen können. Vielen Dank!',
        goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        offlineTitle: 'Sie scheinst hier festzustecken …',
        offline:
            'Sie scheinen offline zu sein. Leider funktioniert Expensify Classic nicht offline, aber New Expensify schon. Wenn Sie Expensify Classic weiter verwenden möchten, versuchen Sie es erneut, wenn Sie eine Internetverbindung haben.',
        quickTip: 'Kurzer Tipp ...',
        quickTipSubTitle: 'Du kannst direkt zu Expensify Classic gehen, indem du expensify.com besuchst. Setze ein Lesezeichen dafür, um eine schnelle Abkürzung zu haben!',
        bookACall: 'Einen Anruf buchen',
        bookACallTitle: 'Möchtest du mit einem Produktmanager sprechen?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Direktes Chatten zu Ausgaben und Berichten',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Alles mobil erledigen können',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Reisen und Ausgaben mit der Geschwindigkeit eines Chats',
        },
        bookACallTextTop: 'Wenn Sie zu Expensify Classic wechseln, verzichten Sie auf Folgendes:',
        bookACallTextBottom:
            'Wir würden uns freuen, mit Ihnen zu telefonieren, um die Gründe besser zu verstehen. Sie können einen Anruf mit einer*m unserer leitenden Produktmanager*innen buchen, um Ihre Bedürfnisse zu besprechen.',
        takeMeToExpensifyClassic: 'Bring mich zu Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Beim Laden weiterer Nachrichten ist ein Fehler aufgetreten',
        tryAgain: 'Erneut versuchen',
    },
    systemMessage: {
        mergedWithCashTransaction: 'hat eine Quittung mit dieser Transaktion abgeglichen',
    },
    subscription: {
        authenticatePaymentCard: 'Zahlungskarte authentifizieren',
        mobileReducedFunctionalityMessage: 'In der mobilen App kannst du dein Abonnement nicht ändern.',
        badge: {
            freeTrial: (numOfDays: number) => `Kostenlose Testversion: Noch ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'} übrig`,
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
                        ? `Ihre Belastung vom ${date} über ${purchaseAmountOwed} konnte nicht verarbeitet werden. Bitte fügen Sie eine Zahlungskarte hinzu, um den fälligen Betrag zu begleichen.`
                        : 'Bitte füge eine Zahlungsmethode hinzu, um den geschuldeten Betrag zu begleichen.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Ihre Zahlungsinformationen sind veraltet',
                subtitle: (date: string) => `Ihre Zahlung ist überfällig. Bitte bezahlen Sie Ihre Rechnung bis zum ${date}, um eine Unterbrechung des Dienstes zu vermeiden.`,
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
                subtitle: (cardEnding: string) => `Bitte schließen Sie den Authentifizierungsprozess ab, um Ihre Zahlungskarte mit der Endung ${cardEnding} zu aktivieren.`,
            },
            insufficientFunds: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: (amountOwed: number) =>
                    `Ihre Zahlungskarte wurde aufgrund unzureichender Deckung abgelehnt. Bitte versuchen Sie es erneut oder fügen Sie eine neue Zahlungskarte hinzu, um Ihren offenen Saldo von ${amountOwed} zu begleichen.`,
            },
            cardExpired: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: (amountOwed: number) =>
                    `Ihre Zahlungskarte ist abgelaufen. Bitte fügen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Saldo von ${amountOwed} zu begleichen.`,
            },
            cardExpireSoon: {
                title: 'Ihre Karte läuft bald ab',
                subtitle:
                    'Ihre Zahlungskarte läuft Ende dieses Monats ab. Klicken Sie unten auf das Dreipunkt-Menü, um sie zu aktualisieren und alle Ihre Lieblingsfunktionen weiterhin zu nutzen.',
            },
            retryBillingSuccess: {
                title: 'Erfolgreich!',
                subtitle: 'Ihre Karte wurde erfolgreich belastet.',
            },
            retryBillingError: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle:
                    'Bevor Sie es erneut versuchen, rufen Sie bitte direkt Ihre Bank an, um Expensify-Zahlungen zu autorisieren und eventuelle Sperren aufzuheben. Andernfalls versuchen Sie, eine andere Zahlungskarte hinzuzufügen.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Sie haben die Belastung über ${amountOwed} für die Karte mit der Endziffer ${cardEnding} angefochten. Ihr Konto bleibt gesperrt, bis die Angelegenheit mit Ihrer Bank geklärt ist.`,
            preTrial: {
                title: 'Kostenlose Testversion starten',
                subtitle: 'Als nächsten Schritt <a href="#">schließe deine Einrichtungs-Checkliste ab</a>, damit dein Team mit der Spesenerfassung beginnen kann.',
            },
            trialStarted: {
                title: (numOfDays: number) => `Testversion: Noch ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'} übrig!`,
                subtitle: 'Füge eine Zahlungskarte hinzu, um alle deine Lieblingsfunktionen weiterhin nutzen zu können.',
            },
            trialEnded: {
                title: 'Ihre kostenlose Testversion ist abgelaufen',
                subtitle: 'Füge eine Zahlungskarte hinzu, um alle deine Lieblingsfunktionen weiterhin nutzen zu können.',
            },
            earlyDiscount: {
                claimOffer: 'Angebot einlösen',
                subscriptionPageTitle: (discountType: number) =>
                    `<strong>${discountType}% Rabatt im ersten Jahr!</strong> Fügen Sie einfach eine Zahlungskarte hinzu und starten Sie ein Jahresabonnement.`,
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
            cardEnding: (cardNumber: string) => `Karte endet auf ${cardNumber}`,
            changeCard: 'Zahlungskarte ändern',
            changeCurrency: 'Zahlungswährung ändern',
            cardNotFound: 'Keine Zahlungskarte hinzugefügt',
            retryPaymentButton: 'Zahlung erneut versuchen',
            authenticatePayment: 'Zahlung authentifizieren',
            requestRefund: 'Erstattung anfordern',
            requestRefundModal: {
                full: 'Eine Rückerstattung zu erhalten ist einfach: Stufen Sie Ihr Konto einfach vor Ihrem nächsten Rechnungsdatum herab und Sie erhalten eine Rückerstattung. <br /> <br /> Hinweis: Wenn Sie Ihr Konto herabstufen, werden Ihre Arbeitsbereiche gelöscht. Diese Aktion kann nicht rückgängig gemacht werden, aber Sie können jederzeit einen neuen Arbeitsbereich erstellen, wenn Sie es sich anders überlegen.',
                confirm: 'Workspace(s) löschen und herabstufen',
            },
            viewPaymentHistory: 'Zahlungsverlauf anzeigen',
        },
        yourPlan: {
            title: 'Ihr Tarif',
            exploreAllPlans: 'Alle Tarife anzeigen',
            customPricing: 'Individuelle Preise',
            asLowAs: (price: string) => `schon ab ${price} pro aktivem Mitglied/Monat`,
            pricePerMemberMonth: (price: string) => `${price} pro Mitglied/Monat`,
            pricePerMemberPerMonth: (price: string) => `${price} pro Mitglied und Monat`,
            perMemberMonth: 'pro Mitglied/Monat',
            collect: {
                title: 'Einziehen',
                description: 'Der Kleinunternehmens-Tarif, der dir Spesen, Reisen und Chat bietet.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Karte, ${upper}/aktivem Mitglied ohne die Expensify Karte.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Karte, ${upper}/aktivem Mitglied ohne die Expensify Karte.`,
                benefit1: 'Belegerfassung',
                benefit2: 'Erstattungen',
                benefit3: 'Firmenkartenverwaltung',
                benefit4: 'Genehmigungen für Ausgaben und Reisen',
                benefit5: 'Reisebuchungen und Richtlinien',
                benefit6: 'QuickBooks-/Xero-Integrationen',
                benefit7: 'Chat über Ausgaben, Berichte und Räume',
                benefit8: 'KI- und menschlicher Support',
            },
            control: {
                title: 'Steuerung',
                description: 'Spesen, Reisen und Chat für größere Unternehmen.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Karte, ${upper}/aktivem Mitglied ohne die Expensify Karte.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Karte, ${upper}/aktivem Mitglied ohne die Expensify Karte.`,
                benefit1: 'Alles im Collect-Tarif',
                benefit2: 'Genehmigungs-Workflows mit mehreren Ebenen',
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
            saveWithExpensifyTitle: 'Sparen mit der Expensify Karte',
            saveWithExpensifyDescription: 'Verwenden Sie unseren Einsparungsrechner, um zu sehen, wie das Cashback der Expensify Karte Ihre Expensify Rechnung reduzieren kann.',
            saveWithExpensifyButton: 'Mehr erfahren',
        },
        compareModal: {
            comparePlans: 'Tarife vergleichen',
            subtitle: `<muted-text>Schalte die Funktionen frei, die du brauchst, mit dem passenden Tarif. <a href="${CONST.PRICING}">Sieh dir unsere Preisseite an</a> für eine vollständige Funktionsübersicht aller unserer Tarife.</muted-text>`,
        },
        details: {
            title: 'Abonnementdetails',
            annual: 'Jahresabonnement',
            taxExempt: 'Steuerbefreiungsstatus beantragen',
            taxExemptEnabled: 'Steuerbefreit',
            taxExemptStatus: 'Steuerbefreiungsstatus',
            payPerUse: 'Nutzungsgbühr',
            subscriptionSize: 'Abonnementgröße',
            headsUp:
                'Hinweis: Wenn du deine Abonnementgröße jetzt nicht festlegst, setzen wir sie automatisch auf die Anzahl der aktiven Mitglieder in deinem ersten Monat. Du verpflichtest dich dann, für mindestens diese Anzahl von Mitgliedern in den nächsten 12 Monaten zu zahlen. Du kannst deine Abonnementgröße jederzeit erhöhen, aber du kannst sie erst verringern, wenn dein Abonnement abgelaufen ist.',
            zeroCommitment: 'Keine Verpflichtung zum vergünstigten Jahresabonnementpreis',
        },
        subscriptionSize: {
            title: 'Abonnementgröße',
            yourSize: 'Die Größe Ihres Abonnements ist die Anzahl offener Plätze, die in einem bestimmten Monat von beliebigen aktiven Mitgliedern belegt werden können.',
            eachMonth:
                'Jeden Monat deckt Ihr Abonnement bis zu der oben festgelegten Anzahl aktiver Mitglieder ab. Jedes Mal, wenn Sie Ihre Abonnementgröße erhöhen, beginnen Sie ein neues 12-monatiges Abonnement mit dieser neuen Größe.',
            note: 'Hinweis: Ein aktives Mitglied ist jede Person, die Ausgabedaten, die mit dem Workspace Ihres Unternehmens verknüpft sind, erstellt, bearbeitet, eingereicht, genehmigt, erstattet oder exportiert hat.',
            confirmDetails: 'Bestätige die Details deines neuen Jahresabos:',
            subscriptionSize: 'Abonnementgröße',
            activeMembers: (size: number) => `${size} aktive Mitglieder/Monat`,
            subscriptionRenews: 'Abonnement verlängert sich',
            youCantDowngrade: 'Sie können Ihr Jahresabonnement während der Laufzeit nicht herabstufen.',
            youAlreadyCommitted: (size: number, date: string) =>
                `Sie haben sich bereits bis ${date} zu einem jährlichen Abonnement mit ${size} aktiven Mitgliedern pro Monat verpflichtet. Sie können am ${date} zu einem nutzungsbasierten Abonnement wechseln, indem Sie die automatische Verlängerung deaktivieren.`,
            error: {
                size: 'Bitte gib eine gültige Abonnementgröße ein',
                sameSize: 'Bitte gib eine andere Zahl als deine aktuelle Abonnementgröße ein',
            },
        },
        paymentCard: {
            addPaymentCard: 'Zahlungskarte hinzufügen',
            enterPaymentCardDetails: 'Gib deine Kartenzahlungsdaten ein',
            security: 'Expensify ist PCI-DSS-konform, verwendet eine Verschlüsselung auf Bankniveau und setzt redundante Infrastruktur ein, um Ihre Daten zu schützen.',
            learnMoreAboutSecurity: 'Erfahren Sie mehr über unsere Sicherheit.',
        },
        expensifyCode: {
            title: 'Expensify-Code',
            discountCode: 'Rabattcode',
            enterCode: 'Geben Sie einen Expensify-Code ein, um ihn auf Ihr Abonnement anzuwenden.',
            discountMessage: (promoDiscount: string, validBillingCycles: string) =>
                `Du erhältst ${promoDiscount}% Rabatt auf deine nächsten ${validBillingCycles ? `${validBillingCycles} ` : ''}Abrechnungen.`,
            apply: 'Anwenden',
            error: {
                invalid: 'Dieser Code ist ungültig',
            },
        },
        subscriptionSettings: {
            title: 'Abonnementeinstellungen',
            summary: (subscriptionType: string, subscriptionSize: string, expensifyCode: string, autoRenew: string, autoIncrease: string) =>
                `Abonnementstyp: ${subscriptionType}, Abonnementgröße: ${subscriptionSize}${expensifyCode ? `, Expensify-Code: ${expensifyCode}` : ''}, Automatische Verlängerung: ${autoRenew}, Automatische jährliche Sitzplatzerhöhung: ${autoIncrease}`,
            none: 'keine',
            on: 'an',
            off: 'aus',
            annual: 'Jährlich',
            autoRenew: 'Automatisch verlängern',
            autoIncrease: 'Jährliche Plätze automatisch erhöhen',
            saveUpTo: (amountWithCurrency: string) => `Spare bis zu ${amountWithCurrency}/Monat pro aktivem Mitglied`,
            automaticallyIncrease:
                'Erhöhe deine jährlichen Plätze automatisch, um aktive Mitglieder zu berücksichtigen, die deine Abonnementgröße überschreiten. Hinweis: Dadurch wird das Enddatum deines Jahresabonnements verlängert.',
            disableAutoRenew: 'Automatische Verlängerung deaktivieren',
            helpUsImprove: 'Hilf uns, Expensify zu verbessern',
            whatsMainReason: 'Was ist der Hauptgrund, warum du die automatische Verlängerung deaktivierst?',
            renewsOn: (date: string) => `Verlängert sich am ${date}.`,
            pricingConfiguration: 'Die Preise hängen von der Konfiguration ab. Wählen Sie für den niedrigsten Preis ein Jahresabonnement und nutzen Sie die Expensify Karte.',
            learnMore: (hasAdminsRoom: boolean) =>
                `<muted-text>Erfahre mehr auf unserer <a href="${CONST.PRICING}">Preisseite</a> oder chatte mit unserem Team in deinem ${hasAdminsRoom ? `<a href="adminsRoom">#admins-Raum.</a>` : '#admins-Raum.'}</muted-text>`,
            estimatedPrice: 'Geschätzter Preis',
            changesBasedOn: 'Dies ändert sich basierend auf Ihrer Nutzung der Expensify Karte und den untenstehenden Abooptionen.',
            collectBillingDescription: 'Collect-Arbeitsbereiche werden monatlich pro Mitglied ohne jährliche Verpflichtung abgerechnet.',
            pricing: 'Preise',
        },
        requestEarlyCancellation: {
            title: 'Frühzeitige Kündigung anfordern',
            subtitle: 'Was ist der Hauptgrund, warum du eine vorzeitige Kündigung beantragst?',
            subscriptionCanceled: {
                title: 'Abonnement gekündigt',
                subtitle: 'Dein Jahresabonnement wurde gekündigt.',
                info: 'Wenn du deine(n) Arbeitsbereich(e) weiterhin nutzungsbasiert bezahlen möchtest, bist du startklar.',
                preventFutureActivity: (workspacesListRoute: string) =>
                    `Wenn du zukünftige Aktivitäten und Gebühren verhindern möchtest, musst du deinen <a href="${workspacesListRoute}">Workspace bzw. deine Workspaces löschen</a>. Bitte beachte, dass dir beim Löschen deines Workspace bzw. deiner Workspaces alle ausstehenden Aktivitäten in Rechnung gestellt werden, die im aktuellen Kalendermonat angefallen sind.`,
            },
            requestSubmitted: {
                title: 'Anfrage gesendet',
                subtitle:
                    'Danke, dass du uns mitgeteilt hast, dass du dein Abonnement kündigen möchtest. Wir prüfen deine Anfrage und melden uns in Kürze über deinen Chat mit <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Mit dem Antrag auf vorzeitige Kündigung erkenne ich an und stimme zu, dass Expensify gemäß den Expensify-<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Nutzungsbedingungen</a> oder einer sonstigen anwendbaren Servicevereinbarung zwischen mir und Expensify nicht verpflichtet ist, einem solchen Antrag stattzugeben, und dass Expensify das alleinige Ermessen in Bezug auf die Genehmigung eines solchen Antrags behält.`,
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
        updateRoomDescription: 'setze die Raum­beschreibung auf:',
        clearRoomDescription: 'hat die Raumbeschreibung gelöscht',
        changedRoomAvatar: 'hat den Raum-Avatar geändert',
        removedRoomAvatar: 'hat den Raum-Avatar entfernt',
    },
    delegate: {
        switchAccount: 'Konten wechseln:',
        copilotDelegatedAccess: 'Copilot: Delegierter Zugriff',
        copilotDelegatedAccessDescription: 'Anderen Mitgliedern erlauben, auf dein Konto zuzugreifen.',
        learnMoreAboutDelegatedAccess: 'Mehr über delegierten Zugriff erfahren',
        addCopilot: 'Copilot hinzufügen',
        membersCanAccessYourAccount: 'Diese Mitglieder haben Zugriff auf Ihr Konto:',
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
        genericError: 'Ups, etwas ist schiefgelaufen. Bitte versuche es noch einmal.',
        onBehalfOfMessage: (delegator: string) => `im Namen von ${delegator}`,
        accessLevel: 'Zugriffsberechtigung',
        confirmCopilot: 'Bestätige unten deine Assistenz.',
        accessLevelDescription: 'Wähle unten eine Zugriffsstufe. Sowohl Vollzugriff als auch Eingeschränkter Zugriff ermöglichen es Copilots, alle Unterhaltungen und Ausgaben zu sehen.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Einem anderen Mitglied erlauben, in deinem Konto alle Aktionen in deinem Namen durchzuführen. Umfasst Chat, Einreichungen, Genehmigungen, Zahlungen, Einstellungsaktualisierungen und mehr.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Einem anderen Mitglied erlauben, die meisten Aktionen in deinem Konto in deinem Namen durchzuführen. Genehmigungen, Zahlungen, Ablehnungen und Sperren sind ausgeschlossen.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copilot entfernen',
        removeCopilotConfirmation: 'Sind Sie sicher, dass Sie diesen Copilot entfernen möchten?',
        changeAccessLevel: 'Zugriffsebene ändern',
        makeSureItIsYou: 'Stellen wir sicher, dass du es bist',
        enterMagicCode: (contactMethod: string) =>
            `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um eine:n Copilot:in hinzuzufügen. Er sollte innerhalb ein bis zwei Minuten ankommen.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um deinen Copilot zu aktualisieren.`,
        notAllowed: 'Nicht so schnell ...',
        noAccessMessage: dedent(`
            Als Copilot hast du keinen Zugriff auf diese Seite. Entschuldigung!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `Als <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">Copilot</a> von ${accountOwnerEmail} hast du keine Berechtigung, diese Aktion auszuführen. Entschuldigung!`,
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
            pinnedByUser: 'Von Mitglied angeheftet',
            hasIOUViolations: 'Hat IOU-Verstöße',
            hasAddWorkspaceRoomErrors: 'Hat Fehler beim Hinzufügen des Arbeitsbereichsraums',
            isUnread: 'Ist ungelesen (Fokusmodus)',
            isArchived: 'Ist archiviert (neuester Modus)',
            isSelfDM: 'Ist Selbst-DM',
            isFocused: 'Ist vorübergehend fokussiert',
        },
        reasonGBR: {
            hasJoinRequest: 'Hat Beitrittsanfrage (Adminraum)',
            isUnreadWithMention: 'Ist ungelesen mit Erwähnung',
            isWaitingForAssigneeToCompleteAction: 'Wartet darauf, dass die zuständige Person die Aktion ausführt',
            hasChildReportAwaitingAction: 'Hat untergeordneten Bericht mit ausstehender Aktion',
            hasMissingInvoiceBankAccount: 'Hat fehlendes Rechnungskonto für Banküberweisung',
            hasUnresolvedCardFraudAlert: 'Hat eine nicht gelöste Kartenbetrugswarnung',
            hasDEWApproveFailed: 'DEW-Genehmigung fehlgeschlagen',
        },
        reasonRBR: {
            hasErrors: 'Hat Fehler in den Bericht- oder Berichtaktionsdaten',
            hasViolations: 'Hat Verstöße',
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
            theresAProblemWithAWorkspace: 'Es gibt ein Problem mit einem Arbeitsbereich',
            theresAProblemWithYourReimbursementAccount: 'Es gibt ein Problem mit deinem Erstattungskonto',
            theresABillingProblemWithYourSubscription: 'Es gibt ein Abrechnungsproblem mit deinem Abonnement',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Dein Abonnement wurde erfolgreich verlängert',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Während der Synchronisierung der Workspace-Verbindung ist ein Problem aufgetreten',
            theresAProblemWithYourWallet: 'Es gibt ein Problem mit deinem Wallet',
            theresAProblemWithYourWalletTerms: 'Es gibt ein Problem mit deinen Wallet-Bedingungen',
            aBankAccountIsLocked: 'Ein Bankkonto ist gesperrt',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Mach eine Probefahrt',
    },
    migratedUserWelcomeModal: {
        title: 'Willkommen bei New Expensify!',
        subtitle: 'Es enthält alles, was du an unserem klassischen Erlebnis liebst, plus jede Menge Upgrades, die dein Leben noch einfacher machen:',
        confirmText: 'Los geht’s!',
        helpText: '2-min-Demo testen',
        features: {
            search: 'Leistungsstärkere Suche auf Mobilgerät, Web und Desktop',
            concierge: 'Integrierte Concierge-AI zur Automatisierung Ihrer Ausgaben',
            chat: 'Bei jeder Ausgabe chatten, um Fragen schnell zu klären',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '<tooltip>Beginne <strong>hier!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Benenne deine gespeicherten Suchen um</strong> – hier!</tooltip>',
        accountSwitcher: '<tooltip>Greifen Sie hier auf Ihre <strong>Copilot-Konten</strong> zu</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Scanne unseren Testbeleg</strong>, um zu sehen, wie es funktioniert!</tooltip>',
            manager: '<tooltip>Wähle unseren <strong>Testmanager</strong>, um es auszuprobieren!</tooltip>',
            confirmation: '<tooltip>Jetzt <strong>reiche deine Ausgabe ein</strong> und sieh zu, wie die Magie passiert!</tooltip>',
            tryItOut: 'Probiere es aus',
        },
        outstandingFilter: '<tooltip>Nach Ausgaben filtern,\ndie <strong>genehmigt werden müssen</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Sende diese Quittung, um\n<strong>die Probefahrt abzuschließen!</strong></tooltip>',
        gpsTooltip: '<tooltip>GPS-Tracking läuft! Wenn du fertig bist, stoppe die Aufzeichnung unten.</tooltip>',
        hasFilterNegation: '<tooltip>Suchen Sie nach Ausgaben ohne Belege mit <strong>-has:receipt</strong>.</tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Änderungen verwerfen?',
        body: 'Möchtest du die von dir vorgenommenen Änderungen wirklich verwerfen?',
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
            description: 'Stell sicher, dass die Details unten für dich gut aussehen. Sobald du den Anruf bestätigst, senden wir dir eine Einladung mit weiteren Informationen.',
            setupSpecialist: 'Ihre*e*r Einrichtungsspezialist*in',
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
        submittedExpensesDescription: 'Diese Ausgaben wurden an Ihre*n Genehmiger*in gesendet, können aber noch bearbeitet werden, bis sie genehmigt sind.',
        pendingExpensesTitle: 'Ausstehende Ausgaben wurden verschoben',
        pendingExpensesDescription: 'Alle ausstehenden Kartenausgaben wurden in einen separaten Bericht verschoben, bis sie gebucht werden.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Mach eine 2-minütige Probefahrt',
        },
        modal: {
            title: 'Probier uns aus',
            description: 'Machen Sie eine kurze Produkttour, um sich schnell zurechtzufinden.',
            confirmText: 'Testversion starten',
            helpText: 'Überspringen',
            employee: {
                description:
                    '<muted-text>Verschaffe deinem Team <strong>3 kostenlose Monate Expensify!</strong> Gib unten einfach die E-Mail-Adresse deiner oder deines Vorgesetzten ein und sende eine Testausgabe.</muted-text>',
                email: 'Gib die E-Mail-Adresse deiner Chefin/deines Chefs ein',
                error: 'Dieses Mitglied besitzt einen Arbeitsbereich, bitte gib ein neues Mitglied zum Testen ein.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Du testest Expensify gerade ausprobieren',
            readyForTheRealThing: 'Bereit für das Richtige?',
            getStarted: 'Loslegen',
        },
        employeeInviteMessage: (name: string) => `# ${name} hat dich eingeladen, Expensify zu testen
Hey! Ich habe gerade für uns *3 kostenlose Monate* bekommen, um Expensify zu testen – die schnellste Art, Spesen abzurechnen.

Hier ist ein *Testbeleg*, um dir zu zeigen, wie es funktioniert:`,
    },
    export: {
        basicExport: 'Standardexport',
        reportLevelExport: 'Alle Daten – Berichtsebene',
        expenseLevelExport: 'Alle Daten – Ausgabenebene',
        exportInProgress: 'Export wird ausgeführt',
        conciergeWillSend: 'Concierge wird dir die Datei in Kürze senden.',
    },
    domain: {
        notVerified: 'Nicht verifiziert',
        retry: 'Wiederholen',
        verifyDomain: {
            title: 'Domain bestätigen',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Bevor du fortfährst, bestätige, dass du <strong>${domainName}</strong> besitzt, indem du seine DNS-Einstellungen aktualisierst.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Greife auf deinen DNS-Anbieter zu und öffne die DNS-Einstellungen für <strong>${domainName}</strong>.`,
            addTXTRecord: 'Fügen Sie den folgenden TXT-Eintrag hinzu:',
            saveChanges: 'Änderungen speichern und hierher zurückkehren, um Ihre Domain zu verifizieren.',
            youMayNeedToConsult: `Möglicherweise müssen Sie die IT-Abteilung Ihrer Organisation hinzuziehen, um die Verifizierung abzuschließen. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Weitere Informationen</a>.`,
            warning: 'Nach der Verifizierung erhalten alle Expensify-Mitglieder in Ihrer Domain eine E-Mail, dass ihre Konten unter Ihrer Domain verwaltet werden.',
            codeFetchError: 'Bestätigungscode konnte nicht abgerufen werden',
            genericError: 'Wir konnten Ihre Domain nicht verifizieren. Bitte versuchen Sie es erneut und wenden Sie sich an Concierge, wenn das Problem weiterhin besteht.',
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
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML-SSO</a> ist eine Sicherheitsfunktion, mit der Sie besser steuern können, wie sich Mitglieder mit <strong>${domainName}</strong>-E-Mails bei Expensify anmelden. Um sie zu aktivieren, müssen Sie sich als autorisierte*r Unternehmensadministrator*in verifizieren.</muted-text>`,
            fasterAndEasierLogin: 'Schnelleres und einfacheres Anmelden',
            moreSecurityAndControl: 'Mehr Sicherheit und Kontrolle',
            onePasswordForAnything: 'Ein Passwort für alles',
        },
        goToDomain: 'Zur Domain wechseln',
        samlLogin: {
            title: 'SAML-Anmeldung',
            subtitle: `<muted-text>Mitgliedsanmeldung mit <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO)</a> einrichten.</muted-text>`,
            enableSamlLogin: 'SAML-Anmeldung aktivieren',
            allowMembers: 'Mitgliedern die Anmeldung mit SAML ermöglichen.',
            requireSamlLogin: 'SAML-Anmeldung erforderlich',
            anyMemberWillBeRequired: 'Alle Mitglieder, die sich mit einer anderen Methode angemeldet haben, müssen sich über SAML erneut authentifizieren.',
            enableError: 'SAML-Aktivierungseinstellung konnte nicht aktualisiert werden',
            requireError: 'SAML-Anforderungseinstellung konnte nicht aktualisiert werden',
            disableSamlRequired: 'Deaktivierung von SAML erforderlich',
            oktaWarningPrompt: 'Bist du sicher? Dadurch wird auch Okta SCIM deaktiviert.',
            requireWithEmptyMetadataError: 'Bitte fügen Sie unten die Metadaten des Identitätsanbieters hinzu, um dies zu aktivieren',
            pleaseDisableTwoFactorAuth: (twoFactorAuthSettingsUrl: string) =>
                `<muted-text>Bitte deaktiviere <a href="${twoFactorAuthSettingsUrl}">Zwei-Faktor-Authentifizierung erzwingen</a>, um die SAML-Anmeldung zu aktivieren.</muted-text>`,
        },
        samlConfigurationDetails: {
            title: 'SAML-Konfigurationsdetails',
            subtitle: 'Verwende diese Angaben, um SAML einzurichten.',
            identityProviderMetadata: 'Metadaten des Identitätsanbieters',
            entityID: 'Entitäts-ID',
            nameIDFormat: 'Name-ID-Format',
            loginUrl: 'Login-URL',
            acsUrl: 'ACS-URL (Assertion Consumer Service)',
            logoutUrl: 'Logout-URL',
            sloUrl: 'SLO-URL (Single Logout)',
            serviceProviderMetaData: 'Service-Provider-Metadaten',
            oktaScimToken: 'Okta-SCIM-Token',
            revealToken: 'Token anzeigen',
            fetchError: 'SAML-Konfigurationsdetails konnten nicht abgerufen werden',
            setMetadataGenericError: 'SAML-Metadaten konnten nicht festgelegt werden',
        },
        accessRestricted: {
            title: 'Zugriff eingeschränkt',
            subtitle: (domainName: string) =>
                `Bitte bestätigen Sie sich als autorisierte/r Firmenadministrator/in für <strong>${domainName}</strong>, wenn Sie die Kontrolle über Folgendes benötigen:`,
            companyCardManagement: 'Firmenkartenverwaltung',
            accountCreationAndDeletion: 'Kontoerstellung und -löschung',
            workspaceCreation: 'Bereichserstellung',
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
            title: 'Erhöhte Sicherheit',
            subtitle: 'Mitglieder Ihrer Domain verpflichten, sich über Single Sign-On anzumelden, die Erstellung von Workspaces einschränken und mehr.',
            enable: 'Aktivieren',
        },
        domainAdmins: 'Domain-Admins',
        admins: {
            title: 'Admins',
            findAdmin: 'Admin finden',
            primaryContact: 'Hauptansprechperson',
            addPrimaryContact: 'Hauptkontakt hinzufügen',
            setPrimaryContactError: 'Primären Kontakt konnte nicht festgelegt werden. Bitte versuche es später erneut.',
            consolidatedDomainBilling: 'Konsolidierte Domain-Abrechnung',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Wenn diese Option aktiviert ist, bezahlt die primäre Kontaktperson alle Workspaces, die Mitgliedern von <strong>${domainName}</strong> gehören, und erhält alle Abrechnungsbelege.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'Die konsolidierte Domain-Abrechnung konnte nicht geändert werden. Bitte versuchen Sie es später noch einmal.',
            addAdmin: 'Admin hinzufügen',
            addAdminError: 'Dieses Mitglied kann nicht als Admin hinzugefügt werden. Bitte versuche es erneut.',
            revokeAdminAccess: 'Adminzugriff widerrufen',
            cantRevokeAdminAccess: 'Adminzugriff kann beim technischen Kontakt nicht widerrufen werden',
            error: {
                removeAdmin: 'Dieser Benutzer kann nicht als Admin entfernt werden. Bitte versuche es erneut.',
                removeDomain: 'Diese Domain kann nicht entfernt werden. Bitte versuche es erneut.',
                removeDomainNameInvalid: 'Bitte geben Sie Ihren Domainnamen ein, um ihn zurückzusetzen.',
            },
            resetDomain: 'Domain zurücksetzen',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Bitte gib zur Bestätigung des Zurücksetzens der Domain <strong>${domainName}</strong> ein.`,
            enterDomainName: 'Gib hier deinen Domainnamen ein',
            resetDomainInfo: `Diese Aktion ist <strong>dauerhaft</strong> und die folgenden Daten werden gelöscht: <br/> <bullet-list><bullet-item>Firmenkartenzugänge und alle nicht eingereichten Ausgaben dieser Karten</bullet-item><bullet-item>SAML- und Gruppeneinstellungen</bullet-item></bullet-list> Alle Konten, Workspaces, Berichte, Ausgaben und andere Daten bleiben erhalten. <br/><br/>Hinweis: Sie können diese Domain aus Ihrer Domainliste entfernen, indem Sie die zugehörige E-Mail aus Ihren <a href="#">Kontaktmethoden</a> entfernen.`,
        },
        domainMembers: 'Domänenmitglieder',
        members: {
            title: 'Mitglieder',
            findMember: 'Mitglied finden',
            addMember: 'Mitglied hinzufügen',
            allMembers: 'Alle Mitglieder',
            email: 'E-Mail-Adresse',
            closeAccount: () => ({
                one: 'Konto schließen',
                other: 'Konten schließen',
            }),
            closeAccountPrompt: 'Bist du sicher? Diese Aktion ist dauerhaft.',
            forceCloseAccount: () => ({one: 'Konto zwangsweise schließen', other: 'Konten zwangsweise schließen'}),
            safeCloseAccount: () => ({
                one: 'Konto sicher schließen',
                other: 'Konten sicher schließen',
            }),
            closeAccountInfo: () => ({
                one: 'Wir empfehlen, das Konto sicher zu schließen, um das Schließen zu überspringen, falls Folgendes vorliegt: <bullet-list><bullet-item>Ausstehende Genehmigungen</bullet-item><bullet-item>Aktive Erstattungen</bullet-item><bullet-item>Keine alternativen Anmeldemethoden</bullet-item></bullet-list>Andernfalls können Sie die oben genannten Sicherheitsvorkehrungen ignorieren und das ausgewählte Konto zwangsweise schließen.',
                other: 'Wir empfehlen, die Konten sicher zu schließen, um das Schließen zu überspringen, falls Folgendes vorliegt: <bullet-list><bullet-item>Ausstehende Genehmigungen</bullet-item><bullet-item>Aktive Erstattungen</bullet-item><bullet-item>Keine alternativen Anmeldemethoden</bullet-item></bullet-list>Andernfalls können Sie die oben genannten Sicherheitsvorkehrungen ignorieren und die ausgewählten Konten zwangsweise schließen.',
            }),
            error: {
                removeMember: 'Dieser Benutzer kann nicht entfernt werden. Bitte versuche es erneut.',
                addMember: 'Dieses Mitglied kann nicht hinzugefügt werden. Bitte versuche es erneut.',
                vacationDelegate: 'Dieser Benutzer kann nicht als Urlaubsvertretung festgelegt werden. Bitte versuche es erneut.',
            },
            reportSuspiciousActivityPrompt: (email: string) =>
                `Bist du sicher? Dadurch wird das Konto von <strong>${email}</strong> gesperrt. <br /><br /> Unser Team wird das Konto anschließend überprüfen und unbefugten Zugriff entfernen. Um den Zugriff wiederherzustellen, muss die Person mit Concierge zusammenarbeiten.`,
            reportSuspiciousActivityConfirmationPrompt: 'Wir überprüfen das Konto, um sicherzustellen, dass es sicher entsperrt werden kann, und melden uns bei Fragen über Concierge.',
            cannotSetVacationDelegateForMember: (email: string) => `Du kannst keine Urlaubsvertretung für ${email} festlegen, weil sie derzeit die Vertretung für folgende Mitglieder sind:`,
            emptyMembers: {title: 'Keine Mitglieder in dieser Gruppe', subtitle: 'Fügen Sie ein Mitglied hinzu oder versuchen Sie, den Filter oben zu ändern.'},
        },
        common: {
            settings: 'Einstellungen',
            forceTwoFactorAuth: 'Zwei-Faktor-Authentifizierung erzwingen',
            forceTwoFactorAuthSAMLEnabledDescription: (samlPageUrl: string) =>
                `<muted-text>Bitte deaktiviere <a href="${samlPageUrl}">SAML</a>, um die Zwei-Faktor-Authentifizierung zu erzwingen.</muted-text>`,
            forceTwoFactorAuthDescription: `<muted-text>Zwei-Faktor-Authentifizierung für alle Mitglieder dieser Domain verlangen. Domänenmitglieder werden beim Anmelden aufgefordert, die Zwei-Faktor-Authentifizierung für ihr Konto einzurichten.</muted-text>`,
            forceTwoFactorAuthError: 'Die Erzwingung der Zwei-Faktor-Authentifizierung konnte nicht geändert werden. Bitte versuche es später erneut.',
            resetTwoFactorAuth: 'Zwei-Faktor-Authentifizierung zurücksetzen',
        },
        groups: {title: 'Gruppen', memberCount: () => ({one: '1 Mitglied', other: (count: number) => `${count} Mitglieder`})},
    },
    proactiveAppReview: {
        title: 'Gefällt dir das neue Expensify?',
        description: 'Lass es uns wissen, damit wir dir helfen können, deine Abrechnungserfahrung noch besser zu machen.',
        positiveButton: 'Ja!',
        negativeButton: 'Nicht wirklich',
    },
};
export default translations;
