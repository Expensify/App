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
        count: 'Zählen',
        cancel: 'Abbrechen',
        dismiss: 'Verwerfen',
        yes: 'Ja',
        no: 'No',
        ok: 'OK',
        notNow: 'Nicht jetzt',
        learnMore: 'Mehr erfahren.',
        buttonConfirm: 'Verstanden',
        name: 'Name',
        attachment: 'Anhang',
        attachments: 'Anhänge',
        center: 'Zentrum',
        from: 'Von',
        to: 'Zu',
        in: 'In',
        optional: 'Optional',
        new: 'Neu',
        search: 'Suche',
        reports: 'Berichte',
        find: 'Finden',
        searchWithThreeDots: 'Suchen...',
        next: 'Nächste',
        previous: 'Vorherige',
        goBack: 'Zurückgehen',
        create: 'Erstellen',
        add: 'Hinzufügen',
        resend: 'Erneut senden',
        save: 'Speichern',
        select: 'Auswählen',
        deselect: 'Abwählen',
        selectMultiple: 'Mehrere auswählen',
        saveChanges: 'Änderungen speichern',
        submit: 'Einreichen',
        rotate: 'Drehen',
        zoom: 'Zoom',
        password: 'Passwort',
        magicCode: 'Magic code',
        twoFactorCode: 'Zwei-Faktor-Code',
        workspaces: 'Arbeitsbereiche',
        inbox: 'Posteingang',
        success: 'Erfolgreich',
        group: 'Gruppe',
        profile: 'Profil',
        referral: 'Empfehlung',
        payments: 'Zahlungen',
        approvals: 'Genehmigungen',
        wallet: 'Brieftasche',
        preferences: 'Einstellungen',
        view: 'Ansicht',
        review: function (reviewParams) { return "Review".concat((reviewParams === null || reviewParams === void 0 ? void 0 : reviewParams.amount) ? " ".concat(reviewParams === null || reviewParams === void 0 ? void 0 : reviewParams.amount) : ''); },
        not: 'Nicht',
        signIn: 'Anmelden',
        signInWithGoogle: 'Mit Google anmelden',
        signInWithApple: 'Mit Apple anmelden',
        signInWith: 'Anmelden mit',
        continue: 'Fortfahren',
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
        details: 'Einzelheiten',
        privacy: 'Datenschutz',
        privacyPolicy: 'Datenschutzrichtlinie',
        hidden: 'Hidden',
        visible: 'Sichtbar',
        delete: 'Löschen',
        archived: 'archiviert',
        contacts: 'Kontakte',
        recents: 'Zuletzt verwendet',
        close: 'Schließen',
        download: 'Herunterladen',
        downloading: 'Herunterladen',
        uploading: 'Hochladen',
        pin: 'Pin',
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
        currentYear: 'Current year',
        currentMonth: 'Aktueller Monat',
        ssnLast4: 'Letzte 4 Ziffern der SSN',
        ssnFull9: 'Vollständige 9 Ziffern der SSN',
        addressLine: function (_a) {
            var lineNumber = _a.lineNumber;
            return "Adresszeile ".concat(lineNumber);
        },
        personalAddress: 'Persönliche Adresse',
        companyAddress: 'Firmenadresse',
        noPO: 'Keine Postfächer oder Postweiterleitungsadressen, bitte.',
        city: 'Stadt',
        state: 'Zustand',
        streetAddress: 'Straßenadresse',
        stateOrProvince: 'Bundesland / Provinz',
        country: 'Land',
        zip: 'Postleitzahl',
        zipPostCode: 'Postleitzahl',
        whatThis: 'Was ist das?',
        iAcceptThe: 'Ich akzeptiere die',
        remove: 'Entfernen',
        admin: 'Admin',
        owner: 'Eigentümer',
        dateFormat: 'YYYY-MM-DD',
        send: 'Senden',
        na: 'N/A',
        noResultsFound: 'Keine Ergebnisse gefunden',
        noResultsFoundMatching: function (_a) {
            var searchString = _a.searchString;
            return "Keine Ergebnisse gefunden, die mit \"".concat(searchString, "\" \u00FCbereinstimmen.");
        },
        recentDestinations: 'Letzte Ziele',
        timePrefix: 'Es ist',
        conjunctionFor: 'für',
        todayAt: 'Heute um',
        tomorrowAt: 'Morgen um',
        yesterdayAt: 'Gestern um',
        conjunctionAt: 'bei',
        conjunctionTo: 'zu',
        genericErrorMessage: 'Ups... etwas ist schiefgelaufen und Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es später erneut.',
        percentage: 'Prozentsatz',
        error: {
            invalidAmount: 'Ungültiger Betrag',
            acceptTerms: 'Sie müssen die Nutzungsbedingungen akzeptieren, um fortzufahren.',
            phoneNumber: "Bitte geben Sie eine g\u00FCltige Telefonnummer mit der Landesvorwahl ein (z. B. ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")"),
            fieldRequired: 'Dieses Feld ist erforderlich',
            requestModified: 'Diese Anfrage wird von einem anderen Mitglied bearbeitet.',
            characterLimitExceedCounter: function (_a) {
                var length = _a.length, limit = _a.limit;
                return "Zeichenlimit \u00FCberschritten (".concat(length, "/").concat(limit, ")");
            },
            dateInvalid: 'Bitte wählen Sie ein gültiges Datum aus',
            invalidDateShouldBeFuture: 'Bitte wählen Sie heute oder ein zukünftiges Datum.',
            invalidTimeShouldBeFuture: 'Bitte wählen Sie eine Zeit, die mindestens eine Minute voraus ist.',
            invalidCharacter: 'Ungültiges Zeichen',
            enterMerchant: 'Geben Sie einen Händlernamen ein',
            enterAmount: 'Betrag eingeben',
            missingMerchantName: 'Fehlender Händlername',
            missingAmount: 'Fehlender Betrag',
            missingDate: 'Fehlendes Datum',
            enterDate: 'Geben Sie ein Datum ein',
            invalidTimeRange: 'Bitte geben Sie eine Uhrzeit im 12-Stunden-Format ein (z. B. 14:30 Uhr)',
            pleaseCompleteForm: 'Bitte füllen Sie das obige Formular aus, um fortzufahren.',
            pleaseSelectOne: 'Bitte wählen Sie eine der oben genannten Optionen aus.',
            invalidRateError: 'Bitte geben Sie einen gültigen Tarif ein',
            lowRateError: 'Der Satz muss größer als 0 sein.',
            email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
            login: 'Beim Anmelden ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        comma: 'Komma',
        semicolon: 'Semikolon',
        please: 'Bitte',
        contactUs: 'kontaktieren Sie uns',
        pleaseEnterEmailOrPhoneNumber: 'Bitte geben Sie eine E-Mail-Adresse oder Telefonnummer ein.',
        fixTheErrors: 'Beheben Sie die Fehler.',
        inTheFormBeforeContinuing: 'im Formular, bevor Sie fortfahren',
        confirm: 'Bestätigen',
        reset: 'Zurücksetzen',
        done: 'Fertiggestellt',
        more: 'Mehr',
        debitCard: 'Debitkarte',
        bankAccount: 'Bankkonto',
        personalBankAccount: 'Persönliches Bankkonto',
        businessBankAccount: 'Geschäftsbankkonto',
        join: 'Beitreten',
        leave: 'Verlassen',
        decline: 'Ablehnen',
        transferBalance: 'Guthaben übertragen',
        cantFindAddress: 'Können Sie Ihre Adresse nicht finden?',
        enterManually: 'Manuell eingeben',
        message: 'Nachricht',
        leaveThread: 'Thread verlassen',
        you: 'Du',
        youAfterPreposition: 'du',
        your: 'Ihr',
        conciergeHelp: 'Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
        youAppearToBeOffline: 'Sie scheinen offline zu sein.',
        thisFeatureRequiresInternet: 'Diese Funktion erfordert eine aktive Internetverbindung.',
        attachmentWillBeAvailableOnceBackOnline: 'Anhang wird verfügbar, sobald die Verbindung wiederhergestellt ist.',
        errorOccurredWhileTryingToPlayVideo: 'Beim Abspielen dieses Videos ist ein Fehler aufgetreten.',
        areYouSure: 'Bist du sicher?',
        verify: 'Überprüfen',
        yesContinue: 'Ja, weiter',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: function (_a) {
            var zipSampleFormat = _a.zipSampleFormat;
            return (zipSampleFormat ? "e.g. ".concat(zipSampleFormat) : '');
        },
        description: 'Beschreibung',
        title: 'Titel',
        assignee: 'Zugewiesene Person',
        createdBy: 'Erstellt von',
        with: 'mit',
        shareCode: 'Code teilen',
        share: 'Teilen',
        per: 'pro',
        mi: 'Meile',
        km: 'Kilometer',
        copied: 'Kopiert!',
        someone: 'Jemand',
        total: 'Gesamtbetrag',
        edit: 'Bearbeiten',
        letsDoThis: "Los geht's!",
        letsStart: "Lass uns anfangen.",
        showMore: 'Mehr anzeigen',
        merchant: 'Händler',
        category: 'Kategorie',
        report: 'Bericht',
        billable: 'Abrechenbar',
        nonBillable: 'Nicht abrechenbar',
        tag: 'Etikett',
        receipt: 'Beleg',
        verified: 'Verifiziert',
        replace: 'Ersetzen',
        distance: 'Entfernung',
        mile: 'Meile',
        miles: 'Meilen',
        kilometer: 'Kilometer',
        kilometers: 'Kilometer',
        recent: 'Kürzlich',
        all: 'Alle',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: 'Wählen Sie eine Währung aus',
        card: 'Karte',
        whyDoWeAskForThis: 'Warum fragen wir danach?',
        required: 'Erforderlich',
        showing: 'Anzeigen',
        of: 'von',
        default: 'Standardmäßig',
        update: 'Aktualisieren',
        member: 'Mitglied',
        auditor: 'Prüfer',
        role: 'Rolle',
        currency: 'Währung',
        rate: 'Bewerten',
        emptyLHN: {
            title: 'Woohoo! Alles erledigt.',
            subtitleText1: 'Finden Sie einen Chat mit dem',
            subtitleText2: 'Schaltfläche oben oder erstellen Sie etwas mit dem',
            subtitleText3: 'Schaltfläche unten.',
        },
        businessName: 'Firmenname',
        clear: 'Klar',
        type: 'Typ',
        action: 'Aktion',
        expenses: 'Ausgaben',
        tax: 'Steuer',
        shared: 'Geteilt',
        drafts: 'Entwürfe',
        finished: 'Fertiggestellt',
        upgrade: 'Upgrade',
        downgradeWorkspace: 'Arbeitsbereich herabstufen',
        companyID: 'Unternehmens-ID',
        userID: 'Benutzer-ID',
        disable: 'Deaktivieren',
        export: 'Exportieren',
        initialValue: 'Anfangswert',
        currentDate: 'Aktuelles Datum',
        value: 'Wert',
        downloadFailedTitle: 'Download fehlgeschlagen',
        downloadFailedDescription: 'Ihr Download konnte nicht abgeschlossen werden. Bitte versuchen Sie es später erneut.',
        filterLogs: 'Protokolle filtern',
        network: 'Netzwerk',
        reportID: 'Berichts-ID',
        longID: 'Lange ID',
        bankAccounts: 'Bankkonten',
        chooseFile: 'Datei auswählen',
        chooseFiles: 'Dateien auswählen',
        dropTitle: 'Lass es los',
        dropMessage: 'Datei hier ablegen',
        ignore: 'Ignore',
        enabled: 'Aktiviert',
        disabled: 'Deaktiviert',
        import: 'Importieren',
        offlinePrompt: 'Sie können diese Aktion momentan nicht ausführen.',
        outstanding: 'Hervorragend',
        chats: 'Chats',
        tasks: 'Aufgaben',
        unread: 'Ungelesen',
        sent: 'Gesendet',
        links: 'Links',
        days: 'Tage',
        rename: 'Umbenennen',
        address: 'Adresse',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Überspringen',
        chatWithAccountManager: function (_a) {
            var accountManagerDisplayName = _a.accountManagerDisplayName;
            return "Brauchen Sie etwas Bestimmtes? Chatten Sie mit Ihrem Kundenbetreuer, ".concat(accountManagerDisplayName, ".");
        },
        chatNow: 'Jetzt chatten',
        workEmail: 'Geschäftliche E-Mail-Adresse',
        destination: 'Zielort',
        subrate: 'Subrate',
        perDiem: 'Tagegeld',
        validate: 'Validieren',
        downloadAsPDF: 'Als PDF herunterladen',
        downloadAsCSV: 'Als CSV herunterladen',
        help: 'Hilfe',
        expenseReports: 'Spesenabrechnungen',
        rateOutOfPolicy: 'Außerhalb der Richtlinie bewerten',
        reimbursable: 'Erstattungsfähig',
        editYourProfile: 'Bearbeiten Sie Ihr Profil',
        comments: 'Kommentare',
        sharedIn: 'Geteilt in',
        unreported: 'Nicht gemeldet',
        explore: 'Erkunden',
        todo: 'To-do',
        invoice: 'Rechnung',
        expense: 'Ausgabe',
        chat: 'Chat',
        task: 'Aufgabe',
        trip: 'Reise',
        apply: 'Anwenden',
        status: 'Status',
        on: 'An',
        before: 'Vorher',
        after: 'Nach',
        reschedule: 'Verschieben',
        general: 'Allgemein',
        workspacesTabTitle: 'Arbeitsbereiche',
        getTheApp: 'Hole dir die App',
        scanReceiptsOnTheGo: 'Scannen Sie Belege von Ihrem Telefon aus',
        headsUp: 'Achtung!',
    },
    supportalNoAccess: {
        title: 'Nicht so schnell',
        description: 'Sie sind nicht berechtigt, diese Aktion auszuführen, wenn der Support eingeloggt ist.',
    },
    lockedAccount: {
        title: 'Gesperrtes Konto',
        description: 'Sie dürfen diese Aktion nicht ausführen, da dieses Konto gesperrt wurde. Bitte wenden Sie sich an concierge@expensify.com für weitere Schritte.',
    },
    location: {
        useCurrent: 'Aktuellen Standort verwenden',
        notFound: 'Wir konnten Ihren Standort nicht finden. Bitte versuchen Sie es erneut oder geben Sie eine Adresse manuell ein.',
        permissionDenied: 'Es sieht so aus, als hätten Sie den Zugriff auf Ihren Standort verweigert.',
        please: 'Bitte',
        allowPermission: 'Standortzugriff in den Einstellungen erlauben',
        tryAgain: 'und versuche es erneut.',
    },
    contact: {
        importContacts: 'Kontakte importieren',
        importContactsTitle: 'Importieren Sie Ihre Kontakte',
        importContactsText: 'Importieren Sie Kontakte von Ihrem Telefon, damit Ihre Lieblingspersonen immer nur einen Fingertipp entfernt sind.',
        importContactsExplanation: 'damit deine Lieblingspersonen immer nur einen Fingertipp entfernt sind.',
        importContactsNativeText: 'Nur noch ein Schritt! Geben Sie uns grünes Licht, um Ihre Kontakte zu importieren.',
    },
    anonymousReportFooter: {
        logoTagline: 'Nimm an der Diskussion teil.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Kamerazugriff',
        expensifyDoesNotHaveAccessToCamera: 'Expensify kann ohne Zugriff auf Ihre Kamera keine Fotos aufnehmen. Tippen Sie auf Einstellungen, um die Berechtigungen zu aktualisieren.',
        attachmentError: 'Anlagenfehler',
        errorWhileSelectingAttachment: 'Beim Auswählen eines Anhangs ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        errorWhileSelectingCorruptedAttachment: 'Beim Auswählen eines beschädigten Anhangs ist ein Fehler aufgetreten. Bitte versuchen Sie es mit einer anderen Datei.',
        takePhoto: 'Foto machen',
        chooseFromGallery: 'Aus Galerie auswählen',
        chooseDocument: 'Datei auswählen',
        attachmentTooLarge: 'Anhang ist zu groß',
        sizeExceeded: 'Die Anhangsgröße überschreitet das Limit von 24 MB.',
        sizeExceededWithLimit: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "Die Anhangsgr\u00F6\u00DFe \u00FCberschreitet das Limit von ".concat(maxUploadSizeInMB, " MB.");
        },
        attachmentTooSmall: 'Anhang ist zu klein',
        sizeNotMet: 'Anhangsgröße muss größer als 240 Bytes sein',
        wrongFileType: 'Ungültiger Dateityp',
        notAllowedExtension: 'Dieser Dateityp ist nicht erlaubt. Bitte versuchen Sie es mit einem anderen Dateityp.',
        folderNotAllowedMessage: 'Das Hochladen eines Ordners ist nicht erlaubt. Bitte versuchen Sie es mit einer anderen Datei.',
        protectedPDFNotSupported: 'Passwortgeschütztes PDF wird nicht unterstützt',
        attachmentImageResized: 'Dieses Bild wurde zur Vorschaugröße angepasst. Herunterladen für volle Auflösung.',
        attachmentImageTooLarge: 'Dieses Bild ist zu groß, um es vor dem Hochladen in der Vorschau anzuzeigen.',
        tooManyFiles: function (_a) {
            var fileLimit = _a.fileLimit;
            return "Sie k\u00F6nnen jeweils nur bis zu ".concat(fileLimit, " Dateien hochladen.");
        },
        sizeExceededWithValue: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "Dateien \u00FCberschreiten ".concat(maxUploadSizeInMB, " MB. Bitte versuchen Sie es erneut.");
        },
        someFilesCantBeUploaded: 'Einige Dateien können nicht hochgeladen werden',
        sizeLimitExceeded: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "Dateien m\u00FCssen unter ".concat(maxUploadSizeInMB, " MB sein. Gr\u00F6\u00DFere Dateien werden nicht hochgeladen.");
        },
        maxFileLimitExceeded: 'Sie können bis zu 30 Belege gleichzeitig hochladen. Weitere werden nicht hochgeladen.',
        unsupportedFileType: function (_a) {
            var fileType = _a.fileType;
            return "".concat(fileType, " Dateien werden nicht unterst\u00FCtzt. Nur unterst\u00FCtzte Dateitypen werden hochgeladen.");
        },
        learnMoreAboutSupportedFiles: 'Erfahren Sie mehr über unterstützte Formate.',
        passwordProtected: 'Passwortgeschützte PDFs werden nicht unterstützt. Nur unterstützte Dateien werden hochgeladen.',
    },
    dropzone: {
        addAttachments: 'Anhänge hinzufügen',
        scanReceipts: 'Belege scannen',
        replaceReceipt: 'Beleg ersetzen',
    },
    filePicker: {
        fileError: 'Dateifehler',
        errorWhileSelectingFile: 'Beim Auswählen einer Datei ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
    },
    connectionComplete: {
        title: 'Verbindung abgeschlossen',
        supportingText: 'Sie können dieses Fenster schließen und zur Expensify-App zurückkehren.',
    },
    avatarCropModal: {
        title: 'Foto bearbeiten',
        description: 'Ziehen, zoomen und drehen Sie Ihr Bild, wie Sie möchten.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Keine Erweiterung für den MIME-Typ gefunden',
        problemGettingImageYouPasted: 'Es gab ein Problem beim Abrufen des Bildes, das Sie eingefügt haben.',
        commentExceededMaxLength: function (_a) {
            var formattedMaxLength = _a.formattedMaxLength;
            return "Die maximale Kommentarl\u00E4nge betr\u00E4gt ".concat(formattedMaxLength, " Zeichen.");
        },
        taskTitleExceededMaxLength: function (_a) {
            var formattedMaxLength = _a.formattedMaxLength;
            return "Die maximale L\u00E4nge des Aufgabentitels betr\u00E4gt ".concat(formattedMaxLength, " Zeichen.");
        },
    },
    baseUpdateAppModal: {
        updateApp: 'App aktualisieren',
        updatePrompt: 'Eine neue Version dieser App ist verfügbar. Aktualisieren Sie jetzt oder starten Sie die App später neu, um die neuesten Änderungen herunterzuladen.',
    },
    deeplinkWrapper: {
        launching: 'Expensify wird gestartet',
        expired: 'Ihre Sitzung ist abgelaufen.',
        signIn: 'Bitte melden Sie sich erneut an.',
        redirectedToDesktopApp: 'Wir haben Sie zur Desktop-App weitergeleitet.',
        youCanAlso: 'Sie können auch',
        openLinkInBrowser: 'öffnen Sie diesen Link in Ihrem Browser',
        loggedInAs: function (_a) {
            var email = _a.email;
            return "Sie sind als ".concat(email, " angemeldet. Klicken Sie im Hinweis auf \"Link \u00F6ffnen\", um sich mit diesem Konto in der Desktop-App anzumelden.");
        },
        doNotSeePrompt: 'Kannst du die Eingabeaufforderung nicht sehen?',
        tryAgain: 'Versuchen Sie es erneut.',
        or: ', oder',
        continueInWeb: 'weiter zur Web-App',
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abrakadabra, du bist angemeldet!',
        successfulSignInDescription: 'Gehe zurück zu deinem ursprünglichen Tab, um fortzufahren.',
        title: 'Hier ist dein magischer Code',
        description: 'Bitte geben Sie den Code von dem Gerät ein, auf dem er ursprünglich angefordert wurde.',
        doNotShare: 'Teile deinen Code mit niemandem.\nExpensify wird dich niemals danach fragen!',
        or: ', oder',
        signInHere: 'einfach hier anmelden',
        expiredCodeTitle: 'Magischer Code abgelaufen',
        expiredCodeDescription: 'Gehen Sie zurück zum ursprünglichen Gerät und fordern Sie einen neuen Code an.',
        successfulNewCodeRequest: 'Code angefordert. Bitte überprüfen Sie Ihr Gerät.',
        tfaRequiredTitle: 'Zwei-Faktor-Authentifizierung erforderlich',
        tfaRequiredDescription: 'Bitte geben Sie den Zwei-Faktor-Authentifizierungscode ein, wo Sie sich anmelden möchten.',
        requestOneHere: 'hier eine anfordern.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Bezahlt von',
        whatsItFor: 'Wofür ist das?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Name, E-Mail oder Telefonnummer',
        findMember: 'Mitglied finden',
        searchForSomeone: 'Suche nach jemandem',
    },
    emptyList: (_a = {},
        _a[CONST_1.default.IOU.TYPE.CREATE] = {
            title: 'Reichen Sie eine Ausgabe ein, verweisen Sie auf Ihren Chef.',
            subtitleText: 'Möchten Sie, dass Ihr Chef auch Expensify nutzt? Reichen Sie einfach eine Ausgabe bei ihnen ein und wir kümmern uns um den Rest.',
        },
        _a),
    videoChatButtonAndMenu: {
        tooltip: 'Einen Anruf buchen',
    },
    hello: 'Hallo',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Unten beginnen.',
        anotherLoginPageIsOpen: 'Eine weitere Anmeldeseite ist geöffnet.',
        anotherLoginPageIsOpenExplanation: 'Sie haben die Anmeldeseite in einem separaten Tab geöffnet. Bitte melden Sie sich von diesem Tab aus an.',
        welcome: 'Willkommen!',
        welcomeWithoutExclamation: 'Willkommen',
        phrase2: 'Geld spricht. Und jetzt, da Chat und Zahlungen an einem Ort sind, ist es auch einfach.',
        phrase3: 'Ihre Zahlungen erreichen Sie so schnell, wie Sie Ihren Standpunkt vermitteln können.',
        enterPassword: 'Bitte geben Sie Ihr Passwort ein',
        welcomeNewFace: function (_a) {
            var login = _a.login;
            return "".concat(login, ", es ist immer sch\u00F6n, ein neues Gesicht hier zu sehen!");
        },
        welcomeEnterMagicCode: function (_a) {
            var login = _a.login;
            return "Bitte geben Sie den magischen Code ein, der an ".concat(login, " gesendet wurde. Er sollte in ein bis zwei Minuten ankommen.");
        },
    },
    login: {
        hero: {
            header: 'Reisen und Ausgaben, in der Geschwindigkeit des Chats',
            body: 'Willkommen bei der nächsten Generation von Expensify, wo Ihre Reisen und Ausgaben mit Hilfe von kontextuellem, Echtzeit-Chat schneller werden.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: function (_a) {
            var email = _a.email;
            return "Sie sind bereits als ".concat(email, " angemeldet.");
        },
        goBackMessage: function (_a) {
            var provider = _a.provider;
            return "M\u00F6chten Sie sich nicht mit ".concat(provider, " anmelden?");
        },
        continueWithMyCurrentSession: 'Mit meiner aktuellen Sitzung fortfahren',
        redirectToDesktopMessage: 'Wir leiten Sie zur Desktop-App weiter, sobald Sie sich angemeldet haben.',
        signInAgreementMessage: 'Mit der Anmeldung stimmen Sie den',
        termsOfService: 'Nutzungsbedingungen',
        privacy: 'Datenschutz',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Weiter mit Single Sign-On anmelden:',
        orContinueWithMagicCode: 'Sie können sich auch mit einem magischen Code anmelden.',
        useSingleSignOn: 'Einmalanmeldung verwenden',
        useMagicCode: 'Verwende magischen Code',
        launching: 'Starten...',
        oneMoment: 'Einen Moment bitte, während wir Sie zum Single-Sign-On-Portal Ihres Unternehmens weiterleiten.',
    },
    reportActionCompose: {
        dropToUpload: 'Zum Hochladen hierher ziehen',
        sendAttachment: 'Anhang senden',
        addAttachment: 'Anhang hinzufügen',
        writeSomething: 'Schreiben Sie etwas...',
        blockedFromConcierge: 'Kommunikation ist gesperrt',
        fileUploadFailed: 'Hochladen fehlgeschlagen. Datei wird nicht unterstützt.',
        localTime: function (_a) {
            var user = _a.user, time = _a.time;
            return "Es ist ".concat(time, " f\u00FCr ").concat(user);
        },
        edited: '(bearbeitet)',
        emoji: 'Emoji',
        collapse: 'Einklappen',
        expand: 'Erweitern',
    },
    reportActionContextMenu: {
        copyToClipboard: 'In die Zwischenablage kopieren',
        copied: 'Kopiert!',
        copyLink: 'Link kopieren',
        copyURLToClipboard: 'URL in die Zwischenablage kopieren',
        copyEmailToClipboard: 'E-Mail in die Zwischenablage kopieren',
        markAsUnread: 'Als ungelesen markieren',
        markAsRead: 'Als gelesen markieren',
        editAction: function (_a) {
            var action = _a.action;
            return "Edit ".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? 'Ausgabe' : 'Kommentar');
        },
        deleteAction: function (_a) {
            var action = _a.action;
            return "L\u00F6schen ".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? 'Ausgabe' : 'Kommentar');
        },
        deleteConfirmation: function (_a) {
            var action = _a.action;
            return "M\u00F6chten Sie dieses ".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? 'Ausgabe' : 'Kommentar', " wirklich l\u00F6schen?");
        },
        onlyVisible: 'Nur sichtbar für',
        replyInThread: 'Im Thread antworten',
        joinThread: 'Thread beitreten',
        leaveThread: 'Thread verlassen',
        copyOnyxData: 'Onyx-Daten kopieren',
        flagAsOffensive: 'Als anstößig markieren',
        menu: 'Menü',
    },
    emojiReactions: {
        addReactionTooltip: 'Reaktion hinzufügen',
        reactedWith: 'reagierte mit',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: 'Du hast die Party in verpasst.',
        beginningOfArchivedRoomPartTwo: ', hier gibt es nichts zu sehen.',
        beginningOfChatHistoryDomainRoomPartOne: function (_a) {
            var domainRoom = _a.domainRoom;
            return "Dieser Chat ist mit allen Expensify-Mitgliedern in der ".concat(domainRoom, "-Domain.");
        },
        beginningOfChatHistoryDomainRoomPartTwo: 'Verwenden Sie es, um mit Kollegen zu chatten, Tipps auszutauschen und Fragen zu stellen.',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'Dieser Chat ist mit',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: function (_a) {
            var workspaceName = _a.workspaceName;
            return " ".concat(workspaceName, " ");
        },
        beginningOfChatHistoryAdminRoomPartTwo: 'Verwenden Sie es, um über die Einrichtung des Arbeitsplatzes und mehr zu chatten.',
        beginningOfChatHistoryAnnounceRoomPartOne: function (_a) {
            var workspaceName = _a.workspaceName;
            return "Dieser Chat ist mit allen in ".concat(workspaceName, ".");
        },
        beginningOfChatHistoryAnnounceRoomPartTwo: "Verwenden Sie es f\u00FCr die wichtigsten Ank\u00FCndigungen.",
        beginningOfChatHistoryUserRoomPartOne: 'Dieser Chatraum ist für alles.',
        beginningOfChatHistoryUserRoomPartTwo: 'related.',
        beginningOfChatHistoryInvoiceRoomPartOne: "Dieser Chat ist f\u00FCr Rechnungen zwischen",
        beginningOfChatHistoryInvoiceRoomPartTwo: ". Verwenden Sie die + Schaltfl\u00E4che, um eine Rechnung zu senden.",
        beginningOfChatHistory: 'Dieser Chat ist mit',
        beginningOfChatHistoryPolicyExpenseChatPartOne: 'Dies ist, wo',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'wird Ausgaben einreichen bei',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Verwenden Sie einfach die + Taste.',
        beginningOfChatHistorySelfDM: 'Dies ist Ihr persönlicher Bereich. Nutzen Sie ihn für Notizen, Aufgaben, Entwürfe und Erinnerungen.',
        beginningOfChatHistorySystemDM: 'Willkommen! Lassen Sie uns mit der Einrichtung beginnen.',
        chatWithAccountManager: 'Hier mit Ihrem Kundenbetreuer chatten',
        sayHello: 'Hallo!',
        yourSpace: 'Ihr Bereich',
        welcomeToRoom: function (_a) {
            var roomName = _a.roomName;
            return "Willkommen in ".concat(roomName, "!");
        },
        usePlusButton: function (_a) {
            var additionalText = _a.additionalText;
            return "Verwenden Sie die + Taste, um ".concat(additionalText, " einen Ausgabenposten hinzuzuf\u00FCgen.");
        },
        askConcierge: 'Stellen Sie Fragen und erhalten Sie rund um die Uhr Unterstützung in Echtzeit.',
        conciergeSupport: '24/7 Support',
        create: 'erstellen',
        iouTypes: {
            pay: 'bezahlen',
            split: 'split',
            submit: 'einreichen',
            track: 'verfolgen',
            invoice: 'Rechnung',
        },
    },
    adminOnlyCanPost: 'Nur Administratoren können Nachrichten in diesem Raum senden.',
    reportAction: {
        asCopilot: 'als Co-Pilot für',
    },
    mentionSuggestions: {
        hereAlternateText: 'Benachrichtige alle in diesem Gespräch',
    },
    newMessages: 'Neue Nachrichten',
    youHaveBeenBanned: 'Hinweis: Du wurdest von der Teilnahme an diesem Kanal ausgeschlossen.',
    reportTypingIndicator: {
        isTyping: 'tippt...',
        areTyping: 'tippen...',
        multipleMembers: 'Mehrere Mitglieder',
    },
    reportArchiveReasons: (_b = {},
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.DEFAULT] = 'Dieser Chatraum wurde archiviert.',
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED] = function (_a) {
            var displayName = _a.displayName;
            return "Dieser Chat ist nicht mehr aktiv, weil ".concat(displayName, " ihr Konto geschlossen hat.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED] = function (_a) {
            var displayName = _a.displayName, oldDisplayName = _a.oldDisplayName;
            return "Dieser Chat ist nicht mehr aktiv, weil ".concat(oldDisplayName, " ihr Konto mit ").concat(displayName, " zusammengef\u00FChrt hat.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY] = function (_a) {
            var displayName = _a.displayName, policyName = _a.policyName, _b = _a.shouldUseYou, shouldUseYou = _b === void 0 ? false : _b;
            return shouldUseYou
                ? "Dieser Chat ist nicht mehr aktiv, weil <strong>Sie</strong> kein Mitglied des ".concat(policyName, " Arbeitsbereichs mehr sind.")
                : "Dieser Chat ist nicht mehr aktiv, weil ".concat(displayName, " kein Mitglied des Arbeitsbereichs ").concat(policyName, " mehr ist.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.POLICY_DELETED] = function (_a) {
            var policyName = _a.policyName;
            return "Dieser Chat ist nicht mehr aktiv, weil ".concat(policyName, " kein aktiver Arbeitsbereich mehr ist.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED] = function (_a) {
            var policyName = _a.policyName;
            return "Dieser Chat ist nicht mehr aktiv, weil ".concat(policyName, " kein aktiver Arbeitsbereich mehr ist.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED] = 'Diese Buchung ist archiviert.',
        _b),
    writeCapabilityPage: {
        label: 'Wer kann posten?',
        writeCapability: {
            all: 'Alle Mitglieder',
            admins: 'Nur Administratoren',
        },
    },
    sidebarScreen: {
        buttonFind: 'Etwas finden...',
        buttonMySettings: 'Meine Einstellungen',
        fabNewChat: 'Chat starten',
        fabNewChatExplained: 'Chat starten (Floating action)',
        chatPinned: 'Chat angeheftet',
        draftedMessage: 'Entwurfene Nachricht',
        listOfChatMessages: 'Liste der Chatnachrichten',
        listOfChats: 'Liste der Chats',
        saveTheWorld: 'Rette die Welt',
        tooltip: 'Hier starten!',
        redirectToExpensifyClassicModal: {
            title: 'Demnächst verfügbar',
            description: 'Wir optimieren noch ein paar Details von New Expensify, um Ihre spezifische Einrichtung zu berücksichtigen. In der Zwischenzeit gehen Sie zu Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Abonnement',
        domains: 'Domains',
    },
    tabSelector: {
        chat: 'Chat',
        room: 'Zimmer',
        distance: 'Entfernung',
        manual: 'Handbuch',
        scan: 'Scannen',
    },
    spreadsheet: {
        upload: 'Eine Tabelle hochladen',
        dragAndDrop: 'Ziehen Sie Ihre Tabelle hierher oder wählen Sie unten eine Datei aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.',
        chooseSpreadsheet: 'Wählen Sie eine Tabellenkalkulationsdatei zum Importieren aus. Unterstützte Formate: .csv, .txt, .xls und .xlsx.',
        fileContainsHeader: 'Datei enthält Spaltenüberschriften',
        column: function (_a) {
            var name = _a.name;
            return "Spalte ".concat(name);
        },
        fieldNotMapped: function (_a) {
            var fieldName = _a.fieldName;
            return "Ups! Ein erforderliches Feld (\"".concat(fieldName, "\") wurde nicht zugeordnet. Bitte \u00FCberpr\u00FCfen und erneut versuchen.");
        },
        singleFieldMultipleColumns: function (_a) {
            var fieldName = _a.fieldName;
            return "Ups! Sie haben ein einzelnes Feld (\"".concat(fieldName, "\") mehreren Spalten zugeordnet. Bitte \u00FCberpr\u00FCfen Sie dies und versuchen Sie es erneut.");
        },
        emptyMappedField: function (_a) {
            var fieldName = _a.fieldName;
            return "Hoppla! Das Feld (\u201E".concat(fieldName, "\u201C) enth\u00E4lt einen oder mehrere leere Werte. Bitte \u00FCberpr\u00FCfen und erneut versuchen.");
        },
        importSuccessfulTitle: 'Import erfolgreich',
        importCategoriesSuccessfulDescription: function (_a) {
            var categories = _a.categories;
            return (categories > 1 ? "".concat(categories, " Kategorien wurden hinzugef\u00FCgt.") : '1 Kategorie wurde hinzugefügt.');
        },
        importMembersSuccessfulDescription: function (_a) {
            var added = _a.added, updated = _a.updated;
            if (!added && !updated) {
                return 'Keine Mitglieder wurden hinzugefügt oder aktualisiert.';
            }
            if (added && updated) {
                return "".concat(added, " Mitglied").concat(added > 1 ? 's' : '', " hinzugef\u00FCgt, ").concat(updated, " Mitglied").concat(updated > 1 ? 's' : '', " aktualisiert.");
            }
            if (updated) {
                return updated > 1 ? "".concat(updated, " Mitglieder wurden aktualisiert.") : '1 Mitglied wurde aktualisiert.';
            }
            return added > 1 ? "".concat(added, " Mitglieder wurden hinzugef\u00FCgt.") : '1 Mitglied wurde hinzugefügt.';
        },
        importTagsSuccessfulDescription: function (_a) {
            var tags = _a.tags;
            return (tags > 1 ? "".concat(tags, " Tags wurden hinzugef\u00FCgt.") : '1 Tag wurde hinzugefügt.');
        },
        importMultiLevelTagsSuccessfulDescription: 'Mehrstufige Tags wurden hinzugefügt.',
        importPerDiemRatesSuccessfulDescription: function (_a) {
            var rates = _a.rates;
            return rates > 1 ? "".concat(rates, " Tagespauschalen wurden hinzugef\u00FCgt.") : '1 Tagespauschale wurde hinzugefügt.';
        },
        importFailedTitle: 'Import fehlgeschlagen',
        importFailedDescription: 'Bitte stellen Sie sicher, dass alle Felder korrekt ausgefüllt sind, und versuchen Sie es erneut. Wenn das Problem weiterhin besteht, wenden Sie sich bitte an Concierge.',
        importDescription: 'Wählen Sie aus, welche Felder Sie aus Ihrer Tabelle zuordnen möchten, indem Sie auf das Dropdown-Menü neben jeder importierten Spalte unten klicken.',
        sizeNotMet: 'Die Dateigröße muss größer als 0 Byte sein',
        invalidFileMessage: 'Die Datei, die Sie hochgeladen haben, ist entweder leer oder enthält ungültige Daten. Bitte stellen Sie sicher, dass die Datei korrekt formatiert ist und die notwendigen Informationen enthält, bevor Sie sie erneut hochladen.',
        importSpreadsheet: 'Tabellenkalkulation importieren',
        downloadCSV: 'CSV herunterladen',
    },
    receipt: {
        upload: 'Beleg hochladen',
        uploadMultiple: 'Belege hochladen',
        dragReceiptBeforeEmail: 'Ziehen Sie eine Quittung auf diese Seite oder leiten Sie eine Quittung weiter an',
        dragReceiptsBeforeEmail: 'Ziehen Sie Quittungen auf diese Seite oder leiten Sie Quittungen weiter an',
        dragReceiptAfterEmail: 'oder wählen Sie unten eine Datei zum Hochladen aus.',
        dragReceiptsAfterEmail: 'oder wählen Sie unten Dateien zum Hochladen aus.',
        chooseReceipt: 'Wählen Sie eine Quittung zum Hochladen aus oder leiten Sie eine Quittung weiter an',
        chooseReceipts: 'Wählen Sie Quittungen zum Hochladen aus oder leiten Sie Quittungen weiter an ',
        takePhoto: 'Ein Foto machen',
        cameraAccess: 'Der Kamerazugriff ist erforderlich, um Fotos von Belegen zu machen.',
        deniedCameraAccess: 'Kamerazugriff wurde noch nicht gewährt, bitte folgen Sie',
        deniedCameraAccessInstructions: 'diese Anweisungen',
        cameraErrorTitle: 'Kamerafehler',
        cameraErrorMessage: 'Beim Aufnehmen eines Fotos ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        locationAccessTitle: 'Standortzugriff erlauben',
        locationAccessMessage: 'Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall genau zu halten, wohin Sie auch gehen.',
        locationErrorTitle: 'Standortzugriff erlauben',
        locationErrorMessage: 'Der Standortzugriff hilft uns, Ihre Zeitzone und Währung überall genau zu halten, wohin Sie auch gehen.',
        allowLocationFromSetting: "Der Standortzugriff hilft uns, Ihre Zeitzone und W\u00E4hrung \u00FCberall genau zu halten. Bitte erlauben Sie den Standortzugriff in den Berechtigungseinstellungen Ihres Ger\u00E4ts.",
        dropTitle: 'Lass es los',
        dropMessage: 'Datei hier ablegen',
        flash: 'Blitz',
        multiScan: 'multi-scan',
        shutter: 'Shutter',
        gallery: 'Galerie',
        deleteReceipt: 'Beleg löschen',
        deleteConfirmation: 'Möchten Sie diesen Beleg wirklich löschen?',
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
        splitDistance: 'Distanz aufteilen',
        paySomeone: function (_a) {
            var _b = _a === void 0 ? {} : _a, name = _b.name;
            return "Zahlen Sie ".concat(name !== null && name !== void 0 ? name : 'jemand');
        },
        assignTask: 'Aufgabe zuweisen',
        header: 'Schnelle Aktion',
        noLongerHaveReportAccess: 'Sie haben keinen Zugriff mehr auf Ihr vorheriges Schnellaktionsziel. Wählen Sie unten ein neues aus.',
        updateDestination: 'Ziel aktualisieren',
        createReport: 'Bericht erstellen',
    },
    iou: {
        amount: 'Betrag',
        taxAmount: 'Steuerbetrag',
        taxRate: 'Steuersatz',
        approve: function (_a) {
            var _b = _a === void 0 ? {} : _a, formattedAmount = _b.formattedAmount;
            return (formattedAmount ? "Genehmigen Sie ".concat(formattedAmount) : 'Genehmigen');
        },
        approved: 'Genehmigt',
        cash: 'Bargeld',
        card: 'Karte',
        original: 'Original',
        split: 'Teilen',
        splitExpense: 'Ausgabe aufteilen',
        splitExpenseSubtitle: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "".concat(amount, " von ").concat(merchant);
        },
        addSplit: 'Split hinzufügen',
        totalAmountGreaterThanOriginal: function (_a) {
            var amount = _a.amount;
            return "Der Gesamtbetrag ist ".concat(amount, " h\u00F6her als die urspr\u00FCngliche Ausgabe.");
        },
        totalAmountLessThanOriginal: function (_a) {
            var amount = _a.amount;
            return "Der Gesamtbetrag ist ".concat(amount, " weniger als die urspr\u00FCngliche Ausgabe.");
        },
        splitExpenseZeroAmount: 'Bitte geben Sie einen gültigen Betrag ein, bevor Sie fortfahren.',
        splitExpenseEditTitle: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "Bearbeiten Sie ".concat(amount, " f\u00FCr ").concat(merchant);
        },
        removeSplit: 'Aufteilung entfernen',
        paySomeone: function (_a) {
            var _b = _a === void 0 ? {} : _a, name = _b.name;
            return "Zahlen Sie ".concat(name !== null && name !== void 0 ? name : 'jemand');
        },
        expense: 'Ausgabe',
        categorize: 'Kategorisieren',
        share: 'Teilen',
        participants: 'Teilnehmer',
        createExpense: 'Ausgabe erstellen',
        trackDistance: 'Entfernung verfolgen',
        createExpenses: function (_a) {
            var expensesNumber = _a.expensesNumber;
            return "Erstelle ".concat(expensesNumber, " Ausgaben");
        },
        addExpense: 'Ausgabe hinzufügen',
        chooseRecipient: 'Empfänger auswählen',
        createExpenseWithAmount: function (_a) {
            var amount = _a.amount;
            return "Erstelle ".concat(amount, " Ausgabe");
        },
        confirmDetails: 'Details bestätigen',
        pay: 'Bezahlen',
        cancelPayment: 'Zahlung stornieren',
        cancelPaymentConfirmation: 'Möchten Sie diese Zahlung wirklich stornieren?',
        viewDetails: 'Details anzeigen',
        pending: 'Ausstehend',
        canceled: 'Abgebrochen',
        posted: 'Gepostet',
        deleteReceipt: 'Beleg löschen',
        deletedTransaction: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "hat eine Ausgabe in diesem Bericht gel\u00F6scht, ".concat(merchant, " - ").concat(amount);
        },
        movedFromReport: function (_a) {
            var reportName = _a.reportName;
            return "verschob eine Ausgabe".concat(reportName ? "von ".concat(reportName) : '');
        },
        movedTransaction: function (_a) {
            var reportUrl = _a.reportUrl, reportName = _a.reportName;
            return "verschob diese Ausgabe".concat(reportName ? "to <a href=\"".concat(reportUrl, "\">").concat(reportName, "</a>") : '');
        },
        unreportedTransaction: 'diese Ausgabe in Ihren persönlichen Bereich verschoben',
        pendingMatchWithCreditCard: 'Beleg steht aus, um mit Kartentransaktion abgeglichen zu werden',
        pendingMatch: 'Ausstehende Übereinstimmung',
        pendingMatchWithCreditCardDescription: 'Beleg wartet auf Abgleich mit Kartentransaktion. Als Barzahlung markieren, um abzubrechen.',
        markAsCash: 'Als Barzahlung markieren',
        routePending: 'Route wird bearbeitet...',
        receiptScanning: function () { return ({
            one: 'Beleg scannen...',
            other: 'Belege werden gescannt...',
        }); },
        scanMultipleReceipts: 'Mehrere Belege scannen',
        scanMultipleReceiptsDescription: 'Machen Sie Fotos von all Ihren Belegen auf einmal, dann bestätigen Sie die Details selbst oder lassen Sie SmartScan dies übernehmen.',
        receiptScanInProgress: 'Belegscan läuft',
        receiptScanInProgressDescription: 'Belegscan läuft. Später erneut prüfen oder die Details jetzt eingeben.',
        duplicateTransaction: function (_a) {
            var isSubmitted = _a.isSubmitted;
            return !isSubmitted
                ? 'Mögliche doppelte Ausgaben erkannt. Überprüfen Sie die Duplikate, um die Einreichung zu ermöglichen.'
                : 'Potenzielle doppelte Ausgaben erkannt. Überprüfen Sie die Duplikate, um die Genehmigung zu ermöglichen.';
        },
        receiptIssuesFound: function () { return ({
            one: 'Problem gefunden',
            other: 'Gefundene Probleme',
        }); },
        fieldPending: 'Ausstehend...',
        defaultRate: 'Standardrate',
        receiptMissingDetails: 'Beleg fehlt Details',
        missingAmount: 'Fehlender Betrag',
        missingMerchant: 'Fehlender Händler',
        receiptStatusTitle: 'Scannen…',
        receiptStatusText: 'Nur Sie können diese Quittung sehen, während sie gescannt wird. Schauen Sie später noch einmal vorbei oder geben Sie die Details jetzt ein.',
        receiptScanningFailed: 'Beleg-Scan fehlgeschlagen. Bitte geben Sie die Details manuell ein.',
        transactionPendingDescription: 'Transaktion ausstehend. Es kann ein paar Tage dauern, bis sie verbucht wird.',
        companyInfo: 'Unternehmensinformationen',
        companyInfoDescription: 'Wir benötigen noch ein paar weitere Details, bevor Sie Ihre erste Rechnung senden können.',
        yourCompanyName: 'Ihr Firmenname',
        yourCompanyWebsite: 'Ihre Firmenwebsite',
        yourCompanyWebsiteNote: 'Wenn Sie keine Website haben, können Sie stattdessen das LinkedIn-Profil oder das Social-Media-Profil Ihres Unternehmens angeben.',
        invalidDomainError: 'Sie haben eine ungültige Domain eingegeben. Um fortzufahren, geben Sie bitte eine gültige Domain ein.',
        publicDomainError: 'Sie haben eine öffentliche Domain betreten. Um fortzufahren, geben Sie bitte eine private Domain ein.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: function (_a) {
            var _b = _a.scanningReceipts, scanningReceipts = _b === void 0 ? 0 : _b, _c = _a.pendingReceipts, pendingReceipts = _c === void 0 ? 0 : _c;
            var statusText = [];
            if (scanningReceipts > 0) {
                statusText.push("".concat(scanningReceipts, " scannen"));
            }
            if (pendingReceipts > 0) {
                statusText.push("".concat(pendingReceipts, " ausstehend"));
            }
            return {
                one: statusText.length > 0 ? "1 Ausgabe (".concat(statusText.join(', '), ")") : "1 Ausgabe",
                other: function (count) { return (statusText.length > 0 ? "".concat(count, " Ausgaben (").concat(statusText.join(', '), ")") : "".concat(count, " Ausgaben")); },
            };
        },
        expenseCount: function () {
            return {
                one: '1 Ausgabe',
                other: function (count) { return "".concat(count, " Ausgaben"); },
            };
        },
        deleteExpense: function () { return ({
            one: 'Ausgabe löschen',
            other: 'Ausgaben löschen',
        }); },
        deleteConfirmation: function () { return ({
            one: 'Möchten Sie diesen Ausgabenposten wirklich löschen?',
            other: 'Möchten Sie diese Ausgaben wirklich löschen?',
        }); },
        deleteReport: 'Bericht löschen',
        deleteReportConfirmation: 'Möchten Sie diesen Bericht wirklich löschen?',
        settledExpensify: 'Bezahlt',
        done: 'Fertiggestellt',
        settledElsewhere: 'Anderswo bezahlt',
        individual: 'Individuum',
        business: 'Geschäft',
        settleExpensify: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Bezahle ".concat(formattedAmount, " mit Expensify") : "Mit Expensify bezahlen");
        },
        settlePersonal: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Zahlen Sie ".concat(formattedAmount, " als Einzelperson") : "Als Einzelperson bezahlen");
        },
        settlePayment: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return "Zahlen Sie ".concat(formattedAmount);
        },
        settleBusiness: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Zahlen Sie ".concat(formattedAmount, " als Unternehmen") : "Als Unternehmen bezahlen");
        },
        payElsewhere: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Zahle ".concat(formattedAmount, " anderswo") : "Anderswo bezahlen");
        },
        nextStep: 'Nächste Schritte',
        finished: 'Fertiggestellt',
        flip: 'Umkehren',
        sendInvoice: function (_a) {
            var amount = _a.amount;
            return "Sende ".concat(amount, " Rechnung");
        },
        submitAmount: function (_a) {
            var amount = _a.amount;
            return "Einreichen ".concat(amount);
        },
        expenseAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount).concat(comment ? "f\u00FCr ".concat(comment) : '');
        },
        submitted: "eingereicht",
        automaticallySubmitted: "\u00FCber <a href=\"".concat(CONST_1.default.SELECT_WORKFLOWS_HELP_URL, "\">verz\u00F6gerte Einreichungen</a> eingereicht"),
        trackedAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "tracking ".concat(formattedAmount).concat(comment ? "f\u00FCr ".concat(comment) : '');
        },
        splitAmount: function (_a) {
            var amount = _a.amount;
            return "teilen ".concat(amount);
        },
        didSplitAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "split ".concat(formattedAmount).concat(comment ? "f\u00FCr ".concat(comment) : '');
        },
        yourSplit: function (_a) {
            var amount = _a.amount;
            return "Ihr Anteil ".concat(amount);
        },
        payerOwesAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount, comment = _a.comment;
            return "".concat(payer, " schuldet ").concat(amount).concat(comment ? "f\u00FCr ".concat(comment) : '');
        },
        payerOwes: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " schuldet:");
        },
        payerPaidAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount;
            return "".concat(payer ? "".concat(payer, " ") : '', "hat ").concat(amount, " bezahlt");
        },
        payerPaid: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " hat bezahlt:");
        },
        payerSpentAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount;
            return "".concat(payer, " hat ").concat(amount, " ausgegeben");
        },
        payerSpent: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " hat ausgegeben:");
        },
        managerApproved: function (_a) {
            var manager = _a.manager;
            return "".concat(manager, " genehmigt:");
        },
        managerApprovedAmount: function (_a) {
            var manager = _a.manager, amount = _a.amount;
            return "".concat(manager, " hat ").concat(amount, " genehmigt");
        },
        payerSettled: function (_a) {
            var amount = _a.amount;
            return "bezahlt ".concat(amount);
        },
        payerSettledWithMissingBankAccount: function (_a) {
            var amount = _a.amount;
            return "bezahlt ".concat(amount, ". F\u00FCgen Sie ein Bankkonto hinzu, um Ihre Zahlung zu erhalten.");
        },
        automaticallyApproved: "genehmigt \u00FCber <a href=\"".concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">Arbeitsbereichsregeln</a>"),
        approvedAmount: function (_a) {
            var amount = _a.amount;
            return "genehmigt ".concat(amount);
        },
        approvedMessage: "genehmigt",
        unapproved: "nicht genehmigt",
        automaticallyForwarded: "genehmigt \u00FCber <a href=\"".concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">Arbeitsbereichsregeln</a>"),
        forwarded: "genehmigt",
        rejectedThisReport: 'diesen Bericht abgelehnt',
        waitingOnBankAccount: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName;
            return "hat begonnen, die Abrechnung zu erledigen. Die Zahlung wird zur\u00FCckgehalten, bis ".concat(submitterDisplayName, " ein Bankkonto hinzuf\u00FCgt.");
        },
        adminCanceledRequest: function (_a) {
            var manager = _a.manager;
            return "".concat(manager ? "".concat(manager, ": ") : '', " hat die Zahlung storniert");
        },
        canceledRequest: function (_a) {
            var amount = _a.amount, submitterDisplayName = _a.submitterDisplayName;
            return "hat die Zahlung von ".concat(amount, " storniert, weil ").concat(submitterDisplayName, " ihre Expensify Wallet nicht innerhalb von 30 Tagen aktiviert hat");
        },
        settledAfterAddedBankAccount: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName, amount = _a.amount;
            return "".concat(submitterDisplayName, " hat ein Bankkonto hinzugef\u00FCgt. Die Zahlung von ").concat(amount, " wurde geleistet.");
        },
        paidElsewhere: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', "woanders bezahlt");
        },
        paidWithExpensify: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', " mit Expensify bezahlt");
        },
        automaticallyPaidWithExpensify: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', " mit Expensify \u00FCber <a href=\"").concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">Arbeitsbereichsregeln</a> bezahlt");
        },
        noReimbursableExpenses: 'Dieser Bericht hat einen ungültigen Betrag.',
        pendingConversionMessage: 'Der Gesamtbetrag wird aktualisiert, wenn Sie wieder online sind.',
        changedTheExpense: 'die Ausgabe geändert',
        setTheRequest: function (_a) {
            var valueName = _a.valueName, newValueToDisplay = _a.newValueToDisplay;
            return "der ".concat(valueName, " zu ").concat(newValueToDisplay);
        },
        setTheDistanceMerchant: function (_a) {
            var translatedChangedField = _a.translatedChangedField, newMerchant = _a.newMerchant, newAmountToDisplay = _a.newAmountToDisplay;
            return "setzen Sie das ".concat(translatedChangedField, " auf ").concat(newMerchant, ", was den Betrag auf ").concat(newAmountToDisplay, " festlegt");
        },
        removedTheRequest: function (_a) {
            var valueName = _a.valueName, oldValueToDisplay = _a.oldValueToDisplay;
            return "der ".concat(valueName, " (fr\u00FCher ").concat(oldValueToDisplay, ")");
        },
        updatedTheRequest: function (_a) {
            var valueName = _a.valueName, newValueToDisplay = _a.newValueToDisplay, oldValueToDisplay = _a.oldValueToDisplay;
            return "der ".concat(valueName, " zu ").concat(newValueToDisplay, " (zuvor ").concat(oldValueToDisplay, ")");
        },
        updatedTheDistanceMerchant: function (_a) {
            var translatedChangedField = _a.translatedChangedField, newMerchant = _a.newMerchant, oldMerchant = _a.oldMerchant, newAmountToDisplay = _a.newAmountToDisplay, oldAmountToDisplay = _a.oldAmountToDisplay;
            return "\u00E4nderte das ".concat(translatedChangedField, " zu ").concat(newMerchant, " (zuvor ").concat(oldMerchant, "), wodurch der Betrag auf ").concat(newAmountToDisplay, " aktualisiert wurde (zuvor ").concat(oldAmountToDisplay, ")");
        },
        threadExpenseReportName: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount, " ").concat(comment ? "f\u00FCr ".concat(comment) : 'Ausgabe');
        },
        invoiceReportName: function (_a) {
            var linkedReportID = _a.linkedReportID;
            return "Rechnungsbericht Nr. ".concat(linkedReportID);
        },
        threadPaySomeoneReportName: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount, " gesendet").concat(comment ? "f\u00FCr ".concat(comment) : '');
        },
        movedFromPersonalSpace: function (_a) {
            var workspaceName = _a.workspaceName, reportName = _a.reportName;
            return "verschobene Ausgabe von pers\u00F6nlichem Bereich zu ".concat(workspaceName !== null && workspaceName !== void 0 ? workspaceName : "chatten mit ".concat(reportName));
        },
        movedToPersonalSpace: 'Ausgabe in den persönlichen Bereich verschoben',
        tagSelection: 'Wählen Sie ein Tag aus, um Ihre Ausgaben besser zu organisieren.',
        categorySelection: 'Wählen Sie eine Kategorie, um Ihre Ausgaben besser zu organisieren.',
        error: {
            invalidCategoryLength: 'Der Kategoriename überschreitet 255 Zeichen. Bitte kürzen Sie ihn oder wählen Sie eine andere Kategorie.',
            invalidTagLength: 'Der Tag-Name überschreitet 255 Zeichen. Bitte kürzen Sie ihn oder wählen Sie einen anderen Tag.',
            invalidAmount: 'Bitte geben Sie einen gültigen Betrag ein, bevor Sie fortfahren.',
            invalidIntegerAmount: 'Bitte geben Sie einen ganzen Dollarbetrag ein, bevor Sie fortfahren.',
            invalidTaxAmount: function (_a) {
                var amount = _a.amount;
                return "Der maximale Steuerbetrag betr\u00E4gt ".concat(amount);
            },
            invalidSplit: 'Die Summe der Aufteilungen muss dem Gesamtbetrag entsprechen.',
            invalidSplitParticipants: 'Bitte geben Sie einen Betrag größer als null für mindestens zwei Teilnehmer ein.',
            invalidSplitYourself: 'Bitte geben Sie einen Betrag ungleich null für Ihre Aufteilung ein.',
            noParticipantSelected: 'Bitte wählen Sie einen Teilnehmer aus',
            other: 'Unerwarteter Fehler. Bitte versuchen Sie es später noch einmal.',
            genericCreateFailureMessage: 'Unerwarteter Fehler beim Einreichen dieser Ausgabe. Bitte versuchen Sie es später erneut.',
            genericCreateInvoiceFailureMessage: 'Unerwarteter Fehler beim Senden dieser Rechnung. Bitte versuchen Sie es später erneut.',
            genericHoldExpenseFailureMessage: 'Unerwarteter Fehler beim Halten dieser Ausgabe. Bitte versuchen Sie es später erneut.',
            genericUnholdExpenseFailureMessage: 'Unerwarteter Fehler beim Entfernen dieser Ausgabe von der Warteschleife. Bitte versuchen Sie es später erneut.',
            receiptDeleteFailureError: 'Unerwarteter Fehler beim Löschen dieser Quittung. Bitte versuchen Sie es später erneut.',
            receiptFailureMessage: 'Beim Hochladen Ihrer Quittung ist ein Fehler aufgetreten. Bitte',
            receiptFailureMessageShort: 'Beim Hochladen Ihres Belegs ist ein Fehler aufgetreten.',
            tryAgainMessage: 'nochmals versuchen',
            saveFileMessage: 'Beleg speichern',
            uploadLaterMessage: 'später hochladen.',
            genericDeleteFailureMessage: 'Unerwarteter Fehler beim Löschen dieser Ausgabe. Bitte versuchen Sie es später erneut.',
            genericEditFailureMessage: 'Unerwarteter Fehler beim Bearbeiten dieser Ausgabe. Bitte versuchen Sie es später erneut.',
            genericSmartscanFailureMessage: 'Transaktion fehlt Felder',
            duplicateWaypointsErrorMessage: 'Bitte entfernen Sie doppelte Wegpunkte',
            atLeastTwoDifferentWaypoints: 'Bitte geben Sie mindestens zwei verschiedene Adressen ein.',
            splitExpenseMultipleParticipantsErrorMessage: 'Eine Ausgabe kann nicht zwischen einem Arbeitsbereich und anderen Mitgliedern aufgeteilt werden. Bitte aktualisieren Sie Ihre Auswahl.',
            invalidMerchant: 'Bitte geben Sie einen gültigen Händler ein',
            atLeastOneAttendee: 'Mindestens ein Teilnehmer muss ausgewählt werden.',
            invalidQuantity: 'Bitte geben Sie eine gültige Menge ein',
            quantityGreaterThanZero: 'Die Menge muss größer als null sein',
            invalidSubrateLength: 'Es muss mindestens einen Untertarif geben.',
            invalidRate: 'Der Tarif ist für diesen Arbeitsbereich nicht gültig. Bitte wählen Sie einen verfügbaren Tarif aus dem Arbeitsbereich aus.',
        },
        dismissReceiptError: 'Fehler ignorieren',
        dismissReceiptErrorConfirmation: 'Achtung! Wenn Sie diesen Fehler ignorieren, wird Ihre hochgeladene Quittung vollständig entfernt. Sind Sie sicher?',
        waitingOnEnabledWallet: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName;
            return "hat begonnen, die Abrechnung vorzunehmen. Die Zahlung wird zur\u00FCckgehalten, bis ".concat(submitterDisplayName, " ihre Wallet aktiviert.");
        },
        enableWallet: 'Wallet aktivieren',
        hold: 'Halten',
        unhold: 'Halten entfernen',
        holdExpense: 'Ausgabe zurückhalten',
        unholdExpense: 'Ausgabe freigeben',
        heldExpense: 'diese Ausgabe zurückgehalten',
        unheldExpense: 'diese Ausgabe freigegeben',
        moveUnreportedExpense: 'Nicht gemeldete Ausgabe verschieben',
        addUnreportedExpense: 'Nicht gemeldete Ausgabe hinzufügen',
        createNewExpense: 'Neue Ausgabe erstellen',
        selectUnreportedExpense: 'Wählen Sie mindestens eine Ausgabe aus, die dem Bericht hinzugefügt werden soll.',
        emptyStateUnreportedExpenseTitle: 'Keine nicht gemeldeten Ausgaben',
        emptyStateUnreportedExpenseSubtitle: 'Es sieht so aus, als hätten Sie keine nicht gemeldeten Ausgaben. Versuchen Sie, unten eine zu erstellen.',
        addUnreportedExpenseConfirm: 'Zum Bericht hinzufügen',
        explainHold: 'Erklären Sie, warum Sie diese Ausgabe zurückhalten.',
        undoSubmit: 'Senden rückgängig machen',
        retracted: 'zurückgezogen',
        undoClose: 'Schließen rückgängig machen',
        reopened: 'wieder geöffnet',
        reopenReport: 'Bericht wieder öffnen',
        reopenExportedReportConfirmation: function (_a) {
            var connectionName = _a.connectionName;
            return "Dieser Bericht wurde bereits nach ".concat(connectionName, " exportiert. \u00C4nderungen daran k\u00F6nnen zu Datenabweichungen f\u00FChren. Sind Sie sicher, dass Sie diesen Bericht erneut \u00F6ffnen m\u00F6chten?");
        },
        reason: 'Grund',
        holdReasonRequired: 'Ein Grund ist erforderlich, wenn gehalten wird.',
        expenseWasPutOnHold: 'Ausgabe wurde zurückgestellt',
        expenseOnHold: 'Diese Ausgabe wurde zurückgestellt. Bitte überprüfen Sie die Kommentare für die nächsten Schritte.',
        expensesOnHold: 'Alle Ausgaben wurden zurückgestellt. Bitte überprüfen Sie die Kommentare für die nächsten Schritte.',
        expenseDuplicate: 'Diese Ausgabe hat ähnliche Details wie eine andere. Bitte überprüfen Sie die Duplikate, um fortzufahren.',
        someDuplicatesArePaid: 'Einige dieser Duplikate wurden bereits genehmigt oder bezahlt.',
        reviewDuplicates: 'Duplikate überprüfen',
        keepAll: 'Alles behalten',
        confirmApprove: 'Betrag der Genehmigung bestätigen',
        confirmApprovalAmount: 'Genehmigen Sie nur konforme Ausgaben oder genehmigen Sie den gesamten Bericht.',
        confirmApprovalAllHoldAmount: function () { return ({
            one: 'Diese Ausgabe ist zurückgestellt. Möchten Sie trotzdem genehmigen?',
            other: 'Diese Ausgaben sind zurückgestellt. Möchten Sie trotzdem genehmigen?',
        }); },
        confirmPay: 'Zahlungsbetrag bestätigen',
        confirmPayAmount: 'Bezahlen Sie, was nicht zurückgehalten wird, oder bezahlen Sie den gesamten Bericht.',
        confirmPayAllHoldAmount: function () { return ({
            one: 'Diese Ausgabe ist zurückgestellt. Möchten Sie trotzdem bezahlen?',
            other: 'Diese Ausgaben sind zurückgestellt. Möchten Sie trotzdem bezahlen?',
        }); },
        payOnly: 'Nur bezahlen',
        approveOnly: 'Nur genehmigen',
        holdEducationalTitle: 'Diese Anfrage ist an',
        holdEducationalText: 'halten',
        whatIsHoldExplain: 'Halten ist wie das Drücken der „Pause“-Taste bei einer Ausgabe, um vor der Genehmigung oder Zahlung nach weiteren Details zu fragen.',
        holdIsLeftBehind: 'Zurückgehaltene Ausgaben werden nach Genehmigung oder Zahlung in einen anderen Bericht verschoben.',
        unholdWhenReady: 'Genehmiger können Ausgaben freigeben, wenn sie zur Genehmigung oder Zahlung bereit sind.',
        changePolicyEducational: {
            title: 'Du hast diesen Bericht verschoben!',
            description: 'Überprüfen Sie diese Punkte, die sich beim Verschieben von Berichten in einen neuen Arbeitsbereich ändern können.',
            reCategorize: '<strong>Kategorisieren Sie alle Ausgaben neu</strong>, um den Arbeitsbereichsregeln zu entsprechen.',
            workflows: 'Dieser Bericht kann nun einem anderen <strong>Genehmigungsworkflow</strong> unterliegen.',
        },
        changeWorkspace: 'Arbeitsbereich ändern',
        set: 'set',
        changed: 'geändert',
        removed: 'entfernt',
        transactionPending: 'Transaktion ausstehend.',
        chooseARate: 'Wählen Sie einen Erstattungssatz pro Meile oder Kilometer für den Arbeitsbereich aus',
        unapprove: 'Nicht genehmigen',
        unapproveReport: 'Bericht nicht genehmigen',
        headsUp: 'Achtung!',
        unapproveWithIntegrationWarning: function (_a) {
            var accountingIntegration = _a.accountingIntegration;
            return "Dieser Bericht wurde bereits nach ".concat(accountingIntegration, " exportiert. Eine \u00C4nderung kann zu Datenabweichungen f\u00FChren. Sind Sie sicher, dass Sie diesen Bericht nicht genehmigen m\u00F6chten?");
        },
        reimbursable: 'erstattungsfähig',
        nonReimbursable: 'nicht erstattungsfähig',
        bookingPending: 'Diese Buchung ist ausstehend',
        bookingPendingDescription: 'Diese Buchung ist ausstehend, weil sie noch nicht bezahlt wurde.',
        bookingArchived: 'Diese Buchung ist archiviert',
        bookingArchivedDescription: 'Diese Buchung ist archiviert, weil das Reisedatum verstrichen ist. Fügen Sie bei Bedarf eine Ausgabe für den Endbetrag hinzu.',
        attendees: 'Teilnehmer',
        whoIsYourAccountant: 'Wer ist Ihr Buchhalter?',
        paymentComplete: 'Zahlung abgeschlossen',
        time: 'Zeit',
        startDate: 'Startdatum',
        endDate: 'Enddatum',
        startTime: 'Startzeit',
        endTime: 'Endzeit',
        deleteSubrate: 'Subrate löschen',
        deleteSubrateConfirmation: 'Möchten Sie diesen Untertarif wirklich löschen?',
        quantity: 'Menge',
        subrateSelection: 'Wählen Sie einen Untertarif und geben Sie eine Menge ein.',
        qty: 'Menge',
        firstDayText: function () { return ({
            one: "Erster Tag: 1 Stunde",
            other: function (count) { return "Erster Tag: ".concat(count.toFixed(2), " Stunden"); },
        }); },
        lastDayText: function () { return ({
            one: "Letzter Tag: 1 Stunde",
            other: function (count) { return "Letzter Tag: ".concat(count.toFixed(2), " Stunden"); },
        }); },
        tripLengthText: function () { return ({
            one: "Reise: 1 ganzer Tag",
            other: function (count) { return "Reise: ".concat(count, " volle Tage"); },
        }); },
        dates: 'Daten',
        rates: 'Preise',
        submitsTo: function (_a) {
            var name = _a.name;
            return "\u00DCbermittelt an ".concat(name);
        },
        moveExpenses: function () { return ({ one: 'Ausgabe verschieben', other: 'Ausgaben verschieben' }); },
    },
    share: {
        shareToExpensify: 'Teilen mit Expensify',
        messageInputLabel: 'Nachricht',
    },
    notificationPreferencesPage: {
        header: 'Benachrichtigungseinstellungen',
        label: 'Benachrichtige mich über neue Nachrichten',
        notificationPreferences: {
            always: 'Sofort',
            daily: 'Täglich',
            mute: 'Stumm schalten',
            hidden: 'Hidden',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Die Nummer wurde nicht validiert. Klicken Sie auf die Schaltfläche, um den Validierungslink per SMS erneut zu senden.',
        emailHasNotBeenValidated: 'Die E-Mail wurde nicht verifiziert. Klicken Sie auf die Schaltfläche, um den Bestätigungslink per SMS erneut zu senden.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Foto hochladen',
        removePhoto: 'Foto entfernen',
        editImage: 'Foto bearbeiten',
        viewPhoto: 'Foto ansehen',
        imageUploadFailed: 'Bild-Upload fehlgeschlagen',
        deleteWorkspaceError: 'Entschuldigung, es gab ein unerwartetes Problem beim Löschen Ihres Arbeitsbereich-Avatars.',
        sizeExceeded: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "Das ausgew\u00E4hlte Bild \u00FCberschreitet die maximale Upload-Gr\u00F6\u00DFe von ".concat(maxUploadSizeInMB, " MB.");
        },
        resolutionConstraints: function (_a) {
            var minHeightInPx = _a.minHeightInPx, minWidthInPx = _a.minWidthInPx, maxHeightInPx = _a.maxHeightInPx, maxWidthInPx = _a.maxWidthInPx;
            return "Bitte laden Sie ein Bild hoch, das gr\u00F6\u00DFer als ".concat(minHeightInPx, "x").concat(minWidthInPx, " Pixel und kleiner als ").concat(maxHeightInPx, "x").concat(maxWidthInPx, " Pixel ist.");
        },
        notAllowedExtension: function (_a) {
            var allowedExtensions = _a.allowedExtensions;
            return "Das Profilbild muss einer der folgenden Typen sein: ".concat(allowedExtensions.join(', '), ".");
        },
    },
    modal: {
        backdropLabel: 'Modal-Hintergrund',
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Bevorzugte Pronomen',
        selectYourPronouns: 'Wählen Sie Ihre Pronomen aus',
        selfSelectYourPronoun: 'Wählen Sie Ihr Pronomen selbst aus',
        emailAddress: 'E-Mail-Adresse',
        setMyTimezoneAutomatically: 'Zeitzone automatisch einstellen',
        timezone: 'Zeitzone',
        invalidFileMessage: 'Ungültige Datei. Bitte versuchen Sie es mit einem anderen Bild.',
        avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchronisieren',
        profileAvatar: 'Profil-Avatar',
        publicSection: {
            title: 'Öffentlich',
            subtitle: 'Diese Details werden in Ihrem öffentlichen Profil angezeigt. Jeder kann sie sehen.',
        },
        privateSection: {
            title: 'Privat',
            subtitle: 'Diese Angaben werden für Reisen und Zahlungen verwendet. Sie werden niemals in Ihrem öffentlichen Profil angezeigt.',
        },
    },
    securityPage: {
        title: 'Sicherheitsoptionen',
        subtitle: 'Aktivieren Sie die Zwei-Faktor-Authentifizierung, um Ihr Konto zu schützen.',
        goToSecurity: 'Zurück zur Sicherheitsseite',
    },
    shareCodePage: {
        title: 'Ihr Code',
        subtitle: 'Laden Sie Mitglieder zu Expensify ein, indem Sie Ihren persönlichen QR-Code oder Empfehlungslink teilen.',
    },
    pronounsPage: {
        pronouns: 'Pronomen',
        isShownOnProfile: 'Ihre Pronomen werden in Ihrem Profil angezeigt.',
        placeholderText: 'Suchen, um Optionen zu sehen',
    },
    contacts: {
        contactMethod: 'Kontaktmethode',
        contactMethods: 'Kontaktmethoden',
        featureRequiresValidate: 'Diese Funktion erfordert, dass Sie Ihr Konto verifizieren.',
        validateAccount: 'Bestätigen Sie Ihr Konto',
        helpTextBeforeEmail: 'Fügen Sie weitere Möglichkeiten hinzu, damit Leute Sie finden können, und leiten Sie Belege weiter an',
        helpTextAfterEmail: 'von mehreren E-Mail-Adressen.',
        pleaseVerify: 'Bitte überprüfen Sie diese Kontaktmethode',
        getInTouch: 'Wann immer wir mit Ihnen in Kontakt treten müssen, werden wir diese Kontaktmethode verwenden.',
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Bitte geben Sie den magischen Code ein, der an ".concat(contactMethod, " gesendet wurde. Er sollte in ein bis zwei Minuten ankommen.");
        },
        setAsDefault: 'Als Standard festlegen',
        yourDefaultContactMethod: 'Dies ist Ihre aktuelle Standardkontaktmethode. Bevor Sie sie löschen können, müssen Sie eine andere Kontaktmethode auswählen und auf „Als Standard festlegen“ klicken.',
        removeContactMethod: 'Kontaktmethode entfernen',
        removeAreYouSure: 'Möchten Sie diese Kontaktmethode wirklich entfernen? Diese Aktion kann nicht rückgängig gemacht werden.',
        failedNewContact: 'Fehler beim Hinzufügen dieser Kontaktmethode.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Fehler beim Senden eines neuen magischen Codes. Bitte warten Sie einen Moment und versuchen Sie es erneut.',
            validateSecondaryLogin: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            deleteContactMethod: 'Löschen der Kontaktmethode fehlgeschlagen. Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
            setDefaultContactMethod: 'Fehler beim Festlegen einer neuen Standardkontaktmethode. Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
            addContactMethod: 'Fehler beim Hinzufügen dieser Kontaktmethode. Bitte wenden Sie sich an Concierge, um Hilfe zu erhalten.',
            enteredMethodIsAlreadySubmitted: 'Diese Kontaktmethode existiert bereits.',
            passwordRequired: 'Passwort erforderlich.',
            contactMethodRequired: 'Kontaktmethode ist erforderlich',
            invalidContactMethod: 'Ungültige Kontaktmethode',
        },
        newContactMethod: 'Neue Kontaktmethode',
        goBackContactMethods: 'Zurück zu den Kontaktmethoden',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'Er / Ihn / Sein',
        heHimHisTheyThemTheirs: 'Er / Ihn / Sein / Sie / Ihnen / Ihr',
        sheHerHers: 'Sie / Ihr / Ihre',
        sheHerHersTheyThemTheirs: 'Sie / Ihr / Ihre / Sie / Ihnen / Ihre',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'They / Them / Theirs',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ansehen / Anzeigen / Anzeigen',
        viVir: 'Vi / Vir',
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
        getLocationAutomatically: 'Bestimmen Sie automatisch Ihren Standort',
    },
    updateRequiredView: {
        updateRequired: 'Aktualisierung erforderlich',
        pleaseInstall: 'Bitte aktualisieren Sie auf die neueste Version von New Expensify.',
        pleaseInstallExpensifyClassic: 'Bitte installieren Sie die neueste Version von Expensify.',
        toGetLatestChanges: 'Für Mobilgeräte oder Desktop, laden Sie die neueste Version herunter und installieren Sie sie. Für das Web, aktualisieren Sie Ihren Browser.',
        newAppNotAvailable: 'Die neue Expensify-App ist nicht mehr verfügbar.',
    },
    initialSettingsPage: {
        about: 'Über',
        aboutPage: {
            description: 'Die neue Expensify-App wird von einer Gemeinschaft von Open-Source-Entwicklern aus der ganzen Welt entwickelt. Helfen Sie uns, die Zukunft von Expensify zu gestalten.',
            appDownloadLinks: 'App-Download-Links',
            viewKeyboardShortcuts: 'Tastenkombinationen anzeigen',
            viewTheCode: 'Code anzeigen',
            viewOpenJobs: 'Offene Stellen anzeigen',
            reportABug: 'Einen Fehler melden',
            troubleshoot: 'Fehlerbehebung',
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
            viewConsole: 'Debug-Konsole anzeigen',
            debugConsole: 'Debug-Konsole',
            description: 'Verwenden Sie die untenstehenden Tools, um das Expensify-Erlebnis zu unterstützen. Wenn Sie auf Probleme stoßen, bitte',
            submitBug: 'einen Fehler melden',
            confirmResetDescription: 'Alle nicht gesendeten Entwurfsnachrichten gehen verloren, aber der Rest Ihrer Daten ist sicher.',
            resetAndRefresh: 'Zurücksetzen und aktualisieren',
            clientSideLogging: 'Client-seitiges Logging',
            noLogsToShare: 'Keine Protokolle zum Teilen',
            useProfiling: 'Profiling verwenden',
            profileTrace: 'Profilverlauf',
            results: 'Ergebnisse',
            releaseOptions: 'Veröffentlichungsoptionen',
            testingPreferences: 'Präferenzen testen',
            useStagingServer: 'Staging-Server verwenden',
            forceOffline: 'Offline erzwingen',
            simulatePoorConnection: 'Schlechte Internetverbindung simulieren',
            simulateFailingNetworkRequests: 'Netzwerkanfragen simulieren, die fehlschlagen',
            authenticationStatus: 'Authentifizierungsstatus',
            deviceCredentials: 'Geräteanmeldedaten',
            invalidate: 'Ungültig machen',
            destroy: 'Zerstören',
            maskExportOnyxStateData: 'Maskieren Sie sensible Mitgliederdaten beim Exportieren des Onyx-Zustands',
            exportOnyxState: 'Exportieren Sie den Onyx-Zustand',
            importOnyxState: 'Onyx-Status importieren',
            testCrash: 'Testabsturz',
            resetToOriginalState: 'Auf den ursprünglichen Zustand zurücksetzen',
            usingImportedState: 'Sie verwenden importierten Status. Drücken Sie hier, um ihn zu löschen.',
            debugMode: 'Debug-Modus',
            invalidFile: 'Ungültige Datei',
            invalidFileDescription: 'Die Datei, die Sie importieren möchten, ist ungültig. Bitte versuchen Sie es erneut.',
            invalidateWithDelay: 'Mit Verzögerung ungültig machen',
            recordTroubleshootData: 'Daten zur Fehlerbehebung aufzeichnen',
        },
        debugConsole: {
            saveLog: 'Protokoll speichern',
            shareLog: 'Protokoll teilen',
            enterCommand: 'Befehl eingeben',
            execute: 'Ausführen',
            noLogsAvailable: 'Keine Protokolle verfügbar',
            logSizeTooLarge: function (_a) {
                var size = _a.size;
                return "Protokollgr\u00F6\u00DFe \u00FCberschreitet das Limit von ".concat(size, " MB. Bitte verwenden Sie \"Protokoll speichern\", um die Protokolldatei stattdessen herunterzuladen.");
            },
            logs: 'Protokolle',
            viewConsole: 'Konsole anzeigen',
        },
        security: 'Sicherheit',
        signOut: 'Abmelden',
        restoreStashed: 'Wiederherstellen des zwischengespeicherten Logins',
        signOutConfirmationText: 'Sie verlieren alle Offline-Änderungen, wenn Sie sich abmelden.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: 'Lesen Sie die',
            phrase2: 'Nutzungsbedingungen',
            phrase3: 'und',
            phrase4: 'Datenschutz',
        },
        help: 'Hilfe',
        accountSettings: 'Kontoeinstellungen',
        account: 'Konto',
        general: 'Allgemein',
    },
    closeAccountPage: {
        closeAccount: 'Konto schließen',
        reasonForLeavingPrompt: 'Wir würden es bedauern, Sie gehen zu sehen! Würden Sie uns freundlicherweise mitteilen, warum, damit wir uns verbessern können?',
        enterMessageHere: 'Nachricht hier eingeben',
        closeAccountWarning: 'Das Schließen Ihres Kontos kann nicht rückgängig gemacht werden.',
        closeAccountPermanentlyDeleteData: 'Möchten Sie Ihr Konto wirklich löschen? Dadurch werden alle ausstehenden Ausgaben dauerhaft gelöscht.',
        enterDefaultContactToConfirm: 'Bitte geben Sie Ihre Standardkontaktmethode ein, um zu bestätigen, dass Sie Ihr Konto schließen möchten. Ihre Standardkontaktmethode ist:',
        enterDefaultContact: 'Geben Sie Ihre Standardkontaktmethode ein',
        defaultContact: 'Standardkontaktmethode:',
        enterYourDefaultContactMethod: 'Bitte geben Sie Ihre Standardkontaktmethode ein, um Ihr Konto zu schließen.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Konten zusammenführen',
        accountDetails: {
            accountToMergeInto: 'Geben Sie das Konto ein, in das Sie zusammenführen möchten.',
            notReversibleConsent: 'Ich verstehe, dass dies nicht umkehrbar ist.',
        },
        accountValidate: {
            confirmMerge: 'Möchten Sie die Konten wirklich zusammenführen?',
            lossOfUnsubmittedData: "Das Zusammenf\u00FChren Ihrer Konten ist unwiderruflich und f\u00FChrt zum Verlust aller nicht eingereichten Ausgaben f\u00FCr",
            enterMagicCode: "Um fortzufahren, geben Sie bitte den magischen Code ein, der an  gesendet wurde.",
            errors: {
                incorrectMagicCode: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
                fallback: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konten zusammengeführt!',
            successfullyMergedAllData: {
                beforeFirstEmail: "Sie haben erfolgreich alle Daten von zusammengef\u00FChrt.",
                beforeSecondEmail: "in",
                afterSecondEmail: ". Zuk\u00FCnftig k\u00F6nnen Sie entweder Login f\u00FCr dieses Konto verwenden.",
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Wir arbeiten daran.',
            limitedSupport: 'Wir unterstützen das Zusammenführen von Konten in New Expensify noch nicht. Bitte führen Sie diese Aktion stattdessen in Expensify Classic aus.',
            reachOutForHelp: {
                beforeLink: 'Fühlen Sie sich frei, zu',
                linkText: 'Wenden Sie sich an Concierge.',
                afterLink: 'wenn Sie Fragen haben!',
            },
            goToExpensifyClassic: 'Gehe zu Expensify Classic',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: 'Sie können nicht zusammenführen',
            beforeDomain: 'weil es kontrolliert wird von',
            afterDomain: '. Bitte',
            linkText: 'Wenden Sie sich an Concierge.',
            afterLink: 'für Unterstützung.',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: 'Sie können nicht zusammenführen',
            afterEmail: 'in andere Konten, da Ihr Domain-Administrator es als Ihren primären Login festgelegt hat. Bitte führen Sie stattdessen andere Konten damit zusammen.',
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: 'Sie können Konten nicht zusammenführen, weil',
                beforeSecondEmail: 'hat die Zwei-Faktor-Authentifizierung (2FA) aktiviert. Bitte deaktivieren Sie 2FA für',
                afterSecondEmail: 'und versuche es erneut.',
            },
            learnMore: 'Erfahren Sie mehr über das Zusammenführen von Konten.',
        },
        mergeFailureAccountLocked: {
            beforeEmail: 'Sie können nicht zusammenführen',
            afterEmail: 'weil es gesperrt ist. Bitte',
            linkText: 'wenden Sie sich an Concierge',
            afterLink: "f\u00FCr Unterst\u00FCtzung.",
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: 'Sie können Konten nicht zusammenführen, weil',
                afterEmail: 'hat kein Expensify-Konto.',
            },
            addContactMethod: {
                beforeLink: 'Bitte',
                linkText: 'als Kontaktmethode hinzufügen',
                afterLink: 'stattdessen.',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: 'Sie können nicht zusammenführen',
            afterEmail: 'in andere Konten. Bitte fügen Sie stattdessen andere Konten zusammen.',
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: 'Sie können nicht zusammenführen',
            afterEmail: 'in andere Konten, da es der Rechnungsinhaber eines fakturierten Kontos ist. Bitte stattdessen andere Konten damit zusammenführen.',
        },
        mergeFailureTooManyAttempts: {
            heading: 'Versuchen Sie es später noch einmal.',
            description: 'Es gab zu viele Versuche, Konten zusammenzuführen. Bitte versuchen Sie es später erneut.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Sie können nicht in andere Konten zusammenführen, da es nicht verifiziert ist. Bitte verifizieren Sie das Konto und versuchen Sie es erneut.',
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
        compromisedDescription: 'Etwas stimmt nicht mit deinem Konto? Eine Meldung sperrt dein Konto sofort, stoppt neue Expensify Card-Transaktionen und verhindert Änderungen.',
        domainAdminsDescription: 'Für Domain-Admins: Dies pausiert auch alle Aktivitäten und Admin-Aktionen der Expensify Card in deiner Domain.',
        areYouSure: 'Bist du sicher, dass du dein Expensify-Konto sperren willst?',
        ourTeamWill: 'Unser Team wird den Zugriff prüfen und unbefugte Aktivitäten entfernen. Um wieder Zugriff zu erhalten, arbeite bitte mit Concierge zusammen.',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Konto konnte nicht gesperrt werden',
        failedToLockAccountDescription: "Wir konnten Ihr Konto nicht sperren. Bitte chatten Sie mit Concierge, um dieses Problem zu l\u00F6sen.",
        chatWithConcierge: 'Chatten Sie mit Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Konto gesperrt',
        yourAccountIsLocked: 'Ihr Konto ist gesperrt',
        chatToConciergeToUnlock: 'Chatten Sie mit Concierge, um Sicherheitsbedenken zu klären und Ihr Konto freizuschalten.',
        chatWithConcierge: 'Chatten Sie mit Concierge',
    },
    passwordPage: {
        changePassword: 'Passwort ändern',
        changingYourPasswordPrompt: 'Wenn Sie Ihr Passwort ändern, wird Ihr Passwort sowohl für Ihr Expensify.com- als auch für Ihr New Expensify-Konto aktualisiert.',
        currentPassword: 'Aktuelles Passwort',
        newPassword: 'Neues Passwort',
        newPasswordPrompt: 'Ihr neues Passwort muss sich von Ihrem alten Passwort unterscheiden und mindestens 8 Zeichen, 1 Großbuchstaben, 1 Kleinbuchstaben und 1 Zahl enthalten.',
    },
    twoFactorAuth: {
        headerTitle: 'Zwei-Faktor-Authentifizierung',
        twoFactorAuthEnabled: 'Zwei-Faktor-Authentifizierung aktiviert',
        whatIsTwoFactorAuth: 'Die Zwei-Faktor-Authentifizierung (2FA) hilft, Ihr Konto sicher zu halten. Beim Einloggen müssen Sie einen Code eingeben, der von Ihrer bevorzugten Authentifizierungs-App generiert wird.',
        disableTwoFactorAuth: 'Zwei-Faktor-Authentifizierung deaktivieren',
        explainProcessToRemove: 'Um die Zwei-Faktor-Authentifizierung (2FA) zu deaktivieren, geben Sie bitte einen gültigen Code aus Ihrer Authentifizierungs-App ein.',
        disabled: 'Die Zwei-Faktor-Authentifizierung ist jetzt deaktiviert.',
        noAuthenticatorApp: 'Sie benötigen keine Authentifizierungs-App mehr, um sich bei Expensify anzumelden.',
        stepCodes: 'Wiederherstellungscodes',
        keepCodesSafe: 'Bewahren Sie diese Wiederherstellungscodes sicher auf!',
        codesLoseAccess: 'Wenn Sie den Zugriff auf Ihre Authentifizierungs-App verlieren und diese Codes nicht haben, verlieren Sie den Zugriff auf Ihr Konto.\n\nHinweis: Das Einrichten der Zwei-Faktor-Authentifizierung wird Sie aus allen anderen aktiven Sitzungen abmelden.',
        errorStepCodes: 'Bitte kopieren oder laden Sie die Codes herunter, bevor Sie fortfahren.',
        stepVerify: 'Überprüfen',
        scanCode: 'Scannen Sie den QR-Code mit Ihrem',
        authenticatorApp: 'Authentifikator-App',
        addKey: 'Oder fügen Sie diesen geheimen Schlüssel zu Ihrer Authentifizierungs-App hinzu:',
        enterCode: 'Geben Sie dann den sechsstelligen Code ein, der von Ihrer Authentifizierungs-App generiert wurde.',
        stepSuccess: 'Fertiggestellt',
        enabled: 'Zwei-Faktor-Authentifizierung aktiviert',
        congrats: 'Glückwunsch! Jetzt hast du diese zusätzliche Sicherheit.',
        copy: 'Kopieren',
        disable: 'Deaktivieren',
        enableTwoFactorAuth: 'Zwei-Faktor-Authentifizierung aktivieren',
        pleaseEnableTwoFactorAuth: 'Bitte aktivieren Sie die Zwei-Faktor-Authentifizierung.',
        twoFactorAuthIsRequiredDescription: 'Aus Sicherheitsgründen erfordert Xero eine Zwei-Faktor-Authentifizierung, um die Integration zu verbinden.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Zwei-Faktor-Authentifizierung erforderlich',
        twoFactorAuthIsRequiredForAdminsTitle: 'Bitte aktivieren Sie die Zwei-Faktor-Authentifizierung',
        twoFactorAuthIsRequiredForAdminsDescription: 'Ihre Xero-Buchhaltungsverbindung erfordert die Verwendung der Zwei-Faktor-Authentifizierung. Um Expensify weiterhin zu nutzen, aktivieren Sie diese bitte.',
        twoFactorAuthCannotDisable: '2FA kann nicht deaktiviert werden.',
        twoFactorAuthRequired: 'Die Zwei-Faktor-Authentifizierung (2FA) ist für Ihre Xero-Verbindung erforderlich und kann nicht deaktiviert werden.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Bitte geben Sie Ihren Wiederherstellungscode ein',
            incorrectRecoveryCode: 'Falscher Wiederherstellungscode. Bitte versuche es erneut.',
        },
        useRecoveryCode: 'Wiederherstellungscode verwenden',
        recoveryCode: 'Wiederherstellungscode',
        use2fa: 'Verwenden Sie den Zwei-Faktor-Authentifizierungscode',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Bitte geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein',
            incorrect2fa: 'Falscher Zwei-Faktor-Authentifizierungscode. Bitte versuchen Sie es erneut.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Passwort aktualisiert!',
        allSet: 'Alles erledigt. Bewahren Sie Ihr neues Passwort sicher auf.',
    },
    privateNotes: {
        title: 'Private Notizen',
        personalNoteMessage: 'Notizen zu diesem Chat hier festhalten. Sie sind die einzige Person, die diese Notizen hinzufügen, bearbeiten oder einsehen kann.',
        sharedNoteMessage: 'Notizen zu diesem Chat hier festhalten. Expensify-Mitarbeiter und andere Mitglieder der team.expensify.com-Domain können diese Notizen einsehen.',
        composerLabel: 'Notizen',
        myNote: 'Meine Notiz',
        error: {
            genericFailureMessage: 'Private Notizen konnten nicht gespeichert werden',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Bitte geben Sie einen gültigen Sicherheitscode ein',
        },
        securityCode: 'Sicherheitscode',
        changeBillingCurrency: 'Rechnungswährung ändern',
        changePaymentCurrency: 'Zahlungswährung ändern',
        paymentCurrency: 'Zahlungswährung',
        paymentCurrencyDescription: 'Wählen Sie eine standardisierte Währung, in die alle persönlichen Ausgaben umgerechnet werden sollen.',
        note: 'Hinweis: Das Ändern Ihrer Zahlungsmethode kann beeinflussen, wie viel Sie für Expensify bezahlen. Beziehen Sie sich auf unsere',
        noteLink: 'Preisseite',
        noteDetails: 'für vollständige Details.',
    },
    addDebitCardPage: {
        addADebitCard: 'Fügen Sie eine Debitkarte hinzu',
        nameOnCard: 'Name auf der Karte',
        debitCardNumber: 'Debitkartennummer',
        expiration: 'Ablaufdatum',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Rechnungsadresse',
        growlMessageOnSave: 'Ihre Debitkarte wurde erfolgreich hinzugefügt',
        expensifyPassword: 'Expensify-Passwort',
        error: {
            invalidName: 'Name darf nur Buchstaben enthalten',
            addressZipCode: 'Bitte geben Sie eine gültige Postleitzahl ein',
            debitCardNumber: 'Bitte geben Sie eine gültige Debitkartennummer ein.',
            expirationDate: 'Bitte wählen Sie ein gültiges Ablaufdatum aus',
            securityCode: 'Bitte geben Sie einen gültigen Sicherheitscode ein',
            addressStreet: 'Bitte geben Sie eine gültige Rechnungsadresse ein, die kein Postfach ist.',
            addressState: 'Bitte wählen Sie einen Bundesstaat aus',
            addressCity: 'Bitte geben Sie eine Stadt ein',
            genericFailureMessage: 'Beim Hinzufügen Ihrer Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            password: 'Bitte geben Sie Ihr Expensify-Passwort ein.',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Zahlungskarte hinzufügen',
        nameOnCard: 'Name auf der Karte',
        paymentCardNumber: 'Kartennummer',
        expiration: 'Ablaufdatum',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Rechnungsadresse',
        growlMessageOnSave: 'Ihre Zahlungskarte wurde erfolgreich hinzugefügt',
        expensifyPassword: 'Expensify-Passwort',
        error: {
            invalidName: 'Name darf nur Buchstaben enthalten',
            addressZipCode: 'Bitte geben Sie eine gültige Postleitzahl ein',
            paymentCardNumber: 'Bitte geben Sie eine gültige Kartennummer ein.',
            expirationDate: 'Bitte wählen Sie ein gültiges Ablaufdatum aus',
            securityCode: 'Bitte geben Sie einen gültigen Sicherheitscode ein',
            addressStreet: 'Bitte geben Sie eine gültige Rechnungsadresse ein, die kein Postfach ist.',
            addressState: 'Bitte wählen Sie einen Bundesstaat aus',
            addressCity: 'Bitte geben Sie eine Stadt ein',
            genericFailureMessage: 'Beim Hinzufügen Ihrer Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            password: 'Bitte geben Sie Ihr Expensify-Passwort ein.',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Zahlungsmethoden',
        setDefaultConfirmation: 'Standardzahlungsmethode festlegen',
        setDefaultSuccess: 'Standardzahlungsmethode festgelegt!',
        deleteAccount: 'Konto löschen',
        deleteConfirmation: 'Möchten Sie dieses Konto wirklich löschen?',
        error: {
            notOwnerOfBankAccount: 'Beim Festlegen dieses Bankkontos als Standardzahlungsmethode ist ein Fehler aufgetreten.',
            invalidBankAccount: 'Dieses Bankkonto ist vorübergehend gesperrt.',
            notOwnerOfFund: 'Ein Fehler ist aufgetreten, als diese Karte als Ihre Standardzahlungsmethode festgelegt wurde.',
            setDefaultFailure: 'Etwas ist schiefgelaufen. Bitte chatten Sie mit Concierge für weitere Unterstützung.',
        },
        addBankAccountFailure: 'Beim Hinzufügen Ihres Bankkontos ist ein unerwarteter Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        getPaidFaster: 'Schneller bezahlt werden',
        addPaymentMethod: 'Fügen Sie eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        getPaidBackFaster: 'Schneller zurückgezahlt werden',
        secureAccessToYourMoney: 'Sicherer Zugriff auf Ihr Geld',
        receiveMoney: 'Erhalten Sie Geld in Ihrer lokalen Währung',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Senden und Empfangen von Geld mit Freunden. Nur US-Bankkonten.',
        enableWallet: 'Wallet aktivieren',
        addBankAccountToSendAndReceive: 'Erhalten Sie eine Rückerstattung für Ausgaben, die Sie an einen Arbeitsbereich einreichen.',
        addBankAccount: 'Bankkonto hinzufügen',
        assignedCards: 'Zugewiesene Karten',
        assignedCardsDescription: 'Dies sind Karten, die von einem Workspace-Admin zugewiesen wurden, um die Ausgaben des Unternehmens zu verwalten.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Wir überprüfen Ihre Informationen. Bitte schauen Sie in ein paar Minuten wieder vorbei!',
        walletActivationFailed: 'Leider kann Ihr Wallet derzeit nicht aktiviert werden. Bitte chatten Sie mit Concierge für weitere Unterstützung.',
        addYourBankAccount: 'Fügen Sie Ihr Bankkonto hinzu',
        addBankAccountBody: 'Lassen Sie uns Ihr Bankkonto mit Expensify verbinden, damit es einfacher denn je ist, Zahlungen direkt in der App zu senden und zu empfangen.',
        chooseYourBankAccount: 'Wählen Sie Ihr Bankkonto aus',
        chooseAccountBody: 'Stellen Sie sicher, dass Sie das richtige auswählen.',
        confirmYourBankAccount: 'Bestätigen Sie Ihr Bankkonto',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify Travel Card',
        availableSpend: 'Verbleibendes Limit',
        smartLimit: {
            name: 'Intelligentes Limit',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "Sie k\u00F6nnen bis zu ".concat(formattedLimit, " mit dieser Karte ausgeben, und das Limit wird zur\u00FCckgesetzt, sobald Ihre eingereichten Ausgaben genehmigt werden.");
            },
        },
        fixedLimit: {
            name: 'Festgelegtes Limit',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "Sie k\u00F6nnen bis zu ".concat(formattedLimit, " mit dieser Karte ausgeben, danach wird sie deaktiviert.");
            },
        },
        monthlyLimit: {
            name: 'Monatliches Limit',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "Sie k\u00F6nnen bis zu ".concat(formattedLimit, " pro Monat mit dieser Karte ausgeben. Das Limit wird am 1. Tag jedes Kalendermonats zur\u00FCckgesetzt.");
            },
        },
        virtualCardNumber: 'Virtuelle Kartennummer',
        travelCardCvv: 'Travel-Karten-CVV',
        physicalCardNumber: 'Physische Kartennummer',
        getPhysicalCard: 'Physische Karte erhalten',
        reportFraud: 'Virtuelle Kartenbetrug melden',
        reportTravelFraud: 'Reisebetrug mit der Karte melden',
        reviewTransaction: 'Transaktion überprüfen',
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
        cardAddedToWallet: function (_a) {
            var platform = _a.platform;
            return "Zum ".concat(platform, " Wallet hinzugef\u00FCgt");
        },
        cardDetailsLoadingFailure: 'Beim Laden der Kartendetails ist ein Fehler aufgetreten. Bitte überprüfen Sie Ihre Internetverbindung und versuchen Sie es erneut.',
        validateCardTitle: 'Lassen Sie uns sicherstellen, dass Sie es sind',
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Bitte geben Sie den magischen Code ein, der an ".concat(contactMethod, " gesendet wurde, um Ihre Kartendetails anzuzeigen. Er sollte in ein bis zwei Minuten ankommen.");
        },
    },
    workflowsPage: {
        workflowTitle: 'Ausgaben',
        workflowDescription: 'Konfigurieren Sie einen Workflow ab dem Moment, in dem Ausgaben anfallen, einschließlich Genehmigung und Zahlung.',
        delaySubmissionTitle: 'Einreichungen verzögern',
        delaySubmissionDescription: 'Wählen Sie einen benutzerdefinierten Zeitplan für die Einreichung von Ausgaben oder lassen Sie dies für Echtzeit-Updates zu Ausgaben aus.',
        submissionFrequency: 'Einreichungshäufigkeit',
        submissionFrequencyDateOfMonth: 'Datum des Monats',
        addApprovalsTitle: 'Genehmigungen hinzufügen',
        addApprovalButton: 'Genehmigungsworkflow hinzufügen',
        addApprovalTip: 'Dieser Standard-Workflow gilt für alle Mitglieder, es sei denn, es existiert ein spezifischerer Workflow.',
        approver: 'Genehmiger',
        connectBankAccount: 'Bankkonto verbinden',
        addApprovalsDescription: 'Zusätzliche Genehmigung erforderlich, bevor eine Zahlung autorisiert wird.',
        makeOrTrackPaymentsTitle: 'Zahlungen vornehmen oder verfolgen',
        makeOrTrackPaymentsDescription: 'Fügen Sie einen autorisierten Zahler für Zahlungen in Expensify hinzu oder verfolgen Sie Zahlungen, die anderswo getätigt wurden.',
        editor: {
            submissionFrequency: 'Wählen Sie, wie lange Expensify warten soll, bevor fehlerfreie Ausgaben geteilt werden.',
        },
        frequencyDescription: 'Wählen Sie, wie oft Ausgaben automatisch eingereicht werden sollen, oder stellen Sie es auf manuell um.',
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
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Erste',
                '2': 'Zweite',
                '3': 'Dritte',
                '4': 'Vierte',
                '5': 'Fünfte',
                '6': 'Sechste',
                '7': 'Siebte',
                '8': 'Achtel',
                '9': 'Neunte',
                '10': 'Zehntens',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Dieses Mitglied gehört bereits zu einem anderen Genehmigungs-Workflow. Alle Aktualisierungen hier werden sich auch dort widerspiegeln.',
        approverCircularReference: function (_a) {
            var name1 = _a.name1, name2 = _a.name2;
            return "<strong>".concat(name1, "</strong> genehmigt bereits Berichte an <strong>").concat(name2, "</strong>. Bitte w\u00E4hlen Sie einen anderen Genehmiger, um einen zirkul\u00E4ren Arbeitsablauf zu vermeiden.");
        },
        emptyContent: {
            title: 'Keine Mitglieder zum Anzeigen',
            expensesFromSubtitle: 'Alle Arbeitsbereichsmitglieder gehören bereits zu einem bestehenden Genehmigungsworkflow.',
            approverSubtitle: 'Alle Genehmigenden gehören zu einem bestehenden Workflow.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: 'Verspätete Einreichung konnte nicht geändert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
        autoReportingFrequencyErrorMessage: 'Die Einreichungshäufigkeit konnte nicht geändert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
        monthlyOffsetErrorMessage: 'Die monatliche Frequenz konnte nicht geändert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Bestätigen',
        header: 'Fügen Sie weitere Genehmiger hinzu und bestätigen Sie.',
        additionalApprover: 'Zusätzlicher Genehmiger',
        submitButton: 'Workflow hinzufügen',
    },
    workflowsEditApprovalsPage: {
        title: 'Genehmigungsworkflow bearbeiten',
        deleteTitle: 'Genehmigungsworkflow löschen',
        deletePrompt: 'Möchten Sie diesen Genehmigungs-Workflow wirklich löschen? Alle Mitglieder werden anschließend dem Standard-Workflow folgen.',
    },
    workflowsExpensesFromPage: {
        title: 'Ausgaben von',
        header: 'Wenn die folgenden Mitglieder Ausgaben einreichen:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Der Genehmiger konnte nicht geändert werden. Bitte versuchen Sie es erneut oder kontaktieren Sie den Support.',
        header: 'An dieses Mitglied zur Genehmigung senden:',
    },
    workflowsPayerPage: {
        title: 'Autorisierter Zahler',
        genericErrorMessage: 'Der autorisierte Zahler konnte nicht geändert werden. Bitte versuchen Sie es erneut.',
        admins: 'Admins',
        payer: 'Zahler',
        paymentAccount: 'Zahlungskonto',
    },
    reportFraudPage: {
        title: 'Virtuelle Kartenbetrug melden',
        description: 'Wenn Ihre virtuellen Kartendaten gestohlen oder kompromittiert wurden, werden wir Ihre bestehende Karte dauerhaft deaktivieren und Ihnen eine neue virtuelle Karte und Nummer zur Verfügung stellen.',
        deactivateCard: 'Karte deaktivieren',
        reportVirtualCardFraud: 'Virtuelle Kartenbetrug melden',
    },
    reportFraudConfirmationPage: {
        title: 'Kartenbetrug gemeldet',
        description: 'Wir haben Ihre bestehende Karte dauerhaft deaktiviert. Wenn Sie zurückgehen, um Ihre Kartendetails anzusehen, wird Ihnen eine neue virtuelle Karte zur Verfügung stehen.',
        buttonText: 'Verstanden, danke!',
    },
    activateCardPage: {
        activateCard: 'Karte aktivieren',
        pleaseEnterLastFour: 'Bitte geben Sie die letzten vier Ziffern Ihrer Karte ein.',
        activatePhysicalCard: 'Physische Karte aktivieren',
        error: {
            thatDidNotMatch: 'Das stimmte nicht mit den letzten 4 Ziffern auf Ihrer Karte überein. Bitte versuchen Sie es erneut.',
            throttled: 'Sie haben die letzten 4 Ziffern Ihrer Expensify Card zu oft falsch eingegeben. Wenn Sie sicher sind, dass die Zahlen korrekt sind, wenden Sie sich bitte an Concierge, um das Problem zu lösen. Andernfalls versuchen Sie es später erneut.',
        },
    },
    getPhysicalCard: {
        header: 'Physische Karte erhalten',
        nameMessage: 'Geben Sie Ihren Vor- und Nachnamen ein, da dieser auf Ihrer Karte angezeigt wird.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        phoneMessage: 'Geben Sie Ihre Telefonnummer ein.',
        phoneNumber: 'Telefonnummer',
        address: 'Adresse',
        addressMessage: 'Geben Sie Ihre Lieferadresse ein.',
        streetAddress: 'Straßenadresse',
        city: 'Stadt',
        state: 'Zustand',
        zipPostcode: 'Postleitzahl',
        country: 'Land',
        confirmMessage: 'Bitte bestätigen Sie Ihre unten stehenden Angaben.',
        estimatedDeliveryMessage: 'Ihre physische Karte wird in 2-3 Werktagen ankommen.',
        next: 'Nächste',
        getPhysicalCard: 'Physische Karte erhalten',
        shipCard: 'Karte versenden',
    },
    transferAmountPage: {
        transfer: function (_a) {
            var amount = _a.amount;
            return "Transfer".concat(amount ? " ".concat(amount) : '');
        },
        instant: 'Sofort (Debitkarte)',
        instantSummary: function (_a) {
            var rate = _a.rate, minAmount = _a.minAmount;
            return "".concat(rate, "% Geb\u00FChr (").concat(minAmount, " Minimum)");
        },
        ach: '1-3 Werktage (Bankkonto)',
        achSummary: 'Keine Gebühr',
        whichAccount: 'Welches Konto?',
        fee: 'Gebühr',
        transferSuccess: 'Überweisung erfolgreich!',
        transferDetailBankAccount: 'Ihr Geld sollte in den nächsten 1-3 Werktagen ankommen.',
        transferDetailDebitCard: 'Ihr Geld sollte sofort ankommen.',
        failedTransfer: 'Ihr Kontostand ist nicht vollständig ausgeglichen. Bitte überweisen Sie auf ein Bankkonto.',
        notHereSubTitle: 'Bitte überweisen Sie Ihr Guthaben von der Wallet-Seite.',
        goToWallet: 'Gehe zu Wallet',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Konto auswählen',
    },
    paymentMethodList: {
        addPaymentMethod: 'Zahlungsmethode hinzufügen',
        addNewDebitCard: 'Neue Debitkarte hinzufügen',
        addNewBankAccount: 'Neues Bankkonto hinzufügen',
        accountLastFour: 'Endet mit',
        cardLastFour: 'Karte endet mit',
        addFirstPaymentMethod: 'Fügen Sie eine Zahlungsmethode hinzu, um Zahlungen direkt in der App zu senden und zu empfangen.',
        defaultPaymentMethod: 'Standardmäßig',
    },
    preferencesPage: {
        appSection: {
            title: 'App-Einstellungen',
        },
        testSection: {
            title: 'Präferenzen testen',
            subtitle: 'Einstellungen zur Unterstützung beim Debuggen und Testen der App auf der Staging-Umgebung.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Erhalten Sie relevante Funktionsupdates und Expensify-Neuigkeiten',
        muteAllSounds: 'Alle Töne von Expensify stummschalten',
    },
    priorityModePage: {
        priorityMode: 'Prioritätsmodus',
        explainerText: 'Wählen Sie, ob Sie sich nur auf ungelesene und angeheftete Chats konzentrieren möchten oder alles mit den neuesten und angehefteten Chats oben anzeigen möchten.',
        priorityModes: {
            default: {
                label: 'Neueste',
                description: 'Alle Chats nach dem neuesten sortieren anzeigen',
            },
            gsd: {
                label: '#fokus',
                description: 'Nur ungelesene alphabetisch sortiert anzeigen',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: function (_a) {
            var policyName = _a.policyName;
            return "in ".concat(policyName);
        },
        generatingPDF: 'PDF wird generiert',
        waitForPDF: 'Bitte warten Sie, während wir das PDF erstellen.',
        errorPDF: 'Beim Versuch, Ihr PDF zu erstellen, ist ein Fehler aufgetreten.',
        generatedPDF: 'Ihr Bericht als PDF wurde erstellt!',
    },
    reportDescriptionPage: {
        roomDescription: 'Zimmerbeschreibung',
        roomDescriptionOptional: 'Raumbeschreibung (optional)',
        explainerText: 'Legen Sie eine benutzerdefinierte Beschreibung für den Raum fest.',
    },
    groupChat: {
        lastMemberTitle: 'Achtung!',
        lastMemberWarning: 'Da du die letzte Person hier bist, wird der Chat für alle Mitglieder unzugänglich, wenn du ihn verlässt. Bist du sicher, dass du gehen möchtest?',
        defaultReportName: function (_a) {
            var displayName = _a.displayName;
            return "Gruppenchat von ".concat(displayName);
        },
    },
    languagePage: {
        language: 'Sprache',
        aiGenerated: 'Die Übersetzungen für diese Sprache werden automatisch erstellt und können Fehler enthalten.',
    },
    themePage: {
        theme: 'Thema',
        themes: {
            dark: {
                label: 'Dunkel',
            },
            light: {
                label: 'Licht',
            },
            system: {
                label: 'Geräteeinstellungen verwenden',
            },
        },
        chooseThemeBelowOrSync: 'Wählen Sie ein Thema unten aus oder synchronisieren Sie es mit den Einstellungen Ihres Geräts.',
    },
    termsOfUse: {
        phrase1: 'Mit der Anmeldung stimmen Sie den',
        phrase2: 'Nutzungsbedingungen',
        phrase3: 'und',
        phrase4: 'Datenschutz',
        phrase5: "Geld\u00FCbermittlung wird bereitgestellt von ".concat(CONST_1.default.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS, " (NMLS ID:2017010) gem\u00E4\u00DF seiner"),
        phrase6: 'Lizenzen',
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Keinen magischen Code erhalten?',
        enterAuthenticatorCode: 'Bitte geben Sie Ihren Authentifizierungscode ein',
        enterRecoveryCode: 'Bitte geben Sie Ihren Wiederherstellungscode ein',
        requiredWhen2FAEnabled: 'Erforderlich, wenn die Zwei-Faktor-Authentifizierung aktiviert ist.',
        requestNewCode: 'Fordere einen neuen Code an in',
        requestNewCodeAfterErrorOccurred: 'Einen neuen Code anfordern',
        error: {
            pleaseFillMagicCode: 'Bitte geben Sie Ihren magischen Code ein',
            incorrectMagicCode: 'Falscher oder ungültiger Magic-Code. Bitte versuche es erneut oder fordere einen neuen Code an.',
            pleaseFillTwoFactorAuth: 'Bitte geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Bitte füllen Sie alle Felder aus',
        pleaseFillPassword: 'Bitte geben Sie Ihr Passwort ein',
        pleaseFillTwoFactorAuth: 'Bitte geben Sie Ihren Zwei-Faktor-Code ein',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Geben Sie Ihren Zwei-Faktor-Authentifizierungscode ein, um fortzufahren',
        forgot: 'Vergessen?',
        requiredWhen2FAEnabled: 'Erforderlich, wenn die Zwei-Faktor-Authentifizierung aktiviert ist.',
        error: {
            incorrectPassword: 'Falsches Passwort. Bitte versuchen Sie es erneut.',
            incorrectLoginOrPassword: 'Falscher Benutzername oder falsches Passwort. Bitte versuchen Sie es erneut.',
            incorrect2fa: 'Falscher Zwei-Faktor-Authentifizierungscode. Bitte versuchen Sie es erneut.',
            twoFactorAuthenticationEnabled: 'Sie haben die Zwei-Faktor-Authentifizierung (2FA) für dieses Konto aktiviert. Bitte melden Sie sich mit Ihrer E-Mail-Adresse oder Telefonnummer an.',
            invalidLoginOrPassword: 'Ungültige Anmeldung oder ungültiges Passwort. Bitte versuchen Sie es erneut oder setzen Sie Ihr Passwort zurück.',
            unableToResetPassword: 'Wir konnten Ihr Passwort nicht ändern. Dies liegt wahrscheinlich an einem abgelaufenen Link zur Passwortzurücksetzung in einer alten E-Mail zur Passwortzurücksetzung. Wir haben Ihnen einen neuen Link per E-Mail geschickt, damit Sie es erneut versuchen können. Überprüfen Sie Ihren Posteingang und Ihren Spam-Ordner; es sollte in wenigen Minuten ankommen.',
            noAccess: 'Sie haben keinen Zugriff auf diese Anwendung. Bitte fügen Sie Ihren GitHub-Benutzernamen für den Zugriff hinzu.',
            accountLocked: 'Ihr Konto wurde nach zu vielen erfolglosen Versuchen gesperrt. Bitte versuchen Sie es in 1 Stunde erneut.',
            fallback: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefon oder E-Mail',
        error: {
            invalidFormatEmailLogin: 'Die eingegebene E-Mail ist ungültig. Bitte korrigieren Sie das Format und versuchen Sie es erneut.',
        },
        cannotGetAccountDetails: 'Konnte Kontodetails nicht abrufen. Bitte versuchen Sie, sich erneut anzumelden.',
        loginForm: 'Anmeldeformular',
        notYou: function (_a) {
            var user = _a.user;
            return "Nicht ".concat(user, "?");
        },
    },
    onboarding: {
        welcome: 'Willkommen!',
        welcomeSignOffTitleManageTeam: 'Sobald Sie die oben genannten Aufgaben abgeschlossen haben, können wir weitere Funktionen wie Genehmigungs-Workflows und Regeln erkunden!',
        welcomeSignOffTitle: 'Es ist großartig, Sie kennenzulernen!',
        explanationModal: {
            title: 'Willkommen bei Expensify',
            description: 'Eine App, um Ihre geschäftlichen und persönlichen Ausgaben mit der Geschwindigkeit des Chats zu verwalten. Probieren Sie es aus und lassen Sie uns wissen, was Sie denken. Es kommt noch viel mehr!',
            secondaryDescription: 'Um zu Expensify Classic zurückzukehren, tippen Sie einfach auf Ihr Profilbild > Gehe zu Expensify Classic.',
        },
        welcomeVideo: {
            title: 'Willkommen bei Expensify',
            description: 'Eine App, um alle Ihre geschäftlichen und privaten Ausgaben in einem Chat zu verwalten. Entwickelt für Ihr Unternehmen, Ihr Team und Ihre Freunde.',
        },
        getStarted: 'Loslegen',
        whatsYourName: 'Wie heißt du?',
        peopleYouMayKnow: 'Personen, die Sie kennen könnten, sind bereits hier! Bestätigen Sie Ihre E-Mail, um sich ihnen anzuschließen.',
        workspaceYouMayJoin: function (_a) {
            var domain = _a.domain, email = _a.email;
            return "Jemand von ".concat(domain, " hat bereits einen Arbeitsbereich erstellt. Bitte geben Sie den magischen Code ein, der an ").concat(email, " gesendet wurde.");
        },
        joinAWorkspace: 'Einem Arbeitsbereich beitreten',
        listOfWorkspaces: 'Hier ist die Liste der Arbeitsbereiche, denen Sie beitreten können. Keine Sorge, Sie können ihnen auch später beitreten, wenn Sie möchten.',
        workspaceMemberList: function (_a) {
            var employeeCount = _a.employeeCount, policyOwner = _a.policyOwner;
            return "".concat(employeeCount, " Mitglied").concat(employeeCount > 1 ? 's' : '', " \u2022 ").concat(policyOwner);
        },
        whereYouWork: 'Wo arbeitest du?',
        errorSelection: 'Wählen Sie eine Option, um fortzufahren',
        purpose: (_c = {
                title: 'Was möchten Sie heute tun?',
                errorContinue: 'Bitte drücken Sie auf Weiter, um die Einrichtung abzuschließen.',
                errorBackButton: 'Bitte beenden Sie die Einrichtung, um die App zu verwenden.'
            },
            _c[CONST_1.default.ONBOARDING_CHOICES.EMPLOYER] = 'Von meinem Arbeitgeber zurückbezahlt werden',
            _c[CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM] = 'Verwalte die Ausgaben meines Teams',
            _c[CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND] = 'Verfolgen und budgetieren Sie Ausgaben',
            _c[CONST_1.default.ONBOARDING_CHOICES.CHAT_SPLIT] = 'Chatten und Ausgaben mit Freunden teilen',
            _c[CONST_1.default.ONBOARDING_CHOICES.LOOKING_AROUND] = 'Etwas anderes',
            _c),
        employees: (_d = {
                title: 'Wie viele Mitarbeiter haben Sie?'
            },
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MICRO] = '1-10 Mitarbeiter',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.SMALL] = '11-50 Mitarbeiter',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL] = '51-100 Mitarbeiter',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MEDIUM] = '101-1.000 Mitarbeiter',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.LARGE] = 'Mehr als 1.000 Mitarbeiter',
            _d),
        accounting: {
            title: 'Verwenden Sie eine Buchhaltungssoftware?',
            none: 'Keine',
        },
        error: {
            requiredFirstName: 'Bitte geben Sie Ihren Vornamen ein, um fortzufahren.',
        },
        workEmail: {
            title: 'Wie lautet Ihre Arbeits-E-Mail?',
            subtitle: 'Expensify funktioniert am besten, wenn Sie Ihre Arbeits-E-Mail verbinden.',
            explanationModal: {
                descriptionOne: 'Weiterleiten an receipts@expensify.com zum Scannen',
                descriptionTwo: 'Treten Sie Ihren Kollegen bei, die bereits Expensify nutzen.',
                descriptionThree: 'Genießen Sie ein individuell angepasstes Erlebnis',
            },
            addWorkEmail: 'Arbeits-E-Mail hinzufügen',
        },
        workEmailValidation: {
            title: 'Bestätigen Sie Ihre Arbeits-E-Mail-Adresse',
            magicCodeSent: function (_a) {
                var workEmail = _a.workEmail;
                return "Bitte geben Sie den magischen Code ein, der an ".concat(workEmail, " gesendet wurde. Er sollte in ein bis zwei Minuten ankommen.");
            },
        },
        workEmailValidationError: {
            publicEmail: 'Bitte geben Sie eine gültige Arbeits-E-Mail von einer privaten Domain ein, z.B. mitch@company.com',
            offline: 'Wir konnten Ihre Arbeits-E-Mail nicht hinzufügen, da Sie offline zu sein scheinen.',
        },
        mergeBlockScreen: {
            title: 'Konnte die Arbeits-E-Mail nicht hinzufügen',
            subtitle: function (_a) {
                var workEmail = _a.workEmail;
                return "Wir konnten ".concat(workEmail, " nicht hinzuf\u00FCgen. Bitte versuchen Sie es sp\u00E4ter in den Einstellungen erneut oder chatten Sie mit Concierge f\u00FCr Unterst\u00FCtzung.");
            },
        },
        tasks: {
            testDriveAdminTask: {
                title: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "Mache eine [Probefahrt](".concat(testDriveURL, ")");
                },
                description: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "[Mache eine kurze Produkttour](".concat(testDriveURL, "), um zu sehen, warum Expensify der schnellste Weg ist, Ausgaben zu verwalten.");
                },
            },
            testDriveEmployeeTask: {
                title: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "Mache eine [Probefahrt](".concat(testDriveURL, ")");
                },
                description: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "Probiere uns in einer [Probefahrt](".concat(testDriveURL, ") aus und sichere deinem Team *3 Monate Expensify gratis!*");
                },
            },
            createTestDriveAdminWorkspaceTask: {
                title: function (_a) {
                    var workspaceConfirmationLink = _a.workspaceConfirmationLink;
                    return "[Erstelle](".concat(workspaceConfirmationLink, ") einen Workspace");
                },
                description: 'Erstelle einen Workspace und konfiguriere die Einstellungen mit Hilfe deines Einrichtungsspezialisten!',
            },
            createWorkspaceTask: {
                title: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return "Erstelle einen [Workspace](".concat(workspaceSettingsLink, ")");
                },
                description: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return '*Erstelle einen Workspace*, um Ausgaben zu verfolgen, Belege zu scannen, zu chatten und mehr.\n\n' +
                        '1. Klicke auf *Workspaces* > *Neuer Workspace*.\n\n' +
                        "*Dein neuer Workspace ist bereit!* [Schau ihn dir an](".concat(workspaceSettingsLink, ").");
                },
            },
            setupCategoriesTask: {
                title: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink;
                    return "Richte [Kategorien](".concat(workspaceCategoriesLink, ") ein");
                },
                description: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink;
                    return '*Richte Kategorien ein*, damit dein Team Ausgaben einfach zuordnen kann.\n\n' +
                        '1. Klicke auf *Workspaces*.\n' +
                        '2. Wähle deinen Workspace.\n' +
                        '3. Klicke auf *Kategorien*.\n' +
                        '4. Deaktiviere nicht benötigte Kategorien.\n' +
                        '5. Füge oben rechts eigene Kategorien hinzu.\n\n' +
                        "[Zu den Kategorie-Einstellungen](".concat(workspaceCategoriesLink, ").\n\n") +
                        "![Kategorien einrichten](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-categories-v2.mp4)");
                },
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Reiche eine Ausgabe ein',
                description: '*Reiche eine Ausgabe ein*, indem du einen Betrag eingibst oder einen Beleg scannst.\n\n' +
                    '1. Klicke auf den grünen *+*-Button.\n' +
                    '2. Wähle *Ausgabe erstellen*.\n' +
                    '3. Betrag eingeben oder Beleg scannen.\n' +
                    "4. Gib die E-Mail oder Telefonnummer deines Chefs ein.\n" +
                    '5. Klicke auf *Erstellen*.\n\n' +
                    'Fertig!',
            },
            adminSubmitExpenseTask: {
                title: 'Reiche eine Ausgabe ein',
                description: '*Reiche eine Ausgabe ein*, indem du einen Betrag eingibst oder einen Beleg scannst.\n\n' +
                    '1. Klicke auf den grünen *+*-Button.\n' +
                    '2. Wähle *Ausgabe erstellen*.\n' +
                    '3. Betrag eingeben oder Beleg scannen.\n' +
                    '4. Details bestätigen.\n' +
                    '5. Klicke auf *Erstellen*.\n\n' +
                    'Fertig!',
            },
            trackExpenseTask: {
                title: 'Verfolge eine Ausgabe',
                description: '*Verfolge eine Ausgabe* in jeder Währung – mit oder ohne Beleg.\n\n' +
                    '1. Klicke auf den grünen *+*-Button.\n' +
                    '2. Wähle *Ausgabe erstellen*.\n' +
                    '3. Betrag eingeben oder Beleg scannen.\n' +
                    '4. Wähle deinen *persönlichen* Bereich.\n' +
                    '5. Klicke auf *Erstellen*.\n\n' +
                    'Fertig! So einfach ist das.',
            },
            addAccountingIntegrationTask: {
                title: function (_a) {
                    var integrationName = _a.integrationName, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "Verbinde".concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : ' mit', " [").concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? 'deiner' : '', " ").concat(integrationName, "](").concat(workspaceAccountingLink, ")");
                },
                description: function (_a) {
                    var integrationName = _a.integrationName, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "Verbinde ".concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? 'deine' : 'mit', " ").concat(integrationName, ", um Ausgaben automatisch zuzuordnen und den Monatsabschluss zu vereinfachen.\n") +
                        '\n' +
                        '1. Klicke auf *Einstellungen*.\n' +
                        '2. Gehe zu *Workspaces*.\n' +
                        '3. Wähle deinen Workspace.\n' +
                        '4. Klicke auf *Buchhaltung*.\n' +
                        "5. Finde ".concat(integrationName, ".\n") +
                        '6. Klicke auf *Verbinden*.\n' +
                        '\n' +
                        "".concat(integrationName && CONST_1.default.connectionsVideoPaths[integrationName]
                            ? "[Zu Buchhaltung](".concat(workspaceAccountingLink, ").\n\n![Mit ").concat(integrationName, " verbinden](").concat(CONST_1.default.CLOUDFRONT_URL, "/").concat(CONST_1.default.connectionsVideoPaths[integrationName], ")")
                            : "[Zu Buchhaltung](".concat(workspaceAccountingLink, ")."));
                },
            },
            connectCorporateCardTask: {
                title: function (_a) {
                    var corporateCardLink = _a.corporateCardLink;
                    return "Verbinde [deine Firmenkarte](".concat(corporateCardLink, ")");
                },
                description: function (_a) {
                    var corporateCardLink = _a.corporateCardLink;
                    return "Verbinde deine Firmenkarte, um Ausgaben automatisch zu importieren und zuzuordnen.\n\n" +
                        '1. Klicke auf *Workspaces*.\n' +
                        '2. Wähle deinen Workspace.\n' +
                        '3. Klicke auf *Firmenkarten*.\n' +
                        '4. Folge den Anweisungen zur Verbindung.\n\n' +
                        "[Zur Kartenverbindung](".concat(corporateCardLink, ").");
                },
            },
            inviteTeamTask: {
                title: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return "Lade [dein Team](".concat(workspaceMembersLink, ") ein");
                },
                description: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return '*Lade dein Team* zu Expensify ein, damit es sofort mit dem Verfolgen von Ausgaben beginnen kann.\n\n' +
                        '1. Klicke auf *Workspaces*.\n' +
                        '2. Wähle deinen Workspace.\n' +
                        '3. Klicke auf *Mitglieder* > *Mitglied einladen*.\n' +
                        '4. Gib E-Mails oder Telefonnummern ein.\n' +
                        '5. Optional: eigene Einladung hinzufügen.\n\n' +
                        "[Zu den Mitgliedereinstellungen](".concat(workspaceMembersLink, ").\n\n") +
                        "![Team einladen](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-invite_members-v2.mp4)");
                },
            },
            setupCategoriesAndTags: {
                title: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink, workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return "Richte [Kategorien](".concat(workspaceCategoriesLink, ") und [Tags](").concat(workspaceMoreFeaturesLink, ") ein");
                },
                description: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return '*Richte Kategorien und Tags ein*, damit dein Team Ausgaben einfach zuordnen kann.\n\n' +
                        "Importiere sie automatisch durch [Verbindung deiner Buchhaltungssoftware](".concat(workspaceAccountingLink, ") oder richte sie manuell in den [Workspace-Einstellungen](").concat(workspaceCategoriesLink, ") ein.");
                },
            },
            setupTagsTask: {
                title: function (_a) {
                    var workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return "Richte [Tags](".concat(workspaceMoreFeaturesLink, ") ein");
                },
                description: function (_a) {
                    var workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return 'Verwende Tags, um zusätzliche Ausgabendetails wie Projekte, Kunden, Standorte und Abteilungen hinzuzufügen. Für mehrere Tag-Ebenen kannst du auf den Control-Plan upgraden.\n\n' +
                        '1. Klicke auf *Workspaces*.\n' +
                        '2. Wähle deinen Workspace.\n' +
                        '3. Klicke auf *Weitere Funktionen*.\n' +
                        '4. Aktiviere *Tags*.\n' +
                        '5. Navigiere zu *Tags* im Editor.\n' +
                        '6. Klicke auf *+ Tag hinzufügen*, um eigene zu erstellen.\n\n' +
                        "[Zu den weiteren Funktionen](".concat(workspaceMoreFeaturesLink, ").\n\n") +
                        "![Tags einrichten](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-tags-v2.mp4)");
                },
            },
            inviteAccountantTask: {
                title: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return "Lade deinen [Buchhalter](".concat(workspaceMembersLink, ") ein");
                },
                description: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return '*Lade deinen Buchhalter ein*, um gemeinsam an deinem Workspace zu arbeiten und Geschäftsausgaben zu verwalten.\n' +
                        '\n' +
                        '1. Klicke auf *Workspaces*.\n' +
                        '2. Wähle deinen Workspace.\n' +
                        '3. Klicke auf *Mitglieder*.\n' +
                        '4. Klicke auf *Mitglied einladen*.\n' +
                        '5. Gib die E-Mail-Adresse deines Buchhalters ein.\n' +
                        '\n' +
                        "[Jetzt Buchhalter einladen](".concat(workspaceMembersLink, ").");
                },
            },
            startChatTask: {
                title: 'Starte einen Chat',
                description: '*Starte einen Chat* mit jeder Person über E-Mail oder Telefonnummer.\n\n' +
                    '1. Klicke auf den grünen *+*-Button.\n' +
                    '2. Wähle *Chat starten*.\n' +
                    '3. Gib eine E-Mail oder Telefonnummer ein.\n\n' +
                    'Falls die Person Expensify noch nicht nutzt, wird sie automatisch eingeladen.\n\n' +
                    'Jeder Chat wird außerdem als E-Mail oder SMS zugestellt.',
            },
            splitExpenseTask: {
                title: 'Teile eine Ausgabe',
                description: '*Teile Ausgaben* mit einer oder mehreren Personen.\n\n' +
                    '1. Klicke auf den grünen *+*-Button.\n' +
                    '2. Wähle *Chat starten*.\n' +
                    '3. Gib E-Mail-Adressen oder Telefonnummern ein.\n' +
                    '4. Klicke im Chat auf den grauen *+*-Button > *Ausgabe teilen*.\n' +
                    '5. Wähle *Manuell*, *Scan* oder *Entfernung*.\n\n' +
                    'Du kannst Details hinzufügen oder es direkt abschicken. Zeit, dein Geld zurückzubekommen!',
            },
            reviewWorkspaceSettingsTask: {
                title: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return "\u00DCberpr\u00FCfe deine [Workspace-Einstellungen](".concat(workspaceSettingsLink, ")");
                },
                description: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return 'So überprüfst und aktualisierst du deine Workspace-Einstellungen:\n' +
                        '1. Klicke auf den Tab *Einstellungen*.\n' +
                        '2. Klicke auf *Workspaces* > [Dein Workspace].\n' +
                        "[Zum Workspace](".concat(workspaceSettingsLink, "). Wir verfolgen \u00C4nderungen im Raum #admins.");
                },
            },
            createReportTask: {
                title: 'Erstelle deinen ersten Bericht',
                description: 'So erstellst du einen Bericht:\n\n' +
                    '1. Klicke auf den grünen *+*-Button.\n' +
                    '2. Wähle *Bericht erstellen*.\n' +
                    '3. Klicke auf *Ausgabe hinzufügen*.\n' +
                    '4. Füge deine erste Ausgabe hinzu.\n\n' +
                    'Fertig!',
            },
        },
        testDrive: {
            name: function (_a) {
                var testDriveURL = _a.testDriveURL;
                return (testDriveURL ? "Mache eine [Probefahrt](".concat(testDriveURL, ")") : 'Mache eine Probefahrt');
            },
            embeddedDemoIframeTitle: 'Probefahrt',
            employeeFakeReceipt: {
                description: 'Mein Probefahrt-Beleg!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Erstattungen zu erhalten ist so einfach wie eine Nachricht zu senden. Lass uns die Grundlagen durchgehen.',
            onboardingPersonalSpendMessage: 'So verfolgst du deine Ausgaben mit nur wenigen Klicks.',
            onboardingMangeTeamMessage: function (_a) {
                var onboardingCompanySize = _a.onboardingCompanySize;
                return "Hier ist eine Aufgabenliste, die ich f\u00FCr ein Unternehmen mit ".concat(onboardingCompanySize, " Einreichenden empfehle:");
            },
            onboardingTrackWorkspaceMessage: '# Lass uns loslegen\n👋 Ich helfe dir! Ich habe deine Workspace-Einstellungen für Einzelunternehmer und ähnliche Unternehmen angepasst. Du kannst sie über den folgenden Link anpassen!\n\nSo verfolgst du deine Ausgaben mit nur wenigen Klicks:',
            onboardingChatSplitMessage: 'Rechnungen mit Freunden zu teilen ist so einfach wie eine Nachricht zu senden. So funktioniert’s.',
            onboardingAdminMessage: 'Lerne, wie du den Workspace deines Teams als Admin verwaltest und eigene Ausgaben einreichst.',
            onboardingLookingAroundMessage: 'Expensify ist vor allem für Ausgaben-, Reise- und Firmenkartenmanagement bekannt – aber wir können noch viel mehr. Sag mir, was dich interessiert, und ich helfe dir beim Einstieg.',
            onboardingTestDriveReceiverMessage: '*Du hast 3 Monate gratis! Jetzt loslegen.*',
        },
        workspace: {
            title: 'Bleiben Sie mit einem Arbeitsbereich organisiert.',
            subtitle: 'Entdecken Sie leistungsstarke Tools, um Ihr Ausgabenmanagement zu vereinfachen, alles an einem Ort. Mit einem Arbeitsbereich können Sie:',
            explanationModal: {
                descriptionOne: 'Belege nachverfolgen und organisieren',
                descriptionTwo: 'Kategorisieren und taggen Sie Ausgaben',
                descriptionThree: 'Berichte erstellen und teilen',
            },
            price: 'Testen Sie es 30 Tage lang kostenlos, dann upgraden Sie für nur <strong>$5/Monat</strong>.',
            createWorkspace: 'Arbeitsbereich erstellen',
        },
        confirmWorkspace: {
            title: 'Arbeitsbereich bestätigen',
            subtitle: 'Erstellen Sie einen Arbeitsbereich, um Belege zu verfolgen, Ausgaben zu erstatten, Reisen zu verwalten, Berichte zu erstellen und mehr – alles in der Geschwindigkeit des Chats.',
        },
        inviteMembers: {
            title: 'Mitglieder einladen',
            subtitle: 'Verwalten und teilen Sie Ihre Ausgaben mit einem Buchhalter oder gründen Sie eine Reisegruppe mit Freunden.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Nicht mehr anzeigen',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Name darf die Wörter Expensify oder Concierge nicht enthalten',
            hasInvalidCharacter: 'Der Name darf kein Komma oder Semikolon enthalten.',
            requiredFirstName: 'Vorname darf nicht leer sein',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Wie lautet Ihr gesetzlicher Name?',
        enterDateOfBirth: 'Was ist Ihr Geburtsdatum?',
        enterAddress: 'Wie lautet Ihre Adresse?',
        enterPhoneNumber: 'Wie lautet Ihre Telefonnummer?',
        personalDetails: 'Persönliche Daten',
        privateDataMessage: 'Diese Angaben werden für Reisen und Zahlungen verwendet. Sie werden niemals in Ihrem öffentlichen Profil angezeigt.',
        legalName: 'Rechtlicher Name',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        address: 'Adresse',
        error: {
            dateShouldBeBefore: function (_a) {
                var dateString = _a.dateString;
                return "Das Datum sollte vor dem ".concat(dateString, " liegen.");
            },
            dateShouldBeAfter: function (_a) {
                var dateString = _a.dateString;
                return "Das Datum sollte nach ".concat(dateString, " liegen.");
            },
            hasInvalidCharacter: 'Der Name darf nur lateinische Zeichen enthalten.',
            incorrectZipFormat: function (_a) {
                var _b = _a === void 0 ? {} : _a, zipFormat = _b.zipFormat;
                return "Ung\u00FCltiges Postleitzahlenformat".concat(zipFormat ? "Acceptable format: ".concat(zipFormat) : '');
            },
            invalidPhoneNumber: "Bitte stellen Sie sicher, dass die Telefonnummer g\u00FCltig ist (z. B. ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")"),
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link wurde erneut gesendet',
        weSentYouMagicSignInLink: function (_a) {
            var login = _a.login, loginType = _a.loginType;
            return "Ich habe einen magischen Anmeldelink an ".concat(login, " gesendet. Bitte \u00FCberpr\u00FCfe dein ").concat(loginType, ", um dich anzumelden.");
        },
        resendLink: 'Link erneut senden',
    },
    unlinkLoginForm: {
        toValidateLogin: function (_a) {
            var primaryLogin = _a.primaryLogin, secondaryLogin = _a.secondaryLogin;
            return "Um ".concat(secondaryLogin, " zu validieren, senden Sie bitte den magischen Code aus den Kontoeinstellungen von ").concat(primaryLogin, " erneut.");
        },
        noLongerHaveAccess: function (_a) {
            var primaryLogin = _a.primaryLogin;
            return "Wenn Sie keinen Zugriff mehr auf ".concat(primaryLogin, " haben, trennen Sie bitte Ihre Konten.");
        },
        unlink: 'Trennen',
        linkSent: 'Link gesendet!',
        successfullyUnlinkedLogin: 'Sekundäres Login erfolgreich getrennt!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: function (_a) {
            var login = _a.login;
            return "Unser E-Mail-Anbieter hat E-Mails an ".concat(login, " vor\u00FCbergehend aufgrund von Zustellungsproblemen gesperrt. Um Ihr Login zu entsperren, befolgen Sie bitte diese Schritte:");
        },
        confirmThat: function (_a) {
            var login = _a.login;
            return "Best\u00E4tigen Sie, dass ".concat(login, " korrekt geschrieben ist und es sich um eine echte, zustellbare E-Mail-Adresse handelt.");
        },
        emailAliases: 'E-Mail-Aliasse wie "expenses@domain.com" müssen Zugriff auf ihren eigenen E-Mail-Posteingang haben, damit sie ein gültiger Expensify-Login sind.',
        ensureYourEmailClient: 'Stellen Sie sicher, dass Ihr E-Mail-Client E-Mails von expensify.com zulässt.',
        youCanFindDirections: 'Sie finden Anweisungen, wie Sie diesen Schritt abschließen können.',
        helpConfigure: 'aber möglicherweise benötigen Sie die Hilfe Ihrer IT-Abteilung, um Ihre E-Mail-Einstellungen zu konfigurieren.',
        onceTheAbove: 'Sobald die oben genannten Schritte abgeschlossen sind, wenden Sie sich bitte an',
        toUnblock: 'um Ihre Anmeldung zu entsperren.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: function (_a) {
            var login = _a.login;
            return "Wir konnten SMS-Nachrichten nicht an ".concat(login, " zustellen, daher haben wir es vor\u00FCbergehend gesperrt. Bitte versuchen Sie, Ihre Nummer zu validieren:");
        },
        validationSuccess: 'Ihre Nummer wurde bestätigt! Klicken Sie unten, um einen neuen magischen Anmeldecode zu senden.',
        validationFailed: function (_a) {
            var _b;
            var timeData = _a.timeData;
            if (!timeData) {
                return 'Bitte warten Sie einen Moment, bevor Sie es erneut versuchen.';
            }
            var timeParts = [];
            if (timeData.days) {
                timeParts.push("".concat(timeData.days, " ").concat(timeData.days === 1 ? 'Tag' : 'Tage'));
            }
            if (timeData.hours) {
                timeParts.push("".concat(timeData.hours, " ").concat(timeData.hours === 1 ? 'Stunde' : 'Stunden'));
            }
            if (timeData.minutes) {
                timeParts.push("".concat(timeData.minutes, " ").concat(timeData.minutes === 1 ? 'Minute' : 'Minuten'));
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
            return "Bitte warten Sie! Sie m\u00FCssen ".concat(timeText, " warten, bevor Sie erneut versuchen, Ihre Nummer zu validieren.");
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
        title: 'Willkommen im #Fokus-Modus!',
        prompt: 'Bleiben Sie auf dem Laufenden, indem Sie nur ungelesene Chats oder Chats sehen, die Ihre Aufmerksamkeit erfordern. Keine Sorge, Sie können dies jederzeit in  ändern.',
        settings: 'Einstellungen',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Der gesuchte Chat kann nicht gefunden werden.',
        getMeOutOfHere: 'Hol mich hier raus',
        iouReportNotFound: 'Die gesuchten Zahlungsdetails können nicht gefunden werden.',
        notHere: 'Hmm... es ist nicht hier.',
        pageNotFound: 'Ups, diese Seite kann nicht gefunden werden.',
        noAccess: 'Dieser Chat oder diese Ausgabe wurde möglicherweise gelöscht oder Sie haben keinen Zugriff darauf.\n\nBei Fragen wenden Sie sich bitte an concierge@expensify.com',
        goBackHome: 'Zurück zur Startseite',
    },
    errorPage: {
        title: function (_a) {
            var isBreakLine = _a.isBreakLine;
            return "Oops... ".concat(isBreakLine ? '\n' : '', "Etwas ist schiefgelaufen");
        },
        subtitle: 'Ihre Anfrage konnte nicht abgeschlossen werden. Bitte versuchen Sie es später erneut.',
    },
    setPasswordPage: {
        enterPassword: 'Passwort eingeben',
        setPassword: 'Passwort festlegen',
        newPasswordPrompt: 'Ihr Passwort muss mindestens 8 Zeichen, 1 Großbuchstaben, 1 Kleinbuchstaben und 1 Zahl enthalten.',
        passwordFormTitle: 'Willkommen zurück bei der New Expensify! Bitte legen Sie Ihr Passwort fest.',
        passwordNotSet: 'Wir konnten Ihr neues Passwort nicht festlegen. Wir haben Ihnen einen neuen Passwort-Link gesendet, um es erneut zu versuchen.',
        setPasswordLinkInvalid: 'Dieser Link zum Festlegen des Passworts ist ungültig oder abgelaufen. Ein neuer wartet in Ihrem E-Mail-Posteingang auf Sie!',
        validateAccount: 'Konto verifizieren',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Fügen Sie ein Emoji hinzu, um Ihren Kollegen und Freunden auf einfache Weise mitzuteilen, was los ist. Sie können optional auch eine Nachricht hinzufügen!',
        today: 'Heute',
        clearStatus: 'Status löschen',
        save: 'Speichern',
        message: 'Nachricht',
        timePeriods: {
            never: 'Never',
            thirtyMinutes: '30 Minuten',
            oneHour: '1 Stunde',
            afterToday: 'Heute',
            afterWeek: 'Eine Woche',
            custom: 'Custom',
        },
        untilTomorrow: 'Bis morgen',
        untilTime: function (_a) {
            var time = _a.time;
            return "Bis ".concat(time);
        },
        date: 'Datum',
        time: 'Zeit',
        vacationDelegate: 'Urlaubsvertretung',
        setVacationDelegate: "Legen Sie eine Urlaubsvertretung fest, die Berichte in Ihrer Abwesenheit genehmigt.",
        vacationDelegateError: 'Beim Aktualisieren Ihrer Urlaubsvertretung ist ein Fehler aufgetreten.',
        asVacationDelegate: function (_a) {
            var managerName = _a.nameOrEmail;
            return "als Urlaubsvertretung von ".concat(managerName);
        },
        toAsVacationDelegate: function (_a) {
            var submittedToName = _a.submittedToName, vacationDelegateName = _a.vacationDelegateName;
            return "an ".concat(submittedToName, " als Urlaubsvertretung von ").concat(vacationDelegateName);
        },
        vacationDelegateWarning: function (_a) {
            var nameOrEmail = _a.nameOrEmail;
            return "Sie weisen ".concat(nameOrEmail, " als Ihre Urlaubsvertretung zu. Diese Person ist noch nicht in all Ihren Workspaces. Wenn Sie fortfahren, wird eine E-Mail an alle Ihre Workspace-Administratoren gesendet, um sie hinzuzuf\u00FCgen.");
        },
        clearAfter: 'Nach dem Löschen',
        whenClearStatus: 'Wann sollten wir Ihren Status löschen?',
    },
    stepCounter: function (_a) {
        var step = _a.step, total = _a.total, text = _a.text;
        var result = "Schritt ".concat(step);
        if (total) {
            result = "".concat(result, " of ").concat(total);
        }
        if (text) {
            result = "".concat(result, ": ").concat(text);
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Bankinformationen',
        confirmBankInfo: 'Bankinformationen bestätigen',
        manuallyAdd: 'Fügen Sie Ihr Bankkonto manuell hinzu',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        accountEnding: 'Konto endet mit',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in Ihrem Arbeitsbereich verwendet.',
        accountNumber: 'Kontonummer',
        routingNumber: 'Routing-Nummer',
        chooseAnAccountBelow: 'Wählen Sie ein Konto unten aus',
        addBankAccount: 'Bankkonto hinzufügen',
        chooseAnAccount: 'Konto auswählen',
        connectOnlineWithPlaid: 'Melden Sie sich bei Ihrer Bank an',
        connectManually: 'Manuell verbinden',
        desktopConnection: 'Hinweis: Um eine Verbindung mit Chase, Wells Fargo, Capital One oder Bank of America herzustellen, klicken Sie bitte hier, um diesen Vorgang in einem Browser abzuschließen.',
        yourDataIsSecure: 'Ihre Daten sind sicher',
        toGetStarted: 'Fügen Sie ein Bankkonto hinzu, um Ausgaben zu erstatten, Expensify-Karten auszustellen, Rechnungszahlungen zu sammeln und Rechnungen von einem Ort aus zu bezahlen.',
        plaidBodyCopy: 'Geben Sie Ihren Mitarbeitern eine einfachere Möglichkeit, Unternehmensausgaben zu bezahlen - und zurückerstattet zu werden.',
        checkHelpLine: 'Ihre Bankleitzahl und Kontonummer finden Sie auf einem Scheck für das Konto.',
        hasPhoneLoginError: function (_a) {
            var contactMethodRoute = _a.contactMethodRoute;
            return "Um ein Bankkonto zu verbinden, bitte <a href=\"".concat(contactMethodRoute, "\">F\u00FCgen Sie eine E-Mail als Ihren prim\u00E4ren Login hinzu</a> und versuchen Sie es erneut. Sie k\u00F6nnen Ihre Telefonnummer als sekund\u00E4ren Login hinzuf\u00FCgen.");
        },
        hasBeenThrottledError: 'Beim Hinzufügen Ihres Bankkontos ist ein Fehler aufgetreten. Bitte warten Sie ein paar Minuten und versuchen Sie es erneut.',
        hasCurrencyError: function (_a) {
            var workspaceRoute = _a.workspaceRoute;
            return "Ups! Es scheint, dass die W\u00E4hrung Ihres Arbeitsbereichs auf eine andere W\u00E4hrung als USD eingestellt ist. Um fortzufahren, gehen Sie bitte zu <a href=\"".concat(workspaceRoute, "\">Ihre Arbeitsbereichseinstellungen</a> um es auf USD zu setzen und es erneut zu versuchen.");
        },
        error: {
            youNeedToSelectAnOption: 'Bitte wählen Sie eine Option, um fortzufahren.',
            noBankAccountAvailable: 'Entschuldigung, es ist kein Bankkonto verfügbar.',
            noBankAccountSelected: 'Bitte wählen Sie ein Konto aus',
            taxID: 'Bitte geben Sie eine gültige Steueridentifikationsnummer ein.',
            website: 'Bitte geben Sie eine gültige Website ein.',
            zipCode: "Bitte geben Sie eine g\u00FCltige Postleitzahl im Format ein: ".concat(CONST_1.default.COUNTRY_ZIP_REGEX_DATA.US.samples),
            phoneNumber: 'Bitte geben Sie eine gültige Telefonnummer ein.',
            email: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
            companyName: 'Bitte geben Sie einen gültigen Firmennamen ein',
            addressCity: 'Bitte geben Sie eine gültige Stadt ein',
            addressStreet: 'Bitte geben Sie eine gültige Straßenadresse ein',
            addressState: 'Bitte wählen Sie einen gültigen Bundesstaat aus',
            incorporationDateFuture: 'Das Gründungsdatum kann nicht in der Zukunft liegen.',
            incorporationState: 'Bitte wählen Sie einen gültigen Bundesstaat aus',
            industryCode: 'Bitte geben Sie einen gültigen Branchenklassifizierungscode mit sechs Ziffern ein.',
            restrictedBusiness: 'Bitte bestätigen Sie, dass das Unternehmen nicht auf der Liste der eingeschränkten Unternehmen steht.',
            routingNumber: 'Bitte geben Sie eine gültige Bankleitzahl ein',
            accountNumber: 'Bitte geben Sie eine gültige Kontonummer ein',
            routingAndAccountNumberCannotBeSame: 'Routing- und Kontonummern dürfen nicht übereinstimmen.',
            companyType: 'Bitte wählen Sie einen gültigen Unternehmenstyp aus',
            tooManyAttempts: 'Aufgrund einer hohen Anzahl von Anmeldeversuchen wurde diese Option für 24 Stunden deaktiviert. Bitte versuchen Sie es später erneut oder geben Sie die Details stattdessen manuell ein.',
            address: 'Bitte geben Sie eine gültige Adresse ein',
            dob: 'Bitte wählen Sie ein gültiges Geburtsdatum aus',
            age: 'Muss über 18 Jahre alt sein',
            ssnLast4: 'Bitte geben Sie die letzten 4 Ziffern der SSN ein.',
            firstName: 'Bitte geben Sie einen gültigen Vornamen ein',
            lastName: 'Bitte geben Sie einen gültigen Nachnamen ein',
            noDefaultDepositAccountOrDebitCardAvailable: 'Bitte fügen Sie ein Standard-Einzahlungskonto oder eine Debitkarte hinzu.',
            validationAmounts: 'Die eingegebenen Validierungsbeträge sind falsch. Bitte überprüfen Sie Ihren Kontoauszug und versuchen Sie es erneut.',
            fullName: 'Bitte geben Sie einen gültigen vollständigen Namen ein',
            ownershipPercentage: 'Bitte geben Sie eine gültige Prozentzahl ein.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Wo befindet sich Ihr Bankkonto?',
        accountDetailsStepHeader: 'Was sind Ihre Kontodaten?',
        accountTypeStepHeader: 'Welche Art von Konto ist das?',
        bankInformationStepHeader: 'Was sind Ihre Bankdaten?',
        accountHolderInformationStepHeader: 'Was sind die Kontoinhaberdaten?',
        howDoWeProtectYourData: 'Wie schützen wir Ihre Daten?',
        currencyHeader: 'Was ist die Währung Ihres Bankkontos?',
        confirmationStepHeader: 'Überprüfen Sie Ihre Informationen.',
        confirmationStepSubHeader: 'Überprüfen Sie die unten stehenden Details und aktivieren Sie das Kontrollkästchen für die Bedingungen, um zu bestätigen.',
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
        passwordIncorrect: 'Falsches Passwort. Bitte versuchen Sie es erneut.',
        failedToLoadPDF: 'Fehler beim Laden der PDF-Datei',
        pdfPasswordForm: {
            title: 'Passwortgeschütztes PDF',
            infoText: 'Diese PDF ist passwortgeschützt.',
            beforeLinkText: 'Bitte',
            linkText: 'Passwort eingeben',
            afterLinkText: 'um es anzusehen.',
            formLabel: 'PDF anzeigen',
        },
        attachmentNotFound: 'Anhang nicht gefunden',
    },
    messages: {
        errorMessageInvalidPhone: "Bitte geben Sie eine g\u00FCltige Telefonnummer ohne Klammern oder Bindestriche ein. Wenn Sie sich au\u00DFerhalb der USA befinden, geben Sie bitte Ihre L\u00E4ndervorwahl an (z. B. ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")."),
        errorMessageInvalidEmail: 'Ungültige E-Mail-Adresse',
        userIsAlreadyMember: function (_a) {
            var login = _a.login, name = _a.name;
            return "".concat(login, " ist bereits Mitglied von ").concat(name);
        },
    },
    onfidoStep: {
        acceptTerms: 'Indem Sie mit der Anfrage zur Aktivierung Ihres Expensify Wallets fortfahren, bestätigen Sie, dass Sie gelesen haben, verstehen und akzeptieren',
        facialScan: 'Onfidos Richtlinie und Freigabe zur Gesichtserkennung',
        tryAgain: 'Versuchen Sie es erneut.',
        verifyIdentity: 'Identität verifizieren',
        letsVerifyIdentity: 'Lassen Sie uns Ihre Identität überprüfen',
        butFirst: "Aber zuerst das langweilige Zeug. Lies dir im n\u00E4chsten Schritt das Kleingedruckte durch und klicke auf \"Akzeptieren\", wenn du bereit bist.",
        genericError: 'Ein Fehler ist bei der Verarbeitung dieses Schritts aufgetreten. Bitte versuchen Sie es erneut.',
        cameraPermissionsNotGranted: 'Kamerazugriff aktivieren',
        cameraRequestMessage: 'Wir benötigen Zugriff auf Ihre Kamera, um die Bankkontoverifizierung abzuschließen. Bitte aktivieren Sie dies über Einstellungen > New Expensify.',
        microphonePermissionsNotGranted: 'Mikrofonzugriff aktivieren',
        microphoneRequestMessage: 'Wir benötigen Zugriff auf Ihr Mikrofon, um die Bankkontoverifizierung abzuschließen. Bitte aktivieren Sie dies über Einstellungen > New Expensify.',
        originalDocumentNeeded: 'Bitte laden Sie ein Originalbild Ihres Ausweises hoch, anstatt einen Screenshot oder ein gescanntes Bild.',
        documentNeedsBetterQuality: 'Ihr Ausweis scheint beschädigt zu sein oder es fehlen Sicherheitsmerkmale. Bitte laden Sie ein Originalbild eines unbeschädigten Ausweises hoch, der vollständig sichtbar ist.',
        imageNeedsBetterQuality: 'Es gibt ein Problem mit der Bildqualität Ihres Ausweises. Bitte laden Sie ein neues Bild hoch, auf dem Ihr gesamter Ausweis klar zu sehen ist.',
        selfieIssue: 'Es gibt ein Problem mit Ihrem Selfie/Video. Bitte laden Sie ein Live-Selfie/Video hoch.',
        selfieNotMatching: 'Ihr Selfie/Video stimmt nicht mit Ihrem Ausweis überein. Bitte laden Sie ein neues Selfie/Video hoch, auf dem Ihr Gesicht klar zu erkennen ist.',
        selfieNotLive: 'Ihr Selfie/Video scheint kein Live-Foto/Video zu sein. Bitte laden Sie ein Live-Selfie/Video hoch.',
    },
    additionalDetailsStep: {
        headerTitle: 'Zusätzliche Details',
        helpText: 'Wir müssen die folgenden Informationen bestätigen, bevor Sie Geld von Ihrem Wallet senden und empfangen können.',
        helpTextIdologyQuestions: 'Wir müssen Ihnen nur noch ein paar weitere Fragen stellen, um Ihre Identität abschließend zu überprüfen.',
        helpLink: 'Erfahren Sie mehr darüber, warum wir das brauchen.',
        legalFirstNameLabel: 'Gesetzlicher Vorname',
        legalMiddleNameLabel: 'Zweiter Vorname (rechtlich)',
        legalLastNameLabel: 'Rechtlicher Nachname',
        selectAnswer: 'Bitte wählen Sie eine Antwort, um fortzufahren.',
        ssnFull9Error: 'Bitte geben Sie eine gültige neunstellige SSN ein.',
        needSSNFull9: 'Wir haben Schwierigkeiten, Ihre SSN zu verifizieren. Bitte geben Sie die vollständigen neun Ziffern Ihrer SSN ein.',
        weCouldNotVerify: 'Wir konnten nicht verifizieren',
        pleaseFixIt: 'Bitte korrigieren Sie diese Informationen, bevor Sie fortfahren.',
        failedKYCTextBefore: 'Wir konnten Ihre Identität nicht verifizieren. Bitte versuchen Sie es später erneut oder wenden Sie sich an',
        failedKYCTextAfter: 'wenn Sie Fragen haben.',
    },
    termsStep: {
        headerTitle: 'Bedingungen und Gebühren',
        headerTitleRefactor: 'Gebühren und Bedingungen',
        haveReadAndAgree: 'Ich habe gelesen und stimme zu, zu erhalten',
        electronicDisclosures: 'elektronische Offenlegungen',
        agreeToThe: 'Ich stimme den',
        walletAgreement: 'Wallet-Vereinbarung',
        enablePayments: 'Zahlungen aktivieren',
        monthlyFee: 'Monatliche Gebühr',
        inactivity: 'Inaktivität',
        noOverdraftOrCredit: 'Keine Überziehungs-/Kreditfunktion.',
        electronicFundsWithdrawal: 'Elektronische Mittelabhebung',
        standard: 'Standard',
        reviewTheFees: 'Schauen Sie sich einige Gebühren an.',
        checkTheBoxes: 'Bitte die untenstehenden Kästchen ankreuzen.',
        agreeToTerms: 'Stimmen Sie den Bedingungen zu und Sie können loslegen!',
        shortTermsForm: {
            expensifyPaymentsAccount: function (_a) {
                var walletProgram = _a.walletProgram;
                return "Das Expensify Wallet wird von ".concat(walletProgram, " ausgestellt.");
            },
            perPurchase: 'Pro Kauf',
            atmWithdrawal: 'Geldautomat-Abhebung',
            cashReload: 'Bargeldaufladung',
            inNetwork: 'im Netzwerk',
            outOfNetwork: 'außerhalb des Netzwerks',
            atmBalanceInquiry: 'Geldautomaten-Saldoabfrage',
            inOrOutOfNetwork: '(im Netzwerk oder außerhalb des Netzwerks)',
            customerService: 'Kundendienst',
            automatedOrLive: '(automated or live agent)',
            afterTwelveMonths: '(nach 12 Monaten ohne Transaktionen)',
            weChargeOneFee: 'Wir erheben eine andere Art von Gebühr. Sie ist:',
            fdicInsurance: 'Ihre Gelder sind für die FDIC-Versicherung berechtigt.',
            generalInfo: 'Für allgemeine Informationen über Prepaid-Konten besuchen Sie',
            conditionsDetails: 'Für Details und Bedingungen zu allen Gebühren und Dienstleistungen besuchen Sie bitte',
            conditionsPhone: 'oder rufen Sie +1 833-400-0904 an.',
            instant: '(instant)',
            electronicFundsInstantFeeMin: function (_a) {
                var amount = _a.amount;
                return "(min ".concat(amount, ")");
            },
        },
        longTermsForm: {
            listOfAllFees: 'Eine Liste aller Expensify Wallet-Gebühren',
            typeOfFeeHeader: 'Alle Gebühren',
            feeAmountHeader: 'Betrag',
            moreDetailsHeader: 'Einzelheiten',
            openingAccountTitle: 'Ein Konto eröffnen',
            openingAccountDetails: 'Es gibt keine Gebühr, um ein Konto zu eröffnen.',
            monthlyFeeDetails: 'Es gibt keine monatliche Gebühr.',
            customerServiceTitle: 'Kundendienst',
            customerServiceDetails: 'Es gibt keine Kundendienstgebühren.',
            inactivityDetails: 'Es gibt keine Inaktivitätsgebühr.',
            sendingFundsTitle: 'Senden von Geldern an einen anderen Kontoinhaber',
            sendingFundsDetails: 'Es gibt keine Gebühr, um Geld an einen anderen Kontoinhaber zu senden, wenn Sie Ihr Guthaben, Ihr Bankkonto oder Ihre Debitkarte verwenden.',
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
            fdicInsuranceBancorp2: 'für Details.',
            contactExpensifyPayments: "Kontaktieren Sie ".concat(CONST_1.default.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS, " telefonisch unter +1 833-400-0904 oder per E-Mail an"),
            contactExpensifyPayments2: 'oder anmelden bei',
            generalInformation: 'Für allgemeine Informationen über Prepaid-Konten besuchen Sie',
            generalInformation2: 'Wenn Sie eine Beschwerde über ein Prepaid-Konto haben, rufen Sie das Consumer Financial Protection Bureau unter 1-855-411-2372 an oder besuchen Sie',
            printerFriendlyView: 'Druckerfreundliche Version anzeigen',
            automated: 'Automatisiert',
            liveAgent: 'Live-Agent',
            instant: 'Sofort',
            electronicFundsInstantFeeMin: function (_a) {
                var amount = _a.amount;
                return "Min ".concat(amount);
            },
        },
    },
    activateStep: {
        headerTitle: 'Zahlungen aktivieren',
        activatedTitle: 'Wallet aktiviert!',
        activatedMessage: 'Glückwunsch, Ihr Wallet ist eingerichtet und bereit für Zahlungen.',
        checkBackLaterTitle: 'Nur eine Minute...',
        checkBackLaterMessage: 'Wir überprüfen Ihre Informationen noch. Bitte schauen Sie später noch einmal vorbei.',
        continueToPayment: 'Weiter zur Zahlung',
        continueToTransfer: 'Weiter übertragen',
    },
    companyStep: {
        headerTitle: 'Unternehmensinformationen',
        subtitle: 'Fast fertig! Aus Sicherheitsgründen müssen wir einige Informationen bestätigen:',
        legalBusinessName: 'Rechtlicher Firmenname',
        companyWebsite: 'Unternehmenswebsite',
        taxIDNumber: 'Steuernummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        companyType: 'Unternehmenstyp',
        incorporationDate: 'Gründungsdatum',
        incorporationState: 'Gründungsstaat',
        industryClassificationCode: 'Industrieklassifikationscode',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der',
        listOfRestrictedBusinesses: 'Liste der eingeschränkten Unternehmen',
        incorporationDatePlaceholder: 'Startdatum (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Kooperativ',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Andere',
        },
        industryClassification: 'Unter welcher Branche ist das Unternehmen klassifiziert?',
        industryClassificationCodePlaceholder: 'Suche nach dem Branchenschlüssel',
    },
    requestorStep: {
        headerTitle: 'Persönliche Informationen',
        learnMore: 'Erfahren Sie mehr',
        isMyDataSafe: 'Sind meine Daten sicher?',
    },
    personalInfoStep: {
        personalInfo: 'Persönliche Informationen',
        enterYourLegalFirstAndLast: 'Wie lautet Ihr gesetzlicher Name?',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        legalName: 'Rechtlicher Name',
        enterYourDateOfBirth: 'Was ist Ihr Geburtsdatum?',
        enterTheLast4: 'Was sind die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4SSN: 'Letzte 4 der SSN',
        enterYourAddress: 'Wie lautet Ihre Adresse?',
        address: 'Adresse',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        byAddingThisBankAccount: 'Durch das Hinzufügen dieses Bankkontos bestätigen Sie, dass Sie gelesen haben, verstehen und akzeptieren',
        whatsYourLegalName: 'Wie lautet Ihr gesetzlicher Name?',
        whatsYourDOB: 'Was ist Ihr Geburtsdatum?',
        whatsYourAddress: 'Wie lautet Ihre Adresse?',
        whatsYourSSN: 'Was sind die letzten vier Ziffern Ihrer Sozialversicherungsnummer?',
        noPersonalChecks: 'Keine Sorge, hier gibt es keine persönlichen Bonitätsprüfungen!',
        whatsYourPhoneNumber: 'Wie lautet Ihre Telefonnummer?',
        weNeedThisToVerify: 'Wir benötigen dies, um Ihr Wallet zu verifizieren.',
    },
    businessInfoStep: {
        businessInfo: 'Unternehmensinformationen',
        enterTheNameOfYourBusiness: 'Wie heißt Ihr Unternehmen?',
        businessName: 'Rechtlicher Firmenname',
        enterYourCompanyTaxIdNumber: 'Wie lautet die Steuernummer Ihres Unternehmens?',
        taxIDNumber: 'Steuernummer',
        taxIDNumberPlaceholder: '9 Ziffern',
        enterYourCompanyWebsite: 'Wie lautet die Website Ihres Unternehmens?',
        companyWebsite: 'Unternehmenswebsite',
        enterYourCompanyPhoneNumber: 'Wie lautet die Telefonnummer Ihres Unternehmens?',
        enterYourCompanyAddress: 'Wie lautet die Adresse Ihres Unternehmens?',
        selectYourCompanyType: 'Was für ein Unternehmen ist das?',
        companyType: 'Unternehmenstyp',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerschaft',
            COOPERATIVE: 'Kooperativ',
            SOLE_PROPRIETORSHIP: 'Einzelunternehmen',
            OTHER: 'Andere',
        },
        selectYourCompanyIncorporationDate: 'Was ist das Gründungsdatum Ihres Unternehmens?',
        incorporationDate: 'Gründungsdatum',
        incorporationDatePlaceholder: 'Startdatum (yyyy-mm-dd)',
        incorporationState: 'Gründungsstaat',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'In welchem Bundesstaat wurde Ihr Unternehmen gegründet?',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        companyAddress: 'Firmenadresse',
        listOfRestrictedBusinesses: 'Liste der eingeschränkten Unternehmen',
        confirmCompanyIsNot: 'Ich bestätige, dass dieses Unternehmen nicht auf der',
        businessInfoTitle: 'Geschäftsinformationen',
        legalBusinessName: 'Rechtlicher Firmenname',
        whatsTheBusinessName: 'Wie lautet der Firmenname?',
        whatsTheBusinessAddress: 'Wie lautet die Geschäftsadresse?',
        whatsTheBusinessContactInformation: 'Wie lauten die Geschäftskontaktdaten?',
        whatsTheBusinessRegistrationNumber: 'Wie lautet die Handelsregisternummer?',
        whatsTheBusinessTaxIDEIN: function (_a) {
            var country = _a.country;
            switch (country) {
                case CONST_1.default.COUNTRY.US:
                    return 'Was ist die Arbeitgeber-Identifikationsnummer (EIN)?';
                case CONST_1.default.COUNTRY.CA:
                    return 'Was ist die Unternehmensnummer (BN)?';
                case CONST_1.default.COUNTRY.GB:
                    return 'Was ist die Umsatzsteuer-Identifikationsnummer (VRN)?';
                case CONST_1.default.COUNTRY.AU:
                    return 'Was ist die australische Unternehmensnummer (ABN)?';
                default:
                    return 'Was ist die EU-Umsatzsteuer-Identifikationsnummer?';
            }
        },
        whatsThisNumber: 'Was ist diese Nummer?',
        whereWasTheBusinessIncorporated: 'Wo wurde das Unternehmen gegründet?',
        whatTypeOfBusinessIsIt: 'Welche Art von Geschäft ist es?',
        whatsTheBusinessAnnualPayment: 'Wie hoch ist das jährliche Zahlungsvolumen des Unternehmens?',
        whatsYourExpectedAverageReimbursements: 'Wie hoch ist Ihr erwarteter durchschnittlicher Erstattungsbetrag?',
        registrationNumber: 'Registrierungsnummer',
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
                    return 'EU-USt';
            }
        },
        businessAddress: 'Geschäftsadresse',
        businessType: 'Geschäftsart',
        incorporation: 'Inkorporation',
        incorporationCountry: 'Gründungsland',
        incorporationTypeName: 'Gründungsart',
        businessCategory: 'Geschäftskategorie',
        annualPaymentVolume: 'Jährliches Zahlungsvolumen',
        annualPaymentVolumeInCurrency: function (_a) {
            var currencyCode = _a.currencyCode;
            return "J\u00E4hrliches Zahlungsvolumen in ".concat(currencyCode);
        },
        averageReimbursementAmount: 'Durchschnittlicher Erstattungsbetrag',
        averageReimbursementAmountInCurrency: function (_a) {
            var currencyCode = _a.currencyCode;
            return "Durchschnittlicher Erstattungsbetrag in ".concat(currencyCode);
        },
        selectIncorporationType: 'Wählen Sie die Art der Gründung aus',
        selectBusinessCategory: 'Geschäftskategorie auswählen',
        selectAnnualPaymentVolume: 'Jährliches Zahlungsvolumen auswählen',
        selectIncorporationCountry: 'Wählen Sie das Gründungsland aus',
        selectIncorporationState: 'Inkorporationsstaat auswählen',
        selectAverageReimbursement: 'Durchschnittlichen Erstattungsbetrag auswählen',
        findIncorporationType: 'Art der Unternehmensgründung finden',
        findBusinessCategory: 'Geschäftskategorie finden',
        findAnnualPaymentVolume: 'Jährliches Zahlungsvolumen finden',
        findIncorporationState: 'Gründungsstaat finden',
        findAverageReimbursement: 'Durchschnittlichen Erstattungsbetrag finden',
        error: {
            registrationNumber: 'Bitte geben Sie eine gültige Registrierungsnummer an.',
            taxIDEIN: function (_a) {
                var country = _a.country;
                switch (country) {
                    case CONST_1.default.COUNTRY.US:
                        return 'Bitte geben Sie eine gültige Arbeitgeber-Identifikationsnummer (EIN) an';
                    case CONST_1.default.COUNTRY.CA:
                        return 'Bitte geben Sie eine gültige Unternehmensnummer (BN) an';
                    case CONST_1.default.COUNTRY.GB:
                        return 'Bitte geben Sie eine gültige Umsatzsteuer-Identifikationsnummer (VRN) an';
                    case CONST_1.default.COUNTRY.AU:
                        return 'Bitte geben Sie eine gültige australische Unternehmensnummer (ABN) an';
                    default:
                        return 'Bitte geben Sie eine gültige EU-Umsatzsteuer-Identifikationsnummer an';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'Besitzen Sie 25 % oder mehr von',
        doAnyIndividualOwn25percent: 'Besitzen Einzelpersonen 25 % oder mehr von',
        areThereMoreIndividualsWhoOwn25percent: 'Gibt es mehr Personen, die 25 % oder mehr von besitzen?',
        regulationRequiresUsToVerifyTheIdentity: 'Die Vorschriften verlangen von uns, die Identität jeder Person zu überprüfen, die mehr als 25% des Unternehmens besitzt.',
        companyOwner: 'Geschäftsinhaber',
        enterLegalFirstAndLastName: 'Wie lautet der gesetzliche Name des Eigentümers?',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        enterTheDateOfBirthOfTheOwner: 'Was ist das Geburtsdatum des Eigentümers?',
        enterTheLast4: 'Was sind die letzten 4 Ziffern der Sozialversicherungsnummer des Eigentümers?',
        last4SSN: 'Letzte 4 der SSN',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        enterTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        address: 'Adresse',
        byAddingThisBankAccount: 'Durch das Hinzufügen dieses Bankkontos bestätigen Sie, dass Sie gelesen haben, verstehen und akzeptieren',
        owners: 'Eigentümer',
    },
    ownershipInfoStep: {
        ownerInfo: 'Eigentümerinformationen',
        businessOwner: 'Geschäftsinhaber',
        signerInfo: 'Unterzeichnerinformationen',
        doYouOwn: function (_a) {
            var companyName = _a.companyName;
            return "Besitzen Sie 25 % oder mehr von ".concat(companyName, "?");
        },
        doesAnyoneOwn: function (_a) {
            var companyName = _a.companyName;
            return "Besitzt eine Einzelperson 25 % oder mehr von ".concat(companyName, "?");
        },
        regulationsRequire: 'Vorschriften erfordern, dass wir die Identität jeder Person überprüfen, die mehr als 25% des Unternehmens besitzt.',
        legalFirstName: 'Gesetzlicher Vorname',
        legalLastName: 'Rechtlicher Nachname',
        whatsTheOwnersName: 'Wie lautet der gesetzliche Name des Eigentümers?',
        whatsYourName: 'Wie lautet Ihr gesetzlicher Name?',
        whatPercentage: 'Welcher Prozentsatz des Unternehmens gehört dem Eigentümer?',
        whatsYoursPercentage: 'Wie viel Prozent des Unternehmens besitzen Sie?',
        ownership: 'Eigentum',
        whatsTheOwnersDOB: 'Was ist das Geburtsdatum des Eigentümers?',
        whatsYourDOB: 'Was ist Ihr Geburtsdatum?',
        whatsTheOwnersAddress: 'Wie lautet die Adresse des Eigentümers?',
        whatsYourAddress: 'Wie lautet Ihre Adresse?',
        whatAreTheLast: 'Was sind die letzten 4 Ziffern der Sozialversicherungsnummer des Eigentümers?',
        whatsYourLast: 'Was sind die letzten 4 Ziffern Ihrer Sozialversicherungsnummer?',
        dontWorry: 'Keine Sorge, wir führen keine persönlichen Bonitätsprüfungen durch!',
        last4: 'Letzte 4 der SSN',
        whyDoWeAsk: 'Warum fragen wir danach?',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        ownershipPercentage: 'Eigentumsanteil',
        areThereOther: function (_a) {
            var companyName = _a.companyName;
            return "Gibt es andere Personen, die 25 % oder mehr von ".concat(companyName, " besitzen?");
        },
        owners: 'Eigentümer',
        addCertified: 'Fügen Sie ein zertifiziertes Organigramm hinzu, das die wirtschaftlichen Eigentümer zeigt.',
        regulationRequiresChart: 'Die Vorschriften erfordern, dass wir eine beglaubigte Kopie des Eigentumsdiagramms sammeln, das jede Person oder Einheit zeigt, die 25 % oder mehr des Unternehmens besitzt.',
        uploadEntity: 'Organigramm der Unternehmenseigentümer hochladen',
        noteEntity: 'Hinweis: Das Eigentumsdiagramm der Entität muss von Ihrem Buchhalter, Rechtsberater oder notariell beglaubigt unterschrieben werden.',
        certified: 'Zertifiziertes Eigentumsdiagramm der Einheit',
        selectCountry: 'Land auswählen',
        findCountry: 'Land finden',
        address: 'Adresse',
        chooseFile: 'Datei auswählen',
        uploadDocuments: 'Zusätzliche Dokumentation hochladen',
        pleaseUpload: 'Bitte laden Sie zusätzliche Dokumente hoch, um uns zu helfen, Ihre Identität als direkter oder indirekter Eigentümer von 25% oder mehr der Geschäftseinheit zu verifizieren.',
        acceptedFiles: 'Akzeptierte Dateiformate: PDF, PNG, JPEG. Die Gesamtdateigröße für jeden Abschnitt darf 5 MB nicht überschreiten.',
        proofOfBeneficialOwner: 'Nachweis des wirtschaftlich Berechtigten',
        proofOfBeneficialOwnerDescription: 'Bitte legen Sie eine unterzeichnete Bestätigung und ein Organigramm von einem Wirtschaftsprüfer, Notar oder Anwalt vor, die die Eigentümerschaft von 25 % oder mehr des Unternehmens bestätigen. Diese muss innerhalb der letzten drei Monate datiert sein und die Lizenznummer des Unterzeichners enthalten.',
        copyOfID: 'Kopie des Ausweises für den wirtschaftlich Berechtigten',
        copyOfIDDescription: 'Beispiele: Reisepass, Führerschein, etc.',
        proofOfAddress: 'Adressnachweis für den wirtschaftlich Berechtigten',
        proofOfAddressDescription: 'Beispiele: Nebenkostenabrechnung, Mietvertrag, etc.',
        codiceFiscale: 'Codice fiscale/Steuer-ID',
        codiceFiscaleDescription: 'Bitte laden Sie ein Video eines Vor-Ort-Besuchs oder eines aufgezeichneten Anrufs mit dem unterzeichnenden Beamten hoch. Der Beamte muss folgende Angaben machen: vollständiger Name, Geburtsdatum, Firmenname, Registrierungsnummer, Steuercodenummer, registrierte Adresse, Art des Geschäfts und Zweck des Kontos.',
    },
    validationStep: {
        headerTitle: 'Bankkonto validieren',
        buttonText: 'Einrichtung abschließen',
        maxAttemptsReached: 'Die Validierung für dieses Bankkonto wurde aufgrund zu vieler falscher Versuche deaktiviert.',
        description: "Innerhalb von 1-2 Werktagen werden wir drei (3) kleine Transaktionen an Ihr Bankkonto senden, von einem Namen wie \"Expensify, Inc. Validation\".",
        descriptionCTA: 'Bitte geben Sie jeden Transaktionsbetrag in die untenstehenden Felder ein. Beispiel: 1,51.',
        reviewingInfo: 'Danke! Wir überprüfen Ihre Informationen und werden uns in Kürze bei Ihnen melden. Bitte überprüfen Sie Ihren Chat mit Concierge.',
        forNextStep: 'für die nächsten Schritte, um die Einrichtung Ihres Bankkontos abzuschließen.',
        letsChatCTA: 'Ja, lass uns chatten.',
        letsChatText: 'Fast geschafft! Wir benötigen Ihre Hilfe, um ein paar letzte Informationen im Chat zu überprüfen. Bereit?',
        letsChatTitle: 'Lass uns plaudern!',
        enable2FATitle: 'Betrug verhindern, Zwei-Faktor-Authentifizierung (2FA) aktivieren',
        enable2FAText: 'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt die Zwei-Faktor-Authentifizierung (2FA) ein, um Ihrem Konto eine zusätzliche Schutzschicht hinzuzufügen.',
        secureYourAccount: 'Sichern Sie Ihr Konto',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Zusätzliche Informationen',
        checkAllThatApply: 'Überprüfen Sie alle zutreffenden Optionen, andernfalls leer lassen.',
        iOwnMoreThan25Percent: 'Ich besitze mehr als 25% von',
        someoneOwnsMoreThan25Percent: 'Jemand anderes besitzt mehr als 25% von',
        additionalOwner: 'Zusätzlicher wirtschaftlich Berechtigter',
        removeOwner: 'Diesen wirtschaftlich Berechtigten entfernen',
        addAnotherIndividual: 'Fügen Sie eine weitere Person hinzu, die mehr als 25% von besitzt.',
        agreement: 'Vereinbarung:',
        termsAndConditions: 'Allgemeine Geschäftsbedingungen',
        certifyTrueAndAccurate: 'Ich bestätige, dass die angegebenen Informationen wahr und korrekt sind.',
        error: {
            certify: 'Muss bestätigen, dass die Informationen wahr und korrekt sind.',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Überprüfung abschließen',
        confirmAgreements: 'Bitte bestätigen Sie die untenstehenden Vereinbarungen.',
        certifyTrueAndAccurate: 'Ich bestätige, dass die angegebenen Informationen wahr und korrekt sind.',
        certifyTrueAndAccurateError: 'Bitte bestätigen Sie, dass die Informationen wahr und korrekt sind.',
        isAuthorizedToUseBankAccount: 'Ich bin berechtigt, dieses Geschäftskonto für Geschäftsausgaben zu verwenden.',
        isAuthorizedToUseBankAccountError: 'Sie müssen ein Kontrollbeamter mit der Berechtigung sein, das Geschäftskonto zu führen.',
        termsAndConditions: 'Allgemeine Geschäftsbedingungen',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Bankkonto verbinden',
        finishButtonText: 'Einrichtung abschließen',
        validateYourBankAccount: 'Bestätigen Sie Ihr Bankkonto',
        validateButtonText: 'Validieren',
        validationInputLabel: 'Transaktion',
        maxAttemptsReached: 'Die Validierung für dieses Bankkonto wurde aufgrund zu vieler falscher Versuche deaktiviert.',
        description: "Innerhalb von 1-2 Werktagen werden wir drei (3) kleine Transaktionen an Ihr Bankkonto senden, von einem Namen wie \"Expensify, Inc. Validation\".",
        descriptionCTA: 'Bitte geben Sie jeden Transaktionsbetrag in die untenstehenden Felder ein. Beispiel: 1,51.',
        reviewingInfo: 'Danke! Wir überprüfen Ihre Informationen und werden uns in Kürze bei Ihnen melden. Bitte überprüfen Sie Ihren Chat mit Concierge.',
        forNextSteps: 'für die nächsten Schritte, um die Einrichtung Ihres Bankkontos abzuschließen.',
        letsChatCTA: 'Ja, lass uns chatten.',
        letsChatText: 'Fast geschafft! Wir benötigen Ihre Hilfe, um ein paar letzte Informationen im Chat zu überprüfen. Bereit?',
        letsChatTitle: 'Lass uns plaudern!',
        enable2FATitle: 'Betrug verhindern, Zwei-Faktor-Authentifizierung (2FA) aktivieren',
        enable2FAText: 'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt die Zwei-Faktor-Authentifizierung (2FA) ein, um Ihrem Konto eine zusätzliche Schutzschicht hinzuzufügen.',
        secureYourAccount: 'Sichern Sie Ihr Konto',
    },
    countryStep: {
        confirmBusinessBank: 'Bestätigen Sie die Währung und das Land des Geschäftskontos',
        confirmCurrency: 'Währung und Land bestätigen',
        yourBusiness: 'Die Währung Ihres Geschäftskontos muss mit der Währung Ihres Arbeitsbereichs übereinstimmen.',
        youCanChange: 'Sie können die Währung Ihres Arbeitsbereichs in Ihrem ändern.',
        findCountry: 'Land finden',
        selectCountry: 'Land auswählen',
    },
    bankInfoStep: {
        whatAreYour: 'Was sind Ihre Geschäftskontodaten?',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles in Ordnung ist.',
        thisBankAccount: 'Dieses Bankkonto wird für Geschäftszahlungen in Ihrem Arbeitsbereich verwendet.',
        accountNumber: 'Kontonummer',
        accountHolderNameDescription: 'Vollständiger Name des autorisierten Unterzeichners',
    },
    signerInfoStep: {
        signerInfo: 'Unterzeichnerinformationen',
        areYouDirector: function (_a) {
            var companyName = _a.companyName;
            return "Sind Sie ein Direktor oder leitender Angestellter bei ".concat(companyName, "?");
        },
        regulationRequiresUs: 'Die Vorschrift erfordert, dass wir überprüfen, ob der Unterzeichner die Befugnis hat, diese Handlung im Namen des Unternehmens durchzuführen.',
        whatsYourName: 'Wie lautet Ihr gesetzlicher Name?',
        fullName: 'Vollständiger rechtlicher Name',
        whatsYourJobTitle: 'Wie lautet Ihre Berufsbezeichnung?',
        jobTitle: 'Berufsbezeichnung',
        whatsYourDOB: 'Was ist Ihr Geburtsdatum?',
        uploadID: 'Laden Sie einen Ausweis und einen Adressnachweis hoch',
        personalAddress: 'Nachweis der persönlichen Adresse (z.B. Stromrechnung)',
        letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
        legalName: 'Rechtlicher Name',
        proofOf: 'Nachweis der persönlichen Adresse',
        enterOneEmail: function (_a) {
            var companyName = _a.companyName;
            return "Geben Sie die E-Mail-Adresse des Direktors oder leitenden Angestellten bei ".concat(companyName, " ein.");
        },
        regulationRequiresOneMoreDirector: 'Die Vorschrift erfordert mindestens einen weiteren Direktor oder leitenden Angestellten als Unterzeichner.',
        hangTight: 'Bitte warten...',
        enterTwoEmails: function (_a) {
            var companyName = _a.companyName;
            return "Geben Sie die E-Mails von zwei Direktoren oder leitenden Angestellten bei ".concat(companyName, " ein.");
        },
        sendReminder: 'Erinnere senden',
        chooseFile: 'Datei auswählen',
        weAreWaiting: 'Wir warten darauf, dass andere ihre Identität als Direktoren oder leitende Angestellte des Unternehmens verifizieren.',
        id: 'Kopie des Ausweises',
        proofOfDirectors: 'Nachweis des/der Direktors/Direktoren',
        proofOfDirectorsDescription: 'Beispiele: Unternehmensprofil von Oncorp oder Geschäftsregistrierung.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale für Unterzeichner, autorisierte Benutzer und wirtschaftlich Berechtigte.',
        PDSandFSG: 'PDS + FSG Offenlegungsunterlagen',
        PDSandFSGDescription: 'Unsere Partnerschaft mit Corpay nutzt eine API-Verbindung, um das umfangreiche Netzwerk internationaler Bankpartner zu nutzen und globale Rückerstattungen in Expensify zu ermöglichen. Gemäß der australischen Vorschriften stellen wir Ihnen den Financial Services Guide (FSG) und die Product Disclosure Statement (PDS) von Corpay zur Verfügung.\n\nBitte lesen Sie die FSG- und PDS-Dokumente sorgfältig durch, da sie vollständige Details und wichtige Informationen zu den von Corpay angebotenen Produkten und Dienstleistungen enthalten. Bewahren Sie diese Dokumente für zukünftige Referenz auf.',
        pleaseUpload: 'Bitte laden Sie zusätzliche Unterlagen hoch, um uns bei der Überprüfung Ihrer Identität als Direktor oder leitender Angestellter des Unternehmens zu unterstützen.',
    },
    agreementsStep: {
        agreements: 'Vereinbarungen',
        pleaseConfirm: 'Bitte bestätigen Sie die untenstehenden Vereinbarungen',
        regulationRequiresUs: 'Die Vorschriften verlangen von uns, die Identität jeder Person zu überprüfen, die mehr als 25% des Unternehmens besitzt.',
        iAmAuthorized: 'Ich bin berechtigt, das Geschäftskonto für Geschäftsausgaben zu verwenden.',
        iCertify: 'Ich bestätige, dass die bereitgestellten Informationen wahr und korrekt sind.',
        termsAndConditions: 'Allgemeine Geschäftsbedingungen',
        accept: 'Akzeptieren und Bankkonto hinzufügen',
        iConsentToThe: 'Ich stimme der/dem zu',
        privacyNotice: 'Datenschutzhinweis',
        error: {
            authorized: 'Sie müssen ein Kontrollbeamter mit der Berechtigung sein, das Geschäftskonto zu führen.',
            certify: 'Bitte bestätigen Sie, dass die Informationen wahr und korrekt sind.',
            consent: 'Bitte stimmen Sie der Datenschutzerklärung zu.',
        },
    },
    finishStep: {
        connect: 'Bankkonto verbinden',
        letsFinish: 'Lass uns im Chat fertig werden!',
        thanksFor: 'Vielen Dank für diese Details. Ein dedizierter Support-Mitarbeiter wird nun Ihre Informationen überprüfen. Wir werden uns bei Ihnen melden, falls wir noch etwas von Ihnen benötigen. In der Zwischenzeit können Sie sich gerne mit Fragen an uns wenden.',
        iHaveA: 'Ich habe eine Frage.',
        enable2FA: 'Aktivieren Sie die Zwei-Faktor-Authentifizierung (2FA), um Betrug zu verhindern.',
        weTake: 'Wir nehmen Ihre Sicherheit ernst. Bitte richten Sie jetzt die Zwei-Faktor-Authentifizierung (2FA) ein, um Ihrem Konto eine zusätzliche Schutzschicht hinzuzufügen.',
        secure: 'Sichern Sie Ihr Konto',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Einen Moment',
        explanationLine: 'Wir überprüfen Ihre Informationen. Sie können in Kürze mit den nächsten Schritten fortfahren.',
    },
    session: {
        offlineMessageRetry: 'Es sieht so aus, als ob Sie offline sind. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
    },
    travel: {
        header: 'Reise buchen',
        title: 'Reise clever',
        subtitle: 'Verwenden Sie Expensify Travel, um die besten Reiseangebote zu erhalten und alle Ihre Geschäftsausgaben an einem Ort zu verwalten.',
        features: {
            saveMoney: 'Sparen Sie Geld bei Ihren Buchungen',
            alerts: 'Erhalten Sie Echtzeit-Updates und -Benachrichtigungen',
        },
        bookTravel: 'Reise buchen',
        bookDemo: 'Demo buchen',
        bookADemo: 'Eine Demo buchen',
        toLearnMore: 'um mehr zu erfahren.',
        termsAndConditions: {
            header: 'Bevor wir fortfahren...',
            title: 'Allgemeine Geschäftsbedingungen',
            subtitle: 'Bitte stimmen Sie den Expensify Travel zu',
            termsAndConditions: 'Allgemeine Geschäftsbedingungen',
            travelTermsAndConditions: 'Allgemeine Geschäftsbedingungen',
            agree: 'Ich stimme den',
            error: 'Sie müssen den Expensify Travel Geschäftsbedingungen zustimmen, um fortzufahren.',
            defaultWorkspaceError: 'Sie müssen einen Standard-Arbeitsbereich festlegen, um Expensify Travel zu aktivieren. Gehen Sie zu Einstellungen > Arbeitsbereiche > klicken Sie auf die drei vertikalen Punkte neben einem Arbeitsbereich > Als Standard-Arbeitsbereich festlegen und versuchen Sie es dann erneut!',
        },
        flight: 'Flug',
        flightDetails: {
            passenger: 'Passagier',
            layover: function (_a) {
                var layover = _a.layover;
                return "<muted-text-label>Sie haben einen <strong>".concat(layover, " Zwischenstopp</strong> vor diesem Flug</muted-text-label>");
            },
            takeOff: 'Abheben',
            landing: 'Landung',
            seat: 'Sitzplatz',
            class: 'Kabinenklasse',
            recordLocator: 'Buchungscode',
            cabinClasses: {
                unknown: 'Unknown',
                economy: 'Wirtschaft',
                premiumEconomy: 'Premium Economy',
                business: 'Geschäft',
                first: 'Erste',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Gast',
            checkIn: 'Check-in',
            checkOut: 'Check-out',
            roomType: 'Zimmertyp',
            cancellation: 'Stornierungsbedingungen',
            cancellationUntil: 'Kostenlose Stornierung bis',
            confirmation: 'Bestätigungsnummer',
            cancellationPolicies: {
                unknown: 'Unknown',
                nonRefundable: 'Nicht erstattungsfähig',
                freeCancellationUntil: 'Kostenlose Stornierung bis',
                partiallyRefundable: 'Teilweise erstattungsfähig',
            },
        },
        car: 'Auto',
        carDetails: {
            rentalCar: 'Autovermietung',
            pickUp: 'Abholung',
            dropOff: 'Abgabe',
            driver: 'Treiber',
            carType: 'Autotyp',
            cancellation: 'Stornierungsbedingungen',
            cancellationUntil: 'Kostenlose Stornierung bis',
            freeCancellation: 'Kostenlose Stornierung',
            confirmation: 'Bestätigungsnummer',
        },
        train: 'Schiene',
        trainDetails: {
            passenger: 'Passagier',
            departs: 'Abfahrten',
            arrives: 'Ankommt',
            coachNumber: 'Trainernummer',
            seat: 'Sitzplatz',
            fareDetails: 'Fahrpreisdetails',
            confirmation: 'Bestätigungsnummer',
        },
        viewTrip: 'Reise anzeigen',
        modifyTrip: 'Reise ändern',
        tripSupport: 'Reiseunterstützung',
        tripDetails: 'Reisedetails',
        viewTripDetails: 'Reisedetails anzeigen',
        trip: 'Reise',
        trips: 'Reisen',
        tripSummary: 'Reisezusammenfassung',
        departs: 'Abfahrten',
        errorMessage: 'Etwas ist schiefgelaufen. Bitte versuchen Sie es später noch einmal.',
        phoneError: {
            phrase1: 'Bitte',
            link: 'fügen Sie eine Arbeits-E-Mail als Ihren primären Login hinzu',
            phrase2: 'um Reisen zu buchen.',
        },
        domainSelector: {
            title: 'Domain',
            subtitle: 'Wählen Sie eine Domain für die Einrichtung von Expensify Travel.',
            recommended: 'Empfohlen',
        },
        domainPermissionInfo: {
            title: 'Domain',
            restrictionPrefix: "Sie haben keine Berechtigung, Expensify Travel f\u00FCr die Domain zu aktivieren.",
            restrictionSuffix: "Sie m\u00FCssen stattdessen jemanden aus dieser Dom\u00E4ne bitten, Reisen zu aktivieren.",
            accountantInvitationPrefix: "Wenn Sie Buchhalter sind, sollten Sie dem",
            accountantInvitationLink: "ExpensifyApproved! Buchhalterprogramm",
            accountantInvitationSuffix: "um Reisen f\u00FCr diese Domain zu erm\u00F6glichen.",
        },
        publicDomainError: {
            title: 'Erste Schritte mit Expensify Travel',
            message: "Sie m\u00FCssen Ihre Arbeits-E-Mail (z. B. name@company.com) mit Expensify Travel verwenden, nicht Ihre pers\u00F6nliche E-Mail (z. B. name@gmail.com).",
        },
        blockedFeatureModal: {
            title: 'Expensify Travel wurde deaktiviert',
            message: "Ihr Administrator hat Expensify Travel deaktiviert. Bitte befolgen Sie die Buchungsrichtlinien Ihres Unternehmens f\u00FCr Reisebuchungen.",
        },
        verifyCompany: {
            title: 'Beginnen Sie noch heute mit dem Reisen!',
            message: "Bitte kontaktieren Sie Ihren Account Manager oder salesteam@expensify.com, um eine Demo von Travel zu erhalten und es f\u00FCr Ihr Unternehmen zu aktivieren.",
        },
        updates: {
            bookingTicketed: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate, _b = _a.confirmationID, confirmationID = _b === void 0 ? '' : _b;
                return "Ihr Flug ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") am ").concat(startDate, " wurde gebucht. Best\u00E4tigungscode: ").concat(confirmationID);
            },
            ticketVoided: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Ihr Ticket f\u00FCr den Flug ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") am ").concat(startDate, " wurde storniert.");
            },
            ticketRefunded: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Ihr Ticket f\u00FCr den Flug ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") am ").concat(startDate, " wurde erstattet oder umgetauscht.");
            },
            flightCancelled: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Ihr Flug ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") am ").concat(startDate, " wurde von der Fluggesellschaft storniert.");
            },
            flightScheduleChangePending: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Die Fluggesellschaft hat eine Flugplan\u00E4nderung f\u00FCr den Flug ".concat(airlineCode, " vorgeschlagen; wir warten auf die Best\u00E4tigung.");
            },
            flightScheduleChangeClosed: function (_a) {
                var airlineCode = _a.airlineCode, startDate = _a.startDate;
                return "Flugplan\u00E4nderung best\u00E4tigt: Flug ".concat(airlineCode, " startet jetzt um ").concat(startDate, ".");
            },
            flightUpdated: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Ihr Flug ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") am ").concat(startDate, " wurde aktualisiert.");
            },
            flightCabinChanged: function (_a) {
                var airlineCode = _a.airlineCode, cabinClass = _a.cabinClass;
                return "Ihre Kabinenklasse wurde auf ".concat(cabinClass, " auf dem Flug ").concat(airlineCode, " aktualisiert.");
            },
            flightSeatConfirmed: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Ihre Sitzplatzzuweisung auf Flug ".concat(airlineCode, " wurde best\u00E4tigt.");
            },
            flightSeatChanged: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Ihre Sitzplatzzuweisung auf Flug ".concat(airlineCode, " wurde ge\u00E4ndert.");
            },
            flightSeatCancelled: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Ihre Sitzplatzzuweisung auf dem Flug ".concat(airlineCode, " wurde entfernt.");
            },
            paymentDeclined: 'Die Zahlung für Ihre Flugbuchung ist fehlgeschlagen. Bitte versuchen Sie es erneut.',
            bookingCancelledByTraveler: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "Sie haben Ihre ".concat(type, "-Reservierung ").concat(id, " storniert.");
            },
            bookingCancelledByVendor: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "Der Anbieter hat Ihre ".concat(type, "-Reservierung ").concat(id, " storniert.");
            },
            bookingRebooked: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "Ihre ".concat(type, " Reservierung wurde neu gebucht. Neue Best\u00E4tigungsnummer: ").concat(id, ".");
            },
            bookingUpdated: function (_a) {
                var type = _a.type;
                return "Ihre ".concat(type, "-Buchung wurde aktualisiert. \u00DCberpr\u00FCfen Sie die neuen Details im Reiseplan.");
            },
            railTicketRefund: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Ihr Bahnticket f\u00FCr ".concat(origin, " \u2192 ").concat(destination, " am ").concat(startDate, " wurde erstattet. Eine Gutschrift wird bearbeitet.");
            },
            railTicketExchange: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Ihr Bahnticket f\u00FCr ".concat(origin, " \u2192 ").concat(destination, " am ").concat(startDate, " wurde umgetauscht.");
            },
            railTicketUpdate: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Ihr Zugticket f\u00FCr ".concat(origin, " \u2192 ").concat(destination, " am ").concat(startDate, " wurde aktualisiert.");
            },
            defaultUpdate: function (_a) {
                var type = _a.type;
                return "Ihre ".concat(type, " Reservierung wurde aktualisiert.");
            },
        },
    },
    workspace: {
        common: {
            card: 'Karten',
            expensifyCard: 'Expensify Card',
            companyCards: 'Unternehmenskarten',
            workflows: 'Workflows',
            workspace: 'Arbeitsbereich',
            findWorkspace: 'Arbeitsbereich finden',
            edit: 'Arbeitsbereich bearbeiten',
            enabled: 'Aktiviert',
            disabled: 'Deaktiviert',
            everyone: 'Jeder',
            delete: 'Arbeitsbereich löschen',
            settings: 'Einstellungen',
            reimburse: 'Erstattungen',
            categories: 'Kategorien',
            tags: 'Tags',
            customField1: 'Benutzerdefiniertes Feld 1',
            customField2: 'Benutzerdefiniertes Feld 2',
            customFieldHint: 'Fügen Sie benutzerdefinierten Code hinzu, der für alle Ausgaben dieses Mitglieds gilt.',
            reportFields: 'Berichtsfelder',
            reportTitle: 'Berichtstitel',
            reportField: 'Berichtsfeld',
            taxes: 'Steuern',
            bills: 'Rechnungen',
            invoices: 'Rechnungen',
            travel: 'Reisen',
            members: 'Mitglieder',
            accounting: 'Buchhaltung',
            rules: 'Regeln',
            displayedAs: 'Angezeigt als',
            plan: 'Plan',
            profile: 'Übersicht',
            bankAccount: 'Bankkonto',
            connectBankAccount: 'Bankkonto verbinden',
            testTransactions: 'Transaktionen testen',
            issueAndManageCards: 'Karten ausstellen und verwalten',
            reconcileCards: 'Karten abstimmen',
            selected: function () { return ({
                one: '1 ausgewählt',
                other: function (count) { return "".concat(count, " ausgew\u00E4hlt"); },
            }); },
            settlementFrequency: 'Abrechnungshäufigkeit',
            setAsDefault: 'Als Standard-Arbeitsbereich festlegen',
            defaultNote: "Belege, die an ".concat(CONST_1.default.EMAIL.RECEIPTS, " gesendet werden, erscheinen in diesem Arbeitsbereich."),
            deleteConfirmation: 'Möchten Sie diesen Arbeitsbereich wirklich löschen?',
            deleteWithCardsConfirmation: 'Möchten Sie diesen Arbeitsbereich wirklich löschen? Dadurch werden alle Karten-Feeds und zugewiesenen Karten entfernt.',
            unavailable: 'Nicht verfügbarer Arbeitsbereich',
            memberNotFound: 'Mitglied nicht gefunden. Um ein neues Mitglied zum Arbeitsbereich einzuladen, verwenden Sie bitte die Einladungsschaltfläche oben.',
            notAuthorized: "Sie haben keinen Zugriff auf diese Seite. Wenn Sie versuchen, diesem Arbeitsbereich beizutreten, bitten Sie einfach den Besitzer des Arbeitsbereichs, Sie als Mitglied hinzuzuf\u00FCgen. Etwas anderes? Kontaktieren Sie ".concat(CONST_1.default.EMAIL.CONCIERGE, "."),
            goToWorkspace: 'Zum Arbeitsbereich gehen',
            goToWorkspaces: 'Zu Arbeitsbereichen gehen',
            clearFilter: 'Filter löschen',
            workspaceName: 'Arbeitsbereichsname',
            workspaceOwner: 'Eigentümer',
            workspaceType: 'Arbeitsbereichstyp',
            workspaceAvatar: 'Arbeitsbereichs-Avatar',
            mustBeOnlineToViewMembers: 'Sie müssen online sein, um die Mitglieder dieses Arbeitsbereichs anzuzeigen.',
            moreFeatures: 'Mehr Funktionen',
            requested: 'Angefordert',
            distanceRates: 'Entfernungsraten',
            defaultDescription: 'Ein Ort für alle Ihre Belege und Ausgaben.',
            descriptionHint: 'Teilen Sie Informationen über diesen Arbeitsbereich mit allen Mitgliedern.',
            welcomeNote: 'Bitte verwenden Sie Expensify, um Ihre Belege zur Erstattung einzureichen, danke!',
            subscription: 'Abonnement',
            markAsEntered: 'Als manuell eingegeben markieren',
            markAsExported: 'Als manuell exportiert markieren',
            exportIntegrationSelected: function (_a) {
                var connectionName = _a.connectionName;
                return "Exportieren nach ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
            },
            letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
            lineItemLevel: 'Positionsebene',
            reportLevel: 'Berichtsebene',
            topLevel: 'Top-Level',
            appliedOnExport: 'Nicht in Expensify importiert, bei Export angewendet',
            shareNote: {
                header: 'Teilen Sie Ihren Arbeitsbereich mit anderen Mitgliedern',
                content: {
                    firstPart: 'Teilen Sie diesen QR-Code oder kopieren Sie den untenstehenden Link, um es Mitgliedern zu erleichtern, den Zugang zu Ihrem Arbeitsbereich anzufordern. Alle Anfragen zum Beitritt zum Arbeitsbereich werden im',
                    secondPart: 'Raum für Ihre Bewertung.',
                },
            },
            connectTo: function (_a) {
                var connectionName = _a.connectionName;
                return "Mit ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], " verbinden");
            },
            createNewConnection: 'Neue Verbindung erstellen',
            reuseExistingConnection: 'Vorhandene Verbindung wiederverwenden',
            existingConnections: 'Bestehende Verbindungen',
            existingConnectionsDescription: function (_a) {
                var connectionName = _a.connectionName;
                return "Da Sie zuvor eine Verbindung zu ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], " hergestellt haben, k\u00F6nnen Sie eine bestehende Verbindung wiederverwenden oder eine neue erstellen.");
            },
            lastSyncDate: function (_a) {
                var connectionName = _a.connectionName, formattedDate = _a.formattedDate;
                return "".concat(connectionName, " - Zuletzt synchronisiert am ").concat(formattedDate);
            },
            authenticationError: function (_a) {
                var connectionName = _a.connectionName;
                return "Kann nicht mit ".concat(connectionName, " verbunden werden aufgrund eines Authentifizierungsfehlers.");
            },
            learnMore: 'Mehr erfahren.',
            memberAlternateText: 'Mitglieder können Berichte einreichen und genehmigen.',
            adminAlternateText: 'Administratoren haben vollen Bearbeitungszugriff auf alle Berichte und Arbeitsbereichseinstellungen.',
            auditorAlternateText: 'Prüfer können Berichte einsehen und kommentieren.',
            roleName: function (_a) {
                var _b = _a === void 0 ? {} : _a, role = _b.role;
                switch (role) {
                    case CONST_1.default.POLICY.ROLE.ADMIN:
                        return 'Admin';
                    case CONST_1.default.POLICY.ROLE.AUDITOR:
                        return 'Prüfer';
                    case CONST_1.default.POLICY.ROLE.USER:
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
            planType: 'Plantyp',
            submitExpense: 'Reichen Sie Ihre Ausgaben unten ein:',
            defaultCategory: 'Standardkategorie',
            viewTransactions: 'Transaktionen anzeigen',
            policyExpenseChatName: function (_a) {
                var displayName = _a.displayName;
                return "Ausgaben von ".concat(displayName);
            },
        },
        perDiem: {
            subtitle: 'Setzen Sie Tagespauschalen, um die täglichen Ausgaben der Mitarbeiter zu kontrollieren.',
            amount: 'Betrag',
            deleteRates: function () { return ({
                one: 'Löschrate',
                other: 'Raten löschen',
            }); },
            deletePerDiemRate: 'Tagespauschale löschen',
            findPerDiemRate: 'Tagespauschale finden',
            areYouSureDelete: function () { return ({
                one: 'Möchten Sie diesen Satz wirklich löschen?',
                other: 'Möchten Sie diese Tarife wirklich löschen?',
            }); },
            emptyList: {
                title: 'Tagegeld',
                subtitle: 'Legen Sie Tagessätze fest, um die täglichen Ausgaben der Mitarbeiter zu kontrollieren. Importieren Sie die Sätze aus einer Tabelle, um loszulegen.',
            },
            errors: {
                existingRateError: function (_a) {
                    var rate = _a.rate;
                    return "Ein Tarif mit dem Wert ".concat(rate, " existiert bereits.");
                },
            },
            importPerDiemRates: 'Tagespauschalen importieren',
            editPerDiemRate: 'Tagespauschale bearbeiten',
            editPerDiemRates: 'Tagespauschalen bearbeiten',
            editDestinationSubtitle: function (_a) {
                var destination = _a.destination;
                return "Das Aktualisieren dieses Ziels wird es f\u00FCr alle ".concat(destination, " Tagespauschalen \u00E4ndern.");
            },
            editCurrencySubtitle: function (_a) {
                var destination = _a.destination;
                return "Das Aktualisieren dieser W\u00E4hrung wird sie f\u00FCr alle ".concat(destination, " Tagegeld-Subraten \u00E4ndern.");
            },
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie Auslagen in QuickBooks Desktop exportiert werden.',
            exportOutOfPocketExpensesCheckToggle: 'Markiere Schecks als „später drucken“',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach QuickBooks Desktop exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Card-Transaktionen exportieren als',
            account: 'Konto',
            accountDescription: 'Wählen Sie, wo Sie Journaleinträge veröffentlichen möchten.',
            accountsPayable: 'Verbindlichkeiten',
            accountsPayableDescription: 'Wählen Sie aus, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wählen Sie aus, von wo aus Schecks gesendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten zu QuickBooks Desktop.',
                values: (_e = {},
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der letzten Ausgabe im Bericht.',
                    },
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach QuickBooks Desktop exportiert wurde.',
                    },
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: 'Eingereichtes Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                    _e),
            },
            exportCheckDescription: 'Wir werden für jeden Expensify-Bericht eine detaillierte Rechnung erstellen und sie von dem unten stehenden Bankkonto senden.',
            exportJournalEntryDescription: 'Wir werden für jeden Expensify-Bericht einen detaillierten Journaleintrag erstellen und ihn auf das untenstehende Konto buchen.',
            exportVendorBillDescription: 'Wir erstellen eine detaillierte Lieferantenrechnung für jeden Expensify-Bericht und fügen sie dem unten stehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. des nächsten offenen Zeitraums.',
            deepDiveExpensifyCard: 'Expensify-Kartentransaktionen werden automatisch in ein "Expensify Card Liability Account" exportiert, das erstellt wurde mit',
            deepDiveExpensifyCardIntegration: 'unsere Integration.',
            outOfPocketTaxEnabledDescription: 'QuickBooks Desktop unterstützt keine Steuern bei Journalbuchungsexporten. Da Sie Steuern in Ihrem Arbeitsbereich aktiviert haben, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            accounts: (_f = {},
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD] = 'Kreditkarte',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Lieferantenrechnung',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Journalbuchung',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Prüfen',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK, "Description")] = 'Wir werden für jeden Expensify-Bericht eine detaillierte Rechnung erstellen und sie von dem unten stehenden Bankkonto senden.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "Description")] = "Wir ordnen den Händlernamen der Kreditkartentransaktion automatisch den entsprechenden Lieferanten in QuickBooks zu. Wenn keine Lieferanten vorhanden sind, erstellen wir einen Lieferanten 'Kreditkarte Verschiedenes' zur Zuordnung.",
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Description")] = 'Wir werden eine detaillierte Lieferantenrechnung für jeden Expensify-Bericht mit dem Datum der letzten Ausgabe erstellen und sie dem untenstehenden Konto hinzufügen. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. des nächsten offenen Zeitraums.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "AccountDescription")] = 'Wählen Sie, wohin die Kreditkartentransaktionen exportiert werden sollen.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "AccountDescription")] = 'Wählen Sie einen Anbieter, um ihn auf alle Kreditkartentransaktionen anzuwenden.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "AccountDescription")] = 'Wählen Sie aus, von wo aus Schecks gesendet werden sollen.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Error")] = 'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "Error")] = 'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY, "Error")] = 'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                _f),
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Fügen Sie das Konto in QuickBooks Desktop hinzu und synchronisieren Sie die Verbindung erneut.',
            qbdSetup: 'QuickBooks Desktop-Einrichtung',
            requiredSetupDevice: {
                title: 'Kann von diesem Gerät aus keine Verbindung herstellen.',
                body1: 'Sie müssen diese Verbindung von dem Computer aus einrichten, auf dem Ihre QuickBooks Desktop-Unternehmensdatei gehostet wird.',
                body2: 'Sobald Sie verbunden sind, können Sie von überall aus synchronisieren und exportieren.',
            },
            setupPage: {
                title: 'Öffnen Sie diesen Link, um eine Verbindung herzustellen.',
                body: 'Um die Einrichtung abzuschließen, öffnen Sie den folgenden Link auf dem Computer, auf dem QuickBooks Desktop ausgeführt wird.',
                setupErrorTitle: 'Etwas ist schiefgelaufen',
                setupErrorBody1: 'Die QuickBooks Desktop-Verbindung funktioniert momentan nicht. Bitte versuchen Sie es später erneut oder',
                setupErrorBody2: 'wenn das Problem weiterhin besteht.',
                setupErrorBodyContactConcierge: 'Wenden Sie sich an Concierge.',
            },
            importDescription: 'Wählen Sie aus, welche Kodierungskonfigurationen aus QuickBooks Desktop in Expensify importiert werden sollen.',
            classes: 'Klassen',
            items: 'Artikel',
            customers: 'Kunden/Projekte',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Unternehmenskartenkäufe nach QuickBooks Desktop exportiert werden.',
            defaultVendorDescription: 'Legen Sie einen Standardanbieter fest, der bei Export auf alle Kreditkartentransaktionen angewendet wird.',
            accountsDescription: 'Ihr QuickBooks Desktop-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen den Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            classesDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Klassen in Expensify behandelt werden sollen.',
            tagsDisplayedAsDescription: 'Positionsebene',
            reportFieldsDisplayedAsDescription: 'Berichtsebene',
            customersDescription: 'Wählen Sie aus, wie QuickBooks Desktop-Kunden/Projekte in Expensify behandelt werden sollen.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird automatisch jeden Tag mit QuickBooks Desktop synchronisieren.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription: 'Expensify wird automatisch Lieferanten in QuickBooks Desktop erstellen, wenn sie noch nicht existieren.',
            },
            itemsDescription: 'Wählen Sie, wie QuickBooks Desktop-Elemente in Expensify behandelt werden sollen.',
        },
        qbo: {
            connectedTo: 'Verbunden mit',
            importDescription: 'Wählen Sie aus, welche Codierungskonfigurationen aus QuickBooks Online in Expensify importiert werden sollen.',
            classes: 'Klassen',
            locations: 'Standorte',
            customers: 'Kunden/Projekte',
            accountsDescription: 'Ihr QuickBooks Online-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen den Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            classesDescription: 'Wählen Sie, wie QuickBooks Online-Klassen in Expensify behandelt werden sollen.',
            customersDescription: 'Wählen Sie, wie QuickBooks Online-Kunden/Projekte in Expensify behandelt werden sollen.',
            locationsDescription: 'Wählen Sie aus, wie QuickBooks Online-Standorte in Expensify behandelt werden sollen.',
            taxesDescription: 'Wählen Sie, wie QuickBooks Online-Steuern in Expensify behandelt werden sollen.',
            locationsLineItemsRestrictionDescription: 'QuickBooks Online unterstützt keine Standorte auf Zeilenebene für Schecks oder Lieferantenrechnungen. Wenn Sie Standorte auf Zeilenebene haben möchten, stellen Sie sicher, dass Sie Journalbuchungen und Kredit-/Debitkartenausgaben verwenden.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online unterstützt keine Steuern bei Journaleinträgen. Bitte ändern Sie Ihre Exportoption auf Lieferantenrechnung oder Scheck.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach QuickBooks Online exportiert werden.',
            date: 'Exportdatum',
            exportInvoices: 'Rechnungen exportieren nach',
            exportExpensifyCard: 'Expensify Card-Transaktionen exportieren als',
            deepDiveExpensifyCard: 'Expensify-Kartentransaktionen werden automatisch in ein "Expensify Card Liability Account" exportiert, das erstellt wurde mit',
            deepDiveExpensifyCardIntegration: 'unsere Integration.',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten nach QuickBooks Online.',
                values: (_g = {},
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der letzten Ausgabe im Bericht.',
                    },
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach QuickBooks Online exportiert wurde.',
                    },
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: 'Eingereichtes Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                    _g),
            },
            receivable: 'Forderungen aus Lieferungen und Leistungen', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Debitorenbuchhaltungsarchiv', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Verwenden Sie dieses Konto beim Exportieren von Rechnungen zu QuickBooks Online.',
            exportCompanyCardsDescription: 'Legen Sie fest, wie Unternehmenskartenkäufe nach QuickBooks Online exportiert werden.',
            vendor: 'Lieferant',
            defaultVendorDescription: 'Legen Sie einen Standardanbieter fest, der bei Export auf alle Kreditkartentransaktionen angewendet wird.',
            exportOutOfPocketExpensesDescription: 'Legen Sie fest, wie Auslagen in QuickBooks Online exportiert werden.',
            exportCheckDescription: 'Wir werden für jeden Expensify-Bericht eine detaillierte Rechnung erstellen und sie von dem unten stehenden Bankkonto senden.',
            exportJournalEntryDescription: 'Wir werden für jeden Expensify-Bericht einen detaillierten Journaleintrag erstellen und ihn auf das untenstehende Konto buchen.',
            exportVendorBillDescription: 'Wir erstellen eine detaillierte Lieferantenrechnung für jeden Expensify-Bericht und fügen sie dem unten stehenden Konto hinzu. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. des nächsten offenen Zeitraums.',
            account: 'Konto',
            accountDescription: 'Wählen Sie, wo Sie Journaleinträge veröffentlichen möchten.',
            accountsPayable: 'Verbindlichkeiten',
            accountsPayableDescription: 'Wählen Sie aus, wo Lieferantenrechnungen erstellt werden sollen.',
            bankAccount: 'Bankkonto',
            notConfigured: 'Nicht konfiguriert',
            bankAccountDescription: 'Wählen Sie aus, von wo aus Schecks gesendet werden sollen.',
            creditCardAccount: 'Kreditkartenkonto',
            companyCardsLocationEnabledDescription: 'QuickBooks Online unterstützt keine Standorte bei Exporten von Lieferantenrechnungen. Da Sie Standorte in Ihrem Arbeitsbereich aktiviert haben, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledDescription: 'QuickBooks Online unterstützt keine Steuern bei Exporten von Journalbuchungen. Da Sie Steuern in Ihrem Arbeitsbereich aktiviert haben, ist diese Exportoption nicht verfügbar.',
            outOfPocketTaxEnabledError: 'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit QuickBooks Online synchronisieren.',
                inviteEmployees: 'Mitarbeiter einladen',
                inviteEmployeesDescription: 'Importieren Sie QuickBooks Online-Mitarbeiterdatensätze und laden Sie Mitarbeiter in diesen Arbeitsbereich ein.',
                createEntities: 'Entitäten automatisch erstellen',
                createEntitiesDescription: 'Expensify erstellt automatisch Lieferanten in QuickBooks Online, wenn sie noch nicht existieren, und erstellt automatisch Kunden beim Exportieren von Rechnungen.',
                reimbursedReportsDescription: 'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im unten stehenden QuickBooks Online-Konto erstellt.',
                qboBillPaymentAccount: 'QuickBooks-Rechnungszahlungskonto',
                qboInvoiceCollectionAccount: 'QuickBooks Rechnungsinkasso-Konto',
                accountSelectDescription: 'Wählen Sie aus, von wo aus Sie Rechnungen bezahlen möchten, und wir erstellen die Zahlung in QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wählen Sie aus, wo Sie Rechnungszahlungen erhalten möchten, und wir erstellen die Zahlung in QuickBooks Online.',
            },
            accounts: (_h = {},
                _h[CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD] = 'Debitkarte',
                _h[CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD] = 'Kreditkarte',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Lieferantenrechnung',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Journalbuchung',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Prüfen',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD, "Description")] = "Wir ordnen den Händlernamen der Debitkartentransaktion automatisch den entsprechenden Anbietern in QuickBooks zu. Wenn keine Anbieter existieren, erstellen wir einen Anbieter 'Debit Card Misc.' zur Zuordnung.",
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "Description")] = "Wir ordnen den Händlernamen der Kreditkartentransaktion automatisch den entsprechenden Lieferanten in QuickBooks zu. Wenn keine Lieferanten vorhanden sind, erstellen wir einen Lieferanten 'Kreditkarte Verschiedenes' zur Zuordnung.",
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Description")] = 'Wir werden eine detaillierte Lieferantenrechnung für jeden Expensify-Bericht mit dem Datum der letzten Ausgabe erstellen und sie dem untenstehenden Konto hinzufügen. Wenn dieser Zeitraum geschlossen ist, buchen wir zum 1. des nächsten offenen Zeitraums.',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD, "AccountDescription")] = 'Wählen Sie, wohin die Debitkartentransaktionen exportiert werden sollen.',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "AccountDescription")] = 'Wählen Sie, wohin die Kreditkartentransaktionen exportiert werden sollen.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "AccountDescription")] = 'Wählen Sie einen Anbieter, um ihn auf alle Kreditkartentransaktionen anzuwenden.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Error")] = 'Lieferantenrechnungen sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "Error")] = 'Schecks sind nicht verfügbar, wenn Standorte aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY, "Error")] = 'Journalbuchungen sind nicht verfügbar, wenn Steuern aktiviert sind. Bitte wählen Sie eine andere Exportoption.',
                _h),
            exportDestinationAccountsMisconfigurationError: (_j = {},
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Wählen Sie ein gültiges Konto für den Export der Lieferantenrechnung aus',
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Wählen Sie ein gültiges Konto für den Export des Journaleintrags aus',
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Wählen Sie ein gültiges Konto für den Scheckexport aus',
                _j),
            exportDestinationSetupAccountsInfo: (_k = {},
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Um die Lieferantenrechnungs-Exportfunktion zu nutzen, richten Sie ein Kreditorenkonto in QuickBooks Online ein.',
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Um den Export von Journaleinträgen zu verwenden, richten Sie ein Journal-Konto in QuickBooks Online ein.',
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Um den Scheckexport zu verwenden, richten Sie ein Bankkonto in QuickBooks Online ein.',
                _k),
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Fügen Sie das Konto in QuickBooks Online hinzu und synchronisieren Sie die Verbindung erneut.',
            accountingMethods: {
                label: 'Wann exportieren',
                description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                values: (_l = {},
                    _l[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Accrual',
                    _l[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Bargeld',
                    _l),
                alternateText: (_m = {},
                    _m[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Auslagen werden exportiert, wenn sie endgültig genehmigt sind.',
                    _m[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Auslagen werden exportiert, wenn sie bezahlt sind.',
                    _m),
            },
        },
        workspaceList: {
            joinNow: 'Jetzt beitreten',
            askToJoin: 'Beitreten anfragen',
        },
        xero: {
            organization: 'Xero-Organisation',
            organizationDescription: 'Wählen Sie die Xero-Organisation aus, aus der Sie Daten importieren möchten.',
            importDescription: 'Wählen Sie aus, welche Kodierungskonfigurationen von Xero nach Expensify importiert werden sollen.',
            accountsDescription: 'Ihr Xero-Kontenplan wird in Expensify als Kategorien importiert.',
            accountsSwitchTitle: 'Wählen Sie, ob neue Konten als aktivierte oder deaktivierte Kategorien importiert werden sollen.',
            accountsSwitchDescription: 'Aktivierte Kategorien stehen den Mitgliedern zur Auswahl, wenn sie ihre Ausgaben erstellen.',
            trackingCategories: 'Verfolgungskategorien',
            trackingCategoriesDescription: 'Wählen Sie, wie Xero-Tracking-Kategorien in Expensify behandelt werden sollen.',
            mapTrackingCategoryTo: function (_a) {
                var categoryName = _a.categoryName;
                return "Xero ".concat(categoryName, " zuordnen zu");
            },
            mapTrackingCategoryToDescription: function (_a) {
                var categoryName = _a.categoryName;
                return "W\u00E4hlen Sie, wo ".concat(categoryName, " beim Export nach Xero zugeordnet werden soll.");
            },
            customers: 'Kunden erneut in Rechnung stellen',
            customersDescription: 'Wählen Sie, ob Sie Kunden in Expensify erneut in Rechnung stellen möchten. Ihre Xero-Kundenkontakte können Ausgaben zugeordnet werden und werden als Verkaufsrechnung nach Xero exportiert.',
            taxesDescription: 'Wählen Sie, wie Xero-Steuern in Expensify behandelt werden sollen.',
            notImported: 'Nicht importiert',
            notConfigured: 'Nicht konfiguriert',
            trackingCategoriesOptions: (_o = {},
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT] = 'Xero-Kontaktstandard',
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG] = 'Tags',
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD] = 'Berichtsfelder',
                _o),
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach Xero exportiert werden.',
            purchaseBill: 'Kaufrechnung',
            exportDeepDiveCompanyCard: 'Exportierte Ausgaben werden als Banktransaktionen auf das unten stehende Xero-Bankkonto gebucht, und die Transaktionsdaten werden mit den Daten auf Ihrem Kontoauszug übereinstimmen.',
            bankTransactions: 'Banktransaktionen',
            xeroBankAccount: 'Xero-Bankkonto',
            xeroBankAccountDescription: 'Wählen Sie, wo Ausgaben als Banktransaktionen gebucht werden sollen.',
            exportExpensesDescription: 'Berichte werden als Einkaufsrechnung mit dem unten ausgewählten Datum und Status exportiert.',
            purchaseBillDate: 'Rechnungsdatum des Kaufs',
            exportInvoices: 'Rechnungen exportieren als',
            salesInvoice: 'Verkaufsrechnung',
            exportInvoicesDescription: 'Verkaufsrechnungen zeigen immer das Datum an, an dem die Rechnung gesendet wurde.',
            advancedConfig: {
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit Xero synchronisieren.',
                purchaseBillStatusTitle: 'Kaufrechnungsstatus',
                reimbursedReportsDescription: 'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im unten stehenden Xero-Konto erstellt.',
                xeroBillPaymentAccount: 'Xero-Rechnungszahlungskonto',
                xeroInvoiceCollectionAccount: 'Xero-Rechnungsinkassokonto',
                xeroBillPaymentAccountDescription: 'Wählen Sie aus, von wo aus Sie Rechnungen bezahlen möchten, und wir erstellen die Zahlung in Xero.',
                invoiceAccountSelectorDescription: 'Wählen Sie aus, wo Sie Rechnungszahlungen erhalten möchten, und wir erstellen die Zahlung in Xero.',
            },
            exportDate: {
                label: 'Rechnungsdatum des Kaufs',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten nach Xero.',
                values: (_p = {},
                    _p[CONST_1.default.XERO_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der letzten Ausgabe im Bericht.',
                    },
                    _p[CONST_1.default.XERO_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach Xero exportiert wurde.',
                    },
                    _p[CONST_1.default.XERO_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: 'Eingereichtes Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                    _p),
            },
            invoiceStatus: {
                label: 'Kaufrechnungsstatus',
                description: 'Verwenden Sie diesen Status beim Exportieren von Einkaufsrechnungen nach Xero.',
                values: (_q = {},
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.DRAFT] = 'Entwurf',
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL] = 'Warten auf Genehmigung',
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT] = 'Zahlung ausstehend',
                    _q),
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Bitte fügen Sie das Konto in Xero hinzu und synchronisieren Sie die Verbindung erneut.',
        },
        sageIntacct: {
            preferredExporter: 'Bevorzugter Exporteur',
            taxSolution: 'Steuerlösung',
            notConfigured: 'Nicht konfiguriert',
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten nach Sage Intacct.',
                values: (_r = {},
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der letzten Ausgabe im Bericht.',
                    },
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.EXPORTED] = {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach Sage Intacct exportiert wurde.',
                    },
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.SUBMITTED] = {
                        label: 'Eingereichtes Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                    _r),
            },
            reimbursableExpenses: {
                description: 'Legen Sie fest, wie Auslagen in Sage Intacct exportiert werden.',
                values: (_s = {},
                    _s[CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT] = 'Spesenabrechnungen',
                    _s[CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL] = 'Lieferantenrechnungen',
                    _s),
            },
            nonReimbursableExpenses: {
                description: 'Legen Sie fest, wie Unternehmenskartenkäufe nach Sage Intacct exportiert werden.',
                values: (_t = {},
                    _t[CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE] = 'Kreditkarten',
                    _t[CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL] = 'Lieferantenrechnungen',
                    _t),
            },
            creditCardAccount: 'Kreditkartenkonto',
            defaultVendor: 'Standardanbieter',
            defaultVendorDescription: function (_a) {
                var isReimbursable = _a.isReimbursable;
                return "Legen Sie einen Standardanbieter fest, der auf ".concat(isReimbursable ? '' : 'non-', " erstattungsf\u00E4hige Ausgaben angewendet wird, die keinen passenden Anbieter in Sage Intacct haben.");
            },
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach Sage Intacct exportiert werden.',
            exportPreferredExporterNote: 'Der bevorzugte Exporteur kann jeder Workspace-Admin sein, muss jedoch auch ein Domain-Admin sein, wenn Sie in den Domaineinstellungen unterschiedliche Exportkonten für einzelne Firmenkarten festlegen.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur Berichte zur Exportierung in seinem Konto.',
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: "Bitte f\u00FCgen Sie das Konto in Sage Intacct hinzu und synchronisieren Sie die Verbindung erneut.",
            autoSync: 'Auto-Synchronisierung',
            autoSyncDescription: 'Expensify wird automatisch jeden Tag mit Sage Intacct synchronisieren.',
            inviteEmployees: 'Mitarbeiter einladen',
            inviteEmployeesDescription: 'Importieren Sie Sage Intacct-Mitarbeiterdatensätze und laden Sie Mitarbeiter in diesen Arbeitsbereich ein. Ihr Genehmigungsworkflow wird standardmäßig auf Managergenehmigung gesetzt und kann auf der Mitgliederseite weiter konfiguriert werden.',
            syncReimbursedReports: 'Synchronisiere erstattete Berichte',
            syncReimbursedReportsDescription: 'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im unten stehenden Sage Intacct-Konto erstellt.',
            paymentAccount: 'Sage Intacct Zahlungskonto',
        },
        netsuite: {
            subsidiary: 'Tochtergesellschaft',
            subsidiarySelectDescription: 'Wählen Sie die Tochtergesellschaft in NetSuite aus, aus der Sie Daten importieren möchten.',
            exportDescription: 'Konfigurieren Sie, wie Expensify-Daten nach NetSuite exportiert werden.',
            exportInvoices: 'Rechnungen exportieren nach',
            journalEntriesTaxPostingAccount: 'Steuerbuchungskonto für Buchungseinträge',
            journalEntriesProvTaxPostingAccount: 'Journalbuchungen Provinzsteuerbuchungskonto',
            foreignCurrencyAmount: 'Fremdwährungsbetrag exportieren',
            exportToNextOpenPeriod: 'In die nächste offene Periode exportieren',
            nonReimbursableJournalPostingAccount: 'Nicht erstattungsfähiges Journalbuchungskonto',
            reimbursableJournalPostingAccount: 'Erstattungsfähiges Journalbuchungskonto',
            journalPostingPreference: {
                label: 'Buchungseinstellungen für Journalbuchungen',
                values: (_u = {},
                    _u[CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE] = 'Einzelner, aufgeschlüsselter Eintrag für jeden Bericht',
                    _u[CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE] = 'Einzelner Eintrag für jede Ausgabe',
                    _u),
            },
            invoiceItem: {
                label: 'Rechnungsposition',
                values: (_v = {},
                    _v[CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE] = {
                        label: 'Erstelle eins für mich.',
                        description: 'Wir erstellen für Sie einen "Expensify-Rechnungsposition" beim Export (falls noch keiner existiert).',
                    },
                    _v[CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT] = {
                        label: 'Vorhandenes auswählen',
                        description: 'Wir werden Rechnungen von Expensify mit dem unten ausgewählten Element verknüpfen.',
                    },
                    _v),
            },
            exportDate: {
                label: 'Exportdatum',
                description: 'Verwenden Sie dieses Datum beim Exportieren von Berichten nach NetSuite.',
                values: (_w = {},
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Datum der letzten Ausgabe',
                        description: 'Datum der letzten Ausgabe im Bericht.',
                    },
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.EXPORTED] = {
                        label: 'Exportdatum',
                        description: 'Datum, an dem der Bericht nach NetSuite exportiert wurde.',
                    },
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.SUBMITTED] = {
                        label: 'Eingereichtes Datum',
                        description: 'Datum, an dem der Bericht zur Genehmigung eingereicht wurde.',
                    },
                    _w),
            },
            exportDestination: {
                values: (_x = {},
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT] = {
                        label: 'Spesenabrechnungen',
                        reimbursableDescription: 'Aus der eigenen Tasche bezahlte Ausgaben werden als Spesenabrechnungen nach NetSuite exportiert.',
                        nonReimbursableDescription: 'Unternehmensausgaben werden als Spesenabrechnungen nach NetSuite exportiert.',
                    },
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL] = {
                        label: 'Lieferantenrechnungen',
                        reimbursableDescription: 'Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                        nonReimbursableDescription: 'Company card expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                    },
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY] = {
                        label: 'Journalbuchungen',
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
                autoSyncDescription: 'Expensify wird jeden Tag automatisch mit NetSuite synchronisiert.',
                reimbursedReportsDescription: 'Jedes Mal, wenn ein Bericht über Expensify ACH bezahlt wird, wird die entsprechende Rechnungszahlung im untenstehenden NetSuite-Konto erstellt.',
                reimbursementsAccount: 'Erstattungskonto',
                reimbursementsAccountDescription: 'Wählen Sie das Bankkonto aus, das Sie für Rückerstattungen verwenden möchten, und wir erstellen die zugehörige Zahlung in NetSuite.',
                collectionsAccount: 'Sammlungskonto',
                collectionsAccountDescription: 'Sobald eine Rechnung in Expensify als bezahlt markiert und nach NetSuite exportiert wird, erscheint sie auf dem unten stehenden Konto.',
                approvalAccount: 'A/P Genehmigungskonto',
                approvalAccountDescription: 'Wählen Sie das Konto, gegen das Transaktionen in NetSuite genehmigt werden. Wenn Sie erstattete Berichte synchronisieren, ist dies auch das Konto, gegen das Zahlungsanweisungen erstellt werden.',
                defaultApprovalAccount: 'NetSuite-Standardwert',
                inviteEmployees: 'Mitarbeiter einladen und Genehmigungen festlegen',
                inviteEmployeesDescription: 'Importieren Sie NetSuite-Mitarbeiterdatensätze und laden Sie Mitarbeiter in diesen Arbeitsbereich ein. Ihr Genehmigungsworkflow wird standardmäßig auf die Genehmigung durch den Manager eingestellt und kann auf der Seite *Mitglieder* weiter konfiguriert werden.',
                autoCreateEntities: 'Mitarbeiter/Lieferanten automatisch erstellen',
                enableCategories: 'Neu importierte Kategorien aktivieren',
                customFormID: 'Benutzerdefinierte Formular-ID',
                customFormIDDescription: 'Standardmäßig erstellt Expensify Einträge mit dem bevorzugten Transaktionsformular, das in NetSuite festgelegt ist. Alternativ können Sie ein bestimmtes Transaktionsformular festlegen, das verwendet werden soll.',
                customFormIDReimbursable: 'Auslage',
                customFormIDNonReimbursable: 'Unternehmenskarte Ausgabe',
                exportReportsTo: {
                    label: 'Genehmigungsebene für Spesenabrechnungen',
                    description: 'Sobald ein Spesenbericht in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite eine zusätzliche Genehmigungsebene festlegen, bevor er gebucht wird.',
                    values: (_y = {},
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE] = 'NetSuite-Standardpräferenz',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED] = 'Nur vom Vorgesetzten genehmigt',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED] = 'Nur Buchhaltung genehmigt',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH] = 'Vorgesetzter und Buchhaltung genehmigt',
                        _y),
                },
                accountingMethods: {
                    label: 'Wann exportieren',
                    description: 'Wählen Sie, wann die Ausgaben exportiert werden sollen:',
                    values: (_z = {},
                        _z[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Accrual',
                        _z[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Bargeld',
                        _z),
                    alternateText: (_0 = {},
                        _0[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Auslagen werden exportiert, wenn sie endgültig genehmigt sind.',
                        _0[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Auslagen werden exportiert, wenn sie bezahlt sind.',
                        _0),
                },
                exportVendorBillsTo: {
                    label: 'Genehmigungsstufe für Lieferantenrechnungen',
                    description: 'Sobald eine Lieferantenrechnung in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite eine zusätzliche Genehmigungsebene vor dem Buchen festlegen.',
                    values: (_1 = {},
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE] = 'NetSuite-Standardpräferenz',
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING] = 'Ausstehende Genehmigung',
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED] = 'Zur Veröffentlichung freigegeben',
                        _1),
                },
                exportJournalsTo: {
                    label: 'Genehmigungsebene für Journaleinträge',
                    description: 'Sobald ein Journaleintrag in Expensify genehmigt und nach NetSuite exportiert wurde, können Sie in NetSuite eine zusätzliche Genehmigungsebene festlegen, bevor er gebucht wird.',
                    values: (_2 = {},
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE] = 'NetSuite-Standardpräferenz',
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING] = 'Ausstehende Genehmigung',
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED] = 'Zur Veröffentlichung freigegeben',
                        _2),
                },
                error: {
                    customFormID: 'Bitte geben Sie eine gültige numerische benutzerdefinierte Formular-ID ein.',
                },
            },
            noAccountsFound: 'Keine Konten gefunden',
            noAccountsFoundDescription: 'Bitte fügen Sie das Konto in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noVendorsFound: 'Keine Anbieter gefunden',
            noVendorsFoundDescription: 'Bitte fügen Sie Lieferanten in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noItemsFound: 'Keine Rechnungspositionen gefunden',
            noItemsFoundDescription: 'Bitte fügen Sie Rechnungspositionen in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            noSubsidiariesFound: 'Keine Tochtergesellschaften gefunden',
            noSubsidiariesFoundDescription: 'Bitte fügen Sie eine Tochtergesellschaft in NetSuite hinzu und synchronisieren Sie die Verbindung erneut.',
            tokenInput: {
                title: 'NetSuite-Einrichtung',
                formSteps: {
                    installBundle: {
                        title: 'Installieren Sie das Expensify-Paket',
                        description: 'In NetSuite, gehe zu *Customization > SuiteBundler > Search & Install Bundles* > suche nach "Expensify" > installiere das Bundle.',
                    },
                    enableTokenAuthentication: {
                        title: 'Tokenbasierte Authentifizierung aktivieren',
                        description: 'In NetSuite, gehe zu *Setup > Company > Enable Features > SuiteCloud* > aktiviere *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'SOAP-Webdienste aktivieren',
                        description: 'In NetSuite, go to *Setup > Company > Enable Features > SuiteCloud* > enable *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Erstellen Sie ein Zugriffstoken',
                        description: 'In NetSuite, gehen Sie zu *Setup > Users/Roles > Access Tokens* > erstellen Sie ein Zugriffstoken für die "Expensify"-App und entweder die Rolle "Expensify Integration" oder "Administrator".\n\n*Wichtig:* Stellen Sie sicher, dass Sie die *Token-ID* und das *Token Secret* aus diesem Schritt speichern. Sie benötigen es für den nächsten Schritt.',
                    },
                    enterCredentials: {
                        title: 'Geben Sie Ihre NetSuite-Anmeldedaten ein',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: 'Token-ID',
                            netSuiteTokenSecret: 'Token Secret',
                        },
                        netSuiteAccountIDDescription: 'In NetSuite, gehen Sie zu *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Ausgabenkategorien',
                expenseCategoriesDescription: 'Ihre NetSuite-Ausgabenkategorien werden in Expensify als Kategorien importiert.',
                crossSubsidiaryCustomers: 'Kunden/Projekte über Tochtergesellschaften hinweg',
                importFields: {
                    departments: {
                        title: 'Abteilungen',
                        subtitle: 'Wählen Sie, wie die NetSuite-*Abteilungen* in Expensify behandelt werden sollen.',
                    },
                    classes: {
                        title: 'Klassen',
                        subtitle: 'Wählen Sie, wie *Klassen* in Expensify behandelt werden sollen.',
                    },
                    locations: {
                        title: 'Standorte',
                        subtitle: 'Wählen Sie, wie *Standorte* in Expensify behandelt werden sollen.',
                    },
                },
                customersOrJobs: {
                    title: 'Kunden/Projekte',
                    subtitle: 'Wählen Sie aus, wie NetSuite-*Kunden* und *Projekte* in Expensify behandelt werden sollen.',
                    importCustomers: 'Kunden importieren',
                    importJobs: 'Projekte importieren',
                    customers: 'Kunden',
                    jobs: 'Projekte',
                    label: function (_a) {
                        var importFields = _a.importFields, importType = _a.importType;
                        return "".concat(importFields.join('und'), ", ").concat(importType);
                    },
                },
                importTaxDescription: 'Steuergruppen aus NetSuite importieren.',
                importCustomFields: {
                    chooseOptionBelow: 'Wählen Sie eine der folgenden Optionen:',
                    label: function (_a) {
                        var importedTypes = _a.importedTypes;
                        return "Imported as ".concat(importedTypes.join('und'));
                    },
                    requiredFieldError: function (_a) {
                        var fieldName = _a.fieldName;
                        return "Bitte geben Sie das ".concat(fieldName, " ein.");
                    },
                    customSegments: {
                        title: 'Benutzerdefinierte Segmente/Datensätze',
                        addText: 'Benutzerdefiniertes Segment/Datensatz hinzufügen',
                        recordTitle: 'Benutzerdefinierte Segment/Aufzeichnung',
                        helpLink: CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Detaillierte Anweisungen anzeigen',
                        helpText: 'zur Konfiguration von benutzerdefinierten Segmenten/Datensätzen.',
                        emptyTitle: 'Fügen Sie ein benutzerdefiniertes Segment oder einen benutzerdefinierten Datensatz hinzu',
                        fields: {
                            segmentName: 'Name',
                            internalID: 'Interne ID',
                            scriptID: 'Script-ID',
                            customRecordScriptID: 'Transaktionsspalten-ID',
                            mapping: 'Angezeigt als',
                        },
                        removeTitle: 'Benutzerdefiniertes Segment/Datensatz entfernen',
                        removePrompt: 'Möchten Sie diesen benutzerdefinierten Abschnitt/Datensatz wirklich entfernen?',
                        addForm: {
                            customSegmentName: 'benutzerdefinierter Segmentname',
                            customRecordName: 'benutzerdefinierter Datensatzname',
                            segmentTitle: 'Benutzerdefiniertes Segment',
                            customSegmentAddTitle: 'Benutzerdefiniertes Segment hinzufügen',
                            customRecordAddTitle: 'Benutzerdefinierten Datensatz hinzufügen',
                            recordTitle: 'Benutzerdefinierter Datensatz',
                            segmentRecordType: 'Möchten Sie ein benutzerdefiniertes Segment oder einen benutzerdefinierten Datensatz hinzufügen?',
                            customSegmentNameTitle: 'Wie lautet der Name des benutzerdefinierten Segments?',
                            customRecordNameTitle: 'Wie lautet der benutzerdefinierte Datensatzname?',
                            customSegmentNameFooter: "Sie finden benutzerdefinierte Segmentnamen in NetSuite unter *Customizations > Links, Records & Fields > Custom Segments* Seite.\n\n_F\u00FCr detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customRecordNameFooter: "Sie k\u00F6nnen benutzerdefinierte Datensatznamen in NetSuite finden, indem Sie \"Transaction Column Field\" in die globale Suche eingeben.\n\n_F\u00FCr detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customSegmentInternalIDTitle: 'Wie lautet die interne ID?',
                            customSegmentInternalIDFooter: "Zuerst stellen Sie sicher, dass Sie interne IDs in NetSuite unter *Home > Set Preferences > Show Internal ID* aktiviert haben.\n\nSie k\u00F6nnen die internen IDs von benutzerdefinierten Segmenten in NetSuite unter folgendem Pfad finden:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Klicken Sie auf ein benutzerdefiniertes Segment.\n3. Klicken Sie auf den Hyperlink neben *Custom Record Type*.\n4. Finden Sie die interne ID in der Tabelle am unteren Rand.\n\n_F\u00FCr detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")_."),
                            customRecordInternalIDFooter: "Sie k\u00F6nnen benutzerdefinierte Datensatz-IDs in NetSuite finden, indem Sie die folgenden Schritte ausf\u00FChren:\n\n1. Geben Sie \"Transaction Line Fields\" in die globale Suche ein.\n2. Klicken Sie auf einen benutzerdefinierten Datensatz.\n3. Finden Sie die interne ID auf der linken Seite.\n\n_F\u00FCr detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customSegmentScriptIDTitle: 'Was ist die Skript-ID?',
                            customSegmentScriptIDFooter: "Sie k\u00F6nnen benutzerdefinierte Segment-Skript-IDs in NetSuite unter folgendem Pfad finden:\n\n1. *Anpassung > Listen, Datens\u00E4tze und Felder > Benutzerdefinierte Segmente*.\n2. Klicken Sie auf ein benutzerdefiniertes Segment.\n3. Klicken Sie auf die Registerkarte *Anwendung und Beschaffung* unten, dann:\n    a. Wenn Sie das benutzerdefinierte Segment als *Tag* (auf der Positionsebene) in Expensify anzeigen m\u00F6chten, klicken Sie auf die Unterregisterkarte *Transaktionsspalten* und verwenden Sie die *Feld-ID*.\n    b. Wenn Sie das benutzerdefinierte Segment als *Berichtsfeld* (auf der Berichtebene) in Expensify anzeigen m\u00F6chten, klicken Sie auf die Unterregisterkarte *Transaktionen* und verwenden Sie die *Feld-ID*.\n\n_F\u00FCr detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")_."),
                            customRecordScriptIDTitle: 'Was ist die Transaktionsspalten-ID?',
                            customRecordScriptIDFooter: "Sie k\u00F6nnen benutzerdefinierte Skript-IDs in NetSuite unter folgendem finden:\n\n1. Geben Sie \"Transaction Line Fields\" in die globale Suche ein.\n2. Klicken Sie auf einen benutzerdefinierten Datensatz.\n3. Finden Sie die Skript-ID auf der linken Seite.\n\n_F\u00FCr detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customSegmentMappingTitle: 'Wie sollte dieses benutzerdefinierte Segment in Expensify angezeigt werden?',
                            customRecordMappingTitle: 'Wie soll dieser benutzerdefinierte Datensatz in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueFieldError: function (_a) {
                                var fieldName = _a.fieldName;
                                return "Ein benutzerdefiniertes Segment/Datensatz mit dieser ".concat(fieldName === null || fieldName === void 0 ? void 0 : fieldName.toLowerCase(), " existiert bereits.");
                            },
                        },
                    },
                    customLists: {
                        title: 'Benutzerdefinierte Listen',
                        addText: 'Benutzerdefinierte Liste hinzufügen',
                        recordTitle: 'Benutzerdefinierte Liste',
                        helpLink: CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Detaillierte Anweisungen anzeigen',
                        helpText: 'zur Konfiguration benutzerdefinierter Listen.',
                        emptyTitle: 'Eine benutzerdefinierte Liste hinzufügen',
                        fields: {
                            listName: 'Name',
                            internalID: 'Interne ID',
                            transactionFieldID: 'Transaktionsfeld-ID',
                            mapping: 'Angezeigt als',
                        },
                        removeTitle: 'Benutzerdefinierte Liste entfernen',
                        removePrompt: 'Möchten Sie diese benutzerdefinierte Liste wirklich entfernen?',
                        addForm: {
                            listNameTitle: 'Wählen Sie eine benutzerdefinierte Liste aus',
                            transactionFieldIDTitle: 'Was ist die Transaktionsfeld-ID?',
                            transactionFieldIDFooter: "Sie k\u00F6nnen Transaktionsfeld-IDs in NetSuite finden, indem Sie folgende Schritte ausf\u00FChren:\n\n1. Geben Sie \"Transaction Line Fields\" in die globale Suche ein.\n2. Klicken Sie auf eine benutzerdefinierte Liste.\n3. Finden Sie die Transaktionsfeld-ID auf der linken Seite.\n\n_F\u00FCr detailliertere Anweisungen, [besuchen Sie unsere Hilfeseite](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")_."),
                            mappingTitle: 'Wie sollte diese benutzerdefinierte Liste in Expensify angezeigt werden?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: "Eine benutzerdefinierte Liste mit dieser Transaktionsfeld-ID existiert bereits.",
                        },
                    },
                },
                importTypes: (_3 = {},
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT] = {
                        label: 'NetSuite-Mitarbeiterstandard',
                        description: 'Nicht in Expensify importiert, bei Export angewendet',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "Wenn Sie ".concat(importField, " in NetSuite verwenden, wenden wir den Standardwert an, der beim Export auf dem Mitarbeiterdatensatz im Spesenbericht oder Journalbuchung festgelegt ist.");
                        },
                    },
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG] = {
                        label: 'Tags',
                        description: 'Positionsebene',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "".concat((0, startCase_1.default)(importField), " wird f\u00FCr jede einzelne Ausgabe in einem Mitarbeiterbericht ausw\u00E4hlbar sein.");
                        },
                    },
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD] = {
                        label: 'Berichtsfelder',
                        description: 'Berichtsebene',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "".concat((0, startCase_1.default)(importField), " Auswahl wird auf alle Ausgaben im Bericht eines Mitarbeiters angewendet.");
                        },
                    },
                    _3),
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct Einrichtung',
            prerequisitesTitle: 'Bevor Sie sich verbinden...',
            downloadExpensifyPackage: 'Laden Sie das Expensify-Paket für Sage Intacct herunter',
            followSteps: 'Befolgen Sie die Schritte in unserer Anleitung: Verbinden mit Sage Intacct.',
            enterCredentials: 'Geben Sie Ihre Sage Intacct-Anmeldedaten ein',
            entity: 'Entity',
            employeeDefault: 'Sage Intacct Mitarbeiterstandard',
            employeeDefaultDescription: 'Die Standardabteilung des Mitarbeiters wird auf seine Ausgaben in Sage Intacct angewendet, falls eine vorhanden ist.',
            displayedAsTagDescription: 'Die Abteilung wird für jede einzelne Ausgabe in einem Bericht eines Mitarbeiters auswählbar sein.',
            displayedAsReportFieldDescription: 'Die Abteilungsauswahl gilt für alle Ausgaben im Bericht eines Mitarbeiters.',
            toggleImportTitleFirstPart: 'Wählen Sie, wie Sage Intacct behandelt werden soll',
            toggleImportTitleSecondPart: 'in Expensify.',
            expenseTypes: 'Ausgabenarten',
            expenseTypesDescription: 'Ihre Sage Intacct-Ausgabenarten werden in Expensify als Kategorien importiert.',
            accountTypesDescription: 'Ihr Sage Intacct-Kontenplan wird in Expensify als Kategorien importiert.',
            importTaxDescription: 'Kaufsteuersatz aus Sage Intacct importieren.',
            userDefinedDimensions: 'Benutzerdefinierte Dimensionen',
            addUserDefinedDimension: 'Benutzerdefinierte Dimension hinzufügen',
            integrationName: 'Integrationsname',
            dimensionExists: 'Eine Dimension mit diesem Namen existiert bereits.',
            removeDimension: 'Benutzerdefinierte Dimension entfernen',
            removeDimensionPrompt: 'Möchten Sie diese benutzerdefinierte Dimension wirklich entfernen?',
            userDefinedDimension: 'Benutzerdefinierte Dimension',
            addAUserDefinedDimension: 'Benutzerdefinierte Dimension hinzufügen',
            detailedInstructionsLink: 'Detaillierte Anweisungen anzeigen',
            detailedInstructionsRestOfSentence: 'beim Hinzufügen benutzerdefinierter Dimensionen.',
            userDimensionsAdded: function () { return ({
                one: '1 UDD hinzugefügt',
                other: function (count) { return "".concat(count, " UDDs hinzugef\u00FCgt"); },
            }); },
            mappingTitle: function (_a) {
                var mappingName = _a.mappingName;
                switch (mappingName) {
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'Abteilungen';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'Klassen';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'Standorte';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'Kunden';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'Projekte (Jobs)';
                    default:
                        return 'mappings';
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
                other: 'Andere',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Mastercard Commercial Cards',
                    vcf: 'Visa Commercial Cards',
                    stripe: 'Stripe-Karten',
                },
                yourCardProvider: "Wer ist Ihr Kartenanbieter?",
                whoIsYourBankAccount: 'Wer ist Ihre Bank?',
                whereIsYourBankLocated: 'Wo befindet sich Ihre Bank?',
                howDoYouWantToConnect: 'Wie möchten Sie sich mit Ihrer Bank verbinden?',
                learnMoreAboutOptions: {
                    text: 'Erfahren Sie mehr darüber',
                    linkText: 'Optionen.',
                },
                commercialFeedDetails: 'Erfordert die Einrichtung mit Ihrer Bank. Dies wird typischerweise von größeren Unternehmen verwendet und ist oft die beste Option, wenn Sie qualifiziert sind.',
                commercialFeedPlaidDetails: "Erfordert die Einrichtung mit Ihrer Bank, aber wir werden Sie anleiten. Dies ist normalerweise auf gr\u00F6\u00DFere Unternehmen beschr\u00E4nkt.",
                directFeedDetails: 'Der einfachste Ansatz. Verbinden Sie sich sofort mit Ihren Master-Anmeldedaten. Diese Methode ist am häufigsten.',
                enableFeed: {
                    title: function (_a) {
                        var provider = _a.provider;
                        return "Aktivieren Sie Ihren ".concat(provider, "-Feed");
                    },
                    heading: 'Wir haben eine direkte Integration mit Ihrem Kartenaussteller und können Ihre Transaktionsdaten schnell und genau in Expensify importieren.\n\nUm loszulegen, einfach:',
                    visa: 'Wir haben globale Integrationen mit Visa, obwohl die Berechtigung je nach Bank und Kartenprogramm variiert.\n\nUm loszulegen, einfach:',
                    mastercard: 'Wir haben globale Integrationen mit Mastercard, obwohl die Berechtigung je nach Bank und Kartenprogramm variiert.\n\nUm loszulegen, einfach:',
                    vcf: "1. Besuchen Sie [diesen Hilfeartikel](".concat(CONST_1.default.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP, ") f\u00FCr detaillierte Anweisungen zur Einrichtung Ihrer Visa Commercial Cards.\n\n2. [Kontaktieren Sie Ihre Bank](").concat(CONST_1.default.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP, "), um zu \u00FCberpr\u00FCfen, ob sie einen kommerziellen Feed f\u00FCr Ihr Programm unterst\u00FCtzt, und bitten Sie sie, diesen zu aktivieren.\n\n3. *Sobald der Feed aktiviert ist und Sie dessen Details haben, fahren Sie mit dem n\u00E4chsten Bildschirm fort.*"),
                    gl1025: "1. Besuchen Sie [diesen Hilfeartikel](".concat(CONST_1.default.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP, "), um herauszufinden, ob American Express einen kommerziellen Feed f\u00FCr Ihr Programm aktivieren kann.\n\n2. Sobald der Feed aktiviert ist, wird Amex Ihnen ein Produktionsschreiben senden.\n\n3. *Sobald Sie die Feed-Informationen haben, fahren Sie mit dem n\u00E4chsten Bildschirm fort.*"),
                    cdf: "1. Besuchen Sie [diesen Hilfeartikel](".concat(CONST_1.default.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS, ") f\u00FCr detaillierte Anweisungen zur Einrichtung Ihrer Mastercard Commercial Cards.\n\n2. [Kontaktieren Sie Ihre Bank](").concat(CONST_1.default.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS, "), um zu \u00FCberpr\u00FCfen, ob sie einen kommerziellen Feed f\u00FCr Ihr Programm unterst\u00FCtzt, und bitten Sie sie, diesen zu aktivieren.\n\n3. *Sobald der Feed aktiviert ist und Sie die Details haben, fahren Sie mit dem n\u00E4chsten Bildschirm fort.*"),
                    stripe: "1. Besuchen Sie das Stripe-Dashboard und gehen Sie zu [Einstellungen](".concat(CONST_1.default.COMPANY_CARDS_STRIPE_HELP, ").\n\n2. Klicken Sie unter Produktintegrationen auf Aktivieren neben Expensify.\n\n3. Sobald der Feed aktiviert ist, klicken Sie unten auf Senden und wir werden daran arbeiten, ihn hinzuzuf\u00FCgen."),
                },
                whatBankIssuesCard: 'Welche Bank gibt diese Karten aus?',
                enterNameOfBank: 'Geben Sie den Namen der Bank ein',
                feedDetails: {
                    vcf: {
                        title: 'Was sind die Visa-Feed-Details?',
                        processorLabel: 'Prozessor-ID',
                        bankLabel: 'Finanzinstitutions-ID (Bank)',
                        companyLabel: 'Unternehmens-ID',
                        helpLabel: 'Wo finde ich diese IDs?',
                    },
                    gl1025: {
                        title: "Wie lautet der Amex-Lieferdateiname?",
                        fileNameLabel: 'Dateiname der Lieferung',
                        helpLabel: 'Wo finde ich den Lieferdateinamen?',
                    },
                    cdf: {
                        title: "Wie lautet die Mastercard-Verteilungs-ID?",
                        distributionLabel: 'Verteilungs-ID',
                        helpLabel: 'Wo finde ich die Distributions-ID?',
                    },
                },
                amexCorporate: 'Wählen Sie dies aus, wenn auf der Vorderseite Ihrer Karten „Corporate“ steht.',
                amexBusiness: 'Wählen Sie dies aus, wenn auf der Vorderseite Ihrer Karten "Business" steht.',
                amexPersonal: 'Wählen Sie dies aus, wenn Ihre Karten privat sind.',
                error: {
                    pleaseSelectProvider: 'Bitte wählen Sie einen Kartenanbieter, bevor Sie fortfahren.',
                    pleaseSelectBankAccount: 'Bitte wählen Sie ein Bankkonto aus, bevor Sie fortfahren.',
                    pleaseSelectBank: 'Bitte wählen Sie eine Bank aus, bevor Sie fortfahren.',
                    pleaseSelectCountry: 'Bitte wählen Sie ein Land aus, bevor Sie fortfahren.',
                    pleaseSelectFeedType: 'Bitte wählen Sie einen Feed-Typ aus, bevor Sie fortfahren.',
                },
            },
            statementCloseDate: (_4 = {},
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH] = 'Letzter Tag des Monats',
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH] = 'Letzter Geschäftstag des Monats',
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH] = 'Individueller Tag des Monats',
                _4),
            assignCard: 'Karte zuweisen',
            findCard: 'Karte finden',
            cardNumber: 'Kartennummer',
            commercialFeed: 'Kommerzieller Feed',
            feedName: function (_a) {
                var feedName = _a.feedName;
                return "".concat(feedName, "-Karten");
            },
            directFeed: 'Direkt-Feed',
            whoNeedsCardAssigned: 'Wer benötigt eine zugewiesene Karte?',
            chooseCard: 'Wählen Sie eine Karte',
            chooseCardFor: function (_a) {
                var assignee = _a.assignee, feed = _a.feed;
                return "W\u00E4hlen Sie eine Karte f\u00FCr ".concat(assignee, " aus dem ").concat(feed, " Karten-Feed.");
            },
            noActiveCards: 'Keine aktiven Karten in diesem Feed',
            somethingMightBeBroken: 'Oder etwas könnte kaputt sein. So oder so, wenn Sie Fragen haben, einfach',
            contactConcierge: 'Concierge kontaktieren',
            chooseTransactionStartDate: 'Wählen Sie ein Startdatum für die Transaktion',
            startDateDescription: 'Wir werden alle Transaktionen ab diesem Datum importieren. Wenn kein Datum angegeben ist, gehen wir so weit zurück, wie es Ihre Bank erlaubt.',
            fromTheBeginning: 'Von Anfang an',
            customStartDate: 'Benutzerdefiniertes Startdatum',
            customCloseDate: 'Benutzerdefiniertes Abschlussdatum',
            letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
            confirmationDescription: 'Wir werden sofort mit dem Import von Transaktionen beginnen.',
            cardholder: 'Karteninhaber',
            card: 'Karte',
            cardName: 'Kartenname',
            brokenConnectionErrorFirstPart: "Die Verbindung zum Karten-Feed ist unterbrochen. Bitte",
            brokenConnectionErrorLink: 'Melden Sie sich bei Ihrer Bank an',
            brokenConnectionErrorSecondPart: 'damit wir die Verbindung erneut herstellen können.',
            assignedCard: function (_a) {
                var assignee = _a.assignee, link = _a.link;
                return "hat ".concat(assignee, " einen ").concat(link, " zugewiesen! Importierte Transaktionen werden in diesem Chat angezeigt.");
            },
            companyCard: 'Firmenkarte',
            chooseCardFeed: 'Karten-Feed auswählen',
            ukRegulation: 'Expensify, Inc. ist ein Agent von Plaid Financial Ltd., einem autorisierten Zahlungsinstitut, das von der Financial Conduct Authority gemäß den Payment Services Regulations 2017 reguliert wird (Firmennummer: 804718). Plaid bietet Ihnen regulierte Kontoinformationsdienste über Expensify Limited als seinen Agenten an.',
        },
        expensifyCard: {
            issueAndManageCards: 'Ausstellen und Verwalten Ihrer Expensify-Karten',
            getStartedIssuing: 'Beginnen Sie, indem Sie Ihre erste virtuelle oder physische Karte ausstellen.',
            verificationInProgress: 'Verifizierung läuft...',
            verifyingTheDetails: 'Wir überprüfen ein paar Details. Concierge wird Sie informieren, wenn Expensify-Karten zur Ausgabe bereit sind.',
            disclaimer: 'The Expensify Visa® Commercial Card wird von der The Bancorp Bank, N.A., Mitglied FDIC, gemäß einer Lizenz von Visa U.S.A. Inc. ausgestellt und kann nicht bei allen Händlern verwendet werden, die Visa-Karten akzeptieren. Apple® und das Apple-Logo® sind Marken von Apple Inc., registriert in den USA und anderen Ländern. App Store ist eine Dienstleistungsmarke von Apple Inc. Google Play und das Google Play-Logo sind Marken von Google LLC.',
            issueCard: 'Karte ausstellen',
            findCard: 'Karte finden',
            newCard: 'Neue Karte',
            name: 'Name',
            lastFour: 'Letzte 4',
            limit: 'Limit',
            currentBalance: 'Aktueller Kontostand',
            currentBalanceDescription: 'Der aktuelle Saldo ist die Summe aller gebuchten Expensify Card-Transaktionen, die seit dem letzten Abrechnungsdatum stattgefunden haben.',
            balanceWillBeSettledOn: function (_a) {
                var settlementDate = _a.settlementDate;
                return "Der Saldo wird am ".concat(settlementDate, " beglichen.");
            },
            settleBalance: 'Saldo ausgleichen',
            cardLimit: 'Kartenlimit',
            remainingLimit: 'Verbleibendes Limit',
            requestLimitIncrease: 'Anforderung zur Erhöhung des Limits',
            remainingLimitDescription: 'Wir berücksichtigen eine Reihe von Faktoren bei der Berechnung Ihres verbleibenden Limits: Ihre Zugehörigkeitsdauer als Kunde, die geschäftsbezogenen Informationen, die Sie bei der Anmeldung angegeben haben, und das verfügbare Guthaben auf Ihrem Geschäftskonto. Ihr verbleibendes Limit kann täglich schwanken.',
            earnedCashback: 'Cashback',
            earnedCashbackDescription: 'Der Cashback-Saldo basiert auf den abgerechneten monatlichen Ausgaben der Expensify-Karte in Ihrem Arbeitsbereich.',
            issueNewCard: 'Neue Karte ausstellen',
            finishSetup: 'Einrichtung abschließen',
            chooseBankAccount: 'Bankkonto auswählen',
            chooseExistingBank: 'Wählen Sie ein bestehendes Geschäftskonto, um Ihr Expensify Card-Guthaben zu begleichen, oder fügen Sie ein neues Bankkonto hinzu.',
            accountEndingIn: 'Konto endet mit',
            addNewBankAccount: 'Ein neues Bankkonto hinzufügen',
            settlementAccount: 'Abrechnungskonto',
            settlementAccountDescription: 'Wählen Sie ein Konto aus, um Ihr Expensify Card-Guthaben zu begleichen.',
            settlementAccountInfoPt1: 'Stellen Sie sicher, dass dieses Konto mit Ihrem übereinstimmt',
            settlementAccountInfoPt2: 'damit die kontinuierliche Abstimmung ordnungsgemäß funktioniert.',
            reconciliationAccount: 'Abstimmungskonto',
            settlementFrequency: 'Abrechnungshäufigkeit',
            settlementFrequencyDescription: 'Wählen Sie, wie oft Sie Ihr Expensify Card-Guthaben bezahlen möchten.',
            settlementFrequencyInfo: 'Wenn Sie zur monatlichen Abrechnung wechseln möchten, müssen Sie Ihr Bankkonto über Plaid verbinden und eine positive 90-Tage-Saldenhistorie haben.',
            frequency: {
                daily: 'Täglich',
                monthly: 'Monatlich',
            },
            cardDetails: 'Kartendetails',
            virtual: 'Virtual',
            physical: 'Physisch',
            deactivate: 'Karte deaktivieren',
            changeCardLimit: 'Kartenlimit ändern',
            changeLimit: 'Limit ändern',
            smartLimitWarning: function (_a) {
                var limit = _a.limit;
                return "Wenn Sie das Limit dieser Karte auf ".concat(limit, " \u00E4ndern, werden neue Transaktionen abgelehnt, bis Sie weitere Ausgaben auf der Karte genehmigen.");
            },
            monthlyLimitWarning: function (_a) {
                var limit = _a.limit;
                return "Wenn Sie das Limit dieser Karte auf ".concat(limit, " \u00E4ndern, werden neue Transaktionen bis zum n\u00E4chsten Monat abgelehnt.");
            },
            fixedLimitWarning: function (_a) {
                var limit = _a.limit;
                return "Wenn Sie das Limit dieser Karte auf ".concat(limit, " \u00E4ndern, werden neue Transaktionen abgelehnt.");
            },
            changeCardLimitType: 'Kartengrenztyp ändern',
            changeLimitType: 'Limit-Typ ändern',
            changeCardSmartLimitTypeWarning: function (_a) {
                var limit = _a.limit;
                return "Wenn Sie den Limittyp dieser Karte auf Smart Limit \u00E4ndern, werden neue Transaktionen abgelehnt, da das ".concat(limit, " ungenehmigte Limit bereits erreicht wurde.");
            },
            changeCardMonthlyLimitTypeWarning: function (_a) {
                var limit = _a.limit;
                return "Wenn Sie den Limittyp dieser Karte auf monatlich \u00E4ndern, werden neue Transaktionen abgelehnt, da das monatliche Limit von ".concat(limit, " bereits erreicht wurde.");
            },
            addShippingDetails: 'Versanddetails hinzufügen',
            issuedCard: function (_a) {
                var assignee = _a.assignee;
                return "hat ".concat(assignee, " eine Expensify-Karte ausgestellt! Die Karte wird in 2-3 Werktagen ankommen.");
            },
            issuedCardNoShippingDetails: function (_a) {
                var assignee = _a.assignee;
                return "hat ".concat(assignee, " eine Expensify-Karte ausgestellt! Die Karte wird versendet, sobald die Versanddetails hinzugef\u00FCgt wurden.");
            },
            issuedCardVirtual: function (_a) {
                var assignee = _a.assignee, link = _a.link;
                return "hat ".concat(assignee, " eine virtuelle ").concat(link, " ausgestellt! Die Karte kann sofort verwendet werden.");
            },
            addedShippingDetails: function (_a) {
                var assignee = _a.assignee;
                return "".concat(assignee, " hat Versanddetails hinzugef\u00FCgt. Die Expensify Card wird in 2-3 Werktagen ankommen.");
            },
            verifyingHeader: 'Überprüfen',
            bankAccountVerifiedHeader: 'Bankkonto verifiziert',
            verifyingBankAccount: 'Bankkonto wird überprüft...',
            verifyingBankAccountDescription: 'Bitte warten Sie, während wir bestätigen, dass dieses Konto verwendet werden kann, um Expensify-Karten auszustellen.',
            bankAccountVerified: 'Bankkonto verifiziert!',
            bankAccountVerifiedDescription: 'Sie können jetzt Expensify-Karten an die Mitglieder Ihres Arbeitsbereichs ausgeben.',
            oneMoreStep: 'Noch ein Schritt...',
            oneMoreStepDescription: 'Es sieht so aus, als müssten wir Ihr Bankkonto manuell verifizieren. Bitte gehen Sie zu Concierge, wo Ihre Anweisungen auf Sie warten.',
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
            spendCategoriesDescription: 'Passen Sie an, wie Händlerausgaben für Kreditkartentransaktionen und gescannte Belege kategorisiert werden.',
            deleteFailureMessage: 'Beim Löschen der Kategorie ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            categoryName: 'Kategoriename',
            requiresCategory: 'Mitglieder müssen alle Ausgaben kategorisieren',
            needCategoryForExportToIntegration: function (_a) {
                var connectionName = _a.connectionName;
                return "Alle Ausgaben m\u00FCssen kategorisiert werden, um nach ".concat(connectionName, " exportiert zu werden.");
            },
            subtitle: 'Verschaffen Sie sich einen besseren Überblick darüber, wo Geld ausgegeben wird. Verwenden Sie unsere Standardkategorien oder fügen Sie Ihre eigenen hinzu.',
            emptyCategories: {
                title: 'Sie haben noch keine Kategorien erstellt.',
                subtitle: 'Fügen Sie eine Kategorie hinzu, um Ihre Ausgaben zu organisieren.',
            },
            emptyCategoriesWithAccounting: {
                subtitle1: 'Ihre Kategorien werden derzeit aus einer Buchhaltungsverbindung importiert. Gehen Sie zu',
                subtitle2: 'Buchhaltung',
                subtitle3: 'um Änderungen vorzunehmen.',
            },
            updateFailureMessage: 'Beim Aktualisieren der Kategorie ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            createFailureMessage: 'Beim Erstellen der Kategorie ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            addCategory: 'Kategorie hinzufügen',
            editCategory: 'Kategorie bearbeiten',
            editCategories: 'Kategorien bearbeiten',
            findCategory: 'Kategorie finden',
            categoryRequiredError: 'Kategoriename ist erforderlich',
            existingCategoryError: 'Eine Kategorie mit diesem Namen existiert bereits',
            invalidCategoryName: 'Ungültiger Kategoriename',
            importedFromAccountingSoftware: 'Die untenstehenden Kategorien werden aus Ihrem',
            payrollCode: 'Lohnabrechnungscode',
            updatePayrollCodeFailureMessage: 'Beim Aktualisieren des Gehaltsabrechnungscodes ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            glCode: 'GL-Code',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des GL-Codes ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            importCategories: 'Kategorien importieren',
            cannotDeleteOrDisableAllCategories: {
                title: 'Kann nicht alle Kategorien löschen oder deaktivieren',
                description: "Mindestens eine Kategorie muss aktiviert bleiben, da Ihr Arbeitsbereich Kategorien erfordert.",
            },
        },
        moreFeatures: {
            subtitle: 'Verwenden Sie die unten stehenden Schalter, um weitere Funktionen zu aktivieren, während Sie wachsen. Jede Funktion wird im Navigationsmenü zur weiteren Anpassung angezeigt.',
            spendSection: {
                title: 'Ausgaben',
                subtitle: 'Aktivieren Sie Funktionen, die Ihnen helfen, Ihr Team zu skalieren.',
            },
            manageSection: {
                title: 'Verwalten',
                subtitle: 'Fügen Sie Kontrollen hinzu, die helfen, die Ausgaben im Rahmen des Budgets zu halten.',
            },
            earnSection: {
                title: 'Verdienen',
                subtitle: 'Optimieren Sie Ihren Umsatz und werden Sie schneller bezahlt.',
            },
            organizeSection: {
                title: 'Organisieren',
                subtitle: 'Gruppieren und analysieren Sie Ausgaben, erfassen Sie jede gezahlte Steuer.',
            },
            integrateSection: {
                title: 'Integrieren',
                subtitle: 'Verbinden Sie Expensify mit beliebten Finanzprodukten.',
            },
            distanceRates: {
                title: 'Entfernungsraten',
                subtitle: 'Raten hinzufügen, aktualisieren und durchsetzen.',
            },
            perDiem: {
                title: 'Tagegeld',
                subtitle: 'Legen Sie Tagessätze fest, um die täglichen Ausgaben der Mitarbeiter zu kontrollieren.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Erhalten Sie Einblicke und Kontrolle über Ausgaben.',
                disableCardTitle: 'Expensify Card deaktivieren',
                disableCardPrompt: 'Sie können die Expensify-Karte nicht deaktivieren, da sie bereits verwendet wird. Wenden Sie sich an Concierge, um die nächsten Schritte zu erfahren.',
                disableCardButton: 'Chatten Sie mit Concierge',
                feed: {
                    title: 'Erhalte die Expensify-Karte',
                    subTitle: 'Optimieren Sie Ihre Geschäftsausgaben und sparen Sie bis zu 50 % auf Ihrer Expensify-Rechnung, plus:',
                    features: {
                        cashBack: 'Cashback auf jeden Einkauf in den USA',
                        unlimited: 'Unbegrenzte virtuelle Karten',
                        spend: 'Ausgabenkontrollen und benutzerdefinierte Limits',
                    },
                    ctaTitle: 'Neue Karte ausstellen',
                },
            },
            companyCards: {
                title: 'Unternehmenskarten',
                subtitle: 'Ausgaben von bestehenden Firmenkarten importieren.',
                feed: {
                    title: 'Unternehmens-Karten importieren',
                    features: {
                        support: 'Unterstützung für alle großen Kartenanbieter',
                        assignCards: 'Karten dem gesamten Team zuweisen',
                        automaticImport: 'Automatischer Transaktionsimport',
                    },
                },
                disableCardTitle: 'Unternehmens-Karten deaktivieren',
                disableCardPrompt: 'Sie können Firmenkarten nicht deaktivieren, da diese Funktion in Gebrauch ist. Wenden Sie sich an den Concierge für die nächsten Schritte.',
                disableCardButton: 'Chatten Sie mit Concierge',
                cardDetails: 'Kartendetails',
                cardNumber: 'Kartennummer',
                cardholder: 'Karteninhaber',
                cardName: 'Kartenname',
                integrationExport: function (_a) {
                    var integration = _a.integration, type = _a.type;
                    return (integration && type ? "".concat(integration, " ").concat(type.toLowerCase(), " Export") : "".concat(integration, "-Export"));
                },
                integrationExportTitleFirstPart: function (_a) {
                    var integration = _a.integration;
                    return "W\u00E4hlen Sie das ".concat(integration, "-Konto aus, in das die Transaktionen exportiert werden sollen.");
                },
                integrationExportTitlePart: 'Wählen Sie eine andere Option aus.',
                integrationExportTitleLinkPart: 'Exportoption',
                integrationExportTitleSecondPart: 'um die verfügbaren Konten zu ändern.',
                lastUpdated: 'Zuletzt aktualisiert',
                transactionStartDate: 'Transaktionsstartdatum',
                updateCard: 'Karte aktualisieren',
                unassignCard: 'Karte zuweisen aufheben',
                unassign: 'Zuweisung aufheben',
                unassignCardDescription: 'Das Entfernen dieser Karte wird alle Transaktionen auf Entwurfsberichten vom Konto des Karteninhabers entfernen.',
                assignCard: 'Karte zuweisen',
                cardFeedName: 'Karten-Feed-Name',
                cardFeedNameDescription: 'Geben Sie dem Karten-Feed einen eindeutigen Namen, damit Sie ihn von den anderen unterscheiden können.',
                cardFeedTransaction: 'Transaktionen löschen',
                cardFeedTransactionDescription: 'Wählen Sie, ob Karteninhaber Kartentransaktionen löschen können. Neue Transaktionen werden diesen Regeln folgen.',
                cardFeedRestrictDeletingTransaction: 'Löschen von Transaktionen einschränken',
                cardFeedAllowDeletingTransaction: 'Löschen von Transaktionen erlauben',
                removeCardFeed: 'Karten-Feed entfernen',
                removeCardFeedTitle: function (_a) {
                    var feedName = _a.feedName;
                    return "".concat(feedName, "-Feed entfernen");
                },
                removeCardFeedDescription: 'Möchten Sie diesen Karten-Feed wirklich entfernen? Dadurch werden alle Karten zugewiesen.',
                error: {
                    feedNameRequired: 'Der Name des Karten-Feeds ist erforderlich',
                    statementCloseDateRequired: 'Bitte wählen Sie ein Abschlussdatum für den Kontoauszug aus.',
                },
                corporate: 'Löschen von Transaktionen einschränken',
                personal: 'Löschen von Transaktionen erlauben',
                setFeedNameDescription: 'Geben Sie dem Karten-Feed einen eindeutigen Namen, damit Sie ihn von den anderen unterscheiden können.',
                setTransactionLiabilityDescription: 'Wenn aktiviert, können Karteninhaber Kartentransaktionen löschen. Neue Transaktionen werden dieser Regel folgen.',
                emptyAddedFeedTitle: 'Unternehmenskarten zuweisen',
                emptyAddedFeedDescription: 'Beginnen Sie, indem Sie einem Mitglied Ihre erste Karte zuweisen.',
                pendingFeedTitle: "Wir \u00FCberpr\u00FCfen Ihre Anfrage...",
                pendingFeedDescription: "Wir \u00FCberpr\u00FCfen derzeit Ihre Feed-Details. Sobald das abgeschlossen ist, werden wir uns per",
                pendingBankTitle: 'Überprüfen Sie Ihr Browserfenster',
                pendingBankDescription: function (_a) {
                    var bankName = _a.bankName;
                    return "Bitte verbinden Sie sich mit ".concat(bankName, " \u00FCber das Browserfenster, das sich gerade ge\u00F6ffnet hat. Falls sich keines ge\u00F6ffnet hat,");
                },
                pendingBankLink: 'Bitte hier klicken',
                giveItNameInstruction: 'Geben Sie der Karte einen Namen, der sie von anderen abhebt.',
                updating: 'Aktualisierung...',
                noAccountsFound: 'Keine Konten gefunden',
                defaultCard: 'Standardkarte',
                downgradeTitle: "Arbeitsbereich kann nicht herabgestuft werden",
                downgradeSubTitleFirstPart: "Dieser Arbeitsbereich kann nicht herabgestuft werden, da mehrere Karten-Feeds verbunden sind (au\u00DFer Expensify-Karten). Bitte",
                downgradeSubTitleMiddlePart: "nur einen Karten-Feed behalten",
                downgradeSubTitleLastPart: 'fortzufahren.',
                noAccountsFoundDescription: function (_a) {
                    var connection = _a.connection;
                    return "Bitte f\u00FCgen Sie das Konto in ".concat(connection, " hinzu und synchronisieren Sie die Verbindung erneut.");
                },
                expensifyCardBannerTitle: 'Erhalte die Expensify-Karte',
                expensifyCardBannerSubtitle: 'Genießen Sie Cashback bei jedem Einkauf in den USA, bis zu 50 % Rabatt auf Ihre Expensify-Rechnung, unbegrenzte virtuelle Karten und vieles mehr.',
                expensifyCardBannerLearnMoreButton: 'Erfahren Sie mehr',
                statementCloseDateTitle: 'Datum des Rechnungsabschlusses',
                statementCloseDateDescription: 'Teilen Sie uns mit, wann Ihre Kartenabrechnung geschlossen wird, und wir erstellen eine passende Abrechnung in Expensify.',
            },
            workflows: {
                title: 'Workflows',
                subtitle: 'Konfigurieren Sie, wie Ausgaben genehmigt und bezahlt werden.',
                disableApprovalPrompt: 'Expensify-Karten aus diesem Arbeitsbereich hängen derzeit von der Genehmigung ab, um ihre Smart Limits festzulegen. Bitte ändern Sie die Limitarten aller Expensify-Karten mit Smart Limits, bevor Sie Genehmigungen deaktivieren.',
            },
            invoices: {
                title: 'Rechnungen',
                subtitle: 'Rechnungen senden und empfangen.',
            },
            categories: {
                title: 'Kategorien',
                subtitle: 'Verfolgen und organisieren Sie Ausgaben.',
            },
            tags: {
                title: 'Tags',
                subtitle: 'Klassifizieren Sie Kosten und verfolgen Sie abrechenbare Ausgaben.',
            },
            taxes: {
                title: 'Steuern',
                subtitle: 'Dokumentieren und fordern Sie berechtigte Steuern zurück.',
            },
            reportFields: {
                title: 'Berichtsfelder',
                subtitle: 'Benutzerdefinierte Felder für Ausgaben einrichten.',
            },
            connections: {
                title: 'Buchhaltung',
                subtitle: 'Synchronisieren Sie Ihren Kontenplan und mehr.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Nicht so schnell...',
                featureEnabledText: 'Um diese Funktion zu aktivieren oder zu deaktivieren, müssen Sie Ihre Buchhaltungsimporteinstellungen ändern.',
                disconnectText: 'Um die Buchhaltung zu deaktivieren, müssen Sie Ihre Buchhaltungsverbindung von Ihrem Arbeitsbereich trennen.',
                manageSettings: 'Einstellungen verwalten',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Nicht so schnell...',
                featureEnabledText: 'Expensify-Karten in diesem Arbeitsbereich basieren auf Genehmigungs-Workflows, um ihre Smart Limits festzulegen.\n\nBitte ändern Sie die Limittypen von Karten mit Smart Limits, bevor Sie Workflows deaktivieren.',
                confirmText: 'Gehe zu Expensify-Karten',
            },
            rules: {
                title: 'Regeln',
                subtitle: 'Belege anfordern, hohe Ausgaben kennzeichnen und mehr.',
            },
        },
        reportFields: {
            addField: 'Feld hinzufügen',
            delete: 'Feld löschen',
            deleteFields: 'Felder löschen',
            findReportField: 'Berichtsfeld finden',
            deleteConfirmation: 'Möchten Sie dieses Berichtsfeld wirklich löschen?',
            deleteFieldsConfirmation: 'Möchten Sie diese Berichts-Felder wirklich löschen?',
            emptyReportFields: {
                title: 'Sie haben noch keine Berichts-Felder erstellt.',
                subtitle: 'Fügen Sie ein benutzerdefiniertes Feld (Text, Datum oder Dropdown) hinzu, das in Berichten angezeigt wird.',
            },
            subtitle: 'Berichtsfelder gelten für alle Ausgaben und können hilfreich sein, wenn Sie nach zusätzlichen Informationen fragen möchten.',
            disableReportFields: 'Berichtsfelder deaktivieren',
            disableReportFieldsConfirmation: 'Bist du sicher? Text- und Datumsfelder werden gelöscht und Listen werden deaktiviert.',
            importedFromAccountingSoftware: 'Die unten aufgeführten Berichtsfelder werden aus Ihrem importiert.',
            textType: 'Text',
            dateType: 'Datum',
            dropdownType: 'Liste',
            textAlternateText: 'Fügen Sie ein Feld für die freie Texteingabe hinzu.',
            dateAlternateText: 'Fügen Sie einen Kalender zur Datumauswahl hinzu.',
            dropdownAlternateText: 'Fügen Sie eine Liste von Optionen zur Auswahl hinzu.',
            nameInputSubtitle: 'Wählen Sie einen Namen für das Berichtsfeld.',
            typeInputSubtitle: 'Wählen Sie aus, welche Art von Berichtsfeld verwendet werden soll.',
            initialValueInputSubtitle: 'Geben Sie einen Startwert ein, der im Berichtsfeld angezeigt werden soll.',
            listValuesInputSubtitle: 'Diese Werte werden im Dropdown-Menü Ihres Berichtsfelds angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            listInputSubtitle: 'Diese Werte werden in Ihrer Berichts-Feldliste angezeigt. Aktivierte Werte können von Mitgliedern ausgewählt werden.',
            deleteValue: 'Wert löschen',
            deleteValues: 'Werte löschen',
            disableValue: 'Wert deaktivieren',
            disableValues: 'Werte deaktivieren',
            enableValue: 'Wert aktivieren',
            enableValues: 'Werte aktivieren',
            emptyReportFieldsValues: {
                title: 'Sie haben keine Listenwerte erstellt.',
                subtitle: 'Benutzerdefinierte Werte hinzufügen, die in Berichten erscheinen sollen.',
            },
            deleteValuePrompt: 'Möchten Sie diesen Listenwert wirklich löschen?',
            deleteValuesPrompt: 'Möchten Sie diese Listenwerte wirklich löschen?',
            listValueRequiredError: 'Bitte geben Sie einen Listennamen ein',
            existingListValueError: 'Ein Listenwert mit diesem Namen existiert bereits.',
            editValue: 'Wert bearbeiten',
            listValues: 'Werte auflisten',
            addValue: 'Wert hinzufügen',
            existingReportFieldNameError: 'Ein Berichtsfeld mit diesem Namen existiert bereits.',
            reportFieldNameRequiredError: 'Bitte geben Sie einen Berichtsfeldnamen ein',
            reportFieldTypeRequiredError: 'Bitte wählen Sie einen Berichtsfeldtyp aus',
            reportFieldInitialValueRequiredError: 'Bitte wählen Sie einen Anfangswert für das Berichtsfeld aus',
            genericFailureMessage: 'Beim Aktualisieren des Berichtsfeldes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        tags: {
            tagName: 'Tag-Name',
            requiresTag: 'Mitglieder müssen alle Ausgaben kennzeichnen',
            trackBillable: 'Verfolgen Sie abrechenbare Ausgaben',
            customTagName: 'Benutzerdefinierter Tag-Name',
            enableTag: 'Tag aktivieren',
            enableTags: 'Tags aktivieren',
            requireTag: 'Require tag',
            requireTags: 'Tags erforderlich',
            notRequireTags: 'Nicht erforderlich',
            disableTag: 'Tag deaktivieren',
            disableTags: 'Tags deaktivieren',
            addTag: 'Tag hinzufügen',
            editTag: 'Tag bearbeiten',
            editTags: 'Tags bearbeiten',
            findTag: 'Tag finden',
            subtitle: 'Tags bieten detailliertere Möglichkeiten, Kosten zu klassifizieren.',
            dependentMultiLevelTagsSubtitle: {
                phrase1: 'Sie verwenden',
                phrase2: 'abhängige Tags',
                phrase3: '. You can',
                phrase4: 'eine Tabelle erneut importieren',
                phrase5: 'um Ihre Tags zu aktualisieren.',
            },
            emptyTags: {
                title: 'Sie haben noch keine Tags erstellt.',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Fügen Sie ein Tag hinzu, um Projekte, Standorte, Abteilungen und mehr zu verfolgen.',
                subtitle1: 'Importieren Sie eine Tabelle, um Tags für die Verfolgung von Projekten, Standorten, Abteilungen und mehr hinzuzufügen.',
                subtitle2: 'Erfahren Sie mehr',
                subtitle3: 'über das Formatieren von Tag-Dateien.',
            },
            emptyTagsWithAccounting: {
                subtitle1: 'Ihre Tags werden derzeit aus einer Buchhaltungsverbindung importiert. Gehen Sie zu',
                subtitle2: 'Buchhaltung',
                subtitle3: 'um Änderungen vorzunehmen.',
            },
            deleteTag: 'Tag löschen',
            deleteTags: 'Tags löschen',
            deleteTagConfirmation: 'Möchten Sie dieses Tag wirklich löschen?',
            deleteTagsConfirmation: 'Möchten Sie diese Tags wirklich löschen?',
            deleteFailureMessage: 'Beim Löschen des Tags ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            tagRequiredError: 'Tag-Name ist erforderlich',
            existingTagError: 'Ein Tag mit diesem Namen existiert bereits',
            invalidTagNameError: 'Der Tag-Name darf nicht 0 sein. Bitte wählen Sie einen anderen Wert.',
            genericFailureMessage: 'Beim Aktualisieren des Tags ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            importedFromAccountingSoftware: 'Die unten stehenden Tags werden aus Ihrem',
            glCode: 'GL-Code',
            updateGLCodeFailureMessage: 'Beim Aktualisieren des GL-Codes ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
            tagRules: 'Tag-Regeln',
            approverDescription: 'Genehmiger',
            importTags: 'Tags importieren',
            importTagsSupportingText: 'Kodieren Sie Ihre Ausgaben mit einer Art von Tag oder vielen.',
            configureMultiLevelTags: 'Konfigurieren Sie Ihre Liste von Tags für die mehrstufige Kategorisierung.',
            importMultiLevelTagsSupportingText: "Hier ist eine Vorschau Ihrer Tags. Wenn alles gut aussieht, klicken Sie unten, um sie zu importieren.",
            importMultiLevelTags: {
                firstRowTitle: 'Die erste Zeile ist der Titel für jede Tag-Liste.',
                independentTags: 'Dies sind unabhängige Tags',
                glAdjacentColumn: 'Es gibt einen GL-Code in der angrenzenden Spalte.',
            },
            tagLevel: {
                singleLevel: 'Einzelne Ebene von Tags',
                multiLevel: 'Mehrstufige Tags',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Tag-Ebenen wechseln',
                prompt1: 'Das Ändern der Tag-Ebenen löscht alle aktuellen Tags.',
                prompt2: 'Wir empfehlen Ihnen zuerst',
                prompt3: 'ein Backup herunterladen',
                prompt4: 'indem Sie Ihre Tags exportieren.',
                prompt5: 'Erfahren Sie mehr',
                prompt6: 'about tag levels.',
            },
            importedTagsMessage: function (_a) {
                var columnCounts = _a.columnCounts;
                return "Wir haben *".concat(columnCounts, " Spalten* in Ihrer Tabelle gefunden. W\u00E4hlen Sie *Name* neben der Spalte, die die Tag-Namen enth\u00E4lt. Sie k\u00F6nnen auch *Aktiviert* neben der Spalte ausw\u00E4hlen, die den Tag-Status festlegt.");
            },
            cannotDeleteOrDisableAllTags: {
                title: 'Kann nicht alle Tags löschen oder deaktivieren',
                description: "Mindestens ein Tag muss aktiviert bleiben, da Ihr Arbeitsbereich Tags ben\u00F6tigt.",
            },
            cannotMakeAllTagsOptional: {
                title: 'Kann nicht alle Tags optional machen',
                description: "Mindestens ein Tag muss erforderlich bleiben, da Ihre Arbeitsbereichseinstellungen Tags erfordern.",
            },
            tagCount: function () { return ({
                one: '1 Tag',
                other: function (count) { return "".concat(count, " Tags"); },
            }); },
        },
        taxes: {
            subtitle: 'Steuernamen, -sätze hinzufügen und Standardwerte festlegen.',
            addRate: 'Rate hinzufügen',
            workspaceDefault: 'Standardwährung des Arbeitsbereichs',
            foreignDefault: 'Fremdwährungsstandard',
            customTaxName: 'Benutzerdefinierter Steuername',
            value: 'Wert',
            taxReclaimableOn: 'Steuer erstattungsfähig auf',
            taxRate: 'Steuersatz',
            findTaxRate: 'Steuersatz finden',
            error: {
                taxRateAlreadyExists: 'Dieser Steuername wird bereits verwendet',
                taxCodeAlreadyExists: 'Dieser Steuercode wird bereits verwendet',
                valuePercentageRange: 'Bitte geben Sie einen gültigen Prozentsatz zwischen 0 und 100 ein.',
                customNameRequired: 'Benutzerdefinierter Steuername ist erforderlich',
                deleteFailureMessage: 'Beim Löschen des Steuersatzes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder bitten Sie Concierge um Hilfe.',
                updateFailureMessage: 'Beim Aktualisieren des Steuersatzes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder bitten Sie Concierge um Hilfe.',
                createFailureMessage: 'Beim Erstellen des Steuersatzes ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder bitten Sie Concierge um Hilfe.',
                updateTaxClaimableFailureMessage: 'Der erstattungsfähige Teil muss geringer sein als der Distanzsatzbetrag.',
            },
            deleteTaxConfirmation: 'Möchten Sie diese Steuer wirklich löschen?',
            deleteMultipleTaxConfirmation: function (_a) {
                var taxAmount = _a.taxAmount;
                return "M\u00F6chten Sie wirklich ".concat(taxAmount, " Steuern l\u00F6schen?");
            },
            actions: {
                delete: 'Löschrate',
                deleteMultiple: 'Raten löschen',
                enable: 'Rate aktivieren',
                disable: 'Rate deaktivieren',
                enableTaxRates: function () { return ({
                    one: 'Rate aktivieren',
                    other: 'Raten aktivieren',
                }); },
                disableTaxRates: function () { return ({
                    one: 'Rate deaktivieren',
                    other: 'Raten deaktivieren',
                }); },
            },
            importedFromAccountingSoftware: 'Die unten aufgeführten Steuern werden von Ihrem importiert',
            taxCode: 'Steuercode',
            updateTaxCodeFailureMessage: 'Beim Aktualisieren des Steuercodes ist ein Fehler aufgetreten, bitte versuchen Sie es erneut.',
        },
        emptyWorkspace: {
            title: 'Erstellen Sie einen Arbeitsbereich',
            subtitle: 'Erstellen Sie einen Arbeitsbereich, um Belege zu verfolgen, Ausgaben zu erstatten, Reisen zu verwalten, Rechnungen zu senden und mehr – alles in der Geschwindigkeit eines Chats.',
            createAWorkspaceCTA: 'Loslegen',
            features: {
                trackAndCollect: 'Belege verfolgen und sammeln',
                reimbursements: 'Mitarbeiter erstatten',
                companyCards: 'Firmenkarten verwalten',
            },
            notFound: 'Kein Arbeitsbereich gefunden',
            description: 'Räume sind ein großartiger Ort, um mit mehreren Personen zu diskutieren und zu arbeiten. Um mit der Zusammenarbeit zu beginnen, erstellen Sie einen Arbeitsbereich oder treten Sie einem bei.',
        },
        new: {
            newWorkspace: 'Neuer Arbeitsbereich',
            getTheExpensifyCardAndMore: 'Holen Sie sich die Expensify-Karte und mehr',
            confirmWorkspace: 'Arbeitsbereich bestätigen',
            myGroupWorkspace: function (_a) {
                var workspaceNumber = _a.workspaceNumber;
                return "Mein Gruppenarbeitsbereich".concat(workspaceNumber ? " ".concat(workspaceNumber) : '');
            },
            workspaceName: function (_a) {
                var userName = _a.userName, workspaceNumber = _a.workspaceNumber;
                return "".concat(userName, "'s Workspace").concat(workspaceNumber ? " ".concat(workspaceNumber) : '');
            },
        },
        people: {
            genericFailureMessage: 'Beim Entfernen eines Mitglieds aus dem Arbeitsbereich ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            removeMembersPrompt: function (_a) {
                var memberName = _a.memberName;
                return ({
                    one: "M\u00F6chten Sie ".concat(memberName, " wirklich entfernen?"),
                    other: 'Möchten Sie diese Mitglieder wirklich entfernen?',
                });
            },
            removeMembersWarningPrompt: function (_a) {
                var memberName = _a.memberName, ownerName = _a.ownerName;
                return "".concat(memberName, " ist ein Genehmiger in diesem Arbeitsbereich. Wenn Sie diesen Arbeitsbereich mit ihnen nicht mehr teilen, ersetzen wir sie im Genehmigungsprozess durch den Arbeitsbereichsinhaber, ").concat(ownerName, ".");
            },
            removeMembersTitle: function () { return ({
                one: 'Mitglied entfernen',
                other: 'Mitglieder entfernen',
            }); },
            findMember: 'Mitglied finden',
            removeWorkspaceMemberButtonTitle: 'Aus dem Arbeitsbereich entfernen',
            removeGroupMemberButtonTitle: 'Aus Gruppe entfernen',
            removeRoomMemberButtonTitle: 'Aus dem Chat entfernen',
            removeMemberPrompt: function (_a) {
                var memberName = _a.memberName;
                return "M\u00F6chten Sie ".concat(memberName, " wirklich entfernen?");
            },
            removeMemberTitle: 'Mitglied entfernen',
            transferOwner: 'Besitzer übertragen',
            makeMember: 'Mitglied machen',
            makeAdmin: 'Admin machen',
            makeAuditor: 'Prüfer erstellen',
            selectAll: 'Alle auswählen',
            error: {
                genericAdd: 'Es gab ein Problem beim Hinzufügen dieses Arbeitsbereichsmitglieds.',
                cannotRemove: 'Sie können sich selbst oder den Workspace-Inhaber nicht entfernen.',
                genericRemove: 'Es gab ein Problem beim Entfernen dieses Arbeitsbereichsmitglieds.',
            },
            addedWithPrimary: 'Einige Mitglieder wurden mit ihren primären Anmeldungen hinzugefügt.',
            invitedBySecondaryLogin: function (_a) {
                var secondaryLogin = _a.secondaryLogin;
                return "Hinzugef\u00FCgt durch sekund\u00E4ren Login ".concat(secondaryLogin, ".");
            },
            membersListTitle: 'Verzeichnis aller Arbeitsbereichsmitglieder.',
            importMembers: 'Mitglieder importieren',
        },
        card: {
            getStartedIssuing: 'Beginnen Sie, indem Sie Ihre erste virtuelle oder physische Karte ausstellen.',
            issueCard: 'Karte ausstellen',
            issueNewCard: {
                whoNeedsCard: 'Wer braucht eine Karte?',
                findMember: 'Mitglied finden',
                chooseCardType: 'Wählen Sie einen Kartentyp aus',
                physicalCard: 'Physische Karte',
                physicalCardDescription: 'Ideal für den häufigen Ausgeber',
                virtualCard: 'Virtuelle Karte',
                virtualCardDescription: 'Sofort und flexibel',
                chooseLimitType: 'Wählen Sie einen Grenztyp',
                smartLimit: 'Smart Limit',
                smartLimitDescription: 'Bis zu einem bestimmten Betrag ausgeben, bevor eine Genehmigung erforderlich ist.',
                monthly: 'Monatlich',
                monthlyDescription: 'Bis zu einem bestimmten Betrag pro Monat ausgeben',
                fixedAmount: 'Fester Betrag',
                fixedAmountDescription: 'Einmalig bis zu einem bestimmten Betrag ausgeben',
                setLimit: 'Ein Limit festlegen',
                cardLimitError: 'Bitte geben Sie einen Betrag unter $21,474,836 ein.',
                giveItName: 'Gib ihm einen Namen',
                giveItNameInstruction: 'Gestalten Sie es einzigartig genug, um es von anderen Karten zu unterscheiden. Spezifische Anwendungsfälle sind sogar noch besser!',
                cardName: 'Kartenname',
                letsDoubleCheck: 'Lassen Sie uns noch einmal überprüfen, ob alles richtig aussieht.',
                willBeReady: 'Diese Karte wird sofort einsatzbereit sein.',
                cardholder: 'Karteninhaber',
                cardType: 'Kartentyp',
                limit: 'Limit',
                limitType: 'Typ begrenzen',
                name: 'Name',
            },
            deactivateCardModal: {
                deactivate: 'Deaktivieren',
                deactivateCard: 'Karte deaktivieren',
                deactivateConfirmation: 'Das Deaktivieren dieser Karte wird alle zukünftigen Transaktionen ablehnen und kann nicht rückgängig gemacht werden.',
            },
        },
        accounting: {
            settings: 'Einstellungen',
            title: 'Verbindungen',
            subtitle: 'Verbinden Sie sich mit Ihrem Buchhaltungssystem, um Transaktionen mit Ihrem Kontenplan zu kodieren, Zahlungen automatisch abzugleichen und Ihre Finanzen synchron zu halten.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Chatten Sie mit Ihrem Einrichtungsspezialisten.',
            talkYourAccountManager: 'Chatten Sie mit Ihrem Kundenbetreuer.',
            talkToConcierge: 'Chatten Sie mit Concierge.',
            needAnotherAccounting: 'Benötigen Sie eine weitere Buchhaltungssoftware?',
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
            errorODIntegration: 'Es gibt einen Fehler mit einer Verbindung, die in Expensify Classic eingerichtet wurde.',
            goToODToFix: 'Gehen Sie zu Expensify Classic, um dieses Problem zu beheben.',
            goToODToSettings: 'Gehe zu Expensify Classic, um deine Einstellungen zu verwalten.',
            setup: 'Verbinden',
            lastSync: function (_a) {
                var relativeDate = _a.relativeDate;
                return "Zuletzt synchronisiert ".concat(relativeDate);
            },
            notSync: 'Nicht synchronisiert',
            import: 'Importieren',
            export: 'Exportieren',
            advanced: 'Fortgeschritten',
            other: 'Andere',
            syncNow: 'Jetzt synchronisieren',
            disconnect: 'Trennen',
            reinstall: 'Connector neu installieren',
            disconnectTitle: function (_a) {
                var _b = _a === void 0 ? {} : _a, connectionName = _b.connectionName;
                var integrationName = connectionName && CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'Integration';
                return "".concat(integrationName, " trennen");
            },
            connectTitle: function (_a) {
                var _b;
                var connectionName = _a.connectionName;
                return "Connect ".concat((_b = CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]) !== null && _b !== void 0 ? _b : 'Buchhaltungsintegration');
            },
            syncError: function (_a) {
                var connectionName = _a.connectionName;
                switch (connectionName) {
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Kann keine Verbindung zu QuickBooks Online herstellen';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Kann keine Verbindung zu Xero herstellen';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Kann keine Verbindung zu NetSuite herstellen';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Kann keine Verbindung zu QuickBooks Desktop herstellen';
                    default: {
                        return 'Kann keine Verbindung zur Integration herstellen';
                    }
                }
            },
            accounts: 'Kontenplan',
            taxes: 'Steuern',
            imported: 'Importiert',
            notImported: 'Nicht importiert',
            importAsCategory: 'Als Kategorien importiert',
            importTypes: (_5 = {},
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED] = 'Importiert',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG] = 'Als Tags importiert',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT] = 'Importiert',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED] = 'Nicht importiert',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE] = 'Nicht importiert',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD] = 'Als Berichtsfelder importiert',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT] = 'NetSuite-Mitarbeiterstandard',
                _5),
            disconnectPrompt: function (_a) {
                var _b = _a === void 0 ? {} : _a, connectionName = _b.connectionName;
                var integrationName = connectionName && CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'diese Integration';
                return "M\u00F6chten Sie ".concat(integrationName, " wirklich trennen?");
            },
            connectPrompt: function (_a) {
                var _b;
                var connectionName = _a.connectionName;
                return "M\u00F6chten Sie wirklich ".concat((_b = CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]) !== null && _b !== void 0 ? _b : 'diese Buchhaltungsintegration', " verbinden? Dadurch werden alle bestehenden Buchhaltungsverbindungen entfernt.");
            },
            enterCredentials: 'Geben Sie Ihre Anmeldedaten ein',
            connections: {
                syncStageName: function (_a) {
                    var stage = _a.stage;
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Kunden importieren';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Mitarbeiter importieren';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Konten importieren';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Klassen importieren';
                        case 'quickbooksOnlineImportLocations':
                            return 'Standorte importieren';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Verarbeitung importierter Daten';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Synchronisieren von erstatteten Berichten und Rechnungszahlungen';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importieren von Steuercodes';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Überprüfung der QuickBooks Online-Verbindung';
                        case 'quickbooksOnlineImportMain':
                            return 'Importieren von QuickBooks Online-Daten';
                        case 'startingImportXero':
                            return 'Importieren von Xero-Daten';
                        case 'startingImportQBO':
                            return 'Importieren von QuickBooks Online-Daten';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importieren von QuickBooks Desktop-Daten';
                        case 'quickbooksDesktopImportTitle':
                            return 'Titel importieren';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Zertifikat zur Genehmigung importieren';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Dimensionen importieren';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Speicherungsrichtlinie importieren';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Daten werden weiterhin mit QuickBooks synchronisiert... Bitte stellen Sie sicher, dass der Web Connector läuft.';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Synchronisiere QuickBooks Online-Daten';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Daten werden geladen';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Kategorien aktualisieren';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Kunden/Projekte aktualisieren';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Aktualisierung der Personenliste';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Aktualisieren von Berichtsfeldern';
                        case 'jobDone':
                            return 'Warten auf das Laden der importierten Daten';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Kontenplan synchronisieren';
                        case 'xeroSyncImportCategories':
                            return 'Kategorien synchronisieren';
                        case 'xeroSyncImportCustomers':
                            return 'Kunden synchronisieren';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Expensify-Berichte als erstattet markieren';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Xero-Rechnungen und -Rechnungen als bezahlt markieren';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Synchronisieren von Tracking-Kategorien';
                        case 'xeroSyncImportBankAccounts':
                            return 'Synchronisieren von Bankkonten';
                        case 'xeroSyncImportTaxRates':
                            return 'Steuersätze synchronisieren';
                        case 'xeroCheckConnection':
                            return 'Xero-Verbindung wird überprüft';
                        case 'xeroSyncTitle':
                            return 'Synchronisiere Xero-Daten';
                        case 'netSuiteSyncConnection':
                            return 'Initialisiere Verbindung zu NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Kunden importieren';
                        case 'netSuiteSyncInitData':
                            return 'Daten von NetSuite abrufen';
                        case 'netSuiteSyncImportTaxes':
                            return 'Steuern importieren';
                        case 'netSuiteSyncImportItems':
                            return 'Elemente importieren';
                        case 'netSuiteSyncData':
                            return 'Daten in Expensify importieren';
                        case 'netSuiteSyncAccounts':
                            return 'Konten synchronisieren';
                        case 'netSuiteSyncCurrencies':
                            return 'Währungen synchronisieren';
                        case 'netSuiteSyncCategories':
                            return 'Kategorien synchronisieren';
                        case 'netSuiteSyncReportFields':
                            return 'Importieren von Daten als Expensify-Berichtsfelder';
                        case 'netSuiteSyncTags':
                            return 'Daten als Expensify-Tags importieren';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Verbindungseinstellungen werden aktualisiert';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensify-Berichte als erstattet markieren';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuite-Rechnungen und -Rechnungen als bezahlt markieren';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importieren von Lieferanten';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importieren benutzerdefinierter Listen';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importieren benutzerdefinierter Listen';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importieren von Tochtergesellschaften';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importieren von Lieferanten';
                        case 'intacctCheckConnection':
                            return 'Sage Intacct-Verbindung wird überprüft';
                        case 'intacctImportDimensions':
                            return 'Importieren von Sage Intacct-Dimensionen';
                        case 'intacctImportTitle':
                            return 'Importieren von Sage Intacct-Daten';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return "\u00DCbersetzung fehlt f\u00FCr Stufe: ".concat(stage);
                        }
                    }
                },
            },
            preferredExporter: 'Bevorzugter Exporteur',
            exportPreferredExporterNote: 'Der bevorzugte Exporteur kann jeder Workspace-Admin sein, muss jedoch auch ein Domain-Admin sein, wenn Sie in den Domaineinstellungen unterschiedliche Exportkonten für einzelne Firmenkarten festlegen.',
            exportPreferredExporterSubNote: 'Sobald festgelegt, sieht der bevorzugte Exporteur Berichte zur Exportierung in seinem Konto.',
            exportAs: 'Exportieren als',
            exportOutOfPocket: 'Auslagen als exportieren',
            exportCompanyCard: 'Unternehmensausgaben exportieren als',
            exportDate: 'Exportdatum',
            defaultVendor: 'Standardanbieter',
            autoSync: 'Auto-Synchronisierung',
            autoSyncDescription: 'Synchronisieren Sie NetSuite und Expensify automatisch, jeden Tag. Exportieren Sie den finalisierten Bericht in Echtzeit.',
            reimbursedReports: 'Synchronisiere erstattete Berichte',
            cardReconciliation: 'Kartenabstimmung',
            reconciliationAccount: 'Abstimmungskonto',
            continuousReconciliation: 'Kontinuierliche Abstimmung',
            saveHoursOnReconciliation: 'Sparen Sie Stunden bei der Abstimmung in jedem Buchhaltungszeitraum, indem Expensify kontinuierlich Expensify Card-Abrechnungen und -Abwicklungen in Ihrem Namen abstimmt.',
            enableContinuousReconciliation: 'Um die kontinuierliche Abstimmung zu aktivieren, bitte aktivieren Sie',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wählen Sie das Bankkonto, gegen das Ihre Expensify Card-Zahlungen abgeglichen werden sollen.',
                accountMatches: 'Stellen Sie sicher, dass dieses Konto mit Ihrem übereinstimmt',
                settlementAccount: 'Expensify-Kartenabrechnungskonto',
                reconciliationWorks: function (_a) {
                    var lastFourPAN = _a.lastFourPAN;
                    return "(endend mit ".concat(lastFourPAN, "), damit die kontinuierliche Abstimmung ordnungsgem\u00E4\u00DF funktioniert.");
                },
            },
        },
        export: {
            notReadyHeading: 'Nicht bereit zum Exportieren',
            notReadyDescription: 'Entwürfe oder ausstehende Spesenabrechnungen können nicht in das Buchhaltungssystem exportiert werden. Bitte genehmigen oder begleichen Sie diese Ausgaben, bevor Sie sie exportieren.',
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
                business: 'Geschäft',
                chooseInvoiceMethod: 'Wählen Sie unten eine Zahlungsmethode aus:',
                addBankAccount: 'Bankkonto hinzufügen',
                payingAsIndividual: 'Als Einzelperson bezahlen',
                payingAsBusiness: 'Als Unternehmen bezahlen',
            },
            invoiceBalance: 'Rechnungsbetrag',
            invoiceBalanceSubtitle: 'Dies ist Ihr aktueller Kontostand aus dem Einzug von Rechnungszahlungen. Er wird automatisch auf Ihr Bankkonto überwiesen, wenn Sie eines hinzugefügt haben.',
            bankAccountsSubtitle: 'Fügen Sie ein Bankkonto hinzu, um Rechnungszahlungen zu senden und zu empfangen.',
        },
        invite: {
            member: 'Mitglied einladen',
            members: 'Mitglieder einladen',
            invitePeople: 'Neue Mitglieder einladen',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Arbeitsbereich ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            pleaseEnterValidLogin: "Bitte stellen Sie sicher, dass die E-Mail-Adresse oder Telefonnummer g\u00FCltig ist (z. B. ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")."),
            user: 'Benutzer',
            users: 'Benutzer',
            invited: 'eingeladen',
            removed: 'entfernt',
            to: 'zu',
            from: 'von',
        },
        inviteMessage: {
            confirmDetails: 'Details bestätigen',
            inviteMessagePrompt: 'Machen Sie Ihre Einladung besonders, indem Sie unten eine Nachricht hinzufügen!',
            personalMessagePrompt: 'Nachricht',
            genericFailureMessage: 'Beim Einladen des Mitglieds in den Arbeitsbereich ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            inviteNoMembersError: 'Bitte wählen Sie mindestens ein Mitglied zum Einladen aus.',
            joinRequest: function (_a) {
                var user = _a.user, workspaceName = _a.workspaceName;
                return "".concat(user, " hat beantragt, ").concat(workspaceName, " beizutreten.");
            },
        },
        distanceRates: {
            oopsNotSoFast: 'Hoppla! Nicht so schnell...',
            workspaceNeeds: 'Ein Arbeitsbereich benötigt mindestens einen aktivierten Distanzsatz.',
            distance: 'Entfernung',
            centrallyManage: 'Verwalten Sie zentral die Tarife, verfolgen Sie in Meilen oder Kilometern und legen Sie eine Standardkategorie fest.',
            rate: 'Bewerten',
            addRate: 'Rate hinzufügen',
            findRate: 'Rate finden',
            trackTax: 'Steuern verfolgen',
            deleteRates: function () { return ({
                one: 'Löschrate',
                other: 'Raten löschen',
            }); },
            enableRates: function () { return ({
                one: 'Rate aktivieren',
                other: 'Raten aktivieren',
            }); },
            disableRates: function () { return ({
                one: 'Rate deaktivieren',
                other: 'Raten deaktivieren',
            }); },
            enableRate: 'Rate aktivieren',
            status: 'Status',
            unit: 'Einheit',
            taxFeatureNotEnabledMessage: 'Steuern müssen im Arbeitsbereich aktiviert sein, um diese Funktion zu nutzen. Gehen Sie zu',
            changePromptMessage: 'um diese Änderung vorzunehmen.',
            deleteDistanceRate: 'Entfernen Sie den Distanzsatz',
            areYouSureDelete: function () { return ({
                one: 'Möchten Sie diesen Satz wirklich löschen?',
                other: 'Möchten Sie diese Tarife wirklich löschen?',
            }); },
        },
        editor: {
            descriptionInputLabel: 'Beschreibung',
            nameInputLabel: 'Name',
            typeInputLabel: 'Typ',
            initialValueInputLabel: 'Anfangswert',
            nameInputHelpText: 'Dies ist der Name, den Sie in Ihrem Arbeitsbereich sehen werden.',
            nameIsRequiredError: 'Sie müssen Ihrem Arbeitsbereich einen Namen geben',
            currencyInputLabel: 'Standardwährung',
            currencyInputHelpText: 'Alle Ausgaben in diesem Arbeitsbereich werden in diese Währung umgerechnet.',
            currencyInputDisabledText: function (_a) {
                var currency = _a.currency;
                return "Die Standardw\u00E4hrung kann nicht ge\u00E4ndert werden, da dieser Arbeitsbereich mit einem ".concat(currency, " Bankkonto verkn\u00FCpft ist.");
            },
            save: 'Speichern',
            genericFailureMessage: 'Beim Aktualisieren des Arbeitsbereichs ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
            avatarUploadFailureMessage: 'Beim Hochladen des Avatars ist ein Fehler aufgetreten. Bitte versuche es erneut.',
            addressContext: 'Eine Workspace-Adresse ist erforderlich, um Expensify Travel zu aktivieren. Bitte geben Sie eine Adresse ein, die mit Ihrem Unternehmen verbunden ist.',
        },
        bankAccount: {
            continueWithSetup: 'Setup fortsetzen',
            youAreAlmostDone: 'Sie sind fast fertig mit der Einrichtung Ihres Bankkontos, das es Ihnen ermöglicht, Firmenkarten auszustellen, Ausgaben zu erstatten, Rechnungen zu sammeln und Rechnungen zu bezahlen.',
            streamlinePayments: 'Zahlungen optimieren',
            connectBankAccountNote: 'Hinweis: Persönliche Bankkonten können nicht für Zahlungen in Arbeitsbereichen verwendet werden.',
            oneMoreThing: 'Noch eine Sache!',
            allSet: 'Du bist startklar!',
            accountDescriptionWithCards: 'Dieses Bankkonto wird verwendet, um Firmenkarten auszustellen, Ausgaben zu erstatten, Rechnungen einzuziehen und Rechnungen zu bezahlen.',
            letsFinishInChat: 'Lass uns im Chat fertig werden!',
            finishInChat: 'Im Chat beenden',
            almostDone: 'Fast fertig!',
            disconnectBankAccount: 'Bankkonto trennen',
            startOver: 'Von vorne anfangen',
            updateDetails: 'Details aktualisieren',
            yesDisconnectMyBankAccount: 'Ja, trennen Sie mein Bankkonto.',
            yesStartOver: 'Ja, von vorne beginnen.',
            disconnectYour: 'Trennen Sie Ihr',
            bankAccountAnyTransactions: 'Bankkonto. Alle ausstehenden Transaktionen für dieses Konto werden trotzdem abgeschlossen.',
            clearProgress: 'Ein Neuanfang wird den bisherigen Fortschritt löschen.',
            areYouSure: 'Bist du sicher?',
            workspaceCurrency: 'Arbeitsbereichswährung',
            updateCurrencyPrompt: 'Es sieht so aus, als ob Ihr Arbeitsbereich derzeit auf eine andere Währung als USD eingestellt ist. Bitte klicken Sie auf die Schaltfläche unten, um Ihre Währung jetzt auf USD zu aktualisieren.',
            updateToUSD: 'In USD aktualisieren',
            updateWorkspaceCurrency: 'Arbeitsbereichswährung aktualisieren',
            workspaceCurrencyNotSupported: 'Arbeitsbereichswährung wird nicht unterstützt',
            yourWorkspace: 'Ihr Arbeitsbereich ist auf eine nicht unterstützte Währung eingestellt. Sehen Sie sich die',
            listOfSupportedCurrencies: 'Liste der unterstützten Währungen',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Besitzer übertragen',
            addPaymentCardTitle: 'Geben Sie Ihre Zahlungskarte ein, um die Eigentümerschaft zu übertragen.',
            addPaymentCardButtonText: 'Bedingungen akzeptieren & Zahlungskarte hinzufügen',
            addPaymentCardReadAndAcceptTextPart1: 'Lesen und akzeptieren',
            addPaymentCardReadAndAcceptTextPart2: 'Richtlinie zum Hinzufügen Ihrer Karte',
            addPaymentCardTerms: 'Bedingungen',
            addPaymentCardPrivacy: 'Datenschutz',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'PCI-DSS-konform',
            addPaymentCardBankLevelEncrypt: 'Verschlüsselung auf Bankniveau',
            addPaymentCardRedundant: 'Redundante Infrastruktur',
            addPaymentCardLearnMore: 'Erfahren Sie mehr über unsere',
            addPaymentCardSecurity: 'Sicherheit',
            amountOwedTitle: 'Ausstehender Saldo',
            amountOwedButtonText: 'OK',
            amountOwedText: 'Dieses Konto hat einen ausstehenden Saldo aus einem vorherigen Monat.\n\nMöchten Sie den Saldo ausgleichen und die Abrechnung für diesen Arbeitsbereich übernehmen?',
            ownerOwesAmountTitle: 'Ausstehender Saldo',
            ownerOwesAmountButtonText: 'Guthaben übertragen',
            ownerOwesAmountText: function (_a) {
                var email = _a.email, amount = _a.amount;
                return "Das Konto, dem dieser Arbeitsbereich geh\u00F6rt (".concat(email, "), hat einen ausstehenden Saldo aus einem vorherigen Monat.\n\nM\u00F6chten Sie diesen Betrag (").concat(amount, ") \u00FCberweisen, um die Abrechnung f\u00FCr diesen Arbeitsbereich zu \u00FCbernehmen? Ihre Zahlungskarte wird sofort belastet.");
            },
            subscriptionTitle: 'Übernahme des Jahresabonnements',
            subscriptionButtonText: 'Abonnement übertragen',
            subscriptionText: function (_a) {
                var usersCount = _a.usersCount, finalCount = _a.finalCount;
                return "Die \u00DCbernahme dieses Arbeitsbereichs wird sein Jahresabonnement mit Ihrem aktuellen Abonnement zusammenf\u00FChren. Dadurch erh\u00F6ht sich die Gr\u00F6\u00DFe Ihres Abonnements um ".concat(usersCount, " Mitglieder, sodass Ihre neue Abonnementgr\u00F6\u00DFe ").concat(finalCount, " betr\u00E4gt. M\u00F6chten Sie fortfahren?");
            },
            duplicateSubscriptionTitle: 'Benachrichtigung über doppelte Abonnements',
            duplicateSubscriptionButtonText: 'Fortfahren',
            duplicateSubscriptionText: function (_a) {
                var email = _a.email, workspaceName = _a.workspaceName;
                return "Es sieht so aus, als ob Sie versuchen, die Abrechnung f\u00FCr die Arbeitsbereiche von ".concat(email, " zu \u00FCbernehmen. Dazu m\u00FCssen Sie jedoch zuerst Administrator in all ihren Arbeitsbereichen sein.\n\nKlicken Sie auf \"Weiter\", wenn Sie nur die Abrechnung f\u00FCr den Arbeitsbereich ").concat(workspaceName, " \u00FCbernehmen m\u00F6chten.\n\nWenn Sie die Abrechnung f\u00FCr ihr gesamtes Abonnement \u00FCbernehmen m\u00F6chten, lassen Sie sich bitte zuerst als Administrator zu all ihren Arbeitsbereichen hinzuf\u00FCgen, bevor Sie die Abrechnung \u00FCbernehmen.");
            },
            hasFailedSettlementsTitle: 'Eigentum kann nicht übertragen werden',
            hasFailedSettlementsButtonText: 'Verstanden',
            hasFailedSettlementsText: function (_a) {
                var email = _a.email;
                return "Sie k\u00F6nnen die Abrechnung nicht \u00FCbernehmen, weil ".concat(email, " eine \u00FCberf\u00E4llige Expensify Card-Abrechnung hat. Bitte bitten Sie sie, sich an concierge@expensify.com zu wenden, um das Problem zu l\u00F6sen. Dann k\u00F6nnen Sie die Abrechnung f\u00FCr diesen Arbeitsbereich \u00FCbernehmen.");
            },
            failedToClearBalanceTitle: 'Fehler beim Ausgleichen des Saldos',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Wir konnten den Saldo nicht ausgleichen. Bitte versuchen Sie es später erneut.',
            successTitle: 'Woohoo! Alles bereit.',
            successDescription: 'Sie sind jetzt der Besitzer dieses Arbeitsbereichs.',
            errorTitle: 'Hoppla! Nicht so schnell...',
            errorDescriptionPartOne: 'Es gab ein Problem beim Übertragen der Inhaberschaft dieses Arbeitsbereichs. Versuchen Sie es erneut, oder',
            errorDescriptionPartTwo: 'Wenden Sie sich an Concierge.',
            errorDescriptionPartThree: 'für Hilfe.',
        },
        exportAgainModal: {
            title: 'Vorsicht!',
            description: function (_a) {
                var reportName = _a.reportName, connectionName = _a.connectionName;
                return "Die folgenden Berichte wurden bereits nach ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], " exportiert:\n\n").concat(reportName, "\n\nSind Sie sicher, dass Sie sie erneut exportieren m\u00F6chten?");
            },
            confirmText: 'Ja, erneut exportieren',
            cancelText: 'Abbrechen',
        },
        upgrade: (_6 = {
                reportFields: {
                    title: 'Berichtsfelder',
                    description: "Berichtsfelder erm\u00F6glichen es Ihnen, Details auf Kopfzeilenebene anzugeben, im Gegensatz zu Tags, die sich auf Ausgaben einzelner Positionen beziehen. Diese Details k\u00F6nnen spezifische Projektnamen, Informationen zu Gesch\u00E4ftsreisen, Standorte und mehr umfassen.",
                    onlyAvailableOnPlan: 'Berichtsfelder sind nur im Control-Plan verfügbar, beginnend bei',
                }
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE] = {
                title: 'NetSuite',
                description: "Genie\u00DFen Sie die automatische Synchronisierung und reduzieren Sie manuelle Eingaben mit der Expensify + NetSuite-Integration. Erhalten Sie tiefgehende, Echtzeit-Finanzanalysen mit nativer und benutzerdefinierter Segmentunterst\u00FCtzung, einschlie\u00DFlich Projekt- und Kundenabbildung.",
                onlyAvailableOnPlan: 'Unsere NetSuite-Integration ist nur im Control-Plan verfügbar, beginnend bei',
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT] = {
                title: 'Sage Intacct',
                description: "Genie\u00DFen Sie die automatische Synchronisierung und reduzieren Sie manuelle Eingaben mit der Expensify + Sage Intacct-Integration. Erhalten Sie tiefgehende, Echtzeit-Finanzanalysen mit benutzerdefinierten Dimensionen sowie Spesenkodierung nach Abteilung, Klasse, Standort, Kunde und Projekt (Job).",
                onlyAvailableOnPlan: 'Unsere Sage Intacct-Integration ist nur im Control-Plan verfügbar, beginnend bei',
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
                title: 'QuickBooks Desktop',
                description: "Genie\u00DFen Sie die automatische Synchronisierung und reduzieren Sie manuelle Eingaben mit der Expensify + QuickBooks Desktop-Integration. Erreichen Sie ultimative Effizienz mit einer Echtzeit-Zwei-Wege-Verbindung und der Ausgabenkodierung nach Klasse, Artikel, Kunde und Projekt.",
                onlyAvailableOnPlan: 'Unsere QuickBooks Desktop-Integration ist nur im Control-Plan verfügbar, beginnend bei',
            },
            _6[CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id] = {
                title: 'Erweiterte Genehmigungen',
                description: "Wenn Sie weitere Genehmigungsebenen hinzuf\u00FCgen m\u00F6chten \u2013 oder einfach nur sicherstellen m\u00F6chten, dass die gr\u00F6\u00DFten Ausgaben noch einmal \u00FCberpr\u00FCft werden \u2013 sind Sie bei uns genau richtig. Erweiterte Genehmigungen helfen Ihnen, die richtigen Kontrollen auf jeder Ebene einzurichten, damit Sie die Ausgaben Ihres Teams im Griff behalten.",
                onlyAvailableOnPlan: 'Erweiterte Genehmigungen sind nur im Control-Plan verfügbar, der bei',
            },
            _6.categories = {
                title: 'Kategorien',
                description: "Kategorien helfen Ihnen, Ausgaben besser zu organisieren, um den \u00DCberblick dar\u00FCber zu behalten, wo Sie Ihr Geld ausgeben. Verwenden Sie unsere vorgeschlagene Kategorienliste oder erstellen Sie Ihre eigene.",
                onlyAvailableOnPlan: 'Kategorien sind im Collect-Plan verfügbar, beginnend bei',
            },
            _6.glCodes = {
                title: 'GL-Codes',
                description: "F\u00FCgen Sie Ihren Kategorien und Tags GL-Codes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Gehaltssysteme zu exportieren.",
                onlyAvailableOnPlan: 'GL-Codes sind nur im Control-Plan verfügbar, beginnend bei',
            },
            _6.glAndPayrollCodes = {
                title: 'GL- und Payroll-Codes',
                description: "F\u00FCgen Sie GL- und Payroll-Codes zu Ihren Kategorien hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Gehaltssysteme zu exportieren.",
                onlyAvailableOnPlan: 'GL- und Payroll-Codes sind nur im Control-Plan verfügbar, beginnend bei',
            },
            _6.taxCodes = {
                title: 'Steuercodes',
                description: "F\u00FCgen Sie Ihren Steuern Steuercodes hinzu, um Ausgaben einfach in Ihre Buchhaltungs- und Gehaltssysteme zu exportieren.",
                onlyAvailableOnPlan: 'Steuercodes sind nur im Control-Plan verfügbar, beginnend bei',
            },
            _6.companyCards = {
                title: 'Unbegrenzte Firmenkarten',
                description: "M\u00FCssen Sie weitere Karten-Feeds hinzuf\u00FCgen? Schalten Sie unbegrenzte Firmenkarten frei, um Transaktionen von allen gro\u00DFen Kartenausstellern zu synchronisieren.",
                onlyAvailableOnPlan: 'Dies ist nur im Control-Plan verfügbar, beginnend bei',
            },
            _6.rules = {
                title: 'Regeln',
                description: "Regeln laufen im Hintergrund und halten Ihre Ausgaben unter Kontrolle, damit Sie sich nicht um Kleinigkeiten k\u00FCmmern m\u00FCssen.\n\nFordern Sie Ausgabendetails wie Belege und Beschreibungen an, legen Sie Limits und Standards fest und automatisieren Sie Genehmigungen und Zahlungen \u2013 alles an einem Ort.",
                onlyAvailableOnPlan: 'Regeln sind nur im Control-Plan verfügbar, beginnend bei',
            },
            _6.perDiem = {
                title: 'Tagegeld',
                description: 'Per Diem ist eine großartige Möglichkeit, um Ihre täglichen Kosten konform und vorhersehbar zu halten, wann immer Ihre Mitarbeiter reisen. Genießen Sie Funktionen wie benutzerdefinierte Raten, Standardkategorien und detailliertere Informationen wie Ziele und Unterraten.',
                onlyAvailableOnPlan: 'Tagespauschalen sind nur im Control-Plan verfügbar, beginnend bei',
            },
            _6.travel = {
                title: 'Reisen',
                description: 'Expensify Travel ist eine neue Plattform für die Buchung und Verwaltung von Geschäftsreisen, die es Mitgliedern ermöglicht, Unterkünfte, Flüge, Transportmittel und mehr zu buchen.',
                onlyAvailableOnPlan: 'Reisen ist im Collect-Plan verfügbar, beginnend bei',
            },
            _6.multiLevelTags = {
                title: 'Mehrstufige Tags',
                description: 'Mehrstufige Tags helfen Ihnen, Ausgaben präziser zu verfolgen. Weisen Sie jedem Posten mehrere Tags zu – wie Abteilung, Kunde oder Kostenstelle – um den vollständigen Kontext jeder Ausgabe zu erfassen. Dies ermöglicht detailliertere Berichte, Genehmigungs-Workflows und Buchhaltungsexporte.',
                onlyAvailableOnPlan: 'Mehrstufige Tags sind nur im Control-Plan verfügbar, beginnend bei',
            },
            _6.pricing = {
                perActiveMember: 'pro aktivem Mitglied pro Monat.',
                perMember: 'pro Mitglied pro Monat.',
            },
            _6.note = {
                upgradeWorkspace: 'Aktualisieren Sie Ihren Arbeitsbereich, um auf diese Funktion zuzugreifen, oder',
                learnMore: 'Erfahren Sie mehr',
                aboutOurPlans: 'über unsere Pläne und Preise.',
            },
            _6.upgradeToUnlock = 'Diese Funktion freischalten',
            _6.completed = {
                headline: "Sie haben Ihren Arbeitsbereich aktualisiert!",
                successMessage: function (_a) {
                    var policyName = _a.policyName;
                    return "Sie haben ".concat(policyName, " erfolgreich auf den Control-Plan hochgestuft!");
                },
                categorizeMessage: "Sie haben erfolgreich auf einen Workspace im Collect-Plan upgegradet. Jetzt k\u00F6nnen Sie Ihre Ausgaben kategorisieren!",
                travelMessage: "Sie haben erfolgreich auf einen Workspace im Collect-Plan aufger\u00FCstet. Jetzt k\u00F6nnen Sie mit der Buchung und Verwaltung von Reisen beginnen!",
                viewSubscription: 'Abonnements anzeigen',
                moreDetails: 'für mehr Details.',
                gotIt: 'Verstanden, danke',
            },
            _6.commonFeatures = {
                title: 'Zum Control-Plan upgraden',
                note: 'Entsperren Sie unsere leistungsstärksten Funktionen, einschließlich:',
                benefits: {
                    startsAt: 'Der Control-Plan beginnt bei',
                    perMember: 'pro aktivem Mitglied pro Monat.',
                    learnMore: 'Erfahren Sie mehr',
                    pricing: 'über unsere Pläne und Preise.',
                    benefit1: 'Erweiterte Buchhaltungsverbindungen (NetSuite, Sage Intacct und mehr)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Genehmigungsabläufe mit mehreren Ebenen',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    toUpgrade: 'Zum Upgrade klicken',
                    selectWorkspace: 'Wählen Sie einen Arbeitsbereich aus und ändern Sie den Plantyp in',
                },
            },
            _6),
        downgrade: {
            commonFeatures: {
                title: 'Zum Collect-Plan herabstufen',
                note: 'Wenn Sie ein Downgrade durchführen, verlieren Sie den Zugriff auf diese Funktionen und mehr:',
                benefits: {
                    note: 'Für einen vollständigen Vergleich unserer Pläne, schauen Sie sich unsere',
                    pricingPage: 'Preisseite',
                    confirm: 'Möchten Sie wirklich herabstufen und Ihre Konfigurationen entfernen?',
                    warning: 'Dies kann nicht rückgängig gemacht werden.',
                    benefit1: 'Buchhaltungsverbindungen (außer QuickBooks Online und Xero)',
                    benefit2: 'Intelligente Ausgabenregeln',
                    benefit3: 'Genehmigungsabläufe mit mehreren Ebenen',
                    benefit4: 'Erweiterte Sicherheitskontrollen',
                    headsUp: 'Achtung!',
                    multiWorkspaceNote: 'Sie müssen alle Ihre Arbeitsbereiche herabstufen, bevor Ihre erste monatliche Zahlung erfolgt, um ein Abonnement zum Collect-Tarif zu beginnen. Klicken Sie',
                    selectStep: '> Wählen Sie jeden Arbeitsbereich aus > Ändern Sie den Plantyp in',
                },
            },
            completed: {
                headline: 'Ihr Arbeitsbereich wurde herabgestuft',
                description: 'Sie haben andere Arbeitsbereiche im Control-Plan. Um zum Collect-Tarif abgerechnet zu werden, müssen Sie alle Arbeitsbereiche herabstufen.',
                gotIt: 'Verstanden, danke',
            },
        },
        payAndDowngrade: {
            title: 'Bezahlen & Herabstufen',
            headline: 'Ihre letzte Zahlung',
            description1: 'Ihre endgültige Rechnung für dieses Abonnement wird sein',
            description2: function (_a) {
                var date = _a.date;
                return "Siehe Ihre Aufschl\u00FCsselung unten f\u00FCr ".concat(date, ":");
            },
            subscription: 'Achtung! Diese Aktion beendet Ihr Expensify-Abonnement, löscht diesen Arbeitsbereich und entfernt alle Mitglieder des Arbeitsbereichs. Wenn Sie diesen Arbeitsbereich behalten und nur sich selbst entfernen möchten, lassen Sie zuerst einen anderen Administrator die Abrechnung übernehmen.',
            genericFailureMessage: 'Beim Bezahlen Ihrer Rechnung ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        restrictedAction: {
            restricted: 'Restricted',
            actionsAreCurrentlyRestricted: function (_a) {
                var workspaceName = _a.workspaceName;
                return "Aktionen im ".concat(workspaceName, "-Arbeitsbereich sind derzeit eingeschr\u00E4nkt.");
            },
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: function (_a) {
                var workspaceOwnerName = _a.workspaceOwnerName;
                return "Arbeitsbereichsinhaber, ".concat(workspaceOwnerName, ", muss die hinterlegte Zahlungskarte hinzuf\u00FCgen oder aktualisieren, um neue Aktivit\u00E4ten im Arbeitsbereich freizuschalten.");
            },
            youWillNeedToAddOrUpdatePaymentCard: 'Sie müssen die hinterlegte Zahlungskarte hinzufügen oder aktualisieren, um neue Workspace-Aktivitäten freizuschalten.',
            addPaymentCardToUnlock: 'Fügen Sie eine Zahlungskarte hinzu, um freizuschalten!',
            addPaymentCardToContinueUsingWorkspace: 'Fügen Sie eine Zahlungskarte hinzu, um diesen Arbeitsbereich weiterhin zu nutzen.',
            pleaseReachOutToYourWorkspaceAdmin: 'Bitte wenden Sie sich bei Fragen an Ihren Workspace-Administrator.',
            chatWithYourAdmin: 'Mit Ihrem Administrator chatten',
            chatInAdmins: 'Im #admins chatten',
            addPaymentCard: 'Zahlungskarte hinzufügen',
        },
        rules: {
            individualExpenseRules: {
                title: 'Ausgaben',
                subtitle: 'Legen Sie Ausgabenkontrollen und -standards für einzelne Ausgaben fest. Sie können auch Regeln für',
                receiptRequiredAmount: 'Beleg erforderlicher Betrag',
                receiptRequiredAmountDescription: 'Belege anfordern, wenn die Ausgaben diesen Betrag überschreiten, es sei denn, eine Kategorievorschrift hebt dies auf.',
                maxExpenseAmount: 'Maximaler Ausgabenbetrag',
                maxExpenseAmountDescription: 'Kennzeichnen Sie Ausgaben, die diesen Betrag überschreiten, es sei denn, sie werden durch eine Kategorievorschrift außer Kraft gesetzt.',
                maxAge: 'Maximales Alter',
                maxExpenseAge: 'Maximales Ausgabenalter',
                maxExpenseAgeDescription: 'Kennzeichnen Sie Ausgaben, die älter als eine bestimmte Anzahl von Tagen sind.',
                maxExpenseAgeDays: function () { return ({
                    one: '1 Tag',
                    other: function (count) { return "".concat(count, " Tage"); },
                }); },
                billableDefault: 'Abrechnungsstandard',
                billableDefaultDescription: 'Wählen Sie, ob Bar- und Kreditkartenausgaben standardmäßig abrechenbar sein sollen. Abrechenbare Ausgaben werden aktiviert oder deaktiviert in',
                billable: 'Abrechenbar',
                billableDescription: 'Spesen werden meist an Kunden weiterberechnet.',
                nonBillable: 'Nicht abrechenbar',
                nonBillableDescription: 'Spesen werden gelegentlich an Kunden weiterberechnet.',
                eReceipts: 'eReceipts',
                eReceiptsHint: 'eReceipts werden automatisch erstellt',
                eReceiptsHintLink: 'für die meisten USD-Kredittransaktionen',
                attendeeTracking: 'Teilnehmerverfolgung',
                attendeeTrackingHint: 'Verfolgen Sie die Kosten pro Person für jede Ausgabe.',
                prohibitedDefaultDescription: 'Markieren Sie alle Belege, auf denen Alkohol, Glücksspiel oder andere eingeschränkte Artikel erscheinen. Ausgaben mit Belegen, auf denen diese Positionen erscheinen, erfordern eine manuelle Überprüfung.',
                prohibitedExpenses: 'Verbotene Ausgaben',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Hotelnebenkosten',
                gambling: 'Glücksspiel',
                tobacco: 'Tabak',
                adultEntertainment: 'Erwachsenenunterhaltung',
            },
            expenseReportRules: {
                examples: 'Beispiele:',
                title: 'Spesenabrechnungen',
                subtitle: 'Automatisieren Sie die Einhaltung von Spesenabrechnungen, Genehmigungen und Zahlungen.',
                customReportNamesSubtitle: 'Passen Sie Berichtstitel mit unserem an',
                customNameTitle: 'Standardberichtstitel',
                customNameDescription: 'Wählen Sie einen benutzerdefinierten Namen für Spesenabrechnungen mit unserem',
                customNameDescriptionLink: 'umfassende Formeln',
                customNameInputLabel: 'Name',
                customNameEmailPhoneExample: 'E-Mail oder Telefon des Mitglieds: {report:submit:from}',
                customNameStartDateExample: 'Berichtsstartdatum: {report:startdate}',
                customNameWorkspaceNameExample: 'Workspace-Name: {report:workspacename}',
                customNameReportIDExample: 'Report-ID: {report:id}',
                customNameTotalExample: 'Gesamt: {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'Verhindern Sie, dass Mitglieder benutzerdefinierte Berichtsnamen ändern',
                preventSelfApprovalsTitle: 'Selbstgenehmigungen verhindern',
                preventSelfApprovalsSubtitle: 'Verhindern Sie, dass Arbeitsbereichsmitglieder ihre eigenen Spesenabrechnungen genehmigen.',
                autoApproveCompliantReportsTitle: 'Konforme Berichte automatisch genehmigen',
                autoApproveCompliantReportsSubtitle: 'Konfigurieren Sie, welche Spesenabrechnungen für die automatische Genehmigung infrage kommen.',
                autoApproveReportsUnderTitle: 'Berichte unter automatisch genehmigen',
                autoApproveReportsUnderDescription: 'Vollständig konforme Spesenabrechnungen unter diesem Betrag werden automatisch genehmigt.',
                randomReportAuditTitle: 'Zufällige Berichtprüfung',
                randomReportAuditDescription: 'Einige Berichte müssen manuell genehmigt werden, auch wenn sie für die automatische Genehmigung in Frage kommen.',
                autoPayApprovedReportsTitle: 'Automatisch genehmigte Berichte bezahlen',
                autoPayApprovedReportsSubtitle: 'Konfigurieren Sie, welche Spesenabrechnungen für die automatische Zahlung berechtigt sind.',
                autoPayApprovedReportsLimitError: function (_a) {
                    var _b = _a === void 0 ? {} : _a, currency = _b.currency;
                    return "Bitte geben Sie einen Betrag ein, der kleiner als ".concat(currency !== null && currency !== void 0 ? currency : '', "20.000 ist.");
                },
                autoPayApprovedReportsLockedSubtitle: 'Gehen Sie zu Weitere Funktionen und aktivieren Sie Workflows, dann fügen Sie Zahlungen hinzu, um diese Funktion freizuschalten.',
                autoPayReportsUnderTitle: 'Berichte unter Auto-Zahlung',
                autoPayReportsUnderDescription: 'Vollständig konforme Spesenabrechnungen unter diesem Betrag werden automatisch bezahlt.',
                unlockFeatureGoToSubtitle: 'Gehe zu',
                unlockFeatureEnableWorkflowsSubtitle: function (_a) {
                    var featureName = _a.featureName;
                    return "und Workflows aktivieren, dann ".concat(featureName, " hinzuf\u00FCgen, um diese Funktion freizuschalten.");
                },
                enableFeatureSubtitle: function (_a) {
                    var featureName = _a.featureName;
                    return "und aktivieren Sie ".concat(featureName, ", um diese Funktion freizuschalten.");
                },
            },
            categoryRules: {
                title: 'Kategorienregeln',
                approver: 'Genehmiger',
                requireDescription: 'Beschreibung erforderlich',
                descriptionHint: 'Beschreibungshinweis',
                descriptionHintDescription: function (_a) {
                    var categoryName = _a.categoryName;
                    return "Erinnern Sie die Mitarbeiter daran, zus\u00E4tzliche Informationen f\u00FCr Ausgaben der Kategorie \u201E".concat(categoryName, "\u201C bereitzustellen. Dieser Hinweis erscheint im Beschreibungsfeld der Ausgaben.");
                },
                descriptionHintLabel: 'Hinweis',
                descriptionHintSubtitle: 'Profi-Tipp: Je kürzer, desto besser!',
                maxAmount: 'Maximalbetrag',
                flagAmountsOver: 'Beträge über markieren',
                flagAmountsOverDescription: function (_a) {
                    var categoryName = _a.categoryName;
                    return "Gilt f\u00FCr die Kategorie \u201E".concat(categoryName, "\u201C.");
                },
                flagAmountsOverSubtitle: 'Dies überschreibt den Höchstbetrag für alle Ausgaben.',
                expenseLimitTypes: {
                    expense: 'Einzelausgabe',
                    expenseSubtitle: 'Beträge von Ausgaben nach Kategorie kennzeichnen. Diese Regel überschreibt die allgemeine Arbeitsbereichsregel für den maximalen Ausgabenbetrag.',
                    daily: 'Kategorietotal',
                    dailySubtitle: 'Gesamtausgaben pro Kategorie pro Spesenbericht kennzeichnen.',
                },
                requireReceiptsOver: 'Belege über erforderlich',
                requireReceiptsOverList: {
                    default: function (_a) {
                        var defaultAmount = _a.defaultAmount;
                        return "".concat(defaultAmount, " ").concat(CONST_1.default.DOT_SEPARATOR, " Standard");
                    },
                    never: 'Belege niemals verlangen',
                    always: 'Immer Belege anfordern',
                },
                defaultTaxRate: 'Standardsteuersatz',
                goTo: 'Gehe zu',
                andEnableWorkflows: 'und Workflows aktivieren, dann Genehmigungen hinzufügen, um diese Funktion freizuschalten.',
            },
            customRules: {
                title: 'Benutzerdefinierte Regeln',
                subtitle: 'Beschreibung',
                description: 'Benutzerdefinierte Regeln für Spesenabrechnungen eingeben',
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
                    description: 'Für Organisationen mit erweiterten Anforderungen.',
                },
            },
            description: 'Wählen Sie einen Plan, der zu Ihnen passt. Für eine detaillierte Liste der Funktionen und Preise, schauen Sie sich unsere',
            subscriptionLink: 'Planarten und Preishilfe-Seite',
            lockedPlanDescription: function (_a) {
                var count = _a.count, annualSubscriptionEndDate = _a.annualSubscriptionEndDate;
                return ({
                    one: "Sie haben sich verpflichtet, bis zum Ende Ihres Jahresabonnements am ".concat(annualSubscriptionEndDate, " 1 aktives Mitglied im Control-Plan zu haben. Sie k\u00F6nnen zu einem nutzungsbasierten Abonnement wechseln und ab dem ").concat(annualSubscriptionEndDate, " auf den Collect-Plan herabstufen, indem Sie die automatische Verl\u00E4ngerung deaktivieren."),
                    other: "Sie haben sich zu ".concat(count, " aktiven Mitgliedern im Control-Plan verpflichtet, bis Ihr Jahresabonnement am ").concat(annualSubscriptionEndDate, " endet. Sie k\u00F6nnen zu einem nutzungsbasierten Abonnement wechseln und ab dem ").concat(annualSubscriptionEndDate, " auf den Collect-Plan herabstufen, indem Sie die automatische Verl\u00E4ngerung deaktivieren in"),
                });
            },
            subscriptions: 'Abonnements',
        },
    },
    getAssistancePage: {
        title: 'Hilfe erhalten',
        subtitle: 'Wir sind hier, um Ihren Weg zur Größe freizumachen!',
        description: 'Wählen Sie aus den untenstehenden Support-Optionen:',
        chatWithConcierge: 'Chatten Sie mit Concierge',
        scheduleSetupCall: 'Einen Einrichtungstermin vereinbaren',
        scheduleACall: 'Anruf planen',
        questionMarkButtonTooltip: 'Holen Sie sich Unterstützung von unserem Team',
        exploreHelpDocs: 'Hilfe-Dokumente durchsuchen',
        registerForWebinar: 'Für das Webinar registrieren',
        onboardingHelp: 'Hilfe bei der Einführung',
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
            flags: 'Flaggen',
        },
    },
    newRoomPage: {
        newRoom: 'Neuer Raum',
        groupName: 'Gruppenname',
        roomName: 'Raumname',
        visibility: 'Sichtbarkeit',
        restrictedDescription: 'Personen in Ihrem Arbeitsbereich können diesen Raum finden.',
        privateDescription: 'Personen, die zu diesem Raum eingeladen wurden, können ihn finden.',
        publicDescription: 'Jeder kann diesen Raum finden',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Jeder kann diesen Raum finden',
        createRoom: 'Raum erstellen',
        roomAlreadyExistsError: 'Ein Raum mit diesem Namen existiert bereits.',
        roomNameReservedError: function (_a) {
            var reservedName = _a.reservedName;
            return "".concat(reservedName, " ist ein Standardraum in allen Arbeitsbereichen. Bitte w\u00E4hlen Sie einen anderen Namen.");
        },
        roomNameInvalidError: 'Raumnamen dürfen nur Kleinbuchstaben, Zahlen und Bindestriche enthalten.',
        pleaseEnterRoomName: 'Bitte geben Sie einen Raumnamen ein',
        pleaseSelectWorkspace: 'Bitte wählen Sie einen Arbeitsbereich aus',
        renamedRoomAction: function (_a) {
            var oldName = _a.oldName, newName = _a.newName, actorName = _a.actorName, isExpenseReport = _a.isExpenseReport;
            var actor = actorName ? "".concat(actorName, " ") : '';
            return isExpenseReport ? "".concat(actor, "umbenannt in \"").concat(newName, "\" (zuvor \"").concat(oldName, "\")") : "".concat(actor, " hat diesen Raum in \"").concat(newName, "\" umbenannt (vorher \"").concat(oldName, "\")");
        },
        roomRenamedTo: function (_a) {
            var newName = _a.newName;
            return "Raum umbenannt in ".concat(newName);
        },
        social: 'sozial',
        selectAWorkspace: 'Wählen Sie einen Arbeitsbereich aus',
        growlMessageOnRenameError: 'Der Arbeitsbereichsraum kann nicht umbenannt werden. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
        visibilityOptions: {
            restricted: 'Arbeitsbereich', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Privat',
            public: 'Öffentlich',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Öffentliche Ankündigung',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Einreichen und Schließen',
        submitAndApprove: 'Einreichen und Genehmigen',
        advanced: 'ADVANCED',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: function (_a) {
            var approverEmail = _a.approverEmail, approverName = _a.approverName, field = _a.field, name = _a.name;
            return "hat ".concat(approverName, " (").concat(approverEmail, ") als Genehmiger f\u00FCr das ").concat(field, " \"").concat(name, "\" hinzugef\u00FCgt");
        },
        deleteApprovalRule: function (_a) {
            var approverEmail = _a.approverEmail, approverName = _a.approverName, field = _a.field, name = _a.name;
            return "hat ".concat(approverName, " (").concat(approverEmail, ") als Genehmiger f\u00FCr das ").concat(field, " \"").concat(name, "\" entfernt");
        },
        updateApprovalRule: function (_a) {
            var field = _a.field, name = _a.name, newApproverEmail = _a.newApproverEmail, newApproverName = _a.newApproverName, oldApproverEmail = _a.oldApproverEmail, oldApproverName = _a.oldApproverName;
            var formatApprover = function (displayName, email) { return (displayName ? "".concat(displayName, " (").concat(email, ")") : email); };
            return "hat den Genehmiger f\u00FCr das ".concat(field, " \"").concat(name, "\" auf ").concat(formatApprover(newApproverName, newApproverEmail), " ge\u00E4ndert (zuvor ").concat(formatApprover(oldApproverName, oldApproverEmail), ")");
        },
        addCategory: function (_a) {
            var categoryName = _a.categoryName;
            return "hat die Kategorie \"".concat(categoryName, "\" hinzugef\u00FCgt");
        },
        deleteCategory: function (_a) {
            var categoryName = _a.categoryName;
            return "Kategorie \"".concat(categoryName, "\" entfernt");
        },
        updateCategory: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName;
            return "".concat(oldValue ? 'deaktiviert' : 'aktiviert', " die Kategorie \"").concat(categoryName, "\"");
        },
        updateCategoryPayrollCode: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName, newValue = _a.newValue;
            if (!oldValue) {
                return "hat den Gehaltscode \"".concat(newValue, "\" zur Kategorie \"").concat(categoryName, "\" hinzugef\u00FCgt");
            }
            if (!newValue && oldValue) {
                return "hat den Gehaltsabrechnungscode \"".concat(oldValue, "\" aus der Kategorie \"").concat(categoryName, "\" entfernt");
            }
            return "hat den Gehaltsabrechnungscode der Kategorie \u201E".concat(categoryName, "\u201C in \u201E").concat(newValue, "\u201C ge\u00E4ndert (zuvor \u201E").concat(oldValue, "\u201C)");
        },
        updateCategoryGLCode: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName, newValue = _a.newValue;
            if (!oldValue) {
                return "hat den GL-Code \"".concat(newValue, "\" zur Kategorie \"").concat(categoryName, "\" hinzugef\u00FCgt");
            }
            if (!newValue && oldValue) {
                return "hat den GL-Code \"".concat(oldValue, "\" aus der Kategorie \"").concat(categoryName, "\" entfernt");
            }
            return "hat den GL-Code der Kategorie \u201E".concat(categoryName, "\u201C in \u201E").concat(newValue, "\u201C ge\u00E4ndert (vorher \u201E").concat(oldValue, "\u201C)");
        },
        updateAreCommentsRequired: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName;
            return "\u00E4nderte die Beschreibung der Kategorie \"".concat(categoryName, "\" zu ").concat(!oldValue ? 'erforderlich' : 'nicht erforderlich', " (zuvor ").concat(!oldValue ? 'nicht erforderlich' : 'erforderlich', ")");
        },
        updateCategoryMaxExpenseAmount: function (_a) {
            var categoryName = _a.categoryName, oldAmount = _a.oldAmount, newAmount = _a.newAmount;
            if (newAmount && !oldAmount) {
                return "hat einen maximalen Betrag von ".concat(newAmount, " zur Kategorie \"").concat(categoryName, "\" hinzugef\u00FCgt");
            }
            if (oldAmount && !newAmount) {
                return "hat den maximalen Betrag von ".concat(oldAmount, " aus der Kategorie \"").concat(categoryName, "\" entfernt");
            }
            return "hat den maximalen Betrag der Kategorie \"".concat(categoryName, "\" auf ").concat(newAmount, " ge\u00E4ndert (zuvor ").concat(oldAmount, ")");
        },
        updateCategoryExpenseLimitType: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "hat einen Grenzwerttyp von ".concat(newValue, " zur Kategorie \"").concat(categoryName, "\" hinzugef\u00FCgt");
            }
            return "hat den Limit-Typ der Kategorie \"".concat(categoryName, "\" auf ").concat(newValue, " ge\u00E4ndert (vorher ").concat(oldValue, ")");
        },
        updateCategoryMaxAmountNoReceipt: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "hat die Kategorie \"".concat(categoryName, "\" aktualisiert, indem Belege in ").concat(newValue, " ge\u00E4ndert wurden");
            }
            return "hat die Kategorie \"".concat(categoryName, "\" auf ").concat(newValue, " ge\u00E4ndert (vorher ").concat(oldValue, ")");
        },
        setCategoryName: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "die Kategorie \"".concat(oldName, "\" in \"").concat(newName, "\" umbenannt");
        },
        updatedDescriptionHint: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!newValue) {
                return "hat den Beschreibungshinweis \"".concat(oldValue, "\" aus der Kategorie \"").concat(categoryName, "\" entfernt");
            }
            return !oldValue
                ? "hat den Beschreibungshinweis \"".concat(newValue, "\" zur Kategorie \"").concat(categoryName, "\" hinzugef\u00FCgt")
                : "hat den Hinweis zur Kategoriebeschreibung \"".concat(categoryName, "\" in \u201E").concat(newValue, "\u201C ge\u00E4ndert (vorher \u201E").concat(oldValue, "\u201C)");
        },
        updateTagListName: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "den Taglisten-Namen in \"".concat(newName, "\" ge\u00E4ndert (vorher \"").concat(oldName, "\")");
        },
        addTag: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName;
            return "hat das Tag \"".concat(tagName, "\" zur Liste \"").concat(tagListName, "\" hinzugef\u00FCgt");
        },
        updateTagName: function (_a) {
            var tagListName = _a.tagListName, newName = _a.newName, oldName = _a.oldName;
            return "hat die Tag-Liste \"".concat(tagListName, "\" aktualisiert, indem der Tag \"").concat(oldName, "\" in \"").concat(newName, "\" ge\u00E4ndert wurde");
        },
        updateTagEnabled: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName, enabled = _a.enabled;
            return "".concat(enabled ? 'aktiviert' : 'deaktiviert', " das Tag \"").concat(tagName, "\" in der Liste \"").concat(tagListName, "\"");
        },
        deleteTag: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName;
            return "hat den Tag \"".concat(tagName, "\" aus der Liste \"").concat(tagListName, "\" entfernt");
        },
        deleteMultipleTags: function (_a) {
            var count = _a.count, tagListName = _a.tagListName;
            return "entfernte \"".concat(count, "\" Tags aus der Liste \"").concat(tagListName, "\"");
        },
        updateTag: function (_a) {
            var tagListName = _a.tagListName, newValue = _a.newValue, tagName = _a.tagName, updatedField = _a.updatedField, oldValue = _a.oldValue;
            if (oldValue) {
                return "hat das Tag \"".concat(tagName, "\" in der Liste \"").concat(tagListName, "\" aktualisiert, indem das ").concat(updatedField, " auf \"").concat(newValue, "\" ge\u00E4ndert wurde (vorher \"").concat(oldValue, "\")");
            }
            return "hat das Tag \"".concat(tagName, "\" in der Liste \"").concat(tagListName, "\" aktualisiert, indem ein ").concat(updatedField, " von \"").concat(newValue, "\" hinzugef\u00FCgt wurde");
        },
        updateCustomUnit: function (_a) {
            var customUnitName = _a.customUnitName, newValue = _a.newValue, oldValue = _a.oldValue, updatedField = _a.updatedField;
            return "\u00E4nderte die ".concat(customUnitName, " ").concat(updatedField, " zu \"").concat(newValue, "\" (zuvor \"").concat(oldValue, "\")");
        },
        updateCustomUnitTaxEnabled: function (_a) {
            var newValue = _a.newValue;
            return "".concat(newValue ? 'aktiviert' : 'deaktiviert', " Steuerverfolgung bei Entfernungsraten");
        },
        addCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, rateName = _a.rateName;
            return "hat einen neuen \"".concat(customUnitName, "\"-Satz \"").concat(rateName, "\" hinzugef\u00FCgt");
        },
        updatedCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, oldValue = _a.oldValue, updatedField = _a.updatedField;
            return "hat den Satz des ".concat(customUnitName, " ").concat(updatedField, " \"").concat(customUnitRateName, "\" auf \"").concat(newValue, "\" ge\u00E4ndert (zuvor \"").concat(oldValue, "\")");
        },
        updatedCustomUnitTaxRateExternalID: function (_a) {
            var customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, newTaxPercentage = _a.newTaxPercentage, oldTaxPercentage = _a.oldTaxPercentage, oldValue = _a.oldValue;
            if (oldTaxPercentage && oldValue) {
                return "hat den Steuersatz f\u00FCr den Distanzsatz \"".concat(customUnitRateName, "\" auf \"").concat(newValue, " (").concat(newTaxPercentage, ")\" ge\u00E4ndert (zuvor \"").concat(oldValue, " (").concat(oldTaxPercentage, ")\")");
            }
            return "hat den Steuersatz \"".concat(newValue, " (").concat(newTaxPercentage, ")\" zum Distanzsatz \"").concat(customUnitRateName, "\" hinzugef\u00FCgt");
        },
        updatedCustomUnitTaxClaimablePercentage: function (_a) {
            var customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, oldValue = _a.oldValue;
            if (oldValue) {
                return "hat den erstattungsf\u00E4higen Steueranteil am Distanzsatz \"".concat(customUnitRateName, "\" auf \"").concat(newValue, "\" ge\u00E4ndert (zuvor \"").concat(oldValue, "\")");
            }
            return "hat einen steuerlich absetzbaren Anteil von \"".concat(newValue, "\" zum Distanzsatz \"").concat(customUnitRateName, "\" hinzugef\u00FCgt");
        },
        deleteCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, rateName = _a.rateName;
            return "entfernte den \"".concat(customUnitName, "\"-Satz \"").concat(rateName, "\"");
        },
        addedReportField: function (_a) {
            var fieldType = _a.fieldType, fieldName = _a.fieldName;
            return "hinzugef\u00FCgtes ".concat(fieldType, " Berichts-Feld \"").concat(fieldName, "\"");
        },
        updateReportFieldDefaultValue: function (_a) {
            var defaultValue = _a.defaultValue, fieldName = _a.fieldName;
            return "den Standardwert des Berichtsfeldes \"".concat(fieldName, "\" auf \"").concat(defaultValue, "\" setzen");
        },
        addedReportFieldOption: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName;
            return "die Option \"".concat(optionName, "\" zum Berichtsfeld \"").concat(fieldName, "\" hinzugef\u00FCgt");
        },
        removedReportFieldOption: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName;
            return "hat die Option \"".concat(optionName, "\" aus dem Berichtsfeld \"").concat(fieldName, "\" entfernt");
        },
        updateReportFieldOptionDisabled: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName, optionEnabled = _a.optionEnabled;
            return "".concat(optionEnabled ? 'aktiviert' : 'deaktiviert', " die Option \"").concat(optionName, "\" f\u00FCr das Berichtsfeld \"").concat(fieldName, "\"");
        },
        updateReportFieldAllOptionsDisabled: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName, allEnabled = _a.allEnabled, toggledOptionsCount = _a.toggledOptionsCount;
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return "".concat(allEnabled ? 'aktiviert' : 'deaktiviert', " alle Optionen f\u00FCr das Berichtsfeld \"").concat(fieldName, "\"");
            }
            return "".concat(allEnabled ? 'aktiviert' : 'deaktiviert', " die Option \"").concat(optionName, "\" f\u00FCr das Berichtsfeld \"").concat(fieldName, "\", wodurch alle Optionen ").concat(allEnabled ? 'aktiviert' : 'deaktiviert');
        },
        deleteReportField: function (_a) {
            var fieldType = _a.fieldType, fieldName = _a.fieldName;
            return "entferntes ".concat(fieldType, "-Berichtsfeld \"").concat(fieldName, "\"");
        },
        preventSelfApproval: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "aktualisiert \"Prevent self-approval\" auf \"".concat(newValue === 'true' ? 'Aktiviert' : 'Deaktiviert', "\" (zuvor \"").concat(oldValue === 'true' ? 'Aktiviert' : 'Deaktiviert', "\")");
        },
        updateMaxExpenseAmountNoReceipt: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "hat den maximal erforderlichen Belegbetrag auf ".concat(newValue, " ge\u00E4ndert (vorher ").concat(oldValue, ")");
        },
        updateMaxExpenseAmount: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "hat den maximalen Ausgabenbetrag f\u00FCr Verst\u00F6\u00DFe auf ".concat(newValue, " ge\u00E4ndert (zuvor ").concat(oldValue, ")");
        },
        updateMaxExpenseAge: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "aktualisiert \"Maximales Ausgabenalter (Tage)\" auf \"".concat(newValue, "\" (zuvor \"").concat(oldValue === 'false' ? CONST_1.default.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue, "\")");
        },
        updateMonthlyOffset: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "Legen Sie das Einreichungsdatum des Monatsberichts auf \"".concat(newValue, "\" fest.");
            }
            return "das Einreichungsdatum des monatlichen Berichts auf \"".concat(newValue, "\" aktualisiert (zuvor \"").concat(oldValue, "\")");
        },
        updateDefaultBillable: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "aktualisiert \"Kosten an Kunden weiterberechnen\" auf \"".concat(newValue, "\" (vorher \"").concat(oldValue, "\")");
        },
        updateDefaultTitleEnforced: function (_a) {
            var value = _a.value;
            return "\"Standardberichtstitel erzwingen\" ".concat(value ? 'on' : 'aus');
        },
        renamedWorkspaceNameAction: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "hat den Namen dieses Arbeitsbereichs in \"".concat(newName, "\" ge\u00E4ndert (vorher \"").concat(oldName, "\")");
        },
        updateWorkspaceDescription: function (_a) {
            var newDescription = _a.newDescription, oldDescription = _a.oldDescription;
            return !oldDescription
                ? "Setzen Sie die Beschreibung dieses Arbeitsbereichs auf \"".concat(newDescription, "\".")
                : "hat die Beschreibung dieses Arbeitsbereichs auf \"".concat(newDescription, "\" aktualisiert (zuvor \"").concat(oldDescription, "\")");
        },
        removedFromApprovalWorkflow: function (_a) {
            var _b;
            var submittersNames = _a.submittersNames;
            var joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = (_b = submittersNames.at(0)) !== null && _b !== void 0 ? _b : '';
            }
            else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('und');
            }
            else if (submittersNames.length > 2) {
                joinedNames = "".concat(submittersNames.slice(0, submittersNames.length - 1).join(', '), " and ").concat(submittersNames.at(-1));
            }
            return {
                one: "hat Sie aus dem Genehmigungsworkflow und dem Ausgaben-Chat von ".concat(joinedNames, " entfernt. Bereits eingereichte Berichte bleiben zur Genehmigung in Ihrem Posteingang verf\u00FCgbar."),
                other: "hat dich aus den Genehmigungs-Workflows und Ausgaben-Chats von ".concat(joinedNames, " entfernt. Bereits eingereichte Berichte bleiben zur Genehmigung in deinem Posteingang verf\u00FCgbar."),
            };
        },
        demotedFromWorkspace: function (_a) {
            var policyName = _a.policyName, oldRole = _a.oldRole;
            return "hat Ihre Rolle in ".concat(policyName, " von ").concat(oldRole, " zu Benutzer aktualisiert. Sie wurden aus allen Einreicher-Ausgabenchats entfernt, au\u00DFer Ihrem eigenen.");
        },
        updatedWorkspaceCurrencyAction: function (_a) {
            var oldCurrency = _a.oldCurrency, newCurrency = _a.newCurrency;
            return "die Standardw\u00E4hrung auf ".concat(newCurrency, " aktualisiert (zuvor ").concat(oldCurrency, ")");
        },
        updatedWorkspaceFrequencyAction: function (_a) {
            var oldFrequency = _a.oldFrequency, newFrequency = _a.newFrequency;
            return "hat die automatische Berichterstattungsh\u00E4ufigkeit auf \"".concat(newFrequency, "\" aktualisiert (zuvor \"").concat(oldFrequency, "\")");
        },
        updateApprovalMode: function (_a) {
            var newValue = _a.newValue, oldValue = _a.oldValue;
            return "hat den Genehmigungsmodus auf \"".concat(newValue, "\" aktualisiert (zuvor \"").concat(oldValue, "\")");
        },
        upgradedWorkspace: 'dieses Arbeitsbereich auf den Control-Plan hochgestuft',
        downgradedWorkspace: 'hat dieses Arbeitsbereich auf den Collect-Plan herabgestuft',
        updatedAuditRate: function (_a) {
            var oldAuditRate = _a.oldAuditRate, newAuditRate = _a.newAuditRate;
            return "\u00E4nderte die Rate der Berichte, die zuf\u00E4llig zur manuellen Genehmigung weitergeleitet werden, auf ".concat(Math.round(newAuditRate * 100), "% (zuvor ").concat(Math.round(oldAuditRate * 100), "%)");
        },
        updatedManualApprovalThreshold: function (_a) {
            var oldLimit = _a.oldLimit, newLimit = _a.newLimit;
            return "hat das manuelle Genehmigungslimit f\u00FCr alle Ausgaben auf ".concat(newLimit, " ge\u00E4ndert (vorher ").concat(oldLimit, ")");
        },
    },
    roomMembersPage: {
        memberNotFound: 'Mitglied nicht gefunden.',
        useInviteButton: 'Um ein neues Mitglied zum Chat einzuladen, verwenden Sie bitte die Einladungs-Schaltfläche oben.',
        notAuthorized: "Sie haben keinen Zugriff auf diese Seite. Wenn Sie versuchen, diesem Raum beizutreten, bitten Sie einfach ein Mitglied des Raums, Sie hinzuzuf\u00FCgen. Etwas anderes? Wenden Sie sich an ".concat(CONST_1.default.EMAIL.CONCIERGE),
        removeMembersPrompt: function (_a) {
            var memberName = _a.memberName;
            return ({
                one: "M\u00F6chten Sie ".concat(memberName, " wirklich aus dem Raum entfernen?"),
                other: 'Möchten Sie die ausgewählten Mitglieder wirklich aus dem Raum entfernen?',
            });
        },
        error: {
            genericAdd: 'Es gab ein Problem beim Hinzufügen dieses Raummitglieds.',
        },
    },
    newTaskPage: {
        assignTask: 'Aufgabe zuweisen',
        assignMe: 'Mir zuweisen',
        confirmTask: 'Aufgabe bestätigen',
        confirmError: 'Bitte geben Sie einen Titel ein und wählen Sie ein Freigabeziel aus.',
        descriptionOptional: 'Beschreibung (optional)',
        pleaseEnterTaskName: 'Bitte geben Sie einen Titel ein',
        pleaseEnterTaskDestination: 'Bitte wählen Sie aus, wo Sie diese Aufgabe teilen möchten.',
    },
    task: {
        task: 'Aufgabe',
        title: 'Titel',
        description: 'Beschreibung',
        assignee: 'Zugewiesene Person',
        completed: 'Abgeschlossen',
        action: 'Vervollständigen',
        messages: {
            created: function (_a) {
                var title = _a.title;
                return "Aufgabe f\u00FCr ".concat(title);
            },
            completed: 'als abgeschlossen markiert',
            canceled: 'gelöschte Aufgabe',
            reopened: 'als unvollständig markiert',
            error: 'Sie haben keine Berechtigung, die angeforderte Aktion auszuführen.',
        },
        markAsComplete: 'Als abgeschlossen markieren',
        markAsIncomplete: 'Als unvollständig markieren',
        assigneeError: 'Beim Zuweisen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie es mit einem anderen Beauftragten.',
        genericCreateTaskFailureMessage: 'Beim Erstellen dieser Aufgabe ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.',
        deleteTask: 'Aufgabe löschen',
        deleteConfirmation: 'Möchten Sie diese Aufgabe wirklich löschen?',
    },
    statementPage: {
        title: function (_a) {
            var year = _a.year, monthName = _a.monthName;
            return "".concat(monthName, " ").concat(year, " Abrechnung");
        },
    },
    keyboardShortcutsPage: {
        title: 'Tastenkombinationen',
        subtitle: 'Sparen Sie Zeit mit diesen praktischen Tastenkombinationen:',
        shortcuts: {
            openShortcutDialog: 'Öffnet den Dialog für Tastenkombinationen',
            markAllMessagesAsRead: 'Alle Nachrichten als gelesen markieren',
            escape: 'Dialoge verlassen',
            search: 'Suchdialog öffnen',
            newChat: 'Neuer Chatbildschirm',
            copy: 'Kommentar kopieren',
            openDebug: 'Öffnen Sie das Dialogfeld für Testeinstellungen',
        },
    },
    guides: {
        screenShare: 'Bildschirmfreigabe',
        screenShareRequest: 'Expensify lädt Sie zu einer Bildschirmfreigabe ein',
    },
    search: {
        resultsAreLimited: 'Suchergebnisse sind begrenzt.',
        viewResults: 'Ergebnisse anzeigen',
        resetFilters: 'Filter zurücksetzen',
        searchResults: {
            emptyResults: {
                title: 'Nichts zu zeigen',
                subtitle: 'Versuchen Sie, Ihre Suchkriterien anzupassen oder etwas mit dem grünen + Button zu erstellen.',
            },
            emptyExpenseResults: {
                title: 'Sie haben noch keine Ausgaben erstellt.',
                subtitle: 'Erstellen Sie eine Ausgabe oder machen Sie eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwenden Sie die grüne Schaltfläche unten, um eine Ausgabe zu erstellen.',
            },
            emptyReportResults: {
                title: 'Sie haben noch keine Berichte erstellt.',
                subtitle: 'Erstellen Sie einen Bericht oder machen Sie eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwenden Sie die grüne Schaltfläche unten, um einen Bericht zu erstellen.',
            },
            emptyInvoiceResults: {
                title: 'Sie haben noch keine Rechnungen erstellt.',
                subtitle: 'Senden Sie eine Rechnung oder machen Sie eine Probefahrt mit Expensify, um mehr zu erfahren.',
                subtitleWithOnlyCreateButton: 'Verwenden Sie die grüne Schaltfläche unten, um eine Rechnung zu senden.',
            },
            emptyTripResults: {
                title: 'Keine Reisen anzuzeigen',
                subtitle: 'Beginnen Sie, indem Sie unten Ihre erste Reise buchen.',
                buttonText: 'Eine Reise buchen',
            },
            emptySubmitResults: {
                title: 'Keine Ausgaben zum Einreichen',
                subtitle: 'Alles klar. Mach eine Ehrenrunde!',
                buttonText: 'Bericht erstellen',
            },
            emptyApproveResults: {
                title: 'Keine Ausgaben zur Genehmigung',
                subtitle: 'Null Ausgaben. Maximale Entspannung. Gut gemacht!',
            },
            emptyPayResults: {
                title: 'Keine Ausgaben zu bezahlen',
                subtitle: 'Herzlichen Glückwunsch! Du hast die Ziellinie überquert.',
            },
            emptyExportResults: {
                title: 'Keine Ausgaben zum Exportieren',
                subtitle: 'Zeit, es ruhig angehen zu lassen, gute Arbeit.',
            },
            emptyUnapprovedResults: {
                title: 'Keine Ausgaben zur Genehmigung',
                subtitle: 'Null Ausgaben. Maximale Entspannung. Gut gemacht!',
            },
        },
        unapproved: 'Nicht bewilligt',
        unapprovedCash: 'Nicht genehmigtes Bargeld',
        unapprovedCompanyCards: 'Nicht genehmigte Firmenkarten',
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
            hold: 'Halten',
            unhold: 'Halten entfernen',
            noOptionsAvailable: 'Keine Optionen verfügbar für die ausgewählte Gruppe von Ausgaben.',
        },
        filtersHeader: 'Filter',
        filters: {
            date: {
                before: function (_a) {
                    var _b = _a === void 0 ? {} : _a, date = _b.date;
                    return "Vor ".concat(date !== null && date !== void 0 ? date : '');
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
                    _7[CONST_1.default.SEARCH.DATE_PRESETS.NEVER] = 'Niemals',
                    _7[CONST_1.default.SEARCH.DATE_PRESETS.LAST_MONTH] = 'Letzter Monat',
                    _7),
            },
            status: 'Status',
            keyword: 'Schlüsselwort',
            hasKeywords: 'Hat Schlüsselwörter',
            currency: 'Währung',
            link: 'Link',
            pinned: 'Angeheftet',
            unread: 'Ungelesen',
            completed: 'Abgeschlossen',
            amount: {
                lessThan: function (_a) {
                    var _b = _a === void 0 ? {} : _a, amount = _b.amount;
                    return "Weniger als ".concat(amount !== null && amount !== void 0 ? amount : '');
                },
                greaterThan: function (_a) {
                    var _b = _a === void 0 ? {} : _a, amount = _b.amount;
                    return "Gr\u00F6\u00DFer als ".concat(amount !== null && amount !== void 0 ? amount : '');
                },
                between: function (_a) {
                    var greaterThan = _a.greaterThan, lessThan = _a.lessThan;
                    return "Zwischen ".concat(greaterThan, " und ").concat(lessThan);
                },
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Individuelle Karten',
                closedCards: 'Geschlossene Karten',
                cardFeeds: 'Karten-Feeds',
                cardFeedName: function (_a) {
                    var cardFeedBankName = _a.cardFeedBankName, cardFeedLabel = _a.cardFeedLabel;
                    return "Alle ".concat(cardFeedBankName).concat(cardFeedLabel ? " - ".concat(cardFeedLabel) : '');
                },
                cardFeedNameCSV: function (_a) {
                    var cardFeedLabel = _a.cardFeedLabel;
                    return "All CSV Imported Cards".concat(cardFeedLabel ? " - ".concat(cardFeedLabel) : '');
                },
            },
            current: 'Aktuell',
            past: 'Vergangenheit',
            submitted: 'Eingereichtes Datum',
            approved: 'Genehmigtes Datum',
            paid: 'Zahlungsdatum',
            exported: 'Exportiertes Datum',
            posted: 'Buchungsdatum',
            billable: 'Abrechenbar',
            reimbursable: 'Erstattungsfähig',
            groupBy: {
                reports: 'Bericht',
                members: 'Mitglied',
                cards: 'Karte',
            },
        },
        groupBy: 'Gruppe nach',
        moneyRequestReport: {
            emptyStateTitle: 'Dieser Bericht enthält keine Ausgaben.',
            emptyStateSubtitle: 'Sie können Ausgaben zu diesem Bericht hinzufügen, indem Sie die Schaltfläche oben verwenden.',
        },
        noCategory: 'Keine Kategorie',
        noTag: 'Kein Tag',
        expenseType: 'Ausgabentyp',
        recentSearches: 'Letzte Suchanfragen',
        recentChats: 'Letzte Chats',
        searchIn: 'Suche in',
        searchPlaceholder: 'Nach etwas suchen',
        suggestions: 'Vorschläge',
        exportSearchResults: {
            title: 'Export erstellen',
            description: 'Wow, das sind viele Artikel! Wir werden sie zusammenpacken, und Concierge wird Ihnen in Kürze eine Datei senden.',
        },
        exportAll: {
            selectAllMatchingItems: 'Alle passenden Elemente auswählen',
            allMatchingItemsSelected: 'Alle übereinstimmenden Elemente ausgewählt',
        },
    },
    genericErrorPage: {
        title: 'Oh-oh, etwas ist schiefgelaufen!',
        body: {
            helpTextMobile: 'Bitte schließen und öffnen Sie die App erneut oder wechseln Sie zu',
            helpTextWeb: 'web.',
            helpTextConcierge: 'Wenn das Problem weiterhin besteht, wenden Sie sich an',
        },
        refresh: 'Aktualisieren',
    },
    fileDownload: {
        success: {
            title: 'Heruntergeladen!',
            message: 'Anhang erfolgreich heruntergeladen!',
            qrMessage: 'Überprüfen Sie Ihren Fotos- oder Downloads-Ordner auf eine Kopie Ihres QR-Codes. Tipp: Fügen Sie ihn einer Präsentation hinzu, damit Ihr Publikum ihn scannen und direkt mit Ihnen in Verbindung treten kann.',
        },
        generalError: {
            title: 'Anlagenfehler',
            message: 'Anhang kann nicht heruntergeladen werden',
        },
        permissionError: {
            title: 'Speicherzugriff',
            message: 'Expensify kann Anhänge ohne Speicherzugriff nicht speichern. Tippen Sie auf Einstellungen, um die Berechtigungen zu aktualisieren.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Neues Expensify',
        about: 'Über New Expensify',
        update: 'Neues Expensify aktualisieren',
        checkForUpdates: 'Nach Updates suchen',
        toggleDevTools: 'Entwicklerwerkzeuge umschalten',
        viewShortcuts: 'Tastenkombinationen anzeigen',
        services: 'Dienstleistungen',
        hide: 'Neues Expensify ausblenden',
        hideOthers: 'Andere ausblenden',
        showAll: 'Alle anzeigen',
        quit: 'Beende New Expensify',
        fileMenu: 'Datei',
        closeWindow: 'Fenster schließen',
        editMenu: 'Bearbeiten',
        undo: 'Rückgängig machen',
        redo: 'Wiederholen',
        cut: 'Schneiden',
        copy: 'Kopieren',
        paste: 'Einfügen',
        pasteAndMatchStyle: 'Einfügen und Stil anpassen',
        pasteAsPlainText: 'Als unformatierter Text einfügen',
        delete: 'Löschen',
        selectAll: 'Alle auswählen',
        speechSubmenu: 'Rede',
        startSpeaking: 'Sprechen Sie los',
        stopSpeaking: 'Hör auf zu sprechen',
        viewMenu: 'Ansicht',
        reload: 'Neu laden',
        forceReload: 'Erneut Laden Erzwingen',
        resetZoom: 'Tatsächliche Größe',
        zoomIn: 'Vergrößern',
        zoomOut: 'Verkleinern',
        togglefullscreen: 'Vollbild umschalten',
        historyMenu: 'Verlauf',
        back: 'Zurück',
        forward: 'Weiterleiten',
        windowMenu: 'Fenster',
        minimize: 'Minimieren',
        zoom: 'Zoom',
        front: 'Alle nach vorne bringen',
        helpMenu: 'Hilfe',
        learnMore: 'Erfahren Sie mehr',
        documentation: 'Dokumentation',
        communityDiscussions: 'Community-Diskussionen',
        searchIssues: 'Probleme durchsuchen',
    },
    historyMenu: {
        forward: 'Weiterleiten',
        back: 'Zurück',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Update verfügbar',
            message: function (_a) {
                var isSilentUpdating = _a.isSilentUpdating;
                return "Die neue Version wird in K\u00FCrze verf\u00FCgbar sein.".concat(!isSilentUpdating ? 'Wir benachrichtigen Sie, wenn wir bereit sind, das Update durchzuführen.' : '');
            },
            soundsGood: 'Klingt gut',
        },
        notAvailable: {
            title: 'Aktualisierung nicht verfügbar',
            message: 'Es ist derzeit kein Update verfügbar. Bitte später erneut prüfen!',
            okay: 'Okay',
        },
        error: {
            title: 'Aktualisierungsprüfung fehlgeschlagen',
            message: 'Wir konnten nicht nach einem Update suchen. Bitte versuchen Sie es in Kürze erneut.',
        },
    },
    report: {
        newReport: {
            createReport: 'Bericht erstellen',
            chooseWorkspace: 'Wählen Sie einen Arbeitsbereich für diesen Bericht aus.',
        },
        genericCreateReportFailureMessage: 'Unerwarteter Fehler beim Erstellen dieses Chats. Bitte versuchen Sie es später erneut.',
        genericAddCommentFailureMessage: 'Unerwarteter Fehler beim Posten des Kommentars. Bitte versuchen Sie es später noch einmal.',
        genericUpdateReportFieldFailureMessage: 'Unerwarteter Fehler beim Aktualisieren des Feldes. Bitte versuchen Sie es später erneut.',
        genericUpdateReportNameEditFailureMessage: 'Unerwarteter Fehler beim Umbenennen des Berichts. Bitte versuchen Sie es später erneut.',
        noActivityYet: 'Noch keine Aktivität',
        actions: {
            type: {
                changeField: function (_a) {
                    var oldValue = _a.oldValue, newValue = _a.newValue, fieldName = _a.fieldName;
                    return "ge\u00E4ndert ".concat(fieldName, " von ").concat(oldValue, " zu ").concat(newValue);
                },
                changeFieldEmpty: function (_a) {
                    var newValue = _a.newValue, fieldName = _a.fieldName;
                    return "".concat(fieldName, " in ").concat(newValue, " ge\u00E4ndert");
                },
                changeReportPolicy: function (_a) {
                    var fromPolicyName = _a.fromPolicyName, toPolicyName = _a.toPolicyName;
                    return "hat den Arbeitsbereich in ".concat(toPolicyName).concat(fromPolicyName ? "(vorher ".concat(fromPolicyName, ")") : '', " ge\u00E4ndert");
                },
                changeType: function (_a) {
                    var oldType = _a.oldType, newType = _a.newType;
                    return "Typ von ".concat(oldType, " zu ").concat(newType, " ge\u00E4ndert");
                },
                delegateSubmit: function (_a) {
                    var delegateUser = _a.delegateUser, originalManager = _a.originalManager;
                    return "diesen Bericht an ".concat(delegateUser, " gesendet, da ").concat(originalManager, " im Urlaub ist");
                },
                exportedToCSV: "in CSV exportiert",
                exportedToIntegration: {
                    automatic: function (_a) {
                        var label = _a.label;
                        return "exportiert nach ".concat(label);
                    },
                    automaticActionOne: function (_a) {
                        var label = _a.label;
                        return "exportiert nach ".concat(label, " \u00FCber");
                    },
                    automaticActionTwo: 'Buchhaltungseinstellungen',
                    manual: function (_a) {
                        var label = _a.label;
                        return "hat diesen Bericht als manuell exportiert nach ".concat(label, " markiert.");
                    },
                    automaticActionThree: 'und erfolgreich einen Datensatz erstellt für',
                    reimburseableLink: 'Auslagen',
                    nonReimbursableLink: 'Unternehmensausgaben mit Firmenkarte',
                    pending: function (_a) {
                        var label = _a.label;
                        return "hat begonnen, diesen Bericht nach ".concat(label, " zu exportieren...");
                    },
                },
                integrationsMessage: function (_a) {
                    var errorMessage = _a.errorMessage, label = _a.label, linkText = _a.linkText, linkURL = _a.linkURL;
                    return "Fehler beim Exportieren dieses Berichts nach ".concat(label, " (\"").concat(errorMessage, " ").concat(linkText ? "<a href=\"".concat(linkURL, "\">").concat(linkText, "</a>") : '', "\")");
                },
                managerAttachReceipt: "hat eine Quittung hinzugef\u00FCgt",
                managerDetachReceipt: "einen Beleg entfernt",
                markedReimbursed: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "".concat(currency).concat(amount, " anderswo bezahlt");
                },
                markedReimbursedFromIntegration: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "bezahlte ".concat(currency).concat(amount, " \u00FCber Integration");
                },
                outdatedBankAccount: "konnte die Zahlung aufgrund eines Problems mit dem Bankkonto des Zahlers nicht verarbeiten",
                reimbursementACHBounce: "Konnte die Zahlung nicht verarbeiten, da der Zahler nicht \u00FCber ausreichende Mittel verf\u00FCgt.",
                reimbursementACHCancelled: "die Zahlung storniert",
                reimbursementAccountChanged: "Konnte die Zahlung nicht verarbeiten, da der Zahler die Bankkonten gewechselt hat.",
                reimbursementDelayed: "hat die Zahlung bearbeitet, aber sie verz\u00F6gert sich um 1-2 weitere Werktage",
                selectedForRandomAudit: "zuf\u00E4llig zur \u00DCberpr\u00FCfung ausgew\u00E4hlt",
                selectedForRandomAuditMarkdown: "[zuf\u00E4llig ausgew\u00E4hlt](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) zur \u00DCberpr\u00FCfung",
                share: function (_a) {
                    var to = _a.to;
                    return "eingeladenes Mitglied ".concat(to);
                },
                unshare: function (_a) {
                    var to = _a.to;
                    return "Mitglied ".concat(to, " entfernt");
                },
                stripePaid: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "bezahlt ".concat(currency).concat(amount);
                },
                takeControl: "\u00FCbernahm die Kontrolle",
                integrationSyncFailed: function (_a) {
                    var label = _a.label, errorMessage = _a.errorMessage, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "Beim Synchronisieren mit ".concat(label, " ist ein Problem aufgetreten").concat(errorMessage ? " (\"".concat(errorMessage, "\")") : '', ". Bitte behebe das Problem in den <a href=\"").concat(workspaceAccountingLink, "\">Arbeitsbereichseinstellungen</a>.");
                },
                addEmployee: function (_a) {
                    var email = _a.email, role = _a.role;
                    return "hinzugef\u00FCgt ".concat(email, " als ").concat(role === 'member' ? 'a' : 'an', " ").concat(role);
                },
                updateRole: function (_a) {
                    var email = _a.email, currentRole = _a.currentRole, newRole = _a.newRole;
                    return "hat die Rolle von ".concat(email, " auf ").concat(newRole, " aktualisiert (zuvor ").concat(currentRole, ")");
                },
                updatedCustomField1: function (_a) {
                    var email = _a.email, previousValue = _a.previousValue, newValue = _a.newValue;
                    if (!newValue) {
                        return "hat das benutzerdefinierte Feld 1 von ".concat(email, " entfernt (zuvor \"").concat(previousValue, "\")");
                    }
                    return !previousValue
                        ? "\"".concat(newValue, "\" zu benutzerdefiniertem Feld 1 von ").concat(email, " hinzugef\u00FCgt")
                        : "hat das benutzerdefinierte Feld 1 von ".concat(email, " in \"").concat(newValue, "\" ge\u00E4ndert (vorher \"").concat(previousValue, "\")");
                },
                updatedCustomField2: function (_a) {
                    var email = _a.email, previousValue = _a.previousValue, newValue = _a.newValue;
                    if (!newValue) {
                        return "entfernte benutzerdefiniertes Feld 2 von ".concat(email, " (vorher \"").concat(previousValue, "\")");
                    }
                    return !previousValue
                        ? "\"".concat(newValue, "\" zu benutzerdefiniertem Feld 2 von ").concat(email, " hinzugef\u00FCgt")
                        : "\u00E4nderte das benutzerdefinierte Feld 2 von ".concat(email, " zu \"").concat(newValue, "\" (vorher \"").concat(previousValue, "\")");
                },
                leftWorkspace: function (_a) {
                    var nameOrEmail = _a.nameOrEmail;
                    return "".concat(nameOrEmail, " hat den Arbeitsbereich verlassen");
                },
                removeMember: function (_a) {
                    var email = _a.email, role = _a.role;
                    return "entfernt ".concat(role, " ").concat(email);
                },
                removedConnection: function (_a) {
                    var connectionName = _a.connectionName;
                    return "Verbindung zu ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], " entfernt");
                },
                addedConnection: function (_a) {
                    var connectionName = _a.connectionName;
                    return "verbunden mit ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
                },
                leftTheChat: 'hat den Chat verlassen',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: function (_a) {
            var summary = _a.summary, dayCount = _a.dayCount, date = _a.date;
            return "".concat(summary, " f\u00FCr ").concat(dayCount, " ").concat(dayCount === 1 ? 'Tag' : 'Tage', " bis ").concat(date);
        },
        oooEventSummaryPartialDay: function (_a) {
            var summary = _a.summary, timePeriod = _a.timePeriod, date = _a.date;
            return "".concat(summary, " von ").concat(timePeriod, " am ").concat(date);
        },
    },
    footer: {
        features: 'Funktionen',
        expenseManagement: 'Ausgabenverwaltung',
        spendManagement: 'Ausgabenmanagement',
        expenseReports: 'Spesenabrechnungen',
        companyCreditCard: 'Unternehmens-Kreditkarte',
        receiptScanningApp: 'Beleg-Scan-App',
        billPay: 'Bill Pay',
        invoicing: 'Rechnungsstellung',
        CPACard: 'CPA-Karte',
        payroll: 'Gehaltsabrechnung',
        travel: 'Reisen',
        resources: 'Ressourcen',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Pressemappe',
        support: 'Unterstützung',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Nutzungsbedingungen',
        privacy: 'Datenschutz',
        learnMore: 'Mehr erfahren',
        aboutExpensify: 'Über Expensify',
        blog: 'Blog',
        jobs: 'Jobs',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Investor Relations',
        getStarted: 'Loslegen',
        createAccount: 'Ein neues Konto erstellen',
        logIn: 'Einloggen',
    },
    allStates: expensify_common_1.CONST.STATES,
    allCountries: CONST_1.default.ALL_COUNTRIES,
    accessibilityHints: {
        navigateToChatsList: 'Zurück zur Chatliste navigieren',
        chatWelcomeMessage: 'Begrüßungsnachricht im Chat',
        navigatesToChat: 'Navigiert zu einem Chat',
        newMessageLineIndicator: 'Neue Nachrichtenzeilenanzeige',
        chatMessage: 'Chat-Nachricht',
        lastChatMessagePreview: 'Letzte Chatnachricht-Vorschau',
        workspaceName: 'Arbeitsbereichsname',
        chatUserDisplayNames: 'Chat-Mitglied Anzeigenamen',
        scrollToNewestMessages: 'Zu den neuesten Nachrichten scrollen',
        preStyledText: 'Vorangestylter Text',
        viewAttachment: 'Anhang anzeigen',
    },
    parentReportAction: {
        deletedReport: 'Gelöschter Bericht',
        deletedMessage: 'Gelöschte Nachricht',
        deletedExpense: 'Gelöschte Ausgabe',
        reversedTransaction: 'Stornierte Transaktion',
        deletedTask: 'Gelöschte Aufgabe',
        hiddenMessage: 'Versteckte Nachricht',
    },
    threads: {
        thread: 'Thread',
        replies: 'Antworten',
        reply: 'Antworten',
        from: 'Von',
        in: 'in',
        parentNavigationSummary: function (_a) {
            var reportName = _a.reportName, workspaceName = _a.workspaceName;
            return "Von ".concat(reportName).concat(workspaceName ? "in ".concat(workspaceName) : '');
        },
    },
    qrCodes: {
        copy: 'URL kopieren',
        copied: 'Kopiert!',
    },
    moderation: {
        flagDescription: 'Alle markierten Nachrichten werden zur Überprüfung an einen Moderator gesendet.',
        chooseAReason: 'Wählen Sie einen Grund für die Markierung unten aus:',
        spam: 'Spam',
        spamDescription: 'Unaufgeforderte themenfremde Werbung',
        inconsiderate: 'Rücksichtslos',
        inconsiderateDescription: 'Beleidigende oder respektlose Formulierungen mit fragwürdigen Absichten',
        intimidation: 'Einschüchterung',
        intimidationDescription: 'Aggressiv eine Agenda verfolgen trotz berechtigter Einwände',
        bullying: 'Mobbing',
        bullyingDescription: 'Zielen auf eine Person, um Gehorsam zu erlangen',
        harassment: 'Belästigung',
        harassmentDescription: 'Rassistisches, frauenfeindliches oder anderweitig diskriminierendes Verhalten',
        assault: 'Angriff',
        assaultDescription: 'Speziell gezielter emotionaler Angriff mit der Absicht, Schaden zuzufügen.',
        flaggedContent: 'Diese Nachricht wurde als Verstoß gegen unsere Gemeinschaftsregeln markiert und der Inhalt wurde verborgen.',
        hideMessage: 'Nachricht ausblenden',
        revealMessage: 'Nachricht anzeigen',
        levelOneResult: 'Sendet anonyme Warnung und Nachricht wird zur Überprüfung gemeldet.',
        levelTwoResult: 'Nachricht im Kanal verborgen, plus anonyme Warnung und Nachricht wird zur Überprüfung gemeldet.',
        levelThreeResult: 'Nachricht aus dem Kanal entfernt, anonyme Warnung gesendet und Nachricht zur Überprüfung gemeldet.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Lade sie ein',
        nothing: 'Nichts tun',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Akzeptieren',
        decline: 'Ablehnen',
    },
    actionableMentionTrackExpense: {
        submit: 'An jemanden senden',
        categorize: 'Kategorisieren Sie es',
        share: 'Teilen Sie es mit meinem Buchhalter',
        nothing: 'Nichts für jetzt',
    },
    teachersUnitePage: {
        teachersUnite: 'Lehrer vereinigen sich',
        joinExpensifyOrg: 'Schließen Sie sich Expensify.org an, um Ungerechtigkeit auf der ganzen Welt zu beseitigen. Die aktuelle Kampagne "Teachers Unite" unterstützt Lehrer überall, indem sie die Kosten für wichtige Schulmaterialien aufteilt.',
        iKnowATeacher: 'Ich kenne einen Lehrer.',
        iAmATeacher: 'Ich bin Lehrer.',
        getInTouch: 'Ausgezeichnet! Bitte teilen Sie uns deren Informationen mit, damit wir Kontakt aufnehmen können.',
        introSchoolPrincipal: 'Einführung zu Ihrem Schulleiter',
        schoolPrincipalVerifyExpense: 'Expensify.org teilt die Kosten für wichtige Schulmaterialien, damit Schüler aus einkommensschwachen Haushalten eine bessere Lernerfahrung haben können. Ihr Schulleiter wird gebeten, Ihre Ausgaben zu überprüfen.',
        principalFirstName: 'Vorname des Hauptansprechpartners',
        principalLastName: 'Nachname des Schulleiters',
        principalWorkEmail: 'Hauptarbeits-E-Mail-Adresse',
        updateYourEmail: 'Aktualisieren Sie Ihre E-Mail-Adresse',
        updateEmail: 'E-Mail-Adresse aktualisieren',
        schoolMailAsDefault: function (_a) {
            var contactMethodsRoute = _a.contactMethodsRoute;
            return "Bevor Sie fortfahren, stellen Sie bitte sicher, dass Sie Ihre Schul-E-Mail als Ihre Standardkontaktmethode festlegen. Sie k\u00F6nnen dies unter Einstellungen > Profil > <a href=\"".concat(contactMethodsRoute, "\">Kontaktmethoden</a>.");
        },
        error: {
            enterPhoneEmail: 'Geben Sie eine gültige E-Mail-Adresse oder Telefonnummer ein',
            enterEmail: 'Geben Sie eine E-Mail-Adresse ein',
            enterValidEmail: 'Geben Sie eine gültige E-Mail-Adresse ein',
            tryDifferentEmail: 'Bitte versuchen Sie eine andere E-Mail-Adresse',
        },
    },
    cardTransactions: {
        notActivated: 'Nicht aktiviert',
        outOfPocket: 'Ausgaben aus eigener Tasche',
        companySpend: 'Unternehmensausgaben',
    },
    distance: {
        addStop: 'Stopp hinzufügen',
        deleteWaypoint: 'Wegpunkt löschen',
        deleteWaypointConfirmation: 'Möchten Sie diesen Wegpunkt wirklich löschen?',
        address: 'Adresse',
        waypointDescription: {
            start: 'Starten',
            stop: 'Stopp',
        },
        mapPending: {
            title: 'Ausstehende Karte',
            subtitle: 'Die Karte wird generiert, wenn Sie wieder online sind.',
            onlineSubtitle: 'Einen Moment, während wir die Karte einrichten.',
            errorTitle: 'Kartenfehler',
            errorSubtitle: 'Beim Laden der Karte ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.',
        },
        error: {
            selectSuggestedAddress: 'Bitte wählen Sie eine vorgeschlagene Adresse aus oder verwenden Sie den aktuellen Standort.',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Zeugnis verloren oder beschädigt',
        nextButtonLabel: 'Nächste',
        reasonTitle: 'Warum benötigen Sie eine neue Karte?',
        cardDamaged: 'Meine Karte wurde beschädigt',
        cardLostOrStolen: 'Meine Karte wurde verloren oder gestohlen',
        confirmAddressTitle: 'Bitte bestätigen Sie die Postadresse für Ihre neue Karte.',
        cardDamagedInfo: 'Ihre neue Karte wird in 2-3 Werktagen ankommen. Ihre aktuelle Karte wird weiterhin funktionieren, bis Sie Ihre neue aktivieren.',
        cardLostOrStolenInfo: 'Ihre aktuelle Karte wird dauerhaft deaktiviert, sobald Ihre Bestellung aufgegeben wird. Die meisten Karten kommen in wenigen Werktagen an.',
        address: 'Adresse',
        deactivateCardButton: 'Karte deaktivieren',
        shipNewCardButton: 'Neue Karte versenden',
        addressError: 'Adresse ist erforderlich',
        reasonError: 'Grund ist erforderlich',
        successTitle: 'Ihre neue Karte ist auf dem Weg!',
        successDescription: 'Sie müssen sie aktivieren, sobald sie in wenigen Werktagen ankommt. In der Zwischenzeit ist Ihre virtuelle Karte einsatzbereit.',
    },
    eReceipt: {
        guaranteed: 'Garantierter eReceipt',
        transactionDate: 'Transaktionsdatum',
    },
    referralProgram: (_8 = {},
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT] = {
            buttonText1: 'Einen Chat starten,',
            buttonText2: 'Empfehlen Sie einen Freund.',
            header: 'Starte einen Chat, empfehle einen Freund weiter',
            body: 'Möchten Sie, dass Ihre Freunde auch Expensify nutzen? Starten Sie einfach einen Chat mit ihnen und wir kümmern uns um den Rest.',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE] = {
            buttonText1: 'Reichen Sie eine Ausgabe ein,',
            buttonText2: 'Empfehlen Sie Ihren Chef.',
            header: 'Reichen Sie eine Ausgabe ein, verweisen Sie auf Ihren Chef.',
            body: 'Möchten Sie, dass Ihr Chef auch Expensify nutzt? Reichen Sie einfach eine Ausgabe bei ihnen ein und wir kümmern uns um den Rest.',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND] = {
            header: 'Einen Freund empfehlen',
            body: 'Möchten Sie, dass Ihre Freunde auch Expensify nutzen? Chatten, bezahlen oder teilen Sie einfach eine Ausgabe mit ihnen und wir kümmern uns um den Rest. Oder teilen Sie einfach Ihren Einladungslink!',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE] = {
            buttonText: 'Einen Freund empfehlen',
            header: 'Einen Freund empfehlen',
            body: 'Möchten Sie, dass Ihre Freunde auch Expensify nutzen? Chatten, bezahlen oder teilen Sie einfach eine Ausgabe mit ihnen und wir kümmern uns um den Rest. Oder teilen Sie einfach Ihren Einladungslink!',
        },
        _8.copyReferralLink = 'Einladungslink kopieren',
        _8),
    systemChatFooterMessage: (_9 = {},
        _9[CONST_1.default.INTRO_CHOICES.MANAGE_TEAM] = {
            phrase1: 'Chatte mit deinem Setup-Spezialisten in',
            phrase2: 'für Hilfe',
        },
        _9.default = {
            phrase1: 'Nachricht',
            phrase2: 'für Hilfe bei der Einrichtung',
        },
        _9),
    violations: {
        allTagLevelsRequired: 'Alle Tags erforderlich',
        autoReportedRejectedExpense: function (_a) {
            var rejectReason = _a.rejectReason, rejectedBy = _a.rejectedBy;
            return "".concat(rejectedBy, " hat diese Ausgabe mit dem Kommentar \"").concat(rejectReason, "\" abgelehnt.");
        },
        billableExpense: 'Abrechnungsfähig nicht mehr gültig',
        cashExpenseWithNoReceipt: function (_a) {
            var _b = _a === void 0 ? {} : _a, formattedLimit = _b.formattedLimit;
            return "Beleg erforderlich".concat(formattedLimit ? "\u00FCber ".concat(formattedLimit) : '');
        },
        categoryOutOfPolicy: 'Kategorie nicht mehr gültig',
        conversionSurcharge: function (_a) {
            var surcharge = _a.surcharge;
            return "Angewandte ".concat(surcharge, "% Umrechnungsgeb\u00FChr");
        },
        customUnitOutOfPolicy: 'Rate für diesen Arbeitsbereich nicht gültig',
        duplicatedTransaction: 'Duplikat',
        fieldRequired: 'Berichtsfelder sind erforderlich',
        futureDate: 'Zukünftiges Datum nicht erlaubt',
        invoiceMarkup: function (_a) {
            var invoiceMarkup = _a.invoiceMarkup;
            return "Mit ".concat(invoiceMarkup, "% aufgeschlagen");
        },
        maxAge: function (_a) {
            var maxAge = _a.maxAge;
            return "Datum \u00E4lter als ".concat(maxAge, " Tage");
        },
        missingCategory: 'Fehlende Kategorie',
        missingComment: 'Beschreibung für die ausgewählte Kategorie erforderlich',
        missingTag: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "Missing ".concat(tagName !== null && tagName !== void 0 ? tagName : 'tag');
        },
        modifiedAmount: function (_a) {
            var type = _a.type, displayPercentVariance = _a.displayPercentVariance;
            switch (type) {
                case 'distance':
                    return 'Betrag weicht von berechneter Entfernung ab';
                case 'card':
                    return 'Betrag größer als Kartentransaktion';
                default:
                    if (displayPercentVariance) {
                        return "Betrag ".concat(displayPercentVariance, "% h\u00F6her als der gescannte Beleg");
                    }
                    return 'Betrag größer als gescanntes Beleg';
            }
        },
        modifiedDate: 'Datum weicht vom gescannten Beleg ab',
        nonExpensiworksExpense: 'Nicht-Expensiworks-Ausgabe',
        overAutoApprovalLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Ausgabe \u00FCberschreitet die automatische Genehmigungsgrenze von ".concat(formattedLimit);
        },
        overCategoryLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Betrag \u00FCber dem ".concat(formattedLimit, "/Personen-Kategorielimit");
        },
        overLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Betrag \u00FCber dem Limit von ".concat(formattedLimit, "/Person");
        },
        overLimitAttendee: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Betrag \u00FCber dem Limit von ".concat(formattedLimit, "/Person");
        },
        perDayLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Betrag \u00FCber dem t\u00E4glichen ".concat(formattedLimit, "/Personen-Kategorielimit");
        },
        receiptNotSmartScanned: 'Ausgabendetails und Beleg manuell hinzugefügt. Bitte überprüfen Sie die Details. <a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">Erfahren Sie mehr</a> über die automatische Überprüfung aller Belege.',
        receiptRequired: function (_a) {
            var formattedLimit = _a.formattedLimit, category = _a.category;
            var message = 'Beleg erforderlich';
            if (formattedLimit !== null && formattedLimit !== void 0 ? formattedLimit : category) {
                message += 'über';
                if (formattedLimit) {
                    message += " ".concat(formattedLimit);
                }
                if (category) {
                    message += 'Kategorielimitierung';
                }
            }
            return message;
        },
        prohibitedExpense: function (_a) {
            var prohibitedExpenseType = _a.prohibitedExpenseType;
            var preMessage = 'Verbotene Ausgabe:';
            switch (prohibitedExpenseType) {
                case 'alcohol':
                    return "".concat(preMessage, " Alkohol");
                case 'gambling':
                    return "".concat(preMessage, " Gl\u00FCcksspiel");
                case 'tobacco':
                    return "".concat(preMessage, " Tabak");
                case 'adultEntertainment':
                    return "".concat(preMessage, " Erwachsenenunterhaltung");
                case 'hotelIncidentals':
                    return "".concat(preMessage, " Hotelnebenkosten");
                default:
                    return "".concat(preMessage).concat(prohibitedExpenseType);
            }
        },
        customRules: function (_a) {
            var message = _a.message;
            return message;
        },
        reviewRequired: 'Überprüfung erforderlich',
        rter: function (_a) {
            var brokenBankConnection = _a.brokenBankConnection, email = _a.email, isAdmin = _a.isAdmin, isTransactionOlderThan7Days = _a.isTransactionOlderThan7Days, member = _a.member, rterType = _a.rterType;
            if (rterType === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Kassenbon kann aufgrund einer unterbrochenen Bankverbindung nicht automatisch zugeordnet werden.';
            }
            if (brokenBankConnection || rterType === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? "Kassenbon kann aufgrund einer unterbrochenen Bankverbindung, die ".concat(email, " beheben muss, nicht automatisch zugeordnet werden.")
                    : 'Konnte Beleg aufgrund einer defekten Bankverbindung, die Sie beheben müssen, nicht automatisch zuordnen.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin
                    ? "Bitte ".concat(member, ", es als Bargeld zu markieren oder 7 Tage zu warten und es erneut zu versuchen.")
                    : 'Warten auf die Zusammenführung mit der Kartentransaktion.';
            }
            return '';
        },
        brokenConnection530Error: 'Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung',
        adminBrokenConnectionError: 'Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung. Bitte beheben in',
        memberBrokenConnectionError: 'Beleg ausstehend aufgrund einer unterbrochenen Bankverbindung. Bitte bitten Sie einen Workspace-Administrator, das Problem zu lösen.',
        markAsCashToIgnore: 'Als Barzahlung markieren, um zu ignorieren und Zahlung anzufordern.',
        smartscanFailed: function (_a) {
            var _b = _a.canEdit, canEdit = _b === void 0 ? true : _b;
            return "Beleg-Scan fehlgeschlagen.".concat(canEdit ? 'Details manuell eingeben.' : '');
        },
        receiptGeneratedWithAI: 'Potentieller KI-generierter Beleg',
        someTagLevelsRequired: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "Missing ".concat(tagName !== null && tagName !== void 0 ? tagName : 'Etikett');
        },
        tagOutOfPolicy: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "".concat(tagName !== null && tagName !== void 0 ? tagName : 'Etikett', " nicht mehr g\u00FCltig");
        },
        taxAmountChanged: 'Der Steuerbetrag wurde geändert.',
        taxOutOfPolicy: function (_a) {
            var _b = _a === void 0 ? {} : _a, taxName = _b.taxName;
            return "".concat(taxName !== null && taxName !== void 0 ? taxName : 'Steuer', " nicht mehr g\u00FCltig");
        },
        taxRateChanged: 'Steuersatz wurde geändert',
        taxRequired: 'Fehlender Steuersatz',
        none: 'Keine',
        taxCodeToKeep: 'Wählen Sie, welchen Steuercode Sie behalten möchten',
        tagToKeep: 'Wählen Sie aus, welches Tag beibehalten werden soll',
        isTransactionReimbursable: 'Wählen Sie, ob die Transaktion erstattungsfähig ist',
        merchantToKeep: 'Wählen Sie, welchen Händler Sie behalten möchten',
        descriptionToKeep: 'Wählen Sie aus, welche Beschreibung beibehalten werden soll.',
        categoryToKeep: 'Wählen Sie, welche Kategorie beibehalten werden soll',
        isTransactionBillable: 'Wählen Sie, ob die Transaktion abrechenbar ist',
        keepThisOne: 'Keep this one',
        confirmDetails: "Best\u00E4tigen Sie die Details, die Sie behalten.",
        confirmDuplicatesInfo: "Die doppelten Anfragen, die Sie nicht behalten, werden f\u00FCr das Mitglied zur L\u00F6schung bereitgehalten.",
        hold: 'Diese Ausgabe wurde zurückgestellt.',
        resolvedDuplicates: 'den doppelten Eintrag gelöst',
    },
    reportViolations: (_10 = {},
        _10[CONST_1.default.REPORT_VIOLATIONS.FIELD_REQUIRED] = function (_a) {
            var fieldName = _a.fieldName;
            return "".concat(fieldName, " ist erforderlich");
        },
        _10),
    violationDismissal: {
        rter: {
            manual: 'diesen Beleg als Barzahlung markiert',
        },
        duplicatedTransaction: {
            manual: 'den doppelten Eintrag gelöst',
        },
    },
    videoPlayer: {
        play: 'Spielen',
        pause: 'Pause',
        fullscreen: 'Vollbildschirm',
        playbackSpeed: 'Wiedergabegeschwindigkeit',
        expand: 'Erweitern',
        mute: 'Stumm schalten',
        unmute: 'Stummschaltung aufheben',
        normal: 'Normal',
    },
    exitSurvey: {
        header: 'Bevor Sie gehen',
        reasonPage: {
            title: 'Bitte teilen Sie uns mit, warum Sie uns verlassen.',
            subtitle: 'Bevor Sie gehen, teilen Sie uns bitte mit, warum Sie zu Expensify Classic wechseln möchten.',
        },
        reasons: (_11 = {},
            _11[CONST_1.default.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE] = 'Ich benötige eine Funktion, die nur in Expensify Classic verfügbar ist.',
            _11[CONST_1.default.EXIT_SURVEY.REASONS.DONT_UNDERSTAND] = 'Ich verstehe nicht, wie man New Expensify benutzt.',
            _11[CONST_1.default.EXIT_SURVEY.REASONS.PREFER_CLASSIC] = 'Ich verstehe, wie man New Expensify benutzt, aber ich bevorzuge Expensify Classic.',
            _11),
        prompts: (_12 = {},
            _12[CONST_1.default.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE] = 'Welche Funktion benötigen Sie, die in New Expensify nicht verfügbar ist?',
            _12[CONST_1.default.EXIT_SURVEY.REASONS.DONT_UNDERSTAND] = 'Was versuchst du zu tun?',
            _12[CONST_1.default.EXIT_SURVEY.REASONS.PREFER_CLASSIC] = 'Warum bevorzugen Sie Expensify Classic?',
            _12),
        responsePlaceholder: 'Ihre Antwort',
        thankYou: 'Danke für das Feedback!',
        thankYouSubtitle: 'Ihre Antworten helfen uns, ein besseres Produkt zu entwickeln, um Dinge zu erledigen. Vielen Dank!',
        goToExpensifyClassic: 'Zu Expensify Classic wechseln',
        offlineTitle: 'Sie scheinen hier festzustecken...',
        offline: 'Sie scheinen offline zu sein. Leider funktioniert Expensify Classic nicht offline, aber New Expensify schon. Wenn Sie Expensify Classic verwenden möchten, versuchen Sie es erneut, wenn Sie eine Internetverbindung haben.',
        quickTip: 'Kurzer Tipp...',
        quickTipSubTitle: 'Sie können direkt zu Expensify Classic gehen, indem Sie expensify.com besuchen. Setzen Sie ein Lesezeichen, um eine einfache Abkürzung zu haben!',
        bookACall: 'Einen Anruf buchen',
        noThanks: 'Nein danke',
        bookACallTitle: 'Möchten Sie mit einem Produktmanager sprechen?',
        benefits: (_13 = {},
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY] = 'Direktes Chatten über Ausgaben und Berichte',
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE] = 'Fähigkeit, alles auf dem Handy zu erledigen',
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE] = 'Reisen und Ausgaben mit der Geschwindigkeit des Chats',
            _13),
        bookACallTextTop: 'Wenn Sie zu Expensify Classic wechseln, verpassen Sie:',
        bookACallTextBottom: 'Wir würden uns freuen, mit Ihnen einen Anruf zu vereinbaren, um zu verstehen, warum. Sie können einen Anruf mit einem unserer leitenden Produktmanager buchen, um Ihre Bedürfnisse zu besprechen.',
        takeMeToExpensifyClassic: 'Bring mich zu Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Beim Laden weiterer Nachrichten ist ein Fehler aufgetreten.',
        tryAgain: 'Versuchen Sie es erneut.',
    },
    systemMessage: {
        mergedWithCashTransaction: 'einen Beleg mit dieser Transaktion abgeglichen',
    },
    subscription: {
        authenticatePaymentCard: 'Zahlungskarte authentifizieren',
        mobileReducedFunctionalityMessage: 'Sie können Änderungen an Ihrem Abonnement nicht in der mobilen App vornehmen.',
        badge: {
            freeTrial: function (_a) {
                var numOfDays = _a.numOfDays;
                return "Kostenlose Testversion: ".concat(numOfDays, " ").concat(numOfDays === 1 ? 'Tag' : 'Tage', " \u00FCbrig");
            },
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Ihre Zahlungsinformationen sind veraltet.',
                subtitle: function (_a) {
                    var date = _a.date;
                    return "Aktualisieren Sie Ihre Zahlungskarte bis zum ".concat(date, ", um weiterhin alle Ihre Lieblingsfunktionen nutzen zu k\u00F6nnen.");
                },
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Ihre Zahlung konnte nicht verarbeitet werden.',
                subtitle: function (_a) {
                    var date = _a.date, purchaseAmountOwed = _a.purchaseAmountOwed;
                    return date && purchaseAmountOwed
                        ? "Ihre Belastung vom ".concat(date, " \u00FCber ").concat(purchaseAmountOwed, " konnte nicht verarbeitet werden. Bitte f\u00FCgen Sie eine Zahlungskarte hinzu, um den f\u00E4lligen Betrag zu begleichen.")
                        : 'Bitte fügen Sie eine Zahlungskarte hinzu, um den geschuldeten Betrag zu begleichen.';
                },
            },
            policyOwnerUnderInvoicing: {
                title: 'Ihre Zahlungsinformationen sind veraltet.',
                subtitle: function (_a) {
                    var date = _a.date;
                    return "Ihre Zahlung ist \u00FCberf\u00E4llig. Bitte begleichen Sie Ihre Rechnung bis zum ".concat(date, ", um eine Unterbrechung des Dienstes zu vermeiden.");
                },
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Ihre Zahlungsinformationen sind veraltet.',
                subtitle: 'Ihre Zahlung ist überfällig. Bitte begleichen Sie Ihre Rechnung.',
            },
            billingDisputePending: {
                title: 'Ihre Karte konnte nicht belastet werden.',
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed, cardEnding = _a.cardEnding;
                    return "Sie haben die Belastung von ".concat(amountOwed, " auf der Karte mit der Endung ").concat(cardEnding, " angefochten. Ihr Konto wird gesperrt, bis der Streit mit Ihrer Bank gekl\u00E4rt ist.");
                },
            },
            cardAuthenticationRequired: {
                title: 'Ihre Karte konnte nicht belastet werden.',
                subtitle: function (_a) {
                    var cardEnding = _a.cardEnding;
                    return "Ihre Zahlungskarte wurde nicht vollst\u00E4ndig authentifiziert. Bitte schlie\u00DFen Sie den Authentifizierungsprozess ab, um Ihre Zahlungskarte mit der Endung ".concat(cardEnding, " zu aktivieren.");
                },
            },
            insufficientFunds: {
                title: 'Ihre Karte konnte nicht belastet werden.',
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed;
                    return "Ihre Zahlungskarte wurde aufgrund unzureichender Mittel abgelehnt. Bitte versuchen Sie es erneut oder f\u00FCgen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Saldo von ".concat(amountOwed, " zu begleichen.");
                },
            },
            cardExpired: {
                title: 'Ihre Karte konnte nicht belastet werden.',
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed;
                    return "Ihre Zahlungskarte ist abgelaufen. Bitte f\u00FCgen Sie eine neue Zahlungskarte hinzu, um Ihren ausstehenden Saldo von ".concat(amountOwed, " zu begleichen.");
                },
            },
            cardExpireSoon: {
                title: 'Ihre Karte läuft bald ab',
                subtitle: 'Ihre Zahlungskarte läuft am Ende dieses Monats ab. Klicken Sie auf das Drei-Punkte-Menü unten, um sie zu aktualisieren und weiterhin alle Ihre Lieblingsfunktionen zu nutzen.',
            },
            retryBillingSuccess: {
                title: 'Erfolg!',
                subtitle: 'Ihre Karte wurde erfolgreich belastet.',
            },
            retryBillingError: {
                title: 'Ihre Karte konnte nicht belastet werden.',
                subtitle: 'Bevor Sie es erneut versuchen, rufen Sie bitte direkt Ihre Bank an, um Expensify-Gebühren zu autorisieren und eventuelle Sperren zu entfernen. Andernfalls versuchen Sie, eine andere Zahlungskarte hinzuzufügen.',
            },
            cardOnDispute: function (_a) {
                var amountOwed = _a.amountOwed, cardEnding = _a.cardEnding;
                return "Sie haben die Belastung von ".concat(amountOwed, " auf der Karte mit der Endung ").concat(cardEnding, " angefochten. Ihr Konto wird gesperrt, bis der Streit mit Ihrer Bank gekl\u00E4rt ist.");
            },
            preTrial: {
                title: 'Kostenlose Testversion starten',
                subtitleStart: 'Als nächster Schritt,',
                subtitleLink: 'Vervollständigen Sie Ihre Einrichtungsliste',
                subtitleEnd: 'damit Ihr Team mit der Spesenabrechnung beginnen kann.',
            },
            trialStarted: {
                title: function (_a) {
                    var numOfDays = _a.numOfDays;
                    return "Testversion: ".concat(numOfDays, " ").concat(numOfDays === 1 ? 'Tag' : 'Tage', " \u00FCbrig!");
                },
                subtitle: 'Fügen Sie eine Zahlungskarte hinzu, um alle Ihre Lieblingsfunktionen weiterhin nutzen zu können.',
            },
            trialEnded: {
                title: 'Ihre kostenlose Testversion ist abgelaufen',
                subtitle: 'Fügen Sie eine Zahlungskarte hinzu, um alle Ihre Lieblingsfunktionen weiterhin nutzen zu können.',
            },
            earlyDiscount: {
                claimOffer: 'Angebot einlösen',
                noThanks: 'Nein danke',
                subscriptionPageTitle: function (_a) {
                    var discountType = _a.discountType;
                    return "<strong>".concat(discountType, "% Rabatt auf Ihr erstes Jahr!</strong> F\u00FCgen Sie einfach eine Zahlungsmethode hinzu und beginnen Sie mit einem Jahresabonnement.");
                },
                onboardingChatTitle: function (_a) {
                    var discountType = _a.discountType;
                    return "Zeitlich begrenztes Angebot: ".concat(discountType, "% Rabatt auf Ihr erstes Jahr!");
                },
                subtitle: function (_a) {
                    var days = _a.days, hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds;
                    return "Einl\u00F6sen in ".concat(days > 0 ? "".concat(days, "d :") : '').concat(hours, "h : ").concat(minutes, "m : ").concat(seconds, "s");
                },
            },
        },
        cardSection: {
            title: 'Zahlung',
            subtitle: 'Fügen Sie eine Karte hinzu, um Ihr Expensify-Abonnement zu bezahlen.',
            addCardButton: 'Zahlungskarte hinzufügen',
            cardNextPayment: function (_a) {
                var nextPaymentDate = _a.nextPaymentDate;
                return "Ihr n\u00E4chstes Zahlungsdatum ist ".concat(nextPaymentDate, ".");
            },
            cardEnding: function (_a) {
                var cardNumber = _a.cardNumber;
                return "Karte endet mit ".concat(cardNumber);
            },
            cardInfo: function (_a) {
                var name = _a.name, expiration = _a.expiration, currency = _a.currency;
                return "Name: ".concat(name, ", Ablaufdatum: ").concat(expiration, ", W\u00E4hrung: ").concat(currency);
            },
            changeCard: 'Zahlungskarte ändern',
            changeCurrency: 'Zahlungswährung ändern',
            cardNotFound: 'Keine Zahlungskarte hinzugefügt',
            retryPaymentButton: 'Zahlung erneut versuchen',
            authenticatePayment: 'Zahlung authentifizieren',
            requestRefund: 'Rückerstattung anfordern',
            requestRefundModal: {
                full: 'Eine Rückerstattung zu erhalten ist einfach: Downgraden Sie einfach Ihr Konto vor Ihrem nächsten Abrechnungsdatum und Sie erhalten eine Rückerstattung. <br /> <br /> Achtung: Wenn Sie Ihr Konto herabstufen, werden Ihre Arbeitsbereiche gelöscht. Diese Aktion kann nicht rückgängig gemacht werden, aber Sie können jederzeit einen neuen Arbeitsbereich erstellen, wenn Sie Ihre Meinung ändern.',
                confirm: 'Arbeitsbereich(e) löschen und herabstufen',
            },
            viewPaymentHistory: 'Zahlungsverlauf anzeigen',
        },
        yourPlan: {
            title: 'Ihr Plan',
            exploreAllPlans: 'Alle Pläne erkunden',
            customPricing: 'Individuelle Preisgestaltung',
            asLowAs: function (_a) {
                var price = _a.price;
                return "ab ".concat(price, " pro aktivem Mitglied/Monat");
            },
            pricePerMemberMonth: function (_a) {
                var price = _a.price;
                return "".concat(price, " pro Mitglied/Monat");
            },
            pricePerMemberPerMonth: function (_a) {
                var price = _a.price;
                return "".concat(price, " pro Mitglied pro Monat");
            },
            perMemberMonth: 'pro Mitglied/Monat',
            collect: {
                title: 'Sammeln',
                description: 'Der Kleinunternehmensplan, der Ihnen Ausgaben, Reisen und Chat bietet.',
                priceAnnual: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "Von ".concat(lower, "/aktivem Mitglied mit der Expensify-Karte, ").concat(upper, "/aktivem Mitglied ohne die Expensify-Karte.");
                },
                pricePayPerUse: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "Von ".concat(lower, "/aktivem Mitglied mit der Expensify-Karte, ").concat(upper, "/aktivem Mitglied ohne die Expensify-Karte.");
                },
                benefit1: 'Beleg-Scannen',
                benefit2: 'Erstattungen',
                benefit3: 'Verwaltung von Firmenkreditkarten',
                benefit4: 'Spesen- und Reisegenehmigungen',
                benefit5: 'Reisebuchung und -regeln',
                benefit6: 'QuickBooks/Xero-Integrationen',
                benefit7: 'Chat über Ausgaben, Berichte und Räume',
                benefit8: 'KI- und menschlicher Support',
            },
            control: {
                title: 'Steuerung',
                description: 'Spesen, Reisen und Chat für größere Unternehmen.',
                priceAnnual: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "Von ".concat(lower, "/aktivem Mitglied mit der Expensify-Karte, ").concat(upper, "/aktivem Mitglied ohne die Expensify-Karte.");
                },
                pricePayPerUse: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "Von ".concat(lower, "/aktivem Mitglied mit der Expensify-Karte, ").concat(upper, "/aktivem Mitglied ohne die Expensify-Karte.");
                },
                benefit1: 'Alles im Collect-Plan',
                benefit2: 'Genehmigungsabläufe mit mehreren Ebenen',
                benefit3: 'Benutzerdefinierte Ausgabenregeln',
                benefit4: 'ERP-Integrationen (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'HR-Integrationen (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Benutzerdefinierte Einblicke und Berichterstattung',
                benefit8: 'Budgetierung',
            },
            thisIsYourCurrentPlan: 'Dies ist Ihr aktueller Plan',
            downgrade: 'Herabstufen zu Collect',
            upgrade: 'Upgrade zu Control',
            addMembers: 'Mitglieder hinzufügen',
            saveWithExpensifyTitle: 'Sparen Sie mit der Expensify-Karte',
            saveWithExpensifyDescription: 'Verwenden Sie unseren Sparrechner, um zu sehen, wie das Cashback der Expensify Card Ihre Expensify-Rechnung reduzieren kann.',
            saveWithExpensifyButton: 'Erfahren Sie mehr',
        },
        compareModal: {
            comparePlans: 'Pläne vergleichen',
            unlockTheFeatures: 'Schalten Sie die Funktionen frei, die Sie benötigen, mit dem Plan, der für Sie richtig ist.',
            viewOurPricing: 'Sehen Sie sich unsere Preisseite an',
            forACompleteFeatureBreakdown: 'für eine vollständige Funktionsübersicht unserer Pläne.',
        },
        details: {
            title: 'Abonnementdetails',
            annual: 'Jahresabonnement',
            taxExempt: 'Steuerbefreiungsstatus beantragen',
            taxExemptEnabled: 'Steuerbefreit',
            taxExemptStatus: 'Steuerbefreiungsstatus',
            payPerUse: 'Nutzungsgesteuert',
            subscriptionSize: 'Abonnementgröße',
            headsUp: 'Achtung: Wenn Sie jetzt nicht die Größe Ihres Abonnements festlegen, setzen wir sie automatisch auf die Anzahl der aktiven Mitglieder Ihres ersten Monats. Sie verpflichten sich dann, für mindestens diese Anzahl von Mitgliedern für die nächsten 12 Monate zu zahlen. Sie können die Größe Ihres Abonnements jederzeit erhöhen, aber nicht verringern, bis Ihr Abonnement abgelaufen ist.',
            zeroCommitment: 'Keine Verpflichtung zum ermäßigten Jahresabonnementpreis',
        },
        subscriptionSize: {
            title: 'Abonnementgröße',
            yourSize: 'Ihre Abonnementgröße ist die Anzahl der offenen Plätze, die in einem bestimmten Monat von jedem aktiven Mitglied besetzt werden können.',
            eachMonth: 'Jeden Monat deckt Ihr Abonnement bis zu der oben festgelegten Anzahl aktiver Mitglieder ab. Jedes Mal, wenn Sie die Größe Ihres Abonnements erhöhen, beginnen Sie ein neues 12-monatiges Abonnement in dieser neuen Größe.',
            note: 'Hinweis: Ein aktives Mitglied ist jeder, der Ausgabendaten erstellt, bearbeitet, eingereicht, genehmigt, erstattet oder exportiert hat, die mit dem Arbeitsbereich Ihres Unternehmens verbunden sind.',
            confirmDetails: 'Bestätigen Sie Ihre neuen jährlichen Abonnementdetails:',
            subscriptionSize: 'Abonnementgröße',
            activeMembers: function (_a) {
                var size = _a.size;
                return "".concat(size, " aktive Mitglieder/Monat");
            },
            subscriptionRenews: 'Abonnement wird erneuert',
            youCantDowngrade: 'Sie können während Ihres Jahresabonnements nicht herabstufen.',
            youAlreadyCommitted: function (_a) {
                var size = _a.size, date = _a.date;
                return "Sie haben sich bereits f\u00FCr ein Jahresabonnement mit einer Gr\u00F6\u00DFe von ".concat(size, " aktiven Mitgliedern pro Monat bis zum ").concat(date, " verpflichtet. Sie k\u00F6nnen am ").concat(date, " zu einem nutzungsbasierten Abonnement wechseln, indem Sie die automatische Verl\u00E4ngerung deaktivieren.");
            },
            error: {
                size: 'Bitte geben Sie eine gültige Abonnementgröße ein.',
                sameSize: 'Bitte geben Sie eine Zahl ein, die sich von Ihrer aktuellen Abonnementgröße unterscheidet.',
            },
        },
        paymentCard: {
            addPaymentCard: 'Zahlungskarte hinzufügen',
            enterPaymentCardDetails: 'Geben Sie Ihre Zahlungsinformationen ein',
            security: 'Expensify ist PCI-DSS-konform, verwendet Verschlüsselung auf Bankniveau und nutzt redundante Infrastruktur, um Ihre Daten zu schützen.',
            learnMoreAboutSecurity: 'Erfahren Sie mehr über unsere Sicherheit.',
        },
        subscriptionSettings: {
            title: 'Abonnementseinstellungen',
            summary: function (_a) {
                var subscriptionType = _a.subscriptionType, subscriptionSize = _a.subscriptionSize, autoRenew = _a.autoRenew, autoIncrease = _a.autoIncrease;
                return "Abonnementstyp: ".concat(subscriptionType, ", Abonnementgr\u00F6\u00DFe: ").concat(subscriptionSize, ", Automatische Verl\u00E4ngerung: ").concat(autoRenew, ", Automatische j\u00E4hrliche Sitzplatzerh\u00F6hung: ").concat(autoIncrease);
            },
            none: 'none',
            on: 'on',
            off: 'aus',
            annual: 'Jährlich',
            autoRenew: 'Automatische Verlängerung',
            autoIncrease: 'Automatische jährliche Sitzplatzerhöhung',
            saveUpTo: function (_a) {
                var amountWithCurrency = _a.amountWithCurrency;
                return "Sparen Sie bis zu ".concat(amountWithCurrency, "/Monat pro aktivem Mitglied");
            },
            automaticallyIncrease: 'Erhöhen Sie automatisch Ihre jährlichen Plätze, um aktive Mitglieder aufzunehmen, die Ihre Abonnementgröße überschreiten. Hinweis: Dies wird das Enddatum Ihres Jahresabonnements verlängern.',
            disableAutoRenew: 'Automatische Verlängerung deaktivieren',
            helpUsImprove: 'Helfen Sie uns, Expensify zu verbessern',
            whatsMainReason: 'Was ist der Hauptgrund, warum Sie die automatische Verlängerung deaktivieren?',
            renewsOn: function (_a) {
                var date = _a.date;
                return "Wird am ".concat(date, " erneuert.");
            },
            pricingConfiguration: 'Die Preisgestaltung hängt von der Konfiguration ab. Für den niedrigsten Preis wählen Sie ein Jahresabonnement und erhalten Sie die Expensify Card.',
            learnMore: {
                part1: 'Erfahren Sie mehr auf unserer',
                pricingPage: 'Preisseite',
                part2: 'oder chatten Sie mit unserem Team in Ihrer',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: 'Geschätzter Preis',
            changesBasedOn: 'Dies ändert sich basierend auf Ihrer Expensify Card-Nutzung und den untenstehenden Abonnementoptionen.',
        },
        requestEarlyCancellation: {
            title: 'Frühzeitige Kündigung beantragen',
            subtitle: 'Was ist der Hauptgrund für Ihre vorzeitige Kündigungsanfrage?',
            subscriptionCanceled: {
                title: 'Abonnement storniert',
                subtitle: 'Ihr Jahresabonnement wurde storniert.',
                info: 'Wenn Sie Ihre Arbeitsbereiche weiterhin auf Pay-per-Use-Basis nutzen möchten, sind Sie startklar.',
                preventFutureActivity: {
                    part1: 'Wenn Sie zukünftige Aktivitäten und Gebühren verhindern möchten, müssen Sie',
                    link: 'löschen Sie Ihren Arbeitsbereich/Ihre Arbeitsbereiche',
                    part2: 'Beachten Sie, dass Ihnen beim Löschen Ihrer Arbeitsbereiche alle ausstehenden Aktivitäten, die im aktuellen Kalendermonat angefallen sind, in Rechnung gestellt werden.',
                },
            },
            requestSubmitted: {
                title: 'Anfrage eingereicht',
                subtitle: {
                    part1: 'Vielen Dank, dass Sie uns mitgeteilt haben, dass Sie an der Kündigung Ihres Abonnements interessiert sind. Wir prüfen Ihre Anfrage und werden uns bald über Ihren Chat mit Ihnen in Verbindung setzen.',
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: "Indem ich die vorzeitige K\u00FCndigung beantrage, erkenne ich an und stimme zu, dass Expensify keine Verpflichtung hat, einem solchen Antrag im Rahmen von Expensify stattzugeben.<a href=".concat(CONST_1.default.OLD_DOT_PUBLIC_URLS.TERMS_URL, ">Nutzungsbedingungen</a>oder andere anwendbare Dienstleistungsvereinbarungen zwischen mir und Expensify und dass Expensify das alleinige Ermessen hinsichtlich der Gew\u00E4hrung eines solchen Antrags beh\u00E4lt."),
        },
    },
    feedbackSurvey: {
        tooLimited: 'Funktionalität muss verbessert werden',
        tooExpensive: 'Zu teuer',
        inadequateSupport: 'Unzureichender Kundensupport',
        businessClosing: 'Unternehmen schließt, verkleinert sich oder wurde übernommen',
        additionalInfoTitle: 'Zu welcher Software wechseln Sie und warum?',
        additionalInfoInputLabel: 'Ihre Antwort',
    },
    roomChangeLog: {
        updateRoomDescription: 'setze die Raumbeschreibung auf:',
        clearRoomDescription: 'Raumbeschreibung gelöscht',
    },
    delegate: {
        switchAccount: 'Konten wechseln:',
        copilotDelegatedAccess: 'Copilot: Delegierter Zugriff',
        copilotDelegatedAccessDescription: 'Erlauben Sie anderen Mitgliedern, auf Ihr Konto zuzugreifen.',
        addCopilot: 'Copilot hinzufügen',
        membersCanAccessYourAccount: 'Diese Mitglieder können auf Ihr Konto zugreifen:',
        youCanAccessTheseAccounts: 'Sie können auf diese Konten über den Kontowechsler zugreifen:',
        role: function (_a) {
            var _b = _a === void 0 ? {} : _a, role = _b.role;
            switch (role) {
                case CONST_1.default.DELEGATE_ROLE.ALL:
                    return 'Voll';
                case CONST_1.default.DELEGATE_ROLE.SUBMITTER:
                    return 'Begrenzt';
                default:
                    return '';
            }
        },
        genericError: 'Ups, etwas ist schiefgelaufen. Bitte versuche es erneut.',
        onBehalfOfMessage: function (_a) {
            var delegator = _a.delegator;
            return "im Auftrag von ".concat(delegator);
        },
        accessLevel: 'Zugriffsebene',
        confirmCopilot: 'Bestätigen Sie Ihren Copilot unten.',
        accessLevelDescription: 'Wählen Sie unten eine Zugriffsebene aus. Sowohl Vollzugriff als auch eingeschränkter Zugriff ermöglichen es Co-Piloten, alle Gespräche und Ausgaben einzusehen.',
        roleDescription: function (_a) {
            var _b = _a === void 0 ? {} : _a, role = _b.role;
            switch (role) {
                case CONST_1.default.DELEGATE_ROLE.ALL:
                    return 'Erlauben Sie einem anderen Mitglied, alle Aktionen in Ihrem Konto in Ihrem Namen durchzuführen. Dazu gehören Chats, Einreichungen, Genehmigungen, Zahlungen, Einstellungen und mehr.';
                case CONST_1.default.DELEGATE_ROLE.SUBMITTER:
                    return 'Erlauben Sie einem anderen Mitglied, die meisten Aktionen in Ihrem Konto in Ihrem Namen durchzuführen. Ausgenommen sind Genehmigungen, Zahlungen, Ablehnungen und Sperren.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copilot entfernen',
        removeCopilotConfirmation: 'Möchten Sie diesen Copilot wirklich entfernen?',
        changeAccessLevel: 'Zugriffsebene ändern',
        makeSureItIsYou: 'Lassen Sie uns sicherstellen, dass Sie es sind',
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Bitte geben Sie den magischen Code ein, der an ".concat(contactMethod, " gesendet wurde, um einen Co-Piloten hinzuzuf\u00FCgen. Er sollte in ein bis zwei Minuten ankommen.");
        },
        enterMagicCodeUpdate: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Bitte geben Sie den magischen Code ein, der an ".concat(contactMethod, " gesendet wurde, um Ihren Copilot zu aktualisieren.");
        },
        notAllowed: 'Nicht so schnell...',
        noAccessMessage: 'Als Copilot hast du keinen Zugriff auf diese Seite. Entschuldigung!',
        notAllowedMessageStart: "Als ein",
        notAllowedMessageHyperLinked: 'Copilot',
        notAllowedMessageEnd: function (_a) {
            var accountOwnerEmail = _a.accountOwnerEmail;
            return "F\u00FCr ".concat(accountOwnerEmail, " haben Sie keine Berechtigung, diese Aktion auszuf\u00FChren. Entschuldigung!");
        },
        copilotAccess: 'Copilot-Zugriff',
    },
    debug: {
        debug: 'Debuggen',
        details: 'Einzelheiten',
        JSON: 'JSON',
        reportActions: 'Aktionen',
        reportActionPreview: 'Vorschau',
        nothingToPreview: 'Nichts zur Vorschau',
        editJson: 'Editiere JSON:',
        preview: 'Vorschau:',
        missingProperty: function (_a) {
            var propertyName = _a.propertyName;
            return "Fehlendes ".concat(propertyName);
        },
        invalidProperty: function (_a) {
            var propertyName = _a.propertyName, expectedType = _a.expectedType;
            return "Ung\u00FCltige Eigenschaft: ".concat(propertyName, " - Erwartet: ").concat(expectedType);
        },
        invalidValue: function (_a) {
            var expectedValues = _a.expectedValues;
            return "Ung\u00FCltiger Wert - Erwartet: ".concat(expectedValues);
        },
        missingValue: 'Fehlender Wert',
        createReportAction: 'Berichtaktion erstellen',
        reportAction: 'Aktion melden',
        report: 'Bericht',
        transaction: 'Transaktion',
        violations: 'Verstöße',
        transactionViolation: 'Transaktionsverstoß',
        hint: 'Datenänderungen werden nicht an das Backend gesendet.',
        textFields: 'Textfelder',
        numberFields: 'Zahlenfelder',
        booleanFields: 'Boolesche Felder',
        constantFields: 'Konstante Felder',
        dateTimeFields: 'DateTime-Felder',
        date: 'Datum',
        time: 'Zeit',
        none: 'Keine',
        visibleInLHN: 'Sichtbar in LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: 'false',
        viewReport: 'Bericht anzeigen',
        viewTransaction: 'Transaktion anzeigen',
        createTransactionViolation: 'Transaktionsverstoß erstellen',
        reasonVisibleInLHN: {
            hasDraftComment: 'Hat Entwurfskommentar',
            hasGBR: 'Has GBR',
            hasRBR: 'Hat RBR',
            pinnedByUser: 'Von Mitglied angeheftet',
            hasIOUViolations: 'Hat IOU-Verstöße',
            hasAddWorkspaceRoomErrors: 'Hat Fehler beim Hinzufügen des Arbeitsbereichsraums',
            isUnread: 'Ist ungelesen (Fokusmodus)',
            isArchived: 'Ist archiviert (neuester Modus)',
            isSelfDM: 'Ist Selbst-DM',
            isFocused: 'Ist vorübergehend fokussiert',
        },
        reasonGBR: {
            hasJoinRequest: 'Hat Beitrittsanfrage (Admin-Raum)',
            isUnreadWithMention: 'Ist ungelesen mit Erwähnung',
            isWaitingForAssigneeToCompleteAction: 'Wartet darauf, dass der Zuständige die Aktion abschließt.',
            hasChildReportAwaitingAction: 'Hat einen untergeordneten Bericht, der auf eine Aktion wartet',
            hasMissingInvoiceBankAccount: 'Fehlendes Rechnungsbankkonto',
        },
        reasonRBR: {
            hasErrors: 'Hat Fehler in den Berichtsdaten oder Berichtsaktionen',
            hasViolations: 'Hat Verstöße',
            hasTransactionThreadViolations: 'Hat Transaktions-Thread-Verstöße',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Es gibt einen Bericht, der auf eine Aktion wartet.',
            theresAReportWithErrors: 'Es gibt einen Bericht mit Fehlern',
            theresAWorkspaceWithCustomUnitsErrors: 'Es gibt einen Arbeitsbereich mit Fehlern bei benutzerdefinierten Einheiten.',
            theresAProblemWithAWorkspaceMember: 'Es gibt ein Problem mit einem Arbeitsbereichsmitglied.',
            theresAProblemWithAWorkspaceQBOExport: 'Es gab ein Problem mit einer Exporteinstellung der Arbeitsbereichsverbindung.',
            theresAProblemWithAContactMethod: 'Es gibt ein Problem mit einer Kontaktmethode',
            aContactMethodRequiresVerification: 'Eine Kontaktmethode erfordert eine Verifizierung',
            theresAProblemWithAPaymentMethod: 'Es gibt ein Problem mit einer Zahlungsmethode',
            theresAProblemWithAWorkspace: 'Es gibt ein Problem mit einem Arbeitsbereich.',
            theresAProblemWithYourReimbursementAccount: 'Es gibt ein Problem mit Ihrem Erstattungskonto',
            theresABillingProblemWithYourSubscription: 'Es gibt ein Abrechnungsproblem mit Ihrem Abonnement.',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Ihr Abonnement wurde erfolgreich erneuert.',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Während der Synchronisierung der Workspace-Verbindung ist ein Problem aufgetreten.',
            theresAProblemWithYourWallet: 'Es gibt ein Problem mit Ihrem Wallet.',
            theresAProblemWithYourWalletTerms: 'Es gibt ein Problem mit den Bedingungen Ihrer Brieftasche.',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Machen Sie eine Probefahrt',
    },
    migratedUserWelcomeModal: {
        title: 'Reisen und Ausgaben, in der Geschwindigkeit des Chats',
        subtitle: 'New Expensify hat die gleiche großartige Automatisierung, aber jetzt mit erstaunlicher Zusammenarbeit:',
        confirmText: "Los geht's!",
        features: {
            chat: '<strong>Chatten Sie direkt über jede Ausgabe</strong>, jeden Bericht oder Arbeitsbereich',
            scanReceipt: '<strong>Belege scannen</strong> und Rückerstattung erhalten',
            crossPlatform: 'Erledigen Sie <strong>alles</strong> von Ihrem Telefon oder Browser aus',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: {
            part1: 'Loslegen',
            part2: 'hier!',
        },
        saveSearchTooltip: {
            part1: 'Benennen Sie Ihre gespeicherten Suchen um',
            part2: 'hier!',
        },
        bottomNavInboxTooltip: {
            part1: 'Überprüfen Sie was',
            part2: 'benötigt Ihre Aufmerksamkeit',
            part3: 'und',
            part4: 'über Ausgaben chatten.',
        },
        workspaceChatTooltip: {
            part1: 'Chatten mit',
            part2: 'Genehmiger',
        },
        globalCreateTooltip: {
            part1: 'Ausgaben erstellen',
            part2: ', beginnen Sie zu chatten,',
            part3: 'und mehr.',
            part4: 'Probieren Sie es aus!',
        },
        GBRRBRChat: {
            part1: 'Du wirst 🟢 auf sehen',
            part2: 'Maßnahmen ergreifen',
            part3: ',\nund 🔴 auf',
            part4: 'Elemente zur Überprüfung.',
        },
        accountSwitcher: {
            part1: 'Zugriff auf Ihre',
            part2: 'Copilot-Konten',
            part3: 'hier',
        },
        expenseReportsFilter: {
            part1: 'Willkommen! Finden Sie alle Ihre',
            part2: 'Berichte des Unternehmens',
            part3: 'here.',
        },
        scanTestTooltip: {
            part1: 'Möchten Sie sehen, wie Scan funktioniert?',
            part2: 'Probieren Sie einen Testbeleg aus!',
            part3: 'Wählen Sie unsere',
            part4: 'Testmanager',
            part5: 'um es auszuprobieren!',
            part6: 'Jetzt,',
            part7: 'Reichen Sie Ihre Ausgaben ein',
            part8: 'und sieh zu, wie die Magie geschieht!',
            tryItOut: 'Probieren Sie es aus',
            noThanks: 'Nein danke',
        },
        outstandingFilter: {
            part1: 'Filter für Ausgaben, die',
            part2: 'Genehmigung erforderlich',
        },
        scanTestDriveTooltip: {
            part1: 'Diesen Beleg senden an',
            part2: 'Beenden Sie die Probefahrt!',
        },
    },
    discardChangesConfirmation: {
        title: 'Änderungen verwerfen?',
        body: 'Möchten Sie die vorgenommenen Änderungen wirklich verwerfen?',
        confirmText: 'Änderungen verwerfen',
    },
    scheduledCall: {
        book: {
            title: 'Anruf planen',
            description: 'Finden Sie eine Zeit, die für Sie passt.',
            slots: 'Verfügbare Zeiten für',
        },
        confirmation: {
            title: 'Anruf bestätigen',
            description: 'Stellen Sie sicher, dass die unten stehenden Details für Sie in Ordnung sind. Sobald Sie den Anruf bestätigen, senden wir eine Einladung mit weiteren Informationen.',
            setupSpecialist: 'Ihr Einrichtungsspezialist',
            meetingLength: 'Besprechungslänge',
            dateTime: 'Datum & Uhrzeit',
            minutes: '30 Minuten',
        },
        callScheduled: 'Anruf geplant',
    },
    autoSubmitModal: {
        title: 'Alles klar und eingereicht!',
        description: 'Alle Warnungen und Verstöße wurden beseitigt, daher:',
        submittedExpensesTitle: 'Diese Ausgaben wurden eingereicht',
        submittedExpensesDescription: 'Diese Ausgaben wurden an Ihren Genehmiger gesendet, können aber noch bearbeitet werden, bis sie genehmigt sind.',
        pendingExpensesTitle: 'Ausstehende Ausgaben wurden verschoben',
        pendingExpensesDescription: 'Alle ausstehenden Kartenausgaben wurden in einen separaten Bericht verschoben, bis sie gebucht werden.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Machen Sie eine 2-minütige Probefahrt',
        },
        modal: {
            title: 'Probieren Sie uns aus',
            description: 'Machen Sie eine schnelle Produkttour, um schnell auf den neuesten Stand zu kommen. Keine Zwischenstopps erforderlich!',
            confirmText: 'Testfahrt starten',
            helpText: 'Überspringen',
            employee: {
                description: '<muted-text>Holen Sie sich für Ihr Team <strong>3 kostenlose Monate Expensify!</strong> Geben Sie einfach die E-Mail-Adresse Ihres Chefs unten ein und senden Sie ihm eine Testausgabe.</muted-text>',
                email: 'Geben Sie die E-Mail-Adresse Ihres Chefs ein',
                error: 'Dieses Mitglied besitzt einen Arbeitsbereich, bitte geben Sie ein neues Mitglied zum Testen ein.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Sie testen derzeit Expensify',
            readyForTheRealThing: 'Bereit für das echte Ding?',
            getStarted: 'Loslegen',
        },
        employeeInviteMessage: function (_a) {
            var name = _a.name;
            return "# ".concat(name, " hat dich eingeladen, Expensify auszuprobieren\nHey! Ich habe uns gerade *3 Monate kostenlos* gesichert, um Expensify auszuprobieren, den schnellsten Weg, um Ausgaben zu verwalten.\n\nHier ist ein *Testbeleg*, um dir zu zeigen, wie es funktioniert:");
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
exports.default = translations;
