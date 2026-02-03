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
        count: 'Aantal',
        cancel: 'Annuleren',
        dismiss: 'Sluiten',
        proceed: 'Doorgaan',
        unshare: 'Delen stoppen',
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
        center: 'Midden',
        from: 'Van',
        to: 'Aan',
        in: 'In',
        optional: 'Optioneel',
        new: 'Nieuw',
        newFeature: 'Nieuwe functie',
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
        selectMultiple: 'Meerdere selecteren',
        saveChanges: 'Wijzigingen opslaan',
        submit: 'Verzenden',
        submitted: 'Ingediend',
        rotate: 'Draaien',
        zoom: 'Zoom',
        password: 'Wachtwoord',
        magicCode: 'Magische code',
        digits: 'cijfers',
        twoFactorCode: 'Tweeledige code',
        workspaces: 'Werkruimtes',
        home: 'Startpagina',
        inbox: 'Inbox',
        success: 'Gelukt',
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
        addCardTermsOfService: 'Expensify-gebruiksvoorwaarden',
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
        recents: 'Recenten',
        close: 'Sluiten',
        comment: 'Opmerking',
        download: 'Download',
        downloading: 'Downloaden',
        uploading: 'Bezig met uploaden',
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
        ssnFull9: 'Volledige 9 cijfers van BSN',
        addressLine: (lineNumber: number) => `Adresregel ${lineNumber}`,
        personalAddress: 'Privé-adres',
        companyAddress: 'Bedrijfsadres',
        noPO: 'Geen postbussen of doorstuuradressen, alsjeblieft.',
        city: 'Stad',
        state: 'Status',
        streetAddress: 'Straatadres',
        stateOrProvince: 'Staat / provincie',
        country: 'Land',
        zip: 'Postcode',
        zipPostCode: 'Postcode / Zip',
        whatThis: 'Wat is dit?',
        iAcceptThe: 'Ik ga akkoord met de',
        acceptTermsAndPrivacy: `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify-servicevoorwaarden</a> en het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacybeleid</a>`,
        acceptTermsAndConditions: `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">algemene voorwaarden</a>`,
        acceptTermsOfService: `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify-servicevoorwaarden</a>`,
        remove: 'Verwijderen',
        admin: 'Beheerder',
        owner: 'Eigenaar',
        dateFormat: 'JJJJ-MM-DD',
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
        converted: 'Geconverteerd',
        error: {
            invalidAmount: 'Ongeldig bedrag',
            acceptTerms: 'Je moet de Servicevoorwaarden accepteren om verder te gaan',
            phoneNumber: `Voer een volledig telefoonnummer in
(bijv. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Dit veld is verplicht',
            requestModified: 'Dit verzoek wordt aangepast door een ander lid',
            characterLimitExceedCounter: (length: number, limit: number) => `Limiet voor aantal tekens overschreden (${length}/${limit})`,
            dateInvalid: 'Selecteer een geldige datum',
            invalidDateShouldBeFuture: 'Kies vandaag of een toekomstige datum',
            invalidTimeShouldBeFuture: 'Kies een tijdstip dat minstens één minuut later ligt',
            invalidCharacter: 'Ongeldig teken',
            enterMerchant: 'Voer een naam van een leverancier in',
            enterAmount: 'Voer een bedrag in',
            missingMerchantName: 'Ontbrekende naam handelaar',
            missingAmount: 'Ontbrekend bedrag',
            missingDate: 'Ontbrekende datum',
            enterDate: 'Voer een datum in',
            invalidTimeRange: 'Voer een tijd in met het 12-uurs klokformaat (bijv. 2:30 PM)',
            pleaseCompleteForm: 'Vul het formulier hierboven in om door te gaan',
            pleaseSelectOne: 'Selecteer hierboven een optie',
            invalidRateError: 'Voer een geldig tarief in',
            lowRateError: 'Tarief moet groter zijn dan 0',
            email: 'Voer een geldig e-mailadres in',
            login: 'Er is een fout opgetreden tijdens het inloggen. Probeer het opnieuw.',
        },
        comma: 'komma',
        semicolon: 'puntkomma',
        please: 'Alsjeblieft',
        contactUs: 'neem contact met ons op',
        pleaseEnterEmailOrPhoneNumber: 'Voer een e-mailadres of telefoonnummer in',
        fixTheErrors: 'los de fouten op',
        inTheFormBeforeContinuing: 'in het formulier voordat je doorgaat',
        confirm: 'Bevestigen',
        reset: 'Resetten',
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
        enterManually: 'Voer het handmatig in',
        message: 'Bericht',
        leaveThread: 'Thread verlaten',
        you: 'Jij',
        me: 'ik',
        youAfterPreposition: 'jij',
        your: 'je',
        conciergeHelp: 'Neem contact op met Concierge voor hulp.',
        youAppearToBeOffline: 'Je lijkt offline te zijn.',
        thisFeatureRequiresInternet: 'Deze functie vereist een actieve internetverbinding.',
        attachmentWillBeAvailableOnceBackOnline: 'Bijlage wordt beschikbaar zodra je weer online bent.',
        errorOccurredWhileTryingToPlayVideo: 'Er is een fout opgetreden tijdens het afspelen van deze video.',
        areYouSure: 'Weet je het zeker?',
        verify: 'Verifiëren',
        yesContinue: 'Ja, doorgaan',
        websiteExample: 'bijv. https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `bijv. ${zipSampleFormat}` : ''),
        description: 'Beschrijving',
        title: 'Titel',
        assignee: 'Toegewezene',
        createdBy: 'Gemaakt door',
        with: 'met',
        shareCode: 'Code delen',
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
        showMore: 'Toon meer',
        showLess: 'Minder weergeven',
        merchant: 'Handelaar',
        change: 'Wijzigen',
        category: 'Categorie',
        report: 'Rapport',
        billable: 'Factureerbaar',
        nonBillable: 'Niet-declarabel',
        tag: 'Label',
        receipt: 'Bonnetje',
        verified: 'Geverifieerd',
        replace: 'Vervangen',
        distance: 'Afstand',
        mile: 'mijl',
        miles: 'mijl',
        kilometer: 'kilometer',
        kilometers: 'kilometers',
        recent: 'Recent',
        all: 'Alles',
        am: 'AM',
        pm: 'NM',
        tbd: 'N.t.b.',
        selectCurrency: 'Selecteer een valuta',
        selectSymbolOrCurrency: 'Selecteer een symbool of valuta',
        card: 'Kaart',
        whyDoWeAskForThis: 'Waarom vragen we dit?',
        required: 'Vereist',
        showing: 'Weergeven',
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
            title: 'Yes! Helemaal bij.',
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
        drafts: 'Conceptversies',
        draft: 'Conceptversie',
        finished: 'Voltooid',
        upgrade: 'Upgrade',
        downgradeWorkspace: 'Workspace downgraden',
        companyID: 'Bedrijfs-ID',
        userID: 'Gebruikers-ID',
        disable: 'Uitschakelen',
        export: 'Exporteren',
        initialValue: 'Beginwaarde',
        currentDate: 'Huidige datum',
        value: 'Waarde',
        downloadFailedTitle: 'Downloaden mislukt',
        downloadFailedDescription: 'Je download kon niet worden voltooid. Probeer het later opnieuw.',
        filterLogs: 'Logboeken filteren',
        network: 'Netwerk',
        reportID: 'Rapport-ID',
        longReportID: 'Lang rapport-ID',
        withdrawalID: 'Opname-ID',
        bankAccounts: 'Bankrekeningen',
        chooseFile: 'Bestand kiezen',
        chooseFiles: 'Bestanden kiezen',
        dropTitle: 'Loslaten',
        dropMessage: 'Zet je bestand hier neer',
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
        rename: 'Naam wijzigen',
        address: 'Adres',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        secondAbbreviation: 's',
        skip: 'Overslaan',
        chatWithAccountManager: (accountManagerDisplayName: string) => `Op zoek naar iets specifieks? Chat met je accountmanager, ${accountManagerDisplayName}.`,
        chatNow: 'Nu chatten',
        workEmail: 'Werkmail',
        destination: 'Bestemming',
        subrate: 'Subtarief',
        perDiem: 'Dagvergoeding',
        validate: 'Valideren',
        downloadAsPDF: 'Downloaden als pdf',
        downloadAsCSV: 'Downloaden als CSV',
        help: 'Help',
        expenseReport: 'Onkostennota',
        expenseReports: 'Declaraties',
        rateOutOfPolicy: 'Tarief buiten beleid',
        leaveWorkspace: 'Werkruimte verlaten',
        leaveWorkspaceConfirmation: 'Als je deze workspace verlaat, kun je er geen onkosten meer naartoe indienen.',
        leaveWorkspaceConfirmationAuditor: 'Als je deze workspace verlaat, kun je de rapporten en instellingen ervan niet meer bekijken.',
        leaveWorkspaceConfirmationAdmin: 'Als je deze workspace verlaat, kun je de instellingen ervan niet meer beheren.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Als je deze workspace verlaat, word je in de goedkeuringsworkflow vervangen door ${workspaceOwner}, de eigenaar van de workspace.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Als je deze workspace verlaat, word je als voorkeurs-exporteur vervangen door ${workspaceOwner}, de eigenaar van de workspace.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Als je deze workspace verlaat, word je als technisch contactpersoon vervangen door ${workspaceOwner}, de eigenaar van de workspace.`,
        leaveWorkspaceReimburser: 'Je kunt deze workspace niet verlaten als terugbetaler. Stel een nieuwe terugbetaler in via Workspaces > Betalingen doen of volgen en probeer het opnieuw.',
        reimbursable: 'Vergoedbaar',
        editYourProfile: 'Bewerk je profiel',
        comments: 'Opmerkingen',
        sharedIn: 'Gedeeld in',
        unreported: 'Niet gerapporteerd',
        explore: 'Verkennen',
        insights: 'Inzichten',
        todo: 'Takenlijst',
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
        copyToClipboard: 'Kopieer naar klembord',
        thisIsTakingLongerThanExpected: 'Dit duurt langer dan verwacht...',
        domains: 'Domeinen',
        actionRequired: 'Actie vereist',
        duplicate: 'Dupliceren',
        duplicated: 'Gedupliceerd',
        duplicateExpense: 'Dubbele uitgave',
        exchangeRate: 'Wisselkoers',
        reimbursableTotal: 'Totaal restitueerbaar',
        nonReimbursableTotal: 'Totaal niet-terugbetaalbaar',
        month: 'Maand',
        week: 'Week',
        year: 'Jaar',
        quarter: 'Kwartaal',
    },
    supportalNoAccess: {
        title: 'Niet zo snel',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `Je bent niet gemachtigd om deze actie uit te voeren wanneer de support is ingelogd (opdracht: ${command ?? ''}). Als je denkt dat Success deze actie moet kunnen uitvoeren, start dan een gesprek in Slack.`,
    },
    lockedAccount: {
        title: 'Geblokkeerde account',
        description: 'Je mag deze actie niet voltooien omdat dit account is vergrendeld. Neem contact op met concierge@expensify.com voor de volgende stappen.',
    },
    location: {
        useCurrent: 'Huidige locatie gebruiken',
        notFound: 'We konden je locatie niet vinden. Probeer het opnieuw of voer handmatig een adres in.',
        permissionDenied: 'Het lijkt erop dat je de toegang tot je locatie hebt geweigerd.',
        please: 'Alsjeblieft',
        allowPermission: 'locatietoegang toestaan in instellingen',
        tryAgain: 'en probeer het opnieuw.',
    },
    contact: {
        importContacts: 'Contacten importeren',
        importContactsTitle: 'Importeer je contacten',
        importContactsText: 'Importeer contacten van je telefoon zodat je favoriete mensen altijd binnen handbereik zijn.',
        importContactsExplanation: 'zodat je favoriete mensen altijd maar één tik van je verwijderd zijn.',
        importContactsNativeText: 'Nog één stap te gaan! Geef ons groen licht om je contacten te importeren.',
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
        takePhoto: 'Maak foto',
        chooseFromGallery: 'Kies uit galerij',
        chooseDocument: 'Bestand kiezen',
        attachmentTooLarge: 'Bijlage is te groot',
        sizeExceeded: 'De bijlage is groter dan de limiet van 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Bijlage is groter dan de limiet van ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Bijlage is te klein',
        sizeNotMet: 'Bijlagegrootte moet groter zijn dan 240 bytes',
        wrongFileType: 'Ongeldig bestandstype',
        notAllowedExtension: 'Dit bestandstype is niet toegestaan. Probeer een ander bestandstype.',
        folderNotAllowedMessage: 'Het uploaden van een map is niet toegestaan. Probeer een ander bestand.',
        protectedPDFNotSupported: 'Met wachtwoord beveiligde PDF wordt niet ondersteund',
        attachmentImageResized: 'Deze afbeelding is voor de voorbeeldweergave verkleind. Download de volledige resolutie.',
        attachmentImageTooLarge: 'Deze afbeelding is te groot om te bekijken voordat je deze uploadt.',
        tooManyFiles: (fileLimit: number) => `Je kunt maximaal ${fileLimit} bestanden tegelijk uploaden.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Bestanden overschrijden ${maxUploadSizeInMB} MB. Probeer het opnieuw.`,
        someFilesCantBeUploaded: 'Sommige bestanden kunnen niet worden geüpload',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Bestanden moeten kleiner zijn dan ${maxUploadSizeInMB} MB. Grotere bestanden worden niet geüpload.`,
        maxFileLimitExceeded: 'Je kunt maximaal 30 bonnen tegelijk uploaden. Extra bonnen worden niet geüpload.',
        unsupportedFileType: (fileType: string) => `${fileType}-bestanden worden niet ondersteund. Alleen ondersteunde bestandstypen worden geüpload.`,
        learnMoreAboutSupportedFiles: 'Meer informatie over ondersteunde indelingen.',
        passwordProtected: 'Met een wachtwoord beveiligde pdf’s worden niet ondersteund. Alleen ondersteunde bestanden worden geüpload.',
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
        description: 'Sleep, zoom en roteer je afbeelding zoals jij wilt.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Geen extensie gevonden voor mime-type',
        problemGettingImageYouPasted: 'Er is een probleem opgetreden bij het ophalen van de afbeelding die je hebt geplakt',
        commentExceededMaxLength: (formattedMaxLength: string) => `De maximale opmerkinglengte is ${formattedMaxLength} tekens.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `De maximale lengte van de taaknaam is ${formattedMaxLength} tekens.`,
    },
    baseUpdateAppModal: {
        updateApp: 'App bijwerken',
        updatePrompt: 'Er is een nieuwe versie van deze app beschikbaar.\nWerk nu bij of start de app later opnieuw om de nieuwste wijzigingen te downloaden.',
    },
    deeplinkWrapper: {
        launching: 'Expensify wordt gestart',
        expired: 'Je sessie is verlopen.',
        signIn: 'Meld je opnieuw aan.',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: 'Biometrische test',
            authenticationSuccessful: 'Authenticatie geslaagd',
            successfullyAuthenticatedUsing: ({authType}: MultifactorAuthenticationTranslationParams) => `Je bent succesvol geauthenticeerd met ${authType}.`,
            troubleshootBiometricsStatus: ({registered}: MultifactorAuthenticationTranslationParams) => `Biometrie (${registered ? 'Geregistreerd' : 'Niet geregistreerd'})`,
            yourAttemptWasUnsuccessful: 'Je aanmeldingspoging is mislukt.',
            youCouldNotBeAuthenticated: 'Je kon niet worden geverifieerd',
            areYouSureToReject: 'Weet je het zeker? De authenticatiepoging wordt geweigerd als je dit scherm sluit.',
            rejectAuthentication: 'Verificatie weigeren',
            test: 'Test',
            biometricsAuthentication: 'Biometrische verificatie',
        },
        pleaseEnableInSystemSettings: {
            start: 'Schakel gezichts-/vingerafdrukverificatie in of stel een toegangscode voor het apparaat in je',
            link: 'systeeminstellingen',
            end: '.',
        },
        oops: 'Oeps, er ging iets mis',
        looksLikeYouRanOutOfTime: 'Het lijkt erop dat je tijd op is! Probeer het opnieuw bij de handelaar.',
        youRanOutOfTime: 'Je tijd is op',
        letsVerifyItsYou: 'Laten we verifiëren dat jij het bent',
        verifyYourself: {
            biometrics: 'Verifieer jezelf met je gezicht of vingerafdruk',
        },
        enableQuickVerification: {
            biometrics: 'Schakel snelle, veilige verificatie in met je gezicht of vingerafdruk. Geen wachtwoorden of codes nodig.',
        },
        revoke: {
            remove: 'Verwijderen',
            title: 'Gezichts-/vingerafdrukherkenning en passkeys',
            explanation:
                'Gezichts-/vingerafdruk- of passkeys-verificatie is ingeschakeld op één of meer apparaten. Toegang intrekken betekent dat bij de volgende verificatie op elk apparaat een magische code nodig is.',
            confirmationPrompt: 'Weet je het zeker? Je hebt een magische code nodig voor de volgende verificatie op elk apparaat.',
            cta: 'Toegang intrekken',
            noDevices: 'Je hebt geen apparaten geregistreerd voor gezichts-/vingerafdruk- of passkey-verificatie. Als je er een registreert, kun je die toegang hier intrekken.',
            dismiss: 'Begrepen',
            error: 'Aanvraag mislukt. Probeer het later opnieuw.',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abracadabra,
            je bent ingelogd!
        `),
        successfulSignInDescription: 'Ga terug naar je oorspronkelijke tabblad om verder te gaan.',
        title: 'Hier is je magische code',
        description: dedent(`
            Voer de code in van het apparaat  
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
            Tweefactorauthenticatie
            vereist
        `),
        tfaRequiredDescription: dedent(`
            Voer de tweestapsverificatiecode in
            op de plaats waar je probeert in te loggen.
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
        description: 'Je bedrijf heeft een aangepaste goedkeuringsworkflow in deze workspace. Voer deze actie uit in Expensify Classic',
        goToExpensifyClassic: 'Overschakelen naar Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Dien een onkostendeclaratie in, nodig je team uit',
            subtitleText: 'Wil je dat jouw team Expensify ook gebruikt? Dien gewoon een onkostendeclaratie bij hen in en wij regelen de rest.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Plan een gesprek',
    },
    hello: 'Hallo',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Ga hieronder aan de slag.',
        anotherLoginPageIsOpen: 'Er is een andere inlogpagina geopend.',
        anotherLoginPageIsOpenExplanation: 'Je hebt de inlogpagina in een apart tabblad geopend. Log daar in.',
        welcome: 'Welkom!',
        welcomeWithoutExclamation: 'Welkom',
        phrase2: 'Geld spreekt. En nu chat en betalingen op één plek staan, is het ook nog eens makkelijk.',
        phrase3: 'Je ontvangt je betalingen net zo snel als je je punt kunt maken.',
        enterPassword: 'Voer uw wachtwoord in',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, het is altijd leuk om een nieuw gezicht hier te zien!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Voer de magische code in die is verzonden naar ${login}. Deze zou binnen een tot twee minuten moeten aankomen.`,
    },
    login: {
        hero: {
            header: 'Reizen en declaraties, met de snelheid van chat',
            body: 'Welkom bij de volgende generatie van Expensify, waar je reizen en uitgaven sneller verlopen met behulp van contextuele realtimechat.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Ga door met inloggen via single sign-on:',
        orContinueWithMagicCode: 'Je kunt ook inloggen met een magische code',
        useSingleSignOn: 'Eenmalige aanmelding gebruiken',
        useMagicCode: 'Magische code gebruiken',
        launching: 'Opstarten...',
        oneMoment: 'Een moment terwijl we je doorsturen naar het single sign-on portaal van je bedrijf.',
    },
    reportActionCompose: {
        dropToUpload: 'Sleep neer om te uploaden',
        sendAttachment: 'Bijlage verzenden',
        addAttachment: 'Bijlage toevoegen',
        writeSomething: 'Iets schrijven...',
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
        copyEmailToClipboard: 'E-mailadres naar klembord kopiëren',
        markAsUnread: 'Markeren als ongelezen',
        markAsRead: 'Markeren als gelezen',
        editAction: ({action}: EditActionParams) => `Bewerk ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'uitgave' : 'reactie'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'reactie';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `${type} verwijderen`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'reactie';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Weet je zeker dat je deze ${type} wilt verwijderen?`;
        },
        onlyVisible: 'Alleen zichtbaar voor',
        explain: 'Leg uit',
        explainMessage: 'Leg het me alsjeblieft uit.',
        replyInThread: 'Antwoord in thread',
        joinThread: 'Deelnemen aan gesprek',
        leaveThread: 'Thread verlaten',
        copyOnyxData: 'Onyx-gegevens kopiëren',
        flagAsOffensive: 'Markeren als beledigend',
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
            `Deze chat is met alle Expensify-leden op het domein <strong>${domainRoom}</strong>. Gebruik hem om te chatten met collega’s, tips te delen en vragen te stellen.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Deze chat is met de beheerder van <strong>${workspaceName}</strong>. Gebruik deze chat om te praten over de inrichting van de workspace en meer.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `Deze chat is met iedereen in <strong>${workspaceName}</strong>. Gebruik hem voor de belangrijkste aankondigingen.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Deze chatruimte is voor alles wat met <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> te maken heeft.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Deze chat is voor facturen tussen <strong>${invoicePayer}</strong> en <strong>${invoiceReceiver}</strong>. Gebruik de knop + om een factuur te verzenden.`,
        beginningOfChatHistory: (users: string) => `Deze chat is met ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `Hier kan <strong>${submitterDisplayName}</strong> onkosten indienen bij <strong>${workspaceName}</strong>. Gebruik gewoon de +-knop.`,
        beginningOfChatHistorySelfDM: 'Dit is je persoonlijke ruimte. Gebruik het voor notities, taken, concepten en herinneringen.',
        beginningOfChatHistorySystemDM: 'Welkom! Laten we je instellen.',
        chatWithAccountManager: 'Chat hier met je accountmanager',
        askMeAnything: 'Vraag mij alles!',
        sayHello: 'Zeg hallo!',
        yourSpace: 'Jouw ruimte',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Welkom bij ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Gebruik de knop + om een uitgave te ${additionalText}.`,
        askConcierge: 'Stel vragen en krijg 24/7 realtime ondersteuning.',
        conciergeSupport: '24/7-ondersteuning',
        create: 'maken',
        iouTypes: {
            pay: 'betalen',
            split: 'opsplitsen',
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
            `heeft dit rapport gemaakt voor alle vastgehouden uitgaven van <a href="${reportUrl}">${reportName}</a>`,
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
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `Deze chat is niet meer actief omdat ${displayName} zijn of haar account heeft gesloten.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Deze chat is niet meer actief omdat ${oldDisplayName} het account heeft samengevoegd met ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Deze chat is niet meer actief omdat <strong>jij</strong> geen lid meer bent van de ${policyName}-werkruimte.`
                : `Deze chat is niet langer actief omdat ${displayName} geen lid meer is van de ${policyName}-werkruimte.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Deze chat is niet meer actief omdat ${policyName} geen actieve workspace meer is.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Deze chat is niet meer actief omdat ${policyName} geen actieve workspace meer is.`,
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
        draftedMessage: 'Conceptversie bericht',
        listOfChatMessages: 'Lijst met chatberichten',
        listOfChats: 'Lijst met chats',
        saveTheWorld: 'Red de wereld',
        tooltip: 'Begin hier!',
        redirectToExpensifyClassicModal: {
            title: 'Binnenkort beschikbaar',
            description: 'We zijn nog een paar dingen in New Expensify aan het verfijnen om het op jouw specifieke instellingen af te stemmen. Ga in de tussentijd naar Expensify Classic.',
        },
    },
    homePage: {
        forYou: 'Voor jou',
        timeSensitiveSection: {
            title: 'Tijdsgevoelig',
            cta: 'Declaratie',
            offer50off: {
                title: 'Krijg 50% korting op je eerste jaar!',
                subtitle: ({formattedTime}: {formattedTime: string}) => `nog ${formattedTime} resterend`,
            },
            offer25off: {
                title: 'Krijg 25% korting op je eerste jaar!',
                subtitle: ({days}: {days: number}) => `Nog ${days} ${days === 1 ? 'dag' : 'dagen'} resterend`,
            },
            addShippingAddress: {
                title: 'We hebben je verzendadres nodig',
                subtitle: 'Geef een adres op om je Expensify Card te ontvangen.',
                cta: 'Adres toevoegen',
            },
            activateCard: {
                title: 'Activeer je Expensify Card',
                subtitle: 'Valideer je kaart en begin met uitgeven.',
                cta: 'Activeren',
            },
        },
        announcements: 'Aankondigingen',
        discoverSection: {
            title: 'Ontdekken',
            menuItemTitleNonAdmin: 'Leer hoe je onkosten aanmaakt en rapporten indient.',
            menuItemTitleAdmin: 'Lees hoe je leden uitnodigt, goedkeuringsworkflows bewerkt en bedrijfskaarten afstemt.',
            menuItemDescription: 'Ontdek wat Expensify in 2 min kan doen',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `Verzend ${count} ${count === 1 ? 'rapport' : 'rapporten'}`,
            approve: ({count}: {count: number}) => `Keur ${count} ${count === 1 ? 'rapport' : 'rapporten'} goed`,
            pay: ({count}: {count: number}) => `Betaal ${count} ${count === 1 ? 'rapport' : 'rapporten'}`,
            export: ({count}: {count: number}) => `Exporteer ${count} ${count === 1 ? 'rapport' : 'rapporten'}`,
            begin: 'Begin',
            emptyStateMessages: {
                nicelyDone: 'Mooi gedaan',
                keepAnEyeOut: 'Houd in de gaten wat er binnenkort komt!',
                allCaughtUp: 'Je bent helemaal bij',
                upcomingTodos: 'Toekomstige taken verschijnen hier.',
            },
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
        manual: 'Handmatig',
        scan: 'Scannen',
        map: 'Kaart',
        gps: 'GPS',
        odometer: 'Kilometerstand',
    },
    spreadsheet: {
        upload: 'Een spreadsheet uploaden',
        import: 'Spreadsheet importeren',
        dragAndDrop: '<muted-link>Sleep je spreadsheet hier naartoe of kies hieronder een bestand. Ondersteunde indelingen: .csv, .txt, .xls en .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Sleep je spreadsheet hierheen, of kies hieronder een bestand. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Meer informatie</a> over ondersteunde bestandsindelingen.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Selecteer een spreadsheetbestand om te importeren. Ondersteunde formaten: .csv, .txt, .xls en .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Selecteer een spreadsheetbestand om te importeren. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Kom meer te weten</a> over ondersteunde bestandsindelingen.</muted-link>`,
        fileContainsHeader: 'Bestand bevat kolomkoppen',
        column: (name: string) => `Kolom ${name}`,
        fieldNotMapped: (fieldName: string) => `Oeps! Een verplicht veld (“${fieldName}”) is niet toegewezen. Controleer het en probeer het opnieuw.`,
        singleFieldMultipleColumns: (fieldName: string) => `Oeps! Je hebt één veld (‘${fieldName}’) aan meerdere kolommen gekoppeld. Controleer dit en probeer het opnieuw.`,
        emptyMappedField: (fieldName: string) => `Oeps! Het veld ("${fieldName}") bevat één of meer lege waarden. Controleer het en probeer het opnieuw.`,
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
            return added > 1 ? `${added} leden zijn toegevoegd.` : '1 lid is toegevoegd.';
        },
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `${tags} tags zijn toegevoegd.` : '1 label is toegevoegd.'),
        importMultiLevelTagsSuccessfulDescription: 'Tags met meerdere niveaus zijn toegevoegd.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `${rates} dagvergoedingen zijn toegevoegd.` : '1 dagvergoedingstarief is toegevoegd.'),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `${transactions} transacties zijn geïmporteerd.` : '1 transactie is geïmporteerd.',
        importFailedTitle: 'Import is mislukt',
        importFailedDescription: 'Zorg ervoor dat alle velden correct zijn ingevuld en probeer het opnieuw. Als het probleem blijft bestaan, neem dan contact op met Concierge.',
        importDescription: 'Kies welke velden je wilt koppelen vanuit je spreadsheet door op de vervolgkeuzelijst naast elke geïmporteerde kolom hieronder te klikken.',
        sizeNotMet: 'Bestandsgrootte moet groter zijn dan 0 bytes',
        invalidFileMessage:
            'Het bestand dat je hebt geüpload is leeg of bevat ongeldige gegevens. Zorg ervoor dat het bestand correct is opgemaakt en de benodigde informatie bevat voordat je het opnieuw uploadt.',
        importSpreadsheetLibraryError: 'Laden van spreadsheetmodule mislukt. Controleer je internetverbinding en probeer het opnieuw.',
        importSpreadsheet: 'Spreadsheet importeren',
        downloadCSV: 'CSV downloaden',
        importMemberConfirmation: () => ({
            one: `Bevestig hieronder de gegevens voor een nieuw werkruimtelid dat als onderdeel van deze upload zal worden toegevoegd. Bestaande leden ontvangen geen rolwijzigingen of uitnodigingsberichten.`,
            other: (count: number) =>
                `Bevestig hieronder de gegevens voor de ${count} nieuwe werkruimtedeelnemers die als onderdeel van deze upload worden toegevoegd. Bestaande deelnemers ontvangen geen rolwijzigingen of uitnodigingsberichten.`,
        }),
    },
    receipt: {
        upload: 'Bon uploaden',
        uploadMultiple: 'Bonnen uploaden',
        desktopSubtitleSingle: `of sleep hier naartoe slepen`,
        desktopSubtitleMultiple: `of sleep ze hier naartoe`,
        alternativeMethodsTitle: 'Andere manieren om bonnen toe te voegen:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">Download de app</a> om te scannen vanaf je telefoon</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Stuur bonnetjes door naar <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Voeg je nummer toe</a> om bonnen te sms'en naar ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Stuur bonnetjes via sms naar ${phoneNumber} (alleen Amerikaanse nummers)</label-text>`,
        takePhoto: 'Maak een foto',
        cameraAccess: 'Cameratoegang is vereist om foto’s van bonnetjes te maken.',
        deniedCameraAccess: `Cameratoegang is nog steeds niet verleend, volg alstublieft <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">deze instructies</a>.`,
        cameraErrorTitle: 'Camerafout',
        cameraErrorMessage: 'Er is een fout opgetreden tijdens het maken van een foto. Probeer het opnieuw.',
        locationAccessTitle: 'Locatietoegang toestaan',
        locationAccessMessage: 'Locatietoegang helpt ons om je tijdzone en valuta overal waar je gaat nauwkeurig te houden.',
        locationErrorTitle: 'Locatietoegang toestaan',
        locationErrorMessage: 'Locatietoegang helpt ons om je tijdzone en valuta overal waar je gaat nauwkeurig te houden.',
        allowLocationFromSetting: `Locatietoegang helpt ons om je tijdzone en valuta overal waar je bent nauwkeurig te houden. Sta locatietoegang toe in de machtigingsinstellingen van je apparaat.`,
        dropTitle: 'Laat het los',
        dropMessage: 'Zet je bestand hier neer',
        flash: 'flitsen',
        multiScan: 'meervoudig scannen',
        shutter: 'sluiter',
        gallery: 'gallerij',
        deleteReceipt: 'Bon verwijderen',
        deleteConfirmation: 'Weet je zeker dat je deze bon wilt verwijderen?',
        addReceipt: 'Bon toevoegen',
        scanFailed: 'De bon kon niet worden gescand omdat er een handelaar, datum of bedrag ontbreekt.',
        addAReceipt: {
            phrase1: 'Bon toevoegen',
            phrase2: 'of sleep hierheenof sleep hier naartoe',
        },
    },
    quickAction: {
        scanReceipt: 'Bon scannen',
        recordDistance: 'Afstand bijhouden',
        requestMoney: 'Uitgave aanmaken',
        perDiem: 'Dagvergoeding aanmaken',
        splitBill: 'Uitgave splitsen',
        splitScan: 'Bon delen',
        splitDistance: 'Afstand splitsen',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Betaal ${name ?? 'iemand'}`,
        assignTask: 'Taak toewijzen',
        header: 'Snelle actie',
        noLongerHaveReportAccess: 'Je hebt geen toegang meer tot je vorige bestemming voor snelle acties. Kies hieronder een nieuwe.',
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
        splitDates: 'Datums splitsen',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} tot ${endDate} (${count} dagen)`,
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} van ${merchant}`,
        splitByPercentage: 'Opsplitsen op percentage',
        splitByDate: 'Splitsen op datum',
        addSplit: 'Splits toevoegen',
        makeSplitsEven: 'Splits gelijk verdelen',
        editSplits: 'Splits bewerken',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Het totale bedrag is ${amount} hoger dan de oorspronkelijke uitgave.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Het totale bedrag is ${amount} lager dan de oorspronkelijke uitgave.`,
        splitExpenseZeroAmount: 'Voer een geldig bedrag in voordat je doorgaat.',
        splitExpenseOneMoreSplit: 'Geen splitsingen toegevoegd. Voeg er minstens één toe om op te slaan.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Bewerk ${amount} voor ${merchant}`,
        removeSplit: 'Splits verwijderen',
        splitExpenseCannotBeEditedModalTitle: 'Deze uitgave kan niet worden bewerkt',
        splitExpenseCannotBeEditedModalDescription: 'Goedgekeurde of betaalde uitgaven kunnen niet worden bewerkt',
        splitExpenseDistanceErrorModalDescription: 'Los het foutieve kilometertarief op en probeer het opnieuw.',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Betaal ${name ?? 'iemand'}`,
        expense: 'Declaratie',
        categorize: 'Categoriseren',
        share: 'Delen',
        participants: 'Deelnemers',
        createExpense: 'Uitgave aanmaken',
        trackDistance: 'Afstand bijhouden',
        createExpenses: (expensesNumber: number) => `Maak ${expensesNumber} uitgaven`,
        removeExpense: 'Uitgave verwijderen',
        removeThisExpense: 'Deze uitgave verwijderen',
        removeExpenseConfirmation: 'Weet je zeker dat je deze bon wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
        addExpense: 'Uitgave toevoegen',
        chooseRecipient: 'Kies ontvanger',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Maak uitgave van ${amount}`,
        confirmDetails: 'Bevestig gegevens',
        pay: 'Betalen',
        cancelPayment: 'Betaling annuleren',
        cancelPaymentConfirmation: 'Weet je zeker dat je deze betaling wilt annuleren?',
        viewDetails: 'Details bekijken',
        pending: 'In behandeling',
        canceled: 'Geannuleerd',
        posted: 'Gepost',
        deleteReceipt: 'Bon verwijderen',
        findExpense: 'Uitgave zoeken',
        deletedTransaction: (amount: string, merchant: string) => `heeft een uitgave verwijderd (${amount} voor ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `heeft een uitgave verplaatst${reportName ? `van ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `heeft deze uitgave verplaatst${reportName ? `naar <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `heeft deze uitgave verplaatst${reportName ? `van <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `heeft deze uitgave verplaatst naar je <a href="${reportUrl}">persoonlijke ruimte</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `heeft dit rapport verplaatst naar de workspace <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `heeft dit <a href="${movedReportUrl}">rapport</a> verplaatst naar de werkruimte <a href="${newParentReportUrl}">${toPolicyName}</a>`;
        },
        pendingMatchWithCreditCard: 'Bon wordt gekoppeld aan kaarttransactie',
        pendingMatch: 'Openstaande match',
        pendingMatchWithCreditCardDescription: 'Bon in afwachting van koppeling met kaarttransactie. Markeer als contant om te annuleren.',
        markAsCash: 'Markeren als contant',
        routePending: 'Routeren in behandeling...',
        receiptScanning: () => ({
            one: 'Bon wordt gescand...',
            other: 'Bonnetjes scannen...',
        }),
        scanMultipleReceipts: 'Meerdere bonnen scannen',
        scanMultipleReceiptsDescription: 'Maak in één keer foto’s van al je bonnetjes en bevestig daarna zelf de details, of laat ons dat voor je doen.',
        receiptScanInProgress: 'Bonnetjescan wordt uitgevoerd',
        receiptScanInProgressDescription: 'Bonnetje wordt gescand. Kom later terug of voer de gegevens nu in.',
        removeFromReport: 'Van rapport verwijderen',
        moveToPersonalSpace: 'Verplaats uitgaven naar je persoonlijke ruimte',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Mogelijke dubbele uitgaven gevonden. Controleer de duplicaten om indienen mogelijk te maken.'
                : 'Mogelijke dubbele onkosten gevonden. Controleer de dubbelen om goedkeuring in te schakelen.',
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
        receiptScanningFailed: 'Bon scannen mislukt. Voer de gegevens handmatig in.',
        transactionPendingDescription: 'Transactie in behandeling. Het kan een paar dagen duren voordat deze is geboekt.',
        companyInfo: 'Bedrijfsgegevens',
        companyInfoDescription: 'We hebben nog een paar gegevens nodig voordat je je eerste factuur kunt versturen.',
        yourCompanyName: 'Naam van je bedrijf',
        yourCompanyWebsite: 'De website van je bedrijf',
        yourCompanyWebsiteNote: 'Als je geen website hebt, kun je in plaats daarvan de LinkedIn- of socialmediapagina van je bedrijf opgeven.',
        invalidDomainError: 'Je hebt een ongeldig domein ingevoerd. Voer om verder te gaan een geldig domein in.',
        publicDomainError: 'Je hebt een openbaar domein ingevoerd. Voer een privédomein in om door te gaan.',
        expenseCount: () => {
            return {
                one: '1 uitgave',
                other: (count: number) => `${count} uitgaven`,
            };
        },
        deleteExpense: () => ({
            one: 'Declaratie verwijderen',
            other: 'Declaraties verwijderen',
        }),
        deleteConfirmation: () => ({
            one: 'Weet je zeker dat je deze uitgave wilt verwijderen?',
            other: 'Weet je zeker dat je deze onkostendeclaraties wilt verwijderen?',
        }),
        deleteReport: 'Rapport verwijderen',
        deleteReportConfirmation: 'Weet je zeker dat je dit rapport wilt verwijderen?',
        settledExpensify: 'Betaald',
        done: 'Gereed',
        settledElsewhere: 'Elders betaald',
        individual: 'Persoonlijk',
        business: 'Zakelijk',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Betaal ${formattedAmount} met Expensify` : `Betalen met Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Betaal ${formattedAmount} als individu` : `Betalen met persoonlijke rekening`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Betaal ${formattedAmount} met wallet` : `Betalen met wallet`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Betaal ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Betaal ${formattedAmount} als bedrijf` : `Betalen met zakelijke rekening`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Markeer ${formattedAmount} als betaald` : `Markeren als betaald`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `heeft ${amount} betaald met persoonlijke rekening ${last4Digits}` : `Betaald met persoonlijke rekening`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `heeft ${amount} betaald met zakelijke rekening ${last4Digits}` : `Betaald met zakelijke rekening`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Betaal ${formattedAmount} via ${policyName}` : `Betaal via ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `heeft ${amount} betaald met bankrekening ${last4Digits}` : `betaald met bankrekening ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `betaald ${amount ? `${amount} ` : ''} met bankrekening ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimteregels</a>`,
        invoicePersonalBank: (lastFour: string) => `Persoonlijke rekening • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Zakelijke rekening • ${lastFour}`,
        nextStep: 'Volgende stappen',
        finished: 'Voltooid',
        flip: 'Draai om',
        sendInvoice: ({amount}: RequestAmountParams) => `Verstuur factuur van ${amount}`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `voor ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `ingediend${memo ? `, met de notitie ${memo}` : ''}`,
        automaticallySubmitted: `ingediend via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">indienen uitstellen</a>`,
        queuedToSubmitViaDEW: 'in de wachtrij om te verzenden via aangepaste goedkeuringsworkflow',
        queuedToApproveViaDEW: 'in de wachtrij gezet voor goedkeuring via aangepaste goedkeuringsworkflow',
        trackedAmount: (formattedAmount: string, comment?: string) => `traceren ${formattedAmount}${comment ? `voor ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `splitsen ${amount}`,
        didSplitAmount: (formattedAmount: string, comment: string) => `splitsen ${formattedAmount}${comment ? `voor ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Jouw deel ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} is ${amount}${comment ? `voor ${comment}` : ''} verschuldigd`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} is verschuldigd:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}betaalde ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} heeft betaald:`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} heeft ${amount} uitgegeven`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} heeft uitgegeven:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} heeft goedgekeurd:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} heeft ${amount} goedgekeurd`,
        payerSettled: (amount: number | string) => `${amount} betaald`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `heeft ${amount} betaald. Voeg een bankrekening toe om je betaling te ontvangen.`,
        automaticallyApproved: `goedgekeurd via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimteregels</a>`,
        approvedAmount: (amount: number | string) => `goedgekeurd: ${amount}`,
        approvedMessage: `goedgekeurd`,
        unapproved: `niet-goedgekeurd`,
        automaticallyForwarded: `goedgekeurd via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimteregels</a>`,
        forwarded: `goedgekeurd`,
        rejectedThisReport: 'heeft dit rapport afgewezen',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `is met de betaling begonnen, maar wacht tot ${submitterDisplayName} een bankrekening toevoegt.`,
        adminCanceledRequest: 'betaling geannuleerd',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `heeft de betaling van ${amount} geannuleerd, omdat ${submitterDisplayName} hun Expensify Wallet niet binnen 30 dagen heeft geactiveerd`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} heeft een bankrekening toegevoegd. De betaling van ${amount} is gedaan.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}gemarkeerd als betaald${comment ? `, met de opmerking: "${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}betaald met wallet`,
        automaticallyPaidWithExpensify: (payer?: string) =>
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
            `heeft ${translatedChangedField} gewijzigd in ${newMerchant} (voorheen ${oldMerchant}), waardoor het bedrag is aangepast naar ${newAmountToDisplay} (voorheen ${oldAmountToDisplay})`,
        basedOnAI: 'op basis van eerdere activiteiten',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `op basis van de <a href="${rulesLink}">werkruimte­regels</a>` : 'gebaseerd op werkruimteregel'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `voor ${comment}` : 'uitgave'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Factuurrapport nr. ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} verzonden${comment ? `voor ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `heeft uitgave verplaatst van persoonlijke ruimte naar ${workspaceName ?? `chatten met ${reportName}`}`,
        movedToPersonalSpace: 'uitgave verplaatst naar persoonlijke ruimte',
        error: {
            invalidCategoryLength: 'De categorienaam bevat meer dan 255 tekens. Verkort deze of kies een andere categorie.',
            invalidTagLength: 'De tagnaam overschrijdt 255 tekens. Verkort deze of kies een andere tag.',
            invalidAmount: 'Voer een geldig bedrag in voordat je verdergaat',
            invalidDistance: 'Voer een geldige afstand in voordat je doorgaat',
            invalidReadings: 'Voer zowel de begin- als eindstanden in',
            negativeDistanceNotAllowed: 'Eindstand moet hoger zijn dan beginstand',
            invalidIntegerAmount: 'Voer een geheel bedrag in dollars in voordat je verdergaat',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Maximaal belastingbedrag is ${amount}`,
            invalidSplit: 'De som van de splitsingen moet gelijk zijn aan het totaalbedrag',
            invalidSplitParticipants: 'Voer een bedrag groter dan nul in voor ten minste twee deelnemers',
            invalidSplitYourself: 'Voer een bedrag ongelijk aan nul in voor je splitsing',
            noParticipantSelected: 'Selecteer een deelnemer',
            other: 'Onverwachte fout. Probeer het later opnieuw.',
            genericCreateFailureMessage: 'Onverwachte fout bij het indienen van deze uitgave. Probeer het later opnieuw.',
            genericCreateInvoiceFailureMessage: 'Onverwachte fout bij het verzenden van deze factuur. Probeer het later opnieuw.',
            genericHoldExpenseFailureMessage: 'Onverwachte fout bij het vasthouden van deze uitgave. Probeer het later opnieuw.',
            genericUnholdExpenseFailureMessage: 'Onverwachte fout bij het verwijderen van deze onkost van de wachtlijst. Probeer het later opnieuw.',
            receiptDeleteFailureError: 'Onverwachte fout bij het verwijderen van deze bon. Probeer het later opnieuw.',
            receiptFailureMessage: '<rbr>Er is een fout opgetreden bij het uploaden van je bon. <a href="download">Sla de bon op</a> en <a href="retry">probeer het later opnieuw</a>.</rbr>',
            receiptFailureMessageShort: 'Er is een fout opgetreden bij het uploaden van je bon.',
            genericDeleteFailureMessage: 'Onverwachte fout bij het verwijderen van deze uitgave. Probeer het later opnieuw.',
            genericEditFailureMessage: 'Onverwachte fout bij het bewerken van deze uitgave. Probeer het later opnieuw.',
            genericSmartscanFailureMessage: 'Transactie mist velden',
            duplicateWaypointsErrorMessage: 'Verwijder dubbele waypoints',
            atLeastTwoDifferentWaypoints: 'Voer minstens twee verschillende adressen in',
            splitExpenseMultipleParticipantsErrorMessage: 'Een uitgave kan niet worden opgesplitst tussen een werkruimte en andere leden. Werk je selectie bij.',
            invalidMerchant: 'Voer een geldige handelaar in',
            atLeastOneAttendee: 'Er moet minstens één deelnemer worden geselecteerd',
            invalidQuantity: 'Voer een geldige hoeveelheid in',
            quantityGreaterThanZero: 'Hoeveelheid moet groter zijn dan nul',
            invalidSubrateLength: 'Er moet ten minste één subtarief zijn',
            invalidRate: 'Tarief niet geldig voor deze workspace. Selecteer een beschikbaar tarief uit de workspace.',
            endDateBeforeStartDate: 'De einddatum kan niet vóór de startdatum liggen',
            endDateSameAsStartDate: 'De einddatum mag niet hetzelfde zijn als de startdatum',
            manySplitsProvided: `Het maximale aantal toegestane splits is ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `Het datumbereik mag ${CONST.IOU.SPLITS_LIMIT} dagen niet overschrijden.`,
        },
        dismissReceiptError: 'Foutmelding sluiten',
        dismissReceiptErrorConfirmation: 'Let op! Als je deze foutmelding negeert, wordt je geüploade bon volledig verwijderd. Weet je het zeker?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `is begonnen met vereffenen. De betaling wordt vastgehouden totdat ${submitterDisplayName} hun wallet inschakelt.`,
        enableWallet: 'Wallet inschakelen',
        hold: 'Vasthouden',
        unhold: 'Blokkering opheffen',
        holdExpense: () => ({
            one: 'Onkosten vasthouden',
            other: 'Declaraties vasthouden',
        }),
        unholdExpense: 'Kosten blokkering opheffen',
        heldExpense: 'heeft deze uitgave vastgehouden',
        unheldExpense: 'heeft deze uitgave vrijgegeven',
        moveUnreportedExpense: 'Niet-gerapporteerde uitgave verplaatsen',
        addUnreportedExpense: 'Niet-gerapporteerde uitgave toevoegen',
        selectUnreportedExpense: 'Selecteer minimaal één uitgave om aan het rapport toe te voegen.',
        emptyStateUnreportedExpenseTitle: 'Geen niet-gerapporteerde uitgaven',
        emptyStateUnreportedExpenseSubtitle: 'Het lijkt erop dat je geen niet-gerapporteerde uitgaven hebt. Probeer er hieronder een aan te maken.',
        addUnreportedExpenseConfirm: 'Toevoegen aan rapport',
        newReport: 'Nieuw rapport',
        explainHold: () => ({
            one: 'Leg uit waarom je deze uitgave vasthoudt.',
            other: 'Leg uit waarom je deze uitgaven aanhoudt.',
        }),
        retracted: 'ingetrokken',
        retract: 'Intrekken',
        reopened: 'heropend',
        reopenReport: 'Rapport heropenen',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Dit rapport is al geëxporteerd naar ${connectionName}. Als u het wijzigt, kan dat leiden tot verschillen in de gegevens. Weet u zeker dat u dit rapport opnieuw wilt openen?`,
        reason: 'Reden',
        holdReasonRequired: 'Een reden is vereist bij het inhouden.',
        expenseWasPutOnHold: 'Uitgave is gepauzeerd',
        expenseOnHold: 'Deze uitgave is gepauzeerd. Bekijk de opmerkingen voor de volgende stappen.',
        expensesOnHold: 'Alle declaraties zijn gepauzeerd. Bekijk de opmerkingen voor de volgende stappen.',
        expenseDuplicate: 'Deze uitgave heeft vergelijkbare details als een andere. Controleer de dubbelen om door te gaan.',
        someDuplicatesArePaid: 'Sommige van deze duplicaten zijn al goedgekeurd of betaald.',
        reviewDuplicates: 'Dubbele items beoordelen',
        keepAll: 'Alles behouden',
        confirmApprove: 'Bevestig goedkeuringsbedrag',
        confirmApprovalAmount: 'Keur alleen conforme uitgaven goed, of keur het volledige rapport goed.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Deze uitgave staat in de wacht. Wil je toch goedkeuren?',
            other: 'Deze declaraties zijn gepauzeerd. Wil je ze toch goedkeuren?',
        }),
        confirmPay: 'Bevestig betalingsbedrag',
        confirmPayAmount: 'Betaal wat niet in de wacht staat, of betaal het volledige rapport.',
        confirmPayAllHoldAmount: () => ({
            one: 'Deze uitgave staat in de wacht. Wil je toch betalen?',
            other: 'Deze declaraties staan in de wacht. Wil je toch betalen?',
        }),
        payOnly: 'Alleen betalen',
        approveOnly: 'Alleen goedkeuren',
        holdEducationalTitle: 'Moet je deze uitgave aanhouden?',
        whatIsHoldExplain: 'Pauzeren is alsof je op ‘pauze’ drukt voor een uitgave totdat je klaar bent om die in te dienen.',
        holdIsLeftBehind: 'Vastgehouden uitgaven blijven achter, zelfs als je een volledig rapport indient.',
        unholdWhenReady: 'Haal de blokkering van uitgaven af wanneer je klaar bent om ze in te dienen.',
        changePolicyEducational: {
            title: 'Je hebt dit rapport verplaatst!',
            description: 'Controleer deze items goed; ze veranderen vaak wanneer je rapporten naar een nieuwe workspace verplaatst.',
            reCategorize: '<strong>Categoriseer alle uitgaven opnieuw</strong> om aan de werkruimteregels te voldoen.',
            workflows: 'Dit rapport kan nu onderworpen zijn aan een andere <strong>goedkeuringsworkflow.</strong>',
        },
        changeWorkspace: 'Werkruimte wijzigen',
        set: 'instellen',
        changed: 'gewijzigd',
        removed: 'verwijderd',
        transactionPending: 'Transactie in behandeling.',
        chooseARate: 'Selecteer een werkruimtetarief per mijl of kilometer voor terugbetaling',
        unapprove: 'Afkeuren',
        unapproveReport: 'Goedkeuring rapport intrekken',
        headsUp: 'Let op!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Dit rapport is al geëxporteerd naar ${accountingIntegration}. Het wijzigen ervan kan leiden tot gegevensverschillen. Weet je zeker dat je de goedkeuring van dit rapport wilt intrekken?`,
        reimbursable: 'declareerbaar',
        nonReimbursable: 'niet-vergoedbaar',
        bookingPending: 'Deze boeking is in behandeling',
        bookingPendingDescription: 'Deze boeking is in behandeling omdat deze nog niet is betaald.',
        bookingArchived: 'Deze boeking is gearchiveerd',
        bookingArchivedDescription: 'Deze boeking is gearchiveerd omdat de reisdatum is verstreken. Voeg indien nodig een uitgave toe voor het definitieve bedrag.',
        attendees: 'Deelnemers',
        whoIsYourAccountant: 'Wie is jouw accountant?',
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
        submitsTo: ({name}: SubmitsToParams) => `Stuurt naar ${name}`,
        reject: {
            educationalTitle: 'Moet je vasthouden of afwijzen?',
            educationalText: 'Als je nog niet klaar bent om een uitgave goed te keuren of te betalen, kun je deze vasthouden of afwijzen.',
            holdExpenseTitle: 'Houd een uitgave vast om om meer details te vragen vóór goedkeuring of betaling.',
            approveExpenseTitle: 'Keur andere onkosten goed terwijl aangehouden onkosten aan jou toegewezen blijven.',
            heldExpenseLeftBehindTitle: 'Ingehouden uitgaven blijven achter wanneer je een volledig rapport goedkeurt.',
            rejectExpenseTitle: 'Wijs een uitgave af die je niet wilt goedkeuren of betalen.',
            reasonPageTitle: 'Declaratie afkeuren',
            reasonPageDescription: 'Leg uit waarom je deze uitgave afwijst.',
            rejectReason: 'Reden van afwijzing',
            markAsResolved: 'Markeren als opgelost',
            rejectedStatus: 'Deze uitgave is afgewezen. We wachten tot jij de problemen hebt opgelost en als opgelost hebt gemarkeerd om indienen weer mogelijk te maken.',
            reportActions: {
                rejectedExpense: 'heeft deze uitgave afgewezen',
                markedAsResolved: 'heeft de reden voor afwijzing als opgelost gemarkeerd',
            },
        },
        moveExpenses: () => ({one: 'Declaratie verplaatsen', other: 'Onkosten verplaatsen'}),
        moveExpensesError: 'Je kunt per diem-uitgaven niet naar rapporten in andere werkruimtes verplaatsen, omdat de per diem-tarieven per werkruimte kunnen verschillen.',
        changeApprover: {
            title: 'Beoordelaar wijzigen',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Kies een optie om de fiatteur voor dit rapport te wijzigen. (Werk je <a href="${workflowSettingLink}">werkruimte-instellingen</a> bij om dit permanent voor alle rapporten te veranderen.)`,
            changedApproverMessage: (managerID: number) => `heeft de beoordelaar gewijzigd in <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Fiatteur toevoegen',
                addApproverSubtitle: 'Voeg een extra fiatteur toe aan de bestaande workflow.',
                bypassApprovers: 'Fiatteurs overslaan',
                bypassApproversSubtitle: 'Wijs jezelf aan als eindgoedkeurder en sla alle resterende goedkeurders over.',
            },
            addApprover: {
                subtitle: 'Kies een extra goedkeurder voor dit rapport voordat we het verder door de rest van de goedkeuringsworkflow sturen.',
            },
        },
        chooseWorkspace: 'Kies een werkruimte',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `rapport doorgestuurd naar ${to} vanwege aangepaste goedkeuringsworkflow`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'uur' : 'uren'} @ ${rate} / uur`,
            hrs: 'uur',
            hours: 'Uren',
            ratePreview: (rate: string) => `${rate} / uur`,
            amountTooLargeError: 'Het totaalbedrag is te hoog. Verlaag het aantal uren of het tarief.',
        },
        correctDistanceRateError: 'Los de afstandsvergoedingfout op en probeer het opnieuw.',
        AskToExplain: `. <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}"><strong>Uitleggen</strong></a> &#x2728;`,
        policyRulesModifiedFields: (policyRulesModifiedFields: PolicyRulesModifiedFields, policyRulesRoute: string, formatList: (list: string[]) => string) => {
            const entries = ObjectUtils.typedEntries(policyRulesModifiedFields);
            const fragments = entries.map(([key, value], i) => {
                const isFirst = i === 0;
                if (key === 'reimbursable') {
                    return value ? 'heeft de uitgave als „vergoedbaar” gemarkeerd' : 'heeft de uitgave gemarkeerd als ‘niet-declarabel’';
                }
                if (key === 'billable') {
                    return value ? 'heeft de uitgave als ‘factureerbaar’ gemarkeerd' : 'heeft de uitgave gemarkeerd als ‘niet-declarabel’';
                }
                if (key === 'tax') {
                    const taxEntry = value as PolicyRulesModifiedFields['tax'];
                    const taxRateName = taxEntry?.field_id_TAX.name ?? '';
                    if (isFirst) {
                        return `stel het belastingtarief in op ‘${taxRateName}’`;
                    }
                    return `belastingtarief naar "${taxRateName}"`;
                }
                const updatedValue = value as string | boolean;
                if (isFirst) {
                    return `stel de ${translations.common[key].toLowerCase()} in op "${updatedValue}"`;
                }
                return `${translations.common[key].toLowerCase()} naar "${updatedValue}"`;
            });
            return `${formatList(fragments)} via <a href="${policyRulesRoute}">werkruimteregels</a>`;
        },
    },
    transactionMerge: {
        listPage: {
            header: 'Uitgaven samenvoegen',
            noEligibleExpenseFound: 'Geen in aanmerking komende uitgaven gevonden',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Je hebt geen uitgaven die met deze uitgave kunnen worden samengevoegd. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">Meer informatie</a> over in aanmerking komende uitgaven.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Selecteer een <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">in aanmerking komende uitgave</a> om samen te voegen met <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: 'Kies bonnetje',
            pageTitle: 'Selecteer de bon die je wilt bewaren:',
        },
        detailsPage: {
            header: 'Details selecteren',
            pageTitle: 'Selecteer de details die je wilt behouden:',
            noDifferences: 'Geen verschillen gevonden tussen de transacties',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? 'een' : 'een';
                return `Selecteer ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Selecteer deelnemers',
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
            hidden: 'Verborgen',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Het nummer is niet gevalideerd. Klik op de knop om de validatielink opnieuw per sms te versturen.',
        emailHasNotBeenValidated: 'Het e-mailadres is niet gevalideerd. Klik op de knop om de validatielink opnieuw via sms te versturen.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Foto uploaden',
        removePhoto: 'Foto verwijderen',
        editImage: 'Foto bewerken',
        viewPhoto: 'Foto bekijken',
        imageUploadFailed: 'Uploaden van afbeelding mislukt',
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
        choosePresetAvatar: 'Of kies een aangepast avatar',
    },
    modal: {
        backdropLabel: 'Modale achtergrond',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> onkosten toevoegt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> uitgaven toevoegt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder onkosten toevoegt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> declaraties indient.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> onkosten indient.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder onkosten indient.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Geen verdere actie vereist!`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
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
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jouw</strong> declaraties automatisch worden ingediend${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot de onkostendeclaraties van <strong>${actor}</strong> automatisch worden ingediend${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot de declaraties van een/beheerder automatisch worden ingediend${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> de problemen oplost.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> de problemen oplost.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder de problemen oplost.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Aan het wachten tot <strong>jij</strong> de declaraties goedkeurt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> de onkosten goedkeurt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten op goedkeuring van uitgaven door een beheerder.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Er wordt gewacht totdat <strong>jij</strong> dit rapport exporteert.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> dit rapport exporteert.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder dit rapport exporteert.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `We wachten op <strong>jou</strong> om declaraties te betalen.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> de onkosten betaalt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten op een beheerder om declaraties te betalen.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> klaar bent met het instellen van een zakelijke bankrekening.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> klaar is met het instellen van een zakelijke bankrekening.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder het instellen van een zakelijke bankrekening voltooit.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `vóór ${eta}` : ` ${eta}`;
                }
                return `Wachten tot de betaling is voltooid${formattedETA}.`;
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `Oeps! Het lijkt erop dat je naar <strong>jezelf</strong> indient. Het goedkeuren van je eigen rapporten is <strong>verboden</strong> volgens je werkruimte. Dien dit rapport in bij iemand anders of neem contact op met je beheerder om de persoon te wijzigen bij wie je indient.`,
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
        profileAvatar: 'Profielfoto avatar',
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
        subtitle: 'Schakel twee-factor-authenticatie in om je account veilig te houden.',
        goToSecurity: 'Ga terug naar de beveiligingspagina',
    },
    shareCodePage: {
        title: 'Je code',
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
        validateAccount: 'Valideer je account',
        helpText: ({email}: {email: string}) =>
            `Voeg meer manieren toe om in te loggen en bonnen naar Expensify te sturen.<br/><br/>Voeg een e‑mailadres toe om bonnen door te sturen naar <a href="mailto:${email}">${email}</a> of voeg een telefoonnummer toe om bonnen te sms’en naar 47777 (alleen voor Amerikaanse nummers).`,
        pleaseVerify: 'Controleer deze contactmethode.',
        getInTouch: 'We gebruiken deze methode om contact met je op te nemen.',
        enterMagicCode: (contactMethod: string) => `Voer de magische code in die naar ${contactMethod} is verzonden. Deze zou binnen een of twee minuten moeten aankomen.`,
        setAsDefault: 'Instellen als standaard',
        yourDefaultContactMethod:
            'Dit is je huidige standaardcontactmethode. Voordat je deze kunt verwijderen, moet je een andere contactmethode kiezen en op ‘Als standaard instellen’ klikken.',
        removeContactMethod: 'Contactmethode verwijderen',
        removeAreYouSure: 'Weet je zeker dat je deze contactmethode wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
        failedNewContact: 'Het toevoegen van deze contactmethode is mislukt.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Verzenden van een nieuwe magische code is mislukt. Wacht even en probeer het opnieuw.',
            validateSecondaryLogin: 'Onjuiste of ongeldige magische code. Probeer het opnieuw of vraag een nieuwe code aan.',
            deleteContactMethod: 'Verwijderen van contactmethode mislukt. Neem contact op met Concierge voor hulp.',
            setDefaultContactMethod: 'Het instellen van een nieuwe standaardcontactmethode is mislukt. Neem contact op met Concierge voor hulp.',
            addContactMethod: 'Deze contactmethode kon niet worden toegevoegd. Neem contact op met Concierge voor hulp.',
            enteredMethodIsAlreadySubmitted: 'Deze contactmethode bestaat al',
            passwordRequired: 'wachtwoord vereist.',
            contactMethodRequired: 'Contactmethode is verplicht',
            invalidContactMethod: 'Ongeldige contactmethode',
        },
        newContactMethod: 'Nieuwe contactmethode',
        goBackContactMethods: 'Ga terug naar contactmethoden',
    },
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Hij / Hem / Zijn',
        heHimHisTheyThemTheirs: 'Hij / Hem / Zijn / Die / Hen / Hun',
        sheHerHers: 'Zij / Haar / Haar',
        sheHerHersTheyThemTheirs: 'Zij / Haar / Van haar / Die / Hen / Van hen',
        merMers: 'Meer / Meerdere',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'Die / Hen / Hens',
        thonThons: 'Ton / Tonnen',
        veVerVis: 'Xe / Xem / Xis',
        viVir: 'U / Uw',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Noem me bij mijn naam',
    },
    displayNamePage: {
        headerTitle: 'Weergavenaam',
        isShownOnProfile: 'Je weergavenaam wordt weergegeven op je profiel.',
    },
    timezonePage: {
        timezone: 'Tijdzone',
        isShownOnProfile: 'Je tijdzone wordt weergegeven in je profiel.',
        getLocationAutomatically: 'Je locatie automatisch bepalen',
    },
    updateRequiredView: {
        updateRequired: 'Update vereist',
        pleaseInstall: 'Werk New Expensify bij naar de nieuwste versie',
        pleaseInstallExpensifyClassic: 'Installeer de nieuwste versie van Expensify',
        toGetLatestChanges: 'Voor mobiel: download en installeer de nieuwste versie. Voor web: ververs je browser.',
        newAppNotAvailable: 'De nieuwe Expensify-app is niet langer beschikbaar.',
    },
    initialSettingsPage: {
        about: 'OverInfo',
        aboutPage: {
            description: 'De nieuwe Expensify-app is gebouwd door een gemeenschap van open-sourcontwikkelaars van over de hele wereld. Help ons de toekomst van Expensify te bouwen.',
            appDownloadLinks: 'Links om de app te downloaden',
            viewKeyboardShortcuts: 'Sneltoetsen bekijken',
            viewTheCode: 'Code bekijken',
            viewOpenJobs: 'Openstaande vacatures bekijken',
            reportABug: 'Een bug melden',
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
            viewConsole: 'Debugconsole bekijken',
            debugConsole: 'Debugconsole',
            description:
                '<muted-text>Gebruik de onderstaande tools om problemen met de Expensify-ervaring op te lossen. Als je problemen ondervindt, <concierge-link>meld dan een bug</concierge-link>.</muted-text>',
            confirmResetDescription: 'Alle niet-verzonden conceptberichten gaan verloren, maar de rest van je gegevens is veilig.',
            resetAndRefresh: 'Opnieuw instellen en verversen',
            clientSideLogging: 'Client-side logging',
            noLogsToShare: 'Geen logboeken om te delen',
            useProfiling: 'Profiling gebruiken',
            profileTrace: 'Profieltrace',
            results: 'Resultaten',
            releaseOptions: 'Vrijgave-opties',
            testingPreferences: 'Testvoorkeuren',
            useStagingServer: 'Stagingserver gebruiken',
            forceOffline: 'Offline forceren',
            simulatePoorConnection: 'Slechte internetverbinding simuleren',
            simulateFailingNetworkRequests: 'Netwerkverzoeken laten mislukken simuleren',
            authenticationStatus: 'Authenticatiestatus',
            deviceCredentials: 'Apparaatgegevens',
            invalidate: 'Ongeldig maken',
            destroy: 'Vernietigen',
            maskExportOnyxStateData: 'Fragiele ledendata maskeren bij het exporteren van Onyx-status',
            exportOnyxState: 'Onyx-status exporteren',
            importOnyxState: 'Onyx-status importeren',
            testCrash: 'Testcrash',
            resetToOriginalState: 'Herstellen naar oorspronkelijke staat',
            usingImportedState: 'Je gebruikt geïmporteerde status. Druk hier om die te wissen.',
            debugMode: 'Debugmodus',
            invalidFile: 'Ongeldig bestand',
            invalidFileDescription: 'Het bestand dat je probeert te importeren is ongeldig. Probeer het opnieuw.',
            invalidateWithDelay: 'Ongeldig maken met vertraging',
            leftHandNavCache: 'Left Hand Nav-cache',
            clearleftHandNavCache: 'Wissen',
            recordTroubleshootData: 'Probleemoplossingsgegevens opnemen',
            softKillTheApp: 'App zacht afsluiten',
            kill: 'Afsluiten',
            sentryDebug: 'Sentry-debug',
            sentryDebugDescription: 'Sentry-aanvragen naar console loggen',
            sentryHighlightedSpanOps: 'Gemarkeerde span-namen',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interactie.klik, navigatie, ui.laden',
        },
        debugConsole: {
            saveLog: 'Log opslaan',
            shareLog: 'Log delen',
            enterCommand: 'Voer opdracht in',
            execute: 'Uitvoeren',
            noLogsAvailable: 'Geen logboeken beschikbaar',
            logSizeTooLarge: ({size}: LogSizeParams) => `Loggrootte overschrijdt de limiet van ${size} MB. Gebruik "Log opslaan" om het logbestand te downloaden.`,
            logs: 'Logboeken',
            viewConsole: 'Console weergeven',
        },
        security: 'Beveiliging',
        signOut: 'Afmelden',
        restoreStashed: 'Opgeslagen login herstellen',
        signOutConfirmationText: 'Je verliest alle offline wijzigingen als je je afmeldt.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Lees de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Servicevoorwaarden</a> en het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacybeleid</a>.</muted-text-micro>`,
        help: 'Help',
        whatIsNew: 'Wat is er nieuw',
        accountSettings: 'Accountinstellingen',
        account: 'Account',
        general: 'Algemeen',
    },
    closeAccountPage: {
        closeAccount: 'Rekening sluiten',
        reasonForLeavingPrompt: 'We zouden het jammer vinden als je weggaat! Wil je ons alsjeblieft vertellen waarom, zodat we ons kunnen verbeteren?',
        enterMessageHere: 'Voer hier een bericht in',
        closeAccountWarning: 'Het sluiten van je account kan niet ongedaan worden gemaakt.',
        closeAccountPermanentlyDeleteData: 'Weet je zeker dat je je account wilt verwijderen? Hiermee worden alle openstaande onkosten definitief verwijderd.',
        enterDefaultContactToConfirm: 'Voer uw standaard contactmethode in om te bevestigen dat u uw account wilt sluiten. Uw standaard contactmethode is:',
        enterDefaultContact: 'Voer je standaard contactmethode in',
        defaultContact: 'Standaardcontactmethode:',
        enterYourDefaultContactMethod: 'Voer je standaard contactmethode in om je account te sluiten.',
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
            reachOutForHelp: '<muted-text><centered-text>Neem gerust <concierge-link>contact op met Concierge</concierge-link> als je vragen hebt!</centered-text></muted-text>',
            goToExpensifyClassic: 'Ga naar Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet samenvoegen omdat het wordt beheerd door <strong>${email.split('@').at(1) ?? ''}</strong>. Neem voor hulp <concierge-link>contact op met Concierge</concierge-link>.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet met andere accounts samenvoegen omdat je domeinbeheerder dit als je primaire login heeft ingesteld. Voeg in plaats daarvan andere accounts ermee samen.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Je kunt geen accounts samenvoegen omdat voor <strong>${email}</strong> tweestapsverificatie (2FA) is ingeschakeld. Schakel 2FA voor <strong>${email}</strong> uit en probeer het opnieuw.</centered-text></muted-text>`,
            learnMore: 'Meer informatie over het samenvoegen van accounts.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet samenvoegen omdat het is vergrendeld. Neem voor hulp alsjeblieft <concierge-link>contact op met Concierge</concierge-link>.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Je kunt geen accounts samenvoegen, omdat <strong>${email}</strong> geen Expensify-account heeft. <a href="${contactMethodLink}">Voeg het in plaats daarvan toe als contactmethode</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet samenvoegen met andere accounts. Voeg in plaats daarvan andere accounts hiermee samen.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt geen accounts samenvoegen met <strong>${email}</strong> omdat dit account eigenaar is van een gefactureerde factureringsrelatie.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Probeer het later opnieuw',
            description: 'Er zijn te veel pogingen gedaan om accounts samen te voegen. Probeer het later opnieuw.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Je kunt niet samenvoegen met andere accounts omdat dit account niet is gevalideerd. Valideer het account en probeer het opnieuw.',
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
            'Val je iets geks op aan je account? Dit melden zal je account onmiddellijk vergrendelen, nieuwe Expensify Card-transacties blokkeren en alle accountwijzigingen voorkomen.',
        domainAdminsDescription: 'Voor domeinbeheerders: hiermee worden ook alle Expensify Card-activiteiten en beheerdersacties in je domein(en) gepauzeerd.',
        areYouSure: 'Weet je zeker dat je je Expensify-account wilt vergrendelen?',
        onceLocked: 'Zodra deze is vergrendeld, wordt je account beperkt in afwachting van een ontgrendelingsverzoek en een beveiligingscontrole',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Account vergrendelen mislukt',
        failedToLockAccountDescription: `We konden je account niet vergrendelen. Chat alsjeblieft met Concierge om dit probleem op te lossen.`,
        chatWithConcierge: 'Chatten met Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Account vergrendeld',
        yourAccountIsLocked: 'Je account is vergrendeld',
        chatToConciergeToUnlock: 'Chat met Concierge om beveiligingsproblemen op te lossen en je account te deblokkeren.',
        chatWithConcierge: 'Chatten met Concierge',
    },
    twoFactorAuth: {
        headerTitle: 'Tweefactorauthenticatie',
        twoFactorAuthEnabled: 'Tweeledige verificatie ingeschakeld',
        whatIsTwoFactorAuth:
            'Dubbele verificatie (2FA) helpt je account veilig te houden. Tijdens het inloggen moet je een code invoeren die is gegenereerd door je voorkeursauthenticator-app.',
        disableTwoFactorAuth: 'Tweeledige verificatie uitschakelen',
        explainProcessToRemove: 'Voer een geldige code uit je authenticatie-app in om twee-factor-authenticatie (2FA) uit te schakelen.',
        explainProcessToRemoveWithRecovery: 'Voer een geldige herstelscode in om twee­staps­verificatie (2FA) uit te schakelen.',
        disabled: 'Tweestapsverificatie is nu uitgeschakeld',
        noAuthenticatorApp: 'Je hebt geen authenticator-app meer nodig om in te loggen bij Expensify.',
        stepCodes: 'Herstelcodes',
        keepCodesSafe: 'Bewaar deze herstelcodes goed!',
        codesLoseAccess: dedent(`
            Als je de toegang tot je authenticator-app verliest en deze codes niet hebt, verlies je de toegang tot je account.

            Opmerking: het instellen van twee-factor-authenticatie logt je uit bij alle andere actieve sessies.
        `),
        errorStepCodes: 'Kopieer of download de codes voordat je verdergaat',
        stepVerify: 'Verifiëren',
        scanCode: 'Scan de QR-code met je',
        authenticatorApp: 'authenticator-app',
        addKey: 'Of voeg deze geheime sleutel toe aan je authenticator-app:',
        enterCode: 'Voer vervolgens de zescijferige code in die is gegenereerd door je authenticatie-app.',
        stepSuccess: 'Voltooid',
        enabled: 'Tweeledige verificatie ingeschakeld',
        congrats: 'Gefeliciteerd! Nu heb je die extra beveiliging.',
        copy: 'Kopiëren',
        disable: 'Uitschakelen',
        enableTwoFactorAuth: 'Tweeledige verificatie inschakelen',
        pleaseEnableTwoFactorAuth: 'Schakel tweefactorauthenticatie in.',
        twoFactorAuthIsRequiredDescription: 'Om veiligheidsredenen vereist Xero tweefactorauthenticatie om de integratie te kunnen koppelen.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Verificatie in twee stappen vereist',
        twoFactorAuthIsRequiredForAdminsTitle: 'Schakel tweefactorauthenticatie in',
        twoFactorAuthIsRequiredXero: 'Je Xero-boekhoudkoppeling vereist tweestapsverificatie.',
        twoFactorAuthIsRequiredCompany: 'Je bedrijf vereist tweeledige verificatie.',
        twoFactorAuthCannotDisable: 'Kan 2FA niet uitschakelen',
        twoFactorAuthRequired: 'Tweefactorauthenticatie (2FA) is vereist voor je Xero-verbinding en kan niet worden uitgeschakeld.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Voer je herstelcode in',
            incorrectRecoveryCode: 'Onjuiste herstelcode. Probeer het opnieuw.',
        },
        useRecoveryCode: 'Herstelcode gebruiken',
        recoveryCode: 'Herstelcode',
        use2fa: 'Gebruik tweestapsverificatiecode',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Voer uw verificatiecode voor tweeledige verificatie in',
            incorrect2fa: 'Onjuiste code voor tweeledige verificatie. Probeer het opnieuw.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Wachtwoord bijgewerkt!',
        allSet: 'Je bent helemaal klaar. Bewaar je nieuwe wachtwoord goed.',
    },
    privateNotes: {
        title: 'Privénotities',
        personalNoteMessage: 'Maak hier notities over deze chat. Jij bent de enige die deze notities kan toevoegen, bewerken of bekijken.',
        sharedNoteMessage: 'Maak hier notities over deze chat. Expensify-medewerkers en andere leden met een team.expensify.com-domein kunnen deze notities bekijken.',
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
        changePaymentCurrency: 'Valutasoort wijzigen',
        paymentCurrency: 'Betaalvaluta',
        paymentCurrencyDescription: 'Selecteer een standaardvaluta waarnaar alle persoonlijke uitgaven moeten worden omgerekend',
        note: `Opmerking: Het wijzigen van je betalingsvaluta kan invloed hebben op hoeveel je voor Expensify betaalt. Raadpleeg onze <a href="${CONST.PRICING}">prijzenpagina</a> voor alle details.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Een debitcard toevoegen',
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
            debitCardNumber: 'Voer een geldig debitkaartnummer in',
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
        deleteCard: 'Kaart verwijderen',
        deleteCardConfirmation:
            'Alle niet-ingediende kaarttransacties, inclusief die op openstaande rapporten, worden verwijderd. Weet je zeker dat je deze kaart wilt verwijderen? Je kunt deze actie niet ongedaan maken.',
        error: {
            notOwnerOfBankAccount: 'Er is een fout opgetreden bij het instellen van deze bankrekening als je standaardbetaalmethode',
            invalidBankAccount: 'Deze bankrekening is tijdelijk opgeschort',
            notOwnerOfFund: 'Er is een fout opgetreden bij het instellen van deze kaart als je standaardbetaalmethode',
            setDefaultFailure: 'Er is iets misgegaan. Chat met Concierge voor verdere hulp.',
        },
        addBankAccountFailure: 'Er is een onverwachte fout opgetreden tijdens het toevoegen van je bankrekening. Probeer het alsjeblieft opnieuw.',
        getPaidFaster: 'Word sneller betaald',
        addPaymentMethod: 'Voeg een betaalmethode toe om rechtstreeks in de app betalingen te versturen en te ontvangen.',
        getPaidBackFaster: 'Krijg sneller je geld terug',
        secureAccessToYourMoney: 'Veilige toegang tot je geld',
        receiveMoney: 'Ontvang geld in je lokale valuta',
        expensifyWallet: 'Expensify Wallet (bèta)',
        sendAndReceiveMoney: 'Stuur en ontvang geld met vrienden. Alleen voor Amerikaanse bankrekeningen.',
        enableWallet: 'Wallet inschakelen',
        addBankAccountToSendAndReceive: 'Voeg een bankrekening toe om betalingen te doen of te ontvangen.',
        addDebitOrCreditCard: 'Betaal- of kredietkaart toevoegen',
        assignedCards: 'Toegewezen kaarten',
        assignedCardsDescription: 'Transacties van deze kaarten worden automatisch gesynchroniseerd.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'We beoordelen je gegevens. Kom over een paar minuten terug!',
        walletActivationFailed: 'Helaas kan je wallet op dit moment niet worden ingeschakeld. Chat alsjeblieft met Concierge voor verdere hulp.',
        addYourBankAccount: 'Voeg je bankrekening toe',
        addBankAccountBody: 'Laten we je bankrekening koppelen aan Expensify, zodat het nog makkelijker wordt om rechtstreeks in de app betalingen te verzenden en te ontvangen.',
        chooseYourBankAccount: 'Kies je bankrekening',
        chooseAccountBody: 'Zorg ervoor dat je de juiste selecteert.',
        confirmYourBankAccount: 'Bevestig je bankrekening',
        personalBankAccounts: 'Persoonlijke bankrekeningen',
        businessBankAccounts: 'Zakelijke bankrekeningen',
        shareBankAccount: 'Bankrekening delen',
        bankAccountShared: 'Bankrekening gedeeld',
        shareBankAccountTitle: 'Selecteer de beheerders om deze bankrekening mee te delen:',
        shareBankAccountSuccess: 'Bankrekening gedeeld!',
        shareBankAccountSuccessDescription: 'De geselecteerde beheerders ontvangen een bevestigingsbericht van Concierge.',
        shareBankAccountFailure: 'Er is een onverwachte fout opgetreden bij het proberen delen van de bankrekening. Probeer het opnieuw.',
        shareBankAccountEmptyTitle: 'Geen beheerders beschikbaar',
        shareBankAccountEmptyDescription: 'Er zijn geen workspacebeheerders met wie je deze bankrekening kunt delen.',
        shareBankAccountNoAdminsSelected: 'Selecteer een admin voordat je verdergaat',
        unshareBankAccount: 'Bankrekening niet meer delen',
        unshareBankAccountDescription:
            'Iedereen hieronder heeft toegang tot deze bankrekening. Je kunt de toegang op elk moment intrekken. We verwerken nog steeds alle betalingen die al in behandeling zijn.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) =>
            `${admin} verliest de toegang tot deze zakelijke bankrekening. We ronden nog steeds alle betalingen af die al in behandeling zijn.`,
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
                `Je kunt tot ${formattedLimit} uitgeven met deze kaart, en de limiet wordt teruggezet zodra je ingediende uitgaven zijn goedgekeurd.`,
        },
        fixedLimit: {
            name: 'Vast limiet',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Je kunt tot ${formattedLimit} uitgeven met deze kaart, daarna wordt deze gedeactiveerd.`,
        },
        monthlyLimit: {
            name: 'Maandlimiet',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Je kunt tot ${formattedLimit} per maand uitgeven met deze kaart. De limiet wordt op de 1e dag van elke kalendermaand opnieuw ingesteld.`,
        },
        virtualCardNumber: 'Nummer virtuele kaart',
        travelCardCvv: 'CVV van reiskaart',
        physicalCardNumber: 'Fysiek kaartnummer',
        physicalCardPin: 'Pincode',
        getPhysicalCard: 'Fysieke kaart aanvragen',
        reportFraud: 'Fraude met virtuele kaart melden',
        reportTravelFraud: 'Reiscreditcardfraude melden',
        reviewTransaction: 'Transactie controleren',
        suspiciousBannerTitle: 'Verdachte transactie',
        suspiciousBannerDescription: 'We hebben verdachte transacties op je kaart opgemerkt. Tik hieronder om ze te bekijken.',
        cardLocked: 'Je kaart is tijdelijk geblokkeerd terwijl ons team het account van je bedrijf beoordeelt.',
        markTransactionsAsReimbursable: 'Markeer transacties als vergoedbaar',
        markTransactionsDescription: 'Indien ingeschakeld, worden transacties die van deze kaart worden geïmporteerd standaard als terugbetaalbaar gemarkeerd.',
        csvCardDescription: 'CSV-import',
        cardDetails: {
            cardNumber: 'Nummer virtuele kaart',
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
        validateCardTitle: 'Laten we controleren of jij het bent',
        enterMagicCode: (contactMethod: string) =>
            `Voer de magische code in die naar ${contactMethod} is gestuurd om je kaartgegevens te bekijken. Deze zou binnen een of twee minuten moeten aankomen.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) =>
            `Voeg alsjeblieft <a href="${missingDetailsLink}">je persoonlijke gegevens toe</a> en probeer het daarna opnieuw.`,
        unexpectedError: 'Er is een fout opgetreden bij het ophalen van de gegevens van je Expensify-kaart. Probeer het opnieuw.',
        cardFraudAlert: {
            confirmButtonText: 'Ja, dat doe ik',
            reportFraudButtonText: 'Nee, dat was ik niet',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `verdachte activiteit verwijderd en kaart x${cardLastFour} opnieuw geactiveerd. Je kunt weer doorgaan met declareren!`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `heeft de kaart met eindigend op ${cardLastFour} gedeactiveerd`,
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
            }) => `verdachte activiteit vastgesteld op kaart die eindigt op ${cardLastFour}. Herken je deze afschrijving?

${amount} voor ${merchant} - ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Uitgaven',
        workflowDescription: 'Configureer een workflow vanaf het moment dat uitgaven plaatsvinden, inclusief goedkeuring en betaling.',
        submissionFrequency: 'Inzendingen',
        submissionFrequencyDescription: 'Kies een aangepast schema voor het indienen van uitgaven.',
        submissionFrequencyDateOfMonth: 'Dag van de maand',
        disableApprovalPromptDescription: 'Als je goedkeuringen uitschakelt, worden alle bestaande goedkeuringsworkflows verwijderd.',
        addApprovalsTitle: 'Goedkeuringen',
        accessibilityLabel: ({members, approvers}: {members: string; approvers: string}) => `onkosten van ${members}, en de goedkeurder is ${approvers}`,
        addApprovalButton: 'Goedkeuringsworkflow toevoegen',
        addApprovalTip: 'Deze standaardworkflow is van toepassing op alle leden, tenzij er een specifiekere workflow bestaat.',
        approver: 'Fiatteur',
        addApprovalsDescription: 'Vereis extra goedkeuring voordat je een betaling autoriseert.',
        makeOrTrackPaymentsTitle: 'Betalingen',
        makeOrTrackPaymentsDescription: 'Voeg een gemachtigde betaler toe voor betalingen die in Expensify worden gedaan of houd betalingen bij die elders zijn gedaan.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Er is een aangepast goedkeuringsproces ingeschakeld voor deze workspace. Neem contact op met je <account-manager-link>Accountmanager</account-manager-link> of <concierge-link>Concierge</concierge-link> om dit proces te bekijken of te wijzigen.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Er is een aangepast goedkeuringsproces ingeschakeld voor deze workspace. Neem contact op met <concierge-link>Concierge</concierge-link> om dit proces te bekijken of te wijzigen.</muted-text-label>',
        editor: {
            submissionFrequency: 'Kies hoelang Expensify moet wachten voordat foutloze uitgaven worden gedeeld.',
        },
        frequencyDescription: 'Kies hoe vaak je onkosten automatisch wilt indienen, of maak het handmatig',
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
                two: '2e',
                few: 'rd',
                other: 'de',
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
            },
        },
        approverInMultipleWorkflows: 'Dit lid behoort al tot een andere goedkeuringsworkflow. Alle wijzigingen die je hier aanbrengt, worden daar ook doorgevoerd.',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> keurt al rapporten goed naar <strong>${name2}</strong>. Kies een andere fiatteur om een cirkelvormige workflow te voorkomen.`,
        emptyContent: {
            title: 'Geen leden om weer te geven',
            expensesFromSubtitle: 'Alle werkruimteleden behoren al tot een bestaande goedkeuringsworkflow.',
            approverSubtitle: 'Alle fiatteurs behoren tot een bestaande workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Indieningsfrequentie kon niet worden gewijzigd. Probeer het opnieuw of neem contact op met support.',
        monthlyOffsetErrorMessage: 'Maandelijkse frequentie kon niet worden gewijzigd. Probeer het opnieuw of neem contact op met support.',
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
        title: 'Declaraties vanaf',
        header: 'Wanneer de volgende leden onkosten indienen:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'De fiatteur kon niet worden gewijzigd. Probeer het opnieuw of neem contact op met support.',
        title: 'Stel goedkeurder in',
        description: 'Deze persoon keurt de onkostendeclaraties goed.',
    },
    workflowsApprovalLimitPage: {
        title: 'Fiatteur',
        header: '(Niet verplicht) Wil je een goedkeuringslimiet toevoegen?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Voeg een extra fiatteur toe wanneer <strong>${approverName}</strong> fiatteur is en het rapport het onderstaande bedrag overschrijdt:`
                : 'Voeg een extra fiatteur toe wanneer een rapport het onderstaande bedrag overschrijdt:',
        reportAmountLabel: 'Rapportbedrag',
        additionalApproverLabel: 'Extra fiatteur',
        skip: 'Overslaan',
        next: 'Volgende',
        removeLimit: 'Limiet verwijderen',
        enterAmountError: 'Voer een geldig bedrag in',
        enterApproverError: 'Een goedkeurder is vereist wanneer je een rapportlimiet instelt',
        enterBothError: 'Voer een rapportbedrag en een extra fiatteur in',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) =>
            `Rapporten boven ${approvalLimit} worden doorgestuurd naar ${approverName}`,
    },
    workflowsPayerPage: {
        title: 'Bevoegde betaler',
        genericErrorMessage: 'De bevoegde betaler kon niet worden gewijzigd. Probeer het opnieuw.',
        admins: 'Beheerders',
        payer: 'Betaler',
        paymentAccount: 'Betaalrekening',
    },
    reportFraudPage: {
        title: 'Fraude met virtuele kaart melden',
        description:
            'Als de gegevens van je virtuele kaart zijn gestolen of gecompromitteerd, deactiveren we je bestaande kaart permanent en geven we je een nieuwe virtuele kaart met een nieuw nummer.',
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
                'Je hebt te vaak onjuist de laatste 4 cijfers van je Expensify Card ingevoerd. Als je zeker weet dat de cijfers kloppen, neem dan contact op met Concierge om dit op te lossen. Probeer het anders later opnieuw.',
        },
    },
    getPhysicalCard: {
        header: 'Fysieke kaart aanvragen',
        nameMessage: 'Vul je voor- en achternaam in, want deze wordt op je kaart weergegeven.',
        legalName: 'Juridische naam',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Officiële achternaam',
        phoneMessage: 'Voer je telefoonnummer in.',
        phoneNumber: 'Telefoonnummer',
        address: 'Adres',
        addressMessage: 'Voer uw verzendadres in.',
        streetAddress: 'Straatnaam en huisnummer',
        city: 'Stad',
        state: 'Status',
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
        instant: 'Direct (debitkaart)',
        instantSummary: (rate: string, minAmount: string) => `${rate}% kosten (${minAmount} minimum)`,
        ach: '1-3 werkdagen (bankrekening)',
        achSummary: 'Geen kosten',
        whichAccount: 'Welke rekening?',
        fee: 'Kosten',
        transferSuccess: 'Overboeking geslaagd!',
        transferDetailBankAccount: 'Je geld zou binnen 1–3 werkdagen moeten aankomen.',
        transferDetailDebitCard: 'Je geld zou direct moeten aankomen.',
        failedTransfer: 'Je saldo is niet volledig vereffend. Maak een overboeking naar een bankrekening.',
        notHereSubTitle: 'Maak je saldo over vanaf de portemonneepagina',
        goToWallet: 'Ga naar Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Account kiezen',
    },
    paymentMethodList: {
        addPaymentMethod: 'Betaalmethode toevoegen',
        addNewDebitCard: 'Nieuwe betaalpas toevoegen',
        addNewBankAccount: 'Nieuwe bankrekening toevoegen',
        accountLastFour: 'Eindigend op',
        cardLastFour: 'Kaart eindigend op',
        addFirstPaymentMethod: 'Voeg een betaalmethode toe om rechtstreeks in de app betalingen te versturen en te ontvangen.',
        defaultPaymentMethod: 'Standaard',
        bankAccountLastFour: (lastFour: string) => `Bankrekening • ${lastFour}`,
    },
    expenseRulesPage: {
        title: 'Declaratieregels',
        subtitle: 'Deze regels zijn van toepassing op jouw uitgaven. Als je naar een werkruimte indient, kunnen de regels van die werkruimte deze overschrijven.',
        findRule: 'Regel zoeken',
        emptyRules: {
            title: 'Je hebt nog geen regels gemaakt',
            subtitle: 'Voeg een regel toe om onkostenrapportage te automatiseren.',
        },
        changes: {
            billableUpdate: (value: boolean) => `Uitgave ${value ? 'factureerbaar' : 'niet-declarabel'} bijwerken`,
            categoryUpdate: (value: string) => `Categorie bijwerken naar "${value}"`,
            commentUpdate: (value: string) => `Beschrijving bijgewerkt naar "${value}"`,
            merchantUpdate: (value: string) => `Handelaar bijwerken naar "${value}"`,
            reimbursableUpdate: (value: boolean) => `Uitgave ${value ? 'declareerbaar' : 'niet-vergoedbaar'} bijwerken`,
            tagUpdate: (value: string) => `Label bijwerken naar "${value}"`,
            taxUpdate: (value: string) => `Belastingtarief bijwerken naar "${value}"`,
            billable: (value: boolean) => `uitgave ${value ? 'factureerbaar' : 'niet-declarabel'}`,
            category: (value: string) => `categorie naar "${value}"`,
            comment: (value: string) => `beschrijving naar "${value}"`,
            merchant: (value: string) => `handelaar naar „${value}”`,
            reimbursable: (value: boolean) => `declaratie ${value ? 'declareerbaar' : 'niet-vergoedbaar'}`,
            tag: (value: string) => `taggen als "${value}"`,
            tax: (value: string) => `belastingtarief naar "${value}"`,
            report: (value: string) => `toevoegen aan een rapport met de naam ‘${value}’`,
        },
        newRule: 'Nieuwe regel',
        addRule: {
            title: 'Regel toevoegen',
            expenseContains: 'Als de uitgave bevat:',
            applyUpdates: 'Pas deze updates vervolgens toe:',
            merchantHint: 'Typ . om een regel te maken die op alle verkopers van toepassing is',
            addToReport: 'Toevoegen aan een rapport met de naam',
            createReport: 'Maak indien nodig een rapport',
            applyToExistingExpenses: 'Toepassen op bestaande overeenkomende uitgaven',
            confirmError: 'Voer handelaar in en pas minstens één wijziging toe',
            confirmErrorMerchant: 'Voer handelaar in',
            confirmErrorUpdate: 'Breng ten minste één update aan',
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
            subtitle: 'Instellingen om te helpen bij het debuggen en testen van de app op staging.',
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
                description: 'Toon alle chats gesorteerd op meest recent',
            },
            gsd: {
                label: '#focus',
                description: 'Alleen ongelezen tonen, alfabetisch gesorteerd',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
        generatingPDF: 'PDF genereren',
        waitForPDF: 'Even geduld terwijl we de pdf genereren.',
        errorPDF: 'Er is een fout opgetreden bij het genereren van je PDF',
        successPDF: 'Je PDF is gegenereerd! Als het niet automatisch is gedownload, gebruik dan de knop hieronder.',
    },
    reportDescriptionPage: {
        roomDescription: 'Kamerbeschrijving',
        roomDescriptionOptional: 'Beschrijving van ruimte (optioneel)',
        explainerText: 'Stel een aangepaste beschrijving voor de kamer in.',
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
        chooseThemeBelowOrSync: 'Kies hieronder een thema of synchroniseer met de instellingen van je apparaat.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Door in te loggen ga je akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Servicevoorwaarden</a> en het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacybeleid</a>.</muted-text-xs>`,
        license: `<muted-text-xs>Geldtransmissie wordt verzorgd door ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) overeenkomstig diens <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenties</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Geen magische code ontvangen?',
        enterAuthenticatorCode: 'Voer je verificatiecode in',
        enterRecoveryCode: 'Voer je herstelcode in',
        requiredWhen2FAEnabled: 'Vereist wanneer 2FA is ingeschakeld',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Vraag een nieuwe code aan over <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Vraag een nieuwe code aan',
        error: {
            pleaseFillMagicCode: 'Voer je magische code in',
            incorrectMagicCode: 'Onjuiste of ongeldige magische code. Probeer het opnieuw of vraag een nieuwe code aan.',
            pleaseFillTwoFactorAuth: 'Voer uw verificatiecode voor tweeledige verificatie in',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Vul alle velden in',
        pleaseFillPassword: 'Voer uw wachtwoord in',
        pleaseFillTwoFactorAuth: 'Voer uw tweestapscode in',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Voer je tweestapsverificatiecode in om door te gaan',
        forgot: 'Vergeten?',
        requiredWhen2FAEnabled: 'Vereist wanneer 2FA is ingeschakeld',
        error: {
            incorrectPassword: 'Onjuist wachtwoord. Probeer het opnieuw.',
            incorrectLoginOrPassword: 'Onjuiste login of wachtwoord. Probeer het opnieuw.',
            incorrect2fa: 'Onjuiste code voor tweeledige verificatie. Probeer het opnieuw.',
            twoFactorAuthenticationEnabled: 'Je hebt 2FA ingeschakeld voor dit account. Meld je aan met je e-mailadres of telefoonnummer.',
            invalidLoginOrPassword: 'Ongeldige gebruikersnaam of wachtwoord. Probeer het opnieuw of reset uw wachtwoord.',
            unableToResetPassword:
                'We konden je wachtwoord niet wijzigen. Dit komt waarschijnlijk door een verlopen link voor het opnieuw instellen van je wachtwoord in een oude e-mail. We hebben je een nieuwe link gemaild zodat je het opnieuw kunt proberen. Controleer je inbox en je map met spam; de e-mail zou binnen enkele minuten moeten aankomen.',
            noAccess: 'Je hebt geen toegang tot deze applicatie. Voeg je GitHub-gebruikersnaam toe om toegang te krijgen.',
            accountLocked: 'Je account is vergrendeld na te veel mislukte pogingen. Probeer het over 1 uur opnieuw.',
            fallback: 'Er is iets misgegaan. Probeer het later opnieuw.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefoon of e-mail',
        error: {
            invalidFormatEmailLogin: 'Het ingevoerde e-mailadres is ongeldig. Corrigeer het formaat en probeer het opnieuw.',
        },
        cannotGetAccountDetails: 'Accountgegevens konden niet worden opgehaald. Probeer opnieuw in te loggen.',
        loginForm: 'Inlogformulier',
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
        peopleYouMayKnow: 'Mensen die je misschien kent zijn hier al! Verifieer je e-mailadres om je bij hen aan te sluiten.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Iemand van ${domain} heeft al een werkruimte aangemaakt. Voer de magische code in die naar ${email} is gestuurd.`,
        joinAWorkspace: 'Aan ruimte deelnemen',
        listOfWorkspaces: 'Hier is de lijst met werkruimtes waartoe je je kunt aansluiten. Geen zorgen, je kunt ze later altijd nog joinen als je dat wilt.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} lid${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Waar werk je?',
        errorSelection: 'Selecteer een optie om verder te gaan',
        purpose: {
            title: 'Wat wil je vandaag doen?',
            errorContinue: 'Druk op Doorgaan om de installatie te voltooien',
            errorBackButton: 'Beantwoord de installatievragen om de app te kunnen gebruiken',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Laat me terugbetalen door mijn werkgever',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Beheer de onkosten van mijn team',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Uitgaven bijhouden en budgetteren',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chatten en uitgaven splitsen met vrienden',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Iets anders',
        },
        employees: {
            title: 'Hoeveel werknemers heeft u?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 medewerkers',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 medewerkers',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 werknemers',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1.000 medewerkers',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Meer dan 1.000 werknemers',
        },
        accounting: {
            title: 'Gebruikt u boekhoudsoftware?',
            none: 'Geen',
        },
        interestedFeatures: {
            title: 'In welke functies ben je geïnteresseerd?',
            featuresAlreadyEnabled: 'Dit zijn onze populairste functies:',
            featureYouMayBeInterestedIn: 'Schakel extra functies in:',
        },
        error: {
            requiredFirstName: 'Voer uw voornaam in om door te gaan',
        },
        workEmail: {
            title: 'Wat is je zakelijke e-mailadres?',
            subtitle: 'Expensify werkt het beste wanneer je je werk-e-mailadres koppelt.',
            explanationModal: {
                descriptionOne: 'Doorsturen naar receipts@expensify.com voor scannen',
                descriptionTwo: 'Voeg je bij je collega’s die Expensify al gebruiken',
                descriptionThree: 'Geniet van een meer gepersonaliseerde ervaring',
            },
            addWorkEmail: 'Werkmail toevoegen',
        },
        workEmailValidation: {
            title: 'Verifieer je zakelijke e-mailadres',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Voer de magische code in die naar ${workEmail} is gestuurd. Deze zou binnen een minuut of twee moeten aankomen.`,
        },
        workEmailValidationError: {
            publicEmail: 'Voer een geldig zakelijk e-mailadres in van een privédomein, bijv. mitch@company.com',
            offline: 'We konden je werkmail niet toevoegen omdat je blijkbaar offline bent',
        },
        mergeBlockScreen: {
            title: 'Werkmail kon niet worden toegevoegd',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) => `We konden ${workEmail} niet toevoegen. Probeer het later opnieuw in Instellingen of chat met Concierge voor hulp.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Maak een [testrit](${testDriveURL})`,
                description: ({testDriveURL}) => `[Maak een korte producttour](${testDriveURL}) om te zien waarom Expensify de snelste manier is om je onkosten te verwerken.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Maak een [testrit](${testDriveURL})`,
                description: ({testDriveURL}) => `Neem ons mee voor een [proefrit](${testDriveURL}) en geef je team *3 gratis maanden Expensify!*`,
            },
            addExpenseApprovalsTask: {
                title: 'Uitgaven goedkeuringen toevoegen',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Voeg uitgavenfiattering toe* om de uitgaven van je team te beoordelen en onder controle te houden.

                        Zo doe je dat:

                        1. Ga naar *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *Meer functies*.
                        4. Schakel *Workflows* in.
                        5. Ga naar *Workflows* in de workspace-editor.
                        6. Schakel *Goedkeuringen* in.
                        7. Jij wordt ingesteld als de goedkeurder van uitgaven. Je kunt dit wijzigen naar een andere beheerder zodra je je team hebt uitgenodigd.

                        [Breng me naar Meer functies](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Maak](${workspaceConfirmationLink}) een workspace`,
                description: 'Maak een workspace aan en configureer de instellingen met hulp van je onboarding-specialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Maak een [werkruimte](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Maak een workspace* om uitgaven bij te houden, bonnetjes te scannen, chatten en meer.

                        1. Klik op *Workspaces* > *Nieuwe workspace*.

                        *Je nieuwe workspace is klaar!* [Bekijk ‘m](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[Categories](${workspaceCategoriesLink}) instellen`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Stel categorieën in* zodat je team onkosten kan coderen voor eenvoudige rapportage.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *Categorieën*.
                        4. Schakel alle categorieën uit die je niet nodig hebt.
                        5. Voeg je eigen categorieën toe rechtsboven.

                        [Breng me naar de categorie-instellingen van de workspace](${workspaceCategoriesLink}).

                        ![Stel categorieën in](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Dien een uitgave in',
                description: dedent(`
                    *Dien een uitgave in* door een bedrag in te voeren of een bonnetje te scannen.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Uitgave maken*.
                    3. Voer een bedrag in of scan een bonnetje.
                    4. Voeg het e-mailadres of telefoonnummer van je baas toe.
                    5. Klik op *Maken*.

                    En klaar!
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Dien een uitgave in',
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
                    *Houd een uitgave bij* in elke valuta, of je nu een bonnetje hebt of niet.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Uitgave aanmaken*.
                    3. Voer een bedrag in of scan een bonnetje.
                    4. Kies je *persoonlijke* ruimte.
                    5. Klik op *Aanmaken*.

                    En je bent klaar! Ja, zo simpel is het.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Verbind${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'naar'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'je' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Koppel ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'je' : 'naar'} ${integrationName} voor automatische onkostencodering en synchronisatie, zodat de maandafsluiting moeiteloos verloopt.

                        1. Klik op *Werkruimtes*.
                        2. Selecteer je werkruimte.
                        3. Klik op *Boekhouding*.
                        4. Zoek ${integrationName}.
                        5. Klik op *Verbinden*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? `[Breng me naar de boekhouding](${workspaceAccountingLink}).

                        ![Verbind met ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
        : `[Breng me naar de boekhouding](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Verbind [je zakelijke kaarten](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Koppel de kaarten die je al hebt voor automatische transactie-import, bonkoppeling en afstemming.

                        1. Klik op *Werkruimtes*.
                        2. Selecteer je werkruimte.
                        3. Klik op *Bedrijfskaarten*.
                        4. Volg de aanwijzingen om je kaarten te koppelen.

                        [Breng me naar Bedrijfskaarten](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Nodig [je team uit](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Nodig je team uit* voor Expensify zodat ze vandaag nog kunnen beginnen met het bijhouden van uitgaven.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *Members* > *Invite member*.
                        4. Voer e‑mailadressen of telefoonnummers in.
                        5. Voeg een aangepast uitnodigingsbericht toe als je wilt!

                        [Breng me naar de workspaceleden](${workspaceMembersLink}).

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
                title: ({workspaceTagsLink}) => `[Tags](${workspaceTagsLink}) instellen`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Gebruik labels om extra onkostendetails toe te voegen, zoals projecten, klanten, locaties en afdelingen. Als je meerdere niveaus van labels nodig hebt, kun je upgraden naar het Control-abonnement.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *More features*.
                        4. Schakel *Tags* in.
                        5. Ga in de workspace-editor naar *Tags*.
                        6. Klik op *+ Add tag* om je eigen label te maken.

                        [Breng me naar More features](${workspaceMoreFeaturesLink}).

                        ![Labels instellen](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Nodig je [boekhouder](${workspaceMembersLink}) uit`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Nodig je accountant uit* om samen te werken in je workspace en je zakelijke uitgaven te beheren.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *Leden*.
                        4. Klik op *Lid uitnodigen*.
                        5. Voer het e-mailadres van je accountant in.

                        [Nodig je accountant nu uit](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Start een chat',
                description: dedent(`
                    *Start een chat* met iedereen via hun e-mailadres of telefoonnummer.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Chat starten*.
                    3. Voer een e-mailadres of telefoonnummer in.

                    Als ze Expensify nog niet gebruiken, worden ze automatisch uitgenodigd.

                    Elke chat wordt ook omgezet in een e-mail of sms waar zij direct op kunnen reageren.
                `),
            },
            splitExpenseTask: {
                title: 'Een uitgave splitsen',
                description: dedent(`
                    *Deel uitgaven* met een of meer personen.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Chat starten*.
                    3. Voer e‑mailadressen of telefoonnummers in.
                    4. Klik op de grijze *+*-knop in de chat > *Uitgave delen*.
                    5. Maak de uitgave aan door *Handmatig*, *Scan* of *Afstand* te kiezen.

                    Voeg gerust meer details toe als je wilt, of stuur het gewoon door. Zo word je snel terugbetaald!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Controleer je [werkruimtesettings](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Zo bekijk en werk je de instellingen van je werkruimte bij:
                        1. Klik op Werkruimtes.
                        2. Selecteer je werkruimte.
                        3. Bekijk en werk je instellingen bij.
                        [Ga naar je werkruimte.](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: 'Maak je eerste rapport',
                description: dedent(`
                    Zo maak je een rapport:

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Rapport maken*.
                    3. Klik op *Onkost toevoegen*.
                    4. Voeg je eerste onkost toe.

                    En dat is het!
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
            onboardingEmployerOrSubmitMessage: 'Terugbetaald worden is net zo eenvoudig als een bericht sturen. Laten we de basis doornemen.',
            onboardingPersonalSpendMessage: 'Zo houd je je uitgaven bij in slechts een paar klikken.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Je gratis proefperiode is begonnen! Laten we je instellen.
                        👋 Hoi, ik ben je Expensify-opstelspecialist. Ik heb al een workspace aangemaakt om de bonnetjes en uitgaven van je team te beheren. Volg de resterende configuratiestappen hieronder om het meeste uit je gratis proefperiode van 30 dagen te halen!
                    `)
                    : dedent(`
                        # Je gratis proefperiode is gestart! Laten we aan de slag gaan.
                        👋 Hoi, ik ben je Expensify-instellingsspecialist. Nu je een werkruimte hebt gemaakt, haal je het meeste uit je gratis proefperiode van 30 dagen door de onderstaande stappen te volgen!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Laten we je instellen\n👋 Hoi, ik ben je Expensify-configuratiespecialist. Ik heb al een workspace aangemaakt om je bonnetjes en uitgaven te beheren. Doorloop de resterende configuratiestappen hieronder om het meeste uit je gratis proefperiode van 30 dagen te halen!',
            onboardingChatSplitMessage: 'Rekeningen splitten met vrienden is net zo eenvoudig als het versturen van een bericht. Zo werkt het.',
            onboardingAdminMessage: 'Leer hoe je als beheerder de werkruimte van je team beheert en je eigen uitgaven indient.',
            onboardingLookingAroundMessage:
                'Expensify staat vooral bekend om onkosten-, reis- en zakelijke kaartbeheer, maar we doen veel meer dan dat. Laat me weten waarin je geïnteresseerd bent, dan help ik je op weg.',
            onboardingTestDriveReceiverMessage: '*Je krijgt 3 maanden gratis! Begin hieronder.*',
        },
        workspace: {
            title: 'Blijf georganiseerd met een werkruimte',
            subtitle: 'Ontgrendel krachtige tools om je onkostbeheer te vereenvoudigen, allemaal op één plek. Met een workspace kun je:',
            explanationModal: {
                descriptionOne: 'Bonnen bijhouden en ordenen',
                descriptionTwo: 'Categoriseer en label uitgaven',
                descriptionThree: 'Rapporten maken en delen',
            },
            price: 'Probeer het 30 dagen gratis uit en upgrade daarna voor slechts <strong>$5/gebruiker/maand</strong>.',
            createWorkspace: 'Werkruimte maken',
        },
        confirmWorkspace: {
            title: 'Werkruimte bevestigen',
            subtitle: 'Maak een werkruimte om bonnen bij te houden, uitgaven te vergoeden, reizen te beheren, rapporten te maken en meer — allemaal op de snelheid van chat.',
        },
        inviteMembers: {
            title: 'Leden uitnodigen',
            subtitle: 'Voeg je team toe of nodig je accountant uit. Hoe meer zielen, hoe meer vreugd!',
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
        enterLegalName: 'Wat is je wettelijke naam?',
        enterDateOfBirth: 'Wat is je geboortedatum?',
        enterAddress: 'Wat is je adres?',
        enterPhoneNumber: 'Wat is je telefoonnummer?',
        personalDetails: 'Persoonlijke gegevens',
        privateDataMessage: 'Deze gegevens worden gebruikt voor reizen en betalingen. Ze worden nooit weergegeven op je openbare profiel.',
        legalName: 'Juridische naam',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Officiële achternaam',
        address: 'Adres',
        error: {
            dateShouldBeBefore: (dateString: string) => `Datum moet vóór ${dateString} zijn`,
            dateShouldBeAfter: (dateString: string) => `Datum moet na ${dateString} liggen`,
            hasInvalidCharacter: 'Naam mag alleen Latijnse letters bevatten',
            incorrectZipFormat: (zipFormat?: string) => `Onjuist formaat voor postcode${zipFormat ? `Acceptabel formaat: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Zorg ervoor dat het telefoonnummer geldig is (bijv. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link is opnieuw verzonden',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `Ik heb een magische aanmeldlink naar ${login} gestuurd. Controleer je ${loginType} om je aan te melden.`,
        resendLink: 'Link opnieuw verzenden',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Om ${secondaryLogin} te valideren, stuur de magische code opnieuw vanuit de Accountinstellingen van ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Als je geen toegang meer hebt tot ${primaryLogin}, koppel dan je accounts los.`,
        unlink: 'Koppeling verwijderen',
        linkSent: 'Link verzonden!',
        successfullyUnlinkedLogin: 'Secundair account succesvol ontkoppeld!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Onze e-mailprovider heeft het versturen van e-mails naar ${login} tijdelijk opgeschort vanwege bezorgingsproblemen. Volg deze stappen om je login te deblokkeren:`,
        confirmThat: (login: string) =>
            `<strong>Bevestig dat ${login} correct is gespeld en een echt, bezorgbaar e-mailadres is.</strong> E-mailaliassen zoals "expenses@domain.com" moeten toegang hebben tot hun eigen e-mailinbox om een geldige Expensify-login te zijn.`,
        ensureYourEmailClient: `<strong>Zorg ervoor dat je e‑mailclient e‑mails van expensify.com toestaat.</strong> Je vindt instructies om deze stap te voltooien <a href="${CONST.SET_NOTIFICATION_LINK}">hier</a>, maar mogelijk heb je hulp van je IT‑afdeling nodig om je e‑mailinstellingen te configureren.`,
        onceTheAbove: `Zodra je de bovenstaande stappen hebt voltooid, neem dan contact op met <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> om je login te deblokkeren.`,
    },
    openAppFailureModal: {
        title: 'Er is iets misgegaan...',
        subtitle: `We hebben niet al je gegevens kunnen laden. We zijn op de hoogte gebracht en onderzoeken het probleem. Neem als dit aanhoudt contact op met`,
        refreshAndTryAgain: 'Vernieuw en probeer het opnieuw',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `We kunnen geen sms-berichten afleveren op ${login}, daarom hebben we het tijdelijk opgeschort. Probeer je nummer te valideren:`,
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
        title: 'Welkom bij de #focusmodus!',
        prompt: (priorityModePageUrl: string) =>
            `Blijf het overzicht houden door alleen ongelezen chats of chats te zien die je aandacht nodig hebben. Geen zorgen, je kunt dit op elk moment wijzigen in de <a href="${priorityModePageUrl}">instellingen</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'De chat die je zoekt, kan niet worden gevonden.',
        getMeOutOfHere: 'Haal me hier weg',
        iouReportNotFound: 'De betalingsgegevens die je zoekt, kunnen niet worden gevonden.',
        notHere: 'Hmm... het is er niet',
        pageNotFound: 'Oeps, deze pagina kan niet worden gevonden',
        noAccess: 'Deze chat of uitgave is mogelijk verwijderd of je hebt er geen toegang toe.\n\nNeem bij vragen contact op met concierge@expensify.com',
        goBackHome: 'Ga terug naar de startpagina',
        commentYouLookingForCannotBeFound: 'De opmerking waar je naar zoekt, kan niet worden gevonden.',
        goToChatInstead: 'Ga in plaats daarvan naar de chat.',
        contactConcierge: 'Voor vragen kun je contact opnemen met concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Oeps... ${isBreakLine ? '\n' : ''}Er is iets misgegaan`,
        subtitle: 'Je verzoek kon niet worden voltooid. Probeer het later opnieuw.',
        wrongTypeSubtitle: 'Die zoekopdracht is ongeldig. Probeer je zoekcriteria aan te passen.',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Voeg een emoji toe zodat je collega’s en vrienden makkelijk kunnen zien wat er aan de hand is. Je kunt er ook nog een bericht bij zetten.',
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
        vacationDelegate: 'Vervanger tijdens vakantie',
        setVacationDelegate: `Stel een vervanger in om namens jou rapporten goed te keuren terwijl je afwezig bent.`,
        vacationDelegateError: 'Er is een fout opgetreden bij het bijwerken van je vervanger voor vakantie.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `als de vervanger tijdens de vakantie van ${nameOrEmail}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) =>
            `aan ${submittedToName} als vervangende gemachtigde voor ${vacationDelegateName} tijdens vakantie`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Je wijst ${nameOrEmail} aan als je vervang(st)er tijdens je vakantie. Ze zitten nog niet in al je werkruimtes. Als je doorgaat, wordt er een e-mail naar alle beheerders van je werkruimtes gestuurd om hen toe te voegen.`,
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
        manuallyAdd: 'Je bankrekening handmatig toevoegen',
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
        toGetStarted: 'Voeg een bankrekening toe om onkosten terug te betalen, Expensify Cards uit te geven, factuurbetalingen te innen en rekeningen te betalen, allemaal vanaf één plek.',
        plaidBodyCopy: 'Geef je medewerkers een eenvoudigere manier om bedrijfskosten te betalen – en terugbetaald te worden.',
        checkHelpLine: 'Je vindt je routeringsnummer en rekeningnummer op een cheque voor de rekening.',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Om een bankrekening te koppelen, <a href="${contactMethodRoute}">voeg je eerst een e-mailadres toe als je primaire login</a> en probeer je het daarna opnieuw. Je kunt je telefoonnummer toevoegen als secundaire login.`,
        hasBeenThrottledError: 'Er is een fout opgetreden bij het toevoegen van je bankrekening. Wacht een paar minuten en probeer het opnieuw.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Oeps! Het lijkt erop dat de valuta van je werkruimte is ingesteld op een andere valuta dan USD. Ga naar <a href="${workspaceRoute}">je werkruimte-instellingen</a>, stel deze in op USD en probeer het opnieuw.`,
        bbaAdded: 'Zakelijke bankrekening toegevoegd!',
        bbaAddedDescription: 'Hij is klaar om voor betalingen te worden gebruikt.',
        error: {
            youNeedToSelectAnOption: 'Selecteer een optie om verder te gaan',
            noBankAccountAvailable: 'Sorry, er is geen bankrekening beschikbaar',
            noBankAccountSelected: 'Kies een account',
            taxID: 'Voer een geldig btw-identificatienummer in',
            website: 'Voer een geldige website in',
            zipCode: `Voer een geldige postcode in met het volgende formaat: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Voer een geldig telefoonnummer in',
            email: 'Voer een geldig e-mailadres in',
            companyName: 'Voer een geldige bedrijfsnaam in',
            addressCity: 'Voer een geldige stad in',
            addressStreet: 'Voer een geldig straatadres in',
            addressState: 'Selecteer een geldige staat',
            incorporationDateFuture: 'Datum van oprichting kan niet in de toekomst liggen',
            incorporationState: 'Selecteer een geldige staat',
            industryCode: 'Voer een geldige bedrijfstakcode met zes cijfers in',
            restrictedBusiness: 'Bevestig dat het bedrijf niet op de lijst met beperkte bedrijven staat',
            routingNumber: 'Voer een geldig routeringsnummer in',
            accountNumber: 'Voer een geldig rekeningnummer in',
            routingAndAccountNumberCannotBeSame: 'Routing- en rekeningnummers mogen niet hetzelfde zijn',
            companyType: 'Selecteer een geldig bedrijftype',
            tooManyAttempts: 'Vanwege een groot aantal inlogpogingen is deze optie voor 24 uur uitgeschakeld. Probeer het later opnieuw of voer de gegevens handmatig in.',
            address: 'Voer een geldig adres in',
            dob: 'Selecteer een geldige geboortedatum',
            age: 'Moet ouder dan 18 jaar zijn',
            ssnLast4: 'Voer de geldige laatste 4 cijfers van het BSN in',
            firstName: 'Voer een geldige voornaam in',
            lastName: 'Voer een geldige achternaam in',
            noDefaultDepositAccountOrDebitCardAvailable: 'Voeg een standaardstortingsrekening of betaalpas toe',
            validationAmounts: 'De verificatiebedragen die je hebt ingevoerd zijn onjuist. Controleer je bankafschrift nogmaals en probeer het opnieuw.',
            fullName: 'Voer een geldige volledige naam in',
            ownershipPercentage: 'Voer een geldig percentage in',
            deletePaymentBankAccount:
                'Deze bankrekening kan niet worden verwijderd omdat deze wordt gebruikt voor Expensify Card-betalingen. Als je deze rekening toch wilt verwijderen, neem dan contact op met Concierge.',
            sameDepositAndWithdrawalAccount: 'De stortings- en opname­rekeningen zijn hetzelfde.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Waar bevindt zich je bankrekening?',
        accountDetailsStepHeader: 'Wat zijn je accountgegevens?',
        accountTypeStepHeader: 'Wat voor type account is dit?',
        bankInformationStepHeader: 'Wat zijn je bankgegevens?',
        accountHolderInformationStepHeader: 'Wat zijn de gegevens van de rekeninghouder?',
        howDoWeProtectYourData: 'Hoe beschermen we jouw gegevens?',
        currencyHeader: 'Wat is de valuta van je bankrekening?',
        confirmationStepHeader: 'Controleer je gegevens.',
        confirmationStepSubHeader: 'Controleer de onderstaande gegevens en vink het vakje met de voorwaarden aan om te bevestigen.',
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
        failedToLoadPDF: 'Laden van PDF-bestand mislukt',
        pdfPasswordForm: {
            title: 'Met wachtwoord beveiligde PDF',
            infoText: 'Deze PDF is met een wachtwoord beveiligd.',
            beforeLinkText: 'Alsjeblieft',
            linkText: 'voer het wachtwoord in',
            afterLinkText: 'te bekijken.',
            formLabel: 'PDF bekijken',
        },
        attachmentNotFound: 'Bijlage niet gevonden',
        retry: 'Opnieuw proberen',
    },
    messages: {
        errorMessageInvalidPhone: `Voer een geldig telefoonnummer in zonder haakjes of streepjes. Als je buiten de VS bent, voeg dan je landcode toe (bijv. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Ongeldig e-mailadres',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} is al lid van ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} is al een beheerder van ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Door verder te gaan met het verzoek om je Expensify Wallet te activeren, bevestig je dat je het volgende hebt gelezen, begrepen en geaccepteerd',
        facialScan: 'Onfido’s beleid en toestemmingsverklaring voor gezichtsherkenning',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido’s beleid en toestemming voor gezichtsherkenning</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacybeleid</a> en <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Servicevoorwaarden</a>.</muted-text-micro>`,
        tryAgain: 'Probeer het opnieuw',
        verifyIdentity: 'Identiteit verifiëren',
        letsVerifyIdentity: 'Laten we je identiteit verifiëren',
        butFirst: `Maar eerst het saaie gedeelte. Lees de juridische tekst in de volgende stap en klik op “Accepteren” wanneer je er klaar voor bent.`,
        genericError: 'Er is een fout opgetreden bij het verwerken van deze stap. Probeer het opnieuw.',
        cameraPermissionsNotGranted: 'Camera-toegang inschakelen',
        cameraRequestMessage: 'We hebben toegang tot je camera nodig om de verificatie van je bankrekening te voltooien. Schakel dit in via Instellingen > New Expensify.',
        microphonePermissionsNotGranted: 'Microfoontoegang inschakelen',
        microphoneRequestMessage: 'We hebben toegang tot je microfoon nodig om de verificatie van je bankrekening te voltooien. Schakel dit in via Instellingen > New Expensify.',
        originalDocumentNeeded: 'Upload alstublieft een originele foto van uw identiteitsbewijs in plaats van een screenshot of gescande afbeelding.',
        documentNeedsBetterQuality:
            'Uw identiteitsbewijs lijkt beschadigd te zijn of mist beveiligingskenmerken. Upload alstublieft een originele afbeelding van een onbeschadigd identiteitsbewijs dat volledig zichtbaar is.',
        imageNeedsBetterQuality:
            'Er is een probleem met de beeldkwaliteit van je identiteitsbewijs. Upload alsjeblieft een nieuwe afbeelding waarop je volledige identiteitsbewijs duidelijk te zien is.',
        selfieIssue: 'Er is een probleem met je selfie/video. Upload alsjeblieft een live selfie/video.',
        selfieNotMatching: 'Je selfie/video komt niet overeen met je ID. Upload een nieuwe selfie/video waarop je gezicht duidelijk zichtbaar is.',
        selfieNotLive: 'Je selfie/video lijkt geen live foto/video te zijn. Upload een live selfie/video.',
    },
    additionalDetailsStep: {
        headerTitle: 'Aanvullende details',
        helpText: 'We moeten de volgende informatie bevestigen voordat je geld kunt versturen en ontvangen met je wallet.',
        helpTextIdologyQuestions: 'We moeten je nog een paar vragen stellen om het verifiëren van je identiteit af te ronden.',
        helpLink: 'Lees meer over waarom we dit nodig hebben.',
        legalFirstNameLabel: 'Wettelijke voornaam',
        legalMiddleNameLabel: 'Juridische tweede voornaam',
        legalLastNameLabel: 'Officiële achternaam',
        selectAnswer: 'Selecteer een antwoord om verder te gaan',
        ssnFull9Error: 'Voer een geldig sofinummer van negen cijfers in',
        needSSNFull9: 'We hebben problemen met het verifiëren van je SSN. Voer de volledige negen cijfers van je SSN in.',
        weCouldNotVerify: 'We konden dit niet verifiëren',
        pleaseFixIt: 'Corrigeer deze informatie voordat je verdergaat',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `We konden je identiteit niet verifiëren. Probeer het later opnieuw of neem contact op met <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> als je vragen hebt.`,
    },
    termsStep: {
        headerTitle: 'Voorwaarden en kosten',
        headerTitleRefactor: 'Kosten en voorwaarden',
        haveReadAndAgreePlain: 'Ik heb gelezen en ga akkoord met het ontvangen van elektronische verklaringen.',
        haveReadAndAgree: `Ik heb gelezen en ga ermee akkoord om <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">elektronische bekendmakingen</a> te ontvangen.`,
        agreeToThePlain: 'Ik ga akkoord met de Privacy- en Walletovereenkomst.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacyverklaring</a> en de <a href="${walletAgreementUrl}">walletovereenkomst</a>.`,
        enablePayments: 'Betalingen inschakelen',
        monthlyFee: 'Maandelijkse vergoeding',
        inactivity: 'Inactiviteit',
        noOverdraftOrCredit: 'Geen roodstand-/kredietfunctie.',
        electronicFundsWithdrawal: 'Elektronische fondsenafschrijving',
        standard: 'Standaard',
        reviewTheFees: 'Bekijk enkele kosten.',
        checkTheBoxes: 'Vink de onderstaande vakjes aan.',
        agreeToTerms: 'Ga akkoord met de voorwaarden en je bent helemaal klaar!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `De Expensify Wallet wordt uitgegeven door ${walletProgram}.`,
            perPurchase: 'Per aankoop',
            atmWithdrawal: 'Geldopname bij geldautomaat',
            cashReload: 'Contant opwaarderen',
            inNetwork: 'binnen netwerk',
            outOfNetwork: 'buiten netwerk',
            atmBalanceInquiry: 'Saldo-opvraag bij geldautomaat (binnen of buiten het netwerk)',
            customerService: 'Klantenservice (geautomatiseerd of live medewerker)',
            inactivityAfterTwelveMonths: 'Inactiviteit (na 12 maanden zonder transacties)',
            weChargeOneFee: 'We brengen 1 ander type vergoeding in rekening. Dat is:',
            fdicInsurance: 'Uw geld komt in aanmerking voor FDIC-verzekering.',
            generalInfo: `Ga voor algemene informatie over prepaidrekeningen naar <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Ga voor details en voorwaarden voor alle vergoedingen en diensten naar <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> of bel +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektronische fondsenafschrijving (direct)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min. ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Een lijst met alle Expensify Wallet-kosten',
            typeOfFeeHeader: 'Alle kosten',
            feeAmountHeader: 'Bedrag',
            moreDetailsHeader: 'Details',
            openingAccountTitle: 'Een rekening openen',
            openingAccountDetails: 'Er zijn geen kosten om een rekening te openen.',
            monthlyFeeDetails: 'Er zijn geen maandelijkse kosten.',
            customerServiceTitle: 'Klantendienst',
            customerServiceDetails: 'Er zijn geen kosten voor klantenservice.',
            inactivityDetails: 'Er is geen inactiviteitskosten.',
            sendingFundsTitle: 'Geld verzenden naar een andere rekeninghouder',
            sendingFundsDetails: 'Er zijn geen kosten verbonden aan het verzenden van geld naar een andere rekeninghouder met je saldo, bankrekening of betaalpas.',
            electronicFundsStandardDetails:
                'Er zijn geen kosten verbonden aan het overboeken van geld van je Expensify Wallet naar je bankrekening met de standaardoptie. Deze overboeking wordt meestal binnen 1–3 werkdagen voltooid.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Er zijn kosten verbonden aan het overboeken van geld van je Expensify Wallet naar je gekoppelde debitcard met de optie voor directe overboeking. Deze overboeking wordt meestal binnen enkele minuten voltooid.' +
                `De vergoeding is ${percentage}% van het over te maken bedrag (met een minimumvergoeding van ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Je middelen komen in aanmerking voor FDIC-verzekering. Je middelen worden aangehouden bij of overgemaakt naar ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, een door de FDIC verzekerde instelling.` +
                `Zodra ze daar zijn, zijn je gelden verzekerd tot ${amount} door de FDIC als ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} failliet gaat, mits aan de specifieke vereisten voor depositoverzekering is voldaan en je kaart is geregistreerd. Zie ${CONST.TERMS.FDIC_PREPAID} voor meer details.`,
            contactExpensifyPayments: `Neem contact op met ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} door te bellen naar +1 833-400-0904, een e-mail te sturen naar ${CONST.EMAIL.CONCIERGE} of meld je aan op ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Ga voor algemene informatie over prepaidrekeningen naar ${CONST.TERMS.CFPB_PREPAID}. Als je een klacht hebt over een prepaidrekening, bel dan het Consumer Financial Protection Bureau op 1-855-411-2372 of ga naar ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Bekijk printervriendelijke versie',
            automated: 'Geautomatiseerd',
            liveAgent: 'Live agent',
            instant: 'Direct',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min. ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Betalingen inschakelen',
        activatedTitle: 'Wallet geactiveerd!',
        activatedMessage: 'Gefeliciteerd, je wallet is ingesteld en klaar om betalingen te doen.',
        checkBackLaterTitle: 'Een ogenblikje...',
        checkBackLaterMessage: 'We beoordelen je gegevens nog. Kom later terug om het opnieuw te proberen.',
        continueToPayment: 'Doorgaan naar betaling',
        continueToTransfer: 'Doorgaan met overboeken',
    },
    companyStep: {
        headerTitle: 'Bedrijfsgegevens',
        subtitle: 'Bijna klaar! Voor de veiligheid moeten we enkele gegevens bevestigen:',
        legalBusinessName: 'Wettelijke bedrijfsnaam',
        companyWebsite: 'Bedrijfswebsite',
        taxIDNumber: 'Btw-nummer',
        taxIDNumberPlaceholder: '9 cijfers',
        companyType: 'Bedrijfstype',
        incorporationDate: 'Oprichtingsdatum',
        incorporationState: 'Oprichtingsstaat',
        industryClassificationCode: 'Industrieclassificatiecode',
        confirmCompanyIsNot: 'Ik bevestig dat dit bedrijf niet op de',
        listOfRestrictedBusinesses: 'lijst met verboden bedrijven',
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
        industryClassificationCodePlaceholder: 'Zoek naar brancheclassificatiecode',
    },
    requestorStep: {
        headerTitle: 'Persoonlijke gegevens',
        learnMore: 'Meer informatie',
        isMyDataSafe: 'Zijn mijn gegevens veilig?',
    },
    personalInfoStep: {
        personalInfo: 'Persoonlijke gegevens',
        enterYourLegalFirstAndLast: 'Wat is je wettelijke naam?',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Officiële achternaam',
        legalName: 'Juridische naam',
        enterYourDateOfBirth: 'Wat is je geboortedatum?',
        enterTheLast4: 'Wat zijn de laatste vier cijfers van uw burgerservicenummer (BSN)?',
        dontWorry: 'Maak je geen zorgen, we doen geen persoonlijke kredietcontroles!',
        last4SSN: 'Laatste 4 van SSN',
        enterYourAddress: 'Wat is je adres?',
        address: 'Adres',
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        byAddingThisBankAccount: 'Door deze bankrekening toe te voegen, bevestig je dat je hebt gelezen, begrijpt en accepteert',
        whatsYourLegalName: 'Wat is je officiële naam?',
        whatsYourDOB: 'Wat is je geboortedatum?',
        whatsYourAddress: 'Wat is je adres?',
        whatsYourSSN: 'Wat zijn de laatste vier cijfers van uw burgerservicenummer (BSN)?',
        noPersonalChecks: 'Geen zorgen, hier worden geen persoonlijke kredietcontroles uitgevoerd!',
        whatsYourPhoneNumber: 'Wat is je telefoonnummer?',
        weNeedThisToVerify: 'Dit hebben we nodig om je wallet te verifiëren.',
    },
    businessInfoStep: {
        businessInfo: 'Bedrijfsgegevens',
        enterTheNameOfYourBusiness: 'Wat is de naam van je bedrijf?',
        businessName: 'Wettelijke bedrijfsnaam',
        enterYourCompanyTaxIdNumber: 'Wat is het btw-identificatienummer van uw bedrijf?',
        taxIDNumber: 'Btw-nummer',
        taxIDNumberPlaceholder: '9 cijfers',
        enterYourCompanyWebsite: 'Wat is de website van je bedrijf?',
        companyWebsite: 'Bedrijfswebsite',
        enterYourCompanyPhoneNumber: 'Wat is het telefoonnummer van je bedrijf?',
        enterYourCompanyAddress: 'Wat is het adres van jouw bedrijf?',
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
        incorporationState: 'Oprichtingsstaat',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In welke staat is uw bedrijf opgericht?',
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        companyAddress: 'Bedrijfsadres',
        listOfRestrictedBusinesses: 'lijst met verboden bedrijven',
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
        whereWasTheBusinessIncorporated: 'Waar is het bedrijf opgericht?',
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
                    return 'EU-btw';
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
        selectIncorporationType: 'Selecteer type rechtsvorm',
        selectBusinessCategory: 'Selecteer bedrijfscategorie',
        selectAnnualPaymentVolume: 'Selecteer jaarlijks betaalvolume',
        selectIncorporationCountry: 'Selecteer vestigingsland',
        selectIncorporationState: 'Kies oprichtingsstaat',
        selectAverageReimbursement: 'Selecteer gemiddelde terugbetalingsbedrag',
        selectBusinessType: 'Selecteer type bedrijf',
        findIncorporationType: 'Rechtsvorm zoeken',
        findBusinessCategory: 'Zakelijke categorie zoeken',
        findAnnualPaymentVolume: 'Vind jaarlijks betalingsvolume',
        findIncorporationState: 'Vind oprichtingsstaat',
        findAverageReimbursement: 'Gemiddeld bedrag van terugbetaling vinden',
        findBusinessType: 'Zoek bedrijfstype',
        error: {
            registrationNumber: 'Geef een geldig registratienummer op',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Geef een geldig werkgeversidentificatienummer (EIN) op';
                    case CONST.COUNTRY.CA:
                        return 'Voer een geldig bedrijfsnummer (BN) in';
                    case CONST.COUNTRY.GB:
                        return 'Geef een geldig btw-registratienummer (VRN) op';
                    case CONST.COUNTRY.AU:
                        return 'Geef een geldig Australisch bedrijfsnummer (ABN) op';
                    default:
                        return 'Voer een geldig EU-btw-nummer in';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `Bent u voor 25% of meer eigenaar van ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `Bezitten een of meer personen 25% of meer van ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Zijn er meer personen die 25% of meer van ${companyName} bezitten?`,
        regulationRequiresUsToVerifyTheIdentity: 'Volgens de regelgeving moeten wij de identiteit verifiëren van iedere persoon die meer dan 25% van het bedrijf bezit.',
        companyOwner: 'Eigenaar van bedrijf',
        enterLegalFirstAndLastName: 'Wat is de juridische naam van de eigenaar?',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Officiële achternaam',
        enterTheDateOfBirthOfTheOwner: 'Wat is de geboortedatum van de eigenaar?',
        enterTheLast4: 'Wat zijn de laatste 4 cijfers van het sofinummer van de eigenaar?',
        last4SSN: 'Laatste 4 van SSN',
        dontWorry: 'Maak je geen zorgen, we doen geen persoonlijke kredietcontroles!',
        enterTheOwnersAddress: 'Wat is het adres van de eigenaar?',
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        legalName: 'Juridische naam',
        address: 'Adres',
        byAddingThisBankAccount: 'Door deze bankrekening toe te voegen, bevestig je dat je hebt gelezen, begrijpt en accepteert',
        owners: 'Eigenaren',
    },
    ownershipInfoStep: {
        ownerInfo: 'Eigenaarsgegevens',
        businessOwner: 'Eigenaar van bedrijf',
        signerInfo: 'Info ondertekenaar',
        doYouOwn: (companyName: string) => `Bent u voor 25% of meer eigenaar van ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `Bezitten een of meer personen 25% of meer van ${companyName}?`,
        regulationsRequire: 'Regelgeving verplicht ons de identiteit te verifiëren van iedere persoon die meer dan 25% van het bedrijf bezit.',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Officiële achternaam',
        whatsTheOwnersName: 'Wat is de juridische naam van de eigenaar?',
        whatsYourName: 'Wat is je wettelijke naam?',
        whatPercentage: 'Welk percentage van het bedrijf is eigendom van de eigenaar?',
        whatsYoursPercentage: 'Welk percentage van het bedrijf bezit je?',
        ownership: 'Eigendom',
        whatsTheOwnersDOB: 'Wat is de geboortedatum van de eigenaar?',
        whatsYourDOB: 'Wat is je geboortedatum?',
        whatsTheOwnersAddress: 'Wat is het adres van de eigenaar?',
        whatsYourAddress: 'Wat is je adres?',
        whatAreTheLast: 'Wat zijn de laatste 4 cijfers van het burgerservicenummer (BSN) van de eigenaar?',
        whatsYourLast: 'Wat zijn de laatste 4 cijfers van uw sofinummer?',
        whatsYourNationality: 'Wat is je nationaliteit?',
        whatsTheOwnersNationality: 'Wat is het land waarvan de eigenaar staatsburger is?',
        countryOfCitizenship: 'Land van nationaliteit',
        dontWorry: 'Maak je geen zorgen, we doen geen persoonlijke kredietcontroles!',
        last4: 'Laatste 4 van SSN',
        whyDoWeAsk: 'Waarom vragen we dit?',
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        legalName: 'Juridische naam',
        ownershipPercentage: 'Eigendomspercentage',
        areThereOther: (companyName: string) => `Zijn er andere personen die 25% of meer van ${companyName} bezitten?`,
        owners: 'Eigenaren',
        addCertified: 'Voeg een gecertificeerd organisatieschema toe dat de uiteindelijk belanghebbenden toont',
        regulationRequiresChart:
            'Vanwege regelgeving moeten we een gewaarmerkte kopie van het eigendomsdiagram verzamelen waarop elke persoon of entiteit staat die 25% of meer van het bedrijf bezit.',
        uploadEntity: 'Organigram van entiteit uploaden',
        noteEntity: 'Let op: Het eigendomsdiagram van de entiteit moet worden ondertekend door uw accountant, juridisch adviseur of notarieel worden bekrachtigd.',
        certified: 'Gecertificeerde eigendomsstructuur van entiteit',
        selectCountry: 'Selecteer land',
        findCountry: 'Land zoeken',
        address: 'Adres',
        chooseFile: 'Bestand kiezen',
        uploadDocuments: 'Extra documentatie uploaden',
        pleaseUpload: 'Upload hieronder extra documentatie om ons te helpen uw identiteit te verifiëren als directe of indirecte eigenaar van 25% of meer van de bedrijfsentiteit.',
        acceptedFiles: 'Geaccepteerde bestandsindelingen: PDF, PNG, JPEG. De totale bestandsgrootte per sectie mag niet groter zijn dan 5 MB.',
        proofOfBeneficialOwner: 'Bewijs van uiteindelijk belanghebbende',
        proofOfBeneficialOwnerDescription:
            'Lever een ondertekende verklaring en een organigram aan van een openbaar accountant, notaris of advocaat waarin wordt bevestigd wie 25% of meer van het bedrijf bezit. Deze moet gedateerd zijn binnen de laatste drie maanden en het licentienummer van de ondertekenaar bevatten.',
        copyOfID: 'Kopie van ID voor uiteindelijk belanghebbende',
        copyOfIDDescription: 'Voorbeelden: paspoort, rijbewijs, enz.',
        proofOfAddress: 'Adresbewijs voor uiteindelijk belanghebbende',
        proofOfAddressDescription: 'Voorbeelden: elektriciteitsrekening, huurovereenkomst, enz.',
        codiceFiscale: 'Codice fiscale/belastingnummer',
        codiceFiscaleDescription:
            'Upload een video van een bezoek op locatie of een opgenomen gesprek met de tekenbevoegde functionaris. De functionaris moet het volgende verstrekken: volledige naam, geboortedatum, bedrijfsnaam, registratienummer, fiscaal nummer, statutaire zetel, aard van de bedrijfsactiviteiten en het doel van de rekening.',
    },
    completeVerificationStep: {
        completeVerification: 'Verificatie voltooien',
        confirmAgreements: 'Bevestig de onderstaande overeenkomsten.',
        certifyTrueAndAccurate: 'Ik verklaar dat de verstrekte informatie juist en nauwkeurig is',
        certifyTrueAndAccurateError: 'Bevestig alstublieft dat de informatie waar en juist is',
        isAuthorizedToUseBankAccount: 'Ik ben gemachtigd om deze zakelijke bankrekening te gebruiken voor zakelijke uitgaven',
        isAuthorizedToUseBankAccountError: 'Je moet een leidinggevende functionaris zijn met toestemming om de zakelijke bankrekening te beheren',
        termsAndConditions: 'algemene voorwaarden',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Valideer je bankrekening',
        validateButtonText: 'Valideren',
        validationInputLabel: 'Transactie',
        maxAttemptsReached: 'Validatie voor deze bankrekening is uitgeschakeld vanwege te veel onjuiste pogingen.',
        description: `Binnen 1–2 werkdagen sturen we drie (3) kleine transacties naar je bankrekening vanaf een naam zoals “Expensify, Inc. Validation”.`,
        descriptionCTA: 'Voer hieronder bij elke transactie het bedrag in. Voorbeeld: 1.51.',
        letsChatText: 'Bijna klaar! We hebben je hulp nodig om nog een paar laatste gegevens via de chat te bevestigen. Klaar?',
        enable2FATitle: 'Voorkom fraude, schakel tweefactorauthenticatie (2FA) in',
        enable2FAText: 'We nemen je veiligheid serieus. Stel nu 2FA in om een extra beveiligingslaag aan je account toe te voegen.',
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
        signerInfo: 'Info ondertekenaar',
        areYouDirector: (companyName: string) => `Bent u een bestuurder bij ${companyName}?`,
        regulationRequiresUs: 'Volgens de regelgeving moeten wij verifiëren of de ondertekenaar bevoegd is om deze handeling namens het bedrijf uit te voeren.',
        whatsYourName: 'Wat is je wettelijke naam',
        fullName: 'Volledige juridische naam',
        whatsYourJobTitle: 'Wat is je functietitel?',
        jobTitle: 'Functietitel',
        whatsYourDOB: 'Wat is je geboortedatum?',
        uploadID: 'Identiteitsbewijs en adresbewijs uploaden',
        personalAddress: 'Bewijs van privéadres (bijv. energierekening)',
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        legalName: 'Juridische naam',
        proofOf: 'Bewijs van privéadres',
        enterOneEmail: (companyName: string) => `Voer het e-mailadres in van een directeur bij ${companyName}`,
        regulationRequiresOneMoreDirector: 'Volgens de regelgeving is er ten minste één extra bestuurder als ondertekenaar vereist.',
        hangTight: 'Even geduld...',
        enterTwoEmails: (companyName: string) => `Voer de e-mailadressen in van twee directeuren bij ${companyName}`,
        sendReminder: 'Verstuur een herinnering',
        chooseFile: 'Bestand kiezen',
        weAreWaiting: 'We wachten tot anderen hun identiteit hebben bevestigd als directeuren van het bedrijf.',
        id: 'Kopie van ID',
        proofOfDirectors: 'Bewijs van directeur(s)',
        proofOfDirectorsDescription: 'Voorbeelden: Oncorp bedrijfsprofiel of bedrijfsregistratie.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale voor ondertekenaars, gemachtigde gebruikers en uiteindelijk belanghebbenden.',
        PDSandFSG: 'PDS- en FSG-informatiedocumenten',
        PDSandFSGDescription: dedent(`
            Onze samenwerking met Corpay maakt gebruik van een API-koppeling om hun uitgebreide netwerk van internationale bankpartners te benutten voor het mogelijk maken van wereldwijde terugbetalingen in Expensify. Conform de Australische regelgeving verstrekken wij je hierbij de Financial Services Guide (FSG) en de Product Disclosure Statement (PDS) van Corpay.

            Lees de FSG- en PDS-documenten zorgvuldig door, omdat ze volledige details en belangrijke informatie bevatten over de producten en diensten die Corpay aanbiedt. Bewaar deze documenten voor toekomstig gebruik.
        `),
        pleaseUpload: 'Upload hieronder extra documenten zodat we uw identiteit als directeur van het bedrijf kunnen verifiëren.',
        enterSignerInfo: 'Voer ondertekenaargegevens in',
        thisStep: 'Deze stap is voltooid',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `verbindt een zakelijke ${currency}-bankrekening die eindigt op ${bankAccountLastFour} met Expensify om werknemers in ${currency} te betalen. De volgende stap vereist ondertekenaarsgegevens van een directeur.`,
        error: {
            emailsMustBeDifferent: 'E-mails moeten verschillend zijn',
        },
    },
    agreementsStep: {
        agreements: 'Overeenkomsten',
        pleaseConfirm: 'Bevestig de onderstaande overeenkomsten',
        regulationRequiresUs: 'Volgens de regelgeving moeten wij de identiteit verifiëren van iedere persoon die meer dan 25% van het bedrijf bezit.',
        iAmAuthorized: 'Ik ben gemachtigd om de zakelijke bankrekening te gebruiken voor zakelijke uitgaven.',
        iCertify: 'Ik verklaar dat de verstrekte informatie waarheidsgetrouw en juist is.',
        iAcceptTheTermsAndConditions: `Ik accepteer de <a href="https://cross-border.corpay.com/tc/">algemene voorwaarden</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Ik ga akkoord met de algemene voorwaarden.',
        accept: 'Accepteren en bankrekening toevoegen',
        iConsentToThePrivacyNotice: 'Ik ga akkoord met de <a href="https://payments.corpay.com/compliance">privacyverklaring</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Ik ga akkoord met de privacyverklaring.',
        error: {
            authorized: 'Je moet een leidinggevende functionaris zijn met toestemming om de zakelijke bankrekening te beheren',
            certify: 'Bevestig alstublieft dat de informatie waar en juist is',
            consent: 'Ga akkoord met de privacyverklaring',
        },
    },
    docusignStep: {
        subheader: 'DocuSign-formulier',
        pleaseComplete:
            'Vul het ACH-machtigingsformulier in via de onderstaande Docusign-link en upload de ondertekende versie hier, zodat we rechtstreeks geld van je bankrekening kunnen afschrijven',
        pleaseCompleteTheBusinessAccount: 'Rond de aanvraag voor een zakelijke rekening met automatische incasso af',
        pleaseCompleteTheDirect:
            'Voltooi de automatische-incassoregeling via de DocuSign-link hieronder en upload daarna de ondertekende versie hier, zodat we rechtstreeks geld van je bankrekening kunnen afschrijven.',
        takeMeTo: 'Breng me naar Docusign',
        uploadAdditional: 'Extra documentatie uploaden',
        pleaseUpload: 'Upload het DEFT-formulier en de Docusign-handtekeningenpagina',
        pleaseUploadTheDirect: 'Upload de doorlopende-machtigingsovereenkomst en de DocuSign-handtekeningenpagina',
    },
    finishStep: {
        letsFinish: 'Laten we het in de chat afronden!',
        thanksFor:
            'Bedankt voor deze details. Een toegewijde supportmedewerker zal je informatie nu beoordelen. We nemen opnieuw contact met je op als we nog iets van je nodig hebben, maar neem intussen gerust contact met ons op als je vragen hebt.',
        iHaveA: 'Ik heb een vraag',
        enable2FA: 'Schakel twee-factor-authenticatie (2FA) in om fraude te voorkomen',
        weTake: 'We nemen je veiligheid serieus. Stel nu 2FA in om een extra beveiligingslaag aan je account toe te voegen.',
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
        bookADemo: 'Boek een demo',
        toLearnMore: 'voor meer informatie.',
        termsAndConditions: {
            header: 'Voordat we verdergaan...',
            title: 'Voorwaarden',
            label: 'Ik ga akkoord met de algemene voorwaarden',
            subtitle: `Ga akkoord met de Expensify Travel-<a href="${CONST.TRAVEL_TERMS_URL}">voorwaarden</a>.`,
            error: 'U moet akkoord gaan met de Expensify Travel-voorwaarden om door te gaan',
            defaultWorkspaceError:
                'Je moet een standaardwerkruimte instellen om Expensify Travel in te schakelen. Ga naar Instellingen > Werkruimtes > klik op de drie verticale puntjes naast een werkruimte > Stel in als standaardwerkruimte en probeer het daarna opnieuw!',
        },
        flight: 'Vlucht',
        flightDetails: {
            passenger: 'Passagier',
            layover: (layover: string) => `<muted-text-label>Je hebt een <strong>${layover} overstap</strong> vóór deze vlucht</muted-text-label>`,
            takeOff: 'Vertrek',
            landing: 'Landingspagina',
            seat: 'Stoel',
            class: 'Reisklasse',
            recordLocator: 'Reserveringscode',
            cabinClasses: {
                unknown: 'Onbekend',
                economy: 'Economy',
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
            fareDetails: 'Tarievengegevens',
            confirmation: 'Bevestigingsnummer',
        },
        viewTrip: 'Reis bekijken',
        modifyTrip: 'Reis wijzigen',
        tripSupport: 'Reisondersteuning',
        tripDetails: 'Reisdetails',
        viewTripDetails: 'Reisdetails bekijken',
        trip: 'Reis',
        trips: 'Reizen',
        tripSummary: 'Reisoverzicht',
        departs: 'Vertrekt',
        errorMessage: 'Er is iets misgegaan. Probeer het later opnieuw.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>Voeg alsjeblieft een werk-e-mailadres toe als je primaire login via <a href="${phoneErrorMethodsRoute}">een werk-e-mailadres als primaire login toevoegen</a> om reizen te boeken.</rbr>`,
        domainSelector: {
            title: 'Domein',
            subtitle: 'Kies een domein voor de configuratie van Expensify Travel.',
            recommended: 'Aanbevolen',
        },
        domainPermissionInfo: {
            title: 'Domein',
            restriction: (domain: string) =>
                `Je hebt geen toestemming om Expensify Travel in te schakelen voor het domein <strong>${domain}</strong>. Vraag iemand van dat domein om Travel in te schakelen.`,
            accountantInvitation: `Als je accountant bent, overweeg dan om je aan te sluiten bij het <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! accountantsprogramma</a> om reizen voor dit domein in te schakelen.`,
        },
        publicDomainError: {
            title: 'Aan de slag met Expensify Travel',
            message: `Je moet je zakelijke e-mailadres (bijv. naam@bedrijf.com) gebruiken met Expensify Travel, niet je persoonlijke e-mailadres (bijv. naam@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel is uitgeschakeld',
            message: `Je/jouw beheerder heeft Expensify Travel uitgeschakeld. Volg het boekingsbeleid van je/jouw bedrijf voor reisregelingen.`,
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
                `Uw vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate}} is door de luchtvaartmaatschappij geannuleerd.`,
            flightScheduleChangePending: (airlineCode: string) =>
                `De luchtvaartmaatschappij heeft een wijziging in de dienstregeling voorgesteld voor vlucht ${airlineCode}; we wachten op bevestiging.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Wijziging in schema bevestigd: vlucht ${airlineCode} vertrekt nu om ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Je vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is bijgewerkt.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Je cabineklasse is bijgewerkt naar ${cabinClass} op vlucht ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `Uw stoeltoewijzing op vlucht ${airlineCode} is bevestigd.`,
            flightSeatChanged: (airlineCode: string) => `Uw stoeltoewijzing op vlucht ${airlineCode} is gewijzigd.`,
            flightSeatCancelled: (airlineCode: string) => `Je stoeltoewijzing op vlucht ${airlineCode} is verwijderd.`,
            paymentDeclined: 'Betaling voor je vluchtboeking is mislukt. Probeer het opnieuw.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Je hebt je ${type}-reservering ${id} geannuleerd.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `De leverancier heeft je ${type}reservering ${id} geannuleerd.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Je ${type}-reservering is opnieuw geboekt. Nieuwe bevestiging nr.: ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Je ${type}-boeking is bijgewerkt. Bekijk de nieuwe details in de reisroute.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Je treinkaartje voor ${origin} → ${destination} op ${startDate} is terugbetaald. Er wordt een tegoed verwerkt.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Je treinticket voor ${origin} → ${destination} op ${startDate} is omgewisseld.`,
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
            workspace: 'Workspace',
            findWorkspace: 'Werkruimte zoeken',
            edit: 'Werkruimte bewerken',
            enabled: 'Ingeschakeld',
            disabled: 'Uitgeschakeld',
            everyone: 'Iedereen',
            delete: 'Werkruimte verwijderen',
            settings: 'Instellingen',
            reimburse: 'Terugbetalingen',
            categories: 'Categorieën',
            tags: 'Tags',
            customField1: 'Aangepast veld 1',
            customField2: 'Aangepast veld 2',
            customFieldHint: 'Voeg aangepaste codering toe die geldt voor alle uitgaven van dit lid.',
            reports: 'Rapporten',
            reportFields: 'Rapportvelden',
            reportTitle: 'Rapporttitel',
            reportField: 'Rapportveld',
            taxes: 'Belastingen',
            bills: 'Rekeningen',
            invoices: 'Facturen',
            perDiem: 'Dagvergoeding',
            travel: 'Reizen',
            members: 'Leden',
            accounting: 'Boekhouding',
            receiptPartners: 'Bonnetjespartners',
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
            settlementFrequency: 'Frequentie van afwikkeling',
            setAsDefault: 'Instellen als standaardwerkruimte',
            defaultNote: `Bonnetjes die naar ${CONST.EMAIL.RECEIPTS} worden gestuurd, verschijnen in deze workspace.`,
            deleteConfirmation: 'Weet je zeker dat je deze workspace wilt verwijderen?',
            deleteWithCardsConfirmation: 'Weet je zeker dat je deze workspace wilt verwijderen? Hierdoor worden alle kaartfeeds en toegewezen kaarten verwijderd.',
            unavailable: 'Werkruimte niet beschikbaar',
            memberNotFound: 'Lid niet gevonden. Gebruik de uitnodigingsknop hierboven om een nieuw lid aan de werkruimte toe te voegen.',
            notAuthorized: `Je hebt geen toegang tot deze pagina. Als je probeert lid te worden van deze werkruimte, vraag dan gewoon de eigenaar van de werkruimte om je als lid toe te voegen. Iets anders aan de hand? Neem contact op met ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Ga naar werkruimte',
            duplicateWorkspace: 'Werkruimte dupliceren',
            duplicateWorkspacePrefix: 'Dupliceren',
            goToWorkspaces: 'Ga naar werkruimtes',
            clearFilter: 'Filter wissen',
            workspaceName: 'Werkruimtenaam',
            workspaceOwner: 'Eigenaar',
            workspaceType: 'Werkruimte-type',
            workspaceAvatar: 'Werkruimte-avatar',
            mustBeOnlineToViewMembers: 'Je moet online zijn om de leden van deze werkruimte te bekijken.',
            moreFeatures: 'Meer functies',
            requested: 'Aangevraagd',
            distanceRates: 'Kilometertarieven',
            defaultDescription: 'Eén plek voor al je bonnetjes en uitgaven.',
            descriptionHint: 'Deel informatie over deze workspace met alle leden.',
            welcomeNote: 'Gebruik Expensify om je bonnetjes in te dienen voor vergoeding, bedankt!',
            subscription: 'Abonnement',
            markAsEntered: 'Markeren als handmatig ingevoerd',
            markAsExported: 'Markeren als geëxporteerd',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exporteren naar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
            lineItemLevel: 'Regelniveauniveau',
            reportLevel: 'Rapportniveau',
            topLevel: 'Topniveau',
            appliedOnExport: 'Niet in Expensify geïmporteerd, toegepast bij export',
            shareNote: {
                header: 'Deel je werkruimte met andere leden',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Deel deze QR-code of kopieer de onderstaande link om het voor leden eenvoudig te maken toegang tot je werkruimte aan te vragen. Alle verzoeken om lid te worden van de werkruimte verschijnen in de <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a>-ruimte voor jouw beoordeling.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Verbind met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Nieuwe verbinding maken',
            reuseExistingConnection: 'Bestaande verbinding hergebruiken',
            existingConnections: 'Bestaande verbindingen',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Omdat je eerder verbinding hebt gemaakt met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, kun je ervoor kiezen een bestaande verbinding opnieuw te gebruiken of een nieuwe aan te maken.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Laatst gesynchroniseerd op ${formattedDate}`,
            authenticationError: (connectionName: string) => `Kan geen verbinding maken met ${connectionName} vanwege een authenticatiefout.`,
            learnMore: 'Meer informatie',
            memberAlternateText: 'Dien rapporten in en keur ze goed.',
            adminAlternateText: 'Beheer rapporten en werkruimte-instellingen.',
            auditorAlternateText: 'Bekijk en reageer op rapporten.',
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
            planType: 'Type abonnement',
            youCantDowngradeInvoicing:
                'Je kunt je abonnement niet downgraden bij een factuurabonnement. Neem contact op met je accountmanager of met Concierge om je abonnement te bespreken of wijzigingen aan te brengen.',
            defaultCategory: 'Standaardcategorie',
            viewTransactions: 'Transacties bekijken',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Declaraties van ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card-transacties worden automatisch geëxporteerd naar een "Expensify Card Liability Account" dat wordt aangemaakt met <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">onze integratie</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Verbonden met ${organizationName}` : 'Automatiseer reis- en maaltijdbezorgingskosten in uw hele organisatie.',
                sendInvites: 'Uitnodigingen verzenden',
                sendInvitesDescription: 'Deze werkruimteleden hebben nog geen Uber for Business-account. Deselecteer de leden die je op dit moment niet wilt uitnodigen.',
                confirmInvite: 'Uitnodiging bevestigen',
                manageInvites: 'Uitnodigingen beheren',
                confirm: 'Bevestigen',
                allSet: 'Helemaal klaar',
                readyToRoll: 'Je bent klaar om te beginnen',
                takeBusinessRideMessage: 'Maak een zakelijke rit en je Uber-bonnen worden in Expensify geïmporteerd. Scheur weg!',
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
                centralBillingAccount: 'Centraal facturatieaccount',
                centralBillingDescription: 'Kies waar je alle Uber-bonnen wilt importeren.',
                invitationFailure: 'Uitnodigen van lid voor Uber for Business mislukt',
                autoInvite: 'Nieuwe werkruimtele­den uitnodigen voor Uber for Business',
                autoRemove: 'Deactiveer verwijderde werkruimtedeelnemers in Uber for Business',
                emptyContent: {
                    title: 'Geen openstaande uitnodigingen',
                    subtitle: 'Hoera! We hebben overal gezocht en geen openstaande uitnodigingen gevonden.',
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
            findPerDiemRate: 'Vind daggeldtarief',
            areYouSureDelete: () => ({
                one: 'Weet je zeker dat je dit tarief wilt verwijderen?',
                other: 'Weet je zeker dat je deze tarieven wilt verwijderen?',
            }),
            emptyList: {
                title: 'Dagvergoeding',
                subtitle: 'Stel dagvergoedingen in om de dagelijkse uitgaven van medewerkers te beheren. Importeer tarieven uit een spreadsheet om te beginnen.',
            },
            importPerDiemRates: 'Per diemtarieven importeren',
            editPerDiemRate: 'Dagvergoeding bewerken',
            editPerDiemRates: 'Dagvergoedingen bewerken',
            editDestinationSubtitle: (destination: string) => `Als je deze bestemming bijwerkt, wordt deze gewijzigd voor alle ${destination} per diem-subtarieven.`,
            editCurrencySubtitle: (destination: string) => `Het bijwerken van deze valuta zal deze wijzigen voor alle dagvergoedingssubtarieven voor ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Stel in hoe uit eigen zak betaalde onkosten worden geëxporteerd naar QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Markeer cheques als ‘later afdrukken’',
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar QuickBooks Desktop.',
            date: 'Exportdatum',
            exportInvoices: 'Facturen exporteren naar',
            exportExpensifyCard: 'Expensify Card-transacties exporteren als',
            account: 'Account',
            accountDescription: 'Kies waar journaalposten worden geboekt.',
            accountsPayable: 'Crediteuren',
            accountsPayableDescription: 'Kies waar je leveranciersfacturen wilt aanmaken.',
            bankAccount: 'Bankrekening',
            notConfigured: 'Niet geconfigureerd',
            bankAccountDescription: 'Kies vanwaar je cheques wilt versturen.',
            creditCardAccount: 'Creditcardrekening',
            exportDate: {
                label: 'Exportdatum',
                description: 'Gebruik deze datum bij het exporteren van rapporten naar QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum van laatste uitgave',
                        description: 'Datum van de recentste uitgave op het rapport.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport naar QuickBooks Desktop is geëxporteerd.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Ingediend op datum',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            exportCheckDescription: 'We maken voor elk Expensify-rapport een gespecificeerde cheque aan en versturen die vanaf de onderstaande bankrekening.',
            exportJournalEntryDescription: 'We maken een gespecificeerde journaalboeking voor elk Expensify-rapport en boeken deze op de onderstaande rekening.',
            exportVendorBillDescription:
                'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport en voegen die toe aan de onderstaande rekening. Als deze periode is afgesloten, boeken we op de 1e dag van de eerstvolgende open periode.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop ondersteunt geen belastingen op exports van journaalposten. Omdat je belastingen hebt ingeschakeld in je werkruimte, is deze exportoptie niet beschikbaar.',
            outOfPocketTaxEnabledError: 'Boekingen zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Creditcard',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Leveranciersfactuur',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journaalpost',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Controleren',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'We maken voor elk Expensify-rapport een gespecificeerde cheque aan en versturen die vanaf de onderstaande bankrekening.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'We zullen de naam van de handelaar op de creditcardtransactie automatisch koppelen aan alle bijbehorende leveranciers in QuickBooks. Als er geen leveranciers bestaan, maken we een leverancier ‘Credit Card Misc.’ aan voor de koppeling.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport met de datum van de laatste uitgave en voegen die toe aan de onderstaande rekening. Als deze periode is afgesloten, boeken we op de 1e van de volgende open periode.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Kies waar je creditcardtransacties wilt exporteren.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Kies een leverancier die op alle creditcardtransacties wordt toegepast.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Kies vanwaar je cheques wilt versturen.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Leveranciersrekeningen zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Cheques zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Boekingen zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            },
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: 'Voeg de rekening toe in QuickBooks Desktop en synchroniseer de verbinding opnieuw',
            qbdSetup: 'QuickBooks Desktop-configuratie',
            requiredSetupDevice: {
                title: 'Kan geen verbinding maken vanaf dit apparaat',
                body1: 'Je moet deze verbinding instellen vanaf de computer waarop je QuickBooks Desktop-bedrijfsbestand wordt gehost.',
                body2: 'Zodra je verbonden bent, kun je overal vandaan synchroniseren en exporteren.',
            },
            setupPage: {
                title: 'Open deze link om verbinding te maken',
                body: 'Om de installatie te voltooien, open de volgende link op de computer waarop QuickBooks Desktop wordt uitgevoerd.',
                setupErrorTitle: 'Er is iets misgegaan',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>De QuickBooks Desktop-verbinding werkt op dit moment niet. Probeer het later opnieuw of <a href="${conciergeLink}">neem contact op met Concierge</a> als het probleem zich blijft voordoen.</centered-text></muted-text>`,
            },
            importDescription: 'Kies welke coderingsconfiguraties je wilt importeren van QuickBooks Desktop naar Expensify.',
            classes: 'Klassen',
            items: 'Items',
            customers: 'Klanten/projecten',
            exportCompanyCardsDescription: 'Stel in hoe aankopen met bedrijfskaarten worden geëxporteerd naar QuickBooks Desktop.',
            defaultVendorDescription: 'Stel een standaardleverancier in die wordt toegepast op alle creditcardtransacties bij het exporteren.',
            accountsDescription: 'Je QuickBooks Desktop-rekeningschema wordt in Expensify geïmporteerd als categorieën.',
            accountsSwitchTitle: 'Kies of je nieuwe rekeningen als ingeschakelde of uitgeschakelde categorieën wilt importeren.',
            accountsSwitchDescription: 'Ingeschakelde categorieën zijn beschikbaar voor leden om te selecteren wanneer ze uitgaven aanmaken.',
            classesDescription: 'Kies hoe je QuickBooks Desktop-klassen in Expensify wilt verwerken.',
            tagsDisplayedAsDescription: 'Regelniveau',
            reportFieldsDisplayedAsDescription: 'Rapportniveau',
            customersDescription: 'Kies hoe je QuickBooks Desktop-klanten/projecten in Expensify wilt behandelen.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wordt elke dag automatisch gesynchroniseerd met QuickBooks Desktop.',
                createEntities: 'Entiteiten automatisch aanmaken',
                createEntitiesDescription: 'Expensify maakt automatisch leveranciers aan in QuickBooks Desktop als ze nog niet bestaan.',
            },
            itemsDescription: 'Kies hoe je QuickBooks Desktop‑items in Expensify wilt verwerken.',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer de onkosten worden geëxporteerd:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Toerekening',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak betaalde onkosten worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Uitgaven uit eigen zak worden geëxporteerd zodra ze zijn betaald',
                },
            },
        },
        qbo: {
            connectedTo: 'Verbonden met',
            importDescription: 'Kies welke coderingsconfiguraties je wilt importeren van QuickBooks Online naar Expensify.',
            classes: 'Klassen',
            locations: 'Locaties',
            customers: 'Klanten/projecten',
            accountsDescription: 'Je rekeningschema uit QuickBooks Online wordt in Expensify geïmporteerd als categorieën.',
            accountsSwitchTitle: 'Kies of je nieuwe rekeningen als ingeschakelde of uitgeschakelde categorieën wilt importeren.',
            accountsSwitchDescription: 'Ingeschakelde categorieën zijn beschikbaar voor leden om te selecteren wanneer ze uitgaven aanmaken.',
            classesDescription: 'Kies hoe je QuickBooks Online-klassen in Expensify wilt behandelen.',
            customersDescription: 'Kies hoe je QuickBooks Online-klanten/projecten in Expensify wilt verwerken.',
            locationsDescription: 'Kies hoe je QuickBooks Online-locaties in Expensify wilt beheren.',
            taxesDescription: 'Kies hoe je QuickBooks Online-belastingen in Expensify wilt verwerken.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online ondersteunt geen locaties op regelniveau voor cheques of leveranciersrekeningen. Als je locaties op regelniveau wilt hebben, zorg er dan voor dat je journaalposten en credit-/debetkaartuitgaven gebruikt.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online ondersteunt geen belastingen op journaalposten. Wijzig je exportoptie naar leveranciersfactuur of cheque.',
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar QuickBooks Online.',
            date: 'Exportdatum',
            exportInvoices: 'Facturen exporteren naar',
            exportExpensifyCard: 'Expensify Card-transacties exporteren als',
            exportDate: {
                label: 'Exportdatum',
                description: 'Gebruik deze datum bij het exporteren van rapporten naar QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum van laatste uitgave',
                        description: 'Datum van de recentste uitgave op het rapport.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport is geëxporteerd naar QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Ingediend op datum',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            receivable: 'Debiteuren',
            archive: 'Archief debiteuren',
            exportInvoicesDescription: 'Gebruik deze rekening wanneer je facturen exporteert naar QuickBooks Online.',
            exportCompanyCardsDescription: 'Stel in hoe aankopen met bedrijfskaarten worden geëxporteerd naar QuickBooks Online.',
            vendor: 'Leverancier',
            defaultVendorDescription: 'Stel een standaardleverancier in die wordt toegepast op alle creditcardtransacties bij het exporteren.',
            exportOutOfPocketExpensesDescription: 'Stel in hoe uit eigen zak betaalde kosten worden geëxporteerd naar QuickBooks Online.',
            exportCheckDescription: 'We maken voor elk Expensify-rapport een gespecificeerde cheque aan en versturen die vanaf de onderstaande bankrekening.',
            exportJournalEntryDescription: 'We maken een gespecificeerde journaalboeking voor elk Expensify-rapport en boeken deze op de onderstaande rekening.',
            exportVendorBillDescription:
                'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport en voegen die toe aan de onderstaande rekening. Als deze periode is afgesloten, boeken we op de 1e dag van de eerstvolgende open periode.',
            account: 'Account',
            accountDescription: 'Kies waar journaalposten worden geboekt.',
            accountsPayable: 'Crediteuren',
            accountsPayableDescription: 'Kies waar je leveranciersfacturen wilt aanmaken.',
            bankAccount: 'Bankrekening',
            notConfigured: 'Niet geconfigureerd',
            bankAccountDescription: 'Kies vanwaar je cheques wilt versturen.',
            creditCardAccount: 'Creditcardrekening',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online ondersteunt geen locaties bij het exporteren van leveranciersfacturen. Omdat je locaties hebt ingeschakeld in je workspace, is deze exportoptie niet beschikbaar.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online ondersteunt geen belastingen op exports van journaalposten. Omdat belastingen zijn ingeschakeld in je werkruimte, is deze exportoptie niet beschikbaar.',
            outOfPocketTaxEnabledError: 'Boekingen zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wordt elke dag automatisch gesynchroniseerd met QuickBooks Online.',
                inviteEmployees: 'Werknemers uitnodigen',
                inviteEmployeesDescription: 'Import QuickBooks Online-medewerkersgegevens en nodig medewerkers uit naar deze werkruimte.',
                createEntities: 'Entiteiten automatisch aanmaken',
                createEntitiesDescription:
                    'Expensify maakt automatisch leveranciers aan in QuickBooks Online als ze nog niet bestaan, en maakt automatisch klanten aan bij het exporteren van facturen.',
                reimbursedReportsDescription:
                    'Telkens wanneer een rapport wordt betaald via Expensify ACH, wordt de bijbehorende rekeningbetaling aangemaakt in de onderstaande QuickBooks Online-account.',
                qboBillPaymentAccount: 'QuickBooks-betalingsrekening voor rekeningen',
                qboInvoiceCollectionAccount: 'QuickBooks-invorderingsrekening',
                accountSelectDescription: 'Kies vanwaar u rekeningen wilt betalen en wij maken de betaling aan in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Kies waar je factuurbetalingen wilt ontvangen en dan maken wij de betaling aan in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Debetkaart',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Creditcard',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Leveranciersfactuur',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journaalpost',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Controleren',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'We koppelen automatisch de naam van de handelaar op de betaalkaarttransactie aan alle bijbehorende leveranciers in QuickBooks. Als er geen leveranciers bestaan, maken we een leverancier ‘Debit Card Misc.’ aan voor de koppeling.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'We zullen de naam van de handelaar op de creditcardtransactie automatisch koppelen aan alle bijbehorende leveranciers in QuickBooks. Als er geen leveranciers bestaan, maken we een leverancier ‘Credit Card Misc.’ aan voor de koppeling.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport met de datum van de laatste uitgave en voegen die toe aan de onderstaande rekening. Als deze periode is afgesloten, boeken we op de 1e van de volgende open periode.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Kies waar je debetkaarttransacties wilt exporteren.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Kies waar je creditcardtransacties wilt exporteren.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Kies een leverancier die op alle creditcardtransacties wordt toegepast.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Leveranciersrekeningen zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Cheques zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: 'Boekingen zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Kies een geldig grootboekrekeningnummer voor het exporteren van leveranciersfacturen',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Kies een geldig account voor het exporteren van journaalboekingen',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Kies een geldig rekeningnummer voor cheque-export',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Om leveranciersfacturen te kunnen exporteren, stel een crediteurenrekening in QuickBooks Online in',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Om journaalposten te kunnen exporteren, stel een journaalrekening in in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Om cheque-export te gebruiken, stel een bankrekening in in QuickBooks Online',
            },
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: 'Voeg de rekening toe in QuickBooks Online en synchroniseer de verbinding opnieuw.',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer de onkosten worden geëxporteerd:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Toerekening',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak betaalde onkosten worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Uitgaven uit eigen zak worden geëxporteerd zodra ze zijn betaald',
                },
            },
        },
        workspaceList: {
            joinNow: 'Nu meedoen',
            askToJoin: 'Toetreden aanvragen',
        },
        xero: {
            organization: 'Xero-organisatie',
            organizationDescription: 'Kies de Xero-organisatie waarvan je gegevens wilt importeren.',
            importDescription: 'Kies welke coderingsconfiguraties je wilt importeren van Xero naar Expensify.',
            accountsDescription: 'Je Xero-rekeningschema wordt in Expensify geïmporteerd als categorieën.',
            accountsSwitchTitle: 'Kies of je nieuwe rekeningen als ingeschakelde of uitgeschakelde categorieën wilt importeren.',
            accountsSwitchDescription: 'Ingeschakelde categorieën zijn beschikbaar voor leden om te selecteren wanneer ze uitgaven aanmaken.',
            trackingCategories: 'Volgcategorieën',
            trackingCategoriesDescription: 'Kies hoe je Xero-trackingcategorieën in Expensify wilt verwerken.',
            mapTrackingCategoryTo: (categoryName: string) => `Koppel Xero-${categoryName} aan`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Kies waar ${categoryName} aan moet worden gekoppeld bij het exporteren naar Xero.`,
            customers: 'Klanten opnieuw factureren',
            customersDescription:
                'Kies of je klanten in Expensify opnieuw wilt factureren. Je Xero‑klantcontacten kunnen aan uitgaven worden gekoppeld en worden naar Xero geëxporteerd als een verkoopfactuur.',
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
                'Geëxporteerde onkosten worden als banktransacties geboekt op de onderstaande Xero-bankrekening en de transactiedata komen overeen met de data op je bankafschrift.',
            bankTransactions: 'Banktransacties',
            xeroBankAccount: 'Xero-bankrekening',
            xeroBankAccountDescription: 'Kies waar declaraties worden geboekt als banktransacties.',
            exportExpensesDescription: 'Rapporten worden geëxporteerd als een inkoopfactuur met de datum en status die je hieronder selecteert.',
            purchaseBillDate: 'Datum inkoopfactuur',
            exportInvoices: 'Facturen exporteren als',
            salesInvoice: 'Verkoopfactuur',
            exportInvoicesDescription: 'Verkoopfacturen geven altijd de datum weer waarop de factuur is verzonden.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wordt elke dag automatisch met Xero gesynchroniseerd.',
                purchaseBillStatusTitle: 'Status inkoopfactuur',
                reimbursedReportsDescription:
                    'Telkens wanneer een rapport wordt betaald via Expensify ACH, wordt de bijbehorende rekeningbetaling aangemaakt in de onderstaande Xero-account.',
                xeroBillPaymentAccount: 'Xero-betaalrekening voor rekeningen',
                xeroInvoiceCollectionAccount: 'Xero-incasso\\-rekening voor facturen',
                xeroBillPaymentAccountDescription: 'Kies vanwaar je rekeningen wilt betalen en wij maken de betaling aan in Xero.',
                invoiceAccountSelectorDescription: 'Kies waar je factuurbetalingen wilt ontvangen en wij maken de betaling aan in Xero.',
            },
            exportDate: {
                label: 'Datum inkoopfactuur',
                description: 'Gebruik deze datum bij het exporteren van rapporten naar Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum van laatste uitgave',
                        description: 'Datum van de recentste uitgave op het rapport.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport is geëxporteerd naar Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Ingediend op datum',
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
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Toerekening',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak betaalde onkosten worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Uitgaven uit eigen zak worden geëxporteerd zodra ze zijn betaald',
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
                        description: 'Datum van de recentste uitgave op het rapport.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport is geëxporteerd naar Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Ingediend op datum',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Stel in hoe uit eigen zak betaalde onkosten worden geëxporteerd naar Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Declaraties',
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
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Stel een standaardleverancier in die wordt toegepast op ${isReimbursable ? '' : 'niet-'}vergoedbare uitgaven waarvoor geen overeenkomende leverancier in Sage Intacct bestaat.`,
            exportDescription: 'Configureer hoe Expensify-gegevens naar Sage Intacct worden geëxporteerd.',
            exportPreferredExporterNote:
                'De voorkeursexporteur kan elke werkruimtebeheerder zijn, maar moet ook een domeinbeheerder zijn als je in Domeininstellingen verschillende exportrekeningen instelt voor individuele bedrijfskaarten.',
            exportPreferredExporterSubNote: 'Zodra dit is ingesteld, ziet de voorkeurs-exporteur in zijn of haar account de rapporten die moeten worden geëxporteerd.',
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: `Voeg het account toe in Sage Intacct en synchroniseer de verbinding opnieuw`,
            autoSync: 'Automatisch synchroniseren',
            autoSyncDescription: 'Expensify wordt elke dag automatisch met Sage Intacct gesynchroniseerd.',
            inviteEmployees: 'Werknemers uitnodigen',
            inviteEmployeesDescription:
                'Importeer Sage Intacct-medewerkersrecords en nodig medewerkers uit naar deze workspace. Je goedkeuringsworkflow wordt standaard ingesteld op managergoedkeuring en kan verder worden geconfigureerd op de pagina Leden.',
            syncReimbursedReports: 'Vergoedde rapporten synchroniseren',
            syncReimbursedReportsDescription:
                'Elke keer dat een rapport wordt betaald met Expensify ACH, wordt de bijbehorende rekeningbetaling aangemaakt in de onderstaande Sage Intacct-account.',
            paymentAccount: 'Sage Intacct-betaalrekening',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer de onkosten worden geëxporteerd:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Toerekening',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak betaalde onkosten worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Uitgaven uit eigen zak worden geëxporteerd zodra ze zijn betaald',
                },
            },
        },
        netsuite: {
            subsidiary: 'Dochteronderneming',
            subsidiarySelectDescription: 'Kies de dochteronderneming in NetSuite waarvan je gegevens wilt importeren.',
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar NetSuite.',
            exportInvoices: 'Facturen exporteren naar',
            journalEntriesTaxPostingAccount: 'Journaalposten belastingboekingsrekening',
            journalEntriesProvTaxPostingAccount: 'Journaalposten provinciale belastingboekingsrekening',
            foreignCurrencyAmount: 'Bedrag in vreemde valuta exporteren',
            exportToNextOpenPeriod: 'Exporteren naar volgende open periode',
            nonReimbursableJournalPostingAccount: 'Niet-vergoedbare journaalboekingsrekening',
            reimbursableJournalPostingAccount: 'Vergoedbare journaalpostrekening',
            journalPostingPreference: {
                label: 'Voorkeur voor het boeken van journaalposten',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Enkel, uitgesplitst item per rapport',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Eén boeking per uitgave',
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
                        label: 'Bestaande selecteren',
                        description: 'We koppelen facturen van Expensify aan het item dat je hieronder selecteert.',
                    },
                },
            },
            exportDate: {
                label: 'Exportdatum',
                description: 'Gebruik deze datum bij het exporteren van rapporten naar NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Datum van laatste uitgave',
                        description: 'Datum van de recentste uitgave op het rapport.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport naar NetSuite is geëxporteerd.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Ingediend op datum',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Declaraties',
                        reimbursableDescription: 'Uitgaven uit eigen zak worden als onkostendeclaraties naar NetSuite geëxporteerd.',
                        nonReimbursableDescription: 'Zakelijke kaartuitgaven worden als onkostendeclaraties geëxporteerd naar NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Leveranciersfacturen',
                        reimbursableDescription: dedent(`
                            Uitgaven uit eigen zak worden geëxporteerd als facturen die betaalbaar zijn aan de hieronder opgegeven NetSuite-leverancier.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfspassen*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Uitgaven op bedrijfskaarten worden geëxporteerd als facturen die betaalbaar zijn aan de hieronder opgegeven NetSuite-leverancier.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Boekingen',
                        reimbursableDescription: dedent(`
                            Contante uitgaven worden als journaalposten geëxporteerd naar de hieronder opgegeven NetSuite-rekening.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Uitgaven op bedrijfskaarten worden als journaalposten geëxporteerd naar de hieronder opgegeven NetSuite-rekening.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Als je de exportinstelling voor bedrijfskaarten wijzigt naar onkostendeclaraties, worden NetSuite-leveranciers en boekingsrekeningen voor individuele kaarten uitgeschakeld.\n\nMaak je geen zorgen, we bewaren je eerdere selecties voor het geval je later terug wilt schakelen.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify wordt elke dag automatisch gesynchroniseerd met NetSuite.',
                reimbursedReportsDescription:
                    'Elke keer dat een rapport wordt betaald via Expensify ACH, wordt de bijbehorende rekeningbetaling aangemaakt in de onderstaande NetSuite-account.',
                reimbursementsAccount: 'Vergoedingenrekening',
                reimbursementsAccountDescription: 'Kies de bankrekening die je voor terugbetalingen gaat gebruiken, dan maken wij de bijbehorende betaling aan in NetSuite.',
                collectionsAccount: 'Incassorekening',
                collectionsAccountDescription: 'Zodra een factuur in Expensify als betaald is gemarkeerd en geëxporteerd naar NetSuite, verschijnt deze op de onderstaande rekening.',
                approvalAccount: 'A/P-goedkeuringsrekening',
                approvalAccountDescription:
                    'Kies de rekening waarop transacties in NetSuite worden goedgekeurd. Als je terugbetaalde rapporten synchroniseert, is dit ook de rekening waarop rekeningbetalingen worden aangemaakt.',
                defaultApprovalAccount: 'NetSuite-standaard',
                inviteEmployees: 'Werknemers uitnodigen en goedkeuringen instellen',
                inviteEmployeesDescription:
                    'Import NetSuite-medewerkersrecords en nodig medewerkers uit naar deze werkruimte. Je goedkeuringsworkflow wordt standaard ingesteld op goedkeuring door de manager en kan verder worden geconfigureerd op de pagina *Leden*.',
                autoCreateEntities: 'Werknemers/leveranciers automatisch aanmaken',
                enableCategories: 'Nieuw geïmporteerde categorieën inschakelen',
                customFormID: 'Aangepaste formulier-ID',
                customFormIDDescription:
                    'Standaard maakt Expensify boekingen aan met behulp van het voorkeurstransactieformulier dat in NetSuite is ingesteld. Als alternatief kun je een specifiek transactieformulier aanwijzen dat moet worden gebruikt.',
                customFormIDReimbursable: 'Uit eigen zak gemaakte uitgave',
                customFormIDNonReimbursable: 'Uitgave met bedrijfskaart',
                exportReportsTo: {
                    label: 'Goedkeuringsniveau onkostendeclaratie',
                    description:
                        'Zodra een onkostendeclaratie in Expensify is goedgekeurd en naar NetSuite is geëxporteerd, kun je in NetSuite vóór het boeken een extra goedkeuringsniveau instellen.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Standaardvoorkeur voor NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Alleen door leidinggevende goedgekeurd',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Alleen door boekhouding goedgekeurd',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Goedgekeurd door leidinggevende en boekhouding',
                    },
                },
                accountingMethods: {
                    label: 'Wanneer exporteren',
                    description: 'Kies wanneer de onkosten worden geëxporteerd:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Toerekening',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak betaalde onkosten worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Uitgaven uit eigen zak worden geëxporteerd zodra ze zijn betaald',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Goedkeuringsniveau leveranciersfactuur',
                    description:
                        'Zodra een leveranciersfactuur in Expensify is goedgekeurd en naar NetSuite is geëxporteerd, kun je in NetSuite een extra goedkeuringsniveau instellen voordat deze wordt geboekt.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Standaardvoorkeur voor NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'In afwachting van goedkeuring',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Goedgekeurd voor boeken',
                    },
                },
                exportJournalsTo: {
                    label: 'Goedkeuringsniveau van journaalpost',
                    description:
                        'Zodra een journaalpost in Expensify is goedgekeurd en naar NetSuite is geëxporteerd, kun je in NetSuite een extra goedkeuringsniveau instellen voordat je de post boekt.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Standaardvoorkeur voor NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'In afwachting van goedkeuring',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Goedgekeurd voor boeken',
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
            noItemsFoundDescription: 'Voeg factuurregels toe in NetSuite en synchroniseer de verbinding opnieuw',
            noSubsidiariesFound: 'Geen dochterondernemingen gevonden',
            noSubsidiariesFoundDescription: 'Voeg een dochteronderneming toe in NetSuite en synchroniseer de verbinding opnieuw',
            tokenInput: {
                title: 'NetSuite-configuratie',
                formSteps: {
                    installBundle: {
                        title: 'Installeer de Expensify-bundel',
                        description: 'Ga in NetSuite naar *Customization > SuiteBundler > Search & Install Bundles* > zoek naar "Expensify" > installeer de bundle.',
                    },
                    enableTokenAuthentication: {
                        title: 'Token-gebaseerde authenticatie inschakelen',
                        description: 'Ga in NetSuite naar *Setup > Company > Enable Features > SuiteCloud* en schakel *token-based authentication* in.',
                    },
                    enableSoapServices: {
                        title: 'SOAP-webservices inschakelen',
                        description: 'Ga in NetSuite naar *Setup > Company > Enable Features > SuiteCloud* en schakel *SOAP Web Services* in.',
                    },
                    createAccessToken: {
                        title: 'Een toegangstoken aanmaken',
                        description:
                            'Ga in NetSuite naar *Setup > Users/Roles > Access Tokens* en maak een toegangstoken aan voor de app "Expensify" en de rol "Expensify Integration" of "Administrator".\n\n*Belangrijk:* Zorg ervoor dat je de *Token ID* en *Token Secret* van deze stap opslaat. Je hebt deze nodig voor de volgende stap.',
                    },
                    enterCredentials: {
                        title: 'Voer je NetSuite-inloggegevens in',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite-account-ID',
                            netSuiteTokenID: 'Token-ID',
                            netSuiteTokenSecret: 'Tokengeheim sleutel',
                        },
                        netSuiteAccountIDDescription: 'Ga in NetSuite naar *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Onkostencategorieën',
                expenseCategoriesDescription: 'Je NetSuite-uitgavencategorieën worden als categorieën in Expensify geïmporteerd.',
                crossSubsidiaryCustomers: 'Klant/projecten over dochterondernemingen heen',
                importFields: {
                    departments: {
                        title: 'Afdelingen',
                        subtitle: 'Kies hoe je de NetSuite-*afdelingen* in Expensify wilt beheren.',
                    },
                    classes: {
                        title: 'Klassen',
                        subtitle: 'Kies hoe je *klassen* in Expensify wilt behandelen.',
                    },
                    locations: {
                        title: 'Locaties',
                        subtitle: 'Kies hoe je *locaties* in Expensify wilt verwerken.',
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
                        helpText: 'over de configuratie van aangepaste segmenten/records.',
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
                            segmentRecordType: 'Wil je een aangepast segment of een aangepast record toevoegen?',
                            customSegmentNameTitle: 'Wat is de naam van het aangepaste segment?',
                            customRecordNameTitle: 'Wat is de naam van het aangepaste record?',
                            customSegmentNameFooter: `Je kunt aangepaste segmentnamen in NetSuite vinden op de pagina *Customizations > Links, Records & Fields > Custom Segments*.

_Voor meer gedetailleerde instructies, [bezoek onze help-pagina](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Je kunt aangepaste recordnamen in NetSuite vinden door "Transaction Column Field" in de globale zoekfunctie in te voeren.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Wat is de interne ID?',
                            customSegmentInternalIDFooter: `Zorg er eerst voor dat je interne ID’s hebt ingeschakeld in NetSuite onder *Home > Set Preferences > Show Internal ID.*

Je kunt de interne ID’s van aangepaste segmenten in NetSuite vinden onder:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klik op een aangepast segment.
3. Klik op de hyperlink naast *Custom Record Type*.
4. Zoek de interne ID in de tabel onderaan.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Je kunt interne ID’s van aangepaste records in NetSuite vinden door deze stappen te volgen:

1. Voer „Transaction Line Fields” in de globale zoekopdracht in.
2. Klik op een aangepast record.
3. Zoek de interne ID aan de linkerkant.

_Voor meer gedetailleerde instructies, [bezoek onze help-site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Wat is de script-ID?',
                            customSegmentScriptIDFooter: `Je kunt aangepaste segment script-ID’s in NetSuite vinden onder: 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klik op een aangepast segment.
3. Klik onderaan op het tabblad *Application and Sourcing* en doe vervolgens het volgende:
    a. Als je het aangepaste segment als een *tag* (op regelniveau) in Expensify wilt weergeven, klik je op het subtabblad *Transaction Columns* en gebruik je de *Field ID*.
    b. Als je het aangepaste segment als een *report field* (op rapportniveau) in Expensify wilt weergeven, klik je op het subtabblad *Transactions* en gebruik je de *Field ID*.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Wat is de transactiekolom-ID?',
                            customRecordScriptIDFooter: `Je kunt aangepaste recordscript-ID’s in NetSuite vinden onder:

1. Voer “Transaction Line Fields” in de globale zoekopdracht in.
2. Klik op een aangepast record.
3. Zoek de script-ID aan de linkerkant.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Hoe moet dit aangepaste segment in Expensify worden weergegeven?',
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
                            transactionFieldIDTitle: 'Wat is de ID van het transactievak?',
                            transactionFieldIDFooter: `Je kunt transactieveld-ID’s in NetSuite vinden door de volgende stappen te volgen:

1. Voer “Transaction Line Fields” in in de globale zoekbalk.
2. Klik een aangepaste lijst open.
3. Zoek de transactieveld-ID aan de linkerkant.

_Voor meer gedetailleerde instructies, [bezoek onze help-site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})._`,
                            mappingTitle: 'Hoe moet deze aangepaste lijst worden weergegeven in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Er bestaat al een aangepaste lijst met deze transactieveld-ID`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Standaard NetSuite-medewerker',
                        description: 'Niet in Expensify geïmporteerd, toegepast bij export',
                        footerContent: (importField: string) =>
                            `Als u ${importField} in NetSuite gebruikt, passen we de standaardwaarde die is ingesteld op de werknemerskaart toe bij het exporteren naar Expense Report of Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'Regelniveauniveau',
                        footerContent: (importField: string) => `${startCase(importField)} zal selecteerbaar zijn voor elke afzonderlijke uitgave op het rapport van een medewerker.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Rapportvelden',
                        description: 'Rapportniveau',
                        footerContent: (importField: string) => `${startCase(importField)}-selectie is van toepassing op alle uitgaven op het rapport van een medewerker.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct-configuratie',
            prerequisitesTitle: 'Voordat je verbinding maakt...',
            downloadExpensifyPackage: 'Download het Expensify-pakket voor Sage Intacct',
            followSteps: 'Volg de stappen in onze handleiding: Verbinden met Sage Intacct',
            enterCredentials: 'Voer je Sage Intacct-inloggegevens in',
            entity: 'Entiteit',
            employeeDefault: 'Standaard Sage Intacct-medewerker',
            employeeDefaultDescription: 'De standaardafdeling van de werknemer wordt toegepast op hun uitgaven in Sage Intacct, als die bestaat.',
            displayedAsTagDescription: 'Afdeling zal selecteerbaar zijn voor elke afzonderlijke uitgave op het rapport van een medewerker.',
            displayedAsReportFieldDescription: 'De geselecteerde afdeling wordt toegepast op alle uitgaven in het rapport van de medewerker.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Kies hoe je Sage Intacct-<strong>${mappingTitle}</strong> in Expensify wilt verwerken.`,
            expenseTypes: 'Onkostypen',
            expenseTypesDescription: 'Je Sage Intacct-onkostypen worden in Expensify geïmporteerd als categorieën.',
            accountTypesDescription: 'Je rekeningschema uit Sage Intacct wordt in Expensify geïmporteerd als categorieën.',
            importTaxDescription: 'Importeer aankoopbelastingtarief uit Sage Intacct.',
            userDefinedDimensions: 'Door gebruiker gedefinieerde dimensies',
            addUserDefinedDimension: 'Gebruikersgedefinieerde dimensie toevoegen',
            integrationName: 'Naam koppeling',
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
                        return 'projecten (opdrachten)';
                    default:
                        return 'toewijzingen';
                }
            },
        },
        type: {
            free: 'Gratis',
            control: 'Beheer',
            collect: 'Incasseren',
        },
        companyCards: {
            addCards: 'Kaarten toevoegen',
            selectCards: 'Kaarten selecteren',
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'Kaartfeeds konden niet worden geladen',
                workspaceFeedsCouldNotBeLoadedMessage:
                    'Er is een fout opgetreden bij het laden van de kaartfeeds van de werkruimte. Probeer het opnieuw of neem contact op met je beheerder.',
                feedCouldNotBeLoadedTitle: 'Kon deze feed niet laden',
                feedCouldNotBeLoadedMessage: 'Er is een fout opgetreden bij het laden van deze feed. Probeer het opnieuw of neem contact op met je beheerder.',
                tryAgain: 'Probeer het opnieuw',
            },
            addNewCard: {
                other: 'Overig',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard zakelijke kaarten',
                    vcf: 'Visa zakelijke kaarten',
                    stripe: 'Stripe-kaarten',
                },
                yourCardProvider: `Wie is de uitgever van je kaart?`,
                whoIsYourBankAccount: 'Wat is je bank?',
                whereIsYourBankLocated: 'Waar is uw bank gevestigd?',
                howDoYouWantToConnect: 'Hoe wil je verbinding maken met je bank?',
                learnMoreAboutOptions: `<muted-text>Lees meer over deze <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">opties</a>.</muted-text>`,
                commercialFeedDetails: 'Vereist een installatie met je bank. Dit wordt meestal gebruikt door grotere bedrijven en is vaak de beste optie als je ervoor in aanmerking komt.',
                commercialFeedPlaidDetails: `Vereist een installatie met je bank, maar wij begeleiden je daarbij. Dit is doorgaans alleen beschikbaar voor grotere bedrijven.`,
                directFeedDetails: 'De eenvoudigste aanpak. Maak direct verbinding met je hoofdreferenties. Deze methode komt het meest voor.',
                enableFeed: {
                    title: (provider: string) => `Schakel je ${provider}-feed in`,
                    heading:
                        'We hebben een directe integratie met de uitgever van je kaart en kunnen je transactiegegevens snel en nauwkeurig in Expensify importeren.\n\nOm te beginnen hoef je alleen maar:',
                    visa: 'We hebben wereldwijde integraties met Visa, al verschilt de geschiktheid per bank en kaartprogramma.\n\nOm te beginnen hoef je alleen maar:',
                    mastercard: 'We hebben wereldwijde integraties met Mastercard, al verschilt de geschiktheid per bank en kaartprogramma.\n\nOm te beginnen hoef je alleen maar:',
                    vcf: `1. Raadpleeg [dit helpartikel](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) voor gedetailleerde instructies over het instellen van je Visa Commercial Cards.

2. [Neem contact op met je bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) om te controleren of zij een commerciële feed voor je programma ondersteunen, en vraag hen deze te activeren.

3. *Zodra de feed is geactiveerd en je de details hebt, ga je verder naar het volgende scherm.*`,
                    gl1025: `1. Bezoek [dit helpartikel](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) om te zien of American Express een commerciële feed voor je programma kan inschakelen.

2. Zodra de feed is ingeschakeld, stuurt Amex je een productiebrief.

3. *Zodra je de feedinformatie hebt, ga je verder naar het volgende scherm.*`,
                    cdf: `1. Raadpleeg [dit helpartikel](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) voor gedetailleerde instructies over het instellen van je Mastercard Commercial Cards.

2. [Neem contact op met je bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) om te bevestigen dat ze een commerciële feed voor je programma ondersteunen, en vraag hen om deze te activeren.

3. *Zodra de feed is geactiveerd en je de gegevens hebt, ga je verder naar het volgende scherm.*`,
                    stripe: `1. Ga naar het Stripe-dashboard en vervolgens naar [Instellingen](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Klik onder Productintegraties op Inschakelen naast Expensify.

3. Zodra de feed is ingeschakeld, klik je hieronder op Verzenden en wij gaan ermee aan de slag om deze toe te voegen.`,
                },
                whatBankIssuesCard: 'Welke bank geeft deze kaarten uit?',
                enterNameOfBank: 'Voer de naam van de bank in',
                feedDetails: {
                    vcf: {
                        title: 'Wat zijn de details van de Visa-feed?',
                        processorLabel: 'Processor-ID',
                        bankLabel: 'ID financiële instelling (bank)',
                        companyLabel: 'Bedrijfs-ID',
                        helpLabel: 'Waar vind ik deze ID’s?',
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
                    pleaseSelectProvider: 'Selecteer eerst een kaartverstrekker voordat je doorgaat',
                    pleaseSelectBankAccount: 'Selecteer een bankrekening voordat je verdergaat',
                    pleaseSelectBank: 'Selecteer een bank voordat je doorgaat',
                    pleaseSelectCountry: 'Selecteer een land voordat je doorgaat',
                    pleaseSelectFeedType: 'Selecteer eerst een feedtype voordat je verdergaat',
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
            assign: 'Toewijzen',
            assignCard: 'Kaart toewijzen',
            findCard: 'Kaart zoeken',
            cardNumber: 'Kaartnummer',
            commercialFeed: 'Commerciële feed',
            feedName: (feedName: string) => `${feedName}-kaarten`,
            directFeed: 'Direct feed',
            whoNeedsCardAssigned: 'Wie moet er een kaart toegewezen krijgen?',
            chooseTheCardholder: 'Kies de kaarthouder',
            chooseCard: 'Kies een kaart',
            chooseCardFor: (assignee: string) =>
                `Kies een kaart voor <strong>${assignee}</strong>. Kun je de kaart die je zoekt niet vinden? <concierge-link>Laat het ons weten.</concierge-link>`,
            noActiveCards: 'Geen actieve kaarten in deze feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Of er er is iets kapot. Hoe dan ook, als je vragen hebt, <concierge-link>neem dan contact op met Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Kies een startdatum voor transacties',
            startDateDescription: 'Kies je startdatum voor importeren. We synchroniseren alle transacties vanaf deze datum.',
            editStartDateDescription:
                'Kies een nieuwe startdatum voor transacties. We synchroniseren alle transacties vanaf die datum, met uitzondering van transacties die we al hebben geïmporteerd.',
            fromTheBeginning: 'Vanaf het begin',
            customStartDate: 'Aangepaste startdatum',
            customCloseDate: 'Aangepaste einddatum',
            letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
            confirmationDescription: 'We beginnen meteen met het importeren van transacties.',
            card: 'Kaart',
            cardName: 'Kaartnaam',
            brokenConnectionError: '<rbr>Kaartfeedverbinding is verbroken. <a href="#">Log in bij je bank</a> zodat we de verbinding opnieuw kunnen herstellen.</rbr>',
            assignedCard: (assignee: string, link: string) => `heeft ${assignee} een ${link} toegewezen! Geïmporteerde transacties verschijnen in deze chat.`,
            companyCard: 'bedrijfskaart',
            chooseCardFeed: 'Kaartfeed kiezen',
            ukRegulation:
                'Expensify Limited is een agent van Plaid Financial Ltd., een gemachtigde betaaldienstinstelling die wordt gereguleerd door de Financial Conduct Authority onder de Payment Services Regulations 2017 (firmareferentienummer: 804718). Plaid levert jou gereguleerde rekeninginformatiediensten via Expensify Limited als haar agent.',
            assignCardFailedError: 'Kaarttoewijzing mislukt.',
            unassignCardFailedError: 'Kaarttoewijzing ongedaan maken is mislukt.',
            cardAlreadyAssignedError: 'Deze kaart is al toegewezen aan een gebruiker in een andere workspace.',
            importTransactions: {
                title: 'Transacties uit bestand importeren',
                description: 'Pas de instellingen voor je bestand aan die zullen worden toegepast bij het importeren.',
                cardDisplayName: 'Weergavenaam kaart',
                currency: 'Valuta',
                transactionsAreReimbursable: 'Transacties zijn terugbetaalbaar',
                flipAmountSign: 'Teken van bedrag omkeren',
                importButton: 'Transacties importeren',
            },
        },
        expensifyCard: {
            issueAndManageCards: 'Expensify Cards uitgeven en beheren',
            getStartedIssuing: 'Begin met het uitgeven van je eerste virtuele of fysieke kaart.',
            verificationInProgress: 'Verificatie bezig...',
            verifyingTheDetails: 'We controleren een paar gegevens. Concierge laat je weten wanneer Expensify Cards klaar zijn om uit te geven.',
            disclaimer:
                'De Expensify Visa® Commercial Card is uitgegeven door The Bancorp Bank, N.A., lid FDIC, krachtens een licentie van Visa U.S.A. Inc. en kan mogelijk niet bij alle handelaren worden gebruikt die Visa-kaarten accepteren. Apple® en het Apple-logo® zijn handelsmerken van Apple Inc., geregistreerd in de VS en andere landen. App Store is een dienstmerk van Apple Inc. Google Play en het Google Play-logo zijn handelsmerken van Google LLC.',
            euUkDisclaimer:
                'Kaarten verstrekt aan ingezetenen van de EER worden uitgegeven door Transact Payments Malta Limited en kaarten verstrekt aan ingezetenen van het VK worden uitgegeven door Transact Payments Limited krachtens een licentie van Visa Europe Limited. Transact Payments Malta Limited is naar behoren gemachtigd en gereguleerd door de Malta Financial Services Authority als een financiële instelling onder de Financial Institution Act 1994. Registratienummer C 91879. Transact Payments Limited is gemachtigd en gereguleerd door de Gibraltar Financial Service Commission.',
            issueCard: 'Kaart uitgeven',
            findCard: 'Kaart zoeken',
            newCard: 'Nieuwe kaart',
            name: 'Naam',
            lastFour: 'Laatste 4',
            limit: 'Limiet',
            currentBalance: 'Huidige saldo',
            currentBalanceDescription: 'Het huidige saldo is de som van alle geboekte Expensify Card-transacties die hebben plaatsgevonden sinds de laatste afwikkelingsdatum.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Saldo wordt vereffend op ${settlementDate}`,
            settleBalance: 'Saldo vereffenen',
            cardLimit: 'Kaartlimiet',
            remainingLimit: 'Resterende limiet',
            requestLimitIncrease: 'Verzoek limietverhoging',
            remainingLimitDescription:
                'We houden rekening met een aantal factoren bij het berekenen van je resterende limiet: hoe lang je al klant bent, de bedrijfsgegevens die je tijdens de registratie hebt opgegeven en het beschikbare saldo op je zakelijke bankrekening. Je resterende limiet kan dagelijks fluctueren.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Het cashback-saldo is gebaseerd op de afgerekende maandelijkse uitgaven met de Expensify Card binnen je werkruimte.',
            issueNewCard: 'Nieuwe kaart uitgeven',
            finishSetup: 'Voltooi configuratie',
            chooseBankAccount: 'Kies bankrekening',
            chooseExistingBank: 'Kies een bestaande zakelijke bankrekening om je saldo van de Expensify Card te betalen, of voeg een nieuwe bankrekening toe',
            accountEndingIn: 'Rekening eindigend op',
            addNewBankAccount: 'Nieuwe bankrekening toevoegen',
            settlementAccount: 'Afwikkelingsrekening',
            settlementAccountDescription: 'Kies een rekening om het saldo van je Expensify Card te betalen.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Zorg ervoor dat deze rekening overeenkomt met je <a href="${reconciliationAccountSettingsLink}">afstemmingsrekening</a> (${accountNumber}), zodat Continue Reconciliëren goed werkt.`,
            settlementFrequency: 'Frequentie van afwikkeling',
            settlementFrequencyDescription: 'Kies hoe vaak je het saldo van je Expensify Card betaalt.',
            settlementFrequencyInfo:
                'Als je wilt overschakelen naar maandelijkse afwikkeling, moet je je bankrekening via Plaid koppelen en een positieve saldohistorie van 90 dagen hebben.',
            frequency: {
                daily: 'Dagelijks',
                monthly: 'Maandelijks',
            },
            cardDetails: 'Kaartgegevens',
            cardPending: ({name}: {name: string}) => `Kaart is momenteel in behandeling en wordt uitgegeven zodra het account van ${name} is gevalideerd.`,
            virtual: 'Virtueel',
            physical: 'Fysiek',
            deactivate: 'Kaart deactiveren',
            changeCardLimit: 'Limiet van kaart wijzigen',
            changeLimit: 'Limiet wijzigen',
            smartLimitWarning: (limit: number | string) =>
                `Als je de limiet van deze kaart wijzigt naar ${limit}, worden nieuwe transacties geweigerd totdat je meer uitgaven op de kaart goedkeurt.`,
            monthlyLimitWarning: (limit: number | string) => `Als je de limiet van deze kaart wijzigt naar ${limit}, worden nieuwe transacties tot volgende maand geweigerd.`,
            fixedLimitWarning: (limit: number | string) => `Als je de limiet van deze kaart wijzigt naar ${limit}, worden nieuwe transacties geweigerd.`,
            changeCardLimitType: 'Type kaartlimiet wijzigen',
            changeLimitType: 'Limiettype wijzigen',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `Als je het limiettype van deze kaart wijzigt naar Slimme limiet, worden nieuwe transacties geweigerd omdat de niet-goedgekeurde limiet van ${limit} al is bereikt.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Als je het limiettype van deze kaart wijzigt naar Maandelijks, worden nieuwe transacties geweigerd omdat de maandelijkse limiet van ${limit} al is bereikt.`,
            addShippingDetails: 'Verzendgegevens toevoegen',
            issuedCard: (assignee: string) => `heeft een Expensify Card uitgegeven aan ${assignee}! De kaart wordt binnen 2-3 werkdagen bezorgd.`,
            issuedCardNoShippingDetails: (assignee: string) => `heeft een Expensify Card uitgegeven aan ${assignee}! De kaart wordt verzonden zodra de verzendgegevens zijn bevestigd.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `heeft een virtuele Expensify Card uitgegeven aan ${assignee}! De ${link} kan meteen worden gebruikt.`,
            addedShippingDetails: (assignee: string) => `${assignee} heeft verzendgegevens toegevoegd. Expensify Card wordt binnen 2-3 werkdagen bezorgd.`,
            replacedCard: (assignee: string) => `${assignee} heeft hun Expensify Card vervangen. De nieuwe kaart wordt binnen 2-3 werkdagen bezorgd.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} heeft hun virtuele Expensify Card vervangen! De ${link} kan meteen worden gebruikt.`,
            card: 'kaart',
            replacementCard: 'vervangende kaart',
            verifyingHeader: 'Bevestigen',
            bankAccountVerifiedHeader: 'Bankrekening geverifieerd',
            verifyingBankAccount: 'Bankrekening controleren...',
            verifyingBankAccountDescription: 'Even geduld terwijl we bevestigen dat deze rekening kan worden gebruikt om Expensify Cards uit te geven.',
            bankAccountVerified: 'Bankrekening geverifieerd!',
            bankAccountVerifiedDescription: 'Je kunt nu Expensify Cards uitgeven aan de leden van je workspace.',
            oneMoreStep: 'Nog één stap...',
            oneMoreStepDescription: 'Het lijkt erop dat we je bankrekening handmatig moeten verifiëren. Ga naar Concierge, waar je instructies al op je wachten.',
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
            defaultSpendCategories: 'Standaard bestedingscategorieën',
            spendCategoriesDescription: 'Pas aan hoe uitgaven bij leveranciers worden gecategoriseerd voor creditcardtransacties en gescande bonnetjes.',
            deleteFailureMessage: 'Er is een fout opgetreden bij het verwijderen van de categorie, probeer het opnieuw',
            categoryName: 'Categorienaam',
            requiresCategory: 'Leden moeten alle uitgaven categoriseren',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Alle uitgaven moeten worden gecategoriseerd om te kunnen exporteren naar ${connectionName}.`,
            subtitle: 'Krijg beter inzicht in waar geld wordt uitgegeven. Gebruik onze standaardcategorieën of voeg je eigen categorieën toe.',
            emptyCategories: {
                title: 'Je hebt nog geen categorieën aangemaakt',
                subtitle: 'Voeg een categorie toe om je uitgaven te organiseren.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Je categorieën worden momenteel geïmporteerd vanuit een boekhoudkoppeling. Ga naar <a href="${accountingPageURL}">boekhouding</a> om wijzigingen aan te brengen.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de categorie, probeer het opnieuw.',
            createFailureMessage: 'Er is een fout opgetreden bij het maken van de categorie, probeer het opnieuw',
            addCategory: 'Categorie toevoegen',
            editCategory: 'Categorie bewerken',
            editCategories: 'Categorieën bewerken',
            findCategory: 'Categorie zoeken',
            categoryRequiredError: 'Categorienaam is verplicht',
            existingCategoryError: 'Er bestaat al een categorie met deze naam',
            invalidCategoryName: 'Ongeldige categorienaam',
            importedFromAccountingSoftware: 'De onderstaande categorieën zijn geïmporteerd uit je',
            payrollCode: 'Looncode',
            updatePayrollCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de looncode, probeer het opnieuw.',
            glCode: 'Grootboekcode',
            updateGLCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de GL‑code, probeer het opnieuw.',
            importCategories: 'Categorieën importeren',
            cannotDeleteOrDisableAllCategories: {
                title: 'Kan niet alle categorieën verwijderen of uitschakelen',
                description: `Er moet ten minste één categorie ingeschakeld blijven, omdat je werkruimte categorieën vereist.`,
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
                subtitle: 'Stroomlijn je inkomsten en word sneller betaald.',
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
                subtitle: 'Boek, beheer en reconcilieer al uw zakenreizen.',
                getStarted: {
                    title: 'Aan de slag met Expensify Travel',
                    subtitle: 'We hebben nog maar een paar gegevens over je bedrijf nodig, dan ben je klaar voor vertrek.',
                    ctaText: 'Laten we gaan',
                },
                reviewingRequest: {
                    title: 'Pak je koffers, we hebben je verzoek ontvangen...',
                    subtitle: 'We beoordelen momenteel je verzoek om Expensify Travel in te schakelen. Maak je geen zorgen, we laten je weten wanneer het klaar is.',
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
                        subtitle: 'Centraliseer alle reiskosten op één maandfactuur in plaats van bij aankoop te betalen.',
                        learnHow: 'Leer hoe.',
                        subsections: {
                            currentTravelSpendLabel: 'Huidige reiskosten',
                            currentTravelSpendCta: 'Saldo betalen',
                            currentTravelLimitLabel: 'Huidig reistegoed',
                            settlementAccountLabel: 'Afwikkelingsrekening',
                            settlementFrequencyLabel: 'Frequentie van afwikkeling',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Krijg inzicht en controle over uitgaven.',
                disableCardTitle: 'Expensify Card uitschakelen',
                disableCardPrompt: 'Je kunt de Expensify Card niet uitschakelen omdat deze al in gebruik is. Neem contact op met Concierge voor de volgende stappen.',
                disableCardButton: 'Chatten met Concierge',
                feed: {
                    title: 'Vraag de Expensify Card aan',
                    subTitle: 'Vereenvoudig je zakelijke uitgaven en bespaar tot 50% op je Expensify-rekening, plus:',
                    features: {
                        cashBack: 'Cashback op elke aankoop in de VS',
                        unlimited: 'Onbeperkte virtuele kaarten',
                        spend: 'Bestedingslimieten en aangepaste limieten',
                    },
                    ctaTitle: 'Nieuwe kaart uitgeven',
                },
            },
            companyCards: {
                title: 'Bedrijfskaarten',
                subtitle: 'Koppel de kaarten die je al hebt.',
                feed: {
                    title: 'Gebruik je eigen kaarten (BYOC)',
                    subtitle: 'Koppel de kaarten die je al hebt voor automatische transactie-import, bonkoppeling en afstemming.',
                    features: {
                        support: 'Koppel kaarten van meer dan 10.000 banken',
                        assignCards: 'Koppel de bestaande kaarten van je team',
                        automaticImport: 'We halen transacties automatisch op',
                    },
                },
                bankConnectionError: 'Probleem met bankverbinding',
                connectWithPlaid: 'verbinden via Plaid',
                connectWithExpensifyCard: 'probeer de Expensify Card.',
                bankConnectionDescription: `Probeer je kaarten opnieuw toe te voegen. Anders kun je`,
                disableCardTitle: 'Bedrijfspassen uitschakelen',
                disableCardPrompt: 'Je kunt bedrijfskaarten niet uitschakelen omdat deze functie in gebruik is. Neem contact op met de Concierge voor de volgende stappen.',
                disableCardButton: 'Chatten met Concierge',
                cardDetails: 'Kaartgegevens',
                cardNumber: 'Kaartnummer',
                cardholder: 'Kaarthouder',
                cardName: 'Kaartnaam',
                allCards: 'Alle kaarten',
                assignedCards: 'Toegewezen',
                unassignedCards: 'Niet toegewezen',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()}-export` : `${integration}-export`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Kies de ${integration}-rekening waarnaar transacties moeten worden geëxporteerd.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Kies de ${integration}-rekening waarnaar transacties moeten worden geëxporteerd. Selecteer een andere <a href="${exportPageLink}">exportoptie</a> om de beschikbare rekeningen te wijzigen.`,
                lastUpdated: 'Laatst bijgewerkt',
                transactionStartDate: 'Startdatum transactie',
                updateCard: 'Kaart bijwerken',
                unassignCard: 'Kaart toewijzing opheffen',
                unassign: 'Toewijzen ongedaan maken',
                unassignCardDescription: 'Deze kaart loskoppelen verwijdert alle transacties op conceptrapporten uit de rekening van de kaarthouder.',
                assignCard: 'Kaart toewijzen',
                cardFeedName: 'Naam kaartfeed',
                cardFeedNameDescription: 'Geef de kaartfeed een unieke naam zodat je deze kunt onderscheiden van de andere.',
                cardFeedTransaction: 'Transacties verwijderen',
                cardFeedTransactionDescription: 'Kies of kaarthouders kaarttransacties kunnen verwijderen. Nieuwe transacties zullen deze regels volgen.',
                cardFeedRestrictDeletingTransaction: 'Beperken van het verwijderen van transacties',
                cardFeedAllowDeletingTransaction: 'Verwijderen van transacties toestaan',
                removeCardFeed: 'Kaartfeed verwijderen',
                removeCardFeedTitle: (feedName: string) => `${feedName}-feed verwijderen`,
                removeCardFeedDescription: 'Weet je zeker dat je deze kaartfeed wilt verwijderen? Hiermee worden alle kaarten losgekoppeld.',
                error: {
                    feedNameRequired: 'Naam van kaartfeed is vereist',
                    statementCloseDateRequired: 'Selecteer een afschriftdatum.',
                },
                corporate: 'Beperken van het verwijderen van transacties',
                personal: 'Verwijderen van transacties toestaan',
                setFeedNameDescription: 'Geef de kaartfeed een unieke naam zodat je deze van de andere kunt onderscheiden',
                setTransactionLiabilityDescription: 'Indien ingeschakeld kunnen kaarthouders kaarttransacties verwijderen. Nieuwe transacties zullen deze regel volgen.',
                emptyAddedFeedTitle: 'Geen kaarten in dit overzicht',
                emptyAddedFeedDescription: 'Zorg ervoor dat er kaarten in de kaartfeed van je bank staan.',
                pendingFeedTitle: `We beoordelen je verzoek...`,
                pendingFeedDescription: `We beoordelen momenteel je feedgegevens. Zodra dat is afgerond, nemen we contact met je op via`,
                pendingBankTitle: 'Controleer je browservenster',
                pendingBankDescription: (bankName: string) => `Maak verbinding met ${bankName} via het browservenster dat zojuist is geopend. Als er geen venster is geopend,`,
                pendingBankLink: 'klik hier',
                giveItNameInstruction: 'Geef de kaart een naam die haar onderscheidt van andere kaarten.',
                updating: 'Bezig met bijwerken...',
                neverUpdated: 'Nooit',
                noAccountsFound: 'Geen accounts gevonden',
                defaultCard: 'Standaardkaart',
                downgradeTitle: `Kan werkruimte niet downgraden`,
                downgradeSubTitle: `Deze workspace kan niet worden gedegradeerd omdat meerdere kaartfeeds zijn verbonden (met uitzondering van Expensify Cards). <a href="#">Behoud slechts één kaartfeed</a> om door te gaan.`,
                noAccountsFoundDescription: (connection: string) => `Voeg de rekening toe in ${connection} en synchroniseer de koppeling opnieuw`,
                expensifyCardBannerTitle: 'Vraag de Expensify Card aan',
                expensifyCardBannerSubtitle: 'Geniet van cashback op elke aankoop in de VS, tot 50% korting op je Expensify‑rekening, onbeperkte virtuele kaarten en nog veel meer.',
                expensifyCardBannerLearnMoreButton: 'Meer informatie',
                statementCloseDateTitle: 'Einddatum afschrift',
                statementCloseDateDescription: 'Laat ons weten wanneer je kaartafschrift wordt afgesloten, dan maken wij een bijpassend afschrift aan in Expensify.',
            },
            workflows: {
                title: 'Workflows',
                subtitle: 'Bepaal hoe uitgaven worden goedgekeurd en betaald.',
                disableApprovalPrompt:
                    'Expensify Cards van deze werkruimte zijn momenteel afhankelijk van goedkeuring om hun Smart Limits te bepalen. Pas de limiettypen van alle Expensify Cards met Smart Limits aan voordat je goedkeuringen uitschakelt.',
            },
            invoices: {
                title: 'Facturen',
                subtitle: 'Facturen verzenden en ontvangen.',
            },
            categories: {
                title: 'Categorieën',
                subtitle: 'Volg en organiseer uitgaven.',
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
                subtitle: 'Aangepaste velden instellen voor uitgaven.',
            },
            connections: {
                title: 'Boekhouding',
                subtitle: 'Synchroniseer je grootboekrekeningschema en meer.',
            },
            receiptPartners: {
                title: 'Bonnetjespartners',
                subtitle: 'Bonnen automatisch importeren.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Niet zo snel...',
                featureEnabledText: 'Om deze functie in of uit te schakelen, moet je je instellingen voor boekhoudkundige import wijzigen.',
                disconnectText: 'Om de boekhouding uit te schakelen, moet je de boekhoudkoppeling van je workspace ontkoppelen.',
                manageSettings: 'Instellingen beheren',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Verbinding met Uber verbreken',
                disconnectText: 'Om deze functie uit te schakelen, verbreek eerst de koppeling met Uber for Business.',
                description: 'Weet je zeker dat je deze integratie wilt ontkoppelen?',
                confirmText: 'Begrepen',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Niet zo snel...',
                featureEnabledText:
                    'Expensify Cards in deze workspace zijn afhankelijk van goedkeuringsworkflows om hun Smart Limits te bepalen.\n\nWijzig het limiettype van alle kaarten met Smart Limits voordat je workflows uitschakelt.',
                confirmText: 'Ga naar Expensify Cards',
            },
            rules: {
                title: 'Regels',
                subtitle: 'Kwitanties vereisen, hoge uitgaven markeren en meer.',
            },
            timeTracking: {
                title: 'Tijd',
                subtitle: 'Stel een factureerbaar uurtarief in voor tijdregistratie.',
                defaultHourlyRate: 'Standaard uurtarief',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Voorbeelden:',
            customReportNamesSubtitle: `<muted-text>Pas rapporttitels aan met onze <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">uitgebreide formules</a>.</muted-text>`,
            customNameTitle: 'Standaardrapporttitel',
            customNameDescription: `Kies een aangepaste naam voor onkostendeclaraties met behulp van onze <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">uitgebreide formules</a>.`,
            customNameInputLabel: 'Naam',
            customNameEmailPhoneExample: 'E-mailadres of telefoon van lid: {report:submit:from}',
            customNameStartDateExample: 'Startdatum rapport: {report:startdate}',
            customNameWorkspaceNameExample: 'Naam van werkruimte: {report:workspacename}',
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
                title: 'Je hebt nog geen rapportvelden gemaakt',
                subtitle: 'Voeg een aangepast veld (tekst, datum of keuzelijst) toe dat op rapporten verschijnt.',
            },
            subtitle: 'Rapportvelden zijn van toepassing op alle uitgaven en kunnen nuttig zijn wanneer je om extra informatie wilt vragen.',
            disableReportFields: 'Rapportvelden uitschakelen',
            disableReportFieldsConfirmation: 'Weet je het zeker? Tekst- en datumvelden worden verwijderd en lijsten worden uitgeschakeld.',
            importedFromAccountingSoftware: 'De onderstaande rapportvelden zijn geïmporteerd uit je',
            textType: 'Tekst',
            dateType: 'Datum',
            dropdownType: 'Lijst',
            formulaType: 'Formule',
            textAlternateText: 'Voeg een veld toe voor vrije-tekstinvoer.',
            dateAlternateText: 'Voeg een kalender toe voor datumselectie.',
            dropdownAlternateText: 'Voeg een lijst met opties toe om uit te kiezen.',
            formulaAlternateText: 'Voeg een formuleveld toe.',
            nameInputSubtitle: 'Kies een naam voor het rapportveld.',
            typeInputSubtitle: 'Kies welk type rapportveld je wilt gebruiken.',
            initialValueInputSubtitle: 'Voer een startwaarde in om in het rapportveld weer te geven.',
            listValuesInputSubtitle: 'Deze waarden worden weergegeven in de keuzelijst van je rapportveld. Ingeschakelde waarden kunnen door leden worden geselecteerd.',
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
            listValueRequiredError: 'Voer een naam voor de lijstwaarde in',
            existingListValueError: 'Er bestaat al een lijstwaarde met deze naam',
            editValue: 'Waarde bewerken',
            listValues: 'Waarden weergeven',
            addValue: 'Waarde toevoegen',
            existingReportFieldNameError: 'Er bestaat al een rapportveld met deze naam',
            reportFieldNameRequiredError: 'Voer een rapportveldnaam in',
            reportFieldTypeRequiredError: 'Kies een veldtype voor het rapport',
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
            requireTag: 'Label verplicht',
            requireTags: 'Vereiste tags',
            notRequireTags: 'Niet vereisen',
            disableTag: 'Tag uitschakelen',
            disableTags: 'Tags uitschakelen',
            addTag: 'Tag toevoegen',
            editTag: 'Label bewerken',
            editTags: 'Labels bewerken',
            findTag: 'Tag zoeken',
            subtitle: 'Labels geven meer gedetailleerde manieren om kosten te classificeren.',
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>Je gebruikt <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">afhankelijke labels</a>. Je kunt een <a href="${importSpreadsheetLink}">spreadsheet opnieuw importeren</a> om je labels bij te werken.</muted-text>`,
            emptyTags: {
                title: 'Je hebt nog geen tags aangemaakt',
                subtitle: 'Voeg een tag toe om projecten, locaties, afdelingen en meer bij te houden.',
                subtitleHTML: `<muted-text><centered-text>Voeg labels toe om projecten, locaties, afdelingen en meer bij te houden. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Meer informatie</a> over het opmaken van labelfiles voor import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Je labels worden momenteel geïmporteerd vanuit een boekhoudkoppeling. Ga naar <a href="${accountingPageURL}">boekhouding</a> om wijzigingen aan te brengen.</centered-text></muted-text>`,
            },
            deleteTag: 'Tag verwijderen',
            deleteTags: 'Tags verwijderen',
            deleteTagConfirmation: 'Weet je zeker dat je deze tag wilt verwijderen?',
            deleteTagsConfirmation: 'Weet je zeker dat je deze tags wilt verwijderen?',
            deleteFailureMessage: 'Er is een fout opgetreden bij het verwijderen van de tag, probeer het opnieuw.',
            tagRequiredError: 'Tagnaam is verplicht',
            existingTagError: 'Er bestaat al een tag met deze naam',
            invalidTagNameError: 'Tagnaam mag niet 0 zijn. Kies een andere waarde.',
            genericFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de tag, probeer het opnieuw',
            importedFromAccountingSoftware: 'Tags worden beheerd in je',
            employeesSeeTagsAs: 'Werknemers zien tags als',
            glCode: 'Grootboekcode',
            updateGLCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de GL‑code, probeer het opnieuw.',
            tagRules: 'Tagregels',
            approverDescription: 'Fiatteur',
            importTags: 'Tags importeren',
            importTagsSupportingText: 'Codeer je uitgaven met één type tag of met meerdere.',
            configureMultiLevelTags: 'Configureer je lijst met tags voor taggen op meerdere niveaus.',
            importMultiLevelTagsSupportingText: `Hier is een voorbeeld van je tags. Als alles er goed uitziet, klik dan hieronder om ze te importeren.`,
            importMultiLevelTags: {
                firstRowTitle: 'De eerste rij is de titel voor elke taglijst',
                independentTags: 'Dit zijn onafhankelijke tags',
                glAdjacentColumn: 'Er staat een GL-code in de aangrenzende kolom',
            },
            tagLevel: {
                singleLevel: 'Enkel niveau van tags',
                multiLevel: 'Meerdere niveaus van tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Tagniveaus wisselen',
                prompt1: 'Als je van tagniveau wisselt, worden alle huidige tags gewist.',
                prompt2: 'We raden je aan om eerst',
                prompt3: 'een back-up downloaden',
                prompt4: 'door je tags te exporteren.',
                prompt5: 'Meer informatie',
                prompt6: 'over tagniveaus.',
            },
            overrideMultiTagWarning: {
                title: 'Tags importeren',
                prompt1: 'Weet je het zeker?',
                prompt2: 'De bestaande tags worden overschreven, maar je kunt',
                prompt3: 'een back-up downloaden',
                prompt4: 'eerst.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `We hebben *${columnCounts} kolommen* in je spreadsheet gevonden. Selecteer *Naam* naast de kolom die tagnamen bevat. Je kunt ook *Ingeschakeld* selecteren naast de kolom die de tagstatus instelt.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Kan niet alle tags verwijderen of uitschakelen',
                description: `Er moet minstens één tag ingeschakeld blijven, omdat je werkruimte tags vereist.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Kan niet alle tags optioneel maken',
                description: `Er moet minimaal één tag verplicht blijven, omdat de instellingen van je werkruimte tags vereisen.`,
            },
            cannotMakeTagListRequired: {
                title: 'Kan taglijst niet verplicht maken',
                description: 'Je kunt een taglijst alleen verplicht maken als je beleid meerdere tag­niveaus heeft geconfigureerd.',
            },
            tagCount: () => ({
                one: '1 dag',
                other: (count: number) => `${count} labels`,
            }),
        },
        taxes: {
            subtitle: 'Belastingnamen en -tarieven toevoegen en standaarden instellen.',
            addRate: 'Tarief toevoegen',
            workspaceDefault: 'Standaardvaluta van de werkruimte',
            foreignDefault: 'Standaard vreemde valuta',
            customTaxName: 'Aangepaste belastingnaam',
            value: 'Waarde',
            taxReclaimableOn: 'Fiscaal terugvorderbaar op',
            taxRate: 'Belastingtarief',
            findTaxRate: 'Belastingtarief zoeken',
            error: {
                taxRateAlreadyExists: 'Deze belastingnaam is al in gebruik',
                taxCodeAlreadyExists: 'Deze belastingcode is al in gebruik',
                valuePercentageRange: 'Voer een geldig percentage in tussen 0 en 100',
                customNameRequired: 'Aangepaste belastingnaam is verplicht',
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
            title: 'Geef je nieuwe workspace een naam',
            selectFeatures: 'Selecteer functies om te kopiëren',
            whichFeatures: 'Welke functies wil je overzetten naar je nieuwe workspace?',
            confirmDuplicate: 'Wil je doorgaan?',
            categories: 'categorieën en je automatische categorisatieregels',
            reimbursementAccount: 'terugbetalingsrekening',
            welcomeNote: 'Gebruik alsjeblieft mijn nieuwe werkruimte',
            delayedSubmission: 'uitgestelde indiening',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Je staat op het punt ${newWorkspaceName ?? ''} te maken en te delen met ${totalMembers ?? 0} leden van de oorspronkelijke werkruimte.`,
            error: 'Er is een fout opgetreden bij het dupliceren van je nieuwe workspace. Probeer het opnieuw.',
        },
        emptyWorkspace: {
            title: 'Je hebt geen werkruimtes',
            subtitle: 'Volg bonnetjes, vergoed uitgaven, beheer reizen, verstuur facturen en meer.',
            createAWorkspaceCTA: 'Aan de slag',
            features: {
                trackAndCollect: 'Bonnen bijhouden en verzamelen',
                reimbursements: 'Werknemers terugbetalen',
                companyCards: 'Bedrijfskaarten beheren',
            },
            notFound: 'Geen werkruimte gevonden',
            description: 'Rooms zijn een geweldige plek om met meerdere mensen te overleggen en samen te werken. Maak of word lid van een werkruimte om te beginnen met samenwerken',
        },
        new: {
            newWorkspace: 'Nieuwe werkruimte',
            getTheExpensifyCardAndMore: 'Krijg de Expensify Card en meer',
            confirmWorkspace: 'Workspace bevestigen',
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
                `${memberName} is een fiatteur in deze workspace. Als je deze workspace niet meer met hen deelt, vervangen we hen in de fiatteerstroom door de eigenaar van de workspace, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Lid verwijderen',
                other: 'Leden verwijderen',
            }),
            findMember: 'Lid zoeken',
            removeWorkspaceMemberButtonTitle: 'Verwijderen uit workspace',
            removeGroupMemberButtonTitle: 'Uit groep verwijderen',
            removeRoomMemberButtonTitle: 'Verwijderen uit chat',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Weet je zeker dat je ${memberName} wilt verwijderen?`,
            removeMemberTitle: 'Lid verwijderen',
            transferOwner: 'Eigenaar overdragen',
            makeMember: () => ({
                one: 'Maak lid',
                other: 'Leden maken',
            }),
            makeAdmin: () => ({
                one: 'Beheerder maken',
                other: 'Beheerders maken',
            }),
            makeAuditor: () => ({
                one: 'Accountant maken',
                other: 'Auditors maken',
            }),
            selectAll: 'Alles selecteren',
            error: {
                genericAdd: 'Er is een probleem opgetreden bij het toevoegen van dit werkruimtelid',
                cannotRemove: 'Je kunt jezelf of de eigenaar van de workspace niet verwijderen',
                genericRemove: 'Er is een probleem opgetreden bij het verwijderen van dat werkruimtelid',
            },
            addedWithPrimary: 'Sommige leden zijn toegevoegd met hun primaire logins.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Toegevoegd door secundaire login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Totaal aantal werkruimteleden: ${count}`,
            importMembers: 'Leden importeren',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Als je ${approver} uit deze workspace verwijdert, vervangen we diegene in de goedkeuringsworkflow door ${workspaceOwner}, de eigenaar van de workspace.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} heeft openstaande onkostendeclaraties om goed te keuren. Vraag hen deze goed te keuren of neem de controle over hun declaraties voordat je hen uit de workspace verwijdert.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Je kunt ${memberName} niet uit deze workspace verwijderen. Stel eerst een nieuwe terugbetaler in via Workflows > Betalingen uitvoeren of volgen en probeer het dan opnieuw.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Als je ${memberName} uit deze werkruimte verwijdert, vervangen we hen als de voorkeursverzender door ${workspaceOwner}, de eigenaar van de werkruimte.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Als je ${memberName} uit deze werkruimte verwijdert, vervangen we hen als technisch contactpersoon door ${workspaceOwner}, de eigenaar van de werkruimte.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} heeft een openstaand rapport in verwerking waarop actie moet worden ondernomen. Vraag hen om de vereiste actie te voltooien voordat je hen uit de werkruimte verwijdert.`,
        },
        card: {
            getStartedIssuing: 'Begin met het uitgeven van je eerste virtuele of fysieke kaart.',
            issueCard: 'Kaart uitgeven',
            issueNewCard: {
                whoNeedsCard: 'Wie heeft er een kaart nodig?',
                inviteNewMember: 'Nieuw lid uitnodigen',
                findMember: 'Lid zoeken',
                chooseCardType: 'Kies een kaarttype',
                physicalCard: 'Fysieke kaart',
                physicalCardDescription: 'Ideaal voor de frequente uitgavenindiener',
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
                giveItNameInstruction: 'Maak het uniek genoeg om het te onderscheiden van andere kaarten. Specifieke gebruikssituaties zijn nog beter!',
                cardName: 'Kaartnaam',
                letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
                willBeReadyToUse: 'Deze kaart is direct klaar voor gebruik.',
                willBeReadyToShip: 'Deze kaart is direct klaar om te verzenden.',
                cardholder: 'Kaarthouder',
                cardType: 'Kaarttype',
                limit: 'Limiet',
                limitType: 'Limiettype',
                disabledApprovalForSmartLimitError: 'Schakel eerst goedkeuringen in via <strong>Workflows > Goedkeuringen toevoegen</strong> voordat je slimme limieten instelt',
            },
            deactivateCardModal: {
                deactivate: 'Deactiveren',
                deactivateCard: 'Kaart deactiveren',
                deactivateConfirmation: 'Als je deze kaart deactiveert, worden alle toekomstige transacties geweigerd en kan dit niet ongedaan worden gemaakt.',
            },
        },
        accounting: {
            settings: 'instellingen',
            title: 'Verbindingen',
            subtitle: 'Maak verbinding met je boekhoudsysteem om transacties te coderen met je grootboekschema, betalingen automatisch te matchen en je financiën synchroon te houden.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chat met je instellingsspecialist.',
            talkYourAccountManager: 'Chat met je accountmanager.',
            talkToConcierge: 'Chat met Concierge.',
            needAnotherAccounting: 'Nog een ander boekhoudprogramma nodig?',
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
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integratie';
                return `Verbinding met ${integrationName} verbreken`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Verbind ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'accountingintegratie'}`,
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
            accounts: 'Grootboekschema',
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
                return `Weet je zeker dat je ${integrationName} wilt ontkoppelen?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Weet je zeker dat je ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'deze boekhoudintegratie'} wilt koppelen? Dit verwijdert alle bestaande boekhoudkoppelingen.`,
            enterCredentials: 'Voer je inloggegevens in',
            claimOffer: {
                badgeText: 'Aanbieding beschikbaar!',
                xero: {
                    headline: 'Krijg Xero 6 maanden gratis!',
                    description: '<muted-text><centered-text>Nieuw bij Xero? Expensify-klanten krijgen 6 maanden gratis. Claim hieronder je aanbieding.</centered-text></muted-text>',
                    connectButton: 'Verbind met Xero',
                },
                uber: {
                    headerTitle: 'Uber voor Bedrijven',
                    headline: 'Krijg 5% korting op Uber-ritten',
                    description: `<muted-text><centered-text>Activeer Uber for Business via Expensify en bespaar 5% op alle zakelijke ritten tot en met juni. <a href="${CONST.UBER_TERMS_LINK}">Voorwaarden van toepassing.</a></centered-text></muted-text>`,
                    connectButton: 'Verbind met Uber for Business',
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
                            return 'Klassen importeren';
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
                            return 'Opslaan van beleid importeren';
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
                            return 'Wachten tot geïmporteerde gegevens zijn geladen';
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
                            return 'Valuta’s synchroniseren';
                        case 'netSuiteSyncCategories':
                            return 'Categorieën synchroniseren';
                        case 'netSuiteSyncReportFields':
                            return 'Gegevens importeren als Expensify-rapportvelden';
                        case 'netSuiteSyncTags':
                            return 'Gegevens importeren als Expensify-tags';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Verbindingsinformatie bijwerken';
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
                            return `Vertaling ontbreekt voor fase: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Voorkeursexporteur',
            exportPreferredExporterNote:
                'De voorkeursexporteur kan elke werkruimtebeheerder zijn, maar moet ook een domeinbeheerder zijn als je in Domeininstellingen verschillende exportrekeningen instelt voor individuele bedrijfskaarten.',
            exportPreferredExporterSubNote: 'Zodra dit is ingesteld, ziet de voorkeurs-exporteur in zijn of haar account de rapporten die moeten worden geëxporteerd.',
            exportAs: 'Exporteren als',
            exportOutOfPocket: 'Out-of-pocketuitgaven exporteren als',
            exportCompanyCard: 'Exporteer bedrijfskaartuitgaven als',
            exportDate: 'Exportdatum',
            defaultVendor: 'Standaardleverancier',
            autoSync: 'Automatisch synchroniseren',
            autoSyncDescription: 'Synchroniseer NetSuite en Expensify automatisch, elke dag. Exporteer het afgeronde rapport in realtime',
            reimbursedReports: 'Vergoedde rapporten synchroniseren',
            cardReconciliation: 'Kaartafstemming',
            reconciliationAccount: 'Rekening voor afstemming',
            continuousReconciliation: 'Doorlopende afstemming',
            saveHoursOnReconciliation:
                'Bespaar elke boekhoudperiode uren op de reconciliatie door Expensify continu de afschriften en afwikkelingen van je Expensify Card voor je te laten reconciliëren.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Om Voortdurende Afstemming in te schakelen, schakel dan <a href="${accountingAdvancedSettingsLink}">automatisch synchroniseren</a> in voor ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Kies de bankrekening waarmee je betalingen met de Expensify Card worden afgeletterd.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Zorg dat deze rekening overeenkomt met je <a href="${settlementAccountUrl}">Expensify Card-afrekenrekening</a> (eindigend op ${lastFourPAN}), zodat Continuous Reconciliation goed werkt.`,
            },
        },
        export: {
            notReadyHeading: 'Nog niet klaar om te exporteren',
            notReadyDescription:
                'Concept- of in afwachting zijnde onkostendeclaraties kunnen niet naar het boekhoudsysteem worden geëxporteerd. Keur deze onkosten eerst goed of betaal ze voordat je ze exporteert.',
        },
        invoices: {
            sendInvoice: 'Factuur verzenden',
            sendFrom: 'Verzenden vanaf',
            invoicingDetails: 'Factuurgegevens',
            invoicingDetailsDescription: 'Deze informatie wordt op je facturen weergegeven.',
            companyName: 'Bedrijfsnaam',
            companyWebsite: 'Bedrijfswebsite',
            paymentMethods: {
                personal: 'Persoonlijk',
                business: 'Zakelijk',
                chooseInvoiceMethod: 'Kies hieronder een betaalmethode:',
                payingAsIndividual: 'Betalen als individu',
                payingAsBusiness: 'Betalen als bedrijf',
            },
            invoiceBalance: 'Factuursaldo',
            invoiceBalanceSubtitle: 'Dit is je huidige saldo uit geïnde factuurbetalingen. Het wordt automatisch naar je bankrekening overgemaakt als je er een hebt toegevoegd.',
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
            confirmDetails: 'Bevestig gegevens',
            inviteMessagePrompt: 'Maak je uitnodiging extra speciaal door hieronder een bericht toe te voegen!',
            personalMessagePrompt: 'Bericht',
            genericFailureMessage: 'Er is een fout opgetreden bij het uitnodigen van het lid voor de werkruimte. Probeer het opnieuw.',
            inviteNoMembersError: 'Selecteer minimaal één lid om uit te nodigen',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} heeft verzocht om lid te worden van ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Oeps! Niet zo snel...',
            workspaceNeeds: 'Een werkruimte heeft minstens één ingeschakelde afstandstarief nodig.',
            distance: 'Afstand',
            centrallyManage: 'Beheer tarieven centraal, houd afstanden bij in mijlen of kilometers en stel een standaardcategorie in.',
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
                '<muted-text>Belastingen moeten in de workspace zijn ingeschakeld om deze functie te gebruiken. Ga naar <a href="#">Meer functies</a> om dat te wijzigen.</muted-text>',
            deleteDistanceRate: 'Kilometervergoeding verwijderen',
            areYouSureDelete: () => ({
                one: 'Weet je zeker dat je dit tarief wilt verwijderen?',
                other: 'Weet je zeker dat je deze tarieven wilt verwijderen?',
            }),
            errors: {
                rateNameRequired: 'Tariefnaam is vereist',
                existingRateName: 'Er bestaat al een afstandstarief met deze naam',
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
            currencyInputHelpText: 'Alle onkosten in deze workspace worden omgezet naar deze valuta.',
            currencyInputDisabledText: (currency: string) => `De standaardvaluta kan niet worden gewijzigd omdat deze werkruimte is gekoppeld aan een ${currency}-bankrekening.`,
            save: 'Opslaan',
            genericFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de workspace. Probeer het opnieuw.',
            avatarUploadFailureMessage: 'Er is een fout opgetreden bij het uploaden van de avatar. Probeer het opnieuw.',
            addressContext: 'Een werkruimteadres is vereist om Expensify Travel in te schakelen. Voer een adres in dat aan uw bedrijf is gekoppeld.',
            policy: 'Declaratiebeleid',
        },
        bankAccount: {
            continueWithSetup: 'Setup vervolgen',
            youAreAlmostDone:
                'Je bent bijna klaar met het instellen van je bankrekening, waarmee je bedrijfskaarten kunt uitgeven, onkosten kunt vergoeden, facturen kunt innen en rekeningen kunt betalen.',
            streamlinePayments: 'Betalingen stroomlijnen',
            connectBankAccountNote: 'Let op: persoonlijke bankrekeningen kunnen niet worden gebruikt voor betalingen in werkruimtes.',
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
            disconnectYourBankAccount: (bankName: string) =>
                `Koppel je <strong>${bankName}</strong>-bankrekening los. Alle openstaande transacties voor deze rekening worden nog steeds uitgevoerd.`,
            clearProgress: 'Opnieuw beginnen wist de voortgang die je tot nu toe hebt geboekt.',
            areYouSure: 'Weet je het zeker?',
            workspaceCurrency: 'Werkruimtevaluta',
            updateCurrencyPrompt: 'Het lijkt erop dat je werkruimte momenteel is ingesteld op een andere valuta dan USD. Klik hieronder op de knop om je valuta nu bij te werken naar USD.',
            updateToUSD: 'Bijwerken naar USD',
            updateWorkspaceCurrency: 'Werkruimtemunteenheid bijwerken',
            workspaceCurrencyNotSupported: 'Werkruimtevaluta wordt niet ondersteund',
            yourWorkspace: `Je werkruimte is ingesteld op een niet-ondersteunde valuta. Bekijk de <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">lijst met ondersteunde valuta</a>.`,
            chooseAnExisting: 'Kies een bestaande bankrekening om onkosten te betalen of voeg een nieuwe toe.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Eigenaar overdragen',
            addPaymentCardTitle: 'Voer je betaalkaart in om het eigendom over te dragen',
            addPaymentCardButtonText: 'Accepteer voorwaarden en voeg betaalkaart toe',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Lees en accepteer de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">voorwaarden</a> en het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacybeleid</a> om je kaart toe te voegen.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS-conform',
            addPaymentCardBankLevelEncrypt: 'Versleuteling op bankniveau',
            addPaymentCardRedundant: 'Redundante infrastructuur',
            addPaymentCardLearnMore: `<muted-text>Lees meer over onze <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">beveiliging</a>.</muted-text>`,
            amountOwedTitle: 'Openstaand saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Deze rekening heeft een openstaand saldo van een vorige maand.\n\nWil je het saldo vereffenen en de facturatie van deze workspace overnemen?',
            ownerOwesAmountTitle: 'Openstaand saldo',
            ownerOwesAmountButtonText: 'Saldo overboeken',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `De rekening die eigenaar is van deze werkruimte (${email}) heeft een openstaand saldo van een vorige maand.

Wil je dit bedrag (${amount}) overnemen om de facturering voor deze werkruimte op jouw naam te zetten? Je betaalkaart wordt onmiddellijk belast.`,
            subscriptionTitle: 'Jaarabonnement overnemen',
            subscriptionButtonText: 'Abonnement overdragen',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Als je deze werkruimte overneemt, wordt het jaarlijkse abonnement ervan samengevoegd met je huidige abonnement. Hierdoor wordt je abonnementsomvang verhoogd met ${usersCount} leden en wordt je nieuwe abonnementsomvang ${finalCount}. Wil je doorgaan?`,
            duplicateSubscriptionTitle: 'Waarschuwing voor dubbele abonnementen',
            duplicateSubscriptionButtonText: 'Doorgaan',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Het lijkt erop dat je de facturatie voor de werkruimtes van ${email} wilt overnemen, maar daarvoor moet je eerst beheerder zijn van al hun werkruimtes.

Klik op "Doorgaan" als je alleen de facturatie voor de werkruimte ${workspaceName} wilt overnemen.

Als je de facturatie voor hun volledige abonnement wilt overnemen, laat hen je dan eerst als beheerder toevoegen aan al hun werkruimtes voordat je de facturatie overneemt.`,
            hasFailedSettlementsTitle: 'Kan eigendom niet overdragen',
            hasFailedSettlementsButtonText: 'Begrepen',
            hasFailedSettlementsText: (email: string) =>
                `Je kunt de facturering niet overnemen omdat ${email} een achterstallige Expensify Card-afrekening heeft. Vraag hen om contact op te nemen met concierge@expensify.com om het probleem op te lossen. Daarna kun je de facturering voor deze workspace overnemen.`,
            failedToClearBalanceTitle: 'Saldo wissen mislukt',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'We konden het saldo niet wissen. Probeer het later opnieuw.',
            successTitle: 'Woohoo! Helemaal klaar.',
            successDescription: 'Je bent nu de eigenaar van deze werkruimte.',
            errorTitle: 'Oeps! Niet zo snel...',
            errorDescription: `<muted-text><centered-text>Er is een probleem opgetreden bij het overdragen van het eigendom van deze werkruimte. Probeer het opnieuw, of <concierge-link>neem contact op met Concierge</concierge-link> voor hulp.</centered-text></muted-text>`,
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
                description: `Rapportvelden laten je kopniveaugegevens opgeven, anders dan labels die betrekking hebben op de uitgaven op afzonderlijke regels. Deze gegevens kunnen onder andere specifieke projectnamen, informatie over zakenreizen, locaties en meer omvatten.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Rapportvelden zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Profiteer van automatische synchronisatie en verminder handmatige invoer met de Expensify + NetSuite-integratie. Krijg diepgaande realtime financiële inzichten dankzij ondersteuning voor native en aangepaste segmenten, inclusief project- en klantkoppeling.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Onze NetSuite-integratie is alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Profiteer van automatische synchronisatie en verminder handmatige invoer met de Expensify + Sage Intacct-integratie. Krijg diepgaande realtime financiële inzichten met door de gebruiker gedefinieerde dimensies, evenals onkostencodering per afdeling, klasse, locatie, klant en project (baan).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Onze Sage Intacct-integratie is alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Profiteer van automatische synchronisatie en verminder handmatige invoer met de Expensify + QuickBooks Desktop-integratie. Bereik maximale efficiëntie met een realtime, tweerichtingsverbinding en onkostencodering op basis van klasse, item, klant en project.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Onze QuickBooks Desktop-integratie is alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Geavanceerde goedkeuringen',
                description: `Als je meer lagen van goedkeuring wilt toevoegen – of gewoon zeker wilt weten dat de grootste uitgaven een extra paar ogen krijgen – dan ben je bij ons aan het juiste adres. Geavanceerde goedkeuringen helpen je om op elk niveau de juiste controles in te bouwen, zodat je de uitgaven van je team onder controle houdt.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Geavanceerde goedkeuringen zijn alleen beschikbaar in het Control-abonnement, dat begint bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            categories: {
                title: 'Categorieën',
                description: 'Met categorieën kun je uitgaven bijhouden en ordenen. Gebruik onze standaardcategorieën of voeg je eigen categorieën toe.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Categorieën zijn beschikbaar in het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            glCodes: {
                title: 'Grootboekcodes',
                description: `Voeg GL-codes toe aan je categorieën en tags voor eenvoudige export van uitgaven naar je boekhoud- en salarissystemen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL-codes zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Grootboek- en loonlijstcodes',
                description: `Voeg GL- en loonadministratiecodes toe aan je categorieën voor eenvoudige export van uitgaven naar je boekhoud- en loonadministratiesystemen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL- en loonlijstcodes zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Belastingcodes',
                description: `Voeg belastingcodes toe aan je belastingen voor eenvoudige export van onkosten naar je boekhoud- en salarissystemen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Belastingcodes zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            companyCards: {
                title: 'Onbeperkt aantal bedrijfskaarten',
                description: `Meer kaartfeeds nodig? Ontgrendel onbeperkte bedrijfskaarten om transacties van alle grote kaartuitgevers te synchroniseren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dit is alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            rules: {
                title: 'Regels',
                description: `Regels worden op de achtergrond uitgevoerd en houden je uitgaven onder controle, zodat jij je geen zorgen hoeft te maken over de kleine dingen.

Vereis onkostendetails zoals bonnetjes en beschrijvingen, stel limieten en standaarden in, en automatiseer goedkeuringen en betalingen – allemaal op één plek.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Regels zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            perDiem: {
                title: 'Dagvergoeding',
                description:
                    'Per diem is een geweldige manier om je dagelijkse kosten compliant en voorspelbaar te houden wanneer je medewerkers reizen. Profiteer van functies zoals aangepaste tarieven, standaardcategorieën en meer gedetailleerde informatie zoals bestemmingen en subtarieven.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dagvergoedingen zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            travel: {
                title: 'Reizen',
                description: 'Expensify Travel is een nieuw platform voor het boeken en beheren van zakelijke reizen waarmee leden accommodaties, vluchten, vervoer en meer kunnen boeken.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Reizen is beschikbaar in het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            reports: {
                title: 'Rapporten',
                description: 'Rapporten stellen je in staat om uitgaven te groeperen voor eenvoudigere opvolging en organisatie.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Rapporten zijn beschikbaar in het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Meerdere niveaus van tags',
                description:
                    'Tags op meerdere niveaus helpen je uitgaven nauwkeuriger bij te houden. Wijs meerdere tags toe aan elk regelitem—zoals afdeling, klant of kostenplaats—om de volledige context van elke uitgave vast te leggen. Dit maakt meer gedetailleerde rapportages, goedkeuringsworkflows en boekhoudkundige exports mogelijk.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Labels met meerdere niveaus zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Kilometertarieven',
                description: 'Maak en beheer je eigen tarieven, volg afstanden in mijlen of kilometers en stel standaardcategorieën in voor afstandskosten.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Afstandstarieven zijn beschikbaar in het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            auditor: {
                title: 'Auditor',
                description: 'Auditors krijgen alleen-lezen-toegang tot alle rapporten voor volledige transparantie en nalevingsbewaking.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Auditors zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Meerdere goedkeuringsniveaus',
                description: 'Meerdere goedkeuringsniveaus is een workflowtool voor bedrijven waarvoor meer dan één persoon een rapport moet goedkeuren voordat het kan worden vergoed.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Meerdere goedkeuringsniveaus zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}</muted-text>`,
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
                    `<centered-text>Je hebt ${policyName} succesvol geüpgraded naar het Control-abonnement! <a href="${subscriptionLink}">Bekijk je abonnement</a> voor meer details.</centered-text>`,
                categorizeMessage: `Je bent succesvol overgestapt naar het Collect-abonnement. Nu kun je je uitgaven categoriseren!`,
                travelMessage: `Je bent succesvol overgestapt naar het Collect-abonnement. Je kunt nu beginnen met het boeken en beheren van reizen!`,
                distanceRateMessage: `Je bent succesvol overgestapt naar het Collect-abonnement. Nu kun je het kilometertarief wijzigen!`,
                gotIt: 'Begrepen, bedankt',
                createdWorkspace: `Je hebt een workspace aangemaakt!`,
            },
            commonFeatures: {
                title: 'Upgrade naar het Control-abonnement',
                note: 'Ontgrendel onze krachtigste functies, waaronder:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Het Control-abonnement begint bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actief lid per maand.`}. <a href="${learnMoreMethodsRoute}">Meer informatie</a> over onze abonnementen en prijzen.</muted-text>`,
                    benefit1: 'Geavanceerde boekhoudkoppelingen (NetSuite, Sage Intacct en meer)',
                    benefit2: 'Slimme uitgaveregels',
                    benefit3: 'Goedkeuringsworkflows met meerdere niveaus',
                    benefit4: 'Verbeterde beveiligingsinstellingen',
                    toUpgrade: 'Klik om te upgraden',
                    selectWorkspace: 'selecteer een workspace en wijzig het abonnementstype naar',
                },
                upgradeWorkspaceWarning: `Kan werkruimte niet upgraden`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: 'Je bedrijf heeft het maken van werkruimtes beperkt. Neem contact op met een beheerder voor hulp.',
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
                    benefit2: 'Slimme uitgaveregels',
                    benefit3: 'Goedkeuringsworkflows met meerdere niveaus',
                    benefit4: 'Verbeterde beveiligingsinstellingen',
                    headsUp: 'Let op!',
                    multiWorkspaceNote: 'Je moet al je werkruimtes downgraden vóór je eerste maandelijkse betaling om een abonnement te starten tegen het Collect-tarief. Klik',
                    selectStep: '> selecteer elke werkruimte > wijzig het abonnements­type naar',
                },
            },
            completed: {
                headline: 'Je werkruimte is gedegradeerd',
                description: 'Je hebt andere werkruimtes op het Control-abonnement. Om tegen het Collect-tarief gefactureerd te worden, moet je alle werkruimtes downgraden.',
                gotIt: 'Begrepen, bedankt',
            },
        },
        payAndDowngrade: {
            title: 'Betalen en downgradeen',
            headline: 'Je laatste betaling',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Je laatste factuur voor dit abonnement is <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Bekijk je uitsplitsing hieronder voor ${date}:`,
            subscription:
                'Let op! Deze actie beëindigt je Expensify-abonnement, verwijdert deze workspace en verwijdert alle leden van de workspace. Als je deze workspace wilt behouden en alleen jezelf wilt verwijderen, laat dan eerst een andere beheerder de facturering overnemen.',
            genericFailureMessage: 'Er is een fout opgetreden bij het betalen van je rekening. Probeer het alsjeblieft opnieuw.',
        },
        restrictedAction: {
            restricted: 'Beperkt',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Acties in de ${workspaceName}-werkruimte zijn momenteel beperkt`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `De eigenaar van de werkruimte, ${workspaceOwnerName}, moet de betaalkaart in het dossier toevoegen of bijwerken om nieuwe werkruimte-activiteit te ontgrendelen.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Je moet de betaalkaart in het bestand toevoegen of bijwerken om nieuwe werkruimte-activiteit te ontgrendelen.',
            addPaymentCardToUnlock: 'Voeg een betaalkaart toe om te ontgrendelen!',
            addPaymentCardToContinueUsingWorkspace: 'Voeg een betaalkaart toe om deze workspace te blijven gebruiken',
            pleaseReachOutToYourWorkspaceAdmin: 'Neem bij vragen contact op met je workspacebeheerder.',
            chatWithYourAdmin: 'Chat met je beheerder',
            chatInAdmins: 'Chatten in #admins',
            addPaymentCard: 'Betaalkaart toevoegen',
            goToSubscription: 'Ga naar abonnement',
        },
        rules: {
            individualExpenseRules: {
                title: 'Declaraties',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Stel bestedingslimieten en standaardinstellingen in voor afzonderlijke uitgaven. Je kunt ook regels maken voor <a href="${categoriesPageLink}">categorieën</a> en <a href="${tagsPageLink}">labels</a>.</muted-text>`,
                receiptRequiredAmount: 'Vereist bonbedrag',
                receiptRequiredAmountDescription: 'Bonnen vereisen wanneer de uitgaven dit bedrag overschrijden, tenzij dit wordt overschreven door een categoriregel.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `Bedrag mag niet hoger zijn dan het vereiste bedrag van de gespecificeerde bon (${amount})`,
                itemizedReceiptRequiredAmount: 'Vereist bedrag voor gespecificeerde bon',
                itemizedReceiptRequiredAmountDescription: 'Artikelbonnen vereisen wanneer de uitgaven dit bedrag overschrijden, tenzij overschreven door een categoriregel.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `Bedrag mag niet lager zijn dan het bedrag dat vereist is voor gewone bonnen (${amount})`,
                maxExpenseAmount: 'Maximumbedrag onkosten',
                maxExpenseAmountDescription: 'Markeer uitgaven die dit bedrag overschrijden, tenzij dit wordt overschreven door een categoriregel.',
                maxAge: 'Max. leeftijd',
                maxExpenseAge: 'Maximale declaratieleeftijd',
                maxExpenseAgeDescription: 'Markeer uitgaven die ouder zijn dan een bepaald aantal dagen.',
                maxExpenseAgeDays: () => ({
                    one: '1 dag',
                    other: (count: number) => `${count} dagen`,
                }),
                cashExpenseDefault: 'Standaard contante uitgave',
                cashExpenseDefaultDescription:
                    'Kies hoe contante uitgaven moeten worden aangemaakt. Een uitgave wordt beschouwd als een contante uitgave als het geen geïmporteerde zakelijke creditcardtransactie is. Dit omvat handmatig aangemaakte uitgaven, bonnetjes, dagvergoedingen, afstands- en tijdgebonden uitgaven.',
                reimbursableDefault: 'Vergoedbaar',
                reimbursableDefaultDescription: 'Onkosten worden meestal terugbetaald aan medewerkers',
                nonReimbursableDefault: 'Niet-vergoedbaar',
                nonReimbursableDefaultDescription: 'Uitgaven worden af en toe terugbetaald aan werknemers',
                alwaysReimbursable: 'Altijd vergoedbaar',
                alwaysReimbursableDescription: 'Onkosten worden altijd terugbetaald aan werknemers',
                alwaysNonReimbursable: 'Altijd niet-vergoedbaar',
                alwaysNonReimbursableDescription: 'Declaraties worden nooit terugbetaald aan werknemers',
                billableDefault: 'Standaard factureerbaar',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Kies of contante en creditcarduitgaven standaard factureerbaar moeten zijn. Factureerbare uitgaven worden in- of uitgeschakeld in <a href="${tagsPageLink}">labels</a>.</muted-text>`,
                billable: 'Factureerbaar',
                billableDescription: 'Onkosten worden meestal opnieuw aan klanten gefactureerd',
                nonBillable: 'Niet-declarabel',
                nonBillableDescription: 'Onkosten worden af en toe opnieuw aan klanten gefactureerd',
                eReceipts: 'eBonnet',
                eReceiptsHint: `eReceipts worden automatisch aangemaakt [voor de meeste USD-credittransacties](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Aanwezigheidsregistratie',
                attendeeTrackingHint: 'Houd de kosten per persoon bij voor elke uitgave.',
                prohibitedDefaultDescription:
                    'Markeer alle bonnen waarop alcohol, kansspelen of andere verboden artikelen voorkomen. Declaraties met bonnen waarop deze posten staan, moeten handmatig worden gecontroleerd.',
                prohibitedExpenses: 'Verboden uitgaven',
                alcohol: 'Alcohol',
                hotelIncidentals: "Hotelextra's",
                gambling: 'Gokken',
                tobacco: 'Tabak',
                adultEntertainment: 'Volwassenenentertainment',
                requireCompanyCard: 'Bedrijfskaarten verplicht stellen voor alle aankopen',
                requireCompanyCardDescription: 'Markeer alle contante uitgaven, inclusief kilometer- en dagvergoedingen.',
            },
            expenseReportRules: {
                title: 'Geavanceerd',
                subtitle: 'Automatiseer de naleving, goedkeuringen en betaling van onkostendeclaraties.',
                preventSelfApprovalsTitle: 'Zelfgoedkeuring voorkomen',
                preventSelfApprovalsSubtitle: 'Voorkom dat werkruimteleden hun eigen onkostendeclaraties goedkeuren.',
                autoApproveCompliantReportsTitle: 'Conforme rapporten automatisch goedkeuren',
                autoApproveCompliantReportsSubtitle: 'Stel in welke onkostendeclaraties in aanmerking komen voor automatische goedkeuring.',
                autoApproveReportsUnderTitle: 'Rapporten automatisch goedkeuren onder',
                autoApproveReportsUnderDescription: 'Volledig conforme onkostendeclaraties onder dit bedrag worden automatisch goedgekeurd.',
                randomReportAuditTitle: 'Willekeurige rapportcontrole',
                randomReportAuditDescription: 'Vereis dat sommige rapporten handmatig worden goedgekeurd, zelfs als ze in aanmerking komen voor automatische goedkeuring.',
                autoPayApprovedReportsTitle: 'Automatisch goedgekeurde rapporten betalen',
                autoPayApprovedReportsSubtitle: 'Instellen welke onkostendeclaraties in aanmerking komen voor automatische betaling.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Voer een bedrag in dat lager is dan ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle: 'Ga naar Meer functies en schakel Workflows in, voeg vervolgens Betalingen toe om deze functie te ontgrendelen.',
                autoPayReportsUnderTitle: 'Automatisch rapporten betalen onder',
                autoPayReportsUnderDescription: 'Volledig conforme onkostenrapporten onder dit bedrag worden automatisch betaald.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Voeg ${featureName} toe om deze functie te ontgrendelen.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Ga naar [meer functies](${moreFeaturesLink}) en schakel ${featureName} in om deze functie te ontgrendelen.`,
            },
            merchantRules: {
                title: 'Handelaar',
                subtitle: 'Stel de leveranciersregels in zodat onkosten correct gecodeerd binnenkomen en minder nabewerking vergen.',
                addRule: 'Handelaarsregel toevoegen',
                addRuleTitle: 'Regel toevoegen',
                editRuleTitle: 'Regel bewerken',
                expensesWith: 'Voor uitgaven met:',
                expensesExactlyMatching: 'Voor uitgaven die exact overeenkomen met:',
                applyUpdates: 'Deze updates toepassen:',
                saveRule: 'Regel opslaan',
                previewMatches: 'Voorvertoning van overeenkomsten',
                confirmError: 'Voer handelaar in en pas minstens één wijziging toe',
                confirmErrorMerchant: 'Voer handelaar in',
                confirmErrorUpdate: 'Breng ten minste één update aan',
                previewMatchesEmptyStateTitle: 'Niets om weer te geven',
                previewMatchesEmptyStateSubtitle: 'Geen niet-ingediende uitgaven komen overeen met deze regel.',
                deleteRule: 'Regel verwijderen',
                deleteRuleConfirmation: 'Weet je zeker dat je deze regel wilt verwijderen?',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `Als handelaar ${isExactMatch ? 'komt exact overeen' : 'bevat'} „${merchantName}”`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Naam handelaar wijzigen in "${merchantName}"`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `Werk ${fieldName} bij naar "${fieldValue}"`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Markeer als "${reimbursable ? 'declareerbaar' : 'niet-vergoedbaar'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Markeren als "${billable ? 'factureerbaar' : 'niet-declarabel'}"`,
                matchType: 'Overeenkomsttype',
                matchTypeContains: 'Bevat',
                matchTypeExact: 'Komt exact overeen',
                duplicateRuleTitle: 'Een vergelijkbare handelaarregel bestaat al',
                duplicateRulePrompt: (merchantName: string) => `Wil je een nieuwe regel voor ‘${merchantName}’ opslaan, ook al heb je er al een bestaande?`,
                saveAnyway: 'Toch opslaan',
                applyToExistingUnsubmittedExpenses: 'Toepassen op bestaande niet-ingediende uitgaven',
            },
            categoryRules: {
                title: 'Categorisatieregels',
                approver: 'Fiatteur',
                requireDescription: 'Beschrijving vereist',
                requireFields: 'Vereiste velden',
                requiredFieldsTitle: 'Verplichte velden',
                requiredFieldsDescription: (categoryName: string) => `Dit is van toepassing op alle uitgaven met de categorie <strong>${categoryName}</strong>.`,
                requireAttendees: 'Deelnemers verplicht stellen',
                descriptionHint: 'Beschrijving-hint',
                descriptionHintDescription: (categoryName: string) =>
                    `Herinner medewerkers eraan om extra informatie te geven voor uitgaven in de categorie ‘${categoryName}’. Deze hint verschijnt in het beschrijvingsveld van onkostendeclaraties.`,
                descriptionHintLabel: 'Tip',
                descriptionHintSubtitle: 'Pro-tip: hoe korter, hoe beter!',
                maxAmount: 'Maximumbedrag',
                flagAmountsOver: 'Bedragen markeren boven',
                flagAmountsOverDescription: (categoryName: string) => `Is van toepassing op de categorie ‘${categoryName}’.`,
                flagAmountsOverSubtitle: 'Dit overschrijft het maximumbedrag voor alle declaraties.',
                expenseLimitTypes: {
                    expense: 'Individuele uitgave',
                    expenseSubtitle: 'Markeer onkostbedragen per categorie. Deze regel overschrijft de algemene werkruimteregel voor het maximale onkostbedrag.',
                    daily: 'Categorietotaal',
                    dailySubtitle: 'Markeer totale dagelijkse categoriebesteding per onkostendeclaratie.',
                },
                requireReceiptsOver: 'Bonnetjes vereisen boven',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standaard`,
                    never: 'Nooit bonnen vereisen',
                    always: 'Altijd bonnen vereisen',
                },
                requireItemizedReceiptsOver: 'Gespecificeerde bonnetjes vereisen boven',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standaard`,
                    never: 'Nooit gespecificeerde bonnetjes vereisen',
                    always: 'Altijd gespecificeerde bonnetjes vereisen',
                },
                defaultTaxRate: 'Standaardbelastingtarief',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Ga naar [Meer functies](${moreFeaturesLink}) en schakel workflows in, voeg daarna goedkeuringen toe om deze functie te ontgrendelen.`,
            },
            customRules: {
                title: 'Declaratiebeleid',
                cardSubtitle: 'Hier staat het onkostbeleid van je team, zodat voor iedereen duidelijk is wat wel en niet wordt vergoed.',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Incasseren',
                    description: 'Voor teams die hun processen willen automatiseren.',
                },
                corporate: {
                    label: 'Beheer',
                    description: 'Voor organisaties met geavanceerde vereisten.',
                },
            },
            description: 'Kies een abonnement dat bij je past. Voor een gedetailleerd overzicht van functies en prijzen, bekijk onze',
            subscriptionLink: 'hulppagina voor plansoorten en prijzen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Je hebt je vastgelegd op 1 actief lid in het Control-abonnement tot je jaarlijkse abonnement afloopt op ${annualSubscriptionEndDate}. Je kunt vanaf ${annualSubscriptionEndDate} overschakelen naar een pay-per-use-abonnement en downgraden naar het Collect-abonnement door automatisch verlengen uit te schakelen in`,
                other: `Je hebt je vastgelegd op ${count} actieve leden in het Control-abonnement tot je jaarlijkse abonnement afloopt op ${annualSubscriptionEndDate}. Je kunt vanaf ${annualSubscriptionEndDate} overschakelen naar een betalen-naar-gebruik-abonnement en downgraden naar het Collect-abonnement door het automatisch verlengen uit te schakelen in`,
            }),
            subscriptions: 'Abonnementen',
        },
    },
    getAssistancePage: {
        title: 'Hulp krijgen',
        subtitle: 'Wij zijn er om jouw pad naar grootsheid vrij te maken!',
        description: 'Kies uit de onderstaande ondersteuningsopties:',
        chatWithConcierge: 'Chatten met Concierge',
        scheduleSetupCall: 'Plan een installatiegesprek',
        scheduleACall: 'Gesprek plannen',
        questionMarkButtonTooltip: 'Krijg hulp van ons team',
        exploreHelpDocs: 'Helpdocumentatie verkennen',
        registerForWebinar: 'Registreren voor webinar',
        onboardingHelp: 'Onboardinghulp',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Standaard huidskleur wijzigen',
        headers: {
            frequentlyUsed: 'Vaak gebruikt',
            smileysAndEmotion: 'Smileys & emotie',
            peopleAndBody: 'Mensen & Lichaam',
            animalsAndNature: 'Dieren & Natuur',
            foodAndDrink: 'Eten en drinken',
            travelAndPlaces: 'Reizen & Plaatsen',
            activities: 'Activiteiten',
            objects: 'Objecten',
            symbols: 'Symbolen',
            flags: 'Markeringen',
        },
    },
    newRoomPage: {
        newRoom: 'Nieuwe ruimte',
        groupName: 'Groepsnaam',
        roomName: 'Ruimtenaam',
        visibility: 'Zichtbaarheid',
        restrictedDescription: 'Mensen in je werkruimte kunnen deze kamer vinden',
        privateDescription: 'Mensen die voor deze ruimte zijn uitgenodigd, kunnen deze vinden',
        publicDescription: 'Iedereen kan deze ruimte vinden',
        public_announceDescription: 'Iedereen kan deze ruimte vinden',
        createRoom: 'Ruimte maken',
        roomAlreadyExistsError: 'Er bestaat al een ruimte met deze naam',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} is een standaardruimte in alle werkruimten. Kies een andere naam.`,
        roomNameInvalidError: 'Rooomnamen mogen alleen kleine letters, cijfers en koppeltekens bevatten',
        pleaseEnterRoomName: 'Voer een kamernaam in',
        pleaseSelectWorkspace: 'Selecteer een werkruimte',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}hernoemd naar "${newName}" (voorheen "${oldName}")` : `${actor}heeft deze ruimte hernoemd naar „${newName}” (voorheen „${oldName}”)`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Ruimte hernoemd naar ${newName}`,
        social: 'sociaal',
        selectAWorkspace: 'Selecteer een werkruimte',
        growlMessageOnRenameError: 'Kan werkruimtekamer niet hernoemen. Controleer je verbinding en probeer het opnieuw.',
        visibilityOptions: {
            restricted: 'Workspace',
            private: 'Privé',
            public: 'Openbaar',
            public_announce: 'Openbare aankondiging',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Verzenden en sluiten',
        submitAndApprove: 'Indienen en goedkeuren',
        advanced: 'GEAVANCEERD',
        dynamicExternal: 'DYNAMISCH_EXTERN',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `stel de standaard zakelijke bankrekening in op "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}"`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `heeft de standaard zakelijke bankrekening “${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}” verwijderd`,
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
            `heeft de standaard zakelijke bankrekening gewijzigd in "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (voorheen "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `heeft het bedrijfsadres gewijzigd naar "${newAddress}" (voorheen "${previousAddress}")` : `stel het bedrijfsadres in op "${newAddress}"`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `heeft ${approverName} (${approverEmail}) toegevoegd als fiatteur voor het veld ${field} „${name}”`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `heeft ${approverName} (${approverEmail}) verwijderd als goedkeurder voor het veld ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `heeft de fiatteur voor het ${field} „${name}” gewijzigd naar ${formatApprover(newApproverName, newApproverEmail)} (voorheen ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `heeft de categorie "${categoryName}" toegevoegd`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `heeft de categorie ‘${categoryName}’ verwijderd`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'uitgeschakeld' : 'ingeschakeld'} de categorie "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `heeft de looncode "${newValue}" toegevoegd aan de categorie "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `heeft de looncode "${oldValue}" uit de categorie "${categoryName}" verwijderd`;
            }
            return `heeft de salariscode van categorie „${categoryName}” gewijzigd in „${newValue}” (voorheen „${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `heeft de GL-code "${newValue}” toegevoegd aan de categorie "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `heeft de GL-code "${oldValue}" verwijderd uit de categorie "${categoryName}"`;
            }
            return `heeft de GL-code van categorie ‘${categoryName}’ gewijzigd naar ‘${newValue}’ (voorheen ‘${oldValue}‘)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `heeft de beschrijving van de categorie „${categoryName}” gewijzigd naar ${!oldValue ? 'verplicht' : 'niet verplicht'} (voorheen ${!oldValue ? 'niet verplicht' : 'verplicht'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `heeft een maximumbedrag van ${newAmount} toegevoegd aan de categorie "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `heeft het maximum bedrag van ${oldAmount} verwijderd uit de categorie "${categoryName}"`;
            }
            return `heeft het maximumbedrag van categorie „${categoryName}” gewijzigd naar ${newAmount} (voorheen ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `heeft een limiett ype van ${newValue} toegevoegd aan de categorie ‘${categoryName}’`;
            }
            return `heeft het limiettetype van categorie "${categoryName}" gewijzigd naar ${newValue} (voorheen ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `heeft de categorie "${categoryName}" bijgewerkt door Ontvangsten te wijzigen in ${newValue}`;
            }
            return `heeft de categorie „${categoryName}” gewijzigd naar ${newValue} (voorheen ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `heeft de categorie ‘${categoryName}’ bijgewerkt door Geselecteerde bonnetjes te wijzigen in ${newValue}`;
            }
            return `heeft in de categorie "${categoryName}" de optie ‘Gespecificeerde bonnen’ gewijzigd naar ${newValue} (voorheen ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `heeft de categorie "${oldName}" hernoemd naar "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `heeft de beschrijvingshint "${oldValue}" verwijderd uit de categorie "${categoryName}"`;
            }
            return !oldValue
                ? `heeft de beschrijvingtip "${newValue}" toegevoegd aan de categorie "${categoryName}"`
                : `heeft de hint voor de beschrijving van de categorie "${categoryName}" gewijzigd naar “${newValue}” (voorheen “${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `heeft de naam van de taglijst gewijzigd in „${newName}” (voorheen „${oldName}”)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `heeft het label "${tagName}" toegevoegd aan de lijst "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `heeft de taglijst "${tagListName}" bijgewerkt door de tag "${oldName}" te wijzigen in "${newName}`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} de tag “${tagName}” in de lijst “${tagListName}”`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `heeft de tag ‘${tagName}’ verwijderd uit de lijst ‘${tagListName}’`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `“${count}” tags verwijderd uit de lijst “${tagListName}”`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `heeft de tag "${tagName}" op de lijst "${tagListName}" bijgewerkt door het veld ${updatedField} te wijzigen in "${newValue}" (voorheen "${oldValue}")`;
            }
            return `heeft de tag ‘${tagName}’ op de lijst ‘${tagListName}’ bijgewerkt door een ${updatedField} met de waarde ‘${newValue}’ toe te voegen`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `heeft de ${customUnitName} ${updatedField} gewijzigd in „${newValue}” (voorheen „${oldValue}”)`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'ingeschakeld' : 'uitgeschakeld'} belastingregistratie op afstandstarieven`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `heeft een nieuw "${customUnitName}"-tarief "${rateName}" toegevoegd`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `heeft het tarief van de ${customUnitName} ${updatedField} „${customUnitRateName}” gewijzigd naar „${newValue}” (voorheen „${oldValue}”)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `heeft het belastingtarief van het kilometertarief „${customUnitRateName}” gewijzigd naar „${newValue} (${newTaxPercentage})” (voorheen „${oldValue} (${oldTaxPercentage})”)`;
            }
            return `heeft het belastingtarief „${newValue} (${newTaxPercentage})” toegevoegd aan het afstandstarief „${customUnitRateName}”`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `heeft het terugvorderbare belastingdeel op het afstandstarief „${customUnitRateName}” gewijzigd naar „${newValue}” (voorheen „${oldValue}”)`;
            }
            return `heeft een terugvorderbaar belastingdeel van "${newValue}" toegevoegd aan het kilometertarief "${customUnitRateName}`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? 'ingeschakeld' : 'uitgeschakeld'} het ${customUnitName}-tarief „${customUnitRateName}”`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `heeft het tarief „${rateName}” van „${customUnitName}” verwijderd`,
        addedReportField: (fieldType: string, fieldName?: string) => `heeft ${fieldType}-rapportveld „${fieldName}” toegevoegd`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `stel de standaardwaarde van rapportveld "${fieldName}" in op "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `heeft de optie "${optionName}" toegevoegd aan het rapportveld "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `heeft de optie ‘${optionName}’ verwijderd uit het rapportveld ‘${fieldName}’`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'ingeschakeld' : 'uitgeschakeld'} de optie "${optionName}" voor het rapportveld "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'ingeschakeld' : 'uitgeschakeld'} alle opties voor het rapportveld "${fieldName}"`;
            }
            return `${allEnabled ? 'ingeschakeld' : 'uitgeschakeld'} de optie "${optionName}" voor het rapportveld "${fieldName}", waardoor alle opties ${allEnabled ? 'ingeschakeld' : 'uitgeschakeld'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `heeft ${fieldType}-rapportveld "${fieldName}" verwijderd`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `heeft ‘Voorkom zelfgoedkeuring’ bijgewerkt naar ‘${newValue === 'true' ? 'Ingeschakeld' : 'Uitgeschakeld'}’ (voorheen ‘${oldValue === 'true' ? 'Ingeschakeld' : 'Uitgeschakeld'}’)`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `stel de maandelijkse rapportindieningsdatum in op "${newValue}"`;
            }
            return `heeft de indieningsdatum van het maandrapport gewijzigd naar ‘${newValue}’ (voorheen ‘${oldValue}’)`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `heeft "Kosten opnieuw bij klanten in rekening brengen" bijgewerkt naar "${newValue}" (voorheen "${oldValue}")`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `heeft ‘Contante uitgave standaardwaarde’ bijgewerkt naar ‘${newValue}’ (voorheen ‘${oldValue}’)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `heeft ‘Standaardrapporttitels afdwingen’ ${value ? 'aan' : 'uit'} ingeschakeld`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `heeft de naamformule van het aangepast rapport gewijzigd in ‘${newValue}’ (voorheen ‘${oldValue}’)`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `heeft de naam van deze werkruimte gewijzigd naar "${newName}" (voorheen "${oldName}")`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `stel de beschrijving van deze werkruimte in op "${newDescription}"`
                : `heeft de beschrijving van deze workspace bijgewerkt naar „${newDescription}” (voorheen „${oldDescription}”)`,
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
                other: `heeft je verwijderd uit de goedkeuringsworkflows en onkostenchats van ${joinedNames}. Eerder ingediende rapporten blijven beschikbaar voor goedkeuring in je inbox.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `heeft je rol in ${policyName} gewijzigd van ${oldRole} naar gebruiker. Je bent verwijderd uit alle declaratiechats van indieners, behalve uit je eigen chat.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `heeft de standaardvaluta bijgewerkt naar ${newCurrency} (voorheen ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `heeft de automatische rapportagefrequentie bijgewerkt naar ‘${newFrequency}’ (voorheen ‘${oldFrequency}’)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `heeft de goedkeuringsmodus bijgewerkt naar ‘${newValue}’ (voorheen ‘${oldValue}’)`,
        upgradedWorkspace: 'heeft deze workspace geüpgraded naar het Control-abonnement',
        forcedCorporateUpgrade: `Deze werkruimte is geüpgraded naar het Control-abonnement. Klik <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">hier</a> voor meer informatie.`,
        downgradedWorkspace: 'heeft deze workspace gedowngraded naar het Collect-abonnement',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `heeft het percentage rapporten dat willekeurig wordt doorgestuurd voor handmatige goedkeuring gewijzigd naar ${Math.round(newAuditRate * 100)}% (voorheen ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `heeft de handmatige goedkeuringslimiet voor alle declaraties gewijzigd naar ${newLimit} (voorheen ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} categorieën`;
                case 'tags':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} labels`;
                case 'workflows':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'}-workflows`;
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
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} per diem`;
                case 'receipt partners':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} bonpartners`;
                case 'rules':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} regels`;
                case 'tax tracking':
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} belastingtracking`;
                default:
                    return `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} aanwezigheidsregistratie`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} automatisch betaalde goedgekeurde rapporten`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `stel de drempel voor automatische betaling van goedgekeurde rapporten in op „${newLimit}”`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `heeft de drempel voor automatisch betalen van goedgekeurde rapporten gewijzigd naar „${newLimit}” (voorheen „${oldLimit}”)`,
        removedAutoPayApprovedReportsLimit: 'heeft de drempel voor automatisch betalen van goedgekeurde rapporten verwijderd',
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
                : `heeft de goedkeuringsworkflow voor ${members} gewijzigd zodat rapporten worden ingediend bij de standaardgoedkeurder`;
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
                ? `heeft de goedkeuringsworkflow voor ${approver} gewijzigd om goedgekeurde rapporten door te sturen naar ${forwardsTo} (werd eerder doorgestuurd naar ${previousForwardsTo})`
                : `heeft de goedkeuringsworkflow voor ${approver} gewijzigd zodat goedgekeurde rapporten worden doorgestuurd naar ${forwardsTo} (voorheen definitief goedgekeurde rapporten)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `heeft de goedkeuringsworkflow voor ${approver} gewijzigd zodat goedgekeurde rapporten niet meer worden doorgestuurd (werden eerder doorgestuurd naar ${previousForwardsTo})`
                : `heeft de goedkeuringsworkflow voor ${approver} gewijzigd zodat goedgekeurde rapporten niet meer worden doorgestuurd`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `heeft de bedrijfsnaam op de factuur gewijzigd naar ‘${newValue}’ (voorheen ‘${oldValue}’)` : `stel de bedrijfsnaam op de factuur in op ‘${newValue}’`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `heeft de bedrijfswebsite op de factuur gewijzigd naar ‘${newValue}’ (voorheen ‘${oldValue}’)` : `stel de bedrijfswebsite op de factuur in op "${newValue}"`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser
                ? `heeft de bevoegde betaler gewijzigd naar "${newReimburser}" (voorheen "${previousReimburser}")`
                : `heeft de gemachtigde betaler gewijzigd in ‘${newReimburser}’`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} terugbetalingen`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `heeft de belasting ‘${taxName}’ toegevoegd`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `heeft de belasting ‘${taxName}’ verwijderd`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `heeft de belasting “${oldValue}” hernoemd naar “${newValue}”`;
                }
                case 'code': {
                    return `heeft de belastingcode voor ‘${taxName}’ gewijzigd van ‘${oldValue}’ naar ‘${newValue}’`;
                }
                case 'rate': {
                    return `heeft het belastingtarief voor „${taxName}” gewijzigd van „${oldValue}” naar „${newValue}”`;
                }
                case 'enabled': {
                    return `${oldValue ? 'uitgeschakeld' : 'ingeschakeld'} de belasting "${taxName}"`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `stel vereiste bonbedrag in op "${newValue}"`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `heeft het vereiste bonbedrag gewijzigd naar ‘${newValue}’ (voorheen ‘${oldValue}’)`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `vereist bedrag voor bon verwijderd (voorheen "${oldValue}")`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `stel maximaal uitgavenbedrag in op "${newValue}"`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximumbedrag van uitgave gewijzigd naar ‘${newValue}’ (voorheen ‘${oldValue}’)`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximumbedrag voor onkosten verwijderd (voorheen "${oldValue}")`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `stel maximale ouderdom van onkosten in op "${newValue}" dagen`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximale uitgavenleeftijd gewijzigd naar "${newValue}" dagen (voorheen "${oldValue}")`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximale onkostenduur verwijderd (voorheen "${oldValue}" dagen)`,
    },
    roomMembersPage: {
        memberNotFound: 'Lid niet gevonden.',
        useInviteButton: 'Om een nieuw lid naar de chat uit te nodigen, gebruik de uitnodigingsknop hierboven.',
        notAuthorized: `Je hebt geen toegang tot deze pagina. Als je probeert deze ruimte te joinen, vraag dan een lid van de ruimte om je toe te voegen. Iets anders aan de hand? Neem contact op met ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Het lijkt erop dat deze kamer is gearchiveerd. Neem voor vragen contact op met ${CONST.EMAIL.CONCIERGE}.`,
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
        confirmError: 'Voer een titel in en selecteer een bestemmingslocatie om te delen',
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
            error: 'Je hebt geen toestemming om deze actie uit te voeren',
        },
        markAsComplete: 'Markeren als voltooid',
        markAsIncomplete: 'Markeren als onvoltooid',
        assigneeError: 'Er is een fout opgetreden bij het toewijzen van deze taak. Probeer een andere verantwoordelijke.',
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
            openShortcutDialog: 'Opent het sneltoetsenvenster',
            markAllMessagesAsRead: 'Markeer alle berichten als gelezen',
            escape: 'Dialogvensters sluiten',
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
                subtitle: `Probeer je zoekcriteria aan te passen of iets te maken met de +-knop.`,
            },
            emptyExpenseResults: {
                title: 'Je hebt nog geen uitgaven gemaakt',
                subtitle: 'Maak een uitgave aan of maak een testrit met Expensify om meer te weten te komen.',
                subtitleWithOnlyCreateButton: 'Gebruik de groene knop hieronder om een uitgave aan te maken.',
            },
            emptyReportResults: {
                title: 'Je hebt nog geen rapporten aangemaakt',
                subtitle: 'Maak een rapport of maak een testrit met Expensify om meer te weten te komen.',
                subtitleWithOnlyCreateButton: 'Gebruik de groene knop hieronder om een rapport te maken.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Je hebt nog geen facturen aangemaakt
                `),
                subtitle: 'Stuur een factuur of maak een proefrit met Expensify om meer te leren.',
                subtitleWithOnlyCreateButton: 'Gebruik de groene knop hieronder om een factuur te versturen.',
            },
            emptyTripResults: {
                title: 'Geen reizen om weer te geven',
                subtitle: 'Begin met het boeken van je eerste reis hieronder.',
                buttonText: 'Boek een reis',
            },
            emptySubmitResults: {
                title: 'Geen uitgaven om in te dienen',
                subtitle: 'Je bent helemaal klaar. Maak een ererondje!',
                buttonText: 'Rapport maken',
            },
            emptyApproveResults: {
                title: 'Geen uitgaven om goed te keuren',
                subtitle: 'Nul uitgaven. Maximaal relaxed. Goed gedaan!',
            },
            emptyPayResults: {
                title: 'Geen uitgaven om te betalen',
                subtitle: 'Gefeliciteerd! Je hebt de finish gehaald.',
            },
            emptyExportResults: {
                title: 'Geen uitgaven om te exporteren',
                subtitle: 'Tijd om het rustig aan te doen, goed gedaan.',
            },
            emptyStatementsResults: {
                title: 'Geen uitgaven om weer te geven',
                subtitle: 'Geen resultaten. Probeer je filters aan te passen.',
            },
            emptyUnapprovedResults: {
                title: 'Geen uitgaven om goed te keuren',
                subtitle: 'Nul uitgaven. Maximaal relaxed. Goed gedaan!',
            },
        },
        columns: 'Kolommen',
        resetColumns: 'Kolommen resetten',
        groupColumns: 'Kolommen groeperen',
        expenseColumns: 'Onkostencolommen',
        statements: 'Overzichten',
        unapprovedCash: 'Niet-goedgekeurde contanten',
        unapprovedCard: 'Niet-goedgekeurde kaart',
        reconciliation: 'Afstemming',
        topSpenders: 'Grootste uitgaven',
        saveSearch: 'Zoekopdracht opslaan',
        deleteSavedSearch: 'Opgeslagen zoekopdracht verwijderen',
        deleteSavedSearchConfirm: 'Weet je zeker dat je deze zoekopdracht wilt verwijderen?',
        searchName: 'Naam zoeken',
        savedSearchesMenuItemTitle: 'Opgeslagen',
        topCategories: 'Topcategorieën',
        topMerchants: 'Topverkopers',
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
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Vorige maand',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Deze maand',
                    [CONST.SEARCH.DATE_PRESETS.YEAR_TO_DATE]: 'Jaar tot nu toe',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Laatste afschrift',
                },
            },
            status: 'Status',
            keyword: 'Trefwoord',
            keywords: 'Trefwoorden',
            limit: 'Limiet',
            limitDescription: 'Stel een limiet in voor de resultaten van je zoekopdracht.',
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
                [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Categorie',
                [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Handelaar',
                [CONST.SEARCH.GROUP_BY.TAG]: 'Label',
                [CONST.SEARCH.GROUP_BY.MONTH]: 'Maand',
                [CONST.SEARCH.GROUP_BY.WEEK]: 'Week',
                [CONST.SEARCH.GROUP_BY.YEAR]: 'Jaar',
                [CONST.SEARCH.GROUP_BY.QUARTER]: 'Kwartaal',
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
        view: {
            label: 'Bekijken',
            table: 'Tabel',
            bar: 'Balk',
        },
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: 'Van',
            [CONST.SEARCH.GROUP_BY.CARD]: 'Kaarten',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'Exporten',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Categorieën',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Verkopers',
            [CONST.SEARCH.GROUP_BY.TAG]: 'Tags',
            [CONST.SEARCH.GROUP_BY.MONTH]: 'Maanden',
            [CONST.SEARCH.GROUP_BY.WEEK]: 'Weken',
            [CONST.SEARCH.GROUP_BY.YEAR]: 'Jaren',
            [CONST.SEARCH.GROUP_BY.QUARTER]: 'Kwartalen',
        },
        moneyRequestReport: {
            emptyStateTitle: 'Dit rapport bevat geen uitgaven.',
            accessPlaceHolder: 'Openen voor details',
        },
        noCategory: 'Geen categorie',
        noMerchant: 'Geen handelaar',
        noTag: 'Geen tag',
        expenseType: 'Onkostype',
        withdrawalType: 'Type opname',
        recentSearches: 'Recente zoekopdrachten',
        recentChats: 'Recente chats',
        searchIn: 'Zoeken in',
        searchPlaceholder: 'Zoek iets',
        suggestions: 'Suggesties',
        exportSearchResults: {
            title: 'Export aanmaken',
            description: 'Zo, dat zijn een heleboel items! We pakken ze samen, en Concierge stuurt je zo meteen een bestand.',
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
            helpTextConcierge: 'Als het probleem zich blijft voordoen, neem dan contact op met',
        },
        refresh: 'Vernieuwen',
    },
    fileDownload: {
        success: {
            title: 'Gedownload!',
            message: 'Bijlage succesvol gedownload!',
            qrMessage:
                'Controleer je foto- of downloadmap voor een kopie van je QR-code. Protip: voeg hem toe aan een presentatie zodat je publiek hem kan scannen en direct met je kan verbinden.',
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
        failedError: ({link}: {link: string}) => `We proberen deze afrekening opnieuw zodra je <a href="${link}">je account ontgrendelt</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • Opname-ID: ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Rapportindeling',
        groupByLabel: 'Groeperen op:',
        selectGroupByOption: 'Selecteer hoe rapportuitgaven gegroepeerd moeten worden',
        uncategorized: 'Zonder categorie',
        noTag: 'Geen tag',
        selectGroup: ({groupName}: {groupName: string}) => `Selecteer alle onkosten in ${groupName}`,
        groupBy: {
            category: 'Categorie',
            tag: 'Label',
        },
    },
    report: {
        newReport: {
            createExpense: 'Uitgave aanmaken',
            createReport: 'Rapport maken',
            chooseWorkspace: 'Kies een werkruimte voor dit rapport.',
            emptyReportConfirmationTitle: 'Je hebt al een leeg rapport',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Weet je zeker dat je een ander rapport wilt maken in ${workspaceName}? Je hebt toegang tot je lege rapporten in`,
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
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `heeft ${fieldName} gewijzigd in "${newValue}" (voorheen "${oldValue}")`,
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
                    manual: (label: string) => `heeft dit rapport gemarkeerd als handmatig geëxporteerd naar ${label}.`,
                    automaticActionThree: 'en heeft succesvol een record aangemaakt voor',
                    reimburseableLink: 'onkosten uit eigen zak',
                    nonReimbursableLink: 'bedrijfskaartuitgaven',
                    pending: (label: string) => `is begonnen dit rapport naar ${label} te exporteren...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `exporteren van dit rapport naar ${label} is mislukt ("${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `heeft een bon toegevoegd`,
                managerDetachReceipt: `heeft een bon verwijderd`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `elders betaald: ${currency}${amount}`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `heeft ${currency}${amount} betaald via integratie`,
                outdatedBankAccount: `kon de betaling niet verwerken vanwege een probleem met de bankrekening van de betaler`,
                reimbursementACHBounce: `kon de betaling niet verwerken vanwege een probleem met de bankrekening`,
                reimbursementACHCancelled: `betaling geannuleerd`,
                reimbursementAccountChanged: `kon de betaling niet verwerken, omdat de betaler van bankrekening is veranderd`,
                reimbursementDelayed: `heeft de betaling verwerkt, maar deze is met nog 1–2 extra werkdagen vertraagd`,
                selectedForRandomAudit: `willekeurig geselecteerd voor controle`,
                selectedForRandomAuditMarkdown: `willekeurig geselecteerd voor controle`,
                share: ({to}: ShareParams) => `heeft lid ${to} uitgenodigd`,
                unshare: ({to}: UnshareParams) => `lid ${to} verwijderd`,
                stripePaid: ({amount, currency}: StripePaidParams) => `betaald ${currency}${amount}`,
                takeControl: `nam de controle over`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `er trad zich een probleem op bij het synchroniseren met ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Los het probleem op in de <a href="${workspaceAccountingLink}">werkruimte-instellingen</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `De verbinding met ${feedName} is verbroken. <a href='${workspaceCompanyCardRoute}'>Log in bij uw bank</a> om kaartimport opnieuw in te schakelen.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `De Plaid-verbinding met je zakelijke bankrekening is verbroken. <a href='${walletRoute}'>Verbind je bankrekening ${maskedAccountNumber} opnieuw</a> zodat je je Expensify Cards kunt blijven gebruiken.`,
                addEmployee: (email: string, role: string) => `${email} als ${role === 'member' ? 'een' : 'een'} ${role} toegevoegd`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `heeft de rol van ${email} bijgewerkt naar ${newRole} (voorheen ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `heeft aangepaste veld 1 van ${email} verwijderd (voorheen "${previousValue}")`;
                    }
                    return !previousValue
                        ? `heeft „${newValue}” toegevoegd aan aangepast veld 1 van ${email}`
                        : `heeft aangepast: aangepast veld 1 van ${email} naar "${newValue}" (voorheen "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `heeft aangepaste veld 2 van ${email} verwijderd (voorheen "${previousValue}")`;
                    }
                    return !previousValue
                        ? `heeft "${newValue}" toegevoegd aan aangepast veld 2 van ${email}`
                        : `heeft aangepast: aangepast veld 2 van ${email} naar "${newValue}" (voorheen "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} heeft de workspace verlaten`,
                removeMember: (email: string, role: string) => `heeft ${role} ${email} verwijderd`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `verbinding met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} verwijderd`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `verbonden met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'heeft de chat verlaten',
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `zakelijke bankrekening ${maskedBankAccountNumber} is automatisch vergrendeld vanwege een probleem met de terugbetaling of de afwikkeling van de Expensify Card. Los het probleem op in je <a href="${linkURL}">werkruimte-instellingen</a>.`,
            },
            error: {
                invalidCredentials: 'Ongeldige inloggegevens, controleer de configuratie van je verbinding.',
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
        companyCreditCard: 'Bedrijfscreditcard',
        receiptScanningApp: 'Bonnetjesscanner-app',
        billPay: 'Rekeningen betalen',
        invoicing: 'Facturatie',
        CPACard: 'CPA-kaart',
        payroll: 'Loonadministratie',
        travel: 'Reizen',
        resources: 'Bronnen',
        expensifyApproved: 'DoorExpensifyGoedgekeurd!',
        pressKit: 'Perskit',
        support: 'Ondersteuning',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Servicevoorwaarden',
        privacy: 'Privacy',
        learnMore: 'Meer info',
        aboutExpensify: 'Over Expensify',
        blog: 'Blog',
        jobs: 'Banen',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relaties met investeerders',
        getStarted: 'Aan de slag',
        createAccount: 'Maak een nieuw account aan',
        logIn: 'Inloggen',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Ga terug naar chatlijst',
        chatWelcomeMessage: 'Chat welkomstbericht',
        navigatesToChat: 'Navigeert naar een chat',
        newMessageLineIndicator: 'Nieuwe berichtregel-indicator',
        chatMessage: 'Chatbericht',
        lastChatMessagePreview: 'Voorbeeld van laatste chatbericht',
        workspaceName: 'Werkruimtenaam',
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
        thread: 'Thread',
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
        spamDescription: 'Ongevraagde promotie buiten onderwerp',
        inconsiderate: 'Onattent',
        inconsiderateDescription: 'Beledigende of respectloze bewoording, met twijfelachtige bedoelingen',
        intimidation: 'Intimidatie',
        intimidationDescription: 'Een agenda agressief doordrukken ondanks geldige bezwaren',
        bullying: 'Pesten',
        bullyingDescription: 'Een individu targeten om gehoorzaamheid af te dwingen',
        harassment: 'Intimidatie',
        harassmentDescription: 'Racistisch, vrouwonvriendelijk of ander algemeen discriminerend gedrag',
        assault: 'Aanranding',
        assaultDescription: 'Specifiek gerichte emotionele aanval met de bedoeling om schade toe te brengen',
        flaggedContent: 'Dit bericht is gemarkeerd als in strijd met onze gemeenschapsregels en de inhoud is verborgen.',
        hideMessage: 'Bericht verbergen',
        revealMessage: 'Bericht weergeven',
        levelOneResult: 'Verstuurt een anonieme waarschuwing en het bericht wordt ter beoordeling gerapporteerd.',
        levelTwoResult: 'Bericht verborgen in kanaal, plus anonieme waarschuwing en bericht is gemeld voor beoordeling.',
        levelThreeResult: 'Bericht verwijderd uit kanaal plus anonieme waarschuwing en bericht is ter beoordeling gemeld.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Uitnodigen om onkosten in te dienen',
        inviteToChat: 'Alleen uitnodigen voor chat',
        nothing: 'Niets doen',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Accepteren',
        decline: 'Weigeren',
    },
    actionableMentionTrackExpense: {
        submit: 'Verzend het naar iemand',
        categorize: 'Categoriseer het',
        share: 'Deel het met mijn accountant',
        nothing: 'Niets voor nu',
    },
    teachersUnitePage: {
        teachersUnite: 'Leraren Verenigd',
        joinExpensifyOrg:
            'Sluit je aan bij Expensify.org om onrecht wereldwijd uit te bannen. De huidige campagne “Teachers Unite” ondersteunt onderwijsgevenden overal door de kosten van essentiële schoolspullen te delen.',
        iKnowATeacher: 'Ik ken een leraar',
        iAmATeacher: 'Ik ben een leraar',
        getInTouch: 'Uitstekend! Deel hun gegevens zodat we contact met hen kunnen opnemen.',
        introSchoolPrincipal: 'Introductie van je schooldirecteur',
        schoolPrincipalVerifyExpense:
            'Expensify.org deelt de kosten van essentiële schoolspullen, zodat leerlingen uit huishoudens met een laag inkomen een betere leerervaring kunnen hebben. Je directeur wordt gevraagd om je uitgaven te verifiëren.',
        principalFirstName: 'Voornaam hoofdverantwoordelijke',
        principalLastName: 'Achternaam hoofdelijk schuldenaar',
        principalWorkEmail: 'Primair werk-e-mailadres',
        updateYourEmail: 'Werk je e-mailadres bij',
        updateEmail: 'E-mailadres bijwerken',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Voordat je verdergaat, zorg er alsjeblieft voor dat je je school-e-mailadres instelt als je standaardcontactmethode. Dit kun je doen via Instellingen > Profiel > <a href="${contactMethodsRoute}">Contactmethoden</a>.`,
        error: {
            enterPhoneEmail: 'Voer een geldig e-mailadres of telefoonnummer in',
            enterEmail: 'Voer een e-mailadres in',
            enterValidEmail: 'Voer een geldig e-mailadres in',
            tryDifferentEmail: 'Probeer een ander e-mailadres',
        },
    },
    cardTransactions: {
        notActivated: 'Niet geactiveerd',
        outOfPocket: 'Uit eigen zak uitgegeven bedrag',
        companySpend: 'Bedrijfskosten',
    },
    distance: {
        addStop: 'Stop toevoegen',
        deleteWaypoint: 'Waypoint verwijderen',
        deleteWaypointConfirmation: 'Weet je zeker dat je dit waypoint wilt verwijderen?',
        address: 'Adres',
        waypointDescription: {
            start: 'Starten',
            stop: 'Stop',
        },
        mapPending: {
            title: 'Toewijzing in behandeling',
            subtitle: 'De kaart wordt gegenereerd zodra je weer online bent',
            onlineSubtitle: 'Een ogenblik terwijl we de kaart instellen',
            errorTitle: 'Kaartfout',
            errorSubtitle: 'Er is een fout opgetreden bij het laden van de kaart. Probeer het opnieuw.',
        },
        error: {
            selectSuggestedAddress: 'Selecteer een voorgesteld adres of gebruik je huidige locatie',
        },
        odometer: {
            startReading: 'Begin met lezen',
            endReading: 'Lezen beëindigen',
            saveForLater: 'Voor later bewaren',
            totalDistance: 'Totale afstand',
        },
    },
    gps: {
        disclaimer: 'Gebruik GPS om een uitgave van je rit te maken. Tik hieronder op Start om het volgen te beginnen.',
        error: {
            failedToStart: 'Locatiebepaling starten mislukt.',
            failedToGetPermissions: 'Verkrijgen van vereiste locatierechten mislukt.',
        },
        trackingDistance: 'Afstand wordt bijgehouden...',
        stopped: 'Gestopt',
        start: 'Starten',
        stop: 'Stop',
        discard: 'Weggooien',
        stopGpsTrackingModal: {
            title: 'GPS-tracking stoppen',
            prompt: 'Weet je het zeker? Dit beëindigt je huidige proces.',
            cancel: 'Hervat volgen',
            confirm: 'GPS-tracking stoppen',
        },
        discardDistanceTrackingModal: {
            title: 'Afstandstracering negeren',
            prompt: 'Weet je het zeker? Hiermee wordt je huidige traject verworpen en dit kan niet ongedaan worden gemaakt.',
            confirm: 'Afstandstracering negeren',
        },
        zeroDistanceTripModal: {
            title: 'Kan uitgave niet aanmaken',
            prompt: 'Je kunt geen uitgave aanmaken met dezelfde begin- en eindlocatie.',
        },
        locationRequiredModal: {
            title: 'Locatietoegang vereist',
            prompt: 'Sta locatietoegang toe in de instellingen van je apparaat om GPS-afstandsregistratie te starten.',
            allow: 'Toestaan',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Toegang tot je locatie op de achtergrond is vereist',
            prompt: 'Sta achtergrondlocatietoegang toe in de instellingen van je apparaat (de optie ‘Altijd toestaan’) om GPS‑afstandstracking te starten.',
        },
        preciseLocationRequiredModal: {
            title: 'Precieze locatie vereist',
            prompt: 'Schakel "precieze locatie" in in de instellingen van je apparaat om het bijhouden van de GPS-afstand te starten.',
        },
        desktop: {
            title: 'Volg afstand op je telefoon',
            subtitle: 'Registreer automatisch mijlen of kilometers met GPS en zet ritten direct om in declaraties.',
            button: 'Download de app',
        },
        notification: {
            title: 'GPS-tracking bezig',
            body: 'Ga naar de app om af te ronden',
        },
        continueGpsTripModal: {
            title: 'GPS-reisopname voortzetten?',
            prompt: 'Het lijkt erop dat de app is afgesloten tijdens je laatste GPS-rit. Wil je het opnemen van die rit hervatten?',
            confirm: 'Reis hervatten',
            cancel: 'Reis bekijken',
        },
        signOutWarningTripInProgress: {
            title: 'GPS-tracking bezig',
            prompt: 'Weet je zeker dat je de reis wilt weggooien en je wilt afmelden?',
            confirm: 'Verwerpen en afmelden',
        },
        locationServicesRequiredModal: {
            title: 'Locatietoegang vereist',
            confirm: 'Instellingen openen',
            prompt: 'Sta locatietoegang toe in de instellingen van je apparaat om GPS-afstandsregistratie te starten.',
        },
        fabGpsTripExplained: 'Ga naar GPS-scherm (zwevende actie)',
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Rapportkaart kwijt of beschadigd',
        nextButtonLabel: 'Volgende',
        reasonTitle: 'Waarom heeft u een nieuwe kaart nodig?',
        cardDamaged: 'Mijn kaart is beschadigd',
        cardLostOrStolen: 'Mijn kaart is verloren of gestolen',
        confirmAddressTitle: 'Bevestig het postadres voor je nieuwe kaart.',
        cardDamagedInfo: 'Je nieuwe kaart wordt binnen 2-3 werkdagen bezorgd. Je huidige kaart blijft werken totdat je je nieuwe kaart activeert.',
        cardLostOrStolenInfo: 'Je huidige kaart wordt permanent gedeactiveerd zodra je bestelling is geplaatst. De meeste kaarten komen binnen enkele werkdagen aan.',
        address: 'Adres',
        deactivateCardButton: 'Kaart deactiveren',
        shipNewCardButton: 'Nieuwe kaart verzenden',
        addressError: 'Adres is verplicht',
        reasonError: 'Reden is verplicht',
        successTitle: 'Je nieuwe kaart is onderweg!',
        successDescription: 'Je moet deze activeren zodra hij over een paar werkdagen is aangekomen. In de tussentijd kun je een virtuele kaart gebruiken.',
    },
    eReceipt: {
        guaranteed: 'Gegarandeerde eBon',
        transactionDate: 'Transactiedatum',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Begin een chat, <success><strong>verwijs een vriend</strong></success>.',
            header: 'Begin een chat, verwijs een vriend',
            body: 'Wil je dat je vrienden Expensify ook gebruiken? Begin gewoon een chat met hen en wij zorgen voor de rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Dien een uitgave in, <success><strong>verwijs je team door</strong></success>.',
            header: 'Dien een onkostendeclaratie in, nodig je team uit',
            body: 'Wil je dat jouw team Expensify ook gebruikt? Dien gewoon een onkostendeclaratie bij hen in en wij regelen de rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Vriend doorverwijzen',
            body: 'Wil je dat je vrienden Expensify ook gebruiken? Chat, betaal of splits gewoon een uitgave met hen en wij zorgen voor de rest. Of deel gewoon je uitnodigingslink!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Vriend doorverwijzen',
            header: 'Vriend doorverwijzen',
            body: 'Wil je dat je vrienden Expensify ook gebruiken? Chat, betaal of splits gewoon een uitgave met hen en wij zorgen voor de rest. Of deel gewoon je uitnodigingslink!',
        },
        copyReferralLink: 'Uitnodigingslink kopiëren',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chat met je set-upspecialist in <a href="${href}">${adminReportName}</a> voor hulp`,
        default: `Stuur een bericht naar <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> voor hulp bij de setup`,
    },
    violations: {
        allTagLevelsRequired: 'Alle tags vereist',
        autoReportedRejectedExpense: 'Deze uitgave is afgewezen.',
        billableExpense: 'Factureerbaar niet meer geldig',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Bon nodig${formattedLimit ? `boven ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Categorie niet meer geldig',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `${surcharge}% valutaconversietoeslag toegepast`,
        customUnitOutOfPolicy: 'Tarief niet geldig voor deze werkruimte',
        duplicatedTransaction: 'Mogelijk duplicaat',
        fieldRequired: 'Rapportvelden zijn verplicht',
        futureDate: 'Toekomstige datum niet toegestaan',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Met ${invoiceMarkup}% verhoogd`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Datum is ouder dan ${maxAge} dagen`,
        missingCategory: 'Ontbrekende categorie',
        missingComment: 'Beschrijving vereist voor geselecteerde categorie',
        missingAttendees: 'Meerdere deelnemers vereist voor deze categorie',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `${tagName ?? 'label'} ontbreekt`,
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
                    return 'Bedrag hoger dan gescande bon';
            }
        },
        modifiedDate: 'Datum wijkt af van gescande bon',
        nonExpensiworksExpense: 'Niet-Expensiworks-uitgave',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Declaratie overschrijdt de automatische goedkeuringslimiet van ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Bedrag boven de categorielimiet van ${formattedLimit} per persoon`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Bedrag boven limiet van ${formattedLimit}/persoon`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Bedrag boven limiet van ${formattedLimit} per reis`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Bedrag boven limiet van ${formattedLimit}/persoon`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Bedrag boven de dagelijkse categorielimiet van ${formattedLimit} per persoon`,
        receiptNotSmartScanned: 'Bon en onkostendetails handmatig toegevoegd.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Bon vereist boven categorielimiet van ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Bon vereist boven ${formattedLimit}`;
            }
            if (category) {
                return `Bon nodig boven categorielimiet`;
            }
            return 'Bon nodig';
        },
        itemizedReceiptRequired: ({formattedLimit}: {formattedLimit?: string}) => `Gespecificeerde bon vereist${formattedLimit ? `boven ${formattedLimit}` : ''}`,
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
                        return `hotelincidentals`;
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
                return 'Kan bon automatisch koppelen vanwege verbroken bankverbinding';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Bankverbinding verbroken. <a href="${companyCardPageURL}">Opnieuw verbinden om bon te koppelen</a>`
                    : 'Bankkoppeling verbroken. Vraag een beheerder om opnieuw te verbinden om de bon te laten overeenkomen.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Vraag ${member} om dit als contant te markeren of wacht 7 dagen en probeer het opnieuw` : 'In afwachting van samenvoeging met kaarttransactie.';
            }
            return '';
        },
        brokenConnection530Error: 'Bon in behandeling vanwege verbroken bankverbinding',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Bon in behandeling vanwege een verbroken bankverbinding. Los dit alsjeblieft op onder <a href="${workspaceCompanyCardRoute}">Bedrijfskaarten</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Bonnetje in behandeling vanwege verbroken bankverbinding. Vraag een werkruimtebeheerder om dit op te lossen.',
        markAsCashToIgnore: 'Markeer als contant om te negeren en betaling aan te vragen.',
        smartscanFailed: ({canEdit = true}) => `Scannen van bon mislukt.${canEdit ? 'Voer gegevens handmatig in.' : ''}`,
        receiptGeneratedWithAI: 'Mogelijke AI-gegenereerde bon',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Ontbreekt ${tagName ?? 'Label'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Label'} niet meer geldig`,
        taxAmountChanged: 'Belastingsbedrag is gewijzigd',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Belasting'} niet meer geldig`,
        taxRateChanged: 'Belastingtarief is aangepast',
        taxRequired: 'Ontbrekend belastingtarief',
        none: 'Geen',
        taxCodeToKeep: 'Kies welke belastingcode je wilt behouden',
        tagToKeep: 'Kies welke tag je wilt behouden',
        isTransactionReimbursable: 'Kies of de transactie vergoedbaar is',
        merchantToKeep: 'Kies welke leverancier je wilt behouden',
        descriptionToKeep: 'Kies welke beschrijving je wilt behouden',
        categoryToKeep: 'Kies welke categorie je wilt behouden',
        isTransactionBillable: 'Kies of de transactie factureerbaar is',
        keepThisOne: 'Deze behouden',
        confirmDetails: `Bevestig de gegevens die je behoudt`,
        confirmDuplicatesInfo: `De duplicaten die je niet bewaart, blijven staan zodat de indiener ze kan verwijderen.`,
        hold: 'Deze uitgave is gepauzeerd',
        resolvedDuplicates: 'heeft het duplicaat opgelost',
        companyCardRequired: 'Bedrijfspaskaarten verplicht',
        noRoute: 'Selecteer een geldig adres',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} is verplicht`,
        reportContainsExpensesWithViolations: 'Rapport bevat onkostendeclaraties met overtredingen.',
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
        pause: 'Pauze',
        fullscreen: 'Volledig scherm',
        playbackSpeed: 'Afspeelsnelheid',
        expand: 'Uitklappen',
        mute: 'Dempen',
        unmute: 'Dempen opheffen',
        normal: 'Normaal',
    },
    exitSurvey: {
        header: 'Voor je gaat',
        reasonPage: {
            title: 'Vertel ons alsjeblieft waarom je weggaat',
            subtitle: 'Voordat u gaat, vertelt u ons alstublieft waarom u wilt overschakelen naar Expensify Classic.',
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
        thankYouSubtitle: 'Uw feedback helpt ons een beter product te bouwen om dingen gedaan te krijgen. Hartelijk dank!',
        goToExpensifyClassic: 'Overschakelen naar Expensify Classic',
        offlineTitle: 'Het lijkt erop dat je hier vastzit...',
        offline:
            'Het lijkt erop dat je offline bent. Helaas werkt Expensify Classic niet offline, maar New Expensify wel. Als je Expensify Classic liever gebruikt, probeer het dan opnieuw wanneer je een internetverbinding hebt.',
        quickTip: 'Snelle tip...',
        quickTipSubTitle: 'Je kunt rechtstreeks naar Expensify Classic gaan door expensify.com te bezoeken. Voeg het toe aan je bladwijzers als handige snelkoppeling!',
        bookACall: 'Plan een gesprek',
        bookACallTitle: 'Wil je met een productmanager spreken?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Direct chatten over uitgaven en rapporten',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Mogelijkheid om alles op mobiel te doen',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Reizen en declareren met de snelheid van chat',
        },
        bookACallTextTop: 'Als je overschakelt naar Expensify Classic, loop je het volgende mis:',
        bookACallTextBottom: 'We gaan graag met je in gesprek om te begrijpen waarom. Je kunt een gesprek inplannen met een van onze senior productmanagers om je behoeften te bespreken.',
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
        authenticatePaymentCard: 'Betaalkaart verifiëren',
        mobileReducedFunctionalityMessage: 'Je kunt je abonnement niet wijzigen in de mobiele app.',
        badge: {
            freeTrial: (numOfDays: number) => `Proefperiode: nog ${numOfDays} ${numOfDays === 1 ? 'dag' : 'dagen'} over`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Je betaalgegevens zijn verouderd',
                subtitle: (date: string) => `Werk uw betaalkaart bij vóór ${date} om al uw favoriete functies te blijven gebruiken.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Je betaling kon niet worden verwerkt',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `Uw afschrijving van ${date} ter hoogte van ${purchaseAmountOwed} kon niet worden verwerkt. Voeg een betaalkaart toe om het openstaande bedrag te voldoen.`
                        : 'Voeg een betaalkaart toe om het openstaande bedrag te vereffenen.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Je betaalgegevens zijn verouderd',
                subtitle: (date: string) => `Uw betaling is achterstallig. Betaal uw factuur vóór ${date} om onderbreking van de dienstverlening te voorkomen.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Je betaalgegevens zijn verouderd',
                subtitle: 'Uw betaling is achterstallig. Betaal alstublieft uw factuur.',
            },
            billingDisputePending: {
                title: 'Je kaart kon niet worden belast',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `Je hebt de betwiste ${amountOwed}-afschrijving op de kaart die eindigt op ${cardEnding}. Je account blijft vergrendeld totdat het geschil met je bank is opgelost.`,
            },
            cardAuthenticationRequired: {
                title: 'Je betaalkaart is nog niet volledig geverifieerd.',
                subtitle: (cardEnding: string) => `Voltooi het authenticatieproces om je betaalpas met eindigend nummer ${cardEnding} te activeren.`,
            },
            insufficientFunds: {
                title: 'Je kaart kon niet worden belast',
                subtitle: (amountOwed: number) =>
                    `Uw betaalkaart is geweigerd wegens onvoldoende saldo. Probeer het opnieuw of voeg een nieuwe betaalkaart toe om uw openstaande saldo van ${amountOwed} te voldoen.`,
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
                subtitle: 'Je kaart is succesvol belast.',
            },
            retryBillingError: {
                title: 'Je kaart kon niet worden belast',
                subtitle:
                    'Voordat je het opnieuw probeert, neem eerst rechtstreeks contact op met je bank om Expensify-kosten goed te keuren en eventuele blokkades te verwijderen. Probeer anders een andere betaalkaart toe te voegen.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Je hebt de betwiste ${amountOwed}-afschrijving op de kaart die eindigt op ${cardEnding}. Je account blijft vergrendeld totdat het geschil met je bank is opgelost.`,
            preTrial: {
                title: 'Start een gratis proefperiode',
                subtitle: 'Voer als volgende stap je <a href="#">instelchecklist uit</a>, zodat je team kan beginnen met declareren.',
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
                subscriptionPageTitle: (discountType: number) =>
                    `<strong>${discountType}% korting op je eerste jaar!</strong> Voeg gewoon een betaalkaart toe en start een jaarlijks abonnement.`,
                onboardingChatTitle: (discountType: number) => `Aanbieding voor beperkte tijd: ${discountType}% korting op je eerste jaar!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `Dien in binnen ${days > 0 ? `${days}d :` : ''}${hours}u : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Betaling',
            subtitle: 'Voeg een kaart toe om je Expensify-abonnement te betalen.',
            addCardButton: 'Betaalkaart toevoegen',
            cardInfo: (name: string, expiration: string, currency: string) => `Naam: ${name}, Vervaldatum: ${expiration}, Valuta: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Je volgende betaaldatum is ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Kaart eindigend op ${cardNumber}`,
            changeCard: 'Betalingskaart wijzigen',
            changeCurrency: 'Valutasoort wijzigen',
            cardNotFound: 'Geen betaalkaart toegevoegd',
            retryPaymentButton: 'Betaling opnieuw proberen',
            authenticatePayment: 'Betaling verifiëren',
            requestRefund: 'Terugbetaling aanvragen',
            requestRefundModal: {
                full: 'Een terugbetaling krijgen is eenvoudig: downgrade je account vóór je volgende factureringsdatum en je ontvangt een terugbetaling. <br /> <br /> Let op: je account downgraden betekent dat je workspace(s) worden verwijderd. Deze actie kan niet ongedaan worden gemaakt, maar je kunt altijd een nieuwe workspace aanmaken als je van gedachten verandert.',
                confirm: 'Werkruimten verwijderen en downgraden',
            },
            viewPaymentHistory: 'Bekijk betalingsgeschiedenis',
        },
        yourPlan: {
            title: 'Uw abonnement',
            exploreAllPlans: 'Bekijk alle abonnementen',
            customPricing: 'Prijs op maat',
            asLowAs: ({price}: YourPlanPriceValueParams) => `al vanaf ${price} per actieve deelnemer/maand`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} per lid/maand`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} per lid per maand`,
            perMemberMonth: 'per lid/maand',
            collect: {
                title: 'Incasseren',
                description: 'Het kleine bedrijfsabonnement dat je onkosten, reizen en chat biedt.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                benefit1: 'Bonnetjes scannen',
                benefit2: 'Terugbetalingen',
                benefit3: 'Beheer van zakelijke kaarten',
                benefit4: 'Declaraties en reisgoedkeuringen',
                benefit5: 'Reisboeking en regels',
                benefit6: 'QuickBooks/Xero-integraties',
                benefit7: 'Chatten over uitgaven, rapporten en ruimtes',
                benefit8: 'AI- en menselijke ondersteuning',
            },
            control: {
                title: 'Beheer',
                description: 'Declareren, reizen en chatten voor grotere bedrijven.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                benefit1: 'Alles in het Collect-abonnement',
                benefit2: 'Goedkeuringsworkflows met meerdere niveaus',
                benefit3: 'Aangepaste declaratieregels',
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
            saveWithExpensifyDescription: 'Gebruik onze besparingscalculator om te zien hoe cashback van de Expensify Card je Expensify‑rekening kan verlagen.',
            saveWithExpensifyButton: 'Meer informatie',
        },
        compareModal: {
            comparePlans: 'Vergelijk abonnementen',
            subtitle: `<muted-text>Ontgrendel de functies die je nodig hebt met het abonnement dat het beste bij je past. <a href="${CONST.PRICING}">Bekijk onze prijspagina</a> voor een volledig overzicht van de functies van elk abonnement.</muted-text>`,
        },
        details: {
            title: 'Abonnementsgegevens',
            annual: 'Jaarabonnement',
            taxExempt: 'Vraag belastingvrijstelling aan',
            taxExemptEnabled: 'Vrijgesteld van belasting',
            taxExemptStatus: 'Belastingvrijstellingstatus',
            payPerUse: 'Betalen per gebruik',
            subscriptionSize: 'Abonnementsgrootte',
            headsUp:
                'Let op: als je je abonnementsomvang nu niet instelt, stellen wij die automatisch in op het aantal actieve leden in je eerste maand. Je zit dan vast aan het betalen voor ten minste dit aantal leden gedurende de komende 12 maanden. Je kunt je abonnementsomvang op elk moment verhogen, maar je kunt deze pas verlagen als je abonnement is afgelopen.',
            zeroCommitment: 'Geen verplichtingen tegen het gereduceerde jaarlijkse abonnements­tarief',
        },
        subscriptionSize: {
            title: 'Abonnementsgrootte',
            yourSize: 'De omvang van je abonnement is het aantal open plaatsen dat in een bepaalde maand door actieve leden kan worden ingevuld.',
            eachMonth:
                'Elke maand dekt je abonnement tot het aantal actieve leden dat hierboven is ingesteld. Telkens wanneer je je abonnementsomvang verhoogt, start je een nieuw 12-maandenabonnement met die nieuwe omvang.',
            note: 'Opmerking: Een actief lid is iedereen die onkostengegevens heeft aangemaakt, bewerkt, ingediend, goedgekeurd, terugbetaald of geëxporteerd die gekoppeld zijn aan de werkruimte van je bedrijf.',
            confirmDetails: 'Bevestig de gegevens van je nieuwe jaarlijkse abonnement:',
            subscriptionSize: 'Abonnementsgrootte',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} actieve leden/maand`,
            subscriptionRenews: 'Abonnement wordt verlengd',
            youCantDowngrade: 'Je kunt niet downgraden tijdens je jaarlijkse abonnement.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Je hebt je al verbonden aan een jaarabonnement van ${size} actieve leden per maand tot ${date}. Je kunt op ${date} overschakelen naar een verbruikersabonnement door automatisch verlengen uit te schakelen.`,
            error: {
                size: 'Voer een geldige abonnementsomvang in',
                sameSize: 'Voer een ander getal in dan je huidige abonnementsomvang',
            },
        },
        paymentCard: {
            addPaymentCard: 'Betaalkaart toevoegen',
            enterPaymentCardDetails: 'Voer je betaalkaartgegevens in',
            security: 'Expensify is PCI-DSS-conform, gebruikt encryptie op bankniveau en maakt gebruik van redundante infrastructuur om je gegevens te beschermen.',
            learnMoreAboutSecurity: 'Meer informatie over onze beveiliging.',
        },
        subscriptionSettings: {
            title: 'Abonnementsinstellingen',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Abonnementstype: ${subscriptionType}, Abonnementsomvang: ${subscriptionSize}, Automatisch verlengen: ${autoRenew}, Jaarlijkse stoelen automatisch verhogen: ${autoIncrease}`,
            none: 'geen',
            on: 'aan',
            off: 'uit',
            annual: 'Jaarlijks',
            autoRenew: 'Automatisch verlengen',
            autoIncrease: 'Aantal jaarlijkse licenties automatisch verhogen',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Bespaar tot ${amountWithCurrency}/maand per actief lid`,
            automaticallyIncrease:
                'Verhoog je jaarlijkse aantal seats automatisch om ruimte te maken voor actieve leden die je abonnementsomvang overschrijden. Let op: hierdoor wordt de einddatum van je jaarlijkse abonnement verlengd.',
            disableAutoRenew: 'Automatisch verlengen uitschakelen',
            helpUsImprove: 'Help ons Expensify verbeteren',
            whatsMainReason: 'Wat is de belangrijkste reden dat je automatische verlenging uitschakelt?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Wordt verlengd op ${date}.`,
            pricingConfiguration: 'De prijs is afhankelijk van de configuratie. Kies voor de laagste prijs een jaarlijks abonnement en neem de Expensify Card.',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>Lees meer op onze <a href="${CONST.PRICING}">prijspagina</a> of chat met ons team in je ${hasAdminsRoom ? `<a href="adminsRoom">#admins-kamer.</a>` : '#admins-kamer.'}</muted-text>`,
            estimatedPrice: 'Geschatte prijs',
            changesBasedOn: 'Dit verandert op basis van je gebruik van de Expensify Card en de abonnementsopties hieronder.',
        },
        requestEarlyCancellation: {
            title: 'Vroegtijdige annulering aanvragen',
            subtitle: 'Wat is de belangrijkste reden dat je om vroegtijdige annulering verzoekt?',
            subscriptionCanceled: {
                title: 'Abonnement geannuleerd',
                subtitle: 'Je jaarlijkse abonnement is opgezegd.',
                info: 'Als je je werkruimte(n) op basis van betalen per gebruik wilt blijven gebruiken, ben je helemaal klaar.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Als je toekomstige activiteit en kosten wilt voorkomen, moet je <a href="${workspacesListRoute}">je workspace(s) verwijderen</a>. Let op: wanneer je je workspace(s) verwijdert, worden alle openstaande activiteiten die in de huidige kalendermaand hebben plaatsgevonden, in rekening gebracht.`,
            },
            requestSubmitted: {
                title: 'Aanvraag ingediend',
                subtitle:
                    'Bedankt dat je ons laat weten dat je je abonnement wilt opzeggen. We bekijken je verzoek en nemen binnenkort contact met je op via je chat met <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Door om vroegtijdige beëindiging te verzoeken, erken en ga ik ermee akkoord dat Expensify op grond van de Expensify <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Servicevoorwaarden</a> of een andere toepasselijke dienstenovereenkomst tussen mij en Expensify niet verplicht is een dergelijk verzoek te honoreren, en dat Expensify de uitsluitende bevoegdheid behoudt om te beslissen over de toewijzing van een dergelijk verzoek.`,
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
        changedRoomAvatar: 'heeft de kamerpictogram gewijzigd',
        removedRoomAvatar: 'heeft de ruimte-avatar verwijderd',
    },
    delegate: {
        switchAccount: 'Accounts wisselen:',
        copilotDelegatedAccess: 'Copilot: Gedelegeerde toegang',
        copilotDelegatedAccessDescription: 'Sta andere leden toe om toegang te krijgen tot je account.',
        addCopilot: 'Copiloot toevoegen',
        membersCanAccessYourAccount: 'Deze leden hebben toegang tot je account:',
        youCanAccessTheseAccounts: 'Je hebt toegang tot deze accounts via de accountwisselaar:',
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
        genericError: 'Oeps, er is iets misgegaan. Probeer het alsjeblieft opnieuw.',
        onBehalfOfMessage: (delegator: string) => `namens ${delegator}`,
        accessLevel: 'Toegangsniveau',
        confirmCopilot: 'Bevestig hieronder je copiloot.',
        accessLevelDescription: 'Kies hieronder een toegangs­niveau. Zowel volledige als beperkte toegang stellen copilots in staat alle gesprekken en uitgaven te bekijken.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Sta een ander lid toe om alle acties in je account namens jou uit te voeren. Dit omvat chatten, indienen, goedkeuren, betalingen, het bijwerken van instellingen en meer.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Sta een ander lid toe om namens jou de meeste acties in je account uit te voeren. Dit geldt niet voor goedkeuringen, betalingen, afwijzingen en blokkeringen.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copiloot verwijderen',
        removeCopilotConfirmation: 'Weet je zeker dat je deze copilot wilt verwijderen?',
        changeAccessLevel: 'Toegangsniveau wijzigen',
        makeSureItIsYou: 'Laten we controleren of jij het bent',
        enterMagicCode: (contactMethod: string) =>
            `Voer de magische code in die naar ${contactMethod} is gestuurd om een copiloot toe te voegen. Deze zou binnen een of twee minuten moeten aankomen.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Voer de magische code in die naar ${contactMethod} is gestuurd om je copiloot bij te werken.`,
        notAllowed: 'Niet zo snel...',
        noAccessMessage: dedent(`
            Als copiloot heb je geen toegang tot
            deze pagina. Sorry!
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `Als <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilot</a> voor ${accountOwnerEmail} heb je geen toestemming om deze actie uit te voeren. Sorry!`,
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
        missingProperty: ({propertyName}: MissingPropertyParams) => `Ontbrekende ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Ongeldige eigenschap: ${propertyName} - Verwacht: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Ongeldige waarde - Verwacht: ${expectedValues}`,
        missingValue: 'Ontbrekende waarde',
        createReportAction: 'Actie rapport maken',
        reportAction: 'Rapportactie',
        report: 'Rapport',
        transaction: 'Transactie',
        violations: 'Overtredingen',
        transactionViolation: 'Transactieovertreding',
        hint: 'Gegevenswijzigingen worden niet naar de backend gestuurd',
        textFields: 'Tekstvelden',
        numberFields: 'Getalvelden',
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
        false: 'onwaar',
        viewReport: 'Rapport bekijken',
        viewTransaction: 'Transactie weergeven',
        createTransactionViolation: 'Overtreding transactie aanmaken',
        reasonVisibleInLHN: {
            hasDraftComment: 'Heeft conceptopmerking',
            hasGBR: 'Heeft GBR',
            hasRBR: 'Heeft RBR',
            pinnedByUser: 'Vastgezet door lid',
            hasIOUViolations: 'Heeft IOU-overtredingen',
            hasAddWorkspaceRoomErrors: 'Heeft fouten bij toevoegen werkruimtekamer',
            isUnread: 'Is ongelezen (focusmodus)',
            isArchived: 'Is gearchiveerd (meest recente modus)',
            isSelfDM: 'Is eigen DM',
            isFocused: 'Is tijdelijk gefocust',
        },
        reasonGBR: {
            hasJoinRequest: 'Heeft toetredingsverzoek (adminruimte)',
            isUnreadWithMention: 'Is ongelezen met vermelding',
            isWaitingForAssigneeToCompleteAction: 'Wacht tot de verantwoordelijke de actie voltooit',
            hasChildReportAwaitingAction: 'Heeft onderliggende rapport in afwachting van actie',
            hasMissingInvoiceBankAccount: 'Heeft geen bankrekening voor facturen',
            hasUnresolvedCardFraudAlert: 'Heeft onopgeloste kaartfraudewaarschuwing',
            hasDEWApproveFailed: 'Goedkeuring door DEW is mislukt',
        },
        reasonRBR: {
            hasErrors: 'Bevat fouten in rapport- of rapportactiegegevens',
            hasViolations: 'Heeft overtredingen',
            hasTransactionThreadViolations: 'Heeft transactiedraadschendingen',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Er staat een rapport te wachten op actie',
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
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Er is een probleem opgetreden tijdens het synchroniseren van een workspace-verbinding',
            theresAProblemWithYourWallet: 'Er is een probleem met je wallet',
            theresAProblemWithYourWalletTerms: 'Er is een probleem met de voorwaarden van je wallet',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Maak een proefrit',
    },
    migratedUserWelcomeModal: {
        title: 'Welkom bij New Expensify!',
        subtitle: 'Het bevat alles wat je kent en leuk vindt aan onze klassieke ervaring, plus een heleboel upgrades om je leven nog makkelijker te maken:',
        confirmText: 'Laten we gaan!',
        helpText: 'Probeer demo van 2 minuten',
        features: {
            search: 'Krachtigere zoekfunctie op mobiel, web en desktop',
            concierge: 'Ingebouwde Concierge-AI om je uitgaven te automatiseren',
            chat: 'Chat over elke uitgave om vragen snel op te lossen',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: '<tooltip>Begin <strong>hier!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Hernoem je opgeslagen zoekopdrachten</strong> hier!</tooltip>',
        accountSwitcher: '<tooltip>Ga hier naar je <strong>Copilot-accounts</strong></tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Scan onze testbon</strong> om te zien hoe het werkt!</tooltip>',
            manager: '<tooltip>Kies onze <strong>testmanager</strong> om het uit te proberen!</tooltip>',
            confirmation: '<tooltip>Dien nu <strong>je onkosten in</strong> en zie de magie gebeuren!</tooltip>',
            tryItOut: 'Probeer het uit',
        },
        outstandingFilter: '<tooltip>Filter voor uitgaven\ndie <strong>goedkeuring nodig hebben</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Stuur deze bon om\n<strong>de proefrit af te ronden!</strong></tooltip>',
        gpsTooltip: '<tooltip>GPS-tracking bezig! Als je klaar bent, stop dan hieronder met volgen.</tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Wijzigingen negeren?',
        body: 'Weet je zeker dat je de wijzigingen die je hebt aangebracht wilt weggooien?',
        confirmText: 'Wijzigingen verwerpen',
    },
    scheduledCall: {
        book: {
            title: 'Gesprek plannen',
            description: 'Zoek een tijd die voor jou werkt.',
            slots: ({date}: {date: string}) => `<muted-text>Beschikbare tijden voor <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Oproep bevestigen',
            description: 'Zorg ervoor dat de onderstaande gegevens er goed uitzien voor jou. Zodra je het gesprek bevestigt, sturen we een uitnodiging met meer informatie.',
            setupSpecialist: 'Je configuratiespecialist',
            meetingLength: 'Duur van vergadering',
            dateTime: 'Datum en tijd',
            minutes: '30 minuten',
        },
        callScheduled: 'Afspraak ingepland',
    },
    autoSubmitModal: {
        title: 'Helemaal duidelijk en verzonden!',
        description: 'Alle waarschuwingen en overtredingen zijn gewist, dus:',
        submittedExpensesTitle: 'Deze declaraties zijn ingediend',
        submittedExpensesDescription: 'Deze declaraties zijn naar je fiatteur gestuurd, maar kunnen nog worden bewerkt totdat ze zijn goedgekeurd.',
        pendingExpensesTitle: 'In afwachting zijnde uitgaven zijn verplaatst',
        pendingExpensesDescription: 'Alle openstaande kaartuitgaven zijn verplaatst naar een apart rapport totdat ze worden geboekt.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Maak een proefrit van 2 minuten',
        },
        modal: {
            title: 'Neem ons mee voor een proefrit',
            description: 'Volg een korte productrondleiding om snel op de hoogte te zijn.',
            confirmText: 'Testrit starten',
            helpText: 'Overslaan',
            employee: {
                description:
                    '<muted-text>Geef je team <strong>3 gratis maanden Expensify!</strong> Vul hieronder gewoon het e-mailadres van je baas in en stuur een proefuitgave.</muted-text>',
                email: 'Voer het e-mailadres van je/uw baas in',
                error: 'Dat lid is eigenaar van een werkruimte, voer een nieuw lid in om te testen.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Je bent Expensify momenteel aan het uitproberen',
            readyForTheRealThing: 'Klaar voor het echte werk?',
            getStarted: 'Aan de slag',
        },
        employeeInviteMessage: (name: string) => `# ${name} heeft je uitgenodigd om Expensify uit te proberen
Hoi! Ik heb zojuist *3 maanden gratis* geregeld om Expensify uit te proberen, de snelste manier om onkosten te verwerken.

Hier is een *testbon* om je te laten zien hoe het werkt:`,
    },
    export: {
        basicExport: 'Basisexport',
        reportLevelExport: 'Alle gegevens - rapportniveau',
        expenseLevelExport: 'Alle gegevens - kostenbonniveau',
        exportInProgress: 'Export bezig',
        conciergeWillSend: 'Concierge stuurt je het bestand zo meteen.',
    },
    domain: {
        notVerified: 'Niet geverifieerd',
        retry: 'Opnieuw proberen',
        verifyDomain: {
            title: 'Domein verifiëren',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Controleer voordat je doorgaat of jij eigenaar bent van <strong>${domainName}</strong> door de DNS-instellingen ervan bij te werken.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Ga naar je DNS-provider en open de DNS-instellingen voor <strong>${domainName}</strong>.`,
            addTXTRecord: 'Voeg het volgende TXT-record toe:',
            saveChanges: 'Sla de wijzigingen op en keer hier terug om je domein te verifiëren.',
            youMayNeedToConsult: `Mogelijk moet je contact opnemen met de IT-afdeling van je organisatie om de verificatie te voltooien. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Meer informatie</a>.`,
            warning: 'Na verificatie ontvangen alle Expensify‑leden op je domein een e‑mail dat hun account onder jouw domein zal worden beheerd.',
            codeFetchError: 'Kon verificatiecode niet ophalen',
            genericError: 'We konden uw domein niet verifiëren. Probeer het opnieuw en neem contact op met Concierge als het probleem zich blijft voordoen.',
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
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> is een beveiligingsfunctie die je meer controle geeft over hoe leden met e‑mails van <strong>${domainName}</strong> inloggen bij Expensify. Om dit in te schakelen, moet je jezelf verifiëren als een bevoegde bedrijfsbeheerder.</muted-text>`,
            fasterAndEasierLogin: 'Sneller en eenvoudiger inloggen',
            moreSecurityAndControl: 'Meer beveiliging en controle',
            onePasswordForAnything: 'Eén wachtwoord voor alles',
        },
        goToDomain: 'Ga naar domein',
        samlLogin: {
            title: 'SAML-aanmelding',
            subtitle: `<muted-text>Configureer aanmelden voor leden met <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO).</a></muted-text>`,
            enableSamlLogin: 'SAML-aanmelding inschakelen',
            allowMembers: 'Leden toestaan in te loggen met SAML.',
            requireSamlLogin: 'SAML-login vereisen',
            anyMemberWillBeRequired: 'Alle leden die zijn aangemeld met een andere methode, moeten zich opnieuw authenticeren via SAML.',
            enableError: 'Kon de SAML-inschakelingsinstelling niet bijwerken',
            requireError: 'Kon vereiste SAML-instelling niet bijwerken',
            disableSamlRequired: 'SAML-verplichting uitschakelen',
            oktaWarningPrompt: 'Weet je het zeker? Dit schakelt ook Okta SCIM uit.',
            requireWithEmptyMetadataError: 'Voeg hieronder Identity Provider-metadata toe om in te schakelen',
        },
        samlConfigurationDetails: {
            title: 'SAML-configuratiedetails',
            subtitle: 'Gebruik deze gegevens om SAML in te stellen.',
            identityProviderMetadata: 'Metagegevens van identiteitsprovider',
            entityID: 'Entiteits-ID',
            nameIDFormat: 'Naam-ID-indeling',
            loginUrl: 'Login-URL',
            acsUrl: 'ACS-URL (Assertion Consumer Service)',
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
            companyCardManagement: 'Bedrijfskaartbeheer',
            accountCreationAndDeletion: 'Account aanmaken en verwijderen',
            workspaceCreation: 'Aanmaken van werkruimte',
            samlSSO: 'SAML-SSO',
        },
        addDomain: {
            title: 'Domein toevoegen',
            subtitle: 'Voer de naam in van het privédomein dat je wilt openen (bijv. expensify.com).',
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
            subtitle: 'Vereis dat leden op jouw domein inloggen via single sign-on, beperk het aanmaken van werkruimtes en meer.',
            enable: 'Inschakelen',
        },
        domainAdmins: 'Domeinbeheerders',
        admins: {
            title: 'Beheerders',
            findAdmin: 'Beheerder zoeken',
            primaryContact: 'Primair contactpersoon',
            addPrimaryContact: 'Primair contactpersoon toevoegen',
            setPrimaryContactError: 'Kan het primaire contact niet instellen. Probeer het later opnieuw.',
            settings: 'Instellingen',
            consolidatedDomainBilling: 'Geconsolideerde domeinfacturering',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Indien ingeschakeld, betaalt de primaire contactpersoon voor alle werkruimtes die eigendom zijn van leden van <strong>${domainName}</strong> en ontvangt deze alle factuurbewijzen.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'De geconsolideerde domeinfacturering kon niet worden gewijzigd. Probeer het later opnieuw.',
            addAdmin: 'Beheerder toevoegen',
            addAdminError: 'Kan dit lid niet als beheerder toevoegen. Probeer het opnieuw.',
            revokeAdminAccess: 'Beheerderstoegang intrekken',
            cantRevokeAdminAccess: 'Kan de beheerdersrechten van de technische contactpersoon niet intrekken',
            error: {
                removeAdmin: 'Kan deze gebruiker niet als beheerder verwijderen. Probeer het opnieuw.',
                removeDomain: 'Kan dit domein niet verwijderen. Probeer het opnieuw.',
                removeDomainNameInvalid: 'Voer uw domeinnaam in om deze opnieuw in te stellen.',
            },
            resetDomain: 'Domein resetten',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Typ <strong>${domainName}</strong> om het resetten van het domein te bevestigen.`,
            enterDomainName: 'Voer hier je domeinnaam in',
            resetDomainInfo: `Deze actie is <strong>definitief</strong> en de volgende gegevens worden verwijderd: <br/> <ul><li>Bedrijfskaartkoppelingen en alle niet-ingediende uitgaven van die kaarten</li> <li>SAML- en groepsinstellingen</li> </ul> Alle accounts, werkruimten, rapporten, uitgaven en andere gegevens blijven behouden. <br/><br/>Opmerking: je kunt dit domein verwijderen uit je domeinenlijst door het bijbehorende e-mailadres te verwijderen uit je <a href="#">contactmethoden</a>.`,
        },
        members: {
            title: 'Leden',
            findMember: 'Lid zoeken',
            addMember: 'Lid toevoegen',
            email: 'E-mailadres',
            errors: {
                addMember: 'Kan dit lid niet toevoegen. Probeer het opnieuw.',
            },
        },
    },
};
export default translations;
