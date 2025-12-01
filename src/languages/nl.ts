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
import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
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
        count: 'Aantal',
        cancel: 'Annuleren',
        dismiss: 'Verwijderen',
        proceed: 'Doorgaan',
        yes: 'Ja',
        no: 'Nee',
        ok: 'OK',
        notNow: 'Niet nu',
        noThanks: 'Nee, bedankt',
        learnMore: 'Meer informatie',
        buttonConfirm: 'Begrepen',
        name: 'Naam',
        attachment: 'Bijlage',
        attachments: 'Bijlagen',
        center: 'Centrum',
        from: 'Van',
        to: 'Naar',
        in: 'In',
        optional: 'Optioneel',
        new: 'Nieuw',
        search: 'Zoeken',
        reports: 'Rapporten',
        find: 'Zoeken',
        searchWithThreeDots: 'Zoeken...',
        next: 'Volgende',
        previous: 'Vorige',
        goBack: 'Ga terug',
        create: 'Aanmaken',
        add: 'Toevoegen',
        resend: 'Opnieuw verzenden',
        save: 'Opslaan',
        select: 'Selecteer',
        deselect: 'Deselecteer',
        selectMultiple: 'Selecteer meerdere',
        saveChanges: 'Wijzigingen opslaan',
        submit: 'Indienen',
        submitted: 'Ingediend',
        rotate: 'Draaien',
        zoom: 'Zoom',
        password: 'Wachtwoord',
        magicCode: 'Verificatiecode',
        twoFactorCode: 'Twee-factor code',
        workspaces: 'Werkruimtes',
        inbox: 'Inbox',
        success: 'Succes',
        group: 'Groep',
        profile: 'Profiel',
        referral: 'Verwijzing',
        payments: 'Betalingen',
        approvals: 'Goedkeuringen',
        wallet: 'Portemonnee',
        preferences: 'Voorkeuren',
        view: 'Bekijken',
        review: (reviewParams?: ReviewParams) => `Review${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Niet',
        signIn: 'Inloggen',
        signInWithGoogle: 'Inloggen met Google',
        signInWithApple: 'Inloggen met Apple',
        signInWith: 'Inloggen met',
        continue: 'Doorgaan',
        firstName: 'Voornaam',
        lastName: 'Achternaam',
        scanning: 'Scannen',
        addCardTermsOfService: 'Expensify Gebruiksvoorwaarden',
        perPerson: 'per persoon',
        phone: 'Telefoon',
        phoneNumber: 'Telefoonnummer',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'E-mail',
        and: 'en',
        or: 'of',
        details: 'Details',
        privacy: 'Privacy',
        privacyPolicy: 'Privacybeleid',
        hidden: 'Verborgen',
        visible: 'Zichtbaar',
        delete: 'Verwijderen',
        archived: 'gearchiveerd',
        contacts: 'Contacten',
        recents: 'Recente',
        close: 'Sluiten',
        comment: 'Opmerking',
        download: 'Downloaden',
        downloading: 'Downloaden',
        uploading: 'Uploaden',
        pin: 'Vastpinnen',
        unPin: 'Losmaken van vastzetten',
        back: 'Terug',
        saveAndContinue: 'Opslaan & doorgaan',
        settings: 'Instellingen',
        termsOfService: 'Servicevoorwaarden',
        members: 'Leden',
        invite: 'Uitnodigen',
        here: 'hier',
        date: 'Datum',
        dob: 'Geboortedatum',
        currentYear: 'Huidig jaar',
        currentMonth: 'Huidige maand',
        ssnLast4: 'Laatste 4 cijfers van SSN',
        ssnFull9: 'Volledige 9 cijfers van SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Adresregel ${lineNumber}`,
        personalAddress: 'Persoonlijk adres',
        companyAddress: 'Bedrijfsadres',
        noPO: 'Geen postbus- of doorstuuradressen, alstublieft.',
        city: 'Stad',
        state: 'Staat',
        streetAddress: 'Straatadres',
        stateOrProvince: 'Staat / Provincie',
        country: 'Land',
        zip: 'Postcode',
        zipPostCode: 'Postcode',
        whatThis: 'Wat is dit?',
        iAcceptThe: 'Ik accepteer de',
        acceptTermsAndPrivacy: `Ik accepteer de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Gebruiksvoorwaarden</a> en <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacybeleid</a>`,
        acceptTermsAndConditions: `Ik accepteer de <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">algemene voorwaarden</a>`,
        acceptTermsOfService: `Ik accepteer de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Gebruiksvoorwaarden</a>`,
        remove: 'Verwijderen',
        admin: 'Admin',
        owner: 'Eigenaar',
        dateFormat: 'YYYY-MM-DD',
        send: 'Verstuur',
        na: 'N/A',
        noResultsFound: 'Geen resultaten gevonden',
        noResultsFoundMatching: (searchString: string) => `Geen resultaten gevonden die overeenkomen met "${searchString}"`,
        recentDestinations: 'Recente bestemmingen',
        timePrefix: 'Het is',
        conjunctionFor: 'voor',
        todayAt: 'Vandaag om',
        tomorrowAt: 'Morgen om',
        yesterdayAt: 'Gisteren om',
        conjunctionAt: 'bij',
        conjunctionTo: 'naar',
        genericErrorMessage: 'Oeps... er is iets misgegaan en uw verzoek kon niet worden voltooid. Probeer het later opnieuw.',
        percentage: 'Percentage',
        error: {
            invalidAmount: 'Ongeldig bedrag',
            acceptTerms: 'U moet de Servicevoorwaarden accepteren om door te gaan',
            phoneNumber: `Voer een volledig telefoonnummer in\n(bijv. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Dit veld is verplicht',
            requestModified: 'Dit verzoek wordt door een ander lid gewijzigd.',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Tekenlimiet overschreden (${length}/${limit})`,
            dateInvalid: 'Selecteer een geldige datum alstublieft',
            invalidDateShouldBeFuture: 'Kies alstublieft vandaag of een toekomstige datum',
            invalidTimeShouldBeFuture: 'Kies alstublieft een tijd minstens één minuut vooruit.',
            invalidCharacter: 'Ongeldig teken',
            enterMerchant: 'Voer een handelsnaam in',
            enterAmount: 'Voer een bedrag in',
            missingMerchantName: 'Ontbrekende naam van handelaar',
            missingAmount: 'Ontbrekend bedrag',
            missingDate: 'Ontbrekende datum',
            enterDate: 'Voer een datum in',
            invalidTimeRange: 'Voer alstublieft een tijd in met behulp van het 12-uurs klokformaat (bijv. 2:30 PM)',
            pleaseCompleteForm: 'Vul alstublieft het bovenstaande formulier in om door te gaan.',
            pleaseSelectOne: 'Selecteer een optie hierboven alstublieft.',
            invalidRateError: 'Voer een geldig tarief in alstublieft',
            lowRateError: 'Tarief moet groter zijn dan 0',
            email: 'Voer een geldig e-mailadres in',
            login: 'Er is een fout opgetreden bij het inloggen. Probeer het opnieuw.',
        },
        comma: 'komma',
        semicolon: 'puntkomma',
        please: 'Alstublieft',
        contactUs: 'neem contact met ons op',
        pleaseEnterEmailOrPhoneNumber: 'Voer alstublieft een e-mailadres of telefoonnummer in',
        fixTheErrors: 'los de fouten',
        inTheFormBeforeContinuing: 'in het formulier voordat u doorgaat',
        confirm: 'Bevestigen',
        reset: 'Opnieuw instellen',
        done: 'Klaar',
        more: 'Meer',
        debitCard: 'Debetkaart',
        bankAccount: 'Bankrekening',
        personalBankAccount: 'Persoonlijke bankrekening',
        businessBankAccount: 'Zakelijke bankrekening',
        join: 'Deelnemen',
        leave: 'Verlaten',
        decline: 'Afwijzen',
        reject: 'Afwijzen',
        transferBalance: 'Saldo overboeken',
        enterManually: 'Voer het handmatig in',
        message: 'Bericht',
        leaveThread: 'Verlaat thread',
        you: 'Jij',
        me: 'mij',
        youAfterPreposition: 'jij',
        your: 'uw',
        conciergeHelp: 'Neem contact op met Concierge voor hulp.',
        youAppearToBeOffline: 'Je lijkt offline te zijn.',
        thisFeatureRequiresInternet: 'Deze functie vereist een actieve internetverbinding.',
        attachmentWillBeAvailableOnceBackOnline: 'Bijlage wordt beschikbaar zodra je weer online bent.',
        errorOccurredWhileTryingToPlayVideo: 'Er is een fout opgetreden bij het afspelen van deze video.',
        areYouSure: 'Weet je het zeker?',
        verify: 'Verifiëren',
        yesContinue: 'Ja, ga verder.',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `e.g. ${zipSampleFormat}` : ''),
        description: 'Beschrijving',
        title: 'Titel',
        assignee: 'Toegewezene',
        createdBy: 'Gemaakt door',
        with: 'met',
        shareCode: 'Deel code',
        share: 'Delen',
        per: 'per',
        mi: 'mijl',
        km: 'kilometer',
        copied: 'Gekopieerd!',
        someone: 'Iemand',
        total: 'Totaal',
        edit: 'Bewerken',
        letsDoThis: `Laten we dit doen!`,
        letsStart: `Laten we beginnen`,
        showMore: 'Meer weergeven',
        merchant: 'Handelaar',
        category: 'Categorie',
        report: 'Rapport',
        billable: 'Factureerbaar',
        nonBillable: 'Niet-factureerbaar',
        tag: 'Tag',
        receipt: 'Bonnetje',
        verified: 'Geverifieerd',
        replace: 'Vervangen',
        distance: 'Afstand',
        mile: 'mijl',
        miles: 'mijlen',
        kilometer: 'kilometer',
        kilometers: 'kilometers',
        recent: 'Recente',
        all: 'Allemaal',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: 'Selecteer een valuta',
        selectSymbolOrCurrency: 'Selecteer een symbool of valuta',
        card: 'Kaart',
        whyDoWeAskForThis: 'Waarom vragen we hierom?',
        required: 'Vereist',
        showing: 'Weergeven',
        of: 'of',
        default: 'Standaard',
        update: 'Bijwerken',
        member: 'Lid',
        auditor: 'Auditor',
        role: 'Rol',
        currency: 'Valuta',
        groupCurrency: 'Groepsvaluta',
        rate: 'Beoordeel',
        emptyLHN: {
            title: 'Woohoo! Helemaal bij.',
            subtitleText1: 'Zoek een chat met behulp van de',
            subtitleText2: 'knop hierboven, of maak iets met behulp van de',
            subtitleText3: 'knop hieronder.',
        },
        businessName: 'Bedrijfsnaam',
        clear: 'Duidelijk',
        type: 'Type',
        action: 'Actie',
        expenses: 'Uitgaven',
        totalSpend: 'Totale uitgaven',
        tax: 'Belasting',
        shared: 'Gedeeld',
        drafts: 'Concepten',
        draft: 'Conceptversie',
        finished: 'Voltooid',
        upgrade: 'Upgrade',
        downgradeWorkspace: 'Werkruimte downgraden',
        companyID: 'Bedrijfs-ID',
        userID: 'Gebruikers-ID',
        disable: 'Uitschakelen',
        export: 'Exporteren',
        initialValue: 'Initiële waarde',
        currentDate: "I'm unable to provide real-time information, including the current date. Please check your device or calendar for the current date.",
        value: 'Waarde',
        downloadFailedTitle: 'Download mislukt',
        downloadFailedDescription: 'Je download kon niet worden voltooid. Probeer het later opnieuw.',
        filterLogs: 'Logboeken filteren',
        network: 'Netwerk',
        reportID: 'Rapport-ID',
        longID: 'Lang ID',
        withdrawalID: 'Opname-ID',
        bankAccounts: 'Bankrekeningen',
        chooseFile: 'Bestand kiezen',
        chooseFiles: 'Bestanden kiezen',
        dropTitle: 'Laat het gaan',
        dropMessage: 'Sleep hier je bestand in.',
        ignore: 'Negeren',
        enabled: 'Ingeschakeld',
        disabled: 'Uitgeschakeld',
        import: 'Importeren',
        offlinePrompt: 'Je kunt deze actie nu niet uitvoeren.',
        outstanding: 'Openstaand',
        chats: 'Chats',
        tasks: 'Taken',
        unread: 'Ongelezen',
        sent: 'Verzonden',
        links: 'Links',
        day: 'dag',
        days: 'dagen',
        rename: 'Hernoemen',
        address: 'Adres',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Overslaan',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) => `Iets specifieks nodig? Chat met je accountmanager, ${accountManagerDisplayName}.`,
        chatNow: 'Nu chatten',
        workEmail: 'Werk e-mailadres',
        destination: 'Bestemming',
        subrate: 'Subtarief',
        perDiem: 'Per diem',
        validate: 'Valideren',
        downloadAsPDF: 'Downloaden als PDF',
        downloadAsCSV: 'Downloaden als CSV',
        help: 'Help',
        expenseReport: 'Onkostennota',
        expenseReports: "Onkostennota's",
        leaveWorkspace: 'Werkruimte verlaten',
        leaveWorkspaceConfirmation: 'Als je deze werkruimte verlaat, kun je er geen declaraties meer bij indienen.',
        leaveWorkspaceConfirmationAuditor: 'Als je deze werkruimte verlaat, kun je de rapporten en instellingen ervan niet meer bekijken.',
        leaveWorkspaceConfirmationAdmin: 'Als je deze werkruimte verlaat, kun je de instellingen niet meer beheren.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Als je deze werkruimte verlaat, word je in de goedkeuringsworkflow vervangen door ${workspaceOwner}, de eigenaar van de werkruimte.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Als je deze werkruimte verlaat, word je als voorkeursexporteur vervangen door ${workspaceOwner}, de eigenaar van de werkruimte.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Als je deze werkruimte verlaat, word je als technisch contactpersoon vervangen door ${workspaceOwner}, de eigenaar van de werkruimte.`,
        leaveWorkspaceReimburser:
            'Je kunt deze werkruimte niet verlaten als de uitbetaler. Stel een nieuwe uitbetaler in via Workspaces > Make or track payments en probeer het daarna opnieuw.',
        rateOutOfPolicy: 'Tarief buiten beleid',
        reimbursable: 'Vergoedbaar',
        editYourProfile: 'Bewerk je profiel',
        comments: 'Opmerkingen',
        sharedIn: 'Gedeeld in',
        unreported: 'Niet gerapporteerd',
        explore: 'Verkennen',
        todo: 'Te doen',
        invoice: 'Factuur',
        expense: 'Uitgave',
        chat: 'Chat',
        task: 'Taak',
        trip: 'Reis',
        apply: 'Toepassen',
        status: 'Status',
        on: 'Aan',
        before: 'Voordat',
        after: 'Na',
        reschedule: 'Opnieuw plannen',
        general: 'Algemeen',
        workspacesTabTitle: 'Werkruimtes',
        headsUp: 'Let op!',
        submitTo: 'Sturen naar',
        forwardTo: 'Doorsturen naar',
        merge: 'Samenvoegen',
        none: 'Geen',
        unstableInternetConnection: 'Onstabiele internetverbinding. Controleer je netwerk en probeer het opnieuw.',
        enableGlobalReimbursements: 'Wereldwijde terugbetalingen inschakelen',
        purchaseAmount: 'Aankoopbedrag',
        frequency: 'Frequentie',
        link: 'Link',
        pinned: 'Vastgezet',
        read: 'Gelezen',
        copyToClipboard: 'Kopiëren naar klembord',
        thisIsTakingLongerThanExpected: 'Dit duurt langer dan verwacht...',
        domains: 'Domeinen',
        reportName: 'Rapportnaam',
        showLess: 'Minder weergeven',
        actionRequired: 'Actie vereist',
    },
    supportalNoAccess: {
        title: 'Niet zo snel',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `U bent niet gemachtigd om deze actie uit te voeren wanneer ondersteuning is ingelogd (opdracht: ${command ?? ''}). Als u denkt dat Success deze actie zou moeten kunnen uitvoeren, start dan een gesprek in Slack.`,
    },
    lockedAccount: {
        title: 'Geblokkeerd account',
        description: 'Je mag deze actie niet voltooien omdat dit account is vergrendeld. Neem contact op met concierge@expensify.com voor de volgende stappen.',
    },
    location: {
        useCurrent: 'Huidige locatie gebruiken',
        notFound: 'We konden uw locatie niet vinden. Probeer het opnieuw of voer handmatig een adres in.',
        permissionDenied: 'Het lijkt erop dat je de toegang tot je locatie hebt geweigerd.',
        please: 'Alstublieft',
        allowPermission: 'locatietoegang toestaan in instellingen',
        tryAgain: 'en probeer het opnieuw.',
    },
    contact: {
        importContacts: 'Contactpersonen importeren',
        importContactsTitle: 'Importeer uw contacten',
        importContactsText: 'Importeer contacten van je telefoon zodat je favoriete mensen altijd binnen handbereik zijn.',
        importContactsExplanation: 'zodat je favoriete mensen altijd binnen handbereik zijn.',
        importContactsNativeText: 'Nog één stap! Geef ons toestemming om je contacten te importeren.',
    },
    anonymousReportFooter: {
        logoTagline: 'Doe mee aan de discussie.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Camera toegang',
        expensifyDoesNotHaveAccessToCamera: "Expensify kan geen foto's maken zonder toegang tot je camera. Tik op instellingen om de machtigingen bij te werken.",
        attachmentError: 'Bijlagefout',
        errorWhileSelectingAttachment: 'Er is een fout opgetreden bij het selecteren van een bijlage. Probeer het opnieuw.',
        errorWhileSelectingCorruptedAttachment: 'Er is een fout opgetreden bij het selecteren van een beschadigde bijlage. Probeer een ander bestand.',
        takePhoto: 'Foto maken',
        chooseFromGallery: 'Kies uit galerij',
        chooseDocument: 'Bestand kiezen',
        attachmentTooLarge: 'Bijlage is te groot',
        sizeExceeded: 'Bijlagegrootte is groter dan de limiet van 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `De bijlage is groter dan de limiet van ${maxUploadSizeInMB} MB.`,
        attachmentTooSmall: 'Bijlage is te klein',
        sizeNotMet: 'Bijlagegrootte moet groter zijn dan 240 bytes',
        wrongFileType: 'Ongeldig bestandstype',
        notAllowedExtension: 'Dit bestandstype is niet toegestaan. Probeer een ander bestandstype.',
        folderNotAllowedMessage: 'Het uploaden van een map is niet toegestaan. Probeer een ander bestand.',
        protectedPDFNotSupported: 'Met een wachtwoord beveiligde PDF wordt niet ondersteund',
        attachmentImageResized: 'Deze afbeelding is verkleind voor voorbeeldweergave. Download voor volledige resolutie.',
        attachmentImageTooLarge: 'Deze afbeelding is te groot om te bekijken voordat deze wordt geüpload.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `U kunt maximaal ${fileLimit} bestanden tegelijk uploaden.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Bestanden overschrijden ${maxUploadSizeInMB} MB. Probeer het opnieuw.`,
        someFilesCantBeUploaded: 'Sommige bestanden kunnen niet worden geüpload',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Bestanden moeten kleiner zijn dan ${maxUploadSizeInMB} MB. Grotere bestanden worden niet geüpload.`,
        maxFileLimitExceeded: "U kunt maximaal 30 bonnetjes tegelijk uploaden. Extra's worden niet geüpload.",
        unsupportedFileType: ({fileType}: FileTypeParams) => `${fileType} bestanden worden niet ondersteund. Alleen ondersteunde bestandstypen worden geüpload.`,
        learnMoreAboutSupportedFiles: 'Meer informatie over ondersteunde formaten.',
        passwordProtected: "Met wachtwoord beveiligde PDF's worden niet ondersteund. Alleen ondersteunde bestanden worden geüpload.",
    },
    dropzone: {
        addAttachments: 'Bijlagen toevoegen',
        addReceipt: 'Bon toevoegen',
        scanReceipts: 'Bonnen scannen',
        replaceReceipt: 'Bon vervangen',
    },
    filePicker: {
        fileError: 'Bestandsfout',
        errorWhileSelectingFile: 'Er is een fout opgetreden bij het selecteren van een bestand. Probeer het opnieuw.',
    },
    connectionComplete: {
        title: 'Verbinding voltooid',
        supportingText: 'Je kunt dit venster sluiten en teruggaan naar de Expensify-app.',
    },
    avatarCropModal: {
        title: 'Foto bewerken',
        description: 'Sleep, zoom en roteer je afbeelding zoals je wilt.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Geen extensie gevonden voor mime-type',
        problemGettingImageYouPasted: 'Er was een probleem bij het ophalen van de afbeelding die je hebt geplakt.',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `De maximale lengte van een opmerking is ${formattedMaxLength} tekens.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `De maximale lengte van een taaknaam is ${formattedMaxLength} tekens.`,
    },
    baseUpdateAppModal: {
        updateApp: 'App bijwerken',
        updatePrompt: 'Er is een nieuwe versie van deze app beschikbaar.  \nWerk nu bij of start de app later opnieuw om de laatste wijzigingen te downloaden.',
    },
    deeplinkWrapper: {
        launching: 'Expensify starten',
        expired: 'Je sessie is verlopen.',
        signIn: 'Log alstublieft opnieuw in.',
        redirectedToDesktopApp: 'We hebben je omgeleid naar de desktop-app.',
        youCanAlso: 'Je kunt ook',
        openLinkInBrowser: 'open deze link in je browser',
        loggedInAs: ({email}: LoggedInAsParams) => `Je bent ingelogd als ${email}. Klik op "Link openen" in de prompt om in te loggen in de desktop-app met dit account.`,
        doNotSeePrompt: 'Kan je de prompt niet zien?',
        tryAgain: 'Probeer het opnieuw',
        or: ', of',
        continueInWeb: 'doorgaan naar de webapp',
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abracadabra,
            je bent ingelogd!
        `),
        successfulSignInDescription: 'Ga terug naar je oorspronkelijke tabblad om verder te gaan.',
        title: 'Hier is je magische code',
        description: dedent(`
            Voer de code in vanaf het apparaat
            waarop deze oorspronkelijk is aangevraagd
        `),
        doNotShare: dedent(`
            Deel je code met niemand.
            Expensify zal er nooit om vragen!
        `),
        or: ', of',
        signInHere: 'gewoon hier inloggen',
        expiredCodeTitle: 'Magische code verlopen',
        expiredCodeDescription: 'Ga terug naar het originele apparaat en vraag een nieuwe code aan.',
        successfulNewCodeRequest: 'Code aangevraagd. Controleer uw apparaat.',
        tfaRequiredTitle: dedent(`
            Twee-factor-authenticatie
            vereist
        `),
        tfaRequiredDescription: dedent(`
            Voer de twee-factorauthenticatiecode in
            op de plek waar je probeert in te loggen.
        `),
        requestOneHere: 'vraag er hier een aan.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Betaald door',
        whatsItFor: 'Waar is het voor?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Naam, e-mail of telefoonnummer',
        findMember: 'Zoek een lid',
        searchForSomeone: 'Zoek iemand',
    },
    customApprovalWorkflow: {
        title: 'Aangepaste goedkeuringsworkflow',
        description: 'Uw bedrijf heeft een aangepaste goedkeuringsworkflow voor deze werkruimte. Voer deze actie uit in Expensify Classic',
        goToExpensifyClassic: 'Overschakelen naar Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Dien een uitgave in, verwijs uw team',
            subtitleText: 'Wil je dat je team ook Expensify gebruikt? Dien gewoon een onkostendeclaratie bij hen in en wij doen de rest.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Boek een gesprek',
    },
    hello: 'Hallo',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Begin hieronder.',
        anotherLoginPageIsOpen: 'Er is een andere inlogpagina geopend.',
        anotherLoginPageIsOpenExplanation: 'Je hebt de inlogpagina in een apart tabblad geopend. Log alstublieft in vanaf dat tabblad.',
        welcome: 'Welkom!',
        welcomeWithoutExclamation: 'Welkom',
        phrase2: 'Geld praat. En nu chat en betalingen op één plek zijn, is het ook gemakkelijk.',
        phrase3: 'Uw betalingen komen net zo snel bij u aan als dat u uw punt kunt overbrengen.',
        enterPassword: 'Voer uw wachtwoord in, alstublieft',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, het is altijd leuk om een nieuw gezicht hier te zien!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Voer de magische code in die naar ${login} is gestuurd. Deze zou binnen een minuut of twee moeten arriveren.`,
    },
    login: {
        hero: {
            header: 'Reizen en uitgaven, met de snelheid van chat',
            body: 'Welkom bij de volgende generatie van Expensify, waar uw reizen en uitgaven sneller verlopen met behulp van contextuele, realtime chat.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Je bent al ingelogd als ${email}.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Wil je niet inloggen met ${provider}?`,
        continueWithMyCurrentSession: 'Doorgaan met mijn huidige sessie',
        redirectToDesktopMessage: 'We leiden je naar de desktop-app zodra je bent ingelogd.',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Doorgaan met inloggen via single sign-on:',
        orContinueWithMagicCode: 'Je kunt ook inloggen met een magische code.',
        useSingleSignOn: 'Gebruik single sign-on',
        useMagicCode: 'Gebruik magische code',
        launching: 'Starten...',
        oneMoment: 'Een ogenblik terwijl we u doorverwijzen naar het single sign-on portal van uw bedrijf.',
    },
    reportActionCompose: {
        dropToUpload: 'Sleep om te uploaden',
        sendAttachment: 'Bijlage verzenden',
        addAttachment: 'Bijlage toevoegen',
        writeSomething: 'Schrijf iets...',
        blockedFromConcierge: 'Communicatie is geblokkeerd',
        fileUploadFailed: 'Upload mislukt. Bestand wordt niet ondersteund.',
        localTime: ({user, time}: LocalTimeParams) => `Het is ${time} voor ${user}`,
        edited: '(bewerkt)',
        emoji: 'Emoji',
        collapse: 'Samenvouwen',
        expand: 'Uitbreiden',
    },
    reportActionContextMenu: {
        copyMessage: 'Bericht kopiëren',
        copied: 'Gekopieerd!',
        copyLink: 'Kopieer link',
        copyURLToClipboard: 'Kopieer URL naar klembord',
        copyEmailToClipboard: 'Kopieer e-mail naar klembord',
        markAsUnread: 'Markeren als ongelezen',
        markAsRead: 'Markeren als gelezen',
        editAction: ({action}: EditActionParams) => `Edit ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'uitgave' : 'opmerking'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'opmerking';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'uitgave';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'rapport';
            }
            return `Verwijder ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'opmerking';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'uitgave';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'rapport';
            }
            return `Weet je zeker dat je deze ${type} wilt verwijderen?`;
        },
        onlyVisible: 'Alleen zichtbaar voor',
        replyInThread: 'Reageer in thread',
        joinThread: 'Deelnemen aan discussie',
        leaveThread: 'Verlaat thread',
        copyOnyxData: 'Kopieer Onyx-gegevens',
        flagAsOffensive: 'Markeren als beledigend',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Reactie toevoegen',
        reactedWith: 'reageerde met',
    },
    reportActionsView: {
        beginningOfArchivedRoom: ({reportName, reportDetailsLink}: BeginningOfArchivedRoomParams) =>
            `Je hebt het feest in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> gemist, er is hier niets te zien.`,
        beginningOfChatHistoryDomainRoom: ({domainRoom}: BeginningOfChatHistoryDomainRoomParams) =>
            `Deze chat is voor alle Expensify-leden op het <strong>${domainRoom}</strong>-domein. Gebruik het om te chatten met collega's, tips te delen en vragen te stellen.`,
        beginningOfChatHistoryAdminRoom: ({workspaceName}: BeginningOfChatHistoryAdminRoomParams) =>
            `Deze chat is met <strong>${workspaceName}</strong> admin. Gebruik het om te chatten over het instellen van werkruimten en meer.`,
        beginningOfChatHistoryAnnounceRoom: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomParams) =>
            `Deze chat is voor iedereen in <strong>${workspaceName}</strong>. Gebruik het voor de belangrijkste aankondigingen.`,
        beginningOfChatHistoryUserRoom: ({reportName, reportDetailsLink}: BeginningOfChatHistoryUserRoomParams) =>
            `Deze chatroom is voor alles wat met <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> te maken heeft.`,
        beginningOfChatHistoryInvoiceRoom: ({invoicePayer, invoiceReceiver}: BeginningOfChatHistoryInvoiceRoomParams) =>
            `Deze chat is voor facturen tussen <strong>${invoicePayer}</strong> en <strong>${invoiceReceiver}</strong>. Gebruik de + knop om een factuur te sturen.`,
        beginningOfChatHistory: 'Deze chat is met',
        beginningOfChatHistoryPolicyExpenseChat: ({workspaceName, submitterDisplayName}: BeginningOfChatHistoryPolicyExpenseChatParams) =>
            `Dit is waar <strong>${submitterDisplayName}</strong> kosten zal indienen bij <strong>${workspaceName}</strong>. Gebruik gewoon de + knop.`,
        beginningOfChatHistorySelfDM: 'Dit is je persoonlijke ruimte. Gebruik het voor notities, taken, concepten en herinneringen.',
        beginningOfChatHistorySystemDM: 'Welkom! Laten we je instellen.',
        chatWithAccountManager: 'Chat hier met uw accountmanager',
        sayHello: 'Zeg hallo!',
        yourSpace: 'Uw ruimte',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Welkom bij ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => ` Gebruik de + knop om een uitgave te ${additionalText}.`,
        askConcierge: 'Stel vragen en krijg 24/7 realtime ondersteuning.',
        conciergeSupport: '24/7 ondersteuning',
        create: 'maken',
        iouTypes: {
            pay: 'betalen',
            split: 'split',
            submit: 'indienen',
            track: 'volgen',
            invoice: 'factuur',
        },
    },
    adminOnlyCanPost: 'Alleen beheerders kunnen berichten sturen in deze ruimte.',
    reportAction: {
        asCopilot: 'als copiloot voor',
    },
    mentionSuggestions: {
        hereAlternateText: 'Breng iedereen in dit gesprek op de hoogte',
    },
    newMessages: 'Nieuwe berichten',
    latestMessages: 'Laatste berichten',
    youHaveBeenBanned: 'Opmerking: Je bent verbannen van het chatten in dit kanaal.',
    reportTypingIndicator: {
        isTyping: 'is aan het typen...',
        areTyping: 'zijn aan het typen...',
        multipleMembers: 'Meerdere leden',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Deze chatroom is gearchiveerd.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Deze chat is niet langer actief omdat ${displayName} hun account heeft gesloten.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Deze chat is niet langer actief omdat ${oldDisplayName} hun account heeft samengevoegd met ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Deze chat is niet langer actief omdat <strong>u</strong> geen lid meer bent van de ${policyName} werkruimte.`
                : `Deze chat is niet langer actief omdat ${displayName} geen lid meer is van de ${policyName} werkruimte.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Deze chat is niet langer actief omdat ${policyName} niet langer een actieve werkruimte is.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Deze chat is niet langer actief omdat ${policyName} niet langer een actieve werkruimte is.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Deze boeking is gearchiveerd.',
    },
    writeCapabilityPage: {
        label: 'Wie kan plaatsen',
        writeCapability: {
            all: 'Alle leden',
            admins: 'Alleen beheerders',
        },
    },
    sidebarScreen: {
        buttonFind: 'Zoek iets...',
        buttonMySettings: 'Mijn instellingen',
        fabNewChat: 'Chat starten',
        fabNewChatExplained: 'Start chat (Zwevende actie)',
        fabScanReceiptExplained: 'Bon scannen (Zwevende actie)',
        chatPinned: 'Chat vastgezet',
        draftedMessage: 'Opgesteld bericht',
        listOfChatMessages: 'Lijst van chatberichten',
        listOfChats: 'Lijst van chats',
        saveTheWorld: 'Red de wereld',
        tooltip: 'Begin hier!',
        redirectToExpensifyClassicModal: {
            title: 'Binnenkort beschikbaar',
            description: 'We zijn nog een paar onderdelen van New Expensify aan het verfijnen om aan uw specifieke setup te voldoen. Ga in de tussentijd naar Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Abonnement',
        domains: 'Domeinen',
    },
    tabSelector: {
        chat: 'Chat',
        room: 'Kamer',
        distance: 'Afstand',
        manual: 'Handleiding',
        scan: 'Scannen',
        map: 'Kaart',
    },
    spreadsheet: {
        upload: 'Upload een spreadsheet',
        import: 'Spreadsheet importeren',
        dragAndDrop: '<muted-link>Sleep uw spreadsheet hierheen, of kies een bestand hieronder. Ondersteunde formaten: .csv, .txt, .xls, en .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Sleep uw spreadsheet hierheen, of kies een bestand hieronder. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Lees meer</a> over ondersteunde bestandsformaten.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Selecteer een spreadsheetbestand om te importeren. Ondersteunde formaten: .csv, .txt, .xls, en .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Selecteer een spreadsheetbestand om te importeren. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Lees meer</a> over ondersteunde bestandsformaten.</muted-link>`,
        fileContainsHeader: 'Bestand bevat kolomkoppen',
        column: ({name}: SpreadSheetColumnParams) => `Kolom ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `Oeps! Een verplicht veld ("${fieldName}") is niet toegewezen. Controleer het en probeer het opnieuw.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) =>
            `Oeps! Je hebt een enkel veld ("${fieldName}") aan meerdere kolommen gekoppeld. Controleer dit en probeer het opnieuw.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `Oeps! Het veld ("${fieldName}") bevat een of meer lege waarden. Controleer en probeer het opnieuw.`,
        importSuccessfulTitle: 'Import succesvol',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) => (categories > 1 ? `${categories} categorieën zijn toegevoegd.` : '1 categorie is toegevoegd.'),
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return 'Er zijn geen leden toegevoegd of bijgewerkt.';
            }
            if (added && updated) {
                return `${added} lid${added > 1 ? 's' : ''} toegevoegd, ${updated} lid${updated > 1 ? 's' : ''} bijgewerkt.`;
            }
            if (updated) {
                return updated > 1 ? `${updated} leden zijn bijgewerkt.` : '1 lid is bijgewerkt.';
            }
            return added > 1 ? `${added} leden zijn toegevoegd.` : '1 lid is toegevoegd.';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `${tags} tags zijn toegevoegd.` : '1 tag is toegevoegd.'),
        importMultiLevelTagsSuccessfulDescription: 'Tags op meerdere niveaus zijn toegevoegd.',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `${rates} per diem tarieven zijn toegevoegd.` : '1 dagvergoeding is toegevoegd.',
        importFailedTitle: 'Importeren mislukt',
        importFailedDescription: 'Zorg ervoor dat alle velden correct zijn ingevuld en probeer het opnieuw. Als het probleem aanhoudt, neem dan contact op met Concierge.',
        importDescription: 'Kies welke velden u wilt koppelen vanuit uw spreadsheet door op de vervolgkeuzelijst naast elke geïmporteerde kolom hieronder te klikken.',
        sizeNotMet: 'Bestandsgrootte moet groter zijn dan 0 bytes',
        invalidFileMessage:
            'Het bestand dat u heeft geüpload is ofwel leeg of bevat ongeldige gegevens. Zorg ervoor dat het bestand correct is opgemaakt en de benodigde informatie bevat voordat u het opnieuw uploadt.',
        importSpreadsheetLibraryError: 'Spreadsheet-module laden mislukt. Controleer uw internetverbinding en probeer het opnieuw.',
        importSpreadsheet: 'Spreadsheet importeren',
        downloadCSV: 'CSV downloaden',
        importMemberConfirmation: () => ({
            one: `Bevestig hieronder de gegevens voor een nieuw werkruimte-lid dat via deze upload wordt toegevoegd. Bestaande leden ontvangen geen rolupdates of uitnodigingsberichten.`,
            other: (count: number) =>
                `Bevestig hieronder de gegevens voor de ${count} nieuwe werkruimte-leden die via deze upload worden toegevoegd. Bestaande leden ontvangen geen rolupdates of uitnodigingsberichten.`,
        }),
    },
    receipt: {
        upload: 'Bonnetje uploaden',
        uploadMultiple: 'Bonnetjes uploaden',
        desktopSubtitleSingle: `of sleep het hierheen`,
        desktopSubtitleMultiple: `of sleep ze hierheen`,
        alternativeMethodsTitle: 'Andere manieren om bonnetjes toe te voegen:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">Download de app</a> om met je telefoon te scannen</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Stuur bonnetjes door naar <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Voeg je nummer toe</a> om bonnetjes te sms’en naar ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Sms bonnetjes naar ${phoneNumber} (alleen VS-nummers)</label-text>`,
        takePhoto: 'Maak een foto',
        cameraAccess: "Cameratoegang is vereist om foto's van bonnetjes te maken.",
        deniedCameraAccess: `Camera-toegang is nog steeds niet verleend, volg alstublieft <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">deze instructies</a>.`,
        cameraErrorTitle: 'Camera fout',
        cameraErrorMessage: 'Er is een fout opgetreden bij het maken van een foto. Probeer het opnieuw.',
        locationAccessTitle: 'Locatietoegang toestaan',
        locationAccessMessage: 'Locatietoegang helpt ons om uw tijdzone en valuta nauwkeurig te houden, waar u ook gaat.',
        locationErrorTitle: 'Locatietoegang toestaan',
        locationErrorMessage: 'Locatietoegang helpt ons om uw tijdzone en valuta nauwkeurig te houden, waar u ook gaat.',
        allowLocationFromSetting: `Locatietoegang helpt ons om uw tijdzone en valuta nauwkeurig te houden, waar u ook gaat. Sta locatietoegang toe in de machtigingsinstellingen van uw apparaat.`,
        dropTitle: 'Laat het gaan',
        dropMessage: 'Sleep hier je bestand in.',
        flash: 'flits',
        multiScan: 'multi-scan',
        shutter: 'sluiter',
        gallery: 'galerij',
        deleteReceipt: 'Verwijder bonnetje',
        deleteConfirmation: 'Weet je zeker dat je dit bonnetje wilt verwijderen?',
        addReceipt: 'Bon toevoegen',
        scanFailed: 'De bon kon niet worden gescand omdat de handelaar, datum of het bedrag ontbreekt.',
    },
    quickAction: {
        scanReceipt: 'Scan bonnetje',
        recordDistance: 'Afstand bijhouden',
        requestMoney: 'Uitgave aanmaken',
        perDiem: 'Dagvergoeding aanmaken',
        splitBill: 'Uitgave splitsen',
        splitScan: 'Bon delen',
        splitDistance: 'Afstand splitsen',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Betaal ${name ?? 'iemand'}`,
        assignTask: 'Taak toewijzen',
        header: 'Snelle actie',
        noLongerHaveReportAccess: 'Je hebt geen toegang meer tot je vorige snelle actiebestemming. Kies hieronder een nieuwe.',
        updateDestination: 'Bestemming bijwerken',
        createReport: 'Rapport maken',
    },
    iou: {
        amount: 'Bedrag',
        taxAmount: 'Belastingbedrag',
        taxRate: 'Belastingtarief',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `Goedkeuren ${formattedAmount}` : 'Goedkeuren'),
        approved: 'Goedgekeurd',
        cash: 'Contant',
        card: 'Kaart',
        original: 'Origineel',
        split: 'Splitsen',
        splitExpense: 'Uitgave splitsen',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} van ${merchant}`,
        addSplit: 'Splits toevoegen',
        makeSplitsEven: 'Verdelingen gelijk maken',
        editSplits: 'Splits bewerken',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Het totale bedrag is ${amount} meer dan de oorspronkelijke uitgave.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Het totale bedrag is ${amount} minder dan de oorspronkelijke uitgave.`,
        splitExpenseZeroAmount: 'Voer een geldig bedrag in voordat u doorgaat.',
        splitExpenseOneMoreSplit: 'Geen splitsing toegevoegd. Voeg er ten minste één toe om op te slaan.',
        splitExpenseCannotBeEditedModalTitle: 'Deze uitgave kan niet worden bewerkt',
        splitExpenseCannotBeEditedModalDescription: 'Goedgekeurde of betaalde uitgaven kunnen niet worden bewerkt',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Bewerk ${amount} voor ${merchant}`,
        removeSplit: 'Verwijder splitsing',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Betaal ${name ?? 'iemand'}`,
        expense: 'Uitgave',
        categorize: 'Categoriseren',
        share: 'Delen',
        participants: 'Deelnemers',
        createExpense: 'Uitgave aanmaken',
        trackDistance: 'Afstand bijhouden',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `Maak ${expensesNumber} uitgaven aan`,
        removeExpense: 'Uitgave verwijderen',
        removeThisExpense: 'Deze uitgave verwijderen',
        removeExpenseConfirmation: 'Weet je zeker dat je dit bonnetje wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
        addExpense: 'Uitgave toevoegen',
        chooseRecipient: 'Kies ontvanger',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Maak ${amount} uitgave aan`,
        confirmDetails: 'Bevestig gegevens',
        pay: 'Betalen',
        cancelPayment: 'Betaling annuleren',
        cancelPaymentConfirmation: 'Weet je zeker dat je deze betaling wilt annuleren?',
        viewDetails: 'Details bekijken',
        pending: 'In behandeling',
        canceled: 'Geannuleerd',
        posted: 'Geplaatst',
        deleteReceipt: 'Verwijder bonnetje',
        findExpense: 'Uitgave zoeken',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `verwijderde een uitgave (${amount} voor ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `verplaatste een uitgave${reportName ? `van ${reportName}` : ''}`,
        movedTransaction: ({reportUrl, reportName}: MovedTransactionParams) => `heeft deze uitgave verplaatst${reportName ? `naar <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `heeft deze uitgave naar uw <a href="${reportUrl}">persoonlijke ruimte</a> verplaatst`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `heeft dit rapport verplaatst naar de <a href="${newParentReportUrl}">${toPolicyName}</a> werkruimte`;
            }
            return `heeft dit <a href="${movedReportUrl}">rapport</a> verplaatst naar de <a href="${newParentReportUrl}">${toPolicyName}</a> werkruimte`;
        },
        pendingMatchWithCreditCard: 'Bon is in afwachting van een overeenkomst met kaarttransactie',
        pendingMatch: 'In afwachting van overeenkomst',
        pendingMatchWithCreditCardDescription: 'Ontvangst in afwachting van overeenkomst met kaarttransactie. Markeer als contant om te annuleren.',
        markAsCash: 'Als contant markeren',
        routePending: 'Route in behandeling...',
        receiptScanning: () => ({
            one: 'Bonnetjes scannen...',
            other: 'Bonnen scannen...',
        }),
        scanMultipleReceipts: 'Scan meerdere bonnen',
        scanMultipleReceiptsDescription: "Maak foto's van al je bonnetjes tegelijk, bevestig dan zelf de details of laat SmartScan het afhandelen.",
        receiptScanInProgress: 'Bon scannen bezig',
        receiptScanInProgressDescription: 'Bon scannen bezig. Kom later terug of voer de gegevens nu in.',
        removeFromReport: 'Verwijder uit rapport',
        moveToPersonalSpace: 'Verplaats uitgaven naar persoonlijke ruimte',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? 'Potentiële dubbele uitgaven geïdentificeerd. Controleer duplicaten om indiening mogelijk te maken.'
                : 'Potentiële dubbele uitgaven geïdentificeerd. Controleer duplicaten om goedkeuring mogelijk te maken.',
        receiptIssuesFound: () => ({
            one: 'Probleem gevonden',
            other: 'Problemen gevonden',
        }),
        fieldPending: 'In afwachting...',
        defaultRate: 'Standaardtarief',
        receiptMissingDetails: 'Ontbrekende gegevens op bon',
        missingAmount: 'Ontbrekend bedrag',
        missingMerchant: 'Ontbrekende handelaar',
        receiptStatusTitle: 'Scannen…',
        receiptStatusText: 'Alleen jij kunt deze bon zien tijdens het scannen. Kom later terug of voer de gegevens nu in.',
        receiptScanningFailed: 'Het scannen van het bonnetje is mislukt. Voer de gegevens handmatig in.',
        transactionPendingDescription: 'Transactie in behandeling. Het kan enkele dagen duren voordat deze is verwerkt.',
        companyInfo: 'Bedrijfsinformatie',
        companyInfoDescription: 'We hebben nog een paar details nodig voordat je je eerste factuur kunt verzenden.',
        yourCompanyName: 'Uw bedrijfsnaam',
        yourCompanyWebsite: 'De website van uw bedrijf',
        yourCompanyWebsiteNote: 'Als u geen website heeft, kunt u in plaats daarvan het LinkedIn-profiel of sociale media-profiel van uw bedrijf opgeven.',
        invalidDomainError: 'U heeft een ongeldig domein ingevoerd. Voer een geldig domein in om door te gaan.',
        publicDomainError: 'U bevindt zich in een openbare domein. Om door te gaan, voert u een privé domein in.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} scannen`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} in behandeling`);
            }
            return {
                one: statusText.length > 0 ? `1 uitgave (${statusText.join(', ')})` : `1 uitgave`,
                other: (count: number) => (statusText.length > 0 ? `${count} uitgaven (${statusText.join(', ')})` : `${count} uitgaven`),
            };
        },
        expenseCount: () => {
            return {
                one: '1 uitgave',
                other: (count: number) => `${count} uitgaven`,
            };
        },
        deleteExpense: () => ({
            one: 'Verwijder uitgave',
            other: 'Verwijder uitgaven',
        }),
        deleteConfirmation: () => ({
            one: 'Weet je zeker dat je deze uitgave wilt verwijderen?',
            other: 'Weet je zeker dat je deze uitgaven wilt verwijderen?',
        }),
        deleteReport: 'Rapport verwijderen',
        deleteReportConfirmation: 'Weet u zeker dat u dit rapport wilt verwijderen?',
        settledExpensify: 'Betaald',
        done: 'Klaar',
        settledElsewhere: 'Elders betaald',
        individual: 'Individuueel',
        business: 'Business',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Betaal ${formattedAmount} met Expensify` : `Betaal met Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Betaal ${formattedAmount} als individu` : `Betalen met persoonlijke rekening`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Betaal ${formattedAmount} met wallet` : `Betalen met wallet`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Betaal ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Betaal ${formattedAmount} als bedrijf` : `Betalen met zakelijke rekening`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als betaald markeren` : `Markeren als betaald`),
        settleInvoicePersonal: ({amount, last4Digits}: BusinessBankAccountParams) =>
            amount ? `${amount} betaald met persoonlijke rekening ${last4Digits}` : `Betaald met persoonlijke rekening`,
        settleInvoiceBusiness: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `${amount} betaald met zakelijke rekening ${last4Digits}` : `Betaald met zakelijke rekening`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Betaal ${formattedAmount} via ${policyName}` : `Betalen via ${policyName}`),
        businessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `${amount} betaald via bankrekening ${last4Digits}` : `betaald via bankrekening ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            `${amount} betaald met bankrekening eindigend op ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimte regels</a>`,
        invoicePersonalBank: ({lastFour}: BankAccountLastFourParams) => `Persoonlijke rekening • ${lastFour}`,
        invoiceBusinessBank: ({lastFour}: BankAccountLastFourParams) => `Zakelijke rekening • ${lastFour}`,
        nextStep: 'Volgende stappen',
        finished: 'Voltooid',
        flip: 'Omdraaien',
        sendInvoice: ({amount}: RequestAmountParams) => `Verstuur ${amount} factuur`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `voor ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `ingediend${memo ? `, zegt ${memo}` : ''}`,
        automaticallySubmitted: `ingediend via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">vertraging indieningen</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `volgt ${formattedAmount}${comment ? `voor ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `splitsen ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `split ${formattedAmount}${comment ? `voor ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Jouw deel ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} is ${amount}${comment ? `voor ${comment}` : ''} verschuldigd`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} verschuldigd:`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}betaalde ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} heeft betaald:`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} heeft ${amount} uitgegeven`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} heeft uitgegeven:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} goedgekeurd:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} keurde ${amount} goed`,
        payerSettled: ({amount}: PayerSettledParams) => `betaald ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `betaald ${amount}. Voeg een bankrekening toe om uw betaling te ontvangen.`,
        automaticallyApproved: `goedgekeurd via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimteregels</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `goedgekeurd ${amount}`,
        approvedMessage: `goedgekeurd`,
        unapproved: `niet goedgekeurd`,
        automaticallyForwarded: `goedgekeurd via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimteregels</a>`,
        forwarded: `goedgekeurd`,
        rejectedThisReport: 'heeft dit rapport afgewezen',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `is met de betaling begonnen, maar wacht op ${submitterDisplayName} om een bankrekening toe te voegen.`,
        adminCanceledRequest: 'heeft de betaling geannuleerd',
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `heeft de betaling van ${amount} geannuleerd, omdat ${submitterDisplayName} hun Expensify Wallet niet binnen 30 dagen heeft geactiveerd.`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} heeft een bankrekening toegevoegd. De betaling van ${amount} is gedaan.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}gemarkeerd als betaald`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}betaald met wallet`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''}betaald met Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimte regels</a>`,
        noReimbursableExpenses: 'Dit rapport heeft een ongeldig bedrag.',
        pendingConversionMessage: 'Totaal wordt bijgewerkt wanneer je weer online bent.',
        changedTheExpense: 'de uitgave gewijzigd',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `de ${valueName} naar ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `stel het ${translatedChangedField} in op ${newMerchant}, wat het bedrag instelde op ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `de ${valueName} (voorheen ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `de ${valueName} naar ${newValueToDisplay} (voorheen ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `veranderde de ${translatedChangedField} naar ${newMerchant} (voorheen ${oldMerchant}), wat het bedrag bijwerkte naar ${newAmountToDisplay} (voorheen ${oldAmountToDisplay})`,
        basedOnAI: 'op basis van eerdere activiteit',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `op basis van <a href="${rulesLink}">werkruimteregels</a>` : 'gebaseerd op werkruimteregel'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `voor ${comment}` : 'uitgave'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Factuurrapport #${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} verzonden${comment ? `voor ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `verplaatste uitgave van persoonlijke ruimte naar ${workspaceName ?? `chat met ${reportName}`}`,
        movedToPersonalSpace: 'verplaatste uitgave naar persoonlijke ruimte',
        tagSelection: ({policyTagListName}: TagSelectionParams = {}) => `Selecteer ${policyTagListName ?? 'een tag'} om je uitgaven beter te organiseren.`,
        categorySelection: 'Selecteer een categorie om uw uitgaven beter te organiseren.',
        error: {
            invalidCategoryLength: 'De categorienaam overschrijdt 255 tekens. Verkort deze of kies een andere categorie.',
            invalidTagLength: 'De tagnaam overschrijdt 255 tekens. Verkort het of kies een andere tag.',
            invalidAmount: 'Voer een geldig bedrag in voordat u doorgaat.',
            invalidDistance: 'Voer een geldige afstand in voordat u doorgaat.',
            invalidIntegerAmount: 'Voer een heel dollarbedrag in voordat u doorgaat.',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Maximale belastingbedrag is ${amount}`,
            invalidSplit: 'De som van de splitsingen moet gelijk zijn aan het totale bedrag',
            invalidSplitParticipants: 'Voer een bedrag groter dan nul in voor ten minste twee deelnemers.',
            invalidSplitYourself: 'Voer een niet-nul bedrag in voor uw splitsing aub.',
            noParticipantSelected: 'Selecteer een deelnemer alstublieft',
            other: 'Onverwachte fout. Probeer het later opnieuw.',
            genericCreateFailureMessage: 'Onverwachte fout bij het indienen van deze uitgave. Probeer het later opnieuw.',
            genericCreateInvoiceFailureMessage: 'Onverwachte fout bij het verzenden van deze factuur. Probeer het later opnieuw.',
            genericHoldExpenseFailureMessage: 'Onverwachte fout bij het vasthouden van deze uitgave. Probeer het later opnieuw.',
            genericUnholdExpenseFailureMessage: 'Onverwachte fout bij het van hold halen van deze uitgave. Probeer het later opnieuw.',
            receiptDeleteFailureError: 'Onverwachte fout bij het verwijderen van dit ontvangstbewijs. Probeer het later opnieuw.',
            receiptFailureMessage: '<rbr>Er is een fout opgetreden bij het uploaden van uw bon. Bewaar <a href="download">de bon</a> en <a href="retry">probeer het opnieuw</a> later.</rbr>',
            receiptFailureMessageShort: 'Er is een fout opgetreden bij het uploaden van uw bon.',
            genericDeleteFailureMessage: 'Onverwachte fout bij het verwijderen van deze uitgave. Probeer het later opnieuw.',
            genericEditFailureMessage: 'Onverwachte fout bij het bewerken van deze uitgave. Probeer het later opnieuw.',
            genericSmartscanFailureMessage: 'Transactie mist velden',
            duplicateWaypointsErrorMessage: 'Verwijder dubbele waypoints alstublieft.',
            atLeastTwoDifferentWaypoints: 'Voer alstublieft ten minste twee verschillende adressen in.',
            splitExpenseMultipleParticipantsErrorMessage: 'Een uitgave kan niet worden gesplitst tussen een werkruimte en andere leden. Werk uw selectie bij.',
            invalidMerchant: 'Voer een geldige handelaar in alstublieft',
            atLeastOneAttendee: 'Er moet ten minste één deelnemer worden geselecteerd',
            invalidQuantity: 'Voer een geldige hoeveelheid in alstublieft',
            quantityGreaterThanZero: 'Hoeveelheid moet groter zijn dan nul',
            invalidSubrateLength: 'Er moet minstens één subtarief zijn.',
            invalidRate: 'Tarief niet geldig voor deze werkruimte. Selecteer een beschikbaar tarief uit de werkruimte.',
        },
        dismissReceiptError: 'Fout negeren',
        dismissReceiptErrorConfirmation: 'Let op! Als u deze foutmelding negeert, wordt uw geüploade bon volledig verwijderd. Weet u het zeker?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `begon met afrekenen. Betaling is in de wacht totdat ${submitterDisplayName} hun portemonnee inschakelt.`,
        enableWallet: 'Portemonnee inschakelen',
        hold: 'Vasthouden',
        unhold: 'Verwijder blokkering',
        holdExpense: () => ({
            one: 'Uitgave blokkeren',
            other: 'Uitgaven in de wacht zetten',
        }),
        unholdExpense: 'Uitgave deblokkeren',
        heldExpense: 'deze uitgave vastgehouden',
        unheldExpense: 'deblokkeer deze uitgave',
        moveUnreportedExpense: 'Verplaats niet-gerapporteerde uitgave',
        addUnreportedExpense: 'Niet-gerapporteerde uitgave toevoegen',
        selectUnreportedExpense: 'Selecteer ten minste één uitgave om aan het rapport toe te voegen.',
        emptyStateUnreportedExpenseTitle: 'Geen niet-gerapporteerde uitgaven',
        emptyStateUnreportedExpenseSubtitle: 'Het lijkt erop dat je geen niet-gerapporteerde uitgaven hebt. Probeer er hieronder een aan te maken.',
        addUnreportedExpenseConfirm: 'Toevoegen aan rapport',
        newReport: 'Nieuw rapport',
        explainHold: () => ({
            one: 'Leg uit waarom je deze uitgave tegenhoudt.',
            other: 'Leg uit waarom je deze uitgaven in de wacht zet.',
        }),
        retracted: 'ingetrokken',
        retract: 'Intrekken',
        reopened: 'heropend',
        reopenReport: 'Rapport heropenen',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Dit rapport is al geëxporteerd naar ${connectionName}. Het wijzigen ervan kan leiden tot gegevensverschillen. Weet u zeker dat u dit rapport opnieuw wilt openen?`,
        reason: 'Reden',
        holdReasonRequired: 'Een reden is vereist bij het vasthouden.',
        expenseWasPutOnHold: 'Uitgave is in de wacht gezet',
        expenseOnHold: 'Deze uitgave is in de wacht gezet. Bekijk de opmerkingen voor de volgende stappen.',
        expensesOnHold: 'Alle onkosten zijn in de wacht gezet. Controleer de opmerkingen voor de volgende stappen.',
        expenseDuplicate: 'Deze uitgave heeft vergelijkbare details met een andere. Controleer de duplicaten om verder te gaan.',
        someDuplicatesArePaid: 'Sommige van deze duplicaten zijn al goedgekeurd of betaald.',
        reviewDuplicates: 'Duplicaten beoordelen',
        keepAll: 'Alles behouden',
        confirmApprove: 'Bevestig goedkeuringsbedrag',
        confirmApprovalAmount: 'Alleen conforme uitgaven goedkeuren, of het hele rapport goedkeuren.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Deze uitgave is in de wacht. Wil je toch goedkeuren?',
            other: 'Deze uitgaven zijn in de wacht gezet. Wil je ze toch goedkeuren?',
        }),
        confirmPay: 'Bevestig betalingsbedrag',
        confirmPayAmount: 'Betaal wat niet in de wacht staat, of betaal het hele rapport.',
        confirmPayAllHoldAmount: () => ({
            one: 'Deze uitgave is in de wacht gezet. Wil je toch betalen?',
            other: 'Deze uitgaven zijn in de wacht gezet. Wil je toch betalen?',
        }),
        payOnly: 'Alleen betalen',
        approveOnly: 'Alleen goedkeuren',
        holdEducationalTitle: 'Moet u deze uitgave vasthouden?',
        whatIsHoldExplain: 'Vasthouden is als op ‘pauze’ drukken voor een uitgave totdat u klaar bent om deze in te dienen.',
        holdIsLeftBehind: 'Vastgehouden uitgaven blijven achter, zelfs als u een volledig rapport indient.',
        unholdWhenReady: 'Haal uitgaven uit de wachtstand wanneer u klaar bent om ze in te dienen.',
        changePolicyEducational: {
            title: 'Je hebt dit rapport verplaatst!',
            description: 'Controleer deze items dubbel, aangezien ze de neiging hebben te veranderen bij het verplaatsen van rapporten naar een nieuwe werkruimte.',
            reCategorize: '<strong>Her-categoriseer eventuele uitgaven</strong> om te voldoen aan de werkruimteregels.',
            workflows: 'Dit rapport kan nu onderworpen zijn aan een ander <strong>goedkeuringsproces.</strong>',
        },
        changeWorkspace: 'Werkruimte wijzigen',
        set: 'set',
        changed: 'veranderd',
        removed: 'verwijderd',
        transactionPending: 'Transactie in behandeling.',
        chooseARate: 'Selecteer een vergoedingstarief per mijl of kilometer voor de werkruimte',
        unapprove: 'Afkeuren',
        unapproveReport: 'Rapport afkeuren',
        headsUp: 'Let op!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Dit rapport is al geëxporteerd naar ${accountingIntegration}. Het wijzigen ervan kan leiden tot gegevensverschillen. Weet u zeker dat u dit rapport wilt afkeuren?`,
        reimbursable: 'terugbetaalbaar',
        nonReimbursable: 'niet-vergoedbaar',
        bookingPending: 'Deze boeking is in behandeling.',
        bookingPendingDescription: 'Deze boeking is in afwachting omdat deze nog niet is betaald.',
        bookingArchived: 'Deze boeking is gearchiveerd',
        bookingArchivedDescription: 'Deze boeking is gearchiveerd omdat de reisdatum is verstreken. Voeg indien nodig een uitgave toe voor het eindbedrag.',
        attendees: 'Deelnemers',
        whoIsYourAccountant: 'Wie is uw accountant?',
        paymentComplete: 'Betaling voltooid',
        time: 'Tijd',
        startDate: 'Startdatum',
        endDate: 'Einddatum',
        startTime: 'Starttijd',
        endTime: 'Eindtijd',
        deleteSubrate: 'Subtarief verwijderen',
        deleteSubrateConfirmation: 'Weet je zeker dat je dit subtarief wilt verwijderen?',
        quantity: 'Hoeveelheid',
        subrateSelection: 'Selecteer een subtarief en voer een hoeveelheid in.',
        qty: 'Aantal',
        firstDayText: () => ({
            one: `Eerste dag: 1 uur`,
            other: (count: number) => `Eerste dag: ${count.toFixed(2)} uur`,
        }),
        lastDayText: () => ({
            one: `Laatste dag: 1 uur`,
            other: (count: number) => `Laatste dag: ${count.toFixed(2)} uur`,
        }),
        tripLengthText: () => ({
            one: `Reis: 1 volle dag`,
            other: (count: number) => `Reis: ${count} volledige dagen`,
        }),
        dates: 'Datums',
        rates: 'Tarieven',
        submitsTo: ({name}: SubmitsToParams) => `Dient in bij ${name}`,
        moveExpenses: () => ({one: 'Verplaats uitgave', other: 'Verplaats uitgaven'}),
        reject: {
            educationalTitle: 'Moet je vasthouden of afwijzen?',
            educationalText: 'Als je nog niet klaar bent om een uitgave goed te keuren of te betalen, kun je deze vasthouden of afwijzen.',
            holdExpenseTitle: 'Houd een uitgave vast om meer details te vragen voordat je deze goedkeurt of betaalt.',
            approveExpenseTitle: 'Goedkeur andere uitgaven terwijl vastgehouden uitgaven aan jou blijven toegewezen.',
            heldExpenseLeftBehindTitle: 'Vasthouden uitgaven blijven achter wanneer je een volledig rapport goedkeurt.',
            rejectExpenseTitle: 'Wijs een uitgave af die je niet van plan bent goed te keuren of te betalen.',
            reasonPageTitle: 'Uitgave afwijzen',
            reasonPageDescription: 'Leg uit waarom u deze uitgave afwijst.',
            rejectReason: 'Reden van afwijzing',
            markAsResolved: 'Markeren als opgelost',
            rejectedStatus: 'Deze uitgave is afgewezen. Wacht op jou om de problemen op te lossen en als opgelost te markeren om indiening mogelijk te maken.',
            reportActions: {
                rejectedExpense: 'wees deze uitgave af',
                markedAsResolved: 'markeerde de reden van afwijzing als opgelost',
            },
        },
        changeApprover: {
            title: 'Goedkeurder wijzigen',
            subtitle: 'Kies een optie om de goedkeurder voor dit rapport te wijzigen.',
            description: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `U kunt de goedkeurder ook permanent wijzigen voor alle rapporten in uw <a href="${workflowSettingLink}">workflow-instellingen</a>.`,
            changedApproverMessage: ({managerID}: ChangedApproverMessageParams) => `wijzigde de goedkeurder naar <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Goedkeurder toevoegen',
                addApproverSubtitle: 'Voeg een extra goedkeurder toe aan de bestaande workflow.',
                bypassApprovers: 'Goedkeurders omzeilen',
                bypassApproversSubtitle: 'Wijs uzelf toe als definitieve goedkeurder en sla de resterende goedkeurders over.',
            },
            addApprover: {
                subtitle: 'Kies een extra goedkeurder voor dit rapport voordat we het via de rest van de goedkeuringsworkflow sturen.',
            },
        },
        chooseWorkspace: 'Kies een werkruimte',
    },
    transactionMerge: {
        listPage: {
            header: 'Kosten samenvoegen',
            noEligibleExpenseFound: 'Geen in aanmerking komende kosten gevonden',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Je hebt geen kosten die samengevoegd kunnen worden met deze. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Meer informatie</a> over in aanmerking komende kosten.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Selecteer een <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">geschikte kost</a> om te combineren <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: 'Ontvangstbewijs selecteren',
            pageTitle: 'Kies het ontvangstbewijs dat je wilt behouden:',
        },
        detailsPage: {
            header: 'Details selecteren',
            pageTitle: 'Selecteer de details die je wilt behouden:',
            noDifferences: 'Geen verschillen gevonden tussen de transacties',
            pleaseSelectError: ({field}: {field: string}) => `Selecteer een ${field}`,
            pleaseSelectAttendees: 'Selecteer deelnemers',
            selectAllDetailsError: 'Selecteer alle details voordat je doorgaat.',
        },
        confirmationPage: {
            header: 'Bevestig details',
            pageTitle: 'Bevestig de details die je wilt bewaren. Niet bewaarde details worden verwijderd.',
            confirmButton: 'Kosten samenvoegen',
        },
    },
    share: {
        shareToExpensify: 'Delen met Expensify',
        messageInputLabel: 'Bericht',
    },
    notificationPreferencesPage: {
        header: 'Meldingsvoorkeuren',
        label: 'Stel me op de hoogte van nieuwe berichten',
        notificationPreferences: {
            always: 'Onmiddellijk',
            daily: 'Dagelijks',
            mute: 'Dempen',
            hidden: 'Verborgen',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Het nummer is niet gevalideerd. Klik op de knop om de validatielink opnieuw via sms te verzenden.',
        emailHasNotBeenValidated: 'De e-mail is niet gevalideerd. Klik op de knop om de validatielink opnieuw via sms te verzenden.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Foto uploaden',
        removePhoto: 'Foto verwijderen',
        editImage: 'Foto bewerken',
        viewPhoto: 'Foto bekijken',
        imageUploadFailed: 'Afbeeldingsupload mislukt',
        deleteWorkspaceError: 'Sorry, er was een onverwacht probleem bij het verwijderen van je werkruimte-avatar.',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `De geselecteerde afbeelding overschrijdt de maximale uploadgrootte van ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Upload alstublieft een afbeelding die groter is dan ${minHeightInPx}x${minWidthInPx} pixels en kleiner dan ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `Profielfoto moet een van de volgende typen zijn: ${allowedExtensions.join(', ')}.`,
    },
    modal: {
        backdropLabel: 'Modale Achtergrond',
    },
    profilePage: {
        profile: 'Profiel',
        preferredPronouns: 'Voorkeursvoornaamwoorden',
        selectYourPronouns: 'Selecteer je voornaamwoorden',
        selfSelectYourPronoun: 'Selecteer je voornaamwoord zelf',
        emailAddress: 'E-mailadres',
        setMyTimezoneAutomatically: 'Stel mijn tijdzone automatisch in',
        timezone: 'Tijdzone',
        invalidFileMessage: 'Ongeldig bestand. Probeer een andere afbeelding.',
        avatarUploadFailureMessage: 'Er is een fout opgetreden bij het uploaden van de avatar. Probeer het opnieuw.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchroniseren',
        profileAvatar: 'Profielfoto',
        publicSection: {
            title: 'Openbaar',
            subtitle: 'Deze gegevens worden weergegeven op je openbare profiel. Iedereen kan ze zien.',
        },
        privateSection: {
            title: 'Privé',
            subtitle: 'Deze gegevens worden gebruikt voor reizen en betalingen. Ze worden nooit getoond op je openbare profiel.',
        },
    },
    securityPage: {
        title: 'Beveiligingsopties',
        subtitle: 'Schakel authenticatie in twee stappen in om uw account veilig te houden.',
        goToSecurity: 'Ga terug naar de beveiligingspagina',
    },
    shareCodePage: {title: 'Uw code', subtitle: 'Nodig leden uit voor Expensify door je persoonlijke QR-code of verwijzingslink te delen.'},
    pronounsPage: {
        pronouns: 'Voornaamwoorden',
        isShownOnProfile: 'Je voornaamwoorden worden weergegeven op je profiel.',
        placeholderText: 'Zoek om opties te zien',
    },
    contacts: {
        contactMethods: 'Contactmethoden',
        featureRequiresValidate: 'Deze functie vereist dat je je account verifieert.',
        validateAccount: 'Valideer uw account',
        helpText: ({email}: {email: string}) =>
            `Voeg meer manieren toe om in te loggen en bonnetjes naar Expensify te sturen.<br/><br/>Voeg een e-mailadres toe om bonnetjes door te sturen naar <a href="mailto:${email}">${email}</a> of voeg een telefoonnummer toe om bonnetjes te sms’en naar 47777 (alleen Amerikaanse nummers).`,
        pleaseVerify: 'Verifieer deze contactmethode alstublieft.',
        getInTouch: 'We gebruiken deze methode om contact met je op te nemen.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `Voer de magische code in die is verzonden naar ${contactMethod}. Het zou binnen een minuut of twee moeten aankomen.`,
        setAsDefault: 'Instellen als standaard',
        yourDefaultContactMethod:
            'Dit is uw huidige standaard contactmethode. Voordat u deze kunt verwijderen, moet u een andere contactmethode kiezen en op "Instellen als standaard" klikken.',
        removeContactMethod: 'Contactmethode verwijderen',
        removeAreYouSure: 'Weet je zeker dat je deze contactmethode wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
        failedNewContact: 'Kan deze contactmethode niet toevoegen.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Het verzenden van een nieuwe magische code is mislukt. Wacht even en probeer het opnieuw.',
            validateSecondaryLogin: 'Onjuiste of ongeldige magische code. Probeer het opnieuw of vraag een nieuwe code aan.',
            deleteContactMethod: 'Verwijderen van contactmethode mislukt. Neem contact op met Concierge voor hulp.',
            setDefaultContactMethod: 'Het is niet gelukt om een nieuwe standaard contactmethode in te stellen. Neem contact op met Concierge voor hulp.',
            addContactMethod: 'Het is niet gelukt om deze contactmethode toe te voegen. Neem contact op met Concierge voor hulp.',
            enteredMethodIsAlreadySubmitted: 'Deze contactmethode bestaat al',
            passwordRequired: 'wachtwoord vereist.',
            contactMethodRequired: 'Contactmethode is vereist',
            invalidContactMethod: 'Ongeldige contactmethode',
        },
        newContactMethod: 'Nieuwe contactmethode',
        goBackContactMethods: 'Ga terug naar contactmethoden',
    },
    // cspell:disable
    pronouns: {
        coCos: "Co / Co's",
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Hij / Hem / Zijn',
        heHimHisTheyThemTheirs: 'Hij / Hem / Zijn / Zij / Hen / Hun',
        sheHerHers: 'Zij / Haar / Hare',
        sheHerHersTheyThemTheirs: 'Zij / Haar / Haar / Zij / Hen / Hun',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'Zij / Hen / Hun',
        thonThons: 'Thon / Thons',
        veVerVis: 'Bekijken / Bekijkt / Bekeken',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Noem me bij mijn naam',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: 'Weergavenaam',
        isShownOnProfile: 'Je weergavenaam wordt getoond op je profiel.',
    },
    timezonePage: {
        timezone: 'Tijdzone',
        isShownOnProfile: 'Je tijdzone wordt weergegeven op je profiel.',
        getLocationAutomatically: 'Automatisch uw locatie bepalen',
    },
    updateRequiredView: {
        updateRequired: 'Update vereist',
        pleaseInstall: 'Werk bij naar de nieuwste versie van New Expensify.',
        pleaseInstallExpensifyClassic: 'Installeer de nieuwste versie van Expensify alstublieft.',
        toGetLatestChanges: 'Voor mobiel of desktop, download en installeer de nieuwste versie. Voor web, ververs je browser.',
        newAppNotAvailable: 'De nieuwe Expensify-app is niet langer beschikbaar.',
    },
    initialSettingsPage: {
        about: 'Over',
        aboutPage: {
            description: 'De nieuwe Expensify-app is gebouwd door een gemeenschap van open-source ontwikkelaars van over de hele wereld. Help ons de toekomst van Expensify te bouwen.',
            appDownloadLinks: 'App-downloadlinks',
            viewKeyboardShortcuts: 'Toetsenbord sneltoetsen bekijken',
            viewTheCode: 'Bekijk de code',
            viewOpenJobs: 'Bekijk openstaande vacatures',
            reportABug: 'Een bug rapporteren',
            troubleshoot: 'Problemen oplossen',
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
            clearCacheAndRestart: 'Cache wissen en opnieuw starten',
            viewConsole: 'Bekijk debugconsole',
            debugConsole: 'Debugconsole',
            description:
                '<muted-text>Gebruik de onderstaande hulpmiddelen om problemen met Expensify op te lossen. Als je problemen tegenkomt, <concierge-link>dien dan een bug in</concierge-link>.</muted-text>',
            confirmResetDescription: 'Alle niet-verzonden conceptberichten gaan verloren, maar de rest van uw gegevens is veilig.',
            resetAndRefresh: 'Reset en vernieuwen',
            clientSideLogging: 'Client-side logging',
            noLogsToShare: 'Geen logs om te delen',
            useProfiling: 'Gebruik profilering',
            profileTrace: 'Profieltracering',
            results: 'Resultaten',
            releaseOptions: 'Release-opties',
            testingPreferences: 'Voorkeuren testen',
            useStagingServer: 'Gebruik Staging Server',
            forceOffline: 'Offline forceren',
            simulatePoorConnection: 'Simuleer een slechte internetverbinding',
            simulateFailingNetworkRequests: 'Netwerkverzoeken simuleren die mislukken',
            authenticationStatus: 'Authenticatiestatus',
            deviceCredentials: 'Apparaatreferenties',
            invalidate: 'Ongeldig maken',
            destroy: 'Vernietigen',
            maskExportOnyxStateData: 'Masker kwetsbare ledendata bij het exporteren van de Onyx-status',
            exportOnyxState: 'Onyx-status exporteren',
            importOnyxState: 'Importeer Onyx-status',
            testCrash: 'Test crash',
            resetToOriginalState: 'Reset naar oorspronkelijke staat',
            usingImportedState: 'U gebruikt geïmporteerde status. Druk hier om het te wissen.',
            debugMode: 'Debug-modus',
            invalidFile: 'Ongeldig bestand',
            invalidFileDescription: 'Het bestand dat je probeert te importeren is niet geldig. Probeer het opnieuw.',
            invalidateWithDelay: 'Ongeldig maken met vertraging',
            recordTroubleshootData: 'Probleemoplossingsgegevens opnemen',
            softKillTheApp: 'Soft kill de app',
            kill: 'Dood',
        },
        debugConsole: {
            saveLog: 'Log opslaan',
            shareLog: 'Log delen',
            enterCommand: 'Voer opdracht in',
            execute: 'Uitvoeren',
            noLogsAvailable: 'Geen logs beschikbaar',
            logSizeTooLarge: ({size}: LogSizeParams) => `Loggrootte overschrijdt de limiet van ${size} MB. Gebruik "Log opslaan" om het logbestand te downloaden.`,
            logs: 'Logboeken',
            viewConsole: 'Console bekijken',
        },
        security: 'Beveiliging',
        signOut: 'Afmelden',
        restoreStashed: 'Herstel opgeslagen login',
        signOutConfirmationText: 'U verliest alle offline wijzigingen als u zich afmeldt.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Lees de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Servicevoorwaarden</a> en <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.</muted-text-micro>`,
        help: 'Help',
        whatIsNew: 'Wat is nieuw',
        accountSettings: 'Accountinstellingen',
        account: 'Account',
        general: 'Algemeen',
    },
    closeAccountPage: {
        closeAccount: 'Account sluiten',
        reasonForLeavingPrompt: 'We zouden het jammer vinden om je te zien gaan! Zou je ons vriendelijk willen vertellen waarom, zodat we kunnen verbeteren?',
        enterMessageHere: 'Voer hier bericht in',
        closeAccountWarning: 'Het sluiten van uw account kan niet ongedaan worden gemaakt.',
        closeAccountPermanentlyDeleteData: 'Weet je zeker dat je je account wilt verwijderen? Dit zal alle openstaande uitgaven permanent verwijderen.',
        enterDefaultContactToConfirm: 'Voer uw standaard contactmethode in om te bevestigen dat u uw account wilt sluiten. Uw standaard contactmethode is:',
        enterDefaultContact: 'Voer uw standaard contactmethode in',
        defaultContact: 'Standaard contactmethode:',
        enterYourDefaultContactMethod: 'Voer uw standaard contactmethode in om uw account te sluiten.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Accounts samenvoegen',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Voer de account in die je wilt samenvoegen in <strong>${login}</strong>.`,
            notReversibleConsent: 'Ik begrijp dat dit niet omkeerbaar is.',
        },
        accountValidate: {
            confirmMerge: 'Weet je zeker dat je accounts wilt samenvoegen?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `Het samenvoegen van je accounts is onomkeerbaar en zal resulteren in het verlies van alle niet-ingediende uitgaven voor <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Voer de magische code in die naar <strong>${login}</strong> is verzonden om verder te gaan.`,
            errors: {
                incorrectMagicCode: 'Onjuiste of ongeldige magische code. Probeer het opnieuw of vraag een nieuwe code aan.',
                fallback: 'Er is iets misgegaan. Probeer het later opnieuw.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Accounts samengevoegd!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Je hebt met succes alle gegevens van <strong>${from}</strong> samengevoegd in <strong>${to}</strong>. Je kunt nu elke login gebruiken voor deze account.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'We zijn ermee bezig',
            limitedSupport: 'We ondersteunen het samenvoegen van accounts nog niet op New Expensify. Voer deze actie in plaats daarvan uit op Expensify Classic.',
            reachOutForHelp: '<muted-text><centered-text>Neem gerust <concierge-link>contact op met Concierge</concierge-link> als je vragen hebt!</centered-text></muted-text>',
            goToExpensifyClassic: 'Ga naar Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet samenvoegen omdat het wordt beheerd door <strong>${email.split('@').at(1) ?? ''}</strong>. Neem <concierge-link>contact op met Concierge</concierge-link> voor hulp.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>U kunt <strong>${email}</strong> niet samenvoegen met andere accounts omdat uw domeinbeheerder dit heeft ingesteld als uw primaire login. Voeg in plaats daarvan andere accounts samen.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Je kunt accounts niet samenvoegen omdat <strong>${email}</strong> twee-factor authenticatie (2FA) heeft ingeschakeld. Schakel 2FA uit voor <strong>${email}</strong> en probeer het opnieuw.</centered-text></muted-text>`,
            learnMore: 'Meer informatie over het samenvoegen van accounts.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet samenvoegen omdat het vergrendeld is. Neem <concierge-link>contact op met Concierge</concierge-link> voor hulp.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Je kunt geen accounts samenvoegen omdat <strong>${email}</strong> geen Expensify account heeft. <a href="${contactMethodLink}">Voeg het toe als een contactmethode</a> in plaats daarvan.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet samenvoegen met andere accounts. Voeg in plaats daarvan andere accounts samen.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt accounts niet samenvoegen in <strong>${email}</strong> omdat deze account een gefactureerde factureringsrelatie heeft.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Probeer het later opnieuw',
            description: 'Er waren te veel pogingen om accounts samen te voegen. Probeer het later opnieuw.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'U kunt niet samenvoegen met andere accounts omdat het niet gevalideerd is. Valideer het account en probeer het opnieuw.',
        },
        mergeFailureSelfMerge: {
            description: 'U kunt geen account met zichzelf samenvoegen.',
        },
        mergeFailureGenericHeading: 'Kan accounts niet samenvoegen',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Verdachte activiteit melden',
        lockAccount: 'Account vergrendelen',
        unlockAccount: 'Account ontgrendelen',
        compromisedDescription: 'Merk je iets vreemds op aan je account? Meld het en je account wordt meteen vergrendeld, kaarttransacties geblokkeerd en wijzigingen voorkomen.',
        domainAdminsDescription: 'Voor domeinbeheerders: dit pauzeert ook alle Expensify Card-activiteiten en beheerdersacties in je domein(en).',
        areYouSure: 'Weet je zeker dat je je Expensify-account wilt vergrendelen?',
        onceLocked: 'Zodra vergrendeld, wordt uw account beperkt in afwachting van een ontgrendelingsverzoek en een beveiligingscontrole.',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Kan account niet vergrendelen',
        failedToLockAccountDescription: `We konden uw account niet vergrendelen. Neem contact op met Concierge om dit probleem op te lossen.`,
        chatWithConcierge: 'Chat met Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Account vergrendeld',
        yourAccountIsLocked: 'Je account is vergrendeld',
        chatToConciergeToUnlock: 'Chat met Concierge om beveiligingsproblemen op te lossen en je account te ontgrendelen.',
        chatWithConcierge: 'Chat met Concierge',
    },
    passwordPage: {
        changePassword: 'Wachtwoord wijzigen',
        changingYourPasswordPrompt: 'Het wijzigen van je wachtwoord zal je wachtwoord voor zowel je Expensify.com als je New Expensify accounts bijwerken.',
        currentPassword: 'Huidig wachtwoord',
        newPassword: 'Nieuw wachtwoord',
        newPasswordPrompt: 'Je nieuwe wachtwoord moet anders zijn dan je oude wachtwoord en moet ten minste 8 tekens, 1 hoofdletter, 1 kleine letter en 1 cijfer bevatten.',
    },
    twoFactorAuth: {
        headerTitle: 'Twee-factor authenticatie',
        twoFactorAuthEnabled: 'Twee-factor authenticatie ingeschakeld',
        whatIsTwoFactorAuth:
            'Twee-factor authenticatie (2FA) helpt je account veilig te houden. Bij het inloggen moet je een code invoeren die is gegenereerd door je voorkeursauthenticator-app.',
        disableTwoFactorAuth: 'Twee-factor-authenticatie uitschakelen',
        explainProcessToRemove: 'Om twee-factor authenticatie (2FA) uit te schakelen, voer alstublieft een geldige code in van uw authenticatie-app.',
        disabled: 'Twee-factor-authenticatie is nu uitgeschakeld',
        noAuthenticatorApp: 'Je hebt geen authenticator-app meer nodig om in te loggen bij Expensify.',
        stepCodes: 'Herstelcodes',
        keepCodesSafe: 'Bewaar deze herstelcodes veilig!',
        codesLoseAccess: dedent(`
            Als je de toegang tot je authenticator-app kwijtraakt en deze codes niet hebt, verlies je de toegang tot je account.

            Opmerking: Het instellen van twee-factor-authenticatie logt je uit bij alle andere actieve sessies.
        `),
        errorStepCodes: 'Kopieer of download codes voordat u doorgaat.',
        stepVerify: 'Verifiëren',
        scanCode: 'Scan de QR-code met uw',
        authenticatorApp: 'authenticator-app',
        addKey: 'Of voeg deze geheime sleutel toe aan je authenticator-app:',
        enterCode: 'Voer vervolgens de zescijferige code in die is gegenereerd door uw authenticator-app.',
        stepSuccess: 'Voltooid',
        enabled: 'Twee-factor authenticatie ingeschakeld',
        congrats: 'Gefeliciteerd! Nu heb je die extra beveiliging.',
        copy: 'Kopiëren',
        disable: 'Uitschakelen',
        enableTwoFactorAuth: 'Twee-factor-authenticatie inschakelen',
        pleaseEnableTwoFactorAuth: 'Schakel alsjeblieft twee-factor authenticatie in.',
        twoFactorAuthIsRequiredDescription: 'Voor beveiligingsdoeleinden vereist Xero tweefactorauthenticatie om de integratie te verbinden.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Twee-factor authenticatie vereist',
        twoFactorAuthIsRequiredForAdminsTitle: 'Schakel alsjeblieft twee-factor authenticatie in.',
        twoFactorAuthIsRequiredXero: 'Je Xero-boekhoudkoppeling vereist het gebruik van tweefactorauthenticatie. Schakel tweefactorauthenticatie in om Expensify te blijven gebruiken.',
        twoFactorAuthCannotDisable: 'Kan 2FA niet uitschakelen',
        twoFactorAuthRequired: 'Twee-factor authenticatie (2FA) is vereist voor uw Xero-verbinding en kan niet worden uitgeschakeld.',
        explainProcessToRemoveWithRecovery: 'Om tweefactorauthenticatie (2FA) uit te schakelen, voer een geldige herstelcode in.',
        twoFactorAuthIsRequiredCompany: 'Uw bedrijf vereist het gebruik van tweefactorauthenticatie. Schakel tweefactorauthenticatie in om Expensify te blijven gebruiken.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Voer uw herstelcode in alstublieft',
            incorrectRecoveryCode: 'Onjuiste herstelcode. Probeer het opnieuw.',
        },
        useRecoveryCode: 'Gebruik herstelcode',
        recoveryCode: 'Herstelcode',
        use2fa: 'Gebruik tweefactorauthenticatiecode',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Voer uw tweefactorauthenticatiecode in alstublieft',
            incorrect2fa: 'Onjuiste twee-factor authenticatiecode. Probeer het opnieuw.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Wachtwoord bijgewerkt!',
        allSet: 'Je bent klaar. Bewaar je nieuwe wachtwoord veilig.',
    },
    privateNotes: {
        title: 'Privé notities',
        personalNoteMessage: 'Houd notities over deze chat hier bij. Jij bent de enige persoon die deze notities kan toevoegen, bewerken of bekijken.',
        sharedNoteMessage: 'Houd notities over deze chat hier bij. Expensify-medewerkers en andere leden op het team.expensify.com-domein kunnen deze notities bekijken.',
        composerLabel: 'Notities',
        myNote: 'Mijn notitie',
        error: {
            genericFailureMessage: 'Privé notities konden niet worden opgeslagen',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Voer een geldige beveiligingscode in alstublieft',
        },
        securityCode: 'Beveiligingscode',
        changeBillingCurrency: 'Factuurvaluta wijzigen',
        changePaymentCurrency: 'Betaalvaluta wijzigen',
        paymentCurrency: 'Betaalvaluta',
        paymentCurrencyDescription: 'Selecteer een gestandaardiseerde valuta waarnaar alle persoonlijke uitgaven moeten worden omgerekend',
        note: `Let op: Het wijzigen van je betalingsvaluta kan invloed hebben op hoeveel je betaalt voor Expensify. Raadpleeg onze <a href="${CONST.PRICING}">prijspagina</a> voor meer informatie.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Voeg een debetkaart toe',
        nameOnCard: 'Naam op kaart',
        debitCardNumber: 'Debetkaartnummer',
        expiration: 'Vervaldatum',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Factuuradres',
        growlMessageOnSave: 'Je debetkaart is succesvol toegevoegd.',
        expensifyPassword: 'Expensify-wachtwoord',
        error: {
            invalidName: 'Naam mag alleen letters bevatten',
            addressZipCode: 'Voer een geldige postcode in',
            debitCardNumber: 'Voer een geldig debetkaartnummer in alstublieft',
            expirationDate: 'Selecteer een geldige vervaldatum alstublieft',
            securityCode: 'Voer een geldige beveiligingscode in alstublieft',
            addressStreet: 'Voer een geldig factuuradres in dat geen postbus is.',
            addressState: 'Selecteer een staat alstublieft',
            addressCity: 'Voer een stad in, alstublieft',
            genericFailureMessage: 'Er is een fout opgetreden bij het toevoegen van uw kaart. Probeer het alstublieft opnieuw.',
            password: 'Voer uw Expensify-wachtwoord in alstublieft',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Betaalpas toevoegen',
        nameOnCard: 'Naam op kaart',
        paymentCardNumber: 'Kaartnummer',
        expiration: 'Vervaldatum',
        expirationDate: 'MM/YY',
        cvv: 'CVV',
        billingAddress: 'Factuuradres',
        growlMessageOnSave: 'Uw betaalkaart is succesvol toegevoegd',
        expensifyPassword: 'Expensify-wachtwoord',
        error: {
            invalidName: 'Naam mag alleen letters bevatten',
            addressZipCode: 'Voer een geldige postcode in',
            paymentCardNumber: 'Voer een geldig kaartnummer in alstublieft',
            expirationDate: 'Selecteer een geldige vervaldatum alstublieft',
            securityCode: 'Voer een geldige beveiligingscode in alstublieft',
            addressStreet: 'Voer een geldig factuuradres in dat geen postbus is.',
            addressState: 'Selecteer een staat alstublieft',
            addressCity: 'Voer een stad in, alstublieft',
            genericFailureMessage: 'Er is een fout opgetreden bij het toevoegen van uw kaart. Probeer het alstublieft opnieuw.',
            password: 'Voer uw Expensify-wachtwoord in alstublieft',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Betaalmethoden',
        setDefaultConfirmation: 'Standaard betaalmethode instellen',
        setDefaultSuccess: 'Standaard betaalmethode ingesteld!',
        deleteAccount: 'Account verwijderen',
        deleteConfirmation: 'Weet je zeker dat je dit account wilt verwijderen?',
        error: {
            notOwnerOfBankAccount: 'Er is een fout opgetreden bij het instellen van deze bankrekening als uw standaard betaalmethode.',
            invalidBankAccount: 'Deze bankrekening is tijdelijk opgeschort.',
            notOwnerOfFund: 'Er is een fout opgetreden bij het instellen van deze kaart als uw standaard betaalmethode.',
            setDefaultFailure: 'Er is iets misgegaan. Neem contact op met Concierge voor verdere hulp.',
        },
        addBankAccountFailure: 'Er is een onverwachte fout opgetreden bij het proberen uw bankrekening toe te voegen. Probeer het alstublieft opnieuw.',
        getPaidFaster: 'Sneller betaald worden',
        addPaymentMethod: 'Voeg een betaalmethode toe om betalingen direct in de app te verzenden en ontvangen.',
        getPaidBackFaster: 'Sneller terugbetaald worden',
        secureAccessToYourMoney: 'Beveiligde toegang tot uw geld',
        receiveMoney: 'Ontvang geld in je lokale valuta',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Stuur en ontvang geld met vrienden. Alleen Amerikaanse bankrekeningen.',
        enableWallet: 'Portemonnee inschakelen',
        addBankAccountToSendAndReceive: 'Voeg een bankrekening toe om betalingen te doen of te ontvangen.',
        addDebitOrCreditCard: 'Debet- of creditcard toevoegen',
        assignedCards: 'Toegewezen kaarten',
        assignedCardsDescription: 'Dit zijn kaarten die door een werkruimtebeheerder zijn toegewezen om de uitgaven van het bedrijf te beheren.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'We zijn uw informatie aan het beoordelen. Kom over een paar minuten terug!',
        walletActivationFailed: 'Helaas kan uw portemonnee op dit moment niet worden geactiveerd. Neem contact op met Concierge voor verdere hulp.',
        addYourBankAccount: 'Voeg je bankrekening toe',
        addBankAccountBody: 'Laten we je bankrekening koppelen aan Expensify, zodat het eenvoudiger dan ooit is om rechtstreeks in de app betalingen te verzenden en te ontvangen.',
        chooseYourBankAccount: 'Kies uw bankrekening',
        chooseAccountBody: 'Zorg ervoor dat je de juiste selecteert.',
        confirmYourBankAccount: 'Bevestig uw bankrekening',
        personalBankAccounts: 'Persoonlijke bankrekeningen',
        businessBankAccounts: 'Zakelijke bankrekeningen',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: 'Resterende limiet',
        smartLimit: {
            name: 'Slimme limiet',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Je kunt tot ${formattedLimit} uitgeven op deze kaart, en de limiet wordt opnieuw ingesteld zodra je ingediende uitgaven worden goedgekeurd.`,
        },
        fixedLimit: {
            name: 'Vast limiet',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Je kunt tot ${formattedLimit} uitgeven op deze kaart, en daarna wordt deze gedeactiveerd.`,
        },
        monthlyLimit: {
            name: 'Maandelijkse limiet',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Je kunt tot ${formattedLimit} per maand op deze kaart uitgeven. De limiet wordt gereset op de 1e dag van elke kalendermaand.`,
        },
        virtualCardNumber: 'Virtueel kaartnummer',
        travelCardCvv: 'Reiskaart CVV',
        physicalCardNumber: 'Fysiek kaartnummer',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Fysieke kaart aanvragen',
        reportFraud: 'Meld fraude met virtuele kaart aan',
        reportTravelFraud: 'Reiskaartfraude melden',
        reviewTransaction: 'Transactie beoordelen',
        suspiciousBannerTitle: 'Verdachte transactie',
        suspiciousBannerDescription: 'We hebben verdachte transacties op uw kaart opgemerkt. Tik hieronder om te bekijken.',
        cardLocked: 'Uw kaart is tijdelijk geblokkeerd terwijl ons team de account van uw bedrijf beoordeelt.',
        cardDetails: {
            cardNumber: 'Virtueel kaartnummer',
            expiration: 'Verloopdatum',
            cvv: 'CVV',
            address: 'Adres',
            revealDetails: 'Details weergeven',
            revealCvv: 'Toon CVV',
            copyCardNumber: 'Kopieer kaartnummer',
            updateAddress: 'Adres bijwerken',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Toegevoegd aan ${platform} Wallet`,
        cardDetailsLoadingFailure: 'Er is een fout opgetreden bij het laden van de kaartgegevens. Controleer uw internetverbinding en probeer het opnieuw.',
        validateCardTitle: 'Laten we ervoor zorgen dat jij het bent',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Voer de magische code in die naar ${contactMethod} is gestuurd om uw kaartgegevens te bekijken. Het zou binnen een minuut of twee moeten aankomen.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `<a href="${missingDetailsLink}">Voeg je persoonlijke gegevens toe</a> en probeer het daarna opnieuw.`,
        unexpectedError: 'Er is een fout opgetreden bij het ophalen van je Expensify-kaartgegevens. Probeer het opnieuw.',
        cardFraudAlert: {
            confirmButtonText: 'Ja, dat doe ik.',
            reportFraudButtonText: 'Nee, dat was ik niet.',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `verdachte activiteit verwijderd en kaart x${cardLastFour} opnieuw geactiveerd. Alles klaar om door te gaan met declareren!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `deactiveerde de kaart eindigend op ${cardLastFour}`,
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
            }) => `verdachte activiteit geïdentificeerd op kaart eindigend op ${cardLastFour}. Herken je deze transactie?

${amount} voor ${merchant} - ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Uitgaven',
        workflowDescription: 'Configureer een workflow vanaf het moment dat uitgaven plaatsvinden, inclusief goedkeuring en betaling.',
        submissionFrequency: 'Indieningsfrequentie',
        submissionFrequencyDescription: 'Kies een frequentie voor het indienen van onkosten.',
        submissionFrequencyDateOfMonth: 'Datum van de maand',
        disableApprovalPromptDescription: 'Goedkeuringen uitschakelen verwijdert alle bestaande goedkeuringsworkflows.',
        addApprovalsTitle: 'Goedkeuringen toevoegen',
        addApprovalButton: 'Goedkeuringsworkflow toevoegen',
        addApprovalTip: 'Deze standaard workflow is van toepassing op alle leden, tenzij er een specifiekere workflow bestaat.',
        approver: 'Goedkeurder',
        addApprovalsDescription: 'Vereis extra goedkeuring voordat een betaling wordt geautoriseerd.',
        makeOrTrackPaymentsTitle: 'Betalingen maken of volgen',
        makeOrTrackPaymentsDescription: 'Voeg een geautoriseerde betaler toe voor betalingen gedaan in Expensify of volg betalingen die elders zijn gedaan.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Er is een aangepaste goedkeuringsworkflow ingeschakeld voor deze workspace. Neem contact op met uw <account-manager-link>Accountmanager</account-manager-link> of <concierge-link>Concierge</concierge-link> om deze workflow te bekijken of te wijzigen.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Er is een aangepaste goedkeuringsworkflow ingeschakeld voor deze workspace. Neem contact op met <concierge-link>Concierge</concierge-link> om deze workflow te bekijken of te wijzigen.</muted-text-label>',
        editor: {
            submissionFrequency: 'Kies hoe lang Expensify moet wachten voordat foutloze uitgaven worden gedeeld.',
        },
        frequencyDescription: 'Kies hoe vaak je wilt dat uitgaven automatisch worden ingediend, of maak het handmatig.',
        frequencies: {
            instant: 'Onmiddellijk',
            weekly: 'Wekelijks',
            monthly: 'Maandelijks',
            twiceAMonth: 'Twee keer per maand',
            byTrip: 'Per reis',
            manually: 'Handmatig',
            daily: 'Dagelijks',
            lastDayOfMonth: 'Laatste dag van de maand',
            lastBusinessDayOfMonth: 'Laatste werkdag van de maand',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Eerste',
                '2': 'Tweede',
                '3': 'Derde',
                '4': 'Vierde',
                '5': 'Vijfde',
                '6': 'Zesde',
                '7': 'Zevende',
                '8': 'Achtste',
                '9': 'Negende',
                '10': 'Tiende',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Dit lid behoort al tot een andere goedkeuringsworkflow. Alle updates hier worden daar ook weergegeven.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> keurt al rapporten goed voor <strong>${name2}</strong>. Kies alstublieft een andere goedkeurder om een circulaire workflow te voorkomen.`,
        emptyContent: {
            title: 'Geen leden om weer te geven',
            expensesFromSubtitle: 'Alle werkruimteleden maken al deel uit van een bestaand goedkeuringsproces.',
            approverSubtitle: 'Alle goedkeurders behoren tot een bestaand werkstroom.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'De frequentie van inzendingen kon niet worden gewijzigd. Probeer het opnieuw of neem contact op met de ondersteuning.',
        monthlyOffsetErrorMessage: 'Maandelijkse frequentie kon niet worden gewijzigd. Probeer het opnieuw of neem contact op met de ondersteuning.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Bevestigen',
        header: 'Voeg meer goedkeurders toe en bevestig.',
        additionalApprover: 'Extra goedkeurder',
        submitButton: 'Workflow toevoegen',
    },
    workflowsEditApprovalsPage: {
        title: 'Goedkeuringsworkflow bewerken',
        deleteTitle: 'Verwijder goedkeuringsworkflow',
        deletePrompt: 'Weet u zeker dat u deze goedkeuringsworkflow wilt verwijderen? Alle leden zullen vervolgens de standaardworkflow volgen.',
    },
    workflowsExpensesFromPage: {
        title: 'Uitgaven van',
        header: 'Wanneer de volgende leden onkosten indienen:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'De goedkeurder kon niet worden gewijzigd. Probeer het opnieuw of neem contact op met de ondersteuning.',
        header: 'Verstuur naar dit lid voor goedkeuring:',
    },
    workflowsPayerPage: {
        title: 'Geautoriseerde betaler',
        genericErrorMessage: 'De geautoriseerde betaler kon niet worden gewijzigd. Probeer het alstublieft opnieuw.',
        admins: 'Beheerders',
        payer: 'Betaler',
        paymentAccount: 'Betaalrekening',
    },
    reportFraudPage: {
        title: 'Meld fraude met virtuele kaart aan',
        description:
            'Als de gegevens van uw virtuele kaart zijn gestolen of gecompromitteerd, zullen we uw bestaande kaart permanent deactiveren en u voorzien van een nieuwe virtuele kaart en nummer.',
        deactivateCard: 'Deactiveer kaart',
        reportVirtualCardFraud: 'Meld fraude met virtuele kaart aan',
    },
    reportFraudConfirmationPage: {
        title: 'Kaartfraude gemeld',
        description: 'We hebben uw bestaande kaart permanent gedeactiveerd. Wanneer u teruggaat om uw kaartgegevens te bekijken, zult u een nieuwe virtuele kaart beschikbaar hebben.',
        buttonText: 'Begrepen, bedankt!',
    },
    activateCardPage: {
        activateCard: 'Activeer kaart',
        pleaseEnterLastFour: 'Voer alstublieft de laatste vier cijfers van uw kaart in.',
        activatePhysicalCard: 'Fysieke kaart activeren',
        error: {
            thatDidNotMatch: 'Dat kwam niet overeen met de laatste 4 cijfers op uw kaart. Probeer het alstublieft opnieuw.',
            throttled:
                'Je hebt de laatste 4 cijfers van je Expensify Card te vaak verkeerd ingevoerd. Als je zeker weet dat de cijfers correct zijn, neem dan contact op met Concierge om het op te lossen. Probeer het anders later opnieuw.',
        },
    },
    getPhysicalCard: {
        header: 'Fysieke kaart aanvragen',
        nameMessage: 'Voer uw voor- en achternaam in, want deze wordt op uw kaart getoond.',
        legalName: 'Wettelijke naam',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Wettelijke achternaam',
        phoneMessage: 'Voer uw telefoonnummer in.',
        phoneNumber: 'Telefoonnummer',
        address: 'Adres',
        addressMessage: 'Voer uw verzendadres in.',
        streetAddress: 'Straatadres',
        city: 'Stad',
        state: 'Staat',
        zipPostcode: 'Postcode',
        country: 'Land',
        confirmMessage: 'Bevestig alstublieft uw gegevens hieronder.',
        estimatedDeliveryMessage: 'Uw fysieke kaart zal binnen 2-3 werkdagen arriveren.',
        next: 'Volgende',
        getPhysicalCard: 'Fysieke kaart aanvragen',
        shipCard: 'Verzendkaart',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: 'Instant (Debetkaart)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% vergoeding (${minAmount} minimum)`,
        ach: '1-3 werkdagen (bankrekening)',
        achSummary: 'Geen kosten',
        whichAccount: 'Welke account?',
        fee: 'Kosten',
        transferSuccess: 'Overdracht geslaagd!',
        transferDetailBankAccount: 'Uw geld zou binnen de volgende 1-3 werkdagen moeten aankomen.',
        transferDetailDebitCard: 'Uw geld zou onmiddellijk moeten aankomen.',
        failedTransfer: 'Je saldo is niet volledig vereffend. Gelieve over te maken naar een bankrekening.',
        notHereSubTitle: 'Gelieve uw saldo over te maken vanaf de portemonneepagina.',
        goToWallet: 'Ga naar Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Kies account',
    },
    paymentMethodList: {
        addPaymentMethod: 'Betaalmethode toevoegen',
        addNewDebitCard: 'Nieuwe debetkaart toevoegen',
        addNewBankAccount: 'Nieuwe bankrekening toevoegen',
        accountLastFour: 'Eindigend op',
        cardLastFour: 'Kaart eindigend op',
        addFirstPaymentMethod: 'Voeg een betaalmethode toe om betalingen direct in de app te verzenden en ontvangen.',
        defaultPaymentMethod: 'Standaard',
        bankAccountLastFour: ({lastFour}: BankAccountLastFourParams) => `Bankrekening • ${lastFour}`,
    },
    preferencesPage: {
        appSection: {
            title: 'App-voorkeuren',
        },
        testSection: {
            title: 'Voorkeuren testen',
            subtitle: 'Instellingen om de app op staging te debuggen en testen.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Ontvang relevante functie-updates en Expensify-nieuws',
        muteAllSounds: 'Alle geluiden van Expensify dempen',
    },
    priorityModePage: {
        priorityMode: 'Prioriteitsmodus',
        explainerText: 'Kies of je je wilt #concentreren op alleen ongelezen en vastgezette chats, of alles wilt weergeven met de meest recente en vastgezette chats bovenaan.',
        priorityModes: {
            default: {
                label: 'Meest recent',
                description: 'Toon alle chats gesorteerd op meest recent',
            },
            gsd: {
                label: '#focus',
                description: 'Alleen ongelezen alfabetisch sorteren tonen',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
        generatingPDF: 'PDF genereren...',
        waitForPDF: 'Even geduld terwijl we de PDF genereren.',
        errorPDF: 'Er is een fout opgetreden bij het genereren van uw PDF.',
    },
    reportDescriptionPage: {
        roomDescription: 'Kamerbeschrijving',
        roomDescriptionOptional: 'Kamerbeschrijving (optioneel)',
        explainerText: 'Stel een aangepaste beschrijving in voor de kamer.',
    },
    groupChat: {
        lastMemberTitle: 'Let op!',
        lastMemberWarning: 'Aangezien jij de laatste persoon hier bent, zal het verlaten van deze chat deze ontoegankelijk maken voor alle leden. Weet je zeker dat je wilt vertrekken?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Groepschat van ${displayName}`,
    },
    languagePage: {
        language: 'Taal',
        aiGenerated: 'De vertalingen voor deze taal worden automatisch gegenereerd en kunnen fouten bevatten.',
    },
    themePage: {
        theme: 'Thema',
        themes: {
            dark: {
                label: 'Donker',
            },
            light: {
                label: 'Licht',
            },
            system: {
                label: 'Apparaatinstellingen gebruiken',
            },
        },
        chooseThemeBelowOrSync: 'Kies een thema hieronder, of synchroniseer met de instellingen van je apparaat.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Door in te loggen, gaat u akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Servicevoorwaarden</a> en <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a>.</muted-text-xs>`,
        license: `<muted-text-xs>Geldtransmissie wordt verzorgd door ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) krachtens haar <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenties</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Geen magische code ontvangen?',
        enterAuthenticatorCode: 'Voer uw authenticatiecode in alstublieft',
        enterRecoveryCode: 'Voer uw herstelcode in alstublieft',
        requiredWhen2FAEnabled: 'Vereist wanneer 2FA is ingeschakeld',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Vraag een nieuwe code aan over <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Vraag een nieuwe code aan',
        error: {
            pleaseFillMagicCode: 'Voer uw magische code in alstublieft',
            incorrectMagicCode: 'Onjuiste of ongeldige magische code. Probeer het opnieuw of vraag een nieuwe code aan.',
            pleaseFillTwoFactorAuth: 'Voer uw tweefactorauthenticatiecode in alstublieft',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Vul alstublieft alle velden in',
        pleaseFillPassword: 'Voer uw wachtwoord in, alstublieft',
        pleaseFillTwoFactorAuth: 'Voer uw tweefactorauthenticatiecode in alstublieft.',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Voer uw twee-factor authenticatiecode in om door te gaan',
        forgot: 'Vergeten?',
        requiredWhen2FAEnabled: 'Vereist wanneer 2FA is ingeschakeld',
        error: {
            incorrectPassword: 'Onjuist wachtwoord. Probeer het opnieuw.',
            incorrectLoginOrPassword: 'Onjuiste inloggegevens of wachtwoord. Probeer het opnieuw.',
            incorrect2fa: 'Onjuiste twee-factor authenticatiecode. Probeer het opnieuw.',
            twoFactorAuthenticationEnabled: 'U heeft 2FA ingeschakeld op dit account. Log in met uw e-mail of telefoonnummer.',
            invalidLoginOrPassword: 'Ongeldige inloggegevens of wachtwoord. Probeer het opnieuw of reset uw wachtwoord.',
            unableToResetPassword:
                'We konden uw wachtwoord niet wijzigen. Dit komt waarschijnlijk door een verlopen wachtwoordresetlink in een oude wachtwoordreset-e-mail. We hebben u een nieuwe link gemaild, zodat u het opnieuw kunt proberen. Controleer uw inbox en uw spammap; het zou binnen enkele minuten moeten aankomen.',
            noAccess: 'U heeft geen toegang tot deze applicatie. Voeg uw GitHub-gebruikersnaam toe voor toegang.',
            accountLocked: 'Je account is vergrendeld na te veel mislukte pogingen. Probeer het over 1 uur opnieuw.',
            fallback: 'Er is iets misgegaan. Probeer het later opnieuw.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefoon of e-mail',
        error: {
            invalidFormatEmailLogin: 'Het ingevoerde e-mailadres is ongeldig. Corrigeer het formaat en probeer het opnieuw.',
        },
        cannotGetAccountDetails: 'Kon accountgegevens niet ophalen. Probeer opnieuw in te loggen.',
        loginForm: 'Inlogformulier',
        notYou: ({user}: NotYouParams) => `Niet ${user}?`,
    },
    onboarding: {
        welcome: 'Welkom!',
        welcomeSignOffTitleManageTeam: 'Zodra je de bovenstaande taken hebt voltooid, kunnen we meer functionaliteit verkennen, zoals goedkeuringsworkflows en regels!',
        welcomeSignOffTitle: 'Leuk je te ontmoeten!',
        explanationModal: {
            title: 'Welkom bij Expensify',
            description:
                'Eén app om uw zakelijke en persoonlijke uitgaven te beheren met de snelheid van chat. Probeer het uit en laat ons weten wat u ervan vindt. Er komt nog veel meer aan!',
            secondaryDescription: 'Om terug te schakelen naar Expensify Classic, tik je gewoon op je profielfoto > Ga naar Expensify Classic.',
        },
        getStarted: 'Aan de slag',
        whatsYourName: 'Wat is jouw naam?',
        peopleYouMayKnow: 'Mensen die je misschien kent, zijn al hier! Verifieer je e-mail om je bij hen aan te sluiten.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Iemand van ${domain} heeft al een werkruimte aangemaakt. Voer de magische code in die naar ${email} is gestuurd.`,
        joinAWorkspace: 'Word lid van een werkruimte',
        listOfWorkspaces: 'Hier is de lijst met werkruimtes die je kunt joinen. Maak je geen zorgen, je kunt ze altijd later joinen als je dat liever hebt.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} lid${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Waar werk je?',
        errorSelection: 'Selecteer een optie om verder te gaan',
        purpose: {
            title: 'Wat wil je vandaag doen?',
            errorContinue: 'Druk op doorgaan om de installatie te voltooien.',
            errorBackButton: 'Beantwoord alstublieft de instellingsvragen om de app te gaan gebruiken.',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Word terugbetaald door mijn werkgever',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Beheer de uitgaven van mijn team',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Volg en budgetteer uitgaven',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chat en deel uitgaven met vrienden',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Iets anders',
        },
        employees: {
            title: 'Hoeveel werknemers heeft u?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 werknemers',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 medewerkers',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 werknemers',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1.000 medewerkers',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Meer dan 1.000 werknemers',
        },
        accounting: {
            title: 'Gebruikt u een boekhoudsoftware?',
            none: 'Geen',
        },
        interestedFeatures: {
            title: 'In welke functies bent u geïnteresseerd?',
            featuresAlreadyEnabled: 'Hier zijn onze populairste functies:',
            featureYouMayBeInterestedIn: 'Schakel extra functies in:',
        },
        error: {
            requiredFirstName: 'Voer alstublieft uw voornaam in om door te gaan',
        },
        workEmail: {
            title: 'Wat is je werk e-mailadres?',
            subtitle: 'Expensify werkt het beste wanneer je je werk e-mail verbindt.',
            explanationModal: {
                descriptionOne: 'Doorsturen naar receipts@expensify.com voor scannen',
                descriptionTwo: "Word lid van je collega's die al Expensify gebruiken",
                descriptionThree: 'Geniet van een meer gepersonaliseerde ervaring',
            },
            addWorkEmail: 'Werk e-mail toevoegen',
        },
        workEmailValidation: {
            title: 'Verifieer uw werk e-mailadres',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Voer de magische code in die naar ${workEmail} is gestuurd. Het zou binnen een minuut of twee moeten aankomen.`,
        },
        workEmailValidationError: {
            publicEmail: 'Voer een geldig werk e-mailadres in van een privédomein, bijvoorbeeld mitch@company.com.',
            offline: 'We konden je werkmail niet toevoegen omdat je offline lijkt te zijn.',
        },
        mergeBlockScreen: {
            title: 'Kon werk e-mailadres niet toevoegen',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `We konden ${workEmail} niet toevoegen. Probeer het later opnieuw in Instellingen of chat met Concierge voor begeleiding.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Neem een [proefrit](${testDriveURL})`,
                description: ({testDriveURL}) => `[Doe een snelle producttour](${testDriveURL}) om te zien waarom Expensify de snelste manier is om uw uitgaven te doen.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Neem een [proefrit](${testDriveURL})`,
                description: ({testDriveURL}) => `Neem ons mee voor een [proefrit](${testDriveURL}) en uw team krijgt *3 maanden Expensify gratis!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Uitgaven goedkeuringen toevoegen',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Goedkeuringen voor uitgaven toevoegen* om de uitgaven van je team te beoordelen en onder controle te houden.

                        Zo doe je dat:

                        1. Ga naar *Werkruimten*.
                        2. Selecteer je werkruimte.
                        3. Klik op *Meer functies*.
                        4. Schakel *Workflows* in.
                        5. Ga naar *Workflows* in de werkruimte-editor.
                        6. Schakel *Goedkeuringen toevoegen* in.
                        7. Je wordt ingesteld als de goedkeurder van uitgaven. Je kunt dit wijzigen naar elke beheerder zodra je je team hebt uitgenodigd.

                        [Ga naar Meer functies](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Maak](${workspaceConfirmationLink}) een werkruimte`,
                description: 'Maak een werkruimte en configureer de instellingen met de hulp van uw setup specialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Maak een [werkruimte](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Maak een werkruimte* om uitgaven bij te houden, bonnetjes te scannen, te chatten en meer.

                        1. Klik op *Werkruimten* > *Nieuwe werkruimte*.

                        *Je nieuwe werkruimte is klaar!* [Bekijk het](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Stel [categorieën](${workspaceCategoriesLink}) in`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Categorieën instellen* zodat je team uitgaven kan coderen voor eenvoudige rapportage.

                        1. Klik op *Workspaces*.
                        3. Selecteer je werkruimte.
                        4. Klik op *Categorieën*.
                        5. Schakel categorieën uit die je niet nodig hebt.
                        6. Voeg rechtsboven je eigen categorieën toe.

                        [Ga naar de instellingen voor werkruimtecategorieën](${workspaceCategoriesLink}).

                        ![Categorieën instellen](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Dien een uitgave in',
                description: dedent(`
                    *Dien een uitgave in* door een bedrag in te voeren of een bon te scannen.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Uitgave aanmaken*.
                    3. Voer een bedrag in of scan een bon.
                    4. Voeg het e-mailadres of telefoonnummer van je baas toe.
                    5. Klik op *Maken*.

                    En je bent klaar!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Dien een uitgave in',
                description: dedent(`
                    *Dien een uitgave in* door een bedrag in te voeren of een bon te scannen.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Uitgave aanmaken*.
                    3. Voer een bedrag in of scan een bon.
                    4. Bevestig de gegevens.
                    5. Klik op *Aanmaken*.

                    En je bent klaar!
                `),
            },
            trackExpenseTask: {
                title: 'Volg een uitgave',
                description: dedent(`
                    *Een uitgave bijhouden* in elke valuta, of je nu een bon hebt of niet.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Uitgave maken*.
                    3. Voer een bedrag in of scan een bon.
                    4. Kies je *persoonlijke* ruimte.
                    5. Klik op *Maken*.

                    En je bent klaar! Jep, zo makkelijk is het.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Verbind${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : ' met'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'uw' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Verbind ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'jouw' : 'tot'} ${integrationName} voor automatische onkostencodering en synchronisatie, waardoor de maandafsluiting een fluitje van een cent wordt.

                        1. Klik op *Werkruimtes*.
                        2. Selecteer je werkruimte.
                        3. Klik op *Boekhouding*.
                        4. Zoek ${integrationName}.
                        5. Klik op *Verbinden*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? dedent(`[Breng me naar de boekhouding](${workspaceAccountingLink}).

                                      ![Verbinding maken met ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`)
        : `[Breng me naar de boekhouding](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Verbind [uw bedrijfskaart](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Koppel je zakelijke kaart om automatisch onkosten te importeren en te coderen.

                        1. Klik op *Workspaces*.
                        2. Selecteer je werkruimte.
                        3. Klik op *Corporate cards*.
                        4. Volg de aanwijzingen om je kaart te koppelen.

                        [Ga naar het koppelen van mijn zakelijke kaarten](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Nodig [uw team](${workspaceMembersLink}) uit`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Nodig je team uit* bij Expensify zodat ze vandaag nog kunnen beginnen met het bijhouden van uitgaven.

                        1. Klik op *Werkruimtes*.
                        3. Selecteer je werkruimte.
                        4. Klik op *Leden* > *Lid uitnodigen*.
                        5. Voer e‑mailadressen of telefoonnummers in.
                        6. Voeg een aangepast uitnodigingsbericht toe als je wilt!

                        [Ga naar leden van de werkruimte](${workspaceMembersLink}).

                        ![Nodig je team uit](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Stel [categorieën](${workspaceCategoriesLink}) en [tags](${workspaceTagsLink}) in`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Stel categorieën en tags in* zodat je team uitgaven kan coderen voor eenvoudige rapportage.

                        Importeer ze automatisch door [je boekhoudsoftware te koppelen](${workspaceAccountingLink}), of stel ze handmatig in via je [werkruimte-instellingen](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Stel [tags](${workspaceTagsLink}) in`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Gebruik tags om extra onkostendetails toe te voegen, zoals projecten, klanten, locaties en afdelingen. Als je meerdere niveaus van tags nodig hebt, kun je upgraden naar het Control-abonnement.

                        1. Klik op *Werkruimtes*.
                        3. Selecteer je werkruimte.
                        4. Klik op *Meer functies*.
                        5. Schakel *Tags* in.
                        6. Ga in de werkruimte-editor naar *Tags*.
                        7. Klik op *+ Tag toevoegen* om je eigen tags te maken.

                        [Ga naar Meer functies](${workspaceMoreFeaturesLink}).

                        ![Tags instellen](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Nodig uw [boekhouder](${workspaceMembersLink}) uit`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Nodig uw accountant uit* om samen te werken in uw werkruimte en uw zakelijke uitgaven te beheren.

                        1. Klik op *Werkruimten*.
                        2. Selecteer uw werkruimte.
                        3. Klik op *Leden*.
                        4. Klik op *Lid uitnodigen*.
                        5. Voer het e-mailadres van uw accountant in.

                        [Nodig nu uw accountant uit](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Start een chat',
                description: dedent(`
                    *Start een chat* met iedereen via hun e-mailadres of telefoonnummer.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Chat starten*.
                    3. Voer een e-mailadres of telefoonnummer in.

                    Als ze Expensify nog niet gebruiken, worden ze automatisch uitgenodigd.

                    Elke chat wordt ook omgezet in een e-mail of sms waar ze direct op kunnen reageren.
                `),
            },
            splitExpenseTask: {
                title: 'Splits een uitgave',
                description: dedent(`
                    *Uitgaven splitsen* met één of meer personen.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Chat starten*.
                    3. Voer e-mailadressen of telefoonnummers in.
                    4. Klik op de grijze knop *+* in de chat > *Uitgave splitsen*.
                    5. Maak de uitgave aan door *Handmatig*, *Scan* of *Afstand* te selecteren.

                    Voeg gerust meer details toe als je wilt, of stuur het gewoon door. Laten we zorgen dat je wordt terugbetaald!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Bekijk uw [werkruimte-instellingen](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Zo kun je je werkruimte-instellingen bekijken en bijwerken:
                        1. Klik op Werkruimtes.
                        2. Selecteer je werkruimte.
                        3. Bekijk en werk je instellingen bij.
                        [Ga naar je werkruimte.](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: 'Maak uw eerste rapport',
                description: dedent(`
                    Zo maak je een rapport:

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Rapport maken*.
                    3. Klik op *Uitgave toevoegen*.
                    4. Voeg je eerste uitgave toe.

                    En je bent klaar!
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Neem een [proefrit](${testDriveURL})` : 'Neem een proefrit'),
            embeddedDemoIframeTitle: 'Proefrit',
            employeeFakeReceipt: {
                description: 'Mijn proefrit bon!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Terugbetaald krijgen is net zo eenvoudig als een bericht sturen. Laten we de basis doornemen.',
            onboardingPersonalSpendMessage: 'Zo volgt u uw uitgaven in een paar klikken.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Je gratis proefperiode is gestart! Laten we je instellen.
                        👋 Hoi, ik ben je Expensify-instelspecialist. Ik heb al een werkruimte aangemaakt om de bonnetjes en uitgaven van je team te beheren. Om het meeste uit je gratis proefperiode van 30 dagen te halen, volg je gewoon de resterende instelstappen hieronder!
                    `)
                    : dedent(`
                        # Je gratis proefperiode is begonnen! Laten we je instellen.
                        👋 Hoi! Ik ben je Expensify-specialist voor het instellen. Nu je een werkruimte hebt aangemaakt, haal het meeste uit je gratis proefperiode van 30 dagen door de onderstaande stappen te volgen!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Laten we je instellen\n👋 Hoi, ik ben je Expensify-installatiespecialist. Ik heb al een werkruimte aangemaakt om te helpen bij het beheren van je bonnetjes en uitgaven. Om het meeste uit je gratis proefperiode van 30 dagen te halen, volg je gewoon de resterende instelstappen hieronder!',
            onboardingChatSplitMessage: 'Rekeningen splitsen met vrienden is net zo eenvoudig als een bericht sturen. Zo doet u dat.',
            onboardingAdminMessage: 'Leer hoe u de werkruimte van uw team als beheerder beheert en uw eigen uitgaven indient.',
            onboardingLookingAroundMessage:
                'Expensify staat vooral bekend om uitgaven, reizen en beheer van bedrijfskaarten, maar we doen veel meer dan dat. Laat me weten waarin u geïnteresseerd bent en ik help u op weg.',
            onboardingTestDriveReceiverMessage: '*U heeft 3 maanden gratis! Begin hieronder.*',
        },
        workspace: {
            title: 'Blijf georganiseerd met een werkruimte',
            subtitle: 'Ontgrendel krachtige tools om uw onkostenbeheer te vereenvoudigen, allemaal op één plek. Met een werkruimte kunt u:',
            explanationModal: {
                descriptionOne: 'Volg en organiseer bonnen',
                descriptionTwo: 'Categoriseer en label uitgaven',
                descriptionThree: 'Rapporten maken en delen',
            },
            price: 'Probeer het 30 dagen gratis, upgrade daarna voor slechts <strong>$5/gebruiker/maand</strong>.',
            createWorkspace: 'Werkruimte maken',
        },
        confirmWorkspace: {
            title: 'Bevestig werkruimte',
            subtitle: 'Maak een werkruimte om bonnetjes bij te houden, uitgaven te vergoeden, reizen te beheren, rapporten te maken en meer — allemaal op de snelheid van chatten.',
        },
        inviteMembers: {
            title: 'Leden uitnodigen',
            subtitle: 'Beheer en deel je uitgaven met een accountant of start een reisgroep met vrienden.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Toon me dit niet meer',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Naam mag de woorden Expensify of Concierge niet bevatten',
            hasInvalidCharacter: 'Naam mag geen komma of puntkomma bevatten',
            requiredFirstName: 'Voornaam mag niet leeg zijn',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Wat is je wettelijke naam?',
        enterDateOfBirth: 'Wat is je geboortedatum?',
        enterAddress: 'Wat is jouw adres?',
        enterPhoneNumber: 'Wat is je telefoonnummer?',
        personalDetails: 'Persoonlijke gegevens',
        privateDataMessage: 'Deze gegevens worden gebruikt voor reizen en betalingen. Ze worden nooit getoond op je openbare profiel.',
        legalName: 'Wettelijke naam',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Wettelijke achternaam',
        address: 'Adres',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `De datum moet vóór ${dateString} zijn.`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `Datum moet na ${dateString} zijn.`,
            hasInvalidCharacter: 'Naam mag alleen Latijnse tekens bevatten',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Onjuist postcodeformaat${zipFormat ? `Acceptabel formaat: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Zorg ervoor dat het telefoonnummer geldig is (bijv. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link is opnieuw verzonden',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `Ik heb een magische inloglink gestuurd naar ${login}. Controleer je ${loginType} om in te loggen.`,
        resendLink: 'Link opnieuw verzenden',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Om ${secondaryLogin} te valideren, stuur de magische code opnieuw vanuit de Accountinstellingen van ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Als je geen toegang meer hebt tot ${primaryLogin}, koppel dan je accounts los.`,
        unlink: 'Ontkoppelen',
        linkSent: 'Link verzonden!',
        successfullyUnlinkedLogin: 'Secundaire login succesvol losgekoppeld!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Onze e-mailprovider heeft tijdelijk e-mails naar ${login} opgeschort vanwege bezorgproblemen. Volg deze stappen om uw login te deblokkeren:`,
        confirmThat: ({login}: ConfirmThatParams) =>
            `<strong>Bevestig dat ${login} correct gespeld is en een echt, bezorgbaar e-mailadres is.</strong> E-mailaliassen zoals "expenses@domain.com" moeten toegang hebben tot hun eigen e-mailinbox om een geldige Expensify-login te zijn.`,
        ensureYourEmailClient: `<strong>Zorg ervoor dat uw e-mailclient e-mails van expensify.com toestaat.</strong> Je kunt hier <a href="${CONST.SET_NOTIFICATION_LINK}"></a> vinden hoe je deze stap uitvoert, maar het kan zijn dat je IT-afdeling je moet helpen bij het configureren van je e-mailinstellingen.`,
        onceTheAbove: `Als de bovenstaande stappen zijn voltooid, neem dan contact op met <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> om uw aanmelding te deblokkeren.`,
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `We zijn niet in staat geweest om sms-berichten te leveren aan ${login}, dus hebben we het tijdelijk opgeschort. Probeer uw nummer te valideren:`,
        validationSuccess: 'Je nummer is gevalideerd! Klik hieronder om een nieuwe magische inlogcode te verzenden.',
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
                return 'Wacht een moment voordat je het opnieuw probeert.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? 'dag' : 'dagen'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? 'uur' : 'uren'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? 'minuut' : 'minuten'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `Even geduld! Je moet ${timeText} wachten voordat je je nummer opnieuw kunt valideren.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Deelnemen',
    },
    detailsPage: {
        localTime: 'Lokale tijd',
    },
    newChatPage: {
        startGroup: 'Groep starten',
        addToGroup: 'Toevoegen aan groep',
    },
    yearPickerPage: {
        year: 'Jaar',
        selectYear: 'Selecteer een jaar alstublieft',
    },
    focusModeUpdateModal: {
        title: 'Welkom in de #focusmodus!',
        prompt: ({priorityModePageUrl}: FocusModeUpdateParams) =>
            `Blijf op de hoogte door alleen ongelezen chats of chats die uw aandacht nodig hebben te bekijken. Maak je geen zorgen, je kunt dit op elk moment wijzigen in <a href="${priorityModePageUrl}">instellingen</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'De chat die je zoekt kan niet worden gevonden.',
        getMeOutOfHere: 'Haal me hier weg',
        iouReportNotFound: 'De betalingsgegevens die u zoekt, kunnen niet worden gevonden.',
        notHere: 'Hmm... het is hier niet.',
        pageNotFound: 'Oeps, deze pagina kan niet worden gevonden',
        noAccess: 'Deze chat of uitgave is mogelijk verwijderd of je hebt er geen toegang toe.\n\nVoor vragen kun je contact opnemen met concierge@expensify.com',
        goBackHome: 'Ga terug naar de startpagina',
        commentYouLookingForCannotBeFound: 'De opmerking die je zoekt, is niet gevonden. Ga terug naar de chat',
        contactConcierge: 'Voor vragen kun je contact opnemen met concierge@expensify.com',
        goToChatInstead: 'Ga in plaats daarvan naar de chat.',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Oeps... ${isBreakLine ? '\n' : ''}Er is iets misgegaan`,
        subtitle: 'Uw verzoek kon niet worden voltooid. Probeer het later opnieuw.',
        wrongTypeSubtitle: 'Die zoekopdracht is niet geldig. Probeer je zoekcriteria aan te passen.',
    },
    setPasswordPage: {
        enterPassword: 'Voer een wachtwoord in',
        setPassword: 'Stel wachtwoord in',
        newPasswordPrompt: 'Je wachtwoord moet minimaal 8 tekens bevatten, 1 hoofdletter, 1 kleine letter en 1 cijfer.',
        passwordFormTitle: 'Welkom terug bij de Nieuwe Expensify! Stel alstublieft uw wachtwoord in.',
        passwordNotSet: 'We konden uw nieuwe wachtwoord niet instellen. We hebben u een nieuwe wachtwoordlink gestuurd om het opnieuw te proberen.',
        setPasswordLinkInvalid: 'Deze link om het wachtwoord in te stellen is ongeldig of verlopen. Er wacht een nieuwe in je e-mailinbox!',
        validateAccount: 'Account verifiëren',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: "Voeg een emoji toe om je collega's en vrienden een gemakkelijke manier te geven om te weten wat er aan de hand is. Je kunt optioneel ook een bericht toevoegen!",
        today: 'Vandaag',
        clearStatus: 'Status wissen',
        save: 'Opslaan',
        message: 'Bericht',
        timePeriods: {
            never: 'Nooit',
            thirtyMinutes: '30 minuten',
            oneHour: '1 uur',
            afterToday: 'Vandaag',
            afterWeek: 'Een week',
            custom: 'Aangepast',
        },
        untilTomorrow: 'Tot morgen',
        untilTime: ({time}: UntilTimeParams) => `Tot ${time}`,
        date: 'Datum',
        time: 'Tijd',
        clearAfter: 'Wissen na',
        whenClearStatus: 'Wanneer moeten we je status wissen?',
        vacationDelegate: 'Vakantievervanger',
        setVacationDelegate: `Stel een vakantievervanger in om rapporten namens jou goed te keuren terwijl je afwezig bent.`,
        vacationDelegateError: 'Er is een fout opgetreden bij het bijwerken van je vakantievervanger.',
        asVacationDelegate: ({nameOrEmail: managerName}: VacationDelegateParams) => `als vakantievervanger van ${managerName}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `aan ${submittedToName} als vakantievervanger van ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Je wijst ${nameOrEmail} aan als je vakantievervanger. Deze persoon zit nog niet in al je werkruimtes. Als je doorgaat, wordt er een e-mail gestuurd naar alle beheerders van je werkruimtes om hem/haar toe te voegen.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `Stap ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Bankgegevens',
        confirmBankInfo: 'Bevestig bankgegevens',
        manuallyAdd: 'Voeg handmatig uw bankrekening toe',
        letsDoubleCheck: 'Laten we dubbel controleren of alles er goed uitziet.',
        accountEnding: 'Account eindigend op',
        thisBankAccount: 'Deze bankrekening zal worden gebruikt voor zakelijke betalingen in uw werkruimte.',
        accountNumber: 'Rekeningnummer',
        routingNumber: 'Routingsnummer',
        chooseAnAccountBelow: 'Kies een account hieronder',
        addBankAccount: 'Bankrekening toevoegen',
        chooseAnAccount: 'Kies een account',
        connectOnlineWithPlaid: 'Log in bij uw bank',
        connectManually: 'Handmatig verbinden',
        desktopConnection: 'Opmerking: Om verbinding te maken met Chase, Wells Fargo, Capital One of Bank of America, klik hier om dit proces in een browser te voltooien.',
        yourDataIsSecure: 'Uw gegevens zijn veilig.',
        toGetStarted:
            'Voeg een bankrekening toe om onkosten terug te betalen, Expensify-kaarten uit te geven, factuurbetalingen te innen en rekeningen te betalen, allemaal vanuit één plek.',
        plaidBodyCopy: 'Geef uw medewerkers een eenvoudigere manier om te betalen - en terugbetaald te worden - voor bedrijfskosten.',
        checkHelpLine: 'Uw routingnummer en rekeningnummer kunt u vinden op een cheque voor de rekening.',
        hasPhoneLoginError: ({contactMethodRoute}: ContactMethodParams) =>
            `Om een bankrekening te koppelen, graag <a href="${contactMethodRoute}">voeg een e-mail toe als je primaire login</a> en probeer het opnieuw. U kunt uw telefoonnummer toevoegen als secundaire login.`,
        hasBeenThrottledError: 'Er is een fout opgetreden bij het toevoegen van uw bankrekening. Wacht een paar minuten en probeer het opnieuw.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Oeps! Het lijkt erop dat de valuta van uw werkruimte is ingesteld op een andere valuta dan USD. Om verder te gaan, ga naar <a href="${workspaceRoute}">uw werkruimte-instellingen</a> om het in te stellen op USD en het opnieuw te proberen.`,
        bbaAdded: 'Zakelijke bankrekening toegevoegd!',
        bbaAddedDescription: 'Het is klaar om gebruikt te worden voor betalingen.',
        error: {
            youNeedToSelectAnOption: 'Selecteer een optie om verder te gaan.',
            noBankAccountAvailable: 'Sorry, er is geen bankrekening beschikbaar',
            noBankAccountSelected: 'Kies een account aub',
            taxID: 'Voer een geldig belastingnummer in alstublieft.',
            website: 'Voer een geldige website in alstublieft',
            zipCode: `Voer een geldige postcode in met het formaat: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Voer alstublieft een geldig telefoonnummer in',
            email: 'Voer een geldig e-mailadres in',
            companyName: 'Voer een geldige bedrijfsnaam in alstublieft',
            addressCity: 'Voer een geldige stad in, alstublieft',
            addressStreet: 'Voer een geldig straatadres in',
            addressState: 'Selecteer een geldige staat alstublieft',
            incorporationDateFuture: 'Oprichtingsdatum kan niet in de toekomst liggen',
            incorporationState: 'Selecteer een geldige staat alstublieft',
            industryCode: 'Voer een geldige industrieclassificatiecode in met zes cijfers.',
            restrictedBusiness: 'Bevestig alstublieft dat het bedrijf niet op de lijst van beperkte bedrijven staat.',
            routingNumber: 'Voer een geldig routenummer in alstublieft',
            accountNumber: 'Voer een geldig rekeningnummer in alstublieft.',
            routingAndAccountNumberCannotBeSame: 'Routing- en rekeningnummers kunnen niet overeenkomen.',
            companyType: 'Selecteer een geldig bedrijfstype alstublieft',
            tooManyAttempts: 'Vanwege een groot aantal inlogpogingen is deze optie voor 24 uur uitgeschakeld. Probeer het later opnieuw of voer de gegevens handmatig in.',
            address: 'Voer een geldig adres in alstublieft',
            dob: 'Selecteer een geldige geboortedatum alstublieft',
            age: 'Moet ouder zijn dan 18 jaar',
            ssnLast4: 'Voer de geldige laatste 4 cijfers van het BSN in.',
            firstName: 'Voer een geldige voornaam in alstublieft',
            lastName: 'Voer een geldige achternaam in alstublieft',
            noDefaultDepositAccountOrDebitCardAvailable: 'Voeg een standaard depositorekening of debetkaart toe alsjeblieft',
            validationAmounts: 'De ingevoerde validatiebedragen zijn onjuist. Controleer uw bankafschrift en probeer het opnieuw.',
            fullName: 'Voer een geldige volledige naam in alstublieft',
            ownershipPercentage: 'Voer een geldig percentage in.',
            deletePaymentBankAccount:
                'To konto bankowe nie może zostać usunięte, ponieważ jest używane do płatności kartą Expensify. Jeśli mimo to chcesz usunąć to konto, skontaktuj się z Concierge.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Waar bevindt zich uw bankrekening?',
        accountDetailsStepHeader: 'Wat zijn uw accountgegevens?',
        accountTypeStepHeader: 'Wat voor soort account is dit?',
        bankInformationStepHeader: 'Wat zijn uw bankgegevens?',
        accountHolderInformationStepHeader: 'Wat zijn de gegevens van de rekeninghouder?',
        howDoWeProtectYourData: 'Hoe beschermen we uw gegevens?',
        currencyHeader: 'Wat is de valuta van uw bankrekening?',
        confirmationStepHeader: 'Controleer uw gegevens.',
        confirmationStepSubHeader: 'Controleer de onderstaande gegevens en vink het vakje met de voorwaarden aan om te bevestigen.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Voer Expensify-wachtwoord in',
        alreadyAdded: 'Dit account is al toegevoegd.',
        chooseAccountLabel: 'Account',
        successTitle: 'Persoonlijke bankrekening toegevoegd!',
        successMessage: 'Gefeliciteerd, je bankrekening is ingesteld en klaar om terugbetalingen te ontvangen.',
    },
    attachmentView: {
        unknownFilename: 'Onbekende bestandsnaam',
        passwordRequired: 'Voer een wachtwoord in alstublieft',
        passwordIncorrect: 'Onjuist wachtwoord. Probeer het opnieuw.',
        failedToLoadPDF: 'Laden van PDF-bestand mislukt',
        pdfPasswordForm: {
            title: 'Wachtwoord beveiligde PDF',
            infoText: 'Deze PDF is met een wachtwoord beveiligd.',
            beforeLinkText: 'Alstublieft',
            linkText: 'voer het wachtwoord in',
            afterLinkText: 'om het te bekijken.',
            formLabel: 'PDF bekijken',
        },
        attachmentNotFound: 'Bijlage niet gevonden',
        retry: 'Opnieuw proberen',
    },
    messages: {
        errorMessageInvalidPhone: `Voer alstublieft een geldig telefoonnummer in zonder haakjes of streepjes. Als u zich buiten de VS bevindt, voeg dan uw landcode toe (bijv. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Ongeldig e-mailadres',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} is al lid van ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Door door te gaan met het verzoek om je Expensify Wallet te activeren, bevestig je dat je hebt gelezen, begrepen en accepteert',
        facialScan: "Onfido's beleid en vrijgave voor gezichtsherkenning",
        tryAgain: 'Probeer het opnieuw',
        verifyIdentity: 'Identiteit verifiëren',
        letsVerifyIdentity: 'Laten we uw identiteit verifiëren',
        butFirst: `Maar eerst het saaie gedeelte. Lees de juridische tekst in de volgende stap en klik op "Accepteren" wanneer je klaar bent.`,
        genericError: 'Er is een fout opgetreden bij het verwerken van deze stap. Probeer het alstublieft opnieuw.',
        cameraPermissionsNotGranted: 'Camera-toegang inschakelen',
        cameraRequestMessage: 'We hebben toegang tot je camera nodig om de verificatie van je bankrekening te voltooien. Schakel dit in via Instellingen > New Expensify.',
        microphonePermissionsNotGranted: 'Microfoontoegang inschakelen',
        microphoneRequestMessage: 'We hebben toegang tot uw microfoon nodig om de verificatie van de bankrekening te voltooien. Schakel dit in via Instellingen > New Expensify.',
        originalDocumentNeeded: 'Upload alstublieft een originele afbeelding van uw ID in plaats van een screenshot of gescande afbeelding.',
        documentNeedsBetterQuality:
            'Uw ID lijkt beschadigd te zijn of mist beveiligingskenmerken. Upload alstublieft een originele afbeelding van een onbeschadigd ID dat volledig zichtbaar is.',
        imageNeedsBetterQuality: 'Er is een probleem met de beeldkwaliteit van uw ID. Upload alstublieft een nieuwe afbeelding waarop uw volledige ID duidelijk te zien is.',
        selfieIssue: 'Er is een probleem met je selfie/video. Upload alstublieft een live selfie/video.',
        selfieNotMatching: 'Je selfie/video komt niet overeen met je ID. Upload alstublieft een nieuwe selfie/video waarop je gezicht duidelijk te zien is.',
        selfieNotLive: 'Je selfie/video lijkt geen live foto/video te zijn. Upload alstublieft een live selfie/video.',
    },
    additionalDetailsStep: {
        headerTitle: 'Aanvullende details',
        helpText: 'We moeten de volgende informatie bevestigen voordat je geld kunt verzenden en ontvangen vanuit je portemonnee.',
        helpTextIdologyQuestions: 'We moeten je nog een paar vragen stellen om je identiteit te verifiëren.',
        helpLink: 'Lees meer over waarom we dit nodig hebben.',
        legalFirstNameLabel: 'Wettelijke voornaam',
        legalMiddleNameLabel: 'Wettelijke tweede naam',
        legalLastNameLabel: 'Wettelijke achternaam',
        selectAnswer: 'Selecteer een reactie om door te gaan.',
        ssnFull9Error: 'Voer een geldig negencijferig BSN in.',
        needSSNFull9: 'We hebben problemen met het verifiëren van uw SSN. Voer alstublieft de volledige negen cijfers van uw SSN in.',
        weCouldNotVerify: 'We konden niet verifiëren',
        pleaseFixIt: 'Pas deze informatie aan voordat u verdergaat.',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `We konden uw identiteit niet verifiëren. Probeer het later opnieuw of neem contact op met <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> als je vragen hebt.`,
    },
    termsStep: {
        headerTitle: 'Voorwaarden en kosten',
        headerTitleRefactor: 'Kosten en voorwaarden',
        haveReadAndAgreePlain: 'Ik heb de elektronische openbaarmakingen gelezen en ga ermee akkoord deze te ontvangen.',
        haveReadAndAgree: `Ik heb de <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">elektronische openbaarmakingen</a> gelezen en ga ermee akkoord deze te ontvangen.`,
        agreeToThePlain: 'Ik ga akkoord met de Privacy & Portemonnee overeenkomst.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a> en <a href="${walletAgreementUrl}">Portemonnee overeenkomst</a>.`,
        enablePayments: 'Betalingen inschakelen',
        monthlyFee: 'Maandelijkse vergoeding',
        inactivity: 'Inactiviteit',
        noOverdraftOrCredit: 'Geen roodstand-/kredietfunctie.',
        electronicFundsWithdrawal: 'Elektronische geldopname',
        standard: 'Standaard',
        reviewTheFees: 'Bekijk enkele kosten.',
        checkTheBoxes: 'Vink de onderstaande vakjes aan.',
        agreeToTerms: 'Ga akkoord met de voorwaarden en je bent klaar om te beginnen!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `De Expensify Wallet wordt uitgegeven door ${walletProgram}.`,
            perPurchase: 'Per aankoop',
            atmWithdrawal: 'Geldopname bij geldautomaat',
            cashReload: 'Contant herladen',
            inNetwork: 'in-netwerk',
            outOfNetwork: 'buiten het netwerk',
            atmBalanceInquiry: 'Saldo-opvraag bij geldautomaat (in-netwerk of buiten-netwerk)',
            customerService: 'Klantenservice (geautomatiseerd of live agent)',
            inactivityAfterTwelveMonths: 'Inactiviteit (na 12 maanden zonder transacties)',
            weChargeOneFee: 'We rekenen 1 ander type vergoeding aan. Het is:',
            fdicInsurance: 'Uw fondsen komen in aanmerking voor FDIC-verzekering.',
            generalInfo: `Ga voor algemene informatie over prepaidrekeningen naar <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Ga voor meer informatie en voorwaarden voor alle kosten en services naar <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> of bel +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektronische geldopname (instant)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Een lijst van alle Expensify Wallet-kosten',
            typeOfFeeHeader: 'Alle kosten',
            feeAmountHeader: 'Bedrag',
            moreDetailsHeader: 'Details',
            openingAccountTitle: 'Een account openen',
            openingAccountDetails: 'Er zijn geen kosten verbonden aan het openen van een account.',
            monthlyFeeDetails: 'Er zijn geen maandelijkse kosten.',
            customerServiceTitle: 'Klantenservice',
            customerServiceDetails: 'Er zijn geen klantenservicekosten.',
            inactivityDetails: 'Er is geen inactiviteitsvergoeding.',
            sendingFundsTitle: 'Geld verzenden naar een andere rekeninghouder',
            sendingFundsDetails: 'Er zijn geen kosten verbonden aan het overmaken van geld naar een andere rekeninghouder met behulp van je saldo, bankrekening of betaalkaart.',
            electronicFundsStandardDetails:
                'Er zijn geen kosten verbonden aan het overmaken van geld van je Expensify Wallet naar je bankrekening via de standaard optie. Deze overschrijving is meestal binnen 1-3 werkdagen voltooid.',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                'Er zijn kosten verbonden aan het overmaken van geld van je Expensify Wallet naar je gekoppelde debetkaart met de optie voor directe overboeking.' +
                `Deze overdracht is meestal binnen enkele minuten voltooid. De kosten zijn ${percentage}% an het transferbedrag (met een minimum van ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Uw tegoeden komen in aanmerking voor FDIC-verzekering. Uw tegoeden worden bewaard bij of overgedragen aan ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, een FDIC-gegarandeerde instelling.` +
                ` Daar is uw geld tot ${amount} verzekerd door de FDIC in het geval ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} failliet gaat, als aan de specifieke vereisten voor depositoverzekering wordt voldaan en uw kaart is geregistreerd.` +
                ` Zie ${CONST.TERMS.FDIC_PREPAID} voor meer informatie.`,
            contactExpensifyPayments: `Neem contact op met ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} door te bellen naar +1 833-400-0904, per e-mail naar ${CONST.EMAIL.CONCIERGE} of meld je aan op ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Ga voor algemene informatie over prepaidrekeningen naar ${CONST.TERMS.CFPB_PREPAID}. Als u een klacht hebt over een prepaidrekening, bel dan het Consumer Financial Protection Bureau op 1-855-411-2372 of ga naar ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Bekijk printervriendelijke versie',
            automated: 'Geautomatiseerd',
            liveAgent: 'Live agent',
            instant: 'Instant',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Betalingen inschakelen',
        activatedTitle: 'Wallet geactiveerd!',
        activatedMessage: 'Gefeliciteerd, je portemonnee is ingesteld en klaar om betalingen te doen.',
        checkBackLaterTitle: 'Een ogenblikje...',
        checkBackLaterMessage: 'We zijn uw informatie nog aan het beoordelen. Kom later nog eens terug.',
        continueToPayment: 'Doorgaan naar betaling',
        continueToTransfer: 'Doorgaan met overboeken',
    },
    companyStep: {
        headerTitle: 'Bedrijfsinformatie',
        subtitle: 'Bijna klaar! Voor veiligheidsdoeleinden moeten we enkele gegevens bevestigen:',
        legalBusinessName: 'Juridische bedrijfsnaam',
        companyWebsite: 'Bedrijfswebsite',
        taxIDNumber: 'Belastingnummer',
        taxIDNumberPlaceholder: '9 cijfers',
        companyType: 'Bedrijfstype',
        incorporationDate: 'Oprichtingsdatum',
        incorporationState: 'Oprichtingsstaat',
        industryClassificationCode: 'Industrieclassificatiecode',
        confirmCompanyIsNot: 'Ik bevestig dat dit bedrijf niet op de',
        listOfRestrictedBusinesses: 'lijst van beperkte bedrijven',
        incorporationDatePlaceholder: 'Startdatum (jjjj-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerschap',
            COOPERATIVE: 'Coöperatief',
            SOLE_PROPRIETORSHIP: 'Eenmanszaak',
            OTHER: 'Andere',
        },
        industryClassification: 'Onder welke branche valt het bedrijf?',
        industryClassificationCodePlaceholder: 'Zoek naar industrieclassificatiecode',
    },
    requestorStep: {
        headerTitle: 'Persoonlijke informatie',
        learnMore: 'Meer informatie',
        isMyDataSafe: 'Zijn mijn gegevens veilig?',
    },
    personalInfoStep: {
        personalInfo: 'Persoonlijke info',
        enterYourLegalFirstAndLast: 'Wat is je wettelijke naam?',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Wettelijke achternaam',
        legalName: 'Wettelijke naam',
        enterYourDateOfBirth: 'Wat is je geboortedatum?',
        enterTheLast4: 'Wat zijn de laatste vier cijfers van uw burgerservicenummer?',
        dontWorry: 'Maak je geen zorgen, we doen geen persoonlijke kredietcontroles!',
        last4SSN: 'Laatste 4 van SSN',
        enterYourAddress: 'Wat is jouw adres?',
        address: 'Adres',
        letsDoubleCheck: 'Laten we dubbel controleren of alles er goed uitziet.',
        byAddingThisBankAccount: 'Door deze bankrekening toe te voegen, bevestig je dat je hebt gelezen, begrepen en accepteert.',
        whatsYourLegalName: 'Wat is uw wettelijke naam?',
        whatsYourDOB: 'Wat is je geboortedatum?',
        whatsYourAddress: 'Wat is je adres?',
        whatsYourSSN: 'Wat zijn de laatste vier cijfers van uw burgerservicenummer?',
        noPersonalChecks: 'Maak je geen zorgen, hier worden geen persoonlijke kredietcontroles uitgevoerd!',
        whatsYourPhoneNumber: 'Wat is je telefoonnummer?',
        weNeedThisToVerify: 'We hebben dit nodig om uw portemonnee te verifiëren.',
    },
    businessInfoStep: {
        businessInfo: 'Bedrijfsinformatie',
        enterTheNameOfYourBusiness: 'Wat is de naam van uw bedrijf?',
        businessName: 'Juridische bedrijfsnaam',
        enterYourCompanyTaxIdNumber: 'Wat is het belastingnummer van uw bedrijf?',
        taxIDNumber: 'Belastingnummer',
        taxIDNumberPlaceholder: '9 cijfers',
        enterYourCompanyWebsite: 'Wat is de website van uw bedrijf?',
        companyWebsite: 'Bedrijfswebsite',
        enterYourCompanyPhoneNumber: 'Wat is het telefoonnummer van uw bedrijf?',
        enterYourCompanyAddress: 'Wat is het adres van uw bedrijf?',
        selectYourCompanyType: 'Wat voor soort bedrijf is het?',
        companyType: 'Bedrijfstype',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerschap',
            COOPERATIVE: 'Coöperatief',
            SOLE_PROPRIETORSHIP: 'Eenmanszaak',
            OTHER: 'Andere',
        },
        selectYourCompanyIncorporationDate: 'Wat is de oprichtingsdatum van uw bedrijf?',
        incorporationDate: 'Oprichtingsdatum',
        incorporationDatePlaceholder: 'Startdatum (jjjj-mm-dd)',
        incorporationState: 'Oprichtingsstaat',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In welke staat is uw bedrijf opgericht?',
        letsDoubleCheck: 'Laten we dubbel controleren of alles er goed uitziet.',
        companyAddress: 'Bedrijfsadres',
        listOfRestrictedBusinesses: 'lijst van beperkte bedrijven',
        confirmCompanyIsNot: 'Ik bevestig dat dit bedrijf niet op de',
        businessInfoTitle: 'Bedrijfsinformatie',
        legalBusinessName: 'Juridische bedrijfsnaam',
        whatsTheBusinessName: 'Wat is de bedrijfsnaam?',
        whatsTheBusinessAddress: 'Wat is het zakelijke adres?',
        whatsTheBusinessContactInformation: 'Wat zijn de zakelijke contactgegevens?',
        whatsTheBusinessRegistrationNumber: ({country}: BusinessRegistrationNumberParams) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Wat is het bedrijfsregistratienummer (CRN)?';
                default:
                    return 'Wat is het bedrijfsregistratienummer?';
            }
        },
        whatsTheBusinessTaxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Wat is het Employer Identification Number (EIN)?';
                case CONST.COUNTRY.CA:
                    return 'Wat is het Business Number (BN)?';
                case CONST.COUNTRY.GB:
                    return 'Wat is het btw-registratienummer (VRN)?';
                case CONST.COUNTRY.AU:
                    return 'Wat is het Australisch bedrijfsnummer (ABN)?';
                default:
                    return 'Wat is het EU btw-nummer?';
            }
        },
        whatsThisNumber: 'Wat is dit nummer?',
        whereWasTheBusinessIncorporated: 'Waar is het bedrijf opgericht?',
        whatTypeOfBusinessIsIt: 'Wat voor soort bedrijf is het?',
        whatsTheBusinessAnnualPayment: 'Wat is het jaarlijkse betalingsvolume van het bedrijf?',
        whatsYourExpectedAverageReimbursements: 'Wat is je verwachte gemiddelde terugbetalingsbedrag?',
        registrationNumber: 'Registratienummer',
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
                    return 'EU btw';
            }
        },
        businessAddress: 'Zakelijk adres',
        businessType: 'Zakelijk type',
        incorporation: 'Oprichting',
        incorporationCountry: 'Oprichtingsland',
        incorporationTypeName: 'Incorporatietype',
        businessCategory: 'Zakelijke categorie',
        annualPaymentVolume: 'Jaarlijks betalingsvolume',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Jaarlijks betalingsvolume in ${currencyCode}`,
        averageReimbursementAmount: 'Gemiddeld terugbetalingsbedrag',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Gemiddeld terugbetalingsbedrag in ${currencyCode}`,
        selectIncorporationType: 'Selecteer het type oprichting',
        selectBusinessCategory: 'Selecteer bedrijfssector',
        selectAnnualPaymentVolume: 'Selecteer jaarlijks betalingsvolume',
        selectIncorporationCountry: 'Selecteer oprichtingsland',
        selectIncorporationState: 'Selecteer oprichtingsstaat',
        selectAverageReimbursement: 'Selecteer het gemiddelde terugbetalingsbedrag',
        selectBusinessType: 'Selecteer zakelijk type',
        findIncorporationType: 'Vind het type oprichting',
        findBusinessCategory: 'Zakelijke categorie vinden',
        findAnnualPaymentVolume: 'Vind jaarlijks betalingsvolume',
        findIncorporationState: 'Vind oprichtingsstaat',
        findAverageReimbursement: 'Vind het gemiddelde terugbetalingsbedrag',
        findBusinessType: 'Zakelijk type zoeken',
        error: {
            registrationNumber: 'Gelieve een geldig registratienummer op te geven',
            taxIDEIN: ({country}: BusinessTaxIDParams) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Voer een geldig Employer Identification Number (EIN) in';
                    case CONST.COUNTRY.CA:
                        return 'Voer een geldig Business Number (BN) in';
                    case CONST.COUNTRY.GB:
                        return 'Voer een geldig btw-registratienummer (VRN) in';
                    case CONST.COUNTRY.AU:
                        return 'Voer een geldig Australisch bedrijfsnummer (ABN) in';
                    default:
                        return 'Voer een geldig EU btw-nummer in';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: ({companyName}: CompanyNameParams) => `Bent u eigenaar van 25% of meer van ${companyName}?`,
        doAnyIndividualOwn25percent: ({companyName}: CompanyNameParams) => `Bezitten er individuen 25% of meer van ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: ({companyName}: CompanyNameParams) => `Zijn er meer personen die 25% of meer van ${companyName} bezitten?`,
        regulationRequiresUsToVerifyTheIdentity: 'Regelgeving vereist dat we de identiteit verifiëren van elke persoon die meer dan 25% van het bedrijf bezit.',
        companyOwner: 'Bedrijfseigenaar',
        enterLegalFirstAndLastName: 'Wat is de wettelijke naam van de eigenaar?',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Wettelijke achternaam',
        enterTheDateOfBirthOfTheOwner: 'Wat is de geboortedatum van de eigenaar?',
        enterTheLast4: 'Wat zijn de laatste 4 cijfers van het Social Security Number van de eigenaar?',
        last4SSN: 'Laatste 4 van SSN',
        dontWorry: 'Maak je geen zorgen, we doen geen persoonlijke kredietcontroles!',
        enterTheOwnersAddress: 'Wat is het adres van de eigenaar?',
        letsDoubleCheck: 'Laten we dubbel controleren of alles er goed uitziet.',
        legalName: 'Wettelijke naam',
        address: 'Adres',
        byAddingThisBankAccount: 'Door deze bankrekening toe te voegen, bevestig je dat je hebt gelezen, begrepen en accepteert.',
        owners: 'Eigenaren',
    },
    ownershipInfoStep: {
        ownerInfo: 'Eigenaar info',
        businessOwner: 'Bedrijfseigenaar',
        signerInfo: 'Ondertekenaar informatie',
        doYouOwn: ({companyName}: CompanyNameParams) => `Bent u eigenaar van 25% of meer van ${companyName}?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Bezitten er individuen 25% of meer van ${companyName}?`,
        regulationsRequire: 'Regelgeving vereist dat we de identiteit verifiëren van elke persoon die meer dan 25% van het bedrijf bezit.',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Wettelijke achternaam',
        whatsTheOwnersName: 'Wat is de wettelijke naam van de eigenaar?',
        whatsYourName: 'Wat is je wettelijke naam?',
        whatPercentage: 'Welk percentage van het bedrijf behoort toe aan de eigenaar?',
        whatsYoursPercentage: 'Welk percentage van het bedrijf bezit je?',
        ownership: 'Eigendom',
        whatsTheOwnersDOB: 'Wat is de geboortedatum van de eigenaar?',
        whatsYourDOB: 'Wat is je geboortedatum?',
        whatsTheOwnersAddress: 'Wat is het adres van de eigenaar?',
        whatsYourAddress: 'Wat is jouw adres?',
        whatAreTheLast: 'Wat zijn de laatste 4 cijfers van het burgerservicenummer van de eigenaar?',
        whatsYourLast: 'Wat zijn de laatste 4 cijfers van uw burgerservicenummer?',
        whatsYourNationality: 'Wat is uw nationaliteitsland?',
        whatsTheOwnersNationality: 'Wat is het nationaliteitsland van de eigenaar?',
        countryOfCitizenship: 'Nationaliteitsland',
        dontWorry: 'Maak je geen zorgen, we doen geen persoonlijke kredietcontroles!',
        last4: 'Laatste 4 van SSN',
        whyDoWeAsk: 'Waarom vragen we hierom?',
        letsDoubleCheck: 'Laten we dubbel controleren of alles er goed uitziet.',
        legalName: 'Wettelijke naam',
        ownershipPercentage: 'Eigendomsaandeel',
        areThereOther: ({companyName}: CompanyNameParams) => `Zijn er andere personen die 25% of meer van ${companyName} bezitten?`,
        owners: 'Eigenaren',
        addCertified: 'Voeg een gecertificeerd organigram toe dat de uiteindelijke belanghebbenden toont.',
        regulationRequiresChart:
            'Regelgeving vereist dat we een gecertificeerde kopie van het eigendomsdiagram verzamelen dat elke persoon of entiteit toont die 25% of meer van het bedrijf bezit.',
        uploadEntity: 'Upload eigendomsdiagram van entiteit',
        noteEntity: 'Opmerking: Het eigendomsschema van de entiteit moet worden ondertekend door uw accountant, juridisch adviseur, of notarieel bekrachtigd.',
        certified: 'Gecertificeerd eigendomsdiagram van entiteiten',
        selectCountry: 'Selecteer land',
        findCountry: 'Vind land',
        address: 'Adres',
        chooseFile: 'Bestand kiezen',
        uploadDocuments: 'Upload extra documentatie',
        pleaseUpload:
            'Upload alstublieft aanvullende documentatie hieronder om ons te helpen uw identiteit te verifiëren als directe of indirecte eigenaar van 25% of meer van de bedrijfsentiteit.',
        acceptedFiles: 'Geaccepteerde bestandsformaten: PDF, PNG, JPEG. Totale bestandsgrootte voor elk gedeelte mag niet groter zijn dan 5 MB.',
        proofOfBeneficialOwner: 'Bewijs van uiteindelijke belanghebbende',
        proofOfBeneficialOwnerDescription:
            'Gelieve een ondertekende verklaring en organigram van een openbare accountant, notaris of advocaat te verstrekken die het eigendom van 25% of meer van het bedrijf verifieert. Het moet gedateerd zijn binnen de laatste drie maanden en het licentienummer van de ondertekenaar bevatten.',
        copyOfID: 'Kopie van ID voor uiteindelijke begunstigde eigenaar',
        copyOfIDDescription: 'Voorbeelden: Paspoort, rijbewijs, enz.',
        proofOfAddress: 'Adresbewijs voor uiteindelijke begunstigde eigenaar',
        proofOfAddressDescription: 'Voorbeelden: Nutsrekening, huurovereenkomst, etc.',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription:
            'Upload alstublieft een video van een sitebezoek of een opgenomen gesprek met de ondertekenende functionaris. De functionaris moet het volgende verstrekken: volledige naam, geboortedatum, bedrijfsnaam, registratienummer, fiscaal codenummer, geregistreerd adres, aard van het bedrijf en doel van de rekening.',
    },
    completeVerificationStep: {
        completeVerification: 'Voltooi verificatie',
        confirmAgreements: 'Bevestig alstublieft de onderstaande overeenkomsten.',
        certifyTrueAndAccurate: 'Ik verklaar dat de verstrekte informatie waarheidsgetrouw en nauwkeurig is.',
        certifyTrueAndAccurateError: 'Verklaar alstublieft dat de informatie waar en nauwkeurig is.',
        isAuthorizedToUseBankAccount: 'Ik ben gemachtigd om deze zakelijke bankrekening te gebruiken voor zakelijke uitgaven.',
        isAuthorizedToUseBankAccountError: 'U moet een controlerende functionaris zijn met toestemming om de zakelijke bankrekening te beheren.',
        termsAndConditions: 'algemene voorwaarden',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Valideer uw bankrekening',
        validateButtonText: 'Valideren',
        validationInputLabel: 'Transactie',
        maxAttemptsReached: 'Validatie voor deze bankrekening is uitgeschakeld vanwege te veel onjuiste pogingen.',
        description: `Binnen 1-2 werkdagen sturen we drie (3) kleine transacties naar uw bankrekening van een naam zoals "Expensify, Inc. Validation".`,
        descriptionCTA: 'Voer alstublieft elk transactiebedrag in de onderstaande velden in. Voorbeeld: 1.51.',
        letsChatText: 'Bijna klaar! We hebben je hulp nodig om een paar laatste stukjes informatie via de chat te verifiëren. Klaar?',
        enable2FATitle: 'Voorkom fraude, schakel twee-factor-authenticatie (2FA) in',
        enable2FAText: 'We nemen uw beveiliging serieus. Stel nu 2FA in om een extra beveiligingslaag aan uw account toe te voegen.',
        secureYourAccount: 'Beveilig uw account',
    },
    countryStep: {
        confirmBusinessBank: 'Bevestig valuta en land van zakelijke bankrekening',
        confirmCurrency: 'Bevestig valuta en land',
        yourBusiness: 'De valuta van uw zakelijke bankrekening moet overeenkomen met de valuta van uw werkruimte.',
        youCanChange: 'U kunt de valuta van uw werkruimte wijzigen in uw',
        findCountry: 'Vind land',
        selectCountry: 'Selecteer land',
    },
    bankInfoStep: {
        whatAreYour: 'Wat zijn uw zakelijke bankgegevens?',
        letsDoubleCheck: 'Laten we dubbel controleren of alles er goed uitziet.',
        thisBankAccount: 'Deze bankrekening zal worden gebruikt voor zakelijke betalingen in uw werkruimte.',
        accountNumber: 'Rekeningnummer',
        accountHolderNameDescription: 'Volledige naam van de gemachtigde ondertekenaar',
    },
    signerInfoStep: {
        signerInfo: 'Ondertekenaar informatie',
        areYouDirector: ({companyName}: CompanyNameParams) => `Bent u een directeur bij ${companyName}?`,
        regulationRequiresUs: 'Regelgeving vereist dat we verifiëren of de ondertekenaar de bevoegdheid heeft om deze actie namens het bedrijf te ondernemen.',
        whatsYourName: 'Wat is uw wettelijke naam?',
        fullName: 'Volledige wettelijke naam',
        whatsYourJobTitle: 'Wat is je functietitel?',
        jobTitle: 'Functietitel',
        whatsYourDOB: 'Wat is je geboortedatum?',
        uploadID: 'Upload ID en bewijs van adres',
        personalAddress: 'Bewijs van persoonlijk adres (bijv. energierekening)',
        letsDoubleCheck: 'Laten we dubbel controleren of alles er goed uitziet.',
        legalName: 'Wettelijke naam',
        proofOf: 'Bewijs van persoonlijk adres',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Voer het e-mailadres in van de directeur bij ${companyName}`,
        regulationRequiresOneMoreDirector: 'Regelgeving vereist ten minste nog een directeur als ondertekenaar.',
        hangTight: 'Even geduld...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Voer de e-mailadressen in van twee directeuren bij ${companyName}`,
        sendReminder: 'Stuur een herinnering',
        chooseFile: 'Bestand kiezen',
        weAreWaiting: 'We wachten op anderen om hun identiteit te verifiëren als directeuren van het bedrijf.',
        id: 'Kopie van ID',
        proofOfDirectors: 'Bewijs van directeur(s)',
        proofOfDirectorsDescription: 'Voorbeelden: Oncorp bedrijfsprofiel of bedrijfsregistratie.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale voor ondertekenaars, gemachtigde gebruikers en uiteindelijk begunstigden.',
        PDSandFSG: 'PDS + FSG openbaarmakingsdocumenten',
        PDSandFSGDescription: dedent(`
            Onze samenwerking met Corpay maakt gebruik van een API-verbinding om hun uitgebreide netwerk van internationale bankpartners te benutten en Global Reimbursements in Expensify mogelijk te maken. In overeenstemming met Australische regelgeving verstrekken wij u de Financial Services Guide (FSG) en de Product Disclosure Statement (PDS) van Corpay.

            Lees de FSG- en PDS-documenten zorgvuldig, aangezien ze volledige details en belangrijke informatie bevatten over de producten en diensten die Corpay aanbiedt. Bewaar deze documenten voor toekomstig naslagwerk.
        `),
        pleaseUpload: 'Gelieve hieronder aanvullende documentatie te uploaden om ons te helpen uw identiteit als directeur van de zakelijke entiteit te verifiëren.',
        enterSignerInfo: 'Voer ondertekenaargegevens in',
        thisStep: 'Deze stap is voltooid',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `verbindt een zakelijke bankrekening in ${currency} eindigend op ${bankAccountLastFour} met Expensify om werknemers in ${currency} te betalen. De volgende stap vereist ondertekenaarinformatie van een directeur.`,
        error: {
            emailsMustBeDifferent: 'E-mailadressen moeten verschillend zijn',
        },
    },
    agreementsStep: {
        agreements: 'Overeenkomsten',
        pleaseConfirm: 'Bevestig alstublieft de onderstaande overeenkomsten',
        regulationRequiresUs: 'Regelgeving vereist dat we de identiteit verifiëren van elke persoon die meer dan 25% van het bedrijf bezit.',
        iAmAuthorized: 'Ik ben gemachtigd om de zakelijke bankrekening te gebruiken voor zakelijke uitgaven.',
        iCertify: 'Ik verklaar dat de verstrekte informatie waarheidsgetrouw en nauwkeurig is.',
        iAcceptTheTermsAndConditions: `Ik accepteer de <a href="https://cross-border.corpay.com/tc/">algemene voorwaarden</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Ik accepteer de algemene voorwaarden.',
        accept: 'Accepteren en bankrekening toevoegen',
        iConsentToThePrivacyNotice: 'Ik ga akkoord met de <a href="https://payments.corpay.com/compliance">privacyverklaring</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Ik ga akkoord met de privacyverklaring.',
        error: {
            authorized: 'U moet een controlerende functionaris zijn met toestemming om de zakelijke bankrekening te beheren.',
            certify: 'Verklaar alstublieft dat de informatie waar en nauwkeurig is.',
            consent: 'Gelieve in te stemmen met de privacyverklaring.',
        },
    },
    docusignStep: {
        subheader: 'Docusign-formulier',
        pleaseComplete:
            'Vul het ACH-autorisatieformulier in via de onderstaande Docusign-link en upload daarna een ondertekende kopie hier zodat we rechtstreeks geld van uw bankrekening kunnen afschrijven.',
        pleaseCompleteTheBusinessAccount: 'Vul de aanvraag voor een zakelijke rekening en de automatische incassoregeling in.',
        pleaseCompleteTheDirect:
            'Vul de automatische incassoregeling in via de onderstaande Docusign-link en upload daarna een ondertekende kopie hier zodat we rechtstreeks geld van uw bankrekening kunnen afschrijven.',
        takeMeTo: 'Ga naar Docusign',
        uploadAdditional: 'Upload extra documentatie',
        pleaseUpload: 'Upload het DEFT-formulier en de ondertekende Docusign-pagina.',
        pleaseUploadTheDirect: 'Upload de automatische incassoregelingen en de Docusign-handtekeningenpagina.',
    },
    finishStep: {
        letsFinish: 'Laten we in de chat afronden!',
        thanksFor:
            'Bedankt voor deze details. Een toegewijde supportmedewerker zal nu uw informatie bekijken. We nemen contact met u op als we nog iets van u nodig hebben, maar in de tussentijd kunt u gerust contact met ons opnemen als u vragen heeft.',
        iHaveA: 'Ik heb een vraag.',
        enable2FA: 'Schakel twee-factor-authenticatie (2FA) in om fraude te voorkomen',
        weTake: 'We nemen uw beveiliging serieus. Stel nu 2FA in om een extra beveiligingslaag aan uw account toe te voegen.',
        secure: 'Beveilig uw account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Een ogenblikje',
        explanationLine: 'We bekijken uw informatie. U kunt binnenkort doorgaan met de volgende stappen.',
    },
    session: {
        offlineMessageRetry: 'Het lijkt erop dat je offline bent. Controleer je verbinding en probeer het opnieuw.',
    },
    travel: {
        header: 'Boek reis',
        title: 'Reis slim',
        subtitle: 'Gebruik Expensify Travel om de beste reisaanbiedingen te krijgen en al uw zakelijke uitgaven op één plek te beheren.',
        features: {
            saveMoney: 'Bespaar geld op uw boekingen',
            alerts: 'Ontvang realtime updates en meldingen',
        },
        bookTravel: 'Boek reis',
        bookDemo: 'Demo boeken',
        bookADemo: 'Boek een demo',
        toLearnMore: 'om meer te leren.',
        termsAndConditions: {
            header: 'Voordat we verder gaan...',
            title: 'Algemene voorwaarden',
            label: 'Ik ga akkoord met de algemene voorwaarden',
            subtitle: `Ga akkoord met de <a href="${CONST.TRAVEL_TERMS_URL}">algemene voorwaarden</a> van Expensify Travel.`,
            error: 'U moet akkoord gaan met de Expensify Travel voorwaarden om door te gaan.',
            defaultWorkspaceError:
                'U moet een standaard werkruimte instellen om Expensify Travel in te schakelen. Ga naar Instellingen > Werkruimtes > klik op de drie verticale stippen naast een werkruimte > Stel in als standaard werkruimte, en probeer het opnieuw!',
        },
        flight: 'Vlucht',
        flightDetails: {
            passenger: 'Passagier',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Je hebt een <strong>${layover} tussenstop</strong> voor deze vlucht</muted-text-label>`,
            takeOff: 'Vertrek',
            landing: 'Landing',
            seat: 'Stoelplaats',
            class: 'Cabineklasse',
            recordLocator: 'Record locator',
            cabinClasses: {
                unknown: 'Onbekend',
                economy: 'Economie',
                premiumEconomy: 'Premium Economy',
                business: 'Zakelijk',
                first: 'Eerste',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Gast',
            checkIn: 'Inchecken',
            checkOut: 'Uitchecken',
            roomType: 'Kamertype',
            cancellation: 'Annuleringsbeleid',
            cancellationUntil: 'Gratis annulering tot',
            confirmation: 'Bevestigingsnummer',
            cancellationPolicies: {
                unknown: 'Onbekend',
                nonRefundable: 'Niet-restitueerbaar',
                freeCancellationUntil: 'Gratis annulering tot',
                partiallyRefundable: 'Gedeeltelijk restitueerbaar',
            },
        },
        car: 'Auto',
        carDetails: {
            rentalCar: 'Autoverhuur',
            pickUp: 'Ophalen',
            dropOff: 'Afleveren',
            driver: 'Bestuurder',
            carType: 'Autotype',
            cancellation: 'Annuleringsbeleid',
            cancellationUntil: 'Gratis annulering tot',
            freeCancellation: 'Gratis annulering',
            confirmation: 'Bevestigingsnummer',
        },
        train: 'Rail',
        trainDetails: {
            passenger: 'Passagier',
            departs: 'Vertrekt',
            arrives: 'Komt aan',
            coachNumber: 'Coachnummer',
            seat: 'Stoelplaats',
            fareDetails: 'Tariefdetails',
            confirmation: 'Bevestigingsnummer',
        },
        viewTrip: 'Bekijk reis',
        modifyTrip: 'Reis wijzigen',
        tripSupport: 'Reisondersteuning',
        tripDetails: 'Reisdetails',
        viewTripDetails: 'Bekijk reisdetails',
        trip: 'Reis',
        trips: 'Reizen',
        tripSummary: 'Reisoverzicht',
        departs: 'Vertrekt',
        errorMessage: 'Er is iets misgegaan. Probeer het later opnieuw.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr><a href="${phoneErrorMethodsRoute}">Voeg een werkmail toe als uw primaire login</a> om reizen te boeken.</rbr>`,
        domainSelector: {
            title: 'Domein',
            subtitle: 'Kies een domein voor de installatie van Expensify Travel.',
            recommended: 'Aanbevolen',
        },
        domainPermissionInfo: {
            title: 'Domein',
            restriction: ({domain}: DomainPermissionInfoRestrictionParams) =>
                `Je hebt geen toestemming om Expensify Travel in te schakelen voor het domein <strong>${domain}</strong>. Je moet iemand van dat domein vragen om Travel in te schakelen.`,
            accountantInvitation: `Als u accountant bent, overweeg dan om lid te worden van het <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! accountantsprogramma</a> om reizen voor dit domein mogelijk te maken.`,
        },
        publicDomainError: {
            title: 'Aan de slag met Expensify Travel',
            message: `Je moet je werk e-mail (bijv. naam@bedrijf.com) gebruiken met Expensify Travel, niet je persoonlijke e-mail (bijv. naam@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel is uitgeschakeld',
            message: `Je beheerder heeft Expensify Travel uitgeschakeld. Volg het boekingsbeleid van je bedrijf voor reisarrangementen.`,
        },
        verifyCompany: {
            title: 'Begin vandaag nog met reizen!',
            message: `Neem contact op met uw accountmanager of salesteam@expensify.com om een demo van reizen te krijgen en het voor uw bedrijf in te schakelen.`,
            confirmText: 'Begrepen',
            conciergeMessage: ({domain}: {domain: string}) => `Reismogelijkheid mislukt voor domein: ${domain}. Controleer en schakel reizen in voor dit domein.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Je vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is geboekt. Bevestigingscode: ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Uw ticket voor vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is geannuleerd.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Uw ticket voor vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is terugbetaald of omgeruild.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Je vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is geannuleerd door de luchtvaartmaatschappij.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) =>
                `De luchtvaartmaatschappij heeft een schemawijziging voorgesteld voor vlucht ${airlineCode}; we wachten op bevestiging.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Schemawijziging bevestigd: vlucht ${airlineCode} vertrekt nu om ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `Uw vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is bijgewerkt.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `Uw cabineklasse is bijgewerkt naar ${cabinClass} op vlucht ${airlineCode}.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Uw stoeltoewijzing op vlucht ${airlineCode} is bevestigd.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `Uw stoeltoewijzing op vlucht ${airlineCode} is gewijzigd.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `Uw stoeltoewijzing op vlucht ${airlineCode} is verwijderd.`,
            paymentDeclined: 'Betaling voor uw luchtboeking is mislukt. Probeer het alstublieft opnieuw.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Je hebt je ${type} reservering ${id} geannuleerd.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `De leverancier heeft uw ${type} reservering ${id} geannuleerd.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Uw ${type} reservering is opnieuw geboekt. Nieuwe bevestiging #:${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Je ${type} boeking is bijgewerkt. Bekijk de nieuwe details in het reisschema.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Uw treinkaartje voor ${origin} → ${destination} op ${startDate} is terugbetaald. Er zal een tegoed worden verwerkt.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Uw treinkaartje voor ${origin} → ${destination} op ${startDate} is omgeruild.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Je treinkaartje voor ${origin} → ${destination} op ${startDate} is bijgewerkt.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Je ${type} reservering is bijgewerkt.`,
        },
        flightTo: 'Vlucht naar',
        trainTo: 'Trein naar',
        carRental: ' autohuur',
        nightIn: 'nacht in',
        nightsIn: 'nachten in',
    },
    workspace: {
        common: {
            card: 'Kaarten',
            expensifyCard: 'Expensify Card',
            companyCards: 'Bedrijfskaarten',
            workflows: 'Werkstromen',
            workspace: 'Werkruimte',
            findWorkspace: 'Werkruimte vinden',
            edit: 'Werkruimte bewerken',
            enabled: 'Ingeschakeld',
            disabled: 'Uitgeschakeld',
            everyone: 'Iedereen',
            delete: 'Werkruimte verwijderen',
            settings: 'Instellingen',
            reimburse: 'Vergoedingen',
            categories: 'Categorieën',
            tags: 'Labels',
            customField1: 'Aangepast veld 1',
            customField2: 'Aangepast veld 2',
            customFieldHint: 'Voeg aangepaste codering toe die van toepassing is op alle uitgaven van dit lid.',
            reports: 'Rapporten',
            reportFields: 'Rapportvelden',
            reportTitle: 'Rapporttitel',
            reportField: 'Rapportveld',
            taxes: 'Belastingen',
            bills: 'Rekeningen',
            invoices: 'Facturen',
            perDiem: 'Per diem',
            travel: 'Reis',
            members: 'Leden',
            accounting: 'Boekhouding',
            receiptPartners: 'Bonnetjespartners',
            rules: 'Regels',
            displayedAs: 'Weergegeven als',
            plan: 'Plan',
            profile: 'Overzicht',
            bankAccount: 'Bankrekening',
            testTransactions: 'Testtransacties',
            issueAndManageCards: 'Kaarten uitgeven en beheren',
            reconcileCards: 'Reconcileer kaarten',
            selectAll: 'Alles selecteren',
            selected: () => ({
                one: '1 geselecteerd',
                other: (count: number) => `${count} geselecteerd`,
            }),
            settlementFrequency: 'Afwikkelingsfrequentie',
            setAsDefault: 'Instellen als standaardwerkruimte',
            defaultNote: `Ontvangstbewijzen verzonden naar ${CONST.EMAIL.RECEIPTS} zullen in deze werkruimte verschijnen.`,
            deleteConfirmation: 'Weet je zeker dat je deze werkruimte wilt verwijderen?',
            deleteWithCardsConfirmation: 'Weet je zeker dat je deze werkruimte wilt verwijderen? Dit zal alle kaartfeeds en toegewezen kaarten verwijderen.',
            unavailable: 'Niet-beschikbare werkruimte',
            memberNotFound: 'Lid niet gevonden. Om een nieuw lid aan de werkruimte toe te voegen, gebruik de uitnodigingsknop hierboven.',
            notAuthorized: `Je hebt geen toegang tot deze pagina. Als je probeert lid te worden van deze werkruimte, vraag dan de eigenaar van de werkruimte om je als lid toe te voegen. Iets anders? Neem contact op met ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Ga naar werkruimte',
            duplicateWorkspace: 'Dubbele werkruimte',
            duplicateWorkspacePrefix: 'Duplicaat',
            goToWorkspaces: 'Ga naar werkruimtes',
            clearFilter: 'Filter wissen',
            workspaceName: 'Werkruimte naam',
            workspaceOwner: 'Eigenaar',
            workspaceType: 'Werkruimte type',
            workspaceAvatar: 'Werkruimte avatar',
            mustBeOnlineToViewMembers: 'U moet online zijn om de leden van deze werkruimte te bekijken.',
            moreFeatures: 'Meer functies',
            requested: 'Aangevraagd',
            distanceRates: 'Afstandstarieven',
            defaultDescription: 'Eén plek voor al je bonnetjes en uitgaven.',
            descriptionHint: 'Deel informatie over deze werkruimte met alle leden.',
            welcomeNote: 'Gebruik alstublieft Expensify om uw bonnetjes in te dienen voor terugbetaling, bedankt!',
            subscription: 'Abonnement',
            markAsEntered: 'Markeren als handmatig ingevoerd',
            markAsExported: 'Markeren als geëxporteerd',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exporteer naar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Laten we dubbel controleren of alles er goed uitziet.',
            lineItemLevel: 'Regelniveau',
            reportLevel: 'Rapportniveau',
            topLevel: 'Topniveau',
            appliedOnExport: 'Niet geïmporteerd in Expensify, toegepast bij exporteren',
            shareNote: {
                header: 'Deel je werkruimte met andere leden',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Deel deze QR-code of kopieer de onderstaande link om het voor leden gemakkelijk te maken om toegang tot uw werkruimte aan te vragen. Alle verzoeken om lid te worden van de werkruimte worden weergegeven in de <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a>-ruimte, zodat u ze kunt beoordelen.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Verbinden met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Nieuwe verbinding maken',
            reuseExistingConnection: 'Bestaande verbinding hergebruiken',
            existingConnections: 'Bestaande verbindingen',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Aangezien je eerder verbinding hebt gemaakt met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, kun je ervoor kiezen om een bestaande verbinding opnieuw te gebruiken of een nieuwe te maken.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Laatst gesynchroniseerd op ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Kan geen verbinding maken met ${connectionName} vanwege een authenticatiefout.`,
            learnMore: 'Meer informatie',
            memberAlternateText: 'Leden kunnen rapporten indienen en goedkeuren.',
            adminAlternateText: 'Beheerders hebben volledige bewerkingsrechten voor alle rapporten en werkruimte-instellingen.',
            auditorAlternateText: 'Auditors kunnen rapporten bekijken en erop reageren.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Admin';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Auditor';
                    case CONST.POLICY.ROLE.USER:
                        return 'Lid';
                    default:
                        return 'Lid';
                }
            },
            frequency: {
                manual: 'Handmatig',
                instant: 'Instant',
                immediate: 'Dagelijks',
                trip: 'Per reis',
                weekly: 'Wekelijks',
                semimonthly: 'Twee keer per maand',
                monthly: 'Maandelijks',
            },
            planType: 'Plansoort',
            submitExpense: 'Dien uw onkosten hieronder in:',
            defaultCategory: 'Standaardcategorie',
            viewTransactions: 'Transacties bekijken',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Uitgaven van ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card transacties worden automatisch geëxporteerd naar een “Expensify Card Liability Account” die is aangemaakt met <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">onze integratie</a>.</muted-text-label>`,
        },
        receiptPartners: {
            connect: 'Maak nu verbinding',
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Verbonden met ${organizationName}` : 'Automatiseer reis- en maaltijdbezorgingskosten binnen uw organisatie.',
                sendInvites: 'Leden uitnodigen',
                sendInvitesDescription: 'Deze workspace-leden hebben nog geen Uber for Business-account. Deselecteer alle leden die u op dit moment niet wilt uitnodigen.',
                confirmInvite: 'Uitnodiging bevestigen',
                manageInvites: 'Beheer uitnodigingen',
                confirm: 'Bevestigen',
                allSet: 'Alles klaar',
                readyToRoll: 'Je bent klaar om te beginnen',
                takeBusinessRideMessage: 'Neem een zakelijke rit en je Uber-bonnetjes worden geïmporteerd in Expensify. Laten we gaan!',
                all: 'Alle',
                linked: 'Gekoppeld',
                outstanding: 'Openstaand',
                status: {
                    resend: 'Opnieuw verzenden',
                    invite: 'Uitnodigen',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Gekoppeld',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'In behandeling',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Opgeschort',
                },
                centralBillingAccount: 'Central faktureringskonto',
                centralBillingDescription: 'Vælg, hvor alle Uber-kvitteringer skal importeres.',
                invitationFailure: 'Kan geen lid uitnodigen voor Uber for Business',
                autoInvite: 'Nodig nieuwe werkruimteleden uit voor Uber for Business',
                autoRemove: 'Deactiveer verwijderde werkruimteleden van Uber for Business',
                bannerTitle: 'Expensify + Uber voor bedrijven',
                bannerDescription: 'Sluit Uber for Business aan om de kosten voor reizen en maaltijdbezorging binnen uw organisatie te automatiseren.',
                emptyContent: {
                    title: 'Geen openstaande uitnodigingen',
                    subtitle: 'Hoera! We hebben overal gezocht en geen openstaande uitnodigingen gevonden.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Stel dagvergoedingen in om de dagelijkse uitgaven van werknemers te beheersen. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Meer informatie</a>.</muted-text>`,
            amount: 'Bedrag',
            deleteRates: () => ({
                one: 'Verwijder tarief',
                other: 'Tarieven verwijderen',
            }),
            deletePerDiemRate: 'Verwijder dagvergoedingstarief',
            findPerDiemRate: 'Vind dagvergoedingstarief',
            areYouSureDelete: () => ({
                one: 'Weet je zeker dat je dit tarief wilt verwijderen?',
                other: 'Weet je zeker dat je deze tarieven wilt verwijderen?',
            }),
            emptyList: {
                title: 'Per diem',
                subtitle: 'Stel dagvergoedingen in om de dagelijkse uitgaven van werknemers te beheersen. Importeer tarieven vanuit een spreadsheet om te beginnen.',
            },
            importPerDiemRates: 'Importeer dagvergoedingen',
            editPerDiemRate: 'Bewerk dagvergoedingstarief',
            editPerDiemRates: 'Bewerk dagvergoedingen tarieven',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `Het bijwerken van deze bestemming zal het wijzigen voor alle ${destination} dagvergoedingssubtarieven.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `Het bijwerken van deze valuta zal het veranderen voor alle ${destination} dagvergoeding subtarieven.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Stel in hoe uit eigen zak gemaakte uitgaven worden geëxporteerd naar QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Markeer cheques als "later afdrukken"',
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar QuickBooks Desktop.',
            date: 'Exportdatum',
            exportInvoices: 'Facturen exporteren naar',
            exportExpensifyCard: 'Exporteer Expensify Card-transacties als',
            account: 'Account',
            accountDescription: 'Kies waar u journaalposten wilt plaatsen.',
            accountsPayable: 'Crediteurenadministratie',
            accountsPayableDescription: 'Kies waar u leveranciersfacturen wilt aanmaken.',
            bankAccount: 'Bankrekening',
            notConfigured: 'Niet geconfigureerd',
            bankAccountDescription: 'Kies waar u cheques vandaan wilt verzenden.',
            creditCardAccount: 'Creditcardrekening',
            exportDate: {
                label: 'Exportdatum',
                description: 'Gebruik deze datum bij het exporteren van rapporten naar QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum van laatste uitgave',
                        description: 'Datum van de meest recente uitgave op het rapport.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport is geëxporteerd naar QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Ingediende datum',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            exportCheckDescription: 'We maken een gespecificeerde cheque voor elk Expensify-rapport en sturen deze vanaf de onderstaande bankrekening.',
            exportJournalEntryDescription: 'We zullen een gespecificeerde journaalpost maken voor elk Expensify-rapport en deze naar de onderstaande rekening boeken.',
            exportVendorBillDescription:
                'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport en voegen deze toe aan de onderstaande rekening. Als deze periode is gesloten, boeken we naar de 1e van de volgende open periode.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop ondersteunt geen belastingen bij het exporteren van journaalposten. Aangezien u belastingen heeft ingeschakeld in uw werkruimte, is deze exportoptie niet beschikbaar.',
            outOfPocketTaxEnabledError: 'Journaalposten zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Creditcard',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Leveranciersfactuur',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journaalboeking',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Controleren',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'We maken een gespecificeerde cheque voor elk Expensify-rapport en sturen deze vanaf de onderstaande bankrekening.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "We zullen automatisch de naam van de handelaar op de creditcardtransactie koppelen aan eventuele overeenkomstige leveranciers in QuickBooks. Als er geen leveranciers bestaan, maken we een 'Credit Card Misc.' leverancier voor associatie aan.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport met de datum van de laatste uitgave en voegen deze toe aan het onderstaande account. Als deze periode is afgesloten, boeken we naar de 1e van de volgende open periode.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Kies waar u creditcardtransacties wilt exporteren.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Kies een leverancier om toe te passen op alle creditcardtransacties.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Kies waar u cheques vandaan wilt verzenden.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Leveranciersfacturen zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies alstublieft een andere exportoptie.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Cheques zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Journaalposten zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            },
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: 'Voeg het account toe in QuickBooks Desktop en synchroniseer de verbinding opnieuw.',
            qbdSetup: 'QuickBooks Desktop setup',
            requiredSetupDevice: {
                title: 'Kan geen verbinding maken vanaf dit apparaat',
                body1: 'Je moet deze verbinding instellen vanaf de computer die je QuickBooks Desktop bedrijfsbestand host.',
                body2: 'Zodra je verbonden bent, kun je overal synchroniseren en exporteren.',
            },
            setupPage: {
                title: 'Open deze link om verbinding te maken',
                body: 'Om de installatie te voltooien, opent u de volgende link op de computer waar QuickBooks Desktop draait.',
                setupErrorTitle: 'Er is iets misgegaan',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>De QuickBooks Desktop-verbinding werkt momenteel niet. Probeer het later nog eens of <a href="${conciergeLink}">neem contact op met Concierge</a> als het probleem zich blijft voordoen.</centered-text></muted-text>`,
            },
            importDescription: 'Kies welke codeconfiguraties u wilt importeren van QuickBooks Desktop naar Expensify.',
            classes: 'Klassen',
            items: 'Artikelen',
            customers: 'Klanten/projecten',
            exportCompanyCardsDescription: 'Stel in hoe aankopen met bedrijfskaarten worden geëxporteerd naar QuickBooks Desktop.',
            defaultVendorDescription: 'Stel een standaard leverancier in die van toepassing zal zijn op alle creditcardtransacties bij export.',
            accountsDescription: 'Uw QuickBooks Desktop-rekeningschema wordt in Expensify geïmporteerd als categorieën.',
            accountsSwitchTitle: 'Kies ervoor om nieuwe accounts te importeren als ingeschakelde of uitgeschakelde categorieën.',
            accountsSwitchDescription: 'Ingeschakelde categorieën zullen beschikbaar zijn voor leden om te selecteren bij het aanmaken van hun uitgaven.',
            classesDescription: 'Kies hoe je QuickBooks Desktop-klassen in Expensify wilt beheren.',
            tagsDisplayedAsDescription: 'Regelniveau',
            reportFieldsDisplayedAsDescription: 'Rapportniveau',
            customersDescription: 'Kies hoe u QuickBooks Desktop klanten/projecten in Expensify wilt beheren.',
            advancedConfig: {
                autoSyncDescription: 'Expensify zal elke dag automatisch synchroniseren met QuickBooks Desktop.',
                createEntities: 'Automatisch entiteiten aanmaken',
                createEntitiesDescription: 'Expensify zal automatisch leveranciers aanmaken in QuickBooks Desktop als ze nog niet bestaan.',
            },
            itemsDescription: 'Kies hoe u QuickBooks Desktop-items in Expensify wilt verwerken.',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer u de uitgaven wilt exporteren:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak gemaakte uitgaven worden geëxporteerd wanneer ze definitief zijn goedgekeurd.',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Uit eigen zak gemaakte uitgaven worden geëxporteerd wanneer ze zijn betaald.',
                },
            },
        },
        qbo: {
            connectedTo: 'Verbonden met',
            importDescription: 'Kies welke codeconfiguraties u wilt importeren van QuickBooks Online naar Expensify.',
            classes: 'Klassen',
            locations: 'Locaties',
            customers: 'Klanten/projecten',
            accountsDescription: 'Uw QuickBooks Online rekeningschema zal in Expensify worden geïmporteerd als categorieën.',
            accountsSwitchTitle: 'Kies ervoor om nieuwe accounts te importeren als ingeschakelde of uitgeschakelde categorieën.',
            accountsSwitchDescription: 'Ingeschakelde categorieën zullen beschikbaar zijn voor leden om te selecteren bij het aanmaken van hun uitgaven.',
            classesDescription: 'Kies hoe QuickBooks Online-klassen in Expensify moeten worden behandeld.',
            customersDescription: 'Kies hoe u QuickBooks Online klanten/projecten in Expensify wilt beheren.',
            locationsDescription: 'Kies hoe u QuickBooks Online-locaties in Expensify wilt beheren.',
            taxesDescription: 'Kies hoe je QuickBooks Online belastingen in Expensify wilt afhandelen.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online ondersteunt geen locaties op regelniveau voor cheques of leveranciersfacturen. Als je locaties op regelniveau wilt hebben, zorg er dan voor dat je journaalposten en credit-/debetkaartuitgaven gebruikt.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online ondersteunt geen belastingen op journaalposten. Wijzig uw exportoptie naar leveranciersfactuur of cheque.',
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar QuickBooks Online.',
            date: 'Exportdatum',
            exportInvoices: 'Facturen exporteren naar',
            exportExpensifyCard: 'Exporteer Expensify Card-transacties als',
            exportDate: {
                label: 'Exportdatum',
                description: 'Gebruik deze datum bij het exporteren van rapporten naar QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum van laatste uitgave',
                        description: 'Datum van de meest recente uitgave op het rapport.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport is geëxporteerd naar QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Ingediende datum',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            receivable: 'Debiteuren', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archief debiteuren', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Gebruik dit account bij het exporteren van facturen naar QuickBooks Online.',
            exportCompanyCardsDescription: 'Stel in hoe aankopen met bedrijfskaarten worden geëxporteerd naar QuickBooks Online.',
            vendor: 'Leverancier',
            defaultVendorDescription: 'Stel een standaard leverancier in die van toepassing zal zijn op alle creditcardtransacties bij export.',
            exportOutOfPocketExpensesDescription: 'Stel in hoe uit eigen zak gemaakte uitgaven worden geëxporteerd naar QuickBooks Online.',
            exportCheckDescription: 'We maken een gespecificeerde cheque voor elk Expensify-rapport en sturen deze vanaf de onderstaande bankrekening.',
            exportJournalEntryDescription: 'We zullen een gespecificeerde journaalpost maken voor elk Expensify-rapport en deze naar de onderstaande rekening boeken.',
            exportVendorBillDescription:
                'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport en voegen deze toe aan de onderstaande rekening. Als deze periode is gesloten, boeken we naar de 1e van de volgende open periode.',
            account: 'Account',
            accountDescription: 'Kies waar u journaalposten wilt plaatsen.',
            accountsPayable: 'Crediteurenadministratie',
            accountsPayableDescription: 'Kies waar u leveranciersfacturen wilt aanmaken.',
            bankAccount: 'Bankrekening',
            notConfigured: 'Niet geconfigureerd',
            bankAccountDescription: 'Kies waar u cheques vandaan wilt verzenden.',
            creditCardAccount: 'Creditcardrekening',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online ondersteunt geen locaties bij het exporteren van leveranciersfacturen. Aangezien je locaties hebt ingeschakeld in je werkruimte, is deze exportoptie niet beschikbaar.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online ondersteunt geen belastingen op journaalpostexporten. Aangezien u belastingen heeft ingeschakeld in uw werkruimte, is deze exportoptie niet beschikbaar.',
            outOfPocketTaxEnabledError: 'Journaalposten zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            advancedConfig: {
                autoSyncDescription: 'Expensify zal elke dag automatisch synchroniseren met QuickBooks Online.',
                inviteEmployees: 'Medewerkers uitnodigen',
                inviteEmployeesDescription: 'Importeer QuickBooks Online werknemersgegevens en nodig werknemers uit naar deze werkruimte.',
                createEntities: 'Automatisch entiteiten aanmaken',
                createEntitiesDescription:
                    'Expensify zal automatisch leveranciers aanmaken in QuickBooks Online als ze nog niet bestaan, en automatisch klanten aanmaken bij het exporteren van facturen.',
                reimbursedReportsDescription:
                    'Elke keer dat een rapport wordt betaald met Expensify ACH, wordt de overeenkomstige factuurbetaling aangemaakt in het QuickBooks Online-account hieronder.',
                qboBillPaymentAccount: 'QuickBooks-rekening voor factuurbetaling',
                qboInvoiceCollectionAccount: 'QuickBooks factuur incasso-account',
                accountSelectDescription: 'Kies waar u de rekeningen wilt betalen en we maken de betaling aan in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Kies waar u factuurbetalingen wilt ontvangen en we zullen de betaling aanmaken in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Debetkaart',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Creditcard',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Leveranciersfactuur',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journaalboeking',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Controleren',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "We zullen automatisch de naam van de handelaar op de debetkaarttransactie koppelen aan eventuele overeenkomstige leveranciers in QuickBooks. Als er geen leveranciers bestaan, maken we een 'Debit Card Misc.' leverancier voor associatie.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "We zullen automatisch de naam van de handelaar op de creditcardtransactie koppelen aan eventuele overeenkomstige leveranciers in QuickBooks. Als er geen leveranciers bestaan, maken we een 'Credit Card Misc.' leverancier voor associatie aan.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport met de datum van de laatste uitgave en voegen deze toe aan het onderstaande account. Als deze periode is afgesloten, boeken we naar de 1e van de volgende open periode.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Kies waar u debetkaarttransacties wilt exporteren.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Kies waar u creditcardtransacties wilt exporteren.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Kies een leverancier om toe te passen op alle creditcardtransacties.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Leveranciersfacturen zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies alstublieft een andere exportoptie.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Cheques zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Journaalposten zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Kies een geldig account voor de export van leveranciersfacturen',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Kies een geldig account voor journaalpostexport',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Kies een geldig account voor het exporteren van cheques',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Om de export van leveranciersfacturen te gebruiken, stel een crediteurenrekening in QuickBooks Online in.',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Om journal entry export te gebruiken, stel een journaalrekening in QuickBooks Online in.',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Om cheque-export te gebruiken, stel een bankrekening in QuickBooks Online in.',
            },
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: 'Voeg de account toe in QuickBooks Online en synchroniseer de verbinding opnieuw.',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer u de uitgaven wilt exporteren:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak gemaakte uitgaven worden geëxporteerd wanneer ze definitief zijn goedgekeurd.',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Uit eigen zak gemaakte uitgaven worden geëxporteerd wanneer ze zijn betaald.',
                },
            },
        },
        workspaceList: {
            joinNow: 'Nu lid worden',
            askToJoin: 'Vragen om deel te nemen',
        },
        xero: {
            organization: 'Xero organisatie',
            organizationDescription: 'Kies de Xero-organisatie waarvan je gegevens wilt importeren.',
            importDescription: 'Kies welke coderingsconfiguraties je wilt importeren van Xero naar Expensify.',
            accountsDescription: 'Je Xero-rekeningschema wordt in Expensify geïmporteerd als categorieën.',
            accountsSwitchTitle: 'Kies ervoor om nieuwe accounts te importeren als ingeschakelde of uitgeschakelde categorieën.',
            accountsSwitchDescription: 'Ingeschakelde categorieën zullen beschikbaar zijn voor leden om te selecteren bij het aanmaken van hun uitgaven.',
            trackingCategories: 'Categorieën bijhouden',
            trackingCategoriesDescription: 'Kies hoe Xero-trackingcategorieën in Expensify moeten worden behandeld.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Map Xero ${categoryName} naar`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Kies waar u ${categoryName} wilt toewijzen bij het exporteren naar Xero.`,
            customers: 'Klanten opnieuw factureren',
            customersDescription:
                'Kies of u klanten opnieuw wilt factureren in Expensify. Uw Xero-klantcontacten kunnen aan uitgaven worden gekoppeld en zullen naar Xero worden geëxporteerd als een verkoopfactuur.',
            taxesDescription: 'Kies hoe je Xero-belastingen in Expensify wilt verwerken.',
            notImported: 'Niet geïmporteerd',
            notConfigured: 'Niet geconfigureerd',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero contact standaardinstelling',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Rapportvelden',
            },
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar Xero.',
            purchaseBill: 'Aankoopfactuur',
            exportDeepDiveCompanyCard:
                'Geëxporteerde uitgaven worden als banktransacties geboekt naar de Xero-bankrekening hieronder, en de transactiedata zullen overeenkomen met de data op uw bankafschrift.',
            bankTransactions: 'Banktransacties',
            xeroBankAccount: 'Xero bankrekening',
            xeroBankAccountDescription: 'Kies waar uitgaven als banktransacties worden geboekt.',
            exportExpensesDescription: 'Rapporten worden geëxporteerd als een inkoopfactuur met de hieronder geselecteerde datum en status.',
            purchaseBillDate: 'Aankoopfactuurdatum',
            exportInvoices: 'Facturen exporteren als',
            salesInvoice: 'Verkoopfactuur',
            exportInvoicesDescription: 'Verkoopfacturen tonen altijd de datum waarop de factuur is verzonden.',
            advancedConfig: {
                autoSyncDescription: 'Expensify zal elke dag automatisch synchroniseren met Xero.',
                purchaseBillStatusTitle: 'Status van aankoopfactuur',
                reimbursedReportsDescription: 'Elke keer dat een rapport wordt betaald met Expensify ACH, wordt de overeenkomstige factuurbetaling aangemaakt in het Xero-account hieronder.',
                xeroBillPaymentAccount: 'Xero factuurbetalingsaccount',
                xeroInvoiceCollectionAccount: 'Xero factuurincasso-account',
                xeroBillPaymentAccountDescription: 'Kies waar u de rekeningen wilt betalen en wij maken de betaling aan in Xero.',
                invoiceAccountSelectorDescription: 'Kies waar je factuurbetalingen wilt ontvangen en we maken de betaling aan in Xero.',
            },
            exportDate: {
                label: 'Aankoopfactuurdatum',
                description: 'Gebruik deze datum bij het exporteren van rapporten naar Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum van laatste uitgave',
                        description: 'Datum van de meest recente uitgave op het rapport.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport naar Xero is geëxporteerd.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Ingediende datum',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status van aankoopfactuur',
                description: 'Gebruik deze status bij het exporteren van aankoopfacturen naar Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Conceptversie',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'In afwachting van goedkeuring',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'In afwachting van betaling',
                },
            },
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: 'Voeg alstublieft het account toe in Xero en synchroniseer de verbinding opnieuw.',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer u de uitgaven wilt exporteren:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak gemaakte uitgaven worden geëxporteerd wanneer ze definitief zijn goedgekeurd.',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Uit eigen zak gemaakte uitgaven worden geëxporteerd wanneer ze zijn betaald.',
                },
            },
        },
        sageIntacct: {
            preferredExporter: 'Voorkeurs-exporteur',
            taxSolution: 'Belastingoplossing',
            notConfigured: 'Niet geconfigureerd',
            exportDate: {
                label: 'Exportdatum',
                description: 'Gebruik deze datum bij het exporteren van rapporten naar Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum van laatste uitgave',
                        description: 'Datum van de meest recente uitgave op het rapport.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport is geëxporteerd naar Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Ingediende datum',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Stel in hoe uit eigen zak gemaakte uitgaven worden geëxporteerd naar Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Onkostendeclaraties',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Leveranciersfacturen',
                },
            },
            nonReimbursableExpenses: {
                description: 'Stel in hoe aankopen met bedrijfskaarten worden geëxporteerd naar Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Kredietkaarten',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Leveranciersfacturen',
                },
            },
            creditCardAccount: 'Creditcardrekening',
            defaultVendor: 'Standaard leverancier',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Stel een standaard leverancier in die van toepassing zal zijn op ${isReimbursable ? '' : 'non-'}terugbetaalbare uitgaven die geen overeenkomende leverancier hebben in Sage Intacct.`,
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar Sage Intacct.',
            exportPreferredExporterNote:
                'De voorkeursexporteur kan elke werkruimtebeheerder zijn, maar moet ook een domeinbeheerder zijn als je verschillende exportaccounts instelt voor individuele bedrijfskaarten in Domeininstellingen.',
            exportPreferredExporterSubNote: 'Zodra ingesteld, zal de voorkeurs-exporteur rapporten voor export in hun account zien.',
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: `Voeg het account toe in Sage Intacct en synchroniseer de verbinding opnieuw.`,
            autoSync: 'Auto-sync',
            autoSyncDescription: 'Expensify zal elke dag automatisch synchroniseren met Sage Intacct.',
            inviteEmployees: 'Medewerkers uitnodigen',
            inviteEmployeesDescription:
                'Importeer Sage Intacct-medewerkersgegevens en nodig medewerkers uit naar deze werkruimte. Uw goedkeuringsworkflow zal standaard op goedkeuring door de manager staan en kan verder worden geconfigureerd op de Leden-pagina.',
            syncReimbursedReports: 'Gesynchroniseerde vergoede rapporten',
            syncReimbursedReportsDescription:
                'Telkens wanneer een rapport wordt betaald met Expensify ACH, wordt de overeenkomstige factuurbetaling aangemaakt in het Sage Intacct-account hieronder.',
            paymentAccount: 'Sage Intacct-betaalrekening',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer u de uitgaven wilt exporteren:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak gemaakte uitgaven worden geëxporteerd wanneer ze definitief zijn goedgekeurd.',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Uit eigen zak gemaakte uitgaven worden geëxporteerd wanneer ze zijn betaald.',
                },
            },
        },
        netsuite: {
            subsidiary: 'Dochteronderneming',
            subsidiarySelectDescription: 'Kies de dochteronderneming in NetSuite waarvan je gegevens wilt importeren.',
            exportDescription: 'Configureer hoe Expensify-gegevens naar NetSuite worden geëxporteerd.',
            exportInvoices: 'Facturen exporteren naar',
            journalEntriesTaxPostingAccount: 'Journaalposten belastingboekhoudrekening',
            journalEntriesProvTaxPostingAccount: 'Journaalposten provinciale belastingboekingsrekening',
            foreignCurrencyAmount: 'Buitenlandse valuta bedrag exporteren',
            exportToNextOpenPeriod: 'Exporteer naar de volgende open periode',
            nonReimbursableJournalPostingAccount: 'Niet-vergoedbare journaalboekingrekening',
            reimbursableJournalPostingAccount: 'Vergoedbaar journaalboekingsaccount',
            journalPostingPreference: {
                label: 'Voorkeur voor het boeken van journaalposten',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Enkele, gespecificeerde invoer voor elk rapport',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Enkele invoer voor elke uitgave',
                },
            },
            invoiceItem: {
                label: 'Factuuritem',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Maak er een voor mij.',
                        description: 'We zullen een "Expensify factuurregelitem" voor je aanmaken bij export (als er nog geen bestaat).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Bestaande selecteren',
                        description: 'We koppelen facturen van Expensify aan het hieronder geselecteerde item.',
                    },
                },
            },
            exportDate: {
                label: 'Exportdatum',
                description: 'Gebruik deze datum bij het exporteren van rapporten naar NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum van laatste uitgave',
                        description: 'Datum van de meest recente uitgave op het rapport.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport is geëxporteerd naar NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Ingediende datum',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Onkostendeclaraties',
                        reimbursableDescription: dedent(`
                            Out-of-pocketkosten worden geëxporteerd als journaalposten naar de hieronder opgegeven NetSuite-rekening.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Uitgaven op bedrijfskaarten worden als journaalposten geëxporteerd naar het hieronder opgegeven NetSuite-account.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Settings > Domains > Company Cards*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Leveranciersfacturen',
                        reimbursableDescription: dedent(`
                            Out-of-pocketkosten worden geëxporteerd als journaalposten naar de hieronder opgegeven NetSuite-rekening.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Uitgaven op bedrijfskaarten worden als journaalposten geëxporteerd naar het hieronder opgegeven NetSuite-account.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Settings > Domains > Company Cards*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Journaalposten',
                        reimbursableDescription: dedent(`
                            Out-of-pocketkosten worden geëxporteerd als journaalposten naar de hieronder opgegeven NetSuite-rekening.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Uitgaven op bedrijfskaarten worden als journaalposten geëxporteerd naar het hieronder opgegeven NetSuite-account.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Settings > Domains > Company Cards*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Als je de exportinstelling voor bedrijfskaarten wijzigt naar onkostenrapporten, worden NetSuite-leveranciers en boekingsaccounts voor individuele kaarten uitgeschakeld.\n\nGeen zorgen, we bewaren je vorige selecties nog steeds voor het geval je later terug wilt schakelen.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify zal elke dag automatisch synchroniseren met NetSuite.',
                reimbursedReportsDescription:
                    'Telkens wanneer een rapport wordt betaald met Expensify ACH, wordt de overeenkomstige factuurbetaling aangemaakt in het NetSuite-account hieronder.',
                reimbursementsAccount: 'Vergoedingenrekening',
                reimbursementsAccountDescription: 'Kies de bankrekening die je wilt gebruiken voor terugbetalingen, en we zullen de bijbehorende betaling in NetSuite aanmaken.',
                collectionsAccount: 'Incasso-account',
                collectionsAccountDescription: 'Zodra een factuur in Expensify als betaald is gemarkeerd en naar NetSuite is geëxporteerd, zal deze verschijnen op het onderstaande account.',
                approvalAccount: 'A/P goedkeuringsaccount',
                approvalAccountDescription:
                    'Kies de account waartegen transacties in NetSuite worden goedgekeurd. Als je terugbetaalde rapporten synchroniseert, is dit ook de account waartegen betalingsopdrachten worden aangemaakt.',
                defaultApprovalAccount: 'NetSuite standaardinstelling',
                inviteEmployees: 'Nodig werknemers uit en stel goedkeuringen in',
                inviteEmployeesDescription:
                    'Importeer NetSuite-medewerkersrecords en nodig medewerkers uit voor deze werkruimte. Uw goedkeuringsworkflow wordt standaard ingesteld op goedkeuring door de manager en kan verder worden geconfigureerd op de pagina *Leden*.',
                autoCreateEntities: 'Automatisch medewerkers/leveranciers aanmaken',
                enableCategories: 'Ingeschakelde nieuw geïmporteerde categorieën',
                customFormID: 'Aangepaste formulier-ID',
                customFormIDDescription:
                    'Standaard zal Expensify boekingen aanmaken met behulp van het voorkeursformulier voor transacties dat is ingesteld in NetSuite. U kunt echter ook een specifiek transactieformulier aanwijzen dat moet worden gebruikt.',
                customFormIDReimbursable: 'Uit eigen zak gemaakte uitgave',
                customFormIDNonReimbursable: 'Bedrijfskostenkaartuitgave',
                exportReportsTo: {
                    label: 'Goedkeuringsniveau van onkostendeclaratie',
                    description:
                        'Zodra een onkostennota is goedgekeurd in Expensify en geëxporteerd naar NetSuite, kun je een extra goedkeuringsniveau instellen in NetSuite voordat je deze boekt.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite standaardvoorkeur',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Alleen door supervisor goedgekeurd',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Alleen boekhouding goedgekeurd',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Supervisor en boekhouding goedgekeurd',
                    },
                },
                accountingMethods: {
                    label: 'Wanneer exporteren',
                    description: 'Kies wanneer u de uitgaven wilt exporteren:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Accrual',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak gemaakte uitgaven worden geëxporteerd wanneer ze definitief zijn goedgekeurd.',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Uit eigen zak gemaakte uitgaven worden geëxporteerd wanneer ze zijn betaald.',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Goedkeuringsniveau leveranciersfactuur',
                    description:
                        'Zodra een leveranciersfactuur is goedgekeurd in Expensify en geëxporteerd naar NetSuite, kun je een extra goedkeuringsniveau instellen in NetSuite voordat deze wordt geboekt.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite standaardvoorkeur',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'In afwachting van goedkeuring',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Goedgekeurd voor plaatsing',
                    },
                },
                exportJournalsTo: {
                    label: 'Boekhoudkundige goedkeuringsniveau',
                    description:
                        'Zodra een journaalpost is goedgekeurd in Expensify en geëxporteerd naar NetSuite, kun je een extra goedkeuringsniveau instellen in NetSuite voordat je deze boekt.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite standaardvoorkeur',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'In afwachting van goedkeuring',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Goedgekeurd voor plaatsing',
                    },
                },
                error: {
                    customFormID: 'Voer een geldige numerieke aangepaste formulier-ID in',
                },
            },
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: 'Voeg het account toe in NetSuite en synchroniseer de verbinding opnieuw.',
            noVendorsFound: 'Geen leveranciers gevonden',
            noVendorsFoundDescription: 'Voeg alstublieft leveranciers toe in NetSuite en synchroniseer de verbinding opnieuw.',
            noItemsFound: 'Geen factuuritems gevonden',
            noItemsFoundDescription: 'Voeg alstublieft factuuritems toe in NetSuite en synchroniseer de verbinding opnieuw.',
            noSubsidiariesFound: 'Geen dochterondernemingen gevonden',
            noSubsidiariesFoundDescription: 'Voeg alstublieft een dochteronderneming toe in NetSuite en synchroniseer de verbinding opnieuw.',
            tokenInput: {
                title: 'NetSuite setup',
                formSteps: {
                    installBundle: {
                        title: 'Installeer het Expensify-pakket',
                        description: 'In NetSuite, ga naar *Customization > SuiteBundler > Search & Install Bundles* > zoek naar "Expensify" > installeer de bundel.',
                    },
                    enableTokenAuthentication: {
                        title: 'Token-gebaseerde authenticatie inschakelen',
                        description: 'In NetSuite, ga naar *Setup > Company > Enable Features > SuiteCloud* > schakel *token-based authentication* in.',
                    },
                    enableSoapServices: {
                        title: 'SOAP-webservices inschakelen',
                        description: 'In NetSuite, ga naar *Setup > Company > Enable Features > SuiteCloud* > schakel *SOAP Web Services* in.',
                    },
                    createAccessToken: {
                        title: 'Maak een toegangstoken aan',
                        description:
                            'In NetSuite, ga naar *Setup > Users/Roles > Access Tokens* > maak een toegangstoken aan voor de "Expensify" app en de rol "Expensify Integration" of "Administrator".\n\n*Belangrijk:* Zorg ervoor dat je de *Token ID* en *Token Secret* van deze stap opslaat. Je hebt deze nodig voor de volgende stap.',
                    },
                    enterCredentials: {
                        title: 'Voer uw NetSuite-inloggegevens in',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: 'Token-ID',
                            netSuiteTokenSecret: 'Token Geheim',
                        },
                        netSuiteAccountIDDescription: 'Ga in NetSuite naar *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Uitgavecategorieën',
                expenseCategoriesDescription: 'Uw NetSuite-uitgavencategorieën worden in Expensify geïmporteerd als categorieën.',
                crossSubsidiaryCustomers: 'Klanten/projecten tussen dochterondernemingen',
                importFields: {
                    departments: {
                        title: 'Afdelingen',
                        subtitle: 'Kies hoe je de NetSuite *afdelingen* in Expensify wilt beheren.',
                    },
                    classes: {
                        title: 'Klassen',
                        subtitle: 'Kies hoe om te gaan met *classes* in Expensify.',
                    },
                    locations: {
                        title: 'Locaties',
                        subtitle: 'Kies hoe om te gaan met *locaties* in Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Klanten/projecten',
                    subtitle: 'Kies hoe je NetSuite *klanten* en *projecten* in Expensify wilt beheren.',
                    importCustomers: 'Klanten importeren',
                    importJobs: 'Projecten importeren',
                    customers: 'klanten',
                    jobs: 'projecten',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('en')}, ${importType}`,
                },
                importTaxDescription: 'Importeer belastinggroepen uit NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Kies een optie hieronder:',
                    label: ({importedTypes}: ImportedTypesParams) => `Geïmporteerd als ${importedTypes.join('en')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Voer alstublieft de ${fieldName} in.`,
                    customSegments: {
                        title: 'Aangepaste segmenten/records',
                        addText: 'Aangepast segment/record toevoegen',
                        recordTitle: 'Aangepast segment/record',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Bekijk gedetailleerde instructies',
                        helpText: 'over het configureren van aangepaste segmenten/records.',
                        emptyTitle: 'Een aangepast segment of aangepast record toevoegen',
                        fields: {
                            segmentName: 'Naam',
                            internalID: 'Interne ID',
                            scriptID: 'Script-ID',
                            customRecordScriptID: 'Transactiekolom-ID',
                            mapping: 'Weergegeven als',
                        },
                        removeTitle: 'Aangepast segment/record verwijderen',
                        removePrompt: 'Weet je zeker dat je dit aangepaste segment/record wilt verwijderen?',
                        addForm: {
                            customSegmentName: 'aangepaste segmentnaam',
                            customRecordName: 'aangepaste recordnaam',
                            segmentTitle: 'Aangepast segment',
                            customSegmentAddTitle: 'Aangepast segment toevoegen',
                            customRecordAddTitle: 'Aangepast record toevoegen',
                            recordTitle: 'Aangepast record',
                            segmentRecordType: 'Wilt u een aangepast segment of een aangepast record toevoegen?',
                            customSegmentNameTitle: 'Wat is de naam van het aangepaste segment?',
                            customRecordNameTitle: 'Wat is de naam van het aangepaste record?',
                            customSegmentNameFooter: `U kunt aangepaste segmentnamen vinden in NetSuite onder *Customizations > Links, Records & Fields > Custom Segments* pagina.\n\n_Voor meer gedetailleerde instructies, [bezoek onze help-site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `U kunt aangepaste recordnamen in NetSuite vinden door "Transaction Column Field" in de globale zoekopdracht in te voeren.\n\n_Voor meer gedetailleerde instructies, [bezoek onze help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Wat is het interne ID?',
                            customSegmentInternalIDFooter: `Zorg er eerst voor dat je interne ID's hebt ingeschakeld in NetSuite onder *Home > Set Preferences > Show Internal ID.*\n\nJe kunt interne ID's van aangepaste segmenten vinden in NetSuite onder:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Klik op een aangepast segment.\n3. Klik op de hyperlink naast *Custom Record Type*.\n4. Vind de interne ID in de tabel onderaan.\n\n_Voor meer gedetailleerde instructies, [bezoek onze help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Je kunt interne ID's van aangepaste records in NetSuite vinden door de volgende stappen te volgen:\n\n1. Voer "Transaction Line Fields" in de globale zoekopdracht in.\n2. Klik op een aangepast record.\n3. Zoek de interne ID aan de linkerkant.\n\n_Voor meer gedetailleerde instructies, [bezoek onze help-site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Wat is het script-ID?',
                            customSegmentScriptIDFooter: `U kunt aangepaste segment script-ID's vinden in NetSuite onder:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Klik op een aangepast segment.\n3. Klik op het tabblad *Application and Sourcing* onderaan, en dan:\n    a. Als u het aangepaste segment als een *tag* (op het regelitemniveau) in Expensify wilt weergeven, klikt u op het sub-tabblad *Transaction Columns* en gebruikt u de *Field ID*.\n    b. Als u het aangepaste segment als een *rapportveld* (op het rapportniveau) in Expensify wilt weergeven, klikt u op het sub-tabblad *Transactions* en gebruikt u de *Field ID*.\n\n_Voor meer gedetailleerde instructies, [bezoek onze help site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Wat is het transactie kolom ID?',
                            customRecordScriptIDFooter: `U kunt aangepaste recordscript-ID's in NetSuite vinden onder:\n\n1. Voer "Transaction Line Fields" in in de globale zoekopdracht.\n2. Klik op een aangepast record.\n3. Zoek de script-ID aan de linkerkant.\n\n_Voor meer gedetailleerde instructies, [bezoek onze help-site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Hoe moet dit aangepaste segment worden weergegeven in Expensify?',
                            customRecordMappingTitle: 'Hoe moet dit aangepaste record worden weergegeven in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Een aangepast segment/record met deze ${fieldName?.toLowerCase()} bestaat al.`,
                        },
                    },
                    customLists: {
                        title: 'Aangepaste lijsten',
                        addText: 'Aangepaste lijst toevoegen',
                        recordTitle: 'Aangepaste lijst',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Bekijk gedetailleerde instructies',
                        helpText: 'over het configureren van aangepaste lijsten.',
                        emptyTitle: 'Een aangepaste lijst toevoegen',
                        fields: {
                            listName: 'Naam',
                            internalID: 'Interne ID',
                            transactionFieldID: 'Transactieveld-ID',
                            mapping: 'Weergegeven als',
                        },
                        removeTitle: 'Aangepaste lijst verwijderen',
                        removePrompt: 'Weet je zeker dat je deze aangepaste lijst wilt verwijderen?',
                        addForm: {
                            listNameTitle: 'Kies een aangepaste lijst',
                            transactionFieldIDTitle: 'Wat is het transactieveld-ID?',
                            transactionFieldIDFooter: `U kunt transactieveld-ID's in NetSuite vinden door de volgende stappen te volgen:\n\n1. Voer "Transaction Line Fields" in de globale zoekopdracht in.\n2. Klik op een aangepaste lijst.\n3. Zoek de transactieveld-ID aan de linkerkant.\n\n_Voor meer gedetailleerde instructies, [bezoek onze help-site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Hoe moet deze aangepaste lijst worden weergegeven in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Er bestaat al een aangepaste lijst met dit transactieveld-ID.`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite medewerker standaardwaarde',
                        description: 'Niet geïmporteerd in Expensify, toegepast bij exporteren',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Als je ${importField} in NetSuite gebruikt, passen we de standaardinstelling toe die op de werknemersrecord is ingesteld bij export naar Expense Report of Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'Regelniveau',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `${startCase(importField)} zal selecteerbaar zijn voor elke afzonderlijke uitgave op het rapport van een werknemer.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Rapportvelden',
                        description: 'Rapportniveau',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} selectie zal van toepassing zijn op alle uitgaven in het rapport van een werknemer.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct setup',
            prerequisitesTitle: 'Voordat je verbinding maakt...',
            downloadExpensifyPackage: 'Download het Expensify-pakket voor Sage Intacct',
            followSteps: 'Volg de stappen in onze How-to: Connect to Sage Intacct instructies.',
            enterCredentials: 'Voer uw Sage Intacct-inloggegevens in',
            entity: 'Entity',
            employeeDefault: 'Sage Intacct medewerker standaardwaarde',
            employeeDefaultDescription: 'De standaardafdeling van de werknemer wordt toegepast op hun uitgaven in Sage Intacct indien deze bestaat.',
            displayedAsTagDescription: 'Afdeling zal selecteerbaar zijn voor elke individuele uitgave op het rapport van een werknemer.',
            displayedAsReportFieldDescription: 'Afdelingsselectie zal van toepassing zijn op alle uitgaven in het rapport van een werknemer.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Kies hoe Sage Intacct <strong>${mappingTitle}</strong> in Expensify te beheren.`,
            expenseTypes: 'Uitgavensoorten',
            expenseTypesDescription: 'Uw Sage Intacct-uitgavensoorten worden in Expensify geïmporteerd als categorieën.',
            accountTypesDescription: 'Uw Sage Intacct-rekeningschema wordt in Expensify geïmporteerd als categorieën.',
            importTaxDescription: 'Importeer aankoopbelastingtarief van Sage Intacct.',
            userDefinedDimensions: 'Door de gebruiker gedefinieerde dimensies',
            addUserDefinedDimension: 'Gebruikersgedefinieerde dimensie toevoegen',
            integrationName: 'Integratienaam',
            dimensionExists: 'Er bestaat al een dimensie met deze naam.',
            removeDimension: 'Gebruikersgedefinieerde dimensie verwijderen',
            removeDimensionPrompt: 'Weet je zeker dat je deze door de gebruiker gedefinieerde dimensie wilt verwijderen?',
            userDefinedDimension: 'Door de gebruiker gedefinieerde dimensie',
            addAUserDefinedDimension: 'Voeg een door de gebruiker gedefinieerde dimensie toe',
            detailedInstructionsLink: 'Bekijk gedetailleerde instructies',
            detailedInstructionsRestOfSentence: 'over het toevoegen van door de gebruiker gedefinieerde dimensies.',
            userDimensionsAdded: () => ({
                one: '1 UDD toegevoegd',
                other: (count: number) => `${count} UDD's toegevoegd`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'afdelingen';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'locaties';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'klanten';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'projecten (banen)';
                    default:
                        return 'mappings';
                }
            },
        },
        type: {
            free: 'Gratis',
            control: 'Beheer',
            collect: 'Verzamel',
        },
        companyCards: {
            addCards: 'Kaarten toevoegen',
            selectCards: 'Selecteer kaarten',
            addNewCard: {
                other: 'Andere',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard Commercial Cards',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Stripe Cards',
                },
                yourCardProvider: `Wie is uw kaartaanbieder?`,
                whoIsYourBankAccount: 'Wie is jouw bank?',
                whereIsYourBankLocated: 'Waar is uw bank gevestigd?',
                howDoYouWantToConnect: 'Hoe wilt u verbinding maken met uw bank?',
                learnMoreAboutOptions: `<muted-text>Meer informatie over deze <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">opties</a>.</muted-text>`,
                commercialFeedDetails: 'Vereist installatie met uw bank. Dit wordt meestal gebruikt door grotere bedrijven en is vaak de beste optie als u in aanmerking komt.',
                commercialFeedPlaidDetails: `Vereist installatie met uw bank, maar we zullen u begeleiden. Dit is meestal beperkt tot grotere bedrijven.`,
                directFeedDetails: 'De eenvoudigste aanpak. Maak direct verbinding met je hoofdreferenties. Deze methode is het meest gebruikelijk.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Schakel uw ${provider}-feed in`,
                    heading:
                        'We hebben een directe integratie met uw kaartuitgever en kunnen uw transactiegegevens snel en nauwkeurig in Expensify importeren.\n\nOm te beginnen, eenvoudig:',
                    visa: 'We hebben wereldwijde integraties met Visa, hoewel de geschiktheid varieert per bank en kaartprogramma.\n\nOm te beginnen, eenvoudig:',
                    mastercard: 'We hebben wereldwijde integraties met Mastercard, hoewel de geschiktheid varieert per bank en kaartprogramma.\n\nOm te beginnen, volg eenvoudigweg:',
                    vcf: `1. Bezoek [dit hulpartikel](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) voor gedetailleerde instructies over hoe u uw Visa Commercial Cards instelt.\n\n2. [Neem contact op met uw bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) om te verifiëren of zij een commerciële feed voor uw programma ondersteunen, en vraag hen om deze in te schakelen.\n\n3. *Zodra de feed is ingeschakeld en u de details heeft, gaat u verder naar het volgende scherm.*`,
                    gl1025: `1. Bezoek [dit hulpartikel](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) om te ontdekken of American Express een commerciële feed voor uw programma kan inschakelen.\n\n2. Zodra de feed is ingeschakeld, stuurt Amex u een productiefbrief.\n\n3. *Zodra u de feedinformatie heeft, gaat u verder naar het volgende scherm.*`,
                    cdf: `1. Bezoek [dit helpartikel](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) voor gedetailleerde instructies over hoe u uw Mastercard Commercial Cards kunt instellen.\n\n2. [Neem contact op met uw bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) om te verifiëren of zij een commerciële feed voor uw programma ondersteunen, en vraag hen om deze in te schakelen.\n\n3. *Zodra de feed is ingeschakeld en u de details heeft, ga verder naar het volgende scherm.*`,
                    stripe: `1. Bezoek het Dashboard van Stripe en ga naar [Instellingen](${CONST.COMPANY_CARDS_STRIPE_HELP}).\n\n2. Klik onder Productintegraties op Inschakelen naast Expensify.\n\n3. Zodra de feed is ingeschakeld, klik op Verzenden hieronder en we zullen eraan werken om het toe te voegen.`,
                },
                whatBankIssuesCard: 'Welke bank geeft deze kaarten uit?',
                enterNameOfBank: 'Voer de naam van de bank in',
                feedDetails: {
                    vcf: {
                        title: 'Wat zijn de Visa-feedgegevens?',
                        processorLabel: 'Processor-ID',
                        bankLabel: 'Financiële instelling (bank) ID',
                        companyLabel: 'Bedrijfs-ID',
                        helpLabel: "Waar vind ik deze ID's?",
                    },
                    gl1025: {
                        title: `Wat is de naam van het Amex-leveringsbestand?`,
                        fileNameLabel: 'Bestandsnaam bezorgen',
                        helpLabel: 'Waar vind ik de bestandsnaam van de levering?',
                    },
                    cdf: {
                        title: `Wat is het Mastercard distributie-ID?`,
                        distributionLabel: 'Distributie-ID',
                        helpLabel: 'Waar vind ik de distributie-ID?',
                    },
                },
                amexCorporate: 'Selecteer dit als de voorkant van je kaarten “Corporate” zegt.',
                amexBusiness: 'Selecteer dit als de voorkant van je kaarten "Business" zegt.',
                amexPersonal: 'Selecteer dit als je kaarten persoonlijk zijn.',
                error: {
                    pleaseSelectProvider: 'Selecteer alstublieft een kaartaanbieder voordat u doorgaat',
                    pleaseSelectBankAccount: 'Selecteer alstublieft een bankrekening voordat u doorgaat.',
                    pleaseSelectBank: 'Selecteer alstublieft een bank voordat u verder gaat.',
                    pleaseSelectCountry: 'Selecteer alstublieft een land voordat u doorgaat',
                    pleaseSelectFeedType: 'Selecteer een feedtype voordat u doorgaat.',
                },
                exitModal: {
                    title: 'Werkt er iets niet?',
                    prompt: 'We hebben gemerkt dat je het toevoegen van je kaarten niet hebt voltooid. Als je een probleem bent tegengekomen, laat het ons weten zodat we kunnen helpen dit op te lossen.',
                    confirmText: 'Probleem melden',
                    cancelText: 'Overslaan',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Laatste dag van de maand',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Laatste werkdag van de maand',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Aangepaste dag van de maand',
            },
            assignCard: 'Kaart toewijzen',
            findCard: 'Kaart vinden',
            cardNumber: 'Kaartnummer',
            commercialFeed: 'Commerciële feed',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `${feedName} kaarten`,
            directFeed: 'Direct feed',
            whoNeedsCardAssigned: 'Wie heeft een kaart toegewezen nodig?',
            chooseCard: 'Kies een kaart',
            chooseCardFor: ({assignee}: AssigneeParams) =>
                `Kies een kaart voor <strong>${assignee}</strong>. Kun je de kaart die je zoekt niet vinden? <concierge-link>Laat het ons weten.</concierge-link>`,
            noActiveCards: 'Geen actieve kaarten in deze feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Of er is misschien iets kapot. Hoe dan ook, als u vragen heeft, neem dan <concierge-link>contact op met Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Kies een startdatum voor de transactie',
            startDateDescription: 'We importeren alle transacties vanaf deze datum. Als er geen datum is opgegeven, gaan we zo ver terug als uw bank toestaat.',
            fromTheBeginning: 'Vanaf het begin',
            customStartDate: 'Aangepaste startdatum',
            customCloseDate: 'Aangepaste sluitingsdatum',
            letsDoubleCheck: 'Laten we dubbel controleren of alles er goed uitziet.',
            confirmationDescription: 'We beginnen onmiddellijk met het importeren van transacties.',
            cardholder: 'Kaart houder',
            card: 'Kaart',
            cardName: 'Kaartnaam',
            brokenConnectionError: '<rbr>Kaartfeedverbinding is verbroken. Alsjeblieft <a href="#">log in op uw bank</a> zodat we de verbinding opnieuw kunnen herstellen.</rbr>',
            assignedCard: ({assignee, link}: AssignedCardParams) => `heeft ${assignee} een ${link} toegewezen! Geïmporteerde transacties zullen in deze chat verschijnen.`,
            companyCard: 'bedrijfskaart',
            chooseCardFeed: 'Kies kaartfeed',
            ukRegulation:
                'Expensify Limited is een agent van Plaid Financial Ltd., een erkende betalingsinstelling gereguleerd door de Financial Conduct Authority onder de Payment Services Regulations 2017 (Firm Reference Number: 804718). Plaid biedt u gereguleerde rekeninginformatiediensten via Expensify Limited als zijn agent.',
        },
        expensifyCard: {
            issueAndManageCards: 'Uitgeven en beheren van uw Expensify-kaarten',
            getStartedIssuing: 'Begin met het aanvragen van je eerste virtuele of fysieke kaart.',
            verificationInProgress: 'Verificatie bezig...',
            verifyingTheDetails: 'We controleren een paar details. Concierge laat je weten wanneer Expensify Cards klaar zijn om uit te geven.',
            disclaimer:
                'De Expensify Visa® Commercial Card wordt uitgegeven door The Bancorp Bank, N.A., lid FDIC, krachtens een licentie van Visa U.S.A. Inc. en kan niet worden gebruikt bij alle handelaren die Visa-kaarten accepteren. Apple® en het Apple-logo® zijn handelsmerken van Apple Inc., geregistreerd in de VS en andere landen. App Store is een servicemerk van Apple Inc. Google Play en het Google Play-logo zijn handelsmerken van Google LLC.',
            euUkDisclaimer:
                'Kaarten die aan inwoners van de EER worden verstrekt, worden uitgegeven door Transact Payments Malta Limited en kaarten die aan inwoners van het VK worden verstrekt, worden uitgegeven door Transact Payments Limited op basis van een vergunning van Visa Europe Limited. Transact Payments Malta Limited is naar behoren geautoriseerd en gereguleerd door de Malta Financial Services Authority als financiële instelling onder de Financial Institution Act van 1994. Registratienummer C 91879. Transact Payments Limited is geautoriseerd en gereguleerd door de Gibraltar Financial Service Commission.',
            issueCard: 'Kaart uitgeven',
            findCard: 'Kaart vinden',
            newCard: 'Nieuwe kaart',
            name: 'Naam',
            lastFour: 'Laatste 4',
            limit: 'Limiet',
            currentBalance: 'Huidig saldo',
            currentBalanceDescription: 'Huidig saldo is de som van alle geboekte Expensify Card-transacties die hebben plaatsgevonden sinds de laatste afwikkelingsdatum.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Saldo wordt vereffend op ${settlementDate}`,
            settleBalance: 'Saldo vereffenen',
            cardLimit: 'Kaartlimiet',
            remainingLimit: 'Resterende limiet',
            requestLimitIncrease: 'Verzoek om verhoging van limiet',
            remainingLimitDescription:
                'We houden rekening met een aantal factoren bij het berekenen van uw resterende limiet: uw dienstverband als klant, de zakelijke informatie die u tijdens de aanmelding heeft verstrekt, en het beschikbare geld op uw zakelijke bankrekening. Uw resterende limiet kan dagelijks fluctueren.',
            earnedCashback: 'Geld terug',
            earnedCashbackDescription: 'Cashback saldo is gebaseerd op de maandelijks verrekende uitgaven met de Expensify Card binnen uw werkruimte.',
            issueNewCard: 'Nieuwe kaart uitgeven',
            finishSetup: 'Voltooi de installatie',
            chooseBankAccount: 'Kies bankrekening',
            chooseExistingBank: 'Kies een bestaande zakelijke bankrekening om uw Expensify Card-saldo te betalen, of voeg een nieuwe bankrekening toe.',
            accountEndingIn: 'Account eindigend op',
            addNewBankAccount: 'Een nieuwe bankrekening toevoegen',
            settlementAccount: 'Verrekeningsrekening',
            settlementAccountDescription: 'Kies een account om uw saldo van de Expensify Card te betalen.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Zorg ervoor dat deze account overeenkomt met je <a href="${reconciliationAccountSettingsLink}">Afstemmingsaccount</a> (${accountNumber}) zodat Doorlopende Afstemming goed werkt.`,
            settlementFrequency: 'Afwikkelingsfrequentie',
            settlementFrequencyDescription: 'Kies hoe vaak je je Expensify Card-saldo wilt betalen.',
            settlementFrequencyInfo:
                'Als je wilt overstappen naar maandelijkse afwikkeling, moet je je bankrekening verbinden via Plaid en een positieve 90-dagen balansgeschiedenis hebben.',
            frequency: {
                daily: 'Dagelijks',
                monthly: 'Maandelijks',
            },
            cardDetails: 'Kaartgegevens',
            cardPending: ({name}: {name: string}) => `De kaart is momenteel in behandeling en wordt uitgegeven zodra het account van ${name} is gevalideerd.`,
            virtual: 'Virtueel',
            physical: 'Fysiek',
            deactivate: 'Deactiveer kaart',
            changeCardLimit: 'Limiet van de kaart wijzigen',
            changeLimit: 'Limiet wijzigen',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Als u de limiet van deze kaart wijzigt naar ${limit}, worden nieuwe transacties geweigerd totdat u meer uitgaven op de kaart goedkeurt.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `Als je de limiet van deze kaart wijzigt naar ${limit}, worden nieuwe transacties tot volgende maand geweigerd.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Als u de limiet van deze kaart wijzigt naar ${limit}, worden nieuwe transacties geweigerd.`,
            changeCardLimitType: 'Wijzig kaartlimiettype',
            changeLimitType: 'Limiettype wijzigen',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Als je het limiettype van deze kaart wijzigt naar Slim Limiet, worden nieuwe transacties geweigerd omdat de niet-goedgekeurde limiet van ${limit} al is bereikt.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Als je het limiettype van deze kaart wijzigt naar Maandelijks, worden nieuwe transacties geweigerd omdat de maandelijkse limiet van ${limit} al is bereikt.`,
            addShippingDetails: 'Verzendgegevens toevoegen',
            issuedCard: ({assignee}: AssigneeParams) => `heeft ${assignee} een Expensify Card uitgegeven! De kaart zal binnen 2-3 werkdagen arriveren.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) => `heeft ${assignee} een Expensify Card uitgegeven! De kaart wordt verzonden zodra de verzendgegevens zijn bevestigd.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `heeft ${assignee} een virtuele ${link} uitgegeven! De kaart kan direct worden gebruikt.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} heeft verzendgegevens toegevoegd. Expensify Card wordt binnen 2-3 werkdagen bezorgd.`,
            verifyingHeader: 'Verifiëren',
            bankAccountVerifiedHeader: 'Bankrekening geverifieerd',
            verifyingBankAccount: 'Bankrekening verifiëren...',
            verifyingBankAccountDescription: 'Even geduld terwijl we bevestigen dat dit account kan worden gebruikt om Expensify Cards uit te geven.',
            bankAccountVerified: 'Bankrekening geverifieerd!',
            bankAccountVerifiedDescription: 'Je kunt nu Expensify-kaarten uitgeven aan de leden van je werkruimte.',
            oneMoreStep: 'Nog één stap...',
            oneMoreStepDescription: 'Het lijkt erop dat we je bankrekening handmatig moeten verifiëren. Ga naar Concierge waar je instructies op je wachten.',
            gotIt: 'Begrepen',
            goToConcierge: 'Ga naar Concierge',
        },
        categories: {
            deleteCategories: 'Categorieën verwijderen',
            deleteCategoriesPrompt: 'Weet je zeker dat je deze categorieën wilt verwijderen?',
            deleteCategory: 'Categorie verwijderen',
            deleteCategoryPrompt: 'Weet u zeker dat u deze categorie wilt verwijderen?',
            disableCategories: 'Categorieën uitschakelen',
            disableCategory: 'Categorie uitschakelen',
            enableCategories: 'Categorieën inschakelen',
            enableCategory: 'Categorie inschakelen',
            defaultSpendCategories: 'Standaard uitgavencategorieën',
            spendCategoriesDescription: 'Pas aan hoe uitgaven bij handelaren worden gecategoriseerd voor creditcardtransacties en gescande bonnetjes.',
            deleteFailureMessage: 'Er is een fout opgetreden bij het verwijderen van de categorie, probeer het alstublieft opnieuw.',
            categoryName: 'Categorienaam',
            requiresCategory: 'Leden moeten alle uitgaven categoriseren',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Alle uitgaven moeten worden gecategoriseerd om te exporteren naar ${connectionName}.`,
            subtitle: 'Krijg een beter overzicht van waar geld wordt uitgegeven. Gebruik onze standaardcategorieën of voeg je eigen categorieën toe.',
            emptyCategories: {
                title: 'Je hebt nog geen categorieën aangemaakt',
                subtitle: 'Voeg een categorie toe om uw uitgaven te organiseren.',
                subtitleWithAccounting: ({accountingPageURL}: EmptyCategoriesSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>Je categorieën worden momenteel geïmporteerd vanuit een boekhoudkoppeling. Ga naar de <a href="${accountingPageURL}">boekhouding</a> om wijzigingen aan te brengen.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de categorie, probeer het alstublieft opnieuw.',
            createFailureMessage: 'Er is een fout opgetreden bij het aanmaken van de categorie, probeer het alstublieft opnieuw.',
            addCategory: 'Categorie toevoegen',
            editCategory: 'Categorie bewerken',
            editCategories: 'Categorieën bewerken',
            findCategory: 'Categorie zoeken',
            categoryRequiredError: 'Categorienaam is vereist',
            existingCategoryError: 'Er bestaat al een categorie met deze naam.',
            invalidCategoryName: 'Ongeldige categorienaam',
            importedFromAccountingSoftware: 'De onderstaande categorieën zijn geïmporteerd van uw',
            payrollCode: 'Payrollcode',
            updatePayrollCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de payrollcode, probeer het alstublieft opnieuw.',
            glCode: 'GL-code',
            updateGLCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de GL-code, probeer het alstublieft opnieuw.',
            importCategories: 'Categorieën importeren',
            cannotDeleteOrDisableAllCategories: {
                title: 'Kan niet alle categorieën verwijderen of uitschakelen',
                description: `Er moet ten minste één categorie ingeschakeld blijven omdat uw werkruimte categorieën vereist.`,
            },
        },
        moreFeatures: {
            subtitle: 'Gebruik de onderstaande schakelaars om meer functies in te schakelen naarmate je groeit. Elke functie verschijnt in het navigatiemenu voor verdere aanpassing.',
            spendSection: {
                title: 'Uitgaven',
                subtitle: 'Schakel functionaliteit in die je helpt je team op te schalen.',
            },
            manageSection: {
                title: 'Beheren',
                subtitle: 'Voeg controles toe die helpen om uitgaven binnen het budget te houden.',
            },
            earnSection: {
                title: 'Verdienen',
                subtitle: 'Stroomlijn uw inkomsten en krijg sneller betaald.',
            },
            organizeSection: {
                title: 'Organiseren',
                subtitle: 'Groepeer en analyseer uitgaven, registreer elke betaalde belasting.',
            },
            integrateSection: {
                title: 'Integreren',
                subtitle: 'Verbind Expensify met populaire financiële producten.',
            },
            distanceRates: {
                title: 'Afstandstarieven',
                subtitle: 'Voeg tarieven toe, werk ze bij en handhaaf ze.',
            },
            perDiem: {
                title: 'Per diem',
                subtitle: 'Stel dagvergoedingen in om de dagelijkse uitgaven van werknemers te beheersen.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Krijg inzicht en controle over uitgaven.',
                disableCardTitle: 'Expensify Card uitschakelen',
                disableCardPrompt: 'Je kunt de Expensify Card niet uitschakelen omdat deze al in gebruik is. Neem contact op met Concierge voor de volgende stappen.',
                disableCardButton: 'Chat met Concierge',
                feed: {
                    title: 'Verkrijg de Expensify Card',
                    subTitle: 'Vereenvoudig uw zakelijke uitgaven en bespaar tot 50% op uw Expensify-rekening, plus:',
                    features: {
                        cashBack: 'Geld terug bij elke aankoop in de VS',
                        unlimited: 'Onbeperkte virtuele kaarten',
                        spend: 'Uitgavencontroles en aangepaste limieten',
                    },
                    ctaTitle: 'Nieuwe kaart uitgeven',
                },
            },
            companyCards: {
                title: 'Bedrijfskaarten',
                subtitle: 'Importeer uitgaven van bestaande bedrijfskaarten.',
                feed: {
                    title: 'Bedrijfspassen importeren',
                    features: {
                        support: 'Ondersteuning voor alle grote kaartaanbieders',
                        assignCards: 'Wijs kaarten toe aan het hele team',
                        automaticImport: 'Automatische transactie-import',
                    },
                },
                bankConnectionError: 'Probleem met bankverbinding',
                connectWithPlaid: 'verbinding maken via Plaid',
                connectWithExpensifyCard: 'probeer de Expensify Card',
                bankConnectionDescription: 'Probeer uw kaarten opnieuw toe te voegen. Anders kunt u',
                disableCardTitle: 'Bedrijfspassen uitschakelen',
                disableCardPrompt: 'Je kunt bedrijfskaarten niet uitschakelen omdat deze functie in gebruik is. Neem contact op met de Concierge voor de volgende stappen.',
                disableCardButton: 'Chat met Concierge',
                cardDetails: 'Kaartgegevens',
                cardNumber: 'Kaartnummer',
                cardholder: 'Kaart houder',
                cardName: 'Kaartnaam',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} exporteren` : `${integration} exporteren`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Kies de ${integration}-account waarnaar transacties moeten worden geëxporteerd.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Kies de ${integration}-account waarnaar transacties moeten worden geëxporteerd. Selecteer een andere <a href="${exportPageLink}">exportoptie</a> om de beschikbare accounts te wijzigen.`,
                lastUpdated: 'Laatst bijgewerkt',
                transactionStartDate: 'Transactiebeginndatum',
                updateCard: 'Kaart bijwerken',
                unassignCard: 'Kaart toewijzen ongedaan maken',
                unassign: 'Toewijzen ongedaan maken',
                unassignCardDescription: 'Het toewijzen van deze kaart zal alle transacties op conceptrapporten van de rekening van de kaarthouder verwijderen.',
                assignCard: 'Kaart toewijzen',
                cardFeedName: 'Naam van de kaartfeed',
                cardFeedNameDescription: 'Geef de kaartfeed een unieke naam zodat je deze kunt onderscheiden van de andere.',
                cardFeedTransaction: 'Transacties verwijderen',
                cardFeedTransactionDescription: 'Kies of kaarthouders kaarttransacties kunnen verwijderen. Nieuwe transacties zullen deze regels volgen.',
                cardFeedRestrictDeletingTransaction: 'Beperk het verwijderen van transacties',
                cardFeedAllowDeletingTransaction: 'Verwijderen van transacties toestaan',
                removeCardFeed: 'Verwijder kaartfeed',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `Verwijder ${feedName} feed`,
                removeCardFeedDescription: 'Weet je zeker dat je deze kaartfeed wilt verwijderen? Dit zal alle kaarten deactiveren.',
                error: {
                    feedNameRequired: 'Naam van de kaartfeed is vereist',
                    statementCloseDateRequired: 'Selecteer een datum waarop het afschrift moet worden gesloten.',
                },
                corporate: 'Beperk het verwijderen van transacties',
                personal: 'Verwijderen van transacties toestaan',
                setFeedNameDescription: 'Geef de kaartfeed een unieke naam zodat je deze van de anderen kunt onderscheiden.',
                setTransactionLiabilityDescription: 'Wanneer ingeschakeld, kunnen kaarthouders kaarttransacties verwijderen. Nieuwe transacties zullen deze regel volgen.',
                emptyAddedFeedTitle: 'Bedrijfspassen toewijzen',
                emptyAddedFeedDescription: 'Begin door je eerste kaart aan een lid toe te wijzen.',
                pendingFeedTitle: `We beoordelen uw verzoek...`,
                pendingFeedDescription: `We zijn momenteel uw feedgegevens aan het beoordelen. Zodra dat is voltooid, nemen we contact met u op via`,
                pendingBankTitle: 'Controleer uw browservenster',
                pendingBankDescription: ({bankName}: CompanyCardBankName) => `Verbind met ${bankName} via het browservenster dat zojuist is geopend. Als er geen is geopend,`,
                pendingBankLink: 'klik hier alstublieft',
                giveItNameInstruction: 'Geef de kaart een naam die hem onderscheidt van anderen.',
                updating: 'Bijwerken...',
                noAccountsFound: 'Geen accounts gevonden',
                defaultCard: 'Standaardkaart',
                downgradeTitle: `Kan werkruimte niet downgraden`,
                downgradeSubTitle: `Deze werkruimte kan niet worden gedowngraded omdat er meerdere kaartfeeds zijn verbonden (met uitzondering van Expensify Cards). Alstublieft <a href="#">houd slechts één kaartfeed</a> om door te gaan.`,
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Voeg het account toe in ${connection} en synchroniseer de verbinding opnieuw.`,
                expensifyCardBannerTitle: 'Verkrijg de Expensify Card',
                expensifyCardBannerSubtitle: 'Geniet van cashback op elke aankoop in de VS, tot 50% korting op je Expensify-rekening, onbeperkte virtuele kaarten en nog veel meer.',
                expensifyCardBannerLearnMoreButton: 'Meer informatie',
                statementCloseDateTitle: 'Datum waarop rekeningafschrift wordt gesloten',
                statementCloseDateDescription: 'Laat ons weten wanneer je rekeningafschrift wordt gesloten, dan maken we een bijpassend rekeningafschrift in Expensify.',
            },
            workflows: {
                title: 'Werkstromen',
                subtitle: 'Configureer hoe uitgaven worden goedgekeurd en betaald.',
                disableApprovalPrompt:
                    'Expensify-kaarten van deze werkruimte zijn momenteel afhankelijk van goedkeuring om hun Smart Limits te definiëren. Pas de limiettypen van eventuele Expensify-kaarten met Smart Limits aan voordat u goedkeuringen uitschakelt.',
            },
            invoices: {
                title: 'Facturen',
                subtitle: 'Verstuur en ontvang facturen.',
            },
            categories: {
                title: 'Categorieën',
                subtitle: 'Volg en organiseer uitgaven.',
            },
            tags: {
                title: 'Labels',
                subtitle: 'Classificeer kosten en volg factureerbare uitgaven.',
            },
            taxes: {
                title: 'Belastingen',
                subtitle: 'Documenteer en claim in aanmerking komende belastingen terug.',
            },
            reportFields: {
                title: 'Rapportvelden',
                subtitle: 'Aangepaste velden instellen voor uitgaven.',
            },
            connections: {
                title: 'Boekhouding',
                subtitle: 'Synchroniseer uw rekeningschema en meer.',
            },
            receiptPartners: {
                title: 'Bonnetjespartners',
                subtitle: 'Automatisch bonnetjes importeren.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Niet zo snel...',
                featureEnabledText: 'Om deze functie in of uit te schakelen, moet je je boekhoudimportinstellingen wijzigen.',
                disconnectText: 'Om boekhouding uit te schakelen, moet je de boekhoudkoppeling van je werkruimte loskoppelen.',
                manageSettings: 'Instellingen beheren',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Uber verbreken',
                disconnectText: 'Om deze functie uit te schakelen, verbreek eerst de Uber for Business integratie.',
                description: 'Weet u zeker dat u deze integratie wilt verbreken?',
                confirmText: 'Begrepen',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Niet zo snel...',
                featureEnabledText:
                    'Expensify-kaarten in deze werkruimte zijn afhankelijk van goedkeuringsworkflows om hun Smart Limits te definiëren.\n\nWijzig de limiettypen van alle kaarten met Smart Limits voordat u workflows uitschakelt.',
                confirmText: 'Ga naar Expensify Cards',
            },
            rules: {
                title: 'Regels',
                subtitle: 'Vereis bonnen, markeer hoge uitgaven en meer.',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Voorbeelden:',
            customReportNamesSubtitle: `<muted-text>Pas rapporttitels aan met behulp van onze <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">uitgebreide formules</a>.</muted-text>`,
            customNameTitle: 'Standaard rapporttitel',
            customNameDescription: `Kies een aangepaste naam voor onkostendeclaraties met behulp van onze <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">uitgebreide formules</a>.`,
            customNameInputLabel: 'Naam',
            customNameEmailPhoneExample: 'E-mail of telefoonnummer van lid: {report:submit:from}',
            customNameStartDateExample: 'Rapport startdatum: {report:startdate}',
            customNameWorkspaceNameExample: 'Werkruimte naam: {report:workspacename}',
            customNameReportIDExample: 'Report ID: {report:id}',
            customNameTotalExample: 'Totaal: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Voorkom dat leden aangepaste rapportnamen wijzigen',
        },
        reportFields: {
            addField: 'Veld toevoegen',
            delete: 'Veld verwijderen',
            deleteFields: 'Velden verwijderen',
            findReportField: 'Rapportveld zoeken',
            deleteConfirmation: 'Weet je zeker dat je dit rapportveld wilt verwijderen?',
            deleteFieldsConfirmation: 'Weet je zeker dat je deze rapportvelden wilt verwijderen?',
            emptyReportFields: {
                title: 'Je hebt nog geen rapportvelden aangemaakt',
                subtitle: 'Voeg een aangepast veld toe (tekst, datum of dropdown) dat op rapporten verschijnt.',
            },
            subtitle: 'Rapportvelden zijn van toepassing op alle uitgaven en kunnen nuttig zijn wanneer u om extra informatie wilt vragen.',
            disableReportFields: 'Rapportvelden uitschakelen',
            disableReportFieldsConfirmation: 'Weet je het zeker? Tekst- en datumvelden worden verwijderd en lijsten worden uitgeschakeld.',
            importedFromAccountingSoftware: 'De onderstaande rapportvelden zijn geïmporteerd uit uw',
            textType: 'Tekst',
            dateType: 'Datum',
            dropdownType: 'Lijst',
            formulaType: 'Formule',
            textAlternateText: 'Voeg een veld toe voor vrije tekstinvoer.',
            dateAlternateText: 'Voeg een kalender toe voor datumselectie.',
            dropdownAlternateText: 'Voeg een lijst met opties toe om uit te kiezen.',
            formulaAlternateText: 'Voeg een formuleveld toe.',
            nameInputSubtitle: 'Kies een naam voor het rapportveld.',
            typeInputSubtitle: 'Kies welk type rapportveld je wilt gebruiken.',
            initialValueInputSubtitle: 'Voer een startwaarde in om in het rapportveld te tonen.',
            listValuesInputSubtitle: 'Deze waarden zullen verschijnen in de dropdown van uw rapportveld. Ingeschakelde waarden kunnen door leden worden geselecteerd.',
            listInputSubtitle: 'Deze waarden zullen verschijnen in uw rapportveldlijst. Ingeschakelde waarden kunnen door leden worden geselecteerd.',
            deleteValue: 'Waarde verwijderen',
            deleteValues: 'Waarden verwijderen',
            disableValue: 'Waarde uitschakelen',
            disableValues: 'Waarden uitschakelen',
            enableValue: 'Waarde inschakelen',
            enableValues: 'Waarden inschakelen',
            emptyReportFieldsValues: {
                title: 'Je hebt nog geen lijstwaarden aangemaakt.',
                subtitle: 'Voeg aangepaste waarden toe om op rapporten te verschijnen.',
            },
            deleteValuePrompt: 'Weet je zeker dat je deze lijstwaarde wilt verwijderen?',
            deleteValuesPrompt: 'Weet je zeker dat je deze lijstwaarden wilt verwijderen?',
            listValueRequiredError: 'Voer een lijstwaardenaam in, alstublieft',
            existingListValueError: 'Er bestaat al een lijstwaarde met deze naam.',
            editValue: 'Waarde bewerken',
            listValues: 'Waarden opsommen',
            addValue: 'Waarde toevoegen',
            existingReportFieldNameError: 'Er bestaat al een rapportveld met deze naam',
            reportFieldNameRequiredError: 'Voer een rapportveldnaam in alstublieft',
            reportFieldTypeRequiredError: 'Kies een rapportveldtype aub',
            circularReferenceError: 'Dit veld kan niet naar zichzelf verwijzen. Werk het bij.',
            reportFieldInitialValueRequiredError: 'Kies een initiële waarde voor een rapportveld alstublieft.',
            genericFailureMessage: 'Er is een fout opgetreden bij het bijwerken van het rapportveld. Probeer het opnieuw.',
        },
        tags: {
            tagName: 'Tagnaam',
            requiresTag: 'Leden moeten alle uitgaven taggen',
            trackBillable: 'Volg factureerbare uitgaven',
            customTagName: 'Aangepaste tagnaam',
            enableTag: 'Tag inschakelen',
            enableTags: 'Tags inschakelen',
            requireTag: 'Vereist label',
            requireTags: 'Vereiste tags',
            notRequireTags: 'Niet vereisen',
            disableTag: 'Label uitschakelen',
            disableTags: 'Tags uitschakelen',
            addTag: 'Tag toevoegen',
            editTag: 'Bewerk tag',
            editTags: 'Bewerk tags',
            findTag: 'Tag vinden',
            subtitle: 'Tags voegen meer gedetailleerde manieren toe om kosten te classificeren.',
            dependentMultiLevelTagsSubtitle: ({importSpreadsheetLink}: DependentMultiLevelTagsSubtitleParams) =>
                `<muted-text>U gebruikt <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">afhankelijke tags</a>. U kunt een <a href="${importSpreadsheetLink}">spreadsheet opnieuw importeren</a> om uw tags bij te werken.</muted-text>`,
            emptyTags: {
                title: 'Je hebt nog geen tags aangemaakt',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Voeg een tag toe om projecten, locaties, afdelingen en meer bij te houden.',
                subtitleHTML: `<muted-text><centered-text>Importeer een spreadsheet om tags toe te voegen voor het volgen van projecten, locaties, afdelingen en meer. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Meer informatie</a> over het opmaken van tagbestanden.</centered-text></muted-text>`,
                subtitleWithAccounting: ({accountingPageURL}: EmptyTagsSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>Je tags worden momenteel geïmporteerd vanuit een boekhoudverbinding. Ga naar de <a href="${accountingPageURL}">boekhouding</a> om wijzigingen aan te brengen.</centered-text></muted-text>`,
            },
            deleteTag: 'Verwijder tag',
            deleteTags: 'Verwijder tags',
            deleteTagConfirmation: 'Weet je zeker dat je deze tag wilt verwijderen?',
            deleteTagsConfirmation: 'Weet je zeker dat je deze tags wilt verwijderen?',
            deleteFailureMessage: 'Er is een fout opgetreden bij het verwijderen van de tag, probeer het opnieuw.',
            tagRequiredError: 'Tagnaam is vereist',
            existingTagError: 'Er bestaat al een tag met deze naam.',
            invalidTagNameError: 'Tagnaam kan niet 0 zijn. Kies een andere waarde.',
            genericFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de tag, probeer het alstublieft opnieuw.',
            importedFromAccountingSoftware: 'De onderstaande labels zijn geïmporteerd uit uw',
            glCode: 'GL-code',
            updateGLCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de GL-code, probeer het alstublieft opnieuw.',
            tagRules: 'Tagregels',
            approverDescription: 'Goedkeurder',
            importTags: 'Tags importeren',
            importTagsSupportingText: 'Codeer uw uitgaven met één type label of meerdere.',
            configureMultiLevelTags: 'Configureer uw lijst met tags voor meerlagige tagging.',
            importMultiLevelTagsSupportingText: `Hier is een voorbeeld van je tags. Als alles er goed uitziet, klik dan hieronder om ze te importeren.`,
            importMultiLevelTags: {
                firstRowTitle: 'De eerste rij is de titel voor elke taglijst',
                independentTags: 'Dit zijn onafhankelijke tags',
                glAdjacentColumn: 'Er is een GL-code in de aangrenzende kolom',
            },
            tagLevel: {
                singleLevel: 'Enkel niveau van tags',
                multiLevel: 'Meerniveautags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Wissel tag-niveaus om',
                prompt1: 'Het wisselen van tag-niveaus zal alle huidige tags wissen.',
                prompt2: 'We raden aan dat u eerst',
                prompt3: 'download een back-up',
                prompt4: 'door uw tags te exporteren.',
                prompt5: 'Meer informatie',
                prompt6: 'over tag-niveaus.',
            },
            overrideMultiTagWarning: {
                title: 'Tags importeren',
                prompt1: 'Weet je het zeker?',
                prompt2: ' De bestaande tags worden overschreven, maar je kunt',
                prompt3: ' een back-up downloaden',
                prompt4: ' eerst.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `We hebben *${columnCounts} kolommen* in uw spreadsheet gevonden. Selecteer *Naam* naast de kolom die tag-namen bevat. U kunt ook *Ingeschakeld* selecteren naast de kolom die de tag-status instelt.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Kan niet alle tags verwijderen of uitschakelen',
                description: `Er moet minstens één tag ingeschakeld blijven omdat uw werkruimte tags vereist.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Kan niet alle tags optioneel maken',
                description: `Er moet minstens één tag verplicht blijven omdat uw werkruimte-instellingen tags vereisen.`,
            },
            cannotMakeTagListRequired: {
                title: 'Kan geen taglijst maken vereist',
                description: 'Je kunt een taglijst alleen verplicht stellen als je beleid meerdere tagniveaus heeft geconfigureerd.',
            },
            tagCount: () => ({
                one: '1 Dag',
                other: (count: number) => `${count} Tags`,
            }),
        },
        taxes: {
            subtitle: 'Voeg belastingnamen, tarieven toe en stel standaardwaarden in.',
            addRate: 'Tarief toevoegen',
            workspaceDefault: 'Werkruimte valuta standaardinstelling',
            foreignDefault: 'Standaard vreemde valuta',
            customTaxName: 'Aangepaste belastingnaam',
            value: 'Waarde',
            taxReclaimableOn: 'Belasting terugvorderbaar op',
            taxRate: 'Belastingtarief',
            findTaxRate: 'Vind belastingtarief',
            error: {
                taxRateAlreadyExists: 'Deze belastingnaam is al in gebruik',
                taxCodeAlreadyExists: 'Deze belastingcode is al in gebruik',
                valuePercentageRange: 'Voer een geldig percentage in tussen 0 en 100',
                customNameRequired: 'Aangepaste belastingnaam is vereist',
                deleteFailureMessage: 'Er is een fout opgetreden bij het verwijderen van het belastingtarief. Probeer het opnieuw of vraag Concierge om hulp.',
                updateFailureMessage: 'Er is een fout opgetreden bij het bijwerken van het belastingtarief. Probeer het opnieuw of vraag Concierge om hulp.',
                createFailureMessage: 'Er is een fout opgetreden bij het aanmaken van het belastingtarief. Probeer het opnieuw of vraag Concierge om hulp.',
                updateTaxClaimableFailureMessage: 'Het terugvorderbare deel moet minder zijn dan het kilometertarief.',
            },
            deleteTaxConfirmation: 'Weet je zeker dat je deze belasting wilt verwijderen?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Weet je zeker dat je ${taxAmount} belastingen wilt verwijderen?`,
            actions: {
                delete: 'Verwijder tarief',
                deleteMultiple: 'Tarieven verwijderen',
                enable: 'Tarief inschakelen',
                disable: 'Tarief uitschakelen',
                enableTaxRates: () => ({
                    one: 'Tarief inschakelen',
                    other: 'Tarieven inschakelen',
                }),
                disableTaxRates: () => ({
                    one: 'Tarief uitschakelen',
                    other: 'Tarieven uitschakelen',
                }),
            },
            importedFromAccountingSoftware: 'De onderstaande belastingen zijn geïmporteerd van uw',
            taxCode: 'Belastingcode',
            updateTaxCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de belastingcode, probeer het opnieuw.',
        },
        duplicateWorkspace: {
            title: 'Geef je nieuwe werkruimte een naam',
            selectFeatures: 'Selecteer te kopiëren functies',
            whichFeatures: 'Welke functies wil je kopiëren naar je nieuwe werkruimte?',
            confirmDuplicate: '\n\nWil je doorgaan?',
            categories: 'categorieën en je regels voor automatische categorisatie',
            reimbursementAccount: 'vergoedingsrekening',
            delayedSubmission: 'vertraagde indiening',
            welcomeNote: 'Ga aan de slag met mijn nieuwe werkruimte',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Je staat op het punt om ${newWorkspaceName ?? ''} te maken en te delen met ${totalMembers ?? 0} leden uit de oorspronkelijke werkruimte.`,
            error: 'Er is een fout opgetreden bij het dupliceren van uw nieuwe werkruimte. Probeer het opnieuw.',
        },
        emptyWorkspace: {
            title: 'Je hebt geen werkruimtes',
            subtitle: 'Beheer bonnetjes, vergoed uitgaven, regel reizen, verstuur facturen en meer.',
            createAWorkspaceCTA: 'Aan de slag',
            features: {
                trackAndCollect: 'Volg en verzamel bonnetjes',
                reimbursements: 'Medewerkers vergoeden',
                companyCards: 'Bedrijfspassen beheren',
            },
            notFound: 'Geen werkruimte gevonden',
            description: 'Kamers zijn een geweldige plek om te discussiëren en samen te werken met meerdere mensen. Om te beginnen met samenwerken, maak of neem deel aan een werkruimte.',
        },
        new: {
            newWorkspace: 'Nieuwe werkruimte',
            getTheExpensifyCardAndMore: 'Krijg de Expensify Card en meer',
            confirmWorkspace: 'Werkruimte bevestigen',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mijn Groepswerkruimte${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `${userName}'s Werkruimte${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Er is een fout opgetreden bij het verwijderen van een lid uit de werkruimte, probeer het opnieuw.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Weet je zeker dat je ${memberName} wilt verwijderen?`,
                other: 'Weet je zeker dat je deze leden wilt verwijderen?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} is een goedkeurder in deze werkruimte. Wanneer je deze werkruimte niet meer met hen deelt, zullen we hen in de goedkeuringsworkflow vervangen door de eigenaar van de werkruimte, ${ownerName}.`,
            removeMembersTitle: () => ({
                one: 'Lid verwijderen',
                other: 'Leden verwijderen',
            }),
            findMember: 'Lid zoeken',
            removeWorkspaceMemberButtonTitle: 'Verwijderen uit werkruimte',
            removeGroupMemberButtonTitle: 'Verwijderen uit groep',
            removeRoomMemberButtonTitle: 'Verwijderen uit chat',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Weet je zeker dat je ${memberName} wilt verwijderen?`,
            removeMemberTitle: 'Lid verwijderen',
            transferOwner: 'Eigenaar overdragen',
            makeMember: 'Lid maken',
            makeAdmin: 'Beheerder maken',
            makeAuditor: 'Maak controleur',
            selectAll: 'Alles selecteren',
            error: {
                genericAdd: 'Er was een probleem bij het toevoegen van dit werkruimtelid.',
                cannotRemove: 'Je kunt jezelf of de eigenaar van de werkruimte niet verwijderen.',
                genericRemove: 'Er was een probleem met het verwijderen van dat werkruimte lid.',
            },
            addedWithPrimary: 'Sommige leden zijn toegevoegd met hun primaire logins.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Toegevoegd door secundaire login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Totaal aantal leden van de werkruimte: ${count}`,
            importMembers: 'Leden importeren',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Als je ${approver} uit deze werkruimte verwijdert, vervangen we deze persoon in de goedkeuringsworkflow door ${workspaceOwner}, de eigenaar van de werkruimte.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} heeft openstaande onkostendeclaraties die moeten worden goedgekeurd. Vraag hen deze goed te keuren, of neem hun declaraties over voordat je hen uit de werkruimte verwijdert.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Je kunt ${memberName} niet uit deze werkruimte verwijderen. Stel een nieuwe uitbetaler in via Werkstromen > Betalingen uitvoeren of bijhouden en probeer het daarna opnieuw.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Als je ${memberName} uit deze werkruimte verwijdert, vervangen we hem/haar als voorkeursexporteur door ${workspaceOwner}, de eigenaar van de werkruimte.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Als je ${memberName} uit deze werkruimte verwijdert, vervangen we hen als technisch contactpersoon door ${workspaceOwner}, de eigenaar van de werkruimte.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} heeft een openstaand rapport in behandeling waarvoor actie nodig is. Vraag hen om de vereiste actie te voltooien voordat je hen uit de werkruimte verwijdert.`,
        },
        card: {
            getStartedIssuing: 'Begin met het aanvragen van je eerste virtuele of fysieke kaart.',
            issueCard: 'Kaart uitgeven',
            issueNewCard: {
                whoNeedsCard: 'Wie heeft een kaart nodig?',
                inviteNewMember: 'Nieuw lid uitnodigen',
                findMember: 'Lid zoeken',
                chooseCardType: 'Kies een kaarttype',
                physicalCard: 'Fysieke kaart',
                physicalCardDescription: 'Geweldig voor de frequente spender',
                virtualCard: 'Virtuele kaart',
                virtualCardDescription: 'Instant en flexibel',
                chooseLimitType: 'Kies een limiettype',
                smartLimit: 'Slimme limiet',
                smartLimitDescription: 'Besteed tot een bepaald bedrag voordat goedkeuring vereist is.',
                monthly: 'Maandelijks',
                monthlyDescription: 'Besteed tot een bepaald bedrag per maand',
                fixedAmount: 'Vast bedrag',
                fixedAmountDescription: 'Eenmalig tot een bepaald bedrag uitgeven',
                setLimit: 'Stel een limiet in',
                cardLimitError: 'Voer een bedrag in dat minder is dan $21,474,836',
                giveItName: 'Geef het een naam',
                giveItNameInstruction: 'Maak het uniek genoeg om het te onderscheiden van andere kaarten. Specifieke gebruikssituaties zijn zelfs nog beter!',
                cardName: 'Kaartnaam',
                letsDoubleCheck: 'Laten we dubbel controleren of alles er goed uitziet.',
                willBeReady: 'Deze kaart is direct klaar voor gebruik.',
                cardholder: 'Kaart houder',
                cardType: 'Kaarttype',
                limit: 'Limiet',
                limitType: 'Limiettype',
                name: 'Naam',
                disabledApprovalForSmartLimitError: 'Schakel goedkeuringen in <strong>Workflows > Goedkeuringen toevoegen</strong> in voordat u slimme limieten instelt',
            },
            deactivateCardModal: {
                deactivate: 'Deactiveren',
                deactivateCard: 'Deactiveer kaart',
                deactivateConfirmation: 'Het deactiveren van deze kaart zal alle toekomstige transacties weigeren en kan niet ongedaan worden gemaakt.',
            },
        },
        accounting: {
            settings: 'instellingen',
            title: 'Verbindingen',
            subtitle: 'Maak verbinding met uw boekhoudsysteem om transacties te coderen met uw rekeningschema, betalingen automatisch te matchen en uw financiën synchroon te houden.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chat met uw installatiespecialist.',
            talkYourAccountManager: 'Chat met uw accountmanager.',
            talkToConcierge: 'Chat met Concierge.',
            needAnotherAccounting: 'Nog een boekhoudsoftware nodig?',
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
                `Er is een fout opgetreden met een verbinding die is ingesteld in Expensify Classic. [Ga naar Expensify Classic om dit probleem op te lossen.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Ga naar Expensify Classic om je instellingen te beheren.',
            setup: 'Verbind',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Laatst gesynchroniseerd ${relativeDate}`,
            notSync: 'Niet gesynchroniseerd',
            import: 'Importeren',
            export: 'Exporteren',
            advanced: 'Geavanceerd',
            other: 'Andere',
            syncNow: 'Nu synchroniseren',
            disconnect: 'Verbreek verbinding',
            reinstall: 'Connector opnieuw installeren',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integratie';
                return `Verbreek verbinding met ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Verbind ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'boekhoudintegratie'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Kan geen verbinding maken met QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Kan geen verbinding maken met Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Kan geen verbinding maken met NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Kan geen verbinding maken met QuickBooks Desktop';
                    default: {
                        return 'Kan geen verbinding maken met integratie';
                    }
                }
            },
            accounts: 'Rekeningschema',
            taxes: 'Belastingen',
            imported: 'Geïmporteerd',
            notImported: 'Niet geïmporteerd',
            importAsCategory: 'Geïmporteerd als categorieën',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Geïmporteerd',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Geïmporteerd als tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Geïmporteerd',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Niet geïmporteerd',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Niet geïmporteerd',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Geïmporteerd als rapportvelden',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite medewerker standaardwaarde',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'deze integratie';
                return `Weet je zeker dat je ${integrationName} wilt loskoppelen?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Weet je zeker dat je ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'deze boekhoudintegratie'} wilt verbinden? Dit zal alle bestaande boekhoudkundige verbindingen verwijderen.`,
            enterCredentials: 'Voer uw inloggegevens in',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Klanten importeren';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Werknemers importeren';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Accounts importeren';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Klassen importeren';
                        case 'quickbooksOnlineImportLocations':
                            return 'Locaties importeren';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Geïmporteerde gegevens verwerken';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Gesynchroniseerde vergoede rapporten en factuurbetalingen';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Belastingcodes importeren';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Verbinding met QuickBooks Online controleren';
                        case 'quickbooksOnlineImportMain':
                            return 'QuickBooks Online-gegevens importeren';
                        case 'startingImportXero':
                            return 'Xero-gegevens importeren';
                        case 'startingImportQBO':
                            return 'QuickBooks Online-gegevens importeren';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'QuickBooks Desktop-gegevens importeren';
                        case 'quickbooksDesktopImportTitle':
                            return 'Titel importeren';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Certificaat voor goedkeuring importeren';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Dimensies importeren';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Beleid voor importeren opslaan';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Nog steeds gegevens synchroniseren met QuickBooks... Zorg ervoor dat de Web Connector actief is.';
                        case 'quickbooksOnlineSyncTitle':
                            return 'QuickBooks Online-gegevens synchroniseren';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Gegevens laden';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Categorieën bijwerken';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Klanten/projecten bijwerken';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Lijst met personen bijwerken';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Rapportvelden bijwerken';
                        case 'jobDone':
                            return 'Wachten tot geïmporteerde gegevens zijn geladen';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Synchroniseren van rekeningschema';
                        case 'xeroSyncImportCategories':
                            return 'Categorieën synchroniseren';
                        case 'xeroSyncImportCustomers':
                            return 'Klanten synchroniseren';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Expensify-rapporten markeren als vergoed';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Xero-facturen en -rekeningen als betaald markeren';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Synchroniseren van trackingcategorieën';
                        case 'xeroSyncImportBankAccounts':
                            return 'Bankrekeningen synchroniseren';
                        case 'xeroSyncImportTaxRates':
                            return 'Belastingtarieven synchroniseren';
                        case 'xeroCheckConnection':
                            return 'Xero-verbinding controleren';
                        case 'xeroSyncTitle':
                            return 'Xero-gegevens synchroniseren';
                        case 'netSuiteSyncConnection':
                            return 'Initialiseren van verbinding met NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Klanten importeren';
                        case 'netSuiteSyncInitData':
                            return 'Gegevens ophalen van NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Belastingen importeren';
                        case 'netSuiteSyncImportItems':
                            return 'Items importeren';
                        case 'netSuiteSyncData':
                            return 'Gegevens importeren in Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Accounts synchroniseren';
                        case 'netSuiteSyncCurrencies':
                            return "Valuta's synchroniseren";
                        case 'netSuiteSyncCategories':
                            return 'Categorieën synchroniseren';
                        case 'netSuiteSyncReportFields':
                            return 'Gegevens importeren als Expensify-rapportvelden';
                        case 'netSuiteSyncTags':
                            return 'Gegevens importeren als Expensify-tags';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Verbindingsinformatie bijwerken';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensify-rapporten markeren als vergoed';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuite-facturen en -rekeningen als betaald markeren';
                        case 'netSuiteImportVendorsTitle':
                            return 'Leveranciers importeren';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Aangepaste lijsten importeren';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Aangepaste lijsten importeren';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Subsidiairies importeren';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Leveranciers importeren';
                        case 'intacctCheckConnection':
                            return 'Sage Intacct-verbinding controleren';
                        case 'intacctImportDimensions':
                            return 'Sage Intacct-dimensies importeren';
                        case 'intacctImportTitle':
                            return 'Sage Intacct-gegevens importeren';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Vertaling ontbreekt voor fase: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Voorkeurs-exporteur',
            exportPreferredExporterNote:
                'De voorkeursexporteur kan elke werkruimtebeheerder zijn, maar moet ook een domeinbeheerder zijn als je verschillende exportaccounts instelt voor individuele bedrijfskaarten in Domeininstellingen.',
            exportPreferredExporterSubNote: 'Zodra ingesteld, zal de voorkeurs-exporteur rapporten voor export in hun account zien.',
            exportAs: 'Exporteren als',
            exportOutOfPocket: 'Exporteer uit eigen zak gemaakte uitgaven als',
            exportCompanyCard: 'Exporteer uitgaven van bedrijfskaarten als',
            exportDate: 'Exportdatum',
            defaultVendor: 'Standaard leverancier',
            autoSync: 'Auto-sync',
            autoSyncDescription: 'Synchroniseer NetSuite en Expensify automatisch, elke dag. Exporteer het afgeronde rapport in realtime.',
            reimbursedReports: 'Gesynchroniseerde vergoede rapporten',
            cardReconciliation: 'Kaartafstemming',
            reconciliationAccount: 'Rekening voor afstemming',
            continuousReconciliation: 'Continue Reconciliatie',
            saveHoursOnReconciliation:
                'Bespaar uren op reconciliatie elke boekhoudperiode door Expensify continu Expensify Card-afschriften en afrekeningen namens u te laten reconciliëren.',
            enableContinuousReconciliation: ({accountingAdvancedSettingsLink, connectionName}: EnableContinuousReconciliationParams) =>
                `<muted-text-label>Om continue afstemming mogelijk te maken, moet u <a href="${accountingAdvancedSettingsLink}">automatische synchronisatie</a> voor ${connectionName} inschakelen.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Kies de bankrekening waarmee uw Expensify Card-betalingen worden verrekend.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Zorg ervoor dat dit account overeenkomt met uw <a href="${settlementAccountUrl}">Expensify Card afwikkelingsrekening</a> (eindigend op ${lastFourPAN}) zodat Continue Reconciliation goed werkt.`,
            },
        },
        export: {
            notReadyHeading: 'Niet klaar om te exporteren',
            notReadyDescription:
                'Concept- of in behandeling zijnde onkostendeclaraties kunnen niet naar het boekhoudsysteem worden geëxporteerd. Keur deze onkosten goed of betaal ze voordat u ze exporteert.',
        },
        invoices: {
            sendInvoice: 'Factuur verzenden',
            sendFrom: 'Verzenden van',
            invoicingDetails: 'Factureringsgegevens',
            invoicingDetailsDescription: 'Deze informatie zal op uw facturen verschijnen.',
            companyName: 'Bedrijfsnaam',
            companyWebsite: 'Bedrijfswebsite',
            paymentMethods: {
                personal: 'Persoonlijk',
                business: 'Business',
                chooseInvoiceMethod: 'Kies hieronder een betaalmethode:',
                payingAsIndividual: 'Betalen als individu',
                payingAsBusiness: 'Betalen als een bedrijf',
            },
            invoiceBalance: 'Factuursaldo',
            invoiceBalanceSubtitle: 'Dit is je huidige saldo van het innen van factuurbetalingen. Het wordt automatisch naar je bankrekening overgemaakt als je er een hebt toegevoegd.',
            bankAccountsSubtitle: 'Voeg een bankrekening toe om factuurbetalingen te maken en te ontvangen.',
        },
        invite: {
            member: 'Lid uitnodigen',
            members: 'Leden uitnodigen',
            invitePeople: 'Nieuwe leden uitnodigen',
            genericFailureMessage: 'Er is een fout opgetreden bij het uitnodigen van het lid voor de werkruimte. Probeer het alstublieft opnieuw.',
            pleaseEnterValidLogin: `Zorg ervoor dat het e-mailadres of telefoonnummer geldig is (bijv. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'gebruiker',
            users: 'gebruikers',
            invited: 'uitgenodigd',
            removed: 'verwijderd',
            to: 'naar',
            from: 'van',
        },
        inviteMessage: {
            confirmDetails: 'Bevestig gegevens',
            inviteMessagePrompt: 'Maak je uitnodiging extra speciaal door hieronder een bericht toe te voegen!',
            personalMessagePrompt: 'Bericht',
            genericFailureMessage: 'Er is een fout opgetreden bij het uitnodigen van het lid voor de werkruimte. Probeer het alstublieft opnieuw.',
            inviteNoMembersError: 'Selecteer alstublieft ten minste één lid om uit te nodigen',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} heeft verzocht om lid te worden van ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Oeps! Niet zo snel...',
            workspaceNeeds: 'Een werkruimte heeft ten minste één ingeschakelde afstandstarief nodig.',
            distance: 'Afstand',
            centrallyManage: 'Beheer tarieven centraal, volg in mijlen of kilometers, en stel een standaardcategorie in.',
            rate: 'Beoordeel',
            addRate: 'Tarief toevoegen',
            findRate: 'Vind tarief',
            trackTax: 'Belasting bijhouden',
            deleteRates: () => ({
                one: 'Verwijder tarief',
                other: 'Tarieven verwijderen',
            }),
            enableRates: () => ({
                one: 'Tarief inschakelen',
                other: 'Tarieven inschakelen',
            }),
            disableRates: () => ({
                one: 'Tarief uitschakelen',
                other: 'Tarieven uitschakelen',
            }),
            enableRate: 'Tarief inschakelen',
            status: 'Status',
            unit: 'Eenheid',
            taxFeatureNotEnabledMessage:
                '<muted-text>Belastingen moeten zijn ingeschakeld in de werkruimte om deze functie te gebruiken. Ga naar <a href="#">Meer functies</a> om die wijziging door te voeren.</muted-text>',
            deleteDistanceRate: 'Verwijder afstandstarief',
            areYouSureDelete: () => ({
                one: 'Weet je zeker dat je dit tarief wilt verwijderen?',
                other: 'Weet je zeker dat je deze tarieven wilt verwijderen?',
            }),
            errors: {
                rateNameRequired: 'Tariefnaam is vereist',
                existingRateName: 'Er bestaat al een afstandstarief met deze naam.',
            },
        },
        editor: {
            descriptionInputLabel: 'Beschrijving',
            nameInputLabel: 'Naam',
            typeInputLabel: 'Type',
            initialValueInputLabel: 'Initiële waarde',
            nameInputHelpText: 'Dit is de naam die je op je werkruimte zult zien.',
            nameIsRequiredError: 'Je moet je werkruimte een naam geven',
            currencyInputLabel: 'Standaardvaluta',
            currencyInputHelpText: 'Alle uitgaven in deze werkruimte worden omgezet naar deze valuta.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `De standaardvaluta kan niet worden gewijzigd omdat deze werkruimte is gekoppeld aan een ${currency} bankrekening.`,
            save: 'Opslaan',
            genericFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de werkruimte. Probeer het opnieuw.',
            avatarUploadFailureMessage: 'Er is een fout opgetreden bij het uploaden van de avatar. Probeer het opnieuw.',
            addressContext: 'Een Werkruimteadres is vereist om Expensify Travel in te schakelen. Voer een adres in dat aan uw bedrijf is gekoppeld.',
            policy: 'Kostenbeleid',
        },
        bankAccount: {
            continueWithSetup: 'Setup voortzetten',
            youAreAlmostDone:
                'Je bent bijna klaar met het instellen van je bankrekening, waarmee je zakelijke kaarten kunt uitgeven, onkosten kunt vergoeden, facturen kunt innen en rekeningen kunt betalen.',
            streamlinePayments: 'Stroomlijn betalingen',
            connectBankAccountNote: 'Opmerking: Persoonlijke bankrekeningen kunnen niet worden gebruikt voor betalingen in werkruimtes.',
            oneMoreThing: 'Nog één ding!',
            allSet: 'Je bent helemaal klaar!',
            accountDescriptionWithCards: 'Deze bankrekening zal worden gebruikt om zakelijke kaarten uit te geven, onkosten te vergoeden, facturen te innen en rekeningen te betalen.',
            letsFinishInChat: 'Laten we in de chat afronden!',
            finishInChat: 'Afwerken in chat',
            almostDone: 'Bijna klaar!',
            disconnectBankAccount: 'Bankrekening ontkoppelen',
            startOver: 'Opnieuw beginnen',
            updateDetails: 'Details bijwerken',
            yesDisconnectMyBankAccount: 'Ja, koppel mijn bankrekening los.',
            yesStartOver: 'Ja, begin opnieuw.',
            disconnectYourBankAccount: ({bankName}: DisconnectYourBankAccountParams) =>
                `Koppel uw <strong>${bankName}</strong> bankrekening los. Eventuele openstaande transacties voor deze rekening zullen nog steeds worden voltooid.`,
            clearProgress: 'Opnieuw beginnen zal de voortgang die je tot nu toe hebt gemaakt wissen.',
            areYouSure: 'Weet je het zeker?',
            workspaceCurrency: 'Werkruimte valuta',
            updateCurrencyPrompt: 'Het lijkt erop dat je werkruimte momenteel is ingesteld op een andere valuta dan USD. Klik op de knop hieronder om je valuta nu bij te werken naar USD.',
            updateToUSD: 'Bijwerken naar USD',
            updateWorkspaceCurrency: 'Werkruimte valuta bijwerken',
            workspaceCurrencyNotSupported: 'Werkruimtevaluta niet ondersteund',
            yourWorkspace: `Uw werkruimte is ingesteld op een niet-ondersteunde valuta. Bekijk de <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">lijst met ondersteunde valuta's</a>.`,
            chooseAnExisting: 'Kies een bestaande bankrekening om uitgaven te betalen of voeg een nieuwe toe.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Eigenaar overdragen',
            addPaymentCardTitle: 'Voer uw betaalkaart in om het eigendom over te dragen',
            addPaymentCardButtonText: 'Accepteer voorwaarden & voeg betaalkaart toe',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Lees en accepteer de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">voorwaarden</a> en het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacybeleid</a> om je kaart toe te voegen.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS-conform',
            addPaymentCardBankLevelEncrypt: 'Versleuteling op bankniveau',
            addPaymentCardRedundant: 'Redundante infrastructuur',
            addPaymentCardLearnMore: `<muted-text>Meer informatie over onze <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">beveiliging</a>.</muted-text>`,
            amountOwedTitle: 'Openstaand saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Dit account heeft een openstaand saldo van een vorige maand.\n\nWilt u het saldo vereffenen en de facturering van deze werkruimte overnemen?',
            ownerOwesAmountTitle: 'Openstaand saldo',
            ownerOwesAmountButtonText: 'Saldo overboeken',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `Het account dat eigenaar is van deze werkruimte (${email}) heeft een openstaand saldo van een vorige maand.\n\nWilt u dit bedrag (${amount}) overmaken om de facturering voor deze werkruimte over te nemen? Uw betaalkaart wordt onmiddellijk belast.`,
            subscriptionTitle: 'Neem jaarlijkse abonnement over',
            subscriptionButtonText: 'Abonnement overdragen',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Het overnemen van deze werkruimte zal het jaarlijkse abonnement samenvoegen met uw huidige abonnement. Dit zal uw abonnementsomvang vergroten met ${usersCount} leden, waardoor uw nieuwe abonnementsomvang ${finalCount} wordt. Wilt u doorgaan?`,
            duplicateSubscriptionTitle: 'Waarschuwing voor dubbele abonnementen',
            duplicateSubscriptionButtonText: 'Doorgaan',
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `Het lijkt erop dat je de facturering voor de werkruimtes van ${email} probeert over te nemen, maar om dat te doen, moet je eerst beheerder zijn van al hun werkruimtes.\n\nKlik op "Doorgaan" als je alleen de facturering voor de werkruimte ${workspaceName} wilt overnemen.\n\nAls je de facturering voor hun hele abonnement wilt overnemen, laat hen je dan eerst als beheerder toevoegen aan al hun werkruimtes voordat je de facturering overneemt.`,
            hasFailedSettlementsTitle: 'Kan eigendom niet overdragen',
            hasFailedSettlementsButtonText: 'Begrepen',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Je kunt de facturering niet overnemen omdat ${email} een achterstallige Expensify Card-afrekening heeft. Vraag hen om contact op te nemen met concierge@expensify.com om het probleem op te lossen. Daarna kun je de facturering voor deze werkruimte overnemen.`,
            failedToClearBalanceTitle: 'Saldo wissen mislukt',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'We konden het saldo niet vereffenen. Probeer het later opnieuw.',
            successTitle: 'Woohoo! Alles klaar.',
            successDescription: 'Je bent nu de eigenaar van deze werkruimte.',
            errorTitle: 'Oeps! Niet zo snel...',
            errorDescription: `<muted-text><centered-text>Er is een probleem opgetreden bij het overdragen van het eigendom van deze werkruimte. Probeer het opnieuw of <concierge-link>neem contact op met Concierge</concierge-link> voor hulp.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Voorzichtig!',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `De volgende rapporten zijn al geëxporteerd naar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:\n\n${reportName}\n\nWeet u zeker dat u ze opnieuw wilt exporteren?`,
            confirmText: 'Ja, opnieuw exporteren',
            cancelText: 'Annuleren',
        },
        upgrade: {
            reportFields: {
                title: 'Rapportvelden',
                description: `Rapportvelden laten u header-niveau details specificeren, anders dan tags die betrekking hebben op uitgaven op individuele regelitems. Deze details kunnen specifieke projectnamen, zakenreis-informatie, locaties en meer omvatten.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Rapportvelden zijn alleen beschikbaar op het Control-abonnement, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Geniet van geautomatiseerde synchronisatie en verminder handmatige invoer met de Expensify + NetSuite-integratie. Krijg diepgaande, realtime financiële inzichten met ondersteuning voor native en aangepaste segmenten, inclusief project- en klanttoewijzing.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Onze NetSuite-integratie is alleen beschikbaar op het Control-abonnement, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Geniet van geautomatiseerde synchronisatie en verminder handmatige invoer met de Expensify + Sage Intacct-integratie. Verkrijg diepgaande, realtime financiële inzichten met door de gebruiker gedefinieerde dimensies, evenals onkostencodering per afdeling, klasse, locatie, klant en project (taak).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Onze Sage Intacct-integratie is alleen beschikbaar op het Control-abonnement, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Geniet van geautomatiseerde synchronisatie en verminder handmatige invoer met de Expensify + QuickBooks Desktop-integratie. Behaal ultieme efficiëntie met een realtime, tweerichtingsverbinding en uitgavecodering per klasse, item, klant en project.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Onze QuickBooks Desktop-integratie is alleen beschikbaar op het Control-abonnement, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Geavanceerde goedkeuringen',
                description: `Als je meer goedkeuringslagen wilt toevoegen – of gewoon wilt zorgen dat de grootste uitgaven nog een keer worden bekeken – hebben we je gedekt. Geavanceerde goedkeuringen helpen je om op elk niveau de juiste controles in te stellen, zodat je de uitgaven van je team onder controle houdt.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Geavanceerde goedkeuringen zijn alleen beschikbaar op het Control-plan, dat begint bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            categories: {
                title: 'Categorieën',
                description: 'Categorieën stellen je in staat om uitgaven bij te houden en te organiseren. Gebruik onze standaardcategorieën of voeg je eigen toe.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Categorieën zijn beschikbaar op het Collect-abonnement, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            glCodes: {
                title: 'GL-codes',
                description: `Voeg GL-codes toe aan uw categorieën en tags voor eenvoudige export van uitgaven naar uw boekhoud- en salarissystemen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL-codes zijn alleen beschikbaar in het Control-plan, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'GL & Payroll-codes',
                description: `Voeg GL- en Payroll-codes toe aan uw categorieën voor eenvoudige export van uitgaven naar uw boekhoud- en payrollsystemen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL- en Payroll-codes zijn alleen beschikbaar op het Control-plan, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Belastingcodes',
                description: `Voeg belastingcodes toe aan uw belastingen voor eenvoudige export van uitgaven naar uw boekhoud- en loonadministratiesystemen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Belastingcodes zijn alleen beschikbaar in het Control-abonnement, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            companyCards: {
                title: 'Onbeperkte Bedrijfskaarten',
                description: `Meer kaartfeeds nodig? Ontgrendel onbeperkte bedrijfskaarten om transacties van alle grote kaartuitgevers te synchroniseren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dit is alleen beschikbaar op het Control-plan, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            rules: {
                title: 'Regels',
                description: `Regels draaien op de achtergrond en houden je uitgaven onder controle, zodat je je geen zorgen hoeft te maken over de kleine dingen.\n\nVereis uitgavendetails zoals bonnetjes en beschrijvingen, stel limieten en standaarden in, en automatiseer goedkeuringen en betalingen – allemaal op één plek.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Regels zijn alleen beschikbaar in het Control-plan, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            perDiem: {
                title: 'Per diem',
                description:
                    'Per diem is een geweldige manier om uw dagelijkse kosten in overeenstemming en voorspelbaar te houden wanneer uw werknemers reizen. Geniet van functies zoals aangepaste tarieven, standaardcategorieën en meer gedetailleerde informatie zoals bestemmingen en subtarieven.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dagvergoedingen zijn alleen beschikbaar in het Control-plan, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            travel: {
                title: 'Reis',
                description: 'Expensify Travel is een nieuw platform voor het boeken en beheren van zakelijke reizen waarmee leden accommodaties, vluchten, vervoer en meer kunnen boeken.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Reizen is beschikbaar op het Collect-plan, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            reports: {
                title: 'Rapporten',
                description: 'Rapporten stellen je in staat om uitgaven te groeperen voor eenvoudigere tracking en organisatie.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Rapporten zijn beschikbaar op het Collect-plan, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Meerniveautags',
                description:
                    'Multi-Level Tags helpen je om uitgaven met grotere precisie bij te houden. Ken meerdere tags toe aan elk regelitem—zoals afdeling, klant of kostenplaats—om de volledige context van elke uitgave vast te leggen. Dit maakt gedetailleerdere rapportage, goedkeuringsworkflows en boekhouduitvoer mogelijk.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Multi-level tags zijn alleen beschikbaar op het Control-plan, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Afstandstarieven',
                description: 'Maak en beheer je eigen tarieven, volg in mijlen of kilometers, en stel standaardcategorieën in voor afstandskosten.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Afstandstarieven zijn beschikbaar op het Collect-abonnement, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            auditor: {
                title: 'Auditor',
                description: 'Auditors krijgen alleen-lezen toegang tot alle rapporten voor volledige zichtbaarheid en nalevingscontrole.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Auditors zijn alleen beschikbaar in het Control-plan, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Meerdere goedkeuringsniveaus',
                description: 'Meerdere goedkeuringsniveaus is een workflowtool voor bedrijven die vereisen dat meer dan één persoon een rapport goedkeurt voordat het kan worden vergoed.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Meerdere goedkeuringsniveaus zijn alleen beschikbaar op het Control-plan, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'per actief lid per maand.',
                perMember: 'per lid per maand.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Upgrade om toegang te krijgen tot deze functie, of <a href="${subscriptionLink}">lees meer</a> over onze abonnementen en prijzen.</muted-text>`,
            upgradeToUnlock: 'Ontgrendel deze functie',
            completed: {
                headline: `Je hebt je werkruimte geüpgraded!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Je hebt ${policyName} succesvol geüpgraded naar het Control-abonnement! <a href="${subscriptionLink}">Bekijk je abonnement</a> voor meer informatie.</centered-text>`,
                categorizeMessage: `Je bent succesvol geüpgraded naar het Collect-plan. Nu kun je je uitgaven categoriseren!`,
                travelMessage: `Je bent succesvol geüpgraded naar het Collect-abonnement. Nu kun je beginnen met het boeken en beheren van reizen!`,
                distanceRateMessage: `Je bent succesvol overgestapt naar het Collect-abonnement. Nu kun je het kilometertarief aanpassen!`,
                gotIt: 'Begrepen, bedankt.',
                createdWorkspace: 'Je hebt een werkruimte aangemaakt!',
            },
            commonFeatures: {
                title: 'Upgrade naar het Control-plan',
                note: 'Ontgrendel onze krachtigste functies, waaronder:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Het Control-abonnement begint bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`} <a href="${learnMoreMethodsRoute}">Meer informatie</a> over onze plannen en prijzen.</muted-text>`,
                    benefit1: 'Geavanceerde boekhoudkoppelingen (NetSuite, Sage Intacct en meer)',
                    benefit2: 'Slimme uitgavenregels',
                    benefit3: 'Meerniveau goedkeuringsworkflows',
                    benefit4: 'Verbeterde beveiligingscontroles',
                    toUpgrade: 'Om te upgraden, klik',
                    selectWorkspace: 'selecteer een werkruimte en wijzig het type plan naar',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Downgrade naar het Collect-plan',
                note: 'Als u downgrade, verliest u toegang tot deze functies en meer:',
                benefits: {
                    note: 'Voor een volledige vergelijking van onze plannen, bekijk onze',
                    pricingPage: 'prijs pagina',
                    confirm: 'Weet je zeker dat je wilt downgraden en je configuraties wilt verwijderen?',
                    warning: 'Dit kan niet ongedaan worden gemaakt.',
                    benefit1: 'Boekhoudkoppelingen (behalve QuickBooks Online en Xero)',
                    benefit2: 'Slimme uitgavenregels',
                    benefit3: 'Meerniveau goedkeuringsworkflows',
                    benefit4: 'Verbeterde beveiligingscontroles',
                    headsUp: 'Let op!',
                    multiWorkspaceNote: 'Je moet al je werkruimtes downgraden voordat je eerste maandelijkse betaling begint om een abonnement tegen het Collect-tarief te starten. Klik',
                    selectStep: '> selecteer elke werkruimte > wijzig het abonnementstype naar',
                },
            },
            completed: {
                headline: 'Je werkruimte is gedowngraded',
                description: 'Je hebt andere werkruimtes op het Control-plan. Om gefactureerd te worden tegen het Collect-tarief, moet je alle werkruimtes downgraden.',
                gotIt: 'Begrepen, bedankt.',
            },
        },
        payAndDowngrade: {
            title: 'Betalen & downgraden',
            headline: 'Uw laatste betaling',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Je eindfactuur voor dit abonnement is <strong>${formattedAmount}</strong>`,
            description2: ({date}: DateParams) => `Zie hieronder uw uitsplitsing voor ${date}:`,
            subscription:
                'Let op! Deze actie beëindigt je Expensify-abonnement, verwijdert deze werkruimte en verwijdert alle leden van de werkruimte. Als je deze werkruimte wilt behouden en alleen jezelf wilt verwijderen, laat dan eerst een andere beheerder de facturering overnemen.',
            genericFailureMessage: 'Er is een fout opgetreden bij het betalen van uw rekening. Probeer het alstublieft opnieuw.',
        },
        restrictedAction: {
            restricted: 'Beperkt',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Acties in de ${workspaceName} werkruimte zijn momenteel beperkt.`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Werkruimte-eigenaar, ${workspaceOwnerName} moet de betalingskaart in het bestand toevoegen of bijwerken om nieuwe werkruimte-activiteit te ontgrendelen.`,
            youWillNeedToAddOrUpdatePaymentCard: 'U moet de betaalkaart in het bestand toevoegen of bijwerken om nieuwe werkruimte-activiteit te ontgrendelen.',
            addPaymentCardToUnlock: 'Voeg een betaalkaart toe om te ontgrendelen!',
            addPaymentCardToContinueUsingWorkspace: 'Voeg een betaalkaart toe om deze werkruimte te blijven gebruiken.',
            pleaseReachOutToYourWorkspaceAdmin: 'Neem contact op met uw workspacebeheerder voor eventuele vragen.',
            chatWithYourAdmin: 'Chat met je beheerder',
            chatInAdmins: 'Chat in #admins',
            addPaymentCard: 'Betaalpas toevoegen',
            goToSubscription: 'Ga naar het abonnement',
        },
        rules: {
            individualExpenseRules: {
                title: 'Uitgaven',
                subtitle: ({categoriesPageLink, tagsPageLink}: IndividualExpenseRulesSubtitleParams) =>
                    `<muted-text>Stel uitgavenbeperkingen en standaardinstellingen in voor individuele uitgaven. U kunt ook regels voor <a href="${categoriesPageLink}">categorieën</a> en <a href="${tagsPageLink}">tags</a> maken.</muted-text>`,
                receiptRequiredAmount: 'Vereist bedrag voor bon',
                receiptRequiredAmountDescription: 'Vereis bonnen wanneer de uitgaven dit bedrag overschrijden, tenzij dit wordt overschreven door een categoriewaarde.',
                maxExpenseAmount: 'Maximale uitgavebedrag',
                maxExpenseAmountDescription: 'Markeer uitgaven die dit bedrag overschrijden, tenzij dit wordt overschreven door een categoriewaarde.',
                maxAge: 'Maximale leeftijd',
                maxExpenseAge: 'Maximale ouderdom van uitgaven',
                maxExpenseAgeDescription: 'Markeer uitgaven ouder dan een specifiek aantal dagen.',
                maxExpenseAgeDays: () => ({
                    one: '1 dag',
                    other: (count: number) => `${count} dagen`,
                }),
                cashExpenseDefault: 'Contante uitgave standaard',
                cashExpenseDefaultDescription:
                    'Kies hoe contante uitgaven moeten worden aangemaakt. Een uitgave wordt als contant beschouwd als het geen geïmporteerde bedrijfspastransactie is. Dit omvat handmatig aangemaakte uitgaven, bonnetjes, dagvergoedingen, kilometer- en tijdsuitgaven.',
                reimbursableDefault: 'Vergoedbaar',
                reimbursableDefaultDescription: 'Uitgaven worden meestal terugbetaald aan medewerkers',
                nonReimbursableDefault: 'Niet vergoedbaar',
                nonReimbursableDefaultDescription: 'Uitgaven worden soms terugbetaald aan medewerkers',
                alwaysReimbursable: 'Altijd vergoedbaar',
                alwaysReimbursableDescription: 'Uitgaven worden altijd terugbetaald aan medewerkers',
                alwaysNonReimbursable: 'Nooit vergoedbaar',
                alwaysNonReimbursableDescription: 'Uitgaven worden nooit terugbetaald aan medewerkers',
                billableDefault: 'Factureerbaar standaardwaarde',
                billableDefaultDescription: ({tagsPageLink}: BillableDefaultDescriptionParams) =>
                    `<muted-text>Kies of contante en creditcarduitgaven standaard factureerbaar moeten zijn. Factureerbare uitgaven worden in <a href="${tagsPageLink}">tags</a> in- of uitgeschakeld.</muted-text>`,
                billable: 'Factureerbaar',
                billableDescription: 'Uitgaven worden meestal doorberekend aan klanten.',
                nonBillable: 'Niet-factureerbaar',
                nonBillableDescription: 'Uitgaven worden soms opnieuw gefactureerd aan klanten.',
                eReceipts: 'eRecepten',
                eReceiptsHint: `eRecepten worden automatisch aangemaakt [voor de meeste USD-krediettransacties](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Deelnemer tracking',
                attendeeTrackingHint: 'Volg de kosten per persoon voor elke uitgave.',
                prohibitedDefaultDescription:
                    'Markeer alle bonnen waar alcohol, gokken of andere verboden items op voorkomen. Uitgaven met bonnen waarop deze items voorkomen, vereisen handmatige controle.',
                prohibitedExpenses: 'Verboden uitgaven',
                alcohol: 'Alcohol',
                hotelIncidentals: 'Hotel incidentals',
                gambling: 'Gokken',
                tobacco: 'Tabak',
                adultEntertainment: 'Volwassenenentertainment',
            },
            expenseReportRules: {
                title: 'Onkostendeclaraties',
                subtitle: 'Automatiseer de naleving van onkostendeclaraties, goedkeuringen en betalingen.',
                preventSelfApprovalsTitle: 'Voorkom zelfgoedkeuringen',
                preventSelfApprovalsSubtitle: 'Voorkom dat werkruimteleden hun eigen onkostendeclaraties goedkeuren.',
                autoApproveCompliantReportsTitle: 'Automatisch compliant rapporten goedkeuren',
                autoApproveCompliantReportsSubtitle: 'Configureer welke onkostendeclaraties in aanmerking komen voor automatische goedkeuring.',
                autoApproveReportsUnderTitle: 'Rapporten automatisch goedkeuren onder',
                autoApproveReportsUnderDescription: 'Volledig conforme onkostendeclaraties onder dit bedrag worden automatisch goedgekeurd.',
                randomReportAuditTitle: 'Willekeurige rapportaudit',
                randomReportAuditDescription: 'Vereis dat sommige rapporten handmatig worden goedgekeurd, zelfs als ze in aanmerking komen voor automatische goedkeuring.',
                autoPayApprovedReportsTitle: 'Automatisch goedgekeurde rapporten betalen',
                autoPayApprovedReportsSubtitle: "Configureer welke onkostennota's in aanmerking komen voor automatische betaling.",
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Voer een bedrag in dat minder is dan ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle: 'Ga naar meer functies en schakel workflows in, voeg vervolgens betalingen toe om deze functie te ontgrendelen.',
                autoPayReportsUnderTitle: 'Automatisch rapporten betalen onder',
                autoPayReportsUnderDescription: "Volledig conforme onkostennota's onder dit bedrag worden automatisch betaald.",
                unlockFeatureEnableWorkflowsSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `Ga naar [meer functies](${moreFeaturesLink}) en schakel workflows in, voeg vervolgens ${featureName} toe om deze functie te ontgrendelen.`,
                enableFeatureSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `Ga naar [meer functies](${moreFeaturesLink}) en schakel ${featureName} in om deze functie te ontgrendelen.`,
            },
            categoryRules: {
                title: 'Categoriewetten',
                approver: 'Goedkeurder',
                requireDescription: 'Beschrijving vereist',
                descriptionHint: 'Beschrijving hint',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Herinner werknemers eraan om aanvullende informatie te verstrekken voor uitgaven in de categorie “${categoryName}”. Deze hint verschijnt in het beschrijvingsveld van uitgaven.`,
                descriptionHintLabel: 'Tip',
                descriptionHintSubtitle: 'Pro-tip: Hoe korter, hoe beter!',
                maxAmount: 'Maximumbedrag',
                flagAmountsOver: 'Vlag bedragen boven',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `Van toepassing op de categorie "${categoryName}".`,
                flagAmountsOverSubtitle: 'Dit overschrijft het maximale bedrag voor alle uitgaven.',
                expenseLimitTypes: {
                    expense: 'Individuele uitgave',
                    expenseSubtitle: 'Markeer onkostbedragen per categorie. Deze regel overschrijft de algemene werkruimte-regel voor het maximale onkostbedrag.',
                    daily: 'Categorietotaal',
                    dailySubtitle: 'Vlag totale categorie-uitgaven per onkostennota.',
                },
                requireReceiptsOver: 'Vereis bonnen boven',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standaard`,
                    never: 'Nooit bonnen vereisen',
                    always: 'Altijd bonnen vereisen',
                },
                defaultTaxRate: 'Standaard belastingtarief',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Ga naar [Meer functies](${moreFeaturesLink}) en schakel workflows in. Voeg vervolgens goedkeuringen toe om deze functie te ontgrendelen.`,
            },
            customRules: {
                title: 'Aangepaste regels',
                cardSubtitle: 'Hier staat het uitgavenbeleid van je team, zodat iedereen weet wat er wel en niet wordt vergoed.',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Verzamel',
                    description: 'Voor teams die hun processen willen automatiseren.',
                },
                corporate: {
                    label: 'Beheer',
                    description: 'Voor organisaties met geavanceerde vereisten.',
                },
            },
            description: 'Kies een plan dat bij u past. Voor een gedetailleerde lijst met functies en prijzen, bekijk onze',
            subscriptionLink: 'plansoorten en prijshulp pagina',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Je hebt je gecommitteerd aan 1 actief lid op het Control-plan tot je jaarlijkse abonnement eindigt op ${annualSubscriptionEndDate}. Je kunt overstappen naar een pay-per-use abonnement en downgraden naar het Collect-plan vanaf ${annualSubscriptionEndDate} door automatisch verlengen uit te schakelen in`,
                other: `Je hebt je gecommitteerd aan ${count} actieve leden op het Control-plan tot je jaarlijkse abonnement eindigt op ${annualSubscriptionEndDate}. Je kunt overstappen naar een pay-per-use-abonnement en downgraden naar het Collect-plan vanaf ${annualSubscriptionEndDate} door automatisch verlengen uit te schakelen in`,
            }),
            subscriptions: 'Abonnementen',
        },
    },
    getAssistancePage: {
        title: 'Krijg hulp',
        subtitle: 'We zijn hier om je pad naar grootsheid vrij te maken!',
        description: 'Kies uit de onderstaande ondersteuningsopties:',
        chatWithConcierge: 'Chat met Concierge',
        scheduleSetupCall: 'Plan een installatiegesprek',
        scheduleACall: 'Gesprek plannen',
        questionMarkButtonTooltip: 'Krijg hulp van ons team',
        exploreHelpDocs: 'Verken helpdocumenten',
        registerForWebinar: 'Registreer voor webinar',
        onboardingHelp: 'Hulp bij onboarding',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Standaard huidskleur wijzigen',
        headers: {
            frequentlyUsed: 'Veelgebruikt',
            smileysAndEmotion: 'Smileys & Emotie',
            peopleAndBody: 'Mensen & Lichaam',
            animalsAndNature: 'Dieren & Natuur',
            foodAndDrink: 'Eten & Drinken',
            travelAndPlaces: 'Reizen & Plaatsen',
            activities: 'Activiteiten',
            objects: 'Objecten',
            symbols: 'Symbolen',
            flags: 'Vlaggen',
        },
    },
    newRoomPage: {
        newRoom: 'Nieuwe kamer',
        groupName: 'Groepsnaam',
        roomName: 'Kamernamen',
        visibility: 'Zichtbaarheid',
        restrictedDescription: 'Mensen in uw werkruimte kunnen deze kamer vinden',
        privateDescription: 'Mensen die voor deze ruimte zijn uitgenodigd, kunnen deze vinden.',
        publicDescription: 'Iedereen kan deze kamer vinden',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Iedereen kan deze kamer vinden',
        createRoom: 'Kamer aanmaken',
        roomAlreadyExistsError: 'Een kamer met deze naam bestaat al.',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} is een standaardkamer in alle werkruimtes. Kies alstublieft een andere naam.`,
        roomNameInvalidError: 'Kamernamen mogen alleen kleine letters, cijfers en koppeltekens bevatten.',
        pleaseEnterRoomName: 'Voer een kamernaam in alstublieft',
        pleaseSelectWorkspace: 'Selecteer een werkruimte alstublieft',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor} hernoemd naar "${newName}" (voorheen "${oldName}")` : `${actor}heeft deze ruimte hernoemd naar "${newName}" (voorheen "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Kamer hernoemd naar ${newName}`,
        social: 'sociaal',
        selectAWorkspace: 'Selecteer een werkruimte',
        growlMessageOnRenameError: 'Kan de werkruimte niet hernoemen. Controleer uw verbinding en probeer het opnieuw.',
        visibilityOptions: {
            restricted: 'Werkruimte', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privé',
            public: 'Openbaar',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Openbare Aankondiging',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Indienen en Sluiten',
        submitAndApprove: 'Indienen en Goedkeuren',
        advanced: 'ADVANCED',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `heeft ${approverName} (${approverEmail}) toegevoegd als goedkeurder voor het ${field} "${name}"`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `heeft ${approverName} (${approverEmail}) verwijderd als goedkeurder voor het veld ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `heeft de goedkeurder voor het ${field} "${name}" gewijzigd naar ${formatApprover(newApproverName, newApproverEmail)} (voorheen ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `heeft de categorie "${categoryName}" toegevoegd`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `heeft de categorie "${categoryName}" verwijderd`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'disabled' : 'ingeschakeld'} de categorie "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `heeft de payrollcode "${newValue}" toegevoegd aan de categorie "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `heeft de payrollcode "${oldValue}" uit de categorie "${categoryName}" verwijderd`;
            }
            return `heeft de payrollcode van de categorie "${categoryName}" gewijzigd naar "${newValue}" (voorheen "${oldValue}")`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `heeft de GL-code "${newValue}" toegevoegd aan de categorie "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `heeft de GL-code "${oldValue}" verwijderd uit de categorie "${categoryName}"`;
            }
            return `heeft de GL-code van de categorie “${categoryName}” gewijzigd naar “${newValue}” (voorheen “${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `heeft de beschrijving van de categorie "${categoryName}" gewijzigd naar ${!oldValue ? 'verplicht' : 'niet vereist'} (voorheen ${!oldValue ? 'niet vereist' : 'verplicht'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `heeft een maximum bedrag van ${newAmount} toegevoegd aan de categorie "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `heeft het maximale bedrag van ${oldAmount} uit de categorie "${categoryName}" verwijderd`;
            }
            return `heeft het maximale bedrag van de categorie "${categoryName}" gewijzigd naar ${newAmount} (voorheen ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `heeft een limiettype van ${newValue} toegevoegd aan de categorie "${categoryName}"`;
            }
            return `heeft het limiettype van de categorie "${categoryName}" gewijzigd naar ${newValue} (voorheen ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `heeft de categorie "${categoryName}" bijgewerkt door Bonnen te wijzigen naar ${newValue}`;
            }
            return `heeft de categorie "${categoryName}" gewijzigd naar ${newValue} (voorheen ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `heeft de categorie "${oldName}" hernoemd naar "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `heeft de beschrijvingshint "${oldValue}" uit de categorie "${categoryName}" verwijderd`;
            }
            return !oldValue
                ? `heeft de beschrijvingshint "${newValue}" toegevoegd aan de categorie "${categoryName}"`
                : `heeft de beschrijvingshint van de categorie "${categoryName}" gewijzigd naar “${newValue}” (voorheen “${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `heeft de taglijstnaam gewijzigd naar "${newName}" (voorheen "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `heeft de tag "${tagName}" toegevoegd aan de lijst "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `heeft de taglijst "${tagListName}" bijgewerkt door de tag "${oldName}" te wijzigen in "${newName}"`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'ingeschakeld' : 'disabled'} het label "${tagName}" op de lijst "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `heeft de tag "${tagName}" verwijderd uit de lijst "${tagListName}"`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `verwijderd "${count}" tags uit de lijst "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `heeft het label "${tagName}" op de lijst "${tagListName}" bijgewerkt door ${updatedField} te wijzigen in "${newValue}" (voorheen "${oldValue}")`;
            }
            return `heeft het label "${tagName}" op de lijst "${tagListName}" bijgewerkt door een ${updatedField} van "${newValue}" toe te voegen`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `heeft de ${customUnitName} ${updatedField} gewijzigd naar "${newValue}" (voorheen "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'ingeschakeld' : 'disabled'} belastingtracking op afstandstarieven`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `heeft een nieuw "${customUnitName}" tarief "${rateName}" toegevoegd`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `heeft het tarief van de ${customUnitName} ${updatedField} "${customUnitRateName}" gewijzigd naar "${newValue}" (voorheen "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `heeft het belastingtarief op het afstandstarief "${customUnitRateName}" gewijzigd naar "${newValue} (${newTaxPercentage})" (voorheen "${oldValue} (${oldTaxPercentage})")`;
            }
            return `heeft het belastingtarief "${newValue} (${newTaxPercentage})" toegevoegd aan het afstandstarief "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `heeft het belastingterugvorderbare deel van het afstandstarief "${customUnitRateName}" gewijzigd naar "${newValue}" (voorheen "${oldValue}")`;
            }
            return `heeft een terugvorderbaar belastinggedeelte van "${newValue}" toegevoegd aan het afstandstarief "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `verwijderde de "${customUnitName}" tarief "${rateName}"`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `toegevoegd ${fieldType} Rapportveld "${fieldName}"`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `stel de standaardwaarde van het rapportveld "${fieldName}" in op "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `heeft de optie "${optionName}" toegevoegd aan het rapportveld "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `heeft de optie "${optionName}" verwijderd uit het rapportveld "${fieldName}"`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'ingeschakeld' : 'disabled'} de optie "${optionName}" voor het rapportveld "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'ingeschakeld' : 'disabled'} alle opties voor het rapportveld "${fieldName}"`;
            }
            return `${allEnabled ? 'ingeschakeld' : 'disabled'} de optie "${optionName}" voor het rapportveld "${fieldName}", waardoor alle opties ${allEnabled ? 'ingeschakeld' : 'disabled'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `verwijderd ${fieldType} Rapportveld "${fieldName}"`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `bijgewerkt "Voorkom zelfgoedkeuring" naar "${newValue === 'true' ? 'Ingeschakeld' : 'Uitgeschakeld'}" (voorheen "${oldValue === 'true' ? 'Ingeschakeld' : 'Uitgeschakeld'}")`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `heeft het maximale vereiste bonbedrag gewijzigd naar ${newValue} (voorheen ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `heeft het maximale uitgavenbedrag voor overtredingen gewijzigd naar ${newValue} (voorheen ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `bijgewerkt "Maximale leeftijd van uitgaven (dagen)" naar "${newValue}" (voorheen "${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `stel de indieningsdatum van het maandelijkse rapport in op "${newValue}"`;
            }
            return `heeft de indieningsdatum van het maandelijkse rapport bijgewerkt naar "${newValue}" (voorheen "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `bijgewerkt "Onkosten doorberekenen aan klanten" naar "${newValue}" (voorheen "${oldValue}")`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `bijgewerkt "Contante uitgave standaard" naar "${newValue}" (voorheen "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `omgezet "Standaardrapporttitels afdwingen" ${value ? 'op' : 'uit'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `heeft de naam van deze werkruimte bijgewerkt naar "${newName}" (voorheen "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `stel de beschrijving van deze werkruimte in op "${newDescription}"`
                : `heeft de beschrijving van deze werkruimte bijgewerkt naar "${newDescription}" (voorheen "${oldDescription}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('en');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `heeft je verwijderd uit de goedkeuringsworkflow en onkostenchat van ${joinedNames}. Eerder ingediende rapporten blijven beschikbaar voor goedkeuring in je Inbox.`,
                other: `heeft je verwijderd uit de goedkeuringsworkflows en onkostenchats van ${joinedNames}. Eerder ingediende rapporten blijven beschikbaar voor goedkeuring in je Inbox.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `heeft uw rol in ${policyName} bijgewerkt van ${oldRole} naar gebruiker. U bent verwijderd uit alle indiener-uitgavenchats, behalve uw eigen.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `de standaardvaluta bijgewerkt naar ${newCurrency} (voorheen ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `heeft de frequentie van automatisch rapporteren bijgewerkt naar "${newFrequency}" (voorheen "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `heeft de goedkeuringsmodus bijgewerkt naar "${newValue}" (voorheen "${oldValue}")`,
        upgradedWorkspace: 'heeft deze werkruimte geüpgraded naar het Control-plan',
        forcedCorporateUpgrade: `Deze werkruimte is geüpgraded naar het Control-abonnement. Klik <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">hier</a> voor meer informatie.`,
        downgradedWorkspace: 'heeft deze werkruimte gedowngraded naar het Collect-plan',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `heeft het percentage van rapporten dat willekeurig wordt doorgestuurd voor handmatige goedkeuring gewijzigd naar ${Math.round(newAuditRate * 100)}% (voorheen ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `heeft de handmatige goedkeuringslimiet voor alle uitgaven gewijzigd naar ${newLimit} (voorheen ${oldLimit})`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} terugbetalingen voor deze werkruimte`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `heeft de belasting "${taxName}" toegevoegd`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `heeft de belasting "${taxName}" verwijderd`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `heeft de belasting "${oldValue}" hernoemd naar "${newValue}"`;
                }
                case 'code': {
                    return `heeft de belastingcode voor "${taxName}" gewijzigd van "${oldValue}" naar "${newValue}"`;
                }
                case 'rate': {
                    return `heeft het belastingtarief voor "${taxName}" gewijzigd van "${oldValue}" naar "${newValue}"`;
                }
                case 'enabled': {
                    return `${oldValue ? `heeft de belasting "${taxName}" uitgeschakeld` : `heeft de belasting "${taxName}" ingeschakeld`}`;
                }
                default: {
                    return '';
                }
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} bijhouden van aanwezigen`,
    },
    roomMembersPage: {
        memberNotFound: 'Lid niet gevonden.',
        useInviteButton: 'Om een nieuw lid uit te nodigen voor de chat, gebruik de uitnodigingsknop hierboven.',
        notAuthorized: `Je hebt geen toegang tot deze pagina. Als je probeert deze kamer te betreden, vraag dan een kamerlid om je toe te voegen. Iets anders? Neem contact op met ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Het lijkt erop dat deze kamer is gearchiveerd. Voor vragen kun je contact opnemen met ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Weet je zeker dat je ${memberName} uit de kamer wilt verwijderen?`,
            other: 'Weet je zeker dat je de geselecteerde leden uit de kamer wilt verwijderen?',
        }),
        error: {
            genericAdd: 'Er was een probleem bij het toevoegen van dit kamerlid.',
        },
    },
    newTaskPage: {
        assignTask: 'Taak toewijzen',
        assignMe: 'Aan mij toewijzen',
        confirmTask: 'Taak bevestigen',
        confirmError: 'Voer een titel in en selecteer een deelbestemming',
        descriptionOptional: 'Beschrijving (optioneel)',
        pleaseEnterTaskName: 'Voer een titel in alstublieft',
        pleaseEnterTaskDestination: 'Selecteer waar u deze taak wilt delen',
    },
    task: {
        task: 'Taak',
        title: 'Titel',
        description: 'Beschrijving',
        assignee: 'Toegewezene',
        completed: 'Voltooid',
        action: 'Voltooid',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `taak voor ${title}`,
            completed: 'gemarkeerd als voltooid',
            canceled: 'verwijderde taak',
            reopened: 'gemarkeerd als onvolledig',
            error: 'Je hebt geen toestemming om de gevraagde actie uit te voeren.',
        },
        markAsComplete: 'Markeren als voltooid',
        markAsIncomplete: 'Markeren als onvolledig',
        assigneeError: 'Er is een fout opgetreden bij het toewijzen van deze taak. Probeer een andere toegewezene.',
        genericCreateTaskFailureMessage: 'Er is een fout opgetreden bij het maken van deze taak. Probeer het later opnieuw.',
        deleteTask: 'Taak verwijderen',
        deleteConfirmation: 'Weet je zeker dat je deze taak wilt verwijderen?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${monthName} ${year} afschrift`,
    },
    keyboardShortcutsPage: {
        title: 'Toetsenbord sneltoetsen',
        subtitle: 'Bespaar tijd met deze handige sneltoetsen:',
        shortcuts: {
            openShortcutDialog: 'Opent het sneltoetsen dialoogvenster',
            markAllMessagesAsRead: 'Markeer alle berichten als gelezen',
            escape: 'Dialogen ontsnappen',
            search: 'Zoekdialoog openen',
            newChat: 'Nieuw chatscherm',
            copy: 'Opmerking kopiëren',
            openDebug: 'Open het voorkeurendialoogvenster voor testen.',
        },
    },
    guides: {
        screenShare: 'Scherm delen',
        screenShareRequest: 'Expensify nodigt je uit voor een schermdeling',
    },
    search: {
        resultsAreLimited: 'Zoekresultaten zijn beperkt.',
        viewResults: 'Resultaten bekijken',
        resetFilters: 'Filters resetten',
        searchResults: {
            emptyResults: {
                title: 'Niets om te laten zien',
                subtitle: `Probeer je zoekcriteria aan te passen of iets te maken met de + knop.`,
            },
            emptyExpenseResults: {
                title: 'Je hebt nog geen uitgaven gemaakt.',
                subtitle: 'Maak een uitgave aan of maak een proefrit met Expensify om meer te leren.',
                subtitleWithOnlyCreateButton: 'Gebruik de groene knop hieronder om een uitgave te maken.',
            },
            emptyReportResults: {
                title: 'Je hebt nog geen rapporten aangemaakt.',
                subtitle: 'Maak een rapport of neem een proefrit met Expensify om meer te leren.',
                subtitleWithOnlyCreateButton: 'Gebruik de groene knop hieronder om een rapport te maken.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Je hebt nog geen
                    facturen aangemaakt
                `),
                subtitle: 'Verstuur een factuur of maak een proefrit met Expensify om meer te leren.',
                subtitleWithOnlyCreateButton: 'Gebruik de groene knop hieronder om een factuur te verzenden.',
            },
            emptyTripResults: {
                title: 'Geen reizen om weer te geven',
                subtitle: 'Begin door je eerste reis hieronder te boeken.',
                buttonText: 'Boek een reis',
            },
            emptySubmitResults: {
                title: 'Geen uitgaven om in te dienen',
                subtitle: 'Je bent helemaal klaar. Maak een ereronde!',
                buttonText: 'Rapport maken',
            },
            emptyApproveResults: {
                title: 'Geen uitgaven om goed te keuren',
                subtitle: 'Nul uitgaven. Maximale ontspanning. Goed gedaan!',
            },
            emptyPayResults: {
                title: 'Geen uitgaven om te betalen',
                subtitle: 'Gefeliciteerd! Je bent over de finishlijn gegaan.',
            },
            emptyExportResults: {
                title: 'Geen uitgaven om te exporteren',
                subtitle: 'Tijd om het rustig aan te doen, goed werk.',
            },
            emptyStatementsResults: {
                title: 'Geen uitgaven om weer te geven',
                subtitle: 'Geen resultaten. Probeer uw filters aan te passen.',
            },
            emptyUnapprovedResults: {
                title: 'Geen uitgaven om goed te keuren',
                subtitle: 'Nul uitgaven. Maximale ontspanning. Goed gedaan!',
            },
        },
        statements: 'Verklaringen',
        unapprovedCash: 'Niet goedgekeurd contant geld',
        unapprovedCard: 'Niet-goedgekeurde kaart',
        reconciliation: 'Afstemming',
        saveSearch: 'Zoekopdracht opslaan',
        deleteSavedSearch: 'Verwijder opgeslagen zoekopdracht',
        deleteSavedSearchConfirm: 'Weet je zeker dat je deze zoekopdracht wilt verwijderen?',
        searchName: 'Naam zoeken',
        savedSearchesMenuItemTitle: 'Opgeslagen',
        groupedExpenses: 'gegroepeerde uitgaven',
        bulkActions: {
            approve: 'Goedkeuren',
            pay: 'Betalen',
            delete: 'Verwijderen',
            hold: 'Vasthouden',
            unhold: 'Verwijder blokkering',
            reject: 'Afwijzen',
            noOptionsAvailable: 'Geen opties beschikbaar voor de geselecteerde groep uitgaven.',
        },
        filtersHeader: 'Filters',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Voor ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `Na ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `On ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Nooit',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Laatste maand',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Deze maand',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Laatste verklaring',
                },
            },
            status: 'Status',
            keyword: 'Trefwoord',
            keywords: 'Trefwoorden',
            currency: 'Valuta',
            completed: 'Voltooid',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Minder dan ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Groter dan ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Tussen ${greaterThan} en ${lessThan}`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Gelijk aan ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Individuele kaarten',
                closedCards: 'Gesloten kaarten',
                cardFeeds: 'Kaartfeeds',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `All CSV Imported Cards${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: 'Huidig',
            past: 'Verleden',
            submitted: 'Ingediend',
            approved: 'Goedgekeurd',
            paid: 'Betaald',
            exported: 'Geëxporteerd',
            posted: 'Geplaatste',
            withdrawn: 'Teruggetrokken',
            billable: 'Factureerbaar',
            reimbursable: 'Vergoedbaar',
            purchaseCurrency: 'Aankoopvaluta',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'Van',
                [CONST.SEARCH.GROUP_BY.CARD]: 'Kaart',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'Opname-ID',
            },
            feed: 'Feed',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: 'Terugbetaling',
            },
            is: 'Is',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Indienen',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Goedkeuren',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Betalen',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Exporteren',
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} is ${value}`,
        },
        has: 'Heeft',
        groupBy: 'Groep per',
        moneyRequestReport: {
            emptyStateTitle: 'Dit rapport heeft geen uitgaven.',
        },
        noCategory: 'Geen categorie',
        noTag: 'Geen tag',
        expenseType: 'Uitgavetype',
        withdrawalType: 'Opnametype',
        recentSearches: 'Recente zoekopdrachten',
        recentChats: 'Recente chats',
        searchIn: 'Zoeken in',
        searchPlaceholder: 'Zoek naar iets',
        suggestions: 'Suggesties',
        exportSearchResults: {
            title: 'Exporteer maken',
            description: 'Wow, dat zijn veel items! We zullen ze bundelen en Concierge stuurt je binnenkort een bestand.',
        },
        exportAll: {
            selectAllMatchingItems: 'Selecteer alle overeenkomende items',
            allMatchingItemsSelected: 'Alle overeenkomende items geselecteerd',
        },
    },
    genericErrorPage: {
        title: 'Oeps, er is iets misgegaan!',
        body: {
            helpTextMobile: 'Sluit en heropen de app, of schakel over naar',
            helpTextWeb: 'web.',
            helpTextConcierge: 'Als het probleem aanhoudt, neem contact op met',
        },
        refresh: 'Vernieuwen',
    },
    fileDownload: {
        success: {
            title: 'Gedownload!',
            message: 'Bijlage succesvol gedownload!',
            qrMessage:
                "Controleer je foto's of downloads-map voor een kopie van je QR-code. Protip: Voeg het toe aan een presentatie zodat je publiek het kan scannen en direct met je kan verbinden.",
        },
        generalError: {
            title: 'Bijlagefout',
            message: 'Bijlage kan niet worden gedownload',
        },
        permissionError: {
            title: 'Opslagtoegang',
            message: 'Expensify kan bijlagen niet opslaan zonder opslagtoegang. Tik op instellingen om de machtigingen bij te werken.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Nieuwe Expensify',
        about: 'Over New Expensify',
        update: 'Update New Expensify',
        checkForUpdates: 'Controleren op updates',
        toggleDevTools: 'Ontwikkelaarstools wisselen',
        viewShortcuts: 'Toetsenbord sneltoetsen bekijken',
        services: 'Diensten',
        hide: 'Verberg New Expensify',
        hideOthers: 'Anderen verbergen',
        showAll: 'Alles weergeven',
        quit: 'Stop New Expensify',
        fileMenu: 'Bestand',
        closeWindow: 'Venster sluiten',
        editMenu: 'Bewerken',
        undo: 'Ongedaan maken',
        redo: 'Opnieuw doen',
        cut: 'Knippen',
        copy: 'Kopiëren',
        paste: 'Plakken',
        pasteAndMatchStyle: 'Plakken en stijl aanpassen',
        pasteAsPlainText: 'Plakken als platte tekst',
        delete: 'Verwijderen',
        selectAll: 'Alles selecteren',
        speechSubmenu: 'Toespraak',
        startSpeaking: 'Begin met spreken',
        stopSpeaking: 'Stop met praten',
        viewMenu: 'Bekijken',
        reload: 'Herladen',
        forceReload: 'Herlaad geforceerd',
        resetZoom: 'Werkelijke grootte',
        zoomIn: 'Inzoomen',
        zoomOut: 'Uitzoomen',
        togglefullscreen: 'Volledig scherm in-/uitschakelen',
        historyMenu: 'Geschiedenis',
        back: 'Terug',
        forward: 'Doorsturen',
        windowMenu: 'Venster',
        minimize: 'Minimaliseren',
        zoom: 'Zoom',
        front: 'Alles naar voren brengen',
        helpMenu: 'Help',
        learnMore: 'Meer informatie',
        documentation: 'Documentatie',
        communityDiscussions: 'Community Discussies',
        searchIssues: 'Zoekproblemen',
    },
    historyMenu: {
        forward: 'Doorsturen',
        back: 'Terug',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Update beschikbaar',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `De nieuwe versie zal binnenkort beschikbaar zijn.${!isSilentUpdating ? 'We laten het je weten wanneer we klaar zijn om bij te werken.' : ''}`,
            soundsGood: 'Klinkt goed',
        },
        notAvailable: {
            title: 'Update niet beschikbaar',
            message: 'Er is momenteel geen update beschikbaar. Kom later terug om het opnieuw te proberen!',
            okay: 'Okay',
        },
        error: {
            title: 'Updatecontrole mislukt',
            message: 'We konden niet controleren op een update. Probeer het over een tijdje opnieuw.',
        },
    },
    reportLayout: {
        reportLayout: 'Rapportindeling',
        groupByLabel: 'Groeperen op:',
        selectGroupByOption: 'Selecteer hoe rapportkosten worden gegroepeerd',
        uncategorized: 'Niet gecategoriseerd',
        noTag: 'Geen tag',
        selectGroup: ({groupName}: {groupName: string}) => `Selecteer alle uitgaven in ${groupName}`,
        groupBy: {
            category: 'Categorie',
            tag: 'Tag',
        },
    },
    report: {
        newReport: {
            createReport: 'Rapport maken',
            chooseWorkspace: 'Kies een werkruimte voor dit rapport.',
            emptyReportConfirmationTitle: 'Je hebt al een leeg rapport',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Weet je zeker dat je nog een rapport wilt maken in ${workspaceName}? Je kunt je lege rapporten vinden onder`,
            emptyReportConfirmationPromptLink: 'Rapporten',
            genericWorkspaceName: 'deze werkruimte',
        },
        genericCreateReportFailureMessage: 'Onverwachte fout bij het maken van deze chat. Probeer het later opnieuw.',
        genericAddCommentFailureMessage: 'Onverwachte fout bij het plaatsen van de opmerking. Probeer het later opnieuw.',
        genericUpdateReportFieldFailureMessage: 'Onverwachte fout bij het bijwerken van het veld. Probeer het later opnieuw.',
        genericUpdateReportNameEditFailureMessage: 'Onverwachte fout bij het hernoemen van het rapport. Probeer het later opnieuw.',
        noActivityYet: 'Nog geen activiteit',
        connectionSettings: 'Verbindingsinstellingen',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `heeft ${fieldName} gewijzigd naar "${newValue}" (voorheen "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `heeft ${fieldName} ingesteld op "${newValue}"`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) => {
                    if (!toPolicyName) {
                        return `Werkruimte gewijzigd${fromPolicyName ? ` (voorheen ${fromPolicyName})` : ''}`;
                    }
                    return `Werkruimte gewijzigd naar ${toPolicyName}${fromPolicyName ? ` (voorheen ${fromPolicyName})` : ''}`;
                },
                changeType: ({oldType, newType}: ChangeTypeParams) => `veranderde type van ${oldType} naar ${newType}`,
                exportedToCSV: `geëxporteerd naar CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => {
                        // The label will always be in English, so we need to translate it
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `geëxporteerd naar ${translatedLabel}`;
                    },
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `geëxporteerd naar ${label} via`,
                    automaticActionTwo: 'boekhoudingsinstellingen',
                    manual: ({label}: ExportedToIntegrationParams) => `heeft dit rapport gemarkeerd als handmatig geëxporteerd naar ${label}.`,
                    automaticActionThree: 'en met succes een record aangemaakt voor',
                    reimburseableLink: 'uit eigen zak gemaakte kosten',
                    nonReimbursableLink: 'bedrijfskosten met bedrijfskaart',
                    pending: ({label}: ExportedToIntegrationParams) => `begonnen met het exporteren van dit rapport naar ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `mislukt om dit rapport naar ${label} te exporteren ("${errorMessage}${linkText ? ` <a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `heeft een bon toegevoegd`,
                managerDetachReceipt: `een bon verwijderd`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `elders betaald ${currency}${amount}`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `betaalde ${currency}${amount} via integratie`,
                outdatedBankAccount: `kon de betaling niet verwerken vanwege een probleem met de bankrekening van de betaler`,
                reimbursementACHBounce: `kon de betaling niet verwerken vanwege een probleem met de bankrekening`,
                reimbursementACHCancelled: `de betaling geannuleerd`,
                reimbursementAccountChanged: `kon de betaling niet verwerken, omdat de betaler van bankrekening is veranderd`,
                reimbursementDelayed: `heeft de betaling verwerkt, maar deze is met 1-2 extra werkdagen vertraagd`,
                selectedForRandomAudit: `willekeurig geselecteerd voor beoordeling`,
                selectedForRandomAuditMarkdown: `[Willekeurig geselecteerd](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) voor beoordeling`,
                share: ({to}: ShareParams) => `uitgenodigde lid ${to}`,
                unshare: ({to}: UnshareParams) => `verwijderd lid ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `betaald ${currency}${amount}`,
                takeControl: `nam de controle over`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `Er is een probleem opgetreden bij het synchroniseren met ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Los het probleem op in de <a href="${workspaceAccountingLink}">werkruimte-instellingen</a>.`,
                addEmployee: ({email, role}: AddEmployeeParams) => `toegevoegd ${email} als ${role === 'member' ? 'a' : 'een'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `heeft de rol van ${email} bijgewerkt naar ${newRole} (voorheen ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `verwijderd aangepast veld 1 van ${email} (voorheen "${previousValue}")`;
                    }
                    return !previousValue
                        ? `"${newValue}" toegevoegd aan het aangepaste veld 1 van ${email}`
                        : `heeft het aangepaste veld 1 van ${email} gewijzigd naar "${newValue}" (voorheen "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `verwijderd aangepast veld 2 van ${email} (voorheen "${previousValue}")`;
                    }
                    return !previousValue
                        ? `toegevoegd "${newValue}" aan ${email}’s aangepaste veld 2`
                        : `heeft het aangepaste veld 2 van ${email} gewijzigd naar "${newValue}" (voorheen "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} heeft de werkruimte verlaten`,
                removeMember: ({email, role}: AddEmployeeParams) => `verwijderd ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `verwijderde verbinding met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `verbonden met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'heeft de chat verlaten',
            },
            error: {
                invalidCredentials: 'Ongeldige inloggegevens, controleer de configuratie van uw verbinding.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} voor ${dayCount} ${dayCount === 1 ? 'dag' : 'dagen'} tot ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} van ${timePeriod} op ${date}`,
    },
    footer: {
        features: 'Functies',
        expenseManagement: 'Uitgavenbeheer',
        spendManagement: 'Uitgavenbeheer',
        expenseReports: "Onkostennota's",
        companyCreditCard: 'Bedrijfskredietkaart',
        receiptScanningApp: 'Bonnen Scan App',
        billPay: 'Bill Pay',
        invoicing: 'Facturering',
        CPACard: 'CPA-kaart',
        payroll: 'Loonadministratie',
        travel: 'Reis',
        resources: 'Resources',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Persmap',
        support: 'Ondersteuning',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Servicevoorwaarden',
        privacy: 'Privacy',
        learnMore: 'Meer informatie',
        aboutExpensify: 'Over Expensify',
        blog: 'Blog',
        jobs: 'Banen',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Investor Relations',
        getStarted: 'Aan de slag',
        createAccount: 'Maak een nieuw account aan',
        logIn: 'Inloggen',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Navigeer terug naar de chatlijst',
        chatWelcomeMessage: 'Chat welkomstbericht',
        navigatesToChat: 'Navigeert naar een chat',
        newMessageLineIndicator: 'Nieuwe berichtregelindicator',
        chatMessage: 'Chatbericht',
        lastChatMessagePreview: 'Laatste chatbericht voorbeeldweergave',
        workspaceName: 'Werkruimte naam',
        chatUserDisplayNames: 'Chatlid weergavenamen',
        scrollToNewestMessages: 'Scroll naar nieuwste berichten',
        preStyledText: 'Vooraf opgemaakte tekst',
        viewAttachment: 'Bijlage bekijken',
    },
    parentReportAction: {
        deletedReport: 'Verwijderd rapport',
        deletedMessage: 'Verwijderd bericht',
        deletedExpense: 'Verwijderde uitgave',
        reversedTransaction: 'Omgekeerde transactie',
        deletedTask: 'Verwijderde taak',
        hiddenMessage: 'Verborgen bericht',
    },
    threads: {
        thread: 'Discussie',
        replies: 'Antwoorden',
        reply: 'Antwoord',
        from: 'Van',
        in: 'in',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `Van ${reportName}${workspaceName ? `in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: 'URL kopiëren',
        copied: 'Gekopieerd!',
    },
    moderation: {
        flagDescription: 'Alle gemarkeerde berichten worden naar een moderator gestuurd voor beoordeling.',
        chooseAReason: 'Kies hieronder een reden om te markeren:',
        spam: 'Spam',
        spamDescription: 'Ongevraagde off-topic promotie',
        inconsiderate: 'Onattentend',
        inconsiderateDescription: 'Beledigende of respectloze bewoordingen, met twijfelachtige bedoelingen',
        intimidation: 'Intimidatie',
        intimidationDescription: 'Het agressief nastreven van een agenda ondanks geldige bezwaren.',
        bullying: 'Pesten',
        bullyingDescription: 'Een individu targeten om gehoorzaamheid te verkrijgen.',
        harassment: 'Intimidatie',
        harassmentDescription: 'Racistisch, misogynistisch of ander breed discriminerend gedrag',
        assault: 'Aanval',
        assaultDescription: 'Specifiek gerichte emotionele aanval met de intentie om schade aan te richten',
        flaggedContent: 'Dit bericht is gemarkeerd als in strijd met onze gemeenschapsregels en de inhoud is verborgen.',
        hideMessage: 'Bericht verbergen',
        revealMessage: 'Bericht onthullen',
        levelOneResult: 'Verstuurt een anonieme waarschuwing en het bericht wordt ter beoordeling gerapporteerd.',
        levelTwoResult: 'Bericht verborgen voor kanaal, plus anonieme waarschuwing en bericht is gerapporteerd voor beoordeling.',
        levelThreeResult: 'Bericht verwijderd uit kanaal plus anonieme waarschuwing en bericht is gerapporteerd voor beoordeling.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Uitnodigen om onkosten in te dienen',
        inviteToChat: 'Alleen uitnodigen om te chatten',
        nothing: 'Niets doen',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Accepteren',
        decline: 'Afwijzen',
    },
    actionableMentionTrackExpense: {
        submit: 'Verstuur het naar iemand toe',
        categorize: 'Categoriseer het',
        share: 'Deel het met mijn accountant',
        nothing: 'Niets voor nu',
    },
    teachersUnitePage: {
        teachersUnite: 'Leraren Verenigd',
        joinExpensifyOrg:
            'Doe mee met Expensify.org om onrecht wereldwijd te elimineren. De huidige "Teachers Unite" campagne ondersteunt docenten overal door de kosten van essentiële schoolbenodigdheden te delen.',
        iKnowATeacher: 'Ik ken een leraar.',
        iAmATeacher: 'Ik ben een leraar.',
        getInTouch: 'Uitstekend! Deel alstublieft hun informatie zodat we contact met hen kunnen opnemen.',
        introSchoolPrincipal: 'Introductie aan je schooldirecteur',
        schoolPrincipalVerifyExpense:
            'Expensify.org deelt de kosten van essentiële schoolbenodigdheden zodat studenten uit huishoudens met een laag inkomen een betere leerervaring kunnen hebben. Uw directeur zal worden gevraagd om uw uitgaven te verifiëren.',
        principalFirstName: 'Voornaam van de directeur',
        principalLastName: 'Achternaam van de directeur',
        principalWorkEmail: 'Primaire werk e-mail',
        updateYourEmail: 'Werk uw e-mailadres bij',
        updateEmail: 'E-mailadres bijwerken',
        schoolMailAsDefault: ({contactMethodsRoute}: ContactMethodsRouteParams) =>
            `Voordat je verder gaat, zorg ervoor dat je je school e-mailadres instelt als je standaard contactmethode. Dit kun je doen in Instellingen > Profiel > <a href="${contactMethodsRoute}">Contactmethoden</a>.`,
        error: {
            enterPhoneEmail: 'Voer een geldig e-mailadres of telefoonnummer in',
            enterEmail: 'Voer een e-mailadres in',
            enterValidEmail: 'Voer een geldig e-mailadres in',
            tryDifferentEmail: 'Probeer een ander e-mailadres alstublieft.',
        },
    },
    cardTransactions: {
        notActivated: 'Niet geactiveerd',
        outOfPocket: 'Uit eigen zak uitgaven',
        companySpend: 'Bedrijfskosten',
    },
    distance: {
        addStop: 'Stop toevoegen',
        deleteWaypoint: 'Verwijder waypoint',
        deleteWaypointConfirmation: 'Weet je zeker dat je dit waypoint wilt verwijderen?',
        address: 'Adres',
        waypointDescription: {
            start: 'Starten',
            stop: 'Stop',
        },
        mapPending: {
            title: 'Kaart in behandeling',
            subtitle: 'De kaart wordt gegenereerd wanneer je weer online bent.',
            onlineSubtitle: 'Een ogenblik terwijl we de kaart instellen.',
            errorTitle: 'Kaartfout',
            errorSubtitle: 'Er is een fout opgetreden bij het laden van de kaart. Probeer het alstublieft opnieuw.',
        },
        error: {
            selectSuggestedAddress: 'Selecteer een voorgesteld adres of gebruik de huidige locatie alstublieft',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Rapportkaart verloren of beschadigd',
        nextButtonLabel: 'Volgende',
        reasonTitle: 'Waarom heb je een nieuwe kaart nodig?',
        cardDamaged: 'Mijn kaart was beschadigd',
        cardLostOrStolen: 'Mijn kaart is verloren of gestolen',
        confirmAddressTitle: 'Bevestig alstublieft het postadres voor uw nieuwe kaart.',
        cardDamagedInfo: 'Uw nieuwe kaart zal binnen 2-3 werkdagen arriveren. Uw huidige kaart blijft werken totdat u uw nieuwe kaart activeert.',
        cardLostOrStolenInfo: 'Je huidige kaart wordt permanent gedeactiveerd zodra je bestelling is geplaatst. De meeste kaarten komen binnen een paar werkdagen aan.',
        address: 'Adres',
        deactivateCardButton: 'Deactiveer kaart',
        shipNewCardButton: 'Verzend nieuwe kaart',
        addressError: 'Adres is vereist',
        reasonError: 'Reden is vereist',
        successTitle: 'Uw nieuwe kaart is onderweg!',
        successDescription: 'U moet deze activeren zodra deze over een paar werkdagen aankomt. In de tussentijd kunt u een virtuele kaart gebruiken.',
    },
    eReceipt: {
        guaranteed: 'Gegarandeerd eReceipt',
        transactionDate: 'Transactiedatum',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Begin een chat, <success><strong>verwijs een vriend door</strong></success>.',
            header: 'Begin een chat, verwijs een vriend',
            body: 'Wil je dat je vrienden ook Expensify gebruiken? Begin gewoon een chat met hen en wij doen de rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Dien een uitgave in, <success><strong>verwijs je team</strong></success>.',
            header: 'Dien een uitgave in, verwijs uw team',
            body: 'Wil je dat je team ook Expensify gebruikt? Dien gewoon een onkostendeclaratie bij hen in en wij doen de rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Verwijs een vriend',
            body: 'Wil je dat je vrienden ook Expensify gebruiken? Chat, betaal of deel een uitgave met hen en wij regelen de rest. Of deel gewoon je uitnodigingslink!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Verwijs een vriend',
            header: 'Verwijs een vriend',
            body: 'Wil je dat je vrienden ook Expensify gebruiken? Chat, betaal of deel een uitgave met hen en wij regelen de rest. Of deel gewoon je uitnodigingslink!',
        },
        copyReferralLink: 'Kopieer uitnodigingslink',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chat met uw setup specialist in <a href="${href}">${adminReportName}</a> voor hulp`,
        default: `Bericht <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> voor hulp bij de installatie`,
    },
    violations: {
        allTagLevelsRequired: 'Alle tags vereist',
        autoReportedRejectedExpense: 'Deze uitgave is afgewezen.',
        billableExpense: 'Factureerbaar niet langer geldig',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Receipt required${formattedLimit ? `boven ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Categorie niet langer geldig',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Toegepaste ${surcharge}% conversietoeslag`,
        customUnitOutOfPolicy: 'Tarief niet geldig voor deze werkruimte',
        duplicatedTransaction: 'Dupliceren',
        fieldRequired: 'Rapportvelden zijn verplicht',
        futureDate: 'Toekomstige datum niet toegestaan',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Opgehoogd met ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Datum ouder dan ${maxAge} dagen`,
        missingCategory: 'Categorie ontbreekt',
        missingComment: 'Beschrijving vereist voor geselecteerde categorie',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Missing ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Bedrag verschilt van berekende afstand';
                case 'card':
                    return 'Bedrag groter dan kaarttransactie';
                default:
                    if (displayPercentVariance) {
                        return `Bedrag ${displayPercentVariance}% groter dan gescande bon`;
                    }
                    return 'Bedrag groter dan gescande bon';
            }
        },
        modifiedDate: 'Datum verschilt van gescande bon',
        nonExpensiworksExpense: 'Niet-Expensiworks uitgave',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Uitgave overschrijdt de automatische goedkeuringslimiet van ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Bedrag boven ${formattedLimit}/persoon categorielimiet`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Bedrag boven ${formattedLimit}/persoon limiet`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Bedrag boven ${formattedLimit}/ritlimiet`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Bedrag boven ${formattedLimit}/persoon limiet`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Bedrag boven de dagelijkse ${formattedLimit}/persoon categoriegrens`,
        receiptNotSmartScanned: 'Bon en uitgavendetails handmatig toegevoegd.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Bon vereist boven de categorielimiet van ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Bon vereist boven ${formattedLimit}`;
            }
            if (category) {
                return `Bon vereist bij overschrijding van categorielimiet`;
            }
            return 'Bon vereist';
        },
        prohibitedExpense: ({prohibitedExpenseTypes}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Verboden uitgave:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `alcohol`;
                    case 'gambling':
                        return `gokken`;
                    case 'tobacco':
                        return `tabak`;
                    case 'adultEntertainment':
                        return `volwassenen entertainment`;
                    case 'hotelIncidentals':
                        return `hotelbijzaken`;
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
        reviewRequired: 'Beoordeling vereist',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Kan bon niet automatisch koppelen vanwege verbroken bankverbinding.';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Bankverbinding verbroken. <a href="${companyCardPageURL}">Opnieuw verbinden om bon te koppelen</a>`
                    : 'Bankverbinding verbroken. Vraag een beheerder om opnieuw te verbinden om de bon te koppelen.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Vraag ${member} om het als contant te markeren of wacht 7 dagen en probeer het opnieuw.` : 'In afwachting van samenvoeging met kaarttransactie.';
            }
            return '';
        },
        brokenConnection530Error: 'Ontvangst in behandeling vanwege verbroken bankverbinding',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Bon in afwachting vanwege een verbroken bankverbinding. Los dit op in <a href="${workspaceCompanyCardRoute}">Bedrijfspassen</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Ontvangst in afwachting vanwege een verbroken bankverbinding. Vraag een werkruimtebeheerder om het op te lossen.',
        markAsCashToIgnore: 'Markeren als contant om te negeren en betaling aan te vragen.',
        smartscanFailed: ({canEdit = true}) => `Bonnetjes scannen mislukt.${canEdit ? 'Voer gegevens handmatig in.' : ''}`,
        receiptGeneratedWithAI: 'Potentieel AI-gegenereerd ontvangstbewijs',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Missing ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} niet langer geldig`,
        taxAmountChanged: 'Belastingbedrag is gewijzigd',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Belasting'} niet langer geldig`,
        taxRateChanged: 'Belastingtarief is gewijzigd',
        taxRequired: 'Ontbrekende belastingtarief',
        none: 'Geen',
        taxCodeToKeep: 'Kies welke belastingcode je wilt behouden',
        tagToKeep: 'Kies welke tag je wilt behouden',
        isTransactionReimbursable: 'Kies of de transactie vergoedbaar is',
        merchantToKeep: 'Kies welke handelaar je wilt behouden',
        descriptionToKeep: 'Kies welke beschrijving je wilt behouden.',
        categoryToKeep: 'Kies welke categorie je wilt behouden',
        isTransactionBillable: 'Kies of de transactie factureerbaar is',
        keepThisOne: 'Keep this one',
        confirmDetails: `Bevestig de details die je bewaart`,
        confirmDuplicatesInfo: `De duplicaten die je niet behoudt, worden bewaard zodat de indiener ze kan verwijderen.`,
        hold: 'Deze uitgave is in de wacht gezet',
        resolvedDuplicates: 'dubbel opgelost',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} is vereist`,
    },
    violationDismissal: {
        rter: {
            manual: 'heeft dit ontvangstbewijs als contant gemarkeerd',
        },
        duplicatedTransaction: {
            manual: 'dubbel opgelost',
        },
    },
    videoPlayer: {
        play: 'Afspelen',
        pause: 'Pauzeer',
        fullscreen: 'Volledig scherm',
        playbackSpeed: 'Afspeelsnelheid',
        expand: 'Uitbreiden',
        mute: 'Dempen',
        unmute: 'Dempen opheffen',
        normal: 'Normaal',
    },
    exitSurvey: {
        header: 'Voordat je gaat',
        reasonPage: {
            title: 'Vertel ons alstublieft waarom u vertrekt.',
            subtitle: 'Voordat u vertrekt, vertel ons alstublieft waarom u wilt overstappen naar Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ik heb een functie nodig die alleen beschikbaar is in Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Ik begrijp niet hoe ik New Expensify moet gebruiken.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Ik begrijp hoe ik New Expensify moet gebruiken, maar ik geef de voorkeur aan Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Welke functie heeft u nodig die niet beschikbaar is in New Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Wat probeer je te doen?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Waarom geef je de voorkeur aan Expensify Classic?',
        },
        responsePlaceholder: 'Je reactie',
        thankYou: 'Bedankt voor de feedback!',
        thankYouSubtitle: 'Uw reacties zullen ons helpen een beter product te bouwen om dingen gedaan te krijgen. Hartelijk dank!',
        goToExpensifyClassic: 'Overschakelen naar Expensify Classic',
        offlineTitle: 'Het lijkt erop dat je hier vastzit...',
        offline:
            'U lijkt offline te zijn. Helaas werkt Expensify Classic niet offline, maar New Expensify wel. Als u de voorkeur geeft aan het gebruik van Expensify Classic, probeer het dan opnieuw wanneer u een internetverbinding heeft.',
        quickTip: 'Snelle tip...',
        quickTipSubTitle: 'Je kunt direct naar Expensify Classic gaan door expensify.com te bezoeken. Voeg het toe aan je bladwijzers voor een gemakkelijke snelkoppeling!',
        bookACall: 'Boek een gesprek',
        bookACallTitle: 'Wilt u met een productmanager spreken?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Direct chatten over onkosten en rapporten',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Mogelijkheid om alles op mobiel te doen',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Reizen en uitgaven met de snelheid van chatten',
        },
        bookACallTextTop: 'Als u overschakelt naar Expensify Classic, mist u:',
        bookACallTextBottom: 'We zouden graag met u in gesprek gaan om te begrijpen waarom. U kunt een afspraak maken met een van onze senior productmanagers om uw behoeften te bespreken.',
        takeMeToExpensifyClassic: 'Breng me naar Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Er is een fout opgetreden bij het laden van meer berichten.',
        tryAgain: 'Probeer het opnieuw',
    },
    systemMessage: {
        mergedWithCashTransaction: 'een bon gekoppeld aan deze transactie',
    },
    subscription: {
        authenticatePaymentCard: 'Verifieer betaalkaart',
        mobileReducedFunctionalityMessage: 'U kunt geen wijzigingen aanbrengen in uw abonnement in de mobiele app.',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Proefperiode: ${numOfDays} ${numOfDays === 1 ? 'dag' : 'dagen'} over`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Je betalingsinformatie is verouderd',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `Werk uw betaalkaart bij voor ${date} om al uw favoriete functies te blijven gebruiken.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Uw betaling kon niet worden verwerkt.',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Uw ${date} betaling van ${purchaseAmountOwed} kon niet worden verwerkt. Voeg alstublieft een betaalkaart toe om het verschuldigde bedrag te vereffenen.`
                        : 'Voeg alstublieft een betaalkaart toe om het verschuldigde bedrag te vereffenen.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Je betalingsinformatie is verouderd',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `Uw betaling is te laat. Betaal uw factuur vóór ${date} om onderbreking van de service te voorkomen.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Je betalingsinformatie is verouderd',
                subtitle: 'Uw betaling is te laat. Gelieve uw factuur te betalen.',
            },
            billingDisputePending: {
                title: 'Uw kaart kon niet worden belast.',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `U betwistte de ${amountOwed} kosten op de kaart die eindigt op ${cardEnding}. Uw account wordt geblokkeerd totdat het geschil met uw bank is opgelost.`,
            },
            cardAuthenticationRequired: {
                title: 'Je betaalkaart is nog niet volledig geverifieerd.',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) => `Voltooi de verificatie om je betaalkaart met eindigend op ${cardEnding} te activeren.`,
            },
            insufficientFunds: {
                title: 'Uw kaart kon niet worden belast.',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `Uw betaalkaart werd geweigerd vanwege onvoldoende saldo. Probeer het opnieuw of voeg een nieuwe betaalkaart toe om uw openstaande saldo van ${amountOwed} te vereffenen.`,
            },
            cardExpired: {
                title: 'Uw kaart kon niet worden belast.',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `Uw betaalkaart is verlopen. Voeg een nieuwe betaalkaart toe om uw openstaande saldo van ${amountOwed} te vereffenen.`,
            },
            cardExpireSoon: {
                title: 'Je kaart verloopt binnenkort',
                subtitle:
                    'Je betaalkaart verloopt aan het einde van deze maand. Klik op het menu met de drie puntjes hieronder om deze bij te werken en al je favoriete functies te blijven gebruiken.',
            },
            retryBillingSuccess: {
                title: 'Succes!',
                subtitle: 'Uw kaart is succesvol belast.',
            },
            retryBillingError: {
                title: 'Uw kaart kon niet worden belast.',
                subtitle:
                    'Voordat u het opnieuw probeert, neem rechtstreeks contact op met uw bank om Expensify-kosten goed te keuren en eventuele blokkades te verwijderen. Probeer anders een andere betaalkaart toe te voegen.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `U betwistte de ${amountOwed} kosten op de kaart die eindigt op ${cardEnding}. Uw account wordt geblokkeerd totdat het geschil met uw bank is opgelost.`,
            preTrial: {
                title: 'Begin een gratis proefperiode',
                subtitleStart: 'Als een volgende stap,',
                subtitleLink: 'voltooi uw setupchecklist',
                subtitleEnd: 'zodat je team kan beginnen met declareren.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Proefversie: ${numOfDays} ${numOfDays === 1 ? 'dag' : 'dagen'} over!`,
                subtitle: 'Voeg een betaalkaart toe om al je favoriete functies te blijven gebruiken.',
            },
            trialEnded: {
                title: 'Je gratis proefperiode is afgelopen',
                subtitle: 'Voeg een betaalkaart toe om al je favoriete functies te blijven gebruiken.',
            },
            earlyDiscount: {
                claimOffer: 'Aanbieding claimen',
                subscriptionPageTitle: ({discountType}: EarlyDiscountTitleParams) =>
                    `<strong>${discountType}% korting op uw eerste jaar!</strong> Voeg gewoon een betaalkaart toe en start een jaarlijks abonnement.`,
                onboardingChatTitle: ({discountType}: EarlyDiscountTitleParams) => `Aanbieding voor beperkte tijd: ${discountType}% korting op uw eerste jaar!`,
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Claim binnen ${days > 0 ? `${days}d :` : ''}${hours}u : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Betaling',
            subtitle: 'Voeg een kaart toe om te betalen voor je Expensify-abonnement.',
            addCardButton: 'Betaalpas toevoegen',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Uw volgende betaaldatum is ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Kaart eindigend op ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Naam: ${name}, Vervaldatum: ${expiration}, Valuta: ${currency}`,
            changeCard: 'Betaalkaart wijzigen',
            changeCurrency: 'Betaalvaluta wijzigen',
            cardNotFound: 'Geen betaalkaart toegevoegd',
            retryPaymentButton: 'Betaling opnieuw proberen',
            authenticatePayment: 'Authenticeer betaling',
            requestRefund: 'Terugbetaling aanvragen',
            requestRefundModal: {
                full: 'Een terugbetaling krijgen is eenvoudig, verlaag gewoon uw account voordat uw volgende factuurdatum en u ontvangt een terugbetaling. <br /> <br /> Let op: Als je je account downgrade, worden je werkruimtes verwijderd. Deze actie kan niet ongedaan worden gemaakt, maar je kunt altijd een nieuwe werkruimte aanmaken als je van gedachten verandert.',
                confirm: 'Werkruimte(s) verwijderen en downgraden',
            },
            viewPaymentHistory: 'Bekijk betalingsgeschiedenis',
        },
        yourPlan: {
            title: 'Uw plan',
            exploreAllPlans: 'Verken alle plannen',
            customPricing: 'Aangepaste prijzen',
            asLowAs: ({price}: YourPlanPriceValueParams) => `vanaf ${price} per actief lid/maand`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} per lid/maand`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} per lid per maand`,
            perMemberMonth: 'per lid/maand',
            collect: {
                title: 'Verzamel',
                description: 'Het kleinzakelijke plan dat je uitgaven, reizen en chat biedt.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                benefit1: 'Bonnetjes scannen',
                benefit2: 'Vergoedingen',
                benefit3: 'Beheer van bedrijfskaarten',
                benefit4: 'Uitgaven- en reisgoedkeuringen',
                benefit5: 'Reisreservering en regels',
                benefit6: 'QuickBooks/Xero-integraties',
                benefit7: 'Chat over uitgaven, rapporten en kamers',
                benefit8: 'AI- en menselijke ondersteuning',
            },
            control: {
                title: 'Beheer',
                description: 'Onkosten, reizen en chat voor grotere bedrijven.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                benefit1: 'Alles in het Collect-plan',
                benefit2: 'Meerniveau goedkeuringsworkflows',
                benefit3: 'Aangepaste uitgavenregels',
                benefit4: 'ERP-integraties (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'HR-integraties (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Aangepaste inzichten en rapportage',
                benefit8: 'Budgetteren',
            },
            thisIsYourCurrentPlan: 'Dit is je huidige plan',
            downgrade: 'Downgrade naar Collect',
            upgrade: 'Upgrade naar Control',
            addMembers: 'Leden toevoegen',
            saveWithExpensifyTitle: 'Bespaar met de Expensify Card',
            saveWithExpensifyDescription: 'Gebruik onze besparingscalculator om te zien hoe cash back van de Expensify Card uw Expensify-rekening kan verlagen.',
            saveWithExpensifyButton: 'Meer informatie',
        },
        compareModal: {
            comparePlans: 'Vergelijk Plannen',
            subtitle: `<muted-text>Ontgrendel de functies die u nodig hebt met het abonnement dat bij u past. <a href="${CONST.PRICING}">Bekijk onze prijspagina</a> of een volledig overzicht van de functies van elk van onze abonnementen.</muted-text>`,
        },
        details: {
            title: 'Abonnementsgegevens',
            annual: 'Jaarabonnement',
            taxExempt: 'Vraag belastingvrijstelling aan',
            taxExemptEnabled: 'Belastingvrijgesteld',
            taxExemptStatus: 'Belastingvrijstellingsstatus',
            payPerUse: 'Betalen per gebruik',
            subscriptionSize: 'Abonnementsgrootte',
            headsUp:
                'Let op: Als je nu je abonnementsomvang niet instelt, stellen we deze automatisch in op het aantal actieve leden van je eerste maand. Je bent dan verplicht om voor ten minste dit aantal leden te betalen voor de komende 12 maanden. Je kunt je abonnementsomvang op elk moment verhogen, maar je kunt deze niet verlagen totdat je abonnement is afgelopen.',
            zeroCommitment: 'Geen verplichtingen bij het verlaagde jaarlijkse abonnementsbedrag',
        },
        subscriptionSize: {
            title: 'Abonnementsgrootte',
            yourSize: 'Uw abonnementsomvang is het aantal open plaatsen dat in een bepaalde maand door een actief lid kan worden ingevuld.',
            eachMonth:
                'Elke maand dekt je abonnement tot het aantal actieve leden dat hierboven is ingesteld. Telkens wanneer je je abonnementsomvang vergroot, begin je een nieuw 12-maanden abonnement met die nieuwe omvang.',
            note: 'Opmerking: Een actief lid is iemand die uitgavengegevens heeft aangemaakt, bewerkt, ingediend, goedgekeurd, vergoed of geëxporteerd die aan de werkruimte van uw bedrijf zijn gekoppeld.',
            confirmDetails: 'Bevestig uw nieuwe jaarlijkse abonnementsgegevens:',
            subscriptionSize: 'Abonnementsgrootte',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} actieve leden/maand`,
            subscriptionRenews: 'Abonnement wordt verlengd',
            youCantDowngrade: 'U kunt niet downgraden tijdens uw jaarlijkse abonnement.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Je hebt je al gecommitteerd aan een jaarlijks abonnementsformaat van ${size} actieve leden per maand tot ${date}. Je kunt op ${date} overstappen naar een pay-per-use-abonnement door automatisch verlengen uit te schakelen.`,
            error: {
                size: 'Voer een geldig abonnementsformaat in alstublieft',
                sameSize: 'Voer een ander nummer in dan uw huidige abonnementsomvang.',
            },
        },
        paymentCard: {
            addPaymentCard: 'Betaalpas toevoegen',
            enterPaymentCardDetails: 'Voer uw betaalkaartgegevens in',
            security: 'Expensify is PCI-DSS-conform, gebruikt encryptie op bankniveau en maakt gebruik van redundante infrastructuur om je gegevens te beschermen.',
            learnMoreAboutSecurity: 'Meer informatie over onze beveiliging.',
        },
        subscriptionSettings: {
            title: 'Abonnementsinstellingen',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Abonnementstype: ${subscriptionType}, Abonnementsomvang: ${subscriptionSize}, Automatisch verlengen: ${autoRenew}, Automatisch jaarlijkse zitplaatsen verhogen: ${autoIncrease}`,
            none: 'geen',
            on: 'op',
            off: 'uit',
            annual: 'Jaarlijks',
            autoRenew: 'Automatisch verlengen',
            autoIncrease: 'Automatisch jaarlijkse zitplaatsen verhogen',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Bespaar tot ${amountWithCurrency}/maand per actief lid`,
            automaticallyIncrease:
                'Verhoog automatisch uw jaarlijkse zitplaatsen om actieve leden die uw abonnementsomvang overschrijden te accommoderen. Let op: Dit zal de einddatum van uw jaarlijkse abonnement verlengen.',
            disableAutoRenew: 'Automatisch verlengen uitschakelen',
            helpUsImprove: 'Help ons Expensify verbeteren',
            whatsMainReason: 'Wat is de belangrijkste reden dat je automatische verlenging uitschakelt?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Wordt verlengd op ${date}.`,
            pricingConfiguration: 'De prijs is afhankelijk van de configuratie. Voor de laagste prijs, kies een jaarlijks abonnement en krijg de Expensify Card.',
            learnMore: {
                part1: 'Meer informatie op onze',
                pricingPage: 'prijs pagina',
                part2: 'of chat met ons team in uw',
                adminsRoom: '#admins kamer.',
            },
            estimatedPrice: 'Geschatte prijs',
            changesBasedOn: 'Dit verandert op basis van je gebruik van de Expensify Card en de onderstaande abonnementsopties.',
        },
        requestEarlyCancellation: {
            title: 'Vroegtijdige annulering aanvragen',
            subtitle: 'Wat is de belangrijkste reden waarom je een vroegtijdige annulering aanvraagt?',
            subscriptionCanceled: {
                title: 'Abonnement geannuleerd',
                subtitle: 'Uw jaarlijkse abonnement is geannuleerd.',
                info: 'Als je je werkruimte(s) op een pay-per-use basis wilt blijven gebruiken, ben je helemaal klaar.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Als je toekomstige activiteiten en kosten wilt voorkomen, moet je <a href="${workspacesListRoute}">verwijder je werkruimte(s)</a>. Let op dat wanneer je je werkruimte(s) verwijdert, je wordt gefactureerd voor alle openstaande activiteiten die in de huidige kalendermaand zijn gemaakt.`,
            },
            requestSubmitted: {
                title: 'Verzoek ingediend',
                subtitle:
                    'Bedankt dat u ons laat weten dat u uw abonnement wilt opzeggen. We bekijken uw verzoek en nemen binnenkort contact met u op via uw chat met <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Door vroegtijdige annulering aan te vragen, erken en ga ik ermee akkoord dat Expensify geen verplichting heeft om een dergelijk verzoek in te willigen onder de Expensify <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Servicevoorwaarden</a>of een andere toepasselijke serviceovereenkomst tussen mij en Expensify en dat Expensify naar eigen goeddunken beslist over het al dan niet honoreren van een dergelijk verzoek.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Functionaliteit moet worden verbeterd',
        tooExpensive: 'Te duur',
        inadequateSupport: 'Onvoldoende klantenondersteuning',
        businessClosing: 'Bedrijf sluit, krimpt in, of is overgenomen',
        additionalInfoTitle: 'Naar welke software verhuist u en waarom?',
        additionalInfoInputLabel: 'Je reactie',
    },
    roomChangeLog: {
        updateRoomDescription: 'stel de kamerbeschrijving in op:',
        clearRoomDescription: 'de kamerbeschrijving gewist',
        changedRoomAvatar: 'De avatar van de kamer is gewijzigd',
        removedRoomAvatar: 'De avatar van de kamer is verwijderd',
    },
    delegate: {
        switchAccount: 'Accounts wisselen:',
        copilotDelegatedAccess: 'Copilot: Gedelegeerde toegang',
        copilotDelegatedAccessDescription: 'Sta andere leden toe om toegang te krijgen tot je account.',
        addCopilot: 'Copilot toevoegen',
        membersCanAccessYourAccount: 'Deze leden hebben toegang tot uw account:',
        youCanAccessTheseAccounts: 'Je kunt deze accounts openen via de accountwisselaar:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Volledig';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Beperkt';
                default:
                    return '';
            }
        },
        genericError: 'Oeps, er is iets misgegaan. Probeer het opnieuw.',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `namens ${delegator}`,
        accessLevel: 'Toegangsniveau',
        confirmCopilot: 'Bevestig je copiloot hieronder.',
        accessLevelDescription: 'Kies hieronder een toegangsniveau. Zowel Volledige als Beperkte toegang stellen copilots in staat om alle gesprekken en uitgaven te bekijken.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Sta een ander lid toe om alle acties in uw account uit te voeren, namens u. Inclusief chat, inzendingen, goedkeuringen, betalingen, instellingen bijwerken en meer.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Sta een ander lid toe om de meeste acties in uw account namens u uit te voeren. Uitzonderingen zijn goedkeuringen, betalingen, afwijzingen en blokkeringen.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Verwijder copilot',
        removeCopilotConfirmation: 'Weet je zeker dat je deze copiloot wilt verwijderen?',
        changeAccessLevel: 'Toegangsniveau wijzigen',
        makeSureItIsYou: 'Laten we ervoor zorgen dat jij het bent',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Voer de magische code in die naar ${contactMethod} is gestuurd om een copiloot toe te voegen. Het zou binnen een minuut of twee moeten aankomen.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Voer de magische code in die naar ${contactMethod} is verzonden om uw copilot bij te werken.`,
        notAllowed: 'Niet zo snel...',
        noAccessMessage: dedent(`
            Als copiloot heb je geen toegang tot
            deze pagina. Sorry!
        `),
        notAllowedMessage: ({accountOwnerEmail}: AccountOwnerParams) =>
            `Als <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copiloot</a> voor ${accountOwnerEmail} heb je geen toestemming om deze actie uit te voeren. Sorry!`,
        copilotAccess: 'Copilot-toegang',
    },
    debug: {
        debug: 'Debuggen',
        details: 'Details',
        JSON: 'JSON',
        reportActions: 'Acties',
        reportActionPreview: 'Voorbeeldweergave',
        nothingToPreview: 'Niets om te bekijken',
        editJson: 'Edit JSON:',
        preview: 'Voorbeeld:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Ontbrekende ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Ongeldige eigenschap: ${propertyName} - Verwacht: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Ongeldige waarde - Verwacht: ${expectedValues}`,
        missingValue: 'Ontbrekende waarde',
        createReportAction: 'Actie Rapport Maken',
        reportAction: 'Actie rapporteren',
        report: 'Rapport',
        transaction: 'Transactie',
        violations: 'Overtredingen',
        transactionViolation: 'Transactieovertreding',
        hint: 'Gegevenswijzigingen worden niet naar de backend verzonden.',
        textFields: 'Tekstvelden',
        numberFields: 'Nummervelden',
        booleanFields: 'Booleaanse velden',
        constantFields: 'Constante velden',
        dateTimeFields: 'DateTime velden',
        date: 'Datum',
        time: 'Tijd',
        none: 'Geen',
        visibleInLHN: 'Zichtbaar in LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'waar',
        false: 'onwaar',
        viewReport: 'Bekijk rapport',
        viewTransaction: 'Transactie bekijken',
        createTransactionViolation: 'Transactieovertreding maken',
        reasonVisibleInLHN: {
            hasDraftComment: 'Heeft conceptopmerking',
            hasGBR: 'Heeft GBR',
            hasRBR: 'Heeft RBR',
            pinnedByUser: 'Vastgezet door lid',
            hasIOUViolations: 'Heeft IOU-overtredingen',
            hasAddWorkspaceRoomErrors: 'Heeft fouten bij het toevoegen van werkruimtekamer',
            isUnread: 'Is ongelezen (focusmodus)',
            isArchived: 'Is gearchiveerd (meest recente modus)',
            isSelfDM: 'Is zelf DM',
            isFocused: 'Is tijdelijk gefocust',
        },
        reasonGBR: {
            hasJoinRequest: 'Heeft een lidmaatschapsverzoek (admin kamer)',
            isUnreadWithMention: 'Is ongelezen met vermelding',
            isWaitingForAssigneeToCompleteAction: 'Wacht op de verantwoordelijke om de actie te voltooien',
            hasChildReportAwaitingAction: 'Heeft kindrapport wachtend op actie',
            hasMissingInvoiceBankAccount: 'Heeft een ontbrekende factuur bankrekening',
            hasUnresolvedCardFraudAlert: 'Heeft een onopgeloste kaartfraude waarschuwing',
        },
        reasonRBR: {
            hasErrors: 'Heeft fouten in rapport of rapportacties gegevens',
            hasViolations: 'Heeft overtredingen',
            hasTransactionThreadViolations: 'Heeft schendingen van transactiedraad',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Er is een rapport dat op actie wacht',
            theresAReportWithErrors: 'Er is een rapport met fouten',
            theresAWorkspaceWithCustomUnitsErrors: 'Er is een werkruimte met fouten in aangepaste eenheden.',
            theresAProblemWithAWorkspaceMember: 'Er is een probleem met een werkruimte lid.',
            theresAProblemWithAWorkspaceQBOExport: 'Er was een probleem met een exportinstelling van de werkruimteverbinding.',
            theresAProblemWithAContactMethod: 'Er is een probleem met een contactmethode',
            aContactMethodRequiresVerification: 'Een contactmethode vereist verificatie',
            theresAProblemWithAPaymentMethod: 'Er is een probleem met een betaalmethode',
            theresAProblemWithAWorkspace: 'Er is een probleem met een werkruimte',
            theresAProblemWithYourReimbursementAccount: 'Er is een probleem met je terugbetalingsaccount',
            theresABillingProblemWithYourSubscription: 'Er is een factureringsprobleem met je abonnement.',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Je abonnement is succesvol verlengd.',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Er was een probleem tijdens een synchronisatie van de werkruimteverbinding.',
            theresAProblemWithYourWallet: 'Er is een probleem met je portemonnee',
            theresAProblemWithYourWalletTerms: 'Er is een probleem met de voorwaarden van je wallet.',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Maak een proefrit',
    },
    migratedUserWelcomeModal: {
        title: 'Welkom bij New Expensify!',
        subtitle: 'Het heeft alles wat je leuk vindt aan onze klassieke ervaring, plus een heleboel upgrades om je leven nog makkelijker te maken:',
        confirmText: 'Laten we gaan!',
        features: {
            chat: 'Chat bij elke uitgave om vragen snel op te lossen',
            search: 'Krachtigere zoekfunctie op mobiel, web en desktop',
            concierge: 'Ingebouwde Concierge AI om je onkosten te automatiseren',
        },
        helpText: 'Probeer de 2-minuten-demo',
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>Aan de slag <strong>hier!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Hernoem uw opgeslagen zoekopdrachten</strong> hier!</tooltip>',
        accountSwitcher: '<tooltip>Toegang tot je <strong>Copilot-accounts</strong> hier</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Scan ons testbonnetje</strong> om te zien hoe het werkt!</tooltip>',
            manager: '<tooltip>Kies onze <strong>testmanager</strong> om het uit te proberen!</tooltip>',
            confirmation: '<tooltip><strong>Dien nu je onkosten in</strong> en zie\nwat er gebeurt!</tooltip>',
            tryItOut: 'Probeer het uit',
        },
        outstandingFilter: '<tooltip>Filter op onkosten\ndie <strong>goedkeuring nodig hebben</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Stuur dit bonnetje om de\n<strong>test uit te voeren!</strong></tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Wijzigingen negeren?',
        body: 'Weet je zeker dat je de wijzigingen die je hebt gemaakt wilt weggooien?',
        confirmText: 'Wijzigingen verwijderen',
    },
    scheduledCall: {
        book: {
            title: 'Gesprek plannen',
            description: 'Vind een tijd die voor jou werkt.',
            slots: ({date}: {date: string}) => `<muted-text>Beschikbare tijden voor <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Oproep bevestigen',
            description: 'Zorg ervoor dat de onderstaande details er goed uitzien voor jou. Zodra je de oproep bevestigt, sturen we een uitnodiging met meer informatie.',
            setupSpecialist: 'Uw setup specialist',
            meetingLength: 'Vergaderingsduur',
            dateTime: 'Datum & tijd',
            minutes: '30 minuten',
        },
        callScheduled: 'Oproep gepland',
    },
    autoSubmitModal: {
        title: 'Alles duidelijk en ingediend!',
        description: 'Alle waarschuwingen en overtredingen zijn gewist, dus:',
        submittedExpensesTitle: 'Deze uitgaven zijn ingediend',
        submittedExpensesDescription: 'Deze uitgaven zijn naar uw goedkeurder gestuurd, maar kunnen nog worden bewerkt totdat ze zijn goedgekeurd.',
        pendingExpensesTitle: 'In afwachting zijnde uitgaven zijn verplaatst',
        pendingExpensesDescription: 'Alle openstaande kaartuitgaven zijn verplaatst naar een apart rapport totdat ze worden geboekt.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Maak een proefrit van 2 minuten',
        },
        modal: {
            title: 'Probeer ons uit',
            description: 'Volg een korte producttour om snel op gang te komen.',
            confirmText: 'Start proefrit',
            helpText: 'Overslaan',
            employee: {
                description:
                    '<muted-text>Krijg <strong>3 gratis maanden Expensify</strong> voor je team! Vul hieronder het e-mailadres van je baas in en stuur hen een testuitgave.</muted-text>',
                email: 'Voer het e-mailadres van uw baas in',
                error: 'Dat lid bezit een werkruimte, voer alstublieft een nieuw lid in om te testen.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Je bent momenteel Expensify aan het uitproberen.',
            readyForTheRealThing: 'Klaar voor het echte werk?',
            getStarted: 'Aan de slag',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) =>
            `# ${name} heeft je uitgenodigd om Expensify uit te proberen\nHey! Ik heb ons net *3 maanden gratis* gekregen om Expensify uit te proberen, de snelste manier om onkosten te beheren.\n\nHier is een *testbon* om je te laten zien hoe het werkt:`,
    },
    export: {
        basicExport: 'Basis export',
        reportLevelExport: 'Alle gegevens - rapportniveau',
        expenseLevelExport: 'Alle gegevens - uitgavenniveau',
        exportInProgress: 'Bezig met exporteren',
        conciergeWillSend: 'Concierge stuurt je het bestand binnenkort.',
    },
    avatarPage: {title: 'Profielfoto bewerken', upload: 'Uploaden', uploadPhoto: 'Foto uploaden', selectAvatar: 'Selecteer avatar', choosePresetAvatar: 'Of kies een aangepaste avatar'},
    openAppFailureModal: {
        title: 'Er is iets misgegaan...',
        subtitle: `We hebben niet al uw gegevens kunnen laden. We zijn op de hoogte gesteld en onderzoeken het probleem. Als dit aanhoudt, neem dan contact op met`,
        refreshAndTryAgain: 'Vernieuw en probeer het opnieuw',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> uitgaven toevoegt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten op <strong>${actor}</strong> om uitgaven toe te voegen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder uitgaven toevoegt.`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Geen verdere actie vereist!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> een bankrekening toevoegt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> een bankrekening toevoegt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder een bankrekening toevoegt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `op ${eta}` : ` ${eta}`;
                }
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>je</strong> uitgaven automatisch worden ingediend${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot de uitgaven van <strong>${actor}'s</strong> automatisch worden ingediend${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot de uitgaven van een beheerder automatisch worden ingediend${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten totdat <strong>jij</strong> het probleem of de problemen oplost.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> het probleem of de problemen oplost.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder het probleem of de problemen oplost.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> de uitgaven goedkeurt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> onkosten goedkeurt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder de uitgaven goedkeurt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> dit rapport exporteert.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> dit rapport exporteert.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder dit rapport exporteert.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> de onkosten betaalt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> de onkosten betaalt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder de onkosten betaalt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> klaar bent met het instellen van een zakelijke bankrekening.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> klaar is met het instellen van een zakelijke bankrekening.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder klaar is met het instellen van een zakelijke bankrekening.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `vóór ${eta}` : ` ${eta}`;
                }
                return `Wachten tot de betaling is voltooid${formattedETA}.`;
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'binnenkort',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'later vandaag',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'op zondag',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: 'op de 1e en 16e van elke maand',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'op de laatste werkdag van de maand',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: 'op de laatste dag van de maand',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: 'aan het einde van je reis',
        },
    },
    domain: {
        notVerified: 'Niet geverifieerd',
        retry: 'Opnieuw proberen',
        verifyDomain: {
            title: 'Domein verifiëren',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Controleer voordat je verdergaat of je eigenaar bent van <strong>${domainName}</strong> door de DNS-instellingen bij te werken.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Ga naar je DNS-provider en open de DNS-instellingen voor <strong>${domainName}</strong>.`,
            addTXTRecord: 'Voeg het volgende TXT-record toe:',
            saveChanges: 'Sla wijzigingen op en kom hier terug om je domein te verifiëren.',
            youMayNeedToConsult: `Misschien moet je contact opnemen met de IT-afdeling van je organisatie om de verificatie te voltooien. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Meer informatie</a>.`,
            warning: 'Na verificatie ontvangen alle Expensify-leden op je domein een e-mail waarin staat dat hun account onder je domein wordt beheerd.',
            codeFetchError: 'Kon de verificatiecode niet ophalen',
            genericError: 'We konden uw domein niet verifiëren. Probeer het opnieuw en neem contact op met Concierge als het probleem aanhoudt.',
        },
        domainVerified: {
            title: 'Domein geverifieerd',
            header: 'Woehoe! Je domein is geverifieerd',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Het domein <strong>${domainName}</strong> is succesvol geverifieerd en je kunt nu SAML en andere beveiligingsfuncties instellen.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML eenmalige aanmelding (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> is een beveiligingsfunctie die je meer controle geeft over hoe leden met e-mailadressen van <strong>${domainName}</strong> inloggen bij Expensify. Om dit in te schakelen, moet je bevestigen dat je een geautoriseerde bedrijfsbeheerder bent.</muted-text>`,
            fasterAndEasierLogin: 'Sneller en makkelijker inloggen',
            moreSecurityAndControl: 'Meer beveiliging en controle',
            onePasswordForAnything: 'Eén wachtwoord voor alles',
        },
        goToDomain: 'Ga naar het domein',
        samlLogin: {
            title: 'SAML-aanmelding',
            subtitle: `<muted-text>Configureer het inloggen voor leden met <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO).</a></muted-text>`,
            enableSamlLogin: 'SAML-aanmelding inschakelen',
            allowMembers: 'Leden toestaan om met SAML in te loggen.',
            requireSamlLogin: 'SAML-aanmelding vereisen',
            anyMemberWillBeRequired: 'Elk lid dat met een andere methode is aangemeld, moet zich opnieuw authenticeren via SAML.',
            enableError: 'Kon de instelling voor SAML-inschakeling niet bijwerken',
            requireError: 'Kan SAML-vereiste-instelling niet bijwerken',
        },
        samlConfigurationDetails: {
            title: 'SAML-configuratiedetails',
            subtitle: 'Gebruik deze gegevens om SAML in te stellen.',
            identityProviderMetaData: 'Metagegevens van identiteitsprovider',
            entityID: 'Entiteit-ID',
            nameIDFormat: 'Naam-ID-formaat',
            loginUrl: 'Inlog-URL',
            acsUrl: 'ACS-URL (Assertion Consumer Service)',
            logoutUrl: 'URL voor afmelden',
            sloUrl: 'SLO (Eenmalige afmelding) URL',
            serviceProviderMetaData: 'Serviceprovider-metagegevens',
            oktaScimToken: 'Okta SCIM-token',
            revealToken: 'Token weergeven',
            fetchError: 'Kon SAML-configuratiedetails niet ophalen',
            setMetadataGenericError: 'Kon SAML-metadata niet instellen',
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
