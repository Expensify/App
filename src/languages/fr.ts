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
        count: 'Nombre',
        cancel: 'Annuler',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: 'Fermer',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: 'Continuer',
        unshare: 'Arrêter le partage',
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
        reports: 'Notes de frais',
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
        digits: 'chiffres',
        twoFactorCode: 'Code à deux facteurs',
        workspaces: 'Espaces de travail',
        inbox: 'Boîte de réception',
        // @context Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”
        success: 'Réussi',
        group: 'Groupe',
        profile: 'Profil',
        referral: 'Parrainage',
        payments: 'Paiements',
        approvals: 'Approbations',
        wallet: 'Portefeuille',
        preferences: 'Préférences',
        view: 'Afficher',
        review: (reviewParams?: ReviewParams) => `Examiner${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'Non',
        signIn: 'Se connecter',
        signInWithGoogle: 'Se connecter avec Google',
        signInWithApple: 'Se connecter avec Apple',
        signInWith: 'Se connecter avec',
        continue: 'Continuer',
        firstName: 'Prénom',
        lastName: 'Nom de famille',
        scanning: 'Analyse en cours',
        analyzing: 'Analyse en cours...',
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
        unPin: 'ÉpinglerDésépingler',
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
        ssnLast4: '4 derniers chiffres du SSN',
        ssnFull9: '9 chiffres complets du SSN',
        addressLine: (lineNumber: number) => `Adresse ligne ${lineNumber}`,
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
        acceptTermsAndPrivacy: `J'accepte les <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Conditions d'utilisation d'Expensify</a> et la <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politique de confidentialité</a>`,
        acceptTermsAndConditions: `J’accepte les <a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">conditions générales</a>`,
        acceptTermsOfService: `J’accepte les <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Conditions d’utilisation d’Expensify</a>`,
        remove: 'Supprimer',
        admin: 'Administrateur',
        owner: 'Responsable',
        dateFormat: 'AAAA-MM-JJ',
        send: 'Envoyer',
        na: 'N/A',
        noResultsFound: 'Aucun résultat trouvé',
        noResultsFoundMatching: (searchString: string) => `Aucun résultat trouvé correspondant à « ${searchString} »`,
        recentDestinations: 'Dernières destinations',
        timePrefix: 'C’est',
        conjunctionFor: 'pour',
        todayAt: 'Aujourd’hui à',
        tomorrowAt: 'Demain à',
        yesterdayAt: 'Hier à',
        conjunctionAt: 'à',
        conjunctionTo: 'à',
        genericErrorMessage: 'Oups... une erreur s’est produite et votre demande n’a pas pu aboutir. Veuillez réessayer plus tard.',
        percentage: 'Pourcentage',
        converted: 'Converti',
        error: {
            invalidAmount: 'Montant invalide',
            acceptTerms: 'Vous devez accepter les conditions d’utilisation pour continuer',
            phoneNumber: `Veuillez saisir un numéro de téléphone complet
(par ex. ${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Ce champ est obligatoire',
            requestModified: 'Cette demande est en cours de modification par un autre membre',
            characterLimitExceedCounter: (length: number, limit: number) => `Limite de caractères dépassée (${length}/${limit})`,
            dateInvalid: 'Veuillez sélectionner une date valide',
            invalidDateShouldBeFuture: "Veuillez choisir aujourd'hui ou une date future",
            invalidTimeShouldBeFuture: 'Veuillez choisir une heure au moins une minute plus tard',
            invalidCharacter: 'Caractère invalide',
            enterMerchant: 'Saisissez un nom de commerçant',
            enterAmount: 'Saisissez un montant',
            missingMerchantName: 'Nom du commerçant manquant',
            missingAmount: 'Montant manquant',
            missingDate: 'Date manquante',
            enterDate: 'Saisissez une date',
            invalidTimeRange: 'Veuillez saisir une heure au format 12 heures (par ex. 14 h 30)',
            pleaseCompleteForm: 'Veuillez remplir le formulaire ci-dessus pour continuer',
            pleaseSelectOne: 'Veuillez sélectionner une option ci-dessus',
            invalidRateError: 'Veuillez saisir un taux valide',
            lowRateError: 'Le taux doit être supérieur à 0',
            email: 'Veuillez saisir une adresse e-mail valide',
            login: 'Une erreur s’est produite lors de la connexion. Veuillez réessayer.',
        },
        comma: 'virgule',
        semicolon: 'point-virgule',
        please: 'S’il vous plaît',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'Contactez-nous',
        pleaseEnterEmailOrPhoneNumber: 'Veuillez saisir une adresse e-mail ou un numéro de téléphone',
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: 'corriger les erreurs',
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
        me: 'moi',
        youAfterPreposition: 'vous',
        your: 'votre',
        conciergeHelp: 'Veuillez contacter Concierge pour obtenir de l’aide.',
        youAppearToBeOffline: 'Vous semblez être hors ligne.',
        thisFeatureRequiresInternet: 'Cette fonctionnalité nécessite une connexion Internet active.',
        attachmentWillBeAvailableOnceBackOnline: 'La pièce jointe sera disponible une fois de retour en ligne.',
        errorOccurredWhileTryingToPlayVideo: 'Une erreur s’est produite lors de la lecture de cette vidéo.',
        areYouSure: 'Êtes-vous sûr ?',
        verify: 'Vérifier',
        yesContinue: 'Oui, continuer',
        // @context Provides an example format for a website URL.
        websiteExample: 'p. ex. https://www.expensify.com',
        // @context Provides an example format for a ZIP/postal code.
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `par ex. ${zipSampleFormat}` : ''),
        description: 'Description',
        title: 'Titre',
        assignee: 'Assigné',
        createdBy: 'Créé par',
        with: 'avec',
        shareCode: 'Partager le code',
        share: 'Partager',
        per: 'par',
        // @context Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.
        mi: 'mille',
        km: 'kilomètre',
        copied: 'Copié !',
        someone: 'Quelqu’un',
        total: 'Total',
        edit: 'Modifier',
        letsDoThis: `C’est parti !`,
        letsStart: `Commençons`,
        showMore: 'Afficher plus',
        showLess: 'Afficher moins',
        merchant: 'Commerçant',
        change: 'Modifier',
        category: 'Catégorie',
        report: 'Note de frais',
        billable: 'Facturable',
        nonBillable: 'Non refacturable',
        tag: 'Tag',
        receipt: 'Reçu',
        verified: 'Vérifié',
        replace: 'Remplacer',
        distance: 'Distance',
        mile: 'mile',
        // @context Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.
        miles: 'miles',
        kilometer: 'kilomètre',
        kilometers: 'kilomètres',
        recent: 'Récent',
        all: 'Tout',
        am: 'AM',
        pm: 'Après-midi',
        // @context Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.
        tbd: 'À déterminer',
        selectCurrency: 'Sélectionner une devise',
        selectSymbolOrCurrency: 'Sélectionnez un symbole ou une devise',
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
        groupCurrency: 'Devise du groupe',
        rate: 'Taux',
        emptyLHN: {
            title: 'Youpi ! Vous êtes à jour.',
            subtitleText1: 'Recherchez une discussion à l’aide de la',
            subtitleText2: 'bouton ci-dessus, ou créez quelque chose en utilisant le',
            subtitleText3: 'bouton ci-dessous.',
        },
        businessName: 'Nom de l’entreprise',
        clear: 'Effacer',
        type: 'Type',
        reportName: 'Nom de la note de frais',
        action: 'Action',
        expenses: 'Dépenses',
        totalSpend: 'Dépense totale',
        tax: 'Tax',
        shared: 'Partagé',
        drafts: 'Brouillons',
        // @context as a noun, not a verb
        draft: 'Brouillon',
        finished: 'Terminé',
        upgrade: 'Mettre à niveau',
        downgradeWorkspace: 'Rétrograder l’espace de travail',
        companyID: 'ID de l’entreprise',
        userID: 'ID utilisateur',
        disable: 'Désactiver',
        export: 'Exporter',
        initialValue: 'Valeur initiale',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: 'Date actuelle',
        value: 'Valeur',
        downloadFailedTitle: 'Échec du téléchargement',
        downloadFailedDescription: 'Votre téléchargement n’a pas pu être terminé. Veuillez réessayer plus tard.',
        filterLogs: 'Filtrer les journaux',
        network: 'Réseau',
        reportID: 'ID de note de frais',
        longReportID: 'ID de note de frais longue',
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
        outstanding: 'Impayé',
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
        chatWithAccountManager: (accountManagerDisplayName: string) =>
            `Vous avez besoin de quelque chose de précis ? Discutez avec votre gestionnaire de compte, ${accountManagerDisplayName}.`,
        chatNow: 'Discuter maintenant',
        workEmail: 'E-mail professionnel',
        destination: 'Destination',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: 'Sous-taux',
        perDiem: 'Indemnité journalière',
        validate: 'Valider',
        downloadAsPDF: 'Télécharger en PDF',
        downloadAsCSV: 'Télécharger au format CSV',
        help: 'Aide',
        expenseReport: 'Note de frais',
        expenseReports: 'Notes de frais',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'Taux hors politique',
        leaveWorkspace: 'Quitter l’espace de travail',
        leaveWorkspaceConfirmation: 'Si vous quittez cet espace de travail, vous ne pourrez plus y soumettre de dépenses.',
        leaveWorkspaceConfirmationAuditor: 'Si vous quittez cet espace de travail, vous ne pourrez plus voir ses notes de frais et ses paramètres.',
        leaveWorkspaceConfirmationAdmin: 'Si vous quittez cet espace de travail, vous ne pourrez plus gérer ses paramètres.',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Si vous quittez cet espace de travail, vous serez remplacé dans le flux d’approbation par ${workspaceOwner}, le responsable de l’espace de travail.`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Si vous quittez cet espace de travail, vous serez remplacé en tant qu’exportateur préféré par ${workspaceOwner}, le responsable de l’espace de travail.`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `Si vous quittez cet espace de travail, vous serez remplacé en tant que contact technique par ${workspaceOwner}, le responsable de l’espace de travail.`,
        leaveWorkspaceReimburser:
            'Vous ne pouvez pas quitter cet espace de travail en tant que rembourseur. Veuillez définir un nouveau rembourseur dans Espaces de travail > Effectuer ou suivre des paiements, puis réessayez.',
        reimbursable: 'Remboursable',
        editYourProfile: 'Modifier votre profil',
        comments: 'Commentaires',
        sharedIn: 'Partagé dans',
        unreported: 'Non déclaré',
        explore: 'Explorer',
        insights: 'Analyses',
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
        reschedule: 'Replanifier',
        general: 'Général',
        workspacesTabTitle: 'Espaces de travail',
        headsUp: 'Attention !',
        submitTo: 'Soumettre à',
        forwardTo: 'Transférer à',
        merge: 'Fusionner',
        none: 'Aucun',
        unstableInternetConnection: 'Connexion Internet instable. Veuillez vérifier votre réseau et réessayer.',
        enableGlobalReimbursements: 'Activer les remboursements globaux',
        purchaseAmount: 'Montant de l’achat',
        originalAmount: 'Montant d’origine',
        frequency: 'Fréquence',
        link: 'Lien',
        pinned: 'Épinglé',
        read: 'Lu',
        copyToClipboard: 'Copier dans le presse-papiers',
        thisIsTakingLongerThanExpected: 'Cela prend plus de temps que prévu...',
        domains: 'Domaines',
        actionRequired: 'Action requise',
        duplicate: 'Dupliquer',
        duplicated: 'Dupliqué',
        duplicateExpense: 'Dupliquer la dépense',
        exchangeRate: 'Taux de change',
        reimbursableTotal: 'Total remboursable',
        nonReimbursableTotal: 'Total non remboursable',
    },
    supportalNoAccess: {
        title: 'Pas si vite',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `Vous n’êtes pas autorisé à effectuer cette action lorsque l’assistance est connectée (commande : ${command ?? ''}). Si vous pensez que Success devrait pouvoir effectuer cette action, veuillez lancer une conversation dans Slack.`,
    },
    lockedAccount: {
        title: 'Compte verrouillé',
        description: 'Vous n’êtes pas autorisé à effectuer cette action, car ce compte a été verrouillé. Veuillez contacter concierge@expensify.com pour connaître les prochaines étapes.',
    },
    location: {
        useCurrent: 'Utiliser la position actuelle',
        notFound: 'Nous n’avons pas pu localiser votre position. Veuillez réessayer ou saisir une adresse manuellement.',
        permissionDenied: 'Il semble que vous ayez refusé l’accès à votre position.',
        please: 'S’il vous plaît',
        allowPermission: 'autoriser l’accès à la position dans les paramètres',
        tryAgain: 'et réessayez.',
    },
    contact: {
        importContacts: 'Importer des contacts',
        importContactsTitle: 'Importer vos contacts',
        importContactsText: 'Importez les contacts de votre téléphone pour que vos personnes préférées soient toujours à portée de main.',
        importContactsExplanation: 'pour que vos personnes favorites soient toujours à portée de main.',
        importContactsNativeText: 'Plus qu’une étape ! Donnez-nous le feu vert pour importer vos contacts.',
    },
    anonymousReportFooter: {
        logoTagline: 'Participez à la discussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Accès à l’appareil photo',
        expensifyDoesNotHaveAccessToCamera: 'Expensify ne peut pas prendre de photos sans accès à votre appareil photo. Touchez Paramètres pour mettre à jour les autorisations.',
        attachmentError: 'Erreur de pièce jointe',
        errorWhileSelectingAttachment: 'Une erreur s’est produite lors de la sélection d’une pièce jointe. Veuillez réessayer.',
        errorWhileSelectingCorruptedAttachment: 'Une erreur s’est produite lors de la sélection d’une pièce jointe corrompue. Veuillez essayer un autre fichier.',
        takePhoto: 'Prendre une photo',
        chooseFromGallery: 'Choisir depuis la galerie',
        chooseDocument: 'Choisir un fichier',
        attachmentTooLarge: 'La pièce jointe est trop volumineuse',
        sizeExceeded: 'La taille de la pièce jointe dépasse la limite de 24 Mo',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `La taille de la pièce jointe dépasse la limite de ${maxUploadSizeInMB} Mo`,
        attachmentTooSmall: 'La pièce jointe est trop petite',
        sizeNotMet: 'La taille de la pièce jointe doit être supérieure à 240 octets',
        wrongFileType: 'Type de fichier invalide',
        notAllowedExtension: 'Ce type de fichier n’est pas autorisé. Veuillez essayer un autre type de fichier.',
        folderNotAllowedMessage: 'Le téléversement d’un dossier n’est pas autorisé. Veuillez essayer avec un autre fichier.',
        protectedPDFNotSupported: 'Les PDF protégés par mot de passe ne sont pas pris en charge',
        attachmentImageResized: 'Cette image a été redimensionnée pour l’aperçu. Téléchargez-la pour la résolution complète.',
        attachmentImageTooLarge: 'Cette image est trop volumineuse pour être prévisualisée avant le téléchargement.',
        tooManyFiles: (fileLimit: number) => `Vous pouvez téléverser jusqu’à ${fileLimit} fichiers à la fois.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Les fichiers dépassent ${maxUploadSizeInMB} Mo. Veuillez réessayer.`,
        someFilesCantBeUploaded: 'Certains fichiers ne peuvent pas être téléversés',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Les fichiers doivent faire moins de ${maxUploadSizeInMB} Mo. Tout fichier plus volumineux ne sera pas téléversé.`,
        maxFileLimitExceeded: 'Vous pouvez téléverser jusqu’à 30 reçus à la fois. Tout reçu supplémentaire ne sera pas téléversé.',
        unsupportedFileType: (fileType: string) => `Les fichiers ${fileType} ne sont pas pris en charge. Seuls les types de fichiers pris en charge seront téléchargés.`,
        learnMoreAboutSupportedFiles: 'En savoir plus sur les formats pris en charge.',
        passwordProtected: 'Les PDF protégés par mot de passe ne sont pas pris en charge. Seuls les fichiers pris en charge seront téléversés.',
    },
    dropzone: {
        addAttachments: 'Ajouter des pièces jointes',
        addReceipt: 'Ajouter un reçu',
        scanReceipts: 'Scanner des reçus',
        replaceReceipt: 'Remplacer le reçu',
    },
    filePicker: {
        fileError: 'Erreur de fichier',
        errorWhileSelectingFile: 'Une erreur s’est produite lors de la sélection d’un fichier. Veuillez réessayer.',
    },
    connectionComplete: {
        title: 'Connexion terminée',
        supportingText: 'Vous pouvez fermer cette fenêtre et revenir dans l’application Expensify.',
    },
    avatarCropModal: {
        title: 'Modifier la photo',
        description: 'Faites glisser, zoomez et faites pivoter votre image comme vous le souhaitez.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Aucune extension trouvée pour ce type MIME',
        problemGettingImageYouPasted: 'Un problème est survenu lors de la récupération de l’image que vous avez collée',
        commentExceededMaxLength: (formattedMaxLength: string) => `La longueur maximale du commentaire est de ${formattedMaxLength} caractères.`,
        taskTitleExceededMaxLength: (formattedMaxLength: string) => `La longueur maximale du titre de la tâche est de ${formattedMaxLength} caractères.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Mettre à jour l’application',
        updatePrompt:
            'Une nouvelle version de cette application est disponible.\nMettez-la à jour maintenant ou redémarrez l’application plus tard pour télécharger les dernières modifications.',
    },
    deeplinkWrapper: {
        launching: 'Lancement d’Expensify',
        expired: 'Votre session a expiré.',
        signIn: 'Veuillez vous reconnecter.',
    },
    multifactorAuthentication: {
        biometricsTest: {
            biometricsTest: 'Test biométrique',
            authenticationSuccessful: 'Authentification réussie',
            successfullyAuthenticatedUsing: ({authType}: MultifactorAuthenticationTranslationParams) => `Vous vous êtes authentifié avec succès en utilisant ${authType}.`,
            troubleshootBiometricsStatus: ({registered}: MultifactorAuthenticationTranslationParams) => `Données biométriques (${registered ? 'Enregistré' : 'Non enregistré'})`,
            yourAttemptWasUnsuccessful: 'Votre tentative d’authentification a échoué.',
            youCouldNotBeAuthenticated: 'Vous n’avez pas pu être authentifié',
            areYouSureToReject: 'Êtes-vous sûr ? La tentative d’authentification sera rejetée si vous fermez cet écran.',
            rejectAuthentication: 'Rejeter l’authentification',
            test: 'Test',
            biometricsAuthentication: 'Authentification biométrique',
        },
        pleaseEnableInSystemSettings: {
            start: 'Veuillez activer la vérification par reconnaissance faciale/empreinte digitale ou définir un code d’accès sur votre',
            link: 'paramètres système',
            end: '.',
        },
        oops: 'Oups, quelque chose s’est mal passé',
        looksLikeYouRanOutOfTime: 'Il semble que votre temps soit écoulé ! Veuillez réessayer chez le commerçant.',
        youRanOutOfTime: 'Votre temps est écoulé',
        letsVerifyItsYou: 'Vérifions qu’il s’agit bien de vous',
        verifyYourself: {
            biometrics: 'Vérifiez votre identité avec votre visage ou votre empreinte digitale',
        },
        enableQuickVerification: {
            biometrics: 'Activez une vérification rapide et sécurisée avec votre visage ou votre empreinte digitale. Aucun mot de passe ni code requis.',
        },
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            Abracadabra,
            vous êtes connecté !
        `),
        successfulSignInDescription: 'Retournez à votre onglet d’origine pour continuer.',
        title: 'Voici votre code magique',
        description: dedent(`
            Veuillez saisir le code depuis l’app où il a été initialement demandé
        `),
        doNotShare: dedent(`
            Ne partagez votre code avec personne.
            Expensify ne vous le demandera jamais !
        `),
        or: ', ou',
        signInHere: 'connectez-vous simplement ici',
        expiredCodeTitle: 'Code magique expiré',
        expiredCodeDescription: 'Retournez sur l’appareil d’origine et demandez un nouveau code',
        successfulNewCodeRequest: 'Code demandé. Veuillez vérifier votre appareil.',
        tfaRequiredTitle: dedent(`
            Authentification à deux facteurs
            obligatoire
        `),
        tfaRequiredDescription: dedent(`
            Veuillez saisir le code d’authentification à deux facteurs
            là où vous essayez de vous connecter.
        `),
        requestOneHere: 'demandez-en une ici.',
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
        title: 'Workflow d’approbation personnalisé',
        description: "Votre entreprise utilise un workflow d'approbation personnalisé dans cet espace de travail. Veuillez effectuer cette action dans Expensify Classic",
        goToExpensifyClassic: 'Passer à Expensify Classic',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: 'Soumettre une dépense, parrainer votre équipe',
            subtitleText: 'Vous voulez que votre équipe utilise Expensify, elle aussi ? Soumettez-leur simplement une dépense et nous nous chargeons du reste.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Planifier un appel',
    },
    hello: 'Bonjour',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Commencez ci-dessous.',
        anotherLoginPageIsOpen: 'Une autre page de connexion est ouverte.',
        anotherLoginPageIsOpenExplanation: 'Vous avez ouvert la page de connexion dans un autre onglet. Veuillez vous connecter depuis cet onglet.',
        welcome: 'Bienvenue !',
        welcomeWithoutExclamation: 'Bienvenue',
        phrase2: 'L’argent parle. Et maintenant que les conversations et les paiements sont réunis au même endroit, c’est aussi simple.',
        phrase3: 'Vos paiements vous parviennent aussi vite que vous faites passer votre message.',
        enterPassword: 'Veuillez saisir votre mot de passe',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, c’est toujours un plaisir de voir un nouveau visage par ici !`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `Veuillez saisir le code magique envoyé à ${login}. Il devrait arriver d’ici une à deux minutes.`,
    },
    login: {
        hero: {
            header: 'Voyages et dépenses, à la vitesse de la messagerie',
            body: 'Bienvenue dans la nouvelle génération d’Expensify, où vos déplacements et vos dépenses vont plus vite grâce à un chat contextuel en temps réel.',
        },
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Poursuivre la connexion avec l’authentification unique :',
        orContinueWithMagicCode: 'Vous pouvez aussi vous connecter avec un code magique',
        useSingleSignOn: 'Utiliser l’authentification unique',
        useMagicCode: 'Utiliser un code magique',
        launching: 'Lancement...',
        oneMoment: 'Un instant pendant que nous vous redirigeons vers le portail d’authentification unique de votre entreprise.',
    },
    reportActionCompose: {
        dropToUpload: 'Déposer pour téléverser',
        sendAttachment: 'Envoyer la pièce jointe',
        addAttachment: 'Ajouter une pièce jointe',
        writeSomething: 'Écrire quelque chose...',
        blockedFromConcierge: 'La communication est interdite',
        fileUploadFailed: 'Échec du téléversement. Fichier non pris en charge.',
        localTime: ({user, time}: LocalTimeParams) => `Il est ${time} pour ${user}`,
        edited: '(modifié)',
        emoji: 'Émoji',
        collapse: 'Réduire',
        expand: 'Agrandir',
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
        joinThread: 'Rejoindre la discussion',
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
        beginningOfArchivedRoom: (reportName: string, reportDetailsLink: string) =>
            `Vous avez manqué la fête dans <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>, il n’y a rien à voir ici.`,
        beginningOfChatHistoryDomainRoom: (domainRoom: string) =>
            `Cette discussion inclut tous les membres d’Expensify sur le domaine <strong>${domainRoom}</strong>. Utilisez-la pour discuter avec vos collègues, partager des conseils et poser des questions.`,
        beginningOfChatHistoryAdminRoom: (workspaceName: string) =>
            `Cette discussion est avec l’administrateur de <strong>${workspaceName}</strong>. Utilisez-la pour parler de la configuration de l’espace de travail et plus encore.`,
        beginningOfChatHistoryAnnounceRoom: (workspaceName: string) =>
            `Cette discussion inclut tout le monde dans <strong>${workspaceName}</strong>. Utilisez-la pour les annonces les plus importantes.`,
        beginningOfChatHistoryUserRoom: (reportName: string, reportDetailsLink: string) =>
            `Ce salon de discussion est destiné à tout ce qui concerne <strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong>.`,
        beginningOfChatHistoryInvoiceRoom: (invoicePayer: string, invoiceReceiver: string) =>
            `Cette discussion concerne les factures entre <strong>${invoicePayer}</strong> et <strong>${invoiceReceiver}</strong>. Utilisez le bouton + pour envoyer une facture.`,
        beginningOfChatHistory: (users: string) => `Cette discussion est avec ${users}.`,
        beginningOfChatHistoryPolicyExpenseChat: (workspaceName: string, submitterDisplayName: string) =>
            `C’est ici que <strong>${submitterDisplayName}</strong> soumettra des dépenses à <strong>${workspaceName}</strong>. Il suffit d’utiliser le bouton +.`,
        beginningOfChatHistorySelfDM: 'Ceci est votre espace personnel. Utilisez-le pour vos notes, tâches, brouillons et rappels.',
        beginningOfChatHistorySystemDM: 'Bienvenue ! Configurons votre compte.',
        chatWithAccountManager: 'Discutez avec votre gestionnaire de compte ici',
        sayHello: 'Dis bonjour !',
        yourSpace: 'Votre espace',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Bienvenue dans ${roomName} !`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `Utilisez le bouton + pour ${additionalText} une dépense.`,
        askConcierge: 'Posez vos questions et obtenez une assistance 24 h/24, 7 j/7 en temps réel.',
        conciergeSupport: 'Assistance 24 h/24, 7 j/7',
        create: 'créer',
        iouTypes: {
            pay: 'payer',
            split: 'fractionner',
            submit: 'soumettre',
            track: 'suivre',
            invoice: 'facture',
        },
    },
    adminOnlyCanPost: 'Seuls les administrateurs peuvent envoyer des messages dans cette salle.',
    reportAction: {
        asCopilot: 'en tant que copilote pour',
        harvestCreatedExpenseReport: (reportUrl: string, reportName: string) =>
            `a créé cette note de frais pour contenir toutes les dépenses de <a href="${reportUrl}">${reportName}</a> qui n’ont pas pu être soumises à la fréquence que vous avez choisie`,
        createdReportForUnapprovedTransactions: ({reportUrl, reportName}: CreatedReportForUnapprovedTransactionsParams) =>
            `a créé cette note de frais pour toutes les dépenses en attente provenant de <a href="${reportUrl}">${reportName}</a>`,
    },
    mentionSuggestions: {
        hereAlternateText: 'Avertir tout le monde dans cette conversation',
    },
    newMessages: 'Nouveaux messages',
    latestMessages: 'Derniers messages',
    youHaveBeenBanned: 'Remarque : vous avez été banni du chat dans ce canal.',
    reportTypingIndicator: {
        isTyping: 'est en train de saisir...',
        areTyping: 'sont en train d’écrire...',
        multipleMembers: 'Plusieurs membres',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Ce salon de discussion a été archivé.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) => `Cette discussion n’est plus active, car ${displayName} a fermé son compte.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Cette discussion n’est plus active, car ${oldDisplayName} a fusionné son compte avec celui de ${displayName}.`,
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
        fabNewChat: 'Commencer le chat',
        fabNewChatExplained: 'Ouvrir le menu des actions',
        fabScanReceiptExplained: 'Scanner le reçu',
        chatPinned: 'Discussion épinglée',
        draftedMessage: 'Message rédigé',
        listOfChatMessages: 'Liste des messages de discussion',
        listOfChats: 'Liste des discussions',
        saveTheWorld: 'Sauver le monde',
        tooltip: 'Commencez ici !',
        redirectToExpensifyClassicModal: {
            title: 'Bientôt disponible',
            description: 'Nous ajustons encore quelques éléments de New Expensify pour s’adapter à votre configuration spécifique. En attendant, rendez-vous sur Expensify Classic.',
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
        gps: 'GPS',
        odometer: 'Compteur kilométrique',
    },
    spreadsheet: {
        upload: 'Téléverser une feuille de calcul',
        import: 'Importer une feuille de calcul',
        dragAndDrop:
            '<muted-link>Faites glisser et déposez votre feuille de calcul ici, ou choisissez un fichier ci-dessous. Formats pris en charge : .csv, .txt, .xls et .xlsx.</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>Glissez-déposez votre feuille de calcul ici ou choisissez un fichier ci-dessous. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">En savoir plus</a> sur les formats de fichiers pris en charge.</muted-link>`,
        chooseSpreadsheet: '<muted-link>Sélectionnez un fichier de feuille de calcul à importer. Formats pris en charge : .csv, .txt, .xls et .xlsx.</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>Sélectionnez un fichier de feuille de calcul à importer. <a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">En savoir plus</a> sur les formats de fichier pris en charge.</muted-link>`,
        fileContainsHeader: 'Le fichier contient des en-têtes de colonnes',
        column: (name: string) => `Colonne ${name}`,
        fieldNotMapped: (fieldName: string) => `Oups ! Un champ obligatoire (« ${fieldName} ») n’a pas été associé. Veuillez examiner et réessayer.`,
        singleFieldMultipleColumns: (fieldName: string) => `Oups ! Vous avez associé un seul champ (« ${fieldName} ») à plusieurs colonnes. Veuillez vérifier et réessayer.`,
        emptyMappedField: (fieldName: string) => `Oups ! Le champ (« ${fieldName} ») contient une ou plusieurs valeurs vides. Veuillez vérifier et réessayer.`,
        importSuccessfulTitle: 'Importation réussie',
        importCategoriesSuccessfulDescription: ({categories}: {categories: number}) => (categories > 1 ? `${categories} catégories ont été ajoutées.` : '1 catégorie a été ajoutée.'),
        importMembersSuccessfulDescription: ({added, updated}: {added: number; updated: number}) => {
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
        importTagsSuccessfulDescription: ({tags}: {tags: number}) => (tags > 1 ? `${tags} tags ont été ajoutés.` : '1 tag a été ajouté.'),
        importMultiLevelTagsSuccessfulDescription: 'Des tags multi-niveaux ont été ajoutés.',
        importPerDiemRatesSuccessfulDescription: ({rates}: {rates: number}) => (rates > 1 ? `${rates} taux par jour ont été ajoutés.` : '1 taux de per diem a été ajouté.'),
        importFailedTitle: 'Échec de l’importation',
        importFailedDescription: 'Veuillez vous assurer que tous les champs sont correctement remplis, puis réessayez. Si le problème persiste, veuillez contacter Concierge.',
        importDescription: 'Choisissez les champs à faire correspondre à partir de votre feuille de calcul en cliquant sur le menu déroulant à côté de chaque colonne importée ci-dessous.',
        sizeNotMet: 'La taille du fichier doit être supérieure à 0 octet',
        invalidFileMessage:
            'Le fichier que vous avez téléchargé est vide ou contient des données non valides. Veuillez vous assurer que le fichier est correctement formaté et contient les informations nécessaires avant de le télécharger à nouveau.',
        importSpreadsheetLibraryError: 'Échec du chargement du module de feuille de calcul. Veuillez vérifier votre connexion Internet et réessayer.',
        importSpreadsheet: 'Importer une feuille de calcul',
        downloadCSV: 'Télécharger le CSV',
        importMemberConfirmation: () => ({
            one: `Veuillez confirmer les détails ci-dessous pour un nouveau membre de l’espace de travail qui sera ajouté dans le cadre de ce téléversement. Les membres existants ne recevront aucune mise à jour de rôle ni de message d’invitation.`,
            other: (count: number) =>
                `Veuillez confirmer les détails ci-dessous pour les ${count} nouveaux membres de l’espace de travail qui seront ajoutés dans le cadre de ce téléversement. Les membres existants ne recevront aucune mise à jour de rôle ni aucun message d’invitation.`,
        }),
    },
    receipt: {
        upload: 'Téléverser un reçu',
        uploadMultiple: 'Téléverser des reçus',
        desktopSubtitleSingle: `ou faites-le glisser et déposez-le ici`,
        desktopSubtitleMultiple: `ou faites-les glisser ici`,
        alternativeMethodsTitle: 'Autres façons d’ajouter des reçus :',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) =>
            `<label-text><a href="${downloadUrl}">Téléchargez l’application</a> pour scanner depuis votre téléphone</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>Transférer les reçus à <a href="mailto:${email}">${email}</a></label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">Ajoutez votre numéro</a> pour envoyer des reçus par SMS au ${phoneNumber}</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>Envoyez des reçus par SMS au ${phoneNumber} (numéros américains uniquement)</label-text>`,
        takePhoto: 'Prendre une photo',
        cameraAccess: 'L’accès à l’appareil photo est requis pour prendre des photos de reçus.',
        deniedCameraAccess: `L’accès à l’appareil photo n’a toujours pas été accordé, veuillez suivre <a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">ces instructions</a>.`,
        cameraErrorTitle: 'Erreur de l’appareil photo',
        cameraErrorMessage: "Une erreur s'est produite lors de la prise de la photo. Veuillez réessayer.",
        locationAccessTitle: 'Autoriser l’accès à la position',
        locationAccessMessage: 'L’accès à la localisation nous aide à conserver un fuseau horaire et une devise précis, où que vous alliez.',
        locationErrorTitle: 'Autoriser l’accès à la position',
        locationErrorMessage: 'L’accès à la localisation nous aide à conserver un fuseau horaire et une devise précis, où que vous alliez.',
        allowLocationFromSetting: `L’accès à la localisation nous aide à garder votre fuseau horaire et votre devise exacts où que vous alliez. Veuillez autoriser l’accès à la localisation dans les paramètres d’autorisation de votre appareil.`,
        dropTitle: 'Laisse tomber',
        dropMessage: 'Déposez votre fichier ici',
        flash: 'flash',
        multiScan: 'numérisation multiple',
        shutter: 'obturateur',
        gallery: 'galerie',
        deleteReceipt: 'Supprimer le reçu',
        deleteConfirmation: 'Voulez-vous vraiment supprimer ce reçu ?',
        addReceipt: 'Ajouter un reçu',
        scanFailed: 'Le reçu n’a pas pu être scanné, car il manque un commerçant, une date ou un montant.',
    },
    quickAction: {
        scanReceipt: 'Scanner le reçu',
        recordDistance: 'Suivre la distance',
        requestMoney: 'Créer une dépense',
        perDiem: 'Créer un per diem',
        splitBill: 'Diviser la dépense',
        splitScan: 'Diviser le reçu',
        splitDistance: 'Diviser la distance',
        paySomeone: ({name}: PaySomeoneParams = {}) => `Payer ${name ?? 'quelqu’un'}`,
        assignTask: 'Assigner la tâche',
        header: 'Action rapide',
        noLongerHaveReportAccess: 'Vous n’avez plus accès à votre précédente destination d’action rapide. Choisissez-en une nouvelle ci-dessous.',
        updateDestination: 'Mettre à jour la destination',
        createReport: 'Créer une note de frais',
    },
    iou: {
        amount: 'Montant',
        percent: 'Pourcentage',
        date: 'Date',
        taxAmount: 'Montant de la taxe',
        taxRate: 'Taux d’imposition',
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
        splitExpense: 'Diviser la dépense',
        splitDates: 'Diviser les dates',
        splitDateRange: ({startDate, endDate, count}: SplitDateRangeParams) => `Du ${startDate} au ${endDate} (${count} jours)`,
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${amount} de ${merchant}`,
        splitByPercentage: 'Fractionner par pourcentage',
        splitByDate: 'Diviser par date',
        addSplit: 'Ajouter une répartition',
        makeSplitsEven: 'Rendre les répartitions égales',
        editSplits: 'Modifier les partages',
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
        createExpenses: (expensesNumber: number) => `Créer ${expensesNumber} dépenses`,
        removeExpense: 'Supprimer la dépense',
        removeThisExpense: 'Supprimer cette dépense',
        removeExpenseConfirmation: 'Voulez-vous vraiment supprimer ce reçu ? Cette action ne peut pas être annulée.',
        addExpense: 'Ajouter une dépense',
        chooseRecipient: 'Choisir le destinataire',
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
        deletedTransaction: (amount: string, merchant: string) => `a supprimé une dépense (${amount} pour ${merchant})`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `a déplacé une dépense${reportName ? `depuis ${reportName}` : ''}`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `a déplacé cette dépense${reportName ? `vers <a href="${reportUrl}">${reportName}</a>` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `a déplacé cette dépense${reportName ? `depuis <a href="${reportUrl}">${reportName}</a>` : ''}`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `a déplacé cette dépense vers votre <a href="${reportUrl}">espace personnel</a>`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `a déplacé cette note de frais vers l’espace de travail <a href="${newParentReportUrl}">${toPolicyName}</a>`;
            }
            return `a déplacé cette <a href="${movedReportUrl}">note de frais</a> vers l’espace de travail <a href="${newParentReportUrl}">${toPolicyName}</a>`;
        },
        pendingMatchWithCreditCard: 'Reçu en attente de rapprochement avec une opération par carte',
        pendingMatch: 'Correspondance en attente',
        pendingMatchWithCreditCardDescription: 'Reçu en attente de rapprochement avec la transaction par carte. Marquez-le comme paiement en espèces pour annuler.',
        markAsCash: 'Marquer comme espèce',
        routePending: 'Acheminement en attente...',
        receiptScanning: () => ({
            one: 'Analyse du reçu…',
            other: 'Scan des reçus...',
        }),
        scanMultipleReceipts: 'Scanner plusieurs reçus',
        scanMultipleReceiptsDescription: 'Prenez des photos de tous vos reçus en une seule fois, puis confirmez les détails vous-même ou nous le ferons pour vous.',
        receiptScanInProgress: 'Analyse du reçu en cours',
        receiptScanInProgressDescription: 'Numérisation du reçu en cours. Revenez plus tard ou saisissez les détails maintenant.',
        removeFromReport: 'Retirer de la note de frais',
        moveToPersonalSpace: 'Déplacer les dépenses vers votre espace personnel',
        duplicateTransaction: (isSubmitted: boolean) =>
            !isSubmitted
                ? 'Dépenses potentiellement en double identifiées. Examinez les doublons pour permettre la soumission.'
                : 'Des dépenses potentiellement en double ont été identifiées. Examinez les doublons pour permettre l’approbation.',
        receiptIssuesFound: () => ({
            one: 'Problème détecté',
            other: 'Problèmes détectés',
        }),
        fieldPending: 'En attente...',
        defaultRate: 'Taux par défaut',
        receiptMissingDetails: 'Reçu incomplet',
        missingAmount: 'Montant manquant',
        missingMerchant: 'Marchand manquant',
        receiptStatusTitle: 'Analyse en cours…',
        receiptStatusText: 'Vous seul pouvez voir ce reçu pendant son analyse. Revenez plus tard ou saisissez les détails maintenant.',
        receiptScanningFailed: "L'analyse du reçu a échoué. Veuillez saisir les détails manuellement.",
        transactionPendingDescription: 'Transaction en attente. L’opération peut prendre quelques jours avant d’être comptabilisée.',
        companyInfo: 'Infos sur l’entreprise',
        companyInfoDescription: 'Nous avons besoin de quelques informations supplémentaires avant que vous puissiez envoyer votre première facture.',
        yourCompanyName: 'Nom de votre entreprise',
        yourCompanyWebsite: 'Site web de votre entreprise',
        yourCompanyWebsiteNote: "Si vous n'avez pas de site web, vous pouvez fournir à la place le profil LinkedIn ou de réseau social de votre entreprise.",
        invalidDomainError: 'Vous avez saisi un domaine invalide. Pour continuer, veuillez saisir un domaine valide.',
        publicDomainError: 'Vous avez saisi un domaine public. Pour continuer, veuillez saisir un domaine privé.',
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
            other: 'Voulez-vous vraiment supprimer ces dépenses ?',
        }),
        deleteReport: 'Supprimer le rapport',
        deleteReportConfirmation: 'Voulez-vous vraiment supprimer ce rapport ?',
        settledExpensify: 'Payé',
        done: 'Terminé',
        settledElsewhere: 'Payé ailleurs',
        individual: 'Individuel',
        business: 'Professionnel',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} avec Expensify` : `Payer avec Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} en tant que particulier` : `Payer avec un compte personnel`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} avec le portefeuille` : `Payer avec le portefeuille`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `Payer ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Payer ${formattedAmount} en tant qu'entreprise` : `Payer avec le compte professionnel`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Marquer ${formattedAmount} comme payé` : `Marquer comme payé`),
        settleInvoicePersonal: (amount?: string, last4Digits?: string) => (amount ? `a payé ${amount} avec le compte personnel ${last4Digits}` : `Payé avec un compte personnel`),
        settleInvoiceBusiness: (amount?: string, last4Digits?: string) => (amount ? `a payé ${amount} avec le compte professionnel ${last4Digits}` : `Payé avec un compte professionnel`),
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `Payer ${formattedAmount} via ${policyName}` : `Payer via ${policyName}`),
        businessBankAccount: (amount?: string, last4Digits?: string) => (amount ? `a payé ${amount} avec le compte bancaire ${last4Digits}` : `payé avec le compte bancaire ${last4Digits}`),
        automaticallyPaidWithBusinessBankAccount: (amount?: string, last4Digits?: string) =>
            `payé ${amount ? `${amount} ` : ''} avec le compte bancaire ${last4Digits} via les <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">règles d’espace de travail</a>`,
        invoicePersonalBank: (lastFour: string) => `Compte personnel • ${lastFour}`,
        invoiceBusinessBank: (lastFour: string) => `Compte professionnel • ${lastFour}`,
        nextStep: 'Étapes suivantes',
        finished: 'Terminé',
        flip: 'Retourner',
        sendInvoice: ({amount}: RequestAmountParams) => `Envoyer la facture de ${amount}`,
        expenseAmount: (formattedAmount: string, comment?: string) => `${formattedAmount}${comment ? `pour ${comment}` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `soumis${memo ? `, avec la mention ${memo}` : ''}`,
        automaticallySubmitted: `soumis via <a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">reports soumis avec retard</a>`,
        queuedToSubmitViaDEW: 'en file d’attente pour être soumis via un circuit d’approbation personnalisé',
        trackedAmount: (formattedAmount: string, comment?: string) => `suivi de ${formattedAmount}${comment ? `pour ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `diviser ${amount}`,
        didSplitAmount: (formattedAmount: string, comment: string) => `diviser ${formattedAmount}${comment ? `pour ${comment}` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `Votre partage ${amount}`,
        payerOwesAmount: (amount: number | string, payer: string, comment?: string) => `${payer} doit ${amount}${comment ? `pour ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} doit :`,
        payerPaidAmount: (amount: number | string, payer?: string) => `${payer ? `${payer} ` : ''}a payé ${amount}`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} a payé :`,
        payerSpentAmount: (amount: number | string, payer?: string) => `${payer} a dépensé ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} a dépensé :`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} a approuvé :`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} a approuvé ${amount}`,
        payerSettled: (amount: number | string) => `payé ${amount}`,
        payerSettledWithMissingBankAccount: (amount: number | string) => `a payé ${amount}. Ajoutez un compte bancaire pour recevoir votre paiement.`,
        automaticallyApproved: `approuvé via les <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">règles de l’espace de travail</a>`,
        approvedAmount: (amount: number | string) => `${amount} approuvé`,
        approvedMessage: `approuvé`,
        unapproved: `Non approuvé`,
        automaticallyForwarded: `approuvé via les <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">règles de l’espace de travail</a>`,
        forwarded: `approuvé`,
        rejectedThisReport: 'a rejeté cette note de frais',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `a commencé le paiement, mais attend que ${submitterDisplayName} ajoute un compte bancaire.`,
        adminCanceledRequest: 'a annulé le paiement',
        canceledRequest: (amount: string, submitterDisplayName: string) =>
            `a annulé le paiement de ${amount}, car ${submitterDisplayName} n’a pas activé son Portefeuille Expensify dans les 30 jours`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} a ajouté un compte bancaire. Le paiement de ${amount} a été effectué.`,
        paidElsewhere: ({payer, comment}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}marqué comme payé${comment ? `, en disant « ${comment} »` : ''}`,
        paidWithExpensify: (payer?: string) => `${payer ? `${payer} ` : ''}payé avec le portefeuille`,
        automaticallyPaidWithExpensify: (payer?: string) =>
            `${payer ? `${payer} ` : ''}payé avec Expensify via les <a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">règles de l’espace de travail</a>`,
        noReimbursableExpenses: 'Cette note de frais a un montant non valide',
        pendingConversionMessage: 'Le total sera mis à jour quand vous serez de retour en ligne',
        changedTheExpense: 'a modifié la dépense',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `le ${valueName} en ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `a défini ${translatedChangedField} sur ${newMerchant}, ce qui a défini le montant sur ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `le/la ${valueName} (anciennement ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `le ${valueName} à ${newValueToDisplay} (précédemment ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `a modifié le ${translatedChangedField} en ${newMerchant} (auparavant ${oldMerchant}), ce qui a mis à jour le montant à ${newAmountToDisplay} (auparavant ${oldAmountToDisplay})`,
        basedOnAI: 'en fonction de l’activité passée',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) =>
            rulesLink ? `selon les <a href="${rulesLink}">règles de l’espace de travail</a>` : 'en fonction de la règle de l’espace de travail',
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `pour ${comment}` : 'dépense'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `Note de frais de facture n° ${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} envoyé${comment ? `pour ${comment}` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) =>
            `a déplacé la dépense de l’espace personnel vers ${workspaceName ?? `discuter avec ${reportName}`}`,
        movedToPersonalSpace: 'a déplacé la dépense vers l’espace personnel',
        error: {
            invalidCategoryLength: 'Le nom de la catégorie dépasse 255 caractères. Veuillez le raccourcir ou choisir une autre catégorie.',
            invalidTagLength: 'Le nom du tag dépasse 255 caractères. Veuillez le raccourcir ou choisir un autre tag.',
            invalidAmount: 'Veuillez saisir un montant valide avant de continuer',
            invalidDistance: 'Veuillez saisir une distance valide avant de continuer',
            invalidReadings: 'Veuillez saisir les relevés de début et de fin',
            negativeDistanceNotAllowed: 'Le relevé de fin doit être supérieur au relevé de début',
            invalidIntegerAmount: 'Veuillez saisir un montant entier en dollars avant de continuer',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Le montant maximal de taxe est ${amount}`,
            invalidSplit: 'La somme des répartitions doit être égale au montant total',
            invalidSplitParticipants: 'Veuillez saisir un montant supérieur à zéro pour au moins deux participants',
            invalidSplitYourself: 'Veuillez saisir un montant non nul pour votre répartition',
            noParticipantSelected: 'Veuillez sélectionner un participant',
            other: 'Erreur inattendue. Veuillez réessayer plus tard.',
            genericCreateFailureMessage: 'Erreur inattendue lors de la soumission de cette dépense. Veuillez réessayer plus tard.',
            genericCreateInvoiceFailureMessage: "Erreur inattendue lors de l'envoi de cette facture. Veuillez réessayer plus tard.",
            genericHoldExpenseFailureMessage: 'Erreur inattendue lors de la mise en attente de cette dépense. Veuillez réessayer plus tard.',
            genericUnholdExpenseFailureMessage: 'Erreur inattendue lors de la levée de la mise en attente de cette dépense. Veuillez réessayer plus tard.',
            receiptDeleteFailureError: 'Erreur inattendue lors de la suppression de ce reçu. Veuillez réessayer plus tard.',
            receiptFailureMessage:
                '<rbr>Une erreur s\'est produite lors du téléchargement de votre reçu. Veuillez <a href="download">enregistrer le reçu</a> et <a href="retry">réessayer</a> plus tard.</rbr>',
            receiptFailureMessageShort: 'Une erreur s’est produite lors du téléversement de votre reçu.',
            genericDeleteFailureMessage: 'Erreur inattendue lors de la suppression de cette dépense. Veuillez réessayer ultérieurement.',
            genericEditFailureMessage: 'Erreur inattendue lors de la modification de cette dépense. Veuillez réessayer plus tard.',
            genericSmartscanFailureMessage: 'Des champs sont manquants dans la transaction',
            duplicateWaypointsErrorMessage: 'Veuillez supprimer les points de passage en double',
            atLeastTwoDifferentWaypoints: 'Veuillez saisir au moins deux adresses différentes',
            splitExpenseMultipleParticipantsErrorMessage: 'Une dépense ne peut pas être répartie entre un espace de travail et d’autres membres. Veuillez modifier votre sélection.',
            invalidMerchant: 'Veuillez saisir un marchand valide',
            atLeastOneAttendee: 'Au moins un participant doit être sélectionné',
            invalidQuantity: 'Veuillez saisir une quantité valide',
            quantityGreaterThanZero: 'La quantité doit être supérieure à zéro',
            invalidSubrateLength: 'Il doit y avoir au moins un sous-taux',
            invalidRate: 'Taux non valide pour cet espace de travail. Veuillez sélectionner un taux disponible dans l’espace de travail.',
            endDateBeforeStartDate: 'La date de fin ne peut pas être antérieure à la date de début',
            endDateSameAsStartDate: 'La date de fin ne peut pas être identique à la date de début',
            manySplitsProvided: `Le nombre maximal de divisions autorisées est de ${CONST.IOU.SPLITS_LIMIT}.`,
            dateRangeExceedsMaxDays: `La plage de dates ne peut pas dépasser ${CONST.IOU.SPLITS_LIMIT} jours.`,
        },
        dismissReceiptError: 'Ignorer l’erreur',
        dismissReceiptErrorConfirmation: 'Attention ! Ignorer cette erreur supprimera entièrement votre reçu téléversé. Êtes-vous sûr ?',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `a commencé à régler. Le paiement est en attente jusqu’à ce que ${submitterDisplayName} active son portefeuille.`,
        enableWallet: 'Activer le portefeuille',
        hold: 'En attente',
        unhold: 'Lever la mise en attente',
        holdExpense: () => ({
            one: 'Mettre la dépense en attente',
            other: 'Mettre les dépenses en attente',
        }),
        unholdExpense: 'Relancer la dépense',
        heldExpense: 'a mis cette dépense en attente',
        unheldExpense: 'a débloqué cette dépense',
        moveUnreportedExpense: 'Déplacer la dépense non déclarée',
        addUnreportedExpense: 'Ajouter une dépense non déclarée',
        selectUnreportedExpense: 'Sélectionnez au moins une dépense à ajouter à la note de frais.',
        emptyStateUnreportedExpenseTitle: 'Aucune dépense non déclarée',
        emptyStateUnreportedExpenseSubtitle: 'Il semble que vous n’ayez aucune dépense non déclarée. Essayez d’en créer une ci-dessous.',
        addUnreportedExpenseConfirm: 'Ajouter à la note de frais',
        newReport: 'Nouvelle note de frais',
        explainHold: () => ({
            one: 'Expliquez pourquoi vous retenez cette dépense.',
            other: 'Expliquez pourquoi vous retenez ces dépenses.',
        }),
        retracted: 'Retiré',
        retract: 'Retirer',
        reopened: 'Rouverte',
        reopenReport: 'Rouvrir la note de frais',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `Cette note de frais a déjà été exportée vers ${connectionName}. La modifier peut entraîner des incohérences de données. Voulez-vous vraiment rouvrir cette note de frais ?`,
        reason: 'Raison',
        holdReasonRequired: 'Un motif est obligatoire lors de la mise en attente.',
        expenseWasPutOnHold: 'La dépense a été mise en attente',
        expenseOnHold: 'Cette dépense a été mise en attente. Veuillez examiner les commentaires pour connaître les prochaines étapes.',
        expensesOnHold: 'Toutes les dépenses ont été mises en attente. Veuillez examiner les commentaires pour connaître les prochaines étapes.',
        expenseDuplicate: 'Cette dépense présente des détails similaires à une autre. Veuillez examiner les doublons pour continuer.',
        someDuplicatesArePaid: 'Certains de ces doublons ont déjà été approuvés ou payés.',
        reviewDuplicates: 'Examiner les doublons',
        keepAll: 'Tout garder',
        confirmApprove: 'Confirmer le montant de l’approbation',
        confirmApprovalAmount: 'Approuver uniquement les dépenses conformes, ou approuver la note de frais entière.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Cette dépense est en attente. Voulez-vous l’approuver quand même ?',
            other: 'Ces dépenses sont en attente. Voulez-vous quand même approuver ?',
        }),
        confirmPay: 'Confirmer le montant du paiement',
        confirmPayAmount: 'Payer ce qui n’est pas en attente, ou payer l’intégralité de la note de frais.',
        confirmPayAllHoldAmount: () => ({
            one: 'Cette dépense est en attente. Voulez-vous quand même la payer ?',
            other: 'Ces dépenses sont en attente. Voulez-vous quand même les payer ?',
        }),
        payOnly: 'Payer uniquement',
        approveOnly: 'Approuver uniquement',
        holdEducationalTitle: 'Devez-vous bloquer cette dépense ?',
        whatIsHoldExplain: 'Mettre une dépense en attente, c’est comme appuyer sur « pause » jusqu’à ce que vous soyez prêt à la soumettre.',
        holdIsLeftBehind: 'Les dépenses en attente sont laissées de côté même si vous soumettez une note de frais entière.',
        unholdWhenReady: 'Libérez les dépenses lorsque vous êtes prêt à les soumettre.',
        changePolicyEducational: {
            title: 'Vous avez déplacé cette note de frais !',
            description: 'Vérifiez attentivement ces éléments, qui ont tendance à changer lors du déplacement de notes de frais vers un nouvel espace de travail.',
            reCategorize: '<strong>Recatégorisez toutes les dépenses</strong> pour respecter les règles de l’espace de travail.',
            workflows: 'Cette note de frais peut désormais être soumise à un <strong>processus d’approbation</strong> différent.',
        },
        changeWorkspace: 'Changer d’espace de travail',
        set: 'définir',
        changed: 'modifié',
        removed: 'supprimé',
        transactionPending: 'Transaction en attente.',
        chooseARate: 'Sélectionner un taux de remboursement par mille ou kilomètre pour l’espace de travail',
        unapprove: 'Retirer l’approbation',
        unapproveReport: 'Retirer l’approbation de la note de frais',
        headsUp: 'Attention !',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Cette note de frais a déjà été exportée vers ${accountingIntegration}. La modifier peut entraîner des incohérences de données. Voulez-vous vraiment annuler l'approbation de cette note de frais ?`,
        reimbursable: 'remboursable',
        nonReimbursable: 'non remboursable',
        bookingPending: 'Cette réservation est en attente',
        bookingPendingDescription: 'Cette réservation est en attente, car elle n’a pas encore été payée.',
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
        deleteSubrateConfirmation: 'Voulez-vous vraiment supprimer ce sous-taux ?',
        quantity: 'Quantité',
        subrateSelection: 'Sélectionnez un sous-taux et saisissez une quantité.',
        qty: 'Qté',
        firstDayText: () => ({
            one: `Premier jour : 1 heure`,
            other: (count: number) => `Premier jour : ${count.toFixed(2)} heures`,
        }),
        lastDayText: () => ({
            one: `Dernier jour : 1 heure`,
            other: (count: number) => `Dernier jour : ${count.toFixed(2)} heures`,
        }),
        tripLengthText: () => ({
            one: `Voyage : 1 journée complète`,
            other: (count: number) => `Voyage : ${count} jours complets`,
        }),
        dates: 'Dates',
        rates: 'Taux',
        submitsTo: ({name}: SubmitsToParams) => `Soumet à ${name}`,
        reject: {
            educationalTitle: 'Faut-il mettre en attente ou rejeter ?',
            educationalText: 'Si vous n’êtes pas prêt à approuver ou payer une dépense, vous pouvez la mettre en attente ou la rejeter.',
            holdExpenseTitle: 'Mettre une dépense en attente pour demander plus de détails avant approbation ou paiement.',
            approveExpenseTitle: 'Approuvez d’autres dépenses tandis que les dépenses en attente restent assignées à vous.',
            heldExpenseLeftBehindTitle: 'Les dépenses en attente sont laissées de côté lorsque vous approuvez une note de frais entière.',
            rejectExpenseTitle: 'Rejetez une dépense que vous n’avez pas l’intention d’approuver ou de payer.',
            reasonPageTitle: 'Rejeter la dépense',
            reasonPageDescription: 'Expliquez pourquoi vous rejetez cette dépense.',
            rejectReason: 'Raison du rejet',
            markAsResolved: 'Marquer comme résolu',
            rejectedStatus: 'Cette dépense a été rejetée. Nous attendons que vous corrigiez les problèmes et la marquiez comme résolue pour permettre la soumission.',
            reportActions: {
                rejectedExpense: 'a rejeté cette dépense',
                markedAsResolved: 'a marqué le motif de rejet comme résolu',
            },
        },
        moveExpenses: () => ({one: 'Déplacer la dépense', other: 'Déplacer des dépenses'}),
        moveExpensesError:
            'Vous ne pouvez pas déplacer des dépenses au forfait vers des notes de frais d’autres espaces de travail, car les taux de per diem peuvent différer d’un espace de travail à l’autre.',
        changeApprover: {
            title: "Modifier l'approbateur",
            header: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `Choisissez une option pour modifier l’approbateur de cette note de frais. (Mettez à jour les <a href="${workflowSettingLink}">paramètres de votre espace de travail</a> pour changer cela définitivement pour toutes les notes de frais.)`,
            changedApproverMessage: (managerID: number) => `a modifié l'approbateur en <mention-user accountID="${managerID}"/>`,
            actions: {
                addApprover: 'Ajouter un approbateur',
                addApproverSubtitle: 'Ajouter un approbateur supplémentaire au workflow existant.',
                bypassApprovers: 'Ignorer les approbateurs',
                bypassApproversSubtitle: 'Vous désigner comme approbateur final et ignorer les approbateurs restants.',
            },
            addApprover: {
                subtitle: 'Choisissez un approbateur supplémentaire pour cette note de frais avant que nous ne la transmettions au reste du circuit d’approbation.',
            },
        },
        chooseWorkspace: 'Choisir un espace de travail',
        routedDueToDEW: ({to}: RoutedDueToDEWParams) => `note de frais acheminée vers ${to} en raison du workflow d'approbation personnalisé`,
        timeTracking: {
            hoursAt: (hours: number, rate: string) => `${hours} ${hours === 1 ? 'heure' : 'heures'} @ ${rate} / heure`,
            hrs: 'h',
            hours: 'Heures',
            ratePreview: (rate: string) => `${rate} / heure`,
            amountTooLargeError: 'Le montant total est trop élevé. Réduisez le nombre d’heures ou diminuez le taux.',
        },
        correctDistanceRateError: 'Corrigez l’erreur de taux de distance, puis réessayez.',
    },
    transactionMerge: {
        listPage: {
            header: 'Fusionner les dépenses',
            noEligibleExpenseFound: 'Aucune dépense admissible trouvée',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>Vous n'avez aucune dépense pouvant être fusionnée avec celle-ci. <a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">En savoir plus</a> sur les dépenses éligibles.</centered-text></muted-text>`,
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
                const article = StringUtils.startsWithVowel(field) ? 'un' : 'a';
                return `Veuillez sélectionner ${article} ${field}`;
            },
            pleaseSelectAttendees: 'Veuillez sélectionner les participants',
            selectAllDetailsError: 'Sélectionnez tous les détails avant de continuer.',
        },
        confirmationPage: {
            header: 'Confirmer les détails',
            pageTitle: 'Confirmez les détails que vous conservez. Les détails que vous ne conservez pas seront supprimés.',
            confirmButton: 'Fusionner les dépenses',
        },
    },
    share: {
        shareToExpensify: 'Partager vers Expensify',
        messageInputLabel: 'Message',
    },
    notificationPreferencesPage: {
        header: 'Préférences de notification',
        label: 'M’alerter en cas de nouveaux messages',
        notificationPreferences: {
            always: 'Immédiatement',
            daily: 'Quotidien',
            mute: 'Muet',
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: 'Masqué',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Le numéro n’a pas été validé. Cliquez sur le bouton pour renvoyer le lien de validation par SMS.',
        emailHasNotBeenValidated: 'L’adresse e-mail n’a pas été validée. Cliquez sur le bouton pour renvoyer le lien de validation par SMS.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Téléverser une photo',
        removePhoto: 'Supprimer la photo',
        editImage: 'Modifier la photo',
        viewPhoto: 'Voir la photo',
        imageUploadFailed: 'Échec du téléchargement de l’image',
        deleteWorkspaceError: 'Désolé, un problème inattendu s’est produit lors de la suppression de l’avatar de votre espace de travail',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `L’image sélectionnée dépasse la taille maximale de téléversement de ${maxUploadSizeInMB} Mo.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `Veuillez télécharger une image plus grande que ${minHeightInPx}x${minWidthInPx} pixels et plus petite que ${maxHeightInPx}x${maxWidthInPx} pixels.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `La photo de profil doit être de l’un des types suivants : ${allowedExtensions.join(', ')}.`,
    },
    avatarPage: {
        title: 'Modifier la photo de profil',
        upload: 'Téléverser',
        uploadPhoto: 'Téléverser une photo',
        selectAvatar: 'Sélectionner un avatar',
        choosePresetAvatar: 'Ou choisir un avatar personnalisé',
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
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_SUBMIT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `En attente que <strong>vous</strong> soumettiez des dépenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En attente que <strong>${actor}</strong> soumette des dépenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `En attente qu’un administrateur soumette des dépenses.`;
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
                        return `En attente que <strong>vos</strong> dépenses soient automatiquement soumises${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En attente que les dépenses de <strong>${actor}</strong> soient automatiquement soumises${formattedETA}.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `En attente que les dépenses d’un administrateur soient automatiquement soumises${formattedETA}.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `En attente que <strong>vous</strong> corrigiez les problèmes.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En attente que <strong>${actor}</strong> corrige les problèmes.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `En attente qu’un administrateur corrige les problèmes.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `En attente que <strong>vous</strong> approuviez les dépenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En attente de l’approbation des dépenses par <strong>${actor}</strong>.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `En attente de l’approbation des dépenses par un administrateur.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `En attente que <strong>vous</strong> exportiez cette note de frais.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En attente que <strong>${actor}</strong> exporte cette note de frais.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `En attente qu’un administrateur exporte cette note de frais.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `En attente que <strong>vous</strong> payiez les dépenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En attente que <strong>${actor}</strong> paie les dépenses.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `En attente qu’un administrateur paie les dépenses.`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `En attente que <strong>vous</strong> terminiez la configuration d’un compte bancaire professionnel.`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `En attente que <strong>${actor}</strong> ait terminé la configuration d’un compte bancaire professionnel.`;
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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.SUBMITTING_TO_SELF]: (_: NextStepParams) =>
                `Oups ! On dirait que vous soumettez cette note de frais à <strong>vous-même</strong>. L’approbation de vos propres notes de frais est <strong>interdite</strong> par votre espace de travail. Veuillez soumettre cette note de frais à quelqu’un d’autre ou contacter votre administrateur pour changer la personne à qui vous soumettez.`,
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'bientôt',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: 'plus tard aujourd’hui',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: 'dimanche',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: 'les 1er et 16 de chaque mois',
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
        invalidFileMessage: 'Fichier invalide. Veuillez essayer une autre image.',
        avatarUploadFailureMessage: 'Une erreur s’est produite lors du téléchargement de l’avatar. Veuillez réessayer.',
        online: 'En ligne',
        offline: 'Hors ligne',
        syncing: 'Synchronisation en cours',
        profileAvatar: 'Avatar du profil',
        publicSection: {
            title: 'Public',
            subtitle: 'Ces informations sont affichées sur votre profil public. Tout le monde peut les voir.',
        },
        privateSection: {
            title: 'Privé',
            subtitle: 'Ces informations sont utilisées pour les déplacements et les paiements. Elles n’apparaissent jamais sur votre profil public.',
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
        contactMethods: 'Moyens de contact',
        featureRequiresValidate: 'Cette fonctionnalité nécessite que vous validiez votre compte.',
        validateAccount: 'Valider votre compte',
        helpText: ({email}: {email: string}) =>
            `Ajoutez davantage de moyens de vous connecter et d’envoyer des reçus à Expensify.<br/><br/>Ajoutez une adresse e-mail pour transférer des reçus à <a href="mailto:${email}">${email}</a> ou ajoutez un numéro de téléphone pour envoyer des reçus par SMS au 47777 (numéros américains uniquement).`,
        pleaseVerify: 'Veuillez vérifier ce moyen de contact.',
        getInTouch: 'Nous utiliserons cette méthode pour vous contacter.',
        enterMagicCode: (contactMethod: string) => `Veuillez saisir le code magique envoyé à ${contactMethod}. Il devrait arriver d’ici une à deux minutes.`,
        setAsDefault: 'Définir par défaut',
        yourDefaultContactMethod:
            'Ceci est votre méthode de contact par défaut actuelle. Avant de pouvoir la supprimer, vous devez choisir une autre méthode de contact et cliquer sur « Définir par défaut ».',
        removeContactMethod: 'Supprimer le mode de contact',
        removeAreYouSure: 'Voulez-vous vraiment supprimer ce moyen de contact ? Cette action est irréversible.',
        failedNewContact: 'Échec de l’ajout de ce moyen de contact.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Échec de l’envoi d’un nouveau code magique. Veuillez patienter un peu, puis réessayer.',
            validateSecondaryLogin: 'Code magique incorrect ou invalide. Veuillez réessayer ou demander un nouveau code.',
            deleteContactMethod: 'Échec de la suppression du moyen de contact. Veuillez contacter Concierge pour obtenir de l’aide.',
            setDefaultContactMethod: 'Échec lors de la définition d’une nouvelle méthode de contact par défaut. Veuillez contacter Concierge pour obtenir de l’aide.',
            addContactMethod: 'Échec de l’ajout de cette méthode de contact. Veuillez contacter Concierge pour obtenir de l’aide.',
            enteredMethodIsAlreadySubmitted: 'Ce moyen de contact existe déjà',
            passwordRequired: 'mot de passe requis.',
            contactMethodRequired: 'Le moyen de contact est obligatoire',
            invalidContactMethod: 'Méthode de contact invalide',
        },
        newContactMethod: 'Nouveau moyen de contact',
        goBackContactMethods: 'Revenir aux méthodes de contact',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Il / Lui / Son',
        heHimHisTheyThemTheirs: 'Il / Lui / Son / Iel / Iel / Sien',
        sheHerHers: 'Elle / Elle / Elle',
        sheHerHersTheyThemTheirs: 'Elle / Elle / À elle / Iel / Iel / À iel',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Par pers.',
        theyThemTheirs: 'Iel / Iel / Iel',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Appelle-moi par mon nom',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: 'Nom affiché',
        isShownOnProfile: 'Votre nom d’affichage est visible sur votre profil.',
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
        toGetLatestChanges: 'Sur mobile, téléchargez et installez la dernière version. Sur le Web, actualisez votre navigateur.',
        newAppNotAvailable: 'L’application New Expensify n’est plus disponible.',
    },
    initialSettingsPage: {
        about: 'À propos',
        aboutPage: {
            description: 'La nouvelle application Expensify est créée par une communauté de développeurs open source du monde entier. Aidez-nous à construire l’avenir d’Expensify.',
            appDownloadLinks: 'Liens de téléchargement de l’application',
            viewKeyboardShortcuts: 'Afficher les raccourcis clavier',
            viewTheCode: 'Afficher le code',
            viewOpenJobs: 'Voir les postes ouverts',
            reportABug: 'Signaler un bug',
            troubleshoot: 'Dépanner',
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
            clearCacheAndRestart: 'Vider le cache et redémarrer',
            viewConsole: 'Afficher la console de débogage',
            debugConsole: 'Console de débogage',
            description:
                "<muted-text>Utilisez les outils ci-dessous pour aider à résoudre les problèmes liés à l'expérience Expensify. Si vous rencontrez des problèmes, veuillez <concierge-link>soumettre un bug</concierge-link>.</muted-text>",
            confirmResetDescription: 'Tous les brouillons de messages non envoyés seront perdus, mais le reste de vos données est en sécurité.',
            resetAndRefresh: 'Réinitialiser et actualiser',
            clientSideLogging: 'Journalisation côté client',
            noLogsToShare: 'Aucun journal à partager',
            useProfiling: 'Utiliser le profilage',
            profileTrace: 'Profil de trace',
            results: 'Résultats',
            releaseOptions: 'Options de publication',
            testingPreferences: 'Préférences de test',
            useStagingServer: 'Utiliser le serveur de préproduction',
            forceOffline: 'Forcer le mode hors ligne',
            simulatePoorConnection: 'Simuler une mauvaise connexion internet',
            simulateFailingNetworkRequests: 'Simuler l’échec des requêtes réseau',
            authenticationStatus: 'État d’authentification',
            deviceCredentials: 'Identifiants de l’appareil',
            invalidate: 'Invalider',
            destroy: 'Détruire',
            maskExportOnyxStateData: 'Masquer les données fragiles des membres lors de l’export de l’état Onyx',
            exportOnyxState: 'Exporter l’état Onyx',
            importOnyxState: 'Importer l’état Onyx',
            testCrash: 'Test de plantage',
            resetToOriginalState: 'Réinitialiser à l’état d’origine',
            usingImportedState: 'Vous utilisez un état importé. Appuyez ici pour l’effacer.',
            debugMode: 'Mode débogage',
            invalidFile: 'Fichier invalide',
            invalidFileDescription: 'Le fichier que vous tentez d’importer n’est pas valide. Veuillez réessayer.',
            invalidateWithDelay: 'Invalider avec délai',
            leftHandNavCache: 'Cache de navigation gauche',
            clearleftHandNavCache: 'Effacer',
            recordTroubleshootData: 'Enregistrer les données de dépannage',
            softKillTheApp: 'Arrêter l’application sans forcer',
            kill: 'Tuer',
            sentryDebug: 'Débogage Sentry',
            sentryDebugDescription: 'Consigner les requêtes Sentry dans la console',
            sentryHighlightedSpanOps: 'Noms de segments surlignés',
            sentryHighlightedSpanOpsPlaceholder: 'ui.interaction.clic, navigation, ui.chargement',
        },
        debugConsole: {
            saveLog: 'Enregistrer le journal',
            shareLog: 'Partager le journal',
            enterCommand: 'Saisir la commande',
            execute: 'Exécuter',
            noLogsAvailable: 'Aucun journal disponible',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `La taille du journal dépasse la limite de ${size} Mo. Veuillez utiliser « Enregistrer le journal » pour télécharger le fichier journal à la place.`,
            logs: 'Journaux',
            viewConsole: 'Afficher la console',
        },
        security: 'Sécurité',
        signOut: 'Se déconnecter',
        restoreStashed: 'Restaurer l’identifiant mis en réserve',
        signOutConfirmationText: 'Vous perdrez toutes les modifications hors ligne si vous vous déconnectez.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro>Lisez les <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">conditions d'utilisation</a> et la <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politique de confidentialité</a>.</muted-text-micro>`,
        help: 'Aide',
        whatIsNew: 'Nouveautés',
        accountSettings: 'Paramètres du compte',
        account: 'Compte',
        general: 'Général',
    },
    closeAccountPage: {
        // @context close as a verb, not an adjective
        closeAccount: 'Fermer le compte',
        reasonForLeavingPrompt: 'Nous serions désolés de vous voir partir ! Pourriez-vous nous dire pourquoi, afin que nous puissions nous améliorer ?',
        enterMessageHere: 'Saisissez le message ici',
        closeAccountWarning: 'La fermeture de votre compte est irréversible.',
        closeAccountPermanentlyDeleteData: 'Voulez-vous vraiment supprimer votre compte ? Cela supprimera définitivement toutes les dépenses en cours.',
        enterDefaultContactToConfirm: 'Veuillez saisir votre méthode de contact par défaut pour confirmer que vous souhaitez fermer votre compte. Votre méthode de contact par défaut est :',
        enterDefaultContact: 'Saisissez votre méthode de contact par défaut',
        defaultContact: 'Méthode de contact par défaut :',
        enterYourDefaultContactMethod: 'Veuillez saisir votre méthode de contact par défaut pour clôturer votre compte.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Fusionner les comptes',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `Saisissez le compte que vous voulez fusionner avec <strong>${login}</strong>.`,
            notReversibleConsent: 'Je comprends que cela n’est pas réversible',
        },
        accountValidate: {
            confirmMerge: 'Voulez-vous vraiment fusionner les comptes ?',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) =>
                `La fusion de vos comptes est irréversible et entraînera la perte de toutes les dépenses non soumises pour <strong>${login}</strong>.`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `Pour continuer, veuillez saisir le code magique envoyé à <strong>${login}</strong>.`,
            errors: {
                incorrectMagicCode: 'Code magique incorrect ou invalide. Veuillez réessayer ou demander un nouveau code.',
                fallback: 'Un problème est survenu. Veuillez réessayer ultérieurement.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Comptes fusionnés !',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text>Vous avez fusionné avec succès toutes les données de <strong>${from}</strong> dans <strong>${to}</strong>. À l’avenir, vous pouvez utiliser l’un ou l’autre identifiant de connexion pour ce compte.</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Nous y travaillons',
            limitedSupport: 'Nous ne prenons pas encore en charge la fusion de comptes sur New Expensify. Veuillez effectuer cette action sur Expensify Classic à la place.',
            reachOutForHelp: "<muted-text><centered-text>N'hésitez pas à <concierge-link>contacter Concierge</concierge-link> si vous avez des questions&nbsp;!</centered-text></muted-text>",
            goToExpensifyClassic: 'Aller à Expensify Classic',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Vous ne pouvez pas fusionner <strong>${email}</strong>, car il est contrôlé par <strong>${email.split('@').at(1) ?? ''}</strong>. Veuillez <concierge-link>contacter Concierge</concierge-link> pour obtenir de l’aide.</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Vous ne pouvez pas fusionner le compte <strong>${email}</strong> avec d’autres comptes, car l’administrateur de votre domaine l’a défini comme identifiant principal. Veuillez plutôt fusionner les autres comptes avec celui-ci.</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text>Vous ne pouvez pas fusionner les comptes, car l’authentification à deux facteurs (2FA) est activée pour <strong>${email}</strong>. Veuillez désactiver la 2FA pour <strong>${email}</strong> et réessayer.</centered-text></muted-text>`,
            learnMore: 'En savoir plus sur la fusion de comptes.',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Vous ne pouvez pas fusionner <strong>${email}</strong> car il est verrouillé. Veuillez <concierge-link>contacter Concierge</concierge-link> pour obtenir de l’aide.</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text>Vous ne pouvez pas fusionner les comptes, car <strong>${email}</strong> n’a pas de compte Expensify. Veuillez plutôt <a href="${contactMethodLink}">l’ajouter comme moyen de contact</a>.</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Vous ne pouvez pas fusionner le compte <strong>${email}</strong> dans d’autres comptes. Veuillez plutôt fusionner les autres comptes dans celui-ci.</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>Vous ne pouvez pas fusionner de comptes dans <strong>${email}</strong> car ce compte possède une relation de facturation déjà facturée.</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: 'Réessayez plus tard',
            description: 'Il y a eu trop de tentatives de fusion de comptes. Veuillez réessayer plus tard.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Vous ne pouvez pas fusionner avec d’autres comptes, car il n’est pas validé. Veuillez valider le compte et réessayer.',
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
            'Vous remarquez quelque chose d’anormal sur votre compte ? Le signaler bloquera immédiatement votre compte, empêchera toute nouvelle transaction avec la Carte Expensify et interdira toute modification du compte.',
        domainAdminsDescription:
            'Pour les administrateurs de domaine : cela met également en pause toute activité de carte Expensify et toutes les actions d’administration sur vos domaines.',
        areYouSure: 'Voulez-vous vraiment verrouiller votre compte Expensify ?',
        onceLocked: 'Une fois verrouillé, votre compte sera restreint en attendant une demande de déverrouillage et un examen de sécurité',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Échec du verrouillage du compte',
        failedToLockAccountDescription: `Nous n'avons pas pu verrouiller votre compte. Veuillez discuter avec Concierge pour résoudre ce problème.`,
        chatWithConcierge: 'Discuter avec Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Compte verrouillé',
        yourAccountIsLocked: 'Votre compte est verrouillé',
        chatToConciergeToUnlock: 'Discutez avec Concierge pour résoudre les problèmes de sécurité et déverrouiller votre compte.',
        chatWithConcierge: 'Discuter avec Concierge',
    },
    twoFactorAuth: {
        headerTitle: 'Authentification à deux facteurs',
        twoFactorAuthEnabled: 'Authentification à deux facteurs activée',
        whatIsTwoFactorAuth:
            'L’authentification à deux facteurs (2FA) aide à sécuriser votre compte. Lors de la connexion, vous devrez saisir un code généré par votre application d’authentification préférée.',
        disableTwoFactorAuth: 'Désactiver l’authentification à deux facteurs',
        explainProcessToRemove: 'Pour désactiver l’authentification à deux facteurs (2FA), veuillez saisir un code valide à partir de votre application d’authentification.',
        explainProcessToRemoveWithRecovery: 'Pour désactiver l’authentification à deux facteurs (2FA), veuillez saisir un code de récupération valide.',
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
        scanCode: 'Scannez le code QR avec votre',
        authenticatorApp: 'application d’authentification',
        addKey: 'Ou ajoutez cette clé secrète à votre application d’authentification :',
        enterCode: 'Saisissez ensuite le code à six chiffres généré par votre application d’authentification.',
        stepSuccess: 'Terminé',
        enabled: 'Authentification à deux facteurs activée',
        congrats: 'Félicitations ! Vous bénéficiez maintenant de cette sécurité supplémentaire.',
        copy: 'Copier',
        disable: 'Désactiver',
        enableTwoFactorAuth: 'Activer l’authentification à deux facteurs',
        pleaseEnableTwoFactorAuth: 'Veuillez activer l’authentification à deux facteurs.',
        twoFactorAuthIsRequiredDescription: 'Pour des raisons de sécurité, Xero exige l’authentification à deux facteurs pour connecter l’intégration.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Authentification à deux facteurs requise',
        twoFactorAuthIsRequiredForAdminsTitle: 'Veuillez activer l’authentification à deux facteurs',
        twoFactorAuthIsRequiredXero: 'Votre connexion comptable Xero nécessite une authentification à deux facteurs.',
        twoFactorAuthIsRequiredCompany: 'Votre entreprise exige l’authentification à deux facteurs.',
        twoFactorAuthCannotDisable: 'Impossible de désactiver l’A2F',
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
        allSet: 'Tout est prêt. Gardez votre nouveau mot de passe en lieu sûr.',
    },
    privateNotes: {
        title: 'Notes privées',
        personalNoteMessage: 'Conservez des notes sur cette discussion ici. Vous êtes la seule personne qui peut ajouter, modifier ou consulter ces notes.',
        sharedNoteMessage: 'Conservez des notes sur cette discussion ici. Les employés d’Expensify et les autres membres du domaine team.expensify.com peuvent consulter ces notes.',
        composerLabel: 'Notes',
        myNote: 'Ma note',
        error: {
            genericFailureMessage: 'Les notes privées n’ont pas pu être enregistrées',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Veuillez saisir un code de sécurité valide',
        },
        securityCode: 'Code de sécurité',
        changeBillingCurrency: 'Modifier la devise de facturation',
        changePaymentCurrency: 'Modifier la devise de paiement',
        paymentCurrency: 'Devise de paiement',
        paymentCurrencyDescription: 'Sélectionnez une devise standardisée à laquelle toutes les dépenses personnelles doivent être converties',
        note: `Remarque : la modification de votre devise de paiement peut avoir une incidence sur le montant que vous paierez pour Expensify. Consultez notre <a href="${CONST.PRICING}">page des tarifs</a> pour plus de détails.`,
    },
    addDebitCardPage: {
        addADebitCard: 'Ajouter une carte de débit',
        nameOnCard: 'Nom sur la carte',
        debitCardNumber: 'Numéro de carte de débit',
        expiration: 'Date d’expiration',
        expirationDate: 'MM/AA',
        cvv: 'Cryptogramme visuel (CVV)',
        billingAddress: 'Adresse de facturation',
        growlMessageOnSave: 'Votre carte de débit a été ajoutée avec succès',
        expensifyPassword: 'Mot de passe Expensify',
        error: {
            invalidName: 'Le nom peut uniquement contenir des lettres',
            addressZipCode: 'Veuillez saisir un code postal valide',
            debitCardNumber: 'Veuillez saisir un numéro de carte de débit valide',
            expirationDate: 'Veuillez sélectionner une date d’expiration valide',
            securityCode: 'Veuillez saisir un code de sécurité valide',
            addressStreet: 'Veuillez saisir une adresse de facturation valide qui ne soit pas une boîte postale.',
            addressState: 'Veuillez sélectionner un État',
            addressCity: 'Veuillez saisir une ville',
            genericFailureMessage: 'Une erreur s’est produite lors de l’ajout de votre carte. Veuillez réessayer.',
            password: 'Veuillez saisir votre mot de passe Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Ajouter une carte de paiement',
        nameOnCard: 'Nom sur la carte',
        paymentCardNumber: 'Numéro de carte',
        expiration: 'Date d’expiration',
        expirationDate: 'MM/AA',
        cvv: 'Cryptogramme visuel (CVV)',
        billingAddress: 'Adresse de facturation',
        growlMessageOnSave: 'Votre carte de paiement a été ajoutée avec succès',
        expensifyPassword: 'Mot de passe Expensify',
        error: {
            invalidName: 'Le nom peut uniquement contenir des lettres',
            addressZipCode: 'Veuillez saisir un code postal valide',
            paymentCardNumber: 'Veuillez saisir un numéro de carte valide',
            expirationDate: 'Veuillez sélectionner une date d’expiration valide',
            securityCode: 'Veuillez saisir un code de sécurité valide',
            addressStreet: 'Veuillez saisir une adresse de facturation valide qui ne soit pas une boîte postale.',
            addressState: 'Veuillez sélectionner un État',
            addressCity: 'Veuillez saisir une ville',
            genericFailureMessage: 'Une erreur s’est produite lors de l’ajout de votre carte. Veuillez réessayer.',
            password: 'Veuillez saisir votre mot de passe Expensify',
        },
    },
    walletPage: {
        balance: 'Solde',
        paymentMethodsTitle: 'Moyens de paiement',
        setDefaultConfirmation: 'Définir comme moyen de paiement par défaut',
        setDefaultSuccess: 'Mode de paiement par défaut défini !',
        deleteAccount: 'Supprimer le compte',
        deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer ce compte ?',
        error: {
            notOwnerOfBankAccount: 'Une erreur s’est produite lors de la définition de ce compte bancaire comme mode de paiement par défaut',
            invalidBankAccount: 'Ce compte bancaire est temporairement suspendu',
            notOwnerOfFund: 'Une erreur s’est produite lors de la définition de cette carte comme mode de paiement par défaut',
            setDefaultFailure: 'Un problème est survenu. Veuillez discuter avec Concierge pour obtenir une assistance supplémentaire.',
        },
        addBankAccountFailure: 'Une erreur inattendue s’est produite lors de l’ajout de votre compte bancaire. Veuillez réessayer.',
        getPaidFaster: 'Soyez payé plus rapidement',
        addPaymentMethod: 'Ajoutez un moyen de paiement pour envoyer et recevoir des paiements directement dans l’application.',
        getPaidBackFaster: 'Soyez remboursé plus rapidement',
        secureAccessToYourMoney: 'Un accès sécurisé à votre argent',
        receiveMoney: 'Recevez de l’argent dans votre devise locale',
        expensifyWallet: 'Portefeuille Expensify (bêta)',
        sendAndReceiveMoney: 'Envoyez et recevez de l’argent avec vos amis. Comptes bancaires américains uniquement.',
        enableWallet: 'Activer le portefeuille',
        addBankAccountToSendAndReceive: 'Ajoutez un compte bancaire pour effectuer ou recevoir des paiements.',
        addDebitOrCreditCard: 'Ajouter une carte de débit ou de crédit',
        assignedCards: 'Cartes assignées',
        assignedCardsDescription: 'Ce sont des cartes assignées par un administrateur d’espace de travail pour gérer les dépenses de l’entreprise.',
        expensifyCard: 'Carte Expensify',
        walletActivationPending: 'Nous examinons vos informations. Veuillez revenir dans quelques minutes !',
        walletActivationFailed: 'Malheureusement, votre portefeuille ne peut pas être activé pour le moment. Veuillez discuter avec Concierge pour obtenir une aide supplémentaire.',
        addYourBankAccount: 'Ajoutez votre compte bancaire',
        addBankAccountBody: 'Connectons votre compte bancaire à Expensify pour qu’il soit plus facile que jamais d’envoyer et de recevoir des paiements directement dans l’application.',
        chooseYourBankAccount: 'Choisissez votre compte bancaire',
        chooseAccountBody: 'Assurez-vous de sélectionner le bon.',
        confirmYourBankAccount: 'Confirmez votre compte bancaire',
        personalBankAccounts: 'Comptes bancaires personnels',
        businessBankAccounts: 'Comptes bancaires professionnels',
        shareBankAccount: 'Partager le compte bancaire',
        bankAccountShared: 'Compte bancaire partagé',
        shareBankAccountTitle: 'Sélectionnez les administrateurs avec lesquels partager ce compte bancaire :',
        shareBankAccountSuccess: 'Compte bancaire partagé !',
        shareBankAccountSuccessDescription: 'Les administrateurs sélectionnés recevront un message de confirmation de la part de Concierge.',
        shareBankAccountFailure: 'Une erreur inattendue s’est produite lors du partage du compte bancaire. Veuillez réessayer.',
        shareBankAccountEmptyTitle: 'Aucun administrateur disponible',
        shareBankAccountEmptyDescription: 'Il n’y a aucun administrateur d’espace de travail avec qui vous pouvez partager ce compte bancaire.',
        shareBankAccountNoAdminsSelected: 'Veuillez sélectionner un administrateur avant de continuer',
        unshareBankAccount: 'Ne plus partager le compte bancaire',
        unshareBankAccountDescription:
            'Toutes les personnes ci-dessous ont accès à ce compte bancaire. Vous pouvez supprimer leur accès à tout moment. Nous terminerons tout de même les paiements en cours.',
        unshareBankAccountWarning: ({admin}: {admin?: string | null}) =>
            `${admin} va perdre l’accès à ce compte bancaire professionnel. Nous finaliserons tout de même les paiements en cours.`,
        reachOutForHelp: 'Elle est utilisée avec la carte Expensify. <concierge-link>Contactez Concierge</concierge-link> si vous avez besoin de la ne plus partager.',
        unshareErrorModalTitle: 'Impossible d’annuler le partage du compte bancaire',
    },
    cardPage: {
        expensifyCard: 'Carte Expensify',
        expensifyTravelCard: 'Carte Travel Expensify',
        availableSpend: 'Plafond restant',
        smartLimit: {
            name: 'Plafond intelligent',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Vous pouvez dépenser jusqu’à ${formattedLimit} avec cette carte, et la limite sera réinitialisée au fur et à mesure que vos dépenses soumises sont approuvées.`,
        },
        fixedLimit: {
            name: 'Limite fixe',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `Vous pouvez dépenser jusqu’à ${formattedLimit} avec cette carte, après quoi elle sera désactivée.`,
        },
        monthlyLimit: {
            name: 'Plafond mensuel',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Vous pouvez dépenser jusqu’à ${formattedLimit} par mois avec cette carte. La limite sera réinitialisée le 1er jour de chaque mois calendaire.`,
        },
        virtualCardNumber: 'Numéro de carte virtuelle',
        travelCardCvv: 'Cryptogramme de carte de voyage',
        physicalCardNumber: 'Numéro de carte physique',
        physicalCardPin: 'Code PIN',
        getPhysicalCard: 'Obtenir une carte physique',
        reportFraud: 'Signaler une fraude de carte virtuelle',
        reportTravelFraud: 'Signaler une fraude à la carte de voyage',
        reviewTransaction: 'Examiner la transaction',
        suspiciousBannerTitle: 'Transaction suspecte',
        suspiciousBannerDescription: 'Nous avons détecté des transactions suspectes sur votre carte. Touchez ci-dessous pour les examiner.',
        cardLocked: 'Votre carte est temporairement bloquée pendant que notre équipe examine le compte de votre entreprise.',
        cardDetails: {
            cardNumber: 'Numéro de carte virtuelle',
            expiration: 'Expiration',
            cvv: 'Cryptogramme visuel (CVV)',
            address: 'Adresse',
            revealDetails: 'Afficher les détails',
            revealCvv: 'Afficher le cryptogramme visuel',
            copyCardNumber: 'Copier le numéro de carte',
            updateAddress: 'Mettre à jour l’adresse',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `Ajouté au portefeuille ${platform}`,
        cardDetailsLoadingFailure: 'Une erreur s’est produite lors du chargement des détails de la carte. Veuillez vérifier votre connexion internet et réessayer.',
        validateCardTitle: 'Assurons-nous que c’est bien vous',
        enterMagicCode: (contactMethod: string) =>
            `Veuillez saisir le code magique envoyé à ${contactMethod} pour afficher les détails de votre carte. Il devrait arriver d’ici une à deux minutes.`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `Veuillez <a href="${missingDetailsLink}">ajouter vos informations personnelles</a>, puis réessayer.`,
        unexpectedError: 'Une erreur s’est produite lors de la récupération des détails de votre carte Expensify. Veuillez réessayer.',
        cardFraudAlert: {
            confirmButtonText: 'Oui, je veux bien',
            reportFraudButtonText: "Non, ce n'était pas moi",
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) =>
                `a supprimé l’activité suspecte et réactivé la carte x${cardLastFour}. Tout est prêt pour continuer à déclarer des dépenses !`,
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
            }) => `activité suspecte identifiée sur la carte se terminant par ${cardLastFour}. Reconnaissez-vous cette transaction ?

${amount} pour ${merchant} - ${date}`,
        },
    },
    workflowsPage: {
        workflowTitle: 'Dépense',
        workflowDescription: 'Configurez un flux de travail depuis le moment où la dépense est engagée, y compris l’approbation et le paiement.',
        submissionFrequency: 'Soumissions',
        submissionFrequencyDescription: 'Choisissez une fréquence personnalisée pour soumettre les dépenses.',
        submissionFrequencyDateOfMonth: 'Jour du mois',
        disableApprovalPromptDescription: 'La désactivation des approbations effacera tous les workflows d’approbation existants.',
        addApprovalsTitle: 'Approbations',
        addApprovalButton: 'Ajouter un circuit d’approbation',
        addApprovalTip: 'Ce flux de travail par défaut s’applique à tous les membres, sauf si un flux de travail plus spécifique existe.',
        approver: 'Approbateur',
        addApprovalsDescription: 'Exiger une approbation supplémentaire avant d’autoriser un paiement.',
        makeOrTrackPaymentsTitle: 'Paiements',
        makeOrTrackPaymentsDescription: 'Ajoutez un payeur autorisé pour les paiements effectués dans Expensify ou pour suivre les paiements effectués ailleurs.',
        customApprovalWorkflowEnabled:
            '<muted-text-label>Un workflow d’approbation personnalisé est activé sur cet espace de travail. Pour examiner ou modifier ce workflow, veuillez contacter votre <account-manager-link>chargé de compte</account-manager-link> ou <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>Un workflow d’approbation personnalisé est activé sur cet espace de travail. Pour examiner ou modifier ce workflow, veuillez contacter <concierge-link>Concierge</concierge-link>.</muted-text-label>',
        editor: {
            submissionFrequency: 'Choisissez combien de temps Expensify doit attendre avant de partager les dépenses sans erreur.',
        },
        frequencyDescription: 'Choisissez la fréquence à laquelle vous souhaitez que les dépenses soient soumises automatiquement, ou rendez cette étape manuelle',
        frequencies: {
            instant: 'Instantanément',
            weekly: 'Hebdomadaire',
            monthly: 'Mensuel',
            twiceAMonth: 'Deux fois par mois',
            byTrip: 'Par voyage',
            manually: 'Manuellement',
            daily: 'Quotidien',
            lastDayOfMonth: 'Dernier jour du mois',
            lastBusinessDayOfMonth: 'Dernier jour ouvrable du mois',
            ordinals: {
                one: 'er',
                two: 'eᵉ',
                few: '3ᵉ',
                other: 'e',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Premier',
                '2': 'Seconde',
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
        approverInMultipleWorkflows: 'Ce membre appartient déjà à un autre circuit d’approbation. Toute mise à jour effectuée ici sera également répercutée là-bas.',
        approverCircularReference: (name1: string, name2: string) =>
            `<strong>${name1}</strong> approuve déjà des notes de frais pour <strong>${name2}</strong>. Veuillez choisir un autre approbateur pour éviter un circuit d’approbation circulaire.`,
        emptyContent: {
            title: 'Aucun membre à afficher',
            expensesFromSubtitle: 'Tous les membres de l’espace de travail appartiennent déjà à un workflow d’approbation existant.',
            approverSubtitle: 'Tous les approbateurs appartiennent à un workflow existant.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: 'La fréquence de soumission n’a pas pu être modifiée. Veuillez réessayer ou contacter l’assistance.',
        monthlyOffsetErrorMessage: 'La fréquence mensuelle n’a pas pu être modifiée. Veuillez réessayer ou contacter l’assistance.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Confirmer',
        header: 'Ajoutez d’autres approbateurs et confirmez.',
        additionalApprover: 'Approbateur supplémentaire',
        submitButton: 'Ajouter un workflow',
    },
    workflowsEditApprovalsPage: {
        title: 'Modifier le workflow d’approbation',
        deleteTitle: 'Supprimer le circuit d’approbation',
        deletePrompt: 'Voulez-vous vraiment supprimer ce workflow d’approbation ? Tous les membres suivront ensuite le workflow par défaut.',
    },
    workflowsExpensesFromPage: {
        title: 'Dépenses depuis',
        header: 'Lorsque les membres suivants soumettent des dépenses :',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'L’approbateur n’a pas pu être modifié. Veuillez réessayer ou contacter l’assistance.',
        title: "Définir l'approbateur",
        description: 'Cette personne approuvera les dépenses.',
    },
    workflowsApprovalLimitPage: {
        title: 'Approbateur',
        header: '(Facultatif) Vous voulez ajouter une limite d’approbation ?',
        description: ({approverName}: {approverName: string}) =>
            approverName
                ? `Ajouter un autre approbateur lorsque <strong>${approverName}</strong> est approbateur et que la note de frais dépasse le montant ci-dessous :`
                : 'Ajouter un autre approbateur lorsque une note de frais dépasse le montant ci-dessous :',
        reportAmountLabel: 'Montant de la note de frais',
        additionalApproverLabel: 'Approbateur supplémentaire',
        skip: 'Ignorer',
        next: 'Suivant',
        removeLimit: 'Supprimer la limite',
        enterAmountError: 'Veuillez saisir un montant valide',
        enterApproverError: 'Un approbateur est obligatoire lorsque vous définissez une limite de note de frais',
        enterBothError: 'Saisissez un montant de note de frais et un approbateur supplémentaire',
        forwardLimitDescription: ({approvalLimit, approverName}: {approvalLimit: string; approverName: string}) =>
            `Les notes de frais supérieures à ${approvalLimit} sont transmises à ${approverName}`,
    },
    workflowsPayerPage: {
        title: 'Payeur autorisé',
        genericErrorMessage: 'Le payeur autorisé n’a pas pu être modifié. Veuillez réessayer.',
        admins: 'Administrateurs',
        payer: 'Payer',
        paymentAccount: 'Compte de paiement',
    },
    reportFraudPage: {
        title: 'Signaler une fraude de carte virtuelle',
        description:
            'Si les informations de votre carte virtuelle ont été volées ou compromises, nous désactiverons définitivement votre carte actuelle et vous fournirons une nouvelle carte virtuelle avec un nouveau numéro.',
        deactivateCard: 'Désactiver la carte',
        reportVirtualCardFraud: 'Signaler une fraude de carte virtuelle',
    },
    reportFraudConfirmationPage: {
        title: 'Fraude à la carte signalée',
        description: 'Nous avons définitivement désactivé votre carte actuelle. Lorsque vous reviendrez consulter les détails de votre carte, une nouvelle carte virtuelle sera disponible.',
        buttonText: 'C’est bon, merci !',
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
        estimatedDeliveryMessage: 'Votre carte physique arrivera sous 2 à 3 jours ouvrés.',
        next: 'Suivant',
        getPhysicalCard: 'Obtenir une carte physique',
        shipCard: 'Expédier la carte',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transférer${amount ? ` ${amount}` : ''}`,
        instant: 'Immédiat (carte de débit)',
        instantSummary: (rate: string, minAmount: string) => `Frais de ${rate} % (${minAmount} minimum)`,
        ach: '1 à 3 jours ouvrables (compte bancaire)',
        achSummary: 'Aucun frais',
        whichAccount: 'Quel compte ?',
        fee: 'Frais',
        transferSuccess: 'Transfert réussi !',
        transferDetailBankAccount: 'Votre argent devrait arriver dans les 1 à 3 prochains jours ouvrables.',
        transferDetailDebitCard: 'Votre argent devrait arriver immédiatement.',
        failedTransfer: 'Votre solde n’est pas entièrement réglé. Veuillez effectuer un virement vers un compte bancaire.',
        notHereSubTitle: 'Veuillez transférer votre solde depuis la page Portefeuille',
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
        addFirstPaymentMethod: 'Ajoutez un moyen de paiement pour envoyer et recevoir des paiements directement dans l’application.',
        defaultPaymentMethod: 'Par défaut',
        bankAccountLastFour: (lastFour: string) => `Compte bancaire • ${lastFour}`,
    },
    expenseRulesPage: {
        title: 'Règles de dépenses',
        subtitle: 'Ces règles s’appliqueront à vos dépenses. Si vous soumettez dans un espace de travail, les règles de cet espace de travail peuvent alors les remplacer.',
        emptyRules: {
            title: "Vous n'avez créé aucune règle",
            subtitle: 'Ajoutez une règle pour automatiser la déclaration des dépenses.',
        },
        changes: {
            billable: (value: boolean) => `Mettre à jour la dépense ${value ? 'facturable' : 'non refacturable'}`,
            category: (value: string) => `Mettre à jour la catégorie sur « ${value} »`,
            comment: (value: string) => `Modifier la description en « ${value} »`,
            merchant: (value: string) => `Mettre à jour le commerçant sur « ${value} »`,
            reimbursable: (value: boolean) => `Mettre à jour la dépense ${value ? 'remboursable' : 'non remboursable'}`,
            report: (value: string) => `Ajouter à une note de frais nommée « ${value} »`,
            tag: (value: string) => `Mettre à jour le tag en « ${value} »`,
            tax: (value: string) => `Mettre à jour le taux de taxe sur « ${value} »`,
        },
        newRule: 'Nouvelle règle',
        addRule: {
            title: 'Ajouter une règle',
            expenseContains: 'Si la dépense contient :',
            applyUpdates: 'Appliquez ensuite ces mises à jour :',
            merchantHint: 'Tapez * pour créer une règle qui s’applique à tous les marchands',
            addToReport: 'Ajouter à une note de frais nommée',
            createReport: 'Créer une note de frais si nécessaire',
            applyToExistingExpenses: 'Appliquer aux dépenses correspondantes existantes',
            confirmError: 'Saisissez un commerçant et appliquez au moins une modification',
            confirmErrorMerchant: 'Veuillez saisir le commerçant',
            confirmErrorUpdate: 'Veuillez appliquer au moins une mise à jour',
            saveRule: 'Enregistrer la règle',
        },
        editRule: {
            title: 'Modifier la règle',
        },
        deleteRule: {
            deleteSingle: 'Supprimer la règle',
            deleteMultiple: 'Supprimer les règles',
            deleteSinglePrompt: 'Voulez-vous vraiment supprimer cette règle ?',
            deleteMultiplePrompt: 'Voulez-vous vraiment supprimer ces règles ?',
        },
    },
    preferencesPage: {
        appSection: {
            title: 'Préférences de l’application',
        },
        testSection: {
            title: 'Préférences de test',
            subtitle: 'Paramètres pour aider à déboguer et tester l’application sur l’environnement de préproduction.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Recevoir les mises à jour de fonctionnalités pertinentes et les actualités d’Expensify',
        muteAllSounds: 'Couper tous les sons d’Expensify',
    },
    priorityModePage: {
        priorityMode: 'Mode prioritaire',
        explainerText: 'Choisissez de #vous concentrer uniquement sur les discussions non lues et épinglées, ou d’afficher tout avec les discussions les plus récentes et épinglées en haut.',
        priorityModes: {
            default: {
                label: 'Plus récent',
                description: 'Afficher toutes les discussions triées par les plus récentes',
            },
            gsd: {
                label: '#focus',
                description: 'Afficher seulement les non lus triés par ordre alphabétique',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `dans ${policyName}`,
        generatingPDF: 'Générer un PDF',
        waitForPDF: 'Veuillez patienter pendant que nous générons le PDF.',
        errorPDF: 'Une erreur s’est produite lors de la tentative de génération de votre PDF',
        successPDF: 'Votre PDF a été généré ! S’il ne s’est pas téléchargé automatiquement, utilisez le bouton ci-dessous.',
    },
    reportDescriptionPage: {
        roomDescription: 'Description de la salle',
        roomDescriptionOptional: 'Description de la salle (facultatif)',
        explainerText: 'Définir une description personnalisée pour la salle.',
    },
    groupChat: {
        lastMemberTitle: 'Attention !',
        lastMemberWarning: 'Comme vous êtes la dernière personne ici, partir rendra cette discussion inaccessible à tous les membres. Êtes-vous sûr de vouloir partir ?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `Discussion de groupe de ${displayName}`,
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
        chooseThemeBelowOrSync: 'Choisissez un thème ci-dessous ou synchronisez avec les réglages de votre appareil.',
    },
    termsOfUse: {
        terms: `<muted-text-xs>En vous connectant, vous acceptez les <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Conditions d’utilisation</a> et la <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Confidentialité</a>.</muted-text-xs>`,
        license: `<muted-text-xs>Le transfert d’argent est assuré par ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010), conformément à ses <a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">licences</a>.</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Vous n’avez pas reçu de code magique ?',
        enterAuthenticatorCode: 'Veuillez saisir votre code d’authentification',
        enterRecoveryCode: 'Veuillez saisir votre code de récupération',
        requiredWhen2FAEnabled: 'Obligatoire lorsque l’authentification à deux facteurs est activée',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `Demander un nouveau code dans <a>${timeRemaining}</a>`,
        requestNewCodeAfterErrorOccurred: 'Demander un nouveau code',
        error: {
            pleaseFillMagicCode: 'Veuillez saisir votre code magique',
            incorrectMagicCode: 'Code magique incorrect ou invalide. Veuillez réessayer ou demander un nouveau code.',
            pleaseFillTwoFactorAuth: 'Veuillez saisir votre code d’authentification à deux facteurs',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Veuillez remplir tous les champs',
        pleaseFillPassword: 'Veuillez saisir votre mot de passe',
        pleaseFillTwoFactorAuth: 'Veuillez saisir votre code de double authentification',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Saisissez votre code d’authentification à deux facteurs pour continuer',
        forgot: 'Mot de passe oublié ?',
        requiredWhen2FAEnabled: 'Obligatoire lorsque l’authentification à deux facteurs est activée',
        error: {
            incorrectPassword: 'Mot de passe incorrect. Veuillez réessayer.',
            incorrectLoginOrPassword: 'Identifiant ou mot de passe incorrect. Veuillez réessayer.',
            incorrect2fa: 'Code d’authentification à deux facteurs incorrect. Veuillez réessayer.',
            twoFactorAuthenticationEnabled:
                'L’authentification à deux facteurs est activée sur ce compte. Veuillez vous connecter à l’aide de votre adresse e-mail ou de votre numéro de téléphone.',
            invalidLoginOrPassword: 'Identifiant ou mot de passe invalide. Veuillez réessayer ou réinitialiser votre mot de passe.',
            unableToResetPassword:
                'Nous n’avons pas pu changer votre mot de passe. Cela est probablement dû à un lien de réinitialisation de mot de passe expiré dans un ancien e-mail de réinitialisation. Nous vous avons envoyé un nouveau lien pour que vous puissiez réessayer. Vérifiez votre boîte de réception et votre dossier de courrier indésirable ; il devrait arriver dans quelques minutes.',
            noAccess: 'Vous n’avez pas accès à cette application. Veuillez ajouter votre nom d’utilisateur GitHub pour obtenir l’accès.',
            accountLocked: 'Votre compte a été verrouillé après trop de tentatives infructueuses. Veuillez réessayer dans 1 heure.',
            fallback: 'Un problème est survenu. Veuillez réessayer ultérieurement.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Téléphone ou e-mail',
        error: {
            invalidFormatEmailLogin: 'L’e-mail saisi n’est pas valide. Corrigez le format et réessayez.',
        },
        cannotGetAccountDetails: 'Impossible de récupérer les détails du compte. Veuillez essayer de vous reconnecter.',
        loginForm: 'Formulaire de connexion',
        notYou: ({user}: NotYouParams) => `Pas ${user} ?`,
    },
    onboarding: {
        welcome: 'Bienvenue !',
        welcomeSignOffTitleManageTeam:
            'Une fois que vous aurez terminé les tâches ci-dessus, nous pourrons explorer davantage de fonctionnalités comme les workflows d’approbation et les règles !',
        welcomeSignOffTitle: 'Ravi de vous rencontrer !',
        explanationModal: {
            title: 'Bienvenue sur Expensify',
            description:
                'Une seule application pour gérer vos dépenses professionnelles et personnelles à la vitesse d’une discussion. Essayez-la et dites-nous ce que vous en pensez. Et ce n’est qu’un début !',
            secondaryDescription: 'Pour revenir à Expensify Classic, appuyez simplement sur votre photo de profil > Aller à Expensify Classic.',
        },
        getStarted: 'Commencer',
        whatsYourName: 'Comment vous appelez-vous ?',
        peopleYouMayKnow: 'Des personnes que vous connaissez peut-être sont déjà ici ! Vérifiez votre e-mail pour les rejoindre.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Quelqu’un de ${domain} a déjà créé un espace de travail. Veuillez saisir le code magique envoyé à ${email}.`,
        joinAWorkspace: 'Rejoindre un espace de travail',
        listOfWorkspaces: 'Voici la liste des espaces de travail que vous pouvez rejoindre. Ne vous inquiétez pas, vous pourrez toujours les rejoindre plus tard si vous préférez.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} membre${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Où travaillez-vous ?',
        errorSelection: 'Sélectionnez une option pour continuer',
        purpose: {
            title: "Que voulez-vous faire aujourd'hui ?",
            errorContinue: 'Appuyez sur Continuer pour terminer la configuration',
            errorBackButton: "Veuillez terminer les questions de configuration pour commencer à utiliser l'application",
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: 'Me faire rembourser par mon employeur',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Gérer les dépenses de mon équipe',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Suivre et budgétiser les dépenses',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Discutez et partagez les dépenses avec vos amis',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Autre chose',
        },
        employees: {
            title: 'Combien d’employés avez-vous ?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1 à 10 employés',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11 à 50 employés',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51 à 100 employés',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101 à 1 000 employés',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: 'Plus de 1 000 employés',
        },
        accounting: {
            title: 'Utilisez-vous un logiciel de comptabilité ?',
            none: 'Aucun',
        },
        interestedFeatures: {
            title: 'Quelles fonctionnalités vous intéressent ?',
            featuresAlreadyEnabled: 'Voici nos fonctionnalités les plus populaires :',
            featureYouMayBeInterestedIn: 'Activer des fonctionnalités supplémentaires :',
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
            addWorkEmail: 'Ajouter une adresse professionnelle',
        },
        workEmailValidation: {
            title: 'Vérifiez votre adresse e-mail professionnelle',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `Veuillez saisir le code magique envoyé à ${workEmail}. Il devrait arriver d’ici une à deux minutes.`,
        },
        workEmailValidationError: {
            publicEmail: 'Veuillez saisir une adresse e-mail professionnelle valide provenant d’un domaine privé, par exemple mitch@company.com',
            offline: 'Nous n’avons pas pu ajouter votre adresse e-mail professionnelle car vous semblez être hors ligne',
        },
        mergeBlockScreen: {
            title: 'Impossible d’ajouter l’e-mail professionnel',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `Nous n’avons pas pu ajouter ${workEmail}. Veuillez réessayer plus tard dans les paramètres ou discuter avec Concierge pour obtenir de l’aide.`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `Faire un [essai](${testDriveURL})`,
                description: ({testDriveURL}) =>
                    `[Suivez une visite rapide du produit](${testDriveURL}) pour découvrir pourquoi Expensify est la façon la plus rapide de gérer vos dépenses.`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `Faire un [essai](${testDriveURL})`,
                description: ({testDriveURL}) => `Faites un [essai](${testDriveURL}) et offrez à votre équipe *3 mois gratuits d’Expensify !*`,
            },
            addExpenseApprovalsTask: {
                title: 'Ajouter des approbations de dépenses',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        *Ajoutez des approbations de dépenses* pour examiner les dépenses de votre équipe et les garder sous contrôle.

                        Procédez comme suit :

                        1. Allez dans *Espaces de travail*.
                        2. Sélectionnez votre espace de travail.
                        3. Cliquez sur *Plus de fonctionnalités*.
                        4. Activez *Workflows*.
                        5. Dans l’éditeur de l’espace de travail, accédez à *Workflows*.
                        6. Activez *Ajouter des approbations*.
                        7. Vous serez défini comme approbateur des dépenses. Vous pourrez changer ce rôle pour n’importe quel administrateur une fois que vous aurez invité votre équipe.

                        [Afficher plus de fonctionnalités](${workspaceMoreFeaturesLink}).`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `[Créer](${workspaceConfirmationLink}) un espace de travail`,
                description: 'Créez un espace de travail et configurez les paramètres avec l’aide de votre spécialiste de configuration !',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `Créer un [espace de travail](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        *Créez un espace de travail* pour suivre les dépenses, scanner les reçus, discuter et plus encore.

                        1. Cliquez sur *Espaces de travail* > *Nouvel espace de travail*.

                        *Votre nouvel espace de travail est prêt !* [Découvrez-le](${workspaceSettingsLink}).`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `Configurer les [catégories](${workspaceCategoriesLink})`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *Configurez des catégories* pour que votre équipe puisse coder les dépenses et faciliter les rapports.

                        1. Cliquez sur *Espaces de travail*.
                        2. Sélectionnez votre espace de travail.
                        3. Cliquez sur *Catégories*.
                        4. Désactivez les catégories dont vous n'avez pas besoin.
                        5. Ajoutez vos propres catégories en haut à droite.

                        [Accéder aux paramètres des catégories de l'espace de travail](${workspaceCategoriesLink}).

                        ![Configurer des catégories](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Soumettre une dépense',
                description: dedent(`
                    *Soumets une dépense* en saisissant un montant ou en scannant un reçu.

                    1. Clique sur le bouton ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Choisis *Créer une dépense*.
                    3. Saisis un montant ou scanne un reçu.
                    4. Ajoute l’e-mail ou le numéro de téléphone de ton responsable.
                    5. Clique sur *Créer*.

                    Et c’est tout !
                `),
            },
            adminSubmitExpenseTask: {
                title: 'Soumettre une dépense',
                description: dedent(`
                    *Soumettez une dépense* en saisissant un montant ou en scannant un reçu.

                    1. Cliquez sur le bouton ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Choisissez *Créer une dépense*.
                    3. Saisissez un montant ou scannez un reçu.
                    4. Confirmez les détails.
                    5. Cliquez sur *Créer*.

                    Et c’est terminé !
                `),
            },
            trackExpenseTask: {
                title: 'Suivre une dépense',
                description: dedent(`
                    *Suivez une dépense* dans n'importe quelle devise, que vous ayez un reçu ou non.

                    1. Cliquez sur le bouton ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Choisissez *Créer une dépense*.
                    3. Saisissez un montant ou scannez un reçu.
                    4. Choisissez votre espace *personnel*.
                    5. Cliquez sur *Créer*.

                    Et voilà, c'est terminé ! Oui, c'est aussi simple que ça.
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `Connecter${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : 'à'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'votre' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
                        Connectez ${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'votre' : 'à'} ${integrationName} pour un codage automatique des dépenses et une synchronisation qui simplifient la clôture de fin de mois.

                        1. Cliquez sur *Espaces de travail*.
                        2. Sélectionnez votre espace de travail.
                        3. Cliquez sur *Comptabilité*.
                        4. Recherchez ${integrationName}.
                        5. Cliquez sur *Connecter*.

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? `[Accéder à la comptabilité](${workspaceAccountingLink}).

                        ![Se connecter à ${integrationName}](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`
        : `[Me rendre à la comptabilité](${workspaceAccountingLink}).`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `Connectez [vos cartes professionnelles](${corporateCardLink})`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        Connectez les cartes que vous avez déjà pour l’import automatique des transactions, la correspondance des reçus et la réconciliation.

                        1. Cliquez sur *Espaces de travail*.
                        2. Sélectionnez votre espace de travail.
                        3. Cliquez sur *Cartes d’entreprise*.
                        4. Suivez les instructions pour connecter vos cartes.

                        [Accéder aux cartes d’entreprise](${corporateCardLink}).`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `Inviter [votre équipe](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Invitez votre équipe* sur Expensify afin qu’elle puisse commencer à suivre ses dépenses dès aujourd’hui.

                        1. Cliquez sur *Espaces de travail*.
                        2. Sélectionnez votre espace de travail.
                        3. Cliquez sur *Membres* > *Inviter un membre*.
                        4. Saisissez des adresses e-mail ou des numéros de téléphone.
                        5. Ajoutez un message d’invitation personnalisé si vous le souhaitez !

                        [Afficher les membres de l’espace de travail](${workspaceMembersLink}).

                        ![Invitez votre équipe](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `Configurer les [catégories](${workspaceCategoriesLink}) et les [tags](${workspaceTagsLink})`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *Configurez des catégories et des tags* pour que votre équipe puisse coder les dépenses et faciliter la création de rapports.

                        Importez-les automatiquement en [connectant votre logiciel de comptabilité](${workspaceAccountingLink}), ou configurez-les manuellement dans les [paramètres de votre espace de travail](${workspaceCategoriesLink}).`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `Configurer les [tags](${workspaceTagsLink})`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        Utilisez les tags pour ajouter des détails supplémentaires aux dépenses, comme les projets, les clients, les lieux et les services. Si vous avez besoin de plusieurs niveaux de tags, vous pouvez passer au plan Control.

                        1. Cliquez sur *Espaces de travail*.
                        2. Sélectionnez votre espace de travail.
                        3. Cliquez sur *Plus de fonctionnalités*.
                        4. Activez *Tags*.
                        5. Accédez à *Tags* dans l’éditeur d’espace de travail.
                        6. Cliquez sur *+ Ajouter un tag* pour créer le vôtre.

                        [Afficher plus de fonctionnalités](${workspaceMoreFeaturesLink}).

                        ![Configurer les tags](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `Invitez votre [comptable](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *Invitez votre comptable* à collaborer dans votre espace de travail et à gérer les dépenses de votre entreprise.

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
                    *Commencez une discussion* avec n’importe qui en utilisant son e-mail ou son numéro de téléphone.

                    1. Cliquez sur le bouton ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Choisissez *Commencer une discussion*.
                    3. Saisissez une adresse e-mail ou un numéro de téléphone.

                    S’ils n’utilisent pas encore Expensify, ils seront invités automatiquement.

                    Chaque discussion sera également envoyée par e-mail ou SMS, auxquels ils pourront répondre directement.
                `),
            },
            splitExpenseTask: {
                title: 'Scinder une dépense',
                description: dedent(`
                    *Divisez une dépense* avec une ou plusieurs personnes.

                    1. Cliquez sur le bouton ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Choisissez *Démarrer une discussion*.
                    3. Saisissez des adresses e-mail ou des numéros de téléphone.
                    4. Cliquez sur le bouton *+* gris dans la discussion > *Diviser une dépense*.
                    5. Créez la dépense en sélectionnant *Manuel*, *Scan* ou *Distance*.

                    N’hésitez pas à ajouter plus de détails si vous le souhaitez, ou envoyez-la simplement. Voyons comment vous faire rembourser !
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `Examinez les [paramètres de votre espace de travail](${workspaceSettingsLink})`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        Voici comment examiner et mettre à jour les paramètres de votre espace de travail :
                        1. Cliquez sur Espace de travail.
                        2. Sélectionnez votre espace de travail.
                        3. Examinez et mettez à jour vos paramètres.
                        [Accéder à votre espace de travail.](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: 'Créez votre première note de frais',
                description: dedent(`
                    Voici comment créer une note de frais :

                    1. Cliquez sur le bouton ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE}.
                    2. Sélectionnez *Créer une note de frais*.
                    3. Cliquez sur *Ajouter une dépense*.
                    4. Ajoutez votre première dépense.

                    Et c’est tout !
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `Faire un [essai](${testDriveURL})` : 'Faites un essai'),
            embeddedDemoIframeTitle: 'Essai gratuit',
            employeeFakeReceipt: {
                description: "Mon reçu d'essai de conduite !",
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Se faire rembourser est aussi simple qu’envoyer un message. Passons en revue les bases.',
            onboardingPersonalSpendMessage: 'Voici comment suivre vos dépenses en quelques clics.',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # Votre essai gratuit a commencé ! Configurons tout cela.
                        👋 Bonjour, je suis votre spécialiste de configuration Expensify. J’ai déjà créé un espace de travail pour vous aider à gérer les reçus et dépenses de votre équipe. Pour tirer le meilleur parti de votre essai gratuit de 30 jours, suivez simplement les étapes de configuration restantes ci-dessous !
                    `)
                    : dedent(`
                        # Votre essai gratuit a commencé ! Procédons à la configuration.
                        👋 Bonjour, je suis votre spécialiste de configuration Expensify. Maintenant que vous avez créé un espace de travail, profitez au maximum de votre essai gratuit de 30 jours en suivant les étapes ci-dessous !
                    `),
            onboardingTrackWorkspaceMessage:
                '# Configurons tout cela\n\n👋 Bonjour, je suis votre spécialiste de configuration Expensify. J’ai déjà créé un espace de travail pour vous aider à gérer vos reçus et dépenses. Pour profiter au maximum de votre essai gratuit de 30 jours, il vous suffit de suivre les étapes de configuration restantes ci‑dessous !',
            onboardingChatSplitMessage: 'Partager des notes avec des amis est aussi simple qu’envoyer un message. Voici comment.',
            onboardingAdminMessage: 'Découvrez comment gérer l’espace de travail de votre équipe en tant qu’administrateur et soumettre vos propres dépenses.',
            onboardingLookingAroundMessage:
                'Expensify est surtout connu pour la gestion des dépenses, des voyages et des cartes de société, mais nous faisons bien plus que cela. Dites-moi ce qui vous intéresse et je vous aiderai à vous lancer.',
            onboardingTestDriveReceiverMessage: '*Vous avez 3 mois gratuits ! Commencez ci-dessous.*',
        },
        workspace: {
            title: 'Restez organisé avec un espace de travail',
            subtitle: 'Débloquez des outils puissants pour simplifier votre gestion des dépenses, le tout en un seul endroit. Avec un espace de travail, vous pouvez :',
            explanationModal: {
                descriptionOne: 'Suivez et organisez les reçus',
                descriptionTwo: 'Catégoriser et taguer les dépenses',
                descriptionThree: 'Créer et partager des notes de frais',
            },
            price: 'Essayez-le gratuitement pendant 30 jours, puis passez à la version supérieure pour seulement <strong>5 $/utilisateur/mois</strong>.',
            createWorkspace: 'Créer un espace de travail',
        },
        confirmWorkspace: {
            title: 'Confirmer l’espace de travail',
            subtitle:
                'Créez un espace de travail pour suivre les reçus, rembourser les dépenses, gérer les voyages, créer des notes de frais, et plus encore — le tout à la vitesse d’une discussion.',
        },
        inviteMembers: {
            title: 'Inviter des membres',
            subtitle: 'Ajoutez votre équipe ou invitez votre comptable. Plus on est de fous, plus on rit !',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Ne plus afficher ceci',
    },
    personalDetails: {
        error: {
            cannotContainSpecialCharacters: 'Le nom ne peut pas contenir de caractères spéciaux',
            containsReservedWord: 'Le nom ne peut pas contenir les mots Expensify ou Concierge',
            hasInvalidCharacter: 'Le nom ne peut pas contenir de virgule ni de point-virgule',
            requiredFirstName: 'Le prénom ne peut pas être vide',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Quel est votre nom légal ?',
        enterDateOfBirth: 'Quelle est votre date de naissance ?',
        enterAddress: 'Quelle est votre adresse ?',
        enterPhoneNumber: 'Quel est votre numéro de téléphone ?',
        personalDetails: 'Informations personnelles',
        privateDataMessage: 'Ces informations sont utilisées pour les déplacements et les paiements. Elles ne sont jamais affichées sur votre profil public.',
        legalName: 'Nom légal',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        address: 'Adresse',
        error: {
            dateShouldBeBefore: (dateString: string) => `La date doit être antérieure au ${dateString}`,
            dateShouldBeAfter: (dateString: string) => `La date doit être postérieure au ${dateString}`,
            hasInvalidCharacter: 'Le nom peut uniquement contenir des caractères latins',
            incorrectZipFormat: (zipFormat?: string) => `Format de code postal incorrect${zipFormat ? `Format acceptable : ${zipFormat}` : ''}`,
            invalidPhoneNumber: `Veuillez vous assurer que le numéro de téléphone est valide (par ex. ${CONST.EXAMPLE_PHONE_NUMBER})`,
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
            `Notre fournisseur de messagerie a temporairement suspendu les e-mails vers ${login} en raison de problèmes de distribution. Pour débloquer votre connexion, veuillez suivre ces étapes :`,
        confirmThat: (login: string) =>
            `<strong>Confirmez que ${login} est orthographié correctement et qu’il s’agit d’une adresse e-mail réelle et délivrable.</strong> Les alias d’e-mail tels que « expenses@domain.com » doivent avoir accès à leur propre boîte de réception pour être utilisés comme identifiant Expensify valide.`,
        ensureYourEmailClient: `<strong>Assurez-vous que votre client de messagerie autorise les e-mails provenant de expensify.com.</strong> Vous trouverez des instructions pour effectuer cette étape <a href="${CONST.SET_NOTIFICATION_LINK}">ici</a>, mais vous pourriez avoir besoin de l’aide de votre service informatique pour configurer vos paramètres de messagerie.`,
        onceTheAbove: `Une fois les étapes ci-dessus terminées, veuillez contacter <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> pour débloquer votre connexion.`,
    },
    openAppFailureModal: {
        title: 'Un problème est survenu...',
        subtitle: `Nous n’avons pas pu charger toutes vos données. Nous en avons été informés et examinons le problème. Si cela persiste, veuillez contacter`,
        refreshAndTryAgain: 'Actualisez et réessayez',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `Nous n’avons pas pu délivrer de SMS à ${login}, nous l’avons donc suspendu temporairement. Veuillez essayer de valider votre numéro :`,
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
                return 'Veuillez patienter un instant avant de réessayer.';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? 'jour' : 'jours'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? 'heure' : 'heures'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? 'minute' : 'minutes'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `Patientez un instant ! Vous devez attendre ${timeText} avant d’essayer de valider à nouveau votre numéro.`;
        },
    },
    welcomeSignUpForm: {
        join: 'Rejoindre',
    },
    detailsPage: {
        localTime: 'Heure locale',
    },
    newChatPage: {
        startGroup: 'Commencer le groupe',
        addToGroup: 'Ajouter au groupe',
    },
    yearPickerPage: {
        year: 'Année',
        selectYear: 'Veuillez sélectionner une année',
    },
    focusModeUpdateModal: {
        title: 'Bienvenue dans le mode #focus !',
        prompt: (priorityModePageUrl: string) =>
            `Gardez le contrôle en n’affichant que les discussions non lues ou celles qui nécessitent votre attention. Ne vous inquiétez pas, vous pouvez modifier ce réglage à tout moment dans les <a href="${priorityModePageUrl}">paramètres</a>.`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'La discussion que vous recherchez est introuvable.',
        getMeOutOfHere: 'Faites-moi sortir d’ici',
        iouReportNotFound: 'Les détails de paiement que vous recherchez sont introuvables.',
        notHere: 'Hmm... ce n’est pas ici',
        pageNotFound: 'Oups, cette page est introuvable',
        noAccess: 'Cette discussion ou cette dépense a peut-être été supprimée ou vous n’y avez pas accès.\n\nPour toute question, veuillez contacter concierge@expensify.com',
        goBackHome: 'Revenir à la page d’accueil',
        commentYouLookingForCannotBeFound: 'Le commentaire que vous recherchez est introuvable.',
        goToChatInstead: 'Allez plutôt dans le chat.',
        contactConcierge: 'Pour toute question, veuillez contacter concierge@expensify.com',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `Oups... ${isBreakLine ? '\n' : ''}Un problème est survenu`,
        subtitle: 'Votre demande n’a pas pu être effectuée. Veuillez réessayer ultérieurement.',
        wrongTypeSubtitle: 'Cette recherche n’est pas valide. Essayez de modifier vos critères de recherche.',
    },
    statusPage: {
        status: 'Statut',
        statusExplanation: 'Ajoutez un emoji pour permettre à vos collègues et amis de savoir facilement ce qu’il se passe. Vous pouvez aussi ajouter un message si vous le souhaitez !',
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
        untilTomorrow: "Jusqu'à demain",
        untilTime: ({time}: UntilTimeParams) => `Jusqu’à ${time}`,
        date: 'Date',
        time: 'Heure',
        clearAfter: 'Effacer après',
        whenClearStatus: 'Quand devons-nous effacer votre statut ?',
        vacationDelegate: 'Délégué de vacances',
        setVacationDelegate: `Définissez un délégué de congés pour approuver des notes de frais en votre nom lorsque vous êtes absent du bureau.`,
        vacationDelegateError: 'Une erreur s’est produite lors de la mise à jour de votre délégué de vacances.',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `en tant que délégué de vacances de ${nameOrEmail}`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) =>
            `à ${submittedToName} en tant que remplaçant de vacances pour ${vacationDelegateName}`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `Vous assignez ${nameOrEmail} comme délégué de vacances. Cette personne n’est pas encore présente dans tous vos espaces de travail. Si vous choisissez de continuer, un e-mail sera envoyé à tous les administrateurs de vos espaces de travail pour l’ajouter.`,
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
        routingNumber: 'Numéro de routage',
        chooseAnAccountBelow: 'Choisissez un compte ci-dessous',
        addBankAccount: 'Ajouter un compte bancaire',
        chooseAnAccount: 'Choisir un compte',
        connectOnlineWithPlaid: 'Connectez-vous à votre banque',
        connectManually: 'Connecter manuellement',
        desktopConnection: 'Remarque : pour vous connecter à Chase, Wells Fargo, Capital One ou Bank of America, veuillez cliquer ici pour terminer ce processus dans un navigateur.',
        yourDataIsSecure: 'Vos données sont sécurisées',
        toGetStarted:
            'Ajoutez un compte bancaire pour rembourser des dépenses, émettre des cartes Expensify, encaisser des paiements de factures et régler des factures, le tout à partir d’un seul endroit.',
        plaidBodyCopy: 'Offrez à vos employés un moyen plus simple de payer – et d’être remboursés – pour les dépenses de l’entreprise.',
        checkHelpLine: 'Votre numéro de routage et votre numéro de compte se trouvent sur un chèque associé à ce compte.',
        hasPhoneLoginError: (contactMethodRoute: string) =>
            `Pour connecter un compte bancaire, veuillez <a href="${contactMethodRoute}">ajouter une adresse e-mail comme identifiant principal</a> puis réessayer. Vous pouvez ajouter votre numéro de téléphone comme identifiant secondaire.`,
        hasBeenThrottledError: 'Une erreur s’est produite lors de l’ajout de votre compte bancaire. Veuillez attendre quelques minutes et réessayer.',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `Oups ! Il semble que la devise de votre espace de travail soit différente du dollar US (USD). Pour continuer, veuillez accéder à <a href="${workspaceRoute}">vos paramètres d’espace de travail</a> pour la définir sur USD, puis réessayer.`,
        bbaAdded: 'Compte bancaire professionnel ajouté !',
        bbaAddedDescription: 'Il est prêt à être utilisé pour les paiements.',
        error: {
            youNeedToSelectAnOption: 'Veuillez sélectionner une option pour continuer',
            noBankAccountAvailable: 'Désolé, aucun compte bancaire n’est disponible',
            noBankAccountSelected: 'Veuillez choisir un compte',
            taxID: 'Veuillez saisir un numéro d’identification fiscale valide',
            website: 'Veuillez saisir un site web valide',
            zipCode: `Veuillez entrer un code postal valide au format : ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: 'Veuillez saisir un numéro de téléphone valide',
            email: 'Veuillez saisir une adresse e-mail valide',
            companyName: 'Veuillez saisir un nom d’entreprise valide',
            addressCity: 'Veuillez saisir une ville valide',
            addressStreet: 'Veuillez saisir une adresse postale valide',
            addressState: 'Veuillez sélectionner un État valide',
            incorporationDateFuture: 'La date de constitution ne peut pas être dans le futur',
            incorporationState: 'Veuillez sélectionner un État valide',
            industryCode: 'Veuillez saisir un code de classification sectorielle valide à six chiffres',
            restrictedBusiness: 'Veuillez confirmer que l’entreprise ne figure pas sur la liste des entreprises restreintes',
            routingNumber: 'Veuillez saisir un numéro d’acheminement valide',
            accountNumber: 'Veuillez saisir un numéro de compte valide',
            routingAndAccountNumberCannotBeSame: 'Le code de routage et le numéro de compte ne peuvent pas être identiques',
            companyType: 'Veuillez sélectionner un type d’entreprise valide',
            tooManyAttempts:
                'En raison d’un nombre élevé de tentatives de connexion, cette option a été désactivée pendant 24 heures. Veuillez réessayer plus tard ou saisir les informations manuellement à la place.',
            address: 'Veuillez saisir une adresse valide',
            dob: 'Veuillez sélectionner une date de naissance valide',
            age: 'Doit avoir plus de 18 ans',
            ssnLast4: 'Veuillez saisir les 4 derniers chiffres valides de votre numéro de sécurité sociale',
            firstName: 'Veuillez saisir un prénom valide',
            lastName: 'Veuillez saisir un nom de famille valide',
            noDefaultDepositAccountOrDebitCardAvailable: 'Veuillez ajouter un compte de dépôt ou une carte de débit par défaut',
            validationAmounts: 'Les montants de validation que vous avez saisis sont incorrects. Veuillez vérifier à nouveau votre relevé bancaire et réessayer.',
            fullName: 'Veuillez saisir un nom complet valide',
            ownershipPercentage: 'Veuillez saisir un nombre de pourcentage valide',
            deletePaymentBankAccount:
                'Ce compte bancaire ne peut pas être supprimé, car il est utilisé pour les paiements Expensify Card. Si vous souhaitez tout de même supprimer ce compte, veuillez contacter Concierge.',
            sameDepositAndWithdrawalAccount: 'Les comptes de dépôt et de retrait sont identiques.',
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
        confirmationStepSubHeader: 'Vérifiez attentivement les détails ci-dessous et cochez la case des conditions pour confirmer.',
        toGetStarted: 'Ajoutez un compte bancaire personnel pour recevoir des remboursements, payer des factures ou activer le portefeuille Expensify.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Saisissez le mot de passe Expensify',
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
            beforeLinkText: 'S’il vous plaît',
            linkText: 'saisir le mot de passe',
            afterLinkText: 'pour l’afficher.',
            formLabel: 'Voir le PDF',
        },
        attachmentNotFound: 'Pièce jointe introuvable',
        retry: 'Réessayer',
    },
    messages: {
        errorMessageInvalidPhone: `Veuillez saisir un numéro de téléphone valide sans parenthèses ni tirets. Si vous êtes en dehors des États-Unis, veuillez inclure l’indicatif de votre pays (par ex. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Adresse e-mail invalide',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} est déjà membre de ${name}`,
        userIsAlreadyAnAdmin: ({login, name}: UserIsAlreadyMemberParams) => `${login} est déjà administrateur de ${name}`,
    },
    onfidoStep: {
        acceptTerms: 'En poursuivant la demande d’activation de votre Portefeuille Expensify, vous confirmez que vous avez lu, compris et accepté',
        facialScan: 'Politique et autorisation de scan facial d’Onfido',
        onfidoLinks: (onfidoTitle: string) =>
            `<muted-text-micro>${onfidoTitle} <a href='${CONST.ONFIDO_FACIAL_SCAN_POLICY_URL}'>Politique de numérisation faciale et autorisation d’Onfido</a>, <a href='${CONST.ONFIDO_PRIVACY_POLICY_URL}'>Confidentialité</a> et <a href='${CONST.ONFIDO_TERMS_OF_SERVICE_URL}'>Conditions d’utilisation</a>.</muted-text-micro>`,
        tryAgain: 'Réessayer',
        verifyIdentity: 'Vérifier l’identité',
        letsVerifyIdentity: 'Vérifions votre identité',
        butFirst: `Mais d’abord, les trucs ennuyeux. Prenez connaissance du jargon juridique à l’étape suivante et cliquez sur « Accepter » quand vous serez prêt.`,
        genericError: 'Une erreur s’est produite lors du traitement de cette étape. Veuillez réessayer.',
        cameraPermissionsNotGranted: 'Activer l’accès à l’appareil photo',
        cameraRequestMessage: 'Nous avons besoin d’accéder à votre appareil photo pour terminer la vérification du compte bancaire. Veuillez l’activer via Réglages &gt; New Expensify.',
        microphonePermissionsNotGranted: 'Autoriser l’accès au microphone',
        microphoneRequestMessage: 'Nous avons besoin d’accéder à votre microphone pour terminer la vérification de votre compte bancaire. Veuillez l’activer via Réglages > New Expensify.',
        originalDocumentNeeded: 'Veuillez téléverser une image originale de votre pièce d’identité plutôt qu’une capture d’écran ou une image numérisée.',
        documentNeedsBetterQuality:
            'Votre pièce d’identité semble être endommagée ou présenter des éléments de sécurité manquants. Veuillez télécharger une image originale d’une pièce d’identité intacte, entièrement visible.',
        imageNeedsBetterQuality:
            'La qualité de l’image de votre pièce d’identité pose problème. Veuillez téléverser une nouvelle image sur laquelle l’intégralité de votre pièce d’identité est clairement visible.',
        selfieIssue: 'Il y a un problème avec votre selfie/vidéo. Veuillez téléverser un selfie/une vidéo en direct.',
        selfieNotMatching: 'Votre selfie/vidéo ne correspond pas à votre pièce d’identité. Veuillez téléverser un nouveau selfie/une nouvelle vidéo où votre visage est clairement visible.',
        selfieNotLive: 'Votre selfie/vidéo ne semble pas être une photo/vidéo en direct. Veuillez télécharger un selfie/vidéo en direct.',
    },
    additionalDetailsStep: {
        headerTitle: 'Informations supplémentaires',
        helpText: 'Nous devons confirmer les informations suivantes avant que vous puissiez envoyer et recevoir de l’argent depuis votre portefeuille.',
        helpTextIdologyQuestions: 'Nous devons encore vous poser quelques questions pour terminer la validation de votre identité.',
        helpLink: 'En savoir plus sur les raisons pour lesquelles nous en avons besoin.',
        legalFirstNameLabel: 'Prénom légal',
        legalMiddleNameLabel: 'Deuxième prénom légal',
        legalLastNameLabel: 'Nom de famille légal',
        selectAnswer: 'Veuillez sélectionner une réponse pour continuer',
        ssnFull9Error: 'Veuillez saisir un numéro de sécurité sociale valide à neuf chiffres',
        needSSNFull9: 'Nous rencontrons des difficultés pour vérifier votre numéro de sécurité sociale (SSN). Veuillez saisir les neuf chiffres complets de votre SSN.',
        weCouldNotVerify: "Nous n'avons pas pu vérifier",
        pleaseFixIt: 'Veuillez corriger ces informations avant de continuer',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `Nous n’avons pas pu vérifier votre identité. Veuillez réessayer plus tard ou contacter <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> si vous avez des questions.`,
    },
    termsStep: {
        headerTitle: 'Conditions et frais',
        headerTitleRefactor: 'Frais et conditions',
        haveReadAndAgreePlain: 'J’ai lu et j’accepte de recevoir les communications électroniques.',
        haveReadAndAgree: `J’ai lu et j’accepte de recevoir des <a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">communications électroniques</a>.`,
        agreeToThePlain: 'J’accepte la politique de confidentialité et l’accord de portefeuille.',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `J’accepte la <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">Politique de confidentialité</a> et les <a href="${walletAgreementUrl}">Conditions d’utilisation du portefeuille</a>.`,
        enablePayments: 'Activer les paiements',
        monthlyFee: 'Frais mensuels',
        inactivity: 'Inactivité',
        noOverdraftOrCredit: 'Aucune fonctionnalité de découvert/crédit.',
        electronicFundsWithdrawal: 'Prélèvement de fonds électronique',
        standard: 'Standard',
        reviewTheFees: 'Découvrez certains frais.',
        checkTheBoxes: 'Veuillez cocher les cases ci-dessous.',
        agreeToTerms: 'Acceptez les conditions et vous serez prêt à commencer !',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Le portefeuille Expensify est émis par ${walletProgram}.`,
            perPurchase: 'Par achat',
            atmWithdrawal: 'Retrait au distributeur',
            cashReload: 'Recharge en espèces',
            inNetwork: 'dans le réseau',
            outOfNetwork: 'hors réseau',
            atmBalanceInquiry: 'Consultation de solde au guichet automatique (dans le réseau ou hors réseau)',
            customerService: 'Service client (automatisé ou agent en direct)',
            inactivityAfterTwelveMonths: 'Inactivité (après 12 mois sans transactions)',
            weChargeOneFee: 'Nous facturons 1 autre type de frais. Il s’agit :',
            fdicInsurance: 'Vos fonds sont éligibles à la garantie de la FDIC.',
            generalInfo: `Pour des informations générales sur les comptes prépayés, consultez <a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>.`,
            conditionsDetails: `Pour plus de détails et pour connaître les conditions relatives à tous les frais et services, consultez <a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> ou appelez le +1 833-400-0904.`,
            electronicFundsWithdrawalInstant: 'Prélèvement électronique de fonds (instantané)',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min. ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'Liste de tous les frais du portefeuille Expensify',
            typeOfFeeHeader: 'Tous les frais',
            feeAmountHeader: 'Montant',
            moreDetailsHeader: 'Détails',
            openingAccountTitle: 'Ouverture d’un compte',
            openingAccountDetails: 'L’ouverture d’un compte est gratuite.',
            monthlyFeeDetails: "Il n'y a pas de frais mensuels.",
            customerServiceTitle: 'Service client',
            customerServiceDetails: 'Il n’y a pas de frais de service client.',
            inactivityDetails: 'Il n’y a pas de frais d’inactivité.',
            sendingFundsTitle: 'Envoi de fonds à un autre titulaire de compte',
            sendingFundsDetails: 'Aucun frais n’est facturé pour envoyer des fonds à un autre titulaire de compte en utilisant votre solde, votre compte bancaire ou votre carte de débit.',
            electronicFundsStandardDetails:
                'Aucun frais n’est appliqué pour transférer des fonds de votre Portefeuille Expensify vers votre compte bancaire en utilisant l’option standard. Ce virement est généralement effectué sous 1 à 3 jours ouvrables.',
            electronicFundsInstantDetails: (percentage: string, amount: string) =>
                'Des frais s’appliquent pour transférer des fonds de votre Portefeuille Expensify vers votre carte de débit liée en utilisant l’option de transfert instantané. Ce transfert est généralement effectué en quelques minutes.' +
                `Les frais correspondent à ${percentage}% du montant du virement (avec des frais minimum de ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `Vos fonds sont éligibles à l’assurance FDIC. Vos fonds seront détenus ou transférés à ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, une institution assurée par la FDIC.` +
                `Une fois là-bas, vos fonds sont assurés jusqu’à ${amount} par la FDIC au cas où ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} ferait faillite, si des exigences spécifiques d’assurance des dépôts sont remplies et que votre carte est enregistrée. Consultez ${CONST.TERMS.FDIC_PREPAID} pour plus de détails.`,
            contactExpensifyPayments: `Contactez ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} en appelant le +1 833-400-0904, par e-mail à ${CONST.EMAIL.CONCIERGE} ou connectez-vous sur ${CONST.NEW_EXPENSIFY_URL}.`,
            generalInformation: `Pour des informations générales sur les comptes prépayés, consultez ${CONST.TERMS.CFPB_PREPAID}. Si vous avez une réclamation concernant un compte prépayé, appelez le Bureau de protection financière des consommateurs au 1-855-411-2372 ou consultez ${CONST.TERMS.CFPB_COMPLAINT}.`,
            printerFriendlyView: 'Afficher la version prête à imprimer',
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
        checkBackLaterTitle: 'Une minute…',
        checkBackLaterMessage: 'Nous examinons toujours vos informations. Veuillez revenir plus tard.',
        continueToPayment: 'Continuer vers le paiement',
        continueToTransfer: 'Continuer le virement',
    },
    companyStep: {
        headerTitle: 'Informations sur l’entreprise',
        subtitle: 'Presque terminé ! Pour des raisons de sécurité, nous devons confirmer certaines informations :',
        legalBusinessName: 'Dénomination sociale',
        companyWebsite: 'Site web de l’entreprise',
        taxIDNumber: "Numéro d'identification fiscale",
        taxIDNumberPlaceholder: '9 chiffres',
        companyType: 'Type d’entreprise',
        incorporationDate: 'Date de constitution',
        incorporationState: 'État d’incorporation',
        industryClassificationCode: 'Code de classification sectorielle',
        confirmCompanyIsNot: 'Je confirme que cette entreprise ne figure pas sur la',
        listOfRestrictedBusinesses: 'liste d’entreprises restreintes',
        incorporationDatePlaceholder: 'Date de début (aaaa-mm-jj)',
        incorporationTypes: {
            LLC: 'SARL',
            CORPORATION: 'Entreprise',
            PARTNERSHIP: 'Partenariat',
            COOPERATIVE: 'Coopérative',
            SOLE_PROPRIETORSHIP: 'Entreprise individuelle',
            OTHER: 'Autre',
        },
        industryClassification: 'Dans quel secteur d’activité l’entreprise est-elle classée ?',
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
        noPersonalChecks: 'Pas d’inquiétude, aucun contrôle de solvabilité personnel ici !',
        whatsYourPhoneNumber: 'Quel est votre numéro de téléphone ?',
        weNeedThisToVerify: 'Nous en avons besoin pour vérifier votre portefeuille.',
    },
    businessInfoStep: {
        businessInfo: 'Infos sur l’entreprise',
        enterTheNameOfYourBusiness: "Comment s'appelle votre entreprise ?",
        businessName: 'Dénomination sociale',
        enterYourCompanyTaxIdNumber: 'Quel est le numéro d’identification fiscale de votre entreprise ?',
        taxIDNumber: "Numéro d'identification fiscale",
        taxIDNumberPlaceholder: '9 chiffres',
        enterYourCompanyWebsite: 'Quel est le site web de votre entreprise ?',
        companyWebsite: 'Site web de l’entreprise',
        enterYourCompanyPhoneNumber: 'Quel est le numéro de téléphone de votre entreprise ?',
        enterYourCompanyAddress: 'Quelle est l’adresse de votre entreprise ?',
        selectYourCompanyType: 'Quel type d’entreprise est-ce ?',
        companyType: 'Type d’entreprise',
        incorporationType: {
            LLC: 'SARL',
            CORPORATION: 'Entreprise',
            PARTNERSHIP: 'Partenariat',
            COOPERATIVE: 'Coopérative',
            SOLE_PROPRIETORSHIP: 'Entreprise individuelle',
            OTHER: 'Autre',
        },
        selectYourCompanyIncorporationDate: 'Quelle est la date de création de votre entreprise ?',
        incorporationDate: 'Date de constitution',
        incorporationDatePlaceholder: 'Date de début (aaaa-mm-jj)',
        incorporationState: 'État d’incorporation',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'Dans quel État votre entreprise a-t-elle été constituée ?',
        letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
        companyAddress: 'Adresse de l’entreprise',
        listOfRestrictedBusinesses: 'liste d’entreprises restreintes',
        confirmCompanyIsNot: 'Je confirme que cette entreprise ne figure pas sur la',
        businessInfoTitle: 'Infos professionnelles',
        legalBusinessName: 'Dénomination sociale',
        whatsTheBusinessName: 'Quel est le nom de l’entreprise ?',
        whatsTheBusinessAddress: 'Quelle est l’adresse professionnelle ?',
        whatsTheBusinessContactInformation: 'Quelles sont les coordonnées de l’entreprise ?',
        whatsTheBusinessRegistrationNumber: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return 'Quel est le numéro d’immatriculation de l’entreprise (CRN) ?';
                default:
                    return 'Quel est le numéro d’immatriculation de l’entreprise ?';
            }
        },
        whatsTheBusinessTaxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'Quel est le numéro d’identification de l’employeur (EIN) ?';
                case CONST.COUNTRY.CA:
                    return 'Quel est le numéro d’entreprise (NE) ?';
                case CONST.COUNTRY.GB:
                    return 'Quel est le numéro d’identification à la TVA (VRN) ?';
                case CONST.COUNTRY.AU:
                    return 'Qu’est-ce que le numéro d’entreprise australien (ABN) ?';
                default:
                    return 'Quel est le numéro de TVA intracommunautaire ?';
            }
        },
        whatsThisNumber: 'C’est quoi ce numéro ?',
        whereWasTheBusinessIncorporated: 'Où l’entreprise a-t-elle été constituée ?',
        whatTypeOfBusinessIsIt: 'De quel type d’entreprise s’agit-il ?',
        whatsTheBusinessAnnualPayment: 'Quel est le volume annuel de paiements de l’entreprise ?',
        whatsYourExpectedAverageReimbursements: 'Quel est votre montant moyen de remboursement attendu ?',
        registrationNumber: 'Numéro d’immatriculation',
        taxIDEIN: (country: string) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return 'EIN';
                case CONST.COUNTRY.CA:
                    return 'BN';
                case CONST.COUNTRY.GB:
                    return 'TVA Intracom.';
                case CONST.COUNTRY.AU:
                    return 'ABN';
                default:
                    return 'TVA UE';
            }
        },
        businessAddress: 'Adresse professionnelle',
        businessType: 'Type d’activité',
        incorporation: 'Création d’entreprise',
        incorporationCountry: 'Pays d’incorporation',
        incorporationTypeName: 'Type d’immatriculation',
        businessCategory: 'Catégorie professionnelle',
        annualPaymentVolume: 'Volume annuel de paiements',
        annualPaymentVolumeInCurrency: (currencyCode: string) => `Volume annuel des paiements en ${currencyCode}`,
        averageReimbursementAmount: 'Montant moyen de remboursement',
        averageReimbursementAmountInCurrency: (currencyCode: string) => `Montant moyen de remboursement en ${currencyCode}`,
        selectIncorporationType: 'Sélectionner le type de constitution',
        selectBusinessCategory: 'Sélectionner une catégorie professionnelle',
        selectAnnualPaymentVolume: 'Sélectionner le volume annuel de paiement',
        selectIncorporationCountry: 'Sélectionner le pays d’immatriculation',
        selectIncorporationState: 'Sélectionner l’État de constitution',
        selectAverageReimbursement: 'Sélectionner le montant moyen de remboursement',
        selectBusinessType: "Sélectionner le type d'entreprise",
        findIncorporationType: 'Trouver le type de constitution',
        findBusinessCategory: 'Rechercher la catégorie professionnelle',
        findAnnualPaymentVolume: 'Trouver le volume annuel de paiements',
        findIncorporationState: 'Trouver l’État d’incorporation',
        findAverageReimbursement: 'Trouver le montant moyen de remboursement',
        findBusinessType: 'Trouver le type d’entreprise',
        error: {
            registrationNumber: 'Veuillez fournir un numéro d’immatriculation valide',
            taxIDEIN: (country: string) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return "Veuillez fournir un numéro d'identification d'employeur (EIN) valide";
                    case CONST.COUNTRY.CA:
                        return 'Veuillez fournir un numéro d’entreprise (BN) valide';
                    case CONST.COUNTRY.GB:
                        return 'Veuillez fournir un numéro de TVA intracommunautaire (VRN) valide';
                    case CONST.COUNTRY.AU:
                        return 'Veuillez indiquer un numéro d’entreprise australien (ABN) valide';
                    default:
                        return 'Veuillez fournir un numéro de TVA intracommunautaire valide';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: (companyName: string) => `Possédez-vous au moins 25 % de ${companyName} ?`,
        doAnyIndividualOwn25percent: (companyName: string) => `Des particuliers détiennent-ils 25 % ou plus de ${companyName} ?`,
        areThereMoreIndividualsWhoOwn25percent: (companyName: string) => `Y a-t-il d’autres personnes qui détiennent 25 % ou plus de ${companyName} ?`,
        regulationRequiresUsToVerifyTheIdentity: 'La réglementation nous impose de vérifier l’identité de toute personne physique qui détient plus de 25 % de l’entreprise.',
        companyOwner: "Propriétaire d'entreprise",
        enterLegalFirstAndLastName: 'Quel est le nom légal du responsable ?',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        enterTheDateOfBirthOfTheOwner: 'Quelle est la date de naissance du responsable ?',
        enterTheLast4: 'Quels sont les 4 derniers chiffres du numéro de sécurité sociale du responsable ?',
        last4SSN: '4 derniers chiffres du SSN',
        dontWorry: 'Ne vous inquiétez pas, nous ne faisons aucun contrôle de crédit personnel !',
        enterTheOwnersAddress: 'Quelle est l’adresse du propriétaire ?',
        letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
        legalName: 'Nom légal',
        address: 'Adresse',
        byAddingThisBankAccount: 'En ajoutant ce compte bancaire, vous confirmez que vous avez lu, compris et accepté',
        owners: 'Responsables',
    },
    ownershipInfoStep: {
        ownerInfo: 'Infos du responsable',
        businessOwner: "Propriétaire d'entreprise",
        signerInfo: 'Infos signataire',
        doYouOwn: (companyName: string) => `Possédez-vous au moins 25 % de ${companyName} ?`,
        doesAnyoneOwn: (companyName: string) => `Des particuliers détiennent-ils 25 % ou plus de ${companyName} ?`,
        regulationsRequire: 'La réglementation nous oblige à vérifier l’identité de toute personne physique qui détient plus de 25 % de l’entreprise.',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        whatsTheOwnersName: 'Quel est le nom légal du responsable ?',
        whatsYourName: 'Quel est votre nom légal ?',
        whatPercentage: 'Quel pourcentage de l’entreprise appartient au propriétaire ?',
        whatsYoursPercentage: 'Quel pourcentage de l’entreprise possédez-vous ?',
        ownership: 'Propriété',
        whatsTheOwnersDOB: 'Quelle est la date de naissance du responsable ?',
        whatsYourDOB: 'Quelle est votre date de naissance ?',
        whatsTheOwnersAddress: 'Quelle est l’adresse du propriétaire ?',
        whatsYourAddress: 'Quelle est votre adresse ?',
        whatAreTheLast: 'Quels sont les 4 derniers chiffres du numéro de sécurité sociale du propriétaire ?',
        whatsYourLast: 'Quels sont les 4 derniers chiffres de votre numéro de sécurité sociale ?',
        whatsYourNationality: 'Quel est votre pays de citoyenneté ?',
        whatsTheOwnersNationality: 'Quel est le pays de citoyenneté du responsable ?',
        countryOfCitizenship: 'Pays de citoyenneté',
        dontWorry: 'Ne vous inquiétez pas, nous ne faisons aucun contrôle de crédit personnel !',
        last4: '4 derniers chiffres du SSN',
        whyDoWeAsk: 'Pourquoi demandons-nous cela ?',
        letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
        legalName: 'Nom légal',
        ownershipPercentage: 'Pourcentage de propriété',
        areThereOther: (companyName: string) => `Y a-t-il d’autres personnes qui détiennent 25 % ou plus de ${companyName} ?`,
        owners: 'Responsables',
        addCertified: 'Ajoutez un organigramme certifié indiquant les bénéficiaires effectifs',
        regulationRequiresChart:
            'La réglementation nous impose de collecter une copie certifiée de l’organigramme de propriété indiquant chaque personne physique ou entité qui détient 25 % ou plus de l’entreprise.',
        uploadEntity: 'Téléverser le schéma de propriété de l’entité',
        noteEntity: 'Remarque : le schéma de propriété de l’entité doit être signé par votre comptable, votre conseiller juridique ou être notarié.',
        certified: 'Organigramme certifié de propriété de l’entité',
        selectCountry: 'Sélectionner un pays',
        findCountry: 'Trouver un pays',
        address: 'Adresse',
        chooseFile: 'Choisir un fichier',
        uploadDocuments: 'Téléverser des documents supplémentaires',
        pleaseUpload:
            'Veuillez téléverser ci-dessous des documents supplémentaires pour nous aider à vérifier votre identité en tant que propriétaire direct ou indirect de 25 % ou plus de l’entité commerciale.',
        acceptedFiles: 'Formats de fichier acceptés : PDF, PNG, JPEG. La taille totale des fichiers pour chaque section ne peut pas dépasser 5 Mo.',
        proofOfBeneficialOwner: 'Preuve du bénéficiaire effectif',
        proofOfBeneficialOwnerDescription:
            'Veuillez fournir une attestation signée et un organigramme émanant d’un expert-comptable, d’un notaire ou d’un avocat attestant de la détention de 25 % ou plus de l’entreprise. Le document doit être daté de moins de trois mois et inclure le numéro de licence du signataire.',
        copyOfID: 'Copie de la pièce d’identité du bénéficiaire effectif',
        copyOfIDDescription: 'Exemples : passeport, permis de conduire, etc.',
        proofOfAddress: 'Justificatif de domicile du bénéficiaire effectif',
        proofOfAddressDescription: 'Exemples : facture de services publics, contrat de location, etc.',
        codiceFiscale: 'Code fiscal/ID fiscal',
        codiceFiscaleDescription:
            'Veuillez téléverser une vidéo d’une visite sur site ou d’un appel enregistré avec le signataire autorisé. Le signataire doit indiquer : nom complet, date de naissance, nom de l’entreprise, numéro d’immatriculation, numéro de code fiscal, adresse du siège, nature de l’activité et objet du compte.',
    },
    completeVerificationStep: {
        completeVerification: 'Terminer la vérification',
        confirmAgreements: 'Veuillez confirmer les accords ci-dessous.',
        certifyTrueAndAccurate: 'Je certifie que les informations fournies sont exactes et véridiques',
        certifyTrueAndAccurateError: 'Veuillez certifier que les informations sont exactes et véridiques',
        isAuthorizedToUseBankAccount: 'Je suis autorisé à utiliser ce compte bancaire professionnel pour des dépenses professionnelles',
        isAuthorizedToUseBankAccountError: 'Vous devez être un dirigeant disposant de l’autorisation d’utiliser le compte bancaire de l’entreprise',
        termsAndConditions: 'conditions générales',
    },
    connectBankAccountStep: {
        validateYourBankAccount: 'Valider votre compte bancaire',
        validateButtonText: 'Valider',
        validationInputLabel: 'Transaction',
        maxAttemptsReached: "La validation de ce compte bancaire a été désactivée en raison d'un trop grand nombre de tentatives incorrectes.",
        description: `Sous 1 à 2 jours ouvrés, nous enverrons trois (3) petites transactions sur votre compte bancaire à partir d’un nom ressemblant à « Expensify, Inc. Validation ».`,
        descriptionCTA: 'Veuillez saisir le montant de chaque transaction dans les champs ci-dessous. Exemple : 1.51.',
        letsChatText: 'On y est presque ! Nous avons besoin de votre aide pour vérifier quelques dernières informations par chat. Prêt ?',
        enable2FATitle: 'Prévenez la fraude, activez l’authentification à deux facteurs (2FA)',
        enable2FAText:
            'Nous prenons votre sécurité au sérieux. Veuillez configurer l’authentification à deux facteurs (2FA) maintenant pour ajouter une couche de protection supplémentaire à votre compte.',
        secureYourAccount: 'Sécurisez votre compte',
    },
    countryStep: {
        confirmBusinessBank: 'Confirmez la devise et le pays du compte bancaire professionnel',
        confirmCurrency: 'Confirmez la devise et le pays',
        yourBusiness: 'La devise de votre compte bancaire professionnel doit correspondre à la devise de votre espace de travail.',
        youCanChange: 'Vous pouvez modifier la devise de votre espace de travail dans vos',
        findCountry: 'Trouver un pays',
        selectCountry: 'Sélectionner un pays',
    },
    bankInfoStep: {
        whatAreYour: 'Quelles sont les coordonnées de votre compte bancaire professionnel ?',
        letsDoubleCheck: 'Vérifions une dernière fois que tout a l’air correct.',
        thisBankAccount: 'Ce compte bancaire sera utilisé pour les paiements professionnels sur votre espace de travail',
        accountNumber: 'Numéro de compte',
        accountHolderNameDescription: 'Nom complet du signataire autorisé',
    },
    signerInfoStep: {
        signerInfo: 'Infos signataire',
        areYouDirector: (companyName: string) => `Êtes-vous directeur chez ${companyName} ?`,
        regulationRequiresUs: 'La réglementation nous impose de vérifier si le signataire est habilité à effectuer cette action au nom de l’entreprise.',
        whatsYourName: 'Quel est votre nom légal ?',
        fullName: 'Nom complet légal',
        whatsYourJobTitle: 'Quel est votre intitulé de poste ?',
        jobTitle: 'Intitulé du poste',
        whatsYourDOB: 'Quelle est votre date de naissance ?',
        uploadID: 'Téléverser une pièce d’identité et un justificatif de domicile',
        personalAddress: 'Justificatif de domicile personnel (p. ex. facture de services publics)',
        letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
        legalName: 'Nom légal',
        proofOf: 'Justificatif de domicile personnel',
        enterOneEmail: (companyName: string) => `Saisissez l’e-mail d’un directeur de ${companyName}`,
        regulationRequiresOneMoreDirector: 'La réglementation exige au moins un administrateur supplémentaire en tant que signataire.',
        hangTight: 'Patientez un instant…',
        enterTwoEmails: (companyName: string) => `Saisissez les adresses e-mail de deux directeurs de ${companyName}`,
        sendReminder: 'Envoyer un rappel',
        chooseFile: 'Choisir un fichier',
        weAreWaiting: 'Nous attendons que d’autres vérifient leur identité en tant que directeurs de l’entreprise.',
        id: 'Copie de la pièce d’identité',
        proofOfDirectors: 'Preuve du ou des directeur(s)',
        proofOfDirectorsDescription: 'Exemples : profil d’entreprise Oncorp ou enregistrement d’entreprise.',
        codiceFiscale: 'Code fiscal',
        codiceFiscaleDescription: 'Code fiscal pour les signataires, les utilisateurs autorisés et les bénéficiaires effectifs.',
        PDSandFSG: 'Documents de divulgation PDS + FSG',
        PDSandFSGDescription: dedent(`
            Notre partenariat avec Corpay utilise une connexion API afin de tirer parti de son vaste réseau international de partenaires bancaires pour alimenter les remboursements internationaux dans Expensify. Conformément à la réglementation australienne, nous vous fournissons le Financial Services Guide (FSG) et le Product Disclosure Statement (PDS) de Corpay.

            Veuillez lire attentivement les documents FSG et PDS, car ils contiennent tous les détails et des informations importantes sur les produits et services proposés par Corpay. Conservez ces documents pour référence ultérieure.
        `),
        pleaseUpload: 'Veuillez téléverser ci-dessous des documents supplémentaires pour nous aider à vérifier votre identité en tant que dirigeant(e) de l’entreprise.',
        enterSignerInfo: 'Saisir les informations du signataire',
        thisStep: 'Cette étape a été terminée',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `connecte un compte bancaire professionnel en ${currency} se terminant par ${bankAccountLastFour} à Expensify pour payer des employés en ${currency}. L’étape suivante nécessite les informations de signataire d’un directeur.`,
        error: {
            emailsMustBeDifferent: 'Les e-mails doivent être différents',
        },
    },
    agreementsStep: {
        agreements: 'Accords',
        pleaseConfirm: 'Veuillez confirmer les accords ci-dessous',
        regulationRequiresUs: 'La réglementation nous impose de vérifier l’identité de toute personne physique qui détient plus de 25 % de l’entreprise.',
        iAmAuthorized: 'Je suis autorisé à utiliser le compte bancaire professionnel pour des dépenses professionnelles.',
        iCertify: 'J’atteste que les informations fournies sont exactes et véridiques.',
        iAcceptTheTermsAndConditions: `J’accepte les <a href="https://cross-border.corpay.com/tc/">conditions générales</a>.`,
        iAcceptTheTermsAndConditionsAccessibility: 'J’accepte les termes et conditions.',
        accept: 'Accepter et ajouter un compte bancaire',
        iConsentToThePrivacyNotice: 'Je consens à l’<a href="https://payments.corpay.com/compliance">avis de confidentialité</a>.',
        iConsentToThePrivacyNoticeAccessibility: 'Je consens à l’avis de confidentialité.',
        error: {
            authorized: 'Vous devez être un dirigeant disposant de l’autorisation d’utiliser le compte bancaire de l’entreprise',
            certify: 'Veuillez certifier que les informations sont exactes et véridiques',
            consent: 'Veuillez accepter la notice de confidentialité',
        },
    },
    docusignStep: {
        subheader: 'Formulaire DocuSign',
        pleaseComplete:
            'Veuillez remplir le formulaire d’autorisation ACH avec le lien Docusign ci-dessous, puis téléverser ici la copie signée afin que nous puissions prélever des fonds directement depuis votre compte bancaire.',
        pleaseCompleteTheBusinessAccount: 'Veuillez compléter la demande de compte professionnel pour la mise en place du prélèvement automatique',
        pleaseCompleteTheDirect:
            'Veuillez compléter l’accord de prélèvement automatique en utilisant le lien Docusign ci-dessous, puis téléchargez ici la copie signée afin que nous puissions prélever des fonds directement sur votre compte bancaire.',
        takeMeTo: 'M’emmener vers DocuSign',
        uploadAdditional: 'Téléverser des documents supplémentaires',
        pleaseUpload: 'Veuillez télécharger le formulaire DEFT et la page de signature Docusign',
        pleaseUploadTheDirect: 'Veuillez télécharger les accords de prélèvement automatique et la page de signature Docusign',
    },
    finishStep: {
        letsFinish: 'Finissons dans le chat !',
        thanksFor:
            'Merci pour ces précisions. Un agent d’assistance dédié va maintenant examiner vos informations. Nous reviendrons vers vous si nous avons besoin de quelque chose d’autre, mais en attendant, n’hésitez pas à nous contacter si vous avez des questions.',
        iHaveA: 'J’ai une question',
        enable2FA: 'Activer l’authentification à deux facteurs (2FA) pour prévenir la fraude',
        weTake: 'Nous prenons votre sécurité au sérieux. Veuillez configurer l’authentification à deux facteurs (2FA) maintenant pour ajouter une couche de protection supplémentaire à votre compte.',
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
        subtitle: 'Utilisez Expensify Travel pour obtenir les meilleures offres de voyage et gérer toutes vos dépenses professionnelles en un seul endroit.',
        features: {
            saveMoney: 'Économisez de l’argent sur vos réservations',
            alerts: 'Recevez des alertes en temps réel si vos plans de voyage changent',
        },
        bookTravel: 'Réserver un voyage',
        bookDemo: 'Planifier une démo',
        bookADemo: 'Réserver une démo',
        toLearnMore: 'pour en savoir plus.',
        termsAndConditions: {
            header: 'Avant de continuer...',
            title: 'Conditions générales',
            label: 'J’accepte les conditions générales',
            subtitle: `Veuillez accepter les <a href="${CONST.TRAVEL_TERMS_URL}">conditions générales</a> d’Expensify Travel.`,
            error: 'Vous devez accepter les conditions générales d’Expensify Travel pour continuer',
            defaultWorkspaceError:
                "Vous devez définir un espace de travail par défaut pour activer Expensify Travel. Accédez à Paramètres > Espaces de travail > cliquez sur les trois points verticaux à côté d'un espace de travail > Définir comme espace de travail par défaut, puis réessayez !",
        },
        flight: 'Vol',
        flightDetails: {
            passenger: 'Passager',
            layover: (layover: string) => `<muted-text-label>Vous avez une <strong>escale de ${layover}</strong> avant ce vol</muted-text-label>`,
            takeOff: 'Décollage',
            landing: 'Page d’accueil',
            seat: 'Place',
            class: 'Classe de cabine',
            recordLocator: 'Localisateur de dossier',
            cabinClasses: {
                unknown: 'Inconnu',
                economy: 'Économie',
                premiumEconomy: 'Classe économique premium',
                business: 'Professionnel',
                first: 'Premier',
            },
        },
        hotel: 'Hôtel',
        hotelDetails: {
            guest: 'Invité',
            checkIn: 'Enregistrement',
            checkOut: 'Check-out',
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
            pickUp: 'Ramassage',
            dropOff: 'Dépôt',
            driver: 'Conducteur',
            carType: 'Type de voiture',
            cancellation: 'Politique d’annulation',
            cancellationUntil: 'Annulation gratuite jusqu’au',
            freeCancellation: 'Annulation gratuite',
            confirmation: 'Numéro de confirmation',
        },
        train: 'Rail',
        trainDetails: {
            passenger: 'Passager',
            departs: 'Départ',
            arrives: 'Arrive',
            coachNumber: 'Numéro de voiture',
            seat: 'Place',
            fareDetails: 'Détails du tarif',
            confirmation: 'Numéro de confirmation',
        },
        viewTrip: 'Voir le voyage',
        modifyTrip: 'Modifier le voyage',
        tripSupport: 'Assistance pour voyage',
        tripDetails: 'Détails du voyage',
        viewTripDetails: 'Afficher les détails du voyage',
        trip: 'Voyage',
        trips: 'Voyages',
        tripSummary: 'Récapitulatif du déplacement',
        departs: 'Départ',
        errorMessage: 'Un problème est survenu. Veuillez réessayer ultérieurement.',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>Veuillez <a href="${phoneErrorMethodsRoute}">ajouter une adresse e-mail professionnelle comme identifiant principal</a> pour réserver un voyage.</rbr>`,
        domainSelector: {
            title: 'Domaine',
            subtitle: 'Choisissez un domaine pour la configuration d’Expensify Travel.',
            recommended: 'Recommandé',
        },
        domainPermissionInfo: {
            title: 'Domaine',
            restriction: (domain: string) =>
                `Vous n’avez pas l’autorisation d’activer Expensify Travel pour le domaine <strong>${domain}</strong>. Vous devez demander à quelqu’un de ce domaine d’activer Travel à la place.`,
            accountantInvitation: `Si vous êtes comptable, envisagez de rejoindre le <a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">programme ExpensifyApproved! pour comptables</a> afin d’activer les déplacements pour ce domaine.`,
        },
        publicDomainError: {
            title: 'Commencer avec Expensify Travel',
            message: `Vous devez utiliser votre adresse e-mail professionnelle (par ex. nom@entreprise.com) avec Expensify Travel, et non votre adresse e-mail personnelle (par ex. nom@gmail.com).`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travel a été désactivé',
            message: `Votre administrateur a désactivé Expensify Travel. Veuillez suivre la politique de réservation de votre entreprise pour l’organisation de vos déplacements.`,
        },
        verifyCompany: {
            title: 'Nous examinons votre demande...',
            message: `Nous effectuons quelques vérifications de notre côté pour confirmer que votre compte est prêt pour Expensify Travel. Nous revenons vers vous très bientôt !`,
            confirmText: 'Compris',
            conciergeMessage: ({domain}: {domain: string}) =>
                `L’activation des déplacements a échoué pour le domaine : ${domain}. Veuillez examiner et activer les déplacements pour ce domaine.`,
        },
        updates: {
            bookingTicketed: (airlineCode: string, origin: string, destination: string, startDate: string, confirmationID = '') =>
                `Votre vol ${airlineCode} (${origin} → ${destination}) du ${startDate} a été réservé. Code de confirmation : ${confirmationID}`,
            ticketVoided: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Votre billet pour le vol ${airlineCode} (${origin} → ${destination}) du ${startDate} a été annulé.`,
            ticketRefunded: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Votre billet pour le vol ${airlineCode} (${origin} → ${destination}) du ${startDate} a été remboursé ou échangé.`,
            flightCancelled: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Votre vol ${airlineCode} (${origin} → ${destination}) du ${startDate}} a été annulé par la compagnie aérienne.`,
            flightScheduleChangePending: (airlineCode: string) =>
                `La compagnie aérienne a proposé une modification d’horaire pour le vol ${airlineCode} ; nous sommes en attente de confirmation.`,
            flightScheduleChangeClosed: (airlineCode: string, startDate?: string) => `Changement d’horaire confirmé : le vol ${airlineCode} part maintenant à ${startDate}.`,
            flightUpdated: (airlineCode: string, origin: string, destination: string, startDate: string) =>
                `Votre vol ${airlineCode} (${origin} → ${destination}) le ${startDate} a été mis à jour.`,
            flightCabinChanged: (airlineCode: string, cabinClass?: string) => `Votre classe de cabine a été mise à jour en ${cabinClass} sur le vol ${airlineCode}.`,
            flightSeatConfirmed: (airlineCode: string) => `Votre siège attribué sur le vol ${airlineCode} a été confirmé.`,
            flightSeatChanged: (airlineCode: string) => `Votre siège attribué sur le vol ${airlineCode} a été modifié.`,
            flightSeatCancelled: (airlineCode: string) => `Votre siège attribué sur le vol ${airlineCode} a été supprimé.`,
            paymentDeclined: 'Le paiement de votre réservation de vol a échoué. Veuillez réessayer.',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `Vous avez annulé votre réservation de ${type} ${id}.`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `Le prestataire a annulé votre réservation de ${type} ${id}.`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `Votre réservation de ${type} a été à nouveau effectuée. Nouveau numéro de confirmation : ${id}.`,
            bookingUpdated: ({type}: TravelTypeParams) => `Votre réservation de ${type} a été mise à jour. Examinez les nouveaux détails dans l’itinéraire.`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `Votre billet de train pour ${origin} → ${destination} le ${startDate} a été remboursé. Un avoir sera traité.`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `Votre billet de train de ${origin} → ${destination} du ${startDate} a été échangé.`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `Votre billet de train pour ${origin} → ${destination} le ${startDate} a été mis à jour.`,
            defaultUpdate: ({type}: TravelTypeParams) => `Votre réservation de ${type} a été mise à jour.`,
        },
        flightTo: 'Vol vers',
        trainTo: 'Train vers',
        carRental: 'location de voiture',
        nightIn: 'nuit dans',
        nightsIn: 'nuits à',
    },
    workspace: {
        common: {
            card: 'Cartes',
            expensifyCard: 'Carte Expensify',
            companyCards: 'Cartes d’entreprise',
            workflows: 'Flux de travail',
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
            tags: 'Tags',
            customField1: 'Champ personnalisé 1',
            customField2: 'Champ personnalisé 2',
            customFieldHint: 'Ajouter un code personnalisé qui s’applique à toutes les dépenses de ce membre.',
            reports: 'Notes de frais',
            reportFields: 'Champs de note de frais',
            reportTitle: 'Titre de la note de frais',
            reportField: 'Champ de note de frais',
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
            deleteConfirmation: 'Voulez-vous vraiment supprimer cet espace de travail ?',
            deleteWithCardsConfirmation: 'Voulez-vous vraiment supprimer cet espace de travail ? Cela supprimera tous les flux de cartes et les cartes assignées.',
            unavailable: 'Espace de travail indisponible',
            memberNotFound: 'Membre introuvable. Pour inviter un nouveau membre dans l’espace de travail, veuillez utiliser le bouton d’invitation ci-dessus.',
            notAuthorized: `Vous n'avez pas accès à cette page. Si vous essayez de rejoindre cet espace de travail, demandez simplement au responsable de vous ajouter comme membre. Autre chose ? Contactez ${CONST.EMAIL.CONCIERGE}.`,
            goToWorkspace: 'Aller à l’espace de travail',
            duplicateWorkspace: 'Dupliquer l’espace de travail',
            duplicateWorkspacePrefix: 'Dupliquer',
            goToWorkspaces: 'Aller aux espaces de travail',
            clearFilter: 'Effacer le filtre',
            workspaceName: 'Nom de l’espace de travail',
            workspaceOwner: 'Responsable',
            workspaceType: 'Type d’espace de travail',
            workspaceAvatar: 'Avatar de l’espace de travail',
            mustBeOnlineToViewMembers: 'Vous devez être en ligne pour afficher les membres de cet espace de travail.',
            moreFeatures: 'Plus de fonctionnalités',
            requested: 'Demandé',
            distanceRates: 'Taux de distance',
            defaultDescription: 'Un seul endroit pour tous vos reçus et dépenses.',
            descriptionHint: 'Partager des informations sur cet espace de travail avec tous les membres.',
            welcomeNote: 'Veuillez utiliser Expensify pour soumettre vos reçus en vue de leur remboursement, merci !',
            subscription: 'Abonnement',
            markAsEntered: 'Marquer comme saisi manuellement',
            markAsExported: 'Marquer comme exporté',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Exporter vers ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
            lineItemLevel: 'Niveau poste de dépense',
            reportLevel: 'Niveau de la note de frais',
            topLevel: 'Niveau supérieur',
            appliedOnExport: 'Non importé dans Expensify, appliqué à l’exportation',
            shareNote: {
                header: "Partagez votre espace de travail avec d'autres membres",
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `Partagez ce code QR ou copiez le lien ci-dessous pour permettre aux membres de demander facilement l’accès à votre espace de travail. Toutes les demandes pour rejoindre l’espace de travail apparaîtront dans le salon <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> pour votre examen.`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `Se connecter à ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            createNewConnection: 'Créer une nouvelle connexion',
            reuseExistingConnection: 'Réutiliser la connexion existante',
            existingConnections: 'Connexions existantes',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `Étant donné que vous vous êtes déjà connecté à ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}, vous pouvez choisir de réutiliser une connexion existante ou d’en créer une nouvelle.`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Dernière synchronisation le ${formattedDate}`,
            authenticationError: (connectionName: string) => `Connexion à ${connectionName} impossible en raison d’une erreur d’authentification.`,
            learnMore: 'En savoir plus',
            memberAlternateText: 'Soumettre et approuver des notes de frais.',
            adminAlternateText: 'Gérer les notes de frais et les paramètres de l’espace de travail.',
            auditorAlternateText: 'Afficher et commenter des notes de frais.',
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
                trip: 'Par voyage',
                weekly: 'Hebdomadaire',
                semimonthly: 'Deux fois par mois',
                monthly: 'Mensuel',
            },
            planType: 'Type de forfait',
            youCantDowngradeInvoicing:
                'Vous ne pouvez pas rétrograder votre forfait sur un abonnement facturé. Pour discuter de votre abonnement ou y apporter des modifications, contactez votre chargé de compte ou Concierge pour obtenir de l’aide.',
            defaultCategory: 'Catégorie par défaut',
            viewTransactions: 'Afficher les transactions',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `Dépenses de ${displayName}`,
            deepDiveExpensifyCard: `<muted-text-label>Les transactions de la carte Expensify seront automatiquement exportées vers un « compte de passif de carte Expensify » créé avec <a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">notre intégration</a>.</muted-text-label>`,
        },
        receiptPartners: {
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `Connecté à ${organizationName}` : 'Automatisez les dépenses de voyage et de livraison de repas dans toute votre organisation.',
                sendInvites: 'Envoyer des invitations',
                sendInvitesDescription:
                    'Ces membres de l’espace de travail n’ont pas encore de compte Uber for Business. Désélectionnez les membres que vous ne souhaitez pas inviter pour le moment.',
                confirmInvite: 'Confirmer l’invitation',
                manageInvites: 'Gérer les invitations',
                confirm: 'Confirmer',
                allSet: 'C’est fait',
                readyToRoll: 'Tout est prêt',
                takeBusinessRideMessage: 'Faites un trajet professionnel et vos reçus Uber seront importés dans Expensify. En route !',
                all: 'Tout',
                linked: 'Lié',
                outstanding: 'En souffrance',
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
                autoRemove: 'Désactiver les membres d’espace de travail supprimés d’Uber for Business',
                emptyContent: {
                    title: 'Aucune invitation en attente',
                    subtitle: 'Hourra ! Nous avons cherché partout et n’avons trouvé aucune invitation en attente.',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>Définissez des taux de per diem pour contrôler les dépenses quotidiennes des employés. <a href="${CONST.DEEP_DIVE_PER_DIEM}">En savoir plus</a>.</muted-text>`,
            amount: 'Montant',
            deleteRates: () => ({
                one: 'Supprimer le taux',
                other: 'Supprimer les taux',
            }),
            deletePerDiemRate: 'Supprimer le taux de per diem',
            findPerDiemRate: 'Trouver le taux de per diem',
            areYouSureDelete: () => ({
                one: 'Voulez-vous vraiment supprimer ce taux ?',
                other: 'Voulez-vous vraiment supprimer ces taux ?',
            }),
            emptyList: {
                title: 'Indemnité journalière',
                subtitle: 'Définissez des taux de per diem pour contrôler les dépenses quotidiennes des employés. Importez les taux à partir d’un tableur pour commencer.',
            },
            importPerDiemRates: 'Importer des taux de per diem',
            editPerDiemRate: 'Modifier le taux de per diem',
            editPerDiemRates: 'Modifier les taux de per diem',
            editDestinationSubtitle: (destination: string) => `La mise à jour de cette destination la modifiera pour tous les sous-taux de per diem de ${destination}.`,
            editCurrencySubtitle: (destination: string) => `La mise à jour de cette devise la modifiera pour tous les sous-taux de per diem ${destination}.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Définissez comment les dépenses hors poche sont exportées vers QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Marquer les chèques comme « à imprimer plus tard »',
            exportDescription: 'Configurez l’exportation des données Expensify vers QuickBooks Desktop.',
            date: 'Date d’exportation',
            exportInvoices: 'Exporter les factures vers',
            exportExpensifyCard: 'Exporter les transactions de carte Expensify au format',
            account: 'Compte',
            accountDescription: 'Choisissez où comptabiliser les écritures de journal.',
            accountsPayable: 'Comptes fournisseurs',
            accountsPayableDescription: 'Choisissez où créer les factures fournisseur.',
            bankAccount: 'Compte bancaire',
            notConfigured: 'Non configuré',
            bankAccountDescription: 'Choisissez d’où envoyer les chèques.',
            creditCardAccount: 'Compte de carte de crédit',
            exportDate: {
                label: 'Date d’exportation',
                description: 'Utiliser cette date lors de l’exportation des notes de frais vers QuickBooks Desktop.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente sur la note de frais.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Date d’exportation',
                        description: 'Date à laquelle la note de frais a été exportée vers QuickBooks Desktop.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date à laquelle la note de frais a été soumise pour approbation.',
                    },
                },
            },
            exportCheckDescription: 'Nous créerons un chèque détaillé pour chaque note de frais Expensify et l’enverrons depuis le compte bancaire ci-dessous.',
            exportJournalEntryDescription: 'Nous créerons une écriture comptable détaillée pour chaque note de frais Expensify et l’enregistrerons sur le compte ci-dessous.',
            exportVendorBillDescription:
                'Nous allons créer une facture fournisseur détaillée pour chaque note de frais Expensify et l’ajouter au compte ci-dessous. Si cette période est clôturée, nous comptabiliserons au 1er jour de la prochaine période ouverte.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop ne prend pas en charge les taxes sur les exports d’écritures de journal. Comme vous avez activé les taxes sur votre espace de travail, cette option d’export est indisponible.',
            outOfPocketTaxEnabledError: 'Les écritures comptables ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d’exportation.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Carte de crédit',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Facture fournisseur',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Écriture comptable',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Vérifier',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Nous créerons un chèque détaillé pour chaque note de frais Expensify et l’enverrons depuis le compte bancaire ci-dessous.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Nous ferons automatiquement correspondre le nom du commerçant sur la transaction par carte de crédit aux fournisseurs correspondants dans QuickBooks. S’il n’existe aucun fournisseur, nous créerons un fournisseur « Dépenses diverses carte de crédit » pour l’associer.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Nous créerons une facture fournisseur détaillée pour chaque note de frais Expensify avec la date de la dernière dépense, et nous l’ajouterons au compte ci-dessous. Si cette période est close, nous l’enregistrerons au 1er jour de la prochaine période ouverte.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Choisissez où exporter les transactions par carte de crédit.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'Choisissez un fournisseur à appliquer à toutes les transactions par carte de crédit.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: 'Choisissez d’où envoyer les chèques.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Les factures fournisseur ne sont pas disponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d’export.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Les chèques ne sont pas disponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d’export.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Les écritures comptables ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d’exportation.',
            },
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: 'Ajoutez le compte dans QuickBooks Desktop et synchronisez à nouveau la connexion',
            qbdSetup: 'Configuration de QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Connexion impossible depuis cet appareil',
                body1: 'Vous devez configurer cette connexion à partir de l’ordinateur qui héberge votre fichier de société QuickBooks Desktop.',
                body2: 'Une fois connecté, vous pourrez synchroniser et exporter depuis n’importe où.',
            },
            setupPage: {
                title: 'Ouvrez ce lien pour vous connecter',
                body: 'Pour terminer la configuration, ouvrez le lien suivant sur l’ordinateur où QuickBooks Desktop est en cours d’exécution.',
                setupErrorTitle: 'Une erreur s’est produite',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>La connexion à QuickBooks Desktop ne fonctionne pas pour le moment. Veuillez réessayer plus tard ou <a href="${conciergeLink}">contactez Concierge</a> si le problème persiste.</centered-text></muted-text>`,
            },
            importDescription: 'Choisissez quelles configurations de codage importer de QuickBooks Desktop vers Expensify.',
            classes: 'Classes',
            items: 'Éléments',
            customers: 'Clients/projets',
            exportCompanyCardsDescription: 'Définissez comment les achats par carte d’entreprise sont exportés vers QuickBooks Desktop.',
            defaultVendorDescription: 'Définissez un fournisseur par défaut qui s’appliquera à toutes les transactions par carte de crédit lors de l’exportation.',
            accountsDescription: 'Votre plan comptable QuickBooks Desktop sera importé dans Expensify en tant que catégories.',
            accountsSwitchTitle: 'Choisissez d’importer les nouveaux comptes en tant que catégories activées ou désactivées.',
            accountsSwitchDescription: 'Les catégories activées seront disponibles pour que les membres puissent les sélectionner lors de la création de leurs dépenses.',
            classesDescription: 'Choisissez comment gérer les classes QuickBooks Desktop dans Expensify.',
            tagsDisplayedAsDescription: 'Niveau poste de ligne',
            reportFieldsDisplayedAsDescription: 'Niveau de la note de frais',
            customersDescription: 'Choisissez comment gérer les clients/projets QuickBooks Desktop dans Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec QuickBooks Desktop chaque jour.',
                createEntities: 'Créer automatiquement les entités',
                createEntitiesDescription: 'Expensify créera automatiquement des fournisseurs dans QuickBooks Desktop s’ils n’existent pas déjà.',
            },
            itemsDescription: 'Choisissez comment gérer les éléments QuickBooks Desktop dans Expensify.',
            accountingMethods: {
                label: 'Quand exporter',
                description: 'Choisissez quand exporter les dépenses :',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Comptabilité d’engagement',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Espèces',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Les dépenses payées de votre poche seront exportées une fois l’approbation finale effectuée',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Les dépenses hors trésorerie seront exportées une fois payées',
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
            accountsSwitchTitle: 'Choisissez d’importer les nouveaux comptes en tant que catégories activées ou désactivées.',
            accountsSwitchDescription: 'Les catégories activées seront disponibles pour que les membres puissent les sélectionner lors de la création de leurs dépenses.',
            classesDescription: 'Choisissez comment gérer les classes QuickBooks Online dans Expensify.',
            customersDescription: 'Choisissez comment gérer les clients/projets QuickBooks Online dans Expensify.',
            locationsDescription: 'Choisissez comment gérer les emplacements QuickBooks Online dans Expensify.',
            taxesDescription: 'Choisissez comment gérer les taxes QuickBooks Online dans Expensify.',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online ne prend pas en charge les emplacements au niveau de la ligne pour les chèques ou les factures fournisseur. Si vous souhaitez avoir des emplacements au niveau de la ligne, veillez à utiliser des écritures de journal et des dépenses par carte de crédit/débit.',
            taxesJournalEntrySwitchNote:
                'QuickBooks Online ne prend pas en charge les taxes sur les écritures de journal. Veuillez modifier votre option d’export pour facture fournisseur ou chèque.',
            exportDescription: 'Configurez comment les données Expensify sont exportées vers QuickBooks Online.',
            date: 'Date d’exportation',
            exportInvoices: 'Exporter les factures vers',
            exportExpensifyCard: 'Exporter les transactions de carte Expensify au format',
            exportDate: {
                label: 'Date d’exportation',
                description: 'Utiliser cette date lors de l’exportation des notes de frais vers QuickBooks Online.',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente sur la note de frais.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Date d’exportation',
                        description: 'Date à laquelle la note de frais a été exportée vers QuickBooks Online.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date à laquelle la note de frais a été soumise pour approbation.',
                    },
                },
            },
            receivable: 'Comptes clients', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archive des comptes clients', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Utilisez ce compte lors de l’exportation de factures vers QuickBooks Online.',
            exportCompanyCardsDescription: 'Définissez comment les achats par carte d’entreprise sont exportés vers QuickBooks Online.',
            vendor: 'Fournisseur',
            defaultVendorDescription: 'Définissez un fournisseur par défaut qui s’appliquera à toutes les transactions par carte de crédit lors de l’exportation.',
            exportOutOfPocketExpensesDescription: 'Définissez comment les dépenses hors poche sont exportées vers QuickBooks Online.',
            exportCheckDescription: 'Nous créerons un chèque détaillé pour chaque note de frais Expensify et l’enverrons depuis le compte bancaire ci-dessous.',
            exportJournalEntryDescription: 'Nous créerons une écriture comptable détaillée pour chaque note de frais Expensify et l’enregistrerons sur le compte ci-dessous.',
            exportVendorBillDescription:
                'Nous allons créer une facture fournisseur détaillée pour chaque note de frais Expensify et l’ajouter au compte ci-dessous. Si cette période est clôturée, nous comptabiliserons au 1er jour de la prochaine période ouverte.',
            account: 'Compte',
            accountDescription: 'Choisissez où comptabiliser les écritures de journal.',
            accountsPayable: 'Comptes fournisseurs',
            accountsPayableDescription: 'Choisissez où créer les factures fournisseur.',
            bankAccount: 'Compte bancaire',
            notConfigured: 'Non configuré',
            bankAccountDescription: 'Choisissez d’où envoyer les chèques.',
            creditCardAccount: 'Compte de carte de crédit',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online ne prend pas en charge les emplacements lors de l’exportation des factures fournisseurs. Comme vous avez activé les emplacements sur votre espace de travail, cette option d’exportation n’est pas disponible.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online ne prend pas en charge les taxes sur les exports d’écritures de journal. Comme vous avez activé les taxes sur votre espace de travail, cette option d’export est indisponible.',
            outOfPocketTaxEnabledError: 'Les écritures comptables ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d’exportation.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec QuickBooks Online chaque jour.',
                inviteEmployees: 'Inviter des employés',
                inviteEmployeesDescription: 'Importer les enregistrements d’employés QuickBooks Online et inviter les employés dans cet espace de travail.',
                createEntities: 'Créer automatiquement les entités',
                createEntitiesDescription:
                    'Expensify créera automatiquement des fournisseurs dans QuickBooks Online s’ils n’existent pas déjà et créera automatiquement des clients lors de l’exportation des factures.',
                reimbursedReportsDescription:
                    "Chaque fois qu'une note de frais est payée via ACH Expensify, le règlement de facture correspondant est créé dans le compte QuickBooks Online ci-dessous.",
                qboBillPaymentAccount: 'Compte de paiement de facture QuickBooks',
                qboInvoiceCollectionAccount: 'Compte de recouvrement des factures QuickBooks',
                accountSelectDescription: 'Choisissez d’où payer les factures et nous créerons le paiement dans QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Choisissez où recevoir les paiements de facture et nous créerons le paiement dans QuickBooks Online.',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Carte de débit',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Carte de crédit',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Facture fournisseur',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Écriture comptable',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Vérifier',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'Nous ferons automatiquement correspondre le nom du commerçant sur la transaction par carte de débit avec tout fournisseur correspondant dans QuickBooks. Si aucun fournisseur n’existe, nous créerons un fournisseur « Divers carte de débit » pour l’association.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'Nous ferons automatiquement correspondre le nom du commerçant sur la transaction par carte de crédit aux fournisseurs correspondants dans QuickBooks. S’il n’existe aucun fournisseur, nous créerons un fournisseur « Dépenses diverses carte de crédit » pour l’associer.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    'Nous créerons une facture fournisseur détaillée pour chaque note de frais Expensify avec la date de la dernière dépense, et nous l’ajouterons au compte ci-dessous. Si cette période est close, nous l’enregistrerons au 1er jour de la prochaine période ouverte.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'Choisissez où exporter les transactions de carte de débit.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'Choisissez où exporter les transactions par carte de crédit.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'Choisissez un fournisseur à appliquer à toutes les transactions par carte de crédit.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Les factures fournisseur ne sont pas disponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d’export.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Les chèques ne sont pas disponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d’export.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Les écritures comptables ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d’exportation.',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Choisissez un compte valide pour l’exportation des factures fournisseur',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Choisissez un compte valide pour l’exportation de l’écriture de journal',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Choisissez un compte valide pour l’exportation des chèques',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]:
                    'Pour utiliser l’exportation des factures fournisseur, configurez un compte de comptes fournisseurs dans QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'Pour utiliser l’exportation des écritures de journal, configurez un compte de journal dans QuickBooks Online',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Pour utiliser l’exportation de chèques, configurez un compte bancaire dans QuickBooks Online',
            },
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: 'Ajoutez le compte dans QuickBooks Online et synchronisez à nouveau la connexion.',
            accountingMethods: {
                label: 'Quand exporter',
                description: 'Choisissez quand exporter les dépenses :',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Comptabilité d’engagement',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Espèces',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Les dépenses payées de votre poche seront exportées une fois l’approbation finale effectuée',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Les dépenses hors trésorerie seront exportées une fois payées',
                },
            },
        },
        workspaceList: {
            joinNow: 'Rejoindre maintenant',
            askToJoin: 'Demander à rejoindre',
        },
        xero: {
            organization: 'Organisation Xero',
            organizationDescription: 'Choisissez l’organisation Xero depuis laquelle vous souhaitez importer des données.',
            importDescription: 'Choisissez quelles configurations de codification importer de Xero vers Expensify.',
            accountsDescription: 'Votre plan comptable Xero sera importé dans Expensify en tant que catégories.',
            accountsSwitchTitle: 'Choisissez d’importer les nouveaux comptes en tant que catégories activées ou désactivées.',
            accountsSwitchDescription: 'Les catégories activées seront disponibles pour que les membres puissent les sélectionner lors de la création de leurs dépenses.',
            trackingCategories: 'Catégories de suivi',
            trackingCategoriesDescription: 'Choisissez comment gérer les catégories de suivi Xero dans Expensify.',
            mapTrackingCategoryTo: (categoryName: string) => `Mapper ${categoryName} de Xero vers`,
            mapTrackingCategoryToDescription: (categoryName: string) => `Choisissez où faire correspondre ${categoryName} lors de l’exportation vers Xero.`,
            customers: 'Refacturer les clients',
            customersDescription:
                'Choisissez si vous souhaitez refacturer les clients dans Expensify. Vos contacts clients Xero peuvent être ajoutés comme tags aux dépenses et seront exportés vers Xero en tant que facture de vente.',
            taxesDescription: 'Choisissez comment gérer les taxes Xero dans Expensify.',
            notImported: 'Non importé',
            notConfigured: 'Non configuré',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Contact Xero par défaut',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Tags',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Champs de note de frais',
            },
            exportDescription: 'Configurez la façon dont les données Expensify sont exportées vers Xero.',
            purchaseBill: 'Facture d’achat',
            exportDeepDiveCompanyCard:
                'Les dépenses exportées seront comptabilisées comme des transactions bancaires sur le compte bancaire Xero ci-dessous, et les dates des transactions correspondront aux dates de votre relevé bancaire.',
            bankTransactions: 'Transactions bancaires',
            xeroBankAccount: 'Compte bancaire Xero',
            xeroBankAccountDescription: 'Choisissez où les dépenses seront publiées comme transactions bancaires.',
            exportExpensesDescription: "Les notes de frais seront exportées comme une facture d'achat avec la date et le statut sélectionnés ci-dessous.",
            purchaseBillDate: "Date de facture d'achat",
            exportInvoices: 'Exporter les factures en',
            salesInvoice: 'Facture de vente',
            exportInvoicesDescription: 'Les factures de vente affichent toujours la date à laquelle la facture a été envoyée.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec Xero chaque jour.',
                purchaseBillStatusTitle: 'Statut de la facture d’achat',
                reimbursedReportsDescription: 'Chaque fois qu’une note de frais est payée via Expensify ACH, le règlement de facture correspondant est créé dans le compte Xero ci-dessous.',
                xeroBillPaymentAccount: 'Compte de paiement des factures Xero',
                xeroInvoiceCollectionAccount: 'Compte d’encaissement des factures Xero',
                xeroBillPaymentAccountDescription: 'Choisissez d’où payer les factures et nous créerons le paiement dans Xero.',
                invoiceAccountSelectorDescription: 'Choisissez où recevoir les paiements de facture et nous créerons le paiement dans Xero.',
            },
            exportDate: {
                label: "Date de facture d'achat",
                description: 'Utiliser cette date lors de l’export des notes de frais vers Xero.',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente sur la note de frais.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'Date d’exportation',
                        description: 'Date d’exportation de la note de frais vers Xero.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date à laquelle la note de frais a été soumise pour approbation.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Statut de la facture d’achat',
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
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Comptabilité d’engagement',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Espèces',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Les dépenses payées de votre poche seront exportées une fois l’approbation finale effectuée',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Les dépenses hors trésorerie seront exportées une fois payées',
                },
            },
        },
        sageIntacct: {
            preferredExporter: 'Exportateur préféré',
            taxSolution: 'Solution fiscale',
            notConfigured: 'Non configuré',
            exportDate: {
                label: 'Date d’exportation',
                description: 'Utiliser cette date lors de l’export des notes de frais vers Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente sur la note de frais.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'Date d’exportation',
                        description: 'Date à laquelle la note de frais a été exportée vers Sage Intacct.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date à laquelle la note de frais a été soumise pour approbation.',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Définissez comment les dépenses hors poche sont exportées vers Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Notes de frais',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Factures fournisseur',
                },
            },
            nonReimbursableExpenses: {
                description: 'Définissez comment les achats par carte société sont exportés vers Sage Intacct.',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Cartes de crédit',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Factures fournisseur',
                },
            },
            creditCardAccount: 'Compte de carte de crédit',
            defaultVendor: 'Fournisseur par défaut',
            defaultVendorDescription: (isReimbursable: boolean) =>
                `Définissez un fournisseur par défaut qui s’appliquera aux dépenses remboursables ${isReimbursable ? '' : 'non-'}qui n’ont pas de fournisseur correspondant dans Sage Intacct.`,
            exportDescription: 'Configurez la façon dont les données Expensify sont exportées vers Sage Intacct.',
            exportPreferredExporterNote:
                'L’exportateur préféré peut être n’importe quel administrateur d’espace de travail, mais doit aussi être un administrateur de domaine si vous définissez des comptes d’exportation différents pour chaque carte d’entreprise dans les paramètres de domaine.',
            exportPreferredExporterSubNote: 'Une fois défini, l’exportateur préféré verra les notes de frais à exporter dans son compte.',
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: `Veuillez ajouter le compte dans Sage Intacct et synchroniser de nouveau la connexion`,
            autoSync: 'Synchronisation automatique',
            autoSyncDescription: 'Expensify se synchronisera automatiquement avec Sage Intacct chaque jour.',
            inviteEmployees: 'Inviter des employés',
            inviteEmployeesDescription:
                'Importer les fiches d’employés Sage Intacct et inviter les employés dans cet espace de travail. Votre workflow d’approbation sera par défaut une approbation par le responsable et pourra être configuré davantage sur la page Membres.',
            syncReimbursedReports: 'Synchroniser les notes de frais remboursées',
            syncReimbursedReportsDescription:
                "Chaque fois qu'une note de frais est payée via Expensify ACH, le règlement de facture correspondant sera créé dans le compte Sage Intacct ci-dessous.",
            paymentAccount: 'Compte de paiement Sage Intacct',
            accountingMethods: {
                label: 'Quand exporter',
                description: 'Choisissez quand exporter les dépenses :',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Comptabilité d’engagement',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Espèces',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Les dépenses payées de votre poche seront exportées une fois l’approbation finale effectuée',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Les dépenses hors trésorerie seront exportées une fois payées',
                },
            },
        },
        netsuite: {
            subsidiary: 'Filiale',
            subsidiarySelectDescription: 'Choisissez la filiale dans NetSuite depuis laquelle vous souhaitez importer des données.',
            exportDescription: 'Configurez l’export des données Expensify vers NetSuite.',
            exportInvoices: 'Exporter les factures vers',
            journalEntriesTaxPostingAccount: 'Compte de comptabilisation de la taxe des écritures de journal',
            journalEntriesProvTaxPostingAccount: 'Compte de comptabilisation de la taxe provinciale des écritures de journal',
            foreignCurrencyAmount: 'Exporter le montant en devise étrangère',
            exportToNextOpenPeriod: 'Exporter vers la prochaine période ouverte',
            nonReimbursableJournalPostingAccount: 'Compte de journal non remboursable',
            reimbursableJournalPostingAccount: 'Compte d’écriture de journal remboursable',
            journalPostingPreference: {
                label: 'Préférence de comptabilisation des écritures de journal',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Entrée unique, détaillée par poste pour chaque note de frais',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Saisie unique pour chaque dépense',
                },
            },
            invoiceItem: {
                label: 'Élément de facture',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Créez-en une pour moi',
                        description: 'Nous créerons un « poste de facture Expensify » pour vous lors de l’export (s’il n’en existe pas déjà un).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Sélectionner existant',
                        description: 'Nous associerons les factures d’Expensify à l’élément sélectionné ci-dessous.',
                    },
                },
            },
            exportDate: {
                label: 'Date d’exportation',
                description: 'Utiliser cette date lors de l’exportation des notes de frais vers NetSuite.',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente sur la note de frais.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'Date d’exportation',
                        description: 'Date à laquelle la note de frais a été exportée vers NetSuite.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'Date de soumission',
                        description: 'Date à laquelle la note de frais a été soumise pour approbation.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Notes de frais',
                        reimbursableDescription: 'Les dépenses payées de votre poche seront exportées sous forme de notes de frais vers NetSuite.',
                        nonReimbursableDescription: 'Les dépenses par carte d’entreprise seront exportées vers NetSuite sous forme de notes de frais.',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Factures fournisseur',
                        reimbursableDescription: dedent(`
                            Les dépenses payées de votre poche seront exportées en tant que factures à payer au fournisseur NetSuite indiqué ci-dessous.

                            Si vous souhaitez définir un fournisseur spécifique pour chaque carte, allez dans *Paramètres > Domaines > Cartes de société*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Les dépenses réglées par carte d’entreprise seront exportées en tant que factures payables au fournisseur NetSuite spécifié ci-dessous.

                            Si vous souhaitez définir un fournisseur spécifique pour chaque carte, accédez à *Paramètres > Domaines > Cartes d’entreprise*.
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'Écritures comptables',
                        reimbursableDescription: dedent(`
                            Les dépenses payées de votre poche seront exportées en écritures de journal vers le compte NetSuite spécifié ci-dessous.

                            Si vous souhaitez définir un fournisseur spécifique pour chaque carte, allez dans *Paramètres > Domaines > Cartes de société*.
                        `),
                        nonReimbursableDescription: dedent(`
                            Les dépenses par carte professionnelle seront exportées sous forme d’écritures comptables vers le compte NetSuite indiqué ci-dessous.

                            Si vous souhaitez définir un fournisseur spécifique pour chaque carte, accédez à *Paramètres > Domaines > Cartes professionnelles*.
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    'Si vous modifiez le paramètre d’exportation de cartes d’entreprise vers les notes de frais, les fournisseurs NetSuite et les comptes de comptabilisation pour les cartes individuelles seront désactivés.\n\nNe vous inquiétez pas, nous conserverons quand même vos sélections précédentes au cas où vous souhaiteriez revenir en arrière plus tard.',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec NetSuite chaque jour.',
                reimbursedReportsDescription:
                    'Chaque fois qu’une note de frais est payée via Expensify ACH, le règlement de facture correspondant sera créé dans le compte NetSuite ci-dessous.',
                reimbursementsAccount: 'Compte de remboursements',
                reimbursementsAccountDescription: 'Choisissez le compte bancaire que vous utiliserez pour les remboursements, et nous créerons le paiement associé dans NetSuite.',
                collectionsAccount: 'Compte de recouvrement',
                collectionsAccountDescription: 'Une fois qu’une facture est marquée comme payée dans Expensify et exportée vers NetSuite, elle apparaîtra dans le compte ci-dessous.',
                approvalAccount: 'Compte d’approbation des comptes fournisseurs',
                approvalAccountDescription:
                    'Choisissez le compte sur lequel les transactions seront approuvées dans NetSuite. Si vous synchronisez des notes de frais remboursées, c’est également le compte sur lequel les paiements de factures seront créés.',
                defaultApprovalAccount: 'Par défaut NetSuite',
                inviteEmployees: 'Inviter des employés et définir les approbations',
                inviteEmployeesDescription:
                    'Importer les enregistrements d’employés NetSuite et inviter les employés dans cet espace de travail. Votre workflow d’approbation sera par défaut une approbation par le manager et pourra être davantage configuré sur la page *Membres*.',
                autoCreateEntities: 'Créer automatiquement les employés/fournisseurs',
                enableCategories: 'Activer les nouvelles catégories importées',
                customFormID: 'ID de formulaire personnalisé',
                customFormIDDescription:
                    'Par défaut, Expensify créera des écritures en utilisant le formulaire de transaction préféré défini dans NetSuite. Vous pouvez également désigner un formulaire de transaction spécifique à utiliser.',
                customFormIDReimbursable: 'Dépense réglée de votre poche',
                customFormIDNonReimbursable: "Dépense par carte d'entreprise",
                exportReportsTo: {
                    label: 'Niveau d’approbation de note de frais',
                    description:
                        'Une fois qu’une note de frais est approuvée dans Expensify et exportée vers NetSuite, vous pouvez définir un niveau d’approbation supplémentaire dans NetSuite avant la comptabilisation.',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'Préférence par défaut NetSuite',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Approuvé uniquement par le superviseur',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Uniquement la comptabilité approuvée',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Approbation du superviseur et de la comptabilité',
                    },
                },
                accountingMethods: {
                    label: 'Quand exporter',
                    description: 'Choisissez quand exporter les dépenses :',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Comptabilité d’engagement',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Espèces',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Les dépenses payées de votre poche seront exportées une fois l’approbation finale effectuée',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Les dépenses hors trésorerie seront exportées une fois payées',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Niveau d’approbation des factures fournisseur',
                    description:
                        'Une fois qu’une facture fournisseur est approuvée dans Expensify et exportée vers NetSuite, vous pouvez définir un niveau d’approbation supplémentaire dans NetSuite avant la comptabilisation.',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'Préférence par défaut NetSuite',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'En attente d’approbation',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'Approuvé pour comptabilisation',
                    },
                },
                exportJournalsTo: {
                    label: 'Niveau d’approbation d’écriture de journal',
                    description:
                        "Une fois qu'une écriture de journal est approuvée dans Expensify et exportée vers NetSuite, vous pouvez définir un niveau supplémentaire d'approbation dans NetSuite avant la comptabilisation.",
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'Préférence par défaut NetSuite',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'En attente d’approbation',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'Approuvé pour comptabilisation',
                    },
                },
                error: {
                    customFormID: 'Veuillez saisir un ID de formulaire personnalisé numérique valide',
                },
            },
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: 'Veuillez ajouter le compte dans NetSuite et synchroniser à nouveau la connexion',
            noVendorsFound: 'Aucun fournisseur trouvé',
            noVendorsFoundDescription: 'Veuillez ajouter des fournisseurs dans NetSuite et synchroniser à nouveau la connexion',
            noItemsFound: 'Aucun article de facture trouvé',
            noItemsFoundDescription: 'Veuillez ajouter des articles de facture dans NetSuite et synchroniser à nouveau la connexion',
            noSubsidiariesFound: 'Aucune filiale trouvée',
            noSubsidiariesFoundDescription: 'Veuillez ajouter une filiale dans NetSuite et synchroniser à nouveau la connexion',
            tokenInput: {
                title: 'Configuration NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Installer le bundle Expensify',
                        description: 'Dans NetSuite, accédez à *Customization > SuiteBundler > Search & Install Bundles* > recherchez « Expensify » > installez le bundle.',
                    },
                    enableTokenAuthentication: {
                        title: 'Activer l’authentification basée sur des jetons',
                        description: 'Dans NetSuite, allez dans *Setup > Company > Enable Features > SuiteCloud* et activez *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Activer les services web SOAP',
                        description: 'Dans NetSuite, allez dans *Setup > Company > Enable Features > SuiteCloud* > activez *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Créer un jeton d’accès',
                        description:
                            'Dans NetSuite, allez dans *Setup > Users/Roles > Access Tokens* > créez un jeton d’accès pour l’application « Expensify » et pour le rôle « Expensify Integration » ou « Administrator ».\n\n*Important :* assurez-vous d’enregistrer le *Token ID* et le *Token Secret* à cette étape. Vous en aurez besoin pour l’étape suivante.',
                    },
                    enterCredentials: {
                        title: 'Saisissez vos identifiants NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'ID de compte NetSuite',
                            netSuiteTokenID: 'ID de jeton',
                            netSuiteTokenSecret: 'Secret du jeton',
                        },
                        netSuiteAccountIDDescription: 'Dans NetSuite, accédez à *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Catégories de dépenses',
                expenseCategoriesDescription: 'Vos catégories de dépenses NetSuite seront importées dans Expensify en tant que catégories.',
                crossSubsidiaryCustomers: 'Clients/projets inter-filiales',
                importFields: {
                    departments: {
                        title: 'Services',
                        subtitle: 'Choisissez comment gérer les *départements* NetSuite dans Expensify.',
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
                    label: (importFields: string[], importType: string) => `${importFields.join('et')}, ${importType}`,
                },
                importTaxDescription: 'Importer des groupes de taxes depuis NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Choisissez une option ci-dessous :',
                    label: (importedTypes: string[]) => `Importé en tant que ${importedTypes.join('et')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `Veuillez saisir le/la ${fieldName}`,
                    customSegments: {
                        title: 'Segments/enregistrements personnalisés',
                        addText: 'Ajouter un segment/enregistrement personnalisé',
                        recordTitle: 'Segment/enregistrement personnalisé',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Voir les instructions détaillées',
                        helpText: 'sur la configuration de segments/enregistrements personnalisés.',
                        emptyTitle: 'Ajouter un segment personnalisé ou un enregistrement personnalisé',
                        fields: {
                            segmentName: 'Nom',
                            internalID: 'ID interne',
                            scriptID: 'ID de script',
                            customRecordScriptID: 'ID de colonne de transaction',
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
                            segmentRecordType: 'Souhaitez-vous ajouter un segment personnalisé ou un enregistrement personnalisé ?',
                            customSegmentNameTitle: 'Quel est le nom du segment personnalisé ?',
                            customRecordNameTitle: 'Quel est le nom de l’enregistrement personnalisé ?',
                            customSegmentNameFooter: `Vous trouverez les noms de segments personnalisés dans NetSuite, à la page *Customizations > Links, Records & Fields > Custom Segments*.

_Pour des instructions plus détaillées, [visitez notre site d'aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `Vous pouvez trouver les noms d’enregistrements personnalisés dans NetSuite en saisissant « Transaction Column Field » dans la recherche globale.

_Pour des instructions plus détaillées, [consultez notre site d’aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: 'Quel est l’ID interne ?',
                            customSegmentInternalIDFooter: `Tout d’abord, assurez-vous d’avoir activé les ID internes dans NetSuite via *Home > Set Preferences > Show Internal ID.*

Vous pouvez trouver les ID internes des segments personnalisés dans NetSuite à l’emplacement suivant :

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Cliquez sur un segment personnalisé.
3. Cliquez sur le lien hypertexte à côté de *Custom Record Type*.
4. Recherchez l’ID interne dans le tableau en bas de la page.

_Pour des instructions plus détaillées, [visitez notre centre d’aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `Vous pouvez trouver les ID internes des enregistrements personnalisés dans NetSuite en suivant ces étapes :

1. Saisissez « Transaction Line Fields » dans la recherche globale.
2. Cliquez sur un enregistrement personnalisé.
3. Trouvez l’ID interne sur le côté gauche.

_Pour des instructions plus détaillées, [visitez notre site d’aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})._`,
                            customSegmentScriptIDTitle: 'Quel est l’ID du script ?',
                            customSegmentScriptIDFooter: `Vous pouvez trouver les ID de script de segments personnalisés dans NetSuite sous : 

1. *Customization > Lists, Records, & Fields > Custom Segments*.
2. Cliquez sur un segment personnalisé.
3. Cliquez sur l’onglet *Application and Sourcing* près du bas, puis :
    a. Si vous souhaitez afficher le segment personnalisé comme un *tag* (au niveau de la ligne) dans Expensify, cliquez sur le sous-onglet *Transaction Columns* et utilisez le *Field ID*.
    b. Si vous souhaitez afficher le segment personnalisé comme un *champ de note de frais* (au niveau de la note de frais) dans Expensify, cliquez sur le sous-onglet *Transactions* et utilisez le *Field ID*.

_Pour des instructions plus détaillées, [visitez notre site d’aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: 'Quel est l’ID de la colonne de transaction ?',
                            customRecordScriptIDFooter: `Vous pouvez trouver les ID de script d’enregistrement personnalisé dans NetSuite sous :

1. Saisissez « Transaction Line Fields » dans la recherche globale.
2. Cliquez sur un enregistrement personnalisé.
3. Trouvez l’ID de script sur le côté gauche.

_Pour des instructions plus détaillées, [visitez notre site d’aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})._`,
                            customSegmentMappingTitle: 'Comment ce segment personnalisé doit-il être affiché dans Expensify ?',
                            customRecordMappingTitle: 'Comment cet enregistrement personnalisé doit-il être affiché dans Expensify ?',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Un segment/enregistrement personnalisé avec ce ${fieldName?.toLowerCase()} existe déjà`,
                        },
                    },
                    customLists: {
                        title: 'Listes personnalisées',
                        addText: 'Ajouter une liste personnalisée',
                        recordTitle: 'Liste personnalisée',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Voir les instructions détaillées',
                        helpText: 'sur la configuration des listes personnalisées.',
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
                            transactionFieldIDTitle: 'Quel est l’ID du champ de transaction ?',
                            transactionFieldIDFooter: `Vous pouvez trouver les IDs de champs de transaction dans NetSuite en suivant ces étapes :

1. Saisissez « Transaction Line Fields » dans la recherche globale.
2. Cliquez sur une liste personnalisée.
3. Recherchez l’ID du champ de transaction sur le côté gauche.

_Pour des instructions plus détaillées, [visitez notre site d’aide](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})._`,
                            mappingTitle: 'Comment cette liste personnalisée doit-elle être affichée dans Expensify ?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `Une liste personnalisée avec cet identifiant de champ de transaction existe déjà`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'Employé NetSuite par défaut',
                        description: 'Non importé dans Expensify, appliqué à l’exportation',
                        footerContent: (importField: string) =>
                            `Si vous utilisez ${importField} dans NetSuite, nous appliquerons la valeur par défaut définie sur la fiche employé lors de l’exportation vers la note de frais ou l’écriture de journal.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Tags',
                        description: 'Niveau poste de dépense',
                        footerContent: (importField: string) => `${startCase(importField)} sera sélectionnable pour chaque dépense individuelle sur la note de frais de l’employé.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Champs de note de frais',
                        description: 'Niveau de la note de frais',
                        footerContent: (importField: string) => `La sélection ${startCase(importField)} s’appliquera à toutes les dépenses sur la note de frais d’un employé.`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Configuration Sage Intacct',
            prerequisitesTitle: 'Avant de vous connecter...',
            downloadExpensifyPackage: 'Télécharger le package Expensify pour Sage Intacct',
            followSteps: 'Suivez les étapes de notre guide « Comment faire : se connecter à Sage Intacct »',
            enterCredentials: 'Saisissez vos identifiants Sage Intacct',
            entity: 'Entité',
            employeeDefault: 'Paramètre par défaut d’employé Sage Intacct',
            employeeDefaultDescription: 'Le service par défaut de l’employé sera appliqué à ses dépenses dans Sage Intacct s’il en existe un.',
            displayedAsTagDescription: 'Le service sera sélectionnable pour chaque dépense individuelle sur la note de frais d’un employé.',
            displayedAsReportFieldDescription: "La sélection de département sera appliquée à toutes les dépenses sur la note de frais d'un employé.",
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Choisissez comment gérer Sage Intacct <strong>${mappingTitle}</strong> dans Expensify.`,
            expenseTypes: 'Types de dépenses',
            expenseTypesDescription: 'Vos types de dépenses Sage Intacct seront importés dans Expensify en tant que catégories.',
            accountTypesDescription: 'Votre plan comptable Sage Intacct sera importé dans Expensify en tant que catégories.',
            importTaxDescription: "Importer le taux de taxe à l'achat depuis Sage Intacct.",
            userDefinedDimensions: 'Dimensions définies par l’utilisateur',
            addUserDefinedDimension: 'Ajouter une dimension définie par l’utilisateur',
            integrationName: 'Nom de l’intégration',
            dimensionExists: 'Une dimension portant ce nom existe déjà.',
            removeDimension: 'Supprimer la dimension définie par l’utilisateur',
            removeDimensionPrompt: 'Voulez-vous vraiment supprimer cette dimension définie par l’utilisateur ?',
            userDefinedDimension: 'Dimension définie par l’utilisateur',
            addAUserDefinedDimension: 'Ajouter une dimension définie par l’utilisateur',
            detailedInstructionsLink: 'Voir les instructions détaillées',
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
                        return 'classes';
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
            collect: 'Collecter',
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
                yourCardProvider: `Qui est l’émetteur de votre carte ?`,
                whoIsYourBankAccount: 'Quelle est votre banque ?',
                whereIsYourBankLocated: 'Où se trouve votre banque ?',
                howDoYouWantToConnect: 'Comment souhaitez-vous vous connecter à votre banque ?',
                learnMoreAboutOptions: `<muted-text>En savoir plus sur ces <a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">options</a>.</muted-text>`,
                commercialFeedDetails:
                    'Nécessite une configuration avec votre banque. Cette option est généralement utilisée par les grandes entreprises et est souvent la meilleure solution si vous y êtes éligible.',
                commercialFeedPlaidDetails: `Nécessite une configuration avec votre banque, mais nous vous guiderons. Cette option est généralement réservée aux grandes entreprises.`,
                directFeedDetails: 'L’approche la plus simple. Connectez-vous immédiatement avec vos identifiants principaux. Cette méthode est la plus courante.',
                enableFeed: {
                    title: (provider: string) => `Activer votre flux ${provider}`,
                    heading:
                        'Nous disposons d’une intégration directe avec l’émetteur de votre carte et pouvons importer rapidement et avec précision les données de vos transactions dans Expensify.\n\nPour commencer, il vous suffit de :',
                    visa: 'Nous avons des intégrations globales avec Visa, bien que l’éligibilité varie selon la banque et le programme de carte.\n\nPour commencer, il vous suffit de :',
                    mastercard:
                        'Nous proposons des intégrations globales avec Mastercard, mais l’éligibilité varie selon la banque et le programme de carte.\n\nPour commencer, il vous suffit de :',
                    vcf: `1. Consultez [cet article d’aide](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) pour obtenir des instructions détaillées sur la configuration de vos cartes Visa Commercial.

2. [Contactez votre banque](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP}) pour vérifier qu’elle prend en charge un flux commercial pour votre programme et demandez-lui de l’activer.

3. *Une fois le flux activé et que vous en avez les informations, passez à l’écran suivant.*`,
                    gl1025: `1. Consultez [cet article d’aide](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP}) pour savoir si American Express peut activer un flux commercial pour votre programme.

2. Une fois le flux activé, Amex vous enverra une lettre de mise en production.

3. *Une fois que vous disposez des informations du flux, continuez vers l’écran suivant.*`,
                    cdf: `1. Consultez [cet article d'aide](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) pour des instructions détaillées sur la configuration de vos cartes Mastercard Commercial Cards.

 2. [Contactez votre banque](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS}) pour vérifier qu'elle prend en charge un flux commercial pour votre programme et demandez-lui de l'activer.

3. *Une fois que le flux est activé et que vous disposez de ses informations, passez à l'écran suivant.*`,
                    stripe: `1. Rendez-vous sur le tableau de bord de Stripe et accédez à [Paramètres](${CONST.COMPANY_CARDS_STRIPE_HELP}).

2. Sous Intégrations de produits, cliquez sur Activer à côté d’Expensify.

3. Une fois le flux activé, cliquez sur Soumettre ci-dessous et nous nous chargerons de l’ajouter.`,
                },
                whatBankIssuesCard: 'Quelle banque émet ces cartes ?',
                enterNameOfBank: 'Saisissez le nom de la banque',
                feedDetails: {
                    vcf: {
                        title: 'Quelles sont les informations du flux Visa ?',
                        processorLabel: 'ID de processeur',
                        bankLabel: 'ID de l’institution financière (banque)',
                        companyLabel: 'ID de l’entreprise',
                        helpLabel: 'Où puis-je trouver ces identifiants ?',
                    },
                    gl1025: {
                        title: `Quel est le nom du fichier de livraison Amex ?`,
                        fileNameLabel: 'Nom du fichier de livraison',
                        helpLabel: 'Où puis-je trouver le nom de fichier de livraison ?',
                    },
                    cdf: {
                        title: `Quel est l’ID de distribution Mastercard ?`,
                        distributionLabel: 'ID de distribution',
                        helpLabel: 'Où puis-je trouver l’ID de distribution ?',
                    },
                },
                amexCorporate: 'Sélectionnez ceci si le recto de vos cartes indique « Corporate »',
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
                    prompt: 'Nous avons remarqué que vous n’avez pas fini d’ajouter vos cartes. Si vous avez rencontré un problème, dites-le-nous afin que nous puissions vous aider à remettre les choses sur les rails.',
                    confirmText: 'Signaler un problème',
                    cancelText: 'Ignorer',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: 'Dernier jour du mois',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: 'Dernier jour ouvrable du mois',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'Jour du mois personnalisé',
            },
            assign: 'Assigner',
            assignCard: 'Assigner une carte',
            findCard: 'Trouver la carte',
            cardNumber: 'Numéro de carte',
            commercialFeed: 'Flux commercial',
            feedName: (feedName: string) => `Cartes ${feedName}`,
            directFeed: 'Flux direct',
            whoNeedsCardAssigned: 'Qui a besoin d’une carte assignée ?',
            chooseTheCardholder: 'Choisir le titulaire de la carte',
            chooseCard: 'Choisissez une carte',
            chooseCardFor: (assignee: string) =>
                `Choisissez une carte pour <strong>${assignee}</strong>. Vous ne trouvez pas la carte que vous recherchez ? <concierge-link>Dites-le-nous.</concierge-link>`,
            noActiveCards: 'Aucune carte active sur ce flux',
            somethingMightBeBroken:
                '<muted-text><centered-text>Ou quelque chose est peut-être cassé. Dans tous les cas, si vous avez des questions, <concierge-link>contactez simplement Concierge</concierge-link>.</centered-text></muted-text>',
            chooseTransactionStartDate: 'Choisissez une date de début de transaction',
            startDateDescription: 'Choisissez votre date de début d’importation. Nous synchroniserons toutes les transactions à partir de cette date.',
            fromTheBeginning: 'Depuis le début',
            customStartDate: 'Date de début personnalisée',
            customCloseDate: 'Date de clôture personnalisée',
            letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
            confirmationDescription: 'Nous commencerons immédiatement à importer les transactions.',
            card: 'Carte',
            cardName: 'Nom de la carte',
            brokenConnectionError:
                '<rbr>La connexion au flux de carte est interrompue. Veuillez vous <a href="#">connecter à votre banque</a> afin que nous puissions rétablir la connexion.</rbr>',
            assignedCard: (assignee: string, link: string) => `a assigné ${assignee} à ${link} ! Les transactions importées apparaîtront dans cette discussion.`,
            companyCard: 'carte d’entreprise',
            chooseCardFeed: 'Choisir le flux de carte',
            ukRegulation:
                'Expensify Limited est un agent de Plaid Financial Ltd., un établissement de paiement agréé réglementé par la Financial Conduct Authority en vertu des Payment Services Regulations 2017 (numéro de référence de l’entreprise : 804718). Plaid vous fournit des services réglementés d’information sur les comptes par l’intermédiaire de Expensify Limited en tant que son agent.',
            assign: 'Assigner',
            assignCardFailedError: 'L’attribution de la carte a échoué.',
            cardAlreadyAssignedError: 'This card is already assigned to a user in another workspace.',
            unassignCardFailedError: 'Échec de la désaffectation de la carte.',
        },
        expensifyCard: {
            issueAndManageCards: 'Émettre et gérer vos cartes Expensify',
            getStartedIssuing: 'Commencez en émettant votre première carte virtuelle ou physique.',
            verificationInProgress: 'Vérification en cours...',
            verifyingTheDetails: 'Nous vérifions quelques détails. Concierge vous informera lorsque les cartes Expensify seront prêtes à être émises.',
            disclaimer:
                'La carte commerciale Expensify Visa® est émise par The Bancorp Bank, N.A., membre FDIC, en vertu d’une licence de Visa U.S.A. Inc. et peut ne pas être acceptée par tous les commerçants qui acceptent les cartes Visa. Apple® et le logo Apple® sont des marques déposées d’Apple Inc., enregistrées aux États-Unis et dans d’autres pays. App Store est une marque de service d’Apple Inc. Google Play et le logo Google Play sont des marques déposées de Google LLC.',
            euUkDisclaimer:
                'Les cartes fournies aux résidents de l’EEE sont émises par Transact Payments Malta Limited et les cartes fournies aux résidents du Royaume-Uni sont émises par Transact Payments Limited en vertu d’une licence accordée par Visa Europe Limited. Transact Payments Malta Limited est dûment autorisée et réglementée par la Malta Financial Services Authority en tant qu’institution financière en vertu du Financial Institution Act 1994. Numéro d’enregistrement C 91879. Transact Payments Limited est autorisée et réglementée par la Gibraltar Financial Service Commission.',
            issueCard: 'Émettre une carte',
            findCard: 'Trouver la carte',
            newCard: 'Nouvelle carte',
            name: 'Nom',
            lastFour: '4 derniers',
            limit: 'Limite',
            currentBalance: 'Solde actuel',
            currentBalanceDescription: 'Le solde actuel correspond à la somme de toutes les transactions Expensify Card comptabilisées depuis la dernière date de règlement.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Le solde sera réglé le ${settlementDate}`,
            settleBalance: 'Régler le solde',
            cardLimit: 'Plafond de carte',
            remainingLimit: 'Plafond restant',
            requestLimitIncrease: 'Demander une augmentation de limite',
            remainingLimitDescription:
                'Nous prenons en compte plusieurs facteurs pour calculer votre plafond restant : votre ancienneté en tant que client, les informations liées à votre entreprise fournies lors de l’inscription, ainsi que la trésorerie disponible sur votre compte bancaire professionnel. Votre plafond restant peut fluctuer quotidiennement.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Le solde de remise en argent est basé sur les dépenses mensuelles réglées par Carte Expensify dans votre espace de travail.',
            issueNewCard: 'Émettre une nouvelle carte',
            finishSetup: 'Terminer la configuration',
            chooseBankAccount: 'Choisir un compte bancaire',
            chooseExistingBank: 'Choisissez un compte bancaire professionnel existant pour régler le solde de votre carte Expensify, ou ajoutez un nouveau compte bancaire',
            accountEndingIn: 'Compte se terminant par',
            addNewBankAccount: 'Ajouter un nouveau compte bancaire',
            settlementAccount: 'Compte de règlement',
            settlementAccountDescription: 'Choisissez un compte pour payer le solde de votre carte Expensify.',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `Assurez-vous que ce compte correspond à votre <a href="${reconciliationAccountSettingsLink}">compte de rapprochement</a> (${accountNumber}) afin que le rapprochement continu fonctionne correctement.`,
            settlementFrequency: 'Fréquence de règlement',
            settlementFrequencyDescription: 'Choisissez la fréquence à laquelle vous réglerez le solde de votre carte Expensify.',
            settlementFrequencyInfo:
                'Si vous souhaitez passer à un règlement mensuel, vous devrez connecter votre compte bancaire via Plaid et disposer d’un historique de solde positif sur 90 jours.',
            frequency: {
                daily: 'Quotidien',
                monthly: 'Mensuel',
            },
            cardDetails: 'Détails de carte',
            cardPending: ({name}: {name: string}) => `La carte est actuellement en attente et sera émise une fois le compte de ${name} validé.`,
            virtual: 'Virtuel',
            physical: 'Physique',
            deactivate: 'Désactiver la carte',
            changeCardLimit: 'Modifier la limite de carte',
            changeLimit: 'Modifier la limite',
            smartLimitWarning: (limit: number | string) =>
                `Si vous modifiez la limite de cette carte à ${limit}, les nouvelles transactions seront refusées jusqu'à ce que vous approuviez davantage de dépenses sur la carte.`,
            monthlyLimitWarning: (limit: number | string) => `Si vous modifiez la limite de cette carte à ${limit}, les nouvelles transactions seront refusées jusqu’au mois prochain.`,
            fixedLimitWarning: (limit: number | string) => `Si vous modifiez la limite de cette carte à ${limit}, les nouvelles transactions seront refusées.`,
            changeCardLimitType: 'Modifier le type de plafond de carte',
            changeLimitType: 'Modifier le type de limite',
            changeCardSmartLimitTypeWarning: (limit: number | string) =>
                `Si vous modifiez le type de plafond de cette carte en Smart Limit, les nouvelles transactions seront refusées, car le plafond non approuvé de ${limit} a déjà été atteint.`,
            changeCardMonthlyLimitTypeWarning: (limit: number | string) =>
                `Si vous changez le type de limite de cette carte en Mensuelle, les nouvelles transactions seront refusées car la limite mensuelle de ${limit} a déjà été atteinte.`,
            addShippingDetails: 'Ajouter les détails de livraison',
            issuedCard: (assignee: string) => `a émis une carte Expensify à ${assignee} ! La carte arrivera dans 2 ou 3 jours ouvrables.`,
            issuedCardNoShippingDetails: (assignee: string) => `a émis une carte Expensify à ${assignee} ! La carte sera envoyée une fois les informations de livraison confirmées.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `a délivré à ${assignee} une carte Expensify virtuelle ! Le ${link} peut être utilisé immédiatement.`,
            addedShippingDetails: (assignee: string) => `${assignee} a ajouté les informations de livraison. La carte Expensify arrivera dans 2 à 3 jours ouvrables.`,
            replacedCard: (assignee: string) => `${assignee} a remplacé sa carte Expensify. La nouvelle carte arrivera dans 2 à 3 jours ouvrés.`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} a remplacé sa carte Expensify virtuelle ! Le ${link} peut être utilisé immédiatement.`,
            card: 'carte',
            replacementCard: 'carte de remplacement',
            verifyingHeader: 'Vérification en cours',
            bankAccountVerifiedHeader: 'Compte bancaire vérifié',
            verifyingBankAccount: 'Vérification du compte bancaire…',
            verifyingBankAccountDescription: 'Veuillez patienter pendant que nous confirmons que ce compte peut être utilisé pour émettre des cartes Expensify.',
            bankAccountVerified: 'Compte bancaire vérifié !',
            bankAccountVerifiedDescription: 'Vous pouvez maintenant émettre des cartes Expensify aux membres de votre espace de travail.',
            oneMoreStep: 'Encore une étape…',
            oneMoreStepDescription: 'Il semble que nous devions vérifier votre compte bancaire manuellement. Rendez-vous dans Concierge, où vos instructions vous attendent.',
            gotIt: 'Compris',
            goToConcierge: 'Aller à Concierge',
        },
        categories: {
            deleteCategories: 'Supprimer des catégories',
            deleteCategoriesPrompt: 'Voulez-vous vraiment supprimer ces catégories ?',
            deleteCategory: 'Supprimer la catégorie',
            deleteCategoryPrompt: 'Voulez-vous vraiment supprimer cette catégorie ?',
            disableCategories: 'Désactiver les catégories',
            disableCategory: 'Désactiver la catégorie',
            enableCategories: 'Activer les catégories',
            enableCategory: 'Activer la catégorie',
            defaultSpendCategories: 'Catégories de dépenses par défaut',
            spendCategoriesDescription: 'Personnalisez la façon dont les dépenses par marchand sont catégorisées pour les transactions par carte de crédit et les reçus scannés.',
            deleteFailureMessage: 'Une erreur s’est produite lors de la suppression de la catégorie, veuillez réessayer.',
            categoryName: 'Nom de la catégorie',
            requiresCategory: 'Les membres doivent catégoriser toutes les dépenses',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `Toutes les dépenses doivent être catégorisées afin de pouvoir être exportées vers ${connectionName}.`,
            subtitle: 'Obtenez une meilleure vue d’ensemble de l’utilisation de votre argent. Utilisez nos catégories par défaut ou ajoutez les vôtres.',
            emptyCategories: {
                title: 'Vous n’avez créé aucune catégorie',
                subtitle: 'Ajoutez une catégorie pour organiser vos dépenses.',
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Vos catégories sont actuellement importées à partir d’une connexion comptable. Rendez-vous dans la section <a href="${accountingPageURL}">Comptabilité</a> pour effectuer des modifications.</centered-text></muted-text>`,
            },
            updateFailureMessage: 'Une erreur s’est produite lors de la mise à jour de la catégorie, veuillez réessayer.',
            createFailureMessage: "Une erreur s'est produite lors de la création de la catégorie, veuillez réessayer",
            addCategory: 'Ajouter une catégorie',
            editCategory: 'Modifier la catégorie',
            editCategories: 'Modifier les catégories',
            findCategory: 'Trouver une catégorie',
            categoryRequiredError: 'Le nom de la catégorie est obligatoire',
            existingCategoryError: 'Une catégorie portant ce nom existe déjà',
            invalidCategoryName: 'Nom de catégorie invalide',
            importedFromAccountingSoftware: 'Les catégories ci-dessous sont importées depuis votre',
            payrollCode: 'Code de paie',
            updatePayrollCodeFailureMessage: "Une erreur s'est produite lors de la mise à jour du code de paie, veuillez réessayer",
            glCode: 'Code de grand livre',
            updateGLCodeFailureMessage: "Une erreur s'est produite lors de la mise à jour du code GL, veuillez réessayer",
            importCategories: 'Importer des catégories',
            cannotDeleteOrDisableAllCategories: {
                title: 'Impossible de supprimer ou de désactiver toutes les catégories',
                description: `Au moins une catégorie doit rester activée, car votre espace de travail nécessite des catégories.`,
            },
        },
        moreFeatures: {
            subtitle:
                'Utilisez les interrupteurs ci-dessous pour activer davantage de fonctionnalités au fur et à mesure de votre croissance. Chaque fonctionnalité apparaîtra dans le menu de navigation pour une personnalisation plus poussée.',
            spendSection: {
                title: 'Dépense',
                subtitle: 'Activer des fonctionnalités qui vous aident à faire grandir votre équipe.',
            },
            manageSection: {
                title: 'Gérer',
                subtitle: 'Ajoutez des contrôles qui aident à maintenir les dépenses dans le budget.',
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
                subtitle: 'Connectez Expensify à des produits financiers populaires.',
            },
            distanceRates: {
                title: 'Taux de distance',
                subtitle: 'Ajoutez, mettez à jour et appliquez les taux.',
            },
            perDiem: {
                title: 'Indemnité journalière',
                subtitle: 'Définissez des taux de per diem pour contrôler les dépenses quotidiennes des employés.',
            },
            travel: {
                title: 'Voyage',
                subtitle: 'Réservez, gérez et rapprochez tous vos déplacements professionnels.',
                getStarted: {
                    title: 'Commencer avec Expensify Travel',
                    subtitle: 'Nous avons juste besoin de quelques informations supplémentaires sur votre entreprise, puis vous serez prêt à décoller.',
                    ctaText: 'Allons-y',
                },
                reviewingRequest: {
                    title: 'Faites vos valises, nous avons bien reçu votre demande...',
                    subtitle: 'Nous examinons actuellement votre demande d’activation de Expensify Travel. Ne vous inquiétez pas, nous vous préviendrons lorsqu’il sera prêt.',
                    ctaText: 'Demande envoyée',
                },
                bookOrManageYourTrip: {
                    title: 'Réserver ou gérer votre voyage',
                    subtitle: 'Utilisez Expensify Travel pour obtenir les meilleures offres de voyage et gérer toutes vos dépenses professionnelles en un seul endroit.',
                    ctaText: 'Réserver ou gérer',
                },
                travelInvoicing: {
                    travelBookingSection: {
                        title: 'Réservation de voyage',
                        subtitle: 'Félicitations ! Vous êtes prêt à réserver et gérer vos voyages dans cet espace de travail.',
                        manageTravelLabel: 'Gérer les voyages',
                    },
                    centralInvoicingSection: {
                        title: 'Facturation centralisée',
                        subtitle: 'Centralisez toutes les dépenses de voyage dans une facture mensuelle au lieu de payer au moment de l’achat.',
                        learnHow: 'En savoir plus.',
                        subsections: {
                            currentTravelSpendLabel: 'Dépenses de voyage actuelles',
                            currentTravelSpendCta: 'Payer le solde',
                            currentTravelLimitLabel: 'Plafond de déplacement actuel',
                            settlementAccountLabel: 'Compte de règlement',
                            settlementFrequencyLabel: 'Fréquence de règlement',
                        },
                    },
                },
            },
            expensifyCard: {
                title: 'Carte Expensify',
                subtitle: 'Gagnez en visibilité et maîtrisez vos dépenses.',
                disableCardTitle: 'Désactiver la carte Expensify',
                disableCardPrompt: 'Vous ne pouvez pas désactiver la carte Expensify car elle est déjà utilisée. Contactez Concierge pour connaître les prochaines étapes.',
                disableCardButton: 'Discuter avec Concierge',
                feed: {
                    title: 'Obtenir la carte Expensify',
                    subTitle: 'Rationalisez les dépenses de votre entreprise et économisez jusqu’à 50 % sur votre facture Expensify, plus :',
                    features: {
                        cashBack: 'Du cash back sur chaque achat aux États-Unis',
                        unlimited: 'Cartes virtuelles illimitées',
                        spend: 'Contrôles de dépenses et limites personnalisées',
                    },
                    ctaTitle: 'Émettre une nouvelle carte',
                },
            },
            companyCards: {
                title: 'Cartes d’entreprise',
                subtitle: 'Connectez les cartes que vous avez déjà.',
                feed: {
                    title: 'Apportez vos propres cartes (BYOC)',
                    subtitle: 'Liez les cartes que vous possédez déjà pour l’importation automatique des transactions, la mise en correspondance des reçus et la réconciliation.',
                    features: {
                        support: 'Connecter des cartes depuis plus de 10 000 banques',
                        assignCards: 'Liez les cartes existantes de votre équipe',
                        automaticImport: 'Nous importerons les transactions automatiquement',
                    },
                },
                bankConnectionError: 'Problème de connexion bancaire',
                connectWithPlaid: 'se connecter via Plaid',
                connectWithExpensifyCard: 'essayez la carte Expensify.',
                bankConnectionDescription: `Veuillez essayer d’ajouter vos cartes à nouveau. Sinon, vous pouvez`,
                disableCardTitle: 'Désactiver les cartes d’entreprise',
                disableCardPrompt:
                    'Vous ne pouvez pas désactiver les cartes d’entreprise, car cette fonctionnalité est en cours d’utilisation. Contactez Concierge pour connaître les prochaines étapes.',
                disableCardButton: 'Discuter avec Concierge',
                cardDetails: 'Détails de carte',
                cardNumber: 'Numéro de carte',
                cardholder: 'Titulaire de carte',
                cardName: 'Nom de la carte',
                allCards: 'Toutes les cartes',
                assignedCards: 'Attribué',
                unassignedCards: 'Non assigné',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `export ${integration} ${type.toLowerCase()}` : `Export ${integration}`),
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `Choisissez le compte ${integration} vers lequel les transactions doivent être exportées.`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `Choisissez le compte ${integration} vers lequel les transactions doivent être exportées. Sélectionnez une autre <a href="${exportPageLink}">option d’export</a> pour modifier les comptes disponibles.`,
                lastUpdated: 'Dernière mise à jour',
                transactionStartDate: 'Date de début de la transaction',
                updateCard: 'Mettre à jour la carte',
                unassignCard: 'Retirer l’assignation de la carte',
                unassign: "Retirer l'assignation",
                unassignCardDescription:
                    'Retirer l’assignation de cette carte supprimera toutes les transactions des notes de frais à l’état de brouillon du compte du titulaire de la carte.',
                assignCard: 'Assigner une carte',
                cardFeedName: 'Nom du flux de carte',
                cardFeedNameDescription: 'Donnez au flux de cartes un nom unique afin de pouvoir le distinguer des autres.',
                cardFeedTransaction: 'Supprimer les transactions',
                cardFeedTransactionDescription: 'Choisissez si les détenteurs de carte peuvent supprimer les transactions de carte. Les nouvelles transactions suivront ces règles.',
                cardFeedRestrictDeletingTransaction: 'Limiter la suppression des transactions',
                cardFeedAllowDeletingTransaction: 'Autoriser la suppression des transactions',
                removeCardFeed: 'Supprimer le flux de carte',
                removeCardFeedTitle: (feedName: string) => `Supprimer le flux ${feedName}`,
                removeCardFeedDescription: "Voulez-vous vraiment supprimer ce flux de cartes ? Cela retirera l'assignation de toutes les cartes.",
                error: {
                    feedNameRequired: 'Le nom du flux de carte est obligatoire',
                    statementCloseDateRequired: 'Veuillez sélectionner une date de clôture de relevé.',
                },
                corporate: 'Limiter la suppression des transactions',
                personal: 'Autoriser la suppression des transactions',
                setFeedNameDescription: 'Donnez au flux de cartes un nom unique pour le distinguer des autres',
                setTransactionLiabilityDescription:
                    'Lorsqu’il est activé, les titulaires de carte peuvent supprimer des transactions de carte. Les nouvelles transactions suivront cette règle.',
                emptyAddedFeedTitle: 'Aucune carte dans ce flux',
                emptyAddedFeedDescription: 'Assurez-vous qu’il y a des cartes dans le flux de cartes de votre banque.',
                pendingFeedTitle: `Nous examinons votre demande...`,
                pendingFeedDescription: `Nous sommes actuellement en train d’examiner les détails de votre flux. Une fois cela terminé, nous vous contacterons via`,
                pendingBankTitle: 'Vérifiez la fenêtre de votre navigateur',
                pendingBankDescription: (bankName: string) => `Veuillez vous connecter à ${bankName} via la fenêtre de navigateur qui vient de s’ouvrir. Si aucune fenêtre ne s’est ouverte,`,
                pendingBankLink: 'veuillez cliquer ici',
                giveItNameInstruction: 'Donnez à la carte un nom qui la distingue des autres.',
                updating: 'Mise à jour...',
                neverUpdated: 'Jamais',
                noAccountsFound: 'Aucun compte trouvé',
                defaultCard: 'Carte par défaut',
                downgradeTitle: `Impossible de rétrograder l’espace de travail`,
                downgradeSubTitle: `Cet espace de travail ne peut pas être rétrogradé, car plusieurs flux de cartes sont connectés (hors cartes Expensify). Veuillez <a href="#">ne conserver qu’un seul flux de cartes</a> pour continuer.`,
                noAccountsFoundDescription: (connection: string) => `Veuillez ajouter le compte dans ${connection} et synchroniser à nouveau la connexion`,
                expensifyCardBannerTitle: 'Obtenir la carte Expensify',
                expensifyCardBannerSubtitle:
                    'Profitez de remises en argent sur chaque achat aux États-Unis, jusqu’à 50 % de réduction sur votre facture Expensify, de cartes virtuelles illimitées et bien plus encore.',
                expensifyCardBannerLearnMoreButton: 'En savoir plus',
                statementCloseDateTitle: 'Date de clôture du relevé',
                statementCloseDateDescription: 'Indiquez-nous la date de clôture du relevé de votre carte et nous créerons un relevé correspondant dans Expensify.',
            },
            workflows: {
                title: 'Flux de travail',
                subtitle: 'Configurez la manière dont les dépenses sont approuvées et payées.',
                disableApprovalPrompt:
                    'Les cartes Expensify de cet espace de travail dépendent actuellement de l’approbation pour définir leurs Smart Limits. Veuillez modifier les types de limites de toutes les cartes Expensify avec Smart Limits avant de désactiver les approbations.',
            },
            invoices: {
                title: 'Factures',
                subtitle: 'Envoyez et recevez des factures.',
            },
            categories: {
                title: 'Catégories',
                subtitle: 'Suivez et organisez vos dépenses.',
            },
            tags: {
                title: 'Tags',
                subtitle: 'Classer les coûts et suivre les dépenses facturables.',
            },
            taxes: {
                title: 'Taxes',
                subtitle: 'Documentez et récupérez les taxes admissibles.',
            },
            reportFields: {
                title: 'Champs de note de frais',
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
                featureEnabledTitle: 'Pas si vite...',
                featureEnabledText: 'Pour activer ou désactiver cette fonctionnalité, vous devez modifier vos paramètres d’import comptable.',
                disconnectText: 'Pour désactiver la comptabilité, vous devez déconnecter votre connexion comptable de votre espace de travail.',
                manageSettings: 'Gérer les paramètres',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Dissocier Uber',
                disconnectText: 'Pour désactiver cette fonctionnalité, veuillez d’abord déconnecter l’intégration Uber for Business.',
                description: 'Voulez-vous vraiment déconnecter cette intégration ?',
                confirmText: 'Compris',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Pas si vite...',
                featureEnabledText:
                    'Les cartes Expensify de cet espace de travail s’appuient sur des workflows d’approbation pour définir leurs Smart Limits.\n\nVeuillez modifier les types de limite de toutes les cartes avec Smart Limits avant de désactiver les workflows.',
                confirmText: 'Aller aux cartes Expensify',
            },
            rules: {
                title: 'Règles',
                subtitle: 'Exigez des reçus, signalez les dépenses élevées et bien plus encore.',
            },
            timeTracking: {title: 'Heure', subtitle: 'Définissez un taux horaire facturable pour que les employés soient rémunérés pour leur temps.'},
        },
        reports: {
            reportsCustomTitleExamples: 'Exemples :',
            customReportNamesSubtitle: `<muted-text>Personnalisez les titres de notes de frais à l’aide de nos <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">nombreuses formules</a>.</muted-text>`,
            customNameTitle: 'Titre par défaut de la note de frais',
            customNameDescription: `Choisissez un nom personnalisé pour les notes de frais à l’aide de nos <a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">formules avancées</a>.`,
            customNameInputLabel: 'Nom',
            customNameEmailPhoneExample: 'E-mail ou téléphone du membre : {report:submit:from}',
            customNameStartDateExample: 'Date de début de la note de frais : {report:startdate}',
            customNameWorkspaceNameExample: 'Nom de l’espace de travail : {report:workspacename}',
            customNameReportIDExample: 'ID de la note de frais : {report:id}',
            customNameTotalExample: 'Total : {report:total}.',
            preventMembersFromChangingCustomNamesTitle: 'Empêcher les membres de modifier les titres personnalisés des notes de frais',
        },
        reportFields: {
            addField: 'Ajouter un champ',
            delete: 'Supprimer le champ',
            deleteFields: 'Supprimer les champs',
            findReportField: 'Trouver le champ de note de frais',
            deleteConfirmation: 'Voulez-vous vraiment supprimer ce champ de note de frais ?',
            deleteFieldsConfirmation: 'Voulez-vous vraiment supprimer ces champs de note de frais ?',
            emptyReportFields: {
                title: 'Vous n’avez créé aucun champ de note de frais',
                subtitle: 'Ajoutez un champ personnalisé (texte, date ou liste déroulante) qui apparaît sur les notes de frais.',
            },
            subtitle: 'Les champs de note de frais s’appliquent à toutes les dépenses et peuvent être utiles lorsque vous souhaitez demander des informations supplémentaires.',
            disableReportFields: 'Désactiver les champs de la note de frais',
            disableReportFieldsConfirmation: 'Voulez-vous continuer ? Les champs de texte et de date seront supprimés, et les listes seront désactivées.',
            importedFromAccountingSoftware: 'Les champs de la note de frais ci-dessous sont importés depuis votre',
            textType: 'Texte',
            dateType: 'Date',
            dropdownType: 'Liste',
            formulaType: 'Formule',
            textAlternateText: 'Ajouter un champ pour la saisie de texte libre.',
            dateAlternateText: 'Ajouter un calendrier pour la sélection de la date.',
            dropdownAlternateText: 'Ajoutez une liste d’options parmi lesquelles choisir.',
            formulaAlternateText: 'Ajouter un champ de formule.',
            nameInputSubtitle: 'Choisissez un nom pour le champ de note de frais.',
            typeInputSubtitle: 'Choisissez le type de champ de note de frais à utiliser.',
            initialValueInputSubtitle: 'Saisissez une valeur initiale à afficher dans le champ de la note de frais.',
            listValuesInputSubtitle: 'Ces valeurs apparaîtront dans le menu déroulant de votre champ de note de frais. Les valeurs activées peuvent être sélectionnées par les membres.',
            listInputSubtitle: 'Ces valeurs apparaîtront dans la liste des champs de votre note de frais. Les valeurs activées peuvent être sélectionnées par les membres.',
            deleteValue: 'Supprimer la valeur',
            deleteValues: 'Supprimer les valeurs',
            disableValue: 'Désactiver la valeur',
            disableValues: 'Désactiver les valeurs',
            enableValue: 'Activer la valeur',
            enableValues: 'Activer les valeurs',
            emptyReportFieldsValues: {
                title: 'Vous n’avez créé aucune valeur de liste',
                subtitle: 'Ajoutez des valeurs personnalisées à afficher sur les notes de frais.',
            },
            deleteValuePrompt: 'Voulez-vous vraiment supprimer cette valeur de liste ?',
            deleteValuesPrompt: 'Voulez-vous vraiment supprimer ces valeurs de liste ?',
            listValueRequiredError: 'Veuillez saisir un nom de valeur de liste',
            existingListValueError: 'Une valeur de liste portant ce nom existe déjà',
            editValue: 'Modifier la valeur',
            listValues: 'Lister les valeurs',
            addValue: 'Ajouter une valeur',
            existingReportFieldNameError: 'Un champ de note de frais portant ce nom existe déjà',
            reportFieldNameRequiredError: 'Veuillez saisir un nom de champ de note de frais',
            reportFieldTypeRequiredError: 'Veuillez choisir un type de champ de note de frais',
            circularReferenceError: 'Ce champ ne peut pas faire référence à lui-même. Veuillez le mettre à jour.',
            reportFieldInitialValueRequiredError: 'Veuillez choisir une valeur initiale pour le champ de note de frais',
            genericFailureMessage: "Une erreur s'est produite lors de la mise à jour du champ de la note de frais. Veuillez réessayer.",
        },
        tags: {
            tagName: 'Nom du tag',
            requiresTag: 'Les membres doivent ajouter un tag à toutes les dépenses',
            trackBillable: 'Suivre les dépenses facturables',
            customTagName: 'Nom de tag personnalisé',
            enableTag: 'Activer le tag',
            enableTags: 'Activer les tags',
            requireTag: 'Tag obligatoire',
            requireTags: 'Rendre les tags obligatoires',
            notRequireTags: 'Ne pas exiger',
            disableTag: 'Désactiver le tag',
            disableTags: 'Désactiver les tags',
            addTag: 'Ajouter un tag',
            editTag: 'Modifier le tag',
            editTags: 'Modifier les tags',
            findTag: 'Trouver un tag',
            subtitle: 'Les tags ajoutent des moyens plus détaillés de classifier les coûts.',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: (importSpreadsheetLink: string) =>
                `<muted-text>Vous utilisez des <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">tags dépendants</a>. Vous pouvez <a href="${importSpreadsheetLink}">réimporter une feuille de calcul</a> pour mettre à jour vos tags.</muted-text>`,
            emptyTags: {
                title: 'Vous n’avez créé aucun tags',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Ajoutez un tag pour suivre les projets, les lieux, les services, et plus encore.',
                subtitleHTML: `<muted-text><centered-text>Ajoutez des tags pour suivre les projets, les lieux, les services et plus encore. <a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">En savoir plus</a> sur le formatage des fichiers de tags pour l’importation.</centered-text></muted-text>`,
                subtitleWithAccounting: (accountingPageURL: string) =>
                    `<muted-text><centered-text>Vos tags sont actuellement importés depuis une connexion comptable. Rendez-vous dans la section <a href="${accountingPageURL}">comptabilité</a> pour effectuer des modifications.</centered-text></muted-text>`,
            },
            deleteTag: 'Supprimer le tag',
            deleteTags: 'Supprimer les tags',
            deleteTagConfirmation: 'Voulez-vous vraiment supprimer ce tag ?',
            deleteTagsConfirmation: 'Voulez-vous vraiment supprimer ces tags ?',
            deleteFailureMessage: 'Une erreur s’est produite lors de la suppression du tag, veuillez réessayer.',
            tagRequiredError: 'Le nom du tag est obligatoire',
            existingTagError: 'Un tag portant ce nom existe déjà',
            invalidTagNameError: 'Le nom du tag ne peut pas être 0. Veuillez choisir une autre valeur.',
            genericFailureMessage: "Une erreur s'est produite lors de la mise à jour du tag, veuillez réessayer.",
            importedFromAccountingSoftware: 'Les tags ci-dessous sont importés depuis votre',
            glCode: 'Code de grand livre',
            updateGLCodeFailureMessage: "Une erreur s'est produite lors de la mise à jour du code GL, veuillez réessayer",
            tagRules: 'Règles de tags',
            approverDescription: 'Approbateur',
            importTags: 'Importer des tags',
            importTagsSupportingText: 'Codez vos dépenses avec un seul type de tag ou plusieurs.',
            configureMultiLevelTags: 'Configurez votre liste de tags pour un étiquetage à plusieurs niveaux.',
            importMultiLevelTagsSupportingText: `Voici un aperçu de vos tags. Si tout semble correct, cliquez ci-dessous pour les importer.`,
            importMultiLevelTags: {
                firstRowTitle: 'La première ligne est le titre de chaque liste de tags',
                independentTags: 'Ce sont des tags indépendants',
                glAdjacentColumn: 'Il y a un code GL dans la colonne adjacente',
            },
            tagLevel: {
                singleLevel: 'Niveau unique de tags',
                multiLevel: 'Tags multiniveaux',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Basculer les niveaux de tags',
                prompt1: 'Changer les niveaux de tags effacera tous les tags actuels.',
                prompt2: 'Nous vous suggérons d’abord',
                prompt3: 'télécharger une sauvegarde',
                prompt4: 'en exportant vos tags.',
                prompt5: 'En savoir plus',
                prompt6: 'au sujet des niveaux de tag.',
            },
            overrideMultiTagWarning: {
                title: 'Importer des tags',
                prompt1: 'Êtes-vous sûr ?',
                prompt2: 'Les tags existants seront remplacés, mais vous pouvez',
                prompt3: 'télécharger une sauvegarde',
                prompt4: 'd’abord.',
            },
            importedTagsMessage: (columnCounts: number) =>
                `Nous avons trouvé *${columnCounts} colonnes* dans votre feuille de calcul. Sélectionnez *Nom* à côté de la colonne qui contient les noms des tags. Vous pouvez également sélectionner *Activé* à côté de la colonne qui définit le statut des tags.`,
            cannotDeleteOrDisableAllTags: {
                title: 'Impossible de supprimer ou de désactiver tous les tags',
                description: `Au moins un tag doit rester activé, car votre espace de travail requiert des tags.`,
            },
            cannotMakeAllTagsOptional: {
                title: 'Impossible de rendre tous les tags facultatifs',
                description: `Au moins un tag doit rester obligatoire, car les paramètres de votre espace de travail exigent des tags.`,
            },
            cannotMakeTagListRequired: {
                title: 'Impossible de rendre la liste des tags obligatoire',
                description: 'Vous pouvez uniquement rendre une liste de tags obligatoire si votre politique comporte plusieurs niveaux de tags configurés.',
            },
            tagCount: () => ({
                one: '1 tag',
                other: (count: number) => `${count} Tags`,
            }),
        },
        taxes: {
            subtitle: 'Ajoutez des noms de taxes, des taux et définissez des valeurs par défaut.',
            addRate: 'Ajouter un taux',
            workspaceDefault: 'Devise par défaut de l’espace de travail',
            foreignDefault: 'Devise étrangère par défaut',
            customTaxName: 'Nom de taxe personnalisé',
            value: 'Valeur',
            taxReclaimableOn: 'TVA récupérable sur',
            taxRate: 'Taux d’imposition',
            findTaxRate: 'Trouver le taux de taxe',
            error: {
                taxRateAlreadyExists: 'Ce nom de taxe est déjà utilisé',
                taxCodeAlreadyExists: 'Ce code de taxe est déjà utilisé',
                valuePercentageRange: 'Veuillez saisir un pourcentage valide compris entre 0 et 100',
                customNameRequired: 'Le nom de taxe personnalisé est obligatoire',
                deleteFailureMessage: 'Une erreur s’est produite lors de la suppression du taux de taxe. Veuillez réessayer ou demander de l’aide à Concierge.',
                updateFailureMessage: 'Une erreur s’est produite lors de la mise à jour du taux de taxe. Veuillez réessayer ou demander de l’aide à Concierge.',
                createFailureMessage: 'Une erreur s’est produite lors de la création du taux de taxe. Veuillez réessayer ou demander l’aide de Concierge.',
                updateTaxClaimableFailureMessage: 'La partie récupérable doit être inférieure au montant du taux kilométrique',
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
            updateTaxCodeFailureMessage: 'Une erreur s’est produite lors de la mise à jour du code fiscal, veuillez réessayer.',
        },
        duplicateWorkspace: {
            title: 'Nommez votre nouvel espace de travail',
            selectFeatures: 'Sélectionner les fonctionnalités à copier',
            whichFeatures: 'Quelles fonctionnalités souhaitez-vous copier vers votre nouvel espace de travail ?',
            confirmDuplicate: 'Voulez-vous continuer ?',
            categories: 'catégories et vos règles d’auto-catégorisation',
            reimbursementAccount: 'compte de remboursement',
            welcomeNote: 'Veuillez commencer à utiliser mon nouvel espace de travail',
            delayedSubmission: 'soumission différée',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `Vous êtes sur le point de créer et de partager ${newWorkspaceName ?? ''} avec ${totalMembers ?? 0} membres de l’espace de travail d’origine.`,
            error: 'Une erreur s’est produite lors de la duplication de votre nouvel espace de travail. Veuillez réessayer.',
        },
        emptyWorkspace: {
            title: 'Vous n’avez aucun espace de travail',
            subtitle: 'Suivez les reçus, remboursez les dépenses, gérez les déplacements, envoyez des factures, et plus encore.',
            createAWorkspaceCTA: 'Commencer',
            features: {
                trackAndCollect: 'Suivez et collectez les reçus',
                reimbursements: 'Rembourser les employés',
                companyCards: 'Gérer les cartes d’entreprise',
            },
            notFound: 'Aucun espace de travail trouvé',
            description: 'Les salons sont un excellent endroit pour discuter et travailler avec plusieurs personnes. Pour commencer à collaborer, créez ou rejoignez un espace de travail.',
        },
        new: {
            newWorkspace: 'Nouvel espace de travail',
            getTheExpensifyCardAndMore: 'Obtenez la carte Expensify et plus encore',
            confirmWorkspace: 'Confirmer l’espace de travail',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `Mon espace de travail de groupe${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `Espace de travail de ${userName}${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: "Une erreur s'est produite lors de la suppression d'un membre de l'espace de travail, veuillez réessayer.",
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Voulez-vous vraiment supprimer ${memberName} ?`,
                other: 'Voulez-vous vraiment supprimer ces membres ?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} est un approbateur dans cet espace de travail. Lorsque vous ne partagerez plus cet espace de travail avec cette personne, nous la remplacerons dans le flux d’approbation par le responsable de l’espace de travail, ${ownerName}`,
            removeMembersTitle: () => ({
                one: 'Supprimer le membre',
                other: 'Supprimer des membres',
            }),
            findMember: 'Rechercher un membre',
            removeWorkspaceMemberButtonTitle: 'Retirer de l’espace de travail',
            removeGroupMemberButtonTitle: 'Retirer du groupe',
            removeRoomMemberButtonTitle: 'Retirer de la discussion',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Voulez-vous vraiment supprimer ${memberName} ?`,
            removeMemberTitle: 'Supprimer le membre',
            transferOwner: 'Transférer le responsable',
            makeMember: () => ({
                one: 'Rendre membre',
                other: 'Créer des membres',
            }),
            makeAdmin: () => ({
                one: 'Nommer administrateur',
                other: 'Nommer des administrateurs',
            }),
            makeAuditor: () => ({
                one: 'Nommer auditeur',
                other: 'Créer des auditeurs',
            }),
            selectAll: 'Tout sélectionner',
            error: {
                genericAdd: 'Un problème est survenu lors de l’ajout de ce membre de l’espace de travail',
                cannotRemove: 'Vous ne pouvez pas vous supprimer vous-même ni supprimer le responsable de l’espace de travail',
                genericRemove: 'Un problème est survenu lors de la suppression de ce membre de l’espace de travail',
            },
            addedWithPrimary: 'Certains membres ont été ajoutés avec leurs identifiants principaux.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `Ajouté par la connexion secondaire ${secondaryLogin}.`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `Nombre total de membres de l’espace de travail : ${count}`,
            importMembers: 'Importer des membres',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `Si vous retirez ${approver} de cet espace de travail, nous le remplacerons dans le flux d’approbation par ${workspaceOwner}, le responsable de l’espace de travail.`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} a des notes de frais en attente d’approbation. Veuillez leur demander d’approuver, ou prendre le contrôle de leurs notes de frais avant de les retirer de l’espace de travail.`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `Vous ne pouvez pas supprimer ${memberName} de cet espace de travail. Veuillez définir un nouveau responsable des remboursements dans Workflows > Effectuer ou suivre les paiements, puis réessayez.`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Si vous supprimez ${memberName} de cet espace de travail, nous le remplacerons en tant qu’exportateur préféré par ${workspaceOwner}, le responsable de l’espace de travail.`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `Si vous supprimez ${memberName} de cet espace de travail, nous le remplacerons en tant que contact technique par ${workspaceOwner}, le responsable de l’espace de travail.`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} a une note de frais en cours de traitement sur laquelle il doit agir. Veuillez lui demander d’effectuer l’action requise avant de le retirer de l’espace de travail.`,
        },
        card: {
            getStartedIssuing: 'Commencez en émettant votre première carte virtuelle ou physique.',
            issueCard: 'Émettre une carte',
            issueNewCard: {
                whoNeedsCard: 'Qui a besoin d’une carte ?',
                inviteNewMember: 'Inviter un nouveau membre',
                findMember: 'Rechercher un membre',
                chooseCardType: 'Choisir un type de carte',
                physicalCard: 'Carte physique',
                physicalCardDescription: 'Parfait pour les gros dépensiers fréquents',
                virtualCard: 'Carte virtuelle',
                virtualCardDescription: 'Instantané et flexible',
                chooseLimitType: 'Choisir un type de limite',
                smartLimit: 'Limite intelligente',
                smartLimitDescription: 'Dépenser jusqu’à un certain montant avant de nécessiter une approbation',
                monthly: 'Mensuel',
                monthlyDescription: 'Dépenser jusqu’à un certain montant par mois',
                fixedAmount: 'Montant fixe',
                fixedAmountDescription: 'Dépenser jusqu’à un certain montant une seule fois',
                setLimit: 'Définir une limite',
                cardLimitError: 'Veuillez saisir un montant inférieur à 21 474 836 $',
                giveItName: 'Donnez-lui un nom',
                giveItNameInstruction: 'Rendez-la suffisamment unique pour la distinguer des autres cartes. Des cas d’utilisation spécifiques, c’est encore mieux !',
                cardName: 'Nom de la carte',
                letsDoubleCheck: 'Vérifions une dernière fois que tout est correct.',
                willBeReadyToUse: 'Cette carte sera prête à être utilisée immédiatement.',
                willBeReadyToShip: 'Cette carte sera prête à être expédiée immédiatement.',
                cardholder: 'Titulaire de carte',
                cardType: 'Type de carte',
                limit: 'Limite',
                limitType: 'Type de limite',
                disabledApprovalForSmartLimitError:
                    'Veuillez activer les approbations dans <strong>Workflows > Ajouter des approbations</strong> avant de configurer des limites intelligentes',
            },
            deactivateCardModal: {
                deactivate: 'Désactiver',
                deactivateCard: 'Désactiver la carte',
                deactivateConfirmation: 'Désactiver cette carte refusera toutes les transactions futures et ne peut pas être annulé.',
            },
        },
        accounting: {
            settings: 'paramètres',
            title: 'Connexions',
            subtitle: 'Connectez votre système comptable pour coder les transactions avec votre plan comptable, apparier automatiquement les paiements et garder vos finances synchronisées.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Discutez avec votre spécialiste de configuration.',
            talkYourAccountManager: 'Discutez avec votre gestionnaire de compte.',
            talkToConcierge: 'Discuter avec Concierge.',
            needAnotherAccounting: 'Besoin d’un autre logiciel comptable ?',
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
                `Une erreur est survenue avec une connexion configurée dans Expensify Classic. [Accédez à Expensify Classic pour corriger ce problème.](${oldDotPolicyConnectionsURL})`,
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
                        return 'Connexion à Xero impossible';
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
            importAsCategory: 'Importé comme catégories',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'Importé',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Importé en tant que tags',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'Importé',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: 'Non importé',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: 'Non importé',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Importé en tant que champs de note de frais',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'Employé NetSuite par défaut',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'cette intégration';
                return `Voulez-vous vraiment déconnecter ${integrationName} ?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Voulez-vous vraiment connecter ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'cette intégration comptable'} ? Cela supprimera toutes les connexions comptables existantes.`,
            enterCredentials: 'Saisissez vos identifiants',
            claimOffer: {
                badgeText: 'Offre disponible !',
                xero: {
                    headline: 'Profitez de Xero gratuitement pendant 6 mois !',
                    description:
                        '<muted-text><centered-text>Nouveau sur Xero ? Les clients Expensify bénéficient de 6 mois offerts. Profitez de cette offre ci-dessous.</centered-text></muted-text>',
                    connectButton: 'Se connecter à Xero',
                },
                uber: {
                    headerTitle: 'Uber pour les Entreprises',
                    headline: 'Bénéficiez de 5 % de réduction sur les trajets Uber',
                    description: `<muted-text><centered-text>Activez Uber for Business via Expensify et économisez 5 % sur tous les trajets professionnels jusqu'en juin. <a href="${CONST.UBER_TERMS_LINK}">Conditions applicables.</a></centered-text></muted-text>`,
                    connectButton: 'Connecter à Uber for Business',
                },
            },
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
                            return 'Importation de comptes';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importation de classes';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importation des emplacements';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Traitement des données importées';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Synchronisation des notes de frais remboursées et des paiements de factures';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importation de codes fiscaux';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Vérification de la connexion à QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importation des données QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importation des données Xero';
                        case 'startingImportQBO':
                            return 'Importation des données QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importation des données QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importation du titre';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importation du certificat d’approbation';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importation des dimensions';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importation de la politique d’enregistrement';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Synchronisation des données avec QuickBooks toujours en cours... Veuillez vous assurer que le Web Connector est en cours d’exécution';
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
                            return 'Mise à jour des champs de la note de frais';
                        case 'jobDone':
                            return 'En attente du chargement des données importées';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Synchronisation du plan comptable';
                        case 'xeroSyncImportCategories':
                            return 'Synchronisation des catégories';
                        case 'xeroSyncImportCustomers':
                            return 'Synchronisation des clients';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Marquer les notes de frais Expensify comme remboursées';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Marquer les factures et notes de débit Xero comme payées';
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
                            return 'Importation d’éléments';
                        case 'netSuiteSyncData':
                            return 'Importation de données dans Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Synchronisation des comptes';
                        case 'netSuiteSyncCurrencies':
                            return 'Synchronisation des devises';
                        case 'netSuiteSyncCategories':
                            return 'Synchronisation des catégories';
                        case 'netSuiteSyncReportFields':
                            return 'Importation de données en tant que champs de note de frais Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importation de données en tant que tags Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Mise à jour des informations de connexion';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Marquer les notes de frais Expensify comme remboursées';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Marquer les factures et notes de débit NetSuite comme payées';
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
                'L’exportateur préféré peut être n’importe quel administrateur d’espace de travail, mais doit aussi être un administrateur de domaine si vous définissez des comptes d’exportation différents pour chaque carte d’entreprise dans les paramètres de domaine.',
            exportPreferredExporterSubNote: 'Une fois défini, l’exportateur préféré verra les notes de frais à exporter dans son compte.',
            exportAs: 'Exporter en tant que',
            exportOutOfPocket: 'Exporter les dépenses hors poche en tant que',
            exportCompanyCard: 'Exporter les dépenses de carte d’entreprise au format',
            exportDate: 'Date d’exportation',
            defaultVendor: 'Fournisseur par défaut',
            autoSync: 'Synchronisation automatique',
            autoSyncDescription: 'Synchronisez automatiquement NetSuite et Expensify, chaque jour. Exportez les notes de frais finalisées en temps réel',
            reimbursedReports: 'Synchroniser les notes de frais remboursées',
            cardReconciliation: 'Rapprochement de carte',
            reconciliationAccount: 'Compte de rapprochement',
            continuousReconciliation: 'Rapprochement continu',
            saveHoursOnReconciliation:
                'Gagnez des heures à chaque période comptable en laissant Expensify rapprocher en continu, pour vous, les relevés et règlements de la carte Expensify.',
            enableContinuousReconciliation: (accountingAdvancedSettingsLink: string, connectionName: string) =>
                `<muted-text-label>Pour activer la réconciliation continue, veuillez activer la <a href="${accountingAdvancedSettingsLink}">synchronisation automatique</a> pour ${connectionName}.</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Choisissez le compte bancaire avec lequel les paiements de votre carte Expensify seront rapprochés.',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Assurez-vous que ce compte correspond à votre <a href="${settlementAccountUrl}">compte de règlement de carte Expensify</a> (se terminant par ${lastFourPAN}) afin que la Réconciliation Continue fonctionne correctement.`,
            },
        },
        export: {
            notReadyHeading: 'Pas prêt à exporter',
            notReadyDescription:
                'Les notes de frais en brouillon ou en attente ne peuvent pas être exportées vers le système comptable. Veuillez approuver ou payer ces dépenses avant de les exporter.',
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
                'Voici votre solde actuel provenant de l’encaissement des paiements de factures. Il sera transféré automatiquement sur votre compte bancaire si vous en avez ajouté un.',
            bankAccountsSubtitle: 'Ajoutez un compte bancaire pour effectuer et recevoir des paiements de factures.',
        },
        invite: {
            member: 'Inviter un membre',
            members: 'Inviter des membres',
            invitePeople: 'Inviter de nouveaux membres',
            genericFailureMessage: 'Une erreur s’est produite lors de l’invitation du membre à l’espace de travail. Veuillez réessayer.',
            pleaseEnterValidLogin: `Veuillez vous assurer que l’adresse e-mail ou le numéro de téléphone est valide (par ex. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: 'utilisateur',
            users: 'utilisateurs',
            invited: 'invité',
            removed: 'supprimé',
            to: 'à',
            from: 'de',
        },
        inviteMessage: {
            confirmDetails: 'Confirmer les détails',
            inviteMessagePrompt: 'Rendez votre invitation encore plus spéciale en ajoutant un message ci-dessous !',
            personalMessagePrompt: 'Message',
            genericFailureMessage: 'Une erreur s’est produite lors de l’invitation du membre à l’espace de travail. Veuillez réessayer.',
            inviteNoMembersError: 'Veuillez sélectionner au moins un membre à inviter',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} a demandé à rejoindre ${workspaceName}`,
        },
        distanceRates: {
            oopsNotSoFast: 'Oups ! Pas si vite...',
            workspaceNeeds: 'Un espace de travail doit avoir au moins un taux de distance activé.',
            distance: 'Distance',
            centrallyManage: 'Gérez les taux de manière centralisée, suivez en miles ou en kilomètres et définissez une catégorie par défaut.',
            rate: 'Taux',
            addRate: 'Ajouter un taux',
            findRate: 'Trouver le taux',
            trackTax: 'Suivre la taxe',
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
                '<muted-text>Les taxes doivent être activées sur l’espace de travail pour utiliser cette fonctionnalité. Rendez-vous dans <a href="#">Plus de fonctionnalités</a> pour effectuer ce changement.</muted-text>',
            deleteDistanceRate: 'Supprimer le taux de distance',
            areYouSureDelete: () => ({
                one: 'Voulez-vous vraiment supprimer ce taux ?',
                other: 'Voulez-vous vraiment supprimer ces taux ?',
            }),
            errors: {
                rateNameRequired: 'Le nom du taux est obligatoire',
                existingRateName: 'Un taux de distance portant ce nom existe déjà',
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
            currencyInputDisabledText: (currency: string) => `La devise par défaut ne peut pas être modifiée, car cet espace de travail est lié à un compte bancaire en ${currency}.`,
            save: 'Enregistrer',
            genericFailureMessage: 'Une erreur s’est produite lors de la mise à jour de l’espace de travail. Veuillez réessayer.',
            avatarUploadFailureMessage: 'Une erreur s’est produite lors du téléchargement de l’avatar. Veuillez réessayer.',
            addressContext: 'Une adresse d’Espace de travail est obligatoire pour activer Expensify Travel. Veuillez saisir une adresse associée à votre entreprise.',
            policy: 'Politique de dépenses',
        },
        bankAccount: {
            continueWithSetup: 'Continuer la configuration',
            youAreAlmostDone:
                'Vous avez presque terminé la configuration de votre compte bancaire, ce qui vous permettra d’émettre des cartes d’entreprise, de rembourser des dépenses, de collecter des factures et de payer des notes.',
            streamlinePayments: 'Rationaliser les paiements',
            connectBankAccountNote: 'Remarque : les comptes bancaires personnels ne peuvent pas être utilisés pour les paiements dans les espaces de travail.',
            oneMoreThing: 'Encore une chose !',
            allSet: 'Tout est prêt !',
            accountDescriptionWithCards: 'Ce compte bancaire sera utilisé pour émettre des cartes d’entreprise, rembourser des dépenses, encaisser des factures et payer des notes.',
            letsFinishInChat: 'Finissons dans le chat !',
            finishInChat: 'Terminer dans le chat',
            almostDone: 'Presque terminé !',
            disconnectBankAccount: 'Dissocier le compte bancaire',
            startOver: 'Recommencer',
            updateDetails: 'Mettre à jour les détails',
            yesDisconnectMyBankAccount: 'Oui, déconnecter mon compte bancaire',
            yesStartOver: 'Oui, recommencer',
            disconnectYourBankAccount: (bankName: string) =>
                `Dissociez votre compte bancaire <strong>${bankName}</strong>. Toutes les transactions en cours pour ce compte seront tout de même exécutées.`,
            clearProgress: 'Recommencer effacera la progression effectuée jusqu’à présent.',
            areYouSure: 'Êtes-vous sûr ?',
            workspaceCurrency: 'Devise de l’espace de travail',
            updateCurrencyPrompt:
                'Il semble que votre espace de travail soit actuellement configuré avec une devise différente du USD. Veuillez cliquer sur le bouton ci-dessous pour mettre à jour votre devise sur USD maintenant.',
            updateToUSD: 'Mettre à jour en USD',
            updateWorkspaceCurrency: 'Mettre à jour la devise de l’espace de travail',
            workspaceCurrencyNotSupported: 'Devise de l’espace de travail non prise en charge',
            yourWorkspace: `Votre espace de travail est défini sur une devise non prise en charge. Consultez la <a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">liste des devises prises en charge</a>.`,
            chooseAnExisting: 'Choisissez un compte bancaire existant pour payer les dépenses ou ajoutez-en un nouveau.',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Transférer le responsable',
            addPaymentCardTitle: 'Saisissez votre carte de paiement pour transférer la propriété',
            addPaymentCardButtonText: 'Accepter les conditions et ajouter une carte de paiement',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>Lisez et acceptez les <a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">conditions</a> et la <a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">politique de confidentialité</a> pour ajouter votre carte.</muted-text-micro>`,
            addPaymentCardPciCompliant: 'Conforme à la norme PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Chiffrement de niveau bancaire',
            addPaymentCardRedundant: 'Infrastructure redondante',
            addPaymentCardLearnMore: `<muted-text>En savoir plus sur notre <a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">sécurité</a>.</muted-text>`,
            amountOwedTitle: 'Solde en souffrance',
            amountOwedButtonText: 'OK',
            amountOwedText: "Ce compte présente un solde impayé d'un mois précédent.\n\nVoulez-vous apurer ce solde et prendre en charge la facturation de cet espace de travail ?",
            ownerOwesAmountTitle: 'Solde en souffrance',
            ownerOwesAmountButtonText: 'Transférer le solde',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `Le compte propriétaire de cet espace de travail (${email}) a un solde impayé d’un mois précédent.

Souhaitez-vous transférer ce montant (${amount}) afin de prendre en charge la facturation de cet espace de travail ? Votre carte de paiement sera débitée immédiatement.`,
            subscriptionTitle: 'Reprendre l’abonnement annuel',
            subscriptionButtonText: 'Transférer l’abonnement',
            subscriptionText: (usersCount: number, finalCount: number) =>
                `Prendre le contrôle de cet espace de travail fusionnera son abonnement annuel avec votre abonnement actuel. Cela augmentera la taille de votre abonnement de ${usersCount} membres, ce qui portera la nouvelle taille de votre abonnement à ${finalCount}. Souhaitez-vous continuer ?`,
            duplicateSubscriptionTitle: 'Alerte d’abonnement en double',
            duplicateSubscriptionButtonText: 'Continuer',
            duplicateSubscriptionText: (
                email: string,
                workspaceName: string,
            ) => `Il semble que vous essayiez de prendre en charge la facturation des espaces de travail de ${email}, mais pour cela, vous devez d’abord être administrateur sur tous ses espaces de travail.

Cliquez sur « Continuer » si vous souhaitez uniquement prendre en charge la facturation pour l’espace de travail ${workspaceName}.

Si vous voulez prendre en charge la facturation de l’ensemble de son abonnement, demandez-lui d’abord de vous ajouter comme administrateur à tous ses espaces de travail avant de prendre en charge la facturation.`,
            hasFailedSettlementsTitle: 'Impossible de transférer la responsabilité',
            hasFailedSettlementsButtonText: 'Compris',
            hasFailedSettlementsText: (email: string) =>
                `Vous ne pouvez pas prendre en charge la facturation, car ${email} a un règlement de Carte Expensify Expensify en retard. Veuillez lui demander de contacter concierge@expensify.com pour résoudre le problème. Ensuite, vous pourrez prendre en charge la facturation de cet espace de travail.`,
            failedToClearBalanceTitle: 'Échec de la remise à zéro du solde',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Nous n’avons pas pu effacer le solde. Veuillez réessayer plus tard.',
            successTitle: 'Youpi ! Tout est prêt.',
            successDescription: 'Vous êtes maintenant le responsable de cet espace de travail.',
            errorTitle: 'Oups ! Pas si vite...',
            errorDescription: `<muted-text><centered-text>Un problème est survenu lors du transfert de la propriété de cet espace de travail. Réessayez ou <concierge-link>contactez Concierge</concierge-link> pour obtenir de l'aide.</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: 'Attention !',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `Les notes de frais suivantes ont déjà été exportées vers ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} :

${reportName}

Voulez-vous vraiment les exporter à nouveau ?`,
            confirmText: 'Oui, exporter à nouveau',
            cancelText: 'Annuler',
        },
        upgrade: {
            reportFields: {
                title: 'Champs de note de frais',
                description: `Les champs de note de frais vous permettent de spécifier des détails au niveau de l’en-tête, distincts des tags qui se rapportent aux dépenses de chaque ligne. Ces détails peuvent inclure des noms de projets spécifiques, des informations sur les déplacements professionnels, des lieux, et plus encore.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les champs de note de frais sont uniquement disponibles avec l’offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Profitez de la synchronisation automatisée et réduisez les saisies manuelles grâce à l’intégration Expensify + NetSuite. Obtenez des informations financières détaillées et en temps réel avec la prise en charge des segments natifs et personnalisés, y compris la correspondance des projets et des clients.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Notre intégration NetSuite est uniquement disponible avec l'offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Profitez de la synchronisation automatisée et réduisez les saisies manuelles grâce à l’intégration Expensify + Sage Intacct. Obtenez des informations financières détaillées et en temps réel avec des dimensions définies par l’utilisateur, ainsi qu’un codage des dépenses par service, classe, lieu, client et projet (mission).`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Notre intégration Sage Intacct est uniquement disponible avec l'offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Profitez de la synchronisation automatisée et réduisez les saisies manuelles grâce à l’intégration Expensify + QuickBooks Desktop. Gagnez en efficacité maximale avec une connexion bidirectionnelle en temps réel et un codage des dépenses par classe, article, client et projet.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Notre intégration QuickBooks Desktop est disponible uniquement avec l’abonnement Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Approbations avancées',
                description: `Si vous souhaitez ajouter davantage de niveaux d’approbation au processus – ou simplement vous assurer que les plus grosses dépenses sont revues une seconde fois – nous avons ce qu’il vous faut. Les approbations avancées vous aident à mettre en place les bons contrôles à chaque niveau afin de garder les dépenses de votre équipe sous contrôle.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les approbations avancées sont uniquement disponibles avec l’offre Control, qui commence à <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            categories: {
                title: 'Catégories',
                description: 'Les catégories vous permettent de suivre et d’organiser les dépenses. Utilisez nos catégories par défaut ou ajoutez les vôtres.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les catégories sont disponibles avec l’offre Collect, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            glCodes: {
                title: 'Codes GL',
                description: `Ajoutez des codes GL à vos catégories et tags pour faciliter l’export des dépenses vers vos systèmes de comptabilité et de paie.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les codes de grand livre ne sont disponibles que dans l’offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'Codes GL et de paie',
                description: `Ajoutez des codes GL et de paie à vos catégories pour faciliter l’exportation des dépenses vers vos systèmes de comptabilité et de paie.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les codes GL et de paie sont uniquement disponibles avec l’offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            taxCodes: {
                title: 'Codes fiscaux',
                description: `Ajoutez des codes de taxe à vos taxes pour faciliter l’exportation des dépenses vers vos systèmes de comptabilité et de paie.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les codes fiscaux sont uniquement disponibles avec l'offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            companyCards: {
                title: 'Cartes d’entreprise illimitées',
                description: `Vous devez ajouter d’autres flux de cartes ? Débloquez un nombre illimité de cartes d’entreprise pour synchroniser les transactions de tous les principaux émetteurs de cartes.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Ceci est uniquement disponible avec l’offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            rules: {
                title: 'Règles',
                description: `Les règles s’exécutent en arrière-plan et gardent vos dépenses sous contrôle pour que vous n’ayez pas à vous soucier des détails.

Rendez obligatoires des informations de dépense comme les reçus et les descriptions, définissez des limites et des valeurs par défaut, et automatisez les approbations et les paiements – le tout au même endroit.`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les règles sont uniquement disponibles avec l’abonnement Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            perDiem: {
                title: 'Indemnité journalière',
                description:
                    'Le per diem est un excellent moyen de garder vos dépenses quotidiennes conformes et prévisibles lorsque vos employés voyagent. Profitez de fonctionnalités comme des taux personnalisés, des catégories par défaut, ainsi que des détails plus granulaires comme les destinations et les sous-taux.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les indemnités journalières ne sont disponibles que dans l’offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            travel: {
                title: 'Voyage',
                description:
                    'Expensify Travel est une nouvelle plateforme de réservation et de gestion de voyages d’affaires qui permet aux membres de réserver des hébergements, des vols, des transports et plus encore.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Voyage est disponible avec l’offre Collect, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            reports: {
                title: 'Notes de frais',
                description: 'Les notes de frais vous permettent de regrouper les dépenses pour en faciliter le suivi et l’organisation.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les notes de frais sont disponibles avec l’offre Collect, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            multiLevelTags: {
                title: 'Tags multiniveaux',
                description:
                    'Les tags multi-niveaux vous aident à suivre les dépenses avec plus de précision. Assignez plusieurs tags à chaque poste, comme le service, le client ou le centre de coûts, afin de saisir tout le contexte de chaque dépense. Cela permet des rapports plus détaillés, des workflows d’approbation plus efficaces et des exports comptables plus complets.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les tags à plusieurs niveaux sont uniquement disponibles avec l’offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            distanceRates: {
                title: 'Taux de distance',
                description: 'Créez et gérez vos propres taux, suivez en miles ou en kilomètres, et définissez des catégories par défaut pour les dépenses de distance.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les taux de distance sont disponibles avec l’abonnement Collect, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            auditor: {
                title: 'Auditeur',
                description: 'Les auditeurs disposent d’un accès en lecture seule à toutes les notes de frais pour une visibilité complète et le suivi de la conformité.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les auditeurs sont uniquement disponibles avec l’offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: 'Niveaux d’approbation multiples',
                description:
                    'Les niveaux d’approbation multiples sont un outil de workflow pour les entreprises qui exigent que plusieurs personnes approuvent une note de frais avant qu’elle puisse être remboursée.',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Les niveaux d’approbation multiples sont uniquement disponibles avec l’offre Control, à partir de <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`}</muted-text>`,
            },
            pricing: {
                perActiveMember: 'par membre actif et par mois.',
                perMember: 'par membre et par mois.',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>Mettez à niveau pour accéder à cette fonctionnalité, ou <a href="${subscriptionLink}">en savoir plus</a> sur nos offres et nos tarifs.</muted-text>`,
            upgradeToUnlock: 'Débloquer cette fonctionnalité',
            completed: {
                headline: `Vous avez mis à niveau votre espace de travail !`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>Vous avez mis à niveau ${policyName} vers l’offre Control avec succès ! <a href="${subscriptionLink}">Afficher votre abonnement</a> pour plus de détails.</centered-text>`,
                categorizeMessage: `Vous êtes passé avec succès au forfait Collect. Vous pouvez maintenant catégoriser vos dépenses !`,
                travelMessage: `Vous êtes passé avec succès au forfait Collect. Vous pouvez maintenant commencer à réserver et gérer vos déplacements !`,
                distanceRateMessage: `Vous êtes passé avec succès au forfait Collect. Vous pouvez maintenant modifier le taux de distance !`,
                gotIt: 'Compris, merci',
                createdWorkspace: `Vous avez créé un espace de travail !`,
            },
            commonFeatures: {
                title: 'Passer au forfait Contrôle',
                note: 'Débloquez nos fonctionnalités les plus puissantes, notamment :',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Le forfait Control commence à <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `par membre et par mois.` : `par membre actif et par mois.`} <a href="${learnMoreMethodsRoute}">En savoir plus</a> sur nos offres et nos tarifs.</muted-text>`,
                    benefit1: 'Connexions avancées à la comptabilité (NetSuite, Sage Intacct et plus)',
                    benefit2: 'Règles de dépenses intelligentes',
                    benefit3: 'Workflows d’approbation à plusieurs niveaux',
                    benefit4: 'Contrôles de sécurité renforcés',
                    toUpgrade: 'Pour effectuer la mise à niveau, cliquez sur',
                    selectWorkspace: 'sélectionnez un espace de travail et changez le type de forfait en',
                },
                upgradeWorkspaceWarning: `Impossible de mettre à niveau l’espace de travail`,
                upgradeWorkspaceWarningForRestrictedPolicyCreationPrompt:
                    'Votre entreprise a restreint la création d’espaces de travail. Veuillez contacter un administrateur pour obtenir de l’aide.',
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Basculer vers l’offre Collect',
                note: 'Si vous rétrogradez, vous perdrez l’accès à ces fonctionnalités et plus encore :',
                benefits: {
                    note: 'Pour une comparaison complète de nos offres, consultez notre',
                    pricingPage: 'page des tarifs',
                    confirm: 'Voulez-vous vraiment rétrograder et supprimer vos configurations ?',
                    warning: 'Cette action est irréversible.',
                    benefit1: 'Connexions comptables (sauf QuickBooks Online et Xero)',
                    benefit2: 'Règles de dépenses intelligentes',
                    benefit3: 'Workflows d’approbation à plusieurs niveaux',
                    benefit4: 'Contrôles de sécurité renforcés',
                    headsUp: 'Attention !',
                    multiWorkspaceNote: 'Vous devrez rétrograder tous vos espaces de travail avant votre premier paiement mensuel pour commencer un abonnement au tarif Collect. Cliquez',
                    selectStep: '> sélectionnez chaque espace de travail > changez le type de forfait en',
                },
            },
            completed: {
                headline: 'Votre espace de travail a été rétrogradé',
                description: 'Vous avez d’autres espaces de travail sur l’offre Control. Pour être facturé au tarif Collect, vous devez rétrograder tous les espaces de travail.',
                gotIt: 'Compris, merci',
            },
        },
        payAndDowngrade: {
            title: 'Payer et rétrograder',
            headline: 'Votre paiement final',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `Votre facture finale pour cet abonnement sera de <strong>${formattedAmount}</strong>`,
            description2: (date: string) => `Voici votre répartition pour le ${date} :`,
            subscription:
                'Attention ! Cette action mettra fin à votre abonnement Expensify, supprimera cet espace de travail et retirera tous les membres de l’espace de travail. Si vous souhaitez conserver cet espace de travail et seulement vous retirer, demandez d’abord à un autre administrateur de reprendre la facturation.',
            genericFailureMessage: 'Une erreur s’est produite lors du paiement de votre facture. Veuillez réessayer.',
        },
        restrictedAction: {
            restricted: 'Restreint',
            actionsAreCurrentlyRestricted: (workspaceName: string) => `Les actions sur l’espace de travail ${workspaceName} sont actuellement restreintes`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `Le responsable de l’espace de travail, ${workspaceOwnerName}, devra ajouter ou mettre à jour la carte de paiement enregistrée pour débloquer la nouvelle activité de l’espace de travail.`,
            youWillNeedToAddOrUpdatePaymentCard: "Vous devez ajouter ou mettre à jour la carte de paiement enregistrée pour débloquer de nouvelles activités dans l'espace de travail.",
            addPaymentCardToUnlock: 'Ajoutez une carte de paiement pour tout débloquer !',
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
                subtitle: (categoriesPageLink: string, tagsPageLink: string) =>
                    `<muted-text>Définissez des contrôles de dépenses et des valeurs par défaut pour les dépenses individuelles. Vous pouvez également créer des règles pour les <a href="${categoriesPageLink}">catégories</a> et les <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                receiptRequiredAmount: 'Montant nécessitant un reçu',
                receiptRequiredAmountDescription: "Exiger des reçus lorsque la dépense dépasse ce montant, sauf si une règle de catégorie l'outrepasse.",
                receiptRequiredAmountError: ({amount}: {amount: string}) => `Le montant ne peut pas être supérieur au montant requis pour les reçus détaillés (${amount})`,
                itemizedReceiptRequiredAmount: 'Montant requis pour le reçu détaillé',
                itemizedReceiptRequiredAmountDescription: 'Exiger des reçus détaillés lorsque les dépenses dépassent ce montant, sauf si une règle de catégorie le remplace.',
                itemizedReceiptRequiredAmountError: ({amount}: {amount: string}) => `Le montant ne peut pas être inférieur au montant requis pour les reçus réguliers (${amount})`,
                maxExpenseAmount: 'Montant maximal de la dépense',
                maxExpenseAmountDescription: 'Signaler les dépenses qui dépassent ce montant, sauf en cas de dérogation par une règle de catégorie.',
                maxAge: 'Âge maximal',
                maxExpenseAge: 'Ancienneté maximale de la dépense',
                maxExpenseAgeDescription: 'Signaler les dépenses antérieures à un certain nombre de jours.',
                maxExpenseAgeDays: () => ({
                    one: '1 jour',
                    other: (count: number) => `${count} jours`,
                }),
                cashExpenseDefault: 'Valeur par défaut des dépenses en espèces',
                cashExpenseDefaultDescription:
                    'Choisissez comment les dépenses en espèces doivent être créées. Une dépense est considérée comme une dépense en espèces si ce n’est pas une transaction de carte entreprise importée. Cela inclut les dépenses créées manuellement, les reçus, les indemnités journalières, les dépenses de distance et de temps.',
                reimbursableDefault: 'Remboursable',
                reimbursableDefaultDescription: 'Les dépenses sont le plus souvent remboursées aux employés',
                nonReimbursableDefault: 'Non remboursable',
                nonReimbursableDefaultDescription: 'Les dépenses sont parfois remboursées aux employés',
                alwaysReimbursable: 'Toujours remboursable',
                alwaysReimbursableDescription: 'Les dépenses sont toujours remboursées aux employés',
                alwaysNonReimbursable: 'Toujours non remboursable',
                alwaysNonReimbursableDescription: 'Les dépenses ne sont jamais remboursées aux employés',
                billableDefault: 'Facturable par défaut',
                billableDefaultDescription: (tagsPageLink: string) =>
                    `<muted-text>Choisissez si les dépenses en espèces et par carte de crédit doivent être facturables par défaut. Les dépenses facturables sont activées ou désactivées dans les <a href="${tagsPageLink}">tags</a>.</muted-text>`,
                billable: 'Facturable',
                billableDescription: 'Les dépenses sont le plus souvent refacturées aux clients',
                nonBillable: 'Non refacturable',
                nonBillableDescription: 'Les dépenses sont parfois refacturées aux clients',
                eReceipts: 'e-reçus',
                eReceiptsHint: `Les e-reçus sont créés automatiquement [pour la plupart des transactions par carte de crédit en USD](${CONST.DEEP_DIVE_ERECEIPTS}).`,
                attendeeTracking: 'Suivi des participants',
                attendeeTrackingHint: 'Suivez le coût par personne pour chaque dépense.',
                prohibitedDefaultDescription:
                    'Signalez tout reçu comportant de l’alcool, des jeux d’argent ou d’autres articles restreints. Les dépenses avec des reçus contenant ces lignes d’articles nécessiteront un examen manuel.',
                prohibitedExpenses: 'Dépenses interdites',
                alcohol: 'Alcool',
                hotelIncidentals: 'Frais annexes d’hôtel',
                gambling: "Jeux d'argent",
                tobacco: 'Tabac',
                adultEntertainment: 'Divertissement pour adultes',
                requireCompanyCard: 'Exiger l’utilisation de cartes de société pour tous les achats',
                requireCompanyCardDescription: 'Signaler toutes les dépenses en espèces, y compris les indemnités kilométriques et les frais de per diem.',
            },
            expenseReportRules: {
                title: 'Avancé',
                subtitle: 'Automatisez la conformité des notes de frais, les approbations et le paiement.',
                preventSelfApprovalsTitle: 'Empêcher les auto-approbations',
                preventSelfApprovalsSubtitle: 'Empêcher les membres de l’espace de travail d’approuver leurs propres notes de frais.',
                autoApproveCompliantReportsTitle: 'Approuver automatiquement les notes de frais conformes',
                autoApproveCompliantReportsSubtitle: 'Configurer quelles notes de frais sont éligibles à l’auto-approbation.',
                autoApproveReportsUnderTitle: 'Approuver automatiquement les notes de frais inférieures à',
                autoApproveReportsUnderDescription: 'Les notes de frais entièrement conformes en dessous de ce montant seront automatiquement approuvées.',
                randomReportAuditTitle: 'Audit aléatoire de notes de frais',
                randomReportAuditDescription: 'Exiger que certaines notes de frais soient approuvées manuellement, même si elles sont éligibles à l’auto-approbation.',
                autoPayApprovedReportsTitle: 'Payer automatiquement les notes de frais approuvées',
                autoPayApprovedReportsSubtitle: 'Configurer quelles notes de frais sont éligibles au paiement automatique.',
                autoPayApprovedReportsLimitError: (currency?: string) => `Veuillez saisir un montant inférieur à ${currency ?? ''}20 000`,
                autoPayApprovedReportsLockedSubtitle:
                    'Accédez à « Plus de fonctionnalités » et activez les flux de travail, puis ajoutez les paiements pour déverrouiller cette fonctionnalité.',
                autoPayReportsUnderTitle: 'Payer automatiquement les notes de frais sous',
                autoPayReportsUnderDescription: 'Les notes de frais entièrement conformes en dessous de ce montant seront payées automatiquement.',
                unlockFeatureEnableWorkflowsSubtitle: (featureName: string) => `Ajoutez ${featureName} pour déverrouiller cette fonctionnalité.`,
                enableFeatureSubtitle: (featureName: string, moreFeaturesLink?: string) =>
                    `Accédez à [plus de fonctionnalités](${moreFeaturesLink}) et activez ${featureName} pour déverrouiller cette fonctionnalité.`,
            },
            categoryRules: {
                title: 'Règles de catégorie',
                approver: 'Approbateur',
                requireDescription: 'Description obligatoire',
                requireFields: 'Champs obligatoires',
                requiredFieldsTitle: 'Champs obligatoires',
                requiredFieldsDescription: (categoryName: string) => `Cela s’appliquera à toutes les dépenses classées comme <strong>${categoryName}</strong>.`,
                requireAttendees: 'Exiger des participants',
                descriptionHint: 'Indication de description',
                descriptionHintDescription: (categoryName: string) =>
                    `Rappelez aux employés de fournir des informations supplémentaires pour les dépenses de type « ${categoryName} ». Cet indice apparaît dans le champ de description des dépenses.`,
                descriptionHintLabel: 'Indice',
                descriptionHintSubtitle: 'Astuce de pro : plus c’est court, mieux c’est !',
                maxAmount: 'Montant maximal',
                flagAmountsOver: 'Signaler les montants supérieurs à',
                flagAmountsOverDescription: (categoryName: string) => `S’applique à la catégorie « ${categoryName} ».`,
                flagAmountsOverSubtitle: 'Ceci remplace le montant maximal pour toutes les dépenses.',
                expenseLimitTypes: {
                    expense: 'Dépense individuelle',
                    expenseSubtitle:
                        'Signaler les montants de dépense par catégorie. Cette règle remplace la règle générale de l’espace de travail concernant le montant maximal d’une dépense.',
                    daily: 'Total de la catégorie',
                    dailySubtitle: 'Signaler le total quotidien par catégorie pour chaque note de frais.',
                },
                requireReceiptsOver: 'Exiger les reçus au-dessus de',
                requireReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Par défaut`,
                    never: 'Ne jamais exiger de reçus',
                    always: 'Toujours exiger des reçus',
                },
                requireItemizedReceiptsOver: 'Exiger des reçus détaillés au-dessus de',
                requireItemizedReceiptsOverList: {
                    default: (defaultAmount: string) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Par défaut`,
                    never: 'Ne jamais exiger de reçus détaillés',
                    always: 'Toujours exiger des reçus détaillés',
                },
                defaultTaxRate: 'Taux de taxe par défaut',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `Accédez à [Plus de fonctionnalités](${moreFeaturesLink}) et activez les workflows, puis ajoutez des approbations pour déverrouiller cette fonctionnalité.`,
            },
            customRules: {
                title: 'Politique de dépenses',
                cardSubtitle: 'C’est ici que se trouve la politique de dépenses de votre équipe, pour que tout le monde soit aligné sur ce qui est couvert.',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Collecter',
                    description: 'Pour les équipes qui souhaitent automatiser leurs processus.',
                },
                corporate: {
                    label: 'Contrôle',
                    description: 'Pour les organisations ayant des exigences avancées.',
                },
            },
            description: "Choisissez l'offre qui vous convient. Pour une liste détaillée des fonctionnalités et des tarifs, consultez notre",
            subscriptionLink: 'page d’aide sur les types de forfaits et les tarifs',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Vous vous êtes engagé à 1 membre actif sur le forfait Control jusqu’à la fin de votre abonnement annuel, le ${annualSubscriptionEndDate}. Vous pourrez passer à un abonnement à l’usage et rétrograder vers le forfait Collect à partir du ${annualSubscriptionEndDate} en désactivant le renouvellement automatique dans`,
                other: `Vous vous êtes engagé à ${count} membres actifs sur le forfait Control jusqu'à la fin de votre abonnement annuel le ${annualSubscriptionEndDate}. Vous pouvez passer à un abonnement à l'utilisation et revenir au forfait Collect à partir du ${annualSubscriptionEndDate} en désactivant le renouvellement automatique dans`,
            }),
            subscriptions: 'Abonnements',
        },
    },
    getAssistancePage: {
        title: 'Obtenir de l’aide',
        subtitle: 'Nous sommes là pour vous dégager la voie vers la grandeur !',
        description: 'Choisissez parmi les options d’assistance ci-dessous :',
        chatWithConcierge: 'Discuter avec Concierge',
        scheduleSetupCall: 'Planifier un appel d’installation',
        scheduleACall: 'Planifier un appel',
        questionMarkButtonTooltip: 'Obtenez de l’aide de notre équipe',
        exploreHelpDocs: 'Explorer les documents d’aide',
        registerForWebinar: 'S’inscrire au webinaire',
        onboardingHelp: 'Aide à l’intégration',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Modifier la couleur de peau par défaut',
        headers: {
            frequentlyUsed: 'Utilisé fréquemment',
            smileysAndEmotion: 'Smileys et émotions',
            peopleAndBody: 'Personnes et corps',
            animalsAndNature: 'Animaux et nature',
            foodAndDrink: 'Nourriture et boissons',
            travelAndPlaces: 'Voyages et lieux',
            activities: 'Activités',
            objects: 'Objets',
            symbols: 'Symboles',
            flags: 'Drapeaux',
        },
    },
    newRoomPage: {
        newRoom: 'Nouvelle salle',
        groupName: 'Nom du groupe',
        roomName: 'Nom de la salle',
        visibility: 'Visibilité',
        restrictedDescription: 'Les personnes de votre espace de travail peuvent trouver ce salon',
        privateDescription: 'Les personnes invitées dans cette salle peuvent la trouver',
        publicDescription: 'Tout le monde peut trouver cette salle',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Tout le monde peut trouver cette salle',
        createRoom: 'Créer un salon',
        roomAlreadyExistsError: 'Une salle portant ce nom existe déjà',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} est un salon par défaut sur tous les espaces de travail. Veuillez choisir un autre nom.`,
        roomNameInvalidError: 'Les noms de salle peuvent uniquement contenir des lettres minuscules, des chiffres et des tirets',
        pleaseEnterRoomName: 'Veuillez saisir un nom de salle',
        pleaseSelectWorkspace: 'Veuillez sélectionner un espace de travail',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport ? `${actor} renommé en « ${newName} » (précédemment « ${oldName} »)` : `${actor}a renommé cette salle en « ${newName} » (auparavant « ${oldName} »)`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Salon renommé en ${newName}`,
        social: 'social',
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
        dynamicExternal: 'EXTERNE_DYNAMIQUE',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `a modifié l’adresse de l’entreprise en « ${newAddress} » (auparavant « ${previousAddress} »)` : `définir l’adresse de l’entreprise sur « ${newAddress} »`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `a ajouté ${approverName} (${approverEmail}) comme approbateur pour le ${field} « ${name} »`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `a supprimé ${approverName} (${approverEmail}) en tant qu’approbateur pour le/la ${field} « ${name} »`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `a modifié le valideur du ${field} « ${name} » en ${formatApprover(newApproverName, newApproverEmail)} (auparavant ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `a ajouté la catégorie « ${categoryName} »`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `a supprimé la catégorie « ${categoryName} »`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'Désactivé' : 'activé'} la catégorie « ${categoryName} »`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `a ajouté le code de paie « ${newValue} » à la catégorie « ${categoryName} »`;
            }
            if (!newValue && oldValue) {
                return `a supprimé le code de paie « ${oldValue} » de la catégorie « ${categoryName} »`;
            }
            return `a modifié le code de paie de la catégorie « ${categoryName} » en « ${newValue} » (précédemment « ${oldValue} »)`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `a ajouté le code GL « ${newValue} » à la catégorie « ${categoryName} »`;
            }
            if (!newValue && oldValue) {
                return `a supprimé le code GL « ${oldValue} » de la catégorie « ${categoryName} »`;
            }
            return `code de GL de la catégorie « ${categoryName} » modifié en « ${newValue} » (auparavant « ${oldValue} »)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `a modifié la description de la catégorie « ${categoryName} » en ${!oldValue ? 'Obligatoire' : 'Non requis'} (précédemment ${!oldValue ? 'Non requis' : 'Obligatoire'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `a ajouté un montant maximal de ${newAmount} à la catégorie « ${categoryName} »`;
            }
            if (oldAmount && !newAmount) {
                return `a supprimé le montant maximal de ${oldAmount} de la catégorie « ${categoryName} »`;
            }
            return `a modifié le montant maximal de la catégorie « ${categoryName} » à ${newAmount} (auparavant ${oldAmount})`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `a ajouté un type de limite de ${newValue} à la catégorie « ${categoryName} »`;
            }
            return `a modifié le type de limite de la catégorie « ${categoryName} » en ${newValue} (auparavant ${oldValue})`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `a mis à jour la catégorie « ${categoryName} » en modifiant Reçus en ${newValue}`;
            }
            return `a modifié la catégorie « ${categoryName} » en ${newValue} (auparavant ${oldValue})`;
        },
        updateCategoryMaxAmountNoItemizedReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `mis à jour la catégorie "${categoryName}" en changeant Reçus détaillés en ${newValue}`;
            }
            return `a changé les Reçus détaillés de la catégorie "${categoryName}" en ${newValue} (précédemment ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `a renommé la catégorie « ${oldName} » en « ${newName} »`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `a supprimé l’indication de description « ${oldValue} » de la catégorie « ${categoryName} »`;
            }
            return !oldValue
                ? `a ajouté l’indication de description « ${newValue} » à la catégorie « ${categoryName} »`
                : `a modifié l’indication de description de la catégorie « ${categoryName} » en « ${newValue} » (auparavant « ${oldValue} »)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `a modifié le nom de la liste de tags en « ${newName} » (précédemment « ${oldName} »)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `ajouté le tag « ${tagName} » à la liste « ${tagListName} »`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) =>
            `a mis à jour la liste de tags « ${tagListName} » en remplaçant le tag « ${oldName} » par « ${newName}`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'activé' : 'Désactivé'} l’étiquette « ${tagName} » sur la liste « ${tagListName} »`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `a supprimé la balise « ${tagName} » de la liste « ${tagListName} »`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `a supprimé les balises « ${count} » de la liste « ${tagListName} »`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `a mis à jour l’étiquette « ${tagName} » dans la liste « ${tagListName} » en changeant ${updatedField} en « ${newValue} » (auparavant « ${oldValue} »)`;
            }
            return `a mis à jour le tag « ${tagName} » dans la liste « ${tagListName} » en ajoutant un(e) ${updatedField} de « ${newValue} »`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `a modifié le ${customUnitName} ${updatedField} en « ${newValue} » (auparavant « ${oldValue} »)`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `Suivi fiscal ${newValue ? 'activé' : 'Désactivé'} sur les taux de distance`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `a ajouté un nouveau tarif « ${customUnitName} » « ${rateName} »`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `a modifié le taux de ${customUnitName} ${updatedField} « ${customUnitRateName} » en « ${newValue} » (auparavant « ${oldValue} »)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `a modifié le taux de taxe sur le tarif de distance « ${customUnitRateName} » en « ${newValue} (${newTaxPercentage}) » (auparavant « ${oldValue} (${oldTaxPercentage}) »)`;
            }
            return `a ajouté le taux de taxe « ${newValue} (${newTaxPercentage}) » au tarif de distance « ${customUnitRateName} »`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `a modifié la partie récupérable de la taxe sur le taux de distance « ${customUnitRateName} » en « ${newValue} » (auparavant « ${oldValue} »)`;
            }
            return `a ajouté une partie de taxe récupérable de « ${newValue} » au tarif de distance « ${customUnitRateName}`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? 'Activé' : 'Désactivé'} le taux de ${customUnitName} « ${customUnitRateName} »`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `a supprimé le taux « ${customUnitName} » « ${rateName} »`,
        addedReportField: (fieldType: string, fieldName?: string) => `a ajouté le champ de rapport ${fieldType} « ${fieldName} »`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `définir la valeur par défaut du champ de rapport « ${fieldName} » sur « ${defaultValue} »`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `a ajouté l’option « ${optionName} » au champ de rapport « ${fieldName} »`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `a supprimé l’option « ${optionName} » du champ de rapport « ${fieldName} »`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'activé' : 'Désactivé'} l’option « ${optionName} » pour le champ de rapport « ${fieldName} »`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'activé' : 'Désactivé'} toutes les options pour le champ de rapport « ${fieldName} »`;
            }
            return `${allEnabled ? 'activé' : 'Désactivé'} l'option "${optionName}" pour le champ de rapport "${fieldName}", rendant toutes les options ${allEnabled ? 'activé' : 'Désactivé'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `${fieldType} de rapport "${fieldName}" supprimé`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `mis à jour « Empêcher l’auto-approbation » en « ${newValue === 'true' ? 'Activé' : 'Désactivé'} » (auparavant « ${oldValue === 'true' ? 'Activé' : 'Désactivé'} »)`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `définir la date de soumission du rapport mensuel sur « ${newValue} »`;
            }
            return `a mis à jour la date de soumission du rapport mensuel en « ${newValue} » (auparavant « ${oldValue} »)`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `a mis à jour « Refacturer les dépenses aux clients » en « ${newValue} » (auparavant « ${oldValue} »)`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `« Cash expense default » mis à jour sur « ${newValue} » (auparavant « ${oldValue} »)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `a activé « Enforce default report titles » ${value ? 'Activé' : 'désactivé'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `a mis à jour le nom de cet espace de travail en « ${newName} » (auparavant « ${oldName} »)`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `définir la description de cet espace de travail sur « ${newDescription} »`
                : `a mis à jour la description de cet espace de travail en « ${newDescription} » (auparavant « ${oldDescription} »)`,
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
                one: `vous a retiré(e) du workflow d’approbation et du chat de dépenses de ${joinedNames}. Les notes de frais déjà soumises resteront disponibles pour approbation dans votre boîte de réception.`,
                other: `vous a retiré des workflows d’approbation et des discussions de dépenses de ${joinedNames}. Les rapports précédemment soumis resteront disponibles pour approbation dans votre boîte de réception.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `a mis à jour votre rôle dans ${policyName} de ${oldRole} à utilisateur. Vous avez été retiré de toutes les discussions de dépenses des déclarants, à l’exception de la vôtre.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `a mis à jour la devise par défaut en ${newCurrency} (auparavant ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `a mis à jour la fréquence de génération automatique de rapports sur « ${newFrequency} » (auparavant « ${oldFrequency} »)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `a mis à jour le mode d’approbation sur « ${newValue} » (auparavant « ${oldValue} »)`,
        upgradedWorkspace: 'a mis à niveau cet espace de travail vers l’offre Control',
        forcedCorporateUpgrade: `Cet espace de travail a été mis à niveau vers l’abonnement Control. Cliquez <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">ici</a> pour plus d’informations.`,
        downgradedWorkspace: 'a rétrogradé cet espace de travail vers l’offre Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `a modifié le taux de rapports acheminés aléatoirement pour approbation manuelle à ${Math.round(newAuditRate * 100)} % (auparavant ${Math.round(oldAuditRate * 100)} %)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `a modifié le seuil d’approbation manuelle pour toutes les dépenses à ${newLimit} (auparavant ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `Catégories ${enabled ? 'activé' : 'Désactivé'}`;
                case 'tags':
                    return `Étiquettes ${enabled ? 'activé' : 'Désactivé'}`;
                case 'workflows':
                    return `${enabled ? 'activé' : 'Désactivé'} flux de travail`;
                case 'distance rates':
                    return `Tarifs de distance ${enabled ? 'activé' : 'Désactivé'}`;
                case 'accounting':
                    return `${enabled ? 'activé' : 'Désactivé'} comptabilité`;
                case 'Expensify Cards':
                    return `${enabled ? 'activé' : 'Désactivé'} Cartes Expensify`;
                case 'company cards':
                    return `${enabled ? 'activé' : 'Désactivé'} cartes d’entreprise`;
                case 'invoicing':
                    return `Facturation ${enabled ? 'activé' : 'Désactivé'}`;
                case 'per diem':
                    return `${enabled ? 'activé' : 'Désactivé'} indemnité journalière`;
                case 'receipt partners':
                    return `${enabled ? 'activé' : 'Désactivé'} partenaires de reçus`;
                case 'rules':
                    return `${enabled ? 'activé' : 'Désactivé'} règles`;
                case 'tax tracking':
                    return `Suivi de la taxe ${enabled ? 'activé' : 'Désactivé'}`;
                default:
                    return `${enabled ? 'activé' : 'Désactivé'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `suivi des participants ${enabled ? 'activé' : 'Désactivé'}`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'activé' : 'désactivé'} remboursements`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `a ajouté la taxe « ${taxName} »`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `a supprimé la taxe « ${taxName} »`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `a renommé la taxe « ${oldValue} » en « ${newValue} »`;
                }
                case 'code': {
                    return `a modifié le code fiscal « ${taxName} » de « ${oldValue} » à « ${newValue} »`;
                }
                case 'rate': {
                    return `a modifié le taux de taxe pour « ${taxName} » de « ${oldValue} » à « ${newValue} »`;
                }
                case 'enabled': {
                    return `${oldValue ? 'Désactivé' : 'activé'} la taxe « ${taxName} »`;
                }
                default: {
                    return '';
                }
            }
        },
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `a modifié la formule du nom du rapport personnalisé en « ${newValue} » (auparavant « ${oldValue} »)`,
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `a modifié l'approbateur par défaut pour ${newApprover} (précédemment ${previousApprover})` : `a remplacé l'approbateur par défaut par ${newApprover}`,
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
            let text = `a modifié le processus d’approbation pour que ${members} soumettent des rapports à ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `(ancien approbateur par défaut ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(auparavant approbateur par défaut)';
            } else if (previousApprover) {
                text += `(auparavant ${previousApprover})`;
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
                ? `a modifié le flux d’approbation pour ${members} afin qu’ils soumettent des rapports à l’approbateur par défaut ${approver}`
                : `a modifié le flux d’approbation pour que ${members} soumettent des rapports à l'approbateur par défaut`;
            if (wasDefaultApprover && previousApprover) {
                text += `(auparavant approbateur par défaut ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(auparavant approbateur par défaut)';
            } else if (previousApprover) {
                text += `(auparavant ${previousApprover})`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `a modifié le flux d’approbation pour ${approver} afin de transmettre les rapports approuvés à ${forwardsTo} (auparavant transmis à ${previousForwardsTo})`
                : `a modifié le flux d’approbation pour ${approver} afin de transmettre les rapports approuvés à ${forwardsTo} (auparavant, les rapports approuvés définitivement)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `a modifié le flux d’approbation pour ${approver} afin de ne plus transférer les rapports approuvés (auparavant transférés à ${previousForwardsTo})`
                : `a modifié le flux d'approbation pour ${approver} afin de ne plus transférer les rapports approuvés`,
        setDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `définir le compte bancaire professionnel par défaut sur « ${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber} »`,
        removedDefaultBankAccount: ({bankAccountName, maskedBankAccountNumber}: {bankAccountName: string; maskedBankAccountNumber: string}) =>
            `a supprimé le compte bancaire professionnel par défaut « ${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber} »`,
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
            `a modifié le compte bancaire professionnel par défaut en « ${bankAccountName ? `${bankAccountName}: ` : ''}${maskedBankAccountNumber} » (précédemment « ${oldBankAccountName ? `${oldBankAccountName}: ` : ''}${oldMaskedBankAccountNumber} »)`,
        changedCompanyAddress: ({newAddress, previousAddress}: {newAddress: string; previousAddress?: string}) =>
            previousAddress ? `a modifié l’adresse de l’entreprise en « ${newAddress} » (auparavant « ${previousAddress} »)` : `définissez l’adresse de l’entreprise sur « ${newAddress} »`,
        addApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `a ajouté ${approverName} (${approverEmail}) comme approbateur pour le champ ${field} « ${name} »`,
        deleteApprovalRule: (approverEmail: string, approverName: string, field: string, name: string) =>
            `a supprimé ${approverName} (${approverEmail}) en tant qu’approbateur pour le champ ${field} « ${name} »`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `a modifié l’approbateur pour le ${field} « ${name} » en ${formatApprover(newApproverName, newApproverEmail)} (auparavant ${formatApprover(oldApproverName, oldApproverEmail)})`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `a ajouté la catégorie « ${categoryName} »`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `a supprimé la catégorie « ${categoryName} »`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? 'Désactivé' : 'activé'} la catégorie « ${categoryName} »`,
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
                return `a supprimé le code de GL « ${oldValue} » de la catégorie « ${categoryName} »`;
            }
            return `a modifié le code de Grand Livre de la catégorie « ${categoryName} » en « ${newValue} » (auparavant « ${oldValue} »)`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `a modifié la description de la catégorie « ${categoryName} » en ${!oldValue ? 'obligatoire' : 'non obligatoire'} (auparavant ${!oldValue ? 'non obligatoire' : 'obligatoire'})`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `a ajouté un montant maximal de ${newAmount} à la catégorie « ${categoryName} »`;
            }
            if (oldAmount && !newAmount) {
                return `a supprimé le montant maximal de ${oldAmount} de la catégorie « ${categoryName} »`;
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
                return `a mis à jour la catégorie « ${categoryName} » en changeant Reçus en ${newValue}`;
            }
            return `a modifié la catégorie « ${categoryName} » en ${newValue} (auparavant ${oldValue})`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `a renommé la catégorie « ${oldName} » en « ${newName} »`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `a supprimé l’indication de description « ${oldValue} » de la catégorie « ${categoryName} »`;
            }
            return !oldValue
                ? `a ajouté l’indication de description « ${newValue} » à la catégorie « ${categoryName} »`
                : `a modifié le texte d’aide de description de la catégorie « ${categoryName} » en « ${newValue} » (auparavant « ${oldValue} »)`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `a modifié le nom de la liste de tags en « ${newName} » (auparavant « ${oldName} »)`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `a ajouté le tag « ${tagName} » à la liste « ${tagListName} »`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) =>
            `a mis à jour la liste de tags « ${tagListName} » en remplaçant le tag « ${oldName} » par « ${newName}`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? 'activé' : 'Désactivé'} le tag « ${tagName} » sur la liste « ${tagListName} »`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `a supprimé le tag « ${tagName} » de la liste « ${tagListName} »`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `a supprimé « ${count} » tags de la liste « ${tagListName} »`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `a mis à jour le tag « ${tagName} » dans la liste « ${tagListName} » en changeant ${updatedField} en « ${newValue} » (auparavant « ${oldValue} »)`;
            }
            return `a mis à jour le tag « ${tagName} » dans la liste « ${tagListName} » en ajoutant un(e) ${updatedField} de « ${newValue} »`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `a modifié le/la ${customUnitName} ${updatedField} en « ${newValue} » (auparavant « ${oldValue} »)`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `Suivi fiscal ${newValue ? 'activé' : 'Désactivé'} sur les taux de distance`,
        addCustomUnitRate: (customUnitName: string, rateName: string) => `a ajouté un nouveau taux « ${customUnitName} » « ${rateName} »`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `a modifié le taux de ${customUnitName} ${updatedField} « ${customUnitRateName} » en « ${newValue} » (auparavant « ${oldValue} »)`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `a modifié le taux de taxe sur le taux de distance « ${customUnitRateName} » en « ${newValue} (${newTaxPercentage}) » (auparavant « ${oldValue} (${oldTaxPercentage}) »)`;
            }
            return `a ajouté le taux de taxe « ${newValue} (${newTaxPercentage}) » au taux de distance « ${customUnitRateName} »`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `a modifié la part de taxe récupérable du taux de distance « ${customUnitRateName} » à « ${newValue} » (auparavant « ${oldValue} »)`;
            }
            return `a ajouté une part de taxe récupérable de « ${newValue} » au taux de distance « ${customUnitRateName}`;
        },
        updatedCustomUnitRateEnabled: ({customUnitName, customUnitRateName, newValue}: UpdatedPolicyCustomUnitRateEnabledParams) => {
            return `${newValue ? 'activé' : 'Désactivé'} le taux de ${customUnitName} « ${customUnitRateName} »`;
        },
        deleteCustomUnitRate: (customUnitName: string, rateName: string) => `a supprimé le taux "${rateName}" de l’unité personnalisée "${customUnitName}"`,
        addedReportField: (fieldType: string, fieldName?: string) => `a ajouté le champ de note de frais ${fieldType} « ${fieldName} »`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `définir la valeur par défaut du champ de note de frais « ${fieldName} » sur « ${defaultValue} »`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `a ajouté l’option « ${optionName} » au champ de note de frais « ${fieldName} »`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `a supprimé l’option « ${optionName} » du champ de note de frais « ${fieldName} »`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `${optionEnabled ? 'activé' : 'Désactivé'} l’option « ${optionName} » pour le champ de note de frais « ${fieldName} »`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? 'activé' : 'Désactivé'} toutes les options pour le champ de note de frais « ${fieldName} »`;
            }
            return `${allEnabled ? 'activé' : 'Désactivé'} l’option « ${optionName} » pour le champ de note de frais « ${fieldName} », rendant toutes les options ${allEnabled ? 'activé' : 'Désactivé'}`;
        },
        deleteReportField: (fieldType: string, fieldName?: string) => `a supprimé le champ de note de frais ${fieldType} « ${fieldName} »`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `a mis à jour « Empêcher l’auto-approbation » en « ${newValue === 'true' ? 'Activé' : 'Désactivé'} » (auparavant « ${oldValue === 'true' ? 'Activé' : 'Désactivé'} »)`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `définir la date de soumission mensuelle des notes de frais sur « ${newValue} »`;
            }
            return `a mis à jour la date de soumission de la note de frais mensuelle sur « ${newValue} » (auparavant « ${oldValue} »)`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `a mis à jour « Refacturer les dépenses aux clients » en « ${newValue} » (auparavant « ${oldValue} »)`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `a mis à jour « Cash expense default » sur « ${newValue} » (auparavant « ${oldValue} »)`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `a activé « Imposer les titres de note de frais par défaut » ${value ? 'activé' : 'désactivé'}`,
        changedCustomReportNameFormula: ({newValue, oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `a modifié la formule de nom de note de frais personnalisée en « ${newValue} » (auparavant « ${oldValue} »)`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `a mis à jour le nom de cet espace de travail en « ${newName} » (précédemment « ${oldName} »)`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription
                ? `définir la description de cet espace de travail sur « ${newDescription} »`
                : `a mis à jour la description de cet espace de travail en « ${newDescription} » (auparavant « ${oldDescription} »)`,
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
                one: `vous a retiré de la chaîne d'approbation et de discussion de dépenses de ${joinedNames}. Les notes de frais précédemment soumises resteront disponibles pour approbation dans votre boîte de réception.`,
                other: `vous a retiré des workflows d’approbation et des discussions de dépenses de ${joinedNames}. Les notes de frais précédemment soumises resteront disponibles pour approbation dans votre boîte de réception.`,
            };
        },
        demotedFromWorkspace: (policyName: string, oldRole: string) =>
            `a mis à jour votre rôle dans ${policyName} de ${oldRole} à utilisateur. Vous avez été retiré de tous les chats de dépenses du déclarant, sauf du vôtre.`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `a mis à jour la devise par défaut sur ${newCurrency} (précédemment ${oldCurrency})`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) =>
            `a mis à jour la fréquence de création automatique des notes de frais sur « ${newFrequency} » (auparavant « ${oldFrequency} »)`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `a mis à jour le mode d’approbation sur « ${newValue} » (auparavant « ${oldValue} »)`,
        upgradedWorkspace: 'a mis à niveau cet espace de travail vers l’offre Control',
        forcedCorporateUpgrade: `Cet espace de travail a été mis à niveau vers le plan Control. Cliquez <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">ici</a> pour plus d’informations.`,
        downgradedWorkspace: 'a rétrogradé cet espace de travail vers l’offre Collect',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `a modifié le taux de notes de frais acheminées aléatoirement pour une approbation manuelle à ${Math.round(newAuditRate * 100)} % (auparavant ${Math.round(oldAuditRate * 100)} %)`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `a modifié la limite d’approbation manuelle pour toutes les dépenses à ${newLimit} (auparavant ${oldLimit})`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? 'activé' : 'Désactivé'} catégories`;
                case 'tags':
                    return `${enabled ? 'activé' : 'Désactivé'} tags`;
                case 'workflows':
                    return `Flux de travail ${enabled ? 'activé' : 'Désactivé'}`;
                case 'distance rates':
                    return `Tarifs de distance ${enabled ? 'activé' : 'Désactivé'}`;
                case 'accounting':
                    return `Comptabilité ${enabled ? 'activé' : 'Désactivé'}`;
                case 'Expensify Cards':
                    return `${enabled ? 'activé' : 'Désactivé'} Cartes Expensify`;
                case 'company cards':
                    return `${enabled ? 'activé' : 'Désactivé'} cartes d’entreprise`;
                case 'invoicing':
                    return `Facturation de ${enabled ? 'activé' : 'Désactivé'}`;
                case 'per diem':
                    return `${enabled ? 'activé' : 'Désactivé'} par jour`;
                case 'receipt partners':
                    return `Partenaires de reçus ${enabled ? 'activé' : 'Désactivé'}`;
                case 'rules':
                    return `Règles ${enabled ? 'activé' : 'Désactivé'}`;
                case 'tax tracking':
                    return `Suivi fiscal ${enabled ? 'activé' : 'Désactivé'}`;
                default:
                    return `${enabled ? 'activé' : 'Désactivé'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `Suivi des participants ${enabled ? 'activé' : 'Désactivé'}`,
        changedDefaultApprover: ({newApprover, previousApprover}: {newApprover: string; previousApprover?: string}) =>
            previousApprover ? `a changé l’approbateur par défaut en ${newApprover} (auparavant ${previousApprover})` : `a modifié l'approbateur par défaut en ${newApprover}`,
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
            let text = `a modifié le workflow d’approbation pour ${members} afin qu’ils soumettent leurs notes de frais à ${approver}`;
            if (wasDefaultApprover && previousApprover) {
                text += `(ancien approbateur par défaut ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(ancien approbateur par défaut)';
            } else if (previousApprover) {
                text += `( auparavant ${previousApprover} )`;
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
                ? `a modifié le circuit d’approbation pour ${members} afin qu’ils soumettent leurs notes de frais à l’approbateur par défaut ${approver}`
                : `a modifié le flux d’approbation pour ${members} afin qu’ils soumettent leurs notes de frais à l’approbateur par défaut`;
            if (wasDefaultApprover && previousApprover) {
                text += `(ancien approbateur par défaut ${previousApprover})`;
            } else if (wasDefaultApprover) {
                text += '(ancien approbateur par défaut)';
            } else if (previousApprover) {
                text += `( auparavant ${previousApprover} )`;
            }
            return text;
        },
        changedForwardsTo: ({approver, forwardsTo, previousForwardsTo}: {approver: string; forwardsTo: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `a modifié le flux d’approbation pour ${approver} afin de transférer les notes de frais approuvées à ${forwardsTo} (auparavant transférées à ${previousForwardsTo})`
                : `a modifié le flux d’approbation pour ${approver} afin de faire suivre les notes de frais approuvées à ${forwardsTo} (auparavant les notes de frais approuvées finales)`,
        removedForwardsTo: ({approver, previousForwardsTo}: {approver: string; previousForwardsTo?: string}) =>
            previousForwardsTo
                ? `a modifié le workflow d’approbation pour ${approver} afin d’arrêter de transférer les notes de frais approuvées (auparavant transférées à ${previousForwardsTo})`
                : `a modifié le flux d'approbation pour ${approver} afin d'arrêter de transférer les notes de frais approuvées`,
        changedInvoiceCompanyName: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue
                ? `a modifié le nom de l’entreprise de facturation en « ${newValue} » (auparavant « ${oldValue} »)`
                : `définir le nom de l’entreprise de facturation sur « ${newValue} »`,
        changedInvoiceCompanyWebsite: ({newValue, oldValue}: {newValue: string; oldValue?: string}) =>
            oldValue
                ? `a modifié le site web de l’entreprise de facturation en « ${newValue} » (auparavant « ${oldValue} »)`
                : `définir le site web de l’entreprise de facturation sur « ${newValue} »`,
        changedReimburser: ({newReimburser, previousReimburser}: UpdatedPolicyReimburserParams) =>
            previousReimburser ? `a modifié le payeur autorisé en « ${newReimburser} » (auparavant « ${previousReimburser} »)` : `a modifié le payeur autorisé en « ${newReimburser} »`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `${enabled ? 'activé' : 'Désactivé'} remboursements`,
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
                    return `${oldValue ? 'Désactivé' : 'activé'} la taxe « ${taxName} »`;
                }
                default: {
                    return '';
                }
            }
        },
        setReceiptRequiredAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `définir le montant requis du reçu sur « ${newValue} »`,
        changedReceiptRequiredAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `a modifié le montant requis pour le reçu à « ${newValue} » (précédemment « ${oldValue} »)`,
        removedReceiptRequiredAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `a supprimé le montant requis pour le reçu (auparavant « ${oldValue} »)`,
        setMaxExpenseAmount: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `définir le montant maximal de dépense sur « ${newValue} »`,
        changedMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `a modifié le montant maximal de dépense à « ${newValue} » (auparavant « ${oldValue} »)`,
        removedMaxExpenseAmount: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `a supprimé le montant maximal de dépense (précédemment « ${oldValue} »)`,
        setMaxExpenseAge: ({newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `définir l’ancienneté maximale des dépenses sur « ${newValue} » jours`,
        changedMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `a modifié l’ancienneté maximale des dépenses à « ${newValue} » jours (précédemment « ${oldValue} »)`,
        removedMaxExpenseAge: ({oldValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `a supprimé l’ancienneté maximale des dépenses (auparavant « ${oldValue} » jours)`,
    },
    roomMembersPage: {
        memberNotFound: 'Membre introuvable.',
        useInviteButton: 'Pour inviter un nouveau membre dans la discussion, veuillez utiliser le bouton d’invitation ci-dessus.',
        notAuthorized: `Vous n’avez pas accès à cette page. Si vous essayez de rejoindre ce salon, demandez simplement à un membre du salon de vous ajouter. Autre chose ? Contactez ${CONST.EMAIL.CONCIERGE}`,
        roomArchived: `Il semble que cette salle ait été archivée. Pour toute question, contactez ${CONST.EMAIL.CONCIERGE}.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Voulez-vous vraiment supprimer ${memberName} de la salle ?`,
            other: 'Voulez-vous vraiment supprimer les membres sélectionnés de la salle ?',
        }),
        error: {
            genericAdd: 'Un problème est survenu lors de l’ajout de ce membre de salon',
        },
    },
    newTaskPage: {
        assignTask: 'Assigner la tâche',
        assignMe: 'M’assigner',
        confirmTask: 'Confirmer la tâche',
        confirmError: 'Veuillez saisir un titre et sélectionner une destination de partage',
        descriptionOptional: 'Description (facultatif)',
        pleaseEnterTaskName: 'Veuillez saisir un titre',
        pleaseEnterTaskDestination: 'Veuillez sélectionner où vous voulez partager cette tâche',
    },
    task: {
        task: 'Tâche',
        title: 'Titre',
        description: 'Description',
        assignee: 'Assigné',
        completed: 'Terminé',
        action: 'Terminé',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `tâche pour ${title}`,
            completed: 'marqué comme terminé',
            canceled: 'tâche supprimée',
            reopened: 'marqué comme incomplet',
            error: 'Vous n’avez pas l’autorisation d’effectuer l’action demandée',
        },
        markAsComplete: 'Marquer comme terminé',
        markAsIncomplete: 'Marquer comme incomplet',
        assigneeError: "Une erreur s'est produite lors de l'assignation de cette tâche. Veuillez essayer un autre destinataire de tâche.",
        genericCreateTaskFailureMessage: 'Une erreur s’est produite lors de la création de cette tâche. Veuillez réessayer plus tard.',
        deleteTask: 'Supprimer la tâche',
        deleteConfirmation: 'Voulez-vous vraiment supprimer cette tâche ?',
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
            escape: 'Fermer les boîtes de dialogue',
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
        viewResults: 'Afficher les résultats',
        resetFilters: 'Réinitialiser les filtres',
        searchResults: {
            emptyResults: {
                title: 'Rien à afficher',
                subtitle: `Essayez de modifier vos critères de recherche ou de créer quelque chose avec le bouton +.`,
            },
            emptyExpenseResults: {
                title: 'Vous n’avez pas encore créé de dépenses',
                subtitle: 'Créez une dépense ou faites un essai d’Expensify pour en savoir plus.',
                subtitleWithOnlyCreateButton: 'Utilisez le bouton vert ci-dessous pour créer une dépense.',
            },
            emptyReportResults: {
                title: "Vous n'avez encore créé aucune note de frais",
                subtitle: 'Créez une note de frais ou faites un essai d’Expensify pour en savoir plus.',
                subtitleWithOnlyCreateButton: 'Utilisez le bouton vert ci-dessous pour créer une note de frais.',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    Vous n'avez encore créé aucune facture
                `),
                subtitle: 'Envoyez une facture ou faites un essai d’Expensify pour en savoir plus.',
                subtitleWithOnlyCreateButton: 'Utilisez le bouton vert ci-dessous pour envoyer une facture.',
            },
            emptyTripResults: {
                title: 'Aucun déplacement à afficher',
                subtitle: 'Commencez en réservant votre premier voyage ci-dessous.',
                buttonText: 'Réserver un voyage',
            },
            emptySubmitResults: {
                title: 'Aucune dépense à soumettre',
                subtitle: 'Tout est bon. Faites un tour d’honneur !',
                buttonText: 'Créer une note de frais',
            },
            emptyApproveResults: {
                title: 'Aucune dépense à approuver',
                subtitle: 'Zéro dépense. Détente maximale. Bien joué !',
            },
            emptyPayResults: {
                title: 'Aucune dépense à payer',
                subtitle: 'Félicitations ! Vous avez franchi la ligne d’arrivée.',
            },
            emptyExportResults: {
                title: 'Aucune dépense à exporter',
                subtitle: 'Il est temps de se détendre, beau travail.',
            },
            emptyStatementsResults: {
                title: 'Aucune dépense à afficher',
                subtitle: 'Aucun résultat. Veuillez essayer de modifier vos filtres.',
            },
            emptyUnapprovedResults: {
                title: 'Aucune dépense à approuver',
                subtitle: 'Zéro dépense. Détente maximale. Bien joué !',
            },
        },
        columns: 'Colonnes',
        resetColumns: 'Réinitialiser les colonnes',
        groupColumns: 'Regrouper les colonnes',
        expenseColumns: 'Colonnes de dépenses',
        statements: 'Relevés',
        unapprovedCash: 'Espèces non approuvées',
        unapprovedCard: 'Carte non approuvée',
        reconciliation: 'Rapprochement',
        topSpenders: 'Plus gros dépensiers',
        saveSearch: 'Enregistrer la recherche',
        deleteSavedSearch: 'Supprimer la recherche enregistrée',
        deleteSavedSearchConfirm: 'Voulez-vous vraiment supprimer cette recherche ?',
        searchName: 'Rechercher un nom',
        savedSearchesMenuItemTitle: 'Enregistré',
        groupedExpenses: 'dépenses groupées',
        bulkActions: {
            approve: 'Approuver',
            pay: 'Payer',
            delete: 'Supprimer',
            hold: 'En attente',
            unhold: 'Lever la mise en attente',
            reject: 'Rejeter',
            noOptionsAvailable: 'Aucune option disponible pour le groupe de dépenses sélectionné.',
        },
        filtersHeader: 'Filtres',
        filters: {
            date: {
                before: (date?: string) => `Avant ${date ?? ''}`,
                after: (date?: string) => `Après ${date ?? ''}`,
                on: (date?: string) => `Le ${date ?? ''}`,
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
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Inférieur à ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Supérieur à ${amount ?? ''}`,
                between: (greaterThan: string, lessThan: string) => `Entre ${greaterThan} et ${lessThan}`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Égal à ${amount ?? ''}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Cartes individuelles',
                closedCards: 'Cartes fermées',
                cardFeeds: 'Flux de cartes',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `Tous les ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `Toutes les cartes CSV importées${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} vaut ${value}`,
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
            purchaseCurrency: "Devise d'achat",
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: 'De',
                [CONST.SEARCH.GROUP_BY.CARD]: 'Carte',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: 'ID de retrait',
                [CONST.SEARCH.GROUP_BY.CATEGORY]: 'Catégorie',
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
        has: 'A »',
        groupBy: 'Grouper par',
        moneyRequestReport: {
            emptyStateTitle: 'Cette note de frais ne contient aucune dépense.',
            accessPlaceHolder: 'Ouvrir pour plus de détails',
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
            description: 'Ouh là, ça fait beaucoup d’éléments ! Nous allons les regrouper et Concierge vous enverra bientôt un fichier.',
        },
        exportedTo: 'Exporté vers',
        exportAll: {
            selectAllMatchingItems: 'Sélectionner tous les éléments correspondants',
            allMatchingItemsSelected: 'Tous les éléments correspondants sont sélectionnés',
        },
    },
    genericErrorPage: {
        title: 'Oups, quelque chose s’est mal passé !',
        body: {
            helpTextMobile: 'Veuillez fermer et rouvrir l’application, ou passer à',
            helpTextWeb: 'web.',
            helpTextConcierge: 'Si le problème persiste, contactez',
        },
        refresh: 'Actualiser',
    },
    fileDownload: {
        success: {
            title: 'Téléchargé !',
            message: 'Pièce jointe téléchargée avec succès !',
            qrMessage:
                'Vérifiez votre dossier de photos ou de téléchargements pour une copie de votre code QR. Astuce : ajoutez-le à une présentation pour que votre audience puisse le scanner et se connecter directement avec vous.',
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
    settlement: {
        status: {
            pending: 'En attente',
            cleared: 'Compensé',
            failed: 'Échec',
        },
        failedError: ({link}: {link: string}) => `Nous réessaierons ce règlement lorsque vous <a href="${link}">déverrouillerez votre compte</a>.`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date} • ID de retrait : ${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'Mise en page de la note de frais',
        groupByLabel: 'Grouper par :',
        selectGroupByOption: 'Sélectionnez le mode de regroupement des dépenses de la note de frais',
        uncategorized: 'Non catégorisé',
        noTag: 'Aucun tag',
        selectGroup: ({groupName}: {groupName: string}) => `Sélectionner toutes les dépenses dans ${groupName}`,
        groupBy: {
            category: 'Catégorie',
            tag: 'Tag',
        },
    },
    report: {
        newReport: {
            createExpense: 'Créer une dépense',
            createReport: 'Créer une note de frais',
            chooseWorkspace: 'Choisissez un espace de travail pour cette note de frais.',
            emptyReportConfirmationTitle: 'Vous avez déjà une note de frais vide',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `Voulez-vous vraiment créer une autre note de frais dans ${workspaceName} ? Vous pouvez accéder à vos notes de frais vides dans`,
            emptyReportConfirmationPromptLink: 'Notes de frais',
            emptyReportConfirmationDontShowAgain: 'Ne plus afficher ceci',
            genericWorkspaceName: 'cet espace de travail',
        },
        genericCreateReportFailureMessage: 'Erreur inattendue lors de la création de cette discussion. Veuillez réessayer plus tard.',
        genericAddCommentFailureMessage: 'Erreur inattendue lors de la publication du commentaire. Veuillez réessayer plus tard.',
        genericUpdateReportFieldFailureMessage: 'Erreur inattendue lors de la mise à jour du champ. Veuillez réessayer plus tard.',
        genericUpdateReportNameEditFailureMessage: 'Erreur inattendue lors du renommage de la note de frais. Veuillez réessayer plus tard.',
        noActivityYet: 'Aucune activité pour le moment',
        connectionSettings: 'Paramètres de connexion',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `a modifié ${fieldName} en « ${newValue} » (auparavant « ${oldValue} »)`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `définir ${fieldName} sur « ${newValue} »`,
                changeReportPolicy: (toPolicyName: string, fromPolicyName?: string) => {
                    if (!toPolicyName) {
                        return `a modifié l’espace de travail${fromPolicyName ? `(précédemment ${fromPolicyName})` : ''}`;
                    }
                    return `a modifié l’espace de travail en ${toPolicyName}${fromPolicyName ? `(précédemment ${fromPolicyName})` : ''}`;
                },
                changeType: (oldType: string, newType: string) => `a modifié le type de ${oldType} à ${newType}`,
                exportedToCSV: `exporté en CSV`,
                exportedToIntegration: {
                    automatic: (label: string) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `exporté vers ${translatedLabel}`;
                    },
                    automaticActionOne: (label: string) => `exporté vers ${label} via`,
                    automaticActionTwo: 'paramètres comptables',
                    manual: (label: string) => `a marqué cette note de frais comme exportée manuellement vers ${label}.`,
                    automaticActionThree: 'et a bien créé un enregistrement pour',
                    reimburseableLink: 'dépenses à titre personnel',
                    nonReimbursableLink: 'dépenses par carte d’entreprise',
                    pending: (label: string) => `a commencé à exporter cette note de frais vers ${label}...`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `impossible d’exporter cette note de frais vers ${label} (« ${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''} »)`,
                managerAttachReceipt: `a ajouté un reçu`,
                managerDetachReceipt: `a supprimé un reçu`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `payé ${amount} ${currency} ailleurs`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `a payé ${amount} ${currency} via intégration`,
                outdatedBankAccount: `impossible de traiter le paiement en raison d’un problème avec le compte bancaire du payeur`,
                reimbursementACHBounce: `impossible de traiter le paiement en raison d’un problème de compte bancaire`,
                reimbursementACHCancelled: `a annulé le paiement`,
                reimbursementAccountChanged: `impossible de traiter le paiement, car le payeur a changé de compte bancaire`,
                reimbursementDelayed: `a traité le paiement mais il est retardé de 1 à 2 jours ouvrés supplémentaires`,
                selectedForRandomAudit: `sélectionné aléatoirement pour examen`,
                selectedForRandomAuditMarkdown: `sélectionnée aléatoirement pour examen`,
                share: ({to}: ShareParams) => `a invité le membre ${to}`,
                unshare: ({to}: UnshareParams) => `a supprimé le membre ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `payé ${amount} ${currency}`,
                takeControl: `a pris le contrôle`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `un problème est survenu lors de la synchronisation avec ${label}${errorMessage ? ` ("${errorMessage}")` : ''}. Veuillez corriger le problème dans les <a href="${workspaceAccountingLink}">paramètres de l’espace de travail</a>.`,
                companyCardConnectionBroken: ({feedName, workspaceCompanyCardRoute}: {feedName: string; workspaceCompanyCardRoute: string}) =>
                    `La connexion ${feedName} est rompue. Pour rétablir l'importation des cartes, <a href='${workspaceCompanyCardRoute}'>connectez-vous à votre banque</a>`,
                addEmployee: (email: string, role: string) => `a ajouté ${email} en tant que ${role === 'member' ? 'a' : 'un'} ${role}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `a mis à jour le rôle de ${email} vers ${newRole} (précédemment ${currentRole})`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `a supprimé le champ personnalisé 1 de ${email} (précédemment « ${previousValue} »)`;
                    }
                    return !previousValue
                        ? `a ajouté « ${newValue} » au champ personnalisé 1 de ${email}`
                        : `a modifié le champ personnalisé 1 de ${email} en « ${newValue} » (auparavant « ${previousValue} »)`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `a supprimé le champ personnalisé 2 de ${email} (précédemment « ${previousValue} »)`;
                    }
                    return !previousValue
                        ? `a ajouté « ${newValue} » au champ personnalisé 2 de ${email}`
                        : `a modifié le champ personnalisé 2 de ${email} en « ${newValue} » (auparavant « ${previousValue} »)`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} a quitté l’espace de travail`,
                removeMember: (email: string, role: string) => `a supprimé ${role} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `a supprimé la connexion à ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
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
        companyCreditCard: 'Carte de crédit professionnelle',
        receiptScanningApp: 'Application de numérisation de reçus',
        billPay: 'Paiement de factures',
        invoicing: 'Facturation',
        CPACard: 'Carte CPA',
        payroll: 'Paie',
        travel: 'Voyage',
        resources: 'Ressources',
        expensifyApproved: 'ExpensifyApprouvé !',
        pressKit: 'Dossier de presse',
        support: 'Assistance',
        expensifyHelp: 'AideExpensify',
        terms: 'Conditions d’utilisation',
        privacy: 'Confidentialité',
        learnMore: 'En savoir plus',
        aboutExpensify: 'À propos d’Expensify',
        blog: 'Blog',
        jobs: 'Emplois',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relations investisseurs',
        getStarted: 'Commencer',
        createAccount: 'Créer un nouveau compte',
        logIn: 'Connexion',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Revenir à la liste des discussions',
        chatWelcomeMessage: 'Message de bienvenue du chat',
        navigatesToChat: 'Accède à une discussion',
        newMessageLineIndicator: 'Indicateur de nouvelle ligne de message',
        chatMessage: 'Message de discussion',
        lastChatMessagePreview: 'Aperçu du dernier message de discussion',
        workspaceName: 'Nom de l’espace de travail',
        chatUserDisplayNames: 'Noms d’affichage des membres du chat',
        scrollToNewestMessages: 'Faire défiler jusqu’aux derniers messages',
        preStyledText: 'Texte préformaté',
        viewAttachment: 'Afficher la pièce jointe',
    },
    parentReportAction: {
        deletedReport: 'Note de frais supprimée',
        deletedMessage: 'Message supprimé',
        deletedExpense: 'Dépense supprimée',
        reversedTransaction: 'Transaction annulée',
        deletedTask: 'Tâche supprimée',
        hiddenMessage: 'Message masqué',
    },
    threads: {
        thread: 'Fil',
        replies: 'Réponses',
        reply: 'Répondre',
        from: 'De',
        in: 'dans',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `Depuis ${reportName}${workspaceName ? `dans ${workspaceName}` : ''}`,
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
        inconsiderate: 'Irrespectueux',
        inconsiderateDescription: 'Formulation insultante ou irrespectueuse, aux intentions douteuses',
        intimidation: 'Intimidation',
        intimidationDescription: 'Poursuivre un programme de manière agressive malgré des objections valables',
        bullying: 'Harcèlement',
        bullyingDescription: 'Cibler un individu pour obtenir l’obéissance',
        harassment: 'Harcèlement',
        harassmentDescription: 'Comportement raciste, misogyne ou autre comportement largement discriminatoire',
        assault: 'Agression',
        assaultDescription: 'Attaque émotionnelle ciblée spécifiquement avec l’intention de nuire',
        flaggedContent: 'Ce message a été signalé comme enfreignant nos règles communautaires et son contenu a été masqué.',
        hideMessage: 'Masquer le message',
        revealMessage: 'Afficher le message',
        levelOneResult: 'Envoie un avertissement anonyme et le message est signalé pour examen.',
        levelTwoResult: 'Message masqué du canal, avertissement anonyme ajouté et message signalé pour examen.',
        levelThreeResult: 'Message supprimé du canal, avertissement anonyme ajouté et message signalé pour examen.',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: 'Inviter à soumettre des dépenses',
        inviteToChat: 'Inviter uniquement à discuter',
        nothing: 'Ne rien faire',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Accepter',
        decline: 'Refuser',
    },
    actionableMentionTrackExpense: {
        submit: 'Soumettre à quelqu’un',
        categorize: 'Catégorisez-la',
        share: 'Partagez-le avec mon comptable',
        nothing: 'Rien pour l’instant',
    },
    teachersUnitePage: {
        teachersUnite: 'Unité des enseignants',
        joinExpensifyOrg:
            'Rejoignez Expensify.org pour éliminer l’injustice dans le monde entier. La campagne actuelle « Teachers Unite » soutient les enseignants partout en partageant le coût des fournitures scolaires essentielles.',
        iKnowATeacher: 'Je connais un professeur',
        iAmATeacher: 'Je suis enseignant',
        getInTouch: 'Excellent ! Veuillez partager leurs coordonnées afin que nous puissions les contacter.',
        introSchoolPrincipal: 'Présentation de la direction de votre école',
        schoolPrincipalVerifyExpense:
            'Expensify.org partage le coût des fournitures scolaires essentielles afin que les élèves issus de foyers à faible revenu puissent avoir une meilleure expérience d’apprentissage. Votre chef d’établissement devra vérifier vos dépenses.',
        principalFirstName: 'Prénom du principal',
        principalLastName: 'Nom de famille du titulaire',
        principalWorkEmail: 'Adresse e-mail professionnelle principale',
        updateYourEmail: 'Mettre à jour votre adresse e-mail',
        updateEmail: "Mettre à jour l'adresse e-mail",
        schoolMailAsDefault: (contactMethodsRoute: string) =>
            `Avant de continuer, veuillez définir votre adresse e-mail scolaire comme méthode de contact par défaut. Vous pouvez le faire dans Paramètres > Profil > <a href="${contactMethodsRoute}">Méthodes de contact</a>.`,
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
        companySpend: 'Dépenses de l’entreprise',
    },
    distance: {
        addStop: 'Ajouter un arrêt',
        deleteWaypoint: 'Supprimer le point de passage',
        deleteWaypointConfirmation: 'Voulez-vous vraiment supprimer ce point de passage ?',
        address: 'Adresse',
        waypointDescription: {
            start: 'Démarrer',
            stop: 'Arrêter',
        },
        mapPending: {
            title: 'Cartographie en attente',
            subtitle: 'La carte sera générée lorsque vous serez de retour en ligne',
            onlineSubtitle: 'Un instant pendant que nous configurons la carte',
            errorTitle: 'Erreur de carte',
            errorSubtitle: 'Une erreur s’est produite lors du chargement de la carte. Veuillez réessayer.',
        },
        error: {
            selectSuggestedAddress: 'Veuillez sélectionner une adresse suggérée ou utiliser la position actuelle',
        },
        odometer: {
            startReading: 'Commencer la lecture',
            endReading: 'Fin de la lecture',
            saveForLater: 'Enregistrer pour plus tard',
            totalDistance: 'Distance totale',
        },
    },
    gps: {
        tooltip: 'Suivi GPS en cours ! Lorsque vous avez terminé, arrêtez le suivi ci-dessous.',
        disclaimer: 'Utilisez le GPS pour créer une dépense à partir de votre trajet. Touchez Démarrer ci-dessous pour commencer le suivi.',
        error: {
            failedToStart: 'Échec du démarrage du suivi de position.',
            failedToGetPermissions: 'Impossible d’obtenir les autorisations de localisation requises.',
        },
        trackingDistance: 'Suivi de la distance...',
        stopped: 'Arrêté',
        start: 'Démarrer',
        stop: 'Arrêter',
        discard: 'Ignorer',
        stopGpsTrackingModal: {
            title: 'Arrêter le suivi GPS',
            prompt: 'Êtes-vous sûr ? Cela mettra fin à votre parcours en cours.',
            cancel: 'Reprendre le suivi',
            confirm: 'Arrêter le suivi GPS',
        },
        discardDistanceTrackingModal: {
            title: 'Abandonner le suivi de distance',
            prompt: 'Êtes-vous sûr ? Cela annulera votre parcours actuel et ne pourra pas être annulé.',
            confirm: 'Abandonner le suivi de distance',
        },
        zeroDistanceTripModal: {
            title: 'Impossible de créer la dépense',
            prompt: 'Vous ne pouvez pas créer une dépense avec le même lieu de départ et d’arrivée.',
        },
        locationRequiredModal: {
            title: 'Accès à la position requis',
            prompt: 'Veuillez autoriser l’accès à la localisation dans les réglages de votre appareil pour lancer le suivi de distance par GPS.',
            allow: 'Autoriser',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Accès à la localisation en arrière-plan requis',
            prompt: 'Veuillez autoriser l’accès à la position en arrière-plan dans les paramètres de votre appareil (option « Toujours autoriser ») pour commencer le suivi de distance par GPS.',
        },
        preciseLocationRequiredModal: {
            title: 'Localisation précise requise',
            prompt: 'Veuillez activer la « localisation précise » dans les réglages de votre appareil pour commencer le suivi de distance par GPS.',
        },
        desktop: {
            title: 'Suivez la distance sur votre téléphone',
            subtitle: 'Enregistrez automatiquement vos miles ou kilomètres avec le GPS et transformez instantanément vos trajets en dépenses.',
            button: "Télécharger l'application",
        },
        notification: {
            title: 'Suivi GPS en cours',
            body: 'Accédez à l’application pour terminer',
        },
        locationServicesRequiredModal: {
            title: 'Accès à la position requis',
            confirm: 'Ouvrir les paramètres',
            prompt: 'Veuillez autoriser l’accès à la localisation dans les réglages de votre appareil pour lancer le suivi de distance par GPS.',
        },
        fabGpsTripExplained: 'Aller à l’écran GPS (action flottante)',
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Bulletin perdu ou endommagé',
        nextButtonLabel: 'Suivant',
        reasonTitle: 'Pourquoi avez-vous besoin d’une nouvelle carte ?',
        cardDamaged: 'Ma carte a été endommagée',
        cardLostOrStolen: 'Ma carte a été perdue ou volée',
        confirmAddressTitle: 'Veuillez confirmer l’adresse postale de votre nouvelle carte.',
        cardDamagedInfo: 'Votre nouvelle carte arrivera dans 2 à 3 jours ouvrables. Votre carte actuelle continuera de fonctionner jusqu’à l’activation de la nouvelle.',
        cardLostOrStolenInfo: 'Votre carte actuelle sera définitivement désactivée dès que votre commande sera passée. La plupart des cartes arrivent sous quelques jours ouvrables.',
        address: 'Adresse',
        deactivateCardButton: 'Désactiver la carte',
        shipNewCardButton: 'Envoyer une nouvelle carte',
        addressError: 'L’adresse est obligatoire',
        reasonError: 'Le motif est obligatoire',
        successTitle: 'Votre nouvelle carte est en route !',
        successDescription: 'Vous devrez l’activer lorsqu’elle arrivera dans quelques jours ouvrables. En attendant, vous pouvez utiliser une carte virtuelle.',
    },
    eReceipt: {
        guaranteed: 'e-reçu garanti',
        transactionDate: 'Date de transaction',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'Commencez un chat, <success><strong>parrainez un ami</strong></success>.',
            header: 'Démarrer une discussion, parrainer un ami',
            body: 'Vous voulez que vos amis utilisent Expensify, eux aussi ? Il vous suffit de démarrer une discussion avec eux et nous nous chargeons du reste.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: 'Soumettez une dépense, <success><strong>parrainez votre équipe</strong></success>.',
            header: 'Soumettre une dépense, parrainer votre équipe',
            body: 'Vous voulez que votre équipe utilise Expensify, elle aussi ? Soumettez-leur simplement une dépense et nous nous chargeons du reste.',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: 'Parrainer un ami',
            body: 'Vous voulez que vos amis utilisent aussi Expensify ? Discutez, payez ou partagez simplement une dépense avec eux et nous nous occupons du reste. Ou partagez simplement votre lien d’invitation !',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: 'Parrainer un ami',
            header: 'Parrainer un ami',
            body: 'Vous voulez que vos amis utilisent aussi Expensify ? Discutez, payez ou partagez simplement une dépense avec eux et nous nous occupons du reste. Ou partagez simplement votre lien d’invitation !',
        },
        copyReferralLink: 'Copier le lien d’invitation',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `Discutez avec votre spécialiste de configuration dans <a href="${href}">${adminReportName}</a> pour obtenir de l'aide`,
        default: `Envoyez un message à <concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> pour obtenir de l’aide pour la configuration`,
    },
    violations: {
        allTagLevelsRequired: 'Tous les tags sont obligatoires',
        autoReportedRejectedExpense: 'Cette dépense a été rejetée.',
        billableExpense: 'Facturable n’est plus valide',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Reçu obligatoire${formattedLimit ? `au-delà de ${formattedLimit}` : ''}`,
        categoryOutOfPolicy: 'Catégorie n’est plus valide',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Supplément de conversion de ${surcharge} % appliqué`,
        customUnitOutOfPolicy: 'Taux non valable pour cet espace de travail',
        duplicatedTransaction: 'Doublon potentiel',
        fieldRequired: 'Les champs de la note de frais sont obligatoires',
        futureDate: 'Date future non autorisée',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Majoration de ${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Date antérieure de plus de ${maxAge} jours`,
        missingCategory: 'Catégorie manquante',
        missingComment: 'Description requise pour la catégorie sélectionnée',
        missingAttendees: 'Plusieurs participants requis pour cette catégorie',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `${tagName ?? 'tag'} manquant`,
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
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `Montant dépassant la limite de catégorie quotidienne de ${formattedLimit}/personne`,
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
            return 'Reçu obligatoire';
        },
        itemizedReceiptRequired: ({formattedLimit}: {formattedLimit?: string}) => `Reçu détaillé requis${formattedLimit ? ` au-dessus de ${formattedLimit}` : ''}`,
        prohibitedExpense: ({prohibitedExpenseTypes}: ViolationsProhibitedExpenseParams) => {
            const preMessage = 'Dépense interdite :';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `alcool`;
                    case 'gambling':
                        return `jeux d’argent`;
                    case 'tobacco':
                        return `tabac`;
                    case 'adultEntertainment':
                        return `divertissement pour adultes`;
                    case 'hotelIncidentals':
                        return `Frais annexes d’hôtel`;
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
                return 'Impossible de faire correspondre automatiquement le reçu en raison d’une connexion bancaire interrompue';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `Connexion bancaire rompue. <a href="${companyCardPageURL}">Reconnecter pour faire correspondre le reçu</a>`
                    : 'Connexion bancaire rompue. Demandez à un administrateur de la rétablir pour faire correspondre le reçu.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Demandez à ${member} de marquer comme paiement en espèces ou attendez 7 jours et réessayez` : 'En attente de fusion avec la transaction par carte.';
            }
            return '';
        },
        brokenConnection530Error: 'Reçu en attente en raison d’une connexion bancaire rompue',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>Reçu en attente en raison d’une connexion bancaire rompue. Veuillez la résoudre dans les <a href="${workspaceCompanyCardRoute}">Cartes de société</a>.</muted-text-label>`,
        memberBrokenConnectionError: 'Reçu en attente en raison d’une connexion bancaire rompue. Veuillez demander à un administrateur de l’espace de travail de résoudre le problème.',
        markAsCashToIgnore: 'Marquer comme paiement en espèces pour l’ignorer et en demander le règlement.',
        smartscanFailed: ({canEdit = true}) => `L'analyse du reçu a échoué.${canEdit ? 'Saisir les détails manuellement.' : ''}`,
        receiptGeneratedWithAI: 'Reçu potentiellement généré par IA',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Manquant ${tagName ?? 'Tag'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} n’est plus valide`,
        taxAmountChanged: 'Le montant de la taxe a été modifié',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Tax'} n'est plus valide`,
        taxRateChanged: "Le taux d'imposition a été modifié",
        taxRequired: 'Taux de taxe manquant',
        none: 'Aucun',
        taxCodeToKeep: 'Choisissez le code fiscal à conserver',
        tagToKeep: 'Choisissez quel tag conserver',
        isTransactionReimbursable: 'Choisissez si la transaction est remboursable',
        merchantToKeep: 'Choisissez quel marchand conserver',
        descriptionToKeep: 'Choisissez la description à conserver',
        categoryToKeep: 'Choisissez quelle catégorie conserver',
        isTransactionBillable: 'Choisissez si la transaction est refacturable',
        keepThisOne: 'Garder celui-ci',
        confirmDetails: `Confirmez les détails que vous conservez`,
        confirmDuplicatesInfo: `Les doublons que vous ne conservez pas seront mis de côté pour que le déclarant les supprime.`,
        hold: 'Cette dépense a été mise en attente',
        resolvedDuplicates: 'a résolu le doublon',
        companyCardRequired: 'Achats par carte de société obligatoires',
        noRoute: 'Veuillez sélectionner une adresse valide',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} est obligatoire`,
        reportContainsExpensesWithViolations: 'La note de frais contient des dépenses avec des violations.',
    },
    violationDismissal: {
        rter: {
            manual: 'a marqué ce reçu comme liquide',
        },
        duplicatedTransaction: {
            manual: 'a résolu le doublon',
        },
    },
    videoPlayer: {
        play: 'Lecture',
        pause: 'Pause',
        fullscreen: 'Plein écran',
        playbackSpeed: 'Vitesse de lecture',
        expand: 'Agrandir',
        mute: 'Muet',
        unmute: 'Activer le son',
        normal: 'Normal',
    },
    exitSurvey: {
        header: 'Avant de partir',
        reasonPage: {
            title: 'Veuillez nous dire pourquoi vous nous quittez',
            subtitle: 'Avant de partir, dites-nous pourquoi vous souhaitez passer à Expensify Classic.',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'J’ai besoin d’une fonctionnalité qui n’est disponible que dans Expensify Classic.',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Je ne comprends pas comment utiliser le nouveau Expensify.',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Je comprends comment utiliser le nouveau Expensify, mais je préfère Expensify Classic.',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Quelle fonctionnalité dont vous avez besoin n’est pas disponible dans le nouveau Expensify ?',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: 'Qu’essayez-vous de faire ?',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'Pourquoi préférez-vous Expensify Classic ?',
        },
        responsePlaceholder: 'Votre réponse',
        thankYou: 'Merci pour ce retour !',
        thankYouSubtitle: 'Vos réponses nous aideront à créer un meilleur produit pour accomplir vos tâches. Merci beaucoup !',
        goToExpensifyClassic: 'Passer à Expensify Classic',
        offlineTitle: 'On dirait que vous êtes bloqué ici…',
        offline:
            'Vous semblez être hors ligne. Malheureusement, Expensify Classic ne fonctionne pas hors ligne, mais le nouveau Expensify, oui. Si vous préférez utiliser Expensify Classic, réessayez lorsque vous aurez une connexion Internet.',
        quickTip: 'Astuce rapide…',
        quickTipSubTitle: 'Vous pouvez accéder directement à Expensify Classic en vous rendant sur expensify.com. Ajoutez-le à vos favoris pour un accès rapide !',
        bookACall: 'Planifier un appel',
        bookACallTitle: 'Souhaitez-vous parler à un chef de produit ?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Discuter directement sur les dépenses et les notes de frais',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Possibilité de tout faire sur mobile',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Voyages et dépenses à la vitesse de la messagerie',
        },
        bookACallTextTop: 'En basculant vers Expensify Classic, vous passerez à côté de :',
        bookACallTextBottom:
            'Nous serions ravis d’organiser un appel avec vous pour comprendre pourquoi. Vous pouvez réserver un appel avec l’un de nos chefs de produit senior pour discuter de vos besoins.',
        takeMeToExpensifyClassic: 'M’emmener vers Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Une erreur s’est produite lors du chargement de messages supplémentaires',
        tryAgain: 'Réessayer',
    },
    systemMessage: {
        mergedWithCashTransaction: 'a associé un reçu à cette transaction',
    },
    subscription: {
        authenticatePaymentCard: 'Authentifier la carte de paiement',
        mobileReducedFunctionalityMessage: 'Vous ne pouvez pas modifier votre abonnement dans l’application mobile.',
        badge: {
            freeTrial: (numOfDays: number) => `Essai gratuit : il reste ${numOfDays} ${numOfDays === 1 ? 'jour' : 'jours'}`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Vos informations de paiement ne sont plus à jour',
                subtitle: (date: string) => `Mettez à jour votre carte de paiement avant le ${date} pour continuer à utiliser toutes vos fonctionnalités préférées.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Votre paiement n’a pas pu être traité',
                subtitle: (date?: string, purchaseAmountOwed?: string) =>
                    date && purchaseAmountOwed
                        ? `Votre prélèvement du ${date} d’un montant de ${purchaseAmountOwed} n’a pas pu être traité. Veuillez ajouter une carte de paiement pour régler le montant dû.`
                        : 'Veuillez ajouter une carte de paiement pour régler le montant dû.',
            },
            policyOwnerUnderInvoicing: {
                title: 'Vos informations de paiement ne sont plus à jour',
                subtitle: (date: string) => `Votre paiement est en retard. Veuillez régler votre facture avant le ${date} pour éviter une interruption de service.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Vos informations de paiement ne sont plus à jour',
                subtitle: 'Votre paiement est en retard. Veuillez régler votre facture.',
            },
            billingDisputePending: {
                title: 'Votre carte n’a pas pu être débitée',
                subtitle: (amountOwed: number, cardEnding: string) =>
                    `Vous avez contesté le débit de ${amountOwed} sur la carte se terminant par ${cardEnding}. Votre compte sera verrouillé jusqu’à ce que le litige soit résolu avec votre banque.`,
            },
            cardAuthenticationRequired: {
                title: 'Votre carte de paiement n’a pas été entièrement authentifiée.',
                subtitle: (cardEnding: string) => `Veuillez terminer le processus d’authentification pour activer votre carte de paiement se terminant par ${cardEnding}.`,
            },
            insufficientFunds: {
                title: 'Votre carte n’a pas pu être débitée',
                subtitle: (amountOwed: number) =>
                    `Votre carte de paiement a été refusée pour insuffisance de fonds. Veuillez réessayer ou ajouter une nouvelle carte de paiement pour régler votre solde impayé de ${amountOwed}.`,
            },
            cardExpired: {
                title: 'Votre carte n’a pas pu être débitée',
                subtitle: (amountOwed: number) => `Votre carte de paiement a expiré. Veuillez ajouter une nouvelle carte de paiement pour régler votre solde impayé de ${amountOwed}.`,
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
            cardOnDispute: (amountOwed: string, cardEnding: string) =>
                `Vous avez contesté le débit de ${amountOwed} sur la carte se terminant par ${cardEnding}. Votre compte sera verrouillé jusqu’à ce que le litige soit résolu avec votre banque.`,
            preTrial: {
                title: 'Commencer un essai gratuit',
                subtitle: 'Pour continuer, <a href="#">complétez votre liste de configuration</a> afin que votre équipe puisse commencer à déclarer des dépenses.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Essai : il reste ${numOfDays} ${numOfDays === 1 ? 'jour' : 'jours'} !`,
                subtitle: 'Ajoutez une carte de paiement pour continuer à utiliser toutes vos fonctionnalités préférées.',
            },
            trialEnded: {
                title: 'Votre essai gratuit est terminé',
                subtitle: 'Ajoutez une carte de paiement pour continuer à utiliser toutes vos fonctionnalités préférées.',
            },
            earlyDiscount: {
                claimOffer: 'Profiter de l’offre',
                subscriptionPageTitle: (discountType: number) =>
                    `<strong>${discountType} % de réduction sur votre première année !</strong> Ajoutez simplement une carte de paiement et démarrez un abonnement annuel.`,
                onboardingChatTitle: (discountType: number) => `Offre à durée limitée : ${discountType} % de réduction sur votre première année !`,
                subtitle: (days: number, hours: number, minutes: number, seconds: number) => `Réclamez dans ${days > 0 ? `${days}j :` : ''}${hours}h : ${minutes}m : ${seconds}s`,
            },
        },
        cardSection: {
            title: 'Paiement',
            subtitle: 'Ajoutez une carte pour payer votre abonnement Expensify.',
            addCardButton: 'Ajouter une carte de paiement',
            cardInfo: (name: string, expiration: string, currency: string) => `Nom : ${name}, Expiration : ${expiration}, Devise : ${currency}`,
            cardNextPayment: (nextPaymentDate: string) => `Votre prochaine date de paiement est le ${nextPaymentDate}.`,
            cardEnding: (cardNumber: string) => `Carte se terminant par ${cardNumber}`,
            changeCard: 'Modifier la carte de paiement',
            changeCurrency: 'Modifier la devise de paiement',
            cardNotFound: 'Aucune carte de paiement ajoutée',
            retryPaymentButton: 'Réessayer le paiement',
            authenticatePayment: 'Authentifier le paiement',
            requestRefund: 'Demander un remboursement',
            requestRefundModal: {
                full: 'Obtenir un remboursement est facile, il vous suffit de rétrograder votre compte avant votre prochaine date de facturation et vous recevrez un remboursement. <br /> <br /> Attention : rétrograder votre compte signifie que votre ou vos espace(s) de travail seront supprimés. Cette action est irréversible, mais vous pouvez toujours créer un nouvel espace de travail si vous changez d’avis.',
                confirm: 'Supprimer l’(les) espace(s) de travail et rétrograder',
            },
            viewPaymentHistory: 'Afficher l’historique des paiements',
        },
        yourPlan: {
            title: 'Votre formule',
            exploreAllPlans: 'Découvrir toutes les offres',
            customPricing: 'Tarification personnalisée',
            asLowAs: ({price}: YourPlanPriceValueParams) => `à partir de ${price} par membre actif/mois`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `${price} par membre/mois`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `${price} par membre et par mois`,
            perMemberMonth: 'par membre/mois',
            collect: {
                title: 'Collecter',
                description: 'L’offre petite entreprise qui vous offre les dépenses, les voyages et le chat.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, à ${upper}/membre actif sans la carte Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, à ${upper}/membre actif sans la carte Expensify.`,
                benefit1: 'Numérisation de reçus',
                benefit2: 'Remboursements',
                benefit3: 'Gestion des cartes d’entreprise',
                benefit4: 'Approbations de dépenses et de déplacements',
                benefit5: 'Réservation de voyage et règles',
                benefit6: 'Intégrations QuickBooks/Xero',
                benefit7: 'Discuter des dépenses, des notes de frais et des salons',
                benefit8: 'Assistance IA et humaine',
            },
            control: {
                title: 'Contrôle',
                description: 'Dépenses, voyages et messagerie pour les grandes entreprises.',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, à ${upper}/membre actif sans la carte Expensify.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `De ${lower}/membre actif avec la carte Expensify, à ${upper}/membre actif sans la carte Expensify.`,
                benefit1: 'Tout ce qui est inclus dans l’offre Collect',
                benefit2: 'Workflows d’approbation à plusieurs niveaux',
                benefit3: 'Règles de dépenses personnalisées',
                benefit4: 'Intégrations ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Intégrations RH (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Analyses et rapports personnalisés',
                benefit8: 'Budgétisation',
            },
            thisIsYourCurrentPlan: 'Ceci est votre formule actuelle',
            downgrade: 'Passer à Collect',
            upgrade: 'Passer à Contrôle',
            addMembers: 'Ajouter des membres',
            saveWithExpensifyTitle: 'Économisez avec la carte Expensify',
            saveWithExpensifyDescription: 'Utilisez notre calculateur d’économies pour voir comment le cash back de la carte Expensify peut réduire votre facture Expensify.',
            saveWithExpensifyButton: 'En savoir plus',
        },
        compareModal: {
            comparePlans: 'Comparer les offres',
            subtitle: `<muted-text>Débloquez les fonctionnalités dont vous avez besoin avec l’offre qui vous convient. <a href="${CONST.PRICING}">Consultez notre page de tarification</a> pour un récapitulatif complet des fonctionnalités de chacune de nos offres.</muted-text>`,
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
                'Attention : si vous ne définissez pas maintenant la taille de votre abonnement, nous la définirons automatiquement d’après le nombre de membres actifs de votre premier mois. Vous serez ensuite engagé à payer au minimum pour ce nombre de membres pendant les 12 prochains mois. Vous pouvez augmenter la taille de votre abonnement à tout moment, mais vous ne pourrez pas la diminuer avant la fin de votre abonnement.',
            zeroCommitment: 'Engagement zéro au tarif annuel d’abonnement réduit',
        },
        subscriptionSize: {
            title: 'Taille de l’abonnement',
            yourSize: 'La taille de votre abonnement correspond au nombre de places ouvertes qui peuvent être occupées par tout membre actif au cours d’un mois donné.',
            eachMonth:
                'Chaque mois, votre abonnement couvre jusqu’au nombre de membres actifs défini ci-dessus. Chaque fois que vous augmentez la taille de votre abonnement, vous démarrez un nouvel abonnement de 12 mois à cette nouvelle taille.',
            note: 'Remarque : un membre actif est toute personne qui a créé, modifié, soumis, approuvé, remboursé ou exporté des données de dépenses liées à l’espace de travail de votre entreprise.',
            confirmDetails: 'Confirmez les détails de votre nouvel abonnement annuel :',
            subscriptionSize: 'Taille de l’abonnement',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} membres actifs/mois`,
            subscriptionRenews: 'Renouvellement de l’abonnement',
            youCantDowngrade: 'Vous ne pouvez pas rétrograder pendant votre abonnement annuel.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Vous vous êtes déjà engagé à un abonnement annuel de ${size} membres actifs par mois jusqu’au ${date}. Vous pourrez passer à un abonnement à l’usage le ${date} en désactivant le renouvellement automatique.`,
            error: {
                size: 'Veuillez saisir une taille d’abonnement valide',
                sameSize: 'Veuillez saisir un nombre différent de la taille actuelle de votre abonnement',
            },
        },
        paymentCard: {
            addPaymentCard: 'Ajouter une carte de paiement',
            enterPaymentCardDetails: 'Saisissez les détails de votre carte de paiement',
            security: 'Expensify est conforme à la norme PCI-DSS, utilise un chiffrement de niveau bancaire et une infrastructure redondante pour protéger vos données.',
            learnMoreAboutSecurity: 'En savoir plus sur notre sécurité.',
        },
        subscriptionSettings: {
            title: 'Paramètres d’abonnement',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `Type d'abonnement : ${subscriptionType}, Taille de l'abonnement : ${subscriptionSize}, Renouvellement automatique : ${autoRenew}, Augmentation automatique des sièges annuels : ${autoIncrease}`,
            none: 'aucun',
            on: 'activé',
            off: 'désactivé',
            annual: 'Annuel',
            autoRenew: 'Renouvellement automatique',
            autoIncrease: 'Augmenter automatiquement les sièges annuels',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Économisez jusqu’à ${amountWithCurrency}/mois par membre actif`,
            automaticallyIncrease:
                'Augmentez automatiquement vos licences annuelles pour tenir compte des membres actifs qui dépassent la taille de votre abonnement. Remarque : cela prolongera la date de fin de votre abonnement annuel.',
            disableAutoRenew: 'Désactiver le renouvellement automatique',
            helpUsImprove: 'Aidez-nous à améliorer Expensify',
            whatsMainReason: 'Quelle est la principale raison pour laquelle vous désactivez le renouvellement automatique ?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Se renouvelle le ${date}.`,
            pricingConfiguration: 'Les tarifs dépendent de la configuration. Pour le prix le plus bas, choisissez un abonnement annuel et obtenez la carte Expensify.',
            learnMore: ({hasAdminsRoom}: SubscriptionSettingsLearnMoreParams) =>
                `<muted-text>En savoir plus sur notre <a href="${CONST.PRICING}">page des tarifs</a> ou discutez avec notre équipe dans votre ${hasAdminsRoom ? `<a href="adminsRoom">Salon #admins.</a>` : 'salon #admins'}</muted-text>`,
            estimatedPrice: 'Prix estimé',
            changesBasedOn: 'Cela change en fonction de votre utilisation de la carte Expensify et des options d’abonnement ci-dessous.',
        },
        requestEarlyCancellation: {
            title: 'Demander une résiliation anticipée',
            subtitle: 'Quelle est la principale raison pour laquelle vous demandez une résiliation anticipée ?',
            subscriptionCanceled: {
                title: 'Abonnement annulé',
                subtitle: 'Votre abonnement annuel a été annulé.',
                info: 'Si vous souhaitez continuer à utiliser votre ou vos espaces de travail à l’usage, tout est prêt.',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `Si vous souhaitez empêcher toute activité et tout frais futurs, vous devez <a href="${workspacesListRoute}">supprimer votre ou vos espaces de travail</a>. Notez que lorsque vous supprimez votre ou vos espaces de travail, vous serez facturé pour toute activité en cours qui a été engagée au cours du mois civil en cours.`,
            },
            requestSubmitted: {
                title: 'Demande soumise',
                subtitle:
                    'Merci de nous avoir indiqué que vous envisagez d’annuler votre abonnement. Nous examinons votre demande et nous vous contacterons bientôt via votre discussion avec <concierge-link>Concierge</concierge-link>.',
            },
            acknowledgement: `En demandant une résiliation anticipée, je reconnais et j’accepte qu’Expensify n’a aucune obligation d’accéder à une telle demande en vertu des <a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>Conditions d’utilisation</a> d’Expensify ou de tout autre contrat de services applicable entre Expensify et moi, et qu’Expensify conserve l’entière discrétion quant à l’acceptation de toute telle demande.`,
        },
    },
    feedbackSurvey: {
        tooLimited: 'La fonctionnalité doit être améliorée',
        tooExpensive: 'Trop cher',
        inadequateSupport: 'Service client insuffisant',
        businessClosing: 'Fermeture, réduction des effectifs ou rachat de l’entreprise',
        additionalInfoTitle: 'Vers quel logiciel passez-vous et pourquoi ?',
        additionalInfoInputLabel: 'Votre réponse',
    },
    roomChangeLog: {
        updateRoomDescription: 'définissez la description de la salle sur :',
        clearRoomDescription: 'a effacé la description du salon',
        changedRoomAvatar: 'a modifié l’avatar du salon',
        removedRoomAvatar: 'a supprimé l’avatar du salon',
    },
    delegate: {
        switchAccount: 'Changer de compte :',
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
        genericError: 'Oups, quelque chose s’est mal passé. Veuillez réessayer.',
        onBehalfOfMessage: (delegator: string) => `au nom de ${delegator}`,
        accessLevel: 'Niveau d’accès',
        confirmCopilot: 'Confirmez votre copilote ci-dessous.',
        accessLevelDescription: 'Choisissez un niveau d’accès ci-dessous. Les accès complet et limité permettent tous deux aux copilotes de voir toutes les conversations et dépenses.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Autoriser un autre membre à effectuer toutes les actions dans votre compte, en votre nom. Inclut la messagerie, les soumissions, les approbations, les paiements, les mises à jour des paramètres, et plus encore.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Autoriser un autre membre à effectuer la plupart des actions dans votre compte en votre nom. N’inclut pas les approbations, les paiements, les rejets et les blocages.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Supprimer le copilote',
        removeCopilotConfirmation: 'Voulez-vous vraiment supprimer ce copilote ?',
        changeAccessLevel: 'Modifier le niveau d’accès',
        makeSureItIsYou: 'Assurons-nous que c’est bien vous',
        enterMagicCode: (contactMethod: string) => `Veuillez saisir le code magique envoyé à ${contactMethod} pour ajouter un copilote. Il devrait arriver d’ici une à deux minutes.`,
        enterMagicCodeUpdate: (contactMethod: string) => `Veuillez saisir le code magique envoyé à ${contactMethod} pour mettre à jour votre copilote.`,
        notAllowed: 'Pas si vite...',
        noAccessMessage: dedent(`
            En tant que copilote, vous n’avez pas accès à cette page. Désolé !
        `),
        notAllowedMessage: (accountOwnerEmail: string) =>
            `En tant que <a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">copilote</a> pour ${accountOwnerEmail}, vous n’êtes pas autorisé à effectuer cette action. Désolé !`,
        copilotAccess: 'Accès Copilot',
    },
    debug: {
        debug: 'Debug',
        details: 'Détails',
        JSON: 'JSON',
        reportActions: 'Actions',
        reportActionPreview: 'Aperçu',
        nothingToPreview: 'Rien à prévisualiser',
        editJson: 'Modifier le JSON :',
        preview: 'Aperçu :',
        missingProperty: ({propertyName}: MissingPropertyParams) => `${propertyName} manquant`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Propriété non valide : ${propertyName} - Attendu : ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Valeur non valide - Attendu : ${expectedValues}`,
        missingValue: 'Valeur manquante',
        createReportAction: 'Action de création de note de frais',
        reportAction: 'Action sur la note de frais',
        report: 'Note de frais',
        transaction: 'Transaction',
        violations: 'Infractions',
        transactionViolation: 'Infraction de transaction',
        hint: 'Les modifications de données ne seront pas envoyées au serveur backend',
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
        viewReport: 'Voir la note de frais',
        viewTransaction: 'Afficher la transaction',
        createTransactionViolation: 'Créer une infraction de transaction',
        reasonVisibleInLHN: {
            hasDraftComment: 'A un commentaire en brouillon',
            hasGBR: 'A GBR',
            hasRBR: 'A un RBR',
            pinnedByUser: 'Épinglé par un membre',
            hasIOUViolations: 'Présente des irrégularités IOU',
            hasAddWorkspaceRoomErrors: 'Contient des erreurs d’ajout de salle d’espace de travail',
            isUnread: 'Est non lu (mode de concentration)',
            isArchived: 'Est archivé (mode le plus récent)',
            isSelfDM: 'Est un DM avec soi-même',
            isFocused: 'Est temporairement focalisé',
        },
        reasonGBR: {
            hasJoinRequest: 'A une demande de rejoindre (salon administrateur)',
            isUnreadWithMention: 'Non lu avec mention',
            isWaitingForAssigneeToCompleteAction: 'En attente que le destinataire de l’assignation termine l’action',
            hasChildReportAwaitingAction: 'A une note de frais enfant en attente d’action',
            hasMissingInvoiceBankAccount: 'A un compte bancaire de facture manquant',
            hasUnresolvedCardFraudAlert: 'A une alerte de fraude de carte non résolue',
        },
        reasonRBR: {
            hasErrors: 'Contient des erreurs dans les données de la note de frais ou des actions de note de frais',
            hasViolations: 'Comporte des infractions',
            hasTransactionThreadViolations: 'Présente des violations de fil de transaction',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Une note de frais est en attente d’action',
            theresAReportWithErrors: 'Il y a une note de frais contenant des erreurs',
            theresAWorkspaceWithCustomUnitsErrors: 'Il existe un espace de travail avec des erreurs d’unités personnalisées',
            theresAProblemWithAWorkspaceMember: 'Problème avec un membre de l’espace de travail',
            theresAProblemWithAWorkspaceQBOExport: 'Un problème est survenu avec un paramètre d’exportation de connexion d’espace de travail.',
            theresAProblemWithAContactMethod: 'Un problème est survenu avec un moyen de contact',
            aContactMethodRequiresVerification: 'Une méthode de contact nécessite une vérification',
            theresAProblemWithAPaymentMethod: 'Un problème est survenu avec un mode de paiement',
            theresAProblemWithAWorkspace: 'Il y a un problème avec un espace de travail',
            theresAProblemWithYourReimbursementAccount: 'Un problème est survenu avec votre compte de remboursement',
            theresABillingProblemWithYourSubscription: 'Un problème de facturation est survenu avec votre abonnement',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Votre abonnement a été renouvelé avec succès',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Un problème est survenu lors de la synchronisation de connexion de l’espace de travail',
            theresAProblemWithYourWallet: 'Un problème est survenu avec votre portefeuille',
            theresAProblemWithYourWalletTerms: 'Un problème est survenu avec les conditions de votre portefeuille',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Faites un essai',
    },
    migratedUserWelcomeModal: {
        title: 'Bienvenue dans le nouveau Expensify !',
        subtitle: 'Il contient tout ce que vous aimez de notre expérience classique, avec tout un tas d’améliorations pour vous simplifier encore plus la vie :',
        confirmText: 'Allons-y !',
        helpText: 'Essayer la démo de 2 min',
        features: {
            search: 'Recherche plus puissante sur mobile, web et ordinateur',
            concierge: 'IA Concierge intégrée pour vous aider à automatiser vos dépenses',
            chat: 'Discutez sur chaque dépense pour résoudre les questions rapidement',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>Commencez <strong>ici&nbsp;!</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>Renommez vos recherches enregistrées</strong> ici&nbsp;!</tooltip>',
        accountSwitcher: '<tooltip>Accédez à vos <strong>comptes Copilot</strong> ici</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>Scannez notre reçu de test</strong> pour voir comment ça marche !</tooltip>',
            manager: '<tooltip>Choisissez notre <strong>gestionnaire de test</strong> pour l’essayer&nbsp;!</tooltip>',
            confirmation: '<tooltip>Maintenant, <strong>soumettez votre dépense</strong> et laissez la magie opérer&nbsp;!</tooltip>',
            tryItOut: 'Essayez-le',
        },
        outstandingFilter: '<tooltip>Filtrer les dépenses\nqui <strong>doivent être approuvées</strong></tooltip>',
        scanTestDriveTooltip: '<tooltip>Envoyez ce reçu pour\n<strong>terminer l’essai !</strong></tooltip>',
        gpsTooltip: '<tooltip>Suivi GPS en cours ! Quand vous avez terminé, arrêtez le suivi ci-dessous.</tooltip>',
    },
    discardChangesConfirmation: {
        title: 'Ignorer les modifications ?',
        body: 'Voulez-vous vraiment abandonner les modifications que vous avez effectuées ?',
        confirmText: 'Ignorer les modifications',
    },
    scheduledCall: {
        book: {
            title: 'Planifier un appel',
            description: 'Trouvez un créneau qui vous convient.',
            slots: ({date}: {date: string}) => `<muted-text>Plages horaires disponibles pour le <strong>${date}</strong></muted-text>`,
        },
        confirmation: {
            title: 'Confirmer l’appel',
            description: 'Assurez-vous que les détails ci-dessous vous conviennent. Une fois que vous aurez confirmé l’appel, nous enverrons une invitation avec plus d’informations.',
            setupSpecialist: 'Votre spécialiste de configuration',
            meetingLength: 'Durée de la réunion',
            dateTime: 'Date et heure',
            minutes: '30 minutes',
        },
        callScheduled: 'Appel planifié',
    },
    autoSubmitModal: {
        title: 'Tout est en ordre et soumis !',
        description: 'Tous les avertissements et violations ont été effacés, donc :',
        submittedExpensesTitle: 'Ces dépenses ont été soumises',
        submittedExpensesDescription: 'Ces dépenses ont été envoyées à votre approbateur, mais peuvent encore être modifiées jusqu’à leur approbation.',
        pendingExpensesTitle: 'Les dépenses en attente ont été déplacées',
        pendingExpensesDescription: 'Toutes les dépenses en attente sur la carte ont été déplacées vers une note de frais distincte jusqu’à leur comptabilisation.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Faites un essai de 2 minutes',
        },
        modal: {
            title: 'Faites un essai avec nous',
            description: 'Faites une visite rapide du produit pour vous mettre rapidement à niveau.',
            confirmText: 'Commencer l’essai',
            helpText: 'Ignorer',
            employee: {
                description:
                    '<muted-text>Offrez à votre équipe <strong>3 mois gratuits d’Expensify !</strong> Il vous suffit de saisir l’adresse e-mail de votre responsable ci-dessous et de lui envoyer une note de frais test.</muted-text>',
                email: 'Saisissez l’adresse e-mail de votre responsable',
                error: 'Ce membre possède un espace de travail, veuillez saisir un nouveau membre pour effectuer le test.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Vous testez actuellement Expensify',
            readyForTheRealThing: 'Prêt pour de vrai ?',
            getStarted: 'Commencer',
        },
        employeeInviteMessage: (name: string) => `# ${name} vous a invité à tester Expensify
Salut ! Je viens de nous obtenir *3 mois gratuits* pour tester Expensify, le moyen le plus rapide de gérer les dépenses.

Voici un *reçu test* pour vous montrer comment ça marche :`,
    },
    export: {
        basicExport: 'Export basique',
        reportLevelExport: 'Toutes les données - niveau note de frais',
        expenseLevelExport: 'Toutes les données - niveau dépense',
        exportInProgress: 'Export en cours',
        conciergeWillSend: 'Concierge vous enverra le fichier sous peu.',
    },
    domain: {
        notVerified: 'Non vérifié',
        retry: 'Réessayer',
        verifyDomain: {
            title: 'Vérifier le domaine',
            beforeProceeding: ({domainName}: {domainName: string}) =>
                `Avant de continuer, vérifiez que vous possédez le domaine <strong>${domainName}</strong> en mettant à jour ses paramètres DNS.`,
            accessYourDNS: ({domainName}: {domainName: string}) => `Accédez à votre fournisseur DNS et ouvrez les paramètres DNS pour <strong>${domainName}</strong>.`,
            addTXTRecord: 'Ajoutez l’enregistrement TXT suivant :',
            saveChanges: 'Enregistrez les modifications et revenez ici pour vérifier votre domaine.',
            youMayNeedToConsult: `Vous devrez peut-être consulter le service informatique de votre organisation pour terminer la vérification. <a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">En savoir plus</a>.`,
            warning: 'Après vérification, tous les membres Expensify de votre domaine recevront un e-mail indiquant que leur compte sera géré sous votre domaine.',
            codeFetchError: 'Impossible de récupérer le code de vérification',
            genericError: 'Nous n’avons pas pu vérifier votre domaine. Veuillez réessayer et contacter Concierge si le problème persiste.',
        },
        domainVerified: {
            title: 'Domaine vérifié',
            header: 'Wouhou ! Votre domaine a été vérifié',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>Le domaine <strong>${domainName}</strong> a été vérifié avec succès et vous pouvez maintenant configurer SAML et d'autres fonctionnalités de sécurité.</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'Authentification unique SAML (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SSO SAML</a> est une fonctionnalité de sécurité qui vous donne plus de contrôle sur la façon dont les membres ayant des adresses e-mail <strong>${domainName}</strong> se connectent à Expensify. Pour l’activer, vous devrez vous vérifier en tant qu’administrateur d’entreprise autorisé.</muted-text>`,
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
            anyMemberWillBeRequired: 'Tout membre connecté avec une autre méthode devra se réauthentifier en utilisant SAML.',
            enableError: 'Impossible de mettre à jour le paramètre d’activation SAML',
            requireError: "Impossible de mettre à jour le paramètre d'exigence SAML",
            disableSamlRequired: 'Désactiver l’obligation SAML',
            oktaWarningPrompt: 'Voulez-vous continuer ? Cela désactivera également Okta SCIM.',
            requireWithEmptyMetadataError: 'Ajoutez ci-dessous les métadonnées du fournisseur d’identité pour activer',
        },
        samlConfigurationDetails: {
            title: 'Détails de configuration SAML',
            subtitle: 'Utilisez ces informations pour configurer SAML.',
            identityProviderMetadata: 'Métadonnées du fournisseur d’identité',
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
        accessRestricted: {
            title: 'Accès restreint',
            subtitle: (domainName: string) => `Veuillez vous vérifier en tant qu’administrateur d’entreprise autorisé pour <strong>${domainName}</strong> si vous avez besoin de contrôler :`,
            companyCardManagement: 'Gestion des cartes d’entreprise',
            accountCreationAndDeletion: 'Création et suppression de compte',
            workspaceCreation: 'Création d’espace de travail',
            samlSSO: 'SSO SAML',
        },
        addDomain: {
            title: 'Ajouter un domaine',
            subtitle: 'Saisissez le nom du domaine privé auquel vous souhaitez accéder (par ex. expensify.com).',
            domainName: 'Nom de domaine',
            newDomain: 'Nouveau domaine',
        },
        domainAdded: {
            title: 'Domaine ajouté',
            description: 'Ensuite, vous devrez vérifier la propriété du domaine et ajuster vos paramètres de sécurité.',
            configure: 'Configurer',
        },
        enhancedSecurity: {
            title: 'Sécurité renforcée',
            subtitle: 'Exigez que les membres de votre domaine se connectent via l’authentification unique, restreignez la création d’espaces de travail, et plus encore.',
            enable: 'Activer',
        },
        domainAdmins: 'Administrateurs de domaine',
        admins: {
            title: 'Administrateurs',
            findAdmin: 'Trouver un administrateur',
            primaryContact: 'Contact principal',
            addPrimaryContact: 'Ajouter un contact principal',
            setPrimaryContactError: 'Impossible de définir le contact principal. Veuillez réessayer plus tard.',
            settings: 'Paramètres',
            consolidatedDomainBilling: 'Facturation consolidée par domaine',
            consolidatedDomainBillingDescription: (domainName: string) =>
                `<comment><muted-text-label>Lorsqu'elle est activée, la personne à contacter principale paiera pour tous les espaces de travail appartenant aux membres de <strong>${domainName}</strong> et recevra tous les reçus de facturation.</muted-text-label></comment>`,
            consolidatedDomainBillingError: 'La facturation de domaine consolidée n’a pas pu être modifiée. Veuillez réessayer ultérieurement.',
            addAdmin: 'Ajouter un administrateur',
            addAdminError: 'Impossible d’ajouter ce membre en tant qu’administrateur. Veuillez réessayer.',
            revokeAdminAccess: 'Révoquer l’accès administrateur',
            cantRevokeAdminAccess: "Impossible de révoquer l'accès administrateur au contact technique",
            error: {
                removeAdmin: 'Impossible de supprimer cet utilisateur en tant qu’Administrateur. Veuillez réessayer.',
                removeDomain: 'Impossible de supprimer ce domaine. Veuillez réessayer.',
                removeDomainNameInvalid: 'Veuillez saisir votre nom de domaine pour le réinitialiser.',
            },
            resetDomain: 'Réinitialiser le domaine',
            resetDomainExplanation: ({domainName}: {domainName?: string}) => `Veuillez saisir <strong>${domainName}</strong> pour confirmer la réinitialisation du domaine.`,
            enterDomainName: 'Saisissez votre nom de domaine ici',
            resetDomainInfo: `Cette action est <strong>définitive</strong> et les données suivantes seront supprimées : <br/> <ul><li>Connexions des cartes d’entreprise et toutes les dépenses non déclarées associées à ces cartes</li> <li>Paramètres SAML et de groupe</li> </ul> Tous les comptes, espaces de travail, notes de frais, dépenses et autres données resteront. <br/><br/>Remarque : vous pouvez supprimer ce domaine de votre liste de domaines en retirant l’adresse e-mail associée de vos <a href="#">méthodes de contact</a>.`,
        },
        members: {
            title: 'Membres',
            findMember: 'Rechercher un membre',
            addMember: 'Ajouter un membre',
            email: 'Adresse e-mail',
            errors: {addMember: 'Impossible d’ajouter ce membre. Veuillez réessayer.'},
        },
        domainAdmins: 'Administrateurs de domaine',
    },
    gps: {
        disclaimer: 'Utilisez le GPS pour créer une dépense à partir de votre trajet. Touchez Démarrer ci-dessous pour commencer le suivi.',
        error: {failedToStart: 'Impossible de démarrer le suivi de la localisation.', failedToGetPermissions: 'Échec de l’obtention des autorisations de localisation requises.'},
        trackingDistance: 'Suivi de la distance...',
        stopped: 'Arrêté',
        start: 'Commencer',
        stop: 'Arrêter',
        discard: 'Ignorer',
        stopGpsTrackingModal: {
            title: 'Arrêter le suivi GPS',
            prompt: 'Êtes-vous sûr(e) ? Cela mettra fin à votre trajet actuel.',
            cancel: 'Reprendre le suivi',
            confirm: 'Arrêter le suivi GPS',
        },
        discardDistanceTrackingModal: {
            title: 'Ignorer le suivi de la distance',
            prompt: 'Êtes-vous sûr(e) ? Cela annulera votre parcours en cours et ne pourra pas être annulé.',
            confirm: 'Ignorer le suivi de la distance',
        },
        zeroDistanceTripModal: {title: 'Impossible de créer la dépense', prompt: 'Vous ne pouvez pas créer une dépense avec le même lieu de départ et d’arrivée.'},
        locationRequiredModal: {
            title: 'Accès à la localisation requis',
            prompt: 'Veuillez autoriser l’accès à la localisation dans les paramètres de votre appareil pour lancer le suivi de distance GPS.',
            allow: 'Autoriser',
        },
        androidBackgroundLocationRequiredModal: {
            title: 'Accès à la position en arrière-plan requis',
            prompt: 'Veuillez autoriser l’accès à la localisation en arrière-plan dans les paramètres de votre appareil (option « Autoriser tout le temps ») pour démarrer le suivi de distance par GPS.',
        },
        preciseLocationRequiredModal: {
            title: 'Emplacement précis requis',
            prompt: 'Veuillez activer la « localisation précise » dans les paramètres de votre appareil pour commencer le suivi de distance GPS.',
        },
        desktop: {
            title: 'Suivez la distance sur votre téléphone',
            subtitle: 'Enregistrez automatiquement les miles ou kilomètres avec le GPS et transformez instantanément vos trajets en dépenses.',
            button: 'Télécharger l’application',
        },
        signOutWarningTripInProgress: {title: 'Suivi GPS en cours', prompt: 'Voulez-vous vraiment abandonner le déplacement et vous déconnecter ?', confirm: 'Ignorer et se déconnecter'},
        notification: {title: 'Suivi GPS en cours', body: 'Aller dans l’application pour terminer'},
        locationServicesRequiredModal: {
            title: 'Accès à la localisation requis',
            confirm: 'Ouvrir les paramètres',
            prompt: 'Veuillez autoriser l’accès à la localisation dans les réglages de votre appareil pour lancer le suivi de distance GPS.',
        },
        fabGpsTripExplained: 'Aller à l’écran GPS (action flottante)',
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
