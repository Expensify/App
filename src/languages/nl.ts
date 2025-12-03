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
        count: 'Aantal',
        cancel: 'Annuleren',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: 'Sluiten',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: 'Doorgaan',
        yes: 'Ja',
        no: 'Nee',
        // @context Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.
        ok: 'OK',
        notNow: 'Niet nu',
        noThanks: 'Nee, bedankt',
        learnMore: 'Meer informatie',
        buttonConfirm: 'Begrepen',
        name: 'Naam',
        attachment: 'Bijlage',
        attachments: 'Bijlagen',
        center: 'Centreren',
        from: 'Van',
        to: 'Aan',
        in: 'In',
        optional: 'Optioneel',
        new: 'Nieuw',
        search: 'Zoeken',
        reports: 'Rapporten',
        find: 'Zoeken',
        searchWithThreeDots: 'Zoeken...',
        next: 'Volgende',
        previous: 'Vorige',
        // @context Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.
        goBack: 'Ga terug',
        create: 'Maken',
        add: 'Toevoegen',
        resend: 'Opnieuw verzenden',
        save: 'Opslaan',
        select: 'Select',
        deselect: 'Deselecteren',
        // @context Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.
        selectMultiple: 'Meerdere selecteren',
        saveChanges: 'Wijzigingen opslaan',
        submit: 'Indienen',
        // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        submitted: 'Ingediend',
        rotate: 'Roteren',
        zoom: 'Zoom',
        password: 'Wachtwoord',
        magicCode: 'Magische code',
        twoFactorCode: 'Twee factor-code',
        workspaces: 'Workspaces',
        inbox: 'Postvak IN',
        // @context Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”
        success: 'Gelukt',
        group: 'Groep',
        profile: 'Profiel',
        referral: 'Verwijzing',
        payments: 'Betalingen',
        approvals: 'Goedkeuringen',
        wallet: 'Portemonnee',
        preferences: 'Voorkeuren',
        view: 'Weergeven',
        review: (reviewParams?: ReviewParams) => `Beoordelen${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Niet',
        signIn: 'Inloggen',
        signInWithGoogle: 'Aanmelden met Google',
        signInWithApple: 'Inloggen met Apple',
        signInWith: 'Inloggen met',
        continue: 'Doorgaan',
        firstName: 'Voornaam',
        lastName: 'Achternaam',
        scanning: 'Scannen',
        addCardTermsOfService: 'Expensify-servicevoorwaarden',
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
        // @context UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.
        archived: 'Gearchiveerd',
        contacts: 'Contacten',
        recents: 'Recent',
        close: 'Sluiten',
        comment: 'Opmerking',
        download: 'Downloaden',
        downloading: 'Downloaden',
        // @context Indicates that a file is currently being uploaded (sent to the server), not downloaded.
        uploading: 'Uploaden',
        // @context as a verb, not a noun
        pin: 'Vastzetten',
        unPin: 'Losmaken',
        back: 'Terug',
        saveAndContinue: 'Opslaan & verder',
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
        ssnFull9: 'Alle 9 cijfers van SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Adresregel ${lineNumber}`,
        personalAddress: 'Persoonlijk adres',
        companyAddress: 'Bedrijfsadres',
        noPO: 'Geen postbussen of postdoorzendadressen, alstublieft.',
        city: 'Stad',
        state: 'Staat',
        streetAddress: 'Straatadres',
        stateOrProvince: 'Staat / Provincie',
        country: 'Land',
        zip: 'Postcode',
        zipPostCode: 'Postcode / Postcode',
        whatThis: 'Wat is dit?',
        iAcceptThe: 'Ik ga akkoord met de',
        acceptTermsAndPrivacy: `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Servicevoorwaarden</a> en het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacybeleid</a>`,
        acceptTermsAndConditions: `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">algemene voorwaarden</a>`,
        acceptTermsOfService: `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Servicevoorwaarden van Expensify</a>`,
        remove: 'Verwijderen',
        admin: 'Beheerder',
        owner: 'Eigenaar',
        dateFormat: 'YYYY-MM-DD',
        send: 'Verzenden',
        na: 'n.v.t.',
        noResultsFound: 'Geen resultaten gevonden',
        noResultsFoundMatching: (searchString: string) => `Geen resultaten gevonden voor "${searchString}"`,
        recentDestinations: 'Recente bestemmingen',
        timePrefix: 'Het is',
        conjunctionFor: 'voor',
        todayAt: 'Vandaag om',
        tomorrowAt: 'Morgen om',
        yesterdayAt: 'Gisteren om',
        conjunctionAt: 'om',
        conjunctionTo: 'naar',
        genericErrorMessage: 'Oeps... er is iets misgegaan en je verzoek kon niet worden voltooid. Probeer het later opnieuw.',
        percentage: 'Percentage',
        error: {
            invalidAmount: 'Ongeldig bedrag',
            acceptTerms: 'Je moet de Servicevoorwaarden accepteren om door te gaan',
            phoneNumber: `Voer een volledig telefoonnummer in
(bijv. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Dit veld is verplicht',
            requestModified: 'Dit verzoek wordt gewijzigd door een ander lid',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Tekenlimiet overschreden (${length}/${limit})`,
            dateInvalid: 'Selecteer een geldige datum',
            invalidDateShouldBeFuture: 'Kies vandaag of een datum in de toekomst',
            invalidTimeShouldBeFuture: 'Kies een tijd die minstens één minuut in de toekomst ligt',
            invalidCharacter: 'Ongeldig teken',
            enterMerchant: 'Voer een handelsnaam in',
            enterAmount: 'Voer een bedrag in',
            missingMerchantName: 'Ontbrekende naam van verkoper',
            missingAmount: 'Ontbrekend bedrag',
            missingDate: 'Ontbrekende datum',
            enterDate: 'Voer een datum in',
            invalidTimeRange: 'Voer een tijd in met de 12-uursnotatie (bijv. 2:30 PM)',
            pleaseCompleteForm: 'Vul het bovenstaande formulier in om door te gaan',
            pleaseSelectOne: 'Selecteer hierboven een optie',
            invalidRateError: 'Voer een geldige koers in',
            lowRateError: 'Tarief moet groter zijn dan 0',
            email: 'Voer een geldig e-mailadres in',
            login: 'Er is een fout opgetreden tijdens het inloggen. Probeer het opnieuw.',
        },
        comma: 'komma',
        semicolon: 'puntkomma',
        please: 'Alsjeblieft',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'Neem contact met ons op',
        pleaseEnterEmailOrPhoneNumber: 'Voer een e-mailadres of telefoonnummer in',
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: 'Corrigeer de fouten',
        inTheFormBeforeContinuing: 'in het formulier voordat je doorgaat',
        confirm: 'Bevestigen',
        reset: 'Opnieuw instellen',
        // @context Status or button indicating that an action or process has been completed. Should reflect completion.
        done: 'Gereed',
        more: 'Meer',
        debitCard: 'Debetkaart',
        bankAccount: 'Bankrekening',
        personalBankAccount: 'Persoonlijke bankrekening',
        businessBankAccount: 'Zakelijke bankrekening',
        join: 'Deelnemen',
        leave: 'Verlaten',
        decline: 'Weigeren',
        reject: 'Afwijzen',
        transferBalance: 'Saldo overboeken',
        // @context Instruction telling the user to input data manually. Refers to entering text or values in a field.
        enterManually: 'Voer het handmatig in',
        message: 'Bericht',
        leaveThread: 'Gesprek verlaten',
        you: 'Jij',
        // @context Refers to the current user in the UI. Should follow capitalization rules for labels/pronouns in the target language.
        me: 'Ik',
        youAfterPreposition: 'jij',
        your: 'jouw',
        conciergeHelp: 'Neem contact op met Concierge voor hulp.',
        youAppearToBeOffline: 'U lijkt offline te zijn.',
        thisFeatureRequiresInternet: 'Deze functie vereist een actieve internetverbinding.',
        attachmentWillBeAvailableOnceBackOnline: 'Bijlage wordt beschikbaar zodra je weer online bent.',
        errorOccurredWhileTryingToPlayVideo: 'Er is een fout opgetreden tijdens het afspelen van deze video.',
        areYouSure: 'Weet je het zeker?',
        verify: 'Verifiëren',
        yesContinue: 'Ja, doorgaan',
        // @context Provides an example format for a website URL.
        websiteExample: 'bijv. https://www.expensify.com',
        // @context Provides an example format for a ZIP/postal code.
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `bijv. ${zipSampleFormat}` : ''),
        description: 'Beschrijving',
        title: 'Titel',
        assignee: 'Toegewezene',
        createdBy: 'Gemaakt door',
        with: 'met',
        shareCode: 'Code delen',
        share: 'Delen',
        per: 'per',
        // @context Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.
        mi: 'mi',
        km: 'kilometer',
        copied: 'Gekopieerd!',
        someone: 'Iemand',
        total: 'Totaal',
        edit: 'Bewerken',
        letsDoThis: `Laten we dit doen!`,
        letsStart: `Laten we beginnen`,
        showMore: 'Meer weergeven',
        showLess: 'Toon minder',
        merchant: 'Verkoper',
        category: 'Categorie',
        report: 'Rapport',
        billable: 'Factureerbaar',
        nonBillable: 'Niet factureerbaar',
        tag: 'Label',
        receipt: 'Bonnetje',
        verified: 'Geverifieerd',
        replace: 'Vervangen',
        distance: 'Afstand',
        mile: 'mijl',
        // @context Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.
        miles: 'mijlen',
        kilometer: 'kilometer',
        kilometers: 'kilometers',
        recent: 'Recent',
        all: 'Alles',
        am: 'AM',
        pm: 'PM',
        // @context Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.
        tbd: 'N.t.b.',
        selectCurrency: 'Selecteer een valuta',
        selectSymbolOrCurrency: 'Selecteer een symbool of valuta',
        card: 'Kaart',
        whyDoWeAskForThis: 'Waarom vragen we dit?',
        required: 'Vereist',
        showing: 'Wordt weergegeven',
        of: 'van',
        default: 'Standaard',
        update: 'Bijwerken',
        member: 'Lid',
        auditor: 'Auditor',
        role: 'Rol',
        currency: 'Valuta',
        groupCurrency: 'Groepsvaluta',
        rate: 'Beoordelen',
        emptyLHN: {
            title: 'Woohoo! Helemaal bij.',
            subtitleText1: 'Zoek een chat met behulp van de',
            subtitleText2: 'knop hierboven, of maak iets met de',
            subtitleText3: 'knop hieronder.',
        },
        businessName: 'Bedrijfsnaam',
        clear: 'Wissen',
        type: 'Type',
        reportName: 'Rapportnaam',
        action: 'Actie',
        expenses: 'Declaraties',
        totalSpend: 'Totale uitgaven',
        tax: 'Belasting',
        shared: 'Gedeeld',
        drafts: 'Concepten',
        // @context as a noun, not a verb
        draft: 'Concept',
        finished: 'Voltooid',
        upgrade: 'Upgrade',
        downgradeWorkspace: 'Werkruimte downgraden',
        companyID: 'Bedrijfs-ID',
        userID: 'Gebruikers-ID',
        disable: 'Uitschakelen',
        export: 'Exporteren',
        initialValue: 'Initiële waarde',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: 'Huidige datum',
        value: 'Waarde',
        downloadFailedTitle: 'Download mislukt',
        downloadFailedDescription: 'Je download kon niet worden voltooid. Probeer het later opnieuw.',
        filterLogs: 'Logboeken filteren',
        network: 'Netwerk',
        reportID: 'Rapport-ID',
        longID: 'Lange ID',
        withdrawalID: 'Opname-ID',
        bankAccounts: 'Bankrekeningen',
        chooseFile: 'Kies bestand',
        chooseFiles: 'Bestanden kiezen',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: 'Laat het los',
        // @context Instruction for dropping one or more files into an upload area.
        dropMessage: 'Zet uw bestand hier neer',
        ignore: 'Negeren',
        enabled: 'Ingeschakeld',
        disabled: 'Uitgeschakeld',
        // @context Action button for importing a file or data. Should use the verb form, not the noun form.
        import: 'Importeren',
        offlinePrompt: 'Je kunt deze actie nu niet uitvoeren.',
        // @context meaning "remaining to be paid, done, or dealt with", not "exceptionally good"
        outstanding: 'Openstaand',
        chats: 'Chats',
        tasks: 'Taken',
        unread: 'Ongelezen',
        sent: 'Verzonden',
        links: 'Koppelingen',
        // @context Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).
        day: 'dag',
        days: 'dagen',
        rename: 'Naam wijzigen',
        address: 'Adres',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Overslaan',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) => `Iets specifieks nodig? Chat met je accountmanager, ${accountManagerDisplayName}.`,
        chatNow: 'Nu chatten',
        workEmail: 'Werk e-mailadres',
        destination: 'Bestemming',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: 'Subtarief',
        perDiem: 'Dagvergoeding',
        validate: 'Valideren',
        downloadAsPDF: 'Downloaden als pdf',
        downloadAsCSV: 'Downloaden als CSV',
        help: 'Help',
        expenseReport: 'Onkostendeclaratie',
        expenseReports: 'Declaraties',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'Tarief buiten beleid',
        leaveWorkspace: 'Werkruimte verlaten',
        leaveWorkspaceConfirmation: 'Als je deze werkruimte verlaat, kun je er geen onkostendeclaraties meer naar indienen.',
        leaveWorkspaceConfirmationAuditor: 'Als je deze workspace verlaat, kun je de rapporten en instellingen niet meer bekijken.',
        leaveWorkspaceConfirmationAdmin: 'Als je deze werkruimte verlaat, kun je de instellingen niet meer beheren.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Als je deze workspace verlaat, word je in de goedkeuringsworkflow vervangen door ${workspaceOwner}, de eigenaar van de workspace.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Als je deze workspace verlaat, word je vervangen als de voorkeursindiener door ${workspaceOwner}, de eigenaar van de workspace.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Als je deze workspace verlaat, word je als technisch contact vervangen door ${workspaceOwner}, de eigenaar van de workspace.`,
        leaveWorkspaceReimburser:
            'Je kunt deze workspace niet verlaten als vergoedingsverantwoordelijke. Stel een nieuwe vergoedingsverantwoordelijke in via Workspaces > Betalingen uitvoeren of volgen en probeer het daarna opnieuw.',
        reimbursable: 'Vergoedbaar',
        editYourProfile: 'Bewerk je profiel',
        comments: 'Opmerkingen',
        sharedIn: 'Gedeeld in',
        unreported: 'Niet gerapporteerd',
        explore: 'Ontdekken',
        todo: 'Taken',
        invoice: 'Factuur',
        expense: 'Onkosten',
        chat: 'Chat',
        task: 'Taak',
        trip: 'Reis',
        apply: 'Toepassen',
        status: 'Status',
        on: 'Aan',
        before: 'Vóór',
        after: 'Na',
        reschedule: 'Opnieuw plannen',
        general: 'Algemeen',
        workspacesTabTitle: 'Workspaces',
        headsUp: 'Let op!',
        submitTo: 'Indienen bij',
        forwardTo: 'Doorsturen naar',
        merge: 'Samenvoegen',
        none: 'Geen',
        unstableInternetConnection: 'Onstabiele internetverbinding. Controleer je netwerk en probeer het opnieuw.',
        enableGlobalReimbursements: 'Wereldwijde terugbetalingen inschakelen',
        purchaseAmount: 'Aankoopbedrag',
        frequency: 'Frequentie',
        link: 'Link',
        pinned: 'Vastgezet',
        read: 'Lezen',
        copyToClipboard: 'Kopiëren naar klembord',
        thisIsTakingLongerThanExpected: 'Dit duurt langer dan verwacht...',
        domains: 'Domeinen',
        actionRequired: 'Actie vereist',
    },
    supportalNoAccess: {
        title: 'Zo snel gaat dat niet',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `Je bent niet gemachtigd om deze actie uit te voeren wanneer support is ingelogd (commando: ${command ?? ''}). Als je denkt dat Success deze actie zou moeten kunnen uitvoeren, start dan een gesprek in Slack.`,
    },
    lockedAccount: {
        title: 'Geblokkeerd account',
        description: 'Je mag deze actie niet uitvoeren omdat dit account is vergrendeld. Neem contact op met concierge@expensify.com voor de volgende stappen.',
    },
    location: {
        useCurrent: 'Huidige locatie gebruiken',
        notFound: 'We konden je locatie niet vinden. Probeer het opnieuw of voer handmatig een adres in.',
        permissionDenied: 'Het lijkt erop dat je geen toegang tot je locatie hebt gegeven.',
        please: 'Alsjeblieft',
        allowPermission: 'locatietoegang toestaan in instellingen',
        tryAgain: 'en probeer het opnieuw.',
    },
    contact: {
        importContacts: 'Contacten importeren',
        importContactsTitle: 'Importeer je contacten',
        importContactsText: 'Importeer contacten van je telefoon zodat je favoriete mensen altijd maar één tik van je verwijderd zijn.',
        importContactsExplanation: 'zodat je favoriete mensen altijd maar één tik van je verwijderd zijn.',
        importContactsNativeText: 'Nog één stap! Geef ons groen licht om je contacten te importeren.',
    },
    anonymousReportFooter: {
        logoTagline: 'Doe mee aan de discussie.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Cameratoegang',
        expensifyDoesNotHaveAccessToCamera: 'Expensify kan geen foto’s maken zonder toegang tot je camera. Tik op Instellingen om de machtigingen bij te werken.',
        attachmentError: 'Bijlagefout',
        errorWhileSelectingAttachment: 'Er is een fout opgetreden bij het selecteren van een bijlage. Probeer het alstublieft opnieuw.',
        errorWhileSelectingCorruptedAttachment: 'Er is een fout opgetreden bij het selecteren van een beschadigde bijlage. Probeer een ander bestand.',
        takePhoto: 'Foto maken',
        chooseFromGallery: 'Kiezen uit galerij',
        chooseDocument: 'Kies bestand',
        attachmentTooLarge: 'Bijlage is te groot',
        sizeExceeded: 'De bijlage is groter dan de limiet van 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Bijlagegrootte is groter dan de limiet van ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Bijlage is te klein',
        sizeNotMet: 'De bijlagegrootte moet groter zijn dan 240 bytes',
        wrongFileType: 'Ongeldig bestandstype',
        notAllowedExtension: 'Dit bestandstype is niet toegestaan. Probeer een ander bestandstype.',
        folderNotAllowedMessage: 'Het uploaden van een map is niet toegestaan. Probeer een ander bestand.',
        protectedPDFNotSupported: 'Wachtwoordbeveiligde pdf wordt niet ondersteund',
        attachmentImageResized: 'Deze afbeelding is verkleind voor voorbeeldweergave. Download voor volledige resolutie.',
        attachmentImageTooLarge: 'Deze afbeelding is te groot om een voorbeeld te tonen voordat je deze uploadt.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Je kunt maximaal ${fileLimit} bestanden tegelijk uploaden.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Bestanden zijn groter dan ${maxUploadSizeInMB} MB. Probeer het opnieuw.`,
        someFilesCantBeUploaded: 'Sommige bestanden kunnen niet worden geüpload',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Bestanden moeten kleiner zijn dan ${maxUploadSizeInMB} MB. Grotere bestanden worden niet geüpload.`,
        maxFileLimitExceeded: 'Je kunt maximaal 30 bonnetjes tegelijk uploaden. Eventuele extra’s worden niet geüpload.',
        unsupportedFileType: ({fileType}: FileTypeParams) => `${fileType}-bestanden worden niet ondersteund. Alleen ondersteunde bestandstypen worden geüpload.`,
        learnMoreAboutSupportedFiles: 'Meer informatie over ondersteunde bestandsindelingen.',
        passwordProtected: 'Met wachtwoord beveiligde pdf-bestanden worden niet ondersteund. Alleen ondersteunde bestanden worden geüpload.',
    },
    dropzone: {
        addAttachments: 'Bijlagen toevoegen',
        addReceipt: 'Bon toevoegen',
        scanReceipts: 'Bonnetjes scannen',
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
        noExtensionFoundForMimeType: 'Geen extensie gevonden voor mimetype',
        problemGettingImageYouPasted: 'Er is een probleem opgetreden bij het ophalen van de afbeelding die je hebt geplakt',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `De maximale lengte van een opmerking is ${formattedMaxLength} tekens.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `De maximale lengte van een taaknaam is ${formattedMaxLength} tekens.`,
    },
    baseUpdateAppModal: {
        updateApp: 'App bijwerken',
        updatePrompt: 'Er is een nieuwe versie van deze app beschikbaar.\nWerk nu bij of start de app later opnieuw om de nieuwste wijzigingen te downloaden.',
    },
    deeplinkWrapper: {
        launching: 'Expensify starten',
        expired: 'Je sessie is verlopen.',
        signIn: 'Meld u alstublieft opnieuw aan.',
        redirectedToDesktopApp: 'We hebben je doorgestuurd naar de desktop-app.',
        youCanAlso: 'Je kunt ook',
        openLinkInBrowser: 'open deze link in je browser',
        loggedInAs: ({email}: LoggedInAsParams) => `Je bent ingelogd als ${email}. Klik op "Link openen" in de prompt om je met dit account aan te melden bij de desktop-app.`,
        doNotSeePrompt: 'Kun je de prompt niet zien?',
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
            waar deze oorspronkelijk is aangevraagd
        `),
        doNotShare: dedent(`
            Deel je code met niemand.
            Expensify zal er nooit om vragen!
        `),
        or: ', of',
        signInHere: 'log hier gewoon in',
        expiredCodeTitle: 'Magische code verlopen',
        expiredCodeDescription: 'Ga terug naar het oorspronkelijke apparaat en vraag een nieuwe code aan',
        successfulNewCodeRequest: 'Code aangevraagd. Controleer uw apparaat.',
        tfaRequiredTitle: dedent(`
            Verificatie in twee stappen  
            vereist
        `),
        tfaRequiredDescription: dedent(`
            Voer de tweeledige verificatiecode in
            op de plek waar u probeert in te loggen.
        `),
        requestOneHere: 'verzoek één hier.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Betaald door',
        whatsItFor: 'Waar is het voor?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Naam, e-mail of telefoonnummer',
        findMember: 'Lid zoeken',
        searchForSomeone: 'Zoek iemand',
    },
    customApprovalWorkflow: {
        title: 'Aangepaste goedkeuringsworkflow',
        description: 'Uw bedrijf heeft een aangepaste goedkeuringsworkflow in deze workspace. Voer deze actie uit in Expensify Classic.',
        goToExpensifyClassic: 'Overschakelen naar Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Dien een uitgave in, verwijs je team door',
            subtitleText: 'Wil je dat je team Expensify ook gebruikt? Dien gewoon een uitgave bij hen in en wij zorgen voor de rest.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Een gesprek boeken',
    },
    hello: 'Hallo',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Begin hieronder.',
        anotherLoginPageIsOpen: 'Er is een andere inlogpagina geopend.',
        anotherLoginPageIsOpenExplanation: 'Je hebt de inlogpagina in een apart tabblad geopend. Log in via dat tabblad.',
        welcome: 'Welkom!',
        welcomeWithoutExclamation: 'Welkom',
        phrase2: 'Geld spreekt. En nu chat en betalingen op één plek staan, is het ook nog eens eenvoudig.',
        phrase3: 'Je ontvangt je betalingen net zo snel als je je punt kunt maken.',
        enterPassword: 'Voer uw wachtwoord in',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, het is altijd geweldig om een nieuw gezicht hier te zien!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Voer de magische code in die naar ${login} is gestuurd. Deze zou binnen één à twee minuten moeten aankomen.`,
    },
    login: {
        hero: {
            header: 'Reizen en onkosten, met de snelheid van chat',
            body: 'Welkom bij de volgende generatie van Expensify, waar je reizen en uitgaven sneller verlopen met behulp van contextuele realtime chat.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Je bent al aangemeld als ${email}.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Wil je niet inloggen met ${provider}?`,
        continueWithMyCurrentSession: 'Doorgaan met mijn huidige sessie',
        redirectToDesktopMessage: 'We leiden je om naar de desktopapp zodra je klaar bent met inloggen.',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Doorgaan met inloggen met Single Sign-On:',
        orContinueWithMagicCode: 'Je kunt ook inloggen met een magische code',
        useSingleSignOn: 'Eenmalige aanmelding gebruiken',
        useMagicCode: 'Gebruik magische code',
        launching: 'Wordt gestart...',
        oneMoment: 'Een ogenblik geduld terwijl we u doorsturen naar het single sign-onportaal van uw bedrijf.',
    },
    reportActionCompose: {
        dropToUpload: 'Neerzetten om te uploaden',
        sendAttachment: 'Bijlage verzenden',
        addAttachment: 'Bijlage toevoegen',
        writeSomething: 'Schrijf iets...',
        blockedFromConcierge: 'Communicatie is verboden',
        fileUploadFailed: 'Uploaden mislukt. Bestand wordt niet ondersteund.',
        localTime: ({user, time}: LocalTimeParams) => `Het is ${time} voor ${user}`,
        edited: '(bewerkt)',
        emoji: 'Emoji',
        collapse: 'Samenvouwen',
        expand: 'Uitvouwen',
    },
    reportActionContextMenu: {
        copyMessage: 'Bericht kopiëren',
        copied: 'Gekopieerd!',
        copyLink: 'Link kopiëren',
        copyURLToClipboard: 'URL naar klembord kopiëren',
        copyEmailToClipboard: 'E-mail naar klembord kopiëren',
        markAsUnread: 'Markeren als ongelezen',
        markAsRead: 'Markeren als gelezen',
        editAction: ({action}: EditActionParams) => `Bewerk ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'uitgave' : 'opmerking'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'opmerking';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `${type} verwijderen`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'opmerking';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Weet je zeker dat je dit ${type} wilt verwijderen?`;
        },
        onlyVisible: 'Alleen zichtbaar voor',
        replyInThread: 'Reageren in thread',
        joinThread: 'Deelnemen aan thread',
        leaveThread: 'Gesprek verlaten',
        copyOnyxData: 'Onyx-gegevens kopiëren',
        flagAsOffensive: 'Markeren als aanstootgevend',
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
            `Deze chat is met alle Expensify-leden op het domein <strong>${domainRoom}</strong>. Gebruik hem om met collega’s te chatten, tips te delen en vragen te stellen.`,
        beginningOfChatHistoryAdminRoom: ({workspaceName}: BeginningOfChatHistoryAdminRoomParams) =>
            `Deze chat is met de admin van <strong>${workspaceName}</strong>. Gebruik hem om te chatten over de inrichting van de workspace en meer.`,
        beginningOfChatHistoryAnnounceRoom: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomParams) =>
            `Deze chat is met iedereen in <strong>${workspaceName}</strong>. Gebruik hem voor de belangrijkste aankondigingen.`,
        beginningOfChatHistoryUserRoom: ({reportName, reportDetailsLink}: BeginningOfChatHistoryUserRoomParams) =>
            `Deze chatruimte is voor alles wat met <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> te maken heeft.`,
        beginningOfChatHistoryInvoiceRoom: ({invoicePayer, invoiceReceiver}: BeginningOfChatHistoryInvoiceRoomParams) =>
            `Deze chat is voor facturen tussen <strong>${invoicePayer}</strong> en <strong>${invoiceReceiver}</strong>. Gebruik de knop + om een factuur te verzenden.`,
        beginningOfChatHistory: 'Deze chat is met',
        beginningOfChatHistoryPolicyExpenseChat: ({workspaceName, submitterDisplayName}: BeginningOfChatHistoryPolicyExpenseChatParams) =>
            `Dit is waar <strong>${submitterDisplayName}</strong> onkosten indient bij <strong>${workspaceName}</strong>. Gebruik gewoon de knop +.`,
        beginningOfChatHistorySelfDM: 'Dit is je persoonlijke ruimte. Gebruik het voor notities, taken, concepten en herinneringen.',
        beginningOfChatHistorySystemDM: 'Welkom! Laten we je instellen.',
        chatWithAccountManager: 'Chat met je accountmanager hier',
        sayHello: 'Zeg hallo!',
        yourSpace: 'Je ruimte',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Welkom bij ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Gebruik de knop + om een uitgave te ${additionalText}.`,
        askConcierge: 'Stel vragen en krijg 24/7 realtime ondersteuning.',
        conciergeSupport: '24/7 ondersteuning',
        create: 'Aanmaken',
        iouTypes: {
            pay: 'Betalen',
            split: 'Splitsen',
            submit: 'Verzenden',
            track: 'bijhouden',
            invoice: 'factuur',
        },
    },
    adminOnlyCanPost: 'Alleen beheerders kunnen berichten sturen in deze ruimte.',
    reportAction: {
        asCopilot: 'als copiloot voor',
    },
    mentionSuggestions: {
        hereAlternateText: 'Iedereen in dit gesprek op de hoogte stellen',
    },
    newMessages: 'Nieuwe berichten',
    latestMessages: 'Nieuwste berichten',
    youHaveBeenBanned: 'Opmerking: Je bent verbannen om in dit kanaal te chatten.',
    reportTypingIndicator: {
        isTyping: 'is aan het typen...',
        areTyping: 'zijn aan het typen...',
        multipleMembers: 'Meerdere leden',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Deze chatruimte is gearchiveerd.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Deze chat is niet meer actief omdat ${displayName} zijn account heeft gesloten.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Deze chat is niet langer actief omdat ${oldDisplayName} zijn account heeft samengevoegd met ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Deze chat is niet meer actief omdat <strong>jij</strong> geen lid meer bent van de ${policyName}-werkruimte.`
                : `Deze chat is niet langer actief omdat ${displayName} geen lid meer is van de ${policyName}-werkruimte.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Deze chat is niet meer actief omdat ${policyName} geen actieve werkruimte meer is.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Deze chat is niet meer actief omdat ${policyName} geen actieve werkruimte meer is.`,
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
        fabNewChatExplained: 'Chat starten (zwevende actie)',
        fabScanReceiptExplained: 'Bon scannen (zwevende actie)',
        chatPinned: 'Chat vastgezet',
        draftedMessage: 'Conceptbericht',
        listOfChatMessages: 'Lijst met chatberichten',
        listOfChats: 'Lijst met chats',
        saveTheWorld: 'Red de wereld',
        tooltip: 'Begin hier!',
        redirectToExpensifyClassicModal: {
            title: 'Binnenkort beschikbaar',
            description:
                'We zijn nog een paar onderdelen van New Expensify aan het verfijnen om het op jouw specifieke instellingen af te stemmen. Ga in de tussentijd naar Expensify Classic.',
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
        manual: 'Handmatig',
        scan: 'Scannen',
        map: 'Kaart',
    },
    spreadsheet: {
        upload: 'Een spreadsheet uploaden',
        import: 'Spreadsheet importeren',
        dragAndDrop: '<muted-link>Sleep je spreadsheet hierheen, of kies hieronder een bestand. Ondersteunde indelingen: .csv, .txt, .xls en .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Sleep je spreadsheet hierheen of kies hieronder een bestand. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Meer informatie</a> over ondersteunde bestandsindelingen.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Selecteer een spreadsheetbestand om te importeren. Ondersteunde formaten: .csv, .txt, .xls en .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Selecteer een spreadsheetbestand om te importeren. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Meer informatie</a> over ondersteunde bestandsindelingen.</muted-link>`,
        fileContainsHeader: 'Bestand bevat kolomkoppen',
        column: ({name}: SpreadSheetColumnParams) => `Kolom ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `Oeps! Een verplicht veld ("${fieldName}") is niet toegewezen. Controleer het en probeer het opnieuw.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) => `Oeps! Je hebt één veld ("${fieldName}") aan meerdere kolommen gekoppeld. Controleer dit en probeer het opnieuw.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `Oeps! Het veld („${fieldName}”) bevat een of meer lege waarden. Controleer het en probeer het opnieuw.`,
        importSuccessfulTitle: 'Import geslaagd',
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
            rates > 1 ? `${rates} per diem-tarieven zijn toegevoegd.` : '1 dagvergoeding is toegevoegd.',
        importFailedTitle: 'Import mislukt',
        importFailedDescription: 'Zorg ervoor dat alle velden correct zijn ingevuld en probeer het opnieuw. Als het probleem zich blijft voordoen, neem dan contact op met Concierge.',
        importDescription: 'Kies welke velden je wilt koppelen aan je spreadsheet door op de vervolgkeuzelijst naast elke geïmporteerde kolom hieronder te klikken.',
        sizeNotMet: 'Bestandsgrootte moet groter zijn dan 0 bytes',
        invalidFileMessage:
            'Het bestand dat je hebt geüpload is leeg of bevat ongeldige gegevens. Zorg ervoor dat het bestand correct is opgemaakt en alle benodigde informatie bevat voordat je het opnieuw uploadt.',
        importSpreadsheetLibraryError: 'Kan spreadsheetmodule niet laden. Controleer je internetverbinding en probeer het opnieuw.',
        importSpreadsheet: 'Spreadsheet importeren',
        downloadCSV: 'CSV downloaden',
        importMemberConfirmation: () => ({
            one: `Bevestig hieronder de gegevens voor een nieuw werkruimtelid dat als onderdeel van deze upload wordt toegevoegd. Bestaande leden ontvangen geen rolupdates of uitnodigingsberichten.`,
            other: (count: number) =>
                `Bevestig hieronder de gegevens voor de ${count} nieuwe werkruimteleden die als onderdeel van deze upload worden toegevoegd. Bestaande leden ontvangen geen rolupdates of uitnodigingsberichten.`,
        }),
    },
    receipt: {
        upload: 'Bon uploaden',
        uploadMultiple: 'Bonnetjes uploaden',
        desktopSubtitleSingle: `of sleep het hierheen`,
        desktopSubtitleMultiple: `of ze hierheen slepen en neerzetten`,
        alternativeMethodsTitle: 'Andere manieren om bonnen toe te voegen:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">Download de app</a> om vanaf je telefoon te scannen</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Stuur bonnen door naar <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Voeg je nummer toe</a> om bonnetjes te sms'en naar ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Stuur bonnen via sms naar ${phoneNumber} (alleen Amerikaanse nummers)</label-text>`,
        takePhoto: 'Maak een foto',
        cameraAccess: 'Cameratoegang is vereist om foto’s van bonnen te maken.',
        deniedCameraAccess: `Toegang tot de camera is nog steeds niet verleend, volg <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">deze instructies</a>.`,
        cameraErrorTitle: 'Camerafout',
        cameraErrorMessage: 'Er is een fout opgetreden bij het maken van een foto. Probeer het opnieuw.',
        locationAccessTitle: 'Locatietoegang toestaan',
        locationAccessMessage: 'Locatietoegang helpt ons je tijdzone en valuta overal waar je bent nauwkeurig te houden.',
        locationErrorTitle: 'Locatietoegang toestaan',
        locationErrorMessage: 'Locatietoegang helpt ons je tijdzone en valuta overal waar je bent nauwkeurig te houden.',
        allowLocationFromSetting: `Locatietoegang helpt ons om je tijdzone en valuta overal waar je gaat nauwkeurig te houden. Sta locatietoegang toe in de machtigingsinstellingen van je apparaat.`,
        dropTitle: 'Laat het los',
        dropMessage: 'Zet je bestand hier neer',
        flash: 'flits',
        multiScan: 'multiscan',
        shutter: 'sluiter',
        gallery: 'galerij',
        deleteReceipt: 'Bon verwijderen',
        deleteConfirmation: 'Weet je zeker dat je deze bon wilt verwijderen?',
        addReceipt: 'Bon toevoegen',
        scanFailed: 'De bon kon niet worden gescand omdat er een leverancier, datum of bedrag ontbreekt.',
    },
    quickAction: {
        scanReceipt: 'Bon scannen',
        recordDistance: 'Afstand bijhouden',
        requestMoney: 'Uitgave aanmaken',
        perDiem: 'Dagvergoeding aanmaken',
        splitBill: 'Uitgave splitsen',
        splitScan: 'Bon splitsen',
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
        addSplit: 'Splitsing toevoegen',
        makeSplitsEven: 'Splits gelijk verdelen',
        editSplits: 'Splits bewerken',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Het totale bedrag is ${amount} hoger dan de oorspronkelijke uitgave.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Het totaalbedrag is ${amount} lager dan de oorspronkelijke uitgave.`,
        splitExpenseZeroAmount: 'Voer een geldig bedrag in voordat u doorgaat.',
        splitExpenseOneMoreSplit: 'Geen splits toegevoegd. Voeg er minstens één toe om op te slaan.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Wijzig ${amount} voor ${merchant}`,
        removeSplit: 'Splits verwijderen',
        splitExpenseCannotBeEditedModalTitle: 'Deze uitgave kan niet worden bewerkt',
        splitExpenseCannotBeEditedModalDescription: 'Goedgekeurde of betaalde onkostendeclaraties kunnen niet worden bewerkt',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Betaal ${name ?? 'iemand'}`,
        expense: 'Onkosten',
        categorize: 'Categoriseren',
        share: 'Delen',
        participants: 'Deelnemers',
        createExpense: 'Uitgave aanmaken',
        trackDistance: 'Afstand bijhouden',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `Maak ${expensesNumber} declaraties`,
        removeExpense: 'Uitgave verwijderen',
        removeThisExpense: 'Deze uitgave verwijderen',
        removeExpenseConfirmation: 'Weet je zeker dat je deze bon wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
        addExpense: 'Uitgave toevoegen',
        chooseRecipient: 'Ontvanger kiezen',
        createExpenseWithAmount: ({amount}: {amount: string}) => `${amount} uitgave aanmaken`,
        confirmDetails: 'Bevestig gegevens',
        pay: 'Betalen',
        cancelPayment: 'Betaling annuleren',
        cancelPaymentConfirmation: 'Weet je zeker dat je deze betaling wilt annuleren?',
        viewDetails: 'Details bekijken',
        pending: 'In behandeling',
        canceled: 'Geannuleerd',
        posted: 'Geboekt',
        deleteReceipt: 'Bon verwijderen',
        findExpense: 'Kosten zoeken',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `heeft een uitgave verwijderd (${amount} voor ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `heeft een uitgave verplaatst${reportName ? `van ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `heeft deze uitgave verplaatst${reportName ? `naar <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `heeft deze uitgave verplaatst${reportName ? `van <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedUnreportedTransaction: ({reportUrl}: MovedTransactionParams) => `heeft deze uitgave verplaatst uit je <a href="${reportUrl}">persoonlijke ruimte</a>`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `heeft deze uitgave naar je <a href="${reportUrl}">persoonlijke ruimte</a> verplaatst`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `heeft dit rapport verplaatst naar de werkruimte <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `heeft dit <a href="${movedReportUrl}">rapport</a> verplaatst naar de <a href="${newParentReportUrl}">${toPolicyName}</a>-werkruimte`;
        },
        pendingMatchWithCreditCard: 'Bon in afwachting van koppeling met kaarttransactie',
        pendingMatch: 'Wachtend op overeenkomst',
        pendingMatchWithCreditCardDescription: 'Bon wordt nog gekoppeld aan kaarttransactie. Markeer als contant om te annuleren.',
        markAsCash: 'Markeren als contant',
        routePending: 'Route in behandeling...',
        receiptScanning: () => ({
            one: 'Bonnetjes scannen...',
            other: 'Bonnetjes scannen...',
        }),
        scanMultipleReceipts: 'Meerdere bonnetjes scannen',
        scanMultipleReceiptsDescription: 'Maak in één keer foto’s van al je bonnetjes en bevestig vervolgens zelf de details, of laat ons het voor je doen.',
        receiptScanInProgress: 'Bon scannen bezig',
        receiptScanInProgressDescription: 'Bonnetjescan bezig. Kom later terug of voer de gegevens nu in.',
        removeFromReport: 'Verwijderen uit rapport',
        moveToPersonalSpace: 'Verplaats declaraties naar je persoonlijke ruimte',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? 'Potentiële dubbele uitgaven gevonden. Controleer de dubbelen om indiening mogelijk te maken.'
                : 'Mogelijke dubbele uitgaven geïdentificeerd. Controleer de dubbelen om goedkeuring in te schakelen.',
        receiptIssuesFound: () => ({
            one: 'Probleem gevonden',
            other: 'Problemen gevonden',
        }),
        fieldPending: 'In behandeling...',
        defaultRate: 'Standaardtarief',
        receiptMissingDetails: 'Bon ontbreekt gegevens',
        missingAmount: 'Ontbrekend bedrag',
        missingMerchant: 'Ontbrekende handelaar',
        receiptStatusTitle: 'Bezig met scannen…',
        receiptStatusText: 'Alleen jij kunt deze bon zien terwijl hij wordt gescand. Kom later terug of voer de gegevens nu in.',
        receiptScanningFailed: 'Scannen van bon is mislukt. Voer de gegevens handmatig in.',
        transactionPendingDescription: 'Transactie in behandeling. Het kan een paar dagen duren voordat deze wordt verwerkt.',
        companyInfo: 'Bedrijfsinformatie',
        companyInfoDescription: 'We hebben nog een paar gegevens nodig voordat je je eerste factuur kunt versturen.',
        yourCompanyName: 'Naam van uw bedrijf',
        yourCompanyWebsite: 'De website van uw bedrijf',
        yourCompanyWebsiteNote: 'Als u geen website hebt, kunt u in plaats daarvan het LinkedIn-profiel of een socialmediaprofiel van uw bedrijf opgeven.',
        invalidDomainError: 'U hebt een ongeldig domein ingevoerd. Voer een geldig domein in om door te gaan.',
        publicDomainError: 'U hebt een openbaar domein ingevoerd. Voer een privédomein in om door te gaan.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} worden gescand`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} in behandeling`);
            }
            return {
                one: statusText.length > 0 ? `1 uitgave (${statusText.join(', ')})` : `1 uitgave`,
                other: (count: number) => (statusText.length > 0 ? `${count} declaraties (${statusText.join(', ')})` : `${count} onkostendeclaraties`),
            };
        },
        expenseCount: () => {
            return {
                one: '1 uitgave',
                other: (count: number) => `${count} onkostendeclaraties`,
            };
        },
        deleteExpense: () => ({
            one: 'Uitgave verwijderen',
            other: 'Uitgaven verwijderen',
        }),
        deleteConfirmation: () => ({
            one: 'Weet je zeker dat je deze uitgave wilt verwijderen?',
            other: 'Weet je zeker dat je deze uitgaven wilt verwijderen?',
        }),
        deleteReport: 'Rapport verwijderen',
        deleteReportConfirmation: 'Weet je zeker dat je dit rapport wilt verwijderen?',
        settledExpensify: 'Betaald',
        done: 'Gereed',
        settledElsewhere: 'Elders betaald',
        individual: 'Individueel',
        business: 'Zakelijk',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Betaal ${formattedAmount} met Expensify` : `Betalen met Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Betaal ${formattedAmount} als persoon` : `Betalen met privérekening`),
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
        businessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `${amount} betaald met bankrekening ${last4Digits}` : `betaald met bankrekening ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            `betaald ${amount ? `${amount} ` : ''}met bankrekening ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimteregels</a>`,
        invoicePersonalBank: ({lastFour}: BankAccountLastFourParams) => `Persoonlijke rekening • ${lastFour}`,
        invoiceBusinessBank: ({lastFour}: BankAccountLastFourParams) => `Zakelijke rekening • ${lastFour}`,
        nextStep: 'Volgende stappen',
        finished: 'Voltooid',
        flip: 'Omdraaien',
        sendInvoice: ({amount}: RequestAmountParams) => `${amount} factuur verzenden`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `voor ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `ingediend${memo ? `met als notitie ${memo}` : ''}`,
        automaticallySubmitted: `ingediend via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">vertraagde indieningen</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `volgt ${formattedAmount}${comment ? `voor ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `splitsen ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `splitsen ${formattedAmount}${comment ? `voor ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Jouw deel ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} is ${amount}${comment ? `voor ${comment}` : ''} verschuldigd`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} is verschuldigd:`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}heeft ${amount} betaald`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} heeft betaald:`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} heeft ${amount} uitgegeven`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} heeft uitgegeven:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} goedgekeurd:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} heeft ${amount} goedgekeurd`,
        payerSettled: ({amount}: PayerSettledParams) => `betaald ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `${amount} betaald. Voeg een bankrekening toe om je betaling te ontvangen.`,
        automaticallyApproved: `goedgekeurd via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimteregels</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `goedgekeurd ${amount}`,
        approvedMessage: `Goedgekeurd`,
        unapproved: `niet goedgekeurd`,
        automaticallyForwarded: `goedgekeurd via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimteregels</a>`,
        forwarded: `Goedgekeurd`,
        rejectedThisReport: 'heeft dit rapport afgewezen',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `is gestart met betalen, maar wacht totdat ${submitterDisplayName} een bankrekening toevoegt.`,
        adminCanceledRequest: 'heeft de betaling geannuleerd',
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `heeft de betaling van ${amount} geannuleerd, omdat ${submitterDisplayName} hun Expensify Wallet niet binnen 30 dagen heeft geactiveerd`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} heeft een bankrekening toegevoegd. De betaling van ${amount} is gedaan.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}gemarkeerd als betaald`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}betaald met wallet`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''}betaald met Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimteregels</a>`,
        noReimbursableExpenses: 'Dit rapport heeft een ongeldig bedrag',
        pendingConversionMessage: 'Totaal wordt bijgewerkt zodra je weer online bent',
        changedTheExpense: 'heeft de uitgave gewijzigd',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `de ${valueName} naar ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `stel ${translatedChangedField} in op ${newMerchant}, waardoor het bedrag werd ingesteld op ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `de ${valueName} (voorheen ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `de ${valueName} naar ${newValueToDisplay} (voorheen ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `heeft ${translatedChangedField} gewijzigd in ${newMerchant} (voorheen ${oldMerchant}), waardoor het bedrag is bijgewerkt naar ${newAmountToDisplay} (voorheen ${oldAmountToDisplay})`,
        basedOnAI: 'op basis van eerdere activiteit',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `gebaseerd op <a href="${rulesLink}">werkruimteregels</a>` : 'op basis van de werkruimte­regel'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `voor ${comment}` : 'uitgave'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Factuurrapport nr. ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} verzonden${comment ? `voor ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `uitgave verplaatst van persoonlijke ruimte naar ${workspaceName ?? `chat met ${reportName}`}`,
        movedToPersonalSpace: 'uitgave verplaatst naar persoonlijke ruimte',
        tagSelection: ({policyTagListName}: TagSelectionParams = {}) => {
            const article = policyTagListName && StringUtils.startsWithVowel(policyTagListName) ? 'een' : 'a';
            const tag = policyTagListName ?? 'Label';
            return `Selecteer ${article} ${tag} om je uitgaven beter te organiseren.`;
        },
        categorySelection: 'Selecteer een categorie om je uitgaven beter te organiseren.',
        error: {
            invalidCategoryLength: 'De categorienaam is langer dan 255 tekens. Verkort de naam of kies een andere categorie.',
            invalidTagLength: 'De tagnaam overschrijdt 255 tekens. Maak de naam korter of kies een andere tag.',
            invalidAmount: 'Voer een geldig bedrag in voordat u doorgaat',
            invalidDistance: 'Voer een geldige afstand in voordat u verdergaat',
            invalidIntegerAmount: 'Voer een geheel dollarbedrag in voordat u verdergaat',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Maximale belastingbedrag is ${amount}`,
            invalidSplit: 'De som van de verdelingen moet gelijk zijn aan het totaalbedrag',
            invalidSplitParticipants: 'Voer een bedrag groter dan nul in voor minimaal twee deelnemers',
            invalidSplitYourself: 'Voer een bedrag ongelijk aan nul in voor uw splitsing',
            noParticipantSelected: 'Selecteer een deelnemer',
            other: 'Onverwachte fout. Probeer het later opnieuw.',
            genericCreateFailureMessage: 'Onverwachte fout bij het indienen van deze onkostendeclaratie. Probeer het later opnieuw.',
            genericCreateInvoiceFailureMessage: 'Onverwachte fout bij het verzenden van deze factuur. Probeer het later opnieuw.',
            genericHoldExpenseFailureMessage: 'Onverwachte fout bij het vasthouden van deze uitgave. Probeer het later opnieuw.',
            genericUnholdExpenseFailureMessage: 'Onverwachte fout bij het verwijderen van deze uitgave uit de wachtstand. Probeer het later opnieuw.',
            receiptDeleteFailureError: 'Onverwachte fout bij het verwijderen van deze bon. Probeer het later opnieuw.',
            receiptFailureMessage: '<rbr>Er is een fout opgetreden bij het uploaden van je bon. <a href="download">Sla de bon op</a> en <a href="retry">probeer het later opnieuw</a>.</rbr>',
            receiptFailureMessageShort: 'Er is een fout opgetreden bij het uploaden van je bon.',
            genericDeleteFailureMessage: 'Onverwachte fout bij het verwijderen van deze uitgave. Probeer het later opnieuw.',
            genericEditFailureMessage: 'Onverwachte fout bij het bewerken van deze uitgave. Probeer het later opnieuw.',
            genericSmartscanFailureMessage: 'Transactie mist velden',
            duplicateWaypointsErrorMessage: 'Verwijder dubbele routepunten alstublieft',
            atLeastTwoDifferentWaypoints: 'Voer minimaal twee verschillende adressen in',
            splitExpenseMultipleParticipantsErrorMessage: 'Een uitgave kan niet worden opgesplitst tussen een werkruimte en andere leden. Werk uw selectie bij.',
            invalidMerchant: 'Voer een geldige leverancier in',
            atLeastOneAttendee: 'Er moet ten minste één deelnemer worden geselecteerd',
            invalidQuantity: 'Voer een geldige hoeveelheid in',
            quantityGreaterThanZero: 'Hoeveelheid moet groter zijn dan nul',
            invalidSubrateLength: 'Er moet ten minste één subtarief zijn',
            invalidRate: 'Tarief niet geldig voor deze workspace. Selecteer een beschikbaar tarief uit de workspace.',
        },
        dismissReceiptError: 'Fout negeren',
        dismissReceiptErrorConfirmation: 'Let op! Als je deze foutmelding negeert, wordt je geüploade bon volledig verwijderd. Weet je het zeker?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `is begonnen met vereffenen. De betaling staat in de wacht totdat ${submitterDisplayName} zijn/haar wallet inschakelt.`,
        enableWallet: 'Wallet inschakelen',
        hold: 'In de wacht',
        unhold: 'Vasthouden opheffen',
        holdExpense: () => ({
            one: 'Uitgave vasthouden',
            other: 'Onkosten vasthouden',
        }),
        unholdExpense: 'Vastgehouden uitgave vrijgeven',
        heldExpense: 'hield deze uitgave',
        unheldExpense: 'deze uitgave vrijgegeven',
        moveUnreportedExpense: 'Niet-gerapporteerde uitgave verplaatsen',
        addUnreportedExpense: 'Niet-gerapporteerde uitgave toevoegen',
        selectUnreportedExpense: 'Selecteer ten minste één uitgave om aan het rapport toe te voegen.',
        emptyStateUnreportedExpenseTitle: 'Geen niet-gerapporteerde uitgaven',
        emptyStateUnreportedExpenseSubtitle: 'Het lijkt erop dat je geen niet-gerapporteerde uitgaven hebt. Probeer er hieronder een aan te maken.',
        addUnreportedExpenseConfirm: 'Toevoegen aan rapport',
        newReport: 'Nieuw rapport',
        explainHold: () => ({
            one: 'Leg uit waarom je deze uitgave tegenhoudt.',
            other: 'Leg uit waarom je deze uitgaven vasthoudt.',
        }),
        retracted: 'ingetrokken',
        retract: 'Intrekken',
        reopened: 'Heropend',
        reopenReport: 'Rapport heropenen',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Dit rapport is al geëxporteerd naar ${connectionName}. Het wijzigen ervan kan tot gegevensafwijkingen leiden. Weet je zeker dat je dit rapport opnieuw wilt openen?`,
        reason: 'Reden',
        holdReasonRequired: 'Een reden is vereist bij het vasthouden.',
        expenseWasPutOnHold: 'Uitgave is in de wacht gezet',
        expenseOnHold: 'Deze declaratie is gepauzeerd. Bekijk de opmerkingen voor de vervolgstappen.',
        expensesOnHold: 'Alle onkosten zijn in de wacht gezet. Controleer de opmerkingen voor de volgende stappen.',
        expenseDuplicate: 'Deze uitgave heeft vergelijkbare details als een andere. Controleer de duplicaten om verder te gaan.',
        someDuplicatesArePaid: 'Sommige van deze duplicaten zijn al goedgekeurd of betaald.',
        reviewDuplicates: 'Duplicaten beoordelen',
        keepAll: 'Alles behouden',
        confirmApprove: 'Bevestig goedkeuringsbedrag',
        confirmApprovalAmount: 'Keur alleen conforme onkosten goed, of keur het volledige rapport goed.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Deze uitgave staat in de wacht. Wil je toch goedkeuren?',
            other: 'Deze onkosten staan in de wacht. Wil je ze toch goedkeuren?',
        }),
        confirmPay: 'Betalingsbedrag bevestigen',
        confirmPayAmount: 'Betaal wat niet in de wacht staat, of betaal het volledige rapport.',
        confirmPayAllHoldAmount: () => ({
            one: 'Deze uitgave staat in de wacht. Wil je toch betalen?',
            other: 'Deze uitgaven staan in de wacht. Wil je toch betalen?',
        }),
        payOnly: 'Alleen betalen',
        approveOnly: 'Alleen goedkeuren',
        holdEducationalTitle: 'Moet je deze uitgave tegenhouden?',
        whatIsHoldExplain: 'Plaatsen in de wacht is alsof je op “pauze” drukt voor een uitgave tot je klaar bent om deze in te dienen.',
        holdIsLeftBehind: 'In afwachting geplaatste uitgaven worden overgeslagen, zelfs als je een volledig rapport indient.',
        unholdWhenReady: 'Maak de uitgaven vrij zodra je klaar bent om ze in te dienen.',
        changePolicyEducational: {
            title: 'Je hebt dit rapport verplaatst!',
            description: 'Controleer deze items nogmaals; deze hebben de neiging te veranderen wanneer rapporten naar een nieuwe werkruimte worden verplaatst.',
            reCategorize: '<strong>Categoriseer eventuele uitgaven opnieuw</strong> om te voldoen aan de werkruimteregels.',
            workflows: 'Dit rapport kan nu onderworpen zijn aan een ander <strong>goedkeuringsproces.</strong>',
        },
        changeWorkspace: 'Werkruimte wijzigen',
        set: 'instellen',
        changed: 'Gewijzigd',
        removed: 'Verwijderd',
        transactionPending: 'Transactie in behandeling.',
        chooseARate: 'Selecteer een werkruimte-vergoedingstarief per mijl of kilometer',
        unapprove: 'Goedkeuring intrekken',
        unapproveReport: 'Goedkeuring rapport intrekken',
        headsUp: 'Let op!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Dit rapport is al geëxporteerd naar ${accountingIntegration}. Dit wijzigen kan tot gegevensverschillen leiden. Weet je zeker dat je de goedkeuring van dit rapport wilt intrekken?`,
        reimbursable: 'vergoedbaar',
        nonReimbursable: 'niet-declarabel',
        bookingPending: 'Deze boeking is in behandeling',
        bookingPendingDescription: 'Deze boeking is in behandeling omdat deze nog niet is betaald.',
        bookingArchived: 'Deze boeking is gearchiveerd',
        bookingArchivedDescription: 'Deze boeking is gearchiveerd omdat de reisdatum is verstreken. Voeg indien nodig een uitgave toe voor het definitieve bedrag.',
        attendees: 'Deelnemers',
        whoIsYourAccountant: 'Wie is uw boekhouder?',
        paymentComplete: 'Betaling voltooid',
        time: 'Tijd',
        startDate: 'Startdatum',
        endDate: 'Einddatum',
        startTime: 'Starttijd',
        endTime: 'Eindtijd',
        deleteSubrate: 'Subtarief verwijderen',
        deleteSubrateConfirmation: 'Weet je zeker dat je deze subrate wilt verwijderen?',
        quantity: 'Aantal',
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
            one: `Reis: 1 volledige dag`,
            other: (count: number) => `Reis: ${count} volledige dagen`,
        }),
        dates: 'Datums',
        rates: 'Tarieven',
        submitsTo: ({name}: SubmitsToParams) => `Dient in bij ${name}`,
        reject: {
            educationalTitle: 'Moet je vasthouden of afwijzen?',
            educationalText: 'Als je nog niet klaar bent om een uitgave goed te keuren of te betalen, kun je deze in de wacht zetten of afwijzen.',
            holdExpenseTitle: 'Een uitgave inhouden om vóór goedkeuring of betaling om meer details te vragen.',
            approveExpenseTitle: 'Keur andere onkosten goed terwijl vastgehouden onkosten aan jou toegewezen blijven.',
            heldExpenseLeftBehindTitle: 'Uitgestelde declaraties worden achtergelaten wanneer je een volledig rapport goedkeurt.',
            rejectExpenseTitle: 'Wijs een onkostenpost af die je niet van plan bent goed te keuren of te betalen.',
            reasonPageTitle: 'Declaratie afwijzen',
            reasonPageDescription: 'Leg uit waarom u deze uitgave afkeurt.',
            rejectReason: 'Reden voor afwijzing',
            markAsResolved: 'Markeren als opgelost',
            rejectedStatus: 'Deze uitgave is afgewezen. We wachten erop dat jij de problemen oplost en deze als opgelost markeert om indienen mogelijk te maken.',
            reportActions: {
                rejectedExpense: 'heeft deze onkostendeclaratie afgewezen',
                markedAsResolved: 'heeft de afwijsreden als opgelost gemarkeerd',
            },
        },
        moveExpenses: () => ({one: 'Uitgave verplaatsen', other: 'Onkosten verplaatsen'}),
        changeApprover: {
            title: 'Goedkeurder wijzigen',
            subtitle: 'Kies een optie om de fiatteur voor dit rapport te wijzigen.',
            description: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `U kunt de fiatteur ook permanent wijzigen voor alle rapporten in uw <a href="${workflowSettingLink}">workflowinstellingen</a>.`,
            changedApproverMessage: ({managerID}: ChangedApproverMessageParams) => `de fiatteur gewijzigd in <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Fiatteur toevoegen',
                addApproverSubtitle: 'Voeg een extra fiatteur toe aan de bestaande workflow.',
                bypassApprovers: 'Approvers omzeilen',
                bypassApproversSubtitle: 'Wijs jezelf aan als eindgoedkeurder en sla alle resterende goedkeurders over.',
            },
            addApprover: {
                subtitle: 'Kies een extra fiatteur voor dit rapport voordat we het door de rest van de goedkeuringsworkflow sturen.',
            },
        },
        chooseWorkspace: 'Kies een workspace',
    },
    transactionMerge: {
        listPage: {
            header: 'Uitgaven samenvoegen',
            noEligibleExpenseFound: 'Geen in aanmerking komende uitgaven gevonden',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Je hebt geen uitgaven die met deze kunnen worden samengevoegd. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Meer informatie</a> over in aanmerking komende uitgaven.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Selecteer een <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">in aanmerking komende uitgave</a> om samen te voegen met <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: 'Bon selecteren',
            pageTitle: 'Selecteer de bon die je wilt behouden:',
        },
        detailsPage: {
            header: 'Details selecteren',
            pageTitle: 'Selecteer de details die je wilt behouden:',
            noDifferences: 'Geen verschillen gevonden tussen de transacties',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? 'een' : 'a';
                return `Selecteer alsjeblieft ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Selecteer aanwezigen',
            selectAllDetailsError: 'Selecteer alle details voordat je verdergaat.',
        },
        confirmationPage: {
            header: 'Bevestig gegevens',
            pageTitle: 'Bevestig de gegevens die je bewaart. De gegevens die je niet bewaart, worden verwijderd.',
            confirmButton: 'Uitgaven samenvoegen',
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
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: 'Verborgen',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Het nummer is niet gevalideerd. Klik op de knop om de validatielink opnieuw via sms te verzenden.',
        emailHasNotBeenValidated: 'Het e-mailadres is nog niet gevalideerd. Klik op de knop om de validatielink opnieuw via sms te versturen.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Foto uploaden',
        removePhoto: 'Foto verwijderen',
        editImage: 'Foto bewerken',
        viewPhoto: 'Foto bekijken',
        imageUploadFailed: 'Upload van afbeelding mislukt',
        deleteWorkspaceError: 'Sorry, er is een onverwacht probleem opgetreden bij het verwijderen van je werkruimte-avatar',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `De geselecteerde afbeelding overschrijdt de maximale uploadgrootte van ${maxUploadSizeInMB} MB.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Upload een afbeelding die groter is dan ${minHeightInPx}x${minWidthInPx} pixels en kleiner dan ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `Profielfoto moet een van de volgende typen zijn: ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: 'Profielfoto bewerken',
        upload: 'Uploaden',
        uploadPhoto: 'Foto uploaden',
        selectAvatar: 'Avatar selecteren',
        choosePresetAvatar: 'Of kies een aangepaste avatar',
    },
    modal: {
        backdropLabel: 'Modale achtergrond',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> onkosten toevoegt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> uitgaven toevoegt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder onkosten toevoegt.`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Geen verdere actie vereist!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
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
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jouw</strong> declaraties automatisch worden ingediend${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot de onkostendeclaraties van <strong>${actor}</strong> automatisch worden ingediend${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten totdat de onkostendeclaraties van een beheerder automatisch worden ingediend${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> het/de probleem(en) oplost.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> het/de probleem(en) oplost.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder het probleem/de problemen oplost.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten op <strong>jou</strong> om onkosten goed te keuren.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten op goedkeuring van onkosten door <strong>${actor}</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten op goedkeuring van onkostendeclaraties door een beheerder.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten op <strong>jou</strong> om dit rapport te exporteren.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> dit rapport exporteert.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten op een beheerder om dit rapport te exporteren.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten op <strong>jou</strong> om onkosten te betalen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> de onkosten betaalt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder de onkosten betaalt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> klaar bent met het instellen van een zakelijke bankrekening.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> klaar is met het instellen van een zakelijke bankrekening.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder het instellen van een zakelijke bankrekening heeft afgerond.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `voor ${eta}` : ` ${eta}`;
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
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: 'aan het einde van uw reis',
        },
    },
    profilePage: {
        profile: 'Profiel',
        preferredPronouns: 'Voorkeursvoornaamwoorden',
        selectYourPronouns: 'Selecteer je voornaamwoorden',
        selfSelectYourPronoun: 'Selecteer je voornaamwoord',
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
        subtitle: 'Schakel tweefactorauthenticatie in om je account veilig te houden.',
        goToSecurity: 'Ga terug naar beveiligingspagina',
    },
    shareCodePage: {
        title: 'Je code',
        subtitle: 'Nodig leden uit voor Expensify door je persoonlijke QR-code of verwijzingslink te delen.',
    },
    pronounsPage: {
        pronouns: 'Voornaamwoorden',
        isShownOnProfile: 'Je voornaamwoorden worden weergegeven op je profiel.',
        placeholderText: 'Zoeken om opties te zien',
    },
    contacts: {
        contactMethods: 'Contactmethoden',
        featureRequiresValidate: 'Voor deze functie moet u uw account verifiëren.',
        validateAccount: 'Valideer uw account',
        helpText: ({email}: {email: string}) =>
            `Voeg meer manieren toe om in te loggen en bonnen naar Expensify te sturen.<br/><br/>Voeg een e-mailadres toe om bonnen door te sturen naar <a href="mailto:${email}">${email}</a> of voeg een telefoonnummer toe om bonnen te sms’en naar 47777 (alleen Amerikaanse nummers).`,
        pleaseVerify: 'Verifieer deze contactmethode.',
        getInTouch: 'We gebruiken deze methode om contact met je op te nemen.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `Voer de magische code in die naar ${contactMethod} is gestuurd. Deze zou binnen een of twee minuten moeten aankomen.`,
        setAsDefault: 'Instellen als standaard',
        yourDefaultContactMethod:
            'Dit is je huidige standaardcontactmethode. Voordat je deze kunt verwijderen, moet je een andere contactmethode kiezen en op “Als standaard instellen” klikken.',
        removeContactMethod: 'Contactmethode verwijderen',
        removeAreYouSure: 'Weet je zeker dat je deze contactmethode wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
        failedNewContact: 'Toevoegen van deze contactmethode is mislukt.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Het verzenden van een nieuwe magische code is mislukt. Wacht even en probeer het opnieuw.',
            validateSecondaryLogin: 'Onjuiste of ongeldige magische code. Probeer het opnieuw of vraag een nieuwe code aan.',
            deleteContactMethod: 'Verwijderen van contactmethode mislukt. Neem contact op met Concierge voor hulp.',
            setDefaultContactMethod: 'Het is niet gelukt om een nieuwe standaardcontactmethode in te stellen. Neem contact op met Concierge voor hulp.',
            addContactMethod: 'Toevoegen van deze contactmethode is mislukt. Neem contact op met Concierge voor hulp.',
            enteredMethodIsAlreadySubmitted: 'Deze contactmethode bestaat al',
            passwordRequired: 'Wachtwoord vereist.',
            contactMethodRequired: 'Contactmethode is verplicht',
            invalidContactMethod: 'Ongeldige contactmethode',
        },
        newContactMethod: 'Nieuwe contactmethode',
        goBackContactMethods: 'Ga terug naar contactmethoden',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Bedrijf / Bedrijven',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Hij / Hem / Zijn',
        heHimHisTheyThemTheirs: 'Hij / Hem / Zijn / Zij / Hen / Hun',
        sheHerHers: 'Zij / Haar / Hare',
        sheHerHersTheyThemTheirs: 'Zij / Haar / Haar / Hen / Hen / Hun',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Persoon',
        theyThemTheirs: 'Die / Hen / Hens',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'U / Uw',
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
        getLocationAutomatically: 'Bepaal je locatie automatisch',
    },
    updateRequiredView: {
        updateRequired: 'Update vereist',
        pleaseInstall: 'Werk bij naar de nieuwste versie van New Expensify',
        pleaseInstallExpensifyClassic: 'Installeer de nieuwste versie van Expensify',
        toGetLatestChanges: 'Voor mobiel of desktop: download en installeer de nieuwste versie. Voor web: ververs je browser.',
        newAppNotAvailable: 'De nieuwe Expensify-app is niet meer beschikbaar.',
    },
    initialSettingsPage: {
        about: 'Over',
        aboutPage: {
            description: 'De nieuwe Expensify-app is gebouwd door een community van open-sourcontwikkelaars van over de hele wereld. Help ons de toekomst van Expensify te bouwen.',
            appDownloadLinks: 'Links om de app te downloaden',
            viewKeyboardShortcuts: 'Toetsencombinaties bekijken',
            viewTheCode: 'Code bekijken',
            viewOpenJobs: 'Openstaande vacatures bekijken',
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
            viewConsole: 'Debugconsole weergeven',
            debugConsole: 'Debugconsole',
            description:
                '<muted-text>Gebruik de onderstaande tools om problemen met de Expensify-ervaring op te lossen. Als je problemen tegenkomt, <concierge-link>dien dan een bug in</concierge-link>.</muted-text>',
            confirmResetDescription: 'Alle niet-verzonden conceptberichten gaan verloren, maar de rest van je gegevens is veilig.',
            resetAndRefresh: 'Opnieuw instellen en vernieuwen',
            clientSideLogging: 'Logging aan clientzijde',
            noLogsToShare: 'Geen logs om te delen',
            useProfiling: 'Profiling gebruiken',
            profileTrace: 'Profieltracering',
            results: 'Resultaten',
            releaseOptions: 'Release-opties',
            testingPreferences: 'Testvoorkeuren',
            useStagingServer: 'Stagingserver gebruiken',
            forceOffline: 'Offline forceren',
            simulatePoorConnection: 'Slechte internetverbinding simuleren',
            simulateFailingNetworkRequests: 'Netwerkaanvragen mislukking simuleren',
            authenticationStatus: 'Authenticatiestatus',
            deviceCredentials: 'Apparaatreferenties',
            invalidate: 'Ongeldig maken',
            destroy: 'Vernietigen',
            maskExportOnyxStateData: 'Masker kwetsbare ledendata bij het exporteren van Onyx-status',
            exportOnyxState: 'Onyx-status exporteren',
            importOnyxState: 'Onyx-status importeren',
            testCrash: 'Testcrash',
            resetToOriginalState: 'Terugzetten naar oorspronkelijke staat',
            usingImportedState: 'Je gebruikt geïmporteerde status. Druk hier om deze te wissen.',
            debugMode: 'Debugmodus',
            invalidFile: 'Ongeldige file',
            invalidFileDescription: 'Het bestand dat u probeert te importeren is ongeldig. Probeer het opnieuw.',
            invalidateWithDelay: 'Ongeldig maken met vertraging',
            recordTroubleshootData: 'Probleemoplossingsgegevens vastleggen',
            softKillTheApp: 'App zacht afsluiten',
            kill: 'Beëindigen',
        },
        debugConsole: {
            saveLog: 'Log opslaan',
            shareLog: 'Log delen',
            enterCommand: 'Voer opdracht in',
            execute: 'Uitvoeren',
            noLogsAvailable: 'Geen logs beschikbaar',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `Loggrootte overschrijdt de limiet van ${size} MB. Gebruik alstublieft "Log opslaan" om het logbestand in plaats daarvan te downloaden.`,
            logs: 'Logboeken',
            viewConsole: 'Console weergeven',
        },
        security: 'Beveiliging',
        signOut: 'Afmelden',
        restoreStashed: 'Opgeslagen login herstellen',
        signOutConfirmationText: 'Als je je afmeldt, gaan alle offline aangebrachte wijzigingen verloren.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Lees de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Servicevoorwaarden</a> en het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacybeleid</a>.</muted-text-micro>`,
        help: 'Help',
        whatIsNew: 'Wat is er nieuw',
        accountSettings: 'Accountinstellingen',
        account: 'Account',
        general: 'Algemeen',
    },
    closeAccountPage: {
        // @context close as a verb, not an adjective
        closeAccount: 'Account sluiten',
        reasonForLeavingPrompt: 'We zouden het jammer vinden als je vertrekt! Wil je ons alsjeblieft vertellen waarom, zodat we ons kunnen verbeteren?',
        enterMessageHere: 'Voer hier een bericht in',
        closeAccountWarning: 'Het sluiten van je account kan niet ongedaan worden gemaakt.',
        closeAccountPermanentlyDeleteData: 'Weet je zeker dat je je account wilt verwijderen? Hiermee worden alle openstaande onkosten permanent verwijderd.',
        enterDefaultContactToConfirm: 'Voer uw standaardcontactmethode in om te bevestigen dat u uw account wilt sluiten. Uw standaardcontactmethode is:',
        enterDefaultContact: 'Voer uw standaard contactmethode in',
        defaultContact: 'Standaardcontactmethode:',
        enterYourDefaultContactMethod: 'Voer uw standaard contactmethode in om uw account te sluiten.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Accounts samenvoegen',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Voer de account in die je wilt samenvoegen met <strong>${login}</strong>.`,
            notReversibleConsent: 'Ik begrijp dat dit niet ongedaan kan worden gemaakt',
        },
        accountValidate: {
            confirmMerge: 'Weet je zeker dat je accounts wilt samenvoegen?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `Het samenvoegen van je accounts is onomkeerbaar en leidt tot het verlies van alle niet-ingediende uitgaven voor <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Om door te gaan, voer de magische code in die is verzonden naar <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Onjuiste of ongeldige magische code. Probeer het opnieuw of vraag een nieuwe code aan.',
                fallback: 'Er is iets misgegaan. Probeer het later opnieuw.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Accounts samengevoegd!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Je hebt alle gegevens van <strong>${from}</strong> succesvol samengevoegd met <strong>${to}</strong>. Vanaf nu kun je voor deze account een van beide logins gebruiken.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'We zijn ermee bezig',
            limitedSupport: 'We ondersteunen het samenvoegen van accounts nog niet in New Expensify. Voer deze actie in plaats daarvan uit in Expensify Classic.',
            reachOutForHelp: '<muted-text><centered-text>Neem gerust contact op met <concierge-link>Concierge</concierge-link> als je vragen hebt!</centered-text></muted-text>',
            goToExpensifyClassic: 'Ga naar Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet samenvoegen omdat het wordt beheerd door <strong>${email.split('@').at(1) ?? ''}</strong>. Neem <concierge-link>contact op met Concierge</concierge-link> voor hulp.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet met andere accounts samenvoegen, omdat je domeinbeheerder deze als je primaire login heeft ingesteld. Voeg in plaats daarvan andere accounts ermee samen.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Je kunt geen accounts samenvoegen omdat voor <strong>${email}</strong> verificatie in twee stappen (2FA) is ingeschakeld. Schakel 2FA voor <strong>${email}</strong> uit en probeer het opnieuw.</centered-text></muted-text>`,
            learnMore: 'Meer informatie over het samenvoegen van accounts.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet samenvoegen omdat het is vergrendeld. Neem contact op met <concierge-link>Concierge</concierge-link> voor hulp.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Je kunt geen accounts samenvoegen omdat <strong>${email}</strong> geen Expensify-account heeft. <a href="${contactMethodLink}">Voeg het in plaats daarvan toe als een contactmethode</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet samenvoegen met andere accounts. Voeg in plaats daarvan andere accounts ermee samen.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt geen accounts samenvoegen in <strong>${email}</strong> omdat dit account eigenaar is van een gefactureerde factureringsrelatie.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Probeer het later opnieuw',
            description: 'Er zijn te veel pogingen gedaan om accounts samen te voegen. Probeer het later opnieuw.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Je kunt niet samenvoegen met andere accounts omdat deze niet is gevalideerd. Valideer de account en probeer het opnieuw.',
        },
        mergeFailureSelfMerge: {
            description: 'Je kunt een account niet met zichzelf samenvoegen.',
        },
        mergeFailureGenericHeading: 'Kan accounts niet samenvoegen',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Vermoedelijke activiteit rapporteren',
        lockAccount: 'Account vergrendelen',
        unlockAccount: 'Account ontgrendelen',
        compromisedDescription:
            'Is je account je iets vreemds opgevallen? Dit melden zorgt er direct voor dat je account wordt vergrendeld, nieuwe transacties met de Expensify Card worden geblokkeerd en wijzigingen aan het account worden voorkomen.',
        domainAdminsDescription: 'Voor domeinbeheerders: Dit pauzeert ook alle Expensify Card-activiteit en beheerdersacties binnen uw domein(en).',
        areYouSure: 'Weet je zeker dat je je Expensify-account wilt vergrendelen?',
        onceLocked: 'Zodra je account is vergrendeld, wordt deze beperkt totdat er een deblokkeringsverzoek is ingediend en een beveiligingscontrole is uitgevoerd',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Account vergrendelen mislukt',
        failedToLockAccountDescription: `We konden je account niet vergrendelen. Chat alsjeblieft met Concierge om dit probleem op te lossen.`,
        chatWithConcierge: 'Chatten met Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Account vergrendeld',
        yourAccountIsLocked: 'Uw account is geblokkeerd',
        chatToConciergeToUnlock: 'Chat met Concierge om beveiligingsproblemen op te lossen en je account te ontgrendelen.',
        chatWithConcierge: 'Chatten met Concierge',
    },
    passwordPage: {
        changePassword: 'Wachtwoord wijzigen',
        changingYourPasswordPrompt: 'Als je je wachtwoord wijzigt, wordt je wachtwoord bijgewerkt voor zowel je Expensify.com‑ als je New Expensify‑account.',
        currentPassword: 'Huidig wachtwoord',
        newPassword: 'Nieuw wachtwoord',
        newPasswordPrompt: 'Uw nieuwe wachtwoord moet anders zijn dan uw oude wachtwoord en minimaal 8 tekens, 1 hoofdletter, 1 kleine letter en 1 cijfer bevatten.',
    },
    twoFactorAuth: {
        headerTitle: 'Twee-factor-authenticatie',
        twoFactorAuthEnabled: 'Authenticatie in twee stappen ingeschakeld',
        whatIsTwoFactorAuth:
            'Authenticatie in twee stappen (2FA) helpt uw account veilig te houden. Bij het inloggen moet u een code invoeren die is gegenereerd door uw voorkeursauthenticator-app.',
        disableTwoFactorAuth: 'Tweefactorauthenticatie uitschakelen',
        explainProcessToRemove: 'Om tweestapsverificatie (2FA) uit te schakelen, voer een geldige code in uit je authenticatie-app.',
        explainProcessToRemoveWithRecovery: 'Voer een geldige herstelsleutel in om tweefactorauthenticatie (2FA) uit te schakelen.',
        disabled: 'Tweeledige verificatie is nu uitgeschakeld',
        noAuthenticatorApp: 'Je hebt geen authenticator-app meer nodig om in te loggen bij Expensify.',
        stepCodes: 'Herstelcodes',
        keepCodesSafe: 'Bewaar deze herstelcodes goed!',
        codesLoseAccess: dedent(`
            Als je de toegang tot je authenticator-app verliest en deze codes niet hebt, verlies je de toegang tot je account.

            Opmerking: Het instellen van tweefactorauthenticatie zal je uitloggen bij alle andere actieve sessies.
        `),
        errorStepCodes: 'Kopieer of download de codes voordat je doorgaat',
        stepVerify: 'Verifiëren',
        scanCode: 'Scan de QR-code met je',
        authenticatorApp: 'authenticator-app',
        addKey: 'Of voeg deze geheime sleutel toe aan je authenticator-app:',
        enterCode: 'Voer vervolgens de zescijferige code in die is gegenereerd door je authenticator-app.',
        stepSuccess: 'Voltooid',
        enabled: 'Authenticatie in twee stappen ingeschakeld',
        congrats: 'Gefeliciteerd! Nu heb je die extra beveiliging.',
        copy: 'Kopiëren',
        disable: 'Uitschakelen',
        enableTwoFactorAuth: 'Twee-factor-authenticatie inschakelen',
        pleaseEnableTwoFactorAuth: 'Schakel twee-factor-authenticatie in.',
        twoFactorAuthIsRequiredDescription: 'Om veiligheidsredenen vereist Xero tweeledige verificatie om de integratie te verbinden.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Authenticatie in twee stappen vereist',
        twoFactorAuthIsRequiredForAdminsTitle: 'Schakel alsjeblieft tweefactorauthenticatie in',
        twoFactorAuthIsRequiredXero: 'Voor uw Xero-boekhoudkoppeling is tweefactorauthenticatie vereist. Schakel dit in om Expensify te blijven gebruiken.',
        twoFactorAuthIsRequiredCompany: 'Uw bedrijf vereist het gebruik van tweefactorauthenticatie. Schakel dit in om Expensify te blijven gebruiken.',
        twoFactorAuthCannotDisable: 'Kan 2FA niet uitschakelen',
        twoFactorAuthRequired: 'Tweeledige verificatie (2FA) is vereist voor je Xero-verbinding en kan niet worden uitgeschakeld.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Voer uw herstelcode in',
            incorrectRecoveryCode: 'Onjuiste herstelcode. Probeer het opnieuw.',
        },
        useRecoveryCode: 'Herstelcode gebruiken',
        recoveryCode: 'Herstelcode',
        use2fa: 'Gebruik code voor tweeledige verificatie',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Voer uw tweeledige verificatiecode in',
            incorrect2fa: 'Onjuiste code voor tweeledige verificatie. Probeer het opnieuw.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Wachtwoord bijgewerkt!',
        allSet: 'Je bent helemaal klaar. Bewaar je nieuwe wachtwoord goed.',
    },
    privateNotes: {
        title: 'Privénotities',
        personalNoteMessage: 'Maak aantekeningen over deze chat hier. Jij bent de enige die deze aantekeningen kan toevoegen, bewerken of bekijken.',
        sharedNoteMessage: 'Maak hier notities over deze chat. Expensify-medewerkers en andere leden met het team.expensify.com-domein kunnen deze notities bekijken.',
        composerLabel: 'Notities',
        myNote: 'Mijn notitie',
        error: {
            genericFailureMessage: 'Privénotities konden niet worden opgeslagen',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Voer een geldige beveiligingscode in',
        },
        securityCode: 'Beveiligingscode',
        changeBillingCurrency: 'Factureringsvaluta wijzigen',
        changePaymentCurrency: 'Betalingsvaluta wijzigen',
        paymentCurrency: 'Betaalvaluta',
        paymentCurrencyDescription: 'Selecteer een gestandaardiseerde valuta waarnaar alle persoonlijke uitgaven moeten worden omgerekend',
        note: `Opmerking: Het wijzigen van uw betalingsvaluta kan invloed hebben op hoeveel u voor Expensify betaalt. Raadpleeg onze <a href="${CONST.PRICING}">prijspagina</a> voor alle details.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Debitcard toevoegen',
        nameOnCard: 'Naam op kaart',
        debitCardNumber: 'Debetkaartnummer',
        expiration: 'Vervaldatum',
        expirationDate: 'MMJJ',
        cvv: 'CVV',
        billingAddress: 'Factuuradres',
        growlMessageOnSave: 'Je debetkaart is succesvol toegevoegd',
        expensifyPassword: 'Expensify-wachtwoord',
        error: {
            invalidName: 'Naam mag alleen letters bevatten',
            addressZipCode: 'Voer een geldige postcode in',
            debitCardNumber: 'Voer een geldig debetkaartnummer in',
            expirationDate: 'Selecteer een geldige vervaldatum',
            securityCode: 'Voer een geldige beveiligingscode in',
            addressStreet: 'Voer een geldig factuuradres in dat geen postbus is',
            addressState: 'Selecteer een staat',
            addressCity: 'Voer een stad in',
            genericFailureMessage: 'Er is een fout opgetreden bij het toevoegen van je kaart. Probeer het opnieuw.',
            password: 'Voer uw Expensify-wachtwoord in',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Betalingskaart toevoegen',
        nameOnCard: 'Naam op kaart',
        paymentCardNumber: 'Kaartnummer',
        expiration: 'Vervaldatum',
        expirationDate: 'MM/JJ',
        cvv: 'CVV',
        billingAddress: 'Factuuradres',
        growlMessageOnSave: 'Je betaalkaart is succesvol toegevoegd',
        expensifyPassword: 'Expensify-wachtwoord',
        error: {
            invalidName: 'Naam mag alleen letters bevatten',
            addressZipCode: 'Voer een geldige postcode in',
            paymentCardNumber: 'Voer een geldig kaartnummer in',
            expirationDate: 'Selecteer een geldige vervaldatum',
            securityCode: 'Voer een geldige beveiligingscode in',
            addressStreet: 'Voer een geldig factuuradres in dat geen postbus is',
            addressState: 'Selecteer een staat',
            addressCity: 'Voer een stad in',
            genericFailureMessage: 'Er is een fout opgetreden bij het toevoegen van je kaart. Probeer het opnieuw.',
            password: 'Voer uw Expensify-wachtwoord in',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Betaalmethoden',
        setDefaultConfirmation: 'Als standaardbetaalmethode instellen',
        setDefaultSuccess: 'Standaardbetaalmethode ingesteld!',
        deleteAccount: 'Account verwijderen',
        deleteConfirmation: 'Weet je zeker dat je dit account wilt verwijderen?',
        error: {
            notOwnerOfBankAccount: 'Er is een fout opgetreden bij het instellen van deze bankrekening als je standaardbetaalmethode',
            invalidBankAccount: 'Deze bankrekening is tijdelijk opgeschort',
            notOwnerOfFund: 'Er is een fout opgetreden bij het instellen van deze kaart als je standaardbetaalmethode',
            setDefaultFailure: 'Er is iets misgegaan. Chat met Concierge voor verdere hulp.',
        },
        addBankAccountFailure: 'Er is een onverwachte fout opgetreden bij het toevoegen van je bankrekening. Probeer het opnieuw.',
        getPaidFaster: 'Sneller betaald krijgen',
        addPaymentMethod: 'Voeg een betaalmethode toe om rechtstreeks in de app betalingen te verzenden en te ontvangen.',
        getPaidBackFaster: 'Word sneller terugbetaald',
        secureAccessToYourMoney: 'Beveiligde toegang tot je geld',
        receiveMoney: 'Ontvang geld in je lokale valuta',
        expensifyWallet: 'Expensify Wallet (Bèta)',
        sendAndReceiveMoney: 'Verstuur en ontvang geld met vrienden. Alleen voor Amerikaanse bankrekeningen.',
        enableWallet: 'Wallet inschakelen',
        addBankAccountToSendAndReceive: 'Voeg een bankrekening toe om betalingen te doen of te ontvangen.',
        addDebitOrCreditCard: 'Debet- of creditcard toevoegen',
        assignedCards: 'Toegewezen kaarten',
        assignedCardsDescription: 'Dit zijn kaarten die door een werkruim­tebeheerder zijn toegewezen om de uitgaven van het bedrijf te beheren.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'We controleren je gegevens. Kom over een paar minuten terug!',
        walletActivationFailed: 'Helaas kan je wallet op dit moment niet worden ingeschakeld. Chat alsjeblieft met Concierge voor verdere hulp.',
        addYourBankAccount: 'Voeg uw bankrekening toe',
        addBankAccountBody: 'Laten we je bankrekening koppelen aan Expensify, zodat het makkelijker dan ooit wordt om direct in de app betalingen te verzenden en te ontvangen.',
        chooseYourBankAccount: 'Kies je bankrekening',
        chooseAccountBody: 'Zorg ervoor dat je de juiste selecteert.',
        confirmYourBankAccount: 'Bevestig je bankrekening',
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
                `Je kunt tot ${formattedLimit} uitgeven met deze kaart, en de limiet wordt opnieuw ingesteld zodra je ingediende uitgaven zijn goedgekeurd.`,
        },
        fixedLimit: {
            name: 'Vast limiet',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Je kunt tot ${formattedLimit} uitgeven met deze kaart, daarna wordt deze gedeactiveerd.`,
        },
        monthlyLimit: {
            name: 'Maandelijkse limiet',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Je kunt tot ${formattedLimit} per maand uitgeven met deze kaart. De limiet wordt op de 1e dag van elke kalendermaand opnieuw ingesteld.`,
        },
        virtualCardNumber: 'Virtueel kaartnummer',
        travelCardCvv: 'CVV-reiskaart',
        physicalCardNumber: 'Nummer fysieke kaart',
        physicalCardPin: 'Pincode',
        getPhysicalCard: 'Fysieke kaart aanvragen',
        reportFraud: 'Virtuele kaartfraude melden',
        reportTravelFraud: 'Reisbetaalkaartfraude melden',
        reviewTransaction: 'Transactie beoordelen',
        suspiciousBannerTitle: 'Verdachte transactie',
        suspiciousBannerDescription: 'We hebben verdachte transacties op uw kaart opgemerkt. Tik hieronder om ze te bekijken.',
        cardLocked: 'Je kaart is tijdelijk geblokkeerd terwijl ons team het account van je bedrijf controleert.',
        cardDetails: {
            cardNumber: 'Virtueel kaartnummer',
            expiration: 'Vervaldatum',
            cvv: 'CVV',
            address: 'Adres',
            revealDetails: 'Details weergeven',
            revealCvv: 'CVV weergeven',
            copyCardNumber: 'Kaartnummer kopiëren',
            updateAddress: 'Adres bijwerken',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Toegevoegd aan ${platform}-wallet`,
        cardDetailsLoadingFailure: 'Er is een fout opgetreden bij het laden van de kaartgegevens. Controleer je internetverbinding en probeer het opnieuw.',
        validateCardTitle: 'Laten we bevestigen dat jij het bent',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Voer de magische code in die is verzonden naar ${contactMethod} om je kaartgegevens te bekijken. Deze zou binnen een tot twee minuten moeten aankomen.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) =>
            `Voeg alsjeblieft <a href="${missingDetailsLink}">je persoonlijke gegevens toe</a> en probeer het daarna opnieuw.`,
        unexpectedError: 'Er is een fout opgetreden bij het ophalen van je Expensify-kaartgegevens. Probeer het opnieuw.',
        cardFraudAlert: {
            confirmButtonText: 'Ja, dat doe ik',
            reportFraudButtonText: 'Nee, dat was ik niet',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `heeft de verdachte activiteit gewist en kaart x${cardLastFour} opnieuw geactiveerd. Helemaal klaar om weer te declareren!`,
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
            }) => `verdachte activiteit vastgesteld op kaart eindigend op ${cardLastFour}. Herken je deze afschrijving?

${amount} voor ${merchant} - ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Uitgaven',
        workflowDescription: 'Configureer een workflow vanaf het moment dat de uitgave plaatsvindt, inclusief goedkeuring en betaling.',
        submissionFrequency: 'Indieningsfrequentie',
        submissionFrequencyDescription: 'Kies een aangepast schema voor het indienen van onkostendeclaraties.',
        submissionFrequencyDateOfMonth: 'Datum van de maand',
        disableApprovalPromptDescription: 'Het uitschakelen van goedkeuringen verwijdert alle bestaande goedkeuringsworkflows.',
        addApprovalsTitle: 'Goedkeuringen toevoegen',
        addApprovalButton: 'Goedkeuringsworkflow toevoegen',
        addApprovalTip: 'Deze standaardworkflow is van toepassing op alle leden, tenzij er een specifiekere workflow bestaat.',
        approver: 'Fiatteur',
        addApprovalsDescription: 'Extra goedkeuring vereisen voordat een betaling wordt geautoriseerd.',
        makeOrTrackPaymentsTitle: 'Betalingen uitvoeren of bijhouden',
        makeOrTrackPaymentsDescription: 'Voeg een gemachtigde betaler toe voor betalingen die in Expensify worden gedaan, of volg betalingen die elders worden gedaan.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Een aangepast goedkeuringsproces is ingeschakeld voor deze workspace. Neem contact op met uw <account-manager-link>Accountmanager</account-manager-link> of <concierge-link>Concierge</concierge-link> om dit proces te bekijken of te wijzigen.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Er is een aangepast goedkeuringsworkflow ingeschakeld voor deze workspace. Neem contact op met <concierge-link>Concierge</concierge-link> om deze workflow te bekijken of te wijzigen.</muted-text-label>',
        editor: {
            submissionFrequency: 'Kies hoe lang Expensify moet wachten voordat foutloze uitgaven worden gedeeld.',
        },
        frequencyDescription: 'Kies hoe vaak je onkosten automatisch wilt indienen, of maak het handmatig',
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
                two: 'en',
                few: 'e',
                other: 'e',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Eerste',
                '2': 'Seconde',
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
        approverInMultipleWorkflows: 'Dit lid behoort al tot een andere goedkeuringsworkflow. Alle wijzigingen die je hier aanbrengt, worden daar ook doorgevoerd.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> keurt al rapporten goed voor <strong>${name2}</strong>. Kies een andere goedkeurder om een cirkelvormige workflow te voorkomen.`,
        emptyContent: {
            title: 'Geen leden om weer te geven',
            expensesFromSubtitle: 'Alle werkruimteleden behoren al tot een bestaande goedkeuringsworkflow.',
            approverSubtitle: 'Alle fiatteurs behoren tot een bestaand workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'De verzendfrequentie kon niet worden gewijzigd. Probeer het opnieuw of neem contact op met support.',
        monthlyOffsetErrorMessage: 'De maandelijkse frequentie kon niet worden gewijzigd. Probeer het opnieuw of neem contact op met de ondersteuning.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Bevestigen',
        header: 'Voeg meer goedkeurders toe en bevestig.',
        additionalApprover: 'Extra fiatteur',
        submitButton: 'Workflow toevoegen',
    },
    workflowsEditApprovalsPage: {
        title: 'Goedkeuringsworkflow bewerken',
        deleteTitle: 'Goedkeuringsworkflow verwijderen',
        deletePrompt: 'Weet je zeker dat je deze goedkeuringsworkflow wilt verwijderen? Alle leden zullen daarna de standaardworkflow volgen.',
    },
    workflowsExpensesFromPage: {
        title: 'Uitgaven vanaf',
        header: 'Wanneer de volgende leden onkosten indienen:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'De fiatteur kon niet worden gewijzigd. Probeer het opnieuw of neem contact op met support.',
        header: 'Verzenden naar dit lid voor goedkeuring:',
    },
    workflowsPayerPage: {
        title: 'Gemachtigde betaler',
        genericErrorMessage: 'De bevoegde betaler kon niet worden gewijzigd. Probeer het opnieuw.',
        admins: 'Beheerders',
        payer: 'Betaler',
        paymentAccount: 'Betaalrekening',
    },
    reportFraudPage: {
        title: 'Virtuele kaartfraude melden',
        description:
            'Als de gegevens van je virtuele kaart zijn gestolen of gecompromitteerd, deactiveren we je bestaande kaart permanent en geven we je een nieuwe virtuele kaart met een nieuw nummer.',
        deactivateCard: 'Kaart deactiveren',
        reportVirtualCardFraud: 'Virtuele kaartfraude melden',
    },
    reportFraudConfirmationPage: {
        title: 'Creditcardfraude gemeld',
        description: 'We hebben je bestaande kaart permanent gedeactiveerd. Wanneer je teruggaat om je kaartgegevens te bekijken, is er een nieuwe virtuele kaart beschikbaar.',
        buttonText: 'Begrepen, bedankt!',
    },
    activateCardPage: {
        activateCard: 'Kaart activeren',
        pleaseEnterLastFour: 'Voer de laatste vier cijfers van je kaart in.',
        activatePhysicalCard: 'Fysieke kaart activeren',
        error: {
            thatDidNotMatch: 'Dat kwam niet overeen met de laatste 4 cijfers van je kaart. Probeer het opnieuw.',
            throttled:
                'Je hebt de laatste 4 cijfers van je Expensify Card te vaak onjuist ingevoerd. Als je zeker weet dat de cijfers kloppen, neem dan contact op met Concierge om dit op te lossen. Probeer het anders later opnieuw.',
        },
    },
    getPhysicalCard: {
        header: 'Fysieke kaart aanvragen',
        nameMessage: 'Voer je voor- en achternaam in, zoals deze op je kaart wordt weergegeven.',
        legalName: 'Juridische naam',
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
        confirmMessage: 'Bevestig hieronder je gegevens.',
        estimatedDeliveryMessage: 'Je fysieke kaart wordt binnen 2-3 werkdagen bezorgd.',
        next: 'Volgende',
        getPhysicalCard: 'Fysieke kaart aanvragen',
        shipCard: 'Kaart verzenden',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Overboeken${amount ? ` ${amount}` : ''}`,
        instant: 'Onmiddellijk (betaalpas)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% kosten (${minAmount} minimum)`,
        ach: '1-3 werkdagen (bankrekening)',
        achSummary: 'Geen kosten',
        whichAccount: 'Welke account?',
        fee: 'Kosten',
        transferSuccess: 'Overboeking geslaagd!',
        transferDetailBankAccount: 'Je geld zou binnen 1–3 werkdagen moeten aankomen.',
        transferDetailDebitCard: 'Je geld zou direct moeten aankomen.',
        failedTransfer: 'Je saldo is nog niet volledig vereffend. Maak alstublieft een overboeking naar een bankrekening.',
        notHereSubTitle: 'Gelieve uw saldo over te maken vanaf de portemonneepagina',
        goToWallet: 'Ga naar Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Account kiezen',
    },
    paymentMethodList: {
        addPaymentMethod: 'Betaalmethode toevoegen',
        addNewDebitCard: 'Nieuwe debetkaart toevoegen',
        addNewBankAccount: 'Nieuwe bankrekening toevoegen',
        accountLastFour: 'Eindigend op',
        cardLastFour: 'Kaart eindigend op',
        addFirstPaymentMethod: 'Voeg een betaalmethode toe om rechtstreeks in de app betalingen te verzenden en te ontvangen.',
        defaultPaymentMethod: 'Standaard',
        bankAccountLastFour: ({lastFour}: BankAccountLastFourParams) => `Bankrekening • ${lastFour}`,
    },
    preferencesPage: {
        appSection: {
            title: 'App-voorkeuren',
        },
        testSection: {
            title: 'Testvoorkeuren',
            subtitle: 'Instellingen om te helpen bij het debuggen en testen van de app op staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Ontvang relevante functiemeldingen en Expensify-nieuws',
        muteAllSounds: 'Alle geluiden van Expensify dempen',
    },
    priorityModePage: {
        priorityMode: 'Prioriteitsmodus',
        explainerText: 'Kies of je je wilt #focus-en op alleen ongelezen en vastgezette chats, of alles wilt weergeven met de meest recente en vastgezette chats bovenaan.',
        priorityModes: {
            default: {
                label: 'Meest recent',
                description: 'Alle chats weergeven, gesorteerd op meest recent',
            },
            gsd: {
                label: '#focus',
                description: 'Alleen ongelezen alfabetisch sorteren',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
        generatingPDF: 'PDF genereren...',
        waitForPDF: 'Even geduld terwijl we de pdf genereren',
        errorPDF: 'Er is een fout opgetreden bij het genereren van je pdf',
    },
    reportDescriptionPage: {
        roomDescription: 'Kamerbeschrijving',
        roomDescriptionOptional: 'Kamerbeschrijving (optioneel)',
        explainerText: 'Stel een aangepaste beschrijving voor de ruimte in.',
    },
    groupChat: {
        lastMemberTitle: 'Let op!',
        lastMemberWarning: 'Omdat jij de laatste persoon hier bent, wordt deze chat onbereikbaar voor alle leden als je vertrekt. Weet je zeker dat je wilt vertrekken?',
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
        terms: `<muted-text-xs>Door in te loggen, ga je akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Servicevoorwaarden</a> en het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacybeleid</a>.</muted-text-xs>`,
        license: `<muted-text-xs>Geldtransmissie wordt aangeboden door ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) overeenkomstig zijn <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenties</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Geen magische code ontvangen?',
        enterAuthenticatorCode: 'Voer uw authenticatiecode in',
        enterRecoveryCode: 'Voer uw herstelcode in',
        requiredWhen2FAEnabled: 'Vereist wanneer 2FA is ingeschakeld',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Vraag een nieuwe code aan over <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Nieuwe code aanvragen',
        error: {
            pleaseFillMagicCode: 'Voer uw magische code in',
            incorrectMagicCode: 'Onjuiste of ongeldige magische code. Probeer het opnieuw of vraag een nieuwe code aan.',
            pleaseFillTwoFactorAuth: 'Voer uw tweeledige verificatiecode in',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Vul alle velden in',
        pleaseFillPassword: 'Voer uw wachtwoord in',
        pleaseFillTwoFactorAuth: 'Voer uw tweestapsverificatiecode in',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Voer je tweeledige verificatiecode in om door te gaan',
        forgot: 'Vergeten?',
        requiredWhen2FAEnabled: 'Vereist wanneer 2FA is ingeschakeld',
        error: {
            incorrectPassword: 'Onjuist wachtwoord. Probeer het opnieuw.',
            incorrectLoginOrPassword: 'Onjuiste gebruikersnaam of wachtwoord. Probeer het opnieuw.',
            incorrect2fa: 'Onjuiste code voor tweeledige verificatie. Probeer het opnieuw.',
            twoFactorAuthenticationEnabled: 'Je hebt 2FA ingeschakeld op dit account. Meld je aan met je e-mailadres of telefoonnummer.',
            invalidLoginOrPassword: 'Ongeldige login of wachtwoord. Probeer het opnieuw of reset uw wachtwoord.',
            unableToResetPassword:
                'We konden je wachtwoord niet wijzigen. Dit komt waarschijnlijk door een verlopen wachtwoordherstelslink in een oude wachtwoordherstel-e-mail. We hebben je een nieuwe link gemaild zodat je het opnieuw kunt proberen. Controleer je inbox en je spammap; de e-mail zou binnen enkele minuten moeten arriveren.',
            noAccess: 'Je hebt geen toegang tot deze applicatie. Voeg je GitHub-gebruikersnaam toe om toegang te krijgen.',
            accountLocked: 'Je account is vergrendeld na te veel mislukte pogingen. Probeer het over 1 uur opnieuw.',
            fallback: 'Er is iets misgegaan. Probeer het later opnieuw.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefoon of e‑mail',
        error: {
            invalidFormatEmailLogin: 'Het ingevoerde e-mailadres is ongeldig. Corrigeer het formaat en probeer het opnieuw.',
        },
        cannotGetAccountDetails: 'Accountgegevens ophalen is mislukt. Probeer opnieuw in te loggen.',
        loginForm: 'Aanmeldingsformulier',
        notYou: ({user}: NotYouParams) => `Niet ${user}?`,
    },
    onboarding: {
        welcome: 'Welkom!',
        welcomeSignOffTitleManageTeam: 'Zodra je de bovenstaande taken hebt voltooid, kunnen we meer functionaliteit verkennen, zoals goedkeuringsworkflows en regels!',
        welcomeSignOffTitle: 'Het is geweldig om je te ontmoeten!',
        explanationModal: {
            title: 'Welkom bij Expensify',
            description:
                'Eén app om je zakelijke en persoonlijke uitgaven razendsnel te beheren, zo snel als chat. Probeer het uit en laat ons weten wat je ervan vindt. Er komt nog veel meer aan!',
            secondaryDescription: 'Om terug te schakelen naar Expensify Classic, tik je gewoon op je profielfoto > Ga naar Expensify Classic.',
        },
        getStarted: 'Aan de slag',
        whatsYourName: 'Wat is jouw naam?',
        peopleYouMayKnow: 'Mensen die je misschien kent, zijn er al! Bevestig je e-mailadres om je bij hen aan te sluiten.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Iemand van ${domain} heeft al een workspace gemaakt. Voer de magische code in die is verzonden naar ${email}.`,
        joinAWorkspace: 'Een workspace joinen',
        listOfWorkspaces: 'Hier is de lijst met werkruimtes waaraan je kunt deelnemen. Geen zorgen, je kunt je er later altijd nog bij aansluiten als je dat liever hebt.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} lid${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Waar werk je?',
        errorSelection: 'Selecteer een optie om verder te gaan',
        purpose: {
            title: 'Wat wil je vandaag doen?',
            errorContinue: 'Druk op Doorgaan om de installatie te voltooien',
            errorBackButton: 'Beantwoord eerst de instellingsvragen om de app te kunnen gebruiken',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Terugbetaald worden door mijn werkgever',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Beheer de uitgaven van mijn team',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Uitgaven bijhouden en budgetteren',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chatten en uitgaven delen met vrienden',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Iets anders',
        },
        employees: {
            title: 'Hoeveel werknemers hebt u?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1–10 medewerkers',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 medewerkers',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 medewerkers',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1.000 medewerkers',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Meer dan 1.000 werknemers',
        },
        accounting: {
            title: 'Gebruikt u boekhoudsoftware?',
            none: 'Geen',
        },
        interestedFeatures: {
            title: 'In welke functies ben je geïnteresseerd?',
            featuresAlreadyEnabled: 'Hier zijn onze populairste functies:',
            featureYouMayBeInterestedIn: 'Extra functies inschakelen:',
        },
        error: {
            requiredFirstName: 'Voer uw voornaam in om verder te gaan',
        },
        workEmail: {
            title: 'Wat is je werkmailadres?',
            subtitle: 'Expensify werkt het beste wanneer je je werk-e-mailadres koppelt.',
            explanationModal: {
                descriptionOne: 'Doorsturen naar receipts@expensify.com voor scannen',
                descriptionTwo: 'Sluit je aan bij je collega’s die Expensify al gebruiken',
                descriptionThree: 'Geniet van een meer gepersonaliseerde ervaring',
            },
            addWorkEmail: 'Werkmail toevoegen',
        },
        workEmailValidation: {
            title: 'Verifieer uw zakelijke e-mail',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Voer de magische code in die is verzonden naar ${workEmail}. Deze zou binnen één of twee minuten moeten aankomen.`,
        },
        workEmailValidationError: {
            publicEmail: 'Voer een geldig werk-e-mailadres in van een privé-domein, bijv. mitch@company.com',
            offline: 'We kunnen je werk-e-mailadres niet toevoegen omdat je offline lijkt te zijn',
        },
        mergeBlockScreen: {
            title: 'Werk-e-mailadres kon niet worden toegevoegd',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) => `We konden ${workEmail} niet toevoegen. Probeer het later opnieuw in Instellingen of chat met Concierge voor hulp.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Maak een [testrit](${testDriveURL})`,
                description: ({testDriveURL}) => `[Maak een korte producttour](${testDriveURL}) om te zien waarom Expensify de snelste manier is om je onkosten te regelen.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Maak een [testrit](${testDriveURL})`,
                description: ({testDriveURL}) => `Maak met ons een [testrit](${testDriveURL}) en geef je team *3 gratis maanden Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Uitgaven goedkeuringen toevoegen',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Voeg onkostengoedkeuringen toe* om de uitgaven van je team te beoordelen en onder controle te houden.

                        Dit doe je zo:

                        1. Ga naar *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *More features*.
                        4. Schakel *Workflows* in.
                        5. Ga naar *Workflows* in de workspace-editor.
                        6. Schakel *Add approvals* in.
                        7. Jij wordt ingesteld als de onkostengoedkeurder. Je kunt dit wijzigen naar elke beheerder zodra je je team hebt uitgenodigd.

                        [Breng me naar meer functies](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Maak](${workspaceConfirmationLink}) een workspace`,
                description: 'Maak een workspace aan en configureer de instellingen met hulp van je set-upspecialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Maak een [werkruimte](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Maak een workspace* om uitgaven bij te houden, bonnetjes te scannen, te chatten en meer.

                        1. Klik op *Workspaces* > *Nieuwe workspace*.

                        *Je nieuwe workspace is klaar!* [Bekijk hem](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[Categories](${workspaceCategoriesLink}) instellen`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Stel categorieën in* zodat je team uitgaven kan coderen voor eenvoudige rapportage.

                        1. Klik op *Workspaces*.
                        3. Selecteer je workspace.
                        4. Klik op *Categories*.
                        5. Schakel alle categorieën uit die je niet nodig hebt.
                        6. Voeg je eigen categorieën toe rechtsboven.

                        [Ga naar de categorie-instellingen van de workspace](${workspaceCategoriesLink}).

                        ![Stel categorieën in](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Een uitgave indienen',
                description: dedent(`
                    *Dien een uitgave in* door een bedrag in te voeren of een bon te scannen.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Uitgave maken*.
                    3. Voer een bedrag in of scan een bon.
                    4. Voeg het e-mailadres of telefoonnummer van je baas toe.
                    5. Klik op *Maken*.

                    En dan ben je klaar!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Een uitgave indienen',
                description: dedent(`
                    *Dien een uitgave in* door een bedrag in te voeren of een bon te scannen.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Uitgave maken*.
                    3. Voer een bedrag in of scan een bon.
                    4. Bevestig de details.
                    5. Klik op *Maken*.

                    En je bent klaar!
                `),
            },
            trackExpenseTask: {
                title: 'Een uitgave bijhouden',
                description: dedent(`
                    *Volg een uitgave* in welke valuta dan ook, of je nu een bon hebt of niet.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Uitgave aanmaken*.
                    3. Voer een bedrag in of scan een bon.
                    4. Kies je *persoonlijke* ruimte.
                    5. Klik op *Aanmaken*.

                    En klaar! Ja, zo eenvoudig is het.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Verbinden${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'naar'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'jouw' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Verbind ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'jouw' : 'naar'} ${integrationName} voor automatische kosten­codering en synchronisatie, zodat de maandafsluiting een fluitje van een cent wordt.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *Accounting*.
                        4. Zoek ${integrationName}.
                        5. Klik op *Connect*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? dedent(`[Breng me naar boekhouding](${workspaceAccountingLink}).

                                      ![Verbinding maken met ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`)
        : `[Breng me naar boekhouding](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Koppel [je bedrijfskaarten](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Verbind de kaarten die je al hebt voor automatische import van transacties, bonnetjes matchen en afstemming.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *Company cards*.
                        4. Volg de aanwijzingen om je kaarten te koppelen.

                        [Ga naar Company cards](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Nodig [je team](${workspaceMembersLink}) uit`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Nodig je team uit* voor Expensify zodat ze vandaag nog kunnen beginnen met het bijhouden van uitgaven.

                        1. Klik op *Workspaces*.
                        3. Selecteer je workspace.
                        4. Klik op *Members* > *Invite member*.
                        5. Voer e-mails of telefoonnummers in.
                        6. Voeg een aangepast uitnodigingsbericht toe als je dat wilt!

                        [Breng me naar de workspace-leden](${workspaceMembersLink}).

                        ![Nodig je team uit](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Stel [categorieën](${workspaceCategoriesLink}) en [tags](${workspaceTagsLink}) in`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Stel categorieën en labels in* zodat je team onkosten kan coderen voor eenvoudige rapportage.

                        Importeer ze automatisch door [je boekhoudsoftware te koppelen](${workspaceAccountingLink}), of stel ze handmatig in via je [werkruimte-instellingen](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Stel [tags](${workspaceTagsLink}) in`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Gebruik tags om extra details aan onkosten toe te voegen, zoals projecten, klanten, locaties en afdelingen. Als je meerdere niveaus van tags nodig hebt, kun je upgraden naar het Control-abonnement.

                        1. Klik op *Workspaces*.
                        3. Selecteer je workspace.
                        4. Klik op *More features*.
                        5. Schakel *Tags* in.
                        6. Ga naar *Tags* in de workspace-editor.
                        7. Klik op *+ Add tag* om je eigen tag te maken.

                        [Breng me naar more features](${workspaceMoreFeaturesLink}).

                        ![Tags instellen](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Nodig uw [boekhouder](${workspaceMembersLink}) uit`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Nodig je accountant uit* om samen te werken in je workspace en je zakelijke uitgaven te beheren.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *Members*.
                        4. Klik op *Invite member*.
                        5. Voer het e-mailadres van je accountant in.

                        [Nodig je accountant nu uit](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Start een chat',
                description: dedent(`
                    *Begin een chat* met iedereen via hun e‑mail of telefoonnummer.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Chat starten*.
                    3. Voer een e‑mailadres of telefoonnummer in.

                    Als ze Expensify nog niet gebruiken, worden ze automatisch uitgenodigd.

                    Elke chat wordt ook omgezet in een e‑mail of sms waar ze direct op kunnen reageren.
                `),
            },
            splitExpenseTask: {
                title: 'Een uitgave splitsen',
                description: dedent(`
                    *Splits kosten* met één of meer personen.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Chat starten*.
                    3. Voer e-mails of telefoonnummers in.
                    4. Klik op de grijze *+*-knop in de chat > *Kosten splitsen*.
                    5. Maak de uitgave aan door *Handmatig*, *Scan* of *Afstand* te selecteren.

                    Voeg gerust meer details toe als je wilt, of verstuur het gewoon direct. Zo krijg je je geld snel terug!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Controleer uw [werkruimte-instellingen](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Zo kun je je workspace-instellingen bekijken en bijwerken:
                        1. Klik op Workspaces.
                        2. Selecteer je workspace.
                        3. Bekijk en werk je instellingen bij.
                        [Ga naar je workspace.](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: 'Maak je eerste rapport',
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
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Maak een [testrit](${testDriveURL})` : 'Maak een proefrit'),
            embeddedDemoIframeTitle: 'Proefrit',
            employeeFakeReceipt: {
                description: 'Mijn testritbon!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Terugbetaald worden is net zo eenvoudig als het versturen van een bericht. Laten we de basis doornemen.',
            onboardingPersonalSpendMessage: 'Hier leest u hoe u uw uitgaven in een paar klikken kunt bijhouden.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Je gratis proefperiode is gestart! Laten we je instellen.
                        👋 Hoi, ik ben je Expensify-installatiespecialist. Ik heb al een workspace aangemaakt om de bonnen en uitgaven van je team te beheren. Volg de overige onderstaande stappen om alles in te stellen en het meeste uit je gratis proefperiode van 30 dagen te halen!
                    `)
                    : dedent(`
                        # Je gratis proefperiode is gestart! Laten we je instellen.
                        👋 Hoi, ik ben je Expensify-installatiespecialist. Nu je een workspace hebt gemaakt, haal je het meeste uit je gratis proefperiode van 30 dagen door de onderstaande stappen te volgen!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Laten we je instellen\n👋 Hoi, ik ben je Expensify-configuratiespecialist. Ik heb al een workspace aangemaakt om je bonnetjes en uitgaven te beheren. Volg de laatste configuratiestappen hieronder om het meeste uit je gratis proefperiode van 30 dagen te halen!',
            onboardingChatSplitMessage: 'Rekeningen splitsen met vrienden is net zo eenvoudig als het versturen van een bericht. Zo werkt het.',
            onboardingAdminMessage: 'Leer hoe je als beheerder de werkruimte van je team beheert en je eigen declaraties indient.',
            onboardingLookingAroundMessage:
                'Expensify staat vooral bekend om het beheren van onkostendeclaraties, reizen en zakelijke kaarten, maar we doen veel meer dan dat. Laat me weten waar je interesse in hebt, dan help ik je op weg.',
            onboardingTestDriveReceiverMessage: '*Je krijgt 3 maanden gratis! Ga hieronder aan de slag.*',
        },
        workspace: {
            title: 'Blijf georganiseerd met een werkruimte',
            subtitle: 'Ontgrendel krachtige tools om je onkostenbeheer te vereenvoudigen, allemaal op één plek. Met een workspace kun je:',
            explanationModal: {
                descriptionOne: 'Bonnetjes bijhouden en ordenen',
                descriptionTwo: 'Categoriseer en tag onkosten',
                descriptionThree: 'Rapporten maken en delen',
            },
            price: 'Probeer het 30 dagen gratis uit en upgrade daarna voor slechts <strong>$5/gebruiker/maand</strong>.',
            createWorkspace: 'Werkruimte maken',
        },
        confirmWorkspace: {
            title: 'Workspace bevestigen',
            subtitle: 'Maak een workspace om bonnen bij te houden, uitgaven te vergoeden, reizen te beheren, rapporten te maken en meer — allemaal met de snelheid van chat.',
        },
        inviteMembers: {
            title: 'Leden uitnodigen',
            subtitle: 'Voeg je team toe of nodig je accountant uit. Hoe meer zielen, hoe meer vreugd!',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Dit niet meer weergeven',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Naam mag de woorden Expensify of Concierge niet bevatten',
            hasInvalidCharacter: 'Naam mag geen komma of puntkomma bevatten',
            requiredFirstName: 'Voornaam mag niet leeg zijn',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Wat is uw officiële naam?',
        enterDateOfBirth: 'Wat is je geboortedatum?',
        enterAddress: 'Wat is je adres?',
        enterPhoneNumber: 'Wat is je telefoonnummer?',
        personalDetails: 'Persoonlijke gegevens',
        privateDataMessage: 'Deze gegevens worden gebruikt voor reizen en betalingen. Ze worden nooit getoond op je openbare profiel.',
        legalName: 'Juridische naam',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Wettelijke achternaam',
        address: 'Adres',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `Datum moet vóór ${dateString} liggen`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `Datum moet na ${dateString} zijn`,
            hasInvalidCharacter: 'Naam mag alleen Latijnse tekens bevatten',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Onjuiste postcode-indeling${zipFormat ? `Acceptabel formaat: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Zorg ervoor dat het telefoonnummer geldig is (bijv. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link is opnieuw verzonden',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `Ik heb een magische aanmeldingslink naar ${login} gestuurd. Controleer je ${loginType} om je aan te melden.`,
        resendLink: 'Link opnieuw verzenden',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Om ${secondaryLogin} te valideren, stuur de magische code dan opnieuw vanuit de Accountinstellingen van ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Als je geen toegang meer hebt tot ${primaryLogin}, koppel dan je accounts los.`,
        unlink: 'Link ontkoppelen',
        linkSent: 'Link verzonden!',
        successfullyUnlinkedLogin: 'Secundaire login is succesvol ontkoppeld!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Onze e-mailprovider heeft e-mails naar ${login} tijdelijk geblokkeerd wegens afleveringsproblemen. Volg deze stappen om je login te deblokkeren:`,
        confirmThat: ({login}: ConfirmThatParams) =>
            `<strong>Bevestig dat ${login} correct is gespeld en een echt, bezorgbaar e-mailadres is.</strong> E-mailaliassen zoals "expenses@domain.com" moeten toegang hebben tot hun eigen e-mailinbox om een geldige Expensify-login te zijn.`,
        ensureYourEmailClient: `<strong>Zorg ervoor dat je e-mailclient e-mails van expensify.com toestaat.</strong> Je vindt instructies over hoe je deze stap voltooit <a href="${CONST.SET_NOTIFICATION_LINK}">hier</a>, maar mogelijk heb je de hulp van je IT-afdeling nodig om je e-mailinstellingen te configureren.`,
        onceTheAbove: `Zodra de bovenstaande stappen zijn voltooid, neem dan contact op met <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> om je login te deblokkeren.`,
    },
    openAppFailureModal: {
        title: 'Er is iets misgegaan...',
        subtitle: `We hebben niet al je gegevens kunnen laden. We zijn hiervan op de hoogte gesteld en onderzoeken het probleem. Als dit blijft gebeuren, neem dan contact op met`,
        refreshAndTryAgain: 'Vernieuw en probeer het opnieuw',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `We kunnen geen sms-berichten afleveren aan ${login}, daarom is dit tijdelijk gepauzeerd. Probeer je nummer te valideren:`,
        validationSuccess: 'Je nummer is gevalideerd! Klik hieronder om een nieuwe magische inlogcode te versturen.',
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
                return 'Wacht even voordat je het opnieuw probeert.';
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
            return `Blijf even geduld hebben! Je moet ${timeText} wachten voordat je opnieuw probeert je nummer te valideren.`;
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
        addToGroup: 'Aan groep toevoegen',
    },
    yearPickerPage: {
        year: 'Jaar',
        selectYear: 'Selecteer een jaar',
    },
    focusModeUpdateModal: {
        title: 'Welkom bij de #focus-modus!',
        prompt: ({priorityModePageUrl}: FocusModeUpdateParams) =>
            `Blijf alles bijhouden door alleen ongelezen chats of chats die je aandacht nodig hebben te bekijken. Geen zorgen, je kunt dit op elk moment wijzigen in de <a href="${priorityModePageUrl}">instellingen</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'De chat die je zoekt, kan niet worden gevonden.',
        getMeOutOfHere: 'Haal me hier weg',
        iouReportNotFound: 'De betalingsgegevens waar je naar zoekt, kunnen niet worden gevonden.',
        notHere: 'Hmm... het is er niet',
        pageNotFound: 'Oeps, deze pagina kan niet worden gevonden',
        noAccess: 'Deze chat of uitgave is mogelijk verwijderd of je hebt er geen toegang toe.\n\nVoor vragen kun je contact opnemen met concierge@expensify.com',
        goBackHome: 'Ga terug naar de startpagina',
        commentYouLookingForCannotBeFound: 'De opmerking die je zoekt, kan niet worden gevonden.',
        goToChatInstead: 'Ga in plaats daarvan naar de chat.',
        contactConcierge: 'Voor vragen kunt u contact opnemen met concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Oeps... ${isBreakLine ? '\n' : ''}Er is iets misgegaan`,
        subtitle: 'Uw verzoek kon niet worden voltooid. Probeer het later opnieuw.',
        wrongTypeSubtitle: 'Die zoekopdracht is ongeldig. Probeer je zoekcriteria aan te passen.',
    },
    setPasswordPage: {
        enterPassword: 'Voer een wachtwoord in',
        setPassword: 'Wachtwoord instellen',
        newPasswordPrompt: 'Je wachtwoord moet minstens 8 tekens, 1 hoofdletter, 1 kleine letter en 1 cijfer bevatten.',
        passwordFormTitle: 'Welkom terug bij de New Expensify! Stel alsjeblieft je wachtwoord in.',
        passwordNotSet: 'We konden je nieuwe wachtwoord niet instellen. We hebben je een nieuwe link voor het wachtwoord gestuurd om het opnieuw te proberen.',
        setPasswordLinkInvalid: 'Deze link om een wachtwoord in te stellen is ongeldig of verlopen. Er wacht een nieuwe op je in je e-mailinbox!',
        validateAccount: 'Account verifiëren',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Voeg een emoji toe zodat je collega’s en vrienden makkelijk kunnen zien wat er aan de hand is. Je kunt er ook nog een bericht bij zetten!',
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
        whenClearStatus: 'Wanneer moeten we jouw status wissen?',
        vacationDelegate: 'Vakantievertegenwoordiger',
        setVacationDelegate: `Stel een vervangende goedkeurder in om rapporten namens jou goed te keuren terwijl je afwezig bent.`,
        vacationDelegateError: 'Er is een fout opgetreden bij het bijwerken van je vervanger tijdens vakantie.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `als vakantiewaarnemer van ${nameOrEmail}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) =>
            `aan ${submittedToName} als vakantievertegenwoordiger voor ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Je wijst ${nameOrEmail} aan als jouw vervangend accounthouder tijdens je vakantie. Ze zitten nog niet in al je werkruimtes. Als je doorgaat, wordt er een e-mail gestuurd naar alle beheerders van je werkruimtes om hen toe te voegen.`,
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
        confirmBankInfo: 'Bankgegevens bevestigen',
        manuallyAdd: 'Voeg je bankrekening handmatig toe',
        letsDoubleCheck: 'Laten we dubbel controleren of alles er goed uitziet.',
        accountEnding: 'Account eindigend op',
        thisBankAccount: 'Deze bankrekening wordt gebruikt voor zakelijke betalingen in je werkruimte',
        accountNumber: 'Rekeningnummer',
        routingNumber: 'Routingnummer',
        chooseAnAccountBelow: 'Kies hieronder een account',
        addBankAccount: 'Bankrekening toevoegen',
        chooseAnAccount: 'Kies een account',
        connectOnlineWithPlaid: 'Log in bij je bank',
        connectManually: 'Handmatig verbinden',
        desktopConnection: 'Opmerking: om verbinding te maken met Chase, Wells Fargo, Capital One of Bank of America, klik hier om dit proces in een browser te voltooien.',
        yourDataIsSecure: 'Uw gegevens zijn veilig',
        toGetStarted: 'Voeg een bankrekening toe om onkosten terug te betalen, Expensify Cards uit te geven, factuurbetalingen te innen en rekeningen te betalen, allemaal vanaf één plek.',
        plaidBodyCopy: 'Geef uw werknemers een eenvoudigere manier om zakelijke uitgaven te betalen – en terugbetaald te worden.',
        checkHelpLine: 'Uw bankcode en rekeningnummer kunt u terugvinden op een cheque van de rekening.',
        hasPhoneLoginError: ({contactMethodRoute}: ContactMethodParams) =>
            `Om een bankrekening te koppelen, <a href="${contactMethodRoute}">voegt u een e-mailadres toe als uw primaire login</a> en probeert u het opnieuw. U kunt uw telefoonnummer als secundaire login toevoegen.`,
        hasBeenThrottledError: 'Er is een fout opgetreden bij het toevoegen van je bankrekening. Wacht een paar minuten en probeer het opnieuw.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Oeps! Het lijkt erop dat de valuta van je werkruimte is ingesteld op een andere valuta dan USD. Ga naar <a href="${workspaceRoute}">je werkruimte-instellingen</a> om deze op USD in te stellen en probeer het opnieuw.`,
        bbaAdded: 'Zakelijke bankrekening toegevoegd!',
        bbaAddedDescription: 'Het is klaar om voor betalingen te worden gebruikt.',
        error: {
            youNeedToSelectAnOption: 'Selecteer een optie om door te gaan',
            noBankAccountAvailable: 'Sorry, er is geen bankrekening beschikbaar',
            noBankAccountSelected: 'Kies een account',
            taxID: 'Voer een geldig btw-identificatienummer in',
            website: 'Voer een geldige website in',
            zipCode: `Voer een geldige postcode in met behulp van de volgende notatie: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Voer een geldig telefoonnummer in',
            email: 'Voer een geldig e-mailadres in',
            companyName: 'Voer een geldige bedrijfsnaam in',
            addressCity: 'Voer een geldige stad in',
            addressStreet: 'Voer een geldig straatadres in',
            addressState: 'Selecteer een geldige staat',
            incorporationDateFuture: 'Oprichtingsdatum mag niet in de toekomst liggen',
            incorporationState: 'Selecteer een geldige staat',
            industryCode: 'Voer een geldige industrieclassificatiecode met zes cijfers in',
            restrictedBusiness: 'Bevestig dat het bedrijf niet op de lijst met beperkte bedrijven staat.',
            routingNumber: 'Voer een geldig routenummer in',
            accountNumber: 'Voer een geldig rekeningnummer in',
            routingAndAccountNumberCannotBeSame: 'Routing- en rekeningnummers mogen niet hetzelfde zijn',
            companyType: 'Selecteer een geldig bedrijfstype',
            tooManyAttempts:
                'Vanwege een groot aantal aanmeldpogingen is deze optie voor 24 uur uitgeschakeld. Probeer het later opnieuw of voer de gegevens in plaats daarvan handmatig in.',
            address: 'Voer een geldig adres in',
            dob: 'Selecteer een geldige geboortedatum',
            age: 'Moet ouder dan 18 jaar zijn',
            ssnLast4: 'Voer de geldige laatste 4 cijfers van uw SSN in',
            firstName: 'Voer een geldige voornaam in',
            lastName: 'Voer een geldige achternaam in',
            noDefaultDepositAccountOrDebitCardAvailable: 'Voeg een standaardstortingsrekening of betaalpas toe',
            validationAmounts: 'De validatiebedragen die je hebt ingevoerd zijn onjuist. Controleer je bankafschrift nogmaals en probeer het opnieuw.',
            fullName: 'Voer een geldige volledige naam in',
            ownershipPercentage: 'Voer een geldig percentage in',
            deletePaymentBankAccount:
                'Deze bankrekening kan niet worden verwijderd omdat deze wordt gebruikt voor Expensify Card-betalingen. Als je deze rekening toch wilt verwijderen, neem dan contact op met Concierge.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Waar bevindt zich je bankrekening?',
        accountDetailsStepHeader: 'Wat zijn je accountgegevens?',
        accountTypeStepHeader: 'Wat voor soort account is dit?',
        bankInformationStepHeader: 'Wat zijn je bankgegevens?',
        accountHolderInformationStepHeader: 'Wat zijn de gegevens van de rekeninghouder?',
        howDoWeProtectYourData: 'Hoe beschermen we je gegevens?',
        currencyHeader: 'Wat is de valuta van uw bankrekening?',
        confirmationStepHeader: 'Controleer je gegevens.',
        confirmationStepSubHeader: 'Controle de onderstaande gegevens en vink het vakje met de voorwaarden aan om te bevestigen.',
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
        passwordRequired: 'Voer een wachtwoord in',
        passwordIncorrect: 'Onjuist wachtwoord. Probeer het opnieuw.',
        failedToLoadPDF: 'Laden van PDF-bestand mislukt',
        pdfPasswordForm: {
            title: 'Met wachtwoord beveiligde pdf',
            infoText: 'Deze pdf is met een wachtwoord beveiligd.',
            beforeLinkText: 'Alsjeblieft',
            linkText: 'voer het wachtwoord in',
            afterLinkText: 'om het te bekijken.',
            formLabel: 'PDF bekijken',
        },
        attachmentNotFound: 'Bijlage niet gevonden',
        retry: 'Opnieuw proberen',
    },
    messages: {
        errorMessageInvalidPhone: `Voer een geldig telefoonnummer in zonder haakjes of streepjes. Als je buiten de VS bent, voeg dan je landcode toe (bijv. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Ongeldig e-mailadres',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} is al lid van ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Door door te gaan met het verzoek om je Expensify Wallet te activeren, bevestig je dat je hebt gelezen, begrijpt en accepteert',
        facialScan: 'Beleid en vrijgave voor gezichts­scan van Onfido',
        tryAgain: 'Probeer het opnieuw',
        verifyIdentity: 'Identiteit verifiëren',
        letsVerifyIdentity: 'Laten we uw identiteit verifiëren',
        butFirst: `Maar eerst het saaie gedeelte. Lees de juridische tekst in de volgende stap en klik op "Accepteren" wanneer je klaar bent.`,
        genericError: 'Er is een fout opgetreden bij het verwerken van deze stap. Probeer het opnieuw.',
        cameraPermissionsNotGranted: 'Cameratoegang inschakelen',
        cameraRequestMessage: 'We hebben toegang tot je camera nodig om de verificatie van je bankrekening te voltooien. Schakel dit in via Instellingen > New Expensify.',
        microphonePermissionsNotGranted: 'Microfoontoegang inschakelen',
        microphoneRequestMessage: 'We hebben toegang tot je microfoon nodig om de verificatie van je bankrekening te voltooien. Schakel dit in via Instellingen > New Expensify.',
        originalDocumentNeeded: 'Upload alstublieft een originele foto van uw identiteitsbewijs in plaats van een screenshot of een gescande afbeelding.',
        documentNeedsBetterQuality:
            'Uw identiteitsbewijs lijkt beschadigd te zijn of mist beveiligingskenmerken. Upload alstublieft een originele afbeelding van een onbeschadigd identiteitsbewijs dat volledig zichtbaar is.',
        imageNeedsBetterQuality: 'Er is een probleem met de beeldkwaliteit van je ID. Upload alsjeblieft een nieuwe afbeelding waarop je volledige ID duidelijk zichtbaar is.',
        selfieIssue: 'Er is een probleem met je selfie/video. Upload alsjeblieft een live selfie/video.',
        selfieNotMatching: 'Je selfie/video komt niet overeen met je ID. Upload een nieuwe selfie/video waarop je gezicht duidelijk zichtbaar is.',
        selfieNotLive: 'Je selfie/video lijkt geen live foto/video te zijn. Upload alstublieft een live selfie/video.',
    },
    additionalDetailsStep: {
        headerTitle: 'Aanvullende details',
        helpText: 'We moeten de volgende informatie bevestigen voordat je geld kunt versturen en ontvangen via je wallet.',
        helpTextIdologyQuestions: 'We moeten je nog maar een paar vragen stellen om je identiteit helemaal te verifiëren.',
        helpLink: 'Meer informatie over waarom we dit nodig hebben.',
        legalFirstNameLabel: 'Wettelijke voornaam',
        legalMiddleNameLabel: 'Juridische tweede naam',
        legalLastNameLabel: 'Wettelijke achternaam',
        selectAnswer: 'Selecteer een antwoord om door te gaan',
        ssnFull9Error: 'Voer een geldig negencijferig SSN in',
        needSSNFull9: 'We kunnen je BSN niet verifiëren. Voer de volledige negen cijfers van je BSN in.',
        weCouldNotVerify: 'We konden dit niet verifiëren',
        pleaseFixIt: 'Werk deze informatie bij voordat je doorgaat',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `We konden je identiteit niet verifiëren. Probeer het later opnieuw of neem contact op met <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> als je vragen hebt.`,
    },
    termsStep: {
        headerTitle: 'Voorwaarden en kosten',
        headerTitleRefactor: 'Kosten en voorwaarden',
        haveReadAndAgreePlain: 'Ik heb gelezen en ga ermee akkoord elektronische bekendmakingen te ontvangen.',
        haveReadAndAgree: `Ik heb gelezen en ga ermee akkoord om <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">elektronische bekendmakingen</a> te ontvangen.`,
        agreeToThePlain: 'Ik ga akkoord met het Privacy- en Walletakkoord.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a> en de <a href="${walletAgreementUrl}">Wallet-overeenkomst</a>.`,
        enablePayments: 'Betalingen inschakelen',
        monthlyFee: 'Maandelijkse vergoeding',
        inactivity: 'Inactiviteit',
        noOverdraftOrCredit: 'Geen roodstand-/kredietfunctie.',
        electronicFundsWithdrawal: 'Elektronische geldafschrijving',
        standard: 'Standaard',
        reviewTheFees: 'Bekijk enkele vergoedingen.',
        checkTheBoxes: 'Schakel de selectievakjes hieronder in.',
        agreeToTerms: 'Ga akkoord met de voorwaarden en je bent helemaal klaar!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `De Expensify Wallet wordt uitgegeven door ${walletProgram}.`,
            perPurchase: 'Per aankoop',
            atmWithdrawal: 'Geldopname bij geldautomaat',
            cashReload: 'Contant herladen',
            inNetwork: 'Binnen het netwerk',
            outOfNetwork: 'buiten het netwerk',
            atmBalanceInquiry: 'Saldo-opvraag bij geldautomaat (binnen of buiten netwerk)',
            customerService: 'Klantenservice (geautomatiseerd of live medewerker)',
            inactivityAfterTwelveMonths: 'Inactiviteit (na 12 maanden zonder transacties)',
            weChargeOneFee: 'We brengen nog 1 ander type vergoeding in rekening. Dat is:',
            fdicInsurance: 'Je middelen komen in aanmerking voor FDIC-verzekering.',
            generalInfo: `Voor algemene informatie over prepaidrekeningen, ga naar <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Ga voor details en voorwaarden voor alle kosten en diensten naar <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> of bel +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektronische geldafschrijving (onmiddellijk)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min. ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Een lijst van alle Expensify Wallet-kosten',
            typeOfFeeHeader: 'Alle kosten',
            feeAmountHeader: 'Bedrag',
            moreDetailsHeader: 'Details',
            openingAccountTitle: 'Een account openen',
            openingAccountDetails: 'Het openen van een account is gratis.',
            monthlyFeeDetails: 'Er zijn geen maandelijkse kosten.',
            customerServiceTitle: 'Klantenservice',
            customerServiceDetails: 'Er zijn geen kosten voor de klantenservice.',
            inactivityDetails: 'Er zijn geen kosten voor inactiviteit.',
            sendingFundsTitle: 'Geld verzenden naar een andere rekeninghouder',
            sendingFundsDetails: 'Er zijn geen kosten verbonden aan het overmaken van geld naar een andere rekeninghouder met je saldo, bankrekening of betaalpas.',
            electronicFundsStandardDetails:
                'Er zijn geen kosten verbonden aan het overmaken van geld van je Expensify Wallet naar je bankrekening met de standaardoptie. Deze overboeking wordt meestal binnen 1–3 werkdagen voltooid.',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                'Er zijn kosten verbonden aan het overboeken van geld van je Expensify Wallet naar je gekoppelde betaalpas met de optie voor directe overboeking. Deze overboeking wordt meestal binnen enkele minuten voltooid.' +
                `De vergoeding is ${percentage}% van het over te boeken bedrag (met een minimumvergoeding van ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Je geld komt in aanmerking voor FDIC-verzekering. Je geld wordt aangehouden bij of overgemaakt naar ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, een instelling die door de FDIC is verzekerd.` +
                `Eenmaal daar zijn je gelden verzekerd tot ${amount} door de FDIC in het geval ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} failliet gaat, als aan specifieke vereisten voor depositoverzekering is voldaan en je kaart geregistreerd is. Zie ${CONST.TERMS.FDIC_PREPAID} voor meer details.`,
            contactExpensifyPayments: `Neem contact op met ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} door te bellen naar +1 833-400-0904, per e-mail via ${CONST.EMAIL.CONCIERGE} of meld u aan op ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Voor algemene informatie over prepaidrekeningen, ga naar ${CONST.TERMS.CFPB_PREPAID}. Als je een klacht hebt over een prepaidrekening, bel dan het Consumer Financial Protection Bureau op 1-855-411-2372 of ga naar ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Printervriendelijke versie bekijken',
            automated: 'Geautomatiseerd',
            liveAgent: 'Live medewerker',
            instant: 'Direct',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min. ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Betalingen inschakelen',
        activatedTitle: 'Wallet geactiveerd!',
        activatedMessage: 'Gefeliciteerd, je wallet is ingesteld en klaar om betalingen te doen.',
        checkBackLaterTitle: 'Een momentje...',
        checkBackLaterMessage: 'We zijn je gegevens nog aan het beoordelen. Kom later terug om het opnieuw te proberen.',
        continueToPayment: 'Doorgaan naar betaling',
        continueToTransfer: 'Doorgaan met overboeken',
    },
    companyStep: {
        headerTitle: 'Bedrijfsgegevens',
        subtitle: 'Bijna klaar! Voor veiligheidsredenen moeten we nog enkele gegevens bevestigen:',
        legalBusinessName: 'Juridische bedrijfsnaam',
        companyWebsite: 'Bedrijfswebsite',
        taxIDNumber: 'Belastingidentificatienummer',
        taxIDNumberPlaceholder: '9 cijfers',
        companyType: 'Bedrijfstype',
        incorporationDate: 'Oprichtingsdatum',
        incorporationState: 'Incorporatiestaat',
        industryClassificationCode: 'Industrieclassificatiecode',
        confirmCompanyIsNot: 'Ik bevestig dat dit bedrijf niet op de',
        listOfRestrictedBusinesses: 'Lijst met beperkte ondernemingen',
        incorporationDatePlaceholder: 'Startdatum (jjjj-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Bedrijf',
            PARTNERSHIP: 'Partnerschap',
            COOPERATIVE: 'Coöperatief',
            SOLE_PROPRIETORSHIP: 'Eenmanszaak',
            OTHER: 'Overig',
        },
        industryClassification: 'Onder welke branche valt het bedrijf?',
        industryClassificationCodePlaceholder: 'Zoeken naar brancheclassificatiecode',
    },
    requestorStep: {
        headerTitle: 'Persoonlijke informatie',
        learnMore: 'Meer informatie',
        isMyDataSafe: 'Zijn mijn gegevens veilig?',
    },
    personalInfoStep: {
        personalInfo: 'Persoonlijke info',
        enterYourLegalFirstAndLast: 'Wat is uw officiële naam?',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Wettelijke achternaam',
        legalName: 'Juridische naam',
        enterYourDateOfBirth: 'Wat is je geboortedatum?',
        enterTheLast4: 'Wat zijn de laatste vier cijfers van uw sofinummer?',
        dontWorry: 'Maak je geen zorgen, we doen geen persoonlijke kredietcontroles!',
        last4SSN: 'Laatste 4 cijfers van SSN',
        enterYourAddress: 'Wat is je adres?',
        address: 'Adres',
        letsDoubleCheck: 'Laten we dubbel controleren of alles er goed uitziet.',
        byAddingThisBankAccount: 'Door deze bankrekening toe te voegen, bevestig je dat je hebt gelezen, begrijpt en akkoord gaat met',
        whatsYourLegalName: 'Wat is uw officiële naam?',
        whatsYourDOB: 'Wat is je geboortedatum?',
        whatsYourAddress: 'Wat is je adres?',
        whatsYourSSN: 'Wat zijn de laatste vier cijfers van uw sofinummer?',
        noPersonalChecks: 'Geen zorgen, hier worden geen persoonlijke kredietcontroles uitgevoerd!',
        whatsYourPhoneNumber: 'Wat is je telefoonnummer?',
        weNeedThisToVerify: 'We hebben dit nodig om je wallet te verifiëren.',
    },
    businessInfoStep: {
        businessInfo: 'Bedrijfsinformatie',
        enterTheNameOfYourBusiness: 'Hoe heet uw bedrijf?',
        businessName: 'Wettelijke bedrijfsnaam',
        enterYourCompanyTaxIdNumber: 'Wat is het btw-identificatienummer van uw bedrijf?',
        taxIDNumber: 'Belastingidentificatienummer',
        taxIDNumberPlaceholder: '9 cijfers',
        enterYourCompanyWebsite: 'Wat is de website van uw bedrijf?',
        companyWebsite: 'Bedrijfswebsite',
        enterYourCompanyPhoneNumber: 'Wat is het telefoonnummer van uw bedrijf?',
        enterYourCompanyAddress: 'Wat is het adres van uw bedrijf?',
        selectYourCompanyType: 'Wat voor soort bedrijf is het?',
        companyType: 'Bedrijfstype',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Bedrijf',
            PARTNERSHIP: 'Partnerschap',
            COOPERATIVE: 'Coöperatief',
            SOLE_PROPRIETORSHIP: 'Eenmanszaak',
            OTHER: 'Overig',
        },
        selectYourCompanyIncorporationDate: 'Wat is de oprichtingsdatum van uw bedrijf?',
        incorporationDate: 'Oprichtingsdatum',
        incorporationDatePlaceholder: 'Startdatum (jjjj-mm-dd)',
        incorporationState: 'Incorporatiestaat',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In welke staat is uw bedrijf opgericht?',
        letsDoubleCheck: 'Laten we dubbel controleren of alles er goed uitziet.',
        companyAddress: 'Bedrijfsadres',
        listOfRestrictedBusinesses: 'Lijst met beperkte ondernemingen',
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
                    return 'Wat is het Australian Business Number (ABN)?';
                default:
                    return 'Wat is het EU-btw-nummer?';
            }
        },
        whatsThisNumber: 'Wat is dit nummer?',
        whereWasTheBusinessIncorporated: 'Waar is het bedrijf opgericht?',
        whatTypeOfBusinessIsIt: 'Wat voor soort bedrijf is het?',
        whatsTheBusinessAnnualPayment: 'Wat is de jaarlijkse betalingsomzet van het bedrijf?',
        whatsYourExpectedAverageReimbursements: 'Wat is je verwachte gemiddelde terugbetalingsbedrag?',
        registrationNumber: 'Registratienummer',
        taxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'EIN';
                case CONST.COUNTRY.CA:
                    return 'BN';
                case CONST.COUNTRY.GB:
                    return 'Btw-nummer';
                case CONST.COUNTRY.AU:
                    return 'ABN';
                default:
                    return 'EU-btw';
            }
        },
        businessAddress: 'Zakelijk adres',
        businessType: 'Bedrijfstype',
        incorporation: 'Oprichting',
        incorporationCountry: 'Incorporatieland',
        incorporationTypeName: 'Type onderneming',
        businessCategory: 'Zakelijke categorie',
        annualPaymentVolume: 'Jaarlijks betalingsvolume',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Jaarlijks betalingsvolume in ${currencyCode}`,
        averageReimbursementAmount: 'Gemiddeld terugbetalingsbedrag',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Gemiddeld vergoedingsbedrag in ${currencyCode}`,
        selectIncorporationType: 'Selecteer ondernemingsvorm',
        selectBusinessCategory: 'Selecteer zakelijke categorie',
        selectAnnualPaymentVolume: 'Selecteer jaarlijks betalingsvolume',
        selectIncorporationCountry: 'Kies het oprichtingsland',
        selectIncorporationState: 'Selecteer incorporatiestaat',
        selectAverageReimbursement: 'Selecteer het gemiddelde terugbetalingsbedrag',
        selectBusinessType: 'Selecteer bedrijfstype',
        findIncorporationType: 'Vind type bedrijfsvorm',
        findBusinessCategory: 'Zakelijke categorie zoeken',
        findAnnualPaymentVolume: 'Jaarlijks betalingsvolume zoeken',
        findIncorporationState: 'Staat van oprichting zoeken',
        findAverageReimbursement: 'Gemiddeld terugbetalingsbedrag zoeken',
        findBusinessType: 'Bedrijfstype zoeken',
        error: {
            registrationNumber: 'Geef een geldig registratienummer op',
            taxIDEIN: ({country}: BusinessTaxIDParams) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Voer een geldig werkgeversidentificatienummer (EIN) in.';
                    case CONST.COUNTRY.CA:
                        return 'Geef een geldig ondernemingsnummer (BN) op';
                    case CONST.COUNTRY.GB:
                        return 'Geef een geldig btw-registratienummer (VRN) op.';
                    case CONST.COUNTRY.AU:
                        return 'Voer een geldig Australisch Business Number (ABN) in.';
                    default:
                        return 'Voer een geldig EU-btw-nummer in';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: ({companyName}: CompanyNameParams) => `Bent u voor 25% of meer eigenaar van ${companyName}?`,
        doAnyIndividualOwn25percent: ({companyName}: CompanyNameParams) => `Bezitten een of meer personen 25% of meer van ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: ({companyName}: CompanyNameParams) => `Zijn er meer personen die 25% of meer van ${companyName} bezitten?`,
        regulationRequiresUsToVerifyTheIdentity: 'Regelgeving vereist dat we de identiteit verifiëren van iedere persoon die meer dan 25% van het bedrijf bezit.',
        companyOwner: 'Eigenaar van een bedrijf',
        enterLegalFirstAndLastName: 'Wat is de wettelijke naam van de eigenaar?',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Wettelijke achternaam',
        enterTheDateOfBirthOfTheOwner: 'Wat is de geboortedatum van de eigenaar?',
        enterTheLast4: 'Wat zijn de laatste 4 cijfers van het burgerservicenummer (BSN) van de eigenaar?',
        last4SSN: 'Laatste 4 cijfers van SSN',
        dontWorry: 'Maak je geen zorgen, we doen geen persoonlijke kredietcontroles!',
        enterTheOwnersAddress: 'Wat is het adres van de eigenaar?',
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        legalName: 'Juridische naam',
        address: 'Adres',
        byAddingThisBankAccount: 'Door deze bankrekening toe te voegen, bevestig je dat je hebt gelezen, begrijpt en akkoord gaat met',
        owners: 'Eigenaren',
    },
    ownershipInfoStep: {
        ownerInfo: 'Eigenaarinformatie',
        businessOwner: 'Eigenaar van een bedrijf',
        signerInfo: 'Informatie ondertekenaar',
        doYouOwn: ({companyName}: CompanyNameParams) => `Bent u voor 25% of meer eigenaar van ${companyName}?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Bezitten een of meer personen 25% of meer van ${companyName}?`,
        regulationsRequire: 'Regelgeving vereist dat we de identiteit verifiëren van elke persoon die meer dan 25% van het bedrijf bezit.',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Wettelijke achternaam',
        whatsTheOwnersName: 'Wat is de wettelijke naam van de eigenaar?',
        whatsYourName: 'Wat is uw officiële naam?',
        whatPercentage: 'Welk percentage van het bedrijf is eigendom van de eigenaar?',
        whatsYoursPercentage: 'Welk percentage van het bedrijf bezit je?',
        ownership: 'Eigendom',
        whatsTheOwnersDOB: 'Wat is de geboortedatum van de eigenaar?',
        whatsYourDOB: 'Wat is je geboortedatum?',
        whatsTheOwnersAddress: 'Wat is het adres van de eigenaar?',
        whatsYourAddress: 'Wat is je adres?',
        whatAreTheLast: 'Wat zijn de laatste 4 cijfers van het sofinummer van de eigenaar?',
        whatsYourLast: 'Wat zijn de laatste 4 cijfers van uw sofinummer?',
        whatsYourNationality: 'Wat is uw nationaliteit?',
        whatsTheOwnersNationality: 'Wat is het land van nationaliteit van de eigenaar?',
        countryOfCitizenship: 'Nationaliteit',
        dontWorry: 'Maak je geen zorgen, we doen geen persoonlijke kredietcontroles!',
        last4: 'Laatste 4 cijfers van SSN',
        whyDoWeAsk: 'Waarom vragen we dit?',
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        legalName: 'Juridische naam',
        ownershipPercentage: 'Eigendomspercentage',
        areThereOther: ({companyName}: CompanyNameParams) => `Zijn er andere personen die 25% of meer van ${companyName} bezitten?`,
        owners: 'Eigenaren',
        addCertified: 'Voeg een gecertificeerd organisatieschema toe dat de uiteindelijk belanghebbenden toont',
        regulationRequiresChart:
            'Volgens de regelgeving moeten wij een gewaarmerkte kopie verzamelen van het eigendomsdiagram waarop elke persoon of entiteit staat vermeld die 25% of meer van het bedrijf bezit.',
        uploadEntity: 'Organigram juridische entiteiten uploaden',
        noteEntity: 'Opmerking: het eigendomsdiagram van de entiteit moet worden ondertekend door uw accountant, juridisch adviseur of notarieel worden bekrachtigd.',
        certified: 'Gecertificeerd eigendomsdiagram van entiteit',
        selectCountry: 'Land selecteren',
        findCountry: 'Land zoeken',
        address: 'Adres',
        chooseFile: 'Kies bestand',
        uploadDocuments: 'Extra documentatie uploaden',
        pleaseUpload: 'Upload hieronder extra documentatie om ons te helpen uw identiteit te verifiëren als directe of indirecte eigenaar van 25% of meer van de bedrijfsentiteit.',
        acceptedFiles: 'Geaccepteerde bestandsformaten: PDF, PNG, JPEG. De totale bestandsgrootte voor elke sectie mag niet groter zijn dan 5 MB.',
        proofOfBeneficialOwner: 'Bewijs van uiteindelijk begunstigde eigenaar',
        proofOfBeneficialOwnerDescription:
            'Geef een ondertekende verklaring en een organisatieschema van een openbare accountant, notaris of advocaat waarin wordt bevestigd dat iemand 25% of meer van het bedrijf bezit. Deze documenten moeten zijn gedateerd binnen de afgelopen drie maanden en het licentienummer van de ondertekenaar bevatten.',
        copyOfID: 'Kopie van identiteitsbewijs van uiteindelijk belanghebbende',
        copyOfIDDescription: 'Voorbeelden: paspoort, rijbewijs, enz.',
        proofOfAddress: 'Adresbewijs voor uiteindelijk belanghebbende',
        proofOfAddressDescription: 'Voorbeelden: Nutsrekening, huurovereenkomst, enz.',
        codiceFiscale: 'Codice fiscale/belastingnummer',
        codiceFiscaleDescription:
            'Upload alstublieft een video van een locatiebezoek of een opgenomen gesprek met de tekeningsbevoegde. De bevoegde persoon moet het volgende vermelden: volledige naam, geboortedatum, bedrijfsnaam, registratienummer, fiscaal nummer, statutaire zetel, aard van de bedrijfsactiviteiten en doel van de rekening.',
    },
    completeVerificationStep: {
        completeVerification: 'Verificatie voltooien',
        confirmAgreements: 'Bevestig alstublieft de onderstaande overeenkomsten.',
        certifyTrueAndAccurate: 'Ik bevestig dat de verstrekte informatie juist en nauwkeurig is',
        certifyTrueAndAccurateError: 'Bevestig alstublieft dat de informatie waar en nauwkeurig is',
        isAuthorizedToUseBankAccount: 'Ik ben gemachtigd om deze zakelijke bankrekening te gebruiken voor zakelijke uitgaven',
        isAuthorizedToUseBankAccountError: 'Je moet een beherend functionaris zijn met bevoegdheid om de zakelijke bankrekening te beheren',
        termsAndConditions: 'algemene voorwaarden',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Verifieer uw bankrekening',
        validateButtonText: 'Valideren',
        validationInputLabel: 'Transactie',
        maxAttemptsReached: 'Validatie voor deze bankrekening is uitgeschakeld vanwege te veel onjuiste pogingen.',
        description: `Binnen 1–2 werkdagen sturen we drie (3) kleine transacties naar je bankrekening vanaf een naam zoals "Expensify, Inc. Validation".`,
        descriptionCTA: 'Voer het bedrag van elke transactie in de onderstaande velden in. Voorbeeld: 1,51.',
        letsChatText: 'Bijna klaar! We hebben je hulp nodig om nog een paar laatste gegevens via de chat te verifiëren. Klaar?',
        enable2FATitle: 'Voorkom fraude, schakel tweeledige verificatie (2FA) in',
        enable2FAText: 'We nemen je beveiliging serieus. Stel nu 2FA in om een extra beveiligingslaag aan je account toe te voegen.',
        secureYourAccount: 'Beveilig uw account',
    },
    countryStep: {
        confirmBusinessBank: 'Bevestig de valuta en het land van de zakelijke bankrekening',
        confirmCurrency: 'Valuta en land bevestigen',
        yourBusiness: 'De valuta van uw zakelijke bankrekening moet overeenkomen met de valuta van uw werkruimte.',
        youCanChange: 'Je kunt de valuta van je workspace wijzigen in je',
        findCountry: 'Land zoeken',
        selectCountry: 'Land selecteren',
    },
    bankInfoStep: {
        whatAreYour: 'Wat zijn de gegevens van uw zakelijke bankrekening?',
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        thisBankAccount: 'Deze bankrekening wordt gebruikt voor zakelijke betalingen in je werkruimte',
        accountNumber: 'Rekeningnummer',
        accountHolderNameDescription: 'Volledige naam gemachtigde ondertekenaar',
    },
    signerInfoStep: {
        signerInfo: 'Informatie ondertekenaar',
        areYouDirector: ({companyName}: CompanyNameParams) => `Ben je directeur bij ${companyName}?`,
        regulationRequiresUs: 'Regelgeving vereist dat wij verifiëren of de ondertekenaar bevoegd is om deze actie namens het bedrijf uit te voeren.',
        whatsYourName: 'Wat is je juridische naam',
        fullName: 'Volledige wettelijke naam',
        whatsYourJobTitle: 'Wat is je functietitel?',
        jobTitle: 'Functietitel',
        whatsYourDOB: 'Wat is je geboortedatum?',
        uploadID: 'Upload identiteitsbewijs en adresbewijs',
        personalAddress: 'Bewijs van persoonlijk adres (bijv. energierekening)',
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        legalName: 'Juridische naam',
        proofOf: 'Bewijs van woonadres',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Voer het e-mailadres in van een directeur bij ${companyName}`,
        regulationRequiresOneMoreDirector: 'Volgens de regelgeving is minstens één extra bestuurder als ondertekenaar vereist.',
        hangTight: 'Een moment geduld...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Voer de e-mailadressen in van twee directeuren bij ${companyName}`,
        sendReminder: 'Stuur een herinnering',
        chooseFile: 'Kies bestand',
        weAreWaiting: 'We wachten totdat anderen hun identiteit hebben bevestigd als directeuren van het bedrijf.',
        id: 'Kopie van ID',
        proofOfDirectors: 'Bewijs van bestuurder(s)',
        proofOfDirectorsDescription: 'Voorbeelden: Oncorp bedrijfsprofiel of bedrijfsregistratie.',
        codiceFiscale: 'Fiscaal nummer',
        codiceFiscaleDescription: 'Codice Fiscale voor ondertekenaars, gemachtigde gebruikers en uiteindelijk belanghebbenden.',
        PDSandFSG: 'PDS + FSG openbaarmakingsdocumenten',
        PDSandFSGDescription: dedent(`
            Onze samenwerking met Corpay maakt gebruik van een API-koppeling om te profiteren van hun uitgebreide netwerk van internationale bankpartners om Global Reimbursements in Expensify mogelijk te maken. Volgens de Australische regelgeving verstrekken wij je hierbij de Financial Services Guide (FSG) en Product Disclosure Statement (PDS) van Corpay.

            Lees de FSG- en PDS-documenten zorgvuldig door, omdat ze volledige details en belangrijke informatie bevatten over de producten en diensten die Corpay aanbiedt. Bewaar deze documenten voor toekomstig gebruik.
        `),
        pleaseUpload: 'Upload hieronder aanvullende documentatie om ons te helpen uw identiteit als directeur van het bedrijf te verifiëren.',
        enterSignerInfo: 'Gegevens ondertekenaar invoeren',
        thisStep: 'Deze stap is voltooid',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `verbindt een zakelijke bankrekening in ${currency} eindigend op ${bankAccountLastFour} met Expensify om werknemers in ${currency} te betalen. De volgende stap vereist ondertekenaarsinformatie van een directeur.`,
        error: {
            emailsMustBeDifferent: 'E-mails moeten verschillend zijn',
        },
    },
    agreementsStep: {
        agreements: 'Overeenkomsten',
        pleaseConfirm: 'Bevestig de onderstaande overeenkomsten alstublieft',
        regulationRequiresUs: 'Regelgeving vereist dat we de identiteit verifiëren van iedere persoon die meer dan 25% van het bedrijf bezit.',
        iAmAuthorized: 'Ik ben gemachtigd om de zakelijke bankrekening te gebruiken voor zakelijke uitgaven.',
        iCertify: 'Ik verklaar dat de verstrekte informatie juist en nauwkeurig is.',
        iAcceptTheTermsAndConditions: `Ik ga akkoord met de <a href="https://cross-border.corpay.com/tc/">algemene voorwaarden</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Ik ga akkoord met de algemene voorwaarden.',
        accept: 'Accepteren en bankrekening toevoegen',
        iConsentToThePrivacyNotice: 'Ik ga akkoord met de <a href="https://payments.corpay.com/compliance">privacyverklaring</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Ik ga akkoord met de privacyverklaring.',
        error: {
            authorized: 'Je moet een beherend functionaris zijn met bevoegdheid om de zakelijke bankrekening te beheren',
            certify: 'Bevestig alstublieft dat de informatie waar en nauwkeurig is',
            consent: 'Geef alstublieft toestemming voor de privacyverklaring',
        },
    },
    docusignStep: {
        subheader: 'DocuSign-formulier',
        pleaseComplete:
            'Vul het ACH-machtigingsformulier in via de onderstaande Docusign-link en upload vervolgens de ondertekende kopie hier, zodat we rechtstreeks geld van uw bankrekening kunnen afschrijven.',
        pleaseCompleteTheBusinessAccount: 'Vul alstublieft de machtigingsregeling voor automatische incasso van de zakelijke rekeningaanvraag in.',
        pleaseCompleteTheDirect:
            'Voltooi de automatische incasso-overeenkomst via de onderstaande Docusign-link en upload vervolgens hier de ondertekende kopie, zodat we rechtstreeks geld van uw bankrekening kunnen afschrijven.',
        takeMeTo: 'Breng me naar Docusign',
        uploadAdditional: 'Extra documentatie uploaden',
        pleaseUpload: 'Upload alstublieft het DEFT-formulier en de Docusign-handtekeningpagina.',
        pleaseUploadTheDirect: 'Upload alstublieft de Direct Debit Arrangements en de Docusign-handtekeningpagina',
    },
    finishStep: {
        letsFinish: 'Laten we het in de chat afronden!',
        thanksFor:
            'Bedankt voor deze details. Een toegewijde supportmedewerker zal je informatie nu beoordelen. We nemen opnieuw contact met je op als we nog iets van je nodig hebben, maar neem in de tussentijd gerust contact met ons op als je vragen hebt.',
        iHaveA: 'Ik heb een vraag',
        enable2FA: 'Schakel twee-factor-authenticatie (2FA) in om fraude te voorkomen',
        weTake: 'We nemen je beveiliging serieus. Stel nu 2FA in om een extra beveiligingslaag aan je account toe te voegen.',
        secure: 'Beveilig uw account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Een moment',
        explanationLine: 'We bekijken jouw gegevens. Je kunt binnenkort doorgaan met de volgende stappen.',
    },
    session: {
        offlineMessageRetry: 'Het lijkt erop dat je offline bent. Controleer je verbinding en probeer het opnieuw.',
    },
    travel: {
        header: 'Reis boeken',
        title: 'Reis slim',
        subtitle: 'Gebruik Expensify Travel om de beste reisaanbiedingen te krijgen en al uw zakelijke uitgaven op één plek te beheren.',
        features: {
            saveMoney: 'Bespaar geld op je boekingen',
            alerts: 'Ontvang realtime updates en meldingen',
        },
        bookTravel: 'Reis boeken',
        bookDemo: 'Demo boeken',
        bookADemo: 'Boek een demo',
        toLearnMore: 'meer informatie.',
        termsAndConditions: {
            header: 'Voordat we verdergaan...',
            title: 'Algemene voorwaarden',
            label: 'Ik ga akkoord met de algemene voorwaarden',
            subtitle: `Ga akkoord met de Expensify Travel <a href="${CONST.TRAVEL_TERMS_URL}">algemene voorwaarden</a>.`,
            error: 'U moet akkoord gaan met de Expensify Travel-voorwaarden om door te gaan',
            defaultWorkspaceError:
                'Je moet een standaardwerkruimte instellen om Expensify Travel in te schakelen. Ga naar Instellingen > Werkruimtes > klik op de drie verticale puntjes naast een werkruimte > Als standaardwerkruimte instellen en probeer het daarna opnieuw!',
        },
        flight: 'Vlucht',
        flightDetails: {
            passenger: 'Passagier',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Je hebt een <strong>${layover} overstap</strong> voor deze vlucht</muted-text-label>`,
            takeOff: 'Start',
            landing: 'Landingspagina',
            seat: 'Licentieplaats',
            class: 'Reisklasse',
            recordLocator: 'Reserveringsnummer',
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
            cancellationUntil: 'Gratis annuleren tot',
            confirmation: 'Bevestigingsnummer',
            cancellationPolicies: {
                unknown: 'Onbekend',
                nonRefundable: 'Niet-restitueerbaar',
                freeCancellationUntil: 'Gratis annuleren tot',
                partiallyRefundable: 'Gedeeltelijk restitueerbaar',
            },
        },
        car: 'Auto',
        carDetails: {
            rentalCar: 'Autoverhuur',
            pickUp: 'Ophalen',
            dropOff: 'Afzetpunt',
            driver: 'Bestuurder',
            carType: 'Autotype',
            cancellation: 'Annuleringsbeleid',
            cancellationUntil: 'Gratis annuleren tot',
            freeCancellation: 'Gratis annuleren',
            confirmation: 'Bevestigingsnummer',
        },
        train: 'Spoor',
        trainDetails: {
            passenger: 'Passagier',
            departs: 'Vertrekt',
            arrives: 'Komt aan',
            coachNumber: 'Stoelnummer',
            seat: 'Licentieplaats',
            fareDetails: 'Tariefdetails',
            confirmation: 'Bevestigingsnummer',
        },
        viewTrip: 'Reis bekijken',
        modifyTrip: 'Reis wijzigen',
        tripSupport: 'Reisondersteuning',
        tripDetails: 'Reisdetails',
        viewTripDetails: 'Reisgegevens bekijken',
        trip: 'Reis',
        trips: 'Reizen',
        tripSummary: 'Reissamenvatting',
        departs: 'Vertrekt',
        errorMessage: 'Er is iets misgegaan. Probeer het later opnieuw.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>Voeg <a href="${phoneErrorMethodsRoute}">een werk-e-mailadres toe als je primaire login</a> om reizen te boeken.</rbr>`,
        domainSelector: {
            title: 'Domein',
            subtitle: 'Kies een domein voor de Expensify Travel-configuratie.',
            recommended: 'Aanbevolen',
        },
        domainPermissionInfo: {
            title: 'Domein',
            restriction: ({domain}: DomainPermissionInfoRestrictionParams) =>
                `Je hebt geen toestemming om Expensify Travel in te schakelen voor het domein <strong>${domain}</strong>. Je moet iemand van dat domein vragen om Travel in te schakelen.`,
            accountantInvitation: `Als je een accountant bent, overweeg dan om deel te nemen aan het <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! accountantsprogramma</a> om reizen voor dit domein in te schakelen.`,
        },
        publicDomainError: {
            title: 'Aan de slag met Expensify Travel',
            message: `Je moet je werk-e-mailadres (bijv. naam@bedrijf.com) gebruiken met Expensify Travel, niet je persoonlijke e-mailadres (bijv. naam@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel is uitgeschakeld',
            message: `Uw beheerder heeft Expensify Travel uitgeschakeld. Volg het boekingsbeleid van uw bedrijf voor reisregelingen.`,
        },
        verifyCompany: {
            title: 'We beoordelen je verzoek...',
            message: `We voeren een paar controles uit om te verifiëren dat je account klaar is voor Expensify Travel. We nemen binnenkort contact met je op!`,
            confirmText: 'Begrepen',
            conciergeMessage: ({domain}: {domain: string}) => `Reizen inschakelen is mislukt voor domein: ${domain}. Controleer dit domein en schakel reizen in voor dit domein.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Je vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is geboekt. Bevestigingscode: ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Uw ticket voor vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is geannuleerd.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Uw ticket voor vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is terugbetaald of omgeboekt.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Je vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate}} is door de luchtvaartmaatschappij geannuleerd.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) =>
                `De luchtvaartmaatschappij heeft een schemawijziging voorgesteld voor vlucht ${airlineCode}; we wachten op bevestiging.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Wijziging in schema bevestigd: vlucht ${airlineCode} vertrekt nu om ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `Uw vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is bijgewerkt.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `Uw reisklasse is bijgewerkt naar ${cabinClass} op vlucht ${airlineCode}.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Uw stoeltoewijzing op vlucht ${airlineCode} is bevestigd.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `Uw stoeltoewijzing op vlucht ${airlineCode} is gewijzigd.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `Je stoeltoewijzing op vlucht ${airlineCode} is verwijderd.`,
            paymentDeclined: 'De betaling voor je vluchtboeking is mislukt. Probeer het opnieuw.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Je hebt je ${type}-reservering ${id} geannuleerd.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `De leverancier heeft je ${type}-reservering ${id} geannuleerd.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Je ${type}-reservering is opnieuw geboekt. Nieuwe bevestiging nr:${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Je ${type}-reservering is bijgewerkt. Bekijk de nieuwe details in de reisroute.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Je treinkaartje voor ${origin} → ${destination} op ${startDate} is terugbetaald. Er wordt een tegoed verwerkt.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Uw treinkaartje voor ${origin} → ${destination} op ${startDate} is omgewisseld.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Uw treinkaartje voor ${origin} → ${destination} op ${startDate} is bijgewerkt.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Je ${type}-reservering is bijgewerkt.`,
        },
        flightTo: 'Vlucht naar',
        trainTo: 'Trein naar',
        carRental: 'autoverhuur',
        nightIn: 'nacht in',
        nightsIn: 'nachten in',
    },
    workspace: {
        common: {
            card: 'Kaarten',
            expensifyCard: 'Expensify Card',
            companyCards: 'Bedrijfskaarten',
            workflows: 'Workflows',
            workspace: 'Werkruimte',
            findWorkspace: 'Workspace zoeken',
            edit: 'Werkruimte bewerken',
            enabled: 'Ingeschakeld',
            disabled: 'Uitgeschakeld',
            everyone: 'Iedereen',
            delete: 'Werkruimte verwijderen',
            settings: 'Instellingen',
            reimburse: 'Vergoedingen',
            categories: 'Categorieën',
            tags: 'Tags',
            customField1: 'Aangepast veld 1',
            customField2: 'Aangepast veld 2',
            customFieldHint: 'Voeg aangepaste codering toe die van toepassing is op alle uitgaven van dit lid.',
            reports: 'Rapporten',
            reportFields: 'Rapportvelden',
            reportTitle: 'Rapporttitel',
            reportField: 'Rapportveld',
            taxes: 'Belastingen',
            bills: 'Facturen',
            invoices: 'Facturen',
            perDiem: 'Dagvergoeding',
            travel: 'Reizen',
            members: 'Leden',
            accounting: 'Boekhouding',
            receiptPartners: 'Bonpartners',
            rules: 'Regels',
            displayedAs: 'Weergegeven als',
            plan: 'Abonnement',
            profile: 'Overzicht',
            bankAccount: 'Bankrekening',
            testTransactions: 'Testtransacties',
            issueAndManageCards: 'Kaarten uitgeven en beheren',
            reconcileCards: 'Kaarten afstemmen',
            selectAll: 'Alles selecteren',
            selected: () => ({
                one: '1 geselecteerd',
                other: (count: number) => `${count} geselecteerd`,
            }),
            settlementFrequency: 'Frequentie van afrekening',
            setAsDefault: 'Als standaardwerkruimte instellen',
            defaultNote: `Bonnetjes die naar ${CONST.EMAIL.RECEIPTS} zijn gestuurd, verschijnen in deze workspace.`,
            deleteConfirmation: 'Weet je zeker dat je deze werkruimte wilt verwijderen?',
            deleteWithCardsConfirmation: 'Weet je zeker dat je deze workspace wilt verwijderen? Hiermee worden alle kaartfeeds en toegewezen kaarten verwijderd.',
            unavailable: 'Niet-beschikbare workspace',
            memberNotFound: 'Lid niet gevonden. Gebruik de uitnodigingsknop hierboven om een nieuw lid aan de workspace toe te voegen.',
            notAuthorized: `Je hebt geen toegang tot deze pagina. Als je probeert lid te worden van deze werkruimte, vraag dan gewoon de eigenaar van de werkruimte om je als lid toe te voegen. Iets anders? Neem contact op met ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Ga naar werkruimte',
            duplicateWorkspace: 'Werkruimte dupliceren',
            duplicateWorkspacePrefix: 'Dupliceren',
            goToWorkspaces: 'Ga naar werkruimten',
            clearFilter: 'Filter wissen',
            workspaceName: 'Werkruimte naam',
            workspaceOwner: 'Eigenaar',
            workspaceType: 'Werkruimtetype',
            workspaceAvatar: 'Werkruimte-avatar',
            mustBeOnlineToViewMembers: 'Je moet online zijn om de leden van deze werkruimte te bekijken.',
            moreFeatures: 'Meer functies',
            requested: 'Aangevraagd',
            distanceRates: 'Kilometertarieven',
            defaultDescription: 'Eén plek voor al je bonnetjes en uitgaven.',
            descriptionHint: 'Deel informatie over deze werkruimte met alle leden.',
            welcomeNote: 'Gebruik Expensify om je bonnetjes in te dienen voor terugbetaling, bedankt!',
            subscription: 'Abonnement',
            markAsEntered: 'Markeren als handmatig ingevoerd',
            markAsExported: 'Markeren als geëxporteerd',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exporteren naar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Laten we dubbel controleren of alles er goed uitziet.',
            lineItemLevel: 'Niveau van regelitems',
            reportLevel: 'Rapportniveau',
            topLevel: 'Hoofdniveau',
            appliedOnExport: 'Niet geïmporteerd in Expensify, toegepast bij export',
            shareNote: {
                header: 'Deel je werkruimte met andere leden',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Deel deze QR-code of kopieer de onderstaande link om het voor leden makkelijk te maken om toegang tot je werkruimte aan te vragen. Alle verzoeken om lid te worden van de werkruimte verschijnen in de <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a>-kamer voor jouw beoordeling.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Verbind met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Nieuwe verbinding maken',
            reuseExistingConnection: 'Bestaande verbinding hergebruiken',
            existingConnections: 'Bestaande verbindingen',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Omdat je eerder verbinding hebt gemaakt met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, kun je ervoor kiezen een bestaande verbinding opnieuw te gebruiken of een nieuwe aan te maken.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Laatst gesynchroniseerd op ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Kan geen verbinding maken met ${connectionName} vanwege een authenticatiefout.`,
            learnMore: 'Meer informatie',
            memberAlternateText: 'Leden kunnen rapporten indienen en goedkeuren.',
            adminAlternateText: 'Beheerders hebben volledige bewerkingsrechten voor alle rapporten en werkruimte-instellingen.',
            auditorAlternateText: 'Auditors kunnen rapporten bekijken en erop reageren.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Beheerder';
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
                instant: 'Direct',
                immediate: 'Dagelijks',
                trip: 'Per reis',
                weekly: 'Wekelijks',
                semimonthly: 'Twee keer per maand',
                monthly: 'Maandelijks',
            },
            planType: 'Abonnementstype',
            submitExpense: 'Dien hieronder je onkostendeclaraties in:',
            defaultCategory: 'Standaardcategorie',
            viewTransactions: 'Transacties bekijken',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Declaraties van ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card-transacties worden automatisch geëxporteerd naar een "Expensify Card Liability Account" dat is aangemaakt met <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">onze integratie</a>.</muted-text-label>`,
        },
        receiptPartners: {
            connect: 'Nu verbinden',
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Verbonden met ${organizationName}` : 'Automatiseer reis- en maaltijdbezorgingskosten in uw hele organisatie.',
                sendInvites: 'Uitnodigingen verzenden',
                sendInvitesDescription: 'Deze werkruimteleden hebben nog geen Uber for Business-account. Deselecteer alle leden die je op dit moment niet wilt uitnodigen.',
                confirmInvite: 'Uitnodiging bevestigen',
                manageInvites: 'Uitnodigingen beheren',
                confirm: 'Bevestigen',
                allSet: 'Alles klaar',
                readyToRoll: 'Je bent er helemaal klaar voor',
                takeBusinessRideMessage: 'Neem een zakelijke rit en je Uber-bonnen worden in Expensify geïmporteerd. Sjees weg!',
                all: 'Alles',
                linked: 'Gekoppeld',
                outstanding: 'Openstaand',
                status: {
                    resend: 'Opnieuw verzenden',
                    invite: 'Uitnodigen',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Gekoppeld',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'In behandeling',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Opgeschort',
                },
                centralBillingAccount: 'Centraal factureringsaccount',
                centralBillingDescription: 'Kies waar je alle Uber-bonnen wilt importeren.',
                invitationFailure: 'Uitnodigen van lid voor Uber for Business mislukt',
                autoInvite: 'Nieuwe werkruimteleden uitnodigen voor Uber for Business',
                autoRemove: 'Verwijderde werkruimtedeelnemers deactiveren in Uber for Business',
                bannerTitle: 'Expensify + Uber for Business',
                bannerDescription: 'Koppel Uber for Business om reis- en maaltijdbezorgkosten in uw hele organisatie te automatiseren.',
                emptyContent: {
                    title: 'Geen openstaande uitnodigingen',
                    subtitle: 'Hoera! We hebben overal gezocht en konden geen openstaande uitnodigingen vinden.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Stel dagvergoedingen in om de dagelijkse uitgaven van werknemers te beheren. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Meer informatie</a>.</muted-text>`,
            amount: 'Bedrag',
            deleteRates: () => ({
                one: 'Tarief verwijderen',
                other: 'Tarieven verwijderen',
            }),
            deletePerDiemRate: 'Dagvergoedingstarief verwijderen',
            findPerDiemRate: 'Zoek daggeldtarief',
            areYouSureDelete: () => ({
                one: 'Weet je zeker dat je dit tarief wilt verwijderen?',
                other: 'Weet je zeker dat je deze tarieven wilt verwijderen?',
            }),
            emptyList: {
                title: 'Dagvergoeding',
                subtitle: 'Stel dagvergoedingen in om de dagelijkse uitgaven van werknemers te beheersen. Importeer tarieven uit een spreadsheet om te beginnen.',
            },
            importPerDiemRates: 'Dagvergoedingen importeren',
            editPerDiemRate: 'Dagvergoedingstarief bewerken',
            editPerDiemRates: 'Dagvergoedingen bewerken',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `Het bijwerken van deze bestemming wijzigt deze voor alle per diem-subtarieven van ${destination}.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `Als u deze valuta bijwerkt, wordt deze gewijzigd voor alle ${destination}-daggeldsubtarieven.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Stel in hoe uit eigen zak betaalde uitgaven worden geëxporteerd naar QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Markeert cheques als “later afdrukken”',
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar QuickBooks Desktop.',
            date: 'Exportdatum',
            exportInvoices: 'Facturen exporteren naar',
            exportExpensifyCard: 'Exporteer Expensify Card-transacties als',
            account: 'Account',
            accountDescription: 'Kies waar journaalboekingen moeten worden geboekt.',
            accountsPayable: 'Crediteuren',
            accountsPayableDescription: 'Kies waar leveranciersfacturen worden aangemaakt.',
            bankAccount: 'Bankrekening',
            notConfigured: 'Niet geconfigureerd',
            bankAccountDescription: 'Kies van waar u cheques wilt verzenden.',
            creditCardAccount: 'Creditcardrekening',
            exportDate: {
                label: 'Exportdatum',
                description: 'Gebruik deze datum bij het exporteren van rapporten naar QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum van laatste uitgave',
                        description: 'Datum van de meest recente uitgave in het rapport.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport naar QuickBooks Desktop is geëxporteerd.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Datum van indienen',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            exportCheckDescription: 'We maken een gespecificeerde cheque voor elk Expensify-rapport en versturen die vanaf de onderstaande bankrekening.',
            exportJournalEntryDescription: 'We maken een gespecificeerde journaalboeking voor elk Expensify-rapport en boeken die op de onderstaande rekening.',
            exportVendorBillDescription:
                'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport en voegen deze toe aan de onderstaande rekening. Als deze periode gesloten is, boeken we op de 1e dag van de eerstvolgende open periode.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop ondersteunt geen belastingen bij het exporteren van journaalposten. Omdat je belastingen hebt ingeschakeld in je workspace, is deze exportoptie niet beschikbaar.',
            outOfPocketTaxEnabledError: 'Boekingen zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Creditcard',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Leveranciersfactuur',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journaalpost',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Controleren',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'We maken een gespecificeerde cheque voor elk Expensify-rapport en versturen die vanaf de onderstaande bankrekening.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'We zullen de naam van de handelaar op de creditcardtransactie automatisch koppelen aan alle bijbehorende leveranciers in QuickBooks. Als er geen leveranciers bestaan, maken we een leverancier ‘Credit Card Misc.’ aan voor de koppeling.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport met de datum van de laatste uitgave en voegen deze toe aan de onderstaande rekening. Als deze periode is afgesloten, boeken we op de 1e van de volgende open periode.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Kies waar u creditcardtransacties wilt exporteren.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Kies een leverancier om toe te passen op alle creditcardtransacties.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Kies van waar u cheques wilt verzenden.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Leveranciersfacturen zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Cheques zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Boekingen zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            },
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: 'Voeg de rekening toe in QuickBooks Desktop en synchroniseer de verbinding opnieuw',
            qbdSetup: 'QuickBooks Desktop-instellingen',
            requiredSetupDevice: {
                title: 'Kan geen verbinding maken vanaf dit apparaat',
                body1: 'U moet deze verbinding instellen vanaf de computer waarop uw QuickBooks Desktop-bedrijfsbestand wordt gehost.',
                body2: 'Zodra je verbonden bent, kun je overal synchroniseren en exporteren.',
            },
            setupPage: {
                title: 'Open deze link om te verbinden',
                body: 'Om de installatie te voltooien, opent u de volgende link op de computer waarop QuickBooks Desktop wordt uitgevoerd.',
                setupErrorTitle: 'Er is iets misgegaan',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>De QuickBooks Desktop-verbinding werkt momenteel niet. Probeer het later opnieuw of <a href="${conciergeLink}">neem contact op met Concierge</a> als het probleem aanhoudt.</centered-text></muted-text>`,
            },
            importDescription: 'Kies welke codeconfiguraties u wilt importeren van QuickBooks Desktop naar Expensify.',
            classes: 'Klassen',
            items: 'Items',
            customers: 'Klanten/projecten',
            exportCompanyCardsDescription: 'Stel in hoe aankopen met bedrijfskaarten worden geëxporteerd naar QuickBooks Desktop.',
            defaultVendorDescription: 'Stel een standaardleverancier in die wordt toegepast op alle creditcardtransacties bij het exporteren.',
            accountsDescription: 'Je QuickBooks Desktop-rekeningschema wordt in Expensify geïmporteerd als categorieën.',
            accountsSwitchTitle: 'Kies of je nieuwe rekeningen wilt importeren als ingeschakelde of uitgeschakelde categorieën.',
            accountsSwitchDescription: 'Ingeschakelde categorieën zijn beschikbaar voor leden om te selecteren bij het aanmaken van hun uitgaven.',
            classesDescription: 'Kies hoe QuickBooks Desktop-klassen in Expensify moeten worden verwerkt.',
            tagsDisplayedAsDescription: 'Regelpostniveau',
            reportFieldsDisplayedAsDescription: 'Rapportniveau',
            customersDescription: 'Kies hoe QuickBooks Desktop-klanten/projecten in Expensify moeten worden verwerkt.',
            advancedConfig: {
                autoSyncDescription: 'Expensify zal elke dag automatisch synchroniseren met QuickBooks Desktop.',
                createEntities: 'Entiteiten automatisch aanmaken',
                createEntitiesDescription: 'Expensify maakt automatisch leveranciers aan in QuickBooks Desktop als ze nog niet bestaan.',
            },
            itemsDescription: 'Kies hoe QuickBooks Desktop-items in Expensify moeten worden verwerkt.',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer de onkosten worden geëxporteerd:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Transactiebasis',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak betaalde uitgaven worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Eigen uitgaven worden geëxporteerd zodra ze zijn betaald',
                },
            },
        },
        qbo: {
            connectedTo: 'Verbonden met',
            importDescription: 'Kies welke coderingsconfiguraties je uit QuickBooks Online naar Expensify wilt importeren.',
            classes: 'Klassen',
            locations: 'Locaties',
            customers: 'Klanten/projecten',
            accountsDescription: 'Je rekeningschema uit QuickBooks Online wordt in Expensify geïmporteerd als categorieën.',
            accountsSwitchTitle: 'Kies of je nieuwe rekeningen wilt importeren als ingeschakelde of uitgeschakelde categorieën.',
            accountsSwitchDescription: 'Ingeschakelde categorieën zijn beschikbaar voor leden om te selecteren bij het aanmaken van hun uitgaven.',
            classesDescription: 'Kies hoe je QuickBooks Online-classes in Expensify wilt verwerken.',
            customersDescription: 'Kies hoe je QuickBooks Online-klanten/-projecten in Expensify wilt verwerken.',
            locationsDescription: 'Kies hoe je QuickBooks Online-locaties in Expensify wilt verwerken.',
            taxesDescription: 'Kies hoe u QuickBooks Online-belastingen in Expensify wilt afhandelen.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online ondersteunt geen Locaties op regelniveau voor Cheques of Leveranciersfacturen. Als u locaties op regelniveau wilt gebruiken, zorg er dan voor dat u Boekingen en Credit-/Debitkaartuitgaven gebruikt.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online ondersteunt geen belastingen op journaalposten. Wijzig je exportoptie naar leveranciersfactuur of cheque.',
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
                        description: 'Datum van de meest recente uitgave in het rapport.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport is geëxporteerd naar QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Datum van indienen',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            receivable: 'Debiteuren', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archief debiteuren', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Gebruik deze rekening bij het exporteren van facturen naar QuickBooks Online.',
            exportCompanyCardsDescription: 'Stel in hoe aankopen met bedrijfskaarten worden geëxporteerd naar QuickBooks Online.',
            vendor: 'Leverancier',
            defaultVendorDescription: 'Stel een standaardleverancier in die wordt toegepast op alle creditcardtransacties bij het exporteren.',
            exportOutOfPocketExpensesDescription: 'Stel in hoe onkosten uit eigen zak worden geëxporteerd naar QuickBooks Online.',
            exportCheckDescription: 'We maken een gespecificeerde cheque voor elk Expensify-rapport en versturen die vanaf de onderstaande bankrekening.',
            exportJournalEntryDescription: 'We maken een gespecificeerde journaalboeking voor elk Expensify-rapport en boeken die op de onderstaande rekening.',
            exportVendorBillDescription:
                'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport en voegen deze toe aan de onderstaande rekening. Als deze periode gesloten is, boeken we op de 1e dag van de eerstvolgende open periode.',
            account: 'Account',
            accountDescription: 'Kies waar journaalboekingen moeten worden geboekt.',
            accountsPayable: 'Crediteuren',
            accountsPayableDescription: 'Kies waar leveranciersfacturen worden aangemaakt.',
            bankAccount: 'Bankrekening',
            notConfigured: 'Niet geconfigureerd',
            bankAccountDescription: 'Kies van waar u cheques wilt verzenden.',
            creditCardAccount: 'Creditcardrekening',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online ondersteunt geen locaties bij het exporteren van leveranciersfacturen. Omdat je locaties hebt ingeschakeld in je workspace, is deze exportoptie niet beschikbaar.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online ondersteunt geen belastingen op exports van journaalboekingen. Omdat je belastingen hebt ingeschakeld in je werkruimte, is deze exportoptie niet beschikbaar.',
            outOfPocketTaxEnabledError: 'Boekingen zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            advancedConfig: {
                autoSyncDescription: 'Expensify zal dagelijks automatisch synchroniseren met QuickBooks Online.',
                inviteEmployees: 'Werknemers uitnodigen',
                inviteEmployeesDescription: 'Importeer QuickBooks Online-medewerkersrecords en nodig medewerkers uit naar deze werkruimte.',
                createEntities: 'Entiteiten automatisch aanmaken',
                createEntitiesDescription:
                    'Expensify maakt automatisch leveranciers aan in QuickBooks Online als ze nog niet bestaan, en maakt automatisch klanten aan bij het exporteren van facturen.',
                reimbursedReportsDescription:
                    'Elke keer dat een rapport wordt betaald via Expensify ACH, wordt de bijbehorende factuurbeta ling aangemaakt in het QuickBooks Online-account hieronder.',
                qboBillPaymentAccount: 'QuickBooks-betaalrekening voor rekeningen',
                qboInvoiceCollectionAccount: 'QuickBooks-factuurincassorekening',
                accountSelectDescription: 'Kies vanwaar u rekeningen wilt betalen en wij maken de betaling aan in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Kies waar je factuurbetalingen wilt ontvangen en wij maken de betaling aan in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Debetkaart',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Creditcard',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Leveranciersfactuur',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journaalpost',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Controleren',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'We koppelen de naam van de verkoper op de pintransactie automatisch aan alle bijbehorende leveranciers in QuickBooks. Als er geen leveranciers bestaan, maken we een leverancier ‘Debit Card Misc.’ aan voor de koppeling.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'We zullen de naam van de handelaar op de creditcardtransactie automatisch koppelen aan alle bijbehorende leveranciers in QuickBooks. Als er geen leveranciers bestaan, maken we een leverancier ‘Credit Card Misc.’ aan voor de koppeling.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport met de datum van de laatste uitgave en voegen deze toe aan de onderstaande rekening. Als deze periode is afgesloten, boeken we op de 1e van de volgende open periode.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Kies waar u debetkaarttransacties wilt exporteren.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Kies waar u creditcardtransacties wilt exporteren.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Kies een leverancier om toe te passen op alle creditcardtransacties.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Leveranciersfacturen zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Cheques zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: 'Boekingen zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Kies een geldige rekening voor export van leveranciersfacturen',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Kies een geldig account voor journaalpostexport',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Kies een geldig account voor cheque-export',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Om de export van leveranciersfacturen te gebruiken, stelt u een crediteurenrekening in in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Om journaalpostexport te gebruiken, stelt u een journaalrekening in in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Om cheque-export te gebruiken, stelt u een bankrekening in in QuickBooks Online',
            },
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: 'Voeg de rekening toe in QuickBooks Online en synchroniseer de verbinding opnieuw.',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer de onkosten worden geëxporteerd:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Transactiebasis',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak betaalde uitgaven worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Eigen uitgaven worden geëxporteerd zodra ze zijn betaald',
                },
            },
        },
        workspaceList: {
            joinNow: 'Nu deelnemen',
            askToJoin: 'Toegang aanvragen',
        },
        xero: {
            organization: 'Xero-organisatie',
            organizationDescription: 'Kies de Xero-organisatie waarvan u gegevens wilt importeren.',
            importDescription: 'Kies welke coderingsconfiguraties je vanuit Xero naar Expensify wilt importeren.',
            accountsDescription: 'Je Xero-rekeningschema wordt in Expensify geïmporteerd als categorieën.',
            accountsSwitchTitle: 'Kies of je nieuwe rekeningen wilt importeren als ingeschakelde of uitgeschakelde categorieën.',
            accountsSwitchDescription: 'Ingeschakelde categorieën zijn beschikbaar voor leden om te selecteren bij het aanmaken van hun uitgaven.',
            trackingCategories: 'Volgcategorieën',
            trackingCategoriesDescription: 'Kies hoe Xero-trackingcategorieën in Expensify worden verwerkt.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Koppel ${categoryName} aan Xero`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Kies waar u ${categoryName} wilt toewijzen bij het exporteren naar Xero.`,
            customers: 'Kosten doorbelasten aan klanten',
            customersDescription:
                'Kies of je klanten in Expensify opnieuw in rekening wilt brengen. Je Xero-klantcontacten kunnen aan uitgaven worden gekoppeld en worden als een verkoopfactuur naar Xero geëxporteerd.',
            taxesDescription: 'Kies hoe Xero-belastingen in Expensify worden verwerkt.',
            notImported: 'Niet geïmporteerd',
            notConfigured: 'Niet geconfigureerd',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Standaard Xero-contact',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Rapportvelden',
            },
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar Xero.',
            purchaseBill: 'Inkoopfactuur',
            exportDeepDiveCompanyCard:
                'Geëxporteerde uitgaven worden als banktransacties geboekt op de onderstaande Xero-bankrekening en de transactiedata komen overeen met de data op uw bankafschrift.',
            bankTransactions: 'Banktransacties',
            xeroBankAccount: 'Xero-bankrekening',
            xeroBankAccountDescription: 'Kies waar uitgaven worden geboekt als banktransacties.',
            exportExpensesDescription: 'Rapporten worden geëxporteerd als een inkoopfactuur met de datum en status die hieronder zijn geselecteerd.',
            purchaseBillDate: 'Aankoopsfactuurdatum',
            exportInvoices: 'Facturen exporteren als',
            salesInvoice: 'Verkoopfactuur',
            exportInvoicesDescription: 'Verkoopfacturen geven altijd de datum weer waarop de factuur is verzonden.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wordt elke dag automatisch met Xero gesynchroniseerd.',
                purchaseBillStatusTitle: 'Status inkoopfactuur',
                reimbursedReportsDescription:
                    'Telkens wanneer een rapport wordt betaald via Expensify ACH, wordt de bijbehorende factuurbetaling aangemaakt in de onderstaande Xero-account.',
                xeroBillPaymentAccount: 'Xero-rekening voor factuurbetaalrekening',
                xeroInvoiceCollectionAccount: 'Xero-incassorekening voor facturen',
                xeroBillPaymentAccountDescription: 'Kies vanwaar u rekeningen wilt betalen en wij maken de betaling aan in Xero.',
                invoiceAccountSelectorDescription: 'Kies waar je factuurbetalingen wilt ontvangen en wij maken de betaling aan in Xero.',
            },
            exportDate: {
                label: 'Aankoopsfactuurdatum',
                description: 'Gebruik deze datum bij het exporteren van rapporten naar Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum van laatste uitgave',
                        description: 'Datum van de meest recente uitgave in het rapport.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport is geëxporteerd naar Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Datum van indienen',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status inkoopfactuur',
                description: 'Gebruik deze status bij het exporteren van inkoopfacturen naar Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Concept',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'In afwachting van goedkeuring',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'In afwachting van betaling',
                },
            },
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: 'Voeg het account toe in Xero en synchroniseer de verbinding opnieuw',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer de onkosten worden geëxporteerd:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Transactiebasis',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak betaalde uitgaven worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Eigen uitgaven worden geëxporteerd zodra ze zijn betaald',
                },
            },
        },
        sageIntacct: {
            preferredExporter: 'Voorkeursexporteur',
            taxSolution: 'Belastingoplossing',
            notConfigured: 'Niet geconfigureerd',
            exportDate: {
                label: 'Exportdatum',
                description: 'Gebruik deze datum bij het exporteren van rapporten naar Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum van laatste uitgave',
                        description: 'Datum van de meest recente uitgave in het rapport.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport is geëxporteerd naar Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Datum van indienen',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Stel in hoe uit eigen zak betaalde uitgaven worden geëxporteerd naar Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Onkostendeclaraties',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Leveranciersfacturen',
                },
            },
            nonReimbursableExpenses: {
                description: 'Stel in hoe aankopen met bedrijfskaarten worden geëxporteerd naar Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Creditcards',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Leveranciersfacturen',
                },
            },
            creditCardAccount: 'Creditcardrekening',
            defaultVendor: 'Standaardleverancier',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Stel een standaardleverancier in die wordt toegepast op ${isReimbursable ? '' : 'niet-'}vergoedbare uitgaven waarvoor geen overeenkomende leverancier in Sage Intacct bestaat.`,
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar Sage Intacct.',
            exportPreferredExporterNote:
                'De voorkeurs-exporteur kan elke werkruimtebeheerder zijn, maar moet ook een domeinbeheerder zijn als je in Domeininstellingen verschillende exportrekeningen instelt voor individuele bedrijfskaarten.',
            exportPreferredExporterSubNote: 'Eenmaal ingesteld, ziet de voorkeurs-exporteur rapporten om te exporteren in zijn of haar account.',
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: `Voeg het account toe in Sage Intacct en synchroniseer de verbinding opnieuw`,
            autoSync: 'Automatisch synchroniseren',
            autoSyncDescription: 'Expensify zal automatisch elke dag synchroniseren met Sage Intacct.',
            inviteEmployees: 'Werknemers uitnodigen',
            inviteEmployeesDescription:
                'Importeer Sage Intacct-medewerkerrecords en nodig medewerkers uit naar deze workspace. Uw goedkeuringsworkflow wordt standaard ingesteld op goedkeuring door de manager en kan verder worden geconfigureerd op de pagina Leden.',
            syncReimbursedReports: 'Terugbetaalde rapporten synchroniseren',
            syncReimbursedReportsDescription:
                'Telkens wanneer een rapport wordt betaald via Expensify ACH, wordt de bijbehorende factuurbetaling aangemaakt in de Sage Intacct-account hieronder.',
            paymentAccount: 'Sage Intacct-betaalrekening',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer de onkosten worden geëxporteerd:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Transactiebasis',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak betaalde uitgaven worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Eigen uitgaven worden geëxporteerd zodra ze zijn betaald',
                },
            },
        },
        netsuite: {
            subsidiary: 'Dochteronderneming',
            subsidiarySelectDescription: 'Kies de dochteronderneming in NetSuite waarvan je gegevens wilt importeren.',
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar NetSuite.',
            exportInvoices: 'Facturen exporteren naar',
            journalEntriesTaxPostingAccount: 'Rekening voor belastingboeking van journaalposten',
            journalEntriesProvTaxPostingAccount: 'Boekingen provinciale belastingboekingrekening',
            foreignCurrencyAmount: 'Bedrag in vreemde valuta exporteren',
            exportToNextOpenPeriod: 'Exporteren naar volgende open periode',
            nonReimbursableJournalPostingAccount: 'Niet-vergoedbare journaalboekingsrekening',
            reimbursableJournalPostingAccount: 'Vergoedbaar journaalboekingsrekening',
            journalPostingPreference: {
                label: 'Voorkeur voor het boeken van journaalposten',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Afzonderlijke, gespecificeerde boeking voor elk rapport',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Enkele invoer voor elke uitgave',
                },
            },
            invoiceItem: {
                label: 'Factuurregel',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Maak er een voor mij',
                        description: 'We maken een “Expensify-factuurregelitem” voor je aan bij het exporteren (als er nog geen bestaat).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Selecteer bestaand',
                        description: 'We koppelen facturen van Expensify aan het item dat hieronder is geselecteerd.',
                    },
                },
            },
            exportDate: {
                label: 'Exportdatum',
                description: 'Gebruik deze datum bij het exporteren van rapporten naar NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum van laatste uitgave',
                        description: 'Datum van de meest recente uitgave in het rapport.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport naar NetSuite is geëxporteerd.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Datum van indienen',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Onkostendeclaraties',
                        reimbursableDescription: 'Zelfbetaalde uitgaven worden als onkostendeclaraties naar NetSuite geëxporteerd.',
                        nonReimbursableDescription: 'Bedrijfspaskosten worden als onkostendeclaraties geëxporteerd naar NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Leveranciersfacturen',
                        reimbursableDescription: dedent(`
                            Uitgaven uit eigen zak worden geëxporteerd als facturen die betaalbaar zijn aan de hieronder gespecificeerde NetSuite‑leverancier.

                            Als u voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Uitgaven met bedrijfskaarten worden geëxporteerd als facturen die betaalbaar zijn aan de hieronder opgegeven NetSuite-leverancier.

                            Als u een specifieke leverancier voor elke kaart wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Journaalposten',
                        reimbursableDescription: dedent(`
                            Uitgaven uit eigen zak worden als journaalposten geëxporteerd naar de NetSuite-rekening die hieronder is opgegeven.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Uitgaven met bedrijfskaarten worden als journaalposten geëxporteerd naar de hieronder gespecificeerde NetSuite-rekening.

                            Als u voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Als u de exportinstelling voor bedrijfskaarten wijzigt naar onkostendeclaraties, worden NetSuite-leveranciers en boekingsrekeningen voor individuele kaarten uitgeschakeld.\n\nMaak u geen zorgen, we bewaren uw vorige selecties voor het geval u later weer wilt terugschakelen.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify zal elke dag automatisch synchroniseren met NetSuite.',
                reimbursedReportsDescription:
                    'Elke keer dat een rapport wordt betaald via Expensify ACH, wordt de bijbehorende factuurbetaling aangemaakt in het onderstaande NetSuite-account.',
                reimbursementsAccount: 'Vergoedingsrekening',
                reimbursementsAccountDescription: 'Kies de bankrekening die je voor terugbetalingen wilt gebruiken, dan maken wij de bijbehorende betaling aan in NetSuite.',
                collectionsAccount: 'Incassorekening',
                collectionsAccountDescription: 'Zodra een factuur in Expensify als betaald is gemarkeerd en naar NetSuite is geëxporteerd, verschijnt deze bij de onderstaande rekening.',
                approvalAccount: 'A/P-goedkeuringsaccount',
                approvalAccountDescription:
                    'Kies de rekening waarop transacties zullen worden goedgekeurd in NetSuite. Als je terugbetaalde rapporten synchroniseert, is dit ook de rekening waarop betalingsopdrachten worden aangemaakt.',
                defaultApprovalAccount: 'NetSuite-standaard',
                inviteEmployees: 'Nodig werknemers uit en stel goedkeuringen in',
                inviteEmployeesDescription:
                    'Import NetSuite-medewerkersrecords en nodig medewerkers uit naar deze werkruimte. Uw goedkeuringsworkflow wordt standaard ingesteld op managergoedkeuring en kan verder worden geconfigureerd op de pagina *Leden*.',
                autoCreateEntities: 'Automatisch werknemers/leveranciers aanmaken',
                enableCategories: 'Nieuw geïmporteerde categorieën inschakelen',
                customFormID: 'Aangepaste formulier-ID',
                customFormIDDescription:
                    'Standaard maakt Expensify boekingen aan met behulp van het voorkeursboekingsformulier dat is ingesteld in NetSuite. Als alternatief kunt u een specifiek boekingsformulier aanwijzen dat moet worden gebruikt.',
                customFormIDReimbursable: 'Zakelijke uitgave uit eigen zak',
                customFormIDNonReimbursable: 'Zakelijke kaartuitgave',
                exportReportsTo: {
                    label: 'Goedkeuringsniveau onkostendeclaratie',
                    description:
                        'Zodra een onkostendeclaratie is goedgekeurd in Expensify en geëxporteerd naar NetSuite, kun je in NetSuite een extra goedkeuringsniveau instellen voordat je boekt.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Standaardvoorkeur voor NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Alleen goedgekeurd door leidinggevende',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Alleen door boekhouding goedgekeurd',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Supervisor en boekhouding goedgekeurd',
                    },
                },
                accountingMethods: {
                    label: 'Wanneer exporteren',
                    description: 'Kies wanneer de onkosten worden geëxporteerd:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Transactiebasis',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak betaalde uitgaven worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Eigen uitgaven worden geëxporteerd zodra ze zijn betaald',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Goedkeuringsniveau leveranciersfactuur',
                    description:
                        'Zodra een leveranciersfactuur in Expensify is goedgekeurd en naar NetSuite is geëxporteerd, kunt u in NetSuite een extra goedkeuringsniveau instellen voordat u deze boekt.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Standaardvoorkeur voor NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'In afwachting van goedkeuring',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Goedgekeurd voor boeking',
                    },
                },
                exportJournalsTo: {
                    label: 'Goedkeuringsniveau journaalboeking',
                    description:
                        'Zodra een journaalboeking in Expensify is goedgekeurd en naar NetSuite is geëxporteerd, kunt u in NetSuite een extra goedkeuringsniveau instellen voordat u boekt.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Standaardvoorkeur voor NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'In afwachting van goedkeuring',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Goedgekeurd voor boeking',
                    },
                },
                error: {
                    customFormID: 'Voer een geldige numerieke aangepaste formulier-ID in',
                },
            },
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: 'Voeg het account toe in NetSuite en synchroniseer de koppeling opnieuw',
            noVendorsFound: 'Geen leveranciers gevonden',
            noVendorsFoundDescription: 'Voeg leveranciers toe in NetSuite en synchroniseer de verbinding opnieuw',
            noItemsFound: 'Geen factuurregels gevonden',
            noItemsFoundDescription: 'Voeg factuurregels toe in NetSuite en synchroniseer de verbinding opnieuw',
            noSubsidiariesFound: 'Geen dochterondernemingen gevonden',
            noSubsidiariesFoundDescription: 'Voeg een dochteronderneming toe in NetSuite en synchroniseer de verbinding opnieuw.',
            tokenInput: {
                title: 'NetSuite-installatie',
                formSteps: {
                    installBundle: {
                        title: 'Installeer de Expensify-bundel',
                        description: 'Ga in NetSuite naar *Customization > SuiteBundler > Search & Install Bundles* > zoek naar "Expensify" > installeer de bundle.',
                    },
                    enableTokenAuthentication: {
                        title: 'Token-gebaseerde verificatie inschakelen',
                        description: 'Ga in NetSuite naar *Setup > Company > Enable Features > SuiteCloud* en schakel *token-based authentication* in.',
                    },
                    enableSoapServices: {
                        title: 'SOAP-webservices inschakelen',
                        description: 'Ga in NetSuite naar *Setup > Company > Enable Features > SuiteCloud* en schakel *SOAP Web Services* in.',
                    },
                    createAccessToken: {
                        title: 'Een toegangstoken aanmaken',
                        description:
                            'Ga in NetSuite naar *Setup > Users/Roles > Access Tokens* en maak een access token aan voor de app "Expensify" en de rol "Expensify Integration" of "Administrator".\n\n*Belangrijk:* Zorg dat je de *Token ID* en *Token Secret* uit deze stap opslaat. Je hebt die nodig voor de volgende stap.',
                    },
                    enterCredentials: {
                        title: 'Voer je NetSuite-inloggegevens in',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite-account-ID',
                            netSuiteTokenID: 'Token-ID',
                            netSuiteTokenSecret: 'Tokensleutel',
                        },
                        netSuiteAccountIDDescription: 'Ga in NetSuite naar *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Onkostencategorieën',
                expenseCategoriesDescription: 'Je NetSuite-onkostencategorieën worden als categorieën in Expensify geïmporteerd.',
                crossSubsidiaryCustomers: 'Klantprojecten tussen dochterondernemingen',
                importFields: {
                    departments: {
                        title: 'Afdelingen',
                        subtitle: 'Kies hoe je de NetSuite-*afdelingen* in Expensify wilt behandelen.',
                    },
                    classes: {
                        title: 'Klassen',
                        subtitle: 'Kies hoe je *classes* in Expensify wilt gebruiken.',
                    },
                    locations: {
                        title: 'Locaties',
                        subtitle: 'Kies hoe u *locaties* in Expensify wilt verwerken.',
                    },
                },
                customersOrJobs: {
                    title: 'Klanten/projecten',
                    subtitle: 'Kies hoe NetSuite-*klanten* en *projecten* in Expensify moeten worden verwerkt.',
                    importCustomers: 'Klanten importeren',
                    importJobs: 'Projecten importeren',
                    customers: 'klanten',
                    jobs: 'projecten',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('en')}, ${importType}`,
                },
                importTaxDescription: 'Belastinggroepen importeren uit NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Kies een van de onderstaande opties:',
                    label: ({importedTypes}: ImportedTypesParams) => `Geïmporteerd als ${importedTypes.join('en')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Voer de ${fieldName} in`,
                    customSegments: {
                        title: 'Aangepaste segmenten/records',
                        addText: 'Aangepast segment/record toevoegen',
                        recordTitle: 'Aangepast segment/record',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Bekijk gedetailleerde instructies',
                        helpText: 'over het configureren van aangepaste segmenten/records.',
                        emptyTitle: 'Voeg een aangepast segment of aangepast record toe',
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
                            segmentRecordType: 'Wil je een aangepast segment of een aangepast record toevoegen?',
                            customSegmentNameTitle: 'Wat is de naam van het aangepaste segment?',
                            customRecordNameTitle: 'Wat is de naam van het aangepaste record?',
                            customSegmentNameFooter: `Je kunt aangepaste segmentnamen vinden in NetSuite op de pagina *Customizations > Links, Records & Fields > Custom Segments*.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `U kunt aangepaste recordnamen in NetSuite vinden door "Transaction Column Field" in de globale zoekfunctie in te voeren.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Wat is de interne ID?',
                            customSegmentInternalIDFooter: `Zorg er eerst voor dat je interne ID's hebt ingeschakeld in NetSuite onder *Home > Set Preferences > Show Internal ID.*

Je kunt interne ID's van aangepaste segmenten in NetSuite vinden onder:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klik op een aangepast segment.
3. Klik op de hyperlink naast *Custom Record Type*.
4. Zoek de interne ID in de tabel onderaan.

_Voor meer gedetailleerde instructies [bezoek je onze help-pagina](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Je kunt de interne ID’s van aangepaste records in NetSuite vinden door de volgende stappen te volgen:

1. Voer "Transaction Line Fields" in bij de globale zoekopdracht.
2. Klik op een aangepast record.
3. Zoek de interne ID aan de linkerkant.

_Voor meer gedetailleerde instructies, [bezoek onze helppagina](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Wat is de script-ID?',
                            customSegmentScriptIDFooter: `Je kunt script-ID’s van aangepaste segmenten in NetSuite vinden onder:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klik op een aangepast segment.
3. Klik op het tabblad *Application and Sourcing* onderaan en doe vervolgens het volgende:
    a. Als je het aangepaste segment als een *tag* (op regelniveau) in Expensify wilt weergeven, klik je op het subtblad *Transaction Columns* en gebruik je de *Field ID*.
    b. Als je het aangepaste segment als een *report field* (op rapportniveau) in Expensify wilt weergeven, klik je op het subtblad *Transactions* en gebruik je de *Field ID*.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Wat is de transactiekolom-ID?',
                            customRecordScriptIDFooter: `Je kunt aangepaste recordscript-ID's in NetSuite vinden onder:

1. Voer "Transaction Line Fields" in de globale zoekopdracht in.
2. Klik op een aangepast record.
3. Zoek de script-ID aan de linkerkant.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Hoe moet dit aangepaste segment worden weergegeven in Expensify?',
                            customRecordMappingTitle: 'Hoe moet dit aangepaste record worden weergegeven in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Er bestaat al een aangepast segment/record met deze ${fieldName?.toLowerCase()}`,
                        },
                    },
                    customLists: {
                        title: 'Aangepaste lijsten',
                        addText: 'Aangepaste lijst toevoegen',
                        recordTitle: 'Aangepaste lijst',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Bekijk gedetailleerde instructies',
                        helpText: 'over het configureren van aangepaste lijsten.',
                        emptyTitle: 'Aangepaste lijst toevoegen',
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
                            transactionFieldIDTitle: 'Wat is de transactievak-ID?',
                            transactionFieldIDFooter: `U kunt transactievak-ID’s vinden in NetSuite door deze stappen te volgen:

1. Voer "Transaction Line Fields" in in de globale zoekopdracht.
2. Klik op een aangepaste lijst.
3. Zoek de transactievak-ID aan de linkerkant.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Hoe moet deze aangepaste lijst worden weergegeven in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Er bestaat al een aangepaste lijst met deze transactievak-ID`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Standaard NetSuite-medewerker',
                        description: 'Niet geïmporteerd in Expensify, toegepast bij export',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Als u ${importField} in NetSuite gebruikt, passen we de standaardwaarde die is ingesteld op het werknemersrecord toe bij export naar Expense Report of Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'Niveau van regelitems',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `${startCase(importField)} zal selecteerbaar zijn voor elke afzonderlijke uitgave op het rapport van een werknemer.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Rapportvelden',
                        description: 'Rapportniveau',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)}-selectie wordt toegepast op alle onkosten in het rapport van een medewerker.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct-configuratie',
            prerequisitesTitle: 'Voordat u verbinding maakt...',
            downloadExpensifyPackage: 'Download het Expensify-pakket voor Sage Intacct',
            followSteps: 'Volg de stappen in onze instructies ‘How-to: Connect to Sage Intacct’',
            enterCredentials: 'Voer uw Sage Intacct-inloggegevens in',
            entity: 'Entiteit',
            employeeDefault: 'Standaardinstelling Sage Intacct-medewerker',
            employeeDefaultDescription: 'De standaardafdeling van de medewerker wordt, indien aanwezig, toegepast op hun onkosten in Sage Intacct.',
            displayedAsTagDescription: 'Afdeling kan worden geselecteerd voor elke individuele uitgave op het rapport van een werknemer.',
            displayedAsReportFieldDescription: 'De selectie van de afdeling wordt toegepast op alle uitgaven in het rapport van een werknemer.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Kies hoe Sage Intacct-<strong>${mappingTitle}</strong> in Expensify moet worden verwerkt.`,
            expenseTypes: 'Uitgaventypen',
            expenseTypesDescription: 'Uw Sage Intacct-uitgavensoorten worden in Expensify geïmporteerd als categorieën.',
            accountTypesDescription: 'Uw Sage Intacct grootboekschema wordt in Expensify geïmporteerd als categorieën.',
            importTaxDescription: 'Belastingtarief voor inkoop importeren uit Sage Intacct.',
            userDefinedDimensions: 'Door de gebruiker gedefinieerde dimensies',
            addUserDefinedDimension: 'Door gebruiker gedefinieerde dimensie toevoegen',
            integrationName: 'Naam van integratie',
            dimensionExists: 'Er bestaat al een dimensie met deze naam.',
            removeDimension: 'Gebruikersgedefinieerde dimensie verwijderen',
            removeDimensionPrompt: 'Weet je zeker dat je deze door de gebruiker gedefinieerde dimensie wilt verwijderen?',
            userDefinedDimension: 'Door gebruiker gedefinieerde dimensie',
            addAUserDefinedDimension: 'Een door de gebruiker gedefinieerde dimensie toevoegen',
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
                        return 'klassen';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'Locaties';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'klanten';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'projecten (opdrachten)';
                    default:
                        return 'koppelingen';
                }
            },
        },
        type: {
            free: 'Gratis',
            control: 'Controle',
            collect: 'Verzamelen',
        },
        companyCards: {
            addCards: 'Kaarten toevoegen',
            selectCards: 'Kaarten selecteren',
            addNewCard: {
                other: 'Overig',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard zakelijke kaarten',
                    vcf: 'Visa Zakelijke Kaarten',
                    stripe: 'Stripe-kaarten',
                },
                yourCardProvider: `Wie is de uitgever van je kaart?`,
                whoIsYourBankAccount: 'Wat is uw bank?',
                whereIsYourBankLocated: 'Waar is uw bank gevestigd?',
                howDoYouWantToConnect: 'Hoe wil je verbinding maken met je bank?',
                learnMoreAboutOptions: `<muted-text>Meer informatie over deze <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">opties</a>.</muted-text>`,
                commercialFeedDetails: 'Hiervoor is een koppeling met uw bank nodig. Dit wordt meestal gebruikt door grotere bedrijven en is vaak de beste optie als u in aanmerking komt.',
                commercialFeedPlaidDetails: `Vereist inrichting met uw bank, maar wij begeleiden u daarbij. Dit is doorgaans beperkt tot grotere bedrijven.`,
                directFeedDetails: 'De eenvoudigste aanpak. Maak direct verbinding met je hoofd-inloggegevens. Deze methode komt het meest voor.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Schakel je ${provider}-feed in`,
                    heading:
                        'We hebben een directe koppeling met uw kaarthouder en kunnen uw transactiegegevens snel en nauwkeurig in Expensify importeren.\n\nOm aan de slag te gaan, hoeft u alleen maar het volgende te doen:',
                    visa: 'We hebben wereldwijde integraties met Visa, al verschilt de geschiktheid per bank en kaartprogramma.\n\nOm te beginnen hoeft u alleen maar:',
                    mastercard: 'We hebben wereldwijde integraties met Mastercard, al verschilt de geschiktheid per bank en kaartprogramma.\n\nOm te beginnen hoef je alleen maar:',
                    vcf: `1. Bezoek [dit helpartikel](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) voor gedetailleerde instructies over het instellen van je Visa Commercial Cards.

2. [Neem contact op met je bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) om te verifiëren dat zij een commerciële feed voor je programma ondersteunen en vraag hen deze in te schakelen.

3. *Zodra de feed is ingeschakeld en je de details hebt, ga je verder naar het volgende scherm.*`,
                    gl1025: `1. Bezoek [dit helpartikel](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) om te ontdekken of American Express een commerciële feed voor uw programma kan inschakelen.

2. Zodra de feed is ingeschakeld, stuurt Amex u een productietoezegging.

3. *Zodra u de feedinformatie hebt, gaat u door naar het volgende scherm.*`,
                    cdf: `1. Bezoek [dit helpartikel](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) voor gedetailleerde instructies over het instellen van je Mastercard Commercial Cards.

2. [Neem contact op met je bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) om te controleren of zij een commerciële feed voor je programma ondersteunen en vraag hen deze in te schakelen.

3. *Zodra de feed is ingeschakeld en je de gegevens hebt, ga je verder naar het volgende scherm.*`,
                    stripe: `1. Ga naar het Stripe-dashboard en vervolgens naar [Instellingen](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Klik onder Productintegraties op Inschakelen naast Expensify.

3. Zodra de feed is ingeschakeld, klik hieronder op Verzenden en wij gaan ermee aan de slag om deze toe te voegen.`,
                },
                whatBankIssuesCard: 'Welke bank geeft deze kaarten uit?',
                enterNameOfBank: 'Naam van bank invoeren',
                feedDetails: {
                    vcf: {
                        title: 'Wat zijn de details van de Visa-feed?',
                        processorLabel: 'Processor-ID',
                        bankLabel: 'ID financiële instelling (bank)',
                        companyLabel: 'Bedrijfs-ID',
                        helpLabel: "Waar vind ik deze ID's?",
                    },
                    gl1025: {
                        title: `Wat is de bestandsnaam voor de Amex-levering?`,
                        fileNameLabel: 'Bestandsnaam voor levering',
                        helpLabel: 'Waar vind ik de naam van het leveringsbestand?',
                    },
                    cdf: {
                        title: `Wat is de Mastercard-distributie-ID?`,
                        distributionLabel: 'Distributie-ID',
                        helpLabel: 'Waar kan ik de distributie-ID vinden?',
                    },
                },
                amexCorporate: 'Selecteer dit als er “Corporate” op de voorkant van je kaarten staat',
                amexBusiness: 'Selecteer dit als op de voorkant van je kaarten “Business” staat',
                amexPersonal: 'Selecteer dit als je kaarten persoonlijk zijn',
                error: {
                    pleaseSelectProvider: 'Selecteer een kaartaanbieder voordat u doorgaat',
                    pleaseSelectBankAccount: 'Selecteer een bankrekening voordat je doorgaat',
                    pleaseSelectBank: 'Selecteer eerst een bank voordat je verdergaat',
                    pleaseSelectCountry: 'Selecteer een land voordat je doorgaat',
                    pleaseSelectFeedType: 'Selecteer een feedtype voordat je doorgaat',
                },
                exitModal: {
                    title: 'Werkt er iets niet?',
                    prompt: 'We hebben gemerkt dat je het toevoegen van je kaarten niet hebt afgerond. Als je een probleem bent tegengekomen, laat het ons weten zodat we je kunnen helpen alles weer op de rails te krijgen.',
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
            findCard: 'Kaart zoeken',
            cardNumber: 'Kaartnummer',
            commercialFeed: 'Commerciële feed',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `${feedName}-kaarten`,
            directFeed: 'Directe feed',
            whoNeedsCardAssigned: 'Wie heeft een kaart toegewezen nodig?',
            chooseCard: 'Kies een kaart',
            chooseCardFor: ({assignee}: AssigneeParams) =>
                `Kies een kaart voor <strong>${assignee}</strong>. Kunt u de kaart die u zoekt niet vinden? <concierge-link>Laat het ons weten.</concierge-link>`,
            noActiveCards: 'Geen actieve kaarten in deze feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Of misschien werkt er iets niet. Hoe dan ook, als je vragen hebt, kun je altijd <concierge-link>contact opnemen met Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Kies een startdatum voor transacties',
            startDateDescription: 'We importeren alle transacties vanaf deze datum. Als er geen datum is opgegeven, gaan we zo ver terug als je bank toestaat.',
            fromTheBeginning: 'Vanaf het begin',
            customStartDate: 'Aangepaste startdatum',
            customCloseDate: 'Aangepaste sluitingsdatum',
            letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
            confirmationDescription: 'We beginnen direct met het importeren van transacties.',
            cardholder: 'Kaarthouder',
            card: 'Kaart',
            cardName: 'Naam van kaart',
            brokenConnectionError: '<rbr>De kaartkoppeling is verbroken. <a href="#">Log in bij uw bank</a> zodat we de verbinding opnieuw kunnen tot stand brengen.</rbr>',
            assignedCard: ({assignee, link}: AssignedCardParams) => `heeft ${assignee} een ${link} toegewezen! Geïmporteerde transacties verschijnen in deze chat.`,
            companyCard: 'bedrijfskaart',
            chooseCardFeed: 'Kaartfeed kiezen',
            ukRegulation:
                'Expensify Limited is een agent van Plaid Financial Ltd., een vergunninghoudende betalingsinstelling die onder toezicht staat van de Financial Conduct Authority op grond van de Payment Services Regulations 2017 (Firm Reference Number: 804718). Plaid levert u gereguleerde rekeninginformatiediensten via Expensify Limited als haar agent.',
        },
        expensifyCard: {
            issueAndManageCards: 'Uw Expensify Cards uitgeven en beheren',
            getStartedIssuing: 'Begin door uw eerste virtuele of fysieke kaart uit te geven.',
            verificationInProgress: 'Verificatie wordt uitgevoerd...',
            verifyingTheDetails: 'We controleren een paar gegevens. Concierge laat je weten wanneer Expensify Cards klaar zijn om uit te geven.',
            disclaimer:
                'De Expensify Visa® Commercial Card wordt uitgegeven door The Bancorp Bank, N.A., lid FDIC, krachtens een licentie van Visa U.S.A. Inc. en kan niet bij alle handelaren worden gebruikt die Visa-kaarten accepteren. Apple® en het Apple-logo® zijn handelsmerken van Apple Inc., geregistreerd in de VS en andere landen. App Store is een dienstmerk van Apple Inc. Google Play en het Google Play-logo zijn handelsmerken van Google LLC.',
            euUkDisclaimer:
                'Kaarten die worden verstrekt aan inwoners van de EER worden uitgegeven door Transact Payments Malta Limited en kaarten die worden verstrekt aan inwoners van het VK worden uitgegeven door Transact Payments Limited krachtens een licentie van Visa Europe Limited. Transact Payments Malta Limited is naar behoren gemachtigd en gereguleerd door de Malta Financial Services Authority als een financiële instelling onder de Financial Institution Act 1994. Registratienummer C 91879. Transact Payments Limited is gemachtigd en gereguleerd door de Gibraltar Financial Service Commission.',
            issueCard: 'Kaart uitgeven',
            findCard: 'Kaart zoeken',
            newCard: 'Nieuwe kaart',
            name: 'Naam',
            lastFour: 'Laatste 4',
            limit: 'Limiet',
            currentBalance: 'Huidig saldo',
            currentBalanceDescription: 'Het huidige saldo is de som van alle geboekte Expensify Card-transacties die hebben plaatsgevonden sinds de laatste afwikkelingsdatum.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Saldo wordt vereffend op ${settlementDate}`,
            settleBalance: 'Saldo vereffenen',
            cardLimit: 'Kaartlimiet',
            remainingLimit: 'Resterende limiet',
            requestLimitIncrease: 'Verzoek om limietverhoging',
            remainingLimitDescription:
                'We houden rekening met een aantal factoren bij het berekenen van je resterende limiet: je klantduur, de bedrijfsgerelateerde informatie die je tijdens de registratie hebt verstrekt en het beschikbare saldo op je zakelijke bankrekening. Je resterende limiet kan dagelijks fluctueren.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Cashback-saldo is gebaseerd op de afgerekende maandelijkse Expensify Card-uitgaven binnen je workspace.',
            issueNewCard: 'Nieuwe kaart uitgeven',
            finishSetup: 'Instelling voltooien',
            chooseBankAccount: 'Bankrekening kiezen',
            chooseExistingBank: 'Kies een bestaande zakelijke bankrekening om je Expensify Card–saldo te betalen, of voeg een nieuwe bankrekening toe',
            accountEndingIn: 'Account eindigend op',
            addNewBankAccount: 'Nieuwe bankrekening toevoegen',
            settlementAccount: 'Afwikkelingsrekening',
            settlementAccountDescription: 'Kies een rekening om je Expensify Card-saldo te betalen.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Zorg ervoor dat deze rekening overeenkomt met uw <a href="${reconciliationAccountSettingsLink}">Reconciliatierekening</a> (${accountNumber}), zodat Continuele Reconciliatie correct werkt.`,
            settlementFrequency: 'Frequentie van afrekening',
            settlementFrequencyDescription: 'Kies hoe vaak je je Expensify Card‑saldo wilt betalen.',
            settlementFrequencyInfo:
                'Als je wilt overschakelen naar maandelijkse afwikkeling, moet je je bankrekening koppelen via Plaid en een positieve saldohistorie van 90 dagen hebben.',
            frequency: {
                daily: 'Dagelijks',
                monthly: 'Maandelijks',
            },
            cardDetails: 'Kaartgegevens',
            cardPending: ({name}: {name: string}) => `Kaart is momenteel in behandeling en wordt uitgegeven zodra het account van ${name} is gevalideerd.`,
            virtual: 'Virtueel',
            physical: 'Fysiek',
            deactivate: 'Kaart deactiveren',
            changeCardLimit: 'Kaartlimiet wijzigen',
            changeLimit: 'Limiet wijzigen',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Als u de limiet van deze kaart wijzigt naar ${limit}, worden nieuwe transacties geweigerd totdat u meer uitgaven op de kaart goedkeurt.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `Als je de limiet van deze kaart wijzigt naar ${limit}, worden nieuwe transacties tot volgende maand geweigerd.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Als je de limiet van deze kaart wijzigt naar ${limit}, worden nieuwe transacties geweigerd.`,
            changeCardLimitType: 'Type kaartlimiet wijzigen',
            changeLimitType: 'Limiettype wijzigen',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Als je het limiettype van deze kaart wijzigt naar Slimme limiet, worden nieuwe transacties geweigerd omdat de niet-goedgekeurde limiet van ${limit} al is bereikt.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Als u het limiettype van deze kaart wijzigt naar Maandelijks, worden nieuwe transacties geweigerd omdat de maandelijkse limiet van ${limit} al is bereikt.`,
            addShippingDetails: 'Verzendgegevens toevoegen',
            issuedCard: ({assignee}: AssigneeParams) => `heeft ${assignee} een Expensify Card gegeven! De kaart wordt binnen 2-3 werkdagen bezorgd.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) =>
                `heeft een Expensify Card uitgegeven aan ${assignee}! De kaart wordt verzonden zodra de verzendgegevens zijn bevestigd.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `heeft ${assignee} een virtuele Expensify Card uitgegeven! De ${link} kan meteen worden gebruikt.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} heeft verzendgegevens toegevoegd. Expensify Card wordt binnen 2-3 werkdagen bezorgd.`,
            replacedCard: ({assignee}: AssigneeParams) => `${assignee} heeft zijn/haar Expensify Card vervangen. De nieuwe kaart wordt over 2-3 werkdagen bezorgd.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} heeft hun virtuele Expensify Card vervangen! De ${link} kan meteen worden gebruikt.`,
            card: 'kaart',
            replacementCard: 'vervangingskaart',
            verifyingHeader: 'Verifiëren',
            bankAccountVerifiedHeader: 'Bankrekening geverifieerd',
            verifyingBankAccount: 'Bankrekening verifiëren...',
            verifyingBankAccountDescription: 'Wacht terwijl we bevestigen dat deze account kan worden gebruikt om Expensify Cards uit te geven.',
            bankAccountVerified: 'Bankrekening geverifieerd!',
            bankAccountVerifiedDescription: 'Je kunt nu Expensify Cards uitgeven aan de leden van je workspace.',
            oneMoreStep: 'Nog één stap...',
            oneMoreStepDescription: 'Het lijkt erop dat we je bankrekening handmatig moeten verifiëren. Ga naar Concierge, waar je instructies op je wachten.',
            gotIt: 'Begrepen',
            goToConcierge: 'Ga naar Concierge',
        },
        categories: {
            deleteCategories: 'Categorieën verwijderen',
            deleteCategoriesPrompt: 'Weet je zeker dat je deze categorieën wilt verwijderen?',
            deleteCategory: 'Categorie verwijderen',
            deleteCategoryPrompt: 'Weet je zeker dat je deze categorie wilt verwijderen?',
            disableCategories: 'Categorieën uitschakelen',
            disableCategory: 'Categorie uitschakelen',
            enableCategories: 'Categorieën inschakelen',
            enableCategory: 'Categorie inschakelen',
            defaultSpendCategories: 'Standaarduitgavencategorieën',
            spendCategoriesDescription: 'Pas de manier waarop uitgaven bij leveranciers worden gecategoriseerd voor creditcardtransacties en gescande bonnetjes aan.',
            deleteFailureMessage: 'Er is een fout opgetreden bij het verwijderen van de categorie, probeer het opnieuw',
            categoryName: 'Categorienaam',
            requiresCategory: 'Leden moeten alle uitgaven categoriseren',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Alle uitgaven moeten worden gecategoriseerd om te kunnen exporteren naar ${connectionName}.`,
            subtitle: 'Krijg beter inzicht in waar geld wordt uitgegeven. Gebruik onze standaardcategorieën of voeg je eigen categorieën toe.',
            emptyCategories: {
                title: 'Je hebt nog geen categorieën gemaakt',
                subtitle: 'Voeg een categorie toe om je uitgaven te organiseren.',
                subtitleWithAccounting: ({accountingPageURL}: EmptyCategoriesSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>Je categorieën worden momenteel geïmporteerd vanuit een boekhoudkoppeling. Ga naar <a href="${accountingPageURL}">Boekhouding</a> om wijzigingen aan te brengen.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de categorie, probeer het opnieuw',
            createFailureMessage: 'Er is een fout opgetreden bij het aanmaken van de categorie, probeer het opnieuw.',
            addCategory: 'Categorie toevoegen',
            editCategory: 'Categorie bewerken',
            editCategories: 'Categorieën bewerken',
            findCategory: 'Categorie zoeken',
            categoryRequiredError: 'Categorienaam is vereist',
            existingCategoryError: 'Er bestaat al een categorie met deze naam',
            invalidCategoryName: 'Ongeldige categorienaam',
            importedFromAccountingSoftware: 'De onderstaande categorieën zijn geïmporteerd uit uw',
            payrollCode: 'Looncode',
            updatePayrollCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de payrollcode, probeer het opnieuw.',
            glCode: 'GL-code',
            updateGLCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de GL-code, probeer het opnieuw.',
            importCategories: 'Categorieën importeren',
            cannotDeleteOrDisableAllCategories: {
                title: 'Kan niet alle categorieën verwijderen of uitschakelen',
                description: `Er moet minstens één categorie ingeschakeld blijven omdat je workspace categorieën vereist.`,
            },
        },
        moreFeatures: {
            subtitle: 'Gebruik de schakelaars hieronder om meer functies in te schakelen naarmate je groeit. Elke functie verschijnt in het navigatiemenu voor verdere aanpassing.',
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
                subtitle: 'Stroomlijn uw inkomsten en laat u sneller betalen.',
            },
            organizeSection: {
                title: 'Organiseren',
                subtitle: 'Groepeer en analyseer uitgaven, registreer elke betaalde belasting.',
            },
            integrateSection: {
                title: 'Integreren',
                subtitle: 'Koppel Expensify aan populaire financiële producten.',
            },
            distanceRates: {
                title: 'Kilometertarieven',
                subtitle: 'Tarieven toevoegen, bijwerken en afdwingen.',
            },
            perDiem: {
                title: 'Dagvergoeding',
                subtitle: 'Stel dagvergoedingen in om de dagelijkse uitgaven van medewerkers te beheersen.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Krijg inzicht en controle over uitgaven.',
                disableCardTitle: 'Expensify Card uitschakelen',
                disableCardPrompt: 'Je kunt de Expensify Card niet uitschakelen omdat deze al in gebruik is. Neem contact op met Concierge voor de volgende stappen.',
                disableCardButton: 'Chatten met Concierge',
                feed: {
                    title: 'Vraag de Expensify Card aan',
                    subTitle: 'Stroomlijn uw zakelijke uitgaven en bespaar tot 50% op uw Expensify-factuur, plus:',
                    features: {
                        cashBack: 'Cashback op elke aankoop in de VS',
                        unlimited: 'Onbeperkte virtuele kaarten',
                        spend: 'Uitgavenbeheer en aangepaste limieten',
                    },
                    ctaTitle: 'Nieuwe kaart uitgeven',
                },
            },
            companyCards: {
                title: 'Bedrijfskaarten',
                subtitle: 'Importeer uitgaven van bestaande bedrijfskaarten.',
                feed: {
                    title: 'Bedrijfskaarten importeren',
                    features: {
                        support: 'Ondersteuning voor alle grote kaartaanbieders',
                        assignCards: 'Kaarten aan het hele team toewijzen',
                        automaticImport: 'Automatische transactie-import',
                    },
                },
                bankConnectionError: 'Probleem met bankverbinding',
                connectWithPlaid: 'verbinden via Plaid',
                connectWithExpensifyCard: 'probeer de Expensify Card.',
                bankConnectionDescription: `Probeer je kaarten opnieuw toe te voegen. Anders kun je`,
                disableCardTitle: 'Bedrijfskaarten uitschakelen',
                disableCardPrompt: 'Je kunt bedrijfskaarten niet uitschakelen omdat deze functie in gebruik is. Neem contact op met de Concierge voor de volgende stappen.',
                disableCardButton: 'Chatten met Concierge',
                cardDetails: 'Kaartgegevens',
                cardNumber: 'Kaartnummer',
                cardholder: 'Kaarthouder',
                cardName: 'Naam van kaart',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} Exporteren` : `${integration}-export`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Kies de ${integration}-rekening waarnaar transacties moeten worden geëxporteerd.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Kies de ${integration}-rekening waarnaar transacties geëxporteerd moeten worden. Selecteer een andere <a href="${exportPageLink}">exportoptie</a> om de beschikbare rekeningen te wijzigen.`,
                lastUpdated: 'Laatst bijgewerkt',
                transactionStartDate: 'Startdatum transactie',
                updateCard: 'Kaart bijwerken',
                unassignCard: 'Kaart toewijzen ongedaan maken',
                unassign: 'Toewijzen ongedaan maken',
                unassignCardDescription: 'Als u deze kaart loskoppelt, worden alle transacties in conceptrapporten verwijderd uit de account van de kaarthouder.',
                assignCard: 'Kaart toewijzen',
                cardFeedName: 'Naam van kaartfeed',
                cardFeedNameDescription: 'Geef de kaartfeed een unieke naam zodat je deze van de andere kunt onderscheiden.',
                cardFeedTransaction: 'Transacties verwijderen',
                cardFeedTransactionDescription: 'Kies of kaarthouders kaarttransacties kunnen verwijderen. Nieuwe transacties volgen deze regels.',
                cardFeedRestrictDeletingTransaction: 'Verwijderen van transacties beperken',
                cardFeedAllowDeletingTransaction: 'Verwijderen van transacties toestaan',
                removeCardFeed: 'Kaartfeed verwijderen',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `${feedName}-feed verwijderen`,
                removeCardFeedDescription: 'Weet je zeker dat je deze kaartfeed wilt verwijderen? Hierdoor worden alle kaarten losgekoppeld.',
                error: {
                    feedNameRequired: 'Naam van kaartfeed is vereist',
                    statementCloseDateRequired: 'Selecteer een afsluittingsdatum voor het overzicht.',
                },
                corporate: 'Verwijderen van transacties beperken',
                personal: 'Verwijderen van transacties toestaan',
                setFeedNameDescription: 'Geef de kaartfeed een unieke naam zodat je deze kunt onderscheiden van de andere',
                setTransactionLiabilityDescription: 'Indien ingeschakeld kunnen kaarthouders kaarttransacties verwijderen. Nieuwe transacties zullen deze regel volgen.',
                emptyAddedFeedTitle: 'Bedrijfspassen toewijzen',
                emptyAddedFeedDescription: 'Begin door je eerste kaart aan een lid toe te wijzen.',
                pendingFeedTitle: `We beoordelen je verzoek...`,
                pendingFeedDescription: `We zijn momenteel je feedgegevens aan het beoordelen. Zodra dat is voltooid, nemen we contact met je op via`,
                pendingBankTitle: 'Controleer uw browservervenster',
                pendingBankDescription: ({bankName}: CompanyCardBankName) => `Maak via het zojuist geopende browservenster verbinding met ${bankName}. Als er geen venster is geopend,`,
                pendingBankLink: 'klik hier alstublieft',
                giveItNameInstruction: 'Geef de kaart een naam die haar onderscheidt van andere kaarten.',
                updating: 'Bezig met bijwerken...',
                noAccountsFound: 'Geen accounts gevonden',
                defaultCard: 'Standaardkaart',
                downgradeTitle: `Kan werkruimte niet downgraden`,
                downgradeSubTitle: `Deze workspace kan niet worden gedowngraded omdat meerdere kaartfeeds zijn gekoppeld (met uitzondering van Expensify Cards). <a href="#">Beperk het aantal kaartfeeds tot één</a> om door te gaan.`,
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Voeg het account toe in ${connection} en synchroniseer de verbinding opnieuw`,
                expensifyCardBannerTitle: 'Vraag de Expensify Card aan',
                expensifyCardBannerSubtitle: 'Geniet van cashback op elke aankoop in de VS, tot 50% korting op je Expensify-rekening, onbeperkte virtuele kaarten en nog veel meer.',
                expensifyCardBannerLearnMoreButton: 'Meer informatie',
                statementCloseDateTitle: 'Einddatum afschrift',
                statementCloseDateDescription: 'Laat ons weten wanneer je kaartafschrift wordt afgesloten, dan maken wij een overeenkomend afschrift aan in Expensify.',
            },
            workflows: {
                title: 'Workflows',
                subtitle: 'Configureer hoe uitgaven worden goedgekeurd en betaald.',
                disableApprovalPrompt:
                    'Expensify Cards in deze workspace zijn momenteel afhankelijk van goedkeuring om hun Smart Limits te bepalen. Pas de limiettypen van alle Expensify Cards met Smart Limits aan voordat je goedkeuringen uitschakelt.',
            },
            invoices: {
                title: 'Facturen',
                subtitle: 'Facturen verzenden en ontvangen.',
            },
            categories: {
                title: 'Categorieën',
                subtitle: 'Uitgaven bijhouden en ordenen.',
            },
            tags: {
                title: 'Tags',
                subtitle: 'Classificeer kosten en volg factureerbare uitgaven.',
            },
            taxes: {
                title: 'Belastingen',
                subtitle: 'Documenteer en vorder in aanmerking komende belastingen terug.',
            },
            reportFields: {
                title: 'Rapportvelden',
                subtitle: 'Stel aangepaste velden in voor uitgaven.',
            },
            connections: {
                title: 'Boekhouding',
                subtitle: 'Synchroniseer uw grootboekschema en meer.',
            },
            receiptPartners: {
                title: 'Bonpartners',
                subtitle: 'Bonnen automatisch importeren.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Niet zo snel...',
                featureEnabledText: 'Om deze functie in of uit te schakelen, moet je je instellingen voor accountingimport wijzigen.',
                disconnectText: 'Om boekhouding uit te schakelen, moet je de boekhoudkoppeling van je workspace loskoppelen.',
                manageSettings: 'Instellingen beheren',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Verbinding met Uber verbreken',
                disconnectText: 'Schakel eerst de Uber for Business-integratie uit om deze functie te deactiveren.',
                description: 'Weet je zeker dat je deze integratie wilt ontkoppelen?',
                confirmText: 'Begrepen',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Niet zo snel...',
                featureEnabledText:
                    'Expensify Cards in deze werkruimte zijn afhankelijk van goedkeuringsworkflows om hun Smart Limits te bepalen.\n\nWijzig de limiettypen van alle kaarten met Smart Limits voordat je workflows uitschakelt.',
                confirmText: 'Ga naar Expensify Cards',
            },
            rules: {
                title: 'Regels',
                subtitle: 'Bonnen verplicht stellen, hoge uitgaven markeren en meer.',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Voorbeelden:',
            customReportNamesSubtitle: `<muted-text>Pas rapporttitels aan met onze <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">uitgebreide formules</a>.</muted-text>`,
            customNameTitle: 'Standaardtitel van rapport',
            customNameDescription: `Kies een aangepaste naam voor onkostendeclaraties met behulp van onze <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">uitgebreide formules</a>.`,
            customNameInputLabel: 'Naam',
            customNameEmailPhoneExample: 'E-mail of telefoon van lid: {report:submit:from}',
            customNameStartDateExample: 'Begindatum rapport: {report:startdate}',
            customNameWorkspaceNameExample: 'Werkruimte-naam: {report:workspacename}',
            customNameReportIDExample: 'Rapport-ID: {report:id}',
            customNameTotalExample: 'Totaal: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Voorkom dat leden aangepaste rapporttitels wijzigen',
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
                subtitle: 'Voeg een aangepast veld toe (tekst, datum of keuzelijst) dat op rapporten verschijnt.',
            },
            subtitle: 'Rapportvelden zijn van toepassing op alle uitgaven en kunnen handig zijn wanneer je om extra informatie wilt vragen.',
            disableReportFields: 'Rapportvelden uitschakelen',
            disableReportFieldsConfirmation: 'Weet je het zeker? Tekst- en datumvelden worden verwijderd en lijsten worden uitgeschakeld.',
            importedFromAccountingSoftware: 'De onderstaande rapportvelden zijn geïmporteerd uit je',
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
            initialValueInputSubtitle: 'Voer een startwaarde in die in het rapportveld moet worden weergegeven.',
            listValuesInputSubtitle: 'Deze waarden verschijnen in de vervolgkeuzelijst van je rapportveld. Ingeschakelde waarden kunnen door leden worden geselecteerd.',
            listInputSubtitle: 'Deze waarden verschijnen in de lijst met rapportvelden. Ingeschakelde waarden kunnen door leden worden geselecteerd.',
            deleteValue: 'Waarde verwijderen',
            deleteValues: 'Waarden verwijderen',
            disableValue: 'Waarde uitschakelen',
            disableValues: 'Waarden uitschakelen',
            enableValue: 'Waarde inschakelen',
            enableValues: 'Waarden inschakelen',
            emptyReportFieldsValues: {
                title: 'Je hebt nog geen lijstwaarden aangemaakt',
                subtitle: 'Aangepaste waarden toevoegen om op rapporten weer te geven.',
            },
            deleteValuePrompt: 'Weet je zeker dat je deze lijstwaarde wilt verwijderen?',
            deleteValuesPrompt: 'Weet je zeker dat je deze lijstwaarden wilt verwijderen?',
            listValueRequiredError: 'Voer een naam in voor de lijstwaarde',
            existingListValueError: 'Er bestaat al een lijstwaarde met deze naam',
            editValue: 'Waarde bewerken',
            listValues: 'Waarden weergeven',
            addValue: 'Waarde toevoegen',
            existingReportFieldNameError: 'Er bestaat al een rapportveld met deze naam',
            reportFieldNameRequiredError: 'Voer een rapportveldnaam in',
            reportFieldTypeRequiredError: 'Kies een rapportveldtype',
            circularReferenceError: 'Dit veld kan niet naar zichzelf verwijzen. Werk het alsjeblieft bij.',
            reportFieldInitialValueRequiredError: 'Kies een initiële waarde voor een rapportveld',
            genericFailureMessage: 'Er is een fout opgetreden bij het bijwerken van het rapportveld. Probeer het opnieuw.',
        },
        tags: {
            tagName: 'Tagnaam',
            requiresTag: 'Leden moeten alle uitgaven taggen',
            trackBillable: 'Factureerbare uitgaven bijhouden',
            customTagName: 'Aangepaste tagnaam',
            enableTag: 'Tag inschakelen',
            enableTags: 'Tags inschakelen',
            requireTag: 'Label vereist',
            requireTags: 'Tags vereisen',
            notRequireTags: 'Niet vereisen',
            disableTag: 'Tag uitschakelen',
            disableTags: 'Tags uitschakelen',
            addTag: 'Tag toevoegen',
            editTag: 'Tag bewerken',
            editTags: 'Tags bewerken',
            findTag: 'Tag zoeken',
            subtitle: 'Tags voegen meer gedetailleerde manieren toe om kosten te classificeren.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: ({importSpreadsheetLink}: DependentMultiLevelTagsSubtitleParams) =>
                `<muted-text>Je gebruikt <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">afhankelijke tags</a>. Je kunt <a href="${importSpreadsheetLink}">een spreadsheet opnieuw importeren</a> om je tags bij te werken.</muted-text>`,
            emptyTags: {
                title: 'Je hebt nog geen tags aangemaakt',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Voeg een tag toe om projecten, locaties, afdelingen en meer bij te houden.',
                subtitleHTML: `<muted-text><centered-text>Importeer een spreadsheet om tags toe te voegen voor het bijhouden van projecten, locaties, afdelingen en meer. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Meer informatie</a> over het opmaken van tagbestanden.</centered-text></muted-text>`,
                subtitleWithAccounting: ({accountingPageURL}: EmptyTagsSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>Je tags worden momenteel geïmporteerd via een boekhoudkoppeling. Ga naar <a href="${accountingPageURL}">boekhouding</a> om wijzigingen aan te brengen.</centered-text></muted-text>`,
            },
            deleteTag: 'Tag verwijderen',
            deleteTags: 'Tags verwijderen',
            deleteTagConfirmation: 'Weet je zeker dat je deze tag wilt verwijderen?',
            deleteTagsConfirmation: 'Weet je zeker dat je deze tags wilt verwijderen?',
            deleteFailureMessage: 'Er is een fout opgetreden bij het verwijderen van de tag, probeer het opnieuw.',
            tagRequiredError: 'Tagnaam is vereist',
            existingTagError: 'Er bestaat al een tag met deze naam',
            invalidTagNameError: 'Tagnaam kan niet 0 zijn. Kies een andere waarde.',
            genericFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de tag, probeer het opnieuw',
            importedFromAccountingSoftware: 'De onderstaande tags zijn geïmporteerd uit je',
            glCode: 'GL-code',
            updateGLCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de GL-code, probeer het opnieuw.',
            tagRules: 'Tagregels',
            approverDescription: 'Fiatteur',
            importTags: 'Tags importeren',
            importTagsSupportingText: 'Codeer je uitgaven met één type tag of met meerdere.',
            configureMultiLevelTags: 'Configureer je lijst met tags voor tagging op meerdere niveaus.',
            importMultiLevelTagsSupportingText: `Hier is een voorbeeld van je labels. Als alles er goed uitziet, klik dan hieronder om ze te importeren.`,
            importMultiLevelTags: {
                firstRowTitle: 'De eerste rij is de titel voor elke taglijst',
                independentTags: 'Dit zijn onafhankelijke tags',
                glAdjacentColumn: 'Er staat een GL-code in de aangrenzende kolom',
            },
            tagLevel: {
                singleLevel: 'Eén niveau van tags',
                multiLevel: 'Tags op meerdere niveaus',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Tagniveaus wisselen',
                prompt1: 'Het wisselen van tag-niveaus zal alle huidige tags wissen.',
                prompt2: 'We raden u eerst aan',
                prompt3: 'een back-up downloaden',
                prompt4: 'door uw tags te exporteren.',
                prompt5: 'Meer informatie',
                prompt6: 'over tag-niveaus.',
            },
            overrideMultiTagWarning: {
                title: 'Tags importeren',
                prompt1: 'Weet je het zeker?',
                prompt2: 'De bestaande tags worden overschreven, maar je kunt',
                prompt3: 'een back-up downloaden',
                prompt4: 'eerst.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `We hebben *${columnCounts} kolommen* in je spreadsheet gevonden. Selecteer *Naam* naast de kolom die tagnamen bevat. Je kunt ook *Ingeschakeld* selecteren naast de kolom die de tagstatus instelt.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Kan niet alle labels verwijderen of uitschakelen',
                description: `Minstens één tag moet ingeschakeld blijven omdat je workspace tags vereist.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Kan niet alle tags optioneel maken',
                description: `Er moet ten minste één tag vereist blijven, omdat je werkruimtesettings tags vereisen.`,
            },
            cannotMakeTagListRequired: {
                title: 'Kan taglijst niet verplicht maken',
                description: 'U kunt een taglijst alleen verplicht maken als uw beleid meerdere tag­niveaus heeft geconfigureerd.',
            },
            tagCount: () => ({
                one: '1 dag',
                other: (count: number) => `${count} Tags`,
            }),
        },
        taxes: {
            subtitle: 'Belastingnamen en -tarieven toevoegen en standaarden instellen.',
            addRate: 'Tarief toevoegen',
            workspaceDefault: 'Standaardvaluta voor workspace',
            foreignDefault: 'Standaard vreemde valuta',
            customTaxName: 'Aangepaste belastingnaam',
            value: 'Waarde',
            taxReclaimableOn: 'Belasting terug te vorderen over',
            taxRate: 'Belastingtarief',
            findTaxRate: 'Belastingtarief zoeken',
            error: {
                taxRateAlreadyExists: 'Deze belastingnaam is al in gebruik',
                taxCodeAlreadyExists: 'Deze belastingcode is al in gebruik',
                valuePercentageRange: 'Voer een geldige percentagewaarde in tussen 0 en 100',
                customNameRequired: 'Aangepaste belastingnaam is vereist',
                deleteFailureMessage: 'Er is een fout opgetreden bij het verwijderen van het belastingtarief. Probeer het opnieuw of vraag Concierge om hulp.',
                updateFailureMessage: 'Er is een fout opgetreden bij het bijwerken van het belastingtarief. Probeer het opnieuw of vraag Concierge om hulp.',
                createFailureMessage: 'Er is een fout opgetreden bij het aanmaken van het belastingtarief. Probeer het opnieuw of vraag Concierge om hulp.',
                updateTaxClaimableFailureMessage: 'Het terugvorderbare deel moet lager zijn dan het kilometervergoedingbedrag',
            },
            deleteTaxConfirmation: 'Weet je zeker dat je deze belasting wilt verwijderen?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Weet je zeker dat je ${taxAmount} belastingen wilt verwijderen?`,
            actions: {
                delete: 'Tarief verwijderen',
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
            importedFromAccountingSoftware: 'De onderstaande belastingen zijn geïmporteerd uit je',
            taxCode: 'Belastingcode',
            updateTaxCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de belastingcode, probeer het opnieuw.',
        },
        duplicateWorkspace: {
            title: 'Geef uw nieuwe workspace een naam',
            selectFeatures: 'Selecteer functies om te kopiëren',
            whichFeatures: 'Welke functies wil je overnemen naar je nieuwe werkruimte?',
            confirmDuplicate: 'Wil je doorgaan?',
            categories: 'categorieën en je automatische categorisatieregels',
            reimbursementAccount: 'vergoedingsrekening',
            welcomeNote: 'Begin alsjeblieft mijn nieuwe werkruimte te gebruiken',
            delayedSubmission: 'Vertraagde indiening',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Je staat op het punt ${newWorkspaceName ?? ''} te maken en te delen met ${totalMembers ?? 0} leden van de oorspronkelijke workspace.`,
            error: 'Er is een fout opgetreden bij het dupliceren van je nieuwe werkruimte. Probeer het opnieuw.',
        },
        emptyWorkspace: {
            title: 'Je hebt geen werkruimtes',
            subtitle: 'Volg bonnetjes, vergoed uitgaven, beheer reizen, verstuur facturen en meer.',
            createAWorkspaceCTA: 'Aan de slag',
            features: {
                trackAndCollect: 'Bonnen bijhouden en verzamelen',
                reimbursements: 'Werknemers terugbetalen',
                companyCards: 'Bedrijfspassen beheren',
            },
            notFound: 'Geen werkruimte gevonden',
            description: 'Ruimtes zijn een uitstekende plek om te overleggen en samen te werken met meerdere mensen. Maak of word lid van een werkruimte om te beginnen met samenwerken',
        },
        new: {
            newWorkspace: 'Nieuwe werkruimte',
            getTheExpensifyCardAndMore: 'Ontvang de Expensify Card en meer',
            confirmWorkspace: 'Workspace bevestigen',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mijn groepswerkruimte${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Werkruimte van ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Er is een fout opgetreden bij het verwijderen van een lid uit de workspace, probeer het opnieuw.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Weet je zeker dat je ${memberName} wilt verwijderen?`,
                other: 'Weet je zeker dat je deze leden wilt verwijderen?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} is een goedkeurder in deze workspace. Als je deze workspace niet meer met hen deelt, vervangen we hen in de goedkeuringsworkflow door de workspace-eigenaar, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Lid verwijderen',
                other: 'Leden verwijderen',
            }),
            findMember: 'Lid zoeken',
            removeWorkspaceMemberButtonTitle: 'Verwijderen uit werkruimte',
            removeGroupMemberButtonTitle: 'Uit groep verwijderen',
            removeRoomMemberButtonTitle: 'Uit chat verwijderen',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Weet je zeker dat je ${memberName} wilt verwijderen?`,
            removeMemberTitle: 'Lid verwijderen',
            transferOwner: 'Eigenaar overdragen',
            makeMember: 'Lid maken',
            makeAdmin: 'Beheerder maken',
            makeAuditor: 'Maak controleur',
            selectAll: 'Alles selecteren',
            error: {
                genericAdd: 'Er is een probleem opgetreden bij het toevoegen van dit werkruimtelid',
                cannotRemove: 'Je kunt jezelf of de werkruimte-eigenaar niet verwijderen',
                genericRemove: 'Er is een probleem opgetreden bij het verwijderen van dat werkruimtelid',
            },
            addedWithPrimary: 'Sommige leden zijn toegevoegd met hun primaire login.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Toegevoegd door secundaire login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Totaal aantal werkruitleden: ${count}`,
            importMembers: 'Leden importeren',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Als je ${approver} uit deze workspace verwijdert, zullen we hen in de goedkeuringsworkflow vervangen door ${workspaceOwner}, de eigenaar van de workspace.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} heeft nog openstaande onkostendeclaraties om goed te keuren. Vraag hen deze goed te keuren, of neem de controle over hun declaraties voordat je hen uit de werkruimte verwijdert.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Je kunt ${memberName} niet uit deze workspace verwijderen. Stel eerst een nieuwe terugbetaler in via Workflows > Betalingen uitvoeren of volgen en probeer het daarna opnieuw.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Als je ${memberName} uit deze workspace verwijdert, vervangen we hen als voorkeurs-exporteur door ${workspaceOwner}, de eigenaar van de workspace.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Als je ${memberName} uit deze werkruimte verwijdert, vervangen we hem/haar als technische contactpersoon door ${workspaceOwner}, de eigenaar van de werkruimte.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} heeft een openstaand verwerkingsrapport waarop actie moet worden ondernomen. Vraag hen om de vereiste actie te voltooien voordat je hen uit de workspace verwijdert.`,
        },
        card: {
            getStartedIssuing: 'Begin door uw eerste virtuele of fysieke kaart uit te geven.',
            issueCard: 'Kaart uitgeven',
            issueNewCard: {
                whoNeedsCard: 'Wie heeft een kaart nodig?',
                inviteNewMember: 'Nieuw lid uitnodigen',
                findMember: 'Lid zoeken',
                chooseCardType: 'Kies een kaarttype',
                physicalCard: 'Fysieke kaart',
                physicalCardDescription: 'Geweldig voor de frequente uitgave-doener',
                virtualCard: 'Virtuele kaart',
                virtualCardDescription: 'Direct en flexibel',
                chooseLimitType: 'Kies een limiettype',
                smartLimit: 'Slimme limiet',
                smartLimitDescription: 'Tot een bepaald bedrag uitgeven voordat goedkeuring vereist is',
                monthly: 'Maandelijks',
                monthlyDescription: 'Tot een bepaald bedrag per maand uitgeven',
                fixedAmount: 'Vast bedrag',
                fixedAmountDescription: 'Eenmalig tot een bepaald bedrag uitgeven',
                setLimit: 'Limiet instellen',
                cardLimitError: 'Voer een bedrag in dat lager is dan $21.474.836',
                giveItName: 'Geef het een naam',
                giveItNameInstruction: 'Maak het uniek genoeg om het te onderscheiden van andere kaarten. Specifieke gebruikssituaties zijn zelfs nog beter!',
                cardName: 'Naam van kaart',
                letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
                willBeReady: 'Deze kaart is direct klaar voor gebruik.',
                cardholder: 'Kaarthouder',
                cardType: 'Kaarttype',
                limit: 'Limiet',
                limitType: 'Limiettype',
                name: 'Naam',
                disabledApprovalForSmartLimitError: 'Schakel eerst goedkeuringen in via <strong>Workflows > Add approvals</strong> voordat je slimme limieten instelt',
            },
            deactivateCardModal: {
                deactivate: 'Deactiveren',
                deactivateCard: 'Kaart deactiveren',
                deactivateConfirmation: 'Het deactiveren van deze kaart zal alle toekomstige transacties weigeren en kan niet ongedaan worden gemaakt.',
            },
        },
        accounting: {
            settings: 'Instellingen',
            title: 'Verbindingen',
            subtitle:
                'Maak verbinding met je boekhoudsysteem om transacties te coderen met je grootboekrekeningen, betalingen automatisch te matchen en je financiën gesynchroniseerd te houden.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chat met je installatiespecialist.',
            talkYourAccountManager: 'Chat met je accountmanager.',
            talkToConcierge: 'Chatten met Concierge.',
            needAnotherAccounting: 'Nog een andere boekhoudsoftware nodig?',
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
            setup: 'Verbinden',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Laatst gesynchroniseerd ${relativeDate}`,
            notSync: 'Niet gesynchroniseerd',
            import: 'Importeren',
            export: 'Exporteren',
            advanced: 'Geavanceerd',
            other: 'Overig',
            syncNow: 'Nu synchroniseren',
            disconnect: 'Verbinding verbreken',
            reinstall: 'Connector opnieuw installeren',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'Integratie';
                return `Verbinding met ${integrationName} verbreken`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Verbind ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'boekhoudkoppeling'}`,
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
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Standaard NetSuite-medewerker',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'deze integratie';
                return `Weet je zeker dat je de verbinding met ${integrationName} wilt verbreken?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Weet je zeker dat je ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'deze boekhoudintegratie'} wilt koppelen? Dit verwijdert alle bestaande boekhoudkoppelingen.`,
            enterCredentials: 'Voer je inloggegevens in',
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
                            return 'Gegevens importeren verwerken';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Vergoede rapporten en betalingsopdrachten synchroniseren';
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
                            return 'Gegevens uit QuickBooks Desktop importeren';
                        case 'quickbooksDesktopImportTitle':
                            return 'Titel importeren';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Goedkeuringscertificaat importeren';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Dimensies importeren';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Beleid voor opslaan importeren';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Gegevens worden nog gesynchroniseerd met QuickBooks... Zorg ervoor dat de Web Connector actief is';
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
                            return 'Wachten tot geïmporteerde gegevens worden geladen';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Rekeningschema synchroniseren';
                        case 'xeroSyncImportCategories':
                            return 'Categorieën synchroniseren';
                        case 'xeroSyncImportCustomers':
                            return 'Klanten synchroniseren';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Expensify-rapporten markeren als terugbetaald';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Xero-facturen en -rekeningen als betaald markeren';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Trackingcategorieën synchroniseren';
                        case 'xeroSyncImportBankAccounts':
                            return 'Bankrekeningen synchroniseren';
                        case 'xeroSyncImportTaxRates':
                            return 'Belastingtarieven synchroniseren';
                        case 'xeroCheckConnection':
                            return 'Xero-verbinding controleren';
                        case 'xeroSyncTitle':
                            return 'Xero-gegevens synchroniseren';
                        case 'netSuiteSyncConnection':
                            return 'Verbinding met NetSuite initialiseren';
                        case 'netSuiteSyncCustomers':
                            return 'Klanten importeren';
                        case 'netSuiteSyncInitData':
                            return 'Gegevens ophalen uit NetSuite';
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
                            return 'Verbindingsgegevens bijwerken';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensify-rapporten markeren als terugbetaald';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuite-facturen en -rekeningen als betaald markeren';
                        case 'netSuiteImportVendorsTitle':
                            return 'Leveranciers importeren';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Aangepaste lijsten importeren';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Aangepaste lijsten importeren';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Dochterondernemingen importeren';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Leveranciers importeren';
                        case 'intacctCheckConnection':
                            return 'Verbinding met Sage Intacct controleren';
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
            preferredExporter: 'Voorkeursexporteur',
            exportPreferredExporterNote:
                'De voorkeurs-exporteur kan elke werkruimtebeheerder zijn, maar moet ook een domeinbeheerder zijn als je in Domeininstellingen verschillende exportrekeningen instelt voor individuele bedrijfskaarten.',
            exportPreferredExporterSubNote: 'Eenmaal ingesteld, ziet de voorkeurs-exporteur rapporten om te exporteren in zijn of haar account.',
            exportAs: 'Exporteren als',
            exportOutOfPocket: 'Uitgaven uit eigen zak exporteren als',
            exportCompanyCard: 'Bedrijfspaskaartuitgaven exporteren als',
            exportDate: 'Exportdatum',
            defaultVendor: 'Standaardleverancier',
            autoSync: 'Automatisch synchroniseren',
            autoSyncDescription: 'Synchroniseer NetSuite en Expensify automatisch, elke dag. Exporteer het afgeronde rapport in realtime',
            reimbursedReports: 'Terugbetaalde rapporten synchroniseren',
            cardReconciliation: 'Afstemming van kaarten',
            reconciliationAccount: 'Rekening voor afstemming',
            continuousReconciliation: 'Continuele afstemming',
            saveHoursOnReconciliation:
                'Bespaar uren op reconciliatie in elke boekhoudperiode door Expensify continu Expensify Card‑afschriften en -vereffeningen voor je te laten reconciliëren.',
            enableContinuousReconciliation: ({accountingAdvancedSettingsLink, connectionName}: EnableContinuousReconciliationParams) =>
                `<muted-text-label>Om Continue Afstemmen in te schakelen, schakelt u <a href="${accountingAdvancedSettingsLink}">automatisch synchroniseren</a> in voor ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Kies de bankrekening waarop je Expensify Card-betalingen worden afgestemd.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Zorg ervoor dat deze rekening overeenkomt met je <a href="${settlementAccountUrl}">Expensify Card‑afwikkelingsrekening</a> (die eindigt op ${lastFourPAN}), zodat Continuous Reconciliation goed werkt.`,
            },
        },
        export: {
            notReadyHeading: 'Nog niet klaar om te exporteren',
            notReadyDescription:
                'Concept- of in behandeling zijnde onkostendeclaraties kunnen niet naar het boekhoudsysteem worden geëxporteerd. Keur deze onkosten goed of betaal ze voordat je ze exporteert.',
        },
        invoices: {
            sendInvoice: 'Factuur verzenden',
            sendFrom: 'Verzenden vanaf',
            invoicingDetails: 'Factuurgegevens',
            invoicingDetailsDescription: 'Deze informatie verschijnt op je facturen.',
            companyName: 'Bedrijfsnaam',
            companyWebsite: 'Bedrijfswebsite',
            paymentMethods: {
                personal: 'Persoonlijk',
                business: 'Zakelijk',
                chooseInvoiceMethod: 'Kies hieronder een betaalmethode:',
                payingAsIndividual: 'Betalen als individu',
                payingAsBusiness: 'Betalen als een bedrijf',
            },
            invoiceBalance: 'Factuursaldo',
            invoiceBalanceSubtitle: 'Dit is je huidige saldo uit ontvangen factuurbetalingen. Het wordt automatisch overgemaakt naar je bankrekening als je er een hebt toegevoegd.',
            bankAccountsSubtitle: 'Voeg een bankrekening toe om facturen te betalen en betalingen voor facturen te ontvangen.',
        },
        invite: {
            member: 'Lid uitnodigen',
            members: 'Leden uitnodigen',
            invitePeople: 'Nieuwe leden uitnodigen',
            genericFailureMessage: 'Er is een fout opgetreden bij het uitnodigen van het lid voor de werkruimte. Probeer het opnieuw.',
            pleaseEnterValidLogin: `Zorg ervoor dat het e-mailadres of telefoonnummer geldig is (bijv. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'gebruiker',
            users: 'Gebruikers',
            invited: 'uitgenodigd',
            removed: 'Verwijderd',
            to: 'naar',
            from: 'van',
        },
        inviteMessage: {
            confirmDetails: 'Bevestig gegevens',
            inviteMessagePrompt: 'Maak je uitnodiging extra bijzonder door hieronder een bericht toe te voegen!',
            personalMessagePrompt: 'Bericht',
            genericFailureMessage: 'Er is een fout opgetreden bij het uitnodigen van het lid voor de werkruimte. Probeer het opnieuw.',
            inviteNoMembersError: 'Selecteer ten minste één lid om uit te nodigen',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} heeft verzocht om lid te worden van ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Oeps! Niet zo snel...',
            workspaceNeeds: 'Een werkruimte heeft minimaal één ingeschakelde afstandstarief nodig.',
            distance: 'Afstand',
            centrallyManage: 'Beheer tarieven centraal, volg afstanden in mijlen of kilometers, en stel een standaardcategorie in.',
            rate: 'Beoordelen',
            addRate: 'Tarief toevoegen',
            findRate: 'Tarief zoeken',
            trackTax: 'Belasting bijhouden',
            deleteRates: () => ({
                one: 'Tarief verwijderen',
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
                '<muted-text>Belastingen moeten zijn ingeschakeld in de workspace om deze functie te gebruiken. Ga naar <a href="#">Meer functies</a> om die wijziging aan te brengen.</muted-text>',
            deleteDistanceRate: 'Afstandstarief verwijderen',
            areYouSureDelete: () => ({
                one: 'Weet je zeker dat je dit tarief wilt verwijderen?',
                other: 'Weet je zeker dat je deze tarieven wilt verwijderen?',
            }),
            errors: {
                rateNameRequired: 'Naam van tarief is verplicht',
                existingRateName: 'Er bestaat al een afstandstarief met deze naam',
            },
        },
        editor: {
            descriptionInputLabel: 'Beschrijving',
            nameInputLabel: 'Naam',
            typeInputLabel: 'Type',
            initialValueInputLabel: 'Initiële waarde',
            nameInputHelpText: 'Dit is de naam die je in je werkruimte ziet.',
            nameIsRequiredError: 'Je moet je werkruimte een naam geven',
            currencyInputLabel: 'Standaardvaluta',
            currencyInputHelpText: 'Alle uitgaven in deze workspace worden omgerekend naar deze valuta.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `De standaardvaluta kan niet worden gewijzigd omdat deze workspace is gekoppeld aan een ${currency}-bankrekening.`,
            save: 'Opslaan',
            genericFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de workspace. Probeer het opnieuw.',
            avatarUploadFailureMessage: 'Er is een fout opgetreden bij het uploaden van de avatar. Probeer het opnieuw.',
            addressContext: 'Een werkruimteadres is vereist om Expensify Travel in te schakelen. Voer een adres in dat aan uw bedrijf is gekoppeld.',
            policy: 'Uitgavenbeleid',
        },
        bankAccount: {
            continueWithSetup: 'Setup voortzetten',
            youAreAlmostDone:
                'Je bent bijna klaar met het instellen van je bankrekening, waarmee je bedrijfskaarten kunt uitgeven, onkosten kunt vergoeden, facturen kunt innen en rekeningen kunt betalen.',
            streamlinePayments: 'Betalingen stroomlijnen',
            connectBankAccountNote: 'Opmerking: Persoonlijke bankrekeningen kunnen niet worden gebruikt voor betalingen in werkruimtes.',
            oneMoreThing: 'Nog één ding!',
            allSet: 'Je bent er helemaal klaar voor!',
            accountDescriptionWithCards: 'Deze bankrekening wordt gebruikt om zakelijke kaarten uit te geven, onkosten te vergoeden, facturen te innen en rekeningen te betalen.',
            letsFinishInChat: 'Laten we het in de chat afronden!',
            finishInChat: 'Afronden in chat',
            almostDone: 'Bijna klaar!',
            disconnectBankAccount: 'Bankrekening ontkoppelen',
            startOver: 'Opnieuw beginnen',
            updateDetails: 'Details bijwerken',
            yesDisconnectMyBankAccount: 'Ja, koppel mijn bankrekening los',
            yesStartOver: 'Ja, opnieuw beginnen',
            disconnectYourBankAccount: ({bankName}: DisconnectYourBankAccountParams) =>
                `Verbreek de koppeling met je <strong>${bankName}</strong>-bankrekening. Alle openstaande transacties voor deze rekening worden nog steeds afgerond.`,
            clearProgress: 'Opnieuw beginnen wist de voortgang die je tot nu toe hebt gemaakt.',
            areYouSure: 'Weet je het zeker?',
            workspaceCurrency: 'Workspace-valuta',
            updateCurrencyPrompt: 'Het lijkt erop dat je werkruimte momenteel is ingesteld op een andere valuta dan USD. Klik hieronder op de knop om je valuta nu bij te werken naar USD.',
            updateToUSD: 'Bijwerken naar USD',
            updateWorkspaceCurrency: 'Werkruimtemunteenheid bijwerken',
            workspaceCurrencyNotSupported: 'Werkruimtevaluta wordt niet ondersteund',
            yourWorkspace: `Je werkruimte is ingesteld op een niet-ondersteunde valuta. Bekijk de <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">lijst met ondersteunde valuta's</a>.`,
            chooseAnExisting: 'Kies een bestaande bankrekening om onkosten te betalen of voeg een nieuwe toe.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Eigenaar overdragen',
            addPaymentCardTitle: 'Voer je betaalkaart in om het eigendom over te dragen',
            addPaymentCardButtonText: 'Voorwaarden accepteren en betaalkaart toevoegen',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Lees en accepteer de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">voorwaarden</a> en het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacybeleid</a> om je kaart toe te voegen.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS-conform',
            addPaymentCardBankLevelEncrypt: 'Bankniveauversleuteling',
            addPaymentCardRedundant: 'Redundante infrastructuur',
            addPaymentCardLearnMore: `<muted-text>Lees meer over onze <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">beveiliging</a>.</muted-text>`,
            amountOwedTitle: 'Openstaand saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Deze account heeft een openstaand saldo van een vorige maand.\n\nWilt u het saldo wissen en de facturering van deze workspace overnemen?',
            ownerOwesAmountTitle: 'Openstaand saldo',
            ownerOwesAmountButtonText: 'Saldo overboeken',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `De account die eigenaar is van deze workspace (${email}) heeft een openstaand saldo uit een vorige maand.

Wil je dit bedrag (${amount}) overnemen om de facturering voor deze workspace op je te nemen? Je betaalkaart wordt direct belast.`,
            subscriptionTitle: 'Neem jaarlijks abonnement over',
            subscriptionButtonText: 'Abonnement overzetten',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Door de overname van deze werkruimte wordt het jaarlijkse abonnement samengevoegd met uw huidige abonnement. Hierdoor wordt de omvang van uw abonnement verhoogd met ${usersCount} leden, waardoor uw nieuwe abonnementsomvang ${finalCount} wordt. Wilt u doorgaan?`,
            duplicateSubscriptionTitle: 'Waarschuwing voor dubbele abonnementen',
            duplicateSubscriptionButtonText: 'Doorgaan',
            duplicateSubscriptionText: ({
                email,
                workspaceName,
            }: ChangeOwnerDuplicateSubscriptionParams) => `Het lijkt erop dat je mogelijk de facturering voor de werkruimtes van ${email} wilt overnemen, maar om dat te doen, moet je eerst beheerder zijn van al hun werkruimtes.

Klik op “Doorgaan” als je alleen de facturering wilt overnemen voor de werkruimte ${workspaceName}.

Als je de facturering voor hun volledige abonnement wilt overnemen, laat hen je dan eerst als beheerder toevoegen aan al hun werkruimtes voordat je de facturering overneemt.`,
            hasFailedSettlementsTitle: 'Kan eigendom niet overdragen',
            hasFailedSettlementsButtonText: 'Begrepen',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Je kunt de facturering niet overnemen omdat ${email} een achterstallige Expensify Card-afrekening heeft. Vraag hen contact op te nemen met concierge@expensify.com om het probleem op te lossen. Daarna kun je de facturering voor deze werkruimte overnemen.`,
            failedToClearBalanceTitle: 'Saldo wissen mislukt',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'We konden het saldo niet wissen. Probeer het later opnieuw.',
            successTitle: 'Woohoo! Helemaal klaar.',
            successDescription: 'Je bent nu de eigenaar van deze workspace.',
            errorTitle: 'Oeps! Niet zo snel...',
            errorDescription: `<muted-text><centered-text>Er is een probleem opgetreden bij het overdragen van het eigendom van deze werkruimte. Probeer het opnieuw of <concierge-link>neem contact op met Concierge</concierge-link> voor hulp.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Voorzichtig!',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `De volgende rapporten zijn al geëxporteerd naar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}:

${reportName}

Weet je zeker dat je ze opnieuw wilt exporteren?`,
            confirmText: 'Ja, opnieuw exporteren',
            cancelText: 'Annuleren',
        },
        upgrade: {
            reportFields: {
                title: 'Rapportvelden',
                description: `Met rapportvelden kunt u details op kopniveau opgeven, anders dan tags die betrekking hebben op onkosten van afzonderlijke regels. Deze details kunnen onder andere specifieke projectnamen, zakenreis­informatie, locaties en meer omvatten.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Rapportvelden zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Profiteer van automatische synchronisatie en verminder handmatige invoer met de Expensify + NetSuite-integratie. Krijg diepgaande realtime financiële inzichten met ondersteuning voor native en aangepaste segmenten, inclusief project- en klantkoppeling.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Onze NetSuite-integratie is alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Geniet van automatische synchronisatie en verminder handmatige invoer met de Expensify + Sage Intacct-integratie. Krijg diepgaande financiële inzichten in realtime met door de gebruiker gedefinieerde dimensies, evenals kostencodering per afdeling, categorie, locatie, klant en project (taak).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Onze Sage Intacct-integratie is alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Profiteer van automatische synchronisatie en verminder handmatige invoer met de Expensify + QuickBooks Desktop-integratie. Bereik ultieme efficiëntie met een realtime, tweerichtingsverbinding en kosten­codering op basis van klasse, item, klant en project.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Onze QuickBooks Desktop-integratie is alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Geavanceerde goedkeuringen',
                description: `Als je meer goedkeuringslagen wilt toevoegen – of gewoon zeker wilt weten dat de grootste uitgaven een extra controle krijgen – dan ben je bij ons aan het juiste adres. Met geavanceerde goedkeuringen kun je op elk niveau de juiste controles instellen, zodat je de uitgaven van je team onder controle houdt.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Geavanceerde goedkeuringen zijn alleen beschikbaar in het Control-abonnement, dat begint bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            categories: {
                title: 'Categorieën',
                description: 'Met categorieën kun je uitgaven volgen en organiseren. Gebruik onze standaardcategorieën of voeg je eigen categorieën toe.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Categorieën zijn beschikbaar in het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            glCodes: {
                title: 'Grootboekcodes',
                description: `Voeg GL-codes toe aan je categorieën en labels voor eenvoudige export van uitgaven naar je boekhoud- en payrollsystemen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL-codes zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Grootboek- en looncodes',
                description: `Voeg GL- en Payroll-codes toe aan uw categorieën voor eenvoudige export van uitgaven naar uw boekhoud- en salarisadministratiesystemen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL- en Payroll-codes zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Belastingcodes',
                description: `Voeg belastingcodes toe aan je belastingen voor eenvoudige export van uitgaven naar je boekhoud- en salarissystemen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Belastingcodes zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            companyCards: {
                title: 'Onbeperkte bedrijfskaarten',
                description: `Meer kaartfeeds nodig? Ontgrendel onbeperkte bedrijfskaarten om transacties van alle grote kaartuitgevers te synchroniseren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dit is alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            rules: {
                title: 'Regels',
                description: `Regels worden op de achtergrond uitgevoerd en houden je uitgaven onder controle, zodat jij je geen zorgen hoeft te maken over de kleine dingen.

Vereis uitgavedetails zoals bonnetjes en beschrijvingen, stel limieten en standaarden in, en automatiseer goedkeuringen en betalingen – allemaal op één plek.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Regels zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            perDiem: {
                title: 'Dagvergoeding',
                description:
                    'Per diem is een geweldige manier om uw dagelijkse kosten compliant en voorspelbaar te houden wanneer uw werknemers reizen. Geniet van functies zoals aangepaste tarieven, standaardcategorieën en meer gedetailleerde informatie zoals bestemmingen en subtarieven.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dagvergoedingen zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            travel: {
                title: 'Reizen',
                description: 'Expensify Travel is een nieuw platform voor het boeken en beheren van zakenreizen waarmee leden accommodaties, vluchten, vervoer en meer kunnen boeken.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Reizen is beschikbaar in het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            reports: {
                title: 'Rapporten',
                description: 'Rapporten stellen je in staat om uitgaven te groeperen voor eenvoudigere opvolging en organisatie.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Rapporten zijn beschikbaar in het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Tags op meerdere niveaus',
                description:
                    'Tagging op meerdere niveaus helpt je uitgaven met meer precisie te volgen. Wijs meerdere tags toe aan elke regel, zoals afdeling, klant of kostenplaats, om de volledige context van elke uitgave vast te leggen. Dit maakt meer gedetailleerde rapportage, goedkeuringsworkflows en boekhoudexporten mogelijk.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Labels op meerdere niveaus zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Kilometertarieven',
                description: 'Maak en beheer je eigen tarieven, houd afstanden bij in mijlen of kilometers en stel standaardcategorieën in voor afstandskosten.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kilometervergoedingen zijn beschikbaar in het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            auditor: {
                title: 'Auditor',
                description: 'Auditors krijgen alleen-lezen-toegang tot alle rapporten voor volledige transparantie en compliancebewaking.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Auditors zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Meerdere goedkeuringsniveaus',
                description:
                    'Meerdere goedkeuringsniveaus is een workflowtool voor bedrijven die meer dan één persoon nodig hebben om een rapport goed te keuren voordat het kan worden terugbetaald.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Meerdere goedkeuringsniveaus zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'per actieve gebruiker per maand.',
                perMember: 'per lid per maand.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Upgrade om toegang te krijgen tot deze functie, of <a href="${subscriptionLink}">kom meer te weten</a> over onze abonnementen en prijzen.</muted-text>`,
            upgradeToUnlock: 'Ontgrendel deze functie',
            completed: {
                headline: `Je hebt je workspace geüpgraded!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Je hebt ${policyName} succesvol geüpgraded naar het Control-abonnement! <a href="${subscriptionLink}">Bekijk je abonnement</a> voor meer informatie.</centered-text>`,
                categorizeMessage: `Je bent succesvol geüpgraded naar het Collect-abonnement. Nu kun je je uitgaven categoriseren!`,
                travelMessage: `Je hebt je abonnement succesvol geüpgraded naar het Collect-pakket. Je kunt nu beginnen met het boeken en beheren van reizen!`,
                distanceRateMessage: `Je bent succesvol geüpgraded naar het Collect-abonnement. Nu kun je het kilometertarief wijzigen!`,
                gotIt: 'Begrepen, bedankt',
                createdWorkspace: `Je hebt een werkruimte gemaakt!`,
            },
            commonFeatures: {
                title: 'Upgraden naar het Control-abonnement',
                note: 'Ontgrendel onze krachtigste functies, waaronder:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Het Control-abonnement begint bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`} <a href="${learnMoreMethodsRoute}">Meer informatie</a> over onze abonnementen en prijzen.</muted-text>`,
                    benefit1: 'Geavanceerde boekhoudkoppelingen (NetSuite, Sage Intacct en meer)',
                    benefit2: 'Slimme uitgavenregels',
                    benefit3: 'Meerlagige goedkeuringsworkflows',
                    benefit4: 'Verbeterde beveiligingscontroles',
                    toUpgrade: 'Klik om te upgraden',
                    selectWorkspace: 'selecteer een werkruimte en wijzig het type abonnement in',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Downgraden naar het Collect-abonnement',
                note: 'Als je een downgrade uitvoert, verlies je de toegang tot deze functies en meer:',
                benefits: {
                    note: 'Voor een volledig overzicht van onze abonnementen, bekijk onze',
                    pricingPage: 'Prijzenpagina',
                    confirm: 'Weet je zeker dat je wilt downgraden en je configuraties wilt verwijderen?',
                    warning: 'Dit kan niet ongedaan worden gemaakt.',
                    benefit1: 'Boekhoudkoppelingen (behalve QuickBooks Online en Xero)',
                    benefit2: 'Slimme uitgavenregels',
                    benefit3: 'Meerlagige goedkeuringsworkflows',
                    benefit4: 'Verbeterde beveiligingscontroles',
                    headsUp: 'Let op!',
                    multiWorkspaceNote: 'Je moet al je werkruimtes downgraden vóór je eerste maandelijkse betaling om een abonnement tegen het Collect-tarief te starten. Klik',
                    selectStep: '> selecteer elke workspace > wijzig het type abonnement naar',
                },
            },
            completed: {
                headline: 'Je werkruimte is gedegradeerd',
                description: 'Je hebt andere werkruimtes op het Control-abonnement. Om tegen het Collect-tarief gefactureerd te worden, moet je alle werkruimtes downgraden.',
                gotIt: 'Begrepen, bedankt',
            },
        },
        payAndDowngrade: {
            title: 'Betalen en downgraden',
            headline: 'Uw laatste betaling',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Je laatste factuur voor dit abonnement bedraagt <strong>${formattedAmount}</strong>`,
            description2: ({date}: DateParams) => `Bekijk hieronder je overzicht voor ${date}:`,
            subscription:
                'Let op! Deze actie beëindigt je Expensify-abonnement, verwijdert deze workspace en verwijdert alle workspaceleden. Als je deze workspace wilt behouden en alleen jezelf wilt verwijderen, laat dan eerst een andere beheerder de facturering overnemen.',
            genericFailureMessage: 'Er is een fout opgetreden bij het betalen van je rekening. Probeer het opnieuw.',
        },
        restrictedAction: {
            restricted: 'Beperkt',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Acties in de ${workspaceName}-werkruimte zijn momenteel beperkt`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Werkruimte-eigenaar ${workspaceOwnerName} moet de betaalkaart in het dossier toevoegen of bijwerken om nieuwe werkruimte-activiteit te ontgrendelen.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Je moet de betaalkaart in je account toevoegen of bijwerken om nieuwe workspace-activiteit te ontgrendelen.',
            addPaymentCardToUnlock: 'Voeg een betaalkaart toe om te ontgrendelen!',
            addPaymentCardToContinueUsingWorkspace: 'Voeg een betaalkaart toe om deze workspace te blijven gebruiken',
            pleaseReachOutToYourWorkspaceAdmin: 'Neem voor vragen contact op met de beheerder van je werkruimte.',
            chatWithYourAdmin: 'Chat met je beheerder',
            chatInAdmins: 'Chatten in #admins',
            addPaymentCard: 'Betalingskaart toevoegen',
            goToSubscription: 'Ga naar Abonnement',
        },
        rules: {
            individualExpenseRules: {
                title: 'Declaraties',
                subtitle: ({categoriesPageLink, tagsPageLink}: IndividualExpenseRulesSubtitleParams) =>
                    `<muted-text>Stel uitgavenlimieten en standaardinstellingen in voor individuele uitgaven. Je kunt ook regels maken voor <a href="${categoriesPageLink}">categorieën</a> en <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                receiptRequiredAmount: 'Vereist bonbedrag',
                receiptRequiredAmountDescription: 'Bonnen vereisen wanneer de uitgaven dit bedrag overschrijden, tenzij dit wordt overschreven door een categoriregel.',
                maxExpenseAmount: 'Maximumbedrag uitgave',
                maxExpenseAmountDescription: 'Markeer uitgaven die dit bedrag overschrijden, tenzij dit wordt overschreven door een categoriewaarde.',
                maxAge: 'Maximale leeftijd',
                maxExpenseAge: 'Maximale declaratieleeftijd',
                maxExpenseAgeDescription: 'Markeer uitgaven die ouder zijn dan een specifiek aantal dagen.',
                maxExpenseAgeDays: () => ({
                    one: '1 dag',
                    other: (count: number) => `${count} dagen`,
                }),
                cashExpenseDefault: 'Standaard voor contante uitgaven',
                cashExpenseDefaultDescription:
                    'Kies hoe contante uitgaven moeten worden aangemaakt. Een uitgave wordt beschouwd als een contante uitgave als het geen geïmporteerde bedrijfskaarttransactie is. Dit omvat handmatig aangemaakte uitgaven, bonnetjes, dagvergoedingen, afstands- en tijdsgebonden uitgaven.',
                reimbursableDefault: 'Vergoedbaar',
                reimbursableDefaultDescription: 'Onkosten worden meestal terugbetaald aan werknemers',
                nonReimbursableDefault: 'Niet-vergoedbaar',
                nonReimbursableDefaultDescription: 'Onkosten worden af en toe terugbetaald aan medewerkers',
                alwaysReimbursable: 'Altijd vergoedbaar',
                alwaysReimbursableDescription: 'Uitgaven worden altijd terugbetaald aan medewerkers',
                alwaysNonReimbursable: 'Altijd niet-terugbetaalbaar',
                alwaysNonReimbursableDescription: 'Declaraties worden nooit terugbetaald aan werknemers',
                billableDefault: 'Factureerbaar standaard',
                billableDefaultDescription: ({tagsPageLink}: BillableDefaultDescriptionParams) =>
                    `<muted-text>Kies of contante en creditcarduitgaven standaard factureerbaar moeten zijn. Factureerbare uitgaven worden in- of uitgeschakeld in <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                billable: 'Factureerbaar',
                billableDescription: 'Uitgaven worden meestal opnieuw gefactureerd aan klanten',
                nonBillable: 'Niet factureerbaar',
                nonBillableDescription: 'Kosten worden af en toe opnieuw aan klanten gefactureerd',
                eReceipts: 'e‑bonnen',
                eReceiptsHint: `eReceipts worden automatisch aangemaakt [voor de meeste USD-credittransacties](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Deelnemersbijhouding',
                attendeeTrackingHint: 'Volg de kosten per persoon voor elke uitgave.',
                prohibitedDefaultDescription:
                    'Markeer alle bonnen waarop alcohol, gokken of andere verboden artikelen voorkomen. Declaraties met bonnen waarop deze regels voorkomen, vereisen handmatige controle.',
                prohibitedExpenses: 'Verboden uitgaven',
                alcohol: 'Alcohol',
                hotelIncidentals: 'Hotelbijzaken',
                gambling: 'Gokken',
                tobacco: 'Tabak',
                adultEntertainment: 'Volwassenenentertainment',
            },
            expenseReportRules: {
                title: 'Onkostendeclaraties',
                subtitle: 'Automatiseer de naleving, goedkeuringen en betaling van onkostendeclaraties.',
                preventSelfApprovalsTitle: 'Zelfgoedkeuring voorkomen',
                preventSelfApprovalsSubtitle: 'Voorkom dat werkruim­teleden hun eigen onkostendeclaraties goedkeuren.',
                autoApproveCompliantReportsTitle: 'Rapporten die aan de regels voldoen automatisch goedkeuren',
                autoApproveCompliantReportsSubtitle: 'Configureer welke onkostenrapporten in aanmerking komen voor automatische goedkeuring.',
                autoApproveReportsUnderTitle: 'Automatisch rapporten goedkeuren onder',
                autoApproveReportsUnderDescription: 'Volledig conforme onkostendeclaraties onder dit bedrag worden automatisch goedgekeurd.',
                randomReportAuditTitle: 'Willekeurige rapportcontrole',
                randomReportAuditDescription: 'Vereisen dat sommige rapporten handmatig worden goedgekeurd, zelfs als ze in aanmerking komen voor automatische goedkeuring.',
                autoPayApprovedReportsTitle: 'Automatisch betalen van goedgekeurde rapporten',
                autoPayApprovedReportsSubtitle: 'Configureren welke onkostendeclaraties in aanmerking komen voor automatische betaling.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Voer een bedrag in dat lager is dan ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle: 'Ga naar Meer functies en schakel Workflows in, voeg vervolgens Betalingen toe om deze functie te ontgrendelen.',
                autoPayReportsUnderTitle: 'Automatisch rapporten betalen onder',
                autoPayReportsUnderDescription: 'Volledig conforme onkostendeclaraties onder dit bedrag worden automatisch uitbetaald.',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `Ga naar [meer functies](${moreFeaturesLink}) en schakel workflows in, voeg vervolgens ${featureName} toe om deze functie te ontgrendelen.`,
                enableFeatureSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `Ga naar [meer functies](${moreFeaturesLink}) en schakel ${featureName} in om deze functie te ontgrendelen.`,
            },
            categoryRules: {
                title: 'Categorische regels',
                approver: 'Fiatteur',
                requireDescription: 'Beschrijving vereist',
                descriptionHint: 'Beschrijving-hint',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Herinner medewerkers eraan om extra informatie te geven voor uitgaven in de categorie “${categoryName}”. Deze hint verschijnt in het beschrijvingsveld van onkosten.`,
                descriptionHintLabel: 'Tip',
                descriptionHintSubtitle: 'Pro-tip: Hoe korter, hoe beter!',
                maxAmount: 'Max. bedrag',
                flagAmountsOver: 'Bedragen markeren boven',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `Is van toepassing op de categorie ‘${categoryName}’.`,
                flagAmountsOverSubtitle: 'Dit overschrijft het maximumbedrag voor alle uitgaven.',
                expenseLimitTypes: {
                    expense: 'Individuele uitgave',
                    expenseSubtitle: 'Markeer onkostbedragen per categorie. Deze regel overschrijft de algemene werkruimte­regel voor het maximale onkostbedrag.',
                    daily: 'Categorietotaal',
                    dailySubtitle: 'Markeer totale categoriebesteding per onkostendeclaratie.',
                },
                requireReceiptsOver: 'Bonnen verplichten boven',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standaard`,
                    never: 'Nooit bonnetjes vereisen',
                    always: 'Altijd bonnen vereisen',
                },
                defaultTaxRate: 'Standaardbelastingtarief',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Ga naar [Meer functies](${moreFeaturesLink}) en schakel workflows in, voeg vervolgens goedkeuringen toe om deze functie te ontgrendelen.`,
            },
            customRules: {
                title: 'Uitgavenbeleid',
                cardSubtitle: 'Hier staat het declaratiebeleid van je team, zodat iedereen op één lijn zit over wat er wordt vergoed.',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Verzamelen',
                    description: 'Voor teams die hun processen willen automatiseren.',
                },
                corporate: {
                    label: 'Controle',
                    description: 'Voor organisaties met geavanceerde vereisten.',
                },
            },
            description: 'Kies een abonnement dat bij je past. Voor een gedetailleerde lijst met functies en prijzen, bekijk onze',
            subscriptionLink: 'helppagina voor abonnementssoorten en prijzen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Je hebt je vastgelegd op 1 actief lid op het Control-abonnement tot je jaarlijkse abonnement afloopt op ${annualSubscriptionEndDate}. Je kunt overschakelen naar een betalen-naar-gebruik-abonnement en downgraden naar het Collect-abonnement vanaf ${annualSubscriptionEndDate} door automatisch verlengen uit te schakelen in`,
                other: `Je hebt je vastgelegd op ${count} actieve leden in het Control-abonnement tot je jaarlijkse abonnement eindigt op ${annualSubscriptionEndDate}. Je kunt overschakelen naar een betalen-naar-gebruik-abonnement en downgraden naar het Collect-abonnement vanaf ${annualSubscriptionEndDate} door automatisch verlengen uit te schakelen in`,
            }),
            subscriptions: 'Abonnementen',
        },
    },
    getAssistancePage: {
        title: 'Hulp krijgen',
        subtitle: 'Wij zijn hier om jouw pad naar grootsheid vrij te maken!',
        description: 'Kies uit de onderstaande ondersteuningsopties:',
        chatWithConcierge: 'Chatten met Concierge',
        scheduleSetupCall: 'Een installatiegesprek plannen',
        scheduleACall: 'Gesprek inplannen',
        questionMarkButtonTooltip: 'Krijg hulp van ons team',
        exploreHelpDocs: 'Helpdocumentatie verkennen',
        registerForWebinar: 'Registreren voor webinar',
        onboardingHelp: 'Hulp bij onboarding',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Standaard huidskleur wijzigen',
        headers: {
            frequentlyUsed: 'Vaak gebruikt',
            smileysAndEmotion: 'Smileys & Emotie',
            peopleAndBody: 'Mensen & Lichaam',
            animalsAndNature: 'Dieren & Natuur',
            foodAndDrink: 'Eten & drinken',
            travelAndPlaces: 'Reizen & Plaatsen',
            activities: 'Activiteiten',
            objects: 'Objecten',
            symbols: 'Symbolen',
            flags: 'Vlaggen',
        },
    },
    newRoomPage: {
        newRoom: 'Nieuwe ruimte',
        groupName: 'Groepsnaam',
        roomName: 'Kamernaam',
        visibility: 'Zichtbaarheid',
        restrictedDescription: 'Mensen in jouw werkruimte kunnen deze ruimte vinden',
        privateDescription: 'Mensen die voor deze ruimte zijn uitgenodigd, kunnen deze vinden',
        publicDescription: 'Iedereen kan deze kamer vinden',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Iedereen kan deze kamer vinden',
        createRoom: 'Ruimte maken',
        roomAlreadyExistsError: 'Er bestaat al een kamer met deze naam',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} is een standaardruimte in alle werkruimtes. Kies een andere naam.`,
        roomNameInvalidError: 'Ruumtenamen mogen alleen kleine letters, cijfers en koppeltekens bevatten',
        pleaseEnterRoomName: 'Voer een kamernaam in',
        pleaseSelectWorkspace: 'Selecteer een workspace',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}hernoemd tot "${newName}" (voorheen "${oldName}")` : `${actor}heeft deze ruimte hernoemd naar "${newName}" (voorheen "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Kamer hernoemd naar ${newName}`,
        social: 'Sociaal',
        selectAWorkspace: 'Selecteer een workspace',
        growlMessageOnRenameError: 'Kan ruimte in werkruimte niet hernoemen. Controleer je verbinding en probeer het opnieuw.',
        visibilityOptions: {
            restricted: 'Werkruimte', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privé',
            public: 'Openbaar',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Openbare aankondiging',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Verzenden en sluiten',
        submitAndApprove: 'Indienen en goedkeuren',
        advanced: 'GEAVANCEERD',
        dynamicExternal: 'DYNAMISCH_EXTERN',
        smartReport: 'SMARTRAPPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `heeft ${approverName} (${approverEmail}) toegevoegd als fiatteur voor het veld ${field} „${name}”`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `heeft ${approverName} (${approverEmail}) verwijderd als goedkeurder voor het ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `heeft de fiatteur voor het veld ${field} „${name}” gewijzigd naar ${formatApprover(newApproverName, newApproverEmail)} (voorheen ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `heeft de categorie "${categoryName}" toegevoegd`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `heeft de categorie "${categoryName}" verwijderd`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'uitgeschakeld' : 'ingeschakeld'} de categorie "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `de looncode "${newValue}" toegevoegd aan de categorie "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `heeft de looncode "${oldValue}" verwijderd uit de categorie "${categoryName}"`;
            }
            return `heeft de salariscode van de categorie "${categoryName}" gewijzigd in “${newValue}” (voorheen “${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `GL-code "${newValue}" toegevoegd aan de categorie "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `heeft de GL-code "${oldValue}" verwijderd uit de categorie "${categoryName}"`;
            }
            return `heeft de grootboekcode van de categorie “${categoryName}” gewijzigd naar “${newValue}” (voorheen “${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `heeft de beschrijving van de categorie "${categoryName}" gewijzigd naar ${!oldValue ? 'Vereist' : 'Niet vereist'} (voorheen ${!oldValue ? 'Niet vereist' : 'Vereist'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `heeft een maximaal bedrag van ${newAmount} toegevoegd aan de categorie "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `heeft het maximale bedrag van ${oldAmount} verwijderd uit de categorie "${categoryName}"`;
            }
            return `heeft het maximale bedrag voor de categorie "${categoryName}" gewijzigd naar ${newAmount} (voorheen ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `heeft een limiettype van ${newValue} toegevoegd aan de categorie "${categoryName}"`;
            }
            return `het categorielimittype van "${categoryName}" gewijzigd naar ${newValue} (voorheen ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `categorie "${categoryName}" bijgewerkt door Ontvangsten te wijzigen in ${newValue}`;
            }
            return `heeft de categorie "${categoryName}" gewijzigd naar ${newValue} (voorheen ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `heeft de categorie "${oldName}" hernoemd naar "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `heeft de beschrijvingstip "${oldValue}" verwijderd uit de categorie "${categoryName}"`;
            }
            return !oldValue
                ? `de beschrijvingshint "${newValue}" toegevoegd aan de categorie "${categoryName}"`
                : `heeft de hint voor de categoriebeschrijving van "${categoryName}" gewijzigd in “${newValue}” (voorheen “${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `heeft de taglijstnaam gewijzigd in „${newName}” (voorheen „${oldName}”)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `heeft de tag "${tagName}" toegevoegd aan de lijst "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `heeft de taglijst "${tagListName}" bijgewerkt door de tag "${oldName}" te wijzigen in "${newName}`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} de tag "${tagName}" op de lijst "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `heeft het label „${tagName}” verwijderd uit de lijst „${tagListName}”`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `heeft "${count}" tags verwijderd uit de lijst "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `heeft de tag "${tagName}" in de lijst "${tagListName}" bijgewerkt door ${updatedField} te wijzigen in "${newValue}" (voorheen "${oldValue}")`;
            }
            return `heeft de tag "${tagName}" op de lijst "${tagListName}" bijgewerkt door een ${updatedField} met "${newValue}" toe te voegen`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `heeft de ${customUnitName} ${updatedField} gewijzigd naar "${newValue}" (voorheen "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'ingeschakeld' : 'uitgeschakeld'} belastingregistratie op afstandstarieven`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `heeft een nieuw "${customUnitName}"-tarief "${rateName}" toegevoegd`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `het tarief van de ${customUnitName} ${updatedField} „${customUnitRateName}” gewijzigd naar „${newValue}” (voorheen „${oldValue}”)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `de belastingtarief op het afstandstarief "${customUnitRateName}" gewijzigd naar "${newValue} (${newTaxPercentage})" (voorheen "${oldValue} (${oldTaxPercentage})")`;
            }
            return `heeft het belastingtarief "${newValue} (${newTaxPercentage})" toegevoegd aan het afstandstarief "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `heeft het terugvorderbare belastingdeel op het afstandstarief "${customUnitRateName}" gewijzigd naar "${newValue}" (voorheen "${oldValue}")`;
            }
            return `heeft een terugvorderbaar belastingdeel van "${newValue}" toegevoegd aan het kilometertarief "${customUnitRateName}`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `heeft het tarief "${rateName}" voor "${customUnitName}" verwijderd`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `heeft ${fieldType}-rapportveld "${fieldName}" toegevoegd`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `stel de standaardwaarde van het rapportveld "${fieldName}" in op "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `heeft de optie "${optionName}" toegevoegd aan het rapportveld "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `heeft de optie „${optionName}” verwijderd uit het rapportveld „${fieldName}”`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'ingeschakeld' : 'uitgeschakeld'} de optie "${optionName}" voor het rapportveld "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'ingeschakeld' : 'uitgeschakeld'} alle opties voor het rapportveld "${fieldName}"`;
            }
            return `${allEnabled ? 'ingeschakeld' : 'uitgeschakeld'} de optie "${optionName}" voor het rapportveld "${fieldName}", waardoor alle opties ${allEnabled ? 'ingeschakeld' : 'uitgeschakeld'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `verwijderd ${fieldType}-rapportveld "${fieldName}"`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `"Voorkom zelfgoedkeuring" bijgewerkt naar "${newValue === 'true' ? 'Ingeschakeld' : 'Uitgeschakeld'}" (voorheen "${oldValue === 'true' ? 'Ingeschakeld' : 'Uitgeschakeld'}")`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `het maximale bedrag voor een bonplichtige uitgave gewijzigd naar ${newValue} (voorheen ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `heeft het maximale uitgavenbedrag voor overtredingen gewijzigd naar ${newValue} (voorheen ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `"Maximale onkostenduur (dagen)" bijgewerkt naar "${newValue}" (voorheen "${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `stel de maandelijkse rapportindieningsdatum in op "${newValue}"`;
            }
            return `deelname datum voor maandrapport bijgewerkt naar "${newValue}" (voorheen "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `"Kosten opnieuw aan klanten doorberekenen" bijgewerkt naar "${newValue}" (voorheen "${oldValue}")`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `“Standaard contante uitgave” bijgewerkt naar “${newValue}” (voorheen “${oldValue}”)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `schakelde "Standaardrapporttitels afdwingen" in ${value ? 'aan' : 'uit'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `heeft de naam van deze workspace gewijzigd in "${newName}" (voorheen "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `stel de beschrijving van deze workspace in op "${newDescription}"`
                : `heeft de beschrijving van deze workspace bijgewerkt naar "${newDescription}" (voorheen "${oldDescription}")`,
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
            `je rol in ${policyName} is gewijzigd van ${oldRole} naar gebruiker. Je bent verwijderd uit alle onkostenchats van indieners, behalve uit je eigen.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `standaardvaluta bijgewerkt naar ${newCurrency} (voorheen ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `de autom. rapportagefrequentie bijgewerkt naar "${newFrequency}" (voorheen "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `heeft de goedkeuringsmodus bijgewerkt naar "${newValue}" (voorheen "${oldValue}")`,
        upgradedWorkspace: 'heeft deze workspace geüpgraded naar het Control-abonnement',
        forcedCorporateUpgrade: `Deze werkruimte is geüpgraded naar het Control-abonnement. Klik <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">hier</a> voor meer informatie.`,
        downgradedWorkspace: 'heeft deze workspace gedowngraded naar het Collect-abonnement',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `het percentage van rapporten dat willekeurig wordt doorgestuurd voor handmatige goedkeuring gewijzigd naar ${Math.round(newAuditRate * 100)}% (voorheen ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `heeft de handmatige goedkeuringslimiet voor alle onkosten gewijzigd naar ${newLimit} (voorheen ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} categorieën`;
                case 'tags':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} tags`;
                case 'workflows':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} workflows`;
                case 'distance rates':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} afstandstarieven`;
                case 'accounting':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} boekhouding`;
                case 'Expensify Cards':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} Expensify Cards`;
                case 'company cards':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} bedrijfskaarten`;
                case 'invoicing':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} facturatie`;
                case 'per diem':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} dagvergoeding`;
                case 'receipt partners':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} bonpartners`;
                case 'rules':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} regels`;
                case 'tax tracking':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} belastingregistratie`;
                default:
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} bijhouden van deelnemers`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} terugbetalingen voor deze workspace`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `heeft de belasting "${taxName}" toegevoegd`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `heeft de belasting “${taxName}” verwijderd`,
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
                    return `${oldValue ? 'uitgeschakeld' : 'ingeschakeld'} de belasting “${taxName}”`;
                }
                default: {
                    return '';
                }
            }
        },
    },
    roomMembersPage: {
        memberNotFound: 'Lid niet gevonden.',
        useInviteButton: 'Om een nieuw lid voor de chat uit te nodigen, gebruikt u de uitnodigingsknop hierboven.',
        notAuthorized: `Je hebt geen toegang tot deze pagina. Als je deze ruimte wilt joinen, vraag dan een lid van de ruimte om je toe te voegen. Iets anders aan de hand? Neem contact op met ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Het lijkt erop dat deze ruimte is gearchiveerd. Voor vragen, neem contact op met ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Weet je zeker dat je ${memberName} uit de ruimte wilt verwijderen?`,
            other: 'Weet je zeker dat je de geselecteerde leden uit de ruimte wilt verwijderen?',
        }),
        error: {
            genericAdd: 'Er is een probleem opgetreden bij het toevoegen van dit kamer‑lid',
        },
    },
    newTaskPage: {
        assignTask: 'Taak toewijzen',
        assignMe: 'Aan mij toewijzen',
        confirmTask: 'Taak bevestigen',
        confirmError: 'Voer een titel in en selecteer een deelbestemming',
        descriptionOptional: 'Beschrijving (optioneel)',
        pleaseEnterTaskName: 'Voer een titel in',
        pleaseEnterTaskDestination: 'Selecteer waar je deze taak wilt delen',
    },
    task: {
        task: 'Taak',
        title: 'Titel',
        description: 'Beschrijving',
        assignee: 'Toegewezene',
        completed: 'Voltooid',
        action: 'Voltooien',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `taak voor ${title}`,
            completed: 'gemarkeerd als voltooid',
            canceled: 'verwijderde taak',
            reopened: 'gemarkeerd als onvolledig',
            error: 'Je hebt geen toestemming om de gevraagde actie uit te voeren',
        },
        markAsComplete: 'Markeren als voltooid',
        markAsIncomplete: 'Markeren als onvolledig',
        assigneeError: 'Er is een fout opgetreden bij het toewijzen van deze taak. Probeer een andere toegewezene.',
        genericCreateTaskFailureMessage: 'Er is een fout opgetreden bij het maken van deze taak. Probeer het later opnieuw.',
        deleteTask: 'Taak verwijderen',
        deleteConfirmation: 'Weet je zeker dat je deze taak wilt verwijderen?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Overzicht van ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Sneltoetsen',
        subtitle: 'Bespaar tijd met deze handige sneltoetsen:',
        shortcuts: {
            openShortcutDialog: 'Opent het sneltoetsenvenster',
            markAllMessagesAsRead: 'Markeer alle berichten als gelezen',
            escape: 'Dialoogvensters sluiten',
            search: 'Zoekdialoog openen',
            newChat: 'Nieuw chatvenster',
            copy: 'Opmerking kopiëren',
            openDebug: 'Dialoogvenster Testvoorkeuren openen',
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
                title: 'Niets om weer te geven',
                subtitle: `Probeer je zoekcriteria aan te passen of iets te maken met de knop +.`,
            },
            emptyExpenseResults: {
                title: 'Je hebt nog geen uitgaven aangemaakt',
                subtitle: 'Maak een uitgave aan of maak een testrit met Expensify om meer te leren.',
                subtitleWithOnlyCreateButton: 'Gebruik de groene knop hieronder om een uitgave aan te maken.',
            },
            emptyReportResults: {
                title: 'Je hebt nog geen rapporten gemaakt',
                subtitle: 'Maak een rapport of probeer Expensify uit om meer te ontdekken.',
                subtitleWithOnlyCreateButton: 'Gebruik de groene knop hieronder om een rapport te maken.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Je hebt nog geen
                    facturen aangemaakt
                `),
                subtitle: 'Stuur een factuur of maak een proefrit met Expensify om meer te weten te komen.',
                subtitleWithOnlyCreateButton: 'Gebruik de groene knop hieronder om een factuur te versturen.',
            },
            emptyTripResults: {
                title: 'Geen reizen om weer te geven',
                subtitle: 'Begin door hieronder je eerste reis te boeken.',
                buttonText: 'Boek een reis',
            },
            emptySubmitResults: {
                title: 'Geen onkostendeclaraties om in te dienen',
                subtitle: 'Alles in orde. Maak een ererondje!',
                buttonText: 'Rapport maken',
            },
            emptyApproveResults: {
                title: 'Geen uitgaven om goed te keuren',
                subtitle: 'Nul uitgaven. Maximaal chill. Goed gedaan!',
            },
            emptyPayResults: {
                title: 'Geen uitgaven om te betalen',
                subtitle: 'Gefeliciteerd! Je hebt de finish bereikt.',
            },
            emptyExportResults: {
                title: 'Geen uitgaven om te exporteren',
                subtitle: 'Tijd om even rustig aan te doen, goed werk.',
            },
            emptyStatementsResults: {
                title: 'Geen uitgaven om weer te geven',
                subtitle: 'Geen resultaten. Probeer je filters aan te passen.',
            },
            emptyUnapprovedResults: {
                title: 'Geen uitgaven om goed te keuren',
                subtitle: 'Nul uitgaven. Maximaal chill. Goed gedaan!',
            },
        },
        statements: 'Afschriften',
        unapprovedCash: 'Niet-goedgekeurd contant geld',
        unapprovedCard: 'Niet-goedgekeurde kaart',
        reconciliation: 'Reconciliatie',
        saveSearch: 'Zoekopdracht opslaan',
        deleteSavedSearch: 'Opgeslagen zoekopdracht verwijderen',
        deleteSavedSearchConfirm: 'Weet je zeker dat je deze zoekopdracht wilt verwijderen?',
        searchName: 'Naam zoeken',
        savedSearchesMenuItemTitle: 'Opgeslagen',
        groupedExpenses: 'gegroepeerde uitgaven',
        bulkActions: {
            approve: 'Goedkeuren',
            pay: 'Betalen',
            delete: 'Verwijderen',
            hold: 'In de wacht',
            unhold: 'Vasthouden opheffen',
            reject: 'Afwijzen',
            noOptionsAvailable: 'Geen opties beschikbaar voor de geselecteerde groep uitgaven.',
        },
        filtersHeader: 'Filters',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Vóór ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `Na ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `Op ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Nooit',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Vorige maand',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Deze maand',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Laatste afschrift',
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
                    `Alle ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Alle geïmporteerde CSV-kaarten${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} is ${value}`,
            current: 'Huidig',
            past: 'Verleden',
            submitted: 'Ingediend',
            approved: 'Goedgekeurd',
            paid: 'Betaald',
            exported: 'Geëxporteerd',
            posted: 'Geboekt',
            withdrawn: 'Ingetrokken',
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
        },
        has: 'Heeft',
        groupBy: 'Groeperen op',
        moneyRequestReport: {
            emptyStateTitle: 'Dit rapport bevat geen uitgaven.',
        },
        noCategory: 'Geen categorie',
        noTag: 'Geen tag',
        expenseType: 'Onkostype',
        withdrawalType: 'Opnametype',
        recentSearches: 'Recente zoekopdrachten',
        recentChats: 'Recente chats',
        searchIn: 'Zoeken in',
        searchPlaceholder: 'Zoek iets',
        suggestions: 'Suggesties',
        exportSearchResults: {
            title: 'Export aanmaken',
            description: 'Wow, dat zijn veel items! We bundelen ze, en Concierge stuurt je binnenkort een bestand.',
        },
        exportAll: {
            selectAllMatchingItems: 'Selecteer alle overeenkomende items',
            allMatchingItemsSelected: 'Alle overeenkomende items geselecteerd',
        },
    },
    genericErrorPage: {
        title: 'Oeps, er is iets misgegaan!',
        body: {
            helpTextMobile: 'Sluit de app en open deze opnieuw, of schakel over naar',
            helpTextWeb: 'web.',
            helpTextConcierge: 'Als het probleem aanhoudt, neem dan contact op met',
        },
        refresh: 'Vernieuwen',
    },
    fileDownload: {
        success: {
            title: 'Gedownload!',
            message: 'Bijlage succesvol gedownload!',
            qrMessage:
                'Controleer je foto- of downloadmap voor een kopie van je QR-code. Protip: voeg hem toe aan een presentatie zodat je publiek hem kan scannen en rechtstreeks met je kan connecten.',
        },
        generalError: {
            title: 'Bijlagefout',
            message: 'Bijlage kan niet worden gedownload',
        },
        permissionError: {
            title: 'Opslagtoegang',
            message: 'Expensify kan geen bijlagen opslaan zonder toegang tot opslag. Tik op instellingen om de machtigingen bij te werken.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Nieuwe Expensify',
        about: 'Over New Expensify',
        update: 'Nieuwe Expensify bijwerken',
        checkForUpdates: 'Controleren op updates',
        toggleDevTools: 'Ontwikkelaarstools in-/uitschakelen',
        viewShortcuts: 'Toetsencombinaties bekijken',
        services: 'Diensten',
        hide: 'Nieuwe Expensify verbergen',
        hideOthers: 'Anderen verbergen',
        showAll: 'Alles weergeven',
        quit: 'New Expensify afsluiten',
        fileMenu: 'Bestand',
        closeWindow: 'Venster sluiten',
        editMenu: 'Bewerken',
        undo: 'Ongedaan maken',
        redo: 'Opnieuw',
        cut: 'Knippen',
        copy: 'Kopiëren',
        paste: 'Plakken',
        pasteAndMatchStyle: 'Plakken en stijl aanpassen',
        pasteAsPlainText: 'Plakken als platte tekst',
        delete: 'Verwijderen',
        selectAll: 'Alles selecteren',
        speechSubmenu: 'Spraak',
        startSpeaking: 'Begin met spreken',
        stopSpeaking: 'Stop met spreken',
        viewMenu: 'Weergeven',
        reload: 'Opnieuw laden',
        forceReload: 'Geforceerd herladen',
        resetZoom: 'Ware grootte',
        zoomIn: 'Inzoomen',
        zoomOut: 'Uitzoomen',
        togglefullscreen: 'Volledig scherm schakelen',
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
        communityDiscussions: 'Community-discussies',
        searchIssues: 'Problemen zoeken',
    },
    historyMenu: {
        forward: 'Doorsturen',
        back: 'Terug',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Update beschikbaar',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `De nieuwe versie is binnenkort beschikbaar.${!isSilentUpdating ? 'We laten het je weten wanneer we klaar zijn om bij te werken.' : ''}`,
            soundsGood: 'Klinkt goed',
        },
        notAvailable: {
            title: 'Update niet beschikbaar',
            message: 'Er is momenteel geen update beschikbaar. Probeer het later opnieuw!',
            okay: 'Oké',
        },
        error: {
            title: 'Updatecontrole mislukt',
            message: 'We konden niet controleren op een update. Probeer het over een tijdje opnieuw.',
        },
    },
    settlement: {
        status: {
            pending: 'In behandeling',
            cleared: 'Afgestemd',
            failed: 'Mislukt',
        },
        failedError: ({link}: {link: string}) => `We proberen deze afwikkeling opnieuw zodra je <a href="${link}">je account ontgrendelt</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • Opname-ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Rapportindeling',
        groupByLabel: 'Groeperen op:',
        selectGroupByOption: 'Selecteer hoe rapportuitgaven gegroepeerd moeten worden',
        uncategorized: 'Niet gecategoriseerd',
        noTag: 'Geen tag',
        selectGroup: ({groupName}: {groupName: string}) => `Selecteer alle uitgaven in ${groupName}`,
        groupBy: {
            category: 'Categorie',
            tag: 'Label',
        },
    },
    report: {
        newReport: {
            createReport: 'Rapport maken',
            chooseWorkspace: 'Kies een workspace voor dit rapport.',
            emptyReportConfirmationTitle: 'Je hebt al een leeg rapport',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Weet je zeker dat je een ander rapport wilt aanmaken in ${workspaceName}? Je kunt je lege rapporten openen in`,
            emptyReportConfirmationPromptLink: 'Rapporten',
            genericWorkspaceName: 'deze werkruimte',
        },
        genericCreateReportFailureMessage: 'Onverwachte fout bij het aanmaken van deze chat. Probeer het later opnieuw.',
        genericAddCommentFailureMessage: 'Onverwachte fout bij het plaatsen van de reactie. Probeer het later opnieuw.',
        genericUpdateReportFieldFailureMessage: 'Onverwachte fout bij het bijwerken van het veld. Probeer het later opnieuw.',
        genericUpdateReportNameEditFailureMessage: 'Onverwachte fout bij het hernoemen van het rapport. Probeer het later opnieuw.',
        noActivityYet: 'Nog geen activiteit',
        connectionSettings: 'Verbindingsinstellingen',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `${fieldName} gewijzigd naar "${newValue}" (voorheen "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `stel ${fieldName} in op "${newValue}"`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) => {
                    if (!toPolicyName) {
                        return `heeft de workspace gewijzigd${fromPolicyName ? `(eerder ${fromPolicyName})` : ''}`;
                    }
                    return `heeft de werkruimte gewijzigd naar ${toPolicyName}${fromPolicyName ? `(eerder ${fromPolicyName})` : ''}`;
                },
                changeType: ({oldType, newType}: ChangeTypeParams) => `type gewijzigd van ${oldType} naar ${newType}`,
                exportedToCSV: `geëxporteerd naar CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `geëxporteerd naar ${translatedLabel}`;
                    },
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `geëxporteerd naar ${label} via`,
                    automaticActionTwo: 'boekhoudinstellingen',
                    manual: ({label}: ExportedToIntegrationParams) => `heeft dit rapport gemarkeerd als handmatig geëxporteerd naar ${label}.`,
                    automaticActionThree: 'en met succes een record aangemaakt voor',
                    reimburseableLink: 'onkosten uit eigen zak',
                    nonReimbursableLink: 'bedrijfskaartuitgaven',
                    pending: ({label}: ExportedToIntegrationParams) => `bezig met exporteren van dit rapport naar ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `exporteren van dit rapport naar ${label} is mislukt ("${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `heeft een bon toegevoegd`,
                managerDetachReceipt: `heeft een bon verwijderd`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `elders betaald ${currency}${amount}`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `${currency}${amount} betaald via integratie`,
                outdatedBankAccount: `kon de betaling niet verwerken wegens een probleem met de bankrekening van de betaler`,
                reimbursementACHBounce: `kon de betaling niet verwerken vanwege een probleem met de bankrekening`,
                reimbursementACHCancelled: `heeft de betaling geannuleerd`,
                reimbursementAccountChanged: `kan de betaling niet verwerken omdat de betaler van bankrekening is veranderd`,
                reimbursementDelayed: `heeft de betaling verwerkt, maar deze is met 1–2 extra werkdagen vertraagd`,
                selectedForRandomAudit: `willekeurig geselecteerd voor controle`,
                selectedForRandomAuditMarkdown: `willekeurig geselecteerd voor controle`,
                share: ({to}: ShareParams) => `uitgenodigd lid ${to}`,
                unshare: ({to}: UnshareParams) => `verwijderd lid ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `betaald ${currency}${amount}`,
                takeControl: `nam de controle over`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `er is een probleem opgetreden bij het synchroniseren met ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Los het probleem op in de <a href="${workspaceAccountingLink}">werkruimte-instellingen</a>.`,
                addEmployee: ({email, role}: AddEmployeeParams) => `${email} toegevoegd als ${role === 'member' ? 'a' : 'een'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `heeft de rol van ${email} bijgewerkt naar ${newRole} (voorheen ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `aangepast veld 1 van ${email} verwijderd (voorheen “${previousValue}”)`;
                    }
                    return !previousValue
                        ? `heeft “${newValue}” toegevoegd aan aangepaste veld 1 van ${email}`
                        : `heeft aangepaste veld 1 van ${email} gewijzigd in „${newValue}” (voorheen „${previousValue}”)`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `aangepast veld 2 van ${email} verwijderd (voorheen "${previousValue}")`;
                    }
                    return !previousValue
                        ? `heeft "${newValue}" toegevoegd aan aangepaste veld 2 van ${email}`
                        : `heeft aangepaste veld 2 van ${email} gewijzigd in "${newValue}" (voorheen "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} heeft de workspace verlaten`,
                removeMember: ({email, role}: AddEmployeeParams) => `${role} ${email} verwijderd`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `verbinding met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} verwijderd`,
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
        expenseManagement: 'Onkostenbeheer',
        spendManagement: 'Uitgavenbeheer',
        expenseReports: 'Declaraties',
        companyCreditCard: 'Bedrijfscreditcard',
        receiptScanningApp: 'Bonappscanner-app',
        billPay: 'Rekeningen betalen',
        invoicing: 'Facturatie',
        CPACard: 'CPA-kaart',
        payroll: 'Loonadministratie',
        travel: 'Reizen',
        resources: 'Hulpbronnen',
        expensifyApproved: 'ExpensifyGoedgekeurd!',
        pressKit: 'Perskit',
        support: 'Ondersteuning',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Servicevoorwaarden',
        privacy: 'Privacy',
        learnMore: 'Meer informatie',
        aboutExpensify: 'Over Expensify',
        blog: 'Blog',
        jobs: 'Vacatures',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relaties met investeerders',
        getStarted: 'Aan de slag',
        createAccount: 'Een nieuw account aanmaken',
        logIn: 'Inloggen',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Navigeer terug naar chatlijst',
        chatWelcomeMessage: 'Chat welkomstbericht',
        navigatesToChat: 'Navigeert naar een chat',
        newMessageLineIndicator: 'Nieuwe berichtregelindicator',
        chatMessage: 'Chatbericht',
        lastChatMessagePreview: 'Laatste chatberichtvoorbeeld',
        workspaceName: 'Werkruimte naam',
        chatUserDisplayNames: 'Weergavenamen van chatleden',
        scrollToNewestMessages: 'Scroll naar nieuwste berichten',
        preStyledText: 'Vooraf opgemaakte tekst',
        viewAttachment: 'Bijlage bekijken',
    },
    parentReportAction: {
        deletedReport: 'Verwijderd rapport',
        deletedMessage: 'Verwijderd bericht',
        deletedExpense: 'Verwijderde uitgave',
        reversedTransaction: 'Teruggedraaide transactie',
        deletedTask: 'Verwijderde taak',
        hiddenMessage: 'Verborgen bericht',
    },
    threads: {
        thread: 'Gesprek',
        replies: 'Antwoorden',
        reply: 'Beantwoorden',
        from: 'Van',
        in: 'in',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `Van ${reportName}${workspaceName ? `in ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: 'URL kopiëren',
        copied: 'Gekopieerd!',
    },
    moderation: {
        flagDescription: 'Alle gemarkeerde berichten worden ter beoordeling naar een moderator gestuurd.',
        chooseAReason: 'Kies hieronder een reden om te markeren:',
        spam: 'Spam',
        spamDescription: 'Ongevraagde promotie buiten het onderwerp',
        inconsiderate: 'Onattent',
        inconsiderateDescription: 'Beledigende of respectloze formulering, met twijfelachtige bedoelingen',
        intimidation: 'Intimidatie',
        intimidationDescription: 'Agressief een agenda nastreven ondanks geldige bezwaren',
        bullying: 'Pesten',
        bullyingDescription: 'Een individu als doelwit nemen om gehoorzaamheid af te dwingen',
        harassment: 'Intimidatie',
        harassmentDescription: 'Racistisch, misogynistisch of ander algemeen discriminerend gedrag',
        assault: 'Aanval',
        assaultDescription: 'Specifiek gerichte emotionele aanval met de intentie om schade toe te brengen',
        flaggedContent: 'Dit bericht is gemarkeerd als in strijd met onze communautaire regels en de inhoud is verborgen.',
        hideMessage: 'Bericht verbergen',
        revealMessage: 'Bericht weergeven',
        levelOneResult: 'Verstuurt een anonieme waarschuwing en het bericht wordt gemeld voor beoordeling.',
        levelTwoResult: 'Bericht verborgen voor kanaal, plus anonieme waarschuwing en bericht is gemeld voor beoordeling.',
        levelThreeResult: 'Bericht uit het kanaal verwijderd plus anonieme waarschuwing en bericht is gemeld voor beoordeling.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Uitnodigen om onkosten in te dienen',
        inviteToChat: 'Alleen voor chat uitnodigen',
        nothing: 'Niets doen',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Accepteren',
        decline: 'Weigeren',
    },
    actionableMentionTrackExpense: {
        submit: 'Verzenden naar iemand',
        categorize: 'Categoriseer het',
        share: 'Deel dit met mijn accountant',
        nothing: 'Niets voor nu',
    },
    teachersUnitePage: {
        teachersUnite: 'Leraren Verenigd',
        joinExpensifyOrg:
            'Sluit je aan bij Expensify.org om onrecht over de hele wereld uit te bannen. De huidige campagne “Teachers Unite” ondersteunt onderwijzers overal door de kosten van essentiële schoolspullen te delen.',
        iKnowATeacher: 'Ik ken een leraar',
        iAmATeacher: 'Ik ben een leraar',
        getInTouch: 'Uitstekend! Deel hun gegevens zodat we contact met hen kunnen opnemen.',
        introSchoolPrincipal: 'Introductie bij je schooldirecteur',
        schoolPrincipalVerifyExpense:
            'Expensify.org deelt de kosten van essentiële schoolspullen, zodat leerlingen uit huishoudens met een laag inkomen een betere leerervaring kunnen hebben. Je directeur zal worden gevraagd je uitgaven te verifiëren.',
        principalFirstName: 'Voornaam van verantwoordelijke',
        principalLastName: 'Achternaam van de hoofdpersoon',
        principalWorkEmail: 'Primaire zakelijke e-mailadres',
        updateYourEmail: 'Werk uw e-mailadres bij',
        updateEmail: 'E-mailadres bijwerken',
        schoolMailAsDefault: ({contactMethodsRoute}: ContactMethodsRouteParams) =>
            `Voordat je verdergaat, zorg er alsjeblieft voor dat je je school-e-mailadres instelt als je standaard contactmethode. Dit kun je doen via Instellingen > Profiel > <a href="${contactMethodsRoute}">Contactmethoden</a>.`,
        error: {
            enterPhoneEmail: 'Voer een geldig e-mailadres of telefoonnummer in',
            enterEmail: 'Voer een e-mailadres in',
            enterValidEmail: 'Voer een geldig e-mailadres in',
            tryDifferentEmail: 'Probeer een ander e-mailadres',
        },
    },
    cardTransactions: {
        notActivated: 'Niet geactiveerd',
        outOfPocket: 'Uit eigen zak uitgegeven kosten',
        companySpend: 'Uitgaven van het bedrijf',
    },
    distance: {
        addStop: 'Stop toevoegen',
        deleteWaypoint: 'Wegpunt verwijderen',
        deleteWaypointConfirmation: 'Weet je zeker dat je dit routepunt wilt verwijderen?',
        address: 'Adres',
        waypointDescription: {
            start: 'Start',
            stop: 'Stop',
        },
        mapPending: {
            title: 'Mapping in behandeling',
            subtitle: 'De kaart wordt gegenereerd zodra je weer online bent',
            onlineSubtitle: 'Een ogenblik terwijl we de kaart instellen',
            errorTitle: 'Kaartfout',
            errorSubtitle: 'Er is een fout opgetreden bij het laden van de kaart. Probeer het opnieuw.',
        },
        error: {
            selectSuggestedAddress: 'Selecteer een voorgesteld adres of gebruik je huidige locatie',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Rapportkaart kwijt of beschadigd',
        nextButtonLabel: 'Volgende',
        reasonTitle: 'Waarom heeft u een nieuwe kaart nodig?',
        cardDamaged: 'Mijn kaart is beschadigd',
        cardLostOrStolen: 'Mijn kaart is verloren of gestolen',
        confirmAddressTitle: 'Bevestig het postadres voor je nieuwe kaart.',
        cardDamagedInfo: 'Uw nieuwe kaart wordt binnen 2-3 werkdagen bezorgd. Uw huidige kaart blijft werken totdat u uw nieuwe kaart activeert.',
        cardLostOrStolenInfo: 'Je huidige kaart wordt permanent gedeactiveerd zodra je bestelling is geplaatst. De meeste kaarten komen binnen enkele werkdagen aan.',
        address: 'Adres',
        deactivateCardButton: 'Kaart deactiveren',
        shipNewCardButton: 'Nieuwe kaart verzenden',
        addressError: 'Adres is verplicht',
        reasonError: 'Reden is verplicht',
        successTitle: 'Uw nieuwe kaart is onderweg!',
        successDescription: 'Je moet deze activeren zodra hij over een paar werkdagen is aangekomen. In de tussentijd kun je een virtuele kaart gebruiken.',
    },
    eReceipt: {
        guaranteed: 'Gegarandeerde eReceipt',
        transactionDate: 'Transactiedatum',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Start een chat, <success><strong>verwijs een vriend</strong></success>.',
            header: 'Begin een chat, verwijs een vriend',
            body: 'Wil je dat je vrienden Expensify ook gebruiken? Begin gewoon een chat met hen en wij zorgen voor de rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Dien een uitgave in, <success><strong>verwijs je team door</strong></success>.',
            header: 'Dien een uitgave in, verwijs je team door',
            body: 'Wil je dat je team Expensify ook gebruikt? Dien gewoon een uitgave bij hen in en wij zorgen voor de rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Een vriend doorverwijzen',
            body: 'Wil je dat je vrienden ook Expensify gebruiken? Chat gewoon met ze, betaal of splits een uitgave en wij regelen de rest. Of deel gewoon je uitnodigingslink!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Een vriend doorverwijzen',
            header: 'Een vriend doorverwijzen',
            body: 'Wil je dat je vrienden ook Expensify gebruiken? Chat gewoon met ze, betaal of splits een uitgave en wij regelen de rest. Of deel gewoon je uitnodigingslink!',
        },
        copyReferralLink: 'Uitnodigingslink kopiëren',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chat met je set-upspecialist in <a href="${href}">${adminReportName}</a> voor hulp`,
        default: `Stuur een bericht naar <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> voor hulp bij de installatie`,
    },
    violations: {
        allTagLevelsRequired: 'Alle tags vereist',
        autoReportedRejectedExpense: 'Deze uitgave is afgekeurd.',
        billableExpense: 'Factureerbaar niet langer geldig',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Bon nodig${formattedLimit ? `meer dan ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Categorie niet langer geldig',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `${surcharge}% omrekeningskosten toegepast`,
        customUnitOutOfPolicy: 'Tarief niet geldig voor deze werkruimte',
        duplicatedTransaction: 'Mogelijk duplicaat',
        fieldRequired: 'Rapportvelden zijn verplicht',
        futureDate: 'Toekomstige datum niet toegestaan',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Opgeslagen met een opslag van ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Datum ouder dan ${maxAge} dagen`,
        missingCategory: 'Categorie ontbreekt',
        missingComment: 'Beschrijving vereist voor geselecteerde categorie',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Ontbreekt ${tagName ?? 'Label'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Bedrag wijkt af van berekende afstand';
                case 'card':
                    return 'Bedrag is hoger dan kaarttransactie';
                default:
                    if (displayPercentVariance) {
                        return `Bedrag is ${displayPercentVariance}% hoger dan het gescande bonnetje`;
                    }
                    return 'Bedrag groter dan gescande bon';
            }
        },
        modifiedDate: 'Datum wijkt af van gescande bon',
        nonExpensiworksExpense: 'Niet-Expensiworks-uitgave',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Uitgave overschrijdt de automatische goedkeuringslimiet van ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Bedrag boven de limiet van ${formattedLimit}/persoon per categorie`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Bedrag boven limiet van ${formattedLimit}/persoon`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Bedrag boven ${formattedLimit}/reislimiet`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Bedrag boven limiet van ${formattedLimit}/persoon`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Bedrag boven de dagelijkse limiet van ${formattedLimit}/persoon voor deze categorie`,
        receiptNotSmartScanned: 'Bon- en onkostendetails handmatig toegevoegd.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Bon vereist boven de categorielimiet van ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Bon nodig boven ${formattedLimit}`;
            }
            if (category) {
                return `Bon nodig boven categorielimiet`;
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
                        return `volwassenenentertainment`;
                    case 'hotelIncidentals':
                        return `overige hotelkosten`;
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
                return 'Kan bon niet automatisch koppelen vanwege verbroken bankverbinding';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Bankverbinding verbroken. <a href="${companyCardPageURL}">Opnieuw verbinden om de bon te koppelen</a>`
                    : 'Bankverbinding verbroken. Vraag een beheerder om deze opnieuw te verbinden om de bon te koppelen.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Vraag ${member} om deze als contant te markeren of wacht 7 dagen en probeer het opnieuw` : 'In afwachting van koppeling met kaarttransactie.';
            }
            return '';
        },
        brokenConnection530Error: 'Bon ligt in wacht wegens verbroken bankverbinding',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Bon in behandeling vanwege een verbroken bankverbinding. Los dit op in <a href="${workspaceCompanyCardRoute}">Bedrijfspassen</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Bon voor verwerking in behandeling vanwege een verbroken bankverbinding. Vraag een workspacebeheerder om dit op te lossen.',
        markAsCashToIgnore: 'Markeer als contant om te negeren en een betaling aan te vragen.',
        smartscanFailed: ({canEdit = true}) => `Scannen van bon is mislukt.${canEdit ? 'Voer gegevens handmatig in.' : ''}`,
        receiptGeneratedWithAI: 'Mogelijke door AI gegenereerde bon',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Label'} ontbreekt`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Label'} niet langer geldig`,
        taxAmountChanged: 'Belastingbedrag is gewijzigd',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Belasting'} niet langer geldig`,
        taxRateChanged: 'Belastingtarief is gewijzigd',
        taxRequired: 'Ontbrekend belastingtarief',
        none: 'Geen',
        taxCodeToKeep: 'Kies welke belastingcode je wilt behouden',
        tagToKeep: 'Kies welke tag je wilt behouden',
        isTransactionReimbursable: 'Kies of de transactie declarabel is',
        merchantToKeep: 'Kies welke handelaar je wilt behouden',
        descriptionToKeep: 'Kies welke beschrijving je wilt behouden',
        categoryToKeep: 'Kies welke categorie je wilt behouden',
        isTransactionBillable: 'Kies of de transactie factureerbaar is',
        keepThisOne: 'Deze behouden',
        confirmDetails: `Bevestig de gegevens die je bewaart`,
        confirmDuplicatesInfo: `De duplicaten die je niet behoudt, worden bewaard zodat de indiener ze kan verwijderen.`,
        hold: 'Deze uitgave is on hold gezet',
        resolvedDuplicates: 'dubbel exemplaar opgelost',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} is verplicht`,
        reportContainsExpensesWithViolations: 'Rapport bevat uitgaven met overtredingen.',
    },
    violationDismissal: {
        rter: {
            manual: 'heeft deze bon als contant gemarkeerd',
        },
        duplicatedTransaction: {
            manual: 'dubbel exemplaar opgelost',
        },
    },
    videoPlayer: {
        play: 'Afspelen',
        pause: 'Pauzeren',
        fullscreen: 'Volledig scherm',
        playbackSpeed: 'Afspeelsnelheid',
        expand: 'Uitvouwen',
        mute: 'Dempen',
        unmute: 'Dempen opheffen',
        normal: 'Normaal',
    },
    exitSurvey: {
        header: 'Voordat je gaat',
        reasonPage: {
            title: 'Vertel ons alstublieft waarom u vertrekt',
            subtitle: 'Voordat je verdergaat, vertel ons alsjeblieft waarom je wilt overschakelen naar Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ik heb een functie nodig die alleen beschikbaar is in Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Ik begrijp niet hoe ik New Expensify moet gebruiken.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Ik begrijp hoe ik New Expensify moet gebruiken, maar ik geef de voorkeur aan Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Welke functie heeft u nodig die nog niet beschikbaar is in New Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Wat probeer je te doen?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Waarom geeft u de voorkeur aan Expensify Classic?',
        },
        responsePlaceholder: 'Uw reactie',
        thankYou: 'Bedankt voor de feedback!',
        thankYouSubtitle: 'Uw antwoorden helpen ons een beter product te bouwen om dingen gedaan te krijgen. Hartelijk dank!',
        goToExpensifyClassic: 'Overschakelen naar Expensify Classic',
        offlineTitle: 'Het lijkt erop dat je hier vastzit...',
        offline:
            'Het lijkt erop dat je offline bent. Helaas werkt Expensify Classic niet offline, maar New Expensify wel. Als je liever Expensify Classic gebruikt, probeer het dan opnieuw wanneer je een internetverbinding hebt.',
        quickTip: 'Snelle tip...',
        quickTipSubTitle: 'Je kunt direct naar Expensify Classic gaan door expensify.com te bezoeken. Voeg het toe aan je favorieten voor een snelle snelkoppeling!',
        bookACall: 'Een gesprek boeken',
        bookACallTitle: 'Wil je met een productmanager spreken?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Direct chatten op uitgaven en rapporten',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Mogelijkheid om alles op mobiel te doen',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Reizen en declareren met de snelheid van chat',
        },
        bookACallTextTop: 'Als je overschakelt naar Expensify Classic, loop je het volgende mis:',
        bookACallTextBottom:
            'We zouden graag een gesprek met je hebben om te begrijpen waarom. Je kunt een gesprek boeken met een van onze senior productmanagers om je behoeften te bespreken.',
        takeMeToExpensifyClassic: 'Breng me naar Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Er is een fout opgetreden bij het laden van meer berichten',
        tryAgain: 'Probeer het opnieuw',
    },
    systemMessage: {
        mergedWithCashTransaction: 'heeft een bon aan deze transactie gekoppeld',
    },
    subscription: {
        authenticatePaymentCard: 'Betaalpas verifiëren',
        mobileReducedFunctionalityMessage: 'Je kunt je abonnement niet wijzigen in de mobiele app.',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Proefperiode: nog ${numOfDays} ${numOfDays === 1 ? 'dag' : 'dagen'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Je betaalgegevens zijn verouderd',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `Werk uw betaalkaart bij vóór ${date} om al uw favoriete functies te kunnen blijven gebruiken.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Je betaling kon niet worden verwerkt',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Uw afschrijving van ${date} van ${purchaseAmountOwed} kon niet worden verwerkt. Voeg een betaalkaart toe om het openstaande bedrag te vereffenen.`
                        : 'Voeg een betaalkaart toe om het openstaande bedrag te voldoen.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Je betaalgegevens zijn verouderd',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `Uw betaling is achterstallig. Betaal uw factuur vóór ${date} om onderbreking van de service te voorkomen.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Je betaalgegevens zijn verouderd',
                subtitle: 'Uw betaling is vervallen. Betaal alstublieft uw factuur.',
            },
            billingDisputePending: {
                title: 'Je kaart kon niet worden belast',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Je hebt de betwiste ${amountOwed}-afschrijving op de kaart die eindigt op ${cardEnding}. Je account wordt geblokkeerd totdat het geschil met je bank is opgelost.`,
            },
            cardAuthenticationRequired: {
                title: 'Je betaalkaart is nog niet volledig geverifieerd.',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) => `Voltooi het verificatieproces om je betaalkaart met eindigend op ${cardEnding} te activeren.`,
            },
            insufficientFunds: {
                title: 'Je kaart kon niet worden belast',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `Uw betaalkaart is geweigerd wegens onvoldoende saldo. Probeer het opnieuw of voeg een nieuwe betaalkaart toe om uw openstaande saldo van ${amountOwed} te voldoen.`,
            },
            cardExpired: {
                title: 'Je kaart kon niet worden belast',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `Je betaalkaart is verlopen. Voeg een nieuwe betaalkaart toe om je openstaande saldo van ${amountOwed} te vereffenen.`,
            },
            cardExpireSoon: {
                title: 'Je kaart verloopt binnenkort',
                subtitle:
                    'Je betaalkaart verloopt aan het einde van deze maand. Klik op het menu met de drie puntjes hieronder om deze te vernieuwen en al je favoriete functies te blijven gebruiken.',
            },
            retryBillingSuccess: {
                title: 'Gelukt!',
                subtitle: 'Je kaart is succesvol belast.',
            },
            retryBillingError: {
                title: 'Je kaart kon niet worden belast',
                subtitle:
                    'Voordat je het opnieuw probeert, neem eerst rechtstreeks contact op met je bank om kosten van Expensify goed te keuren en eventuele blokkades te laten verwijderen. Probeer anders een andere betaalkaart toe te voegen.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Je hebt de betwiste ${amountOwed}-afschrijving op de kaart die eindigt op ${cardEnding}. Je account wordt geblokkeerd totdat het geschil met je bank is opgelost.`,
            preTrial: {
                title: 'Begin een gratis proefversie',
                subtitle: 'Als volgende stap kun je <a href="#">je instelchecklist voltooien</a>, zodat je team met declareren kan beginnen.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Proefperiode: nog ${numOfDays} ${numOfDays === 1 ? 'dag' : 'dagen'}!`,
                subtitle: 'Voeg een betaalkaart toe om al je favoriete functies te blijven gebruiken.',
            },
            trialEnded: {
                title: 'Je gratis proefperiode is verlopen',
                subtitle: 'Voeg een betaalkaart toe om al je favoriete functies te blijven gebruiken.',
            },
            earlyDiscount: {
                claimOffer: 'Aanbieding claimen',
                subscriptionPageTitle: ({discountType}: EarlyDiscountTitleParams) =>
                    `<strong>${discountType}% korting op je eerste jaar!</strong> Voeg gewoon een betaalkaart toe en start een jaarlijks abonnement.`,
                onboardingChatTitle: ({discountType}: EarlyDiscountTitleParams) => `Aanbieding voor beperkte tijd: ${discountType}% korting op je eerste jaar!`,
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Claim binnen ${days > 0 ? `${days}d :` : ''}${hours}u : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Betaling',
            subtitle: 'Voeg een kaart toe om je Expensify-abonnement te betalen.',
            addCardButton: 'Betalingskaart toevoegen',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Uw volgende betalingsdatum is ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Kaart eindigend op ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Naam: ${name}, Vervaldatum: ${expiration}, Valuta: ${currency}`,
            changeCard: 'Betaalkaart wijzigen',
            changeCurrency: 'Betalingsvaluta wijzigen',
            cardNotFound: 'Geen betaalkaart toegevoegd',
            retryPaymentButton: 'Betaling opnieuw proberen',
            authenticatePayment: 'Betaling verifiëren',
            requestRefund: 'Terugbetaling aanvragen',
            requestRefundModal: {
                full: 'Een terugbetaling krijgen is eenvoudig: downgrade je account vóór je volgende factureringsdatum en je ontvangt een terugbetaling. <br /> <br /> Let op: als je je account downgrade, worden je workspace(s) verwijderd. Deze actie kan niet ongedaan worden gemaakt, maar je kunt altijd een nieuwe workspace aanmaken als je van gedachten verandert.',
                confirm: 'Werkruimte(n) verwijderen en downgraden',
            },
            viewPaymentHistory: 'Betalingsgeschiedenis bekijken',
        },
        yourPlan: {
            title: 'Uw abonnement',
            exploreAllPlans: 'Alle abonnementen bekijken',
            customPricing: 'Aangepaste prijzen',
            asLowAs: ({price}: YourPlanPriceValueParams) => `al vanaf ${price} per actieve gebruiker/maand`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} per lid/maand`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} per lid per maand`,
            perMemberMonth: 'per lid/maand',
            collect: {
                title: 'Verzamelen',
                description: 'Het kleine zakelijke abonnement dat je uitgaven, reizen en chat biedt.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                benefit1: 'Bonnetjesscans',
                benefit2: 'Vergoedingen',
                benefit3: 'Beheer van bedrijfskaarten',
                benefit4: 'Declaratie- en reisgoedkeuringen',
                benefit5: 'Reisboeking en -regels',
                benefit6: 'QuickBooks/Xero-integraties',
                benefit7: 'Chatten over uitgaven, rapporten en rooms',
                benefit8: 'AI- en menselijke ondersteuning',
            },
            control: {
                title: 'Controle',
                description: 'Onkosten, reizen en chat voor grotere bedrijven.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                benefit1: 'Alles in het Collect-abonnement',
                benefit2: 'Meerlagige goedkeuringsworkflows',
                benefit3: 'Aangepaste onkostregels',
                benefit4: 'ERP-integraties (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'HR-integraties (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Aangepaste inzichten en rapportage',
                benefit8: 'Budgettering',
            },
            thisIsYourCurrentPlan: 'Dit is je huidige abonnement',
            downgrade: 'Downgraden naar Collect',
            upgrade: 'Upgrade naar Control',
            addMembers: 'Leden toevoegen',
            saveWithExpensifyTitle: 'Bespaar met de Expensify Card',
            saveWithExpensifyDescription: 'Gebruik onze besparingscalculator om te zien hoe de cashback van de Expensify Card je Expensify-factuur kan verlagen.',
            saveWithExpensifyButton: 'Meer informatie',
        },
        compareModal: {
            comparePlans: 'Vergelijk abonnementen',
            subtitle: `<muted-text>Ontgrendel de functies die je nodig hebt met het abonnement dat bij je past. <a href="${CONST.PRICING}">Bekijk onze prijsinformatiepagina</a> voor een volledig overzicht van de functies van elk abonnement.</muted-text>`,
        },
        details: {
            title: 'Abonnementsgegevens',
            annual: 'Jaarabonnement',
            taxExempt: 'Belastingvrijstelling aanvragen',
            taxExemptEnabled: 'Vrijgesteld van belasting',
            taxExemptStatus: 'Belastingvrije status',
            payPerUse: 'Betalen per gebruik',
            subscriptionSize: 'Abonnementsgrootte',
            headsUp:
                'Let op: als je je abonnementsomvang nu niet instelt, stellen wij deze automatisch in op het aantal actieve leden in je eerste maand. Je bent dan verplicht om de komende 12 maanden minimaal voor dit aantal leden te betalen. Je kunt je abonnementsomvang op elk moment vergroten, maar je kunt deze niet verkleinen totdat je abonnement is afgelopen.',
            zeroCommitment: 'Geen verplichtingen tegen het kortingstarief voor het jaarlijkse abonnement',
        },
        subscriptionSize: {
            title: 'Abonnementsgrootte',
            yourSize: 'De grootte van je abonnement is het aantal open plaatsen dat in een bepaalde maand kan worden ingevuld door elk actief lid.',
            eachMonth:
                'Elke maand dekt je abonnement tot het hierboven ingestelde aantal actieve leden. Telkens wanneer je de omvang van je abonnement vergroot, start je een nieuw 12-maandenabonnement met die nieuwe omvang.',
            note: 'Opmerking: Een actief lid is iedereen die onkostengegevens die gekoppeld zijn aan de werkruimte van uw bedrijf heeft gemaakt, bewerkt, ingediend, goedgekeurd, terugbetaald of geëxporteerd.',
            confirmDetails: 'Bevestig de details van uw nieuwe jaarlijkse abonnement:',
            subscriptionSize: 'Abonnementsgrootte',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} actieve leden/maand`,
            subscriptionRenews: 'Abonnement wordt verlengd',
            youCantDowngrade: 'Je kunt je abonnement niet downgraden tijdens je jaarlijkse abonnementsperiode.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Je hebt al een jaarlijkse abonnementsomvang van ${size} actieve leden per maand vastgelegd tot ${date}. Je kunt op ${date} overstappen op een abonnement op basis van gebruik door automatisch verlengen uit te schakelen.`,
            error: {
                size: 'Voer een geldige abonnementsomvang in',
                sameSize: 'Voer een getal in dat verschilt van de huidige grootte van uw abonnement',
            },
        },
        paymentCard: {
            addPaymentCard: 'Betalingskaart toevoegen',
            enterPaymentCardDetails: 'Voer uw betaalkaartgegevens in',
            security: 'Expensify is PCI-DSS-conform, gebruikt versleuteling op bankniveau en maakt gebruik van redundante infrastructuur om uw gegevens te beschermen.',
            learnMoreAboutSecurity: 'Lees meer over onze beveiliging.',
        },
        subscriptionSettings: {
            title: 'Abonnementsinstellingen',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Abonnementstype: ${subscriptionType}, Abonnementsgrootte: ${subscriptionSize}, Automatisch verlengen: ${autoRenew}, Jaarlijks aantal plaatsen automatisch verhogen: ${autoIncrease}`,
            none: 'geen',
            on: 'aan',
            off: 'uit',
            annual: 'Jaarlijks',
            autoRenew: 'Automatisch verlengen',
            autoIncrease: 'Automatisch jaarlijkse seats verhogen',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Bespaar tot ${amountWithCurrency}/maand per actief lid`,
            automaticallyIncrease:
                'Verhoog automatisch het aantal jaarlijkse licenties om actieve leden die je abonnementsomvang overschrijden te accommoderen. Let op: hierdoor wordt de einddatum van je jaarlijkse abonnement verlengd.',
            disableAutoRenew: 'Automatisch verlengen uitschakelen',
            helpUsImprove: 'Help ons Expensify verbeteren',
            whatsMainReason: 'Wat is de belangrijkste reden dat je de automatische verlenging uitschakelt?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Wordt verlengd op ${date}.`,
            pricingConfiguration: 'De prijs is afhankelijk van de configuratie. Kies voor de laagste prijs een jaarlijks abonnement en vraag de Expensify Card aan.',
            learnMore: {
                part1: 'Meer informatie op onze',
                pricingPage: 'Prijzenpagina',
                part2: 'of chat met ons team in jouw',
                adminsRoom: '#admins-ruimte.',
            },
            estimatedPrice: 'Geschatte prijs',
            changesBasedOn: 'Dit verandert op basis van je Expensify Card-gebruik en de abonnementsopties hieronder.',
        },
        requestEarlyCancellation: {
            title: 'Vroegtijdige annulering aanvragen',
            subtitle: 'Wat is de belangrijkste reden dat je om vroegtijdige opzegging vraagt?',
            subscriptionCanceled: {
                title: 'Abonnement opgezegd',
                subtitle: 'Je abonnement voor een jaar is opgezegd.',
                info: 'Als je je werkruimte(n) op basis van betalen per gebruik wilt blijven gebruiken, ben je helemaal klaar.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Als je toekomstige activiteit en kosten wilt voorkomen, moet je je <a href="${workspacesListRoute}">werkruimte(s) verwijderen</a>. Houd er rekening mee dat wanneer je je werkruimte(s) verwijdert, je wordt gefactureerd voor alle openstaande activiteiten die in de huidige kalendermaand hebben plaatsgevonden.`,
            },
            requestSubmitted: {
                title: 'Aanvraag ingediend',
                subtitle:
                    'Bedankt dat je ons laat weten dat je je abonnement wilt opzeggen. We beoordelen je verzoek en nemen binnenkort contact met je op via je chat met <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Door om vroegtijdige beëindiging te verzoeken, erken en ga ik ermee akkoord dat Expensify op grond van de Expensify <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Servicevoorwaarden</a> of een andere toepasselijke dienstenovereenkomst tussen mij en Expensify niet verplicht is om een dergelijk verzoek in te willigen en dat Expensify volledige discretie behoudt met betrekking tot het al dan niet inwilligen van een dergelijk verzoek.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Functionaliteit moet worden verbeterd',
        tooExpensive: 'Te duur',
        inadequateSupport: 'Onvoldoende klantenondersteuning',
        businessClosing: 'Bedrijf sluit, krimpt in of is overgenomen',
        additionalInfoTitle: 'Naar welke software stapt u over en waarom?',
        additionalInfoInputLabel: 'Uw reactie',
    },
    roomChangeLog: {
        updateRoomDescription: 'stel de kamerbeschrijving in op:',
        clearRoomDescription: 'heeft de kamerbeschrijving gewist',
        changedRoomAvatar: 'heeft de kamerpictogram gewijzigd',
        removedRoomAvatar: 'heeft de kameravatar verwijderd',
    },
    delegate: {
        switchAccount: 'Van account wisselen:',
        copilotDelegatedAccess: 'Copilot: Gedelegeerde toegang',
        copilotDelegatedAccessDescription: 'Andere leden toestaan om toegang te krijgen tot je account.',
        addCopilot: 'Copilot toevoegen',
        membersCanAccessYourAccount: 'Deze leden hebben toegang tot je account:',
        youCanAccessTheseAccounts: 'U kunt deze accounts openen via de accountswitcher:',
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
        confirmCopilot: 'Bevestig hieronder je copilot.',
        accessLevelDescription: 'Kies hieronder een toegangsniveau. Zowel Volledige als Beperkte toegang geven copilots de mogelijkheid om alle gesprekken en uitgaven te bekijken.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Sta een ander lid toe om alle acties in jouw account uit te voeren, namens jou. Omvat chatten, indienen, goedkeuren, betalingen, het bijwerken van instellingen en meer.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Sta een ander lid toe om de meeste acties in je account namens jou uit te voeren. Uitsluitend goedkeuringen, betalingen, afwijzingen en blokkeringen.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copilot verwijderen',
        removeCopilotConfirmation: 'Weet je zeker dat je deze copilot wilt verwijderen?',
        changeAccessLevel: 'Toegangsniveau wijzigen',
        makeSureItIsYou: 'Laten we bevestigen dat jij het bent',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Voer de magische code in die naar ${contactMethod} is verzonden om een copiloot toe te voegen. Deze zou binnen een of twee minuten moeten aankomen.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Voer de magische code in die naar ${contactMethod} is gestuurd om je copilot bij te werken.`,
        notAllowed: 'Niet zo snel...',
        noAccessMessage: dedent(`
            Als copiloot heb je geen toegang tot
            deze pagina. Sorry!
        `),
        notAllowedMessage: ({accountOwnerEmail}: AccountOwnerParams) =>
            `Als <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilot</a> voor ${accountOwnerEmail} heb je geen toestemming om deze actie uit te voeren. Sorry!`,
        copilotAccess: 'Copilot-toegang',
    },
    debug: {
        debug: 'Debuggen',
        details: 'Details',
        JSON: 'JSON',
        reportActions: 'Acties',
        reportActionPreview: 'Voorbeeld',
        nothingToPreview: 'Niets om te bekijken',
        editJson: 'JSON bewerken:',
        preview: 'Voorbeeld:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `${propertyName} ontbreekt`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Ongeldige eigenschap: ${propertyName} - Verwacht: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Ongeldige waarde - Verwacht: ${expectedValues}`,
        missingValue: 'Ontbrekende waarde',
        createReportAction: 'Actie Rapport Maken',
        reportAction: 'Actierapport',
        report: 'Rapport',
        transaction: 'Transactie',
        violations: 'Overtredingen',
        transactionViolation: 'Transactieovertreding',
        hint: 'Gegevenswijzigingen worden niet naar de backend verzonden',
        textFields: 'Tekstvelden',
        numberFields: 'Numerieke velden',
        booleanFields: 'Booleaanse velden',
        constantFields: 'Constante velden',
        dateTimeFields: 'Datum-/tijdvelden',
        date: 'Datum',
        time: 'Tijd',
        none: 'Geen',
        visibleInLHN: 'Zichtbaar in LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'waar',
        false: 'Onwaar',
        viewReport: 'Rapport bekijken',
        viewTransaction: 'Transactie bekijken',
        createTransactionViolation: 'Transactieovertreding maken',
        reasonVisibleInLHN: {
            hasDraftComment: 'Heeft conceptreactie',
            hasGBR: 'Heeft GBR',
            hasRBR: 'Heeft RBR',
            pinnedByUser: 'Vastgezet door lid',
            hasIOUViolations: 'Heeft IOU-overtredingen',
            hasAddWorkspaceRoomErrors: 'Heeft fouten bij het toevoegen van werkruimtekamers',
            isUnread: 'Is ongelezen (focusmodus)',
            isArchived: 'Is gearchiveerd (meest recente modus)',
            isSelfDM: 'Is zelf-DM',
            isFocused: 'Is tijdelijk gefocust',
        },
        reasonGBR: {
            hasJoinRequest: 'Heeft join-aanvraag (beheerderruimte)',
            isUnreadWithMention: 'Ongelezen met vermelding',
            isWaitingForAssigneeToCompleteAction: 'Wacht totdat de toegewezene de actie voltooit',
            hasChildReportAwaitingAction: 'Heeft kindrapport dat op actie wacht',
            hasMissingInvoiceBankAccount: 'Heeft ontbrekende bankrekening voor factuur',
            hasUnresolvedCardFraudAlert: 'Heeft onopgeloste creditcardfraude-melding',
        },
        reasonRBR: {
            hasErrors: 'Bevat fouten in rapport- of rapportactiedata',
            hasViolations: 'Heeft overtredingen',
            hasTransactionThreadViolations: 'Heeft transactie-threadschendingen',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Er wacht een rapport op actie',
            theresAReportWithErrors: 'Er is een rapport met fouten',
            theresAWorkspaceWithCustomUnitsErrors: 'Er is een workspace met fouten in aangepaste eenheden',
            theresAProblemWithAWorkspaceMember: 'Er is een probleem met een werkruimtelid',
            theresAProblemWithAWorkspaceQBOExport: 'Er was een probleem met een exportinstelling voor een workspaceverbinding.',
            theresAProblemWithAContactMethod: 'Er is een probleem met een contactmethode',
            aContactMethodRequiresVerification: 'Een contactmethode vereist verificatie',
            theresAProblemWithAPaymentMethod: 'Er is een probleem met een betaalmethode',
            theresAProblemWithAWorkspace: 'Er is een probleem met een werkruimte',
            theresAProblemWithYourReimbursementAccount: 'Er is een probleem met je terugbetalingsrekening',
            theresABillingProblemWithYourSubscription: 'Er is een factureringsprobleem met je abonnement',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Je abonnement is succesvol verlengd',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Er is een probleem opgetreden tijdens het synchroniseren van een werkruimteverbinding',
            theresAProblemWithYourWallet: 'Er is een probleem met je wallet',
            theresAProblemWithYourWalletTerms: 'Er is een probleem met de voorwaarden van je wallet',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Maak een proefrit',
    },
    migratedUserWelcomeModal: {
        title: 'Welkom bij New Expensify!',
        subtitle: 'Het bevat alles wat je leuk vindt aan onze klassieke ervaring, met een heleboel upgrades om je leven nog makkelijker te maken:',
        confirmText: 'Laten we gaan!',
        helpText: 'Probeer demo van 2 minuten',
        features: {
            search: 'Krachtigere zoekfunctie op mobiel, web en desktop',
            concierge: 'Ingebouwde Concierge-AI om je onkosten te automatiseren',
            chat: 'Chat over elke uitgave om vragen snel op te lossen',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>Begin <strong>hier!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Hernoem hier je opgeslagen zoekopdrachten</strong>!</tooltip>',
        accountSwitcher: '<tooltip>Open hier uw <strong>Copilot-accounts</strong></tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Scan onze testbon</strong> om te zien hoe het werkt!</tooltip>',
            manager: '<tooltip>Kies onze <strong>testmanager</strong> om het uit te proberen!</tooltip>',
            confirmation: '<tooltip>Dien nu <strong>je onkostendeclaratie in</strong> en zie de\nmagie gebeuren!</tooltip>',
            tryItOut: 'Probeer het uit',
        },
        outstandingFilter: '<tooltip>Filter voor uitgaven\ndie <strong>goedgekeurd moeten worden</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Stuur deze bon om\n<strong>de proefrit te voltooien!</strong></tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Wijzigingen verwerpen?',
        body: 'Weet je zeker dat je de wijzigingen die je hebt aangebracht wilt weggooien?',
        confirmText: 'Wijzigingen negeren',
    },
    scheduledCall: {
        book: {
            title: 'Gesprek inplannen',
            description: 'Zoek een tijd die voor jou uitkomt.',
            slots: ({date}: {date: string}) => `<muted-text>Beschikbare tijden voor <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Gesprek bevestigen',
            description: 'Controle of de onderstaande gegevens er goed uitzien. Zodra je het gesprek bevestigt, sturen we een uitnodiging met meer informatie.',
            setupSpecialist: 'Uw installatiespecialist',
            meetingLength: 'Vergaderingsduur',
            dateTime: 'Datum en tijd',
            minutes: '30 minuten',
        },
        callScheduled: 'Oproep gepland',
    },
    autoSubmitModal: {
        title: 'Alles duidelijk en verstuurd!',
        description: 'Alle waarschuwingen en overtredingen zijn verwijderd, dus:',
        submittedExpensesTitle: 'Deze declaraties zijn ingediend',
        submittedExpensesDescription: 'Deze uitgaven zijn naar je fiatteur gestuurd, maar kunnen nog worden bewerkt totdat ze zijn goedgekeurd.',
        pendingExpensesTitle: 'In afwachting zijnde uitgaven zijn verplaatst',
        pendingExpensesDescription: 'Eventuele openstaande kaartuitgaven zijn verplaatst naar een apart rapport totdat ze worden geboekt.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Maak een proefrit van 2 minuten',
        },
        modal: {
            title: 'Neem ons mee voor een proefrit',
            description: 'Maak een korte producttour om snel helemaal bij te zijn.',
            confirmText: 'Proefrit starten',
            helpText: 'Overslaan',
            employee: {
                description:
                    '<muted-text>Geef je team <strong>3 gratis maanden Expensify!</strong> Vul hieronder het e-mailadres van je baas in en stuur hen een proefdeclaratie.</muted-text>',
                email: 'Voer het e-mailadres van je baas in',
                error: 'Dat lid is eigenaar van een workspace, voer een nieuw lid in om te testen.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Je bent Expensify momenteel aan het uitproberen',
            readyForTheRealThing: 'Klaar voor het echte werk?',
            getStarted: 'Aan de slag',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) => `# ${name} heeft je uitgenodigd om Expensify uit te proberen
Hoi! Ik heb zojuist *3 maanden gratis* geregeld zodat we Expensify kunnen uitproberen, de snelste manier om onkosten te doen.

Hier is een *testbon* om je te laten zien hoe het werkt:`,
    },
    export: {
        basicExport: 'Basisexport',
        reportLevelExport: 'Alle gegevens - rapportniveau',
        expenseLevelExport: 'Alle gegevens - uitgaveniveau',
        exportInProgress: 'Bezig met exporteren',
        conciergeWillSend: 'Concierge stuurt je het bestand binnenkort.',
    },
    domain: {
        notVerified: 'Niet geverifieerd',
        retry: 'Opnieuw proberen',
        verifyDomain: {
            title: 'Domein verifiëren',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Voordat je verdergaat, verifieer dat je eigenaar bent van <strong>${domainName}</strong> door de DNS-instellingen bij te werken.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Ga naar je DNS-provider en open de DNS-instellingen voor <strong>${domainName}</strong>.`,
            addTXTRecord: 'Voeg het volgende TXT-record toe:',
            saveChanges: 'Sla de wijzigingen op en keer hier terug om je domein te verifiëren.',
            youMayNeedToConsult: `Mogelijk moet u contact opnemen met de IT-afdeling van uw organisatie om de verificatie te voltooien. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Meer informatie</a>.`,
            warning: 'Na verificatie ontvangen alle Expensify-leden op uw domein een e-mail waarin staat dat hun account wordt beheerd onder uw domein.',
            codeFetchError: 'Verificatiecode kan niet worden opgehaald',
            genericError: 'We konden uw domein niet verifiëren. Probeer het opnieuw en neem contact op met Concierge als het probleem zich blijft voordoen.',
        },
        domainVerified: {
            title: 'Domein geverifieerd',
            header: 'Woehoe! Uw domein is geverifieerd',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Het domein <strong>${domainName}</strong> is succesvol geverifieerd en je kunt nu SAML en andere beveiligingsfuncties instellen.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML Single Sign-On (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> is een beveiligingsfunctie die je meer controle geeft over hoe leden met <strong>${domainName}</strong>-e‑mails inloggen bij Expensify. Om dit in te schakelen, moet je jezelf verifiëren als een bevoegde bedrijfsbeheerder.</muted-text>`,
            fasterAndEasierLogin: 'Sneller en eenvoudiger inloggen',
            moreSecurityAndControl: 'Meer beveiliging en controle',
            onePasswordForAnything: 'Eén wachtwoord voor alles',
        },
        goToDomain: 'Ga naar domein',
        samlLogin: {
            title: 'SAML-login',
            subtitle: `<muted-text>Configureer ledenaanmelding met <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO).</a></muted-text>`,
            enableSamlLogin: 'SAML-login inschakelen',
            allowMembers: 'Leden toestaan in te loggen met SAML.',
            requireSamlLogin: 'SAML-login vereisen',
            anyMemberWillBeRequired: 'Elk lid dat is aangemeld met een andere methode, moet opnieuw worden geauthenticeerd met SAML.',
            enableError: 'Kon de SAML-inschakelinstelling niet bijwerken',
            requireError: 'Kon SAML-vereiste-instelling niet bijwerken',
        },
        samlConfigurationDetails: {
            title: 'SAML-configuratiedetails',
            subtitle: 'Gebruik deze gegevens om SAML in te stellen.',
            identityProviderMetaData: 'Identity Provider-metagegevens',
            entityID: 'Entiteits-ID',
            nameIDFormat: 'Naam-ID-indeling',
            loginUrl: 'Login-URL',
            acsUrl: 'ACS-URL (Assertion Consumer Service)',
            logoutUrl: 'URL voor uitloggen',
            sloUrl: 'SLO-URL (Single Logout)',
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
