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
        count: 'Aantal',
        cancel: 'Annuleren',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: 'Sluiten',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: 'Doorgaan',
        unshare: 'Delen opheffen',
        yes: 'Ja',
        no: 'Nee',
        // @context Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.
        ok: 'OK',
        notNow: 'Nu niet',
        noThanks: 'Nee, dank je',
        learnMore: 'Meer informatie',
        buttonConfirm: 'Begrepen',
        name: 'Naam',
        attachment: 'Bijlage',
        attachments: 'Bijlagen',
        center: 'Midden',
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
        // @context Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.
        goBack: 'Ga terug',
        create: 'Aanmaken',
        add: 'Toevoegen',
        resend: 'Opnieuw verzenden',
        save: 'Opslaan',
        select: 'Selecteer',
        deselect: 'Deselecteren',
        // @context Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.
        selectMultiple: 'Meerdere selecteren',
        saveChanges: 'Wijzigingen opslaan',
        submit: 'Verzenden',
        // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        submitted: 'Ingediend',
        rotate: 'Draaien',
        zoom: 'Zoom',
        password: 'Wachtwoord',
        magicCode: 'Magische code',
        digits: 'cijfers',
        twoFactorCode: 'Twee­factorcode',
        workspaces: 'Werkruimtes',
        inbox: 'Postvak',
        // @context Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”
        success: 'Geslaagd',
        group: 'Groep',
        profile: 'Profiel',
        referral: 'Verwijzing',
        payments: 'Betalingen',
        approvals: 'Goedkeuringen',
        wallet: 'Wallet',
        preferences: 'Voorkeuren',
        view: 'Bekijken',
        review: (reviewParams?: ReviewParams) => `Beoordelen${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Niet',
        signIn: 'Inloggen',
        signInWithGoogle: 'Inloggen met Google',
        signInWithApple: 'Inloggen met Apple',
        signInWith: 'Inloggen met',
        continue: 'Doorgaan',
        firstName: 'Voornaam',
        lastName: 'Achternaam',
        scanning: 'Scannen',
        analyzing: 'Bezig met analyseren...',
        addCardTermsOfService: 'Expensify-servicevoorwaarden',
        perPerson: 'per persoon',
        phone: 'Telefoon',
        phoneNumber: 'Telefoonnummer',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'E‑mail',
        and: 'en',
        or: 'of',
        details: 'Details',
        privacy: 'Privacy',
        privacyPolicy: 'Privacybeleid',
        hidden: 'Verborgen',
        visible: 'Zichtbaar',
        delete: 'Verwijderen',
        // @context UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.
        archived: 'gearchiveerd',
        contacts: 'Contacten',
        recents: 'Recent',
        close: 'Sluiten',
        comment: 'Opmerking',
        download: 'Downloaden',
        downloading: 'Downloaden',
        // @context Indicates that a file is currently being uploaded (sent to the server), not downloaded.
        uploading: 'Bezig met uploaden',
        // @context as a verb, not a noun
        pin: 'Vastmaken',
        unPin: 'Losmaken',
        back: 'Terug',
        saveAndContinue: 'Opslaan en doorgaan',
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
        ssnFull9: 'Volledig 9 cijfers van het BSN',
        addressLine: (lineNumber: number) => `Adresregel ${lineNumber}`,
        personalAddress: 'Persoonlijk adres',
        companyAddress: 'Bedrijfsadres',
        noPO: 'Geen postbus- of doorstuuradressen, alstublieft.',
        city: 'Stad',
        state: 'Status',
        streetAddress: 'Straatadres',
        stateOrProvince: 'Staat / Provincie',
        country: 'Land',
        zip: 'Postcode',
        zipPostCode: 'Postcode / ZIP',
        whatThis: 'Wat is dit?',
        iAcceptThe: 'Ik ga akkoord met de',
        acceptTermsAndPrivacy: `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Servicevoorwaarden</a> en het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacybeleid</a>`,
        acceptTermsAndConditions: `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">algemene voorwaarden</a>`,
        acceptTermsOfService: `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Servicevoorwaarden</a>`,
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
        converted: 'Omgezet',
        error: {
            invalidAmount: 'Ongeldig bedrag',
            acceptTerms: 'U moet de Servicevoorwaarden accepteren om verder te gaan',
            phoneNumber: `Voer een volledig telefoonnummer in
(bijv. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Dit veld is verplicht',
            requestModified: 'Dit verzoek wordt bewerkt door een ander lid',
            characterLimitExceedCounter: (length: number, limit: number) => `Tekenlimiet overschreden (${length}/${limit})`,
            dateInvalid: 'Selecteer een geldige datum',
            invalidDateShouldBeFuture: 'Kies vandaag of een datum in de toekomst',
            invalidTimeShouldBeFuture: 'Kies een tijd minstens één minuut later',
            invalidCharacter: 'Ongeldig teken',
            enterMerchant: 'Voer een bedrijfsnaam in',
            enterAmount: 'Voer een bedrag in',
            missingMerchantName: 'Ontbrekende naam handelaar',
            missingAmount: 'Ontbrekend bedrag',
            missingDate: 'Ontbrekende datum',
            enterDate: 'Voer een datum in',
            invalidTimeRange: 'Voer een tijd in met het 12-uurs formaat (bijv. 2:30 PM)',
            pleaseCompleteForm: 'Vul het bovenstaande formulier in om door te gaan',
            pleaseSelectOne: 'Selecteer hierboven een optie',
            invalidRateError: 'Voer een geldig tarief in',
            lowRateError: 'Tarief moet groter zijn dan 0',
            email: 'Voer een geldig e-mailadres in',
            login: 'Er is een fout opgetreden bij het inloggen. Probeer het opnieuw.',
        },
        comma: 'komma',
        semicolon: 'puntkomma',
        please: 'Alstublieft',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'neem contact met ons op',
        pleaseEnterEmailOrPhoneNumber: 'Voer een e-mailadres of telefoonnummer in',
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: 'corrigeer de fouten',
        inTheFormBeforeContinuing: 'in het formulier voordat je verdergaat',
        confirm: 'Bevestigen',
        reset: 'Opnieuw instellen',
        // @context Status or button indicating that an action or process has been completed. Should reflect completion.
        done: 'Klaar',
        more: 'Meer',
        debitCard: 'Pinpas',
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
        leaveThread: 'Thread verlaten',
        you: 'Jij',
        // @context Refers to the current user in the UI. Should follow capitalization rules for labels/pronouns in the target language.
        me: 'ik',
        youAfterPreposition: 'u',
        your: 'je',
        conciergeHelp: 'Neem contact op met Concierge voor hulp.',
        youAppearToBeOffline: 'Het lijkt erop dat je offline bent.',
        thisFeatureRequiresInternet: 'Deze functie vereist een actieve internetverbinding.',
        attachmentWillBeAvailableOnceBackOnline: 'Bijlage wordt beschikbaar zodra je weer online bent.',
        errorOccurredWhileTryingToPlayVideo: 'Er is een fout opgetreden tijdens het afspelen van deze video.',
        areYouSure: 'Weet je het zeker?',
        verify: 'Verifiëren',
        yesContinue: 'Ja, ga door',
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
        mi: 'mijl',
        km: 'kilometer',
        copied: 'Gekopieerd!',
        someone: 'Iemand',
        total: 'Totaal',
        edit: 'Bewerken',
        letsDoThis: `Laten we dit doen!`,
        letsStart: `Laten we beginnen`,
        showMore: 'Meer weergeven',
        showLess: 'Minder weergeven',
        merchant: 'Handelaar',
        change: 'Wijzigen',
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
        // @context Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.
        miles: 'mijl',
        kilometer: 'kilometer',
        kilometers: 'kilometer',
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
        showing: 'Weergave',
        of: 'van',
        default: 'Standaard',
        update: 'Updaten',
        member: 'Lid',
        auditor: 'Accountant',
        role: 'Rol',
        currency: 'Valuta',
        groupCurrency: 'Groepsvaluta',
        rate: 'Beoordeling',
        emptyLHN: {
            title: 'Yes! Helemaal bij.',
            subtitleText1: 'Zoek een chat met de',
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
        draft: 'Conceptversie',
        finished: 'Voltooid',
        upgrade: 'Upgraden',
        downgradeWorkspace: 'Werkruimte downgraden',
        companyID: 'Bedrijfs-ID',
        userID: 'Gebruikers-ID',
        disable: 'Uitschakelen',
        export: 'Exporteren',
        initialValue: 'Beginwaarde',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: 'Huidige datum',
        value: 'Waarde',
        downloadFailedTitle: 'Download mislukt',
        downloadFailedDescription: 'Je download kon niet worden voltooid. Probeer het later opnieuw.',
        filterLogs: 'Logboeken filteren',
        network: 'Netwerk',
        reportID: 'Rapport-ID',
        longReportID: 'Lang rapport-ID',
        withdrawalID: 'Opname-ID',
        bankAccounts: 'Bankrekeningen',
        chooseFile: 'Kies bestand',
        chooseFiles: 'Bestanden kiezen',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: 'Laat hier vallen',
        // @context Instruction for dropping one or more files into an upload area.
        dropMessage: 'Zet je bestand hier neer',
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
        links: 'Links',
        // @context Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).
        day: 'dag',
        days: 'dagen',
        rename: 'Naam wijzigen',
        address: 'Adres',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Overslaan',
        chatWithAccountManager: (accountManagerDisplayName: string) => `Iets specifieks nodig? Chat met je accountmanager, ${accountManagerDisplayName}.`,
        chatNow: 'Nu chatten',
        workEmail: 'Werkmail',
        destination: 'Bestemming',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: 'Subtarief',
        perDiem: 'Dagvergoeding',
        validate: 'Valideren',
        downloadAsPDF: 'Downloaden als pdf',
        downloadAsCSV: 'Downloaden als CSV',
        help: 'Help',
        expenseReport: 'Declaratie',
        expenseReports: 'Declaraties',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'Tarief buiten beleid',
        leaveWorkspace: 'Werkruimte verlaten',
        leaveWorkspaceConfirmation: 'Als je deze workspace verlaat, kun je geen onkostendeclaraties meer indienen voor deze workspace.',
        leaveWorkspaceConfirmationAuditor: 'Als je deze workspace verlaat, kun je de rapporten en instellingen niet meer bekijken.',
        leaveWorkspaceConfirmationAdmin: 'Als je deze workspace verlaat, kun je de instellingen niet meer beheren.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Als je deze workspace verlaat, word je in het goedkeuringsproces vervangen door ${workspaceOwner}, de eigenaar van de workspace.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Als je deze workspace verlaat, word je als voorkeurs-exporteur vervangen door ${workspaceOwner}, de eigenaar van de workspace.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Als je deze workspace verlaat, word je als technisch contact vervangen door ${workspaceOwner}, de eigenaar van de workspace.`,
        leaveWorkspaceReimburser:
            'Je kunt deze werkruimte niet verlaten als terugbetaler. Stel eerst een nieuwe terugbetaler in via Werkruimtes > Betalingen uitvoeren of volgen en probeer het daarna opnieuw.',
        reimbursable: 'Vergoedbaar',
        editYourProfile: 'Bewerk je profiel',
        comments: 'Opmerkingen',
        sharedIn: 'Gedeeld in',
        unreported: 'Niet gerapporteerd',
        explore: 'Verkennen',
        insights: 'Inzichten',
        todo: 'To-do',
        invoice: 'Factuur',
        expense: 'Declaratie',
        chat: 'Chat',
        task: 'Taak',
        trip: 'Reis',
        apply: 'Toepassen',
        status: 'Status',
        on: 'Aan',
        before: 'Vooraf',
        after: 'Na',
        reschedule: 'Opnieuw plannen',
        general: 'Algemeen',
        workspacesTabTitle: 'Werkruimtes',
        headsUp: 'Let op!',
        submitTo: 'Indienen bij',
        forwardTo: 'Doorsturen naar',
        merge: 'Samenvoegen',
        none: 'Geen',
        unstableInternetConnection: 'Onstabiele internetverbinding. Controleer je netwerk en probeer het opnieuw.',
        enableGlobalReimbursements: 'Wereldwijde terugbetalingen inschakelen',
        purchaseAmount: 'Aankoopbedrag',
        originalAmount: 'Oorspronkelijk bedrag',
        frequency: 'Frequentie',
        link: 'Link',
        pinned: 'Vastgezet',
        read: 'Lezen',
        copyToClipboard: 'Kopiëren naar klembord',
        thisIsTakingLongerThanExpected: 'Dit duurt langer dan verwacht...',
        domains: 'Domeinen',
        actionRequired: 'Actie vereist',
        duplicate: 'Dupliceren',
        duplicated: 'Gedupliceerd',
        duplicateExpense: 'Dubbele uitgave',
        exchangeRate: 'Wisselkoers',
        reimbursableTotal: 'Totaal vergoedbaar',
        nonReimbursableTotal: 'Niet-vergoedbaar totaal',
    },
    supportalNoAccess: {
        title: 'Niet zo snel',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `Je bent niet gemachtigd om deze actie uit te voeren wanneer support is ingelogd (opdracht: ${command ?? ''}). Als je vindt dat Success deze actie moet kunnen uitvoeren, start dan een gesprek in Slack.`,
    },
    lockedAccount: {
        title: 'Geblokkeerde account',
        description: 'Je kunt deze actie niet voltooien omdat deze rekening is vergrendeld. Neem contact op met concierge@expensify.com voor de volgende stappen.',
    },
    location: {
        useCurrent: 'Huidige locatie gebruiken',
        notFound: 'We konden je locatie niet vinden. Probeer het opnieuw of voer handmatig een adres in.',
        permissionDenied: 'Het lijkt erop dat je locatie-toegang hebt geweigerd.',
        please: 'Alstublieft',
        allowPermission: 'sta locatietoegang in via instellingen',
        tryAgain: 'en probeer het opnieuw.',
    },
    contact: {
        importContacts: 'Contacten importeren',
        importContactsTitle: 'Importeer je contacten',
        importContactsText: 'Importeer contacten van je telefoon zodat je favoriete mensen altijd maar één tik van je verwijderd zijn.',
        importContactsExplanation: 'zodat je favoriete mensen altijd maar één tik van je verwijderd zijn.',
        importContactsNativeText: 'Nog één laatste stap! Geef ons groen licht om je contacten te importeren.',
    },
    anonymousReportFooter: {
        logoTagline: 'Doe mee aan de discussie.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Camera-toegang',
        expensifyDoesNotHaveAccessToCamera: 'Expensify kan geen foto’s maken zonder toegang tot je camera. Tik op instellingen om de machtigingen bij te werken.',
        attachmentError: 'Bijlagefout',
        errorWhileSelectingAttachment: 'Er is een fout opgetreden bij het selecteren van een bijlage. Probeer het opnieuw.',
        errorWhileSelectingCorruptedAttachment: 'Er is een fout opgetreden bij het selecteren van een beschadigde bijlage. Probeer een ander bestand.',
        takePhoto: 'Foto maken',
        chooseFromGallery: 'Kies uit galerij',
        chooseDocument: 'Kies bestand',
        attachmentTooLarge: 'Bijlage is te groot',
        sizeExceeded: 'De bijlage is groter dan de limiet van 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `De bijlage is groter dan de limiet van ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Bijlage is te klein',
        sizeNotMet: 'Bijlagegrootte moet groter zijn dan 240 bytes',
        wrongFileType: 'Ongeldig bestandstype',
        notAllowedExtension: 'Dit bestandstype is niet toegestaan. Probeer een ander bestandstype.',
        folderNotAllowedMessage: 'Een map uploaden is niet toegestaan. Probeer een ander bestand.',
        protectedPDFNotSupported: 'Met wachtwoord beveiligde pdf wordt niet ondersteund',
        attachmentImageResized: 'Deze afbeelding is verkleind voor de voorbeeldweergave. Download voor de volledige resolutie.',
        attachmentImageTooLarge: 'Deze afbeelding is te groot om te bekijken voordat je deze uploadt.',
        tooManyFiles: (fileLimit: number) => `Je kunt maximaal ${fileLimit} bestanden tegelijk uploaden.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Bestanden zijn groter dan ${maxUploadSizeInMB} MB. Probeer het opnieuw.`,
        someFilesCantBeUploaded: 'Sommige bestanden kunnen niet worden geüpload',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Bestanden mogen niet groter zijn dan ${maxUploadSizeInMB} MB. Grotere bestanden worden niet geüpload.`,
        maxFileLimitExceeded: 'Je kunt maximaal 30 bonnetjes tegelijk uploaden. Extra bonnetjes worden niet geüpload.',
        unsupportedFileType: (fileType: string) => `${fileType}-bestanden worden niet ondersteund. Alleen ondersteunde bestandstypen worden geüpload.`,
        learnMoreAboutSupportedFiles: 'Meer informatie over ondersteunde indelingen.',
        passwordProtected: 'Met een wachtwoord beveiligde pdf’s worden niet ondersteund. Alleen ondersteunde bestanden worden geüpload.',
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
        noExtensionFoundForMimeType: 'Geen extensie gevonden voor mimetype',
        problemGettingImageYouPasted: 'Er is een probleem opgetreden bij het ophalen van de afbeelding die je hebt geplakt',
        commentExceededMaxLength: (formattedMaxLength: string) => `De maximale opmerkingenlengte is ${formattedMaxLength} tekens.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `De maximale lengte van de taaknaam is ${formattedMaxLength} tekens.`,
    },
    baseUpdateAppModal: {
        updateApp: 'App bijwerken',
        updatePrompt: 'Er is een nieuwe versie van deze app beschikbaar.\nUpdate nu of start de app later opnieuw om de nieuwste wijzigingen te downloaden.',
    },
    deeplinkWrapper: {
        launching: 'Expensify wordt gestart',
        expired: 'Je sessie is verlopen.',
        signIn: 'Meld u opnieuw aan.',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: 'Biometrische test',
            authenticationSuccessful: 'Authenticatie geslaagd',
            successfullyAuthenticatedUsing: ({authType}: MultifactorAuthenticationTranslationParams) => `Je bent succesvol geauthenticeerd met ${authType}.`,
            troubleshootBiometricsStatus: ({registered}: MultifactorAuthenticationTranslationParams) => `Biometrie (${registered ? 'Geregistreerd' : 'Niet geregistreerd'})`,
            yourAttemptWasUnsuccessful: 'Je inlogpoging is mislukt.',
            youCouldNotBeAuthenticated: 'Je kon niet worden geverifieerd',
            areYouSureToReject: 'Weet je het zeker? De verificatiepoging wordt geweigerd als je dit scherm sluit.',
            rejectAuthentication: 'Verificatie weigeren',
            test: 'Test',
            biometricsAuthentication: 'Biometrische verificatie',
        },
        pleaseEnableInSystemSettings: {
            start: 'Schakel gezichts-/vingerafdrukverificatie in of stel een toegangscode voor je apparaat in in je',
            link: 'systeeminstellingen',
            end: '.',
        },
        oops: 'Oeps, er is iets misgegaan',
        looksLikeYouRanOutOfTime: 'Het lijkt erop dat je tijd om is! Probeer het alsjeblieft opnieuw bij de verkoper.',
        youRanOutOfTime: 'Je tijd is opgelopen',
        letsVerifyItsYou: 'Laten we verifiëren dat jij het bent',
        verifyYourself: {
            biometrics: 'Verifieer jezelf met je gezicht of vingerafdruk',
        },
        enableQuickVerification: {
            biometrics: 'Schakel snelle, veilige verificatie in met je gezicht of je vingerafdruk. Geen wachtwoorden of codes nodig.',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abracadabra,
            je bent ingelogd!
        `),
        successfulSignInDescription: 'Ga terug naar je oorspronkelijke tabblad om door te gaan.',
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
        signInHere: 'meld je hier gewoon aan',
        expiredCodeTitle: 'Magische code verlopen',
        expiredCodeDescription: 'Ga terug naar het oorspronkelijke apparaat en vraag een nieuwe code aan',
        successfulNewCodeRequest: 'Code aangevraagd. Controleer je apparaat.',
        tfaRequiredTitle: dedent(`
            Verificatie in twee stappen
            vereist
        `),
        tfaRequiredDescription: dedent(`
            Voer de code voor tweeledige verificatie in
            op de plek waar je probeert je aan te melden.
        `),
        requestOneHere: 'vraag er hier een aan.',
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
        description: 'Je bedrijf heeft een aangepast goedkeuringsproces in deze workspace. Voer deze actie uit in Expensify Classic',
        goToExpensifyClassic: 'Overschakelen naar Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Dien een uitgave in, verwijs je team',
            subtitleText: 'Wil je dat je team Expensify ook gaat gebruiken? Dien gewoon een uitgave bij hen in en wij zorgen voor de rest.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Bel een gesprek boeken',
    },
    hello: 'Hallo',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Begin hieronder.',
        anotherLoginPageIsOpen: 'Er is nog een inlogpagina geopend.',
        anotherLoginPageIsOpenExplanation: 'Je hebt de inlogpagina in een apart tabblad geopend. Log alsjeblieft in via dat tabblad.',
        welcome: 'Welkom!',
        welcomeWithoutExclamation: 'Welkom',
        phrase2: 'Geld spreekt. En nu chat en betalingen op één plek staan, is het ook nog eens makkelijk.',
        phrase3: 'Je betalingen komen net zo snel bij je aan als jij je punt kunt maken.',
        enterPassword: 'Voer uw wachtwoord in',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, het is altijd leuk om een nieuw gezicht hier te zien!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Voer de magische code in die naar ${login} is gestuurd. Deze zou binnen een of twee minuten moeten aankomen.`,
    },
    login: {
        hero: {
            header: 'Reizen en declareren, met de snelheid van chat',
            body: 'Welkom bij de volgende generatie van Expensify, waar je reizen en uitgaven sneller verlopen met hulp van contextuele chat in realtime.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Ga door met inloggen met single sign-on:',
        orContinueWithMagicCode: 'Je kunt ook inloggen met een magische code',
        useSingleSignOn: 'Eenmalige aanmelding gebruiken',
        useMagicCode: 'Magische code gebruiken',
        launching: 'Opstarten...',
        oneMoment: 'Een moment geduld terwijl we je doorsturen naar het single sign-onportaal van je bedrijf.',
    },
    reportActionCompose: {
        dropToUpload: 'Laat hier vallen om te uploaden',
        sendAttachment: 'Bijlage verzenden',
        addAttachment: 'Bijlage toevoegen',
        writeSomething: 'Schrijf iets...',
        blockedFromConcierge: 'Communicatie is verboden',
        fileUploadFailed: 'Upload mislukt. Bestand wordt niet ondersteund.',
        localTime: ({user, time}: LocalTimeParams) => `Het is ${time} voor ${user}`,
        edited: '(bewerkt)',
        emoji: 'Emoji',
        collapse: 'Samenvouwen',
        expand: 'Uitklappen',
    },
    reportActionContextMenu: {
        copyMessage: 'Bericht kopiëren',
        copied: 'Gekopieerd!',
        copyLink: 'Link kopiëren',
        copyURLToClipboard: 'URL naar klembord kopiëren',
        copyEmailToClipboard: 'E-mail kopiëren naar klembord',
        markAsUnread: 'Markeren als ongelezen',
        markAsRead: 'Markeren als gelezen',
        editAction: ({action}: EditActionParams) => `Bewerken ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'uitgave' : 'opmerking'}`,
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
            return `Weet je zeker dat je deze ${type} wilt verwijderen?`;
        },
        onlyVisible: 'Alleen zichtbaar voor',
        replyInThread: 'Reageer in thread',
        joinThread: 'Deelnemen aan thread',
        leaveThread: 'Thread verlaten',
        copyOnyxData: 'Onyx-gegevens kopiëren',
        flagAsOffensive: 'Markeren als aanstootgevend',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Reactie toevoegen',
        reactedWith: 'reageerde met',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `Je hebt het feest in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> gemist, er is hier niets te zien.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `Deze chat is met alle Expensify-leden op het domein <strong>${domainRoom}</strong>. Gebruik hem om met collega’s te chatten, tips te delen en vragen te stellen.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Deze chat is met de beheerder van <strong>${workspaceName}</strong>. Gebruik hem om te chatten over de inrichting van de werkruimte en meer.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `Deze chat is met iedereen in <strong>${workspaceName}</strong>. Gebruik hem voor de belangrijkste aankondigingen.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Deze chatruimte is voor alles wat met <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> te maken heeft.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Deze chat is voor facturen tussen <strong>${invoicePayer}</strong> en <strong>${invoiceReceiver}</strong>. Gebruik de knop + om een factuur te verzenden.`,
        beginningOfChatHistory: (users: string) => `Deze chat is met ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `Hier dient <strong>${submitterDisplayName}</strong> onkosten in bij <strong>${workspaceName}</strong>. Gebruik gewoon de +-knop.`,
        beginningOfChatHistorySelfDM: 'Dit is je persoonlijke ruimte. Gebruik die voor notities, taken, concepten en herinneringen.',
        beginningOfChatHistorySystemDM: 'Welkom! Laten we je instellen.',
        chatWithAccountManager: 'Chat hier met je accountmanager',
        sayHello: 'Zeg hallo!',
        yourSpace: 'Jouw ruimte',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Welkom bij ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Gebruik de +-knop om een uitgave te ${additionalText}.`,
        askConcierge: 'Stel vragen en krijg 24/7 ondersteuning in realtime.',
        conciergeSupport: '24/7 ondersteuning',
        create: 'maken',
        iouTypes: {
            pay: 'betalen',
            split: 'splitsen',
            submit: 'indienen',
            track: 'volgen',
            invoice: 'factuur',
        },
    },
    adminOnlyCanPost: 'Alleen beheerders kunnen berichten sturen in deze ruimte.',
    reportAction: {
        asCopilot: 'als copiloot voor',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `heeft dit rapport gemaakt om alle uitgaven van <a href="${reportUrl}">${reportName}</a> te bewaren die niet konden worden ingediend met de door jou gekozen frequentie`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `heeft dit rapport gemaakt voor alle vastgehouden uitgaven vanuit <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Iedereen in dit gesprek informeren',
    },
    newMessages: 'Nieuwe berichten',
    latestMessages: 'Nieuwste berichten',
    youHaveBeenBanned: 'Let op: je bent verbannen uit de chat in dit kanaal.',
    reportTypingIndicator: {
        isTyping: 'is aan het typen...',
        areTyping: 'zijn aan het typen...',
        multipleMembers: 'Meerdere leden',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Deze chatruimte is gearchiveerd.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Deze chat is niet meer actief omdat ${displayName} hun account heeft gesloten.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Deze chat is niet meer actief omdat ${oldDisplayName} hun account heeft samengevoegd met ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Deze chat is niet meer actief omdat <strong>je</strong> geen lid meer bent van de ${policyName}-werkruimte.`
                : `Deze chat is niet meer actief omdat ${displayName} geen lid meer is van de ${policyName}-werkruimte.`,
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
        fabNewChatExplained: 'Actiemenu openen',
        fabScanReceiptExplained: 'Bon scannen',
        chatPinned: 'Chat vastgezet',
        draftedMessage: 'Conceptbericht opgesteld',
        listOfChatMessages: 'Lijst met chatberichten',
        listOfChats: 'Lijst met chats',
        saveTheWorld: 'Red de wereld',
        tooltip: 'Begin hier!',
        redirectToExpensifyClassicModal: {
            title: 'Binnenkort beschikbaar',
            description: 'We zijn nog een paar onderdelen van New Expensify aan het verfijnen om ze op jouw specifieke setup af te stemmen. Ga in de tussentijd naar Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Abonnement',
        domains: 'Domeinen',
    },
    tabSelector: {
        chat: 'Chat',
        room: 'Ruimte',
        distance: 'Afstand',
        manual: 'Handleiding',
        scan: 'Scannen',
        map: 'Kaart',
        gps: 'GPS',
        odometer: 'Kilometerstand',
    },
    spreadsheet: {
        upload: 'Een spreadsheet uploaden',
        import: 'Spreadsheet importeren',
        dragAndDrop: '<muted-link>Sleep je spreadsheet hierheen of kies hieronder een bestand. Ondersteunde indelingen: .csv, .txt, .xls en .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Sleep je spreadsheet hierheen, of kies hieronder een bestand. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Meer informatie</a> over ondersteunde bestandsindelingen.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Selecteer een spreadsheetbestand om te importeren. Ondersteunde indelingen: .csv, .txt, .xls en .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Selecteer een spreadsheetbestand om te importeren. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Meer informatie</a> over ondersteunde bestandsindelingen.</muted-link>`,
        fileContainsHeader: 'Bestand bevat kolomkoppen',
        column: (name: string) => `Kolom ${name}`,
        fieldNotMapped: (fieldName: string) => `Oeps! Een verplicht veld („${fieldName}”) is niet toegewezen. Controleer dit en probeer het opnieuw.`,
        singleFieldMultipleColumns: (fieldName: string) => `Oeps! Je hebt één veld ("${fieldName}") aan meerdere kolommen gekoppeld. Controleer dit en probeer het opnieuw.`,
        emptyMappedField: (fieldName: string) => `Oeps! Het veld ("${fieldName}") bevat een of meer lege waarden. Controleer dit en probeer het opnieuw.`,
        importSuccessfulTitle: 'Import geslaagd',
        importCategoriesSuccessfulDescription: ({categories}: {categories: number}) => (categories > 1 ? `${categories} categorieën zijn toegevoegd.` : '1 categorie is toegevoegd.'),
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
            if (!added && !updated) {
                return 'Er zijn geen leden toegevoegd of bijgewerkt.';
            }
            if (added && updated) {
                return `${added} lid${added > 1 ? 's' : ''} toegevoegd, ${updated} lid${updated > 1 ? 's' : ''} bijgewerkt.`;
            }
            if (updated) {
                return updated > 1 ? `${updated} leden zijn bijgewerkt.` : '1 lid is bijgewerkt.';
            }
            return added > 1 ? `${added} leden zijn toegevoegd.` : 'Er is 1 lid toegevoegd.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `${tags} tags zijn toegevoegd.` : '1 tag is toegevoegd.'),
        importMultiLevelTagsSuccessfulDescription: 'Tags op meerdere niveaus zijn toegevoegd.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `${rates} dagvergoedingen zijn toegevoegd.` : '1 dagvergoedingstarief is toegevoegd.'),
        importFailedTitle: 'Import mislukt',
        importFailedDescription: 'Zorg ervoor dat alle velden correct zijn ingevuld en probeer het opnieuw. Blijft het probleem zich voordoen, neem dan contact op met Concierge.',
        importDescription: 'Kies welke velden je wilt koppelen vanuit je spreadsheet door op het dropdownmenu naast elke geïmporteerde kolom hieronder te klikken.',
        sizeNotMet: 'Bestandsgrootte moet groter zijn dan 0 bytes',
        invalidFileMessage:
            'Het bestand dat je hebt geüpload is leeg of bevat ongeldige gegevens. Zorg ervoor dat het bestand correct is opgemaakt en de benodigde informatie bevat voordat je het opnieuw uploadt.',
        importSpreadsheetLibraryError: 'Laden van spreadsheetmodule mislukt. Controleer je internetverbinding en probeer het opnieuw.',
        importSpreadsheet: 'Spreadsheet importeren',
        downloadCSV: 'CSV downloaden',
        importMemberConfirmation: () => ({
            one: `Bevestig hieronder de gegevens voor een nieuw werkruimteldeelnemer die als onderdeel van deze upload wordt toegevoegd. Bestaande deelnemers ontvangen geen rolupdates of uitnodigingsberichten.`,
            other: (count: number) =>
                `Bevestig hieronder de gegevens voor de ${count} nieuwe werkruimteleden die als onderdeel van deze upload worden toegevoegd. Bestaande leden ontvangen geen rolupdates of uitnodigingsberichten.`,
        }),
    },
    receipt: {
        upload: 'Bon uploaden',
        uploadMultiple: 'Bonnen uploaden',
        desktopSubtitleSingle: `of sleep het hierheenof sleep het hierheen`,
        desktopSubtitleMultiple: `of sleep ze hier naartoe`,
        alternativeMethodsTitle: 'Andere manieren om bonnen toe te voegen:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">Download de app</a> om te scannen vanaf je telefoon</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Stuur bonnen door naar <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Voeg je nummer toe</a> om bonnen te sms’en naar ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Stuur bonnen via sms naar ${phoneNumber} (alleen Amerikaanse nummers)</label-text>`,
        takePhoto: 'Maak een foto',
        cameraAccess: 'Cameratoegang is vereist om foto’s van bonnen te maken.',
        deniedCameraAccess: `Cameratoegang is nog steeds niet verleend, volg alsjeblieft <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">deze instructies</a>.`,
        cameraErrorTitle: 'Camera-fout',
        cameraErrorMessage: 'Er is een fout opgetreden bij het maken van een foto. Probeer het opnieuw.',
        locationAccessTitle: 'Locatietoegang toestaan',
        locationAccessMessage: 'Locatietoegang helpt ons je tijdzone en valuta overal waar je bent nauwkeurig te houden.',
        locationErrorTitle: 'Locatietoegang toestaan',
        locationErrorMessage: 'Locatietoegang helpt ons je tijdzone en valuta overal waar je bent nauwkeurig te houden.',
        allowLocationFromSetting: `Locatietoegang helpt ons je tijdzone en valuta overal waar je bent nauwkeurig te houden. Sta locatietoegang toe in de machtigingsinstellingen van je apparaat.`,
        dropTitle: 'Laat het los',
        dropMessage: 'Zet je bestand hier neer',
        flash: 'flits',
        multiScan: 'meerscannen',
        shutter: 'sluiter',
        gallery: 'galerij',
        deleteReceipt: 'Bon verwijderen',
        deleteConfirmation: 'Weet je zeker dat je deze bon wilt verwijderen?',
        addReceipt: 'Bon toevoegen',
        scanFailed: 'De bon kon niet worden gescand omdat er een handelaar, datum of bedrag ontbreekt.',
    },
    quickAction: {
        scanReceipt: 'Bon scannen',
        recordDistance: 'Afstand bijhouden',
        requestMoney: 'Onkost aanmaken',
        perDiem: 'Dagvergoeding aanmaken',
        splitBill: 'Uitgave splitsen',
        splitScan: 'Bon delen',
        splitDistance: 'Afstand splitsen',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Betaal ${name ?? 'iemand'}`,
        assignTask: 'Taak toewijzen',
        header: 'Snelkoppeling',
        noLongerHaveReportAccess: 'Je hebt geen toegang meer tot je vorige snelkoppelingsbestemming. Kies hieronder een nieuwe.',
        updateDestination: 'Bestemming bijwerken',
        createReport: 'Rapport maken',
    },
    iou: {
        amount: 'Bedrag',
        percent: 'Percentage',
        date: 'Datum',
        taxAmount: 'Belastingbedrag',
        taxRate: 'Belastingtarief',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `${formattedAmount} goedkeuren` : 'Goedkeuren'),
        approved: 'Goedgekeurd',
        cash: 'Contant',
        card: 'Kaart',
        original: 'Origineel',
        split: 'Splitsen',
        splitExpense: 'Uitgave splitsen',
        splitDates: 'Data gesplitst per datum',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} tot ${endDate} (${count} dagen)`,
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} van ${merchant}`,
        splitByPercentage: 'Splitsen op percentage',
        splitByDate: 'Splitsen per datum',
        addSplit: 'Splits toevoegen',
        makeSplitsEven: 'Verdeel bedragen gelijk',
        editSplits: 'Splits bewerken',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Het totale bedrag is ${amount} hoger dan de oorspronkelijke uitgave.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Het totale bedrag is ${amount} lager dan de oorspronkelijke uitgave.`,
        splitExpenseZeroAmount: 'Voer een geldig bedrag in voordat je doorgaat.',
        splitExpenseOneMoreSplit: 'Geen splitsingen toegevoegd. Voeg er minstens één toe om op te slaan.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `${amount} voor ${merchant} bewerken`,
        removeSplit: 'Splits verwijderen',
        splitExpenseCannotBeEditedModalTitle: 'Deze uitgave kan niet worden bewerkt',
        splitExpenseCannotBeEditedModalDescription: 'Goedgekeurde of betaalde uitgaven kunnen niet worden bewerkt',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Betaal ${name ?? 'iemand'}`,
        expense: 'Declaratie',
        categorize: 'Categoriseren',
        share: 'Delen',
        participants: 'Deelnemers',
        createExpense: 'Onkost aanmaken',
        trackDistance: 'Afstand bijhouden',
        createExpenses: (expensesNumber: number) => `Maak ${expensesNumber} declaraties`,
        removeExpense: 'Uitgave verwijderen',
        removeThisExpense: 'Verwijder deze uitgave',
        removeExpenseConfirmation: 'Weet je zeker dat je deze bon wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
        addExpense: 'Uitgave toevoegen',
        chooseRecipient: 'Kies ontvanger',
        createExpenseWithAmount: ({amount}: {amount: string}) => `${amount}-uitgave aanmaken`,
        confirmDetails: 'Details bevestigen',
        pay: 'Betalen',
        cancelPayment: 'Betaling annuleren',
        cancelPaymentConfirmation: 'Weet je zeker dat je deze betaling wilt annuleren?',
        viewDetails: 'Details bekijken',
        pending: 'In behandeling',
        canceled: 'Geannuleerd',
        posted: 'Gepost',
        deleteReceipt: 'Bon verwijderen',
        findExpense: 'Declaratie zoeken',
        deletedTransaction: (amount: string, merchant: string) => `heeft een uitgave verwijderd (${amount} voor ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `heeft een uitgave verplaatst${reportName ? `van ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `heeft deze uitgave verplaatst${reportName ? `naar <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `heeft deze uitgave verplaatst${reportName ? `van <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `heeft deze uitgave verplaatst naar je <a href="${reportUrl}">persoonlijke ruimte</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `heeft dit rapport verplaatst naar de werkruimte <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `heeft dit <a href="${movedReportUrl}">rapport</a> verplaatst naar de <a href="${newParentReportUrl}">${toPolicyName}</a>-werkruimte`;
        },
        pendingMatchWithCreditCard: 'Bon gepend voor koppeling aan kaarttransactie',
        pendingMatch: 'Geen overeenkomst in behandeling',
        pendingMatchWithCreditCardDescription: 'Bon wordt nog gekoppeld aan kaarttransactie. Markeer als contant om te annuleren.',
        markAsCash: 'Markeren als contant',
        routePending: 'Routeren in behandeling...',
        receiptScanning: () => ({
            one: 'Bon wordt gescand...',
            other: 'Bonnetjes worden gescand...',
        }),
        scanMultipleReceipts: 'Meerdere bonnen scannen',
        scanMultipleReceiptsDescription: "Maak in één keer foto's van al je bonnetjes en bevestig daarna zelf de details, of laat ons het voor je doen.",
        receiptScanInProgress: 'Bonnetjescan wordt uitgevoerd',
        receiptScanInProgressDescription: 'Bonnetjescan bezig. Kom later terug of voer de gegevens nu in.',
        removeFromReport: 'Van rapport verwijderen',
        moveToPersonalSpace: 'Verplaats uitgaven naar je persoonlijke ruimte',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Mogelijke dubbele uitgaven gevonden. Controleer de dubbelen om indienen mogelijk te maken.'
                : 'Mogelijke dubbele onkosten gedetecteerd. Controleer de duplicaten om goedkeuring in te schakelen.',
        receiptIssuesFound: () => ({
            one: 'Probleem gevonden',
            other: 'Problemen gevonden',
        }),
        fieldPending: 'In behandeling...',
        defaultRate: 'Standaardtarief',
        receiptMissingDetails: 'Bon ontbreekt gegevens',
        missingAmount: 'Ontbrekend bedrag',
        missingMerchant: 'Ontbrekende handelaar',
        receiptStatusTitle: 'Scannen…',
        receiptStatusText: 'Alleen jij kunt deze bon zien terwijl hij wordt gescand. Kom later terug of voer de gegevens nu in.',
        receiptScanningFailed: 'Bonnetjes scannen is mislukt. Voer de gegevens handmatig in.',
        transactionPendingDescription: 'Transactie in behandeling. Het kan een paar dagen duren voordat deze is geboekt.',
        companyInfo: 'Bedrijfsgegevens',
        companyInfoDescription: 'We hebben nog een paar gegevens nodig voordat je je eerste factuur kunt versturen.',
        yourCompanyName: 'Naam van uw bedrijf',
        yourCompanyWebsite: 'De website van uw bedrijf',
        yourCompanyWebsiteNote: 'Als u geen website hebt, kunt u in plaats daarvan het LinkedIn-profiel of een sociaalmediaprofiel van uw bedrijf opgeven.',
        invalidDomainError: 'Je hebt een ongeldig domein ingevoerd. Voer een geldig domein in om door te gaan.',
        publicDomainError: 'Je hebt een openbaar domein ingevoerd. Voer om door te gaan een privédomein in.',
        expenseCount: () => {
            return {
                one: '1 uitgave',
                other: (count: number) => `${count} uitgaven`,
            };
        },
        deleteExpense: () => ({
            one: 'Uitgave verwijderen',
            other: 'Declaraties verwijderen',
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
        individual: 'Particulier',
        business: 'Zakelijk',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Betaal ${formattedAmount} met Expensify` : `Betalen met Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Betaal ${formattedAmount} als individu` : `Betalen met persoonlijke rekening`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Betaal ${formattedAmount} met wallet` : `Betalen met wallet`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Betaal ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Betaal ${formattedAmount} als bedrijf` : `Betalen met zakelijke rekening`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Markeer ${formattedAmount} als betaald` : `Markeren als betaald`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `heeft ${amount} betaald met persoonlijke rekening ${last4Digits}` : `Betaald met privérekening`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `heeft ${amount} betaald met zakelijke rekening ${last4Digits}` : `Betaald met zakelijke rekening`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Betaal ${formattedAmount} via ${policyName}` : `Betaal via ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `heeft ${amount} betaald met bankrekening ${last4Digits}` : `betaald met bankrekening ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `betaald ${amount ? `${amount} ` : ''}met bankrekening ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">workspace-regels</a>`,
        invoicePersonalBank: (lastFour: string) => `Persoonlijke rekening • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Zakelijke rekening • ${lastFour}`,
        nextStep: 'Volgende stappen',
        finished: 'Voltooid',
        flip: 'Draaien',
        sendInvoice: ({amount}: RequestAmountParams) => `${amount} factuur verzenden`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `voor ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `ingediend${memo ? `, met als opmerking: ${memo}` : ''}`,
        automaticallySubmitted: `ingediend via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">indiening uitstellen</a>`,
        queuedToSubmitViaDEW: 'in de wachtrij om in te dienen via aangepaste goedkeuringsworkflow',
        trackedAmount: (formattedAmount: string, comment?: string) => `volgt ${formattedAmount}${comment ? `voor ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `splitsen ${amount}`,
        didSplitAmount: (formattedAmount: string, comment: string) => `splitsen ${formattedAmount}${comment ? `voor ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Jouw deel ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} is ${amount}${comment ? `voor ${comment}` : ''} verschuldigd`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} is verschuldigd:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}heeft ${amount} betaald`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} heeft betaald:`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} gaf ${amount} uit`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} heeft uitgegeven:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} heeft goedgekeurd:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} heeft ${amount} goedgekeurd`,
        payerSettled: (amount: number | string) => `betaald ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `heeft ${amount} betaald. Voeg een bankrekening toe om je betaling te ontvangen.`,
        automaticallyApproved: `goedgekeurd via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimteregels</a>`,
        approvedAmount: (amount: number | string) => `goedgekeurd: ${amount}`,
        approvedMessage: `goedgekeurd`,
        unapproved: `niet-goedgekeurd`,
        automaticallyForwarded: `goedgekeurd via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimteregels</a>`,
        forwarded: `goedgekeurd`,
        rejectedThisReport: 'heeft dit rapport afgekeurd',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `is met de betaling begonnen, maar wacht tot ${submitterDisplayName} een bankrekening toevoegt.`,
        adminCanceledRequest: 'heeft de betaling geannuleerd',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `heeft de betaling van ${amount} geannuleerd, omdat ${submitterDisplayName} hun Expensify Wallet niet binnen 30 dagen heeft geactiveerd`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} heeft een bankrekening toegevoegd. De betaling van ${amount} is gedaan.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}gemarkeerd als betaald${comment ? `en zei: „${comment}”` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}betaald met wallet`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}betaald met Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimteregels</a>`,
        noReimbursableExpenses: 'Dit rapport bevat een ongeldig bedrag',
        pendingConversionMessage: 'Totaal wordt bijgewerkt zodra je weer online bent',
        changedTheExpense: 'heeft de uitgave gewijzigd',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `de ${valueName} naar ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `stel ${translatedChangedField} in op ${newMerchant}, waardoor het bedrag is ingesteld op ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `de ${valueName} (voorheen ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `de ${valueName} naar ${newValueToDisplay} (voorheen ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `heeft ${translatedChangedField} gewijzigd in ${newMerchant} (voorheen ${oldMerchant}), waardoor het bedrag is bijgewerkt naar ${newAmountToDisplay} (voorheen ${oldAmountToDisplay})`,
        basedOnAI: 'op basis van eerdere activiteit',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `op basis van <a href="${rulesLink}">werkruimteregels</a>` : 'op basis van werkruimte-regel'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `voor ${comment}` : 'uitgave'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Factuurrapport nr. ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} verzonden${comment ? `voor ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `heeft uitgave verplaatst van persoonlijke ruimte naar ${workspaceName ?? `chat met ${reportName}`}`,
        movedToPersonalSpace: 'heeft uitgave naar persoonlijke ruimte verplaatst',
        error: {
            invalidCategoryLength: 'De categorienaam is langer dan 255 tekens. Verkort deze of kies een andere categorie.',
            invalidTagLength: 'De tagnaam is langer dan 255 tekens. Verkort deze of kies een andere tag.',
            invalidAmount: 'Voer een geldig bedrag in voordat je verdergaat',
            invalidDistance: 'Voer een geldige afstand in voordat je verdergaat',
            invalidReadings: 'Voer zowel de begin- als eindstanden in',
            negativeDistanceNotAllowed: 'Eindstand moet hoger zijn dan beginstand',
            invalidIntegerAmount: 'Voer een volledig dollarbedrag in voordat u verdergaat',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Maximale belastingbedrag is ${amount}`,
            invalidSplit: 'De som van de splitsingen moet gelijk zijn aan het totaalbedrag',
            invalidSplitParticipants: 'Voer een bedrag groter dan nul in voor minstens twee deelnemers',
            invalidSplitYourself: 'Voer een bedrag ongelijk aan nul in voor je splitsing',
            noParticipantSelected: 'Selecteer een deelnemer',
            other: 'Onverwachte fout. Probeer het later opnieuw.',
            genericCreateFailureMessage: 'Onverwachte fout bij het indienen van deze uitgave. Probeer het later opnieuw.',
            genericCreateInvoiceFailureMessage: 'Onverwachte fout bij het verzenden van deze factuur. Probeer het later opnieuw.',
            genericHoldExpenseFailureMessage: 'Onverwachte fout bij het vasthouden van deze uitgave. Probeer het later opnieuw.',
            genericUnholdExpenseFailureMessage: 'Onverwachte fout bij het verwijderen van deze onkosten van de wachtstatus. Probeer het later opnieuw.',
            receiptDeleteFailureError: 'Onverwachte fout bij het verwijderen van deze bon. Probeer het later opnieuw.',
            receiptFailureMessage: '<rbr>Er is een fout opgetreden bij het uploaden van je bon. <a href="download">Sla de bon op</a> en <a href="retry">probeer het later opnieuw</a>.</rbr>',
            receiptFailureMessageShort: 'Er is een fout opgetreden bij het uploaden van je bon.',
            genericDeleteFailureMessage: 'Onverwachte fout bij het verwijderen van deze uitgave. Probeer het later opnieuw.',
            genericEditFailureMessage: 'Onverwachte fout bij het bewerken van deze uitgave. Probeer het later opnieuw.',
            genericSmartscanFailureMessage: 'Transactie mist velden',
            duplicateWaypointsErrorMessage: 'Verwijder dubbele waypoints alstublieft',
            atLeastTwoDifferentWaypoints: 'Voer minimaal twee verschillende adressen in',
            splitExpenseMultipleParticipantsErrorMessage: 'Een uitgave kan niet worden opgesplitst tussen een werkruimte en andere leden. Werk je selectie bij.',
            invalidMerchant: 'Voer een geldige leverancier in',
            atLeastOneAttendee: 'Er moet minstens één deelnemer worden geselecteerd',
            invalidQuantity: 'Voer een geldige hoeveelheid in',
            quantityGreaterThanZero: 'Hoeveelheid moet groter zijn dan nul',
            invalidSubrateLength: 'Er moet ten minste één subtarief zijn',
            invalidRate: 'Tarief niet geldig voor deze workspace. Selecteer een beschikbaar tarief uit de workspace.',
            endDateBeforeStartDate: 'De einddatum mag niet vóór de startdatum liggen',
            endDateSameAsStartDate: 'De einddatum mag niet hetzelfde zijn als de startdatum',
            manySplitsProvided: `Het maximaal toegestane aantal splitsingen is ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `Het datumbereik mag niet langer zijn dan ${CONST.IOU.SPLITS_LIMIT} dagen.`,
        },
        dismissReceiptError: 'Foutmelding sluiten',
        dismissReceiptErrorConfirmation: 'Let op! Als je deze foutmelding sluit, wordt je geüploade bon volledig verwijderd. Weet je het zeker?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `is begonnen met vereffenen. Betaling wordt vastgehouden totdat ${submitterDisplayName} hun wallet inschakelt.`,
        enableWallet: 'Wallet inschakelen',
        hold: 'Vasthouden',
        unhold: 'Blokkering opheffen',
        holdExpense: () => ({
            one: 'Uitgave vasthouden',
            other: 'Uitgaven vasthouden',
        }),
        unholdExpense: 'Onthoud blokkering van uitgave',
        heldExpense: 'heeft deze uitgave tegengehouden',
        unheldExpense: 'vasthouden van deze uitgave ongedaan gemaakt',
        moveUnreportedExpense: 'Ongeboekte uitgave verplaatsen',
        addUnreportedExpense: 'Niet-gerapporteerde uitgave toevoegen',
        selectUnreportedExpense: 'Selecteer minimaal één uitgave om aan het rapport toe te voegen.',
        emptyStateUnreportedExpenseTitle: 'Geen niet-gerapporteerde uitgaven',
        emptyStateUnreportedExpenseSubtitle: 'Het lijkt erop dat je geen niet-gerapporteerde uitgaven hebt. Probeer er hieronder één aan te maken.',
        addUnreportedExpenseConfirm: 'Toevoegen aan rapport',
        newReport: 'Nieuw rapport',
        explainHold: () => ({
            one: 'Leg uit waarom je deze uitgave aanhoudt.',
            other: 'Leg uit waarom je deze onkosten aanhoudt.',
        }),
        retracted: 'ingetrokken',
        retract: 'Intrekken',
        reopened: 'heropend',
        reopenReport: 'Rapport heropenen',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Dit rapport is al geëxporteerd naar ${connectionName}. Wijzigingen kunnen leiden tot gegevensverschillen. Weet je zeker dat je dit rapport opnieuw wilt openen?`,
        reason: 'Reden',
        holdReasonRequired: 'Een reden is vereist bij het vasthouden.',
        expenseWasPutOnHold: 'Declaratie is gepauzeerd',
        expenseOnHold: 'Deze uitgave is in de wacht gezet. Bekijk de opmerkingen voor de volgende stappen.',
        expensesOnHold: 'Alle declaraties zijn gepauzeerd. Controleer de opmerkingen voor de volgende stappen.',
        expenseDuplicate: 'Deze uitgave heeft vergelijkbare details als een andere. Controleer de dubbele uitgaven om verder te gaan.',
        someDuplicatesArePaid: 'Sommige van deze duplicaten zijn al goedgekeurd of betaald.',
        reviewDuplicates: 'Dubbele items controleren',
        keepAll: 'Alles behouden',
        confirmApprove: 'Bevestig goedkeuringsbedrag',
        confirmApprovalAmount: 'Keur alleen conforme uitgaven goed, of keur het volledige rapport goed.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Deze uitgave is gepauzeerd. Wil je toch goedkeuren?',
            other: 'Deze uitgaven zijn gepauzeerd. Wil je ze toch goedkeuren?',
        }),
        confirmPay: 'Bevestig betalingsbedrag',
        confirmPayAmount: 'Betaal wat niet in de wacht staat, of betaal het volledige rapport.',
        confirmPayAllHoldAmount: () => ({
            one: 'Deze uitgave staat in de wacht. Wil je toch betalen?',
            other: 'Deze uitgaven staan in de wacht. Wil je toch betalen?',
        }),
        payOnly: 'Alleen betalen',
        approveOnly: 'Alleen goedkeuren',
        holdEducationalTitle: 'Moet je deze uitgave aanhouden?',
        whatIsHoldExplain: 'Vastzetten is als op ‘pauze’ drukken voor een uitgave totdat je klaar bent om die in te dienen.',
        holdIsLeftBehind: 'Ingehouden uitgaven blijven achter, zelfs als je een volledig rapport indient.',
        unholdWhenReady: 'Deblokkeer onkosten wanneer je klaar bent om ze in te dienen.',
        changePolicyEducational: {
            title: 'Je hebt dit rapport verplaatst!',
            description: 'Controleer deze items goed; ze veranderen vaak wanneer rapporten naar een nieuwe workspace worden verplaatst.',
            reCategorize: '<strong>Hercategoriseer alle uitgaven</strong> om te voldoen aan de werkruimteregels.',
            workflows: 'Voor dit rapport geldt nu mogelijk een andere <strong>goedkeuringsworkflow.</strong>',
        },
        changeWorkspace: 'Werkruimte wijzigen',
        set: 'instellen',
        changed: 'gewijzigd',
        removed: 'verwijderd',
        transactionPending: 'Transactie in behandeling.',
        chooseARate: 'Selecteer een workspace-vergoedingstarief per mijl of kilometer',
        unapprove: 'Afkeuren',
        unapproveReport: 'Rapport afkeuren',
        headsUp: 'Let op!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Dit rapport is al geëxporteerd naar ${accountingIntegration}. Wijzigingen kunnen tot gegevensverschillen leiden. Weet je zeker dat je de goedkeuring van dit rapport wilt intrekken?`,
        reimbursable: 'vergoedbaar',
        nonReimbursable: 'niet-vergoedbaar',
        bookingPending: 'Deze boeking is in behandeling',
        bookingPendingDescription: 'Deze boeking is in behandeling omdat ze nog niet is betaald.',
        bookingArchived: 'Deze boeking is gearchiveerd',
        bookingArchivedDescription: 'Deze boeking is gearchiveerd omdat de reisdatum is verstreken. Voeg indien nodig een uitgave toe voor het definitieve bedrag.',
        attendees: 'Deelnemers',
        whoIsYourAccountant: 'Wie is je accountant?',
        paymentComplete: 'Betaling voltooid',
        time: 'Tijd',
        startDate: 'Startdatum',
        endDate: 'Einddatum',
        startTime: 'Starttijd',
        endTime: 'Eindtijd',
        deleteSubrate: 'Subtarief verwijderen',
        deleteSubrateConfirmation: 'Weet je zeker dat je dit subtarief wilt verwijderen?',
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
            educationalText: 'Als je nog niet klaar bent om een uitgave goed te keuren of te betalen, kun je deze vasthouden of afwijzen.',
            holdExpenseTitle: 'Houd een uitgave vast om om meer details te vragen vóór goedkeuring of betaling.',
            approveExpenseTitle: 'Keur andere declaraties goed terwijl aangehouden declaraties aan jou toegewezen blijven.',
            heldExpenseLeftBehindTitle: 'Aangehouden uitgaven blijven achter wanneer je een volledig rapport goedkeurt.',
            rejectExpenseTitle: 'Wijs een uitgave af die je niet van plan bent goed te keuren of te betalen.',
            reasonPageTitle: 'Declaratie afwijzen',
            reasonPageDescription: 'Leg uit waarom je deze declaratie afkeurt.',
            rejectReason: 'Reden van afwijzing',
            markAsResolved: 'Markeren als opgelost',
            rejectedStatus: 'Deze uitgave is afgewezen. We wachten tot jij de problemen oplost en als opgelost markeert, zodat je het opnieuw kunt indienen.',
            reportActions: {
                rejectedExpense: 'heeft deze uitgave afgewezen',
                markedAsResolved: 'heeft de reden voor afwijzing als opgelost gemarkeerd',
            },
        },
        moveExpenses: () => ({one: 'Declaratie verplaatsen', other: 'Uitgaven verplaatsen'}),
        moveExpensesError: 'Je kunt per diem-kosten niet naar rapporten in andere werkruimtes verplaatsen, omdat de per diem-tarieven per werkruimte kunnen verschillen.',
        changeApprover: {
            title: 'Goedkeurder wijzigen',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Kies een optie om de fiatteur voor dit rapport te wijzigen. (Werk je <a href="${workflowSettingLink}">werkruimte-instellingen</a> bij om dit permanent voor alle rapporten te wijzigen.)`,
            changedApproverMessage: (managerID: number) => `heeft de fiatteur gewijzigd in <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Goedkeurder toevoegen',
                addApproverSubtitle: 'Voeg een extra fiatteur toe aan de bestaande workflow.',
                bypassApprovers: 'Fiatteurs overslaan',
                bypassApproversSubtitle: 'Wijs jezelf aan als laatste fiatteur en sla alle resterende fiatteurs over.',
            },
            addApprover: {
                subtitle: 'Kies een extra fiatteur voor dit rapport voordat we het door de rest van de fiatteringsworkflow sturen.',
            },
        },
        chooseWorkspace: 'Kies een werkruimte',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `rapport doorgestuurd naar ${to} vanwege aangepast goedkeuringsworkflow`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'uur' : 'uren'} @ ${rate} / uur`,
            hrs: 'uur',
            hours: 'Uren',
            ratePreview: (rate: string) => `${rate} / uur`,
            amountTooLargeError: 'Het totale bedrag is te hoog. Verlaag het aantal uren of verlaag het tarief.',
        },
        correctDistanceRateError: 'Los het foutieve afstandstarief op en probeer het opnieuw.',
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
            header: 'Selecteer bon',
            pageTitle: 'Selecteer de bon die je wilt behouden:',
        },
        detailsPage: {
            header: 'Selecteer details',
            pageTitle: 'Selecteer de details die je wilt behouden:',
            noDifferences: 'Geen verschillen gevonden tussen de transacties',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? 'een' : 'a';
                return `Selecteer ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Selecteer deelnemers',
            selectAllDetailsError: 'Selecteer alle details voordat je verdergaat.',
        },
        confirmationPage: {
            header: 'Details bevestigen',
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
        numberHasNotBeenValidated: 'Het nummer is nog niet gevalideerd. Klik op de knop om de validatielink opnieuw per sms te versturen.',
        emailHasNotBeenValidated: 'Het e-mailadres is nog niet gevalideerd. Klik op de knop om de verificatielink opnieuw via sms te versturen.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Foto uploaden',
        removePhoto: 'Foto verwijderen',
        editImage: 'Foto bewerken',
        viewPhoto: 'Foto bekijken',
        imageUploadFailed: 'Uploaden van afbeelding is mislukt',
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
        selectAvatar: 'Avatar kiezen',
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
                        return `Wacht tot <strong>jij</strong> onkosten toevoegt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> uitgaven toevoegt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder uitgaven toevoegt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> onkosten indient.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> onkosten indient.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder onkostendeclaraties indient.`;
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
                        return `Bezig met automatisch indienen van <strong>jouw</strong> declaraties${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot de uitgaven van <strong>${actor}</strong> automatisch worden ingediend${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot de onkosten van een beheerder automatisch worden ingediend${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wacht tot <strong>jij</strong> de problemen oplost.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> de problemen oplost.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder de problemen oplost.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wacht tot <strong>jij</strong> de declaraties goedkeurt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> de onkosten goedkeurt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten op goedkeuring van uitgaven door een beheerder.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `We wachten op <strong>jou</strong> om dit rapport te exporteren.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `In afwachting tot <strong>${actor}</strong> dit rapport exporteert.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten op een beheerder om dit rapport te exporteren.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wacht tot <strong>jij</strong> de onkosten betaalt.`;
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
                        return `Wachten tot een beheerder het instellen van een zakelijke bankrekening afrondt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `uiterlijk om ${eta}` : ` ${eta}`;
                }
                return `Wachten tot de betaling is voltooid${formattedETA}.`;
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `Oeps! Het lijkt erop dat je deze aan <strong>jezelf</strong> indient. Het goedkeuren van je eigen rapporten is <strong>verboden</strong> door je werkruimte. Dien dit rapport in bij iemand anders of neem contact op met je beheerder om de persoon te wijzigen bij wie je indient.`,
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
    profilePage: {
        profile: 'Profiel',
        preferredPronouns: 'Voorkeur voor voornaamwoorden',
        selectYourPronouns: 'Selecteer je voornaamwoorden',
        selfSelectYourPronoun: 'Selecteer je eigen voornaamwoord',
        emailAddress: 'E-mailadres',
        setMyTimezoneAutomatically: 'Stel mijn tijdzone automatisch in',
        timezone: 'Tijdzone',
        invalidFileMessage: 'Ongeldig bestand. Probeer een andere afbeelding.',
        avatarUploadFailureMessage: 'Er is een fout opgetreden bij het uploaden van de avatar. Probeer het opnieuw.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchroniseren',
        profileAvatar: 'Profielavatar',
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
        subtitle: 'Schakel tweeledige verificatie in om je account veilig te houden.',
        goToSecurity: 'Ga terug naar de beveiligingspagina',
    },
    shareCodePage: {
        title: 'Uw code',
        subtitle: 'Nodig leden uit voor Expensify door je persoonlijke QR-code of verwijzingslink te delen.',
    },
    pronounsPage: {
        pronouns: 'Voornaamwoorden',
        isShownOnProfile: 'Je voornaamwoorden worden weergegeven op je profiel.',
        placeholderText: 'Zoek om opties te zien',
    },
    contacts: {
        contactMethods: 'Contactmethoden',
        featureRequiresValidate: 'Voor deze functie moet je je account verifiëren.',
        validateAccount: 'Verifieer je account',
        helpText: ({email}: {email: string}) =>
            `Voeg meer manieren toe om in te loggen en bonnen naar Expensify te sturen.<br/><br/>Voeg een e-mailadres toe om bonnen door te sturen naar <a href="mailto:${email}">${email}</a> of voeg een telefoonnummer toe om bonnen te sms’en naar 47777 (alleen voor Amerikaanse nummers).`,
        pleaseVerify: 'Verifieer deze contactmethode.',
        getInTouch: 'We gebruiken deze methode om contact met je op te nemen.',
        enterMagicCode: (contactMethod: string) => `Voer de magische code in die naar ${contactMethod} is gestuurd. Deze zou binnen een of twee minuten moeten aankomen.`,
        setAsDefault: 'Instellen als standaard',
        yourDefaultContactMethod:
            'Dit is je huidige standaardcontactmethode. Voordat je deze kunt verwijderen, moet je een andere contactmethode kiezen en op ‘Instellen als standaard’ klikken.',
        removeContactMethod: 'Contactmethode verwijderen',
        removeAreYouSure: 'Weet je zeker dat je deze contactmethode wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
        failedNewContact: 'Deze contactmethode kon niet worden toegevoegd.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Het versturen van een nieuwe magische code is mislukt. Wacht even en probeer het opnieuw.',
            validateSecondaryLogin: 'Onjuiste of ongeldige magische code. Probeer het opnieuw of vraag een nieuwe code aan.',
            deleteContactMethod: 'Verwijderen van contactmethode mislukt. Neem contact op met Concierge voor hulp.',
            setDefaultContactMethod: 'Het instellen van een nieuwe standaardcontactmethode is mislukt. Neem contact op met Concierge voor hulp.',
            addContactMethod: 'Toevoegen van deze contactmethode is mislukt. Neem contact op met Concierge voor hulp.',
            enteredMethodIsAlreadySubmitted: 'Deze contactmethode bestaat al',
            passwordRequired: 'wachtwoord vereist.',
            contactMethodRequired: 'Contactmethode is verplicht',
            invalidContactMethod: 'Ongeldige contactmethode',
        },
        newContactMethod: 'Nieuwe contactmethode',
        goBackContactMethods: 'Ga terug naar contactmethoden',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Hij / Hem / Zijn',
        heHimHisTheyThemTheirs: 'Hij / Hem / Zijn / Die / Hen / Hun',
        sheHerHers: 'Zij / Haar / Hare',
        sheHerHersTheyThemTheirs: 'Zij / Haar / Hare / Die / Hen / Hun',
        merMers: 'Meier / Meiers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'Die / Hen / Hens',
        thonThons: 'Ton / Tonnen',
        veVerVis: 'In / Uit / Zicht',
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
        getLocationAutomatically: 'Je locatie automatisch bepalen',
    },
    updateRequiredView: {
        updateRequired: 'Update vereist',
        pleaseInstall: 'Update alsjeblieft naar de nieuwste versie van New Expensify',
        pleaseInstallExpensifyClassic: 'Installeer de nieuwste versie van Expensify',
        toGetLatestChanges: 'Voor mobiel: download en installeer de nieuwste versie. Voor web: ververs je browser.',
        newAppNotAvailable: 'De app New Expensify is niet langer beschikbaar.',
    },
    initialSettingsPage: {
        about: 'OverInfo',
        aboutPage: {
            description: 'De nieuwe Expensify-app is gemaakt door een community van open-sourcontwikkelaars van over de hele wereld. Help ons de toekomst van Expensify bouwen.',
            appDownloadLinks: 'Links om de app te downloaden',
            viewKeyboardShortcuts: 'Toetsenbord­sneltoetsen bekijken',
            viewTheCode: 'Code bekijken',
            viewOpenJobs: 'Openstaande vacatures weergeven',
            reportABug: 'Meld een bug',
            troubleshoot: 'Problemen oplossen',
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
            clearCacheAndRestart: 'Cache wissen en opnieuw starten',
            viewConsole: 'Debugconsole weergeven',
            debugConsole: 'Debugconsole',
            description:
                '<muted-text>Gebruik de onderstaande tools om problemen met de Expensify-ervaring op te lossen. Als je problemen tegenkomt, kun je <concierge-link>een bug rapporteren</concierge-link>.</muted-text>',
            confirmResetDescription: 'Alle niet-verzonden conceptberichten gaan verloren, maar de rest van je gegevens is veilig.',
            resetAndRefresh: 'Resetten en vernieuwen',
            clientSideLogging: 'Client-side logging',
            noLogsToShare: 'Geen logboeken om te delen',
            useProfiling: 'Profiling gebruiken',
            profileTrace: 'Profieltracering',
            results: 'Resultaten',
            releaseOptions: 'Release-opties',
            testingPreferences: 'Testvoorkeuren',
            useStagingServer: 'Stagingserver gebruiken',
            forceOffline: 'Offline forceren',
            simulatePoorConnection: 'Slechte internetverbinding simuleren',
            simulateFailingNetworkRequests: 'Netwerkaanvragen mislukken simuleren',
            authenticationStatus: 'Authenticatiestatus',
            deviceCredentials: 'Apparaatgegevens',
            invalidate: 'Ongeldig maken',
            destroy: 'Vernietigen',
            maskExportOnyxStateData: 'Fragiele ledendata maskeren bij het exporteren van de Onyx-status',
            exportOnyxState: 'Onyx-status exporteren',
            importOnyxState: 'Onyx-status importeren',
            testCrash: 'Testcrash',
            resetToOriginalState: 'Opnieuw instellen naar oorspronkelijke staat',
            usingImportedState: 'Je gebruikt geïmporteerde status. Druk hier om deze te wissen.',
            debugMode: 'Debugmodus',
            invalidFile: 'Ongeldig bestand',
            invalidFileDescription: 'Het bestand dat je probeert te importeren is ongeldig. Probeer het opnieuw.',
            invalidateWithDelay: 'Ongeldig maken met vertraging',
            leftHandNavCache: 'Cache van navigatie aan linkerkant',
            clearleftHandNavCache: 'Wissen',
            recordTroubleshootData: 'Probleemoplossingsgegevens opnemen',
            softKillTheApp: 'Sluit de app zacht af',
            kill: 'Doden',
            sentryDebug: 'Sentry-debug',
            sentryDebugDescription: 'Sentry-verzoeken in console loggen',
            sentryHighlightedSpanOps: 'Gemarkeerde spannaamnamen',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interactie.klik, navigatie, ui.laden',
        },
        debugConsole: {
            saveLog: 'Log opslaan',
            shareLog: 'Logboek delen',
            enterCommand: 'Voer opdracht in',
            execute: 'Uitvoeren',
            noLogsAvailable: 'Geen logboeken beschikbaar',
            logSizeTooLarge: ({size}: LogSizeParams) => `Loggrootte overschrijdt de limiet van ${size} MB. Gebruik alstublieft “Log opslaan” om het logbestand te downloaden.`,
            logs: 'Logboeken',
            viewConsole: 'Console weergeven',
        },
        security: 'Beveiliging',
        signOut: 'Afmelden',
        restoreStashed: 'Opgeslagen login herstellen',
        signOutConfirmationText: 'Je verliest alle offline wijzigingen als je je afmeldt.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Lees de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Gebruiksvoorwaarden</a> en het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacybeleid</a>.</muted-text-micro>`,
        help: 'Help',
        whatIsNew: 'Wat is er nieuw',
        accountSettings: 'Accountinstellingen',
        account: 'Account',
        general: 'Algemeen',
    },
    closeAccountPage: {
        // @context close as a verb, not an adjective
        closeAccount: 'Account sluiten',
        reasonForLeavingPrompt: 'We zouden het jammer vinden als je weggaat! Wil je ons vertellen waarom, zodat we kunnen verbeteren?',
        enterMessageHere: 'Voer hier een bericht in',
        closeAccountWarning: 'Het sluiten van je account kan niet ongedaan worden gemaakt.',
        closeAccountPermanentlyDeleteData: 'Weet je zeker dat je je account wilt verwijderen? Hiermee verwijder je alle openstaande declaraties permanent.',
        enterDefaultContactToConfirm: 'Voer uw standaard contactmethode in om te bevestigen dat u uw account wilt sluiten. Uw standaard contactmethode is:',
        enterDefaultContact: 'Voer je standaard contactmethode in',
        defaultContact: 'Standaardcontactmethode:',
        enterYourDefaultContactMethod: 'Voer uw standaard contactmethode in om uw account te sluiten.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Accounts samenvoegen',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Voer de account in die je wilt samenvoegen met <strong>${login}</strong>.`,
            notReversibleConsent: 'Ik begrijp dat dit niet onomkeerbaar is',
        },
        accountValidate: {
            confirmMerge: 'Weet je zeker dat je accounts wilt samenvoegen?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `Het samenvoegen van je accounts kan niet ongedaan worden gemaakt en zal leiden tot het verlies van alle niet-ingediende uitgaven voor <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Voer om door te gaan de magische code in die is verzonden naar <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Onjuiste of ongeldige magische code. Probeer het opnieuw of vraag een nieuwe code aan.',
                fallback: 'Er is iets misgegaan. Probeer het later opnieuw.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Accounts samengevoegd!',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Je hebt alle gegevens van <strong>${from}</strong> succesvol samengevoegd met <strong>${to}</strong>. Vanaf nu kun je voor dit account beide logins gebruiken.</centered-text></muted-text>`,
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
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet met andere accounts samenvoegen omdat je domeinbeheerder dit als je primaire login heeft ingesteld. Voeg in plaats daarvan andere accounts hiermee samen.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Je kunt geen accounts samenvoegen omdat voor <strong>${email}</strong> twee-factor-authenticatie (2FA) is ingeschakeld. Schakel 2FA voor <strong>${email}</strong> uit en probeer het opnieuw.</centered-text></muted-text>`,
            learnMore: 'Meer informatie over het samenvoegen van accounts.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet samenvoegen omdat deze is vergrendeld. <concierge-link>Neem contact op met Concierge</concierge-link> voor hulp.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Je kunt geen accounts samenvoegen omdat <strong>${email}</strong> geen Expensify-account heeft. <a href="${contactMethodLink}">Voeg het in plaats daarvan toe als contactmethode</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet met andere accounts samenvoegen. Voeg in plaats daarvan andere accounts met dit account samen.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt geen accounts samenvoegen in <strong>${email}</strong> omdat deze account eigenaar is van een gefactureerde factureringsrelatie.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Probeer het later opnieuw',
            description: 'Er zijn te veel pogingen gedaan om accounts samen te voegen. Probeer het later opnieuw.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Je kunt niet samenvoegen met andere accounts omdat het niet is gevalideerd. Valideer het account en probeer het opnieuw.',
        },
        mergeFailureSelfMerge: {
            description: 'Je kunt een account niet met zichzelf samenvoegen.',
        },
        mergeFailureGenericHeading: 'Kan accounts niet samenvoegen',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Verdachte activiteit melden',
        lockAccount: 'Account vergrendelen',
        unlockAccount: 'Account ontgrendelen',
        compromisedDescription:
            'Val je iets vreemds op aan je account? Dit melden zorgt er direct voor dat je account wordt vergrendeld, nieuwe Expensify Card-transacties worden geblokkeerd en wijzigingen aan je account worden voorkomen.',
        domainAdminsDescription: 'Voor domeinbeheerders: dit pauzeert ook alle Expensify Card-activiteit en beheerdersacties binnen je domein(en).',
        areYouSure: 'Weet je zeker dat je je Expensify-account wilt vergrendelen?',
        onceLocked: 'Zodra deze is vergrendeld, wordt je account beperkt in afwachting van een ontgrendelingsverzoek en een beveiligingscontrole',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Account vergrendelen mislukt',
        failedToLockAccountDescription: `We konden je account niet blokkeren. Chat met Concierge om dit probleem op te lossen.`,
        chatWithConcierge: 'Chatten met Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Account vergrendeld',
        yourAccountIsLocked: 'Je account is vergrendeld',
        chatToConciergeToUnlock: 'Chat met Concierge om beveiligingsproblemen op te lossen en je account te ontgrendelen.',
        chatWithConcierge: 'Chatten met Concierge',
    },
    twoFactorAuth: {
        headerTitle: 'Authenticatie in twee stappen',
        twoFactorAuthEnabled: 'Tweeledige verificatie ingeschakeld',
        whatIsTwoFactorAuth:
            'Tweestapsverificatie (2FA) helpt je account veilig te houden. Tijdens het inloggen moet je een code invoeren die wordt gegenereerd door je voorkeursauthenticator-app.',
        disableTwoFactorAuth: 'Tweestapsverificatie uitschakelen',
        explainProcessToRemove: 'Voer een geldige code uit je authenticatie-app in om tweestapsverificatie (2FA) uit te schakelen.',
        explainProcessToRemoveWithRecovery: 'Voer een geldige herstelcode in om tweefactorauthenticatie (2FA) uit te schakelen.',
        disabled: 'Tweefactorauthenticatie is nu uitgeschakeld',
        noAuthenticatorApp: 'Je hebt geen authenticatie-app meer nodig om in te loggen bij Expensify.',
        stepCodes: 'Herstelcodes',
        keepCodesSafe: 'Bewaar deze herstelscodes goed!',
        codesLoseAccess: dedent(`
            Als je de toegang tot je authenticator-app verliest en deze codes niet hebt, verlies je de toegang tot je account.

            Opmerking: Het instellen van twee-factor-authenticatie zal je uitloggen op alle andere actieve sessies.
        `),
        errorStepCodes: 'Kopieer of download de codes voordat je verdergaat',
        stepVerify: 'Verifiëren',
        scanCode: 'Scan de QR-code met je',
        authenticatorApp: 'authenticator-app',
        addKey: 'Of voeg deze geheime sleutel toe aan je authenticator-app:',
        enterCode: 'Voer daarna de zescijferige code in die is gegenereerd door je authenticator-app.',
        stepSuccess: 'Voltooid',
        enabled: 'Tweeledige verificatie ingeschakeld',
        congrats: 'Gefeliciteerd! Je hebt nu die extra beveiliging.',
        copy: 'Kopiëren',
        disable: 'Uitschakelen',
        enableTwoFactorAuth: 'Tweestapsverificatie inschakelen',
        pleaseEnableTwoFactorAuth: 'Schakel tweeledige verificatie in.',
        twoFactorAuthIsRequiredDescription: 'Om veiligheidsredenen vereist Xero tweeledige verificatie om de integratie te verbinden.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Authenticatie in twee stappen vereist',
        twoFactorAuthIsRequiredForAdminsTitle: 'Schakel tweestapsverificatie in',
        twoFactorAuthIsRequiredXero: 'Je Xero-boekhoudkoppeling vereist tweeledige verificatie.',
        twoFactorAuthIsRequiredCompany: 'Uw bedrijf vereist tweeledige verificatie.',
        twoFactorAuthCannotDisable: 'Kan 2FA niet uitschakelen',
        twoFactorAuthRequired: 'Tweeledige verificatie (2FA) is verplicht voor je Xero-verbinding en kan niet worden uitgeschakeld.',
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
            incorrect2fa: 'Onjuiste code voor twee-factor-authenticatie. Probeer het opnieuw.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Wachtwoord bijgewerkt!',
        allSet: 'Je bent helemaal klaar. Bewaar je nieuwe wachtwoord goed.',
    },
    privateNotes: {
        title: 'Privénotities',
        personalNoteMessage: 'Noteer hier aantekeningen over deze chat. Jij bent de enige die deze aantekeningen kan toevoegen, bewerken of bekijken.',
        sharedNoteMessage: 'Noteer hier opmerkingen over deze chat. Expensify-medewerkers en andere leden met een account op het team.expensify.com-domein kunnen deze opmerkingen bekijken.',
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
        changeBillingCurrency: 'Facturatievaluta wijzigen',
        changePaymentCurrency: 'Betaalvaluta wijzigen',
        paymentCurrency: 'Betaalvaluta',
        paymentCurrencyDescription: 'Selecteer een standaardvaluta waarnaar alle persoonlijke uitgaven moeten worden omgerekend',
        note: `Opmerking: Als u uw betalingsvaluta wijzigt, kan dit invloed hebben op hoeveel u voor Expensify betaalt. Raadpleeg onze <a href="${CONST.PRICING}">prijspagina</a> voor alle details.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Debetkaart toevoegen',
        nameOnCard: 'Naam op kaart',
        debitCardNumber: 'Debetkaartnummer',
        expiration: 'Vervaldatum',
        expirationDate: 'MMJJ',
        cvv: 'CVV',
        billingAddress: 'Factuuradres',
        growlMessageOnSave: 'Je betaalpas is succesvol toegevoegd',
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
        addAPaymentCard: 'Betaalkaart toevoegen',
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
        setDefaultConfirmation: 'Stel standaardbetaalmethode in',
        setDefaultSuccess: 'Standaardbetaalmethode ingesteld!',
        deleteAccount: 'Account verwijderen',
        deleteConfirmation: 'Weet je zeker dat je deze account wilt verwijderen?',
        error: {
            notOwnerOfBankAccount: 'Er is een fout opgetreden bij het instellen van deze bankrekening als je standaardbetaalmethode',
            invalidBankAccount: 'Deze bankrekening is tijdelijk geblokkeerd',
            notOwnerOfFund: 'Er is een fout opgetreden bij het instellen van deze kaart als je standaardbetaalmethode',
            setDefaultFailure: 'Er is iets misgegaan. Chat met Concierge voor verdere ondersteuning.',
        },
        addBankAccountFailure: 'Er is een onverwachte fout opgetreden bij het toevoegen van je bankrekening. Probeer het opnieuw.',
        getPaidFaster: 'Word sneller betaald',
        addPaymentMethod: 'Voeg een betaalmethode toe om rechtstreeks in de app betalingen te versturen en te ontvangen.',
        getPaidBackFaster: 'Word sneller terugbetaald',
        secureAccessToYourMoney: 'Veilige toegang tot je geld',
        receiveMoney: 'Ontvang geld in je lokale valuta',
        expensifyWallet: 'Expensify Wallet (bèta)',
        sendAndReceiveMoney: 'Stuur en ontvang geld met vrienden. Alleen voor bankrekeningen in de VS.',
        enableWallet: 'Wallet inschakelen',
        addBankAccountToSendAndReceive: 'Voeg een bankrekening toe om betalingen te doen of te ontvangen.',
        addDebitOrCreditCard: 'Debet- of creditcard toevoegen',
        assignedCards: 'Toegewezen kaarten',
        assignedCardsDescription: 'Dit zijn kaarten die door een werkruimtebeheerder zijn toegewezen om de uitgaven van het bedrijf te beheren.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'We controleren je gegevens. Kom over een paar minuten terug!',
        walletActivationFailed: 'Helaas kan je wallet op dit moment niet worden ingeschakeld. Chat alsjeblieft met Concierge voor verdere hulp.',
        addYourBankAccount: 'Bankrekening toevoegen',
        addBankAccountBody: 'Laten we je bankrekening koppelen aan Expensify, zodat het makkelijker dan ooit is om rechtstreeks in de app betalingen te verzenden en te ontvangen.',
        chooseYourBankAccount: 'Kies je bankrekening',
        chooseAccountBody: 'Zorg dat je de juiste selecteert.',
        confirmYourBankAccount: 'Bevestig je bankrekening',
        personalBankAccounts: 'Persoonlijke bankrekeningen',
        businessBankAccounts: 'Zakelijke bankrekeningen',
        shareBankAccount: 'Bankrekening delen',
        bankAccountShared: 'Bankrekening gedeeld',
        shareBankAccountTitle: 'Selecteer de beheerders om deze bankrekening mee te delen:',
        shareBankAccountSuccess: 'Bankrekening gedeeld!',
        shareBankAccountSuccessDescription: 'De geselecteerde beheerders ontvangen een bevestigingsbericht van Concierge.',
        shareBankAccountFailure: 'Er is een onverwachte fout opgetreden tijdens het proberen delen van de bankrekening. Probeer het opnieuw.',
        shareBankAccountEmptyTitle: 'Geen beheerders beschikbaar',
        shareBankAccountEmptyDescription: 'Er zijn geen workspacebeheerders met wie je deze bankrekening kunt delen.',
        shareBankAccountNoAdminsSelected: 'Selecteer een beheerder voordat je doorgaat',
        unshareBankAccount: 'Bankrekening delen opheffen',
        unshareBankAccountDescription:
            'Iedereen hieronder heeft toegang tot deze bankrekening. Je kunt de toegang op elk moment intrekken. We zullen eventuele lopende betalingen alsnog afronden.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) => `${admin} verliest de toegang tot deze zakelijke bankrekening. We ronden nog steeds alle lopende betalingen af.`,
        reachOutForHelp: 'Het wordt gebruikt met de Expensify Card. <concierge-link>Neem contact op met Concierge</concierge-link> als je het moet stoppen met delen.',
        unshareErrorModalTitle: 'Kan bankrekening niet stoppen met delen',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: 'Resterende limiet',
        smartLimit: {
            name: 'Slimme limiet',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Je kunt tot ${formattedLimit} uitgeven met deze kaart, en de limiet wordt opnieuw ingesteld zodra je ingediende onkosten zijn goedgekeurd.`,
        },
        fixedLimit: {
            name: 'Vast limiet',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Je kunt tot ${formattedLimit} uitgeven met deze kaart, daarna wordt deze gedeactiveerd.`,
        },
        monthlyLimit: {
            name: 'Maandlimiet',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Je kunt maximaal ${formattedLimit} per maand uitgeven met deze kaart. De limiet wordt op de 1e dag van elke kalendermaand opnieuw ingesteld.`,
        },
        virtualCardNumber: 'Nummer van virtuele kaart',
        travelCardCvv: 'Reiskaart-CVV',
        physicalCardNumber: 'Fysiek kaartnummer',
        physicalCardPin: 'pincode',
        getPhysicalCard: 'Fysieke kaart aanvragen',
        reportFraud: 'Fraude met virtuele kaart melden',
        reportTravelFraud: 'Reiscardfraude melden',
        reviewTransaction: 'Transactie controleren',
        suspiciousBannerTitle: 'Verdachte transactie',
        suspiciousBannerDescription: 'We hebben verdachte transacties op je kaart opgemerkt. Tik hieronder om ze te bekijken.',
        cardLocked: 'Je kaart is tijdelijk geblokkeerd terwijl ons team het account van je bedrijf beoordeelt.',
        cardDetails: {
            cardNumber: 'Nummer van virtuele kaart',
            expiration: 'Vervaldatum',
            cvv: 'CVV',
            address: 'Adres',
            revealDetails: 'Details weergeven',
            revealCvv: 'CVV tonen',
            copyCardNumber: 'Kaartnummer kopiëren',
            updateAddress: 'Adres bijwerken',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Toegevoegd aan ${platform}-wallet`,
        cardDetailsLoadingFailure: 'Er is een fout opgetreden bij het laden van de kaartgegevens. Controleer je internetverbinding en probeer het opnieuw.',
        validateCardTitle: 'We controleren of jij het bent',
        enterMagicCode: (contactMethod: string) =>
            `Voer de magische code in die naar ${contactMethod} is verzonden om je kaartgegevens te bekijken. Deze zou binnen een of twee minuten moeten aankomen.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) =>
            `Voeg alsjeblieft je <a href="${missingDetailsLink}">persoonlijke gegevens toe</a> en probeer het daarna opnieuw.`,
        unexpectedError: 'Er is een fout opgetreden bij het ophalen van de gegevens van je Expensify-kaart. Probeer het opnieuw.',
        cardFraudAlert: {
            confirmButtonText: 'Ja, dat doe ik',
            reportFraudButtonText: 'Nee, ik was het niet',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `heeft de verdachte activiteit gewist en kaart x${cardLastFour} opnieuw geactiveerd. Je kunt weer gewoon declareren!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `heeft de kaart gedeactiveerd die eindigt op ${cardLastFour}`,
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
            }) => `heeft verdachte activiteit vastgesteld op de kaart die eindigt op ${cardLastFour}. Herken je deze afschrijving?

${amount} voor ${merchant} - ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Uitgaven',
        workflowDescription: 'Configureer een workflow vanaf het moment dat uitgaven plaatsvinden, inclusief goedkeuring en betaling.',
        submissionFrequency: 'Inzendingen',
        submissionFrequencyDescription: 'Kies een aangepast schema voor het indienen van onkosten.',
        submissionFrequencyDateOfMonth: 'Dag van de maand',
        disableApprovalPromptDescription: 'Het uitschakelen van goedkeuringen wist alle bestaande goedkeuringsworkflows.',
        addApprovalsTitle: 'Goedkeuringen',
        addApprovalButton: 'Goedkeuringsworkflow toevoegen',
        addApprovalTip: 'Deze standaardworkflow is van toepassing op alle leden, tenzij er een specifiekere workflow bestaat.',
        approver: 'Fiatteur',
        addApprovalsDescription: 'Extra goedkeuring vereisen voordat je een betaling autoriseert.',
        makeOrTrackPaymentsTitle: 'Betalingen',
        makeOrTrackPaymentsDescription: 'Voeg een gemachtigde betaler toe voor betalingen die in Expensify worden gedaan of volg betalingen die elders zijn gedaan.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Er is een aangepast goedkeuringsproces ingeschakeld voor deze werkruimte. Neem contact op met je <account-manager-link>Accountmanager</account-manager-link> of <concierge-link>Concierge</concierge-link> om dit proces te bekijken of te wijzigen.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Er is een aangepast goedkeuringsproces ingeschakeld in deze workspace. Neem contact op met <concierge-link>Concierge</concierge-link> om dit proces te bekijken of te wijzigen.</muted-text-label>',
        editor: {
            submissionFrequency: 'Kies hoe lang Expensify moet wachten voordat foutloze uitgaven worden gedeeld.',
        },
        frequencyDescription: 'Kies hoe vaak je uitgaven automatisch wilt laten indienen, of maak het handmatig',
        frequencies: {
            instant: 'DirectOnmiddellijk',
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
                other: 'deze',
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
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> keurt al rapporten goed voor <strong>${name2}</strong>. Kies een andere fiatteur om een cirkelvormige workflow te voorkomen.`,
        emptyContent: {
            title: 'Geen leden om weer te geven',
            expensesFromSubtitle: 'Alle werkruimteleden behoren al tot een bestaande goedkeuringsworkflow.',
            approverSubtitle: 'Alle fiatteurs behoren tot een bestaand workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Indien van indienen kon niet worden gewijzigd. Probeer het opnieuw of neem contact op met support.',
        monthlyOffsetErrorMessage: 'De maandfrequentie kon niet worden gewijzigd. Probeer het opnieuw of neem contact op met support.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Bevestigen',
        header: 'Voeg meer beoordelaars toe en bevestig.',
        additionalApprover: 'Extra fiatteur',
        submitButton: 'Workflow toevoegen',
    },
    workflowsEditApprovalsPage: {
        title: 'Goedkeuringsworkflow bewerken',
        deleteTitle: 'Goedkeuringsworkflow verwijderen',
        deletePrompt: 'Weet je zeker dat je deze goedkeuringsworkflow wilt verwijderen? Alle leden zullen daarna de standaardworkflow volgen.',
    },
    workflowsExpensesFromPage: {
        title: 'Onkosten vanaf',
        header: 'Wanneer de volgende leden declaraties indienen:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'De fiatteur kon niet worden gewijzigd. Probeer het opnieuw of neem contact op met support.',
        title: 'Stel fiatteur in',
        description: 'Deze persoon zal de declaraties goedkeuren.',
    },
    workflowsApprovalLimitPage: {
        title: 'Fiatteur',
        header: '(Wanneer u wilt) Goedkeuringslimiet toevoegen?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Voeg een andere fiatteur toe wanneer <strong>${approverName}</strong> fiatteur is en het rapport het onderstaande bedrag overschrijdt:`
                : 'Nog een goedkeurder toevoegen wanneer een rapport het onderstaande bedrag overschrijdt:',
        reportAmountLabel: 'Rapportbedrag',
        additionalApproverLabel: 'Extra fiatteur',
        skip: 'Overslaan',
        next: 'Volgende',
        removeLimit: 'Limiet verwijderen',
        enterAmountError: 'Voer een geldig bedrag in',
        enterApproverError: 'Een autoriseerder is vereist wanneer je een rapportlimiet instelt',
        enterBothError: 'Voer een rapportbedrag en een extra fiatteur in',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) =>
            `Rapporten boven ${approvalLimit} worden doorgestuurd naar ${approverName}`,
    },
    workflowsPayerPage: {
        title: 'Geautoriseerde betaler',
        genericErrorMessage: 'De bevoegde betaler kon niet worden gewijzigd. Probeer het opnieuw.',
        admins: 'Beheerders',
        payer: 'Betaler',
        paymentAccount: 'Betaalrekening',
    },
    reportFraudPage: {
        title: 'Fraude met virtuele kaart melden',
        description:
            'Als de gegevens van je virtuele kaart zijn gestolen of gecompromitteerd, deactiveren we je bestaande kaart permanent en krijg je een nieuwe virtuele kaart met een nieuw nummer.',
        deactivateCard: 'Kaart deactiveren',
        reportVirtualCardFraud: 'Fraude met virtuele kaart melden',
    },
    reportFraudConfirmationPage: {
        title: 'Kaartfraude gemeld',
        description: 'We hebben je bestaande kaart permanent gedeactiveerd. Wanneer je teruggaat om je kaartgegevens te bekijken, is er een nieuwe virtuele kaart beschikbaar.',
        buttonText: 'Begrepen, dank je!',
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
        nameMessage: 'Voer uw voor- en achternaam in, aangezien deze op uw kaart wordt weergegeven.',
        legalName: 'Wettelijke naam',
        legalFirstName: 'Juridische voornaam',
        legalLastName: 'Wettelijke achternaam',
        phoneMessage: 'Voer je telefoonnummer in.',
        phoneNumber: 'Telefoonnummer',
        address: 'Adres',
        addressMessage: 'Voer je verzendadres in.',
        streetAddress: 'Straatadres',
        city: 'Stad',
        state: 'Status',
        zipPostcode: 'Postcode',
        country: 'Land',
        confirmMessage: 'Bevestig hieronder je gegevens.',
        estimatedDeliveryMessage: 'Je fysieke kaart wordt binnen 2–3 werkdagen bezorgd.',
        next: 'Volgende',
        getPhysicalCard: 'Fysieke kaart aanvragen',
        shipCard: 'Kaart verzenden',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Overboeken${amount ? ` ${amount}` : ''}`,
        instant: 'Direct (debitkaart)',
        instantSummary: (rate: string, minAmount: string) => `${rate}% vergoeding (${minAmount} minimum)`,
        ach: '1–3 werkdagen (bankrekening)',
        achSummary: 'Geen kosten',
        whichAccount: 'Welke rekening?',
        fee: 'Kosten',
        transferSuccess: 'Overboeking geslaagd!',
        transferDetailBankAccount: 'Je geld zou binnen 1–3 werkdagen moeten aankomen.',
        transferDetailDebitCard: 'Je geld zou direct moeten aankomen.',
        failedTransfer: 'Je saldo is nog niet volledig vereffend. Maak een overschrijving naar een bankrekening.',
        notHereSubTitle: 'Boek je saldo over vanaf de portemonneepagina',
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
        addFirstPaymentMethod: 'Voeg een betaalmethode toe om rechtstreeks in de app betalingen te versturen en te ontvangen.',
        defaultPaymentMethod: 'Standaard',
        bankAccountLastFour: (lastFour: string) => `Bankrekening • ${lastFour}`,
    },
    expenseRulesPage: {
        title: 'Declaratieregels',
        subtitle: 'Deze regels zijn van toepassing op je uitgaven. Als je naar een workspace indient, kunnen de workspace-regels deze overschrijven.',
        emptyRules: {
            title: 'Je hebt nog geen regels gemaakt',
            subtitle: 'Voeg een regel toe om onkostendeclaraties te automatiseren.',
        },
        changes: {
            billable: (value: boolean) => `Uitgave ${value ? 'factureerbaar' : 'niet-declarabel'} bijwerken`,
            category: (value: string) => `Categorie bijwerken naar "${value}"`,
            comment: (value: string) => `Omschrijving wijzigen in "${value}"`,
            merchant: (value: string) => `Handelaar bijwerken naar ‘${value}’`,
            reimbursable: (value: boolean) => `Declaratie ${value ? 'vergoedbaar' : 'niet-vergoedbaar'} bijwerken`,
            report: (value: string) => `Toevoegen aan een rapport met de naam "${value}"`,
            tag: (value: string) => `Label bijwerken naar "${value}"`,
            tax: (value: string) => `Belastingtarief bijwerken naar ‘${value}’`,
        },
        newRule: 'Nieuwe regel',
        addRule: {
            title: 'Regel toevoegen',
            expenseContains: 'Als de uitgave bevat:',
            applyUpdates: 'Pas deze updates vervolgens toe:',
            merchantHint: 'Typ * om een regel te maken die voor alle leveranciers geldt',
            addToReport: 'Toevoegen aan een rapport met de naam',
            createReport: 'Maak indien nodig een rapport',
            applyToExistingExpenses: 'Toepassen op bestaande overeenkomende declaraties',
            confirmError: 'Voer een handelaar in en pas minimaal één wijziging toe',
            confirmErrorMerchant: 'Voer handelaar in',
            confirmErrorUpdate: 'Pas ten minste één update toe',
            saveRule: 'Regel opslaan',
        },
        editRule: {
            title: 'Regel bewerken',
        },
        deleteRule: {
            deleteSingle: 'Regel verwijderen',
            deleteMultiple: 'Regels verwijderen',
            deleteSinglePrompt: 'Weet je zeker dat je deze regel wilt verwijderen?',
            deleteMultiplePrompt: 'Weet je zeker dat je deze regels wilt verwijderen?',
        },
    },
    preferencesPage: {
        appSection: {
            title: 'App-voorkeuren',
        },
        testSection: {
            title: 'Testvoorkeuren',
            subtitle: 'Instellingen om de app op staging te debuggen en testen.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Ontvang relevante functie-updates en Expensify-nieuws',
        muteAllSounds: 'Alle geluiden van Expensify dempen',
    },
    priorityModePage: {
        priorityMode: 'Prioriteitsmodus',
        explainerText: 'Kies of je je wilt #focussen op alleen ongelezen en vastgezette chats, of alles wilt weergeven met de meest recente en vastgezette chats bovenaan.',
        priorityModes: {
            default: {
                label: 'Meest recent',
                description: 'Toon alle chats, gesorteerd op meest recent',
            },
            gsd: {
                label: '#focus',
                description: 'Alleen ongelezen weergeven, alfabetisch gesorteerd',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
        generatingPDF: 'PDF genereren',
        waitForPDF: 'Een ogenblik geduld terwijl we de pdf genereren.',
        errorPDF: 'Er is een fout opgetreden bij het genereren van je pdf',
        successPDF: 'Je PDF is gegenereerd! Als het niet automatisch is gedownload, gebruik dan de knop hieronder.',
    },
    reportDescriptionPage: {
        roomDescription: 'Kamerbeschrijving',
        roomDescriptionOptional: 'Beschrijving van de ruimte (optioneel)',
        explainerText: 'Stel een eigen beschrijving voor de ruimte in.',
    },
    groupChat: {
        lastMemberTitle: 'Let op!',
        lastMemberWarning: 'Omdat jij de laatste persoon hier bent, wordt deze chat ontoegankelijk voor alle leden als je vertrekt. Weet je zeker dat je wilt vertrekken?',
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
        chooseThemeBelowOrSync: 'Kies een thema hieronder, of synchroniseer met je apparaatinstellingen.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Door in te loggen ga je akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Servicevoorwaarden</a> en het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacybeleid</a>.</muted-text-xs>`,
        license: `<muted-text-xs>Geldtransmissie wordt geleverd door ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) volgens zijn <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenties</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Geen magische code ontvangen?',
        enterAuthenticatorCode: 'Voer uw verificatiecode in',
        enterRecoveryCode: 'Voer uw herstelcode in',
        requiredWhen2FAEnabled: 'Vereist wanneer 2FA is ingeschakeld',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Vraag een nieuwe code aan over <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Nieuwe code aanvragen',
        error: {
            pleaseFillMagicCode: 'Voer je magische code in',
            incorrectMagicCode: 'Onjuiste of ongeldige magische code. Probeer het opnieuw of vraag een nieuwe code aan.',
            pleaseFillTwoFactorAuth: 'Voer uw tweeledige verificatiecode in',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Vul alle velden in',
        pleaseFillPassword: 'Voer uw wachtwoord in',
        pleaseFillTwoFactorAuth: 'Voer uw tweestapsverificatiecode in',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Voer je twee-factor-authenticatiecode in om door te gaan',
        forgot: 'Vergeten?',
        requiredWhen2FAEnabled: 'Vereist wanneer 2FA is ingeschakeld',
        error: {
            incorrectPassword: 'Onjuist wachtwoord. Probeer het opnieuw.',
            incorrectLoginOrPassword: 'Onjuiste gebruikersnaam of wachtwoord. Probeer het opnieuw.',
            incorrect2fa: 'Onjuiste code voor twee-factor-authenticatie. Probeer het opnieuw.',
            twoFactorAuthenticationEnabled: 'Je hebt 2FA ingeschakeld voor dit account. Meld je aan met je e-mailadres of telefoonnummer.',
            invalidLoginOrPassword: 'Ongeldige inlognaam of wachtwoord. Probeer het opnieuw of reset uw wachtwoord.',
            unableToResetPassword:
                'We konden je wachtwoord niet wijzigen. Dit komt waarschijnlijk door een verlopen wachtwoordherstelslink in een oude e-mail voor wachtwoordherstel. We hebben je een nieuwe link gemaild, zodat je het opnieuw kunt proberen. Controleer je inbox en je spammap; de e-mail zou binnen enkele minuten moeten aankomen.',
            noAccess: 'Je hebt geen toegang tot deze applicatie. Voeg je GitHub-gebruikersnaam toe om toegang te krijgen.',
            accountLocked: 'Je account is vergrendeld na te veel mislukte pogingen. Probeer het over 1 uur opnieuw.',
            fallback: 'Er is iets misgegaan. Probeer het later opnieuw.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefoonnummer of e-mailadres',
        error: {
            invalidFormatEmailLogin: 'Het ingevoerde e-mailadres is ongeldig. Corrigeer het formaat en probeer het opnieuw.',
        },
        cannotGetAccountDetails: 'Kon accountgegevens niet ophalen. Probeer opnieuw in te loggen.',
        loginForm: 'Aanmeldformulier',
        notYou: ({user}: NotYouParams) => `Niet ${user}?`,
    },
    onboarding: {
        welcome: 'Welkom!',
        welcomeSignOffTitleManageTeam: 'Zodra je de bovenstaande taken hebt voltooid, kunnen we meer functionaliteit verkennen, zoals goedkeuringsworkflows en regels!',
        welcomeSignOffTitle: 'Leuk om je te ontmoeten!',
        explanationModal: {
            title: 'Welkom bij Expensify',
            description:
                'Eén app om je zakelijke en persoonlijke uitgaven af te handelen met de snelheid van chat. Probeer het uit en laat ons weten wat je ervan vindt. Er komt nog veel meer aan!',
            secondaryDescription: 'Om terug te schakelen naar Expensify Classic, tik je gewoon op je profielfoto > Ga naar Expensify Classic.',
        },
        getStarted: 'Aan de slag',
        whatsYourName: 'Hoe heet je?',
        peopleYouMayKnow: 'Mensen die je misschien kent, zijn hier al! Verifieer je e-mailadres om je bij hen aan te sluiten.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Iemand van ${domain} heeft al een werkruimte aangemaakt. Voer de magische code in die is verzonden naar ${email}.`,
        joinAWorkspace: 'Deelnemen aan een werkruimte',
        listOfWorkspaces: 'Hier is de lijst met werkruimtes waaraan je kunt deelnemen. Maak je geen zorgen, je kunt je er altijd later nog bij aansluiten als je dat liever hebt.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} lid${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Waar werk je?',
        errorSelection: 'Selecteer een optie om verder te gaan',
        purpose: {
            title: 'Wat wil je vandaag doen?',
            errorContinue: 'Druk op ‘Doorgaan’ om de installatie te voltooien',
            errorBackButton: 'Beantwoord eerst de instelvragen om de app te kunnen gebruiken',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Door mijn werkgever worden terugbetaald',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Beheer de uitgaven van mijn team',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Uitgaven bijhouden en budgetteren',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chat en splits onkosten met vrienden',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Iets anders',
        },
        employees: {
            title: 'Hoeveel werknemers heeft u?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1–10 medewerkers',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 medewerkers',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 medewerkers',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1.000 werknemers',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Meer dan 1.000 werknemers',
        },
        accounting: {
            title: 'Gebruikt u boekhoudsoftware?',
            none: 'Geen',
        },
        interestedFeatures: {
            title: 'In welke functies ben je geïnteresseerd?',
            featuresAlreadyEnabled: 'Dit zijn onze populairste functies:',
            featureYouMayBeInterestedIn: 'Extra functies inschakelen:',
        },
        error: {
            requiredFirstName: 'Voer uw voornaam in om door te gaan',
        },
        workEmail: {
            title: 'Wat is je zakelijke e-mailadres?',
            subtitle: 'Expensify werkt het best wanneer je je werk-e-mailadres koppelt.',
            explanationModal: {
                descriptionOne: 'Doorsturen naar receipts@expensify.com voor scannen',
                descriptionTwo: 'Sluit je aan bij je collega’s die Expensify al gebruiken',
                descriptionThree: 'Geniet van een meer gepersonaliseerde ervaring',
            },
            addWorkEmail: 'Werkmail toevoegen',
        },
        workEmailValidation: {
            title: 'Verifieer je werkmailadres',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Voer de magische code in die naar ${workEmail} is gestuurd. Deze zou binnen een of twee minuten moeten aankomen.`,
        },
        workEmailValidationError: {
            publicEmail: 'Voer een geldig werk-e-mailadres van een privédomein in, bijv. mitch@company.com',
            offline: 'We konden je werkmail niet toevoegen omdat je offline lijkt te zijn',
        },
        mergeBlockScreen: {
            title: 'Werkmail kon niet worden toegevoegd',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) => `We konden ${workEmail} niet toevoegen. Probeer het later opnieuw in Instellingen of chat met Concierge voor hulp.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Maak een [proefrit](${testDriveURL})`,
                description: ({testDriveURL}) => `[Maak een korte producttour](${testDriveURL}) om te zien waarom Expensify de snelste manier is om je declaraties te doen.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Maak een [proefrit](${testDriveURL})`,
                description: ({testDriveURL}) => `Maak een [proefrit](${testDriveURL}) met ons en geef je team *3 gratis maanden Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Voeg onkostengoedkeuringen toe',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Voeg onkostengoedkeuringen toe* om de uitgaven van je team te controleren en onder controle te houden.

                        Zo doe je dat:

                        1. Ga naar *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *More features*.
                        4. Schakel *Workflows* in.
                        5. Ga naar *Workflows* in de workspace-editor.
                        6. Schakel *Add approvals* in.
                        7. Jij wordt ingesteld als de onkostengoedkeurder. Je kunt dit wijzigen naar een andere beheerder zodra je je team uitnodigt.

                        [Breng me naar More features](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Maak](${workspaceConfirmationLink}) een workspace`,
                description: 'Maak een werkruimte en configureer de instellingen met hulp van je installatiespecialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Een [werkruimte maken](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Maak een workspace* om uitgaven bij te houden, bonnetjes te scannen, chatten en meer.

                        1. Klik op *Workspaces* > *Nieuwe workspace*.

                        *Je nieuwe workspace is klaar!* [Bekijk ’m](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[Categorieën](${workspaceCategoriesLink}) instellen`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Stel categorieën in* zodat je team uitgaven kan coderen voor eenvoudige rapportage.

                        1. Klik op *Werkruimtes*.
                        2. Selecteer je werkruimte.
                        3. Klik op *Categorieën*.
                        4. Schakel alle categorieën uit die je niet nodig hebt.
                        5. Voeg je eigen categorieën toe rechtsboven.

                        [Breng me naar de categorie-instellingen van de werkruimte](${workspaceCategoriesLink}).

                        ![Categorieën instellen](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Een uitgave indienen',
                description: dedent(`
                    *Dien een uitgave in* door een bedrag in te voeren of een bon te scannen.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Uitgave maken*.
                    3. Voer een bedrag in of scan een bon.
                    4. Voeg het e‑mailadres of telefoonnummer van je baas toe.
                    5. Klik op *Maken*.

                    En je bent klaar!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Een uitgave indienen',
                description: dedent(`
                    *Dien een uitgave in* door een bedrag in te voeren of een bon te scannen.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Uitgave aanmaken*.
                    3. Voer een bedrag in of scan een bon.
                    4. Bevestig de details.
                    5. Klik op *Aanmaken*.

                    En je bent klaar!
                `),
            },
            trackExpenseTask: {
                title: 'Een uitgave bijhouden',
                description: dedent(`
                    *Volg een uitgave* in elke valuta, of je nu een bon hebt of niet.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Uitgave aanmaken*.
                    3. Voer een bedrag in of scan een bon.
                    4. Kies je *persoonlijke* ruimte.
                    5. Klik op *Aanmaken*.

                    En je bent klaar! Ja, zo makkelijk is het.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Verbind${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'naar'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'je' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Verbind ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'je' : 'naar'} ${integrationName} voor automatische kosten­codering en synchronisatie, zodat de maandafsluiting heel eenvoudig wordt.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *Accounting*.
                        4. Zoek ${integrationName}.
                        5. Klik op *Connect*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? `[Breng me naar de boekhouding](${workspaceAccountingLink}).

                        ![Verbind met ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
        : `[Breng me naar boekhouding](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Koppel [je zakelijke kaarten](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Koppel de kaarten die je al hebt voor automatische transactie-import, bonkoppeling en afstemming.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *Company cards*.
                        4. Volg de stappen om je kaarten te koppelen.

                        [Breng me naar company cards](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Nodig [je team](${workspaceMembersLink}) uit`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Nodig je team uit* voor Expensify zodat ze vandaag nog met het bijhouden van uitgaven kunnen beginnen.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *Members* > *Invite member*.
                        4. Voer e-mails of telefoonnummers in.
                        5. Voeg een aangepast uitnodigingsbericht toe als je dat wilt!

                        [Breng me naar de workspace-leden](${workspaceMembersLink}).

                        ![Nodig je team uit](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Stel [categorieën](${workspaceCategoriesLink}) en [labels](${workspaceTagsLink}) in`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Stel categorieën en labels in* zodat je team uitgaven kan coderen voor eenvoudige rapportage.

                        Importeer ze automatisch door [je boekhoudsoftware te koppelen](${workspaceAccountingLink}), of stel ze handmatig in via je [werkruimte-instellingen](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Stel [tags](${workspaceTagsLink}) in`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Gebruik tags om extra details aan je uitgaven toe te voegen, zoals projecten, klanten, locaties en afdelingen. Als je meerdere niveaus van tags nodig hebt, kun je upgraden naar het Control-abonnement.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *More features*.
                        4. Schakel *Tags* in.
                        5. Ga in de workspace-editor naar *Tags*.
                        6. Klik op *+ Add tag* om je eigen tag te maken.

                        [Breng me naar More features](${workspaceMoreFeaturesLink}).

                        ![Tags instellen](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Nodig je [accountant](${workspaceMembersLink}) uit`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Nodig je boekhouder uit* om samen te werken in je workspace en je zakelijke uitgaven te beheren.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *Members*.
                        4. Klik op *Invite member*.
                        5. Voer het e-mailadres van je boekhouder in.

                        [Nodig je boekhouder nu uit](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Een chat starten',
                description: dedent(`
                    *Begin een chat* met iedereen via hun e‑mailadres of telefoonnummer.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Chat beginnen*.
                    3. Voer een e‑mailadres of telefoonnummer in.

                    Als ze Expensify nog niet gebruiken, worden ze automatisch uitgenodigd.

                    Elke chat wordt ook omgezet in een e‑mail of sms waar ze direct op kunnen reageren.
                `),
            },
            splitExpenseTask: {
                title: 'Een uitgave splitsen',
                description: dedent(`
                    *Deel uitgaven* met één of meer personen.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Chat starten*.
                    3. Voer e-mailadressen of telefoonnummers in.
                    4. Klik in de chat op de grijze *+*-knop > *Uitgave delen*.
                    5. Maak de uitgave aan door *Handmatig*, *Scan* of *Afstand* te selecteren.

                    Voeg gerust meer details toe als je wilt, of verstuur het gewoon meteen. Zo word je snel terugbetaald!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Controleer je [werkruimteininstellingen](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Zo kun je de instellingen van je workspace bekijken en bijwerken:
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
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Maak een [proefrit](${testDriveURL})` : 'Maak een proefrit'),
            embeddedDemoIframeTitle: 'Proefrit',
            employeeFakeReceipt: {
                description: 'Mijn testritbon!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Terugbetaald worden is net zo eenvoudig als het versturen van een bericht. Laten we de basis doornemen.',
            onboardingPersonalSpendMessage: 'Zo houd je je uitgaven bij in slechts een paar klikken.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Je gratis proefperiode is gestart! Laten we je account instellen.
                        👋 Hoi, ik ben jouw Expensify-specialist voor de inrichting. Ik heb alvast een workspace aangemaakt om de bonnen en uitgaven van je team te beheren. Volg de laatste stappen hieronder om alles uit je gratis proefperiode van 30 dagen te halen!
                    `)
                    : dedent(`
                        # Je gratis proefperiode is gestart! Laten we je instellen.
                        👋 Hoi, ik ben je Expensify-instellingsspecialist. Nu je een werkruimte hebt aangemaakt, haal het meeste uit je gratis proefperiode van 30 dagen door de onderstaande stappen te volgen!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Laten we je instellen\n👋 Hoi, ik ben je Expensify-installatiespecialist. Ik heb al een werkruimte aangemaakt om je bonnetjes en uitgaven te beheren. Volg de laatste configuratiestappen hieronder om het meeste uit je gratis proefperiode van 30 dagen te halen!',
            onboardingChatSplitMessage: 'Rekeningen splitsen met vrienden is net zo eenvoudig als het versturen van een bericht. Zo werkt het.',
            onboardingAdminMessage: 'Leer hoe je als beheerder de werkruimte van je team beheert en je eigen uitgaven indient.',
            onboardingLookingAroundMessage:
                'Expensify staat vooral bekend om onkosten-, reis- en zakelijke kaartbeheer, maar we doen nog veel meer dan dat. Laat me weten waarin je geïnteresseerd bent, dan help ik je op weg.',
            onboardingTestDriveReceiverMessage: '*Je krijgt 3 maanden gratis! Ga hieronder aan de slag.*',
        },
        workspace: {
            title: 'Blijf georganiseerd met een werkruimte',
            subtitle: 'Ontgrendel krachtige tools om je onkostbeheer te vereenvoudigen, allemaal op één plek. Met een werkruimte kun je:',
            explanationModal: {
                descriptionOne: 'Bonnen bijhouden en ordenen',
                descriptionTwo: 'Categoriseer en tag uitgaven',
                descriptionThree: 'Rapporten maken en delen',
            },
            price: 'Probeer het 30 dagen gratis, upgrade daarna voor slechts <strong>$5/gebruiker/maand</strong>.',
            createWorkspace: 'Werkruimte maken',
        },
        confirmWorkspace: {
            title: 'Werkruimte bevestigen',
            subtitle: 'Maak een workspace om bonnen bij te houden, onkosten te vergoeden, reizen te beheren, rapporten te maken en meer — allemaal op de snelheid van chat.',
        },
        inviteMembers: {
            title: 'Leden uitnodigen',
            subtitle: 'Voeg je team toe of nodig je/of je boekhouder uit. Hoe meer zielen, hoe meer vreugd!',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Laat dit niet meer zien',
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: 'Naam mag geen speciale tekens bevatten',
            containsReservedWord: 'Naam mag de woorden Expensify of Concierge niet bevatten',
            hasInvalidCharacter: 'Naam mag geen komma of puntkomma bevatten',
            requiredFirstName: 'Voornaam mag niet leeg zijn',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Wat is je officiële naam?',
        enterDateOfBirth: 'Wat is je geboortedatum?',
        enterAddress: 'Wat is je adres?',
        enterPhoneNumber: 'Wat is je telefoonnummer?',
        personalDetails: 'Persoonlijke gegevens',
        privateDataMessage: 'Deze gegevens worden gebruikt voor reizen en betalingen. Ze worden nooit weergegeven op je openbare profiel.',
        legalName: 'Wettelijke naam',
        legalFirstName: 'Juridische voornaam',
        legalLastName: 'Wettelijke achternaam',
        address: 'Adres',
        error: {
            dateShouldBeBefore: (dateString: string) => `Datum moet vóór ${dateString} zijn`,
            dateShouldBeAfter: (dateString: string) => `Datum moet na ${dateString} liggen`,
            hasInvalidCharacter: 'Naam mag alleen Latijnse tekens bevatten',
            incorrectZipFormat: (zipFormat?: string) => `Ongeldig postcodeformaat${zipFormat ? `Acceptabel formaat: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Zorg ervoor dat het telefoonnummer geldig is (bijv. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link is opnieuw verzonden',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `Ik heb een magische inloglink naar ${login} gestuurd. Controleer je ${loginType} om in te loggen.`,
        resendLink: 'Link opnieuw verzenden',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Om ${secondaryLogin} te valideren, stuur de magische code dan opnieuw vanuit de Accountinstellingen van ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Als je geen toegang meer hebt tot ${primaryLogin}, ontkoppel dan je accounts.`,
        unlink: 'Koppeling verbreken',
        linkSent: 'Link verzonden!',
        successfullyUnlinkedLogin: 'Secundaire login is succesvol ontkoppeld!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Onze e-mailprovider heeft e-mails naar ${login} tijdelijk geblokkeerd wegens bezorgingsproblemen. Volg deze stappen om je login te deblokkeren:`,
        confirmThat: (login: string) =>
            `<strong>Bevestig dat ${login} correct gespeld is en een echt, bezorgbaar e-mailadres is.</strong> E-mailaliassen zoals "expenses@domain.com" moeten toegang hebben tot hun eigen e-mailinbox om een geldige Expensify-login te zijn.`,
        ensureYourEmailClient: `<strong>Zorg dat je e-mailclient e-mails van expensify.com toestaat.</strong> Je kunt <a href="${CONST.SET_NOTIFICATION_LINK}">hier</a> instructies vinden over hoe je deze stap voltooit, maar mogelijk heb je hulp van je IT-afdeling nodig om je e-mailinstellingen te configureren.`,
        onceTheAbove: `Zodra je de bovenstaande stappen hebt voltooid, neem dan contact op met <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> om je login te deblokkeren.`,
    },
    openAppFailureModal: {
        title: 'Er ging iets mis...',
        subtitle: `We hebben niet al je gegevens kunnen laden. We zijn hiervan op de hoogte gebracht en onderzoeken het probleem. Als dit aanhoudt, neem dan contact op met`,
        refreshAndTryAgain: 'Vernieuw en probeer het opnieuw',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `We kunnen geen sms-berichten afleveren aan ${login}, dus we hebben deze tijdelijk geblokkeerd. Probeer je nummer te valideren:`,
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
        addToGroup: 'Aan groep toevoegen',
    },
    yearPickerPage: {
        year: 'Jaar',
        selectYear: 'Selecteer een jaar',
    },
    focusModeUpdateModal: {
        title: 'Welkom bij de #focus-modus!',
        prompt: (priorityModePageUrl: string) =>
            `Blijf overzicht houden door alleen ongelezen chats of chats die je aandacht nodig hebben te zien. Maak je geen zorgen, je kunt dit op elk moment wijzigen in de <a href="${priorityModePageUrl}">instellingen</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'De chat waar je naar zoekt, kan niet worden gevonden.',
        getMeOutOfHere: 'Haal me hier weg',
        iouReportNotFound: 'De betalingsgegevens waar je naar zoekt, kunnen niet worden gevonden.',
        notHere: 'Hmm... het is er niet',
        pageNotFound: 'Oeps, deze pagina kan niet worden gevonden',
        noAccess: 'Deze chat of uitgave is mogelijk verwijderd of je hebt er geen toegang toe.\n\nVoor vragen kun je contact opnemen met concierge@expensify.com',
        goBackHome: 'Ga terug naar de startpagina',
        commentYouLookingForCannotBeFound: 'De opmerking waar je naar zoekt, kan niet worden gevonden.',
        goToChatInstead: 'Ga in plaats daarvan naar de chat.',
        contactConcierge: 'Voor vragen kunt u contact opnemen met concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Oeps... er is iets misgegaan ${isBreakLine ? '\n' : ''}`,
        subtitle: 'Je verzoek kon niet worden voltooid. Probeer het later opnieuw.',
        wrongTypeSubtitle: 'Die zoekopdracht is niet geldig. Probeer je zoekcriteria aan te passen.',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Voeg een emoji toe zodat je collega’s en vrienden eenvoudig kunnen zien wat er aan de hand is. Je kunt er ook nog een bericht bij zetten.',
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
        vacationDelegate: 'Vakantieplaatsvervanger',
        setVacationDelegate: `Stel een vervanger in om rapporten namens jou goed te keuren terwijl je afwezig bent.`,
        vacationDelegateError: 'Er is een fout opgetreden bij het bijwerken van je vakantiemandataris.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `als ${nameOrEmail}'s vervanger tijdens vakantie`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `aan ${submittedToName} als verlofgedelegeerde voor ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Je wijst ${nameOrEmail} aan als je vervanger tijdens je vakantie. Diegene zit nog niet in al je werkruimtes. Als je doorgaat, wordt er een e-mail naar alle beheerders van je werkruimtes gestuurd om diegene toe te voegen.`,
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
        manuallyAdd: 'Bankrekening handmatig toevoegen',
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        accountEnding: 'Rekening eindigend op',
        thisBankAccount: 'Deze bankrekening wordt gebruikt voor zakelijke betalingen in je werkruimte',
        accountNumber: 'Rekeningnummer',
        routingNumber: 'Routingnummer',
        chooseAnAccountBelow: 'Kies een account hieronder',
        addBankAccount: 'Bankrekening toevoegen',
        chooseAnAccount: 'Kies een account',
        connectOnlineWithPlaid: 'Log in bij je bank',
        connectManually: 'Handmatig verbinden',
        desktopConnection: 'Opmerking: om verbinding te maken met Chase, Wells Fargo, Capital One of Bank of America, klik hier om dit proces in een browser te voltooien.',
        yourDataIsSecure: 'Je gegevens zijn veilig',
        toGetStarted: 'Voeg een bankrekening toe om onkosten terug te betalen, Expensify Cards uit te geven, factuurbetalingen te innen en rekeningen te betalen, allemaal vanaf één plaats.',
        plaidBodyCopy: 'Geef je medewerkers een eenvoudigere manier om bedrijfskosten te betalen – en terugbetaald te worden.',
        checkHelpLine: 'Uw routenummer en rekeningnummer vindt u op een cheque voor de rekening.',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Om een bankrekening te koppelen, <a href="${contactMethodRoute}">voeg een e-mailadres toe als je primaire login</a> en probeer het opnieuw. Je kunt je telefoonnummer als secundaire login toevoegen.`,
        hasBeenThrottledError: 'Er is een fout opgetreden bij het toevoegen van je bankrekening. Wacht een paar minuten en probeer het opnieuw.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Oeps! Het lijkt erop dat de valuta van je werkruimte is ingesteld op een andere valuta dan USD. Ga naar <a href="${workspaceRoute}">je werkruimte-instellingen</a> om deze op USD in te stellen en probeer het daarna opnieuw.`,
        bbaAdded: 'Zakelijke bankrekening toegevoegd!',
        bbaAddedDescription: 'Het is klaar om voor betalingen te worden gebruikt.',
        error: {
            youNeedToSelectAnOption: 'Selecteer een optie om verder te gaan',
            noBankAccountAvailable: 'Sorry, er is geen bankrekening beschikbaar',
            noBankAccountSelected: 'Kies een account alstublieft',
            taxID: 'Voer een geldig btw-identificatienummer in',
            website: 'Voer een geldige website in',
            zipCode: `Voer een geldige postcode in met het volgende formaat: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Voer een geldig telefoonnummer in',
            email: 'Voer een geldig e-mailadres in',
            companyName: 'Voer een geldige bedrijfsnaam in',
            addressCity: 'Voer een geldige plaats in',
            addressStreet: 'Voer een geldig straatadres in',
            addressState: 'Selecteer een geldige staat',
            incorporationDateFuture: 'De oprichtingsdatum mag niet in de toekomst liggen',
            incorporationState: 'Selecteer een geldige staat',
            industryCode: 'Voer een geldige industrieclassificatiecode met zes cijfers in',
            restrictedBusiness: 'Bevestig alsjeblieft dat het bedrijf niet op de lijst met beperkte bedrijven staat',
            routingNumber: 'Voer een geldig routeringsnummer in',
            accountNumber: 'Voer een geldig rekeningnummer in',
            routingAndAccountNumberCannotBeSame: 'Routing- en rekeningnummers mogen niet hetzelfde zijn',
            companyType: 'Selecteer een geldig bedrijfstype',
            tooManyAttempts: 'Vanwege een groot aantal inlogpogingen is deze optie voor 24 uur uitgeschakeld. Probeer het later opnieuw of voer de gegevens in plaats daarvan handmatig in.',
            address: 'Voer een geldig adres in',
            dob: 'Selecteer een geldige geboortedatum',
            age: 'Moet ouder dan 18 jaar zijn',
            ssnLast4: 'Voer de laatste 4 cijfers van een geldig SSN in',
            firstName: 'Voer een geldige voornaam in',
            lastName: 'Voer een geldige achternaam in',
            noDefaultDepositAccountOrDebitCardAvailable: 'Voeg een standaardstortingsrekening of betaalpas toe',
            validationAmounts: 'De verificatiebedragen die je hebt ingevoerd kloppen niet. Controleer je bankafschrift en probeer het opnieuw.',
            fullName: 'Voer een geldige volledige naam in',
            ownershipPercentage: 'Voer een geldig percentage in',
            deletePaymentBankAccount:
                'Deze bankrekening kan niet worden verwijderd omdat deze wordt gebruikt voor Expensify Card-betalingen. Als je deze rekening toch wilt verwijderen, neem dan contact op met Concierge.',
            sameDepositAndWithdrawalAccount: 'De stortings- en opnamerekeningen zijn hetzelfde.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Waar bevindt zich je bankrekening?',
        accountDetailsStepHeader: 'Wat zijn je accountgegevens?',
        accountTypeStepHeader: 'Wat voor soort rekening is dit?',
        bankInformationStepHeader: 'Wat zijn je bankgegevens?',
        accountHolderInformationStepHeader: 'Wat zijn de gegevens van de rekeninghouder?',
        howDoWeProtectYourData: 'Hoe beschermen we jouw gegevens?',
        currencyHeader: 'Wat is de valuta van je bankrekening?',
        confirmationStepHeader: 'Controleer je gegevens.',
        confirmationStepSubHeader: 'Controleer de onderstaande gegevens nogmaals en vink het vakje met de voorwaarden aan om te bevestigen.',
        toGetStarted: 'Voeg een persoonlijke bankrekening toe om terugbetalingen te ontvangen, facturen te betalen of de Expensify Wallet in te schakelen.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Voer Expensify-wachtwoord in',
        alreadyAdded: 'Deze account is al toegevoegd.',
        chooseAccountLabel: 'Account',
        successTitle: 'Persoonlijke bankrekening toegevoegd!',
        successMessage: 'Gefeliciteerd, je bankrekening is ingesteld en klaar om terugbetalingen te ontvangen.',
    },
    attachmentView: {
        unknownFilename: 'Onbekende bestandsnaam',
        passwordRequired: 'Voer een wachtwoord in',
        passwordIncorrect: 'Onjuist wachtwoord. Probeer het opnieuw.',
        failedToLoadPDF: 'PDF-bestand laden mislukt',
        pdfPasswordForm: {
            title: 'Met wachtwoord beveiligde pdf',
            infoText: 'Deze pdf is met een wachtwoord beveiligd.',
            beforeLinkText: 'Alstublieft',
            linkText: 'voer het wachtwoord in',
            afterLinkText: 'om het te bekijken.',
            formLabel: 'PDF weergeven',
        },
        attachmentNotFound: 'Bijlage niet gevonden',
        retry: 'Opnieuw proberen',
    },
    messages: {
        errorMessageInvalidPhone: `Voer een geldig telefoonnummer in zonder haakjes of streepjes. Als je buiten de VS bent, voeg dan je landnummer toe (bijv. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Ongeldig e-mailadres',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} is al lid van ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} is al een beheerder van ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Door door te gaan met het verzoek om je Expensify Wallet te activeren, bevestig je dat je het volgende hebt gelezen, begrepen en accepteert',
        facialScan: 'Beleid en vrijgave voor gezichtsherkenning van Onfido',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido’s beleid en vrijgave voor gezichtsherkenning</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacy</a> en <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Servicevoorwaarden</a>.</muted-text-micro>`,
        tryAgain: 'Probeer opnieuw',
        verifyIdentity: 'Identiteit verifiëren',
        letsVerifyIdentity: 'Laten we je identiteit verifiëren',
        butFirst: `Maar eerst het saaie gedeelte. Lees in de volgende stap de juridische tekst door en klik op ‘Accepteren’ wanneer je er klaar voor bent.`,
        genericError: 'Er is een fout opgetreden bij het verwerken van deze stap. Probeer het opnieuw.',
        cameraPermissionsNotGranted: 'Camera-toegang inschakelen',
        cameraRequestMessage: 'We hebben toegang tot je camera nodig om de bankrekeningverificatie te voltooien. Schakel dit in via Instellingen > New Expensify.',
        microphonePermissionsNotGranted: 'Microfoontoegang inschakelen',
        microphoneRequestMessage: 'We hebben toegang tot je microfoon nodig om de bankrekeningverificatie te voltooien. Schakel dit in via Instellingen > New Expensify.',
        originalDocumentNeeded: 'Upload alstublieft een originele foto van uw ID in plaats van een screenshot of een gescande afbeelding.',
        documentNeedsBetterQuality:
            'Uw identiteitsbewijs lijkt beschadigd te zijn of mist beveiligingskenmerken. Upload alstublieft een originele afbeelding van een onbeschadigd identiteitsbewijs dat volledig zichtbaar is.',
        imageNeedsBetterQuality:
            'Er is een probleem met de beeldkwaliteit van je identiteitsbewijs. Upload alsjeblieft een nieuwe afbeelding waarop je volledige identiteitsbewijs duidelijk zichtbaar is.',
        selfieIssue: 'Er is een probleem met je selfie/video. Upload alsjeblieft een live selfie/video.',
        selfieNotMatching: 'Je selfie/video komt niet overeen met je identiteitsbewijs. Upload een nieuwe selfie/video waarop je gezicht duidelijk zichtbaar is.',
        selfieNotLive: 'Je selfie/video lijkt geen livefoto/-video te zijn. Upload alsjeblieft een live selfie/video.',
    },
    additionalDetailsStep: {
        headerTitle: 'Aanvullende details',
        helpText: 'We moeten de volgende informatie bevestigen voordat je geld kunt versturen en ontvangen vanuit je wallet.',
        helpTextIdologyQuestions: 'We moeten u nog maar een paar vragen stellen om de verificatie van uw identiteit af te ronden.',
        helpLink: 'Lees waarom we dit nodig hebben.',
        legalFirstNameLabel: 'Juridische voornaam',
        legalMiddleNameLabel: 'Officiële tweede voornaam',
        legalLastNameLabel: 'Wettelijke achternaam',
        selectAnswer: 'Selecteer een antwoord om door te gaan',
        ssnFull9Error: 'Voer een geldig sofinummer van negen cijfers in',
        needSSNFull9: 'We hebben moeite om uw sofinummer te verifiëren. Voer alstublieft alle negen cijfers van uw sofinummer in.',
        weCouldNotVerify: 'We konden dit niet verifiëren',
        pleaseFixIt: 'Corrigeer deze informatie voordat je doorgaat',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `We konden je identiteit niet verifiëren. Probeer het later opnieuw of neem contact op met <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> als je vragen hebt.`,
    },
    termsStep: {
        headerTitle: 'Voorwaarden en kosten',
        headerTitleRefactor: 'Kosten en voorwaarden',
        haveReadAndAgreePlain: 'Ik heb dit gelezen en ga ermee akkoord elektronische toelichtingen te ontvangen.',
        haveReadAndAgree: `Ik heb gelezen en ga akkoord met het ontvangen van <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">elektronische bekendmakingen</a>.`,
        agreeToThePlain: 'Ik ga akkoord met het privacy- en walletbeleid.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Ik ga akkoord met het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacybeleid</a> en de <a href="${walletAgreementUrl}">Wallet-overeenkomst</a>.`,
        enablePayments: 'Betalingen inschakelen',
        monthlyFee: 'Maandelijkse bijdrage',
        inactivity: 'Inactiviteit',
        noOverdraftOrCredit: 'Geen mogelijkheid tot roodstand/krediet.',
        electronicFundsWithdrawal: 'Elektronische geldopname',
        standard: 'Standaard',
        reviewTheFees: 'Bekijk enkele vergoedingen.',
        checkTheBoxes: 'Vink de onderstaande vakjes aan.',
        agreeToTerms: 'Ga akkoord met de voorwaarden en je bent klaar om te gaan!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `De Expensify Wallet wordt uitgegeven door ${walletProgram}.`,
            perPurchase: 'Per aankoop',
            atmWithdrawal: 'Geldopname bij geldautomaat',
            cashReload: 'Contant herladen',
            inNetwork: 'binnen netwerk',
            outOfNetwork: 'buiten netwerk',
            atmBalanceInquiry: 'Saldo-opvraag bij geldautomaat (binnen of buiten het netwerk)',
            customerService: 'Klantenservice (geautomatiseerd of live medewerker)',
            inactivityAfterTwelveMonths: 'Inactiviteit (na 12 maanden zonder transacties)',
            weChargeOneFee: 'We brengen 1 ander type vergoeding in rekening. Dat is:',
            fdicInsurance: 'Uw tegoeden komen in aanmerking voor FDIC-verzekering.',
            generalInfo: `Voor algemene informatie over prepaidrekeningen gaat u naar <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Voor details en voorwaarden voor alle kosten en diensten, ga naar <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> of bel +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektronische fondsenafschrijving (direct)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min. ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Een lijst van alle Expensify Wallet-kosten',
            typeOfFeeHeader: 'Alle kosten',
            feeAmountHeader: 'Bedrag',
            moreDetailsHeader: 'Details',
            openingAccountTitle: 'Een rekening openen',
            openingAccountDetails: 'Er zijn geen kosten om een rekening te openen.',
            monthlyFeeDetails: 'Er zijn geen maandelijkse kosten.',
            customerServiceTitle: 'Klantenservice',
            customerServiceDetails: 'Er zijn geen kosten voor klantenservice.',
            inactivityDetails: 'Er is geen inactiviteitsvergoeding.',
            sendingFundsTitle: 'Geld verzenden naar een andere rekeninghouder',
            sendingFundsDetails: 'Er worden geen kosten in rekening gebracht om geld naar een andere rekeninghouder te sturen met je saldo, bankrekening of betaalpas.',
            electronicFundsStandardDetails:
                'Er worden geen kosten in rekening gebracht om geld van je Expensify Wallet naar je bankrekening over te maken met de standaardoptie. Deze overboeking is meestal binnen 1–3 werkdagen voltooid.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Er worden kosten in rekening gebracht om geld van je Expensify Wallet naar je gekoppelde betaalpas over te maken met de optie voor directe overboeking. Deze overboeking wordt meestal binnen enkele minuten voltooid.' +
                `De vergoeding is ${percentage}% van het over te maken bedrag (met een minimale vergoeding van ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Je geld komt in aanmerking voor FDIC-verzekering. Je geld wordt aangehouden bij of overgemaakt naar ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, een instelling die is verzekerd door de FDIC.` +
                `Zodra het geld daar staat, is het tot ${amount} verzekerd door de FDIC als ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} failliet gaat, mits aan specifieke vereisten voor depositoverzekering is voldaan en je kaart is geregistreerd. Zie ${CONST.TERMS.FDIC_PREPAID} voor meer details.`,
            contactExpensifyPayments: `Neem contact op met ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} door te bellen naar +1 833-400-0904, per e-mail via ${CONST.EMAIL.CONCIERGE}, of meld u aan op ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Ga voor algemene informatie over prepaidrekeningen naar ${CONST.TERMS.CFPB_PREPAID}. Als u een klacht heeft over een prepaidrekening, bel dan het Consumer Financial Protection Bureau op 1-855-411-2372 of ga naar ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Printervriendelijke versie bekijken',
            automated: 'Geautomatiseerd',
            liveAgent: 'Live agent',
            instant: 'Direct',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min. ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Betalingen inschakelen',
        activatedTitle: 'Portemonnee geactiveerd!',
        activatedMessage: 'Gefeliciteerd, je wallet is ingesteld en klaar om betalingen te doen.',
        checkBackLaterTitle: 'Een momentje...',
        checkBackLaterMessage: 'We beoordelen je gegevens nog. Kom later terug om het opnieuw te proberen.',
        continueToPayment: 'Doorgaan naar betaling',
        continueToTransfer: 'Doorgaan met overboeken',
    },
    companyStep: {
        headerTitle: 'Bedrijfsinformatie',
        subtitle: 'Bijna klaar! Voor de beveiliging moeten we enkele gegevens bevestigen:',
        legalBusinessName: 'Wettelijke bedrijfsnaam',
        companyWebsite: 'Website van het bedrijf',
        taxIDNumber: 'BTW-nummer',
        taxIDNumberPlaceholder: '9 cijfers',
        companyType: 'Bedrijfstype',
        incorporationDate: 'Oprichtingsdatum',
        incorporationState: 'Staat van oprichting',
        industryClassificationCode: 'Code voor bedrijfstakclassificatie',
        confirmCompanyIsNot: 'Ik bevestig dat dit bedrijf niet op de',
        listOfRestrictedBusinesses: 'lijst met beperkt toegestane bedrijven',
        incorporationDatePlaceholder: 'Startdatum (jjjj-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerschap',
            COOPERATIVE: 'Coöperatief',
            SOLE_PROPRIETORSHIP: 'Eenmanszaak',
            OTHER: 'Overig',
        },
        industryClassification: 'Onder welke branche valt het bedrijf?',
        industryClassificationCodePlaceholder: 'Zoek brancheslagcode',
    },
    requestorStep: {
        headerTitle: 'Persoonlijke gegevens',
        learnMore: 'Meer informatie',
        isMyDataSafe: 'Is mijn data veilig?',
    },
    personalInfoStep: {
        personalInfo: 'Persoonlijke gegevens',
        enterYourLegalFirstAndLast: 'Wat is je officiële naam?',
        legalFirstName: 'Juridische voornaam',
        legalLastName: 'Wettelijke achternaam',
        legalName: 'Wettelijke naam',
        enterYourDateOfBirth: 'Wat is je geboortedatum?',
        enterTheLast4: 'Wat zijn de laatste vier cijfers van je sofi-nummer?',
        dontWorry: 'Maak je geen zorgen, we voeren geen enkele persoonlijke kredietcheck uit!',
        last4SSN: 'Laatste 4 van SSN',
        enterYourAddress: 'Wat is je adres?',
        address: 'Adres',
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        byAddingThisBankAccount: 'Door deze bankrekening toe te voegen, bevestig je dat je het volgende hebt gelezen, begrepen en aanvaard',
        whatsYourLegalName: 'Wat is je officiële naam?',
        whatsYourDOB: 'Wat is je geboortedatum?',
        whatsYourAddress: 'Wat is je adres?',
        whatsYourSSN: 'Wat zijn de laatste vier cijfers van je sofi-nummer?',
        noPersonalChecks: 'Geen zorgen, we doen hier geen persoonlijke kredietchecks!',
        whatsYourPhoneNumber: 'Wat is je telefoonnummer?',
        weNeedThisToVerify: 'Dit hebben we nodig om je wallet te verifiëren.',
    },
    businessInfoStep: {
        businessInfo: 'Bedrijfsgegevens',
        enterTheNameOfYourBusiness: 'Wat is de naam van je bedrijf?',
        businessName: 'Wettelijke bedrijfsnaam',
        enterYourCompanyTaxIdNumber: 'Wat is het btw-nummer van uw bedrijf?',
        taxIDNumber: 'BTW-nummer',
        taxIDNumberPlaceholder: '9 cijfers',
        enterYourCompanyWebsite: 'Wat is de website van je bedrijf?',
        companyWebsite: 'Website van het bedrijf',
        enterYourCompanyPhoneNumber: 'Wat is het telefoonnummer van jouw bedrijf?',
        enterYourCompanyAddress: 'Wat is het adres van je bedrijf?',
        selectYourCompanyType: 'Wat voor soort bedrijf is het?',
        companyType: 'Bedrijfstype',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerschap',
            COOPERATIVE: 'Coöperatief',
            SOLE_PROPRIETORSHIP: 'Eenmanszaak',
            OTHER: 'Overig',
        },
        selectYourCompanyIncorporationDate: 'Wat is de oprichtingsdatum van je bedrijf?',
        incorporationDate: 'Oprichtingsdatum',
        incorporationDatePlaceholder: 'Startdatum (jjjj-mm-dd)',
        incorporationState: 'Staat van oprichting',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In welke staat is uw bedrijf opgericht?',
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        companyAddress: 'Bedrijfsadres',
        listOfRestrictedBusinesses: 'lijst met beperkt toegestane bedrijven',
        confirmCompanyIsNot: 'Ik bevestig dat dit bedrijf niet op de',
        businessInfoTitle: 'Bedrijfsgegevens',
        legalBusinessName: 'Wettelijke bedrijfsnaam',
        whatsTheBusinessName: 'Wat is de bedrijfsnaam?',
        whatsTheBusinessAddress: 'Wat is het zakelijke adres?',
        whatsTheBusinessContactInformation: 'Wat zijn de zakelijke contactgegevens?',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Wat is het bedrijfsregistratienummer (CRN)?';
                default:
                    return 'Wat is het bedrijfsregistratienummer?';
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
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
        whereWasTheBusinessIncorporated: 'Waar is het bedrijf geregistreerd?',
        whatTypeOfBusinessIsIt: 'Wat voor soort bedrijf is het?',
        whatsTheBusinessAnnualPayment: 'Wat is het jaarlijkse betalingsvolume van het bedrijf?',
        whatsYourExpectedAverageReimbursements: 'Wat is je verwachte gemiddelde terugbetalingsbedrag?',
        registrationNumber: 'Registratienummer',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'EIN';
                case CONST.COUNTRY.CA:
                    return 'BN';
                case CONST.COUNTRY.GB:
                    return 'btw-nummer';
                case CONST.COUNTRY.AU:
                    return 'ABN';
                default:
                    return 'btw van de EU';
            }
        },
        businessAddress: 'Zakelijk adres',
        businessType: 'Bedrijfstype',
        incorporation: 'Oprichtingsakte',
        incorporationCountry: 'Land van oprichting',
        incorporationTypeName: 'Type rechtspersoon',
        businessCategory: 'Zakelijke categorie',
        annualPaymentVolume: 'Jaarlijks betalingsvolume',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Jaarlijks betalingsvolume in ${currencyCode}`,
        averageReimbursementAmount: 'Gemiddeld terugbetalingsbedrag',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Gemiddeld terugbetalingsbedrag in ${currencyCode}`,
        selectIncorporationType: 'Selecteer ondernemingsvorm',
        selectBusinessCategory: 'Selecteer bedrijfscategorie',
        selectAnnualPaymentVolume: 'Selecteer jaarlijks betalingsvolume',
        selectIncorporationCountry: 'Selecteer land van oprichting',
        selectIncorporationState: 'Selecteer oprichtingsstaat',
        selectAverageReimbursement: 'Selecteer gemiddeld terugbetalingsbedrag',
        selectBusinessType: 'Selecteer type bedrijf',
        findIncorporationType: 'Rechtsvorm zoeken',
        findBusinessCategory: 'Zakelijke categorie zoeken',
        findAnnualPaymentVolume: 'Vind jaarlijks betalingsvolume',
        findIncorporationState: 'Staat van oprichting zoeken',
        findAverageReimbursement: 'Gemiddelde terugbetalingsbedrag zoeken',
        findBusinessType: 'Zoek bedrijfstype',
        error: {
            registrationNumber: 'Voer een geldig registratienummer in',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Geef een geldig Employer Identification Number (EIN) op';
                    case CONST.COUNTRY.CA:
                        return 'Geef een geldig bedrijfsnummer (BN) op';
                    case CONST.COUNTRY.GB:
                        return 'Geef een geldig btw-registratienummer (VRN) op';
                    case CONST.COUNTRY.AU:
                        return 'Voer een geldig Australisch Business Number (ABN) in.';
                    default:
                        return 'Geef een geldig EU-btw-nummer op';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `Bent u voor 25% of meer eigenaar van ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `Bezitten een of meer natuurlijke personen 25% of meer van ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Zijn er meer personen die 25% of meer van ${companyName} bezitten?`,
        regulationRequiresUsToVerifyTheIdentity: 'Vanwege regelgeving moeten we de identiteit verifiëren van iedere persoon die meer dan 25% van het bedrijf bezit.',
        companyOwner: 'Eigenaar bedrijf',
        enterLegalFirstAndLastName: 'Wat is de wettelijke naam van de eigenaar?',
        legalFirstName: 'Juridische voornaam',
        legalLastName: 'Wettelijke achternaam',
        enterTheDateOfBirthOfTheOwner: 'Wat is de geboortedatum van de eigenaar?',
        enterTheLast4: 'Wat zijn de laatste 4 cijfers van het burgerservicenummer (BSN) van de eigenaar?',
        last4SSN: 'Laatste 4 van SSN',
        dontWorry: 'Maak je geen zorgen, we voeren geen enkele persoonlijke kredietcheck uit!',
        enterTheOwnersAddress: 'Wat is het adres van de eigenaar?',
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        legalName: 'Wettelijke naam',
        address: 'Adres',
        byAddingThisBankAccount: 'Door deze bankrekening toe te voegen, bevestig je dat je het volgende hebt gelezen, begrepen en aanvaard',
        owners: 'Eigenaren',
    },
    ownershipInfoStep: {
        ownerInfo: 'Eigenaarsgegevens',
        businessOwner: 'Eigenaar bedrijf',
        signerInfo: 'Ondertekenaarinformatie',
        doYouOwn: (companyName: string) => `Bent u voor 25% of meer eigenaar van ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `Bezitten een of meer natuurlijke personen 25% of meer van ${companyName}?`,
        regulationsRequire: 'Vanwege wet- en regelgeving moeten wij de identiteit verifiëren van elke persoon die meer dan 25% van het bedrijf bezit.',
        legalFirstName: 'Juridische voornaam',
        legalLastName: 'Wettelijke achternaam',
        whatsTheOwnersName: 'Wat is de wettelijke naam van de eigenaar?',
        whatsYourName: 'Wat is je officiële naam?',
        whatPercentage: 'Welk percentage van het bedrijf is eigendom van de eigenaar?',
        whatsYoursPercentage: 'Welk percentage van het bedrijf is in uw bezit?',
        ownership: 'Eigendom',
        whatsTheOwnersDOB: 'Wat is de geboortedatum van de eigenaar?',
        whatsYourDOB: 'Wat is je geboortedatum?',
        whatsTheOwnersAddress: 'Wat is het adres van de eigenaar?',
        whatsYourAddress: 'Wat is je adres?',
        whatAreTheLast: 'Wat zijn de laatste 4 cijfers van het sofinummer van de eigenaar?',
        whatsYourLast: 'Wat zijn de laatste 4 cijfers van uw sofinummer?',
        whatsYourNationality: 'Wat is uw nationaliteit?',
        whatsTheOwnersNationality: 'Wat is het land waarvan de eigenaar de nationaliteit heeft?',
        countryOfCitizenship: 'Nationaliteit',
        dontWorry: 'Maak je geen zorgen, we voeren geen enkele persoonlijke kredietcheck uit!',
        last4: 'Laatste 4 van SSN',
        whyDoWeAsk: 'Waarom vragen we dit?',
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        legalName: 'Wettelijke naam',
        ownershipPercentage: 'Eigendomspercentage',
        areThereOther: (companyName: string) => `Zijn er andere personen die 25% of meer van ${companyName} bezitten?`,
        owners: 'Eigenaren',
        addCertified: 'Voeg een gecertificeerd organisatieschema toe dat de uiteindelijk gerechtigden toont',
        regulationRequiresChart:
            'Volgens de regelgeving moeten we een gewaarmerkte kopie ontvangen van het eigendomsschema waarop elke persoon of entiteit staat die 25% of meer van het bedrijf bezit.',
        uploadEntity: 'Organigram van entiteit uploaden',
        noteEntity: 'Opmerking: Het eigendomsdiagram van de entiteit moet worden ondertekend door uw accountant, juridisch adviseur of notarieel worden bekrachtigd.',
        certified: 'Gecertificeerd eigendomsdiagram van entiteiten',
        selectCountry: 'Selecteer land',
        findCountry: 'Land zoeken',
        address: 'Adres',
        chooseFile: 'Kies bestand',
        uploadDocuments: 'Extra documentatie uploaden',
        pleaseUpload: 'Upload hieronder aanvullende documentatie om ons te helpen uw identiteit te verifiëren als directe of indirecte eigenaar van 25% of meer van de bedrijfsentiteit.',
        acceptedFiles: 'Geaccepteerde bestandsindelingen: PDF, PNG, JPEG. De totale bestandsgrootte per sectie mag niet groter zijn dan 5 MB.',
        proofOfBeneficialOwner: 'Bewijs van uiteindelijk belanghebbende',
        proofOfBeneficialOwnerDescription:
            'Stuur een ondertekende verklaring en organigram van een openbaar accountant, notaris of advocaat waarin wordt bevestigd wie 25% of meer van het bedrijf bezit. Deze moeten gedateerd zijn binnen de laatste drie maanden en het licentienummer van de ondertekenaar bevatten.',
        copyOfID: 'Kopie van identiteitsbewijs van uiteindelijk belanghebbende',
        copyOfIDDescription: 'Voorbeelden: paspoort, rijbewijs, enz.',
        proofOfAddress: 'Adresbewijs voor uiteindelijk gerechtigde',
        proofOfAddressDescription: 'Voorbeelden: nutsrekening, huurcontract, etc.',
        codiceFiscale: 'Codice fiscale/Belastingnummer',
        codiceFiscaleDescription:
            'Upload een video van een locatiebezoek of een opgenomen gesprek met de tekenbevoegde. De tekenbevoegde moet het volgende vermelden: volledige naam, geboortedatum, bedrijfsnaam, registratienummer, fiscaal nummer, statutaire zetel, aard van de bedrijfsactiviteiten en het doel van de rekening.',
    },
    completeVerificationStep: {
        completeVerification: 'Verificatie voltooien',
        confirmAgreements: 'Bevestig de onderstaande overeenkomsten.',
        certifyTrueAndAccurate: 'Ik verklaar dat de verstrekte informatie waarheidsgetrouw en nauwkeurig is',
        certifyTrueAndAccurateError: 'Bevestig dat de informatie waarheidsgetrouw en juist is',
        isAuthorizedToUseBankAccount: 'Ik ben gemachtigd om deze zakelijke bankrekening te gebruiken voor zakelijke uitgaven',
        isAuthorizedToUseBankAccountError: 'Je moet een leidinggevend functionaris zijn met bevoegdheid om de zakelijke bankrekening te beheren',
        termsAndConditions: 'algemene voorwaarden',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Verifieer je bankrekening',
        validateButtonText: 'Valideren',
        validationInputLabel: 'Transactie',
        maxAttemptsReached: 'Validatie voor deze bankrekening is uitgeschakeld vanwege te veel onjuiste pogingen.',
        description: `Binnen 1–2 werkdagen sturen we drie (3) kleine transacties naar je bankrekening vanaf een naam zoals “Expensify, Inc. Validation”.`,
        descriptionCTA: 'Voer voor elke transactie het bedrag in de onderstaande velden in. Voorbeeld: 1.51.',
        letsChatText: 'Bijna klaar! We hebben je hulp nodig om nog een paar laatste gegevens via de chat te verifiëren. Klaar?',
        enable2FATitle: 'Voorkom fraude, schakel tweeledige verificatie (2FA) in',
        enable2FAText: 'We nemen je beveiliging serieus. Stel nu 2FA in om een extra beveiligingslaag aan je account toe te voegen.',
        secureYourAccount: 'Beveilig je account',
    },
    countryStep: {
        confirmBusinessBank: 'Bevestig de valuta en het land van de zakelijke bankrekening',
        confirmCurrency: 'Bevestig valuta en land',
        yourBusiness: 'De valuta van je zakelijke bankrekening moet overeenkomen met de valuta van je werkruimte.',
        youCanChange: 'Je kunt de valuta van je werkruimte wijzigen in je',
        findCountry: 'Land zoeken',
        selectCountry: 'Selecteer land',
    },
    bankInfoStep: {
        whatAreYour: 'Wat zijn de gegevens van uw zakelijke bankrekening?',
        letsDoubleCheck: 'Laten we nog eens controleren of alles er goed uitziet.',
        thisBankAccount: 'Deze bankrekening wordt gebruikt voor zakelijke betalingen in je werkruimte',
        accountNumber: 'Rekeningnummer',
        accountHolderNameDescription: 'Volledige naam van de bevoegde ondertekenaar',
    },
    signerInfoStep: {
        signerInfo: 'Ondertekenaarinformatie',
        areYouDirector: (companyName: string) => `Bent u directeur bij ${companyName}?`,
        regulationRequiresUs: 'Regelgeving vereist dat we controleren of de ondertekenaar de bevoegdheid heeft om deze actie namens het bedrijf te ondernemen.',
        whatsYourName: 'Wat is je officiële naam',
        fullName: 'Volledige juridische naam',
        whatsYourJobTitle: 'Wat is je functietitel?',
        jobTitle: 'Functietitel',
        whatsYourDOB: 'Wat is je geboortedatum?',
        uploadID: 'Identiteitsbewijs en adresbewijs uploaden',
        personalAddress: 'Bewijs van persoonlijk adres (bijv. een energierekening)',
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        legalName: 'Wettelijke naam',
        proofOf: 'Bewijs van persoonlijk adres',
        enterOneEmail: (companyName: string) => `Vul het e-mailadres in van een directeur bij ${companyName}`,
        regulationRequiresOneMoreDirector: 'Volgens de regelgeving is ten minste één extra directeur als ondertekenaar vereist.',
        hangTight: 'Even geduld…',
        enterTwoEmails: (companyName: string) => `Voer de e-mailadressen in van twee directeuren bij ${companyName}`,
        sendReminder: 'Stuur een herinnering',
        chooseFile: 'Kies bestand',
        weAreWaiting: 'We wachten tot anderen hun identiteit hebben bevestigd als directeur van het bedrijf.',
        id: 'Kopie van ID',
        proofOfDirectors: 'Bewijs van directeur(s)',
        proofOfDirectorsDescription: 'Voorbeelden: Oncorp-bedrijfsprofiel of bedrijfsregistratie.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale voor ondertekenaars, gemachtigde gebruikers en uiteindelijk belanghebbenden.',
        PDSandFSG: 'PDS- en FSG-informatiedocumenten',
        PDSandFSGDescription: dedent(`
            Onze samenwerking met Corpay maakt gebruik van een API-koppeling om te profiteren van hun uitgebreide netwerk van internationale bankpartners om Wereldwijde Vergoedingen in Expensify mogelijk te maken. Conform de Australische regelgeving verstrekken wij je hierbij Corpay’s Financial Services Guide (FSG) en Product Disclosure Statement (PDS).

            Lees de FSG- en PDS-documenten zorgvuldig door, aangezien ze volledige details en belangrijke informatie bevatten over de producten en diensten die Corpay aanbiedt. Bewaar deze documenten voor toekomstig gebruik.
        `),
        pleaseUpload: 'Upload hieronder extra documenten om ons te helpen uw identiteit als bestuurder van het bedrijf te verifiëren.',
        enterSignerInfo: 'Voer ondertekenaargegevens in',
        thisStep: 'Deze stap is voltooid',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `verbindt een zakelijke ${currency}-bankrekening die eindigt op ${bankAccountLastFour} met Expensify om medewerkers in ${currency} te betalen. De volgende stap vereist ondertekenaarsgegevens van een directeur.`,
        error: {
            emailsMustBeDifferent: 'E-mailadressen moeten verschillend zijn',
        },
    },
    agreementsStep: {
        agreements: 'Overeenkomsten',
        pleaseConfirm: 'Bevestig de onderstaande overeenkomsten',
        regulationRequiresUs: 'Vanwege regelgeving moeten we de identiteit verifiëren van iedere persoon die meer dan 25% van het bedrijf bezit.',
        iAmAuthorized: 'Ik ben bevoegd om de zakelijke bankrekening te gebruiken voor zakelijke uitgaven.',
        iCertify: 'Ik verklaar dat de verstrekte informatie juist en nauwkeurig is.',
        iAcceptTheTermsAndConditions: `Ik ga akkoord met de <a href="https://cross-border.corpay.com/tc/">algemene voorwaarden</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Ik ga akkoord met de algemene voorwaarden.',
        accept: 'Accepteren en bankrekening toevoegen',
        iConsentToThePrivacyNotice: 'Ik ga akkoord met de <a href="https://payments.corpay.com/compliance">privacyverklaring</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Ik ga akkoord met de privacyverklaring.',
        error: {
            authorized: 'Je moet een leidinggevend functionaris zijn met bevoegdheid om de zakelijke bankrekening te beheren',
            certify: 'Bevestig dat de informatie waarheidsgetrouw en juist is',
            consent: 'Geef alsjeblieft toestemming voor de privacyverklaring',
        },
    },
    docusignStep: {
        subheader: 'DocuSign-formulier',
        pleaseComplete:
            'Vul het ACH-machtigingsformulier in via de onderstaande Docusign-link en upload daarna hier de ondertekende versie, zodat we rechtstreeks geld van je bankrekening kunnen afschrijven.',
        pleaseCompleteTheBusinessAccount: 'Vul de aanvraag zakelijke rekening voor automatische incasso in',
        pleaseCompleteTheDirect:
            'Rond de automatische incasso-overeenkomst af via de Docusign-link hieronder en upload vervolgens de ondertekende versie hier, zodat we rechtstreeks geld van je bankrekening kunnen afschrijven.',
        takeMeTo: 'Breng me naar DocuSign',
        uploadAdditional: 'Extra documentatie uploaden',
        pleaseUpload: 'Upload het DEFT-formulier en de Docusign-handtekeningenpagina',
        pleaseUploadTheDirect: 'Upload de automatische-incassoregelingen en de Docusign-handtekeningpagina',
    },
    finishStep: {
        letsFinish: 'Laten we het in de chat afronden!',
        thanksFor:
            'Bedankt voor deze details. Een toegewijde supportmedewerker beoordeelt nu je informatie. We nemen opnieuw contact met je op als we nog iets van je nodig hebben, maar neem intussen gerust contact met ons op als je vragen hebt.',
        iHaveA: 'Ik heb een vraag',
        enable2FA: 'Tweeledige verificatie (2FA) inschakelen om fraude te voorkomen',
        weTake: 'We nemen je beveiliging serieus. Stel nu 2FA in om een extra beveiligingslaag aan je account toe te voegen.',
        secure: 'Beveilig je account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Een ogenblik',
        explanationLine: 'We bekijken je gegevens. Je kunt binnenkort doorgaan met de volgende stappen.',
    },
    session: {
        offlineMessageRetry: 'Het lijkt erop dat je offline bent. Controleer je verbinding en probeer het opnieuw.',
    },
    travel: {
        header: 'Reis boeken',
        title: 'Reis slim',
        subtitle: 'Gebruik Expensify Travel om de beste reisaanbiedingen te krijgen en al je zakelijke uitgaven op één plek te beheren.',
        features: {
            saveMoney: 'Bespaar geld op je boekingen',
            alerts: 'Ontvang realtime meldingen als je reisplannen veranderen',
        },
        bookTravel: 'Reis boeken',
        bookDemo: 'Demo boeken',
        bookADemo: 'Plan een demo',
        toLearnMore: 'voor meer informatie.',
        termsAndConditions: {
            header: 'Voordat we verdergaan...',
            title: 'Algemene voorwaarden',
            label: 'Ik ga akkoord met de algemene voorwaarden',
            subtitle: `Ga akkoord met de Expensify Travel <a href="${CONST.TRAVEL_TERMS_URL}">voorwaarden</a>.`,
            error: 'U moet akkoord gaan met de Expensify Travel-voorwaarden om door te gaan',
            defaultWorkspaceError:
                'Je moet een standaardwerkruimte instellen om Expensify Travel in te schakelen. Ga naar Instellingen > Werkruimtes > klik op de drie verticale puntjes naast een werkruimte > Als standaardwerkruimte instellen en probeer het daarna opnieuw!',
        },
        flight: 'Vlucht',
        flightDetails: {
            passenger: 'Passagier',
            layover: (layover: string) => `<muted-text-label>Je hebt een <strong>${layover} tussenstop</strong> voor deze vlucht</muted-text-label>`,
            takeOff: 'Start',
            landing: 'Landingspagina',
            seat: 'Stoel',
            class: 'Reisklasse',
            recordLocator: 'Reserveringscode',
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
                nonRefundable: 'Niet-terugbetaalbaar',
                freeCancellationUntil: 'Gratis annuleren tot',
                partiallyRefundable: 'Gedeeltelijk restitueerbaar',
            },
        },
        car: 'Auto',
        carDetails: {
            rentalCar: 'Autoverhuur',
            pickUp: 'Afhalen',
            dropOff: 'Afleverpunt',
            driver: 'Bestuurder',
            carType: 'Autotype',
            cancellation: 'Annuleringsbeleid',
            cancellationUntil: 'Gratis annuleren tot',
            freeCancellation: 'Gratis annuleren',
            confirmation: 'Bevestigingsnummer',
        },
        train: 'Rail',
        trainDetails: {
            passenger: 'Passagier',
            departs: 'Vertrekt',
            arrives: 'Komt aan',
            coachNumber: 'Wagennummer',
            seat: 'Stoel',
            fareDetails: 'Tarieveninformatie',
            confirmation: 'Bevestigingsnummer',
        },
        viewTrip: 'Reis bekijken',
        modifyTrip: 'Reis bewerken',
        tripSupport: 'Reisondersteuning',
        tripDetails: 'Reisdetails',
        viewTripDetails: 'Bekijk reisdetails',
        trip: 'Reis',
        trips: 'Reizen',
        tripSummary: 'Reisoverzicht',
        departs: 'Vertrekt',
        errorMessage: 'Er is iets misgegaan. Probeer het later opnieuw.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>Voeg alstublieft een werkmailadres toe als uw primaire login via <a href="${phoneErrorMethodsRoute}">werkmailadres toevoegen</a> om reizen te boeken.</rbr>`,
        domainSelector: {
            title: 'Domein',
            subtitle: 'Kies een domein voor de configuratie van Expensify Travel.',
            recommended: 'Aanbevolen',
        },
        domainPermissionInfo: {
            title: 'Domein',
            restriction: (domain: string) =>
                `Je hebt geen toestemming om Expensify Travel in te schakelen voor het domein <strong>${domain}</strong>. Vraag iemand van dat domein om Travel in te schakelen.`,
            accountantInvitation: `Als je accountant bent, overweeg dan om je aan te sluiten bij het <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved!-accountantsprogramma</a> om reizen voor dit domein in te schakelen.`,
        },
        publicDomainError: {
            title: 'Aan de slag met Expensify Travel',
            message: `Je moet je werkmail (bijv. naam@bedrijf.com) gebruiken met Expensify Travel, niet je persoonlijke e-mail (bijv. naam@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel is uitgeschakeld',
            message: `Je beheerder heeft Expensify Travel uitgeschakeld. Volg het boekingsbeleid van je bedrijf voor je reisregelingen.`,
        },
        verifyCompany: {
            title: 'We beoordelen je verzoek...',
            message: `We voeren een paar controles uit om te verifiëren dat je account klaar is voor Expensify Travel. We nemen snel contact met je op!`,
            confirmText: 'Begrepen',
            conciergeMessage: ({domain}: {domain: string}) => `Reisinschakeling is mislukt voor domein: ${domain}. Controleer dit domein en schakel reizen in.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Je vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is geboekt. Bevestigingscode: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Je ticket voor vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is geannuleerd.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Je ticket voor vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is terugbetaald of omgeboekt.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Je vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate}} is door de luchtvaartmaatschappij geannuleerd.`,
            flightScheduleChangePending: (airlineCode: string) =>
                `De luchtvaartmaatschappij heeft een wijziging in het schema voorgesteld voor vlucht ${airlineCode}; we wachten op bevestiging.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Wijziging schema bevestigd: vlucht ${airlineCode} vertrekt nu om ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Je vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is bijgewerkt.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Uw reisklasse is bijgewerkt naar ${cabinClass} op vlucht ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `Je stoeltoewijzing op vlucht ${airlineCode} is bevestigd.`,
            flightSeatChanged: (airlineCode: string) => `Uw stoeltoewijzing op vlucht ${airlineCode} is gewijzigd.`,
            flightSeatCancelled: (airlineCode: string) => `Uw stoeltoewijzing op vlucht ${airlineCode} is verwijderd.`,
            paymentDeclined: 'Betaling voor je vluchtboeking is mislukt. Probeer het opnieuw.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Je hebt je ${type}-reservering ${id} geannuleerd.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `De leverancier heeft je ${type}-reservering ${id} geannuleerd.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Je ${type}-reservering is opnieuw geboekt. Nieuwe bevestiging nr.: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Je ${type}-boeking is bijgewerkt. Bekijk de nieuwe details in de reisroute.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Je treinkaartje voor ${origin} → ${destination} op ${startDate} is terugbetaald. Er wordt een tegoed verwerkt.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Je treinkaartje voor ${origin} → ${destination} op ${startDate} is omgeboekt.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Je treinkaartje voor ${origin} → ${destination} op ${startDate} is bijgewerkt.`,
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
            findWorkspace: 'Werkruimte zoeken',
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
            plan: 'Plan',
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
            settlementFrequency: 'Afrekenfrequentie',
            setAsDefault: 'Instellen als standaardwerkruimte',
            defaultNote: `Ontvangstbewijzen die naar ${CONST.EMAIL.RECEIPTS} worden gestuurd, verschijnen in deze workspace.`,
            deleteConfirmation: 'Weet je zeker dat je deze workspace wilt verwijderen?',
            deleteWithCardsConfirmation: 'Weet je zeker dat je deze workspace wilt verwijderen? Hiermee worden alle kaartfeeds en toegewezen kaarten verwijderd.',
            unavailable: 'Niet-beschikbare werkruimte',
            memberNotFound: 'Lid niet gevonden. Gebruik de uitnodigingsknop hierboven om een nieuw lid aan de werkruimte toe te voegen.',
            notAuthorized: `Je hebt geen toegang tot deze pagina. Als je probeert deel te nemen aan deze werkruimte, vraag dan eenvoudig de eigenaar van de werkruimte om je als lid toe te voegen. Iets anders aan de hand? Neem contact op met ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Ga naar werkruimte',
            duplicateWorkspace: 'Workspace dupliceren',
            duplicateWorkspacePrefix: 'Dupliceren',
            goToWorkspaces: 'Ga naar werkruimtes',
            clearFilter: 'Filter wissen',
            workspaceName: 'Werkruimte-naam',
            workspaceOwner: 'Eigenaar',
            workspaceType: 'Werkruimtetype',
            workspaceAvatar: 'Werkruimte-avatar',
            mustBeOnlineToViewMembers: 'Je moet online zijn om de leden van deze workspace te bekijken.',
            moreFeatures: 'Meer functies',
            requested: 'Aangevraagd',
            distanceRates: 'Kilometertarieven',
            defaultDescription: 'Eén plek voor al je bonnen en uitgaven.',
            descriptionHint: 'Deel informatie over deze workspace met alle leden.',
            welcomeNote: 'Gebruik Expensify om je bonnetjes in te dienen voor vergoeding, bedankt!',
            subscription: 'Abonnement',
            markAsEntered: 'Markeren als handmatig ingevoerd',
            markAsExported: 'Markeren als geëxporteerd',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exporteren naar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
            lineItemLevel: 'Regelniveau',
            reportLevel: 'Rapportniveau',
            topLevel: 'Bovenste niveau',
            appliedOnExport: 'Niet geïmporteerd in Expensify, toegepast bij export',
            shareNote: {
                header: 'Deel je werkruimte met andere leden',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Deel deze QR-code of kopieer de onderstaande link om het voor leden makkelijk te maken toegang tot je werkruimte aan te vragen. Alle verzoeken om lid te worden van de werkruimte verschijnen ter beoordeling in de kamer <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a>.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Verbind met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Nieuwe verbinding maken',
            reuseExistingConnection: 'Bestaande verbinding hergebruiken',
            existingConnections: 'Bestaande verbindingen',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Omdat je eerder verbinding hebt gemaakt met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, kun je ervoor kiezen een bestaande verbinding opnieuw te gebruiken of een nieuwe te maken.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Laatst gesynchroniseerd op ${formattedDate}`,
            authenticationError: (connectionName: string) => `Kan geen verbinding maken met ${connectionName} vanwege een authenticatiefout.`,
            learnMore: 'Meer informatie',
            memberAlternateText: 'Dien rapporten in en keur ze goed.',
            adminAlternateText: 'Rapporten en werkruimte-instellingen beheren.',
            auditorAlternateText: 'Rapporten bekijken en erop reageren.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Beheerder';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Accountant';
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
            planType: 'Type abonnement',
            youCantDowngradeInvoicing:
                'U kunt uw abonnement niet downgraden bij een gefactureerd abonnement. Neem voor overleg of wijzigingen aan uw abonnement contact op met uw accountmanager of Concierge voor hulp.',
            defaultCategory: 'Standaardcategorie',
            viewTransactions: 'Transacties weergeven',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Declaraties van ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card-transacties worden automatisch geëxporteerd naar een "Expensify Card Liability Account" dat wordt aangemaakt met <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">onze integratie</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Verbonden met ${organizationName}` : 'Automatiseer reiskosten en maaltijdbezorgingskosten in uw hele organisatie.',
                sendInvites: 'Uitnodigingen verzenden',
                sendInvitesDescription: 'Deze werkruimteleden hebben nog geen Uber for Business-account. Deselecteer de leden die je op dit moment niet wilt uitnodigen.',
                confirmInvite: 'Uitnodiging bevestigen',
                manageInvites: 'Uitnodigingen beheren',
                confirm: 'Bevestigen',
                allSet: 'Helemaal klaar',
                readyToRoll: 'Je bent er klaar voor',
                takeBusinessRideMessage: 'Maak een zakelijke rit en je Uber-bonnetjes worden in Expensify geïmporteerd. Scheuren maar!',
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
                invitationFailure: 'Lid uitnodigen voor Uber for Business mislukt',
                autoInvite: 'Nieuwe werkruimteleden uitnodigen voor Uber for Business',
                autoRemove: 'Deactiveer verwijderde werkruimteleden in Uber for Business',
                emptyContent: {
                    title: 'Geen openstaande uitnodigingen',
                    subtitle: 'Hoera! We hebben hoog en laag gezocht en geen openstaande uitnodigingen kunnen vinden.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Stel dagvergoedingen in om de dagelijkse uitgaven van medewerkers te beheersen. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Meer informatie</a>.</muted-text>`,
            amount: 'Bedrag',
            deleteRates: () => ({
                one: 'Tarief verwijderen',
                other: 'Tarieven verwijderen',
            }),
            deletePerDiemRate: 'Dagvergoedingstarief verwijderen',
            findPerDiemRate: 'Zoek dagvergoedingstarief',
            areYouSureDelete: () => ({
                one: 'Weet je zeker dat je dit tarief wilt verwijderen?',
                other: 'Weet je zeker dat je deze tarieven wilt verwijderen?',
            }),
            emptyList: {
                title: 'Dagvergoeding',
                subtitle: 'Stel dagvergoedingen in om de dagelijkse uitgaven van medewerkers te beheersen. Importeer tarieven uit een spreadsheet om aan de slag te gaan.',
            },
            importPerDiemRates: 'Dagvergoedingen importeren',
            editPerDiemRate: 'Dagvergoedingstarief bewerken',
            editPerDiemRates: 'Dagvergoedingen bewerken',
            editDestinationSubtitle: (destination: string) => `Als u deze bestemming bijwerkt, wordt deze gewijzigd voor alle per diem-subtarieven van ${destination}.`,
            editCurrencySubtitle: (destination: string) => `Het bijwerken van deze valuta zal deze wijzigen voor alle per diem-subtarieven van ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Stel in hoe uit eigen zak betaalde onkosten worden geëxporteerd naar QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Cheques markeren als ‘later afdrukken’',
            exportDescription: 'Stel in hoe Expensify-gegevens worden geëxporteerd naar QuickBooks Desktop.',
            date: 'Exportdatum',
            exportInvoices: 'Facturen exporteren naar',
            exportExpensifyCard: 'Exporteer Expensify Card-transacties als',
            account: 'Account',
            accountDescription: 'Kies waar journaalposten worden geboekt.',
            accountsPayable: 'Crediteuren',
            accountsPayableDescription: 'Kies waar je leveranciersfacturen wilt aanmaken.',
            bankAccount: 'Bankrekening',
            notConfigured: 'Niet geconfigureerd',
            bankAccountDescription: 'Kies vanaf waar je cheques verzendt.',
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
                        label: 'Ingediend op',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            exportCheckDescription: 'We maken een gespecificeerde cheque voor elk Expensify-rapport en sturen die vanaf de onderstaande bankrekening.',
            exportJournalEntryDescription: 'We maken een gespecificeerde journaalpost voor elk Expensify-rapport en boeken die op de onderstaande rekening.',
            exportVendorBillDescription:
                'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport en voegen die toe aan de onderstaande rekening. Als deze periode is afgesloten, boeken we op de 1e dag van de eerstvolgende open periode.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop ondersteunt geen belastingen op exporten van journaalposten. Omdat je belastingen hebt ingeschakeld in je workspace, is deze exportoptie niet beschikbaar.',
            outOfPocketTaxEnabledError: 'Boekingen zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Creditcard',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Leveranciersfactuur',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Boekingsstuk',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Controleren',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'We maken een gespecificeerde cheque voor elk Expensify-rapport en sturen die vanaf de onderstaande bankrekening.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'We koppelen automatisch de naam van de handelaar op de creditcardtransactie aan alle bijbehorende leveranciers in QuickBooks. Als er geen leveranciers bestaan, maken we een leverancier ‘Credit Card Misc.’ aan voor de koppeling.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport met de datum van de laatste uitgave en voegen die toe aan de onderstaande rekening. Als deze periode is afgesloten, boeken we op de 1e van de eerstvolgende open periode.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Kies waar u creditcardtransacties wilt exporteren.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Kies een leverancier om toe te passen op alle creditcardtransacties.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Kies vanaf waar je cheques verzendt.',
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
                body1: 'Je moet deze verbinding instellen vanaf de computer waarop je QuickBooks Desktop‑bedrijfsbestand wordt gehost.',
                body2: 'Zodra je verbonden bent, kun je vanaf elke locatie synchroniseren en exporteren.',
            },
            setupPage: {
                title: 'Open deze link om te verbinden',
                body: 'Om de configuratie te voltooien, opent u de volgende link op de computer waarop QuickBooks Desktop wordt uitgevoerd.',
                setupErrorTitle: 'Er is iets misgegaan',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>De QuickBooks Desktop-verbinding werkt op dit moment niet. Probeer het later opnieuw of <a href="${conciergeLink}">neem contact op met Concierge</a> als het probleem zich blijft voordoen.</centered-text></muted-text>`,
            },
            importDescription: 'Kies welke codeerconfiguraties je wilt importeren van QuickBooks Desktop naar Expensify.',
            classes: 'Klassen',
            items: 'Items',
            customers: 'Klanten/projecten',
            exportCompanyCardsDescription: 'Stel in hoe aankopen met zakelijke kaarten worden geëxporteerd naar QuickBooks Desktop.',
            defaultVendorDescription: 'Stel een standaardleverancier in die bij export op alle creditcardtransacties wordt toegepast.',
            accountsDescription: 'Je rekeningschema uit QuickBooks Desktop wordt als categorieën in Expensify geïmporteerd.',
            accountsSwitchTitle: 'Kies of je nieuwe rekeningen wilt importeren als ingeschakelde of uitgeschakelde categorieën.',
            accountsSwitchDescription: 'Ingeschakelde categorieën zijn beschikbaar voor leden om te selecteren wanneer ze hun declaraties indienen.',
            classesDescription: 'Kies hoe je QuickBooks Desktop-klassen in Expensify wilt behandelen.',
            tagsDisplayedAsDescription: 'Regelniveauspecificatie',
            reportFieldsDisplayedAsDescription: 'Rapportniveau',
            customersDescription: 'Kies hoe je QuickBooks Desktop-klanten/projecten in Expensify wilt verwerken.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wordt elke dag automatisch gesynchroniseerd met QuickBooks Desktop.',
                createEntities: 'Entiteiten automatisch aanmaken',
                createEntitiesDescription: 'Expensify maakt automatisch leveranciers aan in QuickBooks Desktop als ze nog niet bestaan.',
            },
            itemsDescription: 'Kies hoe je QuickBooks Desktop‑items in Expensify wilt behandelen.',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer je de onkosten wilt exporteren:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Opbouw',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uitgaven uit eigen zak worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Uitgaven uit eigen zak worden geëxporteerd wanneer ze zijn betaald',
                },
            },
        },
        qbo: {
            connectedTo: 'Verbonden met',
            importDescription: 'Kies welke coderingsconfiguraties je wilt importeren van QuickBooks Online naar Expensify.',
            classes: 'Klassen',
            locations: 'Locaties',
            customers: 'Klanten/projecten',
            accountsDescription: 'Uw QuickBooks Online grootboekschema wordt in Expensify geïmporteerd als categorieën.',
            accountsSwitchTitle: 'Kies of je nieuwe rekeningen wilt importeren als ingeschakelde of uitgeschakelde categorieën.',
            accountsSwitchDescription: 'Ingeschakelde categorieën zijn beschikbaar voor leden om te selecteren wanneer ze hun declaraties indienen.',
            classesDescription: 'Kies hoe je QuickBooks Online-classes in Expensify wilt verwerken.',
            customersDescription: 'Kies hoe je QuickBooks Online-klanten/projecten in Expensify wilt afhandelen.',
            locationsDescription: 'Kies hoe je QuickBooks Online-locaties in Expensify wilt verwerken.',
            taxesDescription: 'Kies hoe je QuickBooks Online-belastingen in Expensify wilt verwerken.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online ondersteunt geen locaties op regelniveau voor cheques of leveranciersfacturen. Als je locaties op regelniveau wilt gebruiken, zorg er dan voor dat je journaalposten en creditcard-/debetkaartuitgaven gebruikt.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online ondersteunt geen belastingen op journaalposten. Wijzig je exportoptie naar leveranciersfactuur of cheque.',
            exportDescription: 'Configureren hoe Expensify-gegevens worden geëxporteerd naar QuickBooks Online.',
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
                        label: 'Ingediend op',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            receivable: 'Debiteuren', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archief debiteuren', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Gebruik deze rekening bij het exporteren van facturen naar QuickBooks Online.',
            exportCompanyCardsDescription: 'Stel in hoe aankopen met bedrijfskaarten worden geëxporteerd naar QuickBooks Online.',
            vendor: 'Leverancier',
            defaultVendorDescription: 'Stel een standaardleverancier in die bij export op alle creditcardtransacties wordt toegepast.',
            exportOutOfPocketExpensesDescription: 'Stel in hoe uit eigen zak betaalde onkosten worden geëxporteerd naar QuickBooks Online.',
            exportCheckDescription: 'We maken een gespecificeerde cheque voor elk Expensify-rapport en sturen die vanaf de onderstaande bankrekening.',
            exportJournalEntryDescription: 'We maken een gespecificeerde journaalpost voor elk Expensify-rapport en boeken die op de onderstaande rekening.',
            exportVendorBillDescription:
                'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport en voegen die toe aan de onderstaande rekening. Als deze periode is afgesloten, boeken we op de 1e dag van de eerstvolgende open periode.',
            account: 'Account',
            accountDescription: 'Kies waar journaalposten worden geboekt.',
            accountsPayable: 'Crediteuren',
            accountsPayableDescription: 'Kies waar je leveranciersfacturen wilt aanmaken.',
            bankAccount: 'Bankrekening',
            notConfigured: 'Niet geconfigureerd',
            bankAccountDescription: 'Kies vanaf waar je cheques verzendt.',
            creditCardAccount: 'Creditcardrekening',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online ondersteunt geen locaties bij het exporteren van leveranciersfacturen. Omdat je locaties hebt ingeschakeld in je werkruimte, is deze exportoptie niet beschikbaar.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online ondersteunt geen belastingen op exports van journaalboekingen. Omdat je belastingen hebt ingeschakeld in je workspace, is deze exportoptie niet beschikbaar.',
            outOfPocketTaxEnabledError: 'Boekingen zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wordt elke dag automatisch gesynchroniseerd met QuickBooks Online.',
                inviteEmployees: 'Werknemers uitnodigen',
                inviteEmployeesDescription: 'Importeer QuickBooks Online-medewerkersgegevens en nodig medewerkers uit voor deze werkruimte.',
                createEntities: 'Entiteiten automatisch aanmaken',
                createEntitiesDescription:
                    'Expensify maakt automatisch leveranciers aan in QuickBooks Online als ze nog niet bestaan, en maakt automatisch klanten aan bij het exporteren van facturen.',
                reimbursedReportsDescription:
                    'Elke keer dat een rapport wordt betaald via Expensify ACH, wordt de bijbehorende rekeningenbetaling aangemaakt in de onderstaande QuickBooks Online-account.',
                qboBillPaymentAccount: 'QuickBooks-rekening voor factuurbetalingen',
                qboInvoiceCollectionAccount: 'QuickBooks-incasso grootboekrekening',
                accountSelectDescription: 'Kies vanwaar u rekeningen wilt betalen en wij maken de betaling aan in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Kies waar je factuurbetalingen wilt ontvangen en we maken de betaling aan in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Pinpas',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Creditcard',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Leveranciersfactuur',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Boekingsstuk',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Controleren',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'We koppelen automatisch de naam van de handelaar op de debetkaarttransactie aan eventuele overeenkomende leveranciers in QuickBooks. Als er geen leveranciers bestaan, maken we een leverancier ‘Debit Card Misc.’ aan voor de koppeling.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'We koppelen automatisch de naam van de handelaar op de creditcardtransactie aan alle bijbehorende leveranciers in QuickBooks. Als er geen leveranciers bestaan, maken we een leverancier ‘Credit Card Misc.’ aan voor de koppeling.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport met de datum van de laatste uitgave en voegen die toe aan de onderstaande rekening. Als deze periode is afgesloten, boeken we op de 1e van de eerstvolgende open periode.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Kies waar u debetkaarttransacties wilt exporteren.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Kies waar u creditcardtransacties wilt exporteren.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Kies een leverancier om toe te passen op alle creditcardtransacties.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Leveranciersfacturen zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Cheques zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: 'Boekingen zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Kies een geldige rekening voor het exporteren van de leveranciersfactuur',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Kies een geldig rekeningnummer voor het exporteren van dagboekboekingen',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Kies een geldig rekeningnummer voor chequexport',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Om leveranciersfacturen te kunnen exporteren, stelt u een crediteurenrekening in binnen QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Als je journaalposten wilt exporteren, stel dan een journaalrekening in in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Om controle-export te gebruiken, stel een bankrekening in in QuickBooks Online',
            },
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: 'Voeg de rekening toe in QuickBooks Online en synchroniseer de koppeling opnieuw.',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer je de onkosten wilt exporteren:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Opbouw',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uitgaven uit eigen zak worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Uitgaven uit eigen zak worden geëxporteerd wanneer ze zijn betaald',
                },
            },
        },
        workspaceList: {
            joinNow: 'Meld je nu aan',
            askToJoin: 'Verzoek om deel te nemen',
        },
        xero: {
            organization: 'Xero-organisatie',
            organizationDescription: 'Kies de Xero-organisatie waarvan je gegevens wilt importeren.',
            importDescription: 'Kies welke coderingsconfiguraties je uit Xero naar Expensify wilt importeren.',
            accountsDescription: 'Uw Xero-rekeningschema wordt in Expensify geïmporteerd als categorieën.',
            accountsSwitchTitle: 'Kies of je nieuwe rekeningen wilt importeren als ingeschakelde of uitgeschakelde categorieën.',
            accountsSwitchDescription: 'Ingeschakelde categorieën zijn beschikbaar voor leden om te selecteren wanneer ze hun declaraties indienen.',
            trackingCategories: 'Volgcategorieën',
            trackingCategoriesDescription: 'Kies hoe je Xero-trackingcategorieën in Expensify wilt afhandelen.',
            mapTrackingCategoryTo: (categoryName: string) => `Xero-${categoryName} koppelen aan`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Kies waar u ${categoryName} aan wilt koppelen bij het exporteren naar Xero.`,
            customers: 'Klanten opnieuw factureren',
            customersDescription:
                'Kies of je klanten in Expensify opnieuw wilt factureren. Je Xero-klantcontacten kunnen aan uitgaven worden gekoppeld en worden naar Xero geëxporteerd als een verkoopfactuur.',
            taxesDescription: 'Kies hoe je Xero-belastingen in Expensify wilt verwerken.',
            notImported: 'Niet geïmporteerd',
            notConfigured: 'Niet geconfigureerd',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Standaard Xero-contact',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Rapportvelden',
            },
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar Xero.',
            purchaseBill: 'Aankoopfactuur',
            exportDeepDiveCompanyCard:
                'Geëxporteerde uitgaven worden als banktransacties geboekt op de onderstaande Xero-bankrekening en de transactiedata komen overeen met de data op uw bankafschrift.',
            bankTransactions: 'Banktransacties',
            xeroBankAccount: 'Xero-bankrekening',
            xeroBankAccountDescription: 'Kies waar uitgaven worden geboekt als banktransacties.',
            exportExpensesDescription: 'Rapporten worden geëxporteerd als een aankoopfactuur met de datum en status die hieronder zijn geselecteerd.',
            purchaseBillDate: 'Aankoopfactuurdatum',
            exportInvoices: 'Facturen exporteren als',
            salesInvoice: 'Verkoopfactuur',
            exportInvoicesDescription: 'Verkoopfacturen tonen altijd de datum waarop de factuur is verzonden.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wordt elke dag automatisch met Xero gesynchroniseerd.',
                purchaseBillStatusTitle: 'Status inkoopfactuur',
                reimbursedReportsDescription:
                    'Telkens wanneer een rapport wordt betaald via Expensify ACH, wordt de bijbehorende rekeningbetaling aangemaakt in het onderstaande Xero-account.',
                xeroBillPaymentAccount: 'Xero-factuurbetaalrekening',
                xeroInvoiceCollectionAccount: 'Xero-incasso­rekening voor facturen',
                xeroBillPaymentAccountDescription: 'Kies vanwaar je rekeningen wilt betalen en wij maken de betaling aan in Xero.',
                invoiceAccountSelectorDescription: 'Kies waar je factuurbetalingen wilt ontvangen en wij maken de betaling in Xero aan.',
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
                        label: 'Ingediend op',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status inkoopfactuur',
                description: 'Gebruik deze status bij het exporteren van aankoopfacturen naar Xero.',
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
                description: 'Kies wanneer je de onkosten wilt exporteren:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Opbouw',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uitgaven uit eigen zak worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Uitgaven uit eigen zak worden geëxporteerd wanneer ze zijn betaald',
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
                        description: 'Datum waarop het rapport naar Sage Intacct is geëxporteerd.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Ingediend op',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Stel in hoe uit eigen zak betaalde onkosten worden geëxporteerd naar Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Declaraties',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Leveranciersrekeningen',
                },
            },
            nonReimbursableExpenses: {
                description: 'Stel in hoe aankopen met de bedrijfskaart worden geëxporteerd naar Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Creditcards',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Leveranciersrekeningen',
                },
            },
            creditCardAccount: 'Creditcardrekening',
            defaultVendor: 'Standaardleverancier',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Stel een standaardleverancier in die wordt toegepast op ${isReimbursable ? '' : 'niet-'}declareerbare uitgaven waarvoor geen overeenkomende leverancier in Sage Intacct bestaat.`,
            exportDescription: 'Stel in hoe Expensify-gegevens worden geëxporteerd naar Sage Intacct.',
            exportPreferredExporterNote:
                'De voorkeurs-exporteur kan elke werkruimtebeheerder zijn, maar moet ook een domeinbeheerder zijn als je in Domeininstellingen verschillende exportrekeningen instelt voor individuele bedrijfskaarten.',
            exportPreferredExporterSubNote: 'Zodra dit is ingesteld, ziet de voorkeurs‑exporteur de rapporten om te exporteren in zijn/haar account.',
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: `Voeg het account toe in Sage Intacct en synchroniseer de verbinding opnieuw`,
            autoSync: 'Automatisch synchroniseren',
            autoSyncDescription: 'Expensify wordt elke dag automatisch met Sage Intacct gesynchroniseerd.',
            inviteEmployees: 'Werknemers uitnodigen',
            inviteEmployeesDescription:
                'Importeer Sage Intacct-medewerkersgegevens en nodig medewerkers uit naar deze werkruimte. Uw goedkeuringsworkflow wordt standaard ingesteld op goedkeuring door de manager en kan verder worden geconfigureerd op de pagina Leden.',
            syncReimbursedReports: 'Uitbetaalde rapporten synchroniseren',
            syncReimbursedReportsDescription:
                'Telkens wanneer een rapport wordt betaald via Expensify ACH, wordt de bijbehorende rekeningbetaling aangemaakt in de onderstaande Sage Intacct-account.',
            paymentAccount: 'Sage Intacct-betaalrekening',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer je de onkosten wilt exporteren:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Opbouw',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uitgaven uit eigen zak worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Uitgaven uit eigen zak worden geëxporteerd wanneer ze zijn betaald',
                },
            },
        },
        netsuite: {
            subsidiary: 'Dochteronderneming',
            subsidiarySelectDescription: 'Kies de dochteronderneming in NetSuite waarvan je gegevens wilt importeren.',
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar NetSuite.',
            exportInvoices: 'Facturen exporteren naar',
            journalEntriesTaxPostingAccount: 'Boekingen belastingboekingsrekening',
            journalEntriesProvTaxPostingAccount: 'Boekingen voor provinciale belasting (grootboekrekening)',
            foreignCurrencyAmount: 'Bedrag in vreemde valuta exporteren',
            exportToNextOpenPeriod: 'Exporteren naar volgende open periode',
            nonReimbursableJournalPostingAccount: 'Journaalrekening voor niet-vergoedbare kosten',
            reimbursableJournalPostingAccount: 'Boekrekening voor terugbetaalbare posten',
            journalPostingPreference: {
                label: 'Voorkeur voor het boeken van journaalposten',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Enkele, uitgesplitste boeking voor elk rapport',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Enkele boeking per uitgave',
                },
            },
            invoiceItem: {
                label: 'Factuuritem',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Maak er een voor mij',
                        description: 'We maken een “Expensify-factuurregelitem” voor je aan bij het exporteren (als er nog geen bestaat).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Bestaande selecteren',
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
                        description: 'Datum van de meest recente uitgave op het rapport.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport naar NetSuite is geëxporteerd.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Ingediend op',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Declaraties',
                        reimbursableDescription: 'Uitgaven uit eigen zak worden als onkostendeclaraties naar NetSuite geëxporteerd.',
                        nonReimbursableDescription: 'Uitgaven met bedrijfskaarten worden als onkostendeclaraties naar NetSuite geëxporteerd.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Leveranciersrekeningen',
                        reimbursableDescription: dedent(`
                            Uitgaven uit eigen zak worden geëxporteerd als rekeningen die betaalbaar zijn aan de hieronder opgegeven NetSuite-leverancier.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Uitgaven op bedrijfskaarten worden geëxporteerd als rekeningen die betaalbaar zijn aan de hieronder opgegeven NetSuite-leverancier.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfspassen*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Boekingen',
                        reimbursableDescription: dedent(`
                            Uitgaven uit eigen zak worden als journaalposten geëxporteerd naar de onderstaande, opgegeven NetSuite‑rekening.

                            Als u voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Uitgaven met bedrijfskaarten worden geëxporteerd als journaalposten naar de hieronder opgegeven NetSuite-rekening.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Als je de exportinstelling voor zakelijke kaarten wijzigt naar onkostendeclaraties, worden NetSuite-leveranciers en boekingsrekeningen voor individuele kaarten uitgeschakeld.\n\nMaak je geen zorgen, we bewaren je vorige selecties voor het geval je later weer wilt terugschakelen.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify wordt elke dag automatisch met NetSuite gesynchroniseerd.',
                reimbursedReportsDescription:
                    'Elke keer dat een rapport wordt betaald via Expensify ACH, wordt de bijbehorende rekeningbetaling aangemaakt in de onderstaande NetSuite-account.',
                reimbursementsAccount: 'Vergoedingenrekening',
                reimbursementsAccountDescription: 'Kies de bankrekening die je voor terugbetalingen wilt gebruiken, dan maken wij de bijbehorende betaling aan in NetSuite.',
                collectionsAccount: 'Incassorekening',
                collectionsAccountDescription: 'Zodra een factuur in Expensify als betaald is gemarkeerd en naar NetSuite is geëxporteerd, verschijnt deze bij de onderstaande rekening.',
                approvalAccount: 'Crediteurenautorisatierekening',
                approvalAccountDescription:
                    'Kies de rekening waarop transacties in NetSuite worden goedgekeurd. Als je terugbetaalde rapporten synchroniseert, is dit ook de rekening waarop betaling van facturen wordt geboekt.',
                defaultApprovalAccount: 'NetSuite-standaard',
                inviteEmployees: 'Medewerkers uitnodigen en goedkeuringen instellen',
                inviteEmployeesDescription:
                    'Import NetSuite-medewerkersrecords en nodig medewerkers uit naar deze werkruimte. Je goedkeuringsworkflow wordt standaard ingesteld op goedkeuring door de manager en kan verder worden geconfigureerd op de pagina *Leden*.',
                autoCreateEntities: 'Medewerkers/leveranciers automatisch aanmaken',
                enableCategories: 'Nieuw geïmporteerde categorieën inschakelen',
                customFormID: 'Aangepaste formulier-ID',
                customFormIDDescription:
                    'Standaard maakt Expensify boekingen aan met behulp van het voorkeurs-transactieformulier dat is ingesteld in NetSuite. Als alternatief kun je een specifiek transactieformulier aanwijzen dat gebruikt moet worden.',
                customFormIDReimbursable: 'Contante uitgave',
                customFormIDNonReimbursable: 'Uitgave met bedrijfskaart',
                exportReportsTo: {
                    label: 'Niveau van onkostendeclaratiegoedkeuring',
                    description:
                        'Zodra een onkostendeclaratie in Expensify is goedgekeurd en naar NetSuite is geëxporteerd, kun je in NetSuite een extra goedkeuringsniveau instellen voordat je boekt.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Standaardvoorkeur voor NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Alleen door leidinggevende goedgekeurd',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Alleen boekhouding goedgekeurd',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Supervisor en boekhouding goedgekeurd',
                    },
                },
                accountingMethods: {
                    label: 'Wanneer exporteren',
                    description: 'Kies wanneer je de onkosten wilt exporteren:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Opbouw',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uitgaven uit eigen zak worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Uitgaven uit eigen zak worden geëxporteerd wanneer ze zijn betaald',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Goedkeuringsniveau leveranciersfactuur',
                    description:
                        'Zodra een leveranciersfactuur in Expensify is goedgekeurd en naar NetSuite is geëxporteerd, kun je in NetSuite een extra goedkeuringsniveau instellen voordat deze wordt geboekt.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Standaardvoorkeur voor NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'In afwachting van goedkeuring',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Goedgekeurd voor boeking',
                    },
                },
                exportJournalsTo: {
                    label: 'Goedkeuringsniveau journaalboeking',
                    description:
                        'Zodra een journaalboeking in Expensify is goedgekeurd en naar NetSuite is geëxporteerd, kun je in NetSuite een extra goedkeuringsniveau instellen voordat je boekt.',
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
            noAccountsFoundDescription: 'Voeg het account toe in NetSuite en synchroniseer de verbinding opnieuw',
            noVendorsFound: 'Geen leveranciers gevonden',
            noVendorsFoundDescription: 'Voeg leveranciers toe in NetSuite en synchroniseer de verbinding opnieuw',
            noItemsFound: 'Geen factuurregels gevonden',
            noItemsFoundDescription: 'Voeg factuurregels toe in NetSuite en synchroniseer de verbinding vervolgens opnieuw',
            noSubsidiariesFound: 'Geen dochterondernemingen gevonden',
            noSubsidiariesFoundDescription: 'Voeg een dochteronderneming toe in NetSuite en synchroniseer de verbinding opnieuw',
            tokenInput: {
                title: 'NetSuite-instellingen',
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
                        title: 'Maak een toegangstoken',
                        description:
                            'Ga in NetSuite naar *Setup > Users/Roles > Access Tokens* en maak een access token aan voor de app "Expensify" en de rol "Expensify Integration" of "Administrator".\n\n*Belangrijk:* Zorg dat je de *Token ID* en *Token Secret* van deze stap opslaat. Je hebt deze nodig voor de volgende stap.',
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
                        subtitle: 'Kies hoe je de NetSuite-*afdelingen* in Expensify wilt verwerken.',
                    },
                    classes: {
                        title: 'Klassen',
                        subtitle: 'Kies hoe je met *klassen* omgaat in Expensify.',
                    },
                    locations: {
                        title: 'Locaties',
                        subtitle: 'Kies hoe je met *locaties* in Expensify wilt omgaan.',
                    },
                },
                customersOrJobs: {
                    title: 'Klanten/projecten',
                    subtitle: 'Kies hoe je NetSuite-*klanten* en *projecten* in Expensify wilt verwerken.',
                    importCustomers: 'Klanten importeren',
                    importJobs: 'Projecten importeren',
                    customers: 'klanten',
                    jobs: 'projecten',
                    label: (importFields: string[], importType: string) => `${importFields.join('en')}, ${importType}`,
                },
                importTaxDescription: 'Belastinggroepen importeren uit NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Kies een optie hieronder:',
                    label: (importedTypes: string[]) => `Geïmporteerd als ${importedTypes.join('en')}`,
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
                            customSegmentNameFooter: `Je kunt aangepaste segmentnamen in NetSuite vinden op de pagina *Customizations > Links, Records & Fields > Custom Segments*.

_Voor meer gedetailleerde instructies, [bezoek onze helpwebsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `U kunt aangepaste recordnamen in NetSuite vinden door "Transaction Column Field" in de globale zoekfunctie in te voeren.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Wat is de interne ID?',
                            customSegmentInternalIDFooter: `Zorg er eerst voor dat je interne ID's hebt ingeschakeld in NetSuite onder *Home > Set Preferences > Show Internal ID.*

Je kunt interne ID's van aangepaste segmenten in NetSuite vinden onder:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klik op een aangepast segment.
3. Klik op de hyperlink naast *Custom Record Type*.
4. Zoek de interne ID in de tabel onderaan.

_Voor meer gedetailleerde instructies kun je [onze help-pagina bezoeken](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `U kunt interne ID’s van aangepaste records in NetSuite vinden door deze stappen te volgen:

1. Voer "Transaction Line Fields" in de globale zoekopdracht in.
2. Klik op een aangepast record.
3. Zoek de interne ID aan de linkerkant.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Wat is de script-ID?',
                            customSegmentScriptIDFooter: `Je kunt aangepaste segmentscript-ID’s in NetSuite vinden onder: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klik op een aangepast segment.
3. Klik onderaan op het tabblad *Application and Sourcing* en doe vervolgens het volgende:
    a. Als je het aangepaste segment als een *tag* (op regelniveau) in Expensify wilt weergeven, klik op het subtabblad *Transaction Columns* en gebruik de *Field ID*.
    b. Als je het aangepaste segment als een *report field* (op rapportniveau) in Expensify wilt weergeven, klik op het subtabblad *Transactions* en gebruik de *Field ID*.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Wat is de transactiekolom-ID?',
                            customRecordScriptIDFooter: `Je kunt aangepaste recordscript-ID’s in NetSuite vinden onder:

1. Voer “Transaction Line Fields” in bij de globale zoekfunctie.
2. Klik op een aangepast record.
3. Vind de script-ID aan de linkerkant.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Hoe moet dit aangepaste segment worden weergegeven in Expensify?',
                            customRecordMappingTitle: 'Hoe moet dit aangepaste record worden weergegeven in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Een aangepast segment/record met deze ${fieldName?.toLowerCase()} bestaat al`,
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
                            transactionFieldIDTitle: 'Wat is de transactieveld-ID?',
                            transactionFieldIDFooter: `Je kunt transactieveld-ID’s in NetSuite vinden door deze stappen te volgen:

1. Voer “Transaction Line Fields” in bij de globale zoekopdracht.
2. Klik op een aangepaste lijst.
3. Zoek de transactieveld-ID aan de linkerkant.

_Voor meer gedetailleerde instructies, [bezoek onze helppagina](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Hoe moet deze aangepaste lijst worden weergegeven in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Er bestaat al een aangepaste lijst met deze transactieveldid-ID`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Standaard NetSuite-medewerker',
                        description: 'Niet geïmporteerd in Expensify, toegepast bij export',
                        footerContent: (importField: string) =>
                            `Als u ${importField} in NetSuite gebruikt, passen we de standaardwaarde die is ingesteld op de medewerkerskaart toe bij het exporteren naar Expense Report of Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'Regelniveau',
                        footerContent: (importField: string) => `${startCase(importField)} kan worden geselecteerd voor elke afzonderlijke uitgave op het rapport van een medewerker.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Rapportvelden',
                        description: 'Rapportniveau',
                        footerContent: (importField: string) => `De selectie ${startCase(importField)} is van toepassing op alle kosten op het rapport van een werknemer.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct-configuratie',
            prerequisitesTitle: 'Voordat je verbinding maakt...',
            downloadExpensifyPackage: 'Download het Expensify-pakket voor Sage Intacct',
            followSteps: 'Volg de stappen in onze instructies ‘How-to: Verbinding maken met Sage Intacct’',
            enterCredentials: 'Voer je Sage Intacct-inloggegevens in',
            entity: 'Entiteit',
            employeeDefault: 'Standaard werknemer Sage Intacct',
            employeeDefaultDescription: 'De standaardafdeling van de werknemer wordt, indien beschikbaar, toegepast op hun uitgaven in Sage Intacct.',
            displayedAsTagDescription: 'Afdeling zal selecteerbaar zijn voor elke afzonderlijke uitgave op het rapport van een werknemer.',
            displayedAsReportFieldDescription: 'De afdelingsselectie is van toepassing op alle uitgaven in het rapport van een medewerker.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Kies hoe je Sage Intacct-<strong>${mappingTitle}</strong> in Expensify wilt verwerken.`,
            expenseTypes: 'Onkostypen',
            expenseTypesDescription: 'Uw Sage Intacct-onkostypen worden in Expensify geïmporteerd als categorieën.',
            accountTypesDescription: 'Je Sage Intacct-rekeningschema wordt in Expensify geïmporteerd als categorieën.',
            importTaxDescription: 'Importeer aankoopbelastingtarief uit Sage Intacct.',
            userDefinedDimensions: 'Door de gebruiker gedefinieerde dimensies',
            addUserDefinedDimension: 'Gebruikersgedefinieerde dimensie toevoegen',
            integrationName: 'Naam van integratie',
            dimensionExists: 'Er bestaat al een dimensie met deze naam.',
            removeDimension: 'Gebruikersgedefinieerde dimensie verwijderen',
            removeDimensionPrompt: 'Weet je zeker dat je deze door de gebruiker gedefinieerde dimensie wilt verwijderen?',
            userDefinedDimension: 'Door de gebruiker gedefinieerde dimensie',
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
                        return 'locaties';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'klanten';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'projecten (klussen)';
                    default:
                        return 'toewijzingen';
                }
            },
        },
        type: {
            free: 'Gratis',
            control: 'Beheer',
            collect: 'Innen',
        },
        companyCards: {
            addCards: 'Kaarten toevoegen',
            selectCards: 'Kaarten selecteren',
            addNewCard: {
                other: 'Overig',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard zakelijke kaarten',
                    vcf: 'Visa zakelijke kaarten',
                    stripe: 'Stripe-kaarten',
                },
                yourCardProvider: `Wie is de uitgever van je kaart?`,
                whoIsYourBankAccount: 'Wat is uw bank?',
                whereIsYourBankLocated: 'Waar is uw bank gevestigd?',
                howDoYouWantToConnect: 'Hoe wil je verbinding maken met je bank?',
                learnMoreAboutOptions: `<muted-text>Lees meer over deze <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">opties</a>.</muted-text>`,
                commercialFeedDetails: 'Vereist een instelling met uw bank. Dit wordt meestal gebruikt door grotere bedrijven en is vaak de beste optie als u ervoor in aanmerking komt.',
                commercialFeedPlaidDetails: `Vereist instellingen bij je bank, maar wij begeleiden je daarbij. Dit is meestal alleen beschikbaar voor grotere bedrijven.`,
                directFeedDetails: 'De eenvoudigste aanpak. Maak direct verbinding met je hoofdgegevens. Deze methode komt het meest voor.',
                enableFeed: {
                    title: (provider: string) => `Schakel je ${provider}-feed in`,
                    heading:
                        'We hebben een directe integratie met de uitgever van je kaart en kunnen je transactiegegevens snel en nauwkeurig in Expensify importeren.\n\nOm te beginnen hoef je alleen maar:',
                    visa: 'We hebben wereldwijde integraties met Visa, al verschilt de geschiktheid per bank en kaartprogramma.\n\nOm te beginnen hoeft u alleen maar:',
                    mastercard:
                        'We hebben wereldwijde integraties met Mastercard, al verschilt de geschiktheid per bank en kaartprogramma.\n\nOm te beginnen hoef je alleen het volgende te doen:',
                    vcf: `1. Bezoek [dit helpartikel](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) voor gedetailleerde instructies over het instellen van je Visa Commercial Cards.

2. [Neem contact op met je bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) om te verifiëren dat zij een commerciële feed voor je programma ondersteunen en vraag hen om deze in te schakelen.

3. *Zodra de feed is ingeschakeld en je de gegevens hebt, ga verder naar het volgende scherm.*`,
                    gl1025: `1. Bezoek [dit helpartikel](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) om te achterhalen of American Express een commerciële feed voor je programma kan inschakelen.

2. Zodra de feed is ingeschakeld, stuurt Amex je een productbrief.

3. *Zodra je de feedinformatie hebt, ga je door naar het volgende scherm.*`,
                    cdf: `1. Bezoek [dit helpartikel](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) voor gedetailleerde instructies over het instellen van je Mastercard Commercial Cards.

 2. [Neem contact op met je bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) om te controleren of zij een commerciële feed voor je programma ondersteunen, en vraag hen deze in te schakelen.

3. *Zodra de feed is ingeschakeld en je de gegevens hebt, ga je verder naar het volgende scherm.*`,
                    stripe: `1. Ga naar het Stripe-dashboard en open [Instellingen](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Klik onder Productintegraties op Inschakelen naast Expensify.

3. Zodra de feed is ingeschakeld, klik je hieronder op Verzenden en gaan wij ermee aan de slag om deze toe te voegen.`,
                },
                whatBankIssuesCard: 'Welke bank geeft deze kaarten uit?',
                enterNameOfBank: 'Voer de naam van de bank in',
                feedDetails: {
                    vcf: {
                        title: 'Wat zijn de details van de Visa-feed?',
                        processorLabel: 'Processor-ID',
                        bankLabel: 'ID financiële instelling (bank)',
                        companyLabel: 'Bedrijfs-ID',
                        helpLabel: "Waar vind ik deze ID's?",
                    },
                    gl1025: {
                        title: `Wat is de bestandsnaam van het Amex-leveringsbestand?`,
                        fileNameLabel: 'Bestandsnaam voor levering',
                        helpLabel: 'Waar vind ik de bestandsnaam van de levering?',
                    },
                    cdf: {
                        title: `Wat is de Mastercard-distributie-ID?`,
                        distributionLabel: 'Distributie-ID',
                        helpLabel: 'Waar vind ik de distributie-ID?',
                    },
                },
                amexCorporate: 'Selecteer dit als op de voorkant van je kaarten “Corporate” staat',
                amexBusiness: 'Selecteer dit als op de voorkant van je kaarten “Business” staat',
                amexPersonal: 'Selecteer dit als je kaarten privé zijn',
                error: {
                    pleaseSelectProvider: 'Selecteer een kaartaanbieder voordat je doorgaat',
                    pleaseSelectBankAccount: 'Selecteer een bankrekening voordat je verdergaat',
                    pleaseSelectBank: 'Selecteer een bank voordat je verdergaat',
                    pleaseSelectCountry: 'Selecteer een land voordat je verdergaat',
                    pleaseSelectFeedType: 'Selecteer een feedtype voordat je doorgaat',
                },
                exitModal: {
                    title: 'Werkt er iets niet?',
                    prompt: 'We merkten dat je het toevoegen van je kaarten niet hebt afgemaakt. Als je een probleem bent tegengekomen, laat het ons weten zodat we je kunnen helpen alles weer op de rails te krijgen.',
                    confirmText: 'Probleem melden',
                    cancelText: 'Overslaan',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Laatste dag van de maand',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Laatste werkdag van de maand',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Aangepaste dag van de maand',
            },
            assign: 'Toewijzen',
            assignCard: 'Kaart toewijzen',
            findCard: 'Kaart zoeken',
            cardNumber: 'Kaartnummer',
            commercialFeed: 'Commerciële feed',
            feedName: (feedName: string) => `${feedName}-kaarten`,
            directFeed: 'Directe feed',
            whoNeedsCardAssigned: 'Wie heeft een kaart toegewezen nodig?',
            chooseTheCardholder: 'Kies de kaarthouder',
            chooseCard: 'Kies een kaart',
            chooseCardFor: (assignee: string) =>
                `Kies een kaart voor <strong>${assignee}</strong>. Kunt u de kaart die u zoekt niet vinden? <concierge-link>Laat het ons weten.</concierge-link>`,
            noActiveCards: 'Geen actieve kaarten in deze feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Of er is iets misgegaan. Hoe dan ook, als je vragen hebt, kun je altijd <concierge-link>contact opnemen met Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Kies een startdatum voor transacties',
            startDateDescription: 'Kies je startdatum voor importeren. We synchroniseren alle transacties vanaf deze datum.',
            fromTheBeginning: 'Vanaf het begin',
            customStartDate: 'Aangepaste startdatum',
            customCloseDate: 'Aangepaste afsluitdatum',
            letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
            confirmationDescription: 'We beginnen onmiddellijk met het importeren van transacties.',
            card: 'Kaart',
            cardName: 'Kaartnaam',
            brokenConnectionError: '<rbr>De verbinding met de kaartfeed is verbroken. <a href="#">Log in bij je bank</a> zodat we de verbinding opnieuw kunnen tot stand brengen.</rbr>',
            assignedCard: (assignee: string, link: string) => `heeft ${assignee} een ${link} toegewezen! Geïmporteerde transacties verschijnen in deze chat.`,
            companyCard: 'bedrijfskaart',
            chooseCardFeed: 'Kaartfeed kiezen',
            ukRegulation:
                'Expensify Limited is een agent van Plaid Financial Ltd., een erkende betaaldienstinstelling die wordt gereguleerd door de Financial Conduct Authority onder de Payment Services Regulations 2017 (Firm Reference Number: 804718). Plaid levert jou gereguleerde rekeninginformatiediensten via Expensify Limited als zijn agent.',
            assignCardFailedError: 'Kaarttoewijzing mislukt.',
            cardAlreadyAssignedError: 'Deze kaart is al toegewezen aan een gebruiker in een andere workspace.',
        },
        expensifyCard: {
            issueAndManageCards: 'Geef Expensify Cards uit en beheer ze',
            getStartedIssuing: 'Begin door je eerste virtuele of fysieke kaart uit te geven.',
            verificationInProgress: 'Verificatie wordt uitgevoerd...',
            verifyingTheDetails: 'We controleren een paar gegevens. Concierge laat je weten wanneer Expensify Cards klaar zijn om uit te geven.',
            disclaimer:
                'De Expensify Visa® Commercial Card wordt uitgegeven door The Bancorp Bank, N.A., lid FDIC, op grond van een licentie van Visa U.S.A. Inc. en kan mogelijk niet worden gebruikt bij alle handelaren die Visa-kaarten accepteren. Apple® en het Apple-logo® zijn handelsmerken van Apple Inc., geregistreerd in de VS en andere landen. App Store is een servicemerk van Apple Inc. Google Play en het Google Play-logo zijn handelsmerken van Google LLC.',
            euUkDisclaimer:
                'Kaarten verstrekt aan ingezetenen van de EER worden uitgegeven door Transact Payments Malta Limited en kaarten verstrekt aan ingezetenen van het VK worden uitgegeven door Transact Payments Limited krachtens een licentie van Visa Europe Limited. Transact Payments Malta Limited is naar behoren gemachtigd en gereguleerd door de Malta Financial Services Authority als een financiële instelling onder de Financial Institution Act 1994. Registratienummer C 91879. Transact Payments Limited is gemachtigd en gereguleerd door de Gibraltar Financial Service Commission.',
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
                'We houden rekening met een aantal factoren bij het berekenen van je resterende limiet: je klantduur, de bedrijfsinformatie die je bij het aanmelden hebt opgegeven en het beschikbare saldo op je zakelijke bankrekening. Je resterende limiet kan dagelijks fluctueren.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'De cashback-saldo is gebaseerd op de vereffende maandelijkse uitgaven met de Expensify Card in je workspace.',
            issueNewCard: 'Nieuwe kaart uitgeven',
            finishSetup: 'Setup voltooien',
            chooseBankAccount: 'Kies bankrekening',
            chooseExistingBank: 'Kies een bestaande zakelijke bankrekening om je Expensify Card-saldo te betalen, of voeg een nieuwe bankrekening toe',
            accountEndingIn: 'Rekening eindigend op',
            addNewBankAccount: 'Nieuwe bankrekening toevoegen',
            settlementAccount: 'Verrekeningrekening',
            settlementAccountDescription: 'Kies een rekening om het saldo van je Expensify Card te betalen.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Zorg ervoor dat deze rekening overeenkomt met je <a href="${reconciliationAccountSettingsLink}">afstemmingsrekening</a> (${accountNumber}), zodat Continue Afstemming goed werkt.`,
            settlementFrequency: 'Afrekenfrequentie',
            settlementFrequencyDescription: 'Kies hoe vaak je je Expensify Card-saldo betaalt.',
            settlementFrequencyInfo: 'Als je wilt overschakelen naar maandelijkse afrekening, moet je je bankrekening koppelen via Plaid en een positieve saldohistorie van 90 dagen hebben.',
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
            smartLimitWarning: (limit: number | string) =>
                `Als je de limiet van deze kaart wijzigt naar ${limit}, worden nieuwe transacties afgewezen totdat je meer uitgaven op de kaart goedkeurt.`,
            monthlyLimitWarning: (limit: number | string) => `Als u de limiet van deze kaart wijzigt naar ${limit}, worden nieuwe transacties tot volgende maand geweigerd.`,
            fixedLimitWarning: (limit: number | string) => `Als u de limiet van deze kaart wijzigt naar ${limit}, worden nieuwe transacties geweigerd.`,
            changeCardLimitType: 'Type kaartlimiet wijzigen',
            changeLimitType: 'Limiettype wijzigen',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `Als je het limiettype van deze kaart wijzigt naar Slimme limiet, worden nieuwe transacties geweigerd omdat de onbevestigde limiet van ${limit} al is bereikt.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Als je het limiettype van deze kaart wijzigt naar Maandelijks, worden nieuwe transacties geweigerd omdat de maandelijkse limiet van ${limit} al is bereikt.`,
            addShippingDetails: 'Voeg verzendgegevens toe',
            issuedCard: (assignee: string) => `heeft een Expensify Card uitgegeven aan ${assignee}! De kaart wordt binnen 2-3 werkdagen bezorgd.`,
            issuedCardNoShippingDetails: (assignee: string) => `heeft een Expensify Card uitgegeven aan ${assignee}! De kaart wordt verzonden zodra de verzendgegevens zijn bevestigd.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `heeft een virtuele Expensify Card uitgegeven aan ${assignee}! De ${link} kan meteen worden gebruikt.`,
            addedShippingDetails: (assignee: string) => `${assignee} heeft verzendgegevens toegevoegd. Expensify Card wordt binnen 2-3 werkdagen bezorgd.`,
            replacedCard: (assignee: string) => `${assignee} heeft hun Expensify Card vervangen. De nieuwe kaart wordt binnen 2-3 werkdagen bezorgd.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} heeft hun virtuele Expensify Card vervangen! De ${link} kan meteen worden gebruikt.`,
            card: 'kaart',
            replacementCard: 'vervangende kaart',
            verifyingHeader: 'Controleren',
            bankAccountVerifiedHeader: 'Bankrekening geverifieerd',
            verifyingBankAccount: 'Bankrekening wordt gecontroleerd...',
            verifyingBankAccountDescription: 'Even geduld terwijl we bevestigen dat deze account kan worden gebruikt om Expensify Cards uit te geven.',
            bankAccountVerified: 'Bankrekening geverifieerd!',
            bankAccountVerifiedDescription: 'Je kunt nu Expensify Cards uitgeven aan de leden van je werkruimte.',
            oneMoreStep: 'Nog één stap...',
            oneMoreStepDescription: 'Het lijkt erop dat we je bankrekening handmatig moeten verifiëren. Ga naar Concierge, waar de instructies voor je klaarstaan.',
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
            spendCategoriesDescription: 'Pas de categorisering van uitgaven per handelaar aan voor creditcardtransacties en gescande bonnetjes.',
            deleteFailureMessage: 'Er is een fout opgetreden bij het verwijderen van de categorie, probeer het alsjeblieft opnieuw',
            categoryName: 'Categorienaam',
            requiresCategory: 'Leden moeten alle uitgaven categoriseren',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Alle uitgaven moeten worden gecategoriseerd om naar ${connectionName} te kunnen exporteren.`,
            subtitle: 'Krijg een beter overzicht van waar geld wordt uitgegeven. Gebruik onze standaardcategorieën of voeg je eigen categorieën toe.',
            emptyCategories: {
                title: 'Je hebt nog geen categorieën aangemaakt',
                subtitle: 'Voeg een categorie toe om je uitgaven te organiseren.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Je categorieën worden momenteel geïmporteerd vanuit een boekhoudkundige koppeling. Ga naar <a href="${accountingPageURL}">boekhouding</a> om wijzigingen aan te brengen.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de categorie, probeer het opnieuw',
            createFailureMessage: 'Er is een fout opgetreden bij het aanmaken van de categorie, probeer het alsjeblieft opnieuw',
            addCategory: 'Categorie toevoegen',
            editCategory: 'Categorie bewerken',
            editCategories: 'Categorieën bewerken',
            findCategory: 'Categorie zoeken',
            categoryRequiredError: 'Categorienaam is verplicht',
            existingCategoryError: 'Er bestaat al een categorie met deze naam',
            invalidCategoryName: 'Ongeldige categorienaam',
            importedFromAccountingSoftware: 'De onderstaande categorieën zijn geïmporteerd uit je',
            payrollCode: 'Payrollcode',
            updatePayrollCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de salariscode, probeer het opnieuw.',
            glCode: 'Grootboekcode',
            updateGLCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de GL-code, probeer het opnieuw.',
            importCategories: 'Categorieën importeren',
            cannotDeleteOrDisableAllCategories: {
                title: 'Kan niet alle categorieën verwijderen of uitschakelen',
                description: `Er moet minstens één categorie ingeschakeld blijven, omdat je workspace categorieën vereist.`,
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
                subtitle: 'Voeg controles toe die helpen de uitgaven binnen het budget te houden.',
            },
            earnSection: {
                title: 'Verdienen',
                subtitle: 'Stroomlijn je inkomsten en laat je sneller betalen.',
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
            travel: {
                title: 'Reizen',
                subtitle: 'Boek, beheer en reconcilieer al je zakelijke reizen.',
                getStarted: {
                    title: 'Aan de slag met Expensify Travel',
                    subtitle: 'We hebben nog maar een paar extra gegevens over je bedrijf nodig, dan ben je klaar voor vertrek.',
                    ctaText: 'Laten we gaan',
                },
                reviewingRequest: {
                    title: 'Pak je koffers, we hebben je verzoek ontvangen...',
                    subtitle: 'We beoordelen je verzoek om Expensify Travel in te schakelen. Maak je geen zorgen, we laten het je weten zodra het klaar is.',
                    ctaText: 'Verzoek verzonden',
                },
                bookOrManageYourTrip: {
                    title: 'Boek of beheer je reis',
                    subtitle: 'Gebruik Expensify Travel om de beste reisaanbiedingen te krijgen en al je zakelijke uitgaven op één plek te beheren.',
                    ctaText: 'Boeken of beheren',
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: 'Reisboeking',
                        subtitle: 'Gefeliciteerd! Je bent helemaal klaar om reizen in deze workspace te boeken en te beheren.',
                        manageTravelLabel: 'Reizen beheren',
                    },
                    centralInvoicingSection: {
                        title: 'Gecentraliseerde facturatie',
                        subtitle: 'Centraliseer alle reiskosten in één maandelijkse factuur in plaats van bij aankoop te betalen.',
                        learnHow: 'Ontdek hoe.',
                        subsections: {
                            currentTravelSpendLabel: 'Huidige reisuitgaven',
                            currentTravelSpendCta: 'Saldo betalen',
                            currentTravelLimitLabel: 'Huidige reisl imiet',
                            settlementAccountLabel: 'Verrekeningrekening',
                            settlementFrequencyLabel: 'Afrekenfrequentie',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Krijg inzicht en grip op uitgaven.',
                disableCardTitle: 'Expensify Card uitschakelen',
                disableCardPrompt: 'Je kunt de Expensify Card niet uitschakelen omdat deze al in gebruik is. Neem contact op met Concierge voor de volgende stappen.',
                disableCardButton: 'Chatten met Concierge',
                feed: {
                    title: 'Vraag de Expensify Card aan',
                    subTitle: 'Stroomlijn je zakelijke uitgaven en bespaar tot 50% op je Expensify‑rekening, plus:',
                    features: {
                        cashBack: 'Cashback op elke aankoop in de VS',
                        unlimited: 'Onbeperkte virtuele kaarten',
                        spend: 'Bestedingscontroles en aangepaste limieten',
                    },
                    ctaTitle: 'Nieuwe kaart uitgeven',
                },
            },
            companyCards: {
                title: 'Bedrijfskaarten',
                subtitle: 'Koppel de kaarten die je al hebt.',
                feed: {
                    title: 'Gebruik je eigen kaarten (BYOC)',
                    subtitle: 'Koppel de kaarten die je al hebt voor automatische transactie-import, matchen van bonnen en afstemming.',
                    features: {
                        support: 'Koppel kaarten van meer dan 10.000 banken',
                        assignCards: 'Koppel de bestaande kaarten van je team',
                        automaticImport: 'We halen transacties automatisch binnen',
                    },
                },
                bankConnectionError: 'Probleem met bankverbinding',
                connectWithPlaid: 'via Plaid verbinden',
                connectWithExpensifyCard: 'probeer de Expensify Card.',
                bankConnectionDescription: `Probeer je kaarten opnieuw toe te voegen. Anders kun je`,
                disableCardTitle: 'Bedrijfskaarten uitschakelen',
                disableCardPrompt: 'Je kunt bedrijfskaarten niet uitschakelen omdat deze functie in gebruik is. Neem contact op met de Concierge voor de volgende stappen.',
                disableCardButton: 'Chatten met Concierge',
                cardDetails: 'Kaartgegevens',
                cardNumber: 'Kaartnummer',
                cardholder: 'Kaarthouder',
                cardName: 'Kaartnaam',
                allCards: 'Alle kaarten',
                assignedCards: 'Toegewezen',
                unassignedCards: 'Niet-toegewezen',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()}-export` : `${integration}-export`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Kies de ${integration}-rekening waarnaar transacties moeten worden geëxporteerd.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Kies de ${integration}-rekening waarnaar transacties moeten worden geëxporteerd. Selecteer een andere <a href="${exportPageLink}">exportoptie</a> om de beschikbare rekeningen te wijzigen.`,
                lastUpdated: 'Laatst bijgewerkt',
                transactionStartDate: 'Begindatum transactie',
                updateCard: 'Kaart bijwerken',
                unassignCard: 'Kaart loskoppelen',
                unassign: 'Toewijzen ongedaan maken',
                unassignCardDescription: 'Het loskoppelen van deze kaart verwijdert alle transacties in conceptrapporten uit de rekening van de kaarthouder.',
                assignCard: 'Kaart toewijzen',
                cardFeedName: 'Naam kaartfeed',
                cardFeedNameDescription: 'Geef de kaartfeed een unieke naam zodat je die van de andere kunt onderscheiden.',
                cardFeedTransaction: 'Transacties verwijderen',
                cardFeedTransactionDescription: 'Kies of kaarthouders kaarttransacties kunnen verwijderen. Nieuwe transacties volgen deze regels.',
                cardFeedRestrictDeletingTransaction: 'Beperken van het verwijderen van transacties',
                cardFeedAllowDeletingTransaction: 'Verwijderen van transacties toestaan',
                removeCardFeed: 'Kaartfeed verwijderen',
                removeCardFeedTitle: (feedName: string) => `${feedName}-feed verwijderen`,
                removeCardFeedDescription: 'Weet je zeker dat je deze kaartfeed wilt verwijderen? Hierdoor worden alle kaarten losgekoppeld.',
                error: {
                    feedNameRequired: 'Naam kaartfeed is vereist',
                    statementCloseDateRequired: 'Selecteer een afschriftdatum.',
                },
                corporate: 'Beperken van het verwijderen van transacties',
                personal: 'Verwijderen van transacties toestaan',
                setFeedNameDescription: 'Geef de kaartfeed een unieke naam zodat je deze kunt onderscheiden van de andere feeds',
                setTransactionLiabilityDescription: 'Indien ingeschakeld kunnen kaarthouders kaarttransacties verwijderen. Nieuwe transacties zullen deze regel volgen.',
                emptyAddedFeedTitle: 'Geen kaarten in deze feed',
                emptyAddedFeedDescription: 'Zorg ervoor dat er kaarten staan in de kaartfeed van uw bank.',
                pendingFeedTitle: `We beoordelen je verzoek...`,
                pendingFeedDescription: `We beoordelen momenteel je feedgegevens. Zodra dat is afgerond, nemen we contact met je op via`,
                pendingBankTitle: 'Controleer uw browservenster',
                pendingBankDescription: (bankName: string) => `Maak verbinding met ${bankName} via het browservenster dat zojuist is geopend. Als er geen venster is geopend,`,
                pendingBankLink: 'klik hier alsjeblieft',
                giveItNameInstruction: 'Geef de kaart een naam die haar onderscheidt van andere kaarten.',
                updating: 'Bijwerken...',
                neverUpdated: 'Nooit',
                noAccountsFound: 'Geen accounts gevonden',
                defaultCard: 'Standaardkaart',
                downgradeTitle: `Kan werkruimte niet downgraden`,
                downgradeSubTitle: `Deze werkruimte kan niet worden verlaagd omdat er meerdere kaartfeeds zijn verbonden (Expensify Cards niet meegerekend). <a href="#">Houd slechts één kaartfeed aan</a> om door te gaan.`,
                noAccountsFoundDescription: (connection: string) => `Voeg het account toe in ${connection} en synchroniseer de koppeling opnieuw`,
                expensifyCardBannerTitle: 'Vraag de Expensify Card aan',
                expensifyCardBannerSubtitle: 'Profiteer van cashbacks op elke aankoop in de VS, tot 50% korting op je Expensify-factuur, onbeperkte virtuele kaarten en nog veel meer.',
                expensifyCardBannerLearnMoreButton: 'Meer informatie',
                statementCloseDateTitle: 'Sluitingsdatum afschrift',
                statementCloseDateDescription: 'Laat ons weten wanneer je kaartafschrift sluit, dan maken wij een overeenkomend afschrift in Expensify aan.',
            },
            workflows: {
                title: 'Workflows',
                subtitle: 'Configureer hoe uitgaven worden goedgekeurd en betaald.',
                disableApprovalPrompt:
                    'Expensify Cards van deze werkruimte zijn momenteel afhankelijk van goedkeuring om hun Smart Limits te bepalen. Pas de type limieten aan van alle Expensify Cards met Smart Limits voordat je goedkeuringen uitschakelt.',
            },
            invoices: {
                title: 'Facturen',
                subtitle: 'Facturen verzenden en ontvangen.',
            },
            categories: {
                title: 'Categorieën',
                subtitle: 'Volg en orden uw uitgaven.',
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
                subtitle: 'Synchroniseer uw grootboekrekeningen en meer.',
            },
            receiptPartners: {
                title: 'Bonpartners',
                subtitle: 'Bonnetjes automatisch importeren.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Niet zo snel...',
                featureEnabledText: 'Om deze functie in of uit te schakelen, moet je je boekhoudimport-instellingen wijzigen.',
                disconnectText: 'Om boekhouding uit te schakelen, moet je de boekhoudkoppeling van je werkruimte loskoppelen.',
                manageSettings: 'Instellingen beheren',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Verbinding met Uber verbreken',
                disconnectText: 'Om deze functie uit te schakelen, moet je eerst de Uber for Business-integratie ontkoppelen.',
                description: 'Weet je zeker dat je deze integratie wilt ontkoppelen?',
                confirmText: 'Begrepen',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Niet zo snel...',
                featureEnabledText:
                    'Expensify Cards in deze workspace zijn afhankelijk van goedkeuringsworkflows om hun Smart Limits te bepalen.\n\nWijzig het type limiet van alle kaarten met Smart Limits voordat je workflows uitschakelt.',
                confirmText: 'Ga naar Expensify Cards',
            },
            rules: {
                title: 'Regels',
                subtitle: 'Vereis bonnetjes, markeer hoge uitgaven en meer.',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Voorbeelden:',
            customReportNamesSubtitle: `<muted-text>Pas rapporttitels aan met behulp van onze <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">uitgebreide formules</a>.</muted-text>`,
            customNameTitle: 'Standaardrapporttitel',
            customNameDescription: `Kies een aangepaste naam voor onkostendeclaraties met behulp van onze <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">uitgebreide formules</a>.`,
            customNameInputLabel: 'Naam',
            customNameEmailPhoneExample: 'E-mailadres of telefoonnummer van lid: {report:submit:from}',
            customNameStartDateExample: 'Begindatum rapport: {report:startdate}',
            customNameWorkspaceNameExample: 'Werkruimtenaam: {report:workspacename}',
            customNameReportIDExample: 'Rapport-ID: {report:id}',
            customNameTotalExample: 'Totaal: {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Leden verhinderen aangepaste rapporttitels te wijzigen',
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
                subtitle: 'Voeg een aangepast veld (tekst, datum of keuzelijst) toe dat op rapporten verschijnt.',
            },
            subtitle: 'Rapportvelden zijn van toepassing op alle uitgaven en kunnen handig zijn wanneer je om extra informatie wilt vragen.',
            disableReportFields: 'Rapportvelden uitschakelen',
            disableReportFieldsConfirmation: 'Weet je het zeker? Tekst- en datumvelden worden verwijderd en lijsten worden uitgeschakeld.',
            importedFromAccountingSoftware: 'De onderstaande rapportvelden worden geïmporteerd van je',
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
            initialValueInputSubtitle: 'Voer een startwaarde in om in het rapportveld weer te geven.',
            listValuesInputSubtitle: 'Deze waarden verschijnen in de keuzelijst van je rapportveld. Ingeschakelde waarden kunnen door leden worden geselecteerd.',
            listInputSubtitle: 'Deze waarden verschijnen in de lijst met rapportvelden. Ingeschakelde waarden kunnen door leden worden geselecteerd.',
            deleteValue: 'Waarde verwijderen',
            deleteValues: 'Waarden verwijderen',
            disableValue: 'Waarde uitschakelen',
            disableValues: 'Waarden uitschakelen',
            enableValue: 'Waarde inschakelen',
            enableValues: 'Waarden inschakelen',
            emptyReportFieldsValues: {
                title: 'Je hebt nog geen lijstwaarden gemaakt',
                subtitle: 'Voeg aangepaste waarden toe om op rapporten te verschijnen.',
            },
            deleteValuePrompt: 'Weet je zeker dat je deze lijstwaarde wilt verwijderen?',
            deleteValuesPrompt: 'Weet je zeker dat je deze lijstwaarden wilt verwijderen?',
            listValueRequiredError: 'Voer een lijstwaardenaam in',
            existingListValueError: 'Er bestaat al een lijstwaarde met deze naam',
            editValue: 'Waarde bewerken',
            listValues: 'Waarden weergeven',
            addValue: 'Waarde toevoegen',
            existingReportFieldNameError: 'Er bestaat al een rapportveld met deze naam',
            reportFieldNameRequiredError: 'Voer een rapportveldnaam in',
            reportFieldTypeRequiredError: 'Kies een rapveldtype',
            circularReferenceError: 'Dit veld kan niet naar zichzelf verwijzen. Werk het bij.',
            reportFieldInitialValueRequiredError: 'Kies een beginwaarde voor een rapportveld',
            genericFailureMessage: 'Er is een fout opgetreden bij het bijwerken van het rapportveld. Probeer het opnieuw.',
        },
        tags: {
            tagName: 'Tagnaam',
            requiresTag: 'Leden moeten alle uitgaven taggen',
            trackBillable: 'Factureerbare uitgaven bijhouden',
            customTagName: 'Aangepaste tagnaam',
            enableTag: 'Tag inschakelen',
            enableTags: 'Tags inschakelen',
            requireTag: 'Vereist label',
            requireTags: 'Labels vereisen',
            notRequireTags: 'Niet vereisen',
            disableTag: 'Tag uitschakelen',
            disableTags: 'Tags uitschakelen',
            addTag: 'Label toevoegen',
            editTag: 'Tag bewerken',
            editTags: 'Labels bewerken',
            findTag: 'Tag zoeken',
            subtitle: 'Labels bieden een meer gedetailleerde manier om kosten te classificeren.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>Je gebruikt <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">afhankelijke tags</a>. Je kunt <a href="${importSpreadsheetLink}">een spreadsheet opnieuw importeren</a> om je tags bij te werken.</muted-text>`,
            emptyTags: {
                title: 'Je hebt nog geen labels gemaakt',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Voeg een label toe om projecten, locaties, afdelingen en meer bij te houden.',
                subtitleHTML: `<muted-text><centered-text>Voeg tags toe om projecten, locaties, afdelingen en meer bij te houden. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Meer informatie</a> over het opmaken van tagbestanden voor import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Je tags worden momenteel geïmporteerd via een boekhoudkoppeling. Ga naar <a href="${accountingPageURL}">Boekhouding</a> om wijzigingen aan te brengen.</centered-text></muted-text>`,
            },
            deleteTag: 'Label verwijderen',
            deleteTags: 'Labels verwijderen',
            deleteTagConfirmation: 'Weet je zeker dat je deze tag wilt verwijderen?',
            deleteTagsConfirmation: 'Weet je zeker dat je deze labels wilt verwijderen?',
            deleteFailureMessage: 'Er is een fout opgetreden bij het verwijderen van de tag, probeer het opnieuw',
            tagRequiredError: 'Tagnaam is verplicht',
            existingTagError: 'Er bestaat al een tag met deze naam',
            invalidTagNameError: 'Tagnaam kan niet 0 zijn. Kies een andere waarde.',
            genericFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de tag, probeer het opnieuw',
            importedFromAccountingSoftware: 'De onderstaande tags zijn geïmporteerd uit je',
            glCode: 'Grootboekcode',
            updateGLCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de GL-code, probeer het opnieuw.',
            tagRules: 'Labelregels',
            approverDescription: 'Fiatteur',
            importTags: 'Tags importeren',
            importTagsSupportingText: 'Codeer je uitgaven met één type tag of met meerdere.',
            configureMultiLevelTags: 'Configureer je lijst met labels voor labelen op meerdere niveaus.',
            importMultiLevelTagsSupportingText: `Hier is een voorbeeld van je labels. Als alles er goed uitziet, klik dan hieronder om ze te importeren.`,
            importMultiLevelTags: {
                firstRowTitle: 'De eerste rij is de titel voor elke taglijst',
                independentTags: 'Dit zijn onafhankelijke tags',
                glAdjacentColumn: 'Er staat een GL-code in de aangrenzende kolom',
            },
            tagLevel: {
                singleLevel: 'Enkel niveau tags',
                multiLevel: 'Tags op meerdere niveaus',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Wissel tag­niveaus',
                prompt1: 'Als je van tagniveau wisselt, worden alle huidige tags verwijderd.',
                prompt2: 'We raden je aan eerst',
                prompt3: 'een back-up downloaden',
                prompt4: 'door je labels te exporteren.',
                prompt5: 'Meer informatie',
                prompt6: 'over tagniveaus.',
            },
            overrideMultiTagWarning: {
                title: 'Tags importeren',
                prompt1: 'Weet je het zeker?',
                prompt2: 'De bestaande labels worden overschreven, maar je kunt',
                prompt3: 'een back-up downloaden',
                prompt4: 'eerst.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `We hebben *${columnCounts} kolommen* in je spreadsheet gevonden. Selecteer *Naam* naast de kolom die tagnamen bevat. Je kunt ook *Ingeschakeld* selecteren naast de kolom die de tagstatus instelt.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Kan niet alle labels verwijderen of uitschakelen',
                description: `Er moet ten minste één tag ingeschakeld blijven, omdat je workspace tags vereist.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Kan niet alle tags optioneel maken',
                description: `Er moet minstens één tag verplicht blijven, omdat je werkruimteeinstellungen tags vereisen.`,
            },
            cannotMakeTagListRequired: {
                title: 'Kan taglijst niet verplicht maken',
                description: 'U kunt een taglijst alleen verplicht stellen als uw beleid meerdere tag­niveaus heeft geconfigureerd.',
            },
            tagCount: () => ({
                one: '1 dag',
                other: (count: number) => `${count} labels`,
            }),
        },
        taxes: {
            subtitle: 'Belastingsnamen en -tarieven toevoegen en standaarden instellen.',
            addRate: 'Tarief toevoegen',
            workspaceDefault: 'Standaardwerkruimtemunteenheid',
            foreignDefault: 'Standaard vreemde valuta',
            customTaxName: 'Aangepaste belastingnaam',
            value: 'Waarde',
            taxReclaimableOn: 'Terugvorderbare belasting op',
            taxRate: 'Belastingtarief',
            findTaxRate: 'Belastingtarief zoeken',
            error: {
                taxRateAlreadyExists: 'Deze belastingnaam is al in gebruik',
                taxCodeAlreadyExists: 'Deze belastingcode is al in gebruik',
                valuePercentageRange: 'Voer een geldig percentage in tussen 0 en 100',
                customNameRequired: 'Aangepaste belastingnaam is vereist',
                deleteFailureMessage: 'Er is een fout opgetreden bij het verwijderen van het belastingtarief. Probeer het opnieuw of vraag Concierge om hulp.',
                updateFailureMessage: 'Er is een fout opgetreden bij het bijwerken van het belastingtarief. Probeer het opnieuw of vraag Concierge om hulp.',
                createFailureMessage: 'Er is een fout opgetreden bij het aanmaken van het belastingtarief. Probeer het opnieuw of vraag Concierge om hulp.',
                updateTaxClaimableFailureMessage: 'Het terugvorderbare deel moet lager zijn dan het kilometertariefbedrag',
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
            importedFromAccountingSoftware: 'De onderstaande belastingen zijn geïmporteerd van je',
            taxCode: 'Belastingcode',
            updateTaxCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de belastingcode, probeer het opnieuw.',
        },
        duplicateWorkspace: {
            title: 'Geef je nieuwe workspace een naam',
            selectFeatures: 'Kies functies om te kopiëren',
            whichFeatures: 'Welke functies wil je overzetten naar je nieuwe workspace?',
            confirmDuplicate: 'Wil je doorgaan?',
            categories: 'categorieën en je automatische categorisatieregels',
            reimbursementAccount: 'vergoedingsrekening',
            welcomeNote: 'Begin alsjeblieft mijn nieuwe werkruimte te gebruiken',
            delayedSubmission: 'vertraagde indiening',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Je staat op het punt ${newWorkspaceName ?? ''} te maken en te delen met ${totalMembers ?? 0} leden van de oorspronkelijke werkruimte.`,
            error: 'Er is een fout opgetreden bij het dupliceren van je nieuwe werkruimte. Probeer het opnieuw.',
        },
        emptyWorkspace: {
            title: 'Je hebt geen werkruimten',
            subtitle: 'Volg bonnen, vergoed uitgaven, beheer reizen, stuur facturen en meer.',
            createAWorkspaceCTA: 'Aan de slag',
            features: {
                trackAndCollect: 'Bonnetjes bijhouden en verzamelen',
                reimbursements: 'Werknemers terugbetalen',
                companyCards: 'Bedrijfskaarten beheren',
            },
            notFound: 'Geen workspace gevonden',
            description: 'Ruimtes zijn een geweldige plek om met meerdere mensen te overleggen en samen te werken. Maak of sluit je aan bij een werkruimte om te beginnen met samenwerken',
        },
        new: {
            newWorkspace: 'Nieuwe werkruimte',
            getTheExpensifyCardAndMore: 'Ontvang de Expensify Card en meer',
            confirmWorkspace: 'Werkruimte bevestigen',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mijn groepswerkruimte${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Werkruimte van ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Er is een fout opgetreden bij het verwijderen van een lid uit de werkruimte, probeer het opnieuw.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Weet je zeker dat je ${memberName} wilt verwijderen?`,
                other: 'Weet je zeker dat je deze leden wilt verwijderen?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} is een fiatteur in deze workspace. Wanneer je deze workspace niet meer met hen deelt, vervangen we hen in de fiatteringsworkflow door de workspace-eigenaar, ${ownerName}`,
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
            makeMember: () => ({
                one: 'Lid maken',
                other: 'Leden maken',
            }),
            makeAdmin: () => ({
                one: 'Beheerder maken',
                other: 'Beheerders maken',
            }),
            makeAuditor: () => ({
                one: 'Auditor maken',
                other: 'Maak accountants',
            }),
            selectAll: 'Alles selecteren',
            error: {
                genericAdd: 'Er is een probleem opgetreden bij het toevoegen van dit werkruimtelid',
                cannotRemove: 'Je kunt jezelf of de eigenaar van de werkruimte niet verwijderen',
                genericRemove: 'Er is een probleem opgetreden bij het verwijderen van dat werkruimtelid',
            },
            addedWithPrimary: 'Sommige leden zijn toegevoegd met hun primaire logins.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Toegevoegd door secundair login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Totaal aantal werkruimteleden: ${count}`,
            importMembers: 'Leden importeren',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Als je ${approver} uit deze workspace verwijdert, vervangen we diegene in de goedkeuringsworkflow door ${workspaceOwner}, de eigenaar van de workspace.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} heeft nog openstaande onkostendeclaraties om goed te keuren. Vraag hen deze goed te keuren of neem hun declaraties over voordat je hen uit de workspace verwijdert.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Je kunt ${memberName} niet uit deze werkruimte verwijderen. Stel eerst een nieuwe terugbetaler in via Workflows > Betalingen doen of volgen en probeer het daarna opnieuw.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Als je ${memberName} uit deze werkruimte verwijdert, vervangen we hen als de voorkeurs­exporteur door ${workspaceOwner}, de eigenaar van de werkruimte.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Als je ${memberName} uit deze workspace verwijdert, vervangen we hen als technisch contactpersoon door ${workspaceOwner}, de eigenaar van deze workspace.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} heeft een openstaand verwerkingsrapport waarvoor actie vereist is. Vraag hen om de vereiste actie te voltooien voordat je hen uit de werkruimte verwijdert.`,
        },
        card: {
            getStartedIssuing: 'Begin door je eerste virtuele of fysieke kaart uit te geven.',
            issueCard: 'Kaart uitgeven',
            issueNewCard: {
                whoNeedsCard: 'Wie heeft er een kaart nodig?',
                inviteNewMember: 'Nieuw lid uitnodigen',
                findMember: 'Lid zoeken',
                chooseCardType: 'Kies een kaarttype',
                physicalCard: 'Fysieke kaart',
                physicalCardDescription: 'Geweldig voor de frequente besteder',
                virtualCard: 'Virtuele kaart',
                virtualCardDescription: 'Direct en flexibel',
                chooseLimitType: 'Kies een limiettype',
                smartLimit: 'Slimme limiet',
                smartLimitDescription: 'Besteed tot een bepaald bedrag voordat goedkeuring vereist is',
                monthly: 'Maandelijks',
                monthlyDescription: 'Besteed tot een bepaald bedrag per maand',
                fixedAmount: 'Vast bedrag',
                fixedAmountDescription: 'Eénmalig tot een bepaald bedrag uitgeven',
                setLimit: 'Stel een limiet in',
                cardLimitError: 'Voer een bedrag in dat lager is dan $21.474.836',
                giveItName: 'Geef het een naam',
                giveItNameInstruction: 'Maak het uniek genoeg om het van andere kaarten te onderscheiden. Specifieke gebruikssituaties zijn nog beter!',
                cardName: 'Kaartnaam',
                letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
                willBeReadyToUse: 'Deze kaart is direct klaar voor gebruik.',
                willBeReadyToShip: 'Deze kaart is direct klaar om te verzenden.',
                cardholder: 'Kaarthouder',
                cardType: 'Kaarttype',
                limit: 'Limiet',
                limitType: 'Limiettype',
                disabledApprovalForSmartLimitError: 'Schakel eerst goedkeuringen in via <strong>Workflows > Add approvals</strong> voordat je slimme limieten instelt',
            },
            deactivateCardModal: {
                deactivate: 'Deactiveren',
                deactivateCard: 'Kaart deactiveren',
                deactivateConfirmation: 'Het deactiveren van deze kaart zal alle toekomstige transacties weigeren en kan niet ongedaan worden gemaakt.',
            },
        },
        accounting: {
            settings: 'instellingen',
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
            talkYourOnboardingSpecialist: 'Chat met je instelspecialist.',
            talkYourAccountManager: 'Chat met je accountmanager.',
            talkToConcierge: 'Chat met Concierge.',
            needAnotherAccounting: 'Nog een ander boekhoudpakket nodig?',
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
                `Er is een fout opgetreden bij een verbinding die is ingesteld in Expensify Classic. [Ga naar Expensify Classic om dit probleem op te lossen.](${oldDotPolicyConnectionsURL})`,
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
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integratie';
                return `Verbinding met ${integrationName} verbreken`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Verbind ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'boekhoudkundige integratie'}`,
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
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Geïmporteerd als labels',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Geïmporteerd',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Niet geïmporteerd',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Niet geïmporteerd',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Geïmporteerd als rapportvelden',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Standaard NetSuite-medewerker',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'deze integratie';
                return `Weet je zeker dat je ${integrationName} wilt loskoppelen?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Weet je zeker dat je ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'deze boekhoudkundige integratie'} wilt verbinden? Hiermee worden bestaande boekhoudkoppelingen verwijderd.`,
            enterCredentials: 'Voer je inloggegevens in',
            claimOffer: {
                badgeText: 'Aanbieding beschikbaar!',
                xero: {
                    headline: 'Krijg Xero 6 maanden gratis!',
                    description: '<muted-text><centered-text>Nieuw bij Xero? Expensify-klanten krijgen 6 maanden gratis. Claim hieronder je aanbieding.</centered-text></muted-text>',
                    connectButton: 'Verbinding maken met Xero',
                },
                uber: {
                    headerTitle: 'Uber voor Bedrijven',
                    headline: 'Krijg 5% korting op Uber-ritten',
                    description: `<muted-text><centered-text>Activeer Uber for Business via Expensify en bespaar 5% op alle zakelijke ritten tot en met juni. <a href="${CONST.UBER_TERMS_LINK}">Voorwaarden van toepassing.</a></centered-text></muted-text>`,
                    connectButton: 'Verbinding maken met Uber for Business',
                },
            },
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
                            return 'Classes importeren';
                        case 'quickbooksOnlineImportLocations':
                            return 'Locaties importeren';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Geïmporteerde gegevens verwerken';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Gerapporteerde terugbetalingen en rekeningbetalingen synchroniseren';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Belastingcodes importeren';
                        case 'quickbooksOnlineCheckConnection':
                            return 'QuickBooks Online-verbinding controleren';
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
                            return 'Beleid voor opslaan importeren';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Gegevens nog steeds synchroniseren met QuickBooks... Zorg ervoor dat de Web Connector actief is';
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
                            return 'Rekeningschema synchroniseren';
                        case 'xeroSyncImportCategories':
                            return 'Categorieën synchroniseren';
                        case 'xeroSyncImportCustomers':
                            return 'Klanten synchroniseren';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Expensify-rapporten als vergoed gemarkeerd';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Xero-facturen en -rekeningen als betaald markeren';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Bijhouden van volgcategorieën synchroniseren';
                        case 'xeroSyncImportBankAccounts':
                            return 'Bankrekeningen synchroniseren';
                        case 'xeroSyncImportTaxRates':
                            return 'Belastingschijven synchroniseren';
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
                            return 'Expensify-rapporten als vergoed gemarkeerd';
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
            preferredExporter: 'Voorkeurs-exporteur',
            exportPreferredExporterNote:
                'De voorkeurs-exporteur kan elke werkruimtebeheerder zijn, maar moet ook een domeinbeheerder zijn als je in Domeininstellingen verschillende exportrekeningen instelt voor individuele bedrijfskaarten.',
            exportPreferredExporterSubNote: 'Zodra dit is ingesteld, ziet de voorkeurs‑exporteur de rapporten om te exporteren in zijn/haar account.',
            exportAs: 'Exporteren als',
            exportOutOfPocket: 'Exporteer contante uitgaven als',
            exportCompanyCard: 'Bedrijfskosten op kaart exporteren als',
            exportDate: 'Exportdatum',
            defaultVendor: 'Standaardleverancier',
            autoSync: 'Automatisch synchroniseren',
            autoSyncDescription: 'Synchroniseer NetSuite en Expensify automatisch, elke dag. Exporteer het afgeronde rapport in realtime',
            reimbursedReports: 'Uitbetaalde rapporten synchroniseren',
            cardReconciliation: 'Kaartafstemming',
            reconciliationAccount: 'Afstemmingsrekening',
            continuousReconciliation: 'Doorlopende afstemming',
            saveHoursOnReconciliation:
                'Bespaar elk boekhoudkundig tijdvak uren aan reconciliatie door Expensify voortdurend Expensify Card‑afschriften en afrekeningen voor je te laten reconciliëren.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Om Continue Reconciliëren in te schakelen, schakel <a href="${accountingAdvancedSettingsLink}">autosynchronisatie</a> in voor ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Kies de bankrekening waarmee je betalingen met de Expensify Card worden afgestemd.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Zorg ervoor dat deze rekening overeenkomt met je <a href="${settlementAccountUrl}">Expensify Card-afrekenrekening</a> (eindigend op ${lastFourPAN}), zodat Continuele Afstemming goed werkt.`,
            },
        },
        export: {
            notReadyHeading: 'Nog niet klaar om te exporteren',
            notReadyDescription:
                'Concept- of in behandeling zijnde onkostendeclaraties kunnen niet naar het boekhoudsysteem worden geëxporteerd. Keur deze onkosten goed of betaal ze voordat je ze exporteert.',
        },
        invoices: {
            sendInvoice: 'Factuur verzenden',
            sendFrom: 'Verzenden van',
            invoicingDetails: 'Factuurgegevens',
            invoicingDetailsDescription: 'Deze informatie wordt weergegeven op je facturen.',
            companyName: 'Bedrijfsnaam',
            companyWebsite: 'Website van het bedrijf',
            paymentMethods: {
                personal: 'Persoonlijk',
                business: 'Zakelijk',
                chooseInvoiceMethod: 'Kies hieronder een betaalmethode:',
                payingAsIndividual: 'Betalen als individu',
                payingAsBusiness: 'Betalen als bedrijf',
            },
            invoiceBalance: 'Factuursaldo',
            invoiceBalanceSubtitle: 'Dit is je huidige saldo uit ontvangen factuurbetalingen. Het wordt automatisch overgemaakt naar je bankrekening als je er een hebt toegevoegd.',
            bankAccountsSubtitle: 'Voeg een bankrekening toe om facturen te betalen en te ontvangen.',
        },
        invite: {
            member: 'Lid uitnodigen',
            members: 'Leden uitnodigen',
            invitePeople: 'Nieuwe leden uitnodigen',
            genericFailureMessage: 'Er is een fout opgetreden bij het uitnodigen van het lid voor de werkruimte. Probeer het opnieuw.',
            pleaseEnterValidLogin: `Zorg ervoor dat het e-mailadres of telefoonnummer geldig is (bijv. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'gebruiker',
            users: 'gebruikers',
            invited: 'uitgenodigd',
            removed: 'verwijderd',
            to: 'naar',
            from: 'van',
        },
        inviteMessage: {
            confirmDetails: 'Details bevestigen',
            inviteMessagePrompt: 'Maak je uitnodiging extra speciaal door hieronder een bericht toe te voegen!',
            personalMessagePrompt: 'Bericht',
            genericFailureMessage: 'Er is een fout opgetreden bij het uitnodigen van het lid voor de werkruimte. Probeer het opnieuw.',
            inviteNoMembersError: 'Selecteer minstens één lid om uit te nodigen',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} heeft verzocht om lid te worden van ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Oeps! Niet zo snel...',
            workspaceNeeds: 'Een werkruimte heeft minstens één ingeschakelde afstandsvergoeding nodig.',
            distance: 'Afstand',
            centrallyManage: 'Beheer tarieven centraal, volg in mijlen of kilometers en stel een standaardcategorie in.',
            rate: 'Beoordeling',
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
                '<muted-text>Belastingen moeten in de workspace zijn ingeschakeld om deze functie te gebruiken. Ga naar <a href="#">Meer functies</a> om dat te wijzigen.</muted-text>',
            deleteDistanceRate: 'Verwijder afstandstarief',
            areYouSureDelete: () => ({
                one: 'Weet je zeker dat je dit tarief wilt verwijderen?',
                other: 'Weet je zeker dat je deze tarieven wilt verwijderen?',
            }),
            errors: {
                rateNameRequired: 'Tariefnaam is verplicht',
                existingRateName: 'Er bestaat al een kilometervergoeding met deze naam',
            },
        },
        editor: {
            descriptionInputLabel: 'Beschrijving',
            nameInputLabel: 'Naam',
            typeInputLabel: 'Type',
            initialValueInputLabel: 'Beginwaarde',
            nameInputHelpText: 'Dit is de naam die je in je werkruimte te zien krijgt.',
            nameIsRequiredError: 'Je moet je workspace een naam geven',
            currencyInputLabel: 'Standaardvaluta',
            currencyInputHelpText: 'Alle uitgaven in deze workspace worden omgezet naar deze valuta.',
            currencyInputDisabledText: (currency: string) => `De standaardvaluta kan niet worden gewijzigd omdat deze werkruimte is gekoppeld aan een ${currency}-bankrekening.`,
            save: 'Opslaan',
            genericFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de workspace. Probeer het opnieuw.',
            avatarUploadFailureMessage: 'Er is een fout opgetreden bij het uploaden van de avatar. Probeer het opnieuw.',
            addressContext: 'Een werkruimteadres is vereist om Expensify Travel in te schakelen. Voer een adres in dat aan uw bedrijf is gekoppeld.',
            policy: 'Declaratiebeleid',
        },
        bankAccount: {
            continueWithSetup: 'Ga door met instellen',
            youAreAlmostDone:
                'Je bent bijna klaar met het instellen van je bankrekening, waarmee je bedrijfskaarten kunt uitgeven, onkosten kunt vergoeden, facturen kunt innen en rekeningen kunt betalen.',
            streamlinePayments: 'Betalingen stroomlijnen',
            connectBankAccountNote: 'Opmerking: Persoonlijke bankrekeningen kunnen niet worden gebruikt voor betalingen in werkruimtes.',
            oneMoreThing: 'Nog één ding!',
            allSet: 'Je bent helemaal klaar!',
            accountDescriptionWithCards: 'Deze bankrekening wordt gebruikt om zakelijke kaarten uit te geven, onkosten te vergoeden, facturen te innen en rekeningen te betalen.',
            letsFinishInChat: 'Laten we het in de chat afronden!',
            finishInChat: 'Afronden in chat',
            almostDone: 'Bijna klaar!',
            disconnectBankAccount: 'Bankrekening ontkoppelen',
            startOver: 'Opnieuw beginnen',
            updateDetails: 'Details bijwerken',
            yesDisconnectMyBankAccount: 'Ja, koppel mijn bankrekening los',
            yesStartOver: 'Ja, opnieuw beginnen',
            disconnectYourBankAccount: (bankName: string) =>
                `Koppel je <strong>${bankName}</strong>-bankrekening los. Alle openstaande transacties voor deze rekening worden nog steeds voltooid.`,
            clearProgress: 'Opnieuw beginnen wist de voortgang die je tot nu toe hebt gemaakt.',
            areYouSure: 'Weet je het zeker?',
            workspaceCurrency: 'Werkruimtevaluta',
            updateCurrencyPrompt: 'Het lijkt erop dat je werkruimte momenteel is ingesteld op een andere valuta dan USD. Klik hieronder op de knop om je valuta nu bij te werken naar USD.',
            updateToUSD: 'Bijwerken naar USD',
            updateWorkspaceCurrency: 'Werkruimtevaluta bijwerken',
            workspaceCurrencyNotSupported: 'Workspace-valuta niet ondersteund',
            yourWorkspace: `Je werkruimte is ingesteld op een niet-ondersteunde valuta. Bekijk de <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">lijst met ondersteunde valuta's</a>.`,
            chooseAnExisting: 'Kies een bestaande bankrekening om uitgaven te betalen of voeg een nieuwe toe.',
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
            amountOwedText: 'Deze account heeft een openstaand saldo van een vorige maand.\n\nWil je het saldo wegwerken en de facturering van deze workspace overnemen?',
            ownerOwesAmountTitle: 'Openstaand saldo',
            ownerOwesAmountButtonText: 'Saldo overboeken',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `De account die eigenaar is van deze workspace (${email}) heeft een openstaand saldo van een vorige maand.

Wil je dit bedrag (${amount}) overnemen om de facturatie voor deze workspace op je te nemen? Je betaalkaart wordt onmiddellijk belast.`,
            subscriptionTitle: 'Jaarabonnement overnemen',
            subscriptionButtonText: 'Abonnement overzetten',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Als je deze workspace overneemt, wordt het jaarlijkse abonnement ervan samengevoegd met je huidige abonnement. Hierdoor wordt de omvang van je abonnement vergroot met ${usersCount} leden, waardoor je nieuwe abonnementsomvang ${finalCount} wordt. Wil je doorgaan?`,
            duplicateSubscriptionTitle: 'Melding dubbele abonnementen',
            duplicateSubscriptionButtonText: 'Doorgaan',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Het lijkt erop dat je de facturering voor de werkruimtes van ${email} wilt overnemen, maar daarvoor moet je eerst beheerder zijn van al hun werkruimtes.

Klik op "Doorgaan" als je alleen de facturering voor de werkruimte ${workspaceName} wilt overnemen.

Als je de facturering voor hun volledige abonnement wilt overnemen, laat hen je dan eerst als beheerder toevoegen aan al hun werkruimtes voordat je de facturering overneemt.`,
            hasFailedSettlementsTitle: 'Kan eigendom niet overdragen',
            hasFailedSettlementsButtonText: 'Begrepen',
            hasFailedSettlementsText: (email: string) =>
                `Je kunt de facturering niet overnemen omdat ${email} een achterstallige afrekening van een Expensify Card heeft. Vraag hen om contact op te nemen met concierge@expensify.com om het probleem op te lossen. Daarna kun je de facturering voor deze werkruimte overnemen.`,
            failedToClearBalanceTitle: 'Saldo wissen mislukt',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'We konden het saldo niet wissen. Probeer het later opnieuw.',
            successTitle: 'Woohoo! Helemaal klaar.',
            successDescription: 'Je bent nu de eigenaar van deze workspace.',
            errorTitle: 'Oeps! Niet zo snel...',
            errorDescription: `<muted-text><centered-text>Er is een probleem opgetreden bij het overdragen van het eigendom van deze workspace. Probeer het opnieuw of <concierge-link>neem contact op met Concierge</concierge-link> voor hulp.</centered-text></muted-text>`,
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
                description: `Rapportvelden laten je kopniveaugegevens opgeven, verschillend van tags die betrekking hebben op kosten op individuele regels. Deze gegevens kunnen specifieke projectnamen, informatie over zakenreizen, locaties en meer omvatten.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Rapportvelden zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Profiteer van geautomatiseerde synchronisatie en minder handmatige invoer met de Expensify + NetSuite-integratie. Krijg diepgaande realtime financiële inzichten met ondersteuning voor native en aangepaste segmenten, waaronder project- en klantkoppeling.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Onze NetSuite-integratie is alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Profiteer van automatische synchronisatie en verminder handmatige invoer met de Expensify + Sage Intacct-integratie. Krijg diepgaande, realtime financiële inzichten met door de gebruiker gedefinieerde dimensies, evenals kosten­codering per afdeling, klasse, locatie, klant en project (taak).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Onze Sage Intacct-integratie is alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Profiteer van automatische synchronisatie en verminder handmatige invoer met de integratie tussen Expensify en QuickBooks Desktop. Bereik ultieme efficiëntie met een realtime, tweerichtingsverbinding en kosten-codering op basis van klasse, item, klant en project.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Onze QuickBooks Desktop-integratie is alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Geavanceerde goedkeuringen',
                description: `Als je extra goedkeuringslagen aan het proces wilt toevoegen – of gewoon zeker wilt weten dat de grootste uitgaven door nog iemand worden gecontroleerd – dan ben je bij ons aan het juiste adres. Geavanceerde goedkeuringen helpen je op elk niveau de juiste controles in te richten, zodat je de uitgaven van je team onder controle houdt.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Geavanceerde goedkeuringen zijn alleen beschikbaar in het Control-abonnement, dat begint bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            categories: {
                title: 'Categorieën',
                description: 'Met categorieën kun je uitgaven bijhouden en organiseren. Gebruik onze standaardcategorieën of voeg je eigen categorieën toe.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Categorieën zijn beschikbaar in het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            glCodes: {
                title: 'Grootboekcodes',
                description: `Voeg GL-codes toe aan je categorieën en labels voor eenvoudige export van onkosten naar je boekhoud- en loonadministratiesystemen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL-codes zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Grootboek- en looncodes',
                description: `Voeg GL- en loonlijstcodes toe aan je categorieën voor eenvoudige export van uitgaven naar je boekhoud- en loonadministratiesystemen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL- en loonlijstcodes zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Belastingcodes',
                description: `Voeg belastingcodes toe aan je belastingen voor het eenvoudig exporteren van uitgaven naar je boekhoud- en loonadministratiesystemen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Belastingcodes zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            companyCards: {
                title: 'Onbeperkte bedrijfskaarten',
                description: `Meer kaartfeeds nodig? Ontgrendel onbeperkt aantal bedrijfskaarten om transacties van alle grote kaartuitgevers te synchroniseren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dit is alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            rules: {
                title: 'Regels',
                description: `Regels draaien op de achtergrond en houden je uitgaven onder controle, zodat jij je niet druk hoeft te maken om de kleine dingen.

Verplicht onkostendetails zoals bonnetjes en omschrijvingen, stel limieten en standaardwaarden in en automatiseer goedkeuringen en betalingen – allemaal op één plek.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Regels zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            perDiem: {
                title: 'Dagvergoeding',
                description:
                    'Dagdiensten zijn een uitstekende manier om uw dagelijkse kosten compliant en voorspelbaar te houden wanneer uw werknemers reizen. Profiteer van functies zoals aangepaste tarieven, standaardcategorieën en meer gedetailleerde informatie zoals bestemmingen en subtarieven.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dagvergoedingen zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            travel: {
                title: 'Reizen',
                description: 'Expensify Travel is een nieuw platform voor het boeken en beheren van zakelijke reizen waarmee leden accommodaties, vluchten, vervoer en meer kunnen boeken.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Reizen is beschikbaar in het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            reports: {
                title: 'Rapporten',
                description: 'Rapporten stellen je in staat om uitgaven te groeperen voor eenvoudigere tracering en organisatie.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Rapporten zijn beschikbaar met het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Tags op meerdere niveaus',
                description:
                    'Met tags op meerdere niveaus kun je uitgaven nauwkeuriger bijhouden. Wijs meerdere tags toe aan elk regeltje – zoals afdeling, klant of kostenplaats – om de volledige context van elke uitgave vast te leggen. Dit maakt meer gedetailleerde rapportages, goedkeuringsworkflows en boekhoudkundige exports mogelijk.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Labels met meerdere niveaus zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Kilometertarieven',
                description: 'Maak en beheer je eigen vergoedingsbedragen, houd afstanden bij in mijlen of kilometers en stel standaardcategorieën in voor kilometervergoedingen.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Kilometervergoedingen zijn beschikbaar in het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            auditor: {
                title: 'Accountant',
                description: 'Auditors krijgen alleen-lezen-toegang tot alle rapporten voor volledige transparantie en nalevingsbewaking.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Auditors zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Meerdere goedkeuringsniveaus',
                description: 'Meerdere goedkeuringsniveaus is een workflowtool voor bedrijven die vereisen dat meer dan één persoon een rapport goedkeurt voordat het kan worden vergoed.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Meerdere goedkeuringsniveaus zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'per actieve gebruiker per maand.',
                perMember: 'per lid per maand.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Upgrade om toegang te krijgen tot deze functie, of <a href="${subscriptionLink}">lees meer</a> over onze abonnementen en prijzen.</muted-text>`,
            upgradeToUnlock: 'Ontgrendel deze functie',
            completed: {
                headline: `Je hebt je werkruimte geüpgraded!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Je hebt ${policyName} succesvol geüpgraded naar het Control-abonnement! <a href="${subscriptionLink}">Bekijk je abonnement</a> voor meer details.</centered-text>`,
                categorizeMessage: `Je bent succesvol overgestapt naar het Collect-abonnement. Nu kun je je uitgaven categoriseren!`,
                travelMessage: `Je bent succesvol overgestapt naar het Collect-abonnement. Je kunt nu beginnen met het boeken en beheren van reizen!`,
                distanceRateMessage: `Je bent succesvol geüpgraded naar het Collect-abonnement. Je kunt nu het kilometer-/afstandstarief wijzigen!`,
                gotIt: 'Begrepen, dank je',
                createdWorkspace: `Je hebt een workspace gemaakt!`,
            },
            commonFeatures: {
                title: 'Upgrade naar het Control-abonnement',
                note: 'Ontgrendel onze krachtigste functies, waaronder:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Het Control-abonnement begint bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve gebruiker per maand.`} <a href="${learnMoreMethodsRoute}">Meer informatie</a> over onze abonnementen en prijzen.</muted-text>`,
                    benefit1: 'Geavanceerde boekhoudkoppelingen (NetSuite, Sage Intacct en meer)',
                    benefit2: 'Slimme onkostregels',
                    benefit3: 'Goedkeuringsworkflows op meerdere niveaus',
                    benefit4: 'Verbeterde beveiligingscontroles',
                    toUpgrade: 'Klik om te upgraden',
                    selectWorkspace: 'selecteer een werkruimte en wijzig het plantype naar',
                },
                upgradeWorkspaceWarning: `Kan werkruimte niet upgraden`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: 'Je bedrijf heeft het maken van werkruimtes beperkt. Neem contact op met een admin voor hulp.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Downgraden naar het Collect-abonnement',
                note: 'Als je downgrade, verlies je de toegang tot deze functies en meer:',
                benefits: {
                    note: 'Voor een volledig overzicht van onze abonnementen, bekijk onze',
                    pricingPage: 'prijspagina',
                    confirm: 'Weet je zeker dat je wilt downgraden en je configuraties wilt verwijderen?',
                    warning: 'Dit kan niet ongedaan worden gemaakt.',
                    benefit1: 'Boekhoudkoppelingen (behalve QuickBooks Online en Xero)',
                    benefit2: 'Slimme onkostregels',
                    benefit3: 'Goedkeuringsworkflows op meerdere niveaus',
                    benefit4: 'Verbeterde beveiligingscontroles',
                    headsUp: 'Let op!',
                    multiWorkspaceNote: 'Je moet al je werkruimtes downgraden vóór je eerste maandelijkse betaling om een abonnement tegen het Collect-tarief te starten. Klik',
                    selectStep: '> selecteer elke workspace > wijzig het abonnementstype in',
                },
            },
            completed: {
                headline: 'Je werkruimte is gedegradeerd',
                description: 'Je hebt andere werkruimtes op het Control-abonnement. Om tegen het Collect-tarief gefactureerd te worden, moet je alle werkruimtes downgraden.',
                gotIt: 'Begrepen, dank je',
            },
        },
        payAndDowngrade: {
            title: 'Betalen en downgraden',
            headline: 'Uw laatste betaling',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Uw laatste factuur voor dit abonnement is <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Bekijk hieronder je uitsplitsing voor ${date}:`,
            subscription:
                'Let op! Deze actie beëindigt je Expensify-abonnement, verwijdert deze workspace en verwijdert alle workspace-leden. Als je deze workspace wilt behouden en alleen jezelf wilt verwijderen, laat dan eerst een andere beheerder de facturering overnemen.',
            genericFailureMessage: 'Er is een fout opgetreden bij het betalen van je rekening. Probeer het opnieuw.',
        },
        restrictedAction: {
            restricted: 'Beperkt',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Acties in de ${workspaceName}-werkruimte zijn momenteel beperkt`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `De eigenaar van de werkruimte, ${workspaceOwnerName}, moet de opgeslagen betaalkaart toevoegen of bijwerken om nieuwe activiteiten in de werkruimte te ontgrendelen.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Je moet de opgeslagen betaalkaart toevoegen of bijwerken om nieuwe werkruimte-activiteiten te ontgrendelen.',
            addPaymentCardToUnlock: 'Voeg een betaalkaart toe om te ontgrendelen!',
            addPaymentCardToContinueUsingWorkspace: 'Voeg een betaalkaart toe om deze workspace te blijven gebruiken',
            pleaseReachOutToYourWorkspaceAdmin: 'Neem bij vragen contact op met de beheerder van je workspace.',
            chatWithYourAdmin: 'Chat met je beheerder',
            chatInAdmins: 'Chatten in #admins',
            addPaymentCard: 'Betaalkaart toevoegen',
            goToSubscription: 'Ga naar abonnement',
        },
        rules: {
            individualExpenseRules: {
                title: 'Declaraties',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Stel bestedingslimieten en standaardinstellingen in voor individuele onkosten. U kunt ook regels maken voor <a href="${categoriesPageLink}">categorieën</a> en <a href="${tagsPageLink}">labels</a>.</muted-text>`,
                receiptRequiredAmount: 'Vereist bonbedrag',
                receiptRequiredAmountDescription: 'Vereis bonnen wanneer de uitgave dit bedrag overschrijdt, tenzij dit wordt overschreven door een categoriebepaling.',
                maxExpenseAmount: 'Maximale onkostensom',
                maxExpenseAmountDescription: 'Markeer uitgaven die dit bedrag overschrijden, tenzij dit wordt overschreven door een categoriregel.',
                maxAge: 'Max. leeftijd',
                maxExpenseAge: 'Maximale declaratieperiode',
                maxExpenseAgeDescription: 'Markeer uitgaven ouder dan een specifiek aantal dagen.',
                maxExpenseAgeDays: () => ({
                    one: '1 dag',
                    other: (count: number) => `${count} dagen`,
                }),
                cashExpenseDefault: 'Standaard contante uitgave',
                cashExpenseDefaultDescription:
                    'Kies hoe contante uitgaven moeten worden aangemaakt. Een uitgave wordt als een contante uitgave beschouwd als het geen geïmporteerde bedrijfskaarttransactie is. Dit omvat handmatig aangemaakte uitgaven, bonnetjes, dagvergoedingen, afstands- en tijdsuitgaven.',
                reimbursableDefault: 'Vergoedbaar',
                reimbursableDefaultDescription: 'Onkosten worden meestal terugbetaald aan werknemers',
                nonReimbursableDefault: 'Niet-vergoedbaar',
                nonReimbursableDefaultDescription: 'Onkosten worden af en toe terugbetaald aan medewerkers',
                alwaysReimbursable: 'Altijd te vergoeden',
                alwaysReimbursableDescription: 'Declaraties worden altijd terugbetaald aan werknemers',
                alwaysNonReimbursable: 'Altijd niet-vergoedbaar',
                alwaysNonReimbursableDescription: 'Declaraties worden nooit vergoed aan medewerkers',
                billableDefault: 'Standaard factureerbaar',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Kies of contante en creditcarduitgaven standaard factureerbaar moeten zijn. Factureerbare uitgaven worden in- of uitgeschakeld bij <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                billable: 'Factureerbaar',
                billableDescription: 'Onkosten worden meestal doorbelast aan klanten',
                nonBillable: 'Niet-factureerbaar',
                nonBillableDescription: 'Onkosten worden af en toe opnieuw aan klanten gefactureerd',
                eReceipts: 'eReceipts',
                eReceiptsHint: `eReceipts worden automatisch aangemaakt [voor de meeste USD-credittransacties](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Deelnemersregistratie',
                attendeeTrackingHint: 'Houd de kosten per persoon bij voor elke uitgave.',
                prohibitedDefaultDescription:
                    'Markeer alle bonnen waarop alcohol, gokken of andere verboden items voorkomen. Declaraties met bonnen waarop deze posten voorkomen, moeten handmatig worden beoordeeld.',
                prohibitedExpenses: 'Verboden uitgaven',
                alcohol: 'Alcohol',
                hotelIncidentals: 'Hotelbijzaken',
                gambling: 'Gokken',
                tobacco: 'Tabak',
                adultEntertainment: 'Volwassenenentertainment',
                requireCompanyCard: 'Bedrijfspassen verplichten voor alle aankopen',
                requireCompanyCardDescription: 'Markeer alle contante uitgaven, inclusief kilometer- en dagvergoedingen.',
            },
            expenseReportRules: {
                title: 'Geavanceerd',
                subtitle: 'Automatiseer naleving, goedkeuringen en betaling van onkostendeclaraties.',
                preventSelfApprovalsTitle: 'Zelfgoedkeuring voorkomen',
                preventSelfApprovalsSubtitle: 'Voorkom dat werkruimtedeelnemers hun eigen onkostendeclaraties goedkeuren.',
                autoApproveCompliantReportsTitle: 'Voldoeende rapporten automatisch goedkeuren',
                autoApproveCompliantReportsSubtitle: 'Stel in welke onkostendeclaraties in aanmerking komen voor automatische goedkeuring.',
                autoApproveReportsUnderTitle: 'Rapporten automatisch goedkeuren onder',
                autoApproveReportsUnderDescription: 'Volledig conforme onkostendeclaraties onder dit bedrag worden automatisch goedgekeurd.',
                randomReportAuditTitle: 'Willekeurige rapportcontrole',
                randomReportAuditDescription: 'Vereisen dat sommige rapporten handmatig worden goedgekeurd, zelfs als ze in aanmerking komen voor automatische goedkeuring.',
                autoPayApprovedReportsTitle: 'Automatisch betalen van goedgekeurde rapporten',
                autoPayApprovedReportsSubtitle: 'Configureren welke onkostendeclaraties in aanmerking komen voor automatische betaling.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Voer een bedrag in dat lager is dan ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle: 'Ga naar meer functies en schakel workflows in, voeg vervolgens betalingen toe om deze functie te ontgrendelen.',
                autoPayReportsUnderTitle: 'Automatisch rapporten betalen onder',
                autoPayReportsUnderDescription: 'Volledig conforme onkostendeclaraties onder dit bedrag worden automatisch betaald.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Voeg ${featureName} toe om deze functie te ontgrendelen.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Ga naar [meer functies](${moreFeaturesLink}) en schakel ${featureName} in om deze functie te ontgrendelen.`,
            },
            categoryRules: {
                title: 'Categorischegels',
                approver: 'Fiatteur',
                requireDescription: 'Beschrijving vereist',
                requireFields: 'Vereiste velden',
                requiredFieldsTitle: 'Vereiste velden',
                requiredFieldsDescription: (categoryName: string) => `Dit is van toepassing op alle uitgaven die zijn gecategoriseerd als <strong>${categoryName}</strong>.`,
                requireAttendees: 'Verplichte deelnemers',
                descriptionHint: 'Beschrijving-hint',
                descriptionHintDescription: (categoryName: string) =>
                    `Herinner werknemers eraan extra informatie te geven voor uitgaven in de categorie ‘${categoryName}’. Deze hint verschijnt in het beschrijvingsveld bij onkostendeclaraties.`,
                descriptionHintLabel: 'Tip',
                descriptionHintSubtitle: 'Pro-tip: hoe korter, hoe beter!',
                maxAmount: 'Maximumbedrag',
                flagAmountsOver: 'Bedragen markeren boven',
                flagAmountsOverDescription: (categoryName: string) => `Is van toepassing op de categorie “${categoryName}”.`,
                flagAmountsOverSubtitle: 'Dit overschrijft het maximumbedrag voor alle uitgaven.',
                expenseLimitTypes: {
                    expense: 'Individuele uitgave',
                    expenseSubtitle: 'Markeer onkostbedragen per categorie. Deze regel overschrijft de algemene werkruimteregel voor het maximale onkostbedrag.',
                    daily: 'Categorietotaal',
                    dailySubtitle: 'Markeer totale dagelijkse categorie-uitgaven per onkostendeclaratie.',
                },
                requireReceiptsOver: 'Bonnen vereisen boven',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standaard`,
                    never: 'Nooit bonnen vereisen',
                    always: 'Altijd bonnen vereisen',
                },
                defaultTaxRate: 'Standaardbelastingtarief',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Ga naar [Meer functies](${moreFeaturesLink}) en schakel workflows in, voeg vervolgens goedkeuringen toe om deze functie te ontgrendelen.`,
            },
            customRules: {
                title: 'Declaratiebeleid',
                cardSubtitle: 'Hier vind je het onkostenbeleid van je team, zodat iedereen precies weet wat er wel en niet wordt vergoed.',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Innen',
                    description: 'Voor teams die hun processen willen automatiseren.',
                },
                corporate: {
                    label: 'Beheer',
                    description: 'Voor organisaties met geavanceerde vereisten.',
                },
            },
            description: 'Kies een pakket dat bij je past. Voor een gedetailleerde lijst met functies en prijzen, bekijk onze',
            subscriptionLink: 'hulppagina voor abonnementssoorten en prijzen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Je hebt je vastgelegd op 1 actief lid in het Control-abonnement tot je jaarlijkse abonnement afloopt op ${annualSubscriptionEndDate}. Je kunt overschakelen naar een betalen-naar-gebruik-abonnement en downgraden naar het Collect-abonnement vanaf ${annualSubscriptionEndDate} door automatische verlenging uit te schakelen in`,
                other: `Je hebt je tot het einde van je jaarlijkse abonnement op ${annualSubscriptionEndDate} vastgelegd op ${count} actieve leden in het Control-abonnement. Je kunt vanaf ${annualSubscriptionEndDate} overschakelen naar een betalen-per-gebruik-abonnement en downgraden naar het Collect-abonnement door automatisch verlengen uit te schakelen in`,
            }),
            subscriptions: 'Abonnementen',
        },
    },
    getAssistancePage: {
        title: 'Hulp krijgen',
        subtitle: 'We zijn er om je pad naar grootsheid vrij te maken!',
        description: 'Kies uit de onderstaande ondersteuningsopties:',
        chatWithConcierge: 'Chatten met Concierge',
        scheduleSetupCall: 'Plan een installatiegesprek',
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
            animalsAndNature: 'Dieren en natuur',
            foodAndDrink: 'Eten & Drinken',
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
        roomName: 'Ruimtenaam',
        visibility: 'Zichtbaarheid',
        restrictedDescription: 'Mensen in je werkruimte kunnen deze ruimte vinden',
        privateDescription: 'Mensen die voor deze ruimte zijn uitgenodigd, kunnen deze terugvinden',
        publicDescription: 'Iedereen kan deze ruimte vinden',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Iedereen kan deze ruimte vinden',
        createRoom: 'Ruimte maken',
        roomAlreadyExistsError: 'Er bestaat al een ruimte met deze naam',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} is een standaardruimte in alle werkruimtes. Kies een andere naam.`,
        roomNameInvalidError: 'Ruimtenamen mogen alleen kleine letters, cijfers en koppeltekens bevatten',
        pleaseEnterRoomName: 'Voer een kamernaam in',
        pleaseSelectWorkspace: 'Selecteer een werkruimte',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}hernoemd naar "${newName}" (voorheen "${oldName}")` : `${actor}heeft deze ruimte hernoemd naar „${newName}” (voorheen „${oldName}”)`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Ruimte hernoemd naar ${newName}`,
        social: 'sociaal',
        selectAWorkspace: 'Selecteer een werkruimte',
        growlMessageOnRenameError: 'Kan de werkruimtekamer niet hernoemen. Controleer je verbinding en probeer het opnieuw.',
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
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `stel de standaard zakelijke bankrekening in op "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `heeft de standaard zakelijke bankrekening "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" verwijderd`,
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
            `heeft de standaard zakelijke bankrekening gewijzigd naar "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (voorheen "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `het bedrijfsadres gewijzigd in ‘${newAddress}’ (voorheen ‘${previousAddress}’)` : `stel het bedrijfsadres in op ‘${newAddress}’`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `${approverName} (${approverEmail}) toegevoegd als fiatteur voor het veld ${field} "${name}"`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `heeft ${approverName} (${approverEmail}) verwijderd als beoordelaar voor het veld ${field} „${name}”`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `heeft de fiatteur voor het veld ${field} „${name}” gewijzigd naar ${formatApprover(newApproverName, newApproverEmail)} (voorheen ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `heeft de categorie ‘${categoryName}’ toegevoegd`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `heeft de categorie ‘${categoryName}’ verwijderd`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'uitgeschakeld' : 'ingeschakeld'} de categorie ‘${categoryName}’`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `heeft de looncode ‘${newValue}’ toegevoegd aan de categorie ‘${categoryName}’`;
            }
            if (!newValue && oldValue) {
                return `heeft de payrollcode „${oldValue}” verwijderd uit de categorie „${categoryName}”`;
            }
            return `heeft de looncode van categorie „${categoryName}” gewijzigd in „${newValue}” (voorheen „${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `heeft de GL-code "${newValue}” toegevoegd aan de categorie "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `heeft de GL-code "${oldValue}" verwijderd uit de categorie "${categoryName}"`;
            }
            return `heeft de grootboekcode van categorie “${categoryName}” gewijzigd in “${newValue}” (voorheen “${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `heeft de beschrijving van categorie "${categoryName}" gewijzigd naar ${!oldValue ? 'verplicht' : 'niet vereist'} (voorheen ${!oldValue ? 'niet vereist' : 'verplicht'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `heeft een maximumbedrag van ${newAmount} toegevoegd aan de categorie "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `heeft het maximale bedrag van ${oldAmount} uit de categorie "${categoryName}" verwijderd`;
            }
            return `heeft het maximale bedrag voor categorie „${categoryName}” gewijzigd naar ${newAmount} (voorheen ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `heeft een limiettype van ${newValue} toegevoegd aan de categorie "${categoryName}"`;
            }
            return `heeft het type limiet voor de categorie „${categoryName}” gewijzigd naar ${newValue} (voorheen ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `heeft de categorie "${categoryName}" bijgewerkt door Bonnetjes te wijzigen in ${newValue}`;
            }
            return `heeft de categorie ‘${categoryName}’ gewijzigd in ${newValue} (voorheen ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `heeft de categorie "${oldName}" hernoemd naar "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `heeft de beschrijvingshint "${oldValue}" verwijderd uit de categorie "${categoryName}"`;
            }
            return !oldValue
                ? `heeft de beschrijvingshint "${newValue}" toegevoegd aan de categorie "${categoryName}"`
                : `heeft de beschrijvingstip voor categorie „${categoryName}” gewijzigd naar „${newValue}” (voorheen „${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `heeft de naam van de taglijst gewijzigd in ‘${newName}’ (voorheen ‘${oldName}’)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `heeft de tag "${tagName}" toegevoegd aan de lijst "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `heeft de taglijst "${tagListName}" bijgewerkt door de tag "${oldName}" te wijzigen in "${newName}`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} het label "${tagName}" op de lijst "${tagListName}"`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `heeft de tag "${tagName}" verwijderd uit de lijst "${tagListName}"`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `heeft "${count}" labels verwijderd uit de lijst "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `heeft de tag ‘${tagName}’ in de lijst ‘${tagListName}’ bijgewerkt door ${updatedField} te wijzigen in ‘${newValue}’ (voorheen ‘${oldValue}’)`;
            }
            return `heeft de tag "${tagName}" in de lijst "${tagListName}" bijgewerkt door een ${updatedField} met de waarde "${newValue}" toe te voegen`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `heeft de ${customUnitName} ${updatedField} gewijzigd naar "${newValue}" (voorheen "${oldValue}")`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'ingeschakeld' : 'uitgeschakeld'} belastingregistratie op afstandstarieven`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `heeft een nieuw "${customUnitName}"-tarief "${rateName}" toegevoegd`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `heeft het tarief van de ${customUnitName} ${updatedField} „${customUnitRateName}” gewijzigd naar „${newValue}” (voorheen „${oldValue}”)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `heeft het belastingtarief van het afstandstarief "${customUnitRateName}" gewijzigd naar "${newValue} (${newTaxPercentage})" (voorheen "${oldValue} (${oldTaxPercentage})")`;
            }
            return `heeft het belastingtarief „${newValue} (${newTaxPercentage})” toegevoegd aan het afstandstarief „${customUnitRateName}”`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `heeft het terugvorderbare belastingdeel van het afstandstarief "${customUnitRateName}" gewijzigd naar "${newValue}" (voorheen "${oldValue}")`;
            }
            return `heeft een terugvorderbaar belastinggedeelte van "${newValue}" toegevoegd aan het kilometertarief "${customUnitRateName}`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? 'ingeschakeld' : 'uitgeschakeld'} het ${customUnitName}-tarief "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `heeft het tarief „${rateName}” van de eenheid „${customUnitName}” verwijderd`,
        addedReportField: (fieldType: string, fieldName?: string) => `heeft ${fieldType}-rapportveld „${fieldName}” toegevoegd`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `stel de standaardwaarde van het rapportveld "${fieldName}" in op "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `heeft de optie ‘${optionName}’ toegevoegd aan het rapportveld ‘${fieldName}’`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `heeft de optie ‘${optionName}’ verwijderd uit het rapportveld ‘${fieldName}’`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'ingeschakeld' : 'uitgeschakeld'} de optie "${optionName}" voor het rapportveld "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'ingeschakeld' : 'uitgeschakeld'} alle opties voor het rapportveld "${fieldName}"`;
            }
            return `${allEnabled ? 'ingeschakeld' : 'uitgeschakeld'} de optie „${optionName}” voor het rapportveld „${fieldName}”, waardoor alle opties ${allEnabled ? 'ingeschakeld' : 'uitgeschakeld'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `heeft ${fieldType}-rapportveld ‘${fieldName}’ verwijderd`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `heeft "Zelfgoedkeuring voorkomen" bijgewerkt naar "${newValue === 'true' ? 'Ingeschakeld' : 'Uitgeschakeld'}" (voorheen "${oldValue === 'true' ? 'Ingeschakeld' : 'Uitgeschakeld'}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `stel de maandelijkse rapportindieningsdatum in op "${newValue}"`;
            }
            return `heeft de maandelijkse rapportindieningsdatum bijgewerkt naar "${newValue}" (voorheen "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `heeft „Onkosten opnieuw aan klanten doorbelasten” bijgewerkt naar „${newValue}” (voorheen „${oldValue}”)`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `heeft ‘Standaard contante uitgave’ bijgewerkt naar ‘${newValue}’ (voorheen ‘${oldValue}’)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `heeft ‘Standaardrapporttitels afdwingen’ gewijzigd ${value ? 'aan' : 'uit'}`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `heeft de naamformule van het aangepaste rapport gewijzigd naar „${newValue}” (voorheen „${oldValue}”)`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `heeft de naam van deze werkruimte bijgewerkt naar "${newName}" (voorheen "${oldName}")`,
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
                one: `heeft je verwijderd uit de goedkeuringsworkflow en onkostenchats van ${joinedNames}. Eerder ingediende rapporten blijven beschikbaar voor goedkeuring in je inbox.`,
                other: `heeft je verwijderd uit de goedkeuringsworkflows en uitgavenchats van ${joinedNames}. Eerder ingediende rapporten blijven beschikbaar voor goedkeuring in je inbox.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `heeft je rol in ${policyName} bijgewerkt van ${oldRole} naar gebruiker. Je bent verwijderd uit alle declaratiechats van indieners, behalve uit je eigen chats.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `heeft de standaardvaluta gewijzigd in ${newCurrency} (voorheen ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `heeft de frequentie voor automatisch rapporteren gewijzigd naar ‘${newFrequency}’ (voorheen ‘${oldFrequency}’)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `heeft de goedkeuringsmodus bijgewerkt naar ‘${newValue}’ (voorheen ‘${oldValue}’)`,
        upgradedWorkspace: 'heeft deze workspace geüpgraded naar het Control-abonnement',
        forcedCorporateUpgrade: `Deze workspace is geüpgraded naar het Control-abonnement. Klik <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">hier</a> voor meer informatie.`,
        downgradedWorkspace: 'heeft deze workspace gedowngraded naar het Collect-abonnement',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `heeft het percentage rapporten dat willekeurig wordt doorgestuurd voor handmatige goedkeuring gewijzigd naar ${Math.round(newAuditRate * 100)}% (voorheen ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `heeft de handmatige goedkeuringslimiet voor alle uitgaven gewijzigd naar ${newLimit} (voorheen ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} categorieën`;
                case 'tags':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} labels`;
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
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} aanwezigheidsregistratie`,
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `heeft de standaardgoedkeurder gewijzigd naar ${newApprover} (voorheen ${previousApprover})` : `heeft de standaardgoedkeurder gewijzigd in ${newApprover}`,
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
            let text = `heeft de goedkeuringsworkflow voor ${members} gewijzigd zodat zij rapporten indienen bij ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `(voorheen standaardgoedkeurder ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(voorheen standaardgoedkeurder)';
            } else if (previousApprover) {
                text += `(voorheen ${previousApprover})`;
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
                ? `heeft de goedkeuringsworkflow voor ${members} gewijzigd zodat rapporten worden ingediend bij de standaardgoedkeurder ${approver}`
                : `heeft de goedkeuringsworkflow voor ${members} gewijzigd zodat rapporten naar de standaardgoedkoper worden ingediend`;
            if (wasDefaultApprover && previousApprover) {
                text += `(voorheen standaardgoedkeurder ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(voorheen standaardgoedkeurder)';
            } else if (previousApprover) {
                text += `(voorheen ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `heeft de goedkeuringsworkflow voor ${approver} gewijzigd zodat goedgekeurde rapporten worden doorgestuurd naar ${forwardsTo} (werd eerder doorgestuurd naar ${previousForwardsTo})`
                : `heeft de goedkeuringsworkflow voor ${approver} gewijzigd zodat goedgekeurde rapporten worden doorgestuurd naar ${forwardsTo} (voorheen definitief goedgekeurde rapporten)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `heeft de goedkeuringsworkflow voor ${approver} gewijzigd zodat goedgekeurde rapporten niet meer worden doorgestuurd (werd eerder doorgestuurd naar ${previousForwardsTo})`
                : `heeft de goedkeuringsworkflow voor ${approver} gewijzigd zodat goedgekeurde rapporten niet meer worden doorgestuurd`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `heeft de bedrijfsnaam op de factuur gewijzigd in „${newValue}” (voorheen „${oldValue}”)` : `stel de factuurbedrijfsnaam in op „${newValue}”`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `heeft de bedrijfswebsite van de factuur gewijzigd in "${newValue}" (voorheen "${oldValue}")` : `stel de bedrijfswebsite op de factuur in op ‘${newValue}’`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser
                ? `heeft de bevoegde betaler gewijzigd in ‘${newReimburser}’ (voorheen ‘${previousReimburser}’)`
                : `heeft de gemachtigde betaler gewijzigd in ‘${newReimburser}’`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} terugbetalingen`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `heeft de belasting „${taxName}” toegevoegd`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `heeft de belasting ‘${taxName}’ verwijderd`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `heeft de belasting "${oldValue}" hernoemd naar "${newValue}"`;
                }
                case 'code': {
                    return `heeft de belastingcode voor „${taxName}” gewijzigd van „${oldValue}” naar „${newValue}”`;
                }
                case 'rate': {
                    return `heeft het belastingtarief voor ‘${taxName}’ gewijzigd van ‘${oldValue}’ naar ‘${newValue}’`;
                }
                case 'enabled': {
                    return `${oldValue ? 'uitgeschakeld' : 'ingeschakeld'} de belasting “${taxName}”`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `stel vereist bonbedrag in op "${newValue}"`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `heeft het vereiste bonbedrag gewijzigd naar "${newValue}" (voorheen "${oldValue}")`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `vereist bedrag voor bon verwijderd (voorheen "${oldValue}")`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximumbedrag voor uitgaven instellen op ‘${newValue}’`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximumbedrag voor uitgaven gewijzigd naar ‘${newValue}’ (voorheen ‘${oldValue}’)`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximum onkostbedrag verwijderd (voorheen "${oldValue}")`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `stel maximale onkostendatum in op “${newValue}” dagen`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximale onkostendatum gewijzigd naar "${newValue}" dagen (voorheen "${oldValue}")`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximale ouderdom van uitgave verwijderd (voorheen "${oldValue}" dagen)`,
    },
    roomMembersPage: {
        memberNotFound: 'Lid niet gevonden.',
        useInviteButton: 'Om een nieuw lid voor de chat uit te nodigen, gebruik de uitnodigingsknop hierboven.',
        notAuthorized: `Je hebt geen toegang tot deze pagina. Als je probeert deze ruimte te joinen, vraag dan gewoon een lid van de ruimte om je toe te voegen. Iets anders aan de hand? Neem contact op met ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Het lijkt erop dat deze ruimte is gearchiveerd. Neem voor vragen contact op met ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Weet je zeker dat je ${memberName} uit de ruimte wilt verwijderen?`,
            other: 'Weet je zeker dat je de geselecteerde leden uit de kamer wilt verwijderen?',
        }),
        error: {
            genericAdd: 'Er is een probleem opgetreden bij het toevoegen van dit kamerlid',
        },
    },
    newTaskPage: {
        assignTask: 'Taak toewijzen',
        assignMe: 'Aan mij toewijzen',
        confirmTask: 'Taak bevestigen',
        confirmError: 'Voer een titel in en selecteer een bestemming om te delen',
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
        action: 'Voltooid',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `taak voor ${title}`,
            completed: 'gemarkeerd als voltooid',
            canceled: 'verwijderde taak',
            reopened: 'gemarkeerd als onvolledig',
            error: 'U hebt geen toestemming om de gevraagde actie uit te voeren',
        },
        markAsComplete: 'Markeren als voltooid',
        markAsIncomplete: 'Markeren als onvolledig',
        assigneeError: 'Er is een fout opgetreden bij het toewijzen van deze taak. Probeer een andere toegewezene.',
        genericCreateTaskFailureMessage: 'Er is een fout opgetreden bij het maken van deze taak. Probeer het later opnieuw.',
        deleteTask: 'Taak verwijderen',
        deleteConfirmation: 'Weet je zeker dat je deze taak wilt verwijderen?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Overzicht ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Sneltoetsen',
        subtitle: 'Bespaar tijd met deze handige sneltoetsen:',
        shortcuts: {
            openShortcutDialog: 'Opent het dialoogvenster voor sneltoetsen',
            markAllMessagesAsRead: 'Markeer alle berichten als gelezen',
            escape: 'Escape-dialogen',
            search: 'Zoekvenster openen',
            newChat: 'Nieuw chatscherm',
            copy: 'Opmerking kopiëren',
            openDebug: 'Dialoogvenster testvoorkeuren openen',
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
                subtitle: 'Maak een rapport of maak een proefrit met Expensify om meer te leren.',
                subtitleWithOnlyCreateButton: 'Gebruik de groene knop hieronder om een rapport te maken.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Je hebt nog geen facturen aangemaakt
                `),
                subtitle: 'Stuur een factuur of neem een proefrit met Expensify om meer te weten te komen.',
                subtitleWithOnlyCreateButton: 'Gebruik de groene knop hieronder om een factuur te versturen.',
            },
            emptyTripResults: {
                title: 'Geen reizen om weer te geven',
                subtitle: 'Begin met het boeken van je eerste reis hieronder.',
                buttonText: 'Reis boeken',
            },
            emptySubmitResults: {
                title: 'Geen declaraties om in te dienen',
                subtitle: 'Alles is in orde. Maak een ereronde!',
                buttonText: 'Rapport maken',
            },
            emptyApproveResults: {
                title: 'Geen declaraties om goed te keuren',
                subtitle: 'Nul uitgaven. Maximale ontspanning. Goed gedaan!',
            },
            emptyPayResults: {
                title: 'Geen declaraties om te betalen',
                subtitle: 'Gefeliciteerd! Je hebt de finish gehaald.',
            },
            emptyExportResults: {
                title: 'Geen uitgaven om te exporteren',
                subtitle: 'Tijd om rustig aan te doen, goed gedaan.',
            },
            emptyStatementsResults: {
                title: 'Geen uitgaven om weer te geven',
                subtitle: 'Geen resultaten. Probeer je filters aan te passen.',
            },
            emptyUnapprovedResults: {
                title: 'Geen declaraties om goed te keuren',
                subtitle: 'Nul uitgaven. Maximale ontspanning. Goed gedaan!',
            },
        },
        columns: 'Kolommen',
        resetColumns: 'Kolommen resetten',
        groupColumns: 'Kolommen groeperen',
        expenseColumns: 'Onkostencolommen',
        statements: 'Overzichten',
        unapprovedCash: 'Niet-goedgekeurde contanten',
        unapprovedCard: 'Niet-goedgekeurde kaart',
        reconciliation: 'Reconciliatie',
        topSpenders: 'Grootste uitgaven',
        saveSearch: 'Zoekopdracht opslaan',
        deleteSavedSearch: 'Opgeslagen zoekopdracht verwijderen',
        deleteSavedSearchConfirm: 'Weet je zeker dat je deze zoekopdracht wilt verwijderen?',
        searchName: 'Zoeknaam',
        savedSearchesMenuItemTitle: 'Opgeslagen',
        groupedExpenses: 'gegroepeerde uitgaven',
        bulkActions: {
            approve: 'Goedkeuren',
            pay: 'Betalen',
            delete: 'Verwijderen',
            hold: 'Vasthouden',
            unhold: 'Blokkering opheffen',
            reject: 'Afwijzen',
            noOptionsAvailable: 'Geen opties beschikbaar voor de geselecteerde groep uitgaven.',
        },
        filtersHeader: 'Filters',
        filters: {
            date: {
                before: (date?: string) => `Voor ${date ?? ''}`,
                after: (date?: string) => `Na ${date ?? ''}`,
                on: (date?: string) => `Op ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Nooit',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Afgelopen maand',
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
                between: (greaterThan: string, lessThan: string) => `Tussen ${greaterThan} en ${lessThan}`,
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
            posted: 'Gepost',
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
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Verzenden',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Goedkeuren',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Betalen',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Exporteren',
            },
        },
        has: 'Heeft',
        groupBy: 'Groeperen op',
        moneyRequestReport: {
            emptyStateTitle: 'Dit rapport heeft geen uitgaven.',
            accessPlaceHolder: 'Openen voor details',
        },
        noCategory: 'Geen categorie',
        noTag: 'Geen tag',
        expenseType: 'Onkostype',
        withdrawalType: 'Type opname',
        recentSearches: 'Recente zoekopdrachten',
        recentChats: 'Recente chats',
        searchIn: 'Zoeken in',
        searchPlaceholder: 'Zoek naar iets',
        suggestions: 'Suggesties',
        exportSearchResults: {
            title: 'Export maken',
            description: 'Wow, dat zijn veel items! We bundelen ze, en Concierge stuurt je binnenkort een bestand.',
        },
        exportedTo: 'Geëxporteerd naar',
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
            helpTextConcierge: 'Als het probleem aanhoudt, neem contact op met',
        },
        refresh: 'Vernieuwen',
    },
    fileDownload: {
        success: {
            title: 'Gedownload!',
            message: 'Bijlage succesvol gedownload!',
            qrMessage:
                'Controleer je foto- of downloadmap voor een kopie van je QR-code. Protip: voeg hem toe aan een presentatie zodat je publiek deze kan scannen en direct met je kan verbinden.',
        },
        generalError: {
            title: 'Bijlagefout',
            message: 'Bijlage kan niet worden gedownload',
        },
        permissionError: {
            title: 'Opslagtoegang',
            message: 'Expensify kan bijlagen niet opslaan zonder toegang tot opslag. Tik op instellingen om de machtigingen bij te werken.',
        },
    },
    settlement: {
        status: {
            pending: 'In behandeling',
            cleared: 'Verrekend',
            failed: 'Mislukt',
        },
        failedError: ({link}: {link: string}) => `We proberen deze vereffening opnieuw wanneer je <a href="${link}">je account ontgrendelt</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • Opname-ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Rapportindeling',
        groupByLabel: 'Groeperen op:',
        selectGroupByOption: 'Selecteer hoe je rapportuitgaven wilt groeperen',
        uncategorized: 'Niet ingedeeld',
        noTag: 'Geen tag',
        selectGroup: ({groupName}: {groupName: string}) => `Selecteer alle uitgaven in ${groupName}`,
        groupBy: {
            category: 'Categorie',
            tag: 'Tag',
        },
    },
    report: {
        newReport: {
            createExpense: 'Onkost aanmaken',
            createReport: 'Rapport maken',
            chooseWorkspace: 'Kies een workspace voor dit rapport.',
            emptyReportConfirmationTitle: 'Je hebt al een leeg rapport',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Weet je zeker dat je nog een rapport wilt maken in ${workspaceName}? Je kunt je lege rapporten openen in`,
            emptyReportConfirmationPromptLink: 'Rapporten',
            emptyReportConfirmationDontShowAgain: 'Laat dit niet meer zien',
            genericWorkspaceName: 'deze workspace',
        },
        genericCreateReportFailureMessage: 'Onverwachte fout bij het aanmaken van deze chat. Probeer het later opnieuw.',
        genericAddCommentFailureMessage: 'Onverwachte fout bij het plaatsen van de opmerking. Probeer het later opnieuw.',
        genericUpdateReportFieldFailureMessage: 'Onverwachte fout bij het bijwerken van het veld. Probeer het later opnieuw.',
        genericUpdateReportNameEditFailureMessage: 'Onverwachte fout bij het hernoemen van het rapport. Probeer het later opnieuw.',
        noActivityYet: 'Nog geen activiteit',
        connectionSettings: 'Verbindingsinstellingen',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `heeft ${fieldName} gewijzigd in „${newValue}” (voorheen „${oldValue}”)`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `stel ${fieldName} in op "${newValue}"`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `heeft de workspace${fromPolicyName ? `(voorheen ${fromPolicyName})` : ''} gewijzigd`;
                    }
                    return `heeft de werkruimte gewijzigd in ${toPolicyName}${fromPolicyName ? `(voorheen ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `heeft type gewijzigd van ${oldType} naar ${newType}`,
                exportedToCSV: `geëxporteerd naar CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `geëxporteerd naar ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `geëxporteerd naar ${label} via`,
                    automaticActionTwo: 'boekhoudinstellingen',
                    manual: (label: string) => `heeft dit verslag gemarkeerd als handmatig geëxporteerd naar ${label}.`,
                    automaticActionThree: 'en heeft succesvol een record aangemaakt voor',
                    reimburseableLink: 'uit eigen zak gemaakte uitgaven',
                    nonReimbursableLink: 'bedrijfskaartuitgaven',
                    pending: (label: string) => `is begonnen met het exporteren van dit rapport naar ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `exporteren van dit rapport naar ${label} is mislukt ("${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `heeft een bon toegevoegd`,
                managerDetachReceipt: `heeft een bon verwijderd`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `elders ${currency}${amount} betaald`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `heeft ${currency}${amount} betaald via koppeling`,
                outdatedBankAccount: `kon de betaling niet verwerken vanwege een probleem met de bankrekening van de betaler`,
                reimbursementACHBounce: `kon de betaling niet verwerken vanwege een probleem met de bankrekening`,
                reimbursementACHCancelled: `heeft de betaling geannuleerd`,
                reimbursementAccountChanged: `kon de betaling niet verwerken, omdat de betaler van bankrekening is veranderd`,
                reimbursementDelayed: `heeft de betaling verwerkt, maar deze is met 1-2 extra werkdagen vertraagd`,
                selectedForRandomAudit: `willekeurig geselecteerd voor controle`,
                selectedForRandomAuditMarkdown: `willekeurig geselecteerd voor controle`,
                share: ({to}: ShareParams) => `heeft lid ${to} uitgenodigd`,
                unshare: ({to}: UnshareParams) => `lid ${to} verwijderd`,
                stripePaid: ({amount, currency}: StripePaidParams) => `betaald ${currency}${amount}`,
                takeControl: `heeft de controle overgenomen`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `er is een probleem opgetreden bij het synchroniseren met ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Los het probleem op in de <a href="${workspaceAccountingLink}">werkruimte-instellingen</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `De verbinding met ${feedName} is verbroken. Om kaartimports te herstellen, <a href='${workspaceCompanyCardRoute}'>log in bij je bank</a>`,
                addEmployee: (email: string, role: string) => `${email} toegevoegd als ${role === 'member' ? 'a' : 'een'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `heeft de rol van ${email} gewijzigd naar ${newRole} (voorheen ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `aangepaste veld 1 van ${email} verwijderd (voorheen "${previousValue}")`;
                    }
                    return !previousValue
                        ? `heeft "${newValue}" toegevoegd aan aangepast veld 1 van ${email}`
                        : `heeft aangepast: aangepast veld 1 voor ${email} naar "${newValue}" (voorheen "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `heeft aangepaste veld 2 van ${email} verwijderd (voorheen "${previousValue}")`;
                    }
                    return !previousValue
                        ? `heeft "${newValue}" toegevoegd aan aangepaste veld 2 van ${email}`
                        : `heeft aangepast: aangepaste veld 2 van ${email} naar "${newValue}" (voorheen "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} heeft de werkruimte verlaten`,
                removeMember: (email: string, role: string) => `heeft ${role} ${email} verwijderd`,
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
        expenseManagement: 'Declaratiebeheer',
        spendManagement: 'Uitgavenbeheer',
        expenseReports: 'Declaraties',
        companyCreditCard: 'Zakelijke creditcard',
        receiptScanningApp: 'Bonnen-scanapp',
        billPay: 'Bill Pay',
        invoicing: 'Facturatie',
        CPACard: 'CPA-kaart',
        payroll: 'Loonadministratie',
        travel: 'Reizen',
        resources: 'Bronnen',
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
        chatWelcomeMessage: 'Welkomstbericht voor chat',
        navigatesToChat: 'Navigeert naar een chat',
        newMessageLineIndicator: 'Indicator voor nieuwe berichtregel',
        chatMessage: 'Chatbericht',
        lastChatMessagePreview: 'Voorbeeld laatste chatbericht',
        workspaceName: 'Werkruimte-naam',
        chatUserDisplayNames: 'Weergavenamen chatleden',
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
        thread: 'Conversatie',
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
        spamDescription: 'Ongevraagde off-topic promotie',
        inconsiderate: 'Onattent',
        inconsiderateDescription: 'Beledigende of respectloze bewoording, met twijfelachtige bedoelingen',
        intimidation: 'Intimidatie',
        intimidationDescription: 'Aggressief een agenda nastreven ondanks geldige bezwaren',
        bullying: 'Pesten',
        bullyingDescription: 'Een individu doelbewust benaderen om gehoorzaamheid af te dwingen',
        harassment: 'Intimidatie',
        harassmentDescription: 'Racistisch, vrouwonvriendelijk of ander algemeen discriminerend gedrag',
        assault: 'Aanranding',
        assaultDescription: 'Specifiek gerichte emotionele aanval met de bedoeling om schade toe te brengen',
        flaggedContent: 'Dit bericht is gemarkeerd als een schending van onze gemeenschapsregels en de inhoud is verborgen.',
        hideMessage: 'Bericht verbergen',
        revealMessage: 'Bericht tonen',
        levelOneResult: 'Verstuurt een anonieme waarschuwing en meldt het bericht ter beoordeling.',
        levelTwoResult: 'Bericht verborgen voor kanaal, plus anonieme waarschuwing en bericht is gemeld voor beoordeling.',
        levelThreeResult: 'Bericht uit kanaal verwijderd plus anonieme waarschuwing en bericht is gemeld voor beoordeling.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Uitnodigen om declaraties in te dienen',
        inviteToChat: 'Alleen uitnodigen om te chatten',
        nothing: 'Niets doen',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Accepteren',
        decline: 'Weigeren',
    },
    actionableMentionTrackExpense: {
        submit: 'Verzend het naar iemand',
        categorize: 'Categoriseer het',
        share: 'Delen met mijn accountant',
        nothing: 'Niets voor nu',
    },
    teachersUnitePage: {
        teachersUnite: 'Leraren verenigd',
        joinExpensifyOrg:
            'Sluit je aan bij Expensify.org om onrecht over de hele wereld uit te bannen. De huidige campagne “Teachers Unite” ondersteunt onderwijzers overal door de kosten van essentiële schoolbenodigdheden te delen.',
        iKnowATeacher: 'Ik ken een leraar',
        iAmATeacher: 'Ik ben leraar',
        getInTouch: 'Uitstekend! Deel alsjeblieft hun gegevens zodat we contact met hen kunnen opnemen.',
        introSchoolPrincipal: 'Introductie aan je schooldirecteur',
        schoolPrincipalVerifyExpense:
            'Expensify.org deelt de kosten van essentiële schoolspullen, zodat leerlingen uit huishoudens met een laag inkomen een betere leerervaring kunnen hebben. Je directeur wordt gevraagd je uitgaven te verifiëren.',
        principalFirstName: 'Voornaam van de hoofdverzekerde',
        principalLastName: 'Achternaam van hoofd',
        principalWorkEmail: 'Primair zakelijke e-mailadres',
        updateYourEmail: 'Werk je e-mailadres bij',
        updateEmail: 'E-mailadres bijwerken',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Voordat je doorgaat, zorg ervoor dat je je school-e-mailadres instelt als je standaard contactmethode. Dit kun je doen via Instellingen > Profiel > <a href="${contactMethodsRoute}">Contactmethoden</a>.`,
        error: {
            enterPhoneEmail: 'Voer een geldig e-mailadres of telefoonnummer in',
            enterEmail: 'Voer een e-mailadres in',
            enterValidEmail: 'Voer een geldig e-mailadres in',
            tryDifferentEmail: 'Probeer een ander e-mailadres',
        },
    },
    cardTransactions: {
        notActivated: 'Niet geactiveerd',
        outOfPocket: 'Uit eigen zak spenderen',
        companySpend: 'Bedrijfsuitgaven',
    },
    distance: {
        addStop: 'Stop toevoegen',
        deleteWaypoint: 'Waypoint verwijderen',
        deleteWaypointConfirmation: 'Weet je zeker dat je dit routepunt wilt verwijderen?',
        address: 'Adres',
        waypointDescription: {
            start: 'Start',
            stop: 'Stop',
        },
        mapPending: {
            title: 'Toewijzing in behandeling',
            subtitle: 'De kaart wordt gegenereerd zodra je weer online bent',
            onlineSubtitle: 'Een moment terwijl we de kaart instellen',
            errorTitle: 'Mapfout',
            errorSubtitle: 'Er is een fout opgetreden bij het laden van de kaart. Probeer het opnieuw.',
        },
        error: {
            selectSuggestedAddress: 'Selecteer een voorgesteld adres of gebruik huidige locatie',
        },
        odometer: {
            startReading: 'Begin met lezen',
            endReading: 'Lezen beëindigen',
            saveForLater: 'Voor later bewaren',
            totalDistance: 'Totale afstand',
        },
    },
    gps: {
        tooltip: 'GPS-tracking bezig! Als je klaar bent, stop de tracking hieronder.',
        disclaimer: 'Gebruik GPS om een uitgave van je reis te maken. Tik hieronder op Start om het volgen te beginnen.',
        error: {
            failedToStart: 'Locatiebepaling starten is mislukt.',
            failedToGetPermissions: 'Verkrijgen van vereiste locatierechten mislukt.',
        },
        trackingDistance: 'Afstand wordt gevolgd...',
        stopped: 'Gestopt',
        start: 'Start',
        stop: 'Stop',
        discard: 'Verwerpen',
        stopGpsTrackingModal: {
            title: 'GPS-tracking stoppen',
            prompt: 'Weet je het zeker? Dit beëindigt je huidige proces.',
            cancel: 'Tracking hervatten',
            confirm: 'GPS-tracking stoppen',
        },
        discardDistanceTrackingModal: {
            title: 'Afstandstracking negeren',
            prompt: 'Weet je het zeker? Hiermee wordt je huidige traject verwijderd en dit kan niet ongedaan worden gemaakt.',
            confirm: 'Afstandstracking negeren',
        },
        zeroDistanceTripModal: {
            title: 'Kan onkostennota niet aanmaken',
            prompt: 'Je kunt geen uitgave aanmaken met dezelfde begin- en eindlocatie.',
        },
        locationRequiredModal: {
            title: 'Locatietoegang vereist',
            prompt: 'Sta locatie-toegang toe in de instellingen van je apparaat om GPS-afstandsregistratie te starten.',
            allow: 'Toestaan',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Toegang tot locatie op de achtergrond vereist',
            prompt: 'Sta achtergrondlocatietoegang toe in de instellingen van je apparaat (optie ‘Altijd toestaan’) om GPS-afstandsregistratie te starten.',
        },
        preciseLocationRequiredModal: {
            title: 'Precieze locatie vereist',
            prompt: 'Schakel alsjeblieft ‘precieze locatie’ in de instellingen van je apparaat in om GPS-afstandsregistratie te starten.',
        },
        desktop: {
            title: 'Volg afstand op je telefoon',
            subtitle: 'Registreer automatisch kilometers of mijlen met GPS en zet ritten direct om in uitgaven.',
            button: 'Download de app',
        },
        notification: {
            title: 'GPS-tracking bezig',
            body: 'Ga naar de app om af te ronden',
        },
        locationServicesRequiredModal: {
            title: 'Locatietoegang vereist',
            confirm: 'Instellingen openen',
            prompt: 'Sta locatie-toegang toe in de instellingen van je apparaat om GPS-afstandsregistratie te starten.',
        },
        fabGpsTripExplained: 'Ga naar gps-scherm (zwevende actie)',
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Rapportkaart kwijt of beschadigd',
        nextButtonLabel: 'Volgende',
        reasonTitle: 'Waarom heb je een nieuwe kaart nodig?',
        cardDamaged: 'Mijn kaart is beschadigd',
        cardLostOrStolen: 'Mijn kaart is verloren of gestolen',
        confirmAddressTitle: 'Bevestig alsjeblieft het postadres voor je nieuwe kaart.',
        cardDamagedInfo: 'Je nieuwe kaart wordt binnen 2-3 werkdagen bezorgd. Je huidige kaart blijft werken totdat je je nieuwe kaart activeert.',
        cardLostOrStolenInfo: 'Je huidige kaart wordt permanent gedeactiveerd zodra je bestelling is geplaatst. De meeste kaarten worden binnen enkele werkdagen bezorgd.',
        address: 'Adres',
        deactivateCardButton: 'Kaart deactiveren',
        shipNewCardButton: 'Nieuwe kaart verzenden',
        addressError: 'Adres is verplicht',
        reasonError: 'Reden is verplicht',
        successTitle: 'Je nieuwe kaart is onderweg!',
        successDescription: 'Je moet deze activeren zodra hij over een paar werkdagen is aangekomen. In de tussentijd kun je een virtuele kaart gebruiken.',
    },
    eReceipt: {
        guaranteed: 'Gegarandeerde e-bon',
        transactionDate: 'Transactiedatum',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Begin een chat, <success><strong>verwijs een vriend</strong></success>.',
            header: 'Start een chat, verwijs een vriend',
            body: 'Willen je vrienden Expensify ook gebruiken? Begin gewoon een chat met hen en wij regelen de rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Dien een onkostendeclaratie in, <success><strong>verwijs je team door</strong></success>.',
            header: 'Dien een uitgave in, verwijs je team',
            body: 'Wil je dat je team Expensify ook gaat gebruiken? Dien gewoon een uitgave bij hen in en wij zorgen voor de rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Verwijs een vriend',
            body: 'Wil je dat je vrienden Expensify ook gebruiken? Chat, betaal of splits gewoon een uitgave met hen en wij regelen de rest. Of deel gewoon je uitnodigingslink!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Verwijs een vriend',
            header: 'Verwijs een vriend',
            body: 'Wil je dat je vrienden Expensify ook gebruiken? Chat, betaal of splits gewoon een uitgave met hen en wij regelen de rest. Of deel gewoon je uitnodigingslink!',
        },
        copyReferralLink: 'Uitnodigingslink kopiëren',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chat met je setupspecificatie-expert in <a href="${href}">${adminReportName}</a> voor hulp`,
        default: `Stuur een bericht naar <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> voor hulp bij de installatie`,
    },
    violations: {
        allTagLevelsRequired: 'Alle tags vereist',
        autoReportedRejectedExpense: 'Deze uitgave is afgewezen.',
        billableExpense: 'Factureerbaar niet meer geldig',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Bon nodig${formattedLimit ? `boven ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Categorie niet meer geldig',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `${surcharge}% omrekeningskosten toegepast`,
        customUnitOutOfPolicy: 'Tarief niet geldig voor deze workspace',
        duplicatedTransaction: 'Mogelijk duplicaat',
        fieldRequired: 'Rapportvelden zijn verplicht',
        futureDate: 'Toekomstige datum niet toegestaan',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Opgeslagen met een opslag van ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Datum ouder dan ${maxAge} dagen`,
        missingCategory: 'Categorie ontbreekt',
        missingComment: 'Beschrijving vereist voor de geselecteerde categorie',
        missingAttendees: 'Meerdere deelnemers vereist voor deze categorie',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Ontbrekende ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Bedrag wijkt af van berekende afstand';
                case 'card':
                    return 'Bedrag groter dan kaarttransactie';
                default:
                    if (displayPercentVariance) {
                        return `Bedrag is ${displayPercentVariance}% hoger dan het gescande bonnetje`;
                    }
                    return 'Bedrag groter dan gescande bon';
            }
        },
        modifiedDate: 'Datum wijkt af van gescande bon',
        nonExpensiworksExpense: 'Niet-Expensiworks-uitgave',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Declaratie overschrijdt de automatische goedkeuringslimiet van ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Bedrag boven de categorielimiet van ${formattedLimit}/persoon`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Bedrag boven limiet van ${formattedLimit} per persoon`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Bedrag boven de limiet van ${formattedLimit} per reis`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Bedrag boven limiet van ${formattedLimit} per persoon`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Bedrag boven de dagelijkse categorielimiet van ${formattedLimit} per persoon`,
        receiptNotSmartScanned: 'Bon en onkostendetails handmatig toegevoegd.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Bon vereist boven categorielimiet van ${formattedLimit}`;
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
                        return `hotelbijbehorende kosten`;
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
                    ? `Bankverbinding verbroken. <a href="${companyCardPageURL}">Opnieuw verbinden om bon te koppelen</a>`
                    : 'Bankkoppeling verbroken. Vraag een beheerder om opnieuw te verbinden om de bon te matchen.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Vraag ${member} om het als contant te markeren of wacht 7 dagen en probeer het opnieuw` : 'In afwachting van samenvoeging met kaarttransactie.';
            }
            return '';
        },
        brokenConnection530Error: 'Bonnetje in behandeling vanwege verbroken bankkoppeling',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Bon in behandeling vanwege verbroken bankkoppeling. Los dit op in <a href="${workspaceCompanyCardRoute}">Bedrijfskaarten</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Bonnetje in behandeling vanwege een verbroken bankkoppeling. Vraag een workspacebeheerder om dit op te lossen.',
        markAsCashToIgnore: 'Markeren als contant om te negeren en betaling aan te vragen.',
        smartscanFailed: ({canEdit = true}) => `Bonnetjes scannen is mislukt.${canEdit ? 'Voer de gegevens handmatig in.' : ''}`,
        receiptGeneratedWithAI: 'Mogelijke AI-gegenereerde bon',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Ontbreekt ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} niet meer geldig`,
        taxAmountChanged: 'Belastingbedrag is gewijzigd',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Belasting'} niet meer geldig`,
        taxRateChanged: 'Belastingtarief is gewijzigd',
        taxRequired: 'Ontbrekend belastingtarief',
        none: 'Geen',
        taxCodeToKeep: 'Kies welke belastingcode je wilt behouden',
        tagToKeep: 'Kies welke tag je wilt behouden',
        isTransactionReimbursable: 'Kies of de transactie terugbetaalbaar is',
        merchantToKeep: 'Kies welke aanbieder je wilt behouden',
        descriptionToKeep: 'Kies welke omschrijving u wilt behouden',
        categoryToKeep: 'Kies welke categorie je wilt behouden',
        isTransactionBillable: 'Kies of de transactie factureerbaar is',
        keepThisOne: 'Bewaar deze',
        confirmDetails: `Bevestig de gegevens die je behoudt`,
        confirmDuplicatesInfo: `De duplicaten die je niet bewaart, worden vastgehouden zodat de indiener ze kan verwijderen.`,
        hold: 'Deze uitgave is on hold gezet',
        resolvedDuplicates: 'heeft het duplicaat opgelost',
        companyCardRequired: 'Bedrijfspaskaarten vereist',
        noRoute: 'Selecteer een geldig adres',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} is verplicht`,
        reportContainsExpensesWithViolations: 'Rapport bevat onkosten met overtredingen.',
    },
    violationDismissal: {
        rter: {
            manual: 'heeft deze bon als contant gemarkeerd',
        },
        duplicatedTransaction: {
            manual: 'heeft het duplicaat opgelost',
        },
    },
    videoPlayer: {
        play: 'Afspelen',
        pause: 'Pauzeren',
        fullscreen: 'Volledig scherm',
        playbackSpeed: 'Afspeelsnelheid',
        expand: 'Uitklappen',
        mute: 'Dempen',
        unmute: 'Dempen opheffen',
        normal: 'Normaal',
    },
    exitSurvey: {
        header: 'Voordat je gaat',
        reasonPage: {
            title: 'Vertel ons alstublieft waarom u weggaat',
            subtitle: 'Voordat je gaat, vertel ons alsjeblieft waarom je wilt overschakelen naar Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Ik heb een functie nodig die alleen beschikbaar is in Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Ik begrijp niet hoe ik New Expensify moet gebruiken.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Ik begrijp hoe ik New Expensify moet gebruiken, maar ik geef de voorkeur aan Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Welke functie heb je nodig die nog niet beschikbaar is in New Expensify?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Wat probeer je te doen?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Waarom geef je de voorkeur aan Expensify Classic?',
        },
        responsePlaceholder: 'Uw reactie',
        thankYou: 'Bedankt voor de feedback!',
        thankYouSubtitle: 'Uw antwoorden helpen ons een beter product te bouwen om dingen gedaan te krijgen. Hartelijk dank!',
        goToExpensifyClassic: 'Overschakelen naar Expensify Classic',
        offlineTitle: 'Het lijkt erop dat je hier vastzit...',
        offline:
            'Het lijkt erop dat je offline bent. Helaas werkt Expensify Classic niet offline, maar New Expensify wel. Als je liever Expensify Classic gebruikt, probeer het dan opnieuw wanneer je weer een internetverbinding hebt.',
        quickTip: 'Snelle tip...',
        quickTipSubTitle: 'Je kunt rechtstreeks naar Expensify Classic gaan door naar expensify.com te gaan. Maak er een bladwijzer van voor een snelle snelkoppeling!',
        bookACall: 'Bel een gesprek boeken',
        bookACallTitle: 'Wilt u met een productmanager spreken?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Direct chatten over uitgaven en declaraties',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Mogelijkheid om alles op mobiel te doen',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Reizen en declareren met de snelheid van chat',
        },
        bookACallTextTop: 'Als je overschakelt naar Expensify Classic, loop je het volgende mis:',
        bookACallTextBottom:
            'We plannen graag een gesprek met je in om te begrijpen waarom. Je kunt een gesprek boeken met een van onze senior productmanagers om je behoeften te bespreken.',
        takeMeToExpensifyClassic: 'Breng me naar Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Er is een fout opgetreden bij het laden van meer berichten',
        tryAgain: 'Probeer opnieuw',
    },
    systemMessage: {
        mergedWithCashTransaction: 'heeft een bon aan deze transactie gekoppeld',
    },
    subscription: {
        authenticatePaymentCard: 'Betaalkaart verifiëren',
        mobileReducedFunctionalityMessage: 'Je kunt je abonnement niet wijzigen in de mobiele app.',
        badge: {
            freeTrial: (numOfDays: number) => `Gratis proefperiode: nog ${numOfDays} ${numOfDays === 1 ? 'dag' : 'dagen'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Je betaalgegevens zijn verouderd',
                subtitle: (date: string) => `Werk je betaalkaart bij vóór ${date} om al je favoriete functies te blijven gebruiken.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Je betaling kon niet worden verwerkt',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `Uw afschrijving van ${purchaseAmountOwed} op ${date} kon niet worden verwerkt. Voeg een betaalkaart toe om het openstaande bedrag te voldoen.`
                        : 'Voeg een betaalkaart toe om het openstaande bedrag te voldoen.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Je betaalgegevens zijn verouderd',
                subtitle: (date: string) => `Je betaling is vervallen. Betaal je factuur vóór ${date} om onderbreking van de service te voorkomen.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Je betaalgegevens zijn verouderd',
                subtitle: 'Uw betaling is vervallen. Betaal alstublieft uw factuur.',
            },
            billingDisputePending: {
                title: 'Je kaart kon niet worden belast',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `Je hebt de ${amountOwed}-afschrijving op de kaart die eindigt op ${cardEnding} betwist. Je account wordt vergrendeld totdat het geschil met je bank is opgelost.`,
            },
            cardAuthenticationRequired: {
                title: 'Uw betaalkaart is nog niet volledig geverifieerd.',
                subtitle: (cardEnding: string) => `Voltooi het verificatieproces om je betaalkaart die eindigt op ${cardEnding} te activeren.`,
            },
            insufficientFunds: {
                title: 'Je kaart kon niet worden belast',
                subtitle: (amountOwed: number) =>
                    `Je betaalkaart is geweigerd vanwege onvoldoende saldo. Probeer het opnieuw of voeg een nieuwe betaalkaart toe om je openstaande saldo van ${amountOwed} te voldoen.`,
            },
            cardExpired: {
                title: 'Je kaart kon niet worden belast',
                subtitle: (amountOwed: number) => `Je betaalkaart is verlopen. Voeg een nieuwe betaalkaart toe om je openstaande saldo van ${amountOwed} te vereffenen.`,
            },
            cardExpireSoon: {
                title: 'Je kaart verloopt binnenkort',
                subtitle:
                    'Je betaalkaart verloopt aan het einde van deze maand. Klik op het menu met de drie puntjes hieronder om je kaart bij te werken en al je favoriete functies te blijven gebruiken.',
            },
            retryBillingSuccess: {
                title: 'Gelukt!',
                subtitle: 'Uw kaart is succesvol belast.',
            },
            retryBillingError: {
                title: 'Je kaart kon niet worden belast',
                subtitle:
                    'Voordat je het opnieuw probeert, neem rechtstreeks contact op met je bank om Expensify-kosten goed te keuren en eventuele blokkades te verwijderen. Probeer anders een andere betaalkaart toe te voegen.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Je hebt de ${amountOwed}-afschrijving op de kaart die eindigt op ${cardEnding} betwist. Je account wordt vergrendeld totdat het geschil met je bank is opgelost.`,
            preTrial: {
                title: 'Begin een gratis proefperiode',
                subtitle: 'Maak als volgende stap je <a href="#">installatielijst compleet</a>, zodat je team kan beginnen met declareren.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Proefperiode: nog ${numOfDays} ${numOfDays === 1 ? 'dag' : 'dagen'}!`,
                subtitle: 'Voeg een betaalkaart toe om al je favoriete functies te blijven gebruiken.',
            },
            trialEnded: {
                title: 'Je gratis proefperiode is afgelopen',
                subtitle: 'Voeg een betaalkaart toe om al je favoriete functies te blijven gebruiken.',
            },
            earlyDiscount: {
                claimOffer: 'Aanbieding claimen',
                subscriptionPageTitle: (discountType: number) => `<strong>${discountType}% korting op je eerste jaar!</strong> Voeg gewoon een betaalkaart toe en start een jaarabonnement.`,
                onboardingChatTitle: (discountType: number) => `Aanbieding voor beperkte tijd: ${discountType}% korting op je eerste jaar!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `Claim binnen ${days > 0 ? `${days}d :` : ''}${hours}u : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Betaling',
            subtitle: 'Voeg een kaart toe om je Expensify-abonnement te betalen.',
            addCardButton: 'Betaalkaart toevoegen',
            cardInfo: (name: string, expiration: string, currency: string) => `Naam: ${name}, Vervaldatum: ${expiration}, Valuta: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Je volgende betalingsdatum is ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Kaart eindigend op ${cardNumber}`,
            changeCard: 'Betaalkaart wijzigen',
            changeCurrency: 'Betaalvaluta wijzigen',
            cardNotFound: 'Geen betaalkaart toegevoegd',
            retryPaymentButton: 'Betaling opnieuw proberen',
            authenticatePayment: 'Betaling verifiëren',
            requestRefund: 'Terugbetaling aanvragen',
            requestRefundModal: {
                full: 'Een terugbetaling krijgen is eenvoudig: downgrade je account vóór je volgende factureringsdatum en je ontvangt een terugbetaling. <br /> <br /> Let op: als je je account downgraden, worden je werkruimten verwijderd. Deze actie kan niet ongedaan worden gemaakt, maar je kunt altijd een nieuwe werkruimte aanmaken als je van gedachten verandert.',
                confirm: 'Werkruimte(s) verwijderen en abonnement downgraden',
            },
            viewPaymentHistory: 'Bekijk betalingsgeschiedenis',
        },
        yourPlan: {
            title: 'Uw abonnement',
            exploreAllPlans: 'Bekijk alle abonnementen',
            customPricing: 'Aangepaste prijzen',
            asLowAs: ({price}: YourPlanPriceValueParams) => `vanaf ${price} per actieve deelnemer/maand`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} per lid/maand`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} per lid per maand`,
            perMemberMonth: 'per lid/maand',
            collect: {
                title: 'Innen',
                description: 'Het kleinzakelijk abonnement dat je uitgaven, reizen en chat biedt.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                benefit1: 'Bonnetjesscan',
                benefit2: 'Vergoedingen',
                benefit3: 'Beheer van zakelijke kaarten',
                benefit4: 'Declaraties en reisgoedkeuringen',
                benefit5: 'Boekingen en regels voor reizen',
                benefit6: 'QuickBooks/Xero-integraties',
                benefit7: 'Chat over uitgaven, rapporten en ruimtes',
                benefit8: 'AI- en menselijke ondersteuning',
            },
            control: {
                title: 'Beheer',
                description: 'Declareren, reizen en chatten voor grotere bedrijven.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                benefit1: 'Alles in het Collect-abonnement',
                benefit2: 'Goedkeuringsworkflows op meerdere niveaus',
                benefit3: 'Aangepaste onkostregels',
                benefit4: 'ERP-integraties (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'HR-integraties (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Aangepaste inzichten en rapportages',
                benefit8: 'Budgettering',
            },
            thisIsYourCurrentPlan: 'Dit is je huidige abonnement',
            downgrade: 'Downgraden naar Collect',
            upgrade: 'Upgrade naar Control',
            addMembers: 'Leden toevoegen',
            saveWithExpensifyTitle: 'Bespaar met de Expensify Card',
            saveWithExpensifyDescription: 'Gebruik onze besparingscalculator om te zien hoe cash back van de Expensify Card je Expensify-rekening kan verlagen.',
            saveWithExpensifyButton: 'Meer informatie',
        },
        compareModal: {
            comparePlans: 'Vergelijk abonnementen',
            subtitle: `<muted-text>Ontgrendel de functies die je nodig hebt met het abonnement dat bij je past. <a href="${CONST.PRICING}">Bekijk onze prijspagina</a> voor een volledig overzicht van de functies van elk abonnement.</muted-text>`,
        },
        details: {
            title: 'Abonnementsgegevens',
            annual: 'Jaarabonnement',
            taxExempt: 'Vrijstelling van belasting aanvragen',
            taxExemptEnabled: 'Vrijgesteld van belasting',
            taxExemptStatus: 'Belastingvrijstellingstatus',
            payPerUse: 'Betalen naar gebruik',
            subscriptionSize: 'Abonnee-aantal',
            headsUp:
                'Let op: als je je abonnementsomvang nu niet instelt, passen wij deze automatisch aan op het aantal actieve leden in je eerste maand. Je zit dan vast aan het betalen voor minstens dit aantal leden gedurende de volgende 12 maanden. Je kunt je abonnementsomvang op elk moment verhogen, maar je kunt deze pas verlagen als je abonnement is afgelopen.',
            zeroCommitment: 'Geen verplichtingen tegen het verdisconteerde jaarlijkse abonnementstarief',
        },
        subscriptionSize: {
            title: 'Abonnee-aantal',
            yourSize: 'De omvang van je abonnement is het aantal open plaatsen dat in een bepaalde maand door elk actief lid kan worden ingevuld.',
            eachMonth:
                'Elke maand dekt je abonnement tot het hierboven ingestelde aantal actieve leden. Telkens wanneer je je abonnementsomvang verhoogt, start je een nieuw 12-maandenabonnement met die nieuwe omvang.',
            note: 'Opmerking: Een actief lid is iedereen die onkosten­gegevens heeft aangemaakt, bewerkt, ingediend, goedgekeurd, terugbetaald of geëxporteerd die aan de werkruimte van uw bedrijf zijn gekoppeld.',
            confirmDetails: 'Bevestig de details van uw nieuwe jaarlijkse abonnement:',
            subscriptionSize: 'Abonnee-aantal',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} actieve leden/maand`,
            subscriptionRenews: 'Abonnement wordt verlengd',
            youCantDowngrade: 'Je kunt je abonnement niet downgraden tijdens je jaarlijkse abonnementsperiode.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Je hebt je al gecommitteerd aan een jaarlijkse abonnementsomvang van ${size} actieve leden per maand tot ${date}. Je kunt op ${date} overschakelen naar een betalen-per-gebruik-abonnement door automatisch verlengen uit te schakelen.`,
            error: {
                size: 'Voer een geldige abonnementsomvang in',
                sameSize: 'Voer een ander aantal in dan uw huidige abonnementsomvang',
            },
        },
        paymentCard: {
            addPaymentCard: 'Betaalkaart toevoegen',
            enterPaymentCardDetails: 'Voer uw betaalkaartgegevens in',
            security: 'Expensify is PCI-DSS-conform, gebruikt bancaire encryptie en maakt gebruik van redundante infrastructuur om je gegevens te beschermen.',
            learnMoreAboutSecurity: 'Meer informatie over onze beveiliging.',
        },
        subscriptionSettings: {
            title: 'Abonnementsinstellingen',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Abonnementstype: ${subscriptionType}, Abonnementsomvang: ${subscriptionSize}, Automatisch verlengen: ${autoRenew}, Aantal jaarlijkse plaatsen automatisch verhogen: ${autoIncrease}`,
            none: 'geen',
            on: 'aan',
            off: 'uit',
            annual: 'Jaarlijks',
            autoRenew: 'Automatisch verlengen',
            autoIncrease: 'Jaarlijkse seats automatisch verhogen',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Bespaar tot ${amountWithCurrency}/maand per actief lid`,
            automaticallyIncrease:
                'Verhoog je jaarlijkse aantal plaatsen automatisch om ruimte te bieden aan actieve leden die je abonnementsomvang overschrijden. Let op: hierdoor wordt de einddatum van je jaarlijkse abonnement verlengd.',
            disableAutoRenew: 'Automatisch verlengen uitschakelen',
            helpUsImprove: 'Help ons Expensify verbeteren',
            whatsMainReason: 'Wat is de belangrijkste reden dat je automatisch verlengen uitschakelt?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Wordt verlengd op ${date}.`,
            pricingConfiguration: 'De prijs is afhankelijk van de configuratie. Kies voor de laagste prijs een jaarabonnement en vraag de Expensify Card aan.',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>Meer informatie op onze <a href="${CONST.PRICING}">prijspagina</a> of chat met ons team in je ${hasAdminsRoom ? `<a href="adminsRoom">#admins-kamer.</a>` : '#admins-kamer.'}</muted-text>`,
            estimatedPrice: 'Geschatte prijs',
            changesBasedOn: 'Dit verandert op basis van je gebruik van de Expensify Card en de abonnementsopties hieronder.',
        },
        requestEarlyCancellation: {
            title: 'Vroegtijdige opzegging aanvragen',
            subtitle: 'Wat is de belangrijkste reden waarom je om voortijdige annulering vraagt?',
            subscriptionCanceled: {
                title: 'Abonnement opgezegd',
                subtitle: 'Je jaarlijkse abonnement is opgezegd.',
                info: 'Als je je werkruimte(s) op basis van betalen-per-gebruik wilt blijven gebruiken, ben je helemaal klaar.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Als je toekomstige activiteit en kosten wilt voorkomen, moet je je <a href="${workspacesListRoute}">workspace(s) verwijderen</a>. Let op: wanneer je je workspace(s) verwijdert, worden alle openstaande activiteiten die in de huidige kalendermaand hebben plaatsgevonden in rekening gebracht.`,
            },
            requestSubmitted: {
                title: 'Verzoek ingediend',
                subtitle:
                    'Bedankt dat je ons laat weten dat je je abonnement wilt opzeggen. We bekijken je verzoek en nemen binnenkort contact met je op via je chat met <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Door om vervroegde beëindiging te verzoeken, erken en ga ik ermee akkoord dat Expensify op grond van de Expensify-<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Servicevoorwaarden</a> of een andere toepasselijke dienstenovereenkomst tussen mij en Expensify niet verplicht is een dergelijk verzoek in te willigen en dat Expensify volledige beslissingsbevoegdheid behoudt met betrekking tot het al dan niet honoreren van een dergelijk verzoek.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Functionaliteit moet worden verbeterd',
        tooExpensive: 'Te duur',
        inadequateSupport: 'Onvoldoende klantenondersteuning',
        businessClosing: 'Bedrijf sluit, krimpt in of is overgenomen',
        additionalInfoTitle: 'Naar welke software stap je over en waarom?',
        additionalInfoInputLabel: 'Uw reactie',
    },
    roomChangeLog: {
        updateRoomDescription: 'stel de kamerbeschrijving in op:',
        clearRoomDescription: 'heeft de kamerbeschrijving gewist',
        changedRoomAvatar: 'heeft de ruimte-avatar gewijzigd',
        removedRoomAvatar: 'heeft de kameravatar verwijderd',
    },
    delegate: {
        switchAccount: 'Van account wisselen:',
        copilotDelegatedAccess: 'Copilot: gedelegeerde toegang',
        copilotDelegatedAccessDescription: 'Geef andere leden toegang tot je account.',
        addCopilot: 'Copiloot toevoegen',
        membersCanAccessYourAccount: 'Deze leden hebben toegang tot je account:',
        youCanAccessTheseAccounts: 'Je hebt toegang tot deze accounts via de accountswitcher:',
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
        onBehalfOfMessage: (delegator: string) => `namens ${delegator}`,
        accessLevel: 'Toegangsniveau',
        confirmCopilot: 'Bevestig hieronder je copiloot.',
        accessLevelDescription: 'Kies hieronder een toegangs­niveau. Zowel Volledige als Beperkte toegang geven copilots toegang tot alle gesprekken en uitgaven.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Sta een ander lid toe om alle handelingen in je account namens jou uit te voeren. Omvat chatten, indienen, goedkeuren, betalingen, het bijwerken van instellingen en meer.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Sta een ander lid toe om de meeste acties in je account namens jou uit te voeren. Keuringen, betalingen, afwijzingen en blokkeringen zijn uitgesloten.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copiloot verwijderen',
        removeCopilotConfirmation: 'Weet je zeker dat je deze copiloot wilt verwijderen?',
        changeAccessLevel: 'Toegangsniveau wijzigen',
        makeSureItIsYou: 'We controleren of jij het bent',
        enterMagicCode: (contactMethod: string) =>
            `Voer de magische code in die naar ${contactMethod} is gestuurd om een copiloot toe te voegen. Deze zou binnen één à twee minuten moeten aankomen.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Voer de magische code in die is verzonden naar ${contactMethod} om je copiloot bij te werken.`,
        notAllowed: 'Niet zo snel...',
        noAccessMessage: dedent(`
            Als copiloot heb je geen toegang tot
            deze pagina. Sorry!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `Als <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copiloot</a> voor ${accountOwnerEmail} heb je geen toestemming om deze actie uit te voeren. Sorry!`,
        copilotAccess: 'Copilot-toegang',
    },
    debug: {
        debug: 'Debug',
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
        reportAction: 'Rapportactie',
        report: 'Rapport',
        transaction: 'Transactie',
        violations: 'Overtredingen',
        transactionViolation: 'Transactieovertreding',
        hint: 'Gegevenswijzigingen worden niet naar de backend verzonden',
        textFields: 'Tekstvelden',
        numberFields: 'Numerieke velden',
        booleanFields: 'Booleaanse velden',
        constantFields: 'Constante velden',
        dateTimeFields: 'Datum/tijd-velden',
        date: 'Datum',
        time: 'Tijd',
        none: 'Geen',
        visibleInLHN: 'Zichtbaar in LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'waarwaar',
        false: 'onwaar',
        viewReport: 'Rapport bekijken',
        viewTransaction: 'Transactie bekijken',
        createTransactionViolation: 'Transactieovertreding maken',
        reasonVisibleInLHN: {
            hasDraftComment: 'Heeft conceptreactie',
            hasGBR: 'Heeft GBR',
            hasRBR: 'Heeft RBR',
            pinnedByUser: 'Vastgezet door lid',
            hasIOUViolations: 'Heeft IOU-overtredingen',
            hasAddWorkspaceRoomErrors: 'Heeft fouten bij het toevoegen van werkruimtekamer',
            isUnread: 'Is ongelezen (focusmodus)',
            isArchived: 'Is gearchiveerd (meest recente modus)',
            isSelfDM: 'Is eigen DM',
            isFocused: 'Is tijdelijk gefocust',
        },
        reasonGBR: {
            hasJoinRequest: 'Heeft join-verzoek (adminruimte)',
            isUnreadWithMention: 'Is ongelezen met vermelding',
            isWaitingForAssigneeToCompleteAction: 'Wacht totdat de verantwoordelijke de actie voltooit',
            hasChildReportAwaitingAction: 'Heeft onderliggend rapport in afwachting van actie',
            hasMissingInvoiceBankAccount: 'Heeft een ontbrekende bankrekening voor facturen',
            hasUnresolvedCardFraudAlert: 'Heeft onopgeloste kaartfraudewaarschuwing',
        },
        reasonRBR: {
            hasErrors: 'Bevat fouten in rapport of rapportactiesgegevens',
            hasViolations: 'Heeft overtredingen',
            hasTransactionThreadViolations: 'Heeft threadschendingen in de transactie',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Er wacht een rapport op actie',
            theresAReportWithErrors: 'Er is een rapport met fouten',
            theresAWorkspaceWithCustomUnitsErrors: 'Er is een werkruimte met fouten in aangepaste eenheden',
            theresAProblemWithAWorkspaceMember: 'Er is een probleem met een werkruimtelid',
            theresAProblemWithAWorkspaceQBOExport: 'Er was een probleem met een exportinstelling voor een werkruimteverbinding.',
            theresAProblemWithAContactMethod: 'Er is een probleem met een contactmethode',
            aContactMethodRequiresVerification: 'Een contactmethode vereist verificatie',
            theresAProblemWithAPaymentMethod: 'Er is een probleem met een betaalmethode',
            theresAProblemWithAWorkspace: 'Er is een probleem met een werkruimte',
            theresAProblemWithYourReimbursementAccount: 'Er is een probleem met je terugbetalingsaccount',
            theresABillingProblemWithYourSubscription: 'Er is een probleem met de facturering van je abonnement',
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
        subtitle: 'Het bevat alles wat je gewend bent van onze klassieke ervaring, plus een heleboel upgrades om je leven nog gemakkelijker te maken:',
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
        saveSearchTooltip: '<tooltip><strong>Hernoem je opgeslagen zoekopdrachten</strong> hier!</tooltip>',
        accountSwitcher: '<tooltip>Open hier je <strong>Copilot-accounts</strong></tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Scan onze testbon</strong> om te zien hoe het werkt!</tooltip>',
            manager: '<tooltip>Kies onze <strong>testmanager</strong> om het uit te proberen!</tooltip>',
            confirmation: '<tooltip>Dien nu <strong>je uitgave in</strong> en zie de magie gebeuren!</tooltip>',
            tryItOut: 'Probeer het uit',
        },
        outstandingFilter: '<tooltip>Filter voor declaraties\ndie <strong>goedgekeurd moeten worden</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Verzend deze bon om\n<strong>de proefrit af te ronden!</strong></tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Wijzigingen verwerpen?',
        body: 'Weet je zeker dat je de aangebrachte wijzigingen wilt weggooien?',
        confirmText: 'Wijzigingen weggooien',
    },
    scheduledCall: {
        book: {
            title: 'Gesprek inplannen',
            description: 'Vind een tijdstip dat voor jou uitkomt.',
            slots: ({date}: {date: string}) => `<muted-text>Beschikbare tijden voor <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Gesprek bevestigen',
            description: 'Zorg ervoor dat de onderstaande gegevens er goed uitzien voor jou. Zodra je het gesprek bevestigt, sturen we een uitnodiging met meer informatie.',
            setupSpecialist: 'Uw installatiespecialist',
            meetingLength: 'Vergadertijd',
            dateTime: 'Datum en tijd',
            minutes: '30 minuten',
        },
        callScheduled: 'Call ingepland',
    },
    autoSubmitModal: {
        title: 'Helemaal duidelijk en verzonden!',
        description: 'Alle waarschuwingen en overtredingen zijn gewist, dus:',
        submittedExpensesTitle: 'Deze onkosten zijn ingediend',
        submittedExpensesDescription: 'Deze uitgaven zijn naar je fiatteur gestuurd, maar kunnen nog worden bewerkt totdat ze zijn goedgekeurd.',
        pendingExpensesTitle: 'In afwachting zijnde uitgaven zijn verplaatst',
        pendingExpensesDescription: 'Alle openstaande kaartuitgaven zijn verplaatst naar een apart rapport totdat ze worden geboekt.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Maak een testrit van 2 minuten',
        },
        modal: {
            title: 'Probeer ons uit',
            description: 'Volg een korte productrondleiding om snel op de hoogte te zijn.',
            confirmText: 'Start proefrit',
            helpText: 'Overslaan',
            employee: {
                description:
                    '<muted-text>Geef je team <strong>3 gratis maanden Expensify!</strong> Vul hieronder het e‑mailadres van je baas in en stuur hen een testdeclaratie.</muted-text>',
                email: 'Voer het e-mailadres van je baas in',
                error: 'Dat lid is eigenaar van een werkruimte, voer een nieuw lid in om te testen.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Je bent Expensify momenteel aan het uitproberen',
            readyForTheRealThing: 'Klaar voor het echte werk?',
            getStarted: 'Aan de slag',
        },
        employeeInviteMessage: (name: string) => `# ${name} heeft je uitgenodigd om Expensify uit te proberen
Hoi! Ik heb zojuist *3 maanden gratis* geregeld om Expensify uit te proberen, de snelste manier om onkostendeclaraties te doen.

Hier is een *testbon* om je te laten zien hoe het werkt:`,
    },
    export: {
        basicExport: 'Basisexport',
        reportLevelExport: 'Alle gegevens - rapportniveau',
        expenseLevelExport: 'Alle gegevens - uitgaveniveau',
        exportInProgress: 'Export wordt uitgevoerd',
        conciergeWillSend: 'Concierge stuurt je het bestand zo snel mogelijk.',
    },
    domain: {
        notVerified: 'Niet geverifieerd',
        retry: 'Opnieuw proberen',
        verifyDomain: {
            title: 'Domein verifiëren',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Ga voordat je verdergaat na of je eigenaar bent van <strong>${domainName}</strong> door de DNS-instellingen ervan bij te werken.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Ga naar je DNS-provider en open de DNS-instellingen voor <strong>${domainName}</strong>.`,
            addTXTRecord: 'Voeg het volgende TXT-record toe:',
            saveChanges: 'Sla de wijzigingen op en keer hier terug om je domein te verifiëren.',
            youMayNeedToConsult: `Mogelijk moet je de IT-afdeling van je organisatie raadplegen om de verificatie te voltooien. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Meer informatie</a>.`,
            warning: 'Na verificatie ontvangen alle Expensify-leden op je domein een e-mail dat hun account onder jouw domein wordt beheerd.',
            codeFetchError: 'Verificatiecode kan niet worden opgehaald',
            genericError: 'We konden je domein niet verifiëren. Probeer het opnieuw en neem contact op met Concierge als het probleem zich blijft voordoen.',
        },
        domainVerified: {
            title: 'Domein geverifieerd',
            header: 'Wooo! Je domein is geverifieerd',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Het domein <strong>${domainName}</strong> is succesvol geverifieerd en je kunt nu SAML en andere beveiligingsfuncties instellen.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML Single Sign-On (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> is een beveiligingsfunctie die je meer controle geeft over hoe leden met een <strong>${domainName}</strong>-e-mailadres inloggen bij Expensify. Om dit in te schakelen, moet je bevestigen dat je een bevoegd bedrijfsbeheerder bent.</muted-text>`,
            fasterAndEasierLogin: 'Sneller en eenvoudiger inloggen',
            moreSecurityAndControl: 'Meer beveiliging en controle',
            onePasswordForAnything: 'Eén wachtwoord voor alles',
        },
        goToDomain: 'Ga naar domein',
        samlLogin: {
            title: 'SAML-aanmelding',
            subtitle: `<muted-text>Configureer aanmelden voor leden met <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO).</a></muted-text>`,
            enableSamlLogin: 'SAML-login inschakelen',
            allowMembers: 'Leden toestaan in te loggen met SAML.',
            requireSamlLogin: 'SAML-aanmelding vereisen',
            anyMemberWillBeRequired: 'Alle leden die zijn ingelogd met een andere methode, moeten zich opnieuw authenticeren met SAML.',
            enableError: 'Kon de SAML-inschakelinstelling niet bijwerken',
            requireError: 'Kon SAML-vereiste-instelling niet bijwerken',
            disableSamlRequired: 'Uitschakelen SAML vereist',
            oktaWarningPrompt: 'Weet je het zeker? Hiermee wordt Okta SCIM ook uitgeschakeld.',
            requireWithEmptyMetadataError: 'Voeg hieronder de metadata van de identiteitsprovider toe om in te schakelen',
        },
        samlConfigurationDetails: {
            title: 'SAML-configuratiedetails',
            subtitle: 'Gebruik deze gegevens om SAML in te stellen.',
            identityProviderMetadata: 'Metadata van identiteitsprovider',
            entityID: 'Entiteits-ID',
            nameIDFormat: 'Naam-ID-indeling',
            loginUrl: 'Login-URL',
            acsUrl: 'ACS (Assertion Consumer Service)-URL',
            logoutUrl: 'Logout-URL',
            sloUrl: 'SLO-URL (Single Logout)',
            serviceProviderMetaData: 'Serviceprovider-metadata',
            oktaScimToken: 'Okta SCIM-token',
            revealToken: 'Token weergeven',
            fetchError: 'Kon SAML-configuratiedetails niet ophalen',
            setMetadataGenericError: 'Kon SAML-metadata niet instellen',
        },
        accessRestricted: {
            title: 'Toegang beperkt',
            subtitle: (domainName: string) => `Verifieer jezelf als bevoegde bedrijfsbeheerder voor <strong>${domainName}</strong> als je controle nodig hebt over:`,
            companyCardManagement: 'Beheer van bedrijfskaarten',
            accountCreationAndDeletion: 'Aanmaken en verwijderen van accounts',
            workspaceCreation: 'Workspace maken',
            samlSSO: 'SAML-SSO',
        },
        addDomain: {
            title: 'Domein toevoegen',
            subtitle: 'Voer de naam in van het privédomein dat u wilt openen (bijv. expensify.com).',
            domainName: 'Domeinnaam',
            newDomain: 'Nieuw domein',
        },
        domainAdded: {
            title: 'Domein toegevoegd',
            description: 'Vervolgens moet je het eigendom van het domein verifiëren en je beveiligingsinstellingen aanpassen.',
            configure: 'Configureren',
        },
        enhancedSecurity: {
            title: 'Verbeterde beveiliging',
            subtitle: 'Vereis dat leden op je domein inloggen via single sign-on, beperk het aanmaken van werkruimtes en meer.',
            enable: 'Inschakelen',
        },
        domainAdmins: 'Domeinbeheerders',
        admins: {
            title: 'Beheerders',
            findAdmin: 'Beheerder zoeken',
            primaryContact: 'Primair contactpersoon',
            addPrimaryContact: 'Primaire contact toevoegen',
            setPrimaryContactError: 'Kan hoofdcontact niet instellen. Probeer het later opnieuw.',
            settings: 'Instellingen',
            consolidatedDomainBilling: 'Geconsolideerde domeinfacturering',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Indien ingeschakeld betaalt de primaire contactpersoon voor alle werkruimtes die eigendom zijn van leden van <strong>${domainName}</strong> en ontvangt deze alle factuurbewijzen.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'Geconsolideerde domeinfacturering kon niet worden gewijzigd. Probeer het later opnieuw.',
            addAdmin: 'Beheerder toevoegen',
            invite: 'Uitnodigen',
            addAdminError: 'Kan dit lid niet toevoegen als beheerder. Probeer het opnieuw.',
            revokeAdminAccess: 'Beheerderstoegang intrekken',
            cantRevokeAdminAccess: 'Kan beheerdersrechten niet intrekken van de technische contactpersoon',
            error: {
                removeAdmin: 'Kan deze gebruiker niet als beheerder verwijderen. Probeer het opnieuw.',
                removeDomain: 'Kan dit domein niet verwijderen. Probeer het opnieuw.',
                removeDomainNameInvalid: 'Voer uw domeinnaam in om deze opnieuw in te stellen.',
            },
            resetDomain: 'Domein resetten',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Typ ter bevestiging van het resetten van het domein <strong>${domainName}</strong>.`,
            enterDomainName: 'Voer hier uw domeinnaam in',
            resetDomainInfo: `Deze actie is <strong>definitief</strong> en de volgende gegevens worden verwijderd: <br/> <ul><li>Bedrijfskaartkoppelingen en alle niet-ingediende uitgaven van die kaarten</li> <li>SAML- en groepsinstellingen</li> </ul> Alle accounts, werkruimten, rapporten, uitgaven en andere gegevens blijven behouden. <br/><br/>Opmerking: je kunt dit domein uit je domeinlijst verwijderen door het bijbehorende e-mailadres te verwijderen uit je <a href="#">contactmethoden</a>.`,
        },
        members: {
            title: 'Leden',
            findMember: 'Lid zoeken',
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
