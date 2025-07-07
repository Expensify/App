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
        count: 'Contare',
        cancel: 'Annulla',
        dismiss: 'Ignora',
        yes: 'Sì',
        no: 'No',
        ok: 'OK',
        notNow: 'Non ora',
        learnMore: 'Scopri di più.',
        buttonConfirm: 'Capito',
        name: 'Nome',
        attachment: 'Allegato',
        attachments: 'Allegati',
        center: 'Centro',
        from: 'Da',
        to: 'A',
        in: 'In',
        optional: 'Opzionale',
        new: 'Nuovo',
        search: 'Cerca',
        reports: 'Report',
        find: 'Trova',
        searchWithThreeDots: 'Cerca...',
        next: 'Successivo',
        previous: 'Precedente',
        goBack: 'Torna indietro',
        create: 'Crea',
        add: 'Aggiungi',
        resend: 'Invia di nuovo',
        save: 'Salva',
        select: 'Seleziona',
        deselect: 'Deseleziona',
        selectMultiple: 'Seleziona multipli',
        saveChanges: 'Salva le modifiche',
        submit: 'Invia',
        rotate: 'Ruota',
        zoom: 'Zoom',
        password: 'Password',
        magicCode: 'Magic code',
        twoFactorCode: 'Codice a due fattori',
        workspaces: 'Spazi di lavoro',
        inbox: 'Posta in arrivo',
        success: 'Successo',
        group: 'Gruppo',
        profile: 'Profilo',
        referral: 'Referenza',
        payments: 'Pagamenti',
        approvals: 'Approvazioni',
        wallet: 'Portafoglio',
        preferences: 'Preferenze',
        view: 'Visualizza',
        review: function (reviewParams) { return "Review".concat((reviewParams === null || reviewParams === void 0 ? void 0 : reviewParams.amount) ? " ".concat(reviewParams === null || reviewParams === void 0 ? void 0 : reviewParams.amount) : ''); },
        not: 'Non',
        signIn: 'Accedi',
        signInWithGoogle: 'Accedi con Google',
        signInWithApple: 'Accedi con Apple',
        signInWith: 'Accedi con',
        continue: 'Continua',
        firstName: 'Nome',
        lastName: 'Cognome',
        scanning: 'Scansione',
        addCardTermsOfService: 'Termini di servizio di Expensify',
        perPerson: 'per persona',
        phone: 'Telefono',
        phoneNumber: 'Numero di telefono',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'Email',
        and: 'e',
        or: 'o',
        details: 'Dettagli',
        privacy: 'Privacy',
        privacyPolicy: 'Informativa sulla privacy',
        hidden: 'Nascosto',
        visible: 'Visibile',
        delete: 'Elimina',
        archived: 'archiviato',
        contacts: 'Contatti',
        recents: 'Recenti',
        close: 'Chiudi',
        download: 'Scarica',
        downloading: 'Scaricamento',
        uploading: 'Caricamento in corso',
        pin: 'Pin',
        unPin: 'Rimuovi dal pin',
        back: 'Indietro',
        saveAndContinue: 'Salva e continua',
        settings: 'Impostazioni',
        termsOfService: 'Termini di Servizio',
        members: 'Membri',
        invite: 'Invita',
        here: 'qui',
        date: 'Data',
        dob: 'Data di nascita',
        currentYear: 'Anno corrente',
        currentMonth: 'Mese corrente',
        ssnLast4: 'Ultime 4 cifre del SSN',
        ssnFull9: 'Tutti i 9 cifre del SSN',
        addressLine: function (_a) {
            var lineNumber = _a.lineNumber;
            return "Indirizzo linea ".concat(lineNumber);
        },
        personalAddress: 'Indirizzo personale',
        companyAddress: "Indirizzo dell'azienda",
        noPO: 'Niente caselle postali o indirizzi di caselle postali, per favore.',
        city: 'Città',
        state: 'Stato',
        streetAddress: 'Indirizzo stradale',
        stateOrProvince: 'Stato / Provincia',
        country: 'Paese',
        zip: 'Codice postale',
        zipPostCode: 'CAP / Codice postale',
        whatThis: "Cos'è questo?",
        iAcceptThe: 'Accetto il',
        remove: 'Rimuovi',
        admin: 'Admin',
        owner: 'Proprietario',
        dateFormat: 'YYYY-MM-DD',
        send: 'Invia',
        na: 'N/A',
        noResultsFound: 'Nessun risultato trovato',
        noResultsFoundMatching: function (_a) {
            var searchString = _a.searchString;
            return "Nessun risultato trovato corrispondente a \"".concat(searchString, "\"");
        },
        recentDestinations: 'Destinazioni recenti',
        timePrefix: 'È',
        conjunctionFor: 'per',
        todayAt: 'Oggi alle',
        tomorrowAt: 'Domani alle',
        yesterdayAt: 'Ieri alle',
        conjunctionAt: 'at',
        conjunctionTo: 'a',
        genericErrorMessage: 'Ops... qualcosa è andato storto e la tua richiesta non può essere completata. Per favore riprova più tardi.',
        percentage: 'Percentuale',
        error: {
            invalidAmount: 'Importo non valido',
            acceptTerms: 'Devi accettare i Termini di Servizio per continuare',
            phoneNumber: "Per favore, inserisci un numero di telefono valido, con il prefisso internazionale (ad es. ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")"),
            fieldRequired: 'Questo campo è obbligatorio',
            requestModified: 'Questa richiesta è in fase di modifica da un altro membro.',
            characterLimitExceedCounter: function (_a) {
                var length = _a.length, limit = _a.limit;
                return "Limite di caratteri superato (".concat(length, "/").concat(limit, ")");
            },
            dateInvalid: 'Si prega di selezionare una data valida',
            invalidDateShouldBeFuture: 'Si prega di scegliere oggi o una data futura',
            invalidTimeShouldBeFuture: 'Si prega di scegliere un orario almeno un minuto avanti',
            invalidCharacter: 'Carattere non valido',
            enterMerchant: 'Inserisci il nome di un commerciante',
            enterAmount: 'Inserisci un importo',
            missingMerchantName: 'Nome del commerciante mancante',
            missingAmount: 'Importo mancante',
            missingDate: 'Data mancante',
            enterDate: 'Inserisci una data',
            invalidTimeRange: 'Inserisci un orario utilizzando il formato a 12 ore (es. 14:30)',
            pleaseCompleteForm: 'Si prega di completare il modulo sopra per continuare',
            pleaseSelectOne: "Si prega di selezionare un'opzione sopra",
            invalidRateError: 'Per favore, inserisci una tariffa valida',
            lowRateError: 'La tariffa deve essere maggiore di 0',
            email: 'Per favore, inserisci un indirizzo email valido',
            login: "Si è verificato un errore durante l'accesso. Per favore riprova.",
        },
        comma: 'virgola',
        semicolon: 'semicolon',
        please: 'Per favore',
        contactUs: 'contattaci',
        pleaseEnterEmailOrPhoneNumber: "Per favore inserisci un'email o un numero di telefono",
        fixTheErrors: 'correggi gli errori',
        inTheFormBeforeContinuing: 'nel modulo prima di continuare',
        confirm: 'Conferma',
        reset: 'Reimposta',
        done: 'Fatto',
        more: 'Di più',
        debitCard: 'Carta di debito',
        bankAccount: 'Conto bancario',
        personalBankAccount: 'Conto bancario personale',
        businessBankAccount: 'Conto bancario aziendale',
        join: 'Unisciti',
        leave: 'Lasciare',
        decline: 'Rifiuta',
        transferBalance: 'Trasferisci saldo',
        cantFindAddress: 'Non riesci a trovare il tuo indirizzo?',
        enterManually: 'Inseriscilo manualmente',
        message: 'Messaggio',
        leaveThread: 'Abbandona discussione',
        you: 'Tu',
        youAfterPreposition: 'tu/voi (depending on the context)',
        your: 'tuo/tuoi/tuoi/tuo (depending on context and gender/number)',
        conciergeHelp: 'Si prega di contattare Concierge per assistenza.',
        youAppearToBeOffline: 'Sembri essere offline.',
        thisFeatureRequiresInternet: 'Questa funzione richiede una connessione internet attiva.',
        attachmentWillBeAvailableOnceBackOnline: "L'allegato sarà disponibile una volta tornato online.",
        errorOccurredWhileTryingToPlayVideo: 'Si è verificato un errore durante il tentativo di riprodurre questo video.',
        areYouSure: 'Sei sicuro?',
        verify: 'Verifica',
        yesContinue: 'Sì, continua.',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: function (_a) {
            var zipSampleFormat = _a.zipSampleFormat;
            return (zipSampleFormat ? "e.g. ".concat(zipSampleFormat) : '');
        },
        description: 'Descrizione',
        title: 'Titolo',
        assignee: 'Assegnatario',
        createdBy: 'Creato da',
        with: 'con',
        shareCode: 'Condividi codice',
        share: 'Condividi',
        per: 'per',
        mi: 'miglio',
        km: 'chilometro',
        copied: 'Copiato!',
        someone: 'Qualcuno',
        total: 'Totale',
        edit: 'Modifica',
        letsDoThis: "Facciamolo!",
        letsStart: "Iniziamo pure!",
        showMore: 'Mostra di più',
        merchant: 'Commerciante',
        category: 'Categoria',
        report: 'Rapporto',
        billable: 'Fatturabile',
        nonBillable: 'Non-fatturabile',
        tag: 'Etichetta',
        receipt: 'Ricevuta',
        verified: 'Verificato',
        replace: 'Sostituire',
        distance: 'Distanza',
        mile: 'miglio',
        miles: 'miglia',
        kilometer: 'chilometro',
        kilometers: 'chilometri',
        recent: 'Recente',
        all: 'Tutti',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: 'Seleziona una valuta',
        card: 'Carta',
        whyDoWeAskForThis: 'Perché lo chiediamo?',
        required: 'Richiesto',
        showing: 'Mostrando',
        of: 'di',
        default: 'Predefinito',
        update: 'Aggiorna',
        member: 'Membro',
        auditor: 'Revisore dei conti',
        role: 'Ruolo',
        currency: 'Valuta',
        rate: 'Valuta',
        emptyLHN: {
            title: 'Woohoo! Tutto aggiornato.',
            subtitleText1: 'Trova una chat utilizzando il',
            subtitleText2: 'pulsante sopra, o crea qualcosa usando il',
            subtitleText3: 'pulsante qui sotto.',
        },
        businessName: "Nome dell'azienda",
        clear: 'Chiaro',
        type: 'Tipo',
        action: 'Azione',
        expenses: 'Spese',
        tax: 'Tassa',
        shared: 'Condiviso',
        drafts: 'Bozze',
        finished: 'Finito',
        upgrade: 'Aggiorna',
        downgradeWorkspace: 'Declassa spazio di lavoro',
        companyID: 'ID azienda',
        userID: 'User ID',
        disable: 'Disabilita',
        export: 'Esporta',
        initialValue: 'Valore iniziale',
        currentDate: 'La data odierna',
        value: 'Valore',
        downloadFailedTitle: 'Download non riuscito',
        downloadFailedDescription: 'Il tuo download non è stato completato. Per favore riprova più tardi.',
        filterLogs: 'Filtra registri',
        network: 'Rete',
        reportID: 'ID Rapporto',
        longID: 'ID lungo',
        bankAccounts: 'Conti bancari',
        chooseFile: 'Scegli file',
        chooseFiles: 'Scegli file',
        dropTitle: 'Lascia andare',
        dropMessage: 'Trascina qui il tuo file',
        ignore: 'Ignore',
        enabled: 'Abilitato',
        disabled: 'Disabilitato',
        import: 'Importa',
        offlinePrompt: 'Non puoi eseguire questa azione in questo momento.',
        outstanding: 'Eccezionale',
        chats: 'Chat',
        tasks: 'Attività',
        unread: 'Non letto',
        sent: 'Inviato',
        links: 'Link',
        days: 'giorni',
        rename: 'Rinomina',
        address: 'Indirizzo',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Salta',
        chatWithAccountManager: function (_a) {
            var accountManagerDisplayName = _a.accountManagerDisplayName;
            return "Hai bisogno di qualcosa di specifico? Chatta con il tuo account manager, ".concat(accountManagerDisplayName, ".");
        },
        chatNow: 'Chatta ora',
        workEmail: 'Email di lavoro',
        destination: 'Destinazione',
        subrate: 'Subrate',
        perDiem: 'Per diem',
        validate: 'Convalida',
        downloadAsPDF: 'Scarica come PDF',
        downloadAsCSV: 'Scarica come CSV',
        help: 'Aiuto',
        expenseReports: 'Report di spesa',
        rateOutOfPolicy: 'Valuta fuori politica',
        reimbursable: 'Rimborsabile',
        editYourProfile: 'Modifica il tuo profilo',
        comments: 'Commenti',
        sharedIn: 'Condiviso in',
        unreported: 'Non segnalato',
        explore: 'Esplora',
        todo: 'Da fare',
        invoice: 'Fattura',
        expense: 'Spesa',
        chat: 'Chatta',
        task: 'Compito',
        trip: 'Viaggio',
        apply: 'Applica',
        status: 'Stato',
        on: 'Su',
        before: 'Prima',
        after: 'Dopo',
        reschedule: 'Ripianifica',
        general: 'Generale',
        workspacesTabTitle: 'Spazi di lavoro',
        getTheApp: "Scarica l'app",
        scanReceiptsOnTheGo: 'Scansiona le ricevute dal tuo telefono',
        headsUp: 'Attenzione!',
    },
    supportalNoAccess: {
        title: 'Non così in fretta',
        description: 'Non sei autorizzato a eseguire questa azione quando il supporto è connesso.',
    },
    lockedAccount: {
        title: 'Account bloccato',
        description: 'Non sei autorizzato a completare questa azione poiché questo account è stato bloccato. Si prega di contattare concierge@expensify.com per i prossimi passi.',
    },
    location: {
        useCurrent: 'Usa la posizione attuale',
        notFound: 'Non siamo riusciti a trovare la tua posizione. Per favore riprova o inserisci un indirizzo manualmente.',
        permissionDenied: "Sembra che tu abbia negato l'accesso alla tua posizione.",
        please: 'Per favore',
        allowPermission: "consenti l'accesso alla posizione nelle impostazioni",
        tryAgain: 'e riprova.',
    },
    contact: {
        importContacts: 'Importa contatti',
        importContactsTitle: 'Importa i tuoi contatti',
        importContactsText: 'Importa i contatti dal tuo telefono così le tue persone preferite sono sempre a portata di tocco.',
        importContactsExplanation: 'così le tue persone preferite sono sempre a portata di tocco.',
        importContactsNativeText: 'Ancora un passo! Dacci il via libera per importare i tuoi contatti.',
    },
    anonymousReportFooter: {
        logoTagline: 'Unisciti alla discussione.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Accesso alla fotocamera',
        expensifyDoesNotHaveAccessToCamera: 'Expensify non può scattare foto senza accesso alla tua fotocamera. Tocca le impostazioni per aggiornare i permessi.',
        attachmentError: 'Errore allegato',
        errorWhileSelectingAttachment: 'Si è verificato un errore durante la selezione di un allegato. Per favore, riprova.',
        errorWhileSelectingCorruptedAttachment: 'Si è verificato un errore durante la selezione di un allegato danneggiato. Si prega di provare un altro file.',
        takePhoto: 'Scatta foto',
        chooseFromGallery: 'Scegli dalla galleria',
        chooseDocument: 'Scegli file',
        attachmentTooLarge: "L'allegato è troppo grande",
        sizeExceeded: "La dimensione dell'allegato supera il limite di 24 MB",
        sizeExceededWithLimit: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "La dimensione dell'allegato supera il limite di ".concat(maxUploadSizeInMB, " MB");
        },
        attachmentTooSmall: "L'allegato è troppo piccolo",
        sizeNotMet: "La dimensione dell'allegato deve essere superiore a 240 byte.",
        wrongFileType: 'Tipo di file non valido',
        notAllowedExtension: 'Questo tipo di file non è consentito. Si prega di provare un tipo di file diverso.',
        folderNotAllowedMessage: 'Il caricamento di una cartella non è consentito. Si prega di provare con un file diverso.',
        protectedPDFNotSupported: 'PDF protetto da password non è supportato',
        attachmentImageResized: "Questa immagine è stata ridimensionata per l'anteprima. Scarica per la risoluzione completa.",
        attachmentImageTooLarge: 'Questa immagine è troppo grande per essere visualizzata in anteprima prima del caricamento.',
        tooManyFiles: function (_a) {
            var fileLimit = _a.fileLimit;
            return "Puoi caricare solo fino a ".concat(fileLimit, " file alla volta.");
        },
        sizeExceededWithValue: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "I file superano ".concat(maxUploadSizeInMB, " MB. Per favore riprova.");
        },
        someFilesCantBeUploaded: 'Alcuni file non possono essere caricati',
        sizeLimitExceeded: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "I file devono essere inferiori a ".concat(maxUploadSizeInMB, " MB. I file pi\u00F9 grandi non verranno caricati.");
        },
        maxFileLimitExceeded: 'Puoi caricare fino a 30 ricevute alla volta. Quelle in eccesso non verranno caricate.',
        unsupportedFileType: function (_a) {
            var fileType = _a.fileType;
            return "I file ".concat(fileType, " non sono supportati. Verranno caricati solo i tipi di file supportati.");
        },
        learnMoreAboutSupportedFiles: 'Scopri di più sui formati supportati.',
        passwordProtected: 'I PDF protetti da password non sono supportati. Verranno caricati solo i file supportati.',
    },
    dropzone: {
        addAttachments: 'Aggiungi allegati',
        scanReceipts: 'Scansiona ricevute',
        replaceReceipt: 'Sostituisci ricevuta',
    },
    filePicker: {
        fileError: 'Errore del file',
        errorWhileSelectingFile: 'Si è verificato un errore durante la selezione di un file. Per favore riprova.',
    },
    connectionComplete: {
        title: 'Connessione completata',
        supportingText: "Puoi chiudere questa finestra e tornare all'app Expensify.",
    },
    avatarCropModal: {
        title: 'Modifica foto',
        description: 'Trascina, ingrandisci e ruota la tua immagine come preferisci.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Nessuna estensione trovata per il tipo MIME',
        problemGettingImageYouPasted: "Si è verificato un problema nel recuperare l'immagine che hai incollato.",
        commentExceededMaxLength: function (_a) {
            var formattedMaxLength = _a.formattedMaxLength;
            return "La lunghezza massima del commento \u00E8 di ".concat(formattedMaxLength, " caratteri.");
        },
        taskTitleExceededMaxLength: function (_a) {
            var formattedMaxLength = _a.formattedMaxLength;
            return "La lunghezza massima del titolo del compito \u00E8 di ".concat(formattedMaxLength, " caratteri.");
        },
    },
    baseUpdateAppModal: {
        updateApp: 'Aggiorna app',
        updatePrompt: "È disponibile una nuova versione di questa app.  \nAggiorna ora o riavvia l'app più tardi per scaricare le ultime modifiche.",
    },
    deeplinkWrapper: {
        launching: 'Avvio di Expensify',
        expired: 'La tua sessione è scaduta.',
        signIn: 'Per favore accedi di nuovo.',
        redirectedToDesktopApp: "Ti abbiamo reindirizzato all'app desktop.",
        youCanAlso: 'Puoi anche',
        openLinkInBrowser: 'apri questo link nel tuo browser',
        loggedInAs: function (_a) {
            var email = _a.email;
            return "Sei connesso come ".concat(email, ". Fai clic su \"Apri link\" nel prompt per accedere all'app desktop con questo account.");
        },
        doNotSeePrompt: 'Non riesci a vedere il prompt?',
        tryAgain: 'Riprova',
        or: ', o',
        continueInWeb: "continua all'app web",
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abracadabra,\nsei connesso!',
        successfulSignInDescription: 'Torna alla tua scheda originale per continuare.',
        title: 'Ecco il tuo codice magico',
        description: 'Inserisci il codice dal dispositivo dove è stato originariamente richiesto',
        doNotShare: 'Non condividere il tuo codice con nessuno. Expensify non te lo chiederà mai!',
        or: ', o',
        signInHere: 'accedi qui',
        expiredCodeTitle: 'Codice magico scaduto',
        expiredCodeDescription: 'Torna al dispositivo originale e richiedi un nuovo codice',
        successfulNewCodeRequest: 'Codice richiesto. Si prega di controllare il dispositivo.',
        tfaRequiredTitle: 'Autenticazione a due fattori richiesta',
        tfaRequiredDescription: 'Inserisci il codice di autenticazione a due fattori dove stai cercando di accedere.',
        requestOneHere: 'richiedine uno qui.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Pagato da',
        whatsItFor: 'A cosa serve?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Nome, email o numero di telefono',
        findMember: 'Trova un membro',
        searchForSomeone: 'Cerca qualcuno',
    },
    emptyList: (_a = {},
        _a[CONST_1.default.IOU.TYPE.CREATE] = {
            title: 'Invia una spesa, riferisci al tuo capo',
            subtitleText: 'Vuoi che anche il tuo capo usi Expensify? Basta inviare loro una spesa e ci occuperemo del resto.',
        },
        _a),
    videoChatButtonAndMenu: {
        tooltip: 'Prenota una chiamata',
    },
    hello: 'Ciao',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Inizia qui sotto.',
        anotherLoginPageIsOpen: "Un'altra pagina di accesso è aperta.",
        anotherLoginPageIsOpenExplanation: 'Hai aperto la pagina di accesso in una scheda separata. Effettua il login da quella scheda.',
        welcome: 'Benvenuto!',
        welcomeWithoutExclamation: 'Benvenuto',
        phrase2: 'I soldi parlano. E ora che chat e pagamenti sono in un unico posto, è anche facile.',
        phrase3: 'I tuoi pagamenti ti arrivano velocemente quanto riesci a far capire il tuo punto di vista.',
        enterPassword: 'Per favore inserisci la tua password',
        welcomeNewFace: function (_a) {
            var login = _a.login;
            return "".concat(login, ", \u00E8 sempre un piacere vedere una nuova faccia da queste parti!");
        },
        welcomeEnterMagicCode: function (_a) {
            var login = _a.login;
            return "Inserisci il codice magico inviato a ".concat(login, ". Dovrebbe arrivare entro un minuto o due.");
        },
    },
    login: {
        hero: {
            header: 'Viaggi e spese, alla velocità della chat',
            body: "Benvenuto nella nuova generazione di Expensify, dove i tuoi viaggi e le tue spese si muovono più velocemente con l'aiuto di una chat contestuale e in tempo reale.",
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: function (_a) {
            var email = _a.email;
            return "Sei gi\u00E0 connesso come ".concat(email, ".");
        },
        goBackMessage: function (_a) {
            var provider = _a.provider;
            return "Non vuoi accedere con ".concat(provider, "?");
        },
        continueWithMyCurrentSession: 'Continua con la mia sessione attuale',
        redirectToDesktopMessage: "Ti reindirizzeremo all'app desktop una volta completato l'accesso.",
        signInAgreementMessage: 'Accedendo, accetti i',
        termsOfService: 'Termini di Servizio',
        privacy: 'Privacy',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Continua ad accedere con single sign-on:',
        orContinueWithMagicCode: 'Puoi anche accedere con un codice magico',
        useSingleSignOn: 'Usa il single sign-on',
        useMagicCode: 'Usa il codice magico',
        launching: 'Avvio in corso...',
        oneMoment: 'Un momento mentre ti reindirizziamo al portale di single sign-on della tua azienda.',
    },
    reportActionCompose: {
        dropToUpload: 'Trascina per caricare',
        sendAttachment: 'Invia allegato',
        addAttachment: 'Aggiungi allegato',
        writeSomething: 'Scrivi qualcosa...',
        blockedFromConcierge: 'La comunicazione è bloccata',
        fileUploadFailed: 'Caricamento fallito. Il file non è supportato.',
        localTime: function (_a) {
            var user = _a.user, time = _a.time;
            return "Sono le ".concat(time, " per ").concat(user);
        },
        edited: '(modificato)',
        emoji: 'Emoji',
        collapse: 'Comprimi',
        expand: 'Espandi',
    },
    reportActionContextMenu: {
        copyToClipboard: 'Copia negli appunti',
        copied: 'Copiato!',
        copyLink: 'Copia link',
        copyURLToClipboard: 'Copia URL negli appunti',
        copyEmailToClipboard: 'Copia email negli appunti',
        markAsUnread: 'Segna come non letto',
        markAsRead: 'Segna come letto',
        editAction: function (_a) {
            var action = _a.action;
            return "Modifica ".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? 'spesa' : 'commento');
        },
        deleteAction: function (_a) {
            var action = _a.action;
            return "Elimina ".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? 'spesa' : 'commento');
        },
        deleteConfirmation: function (_a) {
            var action = _a.action;
            return "Sei sicuro di voler eliminare questo ".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? 'spesa' : 'commento', "?");
        },
        onlyVisible: 'Visibile solo a',
        replyInThread: 'Rispondi nel thread',
        joinThread: 'Unisciti al thread',
        leaveThread: 'Abbandona discussione',
        copyOnyxData: 'Copia i dati Onyx',
        flagAsOffensive: 'Segnala come offensivo',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Aggiungi reazione',
        reactedWith: 'ha reagito con',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: 'Ti sei perso la festa in',
        beginningOfArchivedRoomPartTwo: ", non c'è niente da vedere qui.",
        beginningOfChatHistoryDomainRoomPartOne: function (_a) {
            var domainRoom = _a.domainRoom;
            return "Questa chat \u00E8 con tutti i membri di Expensify nel dominio ".concat(domainRoom, ".");
        },
        beginningOfChatHistoryDomainRoomPartTwo: 'Usalo per chattare con i colleghi, condividere consigli e fare domande.',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'Questa chat è con',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: function (_a) {
            var workspaceName = _a.workspaceName;
            return " ".concat(workspaceName, " ");
        },
        beginningOfChatHistoryAdminRoomPartTwo: "Usalo per discutere dell'allestimento dello spazio di lavoro e altro ancora.",
        beginningOfChatHistoryAnnounceRoomPartOne: function (_a) {
            var workspaceName = _a.workspaceName;
            return "Questa chat \u00E8 con tutti in ".concat(workspaceName, ".");
        },
        beginningOfChatHistoryAnnounceRoomPartTwo: "Usalo per gli annunci pi\u00F9 importanti.",
        beginningOfChatHistoryUserRoomPartOne: 'Questa chat room è per qualsiasi cosa',
        beginningOfChatHistoryUserRoomPartTwo: 'related.',
        beginningOfChatHistoryInvoiceRoomPartOne: "Questa chat \u00E8 per le fatture tra",
        beginningOfChatHistoryInvoiceRoomPartTwo: ". Usa il pulsante + per inviare una fattura.",
        beginningOfChatHistory: 'Questa chat è con',
        beginningOfChatHistoryPolicyExpenseChatPartOne: 'Questo è dove',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'invierà le spese a',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Basta usare il pulsante +.',
        beginningOfChatHistorySelfDM: 'Questo è il tuo spazio personale. Usalo per appunti, compiti, bozze e promemoria.',
        beginningOfChatHistorySystemDM: 'Benvenuto! Iniziamo con la configurazione.',
        chatWithAccountManager: 'Chatta con il tuo account manager qui',
        sayHello: 'Ciao!',
        yourSpace: 'Il tuo spazio',
        welcomeToRoom: function (_a) {
            var roomName = _a.roomName;
            return "Benvenuto in ".concat(roomName, "!");
        },
        usePlusButton: function (_a) {
            var additionalText = _a.additionalText;
            return "Usa il pulsante + per ".concat(additionalText, " una spesa.");
        },
        askConcierge: 'Fai domande e ricevi supporto in tempo reale 24/7.',
        conciergeSupport: 'Supporto 24/7',
        create: 'creare',
        iouTypes: {
            pay: 'paga',
            split: 'split',
            submit: 'inviare',
            track: 'tracciare',
            invoice: 'fattura',
        },
    },
    adminOnlyCanPost: 'Solo gli amministratori possono inviare messaggi in questa stanza.',
    reportAction: {
        asCopilot: 'come copilota per',
    },
    mentionSuggestions: {
        hereAlternateText: 'Notifica tutti in questa conversazione',
    },
    newMessages: 'Nuovi messaggi',
    youHaveBeenBanned: 'Nota: Sei stato bannato dalla chat in questo canale.',
    reportTypingIndicator: {
        isTyping: 'sta scrivendo...',
        areTyping: 'sta digitando...',
        multipleMembers: 'Più membri',
    },
    reportArchiveReasons: (_b = {},
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.DEFAULT] = 'Questa chat è stata archiviata.',
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED] = function (_a) {
            var displayName = _a.displayName;
            return "Questa chat non \u00E8 pi\u00F9 attiva perch\u00E9 ".concat(displayName, " ha chiuso il loro account.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED] = function (_a) {
            var displayName = _a.displayName, oldDisplayName = _a.oldDisplayName;
            return "Questa chat non \u00E8 pi\u00F9 attiva perch\u00E9 ".concat(oldDisplayName, " ha unito il proprio account con ").concat(displayName, ".");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY] = function (_a) {
            var displayName = _a.displayName, policyName = _a.policyName, _b = _a.shouldUseYou, shouldUseYou = _b === void 0 ? false : _b;
            return shouldUseYou
                ? "Questa chat non \u00E8 pi\u00F9 attiva perch\u00E9 <strong>tu</strong> non sei pi\u00F9 un membro dello spazio di lavoro ".concat(policyName, ".")
                : "Questa chat non \u00E8 pi\u00F9 attiva perch\u00E9 ".concat(displayName, " non \u00E8 pi\u00F9 un membro dello spazio di lavoro ").concat(policyName, ".");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.POLICY_DELETED] = function (_a) {
            var policyName = _a.policyName;
            return "Questa chat non \u00E8 pi\u00F9 attiva perch\u00E9 ".concat(policyName, " non \u00E8 pi\u00F9 uno spazio di lavoro attivo.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED] = function (_a) {
            var policyName = _a.policyName;
            return "Questa chat non \u00E8 pi\u00F9 attiva perch\u00E9 ".concat(policyName, " non \u00E8 pi\u00F9 uno spazio di lavoro attivo.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED] = 'Questa prenotazione è archiviata.',
        _b),
    writeCapabilityPage: {
        label: 'Chi può pubblicare',
        writeCapability: {
            all: 'Tutti i membri',
            admins: 'Solo amministratori',
        },
    },
    sidebarScreen: {
        buttonFind: 'Trova qualcosa...',
        buttonMySettings: 'Le mie impostazioni',
        fabNewChat: 'Inizia chat',
        fabNewChatExplained: 'Avvia chat (Azione flottante)',
        chatPinned: 'Chat fissata',
        draftedMessage: 'Messaggio redatto',
        listOfChatMessages: 'Elenco dei messaggi di chat',
        listOfChats: 'Elenco delle chat',
        saveTheWorld: 'Salva il mondo',
        tooltip: 'Inizia qui!',
        redirectToExpensifyClassicModal: {
            title: 'In arrivo presto',
            description: 'Stiamo perfezionando alcuni dettagli di New Expensify per adattarci alla tua configurazione specifica. Nel frattempo, vai su Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Abbonamento',
        domains: 'Domini',
    },
    tabSelector: {
        chat: 'Chatta',
        room: 'Stanza',
        distance: 'Distanza',
        manual: 'Manuale',
        scan: 'Scansiona',
    },
    spreadsheet: {
        upload: 'Carica un foglio di calcolo',
        dragAndDrop: 'Trascina e rilascia il tuo foglio di calcolo qui, oppure scegli un file qui sotto. Formati supportati: .csv, .txt, .xls e .xlsx.',
        chooseSpreadsheet: 'Seleziona un file di foglio di calcolo da importare. Formati supportati: .csv, .txt, .xls e .xlsx.',
        fileContainsHeader: 'Il file contiene intestazioni di colonna',
        column: function (_a) {
            var name = _a.name;
            return "Colonna ".concat(name);
        },
        fieldNotMapped: function (_a) {
            var fieldName = _a.fieldName;
            return "Ops! Un campo obbligatorio (\"".concat(fieldName, "\") non \u00E8 stato mappato. Si prega di controllare e riprovare.");
        },
        singleFieldMultipleColumns: function (_a) {
            var fieldName = _a.fieldName;
            return "Ops! Hai mappato un singolo campo (\"".concat(fieldName, "\") a pi\u00F9 colonne. Per favore, controlla e riprova.");
        },
        emptyMappedField: function (_a) {
            var fieldName = _a.fieldName;
            return "Ops! Il campo (\"".concat(fieldName, "\") contiene uno o pi\u00F9 valori vuoti. Si prega di controllare e riprovare.");
        },
        importSuccessfulTitle: 'Importazione riuscita',
        importCategoriesSuccessfulDescription: function (_a) {
            var categories = _a.categories;
            return (categories > 1 ? "Sono state aggiunte ".concat(categories, " categorie.") : '1 categoria è stata aggiunta.');
        },
        importMembersSuccessfulDescription: function (_a) {
            var added = _a.added, updated = _a.updated;
            if (!added && !updated) {
                return 'Nessun membro è stato aggiunto o aggiornato.';
            }
            if (added && updated) {
                return "".concat(added, " membro").concat(added > 1 ? 's' : '', " aggiunto, ").concat(updated, " membro").concat(updated > 1 ? 's' : '', " aggiornato.");
            }
            if (updated) {
                return updated > 1 ? "".concat(updated, " membri sono stati aggiornati.") : '1 membro è stato aggiornato.';
            }
            return added > 1 ? "".concat(added, " membri sono stati aggiunti.") : '1 membro è stato aggiunto.';
        },
        importTagsSuccessfulDescription: function (_a) {
            var tags = _a.tags;
            return (tags > 1 ? "Sono stati aggiunti ".concat(tags, " tag.") : '1 tag è stato aggiunto.');
        },
        importMultiLevelTagsSuccessfulDescription: 'Sono stati aggiunti tag multilivello.',
        importPerDiemRatesSuccessfulDescription: function (_a) {
            var rates = _a.rates;
            return rates > 1 ? "Sono state aggiunte ".concat(rates, " tariffe giornaliere.") : 'È stata aggiunta 1 tariffa di diaria.';
        },
        importFailedTitle: 'Importazione fallita',
        importFailedDescription: 'Assicurati che tutti i campi siano compilati correttamente e riprova. Se il problema persiste, contatta Concierge.',
        importDescription: 'Scegli quali campi mappare dal tuo foglio di calcolo facendo clic sul menu a discesa accanto a ciascuna colonna importata qui sotto.',
        sizeNotMet: 'La dimensione del file deve essere maggiore di 0 byte',
        invalidFileMessage: 'Il file che hai caricato è vuoto o contiene dati non validi. Assicurati che il file sia formattato correttamente e contenga le informazioni necessarie prima di caricarlo di nuovo.',
        importSpreadsheet: 'Importa foglio di calcolo',
        downloadCSV: 'Scarica CSV',
    },
    receipt: {
        upload: 'Carica ricevuta',
        uploadMultiple: 'Carica ricevute',
        dragReceiptBeforeEmail: 'Trascina una ricevuta su questa pagina, inoltra una ricevuta a',
        dragReceiptsBeforeEmail: 'Trascina ricevute su questa pagina, inoltra ricevute a',
        dragReceiptAfterEmail: 'oppure scegli un file da caricare qui sotto.',
        dragReceiptsAfterEmail: 'oppure scegli file da caricare qui sotto.',
        chooseReceipt: 'Scegli una ricevuta da caricare o inoltra una ricevuta a',
        chooseReceipts: 'Scegli ricevute da caricare o inoltra ricevute a',
        takePhoto: 'Scatta una foto',
        cameraAccess: "L'accesso alla fotocamera è necessario per scattare foto delle ricevute.",
        deniedCameraAccess: "L'accesso alla fotocamera non è ancora stato concesso, si prega di seguire",
        deniedCameraAccessInstructions: 'queste istruzioni',
        cameraErrorTitle: 'Errore della fotocamera',
        cameraErrorMessage: 'Si è verificato un errore durante lo scatto della foto. Riprova.',
        locationAccessTitle: "Consenti l'accesso alla posizione",
        locationAccessMessage: "L'accesso alla posizione ci aiuta a mantenere il tuo fuso orario e la tua valuta accurati ovunque tu vada.",
        locationErrorTitle: "Consenti l'accesso alla posizione",
        locationErrorMessage: "L'accesso alla posizione ci aiuta a mantenere il tuo fuso orario e la tua valuta accurati ovunque tu vada.",
        allowLocationFromSetting: "L'accesso alla posizione ci aiuta a mantenere il tuo fuso orario e la tua valuta precisi ovunque tu vada. Consenti l'accesso alla posizione dalle impostazioni delle autorizzazioni del tuo dispositivo.",
        dropTitle: 'Lascia andare',
        dropMessage: 'Trascina qui il tuo file',
        flash: 'flash',
        multiScan: 'multi-scan',
        shutter: 'otturatore',
        gallery: 'galleria',
        deleteReceipt: 'Elimina ricevuta',
        deleteConfirmation: 'Sei sicuro di voler eliminare questa ricevuta?',
        addReceipt: 'Aggiungi ricevuta',
        scanFailed: 'La ricevuta non può essere scansionata perché mancano il commerciante, la data o l’importo.',
    },
    quickAction: {
        scanReceipt: 'Scansiona ricevuta',
        recordDistance: 'Traccia distanza',
        requestMoney: 'Crea spesa',
        perDiem: 'Crea diaria',
        splitBill: 'Dividi spesa',
        splitScan: 'Dividi ricevuta',
        splitDistance: 'Dividi distanza',
        paySomeone: function (_a) {
            var _b = _a === void 0 ? {} : _a, name = _b.name;
            return "Paga ".concat(name !== null && name !== void 0 ? name : 'qualcuno');
        },
        assignTask: 'Assegna compito',
        header: 'Azione rapida',
        noLongerHaveReportAccess: 'Non hai più accesso alla tua precedente destinazione di azione rapida. Scegline una nuova qui sotto.',
        updateDestination: 'Aggiorna destinazione',
        createReport: 'Crea rapporto',
    },
    iou: {
        amount: 'Importo',
        taxAmount: 'Importo fiscale',
        taxRate: 'Aliquota fiscale',
        approve: function (_a) {
            var _b = _a === void 0 ? {} : _a, formattedAmount = _b.formattedAmount;
            return (formattedAmount ? "Approva ".concat(formattedAmount) : 'Approva');
        },
        approved: 'Approvato',
        cash: 'Contanti',
        card: 'Carta',
        original: 'Original',
        split: 'Dividi',
        splitExpense: 'Dividi spesa',
        splitExpenseSubtitle: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "".concat(amount, " da ").concat(merchant);
        },
        addSplit: 'Aggiungi divisione',
        totalAmountGreaterThanOriginal: function (_a) {
            var amount = _a.amount;
            return "L'importo totale \u00E8 ".concat(amount, " maggiore della spesa originale.");
        },
        totalAmountLessThanOriginal: function (_a) {
            var amount = _a.amount;
            return "L'importo totale \u00E8 ".concat(amount, " inferiore alla spesa originale.");
        },
        splitExpenseZeroAmount: 'Per favore inserisci un importo valido prima di continuare.',
        splitExpenseEditTitle: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "Modifica ".concat(amount, " per ").concat(merchant);
        },
        removeSplit: 'Rimuovi divisione',
        paySomeone: function (_a) {
            var _b = _a === void 0 ? {} : _a, name = _b.name;
            return "Paga ".concat(name !== null && name !== void 0 ? name : 'qualcuno');
        },
        expense: 'Spesa',
        categorize: 'Categorizza',
        share: 'Condividi',
        participants: 'Partecipanti',
        createExpense: 'Crea spesa',
        trackDistance: 'Traccia distanza',
        createExpenses: function (_a) {
            var expensesNumber = _a.expensesNumber;
            return "Crea ".concat(expensesNumber, " spese");
        },
        addExpense: 'Aggiungi spesa',
        chooseRecipient: 'Scegli destinatario',
        createExpenseWithAmount: function (_a) {
            var amount = _a.amount;
            return "Crea ".concat(amount, " spesa");
        },
        confirmDetails: 'Conferma i dettagli',
        pay: 'Paga',
        cancelPayment: 'Annulla pagamento',
        cancelPaymentConfirmation: 'Sei sicuro di voler annullare questo pagamento?',
        viewDetails: 'Visualizza dettagli',
        pending: 'In sospeso',
        canceled: 'Annullato',
        posted: 'Pubblicato',
        deleteReceipt: 'Elimina ricevuta',
        deletedTransaction: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "ha eliminato una spesa in questo rapporto, ".concat(merchant, " - ").concat(amount);
        },
        movedFromReport: function (_a) {
            var reportName = _a.reportName;
            return "ha spostato una spesa".concat(reportName ? "da ".concat(reportName) : '');
        },
        movedTransaction: function (_a) {
            var reportUrl = _a.reportUrl, reportName = _a.reportName;
            return "spostato questa spesa".concat(reportName ? "a <a href=\"".concat(reportUrl, "\">").concat(reportName, "</a>") : '');
        },
        unreportedTransaction: 'spostato questa spesa nel tuo spazio personale',
        pendingMatchWithCreditCard: 'Ricevuta in attesa di abbinamento con transazione della carta',
        pendingMatch: 'Partita in sospeso',
        pendingMatchWithCreditCardDescription: 'Ricevuta in attesa di abbinamento con transazione della carta. Segna come contante per annullare.',
        markAsCash: 'Segna come contante',
        routePending: 'Instradamento in corso...',
        receiptScanning: function () { return ({
            one: 'Scansione della ricevuta...',
            other: 'Scansione delle ricevute...',
        }); },
        scanMultipleReceipts: 'Scansiona più ricevute',
        scanMultipleReceiptsDescription: 'Scatta foto di tutte le tue ricevute in una volta, poi conferma i dettagli tu stesso o lascia che SmartScan se ne occupi.',
        receiptScanInProgress: 'Scansione della ricevuta in corso',
        receiptScanInProgressDescription: 'Scansione della ricevuta in corso. Controlla più tardi o inserisci i dettagli ora.',
        duplicateTransaction: function (_a) {
            var isSubmitted = _a.isSubmitted;
            return !isSubmitted
                ? "Spese potenzialmente duplicate identificate. Rivedi i duplicati per consentire l'invio."
                : "Spese potenzialmente duplicate identificate. Rivedi i duplicati per abilitare l'approvazione.";
        },
        receiptIssuesFound: function () { return ({
            one: 'Problema riscontrato',
            other: 'Problemi riscontrati',
        }); },
        fieldPending: 'In sospeso...',
        defaultRate: 'Tariffa predefinita',
        receiptMissingDetails: 'Dettagli della ricevuta mancanti',
        missingAmount: 'Importo mancante',
        missingMerchant: 'Commerciante mancante',
        receiptStatusTitle: 'Scansione in corso…',
        receiptStatusText: 'Solo tu puoi vedere questa ricevuta mentre viene scansionata. Controlla più tardi o inserisci i dettagli ora.',
        receiptScanningFailed: 'La scansione della ricevuta non è riuscita. Inserisci i dettagli manualmente.',
        transactionPendingDescription: 'Transazione in sospeso. Potrebbe richiedere alcuni giorni per essere registrata.',
        companyInfo: "Informazioni sull'azienda",
        companyInfoDescription: 'Abbiamo bisogno di alcuni dettagli in più prima che tu possa inviare la tua prima fattura.',
        yourCompanyName: 'Il nome della tua azienda',
        yourCompanyWebsite: 'Il sito web della tua azienda',
        yourCompanyWebsiteNote: 'Se non hai un sito web, puoi fornire il profilo LinkedIn della tua azienda o un profilo sui social media.',
        invalidDomainError: 'Hai inserito un dominio non valido. Per continuare, inserisci un dominio valido.',
        publicDomainError: 'Sei entrato in un dominio pubblico. Per continuare, inserisci un dominio privato.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: function (_a) {
            var _b = _a.scanningReceipts, scanningReceipts = _b === void 0 ? 0 : _b, _c = _a.pendingReceipts, pendingReceipts = _c === void 0 ? 0 : _c;
            var statusText = [];
            if (scanningReceipts > 0) {
                statusText.push("".concat(scanningReceipts, " scansione"));
            }
            if (pendingReceipts > 0) {
                statusText.push("".concat(pendingReceipts, " in sospeso"));
            }
            return {
                one: statusText.length > 0 ? "1 spesa (".concat(statusText.join(', '), ")") : "1 spesa",
                other: function (count) { return (statusText.length > 0 ? "".concat(count, " spese (").concat(statusText.join(', '), ")") : "".concat(count, " spese")); },
            };
        },
        expenseCount: function () {
            return {
                one: '1 spesa',
                other: function (count) { return "".concat(count, " spese"); },
            };
        },
        deleteExpense: function () { return ({
            one: 'Elimina spesa',
            other: 'Elimina spese',
        }); },
        deleteConfirmation: function () { return ({
            one: 'Sei sicuro di voler eliminare questa spesa?',
            other: 'Sei sicuro di voler eliminare queste spese?',
        }); },
        deleteReport: 'Elimina rapporto',
        deleteReportConfirmation: 'Sei sicuro di voler eliminare questo report?',
        settledExpensify: 'Pagato',
        done: 'Fatto',
        settledElsewhere: 'Pagato altrove',
        individual: 'Individuale',
        business: 'Business',
        settleExpensify: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Paga ".concat(formattedAmount, " con Expensify") : "Paga con Expensify");
        },
        settlePersonal: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Paga ".concat(formattedAmount, " come individuo") : "Paga come individuo");
        },
        settlePayment: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return "Paga ".concat(formattedAmount);
        },
        settleBusiness: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Paga ".concat(formattedAmount, " come azienda") : "Paga come un'azienda");
        },
        payElsewhere: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Paga ".concat(formattedAmount, " altrove") : "Paga altrove");
        },
        nextStep: 'Prossimi passi',
        finished: 'Finito',
        flip: 'Inverti',
        sendInvoice: function (_a) {
            var amount = _a.amount;
            return "Invia fattura di ".concat(amount);
        },
        submitAmount: function (_a) {
            var amount = _a.amount;
            return "Invia ".concat(amount);
        },
        expenseAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount).concat(comment ? "per ".concat(comment) : '');
        },
        submitted: "inviato",
        automaticallySubmitted: "inviato tramite <a href=\"".concat(CONST_1.default.SELECT_WORKFLOWS_HELP_URL, "\">invio ritardato</a>"),
        trackedAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "tracking ".concat(formattedAmount).concat(comment ? "per ".concat(comment) : '');
        },
        splitAmount: function (_a) {
            var amount = _a.amount;
            return "dividi ".concat(amount);
        },
        didSplitAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "split ".concat(formattedAmount).concat(comment ? "per ".concat(comment) : '');
        },
        yourSplit: function (_a) {
            var amount = _a.amount;
            return "La tua parte ".concat(amount);
        },
        payerOwesAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount, comment = _a.comment;
            return "".concat(payer, " deve ").concat(amount).concat(comment ? "per ".concat(comment) : '');
        },
        payerOwes: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " deve:");
        },
        payerPaidAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount;
            return "".concat(payer ? "".concat(payer, " ") : '', "ha pagato ").concat(amount);
        },
        payerPaid: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " ha pagato:");
        },
        payerSpentAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount;
            return "".concat(payer, " ha speso ").concat(amount);
        },
        payerSpent: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " ha speso:");
        },
        managerApproved: function (_a) {
            var manager = _a.manager;
            return "".concat(manager, " approvato:");
        },
        managerApprovedAmount: function (_a) {
            var manager = _a.manager, amount = _a.amount;
            return "".concat(manager, " ha approvato ").concat(amount);
        },
        payerSettled: function (_a) {
            var amount = _a.amount;
            return "pagato ".concat(amount);
        },
        payerSettledWithMissingBankAccount: function (_a) {
            var amount = _a.amount;
            return "pagato ".concat(amount, ". Aggiungi un conto bancario per ricevere il tuo pagamento.");
        },
        automaticallyApproved: "approvato tramite <a href=\"".concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">regole dello spazio di lavoro</a>"),
        approvedAmount: function (_a) {
            var amount = _a.amount;
            return "approvato ".concat(amount);
        },
        approvedMessage: "approvato",
        unapproved: "non approvato",
        automaticallyForwarded: "approvato tramite <a href=\"".concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">regole dello spazio di lavoro</a>"),
        forwarded: "approvato",
        rejectedThisReport: 'ha respinto questo rapporto',
        waitingOnBankAccount: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName;
            return "ha iniziato a saldare. Il pagamento \u00E8 in sospeso fino a quando ".concat(submitterDisplayName, " non aggiunge un conto bancario.");
        },
        adminCanceledRequest: function (_a) {
            var manager = _a.manager;
            return "".concat(manager ? "".concat(manager, ": ") : '', " ha annullato il pagamento");
        },
        canceledRequest: function (_a) {
            var amount = _a.amount, submitterDisplayName = _a.submitterDisplayName;
            return "annullato il pagamento di ".concat(amount, ", perch\u00E9 ").concat(submitterDisplayName, " non ha attivato il loro Expensify Wallet entro 30 giorni");
        },
        settledAfterAddedBankAccount: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName, amount = _a.amount;
            return "".concat(submitterDisplayName, " ha aggiunto un conto bancario. Il pagamento di ").concat(amount, " \u00E8 stato effettuato.");
        },
        paidElsewhere: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', "pagato altrove");
        },
        paidWithExpensify: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', " pagato con Expensify");
        },
        automaticallyPaidWithExpensify: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', " ha pagato con Expensify tramite <a href=\"").concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">regole dello spazio di lavoro</a>");
        },
        noReimbursableExpenses: 'Questo rapporto ha un importo non valido',
        pendingConversionMessage: 'Il totale verrà aggiornato quando sarai di nuovo online.',
        changedTheExpense: 'modificato la spesa',
        setTheRequest: function (_a) {
            var valueName = _a.valueName, newValueToDisplay = _a.newValueToDisplay;
            return "il ".concat(valueName, " a ").concat(newValueToDisplay);
        },
        setTheDistanceMerchant: function (_a) {
            var translatedChangedField = _a.translatedChangedField, newMerchant = _a.newMerchant, newAmountToDisplay = _a.newAmountToDisplay;
            return "imposta il ".concat(translatedChangedField, " su ").concat(newMerchant, ", che imposta l'importo su ").concat(newAmountToDisplay);
        },
        removedTheRequest: function (_a) {
            var valueName = _a.valueName, oldValueToDisplay = _a.oldValueToDisplay;
            return "il ".concat(valueName, " (precedentemente ").concat(oldValueToDisplay, ")");
        },
        updatedTheRequest: function (_a) {
            var valueName = _a.valueName, newValueToDisplay = _a.newValueToDisplay, oldValueToDisplay = _a.oldValueToDisplay;
            return "il ".concat(valueName, " a ").concat(newValueToDisplay, " (precedentemente ").concat(oldValueToDisplay, ")");
        },
        updatedTheDistanceMerchant: function (_a) {
            var translatedChangedField = _a.translatedChangedField, newMerchant = _a.newMerchant, oldMerchant = _a.oldMerchant, newAmountToDisplay = _a.newAmountToDisplay, oldAmountToDisplay = _a.oldAmountToDisplay;
            return "ha cambiato il ".concat(translatedChangedField, " in ").concat(newMerchant, " (precedentemente ").concat(oldMerchant, "), il che ha aggiornato l'importo a ").concat(newAmountToDisplay, " (precedentemente ").concat(oldAmountToDisplay, ")");
        },
        threadExpenseReportName: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount, " ").concat(comment ? "per ".concat(comment) : 'spesa');
        },
        invoiceReportName: function (_a) {
            var linkedReportID = _a.linkedReportID;
            return "Rapporto Fattura n. ".concat(linkedReportID);
        },
        threadPaySomeoneReportName: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount, " inviato").concat(comment ? "per ".concat(comment) : '');
        },
        movedFromPersonalSpace: function (_a) {
            var workspaceName = _a.workspaceName, reportName = _a.reportName;
            return "spostato la spesa dallo spazio personale a ".concat(workspaceName !== null && workspaceName !== void 0 ? workspaceName : "chatta con ".concat(reportName));
        },
        movedToPersonalSpace: 'spesa spostata nello spazio personale',
        tagSelection: 'Seleziona un tag per organizzare meglio le tue spese.',
        categorySelection: 'Seleziona una categoria per organizzare meglio le tue spese.',
        error: {
            invalidCategoryLength: 'Il nome della categoria supera i 255 caratteri. Si prega di accorciarlo o scegliere una categoria diversa.',
            invalidTagLength: 'Il nome del tag supera i 255 caratteri. Per favore, accorcialo o scegli un tag diverso.',
            invalidAmount: 'Si prega di inserire un importo valido prima di continuare',
            invalidIntegerAmount: 'Inserisci un importo in dollari intero prima di continuare',
            invalidTaxAmount: function (_a) {
                var amount = _a.amount;
                return "L'importo massimo delle tasse \u00E8 ".concat(amount);
            },
            invalidSplit: "La somma delle suddivisioni deve essere uguale all'importo totale",
            invalidSplitParticipants: 'Inserisci un importo maggiore di zero per almeno due partecipanti',
            invalidSplitYourself: 'Inserisci un importo diverso da zero per la tua divisione',
            noParticipantSelected: 'Seleziona un partecipante per favore',
            other: 'Errore imprevisto. Per favore riprova più tardi.',
            genericCreateFailureMessage: "Errore imprevisto durante l'invio di questa spesa. Per favore riprova più tardi.",
            genericCreateInvoiceFailureMessage: "Errore imprevisto nell'invio di questa fattura. Per favore riprova più tardi.",
            genericHoldExpenseFailureMessage: 'Errore imprevisto nel trattenere questa spesa. Per favore riprova più tardi.',
            genericUnholdExpenseFailureMessage: 'Errore imprevisto nel rimuovere questa spesa dalla sospensione. Per favore riprova più tardi.',
            receiptDeleteFailureError: "Errore imprevisto durante l'eliminazione di questa ricevuta. Per favore, riprova più tardi.",
            receiptFailureMessage: 'Si è verificato un errore durante il caricamento della tua ricevuta. Per favore',
            receiptFailureMessageShort: 'Si è verificato un errore durante il caricamento della tua ricevuta.',
            tryAgainMessage: 'riprova',
            saveFileMessage: 'salva la ricevuta',
            uploadLaterMessage: 'da caricare più tardi.',
            genericDeleteFailureMessage: "Errore imprevisto nell'eliminazione di questa spesa. Per favore riprova più tardi.",
            genericEditFailureMessage: 'Errore imprevisto durante la modifica di questa spesa. Per favore riprova più tardi.',
            genericSmartscanFailureMessage: 'La transazione manca di campi',
            duplicateWaypointsErrorMessage: 'Si prega di rimuovere i punti di passaggio duplicati',
            atLeastTwoDifferentWaypoints: 'Inserisci almeno due indirizzi diversi per favore.',
            splitExpenseMultipleParticipantsErrorMessage: 'Una spesa non può essere suddivisa tra un workspace e altri membri. Si prega di aggiornare la selezione.',
            invalidMerchant: 'Per favore, inserisci un commerciante valido',
            atLeastOneAttendee: 'Deve essere selezionato almeno un partecipante',
            invalidQuantity: 'Per favore, inserisci una quantità valida',
            quantityGreaterThanZero: 'La quantità deve essere maggiore di zero',
            invalidSubrateLength: 'Deve esserci almeno una sottotariffa',
            invalidRate: 'Tariffa non valida per questo spazio di lavoro. Si prega di selezionare una tariffa disponibile dallo spazio di lavoro.',
        },
        dismissReceiptError: 'Ignora errore',
        dismissReceiptErrorConfirmation: 'Attenzione! Ignorare questo errore rimuoverà completamente la ricevuta caricata. Sei sicuro?',
        waitingOnEnabledWallet: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName;
            return "ha iniziato a regolare. Il pagamento \u00E8 in sospeso fino a quando ".concat(submitterDisplayName, " non abilita il loro portafoglio.");
        },
        enableWallet: 'Abilita portafoglio',
        hold: 'Attendere',
        unhold: 'Rimuovi blocco',
        holdExpense: 'Trattieni spesa',
        unholdExpense: 'Sblocca spesa',
        heldExpense: 'trattenuto questa spesa',
        unheldExpense: 'sblocca questa spesa',
        moveUnreportedExpense: 'Sposta spesa non segnalata',
        addUnreportedExpense: 'Aggiungi spesa non segnalata',
        createNewExpense: 'Crea nuova spesa',
        selectUnreportedExpense: 'Seleziona almeno una spesa da aggiungere al rapporto.',
        emptyStateUnreportedExpenseTitle: 'Nessuna spesa non segnalata',
        emptyStateUnreportedExpenseSubtitle: 'Sembra che non hai spese non segnalate. Prova a crearne una qui sotto.',
        addUnreportedExpenseConfirm: 'Aggiungi al report',
        explainHold: 'Spiega perché stai trattenendo questa spesa.',
        undoSubmit: 'Annulla invio',
        retracted: 'retratato',
        undoClose: 'Annulla chiusura',
        reopened: 'riaperto',
        reopenReport: 'Riapri rapporto',
        reopenExportedReportConfirmation: function (_a) {
            var connectionName = _a.connectionName;
            return "Questo report \u00E8 gi\u00E0 stato esportato su ".concat(connectionName, ". Modificarlo potrebbe causare discrepanze nei dati. Sei sicuro di voler riaprire questo report?");
        },
        reason: 'Motivo',
        holdReasonRequired: 'È necessario fornire una motivazione quando si mette in attesa.',
        expenseWasPutOnHold: 'La spesa è stata messa in sospeso',
        expenseOnHold: 'Questa spesa è stata messa in sospeso. Si prega di controllare i commenti per i prossimi passi.',
        expensesOnHold: 'Tutte le spese sono state sospese. Si prega di rivedere i commenti per i prossimi passi.',
        expenseDuplicate: "Questa spesa ha dettagli simili a un'altra. Si prega di controllare i duplicati per continuare.",
        someDuplicatesArePaid: 'Alcuni di questi duplicati sono già stati approvati o pagati.',
        reviewDuplicates: 'Rivedi duplicati',
        keepAll: 'Tieni tutto',
        confirmApprove: "Conferma l'importo approvato",
        confirmApprovalAmount: "Approva solo le spese conformi o approva l'intero rapporto.",
        confirmApprovalAllHoldAmount: function () { return ({
            one: 'Questa spesa è in sospeso. Vuoi approvarla comunque?',
            other: 'Queste spese sono in sospeso. Vuoi approvarle comunque?',
        }); },
        confirmPay: "Conferma l'importo del pagamento",
        confirmPayAmount: "Paga ciò che non è in sospeso o paga l'intero rapporto.",
        confirmPayAllHoldAmount: function () { return ({
            one: 'Questa spesa è in sospeso. Vuoi pagare comunque?',
            other: 'Queste spese sono in sospeso. Vuoi pagare comunque?',
        }); },
        payOnly: 'Paga solo',
        approveOnly: 'Approva solo',
        holdEducationalTitle: 'Questa richiesta è attiva',
        holdEducationalText: 'tieni',
        whatIsHoldExplain: 'Mettere in sospeso è come premere "pausa" su una spesa per chiedere ulteriori dettagli prima dell\'approvazione o del pagamento.',
        holdIsLeftBehind: "Le spese trattenute vengono spostate in un altro report al momento dell'approvazione o del pagamento.",
        unholdWhenReady: "Gli approvatori possono sbloccare le spese quando sono pronte per l'approvazione o il pagamento.",
        changePolicyEducational: {
            title: 'Hai spostato questo report!',
            description: 'Ricontrolla questi elementi, che tendono a cambiare quando si spostano i report in un nuovo spazio di lavoro.',
            reCategorize: '<strong>Ricategorizza qualsiasi spesa</strong> per conformarti alle regole dello spazio di lavoro.',
            workflows: 'Questo rapporto potrebbe ora essere soggetto a un diverso <strong>flusso di approvazione.</strong>',
        },
        changeWorkspace: 'Cambia spazio di lavoro',
        set: 'set',
        changed: 'cambiato',
        removed: 'rimosso',
        transactionPending: 'Transazione in sospeso.',
        chooseARate: "Seleziona una tariffa di rimborso per miglio o chilometro per l'area di lavoro",
        unapprove: 'Non approvare',
        unapproveReport: 'Disapprova rapporto',
        headsUp: 'Attenzione!',
        unapproveWithIntegrationWarning: function (_a) {
            var accountingIntegration = _a.accountingIntegration;
            return "Questo report \u00E8 gi\u00E0 stato esportato su ".concat(accountingIntegration, ". Modificarlo potrebbe portare a discrepanze nei dati. Sei sicuro di voler disapprovare questo report?");
        },
        reimbursable: 'rimborsabile',
        nonReimbursable: 'non-rimborsabile',
        bookingPending: 'Questa prenotazione è in sospeso',
        bookingPendingDescription: 'Questa prenotazione è in sospeso perché non è stata ancora pagata.',
        bookingArchived: 'Questa prenotazione è archiviata',
        bookingArchivedDescription: "Questa prenotazione è archiviata perché la data del viaggio è passata. Aggiungi una spesa per l'importo finale, se necessario.",
        attendees: 'Partecipanti',
        whoIsYourAccountant: 'Chi è il tuo contabile?',
        paymentComplete: 'Pagamento completato',
        time: 'Tempo',
        startDate: 'Data di inizio',
        endDate: 'Data di fine',
        startTime: 'Ora di inizio',
        endTime: 'Ora di fine',
        deleteSubrate: 'Elimina sottotariffa',
        deleteSubrateConfirmation: 'Sei sicuro di voler eliminare questa sottotariffa?',
        quantity: 'Quantità',
        subrateSelection: 'Seleziona una sottotariffa e inserisci una quantità.',
        qty: 'Qtà.',
        firstDayText: function () { return ({
            one: "Primo giorno: 1 ora",
            other: function (count) { return "Primo giorno: ".concat(count.toFixed(2), " ore"); },
        }); },
        lastDayText: function () { return ({
            one: "Ultimo giorno: 1 ora",
            other: function (count) { return "Ultimo giorno: ".concat(count.toFixed(2), " ore"); },
        }); },
        tripLengthText: function () { return ({
            one: "Viaggio: 1 giorno intero",
            other: function (count) { return "Viaggio: ".concat(count, " giorni interi"); },
        }); },
        dates: 'Date di calendario',
        rates: 'Tariffe',
        submitsTo: function (_a) {
            var name = _a.name;
            return "Invia a ".concat(name);
        },
        moveExpenses: function () { return ({ one: 'Sposta spesa', other: 'Sposta spese' }); },
    },
    share: {
        shareToExpensify: 'Condividi su Expensify',
        messageInputLabel: 'Messaggio',
    },
    notificationPreferencesPage: {
        header: 'Preferenze di notifica',
        label: 'Notificami dei nuovi messaggi',
        notificationPreferences: {
            always: 'Immediatamente',
            daily: 'Quotidiano',
            mute: 'Disattiva audio',
            hidden: 'Nascosto',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Il numero non è stato convalidato. Clicca il pulsante per rinviare il link di convalida tramite SMS.',
        emailHasNotBeenValidated: "L'email non è stata convalidata. Clicca il pulsante per rinviare il link di convalida tramite SMS.",
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Carica foto',
        removePhoto: 'Rimuovi foto',
        editImage: 'Modifica foto',
        viewPhoto: 'Visualizza foto',
        imageUploadFailed: "Caricamento dell'immagine non riuscito",
        deleteWorkspaceError: "Spiacenti, si è verificato un problema inaspettato nell'eliminazione dell'avatar del tuo spazio di lavoro.",
        sizeExceeded: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "L'immagine selezionata supera la dimensione massima di caricamento di ".concat(maxUploadSizeInMB, " MB.");
        },
        resolutionConstraints: function (_a) {
            var minHeightInPx = _a.minHeightInPx, minWidthInPx = _a.minWidthInPx, maxHeightInPx = _a.maxHeightInPx, maxWidthInPx = _a.maxWidthInPx;
            return "Carica un'immagine pi\u00F9 grande di ".concat(minHeightInPx, "x").concat(minWidthInPx, " pixel e pi\u00F9 piccola di ").concat(maxHeightInPx, "x").concat(maxWidthInPx, " pixel.");
        },
        notAllowedExtension: function (_a) {
            var allowedExtensions = _a.allowedExtensions;
            return "L'immagine del profilo deve essere di uno dei seguenti tipi: ".concat(allowedExtensions.join(', '), ".");
        },
    },
    modal: {
        backdropLabel: 'Sfondo del Modale',
    },
    profilePage: {
        profile: 'Profilo',
        preferredPronouns: 'Pronomi preferiti',
        selectYourPronouns: 'Seleziona i tuoi pronomi',
        selfSelectYourPronoun: 'Seleziona il tuo pronome',
        emailAddress: 'Indirizzo email',
        setMyTimezoneAutomatically: 'Imposta automaticamente il mio fuso orario',
        timezone: 'Fuso orario',
        invalidFileMessage: "File non valido. Per favore prova con un'immagine diversa.",
        avatarUploadFailureMessage: "Si è verificato un errore durante il caricamento dell'avatar. Per favore riprova.",
        online: 'Online',
        offline: 'Offline',
        syncing: 'Sincronizzazione',
        profileAvatar: 'Avatar del profilo',
        publicSection: {
            title: 'Pubblico',
            subtitle: 'Questi dettagli sono visualizzati sul tuo profilo pubblico. Chiunque può vederli.',
        },
        privateSection: {
            title: 'Privato',
            subtitle: 'Questi dettagli sono utilizzati per viaggi e pagamenti. Non vengono mai mostrati nel tuo profilo pubblico.',
        },
    },
    securityPage: {
        title: 'Opzioni di sicurezza',
        subtitle: "Abilita l'autenticazione a due fattori per mantenere sicuro il tuo account.",
        goToSecurity: 'Torna alla pagina di sicurezza',
    },
    shareCodePage: {
        title: 'Il tuo codice',
        subtitle: 'Invita i membri a Expensify condividendo il tuo codice QR personale o il link di riferimento.',
    },
    pronounsPage: {
        pronouns: 'Pronomi',
        isShownOnProfile: 'I tuoi pronomi sono mostrati nel tuo profilo.',
        placeholderText: 'Cerca per vedere le opzioni',
    },
    contacts: {
        contactMethod: 'Metodo di contatto',
        contactMethods: 'Metodi di contatto',
        featureRequiresValidate: 'Questa funzione richiede di convalidare il tuo account.',
        validateAccount: 'Convalida il tuo account',
        helpTextBeforeEmail: 'Aggiungi più modi per farti trovare e inoltra le ricevute a',
        helpTextAfterEmail: 'da più indirizzi email.',
        pleaseVerify: 'Si prega di verificare questo metodo di contatto',
        getInTouch: 'Ogni volta che avremo bisogno di contattarti, useremo questo metodo di contatto.',
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Per favore, inserisci il codice magico inviato a ".concat(contactMethod, ". Dovrebbe arrivare entro un minuto o due.");
        },
        setAsDefault: 'Imposta come predefinito',
        yourDefaultContactMethod: 'Questo è il tuo metodo di contatto predefinito attuale. Prima di poterlo eliminare, dovrai scegliere un altro metodo di contatto e fare clic su "Imposta come predefinito".',
        removeContactMethod: 'Rimuovi metodo di contatto',
        removeAreYouSure: 'Sei sicuro di voler rimuovere questo metodo di contatto? Questa azione non può essere annullata.',
        failedNewContact: 'Impossibile aggiungere questo metodo di contatto.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Impossibile inviare un nuovo codice magico. Attendere un momento e riprovare.',
            validateSecondaryLogin: 'Codice magico errato o non valido. Per favore riprova o richiedi un nuovo codice.',
            deleteContactMethod: 'Impossibile eliminare il metodo di contatto. Si prega di contattare Concierge per assistenza.',
            setDefaultContactMethod: 'Impossibile impostare un nuovo metodo di contatto predefinito. Si prega di contattare Concierge per assistenza.',
            addContactMethod: 'Impossibile aggiungere questo metodo di contatto. Si prega di contattare Concierge per assistenza.',
            enteredMethodIsAlreadySubmitted: 'Questo metodo di contatto esiste già',
            passwordRequired: 'password richiesto.',
            contactMethodRequired: 'Il metodo di contatto è obbligatorio',
            invalidContactMethod: 'Metodo di contatto non valido',
        },
        newContactMethod: 'Nuovo metodo di contatto',
        goBackContactMethods: 'Torna ai metodi di contatto',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Lui / Lui / Suo',
        heHimHisTheyThemTheirs: 'Lui / Lui / Suo / Loro / Loro / Loro',
        sheHerHers: 'Lei / Lei / Suoi',
        sheHerHersTheyThemTheirs: 'Lei / Lei / Suo / Loro / Loro / Loro',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'Loro / Loro / Loro',
        thonThons: 'Thon / Thons',
        veVerVis: 'Vai / Vedi / Visibilità',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Chiamami per nome',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: 'Nome visualizzato',
        isShownOnProfile: 'Il tuo nome visualizzato è mostrato sul tuo profilo.',
    },
    timezonePage: {
        timezone: 'Fuso orario',
        isShownOnProfile: 'Il tuo fuso orario è mostrato nel tuo profilo.',
        getLocationAutomatically: 'Determina automaticamente la tua posizione',
    },
    updateRequiredView: {
        updateRequired: 'Aggiornamento richiesto',
        pleaseInstall: "Si prega di aggiornare all'ultima versione di New Expensify",
        pleaseInstallExpensifyClassic: "Si prega di installare l'ultima versione di Expensify",
        toGetLatestChanges: "Per dispositivi mobili o desktop, scarica e installa l'ultima versione. Per il web, aggiorna il tuo browser.",
        newAppNotAvailable: 'La nuova app Expensify non è più disponibile.',
    },
    initialSettingsPage: {
        about: 'Informazioni su',
        aboutPage: {
            description: 'La nuova app Expensify è costruita da una comunità di sviluppatori open-source provenienti da tutto il mondo. Aiutaci a costruire il futuro di Expensify.',
            appDownloadLinks: "Link per il download dell'app",
            viewKeyboardShortcuts: 'Visualizza le scorciatoie da tastiera',
            viewTheCode: 'Visualizza il codice',
            viewOpenJobs: 'Visualizza lavori aperti',
            reportABug: 'Segnala un bug',
            troubleshoot: 'Risoluzione dei problemi',
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
            clearCacheAndRestart: 'Cancella cache e riavvia',
            viewConsole: 'Visualizza console di debug',
            debugConsole: 'Console di debug',
            description: "Usa gli strumenti qui sotto per aiutarti a risolvere i problemi con l'esperienza Expensify. Se incontri problemi, per favore",
            submitBug: 'segnala un bug',
            confirmResetDescription: 'Tutti i messaggi di bozza non inviati andranno persi, ma il resto dei tuoi dati è al sicuro.',
            resetAndRefresh: 'Reimposta e aggiorna',
            clientSideLogging: 'Registrazione lato client',
            noLogsToShare: 'Nessun registro da condividere',
            useProfiling: 'Usa il profiling',
            profileTrace: 'Traccia profilo',
            results: 'Risultati',
            releaseOptions: 'Opzioni di rilascio',
            testingPreferences: 'Preferenze di test',
            useStagingServer: 'Usa il server di staging',
            forceOffline: 'Forza offline',
            simulatePoorConnection: 'Simula una connessione internet scadente.',
            simulateFailingNetworkRequests: 'Simula richieste di rete non riuscite',
            authenticationStatus: 'Stato di autenticazione',
            deviceCredentials: 'Credenziali del dispositivo',
            invalidate: 'Invalidare',
            destroy: 'Distruggere',
            maskExportOnyxStateData: "Maschera i dati sensibili dei membri durante l'esportazione dello stato di Onyx",
            exportOnyxState: 'Esporta stato Onyx',
            importOnyxState: 'Importa lo stato di Onyx',
            testCrash: 'Test crash',
            resetToOriginalState: 'Ripristina allo stato originale',
            usingImportedState: 'Stai utilizzando uno stato importato. Premi qui per cancellarlo.',
            debugMode: 'Modalità debug',
            invalidFile: 'File non valido',
            invalidFileDescription: 'Il file che stai cercando di importare non è valido. Per favore riprova.',
            invalidateWithDelay: 'Invalidare con ritardo',
            recordTroubleshootData: 'Registrazione dei dati di risoluzione dei problemi',
        },
        debugConsole: {
            saveLog: 'Salva registro',
            shareLog: 'Condividi registro',
            enterCommand: 'Inserisci comando',
            execute: 'Esegui',
            noLogsAvailable: 'Nessun registro disponibile',
            logSizeTooLarge: function (_a) {
                var size = _a.size;
                return "La dimensione del registro supera il limite di ".concat(size, " MB. Si prega di utilizzare \"Salva registro\" per scaricare il file di registro.");
            },
            logs: 'Registri',
            viewConsole: 'Visualizza console',
        },
        security: 'Sicurezza',
        signOut: 'Esci',
        restoreStashed: 'Ripristina accesso nascosto',
        signOutConfirmationText: 'Perderai tutte le modifiche offline se esci.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: 'Leggi il',
            phrase2: 'Termini di Servizio',
            phrase3: 'e',
            phrase4: 'Privacy',
        },
        help: 'Aiuto',
        accountSettings: 'Impostazioni account',
        account: 'Account',
        general: 'Generale',
    },
    closeAccountPage: {
        closeAccount: 'Chiudi account',
        reasonForLeavingPrompt: 'Ci dispiacerebbe vederti andare via! Potresti gentilmente dirci il motivo, così possiamo migliorare?',
        enterMessageHere: 'Inserisci il messaggio qui',
        closeAccountWarning: 'La chiusura del tuo account non può essere annullata.',
        closeAccountPermanentlyDeleteData: 'Sei sicuro di voler eliminare il tuo account? Questo eliminerà definitivamente tutte le spese in sospeso.',
        enterDefaultContactToConfirm: 'Inserisci il tuo metodo di contatto predefinito per confermare che desideri chiudere il tuo account. Il tuo metodo di contatto predefinito è:',
        enterDefaultContact: 'Inserisci il tuo metodo di contatto predefinito',
        defaultContact: 'Metodo di contatto predefinito:',
        enterYourDefaultContactMethod: 'Inserisci il tuo metodo di contatto predefinito per chiudere il tuo account.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Unisci account',
        accountDetails: {
            accountToMergeInto: "Inserisci l'account in cui vuoi unire",
            notReversibleConsent: 'Capisco che questo non è reversibile.',
        },
        accountValidate: {
            confirmMerge: 'Sei sicuro di voler unire gli account?',
            lossOfUnsubmittedData: "Unire i tuoi account \u00E8 irreversibile e comporter\u00E0 la perdita di eventuali spese non inviate per",
            enterMagicCode: "Per continuare, inserisci il codice magico inviato a",
            errors: {
                incorrectMagicCode: 'Codice magico errato o non valido. Per favore riprova o richiedi un nuovo codice.',
                fallback: 'Qualcosa è andato storto. Per favore riprova più tardi.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Account uniti!',
            successfullyMergedAllData: {
                beforeFirstEmail: "Hai unito con successo tutti i dati da",
                beforeSecondEmail: "in",
                afterSecondEmail: ". D'ora in poi, puoi utilizzare entrambi i login per questo account.",
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Ci stiamo lavorando su.',
            limitedSupport: 'Non supportiamo ancora la fusione degli account su New Expensify. Si prega di effettuare questa operazione su Expensify Classic.',
            reachOutForHelp: {
                beforeLink: 'Sentiti libero di',
                linkText: 'contatta Concierge',
                afterLink: 'se hai domande!',
            },
            goToExpensifyClassic: 'Vai a Expensify Classic',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: 'Non puoi unire',
            beforeDomain: 'perché è controllato da',
            afterDomain: '. Per favore',
            linkText: 'contatta Concierge',
            afterLink: 'per assistenza.',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: 'Non puoi unire',
            afterEmail: "in altri account perché l'amministratore del tuo dominio l'ha impostato come login principale. Unisci invece altri account in questo.",
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: 'Non puoi unire gli account perché',
                beforeSecondEmail: "ha l'autenticazione a due fattori (2FA) abilitata. Si prega di disabilitare 2FA per",
                afterSecondEmail: 'e riprova.',
            },
            learnMore: 'Scopri di più sulla fusione degli account.',
        },
        mergeFailureAccountLocked: {
            beforeEmail: 'Non puoi unire',
            afterEmail: 'perché è bloccato. Per favore',
            linkText: 'contatta Concierge',
            afterLink: "per assistenza.",
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: 'Non puoi unire gli account perché',
                afterEmail: 'non ha un account Expensify.',
            },
            addContactMethod: {
                beforeLink: 'Per favore',
                linkText: 'aggiungilo come metodo di contatto',
                afterLink: 'invece.',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: 'Non puoi unire',
            afterEmail: 'in altri account. Si prega di unire altri account in esso invece.',
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: 'Non puoi unire',
            afterEmail: 'in altri account perché è il proprietario della fatturazione di un account fatturato. Si prega di unire altri account in esso invece.',
        },
        mergeFailureTooManyAttempts: {
            heading: 'Riprova più tardi',
            description: 'Ci sono stati troppi tentativi di unire gli account. Per favore riprova più tardi.',
        },
        mergeFailureUnvalidatedAccount: {
            description: "Non puoi unire ad altri account perché non è convalidato. Per favore, convalida l'account e riprova.",
        },
        mergeFailureSelfMerge: {
            description: 'Non puoi unire un account con se stesso.',
        },
        mergeFailureGenericHeading: 'Impossibile unire gli account',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Segnala attività sospetta',
        lockAccount: 'Blocca account',
        unlockAccount: 'Sblocca account',
        compromisedDescription: 'Notato qualcosa di strano nel tuo account? Segnalandolo lo bloccherai immediatamente, fermerai le transazioni con la carta Expensify e impedirai modifiche.',
        domainAdminsDescription: 'Per gli amministratori di dominio: questo sospende anche tutta l’attività delle carte Expensify e le azioni amministrative.',
        areYouSure: 'Sei sicuro di voler bloccare il tuo account Expensify?',
        ourTeamWill: 'Il nostro team indagherà e rimuoverà eventuali accessi non autorizzati. Per riottenere l’accesso, dovrai collaborare con Concierge.',
    },
    failedToLockAccountPage: {
        failedToLockAccount: "Impossibile bloccare l'account",
        failedToLockAccountDescription: "Non siamo riusciti a bloccare il tuo account. Per favore, chatta con Concierge per risolvere questo problema.",
        chatWithConcierge: 'Chatta con Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Account bloccato',
        yourAccountIsLocked: 'Il tuo account è bloccato',
        chatToConciergeToUnlock: 'Chatta con Concierge per risolvere i problemi di sicurezza e sbloccare il tuo account.',
        chatWithConcierge: 'Chatta con Concierge',
    },
    passwordPage: {
        changePassword: 'Cambia password',
        changingYourPasswordPrompt: 'Cambiare la tua password aggiornerà la password sia per il tuo account Expensify.com che per il tuo account New Expensify.',
        currentPassword: 'Password attuale',
        newPassword: 'Nuova password',
        newPasswordPrompt: 'La tua nuova password deve essere diversa dalla tua vecchia password e contenere almeno 8 caratteri, 1 lettera maiuscola, 1 lettera minuscola e 1 numero.',
    },
    twoFactorAuth: {
        headerTitle: 'Autenticazione a due fattori',
        twoFactorAuthEnabled: 'Autenticazione a due fattori abilitata',
        whatIsTwoFactorAuth: "L'autenticazione a due fattori (2FA) aiuta a mantenere sicuro il tuo account. Quando accedi, dovrai inserire un codice generato dalla tua app di autenticazione preferita.",
        disableTwoFactorAuth: "Disabilita l'autenticazione a due fattori",
        explainProcessToRemove: "Per disabilitare l'autenticazione a due fattori (2FA), inserisci un codice valido dalla tua app di autenticazione.",
        disabled: "L'autenticazione a due fattori è ora disabilitata",
        noAuthenticatorApp: "Non avrai più bisogno di un'app di autenticazione per accedere a Expensify.",
        stepCodes: 'Codici di recupero',
        keepCodesSafe: 'Conserva questi codici di recupero al sicuro!',
        codesLoseAccess: "Se perdi l'accesso alla tua app di autenticazione e non hai questi codici, perderai l'accesso al tuo account.\n\nNota: Configurare l'autenticazione a due fattori ti disconnetterà da tutte le altre sessioni attive.",
        errorStepCodes: 'Si prega di copiare o scaricare i codici prima di continuare',
        stepVerify: 'Verifica',
        scanCode: 'Scansiona il codice QR utilizzando il tuo',
        authenticatorApp: 'app di autenticazione',
        addKey: 'Oppure aggiungi questa chiave segreta alla tua app di autenticazione:',
        enterCode: 'Quindi inserisci il codice a sei cifre generato dalla tua app di autenticazione.',
        stepSuccess: 'Finito',
        enabled: 'Autenticazione a due fattori abilitata',
        congrats: 'Congratulazioni! Ora hai quella sicurezza in più.',
        copy: 'Copiare',
        disable: 'Disabilita',
        enableTwoFactorAuth: "Abilita l'autenticazione a due fattori",
        pleaseEnableTwoFactorAuth: "Si prega di abilitare l'autenticazione a due fattori.",
        twoFactorAuthIsRequiredDescription: "Per motivi di sicurezza, Xero richiede l'autenticazione a due fattori per connettere l'integrazione.",
        twoFactorAuthIsRequiredForAdminsHeader: 'Autenticazione a due fattori richiesta',
        twoFactorAuthIsRequiredForAdminsTitle: "Si prega di abilitare l'autenticazione a due fattori",
        twoFactorAuthIsRequiredForAdminsDescription: "La tua connessione contabile Xero richiede l'uso dell'autenticazione a due fattori. Per continuare a utilizzare Expensify, ti preghiamo di abilitarla.",
        twoFactorAuthCannotDisable: "Impossibile disabilitare l'autenticazione a due fattori (2FA)",
        twoFactorAuthRequired: "L'autenticazione a due fattori (2FA) è necessaria per la tua connessione Xero e non può essere disabilitata.",
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Per favore inserisci il tuo codice di recupero',
            incorrectRecoveryCode: 'Codice di recupero errato. Per favore riprova.',
        },
        useRecoveryCode: 'Usa il codice di recupero',
        recoveryCode: 'Codice di recupero',
        use2fa: 'Usa il codice di autenticazione a due fattori',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Inserisci il tuo codice di autenticazione a due fattori',
            incorrect2fa: 'Codice di autenticazione a due fattori errato. Per favore riprova.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Password aggiornato!',
        allSet: 'Tutto pronto. Tieni al sicuro la tua nuova password.',
    },
    privateNotes: {
        title: 'Note private',
        personalNoteMessage: "Tieni appunti su questa chat qui. Sei l'unica persona che può aggiungere, modificare o visualizzare questi appunti.",
        sharedNoteMessage: 'Tieni appunti su questa chat qui. I dipendenti di Expensify e altri membri del dominio team.expensify.com possono visualizzare questi appunti.',
        composerLabel: 'Note',
        myNote: 'La mia nota',
        error: {
            genericFailureMessage: 'Le note private non possono essere salvate',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Per favore, inserisci un codice di sicurezza valido',
        },
        securityCode: 'Codice di sicurezza',
        changeBillingCurrency: 'Cambia valuta di fatturazione',
        changePaymentCurrency: 'Cambia la valuta di pagamento',
        paymentCurrency: 'Valuta di pagamento',
        paymentCurrencyDescription: 'Seleziona una valuta standard a cui tutte le spese personali dovrebbero essere convertite',
        note: 'Nota: Cambiare la valuta di pagamento può influire su quanto pagherai per Expensify. Consulta il nostro',
        noteLink: 'pagina dei prezzi',
        noteDetails: 'per i dettagli completi.',
    },
    addDebitCardPage: {
        addADebitCard: 'Aggiungi una carta di debito',
        nameOnCard: 'Nome sulla carta',
        debitCardNumber: 'Numero della carta di debito',
        expiration: 'Data di scadenza',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Indirizzo di fatturazione',
        growlMessageOnSave: 'La tua carta di debito è stata aggiunta con successo',
        expensifyPassword: 'Password di Expensify',
        error: {
            invalidName: 'Il nome può includere solo lettere',
            addressZipCode: 'Si prega di inserire un codice postale valido',
            debitCardNumber: 'Inserisci un numero di carta di debito valido',
            expirationDate: 'Si prega di selezionare una data di scadenza valida',
            securityCode: 'Per favore, inserisci un codice di sicurezza valido',
            addressStreet: 'Inserisci un indirizzo di fatturazione valido che non sia una casella postale',
            addressState: 'Seleziona uno stato per favore',
            addressCity: 'Per favore inserisci una città',
            genericFailureMessage: "Si è verificato un errore durante l'aggiunta della tua carta. Per favore riprova.",
            password: 'Per favore inserisci la tua password di Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Aggiungi carta di pagamento',
        nameOnCard: 'Nome sulla carta',
        paymentCardNumber: 'Numero di carta',
        expiration: 'Data di scadenza',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Indirizzo di fatturazione',
        growlMessageOnSave: 'La tua carta di pagamento è stata aggiunta con successo',
        expensifyPassword: 'Password di Expensify',
        error: {
            invalidName: 'Il nome può includere solo lettere',
            addressZipCode: 'Si prega di inserire un codice postale valido',
            paymentCardNumber: 'Per favore, inserisci un numero di carta valido',
            expirationDate: 'Si prega di selezionare una data di scadenza valida',
            securityCode: 'Per favore, inserisci un codice di sicurezza valido',
            addressStreet: 'Inserisci un indirizzo di fatturazione valido che non sia una casella postale',
            addressState: 'Seleziona uno stato per favore',
            addressCity: 'Per favore inserisci una città',
            genericFailureMessage: "Si è verificato un errore durante l'aggiunta della tua carta. Per favore riprova.",
            password: 'Per favore inserisci la tua password di Expensify',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Metodi di pagamento',
        setDefaultConfirmation: 'Imposta il metodo di pagamento predefinito',
        setDefaultSuccess: 'Metodo di pagamento predefinito impostato!',
        deleteAccount: 'Elimina account',
        deleteConfirmation: 'Sei sicuro di voler eliminare questo account?',
        error: {
            notOwnerOfBankAccount: "Si è verificato un errore durante l'impostazione di questo conto bancario come metodo di pagamento predefinito.",
            invalidBankAccount: 'Questo conto bancario è temporaneamente sospeso.',
            notOwnerOfFund: "Si è verificato un errore durante l'impostazione di questa carta come metodo di pagamento predefinito.",
            setDefaultFailure: 'Qualcosa è andato storto. Si prega di contattare Concierge per ulteriore assistenza.',
        },
        addBankAccountFailure: 'Si è verificato un errore imprevisto durante il tentativo di aggiungere il tuo conto bancario. Per favore riprova.',
        getPaidFaster: 'Ricevi pagamenti più velocemente',
        addPaymentMethod: "Aggiungi un metodo di pagamento per inviare e ricevere pagamenti direttamente nell'app.",
        getPaidBackFaster: 'Ricevi il rimborso più velocemente',
        secureAccessToYourMoney: 'Accesso sicuro ai tuoi soldi',
        receiveMoney: 'Ricevi denaro nella tua valuta locale',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Invia e ricevi denaro con gli amici. Solo conti bancari statunitensi.',
        enableWallet: 'Abilita portafoglio',
        addBankAccountToSendAndReceive: "Ricevi il rimborso per le spese che invii a un'area di lavoro.",
        addBankAccount: 'Aggiungi conto bancario',
        assignedCards: 'Carte assegnate',
        assignedCardsDescription: 'Queste sono carte assegnate da un amministratore del workspace per gestire le spese aziendali.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Stiamo esaminando le tue informazioni. Per favore, ricontrolla tra qualche minuto!',
        walletActivationFailed: 'Purtroppo, il tuo portafoglio non può essere attivato in questo momento. Per favore, contatta Concierge per ulteriore assistenza.',
        addYourBankAccount: 'Aggiungi il tuo conto bancario',
        addBankAccountBody: "Colleghiamo il tuo conto bancario a Expensify in modo che sia più facile che mai inviare e ricevere pagamenti direttamente nell'app.",
        chooseYourBankAccount: 'Scegli il tuo conto bancario',
        chooseAccountBody: 'Assicurati di selezionare quello giusto.',
        confirmYourBankAccount: 'Conferma il tuo conto bancario',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Carta Viaggio Expensify',
        availableSpend: 'Limite rimanente',
        smartLimit: {
            name: 'Limite intelligente',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "Puoi spendere fino a ".concat(formattedLimit, " su questa carta, e il limite verr\u00E0 ripristinato man mano che le tue spese inviate vengono approvate.");
            },
        },
        fixedLimit: {
            name: 'Limite fisso',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "Puoi spendere fino a ".concat(formattedLimit, " su questa carta, dopodich\u00E9 si disattiver\u00E0.");
            },
        },
        monthlyLimit: {
            name: 'Limite mensile',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "Puoi spendere fino a ".concat(formattedLimit, " su questa carta al mese. Il limite verr\u00E0 reimpostato il primo giorno di ogni mese di calendario.");
            },
        },
        virtualCardNumber: 'Numero della carta virtuale',
        travelCardCvv: 'CVV della carta di viaggio',
        physicalCardNumber: 'Numero della carta fisica',
        getPhysicalCard: 'Ottieni carta fisica',
        reportFraud: 'Segnala frode con carta virtuale',
        reportTravelFraud: 'Segnala frode con carta di viaggio',
        reviewTransaction: 'Rivedi transazione',
        suspiciousBannerTitle: 'Transazione sospetta',
        suspiciousBannerDescription: 'Abbiamo notato transazioni sospette sulla tua carta. Tocca qui sotto per rivederle.',
        cardLocked: 'La tua carta è temporaneamente bloccata mentre il nostro team esamina il conto della tua azienda.',
        cardDetails: {
            cardNumber: 'Numero della carta virtuale',
            expiration: 'Scadenza',
            cvv: 'CVV',
            address: 'Indirizzo',
            revealDetails: 'Rivela dettagli',
            revealCvv: 'Mostra CVV',
            copyCardNumber: 'Copia numero di carta',
            updateAddress: 'Aggiorna indirizzo',
        },
        cardAddedToWallet: function (_a) {
            var platform = _a.platform;
            return "Aggiunto al portafoglio ".concat(platform);
        },
        cardDetailsLoadingFailure: 'Si è verificato un errore durante il caricamento dei dettagli della carta. Controlla la tua connessione internet e riprova.',
        validateCardTitle: 'Verifichiamo che sei tu',
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Inserisci il codice magico inviato a ".concat(contactMethod, " per visualizzare i dettagli della tua carta. Dovrebbe arrivare entro un minuto o due.");
        },
    },
    workflowsPage: {
        workflowTitle: 'Spendere',
        workflowDescription: 'Configura un flusso di lavoro dal momento in cui si verifica una spesa, inclusi approvazione e pagamento.',
        delaySubmissionTitle: 'Ritarda invii',
        delaySubmissionDescription: "Scegli un programma personalizzato per l'invio delle spese, oppure lascia disattivato per aggiornamenti in tempo reale sulle spese.",
        submissionFrequency: 'Frequenza di invio',
        submissionFrequencyDateOfMonth: 'Data del mese',
        addApprovalsTitle: 'Aggiungi approvazioni',
        addApprovalButton: 'Aggiungi flusso di lavoro di approvazione',
        addApprovalTip: 'Questo flusso di lavoro predefinito si applica a tutti i membri, a meno che non esista un flusso di lavoro più specifico.',
        approver: 'Approvante',
        connectBankAccount: 'Collega conto bancario',
        addApprovalsDescription: "Richiedi un'approvazione aggiuntiva prima di autorizzare un pagamento.",
        makeOrTrackPaymentsTitle: 'Effettua o traccia pagamenti',
        makeOrTrackPaymentsDescription: 'Aggiungi un pagatore autorizzato per i pagamenti effettuati in Expensify o traccia i pagamenti effettuati altrove.',
        editor: {
            submissionFrequency: 'Scegli quanto tempo Expensify dovrebbe aspettare prima di condividere le spese senza errori.',
        },
        frequencyDescription: 'Scegli con quale frequenza desideri che le spese vengano inviate automaticamente, oppure impostale manualmente.',
        frequencies: {
            instant: 'Istantaneo',
            weekly: 'Settimanale',
            monthly: 'Mensile',
            twiceAMonth: 'Due volte al mese',
            byTrip: 'Per viaggio',
            manually: 'Manuale',
            daily: 'Quotidiano',
            lastDayOfMonth: 'Ultimo giorno del mese',
            lastBusinessDayOfMonth: 'Ultimo giorno lavorativo del mese',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Primo',
                '2': 'Secondo',
                '3': 'Terzo',
                '4': 'Quarto',
                '5': 'Quinto',
                '6': 'Sesto',
                '7': 'Settimo',
                '8': 'Ottavo',
                '9': 'Nono',
                '10': 'Decimo',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Questo membro appartiene già a un altro flusso di approvazione. Eventuali aggiornamenti qui si rifletteranno anche lì.',
        approverCircularReference: function (_a) {
            var name1 = _a.name1, name2 = _a.name2;
            return "<strong>".concat(name1, "</strong> approva gi\u00E0 i report a <strong>").concat(name2, "</strong>. Si prega di scegliere un approvatore diverso per evitare un flusso di lavoro circolare.");
        },
        emptyContent: {
            title: 'Nessun membro da visualizzare',
            expensesFromSubtitle: 'Tutti i membri dello spazio di lavoro appartengono già a un flusso di approvazione esistente.',
            approverSubtitle: 'Tutti gli approvatori appartengono a un flusso di lavoro esistente.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: 'La presentazione ritardata non può essere modificata. Per favore, riprova o contatta il supporto.',
        autoReportingFrequencyErrorMessage: "La frequenza di invio non può essere modificata. Riprova o contatta l'assistenza.",
        monthlyOffsetErrorMessage: 'La frequenza mensile non può essere modificata. Riprova o contatta il supporto.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Conferma',
        header: 'Aggiungi altri approvatori e conferma.',
        additionalApprover: 'Approvazione aggiuntiva',
        submitButton: 'Aggiungi flusso di lavoro',
    },
    workflowsEditApprovalsPage: {
        title: 'Modifica il flusso di lavoro di approvazione',
        deleteTitle: 'Elimina il flusso di lavoro di approvazione',
        deletePrompt: 'Sei sicuro di voler eliminare questo flusso di lavoro di approvazione? Tutti i membri seguiranno successivamente il flusso di lavoro predefinito.',
    },
    workflowsExpensesFromPage: {
        title: 'Spese da',
        header: 'Quando i seguenti membri inviano spese:',
    },
    workflowsApproverPage: {
        genericErrorMessage: "L'approvatore non può essere modificato. Per favore riprova o contatta il supporto.",
        header: "Invia a questo membro per l'approvazione:",
    },
    workflowsPayerPage: {
        title: 'Pagatore autorizzato',
        genericErrorMessage: 'Il pagatore autorizzato non può essere modificato. Per favore riprova.',
        admins: 'Amministratori',
        payer: 'Pagatore',
        paymentAccount: 'Conto di pagamento',
    },
    reportFraudPage: {
        title: 'Segnala frode con carta virtuale',
        description: 'Se i dettagli della tua carta virtuale sono stati rubati o compromessi, disattiveremo permanentemente la tua carta esistente e ti forniremo una nuova carta virtuale e un nuovo numero.',
        deactivateCard: 'Disattiva carta',
        reportVirtualCardFraud: 'Segnala frode con carta virtuale',
    },
    reportFraudConfirmationPage: {
        title: 'Frode con carta segnalato',
        description: 'Abbiamo disattivato permanentemente la tua carta esistente. Quando torni a visualizzare i dettagli della tua carta, avrai una nuova carta virtuale disponibile.',
        buttonText: 'Ricevuto, grazie!',
    },
    activateCardPage: {
        activateCard: 'Attiva carta',
        pleaseEnterLastFour: 'Per favore, inserisci le ultime quattro cifre della tua carta.',
        activatePhysicalCard: 'Attiva carta fisica',
        error: {
            thatDidNotMatch: 'Quello non corrispondeva alle ultime 4 cifre della tua carta. Per favore riprova.',
            throttled: 'Hai inserito in modo errato le ultime 4 cifre della tua Expensify Card troppe volte. Se sei sicuro che i numeri siano corretti, contatta Concierge per risolvere il problema. Altrimenti, riprova più tardi.',
        },
    },
    getPhysicalCard: {
        header: 'Ottieni carta fisica',
        nameMessage: 'Inserisci il tuo nome e cognome, poiché verranno mostrati sulla tua carta.',
        legalName: 'Nome legale',
        legalFirstName: 'Nome legale',
        legalLastName: 'Cognome legale',
        phoneMessage: 'Inserisci il tuo numero di telefono.',
        phoneNumber: 'Numero di telefono',
        address: 'Indirizzo',
        addressMessage: 'Inserisci il tuo indirizzo di spedizione.',
        streetAddress: 'Indirizzo stradale',
        city: 'Città',
        state: 'Stato',
        zipPostcode: 'CAP/Codice postale',
        country: 'Paese',
        confirmMessage: 'Si prega di confermare i tuoi dati qui sotto.',
        estimatedDeliveryMessage: 'La tua carta fisica arriverà in 2-3 giorni lavorativi.',
        next: 'Successivo',
        getPhysicalCard: 'Ottieni carta fisica',
        shipCard: 'Spedisci carta',
    },
    transferAmountPage: {
        transfer: function (_a) {
            var amount = _a.amount;
            return "Transfer".concat(amount ? " ".concat(amount) : '');
        },
        instant: 'Instantaneo (Carta di debito)',
        instantSummary: function (_a) {
            var rate = _a.rate, minAmount = _a.minAmount;
            return "".concat(rate, "% di commissione (").concat(minAmount, " minimo)");
        },
        ach: '1-3 giorni lavorativi (Conto bancario)',
        achSummary: 'Nessuna commissione',
        whichAccount: 'Quale account?',
        fee: 'Tariffa',
        transferSuccess: 'Trasferimento riuscito!',
        transferDetailBankAccount: 'Il tuo denaro dovrebbe arrivare nei prossimi 1-3 giorni lavorativi.',
        transferDetailDebitCard: 'Il tuo denaro dovrebbe arrivare immediatamente.',
        failedTransfer: 'Il tuo saldo non è completamente regolato. Si prega di trasferire su un conto bancario.',
        notHereSubTitle: 'Si prega di trasferire il saldo dalla pagina del portafoglio',
        goToWallet: 'Vai al Portafoglio',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Scegli account',
    },
    paymentMethodList: {
        addPaymentMethod: 'Aggiungi metodo di pagamento',
        addNewDebitCard: 'Aggiungi nuova carta di debito',
        addNewBankAccount: 'Aggiungi nuovo conto bancario',
        accountLastFour: 'Terminante in',
        cardLastFour: 'Carta che termina con',
        addFirstPaymentMethod: "Aggiungi un metodo di pagamento per inviare e ricevere pagamenti direttamente nell'app.",
        defaultPaymentMethod: 'Predefinito',
    },
    preferencesPage: {
        appSection: {
            title: "Preferenze dell'app",
        },
        testSection: {
            title: 'Preferenze di prova',
            subtitle: "Impostazioni per aiutare a fare il debug e testare l'app in staging.",
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Ricevi aggiornamenti sulle funzionalità e notizie di Expensify rilevanti',
        muteAllSounds: 'Disattiva tutti i suoni da Expensify',
    },
    priorityModePage: {
        priorityMode: 'Modalità prioritaria',
        explainerText: 'Scegli se #focus sui messaggi non letti e fissati solo, o mostra tutto con i messaggi più recenti e fissati in cima.',
        priorityModes: {
            default: {
                label: 'Più recente',
                description: 'Mostra tutte le chat ordinate per le più recenti',
            },
            gsd: {
                label: '#focus',
                description: 'Mostra solo i non letti ordinati alfabeticamente',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: function (_a) {
            var policyName = _a.policyName;
            return "in ".concat(policyName);
        },
        generatingPDF: 'Generazione PDF',
        waitForPDF: 'Attendere mentre generiamo il PDF',
        errorPDF: 'Si è verificato un errore durante il tentativo di generare il tuo PDF.',
        generatedPDF: 'Il tuo PDF del rapporto è stato generato!',
    },
    reportDescriptionPage: {
        roomDescription: 'Descrizione della stanza',
        roomDescriptionOptional: 'Descrizione della stanza (opzionale)',
        explainerText: 'Imposta una descrizione personalizzata per la stanza.',
    },
    groupChat: {
        lastMemberTitle: 'Attenzione!',
        lastMemberWarning: "Poiché sei l'ultima persona qui, andartene renderà questa chat inaccessibile a tutti i membri. Sei sicuro di voler uscire?",
        defaultReportName: function (_a) {
            var displayName = _a.displayName;
            return "Chat di gruppo di ".concat(displayName);
        },
    },
    languagePage: {
        language: 'Lingua',
        aiGenerated: 'Le traduzioni per questa lingua sono generate automaticamente e potrebbero contenere errori.',
    },
    themePage: {
        theme: 'Tema',
        themes: {
            dark: {
                label: 'Scuro',
            },
            light: {
                label: 'Luce',
            },
            system: {
                label: 'Usa le impostazioni del dispositivo',
            },
        },
        chooseThemeBelowOrSync: 'Scegli un tema qui sotto o sincronizza con le impostazioni del tuo dispositivo.',
    },
    termsOfUse: {
        phrase1: 'Accedendo, accetti i',
        phrase2: 'Termini di Servizio',
        phrase3: 'e',
        phrase4: 'Privacy',
        phrase5: "La trasmissione di denaro \u00E8 fornita da ".concat(CONST_1.default.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS, " (NMLS ID:2017010) in base al suo"),
        phrase6: 'licenze',
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Non hai ricevuto un codice magico?',
        enterAuthenticatorCode: "Per favore, inserisci il tuo codice dell'autenticatore",
        enterRecoveryCode: 'Per favore inserisci il tuo codice di recupero',
        requiredWhen2FAEnabled: "Richiesto quando l'autenticazione a due fattori è abilitata",
        requestNewCode: 'Richiedi un nuovo codice in',
        requestNewCodeAfterErrorOccurred: 'Richiedi un nuovo codice',
        error: {
            pleaseFillMagicCode: 'Per favore, inserisci il tuo codice magico',
            incorrectMagicCode: 'Codice magico errato o non valido. Per favore riprova o richiedi un nuovo codice.',
            pleaseFillTwoFactorAuth: 'Inserisci il tuo codice di autenticazione a due fattori',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Si prega di compilare tutti i campi',
        pleaseFillPassword: 'Per favore inserisci la tua password',
        pleaseFillTwoFactorAuth: 'Per favore, inserisci il tuo codice a due fattori',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Inserisci il tuo codice di autenticazione a due fattori per continuare',
        forgot: 'Dimenticato?',
        requiredWhen2FAEnabled: "Richiesto quando l'autenticazione a due fattori è abilitata",
        error: {
            incorrectPassword: 'Password errata. Riprova.',
            incorrectLoginOrPassword: 'Login o password errati. Riprova.',
            incorrect2fa: 'Codice di autenticazione a due fattori errato. Per favore riprova.',
            twoFactorAuthenticationEnabled: "Hai l'autenticazione a due fattori abilitata su questo account. Accedi utilizzando la tua email o il tuo numero di telefono.",
            invalidLoginOrPassword: 'Accesso o password non validi. Riprova o reimposta la tua password.',
            unableToResetPassword: 'Non siamo riusciti a cambiare la tua password. Questo è probabilmente dovuto a un link di reimpostazione della password scaduto in una vecchia email di reimpostazione della password. Ti abbiamo inviato un nuovo link via email, così puoi riprovare. Controlla la tua Posta in arrivo e la cartella Spam; dovrebbe arrivare tra pochi minuti.',
            noAccess: "Non hai accesso a questa applicazione. Per favore aggiungi il tuo nome utente GitHub per ottenere l'accesso.",
            accountLocked: 'Il tuo account è stato bloccato dopo troppi tentativi non riusciti. Riprova tra 1 ora.',
            fallback: 'Qualcosa è andato storto. Per favore riprova più tardi.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefono o email',
        error: {
            invalidFormatEmailLogin: "L'email inserita non è valida. Si prega di correggere il formato e riprovare.",
        },
        cannotGetAccountDetails: "Impossibile recuperare i dettagli dell'account. Per favore, prova ad accedere di nuovo.",
        loginForm: 'Modulo di accesso',
        notYou: function (_a) {
            var user = _a.user;
            return "Non ".concat(user, "?");
        },
    },
    onboarding: {
        welcome: 'Benvenuto!',
        welcomeSignOffTitleManageTeam: 'Una volta completati i compiti sopra, possiamo esplorare più funzionalità come i flussi di lavoro di approvazione e le regole!',
        welcomeSignOffTitle: 'È un piacere conoscerti!',
        explanationModal: {
            title: 'Benvenuto in Expensify',
            description: "Un'app per gestire le tue spese aziendali e personali alla velocità della chat. Provala e facci sapere cosa ne pensi. Molto altro in arrivo!",
            secondaryDescription: 'Per tornare a Expensify Classic, basta toccare la tua immagine del profilo > Vai a Expensify Classic.',
        },
        welcomeVideo: {
            title: 'Benvenuto in Expensify',
            description: "Un'app per gestire tutte le tue spese aziendali e personali in una chat. Progettata per la tua azienda, il tuo team e i tuoi amici.",
        },
        getStarted: 'Inizia',
        whatsYourName: 'Qual è il tuo nome?',
        peopleYouMayKnow: 'Persone che potresti conoscere sono già qui! Verifica la tua email per unirti a loro.',
        workspaceYouMayJoin: function (_a) {
            var domain = _a.domain, email = _a.email;
            return "Qualcuno da ".concat(domain, " ha gi\u00E0 creato uno spazio di lavoro. Inserisci il codice magico inviato a ").concat(email, ".");
        },
        joinAWorkspace: 'Unisciti a uno spazio di lavoro',
        listOfWorkspaces: "Ecco l'elenco degli spazi di lavoro a cui puoi unirti. Non preoccuparti, puoi sempre unirti più tardi se preferisci.",
        workspaceMemberList: function (_a) {
            var employeeCount = _a.employeeCount, policyOwner = _a.policyOwner;
            return "".concat(employeeCount, " membro").concat(employeeCount > 1 ? 's' : '', " \u2022 ").concat(policyOwner);
        },
        whereYouWork: 'Dove lavori?',
        errorSelection: "Seleziona un'opzione per procedere",
        purpose: (_c = {
                title: 'Cosa vuoi fare oggi?',
                errorContinue: 'Premi continua per configurare',
                errorBackButton: "Per favore, completa le domande di configurazione per iniziare a usare l'app"
            },
            _c[CONST_1.default.ONBOARDING_CHOICES.EMPLOYER] = 'Essere rimborsato dal mio datore di lavoro',
            _c[CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM] = 'Gestisci le spese del mio team',
            _c[CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND] = 'Traccia e gestisci le spese',
            _c[CONST_1.default.ONBOARDING_CHOICES.CHAT_SPLIT] = 'Chatta e dividi le spese con gli amici',
            _c[CONST_1.default.ONBOARDING_CHOICES.LOOKING_AROUND] = "Qualcos'altro",
            _c),
        employees: (_d = {
                title: 'Quanti dipendenti avete?'
            },
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MICRO] = '1-10 dipendenti',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.SMALL] = '11-50 dipendenti',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL] = '51-100 dipendenti',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MEDIUM] = '101-1.000 dipendenti',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.LARGE] = 'Più di 1.000 dipendenti',
            _d),
        accounting: {
            title: 'Usi qualche software di contabilità?',
            none: 'Nessuno',
        },
        error: {
            requiredFirstName: 'Per favore, inserisci il tuo nome per continuare',
        },
        workEmail: {
            title: 'Qual è la tua email di lavoro?',
            subtitle: 'Expensify funziona al meglio quando colleghi la tua email di lavoro.',
            explanationModal: {
                descriptionOne: 'Inoltra a receipts@expensify.com per la scansione',
                descriptionTwo: 'Unisciti ai tuoi colleghi che già utilizzano Expensify',
                descriptionThree: "Goditi un'esperienza più personalizzata",
            },
            addWorkEmail: 'Aggiungi email di lavoro',
        },
        workEmailValidation: {
            title: 'Verifica la tua email di lavoro',
            magicCodeSent: function (_a) {
                var workEmail = _a.workEmail;
                return "Inserisci il codice magico inviato a ".concat(workEmail, ". Dovrebbe arrivare tra un minuto o due.");
            },
        },
        workEmailValidationError: {
            publicEmail: "Inserisci un'email di lavoro valida da un dominio privato, ad esempio mitch@company.com",
            offline: 'Non siamo riusciti ad aggiungere la tua email di lavoro poiché sembri essere offline.',
        },
        mergeBlockScreen: {
            title: "Impossibile aggiungere l'email di lavoro",
            subtitle: function (_a) {
                var workEmail = _a.workEmail;
                return "Non siamo riusciti ad aggiungere ".concat(workEmail, ". Riprova pi\u00F9 tardi in Impostazioni o chatta con Concierge per assistenza.");
            },
        },
        tasks: {
            testDriveAdminTask: {
                title: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "Fai un [test drive](".concat(testDriveURL, ")");
                },
                description: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "[Fai un breve tour del prodotto](".concat(testDriveURL, ") per scoprire perch\u00E9 Expensify \u00E8 il modo pi\u00F9 veloce per gestire le tue spese.");
                },
            },
            testDriveEmployeeTask: {
                title: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "Fai un [test drive](".concat(testDriveURL, ")");
                },
                description: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "Prova un [test drive](".concat(testDriveURL, ") e ottieni *3 mesi gratuiti di Expensify!* per il tuo team");
                },
            },
            createTestDriveAdminWorkspaceTask: {
                title: function (_a) {
                    var workspaceConfirmationLink = _a.workspaceConfirmationLink;
                    return "[Crea](".concat(workspaceConfirmationLink, ") uno spazio di lavoro");
                },
                description: 'Crea uno spazio di lavoro e configura le impostazioni con l’aiuto del tuo specialista di configurazione!',
            },
            createWorkspaceTask: {
                title: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return "Crea uno [spazio di lavoro](".concat(workspaceSettingsLink, ")");
                },
                description: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return '*Crea uno spazio di lavoro* per monitorare le spese, scansionare ricevute, chattare e altro.\n' +
                        '\n' +
                        '1. Clicca su *Spazi di lavoro* > *Nuovo spazio di lavoro*.\n' +
                        '\n' +
                        "*Il tuo nuovo spazio di lavoro \u00E8 pronto!* [Dai un\u2019occhiata](".concat(workspaceSettingsLink, ").");
                },
            },
            setupCategoriesTask: {
                title: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink;
                    return "Configura le [categorie](".concat(workspaceCategoriesLink, ")");
                },
                description: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink;
                    return '*Configura le categorie* in modo che il tuo team possa codificare le spese per una rendicontazione semplice.\n' +
                        '\n' +
                        '1. Clicca su *Spazi di lavoro*.\n' +
                        '3. Seleziona il tuo spazio di lavoro.\n' +
                        '4. Clicca su *Categorie*.\n' +
                        '5. Disattiva le categorie che non ti servono.\n' +
                        '6. Aggiungi le tue categorie in alto a destra.\n' +
                        '\n' +
                        "[Vai alle impostazioni delle categorie dello spazio di lavoro](".concat(workspaceCategoriesLink, ").\n") +
                        '\n' +
                        "![Configura le categorie](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-categories-v2.mp4)");
                },
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Invia una spesa',
                description: '*Invia una spesa* inserendo un importo o scansionando una ricevuta.\n' +
                    '\n' +
                    '1. Clicca sul pulsante verde *+*.\n' +
                    '2. Scegli *Crea spesa*.\n' +
                    '3. Inserisci un importo o scansiona una ricevuta.\n' +
                    "4. Aggiungi l\u2019email o il numero di telefono del tuo responsabile.\n" +
                    '5. Clicca su *Crea*.\n' +
                    '\n' +
                    'E il gioco è fatto!',
            },
            adminSubmitExpenseTask: {
                title: 'Invia una spesa',
                description: '*Invia una spesa* inserendo un importo o scansionando una ricevuta.\n' +
                    '\n' +
                    '1. Clicca sul pulsante verde *+*.\n' +
                    '2. Scegli *Crea spesa*.\n' +
                    '3. Inserisci un importo o scansiona una ricevuta.\n' +
                    '4. Conferma i dettagli.\n' +
                    '5. Clicca su *Crea*.\n' +
                    '\n' +
                    'E il gioco è fatto!',
            },
            trackExpenseTask: {
                title: 'Monitora una spesa',
                description: '*Monitora una spesa* in qualsiasi valuta, con o senza ricevuta.\n' +
                    '\n' +
                    '1. Clicca sul pulsante verde *+*.\n' +
                    '2. Scegli *Crea spesa*.\n' +
                    '3. Inserisci un importo o scansiona una ricevuta.\n' +
                    '4. Scegli il tuo spazio *personale*.\n' +
                    '5. Clicca su *Crea*.\n' +
                    '\n' +
                    'E il gioco è fatto! Sì, è davvero così facile.',
            },
            addAccountingIntegrationTask: {
                title: function (_a) {
                    var integrationName = _a.integrationName, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "Connetti".concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : ' a', " [").concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? 'il tuo' : '', " ").concat(integrationName, "](").concat(workspaceAccountingLink, ")");
                },
                description: function (_a) {
                    var integrationName = _a.integrationName, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "Connetti".concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? ' il tuo' : ' a', " ").concat(integrationName, " per una codifica automatica delle spese e sincronizzazione che semplifica la chiusura di fine mese.\n") +
                        '\n' +
                        '1. Clicca su *Impostazioni*.\n' +
                        '2. Vai a *Spazi di lavoro*.\n' +
                        '3. Seleziona il tuo spazio di lavoro.\n' +
                        '4. Clicca su *Contabilità*.\n' +
                        "5. Trova ".concat(integrationName, ".\n") +
                        '6. Clicca su *Connetti*.\n' +
                        '\n' +
                        "".concat(integrationName && CONST_1.default.connectionsVideoPaths[integrationName]
                            ? "[Vai alla contabilit\u00E0](".concat(workspaceAccountingLink, ").\n\n![Connetti a ").concat(integrationName, "](").concat(CONST_1.default.CLOUDFRONT_URL, "/").concat(CONST_1.default.connectionsVideoPaths[integrationName], ")")
                            : "[Vai alla contabilit\u00E0](".concat(workspaceAccountingLink, ")."));
                },
            },
            connectCorporateCardTask: {
                title: function (_a) {
                    var corporateCardLink = _a.corporateCardLink;
                    return "Collega [la tua carta aziendale](".concat(corporateCardLink, ")");
                },
                description: function (_a) {
                    var corporateCardLink = _a.corporateCardLink;
                    return "Collega la tua carta aziendale per importare e codificare automaticamente le spese.\n" +
                        '\n' +
                        '1. Clicca su *Spazi di lavoro*.\n' +
                        '2. Seleziona il tuo spazio di lavoro.\n' +
                        '3. Clicca su *Carte aziendali*.\n' +
                        '4. Segui le istruzioni per collegare la tua carta.\n' +
                        '\n' +
                        "[Vai per collegare le mie carte aziendali](".concat(corporateCardLink, ").");
                },
            },
            inviteTeamTask: {
                title: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return "Invita [il tuo team](".concat(workspaceMembersLink, ")");
                },
                description: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return '*Invita il tuo team* su Expensify così possono iniziare a monitorare le spese oggi stesso.\n' +
                        '\n' +
                        '1. Clicca su *Spazi di lavoro*.\n' +
                        '3. Seleziona il tuo spazio di lavoro.\n' +
                        '4. Clicca su *Membri* > *Invita membro*.\n' +
                        '5. Inserisci email o numeri di telefono.\n' +
                        '6. Aggiungi un messaggio personalizzato se vuoi!\n' +
                        '\n' +
                        "[Vai ai membri dello spazio di lavoro](".concat(workspaceMembersLink, ").\n") +
                        '\n' +
                        "![Invita il tuo team](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-invite_members-v2.mp4)");
                },
            },
            setupCategoriesAndTags: {
                title: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink, workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return "Configura [categorie](".concat(workspaceCategoriesLink, ") e [tag](").concat(workspaceMoreFeaturesLink, ")");
                },
                description: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return '*Configura categorie e tag* in modo che il tuo team possa codificare le spese per una rendicontazione semplice.\n' +
                        '\n' +
                        "Importale automaticamente [collegando il software di contabilit\u00E0](".concat(workspaceAccountingLink, "), oppure configuralo manualmente nelle [impostazioni dello spazio di lavoro](").concat(workspaceCategoriesLink, ").");
                },
            },
            setupTagsTask: {
                title: function (_a) {
                    var workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return "Configura i [tag](".concat(workspaceMoreFeaturesLink, ")");
                },
                description: function (_a) {
                    var workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return 'Usa i tag per aggiungere dettagli extra alle spese come progetti, clienti, sedi e reparti. Se ti servono più livelli di tag, puoi passare al piano Control.\n' +
                        '\n' +
                        '1. Clicca su *Spazi di lavoro*.\n' +
                        '3. Seleziona il tuo spazio di lavoro.\n' +
                        '4. Clicca su *Altre funzionalità*.\n' +
                        '5. Abilita *Tag*.\n' +
                        '6. Vai a *Tag* nell’editor dello spazio di lavoro.\n' +
                        '7. Clicca su *+ Aggiungi tag* per crearne uno tuo.\n' +
                        '\n' +
                        "[Vai a altre funzionalit\u00E0](".concat(workspaceMoreFeaturesLink, ").\n") +
                        '\n' +
                        "![Configura i tag](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-tags-v2.mp4)");
                },
            },
            inviteAccountantTask: {
                title: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return "Invita il tuo [commercialista](".concat(workspaceMembersLink, ")");
                },
                description: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return '*Invita il tuo commercialista* a collaborare nel tuo spazio di lavoro e a gestire le spese aziendali.\n' +
                        '\n' +
                        '1. Clicca su *Spazi di lavoro*.\n' +
                        '2. Seleziona il tuo spazio di lavoro.\n' +
                        '3. Clicca su *Membri*.\n' +
                        '4. Clicca su *Invita un membro*.\n' +
                        "5. Inserisci l'indirizzo email del tuo commercialista.\n" +
                        '\n' +
                        "[Invita ora il tuo commercialista](".concat(workspaceMembersLink, ").");
                },
            },
            startChatTask: {
                title: 'Avvia una chat',
                description: '*Avvia una chat* con chiunque utilizzando la loro email o numero di telefono.\n' +
                    '\n' +
                    '1. Clicca sul pulsante verde *+*.\n' +
                    '2. Scegli *Avvia chat*.\n' +
                    '3. Inserisci un’email o numero di telefono.\n' +
                    '\n' +
                    'Se non stanno già usando Expensify, riceveranno automaticamente un invito.\n' +
                    '\n' +
                    'Ogni chat si trasformerà anche in un’email o messaggio a cui potranno rispondere direttamente.',
            },
            splitExpenseTask: {
                title: 'Dividi una spesa',
                description: '*Dividi le spese* con una o più persone.\n' +
                    '\n' +
                    '1. Clicca sul pulsante verde *+*.\n' +
                    '2. Scegli *Avvia chat*.\n' +
                    '3. Inserisci email o numeri di telefono.\n' +
                    '4. Clicca sul pulsante grigio *+* nella chat > *Dividi spesa*.\n' +
                    '5. Crea la spesa selezionando *Manuale*, *Scansione* o *Distanza*.\n' +
                    '\n' +
                    'Puoi aggiungere altri dettagli se vuoi, oppure inviarla subito. Recuperiamo i tuoi soldi!',
            },
            reviewWorkspaceSettingsTask: {
                title: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return "Rivedi le [impostazioni dello spazio di lavoro](".concat(workspaceSettingsLink, ")");
                },
                description: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return 'Ecco come rivedere e aggiornare le impostazioni dello spazio di lavoro:\n' +
                        '1. Clicca sulla scheda delle impostazioni.\n' +
                        '2. Clicca su *Spazi di lavoro* > [Il tuo spazio di lavoro].\n' +
                        "[Vai al tuo spazio di lavoro](".concat(workspaceSettingsLink, "). Le tracceremo nella stanza #admins.");
                },
            },
            createReportTask: {
                title: 'Crea il tuo primo report',
                description: 'Ecco come creare un report:\n' +
                    '\n' +
                    '1. Clicca sul pulsante verde *+*.\n' +
                    '2. Scegli *Crea report*.\n' +
                    '3. Clicca su *Aggiungi spesa*.\n' +
                    '4. Aggiungi la tua prima spesa.\n' +
                    '\n' +
                    'E il gioco è fatto!',
            },
        },
        testDrive: {
            name: function (_a) {
                var testDriveURL = _a.testDriveURL;
                return (testDriveURL ? "Fai un [test drive](".concat(testDriveURL, ")") : 'Fai un test drive');
            },
            embeddedDemoIframeTitle: 'Test Drive',
            employeeFakeReceipt: {
                description: 'La mia ricevuta del test drive!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Ricevere un rimborso è facile come inviare un messaggio. Vediamo le basi.',
            onboardingPersonalSpendMessage: 'Ecco come monitorare le tue spese in pochi clic.',
            onboardingMangeTeamMessage: function (_a) {
                var onboardingCompanySize = _a.onboardingCompanySize;
                return "Ecco un elenco di attivit\u00E0 che consiglio per un\u2019azienda delle tue dimensioni con ".concat(onboardingCompanySize, " persone che inviano spese:");
            },
            onboardingTrackWorkspaceMessage: '# Iniziamo\n👋 Sono qui per aiutarti! Per iniziare, ho personalizzato le impostazioni dello spazio di lavoro per ditte individuali e aziende simili. Puoi modificarle cliccando il link qui sotto!\n\nEcco come monitorare le tue spese in pochi clic:',
            onboardingChatSplitMessage: 'Dividere le spese con gli amici è facile come inviare un messaggio. Ecco come.',
            onboardingAdminMessage: 'Scopri come gestire lo spazio di lavoro del tuo team come admin e inviare le tue spese.',
            onboardingLookingAroundMessage: 'Expensify è noto per la gestione di spese, viaggi e carte aziendali, ma facciamo molto di più. Fammi sapere cosa ti interessa e ti aiuterò a iniziare.',
            onboardingTestDriveReceiverMessage: '*Hai ottenuto 3 mesi gratuiti! Inizia da qui sotto.*',
        },
        workspace: {
            title: 'Rimani organizzato con uno spazio di lavoro',
            subtitle: 'Sblocca strumenti potenti per semplificare la gestione delle tue spese, tutto in un unico posto. Con uno spazio di lavoro, puoi:',
            explanationModal: {
                descriptionOne: 'Traccia e organizza le ricevute',
                descriptionTwo: 'Categorizza e tagga le spese',
                descriptionThree: 'Crea e condividi rapporti',
            },
            price: 'Provalo gratis per 30 giorni, poi passa al piano superiore per soli <strong>$5/mese</strong>.',
            createWorkspace: 'Crea workspace',
        },
        confirmWorkspace: {
            title: 'Conferma workspace',
            subtitle: 'Crea uno spazio di lavoro per tracciare le ricevute, rimborsare le spese, gestire i viaggi, creare report e altro ancora — tutto alla velocità della chat.',
        },
        inviteMembers: {
            title: 'Invita membri',
            subtitle: 'Gestisci e condividi le tue spese con un commercialista o avvia un gruppo di viaggio con gli amici.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Non mostrarmelo più',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Il nome non può contenere le parole Expensify o Concierge',
            hasInvalidCharacter: 'Il nome non può contenere una virgola o un punto e virgola',
            requiredFirstName: 'Il nome non può essere vuoto',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Qual è il tuo nome legale?',
        enterDateOfBirth: 'Qual è la tua data di nascita?',
        enterAddress: 'Qual è il tuo indirizzo?',
        enterPhoneNumber: 'Qual è il tuo numero di telefono?',
        personalDetails: 'Dettagli personali',
        privateDataMessage: 'Questi dettagli sono utilizzati per viaggi e pagamenti. Non vengono mai mostrati sul tuo profilo pubblico.',
        legalName: 'Nome legale',
        legalFirstName: 'Nome legale',
        legalLastName: 'Cognome legale',
        address: 'Indirizzo',
        error: {
            dateShouldBeBefore: function (_a) {
                var dateString = _a.dateString;
                return "La data dovrebbe essere precedente a ".concat(dateString);
            },
            dateShouldBeAfter: function (_a) {
                var dateString = _a.dateString;
                return "La data deve essere successiva a ".concat(dateString);
            },
            hasInvalidCharacter: 'Il nome può includere solo caratteri latini',
            incorrectZipFormat: function (_a) {
                var _b = _a === void 0 ? {} : _a, zipFormat = _b.zipFormat;
                return "Formato del codice postale errato".concat(zipFormat ? "Formato accettabile: ".concat(zipFormat) : '');
            },
            invalidPhoneNumber: "Si prega di assicurarsi che il numero di telefono sia valido (ad esempio ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")"),
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Il link è stato reinviato',
        weSentYouMagicSignInLink: function (_a) {
            var login = _a.login, loginType = _a.loginType;
            return "Ho inviato un link magico per l'accesso a ".concat(login, ". Controlla il tuo ").concat(loginType, " per accedere.");
        },
        resendLink: 'Invia nuovamente il link',
    },
    unlinkLoginForm: {
        toValidateLogin: function (_a) {
            var primaryLogin = _a.primaryLogin, secondaryLogin = _a.secondaryLogin;
            return "Per convalidare ".concat(secondaryLogin, ", per favore reinvia il codice magico dalle Impostazioni dell'Account di ").concat(primaryLogin, ".");
        },
        noLongerHaveAccess: function (_a) {
            var primaryLogin = _a.primaryLogin;
            return "Se non hai pi\u00F9 accesso a ".concat(primaryLogin, ", scollega i tuoi account.");
        },
        unlink: 'Scollega',
        linkSent: 'Link inviato!',
        successfullyUnlinkedLogin: 'Accesso secondario scollegato con successo!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: function (_a) {
            var login = _a.login;
            return "Il nostro provider di posta elettronica ha temporaneamente sospeso le email a ".concat(login, " a causa di problemi di consegna. Per sbloccare il tuo login, segui questi passaggi:");
        },
        confirmThat: function (_a) {
            var login = _a.login;
            return "Conferma che ".concat(login, " sia scritto correttamente e sia un indirizzo email reale e consegnabile.");
        },
        emailAliases: 'Gli alias email come "expenses@domain.com" devono avere accesso alla propria casella di posta elettronica per essere un login valido di Expensify.',
        ensureYourEmailClient: 'Assicurati che il tuo client di posta elettronica consenta le email da expensify.com.',
        youCanFindDirections: 'Puoi trovare le indicazioni su come completare questo passaggio',
        helpConfigure: 'ma potresti aver bisogno del tuo reparto IT per aiutarti a configurare le impostazioni email.',
        onceTheAbove: 'Una volta completati i passaggi sopra indicati, contatta per favore',
        toUnblock: 'per sbloccare il tuo accesso.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: function (_a) {
            var login = _a.login;
            return "Non siamo riusciti a consegnare i messaggi SMS a ".concat(login, ", quindi lo abbiamo sospeso temporaneamente. Si prega di provare a convalidare il proprio numero:");
        },
        validationSuccess: 'Il tuo numero è stato convalidato! Clicca qui sotto per inviare un nuovo codice magico di accesso.',
        validationFailed: function (_a) {
            var _b;
            var timeData = _a.timeData;
            if (!timeData) {
                return 'Attendere un momento prima di riprovare.';
            }
            var timeParts = [];
            if (timeData.days) {
                timeParts.push("".concat(timeData.days, " ").concat(timeData.days === 1 ? 'giorno' : 'giorni'));
            }
            if (timeData.hours) {
                timeParts.push("".concat(timeData.hours, " ").concat(timeData.hours === 1 ? 'ora' : 'ore'));
            }
            if (timeData.minutes) {
                timeParts.push("".concat(timeData.minutes, " ").concat(timeData.minutes === 1 ? 'minuto' : 'minuti'));
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
            return "Aspetta! Devi attendere ".concat(timeText, " prima di provare a convalidare nuovamente il tuo numero.");
        },
    },
    welcomeSignUpForm: {
        join: 'Unisciti',
    },
    detailsPage: {
        localTime: 'Ora locale',
    },
    newChatPage: {
        startGroup: 'Avvia gruppo',
        addToGroup: 'Aggiungi al gruppo',
    },
    yearPickerPage: {
        year: 'Anno',
        selectYear: 'Si prega di selezionare un anno',
    },
    focusModeUpdateModal: {
        title: 'Benvenuto in modalità #focus!',
        prompt: 'Rimani al passo vedendo solo le chat non lette o quelle che richiedono la tua attenzione. Non preoccuparti, puoi cambiare questa impostazione in qualsiasi momento in',
        settings: 'impostazioni',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'La chat che stai cercando non può essere trovata.',
        getMeOutOfHere: 'Portami via di qui',
        iouReportNotFound: 'I dettagli di pagamento che stai cercando non possono essere trovati.',
        notHere: 'Hmm... non è qui',
        pageNotFound: 'Ops, questa pagina non può essere trovata',
        noAccess: 'Questa chat o spesa potrebbe essere stata eliminata o potresti non avere accesso ad essa.\n\nPer qualsiasi domanda, contatta concierge@expensify.com',
        goBackHome: 'Torna alla pagina principale',
    },
    errorPage: {
        title: function (_a) {
            var isBreakLine = _a.isBreakLine;
            return "Oops... ".concat(isBreakLine ? '\n' : '', "Qualcosa \u00E8 andato storto");
        },
        subtitle: 'La tua richiesta non può essere completata. Per favore riprova più tardi.',
    },
    setPasswordPage: {
        enterPassword: 'Inserisci una password',
        setPassword: 'Imposta password',
        newPasswordPrompt: 'La tua password deve avere almeno 8 caratteri, 1 lettera maiuscola, 1 lettera minuscola e 1 numero.',
        passwordFormTitle: 'Bentornato nel nuovo Expensify! Per favore, imposta la tua password.',
        passwordNotSet: 'Non siamo riusciti a impostare la tua nuova password. Ti abbiamo inviato un nuovo link per riprovare.',
        setPasswordLinkInvalid: 'Questo link per impostare la password non è valido o è scaduto. Un nuovo link ti sta aspettando nella tua casella di posta elettronica!',
        validateAccount: 'Verifica account',
    },
    statusPage: {
        status: 'Stato',
        statusExplanation: "Aggiungi un'emoji per dare ai tuoi colleghi e amici un modo semplice per sapere cosa sta succedendo. Puoi anche aggiungere un messaggio opzionale!",
        today: 'Oggi',
        clearStatus: 'Cancella stato',
        save: 'Salva',
        message: 'Messaggio',
        timePeriods: {
            never: 'Never',
            thirtyMinutes: '30 minuti',
            oneHour: '1 ora',
            afterToday: 'Oggi',
            afterWeek: 'Una settimana',
            custom: 'Customizzato',
        },
        untilTomorrow: 'Fino a domani',
        untilTime: function (_a) {
            var time = _a.time;
            return "Fino a ".concat(time);
        },
        date: 'Data',
        time: 'Tempo',
        clearAfter: 'Cancella dopo',
        whenClearStatus: 'Quando dovremmo cancellare il tuo stato?',
        vacationDelegate: 'Delegato per le vacanze',
        setVacationDelegate: "Imposta un delegato per le vacanze per approvare i report al tuo posto mentre sei fuori ufficio.",
        vacationDelegateError: 'Si è verificato un errore durante l’aggiornamento del delegato per le vacanze.',
        asVacationDelegate: function (_a) {
            var managerName = _a.nameOrEmail;
            return "come delegato per le vacanze di ".concat(managerName);
        },
        toAsVacationDelegate: function (_a) {
            var submittedToName = _a.submittedToName, vacationDelegateName = _a.vacationDelegateName;
            return "a ".concat(submittedToName, " come delegato per le vacanze di ").concat(vacationDelegateName);
        },
        vacationDelegateWarning: function (_a) {
            var nameOrEmail = _a.nameOrEmail;
            return "Stai assegnando ".concat(nameOrEmail, " come tuo delegato per le vacanze. Non \u00E8 ancora presente in tutti i tuoi workspace. Se scegli di continuare, verr\u00E0 inviata un'e-mail a tutti gli amministratori dei tuoi workspace per aggiungerlo.");
        },
    },
    stepCounter: function (_a) {
        var step = _a.step, total = _a.total, text = _a.text;
        var result = "Passo ".concat(step);
        if (total) {
            result = "".concat(result, " of ").concat(total);
        }
        if (text) {
            result = "".concat(result, ": ").concat(text);
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Informazioni bancarie',
        confirmBankInfo: 'Conferma le informazioni bancarie',
        manuallyAdd: 'Aggiungi manualmente il tuo conto bancario',
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        accountEnding: 'Account con terminazione in',
        thisBankAccount: 'Questo conto bancario sarà utilizzato per i pagamenti aziendali nel tuo spazio di lavoro.',
        accountNumber: 'Numero di conto',
        routingNumber: 'Numero di instradamento',
        chooseAnAccountBelow: 'Scegli un account qui sotto',
        addBankAccount: 'Aggiungi conto bancario',
        chooseAnAccount: 'Scegli un account',
        connectOnlineWithPlaid: 'Accedi alla tua banca',
        connectManually: 'Connetti manualmente',
        desktopConnection: 'Nota: Per connettersi con Chase, Wells Fargo, Capital One o Bank of America, fare clic qui per completare questo processo in un browser.',
        yourDataIsSecure: 'I tuoi dati sono al sicuro',
        toGetStarted: 'Aggiungi un conto bancario per rimborsare le spese, emettere le carte Expensify, riscuotere i pagamenti delle fatture e pagare le bollette tutto da un unico posto.',
        plaidBodyCopy: 'Offri ai tuoi dipendenti un modo più semplice per pagare - e farsi rimborsare - le spese aziendali.',
        checkHelpLine: 'Il tuo numero di instradamento e il numero di conto possono essere trovati su un assegno per il conto.',
        hasPhoneLoginError: function (_a) {
            var contactMethodRoute = _a.contactMethodRoute;
            return "Per collegare un conto bancario, per favore <a href=\"".concat(contactMethodRoute, "\">aggiungi un'email come login principale</a> e riprova. Puoi aggiungere il tuo numero di telefono come login secondario.");
        },
        hasBeenThrottledError: "Si è verificato un errore durante l'aggiunta del tuo conto bancario. Attendi qualche minuto e riprova.",
        hasCurrencyError: function (_a) {
            var workspaceRoute = _a.workspaceRoute;
            return "Ops! Sembra che la valuta del tuo spazio di lavoro sia impostata su una valuta diversa da USD. Per procedere, vai a <a href=\"".concat(workspaceRoute, "\">le impostazioni del tuo spazio di lavoro</a> impostarlo su USD e riprovare.");
        },
        error: {
            youNeedToSelectAnOption: "Seleziona un'opzione per procedere",
            noBankAccountAvailable: 'Spiacente, non è disponibile alcun conto bancario.',
            noBankAccountSelected: 'Per favore, scegli un account',
            taxID: 'Inserisci un numero di partita IVA valido',
            website: 'Per favore, inserisci un sito web valido',
            zipCode: "Inserisci un codice postale valido utilizzando il formato: ".concat(CONST_1.default.COUNTRY_ZIP_REGEX_DATA.US.samples),
            phoneNumber: 'Per favore, inserisci un numero di telefono valido',
            email: 'Per favore, inserisci un indirizzo email valido',
            companyName: 'Per favore inserisci un nome aziendale valido',
            addressCity: 'Per favore, inserisci una città valida',
            addressStreet: 'Per favore, inserisci un indirizzo stradale valido',
            addressState: 'Seleziona un stato valido per favore',
            incorporationDateFuture: 'La data di costituzione non può essere nel futuro',
            incorporationState: 'Seleziona un stato valido per favore',
            industryCode: 'Inserisci un codice di classificazione industriale valido composto da sei cifre',
            restrictedBusiness: "Per favore conferma che l'azienda non è nell'elenco delle attività commerciali ristrette.",
            routingNumber: 'Inserisci un numero di instradamento valido',
            accountNumber: 'Per favore, inserisci un numero di conto valido',
            routingAndAccountNumberCannotBeSame: 'I numeri di routing e di conto non possono corrispondere',
            companyType: 'Seleziona un tipo di azienda valido',
            tooManyAttempts: 'A causa di un elevato numero di tentativi di accesso, questa opzione è stata disabilitata per 24 ore. Si prega di riprovare più tardi o di inserire i dettagli manualmente.',
            address: 'Per favore, inserisci un indirizzo valido',
            dob: 'Si prega di selezionare una data di nascita valida',
            age: 'Devi avere più di 18 anni',
            ssnLast4: 'Inserisci gli ultimi 4 cifre validi del SSN',
            firstName: 'Per favore, inserisci un nome valido',
            lastName: 'Per favore, inserisci un cognome valido',
            noDefaultDepositAccountOrDebitCardAvailable: 'Si prega di aggiungere un conto di deposito predefinito o una carta di debito',
            validationAmounts: "Gli importi di convalida inseriti non sono corretti. Si prega di ricontrollare l'estratto conto bancario e riprovare.",
            fullName: 'Per favore, inserisci un nome completo valido',
            ownershipPercentage: 'Per favore, inserisci un numero percentuale valido',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Dove si trova il tuo conto bancario?',
        accountDetailsStepHeader: 'Quali sono i dettagli del tuo account?',
        accountTypeStepHeader: 'Che tipo di account è questo?',
        bankInformationStepHeader: 'Quali sono i tuoi dettagli bancari?',
        accountHolderInformationStepHeader: 'Quali sono i dettagli del titolare del conto?',
        howDoWeProtectYourData: 'Come proteggiamo i tuoi dati?',
        currencyHeader: 'Qual è la valuta del tuo conto bancario?',
        confirmationStepHeader: 'Controlla le tue informazioni.',
        confirmationStepSubHeader: 'Ricontrolla i dettagli qui sotto e seleziona la casella dei termini per confermare.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Inserisci la password di Expensify',
        alreadyAdded: 'Questo account è già stato aggiunto.',
        chooseAccountLabel: 'Account',
        successTitle: 'Conto bancario personale aggiunto!',
        successMessage: 'Congratulazioni, il tuo conto bancario è configurato ed è pronto a ricevere i rimborsi.',
    },
    attachmentView: {
        unknownFilename: 'Nome file sconosciuto',
        passwordRequired: 'Per favore inserisci una password',
        passwordIncorrect: 'Password errata. Riprova.',
        failedToLoadPDF: 'Impossibile caricare il file PDF',
        pdfPasswordForm: {
            title: 'PDF protetto da password',
            infoText: 'Questo PDF è protetto da password.',
            beforeLinkText: 'Per favore',
            linkText: 'inserisci la password',
            afterLinkText: 'per visualizzarlo.',
            formLabel: 'Visualizza PDF',
        },
        attachmentNotFound: 'Allegato non trovato',
    },
    messages: {
        errorMessageInvalidPhone: "Per favore, inserisci un numero di telefono valido senza parentesi o trattini. Se ti trovi al di fuori degli Stati Uniti, includi il tuo prefisso internazionale (ad es. ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")."),
        errorMessageInvalidEmail: 'Email non valido',
        userIsAlreadyMember: function (_a) {
            var login = _a.login, name = _a.name;
            return "".concat(login, " \u00E8 gi\u00E0 un membro di ").concat(name);
        },
    },
    onfidoStep: {
        acceptTerms: 'Continuando con la richiesta di attivare il tuo Expensify Wallet, confermi di aver letto, compreso e accettato',
        facialScan: 'Politica e Rilascio della Scansione Facciale di Onfido',
        tryAgain: 'Riprova',
        verifyIdentity: 'Verifica identità',
        letsVerifyIdentity: 'Verifichiamo la tua identità',
        butFirst: "Ma prima, le cose noiose. Leggi le informazioni legali nel prossimo passaggio e fai clic su \"Accetta\" quando sei pronto.",
        genericError: "Si è verificato un errore durante l'elaborazione di questo passaggio. Per favore riprova.",
        cameraPermissionsNotGranted: "Abilita l'accesso alla fotocamera",
        cameraRequestMessage: 'Abbiamo bisogno di accedere alla tua fotocamera per completare la verifica del conto bancario. Abilitala tramite Impostazioni > New Expensify.',
        microphonePermissionsNotGranted: "Abilita l'accesso al microfono",
        microphoneRequestMessage: 'Abbiamo bisogno di accedere al tuo microfono per completare la verifica del conto bancario. Abilitalo tramite Impostazioni > New Expensify.',
        originalDocumentNeeded: "Per favore carica un'immagine originale del tuo documento d'identità invece di uno screenshot o un'immagine scansionata.",
        documentNeedsBetterQuality: "Il tuo documento d'identità sembra essere danneggiato o mancano caratteristiche di sicurezza. Carica un'immagine originale di un documento d'identità non danneggiato che sia completamente visibile.",
        imageNeedsBetterQuality: "C'è un problema con la qualità dell'immagine del tuo documento d'identità. Per favore, carica una nuova immagine in cui il tuo documento d'identità sia visibile chiaramente.",
        selfieIssue: "C'è un problema con il tuo selfie/video. Per favore carica un selfie/video dal vivo.",
        selfieNotMatching: "Il tuo selfie/video non corrisponde al tuo documento d'identità. Per favore carica un nuovo selfie/video in cui il tuo viso sia chiaramente visibile.",
        selfieNotLive: 'Il tuo selfie/video non sembra essere una foto/video dal vivo. Per favore, carica un selfie/video dal vivo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Dettagli aggiuntivi',
        helpText: 'Dobbiamo confermare le seguenti informazioni prima che tu possa inviare e ricevere denaro dal tuo portafoglio.',
        helpTextIdologyQuestions: 'Abbiamo bisogno di farti solo alcune altre domande per completare la validazione della tua identità.',
        helpLink: 'Scopri di più sul perché ne abbiamo bisogno.',
        legalFirstNameLabel: 'Nome legale',
        legalMiddleNameLabel: 'Secondo nome legale',
        legalLastNameLabel: 'Cognome legale',
        selectAnswer: 'Seleziona una risposta per procedere',
        ssnFull9Error: 'Inserisci un SSN valido di nove cifre',
        needSSNFull9: 'Stiamo riscontrando problemi nel verificare il tuo SSN. Inserisci tutti i nove numeri del tuo SSN.',
        weCouldNotVerify: 'Non siamo riusciti a verificare',
        pleaseFixIt: 'Si prega di correggere queste informazioni prima di continuare.',
        failedKYCTextBefore: 'Non siamo riusciti a verificare la tua identità. Per favore riprova più tardi o contatta',
        failedKYCTextAfter: 'se hai domande.',
    },
    termsStep: {
        headerTitle: 'Termini e tariffe',
        headerTitleRefactor: 'Commissioni e termini',
        haveReadAndAgree: 'Ho letto e accetto di ricevere',
        electronicDisclosures: 'informative elettroniche',
        agreeToThe: 'Accetto il',
        walletAgreement: 'Accordo del portafoglio',
        enablePayments: 'Abilita pagamenti',
        monthlyFee: 'Tariffa mensile',
        inactivity: 'Inattività',
        noOverdraftOrCredit: 'Nessuna funzione di scoperto/credito.',
        electronicFundsWithdrawal: 'Prelievo di fondi elettronici',
        standard: 'Standard',
        reviewTheFees: "Dai un'occhiata ad alcune tariffe.",
        checkTheBoxes: 'Si prega di selezionare le caselle qui sotto.',
        agreeToTerms: 'Accetta i termini e sarai pronto per partire!',
        shortTermsForm: {
            expensifyPaymentsAccount: function (_a) {
                var walletProgram = _a.walletProgram;
                return "Il Portafoglio Expensify \u00E8 emesso da ".concat(walletProgram, ".");
            },
            perPurchase: 'Per acquisto',
            atmWithdrawal: 'Prelievo bancomat',
            cashReload: 'Ricarica in contanti',
            inNetwork: 'in-network',
            outOfNetwork: 'fuori rete',
            atmBalanceInquiry: 'Richiesta saldo bancomat',
            inOrOutOfNetwork: '(in-network o out-of-network)',
            customerService: 'Servizio clienti',
            automatedOrLive: '(automated or live agent)',
            afterTwelveMonths: '(dopo 12 mesi senza transazioni)',
            weChargeOneFee: 'Addebitiamo un altro tipo di commissione. È:',
            fdicInsurance: "I tuoi fondi sono idonei per l'assicurazione FDIC.",
            generalInfo: 'Per informazioni generali sui conti prepagati, visita',
            conditionsDetails: 'Per dettagli e condizioni su tutte le tariffe e i servizi, visita',
            conditionsPhone: 'o chiamando il +1 833-400-0904.',
            instant: '(instant)',
            electronicFundsInstantFeeMin: function (_a) {
                var amount = _a.amount;
                return "(min ".concat(amount, ")");
            },
        },
        longTermsForm: {
            listOfAllFees: 'Un elenco di tutte le commissioni del Portafoglio Expensify',
            typeOfFeeHeader: 'Tutte le commissioni',
            feeAmountHeader: 'Importo',
            moreDetailsHeader: 'Dettagli',
            openingAccountTitle: 'Apertura di un account',
            openingAccountDetails: "Non c'è alcuna commissione per aprire un account.",
            monthlyFeeDetails: 'Non ci sono costi mensili.',
            customerServiceTitle: 'Servizio clienti',
            customerServiceDetails: 'Non ci sono commissioni per il servizio clienti.',
            inactivityDetails: 'Non ci sono commissioni di inattività.',
            sendingFundsTitle: 'Invio di fondi a un altro titolare di conto',
            sendingFundsDetails: "Non c'è alcuna commissione per inviare fondi a un altro titolare di conto utilizzando il tuo saldo, conto bancario o carta di debito.",
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
            fdicInsuranceBancorp2: 'per dettagli.',
            contactExpensifyPayments: "Contatta ".concat(CONST_1.default.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS, " chiamando il numero +1 833-400-0904, via email a"),
            contactExpensifyPayments2: 'oppure accedi su',
            generalInformation: 'Per informazioni generali sui conti prepagati, visita',
            generalInformation2: 'Se hai un reclamo su un account prepagato, chiama il Consumer Financial Protection Bureau al numero 1-855-411-2372 o visita',
            printerFriendlyView: 'Visualizza la versione stampabile',
            automated: 'Automatizzato',
            liveAgent: 'Agente dal vivo',
            instant: 'Istantaneo',
            electronicFundsInstantFeeMin: function (_a) {
                var amount = _a.amount;
                return "Min ".concat(amount);
            },
        },
    },
    activateStep: {
        headerTitle: 'Abilita pagamenti',
        activatedTitle: 'Portafoglio attivato!',
        activatedMessage: 'Congratulazioni, il tuo portafoglio è configurato e pronto per effettuare pagamenti.',
        checkBackLaterTitle: 'Solo un minuto...',
        checkBackLaterMessage: 'Stiamo ancora esaminando le tue informazioni. Per favore, ricontrolla più tardi.',
        continueToPayment: 'Continua al pagamento',
        continueToTransfer: 'Continua a trasferire',
    },
    companyStep: {
        headerTitle: "Informazioni sull'azienda",
        subtitle: 'Quasi fatto! Per motivi di sicurezza, dobbiamo confermare alcune informazioni:',
        legalBusinessName: "Nome legale dell'azienda",
        companyWebsite: "Sito web dell'azienda",
        taxIDNumber: 'Numero di identificazione fiscale',
        taxIDNumberPlaceholder: '9 cifre',
        companyType: 'Tipo di azienda',
        incorporationDate: 'Data di costituzione',
        incorporationState: 'Stato di incorporazione',
        industryClassificationCode: 'Codice di classificazione industriale',
        confirmCompanyIsNot: 'Confermo che questa azienda non è nel',
        listOfRestrictedBusinesses: 'elenco delle attività commerciali soggette a restrizioni',
        incorporationDatePlaceholder: 'Data di inizio (aaaa-mm-gg)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnership',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Ditta individuale',
            OTHER: 'Altro',
        },
        industryClassification: "In quale settore è classificata l'azienda?",
        industryClassificationCodePlaceholder: "Cerca il codice di classificazione dell'industria",
    },
    requestorStep: {
        headerTitle: 'Informazioni personali',
        learnMore: 'Scopri di più',
        isMyDataSafe: 'I miei dati sono al sicuro?',
    },
    personalInfoStep: {
        personalInfo: 'Informazioni personali',
        enterYourLegalFirstAndLast: 'Qual è il tuo nome legale?',
        legalFirstName: 'Nome legale',
        legalLastName: 'Cognome legale',
        legalName: 'Nome legale',
        enterYourDateOfBirth: 'Qual è la tua data di nascita?',
        enterTheLast4: 'Quali sono le ultime quattro cifre del tuo numero di previdenza sociale?',
        dontWorry: 'Non preoccuparti, non facciamo alcun controllo del credito personale!',
        last4SSN: 'Ultime 4 cifre del SSN',
        enterYourAddress: 'Qual è il tuo indirizzo?',
        address: 'Indirizzo',
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        byAddingThisBankAccount: 'Aggiungendo questo conto bancario, confermi di aver letto, compreso e accettato',
        whatsYourLegalName: 'Qual è il tuo nome legale?',
        whatsYourDOB: 'Qual è la tua data di nascita?',
        whatsYourAddress: 'Qual è il tuo indirizzo?',
        whatsYourSSN: 'Quali sono le ultime quattro cifre del tuo numero di previdenza sociale?',
        noPersonalChecks: 'Non preoccuparti, qui non ci sono controlli del credito personali!',
        whatsYourPhoneNumber: 'Qual è il tuo numero di telefono?',
        weNeedThisToVerify: 'Abbiamo bisogno di questo per verificare il tuo portafoglio.',
    },
    businessInfoStep: {
        businessInfo: "Informazioni sull'azienda",
        enterTheNameOfYourBusiness: 'Qual è il nome della tua azienda?',
        businessName: "Nome legale dell'azienda",
        enterYourCompanyTaxIdNumber: 'Qual è il numero di partita IVA della tua azienda?',
        taxIDNumber: 'Numero di identificazione fiscale',
        taxIDNumberPlaceholder: '9 cifre',
        enterYourCompanyWebsite: 'Qual è il sito web della tua azienda?',
        companyWebsite: "Sito web dell'azienda",
        enterYourCompanyPhoneNumber: 'Qual è il numero di telefono della tua azienda?',
        enterYourCompanyAddress: "Qual è l'indirizzo della tua azienda?",
        selectYourCompanyType: 'Che tipo di azienda è?',
        companyType: 'Tipo di azienda',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnership',
            COOPERATIVE: 'Cooperativa',
            SOLE_PROPRIETORSHIP: 'Ditta individuale',
            OTHER: 'Altro',
        },
        selectYourCompanyIncorporationDate: 'Qual è la data di costituzione della tua azienda?',
        incorporationDate: 'Data di costituzione',
        incorporationDatePlaceholder: 'Data di inizio (aaaa-mm-gg)',
        incorporationState: 'Stato di incorporazione',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In quale stato è stata costituita la tua azienda?',
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        companyAddress: "Indirizzo dell'azienda",
        listOfRestrictedBusinesses: 'elenco delle attività commerciali soggette a restrizioni',
        confirmCompanyIsNot: 'Confermo che questa azienda non è nel',
        businessInfoTitle: 'Informazioni aziendali',
        legalBusinessName: "Nome legale dell'azienda",
        whatsTheBusinessName: "Qual è il nome dell'azienda?",
        whatsTheBusinessAddress: "Qual è l'indirizzo dell'azienda?",
        whatsTheBusinessContactInformation: 'Quali sono le informazioni di contatto aziendali?',
        whatsTheBusinessRegistrationNumber: "Qual è il numero di registrazione dell'azienda?",
        whatsTheBusinessTaxIDEIN: function (_a) {
            var country = _a.country;
            switch (country) {
                case CONST_1.default.COUNTRY.US:
                    return 'Qual è il numero di identificazione del datore di lavoro (EIN)?';
                case CONST_1.default.COUNTRY.CA:
                    return 'Qual è il numero aziendale (BN)?';
                case CONST_1.default.COUNTRY.GB:
                    return 'Qual è il numero di partita IVA (VRN)?';
                case CONST_1.default.COUNTRY.AU:
                    return 'Qual è il numero aziendale australiano (ABN)?';
                default:
                    return 'Qual è il numero di partita IVA UE?';
            }
        },
        whatsThisNumber: 'Qual è questo numero?',
        whereWasTheBusinessIncorporated: "Dove è stata costituita l'azienda?",
        whatTypeOfBusinessIsIt: 'Che tipo di attività è?',
        whatsTheBusinessAnnualPayment: "Qual è il volume di pagamento annuale dell'azienda?",
        whatsYourExpectedAverageReimbursements: "Qual è l'importo medio di rimborso previsto?",
        registrationNumber: 'Numero di registrazione',
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
                    return 'IVA UE';
            }
        },
        businessAddress: 'Indirizzo aziendale',
        businessType: 'Tipo di attività',
        incorporation: 'Incorporazione',
        incorporationCountry: 'Paese di costituzione',
        incorporationTypeName: 'Tipo di incorporazione',
        businessCategory: 'Categoria aziendale',
        annualPaymentVolume: 'Volume di pagamento annuale',
        annualPaymentVolumeInCurrency: function (_a) {
            var currencyCode = _a.currencyCode;
            return "Volume di pagamento annuale in ".concat(currencyCode);
        },
        averageReimbursementAmount: 'Importo medio del rimborso',
        averageReimbursementAmountInCurrency: function (_a) {
            var currencyCode = _a.currencyCode;
            return "Importo medio del rimborso in ".concat(currencyCode);
        },
        selectIncorporationType: 'Seleziona il tipo di incorporazione',
        selectBusinessCategory: 'Seleziona categoria aziendale',
        selectAnnualPaymentVolume: 'Seleziona il volume di pagamento annuale',
        selectIncorporationCountry: 'Seleziona il paese di incorporazione',
        selectIncorporationState: 'Seleziona lo stato di incorporazione',
        selectAverageReimbursement: "Seleziona l'importo medio del rimborso",
        findIncorporationType: 'Trova il tipo di incorporazione',
        findBusinessCategory: 'Trova categoria aziendale',
        findAnnualPaymentVolume: 'Trova il volume dei pagamenti annuali',
        findIncorporationState: 'Trova lo stato di incorporazione',
        findAverageReimbursement: "Trova l'importo medio del rimborso",
        error: {
            registrationNumber: 'Si prega di fornire un numero di registrazione valido',
            taxIDEIN: function (_a) {
                var country = _a.country;
                switch (country) {
                    case CONST_1.default.COUNTRY.US:
                        return 'Si prega di fornire un numero di identificazione del datore di lavoro (EIN) valido';
                    case CONST_1.default.COUNTRY.CA:
                        return 'Si prega di fornire un numero aziendale (BN) valido';
                    case CONST_1.default.COUNTRY.GB:
                        return 'Si prega di fornire un numero di partita IVA (VRN) valido';
                    case CONST_1.default.COUNTRY.AU:
                        return 'Si prega di fornire un numero aziendale australiano (ABN) valido';
                    default:
                        return 'Si prega di fornire un numero di partita IVA UE valido';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'Possiedi il 25% o più di',
        doAnyIndividualOwn25percent: 'Qualcuno possiede il 25% o più di',
        areThereMoreIndividualsWhoOwn25percent: 'Ci sono più individui che possiedono il 25% o più di',
        regulationRequiresUsToVerifyTheIdentity: "La normativa ci impone di verificare l'identità di qualsiasi individuo che possieda più del 25% dell'azienda.",
        companyOwner: "Proprietario dell'azienda",
        enterLegalFirstAndLastName: 'Qual è il nome legale del proprietario?',
        legalFirstName: 'Nome legale',
        legalLastName: 'Cognome legale',
        enterTheDateOfBirthOfTheOwner: 'Qual è la data di nascita del proprietario?',
        enterTheLast4: 'Quali sono le ultime 4 cifre del numero di previdenza sociale del proprietario?',
        last4SSN: 'Ultime 4 cifre del SSN',
        dontWorry: 'Non preoccuparti, non facciamo alcun controllo del credito personale!',
        enterTheOwnersAddress: "Qual è l'indirizzo del proprietario?",
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        legalName: 'Nome legale',
        address: 'Indirizzo',
        byAddingThisBankAccount: 'Aggiungendo questo conto bancario, confermi di aver letto, compreso e accettato',
        owners: 'Proprietari',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informazioni sul proprietario',
        businessOwner: "Proprietario dell'azienda",
        signerInfo: 'Informazioni sul firmatario',
        doYouOwn: function (_a) {
            var companyName = _a.companyName;
            return "Possiedi il 25% o pi\u00F9 di ".concat(companyName, "?");
        },
        doesAnyoneOwn: function (_a) {
            var companyName = _a.companyName;
            return "Qualcuno possiede il 25% o pi\u00F9 di ".concat(companyName, "?");
        },
        regulationsRequire: "Le normative ci impongono di verificare l'identità di qualsiasi individuo che possieda più del 25% dell'azienda.",
        legalFirstName: 'Nome legale',
        legalLastName: 'Cognome legale',
        whatsTheOwnersName: 'Qual è il nome legale del proprietario?',
        whatsYourName: 'Qual è il tuo nome legale?',
        whatPercentage: "Quale percentuale dell'azienda appartiene al proprietario?",
        whatsYoursPercentage: "Quale percentuale dell'azienda possiedi?",
        ownership: 'Proprietà',
        whatsTheOwnersDOB: 'Qual è la data di nascita del proprietario?',
        whatsYourDOB: 'Qual è la tua data di nascita?',
        whatsTheOwnersAddress: "Qual è l'indirizzo del proprietario?",
        whatsYourAddress: 'Qual è il tuo indirizzo?',
        whatAreTheLast: 'Quali sono le ultime 4 cifre del numero di previdenza sociale del proprietario?',
        whatsYourLast: 'Quali sono le ultime 4 cifre del tuo numero di previdenza sociale?',
        dontWorry: 'Non preoccuparti, non facciamo alcun controllo del credito personale!',
        last4: 'Ultime 4 cifre del SSN',
        whyDoWeAsk: 'Perché lo chiediamo?',
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        legalName: 'Nome legale',
        ownershipPercentage: 'Percentuale di proprietà',
        areThereOther: function (_a) {
            var companyName = _a.companyName;
            return "Ci sono altre persone che possiedono il 25% o pi\u00F9 di ".concat(companyName, "?");
        },
        owners: 'Proprietari',
        addCertified: 'Aggiungi un organigramma certificato che mostri i proprietari beneficiari',
        regulationRequiresChart: "La normativa ci impone di raccogliere una copia certificata dell'organigramma di proprietà che mostra ogni individuo o entità che possiede il 25% o più dell'azienda.",
        uploadEntity: "Carica il grafico di proprietà dell'entità",
        noteEntity: "Nota: Il grafico di proprietà dell'entità deve essere firmato dal tuo commercialista, consulente legale o notarizzato.",
        certified: "Grafico di proprietà dell'entità certificata",
        selectCountry: 'Seleziona paese',
        findCountry: 'Trova paese',
        address: 'Indirizzo',
        chooseFile: 'Scegli file',
        uploadDocuments: 'Carica documentazione aggiuntiva',
        pleaseUpload: "Si prega di caricare ulteriore documentazione qui sotto per aiutarci a verificare la tua identità come proprietario diretto o indiretto del 25% o più dell'entità aziendale.",
        acceptedFiles: 'Formati di file accettati: PDF, PNG, JPEG. La dimensione totale del file per ciascuna sezione non può superare i 5 MB.',
        proofOfBeneficialOwner: 'Prova del titolare effettivo',
        proofOfBeneficialOwnerDescription: "Si prega di fornire un'attestazione firmata e un organigramma da un commercialista, notaio o avvocato che verifichi la proprietà del 25% o più dell'azienda. Deve essere datato negli ultimi tre mesi e includere il numero di licenza del firmatario.",
        copyOfID: "Copia del documento d'identità per il titolare effettivo",
        copyOfIDDescription: 'Esempi: passaporto, patente di guida, ecc.',
        proofOfAddress: 'Prova di indirizzo per il titolare effettivo',
        proofOfAddressDescription: 'Esempi: bolletta delle utenze, contratto di locazione, ecc.',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription: "Si prega di caricare un video di una visita al sito o una chiamata registrata con l'ufficiale firmatario. L'ufficiale deve fornire: nome completo, data di nascita, nome dell'azienda, numero di registrazione, codice fiscale, indirizzo registrato, natura dell'attività e scopo del conto.",
    },
    validationStep: {
        headerTitle: 'Convalida conto bancario',
        buttonText: 'Completa la configurazione',
        maxAttemptsReached: 'La convalida per questo conto bancario è stata disabilitata a causa di troppi tentativi errati.',
        description: "Entro 1-2 giorni lavorativi, invieremo tre (3) piccole transazioni al tuo conto bancario da un nome come \"Expensify, Inc. Validation\".",
        descriptionCTA: "Inserisci l'importo di ciascuna transazione nei campi sottostanti. Esempio: 1.51.",
        reviewingInfo: 'Grazie! Stiamo esaminando le tue informazioni e ti contatteremo a breve. Per favore, controlla la tua chat con Concierge.',
        forNextStep: 'per i prossimi passaggi per completare la configurazione del tuo conto bancario.',
        letsChatCTA: 'Sì, parliamo.',
        letsChatText: 'Quasi fatto! Abbiamo bisogno del tuo aiuto per verificare alcune ultime informazioni tramite chat. Pronto?',
        letsChatTitle: 'Parliamo!',
        enable2FATitle: "Previeni le frodi, abilita l'autenticazione a due fattori (2FA)",
        enable2FAText: "Prendiamo la tua sicurezza sul serio. Imposta ora l'autenticazione a due fattori (2FA) per aggiungere un ulteriore livello di protezione al tuo account.",
        secureYourAccount: 'Proteggi il tuo account',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Informazioni aggiuntive',
        checkAllThatApply: 'Seleziona tutte le opzioni applicabili, altrimenti lascia vuoto.',
        iOwnMoreThan25Percent: 'Possiedo più del 25% di',
        someoneOwnsMoreThan25Percent: 'Qualcun altro possiede più del 25% di',
        additionalOwner: 'Proprietario beneficiario aggiuntivo',
        removeOwner: 'Rimuovi questo titolare effettivo',
        addAnotherIndividual: "Aggiungi un'altra persona che possiede più del 25% di",
        agreement: 'Accordo:',
        termsAndConditions: 'termini e condizioni',
        certifyTrueAndAccurate: 'Certifico che le informazioni fornite sono veritiere e accurate.',
        error: {
            certify: 'Deve certificare che le informazioni siano veritiere e accurate',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Completa la verifica',
        confirmAgreements: 'Per favore, conferma gli accordi qui sotto.',
        certifyTrueAndAccurate: 'Certifico che le informazioni fornite sono veritiere e accurate.',
        certifyTrueAndAccurateError: 'Si prega di certificare che le informazioni sono veritiere e accurate',
        isAuthorizedToUseBankAccount: 'Sono autorizzato a utilizzare questo conto bancario aziendale per le spese aziendali.',
        isAuthorizedToUseBankAccountError: "Devi essere un ufficiale di controllo con l'autorizzazione per operare sul conto bancario aziendale.",
        termsAndConditions: 'termini e condizioni',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Collega conto bancario',
        finishButtonText: 'Completa la configurazione',
        validateYourBankAccount: 'Convalida il tuo conto bancario',
        validateButtonText: 'Convalida',
        validationInputLabel: 'Transazione',
        maxAttemptsReached: 'La convalida per questo conto bancario è stata disabilitata a causa di troppi tentativi errati.',
        description: "Entro 1-2 giorni lavorativi, invieremo tre (3) piccole transazioni al tuo conto bancario da un nome come \"Expensify, Inc. Validation\".",
        descriptionCTA: "Inserisci l'importo di ciascuna transazione nei campi sottostanti. Esempio: 1.51.",
        reviewingInfo: 'Grazie! Stiamo esaminando le tue informazioni e ti contatteremo a breve. Controlla la tua chat con Concierge.',
        forNextSteps: 'per i prossimi passaggi per completare la configurazione del tuo conto bancario.',
        letsChatCTA: 'Sì, parliamo.',
        letsChatText: 'Quasi fatto! Abbiamo bisogno del tuo aiuto per verificare alcune ultime informazioni tramite chat. Pronto?',
        letsChatTitle: 'Parliamo!',
        enable2FATitle: "Previeni le frodi, abilita l'autenticazione a due fattori (2FA)",
        enable2FAText: "Prendiamo la tua sicurezza sul serio. Imposta ora l'autenticazione a due fattori (2FA) per aggiungere un ulteriore livello di protezione al tuo account.",
        secureYourAccount: 'Proteggi il tuo account',
    },
    countryStep: {
        confirmBusinessBank: 'Conferma la valuta e il paese del conto bancario aziendale',
        confirmCurrency: 'Conferma valuta e paese',
        yourBusiness: 'La valuta del conto bancario aziendale deve corrispondere alla valuta dello spazio di lavoro.',
        youCanChange: 'Puoi cambiare la valuta del tuo spazio di lavoro nel tuo',
        findCountry: 'Trova paese',
        selectCountry: 'Seleziona paese',
    },
    bankInfoStep: {
        whatAreYour: 'Quali sono i dettagli del tuo conto bancario aziendale?',
        letsDoubleCheck: 'Verifichiamo che tutto sia a posto.',
        thisBankAccount: 'Questo conto bancario sarà utilizzato per i pagamenti aziendali nel tuo spazio di lavoro.',
        accountNumber: 'Numero di conto',
        accountHolderNameDescription: 'Nome completo del firmatario autorizzato',
    },
    signerInfoStep: {
        signerInfo: 'Informazioni sul firmatario',
        areYouDirector: function (_a) {
            var companyName = _a.companyName;
            return "Sei un direttore o un dirigente senior presso ".concat(companyName, "?");
        },
        regulationRequiresUs: "La normativa ci impone di verificare se il firmatario ha l'autorità di intraprendere questa azione per conto dell'azienda.",
        whatsYourName: 'Qual è il tuo nome legale?',
        fullName: 'Nome completo legale',
        whatsYourJobTitle: 'Qual è il tuo titolo di lavoro?',
        jobTitle: 'Titolo di lavoro',
        whatsYourDOB: 'Qual è la tua data di nascita?',
        uploadID: "Carica documento d'identità e prova di indirizzo",
        personalAddress: 'Prova di indirizzo personale (ad esempio, bolletta)',
        letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
        legalName: 'Nome legale',
        proofOf: 'Prova di indirizzo personale',
        enterOneEmail: function (_a) {
            var companyName = _a.companyName;
            return "Inserisci l'email del direttore o dirigente senior presso ".concat(companyName);
        },
        regulationRequiresOneMoreDirector: 'La normativa richiede almeno un altro direttore o dirigente senior come firmatario.',
        hangTight: 'Attendi un attimo...',
        enterTwoEmails: function (_a) {
            var companyName = _a.companyName;
            return "Inserisci le email di due direttori o dirigenti senior presso ".concat(companyName);
        },
        sendReminder: 'Invia un promemoria',
        chooseFile: 'Scegli file',
        weAreWaiting: "Stiamo aspettando che altri verifichino la loro identità come direttori o dirigenti senior dell'azienda.",
        id: "Copia del documento d'identità",
        proofOfDirectors: 'Prova del/i direttore/i',
        proofOfDirectorsDescription: 'Esempi: Profilo aziendale Oncorp o registrazione aziendale.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale per Firmatari, Utenti Autorizzati e Beneficiari Effettivi.',
        PDSandFSG: 'Documentazione di divulgazione PDS + FSG',
        PDSandFSGDescription: 'La nostra partnership con Corpay utilizza una connessione API per sfruttare la loro vasta rete di partner bancari internazionali per alimentare i Rimborsi Globali in Expensify. Secondo la normativa australiana, ti forniamo la Guida ai Servizi Finanziari (FSG) e la Dichiarazione di Divulgazione del Prodotto (PDS) di Corpay.\n\nSi prega di leggere attentamente i documenti FSG e PDS poiché contengono dettagli completi e informazioni importanti sui prodotti e servizi offerti da Corpay. Conserva questi documenti per riferimento futuro.',
        pleaseUpload: "Si prega di caricare ulteriore documentazione qui sotto per aiutarci a verificare la tua identità come direttore o dirigente senior dell'entità aziendale.",
    },
    agreementsStep: {
        agreements: 'Accordi',
        pleaseConfirm: 'Si prega di confermare gli accordi di seguito',
        regulationRequiresUs: "La normativa ci impone di verificare l'identità di qualsiasi individuo che possieda più del 25% dell'azienda.",
        iAmAuthorized: 'Sono autorizzato a utilizzare il conto bancario aziendale per le spese aziendali.',
        iCertify: 'Certifico che le informazioni fornite sono veritiere e accurate.',
        termsAndConditions: 'termini e condizioni',
        accept: 'Accetta e aggiungi conto bancario',
        iConsentToThe: 'Acconsento al',
        privacyNotice: 'informativa sulla privacy',
        error: {
            authorized: "Devi essere un ufficiale di controllo con l'autorizzazione per operare sul conto bancario aziendale.",
            certify: 'Si prega di certificare che le informazioni sono veritiere e accurate',
            consent: "Si prega di acconsentire all'informativa sulla privacy",
        },
    },
    finishStep: {
        connect: 'Collega conto bancario',
        letsFinish: 'Finisciamo in chat!',
        thanksFor: 'Grazie per questi dettagli. Un agente di supporto dedicato esaminerà ora le tue informazioni. Ti ricontatteremo se avremo bisogno di ulteriori informazioni da parte tua, ma nel frattempo, non esitare a contattarci per qualsiasi domanda.',
        iHaveA: 'Ho una domanda',
        enable2FA: "Abilita l'autenticazione a due fattori (2FA) per prevenire le frodi",
        weTake: "Prendiamo la tua sicurezza sul serio. Imposta ora l'autenticazione a due fattori (2FA) per aggiungere un ulteriore livello di protezione al tuo account.",
        secure: 'Proteggi il tuo account',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Un momento',
        explanationLine: 'Stiamo esaminando le tue informazioni. Potrai continuare con i prossimi passaggi a breve.',
    },
    session: {
        offlineMessageRetry: 'Sembra che tu sia offline. Controlla la tua connessione e riprova.',
    },
    travel: {
        header: 'Prenota viaggio',
        title: 'Viaggia con intelligenza',
        subtitle: 'Usa Expensify Travel per ottenere le migliori offerte di viaggio e gestire tutte le tue spese aziendali in un unico posto.',
        features: {
            saveMoney: 'Risparmia sui tuoi prenotazioni',
            alerts: 'Ricevi aggiornamenti e avvisi in tempo reale',
        },
        bookTravel: 'Prenota viaggio',
        bookDemo: 'Prenota una demo',
        bookADemo: 'Prenota una demo',
        toLearnMore: 'per saperne di più.',
        termsAndConditions: {
            header: 'Prima di continuare...',
            title: 'Termini e condizioni',
            subtitle: 'Si prega di accettare Expensify Travel',
            termsAndConditions: 'termini e condizioni',
            travelTermsAndConditions: 'termini e condizioni',
            agree: 'Accetto i',
            error: 'Devi accettare i termini e le condizioni di Expensify Travel per continuare',
            defaultWorkspaceError: "Devi impostare un'area di lavoro predefinita per abilitare Expensify Travel. Vai su Impostazioni > Aree di lavoro > clicca sui tre punti verticali accanto a un'area di lavoro > Imposta come area di lavoro predefinita, quindi riprova!",
        },
        flight: 'Volo',
        flightDetails: {
            passenger: 'Passeggero',
            layover: function (_a) {
                var layover = _a.layover;
                return "<muted-text-label>Hai uno <strong>scalo di ".concat(layover, "</strong> prima di questo volo</muted-text-label>");
            },
            takeOff: 'Decollo',
            landing: 'Atterraggio',
            seat: 'Posto',
            class: 'Classe Cabina',
            recordLocator: 'Localizzatore di registrazione',
            cabinClasses: {
                unknown: 'Unknown',
                economy: 'Economia',
                premiumEconomy: 'Premium Economy',
                business: 'Business',
                first: 'Primo',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Ospite',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
            roomType: 'Tipo di stanza',
            cancellation: 'Politica di cancellazione',
            cancellationUntil: 'Cancellazione gratuita fino al',
            confirmation: 'Numero di conferma',
            cancellationPolicies: {
                unknown: 'Unknown',
                nonRefundable: 'Non rimborsabile',
                freeCancellationUntil: 'Cancellazione gratuita fino al',
                partiallyRefundable: 'Parzialmente rimborsabile',
            },
        },
        car: 'Auto',
        carDetails: {
            rentalCar: 'Noleggio auto',
            pickUp: 'Ritiro',
            dropOff: 'Consegna',
            driver: 'Autista',
            carType: 'Tipo di auto',
            cancellation: 'Politica di cancellazione',
            cancellationUntil: 'Cancellazione gratuita fino al',
            freeCancellation: 'Cancellazione gratuita',
            confirmation: 'Numero di conferma',
        },
        train: 'Rail',
        trainDetails: {
            passenger: 'Passeggero',
            departs: 'Parte',
            arrives: 'Arriva',
            coachNumber: 'Numero del coach',
            seat: 'Posto',
            fareDetails: 'Dettagli della tariffa',
            confirmation: 'Numero di conferma',
        },
        viewTrip: 'Visualizza viaggio',
        modifyTrip: 'Modifica viaggio',
        tripSupport: 'Supporto per i viaggi',
        tripDetails: 'Dettagli del viaggio',
        viewTripDetails: 'Visualizza i dettagli del viaggio',
        trip: 'Viaggio',
        trips: 'Viaggi',
        tripSummary: 'Riepilogo del viaggio',
        departs: 'Parte',
        errorMessage: 'Qualcosa è andato storto. Per favore riprova più tardi.',
        phoneError: {
            phrase1: 'Per favore',
            link: "aggiungi un'email di lavoro come login principale",
            phrase2: 'per prenotare viaggi.',
        },
        domainSelector: {
            title: 'Dominio',
            subtitle: 'Scegli un dominio per la configurazione di Expensify Travel.',
            recommended: 'Consigliato',
        },
        domainPermissionInfo: {
            title: 'Dominio',
            restrictionPrefix: "Non hai il permesso di abilitare Expensify Travel per il dominio",
            restrictionSuffix: "Dovrai chiedere a qualcuno di quel dominio di abilitare i viaggi invece.",
            accountantInvitationPrefix: "Se sei un contabile, considera di unirti al",
            accountantInvitationLink: "Programma per contabili ExpensifyApproved!",
            accountantInvitationSuffix: "abilitare i viaggi per questo dominio.",
        },
        publicDomainError: {
            title: 'Inizia con Expensify Travel',
            message: "Dovrai utilizzare la tua email di lavoro (ad esempio, nome@azienda.com) con Expensify Travel, non la tua email personale (ad esempio, nome@gmail.com).",
        },
        blockedFeatureModal: {
            title: 'Expensify Travel è stato disabilitato',
            message: "Il tuo amministratore ha disattivato Expensify Travel. Si prega di seguire la politica di prenotazione della tua azienda per le disposizioni di viaggio.",
        },
        verifyCompany: {
            title: 'Inizia a viaggiare oggi stesso!',
            message: "Si prega di contattare il proprio Account Manager o salesteam@expensify.com per ottenere una demo di viaggio e attivarla per la vostra azienda.",
        },
        updates: {
            bookingTicketed: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate, _b = _a.confirmationID, confirmationID = _b === void 0 ? '' : _b;
                return "Il tuo volo ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") del ").concat(startDate, " \u00E8 stato prenotato. Codice di conferma: ").concat(confirmationID);
            },
            ticketVoided: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Il tuo biglietto per il volo ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") del ").concat(startDate, " \u00E8 stato annullato.");
            },
            ticketRefunded: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Il tuo biglietto per il volo ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") del ").concat(startDate, " \u00E8 stato rimborsato o cambiato.");
            },
            flightCancelled: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Il tuo volo ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") del ").concat(startDate, " \u00E8 stato cancellato dalla compagnia aerea.");
            },
            flightScheduleChangePending: function (_a) {
                var airlineCode = _a.airlineCode;
                return "La compagnia aerea ha proposto una modifica all'orario per il volo ".concat(airlineCode, "; stiamo aspettando conferma.");
            },
            flightScheduleChangeClosed: function (_a) {
                var airlineCode = _a.airlineCode, startDate = _a.startDate;
                return "Conferma del cambio di orario: il volo ".concat(airlineCode, " ora parte alle ").concat(startDate, ".");
            },
            flightUpdated: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Il tuo volo ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") del ").concat(startDate, " \u00E8 stato aggiornato.");
            },
            flightCabinChanged: function (_a) {
                var airlineCode = _a.airlineCode, cabinClass = _a.cabinClass;
                return "La tua classe di cabina \u00E8 stata aggiornata a ".concat(cabinClass, " sul volo ").concat(airlineCode, ".");
            },
            flightSeatConfirmed: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Il tuo posto assegnato sul volo ".concat(airlineCode, " \u00E8 stato confermato.");
            },
            flightSeatChanged: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Il tuo posto assegnato sul volo ".concat(airlineCode, " \u00E8 stato cambiato.");
            },
            flightSeatCancelled: function (_a) {
                var airlineCode = _a.airlineCode;
                return "La tua assegnazione del posto sul volo ".concat(airlineCode, " \u00E8 stata rimossa.");
            },
            paymentDeclined: 'Il pagamento per la tua prenotazione aerea non è riuscito. Per favore, riprova.',
            bookingCancelledByTraveler: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "Hai annullato la tua prenotazione ".concat(type, " ").concat(id, ".");
            },
            bookingCancelledByVendor: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "Il fornitore ha cancellato la tua prenotazione ".concat(type, " ").concat(id, ".");
            },
            bookingRebooked: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "La tua prenotazione ".concat(type, " \u00E8 stata riprenotata. Nuovo numero di conferma: ").concat(id, ".");
            },
            bookingUpdated: function (_a) {
                var type = _a.type;
                return "La tua prenotazione ".concat(type, " \u00E8 stata aggiornata. Controlla i nuovi dettagli nell'itinerario.");
            },
            railTicketRefund: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Il tuo biglietto ferroviario per ".concat(origin, " \u2192 ").concat(destination, " del ").concat(startDate, " \u00E8 stato rimborsato. Un credito verr\u00E0 elaborato.");
            },
            railTicketExchange: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Il tuo biglietto ferroviario per ".concat(origin, " \u2192 ").concat(destination, " del ").concat(startDate, " \u00E8 stato scambiato.");
            },
            railTicketUpdate: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Il tuo biglietto ferroviario per ".concat(origin, " \u2192 ").concat(destination, " del ").concat(startDate, " \u00E8 stato aggiornato.");
            },
            defaultUpdate: function (_a) {
                var type = _a.type;
                return "La tua prenotazione ".concat(type, " \u00E8 stata aggiornata.");
            },
        },
    },
    workspace: {
        common: {
            card: 'Carte',
            expensifyCard: 'Expensify Card',
            companyCards: 'Carte aziendali',
            workflows: 'Flussi di lavoro',
            workspace: 'Spazio di lavoro',
            findWorkspace: 'Trova spazio di lavoro',
            edit: 'Modifica spazio di lavoro',
            enabled: 'Abilitato',
            disabled: 'Disabilitato',
            everyone: 'Tutti quanti',
            delete: 'Elimina spazio di lavoro',
            settings: 'Impostazioni',
            reimburse: 'Rimborsi',
            categories: 'Categorie',
            tags: 'Tag',
            customField1: 'Campo personalizzato 1',
            customField2: 'Campo personalizzato 2',
            customFieldHint: 'Aggiungi una codifica personalizzata che si applica a tutte le spese di questo membro.',
            reportFields: 'Campi del rapporto',
            reportTitle: 'Titolo del rapporto',
            reportField: 'Campo del report',
            taxes: 'Tasse',
            bills: 'Fatture',
            invoices: 'Fatture',
            travel: 'Viaggio',
            members: 'Membri',
            accounting: 'Contabilità',
            rules: 'Regole',
            displayedAs: 'Visualizzato come',
            plan: 'Piano',
            profile: 'Panoramica',
            bankAccount: 'Conto bancario',
            connectBankAccount: 'Collega conto bancario',
            testTransactions: 'Transazioni di prova',
            issueAndManageCards: 'Emetti e gestisci carte',
            reconcileCards: 'Riconcilia carte',
            selected: function () { return ({
                one: '1 selezionato',
                other: function (count) { return "".concat(count, " selezionati"); },
            }); },
            settlementFrequency: 'Frequenza di liquidazione',
            setAsDefault: 'Imposta come spazio di lavoro predefinito',
            defaultNote: "Le ricevute inviate a ".concat(CONST_1.default.EMAIL.RECEIPTS, " appariranno in questo spazio di lavoro."),
            deleteConfirmation: 'Sei sicuro di voler eliminare questo spazio di lavoro?',
            deleteWithCardsConfirmation: 'Sei sicuro di voler eliminare questo spazio di lavoro? Questo rimuoverà tutti i feed delle carte e le carte assegnate.',
            unavailable: 'Spazio di lavoro non disponibile',
            memberNotFound: 'Membro non trovato. Per invitare un nuovo membro al workspace, utilizza il pulsante di invito sopra.',
            notAuthorized: "Non hai accesso a questa pagina. Se stai cercando di unirti a questo spazio di lavoro, chiedi semplicemente al proprietario dello spazio di lavoro di aggiungerti come membro. Qualcos'altro? Contatta ".concat(CONST_1.default.EMAIL.CONCIERGE, "."),
            goToWorkspace: 'Vai allo spazio di lavoro',
            goToWorkspaces: 'Vai agli spazi di lavoro',
            clearFilter: 'Cancella filtro',
            workspaceName: 'Nome del workspace',
            workspaceOwner: 'Proprietario',
            workspaceType: 'Tipo di spazio di lavoro',
            workspaceAvatar: 'Avatar del workspace',
            mustBeOnlineToViewMembers: 'Devi essere online per visualizzare i membri di questo spazio di lavoro.',
            moreFeatures: 'Più funzionalità',
            requested: 'Richiesto',
            distanceRates: 'Tariffe a distanza',
            defaultDescription: 'Un unico posto per tutte le tue ricevute e spese.',
            descriptionHint: 'Condividi informazioni su questo spazio di lavoro con tutti i membri.',
            welcomeNote: 'Per favore, usa Expensify per inviare le tue ricevute per il rimborso, grazie!',
            subscription: 'Abbonamento',
            markAsEntered: 'Segna come inserito manualmente',
            markAsExported: 'Segna come esportato manualmente',
            exportIntegrationSelected: function (_a) {
                var connectionName = _a.connectionName;
                return "Esporta in ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
            },
            letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
            lineItemLevel: 'Livello voce di dettaglio',
            reportLevel: 'Livello del report',
            topLevel: 'Livello superiore',
            appliedOnExport: "Non importato in Expensify, applicato all'esportazione",
            shareNote: {
                header: 'Condividi il tuo spazio di lavoro con altri membri',
                content: {
                    firstPart: 'Condividi questo codice QR o copia il link qui sotto per facilitare ai membri la richiesta di accesso al tuo spazio di lavoro. Tutte le richieste di adesione allo spazio di lavoro appariranno nella',
                    secondPart: 'spazio per la tua recensione.',
                },
            },
            connectTo: function (_a) {
                var connectionName = _a.connectionName;
                return "Connettiti a ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
            },
            createNewConnection: 'Crea nuova connessione',
            reuseExistingConnection: 'Riutilizza la connessione esistente',
            existingConnections: 'Connessioni esistenti',
            existingConnectionsDescription: function (_a) {
                var connectionName = _a.connectionName;
                return "Poich\u00E9 ti sei connesso a ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], " in precedenza, puoi scegliere di riutilizzare una connessione esistente o crearne una nuova.");
            },
            lastSyncDate: function (_a) {
                var connectionName = _a.connectionName, formattedDate = _a.formattedDate;
                return "".concat(connectionName, " - Ultima sincronizzazione ").concat(formattedDate);
            },
            authenticationError: function (_a) {
                var connectionName = _a.connectionName;
                return "Impossibile connettersi a ".concat(connectionName, " a causa di un errore di autenticazione");
            },
            learnMore: 'Scopri di più.',
            memberAlternateText: 'I membri possono inviare e approvare i rapporti.',
            adminAlternateText: 'Gli amministratori hanno pieno accesso di modifica a tutti i report e alle impostazioni dello spazio di lavoro.',
            auditorAlternateText: 'Gli auditor possono visualizzare e commentare i rapporti.',
            roleName: function (_a) {
                var _b = _a === void 0 ? {} : _a, role = _b.role;
                switch (role) {
                    case CONST_1.default.POLICY.ROLE.ADMIN:
                        return 'Admin';
                    case CONST_1.default.POLICY.ROLE.AUDITOR:
                        return 'Revisore dei conti';
                    case CONST_1.default.POLICY.ROLE.USER:
                        return 'Membro';
                    default:
                        return 'Membro';
                }
            },
            frequency: {
                manual: 'Manuale',
                instant: 'Istantaneo',
                immediate: 'Quotidiano',
                trip: 'Per viaggio',
                weekly: 'Settimanale',
                semimonthly: 'Due volte al mese',
                monthly: 'Mensile',
            },
            planType: 'Tipo di piano',
            submitExpense: 'Invia le tue spese qui sotto:',
            defaultCategory: 'Categoria predefinita',
            viewTransactions: 'Visualizza transazioni',
            policyExpenseChatName: function (_a) {
                var displayName = _a.displayName;
                return "Spese di ".concat(displayName);
            },
        },
        perDiem: {
            subtitle: 'Imposta le tariffe di diaria per controllare la spesa giornaliera dei dipendenti.',
            amount: 'Importo',
            deleteRates: function () { return ({
                one: 'Elimina tariffa',
                other: 'Elimina tariffe',
            }); },
            deletePerDiemRate: 'Elimina la tariffa di diaria',
            findPerDiemRate: 'Trova la tariffa giornaliera',
            areYouSureDelete: function () { return ({
                one: 'Sei sicuro di voler eliminare questa tariffa?',
                other: 'Sei sicuro di voler eliminare queste tariffe?',
            }); },
            emptyList: {
                title: 'Per diem',
                subtitle: 'Imposta le tariffe diarie per controllare la spesa giornaliera dei dipendenti. Importa le tariffe da un foglio di calcolo per iniziare.',
            },
            errors: {
                existingRateError: function (_a) {
                    var rate = _a.rate;
                    return "Una tariffa con valore ".concat(rate, " esiste gi\u00E0");
                },
            },
            importPerDiemRates: 'Importa le tariffe diarie',
            editPerDiemRate: 'Modifica la tariffa di diaria',
            editPerDiemRates: 'Modifica le tariffe di diaria',
            editDestinationSubtitle: function (_a) {
                var destination = _a.destination;
                return "Aggiornare questa destinazione cambier\u00E0 tutte le sottotariffe di diaria per ".concat(destination, ".");
            },
            editCurrencySubtitle: function (_a) {
                var destination = _a.destination;
                return "Aggiornare questa valuta la modificher\u00E0 per tutte le sottotariffe di diaria di ".concat(destination, ".");
            },
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Imposta come esportare le spese anticipate su QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Contrassegna gli assegni come "stampa più tardi"',
            exportDescription: 'Configura come i dati di Expensify vengono esportati su QuickBooks Desktop.',
            date: 'Data di esportazione',
            exportInvoices: 'Esporta fatture su',
            exportExpensifyCard: 'Esporta le transazioni della Expensify Card come',
            account: 'Account',
            accountDescription: 'Scegli dove pubblicare le registrazioni contabili.',
            accountsPayable: 'Conti da pagare',
            accountsPayableDescription: 'Scegli dove creare le fatture dei fornitori.',
            bankAccount: 'Conto bancario',
            notConfigured: 'Non configurato',
            bankAccountDescription: 'Scegli da dove inviare gli assegni.',
            creditCardAccount: 'Account di carta di credito',
            exportDate: {
                label: 'Data di esportazione',
                description: 'Usa questa data quando esporti i report su QuickBooks Desktop.',
                values: (_e = {},
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE] = {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa più recente nel rapporto.',
                    },
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato su QuickBooks Desktop.',
                    },
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: 'Data di invio',
                        description: "Data in cui il rapporto è stato inviato per l'approvazione.",
                    },
                    _e),
            },
            exportCheckDescription: 'Creeremo un assegno dettagliato per ogni report di Expensify e lo invieremo dal conto bancario sottostante.',
            exportJournalEntryDescription: "Creeremo una registrazione contabile dettagliata per ogni report di Expensify e la pubblicheremo sull'account qui sotto.",
            exportVendorBillDescription: "Creeremo una fattura dettagliata del fornitore per ogni report di Expensify e la aggiungeremo all'account sottostante. Se questo periodo è chiuso, la registreremo al 1° del prossimo periodo aperto.",
            deepDiveExpensifyCard: 'Le transazioni della Expensify Card verranno esportate automaticamente in un "Conto di responsabilità della Expensify Card" creato con',
            deepDiveExpensifyCardIntegration: 'la nostra integrazione.',
            outOfPocketTaxEnabledDescription: 'QuickBooks Desktop non supporta le tasse sulle esportazioni delle registrazioni contabili. Poiché hai le tasse abilitate nel tuo spazio di lavoro, questa opzione di esportazione non è disponibile.',
            outOfPocketTaxEnabledError: "Le registrazioni contabili non sono disponibili quando le tasse sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
            accounts: (_f = {},
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD] = 'Carta di credito',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Fattura fornitore',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Voce di diario',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Controlla',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK, "Description")] = 'Creeremo un assegno dettagliato per ogni report di Expensify e lo invieremo dal conto bancario sottostante.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "Description")] = "Abbineremo automaticamente il nome del commerciante sulla transazione con carta di credito a qualsiasi fornitore corrispondente in QuickBooks. Se non esistono fornitori, creeremo un fornitore 'Credit Card Misc.' per l'associazione.",
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Description")] = "Creeremo una fattura dettagliata del fornitore per ogni report di Expensify con la data dell'ultima spesa e la aggiungeremo al conto sottostante. Se questo periodo è chiuso, la registreremo al 1° del prossimo periodo aperto.",
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "AccountDescription")] = 'Scegli dove esportare le transazioni con carta di credito.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "AccountDescription")] = 'Scegli un fornitore da applicare a tutte le transazioni con carta di credito.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "AccountDescription")] = 'Scegli da dove inviare gli assegni.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Error")] = "Le fatture dei fornitori non sono disponibili quando le località sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "Error")] = "Gli assegni non sono disponibili quando le località sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY, "Error")] = "Le registrazioni contabili non sono disponibili quando le tasse sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
                _f),
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: "Aggiungi l'account in QuickBooks Desktop e sincronizza nuovamente la connessione",
            qbdSetup: 'Configurazione di QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Impossibile connettersi da questo dispositivo',
                body1: 'Dovrai configurare questa connessione dal computer che ospita il file della tua azienda QuickBooks Desktop.',
                body2: 'Una volta connesso, sarai in grado di sincronizzare ed esportare da qualsiasi luogo.',
            },
            setupPage: {
                title: 'Apri questo link per connetterti',
                body: 'Per completare la configurazione, apri il seguente link sul computer dove è in esecuzione QuickBooks Desktop.',
                setupErrorTitle: 'Qualcosa è andato storto',
                setupErrorBody1: 'La connessione a QuickBooks Desktop non funziona al momento. Per favore, riprova più tardi o',
                setupErrorBody2: 'se il problema persiste.',
                setupErrorBodyContactConcierge: 'contatta Concierge',
            },
            importDescription: 'Scegli quali configurazioni di codifica importare da QuickBooks Desktop a Expensify.',
            classes: 'Classi',
            items: 'Articoli',
            customers: 'Clienti/progetti',
            exportCompanyCardsDescription: 'Imposta come le spese con carta aziendale vengono esportate su QuickBooks Desktop.',
            defaultVendorDescription: "Imposta un fornitore predefinito che verrà applicato a tutte le transazioni con carta di credito al momento dell'esportazione.",
            accountsDescription: 'Il tuo piano dei conti di QuickBooks Desktop verrà importato in Expensify come categorie.',
            accountsSwitchTitle: 'Scegli di importare nuovi conti come categorie abilitate o disabilitate.',
            accountsSwitchDescription: 'Le categorie abilitate saranno disponibili per i membri da selezionare quando creano le loro spese.',
            classesDescription: 'Scegli come gestire le classi di QuickBooks Desktop in Expensify.',
            tagsDisplayedAsDescription: 'Livello voce di spesa',
            reportFieldsDisplayedAsDescription: 'Livello del report',
            customersDescription: 'Scegli come gestire i clienti/progetti di QuickBooks Desktop in Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con QuickBooks Desktop ogni giorno.',
                createEntities: 'Crea automaticamente entità',
                createEntitiesDescription: 'Expensify creerà automaticamente i fornitori in QuickBooks Desktop se non esistono già.',
            },
            itemsDescription: 'Scegli come gestire gli elementi di QuickBooks Desktop in Expensify.',
        },
        qbo: {
            connectedTo: 'Connesso a',
            importDescription: 'Scegli quali configurazioni di codifica importare da QuickBooks Online a Expensify.',
            classes: 'Classi',
            locations: 'Località',
            customers: 'Clienti/progetti',
            accountsDescription: 'Il tuo piano dei conti di QuickBooks Online verrà importato in Expensify come categorie.',
            accountsSwitchTitle: 'Scegli di importare nuovi conti come categorie abilitate o disabilitate.',
            accountsSwitchDescription: 'Le categorie abilitate saranno disponibili per i membri da selezionare quando creano le loro spese.',
            classesDescription: 'Scegli come gestire le classi di QuickBooks Online in Expensify.',
            customersDescription: 'Scegli come gestire i clienti/progetti di QuickBooks Online in Expensify.',
            locationsDescription: 'Scegli come gestire le sedi di QuickBooks Online in Expensify.',
            taxesDescription: 'Scegli come gestire le tasse di QuickBooks Online in Expensify.',
            locationsLineItemsRestrictionDescription: 'QuickBooks Online non supporta le Località a livello di riga per Assegni o Fatture Fornitori. Se desideri avere località a livello di riga, assicurati di utilizzare le Scritture Contabili e le spese con Carta di Credito/Debito.',
            taxesJournalEntrySwitchNote: "QuickBooks Online non supporta le tasse sulle registrazioni contabili. Si prega di cambiare l'opzione di esportazione in fattura fornitore o assegno.",
            exportDescription: 'Configura come i dati di Expensify vengono esportati su QuickBooks Online.',
            date: 'Data di esportazione',
            exportInvoices: 'Esporta fatture su',
            exportExpensifyCard: 'Esporta le transazioni della Expensify Card come',
            deepDiveExpensifyCard: 'Le transazioni della Expensify Card verranno esportate automaticamente in un "Conto di responsabilità della Expensify Card" creato con',
            deepDiveExpensifyCardIntegration: 'la nostra integrazione.',
            exportDate: {
                label: 'Data di esportazione',
                description: 'Usa questa data quando esporti i rapporti su QuickBooks Online.',
                values: (_g = {},
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE] = {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa più recente nel rapporto.',
                    },
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato su QuickBooks Online.',
                    },
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: 'Data di invio',
                        description: "Data in cui il rapporto è stato inviato per l'approvazione.",
                    },
                    _g),
            },
            receivable: 'Crediti verso clienti', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archivio contabilità clienti', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Usa questo account quando esporti le fatture su QuickBooks Online.',
            exportCompanyCardsDescription: 'Imposta come esportare gli acquisti con carta aziendale su QuickBooks Online.',
            vendor: 'Fornitore',
            defaultVendorDescription: "Imposta un fornitore predefinito che verrà applicato a tutte le transazioni con carta di credito al momento dell'esportazione.",
            exportOutOfPocketExpensesDescription: 'Imposta come esportare le spese anticipate su QuickBooks Online.',
            exportCheckDescription: 'Creeremo un assegno dettagliato per ogni report di Expensify e lo invieremo dal conto bancario sottostante.',
            exportJournalEntryDescription: "Creeremo una registrazione contabile dettagliata per ogni report di Expensify e la pubblicheremo sull'account qui sotto.",
            exportVendorBillDescription: "Creeremo una fattura dettagliata del fornitore per ogni report di Expensify e la aggiungeremo all'account sottostante. Se questo periodo è chiuso, la registreremo al 1° del prossimo periodo aperto.",
            account: 'Account',
            accountDescription: 'Scegli dove pubblicare le registrazioni contabili.',
            accountsPayable: 'Conti da pagare',
            accountsPayableDescription: 'Scegli dove creare le fatture dei fornitori.',
            bankAccount: 'Conto bancario',
            notConfigured: 'Non configurato',
            bankAccountDescription: 'Scegli da dove inviare gli assegni.',
            creditCardAccount: 'Account di carta di credito',
            companyCardsLocationEnabledDescription: 'QuickBooks Online non supporta le località nelle esportazioni delle fatture dei fornitori. Poiché hai abilitato le località nel tuo spazio di lavoro, questa opzione di esportazione non è disponibile.',
            outOfPocketTaxEnabledDescription: 'QuickBooks Online non supporta le tasse sulle esportazioni delle registrazioni contabili. Poiché hai abilitato le tasse nel tuo spazio di lavoro, questa opzione di esportazione non è disponibile.',
            outOfPocketTaxEnabledError: "Le registrazioni contabili non sono disponibili quando le tasse sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con QuickBooks Online ogni giorno.',
                inviteEmployees: 'Invita dipendenti',
                inviteEmployeesDescription: 'Importa i record dei dipendenti di QuickBooks Online e invita i dipendenti a questo spazio di lavoro.',
                createEntities: 'Crea automaticamente entità',
                createEntitiesDescription: "Expensify creerà automaticamente fornitori in QuickBooks Online se non esistono già e creerà automaticamente clienti durante l'esportazione delle fatture.",
                reimbursedReportsDescription: "Ogni volta che un report viene pagato utilizzando Expensify ACH, il corrispondente pagamento della fattura verrà creato nell'account QuickBooks Online qui sotto.",
                qboBillPaymentAccount: 'Account di pagamento fatture QuickBooks',
                qboInvoiceCollectionAccount: 'Account di riscossione fatture QuickBooks',
                accountSelectDescription: 'Scegli da dove pagare le fatture e creeremo il pagamento in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Scegli dove ricevere i pagamenti delle fatture e creeremo il pagamento in QuickBooks Online.',
            },
            accounts: (_h = {},
                _h[CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD] = 'Carta di debito',
                _h[CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD] = 'Carta di credito',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Fattura fornitore',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Voce di diario',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Controlla',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD, "Description")] = "Abbineremo automaticamente il nome del commerciante sulla transazione con carta di debito a qualsiasi fornitore corrispondente in QuickBooks. Se non esistono fornitori, creeremo un fornitore 'Carta di Debito Varie' per l'associazione.",
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "Description")] = "Abbineremo automaticamente il nome del commerciante sulla transazione con carta di credito a qualsiasi fornitore corrispondente in QuickBooks. Se non esistono fornitori, creeremo un fornitore 'Credit Card Misc.' per l'associazione.",
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Description")] = "Creeremo una fattura dettagliata del fornitore per ogni report di Expensify con la data dell'ultima spesa e la aggiungeremo al conto sottostante. Se questo periodo è chiuso, la registreremo al 1° del prossimo periodo aperto.",
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD, "AccountDescription")] = 'Scegli dove esportare le transazioni con carta di debito.',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "AccountDescription")] = 'Scegli dove esportare le transazioni con carta di credito.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "AccountDescription")] = 'Scegli un fornitore da applicare a tutte le transazioni con carta di credito.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Error")] = "Le fatture dei fornitori non sono disponibili quando le località sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "Error")] = "Gli assegni non sono disponibili quando le località sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY, "Error")] = "Le registrazioni contabili non sono disponibili quando le tasse sono abilitate. Si prega di scegliere un'opzione di esportazione diversa.",
                _h),
            exportDestinationAccountsMisconfigurationError: (_j = {},
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = "Scegli un account valido per l'esportazione delle fatture fornitore",
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = "Scegli un account valido per l'esportazione della registrazione contabile",
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = "Scegli un account valido per l'esportazione dell'assegno",
                _j),
            exportDestinationSetupAccountsInfo: (_k = {},
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = "Per utilizzare l'esportazione delle fatture dei fornitori, configura un conto contabile fornitori in QuickBooks Online.",
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = "Per utilizzare l'esportazione delle registrazioni contabili, configura un conto contabile in QuickBooks Online.",
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = "Per utilizzare l'esportazione degli assegni, configura un conto bancario in QuickBooks Online.",
                _k),
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: "Aggiungi l'account in QuickBooks Online e sincronizza nuovamente la connessione.",
            accountingMethods: {
                label: 'Quando Esportare',
                description: 'Scegli quando esportare le spese:',
                values: (_l = {},
                    _l[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Accrual',
                    _l[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Contanti',
                    _l),
                alternateText: (_m = {},
                    _m[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Le spese anticipate verranno esportate quando approvate definitivamente.',
                    _m[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Le spese anticipate verranno esportate quando pagate',
                    _m),
            },
        },
        workspaceList: {
            joinNow: 'Iscriviti ora',
            askToJoin: 'Chiedi di unirti',
        },
        xero: {
            organization: 'Organizzazione Xero',
            organizationDescription: "Scegli l'organizzazione Xero da cui desideri importare i dati.",
            importDescription: 'Scegli quali configurazioni di codifica importare da Xero a Expensify.',
            accountsDescription: 'Il tuo piano dei conti Xero verrà importato in Expensify come categorie.',
            accountsSwitchTitle: 'Scegli di importare nuovi conti come categorie abilitate o disabilitate.',
            accountsSwitchDescription: 'Le categorie abilitate saranno disponibili per i membri da selezionare quando creano le loro spese.',
            trackingCategories: 'Categorie di tracciamento',
            trackingCategoriesDescription: 'Scegli come gestire le categorie di tracciamento Xero in Expensify.',
            mapTrackingCategoryTo: function (_a) {
                var categoryName = _a.categoryName;
                return "Mappa ".concat(categoryName, " di Xero a");
            },
            mapTrackingCategoryToDescription: function (_a) {
                var categoryName = _a.categoryName;
                return "Scegli dove mappare ".concat(categoryName, " quando esporti su Xero.");
            },
            customers: 'Riaddebita clienti',
            customersDescription: 'Scegli se rifatturare i clienti in Expensify. I contatti dei clienti Xero possono essere associati alle spese e verranno esportati in Xero come fattura di vendita.',
            taxesDescription: 'Scegli come gestire le tasse di Xero in Expensify.',
            notImported: 'Non importato',
            notConfigured: 'Non configurato',
            trackingCategoriesOptions: (_o = {},
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT] = 'Contatto predefinito Xero',
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG] = 'Tag',
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD] = 'Campi del rapporto',
                _o),
            exportDescription: 'Configura come i dati di Expensify vengono esportati su Xero.',
            purchaseBill: 'Acquisto fattura',
            exportDeepDiveCompanyCard: 'Le spese esportate verranno registrate come transazioni bancarie sul conto bancario Xero qui sotto, e le date delle transazioni corrisponderanno alle date sul tuo estratto conto bancario.',
            bankTransactions: 'Transazioni bancarie',
            xeroBankAccount: 'Conto bancario Xero',
            xeroBankAccountDescription: 'Scegli dove le spese verranno registrate come transazioni bancarie.',
            exportExpensesDescription: "I rapporti verranno esportati come fattura d'acquisto con la data e lo stato selezionati di seguito.",
            purchaseBillDate: 'Data di acquisto della fattura',
            exportInvoices: 'Esporta fatture come',
            salesInvoice: 'Fattura di vendita',
            exportInvoicesDescription: 'Le fatture di vendita mostrano sempre la data in cui la fattura è stata inviata.',
            advancedConfig: {
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con Xero ogni giorno.',
                purchaseBillStatusTitle: "Stato della fattura d'acquisto",
                reimbursedReportsDescription: "Ogni volta che un report viene pagato utilizzando Expensify ACH, il corrispondente pagamento della fattura verrà creato nell'account Xero qui sotto.",
                xeroBillPaymentAccount: 'Account di pagamento fatture Xero',
                xeroInvoiceCollectionAccount: 'Account di incasso fatture Xero',
                xeroBillPaymentAccountDescription: 'Scegli da dove pagare le fatture e creeremo il pagamento in Xero.',
                invoiceAccountSelectorDescription: 'Scegli dove ricevere i pagamenti delle fatture e creeremo il pagamento in Xero.',
            },
            exportDate: {
                label: 'Data di acquisto della fattura',
                description: 'Usa questa data quando esporti i report su Xero.',
                values: (_p = {},
                    _p[CONST_1.default.XERO_EXPORT_DATE.LAST_EXPENSE] = {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa più recente nel rapporto.',
                    },
                    _p[CONST_1.default.XERO_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato su Xero.',
                    },
                    _p[CONST_1.default.XERO_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: 'Data di invio',
                        description: "Data in cui il rapporto è stato inviato per l'approvazione.",
                    },
                    _p),
            },
            invoiceStatus: {
                label: "Stato della fattura d'acquisto",
                description: 'Usa questo stato quando esporti le fatture di acquisto su Xero.',
                values: (_q = {},
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.DRAFT] = 'Bozza',
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL] = 'In attesa di approvazione',
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT] = 'In attesa di pagamento',
                    _q),
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: "Per favore, aggiungi l'account in Xero e sincronizza nuovamente la connessione.",
        },
        sageIntacct: {
            preferredExporter: 'Esportatore preferito',
            taxSolution: 'Soluzione fiscale',
            notConfigured: 'Non configurato',
            exportDate: {
                label: 'Data di esportazione',
                description: 'Usa questa data quando esporti i report su Sage Intacct.',
                values: (_r = {},
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE] = {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa più recente nel rapporto.',
                    },
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.EXPORTED] = {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato su Sage Intacct.',
                    },
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.SUBMITTED] = {
                        label: 'Data di invio',
                        description: "Data in cui il rapporto è stato inviato per l'approvazione.",
                    },
                    _r),
            },
            reimbursableExpenses: {
                description: 'Imposta come esportare le spese anticipate su Sage Intacct.',
                values: (_s = {},
                    _s[CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT] = 'Report di spesa',
                    _s[CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL] = 'Fatture fornitore',
                    _s),
            },
            nonReimbursableExpenses: {
                description: 'Imposta come esportare gli acquisti con carta aziendale su Sage Intacct.',
                values: (_t = {},
                    _t[CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE] = 'Carte di credito',
                    _t[CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL] = 'Fatture fornitore',
                    _t),
            },
            creditCardAccount: 'Account di carta di credito',
            defaultVendor: 'Fornitore predefinito',
            defaultVendorDescription: function (_a) {
                var isReimbursable = _a.isReimbursable;
                return "Imposta un fornitore predefinito che verr\u00E0 applicato alle spese rimborsabili ".concat(isReimbursable ? '' : 'non-', " che non hanno un fornitore corrispondente in Sage Intacct.");
            },
            exportDescription: 'Configura come i dati di Expensify vengono esportati su Sage Intacct.',
            exportPreferredExporterNote: "L'esportatore preferito può essere qualsiasi amministratore dello spazio di lavoro, ma deve anche essere un amministratore di dominio se imposti conti di esportazione diversi per singole carte aziendali nelle impostazioni del dominio.",
            exportPreferredExporterSubNote: "Una volta impostato, l'esportatore preferito vedrà i report per l'esportazione nel proprio account.",
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: "Si prega di aggiungere l'account in Sage Intacct e sincronizzare nuovamente la connessione.",
            autoSync: 'Sincronizzazione automatica',
            autoSyncDescription: 'Expensify si sincronizzerà automaticamente con Sage Intacct ogni giorno.',
            inviteEmployees: 'Invita dipendenti',
            inviteEmployeesDescription: "Importa i record dei dipendenti di Sage Intacct e invita i dipendenti a questo spazio di lavoro. Il tuo flusso di approvazione predefinito sarà l'approvazione del manager e può essere ulteriormente configurato nella pagina Membri.",
            syncReimbursedReports: 'Sincronizza i rapporti rimborsati',
            syncReimbursedReportsDescription: "Ogni volta che un report viene pagato utilizzando Expensify ACH, il pagamento della fattura corrispondente verrà creato nell'account Sage Intacct qui sotto.",
            paymentAccount: 'Account di pagamento Sage Intacct',
        },
        netsuite: {
            subsidiary: 'Sussidiaria',
            subsidiarySelectDescription: 'Scegli la filiale in NetSuite da cui desideri importare i dati.',
            exportDescription: 'Configura come i dati di Expensify vengono esportati su NetSuite.',
            exportInvoices: 'Esporta fatture su',
            journalEntriesTaxPostingAccount: 'Registrazioni contabili conto di registrazione delle imposte',
            journalEntriesProvTaxPostingAccount: 'Voci di diario conto di registrazione imposta provinciale',
            foreignCurrencyAmount: 'Esporta importo in valuta estera',
            exportToNextOpenPeriod: 'Esporta al prossimo periodo aperto',
            nonReimbursableJournalPostingAccount: 'Account di registrazione giornaliera non rimborsabile',
            reimbursableJournalPostingAccount: 'Account di registrazione giornaliera rimborsabile',
            journalPostingPreference: {
                label: 'Preferenza di registrazione delle scritture contabili',
                values: (_u = {},
                    _u[CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE] = 'Singola voce dettagliata per ciascun report',
                    _u[CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE] = 'Voce singola per ogni spesa',
                    _u),
            },
            invoiceItem: {
                label: 'Voce di fattura',
                values: (_v = {},
                    _v[CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE] = {
                        label: 'Creane uno per me',
                        description: 'Creeremo una "voce di fattura Expensify" per te al momento dell\'esportazione (se non esiste già).',
                    },
                    _v[CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT] = {
                        label: 'Seleziona esistente',
                        description: "Assoceremo le fatture di Expensify all'elemento selezionato qui sotto.",
                    },
                    _v),
            },
            exportDate: {
                label: 'Data di esportazione',
                description: 'Usa questa data quando esporti i rapporti su NetSuite.',
                values: (_w = {},
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.LAST_EXPENSE] = {
                        label: "Data dell'ultima spesa",
                        description: 'Data della spesa più recente nel rapporto.',
                    },
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.EXPORTED] = {
                        label: 'Data di esportazione',
                        description: 'Data in cui il report è stato esportato su NetSuite.',
                    },
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.SUBMITTED] = {
                        label: 'Data di invio',
                        description: "Data in cui il rapporto è stato inviato per l'approvazione.",
                    },
                    _w),
            },
            exportDestination: {
                values: (_x = {},
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT] = {
                        label: 'Report di spesa',
                        reimbursableDescription: 'Le spese anticipate verranno esportate come report di spesa su NetSuite.',
                        nonReimbursableDescription: 'Le spese con carta aziendale verranno esportate come report di spesa su NetSuite.',
                    },
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL] = {
                        label: 'Fatture fornitore',
                        reimbursableDescription: 'Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                        nonReimbursableDescription: 'Company card expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                    },
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY] = {
                        label: 'Voci di diario',
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
                autoSyncDescription: 'Expensify si sincronizzerà automaticamente con NetSuite ogni giorno.',
                reimbursedReportsDescription: "Ogni volta che un report viene pagato utilizzando Expensify ACH, il corrispondente pagamento della fattura verrà creato nell'account NetSuite qui sotto.",
                reimbursementsAccount: 'Account di rimborso',
                reimbursementsAccountDescription: 'Scegli il conto bancario che utilizzerai per i rimborsi e creeremo il pagamento associato in NetSuite.',
                collectionsAccount: 'Account di riscossione',
                collectionsAccountDescription: "Una volta che una fattura è contrassegnata come pagata in Expensify ed esportata su NetSuite, apparirà contro l'account qui sotto.",
                approvalAccount: 'Account di approvazione A/P',
                approvalAccountDescription: "Scegli l'account contro cui verranno approvate le transazioni in NetSuite. Se stai sincronizzando i report rimborsati, questo è anche l'account contro cui verranno creati i pagamenti delle fatture.",
                defaultApprovalAccount: 'Predefinito di NetSuite',
                inviteEmployees: 'Invita i dipendenti e imposta le approvazioni',
                inviteEmployeesDescription: "Importa i record dei dipendenti di NetSuite e invita i dipendenti a questo spazio di lavoro. Il tuo flusso di approvazione predefinito sarà l'approvazione del manager e può essere ulteriormente configurato nella pagina *Membri*.",
                autoCreateEntities: 'Crea automaticamente dipendenti/fornitori',
                enableCategories: 'Abilita le categorie appena importate',
                customFormID: 'ID modulo personalizzato',
                customFormIDDescription: 'Per impostazione predefinita, Expensify creerà voci utilizzando il modulo di transazione preferito impostato in NetSuite. In alternativa, puoi designare un modulo di transazione specifico da utilizzare.',
                customFormIDReimbursable: 'Spesa personale',
                customFormIDNonReimbursable: 'Spesa con carta aziendale',
                exportReportsTo: {
                    label: 'Livello di approvazione del rapporto spese',
                    description: 'Una volta che un rapporto spese è approvato in Expensify ed esportato su NetSuite, puoi impostare un ulteriore livello di approvazione in NetSuite prima della registrazione.',
                    values: (_y = {},
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE] = 'Preferenza predefinita di NetSuite',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED] = 'Solo supervisore approvato',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED] = 'Solo contabilità approvata',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH] = 'Supervisore e contabilità approvati',
                        _y),
                },
                accountingMethods: {
                    label: 'Quando Esportare',
                    description: 'Scegli quando esportare le spese:',
                    values: (_z = {},
                        _z[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Accrual',
                        _z[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Contanti',
                        _z),
                    alternateText: (_0 = {},
                        _0[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Le spese anticipate verranno esportate quando approvate definitivamente.',
                        _0[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Le spese anticipate verranno esportate quando pagate',
                        _0),
                },
                exportVendorBillsTo: {
                    label: 'Livello di approvazione della fattura del fornitore',
                    description: 'Una volta che una fattura del fornitore è approvata in Expensify ed esportata in NetSuite, puoi impostare un ulteriore livello di approvazione in NetSuite prima della registrazione.',
                    values: (_1 = {},
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE] = 'Preferenza predefinita di NetSuite',
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING] = 'In attesa di approvazione',
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED] = 'Approvato per la pubblicazione',
                        _1),
                },
                exportJournalsTo: {
                    label: 'Livello di approvazione della registrazione contabile',
                    description: 'Una volta che una registrazione contabile è approvata in Expensify ed esportata su NetSuite, puoi impostare un ulteriore livello di approvazione in NetSuite prima della registrazione.',
                    values: (_2 = {},
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE] = 'Preferenza predefinita di NetSuite',
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING] = 'In attesa di approvazione',
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED] = 'Approvato per la pubblicazione',
                        _2),
                },
                error: {
                    customFormID: 'Inserisci un ID modulo personalizzato numerico valido',
                },
            },
            noAccountsFound: 'Nessun account trovato',
            noAccountsFoundDescription: "Si prega di aggiungere l'account in NetSuite e sincronizzare nuovamente la connessione.",
            noVendorsFound: 'Nessun fornitore trovato',
            noVendorsFoundDescription: 'Si prega di aggiungere i fornitori in NetSuite e sincronizzare nuovamente la connessione.',
            noItemsFound: 'Nessun elemento della fattura trovato',
            noItemsFoundDescription: 'Per favore, aggiungi gli articoli della fattura in NetSuite e sincronizza nuovamente la connessione.',
            noSubsidiariesFound: 'Nessuna filiale trovata',
            noSubsidiariesFoundDescription: 'Per favore, aggiungi una filiale in NetSuite e sincronizza nuovamente la connessione.',
            tokenInput: {
                title: 'NetSuite setup',
                formSteps: {
                    installBundle: {
                        title: 'Installa il pacchetto Expensify',
                        description: 'In NetSuite, vai su *Customization > SuiteBundler > Search & Install Bundles* > cerca "Expensify" > installa il bundle.',
                    },
                    enableTokenAuthentication: {
                        title: "Abilita l'autenticazione basata su token",
                        description: 'In NetSuite, vai su *Setup > Company > Enable Features > SuiteCloud* > abilita *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Abilita i servizi web SOAP',
                        description: 'In NetSuite, vai su *Setup > Company > Enable Features > SuiteCloud* > abilita *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Crea un token di accesso',
                        description: 'In NetSuite, vai su *Setup > Users/Roles > Access Tokens* > crea un token di accesso per l\'app "Expensify" e per il ruolo "Expensify Integration" o "Administrator".\n\n*Importante:* Assicurati di salvare il *Token ID* e il *Token Secret* da questo passaggio. Ne avrai bisogno per il passaggio successivo.',
                    },
                    enterCredentials: {
                        title: 'Inserisci le tue credenziali NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: 'Token ID',
                            netSuiteTokenSecret: 'Token Secret',
                        },
                        netSuiteAccountIDDescription: 'In NetSuite, vai su *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Categorie di spesa',
                expenseCategoriesDescription: 'Le tue categorie di spesa NetSuite verranno importate in Expensify come categorie.',
                crossSubsidiaryCustomers: 'Clienti/progetti tra sussidiarie',
                importFields: {
                    departments: {
                        title: 'Dipartimenti',
                        subtitle: 'Scegli come gestire i *dipartimenti* di NetSuite in Expensify.',
                    },
                    classes: {
                        title: 'Classi',
                        subtitle: 'Scegli come gestire le *classi* in Expensify.',
                    },
                    locations: {
                        title: 'Località',
                        subtitle: 'Scegli come gestire le *posizioni* in Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Clienti/progetti',
                    subtitle: 'Scegli come gestire i *clienti* e i *progetti* di NetSuite in Expensify.',
                    importCustomers: 'Importa clienti',
                    importJobs: 'Importa progetti',
                    customers: 'clienti',
                    jobs: 'progetti',
                    label: function (_a) {
                        var importFields = _a.importFields, importType = _a.importType;
                        return "".concat(importFields.join('e'), ", ").concat(importType);
                    },
                },
                importTaxDescription: 'Importa gruppi fiscali da NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: "Scegli un'opzione qui sotto:",
                    label: function (_a) {
                        var importedTypes = _a.importedTypes;
                        return "Imported as ".concat(importedTypes.join('e'));
                    },
                    requiredFieldError: function (_a) {
                        var fieldName = _a.fieldName;
                        return "Per favore, inserisci il ".concat(fieldName);
                    },
                    customSegments: {
                        title: 'Segmenti/record personalizzati',
                        addText: 'Aggiungi segmento/record personalizzato',
                        recordTitle: 'Segmento/record personalizzato',
                        helpLink: CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Visualizza istruzioni dettagliate',
                        helpText: 'sulla configurazione di segmenti/record personalizzati.',
                        emptyTitle: 'Aggiungi un segmento personalizzato o un record personalizzato',
                        fields: {
                            segmentName: 'Nome',
                            internalID: 'ID interno',
                            scriptID: 'ID script',
                            customRecordScriptID: 'ID colonna transazione',
                            mapping: 'Visualizzato come',
                        },
                        removeTitle: 'Rimuovi segmento/record personalizzato',
                        removePrompt: 'Sei sicuro di voler rimuovere questo segmento/record personalizzato?',
                        addForm: {
                            customSegmentName: 'nome segmento personalizzato',
                            customRecordName: 'nome del record personalizzato',
                            segmentTitle: 'Segmento personalizzato',
                            customSegmentAddTitle: 'Aggiungi segmento personalizzato',
                            customRecordAddTitle: 'Aggiungi record personalizzato',
                            recordTitle: 'Record personalizzato',
                            segmentRecordType: 'Vuoi aggiungere un segmento personalizzato o un record personalizzato?',
                            customSegmentNameTitle: 'Qual è il nome del segmento personalizzato?',
                            customRecordNameTitle: 'Qual è il nome del record personalizzato?',
                            customSegmentNameFooter: "Puoi trovare i nomi dei segmenti personalizzati in NetSuite nella pagina *Customizations > Links, Records & Fields > Custom Segments*.\n\n_Per istruzioni pi\u00F9 dettagliate, [visita il nostro sito di assistenza](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customRecordNameFooter: "Puoi trovare i nomi dei record personalizzati in NetSuite inserendo \"Transaction Column Field\" nella ricerca globale.\n\n_Per istruzioni pi\u00F9 dettagliate, [visita il nostro sito di assistenza](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customSegmentInternalIDTitle: "Qual è l'ID interno?",
                            customSegmentInternalIDFooter: "Prima di tutto, assicurati di aver abilitato gli ID interni in NetSuite sotto *Home > Set Preferences > Show Internal ID.*\n\nPuoi trovare gli ID interni dei segmenti personalizzati in NetSuite sotto:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Clicca su un segmento personalizzato.\n3. Clicca sul collegamento ipertestuale accanto a *Custom Record Type*.\n4. Trova l'ID interno nella tabella in fondo.\n\n_Per istruzioni pi\u00F9 dettagliate, [visita il nostro sito di aiuto](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")_."),
                            customRecordInternalIDFooter: "Puoi trovare gli ID interni dei record personalizzati in NetSuite seguendo questi passaggi:\n\n1. Inserisci \"Transaction Line Fields\" nella ricerca globale.\n2. Clicca su un record personalizzato.\n3. Trova l'ID interno sul lato sinistro.\n\n_Per istruzioni pi\u00F9 dettagliate, [visita il nostro sito di aiuto](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customSegmentScriptIDTitle: "Qual è l'ID dello script?",
                            customSegmentScriptIDFooter: "Puoi trovare gli ID script dei segmenti personalizzati in NetSuite sotto:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Clicca su un segmento personalizzato.\n3. Clicca sulla scheda *Application and Sourcing* vicino al fondo, poi:\n    a. Se vuoi visualizzare il segmento personalizzato come *tag* (a livello di voce) in Expensify, clicca sulla sotto-scheda *Transaction Columns* e usa il *Field ID*.\n    b. Se vuoi visualizzare il segmento personalizzato come *campo di report* (a livello di report) in Expensify, clicca sulla sotto-scheda *Transactions* e usa il *Field ID*.\n\n_Per istruzioni pi\u00F9 dettagliate, [visita il nostro sito di aiuto](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")_."),
                            customRecordScriptIDTitle: "Qual è l'ID della colonna della transazione?",
                            customRecordScriptIDFooter: "Puoi trovare gli ID script dei record personalizzati in NetSuite sotto:\n\n1. Inserisci \"Transaction Line Fields\" nella ricerca globale.\n2. Clicca su un record personalizzato.\n3. Trova l'ID script sul lato sinistro.\n\n_Per istruzioni pi\u00F9 dettagliate, [visita il nostro sito di aiuto](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customSegmentMappingTitle: 'Come dovrebbe essere visualizzato questo segmento personalizzato in Expensify?',
                            customRecordMappingTitle: 'Come dovrebbe essere visualizzato questo record personalizzato in Expensify?',
                        },
                        errors: {
                            uniqueFieldError: function (_a) {
                                var fieldName = _a.fieldName;
                                return "Un segmento/record personalizzato con questo ".concat(fieldName === null || fieldName === void 0 ? void 0 : fieldName.toLowerCase(), " esiste gi\u00E0");
                            },
                        },
                    },
                    customLists: {
                        title: 'Elenchi personalizzati',
                        addText: 'Aggiungi elenco personalizzato',
                        recordTitle: 'Elenco personalizzato',
                        helpLink: CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Visualizza istruzioni dettagliate',
                        helpText: 'su come configurare elenchi personalizzati.',
                        emptyTitle: 'Aggiungi un elenco personalizzato',
                        fields: {
                            listName: 'Nome',
                            internalID: 'ID interno',
                            transactionFieldID: 'ID campo transazione',
                            mapping: 'Visualizzato come',
                        },
                        removeTitle: 'Rimuovi elenco personalizzato',
                        removePrompt: 'Sei sicuro di voler rimuovere questa lista personalizzata?',
                        addForm: {
                            listNameTitle: 'Scegli un elenco personalizzato',
                            transactionFieldIDTitle: "Qual è l'ID del campo transazione?",
                            transactionFieldIDFooter: "Puoi trovare gli ID dei campi di transazione in NetSuite seguendo questi passaggi:\n\n1. Inserisci \"Transaction Line Fields\" nella ricerca globale.\n2. Clicca su una lista personalizzata.\n3. Trova l'ID del campo di transazione sul lato sinistro.\n\n_Per istruzioni pi\u00F9 dettagliate, [visita il nostro sito di assistenza](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")_."),
                            mappingTitle: 'Come dovrebbe essere visualizzato questo elenco personalizzato in Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: "Esiste gi\u00E0 un elenco personalizzato con questo ID campo transazione.",
                        },
                    },
                },
                importTypes: (_3 = {},
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT] = {
                        label: 'Impostazione predefinita dipendente NetSuite',
                        description: "Non importato in Expensify, applicato all'esportazione",
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "Se utilizzi ".concat(importField, " in NetSuite, applicheremo il valore predefinito impostato nel record del dipendente al momento dell'esportazione su Report Spese o Registrazione Contabile.");
                        },
                    },
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG] = {
                        label: 'Tag',
                        description: 'Livello voce di dettaglio',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "".concat((0, startCase_1.default)(importField), " sar\u00E0 selezionabile per ogni singola spesa nel report di un dipendente.");
                        },
                    },
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD] = {
                        label: 'Campi del rapporto',
                        description: 'Livello del report',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "".concat((0, startCase_1.default)(importField), " selezione verr\u00E0 applicata a tutte le spese nel rapporto di un dipendente.");
                        },
                    },
                    _3),
            },
        },
        intacct: {
            sageIntacctSetup: 'Configurazione di Sage Intacct',
            prerequisitesTitle: 'Prima di connetterti...',
            downloadExpensifyPackage: 'Scarica il pacchetto Expensify per Sage Intacct',
            followSteps: 'Segui i passaggi nelle nostre istruzioni How-to: Connect to Sage Intacct.',
            enterCredentials: 'Inserisci le tue credenziali Sage Intacct',
            entity: 'Entità',
            employeeDefault: 'Impostazione predefinita dipendente Sage Intacct',
            employeeDefaultDescription: 'Il dipartimento predefinito del dipendente verrà applicato alle sue spese in Sage Intacct, se esiste.',
            displayedAsTagDescription: 'Il dipartimento sarà selezionabile per ogni singola spesa nel rapporto di un dipendente.',
            displayedAsReportFieldDescription: 'La selezione del dipartimento verrà applicata a tutte le spese nel rapporto di un dipendente.',
            toggleImportTitleFirstPart: 'Scegli come gestire Sage Intacct',
            toggleImportTitleSecondPart: 'in Expensify.',
            expenseTypes: 'Tipi di spesa',
            expenseTypesDescription: 'I tuoi tipi di spesa Sage Intacct verranno importati in Expensify come categorie.',
            accountTypesDescription: 'Il tuo piano dei conti di Sage Intacct verrà importato in Expensify come categorie.',
            importTaxDescription: "Importa l'aliquota fiscale sugli acquisti da Sage Intacct.",
            userDefinedDimensions: "Dimensioni definite dall'utente",
            addUserDefinedDimension: "Aggiungi dimensione definita dall'utente",
            integrationName: "Nome dell'integrazione",
            dimensionExists: 'Una dimensione con questo nome esiste già.',
            removeDimension: "Rimuovi dimensione definita dall'utente",
            removeDimensionPrompt: "Sei sicuro di voler rimuovere questa dimensione definita dall'utente?",
            userDefinedDimension: "Dimensione definita dall'utente",
            addAUserDefinedDimension: "Aggiungi una dimensione definita dall'utente",
            detailedInstructionsLink: 'Visualizza istruzioni dettagliate',
            detailedInstructionsRestOfSentence: "sull'aggiunta di dimensioni definite dall'utente.",
            userDimensionsAdded: function () { return ({
                one: '1 UDD aggiunto',
                other: function (count) { return "".concat(count, " UDD aggiunti"); },
            }); },
            mappingTitle: function (_a) {
                var mappingName = _a.mappingName;
                switch (mappingName) {
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'dipartimenti';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'classi';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'località';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'clienti';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'progetti (lavori)';
                    default:
                        return 'mappature';
                }
            },
        },
        type: {
            free: 'Gratuito',
            control: 'Controllo',
            collect: 'Raccogliere',
        },
        companyCards: {
            addCards: 'Aggiungi carte',
            selectCards: 'Seleziona carte',
            addNewCard: {
                other: 'Altro',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard Commercial Cards',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Carte Stripe',
                },
                yourCardProvider: "Chi \u00E8 il tuo fornitore di carte?",
                whoIsYourBankAccount: 'Qual è la tua banca?',
                whereIsYourBankLocated: 'Dove si trova la tua banca?',
                howDoYouWantToConnect: 'Come vuoi connetterti alla tua banca?',
                learnMoreAboutOptions: {
                    text: 'Scopri di più su questi',
                    linkText: 'opzioni.',
                },
                commercialFeedDetails: 'Richiede la configurazione con la tua banca. Questo è tipicamente utilizzato da aziende più grandi ed è spesso la migliore opzione se si è idonei.',
                commercialFeedPlaidDetails: "Richiede la configurazione con la tua banca, ma ti guideremo noi. Questo \u00E8 generalmente limitato alle aziende pi\u00F9 grandi.",
                directFeedDetails: "L'approccio più semplice. Connettiti subito utilizzando le tue credenziali master. Questo metodo è il più comune.",
                enableFeed: {
                    title: function (_a) {
                        var provider = _a.provider;
                        return "Abilita il tuo feed ".concat(provider);
                    },
                    heading: "Abbiamo un'integrazione diretta con l'emittente della tua carta e possiamo importare i tuoi dati di transazione in Expensify in modo rapido e preciso.\n\nPer iniziare, semplicemente:",
                    visa: "Abbiamo integrazioni globali con Visa, anche se l'idoneità varia a seconda della banca e del programma della carta.\n\nPer iniziare, semplicemente:",
                    mastercard: "Abbiamo integrazioni globali con Mastercard, sebbene l'idoneità vari a seconda della banca e del programma della carta.\n\nPer iniziare, semplicemente:",
                    vcf: "1. Visita [questo articolo di aiuto](".concat(CONST_1.default.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP, ") per istruzioni dettagliate su come configurare le tue Visa Commercial Cards.\n\n2. [Contatta la tua banca](").concat(CONST_1.default.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP, ") per verificare che supportino un feed commerciale per il tuo programma e chiedi loro di abilitarlo.\n\n3. *Una volta che il feed \u00E8 abilitato e hai i suoi dettagli, continua alla schermata successiva.*"),
                    gl1025: "1. Visita [questo articolo di aiuto](".concat(CONST_1.default.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP, ") per scoprire se American Express pu\u00F2 abilitare un feed commerciale per il tuo programma.\n\n2. Una volta abilitato il feed, Amex ti invier\u00E0 una lettera di produzione.\n\n3. *Una volta che hai le informazioni sul feed, continua alla schermata successiva.*"),
                    cdf: "1. Visita [questo articolo di aiuto](".concat(CONST_1.default.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS, ") per istruzioni dettagliate su come configurare le tue Mastercard Commercial Cards.\n\n2. [Contatta la tua banca](").concat(CONST_1.default.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS, ") per verificare che supportino un feed commerciale per il tuo programma e chiedi loro di abilitarlo.\n\n3. *Una volta che il feed \u00E8 abilitato e hai i suoi dettagli, continua alla schermata successiva.*"),
                    stripe: "1. Visita il Dashboard di Stripe e vai su [Impostazioni](".concat(CONST_1.default.COMPANY_CARDS_STRIPE_HELP, ").\n\n2. Sotto Integrazioni di Prodotto, clicca su Abilita accanto a Expensify.\n\n3. Una volta abilitato il feed, clicca su Invia qui sotto e ci occuperemo di aggiungerlo."),
                },
                whatBankIssuesCard: 'Quale banca emette queste carte?',
                enterNameOfBank: 'Inserisci il nome della banca',
                feedDetails: {
                    vcf: {
                        title: 'Quali sono i dettagli del feed Visa?',
                        processorLabel: 'ID processore',
                        bankLabel: "ID dell'istituzione finanziaria (banca)",
                        companyLabel: 'ID azienda',
                        helpLabel: 'Dove trovo questi ID?',
                    },
                    gl1025: {
                        title: "Qual \u00E8 il nome del file di consegna Amex?",
                        fileNameLabel: 'Nome del file di consegna',
                        helpLabel: 'Dove trovo il nome del file di consegna?',
                    },
                    cdf: {
                        title: "Qual \u00E8 l'ID di distribuzione Mastercard?",
                        distributionLabel: 'ID di distribuzione',
                        helpLabel: "Dove trovo l'ID di distribuzione?",
                    },
                },
                amexCorporate: 'Seleziona questo se sul fronte delle tue carte è scritto "Corporate"',
                amexBusiness: 'Seleziona questo se sul fronte delle tue carte c\'è scritto "Business"',
                amexPersonal: 'Seleziona questo se le tue carte sono personali',
                error: {
                    pleaseSelectProvider: 'Si prega di selezionare un fornitore di carte prima di continuare',
                    pleaseSelectBankAccount: 'Si prega di selezionare un conto bancario prima di continuare',
                    pleaseSelectBank: 'Si prega di selezionare una banca prima di continuare',
                    pleaseSelectCountry: 'Si prega di selezionare un paese prima di continuare',
                    pleaseSelectFeedType: 'Si prega di selezionare un tipo di feed prima di continuare',
                },
            },
            statementCloseDate: (_4 = {},
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH] = 'Ultimo giorno del mese',
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH] = 'Ultimo giorno lavorativo del mese',
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH] = 'Giorno del mese personalizzato',
                _4),
            assignCard: 'Assegna carta',
            findCard: 'Trova carta',
            cardNumber: 'Numero di carta',
            commercialFeed: 'Feed commerciale',
            feedName: function (_a) {
                var feedName = _a.feedName;
                return "Carte ".concat(feedName);
            },
            directFeed: 'Feed diretto',
            whoNeedsCardAssigned: 'Chi ha bisogno di una carta assegnata?',
            chooseCard: 'Scegli una carta',
            chooseCardFor: function (_a) {
                var assignee = _a.assignee, feed = _a.feed;
                return "Scegli una carta per ".concat(assignee, " dal feed delle carte ").concat(feed, ".");
            },
            noActiveCards: 'Nessuna carta attiva in questo feed',
            somethingMightBeBroken: 'Oppure qualcosa potrebbe essere rotto. In ogni caso, se hai domande, basta',
            contactConcierge: 'contatta Concierge',
            chooseTransactionStartDate: 'Scegli una data di inizio transazione',
            startDateDescription: 'Importeremo tutte le transazioni da questa data in poi. Se non viene specificata alcuna data, risaliremo indietro fino a quanto consentito dalla tua banca.',
            fromTheBeginning: "Dall'inizio",
            customStartDate: 'Data di inizio personalizzata',
            customCloseDate: 'Data di chiusura personalizzata',
            letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
            confirmationDescription: 'Inizieremo immediatamente a importare le transazioni.',
            cardholder: 'Titolare della carta',
            card: 'Carta',
            cardName: 'Nome della carta',
            brokenConnectionErrorFirstPart: "La connessione del feed della carta \u00E8 interrotta. Per favore",
            brokenConnectionErrorLink: 'accedi al tuo conto bancario',
            brokenConnectionErrorSecondPart: 'così possiamo ristabilire la connessione.',
            assignedCard: function (_a) {
                var assignee = _a.assignee, link = _a.link;
                return "assegnato ".concat(assignee, " un ").concat(link, "! Le transazioni importate appariranno in questa chat.");
            },
            companyCard: 'carta aziendale',
            chooseCardFeed: 'Scegli il feed della carta',
            ukRegulation: "Expensify, Inc. è un agente di Plaid Financial Ltd., un'istituzione di pagamento autorizzata regolata dalla Financial Conduct Authority ai sensi delle Payment Services Regulations 2017 (Numero di riferimento aziendale: 804718). Plaid ti fornisce servizi di informazione sui conti regolamentati tramite Expensify Limited come suo agente.",
        },
        expensifyCard: {
            issueAndManageCards: 'Emetti e gestisci le tue carte Expensify',
            getStartedIssuing: 'Inizia emettendo la tua prima carta virtuale o fisica.',
            verificationInProgress: 'Verifica in corso...',
            verifyingTheDetails: 'Stiamo verificando alcuni dettagli. Concierge ti farà sapere quando le Expensify Card saranno pronte per essere emesse.',
            disclaimer: 'La Expensify Visa® Commercial Card è emessa da The Bancorp Bank, N.A., Membro FDIC, in base a una licenza di Visa U.S.A. Inc. e potrebbe non essere accettata da tutti i commercianti che accettano carte Visa. Apple® e il logo Apple® sono marchi di Apple Inc., registrati negli Stati Uniti e in altri paesi. App Store è un marchio di servizio di Apple Inc. Google Play e il logo di Google Play sono marchi di Google LLC.',
            issueCard: 'Emetti carta',
            findCard: 'Trova carta',
            newCard: 'Nuova carta',
            name: 'Nome',
            lastFour: 'Ultimi 4',
            limit: 'Limite',
            currentBalance: 'Saldo attuale',
            currentBalanceDescription: "Il saldo attuale è la somma di tutte le transazioni con la carta Expensify registrate che sono avvenute dalla data dell'ultimo saldo.",
            balanceWillBeSettledOn: function (_a) {
                var settlementDate = _a.settlementDate;
                return "Il saldo sar\u00E0 regolato il ".concat(settlementDate);
            },
            settleBalance: 'Regola il saldo',
            cardLimit: 'Limite della carta',
            remainingLimit: 'Limite rimanente',
            requestLimitIncrease: 'Richiesta aumento limite',
            remainingLimitDescription: 'Consideriamo diversi fattori quando calcoliamo il tuo limite rimanente: la tua anzianità come cliente, le informazioni aziendali fornite durante la registrazione e la liquidità disponibile nel conto bancario della tua azienda. Il tuo limite rimanente può variare su base giornaliera.',
            earnedCashback: 'Rimborso',
            earnedCashbackDescription: 'Il saldo del cashback si basa sulla spesa mensile regolata con la Expensify Card nel tuo spazio di lavoro.',
            issueNewCard: 'Emetti nuova carta',
            finishSetup: 'Completa la configurazione',
            chooseBankAccount: 'Scegli conto bancario',
            chooseExistingBank: 'Scegli un conto bancario aziendale esistente per pagare il saldo della tua Expensify Card, oppure aggiungi un nuovo conto bancario',
            accountEndingIn: 'Account con terminazione in',
            addNewBankAccount: 'Aggiungi un nuovo conto bancario',
            settlementAccount: 'Conto di regolamento',
            settlementAccountDescription: 'Scegli un account per pagare il saldo della tua Expensify Card.',
            settlementAccountInfoPt1: 'Assicurati che questo account corrisponda al tuo',
            settlementAccountInfoPt2: 'quindi il Riconciliazione Continua funziona correttamente.',
            reconciliationAccount: 'Conto di riconciliazione',
            settlementFrequency: 'Frequenza di liquidazione',
            settlementFrequencyDescription: 'Scegli la frequenza con cui pagherai il saldo della tua Expensify Card.',
            settlementFrequencyInfo: 'Se desideri passare al regolamento mensile, dovrai collegare il tuo conto bancario tramite Plaid e avere uno storico del saldo positivo di 90 giorni.',
            frequency: {
                daily: 'Quotidiano',
                monthly: 'Mensile',
            },
            cardDetails: 'Dettagli della carta',
            virtual: 'Virtuale',
            physical: 'Fisico',
            deactivate: 'Disattiva carta',
            changeCardLimit: 'Cambia il limite della carta',
            changeLimit: 'Cambia limite',
            smartLimitWarning: function (_a) {
                var limit = _a.limit;
                return "Se cambi il limite di questa carta a ".concat(limit, ", le nuove transazioni verranno rifiutate finch\u00E9 non approvi ulteriori spese sulla carta.");
            },
            monthlyLimitWarning: function (_a) {
                var limit = _a.limit;
                return "Se cambi il limite di questa carta a ".concat(limit, ", le nuove transazioni verranno rifiutate fino al mese prossimo.");
            },
            fixedLimitWarning: function (_a) {
                var limit = _a.limit;
                return "Se cambi il limite di questa carta a ".concat(limit, ", le nuove transazioni verranno rifiutate.");
            },
            changeCardLimitType: 'Cambia il tipo di limite della carta',
            changeLimitType: 'Cambia tipo di limite',
            changeCardSmartLimitTypeWarning: function (_a) {
                var limit = _a.limit;
                return "Se cambi il tipo di limite di questa carta a Limite Intelligente, le nuove transazioni verranno rifiutate perch\u00E9 il limite non approvato di ".concat(limit, " \u00E8 gi\u00E0 stato raggiunto.");
            },
            changeCardMonthlyLimitTypeWarning: function (_a) {
                var limit = _a.limit;
                return "Se cambi il tipo di limite di questa carta a Mensile, le nuove transazioni verranno rifiutate perch\u00E9 il limite mensile di ".concat(limit, " \u00E8 gi\u00E0 stato raggiunto.");
            },
            addShippingDetails: 'Aggiungi dettagli di spedizione',
            issuedCard: function (_a) {
                var assignee = _a.assignee;
                return "ha emesso a ".concat(assignee, " una Expensify Card! La carta arriver\u00E0 in 2-3 giorni lavorativi.");
            },
            issuedCardNoShippingDetails: function (_a) {
                var assignee = _a.assignee;
                return "ha emesso una Expensify Card per ".concat(assignee, "! La carta verr\u00E0 spedita una volta aggiunti i dettagli di spedizione.");
            },
            issuedCardVirtual: function (_a) {
                var assignee = _a.assignee, link = _a.link;
                return "ha emesso ".concat(assignee, " una ").concat(link, " virtuale! La carta pu\u00F2 essere utilizzata immediatamente.");
            },
            addedShippingDetails: function (_a) {
                var assignee = _a.assignee;
                return "".concat(assignee, " ha aggiunto i dettagli di spedizione. La carta Expensify arriver\u00E0 in 2-3 giorni lavorativi.");
            },
            verifyingHeader: 'Verifica in corso',
            bankAccountVerifiedHeader: 'Conto bancario verificato',
            verifyingBankAccount: 'Verifica del conto bancario in corso...',
            verifyingBankAccountDescription: 'Attendere mentre confermiamo che questo account possa essere utilizzato per emettere le carte Expensify.',
            bankAccountVerified: 'Conto bancario verificato!',
            bankAccountVerifiedDescription: 'Ora puoi emettere le Expensify Card ai membri del tuo spazio di lavoro.',
            oneMoreStep: 'Un altro passo...',
            oneMoreStepDescription: 'Sembra che dobbiamo verificare manualmente il tuo conto bancario. Per favore, vai su Concierge dove le tue istruzioni ti stanno aspettando.',
            gotIt: 'Capito',
            goToConcierge: 'Vai a Concierge',
        },
        categories: {
            deleteCategories: 'Elimina categorie',
            deleteCategoriesPrompt: 'Sei sicuro di voler eliminare queste categorie?',
            deleteCategory: 'Elimina categoria',
            deleteCategoryPrompt: 'Sei sicuro di voler eliminare questa categoria?',
            disableCategories: 'Disabilita categorie',
            disableCategory: 'Disabilita categoria',
            enableCategories: 'Abilita categorie',
            enableCategory: 'Abilita categoria',
            defaultSpendCategories: 'Categorie di spesa predefinite',
            spendCategoriesDescription: 'Personalizza come viene categorizzata la spesa del commerciante per le transazioni con carta di credito e le ricevute scansionate.',
            deleteFailureMessage: "Si è verificato un errore durante l'eliminazione della categoria, per favore riprova.",
            categoryName: 'Nome della categoria',
            requiresCategory: 'I membri devono categorizzare tutte le spese',
            needCategoryForExportToIntegration: function (_a) {
                var connectionName = _a.connectionName;
                return "Tutte le spese devono essere categorizzate per poter essere esportate su ".concat(connectionName, ".");
            },
            subtitle: 'Ottieni una panoramica migliore di dove vengono spesi i soldi. Usa le nostre categorie predefinite o aggiungi le tue.',
            emptyCategories: {
                title: 'Non hai creato nessuna categoria',
                subtitle: 'Aggiungi una categoria per organizzare le tue spese.',
            },
            emptyCategoriesWithAccounting: {
                subtitle1: 'Le tue categorie sono attualmente in fase di importazione da una connessione contabile. Vai su',
                subtitle2: 'contabilità',
                subtitle3: 'per apportare qualsiasi modifica.',
            },
            updateFailureMessage: "Si è verificato un errore durante l'aggiornamento della categoria, riprova.",
            createFailureMessage: 'Si è verificato un errore durante la creazione della categoria, per favore riprova.',
            addCategory: 'Aggiungi categoria',
            editCategory: 'Modifica categoria',
            editCategories: 'Modifica categorie',
            findCategory: 'Trova categoria',
            categoryRequiredError: 'Il nome della categoria è obbligatorio',
            existingCategoryError: 'Una categoria con questo nome esiste già',
            invalidCategoryName: 'Nome categoria non valido',
            importedFromAccountingSoftware: 'Le categorie sottostanti sono importate dal tuo',
            payrollCode: 'Codice busta paga',
            updatePayrollCodeFailureMessage: "Si è verificato un errore durante l'aggiornamento del codice delle buste paga, riprova.",
            glCode: 'Codice GL',
            updateGLCodeFailureMessage: "Si è verificato un errore durante l'aggiornamento del codice GL, riprova.",
            importCategories: 'Importa categorie',
            cannotDeleteOrDisableAllCategories: {
                title: 'Non è possibile eliminare o disabilitare tutte le categorie',
                description: "Almeno una categoria deve rimanere abilitata perch\u00E9 il tuo spazio di lavoro richiede categorie.",
            },
        },
        moreFeatures: {
            subtitle: 'Usa i toggle qui sotto per abilitare più funzionalità man mano che cresci. Ogni funzionalità apparirà nel menu di navigazione per ulteriori personalizzazioni.',
            spendSection: {
                title: 'Spendere',
                subtitle: 'Abilita la funzionalità che ti aiuta a far crescere il tuo team.',
            },
            manageSection: {
                title: 'Gestisci',
                subtitle: 'Aggiungi controlli che aiutano a mantenere le spese entro il budget.',
            },
            earnSection: {
                title: 'Guadagna',
                subtitle: 'Ottimizza i tuoi ricavi e ricevi pagamenti più velocemente.',
            },
            organizeSection: {
                title: 'Organizza',
                subtitle: 'Raggruppa e analizza le spese, registra ogni tassa pagata.',
            },
            integrateSection: {
                title: 'Integrare',
                subtitle: 'Connetti Expensify ai prodotti finanziari più popolari.',
            },
            distanceRates: {
                title: 'Tariffe a distanza',
                subtitle: 'Aggiungi, aggiorna e applica le tariffe.',
            },
            perDiem: {
                title: 'Per diem',
                subtitle: 'Imposta le tariffe diarie per controllare le spese giornaliere dei dipendenti.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Ottieni informazioni e controllo sulle spese.',
                disableCardTitle: 'Disabilita Expensify Card',
                disableCardPrompt: 'Non puoi disabilitare la Expensify Card perché è già in uso. Contatta Concierge per i prossimi passi.',
                disableCardButton: 'Chatta con Concierge',
                feed: {
                    title: 'Ottieni la Expensify Card',
                    subTitle: 'Ottimizza le spese aziendali e risparmia fino al 50% sulla tua fattura Expensify, inoltre:',
                    features: {
                        cashBack: 'Cashback su ogni acquisto negli Stati Uniti',
                        unlimited: 'Carte virtuali illimitate',
                        spend: 'Controlli di spesa e limiti personalizzati',
                    },
                    ctaTitle: 'Emetti nuova carta',
                },
            },
            companyCards: {
                title: 'Carte aziendali',
                subtitle: 'Importa le spese dalle carte aziendali esistenti.',
                feed: {
                    title: 'Importa carte aziendali',
                    features: {
                        support: 'Supporto per tutti i principali fornitori di carte',
                        assignCards: "Assegna le carte all'intero team",
                        automaticImport: 'Importazione automatica delle transazioni',
                    },
                },
                disableCardTitle: 'Disabilita carte aziendali',
                disableCardPrompt: 'Non puoi disabilitare le carte aziendali perché questa funzione è in uso. Contatta il Concierge per i prossimi passi.',
                disableCardButton: 'Chatta con Concierge',
                cardDetails: 'Dettagli della carta',
                cardNumber: 'Numero di carta',
                cardholder: 'Titolare della carta',
                cardName: 'Nome della carta',
                integrationExport: function (_a) {
                    var integration = _a.integration, type = _a.type;
                    return integration && type ? "".concat(integration, " ").concat(type.toLowerCase(), " esportazione") : "Esportazione ".concat(integration);
                },
                integrationExportTitleFirstPart: function (_a) {
                    var integration = _a.integration;
                    return "Scegli l'account ".concat(integration, " in cui esportare le transazioni.");
                },
                integrationExportTitlePart: 'Seleziona un diverso',
                integrationExportTitleLinkPart: 'opzione di esportazione',
                integrationExportTitleSecondPart: 'per cambiare gli account disponibili.',
                lastUpdated: 'Ultimo aggiornamento',
                transactionStartDate: 'Data di inizio transazione',
                updateCard: 'Aggiorna carta',
                unassignCard: 'Rimuovi assegnazione carta',
                unassign: 'Rimuovi assegnazione',
                unassignCardDescription: "Rimuovere l'assegnazione di questa carta eliminerà tutte le transazioni sui rapporti in bozza dall'account del titolare della carta.",
                assignCard: 'Assegna carta',
                cardFeedName: 'Nome del feed della carta',
                cardFeedNameDescription: 'Dai al feed della carta un nome unico in modo da poterlo distinguere dagli altri.',
                cardFeedTransaction: 'Elimina transazioni',
                cardFeedTransactionDescription: 'Scegli se i titolari di carta possono eliminare le transazioni con carta. Le nuove transazioni seguiranno queste regole.',
                cardFeedRestrictDeletingTransaction: "Limita l'eliminazione delle transazioni",
                cardFeedAllowDeletingTransaction: "Consenti l'eliminazione delle transazioni",
                removeCardFeed: 'Rimuovi feed della carta',
                removeCardFeedTitle: function (_a) {
                    var feedName = _a.feedName;
                    return "Rimuovi feed ".concat(feedName);
                },
                removeCardFeedDescription: 'Sei sicuro di voler rimuovere questo feed di carte? Questo disassegnerà tutte le carte.',
                error: {
                    feedNameRequired: 'Il nome del feed della carta è obbligatorio',
                    statementCloseDateRequired: "Selezionare una data di chiusura dell'estratto conto.",
                },
                corporate: "Limita l'eliminazione delle transazioni",
                personal: "Consenti l'eliminazione delle transazioni",
                setFeedNameDescription: 'Dai al feed della carta un nome univoco in modo da poterlo distinguere dagli altri',
                setTransactionLiabilityDescription: 'Quando abilitato, i titolari di carta possono eliminare le transazioni della carta. Le nuove transazioni seguiranno questa regola.',
                emptyAddedFeedTitle: 'Assegna carte aziendali',
                emptyAddedFeedDescription: 'Inizia assegnando la tua prima carta a un membro.',
                pendingFeedTitle: "Stiamo esaminando la tua richiesta...",
                pendingFeedDescription: "Attualmente stiamo esaminando i dettagli del tuo feed. Una volta completato, ti contatteremo tramite",
                pendingBankTitle: 'Controlla la finestra del tuo browser',
                pendingBankDescription: function (_a) {
                    var bankName = _a.bankName;
                    return "Si prega di connettersi a ".concat(bankName, " tramite la finestra del browser che si \u00E8 appena aperta. Se non si \u00E8 aperta,");
                },
                pendingBankLink: 'per favore clicca qui',
                giveItNameInstruction: 'Dai alla carta un nome che la distingua dalle altre.',
                updating: 'Aggiornamento in corso...',
                noAccountsFound: 'Nessun account trovato',
                defaultCard: 'Carta predefinita',
                downgradeTitle: "Impossibile effettuare il downgrade dello spazio di lavoro",
                downgradeSubTitleFirstPart: "Questo workspace non pu\u00F2 essere declassato perch\u00E9 sono collegati pi\u00F9 flussi di carte (escludendo le carte Expensify). Per favore",
                downgradeSubTitleMiddlePart: "mantieni solo un feed di carte",
                downgradeSubTitleLastPart: 'per procedere.',
                noAccountsFoundDescription: function (_a) {
                    var connection = _a.connection;
                    return "Per favore, aggiungi l'account in ".concat(connection, " e sincronizza nuovamente la connessione.");
                },
                expensifyCardBannerTitle: 'Ottieni la Expensify Card',
                expensifyCardBannerSubtitle: 'Goditi il cashback su ogni acquisto negli Stati Uniti, fino al 50% di sconto sulla tua fattura Expensify, carte virtuali illimitate e molto altro ancora.',
                expensifyCardBannerLearnMoreButton: 'Scopri di più',
                statementCloseDateTitle: "Data di chiusura dell'estratto conto",
                statementCloseDateDescription: "Comunicateci la data di chiusura dell'estratto conto della vostra carta e creeremo un estratto conto corrispondente in Expensify.",
            },
            workflows: {
                title: 'Flussi di lavoro',
                subtitle: 'Configura come viene approvata e pagata la spesa.',
                disableApprovalPrompt: "Le carte Expensify di questo spazio di lavoro attualmente si basano sull'approvazione per definire i loro limiti intelligenti. Si prega di modificare i tipi di limiti di qualsiasi carta Expensify con limiti intelligenti prima di disabilitare le approvazioni.",
            },
            invoices: {
                title: 'Fatture',
                subtitle: 'Invia e ricevi fatture.',
            },
            categories: {
                title: 'Categorie',
                subtitle: 'Traccia e organizza le spese.',
            },
            tags: {
                title: 'Tag',
                subtitle: 'Classifica i costi e tieni traccia delle spese fatturabili.',
            },
            taxes: {
                title: 'Tasse',
                subtitle: 'Documenta e recupera le tasse ammissibili.',
            },
            reportFields: {
                title: 'Campi del rapporto',
                subtitle: 'Configura campi personalizzati per le spese.',
            },
            connections: {
                title: 'Contabilità',
                subtitle: 'Sincronizza il tuo piano dei conti e altro ancora.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Non così in fretta...',
                featureEnabledText: 'Per abilitare o disabilitare questa funzione, dovrai modificare le impostazioni di importazione contabile.',
                disconnectText: 'Per disabilitare la contabilità, dovrai disconnettere la tua connessione contabile dal tuo spazio di lavoro.',
                manageSettings: 'Gestisci impostazioni',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Non così in fretta...',
                featureEnabledText: 'Le carte Expensify in questo spazio di lavoro si basano su flussi di approvazione per definire i loro Limiti Intelligenti.\n\nSi prega di modificare i tipi di limite di qualsiasi carta con Limiti Intelligenti prima di disabilitare i flussi di lavoro.',
                confirmText: 'Vai a Expensify Cards',
            },
            rules: {
                title: 'Regole',
                subtitle: 'Richiedi ricevute, segnala spese elevate e altro ancora.',
            },
        },
        reportFields: {
            addField: 'Aggiungi campo',
            delete: 'Elimina campo',
            deleteFields: 'Elimina campi',
            findReportField: 'Trova campo del report',
            deleteConfirmation: 'Sei sicuro di voler eliminare questo campo del report?',
            deleteFieldsConfirmation: 'Sei sicuro di voler eliminare questi campi del report?',
            emptyReportFields: {
                title: 'Non hai creato alcun campo di report',
                subtitle: 'Aggiungi un campo personalizzato (testo, data o menu a discesa) che appare nei report.',
            },
            subtitle: 'I campi del report si applicano a tutte le spese e possono essere utili quando si desidera richiedere informazioni aggiuntive.',
            disableReportFields: 'Disabilita i campi del report',
            disableReportFieldsConfirmation: 'Sei sicuro? I campi di testo e data verranno eliminati e le liste verranno disabilitate.',
            importedFromAccountingSoftware: 'I campi del report sottostanti sono importati dal tuo',
            textType: 'Testo',
            dateType: 'Data',
            dropdownType: 'Elenco',
            textAlternateText: "Aggiungi un campo per l'inserimento di testo libero.",
            dateAlternateText: 'Aggiungi un calendario per la selezione delle date.',
            dropdownAlternateText: 'Aggiungi un elenco di opzioni tra cui scegliere.',
            nameInputSubtitle: 'Scegli un nome per il campo del rapporto.',
            typeInputSubtitle: 'Scegli quale tipo di campo del report utilizzare.',
            initialValueInputSubtitle: 'Inserisci un valore iniziale da mostrare nel campo del report.',
            listValuesInputSubtitle: 'Questi valori appariranno nel menu a discesa del campo del tuo report. I valori abilitati possono essere selezionati dai membri.',
            listInputSubtitle: "Questi valori appariranno nell'elenco dei campi del tuo report. I valori abilitati possono essere selezionati dai membri.",
            deleteValue: 'Elimina valore',
            deleteValues: 'Elimina valori',
            disableValue: 'Disabilita valore',
            disableValues: 'Disabilita valori',
            enableValue: 'Abilita valore',
            enableValues: 'Abilita valori',
            emptyReportFieldsValues: {
                title: 'Non hai creato alcun valore di elenco',
                subtitle: 'Aggiungi valori personalizzati da visualizzare nei report.',
            },
            deleteValuePrompt: "Sei sicuro di voler eliminare questo valore dall'elenco?",
            deleteValuesPrompt: 'Sei sicuro di voler eliminare questi valori dalla lista?',
            listValueRequiredError: "Per favore inserisci un nome per il valore dell'elenco",
            existingListValueError: 'Un valore di elenco con questo nome esiste già',
            editValue: 'Modifica valore',
            listValues: 'Elenca i valori',
            addValue: 'Aggiungi valore',
            existingReportFieldNameError: 'Un campo del report con questo nome esiste già',
            reportFieldNameRequiredError: 'Inserisci un nome per il campo del report',
            reportFieldTypeRequiredError: 'Si prega di scegliere un tipo di campo del report',
            reportFieldInitialValueRequiredError: 'Si prega di scegliere un valore iniziale per il campo del report',
            genericFailureMessage: "Si è verificato un errore durante l'aggiornamento del campo del report. Per favore riprova.",
        },
        tags: {
            tagName: 'Nome tag',
            requiresTag: 'I membri devono etichettare tutte le spese',
            trackBillable: 'Traccia le spese fatturabili',
            customTagName: 'Nome tag personalizzato',
            enableTag: 'Abilita tag',
            enableTags: 'Abilita tag',
            requireTag: 'Require tag',
            requireTags: 'Tag obbligatori',
            notRequireTags: 'Non richiedere',
            disableTag: 'Disabilita tag',
            disableTags: 'Disabilita tag',
            addTag: 'Aggiungi tag',
            editTag: 'Modifica tag',
            editTags: 'Modifica tag',
            findTag: 'Trova tag',
            subtitle: 'I tag aggiungono modi più dettagliati per classificare i costi.',
            dependentMultiLevelTagsSubtitle: {
                phrase1: 'Stai usando',
                phrase2: 'tag dipendenti',
                phrase3: 'Puoi',
                phrase4: 'reimporta un foglio di calcolo',
                phrase5: 'aggiornare i tuoi tag.',
            },
            emptyTags: {
                title: 'Non hai creato alcun tag',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Aggiungi un tag per tracciare progetti, sedi, reparti e altro.',
                subtitle1: 'Importa un foglio di calcolo per aggiungere tag per il monitoraggio di progetti, sedi, dipartimenti e altro.',
                subtitle2: 'Scopri di più',
                subtitle3: 'about formatting tag files.',
            },
            emptyTagsWithAccounting: {
                subtitle1: 'I tuoi tag sono attualmente in fase di importazione da una connessione contabile. Vai su',
                subtitle2: 'contabilità',
                subtitle3: 'per apportare qualsiasi modifica.',
            },
            deleteTag: 'Elimina tag',
            deleteTags: 'Elimina tag',
            deleteTagConfirmation: 'Sei sicuro di voler eliminare questo tag?',
            deleteTagsConfirmation: 'Sei sicuro di voler eliminare questi tag?',
            deleteFailureMessage: "Si è verificato un errore durante l'eliminazione del tag, riprova.",
            tagRequiredError: 'Il nome del tag è obbligatorio',
            existingTagError: 'Un tag con questo nome esiste già',
            invalidTagNameError: 'Il nome del tag non può essere 0. Si prega di scegliere un valore diverso.',
            genericFailureMessage: "Si è verificato un errore durante l'aggiornamento del tag, riprova.",
            importedFromAccountingSoftware: 'I tag qui sotto sono importati dal tuo',
            glCode: 'Codice GL',
            updateGLCodeFailureMessage: "Si è verificato un errore durante l'aggiornamento del codice GL, riprova.",
            tagRules: 'Regole dei tag',
            approverDescription: 'Approvante',
            importTags: 'Importa tag',
            importTagsSupportingText: 'Codifica le tue spese con un tipo di etichetta o molte.',
            configureMultiLevelTags: 'Configura il tuo elenco di tag per la classificazione multi-livello.',
            importMultiLevelTagsSupportingText: "Ecco un'anteprima dei tuoi tag. Se tutto sembra a posto, clicca qui sotto per importarli.",
            importMultiLevelTags: {
                firstRowTitle: 'La prima riga è il titolo per ogni elenco di tag',
                independentTags: 'Questi sono tag indipendenti',
                glAdjacentColumn: "C'è un codice GL nella colonna adiacente",
            },
            tagLevel: {
                singleLevel: 'Singolo livello di tag',
                multiLevel: 'Tag multi-livello',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Cambia i livelli dei tag',
                prompt1: 'Cambiare i livelli dei tag cancellerà tutti i tag attuali.',
                prompt2: 'Ti suggeriamo prima di',
                prompt3: 'scarica un backup',
                prompt4: 'esportando i tuoi tag.',
                prompt5: 'Scopri di più',
                prompt6: 'about tag levels.',
            },
            importedTagsMessage: function (_a) {
                var columnCounts = _a.columnCounts;
                return "Abbiamo trovato *".concat(columnCounts, " colonne* nel tuo foglio di calcolo. Seleziona *Nome* accanto alla colonna che contiene i nomi dei tag. Puoi anche selezionare *Abilitato* accanto alla colonna che imposta lo stato dei tag.");
            },
            cannotDeleteOrDisableAllTags: {
                title: 'Impossibile eliminare o disabilitare tutti i tag',
                description: "Almeno un tag deve rimanere abilitato perch\u00E9 il tuo spazio di lavoro richiede tag.",
            },
            cannotMakeAllTagsOptional: {
                title: 'Impossibile rendere tutti i tag opzionali',
                description: "Almeno un tag deve rimanere obbligatorio perch\u00E9 le impostazioni del tuo spazio di lavoro richiedono tag.",
            },
            tagCount: function () { return ({
                one: '1 giorno',
                other: function (count) { return "".concat(count, " Tag"); },
            }); },
        },
        taxes: {
            subtitle: 'Aggiungi nomi delle tasse, aliquote e imposta predefiniti.',
            addRate: 'Aggiungi tariffa',
            workspaceDefault: 'Valuta predefinita del workspace',
            foreignDefault: 'Valuta estera predefinita',
            customTaxName: 'Nome tassa personalizzato',
            value: 'Valore',
            taxReclaimableOn: 'Imposta recuperabile su',
            taxRate: 'Aliquota fiscale',
            findTaxRate: "Trova l'aliquota fiscale",
            error: {
                taxRateAlreadyExists: 'Questo nome fiscale è già in uso',
                taxCodeAlreadyExists: 'Questo codice fiscale è già in uso',
                valuePercentageRange: 'Si prega di inserire una percentuale valida tra 0 e 100',
                customNameRequired: 'È richiesto un nome personalizzato per la tassa',
                deleteFailureMessage: "Si è verificato un errore durante l'eliminazione dell'aliquota fiscale. Riprova o chiedi aiuto a Concierge.",
                updateFailureMessage: "Si è verificato un errore durante l'aggiornamento dell'aliquota fiscale. Riprova o chiedi aiuto a Concierge.",
                createFailureMessage: "Si è verificato un errore durante la creazione dell'aliquota fiscale. Riprova o chiedi aiuto a Concierge.",
                updateTaxClaimableFailureMessage: "La parte recuperabile deve essere inferiore all'importo della tariffa di distanza.",
            },
            deleteTaxConfirmation: 'Sei sicuro di voler eliminare questa tassa?',
            deleteMultipleTaxConfirmation: function (_a) {
                var taxAmount = _a.taxAmount;
                return "Sei sicuro di voler eliminare le tasse di ".concat(taxAmount, "?");
            },
            actions: {
                delete: 'Elimina tariffa',
                deleteMultiple: 'Elimina tariffe',
                enable: 'Abilita tariffa',
                disable: 'Disabilita tariffa',
                enableTaxRates: function () { return ({
                    one: 'Abilita tariffa',
                    other: 'Abilita tariffe',
                }); },
                disableTaxRates: function () { return ({
                    one: 'Disabilita tariffa',
                    other: 'Disabilita tariffe',
                }); },
            },
            importedFromAccountingSoftware: 'Le tasse sottostanti sono importate dal tuo',
            taxCode: 'Codice fiscale',
            updateTaxCodeFailureMessage: "Si è verificato un errore durante l'aggiornamento del codice fiscale, riprova.",
        },
        emptyWorkspace: {
            title: "Crea un'area di lavoro",
            subtitle: 'Crea uno spazio di lavoro per tracciare le ricevute, rimborsare le spese, gestire i viaggi, inviare fatture e altro ancora, tutto alla velocità della chat.',
            createAWorkspaceCTA: 'Inizia',
            features: {
                trackAndCollect: 'Traccia e raccogli ricevute',
                reimbursements: 'Rimborsare i dipendenti',
                companyCards: 'Gestisci carte aziendali',
            },
            notFound: 'Nessun workspace trovato',
            description: 'Le stanze sono un ottimo posto per discutere e lavorare con più persone. Per iniziare a collaborare, crea o unisciti a un workspace.',
        },
        new: {
            newWorkspace: 'Nuovo spazio di lavoro',
            getTheExpensifyCardAndMore: 'Ottieni la Expensify Card e altro ancora',
            confirmWorkspace: 'Conferma Workspace',
            myGroupWorkspace: function (_a) {
                var workspaceNumber = _a.workspaceNumber;
                return "Il mio spazio di lavoro di gruppo".concat(workspaceNumber ? " ".concat(workspaceNumber) : '');
            },
            workspaceName: function (_a) {
                var userName = _a.userName, workspaceNumber = _a.workspaceNumber;
                return "Spazio di lavoro di ".concat(userName).concat(workspaceNumber ? " ".concat(workspaceNumber) : '');
            },
        },
        people: {
            genericFailureMessage: 'Si è verificato un errore durante la rimozione di un membro dallo spazio di lavoro, per favore riprova.',
            removeMembersPrompt: function (_a) {
                var memberName = _a.memberName;
                return ({
                    one: "Sei sicuro di voler rimuovere ".concat(memberName, "?"),
                    other: 'Sei sicuro di voler rimuovere questi membri?',
                });
            },
            removeMembersWarningPrompt: function (_a) {
                var memberName = _a.memberName, ownerName = _a.ownerName;
                return "".concat(memberName, " \u00E8 un approvatore in questo spazio di lavoro. Quando smetti di condividere questo spazio di lavoro con loro, li sostituiremo nel flusso di approvazione con il proprietario dello spazio di lavoro, ").concat(ownerName);
            },
            removeMembersTitle: function () { return ({
                one: 'Rimuovi membro',
                other: 'Rimuovi membri',
            }); },
            findMember: 'Trova membro',
            removeWorkspaceMemberButtonTitle: "Rimuovi dall'area di lavoro",
            removeGroupMemberButtonTitle: 'Rimuovi dal gruppo',
            removeRoomMemberButtonTitle: 'Rimuovi dalla chat',
            removeMemberPrompt: function (_a) {
                var memberName = _a.memberName;
                return "Sei sicuro di voler rimuovere ".concat(memberName, "?");
            },
            removeMemberTitle: 'Rimuovi membro',
            transferOwner: 'Trasferisci proprietario',
            makeMember: 'Rendi membro',
            makeAdmin: 'Rendi amministratore',
            makeAuditor: 'Crea revisore contabile',
            selectAll: 'Seleziona tutto',
            error: {
                genericAdd: "Si è verificato un problema nell'aggiungere questo membro dello spazio di lavoro",
                cannotRemove: 'Non puoi rimuovere te stesso o il proprietario dello spazio di lavoro',
                genericRemove: 'Si è verificato un problema durante la rimozione di quel membro del workspace',
            },
            addedWithPrimary: 'Alcuni membri sono stati aggiunti con i loro accessi principali.',
            invitedBySecondaryLogin: function (_a) {
                var secondaryLogin = _a.secondaryLogin;
                return "Aggiunto da login secondario ".concat(secondaryLogin, ".");
            },
            membersListTitle: 'Directory di tutti i membri del workspace.',
            importMembers: 'Importa membri',
        },
        card: {
            getStartedIssuing: 'Inizia emettendo la tua prima carta virtuale o fisica.',
            issueCard: 'Emetti carta',
            issueNewCard: {
                whoNeedsCard: 'Chi ha bisogno di una carta?',
                findMember: 'Trova membro',
                chooseCardType: 'Scegli un tipo di carta',
                physicalCard: 'Carta fisica',
                physicalCardDescription: 'Ottimo per chi spende frequentemente',
                virtualCard: 'Carta virtuale',
                virtualCardDescription: 'Istantaneo e flessibile',
                chooseLimitType: 'Scegli un tipo di limite',
                smartLimit: 'Limite Intelligente',
                smartLimitDescription: "Spendere fino a un certo importo prima di richiedere l'approvazione",
                monthly: 'Mensile',
                monthlyDescription: 'Spendere fino a un certo importo al mese',
                fixedAmount: 'Importo fisso',
                fixedAmountDescription: 'Spendere fino a un certo importo una volta sola',
                setLimit: 'Imposta un limite',
                cardLimitError: 'Inserisci un importo inferiore a $21,474,836',
                giveItName: 'Dagli un nome',
                giveItNameInstruction: "Rendila abbastanza unica da distinguerla dalle altre carte. Casi d'uso specifici sono ancora meglio!",
                cardName: 'Nome della carta',
                letsDoubleCheck: 'Verifichiamo che tutto sia corretto.',
                willBeReady: 'Questa carta sarà pronta per essere utilizzata immediatamente.',
                cardholder: 'Titolare della carta',
                cardType: 'Tipo di carta',
                limit: 'Limite',
                limitType: 'Tipo di limite',
                name: 'Nome',
            },
            deactivateCardModal: {
                deactivate: 'Disattiva',
                deactivateCard: 'Disattiva carta',
                deactivateConfirmation: 'Disattivare questa carta rifiuterà tutte le transazioni future e non potrà essere annullato.',
            },
        },
        accounting: {
            settings: 'impostazioni',
            title: 'Connessioni',
            subtitle: 'Connettiti al tuo sistema contabile per codificare le transazioni con il tuo piano dei conti, abbinare automaticamente i pagamenti e mantenere le tue finanze sincronizzate.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chatta con il tuo specialista di configurazione.',
            talkYourAccountManager: 'Chatta con il tuo account manager.',
            talkToConcierge: 'Chatta con Concierge.',
            needAnotherAccounting: 'Hai bisogno di un altro software di contabilità?',
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
            errorODIntegration: "C'è un errore con una connessione che è stata impostata in Expensify Classic.",
            goToODToFix: 'Vai su Expensify Classic per risolvere questo problema.',
            goToODToSettings: 'Vai su Expensify Classic per gestire le tue impostazioni.',
            setup: 'Connetti',
            lastSync: function (_a) {
                var relativeDate = _a.relativeDate;
                return "Ultima sincronizzazione ".concat(relativeDate);
            },
            notSync: 'Non sincronizzato',
            import: 'Importa',
            export: 'Esporta',
            advanced: 'Avanzato',
            other: 'Altro',
            syncNow: 'Sincronizza ora',
            disconnect: 'Disconnetti',
            reinstall: 'Reinstalla connettore',
            disconnectTitle: function (_a) {
                var _b = _a === void 0 ? {} : _a, connectionName = _b.connectionName;
                var integrationName = connectionName && CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integrazione';
                return "Disconnetti ".concat(integrationName);
            },
            connectTitle: function (_a) {
                var _b;
                var connectionName = _a.connectionName;
                return "Connetti ".concat((_b = CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]) !== null && _b !== void 0 ? _b : 'integrazione contabile');
            },
            syncError: function (_a) {
                var connectionName = _a.connectionName;
                switch (connectionName) {
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Impossibile connettersi a QuickBooks Online';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Impossibile connettersi a Xero';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Impossibile connettersi a NetSuite';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Impossibile connettersi a QuickBooks Desktop';
                    default: {
                        return "Impossibile connettersi all'integrazione";
                    }
                }
            },
            accounts: 'Piano dei conti',
            taxes: 'Tasse',
            imported: 'Importato',
            notImported: 'Non importato',
            importAsCategory: 'Importato come categorie',
            importTypes: (_5 = {},
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED] = 'Importato',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG] = 'Importato come tag',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT] = 'Importato',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED] = 'Non importato',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE] = 'Non importato',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD] = 'Importato come campi del report',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT] = 'Impostazione predefinita dipendente NetSuite',
                _5),
            disconnectPrompt: function (_a) {
                var _b = _a === void 0 ? {} : _a, connectionName = _b.connectionName;
                var integrationName = connectionName && CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'questa integrazione';
                return "Sei sicuro di voler disconnettere ".concat(integrationName, "?");
            },
            connectPrompt: function (_a) {
                var _b;
                var connectionName = _a.connectionName;
                return "Sei sicuro di voler connettere ".concat((_b = CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]) !== null && _b !== void 0 ? _b : 'questa integrazione contabile', "? Questo rimuover\u00E0 tutte le connessioni contabili esistenti.");
            },
            enterCredentials: 'Inserisci le tue credenziali',
            connections: {
                syncStageName: function (_a) {
                    var stage = _a.stage;
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Importazione dei clienti';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Importazione dipendenti';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Importazione degli account';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importazione delle classi';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importazione di località';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Elaborazione dei dati importati';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Sincronizzazione dei report rimborsati e dei pagamenti delle fatture';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importazione dei codici fiscali';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Verifica connessione QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importazione dei dati di QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importazione dei dati Xero';
                        case 'startingImportQBO':
                            return 'Importazione dei dati di QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importazione dei dati di QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return "Titolo dell'importazione";
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importazione certificato di approvazione';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importazione delle dimensioni';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importazione della politica di salvataggio';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Ancora in fase di sincronizzazione dei dati con QuickBooks... Assicurati che il Web Connector sia in esecuzione';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Sincronizzazione dei dati di QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Caricamento dei dati';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Aggiornamento delle categorie';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Aggiornamento clienti/progetti';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return "Aggiornamento dell'elenco delle persone";
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Aggiornamento dei campi del report';
                        case 'jobDone':
                            return 'In attesa che i dati importati vengano caricati';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Sincronizzazione del piano dei conti';
                        case 'xeroSyncImportCategories':
                            return 'Sincronizzazione delle categorie';
                        case 'xeroSyncImportCustomers':
                            return 'Sincronizzazione dei clienti';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Contrassegnare i report di Expensify come rimborsati';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Contrassegnare le fatture e le ricevute di Xero come pagate';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Sincronizzazione delle categorie di tracciamento';
                        case 'xeroSyncImportBankAccounts':
                            return 'Sincronizzazione dei conti bancari';
                        case 'xeroSyncImportTaxRates':
                            return 'Sincronizzazione delle aliquote fiscali';
                        case 'xeroCheckConnection':
                            return 'Verifica connessione Xero';
                        case 'xeroSyncTitle':
                            return 'Sincronizzazione dei dati Xero';
                        case 'netSuiteSyncConnection':
                            return 'Inizializzazione della connessione a NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importazione dei clienti';
                        case 'netSuiteSyncInitData':
                            return 'Recupero dati da NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importazione delle tasse';
                        case 'netSuiteSyncImportItems':
                            return 'Importazione degli articoli';
                        case 'netSuiteSyncData':
                            return 'Importazione dei dati in Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Sincronizzazione degli account';
                        case 'netSuiteSyncCurrencies':
                            return 'Sincronizzazione delle valute';
                        case 'netSuiteSyncCategories':
                            return 'Sincronizzazione delle categorie';
                        case 'netSuiteSyncReportFields':
                            return 'Importazione dei dati come campi del report di Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importazione dei dati come tag di Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Aggiornamento delle informazioni di connessione';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Contrassegnare i report di Expensify come rimborsati';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Contrassegnare le fatture e le bollette di NetSuite come pagate';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importazione fornitori';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importazione di elenchi personalizzati';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importazione di elenchi personalizzati';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importazione di filiali';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importazione fornitori';
                        case 'intacctCheckConnection':
                            return 'Verifica connessione Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Importazione delle dimensioni di Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Importazione dei dati Sage Intacct';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return "Traduzione mancante per la fase: ".concat(stage);
                        }
                    }
                },
            },
            preferredExporter: 'Esportatore preferito',
            exportPreferredExporterNote: "L'esportatore preferito può essere qualsiasi amministratore dello spazio di lavoro, ma deve anche essere un amministratore di dominio se imposti conti di esportazione diversi per singole carte aziendali nelle impostazioni del dominio.",
            exportPreferredExporterSubNote: "Una volta impostato, l'esportatore preferito vedrà i report per l'esportazione nel proprio account.",
            exportAs: 'Esporta come',
            exportOutOfPocket: 'Esporta le spese anticipate come',
            exportCompanyCard: 'Esporta le spese della carta aziendale come',
            exportDate: 'Data di esportazione',
            defaultVendor: 'Fornitore predefinito',
            autoSync: 'Sincronizzazione automatica',
            autoSyncDescription: 'Sincronizza automaticamente NetSuite ed Expensify ogni giorno. Esporta il report finalizzato in tempo reale.',
            reimbursedReports: 'Sincronizza i rapporti rimborsati',
            cardReconciliation: 'Riconciliazione della carta',
            reconciliationAccount: 'Conto di riconciliazione',
            continuousReconciliation: 'Riconciliazione Continua',
            saveHoursOnReconciliation: 'Risparmia ore di riconciliazione ogni periodo contabile facendo riconciliare continuamente a Expensify gli estratti conto e i regolamenti della Expensify Card per tuo conto.',
            enableContinuousReconciliation: 'Per abilitare la Riconciliazione Continua, si prega di abilitare',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Scegli il conto bancario su cui verranno riconciliati i pagamenti della tua carta Expensify.',
                accountMatches: 'Assicurati che questo account corrisponda al tuo',
                settlementAccount: 'Conto di regolamento della carta Expensify',
                reconciliationWorks: function (_a) {
                    var lastFourPAN = _a.lastFourPAN;
                    return "(termine con ".concat(lastFourPAN, ") affinch\u00E9 la Riconciliazione Continua funzioni correttamente.");
                },
            },
        },
        export: {
            notReadyHeading: "Non pronto per l'esportazione",
            notReadyDescription: 'I rapporti di spesa in bozza o in sospeso non possono essere esportati nel sistema contabile. Si prega di approvare o pagare queste spese prima di esportarle.',
        },
        invoices: {
            sendInvoice: 'Invia fattura',
            sendFrom: 'Invia da',
            invoicingDetails: 'Dettagli di fatturazione',
            invoicingDetailsDescription: 'Queste informazioni appariranno sulle tue fatture.',
            companyName: "Nome dell'azienda",
            companyWebsite: "Sito web dell'azienda",
            paymentMethods: {
                personal: 'Personale',
                business: 'Business',
                chooseInvoiceMethod: 'Scegli un metodo di pagamento qui sotto:',
                addBankAccount: 'Aggiungi conto bancario',
                payingAsIndividual: 'Pagare come individuo',
                payingAsBusiness: "Pagare come un'azienda",
            },
            invoiceBalance: 'Saldo fattura',
            invoiceBalanceSubtitle: 'Questo è il tuo saldo attuale derivante dalla riscossione dei pagamenti delle fatture. Verrà trasferito automaticamente sul tuo conto bancario se ne hai aggiunto uno.',
            bankAccountsSubtitle: 'Aggiungi un conto bancario per effettuare e ricevere pagamenti delle fatture.',
        },
        invite: {
            member: 'Invita membro',
            members: 'Invita membri',
            invitePeople: 'Invita nuovi membri',
            genericFailureMessage: "Si è verificato un errore durante l'invito del membro allo spazio di lavoro. Per favore, riprova.",
            pleaseEnterValidLogin: "Assicurati che l'email o il numero di telefono siano validi (ad es. ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")."),
            user: 'utente',
            users: 'utenti',
            invited: 'invitato',
            removed: 'rimosso',
            to: 'a',
            from: 'da',
        },
        inviteMessage: {
            confirmDetails: 'Conferma i dettagli',
            inviteMessagePrompt: 'Rendi il tuo invito ancora più speciale aggiungendo un messaggio qui sotto!',
            personalMessagePrompt: 'Messaggio',
            genericFailureMessage: "Si è verificato un errore durante l'invito del membro allo spazio di lavoro. Per favore, riprova.",
            inviteNoMembersError: 'Seleziona almeno un membro da invitare',
            joinRequest: function (_a) {
                var user = _a.user, workspaceName = _a.workspaceName;
                return "".concat(user, " ha richiesto di unirsi a ").concat(workspaceName);
            },
        },
        distanceRates: {
            oopsNotSoFast: 'Ops! Non così in fretta...',
            workspaceNeeds: 'Un workspace necessita di almeno una tariffa di distanza abilitata.',
            distance: 'Distanza',
            centrallyManage: 'Gestisci centralmente le tariffe, traccia in miglia o chilometri e imposta una categoria predefinita.',
            rate: 'Valuta',
            addRate: 'Aggiungi tariffa',
            findRate: 'Trova tariffa',
            trackTax: 'Traccia imposta',
            deleteRates: function () { return ({
                one: 'Elimina tariffa',
                other: 'Elimina tariffe',
            }); },
            enableRates: function () { return ({
                one: 'Abilita tariffa',
                other: 'Abilita tariffe',
            }); },
            disableRates: function () { return ({
                one: 'Disabilita tariffa',
                other: 'Disabilita tariffe',
            }); },
            enableRate: 'Abilita tariffa',
            status: 'Stato',
            unit: 'Unit',
            taxFeatureNotEnabledMessage: 'Le tasse devono essere abilitate nello spazio di lavoro per utilizzare questa funzione. Vai su',
            changePromptMessage: 'per apportare quella modifica.',
            deleteDistanceRate: 'Elimina tariffa distanza',
            areYouSureDelete: function () { return ({
                one: 'Sei sicuro di voler eliminare questa tariffa?',
                other: 'Sei sicuro di voler eliminare queste tariffe?',
            }); },
        },
        editor: {
            descriptionInputLabel: 'Descrizione',
            nameInputLabel: 'Nome',
            typeInputLabel: 'Tipo',
            initialValueInputLabel: 'Valore iniziale',
            nameInputHelpText: 'Questo è il nome che vedrai nel tuo spazio di lavoro.',
            nameIsRequiredError: 'Dovrai dare un nome al tuo spazio di lavoro',
            currencyInputLabel: 'Valuta predefinita',
            currencyInputHelpText: 'Tutte le spese in questo spazio di lavoro saranno convertite in questa valuta.',
            currencyInputDisabledText: function (_a) {
                var currency = _a.currency;
                return "La valuta predefinita non pu\u00F2 essere modificata perch\u00E9 questo spazio di lavoro \u00E8 collegato a un conto bancario in ".concat(currency, ".");
            },
            save: 'Salva',
            genericFailureMessage: "Si è verificato un errore durante l'aggiornamento dello spazio di lavoro. Per favore riprova.",
            avatarUploadFailureMessage: "Si è verificato un errore durante il caricamento dell'avatar. Per favore riprova.",
            addressContext: 'È necessario un indirizzo Workspace per abilitare Expensify Travel. Si prega di inserire un indirizzo associato alla tua attività.',
        },
        bankAccount: {
            continueWithSetup: 'Continua configurazione',
            youAreAlmostDone: 'Hai quasi finito di configurare il tuo conto bancario, il che ti permetterà di emettere carte aziendali, rimborsare spese, riscuotere fatture e pagare bollette.',
            streamlinePayments: 'Ottimizza i pagamenti',
            connectBankAccountNote: 'Nota: I conti bancari personali non possono essere utilizzati per i pagamenti negli spazi di lavoro.',
            oneMoreThing: "Un'altra cosa!",
            allSet: 'Tutto pronto!',
            accountDescriptionWithCards: 'Questo conto bancario sarà utilizzato per emettere carte aziendali, rimborsare spese, riscuotere fatture e pagare bollette.',
            letsFinishInChat: 'Finisciamo in chat!',
            finishInChat: 'Termina in chat',
            almostDone: 'Quasi finito!',
            disconnectBankAccount: 'Disconnetti conto bancario',
            startOver: 'Ricomincia',
            updateDetails: 'Aggiorna dettagli',
            yesDisconnectMyBankAccount: 'Sì, disconnetti il mio conto bancario',
            yesStartOver: 'Sì, ricomincia',
            disconnectYour: 'Disconnetti il tuo',
            bankAccountAnyTransactions: 'conto bancario. Qualsiasi transazione in sospeso per questo conto verrà comunque completata.',
            clearProgress: 'Ricominciando si cancellerà il progresso che hai fatto finora.',
            areYouSure: 'Sei sicuro?',
            workspaceCurrency: 'Valuta del workspace',
            updateCurrencyPrompt: 'Sembra che il tuo spazio di lavoro sia attualmente impostato su una valuta diversa da USD. Clicca il pulsante qui sotto per aggiornare la tua valuta a USD ora.',
            updateToUSD: 'Aggiorna a USD',
            updateWorkspaceCurrency: 'Aggiorna la valuta dello spazio di lavoro',
            workspaceCurrencyNotSupported: "Valuta dell'area di lavoro non supportata",
            yourWorkspace: 'La tua area di lavoro è impostata su una valuta non supportata. Visualizza il',
            listOfSupportedCurrencies: 'elenco delle valute supportate',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Trasferisci proprietario',
            addPaymentCardTitle: 'Inserisci la tua carta di pagamento per trasferire la proprietà',
            addPaymentCardButtonText: 'Accetta i termini e aggiungi una carta di pagamento',
            addPaymentCardReadAndAcceptTextPart1: 'Leggi e accetta',
            addPaymentCardReadAndAcceptTextPart2: 'politica per aggiungere la tua carta',
            addPaymentCardTerms: 'termini',
            addPaymentCardPrivacy: 'privacy',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'Conforme a PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Crittografia a livello bancario',
            addPaymentCardRedundant: 'Infrastruttura ridondante',
            addPaymentCardLearnMore: 'Scopri di più sui nostri',
            addPaymentCardSecurity: 'sicurezza',
            amountOwedTitle: 'Saldo in sospeso',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Questo account ha un saldo in sospeso da un mese precedente.\n\nVuoi saldare il saldo e assumere la gestione della fatturazione di questo spazio di lavoro?',
            ownerOwesAmountTitle: 'Saldo in sospeso',
            ownerOwesAmountButtonText: 'Trasferisci saldo',
            ownerOwesAmountText: function (_a) {
                var email = _a.email, amount = _a.amount;
                return "L'account che possiede questo workspace (".concat(email, ") ha un saldo in sospeso da un mese precedente.\n\nVuoi trasferire questo importo (").concat(amount, ") per assumere la fatturazione di questo workspace? La tua carta di pagamento verr\u00E0 addebitata immediatamente.");
            },
            subscriptionTitle: "Assumere l'abbonamento annuale",
            subscriptionButtonText: 'Trasferisci abbonamento',
            subscriptionText: function (_a) {
                var usersCount = _a.usersCount, finalCount = _a.finalCount;
                return "Assumere il controllo di questo spazio di lavoro unir\u00E0 il suo abbonamento annuale con il tuo abbonamento attuale. Questo aumenter\u00E0 la dimensione del tuo abbonamento di ".concat(usersCount, " membri, portando la nuova dimensione dell'abbonamento a ").concat(finalCount, ". Vuoi continuare?");
            },
            duplicateSubscriptionTitle: 'Avviso di abbonamento duplicato',
            duplicateSubscriptionButtonText: 'Continua',
            duplicateSubscriptionText: function (_a) {
                var email = _a.email, workspaceName = _a.workspaceName;
                return "Sembra che tu stia cercando di assumere la gestione della fatturazione per gli spazi di lavoro di ".concat(email, ", ma per farlo devi prima essere un amministratore di tutti i loro spazi di lavoro.\n\nClicca su \"Continua\" se vuoi solo assumere la gestione della fatturazione per lo spazio di lavoro ").concat(workspaceName, ".\n\nSe desideri assumere la gestione della fatturazione per l'intero abbonamento, chiedi loro di aggiungerti come amministratore a tutti i loro spazi di lavoro prima di prendere in carico la fatturazione.");
            },
            hasFailedSettlementsTitle: 'Impossibile trasferire la proprietà',
            hasFailedSettlementsButtonText: 'Capito',
            hasFailedSettlementsText: function (_a) {
                var email = _a.email;
                return "Non puoi assumere la gestione della fatturazione perch\u00E9 ".concat(email, " ha un saldo scaduto della Expensify Card. Per favore chiedi loro di contattare concierge@expensify.com per risolvere il problema. Successivamente, potrai assumere la gestione della fatturazione per questo workspace.");
            },
            failedToClearBalanceTitle: 'Impossibile azzerare il saldo',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Non siamo riusciti a saldare il saldo. Per favore riprova più tardi.',
            successTitle: 'Woohoo! Tutto pronto.',
            successDescription: 'Ora sei il proprietario di questo spazio di lavoro.',
            errorTitle: 'Ops! Non così in fretta...',
            errorDescriptionPartOne: 'Si è verificato un problema nel trasferimento della proprietà di questo spazio di lavoro. Riprova, oppure',
            errorDescriptionPartTwo: 'contatta Concierge',
            errorDescriptionPartThree: 'per assistenza.',
        },
        exportAgainModal: {
            title: 'Attento!',
            description: function (_a) {
                var reportName = _a.reportName, connectionName = _a.connectionName;
                return "I seguenti report sono gi\u00E0 stati esportati su ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], ":\n\n").concat(reportName, "\n\nSei sicuro di volerli esportare di nuovo?");
            },
            confirmText: 'Sì, esporta di nuovo',
            cancelText: 'Annulla',
        },
        upgrade: (_6 = {
                reportFields: {
                    title: 'Campi del rapporto',
                    description: "I campi del report ti permettono di specificare dettagli a livello di intestazione, distinti dai tag che si riferiscono alle spese su singoli articoli. Questi dettagli possono includere nomi di progetti specifici, informazioni sui viaggi di lavoro, localit\u00E0 e altro ancora.",
                    onlyAvailableOnPlan: 'I campi del report sono disponibili solo nel piano Control, a partire da',
                }
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE] = {
                title: 'NetSuite',
                description: "Goditi la sincronizzazione automatica e riduci le immissioni manuali con l'integrazione Expensify + NetSuite. Ottieni approfondimenti finanziari dettagliati e in tempo reale con il supporto di segmenti nativi e personalizzati, inclusa la mappatura di progetti e clienti.",
                onlyAvailableOnPlan: 'La nostra integrazione con NetSuite è disponibile solo con il piano Control, a partire da',
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT] = {
                title: 'Sage Intacct',
                description: "Goditi la sincronizzazione automatica e riduci le immissioni manuali con l'integrazione Expensify + Sage Intacct. Ottieni approfondimenti finanziari in tempo reale con dimensioni definite dall'utente, oltre alla codifica delle spese per dipartimento, classe, posizione, cliente e progetto (lavoro).",
                onlyAvailableOnPlan: 'La nostra integrazione con Sage Intacct è disponibile solo nel piano Control, a partire da',
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
                title: 'QuickBooks Desktop',
                description: "Goditi la sincronizzazione automatica e riduci le immissioni manuali con l'integrazione Expensify + QuickBooks Desktop. Ottieni la massima efficienza con una connessione bidirezionale in tempo reale e la codifica delle spese per classe, articolo, cliente e progetto.",
                onlyAvailableOnPlan: 'La nostra integrazione con QuickBooks Desktop è disponibile solo con il piano Control, a partire da',
            },
            _6[CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id] = {
                title: 'Approvazioni Avanzate',
                description: "Se desideri aggiungere pi\u00F9 livelli di approvazione al processo \u2013 o semplicemente assicurarti che le spese pi\u00F9 grandi ricevano un ulteriore controllo \u2013 ti abbiamo coperto. Le approvazioni avanzate ti aiutano a mettere in atto i controlli giusti a ogni livello, in modo da mantenere sotto controllo le spese del tuo team.",
                onlyAvailableOnPlan: 'Le approvazioni avanzate sono disponibili solo nel piano Control, che parte da',
            },
            _6.categories = {
                title: 'Categorie',
                description: "Le categorie ti aiutano a organizzare meglio le spese per tenere traccia di dove stai spendendo i tuoi soldi. Usa la nostra lista di categorie suggerite o crea le tue.",
                onlyAvailableOnPlan: 'Le categorie sono disponibili nel piano Collect, a partire da',
            },
            _6.glCodes = {
                title: 'Codici GL',
                description: "Aggiungi codici GL alle tue categorie e tag per esportare facilmente le spese nei tuoi sistemi di contabilit\u00E0 e gestione stipendi.",
                onlyAvailableOnPlan: 'I codici GL sono disponibili solo nel piano Control, a partire da',
            },
            _6.glAndPayrollCodes = {
                title: 'Codici GL e Payroll',
                description: "Aggiungi codici GL e Payroll alle tue categorie per esportare facilmente le spese nei tuoi sistemi contabili e di gestione stipendi.",
                onlyAvailableOnPlan: 'I codici GL e Payroll sono disponibili solo nel piano Control, a partire da',
            },
            _6.taxCodes = {
                title: 'Codici fiscali',
                description: "Aggiungi i codici fiscali alle tue tasse per esportare facilmente le spese nei tuoi sistemi di contabilit\u00E0 e paghe.",
                onlyAvailableOnPlan: 'I codici fiscali sono disponibili solo nel piano Control, a partire da',
            },
            _6.companyCards = {
                title: 'Carte aziendali illimitate',
                description: "Hai bisogno di aggiungere pi\u00F9 feed di carte? Sblocca carte aziendali illimitate per sincronizzare le transazioni da tutti i principali emittenti di carte.",
                onlyAvailableOnPlan: 'Questo è disponibile solo nel piano Control, a partire da',
            },
            _6.rules = {
                title: 'Regole',
                description: "Le regole funzionano in background e tengono sotto controllo le tue spese, cos\u00EC non devi preoccuparti delle piccole cose.\n\nRichiedi dettagli delle spese come ricevute e descrizioni, imposta limiti e predefiniti, e automatizza approvazioni e pagamenti, tutto in un unico posto.",
                onlyAvailableOnPlan: 'Le regole sono disponibili solo nel piano Control, a partire da',
            },
            _6.perDiem = {
                title: 'Per diem',
                description: 'Il "per diem" è un ottimo modo per mantenere i costi giornalieri conformi e prevedibili ogni volta che i tuoi dipendenti viaggiano. Goditi funzionalità come tariffe personalizzate, categorie predefinite e dettagli più granulari come destinazioni e sottotariffe.',
                onlyAvailableOnPlan: 'I diari sono disponibili solo nel piano Control, a partire da',
            },
            _6.travel = {
                title: 'Viaggio',
                description: 'Expensify Travel è una nuova piattaforma aziendale per la prenotazione e la gestione dei viaggi che consente ai membri di prenotare alloggi, voli, trasporti e altro.',
                onlyAvailableOnPlan: 'Il viaggio è disponibile nel piano Collect, a partire da',
            },
            _6.multiLevelTags = {
                title: 'Tag multi-livello',
                description: 'I tag multilivello ti aiutano a monitorare le spese con maggiore precisione. Assegna più tag a ciascuna voce, come reparto, cliente o centro di costo, per catturare il contesto completo di ogni spesa. Questo consente report più dettagliati, flussi di lavoro di approvazione ed esportazioni contabili.',
                onlyAvailableOnPlan: 'I tag multilivello sono disponibili solo nel piano Control, a partire da',
            },
            _6.pricing = {
                perActiveMember: 'per membro attivo al mese.',
                perMember: 'per membro al mese.',
            },
            _6.note = {
                upgradeWorkspace: 'Aggiorna il tuo spazio di lavoro per accedere a questa funzione, oppure',
                learnMore: 'scopri di più',
                aboutOurPlans: 'informazioni sui nostri piani e prezzi.',
            },
            _6.upgradeToUnlock = 'Sblocca questa funzione',
            _6.completed = {
                headline: "Hai aggiornato il tuo spazio di lavoro!",
                successMessage: function (_a) {
                    var policyName = _a.policyName;
                    return "Hai aggiornato con successo ".concat(policyName, " al piano Control!");
                },
                categorizeMessage: "Hai effettuato con successo l'upgrade a un workspace con il piano Collect. Ora puoi categorizzare le tue spese!",
                travelMessage: "Hai eseguito con successo l'upgrade a un workspace con il piano Collect. Ora puoi iniziare a prenotare e gestire i viaggi!",
                viewSubscription: 'Visualizza il tuo abbonamento',
                moreDetails: 'per maggiori dettagli.',
                gotIt: 'Ricevuto, grazie',
            },
            _6.commonFeatures = {
                title: 'Passa al piano Control',
                note: 'Sblocca le nostre funzionalità più potenti, tra cui:',
                benefits: {
                    startsAt: 'Il piano Control parte da',
                    perMember: 'per membro attivo al mese.',
                    learnMore: 'Scopri di più',
                    pricing: 'informazioni sui nostri piani e prezzi.',
                    benefit1: 'Connessioni contabili avanzate (NetSuite, Sage Intacct e altro)',
                    benefit2: 'Regole intelligenti per le spese',
                    benefit3: 'Flussi di lavoro di approvazione multilivello',
                    benefit4: 'Controlli di sicurezza avanzati',
                    toUpgrade: 'Per aggiornare, fai clic',
                    selectWorkspace: 'seleziona uno spazio di lavoro e cambia il tipo di piano in',
                },
            },
            _6),
        downgrade: {
            commonFeatures: {
                title: 'Effettua il downgrade al piano Collect',
                note: "Se effettui il downgrade, perderai l'accesso a queste funzionalità e altro ancora:",
                benefits: {
                    note: "Per un confronto completo dei nostri piani, dai un'occhiata al nostro",
                    pricingPage: 'pagina dei prezzi',
                    confirm: 'Sei sicuro di voler effettuare il downgrade e rimuovere le tue configurazioni?',
                    warning: 'Questo non può essere annullato.',
                    benefit1: 'Connessioni contabili (eccetto QuickBooks Online e Xero)',
                    benefit2: 'Regole intelligenti per le spese',
                    benefit3: 'Flussi di lavoro di approvazione multilivello',
                    benefit4: 'Controlli di sicurezza avanzati',
                    headsUp: 'Attenzione!',
                    multiWorkspaceNote: 'Dovrai eseguire il downgrade di tutti i tuoi spazi di lavoro prima del tuo primo pagamento mensile per iniziare un abbonamento al tasso Collect. Clicca',
                    selectStep: '> seleziona ogni spazio di lavoro > cambia il tipo di piano in',
                },
            },
            completed: {
                headline: 'Il tuo spazio di lavoro è stato declassato',
                description: 'Hai altri spazi di lavoro nel piano Control. Per essere fatturato al tasso Collect, devi eseguire il downgrade di tutti gli spazi di lavoro.',
                gotIt: 'Ricevuto, grazie',
            },
        },
        payAndDowngrade: {
            title: 'Paga e declassa',
            headline: 'Il tuo pagamento finale',
            description1: 'La tua fattura finale per questo abbonamento sarà',
            description2: function (_a) {
                var date = _a.date;
                return "Vedi il tuo dettaglio qui sotto per ".concat(date, ":");
            },
            subscription: 'Attenzione! Questa azione terminerà il tuo abbonamento a Expensify, eliminerà questo spazio di lavoro e rimuoverà tutti i membri dello spazio di lavoro. Se desideri mantenere questo spazio di lavoro e rimuovere solo te stesso, fai in modo che un altro amministratore si occupi prima della fatturazione.',
            genericFailureMessage: 'Si è verificato un errore durante il pagamento della tua fattura. Per favore riprova.',
        },
        restrictedAction: {
            restricted: 'Restricted',
            actionsAreCurrentlyRestricted: function (_a) {
                var workspaceName = _a.workspaceName;
                return "Le azioni nello spazio di lavoro ".concat(workspaceName, " sono attualmente limitate");
            },
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: function (_a) {
                var workspaceOwnerName = _a.workspaceOwnerName;
                return "Il proprietario dello spazio di lavoro, ".concat(workspaceOwnerName, ", dovr\u00E0 aggiungere o aggiornare la carta di pagamento registrata per sbloccare la nuova attivit\u00E0 dello spazio di lavoro.");
            },
            youWillNeedToAddOrUpdatePaymentCard: 'Dovrai aggiungere o aggiornare la carta di pagamento registrata per sbloccare la nuova attività dello spazio di lavoro.',
            addPaymentCardToUnlock: 'Aggiungi una carta di pagamento per sbloccare!',
            addPaymentCardToContinueUsingWorkspace: 'Aggiungi una carta di pagamento per continuare a utilizzare questo spazio di lavoro',
            pleaseReachOutToYourWorkspaceAdmin: "Si prega di contattare l'amministratore del proprio spazio di lavoro per qualsiasi domanda.",
            chatWithYourAdmin: 'Chatta con il tuo amministratore',
            chatInAdmins: 'Chatta in #admins',
            addPaymentCard: 'Aggiungi carta di pagamento',
        },
        rules: {
            individualExpenseRules: {
                title: 'Spese',
                subtitle: 'Imposta controlli di spesa e predefiniti per le singole spese. Puoi anche creare regole per',
                receiptRequiredAmount: 'Importo richiesto della ricevuta',
                receiptRequiredAmountDescription: 'Richiedi ricevute quando la spesa supera questo importo, a meno che non sia derogato da una regola di categoria.',
                maxExpenseAmount: 'Importo massimo spesa',
                maxExpenseAmountDescription: 'Contrassegna la spesa che supera questo importo, a meno che non sia sostituita da una regola di categoria.',
                maxAge: 'Età massima',
                maxExpenseAge: 'Età massima della spesa',
                maxExpenseAgeDescription: 'Contrassegna le spese più vecchie di un determinato numero di giorni.',
                maxExpenseAgeDays: function () { return ({
                    one: '1 giorno',
                    other: function (count) { return "".concat(count, " giorni"); },
                }); },
                billableDefault: 'Predefinito fatturabile',
                billableDefaultDescription: 'Scegli se le spese in contanti e con carta di credito devono essere fatturabili per impostazione predefinita. Le spese fatturabili sono abilitate o disabilitate in',
                billable: 'Fatturabile',
                billableDescription: 'Le spese sono più spesso riaddebitate ai clienti.',
                nonBillable: 'Non-fatturabile',
                nonBillableDescription: 'Le spese sono occasionalmente riaddebitate ai clienti.',
                eReceipts: 'eReceipts',
                eReceiptsHint: 'Gli eReceipts sono creati automaticamente',
                eReceiptsHintLink: 'per la maggior parte delle transazioni di credito in USD',
                attendeeTracking: 'Monitoraggio dei partecipanti',
                attendeeTrackingHint: 'Tieni traccia del costo per persona per ogni spesa.',
                prohibitedDefaultDescription: "Segnala tutte le ricevute in cui compaiono alcolici, giochi d'azzardo o altri articoli vietati. Le spese con ricevute in cui compaiono questi articoli richiederanno una revisione manuale.",
                prohibitedExpenses: 'Spese vietate',
                alcohol: 'Alcol',
                hotelIncidentals: 'Extra alberghieri',
                gambling: "Gioco d'azzardo",
                tobacco: 'Tabacco',
                adultEntertainment: 'Intrattenimento per adulti',
            },
            expenseReportRules: {
                examples: 'Esempi:',
                title: 'Report di spesa',
                subtitle: 'Automatizza la conformità, le approvazioni e il pagamento dei report di spesa.',
                customReportNamesSubtitle: 'Personalizza i titoli dei report utilizzando il nostro',
                customNameTitle: 'Titolo predefinito del report',
                customNameDescription: 'Scegli un nome personalizzato per i report di spesa utilizzando il nostro',
                customNameDescriptionLink: 'formule estese',
                customNameInputLabel: 'Nome',
                customNameEmailPhoneExample: 'Email o telefono del membro: {report:submit:from}',
                customNameStartDateExample: 'Data di inizio del report: {report:startdate}',
                customNameWorkspaceNameExample: "Nome dell'area di lavoro: {report:workspacename}",
                customNameReportIDExample: 'Report ID: {report:id}',
                customNameTotalExample: 'Totale: {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'Impedisci ai membri di modificare i nomi dei report personalizzati',
                preventSelfApprovalsTitle: 'Impedisci auto-approvazioni',
                preventSelfApprovalsSubtitle: 'Impedisci ai membri del workspace di approvare i propri report di spesa.',
                autoApproveCompliantReportsTitle: 'Approva automaticamente i rapporti conformi',
                autoApproveCompliantReportsSubtitle: "Configura quali report di spesa sono idonei per l'approvazione automatica.",
                autoApproveReportsUnderTitle: 'Approvare automaticamente i rapporti sotto',
                autoApproveReportsUnderDescription: 'I rapporti spese completamente conformi sotto questo importo saranno approvati automaticamente.',
                randomReportAuditTitle: 'Verifica casuale del report',
                randomReportAuditDescription: "Richiedi che alcuni rapporti siano approvati manualmente, anche se idonei per l'approvazione automatica.",
                autoPayApprovedReportsTitle: 'Rapporti approvati con pagamento automatico',
                autoPayApprovedReportsSubtitle: 'Configura quali report di spesa sono idonei per il pagamento automatico.',
                autoPayApprovedReportsLimitError: function (_a) {
                    var _b = _a === void 0 ? {} : _a, currency = _b.currency;
                    return "Per favore inserisci un importo inferiore a ".concat(currency !== null && currency !== void 0 ? currency : '', "20.000");
                },
                autoPayApprovedReportsLockedSubtitle: 'Vai su altre funzionalità e abilita i flussi di lavoro, quindi aggiungi i pagamenti per sbloccare questa funzione.',
                autoPayReportsUnderTitle: 'Rapporti di pagamento automatico sotto',
                autoPayReportsUnderDescription: 'I rapporti spese completamente conformi sotto questo importo verranno pagati automaticamente.',
                unlockFeatureGoToSubtitle: 'Vai a',
                unlockFeatureEnableWorkflowsSubtitle: function (_a) {
                    var featureName = _a.featureName;
                    return "e abilita i flussi di lavoro, quindi aggiungi ".concat(featureName, " per sbloccare questa funzione.");
                },
                enableFeatureSubtitle: function (_a) {
                    var featureName = _a.featureName;
                    return "e abilita ".concat(featureName, " per sbloccare questa funzione.");
                },
            },
            categoryRules: {
                title: 'Regole di categoria',
                approver: 'Approvante',
                requireDescription: 'Richiede descrizione',
                descriptionHint: 'Suggerimento descrizione',
                descriptionHintDescription: function (_a) {
                    var categoryName = _a.categoryName;
                    return "Ricorda ai dipendenti di fornire informazioni aggiuntive per la spesa di \u201C".concat(categoryName, "\u201D. Questo suggerimento appare nel campo descrizione delle spese.");
                },
                descriptionHintLabel: 'Suggerimento',
                descriptionHintSubtitle: 'Suggerimento: Più è breve, meglio è!',
                maxAmount: 'Importo massimo',
                flagAmountsOver: 'Segnala importi superiori a',
                flagAmountsOverDescription: function (_a) {
                    var categoryName = _a.categoryName;
                    return "Si applica alla categoria \"".concat(categoryName, "\".");
                },
                flagAmountsOverSubtitle: "Questo sostituisce l'importo massimo per tutte le spese.",
                expenseLimitTypes: {
                    expense: 'Spesa individuale',
                    expenseSubtitle: "Contrassegna gli importi delle spese per categoria. Questa regola sostituisce la regola generale dello spazio di lavoro per l'importo massimo delle spese.",
                    daily: 'Totale categoria',
                    dailySubtitle: 'Segnala la spesa totale per categoria per ogni rapporto di spesa.',
                },
                requireReceiptsOver: 'Richiedi ricevute superiori a',
                requireReceiptsOverList: {
                    default: function (_a) {
                        var defaultAmount = _a.defaultAmount;
                        return "".concat(defaultAmount, " ").concat(CONST_1.default.DOT_SEPARATOR, " Predefinito");
                    },
                    never: 'Non richiedere mai ricevute',
                    always: 'Richiedi sempre le ricevute',
                },
                defaultTaxRate: 'Aliquota fiscale predefinita',
                goTo: 'Vai a',
                andEnableWorkflows: 'e abilita i flussi di lavoro, quindi aggiungi approvazioni per sbloccare questa funzione.',
            },
            customRules: {
                title: 'Regole personalizzate',
                subtitle: 'Descrizione',
                description: 'Inserisci regole personalizzate per i report di spesa',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Raccogliere',
                    description: 'Per i team che cercano di automatizzare i loro processi.',
                },
                corporate: {
                    label: 'Controllo',
                    description: 'Per organizzazioni con requisiti avanzati.',
                },
            },
            description: 'Scegli un piano che fa per te. Per un elenco dettagliato delle funzionalità e dei prezzi, consulta il nostro',
            subscriptionLink: 'tipi di piano e pagina di aiuto sui prezzi',
            lockedPlanDescription: function (_a) {
                var count = _a.count, annualSubscriptionEndDate = _a.annualSubscriptionEndDate;
                return ({
                    one: "Ti sei impegnato per 1 membro attivo sul piano Control fino alla scadenza del tuo abbonamento annuale il ".concat(annualSubscriptionEndDate, ". Puoi passare all'abbonamento a consumo e effettuare il downgrade al piano Collect a partire dal ").concat(annualSubscriptionEndDate, " disabilitando il rinnovo automatico in"),
                    other: "Hai impegnato ".concat(count, " membri attivi nel piano Control fino alla fine del tuo abbonamento annuale il ").concat(annualSubscriptionEndDate, ". Puoi passare all'abbonamento a consumo e fare il downgrade al piano Collect a partire dal ").concat(annualSubscriptionEndDate, " disabilitando il rinnovo automatico in"),
                });
            },
            subscriptions: 'Abbonamenti',
        },
    },
    getAssistancePage: {
        title: 'Ottieni assistenza',
        subtitle: 'Siamo qui per spianare la tua strada verso la grandezza!',
        description: 'Scegli tra le opzioni di supporto qui sotto:',
        chatWithConcierge: 'Chatta con Concierge',
        scheduleSetupCall: 'Pianifica una chiamata di configurazione',
        scheduleACall: 'Pianifica chiamata',
        questionMarkButtonTooltip: 'Ottieni assistenza dal nostro team',
        exploreHelpDocs: 'Esplora i documenti di aiuto',
        registerForWebinar: 'Registrati per il webinar',
        onboardingHelp: "Assistenza per l'integrazione",
    },
    emojiPicker: {
        skinTonePickerLabel: 'Cambia il tono della pelle predefinito',
        headers: {
            frequentlyUsed: 'Frequentemente usato',
            smileysAndEmotion: 'Smileys & Emozioni',
            peopleAndBody: 'Persone e Corpo',
            animalsAndNature: 'Animali e Natura',
            foodAndDrink: 'Cibo e Bevande',
            travelAndPlaces: 'Viaggi e Luoghi',
            activities: 'Attività',
            objects: 'Oggetti',
            symbols: 'Simboli',
            flags: 'Bandiere',
        },
    },
    newRoomPage: {
        newRoom: 'Nuova stanza',
        groupName: 'Nome del gruppo',
        roomName: 'Nome della stanza',
        visibility: 'Visibilità',
        restrictedDescription: 'Le persone nel tuo spazio di lavoro possono trovare questa stanza',
        privateDescription: 'Le persone invitate a questa stanza possono trovarla',
        publicDescription: 'Chiunque può trovare questa stanza',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Chiunque può trovare questa stanza',
        createRoom: 'Crea stanza',
        roomAlreadyExistsError: 'Una stanza con questo nome esiste già',
        roomNameReservedError: function (_a) {
            var reservedName = _a.reservedName;
            return "".concat(reservedName, " \u00E8 una stanza predefinita in tutti gli spazi di lavoro. Si prega di scegliere un altro nome.");
        },
        roomNameInvalidError: 'I nomi delle stanze possono includere solo lettere minuscole, numeri e trattini',
        pleaseEnterRoomName: 'Per favore inserisci un nome per la stanza',
        pleaseSelectWorkspace: "Seleziona un'area di lavoro per favore",
        renamedRoomAction: function (_a) {
            var oldName = _a.oldName, newName = _a.newName, actorName = _a.actorName, isExpenseReport = _a.isExpenseReport;
            var actor = actorName ? "".concat(actorName, " ") : '';
            return isExpenseReport
                ? "".concat(actor, " rinominato in \"").concat(newName, "\" (precedentemente \"").concat(oldName, "\")")
                : "".concat(actor, " ha rinominato questa stanza in \"").concat(newName, "\" (precedentemente \"").concat(oldName, "\")");
        },
        roomRenamedTo: function (_a) {
            var newName = _a.newName;
            return "Stanza rinominata in ".concat(newName);
        },
        social: 'sociale',
        selectAWorkspace: "Seleziona un'area di lavoro",
        growlMessageOnRenameError: 'Impossibile rinominare la stanza del workspace. Controlla la tua connessione e riprova.',
        visibilityOptions: {
            restricted: 'Spazio di lavoro', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privato',
            public: 'Pubblico',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Annuncio pubblico',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Invia e Chiudi',
        submitAndApprove: 'Invia e Approva',
        advanced: 'AVANZATO',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: function (_a) {
            var approverEmail = _a.approverEmail, approverName = _a.approverName, field = _a.field, name = _a.name;
            return "aggiunto ".concat(approverName, " (").concat(approverEmail, ") come approvatore per il ").concat(field, " \"").concat(name, "\"");
        },
        deleteApprovalRule: function (_a) {
            var approverEmail = _a.approverEmail, approverName = _a.approverName, field = _a.field, name = _a.name;
            return "rimosso ".concat(approverName, " (").concat(approverEmail, ") come approvatore per il ").concat(field, " \"").concat(name, "\"");
        },
        updateApprovalRule: function (_a) {
            var field = _a.field, name = _a.name, newApproverEmail = _a.newApproverEmail, newApproverName = _a.newApproverName, oldApproverEmail = _a.oldApproverEmail, oldApproverName = _a.oldApproverName;
            var formatApprover = function (displayName, email) { return (displayName ? "".concat(displayName, " (").concat(email, ")") : email); };
            return "ha cambiato l'approvatore per il ".concat(field, " \"").concat(name, "\" a ").concat(formatApprover(newApproverName, newApproverEmail), " (precedentemente ").concat(formatApprover(oldApproverName, oldApproverEmail), ")");
        },
        addCategory: function (_a) {
            var categoryName = _a.categoryName;
            return "ha aggiunto la categoria \"".concat(categoryName, "\"");
        },
        deleteCategory: function (_a) {
            var categoryName = _a.categoryName;
            return "rimosso la categoria \"".concat(categoryName, "\"");
        },
        updateCategory: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName;
            return "".concat(oldValue ? 'disabilitato' : 'abilitato', " la categoria \"").concat(categoryName, "\"");
        },
        updateCategoryPayrollCode: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName, newValue = _a.newValue;
            if (!oldValue) {
                return "aggiunto il codice di retribuzione \"".concat(newValue, "\" alla categoria \"").concat(categoryName, "\"");
            }
            if (!newValue && oldValue) {
                return "rimosso il codice di payroll \"".concat(oldValue, "\" dalla categoria \"").concat(categoryName, "\"");
            }
            return "ha cambiato il codice payroll della categoria \"".concat(categoryName, "\" in \u201C").concat(newValue, "\u201D (precedentemente \u201C").concat(oldValue, "\u201D)");
        },
        updateCategoryGLCode: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName, newValue = _a.newValue;
            if (!oldValue) {
                return "ha aggiunto il codice GL \"".concat(newValue, "\" alla categoria \"").concat(categoryName, "\"");
            }
            if (!newValue && oldValue) {
                return "rimosso il codice GL \"".concat(oldValue, "\" dalla categoria \"").concat(categoryName, "\"");
            }
            return "ha cambiato il codice GL della categoria \u201C".concat(categoryName, "\u201D in \u201C").concat(newValue, "\u201D (precedentemente \u201C").concat(oldValue, "\u201C)");
        },
        updateAreCommentsRequired: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName;
            return "ha cambiato la descrizione della categoria \"".concat(categoryName, "\" in ").concat(!oldValue ? 'richiesto' : 'non richiesto', " (precedentemente ").concat(!oldValue ? 'non richiesto' : 'richiesto', ")");
        },
        updateCategoryMaxExpenseAmount: function (_a) {
            var categoryName = _a.categoryName, oldAmount = _a.oldAmount, newAmount = _a.newAmount;
            if (newAmount && !oldAmount) {
                return "ha aggiunto un importo massimo di ".concat(newAmount, " alla categoria \"").concat(categoryName, "\"");
            }
            if (oldAmount && !newAmount) {
                return "rimosso l'importo massimo di ".concat(oldAmount, " dalla categoria \"").concat(categoryName, "\"");
            }
            return "ha modificato l'importo massimo della categoria \"".concat(categoryName, "\" a ").concat(newAmount, " (precedentemente ").concat(oldAmount, ")");
        },
        updateCategoryExpenseLimitType: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "ha aggiunto un tipo di limite di ".concat(newValue, " alla categoria \"").concat(categoryName, "\"");
            }
            return "ha cambiato il tipo di limite della categoria \"".concat(categoryName, "\" a ").concat(newValue, " (precedentemente ").concat(oldValue, ")");
        },
        updateCategoryMaxAmountNoReceipt: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "aggiornata la categoria \"".concat(categoryName, "\" cambiando Ricevute in ").concat(newValue);
            }
            return "ha cambiato la categoria \"".concat(categoryName, "\" in ").concat(newValue, " (precedentemente ").concat(oldValue, ")");
        },
        setCategoryName: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "rinominato la categoria \"".concat(oldName, "\" in \"").concat(newName, "\"");
        },
        updatedDescriptionHint: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!newValue) {
                return "rimosso il suggerimento di descrizione \"".concat(oldValue, "\" dalla categoria \"").concat(categoryName, "\"");
            }
            return !oldValue
                ? "aggiunto il suggerimento della descrizione \"".concat(newValue, "\" alla categoria \"").concat(categoryName, "\"")
                : "ha cambiato il suggerimento della descrizione della categoria \"".concat(categoryName, "\" in \"").concat(newValue, "\" (precedentemente \"").concat(oldValue, "\")");
        },
        updateTagListName: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "ha cambiato il nome dell'elenco di tag in \"".concat(newName, "\" (precedentemente \"").concat(oldName, "\")");
        },
        addTag: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName;
            return "ha aggiunto il tag \"".concat(tagName, "\" alla lista \"").concat(tagListName, "\"");
        },
        updateTagName: function (_a) {
            var tagListName = _a.tagListName, newName = _a.newName, oldName = _a.oldName;
            return "aggiornato l'elenco dei tag \"".concat(tagListName, "\" cambiando il tag \"").concat(oldName, "\" in \"").concat(newName, "\"");
        },
        updateTagEnabled: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName, enabled = _a.enabled;
            return "".concat(enabled ? 'abilitato' : 'disabilitato', " il tag \"").concat(tagName, "\" nella lista \"").concat(tagListName, "\"");
        },
        deleteTag: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName;
            return "rimosso il tag \"".concat(tagName, "\" dalla lista \"").concat(tagListName, "\"");
        },
        deleteMultipleTags: function (_a) {
            var count = _a.count, tagListName = _a.tagListName;
            return "rimosso \"".concat(count, "\" tag dall'elenco \"").concat(tagListName, "\"");
        },
        updateTag: function (_a) {
            var tagListName = _a.tagListName, newValue = _a.newValue, tagName = _a.tagName, updatedField = _a.updatedField, oldValue = _a.oldValue;
            if (oldValue) {
                return "aggiornato il tag \"".concat(tagName, "\" nella lista \"").concat(tagListName, "\" cambiando il ").concat(updatedField, " in \"").concat(newValue, "\" (precedentemente \"").concat(oldValue, "\")");
            }
            return "aggiornato il tag \"".concat(tagName, "\" nella lista \"").concat(tagListName, "\" aggiungendo un ").concat(updatedField, " di \"").concat(newValue, "\"");
        },
        updateCustomUnit: function (_a) {
            var customUnitName = _a.customUnitName, newValue = _a.newValue, oldValue = _a.oldValue, updatedField = _a.updatedField;
            return "ha cambiato il ".concat(customUnitName, " ").concat(updatedField, " in \"").concat(newValue, "\" (precedentemente \"").concat(oldValue, "\")");
        },
        updateCustomUnitTaxEnabled: function (_a) {
            var newValue = _a.newValue;
            return "Tracciamento fiscale ".concat(newValue ? 'abilitato' : 'disabilitato', " sui tassi di distanza");
        },
        addCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, rateName = _a.rateName;
            return "aggiunto un nuovo tasso \"".concat(customUnitName, "\" \"").concat(rateName, "\"");
        },
        updatedCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, oldValue = _a.oldValue, updatedField = _a.updatedField;
            return "ha modificato la tariffa del ".concat(customUnitName, " ").concat(updatedField, " \"").concat(customUnitRateName, "\" a \"").concat(newValue, "\" (precedentemente \"").concat(oldValue, "\")");
        },
        updatedCustomUnitTaxRateExternalID: function (_a) {
            var customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, newTaxPercentage = _a.newTaxPercentage, oldTaxPercentage = _a.oldTaxPercentage, oldValue = _a.oldValue;
            if (oldTaxPercentage && oldValue) {
                return "ha modificato l'aliquota fiscale sulla tariffa di distanza \"".concat(customUnitRateName, "\" a \"").concat(newValue, " (").concat(newTaxPercentage, ")\" (precedentemente \"").concat(oldValue, " (").concat(oldTaxPercentage, ")\")");
            }
            return "ha aggiunto l'aliquota fiscale \"".concat(newValue, " (").concat(newTaxPercentage, ")\" alla tariffa di distanza \"").concat(customUnitRateName, "\"");
        },
        updatedCustomUnitTaxClaimablePercentage: function (_a) {
            var customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, oldValue = _a.oldValue;
            if (oldValue) {
                return "ha modificato la parte recuperabile delle tasse sulla tariffa di distanza \"".concat(customUnitRateName, "\" a \"").concat(newValue, "\" (in precedenza \"").concat(oldValue, "\")");
            }
            return "ha aggiunto una parte recuperabile di tasse di \"".concat(newValue, "\" alla tariffa di distanza \"").concat(customUnitRateName, "\"");
        },
        deleteCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, rateName = _a.rateName;
            return "rimosso il tasso \"".concat(rateName, "\" di \"").concat(customUnitName, "\"");
        },
        addedReportField: function (_a) {
            var fieldType = _a.fieldType, fieldName = _a.fieldName;
            return "aggiunto campo di report ".concat(fieldType, " \"").concat(fieldName, "\"");
        },
        updateReportFieldDefaultValue: function (_a) {
            var defaultValue = _a.defaultValue, fieldName = _a.fieldName;
            return "imposta il valore predefinito del campo del report \"".concat(fieldName, "\" su \"").concat(defaultValue, "\"");
        },
        addedReportFieldOption: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName;
            return "aggiunto l'opzione \"".concat(optionName, "\" al campo del report \"").concat(fieldName, "\"");
        },
        removedReportFieldOption: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName;
            return "rimosso l'opzione \"".concat(optionName, "\" dal campo del report \"").concat(fieldName, "\"");
        },
        updateReportFieldOptionDisabled: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName, optionEnabled = _a.optionEnabled;
            return "".concat(optionEnabled ? 'abilitato' : 'disabilitato', " l'opzione \"").concat(optionName, "\" per il campo del rapporto \"").concat(fieldName, "\"");
        },
        updateReportFieldAllOptionsDisabled: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName, allEnabled = _a.allEnabled, toggledOptionsCount = _a.toggledOptionsCount;
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return "".concat(allEnabled ? 'abilitato' : 'disabilitato', " tutte le opzioni per il campo del report \"").concat(fieldName, "\"");
            }
            return "".concat(allEnabled ? 'abilitato' : 'disabilitato', " l'opzione \"").concat(optionName, "\" per il campo del report \"").concat(fieldName, "\", rendendo tutte le opzioni ").concat(allEnabled ? 'abilitato' : 'disabilitato');
        },
        deleteReportField: function (_a) {
            var fieldType = _a.fieldType, fieldName = _a.fieldName;
            return "rimosso il campo del report ".concat(fieldType, " \"").concat(fieldName, "\"");
        },
        preventSelfApproval: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "aggiornato \"Prevent self-approval\" a \"".concat(newValue === 'true' ? 'Abilitato' : 'Disabilitato', "\" (precedentemente \"").concat(oldValue === 'true' ? 'Abilitato' : 'Disabilitato', "\")");
        },
        updateMaxExpenseAmountNoReceipt: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "ha modificato l'importo massimo richiesto per la spesa con ricevuta a ".concat(newValue, " (precedentemente ").concat(oldValue, ")");
        },
        updateMaxExpenseAmount: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "ha modificato l'importo massimo della spesa per le violazioni a ".concat(newValue, " (precedentemente ").concat(oldValue, ")");
        },
        updateMaxExpenseAge: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "aggiornato \"Et\u00E0 massima della spesa (giorni)\" a \"".concat(newValue, "\" (precedentemente \"").concat(oldValue === 'false' ? CONST_1.default.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue, "\")");
        },
        updateMonthlyOffset: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "imposta la data di invio del rapporto mensile su \"".concat(newValue, "\"");
            }
            return "aggiornata la data di presentazione del rapporto mensile a \"".concat(newValue, "\" (precedentemente \"").concat(oldValue, "\")");
        },
        updateDefaultBillable: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "aggiornato \"Riaddebita le spese ai clienti\" a \"".concat(newValue, "\" (precedentemente \"").concat(oldValue, "\")");
        },
        updateDefaultTitleEnforced: function (_a) {
            var value = _a.value;
            return "trasformato \"Imponi titoli di report predefiniti\" ".concat(value ? 'su' : 'spento');
        },
        renamedWorkspaceNameAction: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "ha aggiornato il nome di questo spazio di lavoro in \"".concat(newName, "\" (precedentemente \"").concat(oldName, "\")");
        },
        updateWorkspaceDescription: function (_a) {
            var newDescription = _a.newDescription, oldDescription = _a.oldDescription;
            return !oldDescription
                ? "imposta la descrizione di questo spazio di lavoro su \"".concat(newDescription, "\"")
                : "ha aggiornato la descrizione di questo spazio di lavoro a \"".concat(newDescription, "\" (precedentemente \"").concat(oldDescription, "\")");
        },
        removedFromApprovalWorkflow: function (_a) {
            var _b;
            var submittersNames = _a.submittersNames;
            var joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = (_b = submittersNames.at(0)) !== null && _b !== void 0 ? _b : '';
            }
            else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('e');
            }
            else if (submittersNames.length > 2) {
                joinedNames = "".concat(submittersNames.slice(0, submittersNames.length - 1).join(', '), " and ").concat(submittersNames.at(-1));
            }
            return {
                one: "ti ha rimosso dal flusso di approvazione e dalla chat delle spese di ".concat(joinedNames, ". I rapporti precedentemente inviati rimarranno disponibili per l'approvazione nella tua Posta in arrivo."),
                other: "ti ha rimosso dai flussi di approvazione e dalle chat delle spese di ".concat(joinedNames, ". I report inviati in precedenza rimarranno disponibili per l'approvazione nella tua Posta in arrivo."),
            };
        },
        demotedFromWorkspace: function (_a) {
            var policyName = _a.policyName, oldRole = _a.oldRole;
            return "aggiornato il tuo ruolo in ".concat(policyName, " da ").concat(oldRole, " a utente. Sei stato rimosso da tutte le chat delle spese dei presentatori tranne la tua.");
        },
        updatedWorkspaceCurrencyAction: function (_a) {
            var oldCurrency = _a.oldCurrency, newCurrency = _a.newCurrency;
            return "aggiornata la valuta predefinita a ".concat(newCurrency, " (precedentemente ").concat(oldCurrency, ")");
        },
        updatedWorkspaceFrequencyAction: function (_a) {
            var oldFrequency = _a.oldFrequency, newFrequency = _a.newFrequency;
            return "aggiornata la frequenza di auto-reporting a \"".concat(newFrequency, "\" (precedentemente \"").concat(oldFrequency, "\")");
        },
        updateApprovalMode: function (_a) {
            var newValue = _a.newValue, oldValue = _a.oldValue;
            return "aggiornata la modalit\u00E0 di approvazione a \"".concat(newValue, "\" (precedentemente \"").concat(oldValue, "\")");
        },
        upgradedWorkspace: 'ha aggiornato questo spazio di lavoro al piano Control',
        downgradedWorkspace: 'ha declassato questo spazio di lavoro al piano Collect',
        updatedAuditRate: function (_a) {
            var oldAuditRate = _a.oldAuditRate, newAuditRate = _a.newAuditRate;
            return "ha cambiato la percentuale di rapporti instradati casualmente per l'approvazione manuale a ".concat(Math.round(newAuditRate * 100), "% (precedentemente ").concat(Math.round(oldAuditRate * 100), "%)");
        },
        updatedManualApprovalThreshold: function (_a) {
            var oldLimit = _a.oldLimit, newLimit = _a.newLimit;
            return "ha cambiato il limite di approvazione manuale per tutte le spese a ".concat(newLimit, " (precedentemente ").concat(oldLimit, ")");
        },
    },
    roomMembersPage: {
        memberNotFound: 'Membro non trovato.',
        useInviteButton: 'Per invitare un nuovo membro alla chat, utilizza il pulsante di invito sopra.',
        notAuthorized: "Non hai accesso a questa pagina. Se stai cercando di unirti a questa stanza, chiedi a un membro della stanza di aggiungerti. Qualcos'altro? Contatta ".concat(CONST_1.default.EMAIL.CONCIERGE),
        removeMembersPrompt: function (_a) {
            var memberName = _a.memberName;
            return ({
                one: "Sei sicuro di voler rimuovere ".concat(memberName, " dalla stanza?"),
                other: 'Sei sicuro di voler rimuovere i membri selezionati dalla stanza?',
            });
        },
        error: {
            genericAdd: "Si è verificato un problema nell'aggiungere questo membro alla stanza",
        },
    },
    newTaskPage: {
        assignTask: 'Assegna compito',
        assignMe: 'Assegna a me',
        confirmTask: 'Conferma attività',
        confirmError: 'Inserisci un titolo e seleziona una destinazione di condivisione',
        descriptionOptional: 'Descrizione (facoltativa)',
        pleaseEnterTaskName: 'Per favore inserisci un titolo',
        pleaseEnterTaskDestination: 'Seleziona dove desideri condividere questo compito',
    },
    task: {
        task: 'Compito',
        title: 'Titolo',
        description: 'Descrizione',
        assignee: 'Assegnatario',
        completed: 'Completato',
        action: 'Completa',
        messages: {
            created: function (_a) {
                var title = _a.title;
                return "attivit\u00E0 per ".concat(title);
            },
            completed: 'contrassegnato come completato',
            canceled: 'attività eliminata',
            reopened: 'contrassegnato come incompleto',
            error: "Non hai il permesso di eseguire l'azione richiesta.",
        },
        markAsComplete: 'Segna come completato',
        markAsIncomplete: 'Segna come incompleto',
        assigneeError: "Si è verificato un errore durante l'assegnazione di questo compito. Si prega di provare con un altro assegnatario.",
        genericCreateTaskFailureMessage: 'Si è verificato un errore durante la creazione di questa attività. Per favore riprova più tardi.',
        deleteTask: 'Elimina attività',
        deleteConfirmation: 'Sei sicuro di voler eliminare questo compito?',
    },
    statementPage: {
        title: function (_a) {
            var year = _a.year, monthName = _a.monthName;
            return "Estratto conto di ".concat(monthName, " ").concat(year);
        },
    },
    keyboardShortcutsPage: {
        title: 'Scorciatoie da tastiera',
        subtitle: 'Risparmia tempo con queste utili scorciatoie da tastiera:',
        shortcuts: {
            openShortcutDialog: 'Apre la finestra di dialogo delle scorciatoie da tastiera',
            markAllMessagesAsRead: 'Segna tutti i messaggi come letti',
            escape: 'Fuggi dialoghi',
            search: 'Apri la finestra di dialogo di ricerca',
            newChat: 'Nuova schermata chat',
            copy: 'Copia commento',
            openDebug: 'Apri la finestra di dialogo delle preferenze di test',
        },
    },
    guides: {
        screenShare: 'Condivisione schermo',
        screenShareRequest: 'Expensify ti invita a condividere lo schermo',
    },
    search: {
        resultsAreLimited: 'I risultati della ricerca sono limitati.',
        viewResults: 'Visualizza risultati',
        resetFilters: 'Reimposta filtri',
        searchResults: {
            emptyResults: {
                title: 'Niente da mostrare',
                subtitle: 'Prova a modificare i criteri di ricerca o a creare qualcosa con il pulsante verde +.',
            },
            emptyExpenseResults: {
                title: 'Non hai ancora creato nessuna spesa.',
                subtitle: 'Crea una spesa o fai un giro di prova di Expensify per saperne di più.',
                subtitleWithOnlyCreateButton: 'Usa il pulsante verde qui sotto per creare una spesa.',
            },
            emptyReportResults: {
                title: 'Non hai ancora creato alcun report',
                subtitle: 'Crea un report o fai un test drive di Expensify per saperne di più.',
                subtitleWithOnlyCreateButton: 'Usa il pulsante verde qui sotto per creare un rapporto.',
            },
            emptyInvoiceResults: {
                title: 'Non hai ancora creato nessuna fattura.',
                subtitle: 'Invia una fattura o fai un test drive di Expensify per saperne di più.',
                subtitleWithOnlyCreateButton: 'Utilizza il pulsante verde qui sotto per inviare una fattura.',
            },
            emptyTripResults: {
                title: 'Nessun viaggio da visualizzare',
                subtitle: 'Inizia prenotando il tuo primo viaggio qui sotto.',
                buttonText: 'Prenota un viaggio',
            },
            emptySubmitResults: {
                title: 'Nessuna spesa da inviare',
                subtitle: 'Tutto chiaro. Fai un giro di vittoria!',
                buttonText: 'Crea rapporto',
            },
            emptyApproveResults: {
                title: 'Nessuna spesa da approvare',
                subtitle: 'Zero spese. Massimo relax. Ben fatto!',
            },
            emptyPayResults: {
                title: 'Nessuna spesa da pagare',
                subtitle: 'Congratulazioni! Hai tagliato il traguardo.',
            },
            emptyExportResults: {
                title: 'Nessuna spesa da esportare',
                subtitle: 'È ora di rilassarsi, bel lavoro.',
            },
            emptyUnapprovedResults: {
                title: 'Nessuna spesa da approvare',
                subtitle: 'Zero spese. Massimo relax. Ben fatto!',
            },
        },
        unapproved: 'Non approvato',
        unapprovedCash: 'Contanti non approvati',
        unapprovedCompanyCards: 'Carte aziendali non approvate',
        saveSearch: 'Salva ricerca',
        deleteSavedSearch: 'Elimina ricerca salvata',
        deleteSavedSearchConfirm: 'Sei sicuro di voler eliminare questa ricerca?',
        searchName: 'Cerca nome',
        savedSearchesMenuItemTitle: 'Salvato',
        groupedExpenses: 'spese raggruppate',
        bulkActions: {
            approve: 'Approva',
            pay: 'Paga',
            delete: 'Elimina',
            hold: 'Attendere',
            unhold: 'Rimuovi blocco',
            noOptionsAvailable: 'Nessuna opzione disponibile per il gruppo di spese selezionato.',
        },
        filtersHeader: 'Filtri',
        filters: {
            date: {
                before: function (_a) {
                    var _b = _a === void 0 ? {} : _a, date = _b.date;
                    return "Prima di ".concat(date !== null && date !== void 0 ? date : '');
                },
                after: function (_a) {
                    var _b = _a === void 0 ? {} : _a, date = _b.date;
                    return "After ".concat(date !== null && date !== void 0 ? date : '');
                },
                on: function (_a) {
                    var _b = _a === void 0 ? {} : _a, date = _b.date;
                    return "On ".concat(date !== null && date !== void 0 ? date : '');
                },
                presets: (_7 = {},
                    _7[CONST_1.default.SEARCH.DATE_PRESETS.NEVER] = 'Mai',
                    _7[CONST_1.default.SEARCH.DATE_PRESETS.LAST_MONTH] = 'Ultimo mese',
                    _7),
            },
            status: 'Stato',
            keyword: 'Parola chiave',
            hasKeywords: 'Contiene parole chiave',
            currency: 'Valuta',
            link: 'Link',
            pinned: 'Aggiunto ai preferiti',
            unread: 'Non letto',
            completed: 'Completato',
            amount: {
                lessThan: function (_a) {
                    var _b = _a === void 0 ? {} : _a, amount = _b.amount;
                    return "Meno di ".concat(amount !== null && amount !== void 0 ? amount : '');
                },
                greaterThan: function (_a) {
                    var _b = _a === void 0 ? {} : _a, amount = _b.amount;
                    return "Maggiore di ".concat(amount !== null && amount !== void 0 ? amount : '');
                },
                between: function (_a) {
                    var greaterThan = _a.greaterThan, lessThan = _a.lessThan;
                    return "Tra ".concat(greaterThan, " e ").concat(lessThan);
                },
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Carte individuali',
                closedCards: 'Carte chiuse',
                cardFeeds: 'Feed delle carte',
                cardFeedName: function (_a) {
                    var cardFeedBankName = _a.cardFeedBankName, cardFeedLabel = _a.cardFeedLabel;
                    return "Tutto ".concat(cardFeedBankName).concat(cardFeedLabel ? " - ".concat(cardFeedLabel) : '');
                },
                cardFeedNameCSV: function (_a) {
                    var cardFeedLabel = _a.cardFeedLabel;
                    return "Tutte le carte importate CSV".concat(cardFeedLabel ? " - ".concat(cardFeedLabel) : '');
                },
            },
            current: 'Corrente',
            past: 'Passato',
            submitted: 'Data di invio',
            approved: 'Data approvata',
            paid: 'Data di pagamento',
            exported: 'Data esportata',
            posted: 'Data di pubblicazione',
            billable: 'Fatturabile',
            reimbursable: 'Rimborsabile',
            groupBy: {
                reports: 'Rapporto',
                members: 'Membro',
                cards: 'Carta',
            },
        },
        groupBy: 'Gruppo per',
        moneyRequestReport: {
            emptyStateTitle: 'Questo report non ha spese.',
            emptyStateSubtitle: 'Puoi aggiungere spese a questo rapporto utilizzando il pulsante sopra.',
        },
        noCategory: 'Nessuna categoria',
        noTag: 'Nessun tag',
        expenseType: 'Tipo di spesa',
        recentSearches: 'Ricerche recenti',
        recentChats: 'Chat recenti',
        searchIn: 'Cerca in',
        searchPlaceholder: 'Cerca qualcosa',
        suggestions: 'Suggerimenti',
        exportSearchResults: {
            title: 'Crea esportazione',
            description: 'Wow, sono molti articoli! Li raggrupperemo e Concierge ti invierà un file a breve.',
        },
        exportAll: {
            selectAllMatchingItems: 'Seleziona tutti gli elementi corrispondenti',
            allMatchingItemsSelected: 'Tutti gli elementi corrispondenti selezionati',
        },
    },
    genericErrorPage: {
        title: 'Uh-oh, qualcosa è andato storto!',
        body: {
            helpTextMobile: "Chiudi e riapri l'app, oppure passa a",
            helpTextWeb: 'web.',
            helpTextConcierge: 'Se il problema persiste, contatta',
        },
        refresh: 'Aggiorna',
    },
    fileDownload: {
        success: {
            title: 'Scaricato!',
            message: 'Allegato scaricato con successo!',
            qrMessage: 'Controlla la cartella delle foto o dei download per una copia del tuo codice QR. Suggerimento: Aggiungilo a una presentazione affinché il tuo pubblico possa scansionarlo e connettersi direttamente con te.',
        },
        generalError: {
            title: 'Errore allegato',
            message: "Impossibile scaricare l'allegato",
        },
        permissionError: {
            title: 'Accesso allo storage',
            message: 'Expensify non può salvare gli allegati senza accesso alla memoria. Tocca impostazioni per aggiornare i permessi.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Nuovo Expensify',
        about: 'Informazioni su New Expensify',
        update: 'Aggiorna New Expensify',
        checkForUpdates: 'Controlla aggiornamenti',
        toggleDevTools: 'Attiva/Disattiva Strumenti per Sviluppatori',
        viewShortcuts: 'Visualizza le scorciatoie da tastiera',
        services: 'Servizi',
        hide: 'Nascondi New Expensify',
        hideOthers: 'Nascondi altri',
        showAll: 'Mostra tutto',
        quit: 'Esci da New Expensify',
        fileMenu: 'File',
        closeWindow: 'Chiudi finestra',
        editMenu: 'Modifica',
        undo: 'Annulla',
        redo: 'Rifare',
        cut: 'Tagliare',
        copy: 'Copiare',
        paste: 'Incolla',
        pasteAndMatchStyle: 'Incolla e Adatta Stile',
        pasteAsPlainText: 'Incolla come testo normale',
        delete: 'Elimina',
        selectAll: 'Seleziona tutto',
        speechSubmenu: 'Discorso',
        startSpeaking: 'Inizia a parlare',
        stopSpeaking: 'Smettila di parlare',
        viewMenu: 'Visualizza',
        reload: 'Ricarica',
        forceReload: 'Forza Ricarica',
        resetZoom: 'Dimensione reale',
        zoomIn: 'Ingrandisci',
        zoomOut: 'Riduci lo zoom',
        togglefullscreen: 'Attiva/disattiva schermo intero',
        historyMenu: 'Cronologia',
        back: 'Indietro',
        forward: 'Inoltra',
        windowMenu: 'Finestra',
        minimize: 'Minimizza',
        zoom: 'Zoom',
        front: 'Porta tutto in primo piano',
        helpMenu: 'Aiuto',
        learnMore: 'Scopri di più',
        documentation: 'Documentazione',
        communityDiscussions: 'Discussioni della Comunità',
        searchIssues: 'Cerca Problemi',
    },
    historyMenu: {
        forward: 'Inoltra',
        back: 'Indietro',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Aggiornamento disponibile',
            message: function (_a) {
                var isSilentUpdating = _a.isSilentUpdating;
                return "La nuova versione sar\u00E0 disponibile a breve.".concat(!isSilentUpdating ? "Ti avviseremo quando saremo pronti per l'aggiornamento." : '');
            },
            soundsGood: 'Sembra buono',
        },
        notAvailable: {
            title: 'Aggiornamento non disponibile',
            message: 'Non ci sono aggiornamenti disponibili al momento. Si prega di ricontrollare più tardi!',
            okay: 'Okay',
        },
        error: {
            title: 'Aggiornamento del controllo fallito',
            message: "Non siamo riusciti a verificare la presenza di un aggiornamento. Riprova tra un po'.",
        },
    },
    report: {
        newReport: {
            createReport: 'Crea rapporto',
            chooseWorkspace: "Scegli un'area di lavoro per questo report.",
        },
        genericCreateReportFailureMessage: 'Errore imprevisto durante la creazione di questa chat. Si prega di riprovare più tardi.',
        genericAddCommentFailureMessage: 'Errore imprevisto durante la pubblicazione del commento. Per favore riprova più tardi.',
        genericUpdateReportFieldFailureMessage: "Errore imprevisto durante l'aggiornamento del campo. Si prega di riprovare più tardi.",
        genericUpdateReportNameEditFailureMessage: 'Errore imprevisto durante la rinomina del rapporto. Per favore riprova più tardi.',
        noActivityYet: 'Nessuna attività ancora',
        actions: {
            type: {
                changeField: function (_a) {
                    var oldValue = _a.oldValue, newValue = _a.newValue, fieldName = _a.fieldName;
                    return "modificato ".concat(fieldName, " da ").concat(oldValue, " a ").concat(newValue);
                },
                changeFieldEmpty: function (_a) {
                    var newValue = _a.newValue, fieldName = _a.fieldName;
                    return "modificato ".concat(fieldName, " in ").concat(newValue);
                },
                changeReportPolicy: function (_a) {
                    var fromPolicyName = _a.fromPolicyName, toPolicyName = _a.toPolicyName;
                    return "cambiato l'area di lavoro in ".concat(toPolicyName).concat(fromPolicyName ? "(in precedenza ".concat(fromPolicyName, ")") : '');
                },
                changeType: function (_a) {
                    var oldType = _a.oldType, newType = _a.newType;
                    return "cambiato tipo da ".concat(oldType, " a ").concat(newType);
                },
                delegateSubmit: function (_a) {
                    var delegateUser = _a.delegateUser, originalManager = _a.originalManager;
                    return "inviato questo rapporto a ".concat(delegateUser, " poich\u00E9 ").concat(originalManager, " \u00E8 in vacanza");
                },
                exportedToCSV: "esportato in CSV",
                exportedToIntegration: {
                    automatic: function (_a) {
                        var label = _a.label;
                        return "esportato in ".concat(label);
                    },
                    automaticActionOne: function (_a) {
                        var label = _a.label;
                        return "esportato su ".concat(label, " tramite");
                    },
                    automaticActionTwo: 'impostazioni contabili',
                    manual: function (_a) {
                        var label = _a.label;
                        return "ha contrassegnato questo report come esportato manualmente su ".concat(label, ".");
                    },
                    automaticActionThree: 'e creato con successo un record per',
                    reimburseableLink: 'spese personali',
                    nonReimbursableLink: 'spese con carta aziendale',
                    pending: function (_a) {
                        var label = _a.label;
                        return "iniziato a esportare questo report su ".concat(label, "...");
                    },
                },
                integrationsMessage: function (_a) {
                    var errorMessage = _a.errorMessage, label = _a.label, linkText = _a.linkText, linkURL = _a.linkURL;
                    return "impossibile esportare questo report su ".concat(label, " (\"").concat(errorMessage, " ").concat(linkText ? "<a href=\"".concat(linkURL, "\">").concat(linkText, "</a>") : '', "\")");
                },
                managerAttachReceipt: "ha aggiunto una ricevuta",
                managerDetachReceipt: "rimosso una ricevuta",
                markedReimbursed: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "pagato ".concat(currency).concat(amount, " altrove");
                },
                markedReimbursedFromIntegration: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "pagato ".concat(currency).concat(amount, " tramite integrazione");
                },
                outdatedBankAccount: "impossibile elaborare il pagamento a causa di un problema con il conto bancario del pagatore",
                reimbursementACHBounce: "impossibile elaborare il pagamento, poich\u00E9 il pagatore non ha fondi sufficienti",
                reimbursementACHCancelled: "annullato il pagamento",
                reimbursementAccountChanged: "non \u00E8 stato possibile elaborare il pagamento, poich\u00E9 il pagatore ha cambiato conto bancario",
                reimbursementDelayed: "elaborato il pagamento ma \u00E8 in ritardo di 1-2 giorni lavorativi in pi\u00F9",
                selectedForRandomAudit: "selezionato casualmente per la revisione",
                selectedForRandomAuditMarkdown: "[selezionato casualmente](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) per revisione",
                share: function (_a) {
                    var to = _a.to;
                    return "membro invitato ".concat(to);
                },
                unshare: function (_a) {
                    var to = _a.to;
                    return "membro rimosso ".concat(to);
                },
                stripePaid: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "pagato ".concat(currency).concat(amount);
                },
                takeControl: "ha preso il controllo",
                integrationSyncFailed: function (_a) {
                    var label = _a.label, errorMessage = _a.errorMessage, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "Si \u00E8 verificato un problema durante la sincronizzazione con ".concat(label).concat(errorMessage ? " (\"".concat(errorMessage, "\")") : '', ". Risolvi il problema nelle <a href=\"").concat(workspaceAccountingLink, "\">impostazioni dello spazio di lavoro</a>.");
                },
                addEmployee: function (_a) {
                    var email = _a.email, role = _a.role;
                    return "aggiunto ".concat(email, " come ").concat(role === 'member' ? 'a' : 'un/una (depending on the context)', " ").concat(role);
                },
                updateRole: function (_a) {
                    var email = _a.email, currentRole = _a.currentRole, newRole = _a.newRole;
                    return "ha aggiornato il ruolo di ".concat(email, " a ").concat(newRole, " (precedentemente ").concat(currentRole, ")");
                },
                updatedCustomField1: function (_a) {
                    var email = _a.email, previousValue = _a.previousValue, newValue = _a.newValue;
                    if (!newValue) {
                        return "rimosso il campo personalizzato 1 di ".concat(email, " (precedentemente \"").concat(previousValue, "\")");
                    }
                    return !previousValue
                        ? "aggiunto \"".concat(newValue, "\" al campo personalizzato 1 di ").concat(email)
                        : "ha cambiato il campo personalizzato 1 di ".concat(email, " in \"").concat(newValue, "\" (precedentemente \"").concat(previousValue, "\")");
                },
                updatedCustomField2: function (_a) {
                    var email = _a.email, previousValue = _a.previousValue, newValue = _a.newValue;
                    if (!newValue) {
                        return "rimosso il campo personalizzato 2 di ".concat(email, " (precedentemente \"").concat(previousValue, "\")");
                    }
                    return !previousValue
                        ? "aggiunto \"".concat(newValue, "\" al campo personalizzato 2 di ").concat(email)
                        : "ha cambiato il campo personalizzato 2 di ".concat(email, " in \"").concat(newValue, "\" (precedentemente \"").concat(previousValue, "\")");
                },
                leftWorkspace: function (_a) {
                    var nameOrEmail = _a.nameOrEmail;
                    return "".concat(nameOrEmail, " ha lasciato lo spazio di lavoro");
                },
                removeMember: function (_a) {
                    var email = _a.email, role = _a.role;
                    return "rimosso ".concat(role, " ").concat(email);
                },
                removedConnection: function (_a) {
                    var connectionName = _a.connectionName;
                    return "rimosso il collegamento a ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
                },
                addedConnection: function (_a) {
                    var connectionName = _a.connectionName;
                    return "connesso a ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
                },
                leftTheChat: 'ha lasciato la chat',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: function (_a) {
            var summary = _a.summary, dayCount = _a.dayCount, date = _a.date;
            return "".concat(summary, " per ").concat(dayCount, " ").concat(dayCount === 1 ? 'giorno' : 'giorni', " fino al ").concat(date);
        },
        oooEventSummaryPartialDay: function (_a) {
            var summary = _a.summary, timePeriod = _a.timePeriod, date = _a.date;
            return "".concat(summary, " da ").concat(timePeriod, " il ").concat(date);
        },
    },
    footer: {
        features: 'Caratteristiche',
        expenseManagement: 'Gestione delle spese',
        spendManagement: 'Gestione delle Spese',
        expenseReports: 'Report di spesa',
        companyCreditCard: 'Carta di Credito Aziendale',
        receiptScanningApp: 'App di scansione ricevute',
        billPay: 'Bill Pay',
        invoicing: 'Fatturazione',
        CPACard: 'Carta CPA',
        payroll: 'Payroll',
        travel: 'Viaggio',
        resources: 'Risorse',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Press Kit',
        support: 'Supporto',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Termini di Servizio',
        privacy: 'Privacy',
        learnMore: 'Scopri di più',
        aboutExpensify: 'Informazioni su Expensify',
        blog: 'Blog',
        jobs: 'Lavori',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Investor Relations',
        getStarted: 'Inizia',
        createAccount: 'Crea un nuovo account',
        logIn: 'Accedi',
    },
    allStates: expensify_common_1.CONST.STATES,
    allCountries: CONST_1.default.ALL_COUNTRIES,
    accessibilityHints: {
        navigateToChatsList: "Torna all'elenco delle chat",
        chatWelcomeMessage: 'Messaggio di benvenuto in chat',
        navigatesToChat: 'Naviga a una chat',
        newMessageLineIndicator: 'Indicatore di nuova linea di messaggio',
        chatMessage: 'Messaggio di chat',
        lastChatMessagePreview: "Anteprima dell'ultimo messaggio della chat",
        workspaceName: 'Nome del workspace',
        chatUserDisplayNames: 'Nomi visualizzati dei membri della chat',
        scrollToNewestMessages: 'Scorri ai messaggi più recenti',
        preStyledText: 'Testo pre-stilizzato',
        viewAttachment: 'Visualizza allegato',
    },
    parentReportAction: {
        deletedReport: 'Rapporto eliminato',
        deletedMessage: 'Messaggio eliminato',
        deletedExpense: 'Spesa eliminata',
        reversedTransaction: 'Transazione annullata',
        deletedTask: 'Attività eliminata',
        hiddenMessage: 'Messaggio nascosto',
    },
    threads: {
        thread: 'Discussione',
        replies: 'Risposte',
        reply: 'Rispondi',
        from: 'Da',
        in: 'in',
        parentNavigationSummary: function (_a) {
            var reportName = _a.reportName, workspaceName = _a.workspaceName;
            return "Da ".concat(reportName).concat(workspaceName ? "in ".concat(workspaceName) : '');
        },
    },
    qrCodes: {
        copy: 'Copia URL',
        copied: 'Copiato!',
    },
    moderation: {
        flagDescription: 'Tutti i messaggi contrassegnati saranno inviati a un moderatore per la revisione.',
        chooseAReason: 'Scegli un motivo per segnalare qui sotto:',
        spam: 'Spam',
        spamDescription: 'Promozione non richiesta fuori tema',
        inconsiderate: 'Sconsiderato',
        inconsiderateDescription: 'Frasi offensive o irrispettose, con intenzioni discutibili',
        intimidation: 'Intimidazione',
        intimidationDescription: "Perseguire aggressivamente un'agenda nonostante obiezioni valide",
        bullying: 'Bullismo',
        bullyingDescription: 'Prendere di mira un individuo per ottenere obbedienza',
        harassment: 'Molestia',
        harassmentDescription: 'Comportamento razzista, misogino o altrimenti ampiamente discriminatorio',
        assault: 'Aggressione',
        assaultDescription: "Attacco emotivo mirato specificamente con l'intenzione di nuocere",
        flaggedContent: 'Questo messaggio è stato segnalato per violazione delle nostre regole della comunità e il contenuto è stato nascosto.',
        hideMessage: 'Nascondi messaggio',
        revealMessage: 'Rivela messaggio',
        levelOneResult: 'Invia un avviso anonimo e il messaggio viene segnalato per la revisione.',
        levelTwoResult: 'Messaggio nascosto dal canale, più avviso anonimo e il messaggio è segnalato per revisione.',
        levelThreeResult: 'Messaggio rimosso dal canale più avviso anonimo e messaggio segnalato per revisione.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Invitali',
        nothing: 'Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Accetta',
        decline: 'Rifiuta',
    },
    actionableMentionTrackExpense: {
        submit: 'Invialo a qualcuno',
        categorize: 'Categorizzalo',
        share: 'Condividilo con il mio commercialista',
        nothing: 'Niente per ora',
    },
    teachersUnitePage: {
        teachersUnite: 'Insegnanti Uniti',
        joinExpensifyOrg: 'Unisciti a Expensify.org nell\'eliminare le ingiustizie nel mondo. L\'attuale campagna "Teachers Unite" supporta gli educatori ovunque dividendo i costi dei materiali scolastici essenziali.',
        iKnowATeacher: 'Conosco un insegnante',
        iAmATeacher: 'Sono un insegnante',
        getInTouch: 'Eccellente! Per favore condividi le loro informazioni così possiamo metterci in contatto con loro.',
        introSchoolPrincipal: 'Introduzione al tuo preside',
        schoolPrincipalVerifyExpense: "Expensify.org divide il costo dei materiali scolastici essenziali affinché gli studenti provenienti da famiglie a basso reddito possano avere un'esperienza di apprendimento migliore. Il tuo preside sarà invitato a verificare le tue spese.",
        principalFirstName: 'Nome principale',
        principalLastName: 'Cognome del preside',
        principalWorkEmail: 'Email di lavoro principale',
        updateYourEmail: 'Aggiorna il tuo indirizzo email',
        updateEmail: 'Aggiorna indirizzo email',
        schoolMailAsDefault: function (_a) {
            var contactMethodsRoute = _a.contactMethodsRoute;
            return "Prima di procedere, assicurati di impostare la tua email scolastica come metodo di contatto predefinito. Puoi farlo in Impostazioni > Profilo > <a href=\"".concat(contactMethodsRoute, "\">Metodi di contatto</a>.");
        },
        error: {
            enterPhoneEmail: "Inserisci un'email o un numero di telefono valido",
            enterEmail: "Inserisci un'email",
            enterValidEmail: "Inserisci un'email valida",
            tryDifferentEmail: "Per favore, prova un'email diversa",
        },
    },
    cardTransactions: {
        notActivated: 'Non attivato',
        outOfPocket: 'Spese personali',
        companySpend: 'Spese aziendali',
    },
    distance: {
        addStop: 'Aggiungi fermata',
        deleteWaypoint: 'Elimina waypoint',
        deleteWaypointConfirmation: 'Sei sicuro di voler eliminare questo punto di passaggio?',
        address: 'Indirizzo',
        waypointDescription: {
            start: 'Inizia',
            stop: 'Ferma',
        },
        mapPending: {
            title: 'Mappa in sospeso',
            subtitle: 'La mappa verrà generata quando torni online',
            onlineSubtitle: 'Un momento mentre configuriamo la mappa',
            errorTitle: 'Errore della mappa',
            errorSubtitle: 'Si è verificato un errore durante il caricamento della mappa. Per favore riprova.',
        },
        error: {
            selectSuggestedAddress: 'Seleziona un indirizzo suggerito o usa la posizione attuale',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Pagella persa o danneggiata',
        nextButtonLabel: 'Successivo',
        reasonTitle: 'Perché hai bisogno di una nuova carta?',
        cardDamaged: 'La mia carta è stata danneggiata',
        cardLostOrStolen: 'La mia carta è stata persa o rubata',
        confirmAddressTitle: "Conferma l'indirizzo di spedizione per la tua nuova carta.",
        cardDamagedInfo: 'La tua nuova carta arriverà in 2-3 giorni lavorativi. La tua carta attuale continuerà a funzionare fino a quando non attiverai quella nuova.',
        cardLostOrStolenInfo: "La tua carta attuale verrà disattivata permanentemente non appena l'ordine sarà effettuato. La maggior parte delle carte arriva in pochi giorni lavorativi.",
        address: 'Indirizzo',
        deactivateCardButton: 'Disattiva carta',
        shipNewCardButton: 'Spedisci nuova carta',
        addressError: 'Indirizzo richiesto',
        successTitle: 'La tua nuova carta è in arrivo!',
        successDescription: "Dovrai attivarla quando arriverà tra pochi giorni lavorativi. Nel frattempo, la tua carta virtuale è pronta all'uso.",
        reasonError: 'Il motivo è obbligatorio',
    },
    eReceipt: {
        guaranteed: 'eReceipt garantito',
        transactionDate: 'Data della transazione',
    },
    referralProgram: (_8 = {},
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT] = {
            buttonText1: 'Avvia una chat,',
            buttonText2: 'consiglia un amico.',
            header: 'Inizia una chat, invita un amico',
            body: 'Vuoi che i tuoi amici usino Expensify, anche loro? Inizia una chat con loro e ci occuperemo del resto.',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE] = {
            buttonText1: 'Invia una spesa,',
            buttonText2: 'riferisci il tuo capo.',
            header: 'Invia una spesa, riferisci al tuo capo',
            body: 'Vuoi che anche il tuo capo usi Expensify? Basta inviare loro una spesa e ci occuperemo del resto.',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND] = {
            header: 'Segnala un amico',
            body: 'Vuoi che anche i tuoi amici usino Expensify? Basta chattare, pagare o dividere una spesa con loro e ci occuperemo noi del resto. Oppure condividi semplicemente il tuo link di invito!',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE] = {
            buttonText: 'Segnala un amico',
            header: 'Segnala un amico',
            body: 'Vuoi che anche i tuoi amici usino Expensify? Basta chattare, pagare o dividere una spesa con loro e ci occuperemo noi del resto. Oppure condividi semplicemente il tuo link di invito!',
        },
        _8.copyReferralLink = 'Copia il link di invito',
        _8),
    systemChatFooterMessage: (_9 = {},
        _9[CONST_1.default.INTRO_CHOICES.MANAGE_TEAM] = {
            phrase1: 'Chatta con il tuo specialista di configurazione in',
            phrase2: 'per assistenza',
        },
        _9.default = {
            phrase1: 'Messaggio',
            phrase2: 'per assistenza con la configurazione',
        },
        _9),
    violations: {
        allTagLevelsRequired: 'Tutti i tag richiesti',
        autoReportedRejectedExpense: function (_a) {
            var rejectReason = _a.rejectReason, rejectedBy = _a.rejectedBy;
            return "".concat(rejectedBy, " ha rifiutato questa spesa con il commento \"").concat(rejectReason, "\"");
        },
        billableExpense: 'Fatturabile non più valido',
        cashExpenseWithNoReceipt: function (_a) {
            var _b = _a === void 0 ? {} : _a, formattedLimit = _b.formattedLimit;
            return "Receipt required".concat(formattedLimit ? "oltre ".concat(formattedLimit) : '');
        },
        categoryOutOfPolicy: 'Categoria non più valida',
        conversionSurcharge: function (_a) {
            var surcharge = _a.surcharge;
            return "Applicata una maggiorazione di conversione del ".concat(surcharge, "%");
        },
        customUnitOutOfPolicy: 'Tariffa non valida per questo spazio di lavoro',
        duplicatedTransaction: 'Duplicato',
        fieldRequired: 'I campi del report sono obbligatori',
        futureDate: 'Data futura non consentita',
        invoiceMarkup: function (_a) {
            var invoiceMarkup = _a.invoiceMarkup;
            return "Contrassegnato con un aumento del ".concat(invoiceMarkup, "%");
        },
        maxAge: function (_a) {
            var maxAge = _a.maxAge;
            return "Data pi\u00F9 vecchia di ".concat(maxAge, " giorni");
        },
        missingCategory: 'Categoria mancante',
        missingComment: 'Descrizione richiesta per la categoria selezionata',
        missingTag: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "Missing ".concat(tagName !== null && tagName !== void 0 ? tagName : 'tag');
        },
        modifiedAmount: function (_a) {
            var type = _a.type, displayPercentVariance = _a.displayPercentVariance;
            switch (type) {
                case 'distance':
                    return "L'importo differisce dalla distanza calcolata";
                case 'card':
                    return 'Importo superiore alla transazione con carta';
                default:
                    if (displayPercentVariance) {
                        return "Importo ".concat(displayPercentVariance, "% superiore alla ricevuta scansionata");
                    }
                    return 'Importo superiore alla ricevuta scansionata';
            }
        },
        modifiedDate: 'La data differisce dalla ricevuta scansionata',
        nonExpensiworksExpense: 'Spesa non-Expensiworks',
        overAutoApprovalLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "La spesa supera il limite di approvazione automatica di ".concat(formattedLimit);
        },
        overCategoryLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Importo superiore al limite di categoria di ".concat(formattedLimit, "/persona");
        },
        overLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Importo oltre il limite di ".concat(formattedLimit, "/persona");
        },
        overLimitAttendee: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Importo oltre il limite di ".concat(formattedLimit, "/persona");
        },
        perDayLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Importo oltre il limite giornaliero ".concat(formattedLimit, "/persona per categoria");
        },
        receiptNotSmartScanned: 'Dettagli della spesa e ricevuta aggiunti manualmente. Si prega di verificare i dettagli. <a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">Scopri di più</a> sulla verifica automatica di tutte le ricevute.',
        receiptRequired: function (_a) {
            var formattedLimit = _a.formattedLimit, category = _a.category;
            var message = 'Ricevuta richiesta';
            if (formattedLimit !== null && formattedLimit !== void 0 ? formattedLimit : category) {
                message += 'oltre';
                if (formattedLimit) {
                    message += " ".concat(formattedLimit);
                }
                if (category) {
                    message += 'limite categoria';
                }
            }
            return message;
        },
        prohibitedExpense: function (_a) {
            var prohibitedExpenseType = _a.prohibitedExpenseType;
            var preMessage = 'Spesa vietata:';
            switch (prohibitedExpenseType) {
                case 'alcohol':
                    return "".concat(preMessage, " alcol");
                case 'gambling':
                    return "".concat(preMessage, " gioco d'azzardo");
                case 'tobacco':
                    return "".concat(preMessage, " tabacco");
                case 'adultEntertainment':
                    return "".concat(preMessage, " intrattenimento per adulti");
                case 'hotelIncidentals':
                    return "".concat(preMessage, " spese accessorie dell'hotel");
                default:
                    return "".concat(preMessage).concat(prohibitedExpenseType);
            }
        },
        customRules: function (_a) {
            var message = _a.message;
            return message;
        },
        reviewRequired: 'Revisione richiesta',
        rter: function (_a) {
            var brokenBankConnection = _a.brokenBankConnection, email = _a.email, isAdmin = _a.isAdmin, isTransactionOlderThan7Days = _a.isTransactionOlderThan7Days, member = _a.member, rterType = _a.rterType;
            if (rterType === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Impossibile associare automaticamente la ricevuta a causa di una connessione bancaria interrotta.';
            }
            if (brokenBankConnection || rterType === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? "Impossibile abbinare automaticamente la ricevuta a causa di una connessione bancaria interrotta che ".concat(email, " deve risolvere.")
                    : 'Impossibile abbinare automaticamente la ricevuta a causa di una connessione bancaria interrotta che devi risolvere.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? "Chiedi a ".concat(member, " di contrassegnarlo come contante o attendi 7 giorni e riprova") : 'In attesa di unione con la transazione della carta.';
            }
            return '';
        },
        brokenConnection530Error: 'Ricevuta in sospeso a causa di una connessione bancaria interrotta',
        adminBrokenConnectionError: 'Ricevuta in sospeso a causa di una connessione bancaria interrotta. Si prega di risolvere in',
        memberBrokenConnectionError: 'Ricevuta in sospeso a causa di una connessione bancaria interrotta. Si prega di chiedere a un amministratore dello spazio di lavoro di risolvere.',
        markAsCashToIgnore: 'Segna come contante per ignorare e richiedere il pagamento.',
        smartscanFailed: function (_a) {
            var _b = _a.canEdit, canEdit = _b === void 0 ? true : _b;
            return "Scansione della ricevuta fallita.".concat(canEdit ? 'Inserisci i dettagli manualmente.' : '');
        },
        receiptGeneratedWithAI: "Ricevuta potenzialmente generata dall'IA",
        someTagLevelsRequired: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "Missing ".concat(tagName !== null && tagName !== void 0 ? tagName : 'Etichetta');
        },
        tagOutOfPolicy: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "".concat(tagName !== null && tagName !== void 0 ? tagName : 'Etichetta', " non pi\u00F9 valido");
        },
        taxAmountChanged: "L'importo fiscale è stato modificato",
        taxOutOfPolicy: function (_a) {
            var _b = _a === void 0 ? {} : _a, taxName = _b.taxName;
            return "".concat(taxName !== null && taxName !== void 0 ? taxName : 'Tassa', " non pi\u00F9 valido");
        },
        taxRateChanged: "L'aliquota fiscale è stata modificata",
        taxRequired: 'Aliquota fiscale mancante',
        none: 'Nessuno',
        taxCodeToKeep: 'Scegli quale codice fiscale mantenere',
        tagToKeep: 'Scegli quale tag mantenere',
        isTransactionReimbursable: 'Scegli se la transazione è rimborsabile',
        merchantToKeep: 'Scegli quale commerciante mantenere',
        descriptionToKeep: 'Scegli quale descrizione mantenere',
        categoryToKeep: 'Scegli quale categoria mantenere',
        isTransactionBillable: 'Scegli se la transazione è fatturabile',
        keepThisOne: 'Mantieni questo',
        confirmDetails: "Conferma i dettagli che stai conservando",
        confirmDuplicatesInfo: "Le richieste duplicate che non conservi saranno tenute in attesa che il membro le elimini.",
        hold: 'Questa spesa è stata messa in sospeso',
        resolvedDuplicates: 'risolto il duplicato',
    },
    reportViolations: (_10 = {},
        _10[CONST_1.default.REPORT_VIOLATIONS.FIELD_REQUIRED] = function (_a) {
            var fieldName = _a.fieldName;
            return "".concat(fieldName, " \u00E8 obbligatorio");
        },
        _10),
    violationDismissal: {
        rter: {
            manual: 'ha contrassegnato questa ricevuta come contante',
        },
        duplicatedTransaction: {
            manual: 'risolto il duplicato',
        },
    },
    videoPlayer: {
        play: 'Gioca',
        pause: 'Pausa',
        fullscreen: 'Schermo intero',
        playbackSpeed: 'Velocità di riproduzione',
        expand: 'Espandi',
        mute: 'Disattiva audio',
        unmute: "Riattiva l'audio",
        normal: 'Normale',
    },
    exitSurvey: {
        header: 'Prima di andare',
        reasonPage: {
            title: 'Per favore, dicci perché te ne vai',
            subtitle: 'Prima di andare, per favore dicci perché vorresti passare a Expensify Classic.',
        },
        reasons: (_11 = {},
            _11[CONST_1.default.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE] = 'Ho bisogno di una funzionalità disponibile solo in Expensify Classic.',
            _11[CONST_1.default.EXIT_SURVEY.REASONS.DONT_UNDERSTAND] = 'Non capisco come usare New Expensify.',
            _11[CONST_1.default.EXIT_SURVEY.REASONS.PREFER_CLASSIC] = 'Capisco come utilizzare New Expensify, ma preferisco Expensify Classic.',
            _11),
        prompts: (_12 = {},
            _12[CONST_1.default.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE] = 'Quale funzionalità ti serve che non è disponibile nel nuovo Expensify?',
            _12[CONST_1.default.EXIT_SURVEY.REASONS.DONT_UNDERSTAND] = 'Cosa stai cercando di fare?',
            _12[CONST_1.default.EXIT_SURVEY.REASONS.PREFER_CLASSIC] = 'Perché preferisci Expensify Classic?',
            _12),
        responsePlaceholder: 'La tua risposta',
        thankYou: 'Grazie per il feedback!',
        thankYouSubtitle: 'Le tue risposte ci aiuteranno a costruire un prodotto migliore per portare a termine le cose. Grazie mille!',
        goToExpensifyClassic: 'Passa a Expensify Classic',
        offlineTitle: 'Sembra che tu sia bloccato qui...',
        offline: 'Sembra che tu sia offline. Purtroppo, Expensify Classic non funziona offline, ma il Nuovo Expensify sì. Se preferisci usare Expensify Classic, riprova quando hai una connessione internet.',
        quickTip: 'Suggerimento rapido...',
        quickTipSubTitle: 'Puoi andare direttamente a Expensify Classic visitando expensify.com. Aggiungilo ai segnalibri per un facile accesso rapido!',
        bookACall: 'Prenota una chiamata',
        noThanks: 'No grazie',
        bookACallTitle: 'Vuoi parlare con un product manager?',
        benefits: (_13 = {},
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY] = 'Chattare direttamente su spese e report',
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE] = 'Possibilità di fare tutto su mobile',
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE] = 'Viaggia e gestisci le spese alla velocità della chat',
            _13),
        bookACallTextTop: 'Passando a Expensify Classic, ti perderai:',
        bookACallTextBottom: 'Saremmo entusiasti di fare una chiamata con te per capire il motivo. Puoi prenotare una chiamata con uno dei nostri senior product manager per discutere le tue esigenze.',
        takeMeToExpensifyClassic: 'Portami a Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Si è verificato un errore durante il caricamento di altri messaggi',
        tryAgain: 'Riprova',
    },
    systemMessage: {
        mergedWithCashTransaction: 'abbinato una ricevuta a questa transazione',
    },
    subscription: {
        authenticatePaymentCard: 'Autentica carta di pagamento',
        mobileReducedFunctionalityMessage: "Non puoi apportare modifiche al tuo abbonamento nell'app mobile.",
        badge: {
            freeTrial: function (_a) {
                var numOfDays = _a.numOfDays;
                return "Prova gratuita: ".concat(numOfDays, " ").concat(numOfDays === 1 ? 'giorno' : 'giorni', " rimasti");
            },
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Le tue informazioni di pagamento sono obsolete',
                subtitle: function (_a) {
                    var date = _a.date;
                    return "Aggiorna la tua carta di pagamento entro il ".concat(date, " per continuare a utilizzare tutte le tue funzionalit\u00E0 preferite.");
                },
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Il tuo pagamento non può essere elaborato.',
                subtitle: function (_a) {
                    var date = _a.date, purchaseAmountOwed = _a.purchaseAmountOwed;
                    return date && purchaseAmountOwed
                        ? "Il tuo addebito del ".concat(date, " di ").concat(purchaseAmountOwed, " non \u00E8 stato elaborato. Si prega di aggiungere una carta di pagamento per saldare l'importo dovuto.")
                        : "Si prega di aggiungere una carta di pagamento per saldare l'importo dovuto.";
                },
            },
            policyOwnerUnderInvoicing: {
                title: 'Le tue informazioni di pagamento sono obsolete',
                subtitle: function (_a) {
                    var date = _a.date;
                    return "Il tuo pagamento \u00E8 in ritardo. Ti preghiamo di pagare la tua fattura entro il ".concat(date, " per evitare l'interruzione del servizio.");
                },
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Le tue informazioni di pagamento sono obsolete',
                subtitle: 'Il tuo pagamento è in ritardo. Si prega di pagare la fattura.',
            },
            billingDisputePending: {
                title: 'La tua carta non può essere addebitata',
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed, cardEnding = _a.cardEnding;
                    return "Hai contestato l'addebito di ".concat(amountOwed, " sulla carta che termina con ").concat(cardEnding, ". Il tuo account sar\u00E0 bloccato fino a quando la disputa non sar\u00E0 risolta con la tua banca.");
                },
            },
            cardAuthenticationRequired: {
                title: 'La tua carta non può essere addebitata',
                subtitle: function (_a) {
                    var cardEnding = _a.cardEnding;
                    return "La tua carta di pagamento non \u00E8 stata completamente autenticata. Completa il processo di autenticazione per attivare la tua carta di pagamento che termina con ".concat(cardEnding, ".");
                },
            },
            insufficientFunds: {
                title: 'La tua carta non può essere addebitata',
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed;
                    return "La tua carta di pagamento \u00E8 stata rifiutata a causa di fondi insufficienti. Riprova o aggiungi una nuova carta di pagamento per saldare il tuo saldo in sospeso di ".concat(amountOwed, ".");
                },
            },
            cardExpired: {
                title: 'La tua carta non può essere addebitata',
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed;
                    return "La tua carta di pagamento \u00E8 scaduta. Aggiungi una nuova carta di pagamento per saldare il tuo saldo in sospeso di ".concat(amountOwed, ".");
                },
            },
            cardExpireSoon: {
                title: 'La tua carta sta per scadere presto',
                subtitle: 'La tua carta di pagamento scadrà alla fine di questo mese. Clicca sul menu a tre punti qui sotto per aggiornarla e continuare a utilizzare tutte le tue funzionalità preferite.',
            },
            retryBillingSuccess: {
                title: 'Successo!',
                subtitle: 'La tua carta è stata addebitata con successo.',
            },
            retryBillingError: {
                title: 'La tua carta non può essere addebitata',
                subtitle: "Prima di riprovare, chiama direttamente la tua banca per autorizzare gli addebiti di Expensify e rimuovere eventuali blocchi. Altrimenti, prova ad aggiungere un'altra carta di pagamento.",
            },
            cardOnDispute: function (_a) {
                var amountOwed = _a.amountOwed, cardEnding = _a.cardEnding;
                return "Hai contestato l'addebito di ".concat(amountOwed, " sulla carta che termina con ").concat(cardEnding, ". Il tuo account sar\u00E0 bloccato fino a quando la disputa non sar\u00E0 risolta con la tua banca.");
            },
            preTrial: {
                title: 'Inizia una prova gratuita',
                subtitleStart: 'Come passo successivo,',
                subtitleLink: 'completa la tua lista di controllo per la configurazione',
                subtitleEnd: 'così il tuo team può iniziare a registrare le spese.',
            },
            trialStarted: {
                title: function (_a) {
                    var numOfDays = _a.numOfDays;
                    return "Prova: ".concat(numOfDays, " ").concat(numOfDays === 1 ? 'giorno' : 'giorni', " rimasti!");
                },
                subtitle: 'Aggiungi una carta di pagamento per continuare a utilizzare tutte le tue funzionalità preferite.',
            },
            trialEnded: {
                title: 'Il tuo periodo di prova gratuito è terminato',
                subtitle: 'Aggiungi una carta di pagamento per continuare a utilizzare tutte le tue funzionalità preferite.',
            },
            earlyDiscount: {
                claimOffer: 'Richiedi offerta',
                noThanks: 'No grazie',
                subscriptionPageTitle: function (_a) {
                    var discountType = _a.discountType;
                    return "<strong>".concat(discountType, "% di sconto sul tuo primo anno!</strong> Basta aggiungere una carta di pagamento e iniziare un abbonamento annuale.");
                },
                onboardingChatTitle: function (_a) {
                    var discountType = _a.discountType;
                    return "Offerta a tempo limitato: ".concat(discountType, "% di sconto sul tuo primo anno!");
                },
                subtitle: function (_a) {
                    var days = _a.days, hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds;
                    return "Richiedi entro ".concat(days > 0 ? "".concat(days, "g :") : '').concat(hours, "h : ").concat(minutes, "m : ").concat(seconds, "s");
                },
            },
        },
        cardSection: {
            title: 'Pagamento',
            subtitle: 'Aggiungi una carta per pagare il tuo abbonamento Expensify.',
            addCardButton: 'Aggiungi carta di pagamento',
            cardNextPayment: function (_a) {
                var nextPaymentDate = _a.nextPaymentDate;
                return "La tua prossima data di pagamento \u00E8 ".concat(nextPaymentDate, ".");
            },
            cardEnding: function (_a) {
                var cardNumber = _a.cardNumber;
                return "Carta che termina con ".concat(cardNumber);
            },
            cardInfo: function (_a) {
                var name = _a.name, expiration = _a.expiration, currency = _a.currency;
                return "Nome: ".concat(name, ", Scadenza: ").concat(expiration, ", Valuta: ").concat(currency);
            },
            changeCard: 'Cambia carta di pagamento',
            changeCurrency: 'Cambia la valuta di pagamento',
            cardNotFound: 'Nessuna carta di pagamento aggiunta',
            retryPaymentButton: 'Riprova pagamento',
            authenticatePayment: 'Autentica pagamento',
            requestRefund: 'Richiedi rimborso',
            requestRefundModal: {
                full: "Ottenere un rimborso è facile, basta declassare il tuo account prima della prossima data di fatturazione e riceverai un rimborso. <br /> <br /> Attenzione: il downgrade del tuo account comporta l'eliminazione del/dei tuo/i spazio/i di lavoro. Questa azione non può essere annullata, ma puoi sempre creare un nuovo spazio di lavoro se cambi idea.",
                confirm: 'Elimina workspace e declassa',
            },
            viewPaymentHistory: 'Visualizza cronologia dei pagamenti',
        },
        yourPlan: {
            title: 'Il tuo piano',
            exploreAllPlans: 'Esplora tutti i piani',
            customPricing: 'Prezzi personalizzati',
            asLowAs: function (_a) {
                var price = _a.price;
                return "a partire da ".concat(price, " per membro attivo/mese");
            },
            pricePerMemberMonth: function (_a) {
                var price = _a.price;
                return "".concat(price, " per membro/mese");
            },
            pricePerMemberPerMonth: function (_a) {
                var price = _a.price;
                return "".concat(price, " per membro al mese");
            },
            perMemberMonth: 'per membro/mese',
            collect: {
                title: 'Raccogliere',
                description: 'Il piano per piccole imprese che ti offre spese, viaggi e chat.',
                priceAnnual: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "Da ".concat(lower, "/membro attivo con la Expensify Card, ").concat(upper, "/membro attivo senza la Expensify Card.");
                },
                pricePayPerUse: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "Da ".concat(lower, "/membro attivo con la Expensify Card, ").concat(upper, "/membro attivo senza la Expensify Card.");
                },
                benefit1: 'Scansione delle ricevute',
                benefit2: 'Rimborsi',
                benefit3: 'Gestione delle carte aziendali',
                benefit4: 'Approvazioni di spese e viaggi',
                benefit5: 'Prenotazione di viaggi e regole',
                benefit6: 'Integrazioni QuickBooks/Xero',
                benefit7: 'Chatta su spese, rapporti e stanze',
                benefit8: 'Supporto AI e umano',
            },
            control: {
                title: 'Controllo',
                description: 'Spese, viaggi e chat per aziende più grandi.',
                priceAnnual: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "Da ".concat(lower, "/membro attivo con la Expensify Card, ").concat(upper, "/membro attivo senza la Expensify Card.");
                },
                pricePayPerUse: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "Da ".concat(lower, "/membro attivo con la Expensify Card, ").concat(upper, "/membro attivo senza la Expensify Card.");
                },
                benefit1: 'Tutto nel piano Collect',
                benefit2: 'Flussi di lavoro di approvazione multilivello',
                benefit3: 'Regole personalizzate per le spese',
                benefit4: 'Integrazioni ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integrazioni HR (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Approfondimenti e report personalizzati',
                benefit8: 'Budgeting',
            },
            thisIsYourCurrentPlan: 'Questo è il tuo piano attuale',
            downgrade: 'Effettua il downgrade a Collect',
            upgrade: 'Aggiorna a Control',
            addMembers: 'Aggiungi membri',
            saveWithExpensifyTitle: 'Risparmia con la Expensify Card',
            saveWithExpensifyDescription: 'Usa il nostro calcolatore di risparmio per vedere come il cashback dalla Expensify Card può ridurre la tua fattura Expensify.',
            saveWithExpensifyButton: 'Scopri di più',
        },
        compareModal: {
            comparePlans: 'Confronta i piani',
            unlockTheFeatures: 'Sblocca le funzionalità di cui hai bisogno con il piano giusto per te.',
            viewOurPricing: 'Visualizza la nostra pagina dei prezzi',
            forACompleteFeatureBreakdown: 'per una panoramica completa delle funzionalità di ciascuno dei nostri piani.',
        },
        details: {
            title: "Dettagli dell'abbonamento",
            annual: 'Abbonamento annuale',
            taxExempt: 'Richiedi lo stato di esenzione fiscale',
            taxExemptEnabled: 'Esente da tasse',
            taxExemptStatus: 'Stato di esenzione fiscale',
            payPerUse: 'Pagamento a consumo',
            subscriptionSize: "Dimensione dell'abbonamento",
            headsUp: "Attenzione: Se non imposti ora la dimensione del tuo abbonamento, la imposteremo automaticamente in base al numero di membri attivi del primo mese. Sarai quindi impegnato a pagare almeno questo numero di membri per i prossimi 12 mesi. Puoi aumentare la dimensione del tuo abbonamento in qualsiasi momento, ma non puoi diminuirla fino alla scadenza dell'abbonamento.",
            zeroCommitment: 'Zero impegno al tasso di abbonamento annuale scontato',
        },
        subscriptionSize: {
            title: "Dimensione dell'abbonamento",
            yourSize: 'La dimensione del tuo abbonamento è il numero di posti disponibili che possono essere occupati da qualsiasi membro attivo in un determinato mese.',
            eachMonth: 'Ogni mese, il tuo abbonamento copre fino al numero di membri attivi impostato sopra. Ogni volta che aumenti la dimensione del tuo abbonamento, inizierai un nuovo abbonamento di 12 mesi a quella nuova dimensione.',
            note: 'Nota: Un membro attivo è chiunque abbia creato, modificato, inviato, approvato, rimborsato o esportato dati di spesa legati allo spazio di lavoro della tua azienda.',
            confirmDetails: 'Conferma i dettagli del tuo nuovo abbonamento annuale:',
            subscriptionSize: "Dimensione dell'abbonamento",
            activeMembers: function (_a) {
                var size = _a.size;
                return "".concat(size, " membri attivi/mese");
            },
            subscriptionRenews: "Il rinnovo dell'abbonamento",
            youCantDowngrade: 'Non puoi effettuare il downgrade durante il tuo abbonamento annuale.',
            youAlreadyCommitted: function (_a) {
                var size = _a.size, date = _a.date;
                return "Hai gi\u00E0 sottoscritto un abbonamento annuale per ".concat(size, " membri attivi al mese fino al ").concat(date, ". Puoi passare a un abbonamento a consumo il ").concat(date, " disabilitando il rinnovo automatico.");
            },
            error: {
                size: 'Si prega di inserire una dimensione di abbonamento valida',
                sameSize: 'Inserisci un numero diverso dalla dimensione attuale del tuo abbonamento',
            },
        },
        paymentCard: {
            addPaymentCard: 'Aggiungi carta di pagamento',
            enterPaymentCardDetails: 'Inserisci i dettagli della tua carta di pagamento',
            security: "Expensify è conforme a PCI-DSS, utilizza la crittografia a livello bancario e impiega un'infrastruttura ridondante per proteggere i tuoi dati.",
            learnMoreAboutSecurity: 'Scopri di più sulla nostra sicurezza.',
        },
        subscriptionSettings: {
            title: 'Impostazioni di abbonamento',
            summary: function (_a) {
                var subscriptionType = _a.subscriptionType, subscriptionSize = _a.subscriptionSize, autoRenew = _a.autoRenew, autoIncrease = _a.autoIncrease;
                return "Tipo di abbonamento: ".concat(subscriptionType, ", Dimensione dell'abbonamento: ").concat(subscriptionSize, ", Rinnovo automatico: ").concat(autoRenew, ", Aumento automatico dei posti annuali: ").concat(autoIncrease);
            },
            none: 'nessuno',
            on: 'su',
            off: 'spento',
            annual: 'Annuale',
            autoRenew: 'Rinnovo automatico',
            autoIncrease: 'Aumento automatico dei posti annuali',
            saveUpTo: function (_a) {
                var amountWithCurrency = _a.amountWithCurrency;
                return "Risparmia fino a ".concat(amountWithCurrency, "/mese per membro attivo");
            },
            automaticallyIncrease: 'Aumenta automaticamente i tuoi posti annuali per accogliere i membri attivi che superano la dimensione del tuo abbonamento. Nota: Questo estenderà la data di fine del tuo abbonamento annuale.',
            disableAutoRenew: 'Disattiva il rinnovo automatico',
            helpUsImprove: 'Aiutaci a migliorare Expensify',
            whatsMainReason: 'Qual è il motivo principale per cui stai disabilitando il rinnovo automatico?',
            renewsOn: function (_a) {
                var date = _a.date;
                return "Rinnova il ".concat(date, ".");
            },
            pricingConfiguration: 'Il prezzo dipende dalla configurazione. Per il prezzo più basso, scegli un abbonamento annuale e ottieni la Expensify Card.',
            learnMore: {
                part1: 'Scopri di più sul nostro',
                pricingPage: 'pagina dei prezzi',
                part2: 'o chatta con il nostro team nella tua',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: 'Prezzo stimato',
            changesBasedOn: "Questo cambia in base all'uso della tua Expensify Card e alle opzioni di abbonamento qui sotto.",
        },
        requestEarlyCancellation: {
            title: 'Richiedi cancellazione anticipata',
            subtitle: 'Qual è il motivo principale per cui stai richiedendo la cancellazione anticipata?',
            subscriptionCanceled: {
                title: 'Abbonamento annullato',
                subtitle: 'Il tuo abbonamento annuale è stato annullato.',
                info: 'Se vuoi continuare a utilizzare il tuo workspace su base pay-per-use, sei a posto.',
                preventFutureActivity: {
                    part1: 'Se desideri prevenire attività e addebiti futuri, devi',
                    link: 'elimina il tuo/i tuoi spazio/i di lavoro',
                    part2: '. Si noti che quando si eliminano i propri workspace, verrà addebitata qualsiasi attività in sospeso che è stata sostenuta durante il mese di calendario corrente.',
                },
            },
            requestSubmitted: {
                title: 'Richiesta inviata',
                subtitle: {
                    part1: "Grazie per averci informato del tuo interesse a cancellare l'abbonamento. Stiamo esaminando la tua richiesta e ti contatteremo presto tramite la tua chat con",
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: "Richiedendo la cancellazione anticipata, riconosco e accetto che Expensify non ha alcun obbligo di concedere tale richiesta ai sensi di Expensify.<a href=".concat(CONST_1.default.OLD_DOT_PUBLIC_URLS.TERMS_URL, ">Termini di Servizio</a>o un altro accordo sui servizi applicabile tra me e Expensify e che Expensify mantiene la sola discrezione riguardo alla concessione di qualsiasi richiesta del genere."),
        },
    },
    feedbackSurvey: {
        tooLimited: 'La funzionalità necessita di miglioramenti',
        tooExpensive: 'Troppo costoso',
        inadequateSupport: 'Supporto clienti inadeguato',
        businessClosing: "Chiusura, ridimensionamento o acquisizione dell'azienda",
        additionalInfoTitle: 'A quale software ti stai trasferendo e perché?',
        additionalInfoInputLabel: 'La tua risposta',
    },
    roomChangeLog: {
        updateRoomDescription: 'imposta la descrizione della stanza su:',
        clearRoomDescription: 'cancellato la descrizione della stanza',
    },
    delegate: {
        switchAccount: 'Cambia account:',
        copilotDelegatedAccess: 'Copilot: Accesso delegato',
        copilotDelegatedAccessDescription: 'Consenti ad altri membri di accedere al tuo account.',
        addCopilot: 'Aggiungi copilota',
        membersCanAccessYourAccount: 'Questi membri possono accedere al tuo account:',
        youCanAccessTheseAccounts: 'Puoi accedere a questi account tramite il selettore di account:',
        role: function (_a) {
            var _b = _a === void 0 ? {} : _a, role = _b.role;
            switch (role) {
                case CONST_1.default.DELEGATE_ROLE.ALL:
                    return 'Pieno';
                case CONST_1.default.DELEGATE_ROLE.SUBMITTER:
                    return 'Limitato';
                default:
                    return '';
            }
        },
        genericError: 'Ops, qualcosa è andato storto. Per favore riprova.',
        onBehalfOfMessage: function (_a) {
            var delegator = _a.delegator;
            return "per conto di ".concat(delegator);
        },
        accessLevel: 'Livello di accesso',
        confirmCopilot: 'Conferma il tuo copilota qui sotto.',
        accessLevelDescription: "Scegli un livello di accesso qui sotto. Sia l'accesso Completo che Limitato consentono ai copiloti di visualizzare tutte le conversazioni e le spese.",
        roleDescription: function (_a) {
            var _b = _a === void 0 ? {} : _a, role = _b.role;
            switch (role) {
                case CONST_1.default.DELEGATE_ROLE.ALL:
                    return 'Consenti a un altro membro di eseguire tutte le azioni nel tuo account, per tuo conto. Include chat, invii, approvazioni, pagamenti, aggiornamenti delle impostazioni e altro.';
                case CONST_1.default.DELEGATE_ROLE.SUBMITTER:
                    return 'Consenti a un altro membro di eseguire la maggior parte delle azioni nel tuo account, per tuo conto. Esclude approvazioni, pagamenti, rifiuti e sospensioni.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Rimuovi copilot',
        removeCopilotConfirmation: 'Sei sicuro di voler rimuovere questo copilota?',
        changeAccessLevel: 'Modifica il livello di accesso',
        makeSureItIsYou: 'Verifichiamo che sei tu',
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Inserisci il codice magico inviato a ".concat(contactMethod, " per aggiungere un copilota. Dovrebbe arrivare entro un minuto o due.");
        },
        enterMagicCodeUpdate: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Inserisci il codice magico inviato a ".concat(contactMethod, " per aggiornare il tuo copilota.");
        },
        notAllowed: 'Non così in fretta...',
        noAccessMessage: 'Come copilota, non hai accesso a questa pagina. Mi dispiace!',
        notAllowedMessageStart: "Come un/una",
        notAllowedMessageHyperLinked: 'copilota',
        notAllowedMessageEnd: function (_a) {
            var accountOwnerEmail = _a.accountOwnerEmail;
            return "per ".concat(accountOwnerEmail, ", non hai il permesso di eseguire questa azione. Mi dispiace!");
        },
        copilotAccess: 'Accesso Copilot',
    },
    debug: {
        debug: 'Debug',
        details: 'Dettagli',
        JSON: 'JSON',
        reportActions: 'Azioni',
        reportActionPreview: 'Anteprima',
        nothingToPreview: 'Niente da visualizzare in anteprima',
        editJson: 'Edita JSON:',
        preview: 'Anteprima:',
        missingProperty: function (_a) {
            var propertyName = _a.propertyName;
            return "Manca ".concat(propertyName);
        },
        invalidProperty: function (_a) {
            var propertyName = _a.propertyName, expectedType = _a.expectedType;
            return "Propriet\u00E0 non valida: ".concat(propertyName, " - Atteso: ").concat(expectedType);
        },
        invalidValue: function (_a) {
            var expectedValues = _a.expectedValues;
            return "Valore non valido - Atteso: ".concat(expectedValues);
        },
        missingValue: 'Valore mancante',
        createReportAction: 'Crea Azione Rapporto',
        reportAction: 'Segnala azione',
        report: 'Rapporto',
        transaction: 'Transazione',
        violations: 'Violazioni',
        transactionViolation: 'Violazione della Transazione',
        hint: 'Le modifiche ai dati non saranno inviate al backend',
        textFields: 'Campi di testo',
        numberFields: 'Campi numerici',
        booleanFields: 'Campi booleani',
        constantFields: 'Campi costanti',
        dateTimeFields: 'Campi DateTime',
        date: 'Data',
        time: 'Tempo',
        none: 'Nessuno',
        visibleInLHN: 'Visibile nel LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: 'false',
        viewReport: 'Visualizza rapporto',
        viewTransaction: 'Visualizza transazione',
        createTransactionViolation: 'Crea violazione di transazione',
        reasonVisibleInLHN: {
            hasDraftComment: 'Ha commento in bozza',
            hasGBR: 'Has GBR',
            hasRBR: 'Ha RBR',
            pinnedByUser: 'Fissato da un membro',
            hasIOUViolations: 'Ha violazioni IOU',
            hasAddWorkspaceRoomErrors: "Ha errori nell'aggiunta della stanza di lavoro",
            isUnread: 'È non letto (modalità di concentrazione)',
            isArchived: 'È archiviato (modalità più recente)',
            isSelfDM: 'È un DM a se stessi',
            isFocused: 'È temporaneamente concentrato/a',
        },
        reasonGBR: {
            hasJoinRequest: 'Richiesta di adesione (stanza amministratore)',
            isUnreadWithMention: 'È non letto con menzione',
            isWaitingForAssigneeToCompleteAction: "In attesa che l'assegnatario completi l'azione",
            hasChildReportAwaitingAction: 'Ha un rapporto figlio in attesa di azione',
            hasMissingInvoiceBankAccount: 'Manca il conto bancario della fattura',
        },
        reasonRBR: {
            hasErrors: 'Ha errori nei dati del report o delle azioni del report',
            hasViolations: 'Ha violazioni',
            hasTransactionThreadViolations: 'Ha violazioni nel thread delle transazioni',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: "C'è un report in attesa di azione",
            theresAReportWithErrors: "C'è un report con errori",
            theresAWorkspaceWithCustomUnitsErrors: "C'è un'area di lavoro con errori nelle unità personalizzate",
            theresAProblemWithAWorkspaceMember: "C'è un problema con un membro dello spazio di lavoro",
            theresAProblemWithAWorkspaceQBOExport: "Si è verificato un problema con l'impostazione di esportazione della connessione dello spazio di lavoro.",
            theresAProblemWithAContactMethod: "C'è un problema con un metodo di contatto",
            aContactMethodRequiresVerification: 'Un metodo di contatto richiede la verifica',
            theresAProblemWithAPaymentMethod: "C'è un problema con un metodo di pagamento",
            theresAProblemWithAWorkspace: "C'è un problema con uno spazio di lavoro",
            theresAProblemWithYourReimbursementAccount: "C'è un problema con il tuo conto di rimborso",
            theresABillingProblemWithYourSubscription: "C'è un problema di fatturazione con il tuo abbonamento",
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Il tuo abbonamento è stato rinnovato con successo',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Si è verificato un problema durante la sincronizzazione della connessione dello spazio di lavoro',
            theresAProblemWithYourWallet: "C'è un problema con il tuo portafoglio",
            theresAProblemWithYourWalletTerms: "C'è un problema con i termini del tuo portafoglio",
        },
    },
    emptySearchView: {
        takeATestDrive: 'Fai un giro di prova',
    },
    migratedUserWelcomeModal: {
        title: 'Viaggi e spese, alla velocità della chat',
        subtitle: 'Il nuovo Expensify ha la stessa fantastica automazione, ma ora con una collaborazione straordinaria:',
        confirmText: 'Andiamo!',
        features: {
            chat: '<strong>Chatta direttamente su qualsiasi spesa</strong>, report o spazio di lavoro',
            scanReceipt: '<strong>Scansiona le ricevute</strong> e ricevi il rimborso',
            crossPlatform: 'Fai <strong>tutto</strong> dal tuo telefono o browser',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: {
            part1: 'Inizia',
            part2: 'qui!',
        },
        saveSearchTooltip: {
            part1: 'Rinomina le tue ricerche salvate',
            part2: 'qui!',
        },
        bottomNavInboxTooltip: {
            part1: 'Check what',
            part2: 'richiede la tua attenzione',
            part3: 'e',
            part4: 'chatta sulle spese.',
        },
        workspaceChatTooltip: {
            part1: 'Chatta con',
            part2: 'approvatori',
        },
        globalCreateTooltip: {
            part1: 'Crea spese',
            part2: ', inizia a chattare,',
            part3: 'e altro ancora.',
            part4: 'Provalo!',
        },
        GBRRBRChat: {
            part1: 'Vedrai 🟢 su',
            part2: 'azioni da intraprendere',
            part3: ',\ne 🔴 su',
            part4: 'elementi da rivedere.',
        },
        accountSwitcher: {
            part1: 'Accedi al tuo',
            part2: 'Account Copilot',
            part3: 'qui',
        },
        expenseReportsFilter: {
            part1: 'Benvenuto! Trova tutti i tuoi',
            part2: "rapporti dell'azienda",
            part3: 'qui.',
        },
        scanTestTooltip: {
            part1: 'Vuoi vedere come funziona Scan?',
            part2: 'Prova una ricevuta di test!',
            part3: 'Scegli il nostro',
            part4: 'responsabile dei test',
            part5: 'per provarlo!',
            part6: 'Ora,',
            part7: 'invia la tua spesa',
            part8: 'e guarda la magia accadere!',
            tryItOut: 'Provalo',
            noThanks: 'No grazie',
        },
        outstandingFilter: {
            part1: 'Filtra per spese che',
            part2: 'necessita approvazione',
        },
        scanTestDriveTooltip: {
            part1: 'Invia questa ricevuta a',
            part2: 'completa il test drive!',
        },
    },
    discardChangesConfirmation: {
        title: 'Eliminare le modifiche?',
        body: 'Sei sicuro di voler annullare le modifiche apportate?',
        confirmText: 'Scarta modifiche',
    },
    scheduledCall: {
        book: {
            title: 'Pianifica chiamata',
            description: 'Trova un orario che funzioni per te.',
            slots: 'Orari disponibili per',
        },
        confirmation: {
            title: 'Conferma chiamata',
            description: 'Assicurati che i dettagli qui sotto siano corretti. Una volta confermata la chiamata, invieremo un invito con ulteriori informazioni.',
            setupSpecialist: 'Il tuo specialista di configurazione',
            meetingLength: 'Durata della riunione',
            dateTime: 'Data e ora',
            minutes: '30 minuti',
        },
        callScheduled: 'Chiamata programmata',
    },
    autoSubmitModal: {
        title: 'Tutto chiaro e inviato!',
        description: 'Tutti gli avvisi e le violazioni sono stati risolti quindi:',
        submittedExpensesTitle: 'Queste spese sono state inviate',
        submittedExpensesDescription: 'Queste spese sono state inviate al tuo approvatore ma possono ancora essere modificate fino a quando non vengono approvate.',
        pendingExpensesTitle: 'Le spese in sospeso sono state spostate',
        pendingExpensesDescription: 'Eventuali spese con carta in sospeso sono state spostate in un rapporto separato fino a quando non vengono registrate.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Fai un test drive di 2 minuti',
        },
        modal: {
            title: 'Mettici alla prova',
            description: 'Fai un rapido tour del prodotto per metterti al passo velocemente. Nessuna sosta necessaria!',
            confirmText: 'Inizia la prova',
            helpText: 'Salta',
            employee: {
                description: "<muted-text>Ottieni per il tuo team <strong>3 mesi gratuiti di Expensify!</strong> Basta inserire l'email del tuo capo qui sotto e inviare loro una spesa di prova.</muted-text>",
                email: "Inserisci l'email del tuo capo",
                error: 'Quel membro possiede uno spazio di lavoro, inserisci un nuovo membro per testare.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Stai attualmente provando Expensify',
            readyForTheRealThing: 'Pronto per la vera sfida?',
            getStarted: 'Inizia',
        },
        employeeInviteMessage: function (_a) {
            var name = _a.name;
            return "# ".concat(name, " ti ha invitato a provare Expensify\nEhi! Ho appena ottenuto *3 mesi gratis* per provare Expensify, il modo pi\u00F9 veloce per gestire le spese.\n\nEcco una *ricevuta di prova* per mostrarti come funziona:");
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
exports.default = translations;
