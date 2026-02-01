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
        count: 'Aantal',
        cancel: 'Annuleren',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: 'Sluiten',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: 'Doorgaan',
        unshare: 'Niet meer delen',
        yes: 'Ja',
        no: 'Nee',
        // @context Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.
        ok: 'OK',
        notNow: 'Nu niet',
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
        goBack: 'Ga terug',
        create: 'Maken',
        add: 'Toevoegen',
        resend: 'Opnieuw verzenden',
        save: 'Opslaan',
        select: 'Select',
        deselect: 'Deselecteren',
        // @context Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.
        selectMultiple: 'Meervoudige selectie',
        saveChanges: 'Wijzigingen opslaan',
        submit: 'Verzenden',
        // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        submitted: 'Ingediend',
        rotate: 'Draaien',
        zoom: 'Zoom',
        password: 'Wachtwoord',
        magicCode: 'Magische code',
        digits: 'cijfers',
        twoFactorCode: 'Tweeledige code',
        workspaces: 'Werkruimtes',
        inbox: 'Inbox',
        // @context Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”
        success: 'Gelukt',
        group: 'Groep',
        profile: 'Profiel',
        referral: 'Verwijzing',
        payments: 'Betalingen',
        approvals: 'Goedkeuringen',
        wallet: 'Portemonnee',
        preferences: 'Voorkeuren',
        view: 'Bekijken',
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
        analyzing: 'Analyseren...',
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
        recents: 'Recenten',
        close: 'Sluiten',
        comment: 'Opmerking',
        download: 'Download',
        downloading: 'Downloaden',
        // @context Indicates that a file is currently being uploaded (sent to the server), not downloaded.
        uploading: 'Bezig met uploaden',
        // @context as a verb, not a noun
        pin: 'Vastzetten',
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
        ssnFull9: 'Volledige 9 cijfers van SSN',
        addressLine: (lineNumber: number) => `Adresregel ${lineNumber}`,
        personalAddress: 'Privéadres',
        companyAddress: 'Bedrijfsadres',
        noPO: 'Geen postbussen of postdoorstuuradressen, alstublieft.',
        city: 'Stad',
        state: 'Staat',
        streetAddress: 'Straatadres',
        stateOrProvince: 'Staat / Provincie',
        country: 'Land',
        zip: 'Postcode',
        zipPostCode: 'Postcode',
        whatThis: 'Wat is dit?',
        iAcceptThe: 'Ik ga akkoord met de',
        acceptTermsAndPrivacy: `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify Servicevoorwaarden</a> en het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacybeleid</a>`,
        acceptTermsAndConditions: `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">algemene voorwaarden</a>`,
        acceptTermsOfService: `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify-servicevoorwaarden</a>`,
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
        converted: 'Geconverteerd',
        error: {
            invalidAmount: 'Ongeldig bedrag',
            acceptTerms: 'U moet de Servicevoorwaarden accepteren om door te gaan',
            phoneNumber: `Voer een volledig telefoonnummer in
(bijv. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Dit veld is verplicht',
            requestModified: 'Dit verzoek wordt bewerkt door een ander lid',
            characterLimitExceedCounter: (length: number, limit: number) => `Tekenlimiet overschreden (${length}/${limit})`,
            dateInvalid: 'Selecteer een geldige datum',
            invalidDateShouldBeFuture: 'Kies alstublieft vandaag of een toekomstige datum',
            invalidTimeShouldBeFuture: 'Kies een tijd die minstens één minuut in de toekomst ligt',
            invalidCharacter: 'Ongeldig teken',
            enterMerchant: 'Voer een leveranciersnaam in',
            enterAmount: 'Voer een bedrag in',
            missingMerchantName: 'Ontbrekende naam van leverancier',
            missingAmount: 'Ontbrekend bedrag',
            missingDate: 'Ontbrekende datum',
            enterDate: 'Voer een datum in',
            invalidTimeRange: 'Voer een tijd in met behulp van de 12-uurskloknotatie (bijv. 2:30 PM)',
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
        inTheFormBeforeContinuing: 'in het formulier voordat u doorgaat',
        confirm: 'Bevestigen',
        reset: 'Opnieuw instellen',
        // @context Status or button indicating that an action or process has been completed. Should reflect completion.
        done: 'Voltooid',
        more: 'Meer',
        debitCard: 'Debitcard',
        bankAccount: 'Bankrekening',
        personalBankAccount: 'Persoonlijke bankrekening',
        businessBankAccount: 'Zakelijke bankrekening',
        join: 'Deelnemen',
        leave: 'Verlof',
        decline: 'Weigeren',
        reject: 'Afwijzen',
        transferBalance: 'Saldo overboeken',
        // @context Instruction telling the user to input data manually. Refers to entering text or values in a field.
        enterManually: 'Voer het handmatig in',
        message: 'Bericht',
        leaveThread: 'Thread verlaten',
        you: 'U',
        // @context Refers to the current user in the UI. Should follow capitalization rules for labels/pronouns in the target language.
        me: 'Ik',
        youAfterPreposition: 'u',
        your: 'uw',
        conciergeHelp: 'Neem contact op met Concierge voor hulp.',
        youAppearToBeOffline: 'Het lijkt erop dat je offline bent.',
        thisFeatureRequiresInternet: 'Deze functie vereist een actieve internetverbinding.',
        attachmentWillBeAvailableOnceBackOnline: 'Bijlage wordt beschikbaar zodra je weer online bent.',
        errorOccurredWhileTryingToPlayVideo: 'Er is een fout opgetreden tijdens het afspelen van deze video.',
        areYouSure: 'Weet je het zeker?',
        verify: 'Verifiëren',
        yesContinue: 'Ja, ga verder',
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
        showLess: 'Minder weergeven',
        merchant: 'Handelaar',
        change: 'Wijzigen',
        category: 'Categorie',
        report: 'Rapport',
        billable: 'Factureerbaar',
        nonBillable: 'Niet-declarabel',
        tag: 'Tag',
        receipt: 'Bon',
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
        rate: 'Tarief',
        emptyLHN: {
            title: 'Woohoo! Helemaal bijgewerkt.',
            subtitleText1: 'Zoek een chat met behulp van de',
            subtitleText2: 'knop hierboven of maak iets met behulp van',
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
        chooseFile: 'Bestand kiezen',
        chooseFiles: 'Kies bestanden',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: 'Laat het hier los',
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
        secondAbbreviation: 's',
        skip: 'Overslaan',
        chatWithAccountManager: (accountManagerDisplayName: string) => `Iets specifieks nodig? Chat met je accountmanager, ${accountManagerDisplayName}.`,
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
        leaveWorkspaceConfirmation: 'Als je deze werkruimte verlaat, kun je er geen uitgaven meer naar indienen.',
        leaveWorkspaceConfirmationAuditor: 'Als je deze workspace verlaat, kun je de rapporten en instellingen niet meer bekijken.',
        leaveWorkspaceConfirmationAdmin: 'Als je deze workspace verlaat, kun je de instellingen niet meer beheren.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Als je deze workspace verlaat, word je in de goedkeuringsworkflow vervangen door ${workspaceOwner}, de eigenaar van de workspace.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Als je deze werkruimte verlaat, word je als voorkeurs-exporteur vervangen door ${workspaceOwner}, de eigenaar van de werkruimte.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Als je deze workspace verlaat, wordt je als technisch contactpersoon vervangen door ${workspaceOwner}, de eigenaar van de workspace.`,
        leaveWorkspaceReimburser:
            'Je kunt deze workspace niet verlaten als terugbetaler. Stel een nieuwe terugbetaler in via Workspaces > Betalingen doen of volgen en probeer het daarna opnieuw.',
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
        before: 'Voor',
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
        exchangeRate: 'Wisselkoers',
        reimbursableTotal: 'Totaal te vergoeden',
        nonReimbursableTotal: 'Niet-vergoedbaar totaal',
        originalAmount: 'Oorspronkelijk bedrag',
        insights: 'Inzichten',
        duplicateExpense: 'Dubbele uitgave',
        newFeature: 'Nieuwe functie',
        month: 'Maand',
        home: 'Start',
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
            `Je bent niet gemachtigd om deze actie uit te voeren wanneer support is ingelogd (opdracht: ${command ?? ''}). Als je denkt dat Success in staat zou moeten zijn om deze actie uit te voeren, start dan een gesprek in Slack.`,
    },
    lockedAccount: {
        title: 'Geblokkeerde account',
        description: 'Je mag deze actie niet uitvoeren omdat dit account is vergrendeld. Neem contact op met concierge@expensify.com voor de volgende stappen',
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
        importContactsText: 'Importeer contacten van je telefoon zodat je favoriete mensen altijd met één tik bereikbaar zijn.',
        importContactsExplanation: 'zodat je favoriete mensen altijd maar één tik van je verwijderd zijn.',
        importContactsNativeText: 'Nog één stap! Geef ons groen licht om je contacten te importeren.',
    },
    anonymousReportFooter: {
        logoTagline: 'Doe mee aan de discussie.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Camera-toegang',
        expensifyDoesNotHaveAccessToCamera: 'Expensify kan geen foto’s maken zonder toegang tot je camera. Tik op Instellingen om de machtigingen bij te werken.',
        attachmentError: 'Bijlagefout',
        errorWhileSelectingAttachment: 'Er is een fout opgetreden bij het selecteren van een bijlage. Probeer het opnieuw.',
        errorWhileSelectingCorruptedAttachment: 'Er is een fout opgetreden bij het selecteren van een beschadigde bijlage. Probeer een ander bestand.',
        takePhoto: 'Foto maken',
        chooseFromGallery: 'Kies uit galerij',
        chooseDocument: 'Bestand kiezen',
        attachmentTooLarge: 'Bijlage is te groot',
        sizeExceeded: 'Bijlagegrootte is groter dan de limiet van 24 MB',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `De bijlage is groter dan de limiet van ${maxUploadSizeInMB} MB`,
        attachmentTooSmall: 'Bijlage is te klein',
        sizeNotMet: 'Bijlagegrootte moet groter zijn dan 240 bytes',
        wrongFileType: 'Ongeldig bestandstype',
        notAllowedExtension: 'Dit bestandstype is niet toegestaan. Probeer een ander bestandstype.',
        folderNotAllowedMessage: 'Het uploaden van een map is niet toegestaan. Probeer een ander bestand.',
        protectedPDFNotSupported: 'Met wachtwoord beveiligde PDF wordt niet ondersteund',
        attachmentImageResized: 'Deze afbeelding is verkleind voor voorbeeldweergave. Download om de volledige resolutie te zien.',
        attachmentImageTooLarge: 'Deze afbeelding is te groot om een voorbeeld te tonen voordat je deze uploadt.',
        tooManyFiles: (fileLimit: number) => `Je kunt maximaal ${fileLimit} bestanden tegelijk uploaden.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Bestanden zijn groter dan ${maxUploadSizeInMB} MB. Probeer het opnieuw.`,
        someFilesCantBeUploaded: 'Sommige bestanden kunnen niet worden geüpload',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Bestanden moeten kleiner zijn dan ${maxUploadSizeInMB} MB. Grotere bestanden worden niet geüpload.`,
        maxFileLimitExceeded: 'Je kunt maximaal 30 bonnetjes tegelijk uploaden. Eventuele extra’s worden niet geüpload.',
        unsupportedFileType: (fileType: string) => `${fileType}-bestanden worden niet ondersteund. Alleen ondersteunde bestandstypen worden geüpload.`,
        learnMoreAboutSupportedFiles: 'Meer informatie over ondersteunde indelingen.',
        passwordProtected: 'Met wachtwoord beveiligde pdf’s worden niet ondersteund. Alleen ondersteunde bestanden worden geüpload.',
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
        commentExceededMaxLength: (formattedMaxLength: string) => `De maximale lengte van opmerkingen is ${formattedMaxLength} tekens.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `De maximale lengte van de taaknaam is ${formattedMaxLength} tekens.`,
    },
    baseUpdateAppModal: {
        updateApp: 'App bijwerken',
        updatePrompt: 'Er is een nieuwe versie van deze app beschikbaar.\nWerk nu bij of start de app later opnieuw om de nieuwste wijzigingen te downloaden.',
    },
    deeplinkWrapper: {
        launching: 'Expensify starten',
        expired: 'Je sessie is verlopen.',
        signIn: 'Meld u opnieuw aan.',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: 'Biometrische test',
            authenticationSuccessful: 'Authenticatie geslaagd',
            successfullyAuthenticatedUsing: ({authType}) => `Je hebt je succesvol geverifieerd met ${authType}.`,
            troubleshootBiometricsStatus: ({registered}) => `Biometrie (${registered ? 'Geregistreerd' : 'Niet geregistreerd'})`,
            yourAttemptWasUnsuccessful: 'Je authenticatiepoging is mislukt.',
            youCouldNotBeAuthenticated: 'U kon niet worden geauthenticeerd',
            areYouSureToReject: 'Weet je het zeker? De authenticatiepoging wordt afgewezen als je dit scherm sluit.',
            rejectAuthentication: 'Authenticatie afwijzen',
            test: 'Test',
            biometricsAuthentication: 'Biometrische authenticatie',
        },
        pleaseEnableInSystemSettings: {
            start: 'Schakel gezichts-/vingerafdrukverificatie in of stel een apparaat-toegangscode in via je ',
            link: 'systeeminstellingen',
            end: '.',
        },
        oops: 'Oeps, er ging iets mis',
        looksLikeYouRanOutOfTime: 'Het lijkt erop dat je tijd op is! Probeer het opnieuw bij de handelaar.',
        youRanOutOfTime: 'De tijd is op',
        letsVerifyItsYou: 'Laten we verifiëren dat jij het bent',
        verifyYourself: {
            biometrics: 'Verifieer jezelf met je gezicht of vingerafdruk',
        },
        enableQuickVerification: {
            biometrics: 'Schakel snelle, veilige verificatie in met je gezicht of vingerafdruk. Geen wachtwoorden of codes nodig.',
        },
        revoke: {
            title: 'Gezicht/vingerafdruk en passkeys',
            explanation:
                'Gezichts-/vingerafdruk- of passkeys-verificatie is ingeschakeld op een of meer apparaten. Het intrekken van toegang vereist een magische code voor de volgende verificatie op elk apparaat.',
            confirmationPrompt: 'Weet je het zeker? Je hebt een geheime code nodig voor de volgende verificatie op elk apparaat.',
            cta: 'Toegang intrekken',
            noDevices: 'Je hebt geen apparaten geregistreerd voor gezichts-/vingerafdruk- of passkey-verificatie. Als je er een registreert, kun je die toegang hier intrekken.',
            dismiss: 'Begrepen',
            error: 'Aanvraag mislukt. Probeer het later opnieuw.',
            remove: 'Verwijderen',
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
            Voer de code in op het apparaat
            waarop deze oorspronkelijk is aangevraagd
        `),
        doNotShare: dedent(`
            Deel je code met niemand.
            Expensify zal er nooit om vragen!
        `),
        or: ', of',
        signInHere: 'log hier gewoon in',
        expiredCodeTitle: 'Magische code verlopen',
        expiredCodeDescription: 'Ga terug naar het oorspronkelijke apparaat en vraag een nieuwe code aan',
        successfulNewCodeRequest: 'Code aangevraagd. Controleer je apparaat.',
        tfaRequiredTitle: dedent(`
            Verificatie in twee stappen
            vereist
        `),
        tfaRequiredDescription: dedent(`
            Voer de tweefactorauthenticatiecode in
            op de plaats waar u probeert in te loggen.
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
        description: 'Uw bedrijf heeft een aangepaste goedkeuringsworkflow in deze werkruimte. Voer deze actie uit in Expensify Classic',
        goToExpensifyClassic: 'Overschakelen naar Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Dien een declaratie in, verwijs je team door',
            subtitleText: 'Wil je dat je team Expensify ook gebruikt? Dien gewoon een uitgave bij hen in en wij zorgen voor de rest.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Een gesprek inplannen',
    },
    hello: 'Hallo',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Begin hieronder.',
        anotherLoginPageIsOpen: 'Er is al een andere inlogpagina geopend.',
        anotherLoginPageIsOpenExplanation: 'U hebt de inlogpagina in een apart tabblad geopend. Log alstublieft in vanaf dat tabblad.',
        welcome: 'Welkom!',
        welcomeWithoutExclamation: 'Welkom',
        phrase2: 'Geld spreekt. En nu chat en betalingen op één plek staan, is het ook eenvoudig.',
        phrase3: 'Je ontvang je betalingen net zo snel als je je punt kunt overbrengen.',
        enterPassword: 'Voer uw wachtwoord in',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, het is altijd leuk om een nieuw gezicht hier te zien!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Voer de magische code in die naar ${login} is verzonden. Deze zou binnen één à twee minuten moeten aankomen.`,
    },
    login: {
        hero: {
            header: 'Reizen en uitgaven, op de snelheid van chat',
            body: 'Welkom bij de volgende generatie van Expensify, waar je reizen en uitgaven sneller verlopen met behulp van contextuele chat in realtime.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Doorgaan met inloggen met single sign-on:',
        orContinueWithMagicCode: 'Je kunt je ook aanmelden met een magische code',
        useSingleSignOn: 'Eenmalige aanmelding gebruiken',
        useMagicCode: 'Magische code gebruiken',
        launching: 'Bezig met starten...',
        oneMoment: 'Een ogenblik geduld terwijl we u doorverwijzen naar het single sign-on-portaal van uw bedrijf.',
    },
    reportActionCompose: {
        dropToUpload: 'Loslaten om te uploaden',
        sendAttachment: 'Bijlage verzenden',
        addAttachment: 'Bijlage toevoegen',
        writeSomething: 'Iets schrijven...',
        blockedFromConcierge: 'Communicatie is geblokkeerd',
        fileUploadFailed: 'Upload mislukt. Bestand wordt niet ondersteund.',
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
        editAction: ({action}: EditActionParams) => `Bewerk ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'uitgave' : 'Opmerking'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'Opmerking';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `${type} verwijderen`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'Opmerking';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Weet je zeker dat je dit ${type} wilt verwijderen?`;
        },
        onlyVisible: 'Alleen zichtbaar voor',
        explain: 'Uitleggen',
        explainMessage: 'Leg dit alstublieft aan mij uit.',
        replyInThread: 'Antwoord in thread',
        joinThread: 'Deelnemen aan thread',
        leaveThread: 'Thread verlaten',
        copyOnyxData: 'Kopieer Onyx-gegevens',
        flagAsOffensive: 'Markeren als aanstootgevend',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Reactie toevoegen',
        reactedWith: 'reageerde met',
    },
    reportActionsView: {
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `Je hebt het feest gemist in <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, er is hier niets te zien.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `Deze chat is met alle Expensify-leden op het domein <strong>${domainRoom}</strong>. Gebruik hem om met collega’s te chatten, tips te delen en vragen te stellen.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Deze chat is met de <strong>${workspaceName}</strong>-beheerder. Gebruik hem om te chatten over de inrichting van de workspace en meer.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) => `Deze chat is met iedereen in <strong>${workspaceName}</strong>. Gebruik hem voor de belangrijkste aankondigingen.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Deze chatruimte is voor alles wat met <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> te maken heeft.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Deze chat is voor facturen tussen <strong>${invoicePayer}</strong> en <strong>${invoiceReceiver}</strong>. Gebruik de knop + om een factuur te versturen.`,
        beginningOfChatHistory: (users: string) => `Deze chat is met ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `Dit is waar <strong>${submitterDisplayName}</strong> declaraties zal indienen bij <strong>${workspaceName}</strong>. Gebruik gewoon de +‑knop.`,
        beginningOfChatHistorySelfDM: 'Dit is je persoonlijke ruimte. Gebruik het voor notities, taken, concepten en herinneringen.',
        beginningOfChatHistorySystemDM: 'Welkom! Laten we je instellen.',
        chatWithAccountManager: 'Chat hier met je accountmanager',
        askMeAnything: 'Vraag mij wat je maar wilt!',
        sayHello: 'Zeg hallo!',
        yourSpace: 'Je ruimte',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Welkom bij ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Gebruik de knop + om een uitgave te ${additionalText}.`,
        askConcierge: 'Stel vragen en krijg 24/7 realtime ondersteuning.',
        conciergeSupport: '24/7 ondersteuning',
        create: 'Maken',
        iouTypes: {
            pay: 'Betalen',
            split: 'Splitsen',
            submit: 'Verzenden',
            track: 'Bijhouden',
            invoice: 'factuur',
        },
    },
    adminOnlyCanPost: 'Alleen beheerders kunnen berichten sturen in deze ruimte.',
    reportAction: {
        asCopilot: 'als copiloot voor',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `heeft dit rapport aangemaakt om alle uitgaven van <a href="${reportUrl}">${reportName}</a> op te nemen die niet konden worden ingediend met de door jou gekozen frequentie`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `heeft dit rapport gemaakt voor uitgestelde uitgaven van <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Iedereen in dit gesprek op de hoogte stellen',
    },
    newMessages: 'Nieuwe berichten',
    latestMessages: 'Nieuwste berichten',
    youHaveBeenBanned: 'Opmerking: Je bent verbannen uit het chatten in dit kanaal.',
    reportTypingIndicator: {
        isTyping: 'is aan het typen...',
        areTyping: 'zijn aan het typen...',
        multipleMembers: 'Meerdere leden',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Deze chatruimte is gearchiveerd.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Deze chat is niet meer actief omdat ${displayName} hun account heeft gesloten.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Deze chat is niet langer actief omdat ${oldDisplayName} zijn account heeft samengevoegd met ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Deze chat is niet meer actief omdat <strong>je</strong> geen lid meer bent van de ${policyName}-werkruimte.`
                : `Deze chat is niet langer actief omdat ${displayName} geen lid meer is van de ${policyName}-werkruimte.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Deze chat is niet langer actief omdat ${policyName} geen actieve werkruimte meer is.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Deze chat is niet langer actief omdat ${policyName} geen actieve werkruimte meer is.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Deze boeking is gearchiveerd.',
    },
    writeCapabilityPage: {
        label: 'Wie kan posten',
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
        fabScanReceiptExplained: 'Bon scannen (Zwevende actie)',
        chatPinned: 'Chat vastgezet',
        draftedMessage: 'Conceptbericht',
        listOfChatMessages: 'Lijst met chatberichten',
        listOfChats: 'Lijst met chats',
        saveTheWorld: 'Red de wereld',
        tooltip: 'Begin hier!',
        redirectToExpensifyClassicModal: {
            title: 'Binnenkort beschikbaar',
            description: 'We zijn nog een paar onderdelen van New Expensify aan het verfijnen om het op jouw specifieke setup af te stemmen. Ga in de tussentijd naar Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Abonnement',
        domains: 'Domeinen',
    },
    tabSelector: {chat: 'Chat', room: 'Kamer', distance: 'Afstand', manual: 'Handmatig', scan: 'Scannen', map: 'Kaart', gps: 'GPS', odometer: 'Kilometerstand'},
    spreadsheet: {
        upload: 'Een spreadsheet uploaden',
        import: 'Spreadsheet importeren',
        dragAndDrop: '<muted-link>Sleep je spreadsheet hierheen, of kies hieronder een bestand. Ondersteunde indelingen: .csv, .txt, .xls en .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Sleep je spreadsheet hierheen, of kies hieronder een bestand. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Meer informatie</a> over ondersteunde bestandsindelingen.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Selecteer een spreadsheetbestand om te importeren. Ondersteunde indelingen: .csv, .txt, .xls en .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Selecteer een spreadsheetbestand om te importeren. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">Meer informatie</a> over ondersteunde bestandsindelingen.</muted-link>`,
        fileContainsHeader: 'Bestand bevat kolomkoppen',
        column: (name: string) => `Kolom ${name}`,
        fieldNotMapped: (fieldName: string) => `Oeps! Een verplicht veld ("${fieldName}") is niet toegewezen. Controleer dit en probeer het opnieuw.`,
        singleFieldMultipleColumns: (fieldName: string) => `Oeps! Je hebt één veld ("${fieldName}") aan meerdere kolommen gekoppeld. Controleer dit en probeer het opnieuw.`,
        emptyMappedField: (fieldName: string) => `Oeps! Het veld („${fieldName}”) bevat een of meer lege waarden. Controleer het en probeer het opnieuw.`,
        importSuccessfulTitle: 'Import succesvol',
        importCategoriesSuccessfulDescription: ({categories}: {categories: number}) => (categories > 1 ? `Er zijn ${categories} categorieën toegevoegd.` : '1 categorie is toegevoegd.'),
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
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `Er zijn ${tags} tags toegevoegd.` : '1 tag is toegevoegd.'),
        importMultiLevelTagsSuccessfulDescription: 'Tags op meerdere niveaus zijn toegevoegd.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `${rates} dagvergoedingen zijn toegevoegd.` : '1 dagvergoedingstarief is toegevoegd.'),
        importFailedTitle: 'Import mislukt',
        importFailedDescription: 'Zorg ervoor dat alle velden correct zijn ingevuld en probeer het opnieuw. Als het probleem zich blijft voordoen, neem dan contact op met Concierge.',
        importDescription: 'Kies welke velden je wilt koppelen vanuit je spreadsheet door op de vervolgkeuzelijst naast elke geïmporteerde kolom hieronder te klikken.',
        sizeNotMet: 'Bestandsgrootte moet groter zijn dan 0 bytes',
        invalidFileMessage:
            'Het bestand dat je hebt geüpload is leeg of bevat ongeldige gegevens. Zorg ervoor dat het bestand correct is opgemaakt en de benodigde informatie bevat voordat je het opnieuw uploadt.',
        importSpreadsheetLibraryError: 'Laden van spreadsheetmodule mislukt. Controleer je internetverbinding en probeer het opnieuw.',
        importSpreadsheet: 'Spreadsheet importeren',
        downloadCSV: 'CSV downloaden',
        importMemberConfirmation: () => ({
            one: `Bevestig hieronder de gegevens voor een nieuw werkruimtelid dat als onderdeel van deze upload wordt toegevoegd. Bestaande leden ontvangen geen rolupdates of uitnodigingsberichten.`,
            other: (count: number) =>
                `Bevestig hieronder de details voor de ${count} nieuwe werkruimteleden die als onderdeel van deze upload zullen worden toegevoegd. Bestaande leden ontvangen geen rolupdates of uitnodigingsberichten.`,
        }),
        importTransactionsSuccessfulDescription: ({transactions}: {transactions: number}) =>
            transactions > 1 ? `${transactions} transacties zijn geïmporteerd.` : '1 transactie is geïmporteerd.',
    },
    receipt: {
        upload: 'Bon uploaden',
        uploadMultiple: 'Bonnen uploaden',
        desktopSubtitleSingle: `of sleep het hier neer`,
        desktopSubtitleMultiple: `of sleep ze hierheen door ze te slepen en neer te zetten`,
        alternativeMethodsTitle: 'Andere manieren om bonnen toe te voegen:',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) => `<label-text><a href="${downloadUrl}">Download de app</a> om te scannen vanaf je telefoon</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Stuur bonnen door naar <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Voeg je nummer toe</a> om bonnetjes te sms'en naar ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Stuur kassabonnen via sms naar ${phoneNumber} (alleen Amerikaanse nummers)</label-text>`,
        takePhoto: 'Maak een foto',
        cameraAccess: 'Cameratoegang is vereist om foto’s van bonnetjes te maken.',
        deniedCameraAccess: `Cameratoegang is nog steeds niet verleend, volg alsjeblieft <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">deze instructies</a>.`,
        cameraErrorTitle: 'Camerafout',
        cameraErrorMessage: 'Er is een fout opgetreden bij het maken van een foto. Probeer het opnieuw.',
        locationAccessTitle: 'Locatietoegang toestaan',
        locationAccessMessage: 'Locatietoegang helpt ons je tijdzone en valuta overal waar je gaat nauwkeurig te houden.',
        locationErrorTitle: 'Locatietoegang toestaan',
        locationErrorMessage: 'Locatietoegang helpt ons je tijdzone en valuta overal waar je gaat nauwkeurig te houden.',
        allowLocationFromSetting: `Locatietoegang helpt ons je tijdzone en valuta overal waar je gaat nauwkeurig te houden. Sta locatietoegang toe in de machtigingsinstellingen van je apparaat.`,
        dropTitle: 'Laat het los',
        dropMessage: 'Zet je bestand hier neer',
        flash: 'flits',
        multiScan: 'multiscan',
        shutter: 'sluiter',
        gallery: 'galerij',
        deleteReceipt: 'Bon verwijderen',
        deleteConfirmation: 'Weet je zeker dat je deze bon wilt verwijderen?',
        addReceipt: 'Bon toevoegen',
        scanFailed: 'De bon kon niet worden gescand, omdat er een handelaar, datum of bedrag ontbreekt.',
        addAReceipt: {
            phrase1: 'Bon toevoegen',
            phrase2: 'of sleep hem hierheen',
        },
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
        header: 'Snelactie',
        noLongerHaveReportAccess: 'Je hebt geen toegang meer tot je vorige snelactie­bestemming. Kies hieronder een nieuwe.',
        updateDestination: 'Bestemming bijwerken',
        createReport: 'Rapport maken',
    },
    iou: {
        amount: 'Bedrag',
        percent: 'Procent',
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
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} van ${merchant}`,
        splitByPercentage: 'Splitsen op percentage',
        addSplit: 'Splits toevoegen',
        makeSplitsEven: 'Verdeel bedragen gelijk',
        editSplits: 'Splits bewerken',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Totaalbedrag is ${amount} hoger dan de oorspronkelijke uitgave.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Totaalbedrag is ${amount} lager dan de oorspronkelijke uitgave.`,
        splitExpenseZeroAmount: 'Voer een geldig bedrag in voordat u verdergaat.',
        splitExpenseOneMoreSplit: 'Geen splits toegevoegd. Voeg er minstens één toe om op te slaan.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `${amount} bewerken voor ${merchant}`,
        removeSplit: 'Splitsing verwijderen',
        splitExpenseCannotBeEditedModalTitle: 'Deze uitgave kan niet worden bewerkt',
        splitExpenseCannotBeEditedModalDescription: 'Goedgekeurde of betaalde uitgaven kunnen niet worden bewerkt',
        splitExpenseDistanceErrorModalDescription: 'Los de fout in het afstandstarief op en probeer het opnieuw.',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Betaal ${name ?? 'iemand'}`,
        expense: 'Uitgave',
        categorize: 'Categoriseren',
        share: 'Delen',
        participants: 'Deelnemers',
        createExpense: 'Uitgave aanmaken',
        trackDistance: 'Afstand bijhouden',
        createExpenses: (expensesNumber: number) => `Maak ${expensesNumber} onkosten`,
        removeExpense: 'Uitgave verwijderen',
        removeThisExpense: 'Deze uitgave verwijderen',
        removeExpenseConfirmation: 'Weet je zeker dat je deze bon wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
        addExpense: 'Uitgave toevoegen',
        chooseRecipient: 'Ontvanger kiezen',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Maak ${amount} uitgave`,
        confirmDetails: 'Bevestig details',
        pay: 'Betalen',
        cancelPayment: 'Betaling annuleren',
        cancelPaymentConfirmation: 'Weet je zeker dat je deze betaling wilt annuleren?',
        viewDetails: 'Details bekijken',
        pending: 'In behandeling',
        canceled: 'Geannuleerd',
        posted: 'Geplaatst',
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
            return `heeft dit <a href="${movedReportUrl}">rapport</a> verplaatst naar de <a href="${newParentReportUrl}">${toPolicyName}</a>-werkruimte`;
        },
        pendingMatchWithCreditCard: 'Bon wordt gekoppeld aan kaarttransactie',
        pendingMatch: 'Openstaande match',
        pendingMatchWithCreditCardDescription: 'Bon wordt nog gekoppeld aan kaarttransactie. Markeer als contant om te annuleren.',
        markAsCash: 'Markeren als contant',
        routePending: 'Route in behandeling...',
        receiptScanning: () => ({
            one: 'Bon scannen...',
            other: 'Bonnetjes scannen...',
        }),
        scanMultipleReceipts: 'Meerdere bonnetjes scannen',
        scanMultipleReceiptsDescription: "Maak in één keer foto's van al je bonnetjes, bevestig daarna zelf de details of laat ons het voor je doen.",
        receiptScanInProgress: 'Bon scannen wordt uitgevoerd',
        receiptScanInProgressDescription: 'Bon scannen bezig. Kom later terug of voer de gegevens nu in.',
        removeFromReport: 'Van rapport verwijderen',
        moveToPersonalSpace: 'Verplaats onkosten naar je persoonlijke ruimte',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Mogelijke dubbele uitgaven geïdentificeerd. Controleer de dubbelen om indienen mogelijk te maken.'
                : 'Mogelijke dubbele uitgaven gedetecteerd. Controleer de dubbelen om goedkeuring mogelijk te maken.',
        receiptIssuesFound: () => ({
            one: 'Probleem gevonden',
            other: 'Gevonden problemen',
        }),
        fieldPending: 'In behandeling...',
        defaultRate: 'Standaardtarief',
        receiptMissingDetails: 'Bon ontbreekt details',
        missingAmount: 'Ontbrekend bedrag',
        missingMerchant: 'Ontbrekende handelaar',
        receiptStatusTitle: 'Scannen…',
        receiptStatusText: 'Alleen jij kunt deze bon zien terwijl hij wordt gescand. Kom later terug of voer nu de gegevens in.',
        receiptScanningFailed: 'Scannen van bon is mislukt. Voer de gegevens handmatig in.',
        transactionPendingDescription: 'Transactie in behandeling. Het kan enkele dagen duren voordat deze wordt geboekt.',
        companyInfo: 'Bedrijfsgegevens',
        companyInfoDescription: 'We hebben nog een paar gegevens nodig voordat je je eerste factuur kunt verzenden.',
        yourCompanyName: 'De naam van uw bedrijf',
        yourCompanyWebsite: 'De website van uw bedrijf',
        yourCompanyWebsiteNote: 'Als u geen website hebt, kunt u in plaats daarvan het LinkedIn- of socialmediaprofiel van uw bedrijf opgeven.',
        invalidDomainError: 'Je hebt een ongeldig domein ingevoerd. Voer een geldig domein in om door te gaan.',
        publicDomainError: 'Je hebt een publiek domein ingevoerd. Voer een privédomein in om door te gaan.',
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
        individual: 'Individueel',
        business: 'Zakelijk',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} betalen met Expensify` : `Betalen met Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} als individu betalen` : `Betalen met persoonlijke rekening`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} betalen met wallet` : `Betalen met wallet`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Betaal ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Betaal ${formattedAmount} als bedrijf` : `Betalen met zakelijke rekening`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Markeer ${formattedAmount} als betaald` : `Markeren als betaald`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `${amount} betaald met privérekening ${last4Digits}` : `Betaald met privérekening`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `heeft ${amount} betaald met zakelijke rekening ${last4Digits}` : `Betaald met zakelijke rekening`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Betaal ${formattedAmount} via ${policyName}` : `Betalen via ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `${amount} betaald met bankrekening ${last4Digits}` : `betaald met bankrekening ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `betaald ${amount ? `${amount} ` : ''}met bankrekening ${last4Digits} via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimteregels</a>`,
        invoicePersonalBank: (lastFour: string) => `Persoonlijke rekening • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Zakelijke rekening • ${lastFour}`,
        nextStep: 'Volgende stappen',
        finished: 'Voltooid',
        flip: 'Omdraaien',
        sendInvoice: ({amount}: RequestAmountParams) => `${amount} factuur verzenden`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `voor ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `ingediend${memo ? `, met de melding ${memo}` : ''}`,
        automaticallySubmitted: `ingediend via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">indiening uitstellen</a>`,
        queuedToSubmitViaDEW: 'in wachtrij geplaatst om in te dienen via aangepaste goedkeuringswerkstroom',
        queuedToApproveViaDEW: 'in wachtrij geplaatst om goed te keuren via aangepaste goedkeuringswerkstroom',
        trackedAmount: (formattedAmount: string, comment?: string) => `bijhouden ${formattedAmount}${comment ? `voor ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `${amount} splits`,
        didSplitAmount: (formattedAmount: string, comment: string) => `splitsen ${formattedAmount}${comment ? `voor ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Jouw deel ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} is ${amount}${comment ? `voor ${comment}` : ''} verschuldigd`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} is verschuldigd:`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}betaalde ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} heeft betaald:`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} gaf ${amount} uit`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} gaf uit:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} heeft goedgekeurd:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} heeft ${amount} goedgekeurd`,
        payerSettled: (amount: number | string) => `betaald ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `${amount} betaald. Voeg een bankrekening toe om je betaling te ontvangen.`,
        automaticallyApproved: `goedgekeurd via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimteregels</a>`,
        approvedAmount: (amount: number | string) => `goedgekeurd ${amount}`,
        approvedMessage: `Goedgekeurd`,
        unapproved: `niet goedgekeurd`,
        automaticallyForwarded: `goedgekeurd via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimteregels</a>`,
        forwarded: `Goedgekeurd`,
        rejectedThisReport: 'heeft dit rapport afgewezen',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `heeft de betaling gestart, maar wacht tot ${submitterDisplayName} een bankrekening toevoegt.`,
        adminCanceledRequest: 'heeft de betaling geannuleerd',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `heeft de betaling van ${amount} geannuleerd, omdat ${submitterDisplayName} hun Expensify Wallet niet binnen 30 dagen heeft ingeschakeld`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} heeft een bankrekening toegevoegd. De betaling van ${amount} is gedaan.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}gemarkeerd als betaald${comment ? `, met de opmerking "${comment}"` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}betaald met wallet`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}betaald met Expensify via <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">werkruimte­regels</a>`,
        noReimbursableExpenses: 'Dit rapport heeft een ongeldig bedrag',
        pendingConversionMessage: 'Totaal wordt bijgewerkt zodra je weer online bent',
        changedTheExpense: 'heeft de uitgave gewijzigd',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `de ${valueName} naar ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `stel ${translatedChangedField} in op ${newMerchant}, waardoor het bedrag is ingesteld op ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `de ${valueName} (voorheen ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `de ${valueName} naar ${newValueToDisplay} (voorheen ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `heeft ${translatedChangedField} gewijzigd naar ${newMerchant} (voorheen ${oldMerchant}), waardoor het bedrag is bijgewerkt naar ${newAmountToDisplay} (voorheen ${oldAmountToDisplay})`,
        basedOnAI: 'op basis van eerdere activiteit',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `op basis van <a href="${rulesLink}">werkruimte-regels</a>` : 'op basis van werkruimte-regel'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `voor ${comment}` : 'uitgave'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Factuurrapport nr. ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} verzonden${comment ? `voor ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `heeft uitgave verplaatst van persoonlijke ruimte naar ${workspaceName ?? `chat met ${reportName}`}`,
        movedToPersonalSpace: 'uitgave verplaatst naar persoonlijke ruimte',
        error: {
            invalidCategoryLength: 'De categorienaam bevat meer dan 255 tekens. Verkort deze of kies een andere categorie.',
            invalidTagLength: 'De namen van tags mogen niet langer zijn dan 255 tekens. Verkort de tagnaam of kies een andere tag.',
            invalidAmount: 'Voer een geldig bedrag in voordat u doorgaat',
            invalidDistance: 'Voer een geldige afstand in voordat u verdergaat',
            invalidIntegerAmount: 'Voer een volledig dollarbedrag in voordat u doorgaat',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Maximale belastingbedrag is ${amount}`,
            invalidSplit: 'De som van de splitsingen moet gelijk zijn aan het totale bedrag',
            invalidSplitParticipants: 'Voer een bedrag groter dan nul in voor minstens twee deelnemers',
            invalidSplitYourself: 'Voer een bedrag groter dan nul in voor je splitsing',
            noParticipantSelected: 'Selecteer een deelnemer',
            other: 'Onverwachte fout. Probeer het later opnieuw.',
            genericCreateFailureMessage: 'Onverwachte fout bij het indienen van deze uitgave. Probeer het later opnieuw.',
            genericCreateInvoiceFailureMessage: 'Onverwachte fout bij het verzenden van deze factuur. Probeer het later opnieuw.',
            genericHoldExpenseFailureMessage: 'Onverwachte fout bij het vasthouden van deze uitgave. Probeer het later opnieuw.',
            genericUnholdExpenseFailureMessage: 'Onverwachte fout bij het vrijgeven van deze uitgave. Probeer het later opnieuw.',
            receiptDeleteFailureError: 'Onverwachte fout bij het verwijderen van deze bon. Probeer het later opnieuw.',
            receiptFailureMessage: '<rbr>Er is een fout opgetreden bij het uploaden van je bon. <a href="download">Sla de bon op</a> en <a href="retry">probeer het later opnieuw</a>.</rbr>',
            receiptFailureMessageShort: 'Er is een fout opgetreden bij het uploaden van je bon.',
            genericDeleteFailureMessage: 'Onverwachte fout bij het verwijderen van deze uitgave. Probeer het later opnieuw.',
            genericEditFailureMessage: 'Onverwachte fout bij het bewerken van deze uitgave. Probeer het later opnieuw.',
            genericSmartscanFailureMessage: 'Transactie mist velden',
            duplicateWaypointsErrorMessage: 'Verwijder dubbele tussenpunten alstublieft',
            atLeastTwoDifferentWaypoints: 'Voer ten minste twee verschillende adressen in',
            splitExpenseMultipleParticipantsErrorMessage: 'Een uitgave kan niet worden gesplitst tussen een werkruimte en andere leden. Werk uw selectie alstublieft bij.',
            invalidMerchant: 'Voer een geldige verkoper in',
            atLeastOneAttendee: 'Er moet minstens één deelnemer worden geselecteerd',
            invalidQuantity: 'Voer een geldige hoeveelheid in',
            quantityGreaterThanZero: 'Hoeveelheid moet groter zijn dan nul',
            invalidSubrateLength: 'Er moet ten minste één subtarief zijn',
            invalidRate: 'Tarief is niet geldig voor deze workspace. Selecteer een beschikbaar tarief uit de workspace.',
            endDateBeforeStartDate: 'De einddatum kan niet vóór de startdatum liggen',
            endDateSameAsStartDate: 'De einddatum mag niet hetzelfde zijn als de startdatum',
            manySplitsProvided: `Het maximum aantal toegestane splits is ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `Het datumbereik mag niet meer dan ${CONST.IOU.SPLITS_LIMIT} dagen zijn.`,
            negativeDistanceNotAllowed: 'Eindstand moet groter zijn dan beginstand',
            invalidReadings: 'Voer zowel de begin- als eindstanden in',
        },
        dismissReceiptError: 'Foutmelding sluiten',
        dismissReceiptErrorConfirmation: 'Let op! Als je deze foutmelding negeert, wordt je geüploade bon volledig verwijderd. Weet je het zeker?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `is begonnen met afrekenen. De betaling wordt vastgehouden totdat ${submitterDisplayName} zijn/haar wallet inschakelt.`,
        enableWallet: 'Wallet inschakelen',
        hold: 'Wachten',
        unhold: 'Blokkering opheffen',
        holdExpense: () => ({
            one: 'Uitgave tegenhouden',
            other: 'Onkosten vasthouden',
        }),
        unholdExpense: 'Uitgave vrijgeven',
        heldExpense: 'heeft deze uitgave tegengehouden',
        unheldExpense: 'deblokkeer deze uitgave',
        moveUnreportedExpense: 'Niet-gerapporteerde uitgave verplaatsen',
        addUnreportedExpense: 'Niet-gerapporteerde uitgave toevoegen',
        selectUnreportedExpense: 'Selecteer minimaal één uitgave om aan het rapport toe te voegen.',
        emptyStateUnreportedExpenseTitle: 'Geen ongerapporteerde uitgaven',
        emptyStateUnreportedExpenseSubtitle: 'Het lijkt erop dat je geen niet-gerapporteerde uitgaven hebt. Probeer er hieronder een aan te maken.',
        addUnreportedExpenseConfirm: 'Aan rapport toevoegen',
        newReport: 'Nieuw rapport',
        explainHold: () => ({
            one: 'Leg uit waarom je deze uitgave tegenhoudt.',
            other: 'Leg uit waarom je deze uitgaven vasthoudt.',
        }),
        retracted: 'ingetrokken',
        retract: 'Intrekken',
        reopened: 'Opnieuw geopend',
        reopenReport: 'Rapport heropenen',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Dit rapport is al geëxporteerd naar ${connectionName}. Het wijzigen kan tot gegevensverschillen leiden. Weet je zeker dat je dit rapport opnieuw wilt openen?`,
        reason: 'Reden',
        holdReasonRequired: 'Een reden is vereist bij het vasthouden.',
        expenseWasPutOnHold: 'Declaratie is in de wacht gezet',
        expenseOnHold: 'Deze uitgave is in de wacht gezet. Bekijk de opmerkingen voor de volgende stappen.',
        expensesOnHold: 'Alle onkostendeclaraties zijn gepauzeerd. Bekijk de opmerkingen voor de volgende stappen.',
        expenseDuplicate: 'Deze uitgave heeft vergelijkbare details als een andere. Controleer de duplicaten om door te gaan.',
        someDuplicatesArePaid: 'Sommige van deze duplicaten zijn al goedgekeurd of betaald.',
        reviewDuplicates: 'Duplicaten beoordelen',
        keepAll: 'Alles behouden',
        confirmApprove: 'Bevestig goedkeuringsbedrag',
        confirmApprovalAmount: 'Keur alleen conforme onkosten goed, of keur het hele rapport goed.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Deze uitgave staat in de wacht. Wil je toch goedkeuren?',
            other: 'Deze onkosten staan in de wacht. Wil je ze toch goedkeuren?',
        }),
        confirmPay: 'Bevestig betalingsbedrag',
        confirmPayAmount: 'Betaal wat niet in de wacht staat, of betaal het volledige rapport.',
        confirmPayAllHoldAmount: () => ({
            one: 'Deze onkost is in de wacht gezet. Wil je toch betalen?',
            other: 'Deze declaraties staan in de wacht. Wil je toch betalen?',
        }),
        payOnly: 'Alleen betalen',
        approveOnly: 'Alleen goedkeuren',
        holdEducationalTitle: 'Moet je deze uitgave tegenhouden?',
        whatIsHoldExplain: '‘On hold’ is alsof je een uitgave op pauze zet totdat je klaar bent om deze in te dienen.',
        holdIsLeftBehind: 'Vastgehouden uitgaven blijven achter, zelfs als je een volledig rapport indient.',
        unholdWhenReady: 'Haal de blokkering van onkosten af zodra je klaar bent om ze in te dienen.',
        changePolicyEducational: {
            title: 'Je hebt dit rapport verplaatst!',
            description: 'Controleer deze items zorgvuldig, want ze veranderen vaak wanneer rapporten naar een nieuwe werkruimte worden verplaatst.',
            reCategorize: '<strong>Categoriseer eventuele uitgaven opnieuw</strong> om te voldoen aan de werkruimteregels.',
            workflows: 'Dit rapport kan nu onderworpen zijn aan een andere <strong>goedkeuringsworkflow.</strong>',
        },
        changeWorkspace: 'Werkruimte wijzigen',
        set: 'instellen',
        changed: 'Gewijzigd',
        removed: 'Verwijderd',
        transactionPending: 'Transactie in behandeling.',
        chooseARate: 'Selecteer een workspace-vergoedingsbedrag per mijl of kilometer',
        unapprove: 'Goedkeuring intrekken',
        unapproveReport: 'Goedkeuring van rapport intrekken',
        headsUp: 'Let op!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Dit rapport is al geëxporteerd naar ${accountingIntegration}. Het wijzigen ervan kan tot gegevensverschillen leiden. Weet je zeker dat je de goedkeuring van dit rapport wilt intrekken?`,
        reimbursable: 'vergoedbaar',
        nonReimbursable: 'niet-vergoedbaar',
        bookingPending: 'Deze boeking is in behandeling',
        bookingPendingDescription: 'Deze boeking is in behandeling omdat ze nog niet is betaald.',
        bookingArchived: 'Deze boeking is gearchiveerd',
        bookingArchivedDescription: 'Deze boeking is gearchiveerd omdat de reisdatum is verstreken. Voeg indien nodig een uitgave toe voor het uiteindelijke bedrag.',
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
            one: `Reis: 1 volledige dag`,
            other: (count: number) => `Reis: ${count} volledige dagen`,
        }),
        dates: 'Datums',
        rates: 'Tarieven',
        submitsTo: ({name}: SubmitsToParams) => `Dient in bij ${name}`,
        reject: {
            educationalTitle: 'Moet je vasthouden of afwijzen?',
            educationalText: 'Als je nog niet klaar bent om een uitgave goed te keuren of te betalen, kun je deze in de wacht zetten of afwijzen.',
            holdExpenseTitle: 'Een uitgave aanhouden om vóór goedkeuring of betaling om meer details te vragen.',
            approveExpenseTitle: 'Keur andere declaraties goed terwijl ingehouden declaraties aan jou toegewezen blijven.',
            heldExpenseLeftBehindTitle: 'Vastgehouden uitgaven blijven achter wanneer je een volledig rapport goedkeurt.',
            rejectExpenseTitle: 'Wijs een declaratie af die je niet van plan bent goed te keuren of te betalen.',
            reasonPageTitle: 'Declaratie afwijzen',
            reasonPageDescription: 'Leg uit waarom je deze uitgave afwijst.',
            rejectReason: 'Reden van afwijzing',
            markAsResolved: 'Markeren als opgelost',
            rejectedStatus: 'Deze onkostendeclaratie is afgewezen. We wachten tot jij de problemen oplost en deze als opgelost markeert om indienen mogelijk te maken.',
            reportActions: {
                rejectedExpense: 'heeft deze uitgave afgewezen',
                markedAsResolved: 'heeft de reden van afwijzing als opgelost gemarkeerd',
            },
        },
        moveExpenses: () => ({one: 'Onkosten verplaatsen', other: 'Onkosten verplaatsen'}),
        moveExpensesError: 'U kunt geen dagvergoedingskosten verplaatsen naar rapporten op andere werkruimtes, omdat de dagvergoedingstarieven tussen werkruimtes kunnen verschillen.',
        changeApprover: {
            title: 'Fiatteur wijzigen',
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Kies een optie om de goedkeurder voor dit rapport te wijzigen. (Werk uw <a href="${workflowSettingLink}">werkruimte-instellingen</a> bij om dit permanent voor alle rapporten te wijzigen.)`,
            changedApproverMessage: (managerID: number) => `heeft de goedkeurder gewijzigd naar <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Goedkeurder toevoegen',
                addApproverSubtitle: 'Voeg een extra fiatteur toe aan de bestaande workflow.',
                bypassApprovers: 'Goedkeurders omzeilen',
                bypassApproversSubtitle: 'Wijs jezelf aan als laatste goedkeurder en sla alle resterende goedkeurders over.',
            },
            addApprover: {
                subtitle: 'Kies een extra fiatteur voor dit rapport voordat we het door de rest van de goedkeuringsworkflow sturen.',
            },
        },
        chooseWorkspace: 'Kies een workspace',
        date: 'Datum',
        splitDates: 'Datums splitsen',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `${startDate} tot ${endDate} (${count} dagen)`,
        splitByDate: 'Splitsen op datum',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `rapport doorgestuurd naar ${to} vanwege aangepaste goedkeuringsworkflow`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'uur' : 'uren'} @ ${rate} / uur`,
            hrs: 'uur',
            hours: 'Uren',
            ratePreview: (rate: string) => `${rate} / uur`,
            amountTooLargeError: 'Het totale bedrag is te hoog. Verlaag het aantal uren of verlaag het tarief.',
        },
        correctDistanceRateError: 'Los het foutieve kilometertarief op en probeer het opnieuw.',
        AskToExplain: `. <a href="${CONST.CONCIERGE_EXPLAIN_LINK_PATH}"><strong>Uitleggen</strong></a> &#x2728;`,
        policyRulesModifiedFields: (policyRulesModifiedFields: PolicyRulesModifiedFields, policyRulesRoute: string, formatList: (list: string[]) => string) => {
            const entries = ObjectUtils.typedEntries(policyRulesModifiedFields);
            const fragments = entries.map(([key, value], i) => {
                const isFirst = i === 0;
                if (key === 'reimbursable') {
                    return value ? 'heeft de uitgave als „vergoedbaar” gemarkeerd' : 'markeerde de uitgave als ‘niet-terugbetaalbaar’';
                }
                if (key === 'billable') {
                    return value ? 'heeft de uitgave gemarkeerd als ‘factureerbaar’' : 'heeft de uitgave als ‘niet-declarabel’ gemarkeerd';
                }
                if (key === 'tax') {
                    const taxEntry = value as PolicyRulesModifiedFields['tax'];
                    const taxRateName = taxEntry?.field_id_TAX.name ?? '';
                    if (isFirst) {
                        return `stel het belastingtarief in op "${taxRateName}"`;
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
            header: 'Boekingen samenvoegen',
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
            pageTitle: 'Selecteer de gegevens die je wilt behouden:',
            noDifferences: 'Geen verschillen gevonden tussen de transacties',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? 'een' : 'een';
                return `Selecteer ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Selecteer aanwezigen',
            selectAllDetailsError: 'Selecteer alle details voordat je verdergaat.',
        },
        confirmationPage: {
            header: 'Bevestig details',
            pageTitle: 'Bevestig de gegevens die je bewaart. De gegevens die je niet bewaart, worden verwijderd.',
            confirmButton: 'Boekingen samenvoegen',
        },
    },
    share: {
        shareToExpensify: 'Delen met Expensify',
        messageInputLabel: 'Bericht',
    },
    notificationPreferencesPage: {
        header: 'Meldingsvoorkeuren',
        label: 'Meld me over nieuwe berichten',
        notificationPreferences: {
            always: 'Onmiddellijk',
            daily: 'Dagelijks',
            mute: 'Dempen',
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: 'Verborgen',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Het nummer is nog niet gevalideerd. Klik op de knop om de bevestigingslink opnieuw via sms te versturen.',
        emailHasNotBeenValidated: 'Het e-mailadres is nog niet gevalideerd. Klik op de knop om de validatielink opnieuw te versturen via sms.',
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
        upload: 'Upload',
        uploadPhoto: 'Foto uploaden',
        selectAvatar: 'Avatar selecteren',
        choosePresetAvatar: 'Of kies een aangepast avatar',
    },
    modal: {
        backdropLabel: 'Modale achtergrond',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> uitgaven toevoegt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> onkosten toevoegt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder onkosten toevoegt.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In afwachting dat <strong>jij</strong> onkostendeclaraties indient.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> onkosten indient.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een admin de declaraties indient.`;
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
                        return `Wachten tot <strong>jouw</strong> onkosten automatisch worden ingediend${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot de onkosten van <strong>${actor}</strong> automatisch worden ingediend${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten totdat de uitgaven van een beheerder automatisch worden ingediend${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>jij</strong> de problemen oplost.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> de problemen oplost.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten op een beheerder om de problemen op te lossen.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In afwachting van <strong>jouw</strong> goedkeuring van uitgaven.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> de onkosten goedkeurt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten op goedkeuring van uitgaven door een beheerder.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `In afwachting dat <strong>je</strong> dit rapport exporteert.`;
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
                        return `Wacht tot <strong>jij</strong> de onkosten betaalt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> de onkosten betaalt.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten op een beheerder om onkosten te betalen.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `Wachten tot <strong>je</strong> klaar bent met het instellen van een zakelijke bankrekening.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `Wachten tot <strong>${actor}</strong> klaar is met het instellen van een zakelijke bankrekening.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `Wachten tot een beheerder het zakelijke bankrekeningprofiel heeft afgerond.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `voor ${eta}` : ` ${eta}`;
                }
                return `Wachten tot de betaling is voltooid${formattedETA}.`;
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `Oeps! Het lijkt erop dat je dit bij <strong>jezelf</strong> indient. Het goedkeuren van je eigen rapporten is <strong>verboden</strong> in je workspace. Dien dit rapport in bij iemand anders of neem contact op met je beheerder om de persoon te wijzigen bij wie je indient.`,
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
        selectYourPronouns: 'Selecteer uw voornaamwoorden',
        selfSelectYourPronoun: 'Selecteer uw voornaamwoord',
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
        subtitle: 'Schakel tweestapsverificatie in om je account veilig te houden.',
        goToSecurity: 'Ga terug naar de beveiligingspagina',
    },
    shareCodePage: {
        title: 'Uw code',
        subtitle: 'Nodig leden uit voor Expensify door je persoonlijke QR-code of verwijzingslink te delen.',
    },
    pronounsPage: {
        pronouns: 'Voornaamwoorden',
        isShownOnProfile: 'Je voornaamwoorden worden weergegeven op je profiel.',
        placeholderText: 'Zoeken om opties te bekijken',
    },
    contacts: {
        contactMethods: 'Contactmethoden',
        featureRequiresValidate: 'Voor deze functie moet je je account verifiëren.',
        validateAccount: 'Valideer je account',
        helpText: ({email}: {email: string}) =>
            `Voeg meer manieren toe om in te loggen en bonnen naar Expensify te sturen.<br/><br/>Voeg een e-mailadres toe om bonnen door te sturen naar <a href="mailto:${email}">${email}</a> of voeg een telefoonnummer toe om bonnen te sms’en naar 47777 (alleen Amerikaanse telefoonnummers).`,
        pleaseVerify: 'Verifieer deze contactmethode.',
        getInTouch: 'We gebruiken deze methode om contact met je op te nemen.',
        enterMagicCode: (contactMethod: string) => `Voer de magische code in die is verzonden naar ${contactMethod}. Deze zou binnen een of twee minuten moeten aankomen.`,
        setAsDefault: 'Instellen als standaard',
        yourDefaultContactMethod:
            'Dit is je huidige standaardcontactmethode. Voordat je deze kunt verwijderen, moet je een andere contactmethode kiezen en op “Als standaard instellen” klikken.',
        removeContactMethod: 'Contactmethode verwijderen',
        removeAreYouSure: 'Weet je zeker dat je deze contactmethode wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.',
        failedNewContact: 'Kan deze contactmethode niet toevoegen.',
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
        goBackContactMethods: 'Terug naar contactmethoden',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Hij / Hem / Zijn',
        heHimHisTheyThemTheirs: 'Hij / Hem / Zijn / Die / Hen / Hun',
        sheHerHers: 'Zij / Haar / Haar',
        sheHerHersTheyThemTheirs: 'Zij / Haar / Hare / Die / Hen / Hun',
        merMers: 'Zee / Zeeën',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Persoon',
        theyThemTheirs: 'Die / Hen / Henz',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Hen / Hun',
        xeXemXyr: 'Hen / Hen / Hun',
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
        getLocationAutomatically: 'Locatie automatisch bepalen',
    },
    updateRequiredView: {
        updateRequired: 'Update vereist',
        pleaseInstall: 'Werk bij naar de nieuwste versie van New Expensify',
        pleaseInstallExpensifyClassic: 'Installeer de nieuwste versie van Expensify',
        toGetLatestChanges: 'Voor mobiel: download en installeer de nieuwste versie. Voor web: ververs je browser.',
        newAppNotAvailable: 'De nieuwe Expensify-app is niet langer beschikbaar.',
    },
    initialSettingsPage: {
        about: 'Info',
        aboutPage: {
            description: 'De nieuwe Expensify-app is gebouwd door een community van open-sourcesontwikkelaars van over de hele wereld. Help ons de toekomst van Expensify te bouwen.',
            appDownloadLinks: 'Links om de app te downloaden',
            viewKeyboardShortcuts: 'Toetsenbord­shortcuts bekijken',
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
        },
        troubleshoot: {
            clearCacheAndRestart: 'Cache wissen en opnieuw starten',
            viewConsole: 'Debugconsole weergeven',
            debugConsole: 'Debugconsole',
            description:
                '<muted-text>Gebruik de onderstaande tools om problemen met de Expensify-ervaring op te lossen. Als je problemen ondervindt, <concierge-link>dien dan een bugrapport in</concierge-link>.</muted-text>',
            confirmResetDescription: 'Alle niet-verstuurde conceptberichten gaan verloren, maar de rest van je gegevens is veilig.',
            resetAndRefresh: 'Opnieuw instellen en vernieuwen',
            clientSideLogging: 'Client-side-logboek',
            noLogsToShare: 'Geen logs om te delen',
            useProfiling: 'Profilering gebruiken',
            profileTrace: 'Profieltracering',
            results: 'Resultaten',
            releaseOptions: 'Release-opties',
            testingPreferences: 'Testvoorkeuren',
            useStagingServer: 'Stagingserver gebruiken',
            forceOffline: 'Offline forceren',
            simulatePoorConnection: 'Simuleer slechte internetverbinding',
            simulateFailingNetworkRequests: 'Netwerkaanvragen simuleren die mislukken',
            authenticationStatus: 'Authenticatiestatus',
            deviceCredentials: 'Apparaataanmeldingsgegevens',
            invalidate: 'Ongeldig maken',
            destroy: 'Vernietigen',
            maskExportOnyxStateData: 'Fragiele ledendata maskeren bij het exporteren van de Onyx-status',
            exportOnyxState: 'Onyx-status exporteren',
            importOnyxState: 'Onyx-status importeren',
            testCrash: 'Testcrash',
            resetToOriginalState: 'Herstellen naar oorspronkelijke staat',
            usingImportedState: 'Je gebruikt geïmporteerde status. Druk hier om deze te wissen.',
            debugMode: 'Debugmodus',
            invalidFile: 'Ongeldig bestand',
            invalidFileDescription: 'Het bestand dat u probeert te importeren is ongeldig. Probeer het opnieuw.',
            invalidateWithDelay: 'Ongeldig maken met vertraging',
            recordTroubleshootData: 'Gegevens voor probleemoplossing vastleggen',
            softKillTheApp: 'De app zacht afsluiten',
            kill: 'Beëindigen',
            sentryDebug: 'Sentry-debug',
            sentryDebugDescription: 'Sentry-verzoeken naar console loggen',
            sentryHighlightedSpanOps: 'Geresalteerde spannamen',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaction.click, navigation, ui.load',
            leftHandNavCache: 'Cache van linkernavigatie',
            clearleftHandNavCache: 'Wissen',
        },
        debugConsole: {
            saveLog: 'Log opslaan',
            shareLog: 'Logboek delen',
            enterCommand: 'Voer opdracht in',
            execute: 'Uitvoeren',
            noLogsAvailable: 'Geen logboeken beschikbaar',
            logSizeTooLarge: ({size}: LogSizeParams) => `Loggrootte overschrijdt de limiet van ${size} MB. Gebruik "Log opslaan" om het logbestand te downloaden.`,
            logs: 'Logboeken',
            viewConsole: 'Console bekijken',
        },
        security: 'Beveiliging',
        signOut: 'Afmelden',
        restoreStashed: 'Opgeslagen login herstellen',
        signOutConfirmationText: 'Je verliest alle offline aangebrachte wijzigingen als je je afmeldt.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Lees de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Servicevoorwaarden</a> en de <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacyverklaring</a>.</muted-text-micro>`,
        help: 'Help',
        whatIsNew: 'Wat is er nieuw',
        accountSettings: 'Accountinstellingen',
        account: 'Account',
        general: 'Algemeen',
    },
    closeAccountPage: {
        // @context close as a verb, not an adjective
        closeAccount: 'Account sluiten',
        reasonForLeavingPrompt: 'We zouden het heel jammer vinden als je vertrekt! Zou je ons willen vertellen waarom, zodat we ons kunnen verbeteren?',
        enterMessageHere: 'Voer hier een bericht in',
        closeAccountWarning: 'Het sluiten van je account kan niet ongedaan worden gemaakt.',
        closeAccountPermanentlyDeleteData: 'Weet je zeker dat je je account wilt verwijderen? Hierdoor worden alle openstaande onkosten permanent verwijderd.',
        enterDefaultContactToConfirm: 'Voer uw standaard contactmethode in om te bevestigen dat u uw account wilt sluiten. Uw standaard contactmethode is:',
        enterDefaultContact: 'Voer je standaardcontactmethode in',
        defaultContact: 'Standaardcontactmethode',
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
                `<muted-text><centered-text>Je hebt alle gegevens van <strong>${from}</strong> succesvol samengevoegd in <strong>${to}</strong>. Vanaf nu kun je voor deze account beide logins gebruiken.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'We zijn ermee bezig',
            limitedSupport: 'We ondersteunen het samenvoegen van accounts nog niet in New Expensify. Voer deze actie in plaats daarvan uit in Expensify Classic.',
            reachOutForHelp: '<muted-text><centered-text>Neem gerust <concierge-link>contact op met Concierge</concierge-link> als je vragen hebt!</centered-text></muted-text>',
            goToExpensifyClassic: 'Ga naar Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet samenvoegen omdat het wordt beheerd door <strong>${email.split('@').at(1) ?? ''}</strong>. Neem <concierge-link>contact op met Concierge</concierge-link> voor hulp.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet samenvoegen met andere accounts, omdat je domeinbeheerder deze heeft ingesteld als je primaire login. Voeg in plaats daarvan andere accounts hiermee samen.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Je kunt accounts niet samenvoegen, omdat voor <strong>${email}</strong> tweefactorauthenticatie (2FA) is ingeschakeld. Schakel 2FA voor <strong>${email}</strong> uit en probeer het opnieuw.</centered-text></muted-text>`,
            learnMore: 'Meer informatie over het samenvoegen van accounts.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Je kunt <strong>${email}</strong> niet samenvoegen omdat deze is vergrendeld. <concierge-link>Neem contact op met Concierge</concierge-link> voor hulp.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Je kunt accounts niet samenvoegen omdat <strong>${email}</strong> geen Expensify-account heeft. <a href="${contactMethodLink}">Voeg het in plaats daarvan toe als contactmethode</a>.</centered-text></muted-text>`,
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
        reportSuspiciousActivity: 'Verdachte activiteit rapporteren',
        lockAccount: 'Account vergrendelen',
        unlockAccount: 'Account ontgrendelen',
        compromisedDescription:
            'Merk je iets ongewoons aan je account? Door dit te melden wordt je account onmiddellijk vergrendeld, worden nieuwe Expensify Card-transacties geblokkeerd en worden alle wijzigingen aan je account voorkomen.',
        domainAdminsDescription: 'Voor domeinbeheerders: Dit pauzeert ook alle Expensify Card-activiteiten en beheerdersacties binnen je domein(en).',
        areYouSure: 'Weet je zeker dat je je Expensify-account wilt vergrendelen?',
        onceLocked: 'Zodra deze is vergrendeld, wordt je account beperkt in afwachting van een ontgrendelingsverzoek en een beveiligingscontrole',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Vergrendelen van account mislukt',
        failedToLockAccountDescription: `We konden je account niet vergrendelen. Chat alsjeblieft met Concierge om dit probleem op te lossen.`,
        chatWithConcierge: 'Chatten met Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Account vergrendeld',
        yourAccountIsLocked: 'Je account is vergrendeld',
        chatToConciergeToUnlock: 'Chat met Concierge om beveiligingsproblemen op te lossen en je account te ontgrendelen.',
        chatWithConcierge: 'Chatten met Concierge',
    },
    twoFactorAuth: {
        headerTitle: 'Twee-factor-authenticatie',
        twoFactorAuthEnabled: 'Authenticatie in twee stappen ingeschakeld',
        whatIsTwoFactorAuth:
            'Tweestapsverificatie (2FA) helpt je account veilig te houden. Wanneer je inlogt, moet je een code invoeren die wordt gegenereerd door je voorkeurs-app voor verificatiecodes.',
        disableTwoFactorAuth: 'Tweeledige verificatie uitschakelen',
        explainProcessToRemove: 'Om tweefactorauthenticatie (2FA) uit te schakelen, voer een geldige code in uit je authenticatie-app.',
        explainProcessToRemoveWithRecovery: 'Voer een geldige herstelcode in om tweefactorauthenticatie (2FA) uit te schakelen.',
        disabled: 'Tweetrapsauthenticatie is nu uitgeschakeld',
        noAuthenticatorApp: 'Je hebt geen authenticator-app meer nodig om in te loggen bij Expensify.',
        stepCodes: 'Herstelcodes',
        keepCodesSafe: 'Bewaar deze herstelscodes veilig!',
        codesLoseAccess: dedent(`
            Als je de toegang tot je authenticatie-app kwijtraakt en deze codes niet hebt, verlies je de toegang tot je account.

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
        congrats: 'Gefeliciteerd! Je hebt nu die extra beveiliging.',
        copy: 'Kopiëren',
        disable: 'Uitschakelen',
        enableTwoFactorAuth: 'Tweefactorauthenticatie inschakelen',
        pleaseEnableTwoFactorAuth: 'Schakel twee-factor-authenticatie in.',
        twoFactorAuthIsRequiredDescription: 'Om veiligheidsredenen vereist Xero tweefactorauthenticatie om de integratie te verbinden.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Authenticatie in twee stappen vereist',
        twoFactorAuthIsRequiredForAdminsTitle: 'Schakel twee-factor-authenticatie in',
        twoFactorAuthIsRequiredXero: 'Uw Xero-accountingverbinding vereist tweeledige verificatie.',
        twoFactorAuthIsRequiredCompany: 'Je bedrijf vereist tweefactorauthenticatie.',
        twoFactorAuthCannotDisable: 'Kan 2FA niet uitschakelen',
        twoFactorAuthRequired: 'Tweefactorauthenticatie (2FA) is vereist voor je Xero-verbinding en kan niet worden uitgeschakeld.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Voer uw herstelcode in',
            incorrectRecoveryCode: 'Onjuiste herstelcode. Probeer het opnieuw.',
        },
        useRecoveryCode: 'Herstelcode gebruiken',
        recoveryCode: 'Herstelcode',
        use2fa: 'Tweeledige verificatiecode gebruiken',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Voer uw tweefactorauthenticatiecode in',
            incorrect2fa: 'Onjuiste twee-factor-authenticatiecode. Probeer het nog eens.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Wachtwoord bijgewerkt!',
        allSet: 'Je bent helemaal klaar. Bewaar je nieuwe wachtwoord goed.',
    },
    privateNotes: {
        title: 'Privénotities',
        personalNoteMessage: 'Maak notities over deze chat hier. Jij bent de enige persoon die deze notities kan toevoegen, bewerken of bekijken.',
        sharedNoteMessage: 'Houd hier notities over deze chat bij. Expensify-medewerkers en andere leden met het team.expensify.com-domein kunnen deze notities bekijken.',
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
        note: `Opmerking: Het wijzigen van je betalingsvaluta kan invloed hebben op hoeveel je voor Expensify betaalt. Raadpleeg onze <a href="${CONST.PRICING}">prijspagina</a> voor alle details.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Een betaalpas toevoegen',
        nameOnCard: 'Naam op kaart',
        debitCardNumber: 'Debitcardnummer',
        expiration: 'Vervaldatum',
        expirationDate: 'MMJJ',
        cvv: 'CVV',
        billingAddress: 'Factuuradres',
        growlMessageOnSave: 'Je debitkaart is succesvol toegevoegd',
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
        deleteConfirmation: 'Weet je zeker dat je dit account wilt verwijderen?',
        error: {
            notOwnerOfBankAccount: 'Er is een fout opgetreden bij het instellen van deze bankrekening als je standaardbetaalmethode',
            invalidBankAccount: 'Deze bankrekening is tijdelijk opgeschort',
            notOwnerOfFund: 'Er is een fout opgetreden bij het instellen van deze kaart als je standaardbetaalmethode',
            setDefaultFailure: 'Er is iets misgegaan. Chat alsjeblieft met Concierge voor verdere ondersteuning.',
        },
        addBankAccountFailure: 'Er is een onverwachte fout opgetreden bij het toevoegen van je bankrekening. Probeer het opnieuw.',
        getPaidFaster: 'Sneller betaald worden',
        addPaymentMethod: 'Voeg een betaalmethode toe om rechtstreeks in de app betalingen te versturen en te ontvangen.',
        getPaidBackFaster: 'Word sneller terugbetaald',
        secureAccessToYourMoney: 'Beveiligde toegang tot je geld',
        receiveMoney: 'Ontvang geld in je lokale valuta',
        expensifyWallet: 'Expensify Wallet (bèta)',
        sendAndReceiveMoney: 'Verzend en ontvang geld met vrienden. Alleen Amerikaanse bankrekeningen.',
        enableWallet: 'Wallet inschakelen',
        addBankAccountToSendAndReceive: 'Voeg een bankrekening toe om betalingen te doen of te ontvangen.',
        addDebitOrCreditCard: 'Debit- of kredietkaart toevoegen',
        assignedCards: 'Toegewezen kaarten',
        assignedCardsDescription: 'Transacties van deze kaarten worden automatisch gesynchroniseerd.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'We beoordelen je gegevens. Kom over een paar minuten terug!',
        walletActivationFailed: 'Helaas kan je wallet op dit moment niet worden ingeschakeld. Chat alsjeblieft met Concierge voor verdere hulp.',
        addYourBankAccount: 'Voeg uw bankrekening toe',
        addBankAccountBody: 'Laten we je bankrekening koppelen aan Expensify zodat het makkelijker dan ooit is om rechtstreeks in de app betalingen te verzenden en te ontvangen.',
        chooseYourBankAccount: 'Kies je bankrekening',
        chooseAccountBody: 'Zorg ervoor dat je de juiste selecteert.',
        confirmYourBankAccount: 'Bevestig je bankrekening',
        personalBankAccounts: 'Persoonlijke bankrekeningen',
        businessBankAccounts: 'Zakelijke bankrekeningen',
        shareBankAccount: 'Bankrekening delen',
        bankAccountShared: 'Bankrekening gedeeld',
        shareBankAccountTitle: 'Selecteer de beheerders waarmee u deze bankrekening wilt delen:',
        shareBankAccountSuccess: 'Bankrekening gedeeld!',
        shareBankAccountSuccessDescription: 'De geselecteerde beheerders ontvangen een bevestigingsbericht van Concierge.',
        shareBankAccountFailure: 'Er is een onverwachte fout opgetreden bij het delen van de bankrekening. Probeer het opnieuw.',
        shareBankAccountEmptyTitle: 'Geen beheerders beschikbaar',
        shareBankAccountEmptyDescription: 'Er zijn geen werkruimtebeheerders waarmee u deze bankrekening kunt delen.',
        shareBankAccountNoAdminsSelected: 'Selecteer een beheerder voordat u verdergaat',
        unshareBankAccount: 'Deelname bankrekening ongedaan maken',
        unshareBankAccountDescription:
            'Iedereen hieronder heeft toegang tot deze bankrekening. U kunt de toegang op elk moment intrekken. We zullen alle betalingen die in behandeling zijn nog steeds voltooien.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) =>
            `${admin} verliest de toegang tot deze zakelijke bankrekening. We zullen alle betalingen die in behandeling zijn nog steeds voltooien.`,
        reachOutForHelp: 'Deze wordt gebruikt met de Expensify Card. <concierge-link>Neem contact op met Concierge</concierge-link> als u de deling ongedaan wilt maken.',
        unshareErrorModalTitle: 'Deling bankrekening kan niet ongedaan worden gemaakt',
        deleteCard: 'Kaart verwijderen',
        deleteCardConfirmation:
            'Alle niet-ingediende kaarttransacties, inclusief die in openstaande rapporten, worden verwijderd. Weet je zeker dat je deze kaart wilt verwijderen? Je kunt deze actie niet ongedaan maken.',
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
            name: 'Vaste limiet',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Je kunt tot ${formattedLimit} uitgeven met deze kaart, daarna wordt ze gedeactiveerd.`,
        },
        monthlyLimit: {
            name: 'Maandlimiet',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Je kunt elke maand tot ${formattedLimit} uitgeven met deze kaart. De limiet wordt opnieuw ingesteld op de 1e dag van elke kalendermaand.`,
        },
        virtualCardNumber: 'Virtueel kaartnummer',
        travelCardCvv: 'CVV van reiskaart',
        physicalCardNumber: 'Fysiek kaartnummer',
        physicalCardPin: 'PIN',
        getPhysicalCard: 'Fysieke kaart aanvragen',
        reportFraud: 'Fraude met virtuele kaart melden',
        reportTravelFraud: 'Reiskaartfraude melden',
        reviewTransaction: 'Transactie beoordelen',
        suspiciousBannerTitle: 'Verdachte transactie',
        suspiciousBannerDescription: 'We hebben verdachte transacties op uw kaart opgemerkt. Tik hieronder om ze te bekijken.',
        cardLocked: 'Je kaart is tijdelijk geblokkeerd terwijl ons team het account van je bedrijf controleert.',
        markTransactionsAsReimbursable: 'Transacties markeren als vergoedbaar',
        markTransactionsDescription: 'Indien ingeschakeld, worden transacties die van deze kaart zijn geïmporteerd standaard als terugbetaalbaar gemarkeerd.',
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
        validateCardTitle: 'Laten we zeker weten dat jij het bent',
        enterMagicCode: (contactMethod: string) =>
            `Voer de magische code in die is verzonden naar ${contactMethod} om je kaartgegevens te bekijken. Deze zou binnen een of twee minuten moeten aankomen.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) =>
            `Voeg alsjeblieft <a href="${missingDetailsLink}">je persoonlijke gegevens toe</a> en probeer het daarna opnieuw.`,
        unexpectedError: 'Er is een fout opgetreden bij het ophalen van je Expensify-kaartgegevens. Probeer het opnieuw.',
        cardFraudAlert: {
            confirmButtonText: 'Ja, dat doe ik',
            reportFraudButtonText: 'Nee, ik was het niet',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `verdachte activiteit gewist en kaart x${cardLastFour} opnieuw geactiveerd. Klaar om weer te declareren!`,
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
            }) => `verdachte activiteit vastgesteld op kaart eindigend op ${cardLastFour}. Herken je deze afschrijving?

${amount} voor ${merchant} - ${date}`,
        },
        csvCardDescription: 'CSV-import',
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
        addApprovalsDescription: 'Extra goedkeuring vereisen voordat een betaling wordt geautoriseerd.',
        makeOrTrackPaymentsTitle: 'Betalingen',
        makeOrTrackPaymentsDescription: 'Voeg een gemachtigde betaler toe voor betalingen die in Expensify worden gedaan of houd betalingen bij die elders worden gedaan.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Er is een aangepast goedkeuringsworkflow ingeschakeld voor deze workspace. Neem contact op met uw <account-manager-link>Account Manager</account-manager-link> of <concierge-link>Concierge</concierge-link> om deze workflow te bekijken of te wijzigen.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Er is een aangepast goedkeuringsworkflow ingeschakeld voor deze workspace. Neem contact op met <concierge-link>Concierge</concierge-link> om dit workflow te bekijken of te wijzigen.</muted-text-label>',
        editor: {
            submissionFrequency: 'Kies hoe lang Expensify moet wachten voordat foutloze uitgaven worden gedeeld.',
        },
        frequencyDescription: 'Kies hoe vaak je onkosten automatisch wilt laten indienen, of maak het handmatig',
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
        approverInMultipleWorkflows: 'Dit lid behoort al tot een andere goedkeuringsworkflow. Alle updates die je hier aanbrengt, worden daar ook doorgevoerd.',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> keurt al rapporten goed voor <strong>${name2}</strong>. Kies een andere goedkeurder om een cirkelvormige workflow te voorkomen.`,
        emptyContent: {
            title: 'Geen leden om weer te geven',
            expensesFromSubtitle: 'Alle werkruimteleden behoren al tot een bestaande goedkeuringsworkflow.',
            approverSubtitle: 'Alle fiatteurs behoren tot een bestaande workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'Indien frequentie van indienen niet kon worden gewijzigd. Probeer het opnieuw of neem contact op met support.',
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
        title: 'Declaraties van',
        header: 'Wanneer de volgende leden onkosten indienen:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'De fiatteur kon niet worden gewijzigd. Probeer het opnieuw of neem contact op met support.',
        title: 'Naar dit lid sturen ter goedkeuring:',
        description: 'Deze persoon zal de uitgaven goedkeuren.',
    },
    workflowsApprovalLimitPage: {
        title: 'Goedkeurder',
        header: '(Optioneel) Wilt u een goedkeuringslimiet toevoegen?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Voeg een andere goedkeurder toe wanneer <strong>${approverName}</strong> goedkeurder is en het rapport het onderstaande bedrag overschrijdt:`
                : 'Voeg een andere goedkeurder toe wanneer het rapport het onderstaande bedrag overschrijdt:',
        reportAmountLabel: 'Rapportbedrag',
        additionalApproverLabel: 'Extra goedkeurder',
        skip: 'Overslaan',
        next: 'Volgende',
        removeLimit: 'Limiet verwijderen',
        enterAmountError: 'Voer een geldig bedrag in',
        enterApproverError: 'Een goedkeurder is vereist wanneer u een rapportlimiet instelt',
        enterBothError: 'Voer een rapportbedrag en een extra goedkeurder in',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) =>
            `Rapporten boven ${approvalLimit} worden doorgestuurd naar ${approverName}`,
    },
    workflowsPayerPage: {
        title: 'Geautoriseerde betaler',
        genericErrorMessage: 'De gemachtigde betaler kon niet worden gewijzigd. Probeer het opnieuw.',
        admins: 'Beheerders',
        payer: 'Betaler',
        paymentAccount: 'Betaalrekening',
    },
    reportFraudPage: {
        title: 'Fraude met virtuele kaart melden',
        description:
            'Als de gegevens van je virtuele kaart zijn gestolen of gecompromitteerd, deactiveren we je bestaande kaart permanent en geven we je een nieuwe virtuele kaart en een nieuw nummer.',
        deactivateCard: 'Kaart deactiveren',
        reportVirtualCardFraud: 'Fraude met virtuele kaart melden',
    },
    reportFraudConfirmationPage: {
        title: 'Creditcardfraude gemeld',
        description: 'We hebben je bestaande kaart permanent gedeactiveerd. Wanneer je teruggaat om je kaartgegevens te bekijken, is er een nieuwe virtuele kaart beschikbaar.',
        buttonText: 'Begrepen, bedankt!',
    },
    activateCardPage: {
        activateCard: 'Kaart activeren',
        pleaseEnterLastFour: 'Voer de laatste vier cijfers van uw kaart in.',
        activatePhysicalCard: 'Fysieke kaart activeren',
        error: {
            thatDidNotMatch: 'Dat kwam niet overeen met de laatste 4 cijfers van je kaart. Probeer het opnieuw.',
            throttled:
                'Je hebt de laatste 4 cijfers van je Expensify Card te vaak onjuist ingevoerd. Als je zeker weet dat de cijfers kloppen, neem dan contact op met Concierge om dit op te lossen. Probeer het anders later opnieuw.',
        },
    },
    getPhysicalCard: {
        header: 'Fysieke kaart aanvragen',
        nameMessage: 'Voer uw voor- en achternaam in, want deze wordt op uw kaart weergegeven.',
        legalName: 'Wettelijke naam',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Wettelijke achternaam',
        phoneMessage: 'Voer je telefoonnummer in.',
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
        transfer: ({amount}: TransferParams) => `Overboeking${amount ? ` ${amount}` : ''}`,
        instant: 'Direct (debitkaart)',
        instantSummary: (rate: string, minAmount: string) => `${rate}% vergoeding (${minAmount} minimum)`,
        ach: '1-3 werkdagen (bankrekening)',
        achSummary: 'Geen kosten',
        whichAccount: 'Welk account?',
        fee: 'Kosten',
        transferSuccess: 'Overboeking geslaagd!',
        transferDetailBankAccount: 'Uw geld zou binnen 1–3 werkdagen moeten aankomen.',
        transferDetailDebitCard: 'Je geld zou onmiddellijk moeten aankomen.',
        failedTransfer: 'Je saldo is nog niet volledig vereffend. Maak alstublieft een overschrijving naar een bankrekening.',
        notHereSubTitle: 'Gelieve uw saldo over te maken vanaf de portemonneepagina',
        goToWallet: 'Ga naar Portemonnee',
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
        title: 'Kostenregels',
        subtitle: 'Deze regels zijn van toepassing op je uitgaven. Als je ze indient bij een werkruimte, kunnen de regels van de werkruimte deze overschrijven.', //_/\__/_/  \_,_/\__/\__/\_,_/
        findRule: 'Regel zoeken',
        emptyRules: {title: 'Je hebt nog geen regels aangemaakt', subtitle: 'Voeg een regel toe om onkostendeclaraties te automatiseren.'},
        changes: {
            billableUpdate: (value: boolean) => `Uitgave ${value ? 'factureerbaar' : 'niet-declarabel'} bijwerken`,
            categoryUpdate: (value: string) => `Categorie bijwerken naar "${value}"`,
            commentUpdate: (value: string) => `Beschrijving wijzigen in "${value}"`,
            merchantUpdate: (value: string) => `Handelaar bijwerken naar "${value}"`,
            reimbursableUpdate: (value: boolean) => `Uitgave ${value ? 'terugbetaalbaar' : 'niet-vergoedbaar'} bijwerken`,
            tagUpdate: (value: string) => `Tag bijwerken naar "${value}"`,
            taxUpdate: (value: string) => `Belastingtarief bijwerken naar ${value}`,
            billable: (value: boolean) => `uitgave ${value ? 'factureerbaar' : 'niet-declarabel'}`,
            category: (value: string) => `categorie naar "${value}"`,
            comment: (value: string) => `beschrijving wijzigen in "${value}"`,
            merchant: (value: string) => `handelaar naar "${value}"`,
            reimbursable: (value: boolean) => `uitgave ${value ? 'terugbetaalbaar' : 'niet-vergoedbaar'}`,
            tag: (value: string) => `tag naar "${value}"`,
            tax: (value: string) => `belastingtarief naar ${value}`,
            report: (value: string) => `toevoegen aan een rapport met de naam "${value}"`,
        },
        newRule: 'Nieuwe regel',
        addRule: {
            title: 'Regel toevoegen',
            expenseContains: 'Als de uitgave bevat:',
            applyUpdates: 'Breng vervolgens deze updates aan:',
            merchantHint: 'Typ * om een regel te maken die voor alle leveranciers geldt',
            addToReport: 'Toevoegen aan een rapport met de naam',
            createReport: 'Maak rapport indien nodig',
            applyToExistingExpenses: 'Toepassen op bestaande overeenkomende onkosten',
            confirmError: 'Voer een leverancier in en pas ten minste één wijziging toe',
            confirmErrorMerchant: 'Voer handelaar in',
            confirmErrorUpdate: 'Breng ten minste één wijziging aan alstublieft',
            saveRule: 'Regel opslaan',
        },
        editRule: {title: 'Regel bewerken'},
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
        generatingPDF: 'PDF genereren',
        waitForPDF: 'Even geduld terwijl we de PDF genereren.',
        errorPDF: 'Er is een fout opgetreden bij het genereren van uw PDF.',
        successPDF: 'Je PDF is gegenereerd! Als het niet automatisch is gedownload, gebruik dan de knop hieronder.',
    },
    reportDescriptionPage: {
        roomDescription: 'Kamerbeschrijving',
        roomDescriptionOptional: 'Kamerbeschrijving (optioneel)',
        explainerText: 'Stel een aangepaste beschrijving voor de ruimte in.',
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
        chooseThemeBelowOrSync: 'Kies een thema hieronder of synchroniseer met de instellingen van je apparaat.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>Door in te loggen ga je akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Servicevoorwaarden</a> en het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacybeleid</a>.</muted-text-xs>`,
        license: `<muted-text-xs>Geldtransacties worden verzorgd door ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) krachtens zijn <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licenties</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Geen magische code ontvangen?',
        enterAuthenticatorCode: 'Voer uw verificatiecode van de authenticator in',
        enterRecoveryCode: 'Voer uw herstelcode in',
        requiredWhen2FAEnabled: 'Vereist wanneer 2FA is ingeschakeld',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Vraag een nieuwe code aan over <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Nieuwe code aanvragen',
        error: {
            pleaseFillMagicCode: 'Voer je magische code in',
            incorrectMagicCode: 'Onjuiste of ongeldige magische code. Probeer het opnieuw of vraag een nieuwe code aan.',
            pleaseFillTwoFactorAuth: 'Voer uw tweefactorauthenticatiecode in',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Vul alle velden in',
        pleaseFillPassword: 'Voer uw wachtwoord in',
        pleaseFillTwoFactorAuth: 'Voer uw tweefactorauthenticatiecode in',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Voer je tweeledige verificatiecode in om door te gaan',
        forgot: 'Vergeten?',
        requiredWhen2FAEnabled: 'Vereist wanneer 2FA is ingeschakeld',
        error: {
            incorrectPassword: 'Onjuist wachtwoord. Probeer het opnieuw.',
            incorrectLoginOrPassword: 'Onjuiste login of wachtwoord. Probeer het opnieuw.',
            incorrect2fa: 'Onjuiste twee-factor-authenticatiecode. Probeer het nog eens.',
            twoFactorAuthenticationEnabled: 'Je hebt 2FA ingeschakeld op dit account. Meld je aan met je e‑mailadres of telefoonnummer.',
            invalidLoginOrPassword: 'Ongeldige gebruikersnaam of wachtwoord. Probeer het opnieuw of reset uw wachtwoord.',
            unableToResetPassword:
                'We konden je wachtwoord niet wijzigen. Dit komt waarschijnlijk door een verlopen link voor het opnieuw instellen van je wachtwoord in een oude e-mail. We hebben je een nieuwe link gemaild zodat je het opnieuw kunt proberen. Controleer je inbox en je map met ongewenste e-mail; de e-mail zou binnen enkele minuten moeten aankomen.',
            noAccess: 'Je hebt geen toegang tot deze applicatie. Voeg je GitHub-gebruikersnaam toe om toegang te krijgen.',
            accountLocked: 'Je account is vergrendeld na te veel mislukte pogingen. Probeer het alsjeblieft over 1 uur opnieuw.',
            fallback: 'Er is iets misgegaan. Probeer het later opnieuw.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefoon of e-mail',
        error: {
            invalidFormatEmailLogin: 'Het ingevoerde e-mailadres is ongeldig. Corrigeer het formaat en probeer het opnieuw.',
        },
        cannotGetAccountDetails: 'Accountgegevens kunnen niet worden opgehaald. Probeer opnieuw in te loggen.',
        loginForm: 'Inlogformulier',
        notYou: ({user}: NotYouParams) => `Niet ${user}?`,
    },
    onboarding: {
        welcome: 'Welkom!',
        welcomeSignOffTitleManageTeam: 'Zodra je de bovenstaande taken hebt voltooid, kunnen we meer functionaliteit verkennen, zoals goedkeuringsworkflows en regels!',
        welcomeSignOffTitle: 'Het is geweldig om je te ontmoeten!',
        explanationModal: {
            title: 'Welkom bij Expensify',
            description:
                'Eén app om je zakelijke en persoonlijke uitgaven af te handelen met de snelheid van chat. Probeer het uit en laat ons weten wat je ervan vindt. Er komt nog veel meer aan!',
            secondaryDescription: 'Om terug te schakelen naar Expensify Classic, tik je gewoon op je profielfoto > Ga naar Expensify Classic.',
        },
        getStarted: 'Aan de slag',
        whatsYourName: 'Hoe heet je?',
        peopleYouMayKnow: 'Mensen die je misschien kent, zijn hier al! Verifieer je e‑mail om je bij hen te voegen.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Iemand van ${domain} heeft al een workspace gemaakt. Voer de magische code in die is verzonden naar ${email}.`,
        joinAWorkspace: 'Lid worden van een workspace',
        listOfWorkspaces: 'Hier is de lijst met werkruimtes waaraan je kunt deelnemen. Maak je geen zorgen, je kunt je er altijd later nog bij aansluiten als je dat liever hebt.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} lid${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Waar werk je?',
        errorSelection: 'Selecteer een optie om verder te gaan',
        purpose: {
            title: 'Wat wil je vandaag doen?',
            errorContinue: 'Druk op Doorgaan om de installatie te voltooien',
            errorBackButton: 'Beantwoord de installatievragen om de app te gaan gebruiken',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Terugbetaald worden door mijn werkgever',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Beheer de uitgaven van mijn team',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Uitgaven bijhouden en budgetteren',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Chatten en uitgaven splitsen met vrienden',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Iets anders',
        },
        employees: {
            title: 'Hoeveel medewerkers heeft u?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 medewerkers',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 medewerkers',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 medewerkers',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101–1.000 werknemers',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Meer dan 1.000 medewerkers',
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
            subtitle: 'Expensify werkt het beste wanneer je je werkmail koppelt.',
            explanationModal: {
                descriptionOne: 'Doorsturen naar receipts@expensify.com voor scannen',
                descriptionTwo: 'Voeg je bij je collega’s die Expensify al gebruiken',
                descriptionThree: 'Geniet van een meer gepersonaliseerde ervaring',
            },
            addWorkEmail: 'Werkmail toevoegen',
        },
        workEmailValidation: {
            title: 'Verifieer je zakelijke e-mailadres',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Voer de magische code in die is verzonden naar ${workEmail}. Deze zou binnen één à twee minuten moeten aankomen.`,
        },
        workEmailValidationError: {
            publicEmail: 'Voer een geldig zakelijk e-mailadres in van een privédomein, bijv. mitch@company.com',
            offline: 'We konden je zakelijke e-mailadres niet toevoegen omdat je offline lijkt te zijn',
        },
        mergeBlockScreen: {
            title: 'Werkmail kon niet worden toegevoegd',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) => `We konden ${workEmail} niet toevoegen. Probeer het later opnieuw in Instellingen of chat met Concierge voor hulp.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Maak een [proefrit](${testDriveURL})`,
                description: ({testDriveURL}) => `[Volg een korte productrondleiding](${testDriveURL}) om te zien waarom Expensify de snelste manier is om je onkostendeclaraties te doen.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Maak een [proefrit](${testDriveURL})`,
                description: ({testDriveURL}) => `Maak met ons een [testrit](${testDriveURL}) en geef je team *3 gratis maanden Expensify!*`,
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
                        6. Schakel *Fiatteringen* in.
                        7. Jij wordt ingesteld als de fiatteur voor uitgaven. Je kunt dit wijzigen naar elke beheerder zodra je je team uitnodigt.

                        [Breng me naar Meer functies](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Maak](${workspaceConfirmationLink}) een workspace`,
                description: 'Maak een workspace aan en configureer de instellingen met hulp van je setup-specialist!',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Maak een [werkruimte](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Maak een workspace* om uitgaven bij te houden, bonnetjes te scannen, chatten en meer.

                        1. Klik op *Workspaces* > *New workspace*.

                        *Je nieuwe workspace is klaar!* [Bekijk hem](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[Categories instellen](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Stel categorieën in* zodat je team onkosten kan coderen voor eenvoudige rapportage.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *Categories*.
                        4. Schakel alle categorieën uit die je niet nodig hebt.
                        5. Voeg je eigen categorieën toe rechtsboven.

                        [Breng me naar de instellingen voor workspacecategorieën](${workspaceCategoriesLink}).

                        ![Stel categorieën in](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Een uitgave indienen',
                description: dedent(`
                    *Dien een uitgave in* door een bedrag in te voeren of een bon te scannen.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Uitgave aanmaken*.
                    3. Voer een bedrag in of scan een bon.
                    4. Voeg het e-mailadres of telefoonnummer van je baas toe.
                    5. Klik op *Aanmaken*.

                    En je bent klaar!
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
                title: 'Uitgave bijhouden',
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
                    `Verbind${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'tot'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'uw' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Verbind ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'uw' : 'naar'} ${integrationName} voor automatische kosten-codering en synchronisatie, zodat de maandafsluiting moeiteloos verloopt.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *Accounting*.
                        4. Zoek ${integrationName}.
                        5. Klik op *Connect*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? `[Breng me naar boekhouding](${workspaceAccountingLink}).

                        ![Verbinding maken met ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
        : `[Breng me naar de boekhouding](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Verbind [je zakelijke kaarten](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Verbind de kaarten die je al hebt voor automatische transactie-import, bonkoppeling en afstemming.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *Company cards*.
                        4. Volg de aanwijzingen om je kaarten te verbinden.

                        [Breng me naar company cards](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Nodig [je team](${workspaceMembersLink}) uit`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Nodig je team uit* voor Expensify zodat ze vandaag nog kunnen beginnen met het bijhouden van uitgaven.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *Members* > *Invite member*.
                        4. Voer e-mails of telefoonnummers in.
                        5. Voeg een aangepast uitnodigingsbericht toe als je dat wilt!

                        [Breng me naar de workspaceleden](${workspaceMembersLink}).

                        ![Nodig je team uit](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[Categorieën](${workspaceCategoriesLink}) en [tags](${workspaceTagsLink}) instellen`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Stel categorieën en labels in* zodat je team uitgaven kan coderen voor eenvoudige rapportage.

                        Importeer ze automatisch door [je boekhoudsoftware te koppelen](${workspaceAccountingLink}), of stel ze handmatig in via je [werkruimte-instellingen](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Stel [tags](${workspaceTagsLink}) in`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Gebruik labels om extra onkostendetails toe te voegen, zoals projecten, klanten, locaties en afdelingen. Als je meerdere niveaus van labels nodig hebt, kun je upgraden naar het Control-abonnement.

                        1. Klik op *Workspaces*.
                        2. Selecteer je workspace.
                        3. Klik op *More features*.
                        4. Schakel *Tags* in.
                        5. Ga naar *Tags* in de workspace-editor.
                        6. Klik op *+ Add tag* om je eigen label te maken.

                        [Breng me naar more features](${workspaceMoreFeaturesLink}).

                        ![Labels instellen](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Nodig uw [boekhouder](${workspaceMembersLink}) uit`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Nodig uw accountant uit* om samen te werken in uw workspace en uw zakelijke uitgaven te beheren.

                        1. Klik op *Workspaces*.
                        2. Selecteer uw workspace.
                        3. Klik op *Members*.
                        4. Klik op *Invite member*.
                        5. Voer het e-mailadres van uw accountant in.

                        [Nodig uw accountant nu uit](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Een chat starten',
                description: dedent(`
                    *Start een chat* met iedereen via hun e‑mail of telefoonnummer.

                    1. Klik op de knop ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Kies *Chat starten*.
                    3. Voer een e‑mail of telefoonnummer in.

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
                    3. Voer e‑mailadressen of telefoonnummers in.
                    4. Klik in de chat op de grijze knop *+* > *Uitgave splitsen*.
                    5. Maak de uitgave aan door *Handmatig*, *Scan* of *Afstand* te selecteren.

                    Voeg gerust meer details toe als je wilt, of stuur het gewoon door. Zo word je snel terugbetaald!
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Controleer je [werkruimtesettings](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Zo kun je je werkruimte-instellingen bekijken en bijwerken:
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
            onboardingPersonalSpendMessage: 'Zo volg je je uitgaven in een paar klikken.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Je gratis proefperiode is gestart! Laten we je instellen.
                        👋 Hoi, ik ben je Expensify-installatiespecialist. Ik heb al een workspace gemaakt om de bonnen en uitgaven van je team te beheren. Volg gewoon de onderstaande resterende stappen om alles in te stellen en het meeste uit je gratis proefperiode van 30 dagen te halen!
                    `)
                    : dedent(`
                        # Je gratis proefperiode is gestart! Laten we je instellen.
                        👋 Hoi, ik ben je Expensify-installatiespecialist. Nu je een workspace hebt aangemaakt, haal het meeste uit je gratis proefperiode van 30 dagen door de onderstaande stappen te volgen!
                    `),
            onboardingTrackWorkspaceMessage:
                '# Laten we je instellen\n👋 Hoi, ik ben je Expensify-installatiespecialist. Ik heb al een workspace aangemaakt om je bonnetjes en uitgaven te beheren. Volg gewoon de resterende installatiestappen hieronder om het meeste uit je gratis proefperiode van 30 dagen te halen!',
            onboardingChatSplitMessage: 'Rekeningen splitsen met vrienden is net zo eenvoudig als het versturen van een bericht. Zo werkt het.',
            onboardingAdminMessage: 'Leer hoe je als beheerder de werkruimte van je team beheert en je eigen declaraties indient.',
            onboardingLookingAroundMessage:
                'Expensify staat vooral bekend om onkosten-, reis- en bedrijfskaartbeheer, maar we doen veel meer dan dat. Laat me weten waarin je geïnteresseerd bent, dan help ik je op weg.',
            onboardingTestDriveReceiverMessage: '*Je krijgt 3 maanden gratis! Ga hieronder aan de slag.*',
        },
        workspace: {
            title: 'Blijf georganiseerd met een workspace',
            subtitle: 'Ontgrendel krachtige tools om uw onkostenbeheer te vereenvoudigen, allemaal op één plek. Met een workspace kunt u:',
            explanationModal: {
                descriptionOne: 'Bonnetjes bijhouden en ordenen',
                descriptionTwo: 'Categoriseer en tag uitgaven',
                descriptionThree: 'Rapporten maken en delen',
            },
            price: 'Probeer het 30 dagen gratis, upgrade daarna voor slechts <strong>$5/gebruiker/maand</strong>.',
            createWorkspace: 'Werkruimte maken',
        },
        confirmWorkspace: {
            title: 'Workspace bevestigen',
            subtitle: 'Maak een workspace om bonnen bij te houden, uitgaven te vergoeden, reizen te beheren, rapporten te maken en meer — allemaal op de snelheid van chat.',
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
            containsReservedWord: 'Naam mag de woorden Expensify of Concierge niet bevatten',
            hasInvalidCharacter: 'Naam mag geen komma of puntkomma bevatten',
            requiredFirstName: 'Voornaam mag niet leeg zijn',
            cannotContainSpecialCharacters: 'Naam mag geen speciale tekens bevatten',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Wat is je wettelijke naam?',
        enterDateOfBirth: 'Wat is je geboortedatum?',
        enterAddress: 'Wat is je adres?',
        enterPhoneNumber: 'Wat is je telefoonnummer?',
        personalDetails: 'Persoonlijke gegevens',
        privateDataMessage: 'Deze gegevens worden gebruikt voor reizen en betalingen. Ze worden nooit weergegeven op je openbare profiel.',
        legalName: 'Wettelijke naam',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Wettelijke achternaam',
        address: 'Adres',
        error: {
            dateShouldBeBefore: (dateString: string) => `Datum moet vóór ${dateString} zijn`,
            dateShouldBeAfter: (dateString: string) => `Datum moet na ${dateString} zijn`,
            hasInvalidCharacter: 'Naam mag alleen Latijnse tekens bevatten',
            incorrectZipFormat: (zipFormat?: string) => `Ongeldig postcodeformaat${zipFormat ? `Acceptabel formaat: ${zipFormat}` : ''}`,
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
        unlink: 'Koppeling verwijderen',
        linkSent: 'Link verzonden!',
        successfullyUnlinkedLogin: 'Secundaire login succesvol ontkoppeld!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Onze e-mailprovider heeft e-mails naar ${login} tijdelijk geblokkeerd vanwege bezorgingsproblemen. Volg deze stappen om je login te deblokkeren:`,
        confirmThat: (login: string) =>
            `<strong>Bevestig dat ${login} correct is gespeld en een echt, bezorgbaar e-mailadres is.</strong> E-mailaliassen zoals "expenses@domain.com" moeten toegang hebben tot hun eigen e-mailinbox om een geldige Expensify-login te zijn.`,
        ensureYourEmailClient: `<strong>Zorg ervoor dat uw e‑mailclient e‑mails van expensify.com toestaat.</strong> U kunt instructies over hoe u deze stap voltooit <a href="${CONST.SET_NOTIFICATION_LINK}">hier</a> vinden, maar mogelijk hebt u hulp van uw IT‑afdeling nodig om uw e‑mailinstellingen te configureren.`,
        onceTheAbove: `Zodra je bovenstaande stappen hebt voltooid, neem dan contact op met <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> om je login te deblokkeren.`,
    },
    openAppFailureModal: {
        title: 'Er is iets misgegaan...',
        subtitle: `We hebben niet al je gegevens kunnen laden. We zijn op de hoogte gesteld en onderzoeken het probleem. Als dit zich blijft voordoen, neem dan contact op met`,
        refreshAndTryAgain: 'Vernieuw en probeer het opnieuw',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `We kunnen geen sms-berichten leveren aan ${login}, dus we hebben dit tijdelijk gepauzeerd. Probeer je nummer opnieuw te valideren:`,
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
            return `Blijf even geduldig! Je moet ${timeText} wachten voordat je je nummer opnieuw probeert te valideren.`;
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
            `Blijf het overzicht houden door alleen ongelezen chats of chats die je aandacht nodig hebben te zien. Maak je geen zorgen, je kunt dit op elk moment wijzigen in de <a href="${priorityModePageUrl}">instellingen</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'De chat die je zoekt, kan niet worden gevonden.',
        getMeOutOfHere: 'Haal me hier weg',
        iouReportNotFound: 'De betalingsgegevens die u zoekt, kunnen niet worden gevonden.',
        notHere: 'Hmm... het is er niet',
        pageNotFound: 'Oeps, deze pagina kan niet worden gevonden',
        noAccess: 'Deze chat of uitgave is mogelijk verwijderd of je hebt er geen toegang toe.\n\nVoor vragen kun je contact opnemen met concierge@expensify.com',
        goBackHome: 'Ga terug naar homepagina',
        commentYouLookingForCannotBeFound: 'De opmerking die je zoekt, kan niet worden gevonden.',
        goToChatInstead: 'Ga in plaats daarvan naar de chat.',
        contactConcierge: 'Voor vragen kunt u contact opnemen met concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Oeps... ${isBreakLine ? '\n' : ''}Er is iets misgegaan`,
        subtitle: 'Je verzoek kon niet worden voltooid. Probeer het later opnieuw.',
        wrongTypeSubtitle: 'Die zoekopdracht is ongeldig. Probeer je zoekcriteria aan te passen.',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Voeg een emoji toe zodat je collega’s en vrienden gemakkelijk kunnen zien wat er aan de hand is. Je kunt er ook nog een bericht bij zetten als je wilt!',
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
        vacationDelegate: 'Vakantie-gemachtigde',
        setVacationDelegate: `Stel een vervangende goedkeurder in om rapporten namens jou te accorderen terwijl je afwezig bent.`,
        vacationDelegateError: 'Er is een fout opgetreden bij het bijwerken van je vervanger tijdens vakantie.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `als ${nameOrEmail}'s plaatsvervanger tijdens vakantie`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `aan ${submittedToName} als vakantiemachtiging voor ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Je wijst ${nameOrEmail} aan als je vervangend gemachtigde tijdens je vakantie. Ze zitten nog niet in al je werkruimtes. Als je doorgaat, wordt er een e-mail gestuurd naar alle beheerders van je werkruimtes om hen toe te voegen.`,
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
        letsDoubleCheck: 'Laten we nog eens controleren of alles er goed uitziet.',
        accountEnding: 'Rekening eindigend op',
        thisBankAccount: 'Deze bankrekening wordt gebruikt voor zakelijke betalingen in je workspace',
        accountNumber: 'Rekeningnummer',
        routingNumber: 'Routingnummer',
        chooseAnAccountBelow: 'Kies een account hieronder',
        addBankAccount: 'Bankrekening toevoegen',
        chooseAnAccount: 'Kies een account',
        connectOnlineWithPlaid: 'Log in bij uw bank',
        connectManually: 'Handmatig verbinden',
        desktopConnection: 'Opmerking: om verbinding te maken met Chase, Wells Fargo, Capital One of Bank of America, klik hier om dit proces in een browser te voltooien.',
        yourDataIsSecure: 'Uw gegevens zijn veilig',
        toGetStarted: 'Voeg een bankrekening toe om onkosten terug te betalen, Expensify Cards uit te geven, factuurbetalingen te innen en rekeningen te betalen, allemaal vanaf één plek.',
        plaidBodyCopy: 'Geef je werknemers een eenvoudigere manier om bedrijfskosten te betalen – en terugbetaald te worden.',
        checkHelpLine: 'Je kunt je routingnummer en rekeningnummer vinden op een cheque van de rekening.',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Om een bankrekening te koppelen, <a href="${contactMethodRoute}">voeg eerst een e‑mail toe als je primaire login</a> en probeer het opnieuw. Je kunt je telefoonnummer als secundaire login toevoegen.`,
        hasBeenThrottledError: 'Er is een fout opgetreden bij het toevoegen van je bankrekening. Wacht een paar minuten en probeer het opnieuw.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Oeps! Het lijkt erop dat de valuta van je werkruimte is ingesteld op een andere valuta dan USD. Ga om verder te gaan naar <a href="${workspaceRoute}">je werkruimte-instellingen</a> om deze op USD in te stellen en probeer het opnieuw.`,
        bbaAdded: 'Zakelijke bankrekening toegevoegd!',
        bbaAddedDescription: 'Het is klaar om voor betalingen te worden gebruikt.',
        error: {
            youNeedToSelectAnOption: 'Selecteer een optie om verder te gaan',
            noBankAccountAvailable: 'Sorry, er is geen bankrekening beschikbaar',
            noBankAccountSelected: 'Kies een rekening',
            taxID: 'Voer een geldig btw-nummer in',
            website: 'Voer een geldige website in',
            zipCode: `Voer een geldige postcode in met het volgende formaat: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Voer een geldig telefoonnummer in',
            email: 'Voer een geldig e-mailadres in',
            companyName: 'Voer een geldige bedrijfsnaam in',
            addressCity: 'Voer een geldige stad in',
            addressStreet: 'Voer een geldig straatadres in',
            addressState: 'Selecteer een geldige staat',
            incorporationDateFuture: 'De oprichtingsdatum kan niet in de toekomst liggen',
            incorporationState: 'Selecteer een geldige staat',
            industryCode: 'Voer een geldige branchecode met zes cijfers in',
            restrictedBusiness: 'Bevestig alsjeblieft dat het bedrijf niet op de lijst met beperkte bedrijven staat',
            routingNumber: 'Voer een geldig routeringsnummer in',
            accountNumber: 'Voer een geldig rekeningnummer in',
            routingAndAccountNumberCannotBeSame: 'Routing- en rekeningnummers mogen niet hetzelfde zijn',
            companyType: 'Selecteer een geldig bedrijfstype',
            tooManyAttempts: 'Vanwege een groot aantal inlogpogingen is deze optie voor 24 uur uitgeschakeld. Probeer het later opnieuw of voer de gegevens handmatig in.',
            address: 'Voer een geldig adres in',
            dob: 'Selecteer een geldige geboortedatum',
            age: 'Moet ouder dan 18 jaar zijn',
            ssnLast4: 'Voer de geldige laatste 4 cijfers van het BSN in',
            firstName: 'Voer een geldige voornaam in',
            lastName: 'Voer een geldige achternaam in',
            noDefaultDepositAccountOrDebitCardAvailable: 'Voeg een standaardstorting‑rekening of betaalpas toe',
            validationAmounts: 'De verificatiebedragen die je hebt ingevoerd zijn onjuist. Controleer je bankafschrift nog eens en probeer het opnieuw.',
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
        accountTypeStepHeader: 'Wat voor type account is dit?',
        bankInformationStepHeader: 'Wat zijn je bankgegevens?',
        accountHolderInformationStepHeader: 'Wat zijn de gegevens van de rekeninghouder?',
        howDoWeProtectYourData: 'Hoe beschermen we uw gegevens?',
        currencyHeader: 'Wat is de valuta van je bankrekening?',
        confirmationStepHeader: 'Controleer je gegevens.',
        confirmationStepSubHeader: 'Controleer de onderstaande gegevens en vink het vakje met de voorwaarden aan om te bevestigen.',
        toGetStarted: 'Voeg een persoonlijke bankrekening toe om vergoedingen te ontvangen, facturen te betalen of de Expensify Wallet in te schakelen.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Expensify-wachtwoord invoeren',
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
            afterLinkText: 'om het te bekijken.',
            formLabel: 'PDF bekijken',
        },
        attachmentNotFound: 'Bijlage niet gevonden',
        retry: 'Opnieuw proberen',
    },
    messages: {
        errorMessageInvalidPhone: `Voer een geldig telefoonnummer in zonder haakjes of streepjes. Als u zich buiten de VS bevindt, voeg dan uw landcode toe (bijv. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Ongeldig e-mailadres',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} is al lid van ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} is al een beheerder van ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'Door door te gaan met het verzoek om uw Expensify Wallet te activeren, bevestigt u dat u hebt gelezen, begrijpt en accepteert',
        facialScan: 'Onfido’s beleid en vrijgave voor gelaatscan',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Onfido’s beleid en vrijgave voor gelaatscan</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Privacy</a> en <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Servicevoorwaarden</a>.</muted-text-micro>`,
        tryAgain: 'Opnieuw proberen',
        verifyIdentity: 'Identiteit verifiëren',
        letsVerifyIdentity: 'Laten we je identiteit verifiëren',
        butFirst: `Maar eerst het saaie gedeelte. Lees de juridische tekst in de volgende stap en klik op "Accepteren" wanneer je klaar bent.`,
        genericError: 'Er is een fout opgetreden tijdens het verwerken van deze stap. Probeer het opnieuw.',
        cameraPermissionsNotGranted: 'Toegang tot camera inschakelen',
        cameraRequestMessage: 'We hebben toegang tot je camera nodig om de verificatie van je bankrekening te voltooien. Schakel dit in via Instellingen > New Expensify.',
        microphonePermissionsNotGranted: 'Microfoontoegang inschakelen',
        microphoneRequestMessage: 'We hebben toegang tot je microfoon nodig om de bankrekeningverificatie te voltooien. Schakel dit in via Instellingen > New Expensify.',
        originalDocumentNeeded: 'Upload alstublieft een originele foto van uw identiteitsbewijs in plaats van een screenshot of gescande afbeelding.',
        documentNeedsBetterQuality:
            'Uw identiteitsbewijs lijkt beschadigd te zijn of mist beveiligingskenmerken. Upload alstublieft een originele afbeelding van een onbeschadigd identiteitsbewijs dat volledig zichtbaar is.',
        imageNeedsBetterQuality:
            'Er is een probleem met de beeldkwaliteit van je identiteitsbewijs. Upload alsjeblieft een nieuwe afbeelding waarop je volledige identiteitsbewijs duidelijk zichtbaar is.',
        selfieIssue: 'Er is een probleem met je selfie/video. Upload alsjeblieft een live selfie/video.',
        selfieNotMatching: 'Je selfie/video komt niet overeen met je ID. Upload een nieuwe selfie/video waarop je gezicht duidelijk zichtbaar is.',
        selfieNotLive: 'Je selfie/video lijkt geen live foto/video te zijn. Upload alstublieft een live selfie/video.',
    },
    additionalDetailsStep: {
        headerTitle: 'Aanvullende details',
        helpText: 'We moeten de volgende informatie bevestigen voordat je geld kunt verzenden en ontvangen vanuit je wallet.',
        helpTextIdologyQuestions: 'We moeten je nog maar een paar vragen stellen om je identiteit volledig te verifiëren.',
        helpLink: 'Meer informatie over waarom we dit nodig hebben.',
        legalFirstNameLabel: 'Wettelijke voornaam',
        legalMiddleNameLabel: 'Wettelijke tweede voornaam',
        legalLastNameLabel: 'Wettelijke achternaam',
        selectAnswer: 'Selecteer een reactie om door te gaan',
        ssnFull9Error: 'Voer een geldig sofinummer van negen cijfers in',
        needSSNFull9: 'We hebben moeite om uw SSN te verifiëren. Voer alstublieft alle negen cijfers van uw SSN in.',
        weCouldNotVerify: 'We konden dit niet verifiëren',
        pleaseFixIt: 'Corrigeer deze informatie voordat je verdergaat',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `We konden je identiteit niet verifiëren. Probeer het later opnieuw of neem contact op met <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> als je vragen hebt.`,
    },
    termsStep: {
        headerTitle: 'Voorwaarden en kosten',
        headerTitleRefactor: 'Kosten en voorwaarden',
        haveReadAndAgreePlain: 'Ik heb gelezen en ga akkoord om elektronische bekendmakingen te ontvangen.',
        haveReadAndAgree: `Ik heb gelezen en ga akkoord met het ontvangen van <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">elektronische openbaarmakingen</a>.`,
        agreeToThePlain: 'Ik ga akkoord met het Privacy- en Wallet-contract.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `Ik ga akkoord met de <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Privacy</a> en de <a href="${walletAgreementUrl}">Wallet-overeenkomst</a>.`,
        enablePayments: 'Betalingen inschakelen',
        monthlyFee: 'Maandelijkse vergoeding',
        inactivity: 'Inactiviteit',
        noOverdraftOrCredit: 'Geen roodstand-/kredietfunctie.',
        electronicFundsWithdrawal: 'Elektronische geldopname',
        standard: 'Standaard',
        reviewTheFees: 'Bekijk enkele vergoedingen.',
        checkTheBoxes: 'Vink de vakjes hieronder aan.',
        agreeToTerms: 'Ga akkoord met de voorwaarden en je bent er helemaal klaar voor!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `De Expensify Wallet wordt uitgegeven door ${walletProgram}.`,
            perPurchase: 'Per aankoop',
            atmWithdrawal: 'Geldopname bij geldautomaat',
            cashReload: 'Contant opwaarderen',
            inNetwork: 'Binnen netwerk',
            outOfNetwork: 'buiten het netwerk',
            atmBalanceInquiry: 'Saldo-opvraag bij geldautomaat (binnen of buiten netwerk)',
            customerService: 'Klantenservice (geautomatiseerd of live medewerker)',
            inactivityAfterTwelveMonths: 'Inactiviteit (na 12 maanden zonder transacties)',
            weChargeOneFee: 'We rekenen 1 ander type vergoeding aan. Het is:',
            fdicInsurance: 'Je geld komt in aanmerking voor FDIC-verzekering.',
            generalInfo: `Voor algemene informatie over prepaidrekeningen gaat u naar <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Ga voor details en voorwaarden van alle kosten en diensten naar <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> of bel +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Elektronische fondsenafschrijving (direct)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min. ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Een lijst met alle Expensify Wallet-kosten',
            typeOfFeeHeader: 'Alle vergoedingen',
            feeAmountHeader: 'Bedrag',
            moreDetailsHeader: 'Details',
            openingAccountTitle: 'Een account openen',
            openingAccountDetails: 'Er zijn geen kosten verbonden aan het openen van een account.',
            monthlyFeeDetails: 'Er zijn geen maandelijkse kosten.',
            customerServiceTitle: 'Klantenservice',
            customerServiceDetails: 'Er zijn geen kosten voor klantenservice.',
            inactivityDetails: 'Er zijn geen inactiviteitskosten.',
            sendingFundsTitle: 'Geld verzenden naar een andere rekeninghouder',
            sendingFundsDetails: 'Er worden geen kosten in rekening gebracht om geld naar een andere rekeninghouder te sturen met je saldo, bankrekening of betaalpas.',
            electronicFundsStandardDetails:
                'Er zijn geen kosten verbonden aan het overboeken van geld van je Expensify Wallet naar je bankrekening met de standaardoptie. Deze overboeking wordt meestal binnen 1–3 werkdagen voltooid.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Er zijn kosten verbonden aan het overmaken van geld van je Expensify Wallet naar je gekoppelde debitcard met de optie voor directe overboeking. Deze overboeking wordt meestal binnen enkele minuten voltooid.' +
                `De vergoeding is ${percentage}% van het over te maken bedrag (met een minimumvergoeding van ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Uw tegoeden komen in aanmerking voor FDIC-verzekering. Uw tegoeden worden aangehouden bij of overgemaakt naar ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, een door de FDIC verzekerde instelling.` +
                `Eenmaal daar zijn je tegoeden verzekerd tot ${amount} door de FDIC in het geval dat ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} failliet gaat, mits aan specifieke vereisten voor depositoverzekering is voldaan en je kaart geregistreerd is. Zie ${CONST.TERMS.FDIC_PREPAID} voor details.`,
            contactExpensifyPayments: `Neem contact op met ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} door te bellen naar +1 833-400-0904, per e-mail via ${CONST.EMAIL.CONCIERGE} of meld u aan op ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Ga voor algemene informatie over prepaidrekeningen naar ${CONST.TERMS.CFPB_PREPAID}. Als u een klacht hebt over een prepaidrekening, bel dan het Consumer Financial Protection Bureau op 1-855-411-2372 of ga naar ${CONST.TERMS.CFPB_COMPLAINT}.`,
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
        checkBackLaterMessage: 'We beoordelen je gegevens nog steeds. Probeer het later opnieuw.',
        continueToPayment: 'Doorgaan naar betaling',
        continueToTransfer: 'Doorgaan met overboeken',
    },
    companyStep: {
        headerTitle: 'Bedrijfsinformatie',
        subtitle: 'Bijna klaar! Voor veiligheidsdoeleinden moeten we enkele gegevens bevestigen:',
        legalBusinessName: 'Wettelijke bedrijfsnaam',
        companyWebsite: 'Bedrijfswebsite',
        taxIDNumber: 'Btw-nummer',
        taxIDNumberPlaceholder: '9 cijfers',
        companyType: 'Bedrijfstype',
        incorporationDate: 'Oprichtingsdatum',
        incorporationState: 'Incorporatiestaat',
        industryClassificationCode: 'Industrieclassificatiecode',
        confirmCompanyIsNot: 'Ik bevestig dat dit bedrijf niet voorkomt op de',
        listOfRestrictedBusinesses: 'lijst met beperkte bedrijven',
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
        personalInfo: 'Persoonlijke info',
        enterYourLegalFirstAndLast: 'Wat is je wettelijke naam?',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Wettelijke achternaam',
        legalName: 'Wettelijke naam',
        enterYourDateOfBirth: 'Wat is je geboortedatum?',
        enterTheLast4: 'Wat zijn de laatste vier cijfers van uw sofinummer?',
        dontWorry: 'Maak je geen zorgen, we voeren geen persoonlijke kredietcontroles uit!',
        last4SSN: 'Laatste 4 van SSN',
        enterYourAddress: 'Wat is je adres?',
        address: 'Adres',
        letsDoubleCheck: 'Laten we nog eens controleren of alles er goed uitziet.',
        byAddingThisBankAccount: 'Door deze bankrekening toe te voegen, bevestig je dat je hebt gelezen, begrijpt en akkoord gaat met',
        whatsYourLegalName: 'Wat is uw wettelijke naam?',
        whatsYourDOB: 'Wat is je geboortedatum?',
        whatsYourAddress: 'Wat is je adres?',
        whatsYourSSN: 'Wat zijn de laatste vier cijfers van uw sofinummer?',
        noPersonalChecks: 'Maak je geen zorgen, hier worden geen persoonlijke kredietchecks uitgevoerd!',
        whatsYourPhoneNumber: 'Wat is je telefoonnummer?',
        weNeedThisToVerify: 'Dit hebben we nodig om je wallet te verifiëren.',
    },
    businessInfoStep: {
        businessInfo: 'Bedrijfsgegevens',
        enterTheNameOfYourBusiness: 'Hoe heet je bedrijf?',
        businessName: 'Juridische bedrijfsnaam',
        enterYourCompanyTaxIdNumber: 'Wat is het btw-nummer van uw bedrijf?',
        taxIDNumber: 'Btw-nummer',
        taxIDNumberPlaceholder: '9 cijfers',
        enterYourCompanyWebsite: 'Wat is de website van je bedrijf?',
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
        letsDoubleCheck: 'Laten we nog eens controleren of alles er goed uitziet.',
        companyAddress: 'Bedrijfsadres',
        listOfRestrictedBusinesses: 'lijst met beperkte bedrijven',
        confirmCompanyIsNot: 'Ik bevestig dat dit bedrijf niet voorkomt op de',
        businessInfoTitle: 'Bedrijfsgegevens',
        legalBusinessName: 'Wettelijke bedrijfsnaam',
        whatsTheBusinessName: 'Wat is de bedrijfsnaam?',
        whatsTheBusinessAddress: 'Wat is het zakelijke adres?',
        whatsTheBusinessContactInformation: 'Wat zijn de zakelijke contactgegevens?',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Wat is het ondernemingsregistratienummer (CRN)?';
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
        whatsTheBusinessAnnualPayment: 'Wat is het jaarlijkse betaalvolume van het bedrijf?',
        whatsYourExpectedAverageReimbursements: 'Wat is je verwachte gemiddelde terugbetalingsbedrag?',
        registrationNumber: 'Registratienummer',
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
                    return 'EU-btw';
            }
        },
        businessAddress: 'Zakelijk adres',
        businessType: 'Bedrijfstype',
        incorporation: 'Oprichting',
        incorporationCountry: 'Land van oprichting',
        incorporationTypeName: 'Rechtsvorm',
        businessCategory: 'Zakelijke categorie',
        annualPaymentVolume: 'Jaarlijks betalingsvolume',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Jaarlijks betalingsvolume in ${currencyCode}`,
        averageReimbursementAmount: 'Gemiddeld terugbetalingsbedrag',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Gemiddeld terugbetalingsbedrag in ${currencyCode}`,
        selectIncorporationType: 'Selecteer type rechtspersoon',
        selectBusinessCategory: 'Bedrijfscategorie selecteren',
        selectAnnualPaymentVolume: 'Selecteer jaarlijks betalingsvolume',
        selectIncorporationCountry: 'Selecteer vestigingsland',
        selectIncorporationState: 'Selecteer oprichtingsstaat',
        selectAverageReimbursement: 'Selecteer gemiddelde terugbetalingsbedrag',
        selectBusinessType: 'Selecteer bedrijfstype',
        findIncorporationType: 'Zoek ondernemingsvorm',
        findBusinessCategory: 'Zakelijke categorie zoeken',
        findAnnualPaymentVolume: 'Jaarlijks betalingsvolume zoeken',
        findIncorporationState: 'Staat van oprichting zoeken',
        findAverageReimbursement: 'Gemiddeld terugbetalingsbedrag zoeken',
        findBusinessType: 'Bedrijfstype zoeken',
        error: {
            registrationNumber: 'Voer een geldig registratienummer in',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return 'Voer een geldig Employer Identification Number (EIN) in';
                    case CONST.COUNTRY.CA:
                        return 'Geef een geldig bedrijfsnummer (BN) op';
                    case CONST.COUNTRY.GB:
                        return 'Voer een geldig btw-registratienummer (VRN) in';
                    case CONST.COUNTRY.AU:
                        return 'Voer een geldig Australisch Business Number (ABN) in';
                    default:
                        return 'Voer een geldig EU-btw-nummer in.';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `Bezit je 25% of meer van ${companyName}?`,
        doAnyIndividualOwn25percent: (companyName: string) => `Bezitten één of meer personen 25% of meer van ${companyName}?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Zijn er meer personen die 25% of meer van ${companyName} bezitten?`,
        regulationRequiresUsToVerifyTheIdentity: 'De regelgeving verplicht ons de identiteit te verifiëren van iedere persoon die meer dan 25% van het bedrijf bezit.',
        companyOwner: 'Eigenaar van een bedrijf',
        enterLegalFirstAndLastName: 'Wat is de wettelijke naam van de eigenaar?',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Wettelijke achternaam',
        enterTheDateOfBirthOfTheOwner: 'Wat is de geboortedatum van de eigenaar?',
        enterTheLast4: 'Wat zijn de laatste 4 cijfers van het Social Security-nummer van de eigenaar?',
        last4SSN: 'Laatste 4 van SSN',
        dontWorry: 'Maak je geen zorgen, we voeren geen persoonlijke kredietcontroles uit!',
        enterTheOwnersAddress: 'Wat is het adres van de eigenaar?',
        letsDoubleCheck: 'Laten we nog eens controleren of alles er goed uitziet.',
        legalName: 'Wettelijke naam',
        address: 'Adres',
        byAddingThisBankAccount: 'Door deze bankrekening toe te voegen, bevestig je dat je hebt gelezen, begrijpt en akkoord gaat met',
        owners: 'Eigenaren',
    },
    ownershipInfoStep: {
        ownerInfo: 'Eigenaar-info',
        businessOwner: 'Eigenaar van een bedrijf',
        signerInfo: 'Info ondertekenaar',
        doYouOwn: (companyName: string) => `Bezit je 25% of meer van ${companyName}?`,
        doesAnyoneOwn: (companyName: string) => `Bezitten één of meer personen 25% of meer van ${companyName}?`,
        regulationsRequire: 'Regels vereisen dat we de identiteit verifiëren van elke persoon die meer dan 25% van het bedrijf bezit.',
        legalFirstName: 'Wettelijke voornaam',
        legalLastName: 'Wettelijke achternaam',
        whatsTheOwnersName: 'Wat is de wettelijke naam van de eigenaar?',
        whatsYourName: 'Wat is je wettelijke naam?',
        whatPercentage: 'Welk percentage van het bedrijf is eigendom van de eigenaar?',
        whatsYoursPercentage: 'Welk percentage van het bedrijf bezit je?',
        ownership: 'Eigendom',
        whatsTheOwnersDOB: 'Wat is de geboortedatum van de eigenaar?',
        whatsYourDOB: 'Wat is je geboortedatum?',
        whatsTheOwnersAddress: 'Wat is het adres van de eigenaar?',
        whatsYourAddress: 'Wat is je adres?',
        whatAreTheLast: 'Wat zijn de laatste 4 cijfers van het burgerservicenummer (BSN) van de eigenaar?',
        whatsYourLast: 'Wat zijn de laatste 4 cijfers van uw burgerservicenummer (BSN)?',
        whatsYourNationality: 'Wat is uw land van nationaliteit?',
        whatsTheOwnersNationality: 'Wat is het land van nationaliteit van de eigenaar?',
        countryOfCitizenship: 'Nationaliteit',
        dontWorry: 'Maak je geen zorgen, we voeren geen persoonlijke kredietcontroles uit!',
        last4: 'Laatste 4 van SSN',
        whyDoWeAsk: 'Waarom vragen we dit?',
        letsDoubleCheck: 'Laten we nog eens controleren of alles er goed uitziet.',
        legalName: 'Wettelijke naam',
        ownershipPercentage: 'Eigendomspercentage',
        areThereOther: (companyName: string) => `Zijn er andere personen die 25% of meer van ${companyName} bezitten?`,
        owners: 'Eigenaren',
        addCertified: 'Voeg een gecertificeerd organisatieschema toe dat de uiteindelijk belanghebbenden toont',
        regulationRequiresChart:
            'Regelgeving vereist dat we een gewaarmerkte kopie van het eigendomsdiagram verzamelen waarop elke persoon of entiteit staat die 25% of meer van het bedrijf bezit.',
        uploadEntity: 'Diagram van entiteitseigendom uploaden',
        noteEntity: 'Opmerking: Het eigendomsdiagram van de entiteit moet worden ondertekend door uw accountant, juridisch adviseur of notarieel worden bekrachtigd.',
        certified: 'Gecertificeerd eigendomsdiagram van entiteit',
        selectCountry: 'Selecteer land',
        findCountry: 'Land zoeken',
        address: 'Adres',
        chooseFile: 'Bestand kiezen',
        uploadDocuments: 'Extra documentatie uploaden',
        pleaseUpload: 'Upload hieronder aanvullende documentatie om ons te helpen uw identiteit te verifiëren als directe of indirecte eigenaar van 25% of meer van de bedrijfsentiteit.',
        acceptedFiles: 'Geaccepteerde bestandsindelingen: PDF, PNG, JPEG. De totale bestandsgrootte per sectie mag niet groter zijn dan 5 MB.',
        proofOfBeneficialOwner: 'Bewijs van uiteindelijke begunstigde',
        proofOfBeneficialOwnerDescription:
            'Gelieve een ondertekende verklaring en een organisatieschema te verstrekken van een openbaar accountant, notaris of advocaat waarin wordt bevestigd dat iemand 25% of meer van het bedrijf bezit. Deze moeten gedateerd zijn binnen de laatste drie maanden en het licentienummer van de ondertekenaar bevatten.',
        copyOfID: 'Kopie van ID van uiteindelijk belanghebbende',
        copyOfIDDescription: 'Voorbeelden: Paspoort, rijbewijs, enz.',
        proofOfAddress: 'Adresbewijs voor uiteindelijk belanghebbende',
        proofOfAddressDescription: 'Voorbeelden: nutsrekening, huurovereenkomst, enz.',
        codiceFiscale: 'Codice fiscale/belastingnummer',
        codiceFiscaleDescription:
            'Upload alstublieft een video van een locatiebezoek of een opgenomen gesprek met de tekeningsbevoegde. De tekeningsbevoegde moet het volgende verstrekken: volledige naam, geboortedatum, bedrijfsnaam, registratienummer, fiscaal nummer, geregistreerd adres, aard van de bedrijfsactiviteiten en het doel van de rekening.',
    },
    completeVerificationStep: {
        completeVerification: 'Verificatie voltooien',
        confirmAgreements: 'Bevestig hieronder de overeenkomsten.',
        certifyTrueAndAccurate: 'Ik verklaar dat de verstrekte informatie waarheidsgetrouw en nauwkeurig is',
        certifyTrueAndAccurateError: 'Bevestig alstublieft dat de informatie waar en correct is',
        isAuthorizedToUseBankAccount: 'Ik ben gemachtigd om deze zakelijke bankrekening te gebruiken voor zakelijke uitgaven',
        isAuthorizedToUseBankAccountError: 'U moet een gemachtigd leidinggevend functionaris zijn met bevoegdheid om de zakelijke bankrekening te beheren',
        termsAndConditions: 'algemene voorwaarden',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Valideer je bankrekening',
        validateButtonText: 'Valideren',
        validationInputLabel: 'Transactie',
        maxAttemptsReached: 'De validatie voor deze bankrekening is uitgeschakeld vanwege te veel onjuiste pogingen.',
        description: `Binnen 1–2 werkdagen sturen we drie (3) kleine transacties naar je bankrekening vanaf een naam zoals “Expensify, Inc. Validation”.`,
        descriptionCTA: 'Voer hieronder voor elke transactie het bedrag in. Voorbeeld: 1,51.',
        letsChatText: 'Bijna klaar! We hebben je hulp nodig om nog een paar laatste gegevens via de chat te verifiëren. Klaar?',
        enable2FATitle: 'Voorkom fraude, schakel tweefactorauthenticatie (2FA) in',
        enable2FAText: 'We nemen uw beveiliging serieus. Stel nu 2FA in om een extra beveiligingslaag aan uw account toe te voegen.',
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
        letsDoubleCheck: 'Laten we nog even controleren of alles er goed uitziet.',
        thisBankAccount: 'Deze bankrekening wordt gebruikt voor zakelijke betalingen in je workspace',
        accountNumber: 'Rekeningnummer',
        accountHolderNameDescription: 'Volledige naam van bevoegde ondertekenaar',
    },
    signerInfoStep: {
        signerInfo: 'Info ondertekenaar',
        areYouDirector: (companyName: string) => `Ben je directeur bij ${companyName}?`,
        regulationRequiresUs: 'Vanwege regelgeving moeten we verifiëren of de ondertekenaar gemachtigd is om deze actie namens het bedrijf uit te voeren.',
        whatsYourName: 'Wat is je officiële naam',
        fullName: 'Volledige wettelijke naam',
        whatsYourJobTitle: 'Wat is je functietitel?',
        jobTitle: 'Functietitel',
        whatsYourDOB: 'Wat is je geboortedatum?',
        uploadID: 'Identiteitsbewijs en adresbewijs uploaden',
        personalAddress: 'Bewijs van privé-adres (bijv. een energierekening)',
        letsDoubleCheck: 'Laten we nog eens controleren of alles er goed uitziet.',
        legalName: 'Wettelijke naam',
        proofOf: 'Bewijs van privéadres',
        enterOneEmail: (companyName: string) => `Voer het e-mailadres in van een directeur bij ${companyName}`,
        regulationRequiresOneMoreDirector: 'De regelgeving vereist ten minste één extra directeur als ondertekenaar.',
        hangTight: 'Even geduld...',
        enterTwoEmails: (companyName: string) => `Voer de e-mailadressen in van twee directeuren bij ${companyName}`,
        sendReminder: 'Een herinnering sturen',
        chooseFile: 'Bestand kiezen',
        weAreWaiting: 'We wachten tot anderen hun identiteit hebben bevestigd als bestuurders van het bedrijf.',
        id: 'Kopie van ID',
        proofOfDirectors: 'Bewijs van directeur(s)',
        proofOfDirectorsDescription: 'Voorbeelden: Oncorp bedrijfsprofiel of bedrijfsregistratie.',
        codiceFiscale: 'Fiscaal nummer',
        codiceFiscaleDescription: 'Codice Fiscale voor ondertekenaars, gemachtigde gebruikers en uiteindelijk belanghebbenden.',
        PDSandFSG: 'PDS + FSG openbaarmakingsdocumenten',
        PDSandFSGDescription: dedent(`
            Onze samenwerking met Corpay maakt gebruik van een API-koppeling om te profiteren van hun uitgebreide netwerk van internationale bankpartners ter ondersteuning van Wereldwijde Terugbetalingen in Expensify. In overeenstemming met de Australische regelgeving verstrekken wij je hierbij de Financial Services Guide (FSG) en Product Disclosure Statement (PDS) van Corpay.

            Lees de documenten FSG en PDS zorgvuldig door, aangezien ze volledige details en belangrijke informatie bevatten over de producten en diensten die Corpay aanbiedt. Bewaar deze documenten voor toekomstig gebruik.
        `),
        pleaseUpload: 'Upload hieronder extra documentatie om ons te helpen uw identiteit als directeur van het bedrijf te verifiëren.',
        enterSignerInfo: 'Voer ondertekenaargegevens in',
        thisStep: 'Deze stap is voltooid',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `is een ${currency} zakelijke bankrekening die eindigt op ${bankAccountLastFour} aan het koppelen aan Expensify om werknemers te betalen in ${currency}. De volgende stap vereist ondertekenaarsinformatie van een directeur.`,
        error: {
            emailsMustBeDifferent: 'E‑mailadressen moeten verschillend zijn',
        },
    },
    agreementsStep: {
        agreements: 'Overeenkomsten',
        pleaseConfirm: 'Bevestig alstublieft de onderstaande overeenkomsten',
        regulationRequiresUs: 'De regelgeving verplicht ons de identiteit te verifiëren van iedere persoon die meer dan 25% van het bedrijf bezit.',
        iAmAuthorized: 'Ik ben gemachtigd om de zakelijke bankrekening te gebruiken voor zakelijke uitgaven.',
        iCertify: 'Ik verklaar dat de verstrekte informatie waarheidsgetrouw en nauwkeurig is.',
        iAcceptTheTermsAndConditions: `Ik accepteer de <a href="https://cross-border.corpay.com/tc/">algemene voorwaarden</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'Ik ga akkoord met de algemene voorwaarden.',
        accept: 'Accepteren en bankrekening toevoegen',
        iConsentToThePrivacyNotice: 'Ik ga akkoord met de <a href="https://payments.corpay.com/compliance">privacyverklaring</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Ik ga akkoord met de privacyverklaring.',
        error: {
            authorized: 'U moet een gemachtigd leidinggevend functionaris zijn met bevoegdheid om de zakelijke bankrekening te beheren',
            certify: 'Bevestig alstublieft dat de informatie waar en correct is',
            consent: 'Geef uw toestemming voor de privacyverklaring',
        },
    },
    docusignStep: {
        subheader: 'DocuSign-form',
        pleaseComplete:
            'Vul het ACH-machtigingsformulier in via de onderstaande Docusign-link en upload vervolgens de ondertekende kopie hier, zodat we rechtstreeks geld van uw bankrekening kunnen afschrijven.',
        pleaseCompleteTheBusinessAccount: 'Vul alstublieft de automatische incasso-overeenkomst voor de zakelijke rekeningaanvraag in',
        pleaseCompleteTheDirect:
            'Voltooi de automatische incasso-overeenkomst via de onderstaande Docusign-link en upload vervolgens hier de ondertekende versie, zodat we rechtstreeks geld van uw bankrekening kunnen afschrijven.',
        takeMeTo: 'Breng me naar Docusign',
        uploadAdditional: 'Extra documentatie uploaden',
        pleaseUpload: 'Upload alsjeblieft het DEFT-formulier en de Docusign-handtekeningenpagina',
        pleaseUploadTheDirect: 'Upload alstublieft de Direct Debit-arrangement en de Docusign-handtekeningenpagina',
    },
    finishStep: {
        letsFinish: 'Laten we het in de chat afronden!',
        thanksFor:
            'Bedankt voor deze details. Een speciale supportmedewerker zal je informatie nu beoordelen. We komen bij je terug als we nog iets van je nodig hebben, maar neem in de tussentijd gerust contact met ons op als je vragen hebt.',
        iHaveA: 'Ik heb een vraag',
        enable2FA: 'Schakel tweeledige verificatie (2FA) in om fraude te voorkomen',
        weTake: 'We nemen uw beveiliging serieus. Stel nu 2FA in om een extra beveiligingslaag aan uw account toe te voegen.',
        secure: 'Beveilig je account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Een moment',
        explanationLine: 'We controleren je gegevens. Je kunt binnenkort doorgaan met de volgende stappen.',
    },
    session: {
        offlineMessageRetry: 'Het lijkt erop dat je offline bent. Controleer je verbinding en probeer het opnieuw.',
    },
    travel: {
        header: 'Reis boeken',
        title: 'Slim reizen',
        subtitle: 'Gebruik Expensify Travel om de beste reisaanbiedingen te krijgen en al uw zakelijke uitgaven op één plek te beheren.',
        features: {
            saveMoney: 'Bespaar geld op je boekingen',
            alerts: 'Ontvang realtime meldingen als uw reisplannen veranderen',
        },
        bookTravel: 'Reis boeken',
        bookDemo: 'Demo boeken',
        bookADemo: 'Boek een demo',
        toLearnMore: 'voor meer informatie.',
        termsAndConditions: {
            header: 'Voordat we verdergaan...',
            title: 'Algemene voorwaarden',
            label: 'Ik ga akkoord met de algemene voorwaarden',
            subtitle: `Ga akkoord met de Expensify Travel-<a href="${CONST.TRAVEL_TERMS_URL}">voorwaarden</a>.`,
            error: 'Je moet akkoord gaan met de Expensify Travel-voorwaarden om door te gaan',
            defaultWorkspaceError:
                'Je moet een standaardwerkruimte instellen om Expensify Travel in te schakelen. Ga naar Instellingen > Werkruimtes > klik op de drie verticale puntjes naast een werkruimte > Instellen als standaardwerkruimte en probeer het daarna opnieuw!',
        },
        flight: 'Vlucht',
        flightDetails: {
            passenger: 'Passagier',
            layover: (layover: string) => `<muted-text-label>Je hebt een <strong>${layover} tussenstop</strong> vóór deze vlucht</muted-text-label>`,
            takeOff: 'Vertrek',
            landing: 'Landingspagina',
            seat: 'Licentie',
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
            checkOut: 'Check-out',
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
        train: 'Spoor',
        trainDetails: {
            passenger: 'Passagier',
            departs: 'Vertrekt',
            arrives: 'Komt aan',
            coachNumber: 'Stoelnummer',
            seat: 'Licentie',
            fareDetails: 'Details van rit',
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
            `<rbr>Voeg <a href="${phoneErrorMethodsRoute}">een werk-e-mailadres toe als je primaire login</a> om reizen te boeken.</rbr>`,
        domainSelector: {
            title: 'Domein',
            subtitle: 'Kies een domein voor de instelling van Expensify Travel.',
            recommended: 'Aanbevolen',
        },
        domainPermissionInfo: {
            title: 'Domein',
            restriction: (domain: string) =>
                `Je hebt geen toestemming om Expensify Travel in te schakelen voor het domein <strong>${domain}</strong>. Je moet iemand van dat domein vragen om Travel in te schakelen.`,
            accountantInvitation: `Als je accountant bent, overweeg dan om lid te worden van het <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! accountantsprogramma</a> om reizen voor dit domein mogelijk te maken.`,
        },
        publicDomainError: {
            title: 'Aan de slag met Expensify Travel',
            message: `Je moet je zakelijke e‑mail (bijv. name@company.com) gebruiken met Expensify Travel, niet je persoonlijke e‑mail (bijv. name@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel is uitgeschakeld',
            message: `Je beheerder heeft Expensify Travel uitgeschakeld. Volg het reisboekingsbeleid van je bedrijf voor je reisregelingen.`,
        },
        verifyCompany: {
            title: 'We beoordelen je verzoek...',
            message: `We voeren een paar controles uit om te verifiëren dat je account klaar is voor Expensify Travel. We nemen binnenkort contact met je op!`,
            confirmText: 'Begrepen',
            conciergeMessage: ({domain}: {domain: string}) => `Reizen inschakelen is mislukt voor domein: ${domain}. Controleer dit domein en schakel reizen in.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Je vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is geboekt. Bevestigingscode: ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Je ticket voor vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is geannuleerd.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Je ticket voor vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is terugbetaald of gewijzigd.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Je vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate}} is door de luchtvaartmaatschappij geannuleerd.`,
            flightScheduleChangePending: (airlineCode: string) =>
                `De luchtvaartmaatschappij heeft een wijziging in het schema voorgesteld voor vlucht ${airlineCode}; we wachten op bevestiging.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Wijziging van schema bevestigd: vlucht ${airlineCode} vertrekt nu om ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Je vlucht ${airlineCode} (${origin} → ${destination}) op ${startDate} is bijgewerkt.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Uw cabineklasse is bijgewerkt naar ${cabinClass} op vlucht ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `Je stoeltoewijzing op vlucht ${airlineCode} is bevestigd.`,
            flightSeatChanged: (airlineCode: string) => `Je stoeltoewijzing op vlucht ${airlineCode} is gewijzigd.`,
            flightSeatCancelled: (airlineCode: string) => `Uw stoeltoewijzing op vlucht ${airlineCode} is verwijderd.`,
            paymentDeclined: 'Betaling voor uw vluchtboeking is mislukt. Probeer het opnieuw.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Je hebt je ${type}-reservering ${id} geannuleerd.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `De leverancier heeft je ${type}-reservering ${id} geannuleerd.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Je ${type}-reservering is opnieuw geboekt. Nieuwe bevestiging nr.:${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Je ${type}-boeking is bijgewerkt. Bekijk de nieuwe details in het reisschema.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Je treinkaartje voor ${origin} → ${destination} op ${startDate} is terugbetaald. Er wordt een tegoed verwerkt.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Uw treinkaartje voor ${origin} → ${destination} op ${startDate} is omgewisseld.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Je treinticket voor ${origin} → ${destination} op ${startDate} is bijgewerkt.`,
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
            delete: 'Workspace verwijderen',
            settings: 'Instellingen',
            reimburse: 'Terugbetalingen',
            categories: 'Categorieën',
            tags: 'Labels',
            customField1: 'Aangepast veld 1',
            customField2: 'Aangepast veld 2',
            customFieldHint: 'Aangepaste codering toevoegen die van toepassing is op alle uitgaven van dit lid.',
            reports: 'Rapporten',
            reportFields: 'Rapportvelden',
            invoiceFields: 'Factuurvelden',
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
            settlementFrequency: 'Uitbetalingsfrequentie',
            setAsDefault: 'Als standaardwerkruimte instellen',
            defaultNote: `Bonnen die naar ${CONST.EMAIL.RECEIPTS} worden gestuurd, verschijnen in deze workspace.`,
            deleteConfirmation: 'Weet je zeker dat je deze workspace wilt verwijderen?',
            deleteWithCardsConfirmation: 'Weet je zeker dat je deze werkruimte wilt verwijderen? Hierdoor worden alle kaartfeeds en toegewezen kaarten verwijderd.',
            unavailable: 'Onbeschikbare workspace',
            memberNotFound: 'Lid niet gevonden. Gebruik de uitnodigingsknop hierboven om een nieuw lid aan de workspace toe te voegen.',
            notAuthorized: `Je hebt geen toegang tot deze pagina. Als je probeert lid te worden van deze workspace, vraag dan gewoon de eigenaar van de workspace om je als lid toe te voegen. Iets anders aan de hand? Neem contact op met ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Ga naar werkruimte',
            duplicateWorkspace: 'Workspace dupliceren',
            duplicateWorkspacePrefix: 'Dupliceren',
            goToWorkspaces: 'Ga naar werkruimtes',
            clearFilter: 'Filter wissen',
            workspaceName: 'Werkruimte naam',
            workspaceOwner: 'Eigenaar',
            workspaceType: 'Werkruimte-type',
            workspaceAvatar: 'Werkruimte-avatar',
            mustBeOnlineToViewMembers: 'Je moet online zijn om de leden van deze workspace te bekijken.',
            moreFeatures: 'Meer functies',
            requested: 'Aangevraagd',
            distanceRates: 'Afstandstarieven',
            defaultDescription: 'Eén plek voor al je bonnetjes en uitgaven.',
            descriptionHint: 'Deel informatie over deze workspace met alle leden.',
            welcomeNote: 'Gebruik Expensify om je bonnetjes in te dienen voor terugbetaling, bedankt!',
            subscription: 'Abonnement',
            markAsEntered: 'Markeren als handmatig ingevoerd',
            markAsExported: 'Markeren als geëxporteerd',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exporteren naar ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Laten we nog eens controleren of alles er goed uitziet.',
            lineItemLevel: 'Niveau van regelitems',
            reportLevel: 'Rapportniveau',
            topLevel: 'Topniveau',
            appliedOnExport: 'Niet in Expensify geïmporteerd, toegepast bij export',
            shareNote: {
                header: 'Deel je werkruimte met andere leden',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Deel deze QR-code of kopieer de onderstaande link om het leden gemakkelijk te maken toegang tot je werkruimte aan te vragen. Alle verzoeken om deel te nemen aan de werkruimte verschijnen in de <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a>-ruimte voor jouw beoordeling.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Verbind met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Nieuwe verbinding maken',
            reuseExistingConnection: 'Bestaande verbinding hergebruiken',
            existingConnections: 'Bestaande verbindingen',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Omdat je eerder verbinding hebt gemaakt met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, kun je ervoor kiezen een bestaande verbinding opnieuw te gebruiken of een nieuwe aan te maken.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Laatst gesynchroniseerd ${formattedDate}`,
            authenticationError: (connectionName: string) => `Kan geen verbinding maken met ${connectionName} vanwege een authenticatiefout.`,
            learnMore: 'Meer informatie',
            memberAlternateText: 'Rapporten indienen en goedkeuren.',
            adminAlternateText: 'Beheer rapporten en werkruimte-instellingen.',
            auditorAlternateText: 'Bekijk en becommentarieer rapporten.',
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
            defaultCategory: 'Standaardcategorie',
            viewTransactions: 'Transacties weergeven',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Declaraties van ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card-transacties worden automatisch geëxporteerd naar een “Expensify Card Liability Account” dat is aangemaakt met <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">onze integratie</a>.</muted-text-label>`,
            youCantDowngradeInvoicing:
                'Je kunt je abonnement niet downgraden bij een gefactureerd abonnement. Neem contact op met je accountmanager of Concierge om je abonnement te bespreken of wijzigingen aan te brengen.',
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Verbonden met ${organizationName}` : 'Automatiseer reis- en maaltijdbezorgingskosten in uw hele organisatie.',
                sendInvites: 'Uitnodigingen verzenden',
                sendInvitesDescription: 'Deze werkruimteleden hebben nog geen Uber for Business-account. Deselecteer alle leden die je op dit moment niet wilt uitnodigen.',
                confirmInvite: 'Uitnodiging bevestigen',
                manageInvites: 'Uitnodigingen beheren',
                confirm: 'Bevestigen',
                allSet: 'Alles klaar',
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
                centralBillingAccount: 'Centraal factureringsaccount',
                centralBillingDescription: 'Kies waar je alle Uber-bonnetjes wilt importeren.',
                invitationFailure: 'Uitnodigen van lid voor Uber for Business mislukt',
                autoInvite: 'Nieuwe werkruimteleden uitnodigen voor Uber for Business',
                autoRemove: 'Deactiveer verwijderde werkruimteleden in Uber for Business',
                emptyContent: {
                    title: 'Geen openstaande uitnodigingen',
                    subtitle: 'Hoera! We hebben hoog en laag gezocht en konden geen openstaande uitnodigingen vinden.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Stel dagvergoedingen in om de dagelijkse uitgaven van werknemers te beheersen. <a href="${CONST.DEEP_DIVE_PER_DIEM}">Meer informatie</a>.</muted-text>`,
            amount: 'Bedrag',
            deleteRates: () => ({
                one: 'Tarief verwijderen',
                other: 'Tarieven verwijderen',
            }),
            deletePerDiemRate: 'Per diemtarief verwijderen',
            findPerDiemRate: 'Dagvergoedingstarief zoeken',
            areYouSureDelete: () => ({
                one: 'Weet je zeker dat je dit tarief wilt verwijderen?',
                other: 'Weet je zeker dat je deze tarieven wilt verwijderen?',
            }),
            emptyList: {
                title: 'Dagvergoeding',
                subtitle: 'Stel dagvergoedingen in om de dagelijkse uitgaven van werknemers te beheersen. Importeer tarieven uit een spreadsheet om te beginnen.',
            },
            importPerDiemRates: 'Dagvergoedingsbedragen importeren',
            editPerDiemRate: 'Dagvergoedingstarief bewerken',
            editPerDiemRates: 'Vergoedingen voor dagverblijf bewerken',
            editDestinationSubtitle: (destination: string) => `Als je deze bestemming bijwerkt, wordt deze gewijzigd voor alle ${destination} daggeldsubtarieven.`,
            editCurrencySubtitle: (destination: string) => `Het bijwerken van deze valuta zal deze wijzigen voor alle ${destination} per diem-subtarieven.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Stel in hoe uit eigen zak betaalde onkosten worden geëxporteerd naar QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Markeert cheques als ‘later afdrukken’',
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar QuickBooks Desktop.',
            date: 'Exportdatum',
            exportInvoices: 'Facturen exporteren naar',
            exportExpensifyCard: 'Expensify Card-transacties exporteren als',
            account: 'Account',
            accountDescription: 'Kies waar journaalboekingen worden geplaatst.',
            accountsPayable: 'Crediteuren',
            accountsPayableDescription: 'Kies waar u leveranciersfacturen wilt aanmaken.',
            bankAccount: 'Bankrekening',
            notConfigured: 'Niet geconfigureerd',
            bankAccountDescription: 'Kies vanaf waar u cheques wilt verzenden.',
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
                        description: 'Datum waarop het rapport naar QuickBooks Desktop is geëxporteerd.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Datum ingediend',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            exportCheckDescription: 'We maken een gespecificeerde cheque voor elk Expensify-rapport en sturen die vanaf de onderstaande bankrekening.',
            exportJournalEntryDescription: 'We maken een gespecificeerde journaalboeking voor elk Expensify-rapport en boeken deze op de onderstaande rekening.',
            exportVendorBillDescription:
                'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport en voegen deze toe aan de onderstaande rekening. Als deze periode is gesloten, boeken we op de 1e van de eerstvolgende open periode.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop ondersteunt geen belastingen bij het exporteren van journaalposten. Omdat je belastingen hebt ingeschakeld in je werkruimte, is deze exportoptie niet beschikbaar.',
            outOfPocketTaxEnabledError: 'Journaalposten zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Creditcard',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Leveranciersfactuur',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journaalpost',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Controleren',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'We maken een gespecificeerde cheque voor elk Expensify-rapport en sturen die vanaf de onderstaande bankrekening.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'We koppelen de naam van de handelaar op de creditcardtransactie automatisch aan alle bijbehorende leveranciers in QuickBooks. Als er geen leveranciers bestaan, maken we een leverancier ‘Credit Card Misc.’ aan voor de koppeling.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport met de datum van de laatste uitgave, en voegen die toe aan de onderstaande rekening. Als deze periode is afgesloten, boeken we op de 1e van de eerstvolgende open periode.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Kies waar je creditcardtransacties wilt exporteren.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Kies een leverancier om toe te passen op alle creditcardtransacties.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Kies vanaf waar u cheques wilt verzenden.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Facturen van leveranciers zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Cheques zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Journaalposten zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            },
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: 'Voeg de rekening toe in QuickBooks Desktop en synchroniseer de verbinding opnieuw',
            qbdSetup: 'QuickBooks Desktop-instelling',
            requiredSetupDevice: {
                title: 'Kan geen verbinding maken vanaf dit apparaat',
                body1: 'Je moet deze verbinding instellen vanaf de computer waarop je QuickBooks Desktop-bedrijfsbestand wordt gehost.',
                body2: 'Zodra je verbonden bent, kun je vanaf elke locatie synchroniseren en exporteren.',
            },
            setupPage: {
                title: 'Open deze link om te verbinden',
                body: 'Om de installatie te voltooien, opent u de volgende link op de computer waarop QuickBooks Desktop wordt uitgevoerd.',
                setupErrorTitle: 'Er is iets misgegaan',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>De QuickBooks Desktop-verbinding werkt op dit moment niet. Probeer het later opnieuw of <a href="${conciergeLink}">neem contact op met Concierge</a> als het probleem zich blijft voordoen.</centered-text></muted-text>`,
            },
            importDescription: 'Kies welke codeconfiguraties je uit QuickBooks Desktop naar Expensify wilt importeren.',
            classes: 'Klassen',
            items: 'Items',
            customers: 'Klanten/projecten',
            exportCompanyCardsDescription: 'Stel in hoe aankopen met bedrijfskaarten worden geëxporteerd naar QuickBooks Desktop.',
            defaultVendorDescription: 'Stel een standaardleverancier in die wordt toegepast op alle creditcardtransacties bij het exporteren.',
            accountsDescription: 'Je QuickBooks Desktop-rekeningschema wordt in Expensify geïmporteerd als categorieën.',
            accountsSwitchTitle: 'Kies of je nieuwe rekeningen wilt importeren als ingeschakelde of uitgeschakelde categorieën.',
            accountsSwitchDescription: 'Ingeschakelde categorieën zijn beschikbaar voor leden om te selecteren wanneer zij hun onkosten aanmaken.',
            classesDescription: 'Kies hoe QuickBooks Desktop‑klassen in Expensify moeten worden verwerkt.',
            tagsDisplayedAsDescription: 'Regelniveau per post',
            reportFieldsDisplayedAsDescription: 'Rapportniveau',
            customersDescription: 'Kies hoe je QuickBooks Desktop-klanten/projecten in Expensify wilt verwerken.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wordt elke dag automatisch met QuickBooks Desktop gesynchroniseerd.',
                createEntities: 'Entiteiten automatisch aanmaken',
                createEntitiesDescription: 'Expensify maakt automatisch leveranciers aan in QuickBooks Desktop als ze nog niet bestaan.',
            },
            itemsDescription: 'Kies hoe QuickBooks Desktop-items in Expensify moeten worden behandeld.',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer je de uitgaven wilt exporteren:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Toerekening',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak gemaakte uitgaven worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Onkosten uit eigen zak worden geëxporteerd zodra ze zijn betaald',
                },
            },
        },
        qbo: {
            connectedTo: 'Verbonden met',
            importDescription: 'Kies welke coderingsconfiguraties je vanuit QuickBooks Online naar Expensify wilt importeren.',
            classes: 'Klassen',
            locations: 'Locaties',
            customers: 'Klanten/projecten',
            accountsDescription: 'Je QuickBooks Online grootboekschema wordt in Expensify geïmporteerd als categorieën.',
            accountsSwitchTitle: 'Kies of je nieuwe rekeningen wilt importeren als ingeschakelde of uitgeschakelde categorieën.',
            accountsSwitchDescription: 'Ingeschakelde categorieën zijn beschikbaar voor leden om te selecteren wanneer zij hun onkosten aanmaken.',
            classesDescription: 'Kies hoe je QuickBooks Online-klassen in Expensify wilt verwerken.',
            customersDescription: 'Kies hoe je QuickBooks Online-klanten/-projecten in Expensify wilt verwerken.',
            locationsDescription: 'Kies hoe je QuickBooks Online-locaties in Expensify wilt beheren.',
            taxesDescription: 'Kies hoe je QuickBooks Online-belastingen in Expensify wilt afhandelen.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online ondersteunt geen locaties op regelniveau voor cheques of leveranciersfacturen. Als je locaties op regelniveau wilt hebben, zorg er dan voor dat je journaalposten en credit-/debitcarduitgaven gebruikt.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online ondersteunt geen belastingen op journaalboekingen. Wijzig uw exportoptie naar leveranciersfactuur of cheque.',
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
                        description: 'Datum van de meest recente uitgave op het rapport.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport is geëxporteerd naar QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Datum ingediend',
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
            exportOutOfPocketExpensesDescription: 'Stel in hoe uitgaven uit eigen zak worden geëxporteerd naar QuickBooks Online.',
            exportCheckDescription: 'We maken een gespecificeerde cheque voor elk Expensify-rapport en sturen die vanaf de onderstaande bankrekening.',
            exportJournalEntryDescription: 'We maken een gespecificeerde journaalboeking voor elk Expensify-rapport en boeken deze op de onderstaande rekening.',
            exportVendorBillDescription:
                'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport en voegen deze toe aan de onderstaande rekening. Als deze periode is gesloten, boeken we op de 1e van de eerstvolgende open periode.',
            account: 'Account',
            accountDescription: 'Kies waar journaalboekingen worden geplaatst.',
            accountsPayable: 'Crediteuren',
            accountsPayableDescription: 'Kies waar u leveranciersfacturen wilt aanmaken.',
            bankAccount: 'Bankrekening',
            notConfigured: 'Niet geconfigureerd',
            bankAccountDescription: 'Kies vanaf waar u cheques wilt verzenden.',
            creditCardAccount: 'Creditcardrekening',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online ondersteunt geen locaties bij het exporteren van leveranciersfacturen. Omdat je locaties hebt ingeschakeld in je workspace, is deze exportoptie niet beschikbaar.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online ondersteunt geen belastingen op export van journaalposten. Omdat je belastingen hebt ingeschakeld in je werkruimte, is deze exportoptie niet beschikbaar.',
            outOfPocketTaxEnabledError: 'Journaalposten zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wordt elke dag automatisch gesynchroniseerd met QuickBooks Online.',
                inviteEmployees: 'Werknemers uitnodigen',
                inviteEmployeesDescription: 'QuickBooks Online-medewerkers importeren en medewerkers naar deze werkruimte uitnodigen.',
                createEntities: 'Entiteiten automatisch aanmaken',
                createEntitiesDescription:
                    'Expensify maakt automatisch leveranciers aan in QuickBooks Online als ze nog niet bestaan, en maakt automatisch klanten aan bij het exporteren van facturen.',
                reimbursedReportsDescription:
                    'Telkens wanneer een rapport wordt betaald via Expensify ACH, wordt de bijbehorende factuurbetaling aangemaakt in het QuickBooks Online-account hieronder.',
                qboBillPaymentAccount: 'QuickBooks-rekening voor factuurbetaalingen',
                qboInvoiceCollectionAccount: 'QuickBooks-facturainningsrekening',
                accountSelectDescription: 'Kies vanwaar je rekeningen betaalt en wij maken de betaling aan in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Kies waar je factuurbetalingen wilt ontvangen en we maken de betaling aan in QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Debitcard',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Creditcard',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Leveranciersfactuur',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Journaalpost',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Controleren',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'We koppelen de naam van de handelaar op de debetkaarttransactie automatisch aan alle overeenkomende leveranciers in QuickBooks. Als er geen leveranciers bestaan, maken we een leverancier ‘Debit Card Misc.’ aan voor de koppeling.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'We koppelen de naam van de handelaar op de creditcardtransactie automatisch aan alle bijbehorende leveranciers in QuickBooks. Als er geen leveranciers bestaan, maken we een leverancier ‘Credit Card Misc.’ aan voor de koppeling.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'We maken een gespecificeerde leveranciersfactuur voor elk Expensify-rapport met de datum van de laatste uitgave, en voegen die toe aan de onderstaande rekening. Als deze periode is afgesloten, boeken we op de 1e van de eerstvolgende open periode.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Kies waar u debetkaarttransacties wilt exporteren.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Kies waar je creditcardtransacties wilt exporteren.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Kies een leverancier om toe te passen op alle creditcardtransacties.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Facturen van leveranciers zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'Cheques zijn niet beschikbaar wanneer locaties zijn ingeschakeld. Kies een andere exportoptie.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Journaalposten zijn niet beschikbaar wanneer belastingen zijn ingeschakeld. Kies een andere exportoptie.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Kies een geldig account voor export van leveranciersfacturen',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Kies een geldig account voor de export van journaalposten',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Kies een geldig rekeningnummer voor cheque-export',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Om de export van leveranciersfacturen te gebruiken, stel een crediteurenrekening in QuickBooks Online in',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Om journaalpostexport te gebruiken, stel een journaalrekening in in QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Om cheque-export te gebruiken, stel een bankrekening in in QuickBooks Online',
            },
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: 'Voeg de rekening toe in QuickBooks Online en synchroniseer de verbinding opnieuw.',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer je de uitgaven wilt exporteren:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Toerekening',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak gemaakte uitgaven worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Onkosten uit eigen zak worden geëxporteerd zodra ze zijn betaald',
                },
            },
        },
        workspaceList: {
            joinNow: 'Nu lid worden',
            askToJoin: 'Toegang aanvragen',
        },
        xero: {
            organization: 'Xero-organisatie',
            organizationDescription: 'Kies de Xero-organisatie waarvan je gegevens wilt importeren.',
            importDescription: 'Kies welke coderingsconfiguraties je vanuit Xero naar Expensify wilt importeren.',
            accountsDescription: 'Je Xero-rekeningschema wordt als categorieën in Expensify geïmporteerd.',
            accountsSwitchTitle: 'Kies of je nieuwe rekeningen wilt importeren als ingeschakelde of uitgeschakelde categorieën.',
            accountsSwitchDescription: 'Ingeschakelde categorieën zijn beschikbaar voor leden om te selecteren wanneer zij hun onkosten aanmaken.',
            trackingCategories: 'Volgcategorieën',
            trackingCategoriesDescription: 'Kies hoe je Xero-trackingcategorieën in Expensify wilt verwerken.',
            mapTrackingCategoryTo: (categoryName: string) => `Map Xero ${categoryName} naar`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Kies waar ${categoryName} moet worden toegewezen bij het exporteren naar Xero.`,
            customers: 'Opnieuw factureren aan klanten',
            customersDescription:
                'Kies of je klanten in Expensify opnieuw wilt factureren. Je Xero-klantcontacten kunnen aan uitgaven worden gekoppeld en worden naar Xero geëxporteerd als een verkoopfactuur.',
            taxesDescription: 'Kies hoe je Xero-belastingen in Expensify wilt afhandelen.',
            notImported: 'Niet geïmporteerd',
            notConfigured: 'Niet geconfigureerd',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero-contact standaard',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Labels',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Rapportvelden',
            },
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar Xero.',
            purchaseBill: 'Aankoopsfactuur',
            exportDeepDiveCompanyCard:
                'Geëxporteerde uitgaven worden geboekt als banktransacties op de onderstaande Xero-bankrekening en de transactiedata komen overeen met de data op uw bankafschrift.',
            bankTransactions: 'Banktransacties',
            xeroBankAccount: 'Xero-bankrekening',
            xeroBankAccountDescription: 'Kies waar onkosten worden geboekt als banktransacties.',
            exportExpensesDescription: 'Rapporten worden geëxporteerd als een inkoopfactuur met de datum en status die hieronder zijn geselecteerd.',
            purchaseBillDate: 'Aankoopfactuurdatum',
            exportInvoices: 'Facturen exporteren als',
            salesInvoice: 'Verkoopfactuur',
            exportInvoicesDescription: 'Verkoopfacturen tonen altijd de datum waarop de factuur is verzonden.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wordt automatisch elke dag met Xero gesynchroniseerd.',
                purchaseBillStatusTitle: 'Status aankoopfactuur',
                reimbursedReportsDescription:
                    'Telkens wanneer een rapport wordt betaald via Expensify ACH, wordt de bijbehorende factuurbetaling aangemaakt in de onderstaande Xero-account.',
                xeroBillPaymentAccount: 'Xero-betaalrekening voor rekeningen',
                xeroInvoiceCollectionAccount: 'Xero-factuurincassoaccount',
                xeroBillPaymentAccountDescription: 'Kies vanwaar je rekeningen wilt betalen en wij maken de betaling aan in Xero.',
                invoiceAccountSelectorDescription: 'Kies waar je factuurbetalingen wilt ontvangen en wij maken de betaling aan in Xero.',
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
                        description: 'Datum waarop het rapport is geëxporteerd naar Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Datum ingediend',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Status aankoopfactuur',
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
                description: 'Kies wanneer je de uitgaven wilt exporteren:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Toerekening',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak gemaakte uitgaven worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Onkosten uit eigen zak worden geëxporteerd zodra ze zijn betaald',
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
                        description: 'Datum van de meest recente uitgave op het rapport.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Exportdatum',
                        description: 'Datum waarop het rapport naar Sage Intacct is geëxporteerd.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Datum ingediend',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Stel in hoe voorschotten uitgaven worden geëxporteerd naar Sage Intacct.',
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
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Stel een standaardleverancier in die wordt toegepast op ${isReimbursable ? '' : 'niet-'}vergoedbare uitgaven waarvoor geen overeenkomende leverancier bestaat in Sage Intacct.`,
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar Sage Intacct.',
            exportPreferredExporterNote:
                'De voorkeurs­exporteur kan elke werkruimtebeheerder zijn, maar moet ook een domeinbeheerder zijn als je in Domeininstellingen verschillende exportrekeningen instelt voor individuele bedrijfskaarten.',
            exportPreferredExporterSubNote: 'Zodra dit is ingesteld, ziet de voorkeurs-exporteur in zijn account rapporten die klaarstaan voor export.',
            noAccountsFound: 'Geen accounts gevonden',
            noAccountsFoundDescription: `Voeg het account toe in Sage Intacct en synchroniseer de koppeling opnieuw`,
            autoSync: 'Automatisch synchroniseren',
            autoSyncDescription: 'Expensify zal elke dag automatisch synchroniseren met Sage Intacct.',
            inviteEmployees: 'Werknemers uitnodigen',
            inviteEmployeesDescription:
                'Importeer Sage Intacct-medewerkersrecords en nodig medewerkers uit naar deze werkruimte. Uw goedkeuringsworkflow wordt standaard ingesteld op goedkeuring door de manager en kan verder worden geconfigureerd op de pagina Leden.',
            syncReimbursedReports: 'Verzoende rapporten synchroniseren',
            syncReimbursedReportsDescription:
                'Elke keer dat een rapport wordt betaald via Expensify ACH, wordt de bijbehorende factuurbetaling aangemaakt in de Sage Intacct-account hieronder.',
            paymentAccount: 'Sage Intacct-betaalrekening',
            accountingMethods: {
                label: 'Wanneer exporteren',
                description: 'Kies wanneer je de uitgaven wilt exporteren:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Toerekening',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak gemaakte uitgaven worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Onkosten uit eigen zak worden geëxporteerd zodra ze zijn betaald',
                },
            },
        },
        netsuite: {
            subsidiary: 'Dochteronderneming',
            subsidiarySelectDescription: 'Kies de dochteronderneming in NetSuite waarvan je gegevens wilt importeren.',
            exportDescription: 'Configureer hoe Expensify-gegevens worden geëxporteerd naar NetSuite.',
            exportInvoices: 'Facturen exporteren naar',
            journalEntriesTaxPostingAccount: 'Journaalposten belastingboekingsrekening',
            journalEntriesProvTaxPostingAccount: 'Journaalposten rekening voor provinciale belasting',
            foreignCurrencyAmount: 'Buitenlandse valuta bedrag exporteren',
            exportToNextOpenPeriod: 'Exporteren naar volgende open periode',
            nonReimbursableJournalPostingAccount: 'Niet-vergoedbare journaalpostrekening',
            reimbursableJournalPostingAccount: 'Boekhoudrekening voor terugbetaalbare boekingen',
            journalPostingPreference: {
                label: 'Voorkeur voor het boeken van journaalposten',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Enkele, gespecificeerde boeking voor elk rapport',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Eén invoer per uitgave',
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
                        label: 'Datum ingediend',
                        description: 'Datum waarop het rapport ter goedkeuring is ingediend.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Onkostendeclaraties',
                        reimbursableDescription: 'Kosten uit eigen zak worden als onkostendeclaraties naar NetSuite geëxporteerd.',
                        nonReimbursableDescription: 'Uitgaven met bedrijfskaarten worden als onkostenrapporten naar NetSuite geëxporteerd.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Leveranciersfacturen',
                        reimbursableDescription: dedent(`
                            Vergoedingen uit eigen zak worden geëxporteerd als facturen die betaalbaar zijn aan de hieronder opgegeven NetSuite-leverancier.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfspassen*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Uitgaven met bedrijfskaarten worden geëxporteerd als facturen die betaalbaar zijn aan de hieronder opgegeven NetSuite-leverancier.

                            Als je een specifieke leverancier voor elke kaart wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Journaalposten',
                        reimbursableDescription: dedent(`
                            Uitgaven uit eigen zak worden geëxporteerd als journaalboekingen naar de hieronder opgegeven NetSuite-rekening.

                            Als je voor elke kaart een specifieke leverancier wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Uitgaven met bedrijfskaarten worden als journaalposten geëxporteerd naar de hieronder opgegeven NetSuite-rekening.

                            Als je een specifieke leverancier voor elke kaart wilt instellen, ga dan naar *Instellingen > Domeinen > Bedrijfskaarten*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Als je de exportinstelling voor bedrijfskaarten wijzigt naar onkostendeclaraties, worden NetSuite-leveranciers en boekingsrekeningen voor individuele kaarten uitgeschakeld.\n\nMaak je geen zorgen, we bewaren je eerdere selecties voor het geval je later weer wilt terugschakelen.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify zal elke dag automatisch synchroniseren met NetSuite.',
                reimbursedReportsDescription:
                    'Telkens wanneer een rapport wordt betaald via Expensify ACH, wordt de bijbehorende factuurbetaling aangemaakt in de onderstaande NetSuite-account.',
                reimbursementsAccount: 'Vergoedingsrekening',
                reimbursementsAccountDescription: 'Kies de bankrekening die je voor terugbetalingen gaat gebruiken, dan maken wij de bijbehorende betaling in NetSuite aan.',
                collectionsAccount: 'Incassorekening',
                collectionsAccountDescription: 'Zodra een factuur in Expensify als betaald is gemarkeerd en naar NetSuite is geëxporteerd, verschijnt deze op de onderstaande rekening.',
                approvalAccount: 'A/P-goedkeuringsrekening',
                approvalAccountDescription:
                    'Kies de rekening waarop transacties in NetSuite worden goedgekeurd. Als je terugbetaalde rapporten synchroniseert, is dit ook de rekening waarop betalingsnota’s worden geboekt.',
                defaultApprovalAccount: 'NetSuite-standaard',
                inviteEmployees: 'Werknemers uitnodigen en goedkeuringen instellen',
                inviteEmployeesDescription:
                    'Import NetSuite-medewerkersrecords en nodig medewerkers uit naar deze werkruimte. Uw goedkeuringsworkflow wordt standaard ingesteld op goedkeuring door de manager en kan verder worden geconfigureerd op de pagina *Leden*.',
                autoCreateEntities: 'Automatisch medewerkers/leveranciers aanmaken',
                enableCategories: 'Nieuw geïmporteerde categorieën inschakelen',
                customFormID: 'Aangepaste formulier-ID',
                customFormIDDescription:
                    'Standaard zal Expensify boekingen aanmaken met behulp van het voorkeursformulier voor transacties dat is ingesteld in NetSuite. Als alternatief kun je een specifiek transactieformulier aanwijzen dat moet worden gebruikt.',
                customFormIDReimbursable: 'Uit eigen zak gemaakte uitgave',
                customFormIDNonReimbursable: 'Uitgave met bedrijfskaart',
                exportReportsTo: {
                    label: 'Goedkeuringsniveau voor onkostendeclaratie',
                    description:
                        'Zodra een onkostendeclaratie in Expensify is goedgekeurd en naar NetSuite is geëxporteerd, kun je in NetSuite een extra goedkeuringsniveau instellen voordat deze wordt geboekt.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite-standaardvoorkeur',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Alleen door supervisor goedgekeurd',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Alleen boekhouding goedgekeurd',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Supervisor en boekhouding goedgekeurd',
                    },
                },
                accountingMethods: {
                    label: 'Wanneer exporteren',
                    description: 'Kies wanneer je de uitgaven wilt exporteren:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Toerekening',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Contant',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Uit eigen zak gemaakte uitgaven worden geëxporteerd zodra ze definitief zijn goedgekeurd',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Onkosten uit eigen zak worden geëxporteerd zodra ze zijn betaald',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Goedkeuringsniveau voor leveranciersfacturen',
                    description:
                        'Zodra een leveranciersfactuur in Expensify is goedgekeurd en naar NetSuite is geëxporteerd, kun je in NetSuite een extra goedkeuringsniveau instellen voordat deze wordt geboekt.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite-standaardvoorkeur',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'In afwachting van goedkeuring',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Goedgekeurd voor boeken',
                    },
                },
                exportJournalsTo: {
                    label: 'Goedkeuringsniveau journaalboeking',
                    description:
                        'Zodra een journaalpost in Expensify is goedgekeurd en naar NetSuite is geëxporteerd, kun je in NetSuite een extra goedkeuringsniveau instellen voordat je deze boekt.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite-standaardvoorkeur',
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
                title: 'NetSuite-instellingen',
                formSteps: {
                    installBundle: {
                        title: 'Installeer de Expensify-bundel',
                        description: 'Ga in NetSuite naar *Customization > SuiteBundler > Search & Install Bundles* > zoek naar "Expensify" > installeer de bundle.',
                    },
                    enableTokenAuthentication: {
                        title: 'Token-gebaseerde verificatie inschakelen',
                        description: 'Ga in NetSuite naar *Setup > Company > Enable Features > SuiteCloud* > schakel *token-based authentication* in.',
                    },
                    enableSoapServices: {
                        title: 'SOAP-webservices inschakelen',
                        description: 'Ga in NetSuite naar *Setup > Company > Enable Features > SuiteCloud* en schakel *SOAP Web Services* in.',
                    },
                    createAccessToken: {
                        title: 'Maak een toegangstoken',
                        description:
                            'Ga in NetSuite naar *Setup > Users/Roles > Access Tokens* en maak een access token aan voor de app "Expensify" en de rol "Expensify Integration" of "Administrator".\n\n*Belangrijk:* Zorg ervoor dat je de *Token ID* en *Token Secret* van deze stap opslaat. Je hebt deze nodig voor de volgende stap.',
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
                expenseCategoriesDescription: 'Je NetSuite-uitgavencategorieën worden als categorieën in Expensify geïmporteerd.',
                crossSubsidiaryCustomers: 'Klantprojecten tussen dochtermaatschappijen',
                importFields: {
                    departments: {
                        title: 'Afdelingen',
                        subtitle: 'Kies hoe je de NetSuite-*afdelingen* in Expensify wilt verwerken.',
                    },
                    classes: {
                        title: 'Klassen',
                        subtitle: 'Kies hoe je met *classes* omgaat in Expensify.',
                    },
                    locations: {
                        title: 'Locaties',
                        subtitle: 'Kies hoe je *locaties* in Expensify wilt verwerken.',
                    },
                },
                customersOrJobs: {
                    title: 'Klanten/projecten',
                    subtitle: 'Kies hoe je NetSuite-*customers* en *projects* in Expensify wilt verwerken.',
                    importCustomers: 'Klanten importeren',
                    importJobs: 'Projecten importeren',
                    customers: 'klanten',
                    jobs: 'projecten',
                    label: (importFields: string[], importType: string) => `${importFields.join('en')}, ${importType}`,
                },
                importTaxDescription: 'Belastinggroepen uit NetSuite importeren.',
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
                            customSegmentNameFooter: `Je kunt aangepaste segmentnamen vinden in NetSuite op de pagina *Customizations > Links, Records & Fields > Custom Segments*.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Je kunt aangepaste recordnamen in NetSuite vinden door “Transaction Column Field” in de globale zoekfunctie in te voeren.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Wat is de interne ID?',
                            customSegmentInternalIDFooter: `Zorg er eerst voor dat je interne ID’s hebt ingeschakeld in NetSuite onder *Home > Set Preferences > Show Internal ID.*

Je kunt de interne ID’s van aangepaste segmenten in NetSuite vinden onder:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klik op een aangepast segment.
3. Klik op de hyperlink naast *Custom Record Type*.
4. Zoek de interne ID in de tabel onderaan.

_Voor meer gedetailleerde instructies, [bezoek onze helppagina](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Je kunt interne ID's van aangepaste records in NetSuite vinden door de volgende stappen te volgen:

1. Voer "Transaction Line Fields" in via de globale zoekfunctie.
2. Klik op een aangepast record.
3. Zoek de interne ID aan de linkerkant.

_Voor meer gedetailleerde instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Wat is de script-ID?',
                            customSegmentScriptIDFooter: `Je kunt aangepaste segmentscript-ID’s in NetSuite vinden onder:

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Klik op een aangepast segment.
3. Klik op het tabblad *Application and Sourcing* onderaan en doe vervolgens het volgende:
    a. Als je het aangepaste segment als een *tag* (op regelitemniveau) in Expensify wilt weergeven, klik je op het subtabblad *Transaction Columns* en gebruik je de *Field ID*.
    b. Als je het aangepaste segment als een *report field* (op rapportniveau) in Expensify wilt weergeven, klik je op het subtabblad *Transactions* en gebruik je de *Field ID*.

_Voor meer gedetailleerde instructies, [bezoek onze help-site](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Wat is de transactiekolom-ID?',
                            customRecordScriptIDFooter: `Je kunt aangepaste recordscript-ID’s in NetSuite vinden onder:

1. Voer "Transaction Line Fields" in in de globale zoekfunctie.
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
                            transactionFieldIDTitle: 'Wat is de transactievield-ID?',
                            transactionFieldIDFooter: `Je kunt transactievak-ID's in NetSuite vinden door deze stappen te volgen:

1. Voer "Transaction Line Fields" in in de globale zoekfunctie.
2. Klik op een aangepaste lijst.
3. Zoek de transactievak-ID aan de linkerkant.

_Voor gedetailleerdere instructies, [bezoek onze helpsite](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
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
                            `Als je ${importField} in NetSuite gebruikt, passen we de standaardwaarde die is ingesteld op de werknemerskaart toe bij het exporteren naar Expense Report of Journal Entry.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Labels',
                        description: 'Niveau van regelitems',
                        footerContent: (importField: string) => `${startCase(importField)} zal selecteerbaar zijn voor elke afzonderlijke onkost in het rapport van een werknemer.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Rapportvelden',
                        description: 'Rapportniveau',
                        footerContent: (importField: string) => `${startCase(importField)}-selectie is van toepassing op alle onkosten op het rapport van een werknemer.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct-instellingen',
            prerequisitesTitle: 'Voordat u verbinding maakt...',
            downloadExpensifyPackage: 'Download het Expensify-pakket voor Sage Intacct',
            followSteps: 'Volg de stappen in onze instructies ‘How-to: Connect to Sage Intacct’',
            enterCredentials: 'Voer je Sage Intacct-inloggegevens in',
            entity: 'Entiteit',
            employeeDefault: 'Standaardinstelling voor Sage Intacct-medewerker',
            employeeDefaultDescription: 'De standaardafdeling van de medewerker wordt toegepast op zijn/haar uitgaven in Sage Intacct, indien deze bestaat.',
            displayedAsTagDescription: 'Afdeling zal selecteerbaar zijn voor elke afzonderlijke uitgave op het rapport van de werknemer.',
            displayedAsReportFieldDescription: 'De selectie van een afdeling wordt toegepast op alle onkosten in het rapport van een medewerker.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Kies hoe je Sage Intacct-<strong>${mappingTitle}</strong> in Expensify wilt afhandelen.`,
            expenseTypes: 'Kostentypen',
            expenseTypesDescription: 'Uw Sage Intacct-onkostypen worden als categorieën in Expensify geïmporteerd.',
            accountTypesDescription: 'Uw Sage Intacct-rekeningschema wordt in Expensify geïmporteerd als categorieën.',
            importTaxDescription: 'Importeer aankoopbelastingtarief uit Sage Intacct.',
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
                        return 'locaties';
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
            collect: 'Incasseren',
        },
        companyCards: {
            addCards: 'Kaarten toevoegen',
            selectCards: 'Kaarten selecteren',
            addNewCard: {
                other: 'Overig',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard Zakelijke Kaarten',
                    vcf: 'Visa Zakelijke Kaarten',
                    stripe: 'Stripe-kaarten',
                },
                yourCardProvider: `Wie is uw kaartuitgever?`,
                whoIsYourBankAccount: 'Wat is je bank?',
                whereIsYourBankLocated: 'Waar bevindt zich jouw bank?',
                howDoYouWantToConnect: 'Hoe wil je verbinding maken met je bank?',
                learnMoreAboutOptions: `<muted-text>Lees meer over deze <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">opties</a>.</muted-text>`,
                commercialFeedDetails: 'Vereist een koppeling met uw bank. Dit wordt meestal gebruikt door grotere bedrijven en is vaak de beste optie als u in aanmerking komt.',
                commercialFeedPlaidDetails: `Vereist een koppeling met je bank, maar wij begeleiden je daarbij. Dit is meestal beperkt tot grotere bedrijven.`,
                directFeedDetails: 'De eenvoudigste aanpak. Maak direct verbinding met behulp van je hoofdreferenties. Deze methode komt het meest voor.',
                enableFeed: {
                    title: (provider: string) => `Schakel je ${provider}-feed in`,
                    heading:
                        'We hebben een directe integratie met uw kaartuitgever en kunnen uw transactiegegevens snel en nauwkeurig in Expensify importeren.\n\nOm te beginnen hoeft u alleen maar:',
                    visa: 'We hebben wereldwijde integraties met Visa, al verschilt de geschiktheid per bank en kaartprogramma.\n\nOm te beginnen, hoeft u alleen maar:',
                    mastercard: 'We hebben wereldwijde integraties met Mastercard, al verschilt de geschiktheid per bank en kaartprogramma.\n\nOm te beginnen hoeft u alleen maar:',
                    vcf: `1. Bezoek [dit helpartikel](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) voor gedetailleerde instructies over het instellen van je Visa Commercial Cards.

2. [Neem contact op met je bank](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) om te verifiëren dat ze een commerciële feed voor je programma ondersteunen, en vraag hen om deze in te schakelen.

3. *Zodra de feed is ingeschakeld en je de details ervan hebt, ga je verder naar het volgende scherm.*`,
                    gl1025: `1. Bezoek [dit hulpartikel](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) om te zien of American Express een commerciële feed voor uw programma kan inschakelen.

2. Zodra de feed is ingeschakeld, stuurt Amex u een productietoestemming.

3. *Zodra u de feedinformatie heeft, gaat u verder naar het volgende scherm.*`,
                    cdf: `1. Bezoek [dit helpartikel](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) voor gedetailleerde instructies over het instellen van je Mastercard Commercial Cards.

2. [Neem contact op met je bank](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) om te verifiëren dat ze een commerciële feed voor je programma ondersteunen en vraag hen om deze te activeren.

3. *Zodra de feed is geactiveerd en je de details hebt, ga je verder naar het volgende scherm.*`,
                    stripe: `1. Ga naar de Stripe-dashboard en ga naar [Instellingen](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Klik onder Productintegraties op Inschakelen naast Expensify.

3. Zodra de feed is ingeschakeld, klik hieronder op Verzenden en wij gaan ermee aan de slag om deze toe te voegen.`,
                },
                whatBankIssuesCard: 'Welke bank geeft deze kaarten uit?',
                enterNameOfBank: 'Voer de naam van de bank in',
                feedDetails: {
                    vcf: {
                        title: 'Wat zijn de details van de Visa-feed?',
                        processorLabel: 'Processor-ID',
                        bankLabel: 'Id van financiële instelling (bank)',
                        companyLabel: 'Bedrijfs-ID',
                        helpLabel: "Waar kan ik deze ID's vinden?",
                    },
                    gl1025: {
                        title: `Wat is de naam van het Amex-leveringsbestand?`,
                        fileNameLabel: 'Naam van afleverbestand',
                        helpLabel: 'Waar kan ik de bestandsnaam van de levering vinden?',
                    },
                    cdf: {
                        title: `Wat is het Mastercard-distributie-ID?`,
                        distributionLabel: 'Distributie-ID',
                        helpLabel: 'Waar vind ik de distributie-ID?',
                    },
                },
                amexCorporate: 'Selecteer dit als op de voorkant van je kaarten “Corporate” staat',
                amexBusiness: 'Selecteer dit als er op de voorkant van je kaarten “Business” staat',
                amexPersonal: 'Selecteer dit als je kaarten persoonlijk zijn',
                error: {
                    pleaseSelectProvider: 'Selecteer een kaartaanbieder voordat je doorgaat',
                    pleaseSelectBankAccount: 'Selecteer een bankrekening voordat je verdergaat',
                    pleaseSelectBank: 'Selecteer een bank voordat je doorgaat',
                    pleaseSelectCountry: 'Selecteer een land voordat je verdergaat',
                    pleaseSelectFeedType: 'Selecteer een feedtype voordat je doorgaat',
                },
                exitModal: {
                    title: 'Werkt er iets niet?',
                    prompt: 'We hebben gemerkt dat je het toevoegen van je kaarten niet hebt afgerond. Als je een probleem bent tegengekomen, laat het ons weten zodat we kunnen helpen alles weer op de rails te krijgen.',
                    confirmText: 'Probleem met rapport',
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
            feedName: (feedName: string) => `${feedName}-kaarten`,
            directFeed: 'Directe feed',
            whoNeedsCardAssigned: 'Wie heeft een kaart toegewezen nodig?',
            chooseTheCardholder: 'Kies de kaarthouder',
            chooseCard: 'Kies een kaart',
            chooseCardFor: (assignee: string) =>
                `Kies een kaart voor <strong>${assignee}</strong>. Kun je de kaart die je zoekt niet vinden? <concierge-link>Laat het ons weten.</concierge-link>`,
            noActiveCards: 'Geen actieve kaarten in deze feed',
            somethingMightBeBroken:
                '<muted-text><centered-text>Of er is iets mis. Hoe dan ook, als je vragen hebt, kun je altijd <concierge-link>contact opnemen met Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Kies een startdatum voor transacties',
            startDateDescription: 'We importeren alle transacties vanaf deze datum. Als er geen datum is opgegeven, gaan we zo ver terug als je bank toestaat.',
            fromTheBeginning: 'Vanaf het begin',
            customStartDate: 'Aangepaste startdatum',
            customCloseDate: 'Aangepaste einddatum',
            letsDoubleCheck: 'Laten we nog eens controleren of alles er goed uitziet.',
            confirmationDescription: 'We beginnen onmiddellijk met het importeren van transacties.',
            card: 'Kaart',
            cardName: 'Kaartnaam',
            brokenConnectionError: '<rbr>De kaartfeedverbinding is verbroken. <a href="#">Log in bij uw bank</a> zodat we de verbinding opnieuw kunnen herstellen.</rbr>',
            assignedCard: (assignee: string, link: string) => `heeft ${assignee} een ${link} toegewezen! Geïmporteerde transacties verschijnen in deze chat.`,
            companyCard: 'bedrijfskaart',
            chooseCardFeed: 'Kaartfeed kiezen',
            ukRegulation:
                'Expensify Limited is een agent van Plaid Financial Ltd., een erkende betalingsinstelling die wordt gereguleerd door de Financial Conduct Authority onder de Payment Services Regulations 2017 (Firm Reference Number: 804718). Plaid biedt u gereguleerde rekeninginformatiediensten via Expensify Limited als haar agent.',
            assign: 'Toewijzen',
            assignCardFailedError: 'Toewijzing van kaart mislukt.',
            cardAlreadyAssignedError: 'This card is already assigned to a user in another workspace.',
            editStartDateDescription:
                'Kies een nieuwe startdatum voor transacties. We synchroniseren alle transacties vanaf die datum, met uitzondering van de transacties die we al hebben geïmporteerd.',
            unassignCardFailedError: 'Kaartontkoppeling mislukt.',
            importTransactions: {
                title: 'Transacties importeren uit bestand',
                description: 'Pas de instellingen voor je bestand aan die bij het importeren worden toegepast.',
                cardDisplayName: 'Kaartweergavenaam',
                currency: 'Valuta',
                transactionsAreReimbursable: 'Transacties zijn terugbetaalbaar',
                flipAmountSign: 'Teken van bedrag omdraaien',
                importButton: 'Transacties importeren',
            },
            error: {
                workspaceFeedsCouldNotBeLoadedTitle: 'Kan kaartfeeds niet laden',
                workspaceFeedsCouldNotBeLoadedMessage:
                    'Er is een fout opgetreden bij het laden van de kaartfeeds van de werkruimte. Probeer het opnieuw of neem contact op met uw beheerder.',
                feedCouldNotBeLoadedTitle: 'Kon deze feed niet laden',
                feedCouldNotBeLoadedMessage: 'Er is een fout opgetreden bij het laden van deze feed. Probeer het opnieuw of neem contact op met uw beheerder.',
                tryAgain: 'Opnieuw proberen',
            },
        },
        expensifyCard: {
            issueAndManageCards: 'Uw Expensify Cards uitgeven en beheren',
            getStartedIssuing: 'Begin door je eerste virtuele of fysieke kaart uit te geven.',
            verificationInProgress: 'Verificatie wordt uitgevoerd...',
            verifyingTheDetails: 'We controleren een paar gegevens. Concierge laat je weten wanneer Expensify Cards klaar zijn om uit te geven.',
            disclaimer:
                'De Expensify Visa® Commercial Card wordt uitgegeven door The Bancorp Bank, N.A., lid FDIC, op grond van een licentie van Visa U.S.A. Inc. en kan mogelijk niet bij alle handelaren worden gebruikt die Visa-kaarten accepteren. Apple® en het Apple-logo® zijn handelsmerken van Apple Inc., geregistreerd in de VS en andere landen. App Store is een dienstmerk van Apple Inc. Google Play en het Google Play-logo zijn handelsmerken van Google LLC.',
            euUkDisclaimer:
                'Kaarten verstrekt aan ingezetenen van de EER worden uitgegeven door Transact Payments Malta Limited en kaarten verstrekt aan ingezetenen van het VK worden uitgegeven door Transact Payments Limited krachtens een licentie van Visa Europe Limited. Transact Payments Malta Limited is naar behoren gemachtigd en gereguleerd door de Malta Financial Services Authority als een financiële instelling onder de Financial Institution Act 1994. Registratienummer C 91879. Transact Payments Limited is gemachtigd en gereguleerd door de Gibraltar Financial Service Commission.',
            issueCard: 'Kaart uitgeven',
            findCard: 'Kaart zoeken',
            newCard: 'Nieuwe kaart',
            name: 'Naam',
            lastFour: 'Laatste 4',
            limit: 'Limiet',
            currentBalance: 'Huidig saldo',
            currentBalanceDescription: 'Huidige saldo is de som van alle geboekte Expensify Card-transacties die hebben plaatsgevonden sinds de laatste afwikkelingsdatum.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Saldo wordt verrekend op ${settlementDate}`,
            settleBalance: 'Saldo vereffenen',
            cardLimit: 'Kaartlimiet',
            remainingLimit: 'Resterende limiet',
            requestLimitIncrease: 'Verzoek limietverhoging',
            remainingLimitDescription:
                'We houden rekening met een aantal factoren bij het berekenen van je resterende limiet: je looptijd als klant, de zakelijke informatie die je hebt verstrekt tijdens het aanmelden en het beschikbare saldo op je zakelijke bankrekening. Je resterende limiet kan dagelijks fluctueren.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Het cashback-saldo is gebaseerd op de afgehandelde maandelijkse Expensify Card-uitgaven binnen je workspace.',
            issueNewCard: 'Nieuwe kaart uitgeven',
            finishSetup: 'Setup voltooien',
            chooseBankAccount: 'Kies bankrekening',
            chooseExistingBank: 'Kies een bestaande zakelijke bankrekening om je Expensify Card‑saldo te betalen, of voeg een nieuwe bankrekening toe',
            accountEndingIn: 'Rekening eindigend op',
            addNewBankAccount: 'Nieuwe bankrekening toevoegen',
            settlementAccount: 'Verrekeningsrekening',
            settlementAccountDescription: 'Kies een rekening om het saldo van je Expensify Card te betalen.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Zorg ervoor dat deze rekening overeenkomt met uw <a href="${reconciliationAccountSettingsLink}">Reconciliatierekening</a> (${accountNumber}), zodat Continue Reconciliëren goed werkt.`,
            settlementFrequency: 'Uitbetalingsfrequentie',
            settlementFrequencyDescription: 'Kies hoe vaak je je Expensify Card-saldo wilt betalen.',
            settlementFrequencyInfo:
                'Als je wilt overschakelen naar maandelijkse afhandeling, moet je je bankrekening via Plaid koppelen en een positieve saldohistorie van 90 dagen hebben.',
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
                `Als je de limiet van deze kaart wijzigt naar ${limit}, worden nieuwe transacties geweigerd totdat je meer uitgaven op de kaart goedkeurt.`,
            monthlyLimitWarning: (limit: number | string) => `Als je de limiet van deze kaart wijzigt naar ${limit}, worden nieuwe transacties tot volgende maand geweigerd.`,
            fixedLimitWarning: (limit: number | string) => `Als je de limiet van deze kaart wijzigt naar ${limit}, worden nieuwe transacties geweigerd.`,
            changeCardLimitType: 'Type limiet wijzigen',
            changeLimitType: 'Limiettype wijzigen',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `Als je het limiettype van deze kaart wijzigt naar Slimme limiet, worden nieuwe transacties geweigerd omdat de niet-goedgekeurde limiet van ${limit} al is bereikt.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Als je het limiettype van deze kaart wijzigt naar Maandelijks, worden nieuwe transacties geweigerd omdat de maandelijkse limiet van ${limit} al is bereikt.`,
            addShippingDetails: 'Verzendgegevens toevoegen',
            issuedCard: (assignee: string) => `heeft een Expensify Card uitgegeven aan ${assignee}! De kaart wordt binnen 2-3 werkdagen bezorgd.`,
            issuedCardNoShippingDetails: (assignee: string) => `heeft ${assignee} een Expensify Card uitgegeven! De kaart wordt verzonden zodra de verzendgegevens zijn bevestigd.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `heeft ${assignee} een virtuele Expensify Card uitgegeven! De ${link} kan meteen worden gebruikt.`,
            addedShippingDetails: (assignee: string) => `${assignee} heeft verzendgegevens toegevoegd. Expensify Card wordt binnen 2-3 werkdagen bezorgd.`,
            replacedCard: (assignee: string) => `${assignee} heeft hun Expensify Card vervangen. De nieuwe kaart wordt binnen 2-3 werkdagen bezorgd.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} heeft hun virtuele Expensify Card vervangen! De ${link} kan direct worden gebruikt.`,
            card: 'kaart',
            replacementCard: 'vervangingskaart',
            verifyingHeader: 'Verifiëren',
            bankAccountVerifiedHeader: 'Bankrekening geverifieerd',
            verifyingBankAccount: 'Bankrekening verifiëren...',
            verifyingBankAccountDescription: 'Wacht even terwijl we bevestigen dat deze account kan worden gebruikt om Expensify Cards uit te geven.',
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
            defaultSpendCategories: 'Standaarduitgaven-categorieën',
            spendCategoriesDescription: 'Pas aan hoe uitgaven bij leveranciers worden gecategoriseerd voor creditcardtransacties en gescande bonnetjes.',
            deleteFailureMessage: 'Er is een fout opgetreden bij het verwijderen van de categorie, probeer het opnieuw.',
            categoryName: 'Categorienaam',
            requiresCategory: 'Leden moeten alle uitgaven categoriseren',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Alle uitgaven moeten worden gecategoriseerd om te kunnen exporteren naar ${connectionName}.`,
            subtitle: 'Krijg een beter overzicht van waar geld wordt uitgegeven. Gebruik onze standaardcategorieën of voeg je eigen categorieën toe.',
            emptyCategories: {
                title: 'Je hebt nog geen categorieën aangemaakt',
                subtitle: 'Voeg een categorie toe om je uitgaven te organiseren.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Je categorieën worden momenteel geïmporteerd vanuit een boekhoudkoppeling. Ga naar <a href="${accountingPageURL}">Boekhouding</a> om wijzigingen aan te brengen.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de categorie, probeer het opnieuw',
            createFailureMessage: 'Er is een fout opgetreden bij het aanmaken van de categorie, probeer het opnieuw',
            addCategory: 'Categorie toevoegen',
            editCategory: 'Categorie bewerken',
            editCategories: 'Categorieën bewerken',
            findCategory: 'Categorie zoeken',
            categoryRequiredError: 'Categorienaam is verplicht',
            existingCategoryError: 'Er bestaat al een categorie met deze naam',
            invalidCategoryName: 'Ongeldige categorienaam',
            importedFromAccountingSoftware: 'De onderstaande categorieën zijn geïmporteerd uit je',
            payrollCode: 'Payrollcode',
            updatePayrollCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de looncode, probeer het opnieuw',
            glCode: 'Grootboekcode',
            updateGLCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de GL-code, probeer het opnieuw',
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
                subtitle: 'Voeg controles toe die helpen om uitgaven binnen het budget te houden.',
            },
            earnSection: {
                title: 'Verdienen',
                subtitle: 'Stroomlijn je inkomsten en word sneller betaald.',
            },
            organizeSection: {
                title: 'Organiseren',
                subtitle: 'Groepeer en analyseer uitgaven, leg elke betaalde belasting vast.',
            },
            integrateSection: {
                title: 'Integreren',
                subtitle: 'Verbind Expensify met populaire financiële producten.',
            },
            distanceRates: {
                title: 'Afstandstarieven',
                subtitle: 'Tarieven toevoegen, bijwerken en afdwingen.',
            },
            perDiem: {
                title: 'Dagvergoeding',
                subtitle: 'Stel dagvergoedingen in om de dagelijkse uitgaven van medewerkers te beheren.',
            },
            travel: {
                title: 'Reizen',
                subtitle: 'Boek, beheer en verzoen al uw zakelijke reizen.',
                getStarted: {
                    title: 'Aan de slag met Expensify Travel',
                    subtitle: 'We hebben nog een paar extra stukjes informatie over uw bedrijf nodig, dan bent u klaar voor vertrek.',
                    ctaText: 'Laten we gaan',
                },
                reviewingRequest: {
                    title: 'Pak uw koffers, we hebben uw verzoek...',
                    subtitle: 'We bekijken momenteel uw verzoek om Expensify Travel in te schakelen. Maak u geen zorgen, we laten u weten wanneer het klaar is.',
                    ctaText: 'Verzoek verzonden',
                },
                bookOrManageYourTrip: {
                    title: 'Boek of beheer uw reis',
                    subtitle: 'Gebruik Expensify Travel om de beste reisaanbiedingen te krijgen en beheer al uw zakelijke uitgaven op één plek.',
                    ctaText: 'Boeken of beheren',
                },
                travelInvoicing: {
                    travelBookingSection: {title: 'Reisboeking', subtitle: 'Gefeliciteerd! Je kunt nu reizen boeken en beheren in deze werkruimte.', manageTravelLabel: 'Reizen beheren'},
                    centralInvoicingSection: {
                        title: 'Centrale facturatie',
                        subtitle: 'Centraliseer alle reiskosten in één maandelijkse factuur in plaats van bij aankoop te betalen.',
                        learnHow: 'Meer informatie.',
                        subsections: {
                            currentTravelSpendLabel: 'Huidige reiskosten',
                            currentTravelSpendCta: 'Saldo betalen',
                            currentTravelLimitLabel: 'Huidige reislimoet',
                            settlementAccountLabel: 'Afwikkelingsrekening',
                            settlementFrequencyLabel: 'Frequentie van afwikkeling',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Krijg inzicht in en controle over uitgaven.',
                disableCardTitle: 'Expensify Card uitschakelen',
                disableCardPrompt: 'Je kunt de Expensify Card niet uitschakelen omdat deze al in gebruik is. Neem contact op met Concierge voor de volgende stappen.',
                disableCardButton: 'Chatten met Concierge',
                feed: {
                    title: 'Vraag de Expensify Card aan',
                    subTitle: 'Stroomlijn uw zakelijke onkosten en bespaar tot 50% op uw Expensify‑rekening, plus:',
                    features: {
                        cashBack: 'Geldteruggave op elke aankoop in de VS',
                        unlimited: 'Onbeperkte virtuele kaarten',
                        spend: 'Uitgavenbeperkingen en aangepaste limieten',
                    },
                    ctaTitle: 'Nieuwe kaart uitgeven',
                },
            },
            companyCards: {
                title: 'Bedrijfskaarten',
                subtitle: 'Koppel de kaarten die je al hebt.',
                feed: {
                    title: 'Gebruik je eigen kaarten (BYOC)',
                    features: {
                        support: 'Koppel kaarten van meer dan 10.000 banken',
                        assignCards: 'Koppel de bestaande kaarten van je team',
                        automaticImport: 'We halen transacties automatisch op',
                    },
                    subtitle: 'Koppel de kaarten die je al hebt voor automatische transactie-import, bonkoppeling en reconciliatie.',
                },
                bankConnectionError: 'Probleem met bankverbinding',
                connectWithPlaid: 'verbinden via Plaid',
                connectWithExpensifyCard: 'probeer de Expensify Card.',
                bankConnectionDescription: `Probeer uw kaarten opnieuw toe te voegen. Anders kunt u`,
                disableCardTitle: 'Bedrijfskaarten uitschakelen',
                disableCardPrompt: 'Je kunt bedrijfskaarten niet uitschakelen omdat deze functie in gebruik is. Neem contact op met de Concierge voor de volgende stappen.',
                disableCardButton: 'Chatten met Concierge',
                cardDetails: 'Kaartgegevens',
                cardNumber: 'Kaartnummer',
                cardholder: 'Kaarthouder',
                cardName: 'Kaartnaam',
                allCards: 'Alle kaarten',
                assignedCards: 'Toegewezen',
                unassignedCards: 'Niet toegewezen',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} export` : `${integration}-export`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Kies de ${integration}-account waarnaar transacties moeten worden geëxporteerd.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Kies de ${integration}-rekening waarnaar transacties moeten worden geëxporteerd. Selecteer een andere <a href="${exportPageLink}">exportoptie</a> om de beschikbare rekeningen te wijzigen.`,
                lastUpdated: 'Laatst bijgewerkt',
                transactionStartDate: 'Startdatum transactie',
                updateCard: 'Kaart bijwerken',
                unassignCard: 'Kaart ontkoppelen',
                unassign: 'Toewijzen verwijderen',
                unassignCardDescription: 'Als je deze kaart loskoppelt, worden alle transacties op conceptrapporten uit de rekening van de kaarthouder verwijderd.',
                assignCard: 'Kaart toewijzen',
                cardFeedName: 'Naam van kaartfeed',
                cardFeedNameDescription: 'Geef de kaartfeed een unieke naam zodat je deze kunt onderscheiden van de andere.',
                cardFeedTransaction: 'Transacties verwijderen',
                cardFeedTransactionDescription: 'Kies of kaarthouders kaarttransacties kunnen verwijderen. Nieuwe transacties volgen deze regels.',
                cardFeedRestrictDeletingTransaction: 'Beperken van het verwijderen van transacties',
                cardFeedAllowDeletingTransaction: 'Verwijderen van transacties toestaan',
                removeCardFeed: 'Kaartfeed verwijderen',
                removeCardFeedTitle: (feedName: string) => `${feedName}-feed verwijderen`,
                removeCardFeedDescription: 'Weet je zeker dat je deze kaartfeed wilt verwijderen? Hierdoor worden alle kaarten losgekoppeld.',
                error: {
                    feedNameRequired: 'Naam van kaartfeed is vereist',
                    statementCloseDateRequired: 'Selecteer een datum voor het afschrift.',
                },
                corporate: 'Beperken van het verwijderen van transacties',
                personal: 'Verwijderen van transacties toestaan',
                setFeedNameDescription: 'Geef de kaartfeed een unieke naam zodat je deze van de andere kunt onderscheiden',
                setTransactionLiabilityDescription: 'Indien ingeschakeld kunnen kaarthouders kaarttransacties verwijderen. Nieuwe transacties zullen deze regel volgen.',
                emptyAddedFeedTitle: 'Bedrijfskaarten toewijzen',
                emptyAddedFeedDescription: 'Begin door je eerste kaart aan een lid toe te wijzen.',
                pendingFeedTitle: `We beoordelen je verzoek...`,
                pendingFeedDescription: `We zijn je feedgegevens momenteel aan het beoordelen. Zodra dat is afgerond, nemen we contact met je op via`,
                pendingBankTitle: 'Controleer je browservenster',
                pendingBankDescription: (bankName: string) => `Maak verbinding met ${bankName} via het browservenster dat zojuist is geopend. Als er geen werd geopend,`,
                pendingBankLink: 'klik hier alsjeblieft',
                giveItNameInstruction: 'Geef de kaart een naam die haar onderscheidt van andere kaarten.',
                updating: 'Bezig met bijwerken...',
                neverUpdated: 'Nooit',
                noAccountsFound: 'Geen accounts gevonden',
                defaultCard: 'Standaardkaart',
                downgradeTitle: `Kan werkruimte niet downgraden`,
                downgradeSubTitle: `Deze workspace kan niet worden gedegradeerd omdat er meerdere kaartfeeds zijn gekoppeld (met uitzondering van Expensify Cards). <a href="#">Behoud slechts één kaartfeed</a> om verder te gaan.`,
                noAccountsFoundDescription: (connection: string) => `Voeg het account toe in ${connection} en synchroniseer de verbinding opnieuw`,
                expensifyCardBannerTitle: 'Vraag de Expensify Card aan',
                expensifyCardBannerSubtitle: 'Geniet van cashback op elke aankoop in de VS, tot 50% korting op je Expensify‑rekening, onbeperkte virtuele kaarten en nog veel meer.',
                expensifyCardBannerLearnMoreButton: 'Meer informatie',
                statementCloseDateTitle: 'Sluitingsdatum afschrift',
                statementCloseDateDescription: 'Laat ons weten wanneer je creditcardafschrift wordt afgesloten, dan maken wij een overeenkomstig afschrift in Expensify.',
            },
            workflows: {
                title: 'Workflows',
                subtitle: 'Configureer hoe uitgaven worden goedgekeurd en betaald.',
                disableApprovalPrompt:
                    'Expensify Cards van deze workspace zijn momenteel afhankelijk van goedkeuring om hun Smart Limits te bepalen. Pas de limiettypen van alle Expensify Cards met Smart Limits aan voordat je goedkeuringen uitschakelt.',
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
                title: 'Labels',
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
                subtitle: 'Synchroniseer je rekeningschema en meer.',
            },
            receiptPartners: {
                title: 'Bonpartners',
                subtitle: 'Automatisch bonnen importeren.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Niet zo snel...',
                featureEnabledText: 'Om deze functie in of uit te schakelen, moet je je boekhoudimportinstellingen wijzigen.',
                disconnectText: 'Om de boekhouding uit te schakelen, moet je de koppeling met je boekhoudsysteem in je werkruimte verbreken.',
                manageSettings: 'Instellingen beheren',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Verbinding met Uber verbreken',
                disconnectText: 'Om deze functie uit te schakelen, moet je eerst de integratie met Uber for Business ontkoppelen.',
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
                subtitle: 'Vereis bonnetjes, markeer hoge uitgaven en meer.',
            },
            timeTracking: {
                title: 'Tijd',
                subtitle: 'Stel een factureerbaar uurtarief in voor tijdregistratie.',
                defaultHourlyRate: 'Standaard uurtarief',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Voorbeelden:',
            customReportNamesSubtitle: `<muted-text>Pas rapporttitels aan met behulp van onze <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">uitgebreide formules</a>.</muted-text>`,
            customNameTitle: 'Standaardrapporttitel',
            customNameDescription: `Kies een aangepaste naam voor onkostendeclaraties met behulp van onze <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">uitgebreide formules</a>.`,
            customNameInputLabel: 'Naam',
            customNameEmailPhoneExample: 'E-mail of telefoonnummer van lid: {report:submit:from}',
            customNameStartDateExample: 'Begindatum rapport: {report:startdate}',
            customNameWorkspaceNameExample: 'Werkruimte naam: {report:workspacename}',
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
                subtitle: 'Voeg een aangepast veld (tekst, datum of keuzelijst) toe dat op rapporten verschijnt.',
            },
            subtitle: 'Rapportvelden zijn van toepassing op alle uitgaven en kunnen nuttig zijn wanneer je om extra informatie wilt vragen.',
            disableReportFields: 'Veldrapporten uitschakelen',
            disableReportFieldsConfirmation: 'Weet je het zeker? Tekst- en datumvelden worden verwijderd en lijsten worden uitgeschakeld.',
            importedFromAccountingSoftware: 'De onderstaande rapportvelden worden geïmporteerd uit je',
            textType: 'Tekst',
            dateType: 'Datum',
            dropdownType: 'Lijst',
            formulaType: 'Formule',
            textAlternateText: 'Voeg een veld toe voor vrije tekstinvoer.',
            dateAlternateText: 'Een kalender toevoegen voor datumselectie.',
            dropdownAlternateText: 'Voeg een lijst met opties toe om uit te kiezen.',
            formulaAlternateText: 'Voeg een formuleveld toe.',
            nameInputSubtitle: 'Kies een naam voor het rapportveld.',
            typeInputSubtitle: 'Kies welk type rapportveld je wilt gebruiken.',
            initialValueInputSubtitle: 'Voer een startwaarde in om in het rapportveld weer te geven.',
            listValuesInputSubtitle: 'Deze waarden verschijnen in de vervolgkeuzelijst voor je rapportveld. Ingeschakelde waarden kunnen door leden worden geselecteerd.',
            listInputSubtitle: 'Deze waarden worden weergegeven in de lijst met rapportvelden. Ingeschakelde waarden kunnen door leden worden geselecteerd.',
            deleteValue: 'Waarde verwijderen',
            deleteValues: 'Waarden verwijderen',
            disableValue: 'Waarde uitschakelen',
            disableValues: 'Waarden uitschakelen',
            enableValue: 'Waarde inschakelen',
            enableValues: 'Waarden inschakelen',
            emptyReportFieldsValues: {
                title: 'Je hebt nog geen lijstwaarden aangemaakt',
                subtitle: 'Aangepaste waarden toevoegen die op rapporten moeten verschijnen.',
            },
            deleteValuePrompt: 'Weet je zeker dat je deze lijstwaarde wilt verwijderen?',
            deleteValuesPrompt: 'Weet u zeker dat u deze lijstwaarden wilt verwijderen?',
            listValueRequiredError: 'Voer een lijstwaardenaam in',
            existingListValueError: 'Er bestaat al een lijstwaarde met deze naam',
            editValue: 'Waarde bewerken',
            listValues: 'Waardes weergeven',
            addValue: 'Waarde toevoegen',
            existingReportFieldNameError: 'Er bestaat al een rapportveld met deze naam',
            reportFieldNameRequiredError: 'Voer een rapportveldnaam in',
            reportFieldTypeRequiredError: 'Kies een rapportveldtype',
            circularReferenceError: 'Dit veld kan niet naar zichzelf verwijzen. Werk het alsjeblieft bij.',
            reportFieldInitialValueRequiredError: 'Kies een beginwaarde voor het rapportveld',
            genericFailureMessage: 'Er is een fout opgetreden bij het bijwerken van het rapportveld. Probeer het opnieuw.',
        },
        invoiceFields: {
            subtitle: "Invoice fields can be helpful when you'd like to include extra information.",
            importedFromAccountingSoftware: 'The invoice fields below are imported from your',
            disableInvoiceFields: 'Disable invoice fields',
            disableInvoiceFieldsConfirmation: 'Are you sure? Invoice fields will be disabled on invoices.',
            delete: 'Delete invoice field',
            deleteConfirmation: 'Are you sure you want to delete this invoice field?',
        },
        tags: {
            tagName: 'Tagnaam',
            requiresTag: 'Leden moeten alle uitgaven taggen',
            trackBillable: 'Factureerbare uitgaven bijhouden',
            customTagName: 'Aangepaste tagnaam',
            enableTag: 'Tag inschakelen',
            enableTags: 'Tags inschakelen',
            requireTag: 'Tag verplichten',
            requireTags: 'Tags vereist',
            notRequireTags: 'Niet vereisen',
            disableTag: 'Tag uitschakelen',
            disableTags: 'Tags uitschakelen',
            addTag: 'Tag toevoegen',
            editTag: 'Tag bewerken',
            editTags: 'Tags bewerken',
            findTag: 'Tag zoeken',
            subtitle: 'Labels bieden meer gedetailleerde manieren om kosten te classificeren.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>Je gebruikt <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">afhankelijke tags</a>. Je kunt <a href="${importSpreadsheetLink}">een spreadsheet opnieuw importeren</a> om je tags bij te werken.</muted-text>`,
            emptyTags: {
                title: 'Je hebt nog geen tags aangemaakt',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Voeg een tag toe om projecten, locaties, afdelingen en meer bij te houden.',
                subtitleHTML: `<muted-text><centered-text>Voeg tags toe om projecten, locaties, afdelingen en meer bij te houden. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">Meer informatie</a> over het opmaken van tagbestanden voor import.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Je tags worden momenteel geïmporteerd vanuit een boekhoudkoppeling. Ga naar <a href="${accountingPageURL}">Boekhouding</a> om wijzigingen aan te brengen.</centered-text></muted-text>`,
            },
            deleteTag: 'Tag verwijderen',
            deleteTags: 'Tags verwijderen',
            deleteTagConfirmation: 'Weet je zeker dat je deze tag wilt verwijderen?',
            deleteTagsConfirmation: 'Weet je zeker dat je deze tags wilt verwijderen?',
            deleteFailureMessage: 'Er is een fout opgetreden bij het verwijderen van de tag, probeer het opnieuw',
            tagRequiredError: 'Tagnaam is verplicht',
            existingTagError: 'Er bestaat al een tag met deze naam',
            invalidTagNameError: 'Tagnaam kan niet 0 zijn. Kies een andere waarde.',
            genericFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de tag, probeer het opnieuw',
            importedFromAccountingSoftware: 'De onderstaande tags zijn geïmporteerd uit je',
            glCode: 'Grootboekcode',
            updateGLCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de GL-code, probeer het opnieuw',
            tagRules: 'Tagregels',
            approverDescription: 'Fiatteur',
            importTags: 'Tags importeren',
            importTagsSupportingText: 'Codeer je uitgaven met één type tag of met meerdere.',
            configureMultiLevelTags: 'Configureer je lijst met tags voor tagging op meerdere niveaus.',
            importMultiLevelTagsSupportingText: `Hier is een voorbeeldweergave van je labels. Als alles er goed uitziet, klik dan hieronder om ze te importeren.`,
            importMultiLevelTags: {
                firstRowTitle: 'De eerste rij is de titel voor elke taglijst',
                independentTags: 'Dit zijn onafhankelijke tags',
                glAdjacentColumn: 'Er staat een GL-code in de aangrenzende kolom',
            },
            tagLevel: {
                singleLevel: 'Enkel niveau van tags',
                multiLevel: 'Tags met meerdere niveaus',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Tag-niveaus wijzigen',
                prompt1: 'Schakelen tussen tag-niveaus wist alle huidige tags.',
                prompt2: 'We raden je aan eerst',
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
            importedTagsMessage: (columnCounts: number) =>
                `We hebben *${columnCounts} kolommen* in je spreadsheet gevonden. Selecteer *Naam* naast de kolom die de tagnamen bevat. Je kunt ook *Ingeschakeld* selecteren naast de kolom die de tagstatus instelt.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Kan niet alle labels verwijderen of uitschakelen',
                description: `Minstens één tag moet ingeschakeld blijven, omdat je workspace tags vereist.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Kan niet alle labels optioneel maken',
                description: `Er moet ten minste één tag verplicht blijven omdat je werkruimtesettings tags vereisen.`,
            },
            cannotMakeTagListRequired: {
                title: 'Kan taglijst niet verplicht maken',
                description: 'Je kunt een taglijst alleen verplicht maken als je beleid meerdere tag­niveaus heeft geconfigureerd.',
            },
            tagCount: () => ({
                one: '1 dag',
                other: (count: number) => `${count} Labels`,
            }),
        },
        taxes: {
            subtitle: 'Belastingsnamen en -tarieven toevoegen en standaarden instellen.',
            addRate: 'Tarief toevoegen',
            workspaceDefault: 'Standaardvaluta van werkruimte',
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
                updateTaxClaimableFailureMessage: 'Het terugvorderbare gedeelte moet lager zijn dan het kilometervergoedingbedrag',
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
            updateTaxCodeFailureMessage: 'Er is een fout opgetreden bij het bijwerken van de belastingcode, probeer het opnieuw',
        },
        duplicateWorkspace: {
            title: 'Geef uw nieuwe workspace een naam',
            selectFeatures: 'Selecteer functies om te kopiëren',
            whichFeatures: 'Welke functies wil je overnemen naar je nieuwe werkruimte?',
            confirmDuplicate: 'Wil je doorgaan?',
            categories: 'categorieën en je automatische categorisatieregels',
            reimbursementAccount: 'vergoedingsrekening',
            welcomeNote: 'Gebruik alsjeblieft mijn nieuwe werkruimte vanaf nu',
            delayedSubmission: 'vertraagde indiening',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Je staat op het punt ${newWorkspaceName ?? ''} te maken en te delen met ${totalMembers ?? 0} leden van de oorspronkelijke workspace.`,
            error: 'Er is een fout opgetreden bij het dupliceren van je nieuwe werkruimte. Probeer het opnieuw.',
        },
        emptyWorkspace: {
            title: 'Je hebt geen werkruimtes',
            subtitle: 'Volg bonnetjes, vergoed uitgaven, beheer reizen, verstuur facturen en meer.',
            createAWorkspaceCTA: 'Aan de slag',
            features: {
                trackAndCollect: 'Bonnen volgen en verzamelen',
                reimbursements: 'Medewerkers terugbetalen',
                companyCards: 'Bedrijfskaarten beheren',
            },
            notFound: 'Geen werkruimte gevonden',
            description: 'Rooms zijn een geweldige plek om te overleggen en samen te werken met meerdere personen. Maak of neem deel aan een werkruimte om te beginnen met samenwerken',
        },
        new: {
            newWorkspace: 'Nieuwe werkruimte',
            getTheExpensifyCardAndMore: 'Vraag de Expensify Card en meer aan',
            confirmWorkspace: 'Workspace bevestigen',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mijn Groepswerkruimte${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Workspace van ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Er is een fout opgetreden bij het verwijderen van een lid uit de werkruimte, probeer het opnieuw.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Weet je zeker dat je ${memberName} wilt verwijderen?`,
                other: 'Weet je zeker dat je deze leden wilt verwijderen?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} is een fiatteur in deze werkruimte. Wanneer je deze werkruimte niet meer met hen deelt, vervangen we hen in de goedkeuringsworkflow door de eigenaar van de werkruimte, ${ownerName}`,
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
                other: 'Maak leden',
            }),
            makeAdmin: () => ({
                one: 'Beheerder maken',
                other: 'Beheerders aanwijzen',
            }),
            makeAuditor: () => ({
                one: 'Maak auditor',
                other: 'Maak auditors',
            }),
            selectAll: 'Alles selecteren',
            error: {
                genericAdd: 'Er is een probleem opgetreden bij het toevoegen van dit werkruimtelid',
                cannotRemove: 'Je kunt jezelf of de eigenaar van de werkruimte niet verwijderen',
                genericRemove: 'Er is een probleem opgetreden bij het verwijderen van dat werkruimteldlid',
            },
            addedWithPrimary: 'Sommige leden zijn toegevoegd met hun primaire logins.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Toegevoegd door secundaire login ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Totaal aantal workspace-leden: ${count}`,
            importMembers: 'Leden importeren',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Als je ${approver} uit deze werkruimte verwijdert, vervangen we hen in de goedkeuringsworkflow door ${workspaceOwner}, de eigenaar van de werkruimte.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} heeft openstaande onkostendeclaraties om goed te keuren. Vraag hen deze goed te keuren of neem de controle over hun declaraties voordat je hen uit de workspace verwijdert.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Je kunt ${memberName} niet uit deze workspace verwijderen. Stel een nieuwe terugbetaler in via Workflows > Betalingen doen of volgen en probeer het dan opnieuw.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Als je ${memberName} uit deze workspace verwijdert, vervangen we hen als de voorkeurs-exporteur door ${workspaceOwner}, de eigenaar van de workspace.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Als je ${memberName} uit deze workspace verwijdert, vervangen we hen als technische contactpersoon door ${workspaceOwner}, de eigenaar van de workspace.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} heeft een openstaand rapport in behandeling waarop actie moet worden ondernomen. Vraag hen om de vereiste actie te voltooien voordat je hen uit de workspace verwijdert.`,
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
                physicalCardDescription: 'Geweldig voor de frequente uitgever',
                virtualCard: 'Virtuele kaart',
                virtualCardDescription: 'Direct en flexibel',
                chooseLimitType: 'Kies een limiettype',
                smartLimit: 'Slimme limiet',
                smartLimitDescription: 'Tot een bepaald bedrag uitgeven vóórdat goedkeuring vereist is',
                monthly: 'Maandelijks',
                monthlyDescription: 'Besteed tot een bepaald bedrag per maand',
                fixedAmount: 'Vast bedrag',
                fixedAmountDescription: 'Eénmalig tot een bepaald bedrag uitgeven',
                setLimit: 'Stel een limiet in',
                cardLimitError: 'Voer een bedrag in dat lager is dan $21.474.836',
                giveItName: 'Geef het een naam',
                giveItNameInstruction: 'Maak het uniek genoeg om het te onderscheiden van andere kaarten. Specifieke use-cases zijn zelfs nog beter!',
                cardName: 'Kaartnaam',
                letsDoubleCheck: 'Laten we nog eens controleren of alles er goed uitziet.',
                willBeReadyToUse: 'Deze kaart is direct klaar voor gebruik.',
                willBeReadyToShip: 'Deze kaart is direct klaar om te worden verzonden.',
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
            settings: 'Instellingen',
            title: 'Verbindingen',
            subtitle: 'Verbind met je boekhoudsysteem om transacties te coderen met je grootboekrekeningen, betalingen automatisch te matchen en je financiën gesynchroniseerd te houden.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chat met je setupspecificialist.',
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
            errorODIntegration: (oldDotPolicyConnectionsURL: string) =>
                `Er is een fout opgetreden met een koppeling die is ingesteld in Expensify Classic. [Ga naar Expensify Classic om dit probleem op te lossen.](${oldDotPolicyConnectionsURL})`,
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
            connectTitle: ({connectionName}: ConnectionNameParams) => `Verbinden met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'boekhoudkoppeling'}`,
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
                `Weet je zeker dat je ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'deze boekhoudkundige integratie'} wilt verbinden? Hierdoor worden alle bestaande boekhoudkoppelingen verwijderd.`,
            enterCredentials: 'Voer je inloggegevens in',
            claimOffer: {
                badgeText: 'Aanbieding beschikbaar!',
                xero: {
                    headline: 'Krijg 6 maanden gratis Xero!',
                    description: '<muted-text><centered-text>Nieuw bij Xero? Expensify-klanten krijgen 6 maanden gratis. Verzilver je aanbieding hieronder.</centered-text></muted-text>',
                    connectButton: 'Verbinden met Xero',
                },
                uber: {
                    headerTitle: 'Uber for Business',
                    headline: 'Krijg 5% korting op Uber-ritten',
                    description: `<muted-text><centered-text>Activeer Uber for Business via Expensify en bespaar 5% op alle zakelijke ritten tot en met juni. <a href="${CONST.UBER_TERMS_LINK}">Voorwaarden zijn van toepassing.</a></centered-text></muted-text>`,
                    connectButton: 'Verbinden met Uber for Business',
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
                            return 'Medewerkers importeren';
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
                            return 'Belastingscodes importeren';
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
                            return 'Bezig met importeren van goedkeuringscertificaat';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Dimensies importeren';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Beleid voor opslaan wordt geïmporteerd';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Nog steeds gegevens aan het synchroniseren met QuickBooks... Zorg ervoor dat de Web Connector actief is';
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
                            return 'Expensify-rapporten als terugbetaald markeren';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Xero-rekeningen en -facturen als betaald markeren';
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
                            return 'Verbindingsinformatie bijwerken';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensify-rapporten als terugbetaald markeren';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuite-rekeningen en -facturen als betaald markeren';
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
            preferredExporter: 'Voorkeursexporteur',
            exportPreferredExporterNote:
                'De voorkeurs­exporteur kan elke werkruimtebeheerder zijn, maar moet ook een domeinbeheerder zijn als je in Domeininstellingen verschillende exportrekeningen instelt voor individuele bedrijfskaarten.',
            exportPreferredExporterSubNote: 'Zodra dit is ingesteld, ziet de voorkeurs-exporteur in zijn account rapporten die klaarstaan voor export.',
            exportAs: 'Exporteren als',
            exportOutOfPocket: 'Buiten-de-zak-kosten exporteren als',
            exportCompanyCard: 'Uitgaven van bedrijfskaarten exporteren als',
            exportDate: 'Exportdatum',
            defaultVendor: 'Standaardleverancier',
            autoSync: 'Automatisch synchroniseren',
            autoSyncDescription: 'Synchroniseer NetSuite en Expensify automatisch, elke dag. Exporteer het afgeronde rapport in realtime',
            reimbursedReports: 'Verzoende rapporten synchroniseren',
            cardReconciliation: 'Kaartafstemming',
            reconciliationAccount: 'Rekening voor afstemming',
            continuousReconciliation: 'Doorlopende afstemming',
            saveHoursOnReconciliation:
                'Bespaar uren aan reconciliatie in elke boekhoudperiode door Expensify automatisch Expensify Card-afschriften en -verrekeningen voor je te laten afstemmen.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Om Continue Reconciliëren in te schakelen, schakel je <a href="${accountingAdvancedSettingsLink}">auto-sync</a> in voor ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Kies de bankrekening waarmee je Expensify Card-betalingen worden afgeletterd.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Zorg ervoor dat deze rekening overeenkomt met je <a href="${settlementAccountUrl}">Expensify Card-afrekenrekening</a> (die eindigt op ${lastFourPAN}), zodat Doorlopende Afstemming goed werkt.`,
            },
        },
        export: {
            notReadyHeading: 'Nog niet klaar om te exporteren',
            notReadyDescription:
                'Concept- of lopende onkostendeclaraties kunnen niet worden geëxporteerd naar het boekhoudsysteem. Keur deze onkosten eerst goed of betaal ze voordat u ze exporteert.',
        },
        invoices: {
            sendInvoice: 'Factuur verzenden',
            sendFrom: 'Verzenden vanaf',
            invoicingDetails: 'Facturatiegegevens',
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
            invoiceBalanceSubtitle: 'Dit is je huidige saldo van het innen van factuurbetalingen. Het wordt automatisch overgemaakt naar je bankrekening als je er een hebt toegevoegd.',
            bankAccountsSubtitle: 'Voeg een bankrekening toe om facturen te betalen en te ontvangen.',
        },
        invite: {
            member: 'Lid uitnodigen',
            members: 'Leden uitnodigen',
            invitePeople: 'Nieuwe leden uitnodigen',
            genericFailureMessage: 'Er is een fout opgetreden bij het uitnodigen van het lid voor de workspace. Probeer het opnieuw.',
            pleaseEnterValidLogin: `Zorg ervoor dat het e-mailadres of telefoonnummer geldig is (bijv. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'gebruiker',
            users: 'gebruikers',
            invited: 'uitgenodigd',
            removed: 'Verwijderd',
            to: 'naar',
            from: 'van',
        },
        inviteMessage: {
            confirmDetails: 'Bevestig details',
            inviteMessagePrompt: 'Maak je uitnodiging extra speciaal door hieronder een bericht toe te voegen!',
            personalMessagePrompt: 'Bericht',
            genericFailureMessage: 'Er is een fout opgetreden bij het uitnodigen van het lid voor de workspace. Probeer het opnieuw.',
            inviteNoMembersError: 'Selecteer minimaal één lid om uit te nodigen',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} heeft verzocht om lid te worden van ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Oeps! Niet zo snel...',
            workspaceNeeds: 'Een werkruimte heeft minstens één ingeschakelde afstandstarief nodig.',
            distance: 'Afstand',
            centrallyManage: 'Beheer tarieven centraal, houd afstanden bij in mijlen of kilometers en stel een standaardcategorie in.',
            rate: 'Tarief',
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
                '<muted-text>Belastingen moeten zijn ingeschakeld in de workspace om deze functie te gebruiken. Ga naar <a href="#">Meer functies</a> om die wijziging door te voeren.</muted-text>',
            deleteDistanceRate: 'Afstandstarief verwijderen',
            areYouSureDelete: () => ({
                one: 'Weet je zeker dat je dit tarief wilt verwijderen?',
                other: 'Weet je zeker dat je deze tarieven wilt verwijderen?',
            }),
            errors: {
                rateNameRequired: 'Naam van tarief is verplicht',
                existingRateName: 'Er bestaat al een kilometertarief met deze naam',
            },
        },
        editor: {
            descriptionInputLabel: 'Beschrijving',
            nameInputLabel: 'Naam',
            typeInputLabel: 'Type',
            initialValueInputLabel: 'Beginwaarde',
            nameInputHelpText: 'Dit is de naam die je in je werkruimte zult zien.',
            nameIsRequiredError: 'Je moet je werkruimte een naam geven',
            currencyInputLabel: 'Standaardvaluta',
            currencyInputHelpText: 'Alle uitgaven in deze workspace worden omgezet naar deze valuta.',
            currencyInputDisabledText: (currency: string) => `De standaardvaluta kan niet worden gewijzigd omdat deze workspace is gekoppeld aan een ${currency}-bankrekening.`,
            save: 'Opslaan',
            genericFailureMessage: 'Er is een fout opgetreden tijdens het bijwerken van de workspace. Probeer het opnieuw.',
            avatarUploadFailureMessage: 'Er is een fout opgetreden bij het uploaden van de avatar. Probeer het opnieuw.',
            addressContext: 'Een werkruimteadres is vereist om Expensify Travel in te schakelen. Voer een adres in dat aan uw bedrijf is gekoppeld.',
            policy: 'Onkostennota-beleid',
        },
        bankAccount: {
            continueWithSetup: 'Doorgaan met instellen',
            youAreAlmostDone:
                'Je bent bijna klaar met het instellen van je bankrekening, waarmee je bedrijfskaarten kunt uitgeven, onkosten kunt vergoeden, facturen kunt innen en rekeningen kunt betalen.',
            streamlinePayments: 'Betalingen stroomlijnen',
            connectBankAccountNote: 'Opmerking: Persoonlijke bankrekeningen kunnen niet worden gebruikt voor betalingen in werkruimtes.',
            oneMoreThing: 'Nog één ding!',
            allSet: 'Je bent helemaal klaar!',
            accountDescriptionWithCards: 'Deze bankrekening wordt gebruikt om zakelijke kaarten uit te geven, onkosten te vergoeden, facturen te innen en rekeningen te betalen.',
            letsFinishInChat: 'Laten we het in de chat afronden!',
            finishInChat: 'Voltooien in chat',
            almostDone: 'Bijna klaar!',
            disconnectBankAccount: 'Bankrekening ontkoppelen',
            startOver: 'Opnieuw beginnen',
            updateDetails: 'Details bijwerken',
            yesDisconnectMyBankAccount: 'Ja, koppel mijn bankrekening los',
            yesStartOver: 'Ja, opnieuw beginnen',
            disconnectYourBankAccount: (bankName: string) =>
                `Verbreek de koppeling met je bankrekening bij <strong>${bankName}</strong>. Eventuele openstaande transacties voor deze rekening worden nog steeds verwerkt.`,
            clearProgress: 'Opnieuw beginnen verwijdert alle voortgang die je tot nu toe hebt gemaakt.',
            areYouSure: 'Weet je het zeker?',
            workspaceCurrency: 'Werkruimtevaluta',
            updateCurrencyPrompt: 'Het lijkt erop dat je werkruimte momenteel is ingesteld op een andere valuta dan USD. Klik hieronder op de knop om je valuta nu bij te werken naar USD.',
            updateToUSD: 'Bijwerken naar USD',
            updateWorkspaceCurrency: 'Werkruimtevaluta bijwerken',
            workspaceCurrencyNotSupported: 'Workspace-valuta niet ondersteund',
            yourWorkspace: `Je werkruimte is ingesteld op een niet-ondersteunde valuta. Bekijk de <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">lijst met ondersteunde valuta's</a>.`,
            chooseAnExisting: 'Kies een bestaande bankrekening om onkosten te betalen of voeg een nieuwe toe.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Eigenaar overdragen',
            addPaymentCardTitle: 'Voer je betaalkaart in om het eigendom over te dragen',
            addPaymentCardButtonText: 'Voorwaarden accepteren & betaalkaart toevoegen',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Lees en accepteer de <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">voorwaarden</a> en het <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">privacybeleid</a> om je kaart toe te voegen.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS-conform',
            addPaymentCardBankLevelEncrypt: 'Encryptie op bankniveau',
            addPaymentCardRedundant: 'Redundante infrastructuur',
            addPaymentCardLearnMore: `<muted-text>Meer informatie over onze <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">beveiliging</a>.</muted-text>`,
            amountOwedTitle: 'Openstaand saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Deze rekening heeft een openstaand saldo van een vorige maand.\n\nWil je het saldo vereffenen en de facturering van deze werkruimte overnemen?',
            ownerOwesAmountTitle: 'Openstaand saldo',
            ownerOwesAmountButtonText: 'Saldo overboeken',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `De account die eigenaar is van deze workspace (${email}) heeft een openstaand saldo van een vorige maand.

Wil je dit bedrag (${amount}) overmaken om de facturering voor deze workspace over te nemen? Je betaalkaart wordt onmiddellijk belast.`,
            subscriptionTitle: 'Jaarabonnement overnemen',
            subscriptionButtonText: 'Abonnement overzetten',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Door deze workspace over te nemen, wordt het jaarlijkse abonnement samengevoegd met je huidige abonnement. Hierdoor neemt de grootte van je abonnement toe met ${usersCount} leden en wordt de nieuwe abonnementsomvang ${finalCount}. Wil je doorgaan?`,
            duplicateSubscriptionTitle: 'Waarschuwing voor dubbele abonnementen',
            duplicateSubscriptionButtonText: 'Doorgaan',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Het lijkt erop dat je mogelijk probeert de facturering over te nemen voor de werkruimtes van ${email}, maar om dat te doen, moet je eerst beheerder zijn van al hun werkruimtes.

Klik op "Doorgaan" als je alleen de facturering wilt overnemen voor de werkruimte ${workspaceName}.

Als je de facturering voor hun volledige abonnement wilt overnemen, vraag hen dan om je eerst als beheerder toe te voegen aan al hun werkruimtes voordat je de facturering overneemt.`,
            hasFailedSettlementsTitle: 'Kan eigendom niet overdragen',
            hasFailedSettlementsButtonText: 'Begrepen',
            hasFailedSettlementsText: (email: string) =>
                `Je kunt de facturering niet overnemen omdat ${email} een achterstallige Expensify Card-afrekening heeft. Vraag hen contact op te nemen met concierge@expensify.com om het probleem op te lossen. Daarna kun je de facturering voor deze workspace overnemen.`,
            failedToClearBalanceTitle: 'Saldo wissen mislukt',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'We konden het saldo niet wissen. Probeer het later opnieuw.',
            successTitle: 'Woohoo! Helemaal klaar.',
            successDescription: 'Je bent nu de eigenaar van deze workspace.',
            errorTitle: 'Oeps! Niet zo snel...',
            errorDescription: `<muted-text><centered-text>Er is een probleem opgetreden bij het overdragen van het eigenaarschap van deze workspace. Probeer het opnieuw, of <concierge-link>neem contact op met Concierge</concierge-link> voor hulp.</centered-text></muted-text>`,
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
                description: `Rapportvelden laten je kopniveau-details specificeren, verschillend van tags die betrekking hebben op uitgaven op individuele regels. Deze details kunnen specifieke projectnamen, informatie over zakenreizen, locaties en meer omvatten.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Rapportvelden zijn alleen beschikbaar in het Control-abonnement, beginnend bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Profiteer van automatische synchronisatie en verminder handmatige invoer met de Expensify + NetSuite-integratie. Krijg diepgaande realtime financiële inzichten met ondersteuning voor native en aangepaste segmenten, inclusief project- en klantkoppeling.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Onze NetSuite-integratie is alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Profiteer van automatische synchronisatie en verminder handmatige invoer met de integratie Expensify + Sage Intacct. Krijg diepgaande, realtime financiële inzichten met door de gebruiker gedefinieerde dimensies, evenals kosten­codering per afdeling, klasse, locatie, klant en project (job).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Onze Sage Intacct-integratie is alleen beschikbaar op het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Geniet van automatische synchronisatie en verminder handmatige invoer met de Expensify + QuickBooks Desktop-integratie. Bereik ultieme efficiëntie met een realtime, tweerichtingsverbinding en kostenallocatie op basis van klasse, item, klant en project.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Onze QuickBooks Desktop-integratie is alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Geavanceerde goedkeuringen',
                description: `Als je meer lagen van goedkeuring wilt toevoegen – of er gewoon zeker van wilt zijn dat de grootste uitgaven een extra paar ogen krijgen – dan ben je bij ons aan het juiste adres. Geavanceerde goedkeuringen helpen je om op elk niveau de juiste controles in te stellen, zodat je de uitgaven van je team onder controle houdt.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Geavanceerde goedkeuringen zijn alleen beschikbaar in het Control-abonnement, dat begint bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            categories: {
                title: 'Categorieën',
                description: 'Met categorieën kun je uitgaven bijhouden en organiseren. Gebruik onze standaardcategorieën of voeg je eigen categorieën toe.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Categorieën zijn beschikbaar in het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            glCodes: {
                title: 'Grootboekcodes',
                description: `Voeg GL-codes toe aan je categorieën en labels voor het eenvoudig exporteren van uitgaven naar je boekhoud- en salarisadministratiesystemen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL-codes zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Grootboek- en payroll-codes',
                description: `Voeg grootboek- en looncodes toe aan je categorieën voor eenvoudige export van uitgaven naar je boekhoud- en loonadministratiesystemen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL- en Payroll-codes zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Belastingcodes',
                description: `Voeg belastingcodes toe aan je belastingen voor eenvoudige export van uitgaven naar je boekhoud- en loonadministratiesystemen.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Belastingcodes zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            companyCards: {
                title: 'Onbeperkte bedrijfskaarten',
                description: `Moet u meer kaartfeeds toevoegen? Ontgrendel onbeperkt bedrijfskaarten om transacties van alle grote kaartuitgevers te synchroniseren.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dit is alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            rules: {
                title: 'Regels',
                description: `Regels draaien op de achtergrond en houden je uitgaven onder controle, zodat jij je geen zorgen hoeft te maken over de kleine dingen.

Vraag verplichte uitgavedetails zoals bonnetjes en beschrijvingen, stel limieten en standaardwaarden in en automatiseer goedkeuringen en betalingen – allemaal op één plek.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Regels zijn alleen beschikbaar op het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            perDiem: {
                title: 'Dagvergoeding',
                description:
                    'Per diem is een geweldige manier om uw dagelijkse kosten in overeenstemming en voorspelbaar te houden wanneer uw werknemers reizen. Profiteer van functies zoals aangepaste tarieven, standaardcategorieën en meer gedetailleerde informatie zoals bestemmingen en subtarieven.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Dagsvergoedingen zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            travel: {
                title: 'Reizen',
                description: 'Expensify Travel is een nieuw bedrijfsplatform voor het boeken en beheren van reizen waarmee leden accommodaties, vluchten, vervoer en meer kunnen boeken.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Reizen is beschikbaar in het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            reports: {
                title: 'Rapporten',
                description: 'Rapporten stellen je in staat om uitgaven te groeperen voor eenvoudigere rapportage en organisatie.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Rapporten zijn beschikbaar in het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Tags met meerdere niveaus',
                description:
                    'Tags op meerdere niveaus helpen je uitgaven nauwkeuriger bij te houden. Wijs meerdere tags toe aan elk regelitem—zoals afdeling, klant of kostenplaats—om de volledige context van elke uitgave vast te leggen. Dit maakt meer gedetailleerde rapportage, goedkeuringsworkflows en boekhoudkundige exports mogelijk.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Tags op meerdere niveaus zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Afstandstarieven',
                description: 'Maak en beheer je eigen tarieven, houd afstanden bij in mijlen of kilometers en stel standaardcategorieën in voor afstandskosten.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Afstandstarieven zijn beschikbaar in het Collect-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            auditor: {
                title: 'Auditor',
                description: 'Accountants krijgen alleen-lezen-toegang tot alle rapporten voor volledige transparantie en toezicht op de naleving.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Auditors zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Meerdere goedkeuringsniveaus',
                description:
                    'Meerdere goedkeuringsniveaus is een workflowtool voor bedrijven die meer dan één persoon nodig hebben om een rapport goed te keuren voordat het kan worden vergoed.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Meerdere goedkeuringsniveaus zijn alleen beschikbaar in het Control-abonnement, vanaf <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'per actieve deelnemer per maand.',
                perMember: 'per lid per maand.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Upgrade om toegang te krijgen tot deze functie, of <a href="${subscriptionLink}">lees meer</a> over onze abonnementen en prijzen.</muted-text>`,
            upgradeToUnlock: 'Ontgrendel deze functie',
            completed: {
                headline: `Je hebt je workspace geüpgraded!`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Je hebt ${policyName} succesvol geüpgraded naar het Control-abonnement! <a href="${subscriptionLink}">Bekijk je abonnement</a> voor meer details.</centered-text>`,
                categorizeMessage: `Je bent succesvol geüpgraded naar het Collect-abonnement. Nu kun je je uitgaven categoriseren!`,
                travelMessage: `Je hebt je abonnement succesvol geüpgraded naar het Collect-abonnement. Nu kun je beginnen met het boeken en beheren van reizen!`,
                distanceRateMessage: `Je hebt je abonnement succesvol geüpgraded naar het Collect-abonnement. Nu kun je het kilometertarief wijzigen!`,
                gotIt: 'Begrepen, dank je.',
                createdWorkspace: `Je hebt een werkruimte gemaakt!`,
            },
            commonFeatures: {
                title: 'Upgrade naar het Control-abonnement',
                note: 'Ontgrendel onze krachtigste functies, waaronder:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Het Control-abonnement begint bij <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `per lid per maand.` : `per actieve deelnemer per maand.`} <a href="${learnMoreMethodsRoute}">Lees meer</a> over onze abonnementen en prijzen.</muted-text>`,
                    benefit1: 'Geavanceerde boekhoudkoppelingen (NetSuite, Sage Intacct en meer)',
                    benefit2: 'Slimme uitgaveregels',
                    benefit3: 'Goedkeuringsworkflows met meerdere niveaus',
                    benefit4: 'Verbeterde beveiligingscontroles',
                    toUpgrade: 'Om te upgraden, klik',
                    selectWorkspace: 'selecteer een workspace en wijzig het type abonnement in',
                },
                upgradeWorkspaceWarning: 'Kan werkruimte niet upgraden',
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt: 'Uw bedrijf heeft de creatie van werkruimten beperkt. Neem contact op met een beheerder voor hulp.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Downgraden naar het Collect-abonnement',
                note: 'Als je downgrade, verlies je de toegang tot deze functies en meer:',
                benefits: {
                    note: 'Bekijk onze volledige vergelijking van abonnementen op onze',
                    pricingPage: 'Prijzenpagina',
                    confirm: 'Weet je zeker dat je wilt downgraden en je configuraties wilt verwijderen?',
                    warning: 'Dit kan niet ongedaan worden gemaakt.',
                    benefit1: 'Boekhoudkoppelingen (behalve QuickBooks Online en Xero)',
                    benefit2: 'Slimme uitgaveregels',
                    benefit3: 'Goedkeuringsworkflows met meerdere niveaus',
                    benefit4: 'Verbeterde beveiligingscontroles',
                    headsUp: 'Let op!',
                    multiWorkspaceNote: 'U moet al uw werkruimten downgraden vóór uw eerste maandelijkse betaling om een abonnement tegen het Collect-tarief te starten. Klik',
                    selectStep: '> selecteer elke workspace > wijzig het type abonnement naar',
                },
            },
            completed: {
                headline: 'Je werkruimte is gedegradeerd',
                description: 'Je hebt andere werkruimtes op het Control-abonnement. Om tegen het Collect-tarief te worden gefactureerd, moet je alle werkruimtes downgraden.',
                gotIt: 'Begrepen, dank je.',
            },
        },
        payAndDowngrade: {
            title: 'Betalen & downgraden',
            headline: 'Uw laatste betaling',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Je uiteindelijke factuur voor dit abonnement bedraagt <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Bekijk hieronder je uitsplitsing voor ${date}:`,
            subscription:
                'Let op! Deze actie beëindigt je Expensify-abonnement, verwijdert deze workspace en verwijdert alle workspaceleden. Als je deze workspace wilt behouden en alleen jezelf wilt verwijderen, laat dan eerst een andere beheerder de facturering overnemen.',
            genericFailureMessage: 'Er is een fout opgetreden bij het betalen van je factuur. Probeer het opnieuw.',
        },
        restrictedAction: {
            restricted: 'Beperkt',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Acties in de ${workspaceName}-werkruimte zijn momenteel beperkt`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Werkruimte-eigenaar ${workspaceOwnerName} moet de opgeslagen betaalkaart toevoegen of bijwerken om nieuwe werkruimte-activiteiten vrij te geven.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Je moet de betaalkaart in het dossier toevoegen of bijwerken om nieuwe workspace-activiteiten te ontgrendelen.',
            addPaymentCardToUnlock: 'Voeg een betaalkaart toe om te ontgrendelen!',
            addPaymentCardToContinueUsingWorkspace: 'Voeg een betaalkaart toe om deze werkruimte te blijven gebruiken',
            pleaseReachOutToYourWorkspaceAdmin: 'Neem contact op met de beheerder van je werkruimte als je vragen hebt.',
            chatWithYourAdmin: 'Chat met je beheerder',
            chatInAdmins: 'Chatten in #admins',
            addPaymentCard: 'Betaalkaart toevoegen',
            goToSubscription: 'Ga naar Abonnement',
        },
        rules: {
            individualExpenseRules: {
                title: 'Declaraties',
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Stel uitgavenlimieten en standaardwaarden in voor afzonderlijke uitgaven. Je kunt ook regels maken voor <a href="${categoriesPageLink}">categorieën</a> en <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                receiptRequiredAmount: 'Vereist bedrag voor bon',
                receiptRequiredAmountDescription: 'Bonnen verplicht stellen wanneer de uitgaven dit bedrag overschrijden, tenzij dit wordt overschreven door een categoriewaarde.',
                receiptRequiredAmountError: ({amount}: {amount: string}) => `Bedrag kan niet hoger zijn dan het bedrag dat vereist is voor gespecificeerde bonnen (${amount})`,
                itemizedReceiptRequiredAmount: 'Gespecificeerde bon vereist bedrag',
                itemizedReceiptRequiredAmountDescription:
                    'Vereis gespecificeerde bonnen wanneer de uitgaven dit bedrag overschrijden, tenzij dit wordt overschreven door een categoriewaarde.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `Bedrag kan niet lager zijn dan het bedrag dat vereist is voor reguliere bonnen (${amount})`,
                maxExpenseAmount: 'Maximumbedrag uitgave',
                maxExpenseAmountDescription: 'Markeer uitgaven die dit bedrag overschrijden, tenzij dit wordt overschreven door een categorielimiet.',
                maxAge: 'Max. leeftijd',
                maxExpenseAge: 'Maximale declaratieleeftijd',
                maxExpenseAgeDescription: 'Uitgaven markeren die ouder zijn dan een specifiek aantal dagen.',
                maxExpenseAgeDays: () => ({
                    one: '1 dag',
                    other: (count: number) => `${count} dagen`,
                }),
                cashExpenseDefault: 'Standaard contante uitgave',
                cashExpenseDefaultDescription:
                    'Kies hoe contante uitgaven moeten worden aangemaakt. Een uitgave wordt beschouwd als een contante uitgave als het geen geïmporteerde zakelijke kaarttransactie is. Dit omvat handmatig aangemaakte uitgaven, bonnetjes, dagvergoedingen, afstands- en tijdsgebonden uitgaven.',
                reimbursableDefault: 'Vergoedbaar',
                reimbursableDefaultDescription: 'Onkosten worden meestal terugbetaald aan werknemers',
                nonReimbursableDefault: 'Niet-vergoedbaar',
                nonReimbursableDefaultDescription: 'Onkosten worden af en toe terugbetaald aan werknemers',
                alwaysReimbursable: 'Altijd te vergoeden',
                alwaysReimbursableDescription: 'Declaraties worden altijd terugbetaald aan medewerkers',
                alwaysNonReimbursable: 'Altijd niet-vergoedbaar',
                alwaysNonReimbursableDescription: 'Declaraties worden nooit aan werknemers terugbetaald',
                billableDefault: 'Factureerbaar standaard',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Kies of contante en creditcarduitgaven standaard factureerbaar moeten zijn. Factureerbare uitgaven worden in- of uitgeschakeld in <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                billable: 'Factureerbaar',
                billableDescription: 'Onkosten worden meestal opnieuw aan klanten gefactureerd',
                nonBillable: 'Niet-declarabel',
                nonBillableDescription: 'Onkosten worden af en toe opnieuw aan klanten gefactureerd',
                eReceipts: 'eBonnen',
                eReceiptsHint: `E-bonnen worden automatisch aangemaakt [voor de meeste USD-credittransacties](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Bijhouden van aanwezigen',
                attendeeTrackingHint: 'Volg de kosten per persoon voor elke uitgave.',
                prohibitedDefaultDescription:
                    'Markeer alle bonnetjes waarop alcohol, gokken of andere verboden artikelen voorkomen. Declaraties met bonnetjes waarop deze posten voorkomen, moeten handmatig worden beoordeeld.',
                prohibitedExpenses: 'Verboden uitgaven',
                alcohol: 'Alcohol',
                hotelIncidentals: 'Hotelnevenkosten',
                gambling: 'Gokken',
                tobacco: 'Tabak',
                adultEntertainment: 'Volwassenenentertainment',
                requireCompanyCard: 'Bedrijfskaarten vereisen voor alle aankopen',
                requireCompanyCardDescription: 'Markeer alle contante uitgaven, inclusief kilometer- en dagvergoedingen.',
            },
            expenseReportRules: {
                title: 'Geavanceerd',
                subtitle: 'Automatiseer naleving, goedkeuringen en betalingen van onkostendeclaraties.',
                preventSelfApprovalsTitle: 'Zelfgoedkeuringen voorkomen',
                preventSelfApprovalsSubtitle: 'Voorkom dat werkruimtedeelnemers hun eigen onkostendeclaraties goedkeuren.',
                autoApproveCompliantReportsTitle: 'Rapporten die voldoen automatisch goedkeuren',
                autoApproveCompliantReportsSubtitle: 'Configureer welke onkostendeclaraties in aanmerking komen voor automatische goedkeuring.',
                autoApproveReportsUnderTitle: 'Rapporten automatisch goedkeuren onder',
                autoApproveReportsUnderDescription: 'Volledig conforme onkostendeclaraties onder dit bedrag worden automatisch goedgekeurd.',
                randomReportAuditTitle: 'Willekeurige rapportcontrole',
                randomReportAuditDescription: 'Vereisen dat sommige rapporten handmatig worden goedgekeurd, zelfs als ze in aanmerking komen voor automatische goedkeuring.',
                autoPayApprovedReportsTitle: 'Automatisch betaalde goedgekeurde rapporten',
                autoPayApprovedReportsSubtitle: 'Configureer welke onkostendeclaraties in aanmerking komen voor automatische betaling.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Voer een bedrag in dat lager is dan ${currency ?? ''}20.000`,
                autoPayApprovedReportsLockedSubtitle: 'Ga naar Meer functies en schakel Workflows in, voeg vervolgens Betalingen toe om deze functie te ontgrendelen.',
                autoPayReportsUnderTitle: 'Rapporten automatisch betalen onder',
                autoPayReportsUnderDescription: 'Volledig conforme onkostendeclaraties onder dit bedrag worden automatisch betaald.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Voeg ${featureName} toe om deze functie te ontgrendelen.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Ga naar [meer functies](${moreFeaturesLink}) en schakel ${featureName} in om deze functie te ontgrendelen.`,
            },
            categoryRules: {
                title: 'Categorisatieregels',
                approver: 'Fiatteur',
                requireDescription: 'Beschrijving vereist',
                requireFields: 'Velden verplicht stellen',
                requiredFieldsTitle: 'Verplichte velden',
                requiredFieldsDescription: (categoryName: string) => `Dit is van toepassing op alle uitgaven die zijn gecategoriseerd als <strong>${categoryName}</strong>.`,
                requireAttendees: 'Aanwezigen verplicht stellen',
                descriptionHint: 'Beschrijvingstip',
                descriptionHintDescription: (categoryName: string) =>
                    `Herinner medewerkers eraan om extra informatie te geven voor uitgaven in de categorie “${categoryName}”. Deze tip verschijnt in het omschrijvingsveld van uitgaven.`,
                descriptionHintLabel: 'Hint',
                descriptionHintSubtitle: 'Pro-tip: Hoe korter, hoe beter!',
                maxAmount: 'Maximum bedrag',
                flagAmountsOver: 'Bedragen markeren boven',
                flagAmountsOverDescription: (categoryName: string) => `Is van toepassing op de categorie ‘${categoryName}’.`,
                flagAmountsOverSubtitle: 'Dit overschrijft het maximumbedrag voor alle uitgaven.',
                expenseLimitTypes: {
                    expense: 'Individuele uitgave',
                    expenseSubtitle: 'Markeer onkostbedragen per categorie. Deze regel overschrijft de algemene werkruimte-regel voor het maximale onkostbedrag.',
                    daily: 'Categorietotaal',
                    dailySubtitle: 'Markeer totale dagelijkse categoriebesteding per onkostendeclaratie.',
                },
                requireReceiptsOver: 'Bonnetjes vereist boven',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standaard`,
                    never: 'Nooit bonnetjes vereisen',
                    always: 'Altijd bonnetjes vereisen',
                },
                requireItemizedReceiptsOver: 'Vereis gespecificeerde bonnen boven',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Standaard`,
                    never: 'Nooit gespecificeerde bonnen vereisen',
                    always: 'Altijd gespecificeerde bonnen vereisen',
                },
                defaultTaxRate: 'Standaardbelastingtarief',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Ga naar [Meer functies](${moreFeaturesLink}) en schakel workflows in, voeg vervolgens goedkeuringen toe om deze functie te ontgrendelen.`,
            },
            customRules: {
                title: 'Onkostennota-beleid',
                cardSubtitle: 'Hier staat het onkostebeleid van je team, zodat iedereen goed weet wat wel en niet wordt vergoed.',
            },
            merchantRules: {
                title: 'Handelaar',
                subtitle: 'Stel de merchantregels zo in dat onkosten met de juiste codering binnenkomen en er minder nabewerking nodig is.',
                addRule: 'Merchantregel toevoegen',
                ruleSummaryTitle: (merchantName: string, isExactMatch: boolean) => `Als handelaar ${isExactMatch ? 'komt exact overeen' : 'bevat'} "${merchantName}"`,
                ruleSummarySubtitleMerchant: (merchantName: string) => `Naam handelaar wijzigen in "${merchantName}"`,
                ruleSummarySubtitleUpdateField: (fieldName: string, fieldValue: string) => `Werk ${fieldName} bij naar "${fieldValue}"`,
                ruleSummarySubtitleReimbursable: (reimbursable: boolean) => `Markeren als  "${reimbursable ? 'Vergoedbaar' : 'niet-vergoedbaar'}"`,
                ruleSummarySubtitleBillable: (billable: boolean) => `Markeren als "${billable ? 'factureerbaar' : 'niet-factureerbaar'}"`,
                addRuleTitle: 'Regel toevoegen',
                expensesWith: 'Voor uitgaven met:',
                applyUpdates: 'Deze updates toepassen:',
                saveRule: 'Regel opslaan',
                confirmError: 'Voer een leverancier in en pas ten minste één wijziging toe',
                confirmErrorMerchant: 'Voer handelaar in',
                confirmErrorUpdate: 'Breng ten minste één wijziging aan alstublieft',
                editRuleTitle: 'Regel bewerken',
                deleteRule: 'Regel verwijderen',
                deleteRuleConfirmation: 'Weet je zeker dat je deze regel wilt verwijderen?',
                previewMatches: 'Voorvertoning komt overeen',
                previewMatchesEmptyStateTitle: 'Niets om weer te geven',
                previewMatchesEmptyStateSubtitle: 'Geen niet-ingediende uitgaven komen overeen met deze regel.',
                matchType: 'Type overeenkomen',
                matchTypeContains: 'Bevat',
                matchTypeExact: 'Komt exact overeen',
                expensesExactlyMatching: 'Voor uitgaven die exact overeenkomen met:',
                duplicateRuleTitle: 'Soortgelijke regel voor dezelfde handelaar bestaat al',
                duplicateRulePrompt: (merchantName: string) => `Wilt je een nieuwe regel voor "${merchantName}" opslaan, ook al heb je al een bestaande?`,
                saveAnyway: 'Toch opslaan',
                applyToExistingUnsubmittedExpenses: 'Toepassen op bestaande niet-ingediende onkosten',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Incasseren',
                    description: 'Voor teams die hun processen willen automatiseren.',
                },
                corporate: {
                    label: 'Controle',
                    description: 'Voor organisaties met geavanceerde vereisten.',
                },
            },
            description: 'Kies een pakket dat bij je past. Voor een gedetailleerd overzicht van functies en prijzen, bekijk onze',
            subscriptionLink: 'hulppagina voor abonnementssoorten en prijzen',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Je hebt je vastgelegd op 1 actief lid in het Control-abonnement tot je jaarlijkse abonnement afloopt op ${annualSubscriptionEndDate}. Je kunt overschakelen naar een abonnement op basis van verbruik en downgraden naar het Collect-abonnement vanaf ${annualSubscriptionEndDate} door automatisch verlengen uit te schakelen in`,
                other: `Je hebt je tot het einde van je jaarlijkse abonnement op ${annualSubscriptionEndDate} vastgelegd op ${count} actieve leden in het Control-abonnement. Je kunt overschakelen naar een gebruiksabonnement en downgraden naar het Collect-abonnement vanaf ${annualSubscriptionEndDate} door automatisch verlengen uit te schakelen in`,
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
        scheduleACall: 'Gesprek plannen',
        questionMarkButtonTooltip: 'Krijg hulp van ons team',
        exploreHelpDocs: 'Helpdocumentatie verkennen',
        registerForWebinar: 'Registreren voor webinar',
        onboardingHelp: 'Onboardinghulp',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Standaardtint huidkleur wijzigen',
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
        roomName: 'Kamernnaam',
        visibility: 'Zichtbaarheid',
        restrictedDescription: 'Mensen in je werkruimte kunnen deze ruimte vinden',
        privateDescription: 'Mensen die voor deze ruimte zijn uitgenodigd, kunnen deze vinden',
        publicDescription: 'Iedereen kan deze ruimte vinden',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Iedereen kan deze ruimte vinden',
        createRoom: 'Ruimte aanmaken',
        roomAlreadyExistsError: 'Er bestaat al een kamer met deze naam',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} is een standaardruimte in alle werkruimten. Kies alstublieft een andere naam.`,
        roomNameInvalidError: 'Ruimtenamen mogen alleen kleine letters, cijfers en koppeltekens bevatten',
        pleaseEnterRoomName: 'Voer een kamernaam in',
        pleaseSelectWorkspace: 'Selecteer een workspace',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor}hernoemd naar "${newName}" (voorheen "${oldName}")` : `${actor}heeft deze kamer hernoemd naar "${newName}" (voorheen "${oldName}")`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Kamer hernoemd naar ${newName}`,
        social: 'Sociaal',
        selectAWorkspace: 'Selecteer een workspace',
        growlMessageOnRenameError: 'Kan werkruimtechat niet hernoemen. Controleer je verbinding en probeer het opnieuw.',
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
        billcom: 'Bill.com',
    },
    workspaceActions: {
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `het bedrijfsadres gewijzigd naar "${newAddress}" (voorheen "${previousAddress}")` : `stel het bedrijfsadres in op "${newAddress}"`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `${approverName} (${approverEmail}) toegevoegd als goedkeurder voor het veld ${field} "${name}"`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `heeft ${approverName} (${approverEmail}) verwijderd als goedkeurder voor het ${field} "${name}"`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `heeft de fiatteur voor het veld ${field} "${name}" gewijzigd naar ${formatApprover(newApproverName, newApproverEmail)} (voorheen ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `heeft de categorie "${categoryName}" toegevoegd`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `heeft de categorie "${categoryName}" verwijderd`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'Uitgeschakeld' : 'ingeschakeld'} de categorie "${categoryName}"`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `heeft de looncode "${newValue}" toegevoegd aan de categorie "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `heeft de looncode "${oldValue}" verwijderd uit de categorie "${categoryName}"`;
            }
            return `heeft de looncode van categorie "${categoryName}" gewijzigd naar “${newValue}” (voorheen “${oldValue}”)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `heeft de GL-code "${newValue}” toegevoegd aan de categorie "${categoryName}"`;
            }
            if (!newValue && oldValue) {
                return `heeft de GL-code "${oldValue}" verwijderd uit de categorie "${categoryName}"`;
            }
            return `GL-code van categorie “${categoryName}” gewijzigd naar “${newValue}” (was eerder “${oldValue}“)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `heeft de categoriebeschrijving van "${categoryName}" gewijzigd naar ${!oldValue ? 'vereist' : 'Niet vereist'} (voorheen ${!oldValue ? 'Niet vereist' : 'vereist'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `heeft een maximaal bedrag van ${newAmount} toegevoegd aan de categorie "${categoryName}"`;
            }
            if (oldAmount && !newAmount) {
                return `heeft het maximum bedrag ${oldAmount} verwijderd uit de categorie "${categoryName}"`;
            }
            return `heeft het maximumbedrag voor de categorie "${categoryName}" gewijzigd naar ${newAmount} (voorheen ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `heeft een limiettype van ${newValue} toegevoegd aan de categorie "${categoryName}"`;
            }
            return `heeft het "${categoryName}"-categorielimiettype gewijzigd naar ${newValue} (voorheen ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `heeft de categorie "${categoryName}" bijgewerkt door Bonnetjes te wijzigen in ${newValue}`;
            }
            return `heeft de categorie "${categoryName}" gewijzigd naar ${newValue} (voorheen ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `heeft de categorie "${categoryName}" bijgewerkt door Gedetailleerde bonnen te wijzigen naar ${newValue}`;
            }
            return `heeft de Gedetailleerde bonnen van categorie "${categoryName}" gewijzigd naar ${newValue} (voorheen ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `de categorie "${oldName}" hernoemd naar "${newName}"`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `heeft de beschrijvingshint "${oldValue}" verwijderd uit de categorie "${categoryName}"`;
            }
            return !oldValue
                ? `heeft de beschrijvingshint "${newValue}" toegevoegd aan de categorie "${categoryName}"`
                : `heeft de categorie-beschrijvingshint van "${categoryName}" gewijzigd naar “${newValue}” (voorheen “${oldValue}”)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `de taglijstnaam gewijzigd in "${newName}" (voorheen "${oldName}")`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `heeft de tag "${tagName}" toegevoegd aan de lijst "${tagListName}"`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `heeft de taglijst "${tagListName}" bijgewerkt door de tag "${oldName}" te wijzigen in "${newName}"`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} de tag '${tagName}' op de lijst '${tagListName}'`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `heeft de tag "${tagName}" verwijderd uit de lijst "${tagListName}"`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `heeft "${count}" labels verwijderd uit de lijst "${tagListName}"`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `heeft de tag "${tagName}" op de lijst "${tagListName}" bijgewerkt door de ${updatedField} te wijzigen in "${newValue}" (voorheen "${oldValue}")`;
            }
            return `heeft de tag "${tagName}" in de lijst "${tagListName}" bijgewerkt door een ${updatedField} met de waarde "${newValue}" toe te voegen`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `heeft de ${customUnitName} ${updatedField} gewijzigd naar „${newValue}” (voorheen „${oldValue}”)`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'ingeschakeld' : 'Uitgeschakeld'} belastingregistratie op afstandstarieven`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `heeft een nieuw "${customUnitName}" tarief "${rateName}" toegevoegd`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `heeft het tarief van de ${customUnitName} ${updatedField} "${customUnitRateName}" gewijzigd naar "${newValue}" (voorheen "${oldValue}")`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `heeft het belastingtarief op het afstanden tarief "${customUnitRateName}" gewijzigd naar "${newValue} (${newTaxPercentage})" (voorheen "${oldValue} (${oldTaxPercentage})")`;
            }
            return `heeft het belastingtarief "${newValue} (${newTaxPercentage})" toegevoegd aan het afstandstarief "${customUnitRateName}"`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `heeft het terugvorderbare belastingdeel op het afstandstarief "${customUnitRateName}" gewijzigd naar "${newValue}" (voorheen "${oldValue}")`;
            }
            return `heeft een terugvorderbaar belastingdeel van "${newValue}" toegevoegd aan het kilometertarief "${customUnitRateName}"`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? 'Ingeschakeld' : 'Uitgeschakeld'} het ${customUnitName}-tarief "${customUnitRateName}"`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `heeft het tarief "${rateName}" met de eenheid "${customUnitName}" verwijderd`,
        addedReportField: (fieldType: string, fieldName?: string) => `rapportveld ${fieldType} "${fieldName}" toegevoegd`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `stel de standaardwaarde van het rapportveld "${fieldName}" in op "${defaultValue}"`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `heeft de optie "${optionName}" toegevoegd aan het rapportveld "${fieldName}"`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `heeft de optie "${optionName}" verwijderd uit het rapportveld "${fieldName}"`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'ingeschakeld' : 'Uitgeschakeld'} de optie "${optionName}" voor het rapportveld "${fieldName}"`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'ingeschakeld' : 'Uitgeschakeld'} alle opties voor het rapportveld "${fieldName}"`;
            }
            return `${allEnabled ? 'ingeschakeld' : 'Uitgeschakeld'} de optie "${optionName}" voor het rapportveld "${fieldName}", waardoor alle opties ${allEnabled ? 'ingeschakeld' : 'Uitgeschakeld'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `heeft ${fieldType}-rapportveld "${fieldName}" verwijderd`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `heeft "Zelfgoedkeuring voorkomen" bijgewerkt naar "${newValue === 'true' ? 'Ingeschakeld' : 'Uitgeschakeld'}" (voorheen "${oldValue === 'true' ? 'Ingeschakeld' : 'Uitgeschakeld'}")`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `stel de maandelijkse rapportindieningsdatum in op "${newValue}"`;
            }
            return `heeft de maandelijkse rapportindieningsdatum bijgewerkt naar "${newValue}" (voorheen "${oldValue}")`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `heeft "Kosten opnieuw doorberekenen aan klanten" bijgewerkt naar "${newValue}" (voorheen "${oldValue}")`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `"Standaard contante uitgave" bijgewerkt naar "${newValue}" (voorheen "${oldValue}")`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `heeft "Standaardtitels voor rapporten afdwingen" ingeschakeld ${value ? 'aan' : 'Uit'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `heeft de naam van deze workspace bijgewerkt naar "${newName}" (voorheen "${oldName}")`,
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
                one: `heeft je verwijderd uit de goedkeuringsworkflow en onkostenchat van ${joinedNames}. Eerder ingediende rapporten blijven beschikbaar voor goedkeuring in je inbox.`,
                other: `heeft je verwijderd uit de goedkeuringsworkflows en onkostenchats van ${joinedNames}. Eerder ingediende rapporten blijven beschikbaar voor goedkeuring in je Inbox.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `heeft je rol in ${policyName} gewijzigd van ${oldRole} naar gebruiker. Je bent verwijderd uit alle onkostenchats van indieners, behalve uit je eigen.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `standaardvaluta bijgewerkt naar ${newCurrency} (voorheen ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `heeft de automatische rapportagefrequentie bijgewerkt naar "${newFrequency}" (voorheen "${oldFrequency}")`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `goedkeuringsmodus bijgewerkt naar ‘${newValue}’ (voorheen ‘${oldValue}’)`,
        upgradedWorkspace: 'heeft deze workspace geüpgraded naar het Control-abonnement',
        forcedCorporateUpgrade: `Deze werkruimte is geüpgraded naar het Control-abonnement. Klik <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">hier</a> voor meer informatie.`,
        downgradedWorkspace: 'heeft deze workspace gedowngraded naar het Collect-abonnement',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `heeft het percentage van rapporten dat willekeurig wordt doorgestuurd voor handmatige goedkeuring gewijzigd naar ${Math.round(newAuditRate * 100)}% (voorheen ${Math.round(oldAuditRate * 100)}%)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `heeft de handmatige goedkeuringslimiet voor alle uitgaven gewijzigd naar ${newLimit} (voorheen ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} categorieën`;
                case 'tags':
                    return `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} tags`;
                case 'workflows':
                    return `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} workflows`;
                case 'distance rates':
                    return `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} afstandstarieven`;
                case 'accounting':
                    return `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} boekhouding`;
                case 'Expensify Cards':
                    return `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} Expensify Cards`;
                case 'company cards':
                    return `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} bedrijfskaarten`;
                case 'invoicing':
                    return `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} facturatie`;
                case 'per diem':
                    return `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} dagvergoeding`;
                case 'receipt partners':
                    return `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} bonpartners`;
                case 'rules':
                    return `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} regels`;
                case 'tax tracking':
                    return `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} belastingregistratie`;
                default:
                    return `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} bijhouden van deelnemers`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'ingeschakeld' : 'uitgeschakeld'} terugbetalingen`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `heeft de belasting “${taxName}” toegevoegd`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `heeft de belasting “${taxName}” verwijderd`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `heeft de belasting "${oldValue}" gewijzigd in "${newValue}"`;
                }
                case 'code': {
                    return `heeft de belastingcode voor "${taxName}" gewijzigd van "${oldValue}" naar "${newValue}"`;
                }
                case 'rate': {
                    return `heeft het belastingtarief voor „${taxName}” gewijzigd van „${oldValue}” naar „${newValue}”`;
                }
                case 'enabled': {
                    return `${oldValue ? 'Uitgeschakeld' : 'ingeschakeld'} de belasting “${taxName}”`;
                }
                default: {
                    return '';
                }
            }
        },
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `heeft de formule voor de aangepaste rapportnaam gewijzigd in "${newValue}" (voorheen "${oldValue}")`,
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `standaardgoedkeurder gewijzigd in ${newApprover} (voorheen ${previousApprover})` : `heeft de standaardgoedkeurder gewijzigd naar ${newApprover}`,
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
            let text = `heeft de goedkeuringsworkflow voor ${members} gewijzigd om rapporten in te dienen bij ${approver}`;
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
                ? `heeft de goedkeuringsworkflow voor ${members} gewijzigd zodat rapporten bij de standaardgoedkeurder ${approver} worden ingediend`
                : `heeft de goedkeuringsworkflow voor ${members} gewijzigd zodat rapporten bij de standaardgoedkeurder worden ingediend`;
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
                ? `heeft de goedkeuringsworkflow voor ${approver} gewijzigd zodat goedgekeurde rapporten worden doorgestuurd naar ${forwardsTo} (voorheen doorgestuurd naar ${previousForwardsTo})`
                : `goedkeuringsworkflow voor ${approver} gewijzigd zodat goedgekeurde rapporten worden doorgestuurd naar ${forwardsTo} (voorheen definitief goedgekeurde rapporten)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `heeft de goedkeuringsworkflow voor ${approver} gewijzigd zodat goedgekeurde rapporten niet meer worden doorgestuurd (voorheen doorgestuurd naar ${previousForwardsTo})`
                : `heeft de goedkeuringsworkflow voor ${approver} gewijzigd zodat goedgekeurde rapporten niet meer worden doorgestuurd`,
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
            `de standaard zakelijke bankrekening gewijzigd naar "${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber}" (voorheen "${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber}")`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `heeft de bedrijfsnaam op de factuur gewijzigd naar "${newValue}" (voorheen "${oldValue}")` : `stel de bedrijfsnaam van de factuur in op "${newValue}"`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue ? `heeft de bedrijfswebsite op de factuur gewijzigd naar "${newValue}" (voorheen "${oldValue}")` : `stel de bedrijfswebsite van de factuur in op "${newValue}"`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser
                ? `heeft de gemachtigde betaler gewijzigd in "${newReimburser}" (voorheen "${previousReimburser}")`
                : `heeft de gemachtigde betaler gewijzigd in "${newReimburser}"`,
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `stel het vereiste bonbedrag in op "${newValue}"`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `heeft het vereiste bonbedrag gewijzigd naar "${newValue}" (voorheen "${oldValue}")`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `vereiste bedrag op verwijderde bon (voorheen “${oldValue}”)`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximumbedrag voor uitgave instellen op "${newValue}"`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximale onkostensom gewijzigd naar "${newValue}" (voorheen "${oldValue}")`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximaal bedrag voor uitgave verwijderd (voorheen "${oldValue}")`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `stel maximale leeftijd uitgave in op "${newValue}" dagen`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximale uitgaafleeftijd gewijzigd naar "${newValue}" dagen (voorheen "${oldValue}")`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `maximale onkostendatum verwijderd (voorheen "${oldValue}" dagen)`,
        updatedAutoPayApprovedReports: ({enabled}: {enabled: boolean}) => `${enabled ? 'ingeschakeld' : 'Uitgeschakeld'} automatisch betaalde goedgekeurde rapporten`,
        setAutoPayApprovedReportsLimit: ({newLimit}: {newLimit: string}) => `stel de drempel voor automatische betaling van goedgekeurde rapporten in op "${newLimit}"`,
        updatedAutoPayApprovedReportsLimit: ({oldLimit, newLimit}: {oldLimit: string; newLimit: string}) =>
            `heeft de drempel voor automatisch betalen van goedgekeurde rapporten gewijzigd naar "${newLimit}" (voorheen "${oldLimit}")`,
        removedAutoPayApprovedReportsLimit: 'drempel voor automatisch betalen van goedgekeurde rapporten verwijderd',
    },
    roomMembersPage: {
        memberNotFound: 'Lid niet gevonden.',
        useInviteButton: 'Om een nieuw lid aan de chat toe te voegen, gebruik de uitnodigingsknop hierboven.',
        notAuthorized: `Je hebt geen toegang tot deze pagina. Als je deze ruimte probeert te joinen, vraag dan gewoon een lid van de ruimte om je toe te voegen. Iets anders aan de hand? Neem contact op met ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Het lijkt erop dat deze room is gearchiveerd. Voor vragen kun je contact opnemen met ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Weet je zeker dat je ${memberName} uit de ruimte wilt verwijderen?`,
            other: 'Weet je zeker dat je de geselecteerde leden uit de ruimte wilt verwijderen?',
        }),
        error: {
            genericAdd: 'Er is een probleem opgetreden bij het toevoegen van dit kamer­lid',
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
        action: 'Voltooien',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `taak voor ${title}`,
            completed: 'Gemarkeerd als voltooid',
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
        title: ({year, monthName}: StatementTitleParams) => `Overzicht ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Sneltoetsen',
        subtitle: 'Bespaar tijd met deze handige sneltoetsen:',
        shortcuts: {
            openShortcutDialog: 'Opent het sneltoetsenvenster',
            markAllMessagesAsRead: 'Alle berichten als gelezen markeren',
            escape: 'Escape-dialogen',
            search: 'Zoekdialoog openen',
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
                subtitle: 'Maak een uitgave aan of neem een proefrit met Expensify om meer te leren.',
                subtitleWithOnlyCreateButton: 'Gebruik de groene knop hieronder om een uitgave aan te maken.',
            },
            emptyReportResults: {
                title: 'Je hebt nog geen rapporten gemaakt',
                subtitle: 'Maak een rapport of maak een proefrit met Expensify om meer te weten te komen.',
                subtitleWithOnlyCreateButton: 'Gebruik de groene knop hieronder om een rapport te maken.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Je hebt nog geen
                    facturen gemaakt
                `),
                subtitle: 'Stuur een factuur of maak een testrit met Expensify om meer te weten te komen.',
                subtitleWithOnlyCreateButton: 'Gebruik de groene knop hieronder om een factuur te verzenden.',
            },
            emptyTripResults: {
                title: 'Geen reizen om weer te geven',
                subtitle: 'Begin door hieronder je eerste reis te boeken.',
                buttonText: 'Boek een reis',
            },
            emptySubmitResults: {
                title: 'Geen uitgaven om in te dienen',
                subtitle: 'Je bent helemaal klaar. Neem een ererondje!',
                buttonText: 'Rapport maken',
            },
            emptyApproveResults: {
                title: 'Geen uitgaven om goed te keuren',
                subtitle: 'Nul onkosten. Maximale ontspanning. Goed gedaan!',
            },
            emptyPayResults: {
                title: 'Geen uitgaven om te betalen',
                subtitle: 'Gefeliciteerd! Je hebt de finish gehaald.',
            },
            emptyExportResults: {
                title: 'Geen uitgaven om te exporteren',
                subtitle: 'Tijd om het rustig aan te doen, goed werk.',
            },
            emptyStatementsResults: {
                title: 'Geen uitgaven om weer te geven',
                subtitle: 'Geen resultaten. Probeer je filters aan te passen.',
            },
            emptyUnapprovedResults: {
                title: 'Geen uitgaven om goed te keuren',
                subtitle: 'Nul onkosten. Maximale ontspanning. Goed gedaan!',
            },
        },
        columns: 'Kolommen',
        resetColumns: 'Kolommen resetten',
        groupColumns: 'Kolommen groeperen',
        expenseColumns: 'Uitgavekolommen',
        statements: 'Afschriften',
        unapprovedCash: 'Niet-goedgekeurde contanten',
        unapprovedCard: 'Niet-goedgekeurde kaart',
        reconciliation: 'Afstemming',
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
            hold: 'Wachten',
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
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Alle CSV geïmporteerde kaarten${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} is ${value}`,
            current: 'Huidig',
            past: 'Verleden',
            submitted: 'Ingediend',
            approved: 'Goedgekeurd',
            paid: 'Betaald',
            exported: 'Geëxporteerd',
            posted: 'Geplaatst',
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
                [CONST.SEARCH.GROUP_BY.TAG]: 'Tag',
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
        moneyRequestReport: {
            emptyStateTitle: 'Dit rapport bevat geen onkosten.',
            accessPlaceHolder: 'Open voor details',
        },
        noCategory: 'Geen categorie',
        noMerchant: 'Geen handelaar',
        noTag: 'Geen tag',
        expenseType: 'Onkostentype',
        withdrawalType: 'Type opname',
        recentSearches: 'Recente zoekopdrachten',
        recentChats: 'Recente chats',
        searchIn: 'Zoeken in',
        searchPlaceholder: 'Zoek iets',
        suggestions: 'Suggesties',
        exportSearchResults: {
            title: 'Export maken',
            description: 'Wow, dat zijn veel items! We bundelen ze, en Concierge stuurt je binnenkort een bestand.',
        },
        exportedTo: 'Exported to',
        exportAll: {
            selectAllMatchingItems: 'Selecteer alle overeenkomende items',
            allMatchingItemsSelected: 'Alle overeenkomende items geselecteerd',
        },
        topSpenders: 'Grootste uitgaven',
        view: {label: 'Bekijken', table: 'Tabel', bar: 'Bar'},
        chartTitles: {
            [CONST.SEARCH.GROUP_BY.FROM]: 'Van',
            [CONST.SEARCH.GROUP_BY.CARD]: 'Kaarten',
            [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'Exporten',
            [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Categorieën',
            [CONST.SEARCH.GROUP_BY.MERCHANT]: 'Handelaars',
            [CONST.SEARCH.GROUP_BY.TAG]: 'Tags',
            [CONST.SEARCH.GROUP_BY.MONTH]: 'Maanden',
            [CONST.SEARCH.GROUP_BY.WEEK]: 'Weken',
            [CONST.SEARCH.GROUP_BY.YEAR]: 'Jaren',
            [CONST.SEARCH.GROUP_BY.QUARTER]: 'Kwartalen',
        },
    },
    genericErrorPage: {
        title: 'O jee, er is iets misgegaan!',
        body: {
            helpTextMobile: 'Sluit de app en open deze opnieuw, of schakel over naar',
            helpTextWeb: 'web.',
            helpTextConcierge: 'Als het probleem zich blijft voordoen, neem contact op met',
        },
        refresh: 'Vernieuwen',
    },
    fileDownload: {
        success: {
            title: 'Gedownload!',
            message: 'Bijlage succesvol gedownload!',
            qrMessage:
                'Controleer je map met foto’s of downloads voor een kopie van je QR-code. Protip: voeg hem toe aan een presentatie zodat je publiek hem kan scannen en direct contact met je kan maken.',
        },
        generalError: {
            title: 'Bijlagefout',
            message: 'Bijlage kan niet worden gedownload',
        },
        permissionError: {
            title: 'Opslagtoegang',
            message: 'Expensify kan bijlagen niet opslaan zonder toegang tot opslag. Tik op Instellingen om de machtigingen bij te werken.',
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
        selectGroupByOption: 'Selecteer hoe u rapportuitgaven wilt groeperen',
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
            createExpense: 'Uitgave aanmaken',
            createReport: 'Rapport maken',
            chooseWorkspace: 'Kies een workspace voor dit rapport.',
            emptyReportConfirmationTitle: 'Je hebt al een leeg rapport',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Weet je zeker dat je een ander rapport wilt maken in ${workspaceName}? Je hebt toegang tot je lege rapporten in`,
            emptyReportConfirmationPromptLink: 'Rapporten',
            emptyReportConfirmationDontShowAgain: 'Niet meer weergeven',
            genericWorkspaceName: 'deze workspace',
        },
        genericCreateReportFailureMessage: 'Onverwachte fout bij het maken van deze chat. Probeer het later opnieuw.',
        genericAddCommentFailureMessage: 'Onverwachte fout bij het plaatsen van de opmerking. Probeer het later opnieuw.',
        genericUpdateReportFieldFailureMessage: 'Onverwachte fout bij het bijwerken van het veld. Probeer het later opnieuw.',
        genericUpdateReportNameEditFailureMessage: 'Onverwachte fout bij het hernoemen van het rapport. Probeer het later opnieuw.',
        noActivityYet: 'Nog geen activiteit',
        connectionSettings: 'Verbindingsinstellingen',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `${fieldName} gewijzigd naar "${newValue}" (voorheen "${oldValue}")`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `stel ${fieldName} in op "${newValue}"`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `heeft de workspace${fromPolicyName ? `(eerder ${fromPolicyName})` : ''} gewijzigd`;
                    }
                    return `heeft de workspace gewijzigd naar ${toPolicyName}${fromPolicyName ? `(eerder ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `type gewijzigd van ${oldType} naar ${newType}`,
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
                    automaticActionThree: 'en succesvol een record gemaakt voor',
                    reimburseableLink: 'kosten uit eigen zak',
                    nonReimbursableLink: 'bedrijfskaartuitgaven',
                    pending: (label: string) => `bezig met het exporteren van dit rapport naar ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `het is niet gelukt om dit rapport te exporteren naar ${label} ("${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}")`,
                managerAttachReceipt: `heeft een bonnetje toegevoegd`,
                managerDetachReceipt: `heeft een bon verwijderd`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `elders ${currency}${amount} elders betaald`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `${currency}${amount} betaald via integratie`,
                outdatedBankAccount: `kon de betaling niet verwerken vanwege een probleem met de bankrekening van de betaler`,
                reimbursementACHBounce: `kon de betaling niet verwerken vanwege een probleem met de bankrekening`,
                reimbursementACHCancelled: `heeft de betaling geannuleerd`,
                reimbursementAccountChanged: `kon de betaling niet verwerken, omdat de betaler van bankrekening is veranderd`,
                reimbursementDelayed: `heeft de betaling verwerkt, maar deze is met 1-2 extra werkdagen vertraagd`,
                selectedForRandomAudit: `willekeurig geselecteerd voor beoordeling`,
                selectedForRandomAuditMarkdown: `[Willekeurig geselecteerd](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) voor beoordeling`,
                share: ({to}: ShareParams) => `uitgenodigd lid ${to}`,
                unshare: ({to}: UnshareParams) => `verwijderd lid ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `betaald ${currency}${amount}`,
                takeControl: `heeft de controle overgenomen`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `er is een probleem opgetreden bij het synchroniseren met ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Los het probleem op in de <a href="${workspaceAccountingLink}">werkruimte-instellingen</a>.`,
                addEmployee: (email: string, role: string) => `${email} toegevoegd als ${role === 'member' ? 'een' : 'een'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `heeft de rol van ${email} gewijzigd naar ${newRole} (voorheen ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `aangepaste veld 1 van ${email} verwijderd (voorheen „${previousValue}”)`;
                    }
                    return !previousValue
                        ? `“${newValue}” toegevoegd aan aangepaste veld 1 van ${email}`
                        : `heeft aangepaste veld 1 van ${email} gewijzigd naar "${newValue}" (voorheen "${previousValue}")`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `aangepaste veld 2 van ${email} verwijderd (voorheen "${previousValue}")`;
                    }
                    return !previousValue
                        ? `"${newValue}" toegevoegd aan aangepaste veld 2 van ${email}`
                        : `heeft de aangepaste veld 2 van ${email} gewijzigd in "${newValue}" (voorheen "${previousValue}")`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} heeft de werkruimte verlaten`,
                removeMember: (email: string, role: string) => `${role} ${email} verwijderd`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `verbinding met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} verwijderd`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `verbonden met ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'heeft de chat verlaten',
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `De ${feedName}-verbinding is verbroken. Om kaartimporten te herstellen, <a href='${workspaceCompanyCardRoute}'>log in bij uw bank</a>.`,
                plaidBalanceFailure: ({maskedAccountNumber, walletRoute}: {maskedAccountNumber: string; walletRoute: string}) =>
                    `de Plaid-verbinding met uw zakelijke bankrekening is verbroken. <a href='${walletRoute}'>Verbind uw bankrekening ${maskedAccountNumber} opnieuw</a> om uw Expensify-kaarten te kunnen blijven gebruiken.`,
                settlementAccountLocked: ({maskedBankAccountNumber}: OriginalMessageSettlementAccountLocked, linkURL: string) =>
                    `zakelijke bankrekening ${maskedBankAccountNumber} is automatisch vergrendeld vanwege een probleem met de terugbetaling of de afwikkeling van de Expensify Card. Los het probleem op in je <a href="${linkURL}">werkruimte-instellingen</a>.`,
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
        receiptScanningApp: 'Bonnetjes-scanapp',
        billPay: 'Rekeningen betalen',
        invoicing: 'Facturatie',
        CPACard: 'CPA-kaart',
        payroll: 'Loonlijst',
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
        navigateToChatsList: 'Terug naar chatlijst',
        chatWelcomeMessage: 'Welkomstbericht voor chat',
        navigatesToChat: 'Navigeert naar een chat',
        newMessageLineIndicator: 'Indicator voor nieuwe berichtregel',
        chatMessage: 'Chatbericht',
        lastChatMessagePreview: 'Voorvertoning laatste chatbericht',
        workspaceName: 'Werkruimte naam',
        chatUserDisplayNames: 'Weergavenamen chatleden',
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
        spamDescription: 'Ongevraagde promotie buiten onderwerp',
        inconsiderate: 'Onattent',
        inconsiderateDescription: 'Beledigende of respectloze formulering, met dubieuze bedoelingen',
        intimidation: 'Intimidatie',
        intimidationDescription: 'Agressief een agenda nastreven ondanks geldige bezwaren',
        bullying: 'Pesten',
        bullyingDescription: 'Een individu als doelwit nemen om gehoorzaamheid af te dwingen',
        harassment: 'Intimidatie',
        harassmentDescription: 'Racistisch, vrouwonvriendelijk of ander breed discriminerend gedrag',
        assault: 'Aanval',
        assaultDescription: 'Specifiek gerichte emotionele aanval met de intentie om schade toe te brengen',
        flaggedContent: 'Dit bericht is gemarkeerd als in strijd met onze gemeenschapsregels en de inhoud is verborgen.',
        hideMessage: 'Bericht verbergen',
        revealMessage: 'Bericht weergeven',
        levelOneResult: 'Verstuurt een anonieme waarschuwing en bericht wordt gemeld ter beoordeling.',
        levelTwoResult: 'Bericht verborgen uit het kanaal, plus anonieme waarschuwing en bericht wordt gemeld voor beoordeling.',
        levelThreeResult: 'Bericht verwijderd uit kanaal plus anonieme waarschuwing en bericht is gemeld voor beoordeling.',
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
        submit: 'Verzend het naar iemand',
        categorize: 'Categoriseer het',
        share: 'Delen met mijn accountant',
        nothing: 'Niets voor nu',
    },
    teachersUnitePage: {
        teachersUnite: 'Leraren verenigd',
        joinExpensifyOrg:
            'Sluit je aan bij Expensify.org om onrecht overal ter wereld uit te bannen. De huidige campagne “Teachers Unite” ondersteunt onderwijzers overal door de kosten van essentiële schoolbenodigdheden te delen.',
        iKnowATeacher: 'Ik ken een leraar',
        iAmATeacher: 'Ik ben een leraar',
        getInTouch: 'Uitstekend! Deel hun gegevens zodat we contact met hen kunnen opnemen.',
        introSchoolPrincipal: 'Introductie tot je schooldirecteur',
        schoolPrincipalVerifyExpense:
            'Expensify.org deelt de kosten van essentiële schoolspullen, zodat leerlingen uit gezinnen met een laag inkomen een betere leerervaring kunnen hebben. Je directeur zal worden gevraagd je uitgaven te verifiëren.',
        principalFirstName: 'Voornaam van hoofdpersoon',
        principalLastName: 'Achternaam hoofd',
        principalWorkEmail: 'Primair zakelijke e-mailadres',
        updateYourEmail: 'Werk uw e-mailadres bij',
        updateEmail: 'E-mailadres bijwerken',
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Voordat je verdergaat, zorg er alsjeblieft voor dat je je school-e-mailadres als je standaard contactmethode instelt. Dit kun je doen via Instellingen > Profiel > <a href="${contactMethodsRoute}">Contactmethoden</a>.`,
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
        companySpend: 'Bedrijfsuitgaven',
    },
    distance: {
        addStop: 'Stop toevoegen',
        deleteWaypoint: 'Waypoint verwijderen',
        deleteWaypointConfirmation: 'Weet je zeker dat je dit waypoint wilt verwijderen?',
        address: 'Adres',
        waypointDescription: {
            start: 'Start',
            stop: 'Stop',
        },
        mapPending: {
            title: 'Toewijzing in behandeling',
            subtitle: 'De kaart wordt gegenereerd wanneer je weer online bent',
            onlineSubtitle: 'Een moment terwijl we de kaart instellen',
            errorTitle: 'Kaartfout',
            errorSubtitle: 'Er is een fout opgetreden bij het laden van de kaart. Probeer het opnieuw.',
        },
        error: {
            selectSuggestedAddress: 'Selecteer een voorgesteld adres of gebruik huidige locatie',
        },
        odometer: {startReading: 'Begin met lezen', endReading: 'Lezen beëindigen', saveForLater: 'Voor later bewaren', totalDistance: 'Totale afstand'},
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Rapportkaart kwijt of beschadigd',
        nextButtonLabel: 'Volgende',
        reasonTitle: 'Waarom heb je een nieuwe kaart nodig?',
        cardDamaged: 'Mijn kaart is beschadigd',
        cardLostOrStolen: 'Mijn kaart is verloren of gestolen',
        confirmAddressTitle: 'Bevestig het postadres voor je nieuwe kaart.',
        cardDamagedInfo: 'Je nieuwe kaart wordt binnen 2–3 werkdagen bezorgd. Je huidige kaart blijft werken totdat je je nieuwe kaart activeert.',
        cardLostOrStolenInfo: 'Je huidige kaart wordt permanent gedeactiveerd zodra je bestelling is geplaatst. De meeste kaarten komen binnen enkele werkdagen aan.',
        address: 'Adres',
        deactivateCardButton: 'Kaart deactiveren',
        shipNewCardButton: 'Nieuwe kaart verzenden',
        addressError: 'Adres is verplicht',
        reasonError: 'Reden is vereist',
        successTitle: 'Je nieuwe kaart is onderweg!',
        successDescription: 'Je moet hem activeren zodra hij over een paar werkdagen aankomt. In de tussentijd kun je een virtuele kaart gebruiken.',
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
            buttonText: 'Dien een declaratie in, <success><strong>verwijs je team door</strong></success>.',
            header: 'Dien een declaratie in, verwijs je team door',
            body: 'Wil je dat je team Expensify ook gebruikt? Dien gewoon een uitgave bij hen in en wij zorgen voor de rest.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Een vriend doorverwijzen',
            body: 'Wil je dat je vrienden Expensify ook gebruiken? Chat gewoon met hen, betaal of splits een uitgave en wij zorgen voor de rest. Of deel gewoon je uitnodigingslink!',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Een vriend doorverwijzen',
            header: 'Een vriend doorverwijzen',
            body: 'Wil je dat je vrienden Expensify ook gebruiken? Chat gewoon met hen, betaal of splits een uitgave en wij zorgen voor de rest. Of deel gewoon je uitnodigingslink!',
        },
        copyReferralLink: 'Uitnodigingslink kopiëren',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Chat met je setup specialist in <a href="${href}">${adminReportName}</a> voor hulp`,
        default: `Stuur een bericht naar <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> voor hulp bij het instellen`,
    },
    violations: {
        allTagLevelsRequired: 'Alle tags vereist',
        autoReportedRejectedExpense: 'Deze uitgave is afgewezen.',
        billableExpense: 'Factureerbaar niet langer geldig',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Bon verplicht${formattedLimit ? `meer dan ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Categorie niet langer geldig',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Toegepaste ${surcharge}% omrekeningskostensurcharge`,
        customUnitOutOfPolicy: 'Tarief niet geldig voor deze workspace',
        duplicatedTransaction: 'Mogelijke duplicaat',
        fieldRequired: 'Rapportvelden zijn verplicht',
        futureDate: 'Toekomstige datum niet toegestaan',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Met ${invoiceMarkup}% verhoogd`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Datum ouder dan ${maxAge} dagen`,
        missingCategory: 'Ontbrekende categorie',
        missingComment: 'Beschrijving vereist voor geselecteerde categorie',
        missingAttendees: 'Meerdere deelnemers vereist voor deze categorie',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Ontbreekt ${tagName ?? 'label'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Bedrag wijkt af van berekende afstand';
                case 'card':
                    return 'Bedrag is groter dan de kaarttransactie';
                default:
                    if (displayPercentVariance) {
                        return `Bedrag is ${displayPercentVariance}% hoger dan de gescande bon`;
                    }
                    return 'Bedrag is hoger dan het gescande bonnetje';
            }
        },
        modifiedDate: 'Datum wijkt af van gescande bon',
        nonExpensiworksExpense: 'Onkost buiten Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Onkosten overschrijden de automatische goedkeuringslimiet van ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Bedrag boven de categorie limiet van ${formattedLimit}/persoon`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Bedrag boven limiet van ${formattedLimit}/persoon`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Bedrag boven ${formattedLimit}/reislimiet`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Bedrag boven limiet van ${formattedLimit}/persoon`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Bedrag boven de dagelijkse categoriegrens van ${formattedLimit}/persoon`,
        receiptNotSmartScanned: 'Bon- en onkostendetails handmatig toegevoegd.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Bon vereist boven categoriegrens van ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Bon nodig boven ${formattedLimit}`;
            }
            if (category) {
                return `Bon nodig boven categorielimiet`;
            }
            return 'Bon vereist';
        },
        itemizedReceiptRequired: ({formattedLimit}: {formattedLimit?: string}) => `Gespecificeerde bon vereist${formattedLimit ? ` boven ${formattedLimit}` : ''}`,
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
                    : 'Bankverbinding verbroken. Vraag een beheerder om opnieuw te verbinden om de bon te matchen.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Vraag ${member} om het als contant te markeren of wacht 7 dagen en probeer het opnieuw` : 'In afwachting van samenvoeging met kaarttransactie.';
            }
            return '';
        },
        brokenConnection530Error: 'Bon in behandeling vanwege verbroken bankverbinding',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Bon wachtend vanwege verbroken bankverbinding. Los dit op in <a href="${workspaceCompanyCardRoute}">Bedrijfskaarten</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Bon wordt vastgehouden vanwege een verbroken bankverbinding. Vraag een workspace-beheerder om dit op te lossen.',
        markAsCashToIgnore: 'Markeren als contant om te negeren en betaling aan te vragen.',
        smartscanFailed: ({canEdit = true}) => `Scannen van bon mislukt.${canEdit ? 'Voer gegevens handmatig in.' : ''}`,
        receiptGeneratedWithAI: 'Potentieel door AI gegenereerde bon',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Ontbrekende ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} niet langer geldig`,
        taxAmountChanged: 'Belastingbedrag is gewijzigd',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Belasting'} niet langer geldig`,
        taxRateChanged: 'Belastingtarief is gewijzigd',
        taxRequired: 'Ontbrekend belastingtarief',
        none: 'Geen',
        taxCodeToKeep: 'Kies welke belastingcode je wilt behouden',
        tagToKeep: 'Kies welke tag je wilt behouden',
        isTransactionReimbursable: 'Kies of de transactie te vergoeden is',
        merchantToKeep: 'Kies welke handelaar je wilt behouden',
        descriptionToKeep: 'Kies welke beschrijving je wilt behouden',
        categoryToKeep: 'Kies welke categorie je wilt behouden',
        isTransactionBillable: 'Kies of de transactie factureerbaar is',
        keepThisOne: 'Deze behouden',
        confirmDetails: `Bevestig de gegevens die je behoudt`,
        confirmDuplicatesInfo: `De duplicaten die je niet behoudt, worden bewaard zodat de indiener ze kan verwijderen.`,
        hold: 'Deze uitgave is in de wacht gezet',
        resolvedDuplicates: 'het duplicaat opgelost',
        companyCardRequired: 'Aankopen met bedrijfskaart verplicht',
        noRoute: 'Selecteer een geldig adres',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} is verplicht`,
        reportContainsExpensesWithViolations: 'Rapport bevat declaraties met overtredingen.',
    },
    violationDismissal: {
        rter: {
            manual: 'heeft deze bon als contant gemarkeerd',
        },
        duplicatedTransaction: {
            manual: 'het duplicaat opgelost',
        },
    },
    videoPlayer: {
        play: 'Afspelen',
        pause: 'Pauze',
        fullscreen: 'Volledig scherm',
        playbackSpeed: 'Afspeelsnelheid',
        expand: 'Uitvouwen',
        mute: 'Dempen',
        unmute: 'Dempen opheffen',
        normal: 'Normaal',
    },
    exitSurvey: {
        header: 'Voor je vertrekt',
        reasonPage: {
            title: 'Vertel ons alstublieft waarom u weggaat',
            subtitle: 'Vertel ons voordat je verdergaat waarom je wilt overstappen naar Expensify Classic.',
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
            'Je lijkt offline te zijn. Helaas werkt Expensify Classic niet offline, maar New Expensify wel. Als je liever Expensify Classic gebruikt, probeer het dan opnieuw wanneer je een internetverbinding hebt.',
        quickTip: 'Snelle tip...',
        quickTipSubTitle: 'Je kunt rechtstreeks naar Expensify Classic gaan door expensify.com te bezoeken. Voeg het toe aan je favorieten voor een snelle snelkoppeling!',
        bookACall: 'Een gesprek inplannen',
        bookACallTitle: 'Wilt je met een productmanager praten?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Direct chatten over uitgaven en rapporten',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Mogelijkheid om alles op mobiel te doen',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Reizen en declareren met de snelheid van chat',
        },
        bookACallTextTop: 'Door over te stappen naar Expensify Classic, loop je het volgende mis:',
        bookACallTextBottom:
            'We zouden het geweldig vinden om met u te bellen om te begrijpen waarom. U kunt een gesprek inplannen met een van onze senior productmanagers om uw wensen te bespreken.',
        takeMeToExpensifyClassic: 'Breng me naar Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Er is een fout opgetreden bij het laden van meer berichten',
        tryAgain: 'Opnieuw proberen',
    },
    systemMessage: {
        mergedWithCashTransaction: 'heeft een bon aan deze transactie gekoppeld',
    },
    subscription: {
        authenticatePaymentCard: 'Betalingskaart verifiëren',
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
                        ? `Je betaling van ${purchaseAmountOwed} op ${date} kon niet worden verwerkt. Voeg een betaalkaart toe om het openstaande bedrag te voldoen.`
                        : 'Voeg een betaalkaart toe om het verschuldigde bedrag te vereffenen.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Je betaalgegevens zijn verouderd',
                subtitle: (date: string) => `Uw betaling is achterstallig. Betaal uw factuur vóór ${date} om onderbreking van de dienst te voorkomen.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Je betaalgegevens zijn verouderd',
                subtitle: 'Uw betaling is achterstallig. Betaal uw factuur alstublieft.',
            },
            billingDisputePending: {
                title: 'Je kaart kon niet worden belast',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `Je hebt de ${amountOwed}-afschrijving betwist op de kaart die eindigt op ${cardEnding}. Je account wordt geblokkeerd totdat de betwisting met je bank is opgelost.`,
            },
            cardAuthenticationRequired: {
                title: 'Je betaalkaart is nog niet volledig geverifieerd.',
                subtitle: (cardEnding: string) => `Voltooi het verificatieproces om je betaalkaart met eindigend op ${cardEnding} te activeren.`,
            },
            insufficientFunds: {
                title: 'Je kaart kon niet worden belast',
                subtitle: (amountOwed: number) =>
                    `Uw betaalkaart is geweigerd wegens onvoldoende saldo. Probeer het opnieuw of voeg een nieuwe betaalkaart toe om uw openstaande saldo van ${amountOwed} te voldoen.`,
            },
            cardExpired: {
                title: 'Je kaart kon niet worden belast',
                subtitle: (amountOwed: number) => `Je betaalkaart is verlopen. Voeg een nieuwe betaalkaart toe om je openstaande saldo van ${amountOwed} te voldoen.`,
            },
            cardExpireSoon: {
                title: 'Je kaart verloopt binnenkort',
                subtitle:
                    'Je betaalkaart verloopt aan het einde van deze maand. Klik op het menu met de drie puntjes hieronder om deze te updaten en al je favoriete functies te blijven gebruiken.',
            },
            retryBillingSuccess: {
                title: 'Gelukt!',
                subtitle: 'Je kaart is succesvol belast.',
            },
            retryBillingError: {
                title: 'Je kaart kon niet worden belast',
                subtitle:
                    'Voordat je het opnieuw probeert, neem rechtstreeks contact op met je bank om betalingen aan Expensify goed te keuren en eventuele blokkades te verwijderen. Probeer anders een andere betaalkaart toe te voegen.',
            },
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Je hebt de ${amountOwed}-afschrijving betwist op de kaart die eindigt op ${cardEnding}. Je account wordt geblokkeerd totdat de betwisting met je bank is opgelost.`,
            preTrial: {
                title: 'Start een gratis proefperiode',
                subtitle: 'Als volgende stap kun je <a href="#">je instellingschecklist voltooien</a>, zodat je team kan beginnen met declareren.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Proef: nog ${numOfDays} ${numOfDays === 1 ? 'dag' : 'dagen'}!`,
                subtitle: 'Voeg een betaalkaart toe om al je favoriete functies te blijven gebruiken.',
            },
            trialEnded: {
                title: 'Je gratis proefperiode is beëindigd',
                subtitle: 'Voeg een betaalkaart toe om al je favoriete functies te blijven gebruiken.',
            },
            earlyDiscount: {
                claimOffer: 'Aanbieding verzilveren',
                subscriptionPageTitle: (discountType: number) =>
                    `<strong>${discountType}% korting op je eerste jaar!</strong> Voeg gewoon een betaalkaart toe en start een jaarlijks abonnement.`,
                onboardingChatTitle: (discountType: number) => `Aanbieding voor beperkte tijd: ${discountType}% korting op je eerste jaar!`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `Declareren binnen ${days > 0 ? `${days}d :` : ''}${hours}u : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Betaling',
            subtitle: 'Voeg een kaart toe om je Expensify-abonnement te betalen.',
            addCardButton: 'Betaalkaart toevoegen',
            cardInfo: (name: string, expiration: string, currency: string) => `Naam: ${name}, Vervaldatum: ${expiration}, Valuta: ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Je volgende betaaldatum is ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Kaart eindigend op ${cardNumber}`,
            changeCard: 'Betaalkaart wijzigen',
            changeCurrency: 'Betalingsvaluta wijzigen',
            cardNotFound: 'Geen betaalkaart toegevoegd',
            retryPaymentButton: 'Betaling opnieuw proberen',
            authenticatePayment: 'Betaling verifiëren',
            requestRefund: 'Terugbetaling aanvragen',
            requestRefundModal: {
                full: 'Een terugbetaling krijgen is eenvoudig: downgrade je account vóór je volgende factureringsdatum en je ontvangt een terugbetaling. <br /> <br /> Let op: als je je account downgrade, worden je werkruimtes verwijderd. Deze actie kan niet ongedaan worden gemaakt, maar je kunt altijd een nieuwe werkruimte aanmaken als je van gedachten verandert.',
                confirm: 'Workspace(s) verwijderen en downgraden',
            },
            viewPaymentHistory: 'Betalingsgeschiedenis bekijken',
        },
        yourPlan: {
            title: 'Je abonnement',
            exploreAllPlans: 'Bekijk alle abonnementen',
            customPricing: 'Aangepaste prijzen',
            asLowAs: ({price}: YourPlanPriceValueParams) => `al vanaf ${price} per actieve deelnemer/maand`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} per lid/maand`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} per lid per maand`,
            perMemberMonth: 'per lid/maand',
            collect: {
                title: 'Incasseren',
                description: 'Het kleine zakelijke abonnement dat je uitgaven, reizen en chat biedt.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                benefit1: 'Bonnetjesscan',
                benefit2: 'Terugbetalingen',
                benefit3: 'Beheer van bedrijfskaarten',
                benefit4: 'Declaraties en reisgoedkeuringen',
                benefit5: 'Reisboeking en regels',
                benefit6: 'QuickBooks/Xero-integraties',
                benefit7: 'Chat over uitgaven, rapporten en ruimtes',
                benefit8: 'AI- en menselijke ondersteuning',
            },
            control: {
                title: 'Controle',
                description: 'Declaraties, reizen en chat voor grotere bedrijven.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Van ${lower}/actief lid met de Expensify Card, ${upper}/actief lid zonder de Expensify Card.`,
                benefit1: 'Alles in het Collect-abonnement',
                benefit2: 'Goedkeuringsworkflows met meerdere niveaus',
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
            saveWithExpensifyDescription: 'Gebruik onze besparingscalculator om te zien hoe cashback van de Expensify Card je Expensify-factuur kan verlagen.',
            saveWithExpensifyButton: 'Meer informatie',
        },
        compareModal: {
            comparePlans: 'Plannen vergelijken',
            subtitle: `<muted-text>Ontgrendel de functies die je nodig hebt met het abonnement dat bij jou past. <a href="${CONST.PRICING}">Bekijk onze prijspagina</a> voor een volledig overzicht van de functies van elk van onze abonnementen.</muted-text>`,
        },
        details: {
            title: 'Abonnementsgegevens',
            annual: 'Jaarabonnement',
            taxExempt: 'Belastingenvrijstelling aanvragen',
            taxExemptEnabled: 'Vrijgesteld van belasting',
            taxExemptStatus: 'Belastingvrijstellingstatus',
            payPerUse: 'Betalen per gebruik',
            subscriptionSize: 'Abonnementsgrootte',
            headsUp:
                'Let op: Als je je abonnementsomvang nu niet instelt, stellen wij deze automatisch in op het aantal actieve leden in je eerste maand. Je bent dan verplicht om voor ten minste dit aantal leden te betalen gedurende de komende 12 maanden. Je kunt je abonnementsomvang op elk moment vergroten, maar je kunt deze niet verkleinen totdat je abonnement is afgelopen.',
            zeroCommitment: 'Geen verplichtingen tegen het gereduceerde jaarlijkse abonnements­tarief',
        },
        subscriptionSize: {
            title: 'Abonnementsgrootte',
            yourSize: 'De grootte van je abonnement is het aantal open plaatsen dat in een bepaalde maand door actieve leden kan worden ingevuld.',
            eachMonth:
                'Elke maand dekt je abonnement tot het aantal actieve leden dat hierboven is ingesteld. Telkens wanneer je je abonnementsomvang vergroot, begin je een nieuw 12-maandenabonnement met die nieuwe omvang.',
            note: 'Opmerking: Een actief lid is iedereen die onkosten heeft aangemaakt, bewerkt, ingediend, goedgekeurd, vergoed of geëxporteerd die zijn gekoppeld aan de werkruimte van uw bedrijf.',
            confirmDetails: 'Bevestig de details van je nieuwe jaarlijkse abonnement:',
            subscriptionSize: 'Abonnementsgrootte',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} actieve leden/maand`,
            subscriptionRenews: 'Abonnement wordt verlengd',
            youCantDowngrade: 'Je kunt je jaarlijkse abonnement niet downgraden.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Je hebt al toegezegd aan een jaarlijks abonnement van ${size} actieve leden per maand tot ${date}. Je kunt op ${date} overschakelen naar een abonnement op basis van gebruik door automatisch verlengen uit te schakelen.`,
            error: {
                size: 'Voer een geldig abonnementsaantal in',
                sameSize: 'Voer een ander getal in dan uw huidige abonnementsomvang',
            },
        },
        paymentCard: {
            addPaymentCard: 'Betaalkaart toevoegen',
            enterPaymentCardDetails: 'Voer je betaalkaartgegevens in',
            security: 'Expensify is PCI-DSS-conform, gebruikt versleuteling op bankniveau en maakt gebruik van redundante infrastructuur om je gegevens te beschermen.',
            learnMoreAboutSecurity: 'Meer informatie over onze beveiliging.',
        },
        subscriptionSettings: {
            title: 'Abonnementsinstellingen',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Abonnementstype: ${subscriptionType}, Abonnementsgrootte: ${subscriptionSize}, Automatisch verlengen: ${autoRenew}, Aantal jaarlijkse licenties automatisch verhogen: ${autoIncrease}`,
            none: 'geen',
            on: 'aan',
            off: 'Uit',
            annual: 'Jaarlijks',
            autoRenew: 'Automatisch verlengen',
            autoIncrease: 'Jaarlijkse seats automatisch verhogen',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Bespaar tot ${amountWithCurrency}/maand per actief lid`,
            automaticallyIncrease:
                'Verhoog je jaarlijkse aantal seats automatisch om actieve leden op te vangen die je abonnementsomvang overschrijden. Opmerking: hierdoor wordt de einddatum van je jaarlijkse abonnement verlengd.',
            disableAutoRenew: 'Automatisch verlengen uitschakelen',
            helpUsImprove: 'Help ons Expensify verbeteren',
            whatsMainReason: 'Wat is de belangrijkste reden waarom je automatische verlenging uitschakelt?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Wordt verlengd op ${date}.`,
            pricingConfiguration: 'De prijs is afhankelijk van de configuratie. Voor de laagste prijs kies je een jaarlijks abonnement en schaf je de Expensify Card aan.',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>Lees meer op onze <a href="${CONST.PRICING}">prijspagina</a> of chat met ons team in je ${hasAdminsRoom ? `<a href="adminsRoom">#admins-kamer.</a>` : '#admins-kamer.'}</muted-text>`,
            estimatedPrice: 'Geschatte prijs',
            changesBasedOn: 'Dit verandert op basis van je gebruik van de Expensify Card en de abonnementsopties hieronder.',
        },
        requestEarlyCancellation: {
            title: 'Vroegtijdige annulering aanvragen',
            subtitle: 'Wat is de belangrijkste reden waarom je vroegtijdige opzegging aanvraagt?',
            subscriptionCanceled: {
                title: 'Abonnement geannuleerd',
                subtitle: 'Je je jaarabonnement is opgezegd.',
                info: 'Als je je werkruimte(s) op basis van betalen-per-gebruik wilt blijven gebruiken, ben je helemaal klaar.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Als je toekomstige activiteit en kosten wilt voorkomen, moet je je <a href="${workspacesListRoute}">werkruimte(s) verwijderen</a>. Houd er rekening mee dat wanneer je je werkruimte(s) verwijdert, je wordt gefactureerd voor eventuele openstaande activiteit die in de huidige kalendermaand heeft plaatsgevonden.`,
            },
            requestSubmitted: {
                title: 'Verzoek ingediend',
                subtitle:
                    'Bedankt dat je ons laat weten dat je je abonnement wilt annuleren. We beoordelen je verzoek en nemen binnenkort contact met je op via je chat met <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `Door vroegtijdige beëindiging aan te vragen, erken en ga ik ermee akkoord dat Expensify op grond van de Expensify <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Servicevoorwaarden</a> of enige andere toepasselijke dienstenovereenkomst tussen mij en Expensify geen verplichting heeft om aan een dergelijke aanvraag te voldoen en dat Expensify naar eigen, uitsluitende goeddunken beslist over het al dan niet honoreren van een dergelijke aanvraag.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'Functionaliteit moet worden verbeterd',
        tooExpensive: 'Te duur',
        inadequateSupport: 'Onvoldoende klantenondersteuning',
        businessClosing: 'Sluiting, inkrimping of overname van het bedrijf',
        additionalInfoTitle: 'Naar welke software stapt u over en waarom?',
        additionalInfoInputLabel: 'Uw reactie',
    },
    roomChangeLog: {
        updateRoomDescription: 'stel de kamerbeschrijving in op:',
        clearRoomDescription: 'heeft de ruimtebeschrijving gewist',
        changedRoomAvatar: 'heeft de ruimte-avatar gewijzigd',
        removedRoomAvatar: 'heeft de kameravatar verwijderd',
    },
    delegate: {
        switchAccount: 'Accounts wisselen:',
        copilotDelegatedAccess: 'Copilot: gedelegeerde toegang',
        copilotDelegatedAccessDescription: 'Andere leden toestaan om toegang te krijgen tot je account.',
        addCopilot: 'Copilot toevoegen',
        membersCanAccessYourAccount: 'Deze leden hebben toegang tot je account:',
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
        onBehalfOfMessage: (delegator: string) => `namens ${delegator}`,
        accessLevel: 'Toegangsniveau',
        confirmCopilot: 'Bevestig hieronder je copilot.',
        accessLevelDescription: 'Kies hieronder een toegangsniveau. Zowel Volledige als Beperkte toegang geven copilots de mogelijkheid om alle gesprekken en uitgaven te bekijken.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Sta een ander lid toe om alle acties in jouw account namens jou uit te voeren. Inclusief chatten, indienen, goedkeuren, betalingen, het bijwerken van instellingen en meer.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Sta een ander lid toe om de meeste acties in je account uit te voeren, namens jou. Goedkeuringen, betalingen, afwijzingen en blokkeringen zijn uitgesloten.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copilot verwijderen',
        removeCopilotConfirmation: 'Weet je zeker dat je deze copilot wilt verwijderen?',
        changeAccessLevel: 'Toegangsniveau wijzigen',
        makeSureItIsYou: 'Laten we zeker weten dat jij het bent',
        enterMagicCode: (contactMethod: string) =>
            `Voer de magische code in die naar ${contactMethod} is gestuurd om een copilot toe te voegen. Deze zou binnen een minuut of twee moeten aankomen.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Voer de magische code in die naar ${contactMethod} is gestuurd om je copilot bij te werken.`,
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
        createReportAction: 'Actierapport maken',
        reportAction: 'Rapportactie',
        report: 'Rapport',
        transaction: 'Transactie',
        violations: 'Overtredingen',
        transactionViolation: 'Transactieovertreding',
        hint: 'Gegevenswijzigingen worden niet naar de back-end verzonden',
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
        true: 'Waar',
        false: 'onwaar',
        viewReport: 'Rapport bekijken',
        viewTransaction: 'Transactie bekijken',
        createTransactionViolation: 'Transactieovertreding maken',
        reasonVisibleInLHN: {
            hasDraftComment: 'Heeft conceptopmerking',
            hasGBR: 'Heeft GBR',
            hasRBR: 'Heeft RBR',
            pinnedByUser: 'Vastgezet door lid',
            hasIOUViolations: 'Heeft IOU-overtredingen',
            hasAddWorkspaceRoomErrors: 'Heeft fouten bij het toevoegen van werkruimtechatroom',
            isUnread: 'Is ongelezen (focusmodus)',
            isArchived: 'Is gearchiveerd (meest recente modus)',
            isSelfDM: 'Is zelf-DM',
            isFocused: 'Is tijdelijk gefocust',
        },
        reasonGBR: {
            hasJoinRequest: 'Heeft deelnameverzoek (beheerkamer)',
            isUnreadWithMention: 'Is ongelezen met vermelding',
            isWaitingForAssigneeToCompleteAction: 'Wacht tot de toegewezen persoon de actie voltooit',
            hasChildReportAwaitingAction: 'Heeft kinderreportage in afwachting van actie',
            hasMissingInvoiceBankAccount: 'Heeft ontbrekende bankrekening voor factuur',
            hasUnresolvedCardFraudAlert: 'Heeft onopgeloste kaartfraudewaarschuwing',
            hasDEWApproveFailed: 'DEW-goedkeuring mislukt',
        },
        reasonRBR: {
            hasErrors: 'Bevat fouten in rapport- of rapportactiedata',
            hasViolations: 'Heeft schendingen',
            hasTransactionThreadViolations: 'Heeft transactiethreadschendingen',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Er is een rapport dat op actie wacht',
            theresAReportWithErrors: 'Er is een rapport met fouten',
            theresAWorkspaceWithCustomUnitsErrors: 'Er is een werkruimte met fouten in aangepaste eenheden',
            theresAProblemWithAWorkspaceMember: 'Er is een probleem met een werkruimteldid',
            theresAProblemWithAWorkspaceQBOExport: 'Er is een probleem opgetreden met een exportinstelling voor een workspace-verbinding.',
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
        subtitle: 'Het heeft alles wat je leuk vindt aan onze klassieke ervaring, met een heleboel upgrades om je leven nog makkelijker te maken:',
        confirmText: 'Laten we gaan!',
        helpText: 'Probeer demo van 2 minuten',
        features: {
            search: 'Krachtigere zoekfunctie op mobiel, web en desktop',
            concierge: 'Ingebouwde Concierge AI om je uitgaven te automatiseren',
            chat: 'Chat op elke uitgave om vragen snel op te lossen',
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
            confirmation: '<tooltip>Dien nu <strong>je onkostendeclaratie in</strong> en kijk hoe de\nmagie gebeurt!</tooltip>',
            tryItOut: 'Probeer het',
        },
        outstandingFilter: '<tooltip>Filter voor uitgaven\ndie <strong>goedgekeurd moeten worden</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Stuur dit bonnetje om\n<strong>de proefrit te voltooien!</strong></tooltip>',
        gpsTooltip: '<tooltip>GPS-tracking bezig! Als je klaar bent, stop dan hieronder met tracken.</tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Wijzigingen negeren?',
        body: 'Weet je zeker dat je de wijzigingen die je hebt aangebracht wilt weggooien?',
        confirmText: 'Wijzigingen verwerpen',
    },
    scheduledCall: {
        book: {
            title: 'Gesprek plannen',
            description: 'Zoek een tijd die voor jou uitkomt.',
            slots: ({date}: {date: string}) => `<muted-text>Beschikbare tijden voor <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Oproep bevestigen',
            description: 'Controleer of de onderstaande gegevens er goed uitzien voor jou. Zodra je het gesprek bevestigt, sturen we een uitnodiging met meer informatie.',
            setupSpecialist: 'Uw installatiespecialist',
            meetingLength: 'Vergadertijd',
            dateTime: 'Datum en tijd',
            minutes: '30 minuten',
        },
        callScheduled: 'Gesprek gepland',
    },
    autoSubmitModal: {
        title: 'Alles duidelijk en ingediend!',
        description: 'Alle waarschuwingen en overtredingen zijn gewist, dus:',
        submittedExpensesTitle: 'Deze uitgaven zijn ingediend',
        submittedExpensesDescription: 'Deze declaraties zijn naar je fiatteur gestuurd, maar kunnen nog worden bewerkt totdat ze zijn goedgekeurd.',
        pendingExpensesTitle: 'In afwachting zijnde uitgaven zijn verplaatst',
        pendingExpensesDescription: 'Alle openstaande kaartuitgaven zijn naar een apart rapport verplaatst totdat ze zijn geboekt.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Maak een testrit van 2 minuten',
        },
        modal: {
            title: 'Maak een proefrit met ons',
            description: 'Maak een korte productrondleiding om snel op de hoogte te raken.',
            confirmText: 'Start proefrit',
            helpText: 'Overslaan',
            employee: {
                description:
                    '<muted-text>Geef je team <strong>3 gratis maanden Expensify!</strong> Vul hieronder het e-mailadres van je baas in en stuur hen een proefdeclaratie.</muted-text>',
                email: 'Voer het e-mailadres van uw baas in',
                error: 'Dat lid is eigenaar van een workspace, voer een nieuw lid in om te testen.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Je bent Expensify momenteel aan het uitproberen',
            readyForTheRealThing: 'Klaar voor het echte werk?',
            getStarted: 'Aan de slag',
        },
        employeeInviteMessage: (name: string) => `# ${name} heeft je uitgenodigd om Expensify uit te proberen
Hoi! Ik heb zojuist *3 maanden gratis* geregeld zodat we Expensify kunnen uitproberen, de snelste manier om onkosten te doen.

Hier is een *testbon* om je te laten zien hoe het werkt:`,
    },
    export: {
        basicExport: 'Basisexport',
        reportLevelExport: 'Alle gegevens - rapportniveau',
        expenseLevelExport: 'Alle gegevens - onkostenniveau',
        exportInProgress: 'Export wordt uitgevoerd',
        conciergeWillSend: 'Concierge stuurt je het bestand zo meteen.',
    },
    domain: {
        notVerified: 'Niet geverifieerd',
        retry: 'Opnieuw proberen',
        verifyDomain: {
            title: 'Domein verifiëren',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Voordat u verdergaat, verifieert u dat u eigenaar bent van <strong>${domainName}</strong> door de DNS-instellingen ervan bij te werken.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Ga naar je DNS-provider en open de DNS-instellingen voor <strong>${domainName}</strong>.`,
            addTXTRecord: 'Voeg het volgende TXT-record toe:',
            saveChanges: 'Wijzigingen opslaan en hier terugkeren om uw domein te verifiëren.',
            youMayNeedToConsult: `Mogelijk moet je contact opnemen met de IT-afdeling van je organisatie om de verificatie te voltooien. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">Meer informatie</a>.`,
            warning: 'Na verificatie ontvangen alle Expensify‑leden op uw domein een e-mail dat hun account onder uw domein zal worden beheerd.',
            codeFetchError: 'Kon verificatiecode niet ophalen',
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
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> is een beveiligingsfunctie die je meer controle geeft over hoe leden met <strong>${domainName}</strong>-e-mails inloggen bij Expensify. Om dit in te schakelen, moet je jezelf verifiëren als een bevoegde bedrijfsbeheerder.</muted-text>`,
            fasterAndEasierLogin: 'Sneller en eenvoudiger inloggen',
            moreSecurityAndControl: 'Meer beveiliging en controle',
            onePasswordForAnything: 'Eén wachtwoord voor alles',
        },
        goToDomain: 'Ga naar domein',
        samlLogin: {
            title: 'SAML-login',
            subtitle: `<muted-text>Configureer aanmelden van leden met <a href="${CONST.SAML_HELP_URL}">SAML Single Sign-On (SSO).</a></muted-text>`,
            enableSamlLogin: 'SAML-login inschakelen',
            allowMembers: 'Leden toestaan in te loggen met SAML.',
            requireSamlLogin: 'SAML-login vereisen',
            anyMemberWillBeRequired: 'Elk lid dat is aangemeld met een andere methode, moet opnieuw worden geverifieerd met SAML.',
            enableError: 'Kon de SAML-instelling voor inschakelen niet bijwerken',
            requireError: 'Kon de SAML-vereiste-instelling niet bijwerken',
            disableSamlRequired: '‘SAML vereist’ uitschakelen',
            oktaWarningPrompt: 'Weet je het zeker? Dit schakelt ook Okta SCIM uit.',
            requireWithEmptyMetadataError: 'Voeg hieronder de Identity Provider-metadata toe om in te schakelen',
        },
        samlConfigurationDetails: {
            title: 'SAML-configuratiegegevens',
            subtitle: 'Gebruik deze gegevens om SAML in te stellen.',
            identityProviderMetadata: 'Identity Provider-meta-gegevens',
            entityID: 'Entiteit-ID',
            nameIDFormat: 'Naam-ID-indeling',
            loginUrl: 'Login-URL',
            acsUrl: 'ACS (Assertion Consumer Service)-URL',
            logoutUrl: 'URL voor uitloggen',
            sloUrl: 'SLO (Single Logout)-URL',
            serviceProviderMetaData: 'Serviceprovider-metadata',
            oktaScimToken: 'Okta SCIM-token',
            revealToken: 'Token weergeven',
            fetchError: 'Kan SAML-configuratiedetails niet ophalen',
            setMetadataGenericError: 'Kon SAML-metagegevens niet instellen',
        },
        accessRestricted: {
            title: 'Toegang beperkt',
            subtitle: (domainName: string) => `Bevestig dat u een geautoriseerde bedrijfsbeheerder bent voor <strong>${domainName}</strong> als u controle nodig hebt over:`,
            companyCardManagement: 'Beheer van bedrijfskaarten',
            accountCreationAndDeletion: 'Accountaanmaak en -verwijdering',
            workspaceCreation: 'Werkruimte aanmaken',
            samlSSO: 'SAML SSO',
        },
        addDomain: {
            title: 'Domein toevoegen',
            subtitle: 'Voer de naam in van het privédomein waartoe je toegang wilt krijgen (bijv. expensify.com).',
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
            subtitle: 'Verplicht leden van je domein om in te loggen via single sign-on, beperk het aanmaken van werkruimten en meer.',
            enable: 'Inschakelen',
        },
        admins: {
            title: 'Beheerders',
            findAdmin: 'Beheerder zoeken',
            primaryContact: 'Primair contactpersoon',
            addPrimaryContact: 'Primair contactpersoon toevoegen',
            setPrimaryContactError: 'Kan de primaire contactpersoon niet instellen. Probeer het later opnieuw.',
            settings: 'Instellingen',
            consolidatedDomainBilling: 'Geconsolideerde domeinfacturering',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Indien ingeschakeld, betaalt de primaire contactpersoon voor alle werkruimten die eigendom zijn van leden van <strong>${domainName}</strong> en ontvangt hij/zij alle factuurbewijzen.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'Geconsolideerde domeinfacturering kon niet worden gewijzigd. Probeer het later opnieuw.',
            addAdmin: 'Beheerder toevoegen',
            addAdminError: 'Kan dit lid niet als beheerder toevoegen. Probeer het opnieuw.',
            revokeAdminAccess: 'Beheerdersrechten intrekken',
            cantRevokeAdminAccess: 'Kan de beheerdersrechten niet intrekken van de technische contactpersoon',
            error: {
                removeAdmin: 'Kan deze gebruiker niet als beheerder verwijderen. Probeer het opnieuw.',
                removeDomain: 'Kan dit domein niet verwijderen. Probeer het opnieuw.',
                removeDomainNameInvalid: 'Voer uw domeinnaam in om deze opnieuw in te stellen.',
            },
            resetDomain: 'Domein resetten',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Typ hier <strong>${domainName}</strong> om het resetten van het domein te bevestigen.`,
            enterDomainName: 'Voer hier uw domeinnaam in',
            resetDomainInfo: `Deze actie is <strong>definitief</strong> en de volgende gegevens worden verwijderd: <br/> <ul><li>Bedrijfskaartverbindingen en niet-ingediende uitgaven van die kaarten</li> <li>SAML- en groepsinstellingen</li> </ul> Alle accounts, werkruimten, rapporten, uitgaven en andere gegevens blijven behouden. <br/><br/>Opmerking: je kunt dit domein uit je domeinenlijst verwijderen door het gekoppelde e-mailadres uit je <a href="#">contactmethoden</a> te verwijderen.`,
        },
        members: {
            title: 'Leden',
            findMember: 'Lid zoeken',
            addMember: 'Lid toevoegen',
            email: 'E-mailadres',
            errors: {addMember: 'Kan dit lid niet toevoegen. Probeer het opnieuw.'},
        },
        domainAdmins: 'Domeinbeheerders',
    },
    gps: {
        disclaimer: 'Gebruik GPS om een uitgave van je reis te maken. Tik hieronder op Start om het volgen te beginnen.',
        error: {failedToStart: 'Locatiebijhouding starten is mislukt.', failedToGetPermissions: 'Verkrijgen van vereiste locatierechten mislukt.'},
        trackingDistance: 'Afstand bijhouden...',
        stopped: 'Gestopt',
        start: 'Start',
        stop: 'Stoppen',
        discard: 'Verwerpen',
        stopGpsTrackingModal: {
            title: 'GPS-tracking stoppen',
            prompt: 'Weet je het zeker? Hiermee beëindig je je huidige flow.',
            cancel: 'Hervatten met volgen',
            confirm: 'GPS-tracking stoppen',
        },
        discardDistanceTrackingModal: {
            title: 'Afstandstracking negeren',
            prompt: 'Weet je het zeker? Dit verwijdert je huidige traject en kan niet ongedaan worden gemaakt.',
            confirm: 'Afstandstracking negeren',
        },
        zeroDistanceTripModal: {title: 'Kan geen uitgave aanmaken', prompt: 'Je kunt geen uitgave aanmaken met dezelfde begin- en eindlocatie.'},
        locationRequiredModal: {
            title: 'Locatietoegang vereist',
            prompt: 'Sta locatietoegang toe in de instellingen van je apparaat om GPS-afstandsregistratie te starten.',
            allow: 'Toestaan',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Toegang tot locatie op de achtergrond vereist',
            prompt: 'Sta achtergrondlocatietoegang toe in de instellingen van je apparaat (de optie “Altijd toestaan”) om het bijhouden van de GPS-afstand te starten.',
        },
        preciseLocationRequiredModal: {title: 'Precieze locatie vereist', prompt: 'Schakel "precieze locatie" in de instellingen van je apparaat in om GPS-afstandsregistratie te starten.'},
        desktop: {title: 'Volg afstand op je telefoon', subtitle: 'Leg kilometers of mijlen automatisch vast met GPS en zet ritten direct om in uitgaven.', button: 'Download de app'},
        notification: {title: 'GPS-tracking bezig', body: 'Ga naar de app om te voltooien'},
        continueGpsTripModal: {
            title: 'GPS-reisregistratie voortzetten?',
            prompt: 'Het lijkt erop dat de app is afgesloten tijdens je laatste GPS-rit. Wil je de opname van die rit hervatten?',
            confirm: 'Reis voortzetten',
            cancel: 'Reis bekijken',
        },
        signOutWarningTripInProgress: {title: 'GPS-tracking bezig', prompt: 'Weet je zeker dat je de reis wilt weggooien en uitloggen?', confirm: 'Verwerpen en afmelden'},
        locationServicesRequiredModal: {
            title: 'Locatietoegang vereist',
            confirm: 'Instellingen openen',
            prompt: 'Sta locatietoegang toe in de instellingen van je apparaat om het bijhouden van GPS-afstand te starten.',
        },
        fabGpsTripExplained: 'Ga naar GPS-scherm (Zwevende actie)',
    },
    homePage: {
        forYou: 'Voor jou',
        announcements: 'Aankondigingen',
        discoverSection: {
            title: 'Ontdekken',
            menuItemTitleNonAdmin: 'Leer hoe je uitgaven aanmaakt en rapporten indient.',
            menuItemTitleAdmin: 'Leer hoe u leden uitnodigt, goedkeuringsworkflows bewerkt en bedrijfskaarten afstemt.',
            menuItemDescription: 'Zie wat Expensify in 2 minuten kan doen',
        },
        forYouSection: {
            submit: ({count}: {count: number}) => `Verzend ${count} ${count === 1 ? 'rapport' : 'rapporten'}`,
            approve: ({count}: {count: number}) => `Goedkeuren ${count} ${count === 1 ? 'rapport' : 'rapporten'}`,
            pay: ({count}: {count: number}) => `Betaal ${count} ${count === 1 ? 'rapport' : 'rapporten'}`,
            export: ({count}: {count: number}) => `Exporteer ${count} ${count === 1 ? 'rapport' : 'rapporten'}`,
            begin: 'Beginnen',
            emptyStateMessages: {
                nicelyDone: 'Goed gedaan',
                keepAnEyeOut: 'Houd in de gaten wat er binnenkort komt!',
                allCaughtUp: 'Je bent helemaal bij',
                upcomingTodos: 'Aankomende taken verschijnen hier.',
            },
        },
        timeSensitiveSection: {
            title: 'Tijdgevoelig',
            cta: 'Declaratie',
            offer50off: {title: 'Krijg 50% korting op je eerste jaar!', subtitle: ({formattedTime}: {formattedTime: string}) => `${formattedTime} resterend`},
            offer25off: {title: 'Krijg 25% korting op je eerste jaar!', subtitle: ({days}: {days: number}) => `Nog ${days} ${days === 1 ? 'dag' : 'dagen'} resterend`},
            addShippingAddress: {title: 'We hebben je verzendadres nodig', subtitle: 'Voer een adres in om je Expensify Card te ontvangen.', cta: 'Adres toevoegen'},
            activateCard: {title: 'Activeer je Expensify Card', subtitle: 'Valideer je kaart en begin met uitgeven.', cta: 'Activeren'},
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
