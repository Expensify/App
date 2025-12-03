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
        // @context Used as a noun meaning a numerical total or quantity, not the verb “to count.”
        count: 'Anzahl',
        cancel: 'Abbrechen',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: 'Schließen',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: 'Fortfahren',
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
        find: 'Finden',
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
        deselect: 'Auswählen aufheben',
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
        review: (reviewParams?: ReviewParams) => `Prüfen${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Nicht',
        signIn: 'Anmelden',
        signInWithGoogle: 'Mit Google anmelden',
        signInWithApple: 'Mit Apple anmelden',
        signInWith: 'Anmelden mit',
        continue: '- Englisch\n- Spanisch\n- Deutsch\n- Französisch\n- Italienisch\n- Japanisch\n- Niederländisch\n- Polnisch\n- Portugiesisch (BR)\n- Chinesisch (vereinfacht)',
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
        here: 'hier',
        date: 'Datum',
        dob: 'Geburtsdatum',
        currentYear: 'Aktuelles Jahr',
        currentMonth: 'Laufender Monat',
        ssnLast4: 'Letzte 4 Ziffern der Sozialversicherungsnummer',
        ssnFull9: 'Vollständige 9-stellige SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Adresszeile ${lineNumber}`,
        personalAddress: 'Persönliche Adresse',
        companyAddress: 'Firmenadresse',
        noPO: 'Bitte keine Postfächer oder Maildrop-Adressen.',
        city: 'Stadt',
        state: 'Bundesland',
        streetAddress: 'Straße und Hausnummer',
        stateOrProvince: 'Bundesland / Provinz',
        country: 'Land',
        zip: 'Postleitzahl',
        zipPostCode: 'PLZ / Postleitzahl',
        whatThis: 'Was ist das?',
        iAcceptThe: 'Ich akzeptiere die',
        acceptTermsAndPrivacy: `Ich stimme den <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify-Nutzungsbedingungen</a> und der <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzrichtlinie</a> zu`,
        acceptTermsAndConditions: `Ich akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">Allgemeinen Geschäftsbedingungen</a>`,
        acceptTermsOfService: `Ich akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Nutzungsbedingungen</a>`,
        remove: 'Entfernen',
        admin: 'Administrator',
        owner: 'Inhaber',
        dateFormat: 'JJJJ-MM-TT',
        send: 'Senden',
        na: 'Nicht zutreffend',
        noResultsFound: 'Keine Ergebnisse gefunden',
        noResultsFoundMatching: (searchString: string) => `Keine Ergebnisse gefunden, die mit „${searchString}“ übereinstimmen`,
        recentDestinations: 'Zuletzt verwendete Ziele',
        timePrefix: 'Es ist',
        conjunctionFor: 'für',
        todayAt: 'Heute um',
        tomorrowAt: 'Morgen um',
        yesterdayAt: 'Gestern um',
        conjunctionAt: 'um',
        conjunctionTo: 'bis',
        genericErrorMessage: 'Ups ... etwas ist schiefgelaufen und Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es später erneut.',
        percentage: 'Prozentsatz',
        error: {
            invalidAmount: 'Ungültiger Betrag',
            acceptTerms: 'Sie müssen die Nutzungsbedingungen akzeptieren, um fortzufahren',
            phoneNumber: `Bitte gib eine vollständige Telefonnummer ein
(z. B. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Dieses Feld ist erforderlich',
            requestModified: 'Diese Anfrage wird von einem anderen Mitglied bearbeitet',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Zeichenlimit überschritten (${length}/${limit})`,
            dateInvalid: 'Bitte wählen Sie ein gültiges Datum aus',
            invalidDateShouldBeFuture: 'Bitte wählen Sie heuten oder ein zukünftiges Datum',
            invalidTimeShouldBeFuture: 'Bitte wähle eine Uhrzeit, die mindestens eine Minute in der Zukunft liegt',
            invalidCharacter: 'Ungültiges Zeichen',
            enterMerchant: 'Geben Sie einen Händlernamen ein',
            enterAmount: 'Betrag eingeben',
            missingMerchantName: 'Fehlender Händlername',
            missingAmount: 'Fehlender Betrag',
            missingDate: 'Fehlendes Datum',
            enterDate: 'Geben Sie ein Datum ein',
            invalidTimeRange: 'Bitte geben Sie eine Uhrzeit im 12-Stunden-Format ein (z. B. 14:30 PM)',
            pleaseCompleteForm: 'Bitte füllen Sie das obige Formular aus, um fortzufahren',
            pleaseSelectOne: 'Bitte wähle oben eine Option aus',
            invalidRateError: 'Bitte einen gültigen Satz eingeben',
            lowRateError: 'Der Kurs muss größer als 0 sein',
            email: 'Bitte gib eine gültige E‑Mail-Adresse ein',
            login: 'Beim Anmelden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        comma: 'Komma',
        semicolon: 'Semikolon',
        please: 'Bitte',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'Kontakt aufnehmen',
        pleaseEnterEmailOrPhoneNumber: 'Bitte geben Sie eine E‑Mail-Adresse oder Telefonnummer ein',
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
        transferBalance: 'Kontostand übertragen',
        // @context Instruction telling the user to input data manually. Refers to entering text or values in a field.
        enterManually: 'Manuell eingeben',
        message: 'Nachricht',
        leaveThread: 'Thread verlassen',
        you: 'Du',
        // @context Refers to the current user in the UI. Should follow capitalization rules for labels/pronouns in the target language.
        me: 'Ich',
        youAfterPreposition: 'du',
        your: 'Ihr',
        conciergeHelp: 'Bitte wenden Sie sich für Hilfe an Concierge.',
        youAppearToBeOffline: 'Sie scheinen offline zu sein.',
        thisFeatureRequiresInternet: 'Diese Funktion erfordert eine aktive Internetverbindung.',
        attachmentWillBeAvailableOnceBackOnline: 'Anhang wird verfügbar, sobald du wieder online bist.',
        errorOccurredWhileTryingToPlayVideo: 'Beim Abspielen dieses Videos ist ein Fehler aufgetreten.',
        areYouSure: 'Bist du sicher?',
        verify: 'Verifizieren',
        yesContinue: 'Ja, fortfahren',
        // @context Provides an example format for a website URL.
        websiteExample: 'z. B. https://www.expensify.com',
        // @context Provides an example format for a ZIP/postal code.
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `z. B. ${zipSampleFormat}` : ''),
        description: 'Beschreibung',
        title: 'Titel',
        assignee: 'Beauftragte Person',
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
        letsStart: `Lass uns anfangen`,
        showMore: 'Mehr anzeigen',
        showLess: 'Weniger anzeigen',
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
        showing: 'Anzeigen',
        of: 'von',
        default: 'Standard',
        update: 'Aktualisieren',
        member: 'Mitglied',
        auditor: 'Auditor',
        role: 'Rolle',
        currency: 'Währung',
        groupCurrency: 'Gruppenwährung',
        rate: 'Satz',
        emptyLHN: {
            title: 'Juhu! Alles erledigt.',
            subtitleText1: 'Finde einen Chat mit der',
            subtitleText2: 'Schaltfläche oben oder erstellen Sie etwas mit dem',
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
        companyID: 'Firmen-ID',
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
        longID: 'Lange ID',
        withdrawalID: 'Auszahlungs-ID',
        bankAccounts: 'Bankkonten',
        chooseFile: 'Datei auswählen',
        chooseFiles: 'Dateien auswählen',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: 'Einfach loslassen',
        // @context Instruction for dropping one or more files into an upload area.
        dropMessage: 'Datei hier ablegen',
        ignore: 'Ignorieren',
        enabled: 'Aktiviert',
        disabled: 'Deaktiviert',
        // @context Action button for importing a file or data. Should use the verb form, not the noun form.
        import: 'Importieren',
        offlinePrompt: 'Sie können diese Aktion derzeit nicht ausführen.',
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
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `Brauchen Sie etwas Bestimmtes? Chatten Sie mit Ihrem Account Manager, ${accountManagerDisplayName}.`,
        chatNow: 'Jetzt chatten',
        workEmail: 'Arbeits-E-Mail',
        destination: 'Ziel',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: 'Untersatzrate',
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
            `Wenn du diesen Workspace verlässt, wirst du im Genehmigungsworkflow durch ${workspaceOwner}, den Workspace-Inhaber, ersetzt.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Workspace verlässt, wirst du als bevorzugte exportierende Person durch ${workspaceOwner}, den/die Workspace-Inhaber(in), ersetzt.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Wenn du diesen Workspace verlässt, wirst du als technischer Kontakt durch ${workspaceOwner}, den Workspace-Inhaber, ersetzt.`,
        leaveWorkspaceReimburser:
            'Sie können diesen Workspace nicht verlassen, da Sie der Erstattende sind. Bitte legen Sie unter Workspaces > Zahlungen erstellen oder verfolgen einen neuen Erstattenden fest und versuchen Sie es dann erneut.',
        reimbursable: 'Erstattungsfähig',
        editYourProfile: 'Profil bearbeiten',
        comments: 'Kommentare',
        sharedIn: 'Geteilt in',
        unreported: 'Nicht gemeldet',
        explore: 'Entdecken',
        todo: 'Aufgabe',
        invoice: 'Rechnung',
        expense: 'Ausgabe',
        chat: 'Chat',
        task: 'Aufgabe',
        trip: 'Reise',
        apply: 'Übernehmen',
        status: 'Status',
        on: 'Ein',
        before: 'Vorher',
        after: 'Nach',
        reschedule: 'Neu planen',
        general: 'Allgemein',
        workspacesTabTitle: 'Arbeitsbereiche',
        headsUp: 'Achtung!',
        submitTo: 'Senden an',
        forwardTo: 'Weiterleiten an',
        merge: 'Zusammenführen',
        none: 'Keine',
        unstableInternetConnection: 'Instabile Internetverbindung. Bitte überprüfen Sie Ihr Netzwerk und versuchen Sie es erneut.',
        enableGlobalReimbursements: 'Globale Erstattungen aktivieren',
        purchaseAmount: 'Kaufbetrag',
        frequency: 'Frequenz',
        link: 'Link',
        pinned: 'Angeheftet',
        read: 'Lesen',
        copyToClipboard: 'In Zwischenablage kopieren',
        thisIsTakingLongerThanExpected: 'Dies dauert länger als erwartet …',
        domains: 'Domains',
        actionRequired: 'Aktion erforderlich',
    },
    supportalNoAccess: {
        title: 'Nicht so schnell',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `Sie sind nicht berechtigt, diese Aktion durchzuführen, wenn der Support eingeloggt ist (Befehl: ${command ?? ''}). Wenn Sie der Meinung sind, dass Success diese Aktion ausführen können sollte, starten Sie bitte eine Konversation in Slack.`,
    },
    lockedAccount: {
        title: 'Gesperrtes Konto',
        description: 'Sie können diese Aktion nicht ausführen, da dieses Konto gesperrt wurde. Bitte wenden Sie sich für die nächsten Schritte an concierge@expensify.com',
    },
    location: {
        useCurrent: 'Aktuellen Standort verwenden',
        notFound: 'Wir konnten deinen Standort nicht ermitteln. Bitte versuche es erneut oder gib eine Adresse manuell ein.',
        permissionDenied: 'Anscheinend hast du den Zugriff auf deinen Standort verweigert.',
        please: 'Bitte',
        allowPermission: 'Standortzugriff in den Einstellungen erlauben',
        tryAgain: 'und versuche es erneut.',
    },
    contact: {
        importContacts: 'Kontakte importieren',
        importContactsTitle: 'Importieren Sie Ihre Kontakte',
        importContactsText: 'Importiere Kontakte von deinem Telefon, damit deine Lieblingspersonen immer nur einen Fingertipp entfernt sind.',
        importContactsExplanation: 'damit deine Lieblingsmenschen immer nur eine Berührung entfernt sind.',
        importContactsNativeText: 'Nur noch ein Schritt! Gib uns grünes Licht, um deine Kontakte zu importieren.',
    },
    anonymousReportFooter: {
        logoTagline: 'An der Diskussion teilnehmen.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Kamerazugriff',
        expensifyDoesNotHaveAccessToCamera: 'Expensify kann ohne Zugriff auf deine Kamera keine Fotos aufnehmen. Tippe auf „Einstellungen“, um die Berechtigungen zu aktualisieren.',
        attachmentError: 'Anlagefehler',
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
        notAllowedExtension: 'Dieser Dateityp ist nicht erlaubt. Bitte versuchen Sie es mit einem anderen Dateityp.',
        folderNotAllowedMessage: 'Das Hochladen eines Ordners ist nicht erlaubt. Bitte versuchen Sie es mit einer anderen Datei.',
        protectedPDFNotSupported: 'Passwortgeschützte PDF-Datei wird nicht unterstützt',
        attachmentImageResized: 'Dieses Bild wurde für die Vorschau in der Größe angepasst. Lade es herunter, um die volle Auflösung zu sehen.',
        attachmentImageTooLarge: 'Dieses Bild ist zu groß, um vor dem Hochladen eine Vorschau anzuzeigen.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Sie können nur bis zu ${fileLimit} Dateien auf einmal hochladen.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Dateien überschreiten ${maxUploadSizeInMB} MB. Bitte versuche es erneut.`,
        someFilesCantBeUploaded: 'Einige Dateien können nicht hochgeladen werden',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Dateien müssen kleiner als ${maxUploadSizeInMB} MB sein. Größere Dateien werden nicht hochgeladen.`,
        maxFileLimitExceeded: 'Sie können bis zu 30 Belege auf einmal hochladen. Alle weiteren werden nicht hochgeladen.',
        unsupportedFileType: ({fileType}: FileTypeParams) => `${fileType}-Dateien werden nicht unterstützt. Es werden nur unterstützte Dateitypen hochgeladen.`,
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
        supportingText: 'Sie können dieses Fenster schließen und zur Expensify-App zurückkehren.',
    },
    avatarCropModal: {
        title: 'Foto bearbeiten',
        description: 'Ziehen, zoomen und drehen Sie Ihr Bild, wie Sie möchten.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Keine Erweiterung für MIME-Typ gefunden',
        problemGettingImageYouPasted: 'Es gab ein Problem beim Abrufen des von dir eingefügten Bildes',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Die maximale Kommentarlänge beträgt ${formattedMaxLength} Zeichen.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Die maximale Aufgabentitellänge beträgt ${formattedMaxLength} Zeichen.`,
    },
    baseUpdateAppModal: {
        updateApp: 'App aktualisieren',
        updatePrompt: 'Eine neue Version dieser App ist verfügbar.\nAktualisiere jetzt oder starte die App später neu, um die neuesten Änderungen herunterzuladen.',
    },
    deeplinkWrapper: {
        launching: 'Expensify wird gestartet',
        expired: 'Ihre Sitzung ist abgelaufen.',
        signIn: 'Bitte melden Sie sich erneut an.',
        redirectedToDesktopApp: 'Wir haben dich zur Desktop-App weitergeleitet.',
        youCanAlso: 'Sie können auch',
        openLinkInBrowser: 'Öffnen Sie diesen Link in Ihrem Browser',
        loggedInAs: ({email}: LoggedInAsParams) => `Sie sind als ${email} angemeldet. Klicken Sie im Dialogfeld auf „Link öffnen“, um sich mit diesem Konto in der Desktop-App anzumelden.`,
        doNotSeePrompt: 'Siehst du die Eingabeaufforderung nicht?',
        tryAgain: 'Erneut versuchen',
        or: ', oder',
        continueInWeb: 'weiter zur Web-App',
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abrakadabra,
            du bist angemeldet!
        `),
        successfulSignInDescription: 'Wechsele zurück zu deinem ursprünglichen Tab, um fortzufahren.',
        title: 'Hier ist dein magischer Code',
        description: dedent(`
            Bitte geben Sie den Code auf dem Gerät ein,
            auf dem er ursprünglich angefordert wurde
        `),
        doNotShare: dedent(`
            Geben Sie Ihren Code niemals an andere weiter.
            Expensify wird Sie niemals danach fragen!
        `),
        or: ', oder',
        signInHere: 'einfach hier anmelden',
        expiredCodeTitle: 'Magischer Code abgelaufen',
        expiredCodeDescription: 'Gehe zum ursprünglichen Gerät zurück und fordere einen neuen Code an',
        successfulNewCodeRequest: 'Code angefordert. Bitte überprüfen Sie Ihr Gerät.',
        tfaRequiredTitle: dedent(`
            Zwei-Faktor-Authentifizierung  
            erforderlich
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
        nameEmailOrPhoneNumber: 'Name, E-Mail oder Telefonnummer',
        findMember: 'Mitglied suchen',
        searchForSomeone: 'Nach jemandem suchen',
    },
    customApprovalWorkflow: {
        title: 'Benutzerdefinierter Genehmigungsworkflow',
        description: 'Ihr Unternehmen verwendet in diesem Workspace einen benutzerdefinierten Genehmigungs-Workflow. Bitte führen Sie diese Aktion in Expensify Classic aus.',
        goToExpensifyClassic: 'Zu Expensify Classic wechseln',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Reiche eine Ausgabe ein, wirb dein Team',
            subtitleText: 'Möchtest du, dass dein Team Expensify auch nutzt? Reiche einfach eine Ausgabe bei ihnen ein und wir kümmern uns um den Rest.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Einen Anruf buchen',
    },
    hello: 'Hallo',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Beginne unten.',
        anotherLoginPageIsOpen: 'Eine andere Anmeldeseite ist geöffnet.',
        anotherLoginPageIsOpenExplanation: 'Sie haben die Anmeldeseite in einem separaten Tab geöffnet. Bitte melden Sie sich in diesem Tab an.',
        welcome: 'Willkommen!',
        welcomeWithoutExclamation: 'Willkommen',
        phrase2: 'Geld spricht. Und jetzt, da Chat und Zahlungen an einem Ort sind, ist es auch einfach.',
        phrase3: 'Ihre Zahlungen erreichen Sie so schnell, wie Sie Ihren Standpunkt vermitteln können.',
        enterPassword: 'Bitte geben Sie Ihr Passwort ein',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, es ist immer schön, ein neues Gesicht hier zu sehen!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) =>
            `Bitte gib den magischen Code ein, der an ${login} gesendet wurde. Er sollte innerhalb von ein bis zwei Minuten ankommen.`,
    },
    login: {
        hero: {
            header: 'Reisen und Spesen in Chat-Geschwindigkeit',
            body: 'Willkommen bei der nächsten Generation von Expensify, in der Ihre Reisen und Ausgaben dank kontextbezogenem Chat in Echtzeit schneller erledigt werden.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Sie sind bereits als ${email} angemeldet.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Möchten Sie sich nicht mit ${provider} anmelden?`,
        continueWithMyCurrentSession: 'Mit meiner aktuellen Sitzung fortfahren',
        redirectToDesktopMessage: 'Wir leiten dich zur Desktop-App weiter, sobald du dich angemeldet hast.',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Mit Single Sign-On weiter anmelden:',
        orContinueWithMagicCode: 'Sie können sich auch mit einem magischen Code anmelden',
        useSingleSignOn: 'Einmalanmeldung verwenden',
        useMagicCode: 'Magischen Code verwenden',
        launching: 'Wird gestartet...',
        oneMoment: 'Einen Moment, wir leiten Sie zu Ihrem Single Sign-on-Portal Ihres Unternehmens weiter.',
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
            return `Sind Sie sicher, dass Sie diesen ${type} löschen möchten?`;
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
        beginningOfArchivedRoom: ({reportName, reportDetailsLink}: BeginningOfArchivedRoomParams) =>
            `Du hast die Party in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> verpasst, hier gibt es nichts zu sehen.`,
        beginningOfChatHistoryDomainRoom: ({domainRoom}: BeginningOfChatHistoryDomainRoomParams) =>
            `Dieser Chat ist mit allen Expensify-Mitgliedern in der Domäne <strong>${domainRoom}</strong>. Nutze ihn, um mit Kolleg:innen zu chatten, Tipps zu teilen und Fragen zu stellen.`,
        beginningOfChatHistoryAdminRoom: ({workspaceName}: BeginningOfChatHistoryAdminRoomParams) =>
            `Dieser Chat ist mit dem <strong>${workspaceName}</strong>-Admin. Verwende ihn, um über die Einrichtung des Workspaces und mehr zu chatten.`,
        beginningOfChatHistoryAnnounceRoom: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomParams) =>
            `Dieser Chat ist mit allen in <strong>${workspaceName}</strong>. Verwende ihn für die wichtigsten Ankündigungen.`,
        beginningOfChatHistoryUserRoom: ({reportName, reportDetailsLink}: BeginningOfChatHistoryUserRoomParams) =>
            `Dieser Chatraum ist für alles rund um <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> gedacht.`,
        beginningOfChatHistoryInvoiceRoom: ({invoicePayer, invoiceReceiver}: BeginningOfChatHistoryInvoiceRoomParams) =>
            `Dieser Chat ist für Rechnungen zwischen <strong>${invoicePayer}</strong> und <strong>${invoiceReceiver}</strong>. Verwende die +‑Taste, um eine Rechnung zu senden.`,
        beginningOfChatHistory: 'Dieser Chat ist mit',
        beginningOfChatHistoryPolicyExpenseChat: ({workspaceName, submitterDisplayName}: BeginningOfChatHistoryPolicyExpenseChatParams) =>
            `Hier wird <strong>${submitterDisplayName}</strong> Ausgaben an <strong>${workspaceName}</strong> einreichen. Verwende dazu einfach die +-Taste.`,
        beginningOfChatHistorySelfDM: 'Dies ist dein persönlicher Bereich. Nutze ihn für Notizen, Aufgaben, Entwürfe und Erinnerungen.',
        beginningOfChatHistorySystemDM: 'Willkommen! Lass uns mit deiner Einrichtung beginnen.',
        chatWithAccountManager: 'Chatten Sie hier mit Ihrem Account Manager',
        sayHello: 'Sag Hallo!',
        yourSpace: 'Ihr Bereich',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Willkommen bei ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Verwende die +‑Taste, um eine Ausgabe zu ${additionalText}.`,
        askConcierge: 'Stelle Fragen und erhalte rund um die Uhr Support in Echtzeit.',
        conciergeSupport: '24/7-Support',
        create: 'Erstellen',
        iouTypes: {
            pay: 'Bezahlen',
            split: 'Aufteilen',
            submit: 'Senden',
            track: 'verfolgen',
            invoice: 'Rechnung',
        },
    },
    adminOnlyCanPost: 'Nur Admins können in diesem Raum Nachrichten senden.',
    reportAction: {
        asCopilot: 'als Copilot für',
    },
    mentionSuggestions: {
        hereAlternateText: 'Alle in dieser Unterhaltung benachrichtigen',
    },
    newMessages: 'Neue Nachrichten',
    latestMessages: 'Neueste Nachrichten',
    youHaveBeenBanned: 'Hinweis: Du wurdest für den Chat in diesem Kanal gesperrt.',
    reportTypingIndicator: {
        isTyping: 'schreibt...',
        areTyping: 'schreiben...',
        multipleMembers: 'Mehrere Mitglieder',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Dieser Chatraum wurde archiviert.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `Dieser Chat ist nicht mehr aktiv, weil ${displayName} sein Konto geschlossen hat.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Dieser Chat ist nicht mehr aktiv, da ${oldDisplayName} sein Konto mit ${displayName} zusammengeführt hat.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Dieser Chat ist nicht mehr aktiv, weil <strong>Sie</strong> kein Mitglied des Workspaces ${policyName} mehr sind.`
                : `Dieser Chat ist nicht mehr aktiv, weil ${displayName} kein Mitglied des Workspaces ${policyName} mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Dieser Chat ist nicht mehr aktiv, da ${policyName} kein aktiver Workspace mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Dieser Chat ist nicht mehr aktiv, da ${policyName} kein aktiver Workspace mehr ist.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Diese Buchung ist archiviert.',
    },
    writeCapabilityPage: {
        label: 'Wer kann posten',
        writeCapability: {
            all: 'Alle Mitglieder',
            admins: 'Nur Administratoren',
        },
    },
    sidebarScreen: {
        buttonFind: 'Etwas finden...',
        buttonMySettings: 'Meine Einstellungen',
        fabNewChat: 'Chat starten',
        fabNewChatExplained: 'Chat starten (Schwebende Aktion)',
        fabScanReceiptExplained: 'Beleg scannen (Schwebende Aktion)',
        chatPinned: 'Chat angeheftet',
        draftedMessage: 'Entwurfene Nachricht',
        listOfChatMessages: 'Liste der Chatnachrichten',
        listOfChats: 'Chatliste',
        saveTheWorld: 'Die Welt retten',
        tooltip: 'Hier geht’s los!',
        redirectToExpensifyClassicModal: {
            title: 'Demnächst verfügbar',
            description:
                'Wir passen noch ein paar weitere Details von New Expensify an, um Ihre spezielle Konfiguration zu berücksichtigen. In der Zwischenzeit wechseln Sie bitte zu Expensify Classic.',
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
        manual: 'Manuell',
        scan: 'Scannen',
        map: 'Karte',
    },
    spreadsheet: {
        upload: 'Eine Tabellenkalkulation hochladen',
        import: 'Tabellenkalkulation importieren',
        dragAndDrop: '<muted-link>Ziehen Sie Ihre Tabelle hierher, oder wählen Sie unten eine Datei aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Ziehen Sie Ihre Tabelle per Drag & Drop hierher oder wählen Sie unten eine Datei aus. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Erfahren Sie mehr</a> über unterstützte Dateiformate.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Wählen Sie eine Tabellenkalkulationsdatei zum Importieren aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Wählen Sie eine Tabellenkalkulationsdatei zum Importieren aus. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Erfahren Sie mehr</a> über unterstützte Dateiformate.</muted-link>`,
        fileContainsHeader: 'Datei enthält Spaltenüberschriften',
        column: ({name}: SpreadSheetColumnParams) => `Spalte ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `Ups! Ein erforderliches Feld („${fieldName}“) wurde nicht zugeordnet. Bitte überprüfen und versuche es erneut.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) =>
            `Ups! Du hast ein einzelnes Feld („${fieldName}“) mehreren Spalten zugeordnet. Bitte überprüfe dies und versuche es erneut.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `Ups! Das Feld („${fieldName}“) enthält einen oder mehrere leere Werte. Bitte überprüfen und erneut versuchen.`,
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
            rates > 1 ? `Es wurden ${rates} Pauschalbeträge pro Tag hinzugefügt.` : '1 Pauschale wurde hinzugefügt.',
        importFailedTitle: 'Import fehlgeschlagen',
        importFailedDescription:
            'Bitte stellen Sie sicher, dass alle Felder korrekt ausgefüllt sind, und versuchen Sie es erneut. Wenn das Problem weiterhin besteht, wenden Sie sich bitte an Concierge.',
        importDescription: 'Wählen Sie aus, welche Felder Sie aus Ihrer Tabelle zuordnen möchten, indem Sie unten im Dropdown-Menü neben jeder importierten Spalte klicken.',
        sizeNotMet: 'Die Dateigröße muss größer als 0 Byte sein',
        invalidFileMessage:
            'Die Datei, die du hochgeladen hast, ist entweder leer oder enthält ungültige Daten. Bitte stelle sicher, dass die Datei korrekt formatiert ist und alle erforderlichen Informationen enthält, bevor du sie erneut hochlädst.',
        importSpreadsheetLibraryError: 'Laden des Tabellenkalkulationsmoduls fehlgeschlagen. Bitte überprüfe deine Internetverbindung und versuche es erneut.',
        importSpreadsheet: 'Tabellenkalkulation importieren',
        downloadCSV: 'CSV herunterladen',
        importMemberConfirmation: () => ({
            one: `Bitte bestätige die folgenden Angaben für ein neues Workspace-Mitglied, das im Rahmen dieses Uploads hinzugefügt wird. Bestehende Mitglieder erhalten keine Rollenaktualisierungen oder Einladung Nachrichten.`,
            other: (count: number) =>
                `Bitte bestätige die folgenden Details für die ${count} neuen Workspace-Mitglieder, die im Rahmen dieses Uploads hinzugefügt werden. Bestehende Mitglieder erhalten keine Rollenaktualisierungen oder Einladungsnachrichten.`,
        }),
    },
    receipt: {
        upload: 'Beleg hochladen',
        uploadMultiple: 'Belege hochladen',
        desktopSubtitleSingle: `oder hierher ziehen und ablegen`,
        desktopSubtitleMultiple: `oder per Drag & Drop hierher ziehen`,
        alternativeMethodsTitle: 'Weitere Möglichkeiten, Belege hinzuzufügen:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) =>
            `<label-text><a href="${downloadUrl}">Lade die App herunter</a>, um mit deinem Telefon zu scannen</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Leiten Sie Belege weiter an <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Fügen Sie Ihre Nummer hinzu</a>, um Belege an ${phoneNumber} zu senden</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Belegtexte an ${phoneNumber} senden (nur US-Nummern)</label-text>`,
        takePhoto: 'Foto aufnehmen',
        cameraAccess: 'Für das Fotografieren von Belegen ist der Kamerazugriff erforderlich.',
        deniedCameraAccess: `Der Kamerazugriff wurde noch nicht gewährt, bitte folge <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">diesen Anweisungen</a>.`,
        cameraErrorTitle: 'Kamerafehler',
        cameraErrorMessage: 'Beim Aufnehmen eines Fotos ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        locationAccessTitle: 'Standortzugriff erlauben',
        locationAccessMessage: 'Der Zugriff auf deinen Standort hilft uns, deine Zeitzone und Währung überall dort, wo du bist, genau zu halten.',
        locationErrorTitle: 'Standortzugriff erlauben',
        locationErrorMessage: 'Der Zugriff auf deinen Standort hilft uns, deine Zeitzone und Währung überall dort, wo du bist, genau zu halten.',
        allowLocationFromSetting: `Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall korrekt zu halten. Bitte erlauben Sie den Standortzugriff in den Berechtigungseinstellungen Ihres Geräts.`,
        dropTitle: 'Lass es los',
        dropMessage: 'Legen Sie Ihre Datei hier ab',
        flash: 'Blitz',
        multiScan: 'Mehrfach-Scan',
        shutter: 'Auslöser',
        gallery: 'Galerie',
        deleteReceipt: 'Beleg löschen',
        deleteConfirmation: 'Möchten Sie diese Quittung wirklich löschen?',
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
        splitDistance: 'Entfernung aufteilen',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Bezahle ${name ?? 'jemand'}`,
        assignTask: 'Aufgabe zuweisen',
        header: 'Schnellaktion',
        noLongerHaveReportAccess: 'Du hast keinen Zugriff mehr auf dein vorheriges Ziel für Schnellaktionen. Wähle unten ein neues aus.',
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
        } = {}) => (formattedAmount ? `${formattedAmount} genehmigen` : 'Genehmigen'),
        approved: 'Genehmigt',
        cash: 'Barzahlung',
        card: 'Karte',
        original: 'Original',
        split: 'Aufteilen',
        splitExpense: 'Ausgabe aufteilen',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} von ${merchant}`,
        addSplit: 'Aufteilung hinzufügen',
        makeSplitsEven: 'Aufteilungen angleichen',
        editSplits: 'Splits bearbeiten',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist um ${amount} höher als die ursprüngliche Ausgabe.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Der Gesamtbetrag ist um ${amount} geringer als die ursprüngliche Ausgabe.`,
        splitExpenseZeroAmount: 'Bitte geben Sie vor dem Fortfahren einen gültigen Betrag ein.',
        splitExpenseOneMoreSplit: 'Keine Aufteilungen hinzugefügt. Fügen Sie mindestens eine hinzu, um zu speichern.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `${amount} für ${merchant} bearbeiten`,
        removeSplit: 'Split entfernen',
        splitExpenseCannotBeEditedModalTitle: 'Diese Ausgabe kann nicht bearbeitet werden',
        splitExpenseCannotBeEditedModalDescription: 'Genehmigte oder bezahlte Ausgaben können nicht bearbeitet werden',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Bezahle ${name ?? 'jemand'}`,
        expense: 'Ausgabe',
        categorize: 'Kategorisieren',
        share: 'Teilen',
        participants: 'Teilnehmende',
        createExpense: 'Ausgabe erstellen',
        trackDistance: 'Entfernung verfolgen',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `${expensesNumber} Ausgaben erstellen`,
        removeExpense: 'Ausgabe entfernen',
        removeThisExpense: 'Diese Ausgabe entfernen',
        removeExpenseConfirmation: 'Sind Sie sicher, dass Sie diese Quittung entfernen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
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
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `hat eine Ausgabe gelöscht (${amount} für ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `hat eine Ausgabe verschoben${reportName ? `von ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `hat diese Ausgabe verschoben${reportName ? `zu <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `diese Ausgabe verschoben${reportName ? `von <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedUnreportedTransaction: ({reportUrl}: MovedTransactionParams) => `hat diese Ausgabe aus deinem <a href="${reportUrl}">persönlichen Bereich</a> verschoben`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `diese Ausgabe in deinen <a href="${reportUrl}">persönlichen Bereich</a> verschoben`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `hat diesen Bericht in den <a href="${newParentReportUrl}">${toPolicyName}</a>-Workspace verschoben`;
            }
            return `hat diesen <a href="${movedReportUrl}">Report</a> in den Workspace <a href="${newParentReportUrl}">${toPolicyName}</a> verschoben`;
        },
        pendingMatchWithCreditCard: 'Beleg wartet auf Abgleich mit Kartentransaktion',
        pendingMatch: 'Ausstehende Zuordnung',
        pendingMatchWithCreditCardDescription: 'Beleg wartet auf Zuordnung zu Kartentransaktion. Als Barzahlung markieren, um abzubrechen.',
        markAsCash: 'Als Bar markieren',
        routePending: 'Route ausstehend ...',
        receiptScanning: () => ({
            one: 'Belegerfassung läuft...',
            other: 'Belege werden gescannt …',
        }),
        scanMultipleReceipts: 'Mehrere Belege scannen',
        scanMultipleReceiptsDescription: 'Fotografiere alle deine Belege auf einmal und bestätige die Details selbst – oder wir erledigen es für dich.',
        receiptScanInProgress: 'Belegscan wird durchgeführt',
        receiptScanInProgressDescription: 'Belegerfassung läuft. Schau später noch einmal vorbei oder gib die Details jetzt ein.',
        removeFromReport: 'Aus Bericht entfernen',
        moveToPersonalSpace: 'Verschiebe Ausgaben in deinen persönlichen Bereich',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? 'Mögliche doppelte Ausgaben erkannt. Überprüfen Sie die Duplikate, um das Einreichen zu ermöglichen.'
                : 'Mögliche doppelte Ausgaben erkannt. Überprüfen Sie die Duplikate, um die Genehmigung zu ermöglichen.',
        receiptIssuesFound: () => ({
            one: 'Problem gefunden',
            other: 'Gefundene Probleme',
        }),
        fieldPending: 'Ausstehend...',
        defaultRate: 'Standardrate',
        receiptMissingDetails: 'Belegangaben fehlen',
        missingAmount: 'Fehlender Betrag',
        missingMerchant: 'Fehlender Händler',
        receiptStatusTitle: 'Scannen…',
        receiptStatusText: 'Nur du kannst diese Quittung sehen, während sie gescannt wird. Schau später noch einmal vorbei oder gib die Details jetzt ein.',
        receiptScanningFailed: 'Belegerfassung fehlgeschlagen. Bitte geben Sie die Details manuell ein.',
        transactionPendingDescription: 'Transaktion ausstehend. Die Buchung kann ein paar Tage dauern.',
        companyInfo: 'Unternehmensinformationen',
        companyInfoDescription: 'Wir benötigen noch ein paar weitere Angaben, bevor du deine erste Rechnung senden kannst.',
        yourCompanyName: 'Ihr Firmenname',
        yourCompanyWebsite: 'Die Website Ihres Unternehmens',
        yourCompanyWebsiteNote: 'Wenn Sie keine Website haben, können Sie stattdessen das LinkedIn- oder Social-Media-Profil Ihres Unternehmens angeben.',
        invalidDomainError: 'Sie haben eine ungültige Domain eingegeben. Um fortzufahren, geben Sie bitte eine gültige Domain ein.',
        publicDomainError: 'Sie haben eine öffentliche Domain eingegeben. Um fortzufahren, geben Sie bitte eine private Domain ein.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} werden gescannt`);
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
        settledElsewhere: 'Andernorts bezahlt',
        individual: 'Individuell',
        business: 'Geschäftlich',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} mit Expensify bezahlen` : `Mit Expensify bezahlen`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als Privatperson bezahlen` : `Mit Privatkonto bezahlen`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} mit Wallet bezahlen` : `Mit Wallet bezahlen`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `${formattedAmount} bezahlen`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als Unternehmen bezahlen` : `Mit Geschäftskonto bezahlen`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als bezahlt markieren` : `Als bezahlt markieren`),
        settleInvoicePersonal: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `${amount} mit persönlichem Konto ${last4Digits} bezahlt` : `Mit privatem Konto bezahlt`),
        settleInvoiceBusiness: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `${amount} mit Geschäftskonto ${last4Digits} bezahlt` : `Mit Geschäftskonto bezahlt`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `${formattedAmount} über ${policyName} bezahlen` : `Bezahlen über ${policyName}`),
        businessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `${amount} mit Bankkonto ${last4Digits} bezahlt` : `bezahlt mit Bankkonto ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            `${amount ? `${amount} ` : ''} mit Bankkonto ${last4Digits} über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a> bezahlt`,
        invoicePersonalBank: ({lastFour}: BankAccountLastFourParams) => `Privates Konto • ${lastFour}`,
        invoiceBusinessBank: ({lastFour}: BankAccountLastFourParams) => `Firmenkonto • ${lastFour}`,
        nextStep: 'Nächste Schritte',
        finished: 'Fertig',
        flip: 'Umdrehen',
        sendInvoice: ({amount}: RequestAmountParams) => `${amount} Rechnung senden`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `für ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `eingereicht${memo ? `, mit dem Vermerk ${memo}` : ''}`,
        automaticallySubmitted: `eingereicht über <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">Übermittlung verzögern</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `Verfolge ${formattedAmount}${comment ? `für ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `${amount} aufteilen`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `aufteilen ${formattedAmount}${comment ? `für ${comment}` : ''}`,
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
        automaticallyApproved: `über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a> genehmigt`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `${amount} genehmigt`,
        approvedMessage: `Genehmigt`,
        unapproved: `Nicht genehmigt`,
        automaticallyForwarded: `über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a> genehmigt`,
        forwarded: `Genehmigt`,
        rejectedThisReport: 'hat diesen Bericht abgelehnt',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `hat die Zahlung gestartet, wartet aber darauf, dass ${submitterDisplayName} ein Bankkonto hinzufügt.`,
        adminCanceledRequest: 'hat die Zahlung storniert',
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `hat die Zahlung über ${amount} storniert, da ${submitterDisplayName} sein Expensify Wallet nicht innerhalb von 30 Tagen aktiviert hat`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} hat ein Bankkonto hinzugefügt. Die Zahlung über ${amount} wurde vorgenommen.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}als bezahlt markiert`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}mit Wallet bezahlt`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''}mit Expensify bezahlt über <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">Workspace-Regeln</a>`,
        noReimbursableExpenses: 'Dieser Bericht enthält einen ungültigen Betrag',
        pendingConversionMessage: 'Die Gesamtsumme wird aktualisiert, sobald du wieder online bist',
        changedTheExpense: 'Ausgabe geändert',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `die ${valueName} auf ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `setzen Sie ${translatedChangedField} auf ${newMerchant}, wodurch der Betrag auf ${newAmountToDisplay} gesetzt wurde`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `das ${valueName} (zuvor ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `${valueName} auf ${newValueToDisplay} (zuvor ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `änderte ${translatedChangedField} in ${newMerchant} (zuvor ${oldMerchant}), wodurch der Betrag auf ${newAmountToDisplay} aktualisiert wurde (zuvor ${oldAmountToDisplay})`,
        basedOnAI: 'basierend auf bisherigen Aktivitäten',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `basierend auf den <a href="${rulesLink}">Workspace-Regeln</a>` : 'basierend auf dem Arbeitsbereichsregelwerk'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `für ${comment}` : 'Ausgabe'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Rechnungsbericht Nr. ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} gesendet${comment ? `für ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `Ausgabe von persönlichem Bereich nach ${workspaceName ?? `Mit ${reportName} chatten`} verschoben`,
        movedToPersonalSpace: 'Ausgabe in den persönlichen Bereich verschoben',
        tagSelection: ({policyTagListName}: TagSelectionParams = {}) => {
            const article = policyTagListName && StringUtils.startsWithVowel(policyTagListName) ? 'ein' : 'a';
            const tag = policyTagListName ?? 'Tag';
            return `Wählen Sie ${article} ${tag}, um Ihre Ausgaben besser zu organisieren.`;
        },
        categorySelection: 'Wählen Sie eine Kategorie, um Ihre Ausgaben besser zu organisieren.',
        error: {
            invalidCategoryLength: 'Der Kategoriename überschreitet 255 Zeichen. Bitte kürze ihn oder wähle eine andere Kategorie.',
            invalidTagLength: 'Der Tagname überschreitet 255 Zeichen. Bitte kürze ihn oder wähle einen anderen Tag.',
            invalidAmount: 'Bitte geben Sie vor dem Fortfahren einen gültigen Betrag ein',
            invalidDistance: 'Bitte gib vor dem Fortfahren eine gültige Entfernung ein',
            invalidIntegerAmount: 'Bitte geben Sie einen ganzen Dollarbetrag ein, bevor Sie fortfahren',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Der maximale Steuerbetrag ist ${amount}`,
            invalidSplit: 'Die Summe der Aufteilungen muss dem Gesamtbetrag entsprechen',
            invalidSplitParticipants: 'Bitte geben Sie für mindestens zwei Teilnehmende einen Betrag größer als null ein',
            invalidSplitYourself: 'Bitte gib für deine Aufteilung einen von Null verschiedenen Betrag ein',
            noParticipantSelected: 'Bitte wählen Sie einen Teilnehmer aus',
            other: 'Unerwarteter Fehler. Bitte versuchen Sie es später erneut.',
            genericCreateFailureMessage: 'Unerwarteter Fehler beim Einreichen dieser Ausgabe. Bitte versuchen Sie es später erneut.',
            genericCreateInvoiceFailureMessage: 'Unerwarteter Fehler beim Senden dieser Rechnung. Bitte versuchen Sie es später erneut.',
            genericHoldExpenseFailureMessage: 'Unerwarteter Fehler beim Zurückstellen dieser Ausgabe. Bitte versuchen Sie es später erneut.',
            genericUnholdExpenseFailureMessage: 'Unerwarteter Fehler beim Entfernen dieser Ausgabe aus der Warteschleife. Bitte versuchen Sie es später noch einmal.',
            receiptDeleteFailureError: 'Unerwarteter Fehler beim Löschen dieses Belegs. Bitte versuchen Sie es später erneut.',
            receiptFailureMessage:
                '<rbr>Beim Hochladen Ihrer Quittung ist ein Fehler aufgetreten. Bitte <a href="download">speichern Sie die Quittung</a> und <a href="retry">versuchen Sie es</a> später erneut.</rbr>',
            receiptFailureMessageShort: 'Beim Hochladen Ihres Belegs ist ein Fehler aufgetreten.',
            genericDeleteFailureMessage: 'Unerwarteter Fehler beim Löschen dieser Ausgabe. Bitte versuchen Sie es später erneut.',
            genericEditFailureMessage: 'Unerwarteter Fehler beim Bearbeiten dieser Ausgabe. Bitte versuche es später erneut.',
            genericSmartscanFailureMessage: 'Der Transaktion fehlen Felder',
            duplicateWaypointsErrorMessage: 'Bitte entferne doppelte Wegpunkte',
            atLeastTwoDifferentWaypoints: 'Bitte geben Sie mindestens zwei unterschiedliche Adressen ein',
            splitExpenseMultipleParticipantsErrorMessage: 'Eine Ausgabe kann nicht zwischen einem Workspace und anderen Mitgliedern aufgeteilt werden. Bitte aktualisiere deine Auswahl.',
            invalidMerchant: 'Bitte gib einen gültigen Händler ein',
            atLeastOneAttendee: 'Mindestens ein Teilnehmer muss ausgewählt werden',
            invalidQuantity: 'Bitte geben Sie eine gültige Menge ein',
            quantityGreaterThanZero: 'Die Menge muss größer als null sein',
            invalidSubrateLength: 'Es muss mindestens eine Unterrate vorhanden sein',
            invalidRate: 'Satz für diesen Arbeitsbereich nicht gültig. Bitte wählen Sie einen verfügbaren Satz aus dem Arbeitsbereich aus.',
        },
        dismissReceiptError: 'Fehler verwerfen',
        dismissReceiptErrorConfirmation: 'Achtung! Wenn du diesen Fehler verwirfst, wird deine hochgeladene Quittung vollständig entfernt. Bist du sicher?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `hat mit dem Ausgleich begonnen. Die Zahlung ist angehalten, bis ${submitterDisplayName} seine Wallet aktiviert.`,
        enableWallet: 'Wallet aktivieren',
        hold: 'Angehalten',
        unhold: 'Sperre aufheben',
        holdExpense: () => ({
            one: 'Ausgabe zurückhalten',
            other: 'Ausgaben zurückhalten',
        }),
        unholdExpense: 'Ausgabe freigeben',
        heldExpense: 'hat diese Ausgabe gehalten',
        unheldExpense: 'diese Ausgabe wieder freigegeben',
        moveUnreportedExpense: 'Nicht gemeldete Ausgabe verschieben',
        addUnreportedExpense: 'Nicht erfasste Ausgabe hinzufügen',
        selectUnreportedExpense: 'Wähle mindestens eine Ausgabe aus, die dem Bericht hinzugefügt werden soll.',
        emptyStateUnreportedExpenseTitle: 'Keine nicht gemeldeten Ausgaben',
        emptyStateUnreportedExpenseSubtitle: 'Sie scheinen keine nicht gemeldeten Ausgaben zu haben. Erstellen Sie unten eine.',
        addUnreportedExpenseConfirm: 'Zum Bericht hinzufügen',
        newReport: 'Neuer Bericht',
        explainHold: () => ({
            one: 'Erklären Sie, warum Sie diese Ausgabe zurückhalten.',
            other: 'Erläutern Sie, warum Sie diese Ausgaben zurückhalten.',
        }),
        retracted: 'zurückgezogen',
        retract: 'Zurückziehen',
        reopened: 'wiedereröffnet',
        reopenReport: 'Bericht erneut öffnen',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Dieser Bericht wurde bereits nach ${connectionName} exportiert. Änderungen daran können zu Datenabweichungen führen. Sind Sie sicher, dass Sie diesen Bericht wieder öffnen möchten?`,
        reason: 'Grund',
        holdReasonRequired: 'Beim Zurückhalten ist eine Begründung erforderlich.',
        expenseWasPutOnHold: 'Ausgabe wurde zurückgestellt',
        expenseOnHold: 'Diese Ausgabe wurde zurückgestellt. Bitte lies die Kommentare, um die nächsten Schritte zu erfahren.',
        expensesOnHold: 'Alle Spesen wurden zurückgestellt. Bitte lesen Sie die Kommentare für die nächsten Schritte.',
        expenseDuplicate: 'Diese Ausgabe hat ähnliche Details wie eine andere. Bitte überprüfe die Duplikate, um fortzufahren.',
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
        confirmPayAmount: 'Zahlen Sie den Betrag, der nicht zurückgehalten wird, oder bezahlen Sie den gesamten Bericht.',
        confirmPayAllHoldAmount: () => ({
            one: 'Diese Spesenabrechnung ist angehalten. Möchtest du sie trotzdem bezahlen?',
            other: 'Diese Ausgaben sind zurückgestellt. Möchtest du sie trotzdem bezahlen?',
        }),
        payOnly: 'Nur bezahlen',
        approveOnly: 'Nur genehmigen',
        holdEducationalTitle: 'Solltest du diese Ausgabe zurückhalten?',
        whatIsHoldExplain: 'Halten ist wie das Drücken der „Pause“-Taste für eine Ausgabe, bis du bereit bist, sie einzureichen.',
        holdIsLeftBehind: 'Zurückgehaltene Ausgaben werden ausgelassen, selbst wenn Sie einen gesamten Bericht einreichen.',
        unholdWhenReady: 'Hebt die Aussetzung von Ausgaben auf, wenn ihr bereit seid, sie einzureichen.',
        changePolicyEducational: {
            title: 'Du hast diesen Bericht verschoben!',
            description: 'Überprüfe diese Punkte noch einmal; sie ändern sich häufig, wenn Berichte in einen neuen Workspace verschoben werden.',
            reCategorize: '<strong>Kategorisiere alle Ausgaben neu</strong>, um die Richtlinien des Arbeitsbereichs einzuhalten.',
            workflows: 'Dieser Bericht kann nun einem anderen <strong>Genehmigungsworkflow</strong> unterliegen.',
        },
        changeWorkspace: 'Arbeitsbereich wechseln',
        set: 'Festlegen',
        changed: 'Geändert',
        removed: 'entfernt',
        transactionPending: 'Transaktion ausstehend.',
        chooseARate: 'Wähle einen Erstattungsbetrag pro Meile oder Kilometer für den Workspace',
        unapprove: 'Genehmigung aufheben',
        unapproveReport: 'Genehmigung aufheben',
        headsUp: 'Achtung!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Dieser Bericht wurde bereits nach ${accountingIntegration} exportiert. Eine Änderung kann zu Datenabweichungen führen. Sind Sie sicher, dass Sie die Genehmigung dieses Berichts aufheben möchten?`,
        reimbursable: 'erstattungsfähig',
        nonReimbursable: 'nicht erstattungsfähig',
        bookingPending: 'Diese Buchung ist ausstehend',
        bookingPendingDescription: 'Diese Buchung ist ausstehend, da sie noch nicht bezahlt wurde.',
        bookingArchived: 'Diese Buchung ist archiviert',
        bookingArchivedDescription: 'Diese Buchung ist archiviert, weil das Reisedatum bereits vorbei ist. Fügen Sie bei Bedarf eine Ausgabe für den endgültigen Betrag hinzu.',
        attendees: 'Teilnehmende',
        whoIsYourAccountant: 'Wer ist Ihr Buchhalter?',
        paymentComplete: 'Zahlung abgeschlossen',
        time: 'Zeit',
        startDate: 'Startdatum',
        endDate: 'Enddatum',
        startTime: 'Startzeit',
        endTime: 'Endzeit',
        deleteSubrate: 'Unterrate löschen',
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
            one: `Reise: 1 voller Tag`,
            other: (count: number) => `Reise: ${count} volle Tage`,
        }),
        dates: 'Daten',
        rates: 'Sätze',
        submitsTo: ({name}: SubmitsToParams) => `Sendet an ${name}`,
        reject: {
            educationalTitle: 'Sollten Sie halten oder ablehnen?',
            educationalText: 'Wenn du noch nicht bereit bist, eine Ausgabe zu genehmigen oder zu bezahlen, kannst du sie zurückstellen oder ablehnen.',
            holdExpenseTitle: 'Eine Ausgabe zurückhalten, um vor der Genehmigung oder Bezahlung weitere Details anzufordern.',
            approveExpenseTitle: 'Genehmigen Sie andere Ausgaben, während zurückgestellte Ausgaben Ihnen weiterhin zugewiesen bleiben.',
            heldExpenseLeftBehindTitle: 'Zurückgestellte Ausgaben bleiben zurück, wenn du einen gesamten Bericht genehmigst.',
            rejectExpenseTitle: 'Lehne eine Ausgabe ab, die du nicht genehmigen oder bezahlen möchtest.',
            reasonPageTitle: 'Ausgabe ablehnen',
            reasonPageDescription: 'Erkläre, warum du diese Ausgabe ablehnst.',
            rejectReason: 'Ablehnungsgrund',
            markAsResolved: 'Als erledigt markieren',
            rejectedStatus: 'Diese Ausgabe wurde abgelehnt. Wir warten darauf, dass du die Probleme behebst und sie als gelöst markierst, um die Einreichung zu ermöglichen.',
            reportActions: {
                rejectedExpense: 'hat diese Ausgabe abgelehnt',
                markedAsResolved: 'den Ablehnungsgrund als gelöst markiert',
            },
        },
        moveExpenses: () => ({one: 'Ausgabe verschieben', other: 'Auslagen verschieben'}),
        changeApprover: {
            title: 'Genehmiger ändern',
            subtitle: 'Wählen Sie eine Option, um den Genehmigenden für diesen Bericht zu ändern.',
            description: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Sie können den Genehmigenden für alle Berichte auch dauerhaft in Ihren <a href="${workflowSettingLink}">Workflow-Einstellungen</a> ändern.`,
            changedApproverMessage: ({managerID}: ChangedApproverMessageParams) => `Genehmigende Person geändert in <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Genehmiger hinzufügen',
                addApproverSubtitle: 'Fügen Sie dem bestehenden Workflow eine weitere Genehmigerperson hinzu.',
                bypassApprovers: 'Genehmiger umgehen',
                bypassApproversSubtitle: 'Weise dich selbst als endgültige:n Genehmiger:in zu und überspringe alle verbleibenden Genehmiger.',
            },
            addApprover: {
                subtitle: 'Wählen Sie eine zusätzliche genehmigende Person für diesen Bericht aus, bevor wir ihn durch den restlichen Genehmigungs-Workflow leiten.',
            },
        },
        chooseWorkspace: 'Arbeitsbereich auswählen',
    },
    transactionMerge: {
        listPage: {
            header: 'Ausgaben zusammenführen',
            noEligibleExpenseFound: 'Keine berechtigten Ausgaben gefunden',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Sie haben keine Ausgaben, die mit dieser zusammengeführt werden können. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Erfahren Sie mehr</a> über berechtigte Ausgaben.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Wählen Sie eine <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">berechtigte Ausgabe</a> aus, die mit <strong>${reportName}</strong> zusammengeführt werden soll.`,
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
            selectAllDetailsError: 'Wählen Sie alle Details aus, bevor Sie fortfahren.',
        },
        confirmationPage: {
            header: 'Details bestätigen',
            pageTitle: 'Bestätigen Sie die Angaben, die Sie behalten möchten. Die Angaben, die Sie nicht behalten, werden gelöscht.',
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
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: 'Versteckt',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Die Nummer wurde noch nicht verifiziert. Klicke auf die Schaltfläche, um den Bestätigungslink per SMS erneut zu senden.',
        emailHasNotBeenValidated: 'Die E-Mail wurde nicht verifiziert. Klicken Sie auf die Schaltfläche, um den Bestätigungslink per SMS erneut zu senden.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Foto hochladen',
        removePhoto: 'Foto entfernen',
        editImage: 'Foto bearbeiten',
        viewPhoto: 'Foto anzeigen',
        imageUploadFailed: 'Bildupload fehlgeschlagen',
        deleteWorkspaceError: 'Entschuldigung, beim Löschen deines Workspace-Avatars ist ein unerwartetes Problem aufgetreten',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Das ausgewählte Bild überschreitet die maximale Upload-Größe von ${maxUploadSizeInMB} MB.`,
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
        backdropLabel: 'Modal-Hintergrund',
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
                        return `Warten auf <strong>${actor}</strong>, um Ausgaben hinzuzufügen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass ein Admin Ausgaben hinzufügt.`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Keine weiteren Schritte erforderlich!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> ein Bankkonto hinzufügst.`;
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
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>deine</strong> Ausgaben automatisch eingereicht werden${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten, bis die Ausgaben von <strong>${actor}</strong> automatisch eingereicht werden${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten darauf, dass die Ausgaben eines Admins automatisch eingereicht werden${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten auf <strong>dich</strong>, um das/die Problem(e) zu beheben.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf <strong>${actor}</strong>, um die Probleme zu beheben.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf einen Admin, der die Probleme behebt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten auf <strong>dich</strong>, um Ausgaben zu genehmigen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf die Genehmigung der Ausgaben durch <strong>${actor}</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf die Genehmigung der Ausgaben durch einen Admin.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warte darauf, dass <strong>du</strong> diesen Bericht exportierst.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten auf <strong>${actor}</strong>, um diesen Bericht zu exportieren.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf einen Admin, der diesen Bericht exportiert.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten auf <strong>dich</strong>, um Ausgaben zu bezahlen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten darauf, dass <strong>${actor}</strong> die Spesen bezahlt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf einen Admin, um Spesen zu bezahlen.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Warten darauf, dass <strong>du</strong> die Einrichtung eines Geschäftskontos abschließt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Warten, bis <strong>${actor}</strong> die Einrichtung eines Geschäftskontos abgeschlossen hat.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Warten auf einen Admin, der die Einrichtung eines Geschäftskontos abschließt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `bis ${eta}` : ` ${eta}`;
                }
                return `Warten, bis die Zahlung abgeschlossen ist${formattedETA}.`;
            },
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
        selectYourPronouns: 'Wähle deine Pronomen',
        selfSelectYourPronoun: 'Wähle deine Pronomen selbst aus',
        emailAddress: 'E-Mail-Adresse',
        setMyTimezoneAutomatically: 'Meine Zeitzone automatisch festlegen',
        timezone: 'Zeitzone',
        invalidFileMessage: 'Ungültige Datei. Bitte versuchen Sie ein anderes Bild.',
        avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchronisierung',
        profileAvatar: 'Profilavatar',
        publicSection: {
            title: 'Öffentlich',
            subtitle: 'Diese Angaben werden in deinem öffentlichen Profil angezeigt. Jeder kann sie sehen.',
        },
        privateSection: {
            title: 'Privat',
            subtitle: 'Diese Angaben werden für Reisen und Zahlungen verwendet. Sie werden niemals in Ihrem öffentlichen Profil angezeigt.',
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
        validateAccount: 'Bestätigen Sie Ihr Konto',
        helpText: ({email}: {email: string}) =>
            `Fügen Sie weitere Möglichkeiten hinzu, sich anzumelden und Belege an Expensify zu senden.<br/><br/>Fügen Sie eine E-Mail-Adresse hinzu, um Belege an <a href="mailto:${email}">${email}</a> weiterzuleiten, oder fügen Sie eine Telefonnummer hinzu, um Belege per SMS an 47777 zu senden (nur US-Nummern).`,
        pleaseVerify: 'Bitte bestätigen Sie diese Kontaktmethode.',
        getInTouch: 'Wir verwenden diese Methode, um Sie zu kontaktieren.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde. Er sollte innerhalb ein bis zwei Minuten ankommen.`,
        setAsDefault: 'Als Standard festlegen',
        yourDefaultContactMethod:
            'Dies ist Ihre aktuelle Standard-Kontaktmethode. Bevor Sie sie löschen können, müssen Sie eine andere Kontaktmethode auswählen und auf „Als Standard festlegen“ klicken.',
        removeContactMethod: 'Kontaktmethode entfernen',
        removeAreYouSure: 'Sind Sie sicher, dass Sie diese Kontaktmethode entfernen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
        failedNewContact: 'Diese Kontaktmethode konnte nicht hinzugefügt werden.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Senden eines neuen Magic-Codes fehlgeschlagen. Bitte warten Sie einen Moment und versuchen Sie es erneut.',
            validateSecondaryLogin: 'Falscher oder ungültiger magischer Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            deleteContactMethod: 'Kontaktmethode konnte nicht gelöscht werden. Bitte wenden Sie sich für Hilfe an Concierge.',
            setDefaultContactMethod: 'Fehler beim Festlegen einer neuen primären Kontaktmethode. Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
            addContactMethod: 'Diese Kontaktmethode konnte nicht hinzugefügt werden. Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
            enteredMethodIsAlreadySubmitted: 'Diese Kontaktmethode existiert bereits',
            passwordRequired: 'Passwort erforderlich.',
            contactMethodRequired: 'Kontaktmethode ist erforderlich',
            invalidContactMethod: 'Ungültige Kontaktmethode',
        },
        newContactMethod: 'Neue Kontaktmethode',
        goBackContactMethods: 'Zu den Kontaktmethoden zurück',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Firma / Firmen',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Er / Ihn / Sein',
        heHimHisTheyThemTheirs: 'Er / Ihn / Sein / Sie / Ihnen / Ihre',
        sheHerHers: 'Sie / Ihr / Ihre',
        sheHerHersTheyThemTheirs: 'Sie / Ihr / Ihre / Sie / Ihnen / Ihre',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Pro / Pers.',
        theyThemTheirs: 'They / Them / Theirs',
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
        getLocationAutomatically: 'Standort automatisch bestimmen',
    },
    updateRequiredView: {
        updateRequired: 'Aktualisierung erforderlich',
        pleaseInstall: 'Bitte auf die neueste Version von New Expensify aktualisieren',
        pleaseInstallExpensifyClassic: 'Bitte installiere die neueste Version von Expensify',
        toGetLatestChanges: 'Für Mobilgeräte oder Desktop laden Sie die neueste Version herunter und installieren Sie sie. Für das Web aktualisieren Sie Ihren Browser.',
        newAppNotAvailable: 'Die neue Expensify-App ist nicht mehr verfügbar.',
    },
    initialSettingsPage: {
        about: 'Info',
        aboutPage: {
            description: 'Die neue Expensify-App wird von einer Community aus Open-Source-Entwicklern aus der ganzen Welt entwickelt. Hilf uns, die Zukunft von Expensify zu gestalten.',
            appDownloadLinks: 'App-Download-Links',
            viewKeyboardShortcuts: 'Tastenkombinationen anzeigen',
            viewTheCode: 'Code anzeigen',
            viewOpenJobs: 'Offene Aufträge anzeigen',
            reportABug: 'Fehler melden',
            troubleshoot: 'Problemlösung',
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
            viewConsole: 'Debugkonsole anzeigen',
            debugConsole: 'Debug-Konsole',
            description:
                '<muted-text>Verwende die folgenden Tools, um Probleme mit der Expensify-Erfahrung zu beheben. Wenn du auf Probleme stößt, <concierge-link>reiche bitte einen Fehlerbericht ein</concierge-link>.</muted-text>',
            confirmResetDescription: 'Alle nicht gesendeten Entwurfsnachrichten gehen verloren, aber der Rest deiner Daten ist sicher.',
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
            simulateFailingNetworkRequests: 'Netzwerkanfragen simuliert fehlschlagen',
            authenticationStatus: 'Authentifizierungsstatus',
            deviceCredentials: 'Geräteanmeldedaten',
            invalidate: 'Ungültig machen',
            destroy: 'Zerstören',
            maskExportOnyxStateData: 'Beim Exportieren des Onyx-Status empfindliche Mitgliederdaten maskieren',
            exportOnyxState: 'Onyx-Status exportieren',
            importOnyxState: 'Onyx-Status importieren',
            testCrash: 'Absturz testen',
            resetToOriginalState: 'Auf ursprünglichen Zustand zurücksetzen',
            usingImportedState: 'Sie verwenden importierten Status. Tippen Sie hier, um ihn zu löschen.',
            debugMode: 'Debug-Modus',
            invalidFile: 'Ungültige Datei',
            invalidFileDescription: 'Die Datei, die Sie zu importieren versuchen, ist ungültig. Bitte versuchen Sie es erneut.',
            invalidateWithDelay: 'Mit Verzögerung ungültig machen',
            recordTroubleshootData: 'Fehlerdiagnosedaten aufzeichnen',
            softKillTheApp: 'App sanft beenden',
            kill: 'Beenden',
        },
        debugConsole: {
            saveLog: 'Protokoll speichern',
            shareLog: 'Protokoll teilen',
            enterCommand: 'Befehl eingeben',
            execute: 'Ausführen',
            noLogsAvailable: 'Keine Protokolle verfügbar',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `Protokollgröße überschreitet das Limit von ${size} MB. Bitte verwenden Sie „Protokoll speichern“, um die Protokolldatei stattdessen herunterzuladen.`,
            logs: 'Protokolle',
            viewConsole: 'Konsole anzeigen',
        },
        security: 'Sicherheit',
        signOut: 'Abmelden',
        restoreStashed: 'Gepufferten Login wiederherstellen',
        signOutConfirmationText: 'Wenn du dich abmeldest, gehen alle Offline-Änderungen verloren.',
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
        closeAccountPermanentlyDeleteData: 'Sind Sie sicher, dass Sie Ihr Konto löschen möchten? Dadurch werden alle ausstehenden Ausgaben dauerhaft gelöscht.',
        enterDefaultContactToConfirm: 'Bitte geben Sie Ihre Standardkontaktmethode ein, um zu bestätigen, dass Sie Ihr Konto schließen möchten. Ihre Standardkontaktmethode ist:',
        enterDefaultContact: 'Gib deine bevorzugte Kontaktmethode ein',
        defaultContact: 'Standardkontaktmethode',
        enterYourDefaultContactMethod: 'Bitte geben Sie Ihre bevorzugte Kontaktmethode ein, um Ihr Konto zu schließen.',
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
                `Das Zusammenführen Ihrer Konten ist unumkehrbar und führt zum Verlust aller nicht eingereichten Ausgaben für <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Um fortzufahren, gib bitte den magischen Code ein, der an <strong>${login}</strong> gesendet wurde.`,
            errors: {
                incorrectMagicCode: 'Falscher oder ungültiger magischer Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
                fallback: 'Etwas ist schiefgelaufen. Bitte versuche es später noch einmal.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konten zusammengeführt!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Du hast alle Daten aus <strong>${from}</strong> erfolgreich mit <strong>${to}</strong> zusammengeführt. Künftig kannst du für dieses Konto entweder die eine oder die andere Anmeldung verwenden.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Wir arbeiten daran',
            limitedSupport: 'Wir unterstützen das Zusammenführen von Konten in New Expensify noch nicht. Bitte führen Sie diese Aktion stattdessen in Expensify Classic aus.',
            reachOutForHelp: '<muted-text><centered-text>Wenn du Fragen hast, kannst du dich gerne an <concierge-link>Concierge wenden</concierge-link>!</centered-text></muted-text>',
            goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Sie können <strong>${email}</strong> nicht zusammenführen, da es von <strong>${email.split('@').at(1) ?? ''}</strong> verwaltet wird. Bitte wenden Sie sich für Unterstützung an <concierge-link>Concierge</concierge-link>.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Sie können <strong>${email}</strong> nicht mit anderen Konten zusammenführen, da Ihr Domain-Admin es als Ihren primären Login festgelegt hat. Bitte führen Sie stattdessen andere Konten mit diesem Konto zusammen.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Du kannst Konten nicht zusammenführen, weil für <strong>${email}</strong> die Zwei-Faktor-Authentifizierung (2FA) aktiviert ist. Deaktiviere bitte 2FA für <strong>${email}</strong> und versuche es erneut.</centered-text></muted-text>`,
            learnMore: 'Weitere Informationen zum Zusammenführen von Konten.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Du kannst <strong>${email}</strong> nicht zusammenführen, da es gesperrt ist. Bitte <concierge-link>wende dich an Concierge</concierge-link>, um Hilfe zu erhalten.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Konten können nicht zusammengeführt werden, da <strong>${email}</strong> kein Expensify-Konto hat. Bitte <a href="${contactMethodLink}">fügen Sie es stattdessen als Kontaktmethode hinzu</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Du kannst <strong>${email}</strong> nicht mit anderen Konten zusammenführen. Bitte führe stattdessen andere Konten mit diesem zusammen.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>You can’t merge accounts into <strong>${email}</strong> because this account owns an invoiced billing relationship.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Versuche es später erneut',
            description: 'Es gab zu viele Versuche, Konten zusammenzuführen. Bitte versuchen Sie es später erneut.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Sie können nicht in andere Konten zusammenführen, weil dieses Konto nicht verifiziert ist. Bitte verifizieren Sie das Konto und versuchen Sie es erneut.',
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
            'Ist Ihnen etwas Ungewöhnliches an Ihrem Konto aufgefallen? Wenn Sie dies melden, wird Ihr Konto sofort gesperrt, neue Expensify Card-Transaktionen werden blockiert und alle Kontoänderungen verhindert.',
        domainAdminsDescription: 'Für Domain-Administratoren: Dadurch werden auch alle Expensify Card-Aktivitäten und Administratoraktionen in deinen Domain(s) pausiert.',
        areYouSure: 'Sind Sie sicher, dass Sie Ihr Expensify-Konto sperren möchten?',
        onceLocked: 'Sobald Ihr Konto gesperrt ist, wird es eingeschränkt, bis eine Entsperranfrage gestellt und eine Sicherheitsüberprüfung durchgeführt wurde',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Konto konnte nicht gesperrt werden',
        failedToLockAccountDescription: `Wir konnten Ihr Konto nicht sperren. Bitte chatten Sie mit Concierge, um dieses Problem zu beheben.`,
        chatWithConcierge: 'Mit Concierge chatten',
    },
    unlockAccountPage: {
        accountLocked: 'Konto gesperrt',
        yourAccountIsLocked: 'Ihr Konto ist gesperrt',
        chatToConciergeToUnlock: 'Chatte mit Concierge, um Sicherheitsbedenken zu klären und dein Konto zu entsperren.',
        chatWithConcierge: 'Mit Concierge chatten',
    },
    passwordPage: {
        changePassword: 'Passwort ändern',
        changingYourPasswordPrompt: 'Wenn Sie Ihr Passwort ändern, wird es sowohl für Ihr Expensify.com- als auch für Ihr New Expensify-Konto aktualisiert.',
        currentPassword: 'Aktuelles Passwort',
        newPassword: 'Neues Passwort',
        newPasswordPrompt: 'Ihr neues Passwort muss sich von Ihrem alten Passwort unterscheiden und mindestens 8 Zeichen, 1 Großbuchstaben, 1 Kleinbuchstaben und 1 Zahl enthalten.',
    },
    twoFactorAuth: {
        headerTitle: 'Zwei-Faktor-Authentifizierung',
        twoFactorAuthEnabled: 'Zwei-Faktor-Authentifizierung aktiviert',
        whatIsTwoFactorAuth:
            'Die Zwei-Faktor-Authentifizierung (2FA) hilft, Ihr Konto sicher zu halten. Beim Anmelden müssen Sie einen Code eingeben, der von Ihrer bevorzugten Authentifizierungs-App generiert wird.',
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
        stepVerify: 'Verifizieren',
        scanCode: 'Scannen Sie den QR-Code mit Ihrem',
        authenticatorApp: 'Authentifizierungs-App',
        addKey: 'Oder füge diesen geheimen Schlüssel zu deiner Authentifizierungs-App hinzu:',
        enterCode: 'Gib dann den sechsstelligen Code ein, der von deiner Authentifizierungs-App generiert wurde.',
        stepSuccess: 'Fertig',
        enabled: 'Zwei-Faktor-Authentifizierung aktiviert',
        congrats: 'Glückwunsch! Jetzt hast du diese zusätzliche Sicherheit.',
        copy: 'Kopieren',
        disable: 'Deaktivieren',
        enableTwoFactorAuth: 'Zwei-Faktor-Authentifizierung aktivieren',
        pleaseEnableTwoFactorAuth: 'Bitte aktivieren Sie die Zwei-Faktor-Authentifizierung.',
        twoFactorAuthIsRequiredDescription: 'Aus Sicherheitsgründen erfordert Xero eine Zwei-Faktor-Authentifizierung, um die Integration zu verbinden.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Zwei-Faktor-Authentifizierung erforderlich',
        twoFactorAuthIsRequiredForAdminsTitle: 'Bitte die Zwei-Faktor-Authentifizierung aktivieren',
        twoFactorAuthIsRequiredXero:
            'Ihre Xero-Buchhaltungsverknüpfung erfordert die Verwendung der Zwei-Faktor-Authentifizierung. Bitte aktivieren Sie sie, um Expensify weiterhin nutzen zu können.',
        twoFactorAuthIsRequiredCompany: 'Ihr Unternehmen verlangt die Verwendung der Zwei-Faktor-Authentifizierung. Um Expensify weiterhin nutzen zu können, aktivieren Sie sie bitte.',
        twoFactorAuthCannotDisable: '2FA kann nicht deaktiviert werden',
        twoFactorAuthRequired: 'Für Ihre Xero-Verbindung ist eine Zwei-Faktor-Authentifizierung (2FA) erforderlich und kann nicht deaktiviert werden.',
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
        personalNoteMessage: 'Führe hier Notizen zu diesem Chat. Du bist die einzige Person, die diese Notizen hinzufügen, bearbeiten oder ansehen kann.',
        sharedNoteMessage: 'Notizen zu diesem Chat hier festhalten. Expensify-Mitarbeitende und andere Mitglieder in der team.expensify.com-Domain können diese Notizen einsehen.',
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
        note: `Hinweis: Wenn Sie Ihre Zahlung in einer anderen Währung leisten, kann sich dies darauf auswirken, wie viel Sie für Expensify bezahlen. Einzelheiten dazu finden Sie auf unserer <a href="${CONST.PRICING}">Preisseite</a>.`,
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
            expirationDate: 'Bitte ein gültiges Ablaufdatum auswählen',
            securityCode: 'Bitte gib einen gültigen Sicherheitscode ein',
            addressStreet: 'Bitte geben Sie eine gültige Rechnungsadresse ein, die kein Postfach ist.',
            addressState: 'Bitte wählen Sie einen Bundesstaat aus',
            addressCity: 'Bitte gib eine Stadt ein',
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
            expirationDate: 'Bitte ein gültiges Ablaufdatum auswählen',
            securityCode: 'Bitte gib einen gültigen Sicherheitscode ein',
            addressStreet: 'Bitte geben Sie eine gültige Rechnungsadresse ein, die kein Postfach ist.',
            addressState: 'Bitte wählen Sie einen Bundesstaat aus',
            addressCity: 'Bitte gib eine Stadt ein',
            genericFailureMessage: 'Beim Hinzufügen Ihrer Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            password: 'Bitte geben Sie Ihr Expensify-Passwort ein',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Zahlungsmethoden',
        setDefaultConfirmation: 'Standardzahlungsmethode festlegen',
        setDefaultSuccess: 'Standardzahlungsmethode festgelegt!',
        deleteAccount: 'Konto löschen',
        deleteConfirmation: 'Sind Sie sicher, dass Sie dieses Konto löschen möchten?',
        error: {
            notOwnerOfBankAccount: 'Beim Festlegen dieses Bankkontos als Ihre Standardzahlungsmethode ist ein Fehler aufgetreten',
            invalidBankAccount: 'Dieses Bankkonto ist vorübergehend gesperrt',
            notOwnerOfFund: 'Beim Festlegen dieser Karte als Ihre Standardzahlungsmethode ist ein Fehler aufgetreten',
            setDefaultFailure: 'Etwas ist schiefgelaufen. Bitte chatte mit Concierge, um weitere Unterstützung zu erhalten.',
        },
        addBankAccountFailure: 'Beim Hinzufügen Ihres Bankkontos ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        getPaidFaster: 'Schneller bezahlt werden',
        addPaymentMethod: 'Füge eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        getPaidBackFaster: 'Schneller zurückgezahlt werden',
        secureAccessToYourMoney: 'Sicherer Zugriff auf Ihr Geld',
        receiveMoney: 'Geld in deiner lokalen Währung empfangen',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Sende und empfange Geld mit Freunden. Nur für US-Bankkonten.',
        enableWallet: 'Wallet aktivieren',
        addBankAccountToSendAndReceive: 'Füge ein Bankkonto hinzu, um Zahlungen zu senden oder zu empfangen.',
        addDebitOrCreditCard: 'Debit- oder Kreditkarte hinzufügen',
        assignedCards: 'Zugewiesene Karten',
        assignedCardsDescription: 'Dies sind Karten, die von einem Workspace-Admin zugewiesen wurden, um die Ausgaben des Unternehmens zu verwalten.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Wir überprüfen Ihre Angaben. Bitte schauen Sie in ein paar Minuten noch einmal vorbei!',
        walletActivationFailed: 'Leider kann dein Wallet derzeit nicht aktiviert werden. Bitte chatte mit Concierge, um weitere Unterstützung zu erhalten.',
        addYourBankAccount: 'Fügen Sie Ihr Bankkonto hinzu',
        addBankAccountBody: 'Lassen Sie uns Ihr Bankkonto mit Expensify verbinden, damit Sie so einfach wie nie zuvor direkt in der App Zahlungen senden und empfangen können.',
        chooseYourBankAccount: 'Wählen Sie Ihr Bankkonto',
        chooseAccountBody: 'Stellen Sie sicher, dass Sie die richtige Option auswählen.',
        confirmYourBankAccount: 'Bestätige dein Bankkonto',
        personalBankAccounts: 'Persönliche Bankkonten',
        businessBankAccounts: 'Geschäftsbankkonten',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify-Reisekarte',
        availableSpend: 'Verbleibendes Limit',
        smartLimit: {
            name: 'Intelligentes Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Sie können bis zu ${formattedLimit} mit dieser Karte ausgeben, und das Limit wird zurückgesetzt, sobald Ihre eingereichten Ausgaben genehmigt werden.`,
        },
        fixedLimit: {
            name: 'Festes Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Du kannst bis zu ${formattedLimit} mit dieser Karte ausgeben, danach wird sie deaktiviert.`,
        },
        monthlyLimit: {
            name: 'Monatliches Limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Sie können diese Karte mit bis zu ${formattedLimit} pro Monat nutzen. Das Limit wird am 1. Tag jedes Kalendermonats zurückgesetzt.`,
        },
        virtualCardNumber: 'Virtuelle Kartennummer',
        travelCardCvv: 'CVV der Reisekarte',
        physicalCardNumber: 'Physische Kartennummer',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Physische Karte bestellen',
        reportFraud: 'Virtuellen Kartenbetrug melden',
        reportTravelFraud: 'Reisekartenbetrug melden',
        reviewTransaction: 'Transaktion prüfen',
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
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Zum ${platform}-Wallet hinzugefügt`,
        cardDetailsLoadingFailure: 'Beim Laden der Kartendetails ist ein Fehler aufgetreten. Bitte überprüfe deine Internetverbindung und versuche es erneut.',
        validateCardTitle: 'Lass uns sicherstellen, dass du es bist',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um deine Kartendaten anzuzeigen. Er sollte innerhalb ein bis zwei Minuten ankommen.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) =>
            `Bitte <a href="${missingDetailsLink}">fügen Sie Ihre persönlichen Daten hinzu</a> und versuchen Sie es dann erneut.`,
        unexpectedError: 'Beim Abrufen deiner Expensify-Kartendaten ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        cardFraudAlert: {
            confirmButtonText: 'Ja, das tue ich',
            reportFraudButtonText: 'Nein, das war ich nicht',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `hat die verdächtige Aktivität geklärt und Karte x${cardLastFour} reaktiviert. Alles bereit, um weiter Ausgaben abzurechnen!`,
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
            }) => `verdächtige Aktivität auf einer Karte mit Endziffern ${cardLastFour} erkannt. Erkennen Sie diese Abbuchung?

${amount} für ${merchant} – ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Ausgaben',
        workflowDescription: 'Konfigurieren Sie einen Workflow ab dem Moment, in dem Ausgaben anfallen, einschließlich Genehmigung und Zahlung.',
        submissionFrequency: 'Übermittlungshäufigkeit',
        submissionFrequencyDescription: 'Wählen Sie einen benutzerdefinierten Zeitplan für das Einreichen von Ausgaben.',
        submissionFrequencyDateOfMonth: 'Tag des Monats',
        disableApprovalPromptDescription: 'Das Deaktivieren von Genehmigungen löscht alle vorhandenen Genehmigungs-Workflows.',
        addApprovalsTitle: 'Genehmigungen hinzufügen',
        addApprovalButton: 'Genehmigungs-Workflow hinzufügen',
        addApprovalTip: 'Dieser Standard-Workflow gilt für alle Mitglieder, sofern kein spezifischerer Workflow existiert.',
        approver: 'Genehmiger',
        addApprovalsDescription: 'Zusätzliche Genehmigung anfordern, bevor eine Zahlung autorisiert wird.',
        makeOrTrackPaymentsTitle: 'Zahlungen tätigen oder nachverfolgen',
        makeOrTrackPaymentsDescription: 'Fügen Sie einen autorisierten Zahler für in Expensify getätigte Zahlungen hinzu oder verfolgen Sie Zahlungen, die anderswo getätigt wurden.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>In diesem Workspace ist ein benutzerdefinierter Genehmigungsworkflow aktiviert. Um diesen Workflow zu überprüfen oder zu ändern, wenden Sie sich bitte an Ihre(n) <account-manager-link>Account Manager</account-manager-link> oder <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Ein benutzerdefinierter Genehmigungs-Workflow ist in diesem Workspace aktiviert. Um diesen Workflow zu überprüfen oder zu ändern, wenden Sie sich bitte an <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Wählen Sie aus, wie lange Expensify warten soll, bevor fehlerfreie Ausgaben geteilt werden.',
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
                one: '.',
                two: 'und',
                few: '.',
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
                '10': 'Zehntes',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Dieses Mitglied gehört bereits zu einem anderen Genehmigungsworkflow. Alle Aktualisierungen hier werden sich auch dort widerspiegeln.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> genehmigt bereits Berichte an <strong>${name2}</strong>. Bitte wähle eine andere approvierende Person, um einen zirkulären Workflow zu vermeiden.`,
        emptyContent: {
            title: 'Keine Mitglieder zum Anzeigen',
            expensesFromSubtitle: 'Alle Workspace-Mitglieder gehören bereits zu einem bestehenden Genehmigungsworkflow.',
            approverSubtitle: 'Alle Genehmigenden gehören zu einem bestehenden Workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Die Einreichungshäufigkeit konnte nicht geändert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
        monthlyOffsetErrorMessage: 'Die monatliche Häufigkeit konnte nicht geändert werden. Bitte versuche es erneut oder kontaktiere den Support.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Bestätigen',
        header: 'Füge weitere Genehmigende hinzu und bestätige.',
        additionalApprover: 'Zusätzliche Genehmiger',
        submitButton: 'Workflow hinzufügen',
    },
    workflowsEditApprovalsPage: {
        title: 'Genehmigungsworkflow bearbeiten',
        deleteTitle: 'Genehmigungsworkflow löschen',
        deletePrompt: 'Sind Sie sicher, dass Sie diesen Genehmigungs-Workflow löschen möchten? Alle Mitglieder werden anschließend dem Standard-Workflow folgen.',
    },
    workflowsExpensesFromPage: {
        title: 'Ausgaben von',
        header: 'Wenn die folgenden Mitglieder Auslagen einreichen:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Die genehmigende Person konnte nicht geändert werden. Bitte versuche es erneut oder kontaktiere den Support.',
        header: 'Zur Genehmigung an dieses Mitglied senden:',
    },
    workflowsPayerPage: {
        title: 'Autorisierter Zahler',
        genericErrorMessage: 'Der autorisierte Zahler konnte nicht geändert werden. Bitte versuche es erneut.',
        admins: 'Admins',
        payer: 'Zahler',
        paymentAccount: 'Zahlungskonto',
    },
    reportFraudPage: {
        title: 'Virtuellen Kartenbetrug melden',
        description:
            'Wenn Ihre virtuellen Kartendaten gestohlen oder kompromittiert wurden, deaktivieren wir Ihre bestehende Karte dauerhaft und stellen Ihnen eine neue virtuelle Karte mit neuer Nummer aus.',
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
        pleaseEnterLastFour: 'Bitte gib die letzten vier Ziffern deiner Karte ein.',
        activatePhysicalCard: 'Physische Karte aktivieren',
        error: {
            thatDidNotMatch: 'Die eingegebenen Ziffern stimmen nicht mit den letzten 4 Ziffern Ihrer Karte überein. Bitte versuchen Sie es erneut.',
            throttled:
                'Du hast die letzten 4 Ziffern deiner Expensify Card zu oft falsch eingegeben. Wenn du sicher bist, dass die Nummern korrekt sind, wende dich bitte an Concierge, um das Problem zu lösen. Andernfalls versuche es später noch einmal.',
        },
    },
    getPhysicalCard: {
        header: 'Physische Karte bestellen',
        nameMessage: 'Geben Sie Ihren Vor- und Nachnamen ein, da dieser auf Ihrer Karte angezeigt wird.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        phoneMessage: 'Gib deine Telefonnummer ein.',
        phoneNumber: 'Telefonnummer',
        address: 'Adresse',
        addressMessage: 'Gib deine Lieferadresse ein.',
        streetAddress: 'Straßenadresse',
        city: 'Stadt',
        state: 'Bundesland',
        zipPostcode: 'Postleitzahl',
        country: 'Land',
        confirmMessage: 'Bitte bestätigen Sie unten Ihre Angaben.',
        estimatedDeliveryMessage: 'Ihre physische Karte wird in 2–3 Werktagen ankommen.',
        next: 'Weiter',
        getPhysicalCard: 'Physische Karte bestellen',
        shipCard: 'Karte versenden',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Überweisen${amount ? ` ${amount}` : ''}`,
        instant: 'Sofort (Debitkarte)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% Gebühr (mindestens ${minAmount})`,
        ach: '1–3 Werktage (Bankkonto)',
        achSummary: 'Keine Gebühr',
        whichAccount: 'Welches Konto?',
        fee: 'Gebühr',
        transferSuccess: 'Überweisung erfolgreich!',
        transferDetailBankAccount: 'Ihr Geld sollte in den nächsten 1–3 Werktagen eingehen.',
        transferDetailDebitCard: 'Ihr Geld sollte sofort eingehen.',
        failedTransfer: 'Ihr Guthaben ist noch nicht vollständig ausgeglichen. Bitte überweisen Sie es auf ein Bankkonto.',
        notHereSubTitle: 'Bitte überweisen Sie Ihr Guthaben von der Wallet-Seite.',
        goToWallet: 'Zur Geldbörse gehen',
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
        bankAccountLastFour: ({lastFour}: BankAccountLastFourParams) => `Bankkonto • ${lastFour}`,
    },
    preferencesPage: {
        appSection: {
            title: 'App-Einstellungen',
        },
        testSection: {
            title: 'Testeinstellungen',
            subtitle: 'Einstellungen zur Fehlerbehebung und zum Testen der App in der Staging-Umgebung.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Relevante Funktionsaktualisierungen und Expensify‑Neuigkeiten erhalten',
        muteAllSounds: 'Alle Töne von Expensify stummschalten',
    },
    priorityModePage: {
        priorityMode: 'Prioritätsmodus',
        explainerText: 'Wähle, ob du dich nur auf ungelesene und angeheftete Chats #focusierst oder alles anzeigen möchtest, wobei die neuesten und angehefteten Chats oben stehen.',
        priorityModes: {
            default: {
                label: 'Neueste',
                description: 'Alle Chats anzeigen, sortiert nach Datum (neueste zuerst)',
            },
            gsd: {
                label: '#Fokus',
                description: 'Nur ungelesene alphabetisch sortiert anzeigen',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
        generatingPDF: 'PDF wird erstellt …',
        waitForPDF: 'Bitte warten Sie, während wir das PDF erstellen',
        errorPDF: 'Beim Versuch, Ihr PDF zu erstellen, ist ein Fehler aufgetreten',
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
        aiGenerated: 'Die Übersetzungen für diese Sprache werden automatisch generiert und können Fehler enthalten.',
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
        terms: `<muted-text-xs>Mit dem Einloggen stimmen Sie den <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und der <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzrichtlinie</a> zu.</muted-text-xs>`,
        license: `<muted-text-xs>Die Geldübermittlung wird von ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS-ID:2017010) gemäß seinen <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">Lizenzen</a> bereitgestellt.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Keinen Magic-Code erhalten?',
        enterAuthenticatorCode: 'Bitte geben Sie Ihren Authentifikator-Code ein',
        enterRecoveryCode: 'Bitte gib deinen Wiederherstellungscode ein',
        requiredWhen2FAEnabled: 'Erforderlich, wenn 2FA aktiviert ist',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Neuen Code in <a>${timeRemaining}</a> anfordern`,
        requestNewCodeAfterErrorOccurred: 'Neuen Code anfordern',
        error: {
            pleaseFillMagicCode: 'Bitte gib deinen magischen Code ein',
            incorrectMagicCode: 'Falscher oder ungültiger magischer Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            pleaseFillTwoFactorAuth: 'Bitte gib deinen Zwei-Faktor-Authentifizierungscode ein',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Bitte fülle alle Felder aus',
        pleaseFillPassword: 'Bitte geben Sie Ihr Passwort ein',
        pleaseFillTwoFactorAuth: 'Bitte geben Sie Ihren Zwei-Faktor-Code ein',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Gib deinen Zwei-Faktor-Authentifizierungscode ein, um fortzufahren',
        forgot: 'Vergessen?',
        requiredWhen2FAEnabled: 'Erforderlich, wenn 2FA aktiviert ist',
        error: {
            incorrectPassword: 'Falsches Passwort. Bitte versuche es erneut.',
            incorrectLoginOrPassword: 'Falscher Login oder falsches Passwort. Bitte versuche es erneut.',
            incorrect2fa: 'Falscher Zwei-Faktor-Authentifizierungscode. Bitte versuche es erneut.',
            twoFactorAuthenticationEnabled: 'Für dieses Konto ist 2FA aktiviert. Bitte melden Sie sich mit Ihrer E‑Mail-Adresse oder Telefonnummer an.',
            invalidLoginOrPassword: 'Ungültiger Login oder Passwort. Bitte versuchen Sie es erneut oder setzen Sie Ihr Passwort zurück.',
            unableToResetPassword:
                'Wir konnten Ihr Passwort nicht ändern. Dies liegt wahrscheinlich an einem abgelaufenen Link zum Zurücksetzen des Passworts in einer älteren E-Mail zum Zurücksetzen. Wir haben Ihnen einen neuen Link per E-Mail gesendet, damit Sie es erneut versuchen können. Überprüfen Sie Ihren Posteingang und Ihren Spam-Ordner; die E-Mail sollte in wenigen Minuten ankommen.',
            noAccess: 'Du hast keinen Zugriff auf diese Anwendung. Bitte füge deinen GitHub-Benutzernamen hinzu, um Zugriff zu erhalten.',
            accountLocked: 'Ihr Konto wurde nach zu vielen erfolglosen Versuchen gesperrt. Bitte versuchen Sie es in 1 Stunde erneut.',
            fallback: 'Etwas ist schiefgelaufen. Bitte versuche es später noch einmal.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefon oder E-Mail',
        error: {
            invalidFormatEmailLogin: 'Die eingegebene E-Mail-Adresse ist ungültig. Bitte korrigieren Sie das Format und versuchen Sie es erneut.',
        },
        cannotGetAccountDetails: 'Kontodaten konnten nicht abgerufen werden. Bitte versuchen Sie, sich erneut anzumelden.',
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
                'Eine App, um Ihre geschäftlichen und privaten Ausgaben mit Chat-Geschwindigkeit zu verwalten. Probieren Sie sie aus und lassen Sie uns wissen, was Sie denken. Es kommt noch viel mehr!',
            secondaryDescription: 'Um zurück zu Expensify Classic zu wechseln, tippe einfach auf dein Profilbild > Zu Expensify Classic wechseln.',
        },
        getStarted: 'Loslegen',
        whatsYourName: 'Wie heißt du?',
        peopleYouMayKnow: 'Personen, die Sie vielleicht kennen, sind bereits hier! Bestätigen Sie Ihre E-Mail-Adresse, um sich ihnen anzuschließen.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) =>
            `Jemand von ${domain} hat bereits einen Workspace erstellt. Bitte gib den Magic Code ein, der an ${email} gesendet wurde.`,
        joinAWorkspace: 'Einem Workspace beitreten',
        listOfWorkspaces: 'Hier ist die Liste der Arbeitsbereiche, denen du beitreten kannst. Keine Sorge, du kannst ihnen auch später beitreten, wenn du möchtest.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} Mitglied${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Wo arbeitest du?',
        errorSelection: 'Wählen Sie eine Option, um fortzufahren',
        purpose: {
            title: 'Was möchtest du heute tun?',
            errorContinue: 'Bitte drücken Sie auf „Weiter“, um die Einrichtung abzuschließen',
            errorBackButton: 'Bitte beantworten Sie die Einrichtungsfragen, um die App nutzen zu können',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Von meinem Arbeitgeber zurückbezahlt werden',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Die Ausgaben meines Teams verwalten',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Ausgaben verfolgen und budgetieren',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Mit Freunden chatten und Ausgaben aufteilen',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Etwas anderes',
        },
        employees: {
            title: 'Wie viele Mitarbeitende haben Sie?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1–10 Mitarbeiter',
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
            title: 'An welchen Funktionen bist du interessiert?',
            featuresAlreadyEnabled: 'Hier sind unsere beliebtesten Funktionen:',
            featureYouMayBeInterestedIn: 'Zusätzliche Funktionen aktivieren:',
        },
        error: {
            requiredFirstName: 'Bitte gib deinen Vornamen ein, um fortzufahren',
        },
        workEmail: {
            title: 'Wie lautet deine Arbeits-E-Mail-Adresse?',
            subtitle: 'Expensify funktioniert am besten, wenn du deine Arbeits-E-Mail verbindest.',
            explanationModal: {
                descriptionOne: 'An Belege an receipts@expensify.com weiterleiten, um sie zu scannen',
                descriptionTwo: 'Schließen Sie sich Ihren Kolleginnen und Kollegen an, die bereits Expensify nutzen',
                descriptionThree: 'Genieße ein noch individuelleres Erlebnis',
            },
            addWorkEmail: 'Arbeits-E-Mail hinzufügen',
        },
        workEmailValidation: {
            title: 'Bestätige deine geschäftliche E-Mail-Adresse',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Bitte gib den magischen Code ein, der an ${workEmail} gesendet wurde. Er sollte in ein oder zwei Minuten ankommen.`,
        },
        workEmailValidationError: {
            publicEmail: 'Bitte gib eine gültige geschäftliche E-Mail-Adresse von einer eigenen Domain ein, z. B. mitch@company.com',
            offline: 'Wir konnten Ihre geschäftliche E-Mail nicht hinzufügen, da Sie anscheinend offline sind',
        },
        mergeBlockScreen: {
            title: 'Geschäftliche E-Mail konnte nicht hinzugefügt werden',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
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
                title: 'Spesenfreigaben hinzufügen',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Ausgabengenehmigungen hinzufügen*, um die Ausgaben deines Teams zu überprüfen und unter Kontrolle zu halten.

                        So geht's:

                        1. Gehe zu *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *More features*.
                        4. Aktiviere *Workflows*.
                        5. Navigiere zu *Workflows* im Workspace-Editor.
                        6. Aktiviere *Add approvals*.
                        7. Du wirst als Genehmiger für Ausgaben festgelegt. Du kannst dies auf einen beliebigen Admin ändern, sobald du dein Team einlädst.

                        [Zu More features wechseln](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Erstelle](${workspaceConfirmationLink}) einen Workspace`,
                description: 'Erstelle einen Workspace und konfiguriere die Einstellungen mit Hilfe deines Setup-Spezialisten!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Erstelle einen [Workspace](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Erstelle einen Workspace*, um Ausgaben zu verfolgen, Belege zu scannen, zu chatten und mehr.

                        1. Klicke auf *Workspaces* > *Neuer Workspace*.

                        *Dein neuer Workspace ist bereit!* [Sieh ihn dir an](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Richten Sie [Kategorien](${workspaceCategoriesLink}) ein`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Richte Kategorien ein*, damit dein Team Ausgaben für eine einfache Berichterstellung codieren kann.

                        1. Klicke auf *Workspaces*.
                        3. Wähle deinen Workspace aus.
                        4. Klicke auf *Categories*.
                        5. Deaktiviere alle Kategorien, die du nicht benötigst.
                        6. Füge oben rechts deine eigenen Kategorien hinzu.

                        [Zu den Workspace-Kategorieneinstellungen](${workspaceCategoriesLink}).

                        ![Kategorien einrichten](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Ausgabe einreichen',
                description: dedent(`
                    *Reiche eine Ausgabe ein*, indem du einen Betrag eingibst oder einen Beleg scannst.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Ausgabe erstellen*.
                    3. Gib einen Betrag ein oder scanne einen Beleg.
                    4. Füge die E-Mail-Adresse oder Telefonnummer deines Vorgesetzten hinzu.
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
                title: 'Eine Ausgabe erfassen',
                description: dedent(`
                    *Verfolge eine Ausgabe* in jeder Währung – ganz egal, ob du einen Beleg hast oder nicht.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Ausgabe erstellen*.
                    3. Gib einen Betrag ein oder scanne einen Beleg.
                    4. Wähle deinen *persönlichen* Bereich.
                    5. Klicke auf *Erstellen*.

                    Und fertig! Ja, so einfach ist das.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Verbinden${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'zu'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'Ihr' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Verbinde ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'Ihr' : 'bis'} ${integrationName}, um Ausgaben automatisch zu codieren und zu synchronisieren, sodass der Monatsabschluss zum Kinderspiel wird.

                        1. Klicke auf *Workspaces*.
                        2. Wähle deinen Workspace aus.
                        3. Klicke auf *Accounting*.
                        4. Suche nach ${integrationName}.
                        5. Klicke auf *Connect*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? dedent(`[Bring mich zur Buchhaltung](${workspaceAccountingLink}).

                                      ![Mit ${integrationName} verbinden](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`)
        : `[Bring mich zur Buchhaltung](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[Firmenkarte verbinden](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Verbinden Sie Ihre Firmenkarte, um Ausgaben automatisch zu importieren und zu codieren.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *Corporate cards*.
                        4. Folgen Sie den Anweisungen, um Ihre Karte zu verbinden.

                        [Zur Verbindung meiner Firmenkarten](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Lade [dein Team](${workspaceMembersLink}) ein`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Laden Sie Ihr Team ein*, Expensify zu nutzen, damit es noch heute mit der Spesenerfassung beginnen kann.

                        1. Klicken Sie auf *Workspaces*.
                        3. Wählen Sie Ihren Workspace aus.
                        4. Klicken Sie auf *Members* > *Invite member*.
                        5. Geben Sie E-Mail-Adressen oder Telefonnummern ein.
                        6. Fügen Sie eine individuelle Einladungsnachricht hinzu, wenn Sie möchten!

                        [Zu den Workspace-Mitgliedern](${workspaceMembersLink}).

                        ![Laden Sie Ihr Team ein](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Richten Sie [Kategorien](${workspaceCategoriesLink}) und [Tags](${workspaceTagsLink}) ein`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Richten Sie Kategorien und Tags ein*, damit Ihr Team Ausgaben für eine einfache Berichterstattung codieren kann.

                        Importieren Sie sie automatisch, indem Sie [Ihre Buchhaltungssoftware verbinden](${workspaceAccountingLink}), oder richten Sie sie manuell in Ihren [Workspace-Einstellungen](${workspaceCategoriesLink}) ein.`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[Tags](${workspaceTagsLink}) einrichten`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Verwende Tags, um zusätzliche Details zu Ausgaben wie Projekte, Kunden, Standorte und Abteilungen hinzuzufügen. Wenn du mehrere Ebenen von Tags benötigst, kannst du auf den Control-Tarif upgraden.

                        1. Klicke auf *Workspaces*.
                        3. Wähle deinen Workspace aus.
                        4. Klicke auf *More features*.
                        5. Aktiviere *Tags*.
                        6. Navigiere im Workspace-Editor zu *Tags*.
                        7. Klicke auf *+ Add tag*, um eigene zu erstellen.

                        [Zu weiteren Funktionen](${workspaceMoreFeaturesLink}).

                        ![Tags einrichten](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Laden Sie Ihre(n) [Buchhalter](${workspaceMembersLink}) ein`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Laden Sie Ihre:n Steuerberater:in ein*, in Ihrem Workspace zusammenzuarbeiten und Ihre Geschäftsausgaben zu verwalten.

                        1. Klicken Sie auf *Workspaces*.
                        2. Wählen Sie Ihren Workspace aus.
                        3. Klicken Sie auf *Members*.
                        4. Klicken Sie auf *Invite member*.
                        5. Geben Sie die E‑Mail-Adresse Ihres/Ihrer Steuerberaters/Steuerberaterin ein.

                        [Jetzt Ihre:n Steuerberater:in einladen](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Einen Chat starten',
                description: dedent(`
                    *Starte einen Chat* mit jedem, indem du seine E-Mail-Adresse oder Telefonnummer verwendest.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Chat starten*.
                    3. Gib eine E-Mail-Adresse oder Telefonnummer ein.

                    Wenn die Person Expensify noch nicht nutzt, wird sie automatisch eingeladen.

                    Jeder Chat wird außerdem in eine E-Mail oder Textnachricht umgewandelt, auf die sie direkt antworten können.
                `),
            },
            splitExpenseTask: {
                title: 'Eine Ausgabe aufteilen',
                description: dedent(`
                    *Ausgaben aufteilen* mit einer oder mehreren Personen.

                    1. Klicke auf die Schaltfläche ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Wähle *Chat starten*.
                    3. Gib E‑Mails oder Telefonnummern ein.
                    4. Klicke im Chat auf die graue *+*-Schaltfläche > *Ausgabe aufteilen*.
                    5. Erstelle die Ausgabe, indem du *Manuell*, *Scannen* oder *Entfernung* auswählst.

                    Du kannst bei Bedarf weitere Details hinzufügen oder sie einfach senden. Lass dir dein Geld zurückzahlen!
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
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Machen Sie eine [Probefahrt](${testDriveURL})` : 'Eine Probefahrt machen'),
            embeddedDemoIframeTitle: 'Probefahrt',
            employeeFakeReceipt: {
                description: 'Meine Probefahrt-Quittung!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Zurückgezahlt zu werden ist so einfach wie das Senden einer Nachricht. Gehen wir die Grundlagen durch.',
            onboardingPersonalSpendMessage: 'So kannst du deine Ausgaben mit nur wenigen Klicks nachverfolgen.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Deine kostenlose Testversion hat begonnen! Lass uns dich einrichten.
                        👋 Hallo, ich bin dein Expensify-Einrichtungsspezialist. Ich habe bereits einen Workspace erstellt, um die Belege und Ausgaben deines Teams zu verwalten. Um das Beste aus deiner 30-tägigen kostenlosen Testversion herauszuholen, folge einfach den verbleibenden Einrichtungsschritten unten!
                    `)
                    : dedent(`
                        # Deine kostenlose Testphase hat begonnen! Lass uns alles einrichten.
                        👋 Hallo, ich bin dein Expensify-Einrichtungsspezialist. Jetzt, wo du einen Workspace erstellt hast, nutze deine 30-tägige kostenlose Testphase optimal, indem du die folgenden Schritte befolgst!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Lassen Sie uns loslegen\n👋 Hallo, ich bin Ihr Expensify-Einrichtungsspezialist. Ich habe bereits einen Workspace erstellt, um Ihnen bei der Verwaltung Ihrer Belege und Ausgaben zu helfen. Um das Beste aus Ihrer 30-tägigen kostenlosen Testversion herauszuholen, folgen Sie einfach den verbleibenden Einrichtungsschritten unten!',
            onboardingChatSplitMessage: 'Rechnungen mit Freunden zu teilen ist so einfach wie das Senden einer Nachricht. So geht’s.',
            onboardingAdminMessage: 'Erfahre, wie du als Admin den Arbeitsbereich deines Teams verwaltest und deine eigenen Ausgaben einreichst.',
            onboardingLookingAroundMessage:
                'Expensify ist vor allem für Spesen-, Reise- und Firmenkartenverwaltung bekannt, aber wir können noch viel mehr. Sag mir einfach, woran du interessiert bist, und ich helfe dir beim Einstieg.',
            onboardingTestDriveReceiverMessage: '*Du hast 3 Monate gratis! Leg unten los.*',
        },
        workspace: {
            title: 'Bleib mit einem Workspace organisiert',
            subtitle: 'Schalte leistungsstarke Tools frei, um dein Spesenmanagement an einem zentralen Ort zu vereinfachen. Mit einem Workspace kannst du:',
            explanationModal: {
                descriptionOne: 'Belege verfolgen und organisieren',
                descriptionTwo: 'Ausgaben kategorisieren und taggen',
                descriptionThree: 'Berichte erstellen und freigeben',
            },
            price: 'Teste es 30 Tage kostenlos und steige dann für nur <strong>5 $/Nutzer/Monat</strong> auf.',
            createWorkspace: 'Workspace erstellen',
        },
        confirmWorkspace: {
            title: 'Workspace bestätigen',
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
            containsReservedWord: 'Name darf die Wörter Expensify oder Concierge nicht enthalten',
            hasInvalidCharacter: 'Name darf kein Komma oder Semikolon enthalten',
            requiredFirstName: 'Der Vorname darf nicht leer sein',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Wie lautet Ihr amtlicher Name?',
        enterDateOfBirth: 'Was ist dein Geburtsdatum?',
        enterAddress: 'Wie lautet deine Adresse?',
        enterPhoneNumber: 'Wie lautet deine Telefonnummer?',
        personalDetails: 'Persönliche Angaben',
        privateDataMessage: 'Diese Angaben werden für Reisen und Zahlungen verwendet. Sie werden niemals in deinem öffentlichen Profil angezeigt.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        address: 'Adresse',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `Datum muss vor dem ${dateString} liegen`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `Datum muss nach ${dateString} liegen`,
            hasInvalidCharacter: 'Name darf nur lateinische Zeichen enthalten',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Ungültiges Postleitzahlenformat${zipFormat ? `Zulässiges Format: ${zipFormat}` : ''}`,
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
            `Um ${secondaryLogin} zu verifizieren, senden Sie den Magic Code bitte erneut aus den Kontoeinstellungen von ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Wenn du keinen Zugriff mehr auf ${primaryLogin} hast, bitte trenne die Verknüpfung deiner Konten.`,
        unlink: 'Verknüpfung aufheben',
        linkSent: 'Link gesendet!',
        successfullyUnlinkedLogin: 'Sekundäres Login erfolgreich getrennt!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Unser E-Mail-Anbieter hat E-Mails an ${login} vorübergehend aufgrund von Zustellungsproblemen ausgesetzt. Um Ihr Login wieder freizugeben, führen Sie bitte die folgenden Schritte aus:`,
        confirmThat: ({login}: ConfirmThatParams) =>
            `<strong>Bestätigen Sie, dass ${login} korrekt geschrieben ist und eine echte, zustellbare E‑Mail-Adresse ist.</strong> E-Mail-Aliasse wie „expenses@domain.com“ müssen Zugriff auf ihr eigenes E-Mail-Postfach haben, damit sie ein gültiger Expensify-Login sind.`,
        ensureYourEmailClient: `<strong>Stellen Sie sicher, dass Ihr E-Mail-Client E-Mails von expensify.com zulässt.</strong> Anweisungen zur Ausführung dieses Schritts finden Sie <a href="${CONST.SET_NOTIFICATION_LINK}">hier</a>, aber möglicherweise benötigen Sie die Hilfe Ihrer IT-Abteilung, um Ihre E-Mail-Einstellungen zu konfigurieren.`,
        onceTheAbove: `Sobald die oben genannten Schritte abgeschlossen sind, wenden Sie sich bitte an <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a>, um Ihre Anmeldung zu entsperren.`,
    },
    openAppFailureModal: {
        title: 'Etwas ist schiefgelaufen …',
        subtitle: `Wir konnten nicht alle deine Daten laden. Wir wurden benachrichtigt und untersuchen das Problem. Wenn es weiterhin besteht, wende dich bitte an`,
        refreshAndTryAgain: 'Aktualisieren und erneut versuchen',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Wir konnten SMS-Nachrichten nicht an ${login} zustellen und haben sie daher vorübergehend gesperrt. Bitte versuchen Sie, Ihre Nummer zu bestätigen:`,
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
            return `Bitte warten! Du musst ${timeText} warten, bevor du erneut versuchst, deine Nummer zu verifizieren.`;
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
        prompt: ({priorityModePageUrl}: FocusModeUpdateParams) =>
            `Behalte den Überblick, indem du nur ungelesene Chats oder Chats siehst, die deine Aufmerksamkeit erfordern. Keine Sorge, du kannst dies jederzeit in den <a href="${priorityModePageUrl}">Einstellungen</a> ändern.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Der Chat, den du suchst, kann nicht gefunden werden.',
        getMeOutOfHere: 'Hol mich hier raus',
        iouReportNotFound: 'Die Zahlungsdetails, nach denen Sie suchen, können nicht gefunden werden.',
        notHere: 'Hm … es ist nicht hier',
        pageNotFound: 'Hoppla, diese Seite kann nicht gefunden werden',
        noAccess: 'Dieser Chat oder diese Ausgabe wurde möglicherweise gelöscht oder du hast keinen Zugriff darauf.\n\nBei Fragen wende dich bitte an concierge@expensify.com',
        goBackHome: 'Zurück zur Startseite',
        commentYouLookingForCannotBeFound: 'Der gesuchte Kommentar kann nicht gefunden werden.',
        goToChatInstead: 'Wechsle stattdessen zum Chat.',
        contactConcierge: 'Bei Fragen wenden Sie sich bitte an concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Ups … ${isBreakLine ? '\n' : ''}Etwas ist schiefgelaufen`,
        subtitle: 'Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es später noch einmal.',
        wrongTypeSubtitle: 'Diese Suche ist ungültig. Versuchen Sie, Ihre Suchkriterien anzupassen.',
    },
    setPasswordPage: {
        enterPassword: 'Passwort eingeben',
        setPassword: 'Passwort festlegen',
        newPasswordPrompt: 'Ihr Passwort muss mindestens 8 Zeichen, 1 Großbuchstaben, 1 Kleinbuchstaben und 1 Zahl enthalten.',
        passwordFormTitle: 'Willkommen zurück bei der neuen Expensify! Bitte lege dein Passwort fest.',
        passwordNotSet: 'Wir konnten Ihr neues Passwort nicht festlegen. Wir haben Ihnen einen neuen Link zum Zurücksetzen des Passworts gesendet, damit Sie es erneut versuchen können.',
        setPasswordLinkInvalid: 'Dieser Link zum Festlegen des Passworts ist ungültig oder abgelaufen. Ein neuer wartet bereits in deinem E-Mail-Posteingang auf dich!',
        validateAccount: 'Konto verifizieren',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Füge ein Emoji hinzu, damit deine Kolleginnen, Kollegen und Freundinnen, Freunde leicht wissen, was los ist. Optional kannst du auch eine Nachricht hinzufügen!',
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
        whenClearStatus: 'Wann sollen wir deinen Status löschen?',
        vacationDelegate: 'Urlaubsvertreter',
        setVacationDelegate: `Legen Sie eine Urlaubsvertretung fest, die Berichte in Ihrer Abwesenheit für Sie genehmigt.`,
        vacationDelegateError: 'Beim Aktualisieren Ihres Urlaubsvertreters ist ein Fehler aufgetreten.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `als Urlaubsvertretung von ${nameOrEmail}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `an ${submittedToName} als Urlaubsvertretung für ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Sie weisen ${nameOrEmail} als Ihre Urlaubsvertretung zu. Diese Person ist noch nicht in all Ihren Workspaces. Wenn Sie fortfahren, wird eine E-Mail an alle Workspace-Admins gesendet, damit sie hinzugefügt wird.`,
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
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        accountEnding: 'Konto endet auf',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in deinem Workspace verwendet.',
        accountNumber: 'Kontonummer',
        routingNumber: 'Routing-Nummer',
        chooseAnAccountBelow: 'Wähle unten ein Konto aus',
        addBankAccount: 'Bankkonto hinzufügen',
        chooseAnAccount: 'Konto auswählen',
        connectOnlineWithPlaid: 'Melden Sie sich bei Ihrer Bank an',
        connectManually: 'Manuell verbinden',
        desktopConnection:
            'Hinweis: Um eine Verbindung mit Chase, Wells Fargo, Capital One oder Bank of America herzustellen, klicken Sie bitte hier, um diesen Vorgang in einem Browser abzuschließen.',
        yourDataIsSecure: 'Ihre Daten sind sicher',
        toGetStarted:
            'Fügen Sie ein Bankkonto hinzu, um Ausgaben zu erstatten, Expensify Cards auszugeben, Rechnungszahlungen zu erhalten und Rechnungen an einem zentralen Ort zu bezahlen.',
        plaidBodyCopy: 'Geben Sie Ihren Mitarbeitenden eine einfachere Möglichkeit, Firmenausgaben zu bezahlen – und erstattet zu bekommen.',
        checkHelpLine: 'Ihre Bankleitzahl und Kontonummer finden Sie auf einem Scheck für dieses Konto.',
        hasPhoneLoginError: ({contactMethodRoute}: ContactMethodParams) =>
            `Um ein Bankkonto zu verknüpfen, <a href="${contactMethodRoute}">fügen Sie bitte eine E-Mail-Adresse als Ihren primären Login hinzu</a> und versuchen Sie es erneut. Sie können Ihre Telefonnummer als sekundären Login hinzufügen.`,
        hasBeenThrottledError: 'Beim Hinzufügen Ihres Bankkontos ist ein Fehler aufgetreten. Bitte warten Sie ein paar Minuten und versuchen Sie es erneut.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Ups! Es scheint, dass die Währung deines Arbeitsbereichs auf eine andere Währung als USD eingestellt ist. Um fortzufahren, gehe bitte zu <a href="${workspaceRoute}">deinen Einstellungen für den Arbeitsbereich</a>, stelle sie auf USD ein und versuche es erneut.`,
        bbaAdded: 'Geschäftsbankkonto hinzugefügt!',
        bbaAddedDescription: 'Es ist einsatzbereit für Zahlungen.',
        error: {
            youNeedToSelectAnOption: 'Bitte wählen Sie eine Option, um fortzufahren',
            noBankAccountAvailable: 'Entschuldigung, es ist kein Bankkonto verfügbar',
            noBankAccountSelected: 'Bitte wählen Sie ein Konto aus',
            taxID: 'Bitte gib eine gültige Steuer-ID-Nummer ein',
            website: 'Bitte gib eine gültige Website ein',
            zipCode: `Bitte geben Sie eine gültige Postleitzahl im folgenden Format ein: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Bitte geben Sie eine gültige Telefonnummer ein',
            email: 'Bitte gib eine gültige E‑Mail-Adresse ein',
            companyName: 'Bitte geben Sie einen gültigen Firmennamen ein',
            addressCity: 'Bitte eine gültige Stadt eingeben',
            addressStreet: 'Bitte gib eine gültige Straßenadresse ein',
            addressState: 'Bitte wählen Sie einen gültigen Bundesstaat aus',
            incorporationDateFuture: 'Das Gründungsdatum darf nicht in der Zukunft liegen',
            incorporationState: 'Bitte wählen Sie einen gültigen Bundesstaat aus',
            industryCode: 'Bitte geben Sie einen gültigen Branchenklassifizierungscode mit sechs Ziffern ein',
            restrictedBusiness: 'Bitte bestätigen Sie, dass das Unternehmen nicht auf der Liste der eingeschränkten Unternehmen steht.',
            routingNumber: 'Bitte gib eine gültige Bankleitzahl ein',
            accountNumber: 'Bitte geben Sie eine gültige Kontonummer ein',
            routingAndAccountNumberCannotBeSame: 'Routing- und Kontonummer dürfen nicht übereinstimmen',
            companyType: 'Bitte wählen Sie einen gültigen Unternehmenstyp aus',
            tooManyAttempts:
                'Aufgrund einer hohen Anzahl von Anmeldeversuchen wurde diese Option für 24 Stunden deaktiviert. Bitte versuchen Sie es später erneut oder geben Sie die Daten stattdessen manuell ein.',
            address: 'Bitte gib eine gültige Adresse ein',
            dob: 'Bitte wählen Sie ein gültiges Geburtsdatum aus',
            age: 'Muss über 18 Jahre alt sein',
            ssnLast4: 'Bitte geben Sie die gültigen letzten 4 Ziffern der SSN ein',
            firstName: 'Bitte gib einen gültigen Vornamen ein',
            lastName: 'Bitte geben Sie einen gültigen Nachnamen ein',
            noDefaultDepositAccountOrDebitCardAvailable: 'Bitte fügen Sie ein Standard-Einzahlungskonto oder eine Debitkarte hinzu',
            validationAmounts: 'Die von Ihnen eingegebenen Validierungsbeträge sind falsch. Bitte überprüfen Sie Ihren Kontoauszug noch einmal und versuchen Sie es erneut.',
            fullName: 'Bitte gib einen gültigen vollständigen Namen ein',
            ownershipPercentage: 'Bitte gib eine gültige Prozentzahl ein',
            deletePaymentBankAccount:
                'Dieses Bankkonto kann nicht gelöscht werden, da es für Expensify Card-Zahlungen verwendet wird. Wenn Sie dieses Konto dennoch löschen möchten, wenden Sie sich bitte an Concierge.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Wo befindet sich Ihr Bankkonto?',
        accountDetailsStepHeader: 'Wie lauten Ihre Kontodaten?',
        accountTypeStepHeader: 'Was für ein Konto ist das?',
        bankInformationStepHeader: 'Wie lauten Ihre Bankdaten?',
        accountHolderInformationStepHeader: 'Was sind die Kontoinhaberdaten?',
        howDoWeProtectYourData: 'Wie schützen wir Ihre Daten?',
        currencyHeader: 'Welche Währung hat dein Bankkonto?',
        confirmationStepHeader: 'Überprüfen Sie Ihre Angaben.',
        confirmationStepSubHeader: 'Überprüfen Sie die Details unten und aktivieren Sie das Kontrollkästchen für die Bedingungen, um zu bestätigen.',
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
        passwordIncorrect: 'Falsches Passwort. Bitte versuche es erneut.',
        failedToLoadPDF: 'PDF-Datei konnte nicht geladen werden',
        pdfPasswordForm: {
            title: 'Passwortgeschützte PDF',
            infoText: 'Dieses PDF ist passwortgeschützt.',
            beforeLinkText: 'Bitte',
            linkText: 'Passwort eingeben',
            afterLinkText: 'um es anzuzeigen.',
            formLabel: 'PDF anzeigen',
        },
        attachmentNotFound: 'Anhang nicht gefunden',
        retry: 'Erneut versuchen',
    },
    messages: {
        errorMessageInvalidPhone: `Bitte gib eine gültige Telefonnummer ohne Klammern oder Bindestriche ein. Wenn du dich außerhalb der USA befindest, gib bitte deine Landesvorwahl an (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Ungültige E-Mail',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} ist bereits Mitglied von ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Indem Sie mit der Anfrage zur Aktivierung Ihres Expensify Wallet fortfahren, bestätigen Sie, dass Sie Folgendes gelesen, verstanden und akzeptiert haben',
        facialScan: 'Onfidos Richtlinie und Freigabe zur Gesichtserkennung',
        tryAgain: 'Erneut versuchen',
        verifyIdentity: 'Identität verifizieren',
        letsVerifyIdentity: 'Lass uns deine Identität bestätigen',
        butFirst: `Aber zuerst das Langweilige. Lies dir den rechtlichen Text im nächsten Schritt durch und klicke auf „Akzeptieren“, wenn du bereit bist.`,
        genericError: 'Bei der Verarbeitung dieses Schritts ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        cameraPermissionsNotGranted: 'Kamera-Zugriff aktivieren',
        cameraRequestMessage: 'Wir benötigen Zugriff auf Ihre Kamera, um die Verifizierung Ihres Bankkontos abzuschließen. Bitte aktivieren Sie dies über Einstellungen > New Expensify.',
        microphonePermissionsNotGranted: 'Mikrofonzugriff aktivieren',
        microphoneRequestMessage: 'Wir benötigen Zugriff auf dein Mikrofon, um die Bankkontoverifizierung abzuschließen. Bitte aktiviere es über Einstellungen > New Expensify.',
        originalDocumentNeeded: 'Bitte laden Sie ein Originalfoto Ihres Ausweises hoch, nicht einen Screenshot oder einen Scan.',
        documentNeedsBetterQuality:
            'Ihr Ausweis scheint beschädigt zu sein oder es fehlen Sicherheitsmerkmale. Bitte laden Sie ein Originalbild eines unbeschädigten Ausweises hoch, der vollständig sichtbar ist.',
        imageNeedsBetterQuality: 'Es gibt ein Problem mit der Bildqualität deines Ausweises. Bitte lade ein neues Bild hoch, auf dem dein gesamter Ausweis deutlich zu erkennen ist.',
        selfieIssue: 'Es gibt ein Problem mit deinem Selfie/Video. Bitte lade ein aktuelles Selfie/Video hoch.',
        selfieNotMatching: 'Dein Selfie/Video stimmt nicht mit deinem Ausweis überein. Bitte lade ein neues Selfie/Video hoch, auf dem dein Gesicht deutlich zu erkennen ist.',
        selfieNotLive: 'Dein Selfie/Video scheint kein Live-Foto/-Video zu sein. Bitte lade ein Live-Selfie/-Video hoch.',
    },
    additionalDetailsStep: {
        headerTitle: 'Zusätzliche Details',
        helpText: 'Wir müssen die folgenden Informationen bestätigen, bevor du mit deinem Wallet Geld senden und empfangen kannst.',
        helpTextIdologyQuestions: 'Wir müssen dir nur noch ein paar Fragen stellen, um deine Identität abschließend zu bestätigen.',
        helpLink: 'Erfahren Sie mehr darüber, warum wir das benötigen.',
        legalFirstNameLabel: 'Gesetzlicher Vorname',
        legalMiddleNameLabel: 'Zweiter Vorname',
        legalLastNameLabel: 'Rechtlicher Nachname',
        selectAnswer: 'Bitte wählen Sie eine Antwort aus, um fortzufahren',
        ssnFull9Error: 'Bitte geben Sie eine gültige neunstelligе SSN ein',
        needSSNFull9: 'Wir haben Probleme, Ihre SSN zu verifizieren. Bitte geben Sie alle neun Ziffern Ihrer SSN ein.',
        weCouldNotVerify: 'Wir konnten dies nicht verifizieren',
        pleaseFixIt: 'Bitte korrigiere diese Angaben, bevor du fortfährst',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Wir konnten Ihre Identität nicht verifizieren. Bitte versuchen Sie es später erneut oder wenden Sie sich an <a href="mailto:${conciergeEmail}">${conciergeEmail}</a>, wenn Sie Fragen haben.`,
    },
    termsStep: {
        headerTitle: 'Bedingungen und Gebühren',
        headerTitleRefactor: 'Gebühren und Bedingungen',
        haveReadAndAgreePlain: 'Ich habe gelesen und stimme zu, elektronische Mitteilungen zu erhalten.',
        haveReadAndAgree: `Ich habe gelesen und stimme zu, <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">elektronische Offenlegungen</a> zu erhalten.`,
        agreeToThePlain: 'Ich stimme der Datenschutz- und Wallet-Vereinbarung zu.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Ich stimme der <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzerklärung</a> und der <a href="${walletAgreementUrl}">Wallet-Vereinbarung</a> zu.`,
        enablePayments: 'Zahlungen aktivieren',
        monthlyFee: 'Monatliche Gebühr',
        inactivity: 'Inaktivität',
        noOverdraftOrCredit: 'Keine Überziehungs-/Kreditfunktion.',
        electronicFundsWithdrawal: 'Elektronische Abbuchung von Geldmitteln',
        standard: 'Standard',
        reviewTheFees: 'Wirf einen Blick auf einige Gebühren.',
        checkTheBoxes: 'Bitte kreuzen Sie die untenstehenden Kästchen an.',
        agreeToTerms: 'Stimmen Sie den Bedingungen zu und Sie sind startklar!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Die Expensify Wallet wird von ${walletProgram} herausgegeben.`,
            perPurchase: 'Pro Einkauf',
            atmWithdrawal: 'Geldautomat-Abhebung',
            cashReload: 'Bargeldaufladung',
            inNetwork: 'im Netzwerk',
            outOfNetwork: 'außerhalb des Netzwerks',
            atmBalanceInquiry: 'Kontostandsabfrage am Geldautomaten (im Netz oder außerhalb des Netzes)',
            customerService: 'Kundenservice (automatisiert oder Live-Agent)',
            inactivityAfterTwelveMonths: 'Inaktivität (nach 12 Monaten ohne Transaktionen)',
            weChargeOneFee: 'Wir berechnen 1 andere Gebührenart. Sie ist:',
            fdicInsurance: 'Ihre Gelder sind für eine FDIC-Versicherung berechtigt.',
            generalInfo: `Allgemeine Informationen zu Prepaid-Konten finden Sie unter <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Weitere Informationen und Bedingungen zu allen Gebühren und Dienstleistungen finden Sie unter <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> oder telefonisch unter +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektronische Abbuchung (sofort)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(mind. ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Eine Liste aller Expensify-Wallet-Gebühren',
            typeOfFeeHeader: 'Alle Gebühren',
            feeAmountHeader: 'Betrag',
            moreDetailsHeader: 'Details',
            openingAccountTitle: 'Konto eröffnen',
            openingAccountDetails: 'Für die Kontoeröffnung fällt keine Gebühr an.',
            monthlyFeeDetails: 'Es gibt keine monatliche Gebühr.',
            customerServiceTitle: 'Kundenservice',
            customerServiceDetails: 'Es fallen keine Kundendienstgebühren an.',
            inactivityDetails: 'Es gibt keine Inaktivitätsgebühr.',
            sendingFundsTitle: 'Senden von Geld an einen anderen Kontoinhaber',
            sendingFundsDetails: 'Es fällt keine Gebühr an, wenn du mit deinem Guthaben, Bankkonto oder deiner Debitkarte Geld an einen anderen Kontoinhaber sendest.',
            electronicFundsStandardDetails:
                'Für Überweisungen von Ihrem Expensify Wallet auf Ihr Bankkonto mit der Standardoption fällt keine Gebühr an. Diese Überweisung wird normalerweise innerhalb von 1–3 Werktagen abgeschlossen.',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                'Für Überweisungen von deinem Expensify Wallet auf deine verknüpfte Debitkarte per Sofortüberweisung fällt eine Gebühr an. Diese Überweisung wird normalerweise innerhalb weniger Minuten abgeschlossen.' +
                `Die Gebühr beträgt ${percentage}% des Überweisungsbetrags (mit einer Mindestgebühr von ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Ihre Gelder sind für eine FDIC-Versicherung berechtigt. Ihre Gelder werden bei ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, einer von der FDIC versicherten Institution, gehalten oder dorthin übertragen.` +
                `Sobald sie dort eingegangen sind, sind Ihre Gelder bis zu ${amount} durch die FDIC versichert, falls ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} ausfällt, sofern bestimmte Einlagensicherungsanforderungen erfüllt sind und Ihre Karte registriert ist. Einzelheiten finden Sie unter ${CONST.TERMS.FDIC_PREPAID}.`,
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
        checkBackLaterTitle: 'Nur eine Minute …',
        checkBackLaterMessage: 'Wir überprüfen Ihre Angaben noch. Bitte schauen Sie später noch einmal vorbei.',
        continueToPayment: 'Weiter zur Bezahlung',
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
        incorporationState: 'Gründungsstaat',
        industryClassificationCode: 'Branchenschlüssel',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht im/auf dem',
        listOfRestrictedBusinesses: 'Liste eingeschränkter Unternehmen',
        incorporationDatePlaceholder: 'Anfangsdatum (jjjj-mm-tt)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Unternehmen',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Genossenschaft',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Sonstiges',
        },
        industryClassification: 'Unter welcher Branche ist das Unternehmen eingeordnet?',
        industryClassificationCodePlaceholder: 'Nach Branchenklassifizierungscode suchen',
    },
    requestorStep: {
        headerTitle: 'Persönliche Informationen',
        learnMore: 'Mehr erfahren',
        isMyDataSafe: 'Sind meine Daten sicher?',
    },
    personalInfoStep: {
        personalInfo: 'Persönliche Daten',
        enterYourLegalFirstAndLast: 'Wie lautet Ihr amtlicher Name?',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        legalName: 'Rechtlicher Name',
        enterYourDateOfBirth: 'Was ist dein Geburtsdatum?',
        enterTheLast4: 'Wie lauten die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4SSN: 'Letzte 4 Ziffern der SSN',
        enterYourAddress: 'Wie lautet deine Adresse?',
        address: 'Adresse',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        byAddingThisBankAccount: 'Indem Sie dieses Bankkonto hinzufügen, bestätigen Sie, dass Sie Folgendes gelesen, verstanden und akzeptiert haben',
        whatsYourLegalName: 'Wie lautet Ihr amtlicher Name?',
        whatsYourDOB: 'Was ist dein Geburtsdatum?',
        whatsYourAddress: 'Wie lautet deine Adresse?',
        whatsYourSSN: 'Wie lauten die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        noPersonalChecks: 'Keine Sorge, hier gibt es keine persönlichen Bonitätsprüfungen!',
        whatsYourPhoneNumber: 'Wie lautet deine Telefonnummer?',
        weNeedThisToVerify: 'Wir benötigen dies, um deine Wallet zu verifizieren.',
    },
    businessInfoStep: {
        businessInfo: 'Unternehmensinformationen',
        enterTheNameOfYourBusiness: 'Wie heißt dein Unternehmen?',
        businessName: 'Rechtlicher Firmenname',
        enterYourCompanyTaxIdNumber: 'Wie lautet die Steuer-ID-Nummer Ihres Unternehmens?',
        taxIDNumber: 'Steuernummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        enterYourCompanyWebsite: 'Wie lautet die Website Ihres Unternehmens?',
        companyWebsite: 'Unternehmenswebsite',
        enterYourCompanyPhoneNumber: 'Wie lautet die Telefonnummer Ihres Unternehmens?',
        enterYourCompanyAddress: 'Wie lautet die Adresse Ihres Unternehmens?',
        selectYourCompanyType: 'Um welche Art von Unternehmen handelt es sich?',
        companyType: 'Unternehmenstyp',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Unternehmen',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Genossenschaft',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Sonstiges',
        },
        selectYourCompanyIncorporationDate: 'Was ist das Gründungsdatum Ihres Unternehmens?',
        incorporationDate: 'Gründungsdatum',
        incorporationDatePlaceholder: 'Anfangsdatum (jjjj-mm-tt)',
        incorporationState: 'Gründungsstaat',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In welchem Bundesstaat wurde Ihr Unternehmen gegründet?',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        companyAddress: 'Firmenadresse',
        listOfRestrictedBusinesses: 'Liste eingeschränkter Unternehmen',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht im/auf dem',
        businessInfoTitle: 'Geschäftsinformationen',
        legalBusinessName: 'Rechtlicher Unternehmensname',
        whatsTheBusinessName: 'Wie lautet der Unternehmensname?',
        whatsTheBusinessAddress: 'Wie lautet die Geschäftsadresse?',
        whatsTheBusinessContactInformation: 'Wie lauten die geschäftlichen Kontaktinformationen?',
        whatsTheBusinessRegistrationNumber: ({country}: BusinessRegistrationNumberParams) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Was ist die Unternehmensregisternummer (CRN)?';
                default:
                    return 'Wie lautet die Unternehmensregisternummer?';
            }
        },
        whatsTheBusinessTaxIDEIN: ({country}: BusinessTaxIDParams) => {
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
        whatsThisNumber: 'Was ist diese Nummer?',
        whereWasTheBusinessIncorporated: 'Wo wurde das Unternehmen gegründet?',
        whatTypeOfBusinessIsIt: 'Welche Art von Unternehmen ist es?',
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
        incorporationTypeName: 'Gesellschaftsform',
        businessCategory: 'Geschäftskategorie',
        annualPaymentVolume: 'Jährliches Zahlungsvolumen',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Jährliches Zahlungsvolumen in ${currencyCode}`,
        averageReimbursementAmount: 'Durchschnittlicher Erstattungsbetrag',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Durchschnittlicher Erstattungsbetrag in ${currencyCode}`,
        selectIncorporationType: 'Rechtsform auswählen',
        selectBusinessCategory: 'Unternehmenskategorie auswählen',
        selectAnnualPaymentVolume: 'Jährliches Zahlungsvolumen auswählen',
        selectIncorporationCountry: 'Inkorporierungsland auswählen',
        selectIncorporationState: 'Incorporation-Bundesstaat auswählen',
        selectAverageReimbursement: 'Durchschnittlichen Erstattungsbetrag auswählen',
        selectBusinessType: 'Geschäftsart auswählen',
        findIncorporationType: 'Rechtsform suchen',
        findBusinessCategory: 'Geschäftskategorie finden',
        findAnnualPaymentVolume: 'Jährliches Zahlungsvolumen finden',
        findIncorporationState: 'Bundesstaat der Gründung finden',
        findAverageReimbursement: 'Durchschnittliche Erstattungsbeträge ermitteln',
        findBusinessType: 'Unternehmenstyp finden',
        error: {
            registrationNumber: 'Bitte geben Sie eine gültige Registrierungsnummer ein',
            taxIDEIN: ({country}: BusinessTaxIDParams) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Bitte gib eine gültige Arbeitgeber-Identifikationsnummer (EIN) ein';
                    case CONST.COUNTRY.CA:
                        return 'Bitte geben Sie eine gültige Business Number (BN) ein';
                    case CONST.COUNTRY.GB:
                        return 'Bitte geben Sie eine gültige Umsatzsteuer-Identifikationsnummer (USt-IdNr.) ein';
                    case CONST.COUNTRY.AU:
                        return 'Bitte gib eine gültige australische Business-Nummer (ABN) ein';
                    default:
                        return 'Bitte gib eine gültige EU-Umsatzsteuernummer ein';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: ({companyName}: CompanyNameParams) => `Besitzen Sie 25 % oder mehr von ${companyName}?`,
        doAnyIndividualOwn25percent: ({companyName}: CompanyNameParams) => `Besitzen einzelne Personen 25 % oder mehr von ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: ({companyName}: CompanyNameParams) => `Gibt es weitere Personen, die 25 % oder mehr von ${companyName} besitzen?`,
        regulationRequiresUsToVerifyTheIdentity: 'Vorschriften verlangen, dass wir die Identität jeder Person überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        companyOwner: 'Unternehmensinhaber',
        enterLegalFirstAndLastName: 'Wie lautet der gesetzliche Name des Inhabers?',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        enterTheDateOfBirthOfTheOwner: 'Wie lautet das Geburtsdatum des Eigentümers?',
        enterTheLast4: 'Wie lauten die letzten 4 Ziffern der Sozialversicherungsnummer des Kontoinhabers?',
        last4SSN: 'Letzte 4 Ziffern der SSN',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        enterTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        address: 'Adresse',
        byAddingThisBankAccount: 'Indem Sie dieses Bankkonto hinzufügen, bestätigen Sie, dass Sie Folgendes gelesen, verstanden und akzeptiert haben',
        owners: 'Eigentümer',
    },
    ownershipInfoStep: {
        ownerInfo: 'Besitzerinformationen',
        businessOwner: 'Unternehmensinhaber',
        signerInfo: 'Unterzeichnerinformationen',
        doYouOwn: ({companyName}: CompanyNameParams) => `Besitzen Sie 25 % oder mehr von ${companyName}?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Besitzen einzelne Personen 25 % oder mehr von ${companyName}?`,
        regulationsRequire: 'Vorschriften verpflichten uns, die Identität jeder Person zu überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        whatsTheOwnersName: 'Wie lautet der gesetzliche Name des Inhabers?',
        whatsYourName: 'Wie lautet Ihr amtlicher Name?',
        whatPercentage: 'Wie viel Prozent des Unternehmens gehören dem Eigentümer?',
        whatsYoursPercentage: 'Wie viel Prozent des Unternehmens besitzen Sie?',
        ownership: 'Eigentum',
        whatsTheOwnersDOB: 'Wie lautet das Geburtsdatum des Eigentümers?',
        whatsYourDOB: 'Was ist dein Geburtsdatum?',
        whatsTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        whatsYourAddress: 'Wie lautet deine Adresse?',
        whatAreTheLast: 'Wie lauten die letzten 4 Ziffern der Sozialversicherungsnummer des Eigentümers?',
        whatsYourLast: 'Was sind die letzten 4 Ziffern Ihrer Sozialversicherungsnummer?',
        whatsYourNationality: 'Was ist Ihr Staatsangehörigkeitsland?',
        whatsTheOwnersNationality: 'Wie lautet das Staatsangehörigkeitsland des Eigentümers?',
        countryOfCitizenship: 'Staatsangehörigkeitsland',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4: 'Letzte 4 Ziffern der SSN',
        whyDoWeAsk: 'Warum fragen wir danach?',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        ownershipPercentage: 'Eigentumsanteil',
        areThereOther: ({companyName}: CompanyNameParams) => `Gibt es andere Personen, die 25 % oder mehr von ${companyName} besitzen?`,
        owners: 'Eigentümer',
        addCertified: 'Fügen Sie ein zertifiziertes Organigramm hinzu, das die wirtschaftlich Berechtigten zeigt',
        regulationRequiresChart:
            'Aufgrund gesetzlicher Bestimmungen müssen wir eine beglaubigte Kopie des Eigentumsdiagramms einholen, das jede natürliche oder juristische Person ausweist, die 25 % oder mehr des Unternehmens besitzt.',
        uploadEntity: 'Diagramm zur Eigentümerstruktur der Einheit hochladen',
        noteEntity: 'Hinweis: Das Beteiligungsdiagramm der Gesellschaft muss von Ihrem Steuerberater, Rechtsbeistand unterschrieben oder notariell beglaubigt werden.',
        certified: 'Zertifiziertes Eigentumsdiagramm der Rechtseinheit',
        selectCountry: 'Land auswählen',
        findCountry: 'Land finden',
        address: 'Adresse',
        chooseFile: 'Datei auswählen',
        uploadDocuments: 'Zusätzliche Unterlagen hochladen',
        pleaseUpload:
            'Bitte laden Sie unten zusätzliche Unterlagen hoch, damit wir Ihre Identität als direkte oder indirekte Eigentümerin bzw. direkter oder indirekter Eigentümer von 25 % oder mehr der Unternehmensentität überprüfen können.',
        acceptedFiles: 'Akzeptierte Dateiformate: PDF, PNG, JPEG. Die Gesamtdateigröße für jeden Abschnitt darf 5 MB nicht überschreiten.',
        proofOfBeneficialOwner: 'Nachweis des wirtschaftlich Berechtigten',
        proofOfBeneficialOwnerDescription:
            'Bitte legen Sie eine unterzeichnete Bescheinigung und ein Organigramm von einem Wirtschaftsprüfer, Notar oder Anwalt vor, die den Besitz von 25 % oder mehr des Unternehmens bestätigen. Das Dokument muss innerhalb der letzten drei Monate datiert sein und die Lizenznummer des Unterzeichnenden enthalten.',
        copyOfID: 'Kopie des Ausweises des wirtschaftlich Berechtigten',
        copyOfIDDescription: 'Beispiele: Reisepass, Führerschein, usw.',
        proofOfAddress: 'Adressnachweis für wirtschaftlich Berechtigten',
        proofOfAddressDescription: 'Beispiele: Nebenkostenabrechnung, Mietvertrag usw.',
        codiceFiscale: 'Steuernummer/Steuer-ID',
        codiceFiscaleDescription:
            'Bitte laden Sie ein Video von einem Vor-Ort-Besuch oder einem aufgezeichneten Telefonat mit dem zeichnungsberechtigten Bevollmächtigten hoch. Der Bevollmächtigte muss folgende Angaben machen: vollständiger Name, Geburtsdatum, Firmenname, Handelsregisternummer, Steuernummer, eingetragene Anschrift, Unternehmensgegenstand und Verwendungszweck des Kontos.',
    },
    completeVerificationStep: {
        completeVerification: 'Verifizierung abschließen',
        confirmAgreements: 'Bitte bestätigen Sie die untenstehenden Vereinbarungen.',
        certifyTrueAndAccurate: 'Ich bestätige, dass die bereitgestellten Informationen wahr und korrekt sind',
        certifyTrueAndAccurateError: 'Bitte bestätigen Sie, dass die Angaben wahrheitsgemäß und korrekt sind',
        isAuthorizedToUseBankAccount: 'Ich bin berechtigt, dieses Geschäftskonto für Geschäftsausgaben zu verwenden',
        isAuthorizedToUseBankAccountError: 'Sie müssen ein zeichnungsberechtigter Bevollmächtigter mit Berechtigung zur Führung des Geschäftskontos sein',
        termsAndConditions: 'Allgemeine Geschäftsbedingungen',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Bestätige dein Bankkonto',
        validateButtonText: 'Validieren',
        validationInputLabel: 'Transaktion',
        maxAttemptsReached: 'Die Validierung dieses Bankkontos wurde aufgrund zu vieler falscher Versuche deaktiviert.',
        description: `Innerhalb von 1–2 Werktagen senden wir drei (3) kleine Transaktionen auf Ihr Bankkonto von einem Namen wie „Expensify, Inc. Validation“.`,
        descriptionCTA: 'Bitte geben Sie jeden Transaktionsbetrag in die untenstehenden Felder ein. Beispiel: 1,51.',
        letsChatText: 'Fast geschafft! Wir brauchen deine Hilfe, um ein paar letzte Informationen im Chat zu bestätigen. Bereit?',
        enable2FATitle: 'Betrug verhindern, Zwei-Faktor-Authentifizierung (2FA) aktivieren',
        enable2FAText: 'Wir nehmen Ihre Sicherheit sehr ernst. Bitte richten Sie jetzt 2FA ein, um Ihrem Konto eine zusätzliche Schutzebene hinzuzufügen.',
        secureYourAccount: 'Schützen Sie Ihr Konto',
    },
    countryStep: {
        confirmBusinessBank: 'Geschäftsbankkontowährung und -land bestätigen',
        confirmCurrency: 'Währung und Land bestätigen',
        yourBusiness: 'Die Währung Ihres Geschäftskontos muss mit der Währung Ihres Workspaces übereinstimmen.',
        youCanChange: 'Sie können die Währung Ihres Workspaces in Ihren',
        findCountry: 'Land finden',
        selectCountry: 'Land auswählen',
    },
    bankInfoStep: {
        whatAreYour: 'Wie lauten die Daten Ihres Geschäftskontos?',
        letsDoubleCheck: 'Lass uns zur Sicherheit noch einmal prüfen, ob alles in Ordnung aussieht.',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in deinem Workspace verwendet.',
        accountNumber: 'Kontonummer',
        accountHolderNameDescription: 'Vollständiger Name des zeichnungsberechtigten Unterzeichners',
    },
    signerInfoStep: {
        signerInfo: 'Unterzeichnerinformationen',
        areYouDirector: ({companyName}: CompanyNameParams) => `Sind Sie Direktor bei ${companyName}?`,
        regulationRequiresUs: 'Vorschriften verlangen von uns zu überprüfen, ob die unterzeichnende Person befugt ist, diese Aktion im Namen des Unternehmens durchzuführen.',
        whatsYourName: 'Wie lautet Ihr amtlicher Name',
        fullName: 'Vollständiger gesetzlicher Name',
        whatsYourJobTitle: 'Wie lautet deine Berufsbezeichnung?',
        jobTitle: 'Berufsbezeichnung',
        whatsYourDOB: 'Was ist dein Geburtsdatum?',
        uploadID: 'Ausweis und Adressnachweis hochladen',
        personalAddress: 'Wohnsitznachweis (z. B. Nebenkostenabrechnung)',
        letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        proofOf: 'Nachweis der persönlichen Adresse',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Geben Sie die E-Mail-Adresse eines Directors bei ${companyName} ein`,
        regulationRequiresOneMoreDirector: 'Die Vorschriften verlangen mindestens eine weitere Direktorin bzw. einen weiteren Direktor als Unterzeichner.',
        hangTight: 'Einen Moment bitte...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Gib die E-Mail-Adressen von zwei Geschäftsführern bei ${companyName} ein`,
        sendReminder: 'Erinnerung senden',
        chooseFile: 'Datei auswählen',
        weAreWaiting: 'Wir warten darauf, dass andere ihre Identität als Geschäftsleiter verifizieren.',
        id: 'Ausweiskopie',
        proofOfDirectors: 'Nachweis des/der Geschäftsführer(s)',
        proofOfDirectorsDescription: 'Beispiele: Oncorp-Unternehmensprofil oder Unternehmensregistrierung.',
        codiceFiscale: 'Steuernummer',
        codiceFiscaleDescription: 'Codice Fiscale für Unterzeichner, Bevollmächtigte Benutzer und Wirtschaftlich Berechtigte.',
        PDSandFSG: 'PDS- und FSG-Offenlegungsunterlagen',
        PDSandFSGDescription: dedent(`
            Unsere Partnerschaft mit Corpay nutzt eine API-Verbindung, um das umfangreiche Netzwerk internationaler Bankpartner zu verwenden und damit Globale Erstattungen in Expensify zu ermöglichen. Gemäß den australischen Vorschriften stellen wir Ihnen den Financial Services Guide (FSG) und die Product Disclosure Statement (PDS) von Corpay zur Verfügung.

            Bitte lesen Sie die FSG- und PDS-Dokumente sorgfältig durch, da sie vollständige Details und wichtige Informationen zu den Produkten und Dienstleistungen enthalten, die Corpay anbietet. Bewahren Sie diese Dokumente für zukünftige Referenzzwecke auf.
        `),
        pleaseUpload: 'Bitte laden Sie unten zusätzliche Unterlagen hoch, damit wir Ihre Identität als Geschäftsführer des Unternehmens bestätigen können.',
        enterSignerInfo: 'Unterschriftsinformationen eingeben',
        thisStep: 'Dieser Schritt wurde abgeschlossen',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `verbindet ein ${currency}-Geschäftskonto, das auf ${bankAccountLastFour} endet, mit Expensify, um Mitarbeiter in ${currency} zu bezahlen. Der nächste Schritt erfordert Zeichnungsberechtigungsinformationen eines Direktors.`,
        error: {
            emailsMustBeDifferent: 'E-Mails müssen unterschiedlich sein',
        },
    },
    agreementsStep: {
        agreements: 'Vereinbarungen',
        pleaseConfirm: 'Bitte bestätigen Sie die folgenden Vereinbarungen',
        regulationRequiresUs: 'Vorschriften verlangen, dass wir die Identität jeder Person überprüfen, die mehr als 25 % des Unternehmens besitzt.',
        iAmAuthorized: 'Ich bin berechtigt, das Geschäftskonto für Geschäftsausgaben zu verwenden.',
        iCertify: 'Ich bestätige, dass die bereitgestellten Informationen wahr und korrekt sind.',
        iAcceptTheTermsAndConditions: `Ich akzeptiere die <a href="https://cross-border.corpay.com/tc/">Allgemeinen Geschäftsbedingungen</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Ich akzeptiere die Allgemeinen Geschäftsbedingungen.',
        accept: 'Bankkonto akzeptieren und hinzufügen',
        iConsentToThePrivacyNotice: 'Ich stimme dem <a href="https://payments.corpay.com/compliance">Datenschutzhinweis</a> zu.',
        iConsentToThePrivacyNoticeAccessibility: 'Ich stimme der Datenschutzerklärung zu.',
        error: {
            authorized: 'Sie müssen ein zeichnungsberechtigter Bevollmächtigter mit Berechtigung zur Führung des Geschäftskontos sein',
            certify: 'Bitte bestätigen Sie, dass die Angaben wahrheitsgemäß und korrekt sind',
            consent: 'Bitte stimmen Sie der Datenschutzerklärung zu',
        },
    },
    docusignStep: {
        subheader: 'Docusign-Formular',
        pleaseComplete:
            'Bitte füllen Sie das ACH-Autorisierungsformular über den untenstehenden Docusign-Link aus und laden Sie die unterzeichnete Kopie anschließend hier hoch, damit wir Gelder direkt von Ihrem Bankkonto abbuchen können.',
        pleaseCompleteTheBusinessAccount: 'Bitte füllen Sie die Vereinbarung zum Lastschrifteinzug für das Geschäftskonto aus.',
        pleaseCompleteTheDirect:
            'Bitte füllen Sie die Lastschriftvereinbarung über den untenstehenden DocuSign-Link aus und laden Sie die unterschriebene Kopie anschließend hier hoch, damit wir Gelder direkt von Ihrem Bankkonto abbuchen können.',
        takeMeTo: 'Bring mich zu Docusign',
        uploadAdditional: 'Zusätzliche Unterlagen hochladen',
        pleaseUpload: 'Bitte laden Sie das DEFT-Formular und die Docusign-Unterschriftsseite hoch.',
        pleaseUploadTheDirect: 'Bitte laden Sie die SEPA-Lastschriftvereinbarung und die DocuSign-Unterschriftsseite hoch',
    },
    finishStep: {
        letsFinish: 'Lass uns im Chat fertig machen!',
        thanksFor:
            'Danke für diese Details. Ein dedizierter Support-Mitarbeiter wird Ihre Angaben nun überprüfen. Wir melden uns wieder bei Ihnen, falls wir noch etwas von Ihnen benötigen. In der Zwischenzeit können Sie sich gerne mit Fragen an uns wenden.',
        iHaveA: 'Ich habe eine Frage',
        enable2FA: 'Aktiviere die Zwei-Faktor-Authentifizierung (2FA), um Betrug zu verhindern',
        weTake: 'Wir nehmen Ihre Sicherheit sehr ernst. Bitte richten Sie jetzt 2FA ein, um Ihrem Konto eine zusätzliche Schutzebene hinzuzufügen.',
        secure: 'Schützen Sie Ihr Konto',
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
        title: 'Smart reisen',
        subtitle: 'Nutze Expensify Travel, um die besten Reiseangebote zu erhalten und alle deine Geschäftsausgaben an einem Ort zu verwalten.',
        features: {
            saveMoney: 'Sparen Sie bei Ihren Buchungen',
            alerts: 'Erhalte Echtzeit-Updates und -Benachrichtigungen',
        },
        bookTravel: 'Reise buchen',
        bookDemo: 'Demo buchen',
        bookADemo: 'Demo buchen',
        toLearnMore: 'um mehr zu erfahren.',
        termsAndConditions: {
            header: 'Bevor wir fortfahren …',
            title: 'Geschäftsbedingungen',
            label: 'Ich stimme den Geschäftsbedingungen zu',
            subtitle: `Bitte stimme den Expensify Travel-<a href="${CONST.TRAVEL_TERMS_URL}">Allgemeinen Geschäftsbedingungen</a> zu.`,
            error: 'Sie müssen den Expensify Travel Geschäftsbedingungen zustimmen, um fortzufahren',
            defaultWorkspaceError:
                'Sie müssen einen Standard-Arbeitsbereich festlegen, um Expensify Travel zu aktivieren. Gehen Sie zu Einstellungen > Arbeitsbereiche > klicken Sie auf die drei vertikalen Punkte neben einem Arbeitsbereich > Als Standard-Arbeitsbereich festlegen und versuchen Sie es dann erneut!',
        },
        flight: 'Flug',
        flightDetails: {
            passenger: 'Passagier',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Sie haben einen <strong>${layover} Aufenthalt</strong> vor diesem Flug</muted-text-label>`,
            takeOff: 'Start',
            landing: 'Landingpage',
            seat: 'Platz',
            class: 'Kabinenklasse',
            recordLocator: 'Buchungsnummer',
            cabinClasses: {
                unknown: 'Unbekannt',
                economy: 'Wirtschaft',
                premiumEconomy: 'Premium Economy',
                business: 'Geschäftlich',
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
            arrives: 'Trifft ein',
            coachNumber: 'Wagennummer',
            seat: 'Platz',
            fareDetails: 'Fahrpreisdetails',
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
            `<rbr>Bitte <a href="${phoneErrorMethodsRoute}">füge eine geschäftliche E-Mail als primären Login hinzu</a>, um Reisen zu buchen.</rbr>`,
        domainSelector: {
            title: 'Domain',
            subtitle: 'Wähle eine Domain für die Einrichtung von Expensify Travel.',
            recommended: 'Empfohlen',
        },
        domainPermissionInfo: {
            title: 'Domain',
            restriction: ({domain}: DomainPermissionInfoRestrictionParams) =>
                `Du hast keine Berechtigung, Expensify Travel für die Domain <strong>${domain}</strong> zu aktivieren. Bitte jemanden aus dieser Domain, stattdessen Travel zu aktivieren.`,
            accountantInvitation: `Wenn Sie Buchhalter sind, sollten Sie dem <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved!-Buchhalterprogramm</a> beitreten, um Reisen für diese Domain zu ermöglichen.`,
        },
        publicDomainError: {
            title: 'Loslegen mit Expensify Travel',
            message: `Du musst für Expensify Travel deine Arbeits-E-Mail-Adresse (z. B. name@company.com) verwenden, nicht deine private E-Mail-Adresse (z. B. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel wurde deaktiviert',
            message: `Ihr Admin hat Expensify Travel deaktiviert. Bitte halten Sie sich bei Reisebuchungen an die Reiserichtlinien Ihres Unternehmens.`,
        },
        verifyCompany: {
            title: 'Wir überprüfen Ihre Anfrage …',
            message: `Wir führen gerade einige Prüfungen durch, um zu bestätigen, dass Ihr Konto für Expensify Travel bereit ist. Wir melden uns in Kürze bei Ihnen!`,
            confirmText: 'Verstanden',
            conciergeMessage: ({domain}: {domain: string}) => `Reiseaktivierung für die Domain ${domain} fehlgeschlagen. Bitte überprüfen Sie diese Domain und aktivieren Sie Reisen dafür.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde gebucht. Bestätigungscode: ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Ihr Ticket für den Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde storniert.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Dein Ticket für den Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde erstattet oder umgebucht.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate}} wurde von der Fluggesellschaft storniert.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) =>
                `Die Fluggesellschaft hat eine Flugplanänderung für Flug ${airlineCode} vorgeschlagen; wir warten auf die Bestätigung.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Änderung des Flugplans bestätigt: Flug ${airlineCode} startet jetzt um ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `Ihr Flug ${airlineCode} (${origin} → ${destination}) am ${startDate} wurde aktualisiert.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `Ihre Beförderungsklasse wurde auf ${cabinClass} im Flug ${airlineCode} aktualisiert.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde bestätigt.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `Ihre Sitzplatzzuweisung für Flug ${airlineCode} wurde geändert.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `Ihre Sitzplatzzuweisung auf Flug ${airlineCode} wurde entfernt.`,
            paymentDeclined: 'Die Zahlung für Ihre Flugbuchung ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Du hast deine ${type}-Reservierung ${id} storniert.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Der Anbieter hat Ihre ${type}-Reservierung ${id} storniert.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Ihre ${type}-Reservierung wurde erneut gebucht. Neue Bestätigung-Nr.: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Ihre ${type}-Buchung wurde aktualisiert. Prüfen Sie die neuen Details in der Reiseroute.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Ihr Bahnticket für ${origin} → ${destination} am ${startDate} wurde erstattet. Eine Gutschrift wird bearbeitet.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Ihr Bahnticket für ${origin} → ${destination} am ${startDate} wurde umgetauscht.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Ihr Bahnticket für ${origin} → ${destination} am ${startDate} wurde aktualisiert.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Ihre ${type}-Reservierung wurde aktualisiert.`,
        },
        flightTo: 'Flug nach',
        trainTo: 'Trainieren, um',
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
            findWorkspace: 'Workspace suchen',
            edit: 'Arbeitsbereich bearbeiten',
            enabled: 'Aktiviert',
            disabled: 'Deaktiviert',
            everyone: 'Alle',
            delete: 'Arbeitsbereich löschen',
            settings: 'Einstellungen',
            reimburse: 'Erstattungen',
            categories: 'Kategorien',
            tags: 'Stichwörter',
            customField1: 'Benutzerdefiniertes Feld 1',
            customField2: 'Benutzerdefiniertes Feld 2',
            customFieldHint: 'Füge benutzerdefinierte Kodierung hinzu, die für alle Ausgaben dieses Mitglieds gilt.',
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
            plan: 'Tarif',
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
            settlementFrequency: 'Abrechnungshäufigkeit',
            setAsDefault: 'Als Standardarbeitsbereich festlegen',
            defaultNote: `An ${CONST.EMAIL.RECEIPTS} gesendete Belege werden in diesem Workspace angezeigt.`,
            deleteConfirmation: 'Möchten Sie diesen Workspace wirklich löschen?',
            deleteWithCardsConfirmation: 'Möchtest du diesen Workspace wirklich löschen? Dadurch werden alle Karten-Feeds und zugewiesenen Karten entfernt.',
            unavailable: 'Nicht verfügbiger Arbeitsbereich',
            memberNotFound: 'Mitglied nicht gefunden. Um ein neues Mitglied zum Workspace einzuladen, verwenden Sie bitte die Einladen-Schaltfläche oben.',
            notAuthorized: `Du hast keinen Zugriff auf diese Seite. Wenn du versuchst, diesem Arbeitsbereich beizutreten, bitte einfach den Arbeitsbereichsinhaber, dich als Mitglied hinzuzufügen. Etwas anderes? Wende dich an ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Zum Workspace gehen',
            duplicateWorkspace: 'Arbeitsbereich duplizieren',
            duplicateWorkspacePrefix: 'Duplizieren',
            goToWorkspaces: 'Zu Arbeitsbereichen gehen',
            clearFilter: 'Filter löschen',
            workspaceName: 'Workspace-Name',
            workspaceOwner: 'Inhaber',
            workspaceType: 'Arbeitsbereichstyp',
            workspaceAvatar: 'Arbeitsbereichs-Avatar',
            mustBeOnlineToViewMembers: 'Du musst online sein, um die Mitglieder dieses Arbeitsbereichs anzuzeigen.',
            moreFeatures: 'Mehr Funktionen',
            requested: 'Angefordert',
            distanceRates: 'Entfernungsraten',
            defaultDescription: 'Ein Ort für all Ihre Belege und Ausgaben.',
            descriptionHint: 'Informationen über diesen Workspace mit allen Mitgliedern teilen.',
            welcomeNote: 'Bitte nutze Expensify, um deine Belege zur Erstattung einzureichen. Vielen Dank!',
            subscription: 'Abonnement',
            markAsEntered: 'Als manuell eingegeben markieren',
            markAsExported: 'Als exportiert markieren',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exportieren nach ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
            lineItemLevel: 'Auf Positionsebene',
            reportLevel: 'Berichtsebene',
            topLevel: 'Oberste Ebene',
            appliedOnExport: 'Nicht in Expensify importiert, beim Export angewendet',
            shareNote: {
                header: 'Teilen Sie Ihren Workspace mit anderen Mitgliedern',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Teile diesen QR-Code oder kopiere den Link unten, damit Mitglieder ganz einfach Zugriff auf deinen Workspace anfordern können. Alle Anfragen zum Beitritt zum Workspace werden im Raum <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> zu deiner Überprüfung angezeigt.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} verbinden`,
            createNewConnection: 'Neue Verbindung erstellen',
            reuseExistingConnection: 'Vorhandene Verbindung wiederverwenden',
            existingConnections: 'Bestehende Verbindungen',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Da du zuvor bereits eine Verbindung mit ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} hergestellt hast, kannst du eine bestehende Verbindung wiederverwenden oder eine neue erstellen.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} – Zuletzt synchronisiert am ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Verbindung mit ${connectionName} aufgrund eines Authentifizierungsfehlers nicht möglich.`,
            learnMore: 'Mehr erfahren',
            memberAlternateText: 'Mitglieder können Berichte einreichen und genehmigen.',
            adminAlternateText: 'Admins haben vollen Bearbeitungszugriff auf alle Berichte und Arbeitsbereichseinstellungen.',
            auditorAlternateText: 'Prüfer können Berichte anzeigen und kommentieren.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Administrator';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Auditor';
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
            submitExpense: 'Reiche deine Ausgaben unten ein:',
            defaultCategory: 'Standardkategorie',
            viewTransactions: 'Transaktionen anzeigen',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Spesen von ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card-Transaktionen werden automatisch in ein „Expensify Card Liability Account“ exportiert, das mit <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">unserer Integration</a> erstellt wurde.</muted-text-label>`,
        },
        receiptPartners: {
            connect: 'Jetzt verbinden',
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Verbunden mit ${organizationName}` : 'Automatisieren Sie Reise- und Essenslieferungskosten in Ihrem gesamten Unternehmen.',
                sendInvites: 'Einladungen senden',
                sendInvitesDescription:
                    'Diese Arbeitsbereichsmitglieder haben noch kein Uber for Business-Konto. Entfernen Sie die Auswahl bei allen Mitgliedern, die Sie derzeit nicht einladen möchten.',
                confirmInvite: 'Einladung bestätigen',
                manageInvites: 'Einladungen verwalten',
                confirm: 'Bestätigen',
                allSet: 'Alles erledigt',
                readyToRoll: 'Du bist startklar',
                takeBusinessRideMessage: 'Machen Sie eine Geschäftsreise, und Ihre Uber-Belege werden in Expensify importiert. Los geht’s!',
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
                bannerTitle: 'Expensify + Uber for Business',
                bannerDescription: 'Verbinde Uber for Business, um Reise- und Essenslieferungs-Ausgaben in deinem gesamten Unternehmen zu automatisieren.',
                emptyContent: {
                    title: 'Keine ausstehenden Einladungen',
                    subtitle: 'Hurra! Wir haben überall nachgesehen und keine offenen Einladungen gefunden.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Setzen Sie Pauschalspesen, um die täglichen Ausgaben der Mitarbeitenden zu steuern. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Mehr erfahren</a>.</muted-text>`,
            amount: 'Betrag',
            deleteRates: () => ({
                one: 'Satz löschen',
                other: 'Sätze löschen',
            }),
            deletePerDiemRate: 'Tagessatz löschen',
            findPerDiemRate: 'Tagessatz finden',
            areYouSureDelete: () => ({
                one: 'Sind Sie sicher, dass Sie diesen Satz löschen möchten?',
                other: 'Möchten Sie diese Tarife wirklich löschen?',
            }),
            emptyList: {
                title: 'Tagegeld',
                subtitle: 'Legen Sie Pauschalspesen fest, um die täglichen Ausgaben der Mitarbeitenden zu steuern. Importieren Sie die Sätze aus einer Tabellenkalkulation, um zu beginnen.',
            },
            importPerDiemRates: 'Tagessätze importieren',
            editPerDiemRate: 'Tagessatz bearbeiten',
            editPerDiemRates: 'Pauschalspesensätze bearbeiten',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `Das Aktualisieren dieses Ziels wird es für alle ${destination}-Tagesgeld-Teilbeträge ändern.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `Wenn Sie diese Währung aktualisieren, wird sie für alle ${destination}-Tagespauschalen-Teilbeträge geändert.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie Auslagen in QuickBooks Desktop exportiert werden.',
            exportOutOfPocketExpensesCheckToggle: 'Markiert Schecks als „später drucken“',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach QuickBooks Desktop exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Card-Transaktionen exportieren als',
            account: 'Konto',
            accountDescription: 'Wählen Sie aus, wo Buchungssätze veröffentlicht werden sollen.',
            accountsPayable: 'Kreditorenbuchhaltung',
            accountsPayableDescription: 'Wählen Sie aus, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wählen Sie, von wo Schecks gesendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten nach QuickBooks Desktop.',
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
                        label: 'Eingereicht am',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            exportCheckDescription: 'Wir erstellen einen Einzelposten-Scheck für jeden Expensify-Bericht und senden ihn von dem unten aufgeführten Bankkonto.',
            exportJournalEntryDescription: 'Wir erstellen für jeden Expensify-Bericht einen detaillierten Buchungssatz und buchen ihn auf das untenstehende Konto.',
            exportVendorBillDescription:
                'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. Tag des nächsten offenen Zeitraums.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop unterstützt keine Steuern beim Export von Journaleinträgen. Da in Ihrem Workspace Steuern aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journalbuchung',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Prüfen',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Wir erstellen einen Einzelposten-Scheck für jeden Expensify-Bericht und senden ihn von dem unten aufgeführten Bankkonto.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Kreditkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Wenn keine Lieferanten vorhanden sind, erstellen wir einen „Credit Card Misc.“-Lieferanten zur Zuordnung.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Wir erstellen eine detaillierte Lieferantenrechnung für jeden Expensify-Bericht mit dem Datum der letzten Ausgabe und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum abgeschlossen ist, buchen wir zum 1. des nächsten offenen Zeitraums.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wählen Sie, wohin Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Wählen Sie einen Lieferanten aus, der auf alle Kreditkartentransaktionen angewendet werden soll.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Wählen Sie, von wo Schecks gesendet werden sollen.',
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
                body1: 'Sie müssen diese Verbindung von dem Computer aus einrichten, auf dem Ihre QuickBooks Desktop-Unternehmensdatei gespeichert ist.',
                body2: 'Sobald Sie verbunden sind, können Sie von überall aus synchronisieren und exportieren.',
            },
            setupPage: {
                title: 'Öffne diesen Link, um die Verbindung herzustellen',
                body: 'Um die Einrichtung abzuschließen, öffnen Sie den folgenden Link auf dem Computer, auf dem QuickBooks Desktop ausgeführt wird.',
                setupErrorTitle: 'Etwas ist schiefgelaufen',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>Die Verbindung zu QuickBooks Desktop funktioniert im Moment nicht. Bitte versuche es später erneut oder <a href="${conciergeLink}">kontaktiere Concierge</a>, wenn das Problem weiterhin besteht.</centered-text></muted-text>`,
            },
            importDescription: 'Wählen Sie aus, welche Kodierungskonfigurationen aus QuickBooks Desktop in Expensify importiert werden sollen.',
            classes: 'Klassen',
            items: 'Artikel',
            customers: 'Kunden/Projekte',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Firmenkartenkäufe nach QuickBooks Desktop exportiert werden.',
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
                createEntitiesDescription: 'Expensify erstellt in QuickBooks Desktop automatisch Lieferanten, falls diese noch nicht vorhanden sind.',
            },
            itemsDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Artikel in Expensify verarbeitet werden sollen.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Spesen exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagenausgaben werden nach der endgültigen Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden exportiert, sobald sie bezahlt sind',
                },
            },
        },
        qbo: {
            connectedTo: 'Verbunden mit',
            importDescription: 'Wählen Sie, welche Kodierungskonfigurationen aus QuickBooks Online in Expensify importiert werden sollen.',
            classes: 'Klassen',
            locations: 'Standorte',
            customers: 'Kunden/Projekte',
            accountsDescription: 'Ihr QuickBooks Online-Kontenplan wird als Kategorien in Expensify importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            classesDescription: 'Wählen Sie, wie QuickBooks Online-Klassen in Expensify behandelt werden sollen.',
            customersDescription: 'Wählen Sie aus, wie QuickBooks Online-Kunden/Projekte in Expensify behandelt werden sollen.',
            locationsDescription: 'Wählen Sie aus, wie QuickBooks Online-Standorte in Expensify behandelt werden sollen.',
            taxesDescription: 'Wählen Sie aus, wie QuickBooks Online-Steuern in Expensify gehandhabt werden sollen.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online unterstützt keine Standorte auf Zeilenebene für Schecks oder Lieferantenrechnungen. Wenn Sie Standorte auf Zeilenebene verwenden möchten, stellen Sie sicher, dass Sie Journalbuchungen sowie Kredit-/Debitkartenausgaben nutzen.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online unterstützt keine Steuern bei Journalbuchungen. Bitte ändern Sie Ihre Exportoption auf Lieferantenrechnung oder Scheck.',
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
                        description: 'Datum der neuesten Ausgabe im Bericht.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht zu QuickBooks Online exportiert wurde.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Eingereicht am',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            receivable: 'Debitorenbuchhaltung', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archiv der Debitorenbuchhaltung', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Verwenden Sie dieses Konto beim Exportieren von Rechnungen nach QuickBooks Online.',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Einkäufe mit Firmenkarten nach QuickBooks Online exportiert werden.',
            vendor: 'Lieferant',
            defaultVendorDescription: 'Legen Sie einen Standardlieferanten fest, der beim Export auf alle Kreditkartentransaktionen angewendet wird.',
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie Auslagen in QuickBooks Online exportiert werden.',
            exportCheckDescription: 'Wir erstellen einen Einzelposten-Scheck für jeden Expensify-Bericht und senden ihn von dem unten aufgeführten Bankkonto.',
            exportJournalEntryDescription: 'Wir erstellen für jeden Expensify-Bericht einen detaillierten Buchungssatz und buchen ihn auf das untenstehende Konto.',
            exportVendorBillDescription:
                'Wir erstellen für jeden Expensify-Bericht eine detaillierte Lieferantenrechnung und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. Tag des nächsten offenen Zeitraums.',
            account: 'Konto',
            accountDescription: 'Wählen Sie aus, wo Buchungssätze veröffentlicht werden sollen.',
            accountsPayable: 'Kreditorenbuchhaltung',
            accountsPayableDescription: 'Wählen Sie aus, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wählen Sie, von wo Schecks gesendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online unterstützt keine Locations beim Export von Lieferantenrechnungen. Da in Ihrem Arbeitsbereich Locations aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online unterstützt keine Steuern bei Journalbuchungs-Exporten. Da in Ihrem Workspace Steuern aktiviert sind, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird sich automatisch jeden Tag mit QuickBooks Online synchronisieren.',
                inviteEmployees: 'Mitarbeitende einladen',
                inviteEmployeesDescription: 'QuickBooks Online-Mitarbeiterdatensätze importieren und Mitarbeiter in diesen Workspace einladen.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription:
                    'Expensify erstellt in QuickBooks Online automatisch Lieferanten, wenn sie noch nicht vorhanden sind, und erstellt beim Export von Rechnungen automatisch Kunden.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden QuickBooks Online-Konto erstellt.',
                qboBillPaymentAccount: 'QuickBooks-Rechnungzahlungs­konto',
                qboInvoiceCollectionAccount: 'QuickBooks-Forderungskonto für Rechnungen',
                accountSelectDescription: 'Wähle aus, von wo aus Rechnungen bezahlt werden sollen, und wir erstellen die Zahlung in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wählen Sie aus, wohin die Rechnungszahlungen eingehen sollen, und wir erstellen die Zahlung in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Debitkarte',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kreditkarte',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Lieferantenrechnung',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journalbuchung',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Prüfen',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Debitkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Falls keine Lieferanten existieren, erstellen wir einen „Debit Card Misc.“-Lieferanten zur Zuordnung.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Wir gleichen den Händlernamen der Kreditkartentransaktion automatisch mit allen entsprechenden Lieferanten in QuickBooks ab. Wenn keine Lieferanten vorhanden sind, erstellen wir einen „Credit Card Misc.“-Lieferanten zur Zuordnung.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Wir erstellen eine detaillierte Lieferantenrechnung für jeden Expensify-Bericht mit dem Datum der letzten Ausgabe und fügen sie dem untenstehenden Konto hinzu. Wenn dieser Zeitraum abgeschlossen ist, buchen wir zum 1. des nächsten offenen Zeitraums.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Wählen Sie aus, wohin Debitkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Wählen Sie, wohin Kreditkartentransaktionen exportiert werden sollen.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Wählen Sie einen Lieferanten aus, der auf alle Kreditkartentransaktionen angewendet werden soll.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Wählen Sie ein gültiges Konto für den Export der Lieferantenrechnung',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Wähle ein gültiges Konto für den Export des Buchungsjournals',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Wähle ein gültiges Konto für den Scheckexport',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Um den Export von Kreditorenrechnungen zu verwenden, richten Sie ein Kreditorenkonto in QuickBooks Online ein',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Um den Export von Buchungsjournalen zu verwenden, richten Sie ein Journal-Konto in QuickBooks Online ein',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Um den Scheckexport zu verwenden, richten Sie ein Bankkonto in QuickBooks Online ein',
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Fügen Sie das Konto in QuickBooks Online hinzu und synchronisieren Sie die Verbindung erneut.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Spesen exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagenausgaben werden nach der endgültigen Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden exportiert, sobald sie bezahlt sind',
                },
            },
        },
        workspaceList: {
            joinNow: 'Jetzt beitreten',
            askToJoin: 'Beitritt anfordern',
        },
        xero: {
            organization: 'Xero-Organisation',
            organizationDescription: 'Wählen Sie die Xero-Organisation aus, aus der Sie Daten importieren möchten.',
            importDescription: 'Wählen Sie aus, welche Kontierungskonfigurationen aus Xero in Expensify importiert werden sollen.',
            accountsDescription: 'Ihr Kontenplan aus Xero wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            trackingCategories: 'Tracking-Kategorien',
            trackingCategoriesDescription: 'Wählen Sie aus, wie Xero-Trackingkategorien in Expensify behandelt werden sollen.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Xero-Kategorie ${categoryName} zuordnen zu`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Wählen Sie aus, wohin ${categoryName} beim Export nach Xero zugeordnet werden soll.`,
            customers: 'Kunden erneut abrechnen',
            customersDescription:
                'Wählen Sie, ob Kunden in Expensify erneut abgerechnet werden sollen. Ihre Xero-Kundenkontakte können Ausgaben zugeordnet werden und werden als Verkaufsrechnung nach Xero exportiert.',
            taxesDescription: 'Wählen Sie, wie Xero-Steuern in Expensify gehandhabt werden sollen.',
            notImported: 'Nicht importiert',
            notConfigured: 'Nicht konfiguriert',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero-Standardkontakt',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Stichwörter',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Berichtsfelder',
            },
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach Xero exportiert werden.',
            purchaseBill: 'Kaufrechnung',
            exportDeepDiveCompanyCard:
                'Exportierte Ausgaben werden als Banktransaktionen auf das unten angegebene Xero-Bankkonto gebucht, und die Buchungsdaten entsprechen den Daten auf Ihrem Kontoauszug.',
            bankTransactions: 'Banktransaktionen',
            xeroBankAccount: 'Xero-Bankkonto',
            xeroBankAccountDescription: 'Wählen Sie aus, wo Ausgaben als Banktransaktionen gebucht werden.',
            exportExpensesDescription: 'Berichte werden als Einkaufsrechnung mit dem unten ausgewählten Datum und Status exportiert.',
            purchaseBillDate: 'Rechnungsdatum des Einkaufs',
            exportInvoices: 'Rechnungen exportieren als',
            salesInvoice: 'Verkaufsrechnung',
            exportInvoicesDescription: 'Verkaufsrechnungen zeigen immer das Datum an, an dem die Rechnung gesendet wurde.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird automatisch jeden Tag mit Xero synchronisiert.',
                purchaseBillStatusTitle: 'Status der Eingangsrechnung',
                reimbursedReportsDescription: 'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden Xero-Konto erstellt.',
                xeroBillPaymentAccount: 'Xero-Rechnungszahlungskonto',
                xeroInvoiceCollectionAccount: 'Xero-Forderungskonto für Rechnungen',
                xeroBillPaymentAccountDescription: 'Wählen Sie aus, von wo aus Sie Rechnungen bezahlen möchten, und wir erstellen die Zahlung in Xero.',
                invoiceAccountSelectorDescription: 'Wählen Sie, wohin die Rechnungszahlungen eingehen sollen, und wir erstellen die Zahlung in Xero.',
            },
            exportDate: {
                label: 'Rechnungsdatum des Einkaufs',
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
                        label: 'Eingereicht am',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status der Eingangsrechnung',
                description: 'Verwenden Sie diesen Status beim Export von Einkaufsrechnungen nach Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Entwurf',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Genehmigung ausstehend',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'Zahlung ausstehend',
                },
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Bitte fügen Sie das Konto in Xero hinzu und synchronisieren Sie die Verbindung erneut.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Spesen exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagenausgaben werden nach der endgültigen Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden exportiert, sobald sie bezahlt sind',
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
                        description: 'Datum, an dem der Bericht zu Sage Intacct exportiert wurde.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Eingereicht am',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Legen Sie fest, wie Auslagen nach Sage Intacct exportiert werden.',
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
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Legen Sie einen Standardlieferanten fest, der auf ${isReimbursable ? '' : 'Nicht-'}erstattungsfähige Ausgaben angewendet wird, für die in Sage Intacct kein passender Lieferant vorhanden ist.`,
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten in Sage Intacct exportiert werden.',
            exportPreferredExporterNote:
                'Der bevorzugte Exporteur kann jeder Workspace-Admin sein, muss jedoch auch Domain-Admin sein, wenn Sie in den Domaineinstellungen unterschiedliche Exportkonten für einzelne Firmenkarten festlegen.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur Berichte zum Export in seinem Konto.',
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: `Bitte fügen Sie das Konto in Sage Intacct hinzu und synchronisieren Sie die Verbindung erneut.`,
            autoSync: 'Automatische Synchronisierung',
            autoSyncDescription: 'Expensify wird automatisch jeden Tag mit Sage Intacct synchronisiert.',
            inviteEmployees: 'Mitarbeitende einladen',
            inviteEmployeesDescription:
                'Importiere Sage Intacct-Mitarbeiterdatensätze und lade Mitarbeiter in diesen Arbeitsbereich ein. Dein Genehmigungsworkflow ist standardmäßig auf Genehmigung durch den Manager eingestellt und kann auf der Seite „Mitglieder“ weiter konfiguriert werden.',
            syncReimbursedReports: 'Erstattete Berichte synchronisieren',
            syncReimbursedReportsDescription:
                'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden Sage Intacct-Konto erstellt.',
            paymentAccount: 'Sage Intacct Zahlungskonto',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Spesen exportiert werden sollen:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagenausgaben werden nach der endgültigen Genehmigung exportiert',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden exportiert, sobald sie bezahlt sind',
                },
            },
        },
        netsuite: {
            subsidiary: 'Tochtergesellschaft',
            subsidiarySelectDescription: 'Wählen Sie die Tochtergesellschaft in NetSuite aus, aus der Sie Daten importieren möchten.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach NetSuite exportiert werden.',
            exportInvoices: 'Rechnungen exportieren nach',
            journalEntriesTaxPostingAccount: 'Steuerbuchungskonto für Journalbuchungen',
            journalEntriesProvTaxPostingAccount: 'Journalbuchungen Provinzsteuer-Buchungskonto',
            foreignCurrencyAmount: 'Betrag in Fremdwährung exportieren',
            exportToNextOpenPeriod: 'In die nächste offene Periode exportieren',
            nonReimbursableJournalPostingAccount: 'Nicht erstattungsfähiges Konto für Journalbuchungen',
            reimbursableJournalPostingAccount: 'Erstattungsfähiges Journalbuchungskonto',
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
                        label: 'Erstellen Sie eins für mich',
                        description: 'Wir erstellen beim Export eine „Expensify-Rechnungsposition“ für dich (falls noch keine vorhanden ist).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Vorhandene auswählen',
                        description: 'Wir verknüpfen Rechnungen aus Expensify mit dem unten ausgewählten Element.',
                    },
                },
            },
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwende dieses Datum beim Exportieren von Berichten zu NetSuite.',
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
                        label: 'Eingereicht am',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Spesenabrechnungen',
                        reimbursableDescription: 'Auslagen werden als Spesenberichte nach NetSuite exportiert.',
                        nonReimbursableDescription: 'Firmencard-Ausgaben werden als Spesenberichte nach NetSuite exportiert.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Lieferantenrechnungen',
                        reimbursableDescription: dedent(`
                            Auslagen werden als Rechnungen exportiert, die an den unten angegebenen NetSuite-Lieferanten zahlbar sind.

                            Wenn Sie für jede Karte einen bestimmten Lieferanten festlegen möchten, gehen Sie zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Firmenkartenausgaben werden als Rechnungen exportiert, die an den unten angegebenen NetSuite-Lieferanten zahlbar sind.

                            Wenn du für jede Karte einen bestimmten Lieferanten festlegen möchtest, gehe zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Journalbuchungen',
                        reimbursableDescription: dedent(`
                            Auslagen aus eigener Tasche werden als Buchungssätze auf das unten angegebene NetSuite-Konto exportiert.

                            Wenn Sie für jede Karte einen bestimmten Lieferanten festlegen möchten, gehen Sie zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Ausgaben mit Firmenkarten werden als Buchungssätze in das unten angegebene NetSuite-Konto exportiert.

                            Wenn Sie für jede Karte einen bestimmten Lieferanten festlegen möchten, gehen Sie zu *Einstellungen > Domains > Firmenkarten*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Wenn Sie die Exporteinstellung für Firmenkarten auf Spesenabrechnungen umstellen, werden NetSuite-Lieferanten und Buchungskonten für einzelne Karten deaktiviert.\n\nKeine Sorge, wir speichern Ihre bisherigen Auswahlen, falls Sie später wieder zurückwechseln möchten.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify wird automatisch jeden Tag mit NetSuite synchronisiert.',
                reimbursedReportsDescription:
                    'Jedes Mal, wenn ein Bericht mit Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im unten stehenden NetSuite-Konto erstellt.',
                reimbursementsAccount: 'Erstattungskonto',
                reimbursementsAccountDescription: 'Wähle das Bankkonto, das du für Rückerstattungen verwenden möchtest, und wir erstellen die zugehörige Zahlung in NetSuite.',
                collectionsAccount: 'Inkassokonto',
                collectionsAccountDescription: 'Sobald eine Rechnung in Expensify als bezahlt markiert und nach NetSuite exportiert wurde, erscheint sie auf dem untenstehenden Konto.',
                approvalAccount: 'Kreditorenfreigabekonto',
                approvalAccountDescription:
                    'Wählen Sie das Konto, gegen das Transaktionen in NetSuite genehmigt werden. Wenn Sie erstattete Berichte synchronisieren, ist dies auch das Konto, gegen das Rechnungszahlungen erstellt werden.',
                defaultApprovalAccount: 'NetSuite-Standard',
                inviteEmployees: 'Mitarbeitende einladen und Genehmigungen festlegen',
                inviteEmployeesDescription:
                    'Importieren Sie NetSuite-Mitarbeiterdaten und laden Sie Mitarbeiter in diesen Workspace ein. Ihr Genehmigungsworkflow ist standardmäßig auf Managergenehmigung eingestellt und kann auf der Seite *Mitglieder* weiter konfiguriert werden.',
                autoCreateEntities: 'Mitarbeitende/Lieferanten automatisch erstellen',
                enableCategories: 'Neu importierte Kategorien aktivieren',
                customFormID: 'Benutzerdefinierte Formular-ID',
                customFormIDDescription:
                    'Standardmäßig erstellt Expensify Buchungen mit dem in NetSuite festgelegten bevorzugten Transaktionsformular. Alternativ können Sie ein bestimmtes Transaktionsformular festlegen, das verwendet werden soll.',
                customFormIDReimbursable: 'Auslage',
                customFormIDNonReimbursable: 'Firmenkartenausgabe',
                exportReportsTo: {
                    label: 'Genehmigungsstufe für Spesenabrechnungen',
                    description:
                        'Sobald ein Spesenbericht in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Verbuchung eine zusätzliche Genehmigungsebene festlegen.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Standardvorgabe für NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Nur vom Vorgesetzten genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Nur von der Buchhaltung genehmigt',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Von Vorgesetztem und Buchhaltung genehmigt',
                    },
                },
                accountingMethods: {
                    label: 'Wann exportieren',
                    description: 'Wählen Sie, wann die Spesen exportiert werden sollen:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Periodenabgrenzung',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Barzahlung',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Auslagenausgaben werden nach der endgültigen Genehmigung exportiert',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Auslagen werden exportiert, sobald sie bezahlt sind',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Genehmigungsstufe für Lieferantenrechnungen',
                    description:
                        'Sobald eine Lieferantenrechnung in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Verbuchung eine zusätzliche Genehmigungsstufe festlegen.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Standardvorgabe für NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Zur Veröffentlichung freigegeben',
                    },
                },
                exportJournalsTo: {
                    label: 'Genehmigungsebene für Journalbuchungen',
                    description:
                        'Sobald ein Journalbuchungseintrag in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite vor der Buchung eine zusätzliche Genehmigungsstufe festlegen.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Standardvorgabe für NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Ausstehende Genehmigung',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Zur Veröffentlichung freigegeben',
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
            noSubsidiariesFoundDescription: 'Bitte fügen Sie eine Tochtergesellschaft in NetSuite hinzu und synchronisieren Sie die Verbindung erneut',
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
                        description: 'In NetSuite gehe zu *Setup > Company > Enable Features > SuiteCloud* und aktiviere *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Zugriffstoken erstellen',
                        description:
                            'Gehe in NetSuite zu *Setup > Users/Roles > Access Tokens* und erstelle ein Zugriffstoken für die App „Expensify“ und entweder die Rolle „Expensify Integration“ oder „Administrator“.\n\n*Wichtig:* Achte darauf, dass du die *Token-ID* und das *Token Secret* aus diesem Schritt speicherst. Du benötigst sie für den nächsten Schritt.',
                    },
                    enterCredentials: {
                        title: 'Geben Sie Ihre NetSuite-Anmeldedaten ein',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite-Konto-ID',
                            netSuiteTokenID: 'Token-ID',
                            netSuiteTokenSecret: 'Token-Secret',
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
                        subtitle: 'Wählen Sie aus, wie *Klassen* in Expensify behandelt werden sollen.',
                    },
                    locations: {
                        title: 'Standorte',
                        subtitle: 'Wählen Sie aus, wie *Standorte* in Expensify gehandhabt werden sollen.',
                    },
                },
                customersOrJobs: {
                    title: 'Kunden/Projekte',
                    subtitle: 'Wählen Sie, wie NetSuite-*Kunden* und -*Projekte* in Expensify behandelt werden sollen.',
                    importCustomers: 'Kunden importieren',
                    importJobs: 'Projekte importieren',
                    customers: 'Kunden',
                    jobs: 'Projekte',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('und')}, ${importType}`,
                },
                importTaxDescription: 'Steuergruppen aus NetSuite importieren.',
                importCustomFields: {
                    chooseOptionBelow: 'Wähle eine der folgenden Optionen aus:',
                    label: ({importedTypes}: ImportedTypesParams) => `Importiert als ${importedTypes.join('und')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Bitte geben Sie das ${fieldName} ein`,
                    customSegments: {
                        title: 'Benutzerdefinierte Segmente/Datensätze',
                        addText: 'Benutzerdefiniertes Segment/Datensatz hinzufügen',
                        recordTitle: 'Benutzerdefinierter Abschnitt/Datensatz',
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
                        removeTitle: 'Benutzerdefiniertes Segment/benutzerdefinierten Datensatz entfernen',
                        removePrompt: 'Sind Sie sicher, dass Sie dieses benutzerdefinierte Segment/den benutzerdefinierten Datensatz entfernen möchten?',
                        addForm: {
                            customSegmentName: 'Benutzerdefinierter Segmentname',
                            customRecordName: 'benutzerdefinierter Datensatzname',
                            segmentTitle: 'Benutzerdefinierter Abschnitt',
                            customSegmentAddTitle: 'Benutzerdefiniertes Segment hinzufügen',
                            customRecordAddTitle: 'Benutzerdefinierten Eintrag hinzufügen',
                            recordTitle: 'Benutzerdefinierter Datensatz',
                            segmentRecordType: 'Möchten Sie ein benutzerdefiniertes Segment oder einen benutzerdefinierten Datensatz hinzufügen?',
                            customSegmentNameTitle: 'Wie lautet der Name des benutzerdefinierten Segments?',
                            customRecordNameTitle: 'Wie lautet der Name des benutzerdefinierten Datensatzes?',
                            customSegmentNameFooter: `Benutzerdefinierte Segmentnamen finden Sie in NetSuite auf der Seite *Customizations > Links, Records & Fields > Custom Segments*.

_Für ausführlichere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Sie können benutzerdefinierte Datensatznamen in NetSuite finden, indem Sie im globalen Suchfeld „Transaction Column Field“ eingeben.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})._`,
                            customSegmentInternalIDTitle: 'Wie lautet die interne ID?',
                            customSegmentInternalIDFooter: `Stellen Sie zunächst sicher, dass Sie interne IDs in NetSuite unter *Home > Set Preferences > Show Internal ID* aktiviert haben.

Sie finden interne IDs benutzerdefinierter Segmente in NetSuite unter:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klicken Sie auf ein benutzerdefiniertes Segment.
3. Klicken Sie auf den Hyperlink neben *Custom Record Type*.
4. Suchen Sie die interne ID in der Tabelle am unteren Rand.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Sie können benutzerdefinierte interne Datensatz-IDs in NetSuite finden, indem Sie folgende Schritte ausführen:

1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.
2. Klicken Sie auf einen benutzerdefinierten Datensatz.
3. Suchen Sie die interne ID auf der linken Seite.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Wie lautet die Skript-ID?',
                            customSegmentScriptIDFooter: `Sie finden die Skript-IDs für benutzerdefinierte Segmente in NetSuite unter:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klicken Sie auf ein benutzerdefiniertes Segment.
3. Klicken Sie unten auf die Registerkarte *Application and Sourcing* und dann:
    a. Wenn Sie das benutzerdefinierte Segment als *Tag* (auf Positionsebene) in Expensify anzeigen möchten, klicken Sie auf die Unterregisterkarte *Transaction Columns* und verwenden Sie die *Field ID*.
    b. Wenn Sie das benutzerdefinierte Segment als *Report Field* (auf Berichtsebene) in Expensify anzeigen möchten, klicken Sie auf die Unterregisterkarte *Transactions* und verwenden Sie die *Field ID*.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Wie lautet die Transaktionsspalten-ID?',
                            customRecordScriptIDFooter: `Benutzerdefinierte Datensatz-Skript-IDs finden Sie in NetSuite unter:

1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.
2. Klicken Sie auf einen benutzerdefinierten Datensatz.
3. Suchen Sie die Skript-ID auf der linken Seite.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Wie soll dieses benutzerdefinierte Segment in Expensify angezeigt werden?',
                            customRecordMappingTitle: 'Wie soll dieser benutzerdefinierte Datensatz in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Ein benutzerdefinierter Abschnitt/Datensatz mit dieser ${fieldName?.toLowerCase()} existiert bereits`,
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
                            transactionFieldIDTitle: 'Wie lautet die Feld-ID der Transaktion?',
                            transactionFieldIDFooter: `Sie können Transaktionsfeld-IDs in NetSuite wie folgt finden:

1. Geben Sie „Transaction Line Fields“ in die globale Suche ein.
2. Öffnen Sie eine benutzerdefinierte Liste.
3. Suchen Sie die Transaktionsfeld-ID auf der linken Seite.

_Für detailliertere Anweisungen [besuchen Sie unsere Hilfeseite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
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
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Wenn Sie ${importField} in NetSuite verwenden, wenden wir beim Export in den Spesenbericht oder die Journaleintragung den Standardwert an, der im Mitarbeiterdatensatz festgelegt ist.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Stichwörter',
                        description: 'Auf Positionsebene',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} wird für jede einzelne Ausgabe im Bericht eines Mitarbeiters auswählbar sein.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Berichtsfelder',
                        description: 'Berichtsebene',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)}-Auswahl gilt für alle Ausgaben auf dem Bericht eines Mitarbeiters.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct-Einrichtung',
            prerequisitesTitle: 'Bevor Sie eine Verbindung herstellen ...',
            downloadExpensifyPackage: 'Lade das Expensify-Paket für Sage Intacct herunter',
            followSteps: 'Befolge die Schritte in unserer Anleitung „How-to: Connect to Sage Intacct“',
            enterCredentials: 'Geben Sie Ihre Sage Intacct-Zugangsdaten ein',
            entity: 'Einheit',
            employeeDefault: 'Standardvorgabe für Sage Intacct-Mitarbeiter',
            employeeDefaultDescription: 'Die Standardabteilung des Mitarbeiters wird, sofern vorhanden, in Sage Intacct auf seine Ausgaben angewendet.',
            displayedAsTagDescription: 'Die Abteilung kann für jede einzelne Ausgabe im Bericht eines Mitarbeiters ausgewählt werden.',
            displayedAsReportFieldDescription: 'Die Auswahl der Abteilung gilt für alle Ausgaben im Bericht eines Mitarbeiters.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Wählen Sie aus, wie Sage Intacct <strong>${mappingTitle}</strong> in Expensify behandelt werden soll.`,
            expenseTypes: 'Ausgabenarten',
            expenseTypesDescription: 'Ihre Sage Intacct-Spesenarten werden als Kategorien in Expensify importiert.',
            accountTypesDescription: 'Ihr Sage Intacct-Kontenplan wird als Kategorien in Expensify importiert.',
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
                other: 'Sonstiges',
                cardProviders: {
                    gl1025: 'American Express Firmenkarten',
                    cdf: 'Mastercard Firmenkarten',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Stripe-Karten',
                },
                yourCardProvider: `Wer ist Ihr Kartenanbieter?`,
                whoIsYourBankAccount: 'Wie heißt deine Bank?',
                whereIsYourBankLocated: 'Wo befindet sich Ihre Bank?',
                howDoYouWantToConnect: 'Wie möchten Sie Ihre Bank verbinden?',
                learnMoreAboutOptions: `<muted-text>Erfahre mehr über diese <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">Optionen</a>.</muted-text>`,
                commercialFeedDetails:
                    'Erfordert die Einrichtung mit Ihrer Bank. Dies wird typischerweise von größeren Unternehmen verwendet und ist oft die beste Option, wenn Sie dafür infrage kommen.',
                commercialFeedPlaidDetails: `Erfordert die Einrichtung mit Ihrer Bank, aber wir führen Sie durch den Prozess. Dies ist in der Regel auf größere Unternehmen beschränkt.`,
                directFeedDetails: 'Der einfachste Ansatz. Verbinden Sie sich sofort mit Ihren Master-Zugangsdaten. Diese Methode ist am gebräuchlichsten.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Aktivieren Sie Ihren ${provider}-Feed`,
                    heading:
                        'Wir haben eine direkte Integration mit Ihrem Kartenaussteller und können Ihre Transaktionsdaten schnell und genau in Expensify importieren.\n\nUm loszulegen, führen Sie einfach Folgendes aus:',
                    visa: 'Wir verfügen über globale Integrationen mit Visa, allerdings variiert die Berechtigung je nach Bank und Kartenprogramm.\n\nUm loszulegen, gehen Sie einfach wie folgt vor:',
                    mastercard:
                        'Wir haben globale Integrationen mit Mastercard, allerdings variiert die Berechtigung je nach Bank und Kartenprogramm.\n\nUm loszulegen, gehen Sie einfach wie folgt vor:',
                    vcf: `1. Besuchen Sie [diesen Hilfeartikel](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) für ausführliche Anweisungen zum Einrichten Ihrer Visa Commercial Cards.

2. [Kontaktieren Sie Ihre Bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}), um zu bestätigen, dass sie einen Commercial-Feed für Ihr Programm unterstützt, und bitten Sie sie, diesen zu aktivieren.

3. *Sobald der Feed aktiviert ist und Sie seine Details haben, fahren Sie mit dem nächsten Bildschirm fort.*`,
                    gl1025: `1. Besuchen Sie [diesen Hilfeartikel](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}), um herauszufinden, ob American Express einen Commercial-Feed für Ihr Programm aktivieren kann.

2. Sobald der Feed aktiviert ist, sendet Amex Ihnen ein Produktionsschreiben.

3. *Sobald Sie die Feed-Informationen haben, fahren Sie mit dem nächsten Bildschirm fort.*`,
                    cdf: `1. Besuchen Sie [diesen Hilfeartikel](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) für detaillierte Anweisungen zum Einrichten Ihrer Mastercard Commercial Cards.

2. [Kontaktieren Sie Ihre Bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}), um zu bestätigen, dass sie einen Commercial Feed für Ihr Programm unterstützt, und bitten Sie sie, diesen zu aktivieren.

3. *Sobald der Feed aktiviert ist und Sie seine Details haben, fahren Sie mit dem nächsten Bildschirm fort.*`,
                    stripe: `1. Besuche das Dashboard von Stripe und gehe zu [Einstellungen](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Klicke unter „Produktintegrationen“ auf „Aktivieren“ neben Expensify.

3. Sobald der Feed aktiviert ist, klicke unten auf „Senden“ und wir kümmern uns darum, ihn hinzuzufügen.`,
                },
                whatBankIssuesCard: 'Welche Bank gibt diese Karten aus?',
                enterNameOfBank: 'Name der Bank eingeben',
                feedDetails: {
                    vcf: {
                        title: 'Was sind die Details des Visa-Feeds?',
                        processorLabel: 'Prozessor-ID',
                        bankLabel: 'Kennung des Finanzinstituts (Bank)',
                        companyLabel: 'Firmen-ID',
                        helpLabel: 'Wo finde ich diese IDs?',
                    },
                    gl1025: {
                        title: `Wie lautet der Name der Amex-Übermittlungsdatei?`,
                        fileNameLabel: 'Name der Zustellungsdatei',
                        helpLabel: 'Wo finde ich den Dateinamen der Lieferung?',
                    },
                    cdf: {
                        title: `Was ist die Mastercard-Verteilungs-ID?`,
                        distributionLabel: 'Verteilungs-ID',
                        helpLabel: 'Wo finde ich die Distributions-ID?',
                    },
                },
                amexCorporate: 'Wählen Sie dies aus, wenn auf der Vorderseite Ihrer Karten „Corporate“ steht',
                amexBusiness: 'Wählen Sie dies aus, wenn auf der Vorderseite Ihrer Karten „Business“ steht',
                amexPersonal: 'Wählen Sie dies, wenn Ihre Karten privat sind',
                error: {
                    pleaseSelectProvider: 'Bitte wählen Sie einen Kartenanbieter aus, bevor Sie fortfahren',
                    pleaseSelectBankAccount: 'Bitte wähle ein Bankkonto aus, bevor du fortfährst',
                    pleaseSelectBank: 'Bitte wählen Sie eine Bank aus, bevor Sie fortfahren',
                    pleaseSelectCountry: 'Bitte wählen Sie ein Land aus, bevor Sie fortfahren',
                    pleaseSelectFeedType: 'Bitte wählen Sie einen Feed-Typ aus, bevor Sie fortfahren',
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
            feedName: ({feedName}: CompanyCardFeedNameParams) => `${feedName}-Karten`,
            directFeed: 'Direkt-Feed',
            whoNeedsCardAssigned: 'Wer benötigt eine zugewiesene Karte?',
            chooseCard: 'Wähle eine Karte',
            chooseCardFor: ({assignee}: AssigneeParams) =>
                `Wählen Sie eine Karte für <strong>${assignee}</strong>. Sie finden die gesuchte Karte nicht? <concierge-link>Teilen Sie es uns mit.</concierge-link>`,
            noActiveCards: 'Keine aktiven Karten in diesem Feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Oder etwas ist möglicherweise kaputt. So oder so, wenn du Fragen hast, <concierge-link>kontaktiere einfach Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Wählen Sie ein Transaktions-Startdatum aus',
            startDateDescription: 'Wir importieren alle Transaktionen ab diesem Datum. Wenn kein Datum angegeben ist, gehen wir so weit zurück, wie es Ihre Bank zulässt.',
            fromTheBeginning: 'Von Anfang an',
            customStartDate: 'Benutzerdefiniertes Startdatum',
            customCloseDate: 'Benutzerdefiniertes Abschlussdatum',
            letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
            confirmationDescription: 'Wir beginnen sofort mit dem Import der Transaktionen.',
            cardholder: 'Karteninhaber',
            card: 'Karte',
            cardName: 'Kartenname',
            brokenConnectionError:
                '<rbr>Kartenfeed-Verbindung ist unterbrochen. Bitte <a href="#">melden Sie sich bei Ihrer Bank an</a>, damit wir die Verbindung wiederherstellen können.</rbr>',
            assignedCard: ({assignee, link}: AssignedCardParams) => `${assignee} wurde ein ${link} zugewiesen! Importierte Transaktionen werden in diesem Chat angezeigt.`,
            companyCard: 'Firmenkarte',
            chooseCardFeed: 'Kartenfeed auswählen',
            ukRegulation:
                'Expensify Limited ist ein Vermittler von Plaid Financial Ltd., einem zugelassenen Zahlungsinstitut, das von der Financial Conduct Authority gemäß den Payment Services Regulations 2017 (Firm Reference Number: 804718) reguliert wird. Plaid stellt Ihnen regulierte Kontoinformationsdienste über Expensify Limited als seinen Vermittler zur Verfügung.',
        },
        expensifyCard: {
            issueAndManageCards: 'Expensify Cards ausgeben und verwalten',
            getStartedIssuing: 'Beginnen Sie, indem Sie Ihre erste virtuelle oder physische Karte ausstellen.',
            verificationInProgress: 'Verifizierung läuft...',
            verifyingTheDetails: 'Wir überprüfen ein paar Details. Concierge informiert dich, sobald Expensify Cards zur Ausgabe bereit sind.',
            disclaimer:
                'Die Expensify Visa® Commercial Card wird von The Bancorp Bank, N.A., Member FDIC, auf Grundlage einer Lizenz von Visa U.S.A. Inc. ausgegeben und kann möglicherweise nicht bei allen Händlern verwendet werden, die Visa-Karten akzeptieren. Apple® und das Apple Logo® sind Marken von Apple Inc., eingetragen in den USA und anderen Ländern. App Store ist eine Servicemarke von Apple Inc. Google Play und das Google Play-Logo sind Marken von Google LLC.',
            euUkDisclaimer:
                'Für Einwohner des EWR ausgegebene Karten werden von Transact Payments Malta Limited ausgestellt, und für Einwohner des Vereinigten Königreichs ausgegebene Karten werden von Transact Payments Limited auf Grundlage einer Lizenz von Visa Europe Limited ausgestellt. Transact Payments Malta Limited ist ordnungsgemäß von der Malta Financial Services Authority als Finanzinstitut nach dem Financial Institution Act 1994 zugelassen und reguliert. Registrierungsnummer C 91879. Transact Payments Limited ist von der Gibraltar Financial Service Commission zugelassen und reguliert.',
            issueCard: 'Karte ausstellen',
            findCard: 'Karte finden',
            newCard: 'Neue Karte',
            name: 'Name',
            lastFour: 'Letzte 4',
            limit: 'Limit',
            currentBalance: 'Aktueller Kontostand',
            currentBalanceDescription: 'Der aktuelle Saldo ist die Summe aller gebuchten Expensify-Card-Transaktionen, die seit dem letzten Abrechnungsdatum erfolgt sind.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Der Saldo wird am ${settlementDate} ausgeglichen`,
            settleBalance: 'Saldo ausgleichen',
            cardLimit: 'Kartenlimit',
            remainingLimit: 'Verbleibendes Limit',
            requestLimitIncrease: 'Anforderung zur Erhöhung des Anfragekontingents',
            remainingLimitDescription:
                'Wir berücksichtigen mehrere Faktoren bei der Berechnung Ihres verbleibenden Limits: Ihre Kundenhistorie, die geschäftsbezogenen Informationen, die Sie bei der Registrierung angegeben haben, sowie das verfügbare Guthaben auf Ihrem Geschäftskonto. Ihr verbleibendes Limit kann sich täglich ändern.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Das Cashback-Guthaben basiert auf den abgerechneten monatlichen Ausgaben mit der Expensify Card in Ihrem Workspace.',
            issueNewCard: 'Neue Karte ausstellen',
            finishSetup: 'Einrichtung abschließen',
            chooseBankAccount: 'Bankkonto auswählen',
            chooseExistingBank: 'Wählen Sie ein vorhandenes Geschäftskonto, um Ihr Expensify Card-Guthaben zu bezahlen, oder fügen Sie ein neues Bankkonto hinzu',
            accountEndingIn: 'Konto endet auf',
            addNewBankAccount: 'Neues Bankkonto hinzufügen',
            settlementAccount: 'Abrechnungskonto',
            settlementAccountDescription: 'Wählen Sie ein Konto aus, um Ihren Expensify Card-Saldo zu begleichen.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Stellen Sie sicher, dass dieses Konto mit Ihrem <a href="${reconciliationAccountSettingsLink}">Abstimmungskonto</a> (${accountNumber}) übereinstimmt, damit die fortlaufende Abstimmung ordnungsgemäß funktioniert.`,
            settlementFrequency: 'Abrechnungshäufigkeit',
            settlementFrequencyDescription: 'Wählen Sie aus, wie oft Sie Ihren Expensify Card-Saldo begleichen.',
            settlementFrequencyInfo:
                'Wenn du zur monatlichen Abrechnung wechseln möchtest, musst du dein Bankkonto über Plaid verknüpfen und über eine positive Kontohistorie der letzten 90 Tage verfügen.',
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
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Wenn du das Limit dieser Karte auf ${limit} änderst, werden neue Transaktionen abgelehnt, bis du weitere Ausgaben auf der Karte genehmigst.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `Wenn Sie das Limit dieser Karte auf ${limit} ändern, werden neue Transaktionen bis zum nächsten Monat abgelehnt.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Wenn du das Limit dieser Karte auf ${limit} änderst, werden neue Transaktionen abgelehnt.`,
            changeCardLimitType: 'Kartengrenztyp ändern',
            changeLimitType: 'Limittyp ändern',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Wenn du den Limittyp dieser Karte in Smart Limit änderst, werden neue Transaktionen abgelehnt, weil das nicht genehmigte Limit von ${limit} bereits erreicht wurde.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Wenn Sie den Limittyp dieser Karte auf Monatlich ändern, werden neue Transaktionen abgelehnt, weil das monatliche Limit von ${limit} bereits erreicht wurde.`,
            addShippingDetails: 'Versanddetails hinzufügen',
            issuedCard: ({assignee}: AssigneeParams) => `hat ${assignee} eine Expensify Card ausgestellt! Die Karte wird in 2–3 Werktagen ankommen.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) =>
                `hat ${assignee} eine Expensify Card ausgestellt! Die Karte wird verschickt, sobald die Versanddetails bestätigt sind.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `hat ${assignee} eine virtuelle Expensify Card ausgestellt! Der ${link} kann sofort verwendet werden.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} hat Versanddetails hinzugefügt. Die Expensify Card wird in 2–3 Werktagen ankommen.`,
            replacedCard: ({assignee}: AssigneeParams) => `${assignee} hat ihre Expensify Card ersetzt. Die neue Karte wird in 2–3 Werktagen eintreffen.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} hat ihre virtuelle Expensify Card ersetzt! Die ${link} kann sofort verwendet werden.`,
            card: 'Karte',
            replacementCard: 'Ersatzkarte',
            verifyingHeader: 'Wird überprüft',
            bankAccountVerifiedHeader: 'Bankkonto verifiziert',
            verifyingBankAccount: 'Bankkonto wird verifiziert …',
            verifyingBankAccountDescription: 'Bitte warten Sie, während wir bestätigen, dass dieses Konto zur Ausstellung von Expensify Cards verwendet werden kann.',
            bankAccountVerified: 'Bankkonto verifiziert!',
            bankAccountVerifiedDescription: 'Sie können jetzt Expensify Cards an die Mitglieder Ihres Arbeitsbereichs ausgeben.',
            oneMoreStep: 'Nur noch ein Schritt ...',
            oneMoreStepDescription: 'Es sieht so aus, als müssten wir dein Bankkonto manuell verifizieren. Bitte wechsle zu Concierge, wo deine Anweisungen bereits auf dich warten.',
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
            spendCategoriesDescription: 'Passen Sie an, wie Händleraushaben für Kreditkartentransaktionen und gescannte Belege kategorisiert werden.',
            deleteFailureMessage: 'Beim Löschen der Kategorie ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            categoryName: 'Kategoriename',
            requiresCategory: 'Mitglieder müssen alle Ausgaben kategorisieren',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Alle Ausgaben müssen kategorisiert werden, um nach ${connectionName} exportiert werden zu können.`,
            subtitle: 'Verschaffe dir einen besseren Überblick darüber, wofür Geld ausgegeben wird. Verwende unsere Standardkategorien oder füge deine eigenen hinzu.',
            emptyCategories: {
                title: 'Sie haben noch keine Kategorien erstellt',
                subtitle: 'Fügen Sie eine Kategorie hinzu, um Ihre Ausgaben zu organisieren.',
                subtitleWithAccounting: ({accountingPageURL}: EmptyCategoriesSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>Ihre Kategorien werden derzeit aus einer Buchhaltungsverbindung importiert. Gehen Sie zu <a href="${accountingPageURL}">Buchhaltung</a>, um Änderungen vorzunehmen.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Beim Aktualisieren der Kategorie ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
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
            updatePayrollCodeFailureMessage: 'Beim Aktualisieren des Payroll-Codes ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            glCode: 'Sachkontonummer',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des Hauptbuchcodes ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            importCategories: 'Kategorien importieren',
            cannotDeleteOrDisableAllCategories: {
                title: 'Alle Kategorien können nicht gelöscht oder deaktiviert werden',
                description: `Mindestens eine Kategorie muss aktiviert bleiben, da Ihr Workspace Kategorien erfordert.`,
            },
        },
        moreFeatures: {
            subtitle: 'Verwende die Schalter unten, um mit deinem Wachstum weitere Funktionen zu aktivieren. Jede Funktion erscheint im Navigationsmenü für weitere Anpassungen.',
            spendSection: {
                title: 'Ausgaben',
                subtitle: 'Aktivieren Sie Funktionen, die Ihnen helfen, Ihr Team zu skalieren.',
            },
            manageSection: {
                title: 'Verwalten',
                subtitle: 'Fügen Sie Steuerelemente hinzu, die helfen, Ausgaben im Budget zu halten.',
            },
            earnSection: {
                title: 'Verdienen',
                subtitle: 'Optimieren Sie Ihren Umsatz und werden Sie schneller bezahlt.',
            },
            organizeSection: {
                title: 'Organisieren',
                subtitle: 'Gruppiere und analysiere Ausgaben, erfasse jede gezahlte Steuer.',
            },
            integrateSection: {
                title: 'Integrieren',
                subtitle: 'Verbinde Expensify mit beliebten Finanzprodukten.',
            },
            distanceRates: {
                title: 'Entfernungsraten',
                subtitle: 'Sätze hinzufügen, aktualisieren und durchsetzen.',
            },
            perDiem: {
                title: 'Tagegeld',
                subtitle: 'Legen Sie Pauschalspesen fest, um die täglichen Ausgaben Ihrer Mitarbeitenden zu steuern.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Verschaffen Sie sich Einblicke in Ausgaben und behalten Sie die volle Kontrolle darüber.',
                disableCardTitle: 'Expensify Card deaktivieren',
                disableCardPrompt: 'Sie können die Expensify Card nicht deaktivieren, da sie bereits verwendet wird. Wenden Sie sich an Concierge, um die nächsten Schritte zu erfahren.',
                disableCardButton: 'Mit Concierge chatten',
                feed: {
                    title: 'Expensify Card erhalten',
                    subTitle: 'Vereinfachen Sie Ihre Geschäftsausgaben und sparen Sie bis zu 50 % auf Ihre Expensify-Rechnung, außerdem:',
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
                subtitle: 'Ausgaben von vorhandenen Firmenkarten importieren.',
                feed: {
                    title: 'Firmenkarten importieren',
                    features: {
                        support: 'Unterstützung für alle gängigen Kartenanbieter',
                        assignCards: 'Karten dem gesamten Team zuweisen',
                        automaticImport: 'Automatischer Transaktionsimport',
                    },
                },
                bankConnectionError: 'Problem mit der Bankverbindung',
                connectWithPlaid: 'Über Plaid verbinden',
                connectWithExpensifyCard: 'Probieren Sie die Expensify Card aus.',
                bankConnectionDescription: `Bitte versuchen Sie, Ihre Karten erneut hinzuzufügen. Andernfalls können Sie`,
                disableCardTitle: 'Firmenkarten deaktivieren',
                disableCardPrompt: 'Sie können Firmenkarten nicht deaktivieren, da diese Funktion in Verwendung ist. Wenden Sie sich an den Concierge, um die nächsten Schritte zu erfahren.',
                disableCardButton: 'Mit Concierge chatten',
                cardDetails: 'Kartendetails',
                cardNumber: 'Kartennummer',
                cardholder: 'Karteninhaber',
                cardName: 'Kartenname',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} Export` : `${integration}-Export`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Wählen Sie das ${integration}-Konto, in das Transaktionen exportiert werden sollen.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Wähle das ${integration}-Konto, in das Transaktionen exportiert werden sollen. Wähle eine andere <a href="${exportPageLink}">Exportoption</a>, um die verfügbaren Konten zu ändern.`,
                lastUpdated: 'Zuletzt aktualisiert',
                transactionStartDate: 'Startdatum der Transaktion',
                updateCard: 'Karte aktualisieren',
                unassignCard: 'Karte zuweisen aufheben',
                unassign: 'Zuweisung aufheben',
                unassignCardDescription: 'Die Aufhebung der Zuweisung dieser Karte entfernt alle Transaktionen in Entwurfsberichten aus dem Konto des Karteninhabers.',
                assignCard: 'Karte zuweisen',
                cardFeedName: 'Name des Kartenfeeds',
                cardFeedNameDescription: 'Gib dem Kartenfeed einen eindeutigen Namen, damit du ihn von den anderen unterscheiden kannst.',
                cardFeedTransaction: 'Transaktionen löschen',
                cardFeedTransactionDescription: 'Legen Sie fest, ob Karteninhaber Kartentransaktionen löschen können. Neue Transaktionen folgen diesen Regeln.',
                cardFeedRestrictDeletingTransaction: 'Löschen von Transaktionen einschränken',
                cardFeedAllowDeletingTransaction: 'Löschen von Transaktionen erlauben',
                removeCardFeed: 'Kartenfeed entfernen',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `Feed ${feedName} entfernen`,
                removeCardFeedDescription: 'Sind Sie sicher, dass Sie diesen Kartenfeed entfernen möchten? Dadurch werden alle Karten zugewiesen.',
                error: {
                    feedNameRequired: 'Kartenfeed-Name ist erforderlich',
                    statementCloseDateRequired: 'Bitte wählen Sie ein Datum für den Abschluss der Abrechnung aus.',
                },
                corporate: 'Löschen von Transaktionen einschränken',
                personal: 'Löschen von Transaktionen erlauben',
                setFeedNameDescription: 'Gib dem Kartenfeed einen eindeutigen Namen, damit du ihn von den anderen unterscheiden kannst',
                setTransactionLiabilityDescription: 'Wenn diese Option aktiviert ist, können Karteninhaber Kartenumsätze löschen. Neue Umsätze folgen dieser Regel.',
                emptyAddedFeedTitle: 'Firmenkarten zuweisen',
                emptyAddedFeedDescription: 'Beginnen Sie, indem Sie Ihre erste Karte einem Mitglied zuweisen.',
                pendingFeedTitle: `Wir überprüfen Ihre Anfrage …`,
                pendingFeedDescription: `Wir überprüfen derzeit Ihre Feed-Details. Sobald dies abgeschlossen ist, werden wir Sie kontaktieren über`,
                pendingBankTitle: 'Überprüfen Sie Ihr Browserfenster',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `Bitte verbinden Sie sich mit ${bankName} über das Browserfenster, das sich gerade geöffnet hat. Falls sich keines geöffnet hat,`,
                pendingBankLink: 'bitte hier klicken',
                giveItNameInstruction: 'Gib der Karte einen Namen, der sie von anderen abhebt.',
                updating: 'Aktualisiere …',
                noAccountsFound: 'Keine Konten gefunden',
                defaultCard: 'Standardkarte',
                downgradeTitle: `Arbeitsbereich kann nicht herabgestuft werden`,
                downgradeSubTitle: `Dieser Workspace kann nicht herabgestuft werden, da mehrere Kartenfeeds verbunden sind (ohne Expensify Cards). Bitte <a href="#">nur einen Kartenfeed beibehalten</a>, um fortzufahren.`,
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Bitte fügen Sie das Konto in ${connection} hinzu und synchronisieren Sie die Verbindung erneut`,
                expensifyCardBannerTitle: 'Expensify Card erhalten',
                expensifyCardBannerSubtitle: 'Genieße Cashback bei jedem Einkauf in den USA, bis zu 50 % Rabatt auf deine Expensify-Rechnung, unbegrenzt virtuelle Karten und vieles mehr.',
                expensifyCardBannerLearnMoreButton: 'Mehr erfahren',
                statementCloseDateTitle: 'Abschlussdatum der Abrechnung',
                statementCloseDateDescription: 'Teilen Sie uns mit, wann Ihr Kreditkartenkontoauszug abgeschlossen wird, und wir erstellen einen passenden Auszug in Expensify.',
            },
            workflows: {
                title: 'Workflows',
                subtitle: 'Konfigurieren Sie, wie Ausgaben genehmigt und bezahlt werden.',
                disableApprovalPrompt:
                    'Expensify Cards in diesem Workspace stützen sich derzeit auf Genehmigungen, um ihre Smart Limits festzulegen. Bitte ändern Sie die Limittypen aller Expensify Cards mit Smart Limits, bevor Sie Genehmigungen deaktivieren.',
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
                subtitle: 'Erfasse und fordere erstattungsfähige Steuern zurück.',
            },
            reportFields: {
                title: 'Berichtsfelder',
                subtitle: 'Richten Sie benutzerdefinierte Felder für Ausgaben ein.',
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
                featureEnabledTitle: 'Nicht so schnell …',
                featureEnabledText: 'Um diese Funktion zu aktivieren oder zu deaktivieren, müssen Sie Ihre Einstellungen für den Buchhaltungsimport ändern.',
                disconnectText: 'Um die Buchhaltung zu deaktivieren, musst du die Buchhaltungsanbindung in deinem Workspace trennen.',
                manageSettings: 'Einstellungen verwalten',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Uber trennen',
                disconnectText: 'Um diese Funktion zu deaktivieren, trennen Sie bitte zuerst die Uber for Business-Integration.',
                description: 'Möchten Sie diese Integration wirklich trennen?',
                confirmText: 'Verstanden',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Nicht so schnell …',
                featureEnabledText:
                    'Expensify Cards in diesem Arbeitsbereich verwenden Genehmigungs-Workflows, um ihre Smart Limits festzulegen.\n\nBitte ändern Sie die Limittypen aller Karten mit Smart Limits, bevor Sie Workflows deaktivieren.',
                confirmText: 'Zu Expensify Cards wechseln',
            },
            rules: {
                title: 'Regeln',
                subtitle: 'Belege anfordern, hohe Ausgaben kennzeichnen und mehr.',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Beispiele:',
            customReportNamesSubtitle: `<muted-text>Berichtstitel mit unseren <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">umfangreichen Formeln</a> anpassen.</muted-text>`,
            customNameTitle: 'Standardmäßiger Berichtstitel',
            customNameDescription: `Wählen Sie einen benutzerdefinierten Namen für Spesenabrechnungen mithilfe unserer <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">umfangreichen Formeln</a>.`,
            customNameInputLabel: 'Name',
            customNameEmailPhoneExample: 'E-Mail oder Telefonnummer des Mitglieds: {report:submit:from}',
            customNameStartDateExample: 'Berichtsanfangsdatum: {report:startdate}',
            customNameWorkspaceNameExample: 'Arbeitsbereichsname: {report:workspacename}',
            customNameReportIDExample: 'Berichts-ID: {report:id}',
            customNameTotalExample: 'Gesamt: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Verhindern, dass Mitglieder benutzerdefinierte Berichtstitel ändern',
        },
        reportFields: {
            addField: 'Feld hinzufügen',
            delete: 'Feld löschen',
            deleteFields: 'Felder löschen',
            findReportField: 'Berichtsfeld suchen',
            deleteConfirmation: 'Möchten Sie dieses Berichtsfeld wirklich löschen?',
            deleteFieldsConfirmation: 'Möchten Sie diese Berichtsfelder wirklich löschen?',
            emptyReportFields: {
                title: 'Sie haben noch keine Berichts­felder erstellt',
                subtitle: 'Fügen Sie ein benutzerdefiniertes Feld (Text, Datum oder Dropdown) hinzu, das in Berichten angezeigt wird.',
            },
            subtitle: 'Berichtsfelder gelten für alle Ausgaben und können hilfreich sein, wenn Sie nach zusätzlichen Informationen fragen möchten.',
            disableReportFields: 'Berichtsfelder deaktivieren',
            disableReportFieldsConfirmation: 'Sind Sie sicher? Text- und Datumsfelder werden gelöscht und Listen werden deaktiviert.',
            importedFromAccountingSoftware: 'Die folgenden Berichtsfelder werden importiert aus deinem',
            textType: 'Text',
            dateType: 'Datum',
            dropdownType: 'Liste',
            formulaType: 'Formel',
            textAlternateText: 'Feld für freie Texteingabe hinzufügen.',
            dateAlternateText: 'Fügen Sie einen Kalender zur Datumsauswahl hinzu.',
            dropdownAlternateText: 'Fügen Sie eine Auswahlliste mit Optionen hinzu.',
            formulaAlternateText: 'Fügen Sie ein Formelfeld hinzu.',
            nameInputSubtitle: 'Wählen Sie einen Namen für das Berichts­feld.',
            typeInputSubtitle: 'Wählen Sie aus, welchen Berichtsfeldtyp Sie verwenden möchten.',
            initialValueInputSubtitle: 'Geben Sie einen Startwert ein, der im Berichtsfeld angezeigt werden soll.',
            listValuesInputSubtitle: 'Diese Werte werden in der Dropdown-Liste des Berichtsfelds angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            listInputSubtitle: 'Diese Werte erscheinen in der Feldliste Ihres Berichts. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
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
            deleteValuePrompt: 'Sind Sie sicher, dass Sie diesen Listenwert löschen möchten?',
            deleteValuesPrompt: 'Möchten Sie diese Listenwerte wirklich löschen?',
            listValueRequiredError: 'Bitte geben Sie einen Listeneintragsnamen ein',
            existingListValueError: 'Ein Listeneintrag mit diesem Namen existiert bereits',
            editValue: 'Wert bearbeiten',
            listValues: 'Werte auflisten',
            addValue: 'Wert hinzufügen',
            existingReportFieldNameError: 'Ein Berichtsfeld mit diesem Namen existiert bereits',
            reportFieldNameRequiredError: 'Bitte geben Sie einen Berichtsfeldnamen ein',
            reportFieldTypeRequiredError: 'Bitte wählen Sie einen Berichtsfeldtyp',
            circularReferenceError: 'Dieses Feld kann nicht auf sich selbst verweisen. Bitte aktualisieren.',
            reportFieldInitialValueRequiredError: 'Bitte wähle einen Anfangswert für das Berichts­feld',
            genericFailureMessage: 'Beim Aktualisieren des Berichtsfeldes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        tags: {
            tagName: 'Tag-Name',
            requiresTag: 'Mitglieder müssen alle Ausgaben taggen',
            trackBillable: 'Abrechenbare Ausgaben verfolgen',
            customTagName: 'Benutzerdefinierter Tag-Name',
            enableTag: 'Tag aktivieren',
            enableTags: 'Tags aktivieren',
            requireTag: 'Erforderlich-Tag',
            requireTags: 'Tags erforderlich',
            notRequireTags: 'Nicht erforderlich',
            disableTag: 'Tag deaktivieren',
            disableTags: 'Tags deaktivieren',
            addTag: 'Tag hinzufügen',
            editTag: 'Tag bearbeiten',
            editTags: 'Tags bearbeiten',
            findTag: 'Tag finden',
            subtitle: 'Tags bieten detailliertere Möglichkeiten, Kosten zu klassifizieren.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: ({importSpreadsheetLink}: DependentMultiLevelTagsSubtitleParams) =>
                `<muted-text>Sie verwenden <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">abhängige Tags</a>. Sie können eine <a href="${importSpreadsheetLink}">Tabelle erneut importieren</a>, um Ihre Tags zu aktualisieren.</muted-text>`,
            emptyTags: {
                title: 'Sie haben noch keine Tags erstellt',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Fügen Sie ein Tag hinzu, um Projekte, Standorte, Abteilungen und mehr zu verfolgen.',
                subtitleHTML: `<muted-text><centered-text>Importieren Sie eine Tabelle, um Tags für die Verfolgung von Projekten, Standorten, Abteilungen und mehr hinzuzufügen. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Erfahren Sie mehr</a> über die Formatierung von Tag-Dateien.</centered-text></muted-text>`,
                subtitleWithAccounting: ({accountingPageURL}: EmptyTagsSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>Ihre Tags werden derzeit aus einer Buchhaltungsanbindung importiert. Gehen Sie zu <a href="${accountingPageURL}">Buchhaltung</a>, um Änderungen vorzunehmen.</centered-text></muted-text>`,
            },
            deleteTag: 'Tag löschen',
            deleteTags: 'Tags löschen',
            deleteTagConfirmation: 'Sind Sie sicher, dass Sie dieses Tag löschen möchten?',
            deleteTagsConfirmation: 'Bist du sicher, dass du diese Tags löschen möchtest?',
            deleteFailureMessage: 'Beim Löschen des Tags ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            tagRequiredError: 'Tag-Name ist erforderlich',
            existingTagError: 'Ein Tag mit diesem Namen existiert bereits',
            invalidTagNameError: 'Tag-Name kann nicht 0 sein. Bitte wählen Sie einen anderen Wert.',
            genericFailureMessage: 'Beim Aktualisieren des Tags ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            importedFromAccountingSoftware: 'Die folgenden Tags werden importiert aus Ihrem',
            glCode: 'Sachkontonummer',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des Hauptbuchcodes ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            tagRules: 'Tag-Regeln',
            approverDescription: 'Genehmiger',
            importTags: 'Tags importieren',
            importTagsSupportingText: 'Kategorisieren Sie Ihre Ausgaben mit einem Tag-Typ oder mehreren.',
            configureMultiLevelTags: 'Konfigurieren Sie Ihre Liste von Tags für eine mehrstufige Verschlagwortung.',
            importMultiLevelTagsSupportingText: `Hier ist eine Vorschau deiner Tags. Wenn alles gut aussieht, klicke unten, um sie zu importieren.`,
            importMultiLevelTags: {
                firstRowTitle: 'Die erste Zeile ist der Titel für jede Tagliste',
                independentTags: 'Dies sind unabhängige Tags',
                glAdjacentColumn: 'In der angrenzenden Spalte befindet sich ein Hauptbuchcode (GL-Code).',
            },
            tagLevel: {
                singleLevel: 'Einfache Tag-Ebene',
                multiLevel: 'Mehrstufige Tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Tag-Ebenen wechseln',
                prompt1: 'Wenn du die Tag-Ebenen wechselst, werden alle aktuellen Tags gelöscht.',
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
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Wir haben *${columnCounts} Spalten* in Ihrer Tabelle gefunden. Wählen Sie *Name* neben der Spalte aus, die die Tag-Namen enthält. Sie können außerdem *Aktiviert* neben der Spalte auswählen, die den Tag-Status festlegt.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Kann nicht alle Tags löschen oder deaktivieren',
                description: `Mindestens ein Tag muss aktiviert bleiben, da Ihr Workspace Tags erfordert.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Kann nicht alle Tags optional machen',
                description: `Mindestens ein Tag muss weiterhin erforderlich sein, da Ihre Workspace-Einstellungen Tags verlangen.`,
            },
            cannotMakeTagListRequired: {
                title: 'Kann die Tag-Liste nicht als erforderlich festlegen',
                description: 'Sie können eine Tagliste nur dann als erforderlich festlegen, wenn Ihre Richtlinie mehrere Tag-Ebenen konfiguriert hat.',
            },
            tagCount: () => ({
                one: '1 Tag',
                other: (count: number) => `${count} Tags`,
            }),
        },
        taxes: {
            subtitle: 'Steuernamen und -sätze hinzufügen und Standardwerte festlegen.',
            addRate: 'Satz hinzufügen',
            workspaceDefault: 'Standardwährung des Workspace',
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
                updateTaxClaimableFailureMessage: 'Der erstattungsfähige Anteil muss geringer sein als der Distanzsatzbetrag',
            },
            deleteTaxConfirmation: 'Möchten Sie diese Steuer wirklich löschen?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Möchten Sie wirklich ${taxAmount} Steuern löschen?`,
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
            importedFromAccountingSoftware: 'Die untenstehenden Steuern werden importiert aus Ihrem',
            taxCode: 'Steuercode',
            updateTaxCodeFailureMessage: 'Beim Aktualisieren des Steuercodes ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        duplicateWorkspace: {
            title: 'Benennen Sie Ihren neuen Arbeitsbereich',
            selectFeatures: 'Funktionen zum Kopieren auswählen',
            whichFeatures: 'Welche Funktionen möchtest du in deinen neuen Workspace übernehmen?',
            confirmDuplicate: 'Möchtest du fortfahren?',
            categories: 'Kategorien und Ihre automatischen Kategorisierungsregeln',
            reimbursementAccount: 'Erstattungskonto',
            welcomeNote: 'Bitte verwende ab jetzt meinen neuen Workspace',
            delayedSubmission: 'verspätete Einreichung',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Sie sind dabei, ${newWorkspaceName ?? ''} mit ${totalMembers ?? 0} Mitgliedern aus dem ursprünglichen Arbeitsbereich zu erstellen und zu teilen.`,
            error: 'Beim Duplizieren deines neuen Arbeitsbereichs ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        },
        emptyWorkspace: {
            title: 'Du hast keine Arbeitsbereiche',
            subtitle: 'Belege nachverfolgen, Ausgaben erstatten, Reisen verwalten, Rechnungen senden und mehr.',
            createAWorkspaceCTA: 'Loslegen',
            features: {
                trackAndCollect: 'Belege verfolgen und erfassen',
                reimbursements: 'Mitarbeiter erstatten',
                companyCards: 'Firmenkarten verwalten',
            },
            notFound: 'Kein Workspace gefunden',
            description:
                'Räume sind ein großartiger Ort, um sich auszutauschen und mit mehreren Personen zusammenzuarbeiten. Um mit der Zusammenarbeit zu beginnen, erstellen Sie einen Workspace oder treten Sie einem bei.',
        },
        new: {
            newWorkspace: 'Neuer Arbeitsbereich',
            getTheExpensifyCardAndMore: 'Hol dir die Expensify Card und mehr',
            confirmWorkspace: 'Workspace bestätigen',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mein Gruppenarbeitsbereich${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Workspace von ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Beim Entfernen eines Mitglieds aus dem Workspace ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Sind Sie sicher, dass Sie ${memberName} entfernen möchten?`,
                other: 'Möchten Sie diese Mitglieder wirklich entfernen?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} ist ein Genehmiger in diesem Workspace. Wenn du diesen Workspace nicht mehr mit ihm teilst, ersetzen wir ihn im Genehmigungsworkflow durch den Workspace-Inhaber ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Mitglied entfernen',
                other: 'Mitglieder entfernen',
            }),
            findMember: 'Mitglied suchen',
            removeWorkspaceMemberButtonTitle: 'Aus Arbeitsbereich entfernen',
            removeGroupMemberButtonTitle: 'Aus Gruppe entfernen',
            removeRoomMemberButtonTitle: 'Aus dem Chat entfernen',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Sind Sie sicher, dass Sie ${memberName} entfernen möchten?`,
            removeMemberTitle: 'Mitglied entfernen',
            transferOwner: 'Inhaber wechseln',
            makeMember: 'Zum Mitglied machen',
            makeAdmin: 'Zum Admin machen',
            makeAuditor: 'Zum Prüfer machen',
            selectAll: 'Alle auswählen',
            error: {
                genericAdd: 'Beim Hinzufügen dieses Workspace-Mitglieds ist ein Problem aufgetreten',
                cannotRemove: 'Du kannst weder dich selbst noch den Workspace-Inhaber entfernen',
                genericRemove: 'Beim Entfernen dieses Workspace-Mitglieds ist ein Problem aufgetreten',
            },
            addedWithPrimary: 'Einige Mitglieder wurden mit ihren primären Logins hinzugefügt.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Hinzugefügt durch sekundären Login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Gesamtanzahl der Workspace-Mitglieder: ${count}`,
            importMembers: 'Mitglieder importieren',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Wenn Sie ${approver} aus diesem Workspace entfernen, werden wir sie im Genehmigungsworkflow durch ${workspaceOwner}, den Workspace-Inhaber, ersetzen.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} hat noch offene Spesenberichte zur Genehmigung. Bitte bitten Sie sie, diese zu genehmigen oder übernehmen Sie die Kontrolle über ihre Berichte, bevor Sie sie aus dem Workspace entfernen.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Sie können ${memberName} nicht aus diesem Workspace entfernen. Bitte legen Sie unter Workflows > Zahlungen ausführen oder nachverfolgen einen neuen Erstattenden fest und versuchen Sie es dann erneut.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Wenn Sie ${memberName} aus diesem Workspace entfernen, ersetzen wir sie als bevorzugte/n Exporteur/in durch ${workspaceOwner}, den Workspace-Eigentümer.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Wenn Sie ${memberName} aus diesem Workspace entfernen, ersetzen wir sie/ihn als technischen Kontakt durch ${workspaceOwner}, den Inhaber des Workspaces.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} hat einen ausstehenden zu bearbeitenden Bericht, zu dem eine Aktion erforderlich ist. Bitte bitten Sie sie, die erforderliche Aktion abzuschließen, bevor Sie sie aus dem Workspace entfernen.`,
        },
        card: {
            getStartedIssuing: 'Beginnen Sie, indem Sie Ihre erste virtuelle oder physische Karte ausstellen.',
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
                chooseLimitType: 'Wählen Sie einen Grenztyp',
                smartLimit: 'Intelligentes Limit',
                smartLimitDescription: 'Bis zu einem bestimmten Betrag ausgeben, bevor eine Genehmigung erforderlich ist',
                monthly: 'Monatlich',
                monthlyDescription: 'Monatlich bis zu einem bestimmten Betrag ausgeben',
                fixedAmount: 'Fester Betrag',
                fixedAmountDescription: 'Einmal bis zu einem bestimmten Betrag ausgeben',
                setLimit: 'Ein Limit festlegen',
                cardLimitError: 'Bitte geben Sie einen Betrag kleiner als 21.474.836 $ ein',
                giveItName: 'Gib ihm einen Namen',
                giveItNameInstruction: 'Mache sie eindeutig genug, um sie von anderen Karten zu unterscheiden. Konkrete Anwendungsfälle sind sogar noch besser!',
                cardName: 'Kartenname',
                letsDoubleCheck: 'Lass uns noch einmal überprüfen, ob alles richtig aussieht.',
                willBeReady: 'Diese Karte ist sofort einsatzbereit.',
                cardholder: 'Karteninhaber',
                cardType: 'Kartentyp',
                limit: 'Limit',
                limitType: 'Limittyp',
                name: 'Name',
                disabledApprovalForSmartLimitError: 'Bitte aktivieren Sie Genehmigungen in <strong>Workflows > Genehmigungen hinzufügen</strong>, bevor Sie smarte Limits einrichten',
            },
            deactivateCardModal: {
                deactivate: 'Deaktivieren',
                deactivateCard: 'Karte deaktivieren',
                deactivateConfirmation: 'Das Deaktivieren dieser Karte lehnt alle künftigen Transaktionen ab und kann nicht rückgängig gemacht werden.',
            },
        },
        accounting: {
            settings: 'Einstellungen',
            title: 'Verknüpfungen',
            subtitle: 'Verknüpfen Sie Ihr Buchhaltungssystem, um Transaktionen mit Ihrem Kontenplan zu kodieren, Zahlungen automatisch abzugleichen und Ihre Finanzen synchron zu halten.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chatte mit deinem Einrichtungs­experten.',
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
            errorODIntegration: ({oldDotPolicyConnectionsURL}: ErrorODIntegrationParams) =>
                `In einer in Expensify Classic eingerichteten Verbindung ist ein Fehler aufgetreten. [Wechseln Sie zu Expensify Classic, um dieses Problem zu beheben.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Wechsel zu Expensify Classic, um deine Einstellungen zu verwalten.',
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
                        return 'Verbindung zu QuickBooks Online nicht möglich';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Verbindung zu Xero nicht möglich';
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
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Als Berichtsfelder importiert',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Standardwert für NetSuite-Mitarbeiter',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'diese Integration';
                return `Möchten Sie ${integrationName} wirklich trennen?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Sind Sie sicher, dass Sie ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'diese Buchhaltungsintegration'} verbinden möchten? Dadurch werden alle vorhandenen Buchhaltungsverbindungen entfernt.`,
            enterCredentials: 'Geben Sie Ihre Zugangsdaten ein',
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
                            return 'Klassen importieren';
                        case 'quickbooksOnlineImportLocations':
                            return 'Standorte werden importiert';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Importierte Daten werden verarbeitet';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Synchronisierung erstatteter Berichte und Rechnungszahlungen';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Import von Steuercodes';
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
                            return 'Importieren von QuickBooks Desktop-Daten';
                        case 'quickbooksDesktopImportTitle':
                            return 'Titel wird importiert';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Genehmigungszertifikat wird importiert';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importieren von Dimensionen';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Speichern von Richtlinien wird importiert';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Daten werden noch mit QuickBooks synchronisiert ... Bitte stelle sicher, dass der Web Connector ausgeführt wird';
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
                            return 'Warten auf das Laden importierter Daten';
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
                            return 'Synchronisiere Tracking-Kategorien';
                        case 'xeroSyncImportBankAccounts':
                            return 'Bankkonten werden synchronisiert';
                        case 'xeroSyncImportTaxRates':
                            return 'Steuersätze werden synchronisiert';
                        case 'xeroCheckConnection':
                            return 'Verbindung zu Xero wird geprüft';
                        case 'xeroSyncTitle':
                            return 'Xero-Daten werden synchronisiert';
                        case 'netSuiteSyncConnection':
                            return 'Verbindung zu NetSuite wird initialisiert';
                        case 'netSuiteSyncCustomers':
                            return 'Kunden werden importiert';
                        case 'netSuiteSyncInitData':
                            return 'Daten werden von NetSuite abgerufen';
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
                            return 'Markierung von NetSuite-Rechnungen und -Gutschriften als bezahlt';
                        case 'netSuiteImportVendorsTitle':
                            return 'Lieferanten importieren';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Benutzerdefinierte Listen importieren';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Benutzerdefinierte Listen importieren';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importieren von Tochtergesellschaften';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Lieferanten importieren';
                        case 'intacctCheckConnection':
                            return 'Sage Intacct-Verbindung wird überprüft';
                        case 'intacctImportDimensions':
                            return 'Importieren von Sage Intacct-Dimensionen';
                        case 'intacctImportTitle':
                            return 'Sage Intacct-Daten werden importiert';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Übersetzung fehlt für Stufe: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Bevorzugter Exporteur',
            exportPreferredExporterNote:
                'Der bevorzugte Exporteur kann jeder Workspace-Admin sein, muss jedoch auch Domain-Admin sein, wenn Sie in den Domaineinstellungen unterschiedliche Exportkonten für einzelne Firmenkarten festlegen.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur Berichte zum Export in seinem Konto.',
            exportAs: 'Exportieren als',
            exportOutOfPocket: 'Auslagenausgaben exportieren als',
            exportCompanyCard: 'Firmenkartenausgaben exportieren als',
            exportDate: 'Exportdatum',
            defaultVendor: 'Standardlieferant',
            autoSync: 'Automatische Synchronisierung',
            autoSyncDescription: 'NetSuite und Expensify automatisch jeden Tag synchronisieren. Finalisierte Berichte in Echtzeit exportieren',
            reimbursedReports: 'Erstattete Berichte synchronisieren',
            cardReconciliation: 'Kartenabstimmung',
            reconciliationAccount: 'Verrechnungskonto',
            continuousReconciliation: 'Fortlaufende Abstimmung',
            saveHoursOnReconciliation:
                'Sparen Sie jede Abrechnungsperiode Stunden bei der Abstimmung, indem Expensify fortlaufend Expensify Card-Kontoauszüge und -Abrechnungen automatisch für Sie abstimmt.',
            enableContinuousReconciliation: ({accountingAdvancedSettingsLink, connectionName}: EnableContinuousReconciliationParams) =>
                `<muted-text-label>Um die kontinuierliche Abstimmung zu aktivieren, aktiviere bitte die <a href="${accountingAdvancedSettingsLink}">Automatische Synchronisierung</a> für ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wählen Sie das Bankkonto aus, mit dem Ihre Expensify Card-Zahlungen abgeglichen werden.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Stellen Sie sicher, dass dieses Konto mit Ihrem <a href="${settlementAccountUrl}">Expensify Card Ausgleichskonto</a> (endet auf ${lastFourPAN}) übereinstimmt, damit die kontinuierliche Abstimmung ordnungsgemäß funktioniert.`,
            },
        },
        export: {
            notReadyHeading: 'Noch nicht bereit zum Exportieren',
            notReadyDescription:
                'Entwürfe oder ausstehende Spesenabrechnungen können nicht in das Buchhaltungssystem exportiert werden. Bitte genehmigen oder bezahlen Sie diese Ausgaben, bevor Sie sie exportieren.',
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
                business: 'Geschäftlich',
                chooseInvoiceMethod: 'Wählen Sie unten eine Zahlungsmethode aus:',
                payingAsIndividual: 'Als Privatperson bezahlen',
                payingAsBusiness: 'Bezahlen als Unternehmen',
            },
            invoiceBalance: 'Rechnungsbetrag',
            invoiceBalanceSubtitle:
                'Dies ist Ihr aktueller Kontostand aus eingegangenen Rechnungszahlungen. Er wird automatisch auf Ihr Bankkonto überwiesen, sofern Sie eines hinzugefügt haben.',
            bankAccountsSubtitle: 'Fügen Sie ein Bankkonto hinzu, um Rechnungen zu bezahlen und Zahlungen zu erhalten.',
        },
        invite: {
            member: 'Mitglied einladen',
            members: 'Mitglieder einladen',
            invitePeople: 'Neue Mitglieder einladen',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Workspace ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            pleaseEnterValidLogin: `Bitte stelle sicher, dass die E‑Mail-Adresse oder Telefonnummer gültig ist (z. B. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'Benutzer',
            users: 'Benutzer',
            invited: 'Eingeladen',
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
            oopsNotSoFast: 'Ups! Nicht so schnell …',
            workspaceNeeds: 'Ein Arbeitsbereich benötigt mindestens einen aktivierten Entfernungssatz.',
            distance: 'Entfernung',
            centrallyManage: 'Tarife zentral verwalten, in Meilen oder Kilometern nachverfolgen und eine Standardkategorie festlegen.',
            rate: 'Satz',
            addRate: 'Satz hinzufügen',
            findRate: 'Kurs finden',
            trackTax: 'Steuer nachverfolgen',
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
                '<muted-text>Steuern müssen im Workspace aktiviert sein, um diese Funktion zu nutzen. Gehen Sie zu <a href="#">Weitere Funktionen</a>, um diese Änderung vorzunehmen.</muted-text>',
            deleteDistanceRate: 'Entfernungssatz löschen',
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
            nameIsRequiredError: 'Sie müssen Ihrem Arbeitsbereich einen Namen geben',
            currencyInputLabel: 'Standardwährung',
            currencyInputHelpText: 'Alle Ausgaben in diesem Workspace werden in diese Währung umgerechnet.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `Die Standardwährung kann nicht geändert werden, da dieser Workspace mit einem ${currency}-Bankkonto verknüpft ist.`,
            save: 'Speichern',
            genericFailureMessage: 'Beim Aktualisieren des Arbeitsbereichs ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            addressContext: 'Für die Aktivierung von Expensify Travel ist eine Workspace-Adresse erforderlich. Bitte geben Sie eine mit Ihrem Unternehmen verknüpfte Adresse ein.',
            policy: 'Spesenrichtlinie',
        },
        bankAccount: {
            continueWithSetup: 'Einrichtung fortsetzen',
            youAreAlmostDone:
                'Sie sind fast fertig mit der Einrichtung Ihres Bankkontos, mit dem Sie Firmenkarten ausgeben, Ausgaben erstatten, Rechnungen einziehen und Rechnungen bezahlen können.',
            streamlinePayments: 'Zahlungen optimieren',
            connectBankAccountNote: 'Hinweis: Persönliche Bankkonten können nicht für Zahlungen in Arbeitsbereichen verwendet werden.',
            oneMoreThing: 'Noch eine Sache!',
            allSet: 'Alles erledigt!',
            accountDescriptionWithCards: 'Dieses Bankkonto wird verwendet, um Firmenkarten auszugeben, Ausgaben zu erstatten, Rechnungen einzuziehen und Rechnungen zu bezahlen.',
            letsFinishInChat: 'Lass uns im Chat fertig machen!',
            finishInChat: 'Im Chat abschließen',
            almostDone: 'Fast geschafft!',
            disconnectBankAccount: 'Bankkonto trennen',
            startOver: 'Neu starten',
            updateDetails: 'Details aktualisieren',
            yesDisconnectMyBankAccount: 'Ja, mein Bankkonto trennen',
            yesStartOver: 'Ja, neu beginnen',
            disconnectYourBankAccount: ({bankName}: DisconnectYourBankAccountParams) =>
                `Trennen Sie Ihr <strong>${bankName}</strong>-Bankkonto. Alle ausstehenden Transaktionen für dieses Konto werden weiterhin ausgeführt.`,
            clearProgress: 'Wenn du neu beginnst, wird dein bisheriger Fortschritt gelöscht.',
            areYouSure: 'Bist du sicher?',
            workspaceCurrency: 'Workspace-Währung',
            updateCurrencyPrompt:
                'Es sieht so aus, als wäre Ihre Arbeitsumgebung derzeit auf eine andere Währung als USD eingestellt. Bitte klicken Sie auf die Schaltfläche unten, um Ihre Währung jetzt auf USD zu aktualisieren.',
            updateToUSD: 'Auf USD aktualisieren',
            updateWorkspaceCurrency: 'Arbeitsbereichswährung aktualisieren',
            workspaceCurrencyNotSupported: 'Arbeitsbereichswährung wird nicht unterstützt',
            yourWorkspace: `Dein Workspace ist auf eine nicht unterstützte Währung eingestellt. Sieh dir die <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">Liste der unterstützten Währungen</a> an.`,
            chooseAnExisting: 'Wähle ein vorhandenes Bankkonto aus, um Ausgaben zu bezahlen, oder füge ein neues hinzu.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Inhaber wechseln',
            addPaymentCardTitle: 'Geben Sie Ihre Zahlungskarte ein, um die Eigentümerschaft zu übertragen',
            addPaymentCardButtonText: 'Bedingungen akzeptieren & Zahlungskarte hinzufügen',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Lies und akzeptiere die <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Nutzungsbedingungen</a> und die <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Datenschutzrichtlinie</a>, um deine Karte hinzuzufügen.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS-konform',
            addPaymentCardBankLevelEncrypt: 'Verschlüsselung auf Bankniveau',
            addPaymentCardRedundant: 'Redundante Infrastruktur',
            addPaymentCardLearnMore: `<muted-text>Erfahren Sie mehr über unsere <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">Sicherheit</a>.</muted-text>`,
            amountOwedTitle: 'Offener Saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Dieses Konto hat einen ausstehenden Saldo aus einem vorherigen Monat.\n\nMöchtest du den Saldo ausgleichen und die Abrechnung für diesen Workspace übernehmen?',
            ownerOwesAmountTitle: 'Offener Saldo',
            ownerOwesAmountButtonText: 'Kontostand übertragen',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `Das Konto, dem dieser Workspace gehört (${email}), hat einen ausstehenden Saldo aus einem vorherigen Monat.

Möchtest du diesen Betrag (${amount}) übernehmen, um die Abrechnung für diesen Workspace zu übernehmen? Deine Zahlungskarte wird sofort belastet.`,
            subscriptionTitle: 'Jahresabonnement übernehmen',
            subscriptionButtonText: 'Abonnement übertragen',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Die Übernahme dieses Workspaces führt dazu, dass dessen jährliches Abo mit Ihrem aktuellen Abo zusammengelegt wird. Dadurch erhöht sich die Größe Ihres Abos um ${usersCount} Mitglieder, sodass Ihr neues Abo eine Größe von ${finalCount} hat. Möchten Sie fortfahren?`,
            duplicateSubscriptionTitle: 'Warnung: Doppelte Abonnement-Erkennung',
            duplicateSubscriptionButtonText:
                '- Englisch\n- Spanisch\n- Deutsch\n- Französisch\n- Italienisch\n- Japanisch\n- Niederländisch\n- Polnisch\n- Portugiesisch (BR)\n- Chinesisch (vereinfacht)',
            duplicateSubscriptionText: ({
                email,
                workspaceName,
            }: ChangeOwnerDuplicateSubscriptionParams) => `Es sieht so aus, als ob Sie versuchen, die Abrechnung für die Workspaces von ${email} zu übernehmen. Dafür müssen Sie jedoch zuerst in allen ihren Workspaces Administrator sein.

Klicken Sie auf „Weiter“, wenn Sie die Abrechnung nur für den Workspace ${workspaceName} übernehmen möchten.

Wenn Sie die Abrechnung für ihr gesamtes Abonnement übernehmen möchten, lassen Sie sich bitte zuerst in allen ihren Workspaces als Administrator hinzufügen, bevor Sie die Abrechnung übernehmen.`,
            hasFailedSettlementsTitle: 'Besitz kann nicht übertragen werden',
            hasFailedSettlementsButtonText: 'Verstanden',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Sie können die Abrechnung nicht übernehmen, weil ${email} einen überfälligen Expensify Card-Ausgleich hat. Bitte bitten Sie sie, sich an concierge@expensify.com zu wenden, um das Problem zu lösen. Danach können Sie die Abrechnung für diesen Workspace übernehmen.`,
            failedToClearBalanceTitle: 'Kontostand konnte nicht gelöscht werden',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Wir konnten den Saldo nicht ausgleichen. Bitte versuche es später noch einmal.',
            successTitle: 'Juhu! Alles erledigt.',
            successDescription: 'Sie sind jetzt der Eigentümer dieses Arbeitsbereichs.',
            errorTitle: 'Ups! Nicht so schnell …',
            errorDescription: `<muted-text><centered-text>Beim Übertragen der Inhaberschaft für diesen Arbeitsbereich ist ein Problem aufgetreten. Versuche es erneut oder <concierge-link>wende dich für Hilfe an Concierge</concierge-link>.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Vorsicht!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `Die folgenden Berichte wurden bereits nach ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} exportiert:

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
                    `<muted-text>Berichtsfelder sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Profitieren Sie von automatischer Synchronisierung und reduzieren Sie manuelle Eingaben mit der Expensify + NetSuite-Integration. Erhalten Sie detaillierte Finanzanalysen in Echtzeit mit Unterstützung für native und benutzerdefinierte Segmente, einschließlich Projekt- und Kundenzuordnung.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere NetSuite-Integration ist nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Profitieren Sie von automatischer Synchronisierung und reduzieren Sie manuelle Eingaben mit der Integration von Expensify + Sage Intacct. Gewinnen Sie detaillierte, nahezu in Echtzeit verfügbare Einblicke in Ihre Finanzen mit benutzerdefinierten Dimensionen sowie der Spesenkodierung nach Abteilung, Klasse, Standort, Kunde und Projekt (Job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere Sage Intacct-Integration ist nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Genieße automatisierte Synchronisierung und reduziere manuelle Eingaben mit der Expensify + QuickBooks Desktop-Integration. Erziele maximale Effizienz mit einer Echtzeit-Zweibahnverbindung und der Ausgabencodierung nach Klasse, Artikel, Kunde und Projekt.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Unsere QuickBooks Desktop-Integration ist nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Erweiterte Genehmigungen',
                description: `Wenn Sie weitere Genehmigungsebenen hinzufügen möchten – oder einfach sicherstellen wollen, dass die größten Ausgaben noch einmal überprüft werden – sind Sie bei uns richtig. Erweiterte Genehmigungen helfen Ihnen, auf jeder Ebene die richtigen Kontrollmechanismen einzurichten, damit Sie die Ausgaben Ihres Teams im Griff behalten.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Erweiterte Genehmigungen sind nur im Control-Tarif verfügbar, der bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`} beginnt</muted-text>`,
            },
            categories: {
                title: 'Kategorien',
                description: 'Kategorien ermöglichen es Ihnen, Ausgaben zu verfolgen und zu organisieren. Verwenden Sie unsere Standardkategorien oder fügen Sie Ihre eigenen hinzu.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kategorien sind im Collect-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            glCodes: {
                title: 'Sachkonten-Codes',
                description: `Fügen Sie Ihren Kategorien und Tags Hauptbuch-Codes (GL-Codes) hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Gehaltssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>FiBu-Codes sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Hauptbuch- und Lohnbuchhaltungscodes',
                description: `Fügen Sie Ihren Kategorien Sachkonten- und Gehaltsabrechnungscodes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Gehaltssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Hauptbuch- und Gehaltsabrechnungscodes sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Steuerschlüssel',
                description: `Fügen Sie Ihren Steuern Steuercodes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Lohnabrechnungssysteme zu exportieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Steuercodes sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            companyCards: {
                title: 'Unbegrenzte Firmenkarten',
                description: `Sie müssen weitere Kartenfeeds hinzufügen? Schalten Sie unbegrenzte Firmenkarten frei, um Transaktionen von allen großen Kartenausstellern zu synchronisieren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dies ist nur im Control-Tarif verfügbar, beginnend ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            rules: {
                title: 'Regeln',
                description: `Regeln laufen im Hintergrund und halten Ihre Ausgaben unter Kontrolle, sodass Sie sich nicht um Kleinigkeiten kümmern müssen.

Fordern Sie Ausgabendetails wie Belege und Beschreibungen an, legen Sie Limits und Standardwerte fest und automatisieren Sie Genehmigungen und Zahlungen – alles an einem Ort.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Regeln sind nur im Control-Tarif verfügbar, beginnend ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            perDiem: {
                title: 'Tagegeld',
                description:
                    'Tagespauschalen sind eine großartige Möglichkeit, Ihre täglichen Kosten bei Dienstreisen Ihrer Mitarbeitenden regelkonform und vorhersehbar zu halten. Profitieren Sie von Funktionen wie individuellen Sätzen, Standardkategorien und detaillierteren Angaben wie Reisezielen und Untersätzen.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Tagesspesen sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            travel: {
                title: 'Reisen',
                description:
                    'Expensify Travel ist eine neue Plattform für die Buchung und Verwaltung von Geschäftsreisen, über die Mitglieder Unterkünfte, Flüge, Transportmittel und mehr buchen können.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Reisen ist im Collect-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            reports: {
                title: 'Berichte',
                description: 'Berichte ermöglichen es Ihnen, Ausgaben für eine einfachere Nachverfolgung und Organisation zu gruppieren.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Berichte sind im Collect-Tarif verfügbar, beginnend ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Mehrstufige Tags',
                description:
                    'Mehrstufige Tags helfen Ihnen, Ausgaben noch präziser zu verfolgen. Weisen Sie jeder Position mehrere Tags zu – etwa Abteilung, Kunde oder Kostenstelle –, um den vollständigen Kontext jeder Ausgabe zu erfassen. So ermöglichen Sie detailliertere Berichte, Genehmigungs‑Workflows und Buchhaltungs‑Exporte.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Mehrstufige Tags sind nur im Control-Tarif verfügbar, ab <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Entfernungsraten',
                description: 'Erstelle und verwalte deine eigenen Sätze, verfolge Entfernungen in Meilen oder Kilometern und lege Standardkategorien für Distanzspesen fest.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Entfernungsraten sind im Collect-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            auditor: {
                title: 'Auditor',
                description: 'Prüfer erhalten schreibgeschützten Zugriff auf alle Berichte, um vollständige Transparenz und Compliance-Überwachung zu gewährleisten.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Prüfer sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Mehrere Genehmigungsstufen',
                description:
                    'Mehrere Genehmigungsstufen sind ein Workflow-Tool für Unternehmen, die mehr als eine Person benötigen, um einen Bericht zu genehmigen, bevor er erstattet werden kann.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Mehrere Genehmigungsebenen sind nur im Control-Tarif verfügbar, beginnend bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'pro aktivem Mitglied und Monat.',
                perMember: 'pro Mitglied pro Monat.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Upgrade durchführen, um auf diese Funktion zuzugreifen, oder <a href="${subscriptionLink}">erfahre mehr</a> über unsere Pläne und Preise.</muted-text>`,
            upgradeToUnlock: 'Diese Funktion freischalten',
            completed: {
                headline: `Du hast deinen Workspace aktualisiert!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Du hast ${policyName} erfolgreich auf den Control-Tarif hochgestuft! <a href="${subscriptionLink}">Abonnement anzeigen</a> für weitere Details.</centered-text>`,
                categorizeMessage: `Sie haben erfolgreich auf den Collect-Tarif upgegradet. Jetzt können Sie Ihre Ausgaben kategorisieren!`,
                travelMessage: `Sie haben erfolgreich auf den Collect‑Tarif upgegradet. Jetzt können Sie mit der Buchung und Verwaltung von Reisen beginnen!`,
                distanceRateMessage: `Du hast erfolgreich auf den Collect-Tarif upgegradet. Jetzt kannst du den Kilometersatz ändern!`,
                gotIt: 'Verstanden, danke',
                createdWorkspace: `Du hast einen Workspace erstellt!`,
            },
            commonFeatures: {
                title: 'Zum Control-Tarif upgraden',
                note: 'Schalte unsere leistungsstärksten Funktionen frei, darunter:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Der Control-Tarif beginnt bei <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `pro Mitglied pro Monat.` : `pro aktivem Mitglied und Monat.`}. <a href="${learnMoreMethodsRoute}">Erfahre mehr</a> über unsere Tarife und Preise.</muted-text>`,
                    benefit1: 'Erweiterte Buchhaltungsverbindungen (NetSuite, Sage Intacct und mehr)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Genehmigungsworkflows mit mehreren Ebenen',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    toUpgrade: 'Zum Aktualisieren klicken',
                    selectWorkspace: 'Wähle einen Workspace aus und ändere den Plantyp in',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Zum Collect-Tarif wechseln',
                note: 'Wenn Sie ein Downgrade durchführen, verlieren Sie den Zugriff auf diese und weitere Funktionen:',
                benefits: {
                    note: 'Eine vollständige Gegenüberstellung unserer Tarife finden Sie in unserem',
                    pricingPage: 'Preisseite',
                    confirm: 'Sind Sie sicher, dass Sie herabstufen und Ihre Konfigurationen entfernen möchten?',
                    warning: 'Dies kann nicht rückgängig gemacht werden.',
                    benefit1: 'Buchhaltungsschnittstellen (außer QuickBooks Online und Xero)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Genehmigungsworkflows mit mehreren Ebenen',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    headsUp: 'Achtung!',
                    multiWorkspaceNote:
                        'Sie müssen alle Ihre Workspaces herabstufen, bevor Ihre erste monatliche Zahlung erfolgt, um ein Abonnement zum Collect-Tarif zu beginnen. Klicken Sie',
                    selectStep: '> Wählen Sie jeden Arbeitsbereich aus > ändern Sie den Plantyp in',
                },
            },
            completed: {
                headline: 'Ihr Arbeitsbereich wurde herabgestuft',
                description: 'Sie haben weitere Workspaces im Control-Tarif. Damit diese zum Collect-Tarif abgerechnet werden, müssen Sie alle Workspaces herabstufen.',
                gotIt: 'Verstanden, danke',
            },
        },
        payAndDowngrade: {
            title: 'Bezahlen & Downgrade',
            headline: 'Ihre letzte Zahlung',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Ihre endgültige Rechnung für dieses Abonnement beträgt <strong>${formattedAmount}</strong>`,
            description2: ({date}: DateParams) => `Sieh dir unten deine Aufschlüsselung für ${date} an:`,
            subscription:
                'Achtung! Diese Aktion beendet dein Expensify-Abonnement, löscht diesen Workspace und entfernt alle Workspace-Mitglieder. Wenn du diesen Workspace behalten und nur dich selbst entfernen möchtest, lass zuerst einen anderen Admin die Abrechnung übernehmen.',
            genericFailureMessage: 'Beim Bezahlen Ihrer Rechnung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        restrictedAction: {
            restricted: 'Eingeschränkt',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Aktionen im Workspace ${workspaceName} sind derzeit eingeschränkt`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Der Workspace-Eigentümer ${workspaceOwnerName} muss die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Workspace-Aktivitäten freizuschalten.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Sie müssen die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Aktivitäten im Workspace freizuschalten.',
            addPaymentCardToUnlock: 'Füge eine Zahlungskarte hinzu, um dies freizuschalten!',
            addPaymentCardToContinueUsingWorkspace: 'Fügen Sie eine Zahlungskarte hinzu, um diesen Workspace weiter zu verwenden',
            pleaseReachOutToYourWorkspaceAdmin: 'Bitte wenden Sie sich bei Fragen an Ihren Workspace-Administrator.',
            chatWithYourAdmin: 'Mit deiner Adminperson chatten',
            chatInAdmins: 'Chat in #admins',
            addPaymentCard: 'Zahlungskarte hinzufügen',
            goToSubscription: 'Zu Abonnement',
        },
        rules: {
            individualExpenseRules: {
                title: 'Ausgaben',
                subtitle: ({categoriesPageLink, tagsPageLink}: IndividualExpenseRulesSubtitleParams) =>
                    `<muted-text>Legen Sie Ausgabenkontrollen und Standardwerte für einzelne Ausgaben fest. Sie können auch Regeln für <a href="${categoriesPageLink}">Kategorien</a> und <a href="${tagsPageLink}">Tags</a> erstellen.</muted-text>`,
                receiptRequiredAmount: 'Erforderlicher Belegbetrag',
                receiptRequiredAmountDescription: 'Belege verlangen, wenn die Ausgaben diesen Betrag überschreiten, außer wenn dies durch eine Kategorienregel außer Kraft gesetzt wird.',
                maxExpenseAmount: 'Maximaler Ausgabenbetrag',
                maxExpenseAmountDescription: 'Ausgaben markieren, die diesen Betrag überschreiten, sofern dies nicht durch eine Kategorienregel außer Kraft gesetzt wird.',
                maxAge: 'Max. Alter',
                maxExpenseAge: 'Maximales Ausgabenalter',
                maxExpenseAgeDescription: 'Ausgaben kennzeichnen, die älter als eine bestimmte Anzahl von Tagen sind.',
                maxExpenseAgeDays: () => ({
                    one: '1 Tag',
                    other: (count: number) => `${count} Tage`,
                }),
                cashExpenseDefault: 'Standardwert für Barausgaben',
                cashExpenseDefaultDescription:
                    'Wählen Sie aus, wie Barauslagen erstellt werden sollen. Eine Ausgabe gilt als Barauslage, wenn sie keine importierte Firmenkartentransaktion ist. Dazu gehören manuell erstellte Ausgaben, Belege, Tagegelder, Entfernungs- und Zeitausgaben.',
                reimbursableDefault: 'Erstattungsfähig',
                reimbursableDefaultDescription: 'Spesen werden meistens an Mitarbeitende zurückgezahlt',
                nonReimbursableDefault: 'Nicht erstattungsfähig',
                nonReimbursableDefaultDescription: 'Auslagen werden gelegentlich an Mitarbeitende zurückerstattet',
                alwaysReimbursable: 'Immer erstattungsfähig',
                alwaysReimbursableDescription: 'Spesen werden immer an Mitarbeitende zurückerstattet',
                alwaysNonReimbursable: 'Immer nicht erstattungsfähig',
                alwaysNonReimbursableDescription: 'Spesen werden Mitarbeitern niemals erstattet',
                billableDefault: 'Standard für abrechenbar',
                billableDefaultDescription: ({tagsPageLink}: BillableDefaultDescriptionParams) =>
                    `<muted-text>Wählen Sie, ob Bar- und Kreditkartenausgaben standardmäßig abrechenbar sein sollen. Abrechenbare Ausgaben werden in <a href="${tagsPageLink}">Tags</a> aktiviert oder deaktiviert.</muted-text>`,
                billable: 'Abrechenbar',
                billableDescription: 'Ausgaben werden meist an Kunden weiterberechnet',
                nonBillable: 'Nicht abrechenbar',
                nonBillableDescription: 'Spesen werden gelegentlich den Kunden erneut in Rechnung gestellt',
                eReceipts: 'eBelege',
                eReceiptsHint: `eQuittungen werden automatisch erstellt [für die meisten Kreditkartentransaktionen in USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Teilnehmerverfolgung',
                attendeeTrackingHint: 'Verfolge die Pro-Kopf-Kosten für jede Ausgabe.',
                prohibitedDefaultDescription:
                    'Markiere alle Belege, auf denen Alkohol, Glücksspiel oder andere eingeschränkte Artikel erscheinen. Ausgaben mit Belegen, auf denen diese Positionen vorkommen, erfordern eine manuelle Prüfung.',
                prohibitedExpenses: 'Unzulässige Ausgaben',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Hotelnebenkosten',
                gambling: 'Glücksspiel',
                tobacco: 'Tabak',
                adultEntertainment: 'Unterhaltung für Erwachsene',
            },
            expenseReportRules: {
                title: 'Spesenabrechnungen',
                subtitle: 'Automatisieren Sie die Compliance, Genehmigungen und Zahlungen von Spesenabrechnungen.',
                preventSelfApprovalsTitle: 'Selbstgenehmigungen verhindern',
                preventSelfApprovalsSubtitle: 'Verhindern, dass Arbeitsbereichsmitglieder ihre eigenen Spesenberichte genehmigen.',
                autoApproveCompliantReportsTitle: 'Konforme Berichte automatisch genehmigen',
                autoApproveCompliantReportsSubtitle: 'Legen Sie fest, welche Spesenabrechnungen für die automatische Genehmigung infrage kommen.',
                autoApproveReportsUnderTitle: 'Berichte automatisch genehmigen unter',
                autoApproveReportsUnderDescription: 'Vollständig konforme Spesenabrechnungen unter diesem Betrag werden automatisch genehmigt.',
                randomReportAuditTitle: 'Zufällige Prüfungsberichte',
                randomReportAuditDescription: 'Erfordern, dass einige Berichte manuell genehmigt werden, selbst wenn sie für die automatische Genehmigung in Frage kommen.',
                autoPayApprovedReportsTitle: 'Berichte mit genehmigter automatischer Zahlung',
                autoPayApprovedReportsSubtitle: 'Konfigurieren Sie, welche Spesenabrechnungen für die automatische Zahlung infrage kommen.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Bitte gib einen Betrag ein, der kleiner ist als ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle: 'Gehe zu „Weitere Funktionen“ und aktiviere Workflows. Füge dann Zahlungen hinzu, um diese Funktion freizuschalten.',
                autoPayReportsUnderTitle: 'Berichte automatisch bezahlen unter',
                autoPayReportsUnderDescription: 'Vollständig konforme Spesenabrechnungen unter diesem Betrag werden automatisch bezahlt.',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `Gehe zu [Weitere Funktionen](${moreFeaturesLink}) und aktiviere Workflows. Füge dann ${featureName} hinzu, um diese Funktion freizuschalten.`,
                enableFeatureSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `Gehe zu [weitere Funktionen](${moreFeaturesLink}) und aktiviere ${featureName}, um diese Funktion freizuschalten.`,
            },
            categoryRules: {
                title: 'Kategorienregeln',
                approver: 'Genehmiger',
                requireDescription: 'Beschreibung erforderlich',
                descriptionHint: 'Beschreibungshinweis',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Erinnere Mitarbeitende daran, zusätzliche Informationen für Ausgaben in der Kategorie „${categoryName}“ anzugeben. Dieser Hinweis erscheint im Beschreibungsfeld bei Ausgaben.`,
                descriptionHintLabel: 'Hinweis',
                descriptionHintSubtitle: 'Profi-Tipp: Je kürzer, desto besser!',
                maxAmount: 'Maximalbetrag',
                flagAmountsOver: 'Beträge markieren über',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `Gilt für die Kategorie „${categoryName}“.`,
                flagAmountsOverSubtitle: 'Dies überschreibt den Maximalbetrag für alle Ausgaben.',
                expenseLimitTypes: {
                    expense: 'Einzelne Ausgabe',
                    expenseSubtitle: 'Spesenausgaben nach Kategorie markieren. Diese Regel überschreibt die allgemeine Bereichsregel für den maximalen Spesenbetrag.',
                    daily: 'Kategoriesumme',
                    dailySubtitle: 'Gesamt kategorisierte Ausgaben pro Spesenbericht kennzeichnen.',
                },
                requireReceiptsOver: 'Belege erforderlich über',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standard`,
                    never: 'Belege niemals anfordern',
                    always: 'Belege immer erforderlich',
                },
                defaultTaxRate: 'Standardsteuersatz',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Gehe zu [Weitere Funktionen](${moreFeaturesLink}) und aktiviere Workflows, dann füge Genehmigungen hinzu, um diese Funktion freizuschalten.`,
            },
            customRules: {
                title: 'Spesenrichtlinie',
                cardSubtitle: 'Hier befindet sich die Spesenrichtlinie deines Teams, damit alle denselben Stand haben, was abgedeckt ist.',
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
                    description: 'Für Unternehmen mit erweiterten Anforderungen.',
                },
            },
            description: 'Wähle den Tarif, der am besten zu dir passt. Eine detaillierte Liste der Funktionen und Preise findest du in unserer',
            subscriptionLink: 'Hilfeseite zu Plantypen und Preisen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Sie haben sich bis zum Ende Ihres Jahresabonnements am ${annualSubscriptionEndDate} zu 1 aktivem Mitglied im Control-Tarif verpflichtet. Sie können ab dem ${annualSubscriptionEndDate} zu einem nutzungsabhängigen Abonnement wechseln und auf den Collect-Tarif herabstufen, indem Sie die automatische Verlängerung in`,
                other: `Sie haben sich bis zum Ende Ihres Jahresabonnements am ${annualSubscriptionEndDate} zu ${count} aktiven Mitgliedern im Control-Tarif verpflichtet. Sie können ab dem ${annualSubscriptionEndDate} zu einem nutzungsbasierten Abonnement wechseln und auf den Collect-Tarif herabstufen, indem Sie die automatische Verlängerung in`,
            }),
            subscriptions: 'Abonnements',
        },
    },
    getAssistancePage: {
        title: 'Hilfe erhalten',
        subtitle: 'Wir sind hier, um dir den Weg zur Größe zu ebnen!',
        description: 'Wählen Sie aus den folgenden Supportoptionen:',
        chatWithConcierge: 'Mit Concierge chatten',
        scheduleSetupCall: 'Einrichtungstermin vereinbaren',
        scheduleACall: 'Anruf planen',
        questionMarkButtonTooltip: 'Holen Sie sich Unterstützung von unserem Team',
        exploreHelpDocs: 'Hilfedokumente durchsuchen',
        registerForWebinar: 'Für Webinar registrieren',
        onboardingHelp: 'Hilfe beim Onboarding',
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
        restrictedDescription: 'Personen in Ihrem Arbeitsbereich können diesen Raum finden',
        privateDescription: 'Personen, die zu diesem Raum eingeladen wurden, können ihn finden',
        publicDescription: 'Jeder kann diesen Raum finden',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Jeder kann diesen Raum finden',
        createRoom: 'Raum erstellen',
        roomAlreadyExistsError: 'Ein Raum mit diesem Namen existiert bereits',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} ist ein Standardraum in allen Arbeitsbereichen. Bitte wähle einen anderen Namen.`,
        roomNameInvalidError: 'Raumnamen dürfen nur Kleinbuchstaben, Zahlen und Bindestriche enthalten',
        pleaseEnterRoomName: 'Bitte geben Sie einen Raumnamen ein',
        pleaseSelectWorkspace: 'Bitte wählen Sie einen Arbeitsbereich aus',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}umbenannt in „${newName}“ (zuvor „${oldName}“)` : `${actor}hat diesen Raum in „${newName}“ umbenannt (zuvor „${oldName}“)`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Raum in ${newName} umbenannt`,
        social: 'Sozial',
        selectAWorkspace: 'Arbeitsbereich auswählen',
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
        submitAndClose: 'Senden und schließen',
        submitAndApprove: 'Einreichen und Genehmigen',
        advanced: 'Erweitert',
        dynamicExternal: 'Dynamisch extern',
        smartReport: 'SMARTBERICHT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `${approverName} (${approverEmail}) als Genehmiger:in für das Feld ${field} „${name}“ hinzugefügt`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `hat ${approverName} (${approverEmail}) als Genehmiger:in für das/die ${field} „${name}“ entfernt`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `Genehmigende Person für ${field} „${name}“ zu ${formatApprover(newApproverName, newApproverEmail)} geändert (zuvor ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `hat die Kategorie „${categoryName}“ hinzugefügt`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `hat die Kategorie „${categoryName}“ entfernt`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'Deaktiviert' : 'aktiviert'} die Kategorie „${categoryName}“`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `den Lohnabrechnungscode „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            if (!newValue && oldValue) {
                return `hat den Gehaltsabrechnungscode „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `hat die Lohnabrechnungscode der Kategorie „${categoryName}“ in „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `den Sachkonto-Code „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            if (!newValue && oldValue) {
                return `hat den HK-Code „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `den Sachkontocode der Kategorie „${categoryName}“ in „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `Beschreibung der Kategorie „${categoryName}“ zu ${!oldValue ? 'Erforderlich' : 'nicht erforderlich'} geändert (zuvor ${!oldValue ? 'nicht erforderlich' : 'Erforderlich'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `hat einen maximalen Betrag von ${newAmount} zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            if (oldAmount && !newAmount) {
                return `hat den maximalen Betrag von ${oldAmount} aus der Kategorie „${categoryName}“ entfernt`;
            }
            return `hat den Maximalbetrag der Kategorie „${categoryName}“ auf ${newAmount} geändert (zuvor ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `hat eine Limitart von ${newValue} zur Kategorie „${categoryName}“ hinzugefügt`;
            }
            return `den Limittyp der Kategorie „${categoryName}“ zu ${newValue} geändert (zuvor ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `hat die Kategorie „${categoryName}“ aktualisiert, indem Belege in ${newValue} geändert wurden`;
            }
            return `Kategorie „${categoryName}“ geändert zu ${newValue} (zuvor ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `hat die Kategorie „${oldName}“ in „${newName}“ umbenannt`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `hat den Beschreibungshinweis „${oldValue}“ aus der Kategorie „${categoryName}“ entfernt`;
            }
            return !oldValue
                ? `die Beschreibungshinweis „${newValue}“ zur Kategorie „${categoryName}“ hinzugefügt`
                : `die Beschreibungshinweis der Kategorie „${categoryName}“ wurde in „${newValue}“ geändert (zuvor „${oldValue}“)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `hat den Taglisten-Namen in „${newName}“ geändert (zuvor „${oldName}“)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `das Tag „${tagName}” zur Liste „${tagListName}” hinzugefügt`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) =>
            `hat die Tagliste „${tagListName}“ aktualisiert, indem der Tag „${oldName}“ in „${newName}“ geändert wurde`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'aktiviert' : 'Deaktiviert'} das Tag „${tagName}“ in der Liste „${tagListName}“`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `hat das Tag „${tagName}“ aus der Liste „${tagListName}“ entfernt`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `„${count}“ Tags aus der Liste „${tagListName}“ entfernt`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `hat das Tag „${tagName}“ in der Liste „${tagListName}“ aktualisiert, indem das Feld ${updatedField} auf „${newValue}“ geändert wurde (zuvor „${oldValue}“)`;
            }
            return `hat das Tag „${tagName}“ in der Liste „${tagListName}“ aktualisiert, indem ein(e) ${updatedField} mit dem Wert „${newValue}“ hinzugefügt wurde`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `hat ${customUnitName} ${updatedField} in „${newValue}“ geändert (zuvor „${oldValue}“)`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'aktiviert' : 'Deaktiviert'} Steuerverfolgung bei Entfernungssätzen`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `hat einen neuen „${customUnitName}“-Satz „${rateName}“ hinzugefügt`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `hat den Satz des/der ${customUnitName} ${updatedField} „${customUnitRateName}“ auf „${newValue}“ geändert (zuvor „${oldValue}“)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `hat den Steuersatz für den Streckensatz „${customUnitRateName}“ auf „${newValue} (${newTaxPercentage})“ geändert (zuvor „${oldValue} (${oldTaxPercentage})“)`;
            }
            return `hat den Steuersatz „${newValue} (${newTaxPercentage})“ zum Entfernungssatz „${customUnitRateName}“ hinzugefügt`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `hat den rückforderbaren Steueranteil im Distanzsatz „${customUnitRateName}“ auf „${newValue}“ geändert (zuvor „${oldValue}“)`;
            }
            return `hat einen rückforderbaren Steueranteil von „${newValue}“ zum Distanzsatz „${customUnitRateName}“ hinzugefügt`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `hat den „${customUnitName}“-Satz „${rateName}“ entfernt`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `${fieldType}-Berichtsfeld „${fieldName}“ hinzugefügt`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `Standardwert des Berichtsfelds „${fieldName}“ auf „${defaultValue}“ festlegen`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `die Option „${optionName}“ zum Berichtsfeld „${fieldName}“ hinzugefügt`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `Option „${optionName}“ aus dem Berichtsfeld „${fieldName}“ entfernt`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'aktiviert' : 'Deaktiviert'} die Option „${optionName}“ für das Berichtsfeld „${fieldName}“`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'aktiviert' : 'Deaktiviert'} alle Optionen für das Berichtsfeld „${fieldName}“`;
            }
            return `${allEnabled ? 'aktiviert' : 'Deaktiviert'} die Option "${optionName}" für das Berichtsfeld "${fieldName}", wodurch alle Optionen ${allEnabled ? 'aktiviert' : 'Deaktiviert'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `${fieldType}-Berichtsfeld "${fieldName}" entfernt`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `„Selbstfreigabe verhindern“ wurde auf „${newValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}“ aktualisiert (zuvor „${oldValue === 'true' ? 'Aktiviert' : 'Deaktiviert'}“)`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `den maximalen Betrag für belegepflichtige Ausgaben auf ${newValue} geändert (zuvor ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `hat den maximalen Spesenbetrag für Verstöße auf ${newValue} geändert (zuvor ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `„Maximales Ausgabenalter (Tage)“ wurde auf „${newValue}“ aktualisiert (zuvor „${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}“)`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `setzen Sie das monatliche Berichtseinreichungsdatum auf „${newValue}“`;
            }
            return `das Einreichungsdatum des Monatsberichts auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `„Auslagen an Kunden weiterberechnen“ wurde zu „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `„Standard für Barausgaben“ aktualisiert auf „${newValue}“ (vorher „${oldValue}“)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `„Standardmäßige Berichtstitel erzwingen“ aktiviert ${value ? 'Ein' : 'Aus'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `hat den Namen dieses Arbeitsbereichs in „${newName}“ geändert (zuvor „${oldName}“)`,
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
                one: `hat dich aus dem Genehmigungsworkflow und dem Spesen-Chat von ${joinedNames} entfernt. Bereits eingereichte Berichte bleiben in deinem Posteingang zur Genehmigung verfügbar.`,
                other: `hat dich aus den Genehmigungs-Workflows und Spesen-Chats von ${joinedNames} entfernt. Zuvor eingereichte Berichte bleiben in deinem Posteingang zur Genehmigung verfügbar.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `hat deine Rolle in ${policyName} von ${oldRole} zu Benutzer aktualisiert. Du wurdest aus allen Spesen-Chats von Einreichenden entfernt, außer aus deinen eigenen.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `Standardwährung auf ${newCurrency} aktualisiert (zuvor ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `hat die automatische Berichtshäufigkeit auf „${newFrequency}“ aktualisiert (zuvor „${oldFrequency}“)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `den Genehmigungsmodus auf „${newValue}“ aktualisiert (zuvor „${oldValue}“)`,
        upgradedWorkspace: 'hat diesen Workspace auf den Control-Tarif hochgestuft',
        forcedCorporateUpgrade: `Dieser Workspace wurde auf den Control-Tarif hochgestuft. Klicken Sie <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">hier</a> für weitere Informationen.`,
        downgradedWorkspace: 'hat diesen Workspace auf den Collect-Tarif herabgestuft',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `Änderte den Anteil der Berichte, die zufällig zur manuellen Genehmigung weitergeleitet werden, auf ${Math.round(newAuditRate * 100)}% (zuvor ${Math.round(oldAuditRate * 100)}%).`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `hat das manuelle Genehmigungslimit für alle Ausgaben auf ${newLimit} geändert (zuvor ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'aktiviert' : 'Deaktiviert'} Kategorien`;
                case 'tags':
                    return `${enabled ? 'aktiviert' : 'Deaktiviert'} Tags`;
                case 'workflows':
                    return `${enabled ? 'aktiviert' : 'Deaktiviert'} Workflows`;
                case 'distance rates':
                    return `${enabled ? 'aktiviert' : 'Deaktiviert'} Entfernungsraten`;
                case 'accounting':
                    return `${enabled ? 'aktiviert' : 'Deaktiviert'} Buchhaltung`;
                case 'Expensify Cards':
                    return `${enabled ? 'aktiviert' : 'Deaktiviert'} Expensify-Karten`;
                case 'company cards':
                    return `${enabled ? 'aktiviert' : 'Deaktiviert'} Firmenkarten`;
                case 'invoicing':
                    return `${enabled ? 'aktiviert' : 'Deaktiviert'} Rechnungsstellung`;
                case 'per diem':
                    return `${enabled ? 'aktiviert' : 'Deaktiviert'} Tagegeld`;
                case 'receipt partners':
                    return `${enabled ? 'aktiviert' : 'Deaktiviert'} Belegpartner`;
                case 'rules':
                    return `${enabled ? 'aktiviert' : 'Deaktiviert'} Regeln`;
                case 'tax tracking':
                    return `${enabled ? 'aktiviert' : 'Deaktiviert'} Steuerverfolgung`;
                default:
                    return `${enabled ? 'aktiviert' : 'Deaktiviert'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? 'aktiviert' : 'Deaktiviert'} Teilnehmerverfolgung`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'aktiviert' : 'Deaktiviert'} Erstattungen für diesen Workspace`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `Steuer „${taxName}“ hinzugefügt`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `die Steuer „${taxName}“ entfernt`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `die Steuer „${oldValue}“ in „${newValue}“ umbenannt`;
                }
                case 'code': {
                    return `hat den Steuercode für „${taxName}“ von „${oldValue}“ zu „${newValue}“ geändert`;
                }
                case 'rate': {
                    return `Steuersatz für „${taxName}“ von „${oldValue}“ auf „${newValue}“ geändert`;
                }
                case 'enabled': {
                    return `${oldValue ? 'Deaktiviert' : 'aktiviert'} die Steuer „${taxName}“`;
                }
                default: {
                    return '';
                }
            }
        },
    },
    roomMembersPage: {
        memberNotFound: 'Mitglied nicht gefunden.',
        useInviteButton: 'Um ein neues Mitglied zum Chat einzuladen, verwende bitte die Einladungsschaltfläche oben.',
        notAuthorized: `Du hast keinen Zugriff auf diese Seite. Wenn du versuchst, diesem Raum beizutreten, bitte einfach ein Mitglied des Raums, dich hinzuzufügen. Etwas anderes? Wende dich an ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Es sieht so aus, als ob dieser Raum archiviert wurde. Bei Fragen wende dich an ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Sind Sie sicher, dass Sie ${memberName} aus dem Raum entfernen möchten?`,
            other: 'Sind Sie sicher, dass Sie die ausgewählten Mitglieder aus dem Raum entfernen möchten?',
        }),
        error: {
            genericAdd: 'Beim Hinzufügen dieses Raumteilnehmers ist ein Problem aufgetreten',
        },
    },
    newTaskPage: {
        assignTask: 'Aufgabe zuweisen',
        assignMe: 'Mir zuweisen',
        confirmTask: 'Aufgabe bestätigen',
        confirmError: 'Bitte gib einen Titel ein und wähle ein Freigabeziel aus',
        descriptionOptional: 'Beschreibung (optional)',
        pleaseEnterTaskName: 'Bitte geben Sie einen Titel ein',
        pleaseEnterTaskDestination: 'Bitte wähle aus, wo du diese Aufgabe teilen möchtest',
    },
    task: {
        task: 'Aufgabe',
        title: 'Titel',
        description: 'Beschreibung',
        assignee: 'Beauftragte Person',
        completed: 'Abgeschlossen',
        action: 'Abschließen',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `Aufgabe für ${title}`,
            completed: 'Als erledigt markiert',
            canceled: 'Gelöschte Aufgabe',
            reopened: 'als unvollständig markiert',
            error: 'Du hast keine Berechtigung, die angeforderte Aktion auszuführen',
        },
        markAsComplete: 'Als abgeschlossen markieren',
        markAsIncomplete: 'Als unvollständig markieren',
        assigneeError: 'Beim Zuweisen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie es mit einer anderen verantwortlichen Person.',
        genericCreateTaskFailureMessage: 'Beim Erstellen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie es später noch einmal.',
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
            escape: 'Dialoge schließen',
            search: 'Suchdialog öffnen',
            newChat: 'Neuer Chat-Bildschirm',
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
                subtitle: 'Erstellen Sie eine Ausgabe oder machen Sie eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwende den grünen Button unten, um eine Ausgabe zu erstellen.',
            },
            emptyReportResults: {
                title: 'Sie haben noch keine Berichte erstellt',
                subtitle: 'Erstellen Sie einen Bericht oder machen Sie eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwende die grüne Schaltfläche unten, um einen Bericht zu erstellen.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Du hast noch keine Rechnungen erstellt
                `),
                subtitle: 'Sende eine Rechnung oder mache eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwende den grünen Button unten, um eine Rechnung zu senden.',
            },
            emptyTripResults: {
                title: 'Keine Reisen anzuzeigen',
                subtitle: 'Beginnen Sie, indem Sie unten Ihre erste Reise buchen.',
                buttonText: 'Reise buchen',
            },
            emptySubmitResults: {
                title: 'Keine Ausgaben zum Einreichen',
                subtitle: 'Alles in Ordnung. Dreh eine Ehrenrunde!',
                buttonText: 'Bericht erstellen',
            },
            emptyApproveResults: {
                title: 'Keine Spesen zur Genehmigung',
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
                subtitle: 'Keine Ergebnisse. Bitte passen Sie Ihre Filter an.',
            },
            emptyUnapprovedResults: {
                title: 'Keine Spesen zur Genehmigung',
                subtitle: 'Null Ausgaben. Maximale Entspannung. Gut gemacht!',
            },
        },
        statements: 'Kontoauszüge',
        unapprovedCash: 'Nicht genehmigtes Bargeld',
        unapprovedCard: 'Nicht genehmigte Karte',
        reconciliation: 'Abstimmung',
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
            hold: 'Angehalten',
            unhold: 'Sperre aufheben',
            reject: 'Ablehnen',
            noOptionsAvailable: 'Für die ausgewählte Gruppe von Ausgaben sind keine Optionen verfügbar.',
        },
        filtersHeader: 'Filter',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Vor ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `Nach ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `Am ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Nie',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Letzter Monat',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Diesen Monat',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Letzter Kontoauszug',
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
                individualCards: 'Einzelne Karten',
                closedCards: 'Geschlossene Karten',
                cardFeeds: 'Kartenfeeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Alle ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Alle importierten CSV-Karten${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} ist ${value}`,
            current: 'Aktuell',
            past: 'Vergangen',
            submitted: 'Eingereicht',
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
        },
        noCategory: 'Keine Kategorie',
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
            description: 'Boah, das sind aber viele Elemente! Wir bündeln sie, und Concierge wird dir in Kürze eine Datei zusenden.',
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
            helpTextWeb: 'Web.',
            helpTextConcierge: 'Wenn das Problem weiterhin besteht, wenden Sie sich an',
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
            title: 'Anlagefehler',
            message: 'Anhang kann nicht heruntergeladen werden',
        },
        permissionError: {
            title: 'Speicherzugriff',
            message: 'Expensify kann Anhänge ohne Speicherzugriff nicht speichern. Tippen Sie auf „Einstellungen“, um die Berechtigungen zu aktualisieren.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Neues Expensify',
        about: 'Über New Expensify',
        update: 'Neue Expensify aktualisieren',
        checkForUpdates: 'Nach Updates suchen',
        toggleDevTools: 'Entwicklerwerkzeuge umschalten',
        viewShortcuts: 'Tastenkombinationen anzeigen',
        services: 'Dienste',
        hide: 'Neue Expensify ausblenden',
        hideOthers: 'Andere ausblenden',
        showAll: 'Alle anzeigen',
        quit: 'New Expensify beenden',
        fileMenu: 'Datei',
        closeWindow: 'Fenster schließen',
        editMenu: 'Bearbeiten',
        undo: 'Rückgängig',
        redo: 'Wiederholen',
        cut: 'Ausschneiden',
        copy: 'Kopieren',
        paste: 'Einfügen',
        pasteAndMatchStyle: 'Einsetzen und Formatierung anpassen',
        pasteAsPlainText: 'Als unformatierten Text einfügen',
        delete: 'Löschen',
        selectAll: 'Alles auswählen',
        speechSubmenu: 'Sprache',
        startSpeaking: 'Sprechen starten',
        stopSpeaking: 'Sprechen beenden',
        viewMenu: 'Anzeigen',
        reload: 'Neu laden',
        forceReload: 'Neu laden erzwingen',
        resetZoom: 'Tatsächliche Größe',
        zoomIn: 'Vergrößern',
        zoomOut: 'Verkleinern',
        togglefullscreen: 'Vollbild ein-/ausschalten',
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
                `Die neue Version wird in Kürze verfügbar sein.${!isSilentUpdating ? 'Wir benachrichtigen dich, sobald wir bereit sind zu aktualisieren.' : ''}`,
            soundsGood: 'Klingt gut',
        },
        notAvailable: {
            title: 'Aktualisierung nicht verfügbar',
            message: 'Derzeit ist kein Update verfügbar. Bitte versuche es später erneut!',
            okay: 'Okay',
        },
        error: {
            title: 'Update-Überprüfung fehlgeschlagen',
            message: 'Wir konnten nicht nach einem Update suchen. Bitte versuchen Sie es später noch einmal.',
        },
    },
    settlement: {
        status: {
            pending: 'Ausstehend',
            cleared: 'Ausgeglichen',
            failed: 'Fehlgeschlagen',
        },
        failedError: ({link}: {link: string}) => `Wir werden diese Abrechnung erneut versuchen, sobald du dein Konto <a href="${link}">entsperrt hast</a>.`,
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
            createReport: 'Bericht erstellen',
            chooseWorkspace: 'Wähle einen Workspace für diesen Bericht aus.',
            emptyReportConfirmationTitle: 'Sie haben bereits einen leeren Bericht',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Möchten Sie wirklich einen weiteren Bericht in ${workspaceName} erstellen? Sie können auf Ihre leeren Berichte zugreifen unter`,
            emptyReportConfirmationPromptLink: 'Berichte',
            genericWorkspaceName: 'dieser Arbeitsbereich',
        },
        genericCreateReportFailureMessage: 'Unerwarteter Fehler beim Erstellen dieses Chats. Bitte versuchen Sie es später erneut.',
        genericAddCommentFailureMessage: 'Unerwarteter Fehler beim Veröffentlichen des Kommentars. Bitte versuche es später erneut.',
        genericUpdateReportFieldFailureMessage: 'Unerwarteter Fehler beim Aktualisieren des Feldes. Bitte versuchen Sie es später erneut.',
        genericUpdateReportNameEditFailureMessage: 'Unerwarteter Fehler beim Umbenennen des Berichts. Bitte versuchen Sie es später erneut.',
        noActivityYet: 'Noch keine Aktivitäten',
        connectionSettings: 'Verbindungseinstellungen',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `${fieldName} geändert zu „${newValue}“ (zuvor „${oldValue}“)`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `setze ${fieldName} auf „${newValue}“`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) => {
                    if (!toPolicyName) {
                        return `hat den Workspace geändert${fromPolicyName ? `(zuvor ${fromPolicyName})` : ''}`;
                    }
                    return `den Arbeitsbereich in ${toPolicyName}${fromPolicyName ? `(zuvor ${fromPolicyName})` : ''} geändert`;
                },
                changeType: ({oldType, newType}: ChangeTypeParams) => `Typ geändert von ${oldType} zu ${newType}`,
                exportedToCSV: `als CSV exportiert`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `exportiert nach ${translatedLabel}`;
                    },
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `exportiert nach ${label} über`,
                    automaticActionTwo: 'Buchhaltungseinstellungen',
                    manual: ({label}: ExportedToIntegrationParams) => `hat diesen Bericht als manuell nach ${label} exportiert markiert.`,
                    automaticActionThree: 'und erfolgreich einen Datensatz erstellt für',
                    reimburseableLink: 'Auslagen',
                    nonReimbursableLink: 'Firmenkarten-Ausgaben',
                    pending: ({label}: ExportedToIntegrationParams) => `habe begonnen, diesen Bericht nach ${label} zu exportieren...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `Export dieses Berichts nach ${label} ist fehlgeschlagen („${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}“)`,
                managerAttachReceipt: `einen Beleg hinzugefügt`,
                managerDetachReceipt: `hat einen Beleg entfernt`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `anderweitig ${amount} ${currency} bezahlt`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `${currency}${amount} über Integration bezahlt`,
                outdatedBankAccount: `konnte die Zahlung aufgrund eines Problems mit dem Bankkonto des Zahlenden nicht verarbeiten`,
                reimbursementACHBounce: `Konnte die Zahlung aufgrund eines Problems mit dem Bankkonto nicht verarbeiten`,
                reimbursementACHCancelled: `hat die Zahlung storniert`,
                reimbursementAccountChanged: `Die Zahlung konnte nicht verarbeitet werden, da der Zahlungspflichtige sein Bankkonto gewechselt hat.`,
                reimbursementDelayed: `die Zahlung verarbeitet, aber sie verzögert sich um weitere 1–2 Werktage`,
                selectedForRandomAudit: `zufällig zur Überprüfung ausgewählt`,
                selectedForRandomAuditMarkdown: `zufällig ausgewählt zur Überprüfung`,
                share: ({to}: ShareParams) => `Mitglied zu ${to} eingeladen`,
                unshare: ({to}: UnshareParams) => `Mitglied ${to} entfernt`,
                stripePaid: ({amount, currency}: StripePaidParams) => `bezahlt ${currency}${amount}`,
                takeControl: `Kontrolle übernommen`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `Beim Synchronisieren mit ${label}${errorMessage ? ` ("${errorMessage}")` : ''} ist ein Problem aufgetreten. Bitte behebe das Problem in den <a href="${workspaceAccountingLink}">Workspace-Einstellungen</a>.`,
                addEmployee: ({email, role}: AddEmployeeParams) => `${email} wurde als ${role === 'member' ? 'a' : 'ein'} ${role} hinzugefügt`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `die Rolle von ${email} wurde auf ${newRole} aktualisiert (zuvor ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `benutzerdefiniertes Feld 1 von ${email} entfernt (zuvor „${previousValue}“)`;
                    }
                    return !previousValue
                        ? `„${newValue}“ zu benutzerdefiniertem Feld 1 von ${email} hinzugefügt`
                        : `Benutzerdefiniertes Feld 1 von ${email} auf „${newValue}“ geändert (zuvor „${previousValue}“)`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `benutzerdefiniertes Feld 2 von ${email} entfernt (zuvor „${previousValue}“)`;
                    }
                    return !previousValue
                        ? `„${newValue}“ zu benutzerdefiniertem Feld 2 von ${email} hinzugefügt`
                        : `Benutzerdefiniertes Feld 2 von ${email} zu „${newValue}“ geändert (zuvor „${previousValue}“)`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} hat den Workspace verlassen`,
                removeMember: ({email, role}: AddEmployeeParams) => `${role} ${email} entfernt`,
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
        receiptScanningApp: 'Belegerfassungs-App',
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
        investorRelations: 'Investor-Relations',
        getStarted: 'Loslegen',
        createAccount: 'Neues Konto erstellen',
        logIn: 'Anmelden',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Zurück zur Chatliste navigieren',
        chatWelcomeMessage: 'Willkommensnachricht im Chat',
        navigatesToChat: 'Navigiert zu einem Chat',
        newMessageLineIndicator: 'Neue Nachrichtenzeilenanzeige',
        chatMessage: 'Chat-Nachricht',
        lastChatMessagePreview: 'Vorschau der letzten Chatnachricht',
        workspaceName: 'Workspace-Name',
        chatUserDisplayNames: 'Anzeigenamen von Chatmitgliedern',
        scrollToNewestMessages: 'Zu neuesten Nachrichten scrollen',
        preStyledText: 'Vorgestylteter Text',
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
        spamDescription: 'Unerbetene themenfremde Werbung',
        inconsiderate: 'Rücksichtslos',
        inconsiderateDescription: 'Beleidigende oder respektlose Formulierungen mit fragwürdigen Absichten',
        intimidation: 'Einschüchterung',
        intimidationDescription: 'Eine Agenda aggressiv verfolgen, obwohl es berechtigte Einwände gibt',
        bullying: 'Mobbing',
        bullyingDescription: 'Das gezielte Anvisieren einer Person, um Gehorsam zu erlangen',
        harassment: 'Belästigung',
        harassmentDescription: 'Rassistisches, frauenfeindliches oder anderweitig allgemein diskriminierendes Verhalten',
        assault: 'Angriff',
        assaultDescription: 'Gezielter emotionaler Angriff mit der Absicht, Schaden zuzufügen',
        flaggedContent: 'Diese Nachricht wurde als Verstoß gegen unsere Community-Regeln gekennzeichnet und der Inhalt wurde ausgeblendet.',
        hideMessage: 'Nachricht ausblenden',
        revealMessage: 'Nachricht anzeigen',
        levelOneResult: 'Sendet eine anonyme Warnung und die Nachricht wird zur Überprüfung gemeldet.',
        levelTwoResult: 'Nachricht aus dem Kanal ausgeblendet, anonyme Warnung hinzugefügt und Nachricht zur Überprüfung gemeldet.',
        levelThreeResult: 'Nachricht aus dem Kanal entfernt, anonyme Verwarnung ausgesprochen und Nachricht zur Überprüfung gemeldet.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Zur Einreichung von Spesen einladen',
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
        share: 'Mit meinem Buchhalter teilen',
        nothing: 'Im Moment nichts',
    },
    teachersUnitePage: {
        teachersUnite: 'Lehrkräfte vereint euch',
        joinExpensifyOrg:
            'Schließe dich Expensify.org an, um Ungerechtigkeit auf der ganzen Welt zu beseitigen. Die aktuelle Kampagne „Teachers Unite“ unterstützt Lehrkräfte überall, indem sie die Kosten für grundlegende Schulausstattung teilt.',
        iKnowATeacher: 'Ich kenne eine Lehrerin.',
        iAmATeacher: 'Ich bin Lehrer',
        getInTouch: 'Ausgezeichnet! Bitte teilen Sie ihre Informationen, damit wir Kontakt mit ihnen aufnehmen können.',
        introSchoolPrincipal: 'Einführung für Ihre Schulleitung',
        schoolPrincipalVerifyExpense:
            'Expensify.org teilt die Kosten für grundlegende Schulmaterialien, damit Schülerinnen und Schüler aus einkommensschwachen Haushalten besser lernen können. Ihre Schulleitung wird gebeten, Ihre Ausgaben zu bestätigen.',
        principalFirstName: 'Vorname des Hauptantragstellers',
        principalLastName: 'Nachname des Hauptzeichners',
        principalWorkEmail: 'Hauptberufs-E-Mail',
        updateYourEmail: 'Aktualisieren Sie Ihre E-Mail-Adresse',
        updateEmail: 'E-Mail-Adresse aktualisieren',
        schoolMailAsDefault: ({contactMethodsRoute}: ContactMethodsRouteParams) =>
            `Bevor du fortfährst, stelle bitte sicher, dass deine Schul-E-Mail-Adresse als Standardkontaktmethode festgelegt ist. Du kannst dies unter Einstellungen > Profil > <a href="${contactMethodsRoute}">Kontaktmethoden</a> tun.`,
        error: {
            enterPhoneEmail: 'Gib eine gültige E-Mail-Adresse oder Telefonnummer ein',
            enterEmail: 'E-Mail-Adresse eingeben',
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
        deleteWaypointConfirmation: 'Möchten Sie diesen Wegpunkt wirklich löschen?',
        address: 'Adresse',
        waypointDescription: {
            start: 'Start',
            stop: 'Stopp',
        },
        mapPending: {
            title: 'Zuordnung ausstehend',
            subtitle: 'Die Karte wird erstellt, sobald du wieder online bist',
            onlineSubtitle: 'Einen Moment, während wir die Karte einrichten',
            errorTitle: 'Kartenfehler',
            errorSubtitle: 'Beim Laden der Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        error: {
            selectSuggestedAddress: 'Bitte wählen Sie eine vorgeschlagene Adresse aus oder verwenden Sie den aktuellen Standort',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Zeugnis verloren oder beschädigt',
        nextButtonLabel: 'Weiter',
        reasonTitle: 'Warum benötigen Sie eine neue Karte?',
        cardDamaged: 'Meine Karte wurde beschädigt',
        cardLostOrStolen: 'Meine Karte wurde verloren oder gestohlen',
        confirmAddressTitle: 'Bitte bestätigen Sie die Postanschrift für Ihre neue Karte.',
        cardDamagedInfo: 'Ihre neue Karte wird in 2–3 Werktagen eintreffen. Ihre aktuelle Karte funktioniert weiterhin, bis Sie Ihre neue Karte aktivieren.',
        cardLostOrStolenInfo: 'Ihre aktuelle Karte wird dauerhaft deaktiviert, sobald Ihre Bestellung aufgegeben wird. Die meisten Karten treffen innerhalb weniger Werktage ein.',
        address: 'Adresse',
        deactivateCardButton: 'Karte deaktivieren',
        shipNewCardButton: 'Neue Karte versenden',
        addressError: 'Adresse ist erforderlich',
        reasonError: 'Grund ist erforderlich',
        successTitle: 'Ihre neue Karte ist unterwegs!',
        successDescription: 'Sie müssen ihn aktivieren, sobald er in ein paar Werktagen ankommt. In der Zwischenzeit können Sie eine virtuelle Karte verwenden.',
    },
    eReceipt: {
        guaranteed: 'Garantierte eReceipt',
        transactionDate: 'Transaktionsdatum',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Starte einen Chat, <success><strong>empfiehl einen Freund</strong></success>.',
            header: 'Starte einen Chat, wirb einen Freund',
            body: 'Möchtest du, dass deine Freunde Expensify auch nutzen? Starte einfach einen Chat mit ihnen, und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Reiche eine Ausgabe ein, <success><strong>empfehle dein Team weiter</strong></success>.',
            header: 'Reiche eine Ausgabe ein, wirb dein Team',
            body: 'Möchtest du, dass dein Team Expensify auch nutzt? Reiche einfach eine Ausgabe bei ihnen ein und wir kümmern uns um den Rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Freunde werben',
            body: 'Möchtest du, dass deine Freunde auch Expensify nutzen? Chatte einfach mit ihnen, zahle oder teile eine Ausgabe, und wir kümmern uns um den Rest. Oder teile einfach deinen Einladungslink!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Freunde werben',
            header: 'Freunde werben',
            body: 'Möchtest du, dass deine Freunde auch Expensify nutzen? Chatte einfach mit ihnen, zahle oder teile eine Ausgabe, und wir kümmern uns um den Rest. Oder teile einfach deinen Einladungslink!',
        },
        copyReferralLink: 'Einladungslink kopieren',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chatten Sie mit Ihrem Setup-Spezialisten in <a href="${href}">${adminReportName}</a>, um Hilfe zu erhalten`,
        default: `Sende eine Nachricht an <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link>, um Hilfe bei der Einrichtung zu erhalten`,
    },
    violations: {
        allTagLevelsRequired: 'Alle Tags erforderlich',
        autoReportedRejectedExpense: 'Diese Ausgabe wurde abgelehnt.',
        billableExpense: 'Abrechenbar nicht mehr gültig',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Beleg erforderlich${formattedLimit ? `über ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Kategorie nicht mehr gültig',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Angewandte ${surcharge}% Umrechnungsgebühr`,
        customUnitOutOfPolicy: 'Kurs für diesen Workspace ungültig',
        duplicatedTransaction: 'Mögliches Duplikat',
        fieldRequired: 'Berichtsfelder sind erforderlich',
        futureDate: 'Zukünftiges Datum nicht zulässig',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Aufgeschlagen um ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Datum älter als vor ${maxAge} Tagen`,
        missingCategory: 'Fehlende Kategorie',
        missingComment: 'Beschreibung für die ausgewählte Kategorie erforderlich',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Fehlt ${tagName ?? 'Tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Betrag weicht von der berechneten Entfernung ab';
                case 'card':
                    return 'Betrag höher als Kartentransaktion';
                default:
                    if (displayPercentVariance) {
                        return `Betrag ist um ${displayPercentVariance}% höher als der gescannte Beleg`;
                    }
                    return 'Betrag höher als gescannter Beleg';
            }
        },
        modifiedDate: 'Datum weicht vom gescannten Beleg ab',
        nonExpensiworksExpense: 'Spesen außerhalb von Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Ausgabe überschreitet das automatische Genehmigungslimit von ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Betrag über dem Kategorienlimit von ${formattedLimit}/Person`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit}/Person`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit}/Reise`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Betrag über dem Limit von ${formattedLimit}/Person`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Betrag über dem täglichen Kategorienlimit von ${formattedLimit}/Person`,
        receiptNotSmartScanned: 'Beleg- und Ausgabendetails manuell hinzugefügt.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Beleg erforderlich, da die Kategoriegrenze von ${formattedLimit} überschritten wurde`;
            }
            if (formattedLimit) {
                return `Beleg erforderlich über ${formattedLimit}`;
            }
            if (category) {
                return `Beleg erforderlich über Kategorielimit`;
            }
            return 'Beleg erforderlich';
        },
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
                    ? `Bankverbindung unterbrochen. <a href="${companyCardPageURL}">Erneut verbinden, um den Beleg abzugleichen</a>`
                    : 'Bankverbindung unterbrochen. Bitte einen Admin bitten, die Verbindung wiederherzustellen, um den Beleg abzugleichen.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Bitte ${member} bitten, es als Bargeld zu markieren, oder 7 Tage warten und es erneut versuchen` : 'Warten auf Abgleich mit Kartentransaktion.';
            }
            return '';
        },
        brokenConnection530Error: 'Beleg ausstehend wegen unterbrochener Bankverbindung',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Beleg ausstehend wegen unterbrochener Bankverbindung. Bitte beheben Sie das Problem unter <a href="${workspaceCompanyCardRoute}">Firmenkarten</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung. Bitte bitten Sie eine Workspace-Admin, das Problem zu beheben.',
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
        tagToKeep: 'Wähle, welchen Tag du behalten möchtest',
        isTransactionReimbursable: 'Wählen, ob die Transaktion erstattungsfähig ist',
        merchantToKeep: 'Wähle, welchen Händler du behalten möchtest',
        descriptionToKeep: 'Wählen Sie die zu behaltende Beschreibung aus',
        categoryToKeep: 'Wähle aus, welche Kategorie beibehalten werden soll',
        isTransactionBillable: 'Auswählen, ob die Transaktion verrechenbar ist',
        keepThisOne: 'Dieses behalten',
        confirmDetails: `Bestätige die Details, die du behältst`,
        confirmDuplicatesInfo: `Die Duplikate, die du nicht behältst, werden für den Einreichenden zurückgehalten, damit er sie löschen kann.`,
        hold: 'Diese Ausgabe wurde angehalten',
        resolvedDuplicates: 'Duplikat behoben',
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
            title: 'Bitte teilen Sie uns mit, warum Sie uns verlassen',
            subtitle: 'Bevor du gehst, sag uns bitte, warum du zu Expensify Classic wechseln möchtest.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ich benötige eine Funktion, die nur in Expensify Classic verfügbar ist.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Ich verstehe nicht, wie ich New Expensify verwenden soll.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Ich verstehe, wie man New Expensify benutzt, aber ich bevorzuge Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Welche Funktion benötigst du, die in New Expensify nicht verfügbar ist?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Was versuchen Sie zu tun?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Warum bevorzugen Sie Expensify Classic?',
        },
        responsePlaceholder: 'Ihre Antwort',
        thankYou: 'Danke für das Feedback!',
        thankYouSubtitle: 'Ihre Antworten helfen uns, ein besseres Produkt zu entwickeln, mit dem man Dinge erledigen kann. Vielen Dank!',
        goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        offlineTitle: 'Sie scheinst hier festzustecken …',
        offline:
            'Sie scheinen offline zu sein. Leider funktioniert Expensify Classic nicht offline, aber das neue Expensify schon. Wenn Sie Expensify Classic lieber verwenden möchten, versuchen Sie es erneut, sobald Sie eine Internetverbindung haben.',
        quickTip: 'Kurzer Tipp …',
        quickTipSubTitle: 'Du kannst direkt zu Expensify Classic gehen, indem du expensify.com besuchst. Setze ein Lesezeichen, um eine einfache Abkürzung zu haben!',
        bookACall: 'Einen Anruf buchen',
        bookACallTitle: 'Möchten Sie mit einem Produktmanager sprechen?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Direkt in Ausgaben und Berichten chatten',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Fähigkeit, alles mobil zu erledigen',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Reise und Spesen in Chat-Geschwindigkeit',
        },
        bookACallTextTop: 'Wenn Sie zu Expensify Classic wechseln, verpassen Sie Folgendes:',
        bookACallTextBottom:
            'Wir würden uns freuen, mit Ihnen zu telefonieren, um den Grund zu erfahren. Sie können einen Termin mit einem unserer Senior Product Manager buchen, um Ihre Anforderungen zu besprechen.',
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
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Kostenlose Testphase: Noch ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Ihre Zahlungsinformationen sind veraltet',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Aktualisieren Sie Ihre Zahlungskarte bis zum ${date}, um weiterhin alle Ihre Lieblingsfunktionen nutzen zu können.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Ihre Zahlung konnte nicht verarbeitet werden',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Ihre Belastung vom ${date} über ${purchaseAmountOwed} konnte nicht verarbeitet werden. Bitte fügen Sie eine Zahlungskarte hinzu, um den fälligen Betrag zu begleichen.`
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
                    `Sie haben die Belastung über ${amountOwed} für die Karte mit der Endziffer ${cardEnding} beanstandet. Ihr Konto bleibt gesperrt, bis der Streit mit Ihrer Bank geklärt ist.`,
            },
            cardAuthenticationRequired: {
                title: 'Ihre Zahlungskarte wurde noch nicht vollständig authentifiziert.',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `Bitte schließen Sie den Authentifizierungsvorgang ab, um Ihre Zahlungskarte mit der Endung ${cardEnding} zu aktivieren.`,
            },
            insufficientFunds: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `Ihre Zahlungskarte wurde aufgrund unzureichender Deckung abgelehnt. Bitte versuchen Sie es erneut oder fügen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Saldo von ${amountOwed} zu begleichen.`,
            },
            cardExpired: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `Ihre Zahlungskarte ist abgelaufen. Bitte fügen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Saldo von ${amountOwed} zu begleichen.`,
            },
            cardExpireSoon: {
                title: 'Deine Karte läuft bald ab',
                subtitle:
                    'Ihre Zahlungskarte läuft am Ende dieses Monats ab. Klicken Sie unten auf das Drei-Punkte-Menü, um sie zu aktualisieren und weiterhin alle Ihre Lieblingsfunktionen zu nutzen.',
            },
            retryBillingSuccess: {
                title: 'Erfolg!',
                subtitle: 'Ihre Karte wurde erfolgreich belastet.',
            },
            retryBillingError: {
                title: 'Ihre Karte konnte nicht belastet werden',
                subtitle:
                    'Bevor du es erneut versuchst, rufe bitte direkt deine Bank an, um Expensify-Zahlungen zu autorisieren und eventuelle Sperren aufzuheben. Andernfalls versuche, eine andere Zahlungskarte hinzuzufügen.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Sie haben die Belastung über ${amountOwed} für die Karte mit der Endziffer ${cardEnding} beanstandet. Ihr Konto bleibt gesperrt, bis der Streit mit Ihrer Bank geklärt ist.`,
            preTrial: {
                title: 'Kostenlose Testversion starten',
                subtitle: 'Als nächsten Schritt <a href="#">schließen Sie Ihre Einrichtungs-Checkliste ab</a>, damit Ihr Team mit dem Erfassen von Ausgaben beginnen kann.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Testversion: Noch ${numOfDays} ${numOfDays === 1 ? 'Tag' : 'Tage'}!`,
                subtitle: 'Fügen Sie eine Zahlungskarte hinzu, um weiterhin alle Ihre Lieblingsfunktionen zu nutzen.',
            },
            trialEnded: {
                title: 'Ihre kostenlose Testversion ist abgelaufen',
                subtitle: 'Fügen Sie eine Zahlungskarte hinzu, um weiterhin alle Ihre Lieblingsfunktionen zu nutzen.',
            },
            earlyDiscount: {
                claimOffer: 'Angebot einlösen',
                subscriptionPageTitle: ({discountType}: EarlyDiscountTitleParams) =>
                    `<strong>${discountType}% Rabatt im ersten Jahr!</strong> Fügen Sie einfach eine Zahlungskarte hinzu und starten Sie ein Jahresabonnement.`,
                onboardingChatTitle: ({discountType}: EarlyDiscountTitleParams) => `Angebot für kurze Zeit: ${discountType}% Rabatt im ersten Jahr!`,
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Einlösen in ${days > 0 ? `${days}T :` : ''}${hours}Std : ${minutes}Min : ${seconds}Sek`,
            },
        },
        cardSection: {
            title: 'Zahlung',
            subtitle: 'Fügen Sie eine Karte hinzu, um Ihr Expensify-Abonnement zu bezahlen.',
            addCardButton: 'Zahlungskarte hinzufügen',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Ihr nächstes Zahlungsdatum ist der ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Karte mit Endziffern ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Name: ${name}, Ablaufdatum: ${expiration}, Währung: ${currency}`,
            changeCard: 'Zahlungskarte ändern',
            changeCurrency: 'Zahlungswährung ändern',
            cardNotFound: 'Keine Zahlungskarte hinzugefügt',
            retryPaymentButton: 'Zahlung erneut versuchen',
            authenticatePayment: 'Zahlung authentifizieren',
            requestRefund: 'Rückerstattung anfordern',
            requestRefundModal: {
                full: 'Eine Rückerstattung zu erhalten ist einfach: Stufen Sie Ihr Konto einfach vor Ihrem nächsten Abrechnungsdatum herab, und Sie erhalten eine Rückerstattung. <br /> <br /> Hinweis: Wenn Sie Ihr Konto herabstufen, werden Ihre Arbeitsbereiche gelöscht. Diese Aktion kann nicht rückgängig gemacht werden, aber Sie können jederzeit einen neuen Arbeitsbereich erstellen, wenn Sie Ihre Meinung ändern.',
                confirm: 'Workspace(s) löschen und Downgrade',
            },
            viewPaymentHistory: 'Zahlungsverlauf anzeigen',
        },
        yourPlan: {
            title: 'Ihr Tarif',
            exploreAllPlans: 'Alle Tarife anzeigen',
            customPricing: 'Individuelle Preisgestaltung',
            asLowAs: ({price}: YourPlanPriceValueParams) => `schon ab ${price} pro aktivem Mitglied/Monat`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied/Monat`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} pro Mitglied und Monat`,
            perMemberMonth: 'pro Mitglied/Monat',
            collect: {
                title: 'Sammeln',
                description: 'Der kleine Business-Tarif, der Ihnen Spesen, Reisen und Chat bietet.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Von ${lower}/aktivem Mitglied mit der Expensify Card, ${upper}/aktivem Mitglied ohne die Expensify Card.`,
                benefit1: 'Belegscan',
                benefit2: 'Erstattungen',
                benefit3: 'Verwaltung von Firmenkreditkarten',
                benefit4: 'Genehmigungen für Ausgaben und Reisen',
                benefit5: 'Reisebuchung und Richtlinien',
                benefit6: 'QuickBooks-/Xero-Integrationen',
                benefit7: 'Chat über Ausgaben, Spesenabrechnungen und Räume',
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
                benefit7: 'Benutzerdefinierte Einblicke und Berichte',
                benefit8: 'Budgetierung',
            },
            thisIsYourCurrentPlan: 'Dies ist Ihr aktueller Plan',
            downgrade: 'Downgrade auf Collect',
            upgrade: 'Upgrade auf Control',
            addMembers: 'Mitglieder hinzufügen',
            saveWithExpensifyTitle: 'Sparen mit der Expensify Card',
            saveWithExpensifyDescription: 'Verwenden Sie unseren Sparrechner, um zu sehen, wie das Cashback der Expensify Card Ihre Expensify-Rechnung reduzieren kann.',
            saveWithExpensifyButton: 'Mehr erfahren',
        },
        compareModal: {
            comparePlans: 'Tarife vergleichen',
            subtitle: `<muted-text>Schalte die Funktionen frei, die du brauchst, mit dem Tarif, der zu dir passt. <a href="${CONST.PRICING}">Sieh dir unsere Preisseite an</a> für eine vollständige Funktionsübersicht aller unserer Tarife.</muted-text>`,
        },
        details: {
            title: 'Abonnementdetails',
            annual: 'Jahresabonnement',
            taxExempt: 'Steuerbefreiungsstatus anfordern',
            taxExemptEnabled: 'Steuerbefreit',
            taxExemptStatus: 'Steuerbefreiungsstatus',
            payPerUse: 'Nutzungsabhängig',
            subscriptionSize: 'Abonnementgröße',
            headsUp:
                'Achtung: Wenn du jetzt keine Abonnementgröße festlegst, setzen wir sie automatisch auf die Anzahl der aktiven Mitglieder im ersten Monat. Du verpflichtest dich dann, für mindestens diese Anzahl von Mitgliedern in den nächsten 12 Monaten zu bezahlen. Du kannst deine Abonnementgröße jederzeit erhöhen, aber du kannst sie erst verringern, wenn dein Abonnement abgelaufen ist.',
            zeroCommitment: 'Keine Verpflichtung zum ermäßigten jährlichen Abonnementpreis',
        },
        subscriptionSize: {
            title: 'Abonnementgröße',
            yourSize: 'Die Größe Ihres Abonnements ist die Anzahl offener Plätze, die in einem bestimmten Monat von beliebigen aktiven Mitgliedern belegt werden können.',
            eachMonth:
                'Jeden Monat deckt Ihr Abonnement die oben festgelegte Anzahl aktiver Mitglieder ab. Jedes Mal, wenn Sie die Größe Ihres Abonnements erhöhen, beginnt ein neues 12-monatiges Abonnement mit dieser neuen Größe.',
            note: 'Hinweis: Ein aktives Mitglied ist jede Person, die Ausgaben erfasst, bearbeitet, eingereicht, genehmigt, erstattet oder exportiert hat, die mit dem Unternehmensarbeitsbereich Ihres Unternehmens verknüpft sind.',
            confirmDetails: 'Bestätigen Sie die Details Ihres neuen Jahresabonnements:',
            subscriptionSize: 'Abonnementgröße',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} aktive Mitglieder/Monat`,
            subscriptionRenews: 'Abonnement wird verlängert',
            youCantDowngrade: 'Sie können während Ihres Jahresabonnements kein Downgrade durchführen.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Sie haben bereits eine jährliche Abo-Größe von ${size} aktiven Mitgliedern pro Monat bis zum ${date} zugesagt. Sie können ab dem ${date} zu einem nutzungsbasierten Abo wechseln, indem Sie die automatische Verlängerung deaktivieren.`,
            error: {
                size: 'Bitte geben Sie eine gültige Abonnementgröße ein',
                sameSize: 'Bitte gib eine andere Zahl als deine aktuelle Abonnementgröße ein',
            },
        },
        paymentCard: {
            addPaymentCard: 'Zahlungskarte hinzufügen',
            enterPaymentCardDetails: 'Gib deine Zahlungskartendaten ein',
            security: 'Expensify ist PCI-DSS-konform, verwendet Verschlüsselung auf Bankniveau und nutzt redundante Infrastruktur, um Ihre Daten zu schützen.',
            learnMoreAboutSecurity: 'Erfahren Sie mehr über unsere Sicherheit.',
        },
        subscriptionSettings: {
            title: 'Abonnementeinstellungen',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Abonnementstyp: ${subscriptionType}, Abonnementgröße: ${subscriptionSize}, Automatische Verlängerung: ${autoRenew}, Automatische jährliche Platzerhöhung: ${autoIncrease}`,
            none: 'keine',
            on: 'Ein',
            off: 'Aus',
            annual: 'Jährlich',
            autoRenew: 'Automatische Verlängerung',
            autoIncrease: 'Jährliche Plätze automatisch erhöhen',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Sparen Sie bis zu ${amountWithCurrency}/Monat pro aktivem Mitglied`,
            automaticallyIncrease:
                'Erhöhe deine jährlichen Plätze automatisch, um aktive Mitglieder aufzunehmen, die deine Abonnementgröße überschreiten. Hinweis: Dadurch wird das Enddatum deines jährlichen Abonnements verlängert.',
            disableAutoRenew: 'Automatische Verlängerung deaktivieren',
            helpUsImprove: 'Helfen Sie uns, Expensify zu verbessern',
            whatsMainReason: 'Was ist der Hauptgrund, warum du die automatische Verlängerung deaktivierst?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Wird am ${date} verlängert.`,
            pricingConfiguration: 'Die Preise hängen von der Konfiguration ab. Wähle für den niedrigsten Preis ein Jahresabonnement und hole dir die Expensify Card.',
            learnMore: {
                part1: 'Erfahren Sie mehr auf unserer',
                pricingPage: 'Preisseite',
                part2: 'oder chatten Sie mit unserem Team in Ihrer',
                adminsRoom: '#admins-Raum.',
            },
            estimatedPrice: 'Geschätzter Preis',
            changesBasedOn: 'Dies ändert sich basierend auf deiner Expensify Card-Nutzung und den unten aufgeführten Abonnementoptionen.',
        },
        requestEarlyCancellation: {
            title: 'Frühzeitige Kündigung anfordern',
            subtitle: 'Was ist der Hauptgrund, warum du eine vorzeitige Kündigung beantragst?',
            subscriptionCanceled: {
                title: 'Abonnement gekündigt',
                subtitle: 'Dein Jahresabonnement wurde gekündigt.',
                info: 'Wenn Sie Ihre(n) Workspace(s) weiterhin nutzungsbasiert verwenden möchten, ist alles bereit.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Wenn du zukünftige Aktivitäten und Gebühren verhindern möchtest, musst du deinen/die <a href="${workspacesListRoute}">Workspace(s) löschen</a>. Beachte, dass dir beim Löschen deines/deiner Workspace(s) alle ausstehenden Aktivitäten in Rechnung gestellt werden, die im aktuellen Kalendermonat angefallen sind.`,
            },
            requestSubmitted: {
                title: 'Anfrage gesendet',
                subtitle:
                    'Danke, dass Sie uns wissen lassen, dass Sie Ihr Abonnement kündigen möchten. Wir prüfen Ihre Anfrage und werden uns in Kürze über Ihren Chat mit <concierge-link>Concierge</concierge-link> bei Ihnen melden.',
            },
            acknowledgement: `Indem ich eine vorzeitige Kündigung beantrage, erkenne ich an und stimme zu, dass Expensify gemäß den Expensify <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Nutzungsbedingungen</a> oder anderen anwendbaren Dienstleistungsverträgen zwischen mir und Expensify nicht verpflichtet ist, einem solchen Antrag stattzugeben, und dass Expensify das alleinige Ermessen hinsichtlich der Genehmigung eines solchen Antrags behält.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Funktionalität muss verbessert werden',
        tooExpensive: 'Zu teuer',
        inadequateSupport: 'Unzureichender Kundensupport',
        businessClosing: 'Unternehmensschließung, Verkleinerung oder Übernahme',
        additionalInfoTitle: 'Zu welcher Software wechseln Sie und warum?',
        additionalInfoInputLabel: 'Ihre Antwort',
    },
    roomChangeLog: {
        updateRoomDescription: 'setze die Raum­beschreibung auf:',
        clearRoomDescription: 'hat die Raumbeschreibung gelöscht',
        changedRoomAvatar: 'hat das Raum-Avatar geändert',
        removedRoomAvatar: 'hat den Raumavatar entfernt',
    },
    delegate: {
        switchAccount: 'Konten wechseln:',
        copilotDelegatedAccess: 'Copilot: Delegierter Zugriff',
        copilotDelegatedAccessDescription: 'Anderen Mitgliedern den Zugriff auf Ihr Konto erlauben.',
        addCopilot: 'Copilot hinzufügen',
        membersCanAccessYourAccount: 'Diese Mitglieder können auf Ihr Konto zugreifen:',
        youCanAccessTheseAccounts: 'Auf diese Konten können Sie über den Kontowechsler zugreifen:',
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
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `im Namen von ${delegator}`,
        accessLevel: 'Zugriffsebene',
        confirmCopilot: 'Bestätige deinen Copilot unten.',
        accessLevelDescription: 'Wählen Sie unten eine Zugriffsstufe aus. Sowohl voller als auch eingeschränkter Zugriff ermöglichen Copilots, alle Unterhaltungen und Ausgaben einzusehen.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Einem anderen Mitglied erlauben, alle Aktionen in deinem Konto in deinem Namen auszuführen. Beinhaltet Chat, Einreichungen, Genehmigungen, Zahlungen, Aktualisierungen von Einstellungen und mehr.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Erlaube einem anderen Mitglied, die meisten Aktionen in deinem Konto in deinem Namen durchzuführen. Ausgenommen sind Genehmigungen, Zahlungen, Ablehnungen und Sperren.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copilot entfernen',
        removeCopilotConfirmation: 'Sind Sie sicher, dass Sie diesen Copilot entfernen möchten?',
        changeAccessLevel: 'Zugriffsebene ändern',
        makeSureItIsYou: 'Lass uns sicherstellen, dass du es bist',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um einen Copiloten hinzuzufügen. Er sollte innerhalb von ein bis zwei Minuten ankommen.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Bitte gib den magischen Code ein, der an ${contactMethod} gesendet wurde, um deinen Copilot zu aktualisieren.`,
        notAllowed: 'Nicht so schnell …',
        noAccessMessage: dedent(`
            Als Copilot hast du keinen Zugriff auf
            diese Seite. Entschuldigung!
        `),
        notAllowedMessage: ({accountOwnerEmail}: AccountOwnerParams) =>
            `Als <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">Copilot</a> für ${accountOwnerEmail} hast du keine Berechtigung, diese Aktion auszuführen. Entschuldigung!`,
        copilotAccess: 'Copilot-Zugriff',
    },
    debug: {
        debug: 'Debuggen',
        details: 'Details',
        JSON: 'JSON',
        reportActions: 'Aktionen',
        reportActionPreview: 'Vorschau',
        nothingToPreview: 'Nichts zum Anzeigen',
        editJson: 'JSON bearbeiten:',
        preview: 'Vorschau:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Fehlende(r) ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Ungültige Eigenschaft: ${propertyName} – Erwartet: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Ungültiger Wert – erwartet: ${expectedValues}`,
        missingValue: 'Fehlender Wert',
        createReportAction: 'Bericht erstellen',
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
        true: 'Wahr',
        false: 'Falsch',
        viewReport: 'Bericht anzeigen',
        viewTransaction: 'Transaktion anzeigen',
        createTransactionViolation: 'Transaktionsverstoß erstellen',
        reasonVisibleInLHN: {
            hasDraftComment: 'Hat Entwurfskommentar',
            hasGBR: 'Hat GBR',
            hasRBR: 'Hat RBR',
            pinnedByUser: 'Von Mitglied angeheftet',
            hasIOUViolations: 'Hat IOU-Verstöße',
            hasAddWorkspaceRoomErrors: 'Hat Fehler beim Hinzufügen eines Arbeitsbereichsraums',
            isUnread: 'Ist ungelesen (Fokusmodus)',
            isArchived: 'Ist archiviert (zuletzt verwendeter Modus)',
            isSelfDM: 'Ist eigener DM',
            isFocused: 'Ist vorübergehend fokussiert',
        },
        reasonGBR: {
            hasJoinRequest: 'Hat Beitrittsanfrage (Admin-Raum)',
            isUnreadWithMention: 'Ungelesen mit Erwähnung',
            isWaitingForAssigneeToCompleteAction: 'Wartet darauf, dass der/die Verantwortliche die Aktion abschließt',
            hasChildReportAwaitingAction: 'Hat untergeordneten Bericht, der auf eine Aktion wartet',
            hasMissingInvoiceBankAccount: 'Fehlendes Bankkonto für Rechnung',
            hasUnresolvedCardFraudAlert: 'Hat eine ungelöste Kreditkartenbetrugswarnung',
        },
        reasonRBR: {
            hasErrors: 'Enthält Fehler in den Berichtsdaten oder in den Berichtsvorgangsdateien',
            hasViolations: 'Hat Verstöße',
            hasTransactionThreadViolations: 'Hat Transaktions-Thread-Verstöße',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Es liegt ein Bericht zur Bearbeitung vor',
            theresAReportWithErrors: 'Es gibt einen Bericht mit Fehlern',
            theresAWorkspaceWithCustomUnitsErrors: 'Es gibt einen Workspace mit Fehlern bei benutzerdefinierten Einheiten',
            theresAProblemWithAWorkspaceMember: 'Es gibt ein Problem mit einem Arbeitsbereichsmitglied',
            theresAProblemWithAWorkspaceQBOExport: 'Es gab ein Problem mit einer Exporteinstellung der Workspace-Verbindung.',
            theresAProblemWithAContactMethod: 'Es gibt ein Problem mit einer Kontaktmethode',
            aContactMethodRequiresVerification: 'Eine Kontaktmethode erfordert eine Verifizierung',
            theresAProblemWithAPaymentMethod: 'Es gibt ein Problem mit einer Zahlungsmethode',
            theresAProblemWithAWorkspace: 'Es gibt ein Problem mit einem Workspace',
            theresAProblemWithYourReimbursementAccount: 'Es gibt ein Problem mit deinem Erstattungskonto',
            theresABillingProblemWithYourSubscription: 'Es gibt ein Abrechnungsproblem mit deinem Abonnement',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Ihr Abonnement wurde erfolgreich verlängert',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Während der Synchronisierung der Arbeitsbereichsverbindung ist ein Problem aufgetreten',
            theresAProblemWithYourWallet: 'Es gibt ein Problem mit Ihrer Wallet',
            theresAProblemWithYourWalletTerms: 'Es gibt ein Problem mit Ihren Wallet-Bedingungen',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Eine Probefahrt machen',
    },
    migratedUserWelcomeModal: {
        title: 'Willkommen bei New Expensify!',
        subtitle: 'Es enthält alles, was du an unserem klassischen Erlebnis liebst, mit einer ganzen Reihe von Upgrades, die dein Leben noch einfacher machen:',
        confirmText: "Los geht's!",
        helpText: '2-min-Demo ausprobieren',
        features: {
            search: 'Leistungsstärkere Suche auf Mobilgerät, Web und Desktop',
            concierge: 'Integrierte Concierge-KI zur Automatisierung Ihrer Ausgaben',
            chat: 'Zu jeder Ausgabe chatten, um Fragen schnell zu klären',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>Beginne <strong>hier!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Benenne deine gespeicherten Suchanfragen um</strong> – hier!</tooltip>',
        accountSwitcher: '<tooltip>Greifen Sie hier auf Ihre <strong>Copilot-Konten</strong> zu</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Scanne unseren Testbeleg</strong>, um zu sehen, wie es funktioniert!</tooltip>',
            manager: '<tooltip>Wähle unseren <strong>Testmanager</strong>, um es auszuprobieren!</tooltip>',
            confirmation: '<tooltip>Jetzt <strong>reichen Sie Ihre Ausgabe ein</strong> und sehen Sie zu, wie die Magie geschieht!</tooltip>',
            tryItOut: 'Ausprobieren',
        },
        outstandingFilter: '<tooltip>Nach Ausgaben filtern,\ndie <strong>genehmigt werden müssen</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Quittung senden, um\n<strong>die Probefahrt abzuschließen!</strong></tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Änderungen verwerfen?',
        body: 'Möchten Sie die von Ihnen vorgenommenen Änderungen wirklich verwerfen?',
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
            description: 'Stellen Sie sicher, dass die folgenden Details für Sie passen. Sobald Sie den Anruf bestätigen, senden wir eine Einladung mit weiteren Informationen.',
            setupSpecialist: 'Ihr Einrichtungs­spezialist',
            meetingLength: 'Meeting-Dauer',
            dateTime: 'Datum & Uhrzeit',
            minutes: '30 Minuten',
        },
        callScheduled: 'Anruf geplant',
    },
    autoSubmitModal: {
        title: 'Alles klar und eingereicht!',
        description: 'Alle Warnungen und Verstöße wurden daher gelöscht, sodass:',
        submittedExpensesTitle: 'Diese Ausgaben wurden eingereicht',
        submittedExpensesDescription: 'Diese Ausgaben wurden an Ihre:n Genehmiger:in gesendet, können aber noch bearbeitet werden, bis sie genehmigt sind.',
        pendingExpensesTitle: 'Ausstehende Spesen wurden verschoben',
        pendingExpensesDescription: 'Alle ausstehenden Kartenausgaben wurden in einen separaten Bericht verschoben, bis sie gebucht werden.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Machen Sie eine 2-minütige Probefahrt',
        },
        modal: {
            title: 'Probier uns aus',
            description: 'Machen Sie eine kurze Produkttour, um sich schnell einen Überblick zu verschaffen.',
            confirmText: 'Testfahrt starten',
            helpText: 'Überspringen',
            employee: {
                description:
                    '<muted-text>Verschaffe deinem Team <strong>3 kostenlose Monate Expensify!</strong> Gib einfach die E-Mail-Adresse deiner Chefin/deines Chefs unten ein und schicke ihr/ihm eine Testausgabe.</muted-text>',
                email: 'Gib die E-Mail-Adresse deines Chefs ein',
                error: 'Dieses Mitglied besitzt einen Workspace. Bitte gib ein neues Mitglied ein, um zu testen.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Du testest Expensify derzeit ausprobieren',
            readyForTheRealThing: 'Bereit für das echte Produkt?',
            getStarted: 'Loslegen',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) => `# ${name} hat dich eingeladen, Expensify auszuprobieren
Hey! Ich habe gerade *3 Monate gratis* bekommen, damit wir Expensify testen können – die schnellste Art, Spesen abzurechnen.

Hier ist ein *Testbeleg*, um dir zu zeigen, wie es funktioniert:`,
    },
    export: {
        basicExport: 'Standardexport',
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
            youMayNeedToConsult: `Möglicherweise müssen Sie sich zur Durchführung der Verifizierung an die IT-Abteilung Ihrer Organisation wenden. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Weitere Informationen</a>.`,
            warning: 'Nach der Verifizierung erhalten alle Expensify-Mitglieder in Ihrer Domain eine E-Mail, dass ihr Konto unter Ihrer Domain verwaltet wird.',
            codeFetchError: 'Bestätigungscode konnte nicht abgerufen werden',
            genericError: 'Wir konnten Ihre Domain nicht verifizieren. Bitte versuchen Sie es erneut und wenden Sie sich an Concierge, wenn das Problem weiterhin besteht.',
        },
        domainVerified: {
            title: 'Domain verifiziert',
            header: 'Wooo! Deine Domain wurde verifiziert',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Die Domain <strong>${domainName}</strong> wurde erfolgreich verifiziert und Sie können nun SAML und weitere Sicherheitsfunktionen einrichten.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML Single Sign-On (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> ist ein Sicherheitsfeature, das Ihnen mehr Kontrolle darüber gibt, wie sich Mitglieder mit <strong>${domainName}</strong>-E-Mails bei Expensify anmelden. Um es zu aktivieren, müssen Sie sich als autorisierter Unternehmens-Admin verifizieren.</muted-text>`,
            fasterAndEasierLogin: 'Schnelleres und einfacheres Einloggen',
            moreSecurityAndControl: 'Mehr Sicherheit und Kontrolle',
            onePasswordForAnything: 'Ein Passwort für alles',
        },
        goToDomain: 'Zur Domain wechseln',
        samlLogin: {
            title: 'SAML-Login',
            subtitle: `<muted-text>Konfiguriere die Anmeldung von Mitgliedern mit <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO).</a></muted-text>`,
            enableSamlLogin: 'SAML-Anmeldung aktivieren',
            allowMembers: 'Mitgliedern die Anmeldung mit SAML erlauben.',
            requireSamlLogin: 'SAML-Anmeldung erforderlich',
            anyMemberWillBeRequired: 'Jedes Mitglied, das mit einer anderen Methode angemeldet ist, muss sich erneut über SAML authentifizieren.',
            enableError: 'SAML-Aktivierungseinstellung konnte nicht aktualisiert werden',
            requireError: 'SAML-Anforderungseinstellung konnte nicht aktualisiert werden',
        },
        samlConfigurationDetails: {
            title: 'SAML-Konfigurationsdetails',
            subtitle: 'Verwenden Sie diese Details, um SAML einzurichten.',
            identityProviderMetaData: 'Identitätsanbieter-Metadaten',
            entityID: 'Entitäts-ID',
            nameIDFormat: 'ID-Format für Namen',
            loginUrl: 'Login-URL',
            acsUrl: 'ACS-URL (Assertion Consumer Service)',
            logoutUrl: 'Abmelde-URL',
            sloUrl: 'SLO (Single Logout)-URL',
            serviceProviderMetaData: 'Dienstanbieter-Metadaten',
            oktaScimToken: 'Okta-SCIM-Token',
            revealToken: 'Token anzeigen',
            fetchError: 'SAML-Konfigurationsdetails konnten nicht abgerufen werden',
            setMetadataGenericError: 'SAML-Metadaten konnten nicht festgelegt werden',
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
