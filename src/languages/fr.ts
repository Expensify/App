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
        count: 'Nombre',
        cancel: 'Annuler',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: 'Fermer',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: 'Continuer',
        yes: 'Oui',
        no: 'Non',
        // @context Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.
        ok: 'OK',
        notNow: 'Pas maintenant',
        noThanks: 'Non merci',
        learnMore: 'En savoir plus',
        buttonConfirm: 'Compris',
        name: 'Nom',
        attachment: 'Pièce jointe',
        attachments: 'Pièces jointes',
        center: 'Centrer',
        from: 'De',
        to: 'À',
        in: 'Dans',
        optional: 'Facultatif',
        new: 'Nouveau',
        search: 'Rechercher',
        reports: 'Rapports',
        find: 'Rechercher',
        searchWithThreeDots: 'Rechercher...',
        next: 'Suivant',
        previous: 'Précédent',
        // @context Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.
        goBack: 'Retour',
        create: 'Créer',
        add: 'Ajouter',
        resend: 'Renvoyer',
        save: 'Enregistrer',
        select: 'Sélectionner',
        deselect: 'Désélectionner',
        // @context Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.
        selectMultiple: 'Sélection multiple',
        saveChanges: 'Enregistrer les modifications',
        submit: 'Soumettre',
        // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        submitted: 'Soumis',
        rotate: 'Pivoter',
        zoom: 'Zoom',
        password: 'Mot de passe',
        magicCode: 'Code magique',
        twoFactorCode: 'Code à deux facteurs',
        workspaces: 'Espaces de travail',
        inbox: 'Boîte de réception',
        // @context Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”
        success: 'Succès',
        group: 'Groupe',
        profile: 'Profil',
        referral: 'Parrainage',
        payments: 'Paiements',
        approvals: 'Approbations',
        wallet: 'Portefeuille',
        preferences: 'Préférences',
        view: 'Afficher',
        review: (reviewParams?: ReviewParams) => `Revoir${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Non',
        signIn: 'Se connecter',
        signInWithGoogle: 'Se connecter avec Google',
        signInWithApple: 'Se connecter avec Apple',
        signInWith: 'Se connecter avec',
        continue: 'Continuer',
        firstName: 'Prénom',
        lastName: 'Nom de famille',
        scanning: 'Numérisation',
        addCardTermsOfService: 'Conditions d’utilisation d’Expensify',
        perPerson: 'par personne',
        phone: 'Téléphone',
        phoneNumber: 'Numéro de téléphone',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'E-mail',
        and: 'et',
        or: 'ou',
        details: 'Détails',
        privacy: 'Confidentialité',
        privacyPolicy: 'Politique de confidentialité',
        hidden: 'Masqué',
        visible: 'Visible',
        delete: 'Supprimer',
        // @context UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.
        archived: 'Archivé',
        contacts: 'Contacts',
        recents: 'Récents',
        close: 'Fermer',
        comment: 'Commentaire',
        download: 'Télécharger',
        downloading: 'Téléchargement',
        // @context Indicates that a file is currently being uploaded (sent to the server), not downloaded.
        uploading: 'Téléversement en cours',
        // @context as a verb, not a noun
        pin: 'Épingler',
        unPin: 'Désépingler',
        back: 'Retour',
        saveAndContinue: 'Enregistrer et continuer',
        settings: 'Paramètres',
        termsOfService: 'Conditions d’utilisation',
        members: 'Membres',
        invite: 'Inviter',
        here: 'ici',
        date: 'Date',
        dob: 'Date de naissance',
        currentYear: 'Année en cours',
        currentMonth: 'Mois en cours',
        ssnLast4: '4 derniers chiffres du numéro de sécurité sociale',
        ssnFull9: '9 chiffres complets du SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Ligne d’adresse ${lineNumber}`,
        personalAddress: 'Adresse personnelle',
        companyAddress: 'Adresse de l’entreprise',
        noPO: 'Pas de boîtes postales ni d’adresses de dépôt de courrier, s’il vous plaît.',
        city: 'Ville',
        state: 'État',
        streetAddress: 'Adresse postale',
        stateOrProvince: 'État / Province',
        country: 'Pays',
        zip: 'Code postal',
        zipPostCode: 'Code postal',
        whatThis: 'Qu’est-ce que c’est ?',
        iAcceptThe: 'J’accepte les',
        acceptTermsAndPrivacy: `J’accepte les <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Conditions d’utilisation d’Expensify</a> et la <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politique de confidentialité</a>`,
        acceptTermsAndConditions: `J’accepte les <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">conditions générales</a>`,
        acceptTermsOfService: `J’accepte les <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Conditions d’utilisation d’Expensify</a>`,
        remove: 'Supprimer',
        admin: 'Administrateur',
        owner: 'Propriétaire',
        dateFormat: 'AAAA-MM-JJ',
        send: 'Envoyer',
        na: 'N/D',
        noResultsFound: 'Aucun résultat trouvé',
        noResultsFoundMatching: (searchString: string) => `Aucun résultat trouvé correspondant à « ${searchString} »`,
        recentDestinations: 'Destinations récentes',
        timePrefix: 'C’est',
        conjunctionFor: 'pour',
        todayAt: 'Aujourd’hui à',
        tomorrowAt: 'Demain à',
        yesterdayAt: 'Hier à',
        conjunctionAt: 'à',
        conjunctionTo: 'à',
        genericErrorMessage: 'Oups... une erreur s’est produite et votre demande n’a pas pu être effectuée. Veuillez réessayer plus tard.',
        percentage: 'Pourcentage',
        error: {
            invalidAmount: 'Montant invalide',
            acceptTerms: 'Vous devez accepter les Conditions d’utilisation pour continuer',
            phoneNumber: `Veuillez saisir un numéro de téléphone complet
(p. ex. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Ce champ est obligatoire',
            requestModified: 'Cette demande est en cours de modification par un autre membre',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Limite de caractères dépassée (${length}/${limit})`,
            dateInvalid: 'Veuillez sélectionner une date valide',
            invalidDateShouldBeFuture: 'Veuillez choisir aujourd’hui ou une date future',
            invalidTimeShouldBeFuture: 'Veuillez choisir une heure au moins une minute plus tard',
            invalidCharacter: 'Caractère invalide',
            enterMerchant: 'Saisissez un nom de marchand',
            enterAmount: 'Saisissez un montant',
            missingMerchantName: 'Nom du commerçant manquant',
            missingAmount: 'Montant manquant',
            missingDate: 'Date manquante',
            enterDate: 'Saisissez une date',
            invalidTimeRange: 'Veuillez saisir une heure au format 12 heures (par ex. 14:30 PM)',
            pleaseCompleteForm: 'Veuillez remplir le formulaire ci-dessus pour continuer',
            pleaseSelectOne: 'Veuillez sélectionner une option ci-dessus',
            invalidRateError: 'Veuillez saisir un taux valide',
            lowRateError: 'Le taux doit être supérieur à 0',
            email: 'Veuillez saisir une adresse e-mail valide',
            login: 'Une erreur s’est produite lors de la connexion. Veuillez réessayer.',
        },
        comma: 'virgule',
        semicolon: 'point-virgule',
        please: 'Veuillez',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'Contactez-nous',
        pleaseEnterEmailOrPhoneNumber: 'Veuillez saisir une adresse e-mail ou un numéro de téléphone',
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: 'Corrigez les erreurs',
        inTheFormBeforeContinuing: 'dans le formulaire avant de continuer',
        confirm: 'Confirmer',
        reset: 'Réinitialiser',
        // @context Status or button indicating that an action or process has been completed. Should reflect completion.
        done: 'Terminé',
        more: 'Plus',
        debitCard: 'Carte de débit',
        bankAccount: 'Compte bancaire',
        personalBankAccount: 'Compte bancaire personnel',
        businessBankAccount: 'Compte bancaire professionnel',
        join: 'Rejoindre',
        leave: 'Quitter',
        decline: 'Refuser',
        reject: 'Rejeter',
        transferBalance: 'Transférer le solde',
        // @context Instruction telling the user to input data manually. Refers to entering text or values in a field.
        enterManually: 'Saisissez-le manuellement',
        message: 'Message',
        leaveThread: 'Quitter la discussion',
        you: 'Vous',
        // @context Refers to the current user in the UI. Should follow capitalization rules for labels/pronouns in the target language.
        me: 'Moi',
        youAfterPreposition: 'vous',
        your: 'votre',
        conciergeHelp: 'Veuillez contacter Concierge pour obtenir de l’aide.',
        youAppearToBeOffline: 'Vous semblez être hors ligne.',
        thisFeatureRequiresInternet: 'Cette fonctionnalité nécessite une connexion Internet active.',
        attachmentWillBeAvailableOnceBackOnline: 'La pièce jointe sera disponible une fois que vous serez de nouveau en ligne.',
        errorOccurredWhileTryingToPlayVideo: 'Une erreur s’est produite lors de la tentative de lecture de cette vidéo.',
        areYouSure: 'Êtes-vous sûr ?',
        verify: 'Vérifier',
        yesContinue: 'Oui, continuer',
        // @context Provides an example format for a website URL.
        websiteExample: 'p. ex. https://www.expensify.com',
        // @context Provides an example format for a ZIP/postal code.
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `p. ex. ${zipSampleFormat}` : ''),
        description: 'Description',
        title: 'Titre',
        assignee: 'Cessionnaire',
        createdBy: 'Créé par',
        with: 'avec',
        shareCode: 'Partager le code',
        share: 'Partager',
        per: 'par',
        // @context Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.
        mi: 'mile',
        km: 'kilomètre',
        copied: 'Copié !',
        someone: 'Quelqu’un',
        total: 'Total',
        edit: 'Modifier',
        letsDoThis: `Allons-y !`,
        letsStart: `Commençons`,
        showMore: 'Afficher plus',
        showLess: 'Afficher moins',
        merchant: 'Commerçant',
        category: 'Catégorie',
        report: 'Rapport',
        billable: 'Facturable',
        nonBillable: 'Non facturable',
        tag: 'Étiquette',
        receipt: 'Reçu',
        verified: 'Vérifié',
        replace: 'Remplacer',
        distance: 'Distance',
        mile: 'mile',
        // @context Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.
        miles: 'miles',
        kilometer: 'kilomètre',
        kilometers: 'kilomètres',
        recent: 'Récents',
        all: 'Tous',
        am: 'AM',
        pm: 'MP',
        // @context Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.
        tbd: 'À déterminer',
        selectCurrency: 'Sélectionner une devise',
        selectSymbolOrCurrency: 'Sélectionner un symbole ou une devise',
        card: 'Carte',
        whyDoWeAskForThis: 'Pourquoi demandons-nous cela ?',
        required: 'Obligatoire',
        showing: 'Affichage',
        of: 'de',
        default: 'Par défaut',
        update: 'Mettre à jour',
        member: 'Membre',
        auditor: 'Auditeur',
        role: 'Rôle',
        currency: 'Devise',
        groupCurrency: 'Devise de groupe',
        rate: 'Taux',
        emptyLHN: {
            title: 'Ouah ! Vous êtes à jour.',
            subtitleText1: 'Trouver une discussion à l’aide du',
            subtitleText2: 'bouton ci-dessus, ou créez quelque chose à l’aide de la',
            subtitleText3: 'bouton ci-dessous.',
        },
        businessName: 'Nom de l’entreprise',
        clear: 'Effacer',
        type: 'Type',
        reportName: 'Nom du rapport',
        action: 'Action',
        expenses: 'Dépenses',
        totalSpend: 'Dépenses totales',
        tax: 'Tax',
        shared: 'Partagé',
        drafts: 'Brouillons',
        // @context as a noun, not a verb
        draft: 'Brouillon',
        finished: 'Terminé',
        upgrade: 'Mettre à niveau',
        downgradeWorkspace: 'Rétrograder l’espace de travail',
        companyID: 'ID d’entreprise',
        userID: 'ID utilisateur',
        disable: 'Désactiver',
        export: 'Exporter',
        initialValue: 'Valeur initiale',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: 'Date du jour',
        value: 'Valeur',
        downloadFailedTitle: 'Échec du téléchargement',
        downloadFailedDescription: 'Votre téléchargement n’a pas pu être terminé. Veuillez réessayer plus tard.',
        filterLogs: 'Filtrer les journaux',
        network: 'Réseau',
        reportID: 'ID du rapport',
        longID: 'ID long',
        withdrawalID: 'ID de retrait',
        bankAccounts: 'Comptes bancaires',
        chooseFile: 'Choisir un fichier',
        chooseFiles: 'Choisir des fichiers',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: 'Déposez-le',
        // @context Instruction for dropping one or more files into an upload area.
        dropMessage: 'Déposez votre fichier ici',
        ignore: 'Ignorer',
        enabled: 'Activé',
        disabled: 'Désactivé',
        // @context Action button for importing a file or data. Should use the verb form, not the noun form.
        import: 'Importer',
        offlinePrompt: 'Vous ne pouvez pas effectuer cette action pour le moment.',
        // @context meaning "remaining to be paid, done, or dealt with", not "exceptionally good"
        outstanding: 'En attente',
        chats: 'Discussions',
        tasks: 'Tâches',
        unread: 'Non lu',
        sent: 'Envoyé',
        links: 'Liens',
        // @context Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).
        day: 'jour',
        days: 'jours',
        rename: 'Renommer',
        address: 'Adresse',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Ignorer',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `Besoin de quelque chose de spécifique ? Discutez avec votre gestionnaire de compte, ${accountManagerDisplayName}.`,
        chatNow: 'Discuter maintenant',
        workEmail: 'Adresse e-mail professionnelle',
        destination: 'Destination',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: 'Taux secondaire',
        perDiem: 'Indemnité journalière',
        validate: 'Valider',
        downloadAsPDF: 'Télécharger en PDF',
        downloadAsCSV: 'Télécharger en CSV',
        help: 'Aide',
        expenseReport: 'Note de frais',
        expenseReports: 'Notes de frais',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'Taux hors politique',
        leaveWorkspace: 'Quitter l’espace de travail',
        leaveWorkspaceConfirmation: 'Si vous quittez cet espace de travail, vous ne pourrez plus lui soumettre de notes de frais.',
        leaveWorkspaceConfirmationAuditor: 'Si vous quittez cet espace de travail, vous ne pourrez plus afficher ses rapports et paramètres.',
        leaveWorkspaceConfirmationAdmin: 'Si vous quittez cet espace de travail, vous ne pourrez plus gérer ses paramètres.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Si vous quittez cet espace de travail, vous serez remplacé dans le processus d’approbation par ${workspaceOwner}, le propriétaire de l’espace de travail.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Si vous quittez cet espace de travail, vous serez remplacé comme exportateur préféré par ${workspaceOwner}, le propriétaire de l'espace de travail.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Si vous quittez cet espace de travail, vous serez remplacé en tant que contact technique par ${workspaceOwner}, le propriétaire de l’espace de travail.`,
        leaveWorkspaceReimburser:
            'Vous ne pouvez pas quitter cet espace de travail en tant que rembourseur. Veuillez définir un nouveau rembourseur dans Espaces de travail > Effectuer ou suivre des paiements, puis réessayez.',
        reimbursable: 'Remboursable',
        editYourProfile: 'Modifier votre profil',
        comments: 'Commentaires',
        sharedIn: 'Partagé dans',
        unreported: 'Non déclaré',
        explore: 'Explorer',
        todo: 'À faire',
        invoice: 'Facture',
        expense: 'Dépense',
        chat: 'Discussion',
        task: 'Tâche',
        trip: 'Voyage',
        apply: 'Appliquer',
        status: 'Statut',
        on: 'Activé',
        before: 'Avant',
        after: 'Après',
        reschedule: 'Reprogrammer',
        general: 'Général',
        workspacesTabTitle: 'Espaces de travail',
        headsUp: 'Attention !',
        submitTo: 'Soumettre à',
        forwardTo: 'Transférer à',
        merge: 'Fusionner',
        none: 'Aucun',
        unstableInternetConnection: 'Connexion Internet instable. Veuillez vérifier votre réseau et réessayer.',
        enableGlobalReimbursements: 'Activer les remboursements globaux',
        purchaseAmount: 'Montant de l’achat',
        frequency: 'Fréquence',
        link: 'Lien',
        pinned: 'Épinglé',
        read: 'Lire',
        copyToClipboard: 'Copier dans le presse-papiers',
        thisIsTakingLongerThanExpected: 'Cela prend plus de temps que prévu…',
        domains: 'Domaines',
        actionRequired: 'Action requise',
    },
    supportalNoAccess: {
        title: 'Pas si vite',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `Vous n’êtes pas autorisé à effectuer cette action lorsque le support est connecté (commande : ${command ?? ''}). Si vous pensez que Success devrait pouvoir effectuer cette action, veuillez démarrer une conversation dans Slack.`,
    },
    lockedAccount: {
        title: 'Compte verrouillé',
        description: 'Vous n’êtes pas autorisé à effectuer cette action, car ce compte a été verrouillé. Veuillez contacter concierge@expensify.com pour connaître les prochaines étapes.',
    },
    location: {
        useCurrent: 'Utiliser la position actuelle',
        notFound: 'Nous n’avons pas pu trouver votre position. Veuillez réessayer ou saisir une adresse manuellement.',
        permissionDenied: 'Il semble que vous ayez refusé l’accès à votre position.',
        please: 'Veuillez',
        allowPermission: 'autoriser l’accès à la localisation dans les paramètres',
        tryAgain: 'et réessayez.',
    },
    contact: {
        importContacts: 'Importer des contacts',
        importContactsTitle: 'Importer vos contacts',
        importContactsText: 'Importez les contacts de votre téléphone pour que vos personnes préférées ne soient jamais qu’à un toucher.',
        importContactsExplanation: 'pour que vos personnes préférées soient toujours à portée de main.',
        importContactsNativeText: 'Encore une étape ! Donnez-nous le feu vert pour importer vos contacts.',
    },
    anonymousReportFooter: {
        logoTagline: 'Participez à la discussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Accès à la caméra',
        expensifyDoesNotHaveAccessToCamera: 'Expensify ne peut pas prendre de photos sans accès à votre appareil photo. Touchez Paramètres pour mettre à jour les autorisations.',
        attachmentError: 'Erreur de pièce jointe',
        errorWhileSelectingAttachment: 'Une erreur s’est produite lors de la sélection d’une pièce jointe. Veuillez réessayer.',
        errorWhileSelectingCorruptedAttachment: "Une erreur s'est produite lors de la sélection d’une pièce jointe corrompue. Veuillez essayer un autre fichier.",
        takePhoto: 'Prendre une photo',
        chooseFromGallery: 'Choisir depuis la galerie',
        chooseDocument: 'Choisir un fichier',
        attachmentTooLarge: 'La pièce jointe est trop volumineuse',
        sizeExceeded: 'La taille de la pièce jointe dépasse la limite de 24 Mo',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `La taille de la pièce jointe dépasse la limite de ${maxUploadSizeInMB} Mo`,
        attachmentTooSmall: 'La pièce jointe est trop petite',
        sizeNotMet: 'La taille de la pièce jointe doit être supérieure à 240 octets',
        wrongFileType: 'Type de fichier invalide',
        notAllowedExtension: 'Ce type de fichier n’est pas autorisé. Veuillez essayer un autre type de fichier.',
        folderNotAllowedMessage: 'Le téléversement d’un dossier n’est pas autorisé. Veuillez essayer avec un autre fichier.',
        protectedPDFNotSupported: 'Les PDF protégés par mot de passe ne sont pas pris en charge',
        attachmentImageResized: 'Cette image a été redimensionnée pour l’aperçu. Téléchargez-la pour la résolution complète.',
        attachmentImageTooLarge: 'Cette image est trop volumineuse pour être prévisualisée avant le téléversement.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Vous ne pouvez téléverser que ${fileLimit} fichiers à la fois.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Les fichiers dépassent ${maxUploadSizeInMB} Mo. Veuillez réessayer.`,
        someFilesCantBeUploaded: 'Certains fichiers ne peuvent pas être téléchargés',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Les fichiers doivent être inférieurs à ${maxUploadSizeInMB} Mo. Tout fichier plus volumineux ne sera pas téléversé.`,
        maxFileLimitExceeded: 'Vous pouvez téléverser jusqu’à 30 reçus à la fois. Les reçus supplémentaires ne seront pas téléversés.',
        unsupportedFileType: ({fileType}: FileTypeParams) => `Les fichiers ${fileType} ne sont pas pris en charge. Seuls les types de fichiers pris en charge seront téléversés.`,
        learnMoreAboutSupportedFiles: 'En savoir plus sur les formats pris en charge.',
        passwordProtected: 'Les PDF protégés par mot de passe ne sont pas pris en charge. Seuls les fichiers pris en charge seront téléchargés.',
    },
    dropzone: {
        addAttachments: 'Ajouter des pièces jointes',
        addReceipt: 'Ajouter un reçu',
        scanReceipts: 'Scanner les reçus',
        replaceReceipt: 'Remplacer le reçu',
    },
    filePicker: {
        fileError: 'Erreur de fichier',
        errorWhileSelectingFile: 'Une erreur s’est produite lors de la sélection d’un fichier. Veuillez réessayer.',
    },
    connectionComplete: {
        title: 'Connexion terminée',
        supportingText: 'Vous pouvez fermer cette fenêtre et retourner sur l’application Expensify.',
    },
    avatarCropModal: {
        title: 'Modifier la photo',
        description: 'Faites glisser, zoomez et faites pivoter votre image comme vous le souhaitez.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Aucune extension trouvée pour le type MIME',
        problemGettingImageYouPasted: 'Un problème est survenu lors de la récupération de l’image que vous avez collée',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `La longueur maximale du commentaire est de ${formattedMaxLength} caractères.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `La longueur maximale du titre de la tâche est de ${formattedMaxLength} caractères.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Mettre à jour l’application',
        updatePrompt:
            'Une nouvelle version de cette application est disponible.\nMettez-la à jour maintenant ou redémarrez l’application plus tard pour télécharger les dernières modifications.',
    },
    deeplinkWrapper: {
        launching: 'Lancement de Expensify',
        expired: 'Votre session a expiré.',
        signIn: 'Veuillez vous reconnecter.',
        redirectedToDesktopApp: 'Nous vous avons redirigé vers l’application de bureau.',
        youCanAlso: 'Vous pouvez également',
        openLinkInBrowser: 'ouvrez ce lien dans votre navigateur',
        loggedInAs: ({email}: LoggedInAsParams) =>
            `Vous êtes connecté en tant que ${email}. Cliquez sur « Ouvrir le lien » dans l’invite pour vous connecter à l’application de bureau avec ce compte.`,
        doNotSeePrompt: 'Vous ne voyez pas l’invite ?',
        tryAgain: 'Réessayer',
        or: ', ou',
        continueInWeb: 'continuer vers l’application web',
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abracadabra,
            vous êtes connecté !
        `),
        successfulSignInDescription: 'Retournez à votre onglet d’origine pour continuer.',
        title: 'Voici votre code magique',
        description: dedent(`
            Veuillez saisir le code depuis l’appareil
            où il a été initialement demandé
        `),
        doNotShare: dedent(`
            Ne partagez votre code avec personne.
            Expensify ne vous le demandera jamais !
        `),
        or: ', ou',
        signInHere: 'il suffit de vous connecter ici',
        expiredCodeTitle: 'Code magique expiré',
        expiredCodeDescription: 'Revenez sur l’appareil d’origine et demandez un nouveau code',
        successfulNewCodeRequest: 'Code demandé. Veuillez vérifier votre appareil.',
        tfaRequiredTitle: dedent(`
            Authentification à deux facteurs  
            requise
        `),
        tfaRequiredDescription: dedent(`
            Veuillez saisir le code d’authentification à deux facteurs
            à l’endroit où vous essayez de vous connecter.
        `),
        requestOneHere: 'demande une ici.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Payé par',
        whatsItFor: 'À quoi ça sert ?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Nom, e-mail ou numéro de téléphone',
        findMember: 'Trouver un membre',
        searchForSomeone: 'Rechercher quelqu’un',
    },
    customApprovalWorkflow: {
        title: 'Flux d’approbation personnalisé',
        description: 'Votre entreprise utilise un processus de validation personnalisé sur cet espace de travail. Veuillez effectuer cette action dans Expensify Classic.',
        goToExpensifyClassic: 'Passer à Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Soumettez une dépense, parrainez votre équipe',
            subtitleText: 'Vous voulez que votre équipe utilise Expensify, elle aussi ? Il vous suffit de lui soumettre une dépense et nous nous occupons du reste.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Réserver un appel',
    },
    hello: 'Bonjour',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Commencez ci-dessous.',
        anotherLoginPageIsOpen: 'Une autre page de connexion est ouverte.',
        anotherLoginPageIsOpenExplanation: 'Vous avez ouvert la page de connexion dans un autre onglet. Veuillez vous connecter depuis cet onglet.',
        welcome: 'Bienvenue !',
        welcomeWithoutExclamation: 'Bienvenue',
        phrase2: 'L’argent parle. Et maintenant que la messagerie et les paiements sont réunis au même endroit, c’est aussi simple.',
        phrase3: 'Vos paiements vous parviennent aussi vite que vous savez faire passer votre message.',
        enterPassword: 'Veuillez saisir votre mot de passe',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, c’est toujours un plaisir de voir un nouveau visage par ici !`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Veuillez saisir le code magique envoyé à ${login}. Il devrait arriver d’ici une à deux minutes.`,
    },
    login: {
        hero: {
            header: 'Voyages et dépenses, à la vitesse de la discussion',
            body: 'Bienvenue dans la nouvelle génération d’Expensify, où vos déplacements et vos dépenses s’accélèrent grâce à un chat contextuel en temps réel.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Vous êtes déjà connecté en tant que ${email}.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Vous ne voulez pas vous connecter avec ${provider} ?`,
        continueWithMyCurrentSession: 'Continuer avec ma session actuelle',
        redirectToDesktopMessage: 'Nous vous redirigerons vers l’application de bureau une fois que vous aurez terminé de vous connecter.',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Continuer la connexion avec l’authentification unique :',
        orContinueWithMagicCode: 'Vous pouvez également vous connecter avec un code magique',
        useSingleSignOn: 'Utiliser l’authentification unique',
        useMagicCode: 'Utiliser le code magique',
        launching: 'Lancement...',
        oneMoment: 'Un instant pendant que nous vous redirigeons vers le portail d’authentification unique de votre entreprise.',
    },
    reportActionCompose: {
        dropToUpload: 'Déposer pour téléverser',
        sendAttachment: 'Envoyer la pièce jointe',
        addAttachment: 'Ajouter une pièce jointe',
        writeSomething: 'Écrire quelque chose...',
        blockedFromConcierge: 'La communication est interdite',
        fileUploadFailed: 'Échec du téléversement. Le fichier n’est pas pris en charge.',
        localTime: ({user, time}: LocalTimeParams) => `C’est ${time} pour ${user}`,
        edited: '(modifié)',
        emoji: 'Emoji',
        collapse: 'Réduire',
        expand: 'Développer',
    },
    reportActionContextMenu: {
        copyMessage: 'Copier le message',
        copied: 'Copié !',
        copyLink: 'Copier le lien',
        copyURLToClipboard: 'Copier l’URL dans le presse-papiers',
        copyEmailToClipboard: 'Copier l’e-mail dans le presse-papiers',
        markAsUnread: 'Marquer comme non lu',
        markAsRead: 'Marquer comme lu',
        editAction: ({action}: EditActionParams) => `Modifier ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'dépense' : 'commentaire'}`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'commentaire';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Supprimer ${type}`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'commentaire';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `Voulez-vous vraiment supprimer ce(tte) ${type} ?`;
        },
        onlyVisible: 'Visible uniquement par',
        replyInThread: 'Répondre dans le fil',
        joinThread: 'Rejoindre le fil',
        leaveThread: 'Quitter la discussion',
        copyOnyxData: 'Copier les données Onyx',
        flagAsOffensive: 'Signaler comme offensant',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Ajouter une réaction',
        reactedWith: 'a réagi avec',
    },
    reportActionsView: {
        beginningOfArchivedRoom: ({reportName, reportDetailsLink}: BeginningOfArchivedRoomParams) =>
            `Vous avez manqué la fête dans <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, il n’y a rien à voir ici.`,
        beginningOfChatHistoryDomainRoom: ({domainRoom}: BeginningOfChatHistoryDomainRoomParams) =>
            `Cette discussion comprend tous les membres d’Expensify sur le domaine <strong>${domainRoom}</strong>. Utilisez-la pour discuter avec vos collègues, partager des conseils et poser des questions.`,
        beginningOfChatHistoryAdminRoom: ({workspaceName}: BeginningOfChatHistoryAdminRoomParams) =>
            `Cette discussion est avec l’administrateur de <strong>${workspaceName}</strong>. Utilisez-la pour parler de la configuration de l’espace de travail et plus encore.`,
        beginningOfChatHistoryAnnounceRoom: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomParams) =>
            `Cette discussion inclut tout le monde dans <strong>${workspaceName}</strong>. Utilisez-la pour les annonces les plus importantes.`,
        beginningOfChatHistoryUserRoom: ({reportName, reportDetailsLink}: BeginningOfChatHistoryUserRoomParams) =>
            `Ce salon de discussion est réservé à tout ce qui concerne <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>.`,
        beginningOfChatHistoryInvoiceRoom: ({invoicePayer, invoiceReceiver}: BeginningOfChatHistoryInvoiceRoomParams) =>
            `Cette discussion concerne les factures entre <strong>${invoicePayer}</strong> et <strong>${invoiceReceiver}</strong>. Utilisez le bouton + pour envoyer une facture.`,
        beginningOfChatHistory: 'Cette discussion est avec',
        beginningOfChatHistoryPolicyExpenseChat: ({workspaceName, submitterDisplayName}: BeginningOfChatHistoryPolicyExpenseChatParams) =>
            `C’est ici que <strong>${submitterDisplayName}</strong> soumettra des dépenses à <strong>${workspaceName}</strong>. Il suffit d’utiliser le bouton +.`,
        beginningOfChatHistorySelfDM: 'C’est votre espace personnel. Utilisez-le pour vos notes, tâches, brouillons et rappels.',
        beginningOfChatHistorySystemDM: 'Bienvenue ! Procédons à votre configuration.',
        chatWithAccountManager: 'Discutez avec votre gestionnaire de compte ici',
        sayHello: 'Dites bonjour !',
        yourSpace: 'Votre espace',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Bienvenue dans ${roomName} !`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Utilisez le bouton + pour ${additionalText} une dépense.`,
        askConcierge: 'Posez vos questions et bénéficiez d’une assistance en temps réel 24h/24 et 7j/7.',
        conciergeSupport: 'Assistance 24 h/24 et 7 j/7',
        create: 'Créer',
        iouTypes: {
            pay: 'Payer',
            split: 'Diviser',
            submit: 'Envoyer',
            track: 'suivre',
            invoice: 'facture',
        },
    },
    adminOnlyCanPost: 'Seuls les administrateurs peuvent envoyer des messages dans ce salon.',
    reportAction: {
        asCopilot: 'en tant que copilote pour',
    },
    mentionSuggestions: {
        hereAlternateText: 'Notifier tout le monde dans cette conversation',
    },
    newMessages: 'Nouveaux messages',
    latestMessages: 'Derniers messages',
    youHaveBeenBanned: 'Remarque : Vous avez été banni du chat dans ce canal.',
    reportTypingIndicator: {
        isTyping: 'est en train d’écrire...',
        areTyping: 'sont en train d’écrire...',
        multipleMembers: 'Plusieurs membres',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Cette salle de discussion a été archivée.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Cette discussion n’est plus active, car ${displayName} a fermé son compte.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Cette discussion n’est plus active, car ${oldDisplayName} a fusionné son compte avec ${displayName}.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Cette discussion n’est plus active, car <strong>vous</strong> n’êtes plus membre de l’espace de travail ${policyName}.`
                : `Cette discussion n’est plus active, car ${displayName} n’est plus membre de l’espace de travail ${policyName}.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Cette discussion n’est plus active, car ${policyName} n’est plus un espace de travail actif.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Cette discussion n’est plus active, car ${policyName} n’est plus un espace de travail actif.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Cette réservation est archivée.',
    },
    writeCapabilityPage: {
        label: 'Qui peut publier',
        writeCapability: {
            all: 'Tous les membres',
            admins: 'Administrateurs uniquement',
        },
    },
    sidebarScreen: {
        buttonFind: 'Trouver quelque chose...',
        buttonMySettings: 'Mes paramètres',
        fabNewChat: 'Démarrer le chat',
        fabNewChatExplained: 'Démarrer le chat (Action flottante)',
        fabScanReceiptExplained: 'Scanner un reçu (Action flottante)',
        chatPinned: 'Discussion épinglée',
        draftedMessage: 'Message rédigé',
        listOfChatMessages: 'Liste des messages de chat',
        listOfChats: 'Liste des discussions',
        saveTheWorld: 'Sauver le monde',
        tooltip: 'Commencez ici !',
        redirectToExpensifyClassicModal: {
            title: 'Bientôt disponible',
            description: 'Nous peaufinons encore quelques éléments de New Expensify pour l’adapter à votre configuration spécifique. En attendant, rendez-vous sur Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Abonnement',
        domains: 'Domaines',
    },
    tabSelector: {
        chat: 'Discussion',
        room: 'Salle',
        distance: 'Distance',
        manual: 'Manuel',
        scan: 'Scanner',
        map: 'Carte',
    },
    spreadsheet: {
        upload: 'Téléverser une feuille de calcul',
        import: 'Importer une feuille de calcul',
        dragAndDrop: '<muted-link>Glissez-déposez votre feuille de calcul ici, ou choisissez un fichier ci-dessous. Formats pris en charge : .csv, .txt, .xls et .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Faites glisser et déposez votre feuille de calcul ici ou choisissez un fichier ci-dessous. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">En savoir plus</a> sur les formats de fichier pris en charge.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Sélectionnez un fichier de feuille de calcul à importer. Formats pris en charge : .csv, .txt, .xls et .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Sélectionnez un fichier de feuille de calcul à importer. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">En savoir plus</a> sur les formats de fichiers pris en charge.</muted-link>`,
        fileContainsHeader: 'Le fichier contient des en-têtes de colonnes',
        column: ({name}: SpreadSheetColumnParams) => `Colonne ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `Oups ! Un champ obligatoire (« ${fieldName} ») n’a pas été associé. Veuillez vérifier et réessayer.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) => `Oups ! Vous avez associé un seul champ (« ${fieldName} ») à plusieurs colonnes. Veuillez vérifier et réessayer.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `Oups ! Le champ (« ${fieldName} ») contient une ou plusieurs valeurs vides. Veuillez vérifier et réessayer.`,
        importSuccessfulTitle: 'Importation réussie',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) => (categories > 1 ? `${categories} catégories ont été ajoutées.` : '1 catégorie a été ajoutée.'),
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return 'Aucun membre n’a été ajouté ou mis à jour.';
            }
            if (added && updated) {
                return `${added} membre${added > 1 ? 's' : ''} ajouté, ${updated} membre${updated > 1 ? 's' : ''} mis à jour.`;
            }
            if (updated) {
                return updated > 1 ? `${updated} membres ont été mis à jour.` : '1 membre a été mis à jour.';
            }
            return added > 1 ? `${added} membres ont été ajoutés.` : '1 membre a été ajouté.';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `${tags} tags ont été ajoutés.` : '1 étiquette a été ajoutée.'),
        importMultiLevelTagsSuccessfulDescription: 'Des tags à plusieurs niveaux ont été ajoutés.',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `Des indemnités journalières de ${rates} ont été ajoutées.` : '1 taux de per diem a été ajouté.',
        importFailedTitle: 'Échec de l’importation',
        importFailedDescription: 'Veuillez vérifier que tous les champs sont correctement remplis et réessayer. Si le problème persiste, veuillez contacter Concierge.',
        importDescription: 'Choisissez les champs à associer à partir de votre feuille de calcul en cliquant sur le menu déroulant à côté de chaque colonne importée ci-dessous.',
        sizeNotMet: 'La taille du fichier doit être supérieure à 0 octet',
        invalidFileMessage:
            'Le fichier que vous avez téléchargé est soit vide, soit contient des données non valides. Veuillez vous assurer que le fichier est correctement formaté et contient les informations nécessaires avant de le télécharger à nouveau.',
        importSpreadsheetLibraryError: 'Échec du chargement du module de feuille de calcul. Veuillez vérifier votre connexion Internet et réessayer.',
        importSpreadsheet: 'Importer une feuille de calcul',
        downloadCSV: 'Télécharger le CSV',
        importMemberConfirmation: () => ({
            one: `Veuillez confirmer les détails ci-dessous pour un nouveau membre de l’espace de travail qui sera ajouté dans le cadre de cet import. Les membres existants ne recevront aucune mise à jour de rôle ni message d’invitation.`,
            other: (count: number) =>
                `Veuillez confirmer les détails ci-dessous pour les ${count} nouveaux membres de l’espace de travail qui seront ajoutés dans le cadre de ce téléchargement. Les membres existants ne recevront aucune mise à jour de rôle ni message d’invitation.`,
        }),
    },
    receipt: {
        upload: 'Téléverser un reçu',
        uploadMultiple: 'Téléverser des reçus',
        desktopSubtitleSingle: `ou faites-le glisser et déposez-le ici`,
        desktopSubtitleMultiple: `ou faites-les glisser et déposez-les ici`,
        alternativeMethodsTitle: 'Autres façons d’ajouter des reçus :',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) =>
            `<label-text><a href="${downloadUrl}">Téléchargez l’application</a> pour scanner depuis votre téléphone</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Transférer les reçus à <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Ajoutez votre numéro</a> pour envoyer les reçus par SMS au ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Envoyez vos reçus par SMS au ${phoneNumber} (numéros US uniquement)</label-text>`,
        takePhoto: 'Prendre une photo',
        cameraAccess: 'L’accès à l’appareil photo est requis pour prendre des photos des reçus.',
        deniedCameraAccess: `L’accès à la caméra n’a toujours pas été accordé, veuillez suivre <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">ces instructions</a>.`,
        cameraErrorTitle: 'Erreur de caméra',
        cameraErrorMessage: "Une erreur s'est produite lors de la prise de la photo. Veuillez réessayer.",
        locationAccessTitle: 'Autoriser l’accès à la position',
        locationAccessMessage: 'L’accès à la localisation nous aide à garder votre fuseau horaire et votre devise exacts, où que vous alliez.',
        locationErrorTitle: 'Autoriser l’accès à la position',
        locationErrorMessage: 'L’accès à la localisation nous aide à garder votre fuseau horaire et votre devise exacts, où que vous alliez.',
        allowLocationFromSetting: `L’accès à la localisation nous aide à garder votre fuseau horaire et votre devise exacts, où que vous alliez. Veuillez autoriser l’accès à la localisation dans les paramètres d’autorisations de votre appareil.`,
        dropTitle: 'Laisser tomber',
        dropMessage: 'Déposez votre fichier ici',
        flash: 'flash',
        multiScan: 'analyse multiple',
        shutter: 'obturateur',
        gallery: 'Galerie',
        deleteReceipt: 'Supprimer le reçu',
        deleteConfirmation: 'Voulez-vous vraiment supprimer ce reçu ?',
        addReceipt: 'Ajouter un reçu',
        scanFailed: 'Le reçu n’a pas pu être scanné, car il manque un commerçant, une date ou un montant.',
    },
    quickAction: {
        scanReceipt: 'Scanner le reçu',
        recordDistance: 'Suivre la distance',
        requestMoney: 'Créer une dépense',
        perDiem: 'Créer une indemnité journalière',
        splitBill: 'Fractionner la dépense',
        splitScan: 'Diviser le reçu',
        splitDistance: 'Fractionner la distance',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Payer ${name ?? 'quelqu’un'}`,
        assignTask: 'Attribuer une tâche',
        header: 'Action rapide',
        noLongerHaveReportAccess: 'Vous n’avez plus accès à votre précédente destination d’action rapide. Choisissez-en une nouvelle ci-dessous.',
        updateDestination: 'Mettre à jour la destination',
        createReport: 'Créer un rapport',
    },
    iou: {
        amount: 'Montant',
        taxAmount: 'Montant de la taxe',
        taxRate: 'Taux de taxe',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `Approuver ${formattedAmount}` : 'Approuver'),
        approved: 'Approuvé',
        cash: 'Espèces',
        card: 'Carte',
        original: 'Original',
        split: 'Diviser',
        splitExpense: 'Fractionner la dépense',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} de ${merchant}`,
        addSplit: 'Ajouter une répartition',
        makeSplitsEven: 'Rendre les répartitions égales',
        editSplits: 'Modifier les répartitions',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Le montant total est supérieur de ${amount} à la dépense initiale.`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `Le montant total est inférieur de ${amount} à la dépense initiale.`,
        splitExpenseZeroAmount: 'Veuillez saisir un montant valide avant de continuer.',
        splitExpenseOneMoreSplit: 'Aucune répartition ajoutée. Ajoutez-en au moins une pour enregistrer.',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `Modifier ${amount} pour ${merchant}`,
        removeSplit: 'Supprimer la répartition',
        splitExpenseCannotBeEditedModalTitle: 'Cette dépense ne peut pas être modifiée',
        splitExpenseCannotBeEditedModalDescription: 'Les dépenses approuvées ou payées ne peuvent pas être modifiées',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Payer ${name ?? 'quelqu’un'}`,
        expense: 'Dépense',
        categorize: 'Catégoriser',
        share: 'Partager',
        participants: 'Participants',
        createExpense: 'Créer une dépense',
        trackDistance: 'Suivre la distance',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `Créer ${expensesNumber} dépenses`,
        removeExpense: 'Supprimer la dépense',
        removeThisExpense: 'Supprimer cette dépense',
        removeExpenseConfirmation: 'Êtes-vous sûr de vouloir supprimer ce reçu ? Cette action est irréversible.',
        addExpense: 'Ajouter une dépense',
        chooseRecipient: 'Choisir un destinataire',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Créer une dépense de ${amount}`,
        confirmDetails: 'Confirmer les détails',
        pay: 'Payer',
        cancelPayment: 'Annuler le paiement',
        cancelPaymentConfirmation: 'Voulez-vous vraiment annuler ce paiement ?',
        viewDetails: 'Afficher les détails',
        pending: 'En attente',
        canceled: 'Annulé',
        posted: 'Publié',
        deleteReceipt: 'Supprimer le reçu',
        findExpense: 'Trouver une dépense',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `a supprimé une dépense (${amount} pour ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `a déplacé une dépense${reportName ? `de ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `a déplacé cette dépense${reportName ? `à <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `a déplacé cette dépense${reportName ? `de <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedUnreportedTransaction: ({reportUrl}: MovedTransactionParams) => `a déplacé cette dépense depuis votre <a href="${reportUrl}">espace personnel</a>`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `a déplacé cette dépense vers votre <a href="${reportUrl}">espace personnel</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `a déplacé ce rapport vers l’espace de travail <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `a déplacé ce <a href="${movedReportUrl}">rapport</a> vers l’espace de travail <a href="${newParentReportUrl}">${toPolicyName}</a>`;
        },
        pendingMatchWithCreditCard: 'Reçu en attente de rapprochement avec la transaction par carte',
        pendingMatch: 'Correspondance en attente',
        pendingMatchWithCreditCardDescription: 'Reçu en attente de rapprochement avec la transaction par carte. Marquez-le comme espèces pour annuler.',
        markAsCash: 'Marquer comme espèces',
        routePending: 'Acheminement en attente...',
        receiptScanning: () => ({
            one: 'Numérisation du reçu…',
            other: 'Numérisation des reçus...',
        }),
        scanMultipleReceipts: 'Scanner plusieurs reçus',
        scanMultipleReceiptsDescription: 'Prenez des photos de tous vos reçus en une seule fois, puis confirmez vous‑même les détails ou nous le ferons pour vous.',
        receiptScanInProgress: 'Analyse du reçu en cours',
        receiptScanInProgressDescription: 'Numérisation du reçu en cours. Revenez plus tard ou saisissez les détails maintenant.',
        removeFromReport: 'Retirer du rapport',
        moveToPersonalSpace: 'Déplacer les dépenses vers votre espace personnel',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? 'Dépenses potentiellement en double identifiées. Vérifiez les doublons pour permettre la soumission.'
                : 'Dépenses potentiellement en double identifiées. Vérifiez les doublons pour permettre l’approbation.',
        receiptIssuesFound: () => ({
            one: 'Problème détecté',
            other: 'Problèmes trouvés',
        }),
        fieldPending: 'En attente...',
        defaultRate: 'Tarif par défaut',
        receiptMissingDetails: 'Reçu incomplet',
        missingAmount: 'Montant manquant',
        missingMerchant: 'Commerçant manquant',
        receiptStatusTitle: 'Numérisation…',
        receiptStatusText: 'Vous seul pouvez voir ce reçu pendant son analyse. Revenez plus tard ou saisissez les détails maintenant.',
        receiptScanningFailed: 'L’analyse du reçu a échoué. Veuillez saisir les détails manuellement.',
        transactionPendingDescription: 'Transaction en attente. La comptabilisation peut prendre quelques jours.',
        companyInfo: 'Infos sur l’entreprise',
        companyInfoDescription: 'Nous avons besoin de quelques détails supplémentaires avant que vous puissiez envoyer votre première facture.',
        yourCompanyName: 'Nom de votre entreprise',
        yourCompanyWebsite: 'Le site web de votre entreprise',
        yourCompanyWebsiteNote: 'Si vous n’avez pas de site web, vous pouvez fournir à la place le profil LinkedIn ou le profil de réseau social de votre entreprise.',
        invalidDomainError: 'Vous avez saisi un domaine invalide. Pour continuer, veuillez saisir un domaine valide.',
        publicDomainError: 'Vous avez saisi un domaine public. Pour continuer, veuillez saisir un domaine privé.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} en cours de numérisation`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} en attente`);
            }
            return {
                one: statusText.length > 0 ? `1 dépense (${statusText.join(', ')})` : `1 dépense`,
                other: (count: number) => (statusText.length > 0 ? `${count} dépenses (${statusText.join(', ')})` : `${count} dépenses`),
            };
        },
        expenseCount: () => {
            return {
                one: '1 dépense',
                other: (count: number) => `${count} dépenses`,
            };
        },
        deleteExpense: () => ({
            one: 'Supprimer la dépense',
            other: 'Supprimer les dépenses',
        }),
        deleteConfirmation: () => ({
            one: 'Voulez-vous vraiment supprimer cette dépense ?',
            other: 'Êtes-vous sûr de vouloir supprimer ces dépenses ?',
        }),
        deleteReport: 'Supprimer le rapport',
        deleteReportConfirmation: 'Voulez-vous vraiment supprimer ce rapport ?',
        settledExpensify: 'Payé',
        done: 'Terminé',
        settledElsewhere: 'Payé ailleurs',
        individual: 'Individuel',
        business: 'Professionnel',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} avec Expensify` : `Payer avec Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} en tant que particulier` : `Payer avec un compte personnel`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} avec le portefeuille` : `Payer avec le portefeuille`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Payer ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} en tant qu’entreprise` : `Payer avec le compte professionnel`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Marquer ${formattedAmount} comme payé` : `Marquer comme payé`),
        settleInvoicePersonal: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `payé ${amount} avec le compte personnel ${last4Digits}` : `Payé avec un compte personnel`),
        settleInvoiceBusiness: ({amount, last4Digits}: BusinessBankAccountParams) =>
            amount ? `payé ${amount} avec le compte professionnel ${last4Digits}` : `Payé avec le compte professionnel`,
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Payer ${formattedAmount} via ${policyName}` : `Payer via ${policyName}`),
        businessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            amount ? `payé ${amount} avec le compte bancaire ${last4Digits}` : `payé avec le compte bancaire ${last4Digits}`,
        automaticallyPaidWithBusinessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            `payé ${amount ? `${amount} ` : ''}avec le compte bancaire ${last4Digits} via les <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">règles de l’espace de travail</a>`,
        invoicePersonalBank: ({lastFour}: BankAccountLastFourParams) => `Compte personnel • ${lastFour}`,
        invoiceBusinessBank: ({lastFour}: BankAccountLastFourParams) => `Compte professionnel • ${lastFour}`,
        nextStep: 'Prochaines étapes',
        finished: 'Terminé',
        flip: 'Retourner',
        sendInvoice: ({amount}: RequestAmountParams) => `Envoyer la facture de ${amount}`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `pour ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `soumis${memo ? `, en indiquant ${memo}` : ''}`,
        automaticallySubmitted: `soumis via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">soumission différée</a>`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `suivi de ${formattedAmount}${comment ? `pour ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `scinder ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `diviser ${formattedAmount}${comment ? `pour ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Votre part ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} doit ${amount}${comment ? `pour ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} doit :`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}a payé ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} a payé :`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} a dépensé ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} a dépensé :`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} a approuvé :`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} a approuvé ${amount}`,
        payerSettled: ({amount}: PayerSettledParams) => `payé ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `payé ${amount}. Ajoutez un compte bancaire pour recevoir votre paiement.`,
        automaticallyApproved: `approuvé via les <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">règles de l’espace de travail</a>`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `a approuvé ${amount}`,
        approvedMessage: `Approuvé`,
        unapproved: `Non approuvé`,
        automaticallyForwarded: `approuvé via les <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">règles de l’espace de travail</a>`,
        forwarded: `Approuvé`,
        rejectedThisReport: 'a rejeté ce rapport',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `a commencé le paiement, mais attend que ${submitterDisplayName} ajoute un compte bancaire.`,
        adminCanceledRequest: 'a annulé le paiement',
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `a annulé le paiement de ${amount}, car ${submitterDisplayName} n’a pas activé son Portefeuille Expensify dans les 30 jours`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} a ajouté un compte bancaire. Le paiement de ${amount} a été effectué.`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}marqué comme payé`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}payé avec le portefeuille`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''}payé avec Expensify via les <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">règles d’espace de travail</a>`,
        noReimbursableExpenses: 'Ce rapport contient un montant non valide',
        pendingConversionMessage: 'Le total sera mis à jour lorsque vous serez de nouveau en ligne',
        changedTheExpense: 'a modifié la dépense',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `le ${valueName} à ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `définir ${translatedChangedField} sur ${newMerchant}, ce qui a défini le montant sur ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `le ${valueName} (anciennement ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `le ${valueName} à ${newValueToDisplay} (auparavant ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `a modifié ${translatedChangedField} en ${newMerchant} (auparavant ${oldMerchant}), ce qui a mis à jour le montant à ${newAmountToDisplay} (auparavant ${oldAmountToDisplay})`,
        basedOnAI: 'd’après l’activité précédente',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) =>
            rulesLink ? `basé sur les <a href="${rulesLink}">règles de l’espace de travail</a>` : 'en fonction de la règle de l’espace de travail',
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `pour ${comment}` : 'dépense'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Rapport de facture n° ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} envoyé${comment ? `pour ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `a déplacé la dépense de l’espace personnel vers ${workspaceName ?? `discuter avec ${reportName}`}`,
        movedToPersonalSpace: 'dépense déplacée vers l’espace personnel',
        tagSelection: ({policyTagListName}: TagSelectionParams = {}) => {
            const article = policyTagListName && StringUtils.startsWithVowel(policyTagListName) ? 'un' : 'un';
            const tag = policyTagListName ?? 'étiquette';
            return `Sélectionnez ${article} ${tag} pour mieux organiser vos dépenses.`;
        },
        categorySelection: 'Sélectionnez une catégorie pour mieux organiser vos dépenses.',
        error: {
            invalidCategoryLength: 'Le nom de la catégorie dépasse 255 caractères. Veuillez le raccourcir ou choisir une autre catégorie.',
            invalidTagLength: 'Le nom de l’étiquette dépasse 255 caractères. Veuillez le raccourcir ou choisir une autre étiquette.',
            invalidAmount: 'Veuillez saisir un montant valide avant de continuer',
            invalidDistance: 'Veuillez saisir une distance valide avant de continuer',
            invalidIntegerAmount: 'Veuillez saisir un montant entier en dollars avant de continuer',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Le montant maximal de taxe est de ${amount}`,
            invalidSplit: 'La somme des répartitions doit être égale au montant total',
            invalidSplitParticipants: 'Veuillez saisir un montant supérieur à zéro pour au moins deux participants',
            invalidSplitYourself: 'Veuillez saisir un montant non nul pour votre répartition',
            noParticipantSelected: 'Veuillez sélectionner un participant',
            other: 'Erreur inattendue. Veuillez réessayer plus tard.',
            genericCreateFailureMessage: 'Erreur inattendue lors de la soumission de cette dépense. Veuillez réessayer plus tard.',
            genericCreateInvoiceFailureMessage: 'Erreur inattendue lors de l’envoi de cette facture. Veuillez réessayer plus tard.',
            genericHoldExpenseFailureMessage: 'Erreur inattendue lors de la mise en attente de cette dépense. Veuillez réessayer plus tard.',
            genericUnholdExpenseFailureMessage: 'Erreur inattendue lors de la levée de la mise en attente de cette dépense. Veuillez réessayer plus tard.',
            receiptDeleteFailureError: 'Erreur inattendue lors de la suppression de ce reçu. Veuillez réessayer plus tard.',
            receiptFailureMessage:
                '<rbr>Une erreur s’est produite lors du téléversement de votre reçu. Veuillez <a href="download">enregistrer le reçu</a> et <a href="retry">réessayer</a> plus tard.</rbr>',
            receiptFailureMessageShort: 'Une erreur s’est produite lors du téléchargement de votre reçu.',
            genericDeleteFailureMessage: 'Erreur inattendue lors de la suppression de cette dépense. Veuillez réessayer plus tard.',
            genericEditFailureMessage: 'Erreur inattendue lors de la modification de cette dépense. Veuillez réessayer plus tard.',
            genericSmartscanFailureMessage: 'Des champs manquent à la transaction',
            duplicateWaypointsErrorMessage: 'Veuillez supprimer les points de passage en double',
            atLeastTwoDifferentWaypoints: 'Veuillez saisir au moins deux adresses différentes',
            splitExpenseMultipleParticipantsErrorMessage: "Une dépense ne peut pas être répartie entre un espace de travail et d'autres membres. Veuillez mettre à jour votre sélection.",
            invalidMerchant: 'Veuillez saisir un commerçant valide',
            atLeastOneAttendee: 'Au moins un participant doit être sélectionné',
            invalidQuantity: 'Veuillez saisir une quantité valide',
            quantityGreaterThanZero: 'La quantité doit être supérieure à zéro',
            invalidSubrateLength: 'Il doit y avoir au moins un sous-taux',
            invalidRate: 'Taux non valide pour cet espace de travail. Veuillez sélectionner un taux disponible dans cet espace de travail.',
        },
        dismissReceiptError: 'Ignorer l’erreur',
        dismissReceiptErrorConfirmation: 'Attention ! Ignorer cette erreur supprimera entièrement votre reçu téléchargé. Êtes-vous sûr ?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `a commencé à se faire rembourser. Le paiement est en attente jusqu’à ce que ${submitterDisplayName} active son portefeuille.`,
        enableWallet: 'Activer le portefeuille',
        hold: 'En attente',
        unhold: 'Lever le blocage',
        holdExpense: () => ({
            one: 'Mettre la dépense en attente',
            other: 'Mettre les dépenses en attente',
        }),
        unholdExpense: 'Annuler la mise en attente de la dépense',
        heldExpense: 'a retenu cette dépense',
        unheldExpense: 'a débloqué cette dépense',
        moveUnreportedExpense: 'Déplacer la dépense non déclarée',
        addUnreportedExpense: 'Ajouter une dépense non déclarée',
        selectUnreportedExpense: 'Sélectionnez au moins une dépense à ajouter au rapport.',
        emptyStateUnreportedExpenseTitle: 'Aucune dépense non déclarée',
        emptyStateUnreportedExpenseSubtitle: 'Il semble que vous n’ayez aucune dépense non déclarée. Essayez d’en créer une ci-dessous.',
        addUnreportedExpenseConfirm: 'Ajouter au rapport',
        newReport: 'Nouveau rapport',
        explainHold: () => ({
            one: 'Expliquez pourquoi vous retenez cette dépense.',
            other: 'Expliquez pourquoi vous retenez ces dépenses.',
        }),
        retracted: 'Retiré',
        retract: 'Retirer',
        reopened: 'Rouvert',
        reopenReport: 'Rouvrir le rapport',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Ce rapport a déjà été exporté vers ${connectionName}. Le modifier pourrait entraîner des incohérences de données. Voulez-vous vraiment rouvrir ce rapport ?`,
        reason: 'Raison',
        holdReasonRequired: 'Une raison est requise lors de la mise en attente.',
        expenseWasPutOnHold: 'La dépense a été mise en attente',
        expenseOnHold: 'Cette dépense a été mise en attente. Veuillez consulter les commentaires pour connaître les prochaines étapes.',
        expensesOnHold: 'Toutes les dépenses ont été mises en attente. Veuillez consulter les commentaires pour connaître les prochaines étapes.',
        expenseDuplicate: 'Cette dépense présente des détails similaires à une autre. Veuillez examiner les doublons pour continuer.',
        someDuplicatesArePaid: 'Certains de ces doublons ont déjà été approuvés ou payés.',
        reviewDuplicates: 'Examiner les doublons',
        keepAll: 'Tout garder',
        confirmApprove: 'Confirmer le montant d’approbation',
        confirmApprovalAmount: 'Approuvez uniquement les dépenses conformes ou approuvez l’intégralité du rapport.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Cette dépense est en attente. Voulez-vous l’approuver quand même ?',
            other: 'Ces dépenses sont en attente. Voulez-vous les approuver quand même ?',
        }),
        confirmPay: 'Confirmer le montant du paiement',
        confirmPayAmount: 'Payez ce qui n’est pas en attente, ou payez l’intégralité du rapport.',
        confirmPayAllHoldAmount: () => ({
            one: 'Cette dépense est en attente. Voulez-vous quand même la payer ?',
            other: 'Ces dépenses sont en attente. Voulez-vous quand même payer ?',
        }),
        payOnly: 'Payer seulement',
        approveOnly: 'Approuver uniquement',
        holdEducationalTitle: 'Faut-il retenir cette dépense ?',
        whatIsHoldExplain: 'La mise en attente revient à appuyer sur « pause » pour une dépense jusqu’à ce que vous soyez prêt à la soumettre.',
        holdIsLeftBehind: 'Les dépenses en attente sont laissées de côté même si vous soumettez un rapport complet.',
        unholdWhenReady: 'Débloquez les dépenses lorsque vous êtes prêt à les soumettre.',
        changePolicyEducational: {
            title: 'Vous avez déplacé ce rapport !',
            description: 'Revérifiez ces éléments, qui ont tendance à changer lors du déplacement de rapports vers un nouvel espace de travail.',
            reCategorize: '<strong>Recatégorisez toutes les dépenses</strong> pour respecter les règles de l’espace de travail.',
            workflows: 'Ce rapport peut désormais être soumis à un <strong>processus de validation</strong> différent.',
        },
        changeWorkspace: "Changer d'espace de travail",
        set: 'définir',
        changed: 'Modifié',
        removed: 'Supprimé',
        transactionPending: 'Transaction en attente.',
        chooseARate: 'Sélectionnez un taux de remboursement d’espace de travail par mile ou kilomètre',
        unapprove: 'Annuler l’approbation',
        unapproveReport: 'Annuler l’approbation du rapport',
        headsUp: 'Attention !',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Ce rapport a déjà été exporté vers ${accountingIntegration}. Le modifier peut entraîner des écarts de données. Voulez-vous vraiment annuler l’approbation de ce rapport ?`,
        reimbursable: 'remboursable',
        nonReimbursable: 'non remboursable',
        bookingPending: 'Cette réservation est en attente',
        bookingPendingDescription: 'Cette réservation est en attente car elle n’a pas encore été payée.',
        bookingArchived: 'Cette réservation est archivée',
        bookingArchivedDescription: 'Cette réservation est archivée car la date du voyage est passée. Ajoutez une dépense pour le montant final si nécessaire.',
        attendees: 'Participants',
        whoIsYourAccountant: 'Qui est votre comptable ?',
        paymentComplete: 'Paiement terminé',
        time: 'Heure',
        startDate: 'Date de début',
        endDate: 'Date de fin',
        startTime: 'Heure de début',
        endTime: 'Heure de fin',
        deleteSubrate: 'Supprimer le sous-taux',
        deleteSubrateConfirmation: 'Voulez-vous vraiment supprimer ce sous-taux ?',
        quantity: 'Quantité',
        subrateSelection: 'Sélectionnez un sous-tarif et saisissez une quantité.',
        qty: 'Qté',
        firstDayText: () => ({
            one: `Premier jour : 1 heure`,
            other: (count: number) => `Premier jour : ${count.toFixed(2)} heures`,
        }),
        lastDayText: () => ({
            one: `Dernier jour : 1 heure`,
            other: (count: number) => `Dernier jour : ${count.toFixed(2)} heures`,
        }),
        tripLengthText: () => ({
            one: `Voyage : 1 journée complète`,
            other: (count: number) => `Voyage : ${count} jours complets`,
        }),
        dates: 'Dates',
        rates: 'Taux',
        submitsTo: ({name}: SubmitsToParams) => `Soumet à ${name}`,
        reject: {
            educationalTitle: 'Devriez-vous conserver ou rejeter ?',
            educationalText: 'Si vous n’êtes pas prêt à approuver ou à payer une dépense, vous pouvez la mettre en attente ou la rejeter.',
            holdExpenseTitle: 'Suspendre une dépense pour demander plus de détails avant approbation ou paiement.',
            approveExpenseTitle: 'Approuvez d’autres dépenses tandis que les dépenses bloquées restent affectées à vous.',
            heldExpenseLeftBehindTitle: 'Les dépenses en attente sont laissées de côté lorsque vous approuvez un rapport entier.',
            rejectExpenseTitle: 'Rejetez une dépense que vous n’avez pas l’intention d’approuver ou de payer.',
            reasonPageTitle: 'Rejeter la dépense',
            reasonPageDescription: 'Expliquez pourquoi vous rejetez cette dépense.',
            rejectReason: 'Raison du rejet',
            markAsResolved: 'Marquer comme résolu',
            rejectedStatus: 'Cette dépense a été refusée. Nous attendons que vous corrigiez les problèmes et la marquiez comme résolue pour permettre la soumission.',
            reportActions: {
                rejectedExpense: 'a rejeté cette dépense',
                markedAsResolved: 'a marqué le motif de rejet comme résolu',
            },
        },
        moveExpenses: () => ({one: 'Déplacer la dépense', other: 'Déplacer les dépenses'}),
        changeApprover: {
            title: 'Modifier l’approbateur',
            subtitle: 'Choisissez une option pour modifier l’approbateur de ce rapport.',
            description: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Vous pouvez également modifier l’approbateur de façon permanente pour tous les rapports dans vos <a href="${workflowSettingLink}">paramètres de workflow</a>.`,
            changedApproverMessage: ({managerID}: ChangedApproverMessageParams) => `a changé l’approbateur en <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Ajouter un approbateur',
                addApproverSubtitle: 'Ajouter un approbateur supplémentaire au workflow existant.',
                bypassApprovers: 'Contourner les approbateurs',
                bypassApproversSubtitle: 'Désignez-vous comme approbateur final et ignorez tous les autres approbateurs restants.',
            },
            addApprover: {
                subtitle: 'Choisissez un approbateur supplémentaire pour ce rapport avant que nous ne le fassions passer par le reste du workflow de validation.',
            },
        },
        chooseWorkspace: 'Choisir un espace de travail',
    },
    transactionMerge: {
        listPage: {
            header: 'Fusionner les dépenses',
            noEligibleExpenseFound: 'Aucune dépense éligible trouvée',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Vous n’avez aucune dépense pouvant être fusionnée avec celle-ci. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">En savoir plus</a> sur les dépenses admissibles.</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `Sélectionnez une <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">dépense admissible</a> à fusionner avec <strong>${reportName}</strong>.`,
        },
        receiptPage: {
            header: 'Sélectionner un reçu',
            pageTitle: 'Sélectionnez le reçu que vous souhaitez conserver :',
        },
        detailsPage: {
            header: 'Sélectionner les détails',
            pageTitle: 'Sélectionnez les détails que vous souhaitez conserver :',
            noDifferences: 'Aucune différence trouvée entre les transactions',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? 'un' : 'un';
                return `Veuillez sélectionner ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Veuillez sélectionner les participants',
            selectAllDetailsError: 'Sélectionnez tous les détails avant de continuer.',
        },
        confirmationPage: {
            header: 'Confirmer les détails',
            pageTitle: 'Confirmez les informations que vous conservez. Les informations que vous ne conservez pas seront supprimées.',
            confirmButton: 'Fusionner les dépenses',
        },
    },
    share: {
        shareToExpensify: 'Partager vers Expensify',
        messageInputLabel: 'Message',
    },
    notificationPreferencesPage: {
        header: 'Préférences de notification',
        label: 'M’informer des nouveaux messages',
        notificationPreferences: {
            always: 'Immédiatement',
            daily: 'Quotidien',
            mute: 'Muet',
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: 'Caché',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Le numéro n’a pas été validé. Cliquez sur le bouton pour renvoyer le lien de validation par SMS.',
        emailHasNotBeenValidated: 'L’e-mail n’a pas été validé. Cliquez sur le bouton pour renvoyer le lien de validation par SMS.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Téléverser une photo',
        removePhoto: 'Supprimer la photo',
        editImage: 'Modifier la photo',
        viewPhoto: 'Voir la photo',
        imageUploadFailed: 'Échec du téléversement de l’image',
        deleteWorkspaceError: 'Désolé, un problème inattendu est survenu lors de la suppression de l’avatar de votre espace de travail',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `L’image sélectionnée dépasse la taille maximale de téléversement de ${maxUploadSizeInMB} Mo.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Veuillez téléverser une image plus grande que ${minHeightInPx}x${minWidthInPx} pixels et plus petite que ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `La photo de profil doit être de l’un des types suivants : ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: 'Modifier la photo de profil',
        upload: 'Téléverser',
        uploadPhoto: 'Téléverser une photo',
        selectAvatar: 'Sélectionner un avatar',
        choosePresetAvatar: 'Ou choisissez un avatar personnalisé',
    },
    modal: {
        backdropLabel: 'Arrière-plan de la fenêtre modale',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `En attente que <strong>vous</strong> ajoutiez des dépenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En attente que <strong>${actor}</strong> ajoute des dépenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `En attente qu’un administrateur ajoute des dépenses.`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `Aucune autre action requise !`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `En attente que <strong>vous</strong> ajoutiez un compte bancaire.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En attente que <strong>${actor}</strong> ajoute un compte bancaire.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `En attente qu’un administrateur ajoute un compte bancaire.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `le ${eta}` : ` ${eta}`;
                }
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `En attente que <strong>vos</strong> notes de frais soient automatiquement soumises${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En attente que les dépenses de <strong>${actor}</strong> soient automatiquement soumises${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `En attente de l’envoi automatique des notes de frais d’un admin${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `En attente de <strong>vous</strong> pour résoudre le(s) problème(s).`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En attente que <strong>${actor}</strong> corrige le(s) problème(s).`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `En attente qu’un administrateur corrige le(s) problème(s).`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `En attente de <strong>vous</strong> pour approuver les dépenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En attente que <strong>${actor}</strong> approuve les dépenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `En attente de l'approbation des dépenses par un administrateur.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `En attente que <strong>vous</strong> exportiez ce rapport.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En attente que <strong>${actor}</strong> exporte ce rapport.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `En attente qu’un administrateur exporte ce rapport.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `En attente que <strong>vous</strong> payiez les notes de frais.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En attente que <strong>${actor}</strong> paie les dépenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `En attente qu’un administrateur paie les notes de frais.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `En attente que <strong>vous</strong> terminiez la configuration d’un compte bancaire professionnel.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En attente que <strong>${actor}</strong> termine la configuration d’un compte bancaire professionnel.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `En attente qu’un administrateur termine la configuration d’un compte bancaire professionnel.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `d’ici ${eta}` : ` ${eta}`;
                }
                return `En attente de la finalisation du paiement${formattedETA}.`;
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'bientôt',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'plus tard aujourd’hui',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'dimanche',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: 'le 1er et le 16 de chaque mois',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: 'le dernier jour ouvrable du mois',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: 'le dernier jour du mois',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: 'à la fin de votre voyage',
        },
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Pronoms préférés',
        selectYourPronouns: 'Sélectionnez vos pronoms',
        selfSelectYourPronoun: 'Sélectionnez vous-même votre pronom',
        emailAddress: 'Adresse e-mail',
        setMyTimezoneAutomatically: 'Définir mon fuseau horaire automatiquement',
        timezone: 'Fuseau horaire',
        invalidFileMessage: 'Fichier invalide. Veuillez essayer avec une autre image.',
        avatarUploadFailureMessage: "Une erreur s'est produite lors du téléversement de l’avatar. Veuillez réessayer.",
        online: 'En ligne',
        offline: 'Hors ligne',
        syncing: 'Synchronisation',
        profileAvatar: 'Avatar de profil',
        publicSection: {
            title: 'Public',
            subtitle: 'Ces informations sont affichées sur votre profil public. Tout le monde peut les voir.',
        },
        privateSection: {
            title: 'Privé',
            subtitle: 'Ces informations sont utilisées pour les voyages et les paiements. Elles ne sont jamais affichées sur votre profil public.',
        },
    },
    securityPage: {
        title: 'Options de sécurité',
        subtitle: 'Activez l’authentification à deux facteurs pour sécuriser votre compte.',
        goToSecurity: 'Retourner à la page de sécurité',
    },
    shareCodePage: {
        title: 'Votre code',
        subtitle: 'Invitez des membres sur Expensify en partageant votre code QR personnel ou votre lien de parrainage.',
    },
    pronounsPage: {
        pronouns: 'Pronoms',
        isShownOnProfile: 'Vos pronoms sont affichés sur votre profil.',
        placeholderText: 'Recherchez pour voir les options',
    },
    contacts: {
        contactMethods: 'Méthodes de contact',
        featureRequiresValidate: 'Cette fonctionnalité nécessite que vous validiez votre compte.',
        validateAccount: 'Vérifiez votre compte',
        helpText: ({email}: {email: string}) =>
            `Ajoutez d’autres moyens de vous connecter et d’envoyer des reçus à Expensify.<br/><br/>Ajoutez une adresse e-mail pour transférer des reçus à <a href="mailto:${email}">${email}</a> ou ajoutez un numéro de téléphone pour envoyer des reçus par SMS au 47777 (numéros américains uniquement).`,
        pleaseVerify: 'Veuillez vérifier cette méthode de contact.',
        getInTouch: 'Nous utiliserons cette méthode pour vous contacter.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `Veuillez saisir le code magique envoyé à ${contactMethod}. Il devrait arriver d’ici une à deux minutes.`,
        setAsDefault: 'Définir par défaut',
        yourDefaultContactMethod:
            'Ceci est votre méthode de contact par défaut actuelle. Avant de pouvoir la supprimer, vous devez choisir une autre méthode de contact et cliquer sur « Définir par défaut ».',
        removeContactMethod: 'Supprimer le moyen de contact',
        removeAreYouSure: 'Voulez-vous vraiment supprimer ce moyen de contact ? Cette action est irréversible.',
        failedNewContact: 'Échec de l’ajout de cette méthode de contact.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Échec de l’envoi d’un nouveau code magique. Veuillez patienter un peu et réessayer.',
            validateSecondaryLogin: 'Code magique incorrect ou non valide. Veuillez réessayer ou demander un nouveau code.',
            deleteContactMethod: 'Échec de la suppression du moyen de contact. Veuillez contacter Concierge pour obtenir de l’aide.',
            setDefaultContactMethod: 'Échec de la définition d’une nouvelle méthode de contact par défaut. Veuillez contacter Concierge pour obtenir de l’aide.',
            addContactMethod: 'Échec de l’ajout de cette méthode de contact. Veuillez contacter Concierge pour obtenir de l’aide.',
            enteredMethodIsAlreadySubmitted: 'Ce moyen de contact existe déjà',
            passwordRequired: 'mot de passe requis.',
            contactMethodRequired: 'La méthode de contact est requise',
            invalidContactMethod: 'Méthode de contact invalide',
        },
        newContactMethod: 'Nouvelle méthode de contact',
        goBackContactMethods: 'Revenir aux méthodes de contact',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Il / Lui / Son',
        heHimHisTheyThemTheirs: 'Il / Lui / Le sien / Iel / Iel / Le leur',
        sheHerHers: 'Elle / La / Sa',
        sheHerHersTheyThemTheirs: 'Elle / La / Sienne / Iel / Iel / Sien.ne',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Par / Pers.',
        theyThemTheirs: 'Iel / Iel / Leurs',
        thonThons: 'Thon / Thons',
        veVerVis: 'Voit / Voir / Vu',
        viVir: 'Nous / Notre',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Appelle-moi par mon nom',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: 'Nom d’affichage',
        isShownOnProfile: "Votre nom d'affichage est visible sur votre profil.",
    },
    timezonePage: {
        timezone: 'Fuseau horaire',
        isShownOnProfile: 'Votre fuseau horaire est affiché sur votre profil.',
        getLocationAutomatically: 'Déterminer automatiquement votre position',
    },
    updateRequiredView: {
        updateRequired: 'Mise à jour requise',
        pleaseInstall: 'Veuillez mettre à jour vers la dernière version de New Expensify',
        pleaseInstallExpensifyClassic: 'Veuillez installer la dernière version d’Expensify',
        toGetLatestChanges: 'Pour mobile ou ordinateur, téléchargez et installez la dernière version. Pour le web, actualisez votre navigateur.',
        newAppNotAvailable: 'La nouvelle application Expensify n’est plus disponible.',
    },
    initialSettingsPage: {
        about: 'À propos',
        aboutPage: {
            description: 'La nouvelle application Expensify est créée par une communauté de développeurs open source du monde entier. Aidez-nous à construire le futur d’Expensify.',
            appDownloadLinks: 'Liens de téléchargement de l’application',
            viewKeyboardShortcuts: 'Afficher les raccourcis clavier',
            viewTheCode: 'Afficher le code',
            viewOpenJobs: 'Voir les offres d’emploi ouvertes',
            reportABug: 'Signaler un bug',
            troubleshoot: 'Dépannage',
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
            clearCacheAndRestart: 'Vider le cache et redémarrer',
            viewConsole: 'Afficher la console de débogage',
            debugConsole: 'Console de débogage',
            description:
                '<muted-text>Utilisez les outils ci-dessous pour vous aider à dépanner l’expérience Expensify. Si vous rencontrez des problèmes, veuillez <concierge-link>signaler un bug</concierge-link>.</muted-text>',
            confirmResetDescription: 'Tous les brouillons de messages non envoyés seront perdus, mais le reste de vos données est en sécurité.',
            resetAndRefresh: 'Réinitialiser et actualiser',
            clientSideLogging: 'Journalisation côté client',
            noLogsToShare: 'Aucun journal à partager',
            useProfiling: 'Utiliser le profilage',
            profileTrace: 'Trace de profil',
            results: 'Résultats',
            releaseOptions: 'Options de publication',
            testingPreferences: 'Préférences de test',
            useStagingServer: 'Utiliser le serveur de préproduction',
            forceOffline: 'Forcer le mode hors ligne',
            simulatePoorConnection: 'Simuler une mauvaise connexion Internet',
            simulateFailingNetworkRequests: 'Simuler l’échec des requêtes réseau',
            authenticationStatus: 'Statut d’authentification',
            deviceCredentials: 'Identifiants de l’appareil',
            invalidate: 'Invalider',
            destroy: 'Détruire',
            maskExportOnyxStateData: 'Masquer les données sensibles des membres lors de l’exportation de l’état Onyx',
            exportOnyxState: 'Exporter l’état Onyx',
            importOnyxState: 'Importer l’état Onyx',
            testCrash: 'Test de plantage',
            resetToOriginalState: 'Réinitialiser à l’état d’origine',
            usingImportedState: 'Vous utilisez un état importé. Appuyez ici pour le réinitialiser.',
            debugMode: 'Mode débogage',
            invalidFile: 'Fichier non valide',
            invalidFileDescription: 'Le fichier que vous essayez d’importer n’est pas valide. Veuillez réessayer.',
            invalidateWithDelay: 'Invalider avec délai',
            recordTroubleshootData: 'Enregistrer les données de dépannage',
            softKillTheApp: 'Arrêter l’application en douceur',
            kill: 'Tuer',
        },
        debugConsole: {
            saveLog: 'Enregistrer le journal',
            shareLog: 'Partager le journal',
            enterCommand: 'Entrer la commande',
            execute: 'Exécuter',
            noLogsAvailable: 'Aucun journal disponible',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `La taille du journal dépasse la limite de ${size} Mo. Veuillez utiliser « Enregistrer le journal » pour télécharger le fichier journal à la place.`,
            logs: 'Journaux',
            viewConsole: 'Afficher la console',
        },
        security: 'Sécurité',
        signOut: 'Se déconnecter',
        restoreStashed: 'Restaurer la connexion mise en attente',
        signOutConfirmationText: 'Vous perdrez toutes les modifications effectuées hors ligne si vous vous déconnectez.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Lisez les <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Conditions d’utilisation</a> et la <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politique de confidentialité</a>.</muted-text-micro>`,
        help: 'Aide',
        whatIsNew: 'Quoi de neuf',
        accountSettings: 'Paramètres du compte',
        account: 'Compte',
        general: 'Général',
    },
    closeAccountPage: {
        // @context close as a verb, not an adjective
        closeAccount: 'Fermer le compte',
        reasonForLeavingPrompt: 'Nous serions désolés de vous voir partir ! Pourriez-vous nous dire pourquoi, afin que nous puissions nous améliorer ?',
        enterMessageHere: 'Saisissez le message ici',
        closeAccountWarning: 'La fermeture de votre compte est irréversible.',
        closeAccountPermanentlyDeleteData: 'Êtes-vous sûr de vouloir supprimer votre compte ? Cela supprimera définitivement toutes les dépenses en attente.',
        enterDefaultContactToConfirm: 'Veuillez saisir votre méthode de contact par défaut pour confirmer que vous souhaitez fermer votre compte. Votre méthode de contact par défaut est :',
        enterDefaultContact: 'Saisissez votre méthode de contact par défaut',
        defaultContact: 'Méthode de contact par défaut :',
        enterYourDefaultContactMethod: 'Veuillez saisir votre méthode de contact par défaut pour fermer votre compte.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Fusionner les comptes',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Saisissez le compte que vous souhaitez fusionner avec <strong>${login}</strong>.`,
            notReversibleConsent: 'Je comprends que cela n’est pas réversible',
        },
        accountValidate: {
            confirmMerge: 'Voulez-vous vraiment fusionner les comptes ?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `Fusionner vos comptes est irréversible et entraînera la perte de toutes les dépenses non soumises pour <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Pour continuer, veuillez saisir le code magique envoyé à <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Code magique incorrect ou non valide. Veuillez réessayer ou demander un nouveau code.',
                fallback: 'Une erreur s’est produite. Veuillez réessayer plus tard.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Comptes fusionnés !',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Vous avez fusionné avec succès toutes les données de <strong>${from}</strong> dans <strong>${to}</strong>. À l’avenir, vous pouvez utiliser l’un ou l’autre identifiant pour ce compte.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Nous y travaillons',
            limitedSupport: 'Nous ne prenons pas encore en charge la fusion de comptes sur New Expensify. Veuillez effectuer cette action sur Expensify Classic à la place.',
            reachOutForHelp: '<muted-text><centered-text>N’hésitez pas à <concierge-link>contacter Concierge</concierge-link> si vous avez des questions !</centered-text></muted-text>',
            goToExpensifyClassic: 'Aller à Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Vous ne pouvez pas fusionner <strong>${email}</strong> car il est contrôlé par <strong>${email.split('@').at(1) ?? ''}</strong>. Veuillez <concierge-link>contacter Concierge</concierge-link> pour obtenir de l’aide.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Vous ne pouvez pas fusionner <strong>${email}</strong> avec d’autres comptes, car l’administrateur de votre domaine l’a défini comme identifiant principal. Veuillez plutôt fusionner les autres comptes avec celui-ci.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Vous ne pouvez pas fusionner les comptes, car <strong>${email}</strong> a l’authentification à deux facteurs (2FA) activée. Veuillez désactiver la 2FA pour <strong>${email}</strong> puis réessayer.</centered-text></muted-text>`,
            learnMore: 'En savoir plus sur la fusion des comptes.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Vous ne pouvez pas fusionner <strong>${email}</strong> car il est verrouillé. Veuillez <concierge-link>contacter Concierge</concierge-link> pour obtenir de l’aide.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Vous ne pouvez pas fusionner les comptes, car <strong>${email}</strong> n’a pas de compte Expensify. Veuillez plutôt <a href="${contactMethodLink}">l’ajouter comme méthode de contact</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Vous ne pouvez pas fusionner <strong>${email}</strong> dans d’autres comptes. Veuillez plutôt fusionner les autres comptes dans celui-ci.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Vous ne pouvez pas fusionner de comptes vers <strong>${email}</strong> car ce compte possède une relation de facturation facturée.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Réessayez plus tard',
            description: 'Il y a eu trop de tentatives de fusion de comptes. Veuillez réessayer plus tard.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Vous ne pouvez pas fusionner avec d’autres comptes, car celui-ci n’est pas validé. Veuillez valider le compte puis réessayer.',
        },
        mergeFailureSelfMerge: {
            description: 'Vous ne pouvez pas fusionner un compte avec lui-même.',
        },
        mergeFailureGenericHeading: 'Impossible de fusionner les comptes',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Signaler une activité suspecte',
        lockAccount: 'Verrouiller le compte',
        unlockAccount: 'Déverrouiller le compte',
        compromisedDescription:
            'Vous avez remarqué quelque chose d’anormal sur votre compte ? Le signaler verrouillera immédiatement votre compte, bloquera les nouvelles transactions par carte Expensify et empêchera toute modification du compte.',
        domainAdminsDescription:
            'Pour les administrateurs de domaine : cela met également en pause toute l’activité des cartes Expensify et les actions des administrateurs sur l’ensemble de votre ou de vos domaines.',
        areYouSure: 'Êtes-vous sûr de vouloir verrouiller votre compte Expensify ?',
        onceLocked: 'Une fois verrouillé, votre compte sera restreint en attendant une demande de déverrouillage et un examen de sécurité',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Échec du verrouillage du compte',
        failedToLockAccountDescription: `Nous n’avons pas pu verrouiller votre compte. Veuillez discuter avec Concierge pour résoudre ce problème.`,
        chatWithConcierge: 'Discuter avec Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Compte verrouillé',
        yourAccountIsLocked: 'Votre compte est verrouillé',
        chatToConciergeToUnlock: 'Discutez avec Concierge pour résoudre les problèmes de sécurité et déverrouiller votre compte.',
        chatWithConcierge: 'Discuter avec Concierge',
    },
    passwordPage: {
        changePassword: 'Modifier le mot de passe',
        changingYourPasswordPrompt: 'La modification de votre mot de passe mettra à jour votre mot de passe pour vos comptes Expensify.com et New Expensify.',
        currentPassword: 'Mot de passe actuel',
        newPassword: 'Nouveau mot de passe',
        newPasswordPrompt:
            'Votre nouveau mot de passe doit être différent de votre ancien mot de passe et contenir au moins 8 caractères, 1 lettre majuscule, 1 lettre minuscule et 1 chiffre.',
    },
    twoFactorAuth: {
        headerTitle: 'Authentification à deux facteurs',
        twoFactorAuthEnabled: 'Authentification à deux facteurs activée',
        whatIsTwoFactorAuth:
            'L’authentification à deux facteurs (2FA) aide à sécuriser votre compte. Lors de la connexion, vous devrez saisir un code généré par votre application d’authentification préférée.',
        disableTwoFactorAuth: 'Désactiver l’authentification à deux facteurs',
        explainProcessToRemove: 'Pour désactiver l’authentification à deux facteurs (2FA), veuillez saisir un code valide issu de votre application d’authentification.',
        explainProcessToRemoveWithRecovery: 'Pour désactiver l’authentification à deux facteurs (2FA), veuillez entrer un code de récupération valide.',
        disabled: 'L’authentification à deux facteurs est maintenant désactivée',
        noAuthenticatorApp: 'Vous n’aurez plus besoin d’une application d’authentification pour vous connecter à Expensify.',
        stepCodes: 'Codes de récupération',
        keepCodesSafe: 'Conservez ces codes de récupération en lieu sûr !',
        codesLoseAccess: dedent(`
            Si vous perdez l’accès à votre application d’authentification et que vous n’avez pas ces codes, vous perdrez l’accès à votre compte.

            Remarque : la configuration de l’authentification à deux facteurs vous déconnectera de toutes les autres sessions actives.
        `),
        errorStepCodes: 'Veuillez copier ou télécharger les codes avant de continuer',
        stepVerify: 'Vérifier',
        scanCode: 'Scannez le code QR à l’aide de votre',
        authenticatorApp: 'application d’authentification',
        addKey: 'Ou ajoutez cette clé secrète à votre application d’authentification :',
        enterCode: 'Saisissez ensuite le code à six chiffres généré par votre application d’authentification.',
        stepSuccess: 'Terminé',
        enabled: 'Authentification à deux facteurs activée',
        congrats: 'Félicitations ! Vous disposez désormais de cette sécurité supplémentaire.',
        copy: 'Copier',
        disable: 'Désactiver',
        enableTwoFactorAuth: 'Activer l’authentification à deux facteurs',
        pleaseEnableTwoFactorAuth: 'Veuillez activer l’authentification à deux facteurs.',
        twoFactorAuthIsRequiredDescription: 'Pour des raisons de sécurité, Xero exige une authentification à deux facteurs pour connecter l’intégration.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Authentification à deux facteurs requise',
        twoFactorAuthIsRequiredForAdminsTitle: 'Veuillez activer l’authentification à deux facteurs',
        twoFactorAuthIsRequiredXero: 'Votre connexion comptable Xero nécessite l’utilisation de l’authentification à deux facteurs. Pour continuer à utiliser Expensify, veuillez l’activer.',
        twoFactorAuthIsRequiredCompany: 'Votre entreprise exige l’utilisation de l’authentification à deux facteurs. Pour continuer à utiliser Expensify, veuillez l’activer.',
        twoFactorAuthCannotDisable: 'Impossible de désactiver la 2FA',
        twoFactorAuthRequired: 'L’authentification à deux facteurs (2FA) est requise pour votre connexion Xero et ne peut pas être désactivée.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Veuillez saisir votre code de récupération',
            incorrectRecoveryCode: 'Code de récupération incorrect. Veuillez réessayer.',
        },
        useRecoveryCode: 'Utiliser le code de récupération',
        recoveryCode: 'Code de récupération',
        use2fa: 'Utiliser le code d’authentification à deux facteurs',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Veuillez saisir votre code d’authentification à deux facteurs',
            incorrect2fa: 'Code d’authentification à deux facteurs incorrect. Veuillez réessayer.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Mot de passe mis à jour !',
        allSet: 'Tout est prêt. Gardez votre nouveau mot de passe en sécurité.',
    },
    privateNotes: {
        title: 'Notes privées',
        personalNoteMessage: 'Conservez des notes sur cette discussion ici. Vous êtes la seule personne qui peut ajouter, modifier ou voir ces notes.',
        sharedNoteMessage: 'Conservez des notes concernant cette discussion ici. Les employés d’Expensify et les autres membres du domaine team.expensify.com peuvent consulter ces notes.',
        composerLabel: 'Notes',
        myNote: 'Ma note',
        error: {
            genericFailureMessage: 'Impossible d’enregistrer les notes privées',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Veuillez entrer un code de sécurité valide',
        },
        securityCode: 'Code de sécurité',
        changeBillingCurrency: 'Modifier la devise de facturation',
        changePaymentCurrency: 'Changer la devise de paiement',
        paymentCurrency: 'Devise de paiement',
        paymentCurrencyDescription: 'Sélectionnez une devise standardisée vers laquelle toutes les dépenses personnelles doivent être converties',
        note: `Remarque : La modification de votre devise de paiement peut avoir une incidence sur le montant que vous paierez pour Expensify. Consultez notre <a href="${CONST.PRICING}">page des tarifs</a> pour plus de détails.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Ajouter une carte de débit',
        nameOnCard: 'Nom figurant sur la carte',
        debitCardNumber: 'Numéro de carte de débit',
        expiration: 'Date d’expiration',
        expirationDate: 'MMAA',
        cvv: 'CVV',
        billingAddress: 'Adresse de facturation',
        growlMessageOnSave: 'Votre carte de débit a été ajoutée avec succès',
        expensifyPassword: 'Mot de passe Expensify',
        error: {
            invalidName: 'Le nom peut uniquement contenir des lettres',
            addressZipCode: 'Veuillez saisir un code postal valide',
            debitCardNumber: 'Veuillez saisir un numéro de carte de débit valide',
            expirationDate: 'Veuillez sélectionner une date d’expiration valide',
            securityCode: 'Veuillez entrer un code de sécurité valide',
            addressStreet: 'Veuillez saisir une adresse de facturation valide qui ne soit pas une boîte postale.',
            addressState: 'Veuillez sélectionner un État',
            addressCity: 'Veuillez saisir une ville',
            genericFailureMessage: "Une erreur s'est produite lors de l'ajout de votre carte. Veuillez réessayer.",
            password: 'Veuillez saisir votre mot de passe Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Ajouter une carte de paiement',
        nameOnCard: 'Nom figurant sur la carte',
        paymentCardNumber: 'Numéro de carte',
        expiration: 'Date d’expiration',
        expirationDate: 'MM/AA',
        cvv: 'CVV',
        billingAddress: 'Adresse de facturation',
        growlMessageOnSave: 'Votre carte de paiement a été ajoutée avec succès',
        expensifyPassword: 'Mot de passe Expensify',
        error: {
            invalidName: 'Le nom peut uniquement contenir des lettres',
            addressZipCode: 'Veuillez saisir un code postal valide',
            paymentCardNumber: 'Veuillez saisir un numéro de carte valide',
            expirationDate: 'Veuillez sélectionner une date d’expiration valide',
            securityCode: 'Veuillez entrer un code de sécurité valide',
            addressStreet: 'Veuillez saisir une adresse de facturation valide qui ne soit pas une boîte postale.',
            addressState: 'Veuillez sélectionner un État',
            addressCity: 'Veuillez saisir une ville',
            genericFailureMessage: "Une erreur s'est produite lors de l'ajout de votre carte. Veuillez réessayer.",
            password: 'Veuillez saisir votre mot de passe Expensify',
        },
    },
    walletPage: {
        balance: 'Solde',
        paymentMethodsTitle: 'Modes de paiement',
        setDefaultConfirmation: 'Définir comme mode de paiement par défaut',
        setDefaultSuccess: 'Mode de paiement par défaut défini !',
        deleteAccount: 'Supprimer le compte',
        deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer ce compte ?',
        error: {
            notOwnerOfBankAccount: 'Une erreur s’est produite lors de la définition de ce compte bancaire comme mode de paiement par défaut',
            invalidBankAccount: 'Ce compte bancaire est temporairement suspendu',
            notOwnerOfFund: 'Une erreur s’est produite lors de la définition de cette carte comme mode de paiement par défaut',
            setDefaultFailure: 'Une erreur s’est produite. Veuillez discuter avec Concierge pour obtenir une aide supplémentaire.',
        },
        addBankAccountFailure: 'Une erreur inattendue s’est produite lors de l’ajout de votre compte bancaire. Veuillez réessayer.',
        getPaidFaster: 'Soyez payé plus rapidement',
        addPaymentMethod: 'Ajoutez un mode de paiement pour envoyer et recevoir des paiements directement dans l’application.',
        getPaidBackFaster: 'Soyez remboursé plus rapidement',
        secureAccessToYourMoney: 'Accédez à votre argent en toute sécurité',
        receiveMoney: 'Recevez de l’argent dans votre devise locale',
        expensifyWallet: 'Portefeuille Expensify (bêta)',
        sendAndReceiveMoney: 'Envoyez et recevez de l’argent avec des amis. Comptes bancaires américains uniquement.',
        enableWallet: 'Activer le portefeuille',
        addBankAccountToSendAndReceive: 'Ajoutez un compte bancaire pour effectuer ou recevoir des paiements.',
        addDebitOrCreditCard: 'Ajouter une carte de débit ou de crédit',
        assignedCards: 'Cartes attribuées',
        assignedCardsDescription: 'Ce sont des cartes attribuées par un administrateur d’espace de travail pour gérer les dépenses de l’entreprise.',
        expensifyCard: 'Carte Expensify',
        walletActivationPending: 'Nous examinons vos informations. Veuillez revenir dans quelques minutes !',
        walletActivationFailed: 'Malheureusement, votre portefeuille ne peut pas être activé pour le moment. Veuillez discuter avec Concierge pour obtenir une aide supplémentaire.',
        addYourBankAccount: 'Ajoutez votre compte bancaire',
        addBankAccountBody: 'Connectons votre compte bancaire à Expensify afin qu’il soit plus facile que jamais d’envoyer et de recevoir des paiements directement dans l’application.',
        chooseYourBankAccount: 'Choisissez votre compte bancaire',
        chooseAccountBody: 'Assurez-vous de sélectionner la bonne option.',
        confirmYourBankAccount: 'Confirmez votre compte bancaire',
        personalBankAccounts: 'Comptes bancaires personnels',
        businessBankAccounts: 'Comptes bancaires professionnels',
    },
    cardPage: {
        expensifyCard: 'Carte Expensify',
        expensifyTravelCard: 'Carte Travel Expensify',
        availableSpend: 'Limite restante',
        smartLimit: {
            name: 'Limite intelligente',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Vous pouvez dépenser jusqu’à ${formattedLimit} avec cette carte, et la limite sera réinitialisée au fur et à mesure que vos notes de frais soumises sont approuvées.`,
        },
        fixedLimit: {
            name: 'Limite fixe',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Vous pouvez dépenser jusqu’à ${formattedLimit} avec cette carte, puis elle sera désactivée.`,
        },
        monthlyLimit: {
            name: 'Limite mensuelle',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Vous pouvez dépenser jusqu’à ${formattedLimit} par mois avec cette carte. La limite sera réinitialisée le 1er jour de chaque mois calendaire.`,
        },
        virtualCardNumber: 'Numéro de carte virtuelle',
        travelCardCvv: 'Cryptogramme visuel (CVV) de la carte de voyage',
        physicalCardNumber: 'Numéro de carte physique',
        physicalCardPin: 'Code PIN',
        getPhysicalCard: 'Obtenir une carte physique',
        reportFraud: 'Signaler une fraude de carte virtuelle',
        reportTravelFraud: 'Signaler une fraude de carte de voyage',
        reviewTransaction: 'Examiner la transaction',
        suspiciousBannerTitle: 'Transaction suspecte',
        suspiciousBannerDescription: 'Nous avons remarqué des transactions suspectes sur votre carte. Touchez ci-dessous pour les vérifier.',
        cardLocked: 'Votre carte est temporairement verrouillée pendant que notre équipe examine le compte de votre entreprise.',
        cardDetails: {
            cardNumber: 'Numéro de carte virtuelle',
            expiration: 'Expiration',
            cvv: 'CVV',
            address: 'Adresse',
            revealDetails: 'Afficher les détails',
            revealCvv: 'Afficher le CVV',
            copyCardNumber: 'Copier le numéro de carte',
            updateAddress: 'Mettre à jour l’adresse',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Ajouté au portefeuille ${platform}`,
        cardDetailsLoadingFailure: "Une erreur s'est produite lors du chargement des détails de la carte. Veuillez vérifier votre connexion Internet et réessayer.",
        validateCardTitle: 'Vérifions que c’est bien vous',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Veuillez saisir le code magique envoyé à ${contactMethod} pour afficher les détails de votre carte. Il devrait arriver d’ici une à deux minutes.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `Veuillez <a href="${missingDetailsLink}">ajouter vos informations personnelles</a>, puis réessayer.`,
        unexpectedError: 'Une erreur s’est produite lors de la récupération des détails de votre carte Expensify. Veuillez réessayer.',
        cardFraudAlert: {
            confirmButtonText: 'Oui, je le fais',
            reportFraudButtonText: 'Non, ce n’était pas moi',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `a annulé l’activité suspecte et a réactivé la carte x${cardLastFour}. Tout est prêt pour continuer à faire des notes de frais !`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `a désactivé la carte se terminant par ${cardLastFour}`,
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
            }) => `activité suspecte détectée sur la carte se terminant par ${cardLastFour}. Reconnaissez-vous cette dépense ?

${amount} pour ${merchant} - ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Dépenser',
        workflowDescription: 'Configurez un flux de travail dès que des dépenses sont engagées, y compris l’approbation et le paiement.',
        submissionFrequency: 'Fréquence d’envoi',
        submissionFrequencyDescription: 'Choisissez un planning personnalisé pour soumettre les notes de frais.',
        submissionFrequencyDateOfMonth: 'Date du mois',
        disableApprovalPromptDescription: 'La désactivation des validations effacera tous les circuits d’approbation existants.',
        addApprovalsTitle: 'Ajouter des validations',
        addApprovalButton: 'Ajouter un workflow d’approbation',
        addApprovalTip: 'Ce flux de travail par défaut s’applique à tous les membres, sauf si un flux de travail plus spécifique existe.',
        approver: 'Approbateur',
        addApprovalsDescription: 'Exiger une approbation supplémentaire avant d’autoriser un paiement.',
        makeOrTrackPaymentsTitle: 'Effectuer ou suivre des paiements',
        makeOrTrackPaymentsDescription: 'Ajoutez un payeur autorisé pour les paiements effectués dans Expensify ou suivez les paiements effectués ailleurs.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Un workflow d’approbation personnalisé est activé sur cet espace de travail. Pour consulter ou modifier ce workflow, veuillez contacter votre <account-manager-link>Account Manager</account-manager-link> ou <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Un workflow d’approbation personnalisé est activé sur cet espace de travail. Pour consulter ou modifier ce workflow, veuillez contacter <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Choisissez combien de temps Expensify doit attendre avant de partager des dépenses sans erreur.',
        },
        frequencyDescription: 'Choisissez la fréquence à laquelle vous souhaitez que les notes de frais soient soumises automatiquement, ou rendez la soumission manuelle',
        frequencies: {
            instant: 'Instantanément',
            weekly: 'Hebdomadaire',
            monthly: 'Mensuel',
            twiceAMonth: 'Deux fois par mois',
            byTrip: 'Par déplacement',
            manually: 'Manuellement',
            daily: 'Quotidien',
            lastDayOfMonth: 'Dernier jour du mois',
            lastBusinessDayOfMonth: 'Dernier jour ouvrable du mois',
            ordinals: {
                one: 'st',
                two: 'et',
                few: 'e',
                other: 'e',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Premier',
                '2': 'Deuxième',
                '3': 'Troisième',
                '4': 'Quatrième',
                '5': 'Cinquième',
                '6': 'Sixième',
                '7': 'Septième',
                '8': 'Huitième',
                '9': 'Neuvième',
                '10': 'Dixième',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Ce membre appartient déjà à un autre workflow d’approbation. Toute mise à jour effectuée ici s’y reflétera également.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> approuve déjà les rapports pour <strong>${name2}</strong>. Veuillez choisir un autre approbateur afin d’éviter un circuit d’approbation circulaire.`,
        emptyContent: {
            title: 'Aucun membre à afficher',
            expensesFromSubtitle: 'Tous les membres de l’espace de travail appartiennent déjà à un circuit de validation existant.',
            approverSubtitle: 'Tous les approbateurs appartiennent à un workflow existant.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'La fréquence d’envoi n’a pas pu être modifiée. Veuillez réessayer ou contacter l’assistance.',
        monthlyOffsetErrorMessage: 'La fréquence mensuelle n’a pas pu être modifiée. Veuillez réessayer ou contacter l’assistance.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Confirmer',
        header: 'Ajoutez plus d’approbateurs et confirmez.',
        additionalApprover: 'Approbateur supplémentaire',
        submitButton: 'Ajouter un workflow',
    },
    workflowsEditApprovalsPage: {
        title: 'Modifier le flux d’approbation',
        deleteTitle: 'Supprimer le workflow d’approbation',
        deletePrompt: 'Voulez-vous vraiment supprimer ce flux d’approbation ? Tous les membres suivront ensuite le flux par défaut.',
    },
    workflowsExpensesFromPage: {
        title: 'Dépenses de',
        header: 'Lorsque les membres suivants soumettent des dépenses :',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'L’approbateur n’a pas pu être modifié. Veuillez réessayer ou contacter l’assistance.',
        header: 'Envoyer à ce membre pour approbation :',
    },
    workflowsPayerPage: {
        title: 'Payeur autorisé',
        genericErrorMessage: 'Le payeur autorisé n’a pas pu être modifié. Veuillez réessayer.',
        admins: 'Admin',
        payer: 'Payeur',
        paymentAccount: 'Compte de paiement',
    },
    reportFraudPage: {
        title: 'Signaler une fraude de carte virtuelle',
        description:
            'Si les informations de votre carte virtuelle ont été volées ou compromises, nous désactiverons définitivement votre carte existante et vous fournirons une nouvelle carte virtuelle avec un nouveau numéro.',
        deactivateCard: 'Désactiver la carte',
        reportVirtualCardFraud: 'Signaler une fraude de carte virtuelle',
    },
    reportFraudConfirmationPage: {
        title: 'Fraude de carte signalée',
        description: 'Nous avons définitivement désactivé votre carte existante. Lorsque vous reviendrez consulter les détails de votre carte, une nouvelle carte virtuelle sera disponible.',
        buttonText: 'Compris, merci !',
    },
    activateCardPage: {
        activateCard: 'Activer la carte',
        pleaseEnterLastFour: 'Veuillez saisir les quatre derniers chiffres de votre carte.',
        activatePhysicalCard: 'Activer la carte physique',
        error: {
            thatDidNotMatch: 'Cela ne correspond pas aux 4 derniers chiffres de votre carte. Veuillez réessayer.',
            throttled:
                'Vous avez saisi de manière incorrecte les 4 derniers chiffres de votre carte Expensify trop de fois. Si vous êtes sûr que les numéros sont corrects, veuillez contacter Concierge pour résoudre le problème. Sinon, réessayez plus tard.',
        },
    },
    getPhysicalCard: {
        header: 'Obtenir une carte physique',
        nameMessage: 'Saisissez votre prénom et votre nom de famille, car ils apparaîtront sur votre carte.',
        legalName: 'Nom légal',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        phoneMessage: 'Saisissez votre numéro de téléphone.',
        phoneNumber: 'Numéro de téléphone',
        address: 'Adresse',
        addressMessage: 'Saisissez votre adresse de livraison.',
        streetAddress: 'Adresse postale',
        city: 'Ville',
        state: 'État',
        zipPostcode: 'Code postal',
        country: 'Pays',
        confirmMessage: 'Veuillez confirmer vos informations ci-dessous.',
        estimatedDeliveryMessage: 'Votre carte physique arrivera sous 2 à 3 jours ouvrables.',
        next: 'Suivant',
        getPhysicalCard: 'Obtenir une carte physique',
        shipCard: 'Expédier la carte',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transférer${amount ? ` ${amount}` : ''}`,
        instant: 'Instantané (carte de débit)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `Frais de ${rate}% (${minAmount} minimum)`,
        ach: '1 à 3 jours ouvrés (Compte bancaire)',
        achSummary: 'Aucun frais',
        whichAccount: 'Quel compte ?',
        fee: 'Frais',
        transferSuccess: 'Transfert réussi !',
        transferDetailBankAccount: 'Votre argent devrait arriver dans les 1 à 3 prochains jours ouvrables.',
        transferDetailDebitCard: 'Votre argent devrait arriver immédiatement.',
        failedTransfer: 'Votre solde n’est pas entièrement réglé. Veuillez effectuer un virement vers un compte bancaire.',
        notHereSubTitle: 'Veuillez transférer votre solde depuis la page du portefeuille',
        goToWallet: 'Aller au Portefeuille',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Choisir un compte',
    },
    paymentMethodList: {
        addPaymentMethod: 'Ajouter un moyen de paiement',
        addNewDebitCard: 'Ajouter une nouvelle carte de débit',
        addNewBankAccount: 'Ajouter un nouveau compte bancaire',
        accountLastFour: 'Se terminant par',
        cardLastFour: 'Carte se terminant par',
        addFirstPaymentMethod: 'Ajoutez un mode de paiement pour envoyer et recevoir des paiements directement dans l’application.',
        defaultPaymentMethod: 'Par défaut',
        bankAccountLastFour: ({lastFour}: BankAccountLastFourParams) => `Compte bancaire • ${lastFour}`,
    },
    preferencesPage: {
        appSection: {
            title: 'Préférences de l’application',
        },
        testSection: {
            title: 'Tester les préférences',
            subtitle: 'Paramètres pour aider à déboguer et tester l’application sur l’environnement de staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Recevez les mises à jour de fonctionnalités pertinentes et les actualités d’Expensify',
        muteAllSounds: 'Couper tous les sons d’Expensify',
    },
    priorityModePage: {
        priorityMode: 'Mode priorité',
        explainerText: 'Choisissez de #focus uniquement sur les discussions non lues et épinglées, ou d’afficher tout, avec les discussions les plus récentes et épinglées en haut.',
        priorityModes: {
            default: {
                label: 'Plus récent',
                description: 'Afficher toutes les discussions triées par les plus récentes',
            },
            gsd: {
                label: '#concentration',
                description: 'Afficher uniquement les non lus triés par ordre alphabétique',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `dans ${policyName}`,
        generatingPDF: 'Génération du PDF...',
        waitForPDF: 'Veuillez patienter pendant que nous générons le PDF',
        errorPDF: 'Une erreur s’est produite lors de la tentative de génération de votre PDF',
    },
    reportDescriptionPage: {
        roomDescription: 'Description de la chambre',
        roomDescriptionOptional: 'Description de la salle (facultatif)',
        explainerText: 'Définir une description personnalisée pour la salle.',
    },
    groupChat: {
        lastMemberTitle: 'Attention !',
        lastMemberWarning: 'Comme vous êtes la dernière personne ici, partir rendra cette discussion inaccessible à tous les membres. Êtes-vous sûr de vouloir partir ?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Salon de groupe de ${displayName}`,
    },
    languagePage: {
        language: 'Langue',
        aiGenerated: 'Les traductions pour cette langue sont générées automatiquement et peuvent contenir des erreurs.',
    },
    themePage: {
        theme: 'Thème',
        themes: {
            dark: {
                label: 'Sombre',
            },
            light: {
                label: 'Clair',
            },
            system: {
                label: 'Utiliser les paramètres de l’appareil',
            },
        },
        chooseThemeBelowOrSync: 'Choisissez un thème ci-dessous ou synchronisez-le avec les paramètres de votre appareil.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>En vous connectant, vous acceptez les <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Conditions d’utilisation</a> et la <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politique de confidentialité</a>.</muted-text-xs>`,
        license: `<muted-text-xs>La transmission d’argent est fournie par ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) conformément à ses <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licences</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Vous n’avez pas reçu de code magique ?',
        enterAuthenticatorCode: 'Veuillez saisir votre code d’authentification',
        enterRecoveryCode: 'Veuillez saisir votre code de récupération',
        requiredWhen2FAEnabled: 'Requis lorsque la 2FA est activée',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Demander un nouveau code dans <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Demander un nouveau code',
        error: {
            pleaseFillMagicCode: 'Veuillez saisir votre code magique',
            incorrectMagicCode: 'Code magique incorrect ou non valide. Veuillez réessayer ou demander un nouveau code.',
            pleaseFillTwoFactorAuth: 'Veuillez saisir votre code d’authentification à deux facteurs',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Veuillez remplir tous les champs',
        pleaseFillPassword: 'Veuillez saisir votre mot de passe',
        pleaseFillTwoFactorAuth: 'Veuillez saisir votre code à deux facteurs',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Saisissez votre code d’authentification à deux facteurs pour continuer',
        forgot: 'Mot de passe oublié ?',
        requiredWhen2FAEnabled: 'Requis lorsque la 2FA est activée',
        error: {
            incorrectPassword: 'Mot de passe incorrect. Veuillez réessayer.',
            incorrectLoginOrPassword: 'Identifiant ou mot de passe incorrect. Veuillez réessayer.',
            incorrect2fa: 'Code d’authentification à deux facteurs incorrect. Veuillez réessayer.',
            twoFactorAuthenticationEnabled:
                'Vous avez activé l’authentification à deux facteurs (2FA) sur ce compte. Veuillez vous connecter en utilisant votre adresse e-mail ou votre numéro de téléphone.',
            invalidLoginOrPassword: 'Identifiant ou mot de passe invalide. Veuillez réessayer ou réinitialiser votre mot de passe.',
            unableToResetPassword:
                'Nous n’avons pas pu modifier votre mot de passe. Cela est probablement dû à un lien de réinitialisation de mot de passe expiré dans un ancien e-mail de réinitialisation. Nous vous avons envoyé un nouveau lien afin que vous puissiez réessayer. Vérifiez votre boîte de réception et votre dossier de courrier indésirable ; il devrait arriver d’ici quelques minutes.',
            noAccess: 'Vous n’avez pas accès à cette application. Veuillez ajouter votre nom d’utilisateur GitHub pour obtenir l’accès.',
            accountLocked: 'Votre compte a été verrouillé après trop de tentatives infructueuses. Veuillez réessayer dans 1 heure.',
            fallback: 'Une erreur s’est produite. Veuillez réessayer plus tard.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Téléphone ou e-mail',
        error: {
            invalidFormatEmailLogin: 'L’adresse e-mail saisie n’est pas valide. Veuillez corriger le format et réessayer.',
        },
        cannotGetAccountDetails: 'Impossible de récupérer les détails du compte. Veuillez essayer de vous reconnecter.',
        loginForm: 'Formulaire de connexion',
        notYou: ({user}: NotYouParams) => `Pas ${user} ?`,
    },
    onboarding: {
        welcome: 'Bienvenue !',
        welcomeSignOffTitleManageTeam:
            'Une fois que vous aurez terminé les tâches ci-dessus, nous pourrons explorer davantage de fonctionnalités comme les workflows d’approbation et les règles !',
        welcomeSignOffTitle: 'C’est un plaisir de vous rencontrer !',
        explanationModal: {
            title: 'Bienvenue sur Expensify',
            description:
                'Une seule application pour gérer vos dépenses professionnelles et personnelles à la vitesse d’une conversation. Essayez-la et dites-nous ce que vous en pensez. Et ce n’est qu’un début !',
            secondaryDescription: 'Pour revenir à Expensify Classic, appuyez simplement sur votre photo de profil > Aller à Expensify Classic.',
        },
        getStarted: 'Commencer',
        whatsYourName: 'Comment vous appelez-vous ?',
        peopleYouMayKnow: 'Des personnes que vous connaissez sont déjà ici ! Vérifiez votre e-mail pour les rejoindre.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Quelqu’un de ${domain} a déjà créé un espace de travail. Veuillez saisir le code magique envoyé à ${email}.`,
        joinAWorkspace: 'Rejoindre un espace de travail',
        listOfWorkspaces: 'Voici la liste des espaces de travail que vous pouvez rejoindre. Ne vous inquiétez pas, vous pourrez toujours les rejoindre plus tard si vous préférez.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} membre${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Où travaillez-vous ?',
        errorSelection: 'Sélectionnez une option pour continuer',
        purpose: {
            title: 'Que voulez-vous faire aujourd’hui ?',
            errorContinue: 'Veuillez appuyer sur Continuer pour procéder à la configuration',
            errorBackButton: 'Veuillez terminer les questions de configuration pour commencer à utiliser l’application',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Être remboursé par mon employeur',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Gérer les dépenses de mon équipe',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Suivre et budgéter les dépenses',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Discutez et partagez des dépenses avec des amis',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Autre chose',
        },
        employees: {
            title: 'Combien d’employés avez-vous ?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1 à 10 employés',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11 à 50 employés',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51–100 employés',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1 000 employés',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Plus de 1 000 employés',
        },
        accounting: {
            title: 'Utilisez-vous un logiciel de comptabilité ?',
            none: 'Aucun',
        },
        interestedFeatures: {
            title: 'Quelles fonctionnalités vous intéressent ?',
            featuresAlreadyEnabled: 'Voici nos fonctionnalités les plus populaires :',
            featureYouMayBeInterestedIn: 'Activer des fonctionnalités supplémentaires',
        },
        error: {
            requiredFirstName: 'Veuillez saisir votre prénom pour continuer',
        },
        workEmail: {
            title: 'Quelle est votre adresse e-mail professionnelle ?',
            subtitle: 'Expensify fonctionne mieux lorsque vous connectez votre adresse e-mail professionnelle.',
            explanationModal: {
                descriptionOne: 'Transférer à receipts@expensify.com pour numérisation',
                descriptionTwo: 'Rejoignez vos collègues qui utilisent déjà Expensify',
                descriptionThree: 'Profitez d’une expérience plus personnalisée',
            },
            addWorkEmail: 'Ajouter une adresse e-mail professionnelle',
        },
        workEmailValidation: {
            title: 'Vérifiez votre adresse e-mail professionnelle',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Veuillez saisir le code magique envoyé à ${workEmail}. Il devrait arriver d'ici une minute ou deux.`,
        },
        workEmailValidationError: {
            publicEmail: 'Veuillez saisir une adresse e-mail professionnelle valide d’un domaine privé, par ex. mitch@company.com',
            offline: 'Nous n’avons pas pu ajouter votre adresse e-mail professionnelle car vous semblez hors ligne',
        },
        mergeBlockScreen: {
            title: 'Impossible d’ajouter l’adresse e-mail professionnelle',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Nous n’avons pas pu ajouter ${workEmail}. Veuillez réessayer plus tard dans les paramètres ou discuter avec Concierge pour obtenir de l’aide.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Faites un [essai](${testDriveURL})`,
                description: ({testDriveURL}) =>
                    `[Faites une visite rapide du produit](${testDriveURL}) pour découvrir pourquoi Expensify est le moyen le plus rapide de gérer vos notes de frais.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Faites un [essai](${testDriveURL})`,
                description: ({testDriveURL}) => `Faites un [essai](${testDriveURL}) et offrez à votre équipe *3 mois gratuits d’Expensify !*`,
            },
            addExpenseApprovalsTask: {
                title: 'Ajouter des approbations de dépenses',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Ajoutez des validations de dépenses* pour examiner les dépenses de votre équipe et les garder sous contrôle.

                        Voici comment faire :

                        1. Allez dans *Workspaces*.
                        2. Sélectionnez votre espace de travail.
                        3. Cliquez sur *More features*.
                        4. Activez *Workflows*.
                        5. Accédez à *Workflows* dans l’éditeur d’espace de travail.
                        6. Activez *Add approvals*.
                        7. Vous serez défini comme valideur des dépenses. Vous pourrez changer cela pour n’importe quel administrateur une fois que vous aurez invité votre équipe.

                        [Accéder à More features](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Créer](${workspaceConfirmationLink}) un espace de travail`,
                description: 'Créez un espace de travail et configurez les paramètres avec l’aide de votre spécialiste de configuration !',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Créer un [espace de travail](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Créez un espace de travail* pour suivre les dépenses, scanner les reçus, discuter, et plus encore.

                        1. Cliquez sur *Workspaces* > *New workspace*.

                        *Votre nouvel espace de travail est prêt !* [Découvrez-le](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Configurer les [catégories](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Configurez des catégories* pour que votre équipe puisse coder les dépenses et faciliter les rapports.

                        1. Cliquez sur *Workspaces*.
                        3. Sélectionnez votre espace de travail.
                        4. Cliquez sur *Categories*.
                        5. Désactivez les catégories dont vous n’avez pas besoin.
                        6. Ajoutez vos propres catégories en haut à droite.

                        [Accéder aux paramètres des catégories de l’espace de travail](${workspaceCategoriesLink}).

                        ![Configurer des catégories](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Soumettre une note de frais',
                description: dedent(`
                    *Soumettez une dépense* en saisissant un montant ou en scannant un reçu.

                    1. Cliquez sur le bouton ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Choisissez *Créer une dépense*.
                    3. Saisissez un montant ou scannez un reçu.
                    4. Ajoutez l’e-mail ou le numéro de téléphone de votre responsable.
                    5. Cliquez sur *Créer*.

                    Et c’est terminé !
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Soumettre une note de frais',
                description: dedent(`
                    *Soumettez une note de frais* en saisissant un montant ou en scannant un reçu.

                    1. Cliquez sur le bouton ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Choisissez *Créer une dépense*.
                    3. Saisissez un montant ou scannez un reçu.
                    4. Confirmez les détails.
                    5. Cliquez sur *Créer*.

                    Et c’est terminé !
                `),
            },
            trackExpenseTask: {
                title: 'Suivre une dépense',
                description: dedent(`
                    *Suivez une dépense* dans n’importe quelle devise, que vous ayez un reçu ou non.

                    1. Cliquez sur le bouton ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Choisissez *Créer une dépense*.
                    3. Saisissez un montant ou scannez un reçu.
                    4. Choisissez votre espace *personnel*.
                    5. Cliquez sur *Créer*.

                    Et voilà ! Oui, c’est aussi simple que ça.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Connecter${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'à'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'votre' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Connectez ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'votre' : 'à'} ${integrationName} pour un codage automatique des dépenses et une synchronisation qui simplifient la clôture de fin de mois.

                        1. Cliquez sur *Workspaces*.
                        2. Sélectionnez votre espace de travail.
                        3. Cliquez sur *Accounting*.
                        4. Trouvez ${integrationName}.
                        5. Cliquez sur *Connect*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? dedent(`[Accéder à la comptabilité](${workspaceAccountingLink}).

                                      ![Se connecter à ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`)
        : `[Emmenez-moi à la comptabilité](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Connectez [vos cartes d’entreprise](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Connectez les cartes que vous avez déjà pour importer automatiquement les transactions, faire correspondre les reçus et effectuer les rapprochements.

                        1. Cliquez sur *Workspaces*.
                        2. Sélectionnez votre espace de travail.
                        3. Cliquez sur *Company cards*.
                        4. Suivez les instructions pour connecter vos cartes.

                        [Accéder aux cartes d’entreprise](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Inviter [votre équipe](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Invitez votre équipe* sur Expensify afin qu’elle puisse commencer à suivre ses dépenses dès aujourd’hui.

                        1. Cliquez sur *Espaces de travail*.
                        3. Sélectionnez votre espace de travail.
                        4. Cliquez sur *Membres* > *Inviter un membre*.
                        5. Saisissez des e-mails ou des numéros de téléphone.
                        6. Ajoutez un message d’invitation personnalisé si vous le souhaitez !

                        [Accéder aux membres de l’espace de travail](${workspaceMembersLink}).

                        ![Invitez votre équipe](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Configurer les [catégories](${workspaceCategoriesLink}) et les [tags](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Configurez des catégories et des tags* afin que votre équipe puisse coder les dépenses pour faciliter les rapports.

                        Importez-les automatiquement en [connectant votre logiciel comptable](${workspaceAccountingLink}), ou configurez-les manuellement dans vos [paramètres d’espace de travail](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Configurer les [catégories](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Utilisez des tags pour ajouter des informations supplémentaires à vos dépenses, comme des projets, des clients, des lieux et des services. Si vous avez besoin de plusieurs niveaux de tags, vous pouvez passer au plan Control.

                        1. Cliquez sur *Workspaces*.
                        3. Sélectionnez votre espace de travail.
                        4. Cliquez sur *More features*.
                        5. Activez *Tags*.
                        6. Accédez à *Tags* dans l’éditeur d’espace de travail.
                        7. Cliquez sur *+ Add tag* pour créer les vôtres.

                        [Afficher plus de fonctionnalités](${workspaceMoreFeaturesLink}).

                        ![Configurer les tags](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Invitez votre [comptable](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Invitez votre comptable* à collaborer sur votre espace de travail et à gérer les dépenses de votre entreprise.

                        1. Cliquez sur *Espaces de travail*.
                        2. Sélectionnez votre espace de travail.
                        3. Cliquez sur *Membres*.
                        4. Cliquez sur *Inviter un membre*.
                        5. Saisissez l’adresse e-mail de votre comptable.

                        [Invitez votre comptable maintenant](${workspaceMembersLink}).`),
            },
            startChatTask: {
                title: 'Démarrer une discussion',
                description: dedent(`
                    *Commencez une discussion* avec n'importe qui en utilisant son e‑mail ou son numéro de téléphone.

                    1. Cliquez sur le bouton ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Choisissez *Commencer une discussion*.
                    3. Saisissez une adresse e‑mail ou un numéro de téléphone.

                    S'ils n'utilisent pas encore Expensify, ils seront invités automatiquement.

                    Chaque discussion sera également envoyée sous forme d'e‑mail ou de SMS auquel ils pourront répondre directement.
                `),
            },
            splitExpenseTask: {
                title: 'Diviser une dépense',
                description: dedent(`
                    *Divisez des dépenses* avec une ou plusieurs personnes.

                    1. Cliquez sur le bouton ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Choisissez *Démarrer une discussion*.
                    3. Saisissez des adresses e‑mail ou des numéros de téléphone.
                    4. Cliquez sur le bouton *+* gris dans la discussion > *Diviser la dépense*.
                    5. Créez la dépense en sélectionnant *Manuel*, *Scan* ou *Distance*.

                    N’hésitez pas à ajouter plus de détails si vous le souhaitez, ou envoyez-la simplement. Récupérons votre remboursement !
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Passez en revue les [paramètres de votre espace de travail](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Voici comment consulter et mettre à jour les paramètres de votre espace de travail :
                        1. Cliquez sur Espaces de travail.
                        2. Sélectionnez votre espace de travail.
                        3. Consultez et mettez à jour vos paramètres.
                        [Accéder à votre espace de travail.](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: 'Créez votre premier rapport',
                description: dedent(`
                    Voici comment créer un rapport :

                    1. Cliquez sur le bouton ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Choisissez *Créer un rapport*.
                    3. Cliquez sur *Ajouter une dépense*.
                    4. Ajoutez votre première dépense.

                    Et c’est terminé !
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Faites un [essai](${testDriveURL})` : 'Faites un essai'),
            embeddedDemoIframeTitle: 'Essai',
            employeeFakeReceipt: {
                description: 'Mon reçu d’essai routier !',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Se faire rembourser est aussi simple qu’envoyer un message. Passons en revue les bases.',
            onboardingPersonalSpendMessage: 'Voici comment suivre vos dépenses en quelques clics.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Votre essai gratuit a commencé ! Mettons tout en place.
                        👋 Bonjour, je suis votre spécialiste de configuration Expensify. J’ai déjà créé un espace de travail pour vous aider à gérer les reçus et les dépenses de votre équipe. Pour tirer le meilleur parti de votre essai gratuit de 30 jours, il vous suffit de suivre les étapes de configuration restantes ci-dessous !
                    `)
                    : dedent(`
                        # Votre essai gratuit a commencé ! Configurons tout cela.
                        👋 Bonjour, je suis votre spécialiste de configuration Expensify. Maintenant que vous avez créé un espace de travail, profitez au maximum de votre essai gratuit de 30 jours en suivant les étapes ci-dessous !
                    `),
            onboardingTrackWorkspaceMessage:
                '# Configurons tout ça\n\n👋 Salut, je suis votre spécialiste de configuration Expensify. J’ai déjà créé un espace de travail pour vous aider à gérer vos reçus et vos dépenses. Pour profiter au maximum de votre essai gratuit de 30 jours, il vous suffit de suivre les dernières étapes de configuration ci-dessous !',
            onboardingChatSplitMessage: 'Partager des notes avec des amis est aussi simple qu’envoyer un message. Voici comment faire.',
            onboardingAdminMessage: 'Apprenez à gérer l’espace de travail de votre équipe en tant qu’administrateur et à soumettre vos propres notes de frais.',
            onboardingLookingAroundMessage:
                'Expensify est surtout connu pour la gestion des notes de frais, des voyages et des cartes d’entreprise, mais nous faisons bien plus que cela. Dites-moi ce qui vous intéresse et je vous aiderai à démarrer.',
            onboardingTestDriveReceiverMessage: '*Vous avez 3 mois gratuits ! Commencez ci-dessous.*',
        },
        workspace: {
            title: 'Restez organisé avec un espace de travail',
            subtitle: 'Débloquez des outils puissants pour simplifier la gestion de vos dépenses, le tout en un seul endroit. Avec un espace de travail, vous pouvez :',
            explanationModal: {
                descriptionOne: 'Suivre et organiser les reçus',
                descriptionTwo: 'Catégoriser et étiqueter les dépenses',
                descriptionThree: 'Créer et partager des rapports',
            },
            price: 'Essayez-le gratuitement pendant 30 jours, puis passez à la version supérieure pour seulement <strong>5 $/utilisateur/mois</strong>.',
            createWorkspace: 'Créer un espace de travail',
        },
        confirmWorkspace: {
            title: 'Confirmer l’espace de travail',
            subtitle:
                'Créez un espace de travail pour suivre les reçus, rembourser les dépenses, gérer les voyages, créer des rapports et bien plus encore — le tout à la vitesse d’une conversation.',
        },
        inviteMembers: {
            title: 'Inviter des membres',
            subtitle: 'Ajoutez votre équipe ou invitez votre comptable. Plus on est de fous, plus on rit !',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Ne plus m’afficher ceci',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Le nom ne peut pas contenir les mots Expensify ou Concierge',
            hasInvalidCharacter: 'Le nom ne peut pas contenir de virgule ou de point-virgule',
            requiredFirstName: 'Le prénom ne peut pas être vide',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Quel est votre nom légal ?',
        enterDateOfBirth: 'Quelle est votre date de naissance ?',
        enterAddress: 'Quelle est votre adresse ?',
        enterPhoneNumber: 'Quel est ton numéro de téléphone ?',
        personalDetails: 'Informations personnelles',
        privateDataMessage: 'Ces informations sont utilisées pour les voyages et les paiements. Elles ne sont jamais affichées sur votre profil public.',
        legalName: 'Nom légal',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        address: 'Adresse',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `La date doit être antérieure au ${dateString}`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `La date doit être postérieure au ${dateString}`,
            hasInvalidCharacter: 'Le nom ne peut contenir que des caractères latins',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Format de code postal incorrect${zipFormat ? `Format acceptable : ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Veuillez vous assurer que le numéro de téléphone est valide (p. ex. ${CONST.EXAMPLE_PHONE_NUMBER})`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Le lien a été renvoyé',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `J’ai envoyé un lien magique de connexion à ${login}. Veuillez vérifier votre ${loginType} pour vous connecter.`,
        resendLink: 'Renvoyer le lien',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `Pour valider ${secondaryLogin}, veuillez renvoyer le code magique depuis les paramètres de compte de ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `Si vous n’avez plus accès à ${primaryLogin}, veuillez dissocier vos comptes.`,
        unlink: 'Dissocier',
        linkSent: 'Lien envoyé !',
        successfullyUnlinkedLogin: 'Connexion secondaire dissociée avec succès !',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `Notre fournisseur de messagerie a temporairement suspendu les e-mails vers ${login} en raison de problèmes de distribution. Pour débloquer votre identifiant, veuillez suivre ces étapes :`,
        confirmThat: ({login}: ConfirmThatParams) =>
            `<strong>Confirmez que ${login} est correctement orthographié et qu’il s’agit d’une adresse e-mail réelle et délivrable.</strong> Les alias d’e-mail tels que « expenses@domain.com » doivent avoir accès à leur propre boîte de réception pour être des identifiants Expensify valides.`,
        ensureYourEmailClient: `<strong>Assurez-vous que votre client de messagerie autorise les e-mails en provenance de expensify.com.</strong> Vous pouvez trouver des instructions pour effectuer cette étape <a href="${CONST.SET_NOTIFICATION_LINK}">ici</a>, mais vous devrez peut-être demander à votre service informatique de vous aider à configurer vos paramètres de messagerie.`,
        onceTheAbove: `Une fois les étapes ci-dessus terminées, veuillez contacter <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> pour débloquer votre connexion.`,
    },
    openAppFailureModal: {
        title: 'Un problème est survenu...',
        subtitle: `Nous n’avons pas pu charger toutes vos données. Nous avons été informés et examinons actuellement le problème. Si cela persiste, veuillez contacter`,
        refreshAndTryAgain: 'Actualisez et réessayez',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Nous n’avons pas pu envoyer de SMS à ${login}, nous l’avons donc temporairement suspendu. Veuillez essayer de valider votre numéro :`,
        validationSuccess: 'Votre numéro a été validé ! Cliquez ci-dessous pour envoyer un nouveau code magique de connexion.',
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
                return 'Veuillez patienter un moment avant de réessayer.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? 'jour' : 'jours'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? 'heure' : 'heures'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? 'Minute' : 'minutes'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `Accrochez-vous ! Vous devez attendre ${timeText} avant d’essayer de valider à nouveau votre numéro.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Rejoindre',
    },
    detailsPage: {
        localTime: 'Heure locale',
    },
    newChatPage: {
        startGroup: 'Démarrer le groupe',
        addToGroup: 'Ajouter au groupe',
    },
    yearPickerPage: {
        year: 'Année',
        selectYear: 'Veuillez sélectionner une année',
    },
    focusModeUpdateModal: {
        title: 'Bienvenue dans le mode #focus !',
        prompt: ({priorityModePageUrl}: FocusModeUpdateParams) =>
            `Restez maître de la situation en n’affichant que les discussions non lues ou celles qui nécessitent votre attention. Ne vous inquiétez pas, vous pouvez modifier ce paramètre à tout moment dans les <a href="${priorityModePageUrl}">paramètres</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'La discussion que vous recherchez est introuvable.',
        getMeOutOfHere: 'Sortez-moi d’ici',
        iouReportNotFound: 'Les informations de paiement que vous recherchez sont introuvables.',
        notHere: 'Hmm… ce n’est pas là',
        pageNotFound: 'Oups, cette page est introuvable',
        noAccess: 'Cette discussion ou cette dépense a peut‑être été supprimée ou vous n’y avez pas accès.\n\nPour toute question, veuillez contacter concierge@expensify.com',
        goBackHome: 'Retourner à la page d’accueil',
        commentYouLookingForCannotBeFound: 'Le commentaire que vous recherchez est introuvable.',
        goToChatInstead: 'Allez plutôt dans le chat.',
        contactConcierge: 'Pour toute question, veuillez contacter concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Oups… ${isBreakLine ? '\n' : ''}Une erreur s’est produite`,
        subtitle: 'Votre demande n’a pas pu être effectuée. Veuillez réessayer plus tard.',
        wrongTypeSubtitle: 'Cette recherche n’est pas valide. Essayez de modifier vos critères de recherche.',
    },
    setPasswordPage: {
        enterPassword: 'Saisissez un mot de passe',
        setPassword: 'Définir le mot de passe',
        newPasswordPrompt: 'Votre mot de passe doit contenir au moins 8 caractères, 1 lettre majuscule, 1 lettre minuscule et 1 chiffre.',
        passwordFormTitle: 'Bon retour sur le nouveau Expensify ! Veuillez définir votre mot de passe.',
        passwordNotSet: 'Nous n’avons pas pu définir votre nouveau mot de passe. Nous vous avons envoyé un nouveau lien de mot de passe pour réessayer.',
        setPasswordLinkInvalid: 'Ce lien de définition de mot de passe est invalide ou a expiré. Un nouveau vous attend dans votre boîte de réception !',
        validateAccount: 'Vérifier le compte',
    },
    statusPage: {
        status: 'Statut',
        statusExplanation: 'Ajoutez un émoji pour permettre à vos collègues et amis de savoir facilement ce qui se passe. Vous pouvez aussi ajouter un message si vous le souhaitez !',
        today: 'Aujourd’hui',
        clearStatus: 'Effacer le statut',
        save: 'Enregistrer',
        message: 'Message',
        timePeriods: {
            never: 'Jamais',
            thirtyMinutes: '30 minutes',
            oneHour: '1 heure',
            afterToday: 'Aujourd’hui',
            afterWeek: 'Une semaine',
            custom: 'Personnalisé',
        },
        untilTomorrow: 'Jusqu’à demain',
        untilTime: ({time}: UntilTimeParams) => `Jusqu’à ${time}`,
        date: 'Date',
        time: 'Heure',
        clearAfter: 'Effacer après',
        whenClearStatus: 'Quand devons-nous effacer votre statut ?',
        vacationDelegate: 'Délégué de vacances',
        setVacationDelegate: `Définissez un délégué de vacances pour approuver les rapports en votre nom pendant votre absence du bureau.`,
        vacationDelegateError: 'Une erreur s’est produite lors de la mise à jour de votre délégué de vacances.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `en tant que délégué de vacances de ${nameOrEmail}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) =>
            `à ${submittedToName} en tant que remplaçant de vacances pour ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Vous êtes sur le point de désigner ${nameOrEmail} comme votre délégataire de vacances. Cette personne n’est pas encore présente sur tous vos espaces de travail. Si vous choisissez de continuer, un e-mail sera envoyé à tous les administrateurs de vos espaces de travail pour qu’ils l’ajoutent.`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `Étape ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Infos bancaires',
        confirmBankInfo: 'Confirmer les informations bancaires',
        manuallyAdd: 'Ajouter manuellement votre compte bancaire',
        letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
        accountEnding: 'Compte se terminant par',
        thisBankAccount: 'Ce compte bancaire sera utilisé pour les paiements professionnels sur votre espace de travail',
        accountNumber: 'Numéro de compte',
        routingNumber: 'Numéro d’acheminement',
        chooseAnAccountBelow: 'Choisissez un compte ci-dessous',
        addBankAccount: 'Ajouter un compte bancaire',
        chooseAnAccount: 'Choisir un compte',
        connectOnlineWithPlaid: 'Connectez-vous à votre banque',
        connectManually: 'Connexion manuelle',
        desktopConnection: 'Remarque : pour vous connecter à Chase, Wells Fargo, Capital One ou Bank of America, veuillez cliquer ici pour terminer ce processus dans un navigateur.',
        yourDataIsSecure: 'Vos données sont sécurisées',
        toGetStarted:
            'Ajoutez un compte bancaire pour rembourser les dépenses, émettre des cartes Expensify, encaisser les paiements de factures et payer les factures, le tout à partir d’un seul endroit.',
        plaidBodyCopy: 'Offrez à vos employés un moyen plus simple de payer – et d’être remboursés – pour les dépenses de l’entreprise.',
        checkHelpLine: 'Votre numéro de routage et votre numéro de compte se trouvent sur un chèque associé à ce compte.',
        hasPhoneLoginError: ({contactMethodRoute}: ContactMethodParams) =>
            `Pour connecter un compte bancaire, veuillez <a href="${contactMethodRoute}">ajouter une adresse e-mail comme identifiant principal</a> puis réessayer. Vous pouvez ajouter votre numéro de téléphone comme identifiant secondaire.`,
        hasBeenThrottledError: 'Une erreur s’est produite lors de l’ajout de votre compte bancaire. Veuillez patienter quelques minutes, puis réessayer.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Oups ! Il semble que la devise de votre espace de travail soit différente du USD. Pour continuer, veuillez accéder aux <a href="${workspaceRoute}">paramètres de votre espace de travail</a> pour la définir sur USD, puis réessayez.`,
        bbaAdded: 'Compte bancaire professionnel ajouté !',
        bbaAddedDescription: 'Elle est prête à être utilisée pour les paiements.',
        error: {
            youNeedToSelectAnOption: 'Veuillez sélectionner une option pour continuer',
            noBankAccountAvailable: 'Désolé, aucun compte bancaire n’est disponible',
            noBankAccountSelected: 'Veuillez choisir un compte',
            taxID: 'Veuillez saisir un numéro d’identification fiscale valide',
            website: 'Veuillez saisir un site web valide',
            zipCode: `Veuillez saisir un code postal valide en utilisant le format : ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Veuillez saisir un numéro de téléphone valide',
            email: 'Veuillez saisir une adresse e-mail valide',
            companyName: 'Veuillez saisir un nom d’entreprise valide',
            addressCity: 'Veuillez saisir une ville valide',
            addressStreet: 'Veuillez saisir une adresse postale valide',
            addressState: 'Veuillez sélectionner un état valide',
            incorporationDateFuture: 'La date de constitution ne peut pas être dans le futur',
            incorporationState: 'Veuillez sélectionner un état valide',
            industryCode: 'Veuillez saisir un code de classification de secteur valide à six chiffres',
            restrictedBusiness: 'Veuillez confirmer que l’entreprise ne figure pas sur la liste des entreprises restreintes.',
            routingNumber: 'Veuillez saisir un numéro d’acheminement valide',
            accountNumber: 'Veuillez saisir un numéro de compte valide',
            routingAndAccountNumberCannotBeSame: 'Les numéros de routage et de compte ne peuvent pas être identiques',
            companyType: 'Veuillez sélectionner un type d’entreprise valide',
            tooManyAttempts:
                'En raison d’un nombre élevé de tentatives de connexion, cette option a été désactivée pendant 24 heures. Veuillez réessayer plus tard ou saisir les informations manuellement à la place.',
            address: 'Veuillez saisir une adresse valide',
            dob: 'Veuillez sélectionner une date de naissance valide',
            age: 'Doit être âgé de plus de 18 ans',
            ssnLast4: 'Veuillez saisir les 4 derniers chiffres valides du SSN',
            firstName: 'Veuillez saisir un prénom valide',
            lastName: 'Veuillez saisir un nom de famille valide',
            noDefaultDepositAccountOrDebitCardAvailable: 'Veuillez ajouter un compte de dépôt par défaut ou une carte de débit',
            validationAmounts: 'Les montants de validation que vous avez saisis sont incorrects. Veuillez vérifier à nouveau votre relevé bancaire et réessayer.',
            fullName: 'Veuillez entrer un nom complet valide',
            ownershipPercentage: 'Veuillez entrer un pourcentage valide',
            deletePaymentBankAccount:
                'Ce compte bancaire ne peut pas être supprimé, car il est utilisé pour les paiements par carte Expensify. Si vous souhaitez tout de même supprimer ce compte, veuillez contacter Concierge.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Où se trouve votre compte bancaire ?',
        accountDetailsStepHeader: 'Quelles sont les informations de votre compte ?',
        accountTypeStepHeader: 'Quel type de compte est-ce ?',
        bankInformationStepHeader: 'Quelles sont vos coordonnées bancaires ?',
        accountHolderInformationStepHeader: 'Quelles sont les informations du titulaire du compte ?',
        howDoWeProtectYourData: 'Comment protégeons-nous vos données ?',
        currencyHeader: 'Quelle est la devise de votre compte bancaire ?',
        confirmationStepHeader: 'Vérifiez vos informations.',
        confirmationStepSubHeader: 'Vérifiez attentivement les détails ci-dessous, puis cochez la case des conditions pour confirmer.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Saisir le mot de passe Expensify',
        alreadyAdded: 'Ce compte a déjà été ajouté.',
        chooseAccountLabel: 'Compte',
        successTitle: 'Compte bancaire personnel ajouté !',
        successMessage: 'Félicitations, votre compte bancaire est configuré et prêt à recevoir des remboursements.',
    },
    attachmentView: {
        unknownFilename: 'Nom de fichier inconnu',
        passwordRequired: 'Veuillez saisir un mot de passe',
        passwordIncorrect: 'Mot de passe incorrect. Veuillez réessayer.',
        failedToLoadPDF: 'Échec du chargement du fichier PDF',
        pdfPasswordForm: {
            title: 'PDF protégé par mot de passe',
            infoText: 'Ce PDF est protégé par un mot de passe.',
            beforeLinkText: 'Veuillez',
            linkText: 'saisissez le mot de passe',
            afterLinkText: 'pour l’afficher.',
            formLabel: 'Afficher le PDF',
        },
        attachmentNotFound: 'Pièce jointe introuvable',
        retry: 'Réessayer',
    },
    messages: {
        errorMessageInvalidPhone: `Veuillez saisir un numéro de téléphone valide sans parenthèses ni tirets. Si vous êtes en dehors des États-Unis, veuillez inclure votre indicatif de pays (p. ex. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Adresse e-mail invalide',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} est déjà membre de ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'En poursuivant la demande d’activation de votre Portefeuille Expensify, vous confirmez que vous avez lu, compris et accepté',
        facialScan: 'Politique et autorisation de reconnaissance faciale d’Onfido',
        tryAgain: 'Réessayer',
        verifyIdentity: 'Vérifier l’identité',
        letsVerifyIdentity: 'Vérifions votre identité',
        butFirst: `Mais d’abord, le côté ennuyeux. Lisez le jargon juridique à l’étape suivante, puis cliquez sur « Accepter » quand vous êtes prêt.`,
        genericError: 'Une erreur s’est produite lors du traitement de cette étape. Veuillez réessayer.',
        cameraPermissionsNotGranted: 'Activer l’accès à la caméra',
        cameraRequestMessage: 'Nous avons besoin d’accéder à votre appareil photo pour terminer la vérification du compte bancaire. Veuillez l’activer via Réglages > New Expensify.',
        microphonePermissionsNotGranted: 'Activer l’accès au microphone',
        microphoneRequestMessage: 'Nous avons besoin d’accéder à votre microphone pour terminer la vérification du compte bancaire. Veuillez l’activer via Réglages > New Expensify.',
        originalDocumentNeeded: 'Veuillez téléverser une image originale de votre pièce d’identité plutôt qu’une capture d’écran ou une image numérisée.',
        documentNeedsBetterQuality:
            'Votre pièce d’identité semble être endommagée ou présenter des éléments de sécurité manquants. Veuillez téléverser une image originale d’une pièce d’identité intacte et entièrement visible.',
        imageNeedsBetterQuality:
            'La qualité de l’image de votre pièce d’identité pose problème. Veuillez téléverser une nouvelle image où l’ensemble de votre pièce d’identité est clairement visible.',
        selfieIssue: 'Il y a un problème avec votre selfie/vidéo. Veuillez téléverser un selfie/une vidéo en direct.',
        selfieNotMatching: 'Votre selfie/vidéo ne correspond pas à votre pièce d’identité. Veuillez téléverser un nouveau selfie/une nouvelle vidéo où votre visage est clairement visible.',
        selfieNotLive: 'Votre selfie/vidéo ne semble pas être une photo/vidéo en direct. Veuillez téléverser un selfie/une vidéo en direct.',
    },
    additionalDetailsStep: {
        headerTitle: 'Détails supplémentaires',
        helpText: 'Nous devons confirmer les informations suivantes avant que vous puissiez envoyer et recevoir de l’argent depuis votre portefeuille.',
        helpTextIdologyQuestions: 'Nous devons encore vous poser quelques questions pour terminer la validation de votre identité.',
        helpLink: 'En savoir plus sur les raisons pour lesquelles nous en avons besoin.',
        legalFirstNameLabel: 'Prénom légal',
        legalMiddleNameLabel: 'Deuxième prénom légal',
        legalLastNameLabel: 'Nom de famille légal',
        selectAnswer: 'Veuillez sélectionner une réponse pour continuer',
        ssnFull9Error: 'Veuillez saisir un numéro de SSN valide à neuf chiffres',
        needSSNFull9: 'Nous rencontrons des difficultés pour vérifier votre SSN. Veuillez saisir les neuf chiffres complets de votre SSN.',
        weCouldNotVerify: 'Nous n’avons pas pu vérifier',
        pleaseFixIt: 'Veuillez corriger ces informations avant de continuer',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Nous n’avons pas pu vérifier votre identité. Veuillez réessayer plus tard ou contacter <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> si vous avez des questions.`,
    },
    termsStep: {
        headerTitle: 'Conditions et frais',
        headerTitleRefactor: 'Frais et conditions',
        haveReadAndAgreePlain: 'J’ai lu et j’accepte de recevoir les informations légales par voie électronique.',
        haveReadAndAgree: `J’ai lu et j’accepte de recevoir les <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">communications électroniques</a>.`,
        agreeToThePlain: 'J’accepte la politique de confidentialité et l’accord de portefeuille.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `J’accepte la <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">confidentialité</a> et le <a href="${walletAgreementUrl}">contrat de Portefeuille</a>.`,
        enablePayments: 'Activer les paiements',
        monthlyFee: 'Frais mensuels',
        inactivity: 'Inactivité',
        noOverdraftOrCredit: 'Aucune fonctionnalité de découvert/crédit.',
        electronicFundsWithdrawal: 'Prélèvement électronique de fonds',
        standard: 'Standard',
        reviewTheFees: 'Jetez un œil à certains frais.',
        checkTheBoxes: 'Veuillez cocher les cases ci-dessous.',
        agreeToTerms: 'Acceptez les conditions et vous serez prêt à commencer !',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Le portefeuille Expensify est émis par ${walletProgram}.`,
            perPurchase: 'Par achat',
            atmWithdrawal: 'Retrait au distributeur automatique',
            cashReload: 'Rechargement en espèces',
            inNetwork: 'dans le réseau',
            outOfNetwork: 'hors réseau',
            atmBalanceInquiry: 'Consultation du solde au DAB (dans ou hors réseau)',
            customerService: 'Service client (automatisé ou agent en direct)',
            inactivityAfterTwelveMonths: 'Inactivité (après 12 mois sans transactions)',
            weChargeOneFee: 'Nous facturons un autre type de frais. Il s’agit :',
            fdicInsurance: 'Vos fonds sont éligibles à l’assurance FDIC.',
            generalInfo: `Pour des informations générales sur les comptes prépayés, visitez <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Pour plus de détails et les conditions concernant tous les frais et services, rendez-vous sur <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> ou appelez le +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Retrait de fonds électronique (instantané)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min. ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Une liste de tous les frais du Portefeuille Expensify',
            typeOfFeeHeader: 'Tous les frais',
            feeAmountHeader: 'Montant',
            moreDetailsHeader: 'Détails',
            openingAccountTitle: 'Ouverture d’un compte',
            openingAccountDetails: 'Il n’y a pas de frais pour ouvrir un compte.',
            monthlyFeeDetails: 'Il n’y a pas de frais mensuels.',
            customerServiceTitle: 'Service client',
            customerServiceDetails: 'Il n’y a aucuns frais de service client.',
            inactivityDetails: 'Il n’y a pas de frais d’inactivité.',
            sendingFundsTitle: 'Envoi de fonds à un autre titulaire de compte',
            sendingFundsDetails: 'Aucun frais n’est facturé pour envoyer des fonds à un autre titulaire de compte en utilisant votre solde, votre compte bancaire ou votre carte de débit.',
            electronicFundsStandardDetails:
                'Il n’y a aucuns frais pour transférer des fonds de votre Portefeuille Expensify vers votre compte bancaire en utilisant l’option standard. Ce virement est généralement effectué sous 1 à 3 jours ouvrables.',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                'Des frais s’appliquent pour transférer des fonds de votre portefeuille Expensify vers votre carte de débit liée en utilisant l’option de transfert instantané. Ce transfert est généralement traité en quelques minutes.' +
                `Les frais s’élèvent à ${percentage} % du montant du virement (avec des frais minimum de ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Vos fonds sont éligibles à l’assurance FDIC. Vos fonds seront détenus auprès de ou transférés à ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, une institution assurée par la FDIC.` +
                `Une fois là-bas, vos fonds sont assurés jusqu’à ${amount} par la FDIC au cas où ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} ferait défaut, si des conditions spécifiques d’assurance des dépôts sont remplies et si votre carte est enregistrée. Consultez ${CONST.TERMS.FDIC_PREPAID} pour plus de détails.`,
            contactExpensifyPayments: `Contactez ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} en appelant le +1 833-400-0904, par e-mail à ${CONST.EMAIL.CONCIERGE} ou connectez-vous sur ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Pour obtenir des informations générales sur les comptes prépayés, consultez ${CONST.TERMS.CFPB_PREPAID}. Si vous avez une réclamation concernant un compte prépayé, appelez le Consumer Financial Protection Bureau au 1-855-411-2372 ou consultez ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Voir la version imprimable',
            automated: 'Automatisé',
            liveAgent: 'Agent en direct',
            instant: 'Instantané',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Min. ${amount}`,
        },
    },
    activateStep: {
        headerTitle: 'Activer les paiements',
        activatedTitle: 'Portefeuille activé !',
        activatedMessage: 'Félicitations, votre portefeuille est configuré et prêt à effectuer des paiements.',
        checkBackLaterTitle: 'Juste une minute...',
        checkBackLaterMessage: 'Nous examinons toujours vos informations. Veuillez revenir plus tard.',
        continueToPayment: 'Continuer vers le paiement',
        continueToTransfer: 'Continuer le virement',
    },
    companyStep: {
        headerTitle: 'Informations sur l’entreprise',
        subtitle: 'Presque terminé ! Pour des raisons de sécurité, nous devons confirmer certaines informations :',
        legalBusinessName: 'Raison sociale légale',
        companyWebsite: 'Site web de l’entreprise',
        taxIDNumber: 'Numéro d’identification fiscale',
        taxIDNumberPlaceholder: '9 chiffres',
        companyType: 'Type d’entreprise',
        incorporationDate: 'Date d’incorporation',
        incorporationState: 'État d’incorporation',
        industryClassificationCode: 'Code de classification sectorielle',
        confirmCompanyIsNot: 'Je confirme que cette entreprise ne figure pas sur la',
        listOfRestrictedBusinesses: 'liste d’entreprises restreintes',
        incorporationDatePlaceholder: 'Date de début (aaaa-mm-jj)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Société',
            PARTNERSHIP: 'Partenariat',
            COOPERATIVE: 'Coopérative',
            SOLE_PROPRIETORSHIP: 'Entreprise individuelle',
            OTHER: 'Autre',
        },
        industryClassification: 'Dans quel secteur d’activité l’entreprise est-elle classée ?',
        industryClassificationCodePlaceholder: 'Rechercher un code de classification sectorielle',
    },
    requestorStep: {
        headerTitle: 'Informations personnelles',
        learnMore: 'En savoir plus',
        isMyDataSafe: 'Mes données sont-elles en sécurité ?',
    },
    personalInfoStep: {
        personalInfo: 'Informations personnelles',
        enterYourLegalFirstAndLast: 'Quel est votre nom légal ?',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        legalName: 'Nom légal',
        enterYourDateOfBirth: 'Quelle est votre date de naissance ?',
        enterTheLast4: 'Quels sont les quatre derniers chiffres de votre numéro de sécurité sociale ?',
        dontWorry: 'Ne vous inquiétez pas, nous ne faisons aucun contrôle de crédit personnel !',
        last4SSN: '4 derniers chiffres du SSN',
        enterYourAddress: 'Quelle est votre adresse ?',
        address: 'Adresse',
        letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
        byAddingThisBankAccount: 'En ajoutant ce compte bancaire, vous confirmez que vous avez lu, compris et accepté',
        whatsYourLegalName: 'Quel est votre nom légal ?',
        whatsYourDOB: 'Quelle est votre date de naissance ?',
        whatsYourAddress: 'Quelle est votre adresse ?',
        whatsYourSSN: 'Quels sont les quatre derniers chiffres de votre numéro de sécurité sociale ?',
        noPersonalChecks: 'Ne vous inquiétez pas, aucun contrôle de crédit personnel ici !',
        whatsYourPhoneNumber: 'Quel est votre numéro de téléphone ?',
        weNeedThisToVerify: 'Nous avons besoin de cela pour vérifier votre portefeuille.',
    },
    businessInfoStep: {
        businessInfo: 'Infos sur l’entreprise',
        enterTheNameOfYourBusiness: 'Quel est le nom de votre société ?',
        businessName: 'Raison sociale de l’entreprise',
        enterYourCompanyTaxIdNumber: 'Quel est le numéro d’identification fiscale de votre entreprise ?',
        taxIDNumber: 'Numéro d’identification fiscale',
        taxIDNumberPlaceholder: '9 chiffres',
        enterYourCompanyWebsite: 'Quel est le site web de votre entreprise ?',
        companyWebsite: 'Site web de l’entreprise',
        enterYourCompanyPhoneNumber: 'Quel est le numéro de téléphone de votre entreprise ?',
        enterYourCompanyAddress: 'Quelle est l’adresse de votre entreprise ?',
        selectYourCompanyType: 'De quel type d’entreprise s’agit-il ?',
        companyType: 'Type d’entreprise',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Société',
            PARTNERSHIP: 'Partenariat',
            COOPERATIVE: 'Coopérative',
            SOLE_PROPRIETORSHIP: 'Entreprise individuelle',
            OTHER: 'Autre',
        },
        selectYourCompanyIncorporationDate: 'Quelle est la date de constitution de votre société ?',
        incorporationDate: 'Date d’incorporation',
        incorporationDatePlaceholder: 'Date de début (aaaa-mm-jj)',
        incorporationState: 'État d’incorporation',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'Dans quel État votre entreprise a-t‑elle été constituée ?',
        letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
        companyAddress: 'Adresse de l’entreprise',
        listOfRestrictedBusinesses: 'liste d’entreprises restreintes',
        confirmCompanyIsNot: 'Je confirme que cette entreprise ne figure pas sur la',
        businessInfoTitle: 'Informations professionnelles',
        legalBusinessName: 'Raison sociale légale',
        whatsTheBusinessName: 'Quel est le nom de l’entreprise ?',
        whatsTheBusinessAddress: 'Quelle est l’adresse professionnelle ?',
        whatsTheBusinessContactInformation: 'Quelles sont les coordonnées professionnelles ?',
        whatsTheBusinessRegistrationNumber: ({country}: BusinessRegistrationNumberParams) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Quel est le numéro d’immatriculation de l’entreprise (CRN) ?';
                default:
                    return 'Quel est le numéro d’immatriculation de l’entreprise ?';
            }
        },
        whatsTheBusinessTaxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Quel est le numéro d’identification de l’employeur (EIN) ?';
                case CONST.COUNTRY.CA:
                    return 'Quel est le numéro d’entreprise (BN) ?';
                case CONST.COUNTRY.GB:
                    return 'Quel est le numéro d’immatriculation à la TVA (VRN) ?';
                case CONST.COUNTRY.AU:
                    return 'Quel est le numéro d’entreprise australien (ABN) ?';
                default:
                    return 'Quel est le numéro de TVA UE ?';
            }
        },
        whatsThisNumber: 'C’est quoi ce numéro ?',
        whereWasTheBusinessIncorporated: 'Où l’entreprise a-t-elle été constituée ?',
        whatTypeOfBusinessIsIt: 'Quel type d’entreprise est-ce ?',
        whatsTheBusinessAnnualPayment: 'Quel est le volume annuel de paiements de l’entreprise ?',
        whatsYourExpectedAverageReimbursements: 'Quel est votre montant moyen de remboursement attendu ?',
        registrationNumber: 'Numéro d’immatriculation',
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
                    return 'TVA UE';
            }
        },
        businessAddress: 'Adresse professionnelle',
        businessType: 'Type d’entreprise',
        incorporation: 'Constitution d’entreprise',
        incorporationCountry: 'Pays d’incorporation',
        incorporationTypeName: 'Type de constitution',
        businessCategory: 'Catégorie professionnelle',
        annualPaymentVolume: 'Volume annuel de paiements',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Volume annuel de paiements en ${currencyCode}`,
        averageReimbursementAmount: 'Montant moyen du remboursement',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Montant moyen du remboursement en ${currencyCode}`,
        selectIncorporationType: 'Sélectionner le type de constitution',
        selectBusinessCategory: 'Sélectionner une catégorie d’entreprise',
        selectAnnualPaymentVolume: 'Sélectionner le volume de paiement annuel',
        selectIncorporationCountry: 'Sélectionner le pays d’incorporation',
        selectIncorporationState: 'Sélectionner l’État de constitution',
        selectAverageReimbursement: 'Sélectionner le montant moyen du remboursement',
        selectBusinessType: 'Sélectionner le type d’entreprise',
        findIncorporationType: 'Trouver le type d’incorporation',
        findBusinessCategory: 'Trouver une catégorie professionnelle',
        findAnnualPaymentVolume: 'Trouver le volume annuel des paiements',
        findIncorporationState: 'Trouver l’État d’incorporation',
        findAverageReimbursement: 'Trouver le montant moyen du remboursement',
        findBusinessType: 'Trouver le type d’entreprise',
        error: {
            registrationNumber: 'Veuillez fournir un numéro d’immatriculation valide',
            taxIDEIN: ({country}: BusinessTaxIDParams) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return "Veuillez fournir un numéro d'identification d'employeur (EIN) valide";
                    case CONST.COUNTRY.CA:
                        return 'Veuillez saisir un Numéro d’entreprise (BN) valide';
                    case CONST.COUNTRY.GB:
                        return 'Veuillez saisir un numéro de TVA intracommunautaire (VRN) valide';
                    case CONST.COUNTRY.AU:
                        return 'Veuillez fournir un Australian Business Number (ABN) valide';
                    default:
                        return 'Veuillez fournir un numéro de TVA intracommunautaire valide';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: ({companyName}: CompanyNameParams) => `Possédez-vous 25 % ou plus de ${companyName} ?`,
        doAnyIndividualOwn25percent: ({companyName}: CompanyNameParams) => `Des personnes détiennent-elles 25 % ou plus de ${companyName} ?`,
        areThereMoreIndividualsWhoOwn25percent: ({companyName}: CompanyNameParams) => `Y a‑t‑il d’autres personnes qui détiennent 25 % ou plus de ${companyName} ?`,
        regulationRequiresUsToVerifyTheIdentity: 'La réglementation nous oblige à vérifier l’identité de toute personne détenant plus de 25 % de l’entreprise.',
        companyOwner: 'Propriétaire d’entreprise',
        enterLegalFirstAndLastName: 'Quel est le nom légal du propriétaire ?',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        enterTheDateOfBirthOfTheOwner: 'Quelle est la date de naissance du propriétaire ?',
        enterTheLast4: 'Quels sont les 4 derniers chiffres du numéro de Sécurité sociale du propriétaire ?',
        last4SSN: '4 derniers chiffres du SSN',
        dontWorry: 'Ne vous inquiétez pas, nous ne faisons aucun contrôle de crédit personnel !',
        enterTheOwnersAddress: 'Quelle est l’adresse du propriétaire ?',
        letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
        legalName: 'Nom légal',
        address: 'Adresse',
        byAddingThisBankAccount: 'En ajoutant ce compte bancaire, vous confirmez que vous avez lu, compris et accepté',
        owners: 'Propriétaires',
    },
    ownershipInfoStep: {
        ownerInfo: 'Infos sur le propriétaire',
        businessOwner: 'Propriétaire d’entreprise',
        signerInfo: 'Infos sur le signataire',
        doYouOwn: ({companyName}: CompanyNameParams) => `Possédez-vous 25 % ou plus de ${companyName} ?`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Des personnes détiennent-elles 25 % ou plus de ${companyName} ?`,
        regulationsRequire: 'La réglementation nous oblige à vérifier l’identité de toute personne qui détient plus de 25 % de l’entreprise.',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        whatsTheOwnersName: 'Quel est le nom légal du propriétaire ?',
        whatsYourName: 'Quel est votre nom légal ?',
        whatPercentage: 'Quel pourcentage de l’entreprise appartient au propriétaire ?',
        whatsYoursPercentage: 'Quel pourcentage de l’entreprise possédez-vous ?',
        ownership: 'Propriété',
        whatsTheOwnersDOB: 'Quelle est la date de naissance du propriétaire ?',
        whatsYourDOB: 'Quelle est votre date de naissance ?',
        whatsTheOwnersAddress: 'Quelle est l’adresse du propriétaire ?',
        whatsYourAddress: 'Quelle est votre adresse ?',
        whatAreTheLast: 'Quels sont les 4 derniers chiffres du numéro de sécurité sociale du propriétaire ?',
        whatsYourLast: 'Quels sont les 4 derniers chiffres de votre numéro de sécurité sociale ?',
        whatsYourNationality: 'Quel est votre pays de citoyenneté ?',
        whatsTheOwnersNationality: 'Quel est le pays de citoyenneté du propriétaire ?',
        countryOfCitizenship: 'Pays de citoyenneté',
        dontWorry: 'Ne vous inquiétez pas, nous ne faisons aucun contrôle de crédit personnel !',
        last4: '4 derniers chiffres du SSN',
        whyDoWeAsk: 'Pourquoi demandons-nous cela ?',
        letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
        legalName: 'Nom légal',
        ownershipPercentage: 'Pourcentage de propriété',
        areThereOther: ({companyName}: CompanyNameParams) => `Y a-t-il d’autres personnes qui détiennent 25 % ou plus de ${companyName} ?`,
        owners: 'Propriétaires',
        addCertified: 'Ajouter un organigramme certifié indiquant les bénéficiaires effectifs',
        regulationRequiresChart:
            'La réglementation nous oblige à recueillir une copie certifiée de l’organigramme de propriété indiquant chaque personne ou entité qui détient 25 % ou plus de l’entreprise.',
        uploadEntity: 'Téléverser le diagramme de propriété de l’entité',
        noteEntity: 'Remarque : Le tableau de structure de propriété de l’entité doit être signé par votre comptable, votre conseiller juridique ou être notarié.',
        certified: 'Organigramme certifié de propriété de l’entité',
        selectCountry: 'Sélectionner un pays',
        findCountry: 'Trouver le pays',
        address: 'Adresse',
        chooseFile: 'Choisir un fichier',
        uploadDocuments: 'Téléverser des documents supplémentaires',
        pleaseUpload:
            'Veuillez téléverser ci-dessous des documents supplémentaires pour nous aider à vérifier votre identité en tant que propriétaire direct ou indirect de 25 % ou plus de l’entité commerciale.',
        acceptedFiles: 'Formats de fichiers acceptés : PDF, PNG, JPEG. La taille totale des fichiers pour chaque section ne peut pas dépasser 5 Mo.',
        proofOfBeneficialOwner: 'Preuve du bénéficiaire effectif',
        proofOfBeneficialOwnerDescription:
            'Veuillez fournir une attestation signée et un organigramme émis par un comptable public, un notaire ou un avocat, confirmant la détention de 25 % ou plus de l’entreprise. Le document doit être daté de moins de trois mois et inclure le numéro de licence du signataire.',
        copyOfID: 'Copie de la pièce d’identité du bénéficiaire effectif',
        copyOfIDDescription: 'Exemples : passeport, permis de conduire, etc.',
        proofOfAddress: 'Justificatif de domicile pour le bénéficiaire effectif',
        proofOfAddressDescription: 'Exemples : facture de services publics, contrat de location, etc.',
        codiceFiscale: 'Code fiscal/ID fiscal',
        codiceFiscaleDescription:
            'Veuillez téléverser une vidéo d’une visite de site ou d’un appel enregistré avec le signataire autorisé. Le signataire doit fournir : nom complet, date de naissance, nom de l’entreprise, numéro d’enregistrement, numéro de code fiscal, adresse enregistrée, nature de l’activité et objet du compte.',
    },
    completeVerificationStep: {
        completeVerification: 'Terminer la vérification',
        confirmAgreements: 'Veuillez confirmer les accords ci-dessous.',
        certifyTrueAndAccurate: 'Je certifie que les informations fournies sont exactes et véridiques',
        certifyTrueAndAccurateError: 'Veuillez certifier que les informations sont vraies et exactes',
        isAuthorizedToUseBankAccount: 'Je suis autorisé à utiliser ce compte bancaire professionnel pour des dépenses professionnelles',
        isAuthorizedToUseBankAccountError: 'Vous devez être un responsable habilité, autorisé à gérer le compte bancaire de l’entreprise',
        termsAndConditions: 'conditions générales',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Validez votre compte bancaire',
        validateButtonText: 'Valider',
        validationInputLabel: 'Transaction',
        maxAttemptsReached: 'La validation de ce compte bancaire a été désactivée en raison d’un trop grand nombre de tentatives incorrectes.',
        description: `Sous 1 à 2 jours ouvrés, nous enverrons trois (3) petites transactions sur votre compte bancaire depuis un nom tel que « Expensify, Inc. Validation ».`,
        descriptionCTA: 'Veuillez saisir le montant de chaque transaction dans les champs ci-dessous. Exemple : 1,51.',
        letsChatText: 'On y est presque ! Nous avons besoin de votre aide pour vérifier quelques dernières informations par chat. Prêt(e) ?',
        enable2FATitle: 'Prévenez la fraude, activez l’authentification à deux facteurs (2FA)',
        enable2FAText:
            'Nous prenons votre sécurité au sérieux. Veuillez configurer l’authentification à deux facteurs maintenant afin d’ajouter une couche de protection supplémentaire à votre compte.',
        secureYourAccount: 'Sécurisez votre compte',
    },
    countryStep: {
        confirmBusinessBank: 'Confirmer la devise et le pays du compte bancaire professionnel',
        confirmCurrency: 'Confirmer la devise et le pays',
        yourBusiness: 'La devise de votre compte bancaire professionnel doit correspondre à la devise de votre espace de travail.',
        youCanChange: 'Vous pouvez modifier la devise de votre espace de travail dans vos',
        findCountry: 'Trouver le pays',
        selectCountry: 'Sélectionner un pays',
    },
    bankInfoStep: {
        whatAreYour: 'Quelles sont les coordonnées de votre compte bancaire professionnel ?',
        letsDoubleCheck: 'Vérifions une nouvelle fois que tout semble correct.',
        thisBankAccount: 'Ce compte bancaire sera utilisé pour les paiements professionnels sur votre espace de travail',
        accountNumber: 'Numéro de compte',
        accountHolderNameDescription: 'Nom complet du signataire autorisé',
    },
    signerInfoStep: {
        signerInfo: 'Infos sur le signataire',
        areYouDirector: ({companyName}: CompanyNameParams) => `Êtes-vous directeur chez ${companyName} ?`,
        regulationRequiresUs: 'La réglementation nous impose de vérifier si le signataire est habilité à effectuer cette action au nom de l’entreprise.',
        whatsYourName: 'Quel est votre nom légal',
        fullName: 'Nom légal complet',
        whatsYourJobTitle: 'Quel est votre intitulé de poste ?',
        jobTitle: 'Intitulé du poste',
        whatsYourDOB: 'Quelle est votre date de naissance ?',
        uploadID: 'Télécharger une pièce d’identité et un justificatif de domicile',
        personalAddress: 'Justificatif de domicile personnel (p. ex. facture de services publics)',
        letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
        legalName: 'Nom légal',
        proofOf: 'Justificatif de domicile personnel',
        enterOneEmail: ({companyName}: CompanyNameParams) => `Saisissez l’adresse e-mail d’un directeur de ${companyName}`,
        regulationRequiresOneMoreDirector: 'La réglementation exige au moins un autre administrateur en tant que signataire.',
        hangTight: 'Patientez un instant...',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `Saisissez les adresses e-mail de deux directeurs de ${companyName}`,
        sendReminder: 'Envoyer un rappel',
        chooseFile: 'Choisir un fichier',
        weAreWaiting: 'Nous attendons que d’autres personnes vérifient leur identité en tant que directeurs de l’entreprise.',
        id: 'Copie de la pièce d’identité',
        proofOfDirectors: 'Preuve du ou des directeur(s)',
        proofOfDirectorsDescription: 'Exemples : profil d’entreprise Oncorp ou immatriculation d’entreprise.',
        codiceFiscale: 'Code fiscal',
        codiceFiscaleDescription: 'Codice Fiscale pour les signataires, utilisateurs autorisés et bénéficiaires effectifs.',
        PDSandFSG: 'Documents de divulgation PDS + FSG',
        PDSandFSGDescription: dedent(`
            Notre partenariat avec Corpay utilise une connexion API afin de tirer parti de leur vaste réseau de partenaires bancaires internationaux pour alimenter les Remboursements internationaux dans Expensify. Conformément à la réglementation australienne, nous vous fournissons le Financial Services Guide (FSG) et le Product Disclosure Statement (PDS) de Corpay.

            Veuillez lire attentivement les documents FSG et PDS, car ils contiennent des informations complètes et importantes sur les produits et services offerts par Corpay. Conservez ces documents pour référence future.
        `),
        pleaseUpload: 'Veuillez téléverser ci-dessous des documents supplémentaires afin de nous aider à vérifier votre identité en tant que directeur de l’entreprise.',
        enterSignerInfo: 'Saisir les informations du signataire',
        thisStep: 'Cette étape a été terminée',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `est en train de connecter un compte bancaire professionnel en ${currency} se terminant par ${bankAccountLastFour} à Expensify pour payer des employés en ${currency}. L’étape suivante nécessite les informations du signataire d’un directeur.`,
        error: {
            emailsMustBeDifferent: 'Les e-mails doivent être différents',
        },
    },
    agreementsStep: {
        agreements: 'Accords',
        pleaseConfirm: 'Veuillez confirmer les accords ci-dessous',
        regulationRequiresUs: 'La réglementation nous oblige à vérifier l’identité de toute personne détenant plus de 25 % de l’entreprise.',
        iAmAuthorized: 'Je suis autorisé à utiliser le compte bancaire professionnel pour les dépenses professionnelles.',
        iCertify: 'Je certifie que les informations fournies sont exactes et véridiques.',
        iAcceptTheTermsAndConditions: `J’accepte les <a href="https://cross-border.corpay.com/tc/">conditions générales</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'J’accepte les conditions générales.',
        accept: 'Accepter et ajouter le compte bancaire',
        iConsentToThePrivacyNotice: 'Je consens à l’<a href="https://payments.corpay.com/compliance">avis de confidentialité</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Je consens à la notice de confidentialité.',
        error: {
            authorized: 'Vous devez être un responsable habilité, autorisé à gérer le compte bancaire de l’entreprise',
            certify: 'Veuillez certifier que les informations sont vraies et exactes',
            consent: 'Veuillez accepter l’avis de confidentialité',
        },
    },
    docusignStep: {
        subheader: 'Formulaire DocuSign',
        pleaseComplete:
            'Veuillez remplir le formulaire d’autorisation ACH avec le lien DocuSign ci-dessous, puis téléverser ici la copie signée afin que nous puissions prélever des fonds directement sur votre compte bancaire',
        pleaseCompleteTheBusinessAccount: 'Veuillez compléter la demande de compte professionnel pour l’autorisation de prélèvement automatique',
        pleaseCompleteTheDirect:
            'Veuillez remplir l’Autorisation de prélèvement automatique en utilisant le lien Docusign ci-dessous, puis téléversez ici la copie signée afin que nous puissions prélever des fonds directement sur votre compte bancaire.',
        takeMeTo: 'Aller à DocuSign',
        uploadAdditional: 'Téléverser des documents supplémentaires',
        pleaseUpload: 'Veuillez téléverser le formulaire DEFT et la page de signature Docusign',
        pleaseUploadTheDirect: 'Veuillez téléverser les arrangements de prélèvement automatique et la page de signature DocuSign',
    },
    finishStep: {
        letsFinish: 'Terminons dans le chat !',
        thanksFor:
            'Merci pour ces précisions. Un agent d’assistance dédié va maintenant examiner vos informations. Nous reviendrons vers vous si nous avons besoin de quoi que ce soit d’autre, mais en attendant, n’hésitez pas à nous contacter si vous avez des questions.',
        iHaveA: 'J’ai une question',
        enable2FA: 'Activer l’authentification à deux facteurs (2FA) pour prévenir la fraude',
        weTake: 'Nous prenons votre sécurité au sérieux. Veuillez configurer l’authentification à deux facteurs maintenant afin d’ajouter une couche de protection supplémentaire à votre compte.',
        secure: 'Sécurisez votre compte',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Un instant',
        explanationLine: 'Nous examinons vos informations. Vous pourrez poursuivre les prochaines étapes sous peu.',
    },
    session: {
        offlineMessageRetry: 'On dirait que vous êtes hors ligne. Veuillez vérifier votre connexion et réessayer.',
    },
    travel: {
        header: 'Réserver un voyage',
        title: 'Voyagez futé',
        subtitle: 'Utilisez Expensify Travel pour bénéficier des meilleures offres de voyage et gérer toutes vos dépenses professionnelles en un seul endroit.',
        features: {
            saveMoney: 'Économisez de l’argent sur vos réservations',
            alerts: 'Recevez des mises à jour et des alertes en temps réel',
        },
        bookTravel: 'Réserver un voyage',
        bookDemo: 'Réserver une démo',
        bookADemo: 'Réserver une démo',
        toLearnMore: 'pour en savoir plus.',
        termsAndConditions: {
            header: 'Avant de continuer…',
            title: 'Conditions générales',
            label: 'J’accepte les conditions générales',
            subtitle: `Veuillez accepter les <a href="${CONST.TRAVEL_TERMS_URL}">conditions générales</a> d’Expensify Travel.`,
            error: 'Vous devez accepter les conditions générales d’Expensify Travel pour continuer',
            defaultWorkspaceError:
                'Vous devez définir un espace de travail par défaut pour activer Expensify Travel. Accédez à Paramètres > Espaces de travail > cliquez sur les trois points verticaux à côté d’un espace de travail > Définir comme espace de travail par défaut, puis réessayez !',
        },
        flight: 'Vol',
        flightDetails: {
            passenger: 'Passager',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Vous avez une <strong>escale de ${layover}</strong> avant ce vol</muted-text-label>`,
            takeOff: 'Décollage',
            landing: 'Accueil',
            seat: 'Licence',
            class: 'Classe de cabine',
            recordLocator: 'Localisateur d’enregistrement',
            cabinClasses: {
                unknown: 'Inconnu',
                economy: 'Économie',
                premiumEconomy: 'Classe Premium Economy',
                business: 'Professionnel',
                first: 'Premier',
            },
        },
        hotel: 'Hôtel',
        hotelDetails: {
            guest: 'Invité',
            checkIn: 'Enregistrement',
            checkOut: 'Paiement',
            roomType: 'Type de chambre',
            cancellation: 'Politique d’annulation',
            cancellationUntil: 'Annulation gratuite jusqu’au',
            confirmation: 'Numéro de confirmation',
            cancellationPolicies: {
                unknown: 'Inconnu',
                nonRefundable: 'Non remboursable',
                freeCancellationUntil: 'Annulation gratuite jusqu’au',
                partiallyRefundable: 'Partiellement remboursable',
            },
        },
        car: 'Voiture',
        carDetails: {
            rentalCar: 'Location de voiture',
            pickUp: 'Prise en charge',
            dropOff: 'Dépôt',
            driver: 'Chauffeur',
            carType: 'Type de véhicule',
            cancellation: 'Politique d’annulation',
            cancellationUntil: 'Annulation gratuite jusqu’au',
            freeCancellation: 'Annulation gratuite',
            confirmation: 'Numéro de confirmation',
        },
        train: 'Ferroviaire',
        trainDetails: {
            passenger: 'Passager',
            departs: 'Départ',
            arrives: 'Arrive',
            coachNumber: 'Numéro de voiture',
            seat: 'Licence',
            fareDetails: 'Détails du tarif',
            confirmation: 'Numéro de confirmation',
        },
        viewTrip: 'Voir le voyage',
        modifyTrip: 'Modifier le voyage',
        tripSupport: 'Assistance de voyage',
        tripDetails: 'Détails du voyage',
        viewTripDetails: 'Voir les détails du voyage',
        trip: 'Voyage',
        trips: 'Voyages',
        tripSummary: 'Résumé du voyage',
        departs: 'Départ',
        errorMessage: 'Une erreur s’est produite. Veuillez réessayer plus tard.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>Veuillez <a href="${phoneErrorMethodsRoute}">ajouter un e-mail professionnel comme identifiant principal</a> pour réserver un voyage.</rbr>`,
        domainSelector: {
            title: 'Domaine',
            subtitle: 'Choisissez un domaine pour la configuration d’Expensify Travel.',
            recommended: 'Recommandé',
        },
        domainPermissionInfo: {
            title: 'Domaine',
            restriction: ({domain}: DomainPermissionInfoRestrictionParams) =>
                `Vous n’avez pas l’autorisation d’activer Expensify Travel pour le domaine <strong>${domain}</strong>. Vous devrez demander à quelqu’un de ce domaine d’activer le service de voyage à la place.`,
            accountantInvitation: `Si vous êtes comptable, pensez à rejoindre le <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">programme ExpensifyApproved! pour les comptables</a> afin d’activer les déplacements pour ce domaine.`,
        },
        publicDomainError: {
            title: 'Commencez avec Expensify Travel',
            message: `Vous devrez utiliser votre adresse e‑mail professionnelle (par ex., nom@company.com) avec Expensify Travel, et non votre adresse e‑mail personnelle (par ex., nom@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel a été désactivé',
            message: `Votre administrateur a désactivé Expensify Travel. Veuillez suivre la politique de réservation de votre entreprise pour l’organisation de vos voyages.`,
        },
        verifyCompany: {
            title: 'Nous examinons votre demande...',
            message: `Nous effectuons quelques vérifications de notre côté pour confirmer que votre compte est prêt pour Expensify Travel. Nous vous recontacterons sous peu !`,
            confirmText: 'Compris',
            conciergeMessage: ({domain}: {domain: string}) => `L’activation des voyages a échoué pour le domaine : ${domain}. Veuillez vérifier et activer les voyages pour ce domaine.`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `Votre vol ${airlineCode} (${origin} → ${destination}) du ${startDate} a été réservé. Code de confirmation : ${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Votre billet pour le vol ${airlineCode} (${origin} → ${destination}) du ${startDate} a été annulé.`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Votre billet pour le vol ${airlineCode} (${origin} → ${destination}) du ${startDate} a été remboursé ou échangé.`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `Votre vol ${airlineCode} (${origin} → ${destination}) du ${startDate}} a été annulé par la compagnie aérienne.`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) =>
                `La compagnie aérienne a proposé un changement d’horaire pour le vol ${airlineCode} ; nous attendons la confirmation.`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `Changement d’horaire confirmé : le vol ${airlineCode} part maintenant à ${startDate}.`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `Votre vol ${airlineCode} (${origin} → ${destination}) du ${startDate} a été mis à jour.`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `Votre classe de cabine a été mise à jour vers ${cabinClass} sur le vol ${airlineCode}.`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `Votre siège attribué sur le vol ${airlineCode} a été confirmé.`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `Votre siège attribué sur le vol ${airlineCode} a été modifié.`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `Votre place attribuée sur le vol ${airlineCode} a été supprimée.`,
            paymentDeclined: 'Le paiement de votre réservation de vol a échoué. Veuillez réessayer.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Vous avez annulé votre réservation de ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Le fournisseur a annulé votre réservation de ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Votre réservation de ${type} a été reprogrammée. Nouveau numéro de confirmation : ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Votre réservation de ${type} a été mise à jour. Consultez les nouveaux détails dans l’itinéraire.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Votre billet de train pour ${origin} → ${destination} le ${startDate} a été remboursé. Un avoir sera traité.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Votre billet de train pour ${origin} → ${destination} le ${startDate} a été échangé.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Votre billet de train pour ${origin} → ${destination} le ${startDate} a été mis à jour.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Votre réservation de ${type} a été mise à jour.`,
        },
        flightTo: 'Vol vers',
        trainTo: 'Former à',
        carRental: 'location de voiture',
        nightIn: 'nuit à',
        nightsIn: 'nuits à',
    },
    workspace: {
        common: {
            card: 'Cartes',
            expensifyCard: 'Carte Expensify',
            companyCards: 'Cartes d’entreprise',
            workflows: 'Workflows',
            workspace: 'Espace de travail',
            findWorkspace: 'Trouver un espace de travail',
            edit: 'Modifier l’espace de travail',
            enabled: 'Activé',
            disabled: 'Désactivé',
            everyone: 'Tout le monde',
            delete: 'Supprimer l’espace de travail',
            settings: 'Paramètres',
            reimburse: 'Remboursements',
            categories: 'Catégories',
            tags: 'Étiquettes',
            customField1: 'Champ personnalisé 1',
            customField2: 'Champ personnalisé 2',
            customFieldHint: 'Ajouter une codification personnalisée qui s’applique à toutes les dépenses de ce membre.',
            reports: 'Rapports',
            reportFields: 'Champs de rapport',
            reportTitle: 'Titre du rapport',
            reportField: 'Champ de rapport',
            taxes: 'Taxes',
            bills: 'Factures',
            invoices: 'Factures',
            perDiem: 'Indemnité journalière',
            travel: 'Voyage',
            members: 'Membres',
            accounting: 'Comptabilité',
            receiptPartners: 'Partenaires de reçus',
            rules: 'Règles',
            displayedAs: 'Affiché comme',
            plan: 'Forfait',
            profile: 'Aperçu',
            bankAccount: 'Compte bancaire',
            testTransactions: 'Transactions de test',
            issueAndManageCards: 'Émettre et gérer des cartes',
            reconcileCards: 'Rapprocher les cartes',
            selectAll: 'Tout sélectionner',
            selected: () => ({
                one: '1 sélectionné',
                other: (count: number) => `${count} sélectionné`,
            }),
            settlementFrequency: 'Fréquence de règlement',
            setAsDefault: 'Définir comme espace de travail par défaut',
            defaultNote: `Les reçus envoyés à ${CONST.EMAIL.RECEIPTS} apparaîtront dans cet espace de travail.`,
            deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer cet espace de travail ?',
            deleteWithCardsConfirmation: 'Êtes-vous sûr de vouloir supprimer cet espace de travail ? Cela supprimera tous les flux de cartes et les cartes attribuées.',
            unavailable: 'Espace de travail indisponible',
            memberNotFound: 'Membre introuvable. Pour inviter un nouveau membre dans l’espace de travail, veuillez utiliser le bouton d’invitation ci-dessus.',
            notAuthorized: `Vous n’avez pas accès à cette page. Si vous essayez de rejoindre cet espace de travail, demandez simplement au propriétaire de l’espace de travail de vous ajouter en tant que membre. Autre chose ? Contactez ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Aller à l’espace de travail',
            duplicateWorkspace: 'Dupliquer l’espace de travail',
            duplicateWorkspacePrefix: 'Dupliquer',
            goToWorkspaces: 'Aller aux espaces de travail',
            clearFilter: 'Effacer le filtre',
            workspaceName: 'Nom de l’espace de travail',
            workspaceOwner: 'Propriétaire',
            workspaceType: 'Type d’espace de travail',
            workspaceAvatar: 'Avatar de workspace',
            mustBeOnlineToViewMembers: 'Vous devez être en ligne pour afficher les membres de cet espace de travail.',
            moreFeatures: 'Plus de fonctionnalités',
            requested: 'Demandé',
            distanceRates: 'Tarifs de distance',
            defaultDescription: 'Un seul endroit pour tous vos reçus et dépenses.',
            descriptionHint: 'Partager des informations sur cet espace de travail avec tous les membres.',
            welcomeNote: 'Veuillez utiliser Expensify pour soumettre vos reçus pour remboursement, merci !',
            subscription: 'Abonnement',
            markAsEntered: 'Marquer comme saisi manuellement',
            markAsExported: 'Marquer comme exporté',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exporter vers ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
            lineItemLevel: 'Au niveau des postes',
            reportLevel: 'Niveau du rapport',
            topLevel: 'Niveau supérieur',
            appliedOnExport: 'Non importé dans Expensify, appliqué à l’exportation',
            shareNote: {
                header: 'Partagez votre espace de travail avec d’autres membres',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Partagez ce code QR ou copiez le lien ci-dessous pour faciliter les demandes d’accès des membres à votre espace de travail. Toutes les demandes pour rejoindre l’espace de travail apparaîtront dans le salon <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> pour que vous puissiez les examiner.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Se connecter à ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Créer une nouvelle connexion',
            reuseExistingConnection: 'Réutiliser la connexion existante',
            existingConnections: 'Connexions existantes',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Puisque vous vous êtes déjà connecté à ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, vous pouvez choisir de réutiliser une connexion existante ou d’en créer une nouvelle.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Dernière synchronisation le ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Impossible de se connecter à ${connectionName} en raison d’une erreur d’authentification.`,
            learnMore: 'En savoir plus',
            memberAlternateText: 'Les membres peuvent soumettre et approuver des rapports.',
            adminAlternateText: 'Les administrateurs ont un accès complet en modification à tous les rapports et paramètres de l’espace de travail.',
            auditorAlternateText: 'Les auditeurs peuvent consulter et commenter les rapports.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Administrateur';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Auditeur';
                    case CONST.POLICY.ROLE.USER:
                        return 'Membre';
                    default:
                        return 'Membre';
                }
            },
            frequency: {
                manual: 'Manuellement',
                instant: 'Instantané',
                immediate: 'Quotidien',
                trip: 'Par déplacement',
                weekly: 'Hebdomadaire',
                semimonthly: 'Deux fois par mois',
                monthly: 'Mensuel',
            },
            planType: 'Type d’abonnement',
            submitExpense: 'Soumettez vos notes de frais ci-dessous :',
            defaultCategory: 'Catégorie par défaut',
            viewTransactions: 'Afficher les transactions',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Notes de frais de ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Les transactions de la carte Expensify seront automatiquement exportées vers un « compte de responsabilité de carte Expensify » créé avec <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">notre intégration</a>.</muted-text-label>`,
        },
        receiptPartners: {
            connect: 'Connecter maintenant',
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Connecté à ${organizationName}` : 'Automatisez les dépenses de voyage et de livraison de repas dans toute votre organisation.',
                sendInvites: 'Envoyer des invitations',
                sendInvitesDescription:
                    'Ces membres de l’espace de travail n’ont pas encore de compte Uber for Business. Désélectionnez les membres que vous ne souhaitez pas inviter pour le moment.',
                confirmInvite: 'Confirmer l’invitation',
                manageInvites: 'Gérer les invitations',
                confirm: 'Confirmer',
                allSet: 'Tout est prêt',
                readyToRoll: 'Vous êtes prêt à démarrer',
                takeBusinessRideMessage: 'Prenez un trajet professionnel et vos reçus Uber seront importés dans Expensify. En route !',
                all: 'Tous',
                linked: 'Lié',
                outstanding: 'En attente',
                status: {
                    resend: 'Renvoyer',
                    invite: 'Inviter',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'Lié',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: 'En attente',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: 'Suspendu',
                },
                centralBillingAccount: 'Compte de facturation centralisé',
                centralBillingDescription: 'Choisissez où importer tous les reçus Uber.',
                invitationFailure: 'Échec de l’invitation du membre à Uber for Business',
                autoInvite: 'Inviter de nouveaux membres de l’espace de travail à Uber for Business',
                autoRemove: 'Désactiver dans Uber for Business les membres supprimés de l’espace de travail',
                bannerTitle: 'Expensify + Uber for Business',
                bannerDescription: 'Connectez Uber for Business pour automatiser les frais de déplacement et de livraison de repas dans l’ensemble de votre organisation.',
                emptyContent: {
                    title: 'Aucune invitation en attente',
                    subtitle: 'Hourra ! Nous avons cherché partout et n’avons trouvé aucune invitation en attente.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Définissez des indemnités journalières pour contrôler les dépenses quotidiennes des employés. <a href="${CONST.DEEP_DIVE_PER_DIEM}">En savoir plus</a>.</muted-text>`,
            amount: 'Montant',
            deleteRates: () => ({
                one: 'Supprimer le taux',
                other: 'Supprimer les taux',
            }),
            deletePerDiemRate: 'Supprimer le taux de per diem',
            findPerDiemRate: 'Trouver le taux de per diem',
            areYouSureDelete: () => ({
                one: 'Voulez-vous vraiment supprimer ce tarif ?',
                other: 'Êtes-vous sûr de vouloir supprimer ces tarifs ?',
            }),
            emptyList: {
                title: 'Indemnité journalière',
                subtitle: 'Définissez des indemnités journalières pour contrôler les dépenses quotidiennes des employés. Importez les taux à partir d’une feuille de calcul pour commencer.',
            },
            importPerDiemRates: 'Importer les indemnités journalières',
            editPerDiemRate: 'Modifier le taux de per diem',
            editPerDiemRates: 'Modifier les indemnités journalières',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `La mise à jour de cette destination la modifiera pour tous les sous-taux de per diem ${destination}.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `La mise à jour de cette devise la modifiera pour tous les sous-taux de per diem de ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Définissez la façon dont les notes de frais payées de votre poche sont exportées vers QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Marque les chèques comme « à imprimer plus tard »',
            exportDescription: 'Configurez comment les données d’Expensify sont exportées vers QuickBooks Desktop.',
            date: 'Date d’exportation',
            exportInvoices: 'Exporter les factures vers',
            exportExpensifyCard: 'Exporter les transactions de carte Expensify en tant que',
            account: 'Compte',
            accountDescription: 'Choisissez où enregistrer les écritures comptables.',
            accountsPayable: 'Comptes fournisseurs',
            accountsPayableDescription: 'Choisissez où créer les factures fournisseur.',
            bankAccount: 'Compte bancaire',
            notConfigured: 'Non configuré',
            bankAccountDescription: 'Choisissez l’endroit à partir duquel envoyer les chèques.',
            creditCardAccount: 'Compte de carte de crédit',
            exportDate: {
                label: 'Date d’exportation',
                description: 'Utilisez cette date lors de l’exportation des rapports vers QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente figurant sur le rapport.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Date d’exportation',
                        description: 'Date à laquelle le rapport a été exporté vers QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date à laquelle le rapport a été soumis pour approbation.',
                    },
                },
            },
            exportCheckDescription: 'Nous créerons un chèque détaillé pour chaque rapport Expensify et l’enverrons à partir du compte bancaire ci-dessous.',
            exportJournalEntryDescription: 'Nous créerons une écriture de journal détaillée pour chaque rapport Expensify et la comptabiliserons sur le compte ci-dessous.',
            exportVendorBillDescription:
                'Nous créerons une facture fournisseur détaillée pour chaque rapport Expensify et l’ajouterons au compte ci‑dessous. Si cette période est clôturée, nous comptabiliserons au 1er du prochain exercice ouvert.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop ne prend pas en charge les taxes sur les exports d’écritures de journal. Comme les taxes sont activées sur votre espace de travail, cette option d’export n’est pas disponible.',
            outOfPocketTaxEnabledError: 'Les écritures de journal ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d’exportation.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Carte de crédit',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Facture fournisseur',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Écriture comptable',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Vérifier',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Nous créerons un chèque détaillé pour chaque rapport Expensify et l’enverrons à partir du compte bancaire ci-dessous.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Nous associerons automatiquement le nom du commerçant sur la transaction par carte de crédit à tout fournisseur correspondant dans QuickBooks. S’il n’existe aucun fournisseur, nous créerons un fournisseur « Credit Card Misc. » pour l’association.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Nous créerons une facture fournisseur détaillée pour chaque rapport Expensify avec la date de la dernière dépense et l’ajouterons au compte ci-dessous. Si cette période est clôturée, nous l’enregistrerons au 1er du prochain exercice ouvert.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Choisissez où exporter les transactions par carte de crédit.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Choisissez un fournisseur à appliquer à toutes les transactions par carte de crédit.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Choisissez l’endroit à partir duquel envoyer les chèques.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Les factures fournisseurs ne sont pas disponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d’exportation.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Les chèques ne sont pas disponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d’exportation.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Les écritures de journal ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d’exportation.',
            },
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: 'Ajoutez le compte dans QuickBooks Desktop et synchronisez à nouveau la connexion',
            qbdSetup: 'Configuration de QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Impossible de se connecter depuis cet appareil',
                body1: 'Vous devrez configurer cette connexion à partir de l’ordinateur qui héberge le fichier de votre entreprise QuickBooks Desktop.',
                body2: 'Une fois connecté, vous pourrez synchroniser et exporter depuis n’importe où.',
            },
            setupPage: {
                title: 'Ouvrez ce lien pour vous connecter',
                body: 'Pour terminer la configuration, ouvrez le lien suivant sur l’ordinateur où QuickBooks Desktop est exécuté.',
                setupErrorTitle: 'Une erreur s’est produite',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>La connexion à QuickBooks Desktop ne fonctionne pas pour le moment. Veuillez réessayer plus tard ou <a href="${conciergeLink}">contactez Concierge</a> si le problème persiste.</centered-text></muted-text>`,
            },
            importDescription: 'Choisissez quelles configurations de codage importer de QuickBooks Desktop vers Expensify.',
            classes: 'Classes',
            items: 'Articles',
            customers: 'Clients/projets',
            exportCompanyCardsDescription: 'Définissez la façon dont les achats par carte d’entreprise sont exportés vers QuickBooks Desktop.',
            defaultVendorDescription: 'Définissez un fournisseur par défaut qui sera appliqué à toutes les transactions par carte de crédit lors de l’exportation.',
            accountsDescription: 'Votre plan comptable QuickBooks Desktop sera importé dans Expensify en tant que catégories.',
            accountsSwitchTitle: 'Choisissez d’importer les nouveaux comptes comme catégories activées ou désactivées.',
            accountsSwitchDescription: 'Les catégories activées seront disponibles pour que les membres les sélectionnent lors de la création de leurs dépenses.',
            classesDescription: 'Choisissez comment gérer les classes QuickBooks Desktop dans Expensify.',
            tagsDisplayedAsDescription: 'Niveau de poste de ligne',
            reportFieldsDisplayedAsDescription: 'Niveau du rapport',
            customersDescription: 'Choisissez comment gérer les clients/projets QuickBooks Desktop dans Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec QuickBooks Desktop chaque jour.',
                createEntities: 'Créer automatiquement des entités',
                createEntitiesDescription: 'Expensify créera automatiquement des fournisseurs dans QuickBooks Desktop s’ils n’existent pas déjà.',
            },
            itemsDescription: 'Choisissez comment gérer les éléments QuickBooks Desktop dans Expensify.',
            accountingMethods: {
                label: 'Quand exporter',
                description: 'Choisissez quand exporter les dépenses :',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Comptabilité d’exercice',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Espèces',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Les dépenses payées de votre poche seront exportées une fois la validation finale effectuée',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Les dépenses payées de votre poche seront exportées une fois réglées',
                },
            },
        },
        qbo: {
            connectedTo: 'Connecté à',
            importDescription: 'Choisissez quelles configurations de codage importer de QuickBooks Online vers Expensify.',
            classes: 'Classes',
            locations: 'Lieux',
            customers: 'Clients/projets',
            accountsDescription: 'Votre plan comptable QuickBooks Online sera importé dans Expensify en tant que catégories.',
            accountsSwitchTitle: 'Choisissez d’importer les nouveaux comptes comme catégories activées ou désactivées.',
            accountsSwitchDescription: 'Les catégories activées seront disponibles pour que les membres les sélectionnent lors de la création de leurs dépenses.',
            classesDescription: 'Choisissez comment gérer les classes QuickBooks Online dans Expensify.',
            customersDescription: 'Choisissez comment gérer les clients/projets QuickBooks Online dans Expensify.',
            locationsDescription: 'Choisissez comment gérer les emplacements QuickBooks Online dans Expensify.',
            taxesDescription: 'Choisissez comment gérer les taxes QuickBooks Online dans Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online ne prend pas en charge les emplacements au niveau des lignes pour les chèques ou les factures fournisseur. Si vous souhaitez avoir des emplacements au niveau des lignes, assurez-vous d’utiliser les écritures de journal et les dépenses par carte de crédit/débit.',
            taxesJournalEntrySwitchNote:
                'QuickBooks Online ne prend pas en charge les taxes sur les écritures de journal. Veuillez modifier votre option d’exportation en facture fournisseur ou chèque.',
            exportDescription: 'Configurez la manière dont les données Expensify sont exportées vers QuickBooks Online.',
            date: 'Date d’exportation',
            exportInvoices: 'Exporter les factures vers',
            exportExpensifyCard: 'Exporter les transactions de carte Expensify en tant que',
            exportDate: {
                label: 'Date d’exportation',
                description: 'Utilisez cette date lors de l’exportation des rapports vers QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente figurant sur le rapport.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Date d’exportation',
                        description: 'Date à laquelle le rapport a été exporté vers QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date à laquelle le rapport a été soumis pour approbation.',
                    },
                },
            },
            receivable: 'Comptes clients', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archive des comptes clients', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Utilisez ce compte lors de l’exportation des factures vers QuickBooks Online.',
            exportCompanyCardsDescription: 'Définissez la façon dont les achats par carte d’entreprise sont exportés vers QuickBooks Online.',
            vendor: 'Fournisseur',
            defaultVendorDescription: 'Définissez un fournisseur par défaut qui sera appliqué à toutes les transactions par carte de crédit lors de l’exportation.',
            exportOutOfPocketExpensesDescription: 'Définissez comment les dépenses non remboursées sont exportées vers QuickBooks Online.',
            exportCheckDescription: 'Nous créerons un chèque détaillé pour chaque rapport Expensify et l’enverrons à partir du compte bancaire ci-dessous.',
            exportJournalEntryDescription: 'Nous créerons une écriture de journal détaillée pour chaque rapport Expensify et la comptabiliserons sur le compte ci-dessous.',
            exportVendorBillDescription:
                'Nous créerons une facture fournisseur détaillée pour chaque rapport Expensify et l’ajouterons au compte ci‑dessous. Si cette période est clôturée, nous comptabiliserons au 1er du prochain exercice ouvert.',
            account: 'Compte',
            accountDescription: 'Choisissez où enregistrer les écritures comptables.',
            accountsPayable: 'Comptes fournisseurs',
            accountsPayableDescription: 'Choisissez où créer les factures fournisseur.',
            bankAccount: 'Compte bancaire',
            notConfigured: 'Non configuré',
            bankAccountDescription: 'Choisissez l’endroit à partir duquel envoyer les chèques.',
            creditCardAccount: 'Compte de carte de crédit',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online ne prend pas en charge les emplacements pour l’exportation des factures fournisseur. Comme les emplacements sont activés sur votre espace de travail, cette option d’exportation n’est pas disponible.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online ne prend pas en charge les taxes sur les exports d’écritures de journal. Comme les taxes sont activées sur votre espace de travail, cette option d’exportation n’est pas disponible.',
            outOfPocketTaxEnabledError: 'Les écritures de journal ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d’exportation.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec QuickBooks Online chaque jour.',
                inviteEmployees: 'Inviter des employés',
                inviteEmployeesDescription: 'Importer les fiches d’employés QuickBooks Online et inviter les employés dans cet espace de travail.',
                createEntities: 'Créer automatiquement des entités',
                createEntitiesDescription:
                    'Expensify créera automatiquement les fournisseurs dans QuickBooks Online s’ils n’existent pas déjà, et créera automatiquement les clients lors de l’exportation des factures.',
                reimbursedReportsDescription:
                    'Chaque fois qu’un rapport est payé via Expensify ACH, le règlement de facture correspondant sera créé dans le compte QuickBooks Online ci-dessous.',
                qboBillPaymentAccount: 'Compte de paiement des factures QuickBooks',
                qboInvoiceCollectionAccount: 'Compte d’encaissement des factures QuickBooks',
                accountSelectDescription: 'Choisissez d’où vous paierez les factures et nous créerons le paiement dans QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Choisissez où recevoir les paiements de factures et nous créerons le paiement dans QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Carte de débit',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Carte de crédit',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Facture fournisseur',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Écriture comptable',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Vérifier',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Nous ferons automatiquement correspondre le nom du commerçant de la transaction par carte de débit aux fournisseurs correspondants dans QuickBooks. S’il n’existe aucun fournisseur, nous créerons un fournisseur « Debit Card Misc. » pour l’association.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Nous associerons automatiquement le nom du commerçant sur la transaction par carte de crédit à tout fournisseur correspondant dans QuickBooks. S’il n’existe aucun fournisseur, nous créerons un fournisseur « Credit Card Misc. » pour l’association.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Nous créerons une facture fournisseur détaillée pour chaque rapport Expensify avec la date de la dernière dépense et l’ajouterons au compte ci-dessous. Si cette période est clôturée, nous l’enregistrerons au 1er du prochain exercice ouvert.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Choisissez où exporter les transactions de carte de débit.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Choisissez où exporter les transactions par carte de crédit.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Choisissez un fournisseur à appliquer à toutes les transactions par carte de crédit.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Les factures fournisseurs ne sont pas disponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d’exportation.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Les chèques ne sont pas disponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d’exportation.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Les écritures de journal ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d’exportation.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Choisissez un compte valide pour l’exportation de la facture fournisseur',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Choisissez un compte valide pour l’exportation d’écritures comptables',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Choisissez un compte valide pour l’exportation de chèques',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]:
                    'Pour utiliser l’exportation des factures fournisseur, configurez un compte de comptes fournisseurs dans QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Pour utiliser l’exportation d’écritures de journal, configurez un compte de journal dans QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Pour utiliser l’exportation de chèques, configurez un compte bancaire dans QuickBooks Online',
            },
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: 'Ajoutez le compte dans QuickBooks Online et synchronisez à nouveau la connexion.',
            accountingMethods: {
                label: 'Quand exporter',
                description: 'Choisissez quand exporter les dépenses :',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Comptabilité d’exercice',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Espèces',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Les dépenses payées de votre poche seront exportées une fois la validation finale effectuée',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Les dépenses payées de votre poche seront exportées une fois réglées',
                },
            },
        },
        workspaceList: {
            joinNow: 'Rejoindre maintenant',
            askToJoin: 'Demander à rejoindre',
        },
        xero: {
            organization: 'Organisation Xero',
            organizationDescription: 'Choisissez l’organisation Xero à partir de laquelle vous souhaitez importer des données.',
            importDescription: 'Choisissez quelles configurations de codage importer de Xero vers Expensify.',
            accountsDescription: 'Votre plan comptable Xero sera importé dans Expensify en tant que catégories.',
            accountsSwitchTitle: 'Choisissez d’importer les nouveaux comptes comme catégories activées ou désactivées.',
            accountsSwitchDescription: 'Les catégories activées seront disponibles pour que les membres les sélectionnent lors de la création de leurs dépenses.',
            trackingCategories: 'Catégories de suivi',
            trackingCategoriesDescription: 'Choisissez comment gérer les catégories de suivi Xero dans Expensify.',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Mapper ${categoryName} à Xero`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Choisissez où mapper ${categoryName} lors de l’exportation vers Xero.`,
            customers: 'Refacturer les clients',
            customersDescription:
                'Choisissez si vous souhaitez refacturer les clients dans Expensify. Vos contacts clients Xero peuvent être associés aux dépenses et seront exportés vers Xero en tant que facture de vente.',
            taxesDescription: 'Choisissez comment gérer les taxes Xero dans Expensify.',
            notImported: 'Non importé',
            notConfigured: 'Non configuré',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Contact Xero par défaut',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Étiquettes',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Champs de rapport',
            },
            exportDescription: 'Configurer la façon dont les données Expensify sont exportées vers Xero.',
            purchaseBill: 'Facture d’achat',
            exportDeepDiveCompanyCard:
                'Les dépenses exportées seront enregistrées comme transactions bancaires sur le compte bancaire Xero ci-dessous, et les dates des transactions correspondront aux dates de votre relevé bancaire.',
            bankTransactions: 'Transactions bancaires',
            xeroBankAccount: 'Compte bancaire Xero',
            xeroBankAccountDescription: 'Choisissez où les dépenses seront enregistrées en tant que transactions bancaires.',
            exportExpensesDescription: 'Les rapports seront exportés comme une facture d’achat avec la date et le statut sélectionnés ci-dessous.',
            purchaseBillDate: 'Date de la facture d’achat',
            exportInvoices: 'Exporter les factures en tant que',
            salesInvoice: 'Facture de vente',
            exportInvoicesDescription: 'Les factures de vente affichent toujours la date à laquelle la facture a été envoyée.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec Xero chaque jour.',
                purchaseBillStatusTitle: "Statut de la note d'achat",
                reimbursedReportsDescription: 'Chaque fois qu’un rapport est payé via Expensify ACH, le paiement de facture correspondant sera créé dans le compte Xero ci-dessous.',
                xeroBillPaymentAccount: 'Compte de paiement des factures Xero',
                xeroInvoiceCollectionAccount: 'Compte de recouvrement des factures Xero',
                xeroBillPaymentAccountDescription: 'Choisissez d’où payer les factures et nous créerons le paiement dans Xero.',
                invoiceAccountSelectorDescription: 'Choisissez où recevoir les paiements de facture et nous créerons le paiement dans Xero.',
            },
            exportDate: {
                label: 'Date de la facture d’achat',
                description: 'Utilisez cette date lors de l’exportation des rapports vers Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente figurant sur le rapport.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Date d’exportation',
                        description: 'Date à laquelle le rapport a été exporté vers Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date à laquelle le rapport a été soumis pour approbation.',
                    },
                },
            },
            invoiceStatus: {
                label: "Statut de la note d'achat",
                description: 'Utilisez ce statut lors de l’exportation des factures d’achat vers Xero.',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: 'Brouillon',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'En attente d’approbation',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: 'En attente de paiement',
                },
            },
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: 'Veuillez ajouter le compte dans Xero et synchroniser à nouveau la connexion',
            accountingMethods: {
                label: 'Quand exporter',
                description: 'Choisissez quand exporter les dépenses :',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Comptabilité d’exercice',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Espèces',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Les dépenses payées de votre poche seront exportées une fois la validation finale effectuée',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Les dépenses payées de votre poche seront exportées une fois réglées',
                },
            },
        },
        sageIntacct: {
            preferredExporter: 'Exportateur préféré',
            taxSolution: 'Solution fiscale',
            notConfigured: 'Non configuré',
            exportDate: {
                label: 'Date d’exportation',
                description: 'Utilisez cette date lors de l’exportation des rapports vers Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente figurant sur le rapport.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Date d’exportation',
                        description: 'Date à laquelle le rapport a été exporté vers Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date à laquelle le rapport a été soumis pour approbation.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Définissez le mode d’exportation des dépenses payées de votre poche vers Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Notes de frais',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Factures fournisseur',
                },
            },
            nonReimbursableExpenses: {
                description: 'Définissez comment les achats par carte d’entreprise sont exportés vers Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Cartes de crédit',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Factures fournisseur',
                },
            },
            creditCardAccount: 'Compte de carte de crédit',
            defaultVendor: 'Fournisseur par défaut',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Définissez un fournisseur par défaut qui s’appliquera aux dépenses ${isReimbursable ? '' : 'non-'}remboursables qui n’ont pas de fournisseur correspondant dans Sage Intacct.`,
            exportDescription: 'Configurez comment les données Expensify sont exportées vers Sage Intacct.',
            exportPreferredExporterNote:
                'L’exportateur préféré peut être n’importe quel administrateur de l’espace de travail, mais doit également être un administrateur de domaine si vous définissez des comptes d’exportation différents pour des cartes d’entreprise individuelles dans les paramètres de domaine.',
            exportPreferredExporterSubNote: 'Une fois défini, l’exportateur préféré verra les rapports à exporter dans son compte.',
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: `Veuillez ajouter le compte dans Sage Intacct et synchroniser à nouveau la connexion`,
            autoSync: 'Synchronisation automatique',
            autoSyncDescription: 'Expensify se synchronisera automatiquement avec Sage Intacct chaque jour.',
            inviteEmployees: 'Inviter des employés',
            inviteEmployeesDescription:
                'Importez les fiches des employés Sage Intacct et invitez les employés dans cet espace de travail. Votre circuit d’approbation sera défini par défaut sur l’approbation du responsable et pourra être configuré plus en détail sur la page Membres.',
            syncReimbursedReports: 'Synchroniser les rapports remboursés',
            syncReimbursedReportsDescription:
                'Chaque fois qu’un rapport est payé à l’aide d’Expensify ACH, le règlement de facture correspondant sera créé dans le compte Sage Intacct ci‑dessous.',
            paymentAccount: 'Compte de paiement Sage Intacct',
            accountingMethods: {
                label: 'Quand exporter',
                description: 'Choisissez quand exporter les dépenses :',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Comptabilité d’exercice',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Espèces',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Les dépenses payées de votre poche seront exportées une fois la validation finale effectuée',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Les dépenses payées de votre poche seront exportées une fois réglées',
                },
            },
        },
        netsuite: {
            subsidiary: 'Filiale',
            subsidiarySelectDescription: 'Choisissez la filiale dans NetSuite à partir de laquelle vous souhaitez importer des données.',
            exportDescription: 'Configurez la façon dont les données Expensify sont exportées vers NetSuite.',
            exportInvoices: 'Exporter les factures vers',
            journalEntriesTaxPostingAccount: 'Compte de comptabilisation de la taxe des écritures comptables',
            journalEntriesProvTaxPostingAccount: 'Compte de comptabilisation de la taxe provinciale pour les écritures de journal',
            foreignCurrencyAmount: 'Exporter le montant en devise étrangère',
            exportToNextOpenPeriod: 'Exporter vers la prochaine période ouverte',
            nonReimbursableJournalPostingAccount: 'Compte de comptabilisation des écritures non remboursables',
            reimbursableJournalPostingAccount: 'Compte de comptabilisation des écritures remboursables',
            journalPostingPreference: {
                label: 'Préférence de comptabilisation des écritures de journal',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Une seule ligne détaillée pour chaque rapport',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Entrée unique pour chaque dépense',
                },
            },
            invoiceItem: {
                label: 'Élément de facture',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Créez-en un pour moi',
                        description: 'Nous créerons une « ligne de facture Expensify » pour vous lors de l’exportation (si elle n’existe pas déjà).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Sélectionner existant',
                        description: 'Nous associerons les factures d’Expensify à l’élément sélectionné ci-dessous.',
                    },
                },
            },
            exportDate: {
                label: 'Date d’exportation',
                description: 'Utiliser cette date lors de l’exportation des rapports vers NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente figurant sur le rapport.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Date d’exportation',
                        description: 'Date à laquelle le rapport a été exporté vers NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date à laquelle le rapport a été soumis pour approbation.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Notes de frais',
                        reimbursableDescription: 'Les dépenses hors trésorerie seront exportées en tant que notes de frais vers NetSuite.',
                        nonReimbursableDescription: 'Les dépenses des cartes d’entreprise seront exportées vers NetSuite sous forme de notes de frais.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Factures fournisseur',
                        reimbursableDescription: dedent(`
                            Les dépenses hors trésorerie seront exportées en tant que factures payables au fournisseur NetSuite spécifié ci-dessous.

                            Si vous souhaitez définir un fournisseur spécifique pour chaque carte, allez dans *Paramètres > Domaines > Cartes de société*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Les dépenses de carte d’entreprise seront exportées en tant que factures à payer au fournisseur NetSuite indiqué ci-dessous.

                            Si vous souhaitez définir un fournisseur spécifique pour chaque carte, accédez à *Paramètres > Domaines > Cartes d’entreprise*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Écritures comptables',
                        reimbursableDescription: dedent(`
                            Les dépenses payées de votre poche seront exportées en tant qu’écritures de journal vers le compte NetSuite spécifié ci-dessous.

                            Si vous souhaitez définir un fournisseur spécifique pour chaque carte, rendez-vous dans *Paramètres > Domaines > Cartes de société*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Les dépenses effectuées avec les cartes de société seront exportées en tant qu’écritures de journal vers le compte NetSuite spécifié ci-dessous.

                            Si vous souhaitez définir un fournisseur spécifique pour chaque carte, allez dans *Paramètres > Domaines > Cartes de société*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Si vous basculez le paramètre d’exportation des cartes d’entreprise vers les notes de frais, les fournisseurs NetSuite et les comptes de comptabilisation pour les cartes individuelles seront désactivés.\n\nNe vous inquiétez pas, nous conserverons vos sélections précédentes au cas où vous souhaiteriez revenir en arrière plus tard.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec NetSuite chaque jour.',
                reimbursedReportsDescription: 'Chaque fois qu’un rapport est payé via Expensify ACH, le règlement de facture correspondant sera créé dans le compte NetSuite ci-dessous.',
                reimbursementsAccount: 'Compte de remboursement',
                reimbursementsAccountDescription: 'Choisissez le compte bancaire que vous utiliserez pour les remboursements, et nous créerons le paiement associé dans NetSuite.',
                collectionsAccount: 'Compte de recouvrement',
                collectionsAccountDescription: 'Une fois qu’une facture est marquée comme payée dans Expensify et exportée vers NetSuite, elle apparaîtra dans le compte ci-dessous.',
                approvalAccount: 'Compte d’approbation des comptes fournisseurs',
                approvalAccountDescription:
                    'Choisissez le compte sur lequel les transactions seront approuvées dans NetSuite. Si vous synchronisez des rapports remboursés, c’est également le compte sur lequel les paiements de facture seront créés.',
                defaultApprovalAccount: 'Valeur par défaut NetSuite',
                inviteEmployees: 'Inviter des employés et définir les validations',
                inviteEmployeesDescription:
                    'Importer les dossiers d’employés NetSuite et inviter des employés dans cet espace de travail. Votre flux d’approbation sera, par défaut, configuré sur l’approbation par le responsable et pourra être davantage personnalisé sur la page *Membres*.',
                autoCreateEntities: 'Créer automatiquement des employés/fournisseurs',
                enableCategories: 'Activer les catégories nouvellement importées',
                customFormID: 'ID de formulaire personnalisé',
                customFormIDDescription:
                    'Par défaut, Expensify créera des écritures en utilisant le modèle de transaction préféré défini dans NetSuite. Vous pouvez également désigner un modèle de transaction spécifique à utiliser.',
                customFormIDReimbursable: 'Dépense personnelle',
                customFormIDNonReimbursable: 'Dépense par carte d’entreprise',
                exportReportsTo: {
                    label: 'Niveau d’approbation du rapport de dépenses',
                    description:
                        'Une fois qu’un rapport de dépenses est approuvé dans Expensify et exporté vers NetSuite, vous pouvez définir un niveau d’approbation supplémentaire dans NetSuite avant la comptabilisation.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Préférence par défaut NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Uniquement approuvé par le superviseur',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Uniquement comptabilité approuvée',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Superviseur et comptabilité approuvés',
                    },
                },
                accountingMethods: {
                    label: 'Quand exporter',
                    description: 'Choisissez quand exporter les dépenses :',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Comptabilité d’exercice',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Espèces',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Les dépenses payées de votre poche seront exportées une fois la validation finale effectuée',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Les dépenses payées de votre poche seront exportées une fois réglées',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Niveau d’approbation de la facture fournisseur',
                    description:
                        'Une fois qu’une facture fournisseur est approuvée dans Expensify et exportée vers NetSuite, vous pouvez définir un niveau d’approbation supplémentaire dans NetSuite avant la comptabilisation.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Préférence par défaut NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'En attente d’approbation',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Approuvé pour publication',
                    },
                },
                exportJournalsTo: {
                    label: 'Niveau d’approbation de l’écriture de journal',
                    description:
                        'Une fois qu’une écriture de journal est approuvée dans Expensify et exportée vers NetSuite, vous pouvez définir un niveau d’approbation supplémentaire dans NetSuite avant la comptabilisation.',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Préférence par défaut NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'En attente d’approbation',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Approuvé pour publication',
                    },
                },
                error: {
                    customFormID: 'Veuillez saisir un ID de formulaire personnalisé numérique valide',
                },
            },
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: 'Veuillez ajouter le compte dans NetSuite et synchroniser de nouveau la connexion',
            noVendorsFound: 'Aucun fournisseur trouvé',
            noVendorsFoundDescription: 'Veuillez ajouter des fournisseurs dans NetSuite, puis synchroniser de nouveau la connexion',
            noItemsFound: 'Aucun élément de facture trouvé',
            noItemsFoundDescription: 'Veuillez ajouter des articles de facture dans NetSuite, puis synchroniser à nouveau la connexion',
            noSubsidiariesFound: 'Aucune filiale trouvée',
            noSubsidiariesFoundDescription: 'Veuillez ajouter une filiale dans NetSuite et synchroniser à nouveau la connexion',
            tokenInput: {
                title: 'Configuration NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Installer le bundle Expensify',
                        description: 'Dans NetSuite, allez à *Customization > SuiteBundler > Search & Install Bundles* > recherchez « Expensify » > installez le bundle.',
                    },
                    enableTokenAuthentication: {
                        title: 'Activer l’authentification basée sur des jetons',
                        description: 'Dans NetSuite, accédez à *Setup > Company > Enable Features > SuiteCloud* > activez *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Activer les services web SOAP',
                        description: 'Dans NetSuite, allez dans *Setup > Company > Enable Features > SuiteCloud* > activez *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Créer un jeton d’accès',
                        description:
                            'Dans NetSuite, allez dans *Setup > Users/Roles > Access Tokens* > créez un jeton d’accès pour l’application « Expensify » et pour le rôle « Expensify Integration » ou « Administrator ».\n\n*Important :* Assurez-vous d’enregistrer l’*ID de jeton* et le *secret de jeton* de cette étape. Vous en aurez besoin pour l’étape suivante.',
                    },
                    enterCredentials: {
                        title: 'Saisissez vos identifiants NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'ID de compte NetSuite',
                            netSuiteTokenID: 'ID de jeton',
                            netSuiteTokenSecret: 'Secret du jeton',
                        },
                        netSuiteAccountIDDescription: 'Dans NetSuite, allez dans *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Catégories de dépenses',
                expenseCategoriesDescription: 'Vos catégories de dépenses NetSuite seront importées dans Expensify en tant que catégories.',
                crossSubsidiaryCustomers: 'Clients/projets inter-filiales',
                importFields: {
                    departments: {
                        title: 'Départements',
                        subtitle: 'Choisissez comment gérer les *departments* NetSuite dans Expensify.',
                    },
                    classes: {
                        title: 'Classes',
                        subtitle: 'Choisissez comment gérer les *classes* dans Expensify.',
                    },
                    locations: {
                        title: 'Lieux',
                        subtitle: 'Choisissez comment gérer les *lieux* dans Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Clients/projets',
                    subtitle: 'Choisissez comment gérer les *clients* et les *projets* NetSuite dans Expensify.',
                    importCustomers: 'Importer des clients',
                    importJobs: 'Importer des projets',
                    customers: 'clients',
                    jobs: 'projets',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('et')}, ${importType}`,
                },
                importTaxDescription: 'Importer des groupes de taxes depuis NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Choisissez une option ci-dessous :',
                    label: ({importedTypes}: ImportedTypesParams) => `Importé en tant que ${importedTypes.join('et')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Veuillez saisir le ${fieldName}`,
                    customSegments: {
                        title: 'Segments/enregistrements personnalisés',
                        addText: 'Ajouter un segment/enregistrement personnalisé',
                        recordTitle: 'Segment/enregistrement personnalisé',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Afficher les instructions détaillées',
                        helpText: 'sur la configuration de segments/enregistrements personnalisés.',
                        emptyTitle: 'Ajouter un segment personnalisé ou un enregistrement personnalisé',
                        fields: {
                            segmentName: 'Nom',
                            internalID: 'ID interne',
                            scriptID: 'ID du script',
                            customRecordScriptID: 'ID de la colonne de transaction',
                            mapping: 'Affiché comme',
                        },
                        removeTitle: 'Supprimer le segment/enregistrement personnalisé',
                        removePrompt: 'Voulez-vous vraiment supprimer ce segment/enregistrement personnalisé ?',
                        addForm: {
                            customSegmentName: 'nom de segment personnalisé',
                            customRecordName: 'nom d’enregistrement personnalisé',
                            segmentTitle: 'Segment personnalisé',
                            customSegmentAddTitle: 'Ajouter un segment personnalisé',
                            customRecordAddTitle: 'Ajouter un enregistrement personnalisé',
                            recordTitle: 'Enregistrement personnalisé',
                            segmentRecordType: 'Voulez-vous ajouter un segment personnalisé ou un enregistrement personnalisé ?',
                            customSegmentNameTitle: 'Quel est le nom du segment personnalisé ?',
                            customRecordNameTitle: 'Quel est le nom de l’enregistrement personnalisé ?',
                            customSegmentNameFooter: `Vous pouvez trouver les noms de segments personnalisés dans NetSuite sous la page *Customizations > Links, Records & Fields > Custom Segments*.

_Pour des instructions plus détaillées, [visitez notre site d’aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Vous pouvez trouver les noms d’enregistrements personnalisés dans NetSuite en saisissant « Transaction Column Field » dans la recherche globale.

_Pour des instructions plus détaillées, [visitez notre site d’aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Quel est l’ID interne ?',
                            customSegmentInternalIDFooter: `Tout d’abord, assurez-vous d’avoir activé les IDs internes dans NetSuite sous *Home > Set Preferences > Show Internal ID.*

Vous pouvez trouver les IDs internes des segments personnalisés dans NetSuite sous :

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Cliquez sur un segment personnalisé.
3. Cliquez sur le lien hypertexte à côté de *Custom Record Type*.
4. Trouvez l’ID interne dans le tableau en bas.

_Pour des instructions plus détaillées, [visitez notre site d’aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Vous pouvez trouver les ID internes d’enregistrements personnalisés dans NetSuite en suivant ces étapes :

1. Saisissez « Transaction Line Fields » dans la recherche globale.
2. Cliquez sur un enregistrement personnalisé.
3. Trouvez l’ID interne sur le côté gauche.

_Pour des instructions plus détaillées, [visitez notre site d’aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Quel est l’ID de script ?',
                            customSegmentScriptIDFooter: `Vous pouvez trouver les IDs de script de segments personnalisés dans NetSuite sous : 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Cliquez sur un segment personnalisé.
3. Cliquez sur l’onglet *Application and Sourcing* en bas de la page, puis :
    a. Si vous souhaitez afficher le segment personnalisé en tant que *tag* (au niveau de la ligne) dans Expensify, cliquez sur le sous-onglet *Transaction Columns* et utilisez le *Field ID*.
    b. Si vous souhaitez afficher le segment personnalisé en tant que *report field* (au niveau du rapport) dans Expensify, cliquez sur le sous-onglet *Transactions* et utilisez le *Field ID*.

_Pour des instructions plus détaillées, [visitez notre site d’aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Quel est l’ID de la colonne de transaction ?',
                            customRecordScriptIDFooter: `Vous pouvez trouver les ID de script d’enregistrement personnalisé dans NetSuite sous :

1. Saisissez « Transaction Line Fields » dans la recherche globale.
2. Cliquez sur un enregistrement personnalisé.
3. Trouvez l’ID de script sur le côté gauche.

_Pour des instructions plus détaillées, [visitez notre site d’aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: 'Comment ce segment personnalisé doit-il être affiché dans Expensify ?',
                            customRecordMappingTitle: 'Comment cet enregistrement personnalisé doit-il être affiché dans Expensify ?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Un segment/enregistrement personnalisé avec cet(te) ${fieldName?.toLowerCase()} existe déjà`,
                        },
                    },
                    customLists: {
                        title: 'Listes personnalisées',
                        addText: 'Ajouter une liste personnalisée',
                        recordTitle: 'Liste personnalisée',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Afficher les instructions détaillées',
                        helpText: 'sur la configuration de listes personnalisées.',
                        emptyTitle: 'Ajouter une liste personnalisée',
                        fields: {
                            listName: 'Nom',
                            internalID: 'ID interne',
                            transactionFieldID: 'ID du champ de transaction',
                            mapping: 'Affiché comme',
                        },
                        removeTitle: 'Supprimer la liste personnalisée',
                        removePrompt: 'Voulez-vous vraiment supprimer cette liste personnalisée ?',
                        addForm: {
                            listNameTitle: 'Choisir une liste personnalisée',
                            transactionFieldIDTitle: 'Quel est l’ID du champ de transaction ?',
                            transactionFieldIDFooter: `Vous pouvez trouver les ID de champs de transaction dans NetSuite en suivant ces étapes :

1. Saisissez « Transaction Line Fields » dans la recherche globale.
2. Cliquez sur une liste personnalisée.
3. Trouvez l’ID du champ de transaction sur le côté gauche.

_Pour des instructions plus détaillées, [visitez notre site d’aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: 'Comment cette liste personnalisée doit-elle être affichée dans Expensify ?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Une liste personnalisée avec cet ID de champ de transaction existe déjà`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Valeur par défaut de l’employé NetSuite',
                        description: 'Non importé dans Expensify, appliqué à l’exportation',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `Si vous utilisez ${importField} dans NetSuite, nous appliquerons la valeur par défaut définie sur la fiche employé lors de l’exportation vers le rapport de dépenses ou l’écriture de journal.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Étiquettes',
                        description: 'Au niveau des postes',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} sera sélectionnable pour chaque dépense individuelle sur le rapport d’un employé.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Champs de rapport',
                        description: 'Niveau du rapport',
                        footerContent: ({importField}: ImportFieldParams) => `La sélection ${startCase(importField)} sera appliquée à toutes les dépenses du rapport d’un employé.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Configuration de Sage Intacct',
            prerequisitesTitle: 'Avant de vous connecter…',
            downloadExpensifyPackage: 'Télécharger le package Expensify pour Sage Intacct',
            followSteps: 'Suivez les étapes de nos instructions « Guide pratique : Se connecter à Sage Intacct »',
            enterCredentials: 'Saisissez vos identifiants Sage Intacct',
            entity: 'Entité',
            employeeDefault: 'Valeur par défaut de l’employé Sage Intacct',
            employeeDefaultDescription: "Le service par défaut de l'employé sera appliqué à ses notes de frais dans Sage Intacct si un service par défaut existe.",
            displayedAsTagDescription: 'Le service sera sélectionnable pour chaque dépense individuelle sur le rapport d’un employé.',
            displayedAsReportFieldDescription: 'La sélection du département s’appliquera à toutes les dépenses figurant sur le rapport d’un employé.',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Choisissez comment gérer Sage Intacct <strong>${mappingTitle}</strong> dans Expensify.`,
            expenseTypes: 'Types de dépenses',
            expenseTypesDescription: 'Vos types de dépenses Sage Intacct seront importés dans Expensify en tant que catégories.',
            accountTypesDescription: 'Votre plan comptable Sage Intacct sera importé dans Expensify en tant que catégories.',
            importTaxDescription: 'Importer le taux de taxe d’achat depuis Sage Intacct.',
            userDefinedDimensions: 'Dimensions définies par l’utilisateur',
            addUserDefinedDimension: 'Ajouter une dimension définie par l’utilisateur',
            integrationName: 'Nom de l’intégration',
            dimensionExists: 'Une dimension portant ce nom existe déjà.',
            removeDimension: 'Supprimer la dimension définie par l’utilisateur',
            removeDimensionPrompt: 'Êtes-vous sûr de vouloir supprimer cette dimension définie par l’utilisateur ?',
            userDefinedDimension: 'Dimension définie par l’utilisateur',
            addAUserDefinedDimension: 'Ajouter une dimension définie par l’utilisateur',
            detailedInstructionsLink: 'Afficher les instructions détaillées',
            detailedInstructionsRestOfSentence: 'sur l’ajout de dimensions définies par l’utilisateur.',
            userDimensionsAdded: () => ({
                one: '1 UDD ajouté',
                other: (count: number) => `${count} UDD ajoutés`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'services';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'Classes';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'emplacements';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'clients';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'projets (missions)';
                    default:
                        return 'correspondances';
                }
            },
        },
        type: {
            free: 'Gratuit',
            control: 'Contrôle',
            collect: 'Encaisser',
        },
        companyCards: {
            addCards: 'Ajouter des cartes',
            selectCards: 'Sélectionner des cartes',
            addNewCard: {
                other: 'Autre',
                cardProviders: {
                    gl1025: 'Cartes Corporate American Express',
                    cdf: 'Cartes commerciales Mastercard',
                    vcf: 'Cartes commerciales Visa',
                    stripe: 'Cartes Stripe',
                },
                yourCardProvider: `Qui est votre fournisseur de carte ?`,
                whoIsYourBankAccount: 'Quelle est votre banque ?',
                whereIsYourBankLocated: 'Où se trouve votre banque ?',
                howDoYouWantToConnect: 'Comment souhaitez-vous vous connecter à votre banque ?',
                learnMoreAboutOptions: `<muted-text>En savoir plus sur ces <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">options</a>.</muted-text>`,
                commercialFeedDetails:
                    'Nécessite une configuration avec votre banque. Cette option est généralement utilisée par les grandes entreprises et est souvent la meilleure solution si vous y êtes éligible.',
                commercialFeedPlaidDetails: `Nécessite une configuration avec votre banque, mais nous vous guiderons. Ceci est généralement réservé aux grandes entreprises.`,
                directFeedDetails: 'L’approche la plus simple. Connectez-vous immédiatement avec vos identifiants principaux. Cette méthode est la plus courante.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Activez votre flux ${provider}`,
                    heading:
                        'Nous avons une intégration directe avec l’émetteur de votre carte et pouvons importer rapidement et avec précision les données de vos transactions dans Expensify.\n\nPour commencer, il vous suffit de :',
                    visa: 'Nous avons des intégrations globales avec Visa, bien que l’éligibilité varie selon la banque et le programme de carte.\n\nPour commencer, il vous suffit de :',
                    mastercard:
                        'Nous proposons des intégrations globales avec Mastercard, bien que l’éligibilité varie selon la banque et le programme de carte.\n\nPour commencer, il vous suffit de :',
                    vcf: `1. Consultez [cet article d’aide](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) pour des instructions détaillées sur la configuration de vos Visa Commercial Cards.

2. [Contactez votre banque](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) pour vérifier qu’elle prend en charge un flux commercial pour votre programme, et demandez-lui de l’activer.

3. *Une fois le flux activé et que vous disposez de ses informations, passez à l’écran suivant.*`,
                    gl1025: `1. Consultez [cet article d’aide](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) pour savoir si American Express peut activer un flux commercial pour votre programme.

2. Une fois le flux activé, Amex vous enverra une lettre de mise en production.

3. *Une fois que vous disposez des informations sur le flux, passez à l’écran suivant.*`,
                    cdf: `1. Consultez [cet article d’aide](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) pour des instructions détaillées sur la configuration de vos Mastercard Commercial Cards.

2. [Contactez votre banque](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) pour vérifier qu’elle prend en charge un flux commercial pour votre programme, et demandez-lui de l’activer.

3. *Une fois que le flux est activé et que vous disposez de ses détails, passez à l’écran suivant.*`,
                    stripe: `1. Visitez le tableau de bord de Stripe et allez dans [Paramètres](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Sous Intégrations de produits, cliquez sur Activer à côté de Expensify.

3. Une fois le flux activé, cliquez sur Envoyer ci-dessous et nous commencerons à l’ajouter.`,
                },
                whatBankIssuesCard: 'Quelle banque émet ces cartes ?',
                enterNameOfBank: 'Saisissez le nom de la banque',
                feedDetails: {
                    vcf: {
                        title: 'Quelles sont les informations du flux Visa ?',
                        processorLabel: 'ID du processeur',
                        bankLabel: 'Identifiant de l’établissement financier (banque)',
                        companyLabel: 'ID d’entreprise',
                        helpLabel: 'Où puis-je trouver ces identifiants ?',
                    },
                    gl1025: {
                        title: `Quel est le nom du fichier de livraison Amex ?`,
                        fileNameLabel: 'Nom du fichier de livraison',
                        helpLabel: 'Où puis-je trouver le nom du fichier de livraison ?',
                    },
                    cdf: {
                        title: `Quel est l’ID de distribution Mastercard ?`,
                        distributionLabel: 'ID de distribution',
                        helpLabel: 'Où puis-je trouver l’ID de distribution ?',
                    },
                },
                amexCorporate: 'Sélectionnez ceci si le recto de vos cartes indique « Corporate »',
                amexBusiness: 'Sélectionnez cette option si le recto de vos cartes indique « Business »',
                amexPersonal: 'Sélectionnez ceci si vos cartes sont personnelles',
                error: {
                    pleaseSelectProvider: 'Veuillez sélectionner un fournisseur de carte avant de continuer',
                    pleaseSelectBankAccount: 'Veuillez sélectionner un compte bancaire avant de continuer',
                    pleaseSelectBank: 'Veuillez sélectionner une banque avant de continuer',
                    pleaseSelectCountry: 'Veuillez sélectionner un pays avant de continuer',
                    pleaseSelectFeedType: 'Veuillez sélectionner un type de flux avant de continuer',
                },
                exitModal: {
                    title: 'Un problème ?',
                    prompt: 'Nous avons remarqué que vous n’avez pas terminé d’ajouter vos cartes. Si vous avez rencontré un problème, faites-le-nous savoir afin que nous puissions vous aider à tout remettre sur les rails.',
                    confirmText: 'Signaler un problème',
                    cancelText: 'Ignorer',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Dernier jour du mois',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Dernier jour ouvrable du mois',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Jour du mois personnalisé',
            },
            assignCard: 'Attribuer la carte',
            findCard: 'Trouver une carte',
            cardNumber: 'Numéro de carte',
            commercialFeed: 'Flux commercial',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `Cartes ${feedName}`,
            directFeed: 'Flux direct',
            whoNeedsCardAssigned: 'Qui a besoin d’une carte attribuée ?',
            chooseCard: 'Choisissez une carte',
            chooseCardFor: ({assignee}: AssigneeParams) =>
                `Choisissez une carte pour <strong>${assignee}</strong>. Vous ne trouvez pas la carte que vous cherchez ? <concierge-link>Faites-le nous savoir.</concierge-link>`,
            noActiveCards: 'Aucune carte active dans ce flux',
            somethingMightBeBroken:
                '<muted-text><centered-text>Ou il se peut que quelque chose soit cassé. Dans tous les cas, si vous avez des questions, il vous suffit de <concierge-link>contacter Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Choisissez une date de début de transaction',
            startDateDescription: 'Nous importerons toutes les transactions à partir de cette date. Si aucune date n’est spécifiée, nous remonterons aussi loin que votre banque le permet.',
            fromTheBeginning: 'Depuis le début',
            customStartDate: 'Date de début personnalisée',
            customCloseDate: 'Date de clôture personnalisée',
            letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
            confirmationDescription: 'Nous commencerons immédiatement à importer les transactions.',
            cardholder: 'Titulaire de carte',
            card: 'Carte',
            cardName: 'Nom de la carte',
            brokenConnectionError:
                '<rbr>La connexion au flux de carte est interrompue. Veuillez <a href="#">vous connecter à votre banque</a> afin que nous puissions rétablir la connexion.</rbr>',
            assignedCard: ({assignee, link}: AssignedCardParams) => `a attribué un(e) ${link} à ${assignee} ! Les transactions importées apparaîtront dans cette discussion.`,
            companyCard: 'carte d’entreprise',
            chooseCardFeed: 'Choisir le flux de carte',
            ukRegulation:
                'Expensify Limited est un agent de Plaid Financial Ltd., un établissement de paiement autorisé, réglementé par la Financial Conduct Authority au titre du Payment Services Regulations 2017 (numéro de référence de l’entreprise : 804718). Plaid vous fournit, par l’intermédiaire d’Expensify Limited en tant que son agent, des services réglementés d’information sur les comptes.',
        },
        expensifyCard: {
            issueAndManageCards: 'Émettre et gérer vos cartes Expensify',
            getStartedIssuing: 'Commencez en émettant votre première carte virtuelle ou physique.',
            verificationInProgress: 'Vérification en cours…',
            verifyingTheDetails: 'Nous vérifions quelques détails. Concierge vous informera lorsque les cartes Expensify seront prêtes à être émises.',
            disclaimer:
                'La carte commerciale Expensify Visa® est émise par The Bancorp Bank, N.A., membre FDIC, en vertu d’une licence de Visa U.S.A. Inc. et peut ne pas être acceptée chez tous les commerçants acceptant les cartes Visa. Apple® et le logo Apple® sont des marques d’Apple Inc., déposées aux États-Unis et dans d’autres pays. App Store est une marque de service d’Apple Inc. Google Play et le logo Google Play sont des marques de Google LLC.',
            euUkDisclaimer:
                'Les cartes fournies aux résidents de l’EEE sont émises par Transact Payments Malta Limited et les cartes fournies aux résidents du Royaume‑Uni sont émises par Transact Payments Limited en vertu d’une licence accordée par Visa Europe Limited. Transact Payments Malta Limited est dûment autorisée et réglementée par la Malta Financial Services Authority en tant qu’institution financière au titre du Financial Institution Act 1994. Numéro d’enregistrement C 91879. Transact Payments Limited est autorisée et réglementée par la Gibraltar Financial Service Commission.',
            issueCard: 'Émettre une carte',
            findCard: 'Trouver une carte',
            newCard: 'Nouvelle carte',
            name: 'Nom',
            lastFour: '4 derniers',
            limit: 'Limite',
            currentBalance: 'Solde actuel',
            currentBalanceDescription: 'Le solde actuel est la somme de toutes les transactions Expensify Card comptabilisées depuis la dernière date de règlement.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Le solde sera réglé le ${settlementDate}`,
            settleBalance: 'Régler le solde',
            cardLimit: 'Plafond de la carte',
            remainingLimit: 'Limite restante',
            requestLimitIncrease: 'Augmenter la limite de demandes',
            remainingLimitDescription:
                'Nous prenons en compte plusieurs facteurs pour calculer votre limite restante : votre ancienneté en tant que client, les informations professionnelles que vous avez fournies lors de votre inscription, ainsi que la trésorerie disponible sur votre compte bancaire professionnel. Votre limite restante peut fluctuer quotidiennement.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Le solde de remise en argent est basé sur les dépenses réglées mensuelles de la Carte Expensify dans l’ensemble de votre espace de travail.',
            issueNewCard: 'Émettre une nouvelle carte',
            finishSetup: 'Terminer la configuration',
            chooseBankAccount: 'Choisir un compte bancaire',
            chooseExistingBank: 'Choisissez un compte bancaire professionnel existant pour payer le solde de votre carte Expensify, ou ajoutez un nouveau compte bancaire',
            accountEndingIn: 'Compte se terminant par',
            addNewBankAccount: 'Ajouter un nouveau compte bancaire',
            settlementAccount: 'Compte de règlement',
            settlementAccountDescription: 'Choisissez un compte pour payer le solde de votre carte Expensify.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Assurez-vous que ce compte correspond à votre <a href="${reconciliationAccountSettingsLink}">compte de rapprochement</a> (${accountNumber}) afin que le rapprochement continu fonctionne correctement.`,
            settlementFrequency: 'Fréquence de règlement',
            settlementFrequencyDescription: 'Choisissez la fréquence à laquelle vous règlerez le solde de votre carte Expensify.',
            settlementFrequencyInfo:
                'Si vous souhaitez passer à un règlement mensuel, vous devrez connecter votre compte bancaire via Plaid et disposer d’un historique de solde positif sur 90 jours.',
            frequency: {
                daily: 'Quotidien',
                monthly: 'Mensuel',
            },
            cardDetails: 'Détails de la carte',
            cardPending: ({name}: {name: string}) => `La carte est actuellement en attente et sera émise une fois le compte de ${name} validé.`,
            virtual: 'Virtuel',
            physical: 'Physique',
            deactivate: 'Désactiver la carte',
            changeCardLimit: 'Modifier la limite de la carte',
            changeLimit: 'Modifier la limite',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Si vous modifiez la limite de cette carte à ${limit}, les nouvelles transactions seront refusées jusqu’à ce que vous approuviez plus de dépenses sur la carte.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) =>
                `Si vous modifiez le plafond de cette carte à ${limit}, les nouvelles transactions seront refusées jusqu’au mois prochain.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Si vous changez la limite de cette carte à ${limit}, les nouvelles transactions seront refusées.`,
            changeCardLimitType: 'Modifier le type de limite de carte',
            changeLimitType: 'Modifier le type de limite',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Si vous changez le type de limite de cette carte en Limite intelligente, les nouvelles transactions seront refusées car la limite non approuvée de ${limit} a déjà été atteinte.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Si vous changez le type de limite de cette carte en Mensuelle, les nouvelles transactions seront refusées, car la limite mensuelle de ${limit} a déjà été atteinte.`,
            addShippingDetails: 'Ajouter les détails d’expédition',
            issuedCard: ({assignee}: AssigneeParams) => `a émis une carte Expensify à ${assignee} ! La carte arrivera dans 2 à 3 jours ouvrables.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) =>
                `a émis une Carte Expensify à ${assignee} ! La carte sera expédiée une fois les informations de livraison confirmées.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `a délivré à ${assignee} une carte Expensify virtuelle ! Le ${link} peut être utilisé immédiatement.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} a ajouté les informations de livraison. La carte Expensify arrivera dans 2 à 3 jours ouvrés.`,
            replacedCard: ({assignee}: AssigneeParams) => `${assignee} a remplacé sa carte Expensify. La nouvelle carte arrivera dans 2 à 3 jours ouvrables.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} a remplacé sa carte Expensify virtuelle ! Le ${link} peut être utilisé immédiatement.`,
            card: 'carte',
            replacementCard: 'carte de remplacement',
            verifyingHeader: 'Vérification',
            bankAccountVerifiedHeader: 'Compte bancaire vérifié',
            verifyingBankAccount: 'Vérification du compte bancaire...',
            verifyingBankAccountDescription: 'Veuillez patienter pendant que nous confirmons que ce compte peut être utilisé pour émettre des cartes Expensify.',
            bankAccountVerified: 'Compte bancaire vérifié !',
            bankAccountVerifiedDescription: 'Vous pouvez désormais délivrer des cartes Expensify aux membres de votre espace de travail.',
            oneMoreStep: 'Encore une étape…',
            oneMoreStepDescription: 'Il semble que nous devions vérifier votre compte bancaire manuellement. Veuillez vous rendre sur Concierge, où vos instructions vous attendent.',
            gotIt: 'Compris',
            goToConcierge: 'Aller à Concierge',
        },
        categories: {
            deleteCategories: 'Supprimer les catégories',
            deleteCategoriesPrompt: 'Voulez-vous vraiment supprimer ces catégories ?',
            deleteCategory: 'Supprimer la catégorie',
            deleteCategoryPrompt: 'Voulez-vous vraiment supprimer cette catégorie ?',
            disableCategories: 'Désactiver les catégories',
            disableCategory: 'Désactiver la catégorie',
            enableCategories: 'Activer les catégories',
            enableCategory: 'Activer la catégorie',
            defaultSpendCategories: 'Catégories de dépense par défaut',
            spendCategoriesDescription: 'Personnalisez la façon dont les dépenses des commerçants sont catégorisées pour les transactions par carte de crédit et les reçus numérisés.',
            deleteFailureMessage: "Une erreur s'est produite lors de la suppression de la catégorie, veuillez réessayer",
            categoryName: 'Nom de catégorie',
            requiresCategory: 'Les membres doivent catégoriser toutes les dépenses',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Toutes les dépenses doivent être catégorisées afin d’être exportées vers ${connectionName}.`,
            subtitle: 'Obtenez une meilleure vue d’ensemble de l’endroit où l’argent est dépensé. Utilisez nos catégories par défaut ou ajoutez les vôtres.',
            emptyCategories: {
                title: 'Vous n’avez créé aucune catégorie',
                subtitle: 'Ajoutez une catégorie pour organiser vos dépenses.',
                subtitleWithAccounting: ({accountingPageURL}: EmptyCategoriesSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>Vos catégories sont actuellement importées depuis une connexion comptable. Rendez-vous sur la page <a href="${accountingPageURL}">comptabilité</a> pour effectuer des modifications.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Une erreur s’est produite lors de la mise à jour de la catégorie, veuillez réessayer',
            createFailureMessage: 'Une erreur s’est produite lors de la création de la catégorie, veuillez réessayer',
            addCategory: 'Ajouter une catégorie',
            editCategory: 'Modifier la catégorie',
            editCategories: 'Modifier les catégories',
            findCategory: 'Rechercher une catégorie',
            categoryRequiredError: 'Le nom de la catégorie est requis',
            existingCategoryError: 'Une catégorie portant ce nom existe déjà',
            invalidCategoryName: 'Nom de catégorie invalide',
            importedFromAccountingSoftware: 'Les catégories ci-dessous sont importées depuis votre',
            payrollCode: 'Code de paie',
            updatePayrollCodeFailureMessage: 'Une erreur s’est produite lors de la mise à jour du code de paie, veuillez réessayer.',
            glCode: 'Code de grand livre',
            updateGLCodeFailureMessage: 'Une erreur s’est produite lors de la mise à jour du code GL, veuillez réessayer',
            importCategories: 'Importer des catégories',
            cannotDeleteOrDisableAllCategories: {
                title: 'Impossible de supprimer ou de désactiver toutes les catégories',
                description: `Au moins une catégorie doit rester activée, car votre espace de travail exige des catégories.`,
            },
        },
        moreFeatures: {
            subtitle:
                'Utilisez les commutateurs ci-dessous pour activer davantage de fonctionnalités à mesure que vous grandissez. Chaque fonctionnalité apparaîtra dans le menu de navigation pour une personnalisation plus poussée.',
            spendSection: {
                title: 'Dépenser',
                subtitle: 'Activez des fonctionnalités qui vous aident à développer votre équipe.',
            },
            manageSection: {
                title: 'Gérer',
                subtitle: 'Ajoutez des contrôles qui aident à maintenir les dépenses dans les limites du budget.',
            },
            earnSection: {
                title: 'Gagner',
                subtitle: 'Rationalisez vos revenus et soyez payé plus rapidement.',
            },
            organizeSection: {
                title: 'Organiser',
                subtitle: 'Regroupez et analysez les dépenses, enregistrez chaque taxe payée.',
            },
            integrateSection: {
                title: 'Intégrer',
                subtitle: 'Connectez Expensify aux produits financiers populaires.',
            },
            distanceRates: {
                title: 'Tarifs de distance',
                subtitle: 'Ajouter, mettre à jour et appliquer les taux.',
            },
            perDiem: {
                title: 'Indemnité journalière',
                subtitle: 'Définissez des indemnités journalières pour contrôler les dépenses quotidiennes des employés.',
            },
            expensifyCard: {
                title: 'Carte Expensify',
                subtitle: 'Obtenez des informations et gardez le contrôle sur les dépenses.',
                disableCardTitle: 'Désactiver la carte Expensify',
                disableCardPrompt: 'Vous ne pouvez pas désactiver la carte Expensify, car elle est déjà utilisée. Contactez Concierge pour connaître les prochaines étapes.',
                disableCardButton: 'Discuter avec Concierge',
                feed: {
                    title: 'Obtenir la carte Expensify',
                    subTitle: 'Rationalisez les dépenses de votre entreprise et économisez jusqu’à 50 % sur votre facture Expensify, plus :',
                    features: {
                        cashBack: 'Cashback sur chaque achat aux États-Unis',
                        unlimited: 'Cartes virtuelles illimitées',
                        spend: 'Contrôles de dépenses et plafonds personnalisés',
                    },
                    ctaTitle: 'Émettre une nouvelle carte',
                },
            },
            companyCards: {
                title: 'Cartes d’entreprise',
                subtitle: 'Importer les dépenses à partir des cartes d’entreprise existantes.',
                feed: {
                    title: 'Importer des cartes d’entreprise',
                    features: {
                        support: 'Prise en charge de tous les principaux émetteurs de cartes',
                        assignCards: 'Attribuer des cartes à toute l’équipe',
                        automaticImport: 'Importation automatique de transactions',
                    },
                },
                bankConnectionError: 'Problème de connexion bancaire',
                connectWithPlaid: 'se connecter via Plaid',
                connectWithExpensifyCard: 'essayez la carte Expensify.',
                bankConnectionDescription: `Veuillez réessayer d’ajouter vos cartes. Sinon, vous pouvez`,
                disableCardTitle: 'Désactiver les cartes d’entreprise',
                disableCardPrompt:
                    'Vous ne pouvez pas désactiver les cartes d’entreprise, car cette fonctionnalité est actuellement utilisée. Contactez le Concierge pour connaître les prochaines étapes.',
                disableCardButton: 'Discuter avec Concierge',
                cardDetails: 'Détails de la carte',
                cardNumber: 'Numéro de carte',
                cardholder: 'Titulaire de carte',
                cardName: 'Nom de la carte',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} exportation` : `Export ${integration}`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Choisissez le compte ${integration} vers lequel les transactions doivent être exportées.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Choisissez le compte ${integration} vers lequel les transactions doivent être exportées. Sélectionnez une autre <a href="${exportPageLink}">option d’exportation</a> pour modifier les comptes disponibles.`,
                lastUpdated: 'Dernière mise à jour',
                transactionStartDate: 'Date de début de la transaction',
                updateCard: 'Mettre à jour la carte',
                unassignCard: 'Dissocier la carte',
                unassign: 'Désassigner',
                unassignCardDescription: 'Dissocier cette carte supprimera toutes les transactions figurant sur les rapports au stade de brouillon du compte du titulaire de la carte.',
                assignCard: 'Attribuer la carte',
                cardFeedName: 'Nom du flux de carte',
                cardFeedNameDescription: 'Donnez un nom unique au flux de carte afin de pouvoir le distinguer des autres.',
                cardFeedTransaction: 'Supprimer les transactions',
                cardFeedTransactionDescription: 'Choisissez si les détenteurs de carte peuvent supprimer des transactions par carte. Les nouvelles transactions suivront ces règles.',
                cardFeedRestrictDeletingTransaction: 'Restreindre la suppression des transactions',
                cardFeedAllowDeletingTransaction: 'Autoriser la suppression des transactions',
                removeCardFeed: 'Supprimer le flux de carte',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `Supprimer le flux ${feedName}`,
                removeCardFeedDescription: 'Voulez-vous vraiment supprimer ce flux de cartes ? Cela désassignera toutes les cartes.',
                error: {
                    feedNameRequired: 'Le nom du flux de carte est requis',
                    statementCloseDateRequired: 'Veuillez sélectionner une date de clôture du relevé.',
                },
                corporate: 'Restreindre la suppression des transactions',
                personal: 'Autoriser la suppression des transactions',
                setFeedNameDescription: 'Donnez un nom unique au flux de cartes afin de le distinguer des autres',
                setTransactionLiabilityDescription:
                    'Lorsqu’elle est activée, les titulaires de carte peuvent supprimer des transactions de carte. Les nouvelles transactions suivront cette règle.',
                emptyAddedFeedTitle: 'Attribuer des cartes d’entreprise',
                emptyAddedFeedDescription: 'Commencez en attribuant votre première carte à un membre.',
                pendingFeedTitle: `Nous examinons votre demande...`,
                pendingFeedDescription: `Nous examinons actuellement les détails de votre flux. Une fois cela terminé, nous vous contacterons via`,
                pendingBankTitle: 'Vérifiez la fenêtre de votre navigateur',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `Veuillez vous connecter à ${bankName} via la fenêtre de navigateur qui vient de s’ouvrir. Si aucune ne s’est ouverte,`,
                pendingBankLink: 'veuillez cliquer ici',
                giveItNameInstruction: 'Donnez à la carte un nom qui la distingue des autres.',
                updating: 'Mise à jour...',
                noAccountsFound: 'Aucun compte trouvé',
                defaultCard: 'Carte par défaut',
                downgradeTitle: `Impossible de rétrograder l’espace de travail`,
                downgradeSubTitle: `Cet espace de travail ne peut pas être rétrogradé, car plusieurs flux de cartes sont connectés (hors cartes Expensify). Veuillez <a href="#">ne conserver qu’un seul flux de cartes</a> pour continuer.`,
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `Veuillez ajouter le compte dans ${connection} et synchroniser à nouveau la connexion`,
                expensifyCardBannerTitle: 'Obtenir la carte Expensify',
                expensifyCardBannerSubtitle:
                    'Profitez de remises en argent sur chaque achat aux États-Unis, jusqu’à 50 % de réduction sur votre facture Expensify, de cartes virtuelles illimitées, et bien plus encore.',
                expensifyCardBannerLearnMoreButton: 'En savoir plus',
                statementCloseDateTitle: 'Date de clôture du relevé',
                statementCloseDateDescription: 'Indiquez-nous la date de clôture du relevé de votre carte et nous créerons un relevé correspondant dans Expensify.',
            },
            workflows: {
                title: 'Workflows',
                subtitle: 'Configurez comment les dépenses sont approuvées et payées.',
                disableApprovalPrompt:
                    'Les cartes Expensify de cet espace de travail reposent actuellement sur l’approbation pour définir leurs Smart Limits. Veuillez modifier les types de limite de toutes les cartes Expensify avec Smart Limits avant de désactiver les approbations.',
            },
            invoices: {
                title: 'Factures',
                subtitle: 'Envoyez et recevez des factures.',
            },
            categories: {
                title: 'Catégories',
                subtitle: 'Suivez et organisez les dépenses.',
            },
            tags: {
                title: 'Étiquettes',
                subtitle: 'Classifiez les coûts et suivez les dépenses facturables.',
            },
            taxes: {
                title: 'Taxes',
                subtitle: 'Documentez et récupérez les taxes admissibles.',
            },
            reportFields: {
                title: 'Champs de rapport',
                subtitle: 'Configurer des champs personnalisés pour les dépenses.',
            },
            connections: {
                title: 'Comptabilité',
                subtitle: 'Synchronisez votre plan comptable et plus encore.',
            },
            receiptPartners: {
                title: 'Partenaires de reçus',
                subtitle: 'Importer automatiquement les reçus.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Pas si vite…',
                featureEnabledText: 'Pour activer ou désactiver cette fonctionnalité, vous devez modifier vos paramètres d’import comptable.',
                disconnectText: 'Pour désactiver la comptabilité, vous devez déconnecter votre connexion comptable de votre espace de travail.',
                manageSettings: 'Gérer les paramètres',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Déconnecter Uber',
                disconnectText: 'Pour désactiver cette fonctionnalité, veuillez d’abord déconnecter l’intégration Uber for Business.',
                description: 'Voulez-vous vraiment déconnecter cette intégration ?',
                confirmText: 'Compris',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Pas si vite…',
                featureEnabledText:
                    'Les cartes Expensify de cet espace de travail s’appuient sur des workflows d’approbation pour définir leurs Limites intelligentes.\n\nVeuillez modifier les types de limite de toutes les cartes avec Limites intelligentes avant de désactiver les workflows.',
                confirmText: 'Aller aux cartes Expensify',
            },
            rules: {
                title: 'Règles',
                subtitle: 'Exiger des reçus, signaler les dépenses élevées, et plus encore.',
            },
        },
        reports: {
            reportsCustomTitleExamples: 'Exemples :',
            customReportNamesSubtitle: `<muted-text>Personnalisez les titres de rapport à l’aide de nos <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">formules avancées</a>.</muted-text>`,
            customNameTitle: 'Titre de rapport par défaut',
            customNameDescription: `Choisissez un nom personnalisé pour les notes de frais en utilisant nos <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">formules avancées</a>.`,
            customNameInputLabel: 'Nom',
            customNameEmailPhoneExample: 'E-mail ou téléphone du membre : {report:submit:from}',
            customNameStartDateExample: 'Date de début du rapport : {report:startdate}',
            customNameWorkspaceNameExample: 'Nom de l’espace de travail : {report:workspacename}',
            customNameReportIDExample: 'ID du rapport : {report:id}',
            customNameTotalExample: 'Total : {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Empêcher les membres de modifier les titres de rapports personnalisés',
        },
        reportFields: {
            addField: 'Ajouter un champ',
            delete: 'Supprimer le champ',
            deleteFields: 'Supprimer les champs',
            findReportField: 'Rechercher un champ de rapport',
            deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer ce champ de rapport ?',
            deleteFieldsConfirmation: 'Voulez-vous vraiment supprimer ces champs de rapport ?',
            emptyReportFields: {
                title: 'Vous n’avez créé aucun champ de rapport',
                subtitle: 'Ajoutez un champ personnalisé (texte, date ou liste déroulante) qui apparaît sur les rapports.',
            },
            subtitle: 'Les champs de rapport s’appliquent à toutes les dépenses et peuvent être utiles lorsque vous souhaitez demander des informations supplémentaires.',
            disableReportFields: 'Désactiver les champs de rapport',
            disableReportFieldsConfirmation: 'Êtes-vous sûr(e) ? Les champs de texte et de date seront supprimés et les listes seront désactivées.',
            importedFromAccountingSoftware: 'Les champs de rapport ci-dessous sont importés depuis votre',
            textType: 'Texte',
            dateType: 'Date',
            dropdownType: 'Liste',
            formulaType: 'Formule',
            textAlternateText: 'Ajouter un champ pour la saisie de texte libre.',
            dateAlternateText: 'Ajouter un calendrier pour la sélection de la date.',
            dropdownAlternateText: 'Ajoutez une liste d’options parmi lesquelles choisir.',
            formulaAlternateText: 'Ajouter un champ de formule.',
            nameInputSubtitle: 'Choisissez un nom pour le champ de rapport.',
            typeInputSubtitle: 'Choisissez le type de champ de rapport à utiliser.',
            initialValueInputSubtitle: 'Saisissez une valeur de départ à afficher dans le champ du rapport.',
            listValuesInputSubtitle: 'Ces valeurs apparaîtront dans la liste déroulante du champ de rapport. Les valeurs activées peuvent être sélectionnées par les membres.',
            listInputSubtitle: 'Ces valeurs apparaîtront dans la liste des champs de votre rapport. Les valeurs activées peuvent être sélectionnées par les membres.',
            deleteValue: 'Supprimer la valeur',
            deleteValues: 'Supprimer les valeurs',
            disableValue: 'Désactiver la valeur',
            disableValues: 'Désactiver les valeurs',
            enableValue: 'Activer la valeur',
            enableValues: 'Activer les valeurs',
            emptyReportFieldsValues: {
                title: 'Vous n’avez créé aucune valeur de liste',
                subtitle: 'Ajoutez des valeurs personnalisées à faire apparaître sur les rapports.',
            },
            deleteValuePrompt: 'Voulez-vous vraiment supprimer cette valeur de liste ?',
            deleteValuesPrompt: 'Voulez-vous vraiment supprimer ces valeurs de liste ?',
            listValueRequiredError: 'Veuillez saisir un nom de valeur de liste',
            existingListValueError: 'Une valeur de liste portant ce nom existe déjà',
            editValue: 'Modifier la valeur',
            listValues: 'Lister les valeurs',
            addValue: 'Ajouter une valeur',
            existingReportFieldNameError: 'Un champ de rapport portant ce nom existe déjà',
            reportFieldNameRequiredError: 'Veuillez saisir un nom de champ de rapport',
            reportFieldTypeRequiredError: 'Veuillez choisir un type de champ de rapport',
            circularReferenceError: 'Ce champ ne peut pas faire référence à lui-même. Veuillez le mettre à jour.',
            reportFieldInitialValueRequiredError: 'Veuillez choisir une valeur initiale pour le champ de rapport',
            genericFailureMessage: 'Une erreur s’est produite lors de la mise à jour du champ du rapport. Veuillez réessayer.',
        },
        tags: {
            tagName: 'Nom de la balise',
            requiresTag: 'Les membres doivent étiqueter toutes les dépenses',
            trackBillable: 'Suivre les dépenses facturables',
            customTagName: 'Nom de balise personnalisé',
            enableTag: 'Activer le tag',
            enableTags: 'Activer les tags',
            requireTag: 'Balise requise',
            requireTags: 'Exiger des tags',
            notRequireTags: 'Ne pas exiger',
            disableTag: 'Désactiver l’étiquette',
            disableTags: 'Désactiver les étiquettes',
            addTag: 'Ajouter un tag',
            editTag: 'Modifier l’étiquette',
            editTags: 'Modifier les tags',
            findTag: 'Rechercher un tag',
            subtitle: 'Les tags offrent des moyens plus détaillés de classer les coûts.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: ({importSpreadsheetLink}: DependentMultiLevelTagsSubtitleParams) =>
                `<muted-text>Vous utilisez des <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">catégories dépendantes</a>. Vous pouvez <a href="${importSpreadsheetLink}">réimporter une feuille de calcul</a> pour mettre à jour vos catégories.</muted-text>`,
            emptyTags: {
                title: 'Vous n’avez créé aucun tag',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Ajoutez une étiquette pour suivre les projets, les lieux, les services et plus encore.',
                subtitleHTML: `<muted-text><centered-text>Importez une feuille de calcul pour ajouter des tags permettant de suivre des projets, des sites, des services, et plus encore. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">En savoir plus</a> sur le formatage des fichiers de tags.</centered-text></muted-text>`,
                subtitleWithAccounting: ({accountingPageURL}: EmptyTagsSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>Vos tags sont actuellement importés depuis une connexion de comptabilité. Rendez-vous dans la section <a href="${accountingPageURL}">Comptabilité</a> pour effectuer des modifications.</centered-text></muted-text>`,
            },
            deleteTag: 'Supprimer le tag',
            deleteTags: 'Supprimer les tags',
            deleteTagConfirmation: 'Voulez-vous vraiment supprimer ce tag ?',
            deleteTagsConfirmation: 'Êtes-vous sûr de vouloir supprimer ces tags ?',
            deleteFailureMessage: 'Une erreur s’est produite lors de la suppression du tag, veuillez réessayer',
            tagRequiredError: 'Le nom du tag est requis',
            existingTagError: 'Une étiquette portant ce nom existe déjà',
            invalidTagNameError: 'Le nom de l’étiquette ne peut pas être 0. Veuillez choisir une autre valeur.',
            genericFailureMessage: 'Une erreur s’est produite lors de la mise à jour du tag, veuillez réessayer',
            importedFromAccountingSoftware: 'Les tags ci-dessous sont importés depuis votre',
            glCode: 'Code de grand livre',
            updateGLCodeFailureMessage: 'Une erreur s’est produite lors de la mise à jour du code GL, veuillez réessayer',
            tagRules: 'Règles de tag',
            approverDescription: 'Approbateur',
            importTags: 'Importer des étiquettes',
            importTagsSupportingText: 'Codez vos dépenses avec un seul type de tag ou avec plusieurs.',
            configureMultiLevelTags: 'Configurez votre liste de tags pour le marquage multi-niveaux.',
            importMultiLevelTagsSupportingText: `Voici un aperçu de vos tags. Si tout semble correct, cliquez ci-dessous pour les importer.`,
            importMultiLevelTags: {
                firstRowTitle: 'La première ligne est le titre de chaque liste de tags',
                independentTags: 'Ce sont des balises indépendantes',
                glAdjacentColumn: 'Il y a un code GL dans la colonne adjacente',
            },
            tagLevel: {
                singleLevel: 'Niveau unique de balises',
                multiLevel: 'Tags à plusieurs niveaux',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Changer le niveau d’étiquette',
                prompt1: 'Changer les niveaux d’étiquette effacera toutes les étiquettes actuelles.',
                prompt2: 'Nous vous suggérons d’abord',
                prompt3: 'télécharger une sauvegarde',
                prompt4: 'en exportant vos tags.',
                prompt5: 'En savoir plus',
                prompt6: 'à propos des niveaux d’étiquettes.',
            },
            overrideMultiTagWarning: {
                title: 'Importer des étiquettes',
                prompt1: 'Êtes-vous sûr ?',
                prompt2: 'Les tags existants seront remplacés, mais vous pouvez',
                prompt3: 'télécharger une sauvegarde',
                prompt4: 'd’abord.',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Nous avons trouvé *${columnCounts} colonnes* dans votre feuille de calcul. Sélectionnez *Nom* à côté de la colonne qui contient les noms de tags. Vous pouvez également sélectionner *Activé* à côté de la colonne qui définit le statut des tags.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Impossible de supprimer ou de désactiver tous les tags',
                description: `Au moins une étiquette doit rester activée, car votre espace de travail exige l’utilisation d’étiquettes.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Impossible de rendre toutes les balises facultatives',
                description: `Au moins une étiquette doit rester obligatoire, car les paramètres de votre espace de travail exigent des étiquettes.`,
            },
            cannotMakeTagListRequired: {
                title: 'Impossible de rendre la liste de tags obligatoire',
                description: 'Vous ne pouvez rendre une liste de tags obligatoire que si votre politique comporte plusieurs niveaux de tags configurés.',
            },
            tagCount: () => ({
                one: '1 jour',
                other: (count: number) => `${count} étiquettes`,
            }),
        },
        taxes: {
            subtitle: 'Ajoutez des noms de taxes, des taux et définissez des valeurs par défaut.',
            addRate: 'Ajouter un taux',
            workspaceDefault: 'Devise par défaut de l’espace de travail',
            foreignDefault: 'Devise étrangère par défaut',
            customTaxName: 'Nom de taxe personnalisé',
            value: 'Valeur',
            taxReclaimableOn: 'Taxe récupérable sur',
            taxRate: 'Taux de taxe',
            findTaxRate: 'Trouver le taux de taxe',
            error: {
                taxRateAlreadyExists: 'Ce nom de taxe est déjà utilisé',
                taxCodeAlreadyExists: 'Ce code fiscal est déjà utilisé',
                valuePercentageRange: 'Veuillez saisir un pourcentage valide compris entre 0 et 100',
                customNameRequired: 'Un nom de taxe personnalisé est requis',
                deleteFailureMessage: 'Une erreur s’est produite lors de la suppression du taux de taxe. Veuillez réessayer ou demander de l’aide à Concierge.',
                updateFailureMessage: 'Une erreur s’est produite lors de la mise à jour du taux de taxe. Veuillez réessayer ou demander de l’aide à Concierge.',
                createFailureMessage: 'Une erreur s’est produite lors de la création du taux de taxe. Veuillez réessayer ou demander de l’aide à Concierge.',
                updateTaxClaimableFailureMessage: 'La partie récupérable doit être inférieure au montant du tarif par distance',
            },
            deleteTaxConfirmation: 'Voulez-vous vraiment supprimer cette taxe ?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Voulez-vous vraiment supprimer ${taxAmount} taxes ?`,
            actions: {
                delete: 'Supprimer le taux',
                deleteMultiple: 'Supprimer les taux',
                enable: 'Activer le taux',
                disable: 'Désactiver le taux',
                enableTaxRates: () => ({
                    one: 'Activer le taux',
                    other: 'Activer les taux',
                }),
                disableTaxRates: () => ({
                    one: 'Désactiver le taux',
                    other: 'Désactiver les taux',
                }),
            },
            importedFromAccountingSoftware: 'Les taxes ci-dessous sont importées depuis votre',
            taxCode: 'Code fiscal',
            updateTaxCodeFailureMessage: 'Une erreur s’est produite lors de la mise à jour du code fiscal, veuillez réessayer',
        },
        duplicateWorkspace: {
            title: 'Nommez votre nouvel espace de travail',
            selectFeatures: 'Sélectionner les fonctionnalités à copier',
            whichFeatures: 'Quelles fonctionnalités souhaitez-vous copier vers votre nouveau workspace ?',
            confirmDuplicate: 'Voulez-vous continuer ?',
            categories: 'catégories et vos règles d’auto‑catégorisation',
            reimbursementAccount: 'compte de remboursement',
            welcomeNote: 'Veuillez commencer à utiliser mon nouvel espace de travail',
            delayedSubmission: 'soumission retardée',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Vous êtes sur le point de créer et de partager ${newWorkspaceName ?? ''} avec ${totalMembers ?? 0} membres de l’espace de travail d’origine.`,
            error: 'Une erreur s’est produite lors de la duplication de votre nouvel espace de travail. Veuillez réessayer.',
        },
        emptyWorkspace: {
            title: 'Vous n’avez aucun espace de travail',
            subtitle: 'Suivez les reçus, remboursez les dépenses, gérez les voyages, envoyez des factures, et plus encore.',
            createAWorkspaceCTA: 'Commencer',
            features: {
                trackAndCollect: 'Suivez et collectez les reçus',
                reimbursements: 'Rembourser les employés',
                companyCards: 'Gérer les cartes d’entreprise',
            },
            notFound: 'Aucun espace de travail trouvé',
            description: 'Les salons sont un excellent endroit pour discuter et collaborer avec plusieurs personnes. Pour commencer à collaborer, créez ou rejoignez un espace de travail',
        },
        new: {
            newWorkspace: 'Nouvel espace de travail',
            getTheExpensifyCardAndMore: 'Obtenez la Carte Expensify et plus encore',
            confirmWorkspace: 'Confirmer l’espace de travail',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mon espace de travail de groupe${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Espace de travail de ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'Une erreur s’est produite lors de la suppression d’un membre de l’espace de travail, veuillez réessayer',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Êtes-vous sûr de vouloir retirer ${memberName} ?`,
                other: 'Êtes-vous sûr de vouloir supprimer ces membres ?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} est un approbateur dans cet espace de travail. Lorsque vous cesserez de partager cet espace de travail avec lui, nous le remplacerons dans le flux d’approbation par le propriétaire de l’espace de travail, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Retirer le membre',
                other: 'Supprimer des membres',
            }),
            findMember: 'Trouver un membre',
            removeWorkspaceMemberButtonTitle: 'Retirer de l’espace de travail',
            removeGroupMemberButtonTitle: 'Retirer du groupe',
            removeRoomMemberButtonTitle: 'Retirer de la discussion',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Êtes-vous sûr de vouloir retirer ${memberName} ?`,
            removeMemberTitle: 'Retirer le membre',
            transferOwner: 'Transférer le propriétaire',
            makeMember: 'Définir comme membre',
            makeAdmin: 'Nommer administrateur',
            makeAuditor: 'Nommer auditeur',
            selectAll: 'Tout sélectionner',
            error: {
                genericAdd: 'Un problème est survenu lors de l’ajout de ce membre à l’espace de travail',
                cannotRemove: 'Vous ne pouvez pas vous retirer vous-même ni le propriétaire de l’espace de travail',
                genericRemove: 'Un problème est survenu lors de la suppression de ce membre de l’espace de travail',
            },
            addedWithPrimary: 'Certains membres ont été ajoutés avec leurs identifiants principaux.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Ajouté par la connexion secondaire ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Nombre total de membres de l’espace de travail : ${count}`,
            importMembers: 'Importer des membres',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Si vous supprimez ${approver} de cet espace de travail, nous le remplacerons dans le processus de validation par ${workspaceOwner}, le propriétaire de l’espace de travail.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} a des rapports de dépenses en attente d’approbation. Veuillez lui demander de les approuver, ou prendre le contrôle de ses rapports avant de le retirer de l’espace de travail.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Vous ne pouvez pas retirer ${memberName} de cet espace de travail. Veuillez définir un nouveau responsable des remboursements dans Workflows > Faire ou suivre des paiements, puis réessayez.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Si vous retirez ${memberName} de cet espace de travail, nous le remplacerons comme exportateur préféré par ${workspaceOwner}, le propriétaire de l’espace de travail.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Si vous supprimez ${memberName} de cet espace de travail, nous le remplacerons en tant que contact technique par ${workspaceOwner}, le propriétaire de l’espace de travail.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} a un rapport en cours de traitement nécessitant une action. Veuillez lui demander d’effectuer l’action requise avant de le retirer de l’espace de travail.`,
        },
        card: {
            getStartedIssuing: 'Commencez en émettant votre première carte virtuelle ou physique.',
            issueCard: 'Émettre une carte',
            issueNewCard: {
                whoNeedsCard: 'Qui a besoin d’une carte ?',
                inviteNewMember: 'Inviter un nouveau membre',
                findMember: 'Trouver un membre',
                chooseCardType: 'Choisissez un type de carte',
                physicalCard: 'Carte physique',
                physicalCardDescription: 'Idéal pour les gros dépensiers fréquents',
                virtualCard: 'Carte virtuelle',
                virtualCardDescription: 'Instantané et flexible',
                chooseLimitType: 'Choisir un type de limite',
                smartLimit: 'Limite intelligente',
                smartLimitDescription: 'Dépenser jusqu’à un certain montant avant d’exiger une approbation',
                monthly: 'Mensuel',
                monthlyDescription: 'Dépenser jusqu’à un certain montant par mois',
                fixedAmount: 'Montant fixe',
                fixedAmountDescription: 'Dépenser jusqu’à un certain montant une seule fois',
                setLimit: 'Définir une limite',
                cardLimitError: 'Veuillez saisir un montant inférieur à 21 474 836 $',
                giveItName: 'Donnez-lui un nom',
                giveItNameInstruction: 'Rendez-la suffisamment unique pour la distinguer des autres cartes. Des cas d’utilisation spécifiques, c’est encore mieux !',
                cardName: 'Nom de la carte',
                letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
                willBeReady: 'Cette carte sera prête à être utilisée immédiatement.',
                cardholder: 'Titulaire de carte',
                cardType: 'Type de carte',
                limit: 'Limite',
                limitType: 'Type de limite',
                name: 'Nom',
                disabledApprovalForSmartLimitError:
                    'Veuillez activer les approbations dans <strong>Workflows > Ajouter des approbations</strong> avant de configurer des limites intelligentes',
            },
            deactivateCardModal: {
                deactivate: 'Désactiver',
                deactivateCard: 'Désactiver la carte',
                deactivateConfirmation: 'La désactivation de cette carte refusera toutes les transactions futures et ne pourra pas être annulée.',
            },
        },
        accounting: {
            settings: 'Paramètres',
            title: 'Connexions',
            subtitle:
                'Connectez votre système comptable pour coder les transactions avec votre plan comptable, faire correspondre automatiquement les paiements et garder vos finances synchronisées.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Discutez avec votre spécialiste de configuration.',
            talkYourAccountManager: 'Discutez avec votre chargé de compte.',
            talkToConcierge: 'Discuter avec Concierge.',
            needAnotherAccounting: 'Besoin d’un autre logiciel de comptabilité ?',
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
                `Une erreur s’est produite avec une connexion configurée dans Expensify Classic. [Accédez à Expensify Classic pour résoudre ce problème.](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: 'Accédez à Expensify Classic pour gérer vos paramètres.',
            setup: 'Connecter',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Dernière synchronisation ${relativeDate}`,
            notSync: 'Non synchronisé',
            import: 'Importer',
            export: 'Exporter',
            advanced: 'Avancé',
            other: 'Autre',
            syncNow: 'Synchroniser maintenant',
            disconnect: 'Déconnecter',
            reinstall: 'Réinstaller le connecteur',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'intégration';
                return `Déconnecter ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Connecter ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'intégration comptable'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Impossible de se connecter à QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Impossible de se connecter à Xero';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Impossible de se connecter à NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Impossible de se connecter à QuickBooks Desktop';
                    default: {
                        return 'Impossible de se connecter à l’intégration';
                    }
                }
            },
            accounts: 'Plan comptable',
            taxes: 'Taxes',
            imported: 'Importé',
            notImported: 'Non importé',
            importAsCategory: 'Importé en tant que catégories',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Importé',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Importées en tant que tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Importé',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Non importé',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Non importé',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Importé en tant que champs de rapport',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Valeur par défaut de l’employé NetSuite',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'cette intégration';
                return `Voulez-vous vraiment déconnecter ${integrationName} ?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Voulez-vous vraiment connecter ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'cette intégration comptable'} ? Cela supprimera toutes les connexions comptables existantes.`,
            enterCredentials: 'Saisissez vos identifiants',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Importation de clients';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Importation des employés';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Importation des comptes';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importation de classes';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importation des lieux';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Traitement des données importées';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Synchronisation des rapports remboursés et des paiements de factures';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importation de codes de taxe';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Vérification de la connexion QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importation des données QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importation de données Xero';
                        case 'startingImportQBO':
                            return 'Importation des données QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importation de données QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importation du titre';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importation du certificat d’approbation';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importation des dimensions';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importation de la politique d’enregistrement';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Synchronisation des données avec QuickBooks en cours... Veuillez vous assurer que le Web Connector est en cours d’exécution';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Synchronisation des données QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Chargement des données';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Mise à jour des catégories';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Mise à jour des clients/projets';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Mise à jour de la liste des personnes';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Mise à jour des champs de rapport';
                        case 'jobDone':
                            return 'En attente du chargement des données importées';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Synchronisation du plan comptable';
                        case 'xeroSyncImportCategories':
                            return 'Synchronisation des catégories';
                        case 'xeroSyncImportCustomers':
                            return 'Synchronisation des clients';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Marquer les rapports Expensify comme remboursés';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Marquer les factures et les notes de frais Xero comme payées';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Synchronisation des catégories de suivi';
                        case 'xeroSyncImportBankAccounts':
                            return 'Synchronisation des comptes bancaires';
                        case 'xeroSyncImportTaxRates':
                            return 'Synchronisation des taux de taxe';
                        case 'xeroCheckConnection':
                            return 'Vérification de la connexion à Xero';
                        case 'xeroSyncTitle':
                            return 'Synchronisation des données Xero';
                        case 'netSuiteSyncConnection':
                            return 'Initialisation de la connexion à NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importation de clients';
                        case 'netSuiteSyncInitData':
                            return 'Récupération des données depuis NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importation des taxes';
                        case 'netSuiteSyncImportItems':
                            return 'Importation d’articles';
                        case 'netSuiteSyncData':
                            return 'Importation de données dans Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Synchronisation des comptes';
                        case 'netSuiteSyncCurrencies':
                            return 'Synchronisation des devises';
                        case 'netSuiteSyncCategories':
                            return 'Synchronisation des catégories';
                        case 'netSuiteSyncReportFields':
                            return 'Importation des données en tant que champs de rapport Expensify';
                        case 'netSuiteSyncTags':
                            return "Importation des données en tant qu'étiquettes Expensify";
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Mise à jour des informations de connexion';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Marquer les rapports Expensify comme remboursés';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Marquer les factures et notes de frais NetSuite comme payées';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importation de fournisseurs';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importation de listes personnalisées';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importation de listes personnalisées';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importation de filiales';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importation de fournisseurs';
                        case 'intacctCheckConnection':
                            return 'Vérification de la connexion Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Importation des dimensions Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Importation des données Sage Intacct';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `Traduction manquante pour l’étape : ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Exportateur préféré',
            exportPreferredExporterNote:
                'L’exportateur préféré peut être n’importe quel administrateur de l’espace de travail, mais doit également être un administrateur de domaine si vous définissez des comptes d’exportation différents pour des cartes d’entreprise individuelles dans les paramètres de domaine.',
            exportPreferredExporterSubNote: 'Une fois défini, l’exportateur préféré verra les rapports à exporter dans son compte.',
            exportAs: 'Exporter en',
            exportOutOfPocket: 'Exporter les dépenses payées de sa poche en tant que',
            exportCompanyCard: 'Exporter les dépenses de carte de société en tant que',
            exportDate: 'Date d’exportation',
            defaultVendor: 'Fournisseur par défaut',
            autoSync: 'Synchronisation automatique',
            autoSyncDescription: 'Synchronisez NetSuite et Expensify automatiquement, tous les jours. Exportez les rapports finalisés en temps réel',
            reimbursedReports: 'Synchroniser les rapports remboursés',
            cardReconciliation: 'Rapprochement de cartes',
            reconciliationAccount: 'Compte de réconciliation',
            continuousReconciliation: 'Rapprochement continu',
            saveHoursOnReconciliation:
                'Gagnez des heures à chaque période comptable en laissant Expensify rapprocher en continu, pour vous, les relevés et règlements de la carte Expensify.',
            enableContinuousReconciliation: ({accountingAdvancedSettingsLink, connectionName}: EnableContinuousReconciliationParams) =>
                `<muted-text-label>Pour activer le rapprochement continu, veuillez activer la <a href="${accountingAdvancedSettingsLink}">synchronisation automatique</a> pour ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Choisissez le compte bancaire avec lequel les paiements de votre carte Expensify seront rapprochés.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Assurez-vous que ce compte correspond à votre <a href="${settlementAccountUrl}">compte de règlement de la carte Expensify</a> (se terminant par ${lastFourPAN}) afin que la Réconciliation continue fonctionne correctement.`,
            },
        },
        export: {
            notReadyHeading: 'Pas prêt à exporter',
            notReadyDescription:
                'Les notes de frais brouillons ou en attente ne peuvent pas être exportées vers le système comptable. Veuillez approuver ou payer ces dépenses avant de les exporter.',
        },
        invoices: {
            sendInvoice: 'Envoyer la facture',
            sendFrom: 'Envoyer depuis',
            invoicingDetails: 'Détails de facturation',
            invoicingDetailsDescription: 'Ces informations apparaîtront sur vos factures.',
            companyName: 'Nom de l’entreprise',
            companyWebsite: 'Site web de l’entreprise',
            paymentMethods: {
                personal: 'Personnel',
                business: 'Professionnel',
                chooseInvoiceMethod: 'Choisissez un mode de paiement ci-dessous :',
                payingAsIndividual: 'Payer en tant que particulier',
                payingAsBusiness: 'Payer en tant qu’entreprise',
            },
            invoiceBalance: 'Solde de la facture',
            invoiceBalanceSubtitle:
                'Il s’agit de votre solde actuel provenant de l’encaissement des paiements de factures. Il sera automatiquement transféré sur votre compte bancaire si vous en avez ajouté un.',
            bankAccountsSubtitle: 'Ajoutez un compte bancaire pour effectuer et recevoir des paiements de factures.',
        },
        invite: {
            member: 'Inviter un membre',
            members: 'Inviter des membres',
            invitePeople: 'Inviter de nouveaux membres',
            genericFailureMessage: 'Une erreur s’est produite lors de l’invitation du membre à l’espace de travail. Veuillez réessayer.',
            pleaseEnterValidLogin: `Veuillez vous assurer que l’adresse e-mail ou le numéro de téléphone est valide (p. ex. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'utilisateur',
            users: 'utilisateurs',
            invited: 'invité',
            removed: 'Supprimé',
            to: 'à',
            from: 'de',
        },
        inviteMessage: {
            confirmDetails: 'Confirmer les détails',
            inviteMessagePrompt: 'Rendez votre invitation encore plus spéciale en ajoutant un message ci-dessous !',
            personalMessagePrompt: 'Message',
            genericFailureMessage: 'Une erreur s’est produite lors de l’invitation du membre à l’espace de travail. Veuillez réessayer.',
            inviteNoMembersError: 'Veuillez sélectionner au moins un membre à inviter',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} a demandé à rejoindre ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Oups ! Pas si vite...',
            workspaceNeeds: 'Un espace de travail doit disposer d’au moins un tarif de distance activé.',
            distance: 'Distance',
            centrallyManage: 'Gérez les tarifs de façon centralisée, suivez en miles ou en kilomètres et définissez une catégorie par défaut.',
            rate: 'Taux',
            addRate: 'Ajouter un taux',
            findRate: 'Trouver le taux',
            trackTax: 'Suivi des taxes',
            deleteRates: () => ({
                one: 'Supprimer le taux',
                other: 'Supprimer les taux',
            }),
            enableRates: () => ({
                one: 'Activer le taux',
                other: 'Activer les taux',
            }),
            disableRates: () => ({
                one: 'Désactiver le taux',
                other: 'Désactiver les taux',
            }),
            enableRate: 'Activer le taux',
            status: 'Statut',
            unit: 'Unité',
            taxFeatureNotEnabledMessage:
                '<muted-text>Les taxes doivent être activées sur l\'espace de travail pour utiliser cette fonctionnalité. Rendez-vous dans <a href="#">Plus de fonctionnalités</a> pour effectuer cette modification.</muted-text>',
            deleteDistanceRate: 'Supprimer le tarif de distance',
            areYouSureDelete: () => ({
                one: 'Voulez-vous vraiment supprimer ce tarif ?',
                other: 'Êtes-vous sûr de vouloir supprimer ces tarifs ?',
            }),
            errors: {
                rateNameRequired: 'Le nom du tarif est requis',
                existingRateName: 'Un tarif de distance portant ce nom existe déjà',
            },
        },
        editor: {
            descriptionInputLabel: 'Description',
            nameInputLabel: 'Nom',
            typeInputLabel: 'Type',
            initialValueInputLabel: 'Valeur initiale',
            nameInputHelpText: 'C’est le nom que vous verrez sur votre espace de travail.',
            nameIsRequiredError: 'Vous devez donner un nom à votre espace de travail',
            currencyInputLabel: 'Devise par défaut',
            currencyInputHelpText: 'Toutes les dépenses de cet espace de travail seront converties dans cette devise.',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) =>
                `La devise par défaut ne peut pas être modifiée, car cet espace de travail est lié à un compte bancaire en ${currency}.`,
            save: 'Enregistrer',
            genericFailureMessage: 'Une erreur s’est produite lors de la mise à jour de l’espace de travail. Veuillez réessayer.',
            avatarUploadFailureMessage: "Une erreur s'est produite lors du téléversement de l’avatar. Veuillez réessayer.",
            addressContext: 'Une adresse d’espace de travail est requise pour activer Expensify Travel. Veuillez saisir une adresse associée à votre entreprise.',
            policy: 'Politique de dépenses',
        },
        bankAccount: {
            continueWithSetup: 'Continuer la configuration',
            youAreAlmostDone:
                'Vous avez presque terminé la configuration de votre compte bancaire, ce qui vous permettra d’émettre des cartes d’entreprise, de rembourser des dépenses, de collecter des factures et de payer des notes.',
            streamlinePayments: 'Rationalisez les paiements',
            connectBankAccountNote: 'Remarque : Les comptes bancaires personnels ne peuvent pas être utilisés pour les paiements dans les espaces de travail.',
            oneMoreThing: 'Encore une chose !',
            allSet: 'Tout est prêt !',
            accountDescriptionWithCards: 'Ce compte bancaire sera utilisé pour émettre des cartes corporate, rembourser des dépenses, encaisser des factures et payer des factures.',
            letsFinishInChat: 'Terminons dans le chat !',
            finishInChat: 'Terminer dans le chat',
            almostDone: 'Presque terminé !',
            disconnectBankAccount: 'Déconnecter le compte bancaire',
            startOver: 'Recommencer',
            updateDetails: 'Mettre à jour les détails',
            yesDisconnectMyBankAccount: 'Oui, déconnecter mon compte bancaire',
            yesStartOver: 'Oui, recommencer',
            disconnectYourBankAccount: ({bankName}: DisconnectYourBankAccountParams) =>
                `Déconnectez votre compte bancaire <strong>${bankName}</strong>. Toutes les transactions en cours pour ce compte seront tout de même exécutées.`,
            clearProgress: 'Recommencer effacera les progrès que vous avez réalisés jusqu’à présent.',
            areYouSure: 'Êtes-vous sûr ?',
            workspaceCurrency: 'Devise de l’espace de travail',
            updateCurrencyPrompt:
                'Il semble que votre espace de travail soit actuellement configuré avec une devise différente du dollar américain (USD). Veuillez cliquer sur le bouton ci-dessous pour mettre à jour votre devise vers USD maintenant.',
            updateToUSD: 'Mettre à jour en USD',
            updateWorkspaceCurrency: 'Mettre à jour la devise de l’espace de travail',
            workspaceCurrencyNotSupported: 'Devise de l’espace de travail non prise en charge',
            yourWorkspace: `Votre espace de travail est configuré sur une devise non prise en charge. Consultez la <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">liste des devises prises en charge</a>.`,
            chooseAnExisting: 'Choisissez un compte bancaire existant pour payer les dépenses ou ajoutez-en un nouveau.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Transférer le propriétaire',
            addPaymentCardTitle: 'Saisissez votre carte de paiement pour transférer la propriété',
            addPaymentCardButtonText: 'Accepter les conditions et ajouter une carte de paiement',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Lisez et acceptez les <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">conditions</a> et la <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">politique de confidentialité</a> pour ajouter votre carte.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'Conforme à la norme PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Chiffrement de niveau bancaire',
            addPaymentCardRedundant: 'Infrastructure redondante',
            addPaymentCardLearnMore: `<muted-text>En savoir plus sur notre <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">sécurité</a>.</muted-text>`,
            amountOwedTitle: 'Solde restant',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Ce compte a un solde impayé d’un mois précédent.\n\nVoulez-vous régler le solde et reprendre la facturation de cet espace de travail ?',
            ownerOwesAmountTitle: 'Solde restant',
            ownerOwesAmountButtonText: 'Transférer le solde',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `Le compte propriétaire de cet espace de travail (${email}) présente un solde impayé d’un mois précédent.

Souhaitez-vous transférer ce montant (${amount}) afin de prendre en charge la facturation de cet espace de travail ? Votre carte de paiement sera débitée immédiatement.`,
            subscriptionTitle: 'Reprendre l’abonnement annuel',
            subscriptionButtonText: 'Transférer l’abonnement',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Prendre le contrôle de cet espace de travail fusionnera son abonnement annuel avec votre abonnement actuel. Cela augmentera la taille de votre abonnement de ${usersCount} membres, portant la nouvelle taille de votre abonnement à ${finalCount}. Souhaitez-vous continuer ?`,
            duplicateSubscriptionTitle: 'Alerte d’abonnement en double',
            duplicateSubscriptionButtonText: 'Continuer',
            duplicateSubscriptionText: ({
                email,
                workspaceName,
            }: ChangeOwnerDuplicateSubscriptionParams) => `Il semble que vous essayiez de prendre en charge la facturation des espaces de travail de ${email}, mais pour cela, vous devez d’abord être administrateur sur tous ses espaces de travail.

Cliquez sur « Continuer » si vous souhaitez uniquement reprendre la facturation de l’espace de travail ${workspaceName}.

Si vous voulez prendre en charge la facturation de l’ensemble de son abonnement, veuillez d’abord lui demander de vous ajouter comme administrateur à tous ses espaces de travail avant de reprendre la facturation.`,
            hasFailedSettlementsTitle: 'Impossible de transférer la propriété',
            hasFailedSettlementsButtonText: 'Compris',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Vous ne pouvez pas prendre en charge la facturation, car ${email} a un règlement de carte Expensify en retard. Veuillez lui demander de contacter concierge@expensify.com pour résoudre le problème. Ensuite, vous pourrez prendre en charge la facturation pour cet espace de travail.`,
            failedToClearBalanceTitle: 'Échec de l’effacement du solde',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Nous n’avons pas pu effacer le solde. Veuillez réessayer plus tard.',
            successTitle: 'Youpi ! Tout est prêt.',
            successDescription: 'Vous êtes maintenant le propriétaire de cet espace de travail.',
            errorTitle: 'Oups ! Pas si vite...',
            errorDescription: `<muted-text><centered-text>Un problème est survenu lors du transfert de propriété de cet espace de travail. Réessayez ou <concierge-link>contactez Concierge</concierge-link> pour obtenir de l’aide.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Attention !',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `Les rapports suivants ont déjà été exportés vers ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} :

${reportName}

Voulez-vous vraiment les exporter de nouveau ?`,
            confirmText: 'Oui, exporter à nouveau',
            cancelText: 'Annuler',
        },
        upgrade: {
            reportFields: {
                title: 'Champs de rapport',
                description: `Les champs de rapport vous permettent de spécifier des détails au niveau de l’en-tête, distincts des tags qui se rapportent aux dépenses des postes individuels. Ces détails peuvent inclure des noms de projets spécifiques, des informations sur les voyages d’affaires, des emplacements, et plus encore.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les champs de rapport sont uniquement disponibles avec l’offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Profitez de la synchronisation automatisée et réduisez les saisies manuelles grâce à l’intégration Expensify + NetSuite. Obtenez des informations financières approfondies et en temps réel avec la prise en charge des segments natifs et personnalisés, y compris la mise en correspondance des projets et des clients.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Notre intégration avec NetSuite est uniquement disponible avec l’abonnement Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Profitez de la synchronisation automatique et réduisez les saisies manuelles grâce à l’intégration Expensify + Sage Intacct. Obtenez des informations financières détaillées et en temps réel avec des dimensions définies par l’utilisateur, ainsi qu’un codage des dépenses par service, classe, site, client et projet (travail).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Notre intégration Sage Intacct est uniquement disponible avec l’offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Profitez de la synchronisation automatisée et réduisez les saisies manuelles grâce à l’intégration Expensify + QuickBooks Desktop. Bénéficiez d’une efficacité optimale grâce à une connexion bidirectionnelle en temps réel et à l’imputation des dépenses par classe, article, client et projet.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Notre intégration QuickBooks Desktop est uniquement disponible avec l’offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Approbations avancées',
                description: `Si vous souhaitez ajouter davantage de niveaux d’approbation au processus – ou simplement vous assurer que les dépenses les plus importantes sont examinées une fois de plus – nous avons ce qu’il vous faut. Les approbations avancées vous aident à mettre en place les bons contrôles à chaque niveau afin de garder les dépenses de votre équipe sous contrôle.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les approbations avancées sont uniquement disponibles avec l’offre Control, qui commence à <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            categories: {
                title: 'Catégories',
                description: 'Les catégories vous permettent de suivre et d’organiser les dépenses. Utilisez nos catégories par défaut ou ajoutez les vôtres.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les catégories sont disponibles avec l’abonnement Collect, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            glCodes: {
                title: 'Codes GL',
                description: `Ajoutez des codes GL à vos catégories et étiquettes pour faciliter l’exportation des dépenses vers vos systèmes de comptabilité et de paie.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les codes GL sont uniquement disponibles avec l’offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Codes de grand livre et de paie',
                description: `Ajoutez des codes de Grand livre et de Paie à vos catégories pour faciliter l’exportation des dépenses vers vos systèmes comptables et de paie.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les codes de GL et de paie ne sont disponibles que dans l’offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Codes fiscaux',
                description: `Ajoutez des codes fiscaux à vos taxes pour faciliter l’exportation des dépenses vers vos systèmes de comptabilité et de paie.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les codes fiscaux ne sont disponibles que dans l’offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            companyCards: {
                title: 'Cartes d’entreprise illimitées',
                description: `Vous devez ajouter davantage de flux de cartes ? Débloquez un nombre illimité de cartes d’entreprise pour synchroniser les transactions de tous les principaux émetteurs de cartes.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Ceci est uniquement disponible avec le plan Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            rules: {
                title: 'Règles',
                description: `Les règles fonctionnent en arrière-plan et gardent vos dépenses sous contrôle pour que vous n’ayez pas à vous soucier des petits détails.

Exigez des informations de dépense comme les reçus et les descriptions, définissez des limites et des valeurs par défaut, et automatisez les validations et les paiements – le tout au même endroit.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les règles sont uniquement disponibles avec le forfait Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            perDiem: {
                title: 'Indemnité journalière',
                description:
                    'Les indemnités journalières sont un excellent moyen de garder vos dépenses quotidiennes conformes et prévisibles lorsque vos employés voyagent. Profitez de fonctionnalités comme les taux personnalisés, les catégories par défaut et des détails plus granulaires comme les destinations et les sous-taux.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les indemnités journalières ne sont disponibles qu’avec l’abonnement Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            travel: {
                title: 'Voyage',
                description:
                    'Expensify Travel est une nouvelle plateforme de réservation et de gestion de voyages d’affaires qui permet aux membres de réserver des hébergements, des vols, des transports et plus encore.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Le voyage est disponible avec le forfait Collect, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            reports: {
                title: 'Rapports',
                description: 'Les rapports vous permettent de regrouper les dépenses pour en faciliter le suivi et l’organisation.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les rapports sont disponibles avec l’offre Collect, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Tags à plusieurs niveaux',
                description:
                    'Les tags à plusieurs niveaux vous aident à suivre les dépenses avec une plus grande précision. Attribuez plusieurs tags à chaque ligne, comme le département, le client ou le centre de coût, afin de capturer le contexte complet de chaque dépense. Cela permet des rapports plus détaillés, des flux d’approbation et des exports comptables plus précis.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les tags à plusieurs niveaux sont uniquement disponibles avec le plan Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Tarifs de distance',
                description: 'Créez et gérez vos propres tarifs, suivez en miles ou en kilomètres, et définissez des catégories par défaut pour les dépenses de distance.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les indemnités kilométriques sont disponibles avec l’offre Collect, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            auditor: {
                title: 'Auditeur',
                description: 'Les auditeurs bénéficient d’un accès en lecture seule à tous les rapports pour une visibilité complète et le suivi de la conformité.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les auditeurs ne sont disponibles que dans l’abonnement Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Niveaux d’approbation multiples',
                description:
                    'Les niveaux d’approbation multiples sont un outil de workflow destiné aux entreprises qui exigent que plus d’une personne approuve un rapport avant qu’il puisse être remboursé.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les niveaux d’approbation multiples sont uniquement disponibles avec le plan Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'par membre actif et par mois.',
                perMember: 'par membre et par mois.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Mettez à niveau pour accéder à cette fonctionnalité, ou <a href="${subscriptionLink}">en savoir plus</a> sur nos offres et tarifs.</muted-text>`,
            upgradeToUnlock: 'Débloquer cette fonctionnalité',
            completed: {
                headline: `Vous avez mis à niveau votre espace de travail !`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Vous avez mis à niveau ${policyName} vers l’abonnement Control avec succès ! <a href="${subscriptionLink}">Afficher votre abonnement</a> pour plus de détails.</centered-text>`,
                categorizeMessage: `Vous êtes passé avec succès au forfait Collect. Vous pouvez maintenant catégoriser vos dépenses !`,
                travelMessage: `Vous avez réussi à passer au forfait Collect. Vous pouvez maintenant commencer à réserver et gérer vos voyages !`,
                distanceRateMessage: `Vous êtes passé avec succès au forfait Collect. Vous pouvez maintenant modifier le tarif de distance !`,
                gotIt: 'Compris, merci',
                createdWorkspace: `Vous avez créé un espace de travail !`,
            },
            commonFeatures: {
                title: 'Passer au forfait Control',
                note: 'Débloquez nos fonctionnalités les plus puissantes, notamment :',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Le forfait Control commence à <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`} <a href="${learnMoreMethodsRoute}">En savoir plus</a> sur nos forfaits et nos tarifs.</muted-text>`,
                    benefit1: 'Connexions comptables avancées (NetSuite, Sage Intacct et plus)',
                    benefit2: 'Règles intelligentes de dépenses',
                    benefit3: 'Workflows d’approbation à plusieurs niveaux',
                    benefit4: 'Contrôles de sécurité renforcés',
                    toUpgrade: 'Pour mettre à niveau, cliquez',
                    selectWorkspace: 'sélectionnez un espace de travail et changez le type de forfait en',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Rétrograder vers l’offre Collect',
                note: 'Si vous changez pour une offre inférieure, vous perdrez l’accès à ces fonctionnalités et à bien d’autres :',
                benefits: {
                    note: 'Pour une comparaison complète de nos forfaits, consultez notre',
                    pricingPage: 'page des tarifs',
                    confirm: 'Voulez-vous vraiment rétrograder et supprimer vos configurations ?',
                    warning: 'Cette action est irréversible.',
                    benefit1: 'Connexions comptables (sauf QuickBooks Online et Xero)',
                    benefit2: 'Règles intelligentes de dépenses',
                    benefit3: 'Workflows d’approbation à plusieurs niveaux',
                    benefit4: 'Contrôles de sécurité renforcés',
                    headsUp: 'Attention !',
                    multiWorkspaceNote: 'Vous devrez rétrograder tous vos espaces de travail avant votre premier paiement mensuel pour commencer un abonnement au tarif Collect. Cliquez',
                    selectStep: '> sélectionnez chaque espace de travail > changez le type de forfait en',
                },
            },
            completed: {
                headline: 'Votre espace de travail a été rétrogradé',
                description: 'Vous avez d’autres espaces de travail sur le forfait Control. Pour être facturé au tarif Collect, vous devez rétrograder tous les espaces de travail.',
                gotIt: 'Compris, merci',
            },
        },
        payAndDowngrade: {
            title: 'Payer et rétrograder',
            headline: 'Votre paiement final',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Votre facture finale pour cet abonnement sera de <strong>${formattedAmount}</strong>`,
            description2: ({date}: DateParams) => `Voir votre répartition ci-dessous pour le ${date} :`,
            subscription:
                'Attention ! Cette action mettra fin à votre abonnement Expensify, supprimera cet espace de travail et retirera tous les membres de l’espace de travail. Si vous souhaitez conserver cet espace de travail et seulement vous retirer, demandez d’abord à un autre administrateur de prendre en charge la facturation.',
            genericFailureMessage: 'Une erreur s’est produite lors du paiement de votre facture. Veuillez réessayer.',
        },
        restrictedAction: {
            restricted: 'Restreint',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Les actions dans l’espace de travail ${workspaceName} sont actuellement restreintes`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Le propriétaire de l’espace de travail, ${workspaceOwnerName}, devra ajouter ou mettre à jour la carte de paiement enregistrée pour débloquer la nouvelle activité de l’espace de travail.`,
            youWillNeedToAddOrUpdatePaymentCard: 'Vous devrez ajouter ou mettre à jour la carte de paiement enregistrée pour débloquer de nouvelles activités de l’espace de travail.',
            addPaymentCardToUnlock: 'Ajoutez une carte de paiement pour déverrouiller !',
            addPaymentCardToContinueUsingWorkspace: 'Ajoutez une carte de paiement pour continuer à utiliser cet espace de travail',
            pleaseReachOutToYourWorkspaceAdmin: 'Veuillez contacter l’administrateur de votre espace de travail pour toute question.',
            chatWithYourAdmin: 'Discuter avec votre administrateur',
            chatInAdmins: 'Discuter dans #admins',
            addPaymentCard: 'Ajouter une carte de paiement',
            goToSubscription: 'Aller à l’abonnement',
        },
        rules: {
            individualExpenseRules: {
                title: 'Dépenses',
                subtitle: ({categoriesPageLink, tagsPageLink}: IndividualExpenseRulesSubtitleParams) =>
                    `<muted-text>Définissez des contrôles de dépense et des valeurs par défaut pour les dépenses individuelles. Vous pouvez également créer des règles pour les <a href="${categoriesPageLink}">catégories</a> et les <a href="${tagsPageLink}">étiquettes</a>.</muted-text>`,
                receiptRequiredAmount: 'Montant nécessitant un reçu',
                receiptRequiredAmountDescription: 'Exiger des reçus lorsque la dépense dépasse ce montant, sauf si une règle de catégorie le remplace.',
                maxExpenseAmount: 'Montant maximal de dépense',
                maxExpenseAmountDescription: 'Signaler les dépenses qui dépassent ce montant, sauf si une règle de catégorie les remplace.',
                maxAge: 'Âge maximal',
                maxExpenseAge: 'Ancienneté maximale de la dépense',
                maxExpenseAgeDescription: 'Signaler les dépenses plus anciennes qu’un certain nombre de jours.',
                maxExpenseAgeDays: () => ({
                    one: '1 jour',
                    other: (count: number) => `${count} jours`,
                }),
                cashExpenseDefault: 'Dépense en espèces par défaut',
                cashExpenseDefaultDescription:
                    'Choisissez comment les dépenses en espèces doivent être créées. Une dépense est considérée comme une dépense en espèces si ce n’est pas une transaction de carte d’entreprise importée. Cela inclut les dépenses créées manuellement, les reçus, les indemnités journalières, les dépenses de distance et de temps.',
                reimbursableDefault: 'Remboursable',
                reimbursableDefaultDescription: 'Les dépenses sont le plus souvent remboursées aux employés',
                nonReimbursableDefault: 'Non remboursable',
                nonReimbursableDefaultDescription: 'Les frais professionnels sont parfois remboursés aux employés',
                alwaysReimbursable: 'Toujours remboursable',
                alwaysReimbursableDescription: 'Les dépenses sont toujours remboursées aux employés',
                alwaysNonReimbursable: 'Toujours non remboursable',
                alwaysNonReimbursableDescription: 'Les dépenses ne sont jamais remboursées aux employés',
                billableDefault: 'Facturable par défaut',
                billableDefaultDescription: ({tagsPageLink}: BillableDefaultDescriptionParams) =>
                    `<muted-text>Choisissez si les dépenses en espèces et par carte de crédit doivent être refacturables par défaut. Les dépenses refacturables sont activées ou désactivées dans les <a href="${tagsPageLink}">étiquettes</a>.</muted-text>`,
                billable: 'Facturable',
                billableDescription: 'Les dépenses sont le plus souvent refacturées aux clients',
                nonBillable: 'Non facturable',
                nonBillableDescription: 'Les dépenses sont occasionnellement refacturées aux clients',
                eReceipts: 'Reçus électroniques',
                eReceiptsHint: `Les eReçus sont créés automatiquement [pour la plupart des transactions par carte de crédit en USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Suivi des participants',
                attendeeTrackingHint: 'Suivez le coût par personne pour chaque dépense.',
                prohibitedDefaultDescription:
                    'Signalez tous les reçus où apparaissent de l’alcool, des jeux d’argent ou d’autres articles restreints. Les dépenses accompagnées de reçus comportant ces lignes d’articles devront faire l’objet d’un examen manuel.',
                prohibitedExpenses: 'Dépenses interdites',
                alcohol: 'Alcool',
                hotelIncidentals: 'Frais annexes d’hôtel',
                gambling: "Jeux d'argent",
                tobacco: 'Tabac',
                adultEntertainment: 'Divertissement pour adultes',
            },
            expenseReportRules: {
                title: 'Notes de frais',
                subtitle: 'Automatisez la conformité, les validations et le paiement des notes de frais.',
                preventSelfApprovalsTitle: 'Empêcher les auto-validations',
                preventSelfApprovalsSubtitle: 'Empêcher les membres de l’espace de travail d’approuver leurs propres rapports de dépenses.',
                autoApproveCompliantReportsTitle: 'Approuver automatiquement les rapports conformes',
                autoApproveCompliantReportsSubtitle: 'Configurer quels rapports de dépenses sont éligibles à l’approbation automatique.',
                autoApproveReportsUnderTitle: 'Approuver automatiquement les rapports en dessous de',
                autoApproveReportsUnderDescription: 'Les notes de frais entièrement conformes en dessous de ce montant seront automatiquement approuvées.',
                randomReportAuditTitle: 'Audit aléatoire de rapport',
                randomReportAuditDescription: 'Exiger que certains rapports soient approuvés manuellement, même s’ils sont éligibles à l’auto-approbation.',
                autoPayApprovedReportsTitle: 'Rapports approuvés avec paiement automatique',
                autoPayApprovedReportsSubtitle: 'Configurez quels rapports de dépenses sont éligibles au paiement automatique.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `Veuillez saisir un montant inférieur à ${currency ?? ''}20 000`,
                autoPayApprovedReportsLockedSubtitle: 'Accédez à Plus de fonctionnalités et activez les flux de travail, puis ajoutez les paiements pour déverrouiller cette fonctionnalité.',
                autoPayReportsUnderTitle: 'Rapports de paiement automatique inférieurs à',
                autoPayReportsUnderDescription: 'Les notes de frais entièrement conformes en dessous de ce montant seront payées automatiquement.',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `Allez dans [plus de fonctionnalités](${moreFeaturesLink}) et activez les flux de travail, puis ajoutez ${featureName} pour débloquer cette fonctionnalité.`,
                enableFeatureSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `Allez à [plus de fonctionnalités](${moreFeaturesLink}) et activez ${featureName} pour déverrouiller cette fonctionnalité.`,
            },
            categoryRules: {
                title: 'Règles de catégorie',
                approver: 'Approbateur',
                requireDescription: 'Description requise',
                descriptionHint: 'Indice de description',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `Rappelez aux employé·e·s de fournir des informations supplémentaires pour les dépenses « ${categoryName} ». Cet indice apparaît dans le champ de description des dépenses.`,
                descriptionHintLabel: 'Astuce',
                descriptionHintSubtitle: 'Astuce : plus c’est court, mieux c’est !',
                maxAmount: 'Montant maximal',
                flagAmountsOver: 'Signaler les montants supérieurs à',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `S’applique à la catégorie « ${categoryName} ».`,
                flagAmountsOverSubtitle: 'Cela remplace le montant maximal pour toutes les dépenses.',
                expenseLimitTypes: {
                    expense: 'Note de frais individuelle',
                    expenseSubtitle:
                        'Signaler les montants de dépense par catégorie. Cette règle remplace la règle générale de l’espace de travail concernant le montant maximal d’une dépense.',
                    daily: 'Total de la catégorie',
                    dailySubtitle: 'Signaler le total des dépenses par catégorie pour chaque note de frais.',
                },
                requireReceiptsOver: 'Exiger des reçus au-delà de',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Par défaut`,
                    never: 'Ne jamais exiger de reçus',
                    always: 'Toujours exiger des reçus',
                },
                defaultTaxRate: 'Taux de taxe par défaut',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Allez dans [Plus de fonctionnalités](${moreFeaturesLink}) et activez les workflows, puis ajoutez des validations pour déverrouiller cette fonctionnalité.`,
            },
            customRules: {
                title: 'Politique de dépenses',
                cardSubtitle:
                    'C’est ici que se trouve la politique de notes de frais de votre équipe, afin que tout le monde soit sur la même longueur d’onde concernant ce qui est couvert.',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Encaisser',
                    description: 'Pour les équipes qui cherchent à automatiser leurs processus.',
                },
                corporate: {
                    label: 'Contrôle',
                    description: 'Pour les organisations ayant des exigences avancées.',
                },
            },
            description: 'Choisissez l’offre qui vous convient. Pour une liste détaillée des fonctionnalités et des tarifs, consultez notre',
            subscriptionLink: 'page d’aide sur les types de forfaits et les tarifs',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Vous vous êtes engagé·e à 1 membre actif sur le forfait Control jusqu’à la fin de votre abonnement annuel, le ${annualSubscriptionEndDate}. Vous pourrez passer à un abonnement à l’usage et rétrograder vers le forfait Collect à partir du ${annualSubscriptionEndDate} en désactivant le renouvellement automatique dans`,
                other: `Vous vous êtes engagé·e à ${count} membres actifs sur le plan Control jusqu’à la fin de votre abonnement annuel le ${annualSubscriptionEndDate}. Vous pouvez passer à un abonnement à l’usage et rétrograder vers le plan Collect à partir du ${annualSubscriptionEndDate} en désactivant le renouvellement automatique dans`,
            }),
            subscriptions: 'Abonnements',
        },
    },
    getAssistancePage: {
        title: 'Obtenir de l’aide',
        subtitle: 'Nous sommes là pour dégager votre chemin vers la grandeur !',
        description: 'Choisissez parmi les options d’assistance ci-dessous :',
        chatWithConcierge: 'Discuter avec Concierge',
        scheduleSetupCall: 'Planifier un appel de configuration',
        scheduleACall: 'Planifier un appel',
        questionMarkButtonTooltip: 'Obtenez de l’aide de notre équipe',
        exploreHelpDocs: 'Explorer les documents d’aide',
        registerForWebinar: 'S’inscrire au webinaire',
        onboardingHelp: 'Aide à l’intégration',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Modifier la couleur de peau par défaut',
        headers: {
            frequentlyUsed: 'Fréquemment utilisé',
            smileysAndEmotion: 'Smileys et émotions',
            peopleAndBody: 'Personnes et corps',
            animalsAndNature: 'Animaux et nature',
            foodAndDrink: 'Nourriture et boissons',
            travelAndPlaces: 'Voyage et lieux',
            activities: 'Activités',
            objects: 'Objets',
            symbols: 'Symboles',
            flags: 'Drapeaux',
        },
    },
    newRoomPage: {
        newRoom: 'Nouveau salon',
        groupName: 'Nom du groupe',
        roomName: 'Nom de la salle',
        visibility: 'Visibilité',
        restrictedDescription: 'Les personnes de votre espace de travail peuvent trouver cette salle',
        privateDescription: 'Les personnes invitées dans cette salle peuvent la trouver',
        publicDescription: 'Tout le monde peut trouver cette salle',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Tout le monde peut trouver cette salle',
        createRoom: 'Créer un salon',
        roomAlreadyExistsError: 'Une salle portant ce nom existe déjà',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} est un salon par défaut dans tous les espaces de travail. Veuillez choisir un autre nom.`,
        roomNameInvalidError: 'Les noms de salle ne peuvent inclure que des lettres minuscules, des chiffres et des tirets',
        pleaseEnterRoomName: 'Veuillez saisir un nom de salle',
        pleaseSelectWorkspace: 'Veuillez sélectionner un espace de travail',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor} renommé en « ${newName} » (auparavant « ${oldName} »)` : `${actor} a renommé ce salon en « ${newName} » (auparavant « ${oldName} »)`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Salon renommé en ${newName}`,
        social: 'Social',
        selectAWorkspace: 'Sélectionner un espace de travail',
        growlMessageOnRenameError: 'Impossible de renommer la salle de l’espace de travail. Veuillez vérifier votre connexion et réessayer.',
        visibilityOptions: {
            restricted: 'Espace de travail', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privé',
            public: 'Public',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Annonce publique',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Soumettre et fermer',
        submitAndApprove: 'Soumettre et approuver',
        advanced: 'AVANCÉ',
        dynamicExternal: 'DYNAMIQUE_EXTERNE',
        smartReport: 'RAPPORTINTELLIGENT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `a ajouté ${approverName} (${approverEmail}) comme approbateur pour le champ ${field} « ${name} »`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `a retiré ${approverName} (${approverEmail}) en tant qu'approbateur pour le ${field} « ${name} »`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `a modifié le valideur du ${field} « ${name} » en ${formatApprover(newApproverName, newApproverEmail)} (auparavant ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `a ajouté la catégorie « ${categoryName} »`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `a supprimé la catégorie « ${categoryName} »`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'désactivé' : 'activé'} la catégorie « ${categoryName} »`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `a ajouté le code de paie « ${newValue} » à la catégorie « ${categoryName} »`;
            }
            if (!newValue && oldValue) {
                return `a supprimé le code de paie « ${oldValue} » de la catégorie « ${categoryName} »`;
            }
            return `a modifié le code de paie de la catégorie « ${categoryName} » en « ${newValue} » (auparavant « ${oldValue} »)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `a ajouté le code GL « ${newValue} » à la catégorie « ${categoryName} »`;
            }
            if (!newValue && oldValue) {
                return `a supprimé le code GL « ${oldValue} » de la catégorie « ${categoryName} »`;
            }
            return `a modifié le code GL de la catégorie « ${categoryName} » en « ${newValue} » (auparavant « ${oldValue} »)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `a modifié la description de la catégorie « ${categoryName} » en ${!oldValue ? 'Obligatoire' : 'non requis'} (auparavant ${!oldValue ? 'non requis' : 'Obligatoire'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `a ajouté un montant maximal de ${newAmount} à la catégorie « ${categoryName} »`;
            }
            if (oldAmount && !newAmount) {
                return `a supprimé le montant maximal de ${oldAmount} de la catégorie « ${categoryName} »`;
            }
            return `a modifié le montant maximal de la catégorie « ${categoryName} » à ${newAmount} (auparavant ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `a ajouté un type de limite de ${newValue} à la catégorie « ${categoryName} »`;
            }
            return `a modifié le type de limite de la catégorie « ${categoryName} » en ${newValue} (auparavant ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `a mis à jour la catégorie « ${categoryName} » en remplaçant Reçus par ${newValue}`;
            }
            return `a modifié la catégorie « ${categoryName} » en ${newValue} (précédemment ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `a renommé la catégorie « ${oldName} » en « ${newName} »`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `a supprimé l’indication de description « ${oldValue} » de la catégorie « ${categoryName} »`;
            }
            return !oldValue
                ? `a ajouté l’indication de description « ${newValue} » à la catégorie « ${categoryName} »`
                : `a modifié l’indication de description de la catégorie « ${categoryName} » en « ${newValue} » (auparavant « ${oldValue} »)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `a modifié le nom de la liste de tags en « ${newName} » (auparavant « ${oldName} »)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `a ajouté le tag « ${tagName} » à la liste « ${tagListName} »`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) =>
            `mis à jour la liste de tags « ${tagListName} » en remplaçant le tag « ${oldName} » par « ${newName} »`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'activé' : 'désactivé'} l’étiquette « ${tagName} » dans la liste « ${tagListName} »`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `a supprimé le tag « ${tagName} » de la liste « ${tagListName} »`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `a supprimé les balises « ${count} » de la liste « ${tagListName} »`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `a mis à jour le tag « ${tagName} » dans la liste « ${tagListName} » en modifiant ${updatedField} en « ${newValue} » (auparavant « ${oldValue} »)`;
            }
            return `a mis à jour le tag « ${tagName} » dans la liste « ${tagListName} » en ajoutant un(e) ${updatedField} de « ${newValue} »`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `a modifié le ${customUnitName} ${updatedField} en « ${newValue} » (auparavant « ${oldValue} »)`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? 'activé' : 'désactivé'} suivi fiscal sur les indemnités kilométriques`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `a ajouté un nouveau tarif « ${customUnitName} » « ${rateName} »`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `a modifié le taux de ${customUnitName} ${updatedField} « ${customUnitRateName} » à « ${newValue} » (auparavant « ${oldValue} »)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `a modifié le taux de taxe sur le tarif de distance « ${customUnitRateName} » en « ${newValue} (${newTaxPercentage}) » (auparavant « ${oldValue} (${oldTaxPercentage}) »)`;
            }
            return `a ajouté le taux de taxe « ${newValue} (${newTaxPercentage}) » au taux de distance « ${customUnitRateName} »`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `a modifié la partie récupérable de la taxe sur le tarif de distance « ${customUnitRateName} » à « ${newValue} » (précédemment « ${oldValue} »)`;
            }
            return `a ajouté une partie de taxe récupérable de « ${newValue} » au taux de distance « ${customUnitRateName} »`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `a supprimé le taux « ${rateName} » pour « ${customUnitName} »`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `ajout du champ de rapport ${fieldType} « ${fieldName} »`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `définir la valeur par défaut du champ de rapport « ${fieldName} » sur « ${defaultValue} »`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `a ajouté l’option « ${optionName} » au champ de rapport « ${fieldName} »`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `a supprimé l’option « ${optionName} » du champ de rapport « ${fieldName} »`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'activé' : 'désactivé'} l’option « ${optionName} » pour le champ de rapport « ${fieldName} »`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'activé' : 'désactivé'} toutes les options pour le champ de rapport « ${fieldName} »`;
            }
            return `${allEnabled ? 'activé' : 'désactivé'} l’option "${optionName}" pour le champ de rapport "${fieldName}", ce qui rend toutes les options ${allEnabled ? 'activé' : 'désactivé'}`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `${fieldType} de rapport « ${fieldName} » supprimé`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `a mis à jour « Empêcher l’auto-approbation » en « ${newValue === 'true' ? 'Activé' : 'Désactivé'} » (auparavant « ${oldValue === 'true' ? 'Activé' : 'Désactivé'} »)`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `a modifié le montant maximal d’une dépense nécessitant un reçu à ${newValue} (auparavant ${oldValue})`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `a modifié le montant maximum de dépense pour les infractions à ${newValue} (auparavant ${oldValue})`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `« Ancienneté maximale de la dépense (jours) » mise à jour sur « ${newValue} » (auparavant « ${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue} »)`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `définir la date de soumission du rapport mensuel sur « ${newValue} »`;
            }
            return `a mis à jour la date de soumission du rapport mensuel en « ${newValue} » (auparavant « ${oldValue} »)`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `a mis à jour « Refacturer les dépenses aux clients » en « ${newValue} » (auparavant « ${oldValue} »)`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `mis à jour « Dépense en espèces par défaut » en « ${newValue} » (précédemment « ${oldValue} »)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `a activé « Appliquer les titres de rapport par défaut » ${value ? 'Activé' : 'désactivé'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `a mis à jour le nom de cet espace de travail en « ${newName} » (auparavant « ${oldName} »)`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `définir la description de cet espace de travail sur « ${newDescription} »`
                : `a mis à jour la description de cet espace de travail en « ${newDescription} » (précédemment « ${oldDescription} »)`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('et');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `vous a retiré(e) du workflow d’approbation et du chat de dépenses de ${joinedNames}. Les rapports déjà soumis resteront disponibles pour approbation dans votre boîte de réception.`,
                other: `vous a retiré des workflows d’approbation et des discussions de dépenses de ${joinedNames}. Les rapports précédemment soumis resteront disponibles pour approbation dans votre boîte de réception.`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `a mis à jour votre rôle dans ${policyName} de ${oldRole} à utilisateur. Vous avez été retiré de toutes les discussions de dépenses des déclarants, sauf de la vôtre.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `a mis à jour la devise par défaut en ${newCurrency} (auparavant ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `a mis à jour la fréquence de création automatique de rapports sur « ${newFrequency} » (auparavant « ${oldFrequency} »)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `a mis à jour le mode d’approbation sur « ${newValue} » (auparavant « ${oldValue} »)`,
        upgradedWorkspace: 'a mis à niveau cet espace de travail vers l’offre Control',
        forcedCorporateUpgrade: `Cet espace de travail a été mis à niveau vers l’offre Control. Cliquez <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">ici</a> pour plus d’informations.`,
        downgradedWorkspace: 'a rétrogradé cet espace de travail vers l’offre Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `a modifié le taux de rapports acheminés aléatoirement pour approbation manuelle à ${Math.round(newAuditRate * 100)} % (auparavant ${Math.round(oldAuditRate * 100)} %)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `a modifié la limite d’approbation manuelle pour toutes les dépenses à ${newLimit} (auparavant ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'activé' : 'désactivé'} catégories`;
                case 'tags':
                    return `${enabled ? 'activé' : 'désactivé'} étiquettes`;
                case 'workflows':
                    return `${enabled ? 'activé' : 'désactivé'} flux de travail`;
                case 'distance rates':
                    return `Tarifs de distance ${enabled ? 'activé' : 'désactivé'}`;
                case 'accounting':
                    return `${enabled ? 'activé' : 'désactivé'} comptabilité`;
                case 'Expensify Cards':
                    return `${enabled ? 'activé' : 'désactivé'} Cartes Expensify`;
                case 'company cards':
                    return `Cartes d’entreprise ${enabled ? 'activé' : 'désactivé'}`;
                case 'invoicing':
                    return `${enabled ? 'activé' : 'désactivé'} facturation`;
                case 'per diem':
                    return `${enabled ? 'activé' : 'désactivé'} indemnité journalière`;
                case 'receipt partners':
                    return `${enabled ? 'activé' : 'désactivé'} partenaires de reçus`;
                case 'rules':
                    return `${enabled ? 'activé' : 'désactivé'} règles`;
                case 'tax tracking':
                    return `Suivi fiscal ${enabled ? 'activé' : 'désactivé'}`;
                default:
                    return `${enabled ? 'activé' : 'désactivé'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `Suivi des participants ${enabled ? 'activé' : 'désactivé'}`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `Remboursements ${enabled ? 'activé' : 'désactivé'} pour cet espace de travail`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `a ajouté la taxe « ${taxName} »`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `a supprimé la taxe « ${taxName} »`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `a renommé la taxe « ${oldValue} » en « ${newValue} »`;
                }
                case 'code': {
                    return `a modifié le code de taxe pour « ${taxName} » de « ${oldValue} » à « ${newValue} »`;
                }
                case 'rate': {
                    return `a modifié le taux de taxe pour « ${taxName} » de « ${oldValue} » à « ${newValue} »`;
                }
                case 'enabled': {
                    return `${oldValue ? 'désactivé' : 'activé'} la taxe « ${taxName} »`;
                }
                default: {
                    return '';
                }
            }
        },
    },
    roomMembersPage: {
        memberNotFound: 'Membre introuvable.',
        useInviteButton: 'Pour inviter un nouveau membre dans la discussion, veuillez utiliser le bouton d’invitation ci-dessus.',
        notAuthorized: `Vous n’avez pas accès à cette page. Si vous essayez de rejoindre ce salon, demandez simplement à un membre du salon de vous ajouter. Autre chose ? Contactez ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Il semble que ce salon ait été archivé. Pour toute question, contactez ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Êtes-vous sûr de vouloir supprimer ${memberName} de la salle ?`,
            other: 'Voulez-vous vraiment retirer les membres sélectionnés de la salle ?',
        }),
        error: {
            genericAdd: 'Un problème est survenu lors de l’ajout de ce membre de la salle',
        },
    },
    newTaskPage: {
        assignTask: 'Attribuer une tâche',
        assignMe: 'M’assigner',
        confirmTask: 'Confirmer la tâche',
        confirmError: 'Veuillez saisir un titre et sélectionner une destination de partage',
        descriptionOptional: 'Description (facultatif)',
        pleaseEnterTaskName: 'Veuillez saisir un titre',
        pleaseEnterTaskDestination: 'Veuillez sélectionner l’endroit où vous souhaitez partager cette tâche',
    },
    task: {
        task: 'Tâche',
        title: 'Titre',
        description: 'Description',
        assignee: 'Cessionnaire',
        completed: 'Terminé',
        action: 'Terminer',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `tâche pour ${title}`,
            completed: 'marqué comme terminé',
            canceled: 'tâche supprimée',
            reopened: 'marqué comme incomplet',
            error: 'Vous n’êtes pas autorisé à effectuer l’action demandée',
        },
        markAsComplete: 'Marquer comme terminé',
        markAsIncomplete: 'Marquer comme incomplet',
        assigneeError: 'Une erreur s’est produite lors de l’attribution de cette tâche. Veuillez essayer un autre responsable.',
        genericCreateTaskFailureMessage: 'Une erreur s’est produite lors de la création de cette tâche. Veuillez réessayer plus tard.',
        deleteTask: 'Supprimer la tâche',
        deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer cette tâche ?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `Relevé de ${monthName} ${year}`,
    },
    keyboardShortcutsPage: {
        title: 'Raccourcis clavier',
        subtitle: 'Gagnez du temps avec ces raccourcis clavier pratiques :',
        shortcuts: {
            openShortcutDialog: 'Ouvre la boîte de dialogue des raccourcis clavier',
            markAllMessagesAsRead: 'Marquer tous les messages comme lus',
            escape: 'Échapper les boîtes de dialogue',
            search: 'Ouvrir la boîte de dialogue de recherche',
            newChat: 'Nouvel écran de discussion',
            copy: 'Copier le commentaire',
            openDebug: 'Ouvrir la boîte de dialogue des préférences de test',
        },
    },
    guides: {
        screenShare: 'Partage d’écran',
        screenShareRequest: 'Expensify vous invite à un partage d’écran',
    },
    search: {
        resultsAreLimited: 'Les résultats de recherche sont limités.',
        viewResults: 'Voir les résultats',
        resetFilters: 'Réinitialiser les filtres',
        searchResults: {
            emptyResults: {
                title: 'Rien à afficher',
                subtitle: `Essayez de modifier vos critères de recherche ou de créer quelque chose avec le bouton +.`,
            },
            emptyExpenseResults: {
                title: 'Vous n’avez encore créé aucune dépense',
                subtitle: 'Créez une dépense ou faites un essai d’Expensify pour en savoir plus.',
                subtitleWithOnlyCreateButton: 'Utilisez le bouton vert ci-dessous pour créer une dépense.',
            },
            emptyReportResults: {
                title: 'Vous n’avez encore créé aucun rapport',
                subtitle: 'Créez un rapport ou faites un essai d’Expensify pour en savoir plus.',
                subtitleWithOnlyCreateButton: 'Utilisez le bouton vert ci-dessous pour créer un rapport.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Vous n’avez pas encore créé de
                    factures
                `),
                subtitle: 'Envoyez une facture ou testez Expensify pour en savoir plus.',
                subtitleWithOnlyCreateButton: 'Utilisez le bouton vert ci-dessous pour envoyer une facture.',
            },
            emptyTripResults: {
                title: 'Aucun déplacement à afficher',
                subtitle: 'Commencez en réservant votre premier voyage ci-dessous.',
                buttonText: 'Réserver un voyage',
            },
            emptySubmitResults: {
                title: 'Aucune dépense à soumettre',
                subtitle: 'Tout est en ordre. Faites un tour d’honneur !',
                buttonText: 'Créer un rapport',
            },
            emptyApproveResults: {
                title: 'Aucune dépense à approuver',
                subtitle: 'Zéro note de frais. Détente maximale. Bien joué !',
            },
            emptyPayResults: {
                title: 'Aucune dépense à payer',
                subtitle: 'Félicitations ! Vous avez franchi la ligne d’arrivée.',
            },
            emptyExportResults: {
                title: 'Aucune dépense à exporter',
                subtitle: 'Il est temps de lever le pied, beau travail.',
            },
            emptyStatementsResults: {
                title: 'Aucune dépense à afficher',
                subtitle: 'Aucun résultat. Veuillez essayer de modifier vos filtres.',
            },
            emptyUnapprovedResults: {
                title: 'Aucune dépense à approuver',
                subtitle: 'Zéro note de frais. Détente maximale. Bien joué !',
            },
        },
        statements: 'Relevés',
        unapprovedCash: 'Espèces non approuvées',
        unapprovedCard: 'Carte non approuvée',
        reconciliation: 'Rapprochement',
        saveSearch: 'Enregistrer la recherche',
        deleteSavedSearch: 'Supprimer la recherche enregistrée',
        deleteSavedSearchConfirm: 'Êtes-vous sûr de vouloir supprimer cette recherche ?',
        searchName: 'Rechercher un nom',
        savedSearchesMenuItemTitle: 'Enregistré',
        groupedExpenses: 'dépenses groupées',
        bulkActions: {
            approve: 'Approuver',
            pay: 'Payer',
            delete: 'Supprimer',
            hold: 'En attente',
            unhold: 'Lever le blocage',
            reject: 'Rejeter',
            noOptionsAvailable: 'Aucune option disponible pour le groupe de dépenses sélectionné.',
        },
        filtersHeader: 'Filtres',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Avant ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `Après ${date ?? ''}`,
                on: ({date}: OptionalParam<DateParams> = {}) => `Le ${date ?? ''}`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'Jamais',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: 'Le mois dernier',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: 'Ce mois-ci',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: 'Dernier relevé',
                },
            },
            status: 'Statut',
            keyword: 'Mot-clé',
            keywords: 'Mots-clés',
            currency: 'Devise',
            completed: 'Terminé',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Moins de ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Supérieur à ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Entre ${greaterThan} et ${lessThan}`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Égal à ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Cartes individuelles',
                closedCards: 'Cartes clôturées',
                cardFeeds: 'Flux de cartes',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Tous les ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Toutes les cartes CSV importées${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} est ${value}`,
            current: 'Actuel',
            past: 'Passé',
            submitted: 'Soumis',
            approved: 'Approuvé',
            paid: 'Payé',
            exported: 'Exporté',
            posted: 'Publié',
            withdrawn: 'Retiré',
            billable: 'Facturable',
            reimbursable: 'Remboursable',
            purchaseCurrency: 'Devise de l’achat',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'De',
                [CONST.SEARCH.GROUP_BY.CARD]: 'Carte',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'ID de retrait',
            },
            feed: 'Flux',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Carte Expensify',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: 'Remboursement',
            },
            is: 'Est',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: 'Soumettre',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: 'Approuver',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: 'Payer',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'Exporter',
            },
        },
        has: 'A',
        groupBy: 'Grouper par',
        moneyRequestReport: {
            emptyStateTitle: 'Ce rapport n’a aucune dépense.',
        },
        noCategory: 'Aucune catégorie',
        noTag: 'Aucun tag',
        expenseType: 'Type de dépense',
        withdrawalType: 'Type de retrait',
        recentSearches: 'Recherches récentes',
        recentChats: 'Discussions récentes',
        searchIn: 'Rechercher dans',
        searchPlaceholder: 'Rechercher quelque chose',
        suggestions: 'Suggestions',
        exportSearchResults: {
            title: 'Créer l’export',
            description: 'Ouah, ça fait beaucoup d’éléments ! Nous allons les regrouper et Concierge vous enverra bientôt un fichier.',
        },
        exportAll: {
            selectAllMatchingItems: 'Sélectionner tous les éléments correspondants',
            allMatchingItemsSelected: 'Tous les éléments correspondants sont sélectionnés',
        },
    },
    genericErrorPage: {
        title: 'Oups, quelque chose s’est mal passé !',
        body: {
            helpTextMobile: 'Veuillez fermer et rouvrir l’application, ou passer à',
            helpTextWeb: 'Web.',
            helpTextConcierge: 'Si le problème persiste, contactez',
        },
        refresh: 'Actualiser',
    },
    fileDownload: {
        success: {
            title: 'Téléchargé !',
            message: 'Pièce jointe téléchargée avec succès !',
            qrMessage:
                'Vérifiez votre dossier Photos ou Téléchargements pour une copie de votre code QR. Astuce de pro : ajoutez-le à une présentation pour que votre public puisse le scanner et se connecter directement avec vous.',
        },
        generalError: {
            title: 'Erreur de pièce jointe',
            message: 'La pièce jointe ne peut pas être téléchargée',
        },
        permissionError: {
            title: 'Accès au stockage',
            message: 'Expensify ne peut pas enregistrer les pièces jointes sans accès au stockage. Touchez Paramètres pour mettre à jour les autorisations.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Nouveau Expensify',
        about: 'À propos du nouveau Expensify',
        update: 'Mettre à jour le nouveau Expensify',
        checkForUpdates: 'Rechercher des mises à jour',
        toggleDevTools: 'Activer les outils de développement',
        viewShortcuts: 'Afficher les raccourcis clavier',
        services: 'Services',
        hide: 'Masquer New Expensify',
        hideOthers: 'Masquer les autres',
        showAll: 'Tout afficher',
        quit: 'Quitter New Expensify',
        fileMenu: 'Fichier',
        closeWindow: 'Fermer la fenêtre',
        editMenu: 'Modifier',
        undo: 'Annuler',
        redo: 'Rétablir',
        cut: 'Couper',
        copy: 'Copier',
        paste: 'Coller',
        pasteAndMatchStyle: 'Coller en adaptant le style',
        pasteAsPlainText: 'Coller en texte brut',
        delete: 'Supprimer',
        selectAll: 'Tout sélectionner',
        speechSubmenu: 'Discours',
        startSpeaking: 'Commencer à parler',
        stopSpeaking: 'Arrêter de parler',
        viewMenu: 'Afficher',
        reload: 'Recharger',
        forceReload: 'Forcer le rechargement',
        resetZoom: 'Taille réelle',
        zoomIn: 'Zoom avant',
        zoomOut: 'Dézoomer',
        togglefullscreen: 'Activer le mode plein écran',
        historyMenu: 'Historique',
        back: 'Retour',
        forward: 'Transférer',
        windowMenu: 'Fenêtre',
        minimize: 'Réduire',
        zoom: 'Zoom',
        front: 'Tout mettre au premier plan',
        helpMenu: 'Aide',
        learnMore: 'En savoir plus',
        documentation: 'Documentation',
        communityDiscussions: 'Discussions de la communauté',
        searchIssues: 'Rechercher des problèmes',
    },
    historyMenu: {
        forward: 'Transférer',
        back: 'Retour',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Mise à jour disponible',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `La nouvelle version sera disponible sous peu.${!isSilentUpdating ? 'Nous vous informerons lorsque nous serons prêts à effectuer la mise à jour.' : ''}`,
            soundsGood: 'Parfait',
        },
        notAvailable: {
            title: 'Mise à jour indisponible',
            message: 'Aucune mise à jour n’est disponible pour le moment. Veuillez revenir plus tard !',
            okay: 'OK',
        },
        error: {
            title: 'Échec de la vérification des mises à jour',
            message: 'Nous n’avons pas pu vérifier s’il y avait une mise à jour. Veuillez réessayer dans un instant.',
        },
    },
    settlement: {
        status: {
            pending: 'En attente',
            cleared: 'Effacé',
            failed: 'Échec',
        },
        failedError: ({link}: {link: string}) => `Nous réessaierons ce règlement lorsque vous aurez <a href="${link}">déverrouillé votre compte</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • ID de retrait : ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Disposition du rapport',
        groupByLabel: 'Grouper par :',
        selectGroupByOption: 'Sélectionnez comment regrouper les dépenses du rapport',
        uncategorized: 'Non catégorisé',
        noTag: 'Aucun tag',
        selectGroup: ({groupName}: {groupName: string}) => `Sélectionner toutes les dépenses dans ${groupName}`,
        groupBy: {
            category: 'Catégorie',
            tag: 'Étiquette',
        },
    },
    report: {
        newReport: {
            createReport: 'Créer un rapport',
            chooseWorkspace: 'Choisissez un espace de travail pour ce rapport.',
            emptyReportConfirmationTitle: 'Vous avez déjà un rapport vide',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Voulez-vous vraiment créer un autre rapport dans ${workspaceName} ? Vous pouvez accéder à vos rapports vides dans`,
            emptyReportConfirmationPromptLink: 'Rapports',
            genericWorkspaceName: 'cet espace de travail',
        },
        genericCreateReportFailureMessage: 'Erreur inattendue lors de la création de cette discussion. Veuillez réessayer plus tard.',
        genericAddCommentFailureMessage: 'Erreur inattendue lors de la publication du commentaire. Veuillez réessayer plus tard.',
        genericUpdateReportFieldFailureMessage: 'Erreur inattendue lors de la mise à jour du champ. Veuillez réessayer plus tard.',
        genericUpdateReportNameEditFailureMessage: 'Erreur inattendue lors du renommage du rapport. Veuillez réessayer plus tard.',
        noActivityYet: 'Aucune activité pour le moment',
        connectionSettings: 'Paramètres de connexion',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `a modifié ${fieldName} en « ${newValue} » (auparavant « ${oldValue} »)`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `définir ${fieldName} sur « ${newValue} »`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) => {
                    if (!toPolicyName) {
                        return `a modifié l’espace de travail${fromPolicyName ? `(anciennement ${fromPolicyName})` : ''}`;
                    }
                    return `a modifié l’espace de travail pour ${toPolicyName}${fromPolicyName ? `(anciennement ${fromPolicyName})` : ''}`;
                },
                changeType: ({oldType, newType}: ChangeTypeParams) => `type modifié(e) de ${oldType} à ${newType}`,
                exportedToCSV: `exporté en CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `exporté vers ${translatedLabel}`;
                    },
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `exporté vers ${label} via`,
                    automaticActionTwo: 'paramètres de comptabilité',
                    manual: ({label}: ExportedToIntegrationParams) => `a marqué ce rapport comme exporté manuellement vers ${label}.`,
                    automaticActionThree: 'et créé avec succès un enregistrement pour',
                    reimburseableLink: 'dépenses personnelles',
                    nonReimbursableLink: 'dépenses de carte d’entreprise',
                    pending: ({label}: ExportedToIntegrationParams) => `a commencé à exporter ce rapport vers ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `échec de l’exportation de ce rapport vers ${label} (« ${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''} »)`,
                managerAttachReceipt: `a ajouté un reçu`,
                managerDetachReceipt: `a supprimé un reçu`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `payé ${currency}${amount} ailleurs`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `payé ${currency}${amount} via intégration`,
                outdatedBankAccount: `n’a pas pu traiter le paiement en raison d’un problème avec le compte bancaire du payeur`,
                reimbursementACHBounce: `impossible de traiter le paiement en raison d’un problème de compte bancaire`,
                reimbursementACHCancelled: `a annulé le paiement`,
                reimbursementAccountChanged: `n’a pas pu traiter le paiement, car le payeur a changé de compte bancaire`,
                reimbursementDelayed: `traité le paiement, mais il est retardé de 1 à 2 jours ouvrables supplémentaires`,
                selectedForRandomAudit: `sélectionné aléatoirement pour révision`,
                selectedForRandomAuditMarkdown: `[sélectionné aléatoirement](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) pour examen`,
                share: ({to}: ShareParams) => `membre invité ${to}`,
                unshare: ({to}: UnshareParams) => `membre ${to} supprimé`,
                stripePaid: ({amount, currency}: StripePaidParams) => `a payé ${currency}${amount}`,
                takeControl: `a pris le contrôle`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `un problème est survenu lors de la synchronisation avec ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Veuillez corriger le problème dans les <a href="${workspaceAccountingLink}">paramètres de l’espace de travail</a>.`,
                addEmployee: ({email, role}: AddEmployeeParams) => `ajout de ${email} en tant que ${role === 'member' ? 'un' : 'un'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `a mis à jour le rôle de ${email} vers ${newRole} (auparavant ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `champ personnalisé 1 de ${email} supprimé (précédemment « ${previousValue} »)`;
                    }
                    return !previousValue
                        ? `a ajouté « ${newValue} » au champ personnalisé 1 de ${email}`
                        : `a modifié le champ personnalisé 1 de ${email} en « ${newValue} » (auparavant « ${previousValue} »)`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `suppression du champ personnalisé 2 de ${email} (auparavant « ${previousValue} »)`;
                    }
                    return !previousValue
                        ? `« ${newValue} » a été ajouté au champ personnalisé 2 de ${email}`
                        : `a modifié le champ personnalisé 2 de ${email} en « ${newValue} » (auparavant « ${previousValue} »)`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} a quitté l’espace de travail`,
                removeMember: ({email, role}: AddEmployeeParams) => `${role} ${email} supprimé`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `connexion à ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} supprimée`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `connecté à ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
                leftTheChat: 'a quitté la discussion',
            },
            error: {
                invalidCredentials: 'Identifiants invalides, veuillez vérifier la configuration de votre connexion.',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} pour ${dayCount} ${dayCount === 1 ? 'jour' : 'jours'} jusqu’au ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} du ${timePeriod} le ${date}`,
    },
    footer: {
        features: 'Fonctionnalités',
        expenseManagement: 'Gestion des dépenses',
        spendManagement: 'Gestion des dépenses',
        expenseReports: 'Notes de frais',
        companyCreditCard: 'Carte de crédit d’entreprise',
        receiptScanningApp: 'Application de numérisation de reçus',
        billPay: 'Paiement de factures',
        invoicing: 'Facturation',
        CPACard: 'Carte CPA',
        payroll: 'Paie',
        travel: 'Voyage',
        resources: 'Ressources',
        expensifyApproved: 'Approuvé par Expensify !',
        pressKit: 'Kit de presse',
        support: 'Assistance',
        expensifyHelp: 'Aide Expensify',
        terms: 'Conditions d’utilisation',
        privacy: 'Confidentialité',
        learnMore: 'En savoir plus',
        aboutExpensify: 'À propos d’Expensify',
        blog: 'Blog',
        jobs: 'Emplois',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relations avec les investisseurs',
        getStarted: 'Commencer',
        createAccount: 'Créer un nouveau compte',
        logIn: 'Connexion',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Revenir à la liste des discussions',
        chatWelcomeMessage: 'Message de bienvenue du chat',
        navigatesToChat: 'Ouvre une discussion',
        newMessageLineIndicator: 'Indicateur de nouvelle ligne de message',
        chatMessage: 'Message de discussion',
        lastChatMessagePreview: 'Aperçu du dernier message de chat',
        workspaceName: 'Nom de l’espace de travail',
        chatUserDisplayNames: 'Noms d’affichage des membres du chat',
        scrollToNewestMessages: 'Faire défiler jusqu’aux messages les plus récents',
        preStyledText: 'Texte préformaté',
        viewAttachment: 'Afficher la pièce jointe',
    },
    parentReportAction: {
        deletedReport: 'Rapport supprimé',
        deletedMessage: 'Message supprimé',
        deletedExpense: 'Dépense supprimée',
        reversedTransaction: 'Transaction inversée',
        deletedTask: 'Tâche supprimée',
        hiddenMessage: 'Message masqué',
    },
    threads: {
        thread: 'Fil',
        replies: 'Réponses',
        reply: 'Répondre',
        from: 'De',
        in: 'dans',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `De ${reportName}${workspaceName ? `dans ${workspaceName}` : ''}`,
    },
    qrCodes: {
        copy: 'Copier l’URL',
        copied: 'Copié !',
    },
    moderation: {
        flagDescription: 'Tous les messages signalés seront envoyés à un modérateur pour examen.',
        chooseAReason: 'Choisissez une raison de signalement ci-dessous :',
        spam: 'Spam',
        spamDescription: 'Promotion non sollicitée hors sujet',
        inconsiderate: 'Inconsidéré',
        inconsiderateDescription: 'Formulation insultante ou irrespectueuse, aux intentions douteuses',
        intimidation: 'Intimidation',
        intimidationDescription: 'Poursuivre un programme de manière agressive malgré des objections légitimes',
        bullying: 'Harcèlement',
        bullyingDescription: 'Cibler une personne pour obtenir son obéissance',
        harassment: 'Harcèlement',
        harassmentDescription: 'Comportement raciste, misogyne ou autre comportement largement discriminatoire',
        assault: 'Agression',
        assaultDescription: 'Attaque émotionnelle spécifiquement ciblée avec l’intention de nuire',
        flaggedContent: 'Ce message a été signalé comme enfreignant nos règles communautaires et son contenu a été masqué.',
        hideMessage: 'Masquer le message',
        revealMessage: 'Révéler le message',
        levelOneResult: 'Envoie un avertissement anonyme et le message est signalé pour examen.',
        levelTwoResult: 'Message masqué du canal, avec avertissement anonyme et message signalé pour examen.',
        levelThreeResult: 'Message supprimé du canal, avertissement anonyme envoyé et message signalé pour examen.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Inviter à soumettre des notes de frais',
        inviteToChat: 'Inviter à discuter uniquement',
        nothing: 'Ne rien faire',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Accepter',
        decline: 'Refuser',
    },
    actionableMentionTrackExpense: {
        submit: 'Soumettre à quelqu’un',
        categorize: 'Catégoriser',
        share: 'Partager avec mon comptable',
        nothing: 'Rien pour l’instant',
    },
    teachersUnitePage: {
        teachersUnite: 'Les enseignants unis',
        joinExpensifyOrg:
            'Rejoignez Expensify.org pour éliminer l’injustice dans le monde entier. La campagne actuelle « Teachers Unite » soutient les enseignants partout en partageant les coûts des fournitures scolaires essentielles.',
        iKnowATeacher: 'Je connais un enseignant',
        iAmATeacher: 'Je suis enseignant',
        getInTouch: 'Excellent ! Veuillez partager leurs informations afin que nous puissions les contacter.',
        introSchoolPrincipal: "Présentation de votre directeur d'école",
        schoolPrincipalVerifyExpense:
            'Expensify.org partage le coût des fournitures scolaires essentielles afin que les élèves issus de foyers à faible revenu puissent bénéficier d’une meilleure expérience d’apprentissage. Votre directeur ou directrice sera invité(e) à vérifier vos dépenses.',
        principalFirstName: 'Prénom principal',
        principalLastName: 'Nom de famille du principal',
        principalWorkEmail: 'Adresse e-mail professionnelle principale',
        updateYourEmail: 'Mettre à jour votre adresse e-mail',
        updateEmail: 'Mettre à jour l’adresse e-mail',
        schoolMailAsDefault: ({contactMethodsRoute}: ContactMethodsRouteParams) =>
            `Avant de continuer, veuillez vous assurer que votre adresse e-mail scolaire est définie comme votre méthode de contact par défaut. Vous pouvez le faire dans Paramètres > Profil > <a href="${contactMethodsRoute}">Méthodes de contact</a>.`,
        error: {
            enterPhoneEmail: 'Saisissez une adresse e-mail ou un numéro de téléphone valide',
            enterEmail: 'Saisissez une adresse e-mail',
            enterValidEmail: 'Saisissez une adresse e-mail valide',
            tryDifferentEmail: 'Veuillez essayer une autre adresse e-mail',
        },
    },
    cardTransactions: {
        notActivated: 'Non activé',
        outOfPocket: 'Dépenses personnelles',
        companySpend: "Dépenses de l'entreprise",
    },
    distance: {
        addStop: 'Ajouter un arrêt',
        deleteWaypoint: 'Supprimer le point de passage',
        deleteWaypointConfirmation: 'Voulez-vous vraiment supprimer ce point de passage ?',
        address: 'Adresse',
        waypointDescription: {
            start: 'Commencer',
            stop: 'Arrêter',
        },
        mapPending: {
            title: 'Mappage en attente',
            subtitle: 'La carte sera générée lorsque vous serez de nouveau en ligne',
            onlineSubtitle: 'Un instant pendant que nous configurons la carte',
            errorTitle: 'Erreur de carte',
            errorSubtitle: 'Une erreur s’est produite lors du chargement de la carte. Veuillez réessayer.',
        },
        error: {
            selectSuggestedAddress: 'Veuillez sélectionner une adresse suggérée ou utiliser la position actuelle',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Carnet de notes perdu ou endommagé',
        nextButtonLabel: 'Suivant',
        reasonTitle: 'Pourquoi avez-vous besoin d’une nouvelle carte ?',
        cardDamaged: 'Ma carte a été endommagée',
        cardLostOrStolen: 'Ma carte a été perdue ou volée',
        confirmAddressTitle: 'Veuillez confirmer l’adresse postale pour votre nouvelle carte.',
        cardDamagedInfo: 'Votre nouvelle carte arrivera dans un délai de 2 à 3 jours ouvrables. Votre carte actuelle continuera de fonctionner jusqu’à l’activation de la nouvelle.',
        cardLostOrStolenInfo: 'Votre carte actuelle sera définitivement désactivée dès que votre commande sera passée. La plupart des cartes arrivent sous quelques jours ouvrés.',
        address: 'Adresse',
        deactivateCardButton: 'Désactiver la carte',
        shipNewCardButton: 'Expédier une nouvelle carte',
        addressError: 'L’adresse est requise',
        reasonError: 'Le motif est obligatoire',
        successTitle: 'Votre nouvelle carte est en route !',
        successDescription: 'Vous devrez l’activer dès qu’elle arrivera, dans quelques jours ouvrés. En attendant, vous pouvez utiliser une carte virtuelle.',
    },
    eReceipt: {
        guaranteed: 'Reçu électronique garanti',
        transactionDate: 'Date de transaction',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Démarrer une discussion, <success><strong>parrainer un ami</strong></success>.',
            header: 'Démarrer une discussion, parrainer un ami',
            body: 'Vous voulez que vos amis utilisent Expensify, eux aussi ? Il vous suffit de commencer une discussion avec eux et nous nous occupons du reste.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Soumettez une dépense, <success><strong>recommandez votre équipe</strong></success>.',
            header: 'Soumettez une dépense, parrainez votre équipe',
            body: 'Vous voulez que votre équipe utilise Expensify, elle aussi ? Il vous suffit de lui soumettre une dépense et nous nous occupons du reste.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Parrainer un ami',
            body: 'Vous voulez que vos amis utilisent aussi Expensify ? Il vous suffit de discuter, payer ou partager une dépense avec eux et nous nous chargeons du reste. Ou partagez simplement votre lien d’invitation !',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Parrainer un ami',
            header: 'Parrainer un ami',
            body: 'Vous voulez que vos amis utilisent aussi Expensify ? Il vous suffit de discuter, payer ou partager une dépense avec eux et nous nous chargeons du reste. Ou partagez simplement votre lien d’invitation !',
        },
        copyReferralLink: 'Copier le lien d’invitation',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Discutez avec votre spécialiste de configuration dans <a href="${href}">${adminReportName}</a> pour obtenir de l’aide`,
        default: `Envoyez un message à <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> pour obtenir de l’aide pour la configuration`,
    },
    violations: {
        allTagLevelsRequired: 'Tous les tags sont requis',
        autoReportedRejectedExpense: 'Cette dépense a été rejetée.',
        billableExpense: 'Facturable plus valide',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Reçu requis${formattedLimit ? `au-delà de ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Catégorie non valide',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Surcharge de conversion de ${surcharge}% appliquée`,
        customUnitOutOfPolicy: 'Taux non valide pour cet espace de travail',
        duplicatedTransaction: 'Doublon potentiel',
        fieldRequired: 'Les champs du rapport sont obligatoires',
        futureDate: 'Date ultérieure non autorisée',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Majoration de ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Date plus ancienne que ${maxAge} jours`,
        missingCategory: 'Catégorie manquante',
        missingComment: 'Description requise pour la catégorie sélectionnée',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `${tagName ?? 'étiquette'} manquant`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Le montant diffère de la distance calculée';
                case 'card':
                    return 'Montant supérieur à la transaction par carte';
                default:
                    if (displayPercentVariance) {
                        return `Montant supérieur de ${displayPercentVariance}% au reçu scanné`;
                    }
                    return 'Montant supérieur au reçu scanné';
            }
        },
        modifiedDate: 'La date diffère du reçu scanné',
        nonExpensiworksExpense: 'Dépense hors Expensiworks',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `La dépense dépasse la limite d’auto-approbation de ${formattedLimit}`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Montant dépassant la limite de catégorie de ${formattedLimit}/personne`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Montant dépassant la limite de ${formattedLimit}/personne`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Montant dépassant la limite de ${formattedLimit}/trajet`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Montant dépassant la limite de ${formattedLimit}/personne`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Montant dépassant la limite quotidienne de catégorie de ${formattedLimit}/personne`,
        receiptNotSmartScanned: 'Détails du reçu et de la dépense ajoutés manuellement.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `Reçu requis au-delà de la limite de catégorie de ${formattedLimit}`;
            }
            if (formattedLimit) {
                return `Reçu requis au-delà de ${formattedLimit}`;
            }
            if (category) {
                return `Reçu requis au-delà de la limite de catégorie`;
            }
            return 'Reçu requis';
        },
        prohibitedExpense: ({prohibitedExpenseTypes}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Dépense interdite :';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `alcool`;
                    case 'gambling':
                        return `Jeux d’argent`;
                    case 'tobacco':
                        return `tabac`;
                    case 'adultEntertainment':
                        return `divertissement pour adultes`;
                    case 'hotelIncidentals':
                        return `frais accessoires d’hôtel`;
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
        reviewRequired: 'Examen requis',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Impossible d’associer automatiquement le reçu en raison d’une connexion bancaire interrompue';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Connexion bancaire interrompue. <a href="${companyCardPageURL}">Reconnectez-vous pour faire correspondre le reçu</a>`
                    : 'Connexion bancaire rompue. Demandez à un admin de se reconnecter pour faire correspondre le reçu.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Demander à ${member} de marquer comme espèce ou attendre 7 jours et réessayer` : 'En attente de fusion avec la transaction par carte.';
            }
            return '';
        },
        brokenConnection530Error: 'Reçu en attente en raison d’une connexion bancaire interrompue',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Reçu en attente en raison d’une connexion bancaire rompue. Veuillez résoudre le problème dans <a href="${workspaceCompanyCardRoute}">Cartes d’entreprise</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Reçu en attente en raison d’une connexion bancaire rompue. Veuillez demander à un administrateur de l’espace de travail de résoudre le problème.',
        markAsCashToIgnore: 'Marquer comme espèces pour ignorer et demander le paiement.',
        smartscanFailed: ({canEdit = true}) => `Échec de la numérisation du reçu.${canEdit ? 'Saisir les détails manuellement.' : ''}`,
        receiptGeneratedWithAI: 'Reçu potentiellement généré par IA',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Il manque ${tagName ?? 'Étiquette'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Étiquette'} n’est plus valide`,
        taxAmountChanged: 'Le montant de la taxe a été modifié',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Tax'} n’est plus valide`,
        taxRateChanged: 'Le taux de taxe a été modifié',
        taxRequired: 'Taux de taxe manquant',
        none: 'Aucun',
        taxCodeToKeep: 'Choisissez quel code de taxe conserver',
        tagToKeep: 'Choisissez quelle balise conserver',
        isTransactionReimbursable: 'Choisissez si la transaction est remboursable',
        merchantToKeep: 'Choisissez le commerçant à conserver',
        descriptionToKeep: 'Choisissez la description à conserver',
        categoryToKeep: 'Choisissez la catégorie à conserver',
        isTransactionBillable: 'Choisir si la transaction est refacturable',
        keepThisOne: 'Conserver celui-ci',
        confirmDetails: `Confirmez les détails que vous conservez`,
        confirmDuplicatesInfo: `Les doublons que vous ne conservez pas seront laissés au soumissionnaire pour les supprimer.`,
        hold: 'Cette dépense a été mise en attente',
        resolvedDuplicates: 'a résolu le doublon',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} est requis`,
        reportContainsExpensesWithViolations: 'Le rapport contient des dépenses avec des violations.',
    },
    violationDismissal: {
        rter: {
            manual: 'a marqué ce reçu comme payé en espèces',
        },
        duplicatedTransaction: {
            manual: 'a résolu le doublon',
        },
    },
    videoPlayer: {
        play: 'Lire',
        pause: 'Pause',
        fullscreen: 'Plein écran',
        playbackSpeed: 'Vitesse de lecture',
        expand: 'Développer',
        mute: 'Muet',
        unmute: 'Réactiver le son',
        normal: 'Normal',
    },
    exitSurvey: {
        header: 'Avant de partir',
        reasonPage: {
            title: 'Veuillez nous indiquer pourquoi vous nous quittez',
            subtitle: 'Avant de partir, veuillez nous dire pourquoi vous souhaitez passer à Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'J’ai besoin d’une fonctionnalité qui est uniquement disponible dans Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Je ne comprends pas comment utiliser New Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Je comprends comment utiliser le nouveau Expensify, mais je préfère Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'De quelle fonctionnalité avez-vous besoin qui n’est pas disponible dans le nouveau Expensify ?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Que cherchez-vous à faire ?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Pourquoi préférez-vous Expensify Classic ?',
        },
        responsePlaceholder: 'Votre réponse',
        thankYou: 'Merci pour le retour !',
        thankYouSubtitle: 'Vos réponses nous aideront à créer un meilleur produit pour accomplir les tâches. Merci beaucoup !',
        goToExpensifyClassic: 'Passer à Expensify Classic',
        offlineTitle: 'On dirait que vous êtes coincé ici…',
        offline:
            'Vous semblez être hors ligne. Malheureusement, Expensify Classic ne fonctionne pas hors ligne, mais New Expensify oui. Si vous préférez utiliser Expensify Classic, réessayez lorsque vous aurez une connexion Internet.',
        quickTip: 'Astuce rapide...',
        quickTipSubTitle: 'Vous pouvez accéder directement à Expensify Classic en visitant expensify.com. Ajoutez-le à vos favoris pour y accéder rapidement !',
        bookACall: 'Réserver un appel',
        bookACallTitle: 'Souhaitez-vous parler à un chef de produit ?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Discuter directement sur les dépenses et les rapports',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Possibilité de tout faire sur mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Les notes de frais et les voyages à la vitesse de la messagerie',
        },
        bookACallTextTop: 'En passant à Expensify Classic, vous passerez à côté de :',
        bookACallTextBottom:
            'Nous serions ravis d’organiser un appel avec vous pour comprendre pourquoi. Vous pouvez planifier un appel avec l’un de nos chefs de produit senior pour discuter de vos besoins.',
        takeMeToExpensifyClassic: 'Emmenez-moi vers Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Une erreur s’est produite lors du chargement de messages supplémentaires',
        tryAgain: 'Réessayer',
    },
    systemMessage: {
        mergedWithCashTransaction: 'a fait correspondre un reçu à cette transaction',
    },
    subscription: {
        authenticatePaymentCard: 'Authentifier la carte de paiement',
        mobileReducedFunctionalityMessage: 'Vous ne pouvez pas modifier votre abonnement dans l’application mobile.',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `Essai gratuit : ${numOfDays} ${numOfDays === 1 ? 'jour' : 'jours'} restants`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Vos informations de paiement sont obsolètes',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Mettez à jour votre carte de paiement avant le ${date} pour continuer à utiliser toutes vos fonctionnalités préférées.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Votre paiement n’a pas pu être traité',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `Votre débit du ${date} de ${purchaseAmountOwed} n’a pas pu être traité. Veuillez ajouter une carte de paiement pour régler le montant dû.`
                        : 'Veuillez ajouter une carte de paiement pour régler le montant dû.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Vos informations de paiement sont obsolètes',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `Votre paiement est en retard. Veuillez régler votre facture avant le ${date} afin d’éviter toute interruption de service.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Vos informations de paiement sont obsolètes',
                subtitle: 'Votre paiement est en retard. Veuillez régler votre facture.',
            },
            billingDisputePending: {
                title: 'Votre carte n’a pas pu être débitée',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `Vous avez contesté le prélèvement de ${amountOwed} sur la carte se terminant par ${cardEnding}. Votre compte sera verrouillé jusqu’à ce que le litige soit résolu avec votre banque.`,
            },
            cardAuthenticationRequired: {
                title: 'Votre carte de paiement n’a pas été entièrement authentifiée.',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `Veuillez terminer le processus d’authentification pour activer votre carte de paiement se terminant par ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'Votre carte n’a pas pu être débitée',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `Votre carte de paiement a été refusée pour insuffisance de fonds. Veuillez réessayer ou ajouter une nouvelle carte de paiement pour régler votre solde impayé de ${amountOwed}.`,
            },
            cardExpired: {
                title: 'Votre carte n’a pas pu être débitée',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `Votre carte de paiement a expiré. Veuillez ajouter une nouvelle carte de paiement pour régler votre solde impayé de ${amountOwed}.`,
            },
            cardExpireSoon: {
                title: 'Votre carte expire bientôt',
                subtitle:
                    'Votre carte de paiement expirera à la fin de ce mois. Cliquez sur le menu à trois points ci-dessous pour la mettre à jour et continuer à utiliser toutes vos fonctionnalités préférées.',
            },
            retryBillingSuccess: {
                title: 'Succès !',
                subtitle: 'Votre carte a été débitée avec succès.',
            },
            retryBillingError: {
                title: 'Votre carte n’a pas pu être débitée',
                subtitle:
                    'Avant de réessayer, veuillez appeler directement votre banque pour autoriser les frais Expensify et lever tout blocage. Sinon, essayez d’ajouter une autre carte de paiement.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `Vous avez contesté le prélèvement de ${amountOwed} sur la carte se terminant par ${cardEnding}. Votre compte sera verrouillé jusqu’à ce que le litige soit résolu avec votre banque.`,
            preTrial: {
                title: 'Commencer un essai gratuit',
                subtitle: 'Pour la prochaine étape, <a href="#">terminez votre liste de configuration</a> afin que votre équipe puisse commencer à soumettre des notes de frais.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Essai : plus que ${numOfDays} ${numOfDays === 1 ? 'jour' : 'jours'} !`,
                subtitle: 'Ajoutez une carte de paiement pour continuer à utiliser toutes vos fonctionnalités préférées.',
            },
            trialEnded: {
                title: 'Votre essai gratuit est terminé',
                subtitle: 'Ajoutez une carte de paiement pour continuer à utiliser toutes vos fonctionnalités préférées.',
            },
            earlyDiscount: {
                claimOffer: 'Profiter de l’offre',
                subscriptionPageTitle: ({discountType}: EarlyDiscountTitleParams) =>
                    `<strong>${discountType} % de réduction sur votre première année !</strong> Ajoutez simplement une carte de paiement et commencez un abonnement annuel.`,
                onboardingChatTitle: ({discountType}: EarlyDiscountTitleParams) => `Offre limitée dans le temps : ${discountType}% de réduction sur votre première année !`,
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `Réclamer dans ${days > 0 ? `${days}j :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Paiement',
            subtitle: 'Ajoutez une carte pour payer votre abonnement Expensify.',
            addCardButton: 'Ajouter une carte de paiement',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Votre prochaine date de paiement est le ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Carte se terminant par ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `Nom : ${name}, Expiration : ${expiration}, Devise : ${currency}`,
            changeCard: 'Modifier la carte de paiement',
            changeCurrency: 'Changer la devise de paiement',
            cardNotFound: 'Aucune carte de paiement ajoutée',
            retryPaymentButton: 'Réessayer le paiement',
            authenticatePayment: 'Authentifier le paiement',
            requestRefund: 'Demander un remboursement',
            requestRefundModal: {
                full: 'Obtenir un remboursement est facile, il vous suffit de rétrograder votre compte avant votre prochaine date de facturation et vous recevrez un remboursement. <br /> <br /> Attention : rétrograder votre compte signifie que vos espace(s) de travail seront supprimés. Cette action est irréversible, mais vous pouvez toujours créer un nouvel espace de travail si vous changez d’avis.',
                confirm: 'Supprimer l’espace(s) de travail et rétrograder',
            },
            viewPaymentHistory: 'Afficher l’historique des paiements',
        },
        yourPlan: {
            title: 'Votre forfait',
            exploreAllPlans: 'Découvrir tous les forfaits',
            customPricing: 'Tarification personnalisée',
            asLowAs: ({price}: YourPlanPriceValueParams) => `à partir de ${price} par membre actif/mois`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} par membre/mois`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} par membre et par mois`,
            perMemberMonth: 'par membre/mois',
            collect: {
                title: 'Encaisser',
                description: 'Le forfait pour petites entreprises qui vous offre les notes de frais, les voyages et la messagerie.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, à ${upper}/membre actif sans la carte Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, à ${upper}/membre actif sans la carte Expensify.`,
                benefit1: 'Numérisation des reçus',
                benefit2: 'Remboursements',
                benefit3: 'Gestion des cartes d’entreprise',
                benefit4: 'Approbations de notes de frais et de voyages',
                benefit5: 'Réservation de voyage et règles',
                benefit6: 'Intégrations QuickBooks/Xero',
                benefit7: 'Discutez de dépenses, de rapports et de salons',
                benefit8: 'Assistance humaine et IA',
            },
            control: {
                title: 'Contrôle',
                description: 'Notes de frais, voyages et messagerie pour les grandes entreprises.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, à ${upper}/membre actif sans la carte Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, à ${upper}/membre actif sans la carte Expensify.`,
                benefit1: 'Tout ce qui est inclus dans l’offre Collect',
                benefit2: 'Workflows d’approbation à plusieurs niveaux',
                benefit3: 'Règles personnalisées de dépenses',
                benefit4: 'Intégrations ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Intégrations RH (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Analyses et rapports personnalisés',
                benefit8: 'Budgétisation',
            },
            thisIsYourCurrentPlan: 'Ceci est votre offre actuelle',
            downgrade: 'Passer à Collect',
            upgrade: 'Passer à Control',
            addMembers: 'Ajouter des membres',
            saveWithExpensifyTitle: 'Économisez avec la carte Expensify',
            saveWithExpensifyDescription: 'Utilisez notre calculateur d’économies pour voir comment le cash back de la Carte Expensify peut réduire votre facture Expensify.',
            saveWithExpensifyButton: 'En savoir plus',
        },
        compareModal: {
            comparePlans: 'Comparer les forfaits',
            subtitle: `<muted-text>Débloquez les fonctionnalités dont vous avez besoin avec l’abonnement qui vous convient. <a href="${CONST.PRICING}">Consultez notre page de tarification</a> pour obtenir un aperçu complet des fonctionnalités de chacun de nos abonnements.</muted-text>`,
        },
        details: {
            title: 'Détails de l’abonnement',
            annual: 'Abonnement annuel',
            taxExempt: 'Demander le statut d’exonération fiscale',
            taxExemptEnabled: 'Exonéré d’impôt',
            taxExemptStatus: 'Statut d’exonération fiscale',
            payPerUse: 'Paiement à l’usage',
            subscriptionSize: 'Taille de l’abonnement',
            headsUp:
                'Attention : si vous ne définissez pas la taille de votre abonnement maintenant, nous la définirons automatiquement en fonction du nombre de membres actifs de votre premier mois. Vous serez alors engagé à payer pour au moins ce nombre de membres pendant les 12 prochains mois. Vous pourrez augmenter la taille de votre abonnement à tout moment, mais vous ne pourrez pas la réduire avant la fin de votre abonnement.',
            zeroCommitment: 'Aucun engagement au tarif annuel réduit de l’abonnement',
        },
        subscriptionSize: {
            title: 'Taille de l’abonnement',
            yourSize: 'La taille de votre abonnement correspond au nombre de places ouvertes qui peuvent être occupées par tout membre actif au cours d’un mois donné.',
            eachMonth:
                'Chaque mois, votre abonnement couvre jusqu’au nombre de membres actifs défini ci-dessus. Chaque fois que vous augmentez la taille de votre abonnement, vous démarrez un nouvel abonnement de 12 mois à cette nouvelle taille.',
            note: 'Remarque : Un membre actif est toute personne ayant créé, modifié, soumis, approuvé, remboursé ou exporté des données de dépenses liées à l’espace de travail de votre entreprise.',
            confirmDetails: 'Confirmez les détails de votre nouvel abonnement annuel :',
            subscriptionSize: 'Taille de l’abonnement',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} membres actifs/mois`,
            subscriptionRenews: 'L’abonnement se renouvelle',
            youCantDowngrade: 'Vous ne pouvez pas rétrograder pendant votre abonnement annuel.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Vous avez déjà souscrit à un abonnement annuel pour ${size} membres actifs par mois jusqu’au ${date}. Vous pouvez passer à un abonnement à l’utilisation le ${date} en désactivant le renouvellement automatique.`,
            error: {
                size: 'Veuillez saisir une taille d’abonnement valide',
                sameSize: 'Veuillez saisir un nombre différent de la taille actuelle de votre abonnement',
            },
        },
        paymentCard: {
            addPaymentCard: 'Ajouter une carte de paiement',
            enterPaymentCardDetails: 'Saisissez les informations de votre carte de paiement',
            security: 'Expensify est conforme à la norme PCI-DSS, utilise un chiffrement de niveau bancaire et s’appuie sur une infrastructure redondante pour protéger vos données.',
            learnMoreAboutSecurity: 'En savoir plus sur notre sécurité.',
        },
        subscriptionSettings: {
            title: 'Paramètres d’abonnement',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Type d’abonnement : ${subscriptionType}, Taille de l’abonnement : ${subscriptionSize}, Renouvellement automatique : ${autoRenew}, Augmentation automatique des sièges annuels : ${autoIncrease}`,
            none: 'aucun',
            on: 'Activé',
            off: 'désactivé',
            annual: 'Annuel',
            autoRenew: 'Renouvellement automatique',
            autoIncrease: 'Augmenter automatiquement les sièges annuels',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Économisez jusqu’à ${amountWithCurrency}/mois par membre actif`,
            automaticallyIncrease:
                'Augmenter automatiquement vos licences annuelles pour tenir compte des membres actifs dépassant la taille de votre abonnement. Remarque : cela prolongera la date de fin de votre abonnement annuel.',
            disableAutoRenew: 'Désactiver le renouvellement automatique',
            helpUsImprove: 'Aidez-nous à améliorer Expensify',
            whatsMainReason: 'Quelle est la principale raison pour laquelle vous désactivez le renouvellement automatique ?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Se renouvelle le ${date}.`,
            pricingConfiguration: 'Le prix dépend de la configuration. Pour bénéficier du tarif le plus bas, choisissez un abonnement annuel et obtenez la carte Expensify.',
            learnMore: {
                part1: 'En savoir plus sur notre',
                pricingPage: 'page des tarifs',
                part2: 'ou discutez avec notre équipe dans votre',
                adminsRoom: 'Salon #admins.',
            },
            estimatedPrice: 'Prix estimé',
            changesBasedOn: 'Cela varie en fonction de votre utilisation de la carte Expensify et des options d’abonnement ci-dessous.',
        },
        requestEarlyCancellation: {
            title: 'Demander une annulation anticipée',
            subtitle: 'Quelle est la principale raison pour laquelle vous demandez une résiliation anticipée ?',
            subscriptionCanceled: {
                title: 'Abonnement annulé',
                subtitle: 'Votre abonnement annuel a été annulé.',
                info: 'Si vous souhaitez continuer à utiliser votre (vos) espace(s) de travail à l’usage, tout est prêt.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Si vous souhaitez empêcher toute activité et tout prélèvement futurs, vous devez <a href="${workspacesListRoute}">supprimer votre/vos espace(s) de travail</a>. Notez que lorsque vous supprimez votre/vos espace(s) de travail, vous serez facturé pour toute activité en attente ayant eu lieu durant le mois calendaire en cours.`,
            },
            requestSubmitted: {
                title: 'Demande envoyée',
                subtitle:
                    'Merci de nous avoir indiqué que vous envisagez d’annuler votre abonnement. Nous examinons votre demande et nous vous contacterons bientôt via votre discussion avec <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `En demandant une résiliation anticipée, je reconnais et j’accepte qu’Expensify n’a aucune obligation d’accéder à une telle demande en vertu des <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Conditions d’utilisation</a> d’Expensify ou de tout autre contrat de services applicable entre Expensify et moi, et qu’Expensify conserve l’entière discrétion quant à l’acceptation de toute telle demande.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'La fonctionnalité doit être améliorée',
        tooExpensive: 'Trop cher',
        inadequateSupport: 'Assistance clientèle insuffisante',
        businessClosing: 'Fermeture, réduction des effectifs ou acquisition de l’entreprise',
        additionalInfoTitle: 'Vers quel logiciel passez-vous et pourquoi ?',
        additionalInfoInputLabel: 'Votre réponse',
    },
    roomChangeLog: {
        updateRoomDescription: 'définir la description du salon sur :',
        clearRoomDescription: 'a effacé la description de la salle',
        changedRoomAvatar: 'a modifié l’avatar du salon',
        removedRoomAvatar: 'a supprimé l’avatar du salon',
    },
    delegate: {
        switchAccount: 'Changer de compte :',
        copilotDelegatedAccess: 'Copilot : Accès délégué',
        copilotDelegatedAccessDescription: 'Autoriser les autres membres à accéder à votre compte.',
        addCopilot: 'Ajouter un copilote',
        membersCanAccessYourAccount: 'Ces membres peuvent accéder à votre compte :',
        youCanAccessTheseAccounts: 'Vous pouvez accéder à ces comptes via le sélecteur de compte :',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Complet';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Limité';
                default:
                    return '';
            }
        },
        genericError: 'Oups, une erreur s’est produite. Veuillez réessayer.',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `au nom de ${delegator}`,
        accessLevel: 'Niveau d’accès',
        confirmCopilot: 'Confirmez votre copilote ci-dessous.',
        accessLevelDescription: 'Choisissez un niveau d’accès ci-dessous. Les accès Complet et Limité permettent aux copilotes de voir toutes les conversations et toutes les dépenses.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Autoriser un autre membre à effectuer toutes les actions sur votre compte, en votre nom. Inclut la messagerie, les soumissions, les validations, les paiements, les mises à jour des paramètres, et plus encore.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Autoriser un autre membre à effectuer la plupart des actions dans votre compte en votre nom. Sont exclus les approbations, les paiements, les rejets et les mises en attente.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Supprimer le copilote',
        removeCopilotConfirmation: 'Voulez-vous vraiment supprimer ce copilote ?',
        changeAccessLevel: 'Modifier le niveau d’accès',
        makeSureItIsYou: 'Vérifions que c’est bien vous',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Veuillez saisir le code magique envoyé à ${contactMethod} pour ajouter un copilote. Il devrait arriver d’ici une à deux minutes.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `Veuillez saisir le code magique envoyé à ${contactMethod} pour mettre à jour votre copilote.`,
        notAllowed: 'Pas si vite…',
        noAccessMessage: dedent(`
            En tant que copilote, vous n’avez pas accès à
            cette page. Désolé !
        `),
        notAllowedMessage: ({accountOwnerEmail}: AccountOwnerParams) =>
            `En tant que <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilote</a> pour ${accountOwnerEmail}, vous n’avez pas l’autorisation d’effectuer cette action. Désolé !`,
        copilotAccess: 'Accès à Copilot',
    },
    debug: {
        debug: 'Débogage',
        details: 'Détails',
        JSON: 'JSON',
        reportActions: 'Actions',
        reportActionPreview: 'Aperçu',
        nothingToPreview: 'Rien à prévisualiser',
        editJson: 'Modifier le JSON :',
        preview: 'Aperçu :',
        missingProperty: ({propertyName}: MissingPropertyParams) => `${propertyName} manquant`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Propriété invalide : ${propertyName} - Attendu : ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Valeur non valide - Attendu : ${expectedValues}`,
        missingValue: 'Valeur manquante',
        createReportAction: 'Créer une action de rapport',
        reportAction: 'Action du rapport',
        report: 'Rapport',
        transaction: 'Transaction',
        violations: 'Violations',
        transactionViolation: 'Infraction de transaction',
        hint: 'Les modifications de données ne seront pas envoyées au backend',
        textFields: 'Champs de texte',
        numberFields: 'Champs numériques',
        booleanFields: 'Champs booléens',
        constantFields: 'Champs constants',
        dateTimeFields: 'Champs DateTime',
        date: 'Date',
        time: 'Heure',
        none: 'Aucun',
        visibleInLHN: 'Visible dans le LHN',
        GBR: 'Royaume-Uni',
        RBR: 'RBR',
        true: 'vrai',
        false: 'faux',
        viewReport: 'Afficher le rapport',
        viewTransaction: 'Voir la transaction',
        createTransactionViolation: 'Créer une infraction de transaction',
        reasonVisibleInLHN: {
            hasDraftComment: 'A un commentaire brouillon',
            hasGBR: 'A un code GBP',
            hasRBR: 'Possède RBR',
            pinnedByUser: 'Épinglé par un membre',
            hasIOUViolations: 'Présente des violations de dettes',
            hasAddWorkspaceRoomErrors: 'Contient des erreurs d’ajout de salle d’espace de travail',
            isUnread: 'Est non lu (mode de concentration)',
            isArchived: 'Est archivé (mode le plus récent)',
            isSelfDM: 'Est un DM à soi-même',
            isFocused: 'Est temporairement concentré',
        },
        reasonGBR: {
            hasJoinRequest: 'A une demande d’adhésion (salon admin)',
            isUnreadWithMention: 'Est non lu avec mention',
            isWaitingForAssigneeToCompleteAction: 'En attente que le destinataire termine l’action',
            hasChildReportAwaitingAction: 'Un rapport enfant en attente d’action',
            hasMissingInvoiceBankAccount: 'Compte bancaire de facture manquant',
            hasUnresolvedCardFraudAlert: 'A une alerte de fraude de carte non résolue',
        },
        reasonRBR: {
            hasErrors: 'Contient des erreurs dans les données du rapport ou des actions du rapport',
            hasViolations: 'Comporte des violations',
            hasTransactionThreadViolations: 'Présente des violations de thread de transaction',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Un rapport est en attente d’action',
            theresAReportWithErrors: 'Il y a un rapport avec des erreurs',
            theresAWorkspaceWithCustomUnitsErrors: 'Un espace de travail comporte des erreurs d’unités personnalisées',
            theresAProblemWithAWorkspaceMember: 'Il y a un problème avec un membre de l’espace de travail',
            theresAProblemWithAWorkspaceQBOExport: 'Un problème est survenu avec un paramètre d’exportation de connexion d’espace de travail.',
            theresAProblemWithAContactMethod: 'Il y a un problème avec une méthode de contact',
            aContactMethodRequiresVerification: 'Une méthode de contact nécessite une vérification',
            theresAProblemWithAPaymentMethod: 'Un problème est survenu avec un moyen de paiement',
            theresAProblemWithAWorkspace: 'Il y a un problème avec un espace de travail',
            theresAProblemWithYourReimbursementAccount: 'Un problème est survenu avec votre compte de remboursement',
            theresABillingProblemWithYourSubscription: 'Un problème de facturation est survenu avec votre abonnement',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Votre abonnement a été renouvelé avec succès',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Un problème est survenu lors de la synchronisation de la connexion de l’espace de travail',
            theresAProblemWithYourWallet: 'Il y a un problème avec votre portefeuille',
            theresAProblemWithYourWalletTerms: 'Il y a un problème avec les conditions de votre portefeuille',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Faites un essai',
    },
    migratedUserWelcomeModal: {
        title: 'Bienvenue dans le nouveau Expensify !',
        subtitle: 'Il reprend tout ce que vous aimez dans notre expérience classique, avec tout un tas d’améliorations pour rendre votre vie encore plus facile :',
        confirmText: 'C’est parti !',
        helpText: 'Essayer la démo de 2 minutes',
        features: {
            search: 'Une recherche plus puissante sur mobile, sur le web et sur ordinateur',
            concierge: 'Assistant IA Concierge intégré pour vous aider à automatiser vos dépenses',
            chat: 'Discutez de n’importe quelle dépense pour résoudre rapidement les questions',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>Commencez <strong>ici&nbsp;!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Renommez vos recherches enregistrées</strong> ici !</tooltip>',
        accountSwitcher: '<tooltip>Accédez à vos <strong>comptes Copilot</strong> ici</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Scannez notre reçu de test</strong> pour voir comment cela fonctionne !</tooltip>',
            manager: '<tooltip>Choisissez notre <strong>gestionnaire de test</strong> pour l’essayer&nbsp;!</tooltip>',
            confirmation: '<tooltip>Maintenant, <strong>soumettez votre note de frais</strong> et regardez la magie opérer&nbsp;!</tooltip>',
            tryItOut: 'Essayez-le',
        },
        outstandingFilter: '<tooltip>Filtrer les dépenses\nqui <strong>doivent être approuvées</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Envoyez ce reçu pour\n<strong>terminer la prise en main&nbsp;!</strong></tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Ignorer les modifications ?',
        body: 'Voulez-vous vraiment abandonner les modifications que vous avez apportées ?',
        confirmText: 'Annuler les modifications',
    },
    scheduledCall: {
        book: {
            title: 'Planifier un appel',
            description: 'Trouvez un horaire qui vous convient.',
            slots: ({date}: {date: string}) => `<muted-text>Horaires disponibles pour le <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Confirmer l’appel',
            description: 'Assurez-vous que les détails ci-dessous vous conviennent. Une fois l’appel confirmé, nous vous enverrons une invitation avec plus d’informations.',
            setupSpecialist: 'Votre spécialiste de configuration',
            meetingLength: 'Durée de la réunion',
            dateTime: 'Date et heure',
            minutes: '30 minutes',
        },
        callScheduled: 'Appel planifié',
    },
    autoSubmitModal: {
        title: 'Tout est clair et soumis !',
        description: 'Tous les avertissements et violations ont été levés, donc :',
        submittedExpensesTitle: 'Ces dépenses ont été soumises',
        submittedExpensesDescription: 'Ces notes de frais ont été envoyées à votre approbateur, mais peuvent encore être modifiées jusqu’à leur approbation.',
        pendingExpensesTitle: 'Les dépenses en attente ont été déplacées',
        pendingExpensesDescription: 'Toutes les dépenses en attente sur carte ont été déplacées vers un rapport séparé jusqu’à leur comptabilisation.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Faites un essai de 2 minutes',
        },
        modal: {
            title: 'Faites un tour d’essai avec nous',
            description: 'Faites une rapide visite du produit pour vous mettre rapidement à niveau.',
            confirmText: 'Démarrer l’essai',
            helpText: 'Ignorer',
            employee: {
                description:
                    '<muted-text>Offrez à votre équipe <strong>3 mois gratuits d’Expensify&nbsp;!</strong> Il vous suffit de saisir l’adresse e-mail de votre responsable ci-dessous et de lui envoyer une note de frais test.</muted-text>',
                email: 'Saisissez l’e-mail de votre supérieur',
                error: 'Ce membre possède un espace de travail, veuillez saisir un nouveau membre pour effectuer le test.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Vous êtes actuellement en train d’essayer Expensify',
            readyForTheRealThing: 'Prêt pour la vraie expérience ?',
            getStarted: 'Commencer',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) => `# ${name} vous a invité à essayer Expensify
Salut ! Je viens de nous obtenir *3 mois gratuits* pour essayer Expensify, la façon la plus rapide de gérer les notes de frais.

Voici un *reçu test* pour vous montrer comment cela fonctionne :`,
    },
    export: {
        basicExport: 'Exportation basique',
        reportLevelExport: 'Toutes les données - niveau rapport',
        expenseLevelExport: 'Toutes les données - niveau de dépense',
        exportInProgress: 'Exportation en cours',
        conciergeWillSend: 'Concierge vous enverra le fichier sous peu.',
    },
    domain: {
        notVerified: 'Non vérifié',
        retry: 'Réessayer',
        verifyDomain: {
            title: 'Vérifier le domaine',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Avant de continuer, vérifiez que vous êtes propriétaire de <strong>${domainName}</strong> en modifiant ses paramètres DNS.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Accédez à votre fournisseur DNS et ouvrez les paramètres DNS pour <strong>${domainName}</strong>.`,
            addTXTRecord: 'Ajoutez l’enregistrement TXT suivant :',
            saveChanges: 'Enregistrez les modifications, puis revenez ici pour vérifier votre domaine.',
            youMayNeedToConsult: `Vous devrez peut-être consulter le service informatique de votre organisation pour terminer la vérification. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">En savoir plus</a>.`,
            warning: 'Après vérification, tous les membres Expensify de votre domaine recevront un e-mail indiquant que leur compte sera géré sous votre domaine.',
            codeFetchError: 'Impossible de récupérer le code de vérification',
            genericError: 'Nous n’avons pas pu vérifier votre domaine. Veuillez réessayer et contacter Concierge si le problème persiste.',
        },
        domainVerified: {
            title: 'Domaine vérifié',
            header: 'Wouhou ! Votre domaine a été vérifié',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Le domaine <strong>${domainName}</strong> a été vérifié avec succès et vous pouvez maintenant configurer SAML et d’autres fonctionnalités de sécurité.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'Authentification unique SAML (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SSO SAML</a> est une fonctionnalité de sécurité qui vous donne davantage de contrôle sur la façon dont les membres possédant une adresse e-mail <strong>${domainName}</strong> se connectent à Expensify. Pour l’activer, vous devrez vous vérifier en tant qu’administrateur d’entreprise autorisé.</muted-text>`,
            fasterAndEasierLogin: 'Connexion plus rapide et plus simple',
            moreSecurityAndControl: 'Plus de sécurité et de contrôle',
            onePasswordForAnything: 'Un seul mot de passe pour tout',
        },
        goToDomain: 'Aller au domaine',
        samlLogin: {
            title: 'Connexion SAML',
            subtitle: `<muted-text>Configurer la connexion des membres avec <a href="${CONST.SAML_HELP_URL}">l’authentification unique SAML (SSO).</a></muted-text>`,
            enableSamlLogin: 'Activer la connexion SAML',
            allowMembers: 'Autoriser les membres à se connecter avec SAML.',
            requireSamlLogin: 'Exiger la connexion SAML',
            anyMemberWillBeRequired: 'Tout membre connecté avec une méthode différente devra se réauthentifier en utilisant SAML.',
            enableError: 'Impossible de mettre à jour le paramètre d’activation SAML',
            requireError: 'Impossible de mettre à jour le paramètre d’exigence SAML',
        },
        samlConfigurationDetails: {
            title: 'Détails de configuration SAML',
            subtitle: 'Utilisez ces informations pour configurer SAML.',
            identityProviderMetaData: 'Métadonnées du fournisseur d’identité',
            entityID: 'ID d’entité',
            nameIDFormat: 'Format d’ID de nom',
            loginUrl: 'URL de connexion',
            acsUrl: 'URL ACS (Assertion Consumer Service)',
            logoutUrl: 'URL de déconnexion',
            sloUrl: 'URL SLO (Single Logout)',
            serviceProviderMetaData: 'Métadonnées du fournisseur de services',
            oktaScimToken: 'Jeton SCIM Okta',
            revealToken: 'Afficher le jeton',
            fetchError: 'Impossible de récupérer les détails de configuration SAML',
            setMetadataGenericError: 'Impossible de définir les métadonnées SAML',
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
