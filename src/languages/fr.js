"use strict";
var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2, _3, _4, _5, _6, _7, _8, _9, _10, _11, _12, _13;
Object.defineProperty(exports, "__esModule", { value: true });
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
var expensify_common_1 = require("expensify-common");
var startCase_1 = require("lodash/startCase");
var CONST_1 = require("@src/CONST");
/* eslint-disable max-len */
var translations = {
    common: {
        count: 'Compter',
        cancel: 'Annuler',
        dismiss: 'Ignorer',
        yes: 'Oui',
        no: 'No',
        ok: "D'accord",
        notNow: 'Pas maintenant',
        learnMore: 'En savoir plus.',
        buttonConfirm: 'Compris',
        name: 'Nom',
        attachment: 'Pièce jointe',
        attachments: 'Pièces jointes',
        center: 'Centre',
        from: 'De',
        to: 'À',
        in: 'Dans',
        optional: 'Optionnel',
        new: 'Nouveau',
        search: 'Rechercher',
        reports: 'Rapports',
        find: 'Trouver',
        searchWithThreeDots: 'Rechercher...',
        next: 'Suivant',
        previous: 'Précédent',
        goBack: 'Retourner',
        create: 'Créer',
        add: 'Ajouter',
        resend: 'Renvoyer',
        save: 'Enregistrer',
        select: 'Sélectionner',
        deselect: 'Désélectionner',
        selectMultiple: 'Sélectionner plusieurs',
        saveChanges: 'Enregistrer les modifications',
        submit: 'Soumettre',
        rotate: 'Pivoter',
        zoom: 'Zoom',
        password: 'Mot de passe',
        magicCode: 'Magic code',
        twoFactorCode: 'Code à deux facteurs',
        workspaces: 'Espaces de travail',
        success: 'Succ\u00E8s',
        inbox: 'Boîte de réception',
        group: 'Groupe',
        profile: 'Profil',
        referral: 'Parrainage',
        payments: 'Paiements',
        approvals: 'Approbations',
        wallet: 'Portefeuille',
        preferences: 'Préférences',
        view: 'Voir',
        review: function (reviewParams) { return "Review".concat((reviewParams === null || reviewParams === void 0 ? void 0 : reviewParams.amount) ? " ".concat(reviewParams === null || reviewParams === void 0 ? void 0 : reviewParams.amount) : ''); },
        not: 'Pas',
        signIn: 'Se connecter',
        signInWithGoogle: 'Se connecter avec Google',
        signInWithApple: 'Se connecter avec Apple',
        signInWith: 'Se connecter avec',
        continue: 'Continuer',
        firstName: 'Prénom',
        lastName: 'Nom de famille',
        scanning: 'Analyse en cours',
        addCardTermsOfService: "Conditions d'utilisation d'Expensify",
        perPerson: 'par personne',
        phone: 'Téléphone',
        phoneNumber: 'Numéro de téléphone',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'Email',
        and: 'et',
        or: 'ou',
        details: 'Détails',
        privacy: 'Confidentialité',
        privacyPolicy: 'Politique de confidentialité',
        hidden: 'Hidden',
        visible: 'Visible',
        delete: 'Supprimer',
        archived: 'archivé',
        contacts: 'Contacts',
        recents: 'Récents',
        close: 'Fermer',
        download: 'Télécharger',
        downloading: 'Téléchargement en cours',
        uploading: 'Téléchargement en cours',
        pin: 'Épingler',
        unPin: 'Détacher',
        back: 'Retour',
        saveAndContinue: 'Enregistrer et continuer',
        settings: 'Paramètres',
        termsOfService: "Conditions d'utilisation",
        members: 'Membres',
        invite: 'Inviter',
        here: 'ici',
        date: 'Date',
        dob: 'Date de naissance',
        currentYear: 'Année en cours',
        currentMonth: 'Mois en cours',
        ssnLast4: 'Les 4 derniers chiffres du SSN',
        ssnFull9: 'Les 9 chiffres complets du SSN',
        addressLine: function (_a) {
            var lineNumber = _a.lineNumber;
            return "Adresse ligne ".concat(lineNumber);
        },
        personalAddress: 'Adresse personnelle',
        companyAddress: "Adresse de l'entreprise",
        noPO: "Pas de boîtes postales ou d'adresses de dépôt de courrier, s'il vous plaît.",
        city: 'Ville',
        state: 'État',
        streetAddress: 'Adresse postale',
        stateOrProvince: 'État / Province',
        country: 'Pays',
        zip: 'Code postal',
        zipPostCode: 'Code postal',
        whatThis: "Qu'est-ce que c'est ?",
        iAcceptThe: "J'accepte le",
        remove: 'Supprimer',
        admin: 'Admin',
        owner: 'Propriétaire',
        dateFormat: 'YYYY-MM-DD',
        send: 'Envoyer',
        na: 'N/A',
        noResultsFound: 'Aucun résultat trouvé',
        noResultsFoundMatching: function (_a) {
            var searchString = _a.searchString;
            return "Aucun r\u00E9sultat trouv\u00E9 correspondant \u00E0 \"".concat(searchString, "\"");
        },
        recentDestinations: 'Destinations récentes',
        timePrefix: "C'est",
        conjunctionFor: 'pour',
        todayAt: "Aujourd'hui à",
        tomorrowAt: 'Demain à',
        yesterdayAt: 'Hier à',
        conjunctionAt: 'à',
        conjunctionTo: 'à',
        genericErrorMessage: "Oups... quelque chose s'est mal passé et votre demande n'a pas pu être complétée. Veuillez réessayer plus tard.",
        percentage: 'Pourcentage',
        error: {
            invalidAmount: 'Montant invalide',
            acceptTerms: "Vous devez accepter les Conditions d'utilisation pour continuer.",
            phoneNumber: "Veuillez entrer un num\u00E9ro de t\u00E9l\u00E9phone valide, avec l'indicatif du pays (par exemple, ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")"),
            fieldRequired: 'Ce champ est requis',
            requestModified: 'Cette demande est en cours de modification par un autre membre',
            characterLimitExceedCounter: function (_a) {
                var length = _a.length, limit = _a.limit;
                return "Limite de caract\u00E8res d\u00E9pass\u00E9 (".concat(length, "/").concat(limit, ")");
            },
            dateInvalid: 'Veuillez sélectionner une date valide',
            invalidDateShouldBeFuture: "Veuillez choisir aujourd'hui ou une date future",
            invalidTimeShouldBeFuture: 'Veuillez choisir une heure au moins une minute plus tard.',
            invalidCharacter: 'Caractère invalide',
            enterMerchant: 'Entrez un nom de commerçant',
            enterAmount: 'Entrez un montant',
            missingMerchantName: 'Nom du commerçant manquant',
            missingAmount: 'Montant manquant',
            missingDate: 'Date manquante',
            enterDate: 'Entrez une date',
            invalidTimeRange: 'Veuillez entrer une heure au format 12 heures (par exemple, 14h30)',
            pleaseCompleteForm: 'Veuillez remplir le formulaire ci-dessus pour continuer',
            pleaseSelectOne: 'Veuillez sélectionner une option ci-dessus',
            invalidRateError: 'Veuillez entrer un taux valide',
            lowRateError: 'Le taux doit être supérieur à 0',
            email: 'Veuillez entrer une adresse e-mail valide',
            login: "Une erreur s'est produite lors de la connexion. Veuillez réessayer.",
        },
        comma: 'virgule',
        semicolon: 'point-virgule',
        please: "S'il vous plaît",
        contactUs: 'contactez-nous',
        pleaseEnterEmailOrPhoneNumber: 'Veuillez entrer un e-mail ou un numéro de téléphone',
        fixTheErrors: 'corriger les erreurs',
        inTheFormBeforeContinuing: 'dans le formulaire avant de continuer',
        confirm: 'Confirmer',
        reset: 'Réinitialiser',
        done: 'Fait',
        more: 'Plus',
        debitCard: 'Carte de débit',
        bankAccount: 'Compte bancaire',
        personalBankAccount: 'Compte bancaire personnel',
        businessBankAccount: 'Compte bancaire professionnel',
        join: 'Rejoindre',
        leave: 'Quitter',
        decline: 'Refuser',
        transferBalance: 'Transférer le solde',
        cantFindAddress: 'Impossible de trouver votre adresse ?',
        enterManually: 'Entrez-le manuellement',
        message: 'Message',
        leaveThread: 'Quitter le fil de discussion',
        you: 'Vous',
        youAfterPreposition: 'vous',
        your: 'votre',
        conciergeHelp: "Veuillez contacter Concierge pour obtenir de l'aide.",
        youAppearToBeOffline: 'Vous semblez être hors ligne.',
        thisFeatureRequiresInternet: 'Cette fonctionnalité nécessite une connexion Internet active.',
        attachmentWillBeAvailableOnceBackOnline: 'La pièce jointe sera disponible une fois de retour en ligne.',
        errorOccurredWhileTryingToPlayVideo: "Une erreur s'est produite lors de la tentative de lecture de cette vidéo.",
        areYouSure: 'Êtes-vous sûr ?',
        verify: 'Vérifier',
        yesContinue: 'Oui, continuez',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: function (_a) {
            var zipSampleFormat = _a.zipSampleFormat;
            return (zipSampleFormat ? "e.g. ".concat(zipSampleFormat) : '');
        },
        description: 'Description',
        title: 'Titre',
        assignee: 'Cessionnaire',
        createdBy: 'Créé par',
        with: 'avec',
        shareCode: 'Partager le code',
        share: 'Partager',
        per: 'par',
        mi: 'mile',
        km: 'kilomètre',
        copied: 'Copié !',
        someone: "Quelqu'un",
        total: 'Total',
        edit: 'Modifier',
        letsDoThis: "Allons-y !",
        letsStart: "Commen\u00E7ons",
        showMore: 'Afficher plus',
        merchant: 'Marchand',
        category: 'Catégorie',
        report: 'Rapport',
        billable: 'Facturable',
        nonBillable: 'Non-facturable',
        tag: 'Tag',
        receipt: 'Reçu',
        verified: 'Vérifié',
        replace: 'Remplacer',
        distance: 'Distance',
        mile: 'mile',
        miles: 'miles',
        kilometer: 'kilomètre',
        kilometers: 'kilomètres',
        recent: 'Récent',
        all: 'Tous',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: 'Sélectionnez une devise',
        card: 'Carte',
        whyDoWeAskForThis: 'Pourquoi demandons-nous cela ?',
        required: 'Requis',
        showing: 'Affichage',
        of: 'de',
        default: 'Par défaut',
        update: 'Mettre à jour',
        member: 'Membre',
        auditor: 'Auditeur',
        role: 'Rôle',
        currency: 'Devise',
        rate: 'Taux',
        emptyLHN: {
            title: 'Youpi ! Tout est à jour.',
            subtitleText1: 'Trouver un chat en utilisant le',
            subtitleText2: 'bouton ci-dessus, ou créez quelque chose en utilisant le',
            subtitleText3: 'bouton ci-dessous.',
        },
        businessName: "Nom de l'entreprise",
        clear: 'Effacer',
        type: 'Type',
        action: 'Action',
        expenses: 'Dépenses',
        tax: 'Taxe',
        shared: 'Partagé',
        drafts: 'Brouillons',
        finished: 'Terminé',
        upgrade: 'Mise à niveau',
        downgradeWorkspace: "Rétrograder l'espace de travail",
        companyID: "ID de l'entreprise",
        userID: 'ID utilisateur',
        disable: 'Désactiver',
        export: 'Exportation',
        initialValue: 'Valeur initiale',
        currentDate: 'Current date',
        value: 'Valeur',
        downloadFailedTitle: 'Échec du téléchargement',
        downloadFailedDescription: "Votre téléchargement n'a pas pu être terminé. Veuillez réessayer plus tard.",
        filterLogs: 'Filtrer les journaux',
        network: 'Réseau',
        reportID: 'ID du rapport',
        longID: 'ID long',
        bankAccounts: 'Comptes bancaires',
        chooseFile: 'Choisir un fichier',
        chooseFiles: 'Choisir des fichiers',
        dropTitle: 'Laisse tomber',
        dropMessage: 'Déposez votre fichier ici',
        ignore: 'Ignore',
        enabled: 'Activé',
        disabled: 'Désactivé',
        import: 'Importation',
        offlinePrompt: 'Vous ne pouvez pas effectuer cette action pour le moment.',
        outstanding: 'Exceptionnel',
        chats: 'Chats',
        tasks: 'Tâches',
        unread: 'Non lu',
        sent: 'Envoyé',
        links: 'Liens',
        days: 'jours',
        rename: 'Renommer',
        address: 'Adresse',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Passer',
        chatWithAccountManager: function (_a) {
            var accountManagerDisplayName = _a.accountManagerDisplayName;
            return "Besoin de quelque chose de sp\u00E9cifique ? Discutez avec votre gestionnaire de compte, ".concat(accountManagerDisplayName, ".");
        },
        chatNow: 'Discuter maintenant',
        workEmail: 'Email professionnel',
        destination: 'Destination',
        subrate: 'Subrate',
        perDiem: 'Per diem',
        validate: 'Valider',
        downloadAsPDF: 'Télécharger en PDF',
        downloadAsCSV: 'Télécharger en CSV',
        help: 'Aide',
        expenseReports: 'Rapports de dépenses',
        rateOutOfPolicy: 'Évaluer hors politique',
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
        on: 'On',
        before: 'Avant',
        after: 'Après',
        reschedule: 'Reprogrammer',
        general: 'Général',
        workspacesTabTitle: 'Espaces de travail',
        getTheApp: "Obtenez l'application",
        scanReceiptsOnTheGo: 'Numérisez les reçus depuis votre téléphone',
        headsUp: 'Attention !',
    },
    supportalNoAccess: {
        title: 'Pas si vite',
        description: "Vous n'êtes pas autorisé à effectuer cette action lorsque le support est connecté.",
    },
    lockedAccount: {
        title: 'Compte verrouillé',
        description: "Vous n'êtes pas autorisé à effectuer cette action car ce compte a été verrouillé. Veuillez contacter concierge@expensify.com pour les prochaines étapes.",
    },
    location: {
        useCurrent: 'Utiliser la position actuelle',
        notFound: "Nous n'avons pas pu trouver votre emplacement. Veuillez réessayer ou entrer une adresse manuellement.",
        permissionDenied: "Il semble que vous ayez refusé l'accès à votre localisation.",
        please: "S'il vous plaît",
        allowPermission: "autoriser l'accès à la localisation dans les paramètres",
        tryAgain: 'et réessayez.',
    },
    contact: {
        importContacts: 'Importer des contacts',
        importContactsTitle: 'Importer vos contacts',
        importContactsText: 'Importez les contacts de votre téléphone pour que vos personnes préférées soient toujours à portée de main.',
        importContactsExplanation: 'pour que vos personnes préférées soient toujours à portée de main.',
        importContactsNativeText: 'Encore une étape ! Donnez-nous le feu vert pour importer vos contacts.',
    },
    anonymousReportFooter: {
        logoTagline: 'Rejoignez la discussion.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Accès à la caméra',
        expensifyDoesNotHaveAccessToCamera: 'Expensify ne peut pas prendre de photos sans accès à votre appareil photo. Appuyez sur paramètres pour mettre à jour les autorisations.',
        attachmentError: 'Erreur de pièce jointe',
        errorWhileSelectingAttachment: "Une erreur s'est produite lors de la sélection d'une pièce jointe. Veuillez réessayer.",
        errorWhileSelectingCorruptedAttachment: "Une erreur s'est produite lors de la sélection d'une pièce jointe corrompue. Veuillez essayer un autre fichier.",
        takePhoto: 'Prendre une photo',
        chooseFromGallery: 'Choisir depuis la galerie',
        chooseDocument: 'Choisir un fichier',
        attachmentTooLarge: 'La pièce jointe est trop volumineuse',
        sizeExceeded: 'La taille de la pièce jointe dépasse la limite de 24 Mo',
        sizeExceededWithLimit: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "La taille de la pi\u00E8ce jointe d\u00E9passe la limite de ".concat(maxUploadSizeInMB, " Mo");
        },
        attachmentTooSmall: 'La pièce jointe est trop petite',
        sizeNotMet: 'La taille de la pièce jointe doit être supérieure à 240 octets',
        wrongFileType: 'Type de fichier invalide',
        notAllowedExtension: "Ce type de fichier n'est pas autorisé. Veuillez essayer un autre type de fichier.",
        folderNotAllowedMessage: "Le téléchargement d'un dossier n'est pas autorisé. Veuillez essayer un autre fichier.",
        protectedPDFNotSupported: 'Les PDF protégés par mot de passe ne sont pas pris en charge',
        attachmentImageResized: "Cette image a été redimensionnée pour l'aperçu. Téléchargez pour la pleine résolution.",
        attachmentImageTooLarge: 'Cette image est trop grande pour être prévisualisée avant le téléchargement.',
        tooManyFiles: function (_a) {
            var fileLimit = _a.fileLimit;
            return "Vous pouvez t\u00E9l\u00E9charger jusqu'\u00E0 ".concat(fileLimit, " fichiers \u00E0 la fois.");
        },
        sizeExceededWithValue: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "Les fichiers d\u00E9passent ".concat(maxUploadSizeInMB, " MB. Veuillez r\u00E9essayer.");
        },
        someFilesCantBeUploaded: 'Certains fichiers ne peuvent pas être téléchargés',
        sizeLimitExceeded: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "Les fichiers doivent faire moins de ".concat(maxUploadSizeInMB, " MB. Les fichiers plus volumineux ne seront pas t\u00E9l\u00E9charg\u00E9s.");
        },
        maxFileLimitExceeded: "Vous pouvez télécharger jusqu'à 30 reçus à la fois. Les fichiers supplémentaires ne seront pas téléchargés.",
        unsupportedFileType: function (_a) {
            var fileType = _a.fileType;
            return "Les fichiers ".concat(fileType, " ne sont pas pris en charge. Seuls les types de fichiers pris en charge seront t\u00E9l\u00E9charg\u00E9s.");
        },
        learnMoreAboutSupportedFiles: 'En savoir plus sur les formats pris en charge.',
        passwordProtected: 'Les PDF protégés par mot de passe ne sont pas pris en charge. Seuls les fichiers pris en charge seront téléchargés.',
    },
    dropzone: {
        addAttachments: 'Ajouter des pièces jointes',
        scanReceipts: 'Scanner les reçus',
        replaceReceipt: 'Remplacer le reçu',
    },
    filePicker: {
        fileError: 'Erreur de fichier',
        errorWhileSelectingFile: "Une erreur s'est produite lors de la sélection d'un fichier. Veuillez réessayer.",
    },
    connectionComplete: {
        title: 'Connexion terminée',
        supportingText: "Vous pouvez fermer cette fenêtre et retourner à l'application Expensify.",
    },
    avatarCropModal: {
        title: 'Modifier la photo',
        description: 'Faites glisser, zoomez et faites pivoter votre image comme vous le souhaitez.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Aucune extension trouvée pour le type MIME',
        problemGettingImageYouPasted: "Un problème est survenu lors de l'obtention de l'image que vous avez collée.",
        commentExceededMaxLength: function (_a) {
            var formattedMaxLength = _a.formattedMaxLength;
            return "La longueur maximale du commentaire est de ".concat(formattedMaxLength, " caract\u00E8res.");
        },
        taskTitleExceededMaxLength: function (_a) {
            var formattedMaxLength = _a.formattedMaxLength;
            return "La longueur maximale du titre de la t\u00E2che est de ".concat(formattedMaxLength, " caract\u00E8res.");
        },
    },
    baseUpdateAppModal: {
        updateApp: "Mettre à jour l'application",
        updatePrompt: "Une nouvelle version de cette application est disponible.  \nMettez à jour maintenant ou redémarrez l'application plus tard pour télécharger les dernières modifications.",
    },
    deeplinkWrapper: {
        launching: "Lancement d'Expensify",
        expired: 'Votre session a expiré.',
        signIn: 'Veuillez vous reconnecter.',
        redirectedToDesktopApp: "Nous vous avons redirigé vers l'application de bureau.",
        youCanAlso: 'Vous pouvez également',
        openLinkInBrowser: 'ouvrez ce lien dans votre navigateur',
        loggedInAs: function (_a) {
            var email = _a.email;
            return "Vous \u00EAtes connect\u00E9 en tant que ".concat(email, ". Cliquez sur \"Ouvrir le lien\" dans l'invite pour vous connecter \u00E0 l'application de bureau avec ce compte.");
        },
        doNotSeePrompt: "Impossible de voir l'invite ?",
        tryAgain: 'Réessayez',
        or: ', ou',
        continueInWeb: "continuer vers l'application web",
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abracadabra, vous êtes connecté !',
        successfulSignInDescription: "Retournez à votre onglet d'origine pour continuer.",
        title: 'Voici votre code magique',
        description: "Veuillez entrer le code depuis l'appareil où il a été initialement demandé.",
        doNotShare: 'Ne partagez votre code avec personne. Expensify ne vous le demandera jamais !',
        or: ', ou',
        signInHere: 'connectez-vous ici',
        expiredCodeTitle: 'Code magique expiré',
        expiredCodeDescription: "Revenez à l'appareil d'origine et demandez un nouveau code",
        successfulNewCodeRequest: 'Code demandé. Veuillez vérifier votre appareil.',
        tfaRequiredTitle: 'Authentification à deux facteurs\nrequise',
        tfaRequiredDescription: "Veuillez entrer le code d'authentification à deux facteurs\nlà où vous essayez de vous connecter.",
        requestOneHere: 'demandez-en un ici.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Payé par',
        whatsItFor: 'À quoi ça sert ?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Nom, e-mail ou numéro de téléphone',
        findMember: 'Trouver un membre',
        searchForSomeone: "Rechercher quelqu'un",
    },
    emptyList: (_a = {},
        _a[CONST_1.default.IOU.TYPE.CREATE] = {
            title: 'Soumettre une dépense, référer votre patron',
            subtitleText: 'Vous voulez que votre patron utilise Expensify aussi ? Soumettez-lui simplement une dépense et nous nous occuperons du reste.',
        },
        _a),
    videoChatButtonAndMenu: {
        tooltip: 'Réserver un appel',
    },
    hello: 'Bonjour',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Commencez ci-dessous.',
        anotherLoginPageIsOpen: 'Une autre page de connexion est ouverte.',
        anotherLoginPageIsOpenExplanation: 'Vous avez ouvert la page de connexion dans un onglet séparé. Veuillez vous connecter depuis cet onglet.',
        welcome: 'Bienvenue !',
        welcomeWithoutExclamation: 'Bienvenue',
        phrase2: "L'argent parle. Et maintenant que la messagerie et les paiements sont au même endroit, c'est aussi facile.",
        phrase3: 'Vos paiements vous parviennent aussi rapidement que vous pouvez faire passer votre message.',
        enterPassword: 'Veuillez entrer votre mot de passe',
        welcomeNewFace: function (_a) {
            var login = _a.login;
            return "".concat(login, ", c'est toujours un plaisir de voir un nouveau visage ici !");
        },
        welcomeEnterMagicCode: function (_a) {
            var login = _a.login;
            return "Veuillez entrer le code magique envoy\u00E9 \u00E0 ".concat(login, ". Il devrait arriver dans une minute ou deux.");
        },
    },
    login: {
        hero: {
            header: 'Voyage et dépenses, à la vitesse du chat',
            body: "Bienvenue dans la nouvelle génération d'Expensify, où vos voyages et dépenses se déplacent plus rapidement grâce à un chat contextuel et en temps réel.",
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: function (_a) {
            var email = _a.email;
            return "Vous \u00EAtes d\u00E9j\u00E0 connect\u00E9 en tant que ".concat(email, ".");
        },
        goBackMessage: function (_a) {
            var provider = _a.provider;
            return "Vous ne voulez pas vous connecter avec ".concat(provider, " ?");
        },
        continueWithMyCurrentSession: 'Continuer avec ma session actuelle',
        redirectToDesktopMessage: "Nous vous redirigerons vers l'application de bureau une fois que vous aurez terminé de vous connecter.",
        signInAgreementMessage: 'En vous connectant, vous acceptez les',
        termsOfService: "Conditions d'utilisation",
        privacy: 'Confidentialité',
    },
    samlSignIn: {
        welcomeSAMLEnabled: "Continuez à vous connecter avec l'authentification unique :",
        orContinueWithMagicCode: 'Vous pouvez également vous connecter avec un code magique.',
        useSingleSignOn: 'Utiliser la connexion unique',
        useMagicCode: 'Utilisez le code magique',
        launching: 'Lancement...',
        oneMoment: 'Un instant pendant que nous vous redirigeons vers le portail de connexion unique de votre entreprise.',
    },
    reportActionCompose: {
        dropToUpload: 'Déposer pour télécharger',
        sendAttachment: 'Envoyer la pièce jointe',
        addAttachment: 'Ajouter une pièce jointe',
        writeSomething: 'Écrivez quelque chose...',
        blockedFromConcierge: 'La communication est interdite',
        fileUploadFailed: "Échec du téléchargement. Le fichier n'est pas pris en charge.",
        localTime: function (_a) {
            var user = _a.user, time = _a.time;
            return "Il est ".concat(time, " pour ").concat(user);
        },
        edited: '(édité)',
        emoji: 'Emoji',
        collapse: 'Réduire',
        expand: 'Développer',
    },
    reportActionContextMenu: {
        copyToClipboard: 'Copier dans le presse-papiers',
        copied: 'Copié !',
        copyLink: 'Copier le lien',
        copyURLToClipboard: "Copier l'URL dans le presse-papiers",
        copyEmailToClipboard: "Copier l'email dans le presse-papiers",
        markAsUnread: 'Marquer comme non lu',
        markAsRead: 'Marquer comme lu',
        editAction: function (_a) {
            var action = _a.action;
            return "Editer ".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? 'dépense' : 'commentaire');
        },
        deleteAction: function (_a) {
            var action = _a.action;
            return "Supprimer ".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? 'dépense' : 'commentaire');
        },
        deleteConfirmation: function (_a) {
            var action = _a.action;
            return "\u00CAtes-vous s\u00FBr de vouloir supprimer ce ".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? 'dépense' : 'commentaire', " ?");
        },
        onlyVisible: 'Visible uniquement pour',
        replyInThread: 'Répondre dans le fil de discussion',
        joinThread: 'Rejoindre le fil de discussion',
        leaveThread: 'Quitter le fil de discussion',
        copyOnyxData: 'Copier les données Onyx',
        flagAsOffensive: 'Signaler comme offensant',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Ajouter une réaction',
        reactedWith: 'a réagi avec',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: 'Vous avez manqué la fête à',
        beginningOfArchivedRoomPartTwo: ", il n'y a rien à voir ici.",
        beginningOfChatHistoryDomainRoomPartOne: function (_a) {
            var domainRoom = _a.domainRoom;
            return "Cette discussion est avec tous les membres d'Expensify sur le domaine ".concat(domainRoom, ".");
        },
        beginningOfChatHistoryDomainRoomPartTwo: 'Utilisez-le pour discuter avec des collègues, partager des conseils et poser des questions.',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'Ce chat est avec',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: function (_a) {
            var workspaceName = _a.workspaceName;
            return " ".concat(workspaceName, " ");
        },
        beginningOfChatHistoryAdminRoomPartTwo: "Utilisez-le pour discuter de l'installation de l'espace de travail et plus encore.",
        beginningOfChatHistoryAnnounceRoomPartOne: function (_a) {
            var workspaceName = _a.workspaceName;
            return "Cette discussion est avec tout le monde dans ".concat(workspaceName, ".");
        },
        beginningOfChatHistoryAnnounceRoomPartTwo: "Utilisez-le pour les annonces les plus importantes.",
        beginningOfChatHistoryUserRoomPartOne: 'Ce salon de discussion est pour tout.',
        beginningOfChatHistoryUserRoomPartTwo: 'related.',
        beginningOfChatHistoryInvoiceRoomPartOne: "Ce chat est pour les factures entre",
        beginningOfChatHistoryInvoiceRoomPartTwo: ". Utilisez le bouton + pour envoyer une facture.",
        beginningOfChatHistory: 'Ce chat est avec',
        beginningOfChatHistoryPolicyExpenseChatPartOne: "C'est ici que",
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'va soumettre des dépenses à',
        beginningOfChatHistoryPolicyExpenseChatPartThree: ". Il suffit d'utiliser le bouton +.",
        beginningOfChatHistorySelfDM: "C'est votre espace personnel. Utilisez-le pour des notes, des tâches, des brouillons et des rappels.",
        beginningOfChatHistorySystemDM: 'Bienvenue ! Commençons votre configuration.',
        chatWithAccountManager: 'Discutez avec votre gestionnaire de compte ici',
        sayHello: 'Dites bonjour !',
        yourSpace: 'Votre espace',
        welcomeToRoom: function (_a) {
            var roomName = _a.roomName;
            return "Bienvenue dans ".concat(roomName, " !");
        },
        usePlusButton: function (_a) {
            var additionalText = _a.additionalText;
            return "Utilisez le bouton + pour ".concat(additionalText, " une d\u00E9pense.");
        },
        askConcierge: 'Posez des questions et obtenez une assistance en temps réel 24h/24 et 7j/7.',
        conciergeSupport: 'Support 24h/24 et 7j/7',
        create: 'créer',
        iouTypes: {
            pay: 'payer',
            split: 'split',
            submit: 'soumettre',
            track: 'suivre',
            invoice: 'facture',
        },
    },
    adminOnlyCanPost: 'Seuls les administrateurs peuvent envoyer des messages dans cette salle.',
    reportAction: {
        asCopilot: 'en tant que copilote pour',
    },
    mentionSuggestions: {
        hereAlternateText: 'Notifier tout le monde dans cette conversation',
    },
    newMessages: 'Nouveaux messages',
    youHaveBeenBanned: 'Remarque : Vous avez été banni de la discussion dans ce canal.',
    reportTypingIndicator: {
        isTyping: 'est en train de taper...',
        areTyping: "sont en train d'écrire...",
        multipleMembers: 'Plusieurs membres',
    },
    reportArchiveReasons: (_b = {},
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.DEFAULT] = 'Cette salle de chat a été archivée.',
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED] = function (_a) {
            var displayName = _a.displayName;
            return "Ce chat n'est plus actif car ".concat(displayName, " a ferm\u00E9 son compte.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED] = function (_a) {
            var displayName = _a.displayName, oldDisplayName = _a.oldDisplayName;
            return "Ce chat n'est plus actif car ".concat(oldDisplayName, " a fusionn\u00E9 son compte avec ").concat(displayName, ".");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY] = function (_a) {
            var displayName = _a.displayName, policyName = _a.policyName, _b = _a.shouldUseYou, shouldUseYou = _b === void 0 ? false : _b;
            return shouldUseYou
                ? "Ce chat n'est plus actif car <strong>vous</strong> n'\u00EAtes plus membre de l'espace de travail ".concat(policyName, ".")
                : "Ce chat n'est plus actif car ".concat(displayName, " n'est plus membre de l'espace de travail ").concat(policyName, ".");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.POLICY_DELETED] = function (_a) {
            var policyName = _a.policyName;
            return "Ce chat n'est plus actif car ".concat(policyName, " n'est plus un espace de travail actif.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED] = function (_a) {
            var policyName = _a.policyName;
            return "Ce chat n'est plus actif car ".concat(policyName, " n'est plus un espace de travail actif.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED] = 'Cette réservation est archivée.',
        _b),
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
        fabNewChatExplained: 'Démarrer la discussion (Action flottante)',
        chatPinned: 'Discussion épinglée',
        draftedMessage: 'Message rédigé',
        listOfChatMessages: 'Liste des messages de chat',
        listOfChats: 'Liste des discussions',
        saveTheWorld: 'Sauver le monde',
        tooltip: 'Commencez ici !',
        redirectToExpensifyClassicModal: {
            title: 'À venir bientôt',
            description: "Nous peaufinons encore quelques éléments de New Expensify pour s'adapter à votre configuration spécifique. En attendant, rendez-vous sur Expensify Classic.",
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
    },
    spreadsheet: {
        upload: 'Télécharger une feuille de calcul',
        dragAndDrop: 'Faites glisser et déposez votre feuille de calcul ici, ou choisissez un fichier ci-dessous. Formats pris en charge : .csv, .txt, .xls et .xlsx.',
        chooseSpreadsheet: 'Sélectionnez un fichier de feuille de calcul à importer. Formats pris en charge : .csv, .txt, .xls et .xlsx.',
        fileContainsHeader: 'Le fichier contient des en-têtes de colonnes',
        column: function (_a) {
            var name = _a.name;
            return "Colonne ".concat(name);
        },
        fieldNotMapped: function (_a) {
            var fieldName = _a.fieldName;
            return "Oups ! Un champ requis (\u00AB ".concat(fieldName, " \u00BB) n'a pas \u00E9t\u00E9 mapp\u00E9. Veuillez v\u00E9rifier et r\u00E9essayer.");
        },
        singleFieldMultipleColumns: function (_a) {
            var fieldName = _a.fieldName;
            return "Oups ! Vous avez associ\u00E9 un seul champ (\"".concat(fieldName, "\") \u00E0 plusieurs colonnes. Veuillez v\u00E9rifier et r\u00E9essayer.");
        },
        emptyMappedField: function (_a) {
            var fieldName = _a.fieldName;
            return "Oups ! Le champ (\u00AB ".concat(fieldName, " \u00BB) contient une ou plusieurs valeurs vides. Veuillez v\u00E9rifier et r\u00E9essayer.");
        },
        importSuccessfulTitle: 'Importation réussie',
        importCategoriesSuccessfulDescription: function (_a) {
            var categories = _a.categories;
            return (categories > 1 ? "".concat(categories, " cat\u00E9gories ont \u00E9t\u00E9 ajout\u00E9es.") : '1 catégorie a été ajoutée.');
        },
        importMembersSuccessfulDescription: function (_a) {
            var added = _a.added, updated = _a.updated;
            if (!added && !updated) {
                return "Aucun membre n'a été ajouté ou mis à jour.";
            }
            if (added && updated) {
                return "".concat(added, " membre").concat(added > 1 ? 's' : '', " ajout\u00E9, ").concat(updated, " membre").concat(updated > 1 ? 's' : '', " mis \u00E0 jour.");
            }
            if (updated) {
                return updated > 1 ? "".concat(updated, " membres ont \u00E9t\u00E9 mis \u00E0 jour.") : '1 membre a été mis à jour.';
            }
            return added > 1 ? "".concat(added, " membres ont \u00E9t\u00E9 ajout\u00E9s.") : '1 membre a été ajouté.';
        },
        importTagsSuccessfulDescription: function (_a) {
            var tags = _a.tags;
            return (tags > 1 ? "".concat(tags, " tags ont \u00E9t\u00E9 ajout\u00E9s.") : '1 tag a été ajouté.');
        },
        importMultiLevelTagsSuccessfulDescription: 'Des balises multi-niveaux ont été ajoutées.',
        importPerDiemRatesSuccessfulDescription: function (_a) {
            var rates = _a.rates;
            return rates > 1 ? "".concat(rates, " taux journaliers ont \u00E9t\u00E9 ajout\u00E9s.") : '1 taux de per diem a été ajouté.';
        },
        importFailedTitle: "Échec de l'importation",
        importFailedDescription: 'Veuillez vous assurer que tous les champs sont correctement remplis et réessayez. Si le problème persiste, veuillez contacter Concierge.',
        importDescription: 'Choisissez les champs à mapper depuis votre feuille de calcul en cliquant sur le menu déroulant à côté de chaque colonne importée ci-dessous.',
        sizeNotMet: 'La taille du fichier doit être supérieure à 0 octet',
        invalidFileMessage: 'Le fichier que vous avez téléchargé est soit vide, soit contient des données invalides. Veuillez vous assurer que le fichier est correctement formaté et contient les informations nécessaires avant de le télécharger à nouveau.',
        importSpreadsheet: 'Importer une feuille de calcul',
        downloadCSV: 'Télécharger CSV',
    },
    receipt: {
        upload: 'Télécharger le reçu',
        uploadMultiple: 'Télécharger des reçus',
        dragReceiptBeforeEmail: 'Faites glisser un reçu sur cette page, transférez un reçu à',
        dragReceiptsBeforeEmail: 'Faites glisser des reçus sur cette page, transférez des reçus à',
        dragReceiptAfterEmail: 'ou choisissez un fichier à télécharger ci-dessous.',
        dragReceiptsAfterEmail: 'ou choisissez des fichiers à télécharger ci-dessous.',
        chooseReceipt: 'Choisissez un reçu à télécharger ou transférez un reçu à',
        chooseReceipts: 'Choisissez des reçus à télécharger ou transférez des reçus à',
        takePhoto: 'Prendre une photo',
        cameraAccess: "L'accès à la caméra est requis pour prendre des photos des reçus.",
        deniedCameraAccess: "L'accès à la caméra n'a toujours pas été accordé, veuillez suivre",
        deniedCameraAccessInstructions: 'ces instructions',
        cameraErrorTitle: 'Erreur de caméra',
        cameraErrorMessage: "Une erreur s'est produite lors de la prise de la photo. Veuillez réessayer.",
        locationAccessTitle: "Autoriser l'accès à la localisation",
        locationAccessMessage: "L'accès à la localisation nous aide à garder votre fuseau horaire et votre devise précis où que vous alliez.",
        locationErrorTitle: "Autoriser l'accès à la localisation",
        locationErrorMessage: "L'accès à la localisation nous aide à garder votre fuseau horaire et votre devise précis où que vous alliez.",
        allowLocationFromSetting: "L'acc\u00E8s \u00E0 la localisation nous aide \u00E0 garder votre fuseau horaire et votre devise pr\u00E9cis o\u00F9 que vous alliez. Veuillez autoriser l'acc\u00E8s \u00E0 la localisation dans les param\u00E8tres de permission de votre appareil.",
        dropTitle: 'Laisse tomber',
        dropMessage: 'Déposez votre fichier ici',
        flash: 'flash',
        multiScan: 'multi-scan',
        shutter: 'obturateur',
        gallery: 'galerie',
        deleteReceipt: 'Supprimer le reçu',
        deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer ce reçu ?',
        addReceipt: 'Ajouter un reçu',
        scanFailed: 'Le reçu n’a pas pu être scanné, car il manque le commerçant, la date ou le montant.',
    },
    quickAction: {
        scanReceipt: 'Scanner le reçu',
        recordDistance: 'Suivre la distance',
        requestMoney: 'Créer une dépense',
        perDiem: 'Créer un per diem',
        splitBill: 'Fractionner la dépense',
        splitScan: 'Diviser le reçu',
        splitDistance: 'Diviser la distance',
        paySomeone: function (_a) {
            var _b = _a === void 0 ? {} : _a, name = _b.name;
            return "Payer ".concat(name !== null && name !== void 0 ? name : "quelqu'un");
        },
        assignTask: 'Attribuer une tâche',
        header: 'Action rapide',
        noLongerHaveReportAccess: "Vous n'avez plus accès à votre destination d'action rapide précédente. Choisissez-en une nouvelle ci-dessous.",
        updateDestination: 'Mettre à jour la destination',
        createReport: 'Créer un rapport',
    },
    iou: {
        amount: 'Montant',
        taxAmount: 'Montant de la taxe',
        taxRate: "Taux d'imposition",
        approve: function (_a) {
            var _b = _a === void 0 ? {} : _a, formattedAmount = _b.formattedAmount;
            return (formattedAmount ? "Approuver ".concat(formattedAmount) : 'Approuver');
        },
        approved: 'Approuvé',
        cash: 'Espèces',
        card: 'Carte',
        original: 'Original',
        split: 'Diviser',
        splitExpense: 'Fractionner la dépense',
        splitExpenseSubtitle: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "".concat(amount, " de ").concat(merchant);
        },
        addSplit: 'Ajouter une répartition',
        totalAmountGreaterThanOriginal: function (_a) {
            var amount = _a.amount;
            return "Le montant total est de ".concat(amount, " sup\u00E9rieur \u00E0 la d\u00E9pense initiale.");
        },
        totalAmountLessThanOriginal: function (_a) {
            var amount = _a.amount;
            return "Le montant total est de ".concat(amount, " inf\u00E9rieur \u00E0 la d\u00E9pense originale.");
        },
        splitExpenseZeroAmount: 'Veuillez entrer un montant valide avant de continuer.',
        splitExpenseEditTitle: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "Modifier ".concat(amount, " pour ").concat(merchant);
        },
        removeSplit: 'Supprimer la division',
        paySomeone: function (_a) {
            var _b = _a === void 0 ? {} : _a, name = _b.name;
            return "Payer ".concat(name !== null && name !== void 0 ? name : "quelqu'un");
        },
        expense: 'Dépense',
        categorize: 'Catégoriser',
        share: 'Partager',
        participants: 'Participants',
        createExpense: 'Créer une dépense',
        trackDistance: 'Suivre la distance',
        createExpenses: function (_a) {
            var expensesNumber = _a.expensesNumber;
            return "Cr\u00E9er ".concat(expensesNumber, " d\u00E9penses");
        },
        addExpense: 'Ajouter une dépense',
        chooseRecipient: 'Choisir le destinataire',
        createExpenseWithAmount: function (_a) {
            var amount = _a.amount;
            return "Cr\u00E9er une d\u00E9pense de ".concat(amount);
        },
        confirmDetails: 'Confirmer les détails',
        pay: 'Payer',
        cancelPayment: 'Annuler le paiement',
        cancelPaymentConfirmation: 'Êtes-vous sûr de vouloir annuler ce paiement ?',
        viewDetails: 'Voir les détails',
        pending: 'En attente',
        canceled: 'Annulé',
        posted: 'Publié',
        deleteReceipt: 'Supprimer le reçu',
        deletedTransaction: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "supprim\u00E9 une d\u00E9pense sur ce rapport, ".concat(merchant, " - ").concat(amount);
        },
        movedFromReport: function (_a) {
            var reportName = _a.reportName;
            return "a d\u00E9plac\u00E9 une d\u00E9pense".concat(reportName ? "de ".concat(reportName) : '');
        },
        movedTransaction: function (_a) {
            var reportUrl = _a.reportUrl, reportName = _a.reportName;
            return "d\u00E9plac\u00E9 cette d\u00E9pense".concat(reportName ? "\u00E0 <a href=\"".concat(reportUrl, "\">").concat(reportName, "</a>") : '');
        },
        unreportedTransaction: 'déplacé cette dépense vers votre espace personnel',
        pendingMatchWithCreditCard: 'Reçu en attente de correspondance avec la transaction par carte',
        pendingMatch: 'Correspondance en attente',
        pendingMatchWithCreditCardDescription: 'Reçu en attente de correspondance avec une transaction par carte. Marquer comme espèce pour annuler.',
        markAsCash: 'Marquer comme espèces',
        routePending: 'Itinéraire en attente...',
        receiptScanning: function () { return ({
            one: 'Numérisation du reçu...',
            other: 'Numérisation des reçus...',
        }); },
        scanMultipleReceipts: 'Scanner plusieurs reçus',
        scanMultipleReceiptsDescription: "Prenez des photos de tous vos reçus en une seule fois, puis confirmez les détails vous-même ou laissez SmartScan s'en charger.",
        receiptScanInProgress: 'Numérisation du reçu en cours',
        receiptScanInProgressDescription: 'Numérisation du reçu en cours. Revenez plus tard ou saisissez les détails maintenant.',
        duplicateTransaction: function (_a) {
            var isSubmitted = _a.isSubmitted;
            return !isSubmitted
                ? 'Dépenses potentiellement en double identifiées. Vérifiez les doublons pour permettre la soumission.'
                : "Dépenses potentiellement dupliquées identifiées. Vérifiez les doublons pour permettre l'approbation.";
        },
        receiptIssuesFound: function () { return ({
            one: 'Problème trouvé',
            other: 'Problèmes trouvés',
        }); },
        fieldPending: 'En attente...',
        defaultRate: 'Taux par défaut',
        receiptMissingDetails: 'Reçu manquant de détails',
        missingAmount: 'Montant manquant',
        missingMerchant: 'Marchand manquant',
        receiptStatusTitle: 'Analyse en cours…',
        receiptStatusText: "Vous seul pouvez voir ce reçu lorsqu'il est en cours de numérisation. Revenez plus tard ou saisissez les détails maintenant.",
        receiptScanningFailed: "L'analyse du reçu a échoué. Veuillez entrer les détails manuellement.",
        transactionPendingDescription: 'Transaction en attente. Cela peut prendre quelques jours pour être affiché.',
        companyInfo: "Informations sur l'entreprise",
        companyInfoDescription: 'Nous avons besoin de quelques détails supplémentaires avant que vous puissiez envoyer votre première facture.',
        yourCompanyName: 'Nom de votre entreprise',
        yourCompanyWebsite: 'Le site web de votre entreprise',
        yourCompanyWebsiteNote: "Si vous n'avez pas de site web, vous pouvez fournir à la place le profil LinkedIn ou le profil de réseaux sociaux de votre entreprise.",
        invalidDomainError: 'Vous avez saisi un domaine invalide. Pour continuer, veuillez entrer un domaine valide.',
        publicDomainError: 'Vous êtes entré dans un domaine public. Pour continuer, veuillez entrer un domaine privé.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: function (_a) {
            var _b = _a.scanningReceipts, scanningReceipts = _b === void 0 ? 0 : _b, _c = _a.pendingReceipts, pendingReceipts = _c === void 0 ? 0 : _c;
            var statusText = [];
            if (scanningReceipts > 0) {
                statusText.push("".concat(scanningReceipts, " num\u00E9risation"));
            }
            if (pendingReceipts > 0) {
                statusText.push("".concat(pendingReceipts, " en attente"));
            }
            return {
                one: statusText.length > 0 ? "1 d\u00E9pense (".concat(statusText.join(', '), ")") : "1 d\u00E9pense",
                other: function (count) { return (statusText.length > 0 ? "".concat(count, " d\u00E9penses (").concat(statusText.join(', '), ")") : "".concat(count, " d\u00E9penses")); },
            };
        },
        expenseCount: function () {
            return {
                one: '1 dépense',
                other: function (count) { return "".concat(count, " d\u00E9penses"); },
            };
        },
        deleteExpense: function () { return ({
            one: 'Supprimer la dépense',
            other: 'Supprimer les dépenses',
        }); },
        deleteConfirmation: function () { return ({
            one: 'Êtes-vous sûr de vouloir supprimer cette dépense ?',
            other: 'Êtes-vous sûr de vouloir supprimer ces dépenses ?',
        }); },
        deleteReport: 'Supprimer le rapport',
        deleteReportConfirmation: 'Êtes-vous sûr de vouloir supprimer ce rapport ?',
        settledExpensify: 'Payé',
        done: 'Fait',
        settledElsewhere: 'Payé ailleurs',
        individual: 'Individuel',
        business: 'Entreprise',
        settleExpensify: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Payer ".concat(formattedAmount, " avec Expensify") : "Payer avec Expensify");
        },
        settlePersonal: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Payer ".concat(formattedAmount, " en tant qu'individu") : "Payer en tant qu'individu");
        },
        settlePayment: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return "Payer ".concat(formattedAmount);
        },
        settleBusiness: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Payer ".concat(formattedAmount, " en tant qu'entreprise") : "Payer en tant qu'entreprise");
        },
        payElsewhere: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Payer ".concat(formattedAmount, " ailleurs") : "Payer ailleurs");
        },
        nextStep: 'Étapes suivantes',
        finished: 'Terminé',
        flip: 'Inverser',
        sendInvoice: function (_a) {
            var amount = _a.amount;
            return "Envoyer une facture de ".concat(amount);
        },
        submitAmount: function (_a) {
            var amount = _a.amount;
            return "Soumettre ".concat(amount);
        },
        expenseAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount).concat(comment ? "pour ".concat(comment) : '');
        },
        submitted: "soumis",
        automaticallySubmitted: "soumis via <a href=\"".concat(CONST_1.default.SELECT_WORKFLOWS_HELP_URL, "\">soumissions diff\u00E9r\u00E9es</a>"),
        trackedAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "suivi ".concat(formattedAmount).concat(comment ? "pour ".concat(comment) : '');
        },
        splitAmount: function (_a) {
            var amount = _a.amount;
            return "diviser ".concat(amount);
        },
        didSplitAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "split ".concat(formattedAmount).concat(comment ? "pour ".concat(comment) : '');
        },
        yourSplit: function (_a) {
            var amount = _a.amount;
            return "Votre part ".concat(amount);
        },
        payerOwesAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount, comment = _a.comment;
            return "".concat(payer, " doit ").concat(amount).concat(comment ? "pour ".concat(comment) : '');
        },
        payerOwes: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " doit :");
        },
        payerPaidAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount;
            return "".concat(payer ? "".concat(payer, " ") : '', " a pay\u00E9 ").concat(amount);
        },
        payerPaid: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " a pay\u00E9 :");
        },
        payerSpentAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount;
            return "".concat(payer, " a d\u00E9pens\u00E9 ").concat(amount);
        },
        payerSpent: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " a d\u00E9pens\u00E9 :");
        },
        managerApproved: function (_a) {
            var manager = _a.manager;
            return "".concat(manager, " approuv\u00E9 :");
        },
        managerApprovedAmount: function (_a) {
            var manager = _a.manager, amount = _a.amount;
            return "".concat(manager, " a approuv\u00E9 ").concat(amount);
        },
        payerSettled: function (_a) {
            var amount = _a.amount;
            return "pay\u00E9 ".concat(amount);
        },
        payerSettledWithMissingBankAccount: function (_a) {
            var amount = _a.amount;
            return "pay\u00E9 ".concat(amount, ". Ajoutez un compte bancaire pour recevoir votre paiement.");
        },
        automaticallyApproved: "approuv\u00E9 via les <a href=\"".concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">r\u00E8gles de l'espace de travail</a>"),
        approvedAmount: function (_a) {
            var amount = _a.amount;
            return "approuv\u00E9 ".concat(amount);
        },
        approvedMessage: "approuv\u00E9",
        unapproved: "non approuv\u00E9",
        automaticallyForwarded: "approuv\u00E9 via les <a href=\"".concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">r\u00E8gles de l'espace de travail</a>"),
        forwarded: "approuv\u00E9",
        rejectedThisReport: 'a rejeté ce rapport',
        waitingOnBankAccount: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName;
            return "a commenc\u00E9 \u00E0 r\u00E9gler. Le paiement est en attente jusqu'\u00E0 ce que ".concat(submitterDisplayName, " ajoute un compte bancaire.");
        },
        adminCanceledRequest: function (_a) {
            var manager = _a.manager;
            return "".concat(manager ? "".concat(manager, ": ") : '', " a annul\u00E9 le paiement");
        },
        canceledRequest: function (_a) {
            var amount = _a.amount, submitterDisplayName = _a.submitterDisplayName;
            return "a annul\u00E9 le paiement de ".concat(amount, ", car ").concat(submitterDisplayName, " n'a pas activ\u00E9 leur Expensify Wallet dans les 30 jours");
        },
        settledAfterAddedBankAccount: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName, amount = _a.amount;
            return "".concat(submitterDisplayName, " a ajout\u00E9 un compte bancaire. Le paiement de ").concat(amount, " a \u00E9t\u00E9 effectu\u00E9.");
        },
        paidElsewhere: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', " pay\u00E9 ailleurs");
        },
        paidWithExpensify: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', " pay\u00E9 avec Expensify");
        },
        automaticallyPaidWithExpensify: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', " pay\u00E9 avec Expensify via les <a href=\"").concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">r\u00E8gles de l'espace de travail</a>");
        },
        noReimbursableExpenses: 'Ce rapport contient un montant invalide',
        pendingConversionMessage: 'Le total sera mis à jour lorsque vous serez de nouveau en ligne.',
        changedTheExpense: 'modifié la dépense',
        setTheRequest: function (_a) {
            var valueName = _a.valueName, newValueToDisplay = _a.newValueToDisplay;
            return "le ".concat(valueName, " \u00E0 ").concat(newValueToDisplay);
        },
        setTheDistanceMerchant: function (_a) {
            var translatedChangedField = _a.translatedChangedField, newMerchant = _a.newMerchant, newAmountToDisplay = _a.newAmountToDisplay;
            return "d\u00E9finir le ".concat(translatedChangedField, " sur ").concat(newMerchant, ", ce qui a d\u00E9fini le montant \u00E0 ").concat(newAmountToDisplay);
        },
        removedTheRequest: function (_a) {
            var valueName = _a.valueName, oldValueToDisplay = _a.oldValueToDisplay;
            return "le ".concat(valueName, " (pr\u00E9c\u00E9demment ").concat(oldValueToDisplay, ")");
        },
        updatedTheRequest: function (_a) {
            var valueName = _a.valueName, newValueToDisplay = _a.newValueToDisplay, oldValueToDisplay = _a.oldValueToDisplay;
            return "le ".concat(valueName, " \u00E0 ").concat(newValueToDisplay, " (pr\u00E9c\u00E9demment ").concat(oldValueToDisplay, ")");
        },
        updatedTheDistanceMerchant: function (_a) {
            var translatedChangedField = _a.translatedChangedField, newMerchant = _a.newMerchant, oldMerchant = _a.oldMerchant, newAmountToDisplay = _a.newAmountToDisplay, oldAmountToDisplay = _a.oldAmountToDisplay;
            return "a chang\u00E9 le ".concat(translatedChangedField, " en ").concat(newMerchant, " (pr\u00E9c\u00E9demment ").concat(oldMerchant, "), ce qui a mis \u00E0 jour le montant \u00E0 ").concat(newAmountToDisplay, " (pr\u00E9c\u00E9demment ").concat(oldAmountToDisplay, ")");
        },
        threadExpenseReportName: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount, " ").concat(comment ? "pour ".concat(comment) : 'dépense');
        },
        invoiceReportName: function (_a) {
            var linkedReportID = _a.linkedReportID;
            return "Rapport de Facture n\u00B0".concat(linkedReportID);
        },
        threadPaySomeoneReportName: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount, " envoy\u00E9").concat(comment ? "pour ".concat(comment) : '');
        },
        movedFromPersonalSpace: function (_a) {
            var workspaceName = _a.workspaceName, reportName = _a.reportName;
            return "d\u00E9plac\u00E9 la d\u00E9pense de l'espace personnel vers ".concat(workspaceName !== null && workspaceName !== void 0 ? workspaceName : "discuter avec ".concat(reportName));
        },
        movedToPersonalSpace: "a déplacé la dépense vers l'espace personnel",
        tagSelection: 'Sélectionnez une étiquette pour mieux organiser vos dépenses.',
        categorySelection: 'Sélectionnez une catégorie pour mieux organiser vos dépenses.',
        error: {
            invalidCategoryLength: 'Le nom de la catégorie dépasse 255 caractères. Veuillez le raccourcir ou choisir une autre catégorie.',
            invalidTagLength: "Le nom de l'étiquette dépasse 255 caractères. Veuillez le raccourcir ou choisir une autre étiquette.",
            invalidAmount: 'Veuillez entrer un montant valide avant de continuer',
            invalidIntegerAmount: 'Veuillez entrer un montant en dollars entiers avant de continuer.',
            invalidTaxAmount: function (_a) {
                var amount = _a.amount;
                return "Le montant maximal de la taxe est ".concat(amount);
            },
            invalidSplit: 'La somme des répartitions doit être égale au montant total',
            invalidSplitParticipants: 'Veuillez entrer un montant supérieur à zéro pour au moins deux participants',
            invalidSplitYourself: 'Veuillez entrer un montant non nul pour votre répartition',
            noParticipantSelected: 'Veuillez sélectionner un participant',
            other: 'Erreur inattendue. Veuillez réessayer plus tard.',
            genericCreateFailureMessage: 'Erreur inattendue lors de la soumission de cette dépense. Veuillez réessayer plus tard.',
            genericCreateInvoiceFailureMessage: "Erreur inattendue lors de l'envoi de cette facture. Veuillez réessayer plus tard.",
            genericHoldExpenseFailureMessage: 'Erreur inattendue lors de la mise en attente de cette dépense. Veuillez réessayer plus tard.',
            genericUnholdExpenseFailureMessage: 'Erreur inattendue lors de la suppression de la mise en attente de cette dépense. Veuillez réessayer plus tard.',
            receiptDeleteFailureError: 'Erreur inattendue lors de la suppression de ce reçu. Veuillez réessayer plus tard.',
            receiptFailureMessage: "Une erreur s'est produite lors du téléchargement de votre reçu. Veuillez",
            receiptFailureMessageShort: "Une erreur s'est produite lors du téléchargement de votre reçu.",
            tryAgainMessage: 'réessayer',
            saveFileMessage: 'enregistrer le reçu',
            uploadLaterMessage: 'à télécharger plus tard.',
            genericDeleteFailureMessage: 'Erreur inattendue lors de la suppression de cette dépense. Veuillez réessayer plus tard.',
            genericEditFailureMessage: 'Erreur inattendue lors de la modification de cette dépense. Veuillez réessayer plus tard.',
            genericSmartscanFailureMessage: 'La transaction comporte des champs manquants',
            duplicateWaypointsErrorMessage: 'Veuillez supprimer les points de passage en double',
            atLeastTwoDifferentWaypoints: 'Veuillez entrer au moins deux adresses différentes.',
            splitExpenseMultipleParticipantsErrorMessage: "Une dépense ne peut pas être partagée entre un espace de travail et d'autres membres. Veuillez mettre à jour votre sélection.",
            invalidMerchant: 'Veuillez entrer un commerçant valide',
            atLeastOneAttendee: 'Au moins un participant doit être sélectionné',
            invalidQuantity: 'Veuillez entrer une quantité valide',
            quantityGreaterThanZero: 'La quantité doit être supérieure à zéro',
            invalidSubrateLength: 'Il doit y avoir au moins un sous-taux',
            invalidRate: "Tarif non valide pour cet espace de travail. Veuillez sélectionner un tarif disponible dans l'espace de travail.",
        },
        dismissReceiptError: "Ignorer l'erreur",
        dismissReceiptErrorConfirmation: 'Attention ! Ignorer cette erreur supprimera entièrement votre reçu téléchargé. Êtes-vous sûr ?',
        waitingOnEnabledWallet: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName;
            return "a commenc\u00E9 \u00E0 r\u00E9gler. Le paiement est en attente jusqu'\u00E0 ce que ".concat(submitterDisplayName, " active son portefeuille.");
        },
        enableWallet: 'Activer le portefeuille',
        hold: 'Attente',
        unhold: 'Supprimer la suspension',
        holdExpense: 'Mettre la dépense en attente',
        unholdExpense: 'Débloquer la dépense',
        heldExpense: 'retenu cette dépense',
        unheldExpense: 'débloqué cette dépense',
        moveUnreportedExpense: 'Déplacer la dépense non déclarée',
        addUnreportedExpense: 'Ajouter une dépense non déclarée',
        createNewExpense: 'Créer une nouvelle dépense',
        selectUnreportedExpense: 'Sélectionnez au moins une dépense à ajouter au rapport.',
        emptyStateUnreportedExpenseTitle: 'Aucune dépense non déclarée',
        emptyStateUnreportedExpenseSubtitle: "Il semble que vous n'ayez aucune dépense non déclarée. Essayez d'en créer une ci-dessous.",
        addUnreportedExpenseConfirm: 'Ajouter au rapport',
        explainHold: 'Expliquez pourquoi vous retenez cette dépense.',
        undoSubmit: "Annuler l'envoi",
        retracted: 'retraité',
        undoClose: 'Annuler la fermeture',
        reopened: 'rouvert',
        reopenReport: 'Rouvrir le rapport',
        reopenExportedReportConfirmation: function (_a) {
            var connectionName = _a.connectionName;
            return "Ce rapport a d\u00E9j\u00E0 \u00E9t\u00E9 export\u00E9 vers ".concat(connectionName, ". Le modifier pourrait entra\u00EEner des incoh\u00E9rences de donn\u00E9es. \u00CAtes-vous s\u00FBr de vouloir rouvrir ce rapport ?");
        },
        reason: 'Raison',
        holdReasonRequired: 'Un motif est requis lors de la mise en attente.',
        expenseWasPutOnHold: 'La dépense a été mise en attente',
        expenseOnHold: 'Cette dépense a été mise en attente. Veuillez consulter les commentaires pour les prochaines étapes.',
        expensesOnHold: 'Toutes les dépenses ont été mises en attente. Veuillez consulter les commentaires pour connaître les prochaines étapes.',
        expenseDuplicate: 'Cette dépense a des détails similaires à une autre. Veuillez vérifier les doublons pour continuer.',
        someDuplicatesArePaid: 'Certains de ces doublons ont déjà été approuvés ou payés.',
        reviewDuplicates: 'Examiner les doublons',
        keepAll: 'Garder tout',
        confirmApprove: 'Confirmer le montant approuvé',
        confirmApprovalAmount: "Approuvez uniquement les dépenses conformes, ou approuvez l'ensemble du rapport.",
        confirmApprovalAllHoldAmount: function () { return ({
            one: 'Cette dépense est en attente. Voulez-vous approuver quand même ?',
            other: 'Ces dépenses sont en attente. Voulez-vous approuver quand même ?',
        }); },
        confirmPay: 'Confirmer le montant du paiement',
        confirmPayAmount: "Payez ce qui n'est pas en attente, ou payez l'intégralité du rapport.",
        confirmPayAllHoldAmount: function () { return ({
            one: 'Cette dépense est en attente. Voulez-vous payer quand même ?',
            other: 'Ces dépenses sont en attente. Voulez-vous payer quand même ?',
        }); },
        payOnly: 'Payer seulement',
        approveOnly: 'Approuver seulement',
        holdEducationalTitle: 'Cette demande est activée',
        holdEducationalText: 'tenir',
        whatIsHoldExplain: 'La mise en attente, c\'est comme appuyer sur "pause" pour une dépense afin de demander plus de détails avant l\'approbation ou le paiement.',
        holdIsLeftBehind: 'Les dépenses en attente sont déplacées vers un autre rapport après approbation ou paiement.',
        unholdWhenReady: "Les approbateurs peuvent débloquer les dépenses lorsqu'elles sont prêtes pour approbation ou paiement.",
        changePolicyEducational: {
            title: 'Vous avez déplacé ce rapport !',
            description: 'Vérifiez ces éléments, qui ont tendance à changer lors du déplacement des rapports vers un nouvel espace de travail.',
            reCategorize: "<strong>Re-catégorisez toutes les dépenses</strong> pour se conformer aux règles de l'espace de travail.",
            workflows: "Ce rapport peut désormais être soumis à un <strong>flux de travail d'approbation</strong> différent.",
        },
        changeWorkspace: "Changer d'espace de travail",
        set: 'set',
        changed: 'changé',
        removed: 'removed',
        transactionPending: 'Transaction en attente.',
        chooseARate: "Sélectionnez un taux de remboursement par mile ou kilomètre pour l'espace de travail",
        unapprove: 'Désapprouver',
        unapproveReport: 'Désapprouver le rapport',
        headsUp: 'Attention !',
        unapproveWithIntegrationWarning: function (_a) {
            var accountingIntegration = _a.accountingIntegration;
            return "Ce rapport a d\u00E9j\u00E0 \u00E9t\u00E9 export\u00E9 vers ".concat(accountingIntegration, ". Le modifier pourrait entra\u00EEner des incoh\u00E9rences de donn\u00E9es. \u00CAtes-vous s\u00FBr de vouloir d\u00E9sapprouver ce rapport ?");
        },
        reimbursable: 'remboursable',
        nonReimbursable: 'non-remboursable',
        bookingPending: 'Cette réservation est en attente',
        bookingPendingDescription: "Cette réservation est en attente car elle n'a pas encore été payée.",
        bookingArchived: 'Cette réservation est archivée',
        bookingArchivedDescription: 'Cette réservation est archivée car la date du voyage est passée. Ajoutez une dépense pour le montant final si nécessaire.',
        attendees: 'Participants',
        whoIsYourAccountant: 'Qui est votre comptable ?',
        paymentComplete: 'Paiement effectué',
        time: 'Temps',
        startDate: 'Date de début',
        endDate: 'Date de fin',
        startTime: 'Heure de début',
        endTime: 'Heure de fin',
        deleteSubrate: 'Supprimer le sous-taux',
        deleteSubrateConfirmation: 'Êtes-vous sûr de vouloir supprimer ce sous-taux ?',
        quantity: 'Quantité',
        subrateSelection: 'Sélectionnez un sous-taux et entrez une quantité.',
        qty: 'Qté',
        firstDayText: function () { return ({
            one: "Premier jour : 1 heure",
            other: function (count) { return "Premier jour : ".concat(count.toFixed(2), " heures"); },
        }); },
        lastDayText: function () { return ({
            one: "Dernier jour : 1 heure",
            other: function (count) { return "Dernier jour : ".concat(count.toFixed(2), " heures"); },
        }); },
        tripLengthText: function () { return ({
            one: "Voyage : 1 journ\u00E9e compl\u00E8te",
            other: function (count) { return "Voyage : ".concat(count, " jours complets"); },
        }); },
        dates: 'Dates',
        rates: 'Tarifs',
        submitsTo: function (_a) {
            var name = _a.name;
            return "Soumet \u00E0 ".concat(name);
        },
        moveExpenses: function () { return ({ one: 'Déplacer la dépense', other: 'Déplacer les dépenses' }); },
    },
    share: {
        shareToExpensify: 'Partager sur Expensify',
        messageInputLabel: 'Message',
    },
    notificationPreferencesPage: {
        header: 'Préférences de notification',
        label: 'Me notifier des nouveaux messages',
        notificationPreferences: {
            always: 'Immédiatement',
            daily: 'Quotidiennement',
            mute: 'Muet',
            hidden: 'Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: "Le numéro n'a pas été validé. Cliquez sur le bouton pour renvoyer le lien de validation par SMS.",
        emailHasNotBeenValidated: "L'e-mail n'a pas été validé. Cliquez sur le bouton pour renvoyer le lien de validation par SMS.",
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Télécharger une photo',
        removePhoto: 'Supprimer la photo',
        editImage: 'Modifier la photo',
        viewPhoto: 'Voir la photo',
        imageUploadFailed: "Échec du téléchargement de l'image",
        deleteWorkspaceError: "Désolé, un problème inattendu est survenu lors de la suppression de l'avatar de votre espace de travail.",
        sizeExceeded: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "L'image s\u00E9lectionn\u00E9e d\u00E9passe la taille maximale de t\u00E9l\u00E9chargement de ".concat(maxUploadSizeInMB, " Mo.");
        },
        resolutionConstraints: function (_a) {
            var minHeightInPx = _a.minHeightInPx, minWidthInPx = _a.minWidthInPx, maxHeightInPx = _a.maxHeightInPx, maxWidthInPx = _a.maxWidthInPx;
            return "Veuillez t\u00E9l\u00E9charger une image de taille sup\u00E9rieure \u00E0 ".concat(minHeightInPx, "x").concat(minWidthInPx, " pixels et inf\u00E9rieure \u00E0 ").concat(maxHeightInPx, "x").concat(maxWidthInPx, " pixels.");
        },
        notAllowedExtension: function (_a) {
            var allowedExtensions = _a.allowedExtensions;
            return "La photo de profil doit \u00EAtre l'un des types suivants : ".concat(allowedExtensions.join(', '), ".");
        },
    },
    modal: {
        backdropLabel: 'Toile de fond du modal',
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Pronoms préférés',
        selectYourPronouns: 'Sélectionnez vos pronoms',
        selfSelectYourPronoun: 'Sélectionnez votre pronom vous-même',
        emailAddress: 'Adresse e-mail',
        setMyTimezoneAutomatically: 'Définir mon fuseau horaire automatiquement',
        timezone: 'Fuseau horaire',
        invalidFileMessage: 'Fichier invalide. Veuillez essayer une autre image.',
        avatarUploadFailureMessage: "Une erreur s'est produite lors du téléchargement de l'avatar. Veuillez réessayer.",
        online: 'En ligne',
        offline: 'Hors ligne',
        syncing: 'Synchronisation',
        profileAvatar: 'Avatar de profil',
        publicSection: {
            title: 'Public',
            subtitle: 'Ces détails sont affichés sur votre profil public. Tout le monde peut les voir.',
        },
        privateSection: {
            title: 'Privé',
            subtitle: 'Ces détails sont utilisés pour les voyages et les paiements. Ils ne sont jamais affichés sur votre profil public.',
        },
    },
    securityPage: {
        title: 'Options de sécurité',
        subtitle: "Activez l'authentification à deux facteurs pour sécuriser votre compte.",
        goToSecurity: 'Retourner à la page de sécurité',
    },
    shareCodePage: {
        title: 'Votre code',
        subtitle: 'Invitez des membres à Expensify en partageant votre code QR personnel ou votre lien de parrainage.',
    },
    pronounsPage: {
        pronouns: 'Pronoms',
        isShownOnProfile: 'Vos pronoms sont affichés sur votre profil.',
        placeholderText: 'Recherchez pour voir les options',
    },
    contacts: {
        contactMethod: 'Méthode de contact',
        contactMethods: 'Méthodes de contact',
        featureRequiresValidate: 'Cette fonctionnalité nécessite que vous validiez votre compte.',
        validateAccount: 'Validez votre compte',
        helpTextBeforeEmail: 'Ajoutez plus de moyens pour que les gens vous trouvent, et transférez les reçus à',
        helpTextAfterEmail: 'depuis plusieurs adresses e-mail.',
        pleaseVerify: 'Veuillez vérifier cette méthode de contact',
        getInTouch: 'Chaque fois que nous devons vous contacter, nous utiliserons cette méthode de contact.',
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Veuillez entrer le code magique envoy\u00E9 \u00E0 ".concat(contactMethod, ". Il devrait arriver dans une minute ou deux.");
        },
        setAsDefault: 'Définir par défaut',
        yourDefaultContactMethod: "C'est votre méthode de contact par défaut actuelle. Avant de pouvoir la supprimer, vous devez choisir une autre méthode de contact et cliquer sur « Définir par défaut ».",
        removeContactMethod: 'Supprimer la méthode de contact',
        removeAreYouSure: 'Êtes-vous sûr de vouloir supprimer ce moyen de contact ? Cette action est irréversible.',
        failedNewContact: "Échec de l'ajout de ce moyen de contact.",
        genericFailureMessages: {
            requestContactMethodValidateCode: "Échec de l'envoi d'un nouveau code magique. Veuillez patienter un peu et réessayer.",
            validateSecondaryLogin: 'Code magique incorrect ou invalide. Veuillez réessayer ou demander un nouveau code.',
            deleteContactMethod: "Échec de la suppression de la méthode de contact. Veuillez contacter Concierge pour obtenir de l'aide.",
            setDefaultContactMethod: "Échec de la définition d'une nouvelle méthode de contact par défaut. Veuillez contacter Concierge pour obtenir de l'aide.",
            addContactMethod: "Échec de l'ajout de ce moyen de contact. Veuillez contacter Concierge pour obtenir de l'aide.",
            enteredMethodIsAlreadySubmitted: 'Cette méthode de contact existe déjà',
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
        heHimHisTheyThemTheirs: 'Il / Lui / Son / Ils / Eux / Leurs',
        sheHerHers: 'Elle / Elle / Sa',
        sheHerHersTheyThemTheirs: 'Elle / Elle / Sienne / Iel / Iel / Leur',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Par / Pers',
        theyThemTheirs: 'Ils / Elles / Leurs',
        thonThons: 'Thon / Thons',
        veVerVis: 'Aller / Voir / Vue',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Appelle-moi par mon nom',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: "Nom d'affichage",
        isShownOnProfile: "Votre nom d'affichage est affiché sur votre profil.",
    },
    timezonePage: {
        timezone: 'Fuseau horaire',
        isShownOnProfile: 'Votre fuseau horaire est affiché sur votre profil.',
        getLocationAutomatically: 'Déterminer automatiquement votre emplacement',
    },
    updateRequiredView: {
        updateRequired: 'Mise à jour requise',
        pleaseInstall: 'Veuillez mettre à jour vers la dernière version de New Expensify.',
        pleaseInstallExpensifyClassic: "Veuillez installer la dernière version d'Expensify.",
        toGetLatestChanges: 'Pour mobile ou ordinateur de bureau, téléchargez et installez la dernière version. Pour le web, actualisez votre navigateur.',
        newAppNotAvailable: "L'application New Expensify n'est plus disponible.",
    },
    initialSettingsPage: {
        about: 'À propos',
        aboutPage: {
            description: "La nouvelle application Expensify est construite par une communauté de développeurs open-source du monde entier. Aidez-nous à construire l'avenir d'Expensify.",
            appDownloadLinks: 'App download links',
            viewKeyboardShortcuts: 'Voir les raccourcis clavier',
            viewTheCode: 'Voir le code',
            viewOpenJobs: "Voir les offres d'emploi ouvertes",
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
            desktop: {
                label: 'macOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: 'Effacer le cache et redémarrer',
            viewConsole: 'Afficher la console de débogage',
            debugConsole: 'Console de débogage',
            description: "Utilisez les outils ci-dessous pour vous aider à résoudre les problèmes liés à l'expérience Expensify. Si vous rencontrez des problèmes, veuillez",
            submitBug: 'soumettre un bug',
            confirmResetDescription: 'Tous les brouillons de messages non envoyés seront perdus, mais le reste de vos données est en sécurité.',
            resetAndRefresh: 'Réinitialiser et actualiser',
            clientSideLogging: 'Journalisation côté client',
            noLogsToShare: 'Aucun journal à partager',
            useProfiling: 'Utiliser le profilage',
            profileTrace: 'Profil de trace',
            results: 'Résultats',
            releaseOptions: 'Options de publication',
            testingPreferences: 'Préférences de test',
            useStagingServer: 'Utiliser le serveur de staging',
            forceOffline: 'Forcer hors ligne',
            simulatePoorConnection: 'Simuler une mauvaise connexion Internet',
            simulateFailingNetworkRequests: 'Simuler des échecs de requêtes réseau',
            authenticationStatus: "Statut d'authentification",
            deviceCredentials: "Identifiants de l'appareil",
            invalidate: 'Invalider',
            destroy: 'Détruire',
            maskExportOnyxStateData: "Masquer les données sensibles des membres lors de l'exportation de l'état Onyx",
            exportOnyxState: "Exporter l'état Onyx",
            importOnyxState: "Importer l'état Onyx",
            testCrash: 'Test crash',
            resetToOriginalState: "Réinitialiser à l'état d'origine",
            usingImportedState: 'Vous utilisez un état importé. Appuyez ici pour le réinitialiser.',
            debugMode: 'Mode débogage',
            invalidFile: 'Fichier invalide',
            invalidFileDescription: "Le fichier que vous essayez d'importer n'est pas valide. Veuillez réessayer.",
            invalidateWithDelay: 'Invalider avec délai',
            recordTroubleshootData: 'Enregistrement des données de dépannage',
        },
        debugConsole: {
            saveLog: 'Enregistrer le journal',
            shareLog: 'Partager le journal',
            enterCommand: 'Entrer la commande',
            execute: 'Exécuter',
            noLogsAvailable: 'Aucun journal disponible',
            logSizeTooLarge: function (_a) {
                var size = _a.size;
                return "La taille du journal d\u00E9passe la limite de ".concat(size, " Mo. Veuillez utiliser \"Enregistrer le journal\" pour t\u00E9l\u00E9charger le fichier journal \u00E0 la place.");
            },
            logs: 'Journaux',
            viewConsole: 'Afficher la console',
        },
        security: 'Sécurité',
        signOut: 'Déconnexion',
        restoreStashed: 'Restaurer la connexion mise en attente',
        signOutConfirmationText: 'Vous perdrez toutes les modifications hors ligne si vous vous déconnectez.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: 'Lire le',
            phrase2: "Conditions d'utilisation",
            phrase3: 'et',
            phrase4: 'Confidentialité',
        },
        help: 'Aide',
        accountSettings: 'Paramètres du compte',
        account: 'Compte',
        general: 'Général',
    },
    closeAccountPage: {
        closeAccount: 'Fermer le compte',
        reasonForLeavingPrompt: 'Nous serions désolés de vous voir partir ! Pourriez-vous nous dire pourquoi, afin que nous puissions nous améliorer ?',
        enterMessageHere: 'Entrez le message ici',
        closeAccountWarning: 'La fermeture de votre compte est irréversible.',
        closeAccountPermanentlyDeleteData: 'Êtes-vous sûr de vouloir supprimer votre compte ? Cela supprimera définitivement toutes les dépenses en cours.',
        enterDefaultContactToConfirm: 'Veuillez entrer votre méthode de contact par défaut pour confirmer que vous souhaitez fermer votre compte. Votre méthode de contact par défaut est :',
        enterDefaultContact: 'Entrez votre méthode de contact par défaut',
        defaultContact: 'Méthode de contact par défaut :',
        enterYourDefaultContactMethod: 'Veuillez entrer votre méthode de contact par défaut pour clôturer votre compte.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Fusionner les comptes',
        accountDetails: {
            accountToMergeInto: 'Entrez le compte dans lequel vous souhaitez fusionner',
            notReversibleConsent: "Je comprends que cela n'est pas réversible",
        },
        accountValidate: {
            confirmMerge: 'Êtes-vous sûr de vouloir fusionner les comptes ?',
            lossOfUnsubmittedData: "La fusion de vos comptes est irr\u00E9versible et entra\u00EEnera la perte de toutes les d\u00E9penses non soumises pour",
            enterMagicCode: "Pour continuer, veuillez entrer le code magique envoy\u00E9 \u00E0",
            errors: {
                incorrectMagicCode: 'Code magique incorrect ou invalide. Veuillez réessayer ou demander un nouveau code.',
                fallback: 'Un problème est survenu. Veuillez réessayer plus tard.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Comptes fusionnés !',
            successfullyMergedAllData: {
                beforeFirstEmail: "Vous avez fusionn\u00E9 avec succ\u00E8s toutes les donn\u00E9es de",
                beforeSecondEmail: "en",
                afterSecondEmail: ". \u00C0 l'avenir, vous pouvez utiliser l'un ou l'autre identifiant pour ce compte.",
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Nous y travaillons',
            limitedSupport: 'Nous ne prenons pas encore en charge la fusion des comptes sur New Expensify. Veuillez effectuer cette action sur Expensify Classic à la place.',
            reachOutForHelp: {
                beforeLink: "N'hésitez pas à",
                linkText: 'contactez Concierge',
                afterLink: 'si vous avez des questions !',
            },
            goToExpensifyClassic: 'Aller à Expensify Classic',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: 'Vous ne pouvez pas fusionner',
            beforeDomain: "parce que c'est contrôlé par",
            afterDomain: ". S'il vous plaît",
            linkText: 'contactez Concierge',
            afterLink: 'pour assistance.',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: 'Vous ne pouvez pas fusionner',
            afterEmail: "dans d'autres comptes car votre administrateur de domaine l'a défini comme votre identifiant principal. Veuillez plutôt fusionner d'autres comptes avec celui-ci.",
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: 'Vous ne pouvez pas fusionner les comptes car',
                beforeSecondEmail: "a activé l'authentification à deux facteurs (2FA). Veuillez désactiver la 2FA pour",
                afterSecondEmail: 'et réessayez.',
            },
            learnMore: 'En savoir plus sur la fusion des comptes.',
        },
        mergeFailureAccountLocked: {
            beforeEmail: 'Vous ne pouvez pas fusionner',
            afterEmail: "parce qu'il est verrouillé. Veuillez",
            linkText: 'contactez Concierge',
            afterLink: "pour assistance.",
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: 'Vous ne pouvez pas fusionner les comptes car',
                afterEmail: "n'a pas de compte Expensify.",
            },
            addContactMethod: {
                beforeLink: "S'il vous plaît",
                linkText: 'ajoutez-le comme méthode de contact',
                afterLink: 'au lieu.',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: 'Vous ne pouvez pas fusionner',
            afterEmail: "dans d'autres comptes. Veuillez fusionner les autres comptes avec celui-ci à la place.",
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: 'Vous ne pouvez pas fusionner',
            afterEmail: "dans d'autres comptes car c'est le propriétaire de facturation d'un compte facturé. Veuillez plutôt fusionner d'autres comptes avec celui-ci.",
        },
        mergeFailureTooManyAttempts: {
            heading: 'Réessayez plus tard',
            description: 'Il y a eu trop de tentatives de fusion de comptes. Veuillez réessayer plus tard.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "Vous ne pouvez pas fusionner avec d'autres comptes car il n'est pas validé. Veuillez valider le compte et réessayer.",
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
        compromisedDescription: "Vous remarquez quelque chose d'inhabituel ? Signalez-le pour verrouiller immédiatement votre compte, bloquer les transactions Expensify Card et empêcher toute modification.",
        domainAdminsDescription: "Pour les administrateurs de domaine : cela suspend aussi l'activité de la carte Expensify et les actions d'administration sur vos domaines.",
        areYouSure: 'Êtes-vous sûr de vouloir verrouiller votre compte Expensify ?',
        ourTeamWill: "Notre équipe enquêtera et supprimera tout accès non autorisé. Pour retrouver l'accès, vous devrez collaborer avec Concierge.",
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Échec du verrouillage du compte',
        failedToLockAccountDescription: "Nous n'avons pas pu verrouiller votre compte. Veuillez discuter avec Concierge pour r\u00E9soudre ce probl\u00E8me.",
        chatWithConcierge: 'Discuter avec Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Compte verrouillé',
        yourAccountIsLocked: 'Votre compte est verrouillé',
        chatToConciergeToUnlock: 'Discutez avec Concierge pour résoudre les problèmes de sécurité et débloquer votre compte.',
        chatWithConcierge: 'Discuter avec Concierge',
    },
    passwordPage: {
        changePassword: 'Changer le mot de passe',
        changingYourPasswordPrompt: 'Changer votre mot de passe mettra à jour votre mot de passe pour vos comptes Expensify.com et New Expensify.',
        currentPassword: 'Mot de passe actuel',
        newPassword: 'Nouveau mot de passe',
        newPasswordPrompt: 'Votre nouveau mot de passe doit être différent de votre ancien mot de passe et contenir au moins 8 caractères, 1 lettre majuscule, 1 lettre minuscule et 1 chiffre.',
    },
    twoFactorAuth: {
        headerTitle: 'Authentification à deux facteurs',
        twoFactorAuthEnabled: 'Authentification à deux facteurs activée',
        whatIsTwoFactorAuth: "L'authentification à deux facteurs (2FA) aide à sécuriser votre compte. Lors de la connexion, vous devrez entrer un code généré par votre application d'authentification préférée.",
        disableTwoFactorAuth: "Désactiver l'authentification à deux facteurs",
        explainProcessToRemove: "Pour désactiver l'authentification à deux facteurs (2FA), veuillez entrer un code valide depuis votre application d'authentification.",
        disabled: "L'authentification à deux facteurs est maintenant désactivée",
        noAuthenticatorApp: "Vous n'aurez plus besoin d'une application d'authentification pour vous connecter à Expensify.",
        stepCodes: 'Codes de récupération',
        keepCodesSafe: 'Gardez ces codes de récupération en sécurité !',
        codesLoseAccess: "Si vous perdez l'accès à votre application d'authentification et n'avez pas ces codes, vous perdrez l'accès à votre compte.\n\nRemarque : La configuration de l'authentification à deux facteurs vous déconnectera de toutes les autres sessions actives.",
        errorStepCodes: 'Veuillez copier ou télécharger les codes avant de continuer.',
        stepVerify: 'Vérifier',
        scanCode: 'Scannez le code QR en utilisant votre',
        authenticatorApp: "application d'authentification",
        addKey: "Ou ajoutez cette clé secrète à votre application d'authentification :",
        enterCode: "Ensuite, entrez le code à six chiffres généré par votre application d'authentification.",
        stepSuccess: 'Terminé',
        enabled: 'Authentification à deux facteurs activée',
        congrats: 'Félicitations ! Vous avez maintenant cette sécurité supplémentaire.',
        copy: 'Copier',
        disable: 'Désactiver',
        enableTwoFactorAuth: "Activer l'authentification à deux facteurs",
        pleaseEnableTwoFactorAuth: "Veuillez activer l'authentification à deux facteurs.",
        twoFactorAuthIsRequiredDescription: "Pour des raisons de sécurité, Xero nécessite une authentification à deux facteurs pour connecter l'intégration.",
        twoFactorAuthIsRequiredForAdminsHeader: 'Authentification à deux facteurs requise',
        twoFactorAuthIsRequiredForAdminsTitle: "Veuillez activer l'authentification à deux facteurs.",
        twoFactorAuthIsRequiredForAdminsDescription: "Votre connexion comptable Xero nécessite l'utilisation de l'authentification à deux facteurs. Pour continuer à utiliser Expensify, veuillez l'activer.",
        twoFactorAuthCannotDisable: 'Impossible de désactiver la 2FA',
        twoFactorAuthRequired: "L'authentification à deux facteurs (2FA) est requise pour votre connexion Xero et ne peut pas être désactivée.",
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Veuillez entrer votre code de récupération',
            incorrectRecoveryCode: 'Code de récupération incorrect. Veuillez réessayer.',
        },
        useRecoveryCode: 'Utiliser le code de récupération',
        recoveryCode: 'Code de récupération',
        use2fa: "Utilisez le code d'authentification à deux facteurs",
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: "Veuillez entrer votre code d'authentification à deux facteurs",
            incorrect2fa: "Code d'authentification à deux facteurs incorrect. Veuillez réessayer.",
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Mot de passe mis à jour !',
        allSet: 'Tout est prêt. Gardez votre nouveau mot de passe en sécurité.',
    },
    privateNotes: {
        title: 'Notes privées',
        personalNoteMessage: 'Conservez des notes sur cette discussion ici. Vous êtes la seule personne qui peut ajouter, modifier ou consulter ces notes.',
        sharedNoteMessage: "Conservez des notes sur cette discussion ici. Les employés d'Expensify et les autres membres du domaine team.expensify.com peuvent consulter ces notes.",
        composerLabel: 'Notes',
        myNote: 'Ma note',
        error: {
            genericFailureMessage: "Les notes privées n'ont pas pu être enregistrées.",
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Veuillez entrer un code de sécurité valide',
        },
        securityCode: 'Code de sécurité',
        changeBillingCurrency: 'Changer la devise de facturation',
        changePaymentCurrency: 'Changer la devise de paiement',
        paymentCurrency: 'Devise de paiement',
        paymentCurrencyDescription: 'Sélectionnez une devise standardisée à laquelle toutes les dépenses personnelles doivent être converties',
        note: 'Remarque : Changer votre devise de paiement peut affecter le montant que vous paierez pour Expensify. Consultez notre',
        noteLink: 'page de tarification',
        noteDetails: 'pour plus de détails.',
    },
    addDebitCardPage: {
        addADebitCard: 'Ajouter une carte de débit',
        nameOnCard: 'Nom sur la carte',
        debitCardNumber: 'Numéro de carte de débit',
        expiration: "Date d'expiration",
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Adresse de facturation',
        growlMessageOnSave: 'Votre carte de débit a été ajoutée avec succès',
        expensifyPassword: 'Mot de passe Expensify',
        error: {
            invalidName: 'Le nom ne peut contenir que des lettres',
            addressZipCode: 'Veuillez entrer un code postal valide',
            debitCardNumber: 'Veuillez saisir un numéro de carte de débit valide',
            expirationDate: "Veuillez sélectionner une date d'expiration valide",
            securityCode: 'Veuillez entrer un code de sécurité valide',
            addressStreet: "Veuillez entrer une adresse de facturation valide qui n'est pas une boîte postale.",
            addressState: 'Veuillez sélectionner un état',
            addressCity: 'Veuillez entrer une ville',
            genericFailureMessage: "Une erreur s'est produite lors de l'ajout de votre carte. Veuillez réessayer.",
            password: 'Veuillez entrer votre mot de passe Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Ajouter une carte de paiement',
        nameOnCard: 'Nom sur la carte',
        paymentCardNumber: 'Numéro de carte',
        expiration: "Date d'expiration",
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Adresse de facturation',
        growlMessageOnSave: 'Votre carte de paiement a été ajoutée avec succès',
        expensifyPassword: 'Mot de passe Expensify',
        error: {
            invalidName: 'Le nom ne peut contenir que des lettres',
            addressZipCode: 'Veuillez entrer un code postal valide',
            paymentCardNumber: 'Veuillez entrer un numéro de carte valide',
            expirationDate: "Veuillez sélectionner une date d'expiration valide",
            securityCode: 'Veuillez entrer un code de sécurité valide',
            addressStreet: "Veuillez entrer une adresse de facturation valide qui n'est pas une boîte postale.",
            addressState: 'Veuillez sélectionner un état',
            addressCity: 'Veuillez entrer une ville',
            genericFailureMessage: "Une erreur s'est produite lors de l'ajout de votre carte. Veuillez réessayer.",
            password: 'Veuillez entrer votre mot de passe Expensify',
        },
    },
    walletPage: {
        balance: 'Solde',
        paymentMethodsTitle: 'Méthodes de paiement',
        setDefaultConfirmation: 'Définir comme méthode de paiement par défaut',
        setDefaultSuccess: 'Méthode de paiement par défaut définie !',
        deleteAccount: 'Supprimer le compte',
        deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer ce compte ?',
        error: {
            notOwnerOfBankAccount: "Une erreur s'est produite lors de la définition de ce compte bancaire comme méthode de paiement par défaut.",
            invalidBankAccount: 'Ce compte bancaire est temporairement suspendu',
            notOwnerOfFund: "Une erreur s'est produite lors de la définition de cette carte comme votre méthode de paiement par défaut.",
            setDefaultFailure: "Un problème est survenu. Veuillez discuter avec Concierge pour obtenir de l'aide supplémentaire.",
        },
        addBankAccountFailure: "Une erreur inattendue s'est produite lors de l'ajout de votre compte bancaire. Veuillez réessayer.",
        getPaidFaster: 'Soyez payé plus rapidement',
        addPaymentMethod: "Ajoutez un mode de paiement pour envoyer et recevoir des paiements directement dans l'application.",
        getPaidBackFaster: 'Soyez remboursé plus rapidement',
        secureAccessToYourMoney: 'Accédez à votre argent en toute sécurité',
        receiveMoney: "Recevez de l'argent dans votre devise locale",
        expensifyWallet: 'Expensify Wallet (Bêta)',
        sendAndReceiveMoney: "Envoyez et recevez de l'argent avec des amis. Comptes bancaires américains uniquement.",
        enableWallet: 'Activer le portefeuille',
        addBankAccountToSendAndReceive: 'Soyez remboursé pour les dépenses que vous soumettez à un espace de travail.',
        addBankAccount: 'Ajouter un compte bancaire',
        assignedCards: 'Cartes assignées',
        assignedCardsDescription: "Ce sont des cartes attribuées par un administrateur d'espace de travail pour gérer les dépenses de l'entreprise.",
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Nous examinons vos informations. Veuillez revenir dans quelques minutes !',
        walletActivationFailed: "Malheureusement, votre portefeuille ne peut pas être activé pour le moment. Veuillez discuter avec Concierge pour obtenir de l'aide supplémentaire.",
        addYourBankAccount: 'Ajoutez votre compte bancaire',
        addBankAccountBody: "Connectons votre compte bancaire à Expensify pour qu'il soit plus facile que jamais d'envoyer et de recevoir des paiements directement dans l'application.",
        chooseYourBankAccount: 'Choisissez votre compte bancaire',
        chooseAccountBody: 'Assurez-vous de sélectionner le bon.',
        confirmYourBankAccount: 'Confirmez votre compte bancaire',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Carte de Voyage Expensify',
        availableSpend: 'Limite restante',
        smartLimit: {
            name: 'Limite intelligent',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "Vous pouvez d\u00E9penser jusqu'\u00E0 ".concat(formattedLimit, " avec cette carte, et la limite sera r\u00E9initialis\u00E9e au fur et \u00E0 mesure que vos d\u00E9penses soumises sont approuv\u00E9es.");
            },
        },
        fixedLimit: {
            name: 'Limite fixe',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "Vous pouvez d\u00E9penser jusqu'\u00E0 ".concat(formattedLimit, " avec cette carte, puis elle sera d\u00E9sactiv\u00E9e.");
            },
        },
        monthlyLimit: {
            name: 'Limite mensuel',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "Vous pouvez d\u00E9penser jusqu'\u00E0 ".concat(formattedLimit, " sur cette carte par mois. La limite sera r\u00E9initialis\u00E9e le 1er jour de chaque mois calendaire.");
            },
        },
        virtualCardNumber: 'Numéro de carte virtuelle',
        travelCardCvv: 'CVV de la carte de voyage',
        physicalCardNumber: 'Numéro de carte physique',
        getPhysicalCard: 'Obtenir une carte physique',
        reportFraud: 'Signaler une fraude à la carte virtuelle',
        reportTravelFraud: 'Signaler une fraude à la carte de voyage',
        reviewTransaction: 'Examiner la transaction',
        suspiciousBannerTitle: 'Transaction suspecte',
        suspiciousBannerDescription: 'Nous avons remarqué des transactions suspectes sur votre carte. Appuyez ci-dessous pour les examiner.',
        cardLocked: 'Votre carte est temporairement bloquée pendant que notre équipe examine le compte de votre entreprise.',
        cardDetails: {
            cardNumber: 'Numéro de carte virtuelle',
            expiration: 'Expiration',
            cvv: 'CVV',
            address: 'Adresse',
            revealDetails: 'Révéler les détails',
            revealCvv: 'Révéler le CVV',
            copyCardNumber: 'Copier le numéro de carte',
            updateAddress: "Mettre à jour l'adresse",
        },
        cardAddedToWallet: function (_a) {
            var platform = _a.platform;
            return "Ajout\u00E9 au portefeuille ".concat(platform);
        },
        cardDetailsLoadingFailure: "Une erreur s'est produite lors du chargement des détails de la carte. Veuillez vérifier votre connexion Internet et réessayer.",
        validateCardTitle: "Assurons-nous que c'est bien vous",
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Veuillez entrer le code magique envoy\u00E9 \u00E0 ".concat(contactMethod, " pour voir les d\u00E9tails de votre carte. Il devrait arriver dans une minute ou deux.");
        },
    },
    workflowsPage: {
        workflowTitle: 'Dépenser',
        workflowDescription: "Configurez un flux de travail dès que la dépense survient, y compris l'approbation et le paiement.",
        delaySubmissionTitle: 'Retarder les soumissions',
        delaySubmissionDescription: 'Choisissez un calendrier personnalisé pour soumettre les dépenses, ou laissez cette option désactivée pour des mises à jour en temps réel sur les dépenses.',
        submissionFrequency: 'Fréquence de soumission',
        submissionFrequencyDateOfMonth: 'Date du mois',
        addApprovalsTitle: 'Ajouter des approbations',
        addApprovalButton: "Ajouter un flux de travail d'approbation",
        addApprovalTip: "Ce flux de travail par défaut s'applique à tous les membres, sauf si un flux de travail plus spécifique existe.",
        approver: 'Approbateur',
        connectBankAccount: 'Connecter un compte bancaire',
        addApprovalsDescription: "Exiger une approbation supplémentaire avant d'autoriser un paiement.",
        makeOrTrackPaymentsTitle: 'Effectuer ou suivre des paiements',
        makeOrTrackPaymentsDescription: 'Ajoutez un payeur autorisé pour les paiements effectués dans Expensify ou suivez les paiements effectués ailleurs.',
        editor: {
            submissionFrequency: 'Choisissez combien de temps Expensify doit attendre avant de partager les dépenses sans erreur.',
        },
        frequencyDescription: 'Choisissez la fréquence à laquelle vous souhaitez que les dépenses soient soumises automatiquement, ou faites-le manuellement.',
        frequencies: {
            instant: 'Instantané',
            weekly: 'Hebdomadaire',
            monthly: 'Mensuel',
            twiceAMonth: 'Deux fois par mois',
            byTrip: 'Par voyage',
            manually: 'Manuellement',
            daily: 'Quotidiennement',
            lastDayOfMonth: 'Dernier jour du mois',
            lastBusinessDayOfMonth: 'Dernier jour ouvrable du mois',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
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
        approverInMultipleWorkflows: "Ce membre appartient déjà à un autre flux de travail d'approbation. Toute mise à jour ici sera également reflétée là-bas.",
        approverCircularReference: function (_a) {
            var name1 = _a.name1, name2 = _a.name2;
            return "<strong>".concat(name1, "</strong> approuve d\u00E9j\u00E0 les rapports \u00E0 <strong>").concat(name2, "</strong>. Veuillez choisir un autre approbateur pour \u00E9viter un flux de travail circulaire.");
        },
        emptyContent: {
            title: 'Aucun membre à afficher',
            expensesFromSubtitle: "Tous les membres de l'espace de travail appartiennent déjà à un flux de travail d'approbation existant.",
            approverSubtitle: 'Tous les approbateurs appartiennent à un flux de travail existant.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: "La soumission retardée n'a pas pu être modifiée. Veuillez réessayer ou contacter le support.",
        autoReportingFrequencyErrorMessage: "La fréquence de soumission n'a pas pu être modifiée. Veuillez réessayer ou contacter le support.",
        monthlyOffsetErrorMessage: "La fréquence mensuelle n'a pas pu être modifiée. Veuillez réessayer ou contacter le support.",
    },
    workflowsCreateApprovalsPage: {
        title: 'Confirmer',
        header: "Ajoutez plus d'approbateurs et confirmez.",
        additionalApprover: 'Approbateur supplémentaire',
        submitButton: 'Ajouter un flux de travail',
    },
    workflowsEditApprovalsPage: {
        title: "Modifier le flux de travail d'approbation",
        deleteTitle: "Supprimer le flux de travail d'approbation",
        deletePrompt: "Êtes-vous sûr de vouloir supprimer ce flux de travail d'approbation ? Tous les membres suivront ensuite le flux de travail par défaut.",
    },
    workflowsExpensesFromPage: {
        title: 'Dépenses de',
        header: 'Lorsque les membres suivants soumettent des dépenses :',
    },
    workflowsApproverPage: {
        genericErrorMessage: "L'approbateur n'a pas pu être modifié. Veuillez réessayer ou contacter le support.",
        header: 'Envoyer à ce membre pour approbation :',
    },
    workflowsPayerPage: {
        title: 'Payeur autorisé',
        genericErrorMessage: "Le payeur autorisé n'a pas pu être modifié. Veuillez réessayer.",
        admins: 'Admins',
        payer: 'Payer',
        paymentAccount: 'Compte de paiement',
    },
    reportFraudPage: {
        title: 'Signaler une fraude à la carte virtuelle',
        description: 'Si les détails de votre carte virtuelle ont été volés ou compromis, nous désactiverons définitivement votre carte existante et vous fournirons une nouvelle carte virtuelle et un nouveau numéro.',
        deactivateCard: 'Désactiver la carte',
        reportVirtualCardFraud: 'Signaler une fraude à la carte virtuelle',
    },
    reportFraudConfirmationPage: {
        title: 'Fraude à la carte signalée',
        description: 'Nous avons désactivé votre carte existante de façon permanente. Lorsque vous reviendrez pour consulter les détails de votre carte, une nouvelle carte virtuelle sera disponible.',
        buttonText: 'Compris, merci !',
    },
    activateCardPage: {
        activateCard: 'Activer la carte',
        pleaseEnterLastFour: 'Veuillez entrer les quatre derniers chiffres de votre carte.',
        activatePhysicalCard: 'Activer la carte physique',
        error: {
            thatDidNotMatch: 'Cela ne correspondait pas aux 4 derniers chiffres de votre carte. Veuillez réessayer.',
            throttled: 'Vous avez saisi incorrectement les 4 derniers chiffres de votre carte Expensify trop de fois. Si vous êtes sûr que les chiffres sont corrects, veuillez contacter Concierge pour résoudre le problème. Sinon, réessayez plus tard.',
        },
    },
    getPhysicalCard: {
        header: 'Obtenir une carte physique',
        nameMessage: 'Entrez votre prénom et votre nom, car ils seront affichés sur votre carte.',
        legalName: 'Nom légal',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        phoneMessage: 'Entrez votre numéro de téléphone.',
        phoneNumber: 'Numéro de téléphone',
        address: 'Adresse',
        addressMessage: 'Entrez votre adresse de livraison.',
        streetAddress: 'Adresse postale',
        city: 'Ville',
        state: 'État',
        zipPostcode: 'Code postal',
        country: 'Pays',
        confirmMessage: 'Veuillez confirmer vos informations ci-dessous.',
        estimatedDeliveryMessage: 'Votre carte physique arrivera dans 2 à 3 jours ouvrables.',
        next: 'Suivant',
        getPhysicalCard: 'Obtenir une carte physique',
        shipCard: "Carte d'expédition",
    },
    transferAmountPage: {
        transfer: function (_a) {
            var amount = _a.amount;
            return "Transfer".concat(amount ? " ".concat(amount) : '');
        },
        instant: 'Instantané (carte de débit)',
        instantSummary: function (_a) {
            var rate = _a.rate, minAmount = _a.minAmount;
            return "".concat(rate, "% de frais (").concat(minAmount, " minimum)");
        },
        ach: '1 à 3 jours ouvrables (Compte bancaire)',
        achSummary: 'Pas de frais',
        whichAccount: 'Quel compte ?',
        fee: 'Frais',
        transferSuccess: 'Transfert réussi !',
        transferDetailBankAccount: 'Votre argent devrait arriver dans les 1 à 3 jours ouvrables.',
        transferDetailDebitCard: 'Votre argent devrait arriver immédiatement.',
        failedTransfer: "Votre solde n'est pas entièrement réglé. Veuillez transférer vers un compte bancaire.",
        notHereSubTitle: 'Veuillez transférer votre solde depuis la page du portefeuille.',
        goToWallet: 'Aller au Portefeuille',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Choisir un compte',
    },
    paymentMethodList: {
        addPaymentMethod: 'Ajouter un mode de paiement',
        addNewDebitCard: 'Ajouter une nouvelle carte de débit',
        addNewBankAccount: 'Ajouter un nouveau compte bancaire',
        accountLastFour: 'Se terminant par',
        cardLastFour: 'Carte se terminant par',
        addFirstPaymentMethod: "Ajoutez un mode de paiement pour envoyer et recevoir des paiements directement dans l'application.",
        defaultPaymentMethod: 'Par défaut',
    },
    preferencesPage: {
        appSection: {
            title: "Préférences de l'application",
        },
        testSection: {
            title: 'Tester les préférences',
            subtitle: "Paramètres pour aider à déboguer et tester l'application en staging.",
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: "Recevez des mises à jour de fonctionnalités pertinentes et des nouvelles d'Expensify",
        muteAllSounds: "Couper tous les sons d'Expensify",
    },
    priorityModePage: {
        priorityMode: 'Mode priorité',
        explainerText: 'Choisissez de #focus sur les discussions non lues et épinglées uniquement, ou affichez tout avec les discussions les plus récentes et épinglées en haut.',
        priorityModes: {
            default: {
                label: 'Plus récent',
                description: 'Afficher toutes les discussions triées par les plus récentes',
            },
            gsd: {
                label: '#focus',
                description: 'Afficher uniquement les non lus triés par ordre alphabétique',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: function (_a) {
            var policyName = _a.policyName;
            return "dans ".concat(policyName);
        },
        generatingPDF: 'Génération du PDF',
        waitForPDF: 'Veuillez patienter pendant que nous générons le PDF',
        errorPDF: "Une erreur s'est produite lors de la tentative de génération de votre PDF.",
        generatedPDF: 'Votre rapport PDF a été généré !',
    },
    reportDescriptionPage: {
        roomDescription: 'Description de la chambre',
        roomDescriptionOptional: 'Description de la salle (facultatif)',
        explainerText: 'Définir une description personnalisée pour la salle.',
    },
    groupChat: {
        lastMemberTitle: 'Attention !',
        lastMemberWarning: 'Puisque vous êtes la dernière personne ici, partir rendra cette discussion inaccessible à tous les membres. Êtes-vous sûr de vouloir partir ?',
        defaultReportName: function (_a) {
            var displayName = _a.displayName;
            return "Discussion de groupe de ".concat(displayName);
        },
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
                label: 'Lumière',
            },
            system: {
                label: "Utiliser les paramètres de l'appareil",
            },
        },
        chooseThemeBelowOrSync: 'Choisissez un thème ci-dessous ou synchronisez avec les paramètres de votre appareil.',
    },
    termsOfUse: {
        phrase1: 'En vous connectant, vous acceptez les',
        phrase2: "Conditions d'utilisation",
        phrase3: 'et',
        phrase4: 'Confidentialité',
        phrase5: "La transmission d'argent est fournie par ".concat(CONST_1.default.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS, " (NMLS ID:2017010) conform\u00E9ment \u00E0 ses"),
        phrase6: 'licences',
    },
    validateCodeForm: {
        magicCodeNotReceived: "Vous n'avez pas reçu de code magique ?",
        enterAuthenticatorCode: "Veuillez entrer votre code d'authentification",
        enterRecoveryCode: 'Veuillez entrer votre code de récupération',
        requiredWhen2FAEnabled: "Requis lorsque l'authentification à deux facteurs est activée",
        requestNewCode: 'Demander un nouveau code dans',
        requestNewCodeAfterErrorOccurred: 'Demander un nouveau code',
        error: {
            pleaseFillMagicCode: 'Veuillez entrer votre code magique',
            incorrectMagicCode: 'Code magique incorrect ou invalide. Veuillez réessayer ou demander un nouveau code.',
            pleaseFillTwoFactorAuth: "Veuillez entrer votre code d'authentification à deux facteurs",
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Veuillez remplir tous les champs',
        pleaseFillPassword: 'Veuillez entrer votre mot de passe',
        pleaseFillTwoFactorAuth: 'Veuillez entrer votre code de double authentification',
        enterYourTwoFactorAuthenticationCodeToContinue: "Entrez votre code d'authentification à deux facteurs pour continuer",
        forgot: 'Oublié ?',
        requiredWhen2FAEnabled: "Requis lorsque l'authentification à deux facteurs est activée",
        error: {
            incorrectPassword: 'Mot de passe incorrect. Veuillez réessayer.',
            incorrectLoginOrPassword: 'Identifiant ou mot de passe incorrect. Veuillez réessayer.',
            incorrect2fa: "Code d'authentification à deux facteurs incorrect. Veuillez réessayer.",
            twoFactorAuthenticationEnabled: "Vous avez activé l'authentification à deux facteurs sur ce compte. Veuillez vous connecter en utilisant votre e-mail ou votre numéro de téléphone.",
            invalidLoginOrPassword: 'Identifiant ou mot de passe invalide. Veuillez réessayer ou réinitialiser votre mot de passe.',
            unableToResetPassword: "Nous n'avons pas pu changer votre mot de passe. Cela est probablement dû à un lien de réinitialisation de mot de passe expiré dans un ancien e-mail de réinitialisation de mot de passe. Nous vous avons envoyé un nouveau lien par e-mail afin que vous puissiez réessayer. Vérifiez votre boîte de réception et votre dossier de spam ; il devrait arriver dans quelques minutes.",
            noAccess: "Vous n'avez pas accès à cette application. Veuillez ajouter votre nom d'utilisateur GitHub pour obtenir l'accès.",
            accountLocked: 'Votre compte a été verrouillé après trop de tentatives infructueuses. Veuillez réessayer dans 1 heure.',
            fallback: 'Un problème est survenu. Veuillez réessayer plus tard.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Téléphone ou e-mail',
        error: {
            invalidFormatEmailLogin: "L'email saisie est invalide. Veuillez corriger le format et réessayer.",
        },
        cannotGetAccountDetails: 'Impossible de récupérer les détails du compte. Veuillez essayer de vous reconnecter.',
        loginForm: 'Formulaire de connexion',
        notYou: function (_a) {
            var user = _a.user;
            return "Pas ".concat(user, " ?");
        },
    },
    onboarding: {
        welcome: 'Bienvenue !',
        welcomeSignOffTitleManageTeam: "Une fois que vous aurez terminé les tâches ci-dessus, nous pourrons explorer davantage de fonctionnalités comme les flux de travail d'approbation et les règles !",
        welcomeSignOffTitle: 'Ravi de vous rencontrer !',
        explanationModal: {
            title: 'Bienvenue sur Expensify',
            description: 'Une application pour gérer vos dépenses professionnelles et personnelles à la vitesse de la conversation. Essayez-la et faites-nous savoir ce que vous en pensez. Beaucoup plus à venir !',
            secondaryDescription: "Pour revenir à Expensify Classic, il suffit d'appuyer sur votre photo de profil > Aller à Expensify Classic.",
        },
        welcomeVideo: {
            title: 'Bienvenue sur Expensify',
            description: 'Une application pour gérer toutes vos dépenses professionnelles et personnelles dans un chat. Conçue pour votre entreprise, votre équipe et vos amis.',
        },
        getStarted: 'Commencer',
        whatsYourName: 'Quel est votre nom ?',
        peopleYouMayKnow: 'Des personnes que vous connaissez sont déjà ici ! Vérifiez votre e-mail pour les rejoindre.',
        workspaceYouMayJoin: function (_a) {
            var domain = _a.domain, email = _a.email;
            return "Quelqu'un de ".concat(domain, " a d\u00E9j\u00E0 cr\u00E9\u00E9 un espace de travail. Veuillez entrer le code magique envoy\u00E9 \u00E0 ").concat(email, ".");
        },
        joinAWorkspace: 'Rejoindre un espace de travail',
        listOfWorkspaces: 'Voici la liste des espaces de travail que vous pouvez rejoindre. Ne vous inquiétez pas, vous pouvez toujours les rejoindre plus tard si vous le préférez.',
        workspaceMemberList: function (_a) {
            var employeeCount = _a.employeeCount, policyOwner = _a.policyOwner;
            return "".concat(employeeCount, " membre").concat(employeeCount > 1 ? 's' : '', " \u2022 ").concat(policyOwner);
        },
        whereYouWork: 'Où travaillez-vous ?',
        errorSelection: 'Sélectionnez une option pour continuer',
        purpose: (_c = {
                title: "Que voulez-vous faire aujourd'hui ?",
                errorContinue: 'Veuillez appuyer sur continuer pour commencer la configuration.',
                errorBackButton: "Veuillez terminer les questions de configuration pour commencer à utiliser l'application."
            },
            _c[CONST_1.default.ONBOARDING_CHOICES.EMPLOYER] = 'Être remboursé par mon employeur',
            _c[CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM] = 'Gérer les dépenses de mon équipe',
            _c[CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND] = 'Suivre et budgétiser les dépenses',
            _c[CONST_1.default.ONBOARDING_CHOICES.CHAT_SPLIT] = 'Discutez et partagez les dépenses avec des amis',
            _c[CONST_1.default.ONBOARDING_CHOICES.LOOKING_AROUND] = "Quelque chose d'autre",
            _c),
        employees: (_d = {
                title: "Combien d'employés avez-vous ?"
            },
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MICRO] = '1-10 employés',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.SMALL] = '11-50 employés',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL] = '51-100 employés',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MEDIUM] = '101-1 000 employés',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.LARGE] = 'Plus de 1 000 employés',
            _d),
        accounting: {
            title: 'Utilisez-vous un logiciel de comptabilité ?',
            none: 'Aucun',
        },
        error: {
            requiredFirstName: 'Veuillez entrer votre prénom pour continuer',
        },
        workEmail: {
            title: 'Quelle est votre adresse e-mail professionnelle ?',
            subtitle: 'Expensify fonctionne mieux lorsque vous connectez votre e-mail professionnel.',
            explanationModal: {
                descriptionOne: 'Transférez à receipts@expensify.com pour numérisation',
                descriptionTwo: 'Rejoignez vos collègues qui utilisent déjà Expensify',
                descriptionThree: "Profitez d'une expérience plus personnalisée",
            },
            addWorkEmail: 'Ajouter un e-mail professionnel',
        },
        workEmailValidation: {
            title: 'Vérifiez votre adresse e-mail professionnelle',
            magicCodeSent: function (_a) {
                var workEmail = _a.workEmail;
                return "Veuillez entrer le code magique envoy\u00E9 \u00E0 ".concat(workEmail, ". Il devrait arriver dans une minute ou deux.");
            },
        },
        workEmailValidationError: {
            publicEmail: "Veuillez entrer une adresse e-mail professionnelle valide provenant d'un domaine privé, par exemple mitch@company.com.",
            offline: "Nous n'avons pas pu ajouter votre e-mail professionnel car vous semblez être hors ligne.",
        },
        mergeBlockScreen: {
            title: "Impossible d'ajouter l'email professionnel",
            subtitle: function (_a) {
                var workEmail = _a.workEmail;
                return "Nous n'avons pas pu ajouter ".concat(workEmail, ". Veuillez r\u00E9essayer plus tard dans les Param\u00E8tres ou discuter avec Concierge pour obtenir de l'aide.");
            },
        },
        tasks: {
            testDriveAdminTask: {
                title: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "Faites un [essai gratuit](".concat(testDriveURL, ")");
                },
                description: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "[Faites une visite rapide du produit](".concat(testDriveURL, ") pour d\u00E9couvrir pourquoi Expensify est le moyen le plus rapide de g\u00E9rer vos notes de frais.");
                },
            },
            testDriveEmployeeTask: {
                title: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "Faites un [essai gratuit](".concat(testDriveURL, ")");
                },
                description: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "Essayez-nous avec un [essai gratuit](".concat(testDriveURL, ") et offrez \u00E0 votre \u00E9quipe *3 mois gratuits sur Expensify !*");
                },
            },
            createTestDriveAdminWorkspaceTask: {
                title: function (_a) {
                    var workspaceConfirmationLink = _a.workspaceConfirmationLink;
                    return "[Cr\u00E9ez](".concat(workspaceConfirmationLink, ") un espace de travail");
                },
                description: 'Créez un espace de travail et configurez les paramètres avec l’aide de votre spécialiste de configuration !',
            },
            createWorkspaceTask: {
                title: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return "Cr\u00E9ez un [espace de travail](".concat(workspaceSettingsLink, ")");
                },
                description: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return '*Créez un espace de travail* pour suivre les dépenses, scanner les reçus, discuter, et plus encore.\n\n' +
                        '1. Cliquez sur *Espaces de travail* > *Nouvel espace de travail*.\n\n' +
                        "*Votre nouvel espace est pr\u00EAt !* [Voir maintenant](".concat(workspaceSettingsLink, ").");
                },
            },
            setupCategoriesTask: {
                title: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink;
                    return "Configurez les [cat\u00E9gories](".concat(workspaceCategoriesLink, ")");
                },
                description: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink;
                    return '*Configurez les catégories* pour que votre équipe puisse coder les dépenses facilement.\n\n' +
                        '1. Cliquez sur *Espaces de travail*.\n' +
                        '3. Sélectionnez votre espace.\n' +
                        '4. Cliquez sur *Catégories*.\n' +
                        '5. Désactivez les catégories inutiles.\n' +
                        '6. Ajoutez vos propres catégories en haut à droite.\n\n' +
                        "[Acc\u00E9der aux param\u00E8tres de cat\u00E9gories](".concat(workspaceCategoriesLink, ").\n\n") +
                        "![Configurer les cat\u00E9gories](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-categories-v2.mp4)");
                },
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Soumettre une dépense',
                description: '*Soumettez une dépense* en saisissant un montant ou en scannant un reçu.\n\n' +
                    '1. Cliquez sur le bouton vert *+*.\n' +
                    '2. Choisissez *Créer une dépense*.\n' +
                    '3. Saisissez un montant ou scannez un reçu.\n' +
                    "4. Ajoutez l\u2019email ou num\u00E9ro de t\u00E9l\u00E9phone de votre responsable.\n" +
                    '5. Cliquez sur *Créer*.\n\n' +
                    'Et voilà, c’est fait !',
            },
            adminSubmitExpenseTask: {
                title: 'Soumettre une dépense',
                description: '*Soumettez une dépense* en saisissant un montant ou en scannant un reçu.\n\n' +
                    '1. Cliquez sur le bouton vert *+*.\n' +
                    '2. Choisissez *Créer une dépense*.\n' +
                    '3. Saisissez un montant ou scannez un reçu.\n' +
                    '4. Confirmez les détails.\n' +
                    '5. Cliquez sur *Créer*.\n\n' +
                    'Et voilà, c’est fait !',
            },
            trackExpenseTask: {
                title: 'Suivre une dépense',
                description: '*Suivez une dépense* dans n’importe quelle devise, avec ou sans reçu.\n\n' +
                    '1. Cliquez sur le bouton vert *+*.\n' +
                    '2. Choisissez *Créer une dépense*.\n' +
                    '3. Saisissez un montant ou scannez un reçu.\n' +
                    '4. Choisissez votre espace *personnel*.\n' +
                    '5. Cliquez sur *Créer*.\n\n' +
                    'Et voilà, aussi simple que ça.',
            },
            addAccountingIntegrationTask: {
                title: function (_a) {
                    var integrationName = _a.integrationName, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "Connecter".concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : ' à', " [").concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? 'votre' : '', " ").concat(integrationName, "](").concat(workspaceAccountingLink, ")");
                },
                description: function (_a) {
                    var integrationName = _a.integrationName, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "Connectez".concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? '-vous à votre' : '-vous à', " ").concat(integrationName, " pour automatiser le codage et la synchronisation des d\u00E9penses. La cl\u00F4ture mensuelle devient un jeu d\u2019enfant.\n") +
                        '\n' +
                        '1. Cliquez sur *Paramètres*.\n' +
                        '2. Accédez à *Espaces de travail*.\n' +
                        '3. Sélectionnez votre espace.\n' +
                        '4. Cliquez sur *Comptabilité*.\n' +
                        "5. Trouvez ".concat(integrationName, ".\n") +
                        '6. Cliquez sur *Connecter*.\n\n' +
                        "".concat(integrationName && CONST_1.default.connectionsVideoPaths[integrationName]
                            ? "[Acc\u00E9der \u00E0 la comptabilit\u00E9](".concat(workspaceAccountingLink, ").\n\n![Connecter ").concat(integrationName, "](").concat(CONST_1.default.CLOUDFRONT_URL, "/").concat(CONST_1.default.connectionsVideoPaths[integrationName], ")")
                            : "[Acc\u00E9der \u00E0 la comptabilit\u00E9](".concat(workspaceAccountingLink, ")."));
                },
            },
            connectCorporateCardTask: {
                title: function (_a) {
                    var corporateCardLink = _a.corporateCardLink;
                    return "Connecter [votre carte pro](".concat(corporateCardLink, ")");
                },
                description: function (_a) {
                    var corporateCardLink = _a.corporateCardLink;
                    return "Connectez votre carte pro pour importer et coder automatiquement les d\u00E9penses.\n\n" +
                        '1. Cliquez sur *Espaces de travail*.\n' +
                        '2. Sélectionnez votre espace.\n' +
                        '3. Cliquez sur *Cartes professionnelles*.\n' +
                        '4. Suivez les instructions pour connecter votre carte.\n\n' +
                        "[Acc\u00E9der \u00E0 la connexion carte pro](".concat(corporateCardLink, ").");
                },
            },
            inviteTeamTask: {
                title: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return "Invitez [votre \u00E9quipe](".concat(workspaceMembersLink, ")");
                },
                description: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return '*Invitez votre équipe* sur Expensify pour qu’ils commencent à suivre leurs dépenses dès aujourd’hui.\n\n' +
                        '1. Cliquez sur *Espaces de travail*.\n' +
                        '3. Sélectionnez votre espace.\n' +
                        '4. Cliquez sur *Membres* > *Inviter un membre*.\n' +
                        '5. Entrez des emails ou numéros de téléphone.\n' +
                        '6. Ajoutez un message personnalisé si vous le souhaitez !\n\n' +
                        "[Acc\u00E9der aux membres](".concat(workspaceMembersLink, ").\n\n") +
                        "![Inviter votre \u00E9quipe](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-invite_members-v2.mp4)");
                },
            },
            setupCategoriesAndTags: {
                title: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink, workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return "Configurer les [cat\u00E9gories](".concat(workspaceCategoriesLink, ") et [tags](").concat(workspaceMoreFeaturesLink, ")");
                },
                description: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return '*Configurez les catégories et tags* pour aider votre équipe à coder les dépenses plus facilement.\n\n' +
                        "Importez-les automatiquement en [connectant votre logiciel comptable](".concat(workspaceAccountingLink, "), ou configurez-les manuellement dans les [param\u00E8tres de l\u2019espace](").concat(workspaceCategoriesLink, ").");
                },
            },
            setupTagsTask: {
                title: function (_a) {
                    var workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return "Configurer les [tags](".concat(workspaceMoreFeaturesLink, ")");
                },
                description: function (_a) {
                    var workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return 'Utilisez les tags pour ajouter des détails comme projets, clients, emplacements et départements. Pour plusieurs niveaux de tags, passez au plan Control.\n\n' +
                        '1. Cliquez sur *Espaces de travail*.\n' +
                        '3. Sélectionnez votre espace.\n' +
                        '4. Cliquez sur *Fonctionnalités supplémentaires*.\n' +
                        '5. Activez *Tags*.\n' +
                        '6. Allez dans *Tags* dans l’éditeur.\n' +
                        '7. Cliquez sur *+ Ajouter un tag* pour en créer un.\n\n' +
                        "[Acc\u00E9der aux fonctionnalit\u00E9s suppl\u00E9mentaires](".concat(workspaceMoreFeaturesLink, ").\n\n") +
                        "![Configurer les tags](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-tags-v2.mp4)");
                },
            },
            inviteAccountantTask: {
                title: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return "Invitez votre [comptable](".concat(workspaceMembersLink, ")");
                },
                description: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return '*Invitez votre comptable* à collaborer dans votre espace de travail et à gérer les dépenses de votre entreprise.\n' +
                        '\n' +
                        '1. Cliquez sur *Espaces de travail*.\n' +
                        '2. Sélectionnez votre espace.\n' +
                        '3. Cliquez sur *Membres*.\n' +
                        '4. Cliquez sur *Inviter un membre*.\n' +
                        '5. Saisissez l’adresse e-mail de votre comptable.\n' +
                        '\n' +
                        "[Invitez votre comptable maintenant](".concat(workspaceMembersLink, ").");
                },
            },
            startChatTask: {
                title: 'Démarrer un chat',
                description: '*Démarrez un chat* avec quelqu’un grâce à son email ou numéro.\n\n' +
                    '1. Cliquez sur le bouton vert *+*.\n' +
                    '2. Choisissez *Démarrer un chat*.\n' +
                    '3. Entrez un email ou numéro de téléphone.\n\n' +
                    'S’ils ne sont pas encore sur Expensify, une invitation sera envoyée automatiquement.\n\n' +
                    'Chaque chat devient aussi un email ou SMS auquel ils peuvent répondre.',
            },
            splitExpenseTask: {
                title: 'Partager une dépense',
                description: '*Partagez une dépense* avec une ou plusieurs personnes.\n\n' +
                    '1. Cliquez sur le bouton vert *+*.\n' +
                    '2. Choisissez *Démarrer un chat*.\n' +
                    '3. Entrez des emails ou numéros de téléphone.\n' +
                    '4. Cliquez sur le bouton gris *+* > *Partager une dépense*.\n' +
                    '5. Créez la dépense : *Manuelle*, *Scan*, ou *Distance*.\n\n' +
                    'Ajoutez plus de détails si vous le souhaitez, ou envoyez simplement. On vous rembourse vite !',
            },
            reviewWorkspaceSettingsTask: {
                title: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return "V\u00E9rifiez les [param\u00E8tres de l\u2019espace](".concat(workspaceSettingsLink, ")");
                },
                description: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return 'Voici comment vérifier et mettre à jour vos paramètres :\n' +
                        '1. Cliquez sur l’onglet paramètres.\n' +
                        '2. Cliquez sur *Espaces de travail* > [Votre espace].\n' +
                        "[Acc\u00E9der \u00E0 votre espace](".concat(workspaceSettingsLink, "). Nous suivrons les changements dans la salle #admins.");
                },
            },
            createReportTask: {
                title: 'Créer votre premier rapport',
                description: 'Voici comment créer un rapport :\n\n' +
                    '1. Cliquez sur le bouton vert *+*.\n' +
                    '2. Choisissez *Créer un rapport*.\n' +
                    '3. Cliquez sur *Ajouter une dépense*.\n' +
                    '4. Ajoutez votre première dépense.\n\n' +
                    'Et voilà !',
            },
        },
        testDrive: {
            name: function (_a) {
                var testDriveURL = _a.testDriveURL;
                return (testDriveURL ? "Faites un [essai gratuit](".concat(testDriveURL, ")") : 'Faites un essai gratuit');
            },
            embeddedDemoIframeTitle: 'Essai Gratuit',
            employeeFakeReceipt: {
                description: 'Mon reçu de test !',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Se faire rembourser est aussi simple que d’envoyer un message. Voici les bases.',
            onboardingPersonalSpendMessage: 'Voici comment suivre vos dépenses en quelques clics.',
            onboardingMangeTeamMessage: function (_a) {
                var onboardingCompanySize = _a.onboardingCompanySize;
                return "Voici une liste de t\u00E2ches recommand\u00E9e pour une entreprise de votre taille avec ".concat(onboardingCompanySize, " soumetteurs :");
            },
            onboardingTrackWorkspaceMessage: '# Configurons votre espace\n👋 Je suis là pour vous aider ! J’ai personnalisé votre espace pour les entrepreneurs individuels et entreprises similaires. Vous pouvez le modifier via le lien ci-dessous.\n\nVoici comment suivre vos dépenses rapidement :',
            onboardingChatSplitMessage: 'Partager des dépenses entre amis est aussi simple qu’un message. Voici comment faire.',
            onboardingAdminMessage: 'Apprenez à gérer l’espace de votre équipe en tant qu’admin et soumettez vos propres dépenses.',
            onboardingLookingAroundMessage: 'Expensify est surtout connu pour les dépenses, les voyages et les cartes pro, mais ce n’est pas tout. Dites-moi ce qui vous intéresse et je vous guiderai.',
            onboardingTestDriveReceiverMessage: '*Vous avez droit à 3 mois gratuits ! Lancez-vous ci-dessous.*',
        },
        workspace: {
            title: 'Restez organisé avec un espace de travail',
            subtitle: 'Débloquez des outils puissants pour simplifier la gestion de vos dépenses, le tout en un seul endroit. Avec un espace de travail, vous pouvez :',
            explanationModal: {
                descriptionOne: 'Suivre et organiser les reçus',
                descriptionTwo: 'Catégoriser et étiqueter les dépenses',
                descriptionThree: 'Créer et partager des rapports',
            },
            price: "Essayez-le gratuitement pendant 30 jours, puis passez à l'abonnement pour seulement <strong>5 $/mois</strong>.",
            createWorkspace: 'Créer un espace de travail',
        },
        confirmWorkspace: {
            title: "Confirmer l'espace de travail",
            subtitle: 'Créez un espace de travail pour suivre les reçus, rembourser les dépenses, gérer les voyages, créer des rapports, et plus encore — tout à la vitesse de la discussion.',
        },
        inviteMembers: {
            title: 'Inviter des membres',
            subtitle: 'Gérez et partagez vos dépenses avec un comptable ou créez un groupe de voyage avec des amis.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Ne plus me montrer ceci',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Le nom ne peut pas contenir les mots Expensify ou Concierge',
            hasInvalidCharacter: 'Le nom ne peut pas contenir de virgule ou de point-virgule',
            requiredFirstName: 'Le prénom ne peut pas être vide',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Quel est votre nom légal ?',
        enterDateOfBirth: 'Quelle est votre date de naissance ?',
        enterAddress: 'Quelle est votre adresse ?',
        enterPhoneNumber: 'Quel est votre numéro de téléphone ?',
        personalDetails: 'Détails personnels',
        privateDataMessage: 'Ces détails sont utilisés pour les voyages et les paiements. Ils ne sont jamais affichés sur votre profil public.',
        legalName: 'Nom légal',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        address: 'Adresse',
        error: {
            dateShouldBeBefore: function (_a) {
                var dateString = _a.dateString;
                return "La date doit \u00EAtre avant ".concat(dateString);
            },
            dateShouldBeAfter: function (_a) {
                var dateString = _a.dateString;
                return "La date doit \u00EAtre apr\u00E8s ".concat(dateString);
            },
            hasInvalidCharacter: 'Le nom ne peut inclure que des caractères latins.',
            incorrectZipFormat: function (_a) {
                var _b = _a === void 0 ? {} : _a, zipFormat = _b.zipFormat;
                return "Format de code postal incorrect".concat(zipFormat ? "Format acceptable : ".concat(zipFormat) : '');
            },
            invalidPhoneNumber: "Veuillez vous assurer que le num\u00E9ro de t\u00E9l\u00E9phone est valide (par exemple, ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")"),
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Le lien a été renvoyé',
        weSentYouMagicSignInLink: function (_a) {
            var login = _a.login, loginType = _a.loginType;
            return "J'ai envoy\u00E9 un lien magique de connexion \u00E0 ".concat(login, ". Veuillez v\u00E9rifier votre ").concat(loginType, " pour vous connecter.");
        },
        resendLink: 'Renvoyer le lien',
    },
    unlinkLoginForm: {
        toValidateLogin: function (_a) {
            var primaryLogin = _a.primaryLogin, secondaryLogin = _a.secondaryLogin;
            return "Pour valider ".concat(secondaryLogin, ", veuillez renvoyer le code magique depuis les Param\u00E8tres du compte de ").concat(primaryLogin, ".");
        },
        noLongerHaveAccess: function (_a) {
            var primaryLogin = _a.primaryLogin;
            return "Si vous n'avez plus acc\u00E8s \u00E0 ".concat(primaryLogin, ", veuillez dissocier vos comptes.");
        },
        unlink: 'Dissocier',
        linkSent: 'Lien envoyé !',
        successfullyUnlinkedLogin: 'Connexion secondaire dissociée avec succès !',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: function (_a) {
            var login = _a.login;
            return "Notre fournisseur de messagerie a temporairement suspendu les emails vers ".concat(login, " en raison de probl\u00E8mes de livraison. Pour d\u00E9bloquer votre connexion, veuillez suivre ces \u00E9tapes :");
        },
        confirmThat: function (_a) {
            var login = _a.login;
            return "Confirmez que ".concat(login, " est orthographi\u00E9 correctement et qu'il s'agit d'une adresse e-mail r\u00E9elle et valide.");
        },
        emailAliases: 'Les alias d\'e-mail tels que "expenses@domain.com" doivent avoir accès à leur propre boîte de réception pour être un identifiant Expensify valide.',
        ensureYourEmailClient: 'Assurez-vous que votre client de messagerie autorise les emails de expensify.com.',
        youCanFindDirections: 'Vous pouvez trouver des instructions sur la façon de compléter cette étape',
        helpConfigure: 'mais vous pourriez avoir besoin de votre service informatique pour vous aider à configurer vos paramètres de messagerie.',
        onceTheAbove: 'Une fois les étapes ci-dessus terminées, veuillez contacter',
        toUnblock: 'pour débloquer votre connexion.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: function (_a) {
            var login = _a.login;
            return "Nous n'avons pas pu livrer les messages SMS \u00E0 ".concat(login, ", nous l'avons donc suspendu temporairement. Veuillez essayer de valider votre num\u00E9ro :");
        },
        validationSuccess: 'Votre numéro a été validé ! Cliquez ci-dessous pour envoyer un nouveau code de connexion magique.',
        validationFailed: function (_a) {
            var _b;
            var timeData = _a.timeData;
            if (!timeData) {
                return 'Veuillez patienter un moment avant de réessayer.';
            }
            var timeParts = [];
            if (timeData.days) {
                timeParts.push("".concat(timeData.days, " ").concat(timeData.days === 1 ? 'jour' : 'jours'));
            }
            if (timeData.hours) {
                timeParts.push("".concat(timeData.hours, " ").concat(timeData.hours === 1 ? 'heure' : 'heures'));
            }
            if (timeData.minutes) {
                timeParts.push("".concat(timeData.minutes, " ").concat(timeData.minutes === 1 ? 'minute' : 'minutes'));
            }
            var timeText = '';
            if (timeParts.length === 1) {
                timeText = (_b = timeParts.at(0)) !== null && _b !== void 0 ? _b : '';
            }
            else if (timeParts.length === 2) {
                timeText = "".concat(timeParts.at(0), " and ").concat(timeParts.at(1));
            }
            else if (timeParts.length === 3) {
                timeText = "".concat(timeParts.at(0), ", ").concat(timeParts.at(1), ", and ").concat(timeParts.at(2));
            }
            return "Patientez un peu ! Vous devez attendre ".concat(timeText, " avant de r\u00E9essayer de valider votre num\u00E9ro.");
        },
    },
    welcomeSignUpForm: {
        join: 'Rejoindre',
    },
    detailsPage: {
        localTime: 'Heure locale',
    },
    newChatPage: {
        startGroup: 'Démarrer un groupe',
        addToGroup: 'Ajouter au groupe',
    },
    yearPickerPage: {
        year: 'Année',
        selectYear: 'Veuillez sélectionner une année',
    },
    focusModeUpdateModal: {
        title: 'Bienvenue en mode #focus !',
        prompt: 'Restez au courant des choses en ne voyant que les discussions non lues ou celles qui nécessitent votre attention. Ne vous inquiétez pas, vous pouvez changer cela à tout moment dans',
        settings: 'paramètres',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Le chat que vous recherchez est introuvable.',
        getMeOutOfHere: "Sortez-moi d'ici",
        iouReportNotFound: 'Les détails de paiement que vous recherchez ne peuvent pas être trouvés.',
        notHere: "Hmm... ce n'est pas là.",
        pageNotFound: 'Oups, cette page est introuvable',
        noAccess: "Ce chat ou cette dépense a peut-être été supprimé ou vous n'y avez pas accès.\n\nPour toute question, veuillez contacter concierge@expensify.com",
        goBackHome: "Retourner à la page d'accueil",
    },
    errorPage: {
        title: function (_a) {
            var isBreakLine = _a.isBreakLine;
            return "Oups... ".concat(isBreakLine ? '\n' : '', "Quelque chose a mal tourn\u00E9");
        },
        subtitle: "Votre demande n'a pas pu être complétée. Veuillez réessayer plus tard.",
    },
    setPasswordPage: {
        enterPassword: 'Entrez un mot de passe',
        setPassword: 'Définir le mot de passe',
        newPasswordPrompt: 'Votre mot de passe doit comporter au moins 8 caractères, 1 lettre majuscule, 1 lettre minuscule et 1 chiffre.',
        passwordFormTitle: 'Bienvenue dans le nouveau Expensify ! Veuillez définir votre mot de passe.',
        passwordNotSet: "Nous n'avons pas pu définir votre nouveau mot de passe. Nous vous avons envoyé un nouveau lien pour réessayer.",
        setPasswordLinkInvalid: 'Ce lien de réinitialisation de mot de passe est invalide ou a expiré. Un nouveau vous attend dans votre boîte de réception !',
        validateAccount: 'Vérifier le compte',
    },
    statusPage: {
        status: 'Statut',
        statusExplanation: 'Ajoutez un emoji pour donner à vos collègues et amis un moyen facile de savoir ce qui se passe. Vous pouvez également ajouter un message si vous le souhaitez !',
        today: "Aujourd'hui",
        clearStatus: 'Effacer le statut',
        save: 'Enregistrer',
        message: 'Message',
        timePeriods: {
            never: 'Never',
            thirtyMinutes: '30 minutes',
            oneHour: '1 heure',
            afterToday: "Aujourd'hui",
            afterWeek: 'Une semaine',
            custom: 'Custom',
        },
        untilTomorrow: 'À demain',
        untilTime: function (_a) {
            var time = _a.time;
            return "Jusqu'\u00E0 ".concat(time);
        },
        date: 'Date',
        time: 'Temps',
        clearAfter: 'Effacer après',
        whenClearStatus: 'Quand devrions-nous effacer votre statut ?',
        vacationDelegate: 'Délégué de vacances',
        setVacationDelegate: "D\u00E9finissez un d\u00E9l\u00E9gu\u00E9 de vacances pour approuver les rapports en votre absence.",
        vacationDelegateError: 'Une erreur est survenue lors de la mise à jour de votre délégué de vacances.',
        asVacationDelegate: function (_a) {
            var managerName = _a.nameOrEmail;
            return "en tant que d\u00E9l\u00E9gu\u00E9 de vacances de ".concat(managerName);
        },
        toAsVacationDelegate: function (_a) {
            var submittedToName = _a.submittedToName, vacationDelegateName = _a.vacationDelegateName;
            return "\u00E0 ".concat(submittedToName, " en tant que d\u00E9l\u00E9gu\u00E9 de vacances de ").concat(vacationDelegateName);
        },
        vacationDelegateWarning: function (_a) {
            var nameOrEmail = _a.nameOrEmail;
            return "Vous assignez ".concat(nameOrEmail, " en tant que d\u00E9l\u00E9gu\u00E9 de vacances. Il/elle n'est pas encore pr\u00E9sent(e) dans tous vos espaces de travail. Si vous choisissez de continuer, un e-mail sera envoy\u00E9 \u00E0 tous les administrateurs de vos espaces pour l\u2019ajouter.");
        },
    },
    stepCounter: function (_a) {
        var step = _a.step, total = _a.total, text = _a.text;
        var result = "\u00C9tape ".concat(step);
        if (total) {
            result = "".concat(result, " of ").concat(total);
        }
        if (text) {
            result = "".concat(result, ": ").concat(text);
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Infos bancaires',
        confirmBankInfo: 'Confirmer les informations bancaires',
        manuallyAdd: 'Ajoutez manuellement votre compte bancaire',
        letsDoubleCheck: 'Vérifions que tout est correct.',
        accountEnding: 'Compte se terminant par',
        thisBankAccount: 'Ce compte bancaire sera utilisé pour les paiements professionnels sur votre espace de travail.',
        accountNumber: 'Numéro de compte',
        routingNumber: "Numéro d'acheminement",
        chooseAnAccountBelow: 'Choisissez un compte ci-dessous',
        addBankAccount: 'Ajouter un compte bancaire',
        chooseAnAccount: 'Choisissez un compte',
        connectOnlineWithPlaid: 'Connectez-vous à votre banque',
        connectManually: 'Connecter manuellement',
        desktopConnection: 'Remarque : Pour vous connecter à Chase, Wells Fargo, Capital One ou Bank of America, veuillez cliquer ici pour terminer ce processus dans un navigateur.',
        yourDataIsSecure: 'Vos données sont sécurisées',
        toGetStarted: 'Ajoutez un compte bancaire pour rembourser les dépenses, émettre des cartes Expensify, collecter les paiements de factures et payer les factures, le tout depuis un seul endroit.',
        plaidBodyCopy: "Offrez à vos employés un moyen plus simple de payer - et d'être remboursés - pour les dépenses de l'entreprise.",
        checkHelpLine: 'Votre numéro de routage et votre numéro de compte se trouvent sur un chèque pour le compte.',
        hasPhoneLoginError: function (_a) {
            var contactMethodRoute = _a.contactMethodRoute;
            return "Pour connecter un compte bancaire, veuillez <a href=\"".concat(contactMethodRoute, "\">ajoutez un e-mail comme identifiant principal</a> et r\u00E9essayez. Vous pouvez ajouter votre num\u00E9ro de t\u00E9l\u00E9phone comme connexion secondaire.");
        },
        hasBeenThrottledError: "Une erreur s'est produite lors de l'ajout de votre compte bancaire. Veuillez attendre quelques minutes et réessayer.",
        hasCurrencyError: function (_a) {
            var workspaceRoute = _a.workspaceRoute;
            return "Oups ! Il semble que la devise de votre espace de travail soit diff\u00E9rente de l'USD. Pour continuer, veuillez aller sur <a href=\"".concat(workspaceRoute, "\">vos param\u00E8tres d'espace de travail</a> pour le r\u00E9gler sur USD et r\u00E9essayer.");
        },
        error: {
            youNeedToSelectAnOption: 'Veuillez sélectionner une option pour continuer',
            noBankAccountAvailable: "Désolé, aucun compte bancaire n'est disponible.",
            noBankAccountSelected: 'Veuillez choisir un compte',
            taxID: "Veuillez entrer un numéro d'identification fiscale valide",
            website: 'Veuillez entrer un site web valide',
            zipCode: "Veuillez entrer un code postal valide en utilisant le format : ".concat(CONST_1.default.COUNTRY_ZIP_REGEX_DATA.US.samples),
            phoneNumber: 'Veuillez entrer un numéro de téléphone valide',
            email: 'Veuillez entrer une adresse e-mail valide',
            companyName: "Veuillez entrer un nom d'entreprise valide",
            addressCity: 'Veuillez entrer une ville valide',
            addressStreet: 'Veuillez entrer une adresse de rue valide',
            addressState: 'Veuillez sélectionner un état valide',
            incorporationDateFuture: "La date d'incorporation ne peut pas être dans le futur.",
            incorporationState: 'Veuillez sélectionner un état valide',
            industryCode: 'Veuillez entrer un code de classification industrielle valide à six chiffres',
            restrictedBusiness: "Veuillez confirmer que l'entreprise ne figure pas sur la liste des entreprises restreintes.",
            routingNumber: "Veuillez entrer un numéro d'acheminement valide",
            accountNumber: 'Veuillez entrer un numéro de compte valide',
            routingAndAccountNumberCannotBeSame: 'Les numéros de routage et de compte ne peuvent pas correspondre.',
            companyType: "Veuillez sélectionner un type d'entreprise valide",
            tooManyAttempts: "En raison d'un nombre élevé de tentatives de connexion, cette option a été désactivée pendant 24 heures. Veuillez réessayer plus tard ou entrer les détails manuellement à la place.",
            address: 'Veuillez entrer une adresse valide',
            dob: 'Veuillez sélectionner une date de naissance valide',
            age: 'Doit avoir plus de 18 ans',
            ssnLast4: 'Veuillez entrer les 4 derniers chiffres valides du SSN',
            firstName: 'Veuillez entrer un prénom valide',
            lastName: 'Veuillez entrer un nom de famille valide',
            noDefaultDepositAccountOrDebitCardAvailable: 'Veuillez ajouter un compte de dépôt par défaut ou une carte de débit',
            validationAmounts: 'Les montants de validation que vous avez saisis sont incorrects. Veuillez vérifier votre relevé bancaire et réessayer.',
            fullName: 'Veuillez entrer un nom complet valide',
            ownershipPercentage: 'Veuillez entrer un nombre en pourcentage valide',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Où se trouve votre compte bancaire ?',
        accountDetailsStepHeader: 'Quels sont les détails de votre compte ?',
        accountTypeStepHeader: 'Quel type de compte est-ce ?',
        bankInformationStepHeader: 'Quelles sont vos coordonnées bancaires ?',
        accountHolderInformationStepHeader: 'Quelles sont les informations du titulaire du compte ?',
        howDoWeProtectYourData: 'Comment protégeons-nous vos données ?',
        currencyHeader: 'Quelle est la devise de votre compte bancaire ?',
        confirmationStepHeader: 'Vérifiez vos informations.',
        confirmationStepSubHeader: 'Vérifiez les détails ci-dessous et cochez la case des conditions pour confirmer.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Entrez le mot de passe Expensify',
        alreadyAdded: 'Ce compte a déjà été ajouté.',
        chooseAccountLabel: 'Compte',
        successTitle: 'Compte bancaire personnel ajouté !',
        successMessage: 'Félicitations, votre compte bancaire est configuré et prêt à recevoir des remboursements.',
    },
    attachmentView: {
        unknownFilename: 'Nom de fichier inconnu',
        passwordRequired: 'Veuillez entrer un mot de passe',
        passwordIncorrect: 'Mot de passe incorrect. Veuillez réessayer.',
        failedToLoadPDF: 'Échec du chargement du fichier PDF',
        pdfPasswordForm: {
            title: 'PDF protégé par mot de passe',
            infoText: 'Ce PDF est protégé par un mot de passe.',
            beforeLinkText: "S'il vous plaît",
            linkText: 'entrez le mot de passe',
            afterLinkText: 'pour le voir.',
            formLabel: 'Voir le PDF',
        },
        attachmentNotFound: 'Pièce jointe introuvable',
    },
    messages: {
        errorMessageInvalidPhone: "Veuillez entrer un num\u00E9ro de t\u00E9l\u00E9phone valide sans parenth\u00E8ses ni tirets. Si vous \u00EAtes en dehors des \u00C9tats-Unis, veuillez inclure votre indicatif de pays (par exemple, ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")."),
        errorMessageInvalidEmail: 'E-mail invalide',
        userIsAlreadyMember: function (_a) {
            var login = _a.login, name = _a.name;
            return "".concat(login, " est d\u00E9j\u00E0 membre de ").concat(name);
        },
    },
    onfidoStep: {
        acceptTerms: "En continuant avec la demande d'activation de votre Expensify Wallet, vous confirmez que vous avez lu, compris et accepté",
        facialScan: "Politique et autorisation de scan facial d'Onfido",
        tryAgain: 'Réessayez',
        verifyIdentity: "Vérifier l'identité",
        letsVerifyIdentity: 'Vérifions votre identité',
        butFirst: "Mais d'abord, les choses ennuyeuses. Lisez les termes juridiques \u00E0 l'\u00E9tape suivante et cliquez sur \"Accepter\" lorsque vous \u00EAtes pr\u00EAt.",
        genericError: "Une erreur s'est produite lors du traitement de cette étape. Veuillez réessayer.",
        cameraPermissionsNotGranted: "Activer l'accès à la caméra",
        cameraRequestMessage: "Nous avons besoin d'accéder à votre appareil photo pour compléter la vérification de votre compte bancaire. Veuillez l'activer via Réglages > New Expensify.",
        microphonePermissionsNotGranted: "Activer l'accès au microphone",
        microphoneRequestMessage: "Nous avons besoin d'accéder à votre microphone pour terminer la vérification de votre compte bancaire. Veuillez l'activer via Paramètres > New Expensify.",
        originalDocumentNeeded: "Veuillez télécharger une image originale de votre pièce d'identité plutôt qu'une capture d'écran ou une image numérisée.",
        documentNeedsBetterQuality: "Votre pièce d'identité semble être endommagée ou avoir des caractéristiques de sécurité manquantes. Veuillez télécharger une image originale d'une pièce d'identité non endommagée et entièrement visible.",
        imageNeedsBetterQuality: "Il y a un problème avec la qualité de l'image de votre pièce d'identité. Veuillez télécharger une nouvelle image où l'ensemble de votre pièce d'identité est clairement visible.",
        selfieIssue: 'Il y a un problème avec votre selfie/vidéo. Veuillez télécharger un selfie/vidéo en direct.',
        selfieNotMatching: "Votre selfie/vidéo ne correspond pas à votre pièce d'identité. Veuillez télécharger un nouveau selfie/vidéo où votre visage est clairement visible.",
        selfieNotLive: 'Votre selfie/vidéo ne semble pas être une photo/vidéo en direct. Veuillez télécharger un selfie/vidéo en direct.',
    },
    additionalDetailsStep: {
        headerTitle: 'Détails supplémentaires',
        helpText: "Nous devons confirmer les informations suivantes avant que vous puissiez envoyer et recevoir de l'argent depuis votre portefeuille.",
        helpTextIdologyQuestions: 'Nous devons vous poser encore quelques questions pour terminer la validation de votre identité.',
        helpLink: 'En savoir plus sur pourquoi nous en avons besoin.',
        legalFirstNameLabel: 'Prénom légal',
        legalMiddleNameLabel: 'Deuxième prénom légal',
        legalLastNameLabel: 'Nom de famille légal',
        selectAnswer: 'Veuillez sélectionner une réponse pour continuer',
        ssnFull9Error: 'Veuillez entrer un numéro de sécurité sociale valide à neuf chiffres',
        needSSNFull9: 'Nous rencontrons des difficultés pour vérifier votre SSN. Veuillez entrer les neuf chiffres complets de votre SSN.',
        weCouldNotVerify: "Nous n'avons pas pu vérifier",
        pleaseFixIt: 'Veuillez corriger ces informations avant de continuer.',
        failedKYCTextBefore: "Nous n'avons pas pu vérifier votre identité. Veuillez réessayer plus tard ou contacter",
        failedKYCTextAfter: 'si vous avez des questions.',
    },
    termsStep: {
        headerTitle: 'Conditions et frais',
        headerTitleRefactor: 'Frais et conditions',
        haveReadAndAgree: "J'ai lu et j'accepte de recevoir",
        electronicDisclosures: 'divulgations électroniques',
        agreeToThe: "J'accepte les",
        walletAgreement: 'Accord de portefeuille',
        enablePayments: 'Activer les paiements',
        monthlyFee: 'Frais mensuel',
        inactivity: 'Inactivité',
        noOverdraftOrCredit: 'Pas de fonctionnalité de découvert/crédit.',
        electronicFundsWithdrawal: 'Retrait de fonds électronique',
        standard: 'Standard',
        reviewTheFees: "Jetez un coup d'œil à certains frais.",
        checkTheBoxes: 'Veuillez cocher les cases ci-dessous.',
        agreeToTerms: 'Acceptez les conditions et vous serez prêt à partir !',
        shortTermsForm: {
            expensifyPaymentsAccount: function (_a) {
                var walletProgram = _a.walletProgram;
                return "Le portefeuille Expensify est \u00E9mis par ".concat(walletProgram, ".");
            },
            perPurchase: 'Par achat',
            atmWithdrawal: 'Retrait au distributeur automatique',
            cashReload: 'Recharge en espèces',
            inNetwork: 'dans le réseau',
            outOfNetwork: 'hors réseau',
            atmBalanceInquiry: 'Demande de solde au distributeur automatique',
            inOrOutOfNetwork: '(dans le réseau ou hors réseau)',
            customerService: 'Service client',
            automatedOrLive: '(automated or live agent)',
            afterTwelveMonths: '(après 12 mois sans transactions)',
            weChargeOneFee: "Nous facturons 1 autre type de frais. Il s'agit de :",
            fdicInsurance: "Vos fonds sont éligibles à l'assurance FDIC.",
            generalInfo: 'Pour des informations générales sur les comptes prépayés, visitez',
            conditionsDetails: 'Pour plus de détails et de conditions concernant tous les frais et services, visitez',
            conditionsPhone: 'ou en appelant le +1 833-400-0904.',
            instant: '(instant)',
            electronicFundsInstantFeeMin: function (_a) {
                var amount = _a.amount;
                return "(min ".concat(amount, ")");
            },
        },
        longTermsForm: {
            listOfAllFees: 'Une liste de tous les frais du portefeuille Expensify',
            typeOfFeeHeader: 'Tous les frais',
            feeAmountHeader: 'Montant',
            moreDetailsHeader: 'Détails',
            openingAccountTitle: "Ouverture d'un compte",
            openingAccountDetails: "Il n'y a pas de frais pour ouvrir un compte.",
            monthlyFeeDetails: "Il n'y a pas de frais mensuels.",
            customerServiceTitle: 'Service client',
            customerServiceDetails: "Il n'y a pas de frais de service client.",
            inactivityDetails: "Il n'y a pas de frais d'inactivité.",
            sendingFundsTitle: 'Envoi de fonds à un autre titulaire de compte',
            sendingFundsDetails: "Il n'y a pas de frais pour envoyer des fonds à un autre titulaire de compte en utilisant votre solde, votre compte bancaire ou votre carte de débit.",
            electronicFundsStandardDetails: "There's no fee to transfer funds from your Expensify Wallet " +
                'to your bank account using the standard option. This transfer usually completes within 1-3 business' +
                ' days.',
            electronicFundsInstantDetails: function (_a) {
                var percentage = _a.percentage, amount = _a.amount;
                return "There's a fee to transfer funds from your Expensify Wallet to " +
                    'your linked debit card using the instant transfer option. This transfer usually completes within ' +
                    "several minutes. The fee is ".concat(percentage, "% of the transfer amount (with a minimum fee of ").concat(amount, ").");
            },
            fdicInsuranceBancorp: function (_a) {
                var amount = _a.amount;
                return 'Your funds are eligible for FDIC insurance. Your funds will be held at or ' +
                    "transferred to ".concat(CONST_1.default.WALLET.PROGRAM_ISSUERS.BANCORP_BANK, ", an FDIC-insured institution. Once there, your funds are insured up ") +
                    "to ".concat(amount, " by the FDIC in the event ").concat(CONST_1.default.WALLET.PROGRAM_ISSUERS.BANCORP_BANK, " fails, if specific deposit insurance requirements ") +
                    "are met and your card is registered. See";
            },
            fdicInsuranceBancorp2: 'pour plus de détails.',
            contactExpensifyPayments: "Contactez ".concat(CONST_1.default.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS, " en appelant le +1 833-400-0904, par email \u00E0"),
            contactExpensifyPayments2: 'ou connectez-vous à',
            generalInformation: 'Pour des informations générales sur les comptes prépayés, visitez',
            generalInformation2: 'Si vous avez une plainte concernant un compte prépayé, appelez le Bureau de Protection Financière des Consommateurs au 1-855-411-2372 ou visitez',
            printerFriendlyView: 'Voir la version imprimable',
            automated: 'Automatisé',
            liveAgent: 'Agent en direct',
            instant: 'Instantané',
            electronicFundsInstantFeeMin: function (_a) {
                var amount = _a.amount;
                return "Min ".concat(amount);
            },
        },
    },
    activateStep: {
        headerTitle: 'Activer les paiements',
        activatedTitle: 'Portefeuille activé !',
        activatedMessage: 'Félicitations, votre portefeuille est configuré et prêt à effectuer des paiements.',
        checkBackLaterTitle: 'Juste une minute...',
        checkBackLaterMessage: 'Nous examinons toujours vos informations. Veuillez revenir plus tard.',
        continueToPayment: 'Continuer vers le paiement',
        continueToTransfer: 'Continuer à transférer',
    },
    companyStep: {
        headerTitle: "Informations sur l'entreprise",
        subtitle: 'Presque terminé ! Pour des raisons de sécurité, nous devons confirmer certaines informations :',
        legalBusinessName: 'Nom commercial légal',
        companyWebsite: "Site web de l'entreprise",
        taxIDNumber: "Numéro d'identification fiscale",
        taxIDNumberPlaceholder: '9 chiffres',
        companyType: "Type d'entreprise",
        incorporationDate: "Date d'incorporation",
        incorporationState: "État d'incorporation",
        industryClassificationCode: "Code de classification de l'industrie",
        confirmCompanyIsNot: "Je confirme que cette entreprise n'est pas sur la liste des",
        listOfRestrictedBusinesses: 'liste des entreprises restreintes',
        incorporationDatePlaceholder: 'Date de début (aaaa-mm-jj)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partenariat',
            COOPERATIVE: 'Coopérative',
            SOLE_PROPRIETORSHIP: 'Entreprise individuelle',
            OTHER: 'Autre',
        },
        industryClassification: "Dans quel secteur d'activité l'entreprise est-elle classée ?",
        industryClassificationCodePlaceholder: "Rechercher le code de classification de l'industrie",
    },
    requestorStep: {
        headerTitle: 'Informations personnelles',
        learnMore: 'En savoir plus',
        isMyDataSafe: 'Mes données sont-elles en sécurité ?',
    },
    personalInfoStep: {
        personalInfo: 'Informations personnelles',
        enterYourLegalFirstAndLast: 'Quel est votre nom légal ?',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        legalName: 'Nom légal',
        enterYourDateOfBirth: 'Quelle est votre date de naissance ?',
        enterTheLast4: 'Quels sont les quatre derniers chiffres de votre numéro de sécurité sociale ?',
        dontWorry: 'Ne vous inquiétez pas, nous ne faisons aucune vérification de crédit personnel !',
        last4SSN: 'Derniers 4 du SSN',
        enterYourAddress: 'Quelle est votre adresse ?',
        address: 'Adresse',
        letsDoubleCheck: 'Vérifions que tout est correct.',
        byAddingThisBankAccount: 'En ajoutant ce compte bancaire, vous confirmez que vous avez lu, compris et accepté',
        whatsYourLegalName: 'Quel est votre nom légal ?',
        whatsYourDOB: 'Quelle est votre date de naissance ?',
        whatsYourAddress: 'Quelle est votre adresse ?',
        whatsYourSSN: 'Quels sont les quatre derniers chiffres de votre numéro de sécurité sociale ?',
        noPersonalChecks: 'Ne vous inquiétez pas, aucun contrôle de crédit personnel ici !',
        whatsYourPhoneNumber: 'Quel est votre numéro de téléphone ?',
        weNeedThisToVerify: 'Nous avons besoin de cela pour vérifier votre portefeuille.',
    },
    businessInfoStep: {
        businessInfo: "Informations sur l'entreprise",
        enterTheNameOfYourBusiness: 'Quel est le nom de votre entreprise ?',
        businessName: "Nom légal de l'entreprise",
        enterYourCompanyTaxIdNumber: "Quel est le numéro d'identification fiscale de votre entreprise ?",
        taxIDNumber: "Numéro d'identification fiscale",
        taxIDNumberPlaceholder: '9 chiffres',
        enterYourCompanyWebsite: 'Quel est le site web de votre entreprise ?',
        companyWebsite: "Site web de l'entreprise",
        enterYourCompanyPhoneNumber: 'Quel est le numéro de téléphone de votre entreprise ?',
        enterYourCompanyAddress: "Quelle est l'adresse de votre entreprise ?",
        selectYourCompanyType: "Quel type d'entreprise est-ce ?",
        companyType: "Type d'entreprise",
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partenariat',
            COOPERATIVE: 'Coopérative',
            SOLE_PROPRIETORSHIP: 'Entreprise individuelle',
            OTHER: 'Autre',
        },
        selectYourCompanyIncorporationDate: 'Quelle est la date de constitution de votre entreprise ?',
        incorporationDate: "Date d'incorporation",
        incorporationDatePlaceholder: 'Date de début (aaaa-mm-jj)',
        incorporationState: "État d'incorporation",
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'Dans quel état votre entreprise a-t-elle été constituée ?',
        letsDoubleCheck: 'Vérifions que tout est correct.',
        companyAddress: "Adresse de l'entreprise",
        listOfRestrictedBusinesses: 'liste des entreprises restreintes',
        confirmCompanyIsNot: "Je confirme que cette entreprise n'est pas sur la liste des",
        businessInfoTitle: "Informations sur l'entreprise",
        legalBusinessName: 'Nom commercial légal',
        whatsTheBusinessName: "Quel est le nom de l'entreprise ?",
        whatsTheBusinessAddress: "Quelle est l'adresse de l'entreprise ?",
        whatsTheBusinessContactInformation: 'Quelles sont les coordonnées professionnelles ?',
        whatsTheBusinessRegistrationNumber: "Quel est le numéro d'enregistrement de l'entreprise ?",
        whatsTheBusinessTaxIDEIN: function (_a) {
            var country = _a.country;
            switch (country) {
                case CONST_1.default.COUNTRY.US:
                    return 'Quel est le numéro d’identification d’employeur (EIN) ?';
                case CONST_1.default.COUNTRY.CA:
                    return 'Quel est le numéro d’entreprise (BN) ?';
                case CONST_1.default.COUNTRY.GB:
                    return 'Quel est le numéro d’immatriculation à la TVA (VRN) ?';
                case CONST_1.default.COUNTRY.AU:
                    return 'Quel est le numéro d’entreprise australien (ABN) ?';
                default:
                    return 'Quel est le numéro de TVA intracommunautaire (UE) ?';
            }
        },
        whatsThisNumber: 'Quel est ce numéro ?',
        whereWasTheBusinessIncorporated: "Où l'entreprise a-t-elle été constituée ?",
        whatTypeOfBusinessIsIt: "Quel type d'entreprise est-ce ?",
        whatsTheBusinessAnnualPayment: "Quel est le volume annuel de paiements de l'entreprise ?",
        whatsYourExpectedAverageReimbursements: 'Quel est le montant moyen de remboursement que vous attendez ?',
        registrationNumber: "Numéro d'enregistrement",
        taxIDEIN: function (_a) {
            var country = _a.country;
            switch (country) {
                case CONST_1.default.COUNTRY.US:
                    return 'EIN';
                case CONST_1.default.COUNTRY.CA:
                    return 'BN';
                case CONST_1.default.COUNTRY.GB:
                    return 'VRN';
                case CONST_1.default.COUNTRY.AU:
                    return 'ABN';
                default:
                    return 'TVA UE';
            }
        },
        businessAddress: 'Adresse professionnelle',
        businessType: "Type d'entreprise",
        incorporation: 'Incorporation',
        incorporationCountry: "Pays d'incorporation",
        incorporationTypeName: "Type d'incorporation",
        businessCategory: "Catégorie d'entreprise",
        annualPaymentVolume: 'Volume de paiement annuel',
        annualPaymentVolumeInCurrency: function (_a) {
            var currencyCode = _a.currencyCode;
            return "Volume de paiement annuel en ".concat(currencyCode);
        },
        averageReimbursementAmount: 'Montant moyen de remboursement',
        averageReimbursementAmountInCurrency: function (_a) {
            var currencyCode = _a.currencyCode;
            return "Montant moyen de remboursement en ".concat(currencyCode);
        },
        selectIncorporationType: "Sélectionnez le type d'incorporation",
        selectBusinessCategory: "Sélectionner la catégorie d'entreprise",
        selectAnnualPaymentVolume: 'Sélectionner le volume de paiement annuel',
        selectIncorporationCountry: "Sélectionnez le pays d'incorporation",
        selectIncorporationState: "Sélectionnez l'état d'incorporation",
        selectAverageReimbursement: 'Sélectionner le montant moyen de remboursement',
        findIncorporationType: "Trouver le type d'incorporation",
        findBusinessCategory: "Trouver la catégorie d'entreprise",
        findAnnualPaymentVolume: 'Trouver le volume de paiement annuel',
        findIncorporationState: "Trouver l'état d'incorporation",
        findAverageReimbursement: 'Trouver le montant moyen de remboursement',
        error: {
            registrationNumber: "Veuillez fournir un numéro d'enregistrement valide",
            taxIDEIN: function (_a) {
                var country = _a.country;
                switch (country) {
                    case CONST_1.default.COUNTRY.US:
                        return 'Veuillez fournir un numéro d’identification d’employeur (EIN) valide';
                    case CONST_1.default.COUNTRY.CA:
                        return 'Veuillez fournir un numéro d’entreprise (BN) valide';
                    case CONST_1.default.COUNTRY.GB:
                        return 'Veuillez fournir un numéro de TVA (VRN) valide';
                    case CONST_1.default.COUNTRY.AU:
                        return 'Veuillez fournir un numéro d’entreprise australien (ABN) valide';
                    default:
                        return 'Veuillez fournir un numéro de TVA intracommunautaire valide';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'Possédez-vous 25 % ou plus de',
        doAnyIndividualOwn25percent: 'Des individus possèdent-ils 25 % ou plus de',
        areThereMoreIndividualsWhoOwn25percent: "Y a-t-il plus d'individus qui possèdent 25 % ou plus de",
        regulationRequiresUsToVerifyTheIdentity: "La réglementation nous oblige à vérifier l'identité de toute personne qui possède plus de 25 % de l'entreprise.",
        companyOwner: "Propriétaire d'entreprise",
        enterLegalFirstAndLastName: 'Quel est le nom légal du propriétaire ?',
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        enterTheDateOfBirthOfTheOwner: 'Quelle est la date de naissance du propriétaire ?',
        enterTheLast4: 'Quels sont les 4 derniers chiffres du numéro de sécurité sociale du propriétaire ?',
        last4SSN: 'Derniers 4 du SSN',
        dontWorry: 'Ne vous inquiétez pas, nous ne faisons aucune vérification de crédit personnel !',
        enterTheOwnersAddress: "Quelle est l'adresse du propriétaire ?",
        letsDoubleCheck: 'Vérifions que tout est correct.',
        legalName: 'Nom légal',
        address: 'Adresse',
        byAddingThisBankAccount: 'En ajoutant ce compte bancaire, vous confirmez que vous avez lu, compris et accepté',
        owners: 'Propriétaires',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informations sur le propriétaire',
        businessOwner: "Propriétaire d'entreprise",
        signerInfo: 'Informations du signataire',
        doYouOwn: function (_a) {
            var companyName = _a.companyName;
            return "Poss\u00E9dez-vous 25 % ou plus de ".concat(companyName, " ?");
        },
        doesAnyoneOwn: function (_a) {
            var companyName = _a.companyName;
            return "Est-ce qu'une personne poss\u00E8de 25 % ou plus de ".concat(companyName, " ?");
        },
        regulationsRequire: "Les réglementations nous obligent à vérifier l'identité de toute personne possédant plus de 25 % de l'entreprise.",
        legalFirstName: 'Prénom légal',
        legalLastName: 'Nom de famille légal',
        whatsTheOwnersName: 'Quel est le nom légal du propriétaire ?',
        whatsYourName: 'Quel est votre nom légal ?',
        whatPercentage: "Quel pourcentage de l'entreprise appartient au propriétaire ?",
        whatsYoursPercentage: "Quel pourcentage de l'entreprise possédez-vous ?",
        ownership: 'Propriété',
        whatsTheOwnersDOB: 'Quelle est la date de naissance du propriétaire ?',
        whatsYourDOB: 'Quelle est votre date de naissance ?',
        whatsTheOwnersAddress: "Quelle est l'adresse du propriétaire ?",
        whatsYourAddress: 'Quelle est votre adresse ?',
        whatAreTheLast: 'Quels sont les 4 derniers chiffres du numéro de sécurité sociale du propriétaire ?',
        whatsYourLast: 'Quels sont les 4 derniers chiffres de votre numéro de sécurité sociale ?',
        dontWorry: 'Ne vous inquiétez pas, nous ne faisons aucune vérification de crédit personnel !',
        last4: 'Derniers 4 du SSN',
        whyDoWeAsk: 'Pourquoi demandons-nous cela ?',
        letsDoubleCheck: 'Vérifions que tout est correct.',
        legalName: 'Nom légal',
        ownershipPercentage: 'Pourcentage de propriété',
        areThereOther: function (_a) {
            var companyName = _a.companyName;
            return "Y a-t-il d'autres personnes qui poss\u00E8dent 25 % ou plus de ".concat(companyName, " ?");
        },
        owners: 'Propriétaires',
        addCertified: 'Ajoutez un organigramme certifié qui montre les propriétaires bénéficiaires',
        regulationRequiresChart: "La réglementation nous oblige à collecter une copie certifiée du tableau de propriété qui montre chaque individu ou entité possédant 25 % ou plus de l'entreprise.",
        uploadEntity: 'Télécharger le tableau de propriété des entités',
        noteEntity: "Remarque : Le schéma de propriété de l'entité doit être signé par votre comptable, votre conseiller juridique ou être notarié.",
        certified: "Tableau de propriété de l'entité certifiée",
        selectCountry: 'Sélectionner le pays',
        findCountry: 'Trouver le pays',
        address: 'Adresse',
        chooseFile: 'Choisir un fichier',
        uploadDocuments: 'Télécharger des documents supplémentaires',
        pleaseUpload: "Veuillez télécharger des documents supplémentaires ci-dessous pour nous aider à vérifier votre identité en tant que propriétaire direct ou indirect de 25 % ou plus de l'entité commerciale.",
        acceptedFiles: 'Formats de fichiers acceptés : PDF, PNG, JPEG. La taille totale des fichiers pour chaque section ne peut pas dépasser 5 Mo.',
        proofOfBeneficialOwner: 'Preuve du bénéficiaire effectif',
        proofOfBeneficialOwnerDescription: "Veuillez fournir une attestation signée et un organigramme d'un comptable public, notaire ou avocat vérifiant la propriété de 25 % ou plus de l'entreprise. Elle doit être datée des trois derniers mois et inclure le numéro de licence du signataire.",
        copyOfID: "Copie de la pièce d'identité pour le bénéficiaire effectif",
        copyOfIDDescription: 'Exemples : Passeport, permis de conduire, etc.',
        proofOfAddress: 'Justificatif de domicile pour le bénéficiaire effectif',
        proofOfAddressDescription: 'Exemples : Facture de services publics, contrat de location, etc.',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription: "Veuillez télécharger une vidéo d'une visite de site ou un appel enregistré avec le signataire. Le signataire doit fournir : nom complet, date de naissance, nom de l'entreprise, numéro d'enregistrement, numéro de code fiscal, adresse enregistrée, nature de l'activité et objet du compte.",
    },
    validationStep: {
        headerTitle: 'Valider le compte bancaire',
        buttonText: 'Terminer la configuration',
        maxAttemptsReached: 'La validation de ce compte bancaire a été désactivée en raison de trop nombreuses tentatives incorrectes.',
        description: "Dans un d\u00E9lai de 1 \u00E0 2 jours ouvrables, nous enverrons trois (3) petites transactions sur votre compte bancaire sous un nom tel que \"Expensify, Inc. Validation\".",
        descriptionCTA: 'Veuillez entrer le montant de chaque transaction dans les champs ci-dessous. Exemple : 1,51.',
        reviewingInfo: 'Merci ! Nous examinons vos informations et nous vous contacterons sous peu. Veuillez vérifier votre chat avec Concierge.',
        forNextStep: 'pour les prochaines étapes pour terminer la configuration de votre compte bancaire.',
        letsChatCTA: 'Oui, discutons.',
        letsChatText: 'Presque terminé ! Nous avons besoin de votre aide pour vérifier quelques dernières informations par chat. Prêt ?',
        letsChatTitle: 'Discutons !',
        enable2FATitle: "Prévenez la fraude, activez l'authentification à deux facteurs (2FA)",
        enable2FAText: "Nous prenons votre sécurité au sérieux. Veuillez configurer l'authentification à deux facteurs (2FA) maintenant pour ajouter une couche de protection supplémentaire à votre compte.",
        secureYourAccount: 'Sécurisez votre compte',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Informations supplémentaires',
        checkAllThatApply: "Cochez tout ce qui s'applique, sinon laissez vide.",
        iOwnMoreThan25Percent: 'Je possède plus de 25 % de',
        someoneOwnsMoreThan25Percent: "Quelqu'un d'autre possède plus de 25 % de",
        additionalOwner: 'Bénéficiaire effectif supplémentaire',
        removeOwner: 'Supprimer ce bénéficiaire effectif',
        addAnotherIndividual: 'Ajouter une autre personne qui possède plus de 25 % de',
        agreement: 'Accord :',
        termsAndConditions: 'termes et conditions',
        certifyTrueAndAccurate: 'Je certifie que les informations fournies sont vraies et exactes.',
        error: {
            certify: 'Doit certifier que les informations sont vraies et exactes',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Terminer la vérification',
        confirmAgreements: 'Veuillez confirmer les accords ci-dessous.',
        certifyTrueAndAccurate: 'Je certifie que les informations fournies sont vraies et exactes.',
        certifyTrueAndAccurateError: "Veuillez certifier que l'information est vraie et exacte.",
        isAuthorizedToUseBankAccount: 'Je suis autorisé à utiliser ce compte bancaire professionnel pour les dépenses professionnelles.',
        isAuthorizedToUseBankAccountError: "Vous devez être un agent de contrôle avec l'autorisation d'opérer le compte bancaire de l'entreprise.",
        termsAndConditions: 'termes et conditions',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Connecter un compte bancaire',
        finishButtonText: 'Terminer la configuration',
        validateYourBankAccount: 'Validez votre compte bancaire',
        validateButtonText: 'Valider',
        validationInputLabel: 'Transaction',
        maxAttemptsReached: 'La validation de ce compte bancaire a été désactivée en raison de trop nombreuses tentatives incorrectes.',
        description: "Dans un d\u00E9lai de 1 \u00E0 2 jours ouvrables, nous enverrons trois (3) petites transactions sur votre compte bancaire sous un nom tel que \"Expensify, Inc. Validation\".",
        descriptionCTA: 'Veuillez entrer le montant de chaque transaction dans les champs ci-dessous. Exemple : 1,51.',
        reviewingInfo: 'Merci ! Nous examinons vos informations et nous vous contacterons sous peu. Veuillez vérifier votre chat avec Concierge.',
        forNextSteps: 'pour les prochaines étapes pour terminer la configuration de votre compte bancaire.',
        letsChatCTA: 'Oui, discutons.',
        letsChatText: 'Presque terminé ! Nous avons besoin de votre aide pour vérifier quelques dernières informations par chat. Prêt ?',
        letsChatTitle: 'Discutons !',
        enable2FATitle: "Prévenez la fraude, activez l'authentification à deux facteurs (2FA)",
        enable2FAText: "Nous prenons votre sécurité au sérieux. Veuillez configurer l'authentification à deux facteurs (2FA) maintenant pour ajouter une couche de protection supplémentaire à votre compte.",
        secureYourAccount: 'Sécurisez votre compte',
    },
    countryStep: {
        confirmBusinessBank: 'Confirmer la devise et le pays du compte bancaire professionnel',
        confirmCurrency: 'Confirmer la devise et le pays',
        yourBusiness: 'La devise de votre compte bancaire professionnel doit correspondre à la devise de votre espace de travail.',
        youCanChange: 'Vous pouvez changer la devise de votre espace de travail dans votre',
        findCountry: 'Trouver le pays',
        selectCountry: 'Sélectionner le pays',
    },
    bankInfoStep: {
        whatAreYour: 'Quelles sont les coordonnées de votre compte bancaire professionnel ?',
        letsDoubleCheck: 'Vérifions que tout est en ordre.',
        thisBankAccount: 'Ce compte bancaire sera utilisé pour les paiements professionnels sur votre espace de travail.',
        accountNumber: 'Numéro de compte',
        accountHolderNameDescription: 'Nom complet du signataire autorisé',
    },
    signerInfoStep: {
        signerInfo: 'Informations du signataire',
        areYouDirector: function (_a) {
            var companyName = _a.companyName;
            return "\u00CAtes-vous un directeur ou un cadre sup\u00E9rieur chez ".concat(companyName, " ?");
        },
        regulationRequiresUs: "La réglementation nous oblige à vérifier si le signataire a l'autorité pour prendre cette action au nom de l'entreprise.",
        whatsYourName: 'Quel est votre nom légal ?',
        fullName: 'Nom légal complet',
        whatsYourJobTitle: 'Quel est votre titre de poste ?',
        jobTitle: 'Intitulé du poste',
        whatsYourDOB: 'Quelle est votre date de naissance ?',
        uploadID: "Téléchargez une pièce d'identité et un justificatif de domicile",
        personalAddress: "Preuve d'adresse personnelle (par exemple, facture de services publics)",
        letsDoubleCheck: 'Vérifions que tout est correct.',
        legalName: 'Nom légal',
        proofOf: 'Justificatif de domicile personnel',
        enterOneEmail: function (_a) {
            var companyName = _a.companyName;
            return "Entrez l'email du directeur ou d'un cadre sup\u00E9rieur chez ".concat(companyName);
        },
        regulationRequiresOneMoreDirector: 'La réglementation exige au moins un autre directeur ou cadre supérieur en tant que signataire.',
        hangTight: 'Patientez...',
        enterTwoEmails: function (_a) {
            var companyName = _a.companyName;
            return "Entrez les e-mails de deux directeurs ou cadres sup\u00E9rieurs chez ".concat(companyName);
        },
        sendReminder: 'Envoyer un rappel',
        chooseFile: 'Choisir un fichier',
        weAreWaiting: "Nous attendons que d'autres vérifient leur identité en tant que directeurs ou cadres supérieurs de l'entreprise.",
        id: "Copie de la pièce d'identité",
        proofOfDirectors: 'Preuve du ou des directeur(s)',
        proofOfDirectorsDescription: "Exemples : Profil d'entreprise Oncorp ou Enregistrement d'entreprise.",
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale pour les signataires, utilisateurs autorisés et bénéficiaires effectifs.',
        PDSandFSG: 'Documents de divulgation PDS + FSG',
        PDSandFSGDescription: "Notre partenariat avec Corpay utilise une connexion API pour tirer parti de leur vaste réseau de partenaires bancaires internationaux afin d'alimenter les Remboursements Globaux dans Expensify. Conformément à la réglementation australienne, nous vous fournissons le Guide des Services Financiers (FSG) et le Document de Révélation de Produit (PDS) de Corpay.\n\nVeuillez lire attentivement les documents FSG et PDS car ils contiennent des détails complets et des informations importantes sur les produits et services offerts par Corpay. Conservez ces documents pour référence future.",
        pleaseUpload: "Veuillez télécharger ci-dessous des documents supplémentaires pour nous aider à vérifier votre identité en tant que directeur ou cadre supérieur de l'entité commerciale.",
    },
    agreementsStep: {
        agreements: 'Accords',
        pleaseConfirm: 'Veuillez confirmer les accords ci-dessous',
        regulationRequiresUs: "La réglementation nous oblige à vérifier l'identité de toute personne qui possède plus de 25 % de l'entreprise.",
        iAmAuthorized: 'Je suis autorisé à utiliser le compte bancaire professionnel pour les dépenses professionnelles.',
        iCertify: 'Je certifie que les informations fournies sont vraies et exactes.',
        termsAndConditions: 'termes et conditions',
        accept: 'Accepter et ajouter un compte bancaire',
        iConsentToThe: 'Je consens à la',
        privacyNotice: 'avis de confidentialité',
        error: {
            authorized: "Vous devez être un agent de contrôle avec l'autorisation d'opérer le compte bancaire de l'entreprise.",
            certify: "Veuillez certifier que l'information est vraie et exacte.",
            consent: "Veuillez consentir à l'avis de confidentialité",
        },
    },
    finishStep: {
        connect: 'Connecter un compte bancaire',
        letsFinish: 'Terminons dans le chat !',
        thanksFor: "Merci pour ces détails. Un agent de support dédié va maintenant examiner vos informations. Nous reviendrons vers vous si nous avons besoin de quelque chose d'autre, mais en attendant, n'hésitez pas à nous contacter si vous avez des questions.",
        iHaveA: "J'ai une question",
        enable2FA: "Activez l'authentification à deux facteurs (2FA) pour prévenir la fraude",
        weTake: "Nous prenons votre sécurité au sérieux. Veuillez configurer l'authentification à deux facteurs (2FA) maintenant pour ajouter une couche de protection supplémentaire à votre compte.",
        secure: 'Sécurisez votre compte',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Un instant',
        explanationLine: 'Nous examinons vos informations. Vous pourrez bientôt passer aux étapes suivantes.',
    },
    session: {
        offlineMessageRetry: 'Il semble que vous soyez hors ligne. Veuillez vérifier votre connexion et réessayer.',
    },
    travel: {
        header: 'Réserver un voyage',
        title: 'Voyagez intelligemment',
        subtitle: 'Utilisez Expensify Travel pour obtenir les meilleures offres de voyage et gérer toutes vos dépenses professionnelles en un seul endroit.',
        features: {
            saveMoney: 'Économisez sur vos réservations',
            alerts: 'Recevez des mises à jour et des alertes en temps réel',
        },
        bookTravel: 'Réserver un voyage',
        bookDemo: 'Réserver une démo',
        bookADemo: 'Réserver une démo',
        toLearnMore: 'pour en savoir plus.',
        termsAndConditions: {
            header: 'Avant de continuer...',
            title: 'Termes et conditions',
            subtitle: 'Veuillez accepter les conditions de Expensify Travel.',
            termsAndConditions: 'termes et conditions',
            travelTermsAndConditions: 'termes et conditions',
            agree: "J'accepte les",
            error: 'Vous devez accepter les conditions générales de Expensify Travel pour continuer.',
            defaultWorkspaceError: "Vous devez définir un espace de travail par défaut pour activer Expensify Travel. Allez dans Paramètres > Espaces de travail > cliquez sur les trois points verticaux à côté d'un espace de travail > Définir comme espace de travail par défaut, puis réessayez !",
        },
        flight: 'Vol',
        flightDetails: {
            passenger: 'Passager',
            layover: function (_a) {
                var layover = _a.layover;
                return "<muted-text-label>Vous avez une <strong>escale de ".concat(layover, "</strong> avant ce vol</muted-text-label>");
            },
            takeOff: 'Décollage',
            landing: 'Atterrissage',
            seat: 'Siège',
            class: 'Classe Cabine',
            recordLocator: "Localisateur d'enregistrement",
            cabinClasses: {
                unknown: 'Unknown',
                economy: 'Économie',
                premiumEconomy: 'Premium Economy',
                business: 'Entreprise',
                first: 'Premier',
            },
        },
        hotel: 'Hôtel',
        hotelDetails: {
            guest: 'Invité',
            checkIn: 'Enregistrement',
            checkOut: 'Check-out',
            roomType: 'Type de chambre',
            cancellation: "Politique d'annulation",
            cancellationUntil: "Annulation gratuite jusqu'à",
            confirmation: 'Numéro de confirmation',
            cancellationPolicies: {
                unknown: 'Unknown',
                nonRefundable: 'Non remboursable',
                freeCancellationUntil: "Annulation gratuite jusqu'à",
                partiallyRefundable: 'Partiellement remboursable',
            },
        },
        car: 'Voiture',
        carDetails: {
            rentalCar: 'Location de voiture',
            pickUp: 'Ramassage',
            dropOff: 'Dépose',
            driver: 'Conducteur',
            carType: 'Type de voiture',
            cancellation: "Politique d'annulation",
            cancellationUntil: "Annulation gratuite jusqu'à",
            freeCancellation: 'Annulation gratuite',
            confirmation: 'Numéro de confirmation',
        },
        train: 'Rail',
        trainDetails: {
            passenger: 'Passager',
            departs: 'Départs',
            arrives: 'Arrive',
            coachNumber: 'Numéro de coach',
            seat: 'Siège',
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
        departs: 'Départs',
        errorMessage: 'Un problème est survenu. Veuillez réessayer plus tard.',
        phoneError: {
            phrase1: "S'il vous plaît",
            link: 'ajoutez un e-mail professionnel comme identifiant principal',
            phrase2: 'pour réserver un voyage.',
        },
        domainSelector: {
            title: 'Domaine',
            subtitle: "Choisissez un domaine pour la configuration d'Expensify Travel.",
            recommended: 'Recommandé',
        },
        domainPermissionInfo: {
            title: 'Domaine',
            restrictionPrefix: "Vous n'avez pas la permission d'activer Expensify Travel pour le domaine.",
            restrictionSuffix: "Vous devrez demander \u00E0 quelqu'un de ce domaine d'activer le voyage \u00E0 la place.",
            accountantInvitationPrefix: "Si vous \u00EAtes comptable, envisagez de rejoindre le",
            accountantInvitationLink: "Programme ExpensifyApproved! pour comptables",
            accountantInvitationSuffix: "pour activer les voyages pour ce domaine.",
        },
        publicDomainError: {
            title: 'Commencez avec Expensify Travel',
            message: "Vous devrez utiliser votre e-mail professionnel (par exemple, nom@entreprise.com) avec Expensify Travel, et non votre e-mail personnel (par exemple, nom@gmail.com).",
        },
        blockedFeatureModal: {
            title: 'Expensify Travel a été désactivé',
            message: "Votre administrateur a d\u00E9sactiv\u00E9 Expensify Travel. Veuillez suivre la politique de r\u00E9servation de votre entreprise pour les arrangements de voyage.",
        },
        verifyCompany: {
            title: "Commencez votre voyage dès aujourd'hui !",
            message: "Veuillez contacter votre gestionnaire de compte ou salesteam@expensify.com pour obtenir une d\u00E9monstration de voyage et l'activer pour votre entreprise.",
        },
        updates: {
            bookingTicketed: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate, _b = _a.confirmationID, confirmationID = _b === void 0 ? '' : _b;
                return "Votre vol ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") le ").concat(startDate, " a \u00E9t\u00E9 r\u00E9serv\u00E9. Code de confirmation : ").concat(confirmationID);
            },
            ticketVoided: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Votre billet pour le vol ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") du ").concat(startDate, " a \u00E9t\u00E9 annul\u00E9.");
            },
            ticketRefunded: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Votre billet pour le vol ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") le ").concat(startDate, " a \u00E9t\u00E9 rembours\u00E9 ou \u00E9chang\u00E9.");
            },
            flightCancelled: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Votre vol ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") du ").concat(startDate, " a \u00E9t\u00E9 annul\u00E9 par la compagnie a\u00E9rienne.");
            },
            flightScheduleChangePending: function (_a) {
                var airlineCode = _a.airlineCode;
                return "La compagnie a\u00E9rienne a propos\u00E9 un changement d'horaire pour le vol ".concat(airlineCode, " ; nous attendons la confirmation.");
            },
            flightScheduleChangeClosed: function (_a) {
                var airlineCode = _a.airlineCode, startDate = _a.startDate;
                return "Changement d'horaire confirm\u00E9 : le vol ".concat(airlineCode, " part maintenant \u00E0 ").concat(startDate, ".");
            },
            flightUpdated: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Votre vol ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") le ").concat(startDate, " a \u00E9t\u00E9 mis \u00E0 jour.");
            },
            flightCabinChanged: function (_a) {
                var airlineCode = _a.airlineCode, cabinClass = _a.cabinClass;
                return "Votre classe de cabine a \u00E9t\u00E9 mise \u00E0 jour en ".concat(cabinClass, " sur le vol ").concat(airlineCode, ".");
            },
            flightSeatConfirmed: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Votre attribution de si\u00E8ge sur le vol ".concat(airlineCode, " a \u00E9t\u00E9 confirm\u00E9e.");
            },
            flightSeatChanged: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Votre attribution de si\u00E8ge sur le vol ".concat(airlineCode, " a \u00E9t\u00E9 modifi\u00E9e.");
            },
            flightSeatCancelled: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Votre attribution de si\u00E8ge sur le vol ".concat(airlineCode, " a \u00E9t\u00E9 supprim\u00E9e.");
            },
            paymentDeclined: 'Le paiement de votre réservation de vol a échoué. Veuillez réessayer.',
            bookingCancelledByTraveler: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "Vous avez annul\u00E9 votre r\u00E9servation de ".concat(type, " ").concat(id, ".");
            },
            bookingCancelledByVendor: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "Le fournisseur a annul\u00E9 votre r\u00E9servation de ".concat(type, " ").concat(id, ".");
            },
            bookingRebooked: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "Votre r\u00E9servation de ".concat(type, " a \u00E9t\u00E9 rebook\u00E9e. Nouveau num\u00E9ro de confirmation : ").concat(id, ".");
            },
            bookingUpdated: function (_a) {
                var type = _a.type;
                return "Votre r\u00E9servation de ".concat(type, " a \u00E9t\u00E9 mise \u00E0 jour. Consultez les nouveaux d\u00E9tails dans l'itin\u00E9raire.");
            },
            railTicketRefund: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Votre billet de train pour ".concat(origin, " \u2192 ").concat(destination, " le ").concat(startDate, " a \u00E9t\u00E9 rembours\u00E9. Un cr\u00E9dit sera trait\u00E9.");
            },
            railTicketExchange: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Votre billet de train pour ".concat(origin, " \u2192 ").concat(destination, " le ").concat(startDate, " a \u00E9t\u00E9 \u00E9chang\u00E9.");
            },
            railTicketUpdate: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Votre billet de train pour ".concat(origin, " \u2192 ").concat(destination, " le ").concat(startDate, " a \u00E9t\u00E9 mis \u00E0 jour.");
            },
            defaultUpdate: function (_a) {
                var type = _a.type;
                return "Votre r\u00E9servation de ".concat(type, " a \u00E9t\u00E9 mise \u00E0 jour.");
            },
        },
    },
    workspace: {
        common: {
            card: 'Cartes',
            expensifyCard: 'Expensify Card',
            companyCards: "Cartes d'entreprise",
            workflows: 'Workflows',
            workspace: 'Espace de travail',
            findWorkspace: "Trouver l'espace de travail",
            edit: "Modifier l'espace de travail",
            enabled: 'Activé',
            disabled: 'Désactivé',
            everyone: 'Tout le monde',
            delete: "Supprimer l'espace de travail",
            settings: 'Paramètres',
            reimburse: 'Remboursements',
            categories: 'Catégories',
            tags: 'Tags',
            customField1: 'Champ personnalisé 1',
            customField2: 'Champ personnalisé 2',
            customFieldHint: "Ajoutez un codage personnalisé qui s'applique à toutes les dépenses de ce membre.",
            reportFields: 'Champs de rapport',
            reportTitle: 'Titre du rapport',
            reportField: 'Champ de rapport',
            taxes: 'Taxes',
            bills: 'Bills',
            invoices: 'Factures',
            travel: 'Voyage',
            members: 'Membres',
            accounting: 'Comptabilité',
            rules: 'Règles',
            displayedAs: 'Affiché comme',
            plan: 'Planification',
            profile: 'Aperçu',
            bankAccount: 'Compte bancaire',
            connectBankAccount: 'Connecter un compte bancaire',
            testTransactions: 'Tester les transactions',
            issueAndManageCards: 'Émettre et gérer des cartes',
            reconcileCards: 'Rapprocher les cartes',
            selected: function () { return ({
                one: '1 sélectionné',
                other: function (count) { return "".concat(count, " s\u00E9lectionn\u00E9(s)"); },
            }); },
            settlementFrequency: 'Fréquence de règlement',
            setAsDefault: 'Définir comme espace de travail par défaut',
            defaultNote: "Les re\u00E7us envoy\u00E9s \u00E0 ".concat(CONST_1.default.EMAIL.RECEIPTS, " appara\u00EEtront dans cet espace de travail."),
            deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer cet espace de travail ?',
            deleteWithCardsConfirmation: 'Êtes-vous sûr de vouloir supprimer cet espace de travail ? Cela supprimera tous les flux de cartes et les cartes attribuées.',
            unavailable: 'Espace de travail indisponible',
            memberNotFound: "Membre introuvable. Pour inviter un nouveau membre à l'espace de travail, veuillez utiliser le bouton d'invitation ci-dessus.",
            notAuthorized: "Vous n'avez pas acc\u00E8s \u00E0 cette page. Si vous essayez de rejoindre cet espace de travail, demandez simplement au propri\u00E9taire de l'espace de travail de vous ajouter en tant que membre. Autre chose ? Contactez ".concat(CONST_1.default.EMAIL.CONCIERGE, "."),
            goToWorkspace: "Aller à l'espace de travail",
            goToWorkspaces: 'Aller aux espaces de travail',
            clearFilter: 'Effacer le filtre',
            workspaceName: "Nom de l'espace de travail",
            workspaceOwner: 'Propriétaire',
            workspaceType: "Type d'espace de travail",
            workspaceAvatar: "Avatar de l'espace de travail",
            mustBeOnlineToViewMembers: 'Vous devez être en ligne pour voir les membres de cet espace de travail.',
            moreFeatures: 'Plus de fonctionnalités',
            requested: 'Demandé',
            distanceRates: 'Tarifs de distance',
            defaultDescription: 'Un seul endroit pour tous vos reçus et dépenses.',
            descriptionHint: 'Partager des informations sur cet espace de travail avec tous les membres.',
            welcomeNote: 'Veuillez utiliser Expensify pour soumettre vos reçus pour remboursement, merci !',
            subscription: 'Abonnement',
            markAsEntered: 'Marquer comme saisi manuellement',
            markAsExported: 'Marquer comme exporté manuellement',
            exportIntegrationSelected: function (_a) {
                var connectionName = _a.connectionName;
                return "Exporter vers ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
            },
            letsDoubleCheck: 'Vérifions que tout est correct.',
            lineItemLevel: 'Niveau des postes de dépense',
            reportLevel: 'Niveau de rapport',
            topLevel: 'Niveau supérieur',
            appliedOnExport: "Non importé dans Expensify, appliqué à l'exportation",
            shareNote: {
                header: "Partagez votre espace de travail avec d'autres membres",
                content: {
                    firstPart: "Partagez ce code QR ou copiez le lien ci-dessous pour faciliter la demande d'accès des membres à votre espace de travail. Toutes les demandes pour rejoindre l'espace de travail apparaîtront dans le",
                    secondPart: 'espace pour votre avis.',
                },
            },
            connectTo: function (_a) {
                var connectionName = _a.connectionName;
                return "Se connecter \u00E0 ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
            },
            createNewConnection: 'Créer une nouvelle connexion',
            reuseExistingConnection: 'Réutiliser la connexion existante',
            existingConnections: 'Connexions existantes',
            existingConnectionsDescription: function (_a) {
                var connectionName = _a.connectionName;
                return "Puisque vous vous \u00EAtes d\u00E9j\u00E0 connect\u00E9 \u00E0 ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], ", vous pouvez choisir de r\u00E9utiliser une connexion existante ou d'en cr\u00E9er une nouvelle.");
            },
            lastSyncDate: function (_a) {
                var connectionName = _a.connectionName, formattedDate = _a.formattedDate;
                return "".concat(connectionName, " - Derni\u00E8re synchronisation le ").concat(formattedDate);
            },
            authenticationError: function (_a) {
                var connectionName = _a.connectionName;
                return "Impossible de se connecter \u00E0 ".concat(connectionName, " en raison d'une erreur d'authentification");
            },
            learnMore: 'En savoir plus.',
            memberAlternateText: 'Les membres peuvent soumettre et approuver des rapports.',
            adminAlternateText: "Les administrateurs ont un accès complet pour modifier tous les rapports et les paramètres de l'espace de travail.",
            auditorAlternateText: 'Les auditeurs peuvent voir et commenter les rapports.',
            roleName: function (_a) {
                var _b = _a === void 0 ? {} : _a, role = _b.role;
                switch (role) {
                    case CONST_1.default.POLICY.ROLE.ADMIN:
                        return 'Admin';
                    case CONST_1.default.POLICY.ROLE.AUDITOR:
                        return 'Auditeur';
                    case CONST_1.default.POLICY.ROLE.USER:
                        return 'Membre';
                    default:
                        return 'Membre';
                }
            },
            frequency: {
                manual: 'Manuellement',
                instant: 'Instantané',
                immediate: 'Quotidiennement',
                trip: 'Par voyage',
                weekly: 'Hebdomadaire',
                semimonthly: 'Deux fois par mois',
                monthly: 'Mensuel',
            },
            planType: 'Type de plan',
            submitExpense: 'Soumettez vos dépenses ci-dessous :',
            defaultCategory: 'Catégorie par défaut',
            viewTransactions: 'Voir les transactions',
            policyExpenseChatName: function (_a) {
                var displayName = _a.displayName;
                return "Les d\u00E9penses de ".concat(displayName);
            },
        },
        perDiem: {
            subtitle: 'Définissez des taux de per diem pour contrôler les dépenses quotidiennes des employés.',
            amount: 'Montant',
            deleteRates: function () { return ({
                one: 'Supprimer le taux',
                other: 'Supprimer les tarifs',
            }); },
            deletePerDiemRate: 'Supprimer le taux de per diem',
            findPerDiemRate: 'Trouver le taux journalier',
            areYouSureDelete: function () { return ({
                one: 'Êtes-vous sûr de vouloir supprimer ce tarif ?',
                other: 'Êtes-vous sûr de vouloir supprimer ces tarifs ?',
            }); },
            emptyList: {
                title: 'Per diem',
                subtitle: 'Définissez des taux de per diem pour contrôler les dépenses quotidiennes des employés. Importez les taux depuis une feuille de calcul pour commencer.',
            },
            errors: {
                existingRateError: function (_a) {
                    var rate = _a.rate;
                    return "Un taux avec la valeur ".concat(rate, " existe d\u00E9j\u00E0");
                },
            },
            importPerDiemRates: 'Importer les taux de per diem',
            editPerDiemRate: 'Modifier le taux de per diem',
            editPerDiemRates: 'Modifier les taux de per diem',
            editDestinationSubtitle: function (_a) {
                var destination = _a.destination;
                return "La mise \u00E0 jour de cette destination la modifiera pour tous les sous-taux de ".concat(destination, " par diem.");
            },
            editCurrencySubtitle: function (_a) {
                var destination = _a.destination;
                return "La mise \u00E0 jour de cette devise la modifiera pour tous les sous-taux de per diem ".concat(destination, ".");
            },
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Définissez comment les dépenses hors de la poche sont exportées vers QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Marquer les chèques comme « imprimer plus tard »',
            exportDescription: 'Configurez comment les données Expensify sont exportées vers QuickBooks Desktop.',
            date: "Date d'exportation",
            exportInvoices: 'Exporter les factures vers',
            exportExpensifyCard: 'Exporter les transactions de la carte Expensify en tant que',
            account: 'Compte',
            accountDescription: 'Choisissez où publier les écritures de journal.',
            accountsPayable: 'Comptes fournisseurs',
            accountsPayableDescription: 'Choisissez où créer des factures fournisseurs.',
            bankAccount: 'Compte bancaire',
            notConfigured: 'Non configuré',
            bankAccountDescription: "Choisissez d'où envoyer les chèques.",
            creditCardAccount: 'Compte de carte de crédit',
            exportDate: {
                label: "Date d'exportation",
                description: "Utilisez cette date lors de l'exportation des rapports vers QuickBooks Desktop.",
                values: (_e = {},
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente sur le rapport.',
                    },
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: "Date d'exportation",
                        description: 'Date à laquelle le rapport a été exporté vers QuickBooks Desktop.',
                    },
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: 'Date de soumission',
                        description: 'Date à laquelle le rapport a été soumis pour approbation.',
                    },
                    _e),
            },
            exportCheckDescription: "Nous créerons un chèque détaillé pour chaque rapport Expensify et l'enverrons depuis le compte bancaire ci-dessous.",
            exportJournalEntryDescription: 'Nous créerons une écriture de journal détaillée pour chaque rapport Expensify et la publierons sur le compte ci-dessous.',
            exportVendorBillDescription: "Nous créerons une facture détaillée pour chaque rapport Expensify et l'ajouterons au compte ci-dessous. Si cette période est clôturée, nous la publierons au 1er de la prochaine période ouverte.",
            deepDiveExpensifyCard: 'Les transactions de la carte Expensify seront automatiquement exportées vers un "Compte de responsabilité de carte Expensify" créé avec',
            deepDiveExpensifyCardIntegration: 'notre intégration.',
            outOfPocketTaxEnabledDescription: "QuickBooks Desktop ne prend pas en charge les taxes sur les exportations d'écritures de journal. Comme vous avez activé les taxes dans votre espace de travail, cette option d'exportation n'est pas disponible.",
            outOfPocketTaxEnabledError: "Les écritures de journal ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d'exportation.",
            accounts: (_f = {},
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD] = 'Carte de crédit',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Facture fournisseur',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Écriture comptable',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Vérifier',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK, "Description")] = "Nous créerons un chèque détaillé pour chaque rapport Expensify et l'enverrons depuis le compte bancaire ci-dessous.",
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "Description")] = "Nous associerons automatiquement le nom du commerçant sur la transaction par carte de crédit à tout fournisseur correspondant dans QuickBooks. Si aucun fournisseur n'existe, nous créerons un fournisseur « Crédit Carte Divers » pour l'association.",
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Description")] = "Nous créerons une facture fournisseur détaillée pour chaque rapport Expensify avec la date de la dernière dépense, et l'ajouterons au compte ci-dessous. Si cette période est clôturée, nous la publierons au 1er de la prochaine période ouverte.",
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "AccountDescription")] = 'Choisissez où exporter les transactions par carte de crédit.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "AccountDescription")] = 'Choisissez un fournisseur à appliquer à toutes les transactions par carte de crédit.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "AccountDescription")] = "Choisissez d'où envoyer les chèques.",
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Error")] = "Les factures des fournisseurs ne sont pas disponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d'exportation.",
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "Error")] = "Les chèques sont indisponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d'exportation.",
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY, "Error")] = "Les écritures de journal ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d'exportation.",
                _f),
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: 'Ajoutez le compte dans QuickBooks Desktop et synchronisez à nouveau la connexion.',
            qbdSetup: 'Configuration de QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Impossible de se connecter depuis cet appareil',
                body1: "Vous devrez configurer cette connexion à partir de l'ordinateur qui héberge votre fichier d'entreprise QuickBooks Desktop.",
                body2: "Une fois connecté, vous pourrez synchroniser et exporter de n'importe où.",
            },
            setupPage: {
                title: 'Ouvrez ce lien pour vous connecter.',
                body: "Pour terminer la configuration, ouvrez le lien suivant sur l'ordinateur où QuickBooks Desktop est en cours d'exécution.",
                setupErrorTitle: "Quelque chose s'est mal passé",
                setupErrorBody1: 'La connexion QuickBooks Desktop ne fonctionne pas pour le moment. Veuillez réessayer plus tard ou',
                setupErrorBody2: 'si le problème persiste.',
                setupErrorBodyContactConcierge: 'contactez Concierge',
            },
            importDescription: 'Choisissez quelles configurations de codage importer de QuickBooks Desktop vers Expensify.',
            classes: 'Cours',
            items: 'Articles',
            customers: 'Clients/projets',
            exportCompanyCardsDescription: "Définir comment les achats par carte d'entreprise sont exportés vers QuickBooks Desktop.",
            defaultVendorDescription: "Définir un fournisseur par défaut qui s'appliquera à toutes les transactions par carte de crédit lors de l'exportation.",
            accountsDescription: 'Votre plan comptable QuickBooks Desktop sera importé dans Expensify en tant que catégories.',
            accountsSwitchTitle: "Choisissez d'importer de nouveaux comptes en tant que catégories activées ou désactivées.",
            accountsSwitchDescription: 'Les catégories activées seront disponibles pour les membres lors de la création de leurs dépenses.',
            classesDescription: 'Choisissez comment gérer les classes QuickBooks Desktop dans Expensify.',
            tagsDisplayedAsDescription: "Niveau de ligne d'article",
            reportFieldsDisplayedAsDescription: 'Niveau de rapport',
            customersDescription: 'Choisissez comment gérer les clients/projets QuickBooks Desktop dans Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec QuickBooks Desktop tous les jours.',
                createEntities: 'Créer automatiquement des entités',
                createEntitiesDescription: "Expensify créera automatiquement des fournisseurs dans QuickBooks Desktop s'ils n'existent pas déjà.",
            },
            itemsDescription: 'Choisissez comment gérer les éléments QuickBooks Desktop dans Expensify.',
        },
        qbo: {
            connectedTo: 'Connecté à',
            importDescription: 'Choisissez quelles configurations de codage importer de QuickBooks Online vers Expensify.',
            classes: 'Cours',
            locations: 'Lieux',
            customers: 'Clients/projets',
            accountsDescription: 'Votre plan comptable QuickBooks Online sera importé dans Expensify en tant que catégories.',
            accountsSwitchTitle: "Choisissez d'importer de nouveaux comptes en tant que catégories activées ou désactivées.",
            accountsSwitchDescription: 'Les catégories activées seront disponibles pour les membres lors de la création de leurs dépenses.',
            classesDescription: 'Choisissez comment gérer les classes QuickBooks Online dans Expensify.',
            customersDescription: 'Choisissez comment gérer les clients/projets QuickBooks Online dans Expensify.',
            locationsDescription: 'Choisissez comment gérer les emplacements QuickBooks Online dans Expensify.',
            taxesDescription: 'Choisissez comment gérer les taxes QuickBooks Online dans Expensify.',
            locationsLineItemsRestrictionDescription: "QuickBooks Online ne prend pas en charge les emplacements au niveau des lignes pour les chèques ou les factures fournisseurs. Si vous souhaitez avoir des emplacements au niveau des lignes, assurez-vous d'utiliser les écritures de journal et les dépenses par carte de crédit/débit.",
            taxesJournalEntrySwitchNote: "QuickBooks Online ne prend pas en charge les taxes sur les écritures de journal. Veuillez changer votre option d'exportation en facture fournisseur ou chèque.",
            exportDescription: 'Configurez comment les données Expensify sont exportées vers QuickBooks Online.',
            date: "Date d'exportation",
            exportInvoices: 'Exporter les factures vers',
            exportExpensifyCard: 'Exporter les transactions de la carte Expensify en tant que',
            deepDiveExpensifyCard: 'Les transactions de la carte Expensify seront automatiquement exportées vers un "Compte de responsabilité de carte Expensify" créé avec',
            deepDiveExpensifyCardIntegration: 'notre intégration.',
            exportDate: {
                label: "Date d'exportation",
                description: "Utilisez cette date lors de l'exportation des rapports vers QuickBooks Online.",
                values: (_g = {},
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente sur le rapport.',
                    },
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: "Date d'exportation",
                        description: 'Date à laquelle le rapport a été exporté vers QuickBooks Online.',
                    },
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: 'Date de soumission',
                        description: 'Date à laquelle le rapport a été soumis pour approbation.',
                    },
                    _g),
            },
            receivable: 'Comptes clients', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archive des comptes clients', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: "Utilisez ce compte lors de l'exportation des factures vers QuickBooks Online.",
            exportCompanyCardsDescription: "Définir comment les achats par carte d'entreprise sont exportés vers QuickBooks Online.",
            vendor: 'Fournisseur',
            defaultVendorDescription: "Définir un fournisseur par défaut qui s'appliquera à toutes les transactions par carte de crédit lors de l'exportation.",
            exportOutOfPocketExpensesDescription: 'Définissez comment les dépenses hors de la poche sont exportées vers QuickBooks Online.',
            exportCheckDescription: "Nous créerons un chèque détaillé pour chaque rapport Expensify et l'enverrons depuis le compte bancaire ci-dessous.",
            exportJournalEntryDescription: 'Nous créerons une écriture de journal détaillée pour chaque rapport Expensify et la publierons sur le compte ci-dessous.',
            exportVendorBillDescription: "Nous créerons une facture détaillée pour chaque rapport Expensify et l'ajouterons au compte ci-dessous. Si cette période est clôturée, nous la publierons au 1er de la prochaine période ouverte.",
            account: 'Compte',
            accountDescription: 'Choisissez où publier les écritures de journal.',
            accountsPayable: 'Comptes fournisseurs',
            accountsPayableDescription: 'Choisissez où créer des factures fournisseurs.',
            bankAccount: 'Compte bancaire',
            notConfigured: 'Non configuré',
            bankAccountDescription: "Choisissez d'où envoyer les chèques.",
            creditCardAccount: 'Compte de carte de crédit',
            companyCardsLocationEnabledDescription: "QuickBooks Online ne prend pas en charge les emplacements pour les exportations de factures fournisseurs. Comme vous avez activé les emplacements dans votre espace de travail, cette option d'exportation n'est pas disponible.",
            outOfPocketTaxEnabledDescription: "QuickBooks Online ne prend pas en charge les taxes sur les exportations d'écritures de journal. Comme vous avez activé les taxes sur votre espace de travail, cette option d'exportation n'est pas disponible.",
            outOfPocketTaxEnabledError: "Les écritures de journal ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d'exportation.",
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec QuickBooks Online chaque jour.',
                inviteEmployees: 'Inviter des employés',
                inviteEmployeesDescription: 'Importer les dossiers des employés de QuickBooks Online et inviter les employés à cet espace de travail.',
                createEntities: 'Créer automatiquement des entités',
                createEntitiesDescription: "Expensify créera automatiquement des fournisseurs dans QuickBooks Online s'ils n'existent pas déjà, et créera automatiquement des clients lors de l'exportation des factures.",
                reimbursedReportsDescription: "Chaque fois qu'un rapport est payé en utilisant Expensify ACH, le paiement de facture correspondant sera créé dans le compte QuickBooks Online ci-dessous.",
                qboBillPaymentAccount: 'Compte de paiement de factures QuickBooks',
                qboInvoiceCollectionAccount: 'Compte de recouvrement des factures QuickBooks',
                accountSelectDescription: "Choisissez d'où payer les factures et nous créerons le paiement dans QuickBooks Online.",
                invoiceAccountSelectorDescription: 'Choisissez où recevoir les paiements de factures et nous créerons le paiement dans QuickBooks Online.',
            },
            accounts: (_h = {},
                _h[CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD] = 'Carte de débit',
                _h[CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD] = 'Carte de crédit',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Facture fournisseur',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Écriture comptable',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Vérifier',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD, "Description")] = "Nous associerons automatiquement le nom du marchand sur la transaction par carte de débit à tout fournisseur correspondant dans QuickBooks. Si aucun fournisseur n'existe, nous créerons un fournisseur 'Carte de Débit Divers' pour l'association.",
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "Description")] = "Nous associerons automatiquement le nom du commerçant sur la transaction par carte de crédit à tout fournisseur correspondant dans QuickBooks. Si aucun fournisseur n'existe, nous créerons un fournisseur « Crédit Carte Divers » pour l'association.",
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Description")] = "Nous créerons une facture fournisseur détaillée pour chaque rapport Expensify avec la date de la dernière dépense, et l'ajouterons au compte ci-dessous. Si cette période est clôturée, nous la publierons au 1er de la prochaine période ouverte.",
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD, "AccountDescription")] = 'Choisissez où exporter les transactions par carte de débit.',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "AccountDescription")] = 'Choisissez où exporter les transactions par carte de crédit.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "AccountDescription")] = 'Choisissez un fournisseur à appliquer à toutes les transactions par carte de crédit.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Error")] = "Les factures des fournisseurs ne sont pas disponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d'exportation.",
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "Error")] = "Les chèques sont indisponibles lorsque les emplacements sont activés. Veuillez choisir une autre option d'exportation.",
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY, "Error")] = "Les écritures de journal ne sont pas disponibles lorsque les taxes sont activées. Veuillez choisir une autre option d'exportation.",
                _h),
            exportDestinationAccountsMisconfigurationError: (_j = {},
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = "Choisissez un compte valide pour l'exportation de la facture fournisseur",
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = "Choisissez un compte valide pour l'exportation de l'écriture de journal",
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = "Choisissez un compte valide pour l'exportation de chèques",
                _j),
            exportDestinationSetupAccountsInfo: (_k = {},
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = "Pour utiliser l'exportation de factures fournisseurs, configurez un compte de comptes fournisseurs dans QuickBooks Online.",
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = "Pour utiliser l'exportation d'écritures de journal, configurez un compte de journal dans QuickBooks Online.",
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = "Pour utiliser l'exportation de chèques, configurez un compte bancaire dans QuickBooks Online.",
                _k),
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: 'Ajoutez le compte dans QuickBooks Online et synchronisez à nouveau la connexion.',
            accountingMethods: {
                label: 'Quand exporter',
                description: 'Choisissez quand exporter les dépenses :',
                values: (_l = {},
                    _l[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Accrual',
                    _l[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Espèces',
                    _l),
                alternateText: (_m = {},
                    _m[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Les dépenses hors de la poche seront exportées une fois approuvées définitivement.',
                    _m[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = "Les dépenses personnelles seront exportées lorsqu'elles seront payées.",
                    _m),
            },
        },
        workspaceList: {
            joinNow: 'Rejoignez maintenant',
            askToJoin: 'Demander à rejoindre',
        },
        xero: {
            organization: 'organisation Xero',
            organizationDescription: "Choisissez l'organisation Xero à partir de laquelle vous souhaitez importer des données.",
            importDescription: 'Choisissez quelles configurations de codage importer de Xero vers Expensify.',
            accountsDescription: 'Votre plan comptable Xero sera importé dans Expensify en tant que catégories.',
            accountsSwitchTitle: "Choisissez d'importer de nouveaux comptes en tant que catégories activées ou désactivées.",
            accountsSwitchDescription: 'Les catégories activées seront disponibles pour les membres lors de la création de leurs dépenses.',
            trackingCategories: 'Catégories de suivi',
            trackingCategoriesDescription: 'Choisissez comment gérer les catégories de suivi Xero dans Expensify.',
            mapTrackingCategoryTo: function (_a) {
                var categoryName = _a.categoryName;
                return "Mapper ".concat(categoryName, " de Xero \u00E0");
            },
            mapTrackingCategoryToDescription: function (_a) {
                var categoryName = _a.categoryName;
                return "Choisissez o\u00F9 mapper ".concat(categoryName, " lors de l'exportation vers Xero.");
            },
            customers: 'Refacturer les clients',
            customersDescription: 'Choisissez si vous souhaitez refacturer les clients dans Expensify. Vos contacts clients Xero peuvent être associés à des dépenses et seront exportés vers Xero en tant que facture de vente.',
            taxesDescription: 'Choisissez comment gérer les taxes Xero dans Expensify.',
            notImported: 'Non importé',
            notConfigured: 'Non configuré',
            trackingCategoriesOptions: (_o = {},
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT] = 'Xero contact par défaut',
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG] = 'Tags',
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD] = 'Champs de rapport',
                _o),
            exportDescription: 'Configurez comment les données Expensify sont exportées vers Xero.',
            purchaseBill: "Facture d'achat",
            exportDeepDiveCompanyCard: 'Les dépenses exportées seront enregistrées comme transactions bancaires sur le compte bancaire Xero ci-dessous, et les dates des transactions correspondront aux dates de votre relevé bancaire.',
            bankTransactions: 'Transactions bancaires',
            xeroBankAccount: 'Compte bancaire Xero',
            xeroBankAccountDescription: 'Choisissez où les dépenses seront enregistrées en tant que transactions bancaires.',
            exportExpensesDescription: "Les rapports seront exportés en tant que facture d'achat avec la date et le statut sélectionnés ci-dessous.",
            purchaseBillDate: "Date de la facture d'achat",
            exportInvoices: 'Exporter les factures en tant que',
            salesInvoice: 'Facture de vente',
            exportInvoicesDescription: 'Les factures de vente affichent toujours la date à laquelle la facture a été envoyée.',
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec Xero tous les jours.',
                purchaseBillStatusTitle: "Statut de la facture d'achat",
                reimbursedReportsDescription: "Chaque fois qu'un rapport est payé en utilisant Expensify ACH, le paiement de facture correspondant sera créé dans le compte Xero ci-dessous.",
                xeroBillPaymentAccount: 'Compte de paiement de factures Xero',
                xeroInvoiceCollectionAccount: 'Compte de recouvrement des factures Xero',
                xeroBillPaymentAccountDescription: "Choisissez d'où payer les factures et nous créerons le paiement dans Xero.",
                invoiceAccountSelectorDescription: 'Choisissez où recevoir les paiements de factures et nous créerons le paiement dans Xero.',
            },
            exportDate: {
                label: "Date de la facture d'achat",
                description: "Utilisez cette date lors de l'exportation des rapports vers Xero.",
                values: (_p = {},
                    _p[CONST_1.default.XERO_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente sur le rapport.',
                    },
                    _p[CONST_1.default.XERO_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: "Date d'exportation",
                        description: 'Date à laquelle le rapport a été exporté vers Xero.',
                    },
                    _p[CONST_1.default.XERO_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: 'Date de soumission',
                        description: 'Date à laquelle le rapport a été soumis pour approbation.',
                    },
                    _p),
            },
            invoiceStatus: {
                label: "Statut de la facture d'achat",
                description: "Utilisez ce statut lors de l'exportation des factures d'achat vers Xero.",
                values: (_q = {},
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.DRAFT] = 'Brouillon',
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL] = "En attente d'approbation",
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT] = 'En attente de paiement',
                    _q),
            },
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: 'Veuillez ajouter le compte dans Xero et synchroniser à nouveau la connexion.',
        },
        sageIntacct: {
            preferredExporter: 'Exportateur préféré',
            taxSolution: 'Solution fiscale',
            notConfigured: 'Non configuré',
            exportDate: {
                label: "Date d'exportation",
                description: "Utilisez cette date lors de l'exportation des rapports vers Sage Intacct.",
                values: (_r = {},
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente sur le rapport.',
                    },
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.EXPORTED] = {
                        label: "Date d'exportation",
                        description: 'Date à laquelle le rapport a été exporté vers Sage Intacct.',
                    },
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.SUBMITTED] = {
                        label: 'Date de soumission',
                        description: 'Date à laquelle le rapport a été soumis pour approbation.',
                    },
                    _r),
            },
            reimbursableExpenses: {
                description: 'Définissez comment les dépenses personnelles sont exportées vers Sage Intacct.',
                values: (_s = {},
                    _s[CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT] = 'Rapports de dépenses',
                    _s[CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL] = 'Factures fournisseurs',
                    _s),
            },
            nonReimbursableExpenses: {
                description: "Définissez comment les achats par carte d'entreprise sont exportés vers Sage Intacct.",
                values: (_t = {},
                    _t[CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE] = 'Cartes de crédit',
                    _t[CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL] = 'Factures fournisseurs',
                    _t),
            },
            creditCardAccount: 'Compte de carte de crédit',
            defaultVendor: 'Fournisseur par défaut',
            defaultVendorDescription: function (_a) {
                var isReimbursable = _a.isReimbursable;
                return "D\u00E9finissez un fournisseur par d\u00E9faut qui s'appliquera aux d\u00E9penses remboursables de ".concat(isReimbursable ? '' : 'non-', " qui n'ont pas de fournisseur correspondant dans Sage Intacct.");
            },
            exportDescription: 'Configurez comment les données Expensify sont exportées vers Sage Intacct.',
            exportPreferredExporterNote: "L'exportateur préféré peut être n'importe quel administrateur de l'espace de travail, mais doit également être un administrateur de domaine si vous définissez différents comptes d'exportation pour des cartes d'entreprise individuelles dans les paramètres de domaine.",
            exportPreferredExporterSubNote: "Une fois défini, l'exportateur préféré verra les rapports à exporter dans son compte.",
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: "Veuillez ajouter le compte dans Sage Intacct et synchroniser \u00E0 nouveau la connexion.",
            autoSync: 'Synchronisation automatique',
            autoSyncDescription: 'Expensify se synchronisera automatiquement avec Sage Intacct tous les jours.',
            inviteEmployees: 'Inviter des employés',
            inviteEmployeesDescription: "Importer les dossiers des employés Sage Intacct et inviter les employés à cet espace de travail. Votre flux de travail d'approbation sera par défaut une approbation par le manager et peut être configuré davantage sur la page Membres.",
            syncReimbursedReports: 'Synchroniser les rapports remboursés',
            syncReimbursedReportsDescription: "Chaque fois qu'un rapport est payé en utilisant Expensify ACH, le paiement de facture correspondant sera créé dans le compte Sage Intacct ci-dessous.",
            paymentAccount: 'Compte de paiement Sage Intacct',
        },
        netsuite: {
            subsidiary: 'Filiale',
            subsidiarySelectDescription: 'Choisissez la filiale dans NetSuite à partir de laquelle vous souhaitez importer des données.',
            exportDescription: 'Configurez comment les données Expensify sont exportées vers NetSuite.',
            exportInvoices: 'Exporter les factures vers',
            journalEntriesTaxPostingAccount: 'Comptes de publication fiscale des écritures de journal',
            journalEntriesProvTaxPostingAccount: 'Entrées de journal compte de publication de la taxe provinciale',
            foreignCurrencyAmount: 'Exporter le montant en devise étrangère',
            exportToNextOpenPeriod: 'Exporter vers la prochaine période ouverte',
            nonReimbursableJournalPostingAccount: 'Compte de publication de journal non remboursable',
            reimbursableJournalPostingAccount: 'Compte de publication de journal remboursable',
            journalPostingPreference: {
                label: 'Préférence de publication des écritures de journal',
                values: (_u = {},
                    _u[CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE] = 'Entrée unique et détaillée pour chaque rapport',
                    _u[CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE] = 'Une seule entrée pour chaque dépense',
                    _u),
            },
            invoiceItem: {
                label: 'Article de facture',
                values: (_v = {},
                    _v[CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE] = {
                        label: 'Créez-en un pour moi',
                        description: 'Nous créerons un "élément de ligne de facture Expensify" pour vous lors de l\'exportation (si un n\'existe pas déjà).',
                    },
                    _v[CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT] = {
                        label: 'Sélectionner existant',
                        description: "Nous lierons les factures d'Expensify à l'élément sélectionné ci-dessous.",
                    },
                    _v),
            },
            exportDate: {
                label: "Date d'exportation",
                description: "Utilisez cette date lors de l'exportation des rapports vers NetSuite.",
                values: (_w = {},
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Date de la dernière dépense',
                        description: 'Date de la dépense la plus récente sur le rapport.',
                    },
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.EXPORTED] = {
                        label: "Date d'exportation",
                        description: 'Date à laquelle le rapport a été exporté vers NetSuite.',
                    },
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.SUBMITTED] = {
                        label: 'Date de soumission',
                        description: 'Date à laquelle le rapport a été soumis pour approbation.',
                    },
                    _w),
            },
            exportDestination: {
                values: (_x = {},
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT] = {
                        label: 'Rapports de dépenses',
                        reimbursableDescription: 'Les dépenses personnelles seront exportées sous forme de rapports de dépenses vers NetSuite.',
                        nonReimbursableDescription: "Les dépenses des cartes d'entreprise seront exportées sous forme de rapports de dépenses vers NetSuite.",
                    },
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL] = {
                        label: 'Factures fournisseurs',
                        reimbursableDescription: 'Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                        nonReimbursableDescription: 'Company card expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                    },
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY] = {
                        label: 'Écritures de journal',
                        reimbursableDescription: 'Out-of-pocket expenses will export as journal entries to the NetSuite account specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                        nonReimbursableDescription: 'Company card expenses will export as journal entries to the NetSuite account specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                    },
                    _x),
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify se synchronisera automatiquement avec NetSuite tous les jours.',
                reimbursedReportsDescription: "Chaque fois qu'un rapport est payé en utilisant Expensify ACH, le paiement de facture correspondant sera créé dans le compte NetSuite ci-dessous.",
                reimbursementsAccount: 'Compte de remboursements',
                reimbursementsAccountDescription: 'Choisissez le compte bancaire que vous utiliserez pour les remboursements, et nous créerons le paiement associé dans NetSuite.',
                collectionsAccount: 'Compte de recouvrement',
                collectionsAccountDescription: "Une fois qu'une facture est marquée comme payée dans Expensify et exportée vers NetSuite, elle apparaîtra sur le compte ci-dessous.",
                approvalAccount: "Compte d'approbation A/P",
                approvalAccountDescription: "Choisissez le compte contre lequel les transactions seront approuvées dans NetSuite. Si vous synchronisez des rapports remboursés, c'est également le compte contre lequel les paiements de factures seront créés.",
                defaultApprovalAccount: 'NetSuite par défaut',
                inviteEmployees: 'Invitez des employés et définissez les approbations',
                inviteEmployeesDescription: "Importer les dossiers des employés de NetSuite et inviter les employés à cet espace de travail. Votre flux de travail d'approbation sera par défaut l'approbation du gestionnaire et peut être configuré davantage sur la page *Membres*.",
                autoCreateEntities: 'Créer automatiquement des employés/fournisseurs',
                enableCategories: 'Activer les catégories nouvellement importées',
                customFormID: 'ID de formulaire personnalisé',
                customFormIDDescription: 'Par défaut, Expensify créera des entrées en utilisant le formulaire de transaction préféré défini dans NetSuite. Vous pouvez également désigner un formulaire de transaction spécifique à utiliser.',
                customFormIDReimbursable: 'Dépense personnelle',
                customFormIDNonReimbursable: "Dépense de carte d'entreprise",
                exportReportsTo: {
                    label: "Niveau d'approbation du rapport de dépenses",
                    description: "Une fois qu'un rapport de dépenses est approuvé dans Expensify et exporté vers NetSuite, vous pouvez définir un niveau d'approbation supplémentaire dans NetSuite avant la publication.",
                    values: (_y = {},
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE] = 'Préférence par défaut de NetSuite',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED] = 'Approuvé uniquement par le superviseur',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED] = 'Seulement la comptabilité approuvée',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH] = 'Superviseur et comptabilité approuvés',
                        _y),
                },
                accountingMethods: {
                    label: 'Quand exporter',
                    description: 'Choisissez quand exporter les dépenses :',
                    values: (_z = {},
                        _z[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Accrual',
                        _z[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Espèces',
                        _z),
                    alternateText: (_0 = {},
                        _0[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Les dépenses hors de la poche seront exportées une fois approuvées définitivement.',
                        _0[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = "Les dépenses personnelles seront exportées lorsqu'elles seront payées.",
                        _0),
                },
                exportVendorBillsTo: {
                    label: "Niveau d'approbation des factures fournisseurs",
                    description: "Une fois qu'une facture fournisseur est approuvée dans Expensify et exportée vers NetSuite, vous pouvez définir un niveau d'approbation supplémentaire dans NetSuite avant la publication.",
                    values: (_1 = {},
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE] = 'Préférence par défaut de NetSuite',
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING] = "En attente d'approbation",
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED] = 'Approuvé pour publication',
                        _1),
                },
                exportJournalsTo: {
                    label: "Niveau d'approbation de l'écriture de journal",
                    description: "Une fois qu'une écriture de journal est approuvée dans Expensify et exportée vers NetSuite, vous pouvez définir un niveau d'approbation supplémentaire dans NetSuite avant de la comptabiliser.",
                    values: (_2 = {},
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE] = 'Préférence par défaut de NetSuite',
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING] = "En attente d'approbation",
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED] = 'Approuvé pour publication',
                        _2),
                },
                error: {
                    customFormID: 'Veuillez entrer un ID de formulaire personnalisé numérique valide',
                },
            },
            noAccountsFound: 'Aucun compte trouvé',
            noAccountsFoundDescription: 'Veuillez ajouter le compte dans NetSuite et synchroniser à nouveau la connexion.',
            noVendorsFound: 'Aucun fournisseur trouvé',
            noVendorsFoundDescription: 'Veuillez ajouter des fournisseurs dans NetSuite et synchroniser à nouveau la connexion.',
            noItemsFound: 'Aucun élément de facture trouvé',
            noItemsFoundDescription: 'Veuillez ajouter des éléments de facture dans NetSuite et synchroniser à nouveau la connexion.',
            noSubsidiariesFound: 'Aucune filiale trouvée',
            noSubsidiariesFoundDescription: 'Veuillez ajouter une filiale dans NetSuite et synchroniser à nouveau la connexion.',
            tokenInput: {
                title: 'Configuration de NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Installer le bundle Expensify',
                        description: 'Dans NetSuite, allez à *Customization > SuiteBundler > Search & Install Bundles* > recherchez "Expensify" > installez le bundle.',
                    },
                    enableTokenAuthentication: {
                        title: "Activer l'authentification par jeton",
                        description: "Dans NetSuite, allez à *Setup > Company > Enable Features > SuiteCloud* > activez *l'authentification basée sur les jetons*.",
                    },
                    enableSoapServices: {
                        title: 'Activer les services web SOAP',
                        description: 'Dans NetSuite, allez dans *Setup > Company > Enable Features > SuiteCloud* > activez *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: "Créer un jeton d'accès",
                        description: 'Dans NetSuite, allez à *Setup > Users/Roles > Access Tokens* > créez un jeton d\'accès pour l\'application "Expensify" et soit le rôle "Expensify Integration" soit le rôle "Administrator".\n\n*Important :* Assurez-vous de sauvegarder le *Token ID* et le *Token Secret* de cette étape. Vous en aurez besoin pour l\'étape suivante.',
                    },
                    enterCredentials: {
                        title: 'Entrez vos identifiants NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: 'Token ID',
                            netSuiteTokenSecret: 'Token Secret',
                        },
                        netSuiteAccountIDDescription: 'Dans NetSuite, allez à *Setup > Integration > SOAP Web Services Preferences*.',
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
                        subtitle: 'Choisissez comment gérer les *départements* NetSuite dans Expensify.',
                    },
                    classes: {
                        title: 'Cours',
                        subtitle: 'Choisissez comment gérer les *classes* dans Expensify.',
                    },
                    locations: {
                        title: 'Lieux',
                        subtitle: 'Choisissez comment gérer les *emplacements* dans Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Clients/projets',
                    subtitle: 'Choisissez comment gérer les *clients* et les *projets* NetSuite dans Expensify.',
                    importCustomers: 'Importer des clients',
                    importJobs: 'Importer des projets',
                    customers: 'clients',
                    jobs: 'projets',
                    label: function (_a) {
                        var importFields = _a.importFields, importType = _a.importType;
                        return "".concat(importFields.join('et'), ", ").concat(importType);
                    },
                },
                importTaxDescription: 'Importer des groupes de taxes depuis NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Choisissez une option ci-dessous :',
                    label: function (_a) {
                        var importedTypes = _a.importedTypes;
                        return "Import\u00E9 en tant que ".concat(importedTypes.join('et'));
                    },
                    requiredFieldError: function (_a) {
                        var fieldName = _a.fieldName;
                        return "Veuillez entrer le ".concat(fieldName);
                    },
                    customSegments: {
                        title: 'Segments/enregistrements personnalisés',
                        addText: 'Ajouter un segment/enregistrement personnalisé',
                        recordTitle: 'Segment/record personnalisé',
                        helpLink: CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Voir les instructions détaillées',
                        helpText: 'sur la configuration de segments/enregistrements personnalisés.',
                        emptyTitle: 'Ajouter un segment personnalisé ou un enregistrement personnalisé',
                        fields: {
                            segmentName: 'Nom',
                            internalID: 'ID interne',
                            scriptID: 'Script ID',
                            customRecordScriptID: 'ID de colonne de transaction',
                            mapping: 'Affiché comme',
                        },
                        removeTitle: 'Supprimer le segment/enregistrement personnalisé',
                        removePrompt: 'Êtes-vous sûr de vouloir supprimer ce segment/enregistrement personnalisé ?',
                        addForm: {
                            customSegmentName: 'nom de segment personnalisé',
                            customRecordName: "nom d'enregistrement personnalisé",
                            segmentTitle: 'Segment personnalisé',
                            customSegmentAddTitle: 'Ajouter un segment personnalisé',
                            customRecordAddTitle: 'Ajouter un enregistrement personnalisé',
                            recordTitle: 'Enregistrement personnalisé',
                            segmentRecordType: 'Voulez-vous ajouter un segment personnalisé ou un enregistrement personnalisé ?',
                            customSegmentNameTitle: 'Quel est le nom du segment personnalisé ?',
                            customRecordNameTitle: "Quel est le nom de l'enregistrement personnalisé ?",
                            customSegmentNameFooter: "Vous pouvez trouver les noms de segments personnalis\u00E9s dans NetSuite sous *Customizations > Links, Records & Fields > Custom Segments*.\n\n_Pour des instructions plus d\u00E9taill\u00E9es, [visitez notre site d'aide](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customRecordNameFooter: "Vous pouvez trouver des noms d'enregistrements personnalis\u00E9s dans NetSuite en entrant \"Transaction Column Field\" dans la recherche globale.\n\n_Pour des instructions plus d\u00E9taill\u00E9es, [visitez notre site d'aide](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customSegmentInternalIDTitle: "Quel est l'ID interne ?",
                            customSegmentInternalIDFooter: "Tout d'abord, assurez-vous d'avoir activ\u00E9 les ID internes dans NetSuite sous *Accueil > D\u00E9finir les pr\u00E9f\u00E9rences > Afficher l'ID interne.*\n\nVous pouvez trouver les ID internes des segments personnalis\u00E9s dans NetSuite sous :\n\n1. *Personnalisation > Listes, enregistrements et champs > Segments personnalis\u00E9s*.\n2. Cliquez sur un segment personnalis\u00E9.\n3. Cliquez sur le lien hypertexte \u00E0 c\u00F4t\u00E9 de *Type d'enregistrement personnalis\u00E9*.\n4. Trouvez l'ID interne dans le tableau en bas.\n\n_Pour des instructions plus d\u00E9taill\u00E9es, [visitez notre site d'aide](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")_."),
                            customRecordInternalIDFooter: "Vous pouvez trouver les ID internes des enregistrements personnalis\u00E9s dans NetSuite en suivant ces \u00E9tapes :\n\n1. Entrez \"Transaction Line Fields\" dans la recherche globale.\n2. Cliquez sur un enregistrement personnalis\u00E9.\n3. Trouvez l'ID interne sur le c\u00F4t\u00E9 gauche.\n\n_Pour des instructions plus d\u00E9taill\u00E9es, [visitez notre site d'aide](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customSegmentScriptIDTitle: "Quel est l'ID du script ?",
                            customSegmentScriptIDFooter: "Vous pouvez trouver les IDs de script de segment personnalis\u00E9 dans NetSuite sous :\n\n1. *Personnalisation > Listes, Enregistrements et Champs > Segments Personnalis\u00E9s*.\n2. Cliquez sur un segment personnalis\u00E9.\n3. Cliquez sur l'onglet *Application et Sourcing* en bas, puis :\n    a. Si vous souhaitez afficher le segment personnalis\u00E9 comme un *tag* (au niveau de l'article) dans Expensify, cliquez sur le sous-onglet *Colonnes de Transaction* et utilisez l'*ID de Champ*.\n    b. Si vous souhaitez afficher le segment personnalis\u00E9 comme un *champ de rapport* (au niveau du rapport) dans Expensify, cliquez sur le sous-onglet *Transactions* et utilisez l'*ID de Champ*.\n\n_Pour des instructions plus d\u00E9taill\u00E9es, [visitez notre site d'aide](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")_."),
                            customRecordScriptIDTitle: "Quel est l'ID de la colonne de transaction ?",
                            customRecordScriptIDFooter: "Vous pouvez trouver les ID de script d'enregistrement personnalis\u00E9 dans NetSuite sous :\n\n1. Entrez \"Transaction Line Fields\" dans la recherche globale.\n2. Cliquez sur un enregistrement personnalis\u00E9.\n3. Trouvez l'ID de script sur le c\u00F4t\u00E9 gauche.\n\n_Pour des instructions plus d\u00E9taill\u00E9es, [visitez notre site d'aide](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customSegmentMappingTitle: 'Comment ce segment personnalisé doit-il être affiché dans Expensify ?',
                            customRecordMappingTitle: 'Comment cet enregistrement personnalisé doit-il être affiché dans Expensify ?',
                        },
                        errors: {
                            uniqueFieldError: function (_a) {
                                var fieldName = _a.fieldName;
                                return "Un segment/enregistrement personnalis\u00E9 avec ce ".concat(fieldName === null || fieldName === void 0 ? void 0 : fieldName.toLowerCase(), " existe d\u00E9j\u00E0.");
                            },
                        },
                    },
                    customLists: {
                        title: 'Listes personnalisées',
                        addText: 'Ajouter une liste personnalisée',
                        recordTitle: 'Liste personnalisée',
                        helpLink: CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
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
                        removePrompt: 'Êtes-vous sûr de vouloir supprimer cette liste personnalisée ?',
                        addForm: {
                            listNameTitle: 'Choisir une liste personnalisée',
                            transactionFieldIDTitle: "Quel est l'ID du champ de transaction ?",
                            transactionFieldIDFooter: "Vous pouvez trouver les identifiants des champs de transaction dans NetSuite en suivant ces \u00E9tapes :\n\n1. Entrez \"Champs de ligne de transaction\" dans la recherche globale.\n2. Cliquez sur une liste personnalis\u00E9e.\n3. Trouvez l'identifiant du champ de transaction sur le c\u00F4t\u00E9 gauche.\n\n_Pour des instructions plus d\u00E9taill\u00E9es, [visitez notre site d'aide](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")_."),
                            mappingTitle: 'Comment cette liste personnalisée doit-elle être affichée dans Expensify ?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: "Une liste personnalis\u00E9e avec cet ID de champ de transaction existe d\u00E9j\u00E0.",
                        },
                    },
                },
                importTypes: (_3 = {},
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT] = {
                        label: 'Employé par défaut de NetSuite',
                        description: "Non importé dans Expensify, appliqué à l'exportation",
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "Si vous utilisez ".concat(importField, " dans NetSuite, nous appliquerons la valeur par d\u00E9faut d\u00E9finie sur le dossier de l'employ\u00E9 lors de l'exportation vers le rapport de d\u00E9penses ou l'\u00E9criture de journal.");
                        },
                    },
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG] = {
                        label: 'Tags',
                        description: 'Niveau des postes de dépense',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "".concat((0, startCase_1.default)(importField), " sera s\u00E9lectionnable pour chaque d\u00E9pense individuelle sur le rapport d'un employ\u00E9.");
                        },
                    },
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD] = {
                        label: 'Champs de rapport',
                        description: 'Niveau de rapport',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "La s\u00E9lection ".concat((0, startCase_1.default)(importField), " s'appliquera \u00E0 toutes les d\u00E9penses sur le rapport d'un employ\u00E9.");
                        },
                    },
                    _3),
            },
        },
        intacct: {
            sageIntacctSetup: 'Configuration de Sage Intacct',
            prerequisitesTitle: 'Avant de vous connecter...',
            downloadExpensifyPackage: 'Téléchargez le package Expensify pour Sage Intacct',
            followSteps: 'Suivez les étapes de notre guide Comment faire : Connecter à Sage Intacct.',
            enterCredentials: 'Entrez vos identifiants Sage Intacct',
            entity: 'Entity',
            employeeDefault: 'Sage Intacct employé par défaut',
            employeeDefaultDescription: "Le département par défaut de l'employé sera appliqué à ses dépenses dans Sage Intacct si un existe.",
            displayedAsTagDescription: "Le département sera sélectionnable pour chaque dépense individuelle sur le rapport d'un employé.",
            displayedAsReportFieldDescription: "La sélection du département s'appliquera à toutes les dépenses sur le rapport d'un employé.",
            toggleImportTitleFirstPart: 'Choisissez comment gérer Sage Intacct',
            toggleImportTitleSecondPart: 'dans Expensify.',
            expenseTypes: 'Types de dépenses',
            expenseTypesDescription: 'Vos types de dépenses Sage Intacct seront importés dans Expensify en tant que catégories.',
            accountTypesDescription: 'Votre plan comptable Sage Intacct sera importé dans Expensify en tant que catégories.',
            importTaxDescription: "Importer le taux de taxe d'achat depuis Sage Intacct.",
            userDefinedDimensions: "Dimensions définies par l'utilisateur",
            addUserDefinedDimension: "Ajouter une dimension définie par l'utilisateur",
            integrationName: "Nom de l'intégration",
            dimensionExists: 'Une dimension portant ce nom existe déjà.',
            removeDimension: "Supprimer la dimension définie par l'utilisateur",
            removeDimensionPrompt: "Êtes-vous sûr de vouloir supprimer cette dimension définie par l'utilisateur ?",
            userDefinedDimension: "Dimension définie par l'utilisateur",
            addAUserDefinedDimension: "Ajouter une dimension définie par l'utilisateur",
            detailedInstructionsLink: 'Voir les instructions détaillées',
            detailedInstructionsRestOfSentence: "sur l'ajout de dimensions définies par l'utilisateur.",
            userDimensionsAdded: function () { return ({
                one: '1 UDD ajouté',
                other: function (count) { return "".concat(count, " UDD ajout\u00E9s"); },
            }); },
            mappingTitle: function (_a) {
                var mappingName = _a.mappingName;
                switch (mappingName) {
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'départements';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'classes';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'locations';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'clients';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'projets (emplois)';
                    default:
                        return 'mappages';
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
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard Cartes Commerciales',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Cartes Stripe',
                },
                yourCardProvider: "Qui est votre fournisseur de carte ?",
                whoIsYourBankAccount: 'Quelle est votre banque ?',
                whereIsYourBankLocated: 'Où se trouve votre banque ?',
                howDoYouWantToConnect: 'Comment souhaitez-vous vous connecter à votre banque ?',
                learnMoreAboutOptions: {
                    text: 'En savoir plus sur ces',
                    linkText: 'options.',
                },
                commercialFeedDetails: 'Nécessite une configuration avec votre banque. Cela est généralement utilisé par les grandes entreprises et est souvent la meilleure option si vous êtes éligible.',
                commercialFeedPlaidDetails: "N\u00E9cessite une configuration avec votre banque, mais nous vous guiderons. Cela est g\u00E9n\u00E9ralement limit\u00E9 aux grandes entreprises.",
                directFeedDetails: "L'approche la plus simple. Connectez-vous immédiatement en utilisant vos identifiants principaux. Cette méthode est la plus courante.",
                enableFeed: {
                    title: function (_a) {
                        var provider = _a.provider;
                        return "Activez votre flux ".concat(provider);
                    },
                    heading: "Nous avons une intégration directe avec l'émetteur de votre carte et pouvons importer vos données de transaction dans Expensify rapidement et avec précision.\n\nPour commencer, il vous suffit de :",
                    visa: "Nous avons des intégrations globales avec Visa, bien que l'éligibilité varie selon la banque et le programme de carte.\n\nPour commencer, il suffit de :",
                    mastercard: "Nous avons des intégrations globales avec Mastercard, bien que l'éligibilité varie selon la banque et le programme de carte.\n\nPour commencer, il vous suffit de :",
                    vcf: "1. Consultez [cet article d'aide](".concat(CONST_1.default.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP, ") pour des instructions d\u00E9taill\u00E9es sur la configuration de vos cartes commerciales Visa.\n\n2. [Contactez votre banque](").concat(CONST_1.default.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP, ") pour v\u00E9rifier qu'elle prend en charge un flux commercial pour votre programme, et demandez-lui de l'activer.\n\n3. *Une fois le flux activ\u00E9 et ses d\u00E9tails obtenus, passez \u00E0 l'\u00E9cran suivant.*"),
                    gl1025: "1. Visitez [cet article d'aide](".concat(CONST_1.default.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP, ") pour savoir si American Express peut activer un flux commercial pour votre programme.\n\n2. Une fois le flux activ\u00E9, Amex vous enverra une lettre de production.\n\n3. *Une fois que vous avez les informations du flux, continuez \u00E0 l'\u00E9cran suivant.*"),
                    cdf: "1. Consultez [cet article d'aide](".concat(CONST_1.default.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS, ") pour obtenir des instructions d\u00E9taill\u00E9es sur la configuration de vos cartes commerciales Mastercard.\n\n2. [Contactez votre banque](").concat(CONST_1.default.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS, ") pour v\u00E9rifier qu'elle prend en charge un flux commercial pour votre programme et demandez-lui de l'activer.\n\n3. *Une fois le flux activ\u00E9 et ses d\u00E9tails obtenus, passez \u00E0 l'\u00E9cran suivant.*"),
                    stripe: "1. Visitez le tableau de bord de Stripe, et allez dans [Param\u00E8tres](".concat(CONST_1.default.COMPANY_CARDS_STRIPE_HELP, ").\n\n2. Sous Int\u00E9grations de produits, cliquez sur Activer \u00E0 c\u00F4t\u00E9 de Expensify.\n\n3. Une fois le flux activ\u00E9, cliquez sur Soumettre ci-dessous et nous travaillerons \u00E0 l'ajouter."),
                },
                whatBankIssuesCard: 'Quelle banque émet ces cartes ?',
                enterNameOfBank: 'Entrez le nom de la banque',
                feedDetails: {
                    vcf: {
                        title: 'Quels sont les détails du flux Visa ?',
                        processorLabel: 'ID du processeur',
                        bankLabel: "ID de l'institution financière (banque)",
                        companyLabel: "ID de l'entreprise",
                        helpLabel: 'Où puis-je trouver ces identifiants ?',
                    },
                    gl1025: {
                        title: "Quel est le nom du fichier de livraison Amex ?",
                        fileNameLabel: 'Nom du fichier de livraison',
                        helpLabel: 'Où puis-je trouver le nom du fichier de livraison ?',
                    },
                    cdf: {
                        title: "Quel est l'identifiant de distribution Mastercard ?",
                        distributionLabel: 'ID de distribution',
                        helpLabel: "Où puis-je trouver l'ID de distribution ?",
                    },
                },
                amexCorporate: 'Sélectionnez ceci si le devant de vos cartes indique « Corporate »',
                amexBusiness: 'Sélectionnez ceci si le recto de vos cartes indique « Business »',
                amexPersonal: 'Sélectionnez ceci si vos cartes sont personnelles',
                error: {
                    pleaseSelectProvider: 'Veuillez sélectionner un fournisseur de carte avant de continuer',
                    pleaseSelectBankAccount: 'Veuillez sélectionner un compte bancaire avant de continuer',
                    pleaseSelectBank: 'Veuillez sélectionner une banque avant de continuer.',
                    pleaseSelectCountry: 'Veuillez sélectionner un pays avant de continuer',
                    pleaseSelectFeedType: 'Veuillez sélectionner un type de flux avant de continuer',
                },
            },
            statementCloseDate: (_4 = {},
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH] = 'Dernier jour du mois',
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH] = 'Dernier jour ouvrable du mois',
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH] = 'Jour personnalisé du mois',
                _4),
            assignCard: 'Attribuer la carte',
            findCard: 'Trouver la carte',
            cardNumber: 'Numéro de carte',
            commercialFeed: 'Flux commercial',
            feedName: function (_a) {
                var feedName = _a.feedName;
                return "Cartes ".concat(feedName);
            },
            directFeed: 'Flux direct',
            whoNeedsCardAssigned: "Qui a besoin d'une carte assignée ?",
            chooseCard: 'Choisissez une carte',
            chooseCardFor: function (_a) {
                var assignee = _a.assignee, feed = _a.feed;
                return "Choisissez une carte pour ".concat(assignee, " \u00E0 partir du flux de cartes ").concat(feed, ".");
            },
            noActiveCards: 'Aucune carte active dans ce flux',
            somethingMightBeBroken: "Ou quelque chose pourrait être cassé. Quoi qu'il en soit, si vous avez des questions, il vous suffit de",
            contactConcierge: 'contacter Concierge',
            chooseTransactionStartDate: 'Choisissez une date de début de transaction',
            startDateDescription: "Nous importerons toutes les transactions à partir de cette date. Si aucune date n'est spécifiée, nous remonterons aussi loin que votre banque le permet.",
            fromTheBeginning: 'Depuis le début',
            customStartDate: 'Date de début personnalisé',
            customCloseDate: 'Date de clôture personnalisée',
            letsDoubleCheck: 'Vérifions que tout est correct.',
            confirmationDescription: 'Nous commencerons à importer les transactions immédiatement.',
            cardholder: 'Titulaire de carte',
            card: 'Carte',
            cardName: 'Nom de la carte',
            brokenConnectionErrorFirstPart: "La connexion du flux de carte est interrompue. S'il vous pla\u00EEt",
            brokenConnectionErrorLink: 'connectez-vous à votre banque',
            brokenConnectionErrorSecondPart: 'afin que nous puissions rétablir la connexion.',
            assignedCard: function (_a) {
                var assignee = _a.assignee, link = _a.link;
                return "a attribu\u00E9 ".concat(link, " \u00E0 ").concat(assignee, " ! Les transactions import\u00E9es appara\u00EEtront dans cette discussion.");
            },
            companyCard: "carte d'entreprise",
            chooseCardFeed: 'Choisir le flux de cartes',
            ukRegulation: "Expensify, Inc. est un agent de Plaid Financial Ltd., une institution de paiement autorisée régulée par la Financial Conduct Authority sous les Payment Services Regulations 2017 (Numéro de Référence de l'Entreprise : 804718). Plaid vous fournit des services d'information de compte régulés via Expensify Limited en tant qu'agent.",
        },
        expensifyCard: {
            issueAndManageCards: 'Émettre et gérer vos cartes Expensify',
            getStartedIssuing: 'Commencez en émettant votre première carte virtuelle ou physique.',
            verificationInProgress: 'Vérification en cours...',
            verifyingTheDetails: 'Nous vérifions quelques détails. Concierge vous informera lorsque les cartes Expensify seront prêtes à être émises.',
            disclaimer: "La carte commerciale Expensify Visa® est émise par The Bancorp Bank, N.A., membre FDIC, conformément à une licence de Visa U.S.A. Inc. et ne peut pas être utilisée chez tous les commerçants qui acceptent les cartes Visa. Apple® et le logo Apple® sont des marques déposées d'Apple Inc., enregistrées aux États-Unis et dans d'autres pays. App Store est une marque de service d'Apple Inc. Google Play et le logo Google Play sont des marques de commerce de Google LLC.",
            issueCard: 'Émettre une carte',
            findCard: 'Trouver la carte',
            newCard: 'Nouvelle carte',
            name: 'Nom',
            lastFour: 'Derniers 4',
            limit: 'Limite',
            currentBalance: 'Solde actuel',
            currentBalanceDescription: 'Le solde actuel est la somme de toutes les transactions effectuées avec la carte Expensify depuis la dernière date de règlement.',
            balanceWillBeSettledOn: function (_a) {
                var settlementDate = _a.settlementDate;
                return "Le solde sera r\u00E9gl\u00E9 le ".concat(settlementDate);
            },
            settleBalance: 'Régler le solde',
            cardLimit: 'Limite de carte',
            remainingLimit: 'Limite restante',
            requestLimitIncrease: "Demande d'augmentation de la limite",
            remainingLimitDescription: "Nous prenons en compte plusieurs facteurs pour calculer votre limite restante : votre ancienneté en tant que client, les informations professionnelles que vous avez fournies lors de l'inscription, et la trésorerie disponible sur votre compte bancaire professionnel. Votre limite restante peut fluctuer quotidiennement.",
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Le solde de cashback est basé sur les dépenses mensuelles réglées avec la carte Expensify dans votre espace de travail.',
            issueNewCard: 'Émettre une nouvelle carte',
            finishSetup: 'Terminer la configuration',
            chooseBankAccount: 'Choisir un compte bancaire',
            chooseExistingBank: 'Choisissez un compte bancaire professionnel existant pour payer le solde de votre carte Expensify, ou ajoutez un nouveau compte bancaire.',
            accountEndingIn: 'Compte se terminant par',
            addNewBankAccount: 'Ajouter un nouveau compte bancaire',
            settlementAccount: 'Compte de règlement',
            settlementAccountDescription: 'Choisissez un compte pour payer le solde de votre carte Expensify.',
            settlementAccountInfoPt1: 'Assurez-vous que ce compte correspond au vôtre',
            settlementAccountInfoPt2: 'afin que la Réconciliation Continue fonctionne correctement.',
            reconciliationAccount: 'Compte de réconciliation',
            settlementFrequency: 'Fréquence de règlement',
            settlementFrequencyDescription: 'Choisissez la fréquence à laquelle vous paierez le solde de votre Expensify Card.',
            settlementFrequencyInfo: 'Si vous souhaitez passer à un règlement mensuel, vous devrez connecter votre compte bancaire via Plaid et avoir un historique de solde positif sur 90 jours.',
            frequency: {
                daily: 'Quotidiennement',
                monthly: 'Mensuel',
            },
            cardDetails: 'Détails de la carte',
            virtual: 'Virtuel',
            physical: 'Physique',
            deactivate: 'Désactiver la carte',
            changeCardLimit: 'Modifier la limite de la carte',
            changeLimit: 'Modifier la limite',
            smartLimitWarning: function (_a) {
                var limit = _a.limit;
                return "Si vous modifiez la limite de cette carte \u00E0 ".concat(limit, ", les nouvelles transactions seront refus\u00E9es jusqu'\u00E0 ce que vous approuviez plus de d\u00E9penses sur la carte.");
            },
            monthlyLimitWarning: function (_a) {
                var limit = _a.limit;
                return "Si vous changez la limite de cette carte \u00E0 ".concat(limit, ", les nouvelles transactions seront refus\u00E9es jusqu'au mois prochain.");
            },
            fixedLimitWarning: function (_a) {
                var limit = _a.limit;
                return "Si vous changez la limite de cette carte \u00E0 ".concat(limit, ", les nouvelles transactions seront refus\u00E9es.");
            },
            changeCardLimitType: 'Modifier le type de limite de carte',
            changeLimitType: 'Modifier le type de limite',
            changeCardSmartLimitTypeWarning: function (_a) {
                var limit = _a.limit;
                return "Si vous changez le type de limite de cette carte en Limite Intelligente, les nouvelles transactions seront refus\u00E9es car la limite non approuv\u00E9e de ".concat(limit, " a d\u00E9j\u00E0 \u00E9t\u00E9 atteinte.");
            },
            changeCardMonthlyLimitTypeWarning: function (_a) {
                var limit = _a.limit;
                return "Si vous changez le type de limite de cette carte en Mensuel, les nouvelles transactions seront refus\u00E9es car la limite mensuelle de ".concat(limit, " a d\u00E9j\u00E0 \u00E9t\u00E9 atteinte.");
            },
            addShippingDetails: "Ajouter les détails d'expédition",
            issuedCard: function (_a) {
                var assignee = _a.assignee;
                return "a \u00E9mis une carte Expensify \u00E0 ".concat(assignee, " ! La carte arrivera dans 2-3 jours ouvrables.");
            },
            issuedCardNoShippingDetails: function (_a) {
                var assignee = _a.assignee;
                return "a \u00E9mis une carte Expensify \u00E0 ".concat(assignee, " ! La carte sera exp\u00E9di\u00E9e une fois que les d\u00E9tails d'exp\u00E9dition seront ajout\u00E9s.");
            },
            issuedCardVirtual: function (_a) {
                var assignee = _a.assignee, link = _a.link;
                return "a \u00E9mis une ".concat(link, " virtuelle \u00E0 ").concat(assignee, " ! La carte peut \u00EAtre utilis\u00E9e imm\u00E9diatement.");
            },
            addedShippingDetails: function (_a) {
                var assignee = _a.assignee;
                return "".concat(assignee, " a ajout\u00E9 les d\u00E9tails d'exp\u00E9dition. La carte Expensify arrivera dans 2-3 jours ouvrables.");
            },
            verifyingHeader: 'Vérification en cours',
            bankAccountVerifiedHeader: 'Compte bancaire vérifié',
            verifyingBankAccount: 'Vérification du compte bancaire...',
            verifyingBankAccountDescription: 'Veuillez patienter pendant que nous confirmons que ce compte peut être utilisé pour émettre des cartes Expensify.',
            bankAccountVerified: 'Compte bancaire vérifié !',
            bankAccountVerifiedDescription: "Vous pouvez maintenant émettre des cartes Expensify à vos membres de l'espace de travail.",
            oneMoreStep: 'Encore une étape...',
            oneMoreStepDescription: 'Il semble que nous devions vérifier manuellement votre compte bancaire. Veuillez vous rendre sur Concierge où vos instructions vous attendent.',
            gotIt: 'Compris',
            goToConcierge: 'Aller à Concierge',
        },
        categories: {
            deleteCategories: 'Supprimer les catégories',
            deleteCategoriesPrompt: 'Êtes-vous sûr de vouloir supprimer ces catégories ?',
            deleteCategory: 'Supprimer la catégorie',
            deleteCategoryPrompt: 'Êtes-vous sûr de vouloir supprimer cette catégorie ?',
            disableCategories: 'Désactiver les catégories',
            disableCategory: 'Désactiver la catégorie',
            enableCategories: 'Activer les catégories',
            enableCategory: 'Activer la catégorie',
            defaultSpendCategories: 'Catégories de dépenses par défaut',
            spendCategoriesDescription: 'Personnalisez la façon dont les dépenses des commerçants sont catégorisées pour les transactions par carte de crédit et les reçus scannés.',
            deleteFailureMessage: "Une erreur s'est produite lors de la suppression de la catégorie, veuillez réessayer.",
            categoryName: 'Nom de catégorie',
            requiresCategory: 'Les membres doivent catégoriser toutes les dépenses',
            needCategoryForExportToIntegration: function (_a) {
                var connectionName = _a.connectionName;
                return "Toutes les d\u00E9penses doivent \u00EAtre cat\u00E9goris\u00E9es pour pouvoir \u00EAtre export\u00E9es vers ".concat(connectionName, ".");
            },
            subtitle: "Obtenez une meilleure vue d'ensemble de l'endroit où l'argent est dépensé. Utilisez nos catégories par défaut ou ajoutez les vôtres.",
            emptyCategories: {
                title: "Vous n'avez créé aucune catégorie",
                subtitle: 'Ajoutez une catégorie pour organiser vos dépenses.',
            },
            emptyCategoriesWithAccounting: {
                subtitle1: 'Vos catégories sont actuellement importées depuis une connexion comptable. Rendez-vous sur',
                subtitle2: 'comptabilité',
                subtitle3: 'pour apporter des modifications.',
            },
            updateFailureMessage: "Une erreur s'est produite lors de la mise à jour de la catégorie, veuillez réessayer.",
            createFailureMessage: "Une erreur s'est produite lors de la création de la catégorie, veuillez réessayer.",
            addCategory: 'Ajouter une catégorie',
            editCategory: 'Modifier la catégorie',
            editCategories: 'Modifier les catégories',
            findCategory: 'Trouver la catégorie',
            categoryRequiredError: 'Le nom de la catégorie est requis',
            existingCategoryError: 'Une catégorie avec ce nom existe déjà',
            invalidCategoryName: 'Nom de catégorie invalide',
            importedFromAccountingSoftware: 'Les catégories ci-dessous sont importées de votre',
            payrollCode: 'Code de paie',
            updatePayrollCodeFailureMessage: "Une erreur s'est produite lors de la mise à jour du code de paie, veuillez réessayer.",
            glCode: 'Code GL',
            updateGLCodeFailureMessage: "Une erreur s'est produite lors de la mise à jour du code GL, veuillez réessayer.",
            importCategories: 'Importer des catégories',
            cannotDeleteOrDisableAllCategories: {
                title: 'Impossible de supprimer ou désactiver toutes les catégories',
                description: "Au moins une cat\u00E9gorie doit rester activ\u00E9e car votre espace de travail n\u00E9cessite des cat\u00E9gories.",
            },
        },
        moreFeatures: {
            subtitle: 'Utilisez les commutateurs ci-dessous pour activer plus de fonctionnalités à mesure que vous vous développez. Chaque fonctionnalité apparaîtra dans le menu de navigation pour une personnalisation supplémentaire.',
            spendSection: {
                title: 'Dépenser',
                subtitle: 'Activez la fonctionnalité qui vous aide à faire évoluer votre équipe.',
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
                title: 'Tarifs de distance',
                subtitle: 'Ajouter, mettre à jour et appliquer les tarifs.',
            },
            perDiem: {
                title: 'Per diem',
                subtitle: 'Définissez des taux de per diem pour contrôler les dépenses quotidiennes des employés.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Obtenez des informations et contrôlez les dépenses.',
                disableCardTitle: 'Désactiver la carte Expensify',
                disableCardPrompt: 'Vous ne pouvez pas désactiver la carte Expensify car elle est déjà utilisée. Contactez Concierge pour connaître les prochaines étapes.',
                disableCardButton: 'Discuter avec Concierge',
                feed: {
                    title: 'Obtenez la carte Expensify',
                    subTitle: "Rationalisez vos dépenses professionnelles et économisez jusqu'à 50 % sur votre facture Expensify, plus :",
                    features: {
                        cashBack: 'Cashback sur chaque achat aux États-Unis',
                        unlimited: 'Cartes virtuelles illimitées',
                        spend: 'Contrôles de dépenses et limites personnalisées',
                    },
                    ctaTitle: 'Émettre une nouvelle carte',
                },
            },
            companyCards: {
                title: "Cartes d'entreprise",
                subtitle: "Importer les dépenses à partir des cartes d'entreprise existantes.",
                feed: {
                    title: "Importer des cartes d'entreprise",
                    features: {
                        support: 'Prise en charge de tous les principaux fournisseurs de cartes',
                        assignCards: "Attribuer des cartes à toute l'équipe",
                        automaticImport: 'Importation automatique des transactions',
                    },
                },
                disableCardTitle: "Désactiver les cartes d'entreprise",
                disableCardPrompt: "Vous ne pouvez pas désactiver les cartes d'entreprise car cette fonctionnalité est en cours d'utilisation. Contactez le Concierge pour connaître les prochaines étapes.",
                disableCardButton: 'Discuter avec Concierge',
                cardDetails: 'Détails de la carte',
                cardNumber: 'Numéro de carte',
                cardholder: 'Titulaire de carte',
                cardName: 'Nom de la carte',
                integrationExport: function (_a) {
                    var integration = _a.integration, type = _a.type;
                    return integration && type ? "".concat(integration, " ").concat(type.toLowerCase(), " exportation") : "exportation ".concat(integration);
                },
                integrationExportTitleFirstPart: function (_a) {
                    var integration = _a.integration;
                    return "Choisissez le compte ".concat(integration, " vers lequel les transactions doivent \u00EAtre export\u00E9es.");
                },
                integrationExportTitlePart: 'Sélectionner un autre',
                integrationExportTitleLinkPart: "option d'exportation",
                integrationExportTitleSecondPart: 'pour changer les comptes disponibles.',
                lastUpdated: 'Dernière mise à jour',
                transactionStartDate: 'Date de début de la transaction',
                updateCard: 'Mettre à jour la carte',
                unassignCard: 'Désattribuer la carte',
                unassign: 'Désassigner',
                unassignCardDescription: 'Désassigner cette carte supprimera toutes les transactions sur les rapports en brouillon du compte du titulaire de la carte.',
                assignCard: 'Attribuer la carte',
                cardFeedName: 'Nom du flux de carte',
                cardFeedNameDescription: 'Donnez un nom unique au flux de cartes afin de le distinguer des autres.',
                cardFeedTransaction: 'Supprimer les transactions',
                cardFeedTransactionDescription: 'Choisissez si les titulaires de carte peuvent supprimer les transactions par carte. Les nouvelles transactions suivront ces règles.',
                cardFeedRestrictDeletingTransaction: 'Restreindre la suppression des transactions',
                cardFeedAllowDeletingTransaction: 'Autoriser la suppression des transactions',
                removeCardFeed: 'Supprimer le flux de cartes',
                removeCardFeedTitle: function (_a) {
                    var feedName = _a.feedName;
                    return "Supprimer le flux ".concat(feedName);
                },
                removeCardFeedDescription: 'Êtes-vous sûr de vouloir supprimer ce flux de cartes ? Cela désassignera toutes les cartes.',
                error: {
                    feedNameRequired: 'Le nom du flux de carte est requis',
                    statementCloseDateRequired: 'Veuillez sélectionner une date de clôture du relevé.',
                },
                corporate: 'Restreindre la suppression des transactions',
                personal: 'Autoriser la suppression des transactions',
                setFeedNameDescription: 'Donnez un nom unique au flux de cartes afin de le distinguer des autres.',
                setTransactionLiabilityDescription: "Lorsqu'elle est activée, les titulaires de carte peuvent supprimer des transactions par carte. Les nouvelles transactions suivront cette règle.",
                emptyAddedFeedTitle: "Attribuer des cartes d'entreprise",
                emptyAddedFeedDescription: 'Commencez en attribuant votre première carte à un membre.',
                pendingFeedTitle: "Nous examinons votre demande...",
                pendingFeedDescription: "Nous examinons actuellement les d\u00E9tails de votre flux. Une fois cela termin\u00E9, nous vous contacterons via",
                pendingBankTitle: 'Vérifiez la fenêtre de votre navigateur',
                pendingBankDescription: function (_a) {
                    var bankName = _a.bankName;
                    return "Veuillez vous connecter \u00E0 ".concat(bankName, " via la fen\u00EAtre de votre navigateur qui vient de s'ouvrir. Si aucune ne s'est ouverte,");
                },
                pendingBankLink: 'veuillez cliquer ici',
                giveItNameInstruction: 'Donnez un nom à la carte qui la distingue des autres.',
                updating: 'Mise à jour...',
                noAccountsFound: 'Aucun compte trouvé',
                defaultCard: 'Carte par défaut',
                downgradeTitle: "Impossible de r\u00E9trograder l'espace de travail",
                downgradeSubTitleFirstPart: "Cet espace de travail ne peut pas \u00EAtre r\u00E9trograd\u00E9 car plusieurs flux de cartes sont connect\u00E9s (\u00E0 l'exclusion des cartes Expensify). Veuillez",
                downgradeSubTitleMiddlePart: "garder uniquement un flux de cartes",
                downgradeSubTitleLastPart: 'pour continuer.',
                noAccountsFoundDescription: function (_a) {
                    var connection = _a.connection;
                    return "Veuillez ajouter le compte dans ".concat(connection, " et synchroniser \u00E0 nouveau la connexion.");
                },
                expensifyCardBannerTitle: 'Obtenez la carte Expensify',
                expensifyCardBannerSubtitle: "Profitez de remises en argent sur chaque achat aux États-Unis, jusqu'à 50 % de réduction sur votre facture Expensify, des cartes virtuelles illimitées, et bien plus encore.",
                expensifyCardBannerLearnMoreButton: 'En savoir plus',
                statementCloseDateTitle: 'Date de clôture du relevé',
                statementCloseDateDescription: 'Indiquez-nous la date de clôture de votre relevé de carte et nous créerons un relevé correspondant dans Expensify.',
            },
            workflows: {
                title: 'Workflows',
                subtitle: 'Configurez comment les dépenses sont approuvées et payées.',
                disableApprovalPrompt: "Les cartes Expensify de cet espace de travail dépendent actuellement de l'approbation pour définir leurs limites intelligentes. Veuillez modifier les types de limites de toute carte Expensify avec des limites intelligentes avant de désactiver les approbations.",
            },
            invoices: {
                title: 'Factures',
                subtitle: 'Envoyez et recevez des factures.',
            },
            categories: {
                title: 'Catégories',
                subtitle: 'Suivre et organiser les dépenses.',
            },
            tags: {
                title: 'Tags',
                subtitle: 'Classifiez les coûts et suivez les dépenses facturables.',
            },
            taxes: {
                title: 'Taxes',
                subtitle: 'Documentez et récupérez les taxes éligibles.',
            },
            reportFields: {
                title: 'Champs de rapport',
                subtitle: 'Configurer des champs personnalisés pour les dépenses.',
            },
            connections: {
                title: 'Comptabilité',
                subtitle: 'Synchronisez votre plan comptable et plus encore.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Pas si vite...',
                featureEnabledText: "Pour activer ou désactiver cette fonctionnalité, vous devrez modifier vos paramètres d'importation comptable.",
                disconnectText: 'Pour désactiver la comptabilité, vous devrez déconnecter votre connexion comptable de votre espace de travail.',
                manageSettings: 'Gérer les paramètres',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Pas si vite...',
                featureEnabledText: "Les cartes Expensify dans cet espace de travail dépendent des flux de travail d'approbation pour définir leurs limites intelligentes.\n\nVeuillez modifier les types de limites de toutes les cartes avec des limites intelligentes avant de désactiver les flux de travail.",
                confirmText: 'Aller aux cartes Expensify',
            },
            rules: {
                title: 'Règles',
                subtitle: 'Exiger des reçus, signaler les dépenses élevées, et plus encore.',
            },
        },
        reportFields: {
            addField: 'Ajouter un champ',
            delete: 'Supprimer le champ',
            deleteFields: 'Supprimer les champs',
            findReportField: 'Trouver le champ du rapport',
            deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer ce champ de rapport ?',
            deleteFieldsConfirmation: 'Êtes-vous sûr de vouloir supprimer ces champs de rapport ?',
            emptyReportFields: {
                title: "Vous n'avez créé aucun champ de rapport",
                subtitle: 'Ajoutez un champ personnalisé (texte, date ou liste déroulante) qui apparaît sur les rapports.',
            },
            subtitle: "Les champs de rapport s'appliquent à toutes les dépenses et peuvent être utiles lorsque vous souhaitez demander des informations supplémentaires.",
            disableReportFields: 'Désactiver les champs de rapport',
            disableReportFieldsConfirmation: 'Êtes-vous sûr ? Les champs de texte et de date seront supprimés, et les listes seront désactivées.',
            importedFromAccountingSoftware: 'Les champs de rapport ci-dessous sont importés de votre',
            textType: 'Texte',
            dateType: 'Date',
            dropdownType: 'Liste',
            textAlternateText: 'Ajoutez un champ pour la saisie de texte libre.',
            dateAlternateText: 'Ajouter un calendrier pour la sélection de la date.',
            dropdownAlternateText: "Ajouter une liste d'options à choisir.",
            nameInputSubtitle: 'Choisissez un nom pour le champ du rapport.',
            typeInputSubtitle: 'Choisissez le type de champ de rapport à utiliser.',
            initialValueInputSubtitle: 'Entrez une valeur de départ à afficher dans le champ du rapport.',
            listValuesInputSubtitle: 'Ces valeurs apparaîtront dans le menu déroulant des champs de votre rapport. Les valeurs activées peuvent être sélectionnées par les membres.',
            listInputSubtitle: 'Ces valeurs apparaîtront dans la liste des champs de votre rapport. Les valeurs activées peuvent être sélectionnées par les membres.',
            deleteValue: 'Supprimer la valeur',
            deleteValues: 'Supprimer les valeurs',
            disableValue: 'Désactiver la valeur',
            disableValues: 'Désactiver les valeurs',
            enableValue: 'Activer la valeur',
            enableValues: 'Activer les valeurs',
            emptyReportFieldsValues: {
                title: "Vous n'avez créé aucune valeur de liste",
                subtitle: 'Ajoutez des valeurs personnalisées pour apparaître sur les rapports.',
            },
            deleteValuePrompt: 'Êtes-vous sûr de vouloir supprimer cette valeur de la liste ?',
            deleteValuesPrompt: 'Êtes-vous sûr de vouloir supprimer ces valeurs de la liste ?',
            listValueRequiredError: 'Veuillez entrer un nom de valeur de liste',
            existingListValueError: 'Une valeur de liste avec ce nom existe déjà',
            editValue: 'Modifier la valeur',
            listValues: 'Lister les valeurs',
            addValue: 'Ajouter de la valeur',
            existingReportFieldNameError: 'Un champ de rapport avec ce nom existe déjà',
            reportFieldNameRequiredError: 'Veuillez entrer un nom de champ de rapport',
            reportFieldTypeRequiredError: 'Veuillez choisir un type de champ de rapport',
            reportFieldInitialValueRequiredError: 'Veuillez choisir une valeur initiale pour le champ du rapport',
            genericFailureMessage: "Une erreur s'est produite lors de la mise à jour du champ du rapport. Veuillez réessayer.",
        },
        tags: {
            tagName: 'Nom de balise',
            requiresTag: 'Les membres doivent étiqueter toutes les dépenses',
            trackBillable: 'Suivre les dépenses facturables',
            customTagName: 'Nom de balise personnalisé',
            enableTag: 'Activer le tag',
            enableTags: 'Activer les étiquettes',
            requireTag: 'Étiquette requise',
            requireTags: 'Exiger des balises',
            notRequireTags: 'Ne pas exiger',
            disableTag: 'Désactiver le tag',
            disableTags: 'Désactiver les tags',
            addTag: 'Ajouter une étiquette',
            editTag: 'Modifier le tag',
            editTags: 'Modifier les balises',
            findTag: 'Trouver une balise',
            subtitle: 'Les étiquettes ajoutent des moyens plus détaillés pour classer les coûts.',
            dependentMultiLevelTagsSubtitle: {
                phrase1: 'Vous utilisez',
                phrase2: 'balises dépendantes',
                phrase3: '. Vous pouvez',
                phrase4: 'réimporter une feuille de calcul',
                phrase5: 'mettre à jour vos tags.',
            },
            emptyTags: {
                title: "Vous n'avez créé aucun tag",
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Ajoutez une étiquette pour suivre les projets, les emplacements, les départements, et plus encore.',
                subtitle1: 'Importez une feuille de calcul pour ajouter des étiquettes afin de suivre les projets, les emplacements, les départements, et plus encore.',
                subtitle2: 'En savoir plus',
                subtitle3: 'à propos des fichiers de balises de formatage.',
            },
            emptyTagsWithAccounting: {
                subtitle1: "Vos balises sont actuellement importées à partir d'une connexion comptable. Rendez-vous sur",
                subtitle2: 'comptabilité',
                subtitle3: 'pour apporter des modifications.',
            },
            deleteTag: 'Supprimer le tag',
            deleteTags: 'Supprimer les balises',
            deleteTagConfirmation: 'Êtes-vous sûr de vouloir supprimer ce tag ?',
            deleteTagsConfirmation: 'Êtes-vous sûr de vouloir supprimer ces étiquettes ?',
            deleteFailureMessage: "Une erreur s'est produite lors de la suppression du tag, veuillez réessayer.",
            tagRequiredError: 'Le nom de la balise est requis',
            existingTagError: 'Un tag avec ce nom existe déjà',
            invalidTagNameError: 'Le nom de la balise ne peut pas être 0. Veuillez choisir une autre valeur.',
            genericFailureMessage: "Une erreur s'est produite lors de la mise à jour du tag, veuillez réessayer.",
            importedFromAccountingSoftware: 'Les balises ci-dessous sont importées de votre',
            glCode: 'Code GL',
            updateGLCodeFailureMessage: "Une erreur s'est produite lors de la mise à jour du code GL, veuillez réessayer.",
            tagRules: 'Règles de balise',
            approverDescription: 'Approbateur',
            importTags: 'Importer des tags',
            importTagsSupportingText: 'Codez vos dépenses avec un type de balise ou plusieurs.',
            configureMultiLevelTags: 'Configurez votre liste de tags pour un étiquetage multi-niveaux.',
            importMultiLevelTagsSupportingText: "Voici un aper\u00E7u de vos \u00E9tiquettes. Si tout semble correct, cliquez ci-dessous pour les importer.",
            importMultiLevelTags: {
                firstRowTitle: 'La première ligne est le titre de chaque liste de tags',
                independentTags: 'Ce sont des balises indépendantes',
                glAdjacentColumn: 'Il y a un code GL dans la colonne adjacente',
            },
            tagLevel: {
                singleLevel: 'Niveau unique de balises',
                multiLevel: 'Tags multi-niveaux',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Changer les niveaux de balise',
                prompt1: 'Changer les niveaux de balises effacera toutes les balises actuelles.',
                prompt2: "Nous vous suggérons d'abord",
                prompt3: 'télécharger une sauvegarde',
                prompt4: 'en exportant vos étiquettes.',
                prompt5: 'En savoir plus',
                prompt6: 'à propos des niveaux de balises.',
            },
            importedTagsMessage: function (_a) {
                var columnCounts = _a.columnCounts;
                return "Nous avons trouv\u00E9 *".concat(columnCounts, " colonnes* dans votre feuille de calcul. S\u00E9lectionnez *Nom* \u00E0 c\u00F4t\u00E9 de la colonne contenant les noms des balises. Vous pouvez \u00E9galement s\u00E9lectionner *Activ\u00E9* \u00E0 c\u00F4t\u00E9 de la colonne qui d\u00E9finit le statut des balises.");
            },
            cannotDeleteOrDisableAllTags: {
                title: 'Impossible de supprimer ou de désactiver tous les tags',
                description: "Au moins une \u00E9tiquette doit rester activ\u00E9e car votre espace de travail n\u00E9cessite des \u00E9tiquettes.",
            },
            cannotMakeAllTagsOptional: {
                title: 'Impossible de rendre toutes les balises facultatives',
                description: "Au moins une \u00E9tiquette doit rester obligatoire car les param\u00E8tres de votre espace de travail exigent des \u00E9tiquettes.",
            },
            tagCount: function () { return ({
                one: '1 jour',
                other: function (count) { return "".concat(count, " Tags"); },
            }); },
        },
        taxes: {
            subtitle: 'Ajoutez les noms de taxes, les taux et définissez les valeurs par défaut.',
            addRate: 'Ajouter un tarif',
            workspaceDefault: "Devise par défaut de l'espace de travail",
            foreignDefault: 'Devise étrangère par défaut',
            customTaxName: 'Nom de taxe personnalisé',
            value: 'Valeur',
            taxReclaimableOn: 'Taxe récupérable sur',
            taxRate: "Taux d'imposition",
            findTaxRate: "Trouver le taux d'imposition",
            error: {
                taxRateAlreadyExists: 'Ce nom de taxe est déjà utilisé',
                taxCodeAlreadyExists: 'Ce code fiscal est déjà utilisé.',
                valuePercentageRange: 'Veuillez entrer un pourcentage valide entre 0 et 100',
                customNameRequired: 'Le nom de la taxe personnalisée est requis',
                deleteFailureMessage: "Une erreur s'est produite lors de la suppression du taux de taxe. Veuillez réessayer ou demander de l'aide à Concierge.",
                updateFailureMessage: "Une erreur s'est produite lors de la mise à jour du taux de taxe. Veuillez réessayer ou demander de l'aide à Concierge.",
                createFailureMessage: "Une erreur s'est produite lors de la création du taux de taxe. Veuillez réessayer ou demander de l'aide à Concierge.",
                updateTaxClaimableFailureMessage: 'La portion récupérable doit être inférieure au montant du taux de distance.',
            },
            deleteTaxConfirmation: 'Êtes-vous sûr de vouloir supprimer cette taxe ?',
            deleteMultipleTaxConfirmation: function (_a) {
                var taxAmount = _a.taxAmount;
                return "\u00CAtes-vous s\u00FBr de vouloir supprimer les taxes de ".concat(taxAmount, " ?");
            },
            actions: {
                delete: 'Supprimer le taux',
                deleteMultiple: 'Supprimer les tarifs',
                enable: 'Activer le tarif',
                disable: 'Désactiver le taux',
                enableTaxRates: function () { return ({
                    one: 'Activer le tarif',
                    other: 'Activer les tarifs',
                }); },
                disableTaxRates: function () { return ({
                    one: 'Désactiver le taux',
                    other: 'Désactiver les taux',
                }); },
            },
            importedFromAccountingSoftware: 'Les taxes ci-dessous sont importées de votre',
            taxCode: 'Code fiscal',
            updateTaxCodeFailureMessage: "Une erreur s'est produite lors de la mise à jour du code fiscal, veuillez réessayer.",
        },
        emptyWorkspace: {
            title: 'Créer un espace de travail',
            subtitle: 'Créez un espace de travail pour suivre les reçus, rembourser les dépenses, gérer les voyages, envoyer des factures, et plus encore — le tout à la vitesse du chat.',
            createAWorkspaceCTA: 'Commencer',
            features: {
                trackAndCollect: 'Suivre et collecter les reçus',
                reimbursements: 'Rembourser les employés',
                companyCards: "Gérer les cartes de l'entreprise",
            },
            notFound: 'Aucun espace de travail trouvé',
            description: 'Les salles sont un excellent endroit pour discuter et travailler avec plusieurs personnes. Pour commencer à collaborer, créez ou rejoignez un espace de travail.',
        },
        new: {
            newWorkspace: 'Nouvel espace de travail',
            getTheExpensifyCardAndMore: 'Obtenez la carte Expensify et plus encore',
            confirmWorkspace: "Confirmer l'espace de travail",
            myGroupWorkspace: function (_a) {
                var workspaceNumber = _a.workspaceNumber;
                return "Mon espace de travail de groupe".concat(workspaceNumber ? " ".concat(workspaceNumber) : '');
            },
            workspaceName: function (_a) {
                var userName = _a.userName, workspaceNumber = _a.workspaceNumber;
                return "Espace de travail de ".concat(userName).concat(workspaceNumber ? " ".concat(workspaceNumber) : '');
            },
        },
        people: {
            genericFailureMessage: "Une erreur s'est produite lors de la suppression d'un membre de l'espace de travail, veuillez réessayer.",
            removeMembersPrompt: function (_a) {
                var memberName = _a.memberName;
                return ({
                    one: "\u00CAtes-vous s\u00FBr de vouloir supprimer ".concat(memberName, " ?"),
                    other: 'Êtes-vous sûr de vouloir supprimer ces membres ?',
                });
            },
            removeMembersWarningPrompt: function (_a) {
                var memberName = _a.memberName, ownerName = _a.ownerName;
                return "".concat(memberName, " est un approbateur dans cet espace de travail. Lorsque vous ne partagez plus cet espace de travail avec eux, nous les remplacerons dans le flux d'approbation par le propri\u00E9taire de l'espace de travail, ").concat(ownerName, ".");
            },
            removeMembersTitle: function () { return ({
                one: 'Supprimer le membre',
                other: 'Supprimer des membres',
            }); },
            findMember: 'Trouver un membre',
            removeWorkspaceMemberButtonTitle: "Supprimer de l'espace de travail",
            removeGroupMemberButtonTitle: 'Retirer du groupe',
            removeRoomMemberButtonTitle: 'Supprimer du chat',
            removeMemberPrompt: function (_a) {
                var memberName = _a.memberName;
                return "\u00CAtes-vous s\u00FBr de vouloir supprimer ".concat(memberName, " ?");
            },
            removeMemberTitle: 'Supprimer le membre',
            transferOwner: 'Transférer le propriétaire',
            makeMember: 'Rendre membre',
            makeAdmin: 'Nommer administrateur',
            makeAuditor: 'Créer un auditeur',
            selectAll: 'Tout sélectionner',
            error: {
                genericAdd: "Un problème est survenu lors de l'ajout de ce membre de l'espace de travail.",
                cannotRemove: "Vous ne pouvez pas vous supprimer ou supprimer le propriétaire de l'espace de travail.",
                genericRemove: "Un problème est survenu lors de la suppression de ce membre de l'espace de travail.",
            },
            addedWithPrimary: 'Certains membres ont été ajoutés avec leurs identifiants principaux.',
            invitedBySecondaryLogin: function (_a) {
                var secondaryLogin = _a.secondaryLogin;
                return "Ajout\u00E9 par la connexion secondaire ".concat(secondaryLogin, ".");
            },
            membersListTitle: "Annuaire de tous les membres de l'espace de travail.",
            importMembers: 'Importer des membres',
        },
        card: {
            getStartedIssuing: 'Commencez en émettant votre première carte virtuelle ou physique.',
            issueCard: 'Émettre une carte',
            issueNewCard: {
                whoNeedsCard: "Qui a besoin d'une carte ?",
                findMember: 'Trouver un membre',
                chooseCardType: 'Choisissez un type de carte',
                physicalCard: 'Carte physique',
                physicalCardDescription: 'Idéal pour le dépensier fréquent',
                virtualCard: 'Carte virtuelle',
                virtualCardDescription: 'Instantané et flexible',
                chooseLimitType: 'Choisissez un type de limite',
                smartLimit: 'Limite Intelligent',
                smartLimitDescription: "Dépenser jusqu'à un certain montant avant de nécessiter une approbation",
                monthly: 'Mensuel',
                monthlyDescription: "Dépenser jusqu'à un certain montant par mois",
                fixedAmount: 'Montant fixe',
                fixedAmountDescription: "Dépenser jusqu'à un certain montant une fois",
                setLimit: 'Définir une limite',
                cardLimitError: 'Veuillez entrer un montant inférieur à 21 474 836 $',
                giveItName: 'Donnez-lui un nom',
                giveItNameInstruction: "Rendez-le suffisamment unique pour le distinguer des autres cartes. Des cas d'utilisation spécifiques sont encore mieux !",
                cardName: 'Nom de la carte',
                letsDoubleCheck: 'Vérifions que tout est correct.',
                willBeReady: 'Cette carte sera prête à être utilisée immédiatement.',
                cardholder: 'Titulaire de carte',
                cardType: 'Type de carte',
                limit: 'Limite',
                limitType: 'Limiter le type',
                name: 'Nom',
            },
            deactivateCardModal: {
                deactivate: 'Désactiver',
                deactivateCard: 'Désactiver la carte',
                deactivateConfirmation: 'La désactivation de cette carte entraînera le refus de toutes les transactions futures et ne pourra pas être annulée.',
            },
        },
        accounting: {
            settings: 'paramètres',
            title: 'Connexions',
            subtitle: 'Connectez-vous à votre système comptable pour coder les transactions avec votre plan comptable, faire correspondre automatiquement les paiements et garder vos finances synchronisées.',
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
            needAnotherAccounting: "Besoin d'un autre logiciel de comptabilité ?",
            connectionName: function (_a) {
                var connectionName = _a.connectionName;
                switch (connectionName) {
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.QBO:
                        return 'QuickBooks Online';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Xero';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'NetSuite';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return 'Sage Intacct';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: 'Il y a une erreur avec une connexion qui a été configurée dans Expensify Classic.',
            goToODToFix: 'Allez sur Expensify Classic pour résoudre ce problème.',
            goToODToSettings: 'Accédez à Expensify Classic pour gérer vos paramètres.',
            setup: 'Connecter',
            lastSync: function (_a) {
                var relativeDate = _a.relativeDate;
                return "Derni\u00E8re synchronisation ".concat(relativeDate);
            },
            notSync: 'Non synchronisé',
            import: 'Importation',
            export: 'Exportation',
            advanced: 'Avancé',
            other: 'Autre',
            syncNow: 'Synchroniser maintenant',
            disconnect: 'Déconnecter',
            reinstall: 'Réinstaller le connecteur',
            disconnectTitle: function (_a) {
                var _b = _a === void 0 ? {} : _a, connectionName = _b.connectionName;
                var integrationName = connectionName && CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'intégration';
                return "D\u00E9connecter ".concat(integrationName);
            },
            connectTitle: function (_a) {
                var _b;
                var connectionName = _a.connectionName;
                return "Connecter ".concat((_b = CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]) !== null && _b !== void 0 ? _b : 'intégration comptable');
            },
            syncError: function (_a) {
                var connectionName = _a.connectionName;
                switch (connectionName) {
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Impossible de se connecter à QuickBooks Online';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Impossible de se connecter à Xero';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Impossible de se connecter à NetSuite';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Impossible de se connecter à QuickBooks Desktop';
                    default: {
                        return "Impossible de se connecter à l'intégration";
                    }
                }
            },
            accounts: 'Plan comptable',
            taxes: 'Taxes',
            imported: 'Importé',
            notImported: 'Non importé',
            importAsCategory: 'Importé en tant que catégories',
            importTypes: (_5 = {},
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED] = 'Importé',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG] = 'Importé en tant que tags',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT] = 'Importé',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED] = 'Non importé',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE] = 'Non importé',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD] = 'Importé en tant que champs de rapport',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT] = 'Employé par défaut de NetSuite',
                _5),
            disconnectPrompt: function (_a) {
                var _b = _a === void 0 ? {} : _a, connectionName = _b.connectionName;
                var integrationName = connectionName && CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'cette intégration';
                return "\u00CAtes-vous s\u00FBr de vouloir d\u00E9connecter ".concat(integrationName, " ?");
            },
            connectPrompt: function (_a) {
                var _b;
                var connectionName = _a.connectionName;
                return "\u00CAtes-vous s\u00FBr de vouloir connecter ".concat((_b = CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]) !== null && _b !== void 0 ? _b : 'cette intégration comptable', " ? Cela supprimera toutes les connexions comptables existantes.");
            },
            enterCredentials: 'Entrez vos identifiants',
            connections: {
                syncStageName: function (_a) {
                    var stage = _a.stage;
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Importation des clients';
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
                            return 'Synchronisation des rapports remboursés et des paiements de factures';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importation des codes fiscaux';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Vérification de la connexion QuickBooks Online';
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
                            return "Titre d'importation";
                        case 'quickbooksDesktopImportApproveCertificate':
                            return "Importer le certificat d'approbation";
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importation des dimensions';
                        case 'quickbooksDesktopImportSavePolicy':
                            return "Importer la politique d'enregistrement";
                        case 'quickbooksDesktopWebConnectorReminder':
                            return "Synchronisation des données avec QuickBooks en cours... Veuillez vous assurer que le Web Connector est en cours d'exécution.";
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
                            return 'Mise à jour des champs du rapport';
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
                            return 'Marquer les factures et les factures Xero comme payées';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Synchronisation des catégories de suivi';
                        case 'xeroSyncImportBankAccounts':
                            return 'Synchronisation des comptes bancaires';
                        case 'xeroSyncImportTaxRates':
                            return 'Synchronisation des taux de taxe';
                        case 'xeroCheckConnection':
                            return 'Vérification de la connexion Xero';
                        case 'xeroSyncTitle':
                            return 'Synchronisation des données Xero';
                        case 'netSuiteSyncConnection':
                            return 'Initialisation de la connexion à NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importation des clients';
                        case 'netSuiteSyncInitData':
                            return 'Récupération des données depuis NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importation des taxes';
                        case 'netSuiteSyncImportItems':
                            return "Importation d'articles";
                        case 'netSuiteSyncData':
                            return 'Importation de données dans Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Synchronisation des comptes';
                        case 'netSuiteSyncCurrencies':
                            return 'Synchronisation des devises';
                        case 'netSuiteSyncCategories':
                            return 'Synchronisation des catégories';
                        case 'netSuiteSyncReportFields':
                            return 'Importer des données en tant que champs de rapport Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importer des données en tant que tags Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Mise à jour des informations de connexion';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Marquer les rapports Expensify comme remboursés';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Marquer les factures et les factures NetSuite comme payées';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importation des fournisseurs';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importation de listes personnalisées';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importation de listes personnalisées';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importation de filiales';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importation des fournisseurs';
                        case 'intacctCheckConnection':
                            return 'Vérification de la connexion Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Importation des dimensions Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Importation des données Sage Intacct';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return "Traduction manquante pour l'\u00E9tape : ".concat(stage);
                        }
                    }
                },
            },
            preferredExporter: 'Exportateur préféré',
            exportPreferredExporterNote: "L'exportateur préféré peut être n'importe quel administrateur de l'espace de travail, mais doit également être un administrateur de domaine si vous définissez différents comptes d'exportation pour des cartes d'entreprise individuelles dans les paramètres de domaine.",
            exportPreferredExporterSubNote: "Une fois défini, l'exportateur préféré verra les rapports à exporter dans son compte.",
            exportAs: 'Exporter en tant que',
            exportOutOfPocket: 'Exporter les dépenses personnelles en tant que',
            exportCompanyCard: "Exporter les dépenses de la carte de l'entreprise en tant que",
            exportDate: "Date d'exportation",
            defaultVendor: 'Fournisseur par défaut',
            autoSync: 'Synchronisation automatique',
            autoSyncDescription: 'Synchronisez NetSuite et Expensify automatiquement, chaque jour. Exportez le rapport finalisé en temps réel.',
            reimbursedReports: 'Synchroniser les rapports remboursés',
            cardReconciliation: 'Rapprochement de carte',
            reconciliationAccount: 'Compte de réconciliation',
            continuousReconciliation: 'Réconciliation Continue',
            saveHoursOnReconciliation: 'Gagnez des heures sur la réconciliation à chaque période comptable en laissant Expensify réconcilier en continu les relevés et les règlements de la carte Expensify pour vous.',
            enableContinuousReconciliation: 'Pour activer la Réconciliation Continue, veuillez activer',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Choisissez le compte bancaire sur lequel les paiements de votre carte Expensify seront rapprochés.',
                accountMatches: 'Assurez-vous que ce compte correspond à votre',
                settlementAccount: 'Compte de règlement de la carte Expensify',
                reconciliationWorks: function (_a) {
                    var lastFourPAN = _a.lastFourPAN;
                    return "(terminant par ".concat(lastFourPAN, ") afin que la R\u00E9conciliation Continue fonctionne correctement.");
                },
            },
        },
        export: {
            notReadyHeading: 'Pas prêt à exporter',
            notReadyDescription: 'Les rapports de dépenses brouillons ou en attente ne peuvent pas être exportés vers le système comptable. Veuillez approuver ou payer ces dépenses avant de les exporter.',
        },
        invoices: {
            sendInvoice: 'Envoyer la facture',
            sendFrom: 'Envoyer depuis',
            invoicingDetails: 'Détails de facturation',
            invoicingDetailsDescription: 'Ces informations apparaîtront sur vos factures.',
            companyName: "Nom de l'entreprise",
            companyWebsite: "Site web de l'entreprise",
            paymentMethods: {
                personal: 'Personnel',
                business: 'Entreprise',
                chooseInvoiceMethod: 'Choisissez un mode de paiement ci-dessous :',
                addBankAccount: 'Ajouter un compte bancaire',
                payingAsIndividual: "Payer en tant qu'individu",
                payingAsBusiness: "Payer en tant qu'entreprise",
            },
            invoiceBalance: 'Solde de la facture',
            invoiceBalanceSubtitle: "Ceci est votre solde actuel provenant de l'encaissement des paiements de factures. Il sera transféré automatiquement sur votre compte bancaire si vous en avez ajouté un.",
            bankAccountsSubtitle: 'Ajoutez un compte bancaire pour effectuer et recevoir des paiements de factures.',
        },
        invite: {
            member: 'Inviter un membre',
            members: 'Inviter des membres',
            invitePeople: 'Inviter de nouveaux membres',
            genericFailureMessage: "Une erreur s'est produite lors de l'invitation du membre à l'espace de travail. Veuillez réessayer.",
            pleaseEnterValidLogin: "Veuillez vous assurer que l'email ou le num\u00E9ro de t\u00E9l\u00E9phone est valide (par exemple, ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")."),
            user: 'utilisateur',
            users: 'utilisateurs',
            invited: 'invité',
            removed: 'removed',
            to: 'à',
            from: 'de',
        },
        inviteMessage: {
            confirmDetails: 'Confirmer les détails',
            inviteMessagePrompt: 'Rendez votre invitation encore plus spéciale en ajoutant un message ci-dessous !',
            personalMessagePrompt: 'Message',
            genericFailureMessage: "Une erreur s'est produite lors de l'invitation du membre à l'espace de travail. Veuillez réessayer.",
            inviteNoMembersError: 'Veuillez sélectionner au moins un membre à inviter',
            joinRequest: function (_a) {
                var user = _a.user, workspaceName = _a.workspaceName;
                return "".concat(user, " a demand\u00E9 \u00E0 rejoindre ").concat(workspaceName);
            },
        },
        distanceRates: {
            oopsNotSoFast: 'Oups ! Pas si vite...',
            workspaceNeeds: 'Un espace de travail nécessite au moins un tarif de distance activé.',
            distance: 'Distance',
            centrallyManage: 'Gérez les tarifs de manière centralisée, suivez en miles ou en kilomètres, et définissez une catégorie par défaut.',
            rate: 'Taux',
            addRate: 'Ajouter un tarif',
            findRate: 'Trouver le tarif',
            trackTax: 'Suivre la taxe',
            deleteRates: function () { return ({
                one: 'Supprimer le taux',
                other: 'Supprimer les tarifs',
            }); },
            enableRates: function () { return ({
                one: 'Activer le tarif',
                other: 'Activer les tarifs',
            }); },
            disableRates: function () { return ({
                one: 'Désactiver le taux',
                other: 'Désactiver les taux',
            }); },
            enableRate: 'Activer le tarif',
            status: 'Statut',
            unit: 'Unité',
            taxFeatureNotEnabledMessage: "Les taxes doivent être activées sur l'espace de travail pour utiliser cette fonctionnalité. Rendez-vous sur",
            changePromptMessage: 'pour effectuer ce changement.',
            deleteDistanceRate: 'Supprimer le tarif de distance',
            areYouSureDelete: function () { return ({
                one: 'Êtes-vous sûr de vouloir supprimer ce tarif ?',
                other: 'Êtes-vous sûr de vouloir supprimer ces tarifs ?',
            }); },
        },
        editor: {
            descriptionInputLabel: 'Description',
            nameInputLabel: 'Nom',
            typeInputLabel: 'Type',
            initialValueInputLabel: 'Valeur initiale',
            nameInputHelpText: "C'est le nom que vous verrez sur votre espace de travail.",
            nameIsRequiredError: 'Vous devrez donner un nom à votre espace de travail',
            currencyInputLabel: 'Devise par défaut',
            currencyInputHelpText: 'Toutes les dépenses de cet espace de travail seront converties dans cette devise.',
            currencyInputDisabledText: function (_a) {
                var currency = _a.currency;
                return "La devise par d\u00E9faut ne peut pas \u00EAtre modifi\u00E9e car cet espace de travail est li\u00E9 \u00E0 un compte bancaire en ".concat(currency, ".");
            },
            save: 'Enregistrer',
            genericFailureMessage: "Une erreur s'est produite lors de la mise à jour de l'espace de travail. Veuillez réessayer.",
            avatarUploadFailureMessage: "Une erreur s'est produite lors du téléchargement de l'avatar. Veuillez réessayer.",
            addressContext: "Une adresse de l'espace de travail est requise pour activer Expensify Travel. Veuillez entrer une adresse associée à votre entreprise.",
        },
        bankAccount: {
            continueWithSetup: 'Continuer la configuration',
            youAreAlmostDone: "Vous avez presque terminé de configurer votre compte bancaire, ce qui vous permettra d'émettre des cartes d'entreprise, de rembourser des dépenses, de collecter des factures et de payer des factures.",
            streamlinePayments: 'Rationaliser les paiements',
            connectBankAccountNote: 'Remarque : Les comptes bancaires personnels ne peuvent pas être utilisés pour les paiements sur les espaces de travail.',
            oneMoreThing: 'Encore une chose !',
            allSet: 'Vous êtes prêt !',
            accountDescriptionWithCards: "Ce compte bancaire sera utilisé pour émettre des cartes d'entreprise, rembourser des dépenses, encaisser des factures et payer des factures.",
            letsFinishInChat: 'Terminons dans le chat !',
            finishInChat: 'Terminer dans le chat',
            almostDone: 'Presque terminé !',
            disconnectBankAccount: 'Déconnecter le compte bancaire',
            startOver: 'Recommencer',
            updateDetails: 'Mettre à jour les détails',
            yesDisconnectMyBankAccount: 'Oui, déconnectez mon compte bancaire.',
            yesStartOver: 'Oui, recommencez',
            disconnectYour: 'Déconnectez votre',
            bankAccountAnyTransactions: 'compte bancaire. Toutes les transactions en cours pour ce compte seront toujours effectuées.',
            clearProgress: "Recommencer effacera les progrès que vous avez réalisés jusqu'à présent.",
            areYouSure: 'Êtes-vous sûr ?',
            workspaceCurrency: "Devise de l'espace de travail",
            updateCurrencyPrompt: "Il semble que votre espace de travail soit actuellement configuré pour une devise différente de l'USD. Veuillez cliquer sur le bouton ci-dessous pour mettre à jour votre devise en USD maintenant.",
            updateToUSD: 'Mettre à jour en USD',
            updateWorkspaceCurrency: "Mettre à jour la devise de l'espace de travail",
            workspaceCurrencyNotSupported: "Devise de l'espace de travail non prise en charge",
            yourWorkspace: 'Votre espace de travail est configuré avec une devise non prise en charge. Consultez le',
            listOfSupportedCurrencies: 'liste des devises prises en charge',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Transférer le propriétaire',
            addPaymentCardTitle: 'Entrez votre carte de paiement pour transférer la propriété',
            addPaymentCardButtonText: 'Accepter les conditions et ajouter une carte de paiement',
            addPaymentCardReadAndAcceptTextPart1: 'Lire et accepter',
            addPaymentCardReadAndAcceptTextPart2: 'politique pour ajouter votre carte',
            addPaymentCardTerms: 'termes',
            addPaymentCardPrivacy: 'confidentialité',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'Conforme à la norme PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Chiffrement de niveau bancaire',
            addPaymentCardRedundant: 'Infrastructure redondante',
            addPaymentCardLearnMore: 'En savoir plus sur notre',
            addPaymentCardSecurity: 'sécurité',
            amountOwedTitle: 'Solde impayé',
            amountOwedButtonText: "D'accord",
            amountOwedText: "Ce compte a un solde impayé d'un mois précédent.\n\nVoulez-vous régler le solde et prendre en charge la facturation de cet espace de travail ?",
            ownerOwesAmountTitle: 'Solde impayé',
            ownerOwesAmountButtonText: 'Transférer le solde',
            ownerOwesAmountText: function (_a) {
                var email = _a.email, amount = _a.amount;
                return "Le compte propri\u00E9taire de cet espace de travail (".concat(email, ") a un solde impay\u00E9 d'un mois pr\u00E9c\u00E9dent.\n\nSouhaitez-vous transf\u00E9rer ce montant (").concat(amount, ") afin de prendre en charge la facturation de cet espace de travail ? Votre carte de paiement sera d\u00E9bit\u00E9e imm\u00E9diatement.");
            },
            subscriptionTitle: "Prendre en charge l'abonnement annuel",
            subscriptionButtonText: "Transférer l'abonnement",
            subscriptionText: function (_a) {
                var usersCount = _a.usersCount, finalCount = _a.finalCount;
                return "Prendre en charge cet espace de travail fusionnera son abonnement annuel avec votre abonnement actuel. Cela augmentera la taille de votre abonnement de ".concat(usersCount, " membres, portant la nouvelle taille de votre abonnement \u00E0 ").concat(finalCount, ". Souhaitez-vous continuer ?");
            },
            duplicateSubscriptionTitle: "Alerte d'abonnement en double",
            duplicateSubscriptionButtonText: 'Continuer',
            duplicateSubscriptionText: function (_a) {
                var email = _a.email, workspaceName = _a.workspaceName;
                return "Il semble que vous essayiez de prendre en charge la facturation des espaces de travail de ".concat(email, ", mais pour cela, vous devez d'abord \u00EAtre administrateur sur tous leurs espaces de travail.\n\nCliquez sur \"Continuer\" si vous souhaitez uniquement prendre en charge la facturation pour l'espace de travail ").concat(workspaceName, ".\n\nSi vous souhaitez prendre en charge la facturation de l'ensemble de leur abonnement, veuillez leur demander de vous ajouter en tant qu'administrateur \u00E0 tous leurs espaces de travail avant de prendre en charge la facturation.");
            },
            hasFailedSettlementsTitle: 'Impossible de transférer la propriété',
            hasFailedSettlementsButtonText: 'Compris',
            hasFailedSettlementsText: function (_a) {
                var email = _a.email;
                return "Vous ne pouvez pas prendre en charge la facturation car ".concat(email, " a un r\u00E8glement de carte Expensify en retard. Veuillez leur demander de contacter concierge@expensify.com pour r\u00E9soudre le probl\u00E8me. Ensuite, vous pourrez prendre en charge la facturation de cet espace de travail.");
            },
            failedToClearBalanceTitle: "Échec de l'effacement du solde",
            failedToClearBalanceButtonText: "D'accord",
            failedToClearBalanceText: "Nous n'avons pas pu régler le solde. Veuillez réessayer plus tard.",
            successTitle: 'Youpi ! Tout est prêt.',
            successDescription: 'Vous êtes maintenant le propriétaire de cet espace de travail.',
            errorTitle: 'Oups ! Pas si vite...',
            errorDescriptionPartOne: 'Un problème est survenu lors du transfert de la propriété de cet espace de travail. Réessayez, ou',
            errorDescriptionPartTwo: 'contactez Concierge',
            errorDescriptionPartThree: "pour obtenir de l'aide.",
        },
        exportAgainModal: {
            title: 'Attention !',
            description: function (_a) {
                var reportName = _a.reportName, connectionName = _a.connectionName;
                return "Les rapports suivants ont d\u00E9j\u00E0 \u00E9t\u00E9 export\u00E9s vers ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], " :\n\n").concat(reportName, "\n\n\u00CAtes-vous s\u00FBr de vouloir les exporter \u00E0 nouveau ?");
            },
            confirmText: 'Oui, exporter à nouveau',
            cancelText: 'Annuler',
        },
        upgrade: (_6 = {
                reportFields: {
                    title: 'Champs de rapport',
                    description: "Les champs de rapport vous permettent de sp\u00E9cifier des d\u00E9tails au niveau de l'en-t\u00EAte, distincts des tags qui se rapportent aux d\u00E9penses sur des \u00E9l\u00E9ments de ligne individuels. Ces d\u00E9tails peuvent inclure des noms de projet sp\u00E9cifiques, des informations sur les voyages d'affaires, des emplacements, et plus encore.",
                    onlyAvailableOnPlan: 'Les champs de rapport ne sont disponibles que sur le plan Control, à partir de',
                }
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE] = {
                title: 'NetSuite',
                description: "Profitez de la synchronisation automatis\u00E9e et r\u00E9duisez les saisies manuelles gr\u00E2ce \u00E0 l'int\u00E9gration Expensify + NetSuite. Obtenez des informations financi\u00E8res approfondies et en temps r\u00E9el avec la prise en charge des segments natifs et personnalis\u00E9s, y compris la cartographie des projets et des clients.",
                onlyAvailableOnPlan: 'Notre intégration NetSuite est uniquement disponible avec le plan Control, à partir de',
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT] = {
                title: 'Sage Intacct',
                description: "Profitez de la synchronisation automatis\u00E9e et r\u00E9duisez les saisies manuelles avec l'int\u00E9gration Expensify + Sage Intacct. Obtenez des informations financi\u00E8res approfondies et en temps r\u00E9el gr\u00E2ce \u00E0 des dimensions d\u00E9finies par l'utilisateur, ainsi qu'un codage des d\u00E9penses par d\u00E9partement, classe, emplacement, client et projet (travail).",
                onlyAvailableOnPlan: 'Notre intégration Sage Intacct est uniquement disponible avec le plan Control, à partir de',
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
                title: 'QuickBooks Desktop',
                description: "Profitez de la synchronisation automatis\u00E9e et r\u00E9duisez les saisies manuelles avec l'int\u00E9gration Expensify + QuickBooks Desktop. Obtenez une efficacit\u00E9 ultime gr\u00E2ce \u00E0 une connexion bidirectionnelle en temps r\u00E9el et au codage des d\u00E9penses par classe, article, client et projet.",
                onlyAvailableOnPlan: 'Notre intégration QuickBooks Desktop est uniquement disponible avec le plan Control, à partir de',
            },
            _6[CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id] = {
                title: 'Approvals avancés',
                description: "Si vous souhaitez ajouter plus de niveaux d'approbation au processus \u2013 ou simplement vous assurer que les d\u00E9penses les plus importantes b\u00E9n\u00E9ficient d'un autre regard \u2013 nous avons ce qu'il vous faut. Les approbations avanc\u00E9es vous aident \u00E0 mettre en place les contr\u00F4les appropri\u00E9s \u00E0 chaque niveau afin de garder les d\u00E9penses de votre \u00E9quipe sous contr\u00F4le.",
                onlyAvailableOnPlan: 'Les approbations avancées ne sont disponibles que sur le plan Control, qui commence à',
            },
            _6.categories = {
                title: 'Catégories',
                description: "Les cat\u00E9gories vous aident \u00E0 mieux organiser vos d\u00E9penses pour suivre o\u00F9 vous d\u00E9pensez votre argent. Utilisez notre liste de cat\u00E9gories sugg\u00E9r\u00E9es ou cr\u00E9ez les v\u00F4tres.",
                onlyAvailableOnPlan: 'Les catégories sont disponibles sur le plan Collect, à partir de',
            },
            _6.glCodes = {
                title: 'Codes GL',
                description: "Ajoutez des codes GL \u00E0 vos cat\u00E9gories et \u00E9tiquettes pour faciliter l'exportation des d\u00E9penses vers vos syst\u00E8mes de comptabilit\u00E9 et de paie.",
                onlyAvailableOnPlan: 'Les codes GL sont uniquement disponibles sur le plan Control, à partir de',
            },
            _6.glAndPayrollCodes = {
                title: 'Codes GL et de paie',
                description: "Ajoutez des codes GL et de paie \u00E0 vos cat\u00E9gories pour faciliter l'exportation des d\u00E9penses vers vos syst\u00E8mes de comptabilit\u00E9 et de paie.",
                onlyAvailableOnPlan: 'Les codes GL et de paie sont uniquement disponibles sur le plan Control, à partir de',
            },
            _6.taxCodes = {
                title: 'Codes fiscaux',
                description: "Ajoutez des codes fiscaux \u00E0 vos taxes pour faciliter l'exportation des d\u00E9penses vers vos syst\u00E8mes de comptabilit\u00E9 et de paie.",
                onlyAvailableOnPlan: 'Les codes fiscaux sont uniquement disponibles avec le plan Control, à partir de',
            },
            _6.companyCards = {
                title: "Cartes d'entreprise illimitées",
                description: "Besoin d'ajouter plus de flux de cartes ? D\u00E9bloquez des cartes d'entreprise illimit\u00E9es pour synchroniser les transactions de tous les principaux \u00E9metteurs de cartes.",
                onlyAvailableOnPlan: 'Ceci est uniquement disponible sur le plan Control, à partir de',
            },
            _6.rules = {
                title: 'Règles',
                description: "Les r\u00E8gles fonctionnent en arri\u00E8re-plan et gardent vos d\u00E9penses sous contr\u00F4le pour que vous n'ayez pas \u00E0 vous soucier des petites choses.\n\nExigez des d\u00E9tails de d\u00E9pense comme des re\u00E7us et des descriptions, d\u00E9finissez des limites et des valeurs par d\u00E9faut, et automatisez les approbations et les paiements \u2013 tout en un seul endroit.",
                onlyAvailableOnPlan: 'Les règles sont uniquement disponibles sur le plan Control, à partir de',
            },
            _6.perDiem = {
                title: 'Per diem',
                description: 'Le per diem est un excellent moyen de maintenir vos coûts quotidiens conformes et prévisibles lorsque vos employés voyagent. Profitez de fonctionnalités telles que des tarifs personnalisés, des catégories par défaut et des détails plus précis comme les destinations et les sous-tarifs.',
                onlyAvailableOnPlan: 'Les indemnités journalières ne sont disponibles que sur le plan Control, à partir de',
            },
            _6.travel = {
                title: 'Voyage',
                description: "Expensify Travel est une nouvelle plateforme de réservation et de gestion de voyages d'affaires qui permet aux membres de réserver des hébergements, des vols, des transports, et plus encore.",
                onlyAvailableOnPlan: 'Le voyage est disponible sur le plan Collect, à partir de',
            },
            _6.multiLevelTags = {
                title: 'Tags multi-niveaux',
                description: "Les balises multi-niveaux vous aident à suivre les dépenses avec plus de précision. Assignez plusieurs balises à chaque poste—comme le département, le client ou le centre de coût—pour capturer le contexte complet de chaque dépense. Cela permet des rapports plus détaillés, des flux de travail d'approbation et des exportations comptables.",
                onlyAvailableOnPlan: 'Les balises multi-niveaux sont uniquement disponibles sur le plan Control, à partir de',
            },
            _6.pricing = {
                perActiveMember: 'par membre actif par mois.',
                perMember: 'par membre par mois.',
            },
            _6.note = {
                upgradeWorkspace: 'Mettez à niveau votre espace de travail pour accéder à cette fonctionnalité, ou',
                learnMore: 'en savoir plus',
                aboutOurPlans: 'à propos de nos plans et tarifs.',
            },
            _6.upgradeToUnlock = 'Débloquez cette fonctionnalité',
            _6.completed = {
                headline: "Vous avez am\u00E9lior\u00E9 votre espace de travail !",
                successMessage: function (_a) {
                    var policyName = _a.policyName;
                    return "Vous avez r\u00E9ussi \u00E0 passer ".concat(policyName, " au plan Control !");
                },
                categorizeMessage: "Vous avez r\u00E9ussi \u00E0 passer \u00E0 un espace de travail sur le plan Collect. Vous pouvez maintenant cat\u00E9goriser vos d\u00E9penses !",
                travelMessage: "Vous avez r\u00E9ussi \u00E0 passer \u00E0 un espace de travail sur le plan Collect. Vous pouvez maintenant commencer \u00E0 r\u00E9server et g\u00E9rer vos voyages !",
                viewSubscription: 'Voir votre abonnement',
                moreDetails: 'pour plus de détails.',
                gotIt: 'Compris, merci',
            },
            _6.commonFeatures = {
                title: 'Passez au plan Control',
                note: 'Débloquez nos fonctionnalités les plus puissantes, y compris :',
                benefits: {
                    startsAt: 'Le plan Control commence à',
                    perMember: 'par membre actif par mois.',
                    learnMore: 'En savoir plus',
                    pricing: 'à propos de nos plans et tarifs.',
                    benefit1: 'Connexions comptables avancées (NetSuite, Sage Intacct, et plus)',
                    benefit2: 'Règles de dépenses intelligentes',
                    benefit3: "Flux de travail d'approbation à plusieurs niveaux",
                    benefit4: 'Contrôles de sécurité renforcés',
                    toUpgrade: 'Pour mettre à niveau, cliquez',
                    selectWorkspace: 'sélectionnez un espace de travail et changez le type de plan en',
                },
            },
            _6),
        downgrade: {
            commonFeatures: {
                title: 'Passer au plan Collect',
                note: "Si vous rétrogradez, vous perdrez l'accès à ces fonctionnalités et plus encore :",
                benefits: {
                    note: 'Pour une comparaison complète de nos plans, consultez notre',
                    pricingPage: 'page de tarification',
                    confirm: 'Êtes-vous sûr de vouloir rétrograder et supprimer vos configurations ?',
                    warning: 'Ceci ne peut pas être annulé.',
                    benefit1: 'Connexions comptables (sauf QuickBooks Online et Xero)',
                    benefit2: 'Règles de dépenses intelligentes',
                    benefit3: "Flux de travail d'approbation à plusieurs niveaux",
                    benefit4: 'Contrôles de sécurité renforcés',
                    headsUp: 'Attention !',
                    multiWorkspaceNote: 'Vous devrez rétrograder tous vos espaces de travail avant votre premier paiement mensuel pour commencer un abonnement au tarif Collect. Cliquez',
                    selectStep: '> sélectionnez chaque espace de travail > changez le type de plan en',
                },
            },
            completed: {
                headline: 'Votre espace de travail a été rétrogradé',
                description: "Vous avez d'autres espaces de travail sur le plan Control. Pour être facturé au tarif Collect, vous devez rétrograder tous les espaces de travail.",
                gotIt: 'Compris, merci',
            },
        },
        payAndDowngrade: {
            title: 'Payer et rétrograder',
            headline: 'Votre paiement final',
            description1: 'Votre facture finale pour cet abonnement sera',
            description2: function (_a) {
                var date = _a.date;
                return "Voir votre r\u00E9partition ci-dessous pour le ".concat(date, " :");
            },
            subscription: "Attention ! Cette action mettra fin à votre abonnement Expensify, supprimera cet espace de travail et retirera tous les membres de l'espace de travail. Si vous souhaitez conserver cet espace de travail et seulement vous retirer, demandez à un autre administrateur de prendre en charge la facturation d'abord.",
            genericFailureMessage: "Une erreur s'est produite lors du paiement de votre facture. Veuillez réessayer.",
        },
        restrictedAction: {
            restricted: 'Restreint',
            actionsAreCurrentlyRestricted: function (_a) {
                var workspaceName = _a.workspaceName;
                return "Les actions sur l'espace de travail ".concat(workspaceName, " sont actuellement restreintes.");
            },
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: function (_a) {
                var workspaceOwnerName = _a.workspaceOwnerName;
                return "Le propri\u00E9taire de l'espace de travail, ".concat(workspaceOwnerName, ", devra ajouter ou mettre \u00E0 jour la carte de paiement enregistr\u00E9e pour d\u00E9bloquer la nouvelle activit\u00E9 de l'espace de travail.");
            },
            youWillNeedToAddOrUpdatePaymentCard: "Vous devrez ajouter ou mettre à jour la carte de paiement enregistrée pour débloquer la nouvelle activité de l'espace de travail.",
            addPaymentCardToUnlock: 'Ajoutez une carte de paiement pour débloquer !',
            addPaymentCardToContinueUsingWorkspace: 'Ajoutez une carte de paiement pour continuer à utiliser cet espace de travail.',
            pleaseReachOutToYourWorkspaceAdmin: "Veuillez contacter l'administrateur de votre espace de travail pour toute question.",
            chatWithYourAdmin: 'Discutez avec votre administrateur',
            chatInAdmins: 'Discuter dans #admins',
            addPaymentCard: 'Ajouter une carte de paiement',
        },
        rules: {
            individualExpenseRules: {
                title: 'Dépenses',
                subtitle: 'Définissez des contrôles de dépenses et des paramètres par défaut pour les dépenses individuelles. Vous pouvez également créer des règles pour',
                receiptRequiredAmount: 'Montant requis pour le reçu',
                receiptRequiredAmountDescription: 'Exiger des reçus lorsque les dépenses dépassent ce montant, sauf si une règle de catégorie le remplace.',
                maxExpenseAmount: 'Montant maximum de la dépense',
                maxExpenseAmountDescription: 'Signaler les dépenses qui dépassent ce montant, sauf si une règle de catégorie les remplace.',
                maxAge: 'Âge maximum',
                maxExpenseAge: 'Âge maximal des dépenses',
                maxExpenseAgeDescription: "Signaler les dépenses plus anciennes qu'un nombre spécifique de jours.",
                maxExpenseAgeDays: function () { return ({
                    one: '1 jour',
                    other: function (count) { return "".concat(count, " jours"); },
                }); },
                billableDefault: 'Par défaut facturable',
                billableDefaultDescription: 'Choisissez si les dépenses en espèces et par carte de crédit doivent être facturables par défaut. Les dépenses facturables sont activées ou désactivées dans',
                billable: 'Facturable',
                billableDescription: 'Les dépenses sont le plus souvent refacturées aux clients.',
                nonBillable: 'Non-facturable',
                nonBillableDescription: 'Les dépenses sont occasionnellement refacturées aux clients.',
                eReceipts: 'eReceipts',
                eReceiptsHint: 'Les eReceipts sont créés automatiquement',
                eReceiptsHintLink: 'pour la plupart des transactions de crédit en USD',
                attendeeTracking: 'Suivi des participants',
                attendeeTrackingHint: 'Suivez le coût par personne pour chaque dépense.',
                prohibitedDefaultDescription: "Signalez tous les reçus où apparaissent de l'alcool, des jeux d'argent ou d'autres articles restreints. Les dépenses avec des reçus contenant ces articles devront faire l'objet d'une vérification manuelle.",
                prohibitedExpenses: 'Dépenses interdites',
                alcohol: 'Alcool',
                hotelIncidentals: "Frais accessoires d'hôtel",
                gambling: "Jeux d'argent",
                tobacco: 'Tabac',
                adultEntertainment: 'Divertissement pour adultes',
            },
            expenseReportRules: {
                examples: 'Exemples :',
                title: 'Rapports de dépenses',
                subtitle: 'Automatisez la conformité des rapports de dépenses, les approbations et le paiement.',
                customReportNamesSubtitle: 'Personnalisez les titres des rapports en utilisant notre',
                customNameTitle: 'Titre de rapport par défaut',
                customNameDescription: 'Choisissez un nom personnalisé pour les rapports de dépenses en utilisant notre',
                customNameDescriptionLink: 'formules étendues',
                customNameInputLabel: 'Nom',
                customNameEmailPhoneExample: 'E-mail ou téléphone du membre : {report:submit:from}',
                customNameStartDateExample: 'Date de début du rapport : {report:startdate}',
                customNameWorkspaceNameExample: "Nom de l'espace de travail : {report:workspacename}",
                customNameReportIDExample: 'Report ID : {report:id}',
                customNameTotalExample: 'Total : {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'Empêcher les membres de modifier les noms des rapports personnalisés',
                preventSelfApprovalsTitle: 'Empêcher les auto-approbations',
                preventSelfApprovalsSubtitle: "Empêcher les membres de l'espace de travail d'approuver leurs propres rapports de dépenses.",
                autoApproveCompliantReportsTitle: 'Approuver automatiquement les rapports conformes',
                autoApproveCompliantReportsSubtitle: "Configurez quels rapports de dépenses sont éligibles pour l'approbation automatique.",
                autoApproveReportsUnderTitle: 'Approuver automatiquement les rapports sous',
                autoApproveReportsUnderDescription: 'Les rapports de dépenses entièrement conformes en dessous de ce montant seront automatiquement approuvés.',
                randomReportAuditTitle: 'Audit de rapport aléatoire',
                randomReportAuditDescription: "Exiger que certains rapports soient approuvés manuellement, même s'ils sont éligibles pour une approbation automatique.",
                autoPayApprovedReportsTitle: 'Rapports approuvés de paiement automatique',
                autoPayApprovedReportsSubtitle: 'Configurez quels rapports de dépenses sont éligibles pour le paiement automatique.',
                autoPayApprovedReportsLimitError: function (_a) {
                    var _b = _a === void 0 ? {} : _a, currency = _b.currency;
                    return "Veuillez entrer un montant inf\u00E9rieur \u00E0 ".concat(currency !== null && currency !== void 0 ? currency : '', "20 000");
                },
                autoPayApprovedReportsLockedSubtitle: 'Allez dans plus de fonctionnalités et activez les flux de travail, puis ajoutez des paiements pour débloquer cette fonctionnalité.',
                autoPayReportsUnderTitle: 'Rapports de paiement automatique sous',
                autoPayReportsUnderDescription: 'Les rapports de dépenses entièrement conformes en dessous de ce montant seront automatiquement payés.',
                unlockFeatureGoToSubtitle: 'Aller à',
                unlockFeatureEnableWorkflowsSubtitle: function (_a) {
                    var featureName = _a.featureName;
                    return "et activez les flux de travail, puis ajoutez ".concat(featureName, " pour d\u00E9bloquer cette fonctionnalit\u00E9.");
                },
                enableFeatureSubtitle: function (_a) {
                    var featureName = _a.featureName;
                    return "et activez ".concat(featureName, " pour d\u00E9bloquer cette fonctionnalit\u00E9.");
                },
            },
            categoryRules: {
                title: 'Règles de catégorie',
                approver: 'Approbateur',
                requireDescription: 'Description requise',
                descriptionHint: 'Indice de description',
                descriptionHintDescription: function (_a) {
                    var categoryName = _a.categoryName;
                    return "Rappelez aux employ\u00E9s de fournir des informations suppl\u00E9mentaires pour les d\u00E9penses de \u00AB ".concat(categoryName, " \u00BB. Cet indice appara\u00EEt dans le champ de description des d\u00E9penses.");
                },
                descriptionHintLabel: 'Indice',
                descriptionHintSubtitle: "Astuce : Plus c'est court, mieux c'est !",
                maxAmount: 'Montant maximum',
                flagAmountsOver: 'Signaler les montants supérieurs à',
                flagAmountsOverDescription: function (_a) {
                    var categoryName = _a.categoryName;
                    return "S'applique \u00E0 la cat\u00E9gorie \u00AB ".concat(categoryName, " \u00BB.");
                },
                flagAmountsOverSubtitle: 'Cela remplace le montant maximum pour toutes les dépenses.',
                expenseLimitTypes: {
                    expense: 'Dépense individuelle',
                    expenseSubtitle: "Marquer les montants des dépenses par catégorie. Cette règle remplace la règle générale de l'espace de travail pour le montant maximal des dépenses.",
                    daily: 'Total de la catégorie',
                    dailySubtitle: 'Indiquer le total des dépenses par catégorie pour chaque rapport de dépenses.',
                },
                requireReceiptsOver: 'Exiger des reçus au-dessus de',
                requireReceiptsOverList: {
                    default: function (_a) {
                        var defaultAmount = _a.defaultAmount;
                        return "".concat(defaultAmount, " ").concat(CONST_1.default.DOT_SEPARATOR, " Par d\u00E9faut");
                    },
                    never: 'Ne jamais exiger de reçus',
                    always: 'Toujours exiger des reçus',
                },
                defaultTaxRate: 'Taux de taxe par défaut',
                goTo: 'Aller à',
                andEnableWorkflows: 'et activez les flux de travail, puis ajoutez des approbations pour débloquer cette fonctionnalité.',
            },
            customRules: {
                title: 'Règles personnalisées',
                subtitle: 'Description',
                description: 'Saisir des règles personnalisées pour les rapports de dépenses',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Collecter',
                    description: 'Pour les équipes cherchant à automatiser leurs processus.',
                },
                corporate: {
                    label: 'Contrôle',
                    description: 'Pour les organisations ayant des exigences avancées.',
                },
            },
            description: 'Choisissez un plan qui vous convient. Pour une liste détaillée des fonctionnalités et des tarifs, consultez notre',
            subscriptionLink: "types de plan et page d'aide sur les tarifs",
            lockedPlanDescription: function (_a) {
                var count = _a.count, annualSubscriptionEndDate = _a.annualSubscriptionEndDate;
                return ({
                    one: "Vous vous \u00EAtes engag\u00E9 \u00E0 avoir 1 membre actif sur le plan Control jusqu'\u00E0 la fin de votre abonnement annuel le ".concat(annualSubscriptionEndDate, ". Vous pouvez passer \u00E0 un abonnement \u00E0 l'utilisation et r\u00E9trograder vers le plan Collect \u00E0 partir du ").concat(annualSubscriptionEndDate, " en d\u00E9sactivant le renouvellement automatique dans"),
                    other: "Vous vous \u00EAtes engag\u00E9 \u00E0 avoir ".concat(count, " membres actifs sur le plan Control jusqu'\u00E0 la fin de votre abonnement annuel le ").concat(annualSubscriptionEndDate, ". Vous pouvez passer \u00E0 l'abonnement \u00E0 l'utilisation et r\u00E9trograder au plan Collect \u00E0 partir du ").concat(annualSubscriptionEndDate, " en d\u00E9sactivant le renouvellement automatique dans"),
                });
            },
            subscriptions: 'Abonnements',
        },
    },
    getAssistancePage: {
        title: "Obtenir de l'aide",
        subtitle: 'Nous sommes ici pour vous ouvrir la voie vers la grandeur !',
        description: 'Choisissez parmi les options de support ci-dessous :',
        chatWithConcierge: 'Discuter avec Concierge',
        scheduleSetupCall: 'Planifier un appel de configuration',
        scheduleACall: 'Planifier un appel',
        questionMarkButtonTooltip: "Obtenez de l'aide de notre équipe",
        exploreHelpDocs: "Explorer les documents d'aide",
        registerForWebinar: "S'inscrire au webinaire",
        onboardingHelp: "Aide à l'intégration",
    },
    emojiPicker: {
        skinTonePickerLabel: 'Changer la couleur de peau par défaut',
        headers: {
            frequentlyUsed: 'Fréquemment utilisé',
            smileysAndEmotion: 'Smileys et émotions',
            peopleAndBody: 'Personnes et Corps',
            animalsAndNature: 'Animaux et Nature',
            foodAndDrink: 'Nourriture et Boissons',
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
        restrictedDescription: 'Les personnes de votre espace de travail peuvent trouver cette salle',
        privateDescription: 'Les personnes invitées à cette salle peuvent la trouver.',
        publicDescription: 'Tout le monde peut trouver cette salle',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Tout le monde peut trouver cette salle',
        createRoom: 'Créer une salle',
        roomAlreadyExistsError: 'Une salle portant ce nom existe déjà',
        roomNameReservedError: function (_a) {
            var reservedName = _a.reservedName;
            return "".concat(reservedName, " est une salle par d\u00E9faut sur tous les espaces de travail. Veuillez choisir un autre nom.");
        },
        roomNameInvalidError: 'Les noms de salle peuvent uniquement inclure des lettres minuscules, des chiffres et des tirets',
        pleaseEnterRoomName: 'Veuillez entrer un nom de salle',
        pleaseSelectWorkspace: 'Veuillez sélectionner un espace de travail',
        renamedRoomAction: function (_a) {
            var oldName = _a.oldName, newName = _a.newName, actorName = _a.actorName, isExpenseReport = _a.isExpenseReport;
            var actor = actorName ? "".concat(actorName, " ") : '';
            return isExpenseReport ? "".concat(actor, " renomm\u00E9 en \"").concat(newName, "\" (pr\u00E9c\u00E9demment \"").concat(oldName, "\")") : "".concat(actor, " a renomm\u00E9 cette salle en \"").concat(newName, "\" (pr\u00E9c\u00E9demment \"").concat(oldName, "\")");
        },
        roomRenamedTo: function (_a) {
            var newName = _a.newName;
            return "Salle renomm\u00E9e en ".concat(newName);
        },
        social: 'social',
        selectAWorkspace: 'Sélectionner un espace de travail',
        growlMessageOnRenameError: "Impossible de renommer la salle de l'espace de travail. Veuillez vérifier votre connexion et réessayer.",
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
        submitAndApprove: 'Soumettre et Approuver',
        advanced: 'AVANCÉ',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: function (_a) {
            var approverEmail = _a.approverEmail, approverName = _a.approverName, field = _a.field, name = _a.name;
            return "ajout\u00E9 ".concat(approverName, " (").concat(approverEmail, ") comme approbateur pour le ").concat(field, " \"").concat(name, "\"");
        },
        deleteApprovalRule: function (_a) {
            var approverEmail = _a.approverEmail, approverName = _a.approverName, field = _a.field, name = _a.name;
            return "supprim\u00E9 ".concat(approverName, " (").concat(approverEmail, ") en tant qu'approbateur pour le ").concat(field, " \"").concat(name, "\"");
        },
        updateApprovalRule: function (_a) {
            var field = _a.field, name = _a.name, newApproverEmail = _a.newApproverEmail, newApproverName = _a.newApproverName, oldApproverEmail = _a.oldApproverEmail, oldApproverName = _a.oldApproverName;
            var formatApprover = function (displayName, email) { return (displayName ? "".concat(displayName, " (").concat(email, ")") : email); };
            return "a chang\u00E9 l'approbateur pour le ".concat(field, " \"").concat(name, "\" \u00E0 ").concat(formatApprover(newApproverName, newApproverEmail), " (pr\u00E9c\u00E9demment ").concat(formatApprover(oldApproverName, oldApproverEmail), ")");
        },
        addCategory: function (_a) {
            var categoryName = _a.categoryName;
            return "a ajout\u00E9 la cat\u00E9gorie \"".concat(categoryName, "\"");
        },
        deleteCategory: function (_a) {
            var categoryName = _a.categoryName;
            return "a supprim\u00E9 la cat\u00E9gorie \"".concat(categoryName, "\"");
        },
        updateCategory: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName;
            return "".concat(oldValue ? 'désactivé' : 'activé', " la cat\u00E9gorie \"").concat(categoryName, "\"");
        },
        updateCategoryPayrollCode: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName, newValue = _a.newValue;
            if (!oldValue) {
                return "ajout\u00E9 le code de paie \"".concat(newValue, "\" \u00E0 la cat\u00E9gorie \"").concat(categoryName, "\"");
            }
            if (!newValue && oldValue) {
                return "a supprim\u00E9 le code de paie \"".concat(oldValue, "\" de la cat\u00E9gorie \"").concat(categoryName, "\"");
            }
            return "a chang\u00E9 le code de paie de la cat\u00E9gorie \"".concat(categoryName, "\" en \u201C").concat(newValue, "\u201D (auparavant \u201C").concat(oldValue, "\u201D)");
        },
        updateCategoryGLCode: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName, newValue = _a.newValue;
            if (!oldValue) {
                return "a ajout\u00E9 le code GL \"".concat(newValue, "\" \u00E0 la cat\u00E9gorie \"").concat(categoryName, "\"");
            }
            if (!newValue && oldValue) {
                return "a supprim\u00E9 le code GL \"".concat(oldValue, "\" de la cat\u00E9gorie \"").concat(categoryName, "\"");
            }
            return "a chang\u00E9 le code GL de la cat\u00E9gorie \u201C".concat(categoryName, "\u201D en \u201C").concat(newValue, "\u201D (pr\u00E9c\u00E9demment \u201C").concat(oldValue, "\u201C)");
        },
        updateAreCommentsRequired: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName;
            return "a chang\u00E9 la description de la cat\u00E9gorie \"".concat(categoryName, "\" en ").concat(!oldValue ? 'requis' : 'pas requis', " (pr\u00E9c\u00E9demment ").concat(!oldValue ? 'pas requis' : 'requis', ")");
        },
        updateCategoryMaxExpenseAmount: function (_a) {
            var categoryName = _a.categoryName, oldAmount = _a.oldAmount, newAmount = _a.newAmount;
            if (newAmount && !oldAmount) {
                return "a ajout\u00E9 un montant maximum de ".concat(newAmount, " \u00E0 la cat\u00E9gorie \"").concat(categoryName, "\"");
            }
            if (oldAmount && !newAmount) {
                return "a supprim\u00E9 le montant maximum de ".concat(oldAmount, " de la cat\u00E9gorie \"").concat(categoryName, "\"");
            }
            return "a modifi\u00E9 le montant maximum de la cat\u00E9gorie \"".concat(categoryName, "\" \u00E0 ").concat(newAmount, " (pr\u00E9c\u00E9demment ").concat(oldAmount, ")");
        },
        updateCategoryExpenseLimitType: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "a ajout\u00E9 un type de limite de ".concat(newValue, " \u00E0 la cat\u00E9gorie \"").concat(categoryName, "\"");
            }
            return "a chang\u00E9 le type de limite de la cat\u00E9gorie \"".concat(categoryName, "\" en ").concat(newValue, " (pr\u00E9c\u00E9demment ").concat(oldValue, ")");
        },
        updateCategoryMaxAmountNoReceipt: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "mis \u00E0 jour la cat\u00E9gorie \"".concat(categoryName, "\" en changeant Re\u00E7us en ").concat(newValue);
            }
            return "a chang\u00E9 la cat\u00E9gorie \"".concat(categoryName, "\" en ").concat(newValue, " (pr\u00E9c\u00E9demment ").concat(oldValue, ")");
        },
        setCategoryName: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "a renomm\u00E9 la cat\u00E9gorie \"".concat(oldName, "\" en \"").concat(newName, "\"");
        },
        updatedDescriptionHint: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!newValue) {
                return "a supprim\u00E9 l'indication de description \"".concat(oldValue, "\" de la cat\u00E9gorie \"").concat(categoryName, "\"");
            }
            return !oldValue
                ? "ajout\u00E9 l'indice de description \"".concat(newValue, "\" \u00E0 la cat\u00E9gorie \"").concat(categoryName, "\"")
                : "a chang\u00E9 l'indice de description de la cat\u00E9gorie \"".concat(categoryName, "\" en \u00AB ").concat(newValue, " \u00BB (auparavant \u00AB ").concat(oldValue, " \u00BB)");
        },
        updateTagListName: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "a chang\u00E9 le nom de la liste de tags en \"".concat(newName, "\" (pr\u00E9c\u00E9demment \"").concat(oldName, "\")");
        },
        addTag: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName;
            return "a ajout\u00E9 le tag \"".concat(tagName, "\" \u00E0 la liste \"").concat(tagListName, "\"");
        },
        updateTagName: function (_a) {
            var tagListName = _a.tagListName, newName = _a.newName, oldName = _a.oldName;
            return "a mis \u00E0 jour la liste des \u00E9tiquettes \"".concat(tagListName, "\" en changeant l'\u00E9tiquette \"").concat(oldName, "\" en \"").concat(newName, "\"");
        },
        updateTagEnabled: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName, enabled = _a.enabled;
            return "".concat(enabled ? 'activé' : 'désactivé', " le tag \"").concat(tagName, "\" dans la liste \"").concat(tagListName, "\"");
        },
        deleteTag: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName;
            return "a supprim\u00E9 le tag \"".concat(tagName, "\" de la liste \"").concat(tagListName, "\"");
        },
        deleteMultipleTags: function (_a) {
            var count = _a.count, tagListName = _a.tagListName;
            return "supprim\u00E9 les balises \"".concat(count, "\" de la liste \"").concat(tagListName, "\"");
        },
        updateTag: function (_a) {
            var tagListName = _a.tagListName, newValue = _a.newValue, tagName = _a.tagName, updatedField = _a.updatedField, oldValue = _a.oldValue;
            if (oldValue) {
                return "mis \u00E0 jour le tag \"".concat(tagName, "\" dans la liste \"").concat(tagListName, "\" en changeant le ").concat(updatedField, " \u00E0 \"").concat(newValue, "\" (auparavant \"").concat(oldValue, "\")");
            }
            return "a mis \u00E0 jour le tag \"".concat(tagName, "\" dans la liste \"").concat(tagListName, "\" en ajoutant un ").concat(updatedField, " de \"").concat(newValue, "\"");
        },
        updateCustomUnit: function (_a) {
            var customUnitName = _a.customUnitName, newValue = _a.newValue, oldValue = _a.oldValue, updatedField = _a.updatedField;
            return "a chang\u00E9 le ".concat(customUnitName, " ").concat(updatedField, " en \"").concat(newValue, "\" (auparavant \"").concat(oldValue, "\")");
        },
        updateCustomUnitTaxEnabled: function (_a) {
            var newValue = _a.newValue;
            return "Suivi fiscal ".concat(newValue ? 'activé' : 'désactivé', " sur les taux de distance");
        },
        addCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, rateName = _a.rateName;
            return "a ajout\u00E9 un nouveau taux \"".concat(customUnitName, "\" \"").concat(rateName, "\"");
        },
        updatedCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, oldValue = _a.oldValue, updatedField = _a.updatedField;
            return "a chang\u00E9 le taux de ".concat(customUnitName, " ").concat(updatedField, " \"").concat(customUnitRateName, "\" \u00E0 \"").concat(newValue, "\" (auparavant \"").concat(oldValue, "\")");
        },
        updatedCustomUnitTaxRateExternalID: function (_a) {
            var customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, newTaxPercentage = _a.newTaxPercentage, oldTaxPercentage = _a.oldTaxPercentage, oldValue = _a.oldValue;
            if (oldTaxPercentage && oldValue) {
                return "a modifi\u00E9 le taux de taxe sur le taux de distance \"".concat(customUnitRateName, "\" \u00E0 \"").concat(newValue, " (").concat(newTaxPercentage, ")\" (pr\u00E9c\u00E9demment \"").concat(oldValue, " (").concat(oldTaxPercentage, ")\")");
            }
            return "a ajout\u00E9 le taux de taxe \"".concat(newValue, " (").concat(newTaxPercentage, ")\" au taux de distance \"").concat(customUnitRateName, "\"");
        },
        updatedCustomUnitTaxClaimablePercentage: function (_a) {
            var customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, oldValue = _a.oldValue;
            if (oldValue) {
                return "a modifi\u00E9 la partie r\u00E9cup\u00E9rable de la taxe sur le taux de distance \"".concat(customUnitRateName, "\" \u00E0 \"").concat(newValue, "\" (auparavant \"").concat(oldValue, "\")");
            }
            return "ajout\u00E9 une partie r\u00E9cup\u00E9rable de taxe de \"".concat(newValue, "\" au taux de distance \"").concat(customUnitRateName, "\"");
        },
        deleteCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, rateName = _a.rateName;
            return "supprim\u00E9 le taux \"".concat(rateName, "\" de \"").concat(customUnitName, "\"");
        },
        addedReportField: function (_a) {
            var fieldType = _a.fieldType, fieldName = _a.fieldName;
            return "ajout\u00E9 le champ de rapport ".concat(fieldType, " \"").concat(fieldName, "\"");
        },
        updateReportFieldDefaultValue: function (_a) {
            var defaultValue = _a.defaultValue, fieldName = _a.fieldName;
            return "d\u00E9finir la valeur par d\u00E9faut du champ de rapport \"".concat(fieldName, "\" sur \"").concat(defaultValue, "\"");
        },
        addedReportFieldOption: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName;
            return "a ajout\u00E9 l'option \"".concat(optionName, "\" au champ de rapport \"").concat(fieldName, "\"");
        },
        removedReportFieldOption: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName;
            return "a supprim\u00E9 l'option \"".concat(optionName, "\" du champ de rapport \"").concat(fieldName, "\"");
        },
        updateReportFieldOptionDisabled: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName, optionEnabled = _a.optionEnabled;
            return "".concat(optionEnabled ? 'activé' : 'désactivé', " l'option \"").concat(optionName, "\" pour le champ de rapport \"").concat(fieldName, "\"");
        },
        updateReportFieldAllOptionsDisabled: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName, allEnabled = _a.allEnabled, toggledOptionsCount = _a.toggledOptionsCount;
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return "".concat(allEnabled ? 'activé' : 'désactivé', " toutes les options pour le champ de rapport \"").concat(fieldName, "\"");
            }
            return "".concat(allEnabled ? 'activé' : 'désactivé', " l'option \"").concat(optionName, "\" pour le champ de rapport \"").concat(fieldName, "\", rendant toutes les options ").concat(allEnabled ? 'activé' : 'désactivé');
        },
        deleteReportField: function (_a) {
            var fieldType = _a.fieldType, fieldName = _a.fieldName;
            return "supprim\u00E9 le champ de rapport ".concat(fieldType, " \"").concat(fieldName, "\"");
        },
        preventSelfApproval: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "mis \u00E0 jour \"Emp\u00EAcher l'auto-approbation\" en \"".concat(newValue === 'true' ? 'Activé' : 'Désactivé', "\" (pr\u00E9c\u00E9demment \"").concat(oldValue === 'true' ? 'Activé' : 'Désactivé', "\")");
        },
        updateMaxExpenseAmountNoReceipt: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "a modifi\u00E9 le montant maximum requis pour les d\u00E9penses avec re\u00E7u \u00E0 ".concat(newValue, " (auparavant ").concat(oldValue, ")");
        },
        updateMaxExpenseAmount: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "a modifi\u00E9 le montant maximum des d\u00E9penses pour les violations \u00E0 ".concat(newValue, " (pr\u00E9c\u00E9demment ").concat(oldValue, ")");
        },
        updateMaxExpenseAge: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "mis \u00E0 jour \"\u00C2ge maximal des d\u00E9penses (jours)\" \u00E0 \"".concat(newValue, "\" (pr\u00E9c\u00E9demment \"").concat(oldValue === 'false' ? CONST_1.default.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue, "\")");
        },
        updateMonthlyOffset: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "d\u00E9finir la date de soumission du rapport mensuel sur \"".concat(newValue, "\"");
            }
            return "a mis \u00E0 jour la date de soumission du rapport mensuel \u00E0 \"".concat(newValue, "\" (pr\u00E9c\u00E9demment \"").concat(oldValue, "\")");
        },
        updateDefaultBillable: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "mis \u00E0 jour \"Refacturer les d\u00E9penses aux clients\" \u00E0 \"".concat(newValue, "\" (pr\u00E9c\u00E9demment \"").concat(oldValue, "\")");
        },
        updateDefaultTitleEnforced: function (_a) {
            var value = _a.value;
            return "\"Appliquer les titres de rapport par d\u00E9faut\" ".concat(value ? 'sur' : 'désactivé');
        },
        renamedWorkspaceNameAction: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "a mis \u00E0 jour le nom de cet espace de travail en \"".concat(newName, "\" (pr\u00E9c\u00E9demment \"").concat(oldName, "\")");
        },
        updateWorkspaceDescription: function (_a) {
            var newDescription = _a.newDescription, oldDescription = _a.oldDescription;
            return !oldDescription
                ? "d\u00E9finir la description de cet espace de travail sur \"".concat(newDescription, "\"")
                : "a mis \u00E0 jour la description de cet espace de travail en \"".concat(newDescription, "\" (pr\u00E9c\u00E9demment \"").concat(oldDescription, "\")");
        },
        removedFromApprovalWorkflow: function (_a) {
            var _b;
            var submittersNames = _a.submittersNames;
            var joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = (_b = submittersNames.at(0)) !== null && _b !== void 0 ? _b : '';
            }
            else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('et');
            }
            else if (submittersNames.length > 2) {
                joinedNames = "".concat(submittersNames.slice(0, submittersNames.length - 1).join(', '), " and ").concat(submittersNames.at(-1));
            }
            return {
                one: "vous a retir\u00E9 du flux de travail d'approbation et du chat de d\u00E9penses de ".concat(joinedNames, ". Les rapports pr\u00E9c\u00E9demment soumis resteront disponibles pour approbation dans votre bo\u00EEte de r\u00E9ception."),
                other: "vous a retir\u00E9 des flux de travail d'approbation et des discussions de d\u00E9penses de ".concat(joinedNames, ". Les rapports pr\u00E9c\u00E9demment soumis resteront disponibles pour approbation dans votre bo\u00EEte de r\u00E9ception."),
            };
        },
        demotedFromWorkspace: function (_a) {
            var policyName = _a.policyName, oldRole = _a.oldRole;
            return "a mis \u00E0 jour votre r\u00F4le dans ".concat(policyName, " de ").concat(oldRole, " \u00E0 utilisateur. Vous avez \u00E9t\u00E9 retir\u00E9 de toutes les discussions de d\u00E9penses des soumetteurs, sauf la v\u00F4tre.");
        },
        updatedWorkspaceCurrencyAction: function (_a) {
            var oldCurrency = _a.oldCurrency, newCurrency = _a.newCurrency;
            return "a mis \u00E0 jour la devise par d\u00E9faut en ".concat(newCurrency, " (pr\u00E9c\u00E9demment ").concat(oldCurrency, ")");
        },
        updatedWorkspaceFrequencyAction: function (_a) {
            var oldFrequency = _a.oldFrequency, newFrequency = _a.newFrequency;
            return "a mis \u00E0 jour la fr\u00E9quence de rapport automatique \u00E0 \"".concat(newFrequency, "\" (pr\u00E9c\u00E9demment \"").concat(oldFrequency, "\")");
        },
        updateApprovalMode: function (_a) {
            var newValue = _a.newValue, oldValue = _a.oldValue;
            return "a mis \u00E0 jour le mode d'approbation en \"".concat(newValue, "\" (auparavant \"").concat(oldValue, "\")");
        },
        upgradedWorkspace: 'a mis à niveau cet espace de travail vers le plan Control',
        downgradedWorkspace: 'a rétrogradé cet espace de travail vers le plan Collect',
        updatedAuditRate: function (_a) {
            var oldAuditRate = _a.oldAuditRate, newAuditRate = _a.newAuditRate;
            return "a chang\u00E9 le taux de rapports achemin\u00E9s al\u00E9atoirement pour approbation manuelle \u00E0 ".concat(Math.round(newAuditRate * 100), "% (pr\u00E9c\u00E9demment ").concat(Math.round(oldAuditRate * 100), "%)");
        },
        updatedManualApprovalThreshold: function (_a) {
            var oldLimit = _a.oldLimit, newLimit = _a.newLimit;
            return "a modifi\u00E9 la limite d'approbation manuelle pour toutes les d\u00E9penses \u00E0 ".concat(newLimit, " (pr\u00E9c\u00E9demment ").concat(oldLimit, ")");
        },
    },
    roomMembersPage: {
        memberNotFound: 'Membre non trouvé.',
        useInviteButton: "Pour inviter un nouveau membre à la discussion, veuillez utiliser le bouton d'invitation ci-dessus.",
        notAuthorized: "Vous n'avez pas acc\u00E8s \u00E0 cette page. Si vous essayez de rejoindre cette salle, demandez simplement \u00E0 un membre de la salle de vous ajouter. Autre chose ? Contactez ".concat(CONST_1.default.EMAIL.CONCIERGE),
        removeMembersPrompt: function (_a) {
            var memberName = _a.memberName;
            return ({
                one: "\u00CAtes-vous s\u00FBr de vouloir retirer ".concat(memberName, " de la salle ?"),
                other: 'Êtes-vous sûr de vouloir supprimer les membres sélectionnés de la salle ?',
            });
        },
        error: {
            genericAdd: "Un problème est survenu lors de l'ajout de ce membre à la salle.",
        },
    },
    newTaskPage: {
        assignTask: 'Attribuer une tâche',
        assignMe: 'Assigner à moi',
        confirmTask: 'Confirmer la tâche',
        confirmError: 'Veuillez entrer un titre et sélectionner une destination de partage',
        descriptionOptional: 'Description (facultatif)',
        pleaseEnterTaskName: 'Veuillez entrer un titre',
        pleaseEnterTaskDestination: 'Veuillez sélectionner où vous souhaitez partager cette tâche.',
    },
    task: {
        task: 'Tâche',
        title: 'Titre',
        description: 'Description',
        assignee: 'Cessionnaire',
        completed: 'Terminé',
        action: 'Compléter',
        messages: {
            created: function (_a) {
                var title = _a.title;
                return "t\u00E2che pour ".concat(title);
            },
            completed: 'marqué comme terminé',
            canceled: 'tâche supprimée',
            reopened: 'marqué comme incomplet',
            error: "Vous n'avez pas la permission d'effectuer l'action demandée.",
        },
        markAsComplete: 'Marquer comme terminé',
        markAsIncomplete: 'Marquer comme incomplet',
        assigneeError: "Une erreur s'est produite lors de l'attribution de cette tâche. Veuillez essayer un autre assigné.",
        genericCreateTaskFailureMessage: "Une erreur s'est produite lors de la création de cette tâche. Veuillez réessayer plus tard.",
        deleteTask: 'Supprimer la tâche',
        deleteConfirmation: 'Êtes-vous sûr de vouloir supprimer cette tâche ?',
    },
    statementPage: {
        title: function (_a) {
            var year = _a.year, monthName = _a.monthName;
            return "Relev\u00E9 de ".concat(monthName, " ").concat(year);
        },
    },
    keyboardShortcutsPage: {
        title: 'Raccourcis clavier',
        subtitle: 'Gagnez du temps avec ces raccourcis clavier pratiques :',
        shortcuts: {
            openShortcutDialog: 'Ouvre la boîte de dialogue des raccourcis clavier',
            markAllMessagesAsRead: 'Marquer tous les messages comme lus',
            escape: "Boîtes de dialogue d'échappement",
            search: 'Ouvrir la boîte de dialogue de recherche',
            newChat: 'Nouvel écran de chat',
            copy: 'Copier le commentaire',
            openDebug: 'Ouvrir la boîte de dialogue des préférences de test',
        },
    },
    guides: {
        screenShare: "Partage d'écran",
        screenShareRequest: "Expensify vous invite à un partage d'écran",
    },
    search: {
        resultsAreLimited: 'Les résultats de recherche sont limités.',
        viewResults: 'Voir les résultats',
        resetFilters: 'Réinitialiser les filtres',
        searchResults: {
            emptyResults: {
                title: 'Rien à afficher',
                subtitle: "Essayez d'ajuster vos critères de recherche ou de créer quelque chose avec le bouton vert +.",
            },
            emptyExpenseResults: {
                title: "Vous n'avez pas encore créé de dépenses.",
                subtitle: "Créez une dépense ou faites un essai d'Expensify pour en savoir plus.",
                subtitleWithOnlyCreateButton: 'Utilisez le bouton vert ci-dessous pour créer une dépense.',
            },
            emptyReportResults: {
                title: "Vous n'avez pas encore créé de rapports",
                subtitle: 'Créez un rapport ou essayez Expensify pour en savoir plus.',
                subtitleWithOnlyCreateButton: 'Utilisez le bouton vert ci-dessous pour créer un rapport.',
            },
            emptyInvoiceResults: {
                title: "Vous n'avez pas encore créé de factures.",
                subtitle: 'Envoyez une facture ou faites un essai de Expensify pour en savoir plus.',
                subtitleWithOnlyCreateButton: 'Utilisez le bouton vert ci-dessous pour envoyer une facture.',
            },
            emptyTripResults: {
                title: 'Aucun voyage à afficher',
                subtitle: 'Commencez par réserver votre premier voyage ci-dessous.',
                buttonText: 'Réserver un voyage',
            },
            emptySubmitResults: {
                title: 'Aucune dépense à soumettre',
                subtitle: 'Tout est en ordre. Faites un tour de victoire !',
                buttonText: 'Créer un rapport',
            },
            emptyApproveResults: {
                title: 'Aucune dépense à approuver',
                subtitle: 'Zéro dépenses. Détente maximale. Bien joué !',
            },
            emptyPayResults: {
                title: 'Aucune dépense à payer',
                subtitle: "Félicitations ! Vous avez franchi la ligne d'arrivée.",
            },
            emptyExportResults: {
                title: 'Aucune dépense à exporter',
                subtitle: 'Il est temps de se détendre, beau travail.',
            },
            emptyUnapprovedResults: {
                title: 'Aucune dépense à approuver',
                subtitle: 'Zéro dépenses. Détente maximale. Bien joué !',
            },
        },
        unapproved: 'Non approuvé',
        unapprovedCash: 'Espèces non approuvées',
        unapprovedCompanyCards: "Cartes d'entreprise non approuvées",
        saveSearch: 'Enregistrer la recherche',
        deleteSavedSearch: 'Supprimer la recherche enregistrée',
        deleteSavedSearchConfirm: 'Êtes-vous sûr de vouloir supprimer cette recherche ?',
        searchName: 'Rechercher un nom',
        savedSearchesMenuItemTitle: 'Enregistré',
        groupedExpenses: 'dépenses groupées',
        bulkActions: {
            approve: 'Approuver',
            pay: 'Payer',
            delete: 'Supprimer',
            hold: 'Attente',
            unhold: 'Supprimer la suspension',
            noOptionsAvailable: 'Aucune option disponible pour le groupe de dépenses sélectionné.',
        },
        filtersHeader: 'Filtres',
        filters: {
            date: {
                before: function (_a) {
                    var _b = _a === void 0 ? {} : _a, date = _b.date;
                    return "Before ".concat(date !== null && date !== void 0 ? date : '');
                },
                after: function (_a) {
                    var _b = _a === void 0 ? {} : _a, date = _b.date;
                    return "Apr\u00E8s ".concat(date !== null && date !== void 0 ? date : '');
                },
                on: function (_a) {
                    var _b = _a === void 0 ? {} : _a, date = _b.date;
                    return "On ".concat(date !== null && date !== void 0 ? date : '');
                },
                presets: (_7 = {},
                    _7[CONST_1.default.SEARCH.DATE_PRESETS.NEVER] = 'Jamais',
                    _7[CONST_1.default.SEARCH.DATE_PRESETS.LAST_MONTH] = 'Le mois dernier',
                    _7),
            },
            status: 'Statut',
            keyword: 'Mot-clé',
            hasKeywords: 'A des mots-clés',
            currency: 'Devise',
            link: 'Lien',
            pinned: 'Épinglé',
            unread: 'Non lu',
            completed: 'Terminé',
            amount: {
                lessThan: function (_a) {
                    var _b = _a === void 0 ? {} : _a, amount = _b.amount;
                    return "Moins de ".concat(amount !== null && amount !== void 0 ? amount : '');
                },
                greaterThan: function (_a) {
                    var _b = _a === void 0 ? {} : _a, amount = _b.amount;
                    return "Sup\u00E9rieur \u00E0 ".concat(amount !== null && amount !== void 0 ? amount : '');
                },
                between: function (_a) {
                    var greaterThan = _a.greaterThan, lessThan = _a.lessThan;
                    return "Entre ".concat(greaterThan, " et ").concat(lessThan);
                },
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Cartes individuelles',
                closedCards: 'Cartes fermées',
                cardFeeds: 'Flux de cartes',
                cardFeedName: function (_a) {
                    var cardFeedBankName = _a.cardFeedBankName, cardFeedLabel = _a.cardFeedLabel;
                    return "Tout ".concat(cardFeedBankName).concat(cardFeedLabel ? " - ".concat(cardFeedLabel) : '');
                },
                cardFeedNameCSV: function (_a) {
                    var cardFeedLabel = _a.cardFeedLabel;
                    return "Toutes les cartes import\u00E9es CSV".concat(cardFeedLabel ? " - ".concat(cardFeedLabel) : '');
                },
            },
            current: 'Actuel',
            past: 'Passé',
            submitted: 'Date de soumission',
            approved: 'Date approuvée',
            paid: 'Date de paiement',
            exported: 'Date exportée',
            posted: 'Date de publication',
            billable: 'Facturable',
            reimbursable: 'Remboursable',
            groupBy: {
                reports: 'Rapport',
                members: 'Membre',
                cards: 'Carte',
            },
        },
        groupBy: 'Groupe par',
        moneyRequestReport: {
            emptyStateTitle: "Ce rapport n'a pas de dépenses.",
            emptyStateSubtitle: 'Vous pouvez ajouter des dépenses à ce rapport en utilisant le bouton ci-dessus.',
        },
        noCategory: 'Aucune catégorie',
        noTag: 'Aucun tag',
        expenseType: 'Type de dépense',
        recentSearches: 'Recherches récentes',
        recentChats: 'Discussions récentes',
        searchIn: 'Rechercher dans',
        searchPlaceholder: 'Rechercher quelque chose',
        suggestions: 'Suggestions',
        exportSearchResults: {
            title: 'Créer une exportation',
            description: "Wow, ça fait beaucoup d'articles ! Nous allons les regrouper, et Concierge vous enverra un fichier sous peu.",
        },
        exportAll: {
            selectAllMatchingItems: 'Sélectionnez tous les éléments correspondants',
            allMatchingItemsSelected: 'Tous les éléments correspondants sélectionnés',
        },
    },
    genericErrorPage: {
        title: 'Oh-oh, quelque chose a mal tourné !',
        body: {
            helpTextMobile: "Veuillez fermer et rouvrir l'application, ou passer à",
            helpTextWeb: 'web.',
            helpTextConcierge: 'Si le problème persiste, contactez',
        },
        refresh: 'Rafraîchir',
    },
    fileDownload: {
        success: {
            title: 'Téléchargé !',
            message: 'Pièce jointe téléchargée avec succès !',
            qrMessage: 'Vérifiez votre dossier de photos ou de téléchargements pour une copie de votre code QR. Astuce : Ajoutez-le à une présentation pour que votre audience puisse le scanner et se connecter directement avec vous.',
        },
        generalError: {
            title: 'Erreur de pièce jointe',
            message: 'La pièce jointe ne peut pas être téléchargée',
        },
        permissionError: {
            title: 'Accès au stockage',
            message: 'Expensify ne peut pas enregistrer les pièces jointes sans accès au stockage. Appuyez sur paramètres pour mettre à jour les autorisations.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Nouveau Expensify',
        about: 'About New Expensify',
        update: 'Mettre à jour New Expensify',
        checkForUpdates: 'Vérifier les mises à jour',
        toggleDevTools: 'Basculer les outils de développement',
        viewShortcuts: 'Voir les raccourcis clavier',
        services: 'Services',
        hide: 'Masquer New Expensify',
        hideOthers: 'Masquer les autres',
        showAll: 'Afficher tout',
        quit: 'Quitter New Expensify',
        fileMenu: 'Fichier',
        closeWindow: 'Fermer la fenêtre',
        editMenu: 'Modifier',
        undo: 'Annuler',
        redo: 'Refaire',
        cut: 'Couper',
        copy: 'Copier',
        paste: 'Coller',
        pasteAndMatchStyle: 'Coller et adapter le style',
        pasteAsPlainText: 'Coller en tant que texte brut',
        delete: 'Supprimer',
        selectAll: 'Tout sélectionner',
        speechSubmenu: 'Discours',
        startSpeaking: 'Commencer à parler',
        stopSpeaking: 'Arrête de parler',
        viewMenu: 'Voir',
        reload: 'Recharger',
        forceReload: 'Recharger de force',
        resetZoom: 'Taille réelle',
        zoomIn: 'Zoomer',
        zoomOut: 'Dézoomer',
        togglefullscreen: 'Basculer en plein écran',
        historyMenu: 'Historique',
        back: 'Retour',
        forward: 'Transférer',
        windowMenu: 'Fenêtre',
        minimize: 'Minimiser',
        zoom: 'Zoom',
        front: 'Tout amener au premier plan',
        helpMenu: 'Aide',
        learnMore: 'En savoir plus',
        documentation: 'Documentation',
        communityDiscussions: 'Discussions Communautaires',
        searchIssues: 'Rechercher des problèmes',
    },
    historyMenu: {
        forward: 'Transférer',
        back: 'Retour',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Mise à jour disponible',
            message: function (_a) {
                var isSilentUpdating = _a.isSilentUpdating;
                return "La nouvelle version sera bient\u00F4t disponible.".concat(!isSilentUpdating ? 'Nous vous informerons lorsque nous serons prêts à mettre à jour.' : '');
            },
            soundsGood: 'Ça marche',
        },
        notAvailable: {
            title: 'Mise à jour indisponible',
            message: "Aucune mise à jour n'est disponible pour le moment. Veuillez revenir plus tard !",
            okay: "D'accord",
        },
        error: {
            title: 'Échec de la vérification de mise à jour',
            message: "Nous n'avons pas pu vérifier la mise à jour. Veuillez réessayer dans un moment.",
        },
    },
    report: {
        newReport: {
            createReport: 'Créer un rapport',
            chooseWorkspace: 'Choisissez un espace de travail pour ce rapport.',
        },
        genericCreateReportFailureMessage: 'Erreur inattendue lors de la création de ce chat. Veuillez réessayer plus tard.',
        genericAddCommentFailureMessage: 'Erreur inattendue lors de la publication du commentaire. Veuillez réessayer plus tard.',
        genericUpdateReportFieldFailureMessage: 'Erreur inattendue lors de la mise à jour du champ. Veuillez réessayer plus tard.',
        genericUpdateReportNameEditFailureMessage: 'Erreur inattendue lors du renommage du rapport. Veuillez réessayer plus tard.',
        noActivityYet: 'Aucune activité pour le moment',
        actions: {
            type: {
                changeField: function (_a) {
                    var oldValue = _a.oldValue, newValue = _a.newValue, fieldName = _a.fieldName;
                    return "modifi\u00E9 ".concat(fieldName, " de ").concat(oldValue, " \u00E0 ").concat(newValue);
                },
                changeFieldEmpty: function (_a) {
                    var newValue = _a.newValue, fieldName = _a.fieldName;
                    return "chang\u00E9 ".concat(fieldName, " en ").concat(newValue);
                },
                changeReportPolicy: function (_a) {
                    var fromPolicyName = _a.fromPolicyName, toPolicyName = _a.toPolicyName;
                    return "a chang\u00E9 l'espace de travail en ".concat(toPolicyName).concat(fromPolicyName ? "(anciennement ".concat(fromPolicyName, ")") : '');
                },
                changeType: function (_a) {
                    var oldType = _a.oldType, newType = _a.newType;
                    return "chang\u00E9 le type de ".concat(oldType, " \u00E0 ").concat(newType);
                },
                delegateSubmit: function (_a) {
                    var delegateUser = _a.delegateUser, originalManager = _a.originalManager;
                    return "a envoy\u00E9 ce rapport \u00E0 ".concat(delegateUser, " puisque ").concat(originalManager, " est en vacances");
                },
                exportedToCSV: "export\u00E9 en CSV",
                exportedToIntegration: {
                    automatic: function (_a) {
                        var label = _a.label;
                        return "export\u00E9 vers ".concat(label);
                    },
                    automaticActionOne: function (_a) {
                        var label = _a.label;
                        return "export\u00E9 vers ".concat(label, " via");
                    },
                    automaticActionTwo: 'paramètres de comptabilité',
                    manual: function (_a) {
                        var label = _a.label;
                        return "a marqu\u00E9 ce rapport comme export\u00E9 manuellement vers ".concat(label, ".");
                    },
                    automaticActionThree: 'et a créé avec succès un enregistrement pour',
                    reimburseableLink: 'dépenses personnelles',
                    nonReimbursableLink: "dépenses de carte d'entreprise",
                    pending: function (_a) {
                        var label = _a.label;
                        return "a commenc\u00E9 \u00E0 exporter ce rapport vers ".concat(label, "...");
                    },
                },
                integrationsMessage: function (_a) {
                    var errorMessage = _a.errorMessage, label = _a.label, linkText = _a.linkText, linkURL = _a.linkURL;
                    return "\u00E9chec de l'exportation de ce rapport vers ".concat(label, " (\"").concat(errorMessage, " ").concat(linkText ? "<a href=\"".concat(linkURL, "\">").concat(linkText, "</a>") : '', "\")");
                },
                managerAttachReceipt: "a ajout\u00E9 un re\u00E7u",
                managerDetachReceipt: "a supprim\u00E9 un re\u00E7u",
                markedReimbursed: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "pay\u00E9 ".concat(currency).concat(amount, " ailleurs");
                },
                markedReimbursedFromIntegration: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "pay\u00E9 ".concat(currency).concat(amount, " via int\u00E9gration");
                },
                outdatedBankAccount: "n\u2019a pas pu traiter le paiement en raison d\u2019un probl\u00E8me avec le compte bancaire du payeur",
                reimbursementACHBounce: "impossible de traiter le paiement, car le payeur n'a pas suffisamment de fonds",
                reimbursementACHCancelled: "annul\u00E9 le paiement",
                reimbursementAccountChanged: "impossible de traiter le paiement, car le payeur a chang\u00E9 de compte bancaire",
                reimbursementDelayed: "a trait\u00E9 le paiement mais il est retard\u00E9 de 1 \u00E0 2 jours ouvrables suppl\u00E9mentaires",
                selectedForRandomAudit: "s\u00E9lectionn\u00E9 au hasard pour examen",
                selectedForRandomAuditMarkdown: "[s\u00E9lectionn\u00E9 au hasard](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) pour examen",
                share: function (_a) {
                    var to = _a.to;
                    return "membre invit\u00E9 ".concat(to);
                },
                unshare: function (_a) {
                    var to = _a.to;
                    return "membre supprim\u00E9 ".concat(to);
                },
                stripePaid: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "pay\u00E9 ".concat(currency).concat(amount);
                },
                takeControl: "a pris le contr\u00F4le",
                integrationSyncFailed: function (_a) {
                    var label = _a.label, errorMessage = _a.errorMessage, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "Un probl\u00E8me est survenu lors de la synchronisation avec ".concat(label).concat(errorMessage ? " (\"".concat(errorMessage, "\")") : '', ". Veuillez corriger le probl\u00E8me dans les <a href=\"").concat(workspaceAccountingLink, "\">param\u00E8tres de l'espace de travail</a>.");
                },
                addEmployee: function (_a) {
                    var email = _a.email, role = _a.role;
                    return "ajout\u00E9 ".concat(email, " en tant que ").concat(role === 'member' ? 'a' : 'un', " ").concat(role);
                },
                updateRole: function (_a) {
                    var email = _a.email, currentRole = _a.currentRole, newRole = _a.newRole;
                    return "a mis \u00E0 jour le r\u00F4le de ".concat(email, " \u00E0 ").concat(newRole, " (pr\u00E9c\u00E9demment ").concat(currentRole, ")");
                },
                updatedCustomField1: function (_a) {
                    var email = _a.email, previousValue = _a.previousValue, newValue = _a.newValue;
                    if (!newValue) {
                        return "a supprim\u00E9 le champ personnalis\u00E9 1 de ".concat(email, " (pr\u00E9c\u00E9demment \"").concat(previousValue, "\")");
                    }
                    return !previousValue
                        ? "ajout\u00E9 \"".concat(newValue, "\" au champ personnalis\u00E9 1 de ").concat(email)
                        : "a chang\u00E9 le champ personnalis\u00E9 1 de ".concat(email, " en \"").concat(newValue, "\" (pr\u00E9c\u00E9demment \"").concat(previousValue, "\")");
                },
                updatedCustomField2: function (_a) {
                    var email = _a.email, previousValue = _a.previousValue, newValue = _a.newValue;
                    if (!newValue) {
                        return "supprim\u00E9 le champ personnalis\u00E9 2 de ".concat(email, " (pr\u00E9c\u00E9demment \"").concat(previousValue, "\")");
                    }
                    return !previousValue
                        ? "ajout\u00E9 \"".concat(newValue, "\" au champ personnalis\u00E9 2 de ").concat(email)
                        : "a chang\u00E9 le champ personnalis\u00E9 2 de ".concat(email, " en \"").concat(newValue, "\" (auparavant \"").concat(previousValue, "\")");
                },
                leftWorkspace: function (_a) {
                    var nameOrEmail = _a.nameOrEmail;
                    return "".concat(nameOrEmail, " a quitt\u00E9 l'espace de travail");
                },
                removeMember: function (_a) {
                    var email = _a.email, role = _a.role;
                    return "supprim\u00E9 ".concat(role, " ").concat(email);
                },
                removedConnection: function (_a) {
                    var connectionName = _a.connectionName;
                    return "connexion supprim\u00E9e vers ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
                },
                addedConnection: function (_a) {
                    var connectionName = _a.connectionName;
                    return "connect\u00E9 \u00E0 ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
                },
                leftTheChat: 'a quitté le chat',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: function (_a) {
            var summary = _a.summary, dayCount = _a.dayCount, date = _a.date;
            return "".concat(summary, " pour ").concat(dayCount, " ").concat(dayCount === 1 ? 'jour' : 'jours', " jusqu'\u00E0 ").concat(date);
        },
        oooEventSummaryPartialDay: function (_a) {
            var summary = _a.summary, timePeriod = _a.timePeriod, date = _a.date;
            return "".concat(summary, " de ").concat(timePeriod, " le ").concat(date);
        },
    },
    footer: {
        features: 'Fonctionnalités',
        expenseManagement: 'Gestion des dépenses',
        spendManagement: 'Gestion des dépenses',
        expenseReports: 'Rapports de dépenses',
        companyCreditCard: "Carte de crédit d'entreprise",
        receiptScanningApp: 'Application de numérisation de reçus',
        billPay: 'Bill Pay',
        invoicing: 'Facturation',
        CPACard: 'Carte CPA',
        payroll: 'Paie',
        travel: 'Voyage',
        resources: 'Ressources',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Kit de presse',
        support: 'Support',
        expensifyHelp: 'ExpensifyHelp',
        terms: "Conditions d'utilisation",
        privacy: 'Confidentialité',
        learnMore: 'En savoir plus',
        aboutExpensify: "À propos d'Expensify",
        blog: 'Blog',
        jobs: 'Emplois',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relations avec les investisseurs',
        getStarted: 'Commencer',
        createAccount: 'Créer un nouveau compte',
        logIn: 'Se connecter',
    },
    allStates: expensify_common_1.CONST.STATES,
    allCountries: CONST_1.default.ALL_COUNTRIES,
    accessibilityHints: {
        navigateToChatsList: 'Revenir à la liste des discussions',
        chatWelcomeMessage: 'Message de bienvenue du chat',
        navigatesToChat: 'Navigue vers un chat',
        newMessageLineIndicator: 'Indicateur de nouvelle ligne de message',
        chatMessage: 'Message de chat',
        lastChatMessagePreview: 'Aperçu du dernier message de chat',
        workspaceName: "Nom de l'espace de travail",
        chatUserDisplayNames: "Noms d'affichage des membres du chat",
        scrollToNewestMessages: "Faites défiler jusqu'aux messages les plus récents",
        preStyledText: 'Texte pré-stylé',
        viewAttachment: 'Voir la pièce jointe',
    },
    parentReportAction: {
        deletedReport: 'Rapport supprimé',
        deletedMessage: 'Message supprimé',
        deletedExpense: 'Dépense supprimée',
        reversedTransaction: 'Transaction inversée',
        deletedTask: 'Tâche supprimée',
        hiddenMessage: 'Message caché',
    },
    threads: {
        thread: 'Fil de discussion',
        replies: 'Réponses',
        reply: 'Répondre',
        from: 'De',
        in: 'dans',
        parentNavigationSummary: function (_a) {
            var reportName = _a.reportName, workspaceName = _a.workspaceName;
            return "De ".concat(reportName).concat(workspaceName ? "dans ".concat(workspaceName) : '');
        },
    },
    qrCodes: {
        copy: "Copier l'URL",
        copied: 'Copié !',
    },
    moderation: {
        flagDescription: 'Tous les messages signalés seront envoyés à un modérateur pour examen.',
        chooseAReason: 'Choisissez une raison pour signaler ci-dessous :',
        spam: 'Spam',
        spamDescription: 'Promotion hors sujet non sollicitée',
        inconsiderate: 'Inconsidéré',
        inconsiderateDescription: 'Phraséologie insultante ou irrespectueuse, avec des intentions douteuses',
        intimidation: 'Intimidation',
        intimidationDescription: 'Poursuivre agressivement un programme malgré des objections valides',
        bullying: 'Harcèlement',
        bullyingDescription: 'Cibler un individu pour obtenir son obéissance',
        harassment: 'Harcèlement',
        harassmentDescription: 'Comportement raciste, misogyne ou autre comportement largement discriminatoire',
        assault: 'Agression',
        assaultDescription: "Attaque émotionnelle spécifiquement ciblée avec l'intention de nuire",
        flaggedContent: 'Ce message a été signalé comme enfreignant nos règles communautaires et le contenu a été masqué.',
        hideMessage: 'Masquer le message',
        revealMessage: 'Révéler le message',
        levelOneResult: 'Envoie un avertissement anonyme et le message est signalé pour examen.',
        levelTwoResult: 'Message masqué du canal, avec avertissement anonyme et le message est signalé pour examen.',
        levelThreeResult: 'Message supprimé du canal avec un avertissement anonyme et le message est signalé pour examen.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Invitez-les',
        nothing: 'Ne rien faire',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Accepter',
        decline: 'Refuser',
    },
    actionableMentionTrackExpense: {
        submit: "Soumettez-le à quelqu'un",
        categorize: 'Catégorisez-le',
        share: 'Partagez-le avec mon comptable',
        nothing: "Rien pour l'instant",
    },
    teachersUnitePage: {
        teachersUnite: 'Teachers Unite',
        joinExpensifyOrg: 'Rejoignez Expensify.org pour éliminer l\'injustice dans le monde entier. La campagne actuelle "Teachers Unite" soutient les éducateurs partout en partageant les coûts des fournitures scolaires essentielles.',
        iKnowATeacher: 'Je connais un enseignant',
        iAmATeacher: 'Je suis enseignant(e)',
        getInTouch: 'Excellent ! Veuillez partager leurs informations afin que nous puissions les contacter.',
        introSchoolPrincipal: "Présentation à votre directeur d'école",
        schoolPrincipalVerifyExpense: "Expensify.org partage le coût des fournitures scolaires essentielles afin que les élèves de ménages à faible revenu puissent avoir une meilleure expérience d'apprentissage. Votre principal sera invité à vérifier vos dépenses.",
        principalFirstName: 'Prénom du principal',
        principalLastName: 'Nom de famille du principal',
        principalWorkEmail: 'Email professionnel principal',
        updateYourEmail: 'Mettez à jour votre adresse e-mail',
        updateEmail: "Mettre à jour l'adresse e-mail",
        schoolMailAsDefault: function (_a) {
            var contactMethodsRoute = _a.contactMethodsRoute;
            return "Avant de continuer, veuillez vous assurer de d\u00E9finir votre e-mail scolaire comme m\u00E9thode de contact par d\u00E9faut. Vous pouvez le faire dans Param\u00E8tres > Profil > <a href=\"".concat(contactMethodsRoute, "\">M\u00E9thodes de contact</a>.");
        },
        error: {
            enterPhoneEmail: 'Entrez un e-mail ou un numéro de téléphone valide',
            enterEmail: 'Entrez un e-mail',
            enterValidEmail: 'Entrez une adresse e-mail valide',
            tryDifferentEmail: 'Veuillez essayer un autre e-mail',
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
        deleteWaypointConfirmation: 'Êtes-vous sûr de vouloir supprimer ce point de passage ?',
        address: 'Adresse',
        waypointDescription: {
            start: 'Commencer',
            stop: 'Arrêter',
        },
        mapPending: {
            title: 'Carte en attente',
            subtitle: 'La carte sera générée lorsque vous serez de nouveau en ligne.',
            onlineSubtitle: 'Un instant pendant que nous configurons la carte',
            errorTitle: 'Erreur de carte',
            errorSubtitle: "Une erreur s'est produite lors du chargement de la carte. Veuillez réessayer.",
        },
        error: {
            selectSuggestedAddress: "Veuillez sélectionner une adresse suggérée ou utiliser l'emplacement actuel",
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Bulletin perdu ou endommagé',
        nextButtonLabel: 'Suivant',
        reasonTitle: "Pourquoi avez-vous besoin d'une nouvelle carte ?",
        cardDamaged: 'Ma carte a été endommagée',
        cardLostOrStolen: 'Ma carte a été perdue ou volée',
        confirmAddressTitle: "Veuillez confirmer l'adresse postale pour votre nouvelle carte.",
        cardDamagedInfo: "Votre nouvelle carte arrivera dans 2 à 3 jours ouvrables. Votre carte actuelle continuera à fonctionner jusqu'à ce que vous activiez la nouvelle.",
        cardLostOrStolenInfo: 'Votre carte actuelle sera définitivement désactivée dès que votre commande sera passée. La plupart des cartes arrivent en quelques jours ouvrables.',
        address: 'Adresse',
        deactivateCardButton: 'Désactiver la carte',
        shipNewCardButton: 'Expédier une nouvelle carte',
        addressError: "L'adresse est requise",
        reasonError: 'La raison est requise',
        successTitle: 'Ihre neue Karte ist auf dem Weg!',
        successDescription: 'Sie müssen sie aktivieren, sobald sie in wenigen Werktagen ankommt. In der Zwischenzeit ist Ihre virtuelle Karte einsatzbereit.',
    },
    eReceipt: {
        guaranteed: 'eReçu garanti',
        transactionDate: 'Date de transaction',
    },
    referralProgram: (_8 = {},
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT] = {
            buttonText1: 'Démarrer une discussion,',
            buttonText2: 'parrainez un ami.',
            header: 'Démarrer une discussion, recommander un ami',
            body: 'Vous voulez que vos amis utilisent aussi Expensify ? Commencez simplement une discussion avec eux et nous nous occuperons du reste.',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE] = {
            buttonText1: 'Soumettre une dépense,',
            buttonText2: 'parrainez votre patron.',
            header: 'Soumettre une dépense, référer votre patron',
            body: 'Vous voulez que votre patron utilise Expensify aussi ? Soumettez-lui simplement une dépense et nous nous occuperons du reste.',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND] = {
            header: 'Parrainez un ami',
            body: "Vous voulez que vos amis utilisent aussi Expensify ? Discutez, payez ou partagez une dépense avec eux et nous nous occupons du reste. Ou partagez simplement votre lien d'invitation !",
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE] = {
            buttonText: 'Parrainez un ami',
            header: 'Parrainez un ami',
            body: "Vous voulez que vos amis utilisent aussi Expensify ? Discutez, payez ou partagez une dépense avec eux et nous nous occupons du reste. Ou partagez simplement votre lien d'invitation !",
        },
        _8.copyReferralLink = "Copier le lien d'invitation",
        _8),
    systemChatFooterMessage: (_9 = {},
        _9[CONST_1.default.INTRO_CHOICES.MANAGE_TEAM] = {
            phrase1: 'Discutez avec votre spécialiste de configuration en',
            phrase2: "pour obtenir de l'aide",
        },
        _9.default = {
            phrase1: 'Message',
            phrase2: "pour obtenir de l'aide avec la configuration",
        },
        _9),
    violations: {
        allTagLevelsRequired: 'Tous les tags requis',
        autoReportedRejectedExpense: function (_a) {
            var rejectReason = _a.rejectReason, rejectedBy = _a.rejectedBy;
            return "".concat(rejectedBy, " a rejet\u00E9 cette d\u00E9pense avec le commentaire \"").concat(rejectReason, "\"");
        },
        billableExpense: "Facturable n'est plus valide",
        cashExpenseWithNoReceipt: function (_a) {
            var _b = _a === void 0 ? {} : _a, formattedLimit = _b.formattedLimit;
            return "Receipt required".concat(formattedLimit ? "au-del\u00E0 de ".concat(formattedLimit) : '');
        },
        categoryOutOfPolicy: 'Catégorie non valide',
        conversionSurcharge: function (_a) {
            var surcharge = _a.surcharge;
            return "Surcharge de conversion de ".concat(surcharge, "% appliqu\u00E9");
        },
        customUnitOutOfPolicy: 'Tarif non valide pour cet espace de travail',
        duplicatedTransaction: 'Duplicate',
        fieldRequired: 'Les champs du rapport sont obligatoires',
        futureDate: 'Date future non autorisée',
        invoiceMarkup: function (_a) {
            var invoiceMarkup = _a.invoiceMarkup;
            return "Major\u00E9 de ".concat(invoiceMarkup, "%");
        },
        maxAge: function (_a) {
            var maxAge = _a.maxAge;
            return "Date ant\u00E9rieure \u00E0 ".concat(maxAge, " jours");
        },
        missingCategory: 'Catégorie manquante',
        missingComment: 'Description requise pour la catégorie sélectionnée',
        missingTag: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "Manquant ".concat(tagName !== null && tagName !== void 0 ? tagName : 'tag');
        },
        modifiedAmount: function (_a) {
            var type = _a.type, displayPercentVariance = _a.displayPercentVariance;
            switch (type) {
                case 'distance':
                    return 'Le montant diffère de la distance calculée';
                case 'card':
                    return 'Montant supérieur à la transaction par carte';
                default:
                    if (displayPercentVariance) {
                        return "Montant ".concat(displayPercentVariance, "% sup\u00E9rieur au re\u00E7u scann\u00E9");
                    }
                    return 'Montant supérieur au reçu scanné';
            }
        },
        modifiedDate: 'La date diffère du reçu scanné',
        nonExpensiworksExpense: 'Dépense non-Expensiworks',
        overAutoApprovalLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "La d\u00E9pense d\u00E9passe la limite d'approbation automatique de ".concat(formattedLimit);
        },
        overCategoryLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Montant sup\u00E9rieur \u00E0 ".concat(formattedLimit, "/limite de cat\u00E9gorie par personne");
        },
        overLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Montant au-del\u00E0 de la limite de ".concat(formattedLimit, "/personne");
        },
        overLimitAttendee: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Montant au-del\u00E0 de la limite de ".concat(formattedLimit, "/personne");
        },
        perDayLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Montant d\u00E9passant la limite quotidienne de ".concat(formattedLimit, "/personne pour la cat\u00E9gorie");
        },
        receiptNotSmartScanned: 'Détails de la dépense et reçu ajoutés manuellement. Veuillez vérifier les détails. <a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">En savoir plus</a> sur l\'audit automatique pour tous les reçus.',
        receiptRequired: function (_a) {
            var formattedLimit = _a.formattedLimit, category = _a.category;
            var message = 'Reçu requis';
            if (formattedLimit !== null && formattedLimit !== void 0 ? formattedLimit : category) {
                message += 'terminé';
                if (formattedLimit) {
                    message += " ".concat(formattedLimit);
                }
                if (category) {
                    message += 'limite de catégorie';
                }
            }
            return message;
        },
        prohibitedExpense: function (_a) {
            var prohibitedExpenseType = _a.prohibitedExpenseType;
            var preMessage = 'Dépense interdite :';
            switch (prohibitedExpenseType) {
                case 'alcohol':
                    return "".concat(preMessage, " alcool");
                case 'gambling':
                    return "".concat(preMessage, " jeu d'argent");
                case 'tobacco':
                    return "".concat(preMessage, " tabac");
                case 'adultEntertainment':
                    return "".concat(preMessage, " divertissement pour adultes");
                case 'hotelIncidentals':
                    return "".concat(preMessage, " frais accessoires d'h\u00F4tel");
                default:
                    return "".concat(preMessage).concat(prohibitedExpenseType);
            }
        },
        customRules: function (_a) {
            var message = _a.message;
            return message;
        },
        reviewRequired: 'Examen requis',
        rter: function (_a) {
            var brokenBankConnection = _a.brokenBankConnection, email = _a.email, isAdmin = _a.isAdmin, isTransactionOlderThan7Days = _a.isTransactionOlderThan7Days, member = _a.member, rterType = _a.rterType;
            if (rterType === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return "Impossible de faire correspondre automatiquement le reçu en raison d'une connexion bancaire défectueuse.";
            }
            if (brokenBankConnection || rterType === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? "Impossible de faire correspondre automatiquement le re\u00E7u en raison d'une connexion bancaire d\u00E9fectueuse que ".concat(email, " doit corriger.")
                    : "Impossible de faire correspondre automatiquement le reçu en raison d'une connexion bancaire défectueuse que vous devez réparer.";
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? "Demandez \u00E0 ".concat(member, " de marquer comme esp\u00E8ce ou attendez 7 jours et r\u00E9essayez") : 'En attente de fusion avec la transaction par carte.';
            }
            return '';
        },
        brokenConnection530Error: "Reçu en attente en raison d'une connexion bancaire interrompue",
        adminBrokenConnectionError: "Reçu en attente en raison d'une connexion bancaire défaillante. Veuillez résoudre dans",
        memberBrokenConnectionError: "Reçu en attente en raison d'une connexion bancaire défectueuse. Veuillez demander à un administrateur de l'espace de travail de résoudre le problème.",
        markAsCashToIgnore: 'Marquer comme espèce pour ignorer et demander un paiement.',
        smartscanFailed: function (_a) {
            var _b = _a.canEdit, canEdit = _b === void 0 ? true : _b;
            return "\u00C9chec de la num\u00E9risation du re\u00E7u.".concat(canEdit ? 'Saisir les détails manuellement.' : '');
        },
        receiptGeneratedWithAI: 'Reçu potentiellement généré par IA',
        someTagLevelsRequired: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "Missing ".concat(tagName !== null && tagName !== void 0 ? tagName : 'Tag');
        },
        tagOutOfPolicy: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "".concat(tagName !== null && tagName !== void 0 ? tagName : 'Tag', " n'est plus valide");
        },
        taxAmountChanged: 'Le montant de la taxe a été modifié',
        taxOutOfPolicy: function (_a) {
            var _b = _a === void 0 ? {} : _a, taxName = _b.taxName;
            return "".concat(taxName !== null && taxName !== void 0 ? taxName : 'Taxe', " n'est plus valide");
        },
        taxRateChanged: 'Le taux de taxe a été modifié',
        taxRequired: 'Taux de taxe manquant',
        none: 'Aucun',
        taxCodeToKeep: 'Choisissez le code fiscal à conserver',
        tagToKeep: 'Choisissez quelle balise conserver',
        isTransactionReimbursable: 'Choisissez si la transaction est remboursable',
        merchantToKeep: 'Choisissez quel commerçant conserver',
        descriptionToKeep: 'Choisissez quelle description conserver',
        categoryToKeep: 'Choisissez quelle catégorie conserver',
        isTransactionBillable: 'Choisissez si la transaction est facturable',
        keepThisOne: 'Keep this one',
        confirmDetails: "Confirmez les d\u00E9tails que vous conservez",
        confirmDuplicatesInfo: "Les demandes en double que vous ne conservez pas seront conserv\u00E9es pour que le membre les supprime.",
        hold: 'Cette dépense a été mise en attente',
        resolvedDuplicates: 'résolu le doublon',
    },
    reportViolations: (_10 = {},
        _10[CONST_1.default.REPORT_VIOLATIONS.FIELD_REQUIRED] = function (_a) {
            var fieldName = _a.fieldName;
            return "".concat(fieldName, " est requis");
        },
        _10),
    violationDismissal: {
        rter: {
            manual: 'a marqué ce reçu comme espèces',
        },
        duplicatedTransaction: {
            manual: 'résolu le doublon',
        },
    },
    videoPlayer: {
        play: 'Jouer',
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
            title: 'Veuillez nous dire pourquoi vous partez',
            subtitle: 'Avant de partir, veuillez nous dire pourquoi vous souhaitez passer à Expensify Classic.',
        },
        reasons: (_11 = {},
            _11[CONST_1.default.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE] = "J'ai besoin d'une fonctionnalité qui n'est disponible que dans Expensify Classic.",
            _11[CONST_1.default.EXIT_SURVEY.REASONS.DONT_UNDERSTAND] = 'Je ne comprends pas comment utiliser New Expensify.',
            _11[CONST_1.default.EXIT_SURVEY.REASONS.PREFER_CLASSIC] = 'Je comprends comment utiliser New Expensify, mais je préfère Expensify Classic.',
            _11),
        prompts: (_12 = {},
            _12[CONST_1.default.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE] = 'Quelle fonctionnalité vous manque-t-il dans le nouveau Expensify ?',
            _12[CONST_1.default.EXIT_SURVEY.REASONS.DONT_UNDERSTAND] = 'Que cherchez-vous à faire ?',
            _12[CONST_1.default.EXIT_SURVEY.REASONS.PREFER_CLASSIC] = 'Pourquoi préférez-vous Expensify Classic ?',
            _12),
        responsePlaceholder: 'Votre réponse',
        thankYou: 'Merci pour le retour !',
        thankYouSubtitle: 'Vos réponses nous aideront à créer un meilleur produit pour accomplir les tâches. Merci beaucoup !',
        goToExpensifyClassic: 'Passer à Expensify Classic',
        offlineTitle: 'On dirait que vous êtes coincé ici...',
        offline: 'Vous semblez être hors ligne. Malheureusement, Expensify Classic ne fonctionne pas hors ligne, mais New Expensify le fait. Si vous préférez utiliser Expensify Classic, réessayez lorsque vous aurez une connexion Internet.',
        quickTip: 'Petit conseil...',
        quickTipSubTitle: 'Vous pouvez accéder directement à Expensify Classic en visitant expensify.com. Ajoutez-le à vos favoris pour un raccourci facile !',
        bookACall: 'Réserver un appel',
        noThanks: 'Non merci',
        bookACallTitle: 'Souhaitez-vous parler à un chef de produit ?',
        benefits: (_13 = {},
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY] = 'Discussion directe sur les dépenses et les rapports',
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE] = 'Possibilité de tout faire sur mobile',
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE] = 'Voyage et dépenses à la vitesse du chat',
            _13),
        bookACallTextTop: 'En passant à Expensify Classic, vous manquerez :',
        bookACallTextBottom: "Nous serions ravis de vous appeler pour comprendre pourquoi. Vous pouvez réserver un appel avec l'un de nos chefs de produit senior pour discuter de vos besoins.",
        takeMeToExpensifyClassic: 'Emmenez-moi à Expensify Classic',
    },
    listBoundary: {
        errorMessage: "Une erreur s'est produite lors du chargement de plus de messages",
        tryAgain: 'Réessayez',
    },
    systemMessage: {
        mergedWithCashTransaction: 'a associé un reçu à cette transaction',
    },
    subscription: {
        authenticatePaymentCard: 'Authentifier la carte de paiement',
        mobileReducedFunctionalityMessage: "Vous ne pouvez pas apporter de modifications à votre abonnement dans l'application mobile.",
        badge: {
            freeTrial: function (_a) {
                var numOfDays = _a.numOfDays;
                return "Essai gratuit : ".concat(numOfDays, " ").concat(numOfDays === 1 ? 'jour' : 'jours', " restants");
            },
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Vos informations de paiement sont obsolètes.',
                subtitle: function (_a) {
                    var date = _a.date;
                    return "Mettez \u00E0 jour votre carte de paiement avant le ".concat(date, " pour continuer \u00E0 utiliser toutes vos fonctionnalit\u00E9s pr\u00E9f\u00E9r\u00E9es.");
                },
            },
            policyOwnerAmountOwedOverdue: {
                title: "Votre paiement n'a pas pu être traité",
                subtitle: function (_a) {
                    var date = _a.date, purchaseAmountOwed = _a.purchaseAmountOwed;
                    return date && purchaseAmountOwed
                        ? "Votre charge du ".concat(date, " de ").concat(purchaseAmountOwed, " n'a pas pu \u00EAtre trait\u00E9e. Veuillez ajouter une carte de paiement pour r\u00E9gler le montant d\u00FB.")
                        : 'Veuillez ajouter une carte de paiement pour régler le montant dû.';
                },
            },
            policyOwnerUnderInvoicing: {
                title: 'Vos informations de paiement sont obsolètes.',
                subtitle: function (_a) {
                    var date = _a.date;
                    return "Votre paiement est en retard. Veuillez r\u00E9gler votre facture avant le ".concat(date, " pour \u00E9viter une interruption de service.");
                },
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Vos informations de paiement sont obsolètes.',
                subtitle: 'Votre paiement est en retard. Veuillez régler votre facture.',
            },
            billingDisputePending: {
                title: "Votre carte n'a pas pu être débitée",
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed, cardEnding = _a.cardEnding;
                    return "Vous avez contest\u00E9 le d\u00E9bit de ".concat(amountOwed, " sur la carte se terminant par ").concat(cardEnding, ". Votre compte sera verrouill\u00E9 jusqu'\u00E0 ce que le litige soit r\u00E9solu avec votre banque.");
                },
            },
            cardAuthenticationRequired: {
                title: "Votre carte n'a pas pu être débitée",
                subtitle: function (_a) {
                    var cardEnding = _a.cardEnding;
                    return "Votre carte de paiement n'a pas \u00E9t\u00E9 enti\u00E8rement authentifi\u00E9e. Veuillez compl\u00E9ter le processus d'authentification pour activer votre carte de paiement se terminant par ".concat(cardEnding, ".");
                },
            },
            insufficientFunds: {
                title: "Votre carte n'a pas pu être débitée",
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed;
                    return "Votre carte de paiement a \u00E9t\u00E9 refus\u00E9e en raison de fonds insuffisants. Veuillez r\u00E9essayer ou ajouter une nouvelle carte de paiement pour r\u00E9gler votre solde impay\u00E9 de ".concat(amountOwed, ".");
                },
            },
            cardExpired: {
                title: "Votre carte n'a pas pu être débitée",
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed;
                    return "Votre carte de paiement a expir\u00E9. Veuillez ajouter une nouvelle carte de paiement pour r\u00E9gler votre solde impay\u00E9 de ".concat(amountOwed, ".");
                },
            },
            cardExpireSoon: {
                title: 'Votre carte expire bientôt',
                subtitle: 'Votre carte de paiement expirera à la fin de ce mois. Cliquez sur le menu à trois points ci-dessous pour la mettre à jour et continuer à utiliser toutes vos fonctionnalités préférées.',
            },
            retryBillingSuccess: {
                title: 'Succès !',
                subtitle: 'Votre carte a été débitée avec succès.',
            },
            retryBillingError: {
                title: "Votre carte n'a pas pu être débitée",
                subtitle: "Avant de réessayer, veuillez appeler directement votre banque pour autoriser les frais Expensify et supprimer toute retenue. Sinon, essayez d'ajouter une autre carte de paiement.",
            },
            cardOnDispute: function (_a) {
                var amountOwed = _a.amountOwed, cardEnding = _a.cardEnding;
                return "Vous avez contest\u00E9 le d\u00E9bit de ".concat(amountOwed, " sur la carte se terminant par ").concat(cardEnding, ". Votre compte sera verrouill\u00E9 jusqu'\u00E0 ce que le litige soit r\u00E9solu avec votre banque.");
            },
            preTrial: {
                title: 'Commencer un essai gratuit',
                subtitleStart: 'Comme prochaine étape,',
                subtitleLink: 'complétez votre liste de vérification de configuration',
                subtitleEnd: 'afin que votre équipe puisse commencer à soumettre des notes de frais.',
            },
            trialStarted: {
                title: function (_a) {
                    var numOfDays = _a.numOfDays;
                    return "Essai : ".concat(numOfDays, " ").concat(numOfDays === 1 ? 'jour' : 'jours', " restants !");
                },
                subtitle: 'Ajoutez une carte de paiement pour continuer à utiliser toutes vos fonctionnalités préférées.',
            },
            trialEnded: {
                title: 'Votre essai gratuit est terminé',
                subtitle: 'Ajoutez une carte de paiement pour continuer à utiliser toutes vos fonctionnalités préférées.',
            },
            earlyDiscount: {
                claimOffer: "Réclamer l'offre",
                noThanks: 'Non merci',
                subscriptionPageTitle: function (_a) {
                    var discountType = _a.discountType;
                    return "<strong>".concat(discountType, "% de r\u00E9duction sur votre premi\u00E8re ann\u00E9e !</strong> Ajoutez simplement une carte de paiement et commencez un abonnement annuel.");
                },
                onboardingChatTitle: function (_a) {
                    var discountType = _a.discountType;
                    return "Offre \u00E0 dur\u00E9e limit\u00E9e : ".concat(discountType, "% de r\u00E9duction sur votre premi\u00E8re ann\u00E9e !");
                },
                subtitle: function (_a) {
                    var days = _a.days, hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds;
                    return "R\u00E9clamer dans ".concat(days > 0 ? "".concat(days, "j :") : '').concat(hours, "h : ").concat(minutes, "m : ").concat(seconds, "s");
                },
            },
        },
        cardSection: {
            title: 'Paiement',
            subtitle: 'Ajoutez une carte pour payer votre abonnement Expensify.',
            addCardButton: 'Ajouter une carte de paiement',
            cardNextPayment: function (_a) {
                var nextPaymentDate = _a.nextPaymentDate;
                return "Votre prochaine date de paiement est le ".concat(nextPaymentDate, ".");
            },
            cardEnding: function (_a) {
                var cardNumber = _a.cardNumber;
                return "Carte se terminant par ".concat(cardNumber);
            },
            cardInfo: function (_a) {
                var name = _a.name, expiration = _a.expiration, currency = _a.currency;
                return "Nom : ".concat(name, ", Expiration : ").concat(expiration, ", Devise : ").concat(currency);
            },
            changeCard: 'Changer la carte de paiement',
            changeCurrency: 'Changer la devise de paiement',
            cardNotFound: 'Aucune carte de paiement ajoutée',
            retryPaymentButton: 'Réessayer le paiement',
            authenticatePayment: 'Authentifier le paiement',
            requestRefund: 'Demander un remboursement',
            requestRefundModal: {
                full: "Obtenir un remboursement est facile, il suffit de rétrograder votre compte avant votre prochaine date de facturation et vous recevrez un remboursement. <br /> <br /> Attention : La rétrogradation de votre compte entraînera la suppression de votre/vos espace(s) de travail. Cette action est irréversible, mais vous pouvez toujours créer un nouvel espace de travail si vous changez d'avis.",
                confirm: 'Supprimer le(s) espace(s) de travail et rétrograder',
            },
            viewPaymentHistory: "Voir l'historique des paiements",
        },
        yourPlan: {
            title: 'Votre plan',
            exploreAllPlans: 'Explorez tous les forfaits',
            customPricing: 'Tarification personnalisée',
            asLowAs: function (_a) {
                var price = _a.price;
                return "\u00E0 partir de ".concat(price, " par membre actif/mois");
            },
            pricePerMemberMonth: function (_a) {
                var price = _a.price;
                return "".concat(price, " par membre/mois");
            },
            pricePerMemberPerMonth: function (_a) {
                var price = _a.price;
                return "".concat(price, " par membre par mois");
            },
            perMemberMonth: 'par membre/mois',
            collect: {
                title: 'Collecter',
                description: 'Le plan pour petites entreprises qui vous offre la gestion des dépenses, des voyages et le chat.',
                priceAnnual: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "De ".concat(lower, "/membre actif avec la carte Expensify, ").concat(upper, "/membre actif sans la carte Expensify.");
                },
                pricePayPerUse: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "De ".concat(lower, "/membre actif avec la carte Expensify, ").concat(upper, "/membre actif sans la carte Expensify.");
                },
                benefit1: 'Numérisation de reçus',
                benefit2: 'Remboursements',
                benefit3: "Gestion des cartes d'entreprise",
                benefit4: 'Approbations de dépenses et de voyages',
                benefit5: 'Réservation de voyage et règles',
                benefit6: 'Intégrations QuickBooks/Xero',
                benefit7: 'Discuter des dépenses, des rapports et des salles',
                benefit8: 'Assistance AI et humaine',
            },
            control: {
                title: 'Contrôle',
                description: 'Dépenses, voyages et discussions pour les grandes entreprises.',
                priceAnnual: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "De ".concat(lower, "/membre actif avec la carte Expensify, ").concat(upper, "/membre actif sans la carte Expensify.");
                },
                pricePayPerUse: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "De ".concat(lower, "/membre actif avec la carte Expensify, ").concat(upper, "/membre actif sans la carte Expensify.");
                },
                benefit1: 'Tout dans le plan Collect',
                benefit2: "Flux de travail d'approbation à plusieurs niveaux",
                benefit3: 'Règles de dépenses personnalisées',
                benefit4: 'Intégrations ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Intégrations RH (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Informations et rapports personnalisés',
                benefit8: 'Budgétisation',
            },
            thisIsYourCurrentPlan: "C'est votre plan actuel",
            downgrade: 'Rétrograder vers Collect',
            upgrade: 'Passer à Control',
            addMembers: 'Ajouter des membres',
            saveWithExpensifyTitle: 'Économisez avec la carte Expensify',
            saveWithExpensifyDescription: "Utilisez notre calculateur d'économies pour voir comment le cashback de la carte Expensify peut réduire votre facture Expensify.",
            saveWithExpensifyButton: 'En savoir plus',
        },
        compareModal: {
            comparePlans: 'Comparer les forfaits',
            unlockTheFeatures: 'Débloquez les fonctionnalités dont vous avez besoin avec le plan qui vous convient.',
            viewOurPricing: 'Consultez notre page de tarification',
            forACompleteFeatureBreakdown: 'pour un aperçu complet des fonctionnalités de chacun de nos plans.',
        },
        details: {
            title: "Détails de l'abonnement",
            annual: 'Abonnement annuel',
            taxExempt: "Demander le statut d'exonération fiscale",
            taxExemptEnabled: "Exonéré d'impôt",
            taxExemptStatus: "Statut d'exonération fiscale",
            payPerUse: "Paiement à l'utilisation",
            subscriptionSize: "Taille de l'abonnement",
            headsUp: 'Attention : Si vous ne définissez pas la taille de votre abonnement maintenant, nous la définirons automatiquement en fonction du nombre de membres actifs de votre premier mois. Vous serez alors engagé à payer pour au moins ce nombre de membres pendant les 12 prochains mois. Vous pouvez augmenter la taille de votre abonnement à tout moment, mais vous ne pouvez pas la diminuer avant la fin de votre abonnement.',
            zeroCommitment: "Aucun engagement au tarif d'abonnement annuel réduit",
        },
        subscriptionSize: {
            title: "Taille de l'abonnement",
            yourSize: "La taille de votre abonnement est le nombre de places disponibles qui peuvent être occupées par tout membre actif au cours d'un mois donné.",
            eachMonth: "Chaque mois, votre abonnement couvre jusqu'au nombre de membres actifs défini ci-dessus. Chaque fois que vous augmentez la taille de votre abonnement, vous commencerez un nouvel abonnement de 12 mois à cette nouvelle taille.",
            note: "Remarque : Un membre actif est toute personne qui a créé, modifié, soumis, approuvé, remboursé ou exporté des données de dépenses liées à l'espace de travail de votre entreprise.",
            confirmDetails: 'Confirmez les détails de votre nouvel abonnement annuel :',
            subscriptionSize: "Taille de l'abonnement",
            activeMembers: function (_a) {
                var size = _a.size;
                return "".concat(size, " membres actifs/mois");
            },
            subscriptionRenews: "Renouvellement de l'abonnement",
            youCantDowngrade: 'Vous ne pouvez pas rétrograder pendant votre abonnement annuel.',
            youAlreadyCommitted: function (_a) {
                var size = _a.size, date = _a.date;
                return "Vous vous \u00EAtes d\u00E9j\u00E0 engag\u00E9 \u00E0 un abonnement annuel de ".concat(size, " membres actifs par mois jusqu'au ").concat(date, ". Vous pouvez passer \u00E0 un abonnement \u00E0 l'utilisation le ").concat(date, " en d\u00E9sactivant le renouvellement automatique.");
            },
            error: {
                size: "Veuillez entrer une taille d'abonnement valide",
                sameSize: 'Veuillez entrer un nombre différent de la taille actuelle de votre abonnement',
            },
        },
        paymentCard: {
            addPaymentCard: 'Ajouter une carte de paiement',
            enterPaymentCardDetails: 'Entrez les détails de votre carte de paiement',
            security: 'Expensify est conforme à la norme PCI-DSS, utilise un cryptage de niveau bancaire et utilise une infrastructure redondante pour protéger vos données.',
            learnMoreAboutSecurity: 'En savoir plus sur notre sécurité.',
        },
        subscriptionSettings: {
            title: "Paramètres d'abonnement",
            summary: function (_a) {
                var subscriptionType = _a.subscriptionType, subscriptionSize = _a.subscriptionSize, autoRenew = _a.autoRenew, autoIncrease = _a.autoIncrease;
                return "Type d'abonnement : ".concat(subscriptionType, ", Taille de l'abonnement : ").concat(subscriptionSize, ", Renouvellement automatique : ").concat(autoRenew, ", Augmentation automatique des si\u00E8ges annuels : ").concat(autoIncrease);
            },
            none: 'aucun',
            on: 'sur',
            off: 'désactivé',
            annual: 'Annuel',
            autoRenew: 'Renouvellement automatique',
            autoIncrease: 'Augmenter automatiquement les sièges annuels',
            saveUpTo: function (_a) {
                var amountWithCurrency = _a.amountWithCurrency;
                return "\u00C9conomisez jusqu'\u00E0 ".concat(amountWithCurrency, "/mois par membre actif");
            },
            automaticallyIncrease: 'Augmentez automatiquement vos sièges annuels pour accueillir les membres actifs qui dépassent la taille de votre abonnement. Remarque : Cela prolongera la date de fin de votre abonnement annuel.',
            disableAutoRenew: 'Désactiver le renouvellement automatique',
            helpUsImprove: 'Aidez-nous à améliorer Expensify',
            whatsMainReason: 'Quelle est la principale raison pour laquelle vous désactivez le renouvellement automatique ?',
            renewsOn: function (_a) {
                var date = _a.date;
                return "Renouvelle le ".concat(date, ".");
            },
            pricingConfiguration: 'Les tarifs dépendent de la configuration. Pour le prix le plus bas, choisissez un abonnement annuel et obtenez la carte Expensify.',
            learnMore: {
                part1: 'En savoir plus sur notre',
                pricingPage: 'page de tarification',
                part2: 'ou discutez avec notre équipe dans votre',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: 'Prix estimé',
            changesBasedOn: "Cela change en fonction de votre utilisation de la carte Expensify et des options d'abonnement ci-dessous.",
        },
        requestEarlyCancellation: {
            title: 'Demander une annulation anticipée',
            subtitle: 'Quelle est la principale raison pour laquelle vous demandez une annulation anticipée ?',
            subscriptionCanceled: {
                title: 'Abonnement annulé',
                subtitle: 'Votre abonnement annuel a été annulé.',
                info: "Si vous souhaitez continuer à utiliser votre/vos espace(s) de travail sur une base de paiement à l'utilisation, vous êtes prêt.",
                preventFutureActivity: {
                    part1: 'Si vous souhaitez éviter toute activité et frais futurs, vous devez',
                    link: 'supprimer votre/vos espace(s) de travail',
                    part2: '. Notez que lorsque vous supprimez votre(vos) espace(s) de travail, vous serez facturé pour toute activité en cours qui a été engagée au cours du mois civil en cours.',
                },
            },
            requestSubmitted: {
                title: 'Demande soumise',
                subtitle: {
                    part1: "Merci de nous avoir informés de votre intérêt pour l'annulation de votre abonnement. Nous examinons votre demande et vous contacterons bientôt via votre chat avec",
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: "En demandant une annulation anticip\u00E9e, je reconnais et accepte qu'Expensify n'a aucune obligation d'acc\u00E9der \u00E0 cette demande en vertu d'Expensify.<a href=".concat(CONST_1.default.OLD_DOT_PUBLIC_URLS.TERMS_URL, ">Conditions d'utilisation</a>ou tout autre accord de services applicable entre moi et Expensify et qu'Expensify conserve l'enti\u00E8re discr\u00E9tion quant \u00E0 l'octroi de toute demande de ce type."),
        },
    },
    feedbackSurvey: {
        tooLimited: 'La fonctionnalité doit être améliorée',
        tooExpensive: 'Trop cher',
        inadequateSupport: 'Support client insuffisant',
        businessClosing: "Fermeture, réduction d'effectifs ou acquisition de l'entreprise",
        additionalInfoTitle: 'Quel logiciel utilisez-vous et pourquoi ?',
        additionalInfoInputLabel: 'Votre réponse',
    },
    roomChangeLog: {
        updateRoomDescription: 'définir la description de la salle sur :',
        clearRoomDescription: 'effacé la description de la salle',
    },
    delegate: {
        switchAccount: 'Changer de compte :',
        copilotDelegatedAccess: 'Copilot : Accès délégué',
        copilotDelegatedAccessDescription: "Autoriser d'autres membres à accéder à votre compte.",
        addCopilot: 'Ajouter copilote',
        membersCanAccessYourAccount: 'Ces membres peuvent accéder à votre compte :',
        youCanAccessTheseAccounts: 'Vous pouvez accéder à ces comptes via le sélecteur de compte :',
        role: function (_a) {
            var _b = _a === void 0 ? {} : _a, role = _b.role;
            switch (role) {
                case CONST_1.default.DELEGATE_ROLE.ALL:
                    return 'Complet';
                case CONST_1.default.DELEGATE_ROLE.SUBMITTER:
                    return 'Limité';
                default:
                    return '';
            }
        },
        genericError: "Oups, quelque chose s'est mal passé. Veuillez réessayer.",
        onBehalfOfMessage: function (_a) {
            var delegator = _a.delegator;
            return "au nom de ".concat(delegator);
        },
        accessLevel: "Niveau d'accès",
        confirmCopilot: 'Confirmez votre copilote ci-dessous.',
        accessLevelDescription: "Choisissez un niveau d'accès ci-dessous. Les accès Complet et Limité permettent aux copilotes de voir toutes les conversations et dépenses.",
        roleDescription: function (_a) {
            var _b = _a === void 0 ? {} : _a, role = _b.role;
            switch (role) {
                case CONST_1.default.DELEGATE_ROLE.ALL:
                    return 'Autoriser un autre membre à effectuer toutes les actions sur votre compte, en votre nom. Inclut le chat, les soumissions, les approbations, les paiements, les mises à jour des paramètres, et plus encore.';
                case CONST_1.default.DELEGATE_ROLE.SUBMITTER:
                    return 'Autoriser un autre membre à effectuer la plupart des actions sur votre compte, en votre nom. Exclut les approbations, paiements, rejets et blocages.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Supprimer copilot',
        removeCopilotConfirmation: 'Êtes-vous sûr de vouloir supprimer ce copilote ?',
        changeAccessLevel: "Modifier le niveau d'accès",
        makeSureItIsYou: "Assurons-nous que c'est bien vous",
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Veuillez entrer le code magique envoy\u00E9 \u00E0 ".concat(contactMethod, " pour ajouter un copilote. Il devrait arriver d'ici une \u00E0 deux minutes.");
        },
        enterMagicCodeUpdate: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Veuillez entrer le code magique envoy\u00E9 \u00E0 ".concat(contactMethod, " pour mettre \u00E0 jour votre copilote.");
        },
        notAllowed: 'Pas si vite...',
        noAccessMessage: "En tant que copilote, vous n'avez pas accès à cette page. Désolé !",
        notAllowedMessageStart: "En tant que",
        notAllowedMessageHyperLinked: 'copilot',
        notAllowedMessageEnd: function (_a) {
            var accountOwnerEmail = _a.accountOwnerEmail;
            return "pour ".concat(accountOwnerEmail, ", vous n'avez pas la permission d'effectuer cette action. D\u00E9sol\u00E9 !");
        },
        copilotAccess: 'Accès Copilot',
    },
    debug: {
        debug: 'Déboguer',
        details: 'Détails',
        JSON: 'JSON',
        reportActions: 'Actions',
        reportActionPreview: 'Aperçu',
        nothingToPreview: 'Rien à prévisualiser',
        editJson: 'Modifier JSON :',
        preview: 'Aperçu :',
        missingProperty: function (_a) {
            var propertyName = _a.propertyName;
            return "".concat(propertyName, " manquant");
        },
        invalidProperty: function (_a) {
            var propertyName = _a.propertyName, expectedType = _a.expectedType;
            return "Propri\u00E9t\u00E9 invalide : ".concat(propertyName, " - Attendu : ").concat(expectedType);
        },
        invalidValue: function (_a) {
            var expectedValues = _a.expectedValues;
            return "Valeur invalide - Attendu : ".concat(expectedValues);
        },
        missingValue: 'Valeur manquante',
        createReportAction: 'Créer une action de rapport',
        reportAction: "Signaler l'action",
        report: 'Rapport',
        transaction: 'Transaction',
        violations: 'Violations',
        transactionViolation: 'Violation de transaction',
        hint: 'Les modifications de données ne seront pas envoyées au backend.',
        textFields: 'Champs de texte',
        numberFields: 'Champs numériques',
        booleanFields: 'Champs booléens',
        constantFields: 'Champs constants',
        dateTimeFields: 'Champs DateTime',
        date: 'Date',
        time: 'Temps',
        none: 'Aucun',
        visibleInLHN: 'Visible dans le LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: 'false',
        viewReport: 'Voir le rapport',
        viewTransaction: 'Voir la transaction',
        createTransactionViolation: 'Créer une violation de transaction',
        reasonVisibleInLHN: {
            hasDraftComment: 'A un commentaire brouillon',
            hasGBR: 'Has GBR',
            hasRBR: 'Has RBR',
            pinnedByUser: 'Épinglé par un membre',
            hasIOUViolations: 'A des violations de dette (IOU)',
            hasAddWorkspaceRoomErrors: "A des erreurs d'ajout de salle de travail",
            isUnread: 'Est non lu (mode de concentration)',
            isArchived: 'Est archivé (mode le plus récent)',
            isSelfDM: 'Est un message direct à soi-même',
            isFocused: 'Est temporairement concentré(e)',
        },
        reasonGBR: {
            hasJoinRequest: 'A une demande de rejoindre (salle admin)',
            isUnreadWithMention: 'Est non lu avec mention',
            isWaitingForAssigneeToCompleteAction: "Attend que le responsable termine l'action",
            hasChildReportAwaitingAction: 'Le rapport enfant attend une action',
            hasMissingInvoiceBankAccount: 'Il manque le compte bancaire de la facture',
        },
        reasonRBR: {
            hasErrors: 'Contient des erreurs dans les données du rapport ou des actions du rapport',
            hasViolations: 'A des violations',
            hasTransactionThreadViolations: 'A des violations de fil de transaction',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "Il y a un rapport en attente d'action",
            theresAReportWithErrors: 'Il y a un rapport avec des erreurs',
            theresAWorkspaceWithCustomUnitsErrors: "Il y a un espace de travail avec des erreurs d'unités personnalisées.",
            theresAProblemWithAWorkspaceMember: "Il y a un problème avec un membre de l'espace de travail",
            theresAProblemWithAWorkspaceQBOExport: "Il y a eu un problème avec un paramètre d'exportation de connexion de l'espace de travail.",
            theresAProblemWithAContactMethod: 'Il y a un problème avec un moyen de contact',
            aContactMethodRequiresVerification: 'Une méthode de contact nécessite une vérification',
            theresAProblemWithAPaymentMethod: 'Il y a un problème avec un mode de paiement',
            theresAProblemWithAWorkspace: 'Il y a un problème avec un espace de travail.',
            theresAProblemWithYourReimbursementAccount: 'Il y a un problème avec votre compte de remboursement',
            theresABillingProblemWithYourSubscription: 'Il y a un problème de facturation avec votre abonnement.',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Votre abonnement a été renouvelé avec succès',
            theresWasAProblemDuringAWorkspaceConnectionSync: "Un problème est survenu lors de la synchronisation de la connexion de l'espace de travail.",
            theresAProblemWithYourWallet: 'Il y a un problème avec votre portefeuille',
            theresAProblemWithYourWalletTerms: 'Il y a un problème avec les conditions de votre portefeuille',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Faites un essai',
    },
    migratedUserWelcomeModal: {
        title: 'Voyage et dépenses, à la vitesse du chat',
        subtitle: 'New Expensify a la même excellente automatisation, mais maintenant avec une collaboration incroyable :',
        confirmText: 'Allons-y !',
        features: {
            chat: "<strong>Discutez directement sur n'importe quelle dépense</strong>, rapport ou espace de travail",
            scanReceipt: '<strong>Scannez les reçus</strong> et soyez remboursé',
            crossPlatform: 'Faites <strong>tout</strong> depuis votre téléphone ou navigateur',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: {
            part1: 'Commencer',
            part2: 'ici !',
        },
        saveSearchTooltip: {
            part1: 'Renommez vos recherches enregistrées',
            part2: 'ici !',
        },
        bottomNavInboxTooltip: {
            part1: 'Vérifier quoi',
            part2: 'nécessite votre attention',
            part3: 'et',
            part4: 'discuter des dépenses.',
        },
        workspaceChatTooltip: {
            part1: 'Discuter avec',
            part2: 'approbateurs',
        },
        globalCreateTooltip: {
            part1: 'Créer des dépenses',
            part2: ', commencer à discuter,',
            part3: 'et plus.',
            part4: 'Essayez-le !',
        },
        GBRRBRChat: {
            part1: 'Vous verrez 🟢 sur',
            part2: 'actions à entreprendre',
            part3: ',\net 🔴 sur',
            part4: 'éléments à examiner.',
        },
        accountSwitcher: {
            part1: 'Accédez à votre',
            part2: 'Comptes Copilot',
            part3: 'ici',
        },
        expenseReportsFilter: {
            part1: 'Bienvenue ! Trouvez tous vos',
            part2: "rapports de l'entreprise",
            part3: 'ici.',
        },
        scanTestTooltip: {
            part1: 'Vous voulez voir comment fonctionne Scan ?',
            part2: 'Essayez un reçu de test !',
            part3: 'Choisissez notre',
            part4: 'responsable des tests',
            part5: "pour l'essayer !",
            part6: 'Maintenant,',
            part7: 'soumettez votre dépense',
            part8: 'et regardez la magie opérer !',
            tryItOut: 'Essayez-le',
            noThanks: 'Non merci',
        },
        outstandingFilter: {
            part1: 'Filtrer les dépenses qui',
            part2: "besoin d'approbation",
        },
        scanTestDriveTooltip: {
            part1: 'Envoyer ce reçu à',
            part2: "complétez l'essai !",
        },
    },
    discardChangesConfirmation: {
        title: 'Annuler les modifications ?',
        body: 'Êtes-vous sûr de vouloir abandonner les modifications que vous avez apportées ?',
        confirmText: 'Annuler les modifications',
    },
    scheduledCall: {
        book: {
            title: 'Planifier un appel',
            description: 'Trouvez un moment qui vous convient.',
            slots: 'Heures disponibles pour',
        },
        confirmation: {
            title: "Confirmer l'appel",
            description: "Assurez-vous que les détails ci-dessous vous conviennent. Une fois que vous confirmez l'appel, nous enverrons une invitation avec plus d'informations.",
            setupSpecialist: 'Votre spécialiste de configuration',
            meetingLength: 'Durée de la réunion',
            dateTime: 'Date et heure',
            minutes: '30 minutes',
        },
        callScheduled: 'Appel programmé',
    },
    autoSubmitModal: {
        title: 'Tout est clair et soumis !',
        description: 'Tous les avertissements et infractions ont été levés, donc :',
        submittedExpensesTitle: 'Ces dépenses ont été soumises',
        submittedExpensesDescription: "Ces dépenses ont été envoyées à votre approbateur mais peuvent encore être modifiées jusqu'à ce qu'elles soient approuvées.",
        pendingExpensesTitle: 'Les dépenses en attente ont été déplacées',
        pendingExpensesDescription: "Toutes les dépenses de carte en attente ont été déplacées vers un rapport séparé jusqu'à ce qu'elles soient publiées.",
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Faites un essai de 2 minutes',
        },
        modal: {
            title: 'Faites un essai avec nous',
            description: "Faites une visite rapide du produit pour vous mettre rapidement à jour. Pas d'arrêts nécessaires !",
            confirmText: "Commencer l'essai",
            helpText: 'Passer',
            employee: {
                description: "<muted-text>Offrez à votre équipe <strong>3 mois gratuits d'Expensify !</strong> Entrez simplement l'email de votre patron ci-dessous et envoyez-lui une dépense test.</muted-text>",
                email: "Entrez l'email de votre patron",
                error: 'Ce membre possède un espace de travail, veuillez entrer un nouveau membre pour tester.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Vous êtes actuellement en train de tester Expensify',
            readyForTheRealThing: 'Prêt pour le grand saut ?',
            getStarted: 'Commencer',
        },
        employeeInviteMessage: function (_a) {
            var name = _a.name;
            return "# ".concat(name, " vous a invit\u00E9 \u00E0 essayer Expensify\nSalut ! Je viens de nous obtenir *3 mois gratuits* pour essayer Expensify, la fa\u00E7on la plus rapide de g\u00E9rer les notes de frais.\n\nVoici un *re\u00E7u de test* pour vous montrer comment cela fonctionne :");
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
exports.default = translations;
