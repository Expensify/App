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
        count: 'Liczba',
        cancel: 'Anuluj',
        dismiss: 'Odrzuć',
        yes: 'Tak',
        no: 'Nie',
        ok: 'OK',
        notNow: 'Nie teraz',
        learnMore: 'Dowiedz się więcej.',
        buttonConfirm: 'Zrozumiałem.',
        name: 'Imię',
        attachment: 'Załącznik',
        attachments: 'Załączniki',
        center: 'Centrum',
        from: 'Od',
        to: 'Do',
        in: 'W',
        optional: 'Opcjonalny',
        new: 'Nowy',
        search: 'Szukaj',
        reports: 'Raporty',
        find: 'Znajdź',
        searchWithThreeDots: 'Szukaj...',
        next: 'Następny',
        previous: 'Poprzedni',
        goBack: 'Wróć',
        create: 'Utwórz',
        add: 'Dodaj',
        resend: 'Wyślij ponownie',
        save: 'Zapisz',
        select: 'Wybierz',
        deselect: 'Odznacz',
        selectMultiple: 'Wybierz wiele',
        saveChanges: 'Zapisz zmiany',
        submit: 'Prześlij',
        rotate: 'Obróć',
        zoom: 'Zoom',
        password: 'Hasło',
        magicCode: 'Magic code',
        twoFactorCode: 'Kod dwuskładnikowy',
        workspaces: 'Przestrzenie robocze',
        inbox: 'Skrzynka odbiorcza',
        success: 'Sukces',
        group: 'Grupa',
        profile: 'Profil',
        referral: 'Polecenie',
        payments: 'Płatności',
        approvals: 'Zatwierdzenia',
        wallet: 'Portfel',
        preferences: 'Preferencje',
        view: 'Widok',
        review: function (reviewParams) { return "Review".concat((reviewParams === null || reviewParams === void 0 ? void 0 : reviewParams.amount) ? " ".concat(reviewParams === null || reviewParams === void 0 ? void 0 : reviewParams.amount) : ''); },
        not: 'Nie',
        signIn: 'Zaloguj się',
        signInWithGoogle: 'Zaloguj się przez Google',
        signInWithApple: 'Zaloguj się za pomocą Apple',
        signInWith: 'Zaloguj się za pomocą',
        continue: 'Kontynuuj',
        firstName: 'Imię',
        lastName: 'Nazwisko',
        scanning: 'Skanowanie',
        addCardTermsOfService: 'Warunki korzystania z usługi Expensify',
        perPerson: 'na osobę',
        phone: 'Telefon',
        phoneNumber: 'Numer telefonu',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'Email',
        and: 'i',
        or: 'lub',
        details: 'Szczegóły',
        privacy: 'Prywatność',
        privacyPolicy: 'Polityka prywatności',
        hidden: 'Ukryty',
        visible: 'Widoczny',
        delete: 'Usuń',
        archived: 'zarchiwizowane',
        contacts: 'Kontakty',
        recents: 'Ostatnie',
        close: 'Zamknij',
        download: 'Pobierz',
        downloading: 'Pobieranie',
        uploading: 'Przesyłanie plików',
        pin: 'Przypnij',
        unPin: 'Odepnij',
        back: 'Wstecz',
        saveAndContinue: 'Zapisz i kontynuuj',
        settings: 'Ustawienia',
        termsOfService: 'Warunki korzystania z usługi',
        members: 'Członkowie',
        invite: 'Zaproś',
        here: 'tutaj',
        date: 'Data',
        dob: 'Data urodzenia',
        currentYear: 'Obecny rok',
        currentMonth: 'Bieżący miesiąc',
        ssnLast4: 'Ostatnie 4 cyfry numeru SSN',
        ssnFull9: 'Pełne 9 cyfr numeru SSN',
        addressLine: function (_a) {
            var lineNumber = _a.lineNumber;
            return "Linia adresowa ".concat(lineNumber);
        },
        personalAddress: 'Adres osobisty',
        companyAddress: 'Adres firmy',
        noPO: 'Proszę nie podawać adresów skrytek pocztowych ani adresów punktów odbioru.',
        city: 'Miasto',
        state: 'Stan',
        streetAddress: 'Adres ulicy',
        stateOrProvince: 'Stan / Prowincja',
        country: 'Kraj',
        zip: 'Kod pocztowy',
        zipPostCode: 'Kod pocztowy',
        whatThis: 'Co to jest?',
        iAcceptThe: 'Akceptuję',
        remove: 'Usuń',
        admin: 'Admin',
        owner: 'Właściciel',
        dateFormat: 'YYYY-MM-DD',
        send: 'Wyślij',
        na: 'N/A',
        noResultsFound: 'Nie znaleziono wyników',
        noResultsFoundMatching: function (_a) {
            var searchString = _a.searchString;
            return "Nie znaleziono wynik\u00F3w pasuj\u0105cych do \"".concat(searchString, "\"");
        },
        recentDestinations: 'Ostatnie miejsca docelowe',
        timePrefix: 'To jest',
        conjunctionFor: 'dla',
        todayAt: 'Dzisiaj o',
        tomorrowAt: 'Jutro o',
        yesterdayAt: 'Wczoraj o',
        conjunctionAt: 'at',
        conjunctionTo: 'do',
        genericErrorMessage: 'Ups... coś poszło nie tak i twoje żądanie nie mogło zostać zrealizowane. Spróbuj ponownie później.',
        percentage: 'Procent',
        error: {
            invalidAmount: 'Nieprawidłowa kwota',
            acceptTerms: 'Musisz zaakceptować Warunki korzystania z usługi, aby kontynuować',
            phoneNumber: "Prosz\u0119 wprowadzi\u0107 prawid\u0142owy numer telefonu z kodem kraju (np. ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")"),
            fieldRequired: 'To pole jest wymagane',
            requestModified: 'To żądanie jest modyfikowane przez innego członka.',
            characterLimitExceedCounter: function (_a) {
                var length = _a.length, limit = _a.limit;
                return "Przekroczono limit znak\u00F3w (".concat(length, "/").concat(limit, ")");
            },
            dateInvalid: 'Proszę wybrać prawidłową datę',
            invalidDateShouldBeFuture: 'Proszę wybrać dzisiejszą lub przyszłą datę',
            invalidTimeShouldBeFuture: 'Proszę wybrać czas co najmniej o minutę późniejszy.',
            invalidCharacter: 'Nieprawidłowy znak',
            enterMerchant: 'Wprowadź nazwę sprzedawcy',
            enterAmount: 'Wprowadź kwotę',
            missingMerchantName: 'Brakująca nazwa sprzedawcy',
            missingAmount: 'Brakująca kwota',
            missingDate: 'Brakująca data',
            enterDate: 'Wprowadź datę',
            invalidTimeRange: 'Proszę podać godzinę w formacie 12-godzinnym (np. 2:30 PM)',
            pleaseCompleteForm: 'Proszę wypełnić powyższy formularz, aby kontynuować.',
            pleaseSelectOne: 'Proszę wybrać jedną z opcji powyżej',
            invalidRateError: 'Proszę wprowadzić prawidłową stawkę',
            lowRateError: 'Stawka musi być większa niż 0',
            email: 'Proszę wprowadzić prawidłowy adres e-mail',
            login: 'Wystąpił błąd podczas logowania. Proszę spróbować ponownie.',
        },
        comma: 'przecinek',
        semicolon: 'semicolon',
        please: 'Proszę',
        contactUs: 'skontaktuj się z nami',
        pleaseEnterEmailOrPhoneNumber: 'Proszę wprowadzić adres e-mail lub numer telefonu',
        fixTheErrors: 'napraw błędy',
        inTheFormBeforeContinuing: 'w formularzu przed kontynuacją',
        confirm: 'Potwierdź',
        reset: 'Resetuj',
        done: 'Gotowe',
        more: 'Więcej',
        debitCard: 'Karta debetowa',
        bankAccount: 'Konto bankowe',
        personalBankAccount: 'Osobiste konto bankowe',
        businessBankAccount: 'Konto bankowe dla firm',
        join: 'Dołącz',
        leave: 'Opuść',
        decline: 'Odrzuć',
        transferBalance: 'Przelej saldo',
        cantFindAddress: 'Nie możesz znaleźć swojego adresu?',
        enterManually: 'Wprowadź ręcznie',
        message: 'Wiadomość',
        leaveThread: 'Opuść wątek',
        you: 'Ty',
        youAfterPreposition: 'ty',
        your: 'twój',
        conciergeHelp: 'Proszę skontaktować się z Concierge po pomoc.',
        youAppearToBeOffline: 'Wygląda na to, że jesteś offline.',
        thisFeatureRequiresInternet: 'Ta funkcja wymaga aktywnego połączenia z internetem.',
        attachmentWillBeAvailableOnceBackOnline: 'Załącznik będzie dostępny, gdy wróci online.',
        errorOccurredWhileTryingToPlayVideo: 'Wystąpił błąd podczas próby odtworzenia tego wideo.',
        areYouSure: 'Czy jesteś pewien?',
        verify: 'Zweryfikuj',
        yesContinue: 'Tak, kontynuuj.',
        websiteExample: 'e.g. https://www.expensify.com',
        zipCodeExampleFormat: function (_a) {
            var zipSampleFormat = _a.zipSampleFormat;
            return (zipSampleFormat ? "e.g. ".concat(zipSampleFormat) : '');
        },
        description: 'Opis',
        title: 'Tytuł',
        assignee: 'Przypisany',
        createdBy: 'Utworzone przez',
        with: 'z',
        shareCode: 'Udostępnij kod',
        share: 'Udostępnij',
        per: 'na',
        mi: 'mila',
        km: 'kilometr',
        copied: 'Skopiowano!',
        someone: 'Ktoś',
        total: 'Suma',
        edit: 'Edytuj',
        letsDoThis: "Zr\u00F3bmy to!",
        letsStart: "Zacznijmy",
        showMore: 'Pokaż więcej',
        merchant: 'Sprzedawca',
        category: 'Kategoria',
        report: 'Raport',
        billable: 'Podlegające fakturowaniu',
        nonBillable: 'Niepodlegające fakturowaniu',
        tag: 'Tag',
        receipt: 'Paragon',
        verified: 'Zweryfikowano',
        replace: 'Zastąp',
        distance: 'Odległość',
        mile: 'mila',
        miles: 'mile',
        kilometer: 'kilometr',
        kilometers: 'kilometry',
        recent: 'Najnowsze',
        all: 'Wszystko',
        am: 'AM',
        pm: 'PM',
        tbd: 'TBD',
        selectCurrency: 'Wybierz walutę',
        card: 'Karta',
        whyDoWeAskForThis: 'Dlaczego o to prosimy?',
        required: 'Wymagane',
        showing: 'Pokazywanie',
        of: 'of',
        default: 'Domyślny',
        update: 'Aktualizuj',
        member: 'Członek',
        auditor: 'Audytor',
        role: 'Rola',
        currency: 'Waluta',
        rate: 'Oceń',
        emptyLHN: {
            title: 'Hurra! Wszystko nadrobione.',
            subtitleText1: 'Znajdź czat używając',
            subtitleText2: 'przycisk powyżej lub stwórz coś za pomocą',
            subtitleText3: 'przycisk poniżej.',
        },
        businessName: 'Nazwa firmy',
        clear: 'Wyczyść',
        type: 'Rodzaj',
        action: 'Akcja',
        expenses: 'Wydatki',
        tax: 'Podatek',
        shared: 'Udostępnione',
        drafts: 'Szkice',
        finished: 'Zakończono',
        upgrade: 'Ulepszanie',
        downgradeWorkspace: 'Obniż poziom przestrzeni roboczej',
        companyID: 'ID firmy',
        userID: 'ID użytkownika',
        disable: 'Wyłącz',
        export: 'Eksportuj',
        initialValue: 'Wartość początkowa',
        currentDate: 'Current date',
        value: 'Wartość',
        downloadFailedTitle: 'Pobieranie nie powiodło się',
        downloadFailedDescription: 'Nie udało się zakończyć pobierania. Spróbuj ponownie później.',
        filterLogs: 'Filtruj dzienniki',
        network: 'Sieć',
        reportID: 'ID raportu',
        longID: 'Długi identyfikator',
        bankAccounts: 'Konta bankowe',
        chooseFile: 'Wybierz plik',
        chooseFiles: 'Wybierz pliki',
        dropTitle: 'Puść to',
        dropMessage: 'Prześlij swój plik tutaj',
        ignore: 'Ignore',
        enabled: 'Włączone',
        disabled: 'Wyłączony',
        import: 'Importuj',
        offlinePrompt: 'Nie możesz teraz podjąć tej akcji.',
        outstanding: 'Zaległe',
        chats: 'Czaty',
        tasks: 'Zadania',
        unread: 'Nieprzeczytane',
        sent: 'Wysłano',
        links: 'Linki',
        days: 'dni',
        rename: 'Zmień nazwę',
        address: 'Adres',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'Pomiń',
        chatWithAccountManager: function (_a) {
            var accountManagerDisplayName = _a.accountManagerDisplayName;
            return "Potrzebujesz czego\u015B konkretnego? Porozmawiaj ze swoim opiekunem konta, ".concat(accountManagerDisplayName, ".");
        },
        chatNow: 'Czat teraz',
        workEmail: 'Służbowy e-mail',
        destination: 'Cel',
        subrate: 'Subrate',
        perDiem: 'Dieta',
        validate: 'Zatwierdź',
        downloadAsPDF: 'Pobierz jako PDF',
        downloadAsCSV: 'Pobierz jako CSV',
        help: 'Pomoc',
        expenseReports: 'Raporty wydatków',
        rateOutOfPolicy: 'Oceń poza polityką',
        reimbursable: 'Podlegające zwrotowi',
        editYourProfile: 'Edytuj swój profil',
        comments: 'Komentarze',
        sharedIn: 'Udostępnione w',
        unreported: 'Nie zgłoszono',
        explore: 'Eksploruj',
        todo: 'Do zrobienia',
        invoice: 'Faktura',
        expense: 'Wydatek',
        chat: 'Czat',
        task: 'Zadanie',
        trip: 'Podróż',
        apply: 'Zastosuj',
        status: 'Status',
        on: 'Na',
        before: 'Przed',
        after: 'Po',
        reschedule: 'Przełożyć na inny termin',
        general: 'Ogólne',
        workspacesTabTitle: 'Przestrzenie robocze',
        getTheApp: 'Pobierz aplikację',
        scanReceiptsOnTheGo: 'Skanuj paragony za pomocą telefonu',
        headsUp: 'Uwaga!',
    },
    supportalNoAccess: {
        title: 'Nie tak szybko',
        description: 'Nie masz uprawnień do wykonania tej akcji, gdy wsparcie jest zalogowane.',
    },
    lockedAccount: {
        title: 'Zablokowane konto',
        description: 'Nie masz uprawnień do wykonania tej akcji, ponieważ to konto zostało zablokowane. Skontaktuj się z concierge@expensify.com, aby uzyskać dalsze instrukcje.',
    },
    location: {
        useCurrent: 'Użyj bieżącej lokalizacji',
        notFound: 'Nie udało nam się znaleźć Twojej lokalizacji. Spróbuj ponownie lub wprowadź adres ręcznie.',
        permissionDenied: 'Wygląda na to, że odmówiłeś dostępu do swojej lokalizacji.',
        please: 'Proszę',
        allowPermission: 'zezwól na dostęp do lokalizacji w ustawieniach',
        tryAgain: 'i spróbuj ponownie.',
    },
    contact: {
        importContacts: 'Importuj kontakty',
        importContactsTitle: 'Zaimportuj swoje kontakty',
        importContactsText: 'Zaimportuj kontakty z telefonu, aby Twoi ulubieni ludzie byli zawsze w zasięgu ręki.',
        importContactsExplanation: 'więc twoi ulubieni ludzie są zawsze w zasięgu ręki.',
        importContactsNativeText: 'Jeszcze tylko jeden krok! Daj nam zielone światło, aby zaimportować Twoje kontakty.',
    },
    anonymousReportFooter: {
        logoTagline: 'Dołącz do dyskusji.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Dostęp do aparatu',
        expensifyDoesNotHaveAccessToCamera: 'Expensify nie może robić zdjęć bez dostępu do Twojego aparatu. Stuknij ustawienia, aby zaktualizować uprawnienia.',
        attachmentError: 'Błąd załącznika',
        errorWhileSelectingAttachment: 'Wystąpił błąd podczas wybierania załącznika. Proszę spróbować ponownie.',
        errorWhileSelectingCorruptedAttachment: 'Wystąpił błąd podczas wybierania uszkodzonego załącznika. Proszę spróbować z innym plikiem.',
        takePhoto: 'Zrób zdjęcie',
        chooseFromGallery: 'Wybierz z galerii',
        chooseDocument: 'Wybierz plik',
        attachmentTooLarge: 'Załącznik jest zbyt duży',
        sizeExceeded: 'Rozmiar załącznika przekracza limit 24 MB',
        sizeExceededWithLimit: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "Rozmiar za\u0142\u0105cznika przekracza limit ".concat(maxUploadSizeInMB, " MB");
        },
        attachmentTooSmall: 'Załącznik jest zbyt mały',
        sizeNotMet: 'Rozmiar załącznika musi być większy niż 240 bajtów',
        wrongFileType: 'Nieprawidłowy typ pliku',
        notAllowedExtension: 'Ten typ pliku nie jest dozwolony. Proszę spróbować inny typ pliku.',
        folderNotAllowedMessage: 'Przesyłanie folderu jest niedozwolone. Proszę spróbować z innym plikiem.',
        protectedPDFNotSupported: 'Plik PDF chroniony hasłem nie jest obsługiwany',
        attachmentImageResized: 'Ten obraz został zmieniony na potrzeby podglądu. Pobierz, aby uzyskać pełną rozdzielczość.',
        attachmentImageTooLarge: 'Ten obraz jest zbyt duży, aby wyświetlić podgląd przed przesłaniem.',
        tooManyFiles: function (_a) {
            var fileLimit = _a.fileLimit;
            return "Mo\u017Cesz przes\u0142a\u0107 jednocze\u015Bnie maksymalnie ".concat(fileLimit, " plik\u00F3w.");
        },
        sizeExceededWithValue: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "Plik przekracza ".concat(maxUploadSizeInMB, " MB. Prosz\u0119 spr\u00F3bowa\u0107 ponownie.");
        },
        someFilesCantBeUploaded: 'Niektóre pliki nie mogą zostać przesłane',
        sizeLimitExceeded: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "Pliki musz\u0105 mie\u0107 mniej ni\u017C ".concat(maxUploadSizeInMB, " MB. Wi\u0119ksze pliki nie zostan\u0105 przes\u0142ane.");
        },
        maxFileLimitExceeded: 'Możesz przesłać maksymalnie 30 paragonów naraz. Dodatkowe nie zostaną przesłane.',
        unsupportedFileType: function (_a) {
            var fileType = _a.fileType;
            return "Pliki ".concat(fileType, " nie s\u0105 obs\u0142ugiwane. Tylko obs\u0142ugiwane typy plik\u00F3w zostan\u0105 przes\u0142ane.");
        },
        learnMoreAboutSupportedFiles: 'Dowiedz się więcej o obsługiwanych formatach.',
        passwordProtected: 'Pliki PDF chronione hasłem nie są obsługiwane. Tylko obsługiwane pliki zostaną przesłane.',
    },
    dropzone: {
        addAttachments: 'Dodaj załączniki',
        scanReceipts: 'Skanuj paragony',
        replaceReceipt: 'Zastąp paragon',
    },
    filePicker: {
        fileError: 'Błąd pliku',
        errorWhileSelectingFile: 'Wystąpił błąd podczas wybierania pliku. Proszę spróbować ponownie.',
    },
    connectionComplete: {
        title: 'Połączenie zakończone',
        supportingText: 'Możesz zamknąć to okno i wrócić do aplikacji Expensify.',
    },
    avatarCropModal: {
        title: 'Edytuj zdjęcie',
        description: 'Przeciągaj, powiększaj i obracaj swój obrazek, jak tylko chcesz.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Nie znaleziono rozszerzenia dla typu MIME',
        problemGettingImageYouPasted: 'Wystąpił problem z pobraniem obrazu, który wkleiłeś.',
        commentExceededMaxLength: function (_a) {
            var formattedMaxLength = _a.formattedMaxLength;
            return "Maksymalna d\u0142ugo\u015B\u0107 komentarza to ".concat(formattedMaxLength, " znak\u00F3w.");
        },
        taskTitleExceededMaxLength: function (_a) {
            var formattedMaxLength = _a.formattedMaxLength;
            return "Maksymalna d\u0142ugo\u015B\u0107 tytu\u0142u zadania to ".concat(formattedMaxLength, " znak\u00F3w.");
        },
    },
    baseUpdateAppModal: {
        updateApp: 'Zaktualizuj aplikację',
        updatePrompt: 'Nowa wersja tej aplikacji jest dostępna. Zaktualizuj teraz lub uruchom aplikację ponownie później, aby pobrać najnowsze zmiany.',
    },
    deeplinkWrapper: {
        launching: 'Uruchamianie Expensify',
        expired: 'Twoja sesja wygasła.',
        signIn: 'Proszę zalogować się ponownie.',
        redirectedToDesktopApp: 'Przekierowaliśmy Cię do aplikacji na komputer.',
        youCanAlso: 'Możesz również',
        openLinkInBrowser: 'otwórz ten link w przeglądarce',
        loggedInAs: function (_a) {
            var email = _a.email;
            return "Jeste\u015B zalogowany jako ".concat(email, ". Kliknij \u201EOtw\u00F3rz link\u201D w oknie dialogowym, aby zalogowa\u0107 si\u0119 do aplikacji desktopowej na to konto.");
        },
        doNotSeePrompt: 'Nie widzisz monitu?',
        tryAgain: 'Spróbuj ponownie',
        or: ', lub',
        continueInWeb: 'przejdź do aplikacji internetowej',
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abrakadabra, jesteś zalogowany!',
        successfulSignInDescription: 'Wróć do swojej oryginalnej karty, aby kontynuować.',
        title: 'Oto Twój magiczny kod',
        description: 'Proszę wprowadzić kod z urządzenia, na którym został pierwotnie zażądany',
        doNotShare: 'Nie udostępniaj swojego kodu nikomu. Expensify nigdy nie poprosi Cię o jego podanie!',
        or: ', lub',
        signInHere: 'zaloguj się tutaj',
        expiredCodeTitle: 'Kod magiczny wygasł',
        expiredCodeDescription: 'Wróć do oryginalnego urządzenia i poproś o nowy kod',
        successfulNewCodeRequest: 'Kod został wysłany. Proszę sprawdzić swoje urządzenie.',
        tfaRequiredTitle: 'Wymagana dwuetapowa weryfikacja',
        tfaRequiredDescription: 'Proszę wprowadzić kod uwierzytelniania dwuskładnikowego, gdzie próbujesz się zalogować.',
        requestOneHere: 'poproś o jeden tutaj.',
    },
    moneyRequestConfirmationList: {
        paidBy: 'Opłacone przez',
        whatsItFor: 'Do czego to służy?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: 'Imię, email lub numer telefonu',
        findMember: 'Znajdź członka',
        searchForSomeone: 'Wyszukaj kogoś',
    },
    emptyList: (_a = {},
        _a[CONST_1.default.IOU.TYPE.CREATE] = {
            title: 'Złóż wydatek, poleć swojego szefa',
            subtitleText: 'Chcesz, aby Twój szef również korzystał z Expensify? Po prostu prześlij mu raport wydatków, a my zajmiemy się resztą.',
        },
        _a),
    videoChatButtonAndMenu: {
        tooltip: 'Zarezerwuj rozmowę',
    },
    hello: 'Cześć',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: 'Rozpocznij poniżej.',
        anotherLoginPageIsOpen: 'Otwarta jest inna strona logowania.',
        anotherLoginPageIsOpenExplanation: 'Otworzyłeś stronę logowania w osobnej karcie. Zaloguj się z tej karty.',
        welcome: 'Witamy!',
        welcomeWithoutExclamation: 'Witamy',
        phrase2: 'Pieniądze mówią. A teraz, gdy czat i płatności są w jednym miejscu, jest to również łatwe.',
        phrase3: 'Twoje płatności docierają do Ciebie tak szybko, jak szybko potrafisz przekazać swoją myśl.',
        enterPassword: 'Proszę wprowadzić swoje hasło',
        welcomeNewFace: function (_a) {
            var login = _a.login;
            return "".concat(login, ", zawsze mi\u0142o widzie\u0107 now\u0105 twarz w okolicy!");
        },
        welcomeEnterMagicCode: function (_a) {
            var login = _a.login;
            return "Prosz\u0119 wprowadzi\u0107 magiczny kod wys\u0142any na ".concat(login, ". Powinien dotrze\u0107 w ci\u0105gu minuty lub dw\u00F3ch.");
        },
    },
    login: {
        hero: {
            header: 'Podróże i wydatki, z prędkością czatu',
            body: 'Witamy w nowej generacji Expensify, gdzie Twoje podróże i wydatki są szybsze dzięki kontekstowemu, rzeczywistemu czatowi.',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: function (_a) {
            var email = _a.email;
            return "Jeste\u015B ju\u017C zalogowany jako ".concat(email, ".");
        },
        goBackMessage: function (_a) {
            var provider = _a.provider;
            return "Nie chcesz logowa\u0107 si\u0119 za pomoc\u0105 ".concat(provider, "?");
        },
        continueWithMyCurrentSession: 'Kontynuuj moją obecną sesję',
        redirectToDesktopMessage: 'Przekierujemy Cię do aplikacji desktopowej po zakończeniu logowania.',
        signInAgreementMessage: 'Logując się, zgadzasz się na',
        termsOfService: 'Warunki korzystania z usługi',
        privacy: 'Prywatność',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Kontynuuj logowanie za pomocą jednokrotnego logowania:',
        orContinueWithMagicCode: 'Możesz również zalogować się za pomocą magicznego kodu',
        useSingleSignOn: 'Użyj jednokrotnego logowania (SSO)',
        useMagicCode: 'Użyj magicznego kodu',
        launching: 'Uruchamianie...',
        oneMoment: 'Chwila, przekierowujemy Cię do portalu logowania jednokrotnego Twojej firmy.',
    },
    reportActionCompose: {
        dropToUpload: 'Upuść, aby przesłać',
        sendAttachment: 'Wyślij załącznik',
        addAttachment: 'Dodaj załącznik',
        writeSomething: 'Napisz coś...',
        blockedFromConcierge: 'Komunikacja jest zablokowana',
        fileUploadFailed: 'Przesyłanie nie powiodło się. Plik nie jest obsługiwany.',
        localTime: function (_a) {
            var user = _a.user, time = _a.time;
            return "Jest ".concat(time, " dla ").concat(user);
        },
        edited: '(edycja)',
        emoji: 'Emoji',
        collapse: 'Zwiń',
        expand: 'Rozwiń',
    },
    reportActionContextMenu: {
        copyToClipboard: 'Skopiuj do schowka',
        copied: 'Skopiowano!',
        copyLink: 'Skopiuj link',
        copyURLToClipboard: 'Skopiuj URL do schowka',
        copyEmailToClipboard: 'Skopiuj e-mail do schowka',
        markAsUnread: 'Oznacz jako nieprzeczytane',
        markAsRead: 'Oznacz jako przeczytane',
        editAction: function (_a) {
            var action = _a.action;
            return "Edytuj ".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? 'wydatek' : 'komentarz');
        },
        deleteAction: function (_a) {
            var action = _a.action;
            return "Usu\u0144 ".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? 'wydatek' : 'komentarz');
        },
        deleteConfirmation: function (_a) {
            var action = _a.action;
            return "Czy na pewno chcesz usun\u0105\u0107 ten ".concat((action === null || action === void 0 ? void 0 : action.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ? 'wydatek' : 'komentarz', "?");
        },
        onlyVisible: 'Widoczne tylko dla',
        replyInThread: 'Odpowiedz w wątku',
        joinThread: 'Dołącz do wątku',
        leaveThread: 'Opuść wątek',
        copyOnyxData: 'Skopiuj dane Onyx',
        flagAsOffensive: 'Oznacz jako obraźliwe',
        menu: 'Menu',
    },
    emojiReactions: {
        addReactionTooltip: 'Dodaj reakcję',
        reactedWith: 'zareagował(a) za pomocą',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: 'Przegapiłeś imprezę w',
        beginningOfArchivedRoomPartTwo: ', nie ma tu nic do zobaczenia.',
        beginningOfChatHistoryDomainRoomPartOne: function (_a) {
            var domainRoom = _a.domainRoom;
            return "Ten czat jest z wszystkimi cz\u0142onkami Expensify na domenie ".concat(domainRoom, ".");
        },
        beginningOfChatHistoryDomainRoomPartTwo: 'Używaj go do rozmów ze współpracownikami, dzielenia się wskazówkami i zadawania pytań.',
        beginningOfChatHistoryAdminRoomPartOneFirst: 'Ta rozmowa jest z',
        beginningOfChatHistoryAdminRoomPartOneLast: 'admin.',
        beginningOfChatHistoryAdminRoomWorkspaceName: function (_a) {
            var workspaceName = _a.workspaceName;
            return " ".concat(workspaceName, " ");
        },
        beginningOfChatHistoryAdminRoomPartTwo: 'Użyj tego, aby porozmawiać o konfiguracji przestrzeni roboczej i nie tylko.',
        beginningOfChatHistoryAnnounceRoomPartOne: function (_a) {
            var workspaceName = _a.workspaceName;
            return "Ten czat jest z wszystkimi w ".concat(workspaceName, ".");
        },
        beginningOfChatHistoryAnnounceRoomPartTwo: "U\u017Cywaj tego do najwa\u017Cniejszych og\u0142osze\u0144.",
        beginningOfChatHistoryUserRoomPartOne: 'Ten pokój czatowy jest do wszystkiego.',
        beginningOfChatHistoryUserRoomPartTwo: 'related.',
        beginningOfChatHistoryInvoiceRoomPartOne: "Ten czat dotyczy faktur pomi\u0119dzy",
        beginningOfChatHistoryInvoiceRoomPartTwo: ". U\u017Cyj przycisku +, aby wys\u0142a\u0107 faktur\u0119.",
        beginningOfChatHistory: 'Ta rozmowa jest z',
        beginningOfChatHistoryPolicyExpenseChatPartOne: 'To jest miejsce, gdzie',
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'prześle wydatki do',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Po prostu użyj przycisku +.',
        beginningOfChatHistorySelfDM: 'To jest Twoja przestrzeń osobista. Używaj jej do notatek, zadań, szkiców i przypomnień.',
        beginningOfChatHistorySystemDM: 'Witamy! Zacznijmy konfigurację.',
        chatWithAccountManager: 'Czat z Twoim opiekunem konta tutaj',
        sayHello: 'Powiedz cześć!',
        yourSpace: 'Twoja przestrzeń',
        welcomeToRoom: function (_a) {
            var roomName = _a.roomName;
            return "Witamy w ".concat(roomName, "!");
        },
        usePlusButton: function (_a) {
            var additionalText = _a.additionalText;
            return "U\u017Cyj przycisku +, aby ".concat(additionalText, " wydatek.");
        },
        askConcierge: 'Zadawaj pytania i otrzymuj wsparcie w czasie rzeczywistym 24/7.',
        conciergeSupport: 'Całodobowe wsparcie',
        create: 'utwórz',
        iouTypes: {
            pay: 'zapłać',
            split: 'podzielić',
            submit: 'prześlij',
            track: 'śledzić',
            invoice: 'faktura',
        },
    },
    adminOnlyCanPost: 'Tylko administratorzy mogą wysyłać wiadomości w tym pokoju.',
    reportAction: {
        asCopilot: 'jako współpilot dla',
    },
    mentionSuggestions: {
        hereAlternateText: 'Powiadom wszystkich w tej rozmowie',
    },
    newMessages: 'Nowe wiadomości',
    youHaveBeenBanned: 'Uwaga: Zostałeś zbanowany z czatu na tym kanale.',
    reportTypingIndicator: {
        isTyping: 'pisze...',
        areTyping: 'piszą...',
        multipleMembers: 'Wielu członków',
    },
    reportArchiveReasons: (_b = {},
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.DEFAULT] = 'Ten pokój czatu został zarchiwizowany.',
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED] = function (_a) {
            var displayName = _a.displayName;
            return "Ten czat nie jest ju\u017C aktywny, poniewa\u017C ".concat(displayName, " zamkn\u0105\u0142 swoje konto.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED] = function (_a) {
            var displayName = _a.displayName, oldDisplayName = _a.oldDisplayName;
            return "Ten czat nie jest ju\u017C aktywny, poniewa\u017C ".concat(oldDisplayName, " po\u0142\u0105czy\u0142 swoje konto z ").concat(displayName, ".");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY] = function (_a) {
            var displayName = _a.displayName, policyName = _a.policyName, _b = _a.shouldUseYou, shouldUseYou = _b === void 0 ? false : _b;
            return shouldUseYou
                ? "Ten czat nie jest ju\u017C aktywny, poniewa\u017C <strong>ty</strong> nie jeste\u015B ju\u017C cz\u0142onkiem przestrzeni roboczej ".concat(policyName, ".")
                : "Ten czat nie jest ju\u017C aktywny, poniewa\u017C ".concat(displayName, " nie jest ju\u017C cz\u0142onkiem przestrzeni roboczej ").concat(policyName, ".");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.POLICY_DELETED] = function (_a) {
            var policyName = _a.policyName;
            return "Ten czat nie jest ju\u017C aktywny, poniewa\u017C ".concat(policyName, " nie jest ju\u017C aktywnym miejscem pracy.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED] = function (_a) {
            var policyName = _a.policyName;
            return "Ten czat nie jest ju\u017C aktywny, poniewa\u017C ".concat(policyName, " nie jest ju\u017C aktywnym miejscem pracy.");
        },
        _b[CONST_1.default.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED] = 'Ta rezerwacja jest zarchiwizowana.',
        _b),
    writeCapabilityPage: {
        label: 'Kto może opublikować',
        writeCapability: {
            all: 'Wszyscy członkowie',
            admins: 'Tylko administratorzy',
        },
    },
    sidebarScreen: {
        buttonFind: 'Znajdź coś...',
        buttonMySettings: 'Moje ustawienia',
        fabNewChat: 'Rozpocznij czat',
        fabNewChatExplained: 'Rozpocznij czat (Pływająca akcja)',
        chatPinned: 'Czat przypięty',
        draftedMessage: 'Wiadomość robocza',
        listOfChatMessages: 'Lista wiadomości czatu',
        listOfChats: 'Lista czatów',
        saveTheWorld: 'Ratuj świat',
        tooltip: 'Rozpocznij tutaj!',
        redirectToExpensifyClassicModal: {
            title: 'Już wkrótce',
            description: 'Dostosowujemy jeszcze kilka elementów Nowego Expensify, aby dopasować go do Twojej specyficznej konfiguracji. W międzyczasie przejdź do Expensify Classic.',
        },
    },
    allSettingsScreen: {
        subscription: 'Subskrypcja',
        domains: 'Domeny',
    },
    tabSelector: {
        chat: 'Czat',
        room: 'Pokój',
        distance: 'Odległość',
        manual: 'Podręcznik',
        scan: 'Skanuj',
    },
    spreadsheet: {
        upload: 'Prześlij arkusz kalkulacyjny',
        dragAndDrop: 'Przeciągnij i upuść swój arkusz kalkulacyjny tutaj lub wybierz plik poniżej. Obsługiwane formaty: .csv, .txt, .xls i .xlsx.',
        chooseSpreadsheet: 'Wybierz plik arkusza kalkulacyjnego do importu. Obsługiwane formaty: .csv, .txt, .xls i .xlsx.',
        fileContainsHeader: 'Plik zawiera nagłówki kolumn',
        column: function (_a) {
            var name = _a.name;
            return "Kolumna ".concat(name);
        },
        fieldNotMapped: function (_a) {
            var fieldName = _a.fieldName;
            return "Ups! Wymagane pole (\u201E".concat(fieldName, "\u201D) nie zosta\u0142o zmapowane. Prosz\u0119 sprawdzi\u0107 i spr\u00F3bowa\u0107 ponownie.");
        },
        singleFieldMultipleColumns: function (_a) {
            var fieldName = _a.fieldName;
            return "Ups! Przypisa\u0142e\u015B jedno pole (\"".concat(fieldName, "\") do wielu kolumn. Prosz\u0119 sprawd\u017A i spr\u00F3buj ponownie.");
        },
        emptyMappedField: function (_a) {
            var fieldName = _a.fieldName;
            return "Ups! Pole (\u201E".concat(fieldName, "\u201D) zawiera jedn\u0105 lub wi\u0119cej pustych warto\u015Bci. Prosz\u0119 sprawdzi\u0107 i spr\u00F3bowa\u0107 ponownie.");
        },
        importSuccessfulTitle: 'Import zakończony pomyślnie',
        importCategoriesSuccessfulDescription: function (_a) {
            var categories = _a.categories;
            return (categories > 1 ? "Dodano ".concat(categories, " kategorie.") : 'Dodano 1 kategorię.');
        },
        importMembersSuccessfulDescription: function (_a) {
            var added = _a.added, updated = _a.updated;
            if (!added && !updated) {
                return 'Nie dodano ani nie zaktualizowano żadnych członków.';
            }
            if (added && updated) {
                return "".concat(added, " cz\u0142onek").concat(added > 1 ? 's' : '', " dodany, ").concat(updated, " cz\u0142onek").concat(updated > 1 ? 's' : '', " zaktualizowany.");
            }
            if (updated) {
                return updated > 1 ? "Zaktualizowano ".concat(updated, " cz\u0142onk\u00F3w.") : '1 członek został zaktualizowany.';
            }
            return added > 1 ? "Dodano ".concat(added, " cz\u0142onk\u00F3w.") : 'Dodano 1 członka.';
        },
        importTagsSuccessfulDescription: function (_a) {
            var tags = _a.tags;
            return (tags > 1 ? "Dodano ".concat(tags, " tagi.") : 'Dodano 1 tag.');
        },
        importMultiLevelTagsSuccessfulDescription: 'Dodano tagi wielopoziomowe.',
        importPerDiemRatesSuccessfulDescription: function (_a) {
            var rates = _a.rates;
            return (rates > 1 ? "Dodano stawki dzienne ".concat(rates, ".") : 'Dodano 1 stawkę dzienną.');
        },
        importFailedTitle: 'Import nie powiódł się',
        importFailedDescription: 'Upewnij się, że wszystkie pola są wypełnione poprawnie i spróbuj ponownie. Jeśli problem będzie się powtarzał, skontaktuj się z Concierge.',
        importDescription: 'Wybierz, które pola chcesz zmapować z arkusza kalkulacyjnego, klikając menu rozwijane obok każdej zaimportowanej kolumny poniżej.',
        sizeNotMet: 'Rozmiar pliku musi być większy niż 0 bajtów',
        invalidFileMessage: 'Plik, który przesłałeś, jest pusty lub zawiera nieprawidłowe dane. Upewnij się, że plik jest poprawnie sformatowany i zawiera niezbędne informacje przed ponownym przesłaniem.',
        importSpreadsheet: 'Importuj arkusz kalkulacyjny',
        downloadCSV: 'Pobierz CSV',
    },
    receipt: {
        upload: 'Prześlij paragon',
        uploadMultiple: 'Prześlij paragony',
        dragReceiptBeforeEmail: 'Przeciągnij paragon na tę stronę, prześlij paragon do',
        dragReceiptsBeforeEmail: 'Przeciągnij paragony na tę stronę, prześlij paragony do',
        dragReceiptAfterEmail: 'lub wybierz plik do przesłania poniżej.',
        dragReceiptsAfterEmail: 'lub wybierz pliki do przesłania poniżej.',
        chooseReceipt: 'Wybierz paragon do przesłania lub prześlij paragon do',
        chooseReceipts: 'Wybierz paragony do przesłania lub prześlij paragony do',
        takePhoto: 'Zrób zdjęcie',
        cameraAccess: 'Dostęp do aparatu jest wymagany, aby robić zdjęcia paragonów.',
        deniedCameraAccess: 'Dostęp do kamery nadal nie został przyznany, proszę postępować zgodnie z',
        deniedCameraAccessInstructions: 'te instrukcje',
        cameraErrorTitle: 'Błąd aparatu',
        cameraErrorMessage: 'Wystąpił błąd podczas robienia zdjęcia. Spróbuj ponownie.',
        locationAccessTitle: 'Zezwól na dostęp do lokalizacji',
        locationAccessMessage: 'Dostęp do lokalizacji pomaga nam utrzymać dokładność strefy czasowej i waluty, gdziekolwiek się znajdujesz.',
        locationErrorTitle: 'Zezwól na dostęp do lokalizacji',
        locationErrorMessage: 'Dostęp do lokalizacji pomaga nam utrzymać dokładność strefy czasowej i waluty, gdziekolwiek się znajdujesz.',
        allowLocationFromSetting: "Dost\u0119p do lokalizacji pomaga nam utrzyma\u0107 dok\u0142adno\u015B\u0107 strefy czasowej i waluty, gdziekolwiek jeste\u015B. Prosz\u0119 zezwoli\u0107 na dost\u0119p do lokalizacji w ustawieniach uprawnie\u0144 urz\u0105dzenia.",
        dropTitle: 'Puść to',
        dropMessage: 'Prześlij swój plik tutaj',
        flash: 'błyskawica',
        multiScan: 'multi-skanowanie',
        shutter: 'migawka',
        gallery: 'galeria',
        deleteReceipt: 'Usuń paragon',
        deleteConfirmation: 'Czy na pewno chcesz usunąć ten paragon?',
        addReceipt: 'Dodaj paragon',
        scanFailed: 'Paragon nie może być zeskanowany, ponieważ brakuje sprzedawcy, daty lub kwoty.',
    },
    quickAction: {
        scanReceipt: 'Skanuj paragon',
        recordDistance: 'Śledź odległość',
        requestMoney: 'Utwórz wydatek',
        perDiem: 'Utwórz dietę',
        splitBill: 'Podziel wydatek',
        splitScan: 'Podziel paragon',
        splitDistance: 'Podziel odległość',
        paySomeone: function (_a) {
            var _b = _a === void 0 ? {} : _a, name = _b.name;
            return "Zap\u0142a\u0107 ".concat(name !== null && name !== void 0 ? name : 'ktoś');
        },
        assignTask: 'Przypisz zadanie',
        header: 'Szybka akcja',
        noLongerHaveReportAccess: 'Nie masz już dostępu do swojego poprzedniego miejsca docelowego szybkiej akcji. Wybierz nowe poniżej.',
        updateDestination: 'Zaktualizuj miejsce docelowe',
        createReport: 'Utwórz raport',
    },
    iou: {
        amount: 'Kwota',
        taxAmount: 'Kwota podatku',
        taxRate: 'Stawka podatkowa',
        approve: function (_a) {
            var _b = _a === void 0 ? {} : _a, formattedAmount = _b.formattedAmount;
            return (formattedAmount ? "Zatwierd\u017A ".concat(formattedAmount) : 'Zatwierdź');
        },
        approved: 'Zatwierdzono',
        cash: 'Gotówka',
        card: 'Karta',
        original: 'Oryginał',
        split: 'Podzielić',
        splitExpense: 'Podziel wydatek',
        splitExpenseSubtitle: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "".concat(amount, " od ").concat(merchant);
        },
        addSplit: 'Dodaj podział',
        totalAmountGreaterThanOriginal: function (_a) {
            var amount = _a.amount;
            return "Ca\u0142kowita kwota jest o ".concat(amount, " wi\u0119ksza ni\u017C pierwotny wydatek.");
        },
        totalAmountLessThanOriginal: function (_a) {
            var amount = _a.amount;
            return "Ca\u0142kowita kwota jest o ".concat(amount, " mniejsza ni\u017C pierwotny wydatek.");
        },
        splitExpenseZeroAmount: 'Proszę wprowadzić prawidłową kwotę przed kontynuowaniem.',
        splitExpenseEditTitle: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "Edytuj ".concat(amount, " dla ").concat(merchant);
        },
        removeSplit: 'Usuń podział',
        paySomeone: function (_a) {
            var _b = _a === void 0 ? {} : _a, name = _b.name;
            return "Zap\u0142a\u0107 ".concat(name !== null && name !== void 0 ? name : 'ktoś');
        },
        expense: 'Wydatek',
        categorize: 'Kategoryzuj',
        share: 'Udostępnij',
        participants: 'Uczestnicy',
        createExpense: 'Utwórz wydatek',
        trackDistance: 'Śledź odległość',
        createExpenses: function (_a) {
            var expensesNumber = _a.expensesNumber;
            return "Utw\u00F3rz ".concat(expensesNumber, " wydatki");
        },
        addExpense: 'Dodaj wydatek',
        chooseRecipient: 'Wybierz odbiorcę',
        createExpenseWithAmount: function (_a) {
            var amount = _a.amount;
            return "Utw\u00F3rz wydatek na kwot\u0119 ".concat(amount);
        },
        confirmDetails: 'Potwierdź szczegóły',
        pay: 'Zapłać',
        cancelPayment: 'Anuluj płatność',
        cancelPaymentConfirmation: 'Czy na pewno chcesz anulować tę płatność?',
        viewDetails: 'Zobacz szczegóły',
        pending: 'Oczekujące',
        canceled: 'Anulowano',
        posted: 'Opublikowano',
        deleteReceipt: 'Usuń paragon',
        deletedTransaction: function (_a) {
            var amount = _a.amount, merchant = _a.merchant;
            return "usun\u0105\u0142 wydatek w tym raporcie, ".concat(merchant, " - ").concat(amount);
        },
        movedFromReport: function (_a) {
            var reportName = _a.reportName;
            return "przeni\u00F3s\u0142 wydatek".concat(reportName ? "z ".concat(reportName) : '');
        },
        movedTransaction: function (_a) {
            var reportUrl = _a.reportUrl, reportName = _a.reportName;
            return "przeniesiono ten wydatek".concat(reportName ? "do <a href=\"".concat(reportUrl, "\">").concat(reportName, "</a>") : '');
        },
        unreportedTransaction: 'przeniósł ten wydatek do twojej przestrzeni osobistej',
        pendingMatchWithCreditCard: 'Paragon oczekuje na dopasowanie z transakcją kartą',
        pendingMatch: 'Oczekujące dopasowanie',
        pendingMatchWithCreditCardDescription: 'Paragon oczekuje na dopasowanie z transakcją kartą. Oznacz jako gotówka, aby anulować.',
        markAsCash: 'Oznacz jako gotówka',
        routePending: 'Trasa w toku...',
        receiptScanning: function () { return ({
            one: 'Skanowanie paragonu...',
            other: 'Skanowanie paragonów...',
        }); },
        scanMultipleReceipts: 'Skanuj wiele paragonów',
        scanMultipleReceiptsDescription: 'Zrób zdjęcia wszystkich swoich paragonów naraz, a następnie potwierdź szczegóły samodzielnie lub pozwól, aby SmartScan się tym zajął.',
        receiptScanInProgress: 'Skanowanie paragonu w toku',
        receiptScanInProgressDescription: 'Trwa skanowanie paragonu. Sprawdź później lub wprowadź dane teraz.',
        duplicateTransaction: function (_a) {
            var isSubmitted = _a.isSubmitted;
            return !isSubmitted
                ? 'Zidentyfikowano potencjalne duplikaty wydatków. Przejrzyj duplikaty, aby umożliwić przesłanie.'
                : 'Zidentyfikowano potencjalne duplikaty wydatków. Przejrzyj duplikaty, aby umożliwić zatwierdzenie.';
        },
        receiptIssuesFound: function () { return ({
            one: 'Znaleziono problem',
            other: 'Znalezione problemy',
        }); },
        fieldPending: 'Oczekujące...',
        defaultRate: 'Domyślna stawka',
        receiptMissingDetails: 'Brakujące szczegóły paragonu',
        missingAmount: 'Brakująca kwota',
        missingMerchant: 'Brakujący sprzedawca',
        receiptStatusTitle: 'Skanowanie…',
        receiptStatusText: 'Tylko Ty możesz zobaczyć ten paragon podczas skanowania. Sprawdź później lub wprowadź teraz szczegóły.',
        receiptScanningFailed: 'Skanowanie paragonu nie powiodło się. Proszę wprowadzić dane ręcznie.',
        transactionPendingDescription: 'Transakcja w toku. Może minąć kilka dni, zanim zostanie zaksięgowana.',
        companyInfo: 'Informacje o firmie',
        companyInfoDescription: 'Potrzebujemy kilku dodatkowych informacji, zanim będziesz mógł wysłać swoją pierwszą fakturę.',
        yourCompanyName: 'Nazwa Twojej firmy',
        yourCompanyWebsite: 'Strona internetowa Twojej firmy',
        yourCompanyWebsiteNote: 'Jeśli nie masz strony internetowej, możesz zamiast tego podać profil swojej firmy na LinkedIn lub w mediach społecznościowych.',
        invalidDomainError: 'Wprowadziłeś nieprawidłową domenę. Aby kontynuować, wprowadź prawidłową domenę.',
        publicDomainError: 'Wprowadziłeś domenę publiczną. Aby kontynuować, wprowadź domenę prywatną.',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: function (_a) {
            var _b = _a.scanningReceipts, scanningReceipts = _b === void 0 ? 0 : _b, _c = _a.pendingReceipts, pendingReceipts = _c === void 0 ? 0 : _c;
            var statusText = [];
            if (scanningReceipts > 0) {
                statusText.push("".concat(scanningReceipts, " skanowanie"));
            }
            if (pendingReceipts > 0) {
                statusText.push("".concat(pendingReceipts, " oczekuj\u0105ce"));
            }
            return {
                one: statusText.length > 0 ? "1 wydatek (".concat(statusText.join(', '), ")") : "1 wydatek",
                other: function (count) { return (statusText.length > 0 ? "".concat(count, " wydatki (").concat(statusText.join(', '), ")") : "".concat(count, " wydatki")); },
            };
        },
        expenseCount: function () {
            return {
                one: '1 wydatek',
                other: function (count) { return "".concat(count, " wydatki"); },
            };
        },
        deleteExpense: function () { return ({
            one: 'Usuń wydatek',
            other: 'Usuń wydatki',
        }); },
        deleteConfirmation: function () { return ({
            one: 'Czy na pewno chcesz usunąć ten wydatek?',
            other: 'Czy na pewno chcesz usunąć te wydatki?',
        }); },
        deleteReport: 'Usuń raport',
        deleteReportConfirmation: 'Czy na pewno chcesz usunąć ten raport?',
        settledExpensify: 'Zapłacono',
        done: 'Gotowe',
        settledElsewhere: 'Opłacone gdzie indziej',
        individual: 'Indywidualny',
        business: 'Biznes',
        settleExpensify: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Zap\u0142a\u0107 ".concat(formattedAmount, " za pomoc\u0105 Expensify") : "Zap\u0142a\u0107 z Expensify");
        },
        settlePersonal: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Zap\u0142a\u0107 ".concat(formattedAmount, " jako osoba prywatna") : "P\u0142a\u0107 jako osoba prywatna");
        },
        settlePayment: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return "Zap\u0142a\u0107 ".concat(formattedAmount);
        },
        settleBusiness: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Zap\u0142a\u0107 ".concat(formattedAmount, " jako firma") : "P\u0142a\u0107 jako firma");
        },
        payElsewhere: function (_a) {
            var formattedAmount = _a.formattedAmount;
            return (formattedAmount ? "Zap\u0142a\u0107 ".concat(formattedAmount, " gdzie indziej") : "Zap\u0142a\u0107 gdzie indziej");
        },
        nextStep: 'Następne kroki',
        finished: 'Zakończono',
        flip: 'Odwróć',
        sendInvoice: function (_a) {
            var amount = _a.amount;
            return "Wy\u015Blij faktur\u0119 na kwot\u0119 ".concat(amount);
        },
        submitAmount: function (_a) {
            var amount = _a.amount;
            return "Zatwierd\u017A ".concat(amount);
        },
        expenseAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount).concat(comment ? "dla ".concat(comment) : '');
        },
        submitted: "przes\u0142ano",
        automaticallySubmitted: "przes\u0142ane za pomoc\u0105 <a href=\"".concat(CONST_1.default.SELECT_WORKFLOWS_HELP_URL, "\">op\u00F3\u017Anij zg\u0142oszenia</a>"),
        trackedAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "\u015Bledzenie ".concat(formattedAmount).concat(comment ? "dla ".concat(comment) : '');
        },
        splitAmount: function (_a) {
            var amount = _a.amount;
            return "podziel ".concat(amount);
        },
        didSplitAmount: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "podziel ".concat(formattedAmount).concat(comment ? "dla ".concat(comment) : '');
        },
        yourSplit: function (_a) {
            var amount = _a.amount;
            return "Tw\u00F3j podzia\u0142 ".concat(amount);
        },
        payerOwesAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount, comment = _a.comment;
            return "".concat(payer, " jest winien ").concat(amount).concat(comment ? "dla ".concat(comment) : '');
        },
        payerOwes: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " jest winien:");
        },
        payerPaidAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount;
            return "".concat(payer ? "".concat(payer, " ") : '', "zap\u0142aci\u0142 ").concat(amount);
        },
        payerPaid: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " zap\u0142aci\u0142:");
        },
        payerSpentAmount: function (_a) {
            var payer = _a.payer, amount = _a.amount;
            return "".concat(payer, " wyda\u0142 ").concat(amount);
        },
        payerSpent: function (_a) {
            var payer = _a.payer;
            return "".concat(payer, " wyda\u0142:");
        },
        managerApproved: function (_a) {
            var manager = _a.manager;
            return "".concat(manager, " zatwierdzi\u0142:");
        },
        managerApprovedAmount: function (_a) {
            var manager = _a.manager, amount = _a.amount;
            return "".concat(manager, " zatwierdzi\u0142 ").concat(amount);
        },
        payerSettled: function (_a) {
            var amount = _a.amount;
            return "zap\u0142acono ".concat(amount);
        },
        payerSettledWithMissingBankAccount: function (_a) {
            var amount = _a.amount;
            return "zap\u0142acono ".concat(amount, ". Dodaj konto bankowe, aby otrzyma\u0107 swoj\u0105 p\u0142atno\u015B\u0107.");
        },
        automaticallyApproved: "zatwierdzono poprzez <a href=\"".concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">zasady przestrzeni roboczej</a>"),
        approvedAmount: function (_a) {
            var amount = _a.amount;
            return "zatwierdzono ".concat(amount);
        },
        approvedMessage: "zatwierdzony",
        unapproved: "niezatwierdzony",
        automaticallyForwarded: "zatwierdzono poprzez <a href=\"".concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">zasady przestrzeni roboczej</a>"),
        forwarded: "zatwierdzony",
        rejectedThisReport: 'odrzucono ten raport',
        waitingOnBankAccount: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName;
            return "rozpocz\u0119to rozliczanie. P\u0142atno\u015B\u0107 jest wstrzymana, dop\u00F3ki ".concat(submitterDisplayName, " nie doda konta bankowego.");
        },
        adminCanceledRequest: function (_a) {
            var manager = _a.manager;
            return "".concat(manager ? "".concat(manager, ": ") : '', " anulowa\u0142 p\u0142atno\u015B\u0107");
        },
        canceledRequest: function (_a) {
            var amount = _a.amount, submitterDisplayName = _a.submitterDisplayName;
            return "anulowano p\u0142atno\u015B\u0107 w wysoko\u015Bci ".concat(amount, ", poniewa\u017C ").concat(submitterDisplayName, " nie aktywowa\u0142 swojego Portfela Expensify w ci\u0105gu 30 dni");
        },
        settledAfterAddedBankAccount: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName, amount = _a.amount;
            return "".concat(submitterDisplayName, " doda\u0142 konto bankowe. P\u0142atno\u015B\u0107 w wysoko\u015Bci ").concat(amount, " zosta\u0142a dokonana.");
        },
        paidElsewhere: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', "zap\u0142acono gdzie indziej");
        },
        paidWithExpensify: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', "zap\u0142acono za pomoc\u0105 Expensify");
        },
        automaticallyPaidWithExpensify: function (_a) {
            var _b = _a === void 0 ? {} : _a, payer = _b.payer;
            return "".concat(payer ? "".concat(payer, " ") : '', "zap\u0142acono z Expensify za pomoc\u0105 <a href=\"").concat(CONST_1.default.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL, "\">zasad przestrzeni roboczej</a>");
        },
        noReimbursableExpenses: 'Ten raport ma nieprawidłową kwotę',
        pendingConversionMessage: 'Całkowita kwota zostanie zaktualizowana, gdy będziesz ponownie online.',
        changedTheExpense: 'zmienił wydatek',
        setTheRequest: function (_a) {
            var valueName = _a.valueName, newValueToDisplay = _a.newValueToDisplay;
            return "".concat(valueName, " na ").concat(newValueToDisplay);
        },
        setTheDistanceMerchant: function (_a) {
            var translatedChangedField = _a.translatedChangedField, newMerchant = _a.newMerchant, newAmountToDisplay = _a.newAmountToDisplay;
            return "ustaw ".concat(translatedChangedField, " na ").concat(newMerchant, ", co ustawi\u0142o kwot\u0119 na ").concat(newAmountToDisplay);
        },
        removedTheRequest: function (_a) {
            var valueName = _a.valueName, oldValueToDisplay = _a.oldValueToDisplay;
            return "".concat(valueName, " (wcze\u015Bniej ").concat(oldValueToDisplay, ")");
        },
        updatedTheRequest: function (_a) {
            var valueName = _a.valueName, newValueToDisplay = _a.newValueToDisplay, oldValueToDisplay = _a.oldValueToDisplay;
            return "".concat(valueName, " na ").concat(newValueToDisplay, " (wcze\u015Bniej ").concat(oldValueToDisplay, ")");
        },
        updatedTheDistanceMerchant: function (_a) {
            var translatedChangedField = _a.translatedChangedField, newMerchant = _a.newMerchant, oldMerchant = _a.oldMerchant, newAmountToDisplay = _a.newAmountToDisplay, oldAmountToDisplay = _a.oldAmountToDisplay;
            return "zmieni\u0142 ".concat(translatedChangedField, " na ").concat(newMerchant, " (wcze\u015Bniej ").concat(oldMerchant, "), co zaktualizowa\u0142o kwot\u0119 na ").concat(newAmountToDisplay, " (wcze\u015Bniej ").concat(oldAmountToDisplay, ")");
        },
        threadExpenseReportName: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount, " ").concat(comment ? "dla ".concat(comment) : 'wydatek');
        },
        invoiceReportName: function (_a) {
            var linkedReportID = _a.linkedReportID;
            return "Raport faktury nr ".concat(linkedReportID);
        },
        threadPaySomeoneReportName: function (_a) {
            var formattedAmount = _a.formattedAmount, comment = _a.comment;
            return "".concat(formattedAmount, " wys\u0142ano").concat(comment ? "dla ".concat(comment) : '');
        },
        movedFromPersonalSpace: function (_a) {
            var workspaceName = _a.workspaceName, reportName = _a.reportName;
            return "przeniesiono wydatek z przestrzeni osobistej do ".concat(workspaceName !== null && workspaceName !== void 0 ? workspaceName : "czat z ".concat(reportName));
        },
        movedToPersonalSpace: 'przeniesiono wydatek do przestrzeni osobistej',
        tagSelection: 'Wybierz tag, aby lepiej zorganizować swoje wydatki.',
        categorySelection: 'Wybierz kategorię, aby lepiej zorganizować swoje wydatki.',
        error: {
            invalidCategoryLength: 'Nazwa kategorii przekracza 255 znaków. Proszę ją skrócić lub wybrać inną kategorię.',
            invalidTagLength: 'Nazwa tagu przekracza 255 znaków. Proszę skrócić ją lub wybrać inny tag.',
            invalidAmount: 'Proszę wprowadzić prawidłową kwotę przed kontynuowaniem',
            invalidIntegerAmount: 'Proszę wprowadzić pełną kwotę w dolarach przed kontynuowaniem',
            invalidTaxAmount: function (_a) {
                var amount = _a.amount;
                return "Maksymalna kwota podatku to ".concat(amount);
            },
            invalidSplit: 'Suma podziałów musi być równa całkowitej kwocie',
            invalidSplitParticipants: 'Proszę wprowadzić kwotę większą niż zero dla co najmniej dwóch uczestników.',
            invalidSplitYourself: 'Proszę wprowadzić kwotę różną od zera dla podziału',
            noParticipantSelected: 'Proszę wybrać uczestnika',
            other: 'Nieoczekiwany błąd. Proszę spróbować ponownie później.',
            genericCreateFailureMessage: 'Nieoczekiwany błąd podczas przesyłania tego wydatku. Proszę spróbować ponownie później.',
            genericCreateInvoiceFailureMessage: 'Nieoczekiwany błąd podczas wysyłania tej faktury. Proszę spróbować ponownie później.',
            genericHoldExpenseFailureMessage: 'Nieoczekiwany błąd podczas wstrzymywania tego wydatku. Proszę spróbować ponownie później.',
            genericUnholdExpenseFailureMessage: 'Nieoczekiwany błąd podczas zdejmowania tego wydatku z blokady. Proszę spróbować ponownie później.',
            receiptDeleteFailureError: 'Nieoczekiwany błąd podczas usuwania tego paragonu. Proszę spróbować ponownie później.',
            receiptFailureMessage: 'Wystąpił błąd podczas przesyłania paragonu. Proszę',
            receiptFailureMessageShort: 'Wystąpił błąd podczas przesyłania paragonu.',
            tryAgainMessage: 'spróbuj ponownie',
            saveFileMessage: 'zapisz paragon',
            uploadLaterMessage: 'do przesłania później.',
            genericDeleteFailureMessage: 'Nieoczekiwany błąd podczas usuwania tego wydatku. Proszę spróbować ponownie później.',
            genericEditFailureMessage: 'Nieoczekiwany błąd podczas edytowania tego wydatku. Proszę spróbować ponownie później.',
            genericSmartscanFailureMessage: 'Transakcja ma brakujące pola',
            duplicateWaypointsErrorMessage: 'Proszę usunąć zduplikowane punkty trasy',
            atLeastTwoDifferentWaypoints: 'Proszę wprowadzić co najmniej dwa różne adresy',
            splitExpenseMultipleParticipantsErrorMessage: 'Wydatek nie może być podzielony między przestrzeń roboczą a innych członków. Proszę zaktualizować swój wybór.',
            invalidMerchant: 'Proszę wprowadzić prawidłowego sprzedawcę',
            atLeastOneAttendee: 'Należy wybrać co najmniej jednego uczestnika',
            invalidQuantity: 'Proszę wprowadzić prawidłową ilość',
            quantityGreaterThanZero: 'Ilość musi być większa niż zero',
            invalidSubrateLength: 'Musi być co najmniej jedna podstawka',
            invalidRate: 'Stawka nie jest ważna dla tego miejsca pracy. Proszę wybrać dostępną stawkę z tego miejsca pracy.',
        },
        dismissReceiptError: 'Zignoruj błąd',
        dismissReceiptErrorConfirmation: 'Uwaga! Zignorowanie tego błędu spowoduje całkowite usunięcie przesłanego paragonu. Czy jesteś pewien?',
        waitingOnEnabledWallet: function (_a) {
            var submitterDisplayName = _a.submitterDisplayName;
            return "rozpocz\u0119to rozliczanie. P\u0142atno\u015B\u0107 jest wstrzymana, dop\u00F3ki ".concat(submitterDisplayName, " nie aktywuje swojego portfela.");
        },
        enableWallet: 'Włącz portfel',
        hold: 'Trzymaj',
        unhold: 'Usuń blokadę',
        holdExpense: 'Wstrzymaj wydatek',
        unholdExpense: 'Odblokuj wydatek',
        heldExpense: 'zatrzymał ten wydatek',
        unheldExpense: 'odblokowano ten wydatek',
        moveUnreportedExpense: 'Przenieś niezgłoszony wydatek',
        addUnreportedExpense: 'Dodaj niezgłoszony wydatek',
        createNewExpense: 'Utwórz nowy wydatek',
        selectUnreportedExpense: 'Wybierz co najmniej jeden wydatek do dodania do raportu.',
        emptyStateUnreportedExpenseTitle: 'Brak niezgłoszonych wydatków',
        emptyStateUnreportedExpenseSubtitle: 'Wygląda na to, że nie masz żadnych niezgłoszonych wydatków. Spróbuj utworzyć jeden poniżej.',
        addUnreportedExpenseConfirm: 'Dodaj do raportu',
        explainHold: 'Wyjaśnij, dlaczego wstrzymujesz ten wydatek.',
        undoSubmit: 'Cofnij wysłanie',
        retracted: 'wycofany',
        undoClose: 'Cofnij zamknięcie',
        reopened: 'ponownie otwarty',
        reopenReport: 'Ponownie otwórz raport',
        reopenExportedReportConfirmation: function (_a) {
            var connectionName = _a.connectionName;
            return "Ten raport zosta\u0142 ju\u017C wyeksportowany do ".concat(connectionName, ". Zmiana mo\u017Ce prowadzi\u0107 do rozbie\u017Cno\u015Bci danych. Czy na pewno chcesz ponownie otworzy\u0107 ten raport?");
        },
        reason: 'Powód',
        holdReasonRequired: 'Wymagane jest podanie powodu wstrzymania.',
        expenseWasPutOnHold: 'Wydatek został wstrzymany',
        expenseOnHold: 'Ten wydatek został wstrzymany. Proszę zapoznać się z komentarzami, aby poznać kolejne kroki.',
        expensesOnHold: 'Wszystkie wydatki zostały wstrzymane. Proszę zapoznać się z komentarzami, aby poznać kolejne kroki.',
        expenseDuplicate: 'Ten wydatek ma podobne szczegóły do innego. Proszę przejrzeć duplikaty, aby kontynuować.',
        someDuplicatesArePaid: 'Niektóre z tych duplikatów zostały już zatwierdzone lub opłacone.',
        reviewDuplicates: 'Przejrzyj duplikaty',
        keepAll: 'Zachowaj wszystkie',
        confirmApprove: 'Potwierdź kwotę zatwierdzenia',
        confirmApprovalAmount: 'Zatwierdź tylko zgodne wydatki lub zatwierdź cały raport.',
        confirmApprovalAllHoldAmount: function () { return ({
            one: 'Ten wydatek jest wstrzymany. Czy mimo to chcesz zatwierdzić?',
            other: 'Te wydatki są wstrzymane. Czy mimo to chcesz je zatwierdzić?',
        }); },
        confirmPay: 'Potwierdź kwotę płatności',
        confirmPayAmount: 'Zapłać to, co nie jest wstrzymane, lub zapłać cały raport.',
        confirmPayAllHoldAmount: function () { return ({
            one: 'Ten wydatek jest wstrzymany. Czy mimo to chcesz zapłacić?',
            other: 'Te wydatki są wstrzymane. Czy mimo to chcesz zapłacić?',
        }); },
        payOnly: 'Płać tylko',
        approveOnly: 'Zatwierdź tylko',
        holdEducationalTitle: 'To żądanie jest w toku',
        holdEducationalText: 'trzymaj',
        whatIsHoldExplain: 'Wstrzymanie jest jak naciśnięcie „pauzy” na wydatku, aby poprosić o więcej szczegółów przed zatwierdzeniem lub płatnością.',
        holdIsLeftBehind: 'Wstrzymane wydatki są przenoszone do innego raportu po zatwierdzeniu lub opłaceniu.',
        unholdWhenReady: 'Osoby zatwierdzające mogą zdjąć blokadę z wydatków, gdy będą gotowe do zatwierdzenia lub płatności.',
        changePolicyEducational: {
            title: 'Przeniosłeś ten raport!',
            description: 'Sprawdź te elementy, które mają tendencję do zmiany podczas przenoszenia raportów do nowego obszaru roboczego.',
            reCategorize: '<strong>Przeklasyfikuj wszelkie wydatki</strong>, aby były zgodne z zasadami przestrzeni roboczej.',
            workflows: 'Ten raport może teraz podlegać innemu <strong>procesowi zatwierdzania.</strong>',
        },
        changeWorkspace: 'Zmień przestrzeń roboczą',
        set: 'set',
        changed: 'zmieniono',
        removed: 'removed',
        transactionPending: 'Transakcja w toku.',
        chooseARate: 'Wybierz stawkę zwrotu kosztów za milę lub kilometr dla przestrzeni roboczej',
        unapprove: 'Cofnij zatwierdzenie',
        unapproveReport: 'Cofnij zatwierdzenie raportu',
        headsUp: 'Uwaga!',
        unapproveWithIntegrationWarning: function (_a) {
            var accountingIntegration = _a.accountingIntegration;
            return "Ten raport zosta\u0142 ju\u017C wyeksportowany do ".concat(accountingIntegration, ". Zmiana mo\u017Ce prowadzi\u0107 do rozbie\u017Cno\u015Bci w danych. Czy na pewno chcesz cofn\u0105\u0107 zatwierdzenie tego raportu?");
        },
        reimbursable: 'podlegający zwrotowi',
        nonReimbursable: 'niepodlegający zwrotowi',
        bookingPending: 'Ta rezerwacja jest w toku',
        bookingPendingDescription: 'Ta rezerwacja jest w toku, ponieważ nie została jeszcze opłacona.',
        bookingArchived: 'Ta rezerwacja jest zarchiwizowana',
        bookingArchivedDescription: 'Ta rezerwacja jest zarchiwizowana, ponieważ data podróży minęła. Dodaj wydatek na ostateczną kwotę, jeśli to konieczne.',
        attendees: 'Uczestnicy',
        whoIsYourAccountant: 'Kim jest Twój księgowy?',
        paymentComplete: 'Płatność zakończona',
        time: 'Czas',
        startDate: 'Data rozpoczęcia',
        endDate: 'Data zakończenia',
        startTime: 'Czas rozpoczęcia',
        endTime: 'Czas zakończenia',
        deleteSubrate: 'Usuń podstawkę',
        deleteSubrateConfirmation: 'Czy na pewno chcesz usunąć tę podstawkę?',
        quantity: 'Ilość',
        subrateSelection: 'Wybierz podstawkę i wprowadź ilość.',
        qty: 'Ilość',
        firstDayText: function () { return ({
            one: "Pierwszy dzie\u0144: 1 godzina",
            other: function (count) { return "Pierwszy dzie\u0144: ".concat(count.toFixed(2), " godzin"); },
        }); },
        lastDayText: function () { return ({
            one: "Ostatni dzie\u0144: 1 godzina",
            other: function (count) { return "Ostatni dzie\u0144: ".concat(count.toFixed(2), " godzin"); },
        }); },
        tripLengthText: function () { return ({
            one: "Podr\u00F3\u017C: 1 pe\u0142ny dzie\u0144",
            other: function (count) { return "Podr\u00F3\u017C: ".concat(count, " pe\u0142ne dni"); },
        }); },
        dates: 'Daty',
        rates: 'Stawki',
        submitsTo: function (_a) {
            var name = _a.name;
            return "Przesy\u0142a do ".concat(name);
        },
        moveExpenses: function () { return ({ one: 'Przenieś wydatek', other: 'Przenieś wydatki' }); },
    },
    share: {
        shareToExpensify: 'Udostępnij do Expensify',
        messageInputLabel: 'Wiadomość',
    },
    notificationPreferencesPage: {
        header: 'Preferencje powiadomień',
        label: 'Powiadom mnie o nowych wiadomościach',
        notificationPreferences: {
            always: 'Natychmiast',
            daily: 'Codziennie',
            mute: 'Wycisz',
            hidden: 'Ukryty',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'Numer nie został zweryfikowany. Kliknij przycisk, aby ponownie wysłać link weryfikacyjny przez SMS.',
        emailHasNotBeenValidated: 'E-mail nie został zweryfikowany. Kliknij przycisk, aby ponownie wysłać link weryfikacyjny za pomocą wiadomości tekstowej.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Prześlij zdjęcie',
        removePhoto: 'Usuń zdjęcie',
        editImage: 'Edytuj zdjęcie',
        viewPhoto: 'Zobacz zdjęcie',
        imageUploadFailed: 'Przesyłanie obrazu nie powiodło się',
        deleteWorkspaceError: 'Przepraszamy, wystąpił nieoczekiwany problem podczas usuwania awatara Twojego miejsca pracy.',
        sizeExceeded: function (_a) {
            var maxUploadSizeInMB = _a.maxUploadSizeInMB;
            return "Wybrany obraz przekracza maksymalny rozmiar przesy\u0142ania wynosz\u0105cy ".concat(maxUploadSizeInMB, " MB.");
        },
        resolutionConstraints: function (_a) {
            var minHeightInPx = _a.minHeightInPx, minWidthInPx = _a.minWidthInPx, maxHeightInPx = _a.maxHeightInPx, maxWidthInPx = _a.maxWidthInPx;
            return "Prosz\u0119 przes\u0142a\u0107 obraz wi\u0119kszy ni\u017C ".concat(minHeightInPx, "x").concat(minWidthInPx, " pikseli i mniejszy ni\u017C ").concat(maxHeightInPx, "x").concat(maxWidthInPx, " pikseli.");
        },
        notAllowedExtension: function (_a) {
            var allowedExtensions = _a.allowedExtensions;
            return "Zdj\u0119cie profilowe musi by\u0107 jednym z nast\u0119puj\u0105cych typ\u00F3w: ".concat(allowedExtensions.join(', '), ".");
        },
    },
    modal: {
        backdropLabel: 'Tło Modalu',
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Preferowane zaimki',
        selectYourPronouns: 'Wybierz swoje zaimki',
        selfSelectYourPronoun: 'Samodzielnie wybierz swój zaimek',
        emailAddress: 'Adres e-mail',
        setMyTimezoneAutomatically: 'Ustaw mój czas automatycznie',
        timezone: 'Strefa czasowa',
        invalidFileMessage: 'Nieprawidłowy plik. Proszę spróbować inny obraz.',
        avatarUploadFailureMessage: 'Wystąpił błąd podczas przesyłania awatara. Proszę spróbować ponownie.',
        online: 'Online',
        offline: 'Offline',
        syncing: 'Synchronizowanie',
        profileAvatar: 'Avatar profilu',
        publicSection: {
            title: 'Publiczny',
            subtitle: 'Te szczegóły są wyświetlane na Twoim publicznym profilu. Każdy może je zobaczyć.',
        },
        privateSection: {
            title: 'Prywatne',
            subtitle: 'Te dane są używane do podróży i płatności. Nigdy nie są wyświetlane na Twoim publicznym profilu.',
        },
    },
    securityPage: {
        title: 'Opcje zabezpieczeń',
        subtitle: 'Włącz uwierzytelnianie dwuskładnikowe, aby zabezpieczyć swoje konto.',
        goToSecurity: 'Wróć do strony bezpieczeństwa',
    },
    shareCodePage: {
        title: 'Twój kod',
        subtitle: 'Zaproś członków do Expensify, udostępniając swój osobisty kod QR lub link referencyjny.',
    },
    pronounsPage: {
        pronouns: 'Zaimek osobowy',
        isShownOnProfile: 'Twoje zaimki są wyświetlane na Twoim profilu.',
        placeholderText: 'Wyszukaj, aby zobaczyć opcje',
    },
    contacts: {
        contactMethod: 'Metoda kontaktu',
        contactMethods: 'Metody kontaktu',
        featureRequiresValidate: 'Ta funkcja wymaga weryfikacji konta.',
        validateAccount: 'Zweryfikuj swoje konto',
        helpTextBeforeEmail: 'Dodaj więcej sposobów, aby ludzie mogli Cię znaleźć, i przekazuj paragony do',
        helpTextAfterEmail: 'z wielu adresów e-mail.',
        pleaseVerify: 'Proszę zweryfikować tę metodę kontaktu',
        getInTouch: 'Kiedy będziemy musieli się z Tobą skontaktować, użyjemy tej metody kontaktu.',
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Prosz\u0119 wprowadzi\u0107 magiczny kod wys\u0142any na ".concat(contactMethod, ". Powinien dotrze\u0107 w ci\u0105gu minuty lub dw\u00F3ch.");
        },
        setAsDefault: 'Ustaw jako domyślne',
        yourDefaultContactMethod: 'To jest Twoja domyślna metoda kontaktu. Zanim będziesz mógł ją usunąć, musisz wybrać inną metodę kontaktu i kliknąć „Ustaw jako domyślną”.',
        removeContactMethod: 'Usuń metodę kontaktu',
        removeAreYouSure: 'Czy na pewno chcesz usunąć tę metodę kontaktu? Tej operacji nie można cofnąć.',
        failedNewContact: 'Nie udało się dodać tej metody kontaktu.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Nie udało się wysłać nowego magicznego kodu. Proszę poczekać chwilę i spróbować ponownie.',
            validateSecondaryLogin: 'Niepoprawny lub nieważny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
            deleteContactMethod: 'Nie udało się usunąć metody kontaktu. Proszę skontaktować się z Concierge w celu uzyskania pomocy.',
            setDefaultContactMethod: 'Nie udało się ustawić nowej domyślnej metody kontaktu. Proszę skontaktować się z Concierge po pomoc.',
            addContactMethod: 'Nie udało się dodać tej metody kontaktu. Proszę skontaktować się z Concierge po pomoc.',
            enteredMethodIsAlreadySubmitted: 'Ta metoda kontaktu już istnieje',
            passwordRequired: 'wymagane hasło.',
            contactMethodRequired: 'Wymagana jest metoda kontaktu',
            invalidContactMethod: 'Nieprawidłowa metoda kontaktu',
        },
        newContactMethod: 'Nowa metoda kontaktu',
        goBackContactMethods: 'Wróć do metod kontaktu',
    },
    // cspell:disable
    pronouns: {
        coCos: 'Co / Cos',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: 'On / Jego / Jemu',
        heHimHisTheyThemTheirs: 'On / Jego / Jego / Oni / Ich / Ich',
        sheHerHers: 'Ona / Jej / Jej',
        sheHerHersTheyThemTheirs: 'Ona / Jej / Jej / Oni / Ich / Ich',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'Oni / Ich / Ich',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Zadzwoń do mnie po imieniu',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: 'Nazwa wyświetlana',
        isShownOnProfile: 'Twoja nazwa wyświetlana jest widoczna na Twoim profilu.',
    },
    timezonePage: {
        timezone: 'Strefa czasowa',
        isShownOnProfile: 'Twoja strefa czasowa jest wyświetlana na Twoim profilu.',
        getLocationAutomatically: 'Automatycznie określ swoją lokalizację',
    },
    updateRequiredView: {
        updateRequired: 'Wymagana aktualizacja',
        pleaseInstall: 'Proszę zaktualizować do najnowszej wersji New Expensify.',
        pleaseInstallExpensifyClassic: 'Proszę zainstalować najnowszą wersję Expensify',
        toGetLatestChanges: 'Na urządzenia mobilne lub stacjonarne pobierz i zainstaluj najnowszą wersję. W przypadku przeglądarki internetowej odśwież swoją przeglądarkę.',
        newAppNotAvailable: 'Aplikacja New Expensify nie jest już dostępna.',
    },
    initialSettingsPage: {
        about: 'O aplikacji',
        aboutPage: {
            description: 'Nowa aplikacja Expensify jest tworzona przez społeczność deweloperów open-source z całego świata. Pomóż nam budować przyszłość Expensify.',
            appDownloadLinks: 'Linki do pobrania aplikacji',
            viewKeyboardShortcuts: 'Wyświetl skróty klawiaturowe',
            viewTheCode: 'Zobacz kod',
            viewOpenJobs: 'Zobacz dostępne oferty pracy',
            reportABug: 'Zgłoś błąd',
            troubleshoot: 'Rozwiązywanie problemów',
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
            clearCacheAndRestart: 'Wyczyść pamięć podręczną i uruchom ponownie',
            viewConsole: 'Wyświetl konsolę debugowania',
            debugConsole: 'Konsola debugowania',
            description: 'Użyj poniższych narzędzi, aby pomóc w rozwiązywaniu problemów z działaniem Expensify. Jeśli napotkasz jakiekolwiek problemy, proszę',
            submitBug: 'zgłoś błąd',
            confirmResetDescription: 'Wszystkie niesłane wiadomości robocze zostaną utracone, ale reszta Twoich danych jest bezpieczna.',
            resetAndRefresh: 'Zresetuj i odśwież',
            clientSideLogging: 'Logowanie po stronie klienta',
            noLogsToShare: 'Brak dzienników do udostępnienia',
            useProfiling: 'Użyj profilowania',
            profileTrace: 'Ślad profilu',
            results: 'Wyniki',
            releaseOptions: 'Opcje wydania',
            testingPreferences: 'Testowanie preferencji',
            useStagingServer: 'Użyj serwera Staging',
            forceOffline: 'Wymuś tryb offline',
            simulatePoorConnection: 'Symuluj słabe połączenie internetowe',
            simulateFailingNetworkRequests: 'Symuluj nieudane żądania sieciowe',
            authenticationStatus: 'Status uwierzytelnienia',
            deviceCredentials: 'Dane uwierzytelniające urządzenia',
            invalidate: 'Unieważnij',
            destroy: 'Zniszczyć',
            maskExportOnyxStateData: 'Maskuj wrażliwe dane członków podczas eksportowania stanu Onyx',
            exportOnyxState: 'Eksportuj stan Onyx',
            importOnyxState: 'Importuj stan Onyx',
            testCrash: 'Test awarii',
            resetToOriginalState: 'Przywróć do stanu początkowego',
            usingImportedState: 'Używasz zaimportowanego stanu. Naciśnij tutaj, aby go wyczyścić.',
            debugMode: 'Tryb debugowania',
            invalidFile: 'Nieprawidłowy plik',
            invalidFileDescription: 'Plik, który próbujesz zaimportować, jest nieprawidłowy. Spróbuj ponownie.',
            invalidateWithDelay: 'Unieważnij z opóźnieniem',
            recordTroubleshootData: 'Rejestrowanie danych rozwiązywania problemów',
        },
        debugConsole: {
            saveLog: 'Zapisz log',
            shareLog: 'Udostępnij dziennik',
            enterCommand: 'Wpisz polecenie',
            execute: 'Wykonaj',
            noLogsAvailable: 'Brak dostępnych logów',
            logSizeTooLarge: function (_a) {
                var size = _a.size;
                return "Rozmiar dziennika przekracza limit ".concat(size, " MB. Prosz\u0119 u\u017Cy\u0107 \"Zapisz dziennik\", aby pobra\u0107 plik dziennika.");
            },
            logs: 'Dzienniki',
            viewConsole: 'Wyświetl konsolę',
        },
        security: 'Bezpieczeństwo',
        signOut: 'Wyloguj się',
        restoreStashed: 'Przywróć zapisane logowanie',
        signOutConfirmationText: 'Utracisz wszystkie zmiany offline, jeśli się wylogujesz.',
        versionLetter: 'v',
        readTheTermsAndPrivacy: {
            phrase1: 'Przeczytaj',
            phrase2: 'Warunki korzystania z usługi',
            phrase3: 'i',
            phrase4: 'Prywatność',
        },
        help: 'Pomoc',
        accountSettings: 'Ustawienia konta',
        account: 'Konto',
        general: 'Ogólne',
    },
    closeAccountPage: {
        closeAccount: 'Zamknij konto',
        reasonForLeavingPrompt: 'Będzie nam przykro, jeśli odejdziesz! Czy mógłbyś nam powiedzieć dlaczego, abyśmy mogli się poprawić?',
        enterMessageHere: 'Wprowadź wiadomość tutaj',
        closeAccountWarning: 'Zamknięcie konta jest nieodwracalne.',
        closeAccountPermanentlyDeleteData: 'Czy na pewno chcesz usunąć swoje konto? Spowoduje to trwałe usunięcie wszystkich zaległych wydatków.',
        enterDefaultContactToConfirm: 'Proszę podać domyślną metodę kontaktu, aby potwierdzić chęć zamknięcia konta. Twoja domyślna metoda kontaktu to:',
        enterDefaultContact: 'Wprowadź domyślną metodę kontaktu',
        defaultContact: 'Domyślna metoda kontaktu:',
        enterYourDefaultContactMethod: 'Proszę podać domyślną metodę kontaktu, aby zamknąć konto.',
    },
    mergeAccountsPage: {
        mergeAccount: 'Połącz konta',
        accountDetails: {
            accountToMergeInto: 'Wprowadź konto, z którym chcesz połączyć',
            notReversibleConsent: 'Rozumiem, że to jest nieodwracalne',
        },
        accountValidate: {
            confirmMerge: 'Czy na pewno chcesz połączyć konta?',
            lossOfUnsubmittedData: "Scalanie kont jest nieodwracalne i spowoduje utrat\u0119 wszelkich niezatwierdzonych wydatk\u00F3w dla",
            enterMagicCode: "Aby kontynuowa\u0107, wprowad\u017A magiczny kod wys\u0142any na",
            errors: {
                incorrectMagicCode: 'Niepoprawny lub nieważny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
                fallback: 'Coś poszło nie tak. Spróbuj ponownie później.',
            },
        },
        mergeSuccess: {
            accountsMerged: 'Konta połączone!',
            successfullyMergedAllData: {
                beforeFirstEmail: "Pomy\u015Blnie scalono wszystkie dane z",
                beforeSecondEmail: "do",
                afterSecondEmail: ". Przechodz\u0105c dalej, mo\u017Cesz u\u017Cywa\u0107 dowolnego logowania dla tego konta.",
            },
        },
        mergePendingSAML: {
            weAreWorkingOnIt: 'Pracujemy nad tym',
            limitedSupport: 'Nie obsługujemy jeszcze łączenia kont w New Expensify. Proszę wykonać tę czynność w Expensify Classic.',
            reachOutForHelp: {
                beforeLink: 'Nie krępuj się, aby',
                linkText: 'skontaktuj się z Concierge',
                afterLink: 'jeśli masz jakieś pytania!',
            },
            goToExpensifyClassic: 'Przejdź do Expensify Classic',
        },
        mergeFailureSAMLDomainControl: {
            beforeFirstEmail: 'Nie możesz połączyć',
            beforeDomain: 'ponieważ jest kontrolowane przez',
            afterDomain: '. Proszę',
            linkText: 'skontaktuj się z Concierge',
            afterLink: 'w celu uzyskania pomocy.',
        },
        mergeFailureSAMLAccount: {
            beforeEmail: 'Nie możesz połączyć',
            afterEmail: 'do innych kont, ponieważ administrator domeny ustawił je jako Twoje główne logowanie. Zamiast tego połącz inne konta z nim.',
        },
        mergeFailure2FA: {
            oldAccount2FAEnabled: {
                beforeFirstEmail: 'Nie możesz połączyć kont, ponieważ',
                beforeSecondEmail: 'ma włączone uwierzytelnianie dwuskładnikowe (2FA). Proszę wyłączyć 2FA dla',
                afterSecondEmail: 'i spróbuj ponownie.',
            },
            learnMore: 'Dowiedz się więcej o łączeniu kont.',
        },
        mergeFailureAccountLocked: {
            beforeEmail: 'Nie możesz połączyć',
            afterEmail: 'ponieważ jest zablokowane. Proszę',
            linkText: 'skontaktuj się z Concierge',
            afterLink: "po pomoc.",
        },
        mergeFailureUncreatedAccount: {
            noExpensifyAccount: {
                beforeEmail: 'Nie możesz połączyć kont, ponieważ',
                afterEmail: 'nie ma konta Expensify.',
            },
            addContactMethod: {
                beforeLink: 'Proszę',
                linkText: 'dodaj to jako metodę kontaktu',
                afterLink: 'zamiast.',
            },
        },
        mergeFailureSmartScannerAccount: {
            beforeEmail: 'Nie możesz połączyć',
            afterEmail: 'do innych kont. Proszę połączyć inne konta z nim zamiast tego.',
        },
        mergeFailureInvoicedAccount: {
            beforeEmail: 'Nie możesz połączyć',
            afterEmail: 'do innych kont, ponieważ jest właścicielem rozliczeń konta fakturowanego. Proszę połączyć inne konta z nim zamiast tego.',
        },
        mergeFailureTooManyAttempts: {
            heading: 'Spróbuj ponownie później',
            description: 'Było zbyt wiele prób połączenia kont. Proszę spróbować ponownie później.',
        },
        mergeFailureUnvalidatedAccount: {
            description: 'Nie możesz połączyć się z innymi kontami, ponieważ nie jest ono zweryfikowane. Proszę zweryfikować konto i spróbować ponownie.',
        },
        mergeFailureSelfMerge: {
            description: 'Nie można połączyć konta z samym sobą.',
        },
        mergeFailureGenericHeading: 'Nie można połączyć kont',
    },
    lockAccountPage: {
        reportSuspiciousActivity: 'Zgłoś podejrzaną aktywność',
        lockAccount: 'Zablokuj konto',
        unlockAccount: 'Odblokuj konto',
        compromisedDescription: 'Zauważyłeś coś podejrzanego? Zgłoszenie spowoduje natychmiastowe zablokowanie konta, zatrzymanie transakcji kartą Expensify i uniemożliwienie zmian.',
        domainAdminsDescription: 'Dla administratorów domen: wstrzymuje to również wszystkie działania kart Expensify i działania administracyjne w Twoich domenach.',
        areYouSure: 'Czy na pewno chcesz zablokować swoje konto Expensify?',
        ourTeamWill: 'Nasz zespół zbada sprawę i usunie nieautoryzowany dostęp. Aby odzyskać dostęp, musisz współpracować z Concierge.',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'Nie udało się zablokować konta',
        failedToLockAccountDescription: "Nie mogli\u015Bmy zablokowa\u0107 Twojego konta. Prosz\u0119 porozmawia\u0107 z Concierge, aby rozwi\u0105za\u0107 ten problem.",
        chatWithConcierge: 'Czat z Concierge',
    },
    unlockAccountPage: {
        accountLocked: 'Konto zablokowane',
        yourAccountIsLocked: 'Twoje konto jest zablokowane',
        chatToConciergeToUnlock: 'Porozmawiaj z Concierge, aby rozwiązać problemy związane z bezpieczeństwem i odblokować swoje konto.',
        chatWithConcierge: 'Czat z Concierge',
    },
    passwordPage: {
        changePassword: 'Zmień hasło',
        changingYourPasswordPrompt: 'Zmiana hasła spowoduje aktualizację hasła zarówno dla Twojego konta Expensify.com, jak i New Expensify.',
        currentPassword: 'Obecne hasło',
        newPassword: 'Nowe hasło',
        newPasswordPrompt: 'Twoje nowe hasło musi się różnić od starego hasła i zawierać co najmniej 8 znaków, 1 wielką literę, 1 małą literę i 1 cyfrę.',
    },
    twoFactorAuth: {
        headerTitle: 'Uwierzytelnianie dwuskładnikowe',
        twoFactorAuthEnabled: 'Uwierzytelnianie dwuskładnikowe włączone',
        whatIsTwoFactorAuth: 'Uwierzytelnianie dwuskładnikowe (2FA) pomaga chronić Twoje konto. Podczas logowania będziesz musiał wprowadzić kod wygenerowany przez preferowaną aplikację uwierzytelniającą.',
        disableTwoFactorAuth: 'Wyłącz uwierzytelnianie dwuskładnikowe',
        explainProcessToRemove: 'Aby wyłączyć uwierzytelnianie dwuskładnikowe (2FA), wprowadź prawidłowy kod z aplikacji uwierzytelniającej.',
        disabled: 'Uwierzytelnianie dwuskładnikowe zostało teraz wyłączone',
        noAuthenticatorApp: 'Nie będziesz już potrzebować aplikacji uwierzytelniającej, aby zalogować się do Expensify.',
        stepCodes: 'Kody odzyskiwania',
        keepCodesSafe: 'Zachowaj te kody odzyskiwania w bezpiecznym miejscu!',
        codesLoseAccess: 'Jeśli stracisz dostęp do aplikacji uwierzytelniającej i nie masz tych kodów, stracisz dostęp do swojego konta.\n\nUwaga: Ustawienie uwierzytelniania dwuskładnikowego spowoduje wylogowanie ze wszystkich innych aktywnych sesji.',
        errorStepCodes: 'Proszę skopiować lub pobrać kody przed kontynuowaniem.',
        stepVerify: 'Zweryfikuj',
        scanCode: 'Zeskanuj kod QR za pomocą swojego',
        authenticatorApp: 'aplikacja uwierzytelniająca',
        addKey: 'Lub dodaj ten klucz tajny do swojej aplikacji uwierzytelniającej:',
        enterCode: 'Następnie wprowadź sześciocyfrowy kod wygenerowany przez aplikację uwierzytelniającą.',
        stepSuccess: 'Zakończono',
        enabled: 'Uwierzytelnianie dwuskładnikowe włączone',
        congrats: 'Gratulacje! Teraz masz dodatkowe zabezpieczenie.',
        copy: 'Kopiuj',
        disable: 'Wyłącz',
        enableTwoFactorAuth: 'Włącz uwierzytelnianie dwuskładnikowe',
        pleaseEnableTwoFactorAuth: 'Proszę włączyć uwierzytelnianie dwuskładnikowe.',
        twoFactorAuthIsRequiredDescription: 'Ze względów bezpieczeństwa Xero wymaga uwierzytelniania dwuskładnikowego do połączenia integracji.',
        twoFactorAuthIsRequiredForAdminsHeader: 'Wymagana dwuskładnikowa autoryzacja',
        twoFactorAuthIsRequiredForAdminsTitle: 'Proszę włączyć uwierzytelnianie dwuskładnikowe',
        twoFactorAuthIsRequiredForAdminsDescription: 'Twoje połączenie z Xero wymaga użycia uwierzytelniania dwuskładnikowego. Aby kontynuować korzystanie z Expensify, proszę je włączyć.',
        twoFactorAuthCannotDisable: 'Nie można wyłączyć 2FA',
        twoFactorAuthRequired: 'Do połączenia z Xero wymagana jest uwierzytelnianie dwuskładnikowe (2FA) i nie można go wyłączyć.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'Proszę wprowadzić swój kod odzyskiwania',
            incorrectRecoveryCode: 'Nieprawidłowy kod odzyskiwania. Proszę spróbować ponownie.',
        },
        useRecoveryCode: 'Użyj kodu odzyskiwania',
        recoveryCode: 'Kod odzyskiwania',
        use2fa: 'Użyj kodu uwierzytelniania dwuskładnikowego',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'Proszę wprowadzić swój kod uwierzytelniania dwuskładnikowego',
            incorrect2fa: 'Nieprawidłowy kod uwierzytelniania dwuskładnikowego. Proszę spróbować ponownie.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'Hasło zaktualizowane!',
        allSet: 'Wszystko gotowe. Zachowaj swoje nowe hasło w bezpiecznym miejscu.',
    },
    privateNotes: {
        title: 'Prywatne notatki',
        personalNoteMessage: 'Prowadź notatki dotyczące tej rozmowy tutaj. Jesteś jedyną osobą, która może dodawać, edytować lub przeglądać te notatki.',
        sharedNoteMessage: 'Zapisuj notatki dotyczące tej rozmowy tutaj. Pracownicy Expensify i inni członkowie na domenie team.expensify.com mogą przeglądać te notatki.',
        composerLabel: 'Notatki',
        myNote: 'Moja notatka',
        error: {
            genericFailureMessage: 'Prywatne notatki nie mogły zostać zapisane',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'Proszę wprowadzić prawidłowy kod zabezpieczający',
        },
        securityCode: 'Kod bezpieczeństwa',
        changeBillingCurrency: 'Zmień walutę rozliczeniową',
        changePaymentCurrency: 'Zmień walutę płatności',
        paymentCurrency: 'Waluta płatności',
        paymentCurrencyDescription: 'Wybierz standardową walutę, na którą powinny być przeliczane wszystkie wydatki osobiste',
        note: 'Uwaga: Zmiana waluty płatności może wpłynąć na to, ile zapłacisz za Expensify. Odnieś się do naszego',
        noteLink: 'strona cenowa',
        noteDetails: 'aby uzyskać pełne szczegóły.',
    },
    addDebitCardPage: {
        addADebitCard: 'Dodaj kartę debetową',
        nameOnCard: 'Imię na karcie',
        debitCardNumber: 'Numer karty debetowej',
        expiration: 'Data wygaśnięcia',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Adres rozliczeniowy',
        growlMessageOnSave: 'Twoja karta debetowa została pomyślnie dodana',
        expensifyPassword: 'Hasło do Expensify',
        error: {
            invalidName: 'Nazwa może zawierać tylko litery',
            addressZipCode: 'Proszę wprowadzić prawidłowy kod pocztowy',
            debitCardNumber: 'Proszę wprowadzić prawidłowy numer karty debetowej',
            expirationDate: 'Proszę wybrać prawidłową datę ważności',
            securityCode: 'Proszę wprowadzić prawidłowy kod zabezpieczający',
            addressStreet: 'Proszę wprowadzić prawidłowy adres rozliczeniowy, który nie jest skrytką pocztową',
            addressState: 'Proszę wybrać stan',
            addressCity: 'Proszę wprowadzić miasto',
            genericFailureMessage: 'Wystąpił błąd podczas dodawania karty. Proszę spróbować ponownie.',
            password: 'Proszę wprowadzić swoje hasło do Expensify',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: 'Dodaj kartę płatniczą',
        nameOnCard: 'Imię na karcie',
        paymentCardNumber: 'Numer karty',
        expiration: 'Data wygaśnięcia',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: 'Adres rozliczeniowy',
        growlMessageOnSave: 'Twoja karta płatnicza została pomyślnie dodana',
        expensifyPassword: 'Hasło do Expensify',
        error: {
            invalidName: 'Nazwa może zawierać tylko litery',
            addressZipCode: 'Proszę wprowadzić prawidłowy kod pocztowy',
            paymentCardNumber: 'Proszę wprowadzić prawidłowy numer karty',
            expirationDate: 'Proszę wybrać prawidłową datę ważności',
            securityCode: 'Proszę wprowadzić prawidłowy kod zabezpieczający',
            addressStreet: 'Proszę wprowadzić prawidłowy adres rozliczeniowy, który nie jest skrytką pocztową',
            addressState: 'Proszę wybrać stan',
            addressCity: 'Proszę wprowadzić miasto',
            genericFailureMessage: 'Wystąpił błąd podczas dodawania karty. Proszę spróbować ponownie.',
            password: 'Proszę wprowadzić swoje hasło do Expensify',
        },
    },
    walletPage: {
        balance: 'Saldo',
        paymentMethodsTitle: 'Metody płatności',
        setDefaultConfirmation: 'Ustaw domyślną metodę płatności',
        setDefaultSuccess: 'Domyślna metoda płatności ustawiona!',
        deleteAccount: 'Usuń konto',
        deleteConfirmation: 'Czy na pewno chcesz usunąć to konto?',
        error: {
            notOwnerOfBankAccount: 'Wystąpił błąd podczas ustawiania tego konta bankowego jako domyślnej metody płatności.',
            invalidBankAccount: 'To konto bankowe jest tymczasowo zawieszone.',
            notOwnerOfFund: 'Wystąpił błąd podczas ustawiania tej karty jako domyślnej metody płatności.',
            setDefaultFailure: 'Coś poszło nie tak. Proszę skontaktować się z Concierge w celu uzyskania dalszej pomocy.',
        },
        addBankAccountFailure: 'Wystąpił nieoczekiwany błąd podczas próby dodania Twojego konta bankowego. Proszę spróbować ponownie.',
        getPaidFaster: 'Otrzymuj płatności szybciej',
        addPaymentMethod: 'Dodaj metodę płatności, aby wysyłać i odbierać płatności bezpośrednio w aplikacji.',
        getPaidBackFaster: 'Otrzymuj zwroty szybciej',
        secureAccessToYourMoney: 'Zabezpiecz dostęp do swoich pieniędzy',
        receiveMoney: 'Otrzymuj pieniądze w swojej lokalnej walucie',
        expensifyWallet: 'Expensify Wallet (Beta)',
        sendAndReceiveMoney: 'Wysyłaj i odbieraj pieniądze z przyjaciółmi. Tylko konta bankowe w USA.',
        enableWallet: 'Włącz portfel',
        addBankAccountToSendAndReceive: 'Otrzymaj zwrot kosztów za wydatki, które zgłaszasz do przestrzeni roboczej.',
        addBankAccount: 'Dodaj konto bankowe',
        assignedCards: 'Przypisane karty',
        assignedCardsDescription: 'Są to karty przypisane przez administratora przestrzeni roboczej do zarządzania wydatkami firmy.',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'Przeglądamy Twoje informacje. Proszę sprawdź ponownie za kilka minut!',
        walletActivationFailed: 'Niestety, Twojego portfela nie można włączyć w tej chwili. Proszę skontaktować się z Concierge, aby uzyskać dalszą pomoc.',
        addYourBankAccount: 'Dodaj swoje konto bankowe',
        addBankAccountBody: 'Połącz swoje konto bankowe z Expensify, aby wysyłanie i odbieranie płatności bezpośrednio w aplikacji było łatwiejsze niż kiedykolwiek.',
        chooseYourBankAccount: 'Wybierz swoje konto bankowe',
        chooseAccountBody: 'Upewnij się, że wybierasz właściwy.',
        confirmYourBankAccount: 'Potwierdź swoje konto bankowe',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Karta Podróżna Expensify',
        availableSpend: 'Pozostały limit',
        smartLimit: {
            name: 'Inteligentny limit',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "Mo\u017Cesz wyda\u0107 do ".concat(formattedLimit, " na tej karcie, a limit zostanie zresetowany, gdy Twoje zg\u0142oszone wydatki zostan\u0105 zatwierdzone.");
            },
        },
        fixedLimit: {
            name: 'Stały limit',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "Mo\u017Cesz wyda\u0107 do ".concat(formattedLimit, " na tej karcie, a nast\u0119pnie zostanie ona dezaktywowana.");
            },
        },
        monthlyLimit: {
            name: 'Miesięczny limit',
            title: function (_a) {
                var formattedLimit = _a.formattedLimit;
                return "Mo\u017Cesz wyda\u0107 do ".concat(formattedLimit, " na tej karcie miesi\u0119cznie. Limit zostanie zresetowany pierwszego dnia ka\u017Cdego miesi\u0105ca kalendarzowego.");
            },
        },
        virtualCardNumber: 'Numer karty wirtualnej',
        travelCardCvv: 'CVV karty podróżnej',
        physicalCardNumber: 'Numer karty fizycznej',
        getPhysicalCard: 'Uzyskaj fizyczną kartę',
        reportFraud: 'Zgłoś oszustwo związane z kartą wirtualną',
        reportTravelFraud: 'Zgłoś oszustwo związane z kartą podróżną',
        reviewTransaction: 'Przejrzyj transakcję',
        suspiciousBannerTitle: 'Podejrzana transakcja',
        suspiciousBannerDescription: 'Zauważyliśmy podejrzane transakcje na Twojej karcie. Dotknij poniżej, aby przejrzeć.',
        cardLocked: 'Twoja karta jest tymczasowo zablokowana, podczas gdy nasz zespół przegląda konto Twojej firmy.',
        cardDetails: {
            cardNumber: 'Numer karty wirtualnej',
            expiration: 'Wygaśnięcie',
            cvv: 'CVV',
            address: 'Adres',
            revealDetails: 'Pokaż szczegóły',
            revealCvv: 'Pokaż CVV',
            copyCardNumber: 'Skopiuj numer karty',
            updateAddress: 'Zaktualizuj adres',
        },
        cardAddedToWallet: function (_a) {
            var platform = _a.platform;
            return "Dodano do portfela ".concat(platform);
        },
        cardDetailsLoadingFailure: 'Wystąpił błąd podczas ładowania szczegółów karty. Sprawdź swoje połączenie internetowe i spróbuj ponownie.',
        validateCardTitle: 'Upewnijmy się, że to Ty',
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Prosz\u0119 wprowadzi\u0107 magiczny kod wys\u0142any na ".concat(contactMethod, ", aby zobaczy\u0107 szczeg\u00F3\u0142y swojej karty. Powinien dotrze\u0107 w ci\u0105gu minuty lub dw\u00F3ch.");
        },
    },
    workflowsPage: {
        workflowTitle: 'Wydatki',
        workflowDescription: 'Skonfiguruj przepływ pracy od momentu wystąpienia wydatku, w tym zatwierdzenie i płatność.',
        delaySubmissionTitle: 'Opóźnij zgłoszenia',
        delaySubmissionDescription: 'Wybierz niestandardowy harmonogram przesyłania wydatków lub pozostaw to wyłączone, aby otrzymywać aktualizacje w czasie rzeczywistym dotyczące wydatków.',
        submissionFrequency: 'Częstotliwość składania wniosków',
        submissionFrequencyDateOfMonth: 'Data miesiąca',
        addApprovalsTitle: 'Dodaj zatwierdzenia',
        addApprovalButton: 'Dodaj przepływ pracy zatwierdzania',
        addApprovalTip: 'Ten domyślny przepływ pracy dotyczy wszystkich członków, chyba że istnieje bardziej szczegółowy przepływ pracy.',
        approver: 'Aprobujący',
        connectBankAccount: 'Połącz konto bankowe',
        addApprovalsDescription: 'Wymagaj dodatkowej zgody przed autoryzacją płatności.',
        makeOrTrackPaymentsTitle: 'Dokonuj lub śledź płatności',
        makeOrTrackPaymentsDescription: 'Dodaj upoważnionego płatnika do płatności dokonywanych w Expensify lub śledź płatności dokonane gdzie indziej.',
        editor: {
            submissionFrequency: 'Wybierz, jak długo Expensify powinno czekać przed udostępnieniem wydatków bez błędów.',
        },
        frequencyDescription: 'Wybierz, jak często chcesz, aby wydatki były przesyłane automatycznie, lub ustaw je na ręczne przesyłanie.',
        frequencies: {
            instant: 'Natychmiastowy',
            weekly: 'Cotygodniowo',
            monthly: 'Miesięczny',
            twiceAMonth: 'Dwa razy w miesiącu',
            byTrip: 'Według podróży',
            manually: 'Ręcznie',
            daily: 'Codziennie',
            lastDayOfMonth: 'Ostatni dzień miesiąca',
            lastBusinessDayOfMonth: 'Ostatni dzień roboczy miesiąca',
            ordinals: {
                one: 'st',
                two: 'nd',
                few: 'rd',
                other: 'th',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': 'Pierwszy',
                '2': 'Drugi',
                '3': 'Trzeci',
                '4': 'Czwarty',
                '5': 'Piąty',
                '6': 'Szósty',
                '7': 'Siódmy',
                '8': 'Ósmy',
                '9': 'Dziewiąty',
                '10': 'Dziesiąty',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'Ten członek już należy do innego procesu zatwierdzania. Wszelkie zmiany tutaj będą miały odzwierciedlenie również tam.',
        approverCircularReference: function (_a) {
            var name1 = _a.name1, name2 = _a.name2;
            return "<strong>".concat(name1, "</strong> ju\u017C zatwierdza raporty do <strong>").concat(name2, "</strong>. Prosz\u0119 wybra\u0107 innego zatwierdzaj\u0105cego, aby unikn\u0105\u0107 cyklicznego przep\u0142ywu pracy.");
        },
        emptyContent: {
            title: 'Brak członków do wyświetlenia',
            expensesFromSubtitle: 'Wszyscy członkowie przestrzeni roboczej już należą do istniejącego procesu zatwierdzania.',
            approverSubtitle: 'Wszyscy zatwierdzający należą do istniejącego przepływu pracy.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: 'Opóźnione zgłoszenie nie mogło zostać zmienione. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
        autoReportingFrequencyErrorMessage: 'Nie można było zmienić częstotliwości przesyłania. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
        monthlyOffsetErrorMessage: 'Nie można było zmienić miesięcznej częstotliwości. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Potwierdź',
        header: 'Dodaj więcej zatwierdzających i potwierdź.',
        additionalApprover: 'Dodatkowy zatwierdzający',
        submitButton: 'Dodaj przepływ pracy',
    },
    workflowsEditApprovalsPage: {
        title: 'Edytuj przepływ pracy zatwierdzania',
        deleteTitle: 'Usuń przepływ pracy zatwierdzania',
        deletePrompt: 'Czy na pewno chcesz usunąć ten proces zatwierdzania? Wszyscy członkowie będą następnie postępować zgodnie z domyślnym procesem.',
    },
    workflowsExpensesFromPage: {
        title: 'Wydatki od',
        header: 'Gdy następujący członkowie złożą wydatki:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Nie można było zmienić zatwierdzającego. Spróbuj ponownie lub skontaktuj się z pomocą techniczną.',
        header: 'Wyślij do tego członka do zatwierdzenia:',
    },
    workflowsPayerPage: {
        title: 'Upoważniony płatnik',
        genericErrorMessage: 'Nie udało się zmienić upoważnionego płatnika. Proszę spróbować ponownie.',
        admins: 'Administratorzy',
        payer: 'Płatnik',
        paymentAccount: 'Konto płatnicze',
    },
    reportFraudPage: {
        title: 'Zgłoś oszustwo związane z kartą wirtualną',
        description: 'Jeśli dane Twojej wirtualnej karty zostały skradzione lub naruszone, trwale dezaktywujemy Twoją obecną kartę i dostarczymy Ci nową wirtualną kartę oraz numer.',
        deactivateCard: 'Dezaktywuj kartę',
        reportVirtualCardFraud: 'Zgłoś oszustwo związane z kartą wirtualną',
    },
    reportFraudConfirmationPage: {
        title: 'Zgłoszono oszustwo związane z kartą',
        description: 'Trwale dezaktywowaliśmy Twoją istniejącą kartę. Gdy wrócisz, aby zobaczyć szczegóły swojej karty, będziesz mieć nową wirtualną kartę dostępną.',
        buttonText: 'Zrozumiałem, dzięki!',
    },
    activateCardPage: {
        activateCard: 'Aktywuj kartę',
        pleaseEnterLastFour: 'Proszę podać ostatnie cztery cyfry swojej karty.',
        activatePhysicalCard: 'Aktywuj fizyczną kartę',
        error: {
            thatDidNotMatch: 'To nie pasuje do ostatnich 4 cyfr na twojej karcie. Spróbuj ponownie.',
            throttled: 'Wprowadziłeś niepoprawnie ostatnie 4 cyfry swojej karty Expensify zbyt wiele razy. Jeśli jesteś pewien, że liczby są poprawne, skontaktuj się z Concierge, aby rozwiązać problem. W przeciwnym razie spróbuj ponownie później.',
        },
    },
    getPhysicalCard: {
        header: 'Uzyskaj fizyczną kartę',
        nameMessage: 'Wprowadź swoje imię i nazwisko, ponieważ będzie ono widoczne na Twojej karcie.',
        legalName: 'Imię i nazwisko prawne',
        legalFirstName: 'Imię prawne',
        legalLastName: 'Nazwisko prawne',
        phoneMessage: 'Wprowadź swój numer telefonu.',
        phoneNumber: 'Numer telefonu',
        address: 'Adres',
        addressMessage: 'Wprowadź swój adres wysyłki.',
        streetAddress: 'Adres ulicy',
        city: 'Miasto',
        state: 'Stan',
        zipPostcode: 'Kod pocztowy',
        country: 'Kraj',
        confirmMessage: 'Proszę potwierdzić swoje dane poniżej.',
        estimatedDeliveryMessage: 'Twoja fizyczna karta dotrze w ciągu 2-3 dni roboczych.',
        next: 'Następny',
        getPhysicalCard: 'Uzyskaj fizyczną kartę',
        shipCard: 'Wyślij kartę',
    },
    transferAmountPage: {
        transfer: function (_a) {
            var amount = _a.amount;
            return "Transfer".concat(amount ? " ".concat(amount) : '');
        },
        instant: 'Natychmiastowy (karta debetowa)',
        instantSummary: function (_a) {
            var rate = _a.rate, minAmount = _a.minAmount;
            return "".concat(rate, "% op\u0142ata (minimum ").concat(minAmount, ")");
        },
        ach: '1-3 dni robocze (konto bankowe)',
        achSummary: 'Bez opłaty',
        whichAccount: 'Które konto?',
        fee: 'Opłata',
        transferSuccess: 'Transfer zakończony pomyślnie!',
        transferDetailBankAccount: 'Twoje pieniądze powinny dotrzeć w ciągu 1-3 dni roboczych.',
        transferDetailDebitCard: 'Twoje pieniądze powinny dotrzeć natychmiast.',
        failedTransfer: 'Twoje saldo nie jest w pełni uregulowane. Proszę przelać na konto bankowe.',
        notHereSubTitle: 'Proszę przelać saldo ze strony portfela',
        goToWallet: 'Przejdź do Portfela',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Wybierz konto',
    },
    paymentMethodList: {
        addPaymentMethod: 'Dodaj metodę płatności',
        addNewDebitCard: 'Dodaj nową kartę debetową',
        addNewBankAccount: 'Dodaj nowe konto bankowe',
        accountLastFour: 'Kończący się na',
        cardLastFour: 'Karta kończąca się na',
        addFirstPaymentMethod: 'Dodaj metodę płatności, aby wysyłać i odbierać płatności bezpośrednio w aplikacji.',
        defaultPaymentMethod: 'Domyślny',
    },
    preferencesPage: {
        appSection: {
            title: 'Preferencje aplikacji',
        },
        testSection: {
            title: 'Testuj preferencje',
            subtitle: 'Ustawienia pomagające w debugowaniu i testowaniu aplikacji na etapie staging.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: 'Otrzymuj istotne aktualizacje funkcji i wiadomości od Expensify',
        muteAllSounds: 'Wycisz wszystkie dźwięki z Expensify',
    },
    priorityModePage: {
        priorityMode: 'Tryb priorytetowy',
        explainerText: 'Wybierz, czy #skupić się tylko na nieprzeczytanych i przypiętych czatach, czy pokazać wszystko z najnowszymi i przypiętymi czatami na górze.',
        priorityModes: {
            default: {
                label: 'Najnowsze',
                description: 'Pokaż wszystkie czaty posortowane według najnowszych',
            },
            gsd: {
                label: '#skupienie',
                description: 'Pokaż tylko nieprzeczytane, posortowane alfabetycznie',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: function (_a) {
            var policyName = _a.policyName;
            return "w ".concat(policyName);
        },
        generatingPDF: 'Generowanie PDF',
        waitForPDF: 'Proszę czekać, generujemy PDF',
        errorPDF: 'Wystąpił błąd podczas próby wygenerowania Twojego PDF-a.',
        generatedPDF: 'Twój raport PDF został wygenerowany!',
    },
    reportDescriptionPage: {
        roomDescription: 'Opis pokoju',
        roomDescriptionOptional: 'Opis pokoju (opcjonalnie)',
        explainerText: 'Ustaw niestandardowy opis dla pokoju.',
    },
    groupChat: {
        lastMemberTitle: 'Uwaga!',
        lastMemberWarning: 'Ponieważ jesteś ostatnią osobą tutaj, opuszczenie spowoduje, że ten czat będzie niedostępny dla wszystkich członków. Czy na pewno chcesz opuścić?',
        defaultReportName: function (_a) {
            var displayName = _a.displayName;
            return "Czat grupowy ".concat(displayName);
        },
    },
    languagePage: {
        language: 'Język',
        aiGenerated: 'Tłumaczenia dla tego języka są generowane automatycznie i mogą zawierać błędy.',
    },
    themePage: {
        theme: 'Motyw',
        themes: {
            dark: {
                label: 'Ciemny',
            },
            light: {
                label: 'Światło',
            },
            system: {
                label: 'Użyj ustawień urządzenia',
            },
        },
        chooseThemeBelowOrSync: 'Wybierz motyw poniżej lub zsynchronizuj z ustawieniami urządzenia.',
    },
    termsOfUse: {
        phrase1: 'Logując się, zgadzasz się na',
        phrase2: 'Warunki korzystania z usługi',
        phrase3: 'i',
        phrase4: 'Prywatność',
        phrase5: "Przekazy pieni\u0119\u017Cne s\u0105 \u015Bwiadczone przez ".concat(CONST_1.default.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS, " (NMLS ID:2017010) zgodnie z jego"),
        phrase6: 'licencje',
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Nie otrzymałeś magicznego kodu?',
        enterAuthenticatorCode: 'Proszę wprowadzić kod uwierzytelniający',
        enterRecoveryCode: 'Proszę wprowadzić swój kod odzyskiwania',
        requiredWhen2FAEnabled: 'Wymagane, gdy 2FA jest włączone',
        requestNewCode: 'Poproś o nowy kod w',
        requestNewCodeAfterErrorOccurred: 'Poproś o nowy kod',
        error: {
            pleaseFillMagicCode: 'Proszę wprowadzić swój magiczny kod',
            incorrectMagicCode: 'Niepoprawny lub nieważny kod magiczny. Spróbuj ponownie lub poproś o nowy kod.',
            pleaseFillTwoFactorAuth: 'Proszę wprowadzić swój kod uwierzytelniania dwuskładnikowego',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'Proszę wypełnić wszystkie pola',
        pleaseFillPassword: 'Proszę wprowadzić swoje hasło',
        pleaseFillTwoFactorAuth: 'Proszę wprowadzić swój kod dwuskładnikowy',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Wprowadź swój kod uwierzytelniania dwuskładnikowego, aby kontynuować',
        forgot: 'Zapomniałeś?',
        requiredWhen2FAEnabled: 'Wymagane, gdy 2FA jest włączone',
        error: {
            incorrectPassword: 'Nieprawidłowe hasło. Spróbuj ponownie.',
            incorrectLoginOrPassword: 'Nieprawidłowy login lub hasło. Spróbuj ponownie.',
            incorrect2fa: 'Nieprawidłowy kod uwierzytelniania dwuskładnikowego. Proszę spróbować ponownie.',
            twoFactorAuthenticationEnabled: 'Masz włączone uwierzytelnianie dwuskładnikowe (2FA) na tym koncie. Zaloguj się, używając swojego adresu e-mail lub numeru telefonu.',
            invalidLoginOrPassword: 'Nieprawidłowy login lub hasło. Spróbuj ponownie lub zresetuj hasło.',
            unableToResetPassword: 'Nie udało nam się zmienić Twojego hasła. Prawdopodobnie jest to spowodowane wygasłym linkiem do resetowania hasła w starym e-mailu do resetowania hasła. Wysłaliśmy Ci nowy link, abyś mógł spróbować ponownie. Sprawdź swoją skrzynkę odbiorczą i folder ze spamem; powinien dotrzeć w ciągu kilku minut.',
            noAccess: 'Nie masz dostępu do tej aplikacji. Proszę dodać swoją nazwę użytkownika GitHub, aby uzyskać dostęp.',
            accountLocked: 'Twoje konto zostało zablokowane po zbyt wielu nieudanych próbach. Spróbuj ponownie za 1 godzinę.',
            fallback: 'Coś poszło nie tak. Spróbuj ponownie później.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefon lub e-mail',
        error: {
            invalidFormatEmailLogin: 'Wprowadzony adres e-mail jest nieprawidłowy. Proszę poprawić format i spróbować ponownie.',
        },
        cannotGetAccountDetails: 'Nie można pobrać szczegółów konta. Spróbuj zalogować się ponownie.',
        loginForm: 'Formularz logowania',
        notYou: function (_a) {
            var user = _a.user;
            return "Nie ".concat(user, "?");
        },
    },
    onboarding: {
        welcome: 'Witamy!',
        welcomeSignOffTitleManageTeam: 'Gdy ukończysz powyższe zadania, możemy odkrywać więcej funkcji, takich jak przepływy pracy zatwierdzania i reguły!',
        welcomeSignOffTitle: 'Miło cię poznać!',
        explanationModal: {
            title: 'Witamy w Expensify',
            description: 'Jedna aplikacja do zarządzania wydatkami biznesowymi i osobistymi z prędkością czatu. Wypróbuj ją i daj nam znać, co o tym myślisz. Jeszcze wiele przed nami!',
            secondaryDescription: 'Aby przełączyć się z powrotem na Expensify Classic, wystarczy stuknąć swoje zdjęcie profilowe > Przejdź do Expensify Classic.',
        },
        welcomeVideo: {
            title: 'Witamy w Expensify',
            description: 'Jedna aplikacja do zarządzania wszystkimi wydatkami biznesowymi i osobistymi w czacie. Stworzona dla Twojego biznesu, Twojego zespołu i Twoich przyjaciół.',
        },
        getStarted: 'Zacznij teraz',
        whatsYourName: 'Jak masz na imię?',
        peopleYouMayKnow: 'Osoby, które możesz znać, już tu są! Zweryfikuj swój email, aby do nich dołączyć.',
        workspaceYouMayJoin: function (_a) {
            var domain = _a.domain, email = _a.email;
            return "Kto\u015B z ".concat(domain, " ju\u017C utworzy\u0142 przestrze\u0144 robocz\u0105. Prosz\u0119 wprowadzi\u0107 magiczny kod wys\u0142any na ").concat(email, ".");
        },
        joinAWorkspace: 'Dołącz do przestrzeni roboczej',
        listOfWorkspaces: 'Oto lista przestrzeni roboczych, do których możesz dołączyć. Nie martw się, zawsze możesz dołączyć do nich później, jeśli wolisz.',
        workspaceMemberList: function (_a) {
            var employeeCount = _a.employeeCount, policyOwner = _a.policyOwner;
            return "".concat(employeeCount, " cz\u0142onek").concat(employeeCount > 1 ? 's' : '', " \u2022 ").concat(policyOwner);
        },
        whereYouWork: 'Gdzie pracujesz?',
        errorSelection: 'Wybierz opcję, aby kontynuować',
        purpose: (_c = {
                title: 'Co chcesz dzisiaj zrobić?',
                errorContinue: 'Proszę nacisnąć „kontynuuj”, aby rozpocząć konfigurację.',
                errorBackButton: 'Proszę dokończyć pytania dotyczące konfiguracji, aby rozpocząć korzystanie z aplikacji.'
            },
            _c[CONST_1.default.ONBOARDING_CHOICES.EMPLOYER] = 'Otrzymaj zwrot od mojego pracodawcy',
            _c[CONST_1.default.ONBOARDING_CHOICES.MANAGE_TEAM] = 'Zarządzaj wydatkami mojego zespołu',
            _c[CONST_1.default.ONBOARDING_CHOICES.PERSONAL_SPEND] = 'Śledź i planuj wydatki',
            _c[CONST_1.default.ONBOARDING_CHOICES.CHAT_SPLIT] = 'Czat i dzielenie wydatków z przyjaciółmi',
            _c[CONST_1.default.ONBOARDING_CHOICES.LOOKING_AROUND] = 'Coś innego',
            _c),
        employees: (_d = {
                title: 'Ilu masz pracowników?'
            },
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MICRO] = '1-10 pracowników',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.SMALL] = '11-50 pracowników',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL] = '51-100 pracowników',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.MEDIUM] = '101-1 000 pracowników',
            _d[CONST_1.default.ONBOARDING_COMPANY_SIZE.LARGE] = 'Ponad 1 000 pracowników',
            _d),
        accounting: {
            title: 'Czy używasz jakiegoś oprogramowania księgowego?',
            none: 'None',
        },
        error: {
            requiredFirstName: 'Proszę podać swoje imię, aby kontynuować',
        },
        workEmail: {
            title: 'Jaki jest Twój służbowy adres e-mail?',
            subtitle: 'Expensify działa najlepiej, gdy połączysz swój służbowy e-mail.',
            explanationModal: {
                descriptionOne: 'Prześlij dalej na receipts@expensify.com do zeskanowania',
                descriptionTwo: 'Dołącz do swoich kolegów, którzy już korzystają z Expensify',
                descriptionThree: 'Ciesz się bardziej spersonalizowanym doświadczeniem',
            },
            addWorkEmail: 'Dodaj służbowy e-mail',
        },
        workEmailValidation: {
            title: 'Zweryfikuj swój służbowy adres e-mail',
            magicCodeSent: function (_a) {
                var workEmail = _a.workEmail;
                return "Prosz\u0119 wprowadzi\u0107 magiczny kod wys\u0142any na ".concat(workEmail, ". Powinien dotrze\u0107 w ci\u0105gu minuty lub dw\u00F3ch.");
            },
        },
        workEmailValidationError: {
            publicEmail: 'Proszę podać prawidłowy adres e-mail z domeny prywatnej, np. mitch@company.com',
            offline: 'Nie mogliśmy dodać Twojego służbowego adresu e-mail, ponieważ wydajesz się być offline.',
        },
        mergeBlockScreen: {
            title: 'Nie można dodać służbowego adresu e-mail',
            subtitle: function (_a) {
                var workEmail = _a.workEmail;
                return "Nie mogli\u015Bmy doda\u0107 ".concat(workEmail, ". Spr\u00F3buj ponownie p\u00F3\u017Aniej w Ustawieniach lub skontaktuj si\u0119 z Concierge, aby uzyska\u0107 pomoc.");
            },
        },
        tasks: {
            testDriveAdminTask: {
                title: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "Neem een [proefrit](".concat(testDriveURL, ")");
                },
                description: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "[Doe een snelle producttour](".concat(testDriveURL, ") om te zien waarom Expensify de snelste manier is om uw uitgaven te doen.");
                },
            },
            testDriveEmployeeTask: {
                title: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "Neem een [proefrit](".concat(testDriveURL, ")");
                },
                description: function (_a) {
                    var testDriveURL = _a.testDriveURL;
                    return "Neem ons mee voor een [proefrit](".concat(testDriveURL, ") en uw team krijgt *3 maanden Expensify gratis!*");
                },
            },
            createTestDriveAdminWorkspaceTask: {
                title: function (_a) {
                    var workspaceConfirmationLink = _a.workspaceConfirmationLink;
                    return "[Maak](".concat(workspaceConfirmationLink, ") een werkruimte");
                },
                description: 'Maak een werkruimte en configureer de instellingen met de hulp van uw setup specialist!',
            },
            createWorkspaceTask: {
                title: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return "Maak een [werkruimte](".concat(workspaceSettingsLink, ")");
                },
                description: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return '*Maak een werkruimte* om uitgaven te volgen, bonnen te scannen, te chatten en meer.\n' +
                        '\n' +
                        '1. Klik op *Werkruimtes* > *Nieuwe werkruimte*.\n' +
                        '\n' +
                        "*Uw nieuwe werkruimte is klaar!* [Bekijk hem](".concat(workspaceSettingsLink, ").");
                },
            },
            setupCategoriesTask: {
                title: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink;
                    return "Stel [categorie\u00EBn](".concat(workspaceCategoriesLink, ") in");
                },
                description: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink;
                    return '*Stel categorieën in* zodat uw team uitgaven kan coderen voor eenvoudige rapportage.\n' +
                        '\n' +
                        '1. Klik op *Werkruimtes*.\n' +
                        '3. Selecteer uw werkruimte.\n' +
                        '4. Klik op *Categorieën*.\n' +
                        '5. Schakel alle categorieën uit die u niet nodig heeft.\n' +
                        '6. Voeg uw eigen categorieën toe rechtsboven.\n' +
                        '\n' +
                        "[Breng me naar de categorie-instellingen van de werkruimte](".concat(workspaceCategoriesLink, ").\n") +
                        '\n' +
                        "![Stel categorie\u00EBn in](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-categories-v2.mp4)");
                },
            },
            combinedTrackSubmitExpenseTask: {
                title: 'Dien een uitgave in',
                description: '*Dien een uitgave in* door een bedrag in te voeren of een bon te scannen.\n' +
                    '\n' +
                    '1. Klik op de groene *+*-knop.\n' +
                    '2. Kies *Uitgave aanmaken*.\n' +
                    '3. Voer een bedrag in of scan een bon.\n' +
                    "4. Voeg het e-mailadres of telefoonnummer van uw baas toe.\n" +
                    '5. Klik op *Aanmaken*.\n' +
                    '\n' +
                    'En u bent klaar!',
            },
            adminSubmitExpenseTask: {
                title: 'Dien een uitgave in',
                description: '*Dien een uitgave in* door een bedrag in te voeren of een bon te scannen.\n' +
                    '\n' +
                    '1. Klik op de groene *+*-knop.\n' +
                    '2. Kies *Uitgave aanmaken*.\n' +
                    '3. Voer een bedrag in of scan een bon.\n' +
                    '4. Bevestig de details.\n' +
                    '5. Klik op *Aanmaken*.\n' +
                    '\n' +
                    "En u bent klaar!",
            },
            trackExpenseTask: {
                title: 'Volg een uitgave',
                description: '*Volg een uitgave* in elke valuta, of u nu een bon heeft of niet.\n' +
                    '\n' +
                    '1. Klik op de groene *+*-knop.\n' +
                    '2. Kies *Uitgave aanmaken*.\n' +
                    '3. Voer een bedrag in of scan een bon.\n' +
                    '4. Kies uw *persoonlijke* ruimte.\n' +
                    '5. Klik op *Aanmaken*.\n' +
                    '\n' +
                    'En u bent klaar! Jazeker, zo makkelijk is het.',
            },
            addAccountingIntegrationTask: {
                title: function (_a) {
                    var integrationName = _a.integrationName, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "Po\u0142\u0105cz".concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : ' z', " [").concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? 'swoim' : '', " ").concat(integrationName, "](").concat(workspaceAccountingLink, ")");
                },
                description: function (_a) {
                    var integrationName = _a.integrationName, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "Po\u0142\u0105cz".concat(integrationName === CONST_1.default.ONBOARDING_ACCOUNTING_MAPPING.other ? ' swój' : ' z', " ").concat(integrationName, ", aby automatycznie kategoryzowa\u0107 wydatki i synchronizowa\u0107 dane, co u\u0142atwi zamkni\u0119cie miesi\u0105ca.\n") +
                        '\n' +
                        '1. Kliknij *Ustawienia*.\n' +
                        '2. Przejdź do *Przestrzenie robocze*.\n' +
                        '3. Wybierz swoją przestrzeń roboczą.\n' +
                        '4. Kliknij *Księgowość*.\n' +
                        "5. Znajd\u017A ".concat(integrationName, ".\n") +
                        '6. Kliknij *Połącz*.\n' +
                        '\n' +
                        "".concat(integrationName && CONST_1.default.connectionsVideoPaths[integrationName]
                            ? "[Przejd\u017A do ksi\u0119gowo\u015Bci](".concat(workspaceAccountingLink, ").\n\n![Po\u0142\u0105cz z ").concat(integrationName, "](").concat(CONST_1.default.CLOUDFRONT_URL, "/").concat(CONST_1.default.connectionsVideoPaths[integrationName], ")")
                            : "[Przejd\u017A do ksi\u0119gowo\u015Bci](".concat(workspaceAccountingLink, ")."));
                },
            },
            connectCorporateCardTask: {
                title: function (_a) {
                    var corporateCardLink = _a.corporateCardLink;
                    return "Verbind [uw bedrijfskaart](".concat(corporateCardLink, ")");
                },
                description: function (_a) {
                    var corporateCardLink = _a.corporateCardLink;
                    return "Verbind uw bedrijfskaart om uitgaven automatisch te importeren en te coderen.\n" +
                        '\n' +
                        '1. Klik op *Werkruimtes*.\n' +
                        '2. Selecteer uw werkruimte.\n' +
                        '3. Klik op *Bedrijfskaarten*.\n' +
                        '4. Volg de aanwijzingen om uw kaart te verbinden.\n' +
                        '\n' +
                        "[Breng me naar het verbinden van mijn bedrijfskaarten](".concat(corporateCardLink, ").");
                },
            },
            inviteTeamTask: {
                title: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return "Nodig [uw team](".concat(workspaceMembersLink, ") uit");
                },
                description: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return '*Nodig uw team* uit voor Expensify zodat ze vandaag nog kunnen beginnen met het bijhouden van uitgaven.\n' +
                        '\n' +
                        '1. Klik op *Werkruimtes*.\n' +
                        '3. Selecteer uw werkruimte.\n' +
                        '4. Klik op *Leden* > *Lid uitnodigen*.\n' +
                        '5. Voer e-mailadressen of telefoonnummers in. \n' +
                        '6. Voeg een aangepast uitnodigingsbericht toe als u dat wilt!\n' +
                        '\n' +
                        "[Breng me naar werkruimtemedewerkers](".concat(workspaceMembersLink, ").\n") +
                        '\n' +
                        "![Nodig uw team uit](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-invite_members-v2.mp4)");
                },
            },
            setupCategoriesAndTags: {
                title: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink, workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return "Stel [categorie\u00EBn](".concat(workspaceCategoriesLink, ") en [tags](").concat(workspaceMoreFeaturesLink, ") in");
                },
                description: function (_a) {
                    var workspaceCategoriesLink = _a.workspaceCategoriesLink, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return '*Stel categorieën en tags in* zodat uw team uitgaven kan coderen voor eenvoudige rapportage.\n' +
                        '\n' +
                        "Importeer ze automatisch door [uw boekhoudsoftware te verbinden](".concat(workspaceAccountingLink, "), of stel ze handmatig in via uw [werkruimte-instellingen](").concat(workspaceCategoriesLink, ").");
                },
            },
            setupTagsTask: {
                title: function (_a) {
                    var workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return "Stel [tags](".concat(workspaceMoreFeaturesLink, ") in");
                },
                description: function (_a) {
                    var workspaceMoreFeaturesLink = _a.workspaceMoreFeaturesLink;
                    return 'Gebruik tags om extra uitgavendetails toe te voegen zoals projecten, klanten, locaties en afdelingen. Als u meerdere niveaus van tags nodig heeft, kunt u upgraden naar het Control-abonnement.\n' +
                        '\n' +
                        '1. Klik op *Werkruimtes*.\n' +
                        '3. Selecteer uw werkruimte.\n' +
                        '4. Klik op *Meer functies*.\n' +
                        '5. Schakel *Tags* in.\n' +
                        '6. Navigeer naar *Tags* in de werkruimteditor.\n' +
                        '7. Klik op *+ Tag toevoegen* om uw eigen tags te maken.\n' +
                        '\n' +
                        "[Breng me naar meer functies](".concat(workspaceMoreFeaturesLink, ").\n") +
                        '\n' +
                        "![Stel tags in](".concat(CONST_1.default.CLOUDFRONT_URL, "/videos/walkthrough-tags-v2.mp4)");
                },
            },
            inviteAccountantTask: {
                title: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return "Zapro\u015B swojego [ksi\u0119gowego](".concat(workspaceMembersLink, ")");
                },
                description: function (_a) {
                    var workspaceMembersLink = _a.workspaceMembersLink;
                    return '*Zaproś swojego księgowego*, aby współpracował w Twojej przestrzeni roboczej i zarządzał wydatkami firmowymi.\n' +
                        '\n' +
                        '1. Kliknij *Przestrzenie robocze*.\n' +
                        '2. Wybierz swoją przestrzeń roboczą.\n' +
                        '3. Kliknij *Członkowie*.\n' +
                        '4. Kliknij *Zaproś członka*.\n' +
                        '5. Wpisz adres e-mail swojego księgowego.\n' +
                        '\n' +
                        "[Zapro\u015B swojego ksi\u0119gowego teraz](".concat(workspaceMembersLink, ").");
                },
            },
            startChatTask: {
                title: 'Start een chat',
                description: '*Start een chat* met iedereen met behulp van hun e-mailadres of telefoonnummer.\n' +
                    '\n' +
                    '1. Klik op de groene *+*-knop.\n' +
                    '2. Kies *Start chat*.\n' +
                    '3. Voer een e-mailadres of telefoonnummer in.\n' +
                    '\n' +
                    'Als ze Expensify nog niet gebruiken, worden ze automatisch uitgenodigd.\n' +
                    '\n' +
                    'Elke chat wordt ook omgezet in een e-mail of sms waar ze direct op kunnen reageren.',
            },
            splitExpenseTask: {
                title: 'Splits een uitgave',
                description: '*Splits uitgaven* met één of meer personen.\n' +
                    '\n' +
                    '1. Klik op de groene *+*-knop.\n' +
                    '2. Kies *Start chat*.\n' +
                    '3. Voer e-mailadressen of telefoonnummers in.\n' +
                    '4. Klik op de grijze *+*-knop in de chat > *Splits uitgave*.\n' +
                    '5. Maak de uitgave aan door *Handmatig*, *Scannen* of *Afstand* te selecteren.\n' +
                    '\n' +
                    'Voeg gerust meer details toe als u wilt, of stuur het gewoon op. Laten we ervoor zorgen dat u wordt terugbetaald!',
            },
            reviewWorkspaceSettingsTask: {
                title: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return "Bekijk uw [werkruimte-instellingen](".concat(workspaceSettingsLink, ")");
                },
                description: function (_a) {
                    var workspaceSettingsLink = _a.workspaceSettingsLink;
                    return 'Zo bekijkt en werkt u uw werkruimte-instellingen bij:\n' +
                        '1. Klik op het instellingentabblad.\n' +
                        '2. Klik op *Werkruimtes* > [Uw werkruimte].\n' +
                        "[Ga naar uw werkruimte](".concat(workspaceSettingsLink, "). We volgen ze in de #admins-kamer.");
                },
            },
            createReportTask: {
                title: 'Maak uw eerste rapport',
                description: 'Zo maakt u een rapport:\n' +
                    '\n' +
                    '1. Klik op de groene *+*-knop.\n' +
                    '2. Kies *Rapport aanmaken*.\n' +
                    '3. Klik op *Uitgave toevoegen*.\n' +
                    '4. Voeg uw eerste uitgave toe.\n' +
                    '\n' +
                    'En u bent klaar!',
            },
        },
        testDrive: {
            name: function (_a) {
                var testDriveURL = _a.testDriveURL;
                return (testDriveURL ? "Neem een [proefrit](".concat(testDriveURL, ")") : 'Neem een proefrit');
            },
            embeddedDemoIframeTitle: 'Proefrit',
            employeeFakeReceipt: {
                description: 'Mijn proefrit bon!',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'Terugbetaald krijgen is net zo eenvoudig als een bericht sturen. Laten we de basis doornemen.',
            onboardingPersonalSpendMessage: 'Zo volgt u uw uitgaven in een paar klikken.',
            onboardingMangeTeamMessage: function (_a) {
                var onboardingCompanySize = _a.onboardingCompanySize;
                return "Hier is een takenlijst die ik zou aanraden voor een bedrijf van uw grootte met ".concat(onboardingCompanySize, " inzenders:");
            },
            onboardingTrackWorkspaceMessage: '# Laten we u instellen\n👋 Ik ben hier om te helpen! Om u op weg te helpen, heb ik uw werkruimte-instellingen afgestemd op eenmanszaken en soortgelijke bedrijven. U kunt uw werkruimte aanpassen door op de onderstaande link te klikken!\n\nZo volgt u uw uitgaven in een paar klikken:',
            onboardingChatSplitMessage: 'Rekeningen splitsen met vrienden is net zo eenvoudig als een bericht sturen. Zo doet u dat.',
            onboardingAdminMessage: 'Leer hoe u de werkruimte van uw team als beheerder beheert en uw eigen uitgaven indient.',
            onboardingLookingAroundMessage: 'Expensify staat vooral bekend om uitgaven, reizen en beheer van bedrijfskaarten, maar we doen veel meer dan dat. Laat me weten waarin u geïnteresseerd bent en ik help u op weg.',
            onboardingTestDriveReceiverMessage: '*U heeft 3 maanden gratis! Begin hieronder.*',
        },
        workspace: {
            title: 'Pozostań zorganizowany dzięki przestrzeni roboczej',
            subtitle: 'Odblokuj potężne narzędzia, aby uprościć zarządzanie wydatkami, wszystko w jednym miejscu. Dzięki przestrzeni roboczej możesz:',
            explanationModal: {
                descriptionOne: 'Śledź i organizuj paragony',
                descriptionTwo: 'Kategoryzuj i taguj wydatki',
                descriptionThree: 'Twórz i udostępniaj raporty',
            },
            price: 'Wypróbuj za darmo przez 30 dni, a następnie przejdź na wyższy plan za jedyne <strong>5 USD/miesiąc</strong>.',
            createWorkspace: 'Utwórz przestrzeń roboczą',
        },
        confirmWorkspace: {
            title: 'Potwierdź przestrzeń roboczą',
            subtitle: 'Utwórz przestrzeń roboczą do śledzenia paragonów, zwracania wydatków, zarządzania podróżami, tworzenia raportów i nie tylko — wszystko w tempie czatu.',
        },
        inviteMembers: {
            title: 'Zaproś członków',
            subtitle: 'Zarządzaj i udostępniaj swoje wydatki księgowemu lub rozpocznij grupę podróżniczą z przyjaciółmi.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Nie pokazuj mi tego ponownie',
    },
    personalDetails: {
        error: {
            containsReservedWord: 'Nazwa nie może zawierać słów Expensify ani Concierge',
            hasInvalidCharacter: 'Nazwa nie może zawierać przecinka ani średnika',
            requiredFirstName: 'Imię nie może być puste',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Jakie jest Twoje imię i nazwisko?',
        enterDateOfBirth: 'Jaka jest Twoja data urodzenia?',
        enterAddress: 'Jaki jest Twój adres?',
        enterPhoneNumber: 'Jaki jest Twój numer telefonu?',
        personalDetails: 'Dane osobowe',
        privateDataMessage: 'Te dane są używane do podróży i płatności. Nigdy nie są wyświetlane na Twoim publicznym profilu.',
        legalName: 'Imię i nazwisko prawne',
        legalFirstName: 'Imię prawne',
        legalLastName: 'Nazwisko prawne',
        address: 'Adres',
        error: {
            dateShouldBeBefore: function (_a) {
                var dateString = _a.dateString;
                return "Data powinna by\u0107 przed ".concat(dateString);
            },
            dateShouldBeAfter: function (_a) {
                var dateString = _a.dateString;
                return "Data powinna by\u0107 po ".concat(dateString);
            },
            hasInvalidCharacter: 'Nazwa może zawierać tylko znaki łacińskie',
            incorrectZipFormat: function (_a) {
                var _b = _a === void 0 ? {} : _a, zipFormat = _b.zipFormat;
                return "Nieprawid\u0142owy format kodu pocztowego".concat(zipFormat ? "Dopuszczalny format: ".concat(zipFormat) : '');
            },
            invalidPhoneNumber: "Prosz\u0119 upewni\u0107 si\u0119, \u017Ce numer telefonu jest prawid\u0142owy (np. ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")"),
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Link został ponownie wysłany',
        weSentYouMagicSignInLink: function (_a) {
            var login = _a.login, loginType = _a.loginType;
            return "Wys\u0142a\u0142em magiczny link do logowania na ".concat(login, ". Sprawd\u017A sw\u00F3j ").concat(loginType, ", aby si\u0119 zalogowa\u0107.");
        },
        resendLink: 'Wyślij ponownie link',
    },
    unlinkLoginForm: {
        toValidateLogin: function (_a) {
            var primaryLogin = _a.primaryLogin, secondaryLogin = _a.secondaryLogin;
            return "Aby zweryfikowa\u0107 ".concat(secondaryLogin, ", prosz\u0119 ponownie wys\u0142a\u0107 magiczny kod z Ustawie\u0144 Konta ").concat(primaryLogin, ".");
        },
        noLongerHaveAccess: function (_a) {
            var primaryLogin = _a.primaryLogin;
            return "Je\u015Bli nie masz ju\u017C dost\u0119pu do ".concat(primaryLogin, ", prosz\u0119 od\u0142\u0105czy\u0107 swoje konta.");
        },
        unlink: 'Odłącz',
        linkSent: 'Link wysłany!',
        successfullyUnlinkedLogin: 'Pomyślnie odłączono drugie konto logowania!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: function (_a) {
            var login = _a.login;
            return "Nasz dostawca poczty e-mail tymczasowo zawiesi\u0142 wysy\u0142anie wiadomo\u015Bci e-mail na adres ".concat(login, " z powodu problem\u00F3w z dostarczeniem. Aby odblokowa\u0107 sw\u00F3j login, wykonaj nast\u0119puj\u0105ce kroki:");
        },
        confirmThat: function (_a) {
            var login = _a.login;
            return "Potwierd\u017A, \u017Ce ".concat(login, " jest poprawnie napisany i jest prawdziwym, dostarczalnym adresem e-mail.");
        },
        emailAliases: 'Alias e-mail, takie jak "expenses@domain.com", muszą mieć dostęp do własnej skrzynki odbiorczej, aby były ważnym loginem do Expensify.',
        ensureYourEmailClient: 'Upewnij się, że Twój klient poczty e-mail akceptuje wiadomości z domeny expensify.com.',
        youCanFindDirections: 'Możesz znaleźć instrukcje, jak wykonać ten krok',
        helpConfigure: 'ale możesz potrzebować pomocy działu IT w skonfigurowaniu ustawień poczty e-mail.',
        onceTheAbove: 'Po zakończeniu powyższych kroków, proszę skontaktować się z',
        toUnblock: 'aby odblokować swoje logowanie.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: function (_a) {
            var login = _a.login;
            return "Nie mogli\u015Bmy dostarczy\u0107 wiadomo\u015Bci SMS do ".concat(login, ", wi\u0119c tymczasowo je zawiesili\u015Bmy. Spr\u00F3buj zweryfikowa\u0107 sw\u00F3j numer:");
        },
        validationSuccess: 'Twój numer został zweryfikowany! Kliknij poniżej, aby wysłać nowy magiczny kod logowania.',
        validationFailed: function (_a) {
            var _b;
            var timeData = _a.timeData;
            if (!timeData) {
                return 'Proszę poczekać chwilę przed ponowną próbą.';
            }
            var timeParts = [];
            if (timeData.days) {
                timeParts.push("".concat(timeData.days, " ").concat(timeData.days === 1 ? 'dzień' : 'dni'));
            }
            if (timeData.hours) {
                timeParts.push("".concat(timeData.hours, " ").concat(timeData.hours === 1 ? 'godzina' : 'godziny'));
            }
            if (timeData.minutes) {
                timeParts.push("".concat(timeData.minutes, " ").concat(timeData.minutes === 1 ? 'minuta' : 'minuty'));
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
            return "Prosz\u0119 czeka\u0107! Musisz poczeka\u0107 ".concat(timeText, ", zanim ponownie spr\u00F3bujesz zweryfikowa\u0107 sw\u00F3j numer.");
        },
    },
    welcomeSignUpForm: {
        join: 'Dołącz',
    },
    detailsPage: {
        localTime: 'Czas lokalny',
    },
    newChatPage: {
        startGroup: 'Rozpocznij grupę',
        addToGroup: 'Dodaj do grupy',
    },
    yearPickerPage: {
        year: 'Rok',
        selectYear: 'Proszę wybrać rok',
    },
    focusModeUpdateModal: {
        title: 'Witamy w trybie #focus!',
        prompt: 'Bądź na bieżąco, widząc tylko nieprzeczytane czaty lub czaty, które wymagają Twojej uwagi. Nie martw się, możesz to zmienić w dowolnym momencie w',
        settings: 'ustawienia',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Nie można znaleźć czatu, którego szukasz.',
        getMeOutOfHere: 'Zabierz mnie stąd',
        iouReportNotFound: 'Nie można znaleźć szczegółów płatności, których szukasz.',
        notHere: 'Hmm... to nie tutaj.',
        pageNotFound: 'Ups, nie można znaleźć tej strony',
        noAccess: 'Ten czat lub wydatek mógł zostać usunięty lub nie masz do niego dostępu.\n\nW razie pytań prosimy o kontakt na concierge@expensify.com',
        goBackHome: 'Wróć do strony głównej',
    },
    errorPage: {
        title: function (_a) {
            var isBreakLine = _a.isBreakLine;
            return "Ups... ".concat(isBreakLine ? '\n' : '', "Co\u015B posz\u0142o nie tak");
        },
        subtitle: 'Nie można zrealizować Twojego żądania. Spróbuj ponownie później.',
    },
    setPasswordPage: {
        enterPassword: 'Wprowadź hasło',
        setPassword: 'Ustaw hasło',
        newPasswordPrompt: 'Twoje hasło musi mieć co najmniej 8 znaków, 1 wielką literę, 1 małą literę i 1 cyfrę.',
        passwordFormTitle: 'Witamy z powrotem w New Expensify! Proszę ustawić swoje hasło.',
        passwordNotSet: 'Nie udało nam się ustawić nowego hasła. Wysłaliśmy Ci nowy link do ustawienia hasła, aby spróbować ponownie.',
        setPasswordLinkInvalid: 'Ten link do ustawienia hasła jest nieprawidłowy lub wygasł. Nowy link czeka na Ciebie w Twojej skrzynce e-mail!',
        validateAccount: 'Zweryfikuj konto',
    },
    statusPage: {
        status: 'Status',
        statusExplanation: 'Dodaj emoji, aby ułatwić kolegom i znajomym zrozumienie, co się dzieje. Możesz opcjonalnie dodać wiadomość!',
        today: 'Dzisiaj',
        clearStatus: 'Wyczyść status',
        save: 'Zapisz',
        message: 'Wiadomość',
        timePeriods: {
            never: 'Nigdy',
            thirtyMinutes: '30 minut',
            oneHour: '1 godzina',
            afterToday: 'Dzisiaj',
            afterWeek: 'Tydzień',
            custom: 'Niestandardowy',
        },
        untilTomorrow: 'Do jutra',
        untilTime: function (_a) {
            var time = _a.time;
            return "Do ".concat(time);
        },
        date: 'Data',
        time: 'Czas',
        clearAfter: 'Wyczyść po',
        whenClearStatus: 'Kiedy powinniśmy usunąć Twój status?',
        vacationDelegate: 'Zastępca urlopowy',
        setVacationDelegate: "Ustaw zast\u0119pc\u0119 urlopowego, kt\u00F3ry b\u0119dzie zatwierdza\u0142 raporty w twoim imieniu podczas twojej nieobecno\u015Bci.",
        vacationDelegateError: 'Wystąpił błąd podczas aktualizacji twojego zastępcy urlopowego.',
        asVacationDelegate: function (_a) {
            var managerName = _a.nameOrEmail;
            return "jako zast\u0119pca urlopowy ".concat(managerName);
        },
        toAsVacationDelegate: function (_a) {
            var submittedToName = _a.submittedToName, vacationDelegateName = _a.vacationDelegateName;
            return "do ".concat(submittedToName, " jako zast\u0119pca urlopowy ").concat(vacationDelegateName);
        },
        vacationDelegateWarning: function (_a) {
            var nameOrEmail = _a.nameOrEmail;
            return "Przydzielasz ".concat(nameOrEmail, " jako swojego zast\u0119pc\u0119 urlopowego. Osoba ta nie jest jeszcze cz\u0142onkiem wszystkich twoich przestrzeni roboczych. Je\u015Bli zdecydujesz si\u0119 kontynuowa\u0107, zostanie wys\u0142any e-mail do wszystkich administrator\u00F3w twoich przestrzeni roboczych z pro\u015Bb\u0105 o jej dodanie.");
        },
    },
    stepCounter: function (_a) {
        var step = _a.step, total = _a.total, text = _a.text;
        var result = "Krok ".concat(step);
        if (total) {
            result = "".concat(result, " of ").concat(total);
        }
        if (text) {
            result = "".concat(result, ": ").concat(text);
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Informacje bankowe',
        confirmBankInfo: 'Potwierdź informacje o banku',
        manuallyAdd: 'Ręcznie dodaj swoje konto bankowe',
        letsDoubleCheck: 'Sprawdźmy podwójnie, czy wszystko wygląda dobrze.',
        accountEnding: 'Konto kończące się na',
        thisBankAccount: 'To konto bankowe będzie używane do płatności biznesowych w Twoim miejscu pracy.',
        accountNumber: 'Numer konta',
        routingNumber: 'Numer rozliczeniowy',
        chooseAnAccountBelow: 'Wybierz konto poniżej',
        addBankAccount: 'Dodaj konto bankowe',
        chooseAnAccount: 'Wybierz konto',
        connectOnlineWithPlaid: 'Zaloguj się do swojego banku',
        connectManually: 'Połącz ręcznie',
        desktopConnection: 'Uwaga: Aby połączyć się z Chase, Wells Fargo, Capital One lub Bank of America, kliknij tutaj, aby zakończyć ten proces w przeglądarce.',
        yourDataIsSecure: 'Twoje dane są bezpieczne',
        toGetStarted: 'Dodaj konto bankowe, aby zwracać wydatki, wydawać karty Expensify, pobierać płatności za faktury i opłacać rachunki wszystko z jednego miejsca.',
        plaidBodyCopy: 'Daj swoim pracownikom łatwiejszy sposób na płacenie - i otrzymywanie zwrotu - za wydatki firmowe.',
        checkHelpLine: 'Twój numer rozliczeniowy i numer konta można znaleźć na czeku dla tego konta.',
        hasPhoneLoginError: function (_a) {
            var contactMethodRoute = _a.contactMethodRoute;
            return "Aby po\u0142\u0105czy\u0107 konto bankowe, prosz\u0119 <a href=\"".concat(contactMethodRoute, "\">dodaj e-mail jako swoje g\u0142\u00F3wne dane logowania</a> i spr\u00F3buj ponownie. Mo\u017Cesz doda\u0107 sw\u00F3j numer telefonu jako dodatkowy login.");
        },
        hasBeenThrottledError: 'Wystąpił błąd podczas dodawania Twojego konta bankowego. Proszę poczekać kilka minut i spróbować ponownie.',
        hasCurrencyError: function (_a) {
            var workspaceRoute = _a.workspaceRoute;
            return "Ups! Wygl\u0105da na to, \u017Ce waluta Twojego miejsca pracy jest ustawiona na inn\u0105 ni\u017C USD. Aby kontynuowa\u0107, przejd\u017A do <a href=\"".concat(workspaceRoute, "\">ustawienia Twojego miejsca pracy</a> ustawi\u0107 na USD i spr\u00F3bowa\u0107 ponownie.");
        },
        error: {
            youNeedToSelectAnOption: 'Proszę wybrać opcję, aby kontynuować',
            noBankAccountAvailable: 'Przepraszamy, nie ma dostępnego konta bankowego.',
            noBankAccountSelected: 'Proszę wybrać konto',
            taxID: 'Proszę wprowadzić prawidłowy numer identyfikacji podatkowej',
            website: 'Proszę wprowadzić prawidłową stronę internetową',
            zipCode: "Prosz\u0119 wprowadzi\u0107 prawid\u0142owy kod pocztowy u\u017Cywaj\u0105c formatu: ".concat(CONST_1.default.COUNTRY_ZIP_REGEX_DATA.US.samples),
            phoneNumber: 'Proszę wprowadzić prawidłowy numer telefonu',
            email: 'Proszę wprowadzić prawidłowy adres e-mail',
            companyName: 'Proszę wprowadzić prawidłową nazwę firmy',
            addressCity: 'Proszę wprowadzić prawidłowe miasto',
            addressStreet: 'Proszę wprowadzić prawidłowy adres ulicy',
            addressState: 'Proszę wybrać prawidłowy stan',
            incorporationDateFuture: 'Data założenia nie może być w przyszłości',
            incorporationState: 'Proszę wybrać prawidłowy stan',
            industryCode: 'Proszę wprowadzić prawidłowy kod klasyfikacji branżowej składający się z sześciu cyfr',
            restrictedBusiness: 'Proszę potwierdzić, że firma nie znajduje się na liście firm objętych ograniczeniami.',
            routingNumber: 'Proszę wprowadzić prawidłowy numer rozliczeniowy',
            accountNumber: 'Proszę wprowadzić prawidłowy numer konta',
            routingAndAccountNumberCannotBeSame: 'Numery trasowania i konta nie mogą się zgadzać',
            companyType: 'Proszę wybrać prawidłowy typ firmy',
            tooManyAttempts: 'Z powodu dużej liczby prób logowania, ta opcja została wyłączona na 24 godziny. Proszę spróbować ponownie później lub wprowadzić dane ręcznie.',
            address: 'Proszę wprowadzić prawidłowy adres',
            dob: 'Proszę wybrać prawidłową datę urodzenia',
            age: 'Musisz mieć ukończone 18 lat',
            ssnLast4: 'Proszę wprowadzić prawidłowe ostatnie 4 cyfry numeru SSN',
            firstName: 'Proszę wprowadzić prawidłowe imię',
            lastName: 'Proszę wprowadzić prawidłowe nazwisko',
            noDefaultDepositAccountOrDebitCardAvailable: 'Proszę dodać domyślne konto depozytowe lub kartę debetową',
            validationAmounts: 'Kwoty weryfikacyjne, które wprowadziłeś, są nieprawidłowe. Proszę dokładnie sprawdzić wyciąg bankowy i spróbować ponownie.',
            fullName: 'Proszę wprowadzić prawidłowe pełne imię i nazwisko',
            ownershipPercentage: 'Proszę wprowadzić prawidłową liczbę procentową',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Gdzie znajduje się Twoje konto bankowe?',
        accountDetailsStepHeader: 'Jakie są szczegóły Twojego konta?',
        accountTypeStepHeader: 'Jakiego typu jest to konto?',
        bankInformationStepHeader: 'Jakie są Twoje dane bankowe?',
        accountHolderInformationStepHeader: 'Jakie są dane posiadacza konta?',
        howDoWeProtectYourData: 'Jak chronimy Twoje dane?',
        currencyHeader: 'Jaka jest waluta Twojego konta bankowego?',
        confirmationStepHeader: 'Sprawdź swoje informacje.',
        confirmationStepSubHeader: 'Sprawdź poniższe szczegóły i zaznacz pole z warunkami, aby potwierdzić.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Wprowadź hasło do Expensify',
        alreadyAdded: 'To konto zostało już dodane.',
        chooseAccountLabel: 'Konto',
        successTitle: 'Dodano osobiste konto bankowe!',
        successMessage: 'Gratulacje, Twoje konto bankowe jest skonfigurowane i gotowe do otrzymywania zwrotów.',
    },
    attachmentView: {
        unknownFilename: 'Nieznana nazwa pliku',
        passwordRequired: 'Proszę wprowadzić hasło',
        passwordIncorrect: 'Nieprawidłowe hasło. Spróbuj ponownie.',
        failedToLoadPDF: 'Nie udało się załadować pliku PDF',
        pdfPasswordForm: {
            title: 'PDF chroniony hasłem',
            infoText: 'Ten plik PDF jest chroniony hasłem.',
            beforeLinkText: 'Proszę',
            linkText: 'wprowadź hasło',
            afterLinkText: 'aby to zobaczyć.',
            formLabel: 'Pokaż PDF',
        },
        attachmentNotFound: 'Załącznik nie znaleziony',
    },
    messages: {
        errorMessageInvalidPhone: "Prosz\u0119 wprowadzi\u0107 prawid\u0142owy numer telefonu bez nawias\u00F3w i my\u015Blnik\u00F3w. Je\u015Bli jeste\u015B poza USA, do\u0142\u0105cz sw\u00F3j kod kraju (np. ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")."),
        errorMessageInvalidEmail: 'Nieprawidłowy adres e-mail',
        userIsAlreadyMember: function (_a) {
            var login = _a.login, name = _a.name;
            return "".concat(login, " jest ju\u017C cz\u0142onkiem ").concat(name);
        },
    },
    onfidoStep: {
        acceptTerms: 'Kontynuując prośbę o aktywację Portfela Expensify, potwierdzasz, że przeczytałeś, rozumiesz i akceptujesz',
        facialScan: 'Polityka i Zgoda na Skanowanie Twarzy Onfido',
        tryAgain: 'Spróbuj ponownie',
        verifyIdentity: 'Zweryfikuj tożsamość',
        letsVerifyIdentity: 'Zweryfikujmy Twoją tożsamość',
        butFirst: "Ale najpierw nudne rzeczy. Zapoznaj si\u0119 z prawniczym \u017Cargonem w nast\u0119pnym kroku i kliknij \u201EAkceptuj\u201D, gdy b\u0119dziesz gotowy.",
        genericError: 'Wystąpił błąd podczas przetwarzania tego kroku. Proszę spróbować ponownie.',
        cameraPermissionsNotGranted: 'Włącz dostęp do aparatu',
        cameraRequestMessage: 'Potrzebujemy dostępu do Twojego aparatu, aby zakończyć weryfikację konta bankowego. Proszę włączyć w Ustawieniach > New Expensify.',
        microphonePermissionsNotGranted: 'Włącz dostęp do mikrofonu',
        microphoneRequestMessage: 'Potrzebujemy dostępu do Twojego mikrofonu, aby zakończyć weryfikację konta bankowego. Proszę włączyć w Ustawieniach > New Expensify.',
        originalDocumentNeeded: 'Proszę przesłać oryginalny obraz swojego dowodu tożsamości zamiast zrzutu ekranu lub zeskanowanego obrazu.',
        documentNeedsBetterQuality: 'Twój dowód tożsamości wydaje się być uszkodzony lub brakuje mu cech zabezpieczających. Proszę przesłać oryginalny obraz nieuszkodzonego dowodu tożsamości, który jest w pełni widoczny.',
        imageNeedsBetterQuality: 'Wystąpił problem z jakością obrazu Twojego dowodu tożsamości. Proszę przesłać nowy obraz, na którym cały dowód tożsamości jest wyraźnie widoczny.',
        selfieIssue: 'Wystąpił problem z Twoim selfie/wideo. Proszę przesłać aktualne selfie/wideo.',
        selfieNotMatching: 'Twoje selfie/wideo nie pasuje do Twojego dowodu tożsamości. Proszę, prześlij nowe selfie/wideo, na którym Twoja twarz jest wyraźnie widoczna.',
        selfieNotLive: 'Twoje selfie/wideo nie wygląda na zdjęcie/wideo na żywo. Proszę przesłać selfie/wideo na żywo.',
    },
    additionalDetailsStep: {
        headerTitle: 'Dodatkowe szczegóły',
        helpText: 'Musimy potwierdzić następujące informacje, zanim będziesz mógł wysyłać i odbierać pieniądze z portfela.',
        helpTextIdologyQuestions: 'Musimy zadać Ci jeszcze kilka pytań, aby zakończyć weryfikację Twojej tożsamości.',
        helpLink: 'Dowiedz się więcej, dlaczego tego potrzebujemy.',
        legalFirstNameLabel: 'Imię prawne',
        legalMiddleNameLabel: 'Drugie imię (prawne)',
        legalLastNameLabel: 'Nazwisko prawne',
        selectAnswer: 'Proszę wybrać odpowiedź, aby kontynuować',
        ssnFull9Error: 'Proszę wprowadzić prawidłowy dziewięciocyfrowy numer SSN',
        needSSNFull9: 'Mamy problem z weryfikacją Twojego numeru SSN. Proszę wprowadzić pełne dziewięć cyfr swojego numeru SSN.',
        weCouldNotVerify: 'Nie mogliśmy zweryfikować',
        pleaseFixIt: 'Proszę poprawić te informacje przed kontynuowaniem',
        failedKYCTextBefore: 'Nie udało nam się zweryfikować Twojej tożsamości. Spróbuj ponownie później lub skontaktuj się z',
        failedKYCTextAfter: 'jeśli masz jakieś pytania.',
    },
    termsStep: {
        headerTitle: 'Warunki i opłaty',
        headerTitleRefactor: 'Opłaty i warunki',
        haveReadAndAgree: 'Przeczytałem i zgadzam się na otrzymywanie',
        electronicDisclosures: 'elektroniczne ujawnienia',
        agreeToThe: 'Zgadzam się na',
        walletAgreement: 'Umowa portfela',
        enablePayments: 'Włącz płatności',
        monthlyFee: 'Miesięczna opłata',
        inactivity: 'Nieaktywność',
        noOverdraftOrCredit: 'Brak funkcji debetu/kredytu.',
        electronicFundsWithdrawal: 'Elektroniczne wycofanie środków',
        standard: 'Standardowy',
        reviewTheFees: 'Spójrz na niektóre opłaty.',
        checkTheBoxes: 'Proszę zaznaczyć poniższe pola.',
        agreeToTerms: 'Zgódź się na warunki, a będziesz gotowy do działania!',
        shortTermsForm: {
            expensifyPaymentsAccount: function (_a) {
                var walletProgram = _a.walletProgram;
                return "Portfel Expensify jest wydawany przez ".concat(walletProgram, ".");
            },
            perPurchase: 'Za zakup',
            atmWithdrawal: 'Wypłata z bankomatu',
            cashReload: 'Doładowanie gotówką',
            inNetwork: 'w sieci',
            outOfNetwork: 'poza siecią',
            atmBalanceInquiry: 'Zapytanie o saldo bankomatu',
            inOrOutOfNetwork: '(w sieci lub poza siecią)',
            customerService: 'Obsługa klienta',
            automatedOrLive: '(automated or live agent)',
            afterTwelveMonths: '(po 12 miesiącach bez transakcji)',
            weChargeOneFee: 'Pobieramy jeszcze jedną opłatę. Jest to:',
            fdicInsurance: 'Twoje środki kwalifikują się do ubezpieczenia FDIC.',
            generalInfo: 'Aby uzyskać ogólne informacje na temat kont przedpłaconych, odwiedź',
            conditionsDetails: 'Aby uzyskać szczegóły i warunki dotyczące wszystkich opłat i usług, odwiedź',
            conditionsPhone: 'lub dzwoniąc pod numer +1 833-400-0904.',
            instant: '(instant)',
            electronicFundsInstantFeeMin: function (_a) {
                var amount = _a.amount;
                return "(min ".concat(amount, ")");
            },
        },
        longTermsForm: {
            listOfAllFees: 'Lista wszystkich opłat za portfel Expensify',
            typeOfFeeHeader: 'Wszystkie opłaty',
            feeAmountHeader: 'Kwota',
            moreDetailsHeader: 'Szczegóły',
            openingAccountTitle: 'Otwieranie konta',
            openingAccountDetails: 'Nie ma opłaty za otwarcie konta.',
            monthlyFeeDetails: 'Nie ma miesięcznej opłaty.',
            customerServiceTitle: 'Obsługa klienta',
            customerServiceDetails: 'Nie ma opłat za obsługę klienta.',
            inactivityDetails: 'Nie ma opłaty za brak aktywności.',
            sendingFundsTitle: 'Wysyłanie środków do innego posiadacza konta',
            sendingFundsDetails: 'Nie ma opłaty za wysyłanie środków do innego posiadacza konta przy użyciu salda, konta bankowego lub karty debetowej.',
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
            fdicInsuranceBancorp2: 'szczegóły.',
            contactExpensifyPayments: "Skontaktuj si\u0119 z ".concat(CONST_1.default.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS, ", dzwoni\u0105c pod numer +1 833-400-0904, lub e-mailem na adres"),
            contactExpensifyPayments2: 'lub zaloguj się na',
            generalInformation: 'Aby uzyskać ogólne informacje na temat kont przedpłaconych, odwiedź',
            generalInformation2: 'Jeśli masz skargę dotyczącą konta przedpłaconego, zadzwoń do Biura Ochrony Konsumentów pod numer 1-855-411-2372 lub odwiedź',
            printerFriendlyView: 'Wyświetl wersję przyjazną dla drukarki',
            automated: 'Zautomatyzowany',
            liveAgent: 'Agent na żywo',
            instant: 'Natychmiastowy',
            electronicFundsInstantFeeMin: function (_a) {
                var amount = _a.amount;
                return "Min ".concat(amount);
            },
        },
    },
    activateStep: {
        headerTitle: 'Włącz płatności',
        activatedTitle: 'Portfel aktywowany!',
        activatedMessage: 'Gratulacje, Twój portfel jest gotowy do dokonywania płatności.',
        checkBackLaterTitle: 'Tylko chwilkę...',
        checkBackLaterMessage: 'Nadal przeglądamy Twoje informacje. Proszę sprawdź ponownie później.',
        continueToPayment: 'Przejdź do płatności',
        continueToTransfer: 'Kontynuuj transferowanie',
    },
    companyStep: {
        headerTitle: 'Informacje o firmie',
        subtitle: 'Prawie gotowe! Ze względów bezpieczeństwa musimy potwierdzić pewne informacje:',
        legalBusinessName: 'Prawna nazwa firmy',
        companyWebsite: 'Strona internetowa firmy',
        taxIDNumber: 'Numer identyfikacji podatkowej',
        taxIDNumberPlaceholder: '9 cyfr',
        companyType: 'Typ firmy',
        incorporationDate: 'Data założenia firmy',
        incorporationState: 'Stan inkorporacji',
        industryClassificationCode: 'Kod klasyfikacji branżowej',
        confirmCompanyIsNot: 'Potwierdzam, że ta firma nie znajduje się na',
        listOfRestrictedBusinesses: 'lista działalności objętych ograniczeniami',
        incorporationDatePlaceholder: 'Data rozpoczęcia (rrrr-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerstwo',
            COOPERATIVE: 'Kooperatywa',
            SOLE_PROPRIETORSHIP: 'Jednoosobowa działalność gospodarcza',
            OTHER: 'Inne',
        },
        industryClassification: 'Do jakiej branży jest sklasyfikowana firma?',
        industryClassificationCodePlaceholder: 'Wyszukaj kod klasyfikacji branżowej',
    },
    requestorStep: {
        headerTitle: 'Informacje osobiste',
        learnMore: 'Dowiedz się więcej',
        isMyDataSafe: 'Czy moje dane są bezpieczne?',
    },
    personalInfoStep: {
        personalInfo: 'Dane osobowe',
        enterYourLegalFirstAndLast: 'Jakie jest Twoje imię i nazwisko?',
        legalFirstName: 'Imię prawne',
        legalLastName: 'Nazwisko prawne',
        legalName: 'Imię i nazwisko prawne',
        enterYourDateOfBirth: 'Jaka jest Twoja data urodzenia?',
        enterTheLast4: 'Jakie są ostatnie cztery cyfry Twojego numeru ubezpieczenia społecznego?',
        dontWorry: 'Nie martw się, nie przeprowadzamy żadnych osobistych sprawdzeń kredytowych!',
        last4SSN: 'Ostatnie 4 cyfry numeru SSN',
        enterYourAddress: 'Jaki jest Twój adres?',
        address: 'Adres',
        letsDoubleCheck: 'Sprawdźmy podwójnie, czy wszystko wygląda dobrze.',
        byAddingThisBankAccount: 'Dodając to konto bankowe, potwierdzasz, że przeczytałeś, rozumiesz i akceptujesz',
        whatsYourLegalName: 'Jakie jest Twoje imię i nazwisko?',
        whatsYourDOB: 'Jaka jest Twoja data urodzenia?',
        whatsYourAddress: 'Jaki jest Twój adres?',
        whatsYourSSN: 'Jakie są ostatnie cztery cyfry Twojego numeru ubezpieczenia społecznego?',
        noPersonalChecks: 'Nie martw się, tutaj nie ma sprawdzania zdolności kredytowej!',
        whatsYourPhoneNumber: 'Jaki jest Twój numer telefonu?',
        weNeedThisToVerify: 'Potrzebujemy tego, aby zweryfikować Twój portfel.',
    },
    businessInfoStep: {
        businessInfo: 'Informacje o firmie',
        enterTheNameOfYourBusiness: 'Jak nazywa się Twoja firma?',
        businessName: 'Prawna nazwa firmy',
        enterYourCompanyTaxIdNumber: 'Jaki jest numer identyfikacyjny podatkowy Twojej firmy?',
        taxIDNumber: 'Numer identyfikacji podatkowej',
        taxIDNumberPlaceholder: '9 cyfr',
        enterYourCompanyWebsite: 'Jaka jest strona internetowa Twojej firmy?',
        companyWebsite: 'Strona internetowa firmy',
        enterYourCompanyPhoneNumber: 'Jaki jest numer telefonu Twojej firmy?',
        enterYourCompanyAddress: 'Jaki jest adres Twojej firmy?',
        selectYourCompanyType: 'Jaki to rodzaj firmy?',
        companyType: 'Typ firmy',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: 'Corp',
            PARTNERSHIP: 'Partnerstwo',
            COOPERATIVE: 'Kooperatywa',
            SOLE_PROPRIETORSHIP: 'Jednoosobowa działalność gospodarcza',
            OTHER: 'Inne',
        },
        selectYourCompanyIncorporationDate: 'Jaka jest data rejestracji Twojej firmy?',
        incorporationDate: 'Data założenia firmy',
        incorporationDatePlaceholder: 'Data rozpoczęcia (rrrr-mm-dd)',
        incorporationState: 'Stan inkorporacji',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: 'W którym stanie została zarejestrowana Twoja firma?',
        letsDoubleCheck: 'Sprawdźmy podwójnie, czy wszystko wygląda dobrze.',
        companyAddress: 'Adres firmy',
        listOfRestrictedBusinesses: 'lista działalności objętych ograniczeniami',
        confirmCompanyIsNot: 'Potwierdzam, że ta firma nie znajduje się na',
        businessInfoTitle: 'Informacje o firmie',
        legalBusinessName: 'Prawna nazwa firmy',
        whatsTheBusinessName: 'Jak nazywa się firma?',
        whatsTheBusinessAddress: 'Jaki jest adres firmy?',
        whatsTheBusinessContactInformation: 'Jakie są dane kontaktowe firmy?',
        whatsTheBusinessRegistrationNumber: 'Jaki jest numer rejestracyjny firmy?',
        whatsTheBusinessTaxIDEIN: function (_a) {
            var country = _a.country;
            switch (country) {
                case CONST_1.default.COUNTRY.US:
                    return 'Jaki jest numer identyfikacyjny pracodawcy (EIN)?';
                case CONST_1.default.COUNTRY.CA:
                    return 'Jaki jest numer identyfikacyjny firmy (BN)?';
                case CONST_1.default.COUNTRY.GB:
                    return 'Jaki jest numer rejestracyjny VAT (VRN)?';
                case CONST_1.default.COUNTRY.AU:
                    return 'Jaki jest australijski numer identyfikacyjny firmy (ABN)?';
                default:
                    return 'Jaki jest unijny numer VAT?';
            }
        },
        whatsThisNumber: 'Co to za numer?',
        whereWasTheBusinessIncorporated: 'Gdzie została zarejestrowana firma?',
        whatTypeOfBusinessIsIt: 'Jaki to rodzaj działalności?',
        whatsTheBusinessAnnualPayment: 'Jaki jest roczny wolumen płatności firmy?',
        whatsYourExpectedAverageReimbursements: 'Jaka jest oczekiwana średnia kwota zwrotu?',
        registrationNumber: 'Numer rejestracyjny',
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
                    return 'VAT UE';
            }
        },
        businessAddress: 'Adres firmowy',
        businessType: 'Typ działalności',
        incorporation: 'Inkorporacja',
        incorporationCountry: 'Kraj inkorporacji',
        incorporationTypeName: 'Typ inkorporacji',
        businessCategory: 'Kategoria biznesowa',
        annualPaymentVolume: 'Roczna wartość płatności',
        annualPaymentVolumeInCurrency: function (_a) {
            var currencyCode = _a.currencyCode;
            return "Roczna warto\u015B\u0107 p\u0142atno\u015Bci w ".concat(currencyCode);
        },
        averageReimbursementAmount: 'Średnia kwota zwrotu',
        averageReimbursementAmountInCurrency: function (_a) {
            var currencyCode = _a.currencyCode;
            return "\u015Arednia kwota zwrotu w ".concat(currencyCode);
        },
        selectIncorporationType: 'Wybierz typ rejestracji',
        selectBusinessCategory: 'Wybierz kategorię biznesową',
        selectAnnualPaymentVolume: 'Wybierz roczną wartość płatności',
        selectIncorporationCountry: 'Wybierz kraj rejestracji',
        selectIncorporationState: 'Wybierz stan rejestracji',
        selectAverageReimbursement: 'Wybierz średnią kwotę zwrotu',
        findIncorporationType: 'Znajdź rodzaj inkorporacji',
        findBusinessCategory: 'Znajdź kategorię biznesową',
        findAnnualPaymentVolume: 'Znajdź roczny wolumen płatności',
        findIncorporationState: 'Znajdź stan rejestracji',
        findAverageReimbursement: 'Znajdź średnią kwotę zwrotu',
        error: {
            registrationNumber: 'Proszę podać prawidłowy numer rejestracyjny',
            taxIDEIN: function (_a) {
                var country = _a.country;
                switch (country) {
                    case CONST_1.default.COUNTRY.US:
                        return 'Proszę podać prawidłowy numer identyfikacyjny pracodawcy (EIN)';
                    case CONST_1.default.COUNTRY.CA:
                        return 'Proszę podać prawidłowy numer identyfikacyjny firmy (BN)';
                    case CONST_1.default.COUNTRY.GB:
                        return 'Proszę podać prawidłowy numer rejestracyjny VAT (VRN)';
                    case CONST_1.default.COUNTRY.AU:
                        return 'Proszę podać prawidłowy australijski numer identyfikacyjny firmy (ABN)';
                    default:
                        return 'Proszę podać prawidłowy unijny numer VAT';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: 'Czy posiadasz 25% lub więcej z',
        doAnyIndividualOwn25percent: 'Czy jakiekolwiek osoby posiadają 25% lub więcej z',
        areThereMoreIndividualsWhoOwn25percent: 'Czy istnieje więcej osób, które posiadają 25% lub więcej z',
        regulationRequiresUsToVerifyTheIdentity: 'Przepisy wymagają od nas weryfikacji tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        companyOwner: 'Właściciel firmy',
        enterLegalFirstAndLastName: 'Jakie jest prawne imię właściciela?',
        legalFirstName: 'Imię prawne',
        legalLastName: 'Nazwisko prawne',
        enterTheDateOfBirthOfTheOwner: 'Jaka jest data urodzenia właściciela?',
        enterTheLast4: 'Jakie są ostatnie 4 cyfry numeru Social Security właściciela?',
        last4SSN: 'Ostatnie 4 cyfry numeru SSN',
        dontWorry: 'Nie martw się, nie przeprowadzamy żadnych osobistych sprawdzeń kredytowych!',
        enterTheOwnersAddress: 'Jaki jest adres właściciela?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda dobrze.',
        legalName: 'Imię i nazwisko prawne',
        address: 'Adres',
        byAddingThisBankAccount: 'Dodając to konto bankowe, potwierdzasz, że przeczytałeś, rozumiesz i akceptujesz',
        owners: 'Właściciele',
    },
    ownershipInfoStep: {
        ownerInfo: 'Informacje o właścicielu',
        businessOwner: 'Właściciel firmy',
        signerInfo: 'Informacje o sygnatariuszu',
        doYouOwn: function (_a) {
            var companyName = _a.companyName;
            return "Czy posiadasz 25% lub wi\u0119cej udzia\u0142\u00F3w w ".concat(companyName, "?");
        },
        doesAnyoneOwn: function (_a) {
            var companyName = _a.companyName;
            return "Czy jakakolwiek osoba posiada 25% lub wi\u0119cej udzia\u0142\u00F3w w ".concat(companyName, "?");
        },
        regulationsRequire: 'Przepisy wymagają od nas weryfikacji tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        legalFirstName: 'Imię prawne',
        legalLastName: 'Nazwisko prawne',
        whatsTheOwnersName: 'Jakie jest prawne imię właściciela?',
        whatsYourName: 'Jakie jest Twoje imię i nazwisko?',
        whatPercentage: 'Jaki procent firmy należy do właściciela?',
        whatsYoursPercentage: 'Jaki procent firmy posiadasz?',
        ownership: 'Własność',
        whatsTheOwnersDOB: 'Jaka jest data urodzenia właściciela?',
        whatsYourDOB: 'Jaka jest Twoja data urodzenia?',
        whatsTheOwnersAddress: 'Jaki jest adres właściciela?',
        whatsYourAddress: 'Jaki jest Twój adres?',
        whatAreTheLast: 'Jakie są ostatnie 4 cyfry numeru Social Security właściciela?',
        whatsYourLast: 'Jakie są ostatnie 4 cyfry Twojego numeru Social Security?',
        dontWorry: 'Nie martw się, nie przeprowadzamy żadnych osobistych sprawdzeń kredytowych!',
        last4: 'Ostatnie 4 cyfry numeru SSN',
        whyDoWeAsk: 'Dlaczego o to prosimy?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda dobrze.',
        legalName: 'Imię i nazwisko prawne',
        ownershipPercentage: 'Procent własności',
        areThereOther: function (_a) {
            var companyName = _a.companyName;
            return "Czy s\u0105 inne osoby, kt\u00F3re posiadaj\u0105 25% lub wi\u0119cej udzia\u0142\u00F3w w ".concat(companyName, "?");
        },
        owners: 'Właściciele',
        addCertified: 'Dodaj certyfikowany schemat organizacyjny, który pokazuje właścicieli beneficjentów',
        regulationRequiresChart: 'Przepisy wymagają od nas zebrania poświadczonej kopii schematu własności, który pokazuje każdą osobę fizyczną lub podmiot posiadający 25% lub więcej udziałów w firmie.',
        uploadEntity: 'Prześlij wykres własności podmiotu',
        noteEntity: 'Uwaga: Schemat własności jednostki musi być podpisany przez Twojego księgowego, doradcę prawnego lub notarialnie poświadczony.',
        certified: 'Certyfikowany wykres własności jednostki',
        selectCountry: 'Wybierz kraj',
        findCountry: 'Znajdź kraj',
        address: 'Adres',
        chooseFile: 'Wybierz plik',
        uploadDocuments: 'Prześlij dodatkową dokumentację',
        pleaseUpload: 'Proszę przesłać dodatkową dokumentację poniżej, aby pomóc nam zweryfikować Twoją tożsamość jako bezpośredniego lub pośredniego właściciela 25% lub więcej podmiotu gospodarczego.',
        acceptedFiles: 'Akceptowane formaty plików: PDF, PNG, JPEG. Całkowity rozmiar plików dla każdej sekcji nie może przekraczać 5 MB.',
        proofOfBeneficialOwner: 'Dowód właściciela rzeczywistego',
        proofOfBeneficialOwnerDescription: 'Proszę dostarczyć podpisane oświadczenie i schemat organizacyjny od publicznego księgowego, notariusza lub prawnika potwierdzające posiadanie 25% lub więcej udziałów w firmie. Dokument musi być datowany na ostatnie trzy miesiące i zawierać numer licencji osoby podpisującej.',
        copyOfID: 'Kopia dowodu tożsamości dla beneficjenta rzeczywistego',
        copyOfIDDescription: 'Przykłady: paszport, prawo jazdy, itp.',
        proofOfAddress: 'Potwierdzenie adresu dla rzeczywistego właściciela',
        proofOfAddressDescription: 'Przykłady: rachunek za media, umowa najmu, itp.',
        codiceFiscale: 'Codice fiscale/Tax ID',
        codiceFiscaleDescription: 'Proszę przesłać wideo z wizyty na miejscu lub nagranie rozmowy z urzędnikiem podpisującym. Urzędnik musi podać: pełne imię i nazwisko, datę urodzenia, nazwę firmy, numer rejestrowy, numer kodu fiskalnego, adres rejestrowy, rodzaj działalności oraz cel założenia konta.',
    },
    validationStep: {
        headerTitle: 'Zatwierdź konto bankowe',
        buttonText: 'Zakończ konfigurację',
        maxAttemptsReached: 'Weryfikacja tego konta bankowego została wyłączona z powodu zbyt wielu niepoprawnych prób.',
        description: "W ci\u0105gu 1-2 dni roboczych wy\u015Blemy trzy (3) ma\u0142e transakcje na Twoje konto bankowe z nazw\u0105 tak\u0105 jak \"Expensify, Inc. Validation\".",
        descriptionCTA: 'Proszę wprowadzić kwotę każdej transakcji w poniższych polach. Przykład: 1.51.',
        reviewingInfo: 'Dziękujemy! Przeglądamy Twoje informacje i wkrótce się z Tobą skontaktujemy. Proszę sprawdź czat z Concierge.',
        forNextStep: 'w celu wykonania kolejnych kroków, aby dokończyć konfigurację konta bankowego.',
        letsChatCTA: 'Tak, porozmawiajmy.',
        letsChatText: 'Prawie gotowe! Potrzebujemy Twojej pomocy w weryfikacji kilku ostatnich informacji przez czat. Gotowy?',
        letsChatTitle: 'Porozmawiajmy!',
        enable2FATitle: 'Aby zapobiec oszustwom, włącz uwierzytelnianie dwuskładnikowe (2FA)',
        enable2FAText: 'Poważnie podchodzimy do Twojego bezpieczeństwa. Proszę skonfigurować 2FA, aby dodać dodatkową warstwę ochrony do swojego konta.',
        secureYourAccount: 'Zabezpiecz swoje konto',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Dodatkowe informacje',
        checkAllThatApply: 'Zaznacz wszystkie, które mają zastosowanie, w przeciwnym razie pozostaw puste.',
        iOwnMoreThan25Percent: 'Posiadam więcej niż 25% z',
        someoneOwnsMoreThan25Percent: 'Ktoś inny posiada więcej niż 25% z',
        additionalOwner: 'Dodatkowy beneficjent rzeczywisty',
        removeOwner: 'Usuń tego beneficjenta rzeczywistego',
        addAnotherIndividual: 'Dodaj kolejną osobę, która posiada więcej niż 25% z',
        agreement: 'Umowa:',
        termsAndConditions: 'warunki i zasady',
        certifyTrueAndAccurate: 'Oświadczam, że podane informacje są prawdziwe i dokładne',
        error: {
            certify: 'Musi poświadczyć, że informacje są prawdziwe i dokładne',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Zakończ weryfikację',
        confirmAgreements: 'Proszę potwierdzić poniższe umowy.',
        certifyTrueAndAccurate: 'Oświadczam, że podane informacje są prawdziwe i dokładne',
        certifyTrueAndAccurateError: 'Proszę potwierdzić, że informacje są prawdziwe i dokładne.',
        isAuthorizedToUseBankAccount: 'Jestem upoważniony do korzystania z tego firmowego konta bankowego na wydatki biznesowe.',
        isAuthorizedToUseBankAccountError: 'Musisz być kontrolującym urzędnikiem z upoważnieniem do obsługi konta bankowego firmy',
        termsAndConditions: 'warunki i zasady',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Połącz konto bankowe',
        finishButtonText: 'Zakończ konfigurację',
        validateYourBankAccount: 'Zwaliduj swoje konto bankowe',
        validateButtonText: 'Zatwierdź',
        validationInputLabel: 'Transakcja',
        maxAttemptsReached: 'Weryfikacja tego konta bankowego została wyłączona z powodu zbyt wielu niepoprawnych prób.',
        description: "W ci\u0105gu 1-2 dni roboczych wy\u015Blemy trzy (3) ma\u0142e transakcje na Twoje konto bankowe z nazw\u0105 tak\u0105 jak \"Expensify, Inc. Validation\".",
        descriptionCTA: 'Proszę wprowadzić kwotę każdej transakcji w poniższych polach. Przykład: 1.51.',
        reviewingInfo: 'Dziękujemy! Przeglądamy Twoje informacje i wkrótce się z Tobą skontaktujemy. Sprawdź swój czat z Concierge.',
        forNextSteps: 'w celu wykonania kolejnych kroków, aby dokończyć konfigurację konta bankowego.',
        letsChatCTA: 'Tak, porozmawiajmy.',
        letsChatText: 'Prawie gotowe! Potrzebujemy Twojej pomocy w weryfikacji kilku ostatnich informacji przez czat. Gotowy?',
        letsChatTitle: 'Porozmawiajmy!',
        enable2FATitle: 'Aby zapobiec oszustwom, włącz uwierzytelnianie dwuskładnikowe (2FA)',
        enable2FAText: 'Poważnie podchodzimy do Twojego bezpieczeństwa. Proszę skonfigurować 2FA, aby dodać dodatkową warstwę ochrony do swojego konta.',
        secureYourAccount: 'Zabezpiecz swoje konto',
    },
    countryStep: {
        confirmBusinessBank: 'Potwierdź walutę i kraj firmowego konta bankowego',
        confirmCurrency: 'Potwierdź walutę i kraj',
        yourBusiness: 'Waluta Twojego firmowego konta bankowego musi być zgodna z walutą Twojego miejsca pracy.',
        youCanChange: 'Możesz zmienić walutę swojego miejsca pracy w swoim',
        findCountry: 'Znajdź kraj',
        selectCountry: 'Wybierz kraj',
    },
    bankInfoStep: {
        whatAreYour: 'Jakie są dane Twojego firmowego konta bankowego?',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda w porządku.',
        thisBankAccount: 'To konto bankowe będzie używane do płatności biznesowych w Twoim miejscu pracy.',
        accountNumber: 'Numer konta',
        accountHolderNameDescription: 'Pełne imię i nazwisko osoby upoważnionej do podpisu',
    },
    signerInfoStep: {
        signerInfo: 'Informacje o sygnatariuszu',
        areYouDirector: function (_a) {
            var companyName = _a.companyName;
            return "Czy jeste\u015B dyrektorem lub starszym urz\u0119dnikiem w ".concat(companyName, "?");
        },
        regulationRequiresUs: 'Przepisy wymagają, abyśmy zweryfikowali, czy podpisujący ma uprawnienia do podjęcia tej czynności w imieniu firmy.',
        whatsYourName: 'Jakie jest Twoje imię i nazwisko?',
        fullName: 'Pełne imię i nazwisko zgodne z dokumentem tożsamości',
        whatsYourJobTitle: 'Jaki jest Twój tytuł zawodowy?',
        jobTitle: 'Stanowisko pracy',
        whatsYourDOB: 'Jaka jest Twoja data urodzenia?',
        uploadID: 'Prześlij dokument tożsamości i dowód adresu',
        personalAddress: 'Potwierdzenie adresu zamieszkania (np. rachunek za media)',
        letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda dobrze.',
        legalName: 'Imię i nazwisko prawne',
        proofOf: 'Dowód adresu zamieszkania',
        enterOneEmail: function (_a) {
            var companyName = _a.companyName;
            return "Wprowad\u017A adres e-mail dyrektora lub starszego urz\u0119dnika w ".concat(companyName);
        },
        regulationRequiresOneMoreDirector: 'Regulacje wymagają co najmniej jednego dodatkowego dyrektora lub starszego urzędnika jako sygnatariusza.',
        hangTight: 'Poczekaj chwilę...',
        enterTwoEmails: function (_a) {
            var companyName = _a.companyName;
            return "Wprowad\u017A adresy e-mail dw\u00F3ch dyrektor\u00F3w lub wy\u017Cszych rang\u0105 pracownik\u00F3w w ".concat(companyName);
        },
        sendReminder: 'Wyślij przypomnienie',
        chooseFile: 'Wybierz plik',
        weAreWaiting: 'Czekamy, aż inni zweryfikują swoje tożsamości jako dyrektorzy lub wyżsi urzędnicy firmy.',
        id: 'Kopia dowodu tożsamości',
        proofOfDirectors: 'Dowód dyrektora/dyrektorów',
        proofOfDirectorsDescription: 'Przykłady: Profil korporacyjny Oncorp lub Rejestracja działalności gospodarczej.',
        codiceFiscale: 'Codice Fiscale',
        codiceFiscaleDescription: 'Codice Fiscale dla Sygnatariuszy, Użytkowników Upoważnionych i Właścicieli Korzyści.',
        PDSandFSG: 'Dokumentacja ujawnienia PDS + FSG',
        PDSandFSGDescription: 'Nasze partnerstwo z Corpay wykorzystuje połączenie API, aby skorzystać z ich rozległej sieci międzynarodowych partnerów bankowych do zasilania Globalnych Zwrotów w Expensify. Zgodnie z australijskimi przepisami dostarczamy Ci Przewodnik po Usługach Finansowych (FSG) i Oświadczenie o Ujawnieniu Produktu (PDS) Corpay.\n\nProsimy o uważne przeczytanie dokumentów FSG i PDS, ponieważ zawierają one pełne szczegóły i ważne informacje na temat produktów i usług oferowanych przez Corpay. Zachowaj te dokumenty do przyszłego wglądu.',
        pleaseUpload: 'Proszę przesłać dodatkową dokumentację poniżej, aby pomóc nam zweryfikować Twoją tożsamość jako dyrektora lub starszego urzędnika jednostki gospodarczej.',
    },
    agreementsStep: {
        agreements: 'Umowy',
        pleaseConfirm: 'Proszę potwierdzić poniższe umowy',
        regulationRequiresUs: 'Przepisy wymagają od nas weryfikacji tożsamości każdej osoby, która posiada więcej niż 25% udziałów w firmie.',
        iAmAuthorized: 'Jestem upoważniony do korzystania z firmowego konta bankowego na wydatki biznesowe.',
        iCertify: 'Oświadczam, że podane informacje są prawdziwe i dokładne.',
        termsAndConditions: 'warunki i zasady',
        accept: 'Zaakceptuj i dodaj konto bankowe',
        iConsentToThe: 'Wyrażam zgodę na',
        privacyNotice: 'informacja o prywatności',
        error: {
            authorized: 'Musisz być kontrolującym urzędnikiem z upoważnieniem do obsługi konta bankowego firmy',
            certify: 'Proszę potwierdzić, że informacje są prawdziwe i dokładne.',
            consent: 'Proszę wyrazić zgodę na politykę prywatności',
        },
    },
    finishStep: {
        connect: 'Połącz konto bankowe',
        letsFinish: 'Zakończmy na czacie!',
        thanksFor: 'Dziękujemy za te szczegóły. Dedykowany agent wsparcia teraz przejrzy Twoje informacje. Skontaktujemy się ponownie, jeśli będziemy potrzebować od Ciebie czegoś więcej, ale w międzyczasie, nie wahaj się z nami skontaktować, jeśli masz jakiekolwiek pytania.',
        iHaveA: 'Mam pytanie',
        enable2FA: 'Włącz uwierzytelnianie dwuskładnikowe (2FA), aby zapobiec oszustwom',
        weTake: 'Poważnie podchodzimy do Twojego bezpieczeństwa. Proszę skonfigurować 2FA, aby dodać dodatkową warstwę ochrony do swojego konta.',
        secure: 'Zabezpiecz swoje konto',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Chwileczkę',
        explanationLine: 'Przyglądamy się Twoim informacjom. Wkrótce będziesz mógł kontynuować kolejne kroki.',
    },
    session: {
        offlineMessageRetry: 'Wygląda na to, że jesteś offline. Sprawdź swoje połączenie i spróbuj ponownie.',
    },
    travel: {
        header: 'Zarezerwuj podróż',
        title: 'Podróżuj mądrze',
        subtitle: 'Użyj Expensify Travel, aby uzyskać najlepsze oferty podróży i zarządzać wszystkimi wydatkami firmowymi w jednym miejscu.',
        features: {
            saveMoney: 'Oszczędzaj pieniądze na swoich rezerwacjach',
            alerts: 'Otrzymuj aktualizacje i alerty w czasie rzeczywistym',
        },
        bookTravel: 'Zarezerwuj podróż',
        bookDemo: 'Zarezerwuj demo',
        bookADemo: 'Zarezerwuj demo',
        toLearnMore: 'aby dowiedzieć się więcej.',
        termsAndConditions: {
            header: 'Zanim przejdziemy dalej...',
            title: 'Warunki i zasady',
            subtitle: 'Proszę zaakceptować Expensify Travel',
            termsAndConditions: 'warunki i zasady',
            travelTermsAndConditions: 'warunki i zasady',
            agree: 'Zgadzam się na',
            error: 'Musisz zaakceptować warunki i zasady Expensify Travel, aby kontynuować.',
            defaultWorkspaceError: 'Musisz ustawić domyślne miejsce pracy, aby włączyć Expensify Travel. Przejdź do Ustawienia > Miejsca pracy > kliknij trzy pionowe kropki obok miejsca pracy > Ustaw jako domyślne miejsce pracy, a następnie spróbuj ponownie!',
        },
        flight: 'Lot',
        flightDetails: {
            passenger: 'Pasażer',
            layover: function (_a) {
                var layover = _a.layover;
                return "<muted-text-label>Masz <strong>".concat(layover, " przesiadk\u0119</strong> przed tym lotem</muted-text-label>");
            },
            takeOff: 'Start',
            landing: 'Lądowanie',
            seat: 'Miejsce',
            class: 'Klasa kabiny',
            recordLocator: 'Lokalizator rezerwacji',
            cabinClasses: {
                unknown: 'Unknown',
                economy: 'Ekonomia',
                premiumEconomy: 'Premium Economy',
                business: 'Biznes',
                first: 'Pierwszy',
            },
        },
        hotel: 'Hotel',
        hotelDetails: {
            guest: 'Gość',
            checkIn: 'Zameldowanie',
            checkOut: 'Wymeldowanie',
            roomType: 'Typ pokoju',
            cancellation: 'Polityka anulowania',
            cancellationUntil: 'Bezpłatne anulowanie do',
            confirmation: 'Numer potwierdzenia',
            cancellationPolicies: {
                unknown: 'Unknown',
                nonRefundable: 'Bezzwrotny',
                freeCancellationUntil: 'Bezpłatne anulowanie do',
                partiallyRefundable: 'Częściowo zwracalne',
            },
        },
        car: 'Samochód',
        carDetails: {
            rentalCar: 'Wynajem samochodu',
            pickUp: 'Odbiór',
            dropOff: 'Zrzut',
            driver: 'Kierowca',
            carType: 'Typ samochodu',
            cancellation: 'Polityka anulowania',
            cancellationUntil: 'Bezpłatne anulowanie do',
            freeCancellation: 'Bezpłatne anulowanie',
            confirmation: 'Numer potwierdzenia',
        },
        train: 'Szyna',
        trainDetails: {
            passenger: 'Pasażer',
            departs: 'Odjeżdża',
            arrives: 'Przybywa',
            coachNumber: 'Numer trenera',
            seat: 'Miejsce',
            fareDetails: 'Szczegóły opłat',
            confirmation: 'Numer potwierdzenia',
        },
        viewTrip: 'Zobacz podróż',
        modifyTrip: 'Modyfikuj podróż',
        tripSupport: 'Wsparcie podróży',
        tripDetails: 'Szczegóły podróży',
        viewTripDetails: 'Wyświetl szczegóły podróży',
        trip: 'Podróż',
        trips: 'Podróże',
        tripSummary: 'Podsumowanie podróży',
        departs: 'Odjeżdża',
        errorMessage: 'Coś poszło nie tak. Spróbuj ponownie później.',
        phoneError: {
            phrase1: 'Proszę',
            link: 'dodaj służbowy adres e-mail jako swoje główne logowanie',
            phrase2: 'zarezerwować podróż.',
        },
        domainSelector: {
            title: 'Domena',
            subtitle: 'Wybierz domenę dla konfiguracji Expensify Travel.',
            recommended: 'Zalecane',
        },
        domainPermissionInfo: {
            title: 'Domena',
            restrictionPrefix: "Nie masz uprawnie\u0144 do w\u0142\u0105czenia Expensify Travel dla tej domeny.",
            restrictionSuffix: "B\u0119dziesz musia\u0142 poprosi\u0107 kogo\u015B z tej domeny o w\u0142\u0105czenie podr\u00F3\u017Cy.",
            accountantInvitationPrefix: "Je\u015Bli jeste\u015B ksi\u0119gowym, rozwa\u017C do\u0142\u0105czenie do",
            accountantInvitationLink: "Program dla ksi\u0119gowych ExpensifyApproved!",
            accountantInvitationSuffix: "aby w\u0142\u0105czy\u0107 podr\u00F3\u017Ce dla tej domeny.",
        },
        publicDomainError: {
            title: 'Rozpocznij korzystanie z Expensify Travel',
            message: "B\u0119dziesz musia\u0142 u\u017Cy\u0107 swojego s\u0142u\u017Cbowego adresu e-mail (np. name@company.com) z Expensify Travel, a nie swojego osobistego adresu e-mail (np. name@gmail.com).",
        },
        blockedFeatureModal: {
            title: 'Expensify Travel został wyłączony',
            message: "Tw\u00F3j administrator wy\u0142\u0105czy\u0142 Expensify Travel. Prosz\u0119 przestrzega\u0107 firmowej polityki rezerwacji w celu organizacji podr\u00F3\u017Cy.",
        },
        verifyCompany: {
            title: 'Rozpocznij podróż już dziś!',
            message: "Prosz\u0119 skontaktowa\u0107 si\u0119 z mened\u017Cerem konta lub salesteam@expensify.com, aby uzyska\u0107 demonstracj\u0119 podr\u00F3\u017Cy i w\u0142\u0105czy\u0107 j\u0105 dla swojej firmy.",
        },
        updates: {
            bookingTicketed: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate, _b = _a.confirmationID, confirmationID = _b === void 0 ? '' : _b;
                return "Tw\u00F3j lot ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") w dniu ").concat(startDate, " zosta\u0142 zarezerwowany. Kod potwierdzenia: ").concat(confirmationID);
            },
            ticketVoided: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Tw\u00F3j bilet na lot ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") w dniu ").concat(startDate, " zosta\u0142 uniewa\u017Cniony.");
            },
            ticketRefunded: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Tw\u00F3j bilet na lot ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") w dniu ").concat(startDate, " zosta\u0142 zwr\u00F3cony lub wymieniony.");
            },
            flightCancelled: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Tw\u00F3j lot ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") w dniu ").concat(startDate, " zosta\u0142 odwo\u0142any przez lini\u0119 lotnicz\u0105.");
            },
            flightScheduleChangePending: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Linia lotnicza zaproponowa\u0142a zmian\u0119 harmonogramu dla lotu ".concat(airlineCode, "; czekamy na potwierdzenie.");
            },
            flightScheduleChangeClosed: function (_a) {
                var airlineCode = _a.airlineCode, startDate = _a.startDate;
                return "Zmiana harmonogramu potwierdzona: lot ".concat(airlineCode, " teraz odlatuje o ").concat(startDate, ".");
            },
            flightUpdated: function (_a) {
                var airlineCode = _a.airlineCode, origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Tw\u00F3j lot ".concat(airlineCode, " (").concat(origin, " \u2192 ").concat(destination, ") w dniu ").concat(startDate, " zosta\u0142 zaktualizowany.");
            },
            flightCabinChanged: function (_a) {
                var airlineCode = _a.airlineCode, cabinClass = _a.cabinClass;
                return "Twoja klasa kabiny zosta\u0142a zaktualizowana do ".concat(cabinClass, " na locie ").concat(airlineCode, ".");
            },
            flightSeatConfirmed: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Twoje miejsce na pok\u0142adzie lotu ".concat(airlineCode, " zosta\u0142o potwierdzone.");
            },
            flightSeatChanged: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Twoje przypisanie miejsca na locie ".concat(airlineCode, " zosta\u0142o zmienione.");
            },
            flightSeatCancelled: function (_a) {
                var airlineCode = _a.airlineCode;
                return "Twoje miejsce na pok\u0142adzie lotu ".concat(airlineCode, " zosta\u0142o usuni\u0119te.");
            },
            paymentDeclined: 'Płatność za rezerwację lotu nie powiodła się. Proszę spróbować ponownie.',
            bookingCancelledByTraveler: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "Anulowa\u0142e\u015B swoj\u0105 rezerwacj\u0119 ".concat(type, " ").concat(id, ".");
            },
            bookingCancelledByVendor: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "Sprzedawca anulowa\u0142 Twoj\u0105 rezerwacj\u0119 ".concat(type, " ").concat(id, ".");
            },
            bookingRebooked: function (_a) {
                var type = _a.type, _b = _a.id, id = _b === void 0 ? '' : _b;
                return "Twoja rezerwacja ".concat(type, " zosta\u0142a ponownie zarezerwowana. Nowy numer potwierdzenia: ").concat(id, ".");
            },
            bookingUpdated: function (_a) {
                var type = _a.type;
                return "Twoja rezerwacja ".concat(type, " zosta\u0142a zaktualizowana. Sprawd\u017A nowe szczeg\u00F3\u0142y w itinerarzu.");
            },
            railTicketRefund: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Tw\u00F3j bilet kolejowy na trasie ".concat(origin, " \u2192 ").concat(destination, " z dnia ").concat(startDate, " zosta\u0142 zwr\u00F3cony. Zostanie przetworzony zwrot \u015Brodk\u00F3w.");
            },
            railTicketExchange: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Tw\u00F3j bilet kolejowy na trasie ".concat(origin, " \u2192 ").concat(destination, " na ").concat(startDate, " zosta\u0142 wymieniony.");
            },
            railTicketUpdate: function (_a) {
                var origin = _a.origin, destination = _a.destination, startDate = _a.startDate;
                return "Tw\u00F3j bilet kolejowy na trasie ".concat(origin, " \u2192 ").concat(destination, " na dzie\u0144 ").concat(startDate, " zosta\u0142 zaktualizowany.");
            },
            defaultUpdate: function (_a) {
                var type = _a.type;
                return "Twoja rezerwacja ".concat(type, " zosta\u0142a zaktualizowana.");
            },
        },
    },
    workspace: {
        common: {
            card: 'Karty',
            expensifyCard: 'Expensify Card',
            companyCards: 'Karty firmowe',
            workflows: 'Przepływy pracy',
            workspace: 'Workspace',
            findWorkspace: 'Znajdź przestrzeń roboczą',
            edit: 'Edytuj przestrzeń roboczą',
            enabled: 'Włączone',
            disabled: 'Wyłączony',
            everyone: 'Wszyscy',
            delete: 'Usuń przestrzeń roboczą',
            settings: 'Ustawienia',
            reimburse: 'Zwroty kosztów',
            categories: 'Kategorie',
            tags: 'Tagi',
            customField1: 'Pole niestandardowe 1',
            customField2: 'Pole niestandardowe 2',
            customFieldHint: 'Dodaj niestandardowe kodowanie, które dotyczy wszystkich wydatków tego członka.',
            reportFields: 'Pola raportu',
            reportTitle: 'Tytuł raportu',
            reportField: 'Pole raportu',
            taxes: 'Podatki',
            bills: 'Rachunki',
            invoices: 'Faktury',
            travel: 'Podróżować',
            members: 'Członkowie',
            accounting: 'Księgowość',
            rules: 'Zasady',
            displayedAs: 'Wyświetlane jako',
            plan: 'Plan',
            profile: 'Przegląd',
            bankAccount: 'Konto bankowe',
            connectBankAccount: 'Połącz konto bankowe',
            testTransactions: 'Przetestuj transakcje',
            issueAndManageCards: 'Wydawaj i zarządzaj kartami',
            reconcileCards: 'Uzgodnij karty',
            selected: function () { return ({
                one: '1 wybrano',
                other: function (count) { return "".concat(count, " wybrano"); },
            }); },
            settlementFrequency: 'Częstotliwość rozliczeń',
            setAsDefault: 'Ustaw jako domyślne miejsce pracy',
            defaultNote: "Paragony wys\u0142ane na ".concat(CONST_1.default.EMAIL.RECEIPTS, " pojawi\u0105 si\u0119 w tym obszarze roboczym."),
            deleteConfirmation: 'Czy na pewno chcesz usunąć tę przestrzeń roboczą?',
            deleteWithCardsConfirmation: 'Czy na pewno chcesz usunąć tę przestrzeń roboczą? Spowoduje to usunięcie wszystkich kanałów kart i przypisanych kart.',
            unavailable: 'Niedostępna przestrzeń robocza',
            memberNotFound: 'Nie znaleziono członka. Aby zaprosić nowego członka do przestrzeni roboczej, użyj przycisku zaproszenia powyżej.',
            notAuthorized: "Nie masz dost\u0119pu do tej strony. Je\u015Bli pr\u00F3bujesz do\u0142\u0105czy\u0107 do tego miejsca pracy, popro\u015B w\u0142a\u015Bciciela miejsca pracy o dodanie Ci\u0119 jako cz\u0142onka. Co\u015B innego? Skontaktuj si\u0119 z ".concat(CONST_1.default.EMAIL.CONCIERGE, "."),
            goToWorkspace: 'Przejdź do przestrzeni roboczej',
            goToWorkspaces: 'Przejdź do przestrzeni roboczych',
            clearFilter: 'Wyczyść filtr',
            workspaceName: 'Nazwa przestrzeni roboczej',
            workspaceOwner: 'Właściciel',
            workspaceType: 'Typ przestrzeni roboczej',
            workspaceAvatar: 'Awatar przestrzeni roboczej',
            mustBeOnlineToViewMembers: 'Musisz być online, aby zobaczyć członków tego miejsca pracy.',
            moreFeatures: 'Więcej funkcji',
            requested: 'Żądane',
            distanceRates: 'Stawki za odległość',
            defaultDescription: 'Jedno miejsce na wszystkie Twoje paragony i wydatki.',
            descriptionHint: 'Udostępnij informacje o tej przestrzeni roboczej wszystkim członkom.',
            welcomeNote: 'Proszę użyć Expensify do przesyłania paragonów do zwrotu kosztów, dziękuję!',
            subscription: 'Subskrypcja',
            markAsEntered: 'Oznacz jako wprowadzone ręcznie',
            markAsExported: 'Oznacz jako wyeksportowane ręcznie',
            exportIntegrationSelected: function (_a) {
                var connectionName = _a.connectionName;
                return "Eksportuj do ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
            },
            letsDoubleCheck: 'Sprawdźmy podwójnie, czy wszystko wygląda dobrze.',
            lineItemLevel: 'Poziom pozycji linii',
            reportLevel: 'Poziom raportu',
            topLevel: 'Najwyższy poziom',
            appliedOnExport: 'Nie zaimportowane do Expensify, zastosowane przy eksporcie',
            shareNote: {
                header: 'Udostępnij swoje miejsce pracy innym członkom',
                content: {
                    firstPart: 'Udostępnij ten kod QR lub skopiuj poniższy link, aby ułatwić członkom żądanie dostępu do Twojego miejsca pracy. Wszystkie prośby o dołączenie do miejsca pracy pojawią się w',
                    secondPart: 'pokój do Twojej recenzji.',
                },
            },
            connectTo: function (_a) {
                var connectionName = _a.connectionName;
                return "Po\u0142\u0105cz z ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
            },
            createNewConnection: 'Utwórz nowe połączenie',
            reuseExistingConnection: 'Ponownie użyj istniejące połączenie',
            existingConnections: 'Istniejące połączenia',
            existingConnectionsDescription: function (_a) {
                var connectionName = _a.connectionName;
                return "Poniewa\u017C wcze\u015Bniej po\u0142\u0105czy\u0142e\u015B si\u0119 z ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], ", mo\u017Cesz wybra\u0107 ponowne u\u017Cycie istniej\u0105cego po\u0142\u0105czenia lub utworzy\u0107 nowe.");
            },
            lastSyncDate: function (_a) {
                var connectionName = _a.connectionName, formattedDate = _a.formattedDate;
                return "".concat(connectionName, " - Ostatnia synchronizacja ").concat(formattedDate);
            },
            authenticationError: function (_a) {
                var connectionName = _a.connectionName;
                return "Nie mo\u017Cna po\u0142\u0105czy\u0107 si\u0119 z ".concat(connectionName, " z powodu b\u0142\u0119du uwierzytelniania.");
            },
            learnMore: 'Dowiedz się więcej.',
            memberAlternateText: 'Członkowie mogą składać i zatwierdzać raporty.',
            adminAlternateText: 'Administratorzy mają pełny dostęp do edycji wszystkich raportów i ustawień przestrzeni roboczej.',
            auditorAlternateText: 'Audytorzy mogą przeglądać i komentować raporty.',
            roleName: function (_a) {
                var _b = _a === void 0 ? {} : _a, role = _b.role;
                switch (role) {
                    case CONST_1.default.POLICY.ROLE.ADMIN:
                        return 'Admin';
                    case CONST_1.default.POLICY.ROLE.AUDITOR:
                        return 'Audytor';
                    case CONST_1.default.POLICY.ROLE.USER:
                        return 'Członek';
                    default:
                        return 'Członek';
                }
            },
            frequency: {
                manual: 'Ręcznie',
                instant: 'Natychmiastowy',
                immediate: 'Codziennie',
                trip: 'Według podróży',
                weekly: 'Cotygodniowo',
                semimonthly: 'Dwa razy w miesiącu',
                monthly: 'Miesięczny',
            },
            planType: 'Typ planu',
            submitExpense: 'Prześlij swoje wydatki poniżej:',
            defaultCategory: 'Domyślna kategoria',
            viewTransactions: 'Wyświetl transakcje',
            policyExpenseChatName: function (_a) {
                var displayName = _a.displayName;
                return "Wydatki ".concat(displayName);
            },
        },
        perDiem: {
            subtitle: 'Ustaw stawki diety, aby kontrolować dzienne wydatki pracowników.',
            amount: 'Kwota',
            deleteRates: function () { return ({
                one: 'Usuń stawkę',
                other: 'Usuń stawki',
            }); },
            deletePerDiemRate: 'Usuń stawkę diety',
            findPerDiemRate: 'Znajdź stawkę diety',
            areYouSureDelete: function () { return ({
                one: 'Czy na pewno chcesz usunąć tę stawkę?',
                other: 'Czy na pewno chcesz usunąć te stawki?',
            }); },
            emptyList: {
                title: 'Dieta',
                subtitle: 'Ustaw stawki dzienne, aby kontrolować codzienne wydatki pracowników. Importuj stawki z arkusza kalkulacyjnego, aby rozpocząć.',
            },
            errors: {
                existingRateError: function (_a) {
                    var rate = _a.rate;
                    return "Stawka o warto\u015Bci ".concat(rate, " ju\u017C istnieje");
                },
            },
            importPerDiemRates: 'Importuj stawki diety',
            editPerDiemRate: 'Edytuj stawkę diety',
            editPerDiemRates: 'Edytuj stawki diet',
            editDestinationSubtitle: function (_a) {
                var destination = _a.destination;
                return "Aktualizacja tego miejsca docelowego zmieni je dla wszystkich substawek diety ".concat(destination, ".");
            },
            editCurrencySubtitle: function (_a) {
                var destination = _a.destination;
                return "Aktualizacja tej waluty zmieni j\u0105 dla wszystkich substawek diet ".concat(destination, ".");
            },
        },
        qbd: {
            exportOutOfPocketExpensesDescription: 'Ustaw sposób eksportowania wydatków z własnej kieszeni do QuickBooks Desktop.',
            exportOutOfPocketExpensesCheckToggle: 'Oznacz czeki jako „wydrukuj później”',
            exportDescription: 'Skonfiguruj, jak dane z Expensify są eksportowane do QuickBooks Desktop.',
            date: 'Data eksportu',
            exportInvoices: 'Eksportuj faktury do',
            exportExpensifyCard: 'Eksportuj transakcje z karty Expensify jako',
            account: 'Konto',
            accountDescription: 'Wybierz, gdzie opublikować wpisy w dzienniku.',
            accountsPayable: 'Zobowiązania płatnicze',
            accountsPayableDescription: 'Wybierz, gdzie utworzyć rachunki dostawców.',
            bankAccount: 'Konto bankowe',
            notConfigured: 'Nieskonfigurowane',
            bankAccountDescription: 'Wybierz, skąd wysyłać czeki.',
            creditCardAccount: 'Konto karty kredytowej',
            exportDate: {
                label: 'Data eksportu',
                description: 'Użyj tej daty podczas eksportowania raportów do QuickBooks Desktop.',
                values: (_e = {},
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Data ostatniego wydatku',
                        description: 'Data najnowszego wydatku w raporcie.',
                    },
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: 'Data eksportu',
                        description: 'Data, kiedy raport został wyeksportowany do QuickBooks Desktop.',
                    },
                    _e[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: 'Data złożenia',
                        description: 'Data, kiedy raport został przesłany do zatwierdzenia.',
                    },
                    _e),
            },
            exportCheckDescription: 'Utworzymy szczegółowy czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
            exportJournalEntryDescription: 'Utworzymy szczegółowy wpis do dziennika dla każdego raportu Expensify i opublikujemy go na poniższym koncie.',
            exportVendorBillDescription: 'Utworzymy wyszczególnioną fakturę od dostawcy dla każdego raportu Expensify i dodamy ją do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy na 1. dzień następnego otwartego okresu.',
            deepDiveExpensifyCard: 'Transakcje z karty Expensify będą automatycznie eksportowane do "Konta Zobowiązań Karty Expensify" utworzonego z',
            deepDiveExpensifyCardIntegration: 'nasza integracja.',
            outOfPocketTaxEnabledDescription: 'QuickBooks Desktop nie obsługuje podatków przy eksportach zapisów księgowych. Ponieważ masz włączone podatki w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledError: 'Dzienniki księgowe są niedostępne, gdy podatki są włączone. Proszę wybrać inną opcję eksportu.',
            accounts: (_f = {},
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD] = 'Karta kredytowa',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Faktura od dostawcy',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Wpis do dziennika',
                _f[CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Sprawdź',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK, "Description")] = 'Utworzymy szczegółowy czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "Description")] = 'Automatycznie dopasujemy nazwę sprzedawcy na transakcji kartą kredytową do odpowiadających jej dostawców w QuickBooks. Jeśli nie istnieją żadni dostawcy, utworzymy dostawcę "Credit Card Misc." do powiązania.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Description")] = 'Utworzymy wyszczególnioną fakturę od dostawcy dla każdego raportu Expensify z datą ostatniego wydatku i dodamy ją do poniższego konta. Jeśli ten okres jest zamknięty, zaksięgujemy na 1. dzień następnego otwartego okresu.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "AccountDescription")] = 'Wybierz miejsce eksportu transakcji kartą kredytową.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "AccountDescription")] = 'Wybierz dostawcę, aby zastosować do wszystkich transakcji kartą kredytową.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "AccountDescription")] = 'Wybierz, skąd wysyłać czeki.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Error")] = 'Rachunki dostawców są niedostępne, gdy lokalizacje są włączone. Proszę wybrać inną opcję eksportu.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "Error")] = 'Czeki są niedostępne, gdy lokalizacje są włączone. Proszę wybrać inną opcję eksportu.',
                _f["".concat(CONST_1.default.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY, "Error")] = 'Dzienniki księgowe są niedostępne, gdy podatki są włączone. Proszę wybrać inną opcję eksportu.',
                _f),
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w QuickBooks Desktop i ponownie zsynchronizuj połączenie.',
            qbdSetup: 'Konfiguracja QuickBooks Desktop',
            requiredSetupDevice: {
                title: 'Nie można połączyć się z tego urządzenia',
                body1: 'Będziesz musiał skonfigurować to połączenie z komputera, który hostuje plik firmy QuickBooks Desktop.',
                body2: 'Po połączeniu będziesz mógł synchronizować i eksportować z dowolnego miejsca.',
            },
            setupPage: {
                title: 'Otwórz ten link, aby się połączyć',
                body: 'Aby zakończyć konfigurację, otwórz poniższy link na komputerze, na którym działa QuickBooks Desktop.',
                setupErrorTitle: 'Coś poszło nie tak',
                setupErrorBody1: 'Połączenie z QuickBooks Desktop nie działa w tej chwili. Proszę spróbować ponownie później lub',
                setupErrorBody2: 'jeśli problem będzie się powtarzał.',
                setupErrorBodyContactConcierge: 'skontaktuj się z Concierge',
            },
            importDescription: 'Wybierz, które konfiguracje kodowania zaimportować z QuickBooks Desktop do Expensify.',
            classes: 'Klasy',
            items: 'Przedmioty',
            customers: 'Klienci/projekty',
            exportCompanyCardsDescription: 'Ustaw, jak zakupy kartą firmową eksportują się do QuickBooks Desktop.',
            defaultVendorDescription: 'Ustaw domyślnego dostawcę, który będzie stosowany do wszystkich transakcji kartą kredytową podczas eksportu.',
            accountsDescription: 'Twój plan kont QuickBooks Desktop zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne dla członków do wyboru podczas tworzenia ich wydatków.',
            classesDescription: 'Wybierz, jak obsługiwać klasy QuickBooks Desktop w Expensify.',
            tagsDisplayedAsDescription: 'Poziom pozycji linii',
            reportFieldsDisplayedAsDescription: 'Poziom raportu',
            customersDescription: 'Wybierz, jak obsługiwać klientów/projekty QuickBooks Desktop w Expensify.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z QuickBooks Desktop każdego dnia.',
                createEntities: 'Automatyczne tworzenie jednostek',
                createEntitiesDescription: 'Expensify automatycznie utworzy dostawców w QuickBooks Desktop, jeśli jeszcze nie istnieją.',
            },
            itemsDescription: 'Wybierz, jak obsługiwać elementy QuickBooks Desktop w Expensify.',
        },
        qbo: {
            connectedTo: 'Połączono z',
            importDescription: 'Wybierz, które konfiguracje kodowania zaimportować z QuickBooks Online do Expensify.',
            classes: 'Klasy',
            locations: 'Lokalizacje',
            customers: 'Klienci/projekty',
            accountsDescription: 'Twój plan kont QuickBooks Online zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne dla członków do wyboru podczas tworzenia ich wydatków.',
            classesDescription: 'Wybierz, jak obsługiwać klasy QuickBooks Online w Expensify.',
            customersDescription: 'Wybierz, jak obsługiwać klientów/projekty QuickBooks Online w Expensify.',
            locationsDescription: 'Wybierz, jak obsługiwać lokalizacje QuickBooks Online w Expensify.',
            taxesDescription: 'Wybierz, jak obsługiwać podatki QuickBooks Online w Expensify.',
            locationsLineItemsRestrictionDescription: 'QuickBooks Online nie obsługuje lokalizacji na poziomie linii dla czeków lub faktur od dostawców. Jeśli chcesz mieć lokalizacje na poziomie linii, upewnij się, że używasz zapisów księgowych i wydatków na kartach kredytowych/debetowych.',
            taxesJournalEntrySwitchNote: 'QuickBooks Online nie obsługuje podatków w zapisach księgowych. Proszę zmienić opcję eksportu na fakturę od dostawcy lub czek.',
            exportDescription: 'Skonfiguruj, jak dane Expensify są eksportowane do QuickBooks Online.',
            date: 'Data eksportu',
            exportInvoices: 'Eksportuj faktury do',
            exportExpensifyCard: 'Eksportuj transakcje z karty Expensify jako',
            deepDiveExpensifyCard: 'Transakcje z karty Expensify będą automatycznie eksportowane do "Konta Zobowiązań Karty Expensify" utworzonego z',
            deepDiveExpensifyCardIntegration: 'nasza integracja.',
            exportDate: {
                label: 'Data eksportu',
                description: 'Użyj tej daty podczas eksportowania raportów do QuickBooks Online.',
                values: (_g = {},
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Data ostatniego wydatku',
                        description: 'Data najnowszego wydatku w raporcie.',
                    },
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: 'Data eksportu',
                        description: 'Data eksportu raportu do QuickBooks Online.',
                    },
                    _g[CONST_1.default.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: 'Data złożenia',
                        description: 'Data, kiedy raport został przesłany do zatwierdzenia.',
                    },
                    _g),
            },
            receivable: 'Należności', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Archiwum należności', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'Użyj tego konta podczas eksportowania faktur do QuickBooks Online.',
            exportCompanyCardsDescription: 'Ustaw sposób eksportowania zakupów kartą firmową do QuickBooks Online.',
            vendor: 'Dostawca',
            defaultVendorDescription: 'Ustaw domyślnego dostawcę, który będzie stosowany do wszystkich transakcji kartą kredytową podczas eksportu.',
            exportOutOfPocketExpensesDescription: 'Ustaw sposób eksportowania wydatków z własnej kieszeni do QuickBooks Online.',
            exportCheckDescription: 'Utworzymy szczegółowy czek dla każdego raportu Expensify i wyślemy go z poniższego konta bankowego.',
            exportJournalEntryDescription: 'Utworzymy szczegółowy wpis do dziennika dla każdego raportu Expensify i opublikujemy go na poniższym koncie.',
            exportVendorBillDescription: 'Utworzymy wyszczególnioną fakturę od dostawcy dla każdego raportu Expensify i dodamy ją do konta poniżej. Jeśli ten okres jest zamknięty, zaksięgujemy na 1. dzień następnego otwartego okresu.',
            account: 'Konto',
            accountDescription: 'Wybierz, gdzie opublikować wpisy w dzienniku.',
            accountsPayable: 'Zobowiązania płatnicze',
            accountsPayableDescription: 'Wybierz, gdzie utworzyć rachunki dostawców.',
            bankAccount: 'Konto bankowe',
            notConfigured: 'Nieskonfigurowane',
            bankAccountDescription: 'Wybierz, skąd wysyłać czeki.',
            creditCardAccount: 'Konto karty kredytowej',
            companyCardsLocationEnabledDescription: 'QuickBooks Online nie obsługuje lokalizacji w eksportach faktur od dostawców. Ponieważ masz włączone lokalizacje w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledDescription: 'QuickBooks Online nie obsługuje podatków przy eksportach zapisów księgowych. Ponieważ masz włączone podatki w swoim obszarze roboczym, ta opcja eksportu jest niedostępna.',
            outOfPocketTaxEnabledError: 'Dzienniki księgowe są niedostępne, gdy podatki są włączone. Proszę wybrać inną opcję eksportu.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z QuickBooks Online każdego dnia.',
                inviteEmployees: 'Zaproś pracowników',
                inviteEmployeesDescription: 'Importuj rekordy pracowników z QuickBooks Online i zaproś pracowników do tego miejsca pracy.',
                createEntities: 'Automatyczne tworzenie jednostek',
                createEntitiesDescription: 'Expensify automatycznie utworzy dostawców w QuickBooks Online, jeśli jeszcze nie istnieją, oraz automatycznie utworzy klientów podczas eksportowania faktur.',
                reimbursedReportsDescription: 'Za każdym razem, gdy raport jest opłacany za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie QuickBooks Online.',
                qboBillPaymentAccount: 'Konto do płatności rachunków QuickBooks',
                qboInvoiceCollectionAccount: 'Konto do zbierania faktur QuickBooks',
                accountSelectDescription: 'Wybierz, skąd chcesz opłacić rachunki, a my utworzymy płatność w QuickBooks Online.',
                invoiceAccountSelectorDescription: 'Wybierz, gdzie chcesz otrzymywać płatności za faktury, a my utworzymy płatność w QuickBooks Online.',
            },
            accounts: (_h = {},
                _h[CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD] = 'Karta debetowa',
                _h[CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD] = 'Karta kredytowa',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Faktura od dostawcy',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Wpis do dziennika',
                _h[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Sprawdź',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD, "Description")] = "Automatycznie dopasujemy nazwę sprzedawcy na transakcji kartą debetową do odpowiadających jej dostawców w QuickBooks. Jeśli nie istnieją żadni dostawcy, utworzymy dostawcę 'Debit Card Misc.' do powiązania.",
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "Description")] = 'Automatycznie dopasujemy nazwę sprzedawcy na transakcji kartą kredytową do odpowiadających jej dostawców w QuickBooks. Jeśli nie istnieją żadni dostawcy, utworzymy dostawcę "Credit Card Misc." do powiązania.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Description")] = 'Utworzymy wyszczególnioną fakturę od dostawcy dla każdego raportu Expensify z datą ostatniego wydatku i dodamy ją do poniższego konta. Jeśli ten okres jest zamknięty, zaksięgujemy na 1. dzień następnego otwartego okresu.',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD, "AccountDescription")] = 'Wybierz miejsce eksportu transakcji z karty debetowej.',
                _h["".concat(CONST_1.default.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD, "AccountDescription")] = 'Wybierz miejsce eksportu transakcji kartą kredytową.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "AccountDescription")] = 'Wybierz dostawcę, aby zastosować do wszystkich transakcji kartą kredytową.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL, "Error")] = 'Rachunki dostawców są niedostępne, gdy lokalizacje są włączone. Proszę wybrać inną opcję eksportu.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK, "Error")] = 'Czeki są niedostępne, gdy lokalizacje są włączone. Proszę wybrać inną opcję eksportu.',
                _h["".concat(CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY, "Error")] = 'Dzienniki księgowe są niedostępne, gdy podatki są włączone. Proszę wybrać inną opcję eksportu.',
                _h),
            exportDestinationAccountsMisconfigurationError: (_j = {},
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Wybierz prawidłowe konto do eksportu faktury dostawcy',
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Wybierz prawidłowe konto do eksportu zapisów księgowych',
                _j[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Wybierz prawidłowe konto do eksportu czeków',
                _j),
            exportDestinationSetupAccountsInfo: (_k = {},
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL] = 'Aby użyć eksportu faktur od dostawców, skonfiguruj konto zobowiązań w QuickBooks Online',
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY] = 'Aby używać eksportu zapisów księgowych, skonfiguruj konto księgowe w QuickBooks Online.',
                _k[CONST_1.default.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK] = 'Aby użyć eksportu czeków, skonfiguruj konto bankowe w QuickBooks Online.',
                _k),
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Dodaj konto w QuickBooks Online i ponownie zsynchronizuj połączenie.',
            accountingMethods: {
                label: 'Kiedy eksportować',
                description: 'Wybierz, kiedy eksportować wydatki:',
                values: (_l = {},
                    _l[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Rozliczenia międzyokresowe',
                    _l[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Gotówka',
                    _l),
                alternateText: (_m = {},
                    _m[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Wydatki z własnej kieszeni zostaną wyeksportowane po ostatecznym zatwierdzeniu.',
                    _m[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Wydatki z własnej kieszeni zostaną wyeksportowane po opłaceniu',
                    _m),
            },
        },
        workspaceList: {
            joinNow: 'Dołącz teraz',
            askToJoin: 'Poproś o dołączenie',
        },
        xero: {
            organization: 'Organizacja Xero',
            organizationDescription: 'Wybierz organizację Xero, z której chcesz zaimportować dane.',
            importDescription: 'Wybierz, które konfiguracje kodowania zaimportować z Xero do Expensify.',
            accountsDescription: 'Twój plan kont Xero zostanie zaimportowany do Expensify jako kategorie.',
            accountsSwitchTitle: 'Wybierz, czy importować nowe konta jako włączone czy wyłączone kategorie.',
            accountsSwitchDescription: 'Włączone kategorie będą dostępne dla członków do wyboru podczas tworzenia ich wydatków.',
            trackingCategories: 'Kategorie śledzenia',
            trackingCategoriesDescription: 'Wybierz, jak obsługiwać kategorie śledzenia Xero w Expensify.',
            mapTrackingCategoryTo: function (_a) {
                var categoryName = _a.categoryName;
                return "Mapuj Xero ".concat(categoryName, " do");
            },
            mapTrackingCategoryToDescription: function (_a) {
                var categoryName = _a.categoryName;
                return "Wybierz, gdzie zmapowa\u0107 ".concat(categoryName, " podczas eksportu do Xero.");
            },
            customers: 'Obciąż ponownie klientów',
            customersDescription: 'Wybierz, czy ponownie obciążyć klientów w Expensify. Twoje kontakty klientów Xero mogą być oznaczane na wydatkach i zostaną wyeksportowane do Xero jako faktura sprzedaży.',
            taxesDescription: 'Wybierz, jak obsługiwać podatki Xero w Expensify.',
            notImported: 'Nie zaimportowano',
            notConfigured: 'Nieskonfigurowane',
            trackingCategoriesOptions: (_o = {},
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT] = 'Domyślny kontakt Xero',
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG] = 'Tagi',
                _o[CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD] = 'Pola raportu',
                _o),
            exportDescription: 'Skonfiguruj, jak dane z Expensify są eksportowane do Xero.',
            purchaseBill: 'Zakup faktury',
            exportDeepDiveCompanyCard: 'Wyeksportowane wydatki zostaną zaksięgowane jako transakcje bankowe na poniższym koncie bankowym Xero, a daty transakcji będą zgodne z datami na wyciągu bankowym.',
            bankTransactions: 'Transakcje bankowe',
            xeroBankAccount: 'Konto bankowe Xero',
            xeroBankAccountDescription: 'Wybierz, gdzie wydatki będą księgowane jako transakcje bankowe.',
            exportExpensesDescription: 'Raporty zostaną wyeksportowane jako faktura zakupu z datą i statusem wybranym poniżej.',
            purchaseBillDate: 'Data zakupu faktury',
            exportInvoices: 'Eksportuj faktury jako',
            salesInvoice: 'Faktura sprzedaży',
            exportInvoicesDescription: 'Faktury sprzedażowe zawsze wyświetlają datę, w której faktura została wysłana.',
            advancedConfig: {
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z Xero każdego dnia.',
                purchaseBillStatusTitle: 'Status rachunku zakupu',
                reimbursedReportsDescription: 'Za każdym razem, gdy raport jest opłacany za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie Xero.',
                xeroBillPaymentAccount: 'Konto do płatności rachunków Xero',
                xeroInvoiceCollectionAccount: 'Konto do zbierania faktur Xero',
                xeroBillPaymentAccountDescription: 'Wybierz, skąd chcesz opłacić rachunki, a my utworzymy płatność w Xero.',
                invoiceAccountSelectorDescription: 'Wybierz, gdzie chcesz otrzymywać płatności za faktury, a my stworzymy płatność w Xero.',
            },
            exportDate: {
                label: 'Data zakupu faktury',
                description: 'Użyj tej daty podczas eksportowania raportów do Xero.',
                values: (_p = {},
                    _p[CONST_1.default.XERO_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Data ostatniego wydatku',
                        description: 'Data najnowszego wydatku w raporcie.',
                    },
                    _p[CONST_1.default.XERO_EXPORT_DATE.REPORT_EXPORTED] = {
                        label: 'Data eksportu',
                        description: 'Data, kiedy raport został wyeksportowany do Xero.',
                    },
                    _p[CONST_1.default.XERO_EXPORT_DATE.REPORT_SUBMITTED] = {
                        label: 'Data złożenia',
                        description: 'Data, kiedy raport został przesłany do zatwierdzenia.',
                    },
                    _p),
            },
            invoiceStatus: {
                label: 'Status rachunku zakupu',
                description: 'Użyj tego statusu podczas eksportowania rachunków zakupu do Xero.',
                values: (_q = {},
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.DRAFT] = 'Szkic',
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL] = 'Oczekiwanie na zatwierdzenie',
                    _q[CONST_1.default.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT] = 'Oczekiwanie na płatność',
                    _q),
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Proszę dodać konto w Xero i ponownie zsynchronizować połączenie.',
        },
        sageIntacct: {
            preferredExporter: 'Preferowany eksporter',
            taxSolution: 'Rozwiązanie podatkowe',
            notConfigured: 'Nieskonfigurowane',
            exportDate: {
                label: 'Data eksportu',
                description: 'Użyj tej daty podczas eksportowania raportów do Sage Intacct.',
                values: (_r = {},
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Data ostatniego wydatku',
                        description: 'Data najnowszego wydatku w raporcie.',
                    },
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.EXPORTED] = {
                        label: 'Data eksportu',
                        description: 'Data, kiedy raport został wyeksportowany do Sage Intacct.',
                    },
                    _r[CONST_1.default.SAGE_INTACCT_EXPORT_DATE.SUBMITTED] = {
                        label: 'Data złożenia',
                        description: 'Data, kiedy raport został przesłany do zatwierdzenia.',
                    },
                    _r),
            },
            reimbursableExpenses: {
                description: 'Ustaw sposób eksportowania wydatków z własnej kieszeni do Sage Intacct.',
                values: (_s = {},
                    _s[CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT] = 'Raporty wydatków',
                    _s[CONST_1.default.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL] = 'Faktury od dostawców',
                    _s),
            },
            nonReimbursableExpenses: {
                description: 'Ustaw, jak zakupy kartą firmową są eksportowane do Sage Intacct.',
                values: (_t = {},
                    _t[CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE] = 'Karty kredytowe',
                    _t[CONST_1.default.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL] = 'Faktury od dostawców',
                    _t),
            },
            creditCardAccount: 'Konto karty kredytowej',
            defaultVendor: 'Domyślny dostawca',
            defaultVendorDescription: function (_a) {
                var isReimbursable = _a.isReimbursable;
                return "Ustaw domy\u015Blnego dostawc\u0119, kt\u00F3ry b\u0119dzie stosowany do ".concat(isReimbursable ? '' : 'non-', "wydatk\u00F3w podlegaj\u0105cych zwrotowi, kt\u00F3re nie maj\u0105 dopasowanego dostawcy w Sage Intacct.");
            },
            exportDescription: 'Skonfiguruj, jak dane z Expensify są eksportowane do Sage Intacct.',
            exportPreferredExporterNote: 'Preferowany eksporter może być dowolnym administratorem przestrzeni roboczej, ale musi być również administratorem domeny, jeśli ustawisz różne konta eksportu dla indywidualnych kart firmowych w ustawieniach domeny.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter zobaczy raporty do eksportu na swoim koncie.',
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: "Prosz\u0119 doda\u0107 konto w Sage Intacct i ponownie zsynchronizowa\u0107 po\u0142\u0105czenie.",
            autoSync: 'Auto-sync',
            autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z Sage Intacct każdego dnia.',
            inviteEmployees: 'Zaproś pracowników',
            inviteEmployeesDescription: 'Importuj dane pracowników Sage Intacct i zaproś pracowników do tego miejsca pracy. Twój przepływ zatwierdzania domyślnie będzie ustawiony na zatwierdzanie przez menedżera i może być dalej konfigurowany na stronie Członkowie.',
            syncReimbursedReports: 'Synchronizuj zrefundowane raporty',
            syncReimbursedReportsDescription: 'Za każdym razem, gdy raport jest opłacany za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na poniższym koncie Sage Intacct.',
            paymentAccount: 'Konto płatnicze Sage Intacct',
        },
        netsuite: {
            subsidiary: 'Spółka zależna',
            subsidiarySelectDescription: 'Wybierz jednostkę zależną w NetSuite, z której chcesz zaimportować dane.',
            exportDescription: 'Skonfiguruj, jak dane z Expensify eksportują się do NetSuite.',
            exportInvoices: 'Eksportuj faktury do',
            journalEntriesTaxPostingAccount: 'Konto księgowania podatku w dzienniku księgowań',
            journalEntriesProvTaxPostingAccount: 'Konta księgowania podatku prowincjonalnego w dziennikach księgowych',
            foreignCurrencyAmount: 'Eksportuj kwotę w walucie obcej',
            exportToNextOpenPeriod: 'Eksportuj do następnego otwartego okresu',
            nonReimbursableJournalPostingAccount: 'Konto księgowania niepodlegające zwrotowi',
            reimbursableJournalPostingAccount: 'Konto księgowania zwrotów',
            journalPostingPreference: {
                label: 'Preferencje księgowania zapisów w dzienniku',
                values: (_u = {},
                    _u[CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE] = 'Pojedynczy, wyszczególniony wpis dla każdego raportu',
                    _u[CONST_1.default.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE] = 'Pojedynczy wpis dla każdego wydatku',
                    _u),
            },
            invoiceItem: {
                label: 'Pozycja faktury',
                values: (_v = {},
                    _v[CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE] = {
                        label: 'Utwórz dla mnie jeden',
                        description: 'Utworzymy dla Ciebie "pozycję faktury Expensify" podczas eksportu (jeśli jeszcze nie istnieje).',
                    },
                    _v[CONST_1.default.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT] = {
                        label: 'Wybierz istniejące',
                        description: 'Połączymy faktury z Expensify z wybranym poniżej elementem.',
                    },
                    _v),
            },
            exportDate: {
                label: 'Data eksportu',
                description: 'Użyj tej daty podczas eksportowania raportów do NetSuite.',
                values: (_w = {},
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.LAST_EXPENSE] = {
                        label: 'Data ostatniego wydatku',
                        description: 'Data najnowszego wydatku w raporcie.',
                    },
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.EXPORTED] = {
                        label: 'Data eksportu',
                        description: 'Data eksportu raportu do NetSuite.',
                    },
                    _w[CONST_1.default.NETSUITE_EXPORT_DATE.SUBMITTED] = {
                        label: 'Data złożenia',
                        description: 'Data, kiedy raport został przesłany do zatwierdzenia.',
                    },
                    _w),
            },
            exportDestination: {
                values: (_x = {},
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT] = {
                        label: 'Raporty wydatków',
                        reimbursableDescription: 'Wydatki z własnej kieszeni zostaną wyeksportowane jako raporty wydatków do NetSuite.',
                        nonReimbursableDescription: 'Wydatki z kart firmowych będą eksportowane jako raporty wydatków do NetSuite.',
                    },
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL] = {
                        label: 'Faktury od dostawców',
                        reimbursableDescription: 'Out-of-pocket expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                        nonReimbursableDescription: 'Company card expenses will export as bills payable to the NetSuite vendor specified below.\n' +
                            '\n' +
                            'If you’d like to set a specific vendor for each card, go to *Settings > Domains > Company Cards*.',
                    },
                    _x[CONST_1.default.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY] = {
                        label: 'Zapisy w dzienniku',
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
                autoSyncDescription: 'Expensify będzie automatycznie synchronizować się z NetSuite każdego dnia.',
                reimbursedReportsDescription: 'Za każdym razem, gdy raport jest opłacany za pomocą Expensify ACH, odpowiednia płatność rachunku zostanie utworzona na koncie NetSuite poniżej.',
                reimbursementsAccount: 'Konto zwrotów',
                reimbursementsAccountDescription: 'Wybierz konto bankowe, którego użyjesz do zwrotów, a my utworzymy powiązaną płatność w NetSuite.',
                collectionsAccount: 'Konto windykacyjne',
                collectionsAccountDescription: 'Po oznaczeniu faktury jako opłaconej w Expensify i wyeksportowaniu do NetSuite, pojawi się ona na koncie poniżej.',
                approvalAccount: 'Konto zatwierdzania A/P',
                approvalAccountDescription: 'Wybierz konto, na podstawie którego transakcje będą zatwierdzane w NetSuite. Jeśli synchronizujesz raporty zwrócone, to również jest to konto, na które będą tworzone płatności rachunków.',
                defaultApprovalAccount: 'NetSuite domyślny',
                inviteEmployees: 'Zaproś pracowników i ustaw zatwierdzenia',
                inviteEmployeesDescription: 'Importuj rekordy pracowników NetSuite i zaproś pracowników do tego miejsca pracy. Twój przepływ zatwierdzania domyślnie będzie ustawiony na zatwierdzanie przez menedżera i można go dalej konfigurować na stronie *Członkowie*.',
                autoCreateEntities: 'Automatyczne tworzenie pracowników/dostawców',
                enableCategories: 'Włącz nowo zaimportowane kategorie',
                customFormID: 'Niestandardowy identyfikator formularza',
                customFormIDDescription: 'Domyślnie Expensify utworzy wpisy, używając preferowanego formularza transakcji ustawionego w NetSuite. Alternatywnie, możesz wyznaczyć konkretny formularz transakcji do użycia.',
                customFormIDReimbursable: 'Wydatek z własnej kieszeni',
                customFormIDNonReimbursable: 'Wydatek na firmową kartę',
                exportReportsTo: {
                    label: 'Poziom zatwierdzenia raportu wydatków',
                    description: 'Po zatwierdzeniu raportu wydatków w Expensify i wyeksportowaniu go do NetSuite, można ustawić dodatkowy poziom zatwierdzenia w NetSuite przed zaksięgowaniem.',
                    values: (_y = {},
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE] = 'Domyślne preferencje NetSuite',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED] = 'Tylko zatwierdzone przez przełożonego',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED] = 'Tylko zatwierdzone przez księgowość',
                        _y[CONST_1.default.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH] = 'Supervisor i księgowość zatwierdzili',
                        _y),
                },
                accountingMethods: {
                    label: 'Kiedy eksportować',
                    description: 'Wybierz, kiedy eksportować wydatki:',
                    values: (_z = {},
                        _z[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Rozliczenia międzyokresowe',
                        _z[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Gotówka',
                        _z),
                    alternateText: (_0 = {},
                        _0[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL] = 'Wydatki z własnej kieszeni zostaną wyeksportowane po ostatecznym zatwierdzeniu.',
                        _0[expensify_common_1.CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH] = 'Wydatki z własnej kieszeni zostaną wyeksportowane po opłaceniu',
                        _0),
                },
                exportVendorBillsTo: {
                    label: 'Poziom zatwierdzenia faktury dostawcy',
                    description: 'Po zatwierdzeniu faktury dostawcy w Expensify i wyeksportowaniu jej do NetSuite, możesz ustawić dodatkowy poziom zatwierdzenia w NetSuite przed zaksięgowaniem.',
                    values: (_1 = {},
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE] = 'Domyślne preferencje NetSuite',
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING] = 'Oczekuje na zatwierdzenie',
                        _1[CONST_1.default.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED] = 'Zatwierdzono do publikacji',
                        _1),
                },
                exportJournalsTo: {
                    label: 'Poziom zatwierdzenia wpisu w dzienniku',
                    description: 'Po zatwierdzeniu wpisu do dziennika w Expensify i wyeksportowaniu go do NetSuite, można ustawić dodatkowy poziom zatwierdzenia w NetSuite przed zaksięgowaniem.',
                    values: (_2 = {},
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE] = 'Domyślne preferencje NetSuite',
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING] = 'Oczekuje na zatwierdzenie',
                        _2[CONST_1.default.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED] = 'Zatwierdzono do publikacji',
                        _2),
                },
                error: {
                    customFormID: 'Proszę wprowadzić prawidłowy numeryczny identyfikator formularza niestandardowego',
                },
            },
            noAccountsFound: 'Nie znaleziono kont',
            noAccountsFoundDescription: 'Proszę dodać konto w NetSuite i ponownie zsynchronizować połączenie.',
            noVendorsFound: 'Nie znaleziono dostawców',
            noVendorsFoundDescription: 'Proszę dodać dostawców w NetSuite i ponownie zsynchronizować połączenie.',
            noItemsFound: 'Nie znaleziono pozycji faktury',
            noItemsFoundDescription: 'Proszę dodać pozycje faktury w NetSuite i ponownie zsynchronizować połączenie.',
            noSubsidiariesFound: 'Nie znaleziono spółek zależnych',
            noSubsidiariesFoundDescription: 'Proszę dodać spółkę zależną w NetSuite i ponownie zsynchronizować połączenie.',
            tokenInput: {
                title: 'Konfiguracja NetSuite',
                formSteps: {
                    installBundle: {
                        title: 'Zainstaluj pakiet Expensify',
                        description: 'W NetSuite, przejdź do *Customization > SuiteBundler > Search & Install Bundles* > wyszukaj "Expensify" > zainstaluj pakiet.',
                    },
                    enableTokenAuthentication: {
                        title: 'Włącz uwierzytelnianie oparte na tokenach',
                        description: 'W NetSuite przejdź do *Setup > Company > Enable Features > SuiteCloud* > włącz *token-based authentication*.',
                    },
                    enableSoapServices: {
                        title: 'Włącz usługi sieciowe SOAP',
                        description: 'W NetSuite, przejdź do *Setup > Company > Enable Features > SuiteCloud* > włącz *SOAP Web Services*.',
                    },
                    createAccessToken: {
                        title: 'Utwórz token dostępu',
                        description: 'W NetSuite przejdź do *Setup > Users/Roles > Access Tokens* > utwórz token dostępu dla aplikacji "Expensify" i roli "Expensify Integration" lub "Administrator".\n\n*Ważne:* Upewnij się, że zapiszesz *Token ID* i *Token Secret* z tego kroku. Będziesz ich potrzebować w następnym kroku.',
                    },
                    enterCredentials: {
                        title: 'Wprowadź swoje dane logowania do NetSuite',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Account ID',
                            netSuiteTokenID: 'ID tokena',
                            netSuiteTokenSecret: 'Sekret tokena',
                        },
                        netSuiteAccountIDDescription: 'W NetSuite przejdź do *Setup > Integration > SOAP Web Services Preferences*.',
                    },
                },
            },
            import: {
                expenseCategories: 'Kategorie wydatków',
                expenseCategoriesDescription: 'Twoje kategorie wydatków z NetSuite zostaną zaimportowane do Expensify jako kategorie.',
                crossSubsidiaryCustomers: 'Klienci/projekty między spółkami zależnymi',
                importFields: {
                    departments: {
                        title: 'Działy',
                        subtitle: 'Wybierz, jak obsługiwać *działy* NetSuite w Expensify.',
                    },
                    classes: {
                        title: 'Klasy',
                        subtitle: 'Wybierz, jak obsługiwać *klasy* w Expensify.',
                    },
                    locations: {
                        title: 'Lokalizacje',
                        subtitle: 'Wybierz, jak obsługiwać *lokalizacje* w Expensify.',
                    },
                },
                customersOrJobs: {
                    title: 'Klienci/projekty',
                    subtitle: 'Wybierz, jak obsługiwać *klientów* i *projekty* NetSuite w Expensify.',
                    importCustomers: 'Importuj klientów',
                    importJobs: 'Importuj projekty',
                    customers: 'klienci',
                    jobs: 'projekty',
                    label: function (_a) {
                        var importFields = _a.importFields, importType = _a.importType;
                        return "".concat(importFields.join('i'), ", ").concat(importType);
                    },
                },
                importTaxDescription: 'Importuj grupy podatkowe z NetSuite.',
                importCustomFields: {
                    chooseOptionBelow: 'Wybierz opcję poniżej:',
                    label: function (_a) {
                        var importedTypes = _a.importedTypes;
                        return "Imported as ".concat(importedTypes.join('i'));
                    },
                    requiredFieldError: function (_a) {
                        var fieldName = _a.fieldName;
                        return "Prosz\u0119 wprowadzi\u0107 ".concat(fieldName);
                    },
                    customSegments: {
                        title: 'Niestandardowe segmenty/rekordy',
                        addText: 'Dodaj niestandardowy segment/rekord',
                        recordTitle: 'Niestandardowy segment/rekord',
                        helpLink: CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Zobacz szczegółowe instrukcje',
                        helpText: 'dotyczące konfigurowania niestandardowych segmentów/rekordów.',
                        emptyTitle: 'Dodaj niestandardowy segment lub niestandardowy rekord',
                        fields: {
                            segmentName: 'Imię',
                            internalID: 'Identyfikator wewnętrzny',
                            scriptID: 'Script ID',
                            customRecordScriptID: 'ID kolumny transakcji',
                            mapping: 'Wyświetlane jako',
                        },
                        removeTitle: 'Usuń niestandardowy segment/rekord',
                        removePrompt: 'Czy na pewno chcesz usunąć ten niestandardowy segment/rekord?',
                        addForm: {
                            customSegmentName: 'niestandardowa nazwa segmentu',
                            customRecordName: 'niestandardowa nazwa rekordu',
                            segmentTitle: 'Segment niestandardowy',
                            customSegmentAddTitle: 'Dodaj niestandardowy segment',
                            customRecordAddTitle: 'Dodaj niestandardowy rekord',
                            recordTitle: 'Niestandardowy rekord',
                            segmentRecordType: 'Czy chcesz dodać niestandardowy segment czy niestandardowy rekord?',
                            customSegmentNameTitle: 'Jaka jest nazwa segmentu niestandardowego?',
                            customRecordNameTitle: 'Jaka jest nazwa niestandardowego rekordu?',
                            customSegmentNameFooter: "Mo\u017Cesz znale\u017A\u0107 niestandardowe nazwy segment\u00F3w w NetSuite na stronie *Customizations > Links, Records & Fields > Custom Segments*.\n\n_Aby uzyska\u0107 bardziej szczeg\u00F3\u0142owe instrukcje, [odwied\u017A nasz\u0105 stron\u0119 pomocy](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customRecordNameFooter: "Mo\u017Cesz znale\u017A\u0107 niestandardowe nazwy rekord\u00F3w w NetSuite, wpisuj\u0105c \"Transaction Column Field\" w globalnym wyszukiwaniu.\n\n_Aby uzyska\u0107 bardziej szczeg\u00F3\u0142owe instrukcje, [odwied\u017A nasz\u0105 stron\u0119 pomocy](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customSegmentInternalIDTitle: 'Jaki jest wewnętrzny ID?',
                            customSegmentInternalIDFooter: "Najpierw upewnij si\u0119, \u017Ce w\u0142\u0105czy\u0142e\u015B wewn\u0119trzne identyfikatory w NetSuite w sekcji *Home > Set Preferences > Show Internal ID.*\n\nMo\u017Cesz znale\u017A\u0107 wewn\u0119trzne identyfikatory segment\u00F3w niestandardowych w NetSuite w sekcji:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Kliknij w segment niestandardowy.\n3. Kliknij hiper\u0142\u0105cze obok *Custom Record Type*.\n4. Znajd\u017A wewn\u0119trzny identyfikator w tabeli na dole.\n\n_Aby uzyska\u0107 bardziej szczeg\u00F3\u0142owe instrukcje, [odwied\u017A nasz\u0105 stron\u0119 pomocy](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")_."),
                            customRecordInternalIDFooter: "Mo\u017Cesz znale\u017A\u0107 wewn\u0119trzne identyfikatory rekord\u00F3w niestandardowych w NetSuite, wykonuj\u0105c nast\u0119puj\u0105ce kroki:\n\n1. Wpisz \"Transaction Line Fields\" w globalnym wyszukiwaniu.\n2. Kliknij w rekord niestandardowy.\n3. Znajd\u017A wewn\u0119trzny identyfikator po lewej stronie.\n\n_Aby uzyska\u0107 bardziej szczeg\u00F3\u0142owe instrukcje, [odwied\u017A nasz\u0105 stron\u0119 pomocy](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customSegmentScriptIDTitle: 'Jaki jest identyfikator skryptu?',
                            customSegmentScriptIDFooter: "Mo\u017Cesz znale\u017A\u0107 niestandardowe identyfikatory skrypt\u00F3w segment\u00F3w w NetSuite w:\n\n1. *Customization > Lists, Records, & Fields > Custom Segments*.\n2. Kliknij w niestandardowy segment.\n3. Kliknij kart\u0119 *Application and Sourcing* na dole, a nast\u0119pnie:\n    a. Je\u015Bli chcesz wy\u015Bwietli\u0107 niestandardowy segment jako *tag* (na poziomie pozycji) w Expensify, kliknij podkart\u0119 *Transaction Columns* i u\u017Cyj *Field ID*.\n    b. Je\u015Bli chcesz wy\u015Bwietli\u0107 niestandardowy segment jako *report field* (na poziomie raportu) w Expensify, kliknij podkart\u0119 *Transactions* i u\u017Cyj *Field ID*.\n\n_Dla bardziej szczeg\u00F3\u0142owych instrukcji, [odwied\u017A nasz\u0105 stron\u0119 pomocy](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")_."),
                            customRecordScriptIDTitle: 'Jaki jest identyfikator kolumny transakcji?',
                            customRecordScriptIDFooter: "Mo\u017Cesz znale\u017A\u0107 niestandardowe identyfikatory skrypt\u00F3w rekord\u00F3w w NetSuite w nast\u0119puj\u0105cy spos\u00F3b:\n\n1. Wprowad\u017A \"Transaction Line Fields\" w globalnym wyszukiwaniu.\n2. Kliknij w niestandardowy rekord.\n3. Znajd\u017A identyfikator skryptu po lewej stronie.\n\n_Aby uzyska\u0107 bardziej szczeg\u00F3\u0142owe instrukcje, [odwied\u017A nasz\u0105 stron\u0119 pomocy](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS, ")_."),
                            customSegmentMappingTitle: 'Jak ten niestandardowy segment powinien być wyświetlany w Expensify?',
                            customRecordMappingTitle: 'Jak ten niestandardowy rekord powinien być wyświetlany w Expensify?',
                        },
                        errors: {
                            uniqueFieldError: function (_a) {
                                var fieldName = _a.fieldName;
                                return "Niestandardowy segment/rekord z tym ".concat(fieldName === null || fieldName === void 0 ? void 0 : fieldName.toLowerCase(), " ju\u017C istnieje");
                            },
                        },
                    },
                    customLists: {
                        title: 'Listy niestandardowe',
                        addText: 'Dodaj listę niestandardową',
                        recordTitle: 'Lista niestandardowa',
                        helpLink: CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Zobacz szczegółowe instrukcje',
                        helpText: 'w konfigurowaniu list niestandardowych.',
                        emptyTitle: 'Dodaj niestandardową listę',
                        fields: {
                            listName: 'Imię',
                            internalID: 'Identyfikator wewnętrzny',
                            transactionFieldID: 'ID pola transakcji',
                            mapping: 'Wyświetlane jako',
                        },
                        removeTitle: 'Usuń niestandardową listę',
                        removePrompt: 'Czy na pewno chcesz usunąć tę niestandardową listę?',
                        addForm: {
                            listNameTitle: 'Wybierz listę niestandardową',
                            transactionFieldIDTitle: 'Jaki jest identyfikator pola transakcji?',
                            transactionFieldIDFooter: "Mo\u017Cesz znale\u017A\u0107 identyfikatory p\u00F3l transakcji w NetSuite, wykonuj\u0105c nast\u0119puj\u0105ce kroki:\n\n1. Wpisz \"Transaction Line Fields\" w globalnym wyszukiwaniu.\n2. Kliknij na niestandardow\u0105 list\u0119.\n3. Znajd\u017A identyfikator pola transakcji po lewej stronie.\n\n_Aby uzyska\u0107 bardziej szczeg\u00F3\u0142owe instrukcje, [odwied\u017A nasz\u0105 stron\u0119 pomocy](".concat(CONST_1.default.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS, ")_."),
                            mappingTitle: 'Jak powinna być wyświetlana ta niestandardowa lista w Expensify?',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: "Lista niestandardowa z tym identyfikatorem pola transakcji ju\u017C istnieje",
                        },
                    },
                },
                importTypes: (_3 = {},
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT] = {
                        label: 'Domyślne ustawienia pracownika NetSuite',
                        description: 'Nie zaimportowane do Expensify, zastosowane przy eksporcie',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "Je\u015Bli u\u017Cywasz ".concat(importField, " w NetSuite, zastosujemy domy\u015Bln\u0105 warto\u015B\u0107 ustawion\u0105 w rekordzie pracownika podczas eksportu do Raportu Wydatk\u00F3w lub Ksi\u0119gowania.");
                        },
                    },
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG] = {
                        label: 'Tagi',
                        description: 'Poziom pozycji linii',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "".concat((0, startCase_1.default)(importField), " b\u0119dzie mo\u017Cna wybra\u0107 dla ka\u017Cdego indywidualnego wydatku w raporcie pracownika.");
                        },
                    },
                    _3[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD] = {
                        label: 'Pola raportu',
                        description: 'Poziom raportu',
                        footerContent: function (_a) {
                            var importField = _a.importField;
                            return "".concat((0, startCase_1.default)(importField), " wyb\u00F3r b\u0119dzie dotyczy\u0142 wszystkich wydatk\u00F3w w raporcie pracownika.");
                        },
                    },
                    _3),
            },
        },
        intacct: {
            sageIntacctSetup: 'Konfiguracja Sage Intacct',
            prerequisitesTitle: 'Zanim się połączysz...',
            downloadExpensifyPackage: 'Pobierz pakiet Expensify dla Sage Intacct',
            followSteps: 'Postępuj zgodnie z krokami w naszych instrukcjach Jak połączyć się z Sage Intacct.',
            enterCredentials: 'Wprowadź swoje dane logowania do Sage Intacct',
            entity: 'Encja',
            employeeDefault: 'Domyślne ustawienia pracownika Sage Intacct',
            employeeDefaultDescription: 'Domyślny dział pracownika zostanie zastosowany do jego wydatków w Sage Intacct, jeśli taki istnieje.',
            displayedAsTagDescription: 'Dział będzie można wybrać dla każdego indywidualnego wydatku w raporcie pracownika.',
            displayedAsReportFieldDescription: 'Wybór działu będzie dotyczył wszystkich wydatków w raporcie pracownika.',
            toggleImportTitleFirstPart: 'Wybierz, jak obsługiwać Sage Intacct',
            toggleImportTitleSecondPart: 'w Expensify.',
            expenseTypes: 'Typy wydatków',
            expenseTypesDescription: 'Twoje typy wydatków Sage Intacct zostaną zaimportowane do Expensify jako kategorie.',
            accountTypesDescription: 'Twój plan kont Sage Intacct zostanie zaimportowany do Expensify jako kategorie.',
            importTaxDescription: 'Importuj stawkę podatku od zakupu z Sage Intacct.',
            userDefinedDimensions: 'Wymiary zdefiniowane przez użytkownika',
            addUserDefinedDimension: 'Dodaj zdefiniowany przez użytkownika wymiar',
            integrationName: 'Nazwa integracji',
            dimensionExists: 'Wymiar o tej nazwie już istnieje.',
            removeDimension: 'Usuń zdefiniowany przez użytkownika wymiar',
            removeDimensionPrompt: 'Czy na pewno chcesz usunąć tę zdefiniowaną przez użytkownika wymiar?',
            userDefinedDimension: 'Zdefiniowany przez użytkownika wymiar',
            addAUserDefinedDimension: 'Dodaj zdefiniowany przez użytkownika wymiar',
            detailedInstructionsLink: 'Zobacz szczegółowe instrukcje',
            detailedInstructionsRestOfSentence: 'na dodawaniu zdefiniowanych przez użytkownika wymiarów.',
            userDimensionsAdded: function () { return ({
                one: '1 UDD dodany',
                other: function (count) { return "Dodano ".concat(count, " UDDs"); },
            }); },
            mappingTitle: function (_a) {
                var mappingName = _a.mappingName;
                switch (mappingName) {
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'działy';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'klasy';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'lokalizacje';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'klienci';
                    case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'projekty (prace)';
                    default:
                        return 'mappings';
                }
            },
        },
        type: {
            free: 'Darmowy',
            control: 'Kontrola',
            collect: 'Zbierz',
        },
        companyCards: {
            addCards: 'Dodaj karty',
            selectCards: 'Wybierz karty',
            addNewCard: {
                other: 'Inne',
                cardProviders: {
                    gl1025: 'American Express Corporate Cards',
                    cdf: 'Karty Komercyjne Mastercard',
                    vcf: 'Karty Komercyjne Visa',
                    stripe: 'Stripe Cards',
                },
                yourCardProvider: "Kto jest dostawc\u0105 Twojej karty?",
                whoIsYourBankAccount: 'Kim jest Twój bank?',
                whereIsYourBankLocated: 'Gdzie znajduje się Twój bank?',
                howDoYouWantToConnect: 'Jak chcesz połączyć się ze swoim bankiem?',
                learnMoreAboutOptions: {
                    text: 'Dowiedz się więcej na ten temat',
                    linkText: 'opcje.',
                },
                commercialFeedDetails: 'Wymaga konfiguracji z Twoim bankiem. Zazwyczaj jest używane przez większe firmy i często jest najlepszą opcją, jeśli się kwalifikujesz.',
                commercialFeedPlaidDetails: "Wymaga konfiguracji z Twoim bankiem, ale poprowadzimy Ci\u0119. Zazwyczaj jest to ograniczone do wi\u0119kszych firm.",
                directFeedDetails: 'Najprostsze podejście. Połącz się od razu, używając swoich głównych poświadczeń. Ta metoda jest najczęściej stosowana.',
                enableFeed: {
                    title: function (_a) {
                        var provider = _a.provider;
                        return "W\u0142\u0105cz sw\u00F3j kana\u0142 ".concat(provider);
                    },
                    heading: 'Mamy bezpośrednią integrację z wystawcą Twojej karty i możemy szybko i dokładnie zaimportować dane transakcji do Expensify.\n\nAby rozpocząć, wystarczy:',
                    visa: 'Mamy globalne integracje z Visa, chociaż kwalifikowalność zależy od banku i programu karty.\n\nAby rozpocząć, wystarczy:',
                    mastercard: 'Mamy globalne integracje z Mastercard, jednak dostępność zależy od banku i programu karty.\n\nAby rozpocząć, wystarczy:',
                    vcf: "1. Odwied\u017A [ten artyku\u0142 pomocy](".concat(CONST_1.default.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP, "), aby uzyska\u0107 szczeg\u00F3\u0142owe instrukcje dotycz\u0105ce konfiguracji kart Visa Commercial.\n\n2. [Skontaktuj si\u0119 z bankiem](").concat(CONST_1.default.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP, "), aby zweryfikowa\u0107, czy obs\u0142uguj\u0105 oni komercyjny kana\u0142 dla Twojego programu, i popro\u015B o jego w\u0142\u0105czenie.\n\n3. *Gdy kana\u0142 zostanie w\u0142\u0105czony i b\u0119dziesz mie\u0107 jego szczeg\u00F3\u0142y, przejd\u017A do nast\u0119pnego ekranu.*"),
                    gl1025: "1. Odwied\u017A [ten artyku\u0142 pomocy](".concat(CONST_1.default.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP, "), aby dowiedzie\u0107 si\u0119, czy American Express mo\u017Ce w\u0142\u0105czy\u0107 komercyjny kana\u0142 dla Twojego programu.\n\n2. Gdy kana\u0142 zostanie w\u0142\u0105czony, Amex wy\u015Ble Ci list produkcyjny.\n\n3. *Gdy ju\u017C masz informacje o kanale, przejd\u017A do nast\u0119pnego ekranu.*"),
                    cdf: "1. Odwied\u017A [ten artyku\u0142 pomocy](".concat(CONST_1.default.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS, ") po szczeg\u00F3\u0142owe instrukcje dotycz\u0105ce konfiguracji kart Mastercard Commercial Cards.\n\n2. [Skontaktuj si\u0119 ze swoim bankiem](").concat(CONST_1.default.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS, "), aby zweryfikowa\u0107, czy obs\u0142uguj\u0105 oni komercyjny kana\u0142 dla Twojego programu, i popro\u015B ich o jego w\u0142\u0105czenie.\n\n3. *Gdy kana\u0142 zostanie w\u0142\u0105czony i b\u0119dziesz mie\u0107 jego szczeg\u00F3\u0142y, przejd\u017A do nast\u0119pnego ekranu.*"),
                    stripe: "1. Odwied\u017A Dashboard Stripe i przejd\u017A do [Ustawienia](".concat(CONST_1.default.COMPANY_CARDS_STRIPE_HELP, ").\n\n2. W sekcji Integracje Produkt\u00F3w kliknij W\u0142\u0105cz obok Expensify.\n\n3. Gdy kana\u0142 zostanie w\u0142\u0105czony, kliknij Prze\u015Blij poni\u017Cej, a my zajmiemy si\u0119 jego dodaniem."),
                },
                whatBankIssuesCard: 'Jaki bank wydaje te karty?',
                enterNameOfBank: 'Wprowadź nazwę banku',
                feedDetails: {
                    vcf: {
                        title: 'Jakie są szczegóły dotyczące połączenia z Visa?',
                        processorLabel: 'ID procesora',
                        bankLabel: 'Identyfikator instytucji finansowej (banku)',
                        companyLabel: 'ID firmy',
                        helpLabel: 'Gdzie mogę znaleźć te identyfikatory?',
                    },
                    gl1025: {
                        title: "Jak nazywa si\u0119 plik dostawy Amex?",
                        fileNameLabel: 'Nazwa pliku dostawy',
                        helpLabel: 'Gdzie znajdę nazwę pliku dostawy?',
                    },
                    cdf: {
                        title: "Jaki jest identyfikator dystrybucji Mastercard?",
                        distributionLabel: 'ID dystrybucji',
                        helpLabel: 'Gdzie mogę znaleźć identyfikator dystrybucji?',
                    },
                },
                amexCorporate: 'Wybierz to, jeśli na przedniej stronie Twoich kart jest napis „Corporate”',
                amexBusiness: 'Wybierz to, jeśli na przodzie twoich kart jest napis „Business”',
                amexPersonal: 'Wybierz tę opcję, jeśli Twoje karty są osobiste',
                error: {
                    pleaseSelectProvider: 'Proszę wybrać dostawcę karty przed kontynuowaniem.',
                    pleaseSelectBankAccount: 'Proszę wybrać konto bankowe przed kontynuowaniem',
                    pleaseSelectBank: 'Proszę wybrać bank przed kontynuowaniem',
                    pleaseSelectCountry: 'Proszę wybrać kraj przed kontynuowaniem',
                    pleaseSelectFeedType: 'Proszę wybrać typ kanału przed kontynuowaniem.',
                },
            },
            statementCloseDate: (_4 = {},
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH] = 'Ostatni dzień miesiąca',
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH] = 'Ostatni dzień roboczy miesiąca',
                _4[CONST_1.default.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH] = 'Niestandardowy dzień miesiąca',
                _4),
            assignCard: 'Przypisz kartę',
            findCard: 'Znajdź kartę',
            cardNumber: 'Numer karty',
            commercialFeed: 'Komercyjny kanał',
            feedName: function (_a) {
                var feedName = _a.feedName;
                return "karty ".concat(feedName);
            },
            directFeed: 'Bezpośredni kanał',
            whoNeedsCardAssigned: 'Kto potrzebuje przypisanej karty?',
            chooseCard: 'Wybierz kartę',
            chooseCardFor: function (_a) {
                var assignee = _a.assignee, feed = _a.feed;
                return "Wybierz kart\u0119 dla ".concat(assignee, " z kana\u0142u kart ").concat(feed, ".");
            },
            noActiveCards: 'Brak aktywnych kart w tym kanale',
            somethingMightBeBroken: 'Albo coś może być zepsute. Tak czy inaczej, jeśli masz jakieś pytania, po prostu',
            contactConcierge: 'skontaktuj się z Concierge',
            chooseTransactionStartDate: 'Wybierz datę rozpoczęcia transakcji',
            startDateDescription: 'Zaimportujemy wszystkie transakcje od tej daty. Jeśli nie określono daty, sięgniemy tak daleko wstecz, jak pozwala na to Twój bank.',
            fromTheBeginning: 'Od początku',
            customStartDate: 'Niestandardowa data rozpoczęcia',
            customCloseDate: 'Niestandardowa data zamknięcia',
            letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda dobrze.',
            confirmationDescription: 'Natychmiast rozpoczniemy importowanie transakcji.',
            cardholder: 'Posiadacz karty',
            card: 'Karta',
            cardName: 'Nazwa karty',
            brokenConnectionErrorFirstPart: "Po\u0142\u0105czenie z kana\u0142em karty jest przerwane. Prosz\u0119",
            brokenConnectionErrorLink: 'zaloguj się do swojego banku',
            brokenConnectionErrorSecondPart: 'abyśmy mogli ponownie nawiązać połączenie.',
            assignedCard: function (_a) {
                var assignee = _a.assignee, link = _a.link;
                return "przypisano ".concat(assignee, " ").concat(link, "! Zaimportowane transakcje pojawi\u0105 si\u0119 w tym czacie.");
            },
            companyCard: 'karta firmowa',
            chooseCardFeed: 'Wybierz kanał kart',
            ukRegulation: 'Expensify, Inc. jest agentem Plaid Financial Ltd., autoryzowanej instytucji płatniczej regulowanej przez Financial Conduct Authority zgodnie z Payment Services Regulations 2017 (Numer referencyjny firmy: 804718). Plaid dostarcza Ci regulowane usługi informacyjne o rachunkach za pośrednictwem Expensify Limited jako swojego agenta.',
        },
        expensifyCard: {
            issueAndManageCards: 'Wydawaj i zarządzaj swoimi kartami Expensify',
            getStartedIssuing: 'Rozpocznij, wydając swoją pierwszą wirtualną lub fizyczną kartę.',
            verificationInProgress: 'Weryfikacja w toku...',
            verifyingTheDetails: 'Weryfikujemy kilka szczegółów. Concierge poinformuje Cię, gdy karty Expensify będą gotowe do wydania.',
            disclaimer: 'The Expensify Visa® Commercial Card jest wydawana przez The Bancorp Bank, N.A., członka FDIC, na podstawie licencji Visa U.S.A. Inc. i może nie być akceptowana u wszystkich sprzedawców, którzy przyjmują karty Visa. Apple® oraz logo Apple® są znakami towarowymi Apple Inc., zarejestrowanymi w USA i innych krajach. App Store jest znakiem usługowym Apple Inc. Google Play oraz logo Google Play są znakami towarowymi Google LLC.',
            issueCard: 'Wydaj kartę',
            findCard: 'Znajdź kartę',
            newCard: 'Nowa karta',
            name: 'Imię',
            lastFour: 'Ostatnie 4',
            limit: 'Limit',
            currentBalance: 'Bieżące saldo',
            currentBalanceDescription: 'Bieżące saldo to suma wszystkich zaksięgowanych transakcji kartą Expensify, które miały miejsce od ostatniej daty rozliczenia.',
            balanceWillBeSettledOn: function (_a) {
                var settlementDate = _a.settlementDate;
                return "Saldo zostanie rozliczone w dniu ".concat(settlementDate);
            },
            settleBalance: 'Ureguluj saldo',
            cardLimit: 'Limit karty',
            remainingLimit: 'Pozostały limit',
            requestLimitIncrease: 'Zwiększenie limitu żądań',
            remainingLimitDescription: 'Bierzemy pod uwagę szereg czynników przy obliczaniu Twojego pozostałego limitu: Twój staż jako klienta, informacje związane z działalnością gospodarczą, które podałeś podczas rejestracji, oraz dostępne środki na Twoim firmowym koncie bankowym. Twój pozostały limit może się zmieniać codziennie.',
            earnedCashback: 'Zwrot gotówki',
            earnedCashbackDescription: 'Saldo zwrotu gotówki opiera się na rozliczonych miesięcznych wydatkach na karcie Expensify w Twoim obszarze roboczym.',
            issueNewCard: 'Wydaj nową kartę',
            finishSetup: 'Zakończ konfigurację',
            chooseBankAccount: 'Wybierz konto bankowe',
            chooseExistingBank: 'Wybierz istniejące firmowe konto bankowe, aby spłacić saldo karty Expensify, lub dodaj nowe konto bankowe.',
            accountEndingIn: 'Konto kończące się na',
            addNewBankAccount: 'Dodaj nowe konto bankowe',
            settlementAccount: 'Konto rozliczeniowe',
            settlementAccountDescription: 'Wybierz konto do spłaty salda na karcie Expensify.',
            settlementAccountInfoPt1: 'Upewnij się, że to konto pasuje do Twojego',
            settlementAccountInfoPt2: 'więc Ciągła Rekoncyliacja działa poprawnie.',
            reconciliationAccount: 'Konto uzgadniające',
            settlementFrequency: 'Częstotliwość rozliczeń',
            settlementFrequencyDescription: 'Wybierz, jak często będziesz spłacać saldo swojej karty Expensify.',
            settlementFrequencyInfo: 'Jeśli chcesz przejść na miesięczne rozliczenie, musisz połączyć swoje konto bankowe za pomocą Plaid i mieć pozytywną historię salda z ostatnich 90 dni.',
            frequency: {
                daily: 'Codziennie',
                monthly: 'Miesięczny',
            },
            cardDetails: 'Szczegóły karty',
            virtual: 'Wirtualny',
            physical: 'Fizyczny',
            deactivate: 'Dezaktywuj kartę',
            changeCardLimit: 'Zmień limit karty',
            changeLimit: 'Zmień limit',
            smartLimitWarning: function (_a) {
                var limit = _a.limit;
                return "Je\u015Bli zmienisz limit tej karty na ".concat(limit, ", nowe transakcje b\u0119d\u0105 odrzucane, dop\u00F3ki nie zatwierdzisz wi\u0119cej wydatk\u00F3w na karcie.");
            },
            monthlyLimitWarning: function (_a) {
                var limit = _a.limit;
                return "Je\u015Bli zmienisz limit tej karty na ".concat(limit, ", nowe transakcje b\u0119d\u0105 odrzucane do nast\u0119pnego miesi\u0105ca.");
            },
            fixedLimitWarning: function (_a) {
                var limit = _a.limit;
                return "Je\u015Bli zmienisz limit tej karty na ".concat(limit, ", nowe transakcje zostan\u0105 odrzucone.");
            },
            changeCardLimitType: 'Zmień typ limitu karty',
            changeLimitType: 'Zmień typ limitu',
            changeCardSmartLimitTypeWarning: function (_a) {
                var limit = _a.limit;
                return "Je\u015Bli zmienisz typ limitu tej karty na Smart Limit, nowe transakcje zostan\u0105 odrzucone, poniewa\u017C niezatwierdzony limit ".concat(limit, " zosta\u0142 ju\u017C osi\u0105gni\u0119ty.");
            },
            changeCardMonthlyLimitTypeWarning: function (_a) {
                var limit = _a.limit;
                return "Je\u015Bli zmienisz typ limitu tej karty na Miesi\u0119czny, nowe transakcje zostan\u0105 odrzucone, poniewa\u017C miesi\u0119czny limit ".concat(limit, " zosta\u0142 ju\u017C osi\u0105gni\u0119ty.");
            },
            addShippingDetails: 'Dodaj szczegóły wysyłki',
            issuedCard: function (_a) {
                var assignee = _a.assignee;
                return "wydano ".concat(assignee, " kart\u0119 Expensify! Karta dotrze w ci\u0105gu 2-3 dni roboczych.");
            },
            issuedCardNoShippingDetails: function (_a) {
                var assignee = _a.assignee;
                return "wydano ".concat(assignee, " kart\u0119 Expensify! Karta zostanie wys\u0142ana, gdy zostan\u0105 dodane szczeg\u00F3\u0142y wysy\u0142ki.");
            },
            issuedCardVirtual: function (_a) {
                var assignee = _a.assignee, link = _a.link;
                return "wydano ".concat(assignee, " wirtualn\u0105 ").concat(link, "! Karta mo\u017Ce by\u0107 u\u017Cywana od razu.");
            },
            addedShippingDetails: function (_a) {
                var assignee = _a.assignee;
                return "".concat(assignee, " doda\u0142 szczeg\u00F3\u0142y wysy\u0142ki. Karta Expensify dotrze w ci\u0105gu 2-3 dni roboczych.");
            },
            verifyingHeader: 'Weryfikacja',
            bankAccountVerifiedHeader: 'Zweryfikowano konto bankowe',
            verifyingBankAccount: 'Weryfikacja konta bankowego...',
            verifyingBankAccountDescription: 'Proszę czekać, podczas gdy potwierdzamy, że to konto może być używane do wydawania kart Expensify.',
            bankAccountVerified: 'Konto bankowe zweryfikowane!',
            bankAccountVerifiedDescription: 'Możesz teraz wydawać karty Expensify członkom swojego miejsca pracy.',
            oneMoreStep: 'Jeszcze jeden krok...',
            oneMoreStepDescription: 'Wygląda na to, że musimy ręcznie zweryfikować Twoje konto bankowe. Przejdź do Concierge, gdzie czekają na Ciebie instrukcje.',
            gotIt: 'Zrozumiałem.',
            goToConcierge: 'Przejdź do Concierge',
        },
        categories: {
            deleteCategories: 'Usuń kategorie',
            deleteCategoriesPrompt: 'Czy na pewno chcesz usunąć te kategorie?',
            deleteCategory: 'Usuń kategorię',
            deleteCategoryPrompt: 'Czy na pewno chcesz usunąć tę kategorię?',
            disableCategories: 'Wyłącz kategorie',
            disableCategory: 'Wyłącz kategorię',
            enableCategories: 'Włącz kategorie',
            enableCategory: 'Włącz kategorię',
            defaultSpendCategories: 'Domyślne kategorie wydatków',
            spendCategoriesDescription: 'Dostosuj sposób kategoryzacji wydatków u sprzedawców dla transakcji kartą kredytową i zeskanowanych paragonów.',
            deleteFailureMessage: 'Wystąpił błąd podczas usuwania kategorii, spróbuj ponownie.',
            categoryName: 'Nazwa kategorii',
            requiresCategory: 'Członkowie muszą kategoryzować wszystkie wydatki',
            needCategoryForExportToIntegration: function (_a) {
                var connectionName = _a.connectionName;
                return "Wszystkie wydatki musz\u0105 by\u0107 skategoryzowane, aby mo\u017Cna je by\u0142o wyeksportowa\u0107 do ".concat(connectionName, ".");
            },
            subtitle: 'Uzyskaj lepszy przegląd, gdzie wydawane są pieniądze. Użyj naszych domyślnych kategorii lub dodaj własne.',
            emptyCategories: {
                title: 'Nie utworzyłeś żadnych kategorii',
                subtitle: 'Dodaj kategorię, aby zorganizować swoje wydatki.',
            },
            emptyCategoriesWithAccounting: {
                subtitle1: 'Twoje kategorie są obecnie importowane z połączenia księgowego. Przejdź do',
                subtitle2: 'księgowość',
                subtitle3: 'aby wprowadzić jakiekolwiek zmiany.',
            },
            updateFailureMessage: 'Wystąpił błąd podczas aktualizacji kategorii, spróbuj ponownie.',
            createFailureMessage: 'Wystąpił błąd podczas tworzenia kategorii, spróbuj ponownie.',
            addCategory: 'Dodaj kategorię',
            editCategory: 'Edytuj kategorię',
            editCategories: 'Edytuj kategorie',
            findCategory: 'Znajdź kategorię',
            categoryRequiredError: 'Nazwa kategorii jest wymagana',
            existingCategoryError: 'Kategoria o tej nazwie już istnieje',
            invalidCategoryName: 'Nieprawidłowa nazwa kategorii',
            importedFromAccountingSoftware: 'Kategorie poniżej są importowane z Twojego',
            payrollCode: 'Kod płacowy',
            updatePayrollCodeFailureMessage: 'Wystąpił błąd podczas aktualizacji kodu płacowego, spróbuj ponownie.',
            glCode: 'Kod GL',
            updateGLCodeFailureMessage: 'Wystąpił błąd podczas aktualizacji kodu GL, spróbuj ponownie.',
            importCategories: 'Importuj kategorie',
            cannotDeleteOrDisableAllCategories: {
                title: 'Nie można usunąć ani wyłączyć wszystkich kategorii',
                description: "Co najmniej jedna kategoria musi pozosta\u0107 w\u0142\u0105czona, poniewa\u017C Twoje miejsce pracy wymaga kategorii.",
            },
        },
        moreFeatures: {
            subtitle: 'Użyj poniższych przełączników, aby włączyć więcej funkcji w miarę rozwoju. Każda funkcja pojawi się w menu nawigacyjnym do dalszej personalizacji.',
            spendSection: {
                title: 'Wydatki',
                subtitle: 'Włącz funkcjonalność, która pomoże Ci rozwijać zespół.',
            },
            manageSection: {
                title: 'Zarządzaj',
                subtitle: 'Dodaj kontrolki, które pomogą utrzymać wydatki w ramach budżetu.',
            },
            earnSection: {
                title: 'Zarabiać',
                subtitle: 'Usprawnij swoje przychody i otrzymuj płatności szybciej.',
            },
            organizeSection: {
                title: 'Zorganizuj',
                subtitle: 'Grupuj i analizuj wydatki, rejestruj każdy zapłacony podatek.',
            },
            integrateSection: {
                title: 'Zintegrować',
                subtitle: 'Połącz Expensify z popularnymi produktami finansowymi.',
            },
            distanceRates: {
                title: 'Stawki za odległość',
                subtitle: 'Dodaj, zaktualizuj i egzekwuj stawki.',
            },
            perDiem: {
                title: 'Dieta',
                subtitle: 'Ustaw stawki diet, aby kontrolować dzienne wydatki pracowników.',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: 'Uzyskaj wgląd i kontrolę nad wydatkami.',
                disableCardTitle: 'Wyłącz kartę Expensify',
                disableCardPrompt: 'Nie możesz wyłączyć karty Expensify, ponieważ jest już używana. Skontaktuj się z Concierge, aby uzyskać dalsze instrukcje.',
                disableCardButton: 'Czat z Concierge',
                feed: {
                    title: 'Zdobądź kartę Expensify',
                    subTitle: 'Usprawnij swoje wydatki biznesowe i zaoszczędź do 50% na rachunku Expensify, a ponadto:',
                    features: {
                        cashBack: 'Zwrot gotówki przy każdym zakupie w USA',
                        unlimited: 'Nielimitowane karty wirtualne',
                        spend: 'Kontrola wydatków i niestandardowe limity',
                    },
                    ctaTitle: 'Wydaj nową kartę',
                },
            },
            companyCards: {
                title: 'Karty firmowe',
                subtitle: 'Importuj wydatki z istniejących kart firmowych.',
                feed: {
                    title: 'Importuj karty firmowe',
                    features: {
                        support: 'Obsługa wszystkich głównych dostawców kart',
                        assignCards: 'Przypisz karty do całego zespołu',
                        automaticImport: 'Automatyczny import transakcji',
                    },
                },
                disableCardTitle: 'Wyłącz karty firmowe',
                disableCardPrompt: 'Nie możesz wyłączyć kart firmowych, ponieważ ta funkcja jest w użyciu. Skontaktuj się z Concierge, aby uzyskać dalsze instrukcje.',
                disableCardButton: 'Czat z Concierge',
                cardDetails: 'Szczegóły karty',
                cardNumber: 'Numer karty',
                cardholder: 'Posiadacz karty',
                cardName: 'Nazwa karty',
                integrationExport: function (_a) {
                    var integration = _a.integration, type = _a.type;
                    return (integration && type ? "".concat(integration, " ").concat(type.toLowerCase(), " eksport") : "eksport ".concat(integration));
                },
                integrationExportTitleFirstPart: function (_a) {
                    var integration = _a.integration;
                    return "Wybierz konto ".concat(integration, ", do kt\u00F3rego transakcje powinny by\u0107 eksportowane.");
                },
                integrationExportTitlePart: 'Wybierz inny',
                integrationExportTitleLinkPart: 'opcja eksportu',
                integrationExportTitleSecondPart: 'aby zmienić dostępne konta.',
                lastUpdated: 'Ostatnia aktualizacja',
                transactionStartDate: 'Data rozpoczęcia transakcji',
                updateCard: 'Zaktualizuj kartę',
                unassignCard: 'Usuń przypisanie karty',
                unassign: 'Odznacz',
                unassignCardDescription: 'Odpięcie tej karty spowoduje usunięcie wszystkich transakcji na raportach roboczych z konta posiadacza karty.',
                assignCard: 'Przypisz kartę',
                cardFeedName: 'Nazwa kanału kartowego',
                cardFeedNameDescription: 'Nadaj kanałowi kart unikalną nazwę, abyś mógł go odróżnić od innych.',
                cardFeedTransaction: 'Usuń transakcje',
                cardFeedTransactionDescription: 'Wybierz, czy posiadacze kart mogą usuwać transakcje kartowe. Nowe transakcje będą przestrzegać tych zasad.',
                cardFeedRestrictDeletingTransaction: 'Ogranicz usuwanie transakcji',
                cardFeedAllowDeletingTransaction: 'Zezwól na usuwanie transakcji',
                removeCardFeed: 'Usuń kartę z kanału',
                removeCardFeedTitle: function (_a) {
                    var feedName = _a.feedName;
                    return "Usu\u0144 kana\u0142 ".concat(feedName);
                },
                removeCardFeedDescription: 'Czy na pewno chcesz usunąć ten kanał kart? Spowoduje to odłączenie wszystkich kart.',
                error: {
                    feedNameRequired: 'Nazwa kanału karty jest wymagana',
                    statementCloseDateRequired: 'Wybierz datę zamknięcia wyciągu.',
                },
                corporate: 'Ogranicz usuwanie transakcji',
                personal: 'Zezwól na usuwanie transakcji',
                setFeedNameDescription: 'Nadaj kanałowi kart unikalną nazwę, abyś mógł go odróżnić od innych.',
                setTransactionLiabilityDescription: 'Po włączeniu posiadacze kart mogą usuwać transakcje kartowe. Nowe transakcje będą podlegać tej zasadzie.',
                emptyAddedFeedTitle: 'Przypisz firmowe karty',
                emptyAddedFeedDescription: 'Rozpocznij, przypisując swoją pierwszą kartę członkowi.',
                pendingFeedTitle: "Przegl\u0105damy Twoj\u0105 pro\u015Bb\u0119...",
                pendingFeedDescription: "Obecnie przegl\u0105damy szczeg\u00F3\u0142y Twojego kana\u0142u. Gdy to zrobimy, skontaktujemy si\u0119 z Tob\u0105 przez",
                pendingBankTitle: 'Sprawdź okno przeglądarki',
                pendingBankDescription: function (_a) {
                    var bankName = _a.bankName;
                    return "Prosz\u0119 po\u0142\u0105czy\u0107 si\u0119 z ".concat(bankName, " za pomoc\u0105 okna przegl\u0105darki, kt\u00F3re w\u0142a\u015Bnie si\u0119 otworzy\u0142o. Je\u015Bli si\u0119 nie otworzy\u0142o,");
                },
                pendingBankLink: 'proszę kliknij tutaj',
                giveItNameInstruction: 'Nadaj karcie nazwę, która wyróżni ją spośród innych.',
                updating: 'Aktualizowanie...',
                noAccountsFound: 'Nie znaleziono kont',
                defaultCard: 'Domyślna karta',
                downgradeTitle: "Nie mo\u017Cna obni\u017Cy\u0107 poziomu workspace.",
                downgradeSubTitleFirstPart: "Tego miejsca pracy nie mo\u017Cna obni\u017Cy\u0107, poniewa\u017C jest po\u0142\u0105czonych wiele kana\u0142\u00F3w kart (z wy\u0142\u0105czeniem kart Expensify). Prosz\u0119",
                downgradeSubTitleMiddlePart: "zachowaj tylko jeden kana\u0142 kart",
                downgradeSubTitleLastPart: 'aby kontynuować.',
                noAccountsFoundDescription: function (_a) {
                    var connection = _a.connection;
                    return "Prosz\u0119 doda\u0107 konto w ".concat(connection, " i ponownie zsynchronizowa\u0107 po\u0142\u0105czenie.");
                },
                expensifyCardBannerTitle: 'Zdobądź kartę Expensify',
                expensifyCardBannerSubtitle: 'Ciesz się zwrotem gotówki przy każdym zakupie w USA, do 50% zniżki na rachunek Expensify, nielimitowanymi kartami wirtualnymi i wieloma innymi korzyściami.',
                expensifyCardBannerLearnMoreButton: 'Dowiedz się więcej',
                statementCloseDateTitle: 'Data zamknięcia oświadczenia',
                statementCloseDateDescription: 'Poinformuj nas o zamknięciu wyciągu z karty, a my utworzymy pasujący wyciąg w Expensify.',
            },
            workflows: {
                title: 'Przepływy pracy',
                subtitle: 'Skonfiguruj, jak wydatki są zatwierdzane i opłacane.',
                disableApprovalPrompt: 'Karty Expensify z tego obszaru roboczego obecnie polegają na zatwierdzeniu, aby określić ich Inteligentne Limity. Proszę zmienić typy limitów dla wszystkich Kart Expensify z Inteligentnymi Limitami przed wyłączeniem zatwierdzeń.',
            },
            invoices: {
                title: 'Faktury',
                subtitle: 'Wysyłaj i odbieraj faktury.',
            },
            categories: {
                title: 'Kategorie',
                subtitle: 'Śledź i organizuj wydatki.',
            },
            tags: {
                title: 'Tagi',
                subtitle: 'Klasyfikuj koszty i śledź wydatki podlegające fakturowaniu.',
            },
            taxes: {
                title: 'Podatki',
                subtitle: 'Dokumentuj i odzyskuj kwalifikujące się podatki.',
            },
            reportFields: {
                title: 'Pola raportu',
                subtitle: 'Skonfiguruj niestandardowe pola dla wydatków.',
            },
            connections: {
                title: 'Księgowość',
                subtitle: 'Synchronizuj swój plan kont i więcej.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'Nie tak szybko...',
                featureEnabledText: 'Aby włączyć lub wyłączyć tę funkcję, musisz zmienić ustawienia importu księgowego.',
                disconnectText: 'Aby wyłączyć księgowość, musisz odłączyć swoje połączenie księgowe od przestrzeni roboczej.',
                manageSettings: 'Zarządzaj ustawieniami',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'Nie tak szybko...',
                featureEnabledText: 'Karty Expensify w tym obszarze roboczym polegają na przepływach zatwierdzeń, aby określić ich Inteligentne Limity.\n\nProszę zmienić typy limitów na kartach z Inteligentnymi Limitami przed wyłączeniem przepływów pracy.',
                confirmText: 'Przejdź do kart Expensify',
            },
            rules: {
                title: 'Zasady',
                subtitle: 'Wymagaj paragonów, oznaczaj wysokie wydatki i więcej.',
            },
        },
        reportFields: {
            addField: 'Dodaj pole',
            delete: 'Usuń pole',
            deleteFields: 'Usuń pola',
            findReportField: 'Znajdź pole raportu',
            deleteConfirmation: 'Czy na pewno chcesz usunąć to pole raportu?',
            deleteFieldsConfirmation: 'Czy na pewno chcesz usunąć te pola raportu?',
            emptyReportFields: {
                title: 'Nie utworzyłeś żadnych pól raportu',
                subtitle: 'Dodaj niestandardowe pole (tekstowe, daty lub rozwijane), które pojawia się w raportach.',
            },
            subtitle: 'Pola raportu mają zastosowanie do wszystkich wydatków i mogą być pomocne, gdy chcesz poprosić o dodatkowe informacje.',
            disableReportFields: 'Wyłącz pola raportu',
            disableReportFieldsConfirmation: 'Czy jesteś pewien? Pola tekstowe i daty zostaną usunięte, a listy zostaną wyłączone.',
            importedFromAccountingSoftware: 'Pola raportu poniżej są importowane z Twojego',
            textType: 'Tekst',
            dateType: 'Data',
            dropdownType: 'Lista',
            textAlternateText: 'Dodaj pole do swobodnego wprowadzania tekstu.',
            dateAlternateText: 'Dodaj kalendarz do wyboru daty.',
            dropdownAlternateText: 'Dodaj listę opcji do wyboru.',
            nameInputSubtitle: 'Wybierz nazwę dla pola raportu.',
            typeInputSubtitle: 'Wybierz, jakiego typu pola raportu chcesz użyć.',
            initialValueInputSubtitle: 'Wprowadź wartość początkową do wyświetlenia w polu raportu.',
            listValuesInputSubtitle: 'Te wartości pojawią się w rozwijanym polu raportu. Włączone wartości mogą być wybierane przez członków.',
            listInputSubtitle: 'Te wartości pojawią się na liście pól w Twoim raporcie. Włączone wartości mogą być wybierane przez członków.',
            deleteValue: 'Usuń wartość',
            deleteValues: 'Usuń wartości',
            disableValue: 'Wyłącz wartość',
            disableValues: 'Wyłącz wartości',
            enableValue: 'Włącz wartość',
            enableValues: 'Włącz wartości',
            emptyReportFieldsValues: {
                title: 'Nie utworzyłeś żadnych wartości listy',
                subtitle: 'Dodaj niestandardowe wartości, które mają pojawić się w raportach.',
            },
            deleteValuePrompt: 'Czy na pewno chcesz usunąć tę wartość z listy?',
            deleteValuesPrompt: 'Czy na pewno chcesz usunąć te wartości listy?',
            listValueRequiredError: 'Proszę wprowadzić nazwę wartości listy',
            existingListValueError: 'Wartość listy o tej nazwie już istnieje',
            editValue: 'Edytuj wartość',
            listValues: 'Wymień wartości',
            addValue: 'Dodaj wartość',
            existingReportFieldNameError: 'Pole raportu o tej nazwie już istnieje',
            reportFieldNameRequiredError: 'Proszę wprowadzić nazwę pola raportu',
            reportFieldTypeRequiredError: 'Proszę wybrać typ pola raportu',
            reportFieldInitialValueRequiredError: 'Proszę wybrać początkową wartość pola raportu',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizacji pola raportu. Proszę spróbować ponownie.',
        },
        tags: {
            tagName: 'Nazwa tagu',
            requiresTag: 'Członkowie muszą oznaczać wszystkie wydatki',
            trackBillable: 'Śledź wydatki podlegające rozliczeniu',
            customTagName: 'Niestandardowa nazwa tagu',
            enableTag: 'Włącz tag',
            enableTags: 'Włącz tagi',
            requireTag: 'Wymagaj tagu',
            requireTags: 'Wymagane tagi',
            notRequireTags: 'Nie wymagaj',
            disableTag: 'Wyłącz tag',
            disableTags: 'Wyłącz tagi',
            addTag: 'Dodaj tag',
            editTag: 'Edytuj tag',
            editTags: 'Edytuj tagi',
            findTag: 'Znajdź tag',
            subtitle: 'Tagi dodają bardziej szczegółowe sposoby klasyfikacji kosztów.',
            dependentMultiLevelTagsSubtitle: {
                phrase1: 'Używasz',
                phrase2: 'tagi zależne',
                phrase3: '. Możesz',
                phrase4: 'ponownie zaimportuj arkusz kalkulacyjny',
                phrase5: 'aby zaktualizować swoje tagi.',
            },
            emptyTags: {
                title: 'Nie utworzyłeś żadnych tagów',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'Dodaj tag, aby śledzić projekty, lokalizacje, działy i inne.',
                subtitle1: 'Zaimportuj arkusz kalkulacyjny, aby dodać tagi do śledzenia projektów, lokalizacji, działów i innych.',
                subtitle2: 'Dowiedz się więcej',
                subtitle3: 'about formatting tag files.',
            },
            emptyTagsWithAccounting: {
                subtitle1: 'Twoje tagi są obecnie importowane z połączenia księgowego. Przejdź do',
                subtitle2: 'księgowość',
                subtitle3: 'aby wprowadzić jakiekolwiek zmiany.',
            },
            deleteTag: 'Usuń tag',
            deleteTags: 'Usuń tagi',
            deleteTagConfirmation: 'Czy na pewno chcesz usunąć ten tag?',
            deleteTagsConfirmation: 'Czy na pewno chcesz usunąć te tagi?',
            deleteFailureMessage: 'Wystąpił błąd podczas usuwania tagu, spróbuj ponownie.',
            tagRequiredError: 'Nazwa tagu jest wymagana',
            existingTagError: 'Tag o tej nazwie już istnieje',
            invalidTagNameError: 'Nazwa tagu nie może być 0. Proszę wybrać inną wartość.',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizacji tagu, spróbuj ponownie.',
            importedFromAccountingSoftware: 'Tagi poniżej są importowane z twojego',
            glCode: 'Kod GL',
            updateGLCodeFailureMessage: 'Wystąpił błąd podczas aktualizacji kodu GL, spróbuj ponownie.',
            tagRules: 'Zasady tagów',
            approverDescription: 'Aprobujący',
            importTags: 'Importuj tagi',
            importTagsSupportingText: 'Koduj swoje wydatki za pomocą jednego rodzaju tagu lub wielu.',
            configureMultiLevelTags: 'Skonfiguruj swoją listę tagów do tagowania wielopoziomowego.',
            importMultiLevelTagsSupportingText: "Oto podgl\u0105d Twoich tag\u00F3w. Je\u015Bli wszystko wygl\u0105da dobrze, kliknij poni\u017Cej, aby je zaimportowa\u0107.",
            importMultiLevelTags: {
                firstRowTitle: 'Pierwszy wiersz to tytuł dla każdej listy tagów',
                independentTags: 'Są to niezależne tagi',
                glAdjacentColumn: 'W sąsiedniej kolumnie znajduje się kod GL',
            },
            tagLevel: {
                singleLevel: 'Pojedynczy poziom tagów',
                multiLevel: 'Wielopoziomowe tagi',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'Przełącz poziomy tagów',
                prompt1: 'Zmiana poziomów tagów spowoduje usunięcie wszystkich bieżących tagów.',
                prompt2: 'Sugerujemy najpierw',
                prompt3: 'pobierz kopię zapasową',
                prompt4: 'poprzez eksportowanie swoich tagów.',
                prompt5: 'Dowiedz się więcej',
                prompt6: 'o poziomach tagów.',
            },
            importedTagsMessage: function (_a) {
                var columnCounts = _a.columnCounts;
                return "Znale\u017Ali\u015Bmy *".concat(columnCounts, " kolumny* w Twoim arkuszu kalkulacyjnym. Wybierz *Nazwa* obok kolumny, kt\u00F3ra zawiera nazwy tag\u00F3w. Mo\u017Cesz r\u00F3wnie\u017C wybra\u0107 *W\u0142\u0105czone* obok kolumny, kt\u00F3ra ustawia status tag\u00F3w.");
            },
            cannotDeleteOrDisableAllTags: {
                title: 'Nie można usunąć ani wyłączyć wszystkich tagów',
                description: "Co najmniej jeden tag musi pozosta\u0107 w\u0142\u0105czony, poniewa\u017C twoje miejsce pracy wymaga tag\u00F3w.",
            },
            cannotMakeAllTagsOptional: {
                title: 'Nie można ustawić wszystkich tagów jako opcjonalne.',
                description: "Co najmniej jeden tag musi pozosta\u0107 wymagany, poniewa\u017C ustawienia Twojego miejsca pracy wymagaj\u0105 tag\u00F3w.",
            },
            tagCount: function () { return ({
                one: '1 dzień',
                other: function (count) { return "".concat(count, " tagi"); },
            }); },
        },
        taxes: {
            subtitle: 'Dodaj nazwy podatków, stawki i ustaw domyślne.',
            addRate: 'Dodaj stawkę',
            workspaceDefault: 'Domyślna waluta przestrzeni roboczej',
            foreignDefault: 'Domyślna waluta obca',
            customTaxName: 'Niestandardowa nazwa podatku',
            value: 'Wartość',
            taxReclaimableOn: 'Podatek do odzyskania na',
            taxRate: 'Stawka podatkowa',
            findTaxRate: 'Znajdź stawkę podatkową',
            error: {
                taxRateAlreadyExists: 'Ta nazwa podatku jest już w użyciu',
                taxCodeAlreadyExists: 'Ten kod podatkowy jest już w użyciu',
                valuePercentageRange: 'Proszę wprowadzić prawidłowy procent pomiędzy 0 a 100',
                customNameRequired: 'Nazwa niestandardowego podatku jest wymagana',
                deleteFailureMessage: 'Wystąpił błąd podczas usuwania stawki podatkowej. Spróbuj ponownie lub poproś o pomoc Concierge.',
                updateFailureMessage: 'Wystąpił błąd podczas aktualizacji stawki podatkowej. Spróbuj ponownie lub poproś o pomoc Concierge.',
                createFailureMessage: 'Wystąpił błąd podczas tworzenia stawki podatkowej. Spróbuj ponownie lub poproś o pomoc Concierge.',
                updateTaxClaimableFailureMessage: 'Część podlegająca zwrotowi musi być mniejsza niż kwota stawki za odległość',
            },
            deleteTaxConfirmation: 'Czy na pewno chcesz usunąć ten podatek?',
            deleteMultipleTaxConfirmation: function (_a) {
                var taxAmount = _a.taxAmount;
                return "Czy na pewno chcesz usun\u0105\u0107 podatki w wysoko\u015Bci ".concat(taxAmount, "?");
            },
            actions: {
                delete: 'Usuń stawkę',
                deleteMultiple: 'Usuń stawki',
                enable: 'Włącz stawkę',
                disable: 'Wyłącz stawkę',
                enableTaxRates: function () { return ({
                    one: 'Włącz stawkę',
                    other: 'Włącz stawki',
                }); },
                disableTaxRates: function () { return ({
                    one: 'Wyłącz stawkę',
                    other: 'Wyłącz stawki',
                }); },
            },
            importedFromAccountingSoftware: 'Poniższe podatki są importowane z Twojego',
            taxCode: 'Kod podatkowy',
            updateTaxCodeFailureMessage: 'Wystąpił błąd podczas aktualizacji kodu podatkowego, spróbuj ponownie.',
        },
        emptyWorkspace: {
            title: 'Utwórz przestrzeń roboczą',
            subtitle: 'Utwórz przestrzeń roboczą do śledzenia paragonów, zwracania wydatków, zarządzania podróżami, wysyłania faktur i nie tylko — wszystko z prędkością czatu.',
            createAWorkspaceCTA: 'Rozpocznij',
            features: {
                trackAndCollect: 'Śledź i zbieraj paragony',
                reimbursements: 'Zwróć koszty pracownikom',
                companyCards: 'Zarządzaj kartami firmowymi',
            },
            notFound: 'Nie znaleziono przestrzeni roboczej',
            description: 'Pokoje to świetne miejsce do dyskusji i pracy z wieloma osobami. Aby rozpocząć współpracę, utwórz lub dołącz do przestrzeni roboczej.',
        },
        new: {
            newWorkspace: 'Nowe miejsce pracy',
            getTheExpensifyCardAndMore: 'Zdobądź kartę Expensify i więcej',
            confirmWorkspace: 'Potwierdź przestrzeń roboczą',
            myGroupWorkspace: function (_a) {
                var workspaceNumber = _a.workspaceNumber;
                return "Moja przestrze\u0144 robocza grupy".concat(workspaceNumber ? " ".concat(workspaceNumber) : '');
            },
            workspaceName: function (_a) {
                var userName = _a.userName, workspaceNumber = _a.workspaceNumber;
                return "Workspace u\u017Cytkownika ".concat(userName).concat(workspaceNumber ? " ".concat(workspaceNumber) : '');
            },
        },
        people: {
            genericFailureMessage: 'Wystąpił błąd podczas usuwania członka z przestrzeni roboczej, spróbuj ponownie.',
            removeMembersPrompt: function (_a) {
                var memberName = _a.memberName;
                return ({
                    one: "Czy na pewno chcesz usun\u0105\u0107 ".concat(memberName, "?"),
                    other: 'Czy na pewno chcesz usunąć tych członków?',
                });
            },
            removeMembersWarningPrompt: function (_a) {
                var memberName = _a.memberName, ownerName = _a.ownerName;
                return "".concat(memberName, " jest osob\u0105 zatwierdzaj\u0105c\u0105 w tej przestrzeni roboczej. Gdy przestaniesz udost\u0119pnia\u0107 im t\u0119 przestrze\u0144 robocz\u0105, zast\u0105pimy ich w procesie zatwierdzania w\u0142a\u015Bcicielem przestrzeni roboczej, ").concat(ownerName);
            },
            removeMembersTitle: function () { return ({
                one: 'Usuń członka',
                other: 'Usuń członków',
            }); },
            findMember: 'Znajdź członka',
            removeWorkspaceMemberButtonTitle: 'Usuń z przestrzeni roboczej',
            removeGroupMemberButtonTitle: 'Usuń z grupy',
            removeRoomMemberButtonTitle: 'Usuń z czatu',
            removeMemberPrompt: function (_a) {
                var memberName = _a.memberName;
                return "Czy na pewno chcesz usun\u0105\u0107 ".concat(memberName, "?");
            },
            removeMemberTitle: 'Usuń członka',
            transferOwner: 'Przenieś właściciela',
            makeMember: 'Uczyń członkiem',
            makeAdmin: 'Ustaw jako administratora',
            makeAuditor: 'Utwórz audytora',
            selectAll: 'Zaznacz wszystko',
            error: {
                genericAdd: 'Wystąpił problem z dodaniem tego członka przestrzeni roboczej',
                cannotRemove: 'Nie możesz usunąć siebie ani właściciela przestrzeni roboczej.',
                genericRemove: 'Wystąpił problem z usunięciem tego członka przestrzeni roboczej',
            },
            addedWithPrimary: 'Niektórzy członkowie zostali dodani z ich głównymi loginami.',
            invitedBySecondaryLogin: function (_a) {
                var secondaryLogin = _a.secondaryLogin;
                return "Dodane przez dodatkowe logowanie ".concat(secondaryLogin, ".");
            },
            membersListTitle: 'Katalog wszystkich członków przestrzeni roboczej.',
            importMembers: 'Importuj członków',
        },
        card: {
            getStartedIssuing: 'Rozpocznij, wydając swoją pierwszą wirtualną lub fizyczną kartę.',
            issueCard: 'Wydaj kartę',
            issueNewCard: {
                whoNeedsCard: 'Kto potrzebuje karty?',
                findMember: 'Znajdź członka',
                chooseCardType: 'Wybierz typ karty',
                physicalCard: 'Fizyczna karta',
                physicalCardDescription: 'Świetne dla częstego wydawcy',
                virtualCard: 'Wirtualna karta',
                virtualCardDescription: 'Natychmiastowy i elastyczny',
                chooseLimitType: 'Wybierz typ limitu',
                smartLimit: 'Inteligentny Limit',
                smartLimitDescription: 'Wydaj do określonej kwoty przed wymaganiem zatwierdzenia',
                monthly: 'Miesięczny',
                monthlyDescription: 'Wydawaj do określonej kwoty miesięcznie',
                fixedAmount: 'Stała kwota',
                fixedAmountDescription: 'Wydaj do określonej kwoty jednorazowo',
                setLimit: 'Ustaw limit',
                cardLimitError: 'Proszę wprowadzić kwotę mniejszą niż $21,474,836',
                giveItName: 'Nadaj mu nazwę',
                giveItNameInstruction: 'Uczyń ją na tyle unikalną, aby można było ją odróżnić od innych kart. Konkretne przypadki użycia są jeszcze lepsze!',
                cardName: 'Nazwa karty',
                letsDoubleCheck: 'Sprawdźmy jeszcze raz, czy wszystko wygląda dobrze.',
                willBeReady: 'Ta karta będzie gotowa do użycia natychmiast.',
                cardholder: 'Posiadacz karty',
                cardType: 'Typ karty',
                limit: 'Limit',
                limitType: 'Typ limitu',
                name: 'Imię',
            },
            deactivateCardModal: {
                deactivate: 'Dezaktywuj',
                deactivateCard: 'Dezaktywuj kartę',
                deactivateConfirmation: 'Dezaktywacja tej karty spowoduje odrzucenie wszystkich przyszłych transakcji i nie można tego cofnąć.',
            },
        },
        accounting: {
            settings: 'ustawienia',
            title: 'Połączenia',
            subtitle: 'Połącz się ze swoim systemem księgowym, aby kodować transakcje za pomocą planu kont, automatycznie dopasowywać płatności i utrzymywać synchronizację finansów.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: 'Porozmawiaj ze swoim specjalistą ds. konfiguracji.',
            talkYourAccountManager: 'Porozmawiaj ze swoim menedżerem konta.',
            talkToConcierge: 'Czat z Concierge.',
            needAnotherAccounting: 'Potrzebujesz innego oprogramowania księgowego?',
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
            errorODIntegration: 'Wystąpił błąd z połączeniem skonfigurowanym w Expensify Classic.',
            goToODToFix: 'Przejdź do Expensify Classic, aby rozwiązać ten problem.',
            goToODToSettings: 'Przejdź do Expensify Classic, aby zarządzać swoimi ustawieniami.',
            setup: 'Połącz',
            lastSync: function (_a) {
                var relativeDate = _a.relativeDate;
                return "Ostatnia synchronizacja ".concat(relativeDate);
            },
            notSync: 'Nie zsynchronizowano',
            import: 'Importuj',
            export: 'Eksportuj',
            advanced: 'Zaawansowany',
            other: 'Inne',
            syncNow: 'Synchronizuj teraz',
            disconnect: 'Odłącz',
            reinstall: 'Ponownie zainstaluj łącznik',
            disconnectTitle: function (_a) {
                var _b = _a === void 0 ? {} : _a, connectionName = _b.connectionName;
                var integrationName = connectionName && CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'integracja';
                return "Od\u0142\u0105cz ".concat(integrationName);
            },
            connectTitle: function (_a) {
                var _b;
                var connectionName = _a.connectionName;
                return "Po\u0142\u0105cz ".concat((_b = CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]) !== null && _b !== void 0 ? _b : 'integracja księgowa');
            },
            syncError: function (_a) {
                var connectionName = _a.connectionName;
                switch (connectionName) {
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.QBO:
                        return 'Nie można połączyć się z QuickBooks Online';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Nie można połączyć się z Xero';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'Nie można połączyć się z NetSuite';
                    case CONST_1.default.POLICY.CONNECTIONS.NAME.QBD:
                        return 'Nie można połączyć się z QuickBooks Desktop';
                    default: {
                        return 'Nie można połączyć się z integracją';
                    }
                }
            },
            accounts: 'Plan kont',
            taxes: 'Podatki',
            imported: 'Zaimportowano',
            notImported: 'Nie zaimportowano',
            importAsCategory: 'Zaimportowano jako kategorie',
            importTypes: (_5 = {},
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED] = 'Zaimportowano',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.TAG] = 'Zaimportowano jako tagi',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT] = 'Zaimportowano',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED] = 'Nie zaimportowano',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NONE] = 'Nie zaimportowano',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD] = 'Zaimportowane jako pola raportu',
                _5[CONST_1.default.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT] = 'Domyślne ustawienia pracownika NetSuite',
                _5),
            disconnectPrompt: function (_a) {
                var _b = _a === void 0 ? {} : _a, connectionName = _b.connectionName;
                var integrationName = connectionName && CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'ta integracja';
                return "Czy na pewno chcesz od\u0142\u0105czy\u0107 ".concat(integrationName, "?");
            },
            connectPrompt: function (_a) {
                var _b;
                var connectionName = _a.connectionName;
                return "Czy na pewno chcesz po\u0142\u0105czy\u0107 ".concat((_b = CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]) !== null && _b !== void 0 ? _b : 'ta integracja księgowa', "? Spowoduje to usuni\u0119cie wszystkich istniej\u0105cych po\u0142\u0105cze\u0144 ksi\u0119gowych.");
            },
            enterCredentials: 'Wprowadź swoje dane uwierzytelniające',
            connections: {
                syncStageName: function (_a) {
                    var stage = _a.stage;
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'Importowanie klientów';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return 'Importowanie pracowników';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Importowanie kont';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'Importowanie klas';
                        case 'quickbooksOnlineImportLocations':
                            return 'Importowanie lokalizacji';
                        case 'quickbooksOnlineImportProcessing':
                            return 'Przetwarzanie zaimportowanych danych';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return 'Synchronizowanie zrefundowanych raportów i płatności rachunków';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Importowanie kodów podatkowych';
                        case 'quickbooksOnlineCheckConnection':
                            return 'Sprawdzanie połączenia z QuickBooks Online';
                        case 'quickbooksOnlineImportMain':
                            return 'Importowanie danych z QuickBooks Online';
                        case 'startingImportXero':
                            return 'Importowanie danych Xero';
                        case 'startingImportQBO':
                            return 'Importowanie danych z QuickBooks Online';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'Importowanie danych QuickBooks Desktop';
                        case 'quickbooksDesktopImportTitle':
                            return 'Importowanie tytułu';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Importowanie certyfikatu zatwierdzenia';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Importowanie wymiarów';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Importowanie zapisanej polityki';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'Nadal synchronizujemy dane z QuickBooks... Upewnij się, że Web Connector jest uruchomiony';
                        case 'quickbooksOnlineSyncTitle':
                            return 'Synchronizowanie danych z QuickBooks Online';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Ładowanie danych';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Aktualizowanie kategorii';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'Aktualizowanie klientów/projektów';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Aktualizowanie listy osób';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Aktualizowanie pól raportu';
                        case 'jobDone':
                            return 'Oczekiwanie na załadowanie zaimportowanych danych';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Synchronizowanie planu kont';
                        case 'xeroSyncImportCategories':
                            return 'Synchronizowanie kategorii';
                        case 'xeroSyncImportCustomers':
                            return 'Synchronizowanie klientów';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Oznaczanie raportów Expensify jako zrefundowane';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Oznaczanie rachunków i faktur Xero jako opłacone';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Synchronizowanie kategorii śledzenia';
                        case 'xeroSyncImportBankAccounts':
                            return 'Synchronizacja kont bankowych';
                        case 'xeroSyncImportTaxRates':
                            return 'Synchronizowanie stawek podatkowych';
                        case 'xeroCheckConnection':
                            return 'Sprawdzanie połączenia z Xero';
                        case 'xeroSyncTitle':
                            return 'Synchronizowanie danych Xero';
                        case 'netSuiteSyncConnection':
                            return 'Inicjowanie połączenia z NetSuite';
                        case 'netSuiteSyncCustomers':
                            return 'Importowanie klientów';
                        case 'netSuiteSyncInitData':
                            return 'Pobieranie danych z NetSuite';
                        case 'netSuiteSyncImportTaxes':
                            return 'Importowanie podatków';
                        case 'netSuiteSyncImportItems':
                            return 'Importowanie elementów';
                        case 'netSuiteSyncData':
                            return 'Importowanie danych do Expensify';
                        case 'netSuiteSyncAccounts':
                            return 'Synchronizowanie kont';
                        case 'netSuiteSyncCurrencies':
                            return 'Synchronizowanie walut';
                        case 'netSuiteSyncCategories':
                            return 'Synchronizowanie kategorii';
                        case 'netSuiteSyncReportFields':
                            return 'Importowanie danych jako pola raportu Expensify';
                        case 'netSuiteSyncTags':
                            return 'Importowanie danych jako tagi Expensify';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Aktualizowanie informacji o połączeniu';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Oznaczanie raportów Expensify jako zrefundowane';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'Oznaczanie rachunków i faktur NetSuite jako opłacone';
                        case 'netSuiteImportVendorsTitle':
                            return 'Importowanie dostawców';
                        case 'netSuiteImportCustomListsTitle':
                            return 'Importowanie niestandardowych list';
                        case 'netSuiteSyncImportCustomLists':
                            return 'Importowanie niestandardowych list';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Importowanie jednostek zależnych';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Importowanie dostawców';
                        case 'intacctCheckConnection':
                            return 'Sprawdzanie połączenia z Sage Intacct';
                        case 'intacctImportDimensions':
                            return 'Importowanie wymiarów Sage Intacct';
                        case 'intacctImportTitle':
                            return 'Importowanie danych Sage Intacct';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return "Brak t\u0142umaczenia dla etapu: ".concat(stage);
                        }
                    }
                },
            },
            preferredExporter: 'Preferowany eksporter',
            exportPreferredExporterNote: 'Preferowany eksporter może być dowolnym administratorem przestrzeni roboczej, ale musi być również administratorem domeny, jeśli ustawisz różne konta eksportu dla indywidualnych kart firmowych w ustawieniach domeny.',
            exportPreferredExporterSubNote: 'Po ustawieniu preferowany eksporter zobaczy raporty do eksportu na swoim koncie.',
            exportAs: 'Eksportuj jako',
            exportOutOfPocket: 'Eksportuj wydatki z własnej kieszeni jako',
            exportCompanyCard: 'Eksportuj wydatki na firmową kartę jako',
            exportDate: 'Data eksportu',
            defaultVendor: 'Domyślny dostawca',
            autoSync: 'Auto-sync',
            autoSyncDescription: 'Synchronizuj NetSuite i Expensify automatycznie, każdego dnia. Eksportuj sfinalizowany raport w czasie rzeczywistym.',
            reimbursedReports: 'Synchronizuj zrefundowane raporty',
            cardReconciliation: 'Rekonsyliacja karty',
            reconciliationAccount: 'Konto uzgadniające',
            continuousReconciliation: 'Ciągła rekonsyliacja',
            saveHoursOnReconciliation: 'Zaoszczędź godziny na uzgadnianiu w każdym okresie rozliczeniowym, pozwalając Expensify na ciągłe uzgadnianie wyciągów i rozliczeń z karty Expensify w Twoim imieniu.',
            enableContinuousReconciliation: 'Aby włączyć Ciągłą Rekoncyliację, proszę włączyć',
            chooseReconciliationAccount: {
                chooseBankAccount: 'Wybierz konto bankowe, z którym będą uzgadniane płatności kartą Expensify.',
                accountMatches: 'Upewnij się, że to konto pasuje do Twojego',
                settlementAccount: 'Konto rozliczeniowe karty Expensify',
                reconciliationWorks: function (_a) {
                    var lastFourPAN = _a.lastFourPAN;
                    return "(ko\u0144cz\u0105cy si\u0119 na ".concat(lastFourPAN, "), aby Ci\u0105g\u0142a Rekonsyliacja dzia\u0142a\u0142a poprawnie.");
                },
            },
        },
        export: {
            notReadyHeading: 'Nie gotowy do eksportu',
            notReadyDescription: 'Robocze lub oczekujące raporty wydatków nie mogą być eksportowane do systemu księgowego. Proszę zatwierdzić lub opłacić te wydatki przed ich eksportem.',
        },
        invoices: {
            sendInvoice: 'Wyślij fakturę',
            sendFrom: 'Wyślij z',
            invoicingDetails: 'Szczegóły fakturowania',
            invoicingDetailsDescription: 'Te informacje pojawią się na Twoich fakturach.',
            companyName: 'Nazwa firmy',
            companyWebsite: 'Strona internetowa firmy',
            paymentMethods: {
                personal: 'Osobiste',
                business: 'Biznes',
                chooseInvoiceMethod: 'Wybierz metodę płatności poniżej:',
                addBankAccount: 'Dodaj konto bankowe',
                payingAsIndividual: 'Płacenie jako osoba fizyczna',
                payingAsBusiness: 'Płacenie jako firma',
            },
            invoiceBalance: 'Saldo faktury',
            invoiceBalanceSubtitle: 'To jest Twój aktualny stan konta z tytułu zbierania płatności za faktury. Zostanie on automatycznie przelany na Twoje konto bankowe, jeśli je dodałeś.',
            bankAccountsSubtitle: 'Dodaj konto bankowe, aby dokonywać i otrzymywać płatności za faktury.',
        },
        invite: {
            member: 'Zaproś członka',
            members: 'Zaproś członków',
            invitePeople: 'Zaproś nowych członków',
            genericFailureMessage: 'Wystąpił błąd podczas zapraszania członka do przestrzeni roboczej. Proszę spróbować ponownie.',
            pleaseEnterValidLogin: "Prosz\u0119 upewni\u0107 si\u0119, \u017Ce adres e-mail lub numer telefonu jest prawid\u0142owy (np. ".concat(CONST_1.default.EXAMPLE_PHONE_NUMBER, ")."),
            user: 'użytkownik',
            users: 'użytkownicy',
            invited: 'zaproszony',
            removed: 'removed',
            to: 'do',
            from: 'z',
        },
        inviteMessage: {
            confirmDetails: 'Potwierdź szczegóły',
            inviteMessagePrompt: 'Uczyń swoje zaproszenie wyjątkowym, dodając poniżej wiadomość!',
            personalMessagePrompt: 'Wiadomość',
            genericFailureMessage: 'Wystąpił błąd podczas zapraszania członka do przestrzeni roboczej. Proszę spróbować ponownie.',
            inviteNoMembersError: 'Proszę wybrać co najmniej jednego członka do zaproszenia',
            joinRequest: function (_a) {
                var user = _a.user, workspaceName = _a.workspaceName;
                return "".concat(user, " poprosi\u0142 o do\u0142\u0105czenie do ").concat(workspaceName);
            },
        },
        distanceRates: {
            oopsNotSoFast: 'Ups! Nie tak szybko...',
            workspaceNeeds: 'Przestrzeń robocza wymaga co najmniej jednej włączonej stawki za odległość.',
            distance: 'Odległość',
            centrallyManage: 'Centralnie zarządzaj stawkami, śledź w milach lub kilometrach i ustaw domyślną kategorię.',
            rate: 'Oceń',
            addRate: 'Dodaj stawkę',
            findRate: 'Znajdź stawkę',
            trackTax: 'Śledź podatek',
            deleteRates: function () { return ({
                one: 'Usuń stawkę',
                other: 'Usuń stawki',
            }); },
            enableRates: function () { return ({
                one: 'Włącz stawkę',
                other: 'Włącz stawki',
            }); },
            disableRates: function () { return ({
                one: 'Wyłącz stawkę',
                other: 'Wyłącz stawki',
            }); },
            enableRate: 'Włącz stawkę',
            status: 'Status',
            unit: 'Jednostka',
            taxFeatureNotEnabledMessage: 'Podatki muszą być włączone w przestrzeni roboczej, aby użyć tej funkcji. Przejdź do',
            changePromptMessage: 'aby dokonać tej zmiany.',
            deleteDistanceRate: 'Usuń stawkę za odległość',
            areYouSureDelete: function () { return ({
                one: 'Czy na pewno chcesz usunąć tę stawkę?',
                other: 'Czy na pewno chcesz usunąć te stawki?',
            }); },
        },
        editor: {
            descriptionInputLabel: 'Opis',
            nameInputLabel: 'Imię',
            typeInputLabel: 'Rodzaj',
            initialValueInputLabel: 'Wartość początkowa',
            nameInputHelpText: 'To jest nazwa, którą zobaczysz w swoim obszarze roboczym.',
            nameIsRequiredError: 'Musisz nadać swojej przestrzeni roboczej nazwę',
            currencyInputLabel: 'Domyślna waluta',
            currencyInputHelpText: 'Wszystkie wydatki w tej przestrzeni roboczej zostaną przeliczone na tę walutę.',
            currencyInputDisabledText: function (_a) {
                var currency = _a.currency;
                return "Domy\u015Blna waluta nie mo\u017Ce zosta\u0107 zmieniona, poniewa\u017C to miejsce pracy jest powi\u0105zane z kontem bankowym w ".concat(currency, ".");
            },
            save: 'Zapisz',
            genericFailureMessage: 'Wystąpił błąd podczas aktualizacji przestrzeni roboczej. Proszę spróbować ponownie.',
            avatarUploadFailureMessage: 'Wystąpił błąd podczas przesyłania awatara. Proszę spróbować ponownie.',
            addressContext: 'Aby włączyć Expensify Travel, wymagany jest adres Workspace. Proszę wprowadzić adres powiązany z Twoją firmą.',
        },
        bankAccount: {
            continueWithSetup: 'Kontynuuj konfigurację',
            youAreAlmostDone: 'Prawie skończyłeś konfigurowanie swojego konta bankowego, co pozwoli Ci wydawać karty firmowe, zwracać koszty, pobierać faktury i płacić rachunki.',
            streamlinePayments: 'Usprawnij płatności',
            connectBankAccountNote: 'Uwaga: Osobiste konta bankowe nie mogą być używane do płatności w przestrzeniach roboczych.',
            oneMoreThing: 'Jeszcze jedna rzecz!',
            allSet: 'Wszystko gotowe!',
            accountDescriptionWithCards: 'To konto bankowe będzie używane do wydawania kart firmowych, zwrotu kosztów, pobierania faktur i opłacania rachunków.',
            letsFinishInChat: 'Zakończmy na czacie!',
            finishInChat: 'Zakończ w czacie',
            almostDone: 'Prawie gotowe!',
            disconnectBankAccount: 'Odłącz konto bankowe',
            startOver: 'Zacznij od nowa',
            updateDetails: 'Zaktualizuj szczegóły',
            yesDisconnectMyBankAccount: 'Tak, odłącz moje konto bankowe',
            yesStartOver: 'Tak, zacznij od nowa.',
            disconnectYour: 'Odłącz swoje',
            bankAccountAnyTransactions: 'konto bankowe. Wszelkie nierozliczone transakcje dla tego konta zostaną nadal zrealizowane.',
            clearProgress: 'Rozpoczęcie od nowa spowoduje usunięcie postępów, które dotychczas osiągnąłeś.',
            areYouSure: 'Czy jesteś pewien?',
            workspaceCurrency: 'Waluta przestrzeni roboczej',
            updateCurrencyPrompt: 'Wygląda na to, że Twoje miejsce pracy jest obecnie ustawione na inną walutę niż USD. Kliknij poniższy przycisk, aby teraz zaktualizować walutę na USD.',
            updateToUSD: 'Zaktualizuj na USD',
            updateWorkspaceCurrency: 'Zaktualizuj walutę przestrzeni roboczej',
            workspaceCurrencyNotSupported: 'Waluta przestrzeni roboczej nie jest obsługiwana',
            yourWorkspace: 'Twoje miejsce pracy jest ustawione na nieobsługiwaną walutę. Zobacz',
            listOfSupportedCurrencies: 'lista obsługiwanych walut',
        },
        changeOwner: {
            changeOwnerPageTitle: 'Przenieś właściciela',
            addPaymentCardTitle: 'Wprowadź swoją kartę płatniczą, aby przenieść własność',
            addPaymentCardButtonText: 'Zaakceptuj warunki i dodaj kartę płatniczą',
            addPaymentCardReadAndAcceptTextPart1: 'Przeczytaj i zaakceptuj',
            addPaymentCardReadAndAcceptTextPart2: 'zasady dodawania karty',
            addPaymentCardTerms: 'warunki',
            addPaymentCardPrivacy: 'prywatność',
            addPaymentCardAnd: '&',
            addPaymentCardPciCompliant: 'Zgodny z PCI-DSS',
            addPaymentCardBankLevelEncrypt: 'Szyfrowanie na poziomie bankowym',
            addPaymentCardRedundant: 'Nadmierna infrastruktura',
            addPaymentCardLearnMore: 'Dowiedz się więcej o naszych',
            addPaymentCardSecurity: 'bezpieczeństwo',
            amountOwedTitle: 'Należność do zapłaty',
            amountOwedButtonText: 'OK',
            amountOwedText: 'To konto ma zaległe saldo z poprzedniego miesiąca.\n\nCzy chcesz uregulować saldo i przejąć rozliczenia tego miejsca pracy?',
            ownerOwesAmountTitle: 'Należność do zapłaty',
            ownerOwesAmountButtonText: 'Przelej saldo',
            ownerOwesAmountText: function (_a) {
                var email = _a.email, amount = _a.amount;
                return "Konto b\u0119d\u0105ce w\u0142a\u015Bcicielem tej przestrzeni roboczej (".concat(email, ") ma zaleg\u0142e saldo z poprzedniego miesi\u0105ca.\n\nCzy chcesz przela\u0107 t\u0119 kwot\u0119 (").concat(amount, "), aby przej\u0105\u0107 rozliczenia za t\u0119 przestrze\u0144 robocz\u0105? Twoja karta p\u0142atnicza zostanie obci\u0105\u017Cona natychmiast.");
            },
            subscriptionTitle: 'Przejmij roczną subskrypcję',
            subscriptionButtonText: 'Przenieś subskrypcję',
            subscriptionText: function (_a) {
                var usersCount = _a.usersCount, finalCount = _a.finalCount;
                return "Przej\u0119cie tego miejsca pracy po\u0142\u0105czy jego roczn\u0105 subskrypcj\u0119 z Twoj\u0105 obecn\u0105 subskrypcj\u0105. Spowoduje to zwi\u0119kszenie rozmiaru Twojej subskrypcji o ".concat(usersCount, " cz\u0142onk\u00F3w, co da nowy rozmiar subskrypcji wynosz\u0105cy ").concat(finalCount, ". Czy chcesz kontynuowa\u0107?");
            },
            duplicateSubscriptionTitle: 'Alert o zduplikowanej subskrypcji',
            duplicateSubscriptionButtonText: 'Kontynuuj',
            duplicateSubscriptionText: function (_a) {
                var email = _a.email, workspaceName = _a.workspaceName;
                return "Wygl\u0105da na to, \u017Ce mo\u017Cesz pr\u00F3bowa\u0107 przej\u0105\u0107 rozliczenia dla przestrzeni roboczych ".concat(email, ", ale aby to zrobi\u0107, musisz najpierw by\u0107 administratorem we wszystkich ich przestrzeniach roboczych.\n\nKliknij \"Kontynuuj\", je\u015Bli chcesz przej\u0105\u0107 rozliczenia tylko dla przestrzeni roboczej ").concat(workspaceName, ".\n\nJe\u015Bli chcesz przej\u0105\u0107 rozliczenia dla ca\u0142ej ich subskrypcji, popro\u015B ich, aby najpierw dodali Ci\u0119 jako administratora do wszystkich swoich przestrzeni roboczych, zanim przejmiesz rozliczenia.");
            },
            hasFailedSettlementsTitle: 'Nie można przenieść własności',
            hasFailedSettlementsButtonText: 'Zrozumiałem.',
            hasFailedSettlementsText: function (_a) {
                var email = _a.email;
                return "Nie mo\u017Cesz przej\u0105\u0107 rozlicze\u0144, poniewa\u017C ".concat(email, " ma zaleg\u0142e rozliczenie karty Expensify. Prosz\u0119 poprosi\u0107 t\u0119 osob\u0119 o kontakt z concierge@expensify.com w celu rozwi\u0105zania problemu. Nast\u0119pnie b\u0119dziesz m\u00F3g\u0142 przej\u0105\u0107 rozliczenia dla tego miejsca pracy.");
            },
            failedToClearBalanceTitle: 'Nie udało się wyczyścić salda',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: 'Nie udało nam się wyczyścić salda. Proszę spróbować ponownie później.',
            successTitle: 'Hurra! Wszystko gotowe.',
            successDescription: 'Jesteś teraz właścicielem tego miejsca pracy.',
            errorTitle: 'Ups! Nie tak szybko...',
            errorDescriptionPartOne: 'Wystąpił problem z przeniesieniem własności tego miejsca pracy. Spróbuj ponownie lub',
            errorDescriptionPartTwo: 'skontaktuj się z Concierge',
            errorDescriptionPartThree: 'po pomoc.',
        },
        exportAgainModal: {
            title: 'Ostrożnie!',
            description: function (_a) {
                var reportName = _a.reportName, connectionName = _a.connectionName;
                return "Nast\u0119puj\u0105ce raporty zosta\u0142y ju\u017C wyeksportowane do ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName], ":\n\n").concat(reportName, "\n\nCzy na pewno chcesz je wyeksportowa\u0107 ponownie?");
            },
            confirmText: 'Tak, wyeksportuj ponownie',
            cancelText: 'Anuluj',
        },
        upgrade: (_6 = {
                reportFields: {
                    title: 'Pola raportu',
                    description: "Pola raportu pozwalaj\u0105 okre\u015Bli\u0107 szczeg\u00F3\u0142y na poziomie nag\u0142\u00F3wka, w odr\u00F3\u017Cnieniu od tag\u00F3w odnosz\u0105cych si\u0119 do wydatk\u00F3w na poszczeg\u00F3lnych pozycjach. Te szczeg\u00F3\u0142y mog\u0105 obejmowa\u0107 konkretne nazwy projekt\u00F3w, informacje o podr\u00F3\u017Cach s\u0142u\u017Cbowych, lokalizacje i inne.",
                    onlyAvailableOnPlan: 'Pola raportu są dostępne tylko w planie Control, zaczynając od',
                }
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE] = {
                title: 'NetSuite',
                description: "Ciesz si\u0119 automatyczn\u0105 synchronizacj\u0105 i zmniejsz liczb\u0119 r\u0119cznych wpis\u00F3w dzi\u0119ki integracji Expensify + NetSuite. Uzyskaj dog\u0142\u0119bne, rzeczywiste wgl\u0105dy finansowe z obs\u0142ug\u0105 segment\u00F3w natywnych i niestandardowych, w tym mapowaniem projekt\u00F3w i klient\u00F3w.",
                onlyAvailableOnPlan: 'Nasza integracja z NetSuite jest dostępna tylko w planie Control, zaczynającym się od',
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.SAGE_INTACCT] = {
                title: 'Sage Intacct',
                description: "Ciesz si\u0119 automatyczn\u0105 synchronizacj\u0105 i zmniejsz liczb\u0119 r\u0119cznych wpis\u00F3w dzi\u0119ki integracji Expensify + Sage Intacct. Uzyskaj dog\u0142\u0119bne, rzeczywiste wgl\u0105dy finansowe z u\u017Cytkownikami zdefiniowanymi wymiarami, a tak\u017Ce kodowaniem wydatk\u00F3w wed\u0142ug dzia\u0142u, klasy, lokalizacji, klienta i projektu (pracy).",
                onlyAvailableOnPlan: 'Nasza integracja z Sage Intacct jest dostępna tylko w planie Control, zaczynającym się od',
            },
            _6[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
                title: 'QuickBooks Desktop',
                description: "Ciesz si\u0119 automatyczn\u0105 synchronizacj\u0105 i redukcj\u0105 r\u0119cznych wpis\u00F3w dzi\u0119ki integracji Expensify + QuickBooks Desktop. Zyskaj maksymaln\u0105 wydajno\u015B\u0107 dzi\u0119ki dwukierunkowemu po\u0142\u0105czeniu w czasie rzeczywistym oraz kodowaniu wydatk\u00F3w wed\u0142ug klasy, pozycji, klienta i projektu.",
                onlyAvailableOnPlan: 'Nasza integracja z QuickBooks Desktop jest dostępna tylko w planie Control, zaczynającym się od',
            },
            _6[CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id] = {
                title: 'Zaawansowane zatwierdzenia',
                description: "Je\u015Bli chcesz doda\u0107 wi\u0119cej warstw zatwierdze\u0144 do procesu \u2013 lub po prostu upewni\u0107 si\u0119, \u017Ce najwi\u0119ksze wydatki zostan\u0105 ponownie sprawdzone \u2013 mamy dla Ciebie rozwi\u0105zanie. Zaawansowane zatwierdzenia pomagaj\u0105 wprowadzi\u0107 odpowiednie kontrole na ka\u017Cdym poziomie, aby utrzyma\u0107 wydatki zespo\u0142u pod kontrol\u0105.",
                onlyAvailableOnPlan: 'Zaawansowane zatwierdzenia są dostępne tylko w planie Control, który zaczyna się od',
            },
            _6.categories = {
                title: 'Kategorie',
                description: "Kategorie pomagaj\u0105 lepiej organizowa\u0107 wydatki, aby \u015Bledzi\u0107, na co wydajesz swoje pieni\u0105dze. Skorzystaj z naszej sugerowanej listy kategorii lub stw\u00F3rz w\u0142asne.",
                onlyAvailableOnPlan: 'Kategorie są dostępne w planie Collect, zaczynając od',
            },
            _6.glCodes = {
                title: 'kody GL',
                description: "Dodaj kody GL do swoich kategorii i tag\u00F3w, aby u\u0142atwi\u0107 eksport wydatk\u00F3w do swoich system\u00F3w ksi\u0119gowych i p\u0142acowych.",
                onlyAvailableOnPlan: 'Kody GL są dostępne tylko w planie Control, zaczynającym się od',
            },
            _6.glAndPayrollCodes = {
                title: 'Kody GL i Payroll',
                description: "Dodaj kody GL i kody p\u0142acowe do swoich kategorii, aby u\u0142atwi\u0107 eksport wydatk\u00F3w do system\u00F3w ksi\u0119gowych i p\u0142acowych.",
                onlyAvailableOnPlan: 'Kody GL i Payroll są dostępne tylko w planie Control, zaczynającym się od',
            },
            _6.taxCodes = {
                title: 'Kody podatkowe',
                description: "Dodaj kody podatkowe do swoich podatk\u00F3w, aby \u0142atwo eksportowa\u0107 wydatki do swoich system\u00F3w ksi\u0119gowych i p\u0142acowych.",
                onlyAvailableOnPlan: 'Kody podatkowe są dostępne tylko w planie Control, zaczynając od',
            },
            _6.companyCards = {
                title: 'Nielimitowane karty firmowe',
                description: "Potrzebujesz doda\u0107 wi\u0119cej \u017Ar\u00F3de\u0142 kart? Odblokuj nieograniczon\u0105 liczb\u0119 kart firmowych, aby synchronizowa\u0107 transakcje ze wszystkich g\u0142\u00F3wnych wydawc\u00F3w kart.",
                onlyAvailableOnPlan: 'To jest dostępne tylko w planie Control, zaczynając od',
            },
            _6.rules = {
                title: 'Zasady',
                description: "Zasady dzia\u0142aj\u0105 w tle i pomagaj\u0105 kontrolowa\u0107 wydatki, dzi\u0119ki czemu nie musisz martwi\u0107 si\u0119 drobiazgami.\n\nWymagaj szczeg\u00F3\u0142\u00F3w wydatk\u00F3w, takich jak paragony i opisy, ustalaj limity i domy\u015Blne warto\u015Bci oraz automatyzuj zatwierdzenia i p\u0142atno\u015Bci \u2013 wszystko w jednym miejscu.",
                onlyAvailableOnPlan: 'Zasady są dostępne tylko w planie Control, zaczynającym się od',
            },
            _6.perDiem = {
                title: 'Dieta',
                description: 'Dieta to świetny sposób na utrzymanie zgodności i przewidywalności codziennych kosztów, gdy Twoi pracownicy podróżują. Ciesz się funkcjami takimi jak niestandardowe stawki, domyślne kategorie i bardziej szczegółowe informacje, takie jak miejsca docelowe i podstawki.',
                onlyAvailableOnPlan: 'Diety są dostępne tylko w planie Control, zaczynając od',
            },
            _6.travel = {
                title: 'Podróżować',
                description: 'Expensify Travel to nowa platforma do rezerwacji i zarządzania podróżami służbowymi, która umożliwia członkom rezerwację zakwaterowania, lotów, transportu i nie tylko.',
                onlyAvailableOnPlan: 'Podróże są dostępne w planie Collect, zaczynając od',
            },
            _6.multiLevelTags = {
                title: 'Wielopoziomowe tagi',
                description: 'Wielopoziomowe tagi pomagają śledzić wydatki z większą precyzją. Przypisz wiele tagów do każdej pozycji, takich jak dział, klient czy centrum kosztów, aby uchwycić pełny kontekst każdego wydatku. Umożliwia to bardziej szczegółowe raportowanie, przepływy pracy związane z zatwierdzaniem oraz eksporty księgowe.',
                onlyAvailableOnPlan: 'Wielopoziomowe tagi są dostępne tylko w planie Control, zaczynając od',
            },
            _6.pricing = {
                perActiveMember: 'na aktywnego członka miesięcznie.',
                perMember: 'za członka miesięcznie.',
            },
            _6.note = {
                upgradeWorkspace: 'Ulepsz swoje miejsce pracy, aby uzyskać dostęp do tej funkcji, lub',
                learnMore: 'dowiedz się więcej',
                aboutOurPlans: 'o naszych planach i cenach.',
            },
            _6.upgradeToUnlock = 'Odblokuj tę funkcję',
            _6.completed = {
                headline: "Zaktualizowa\u0142e\u015B swoje miejsce pracy!",
                successMessage: function (_a) {
                    var policyName = _a.policyName;
                    return "Pomy\u015Blnie zaktualizowano ".concat(policyName, " do planu Control!");
                },
                categorizeMessage: "Pomy\u015Blnie zaktualizowano do przestrzeni roboczej w planie Collect. Teraz mo\u017Cesz kategoryzowa\u0107 swoje wydatki!",
                travelMessage: "Pomy\u015Blnie zaktualizowano do przestrzeni roboczej w planie Collect. Teraz mo\u017Cesz zacz\u0105\u0107 rezerwowa\u0107 i zarz\u0105dza\u0107 podr\u00F3\u017Cami!",
                viewSubscription: 'Zobacz swoją subskrypcję',
                moreDetails: 'aby uzyskać więcej szczegółów.',
                gotIt: 'Zrozumiałem, dzięki',
            },
            _6.commonFeatures = {
                title: 'Ulepsz do planu Control',
                note: 'Odblokuj nasze najpotężniejsze funkcje, w tym:',
                benefits: {
                    startsAt: 'Plan Control zaczyna się od',
                    perMember: 'na aktywnego członka miesięcznie.',
                    learnMore: 'Dowiedz się więcej',
                    pricing: 'o naszych planach i cenach.',
                    benefit1: 'Zaawansowane połączenia księgowe (NetSuite, Sage Intacct i inne)',
                    benefit2: 'Inteligentne zasady wydatków',
                    benefit3: 'Wielopoziomowe przepływy zatwierdzania',
                    benefit4: 'Ulepszone kontrole bezpieczeństwa',
                    toUpgrade: 'Aby zaktualizować, kliknij',
                    selectWorkspace: 'wybierz przestrzeń roboczą i zmień typ planu na',
                },
            },
            _6),
        downgrade: {
            commonFeatures: {
                title: 'Przejdź na plan Collect',
                note: 'Jeśli obniżysz plan, stracisz dostęp do tych funkcji i innych:',
                benefits: {
                    note: 'Aby uzyskać pełne porównanie naszych planów, sprawdź nasze',
                    pricingPage: 'strona cenowa',
                    confirm: 'Czy na pewno chcesz obniżyć wersję i usunąć swoje konfiguracje?',
                    warning: 'Tego nie można cofnąć.',
                    benefit1: 'Połączenia księgowe (z wyjątkiem QuickBooks Online i Xero)',
                    benefit2: 'Inteligentne zasady wydatków',
                    benefit3: 'Wielopoziomowe przepływy zatwierdzania',
                    benefit4: 'Ulepszone kontrole bezpieczeństwa',
                    headsUp: 'Uwaga!',
                    multiWorkspaceNote: 'Musisz obniżyć wszystkie swoje przestrzenie robocze przed pierwszą miesięczną płatnością, aby rozpocząć subskrypcję w stawce Collect. Kliknij',
                    selectStep: '> wybierz każde miejsce pracy > zmień typ planu na',
                },
            },
            completed: {
                headline: 'Twoje miejsce pracy zostało zdegradowane',
                description: 'Masz inne przestrzenie robocze na planie Control. Aby być rozliczanym według stawki Collect, musisz obniżyć wszystkie przestrzenie robocze.',
                gotIt: 'Zrozumiałem, dzięki',
            },
        },
        payAndDowngrade: {
            title: 'Zapłać i obniż plan',
            headline: 'Twoja ostateczna płatność',
            description1: 'Twój ostateczny rachunek za tę subskrypcję wyniesie',
            description2: function (_a) {
                var date = _a.date;
                return "Zobacz swoje zestawienie poni\u017Cej dla ".concat(date, ":");
            },
            subscription: 'Uwaga! Ta akcja zakończy Twoją subskrypcję Expensify, usunie to miejsce pracy i usunie wszystkich członków miejsca pracy. Jeśli chcesz zachować to miejsce pracy i tylko usunąć siebie, najpierw poproś innego administratora o przejęcie rozliczeń.',
            genericFailureMessage: 'Wystąpił błąd podczas płacenia rachunku. Proszę spróbować ponownie.',
        },
        restrictedAction: {
            restricted: 'Restricted',
            actionsAreCurrentlyRestricted: function (_a) {
                var workspaceName = _a.workspaceName;
                return "Dzia\u0142ania w przestrzeni roboczej ".concat(workspaceName, " s\u0105 obecnie ograniczone");
            },
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: function (_a) {
                var workspaceOwnerName = _a.workspaceOwnerName;
                return "W\u0142a\u015Bciciel przestrzeni roboczej, ".concat(workspaceOwnerName, ", b\u0119dzie musia\u0142 doda\u0107 lub zaktualizowa\u0107 kart\u0119 p\u0142atnicz\u0105 w systemie, aby odblokowa\u0107 nowe dzia\u0142ania w przestrzeni roboczej.");
            },
            youWillNeedToAddOrUpdatePaymentCard: 'Będziesz musiał dodać lub zaktualizować kartę płatniczą w systemie, aby odblokować nowe działania w przestrzeni roboczej.',
            addPaymentCardToUnlock: 'Dodaj kartę płatniczą, aby odblokować!',
            addPaymentCardToContinueUsingWorkspace: 'Dodaj kartę płatniczą, aby kontynuować korzystanie z tego miejsca pracy.',
            pleaseReachOutToYourWorkspaceAdmin: 'Proszę skontaktować się z administratorem przestrzeni roboczej w razie jakichkolwiek pytań.',
            chatWithYourAdmin: 'Porozmawiaj ze swoim administratorem',
            chatInAdmins: 'Czat w #admins',
            addPaymentCard: 'Dodaj kartę płatniczą',
        },
        rules: {
            individualExpenseRules: {
                title: 'Wydatki',
                subtitle: 'Ustaw limity wydatków i domyślne wartości dla poszczególnych wydatków. Możesz także tworzyć zasady dla',
                receiptRequiredAmount: 'Wymagana kwota paragonu',
                receiptRequiredAmountDescription: 'Wymagaj paragonów, gdy wydatki przekraczają tę kwotę, chyba że zostanie to zmienione przez regułę kategorii.',
                maxExpenseAmount: 'Maksymalna kwota wydatku',
                maxExpenseAmountDescription: 'Oznacz wydatki przekraczające tę kwotę, chyba że zostaną one nadpisane przez regułę kategorii.',
                maxAge: 'Maksymalny wiek',
                maxExpenseAge: 'Maksymalny wiek wydatku',
                maxExpenseAgeDescription: 'Oznacz wydatki starsze niż określona liczba dni.',
                maxExpenseAgeDays: function () { return ({
                    one: '1 dzień',
                    other: function (count) { return "".concat(count, " dni"); },
                }); },
                billableDefault: 'Domyślne do rozliczenia',
                billableDefaultDescription: 'Wybierz, czy wydatki gotówkowe i na kartę kredytową powinny być domyślnie fakturowalne. Wydatki fakturowalne są włączane lub wyłączane w',
                billable: 'Podlegające fakturowaniu',
                billableDescription: 'Wydatki są najczęściej ponownie fakturowane klientom',
                nonBillable: 'Niepodlegające fakturowaniu',
                nonBillableDescription: 'Wydatki są czasami ponownie fakturowane klientom.',
                eReceipts: 'eReceipts',
                eReceiptsHint: 'eParagony są tworzone automatycznie',
                eReceiptsHintLink: 'dla większości transakcji kredytowych w USD',
                attendeeTracking: 'Śledzenie uczestników',
                attendeeTrackingHint: 'Śledź koszt na osobę dla każdego wydatku.',
                prohibitedDefaultDescription: 'Oznacz wszystkie paragony, na których pojawiają się alkohol, hazard lub inne zabronione przedmioty. Wydatki z paragonami, na których występują te pozycje, będą wymagały ręcznej weryfikacji.',
                prohibitedExpenses: 'Zabronione wydatki',
                alcohol: 'Alkohol',
                hotelIncidentals: 'Dodatkowe opłaty hotelowe',
                gambling: 'Hazardowanie',
                tobacco: 'Tytoń',
                adultEntertainment: 'Rozrywka dla dorosłych',
            },
            expenseReportRules: {
                examples: 'Przykłady:',
                title: 'Raporty wydatków',
                subtitle: 'Zautomatyzuj zgodność raportów wydatków, zatwierdzenia i płatności.',
                customReportNamesSubtitle: 'Dostosuj tytuły raportów za pomocą naszego',
                customNameTitle: 'Domyślny tytuł raportu',
                customNameDescription: 'Wybierz niestandardową nazwę dla raportów wydatków za pomocą naszego',
                customNameDescriptionLink: 'rozbudowane formuły',
                customNameInputLabel: 'Imię',
                customNameEmailPhoneExample: 'Email lub telefon członka: {report:submit:from}',
                customNameStartDateExample: 'Data rozpoczęcia raportu: {report:startdate}',
                customNameWorkspaceNameExample: 'Nazwa przestrzeni roboczej: {report:workspacename}',
                customNameReportIDExample: 'Report ID: {report:id}',
                customNameTotalExample: 'Suma: {report:total}.',
                preventMembersFromChangingCustomNamesTitle: 'Uniemożliw członkom zmianę nazw raportów niestandardowych',
                preventSelfApprovalsTitle: 'Zapobiegaj samodzielnym zatwierdzeniom',
                preventSelfApprovalsSubtitle: 'Uniemożliwiaj członkom przestrzeni roboczej zatwierdzanie własnych raportów wydatków.',
                autoApproveCompliantReportsTitle: 'Automatycznie zatwierdzaj zgodne raporty',
                autoApproveCompliantReportsSubtitle: 'Skonfiguruj, które raporty wydatków są kwalifikowane do automatycznego zatwierdzenia.',
                autoApproveReportsUnderTitle: 'Automatycznie zatwierdzaj raporty poniżej',
                autoApproveReportsUnderDescription: 'W pełni zgodne raporty wydatków poniżej tej kwoty będą automatycznie zatwierdzane.',
                randomReportAuditTitle: 'Losowe sprawdzanie raportu',
                randomReportAuditDescription: 'Wymagaj, aby niektóre raporty były zatwierdzane ręcznie, nawet jeśli kwalifikują się do automatycznego zatwierdzenia.',
                autoPayApprovedReportsTitle: 'Automatyczne płacenie zatwierdzonych raportów',
                autoPayApprovedReportsSubtitle: 'Skonfiguruj, które raporty wydatków są kwalifikowane do automatycznej płatności.',
                autoPayApprovedReportsLimitError: function (_a) {
                    var _b = _a === void 0 ? {} : _a, currency = _b.currency;
                    return "Prosz\u0119 wprowadzi\u0107 kwot\u0119 mniejsz\u0105 ni\u017C ".concat(currency !== null && currency !== void 0 ? currency : '', "20 000");
                },
                autoPayApprovedReportsLockedSubtitle: 'Przejdź do więcej funkcji i włącz przepływy pracy, a następnie dodaj płatności, aby odblokować tę funkcję.',
                autoPayReportsUnderTitle: 'Automatyczne opłacanie raportów poniżej',
                autoPayReportsUnderDescription: 'W pełni zgodne raporty wydatków poniżej tej kwoty będą automatycznie opłacane.',
                unlockFeatureGoToSubtitle: 'Przejdź do',
                unlockFeatureEnableWorkflowsSubtitle: function (_a) {
                    var featureName = _a.featureName;
                    return "i w\u0142\u0105cz przep\u0142ywy pracy, a nast\u0119pnie dodaj ".concat(featureName, ", aby odblokowa\u0107 t\u0119 funkcj\u0119.");
                },
                enableFeatureSubtitle: function (_a) {
                    var featureName = _a.featureName;
                    return "i w\u0142\u0105cz ".concat(featureName, ", aby odblokowa\u0107 t\u0119 funkcj\u0119.");
                },
            },
            categoryRules: {
                title: 'Zasady kategorii',
                approver: 'Aprobujący',
                requireDescription: 'Wymagany opis',
                descriptionHint: 'Podpowiedź opisu',
                descriptionHintDescription: function (_a) {
                    var categoryName = _a.categoryName;
                    return "Przypomnij pracownikom o dostarczeniu dodatkowych informacji dotycz\u0105cych wydatk\u00F3w w kategorii \u201E".concat(categoryName, "\u201D. Ta wskaz\u00F3wka pojawia si\u0119 w polu opisu wydatk\u00F3w.");
                },
                descriptionHintLabel: 'Wskazówka',
                descriptionHintSubtitle: 'Porada: Im krócej, tym lepiej!',
                maxAmount: 'Maksymalna kwota',
                flagAmountsOver: 'Oznacz kwoty powyżej',
                flagAmountsOverDescription: function (_a) {
                    var categoryName = _a.categoryName;
                    return "Dotyczy kategorii \u201E".concat(categoryName, "\u201D.");
                },
                flagAmountsOverSubtitle: 'To zastępuje maksymalną kwotę dla wszystkich wydatków.',
                expenseLimitTypes: {
                    expense: 'Pojedynczy wydatek',
                    expenseSubtitle: 'Oznacz kwoty wydatków według kategorii. Ta zasada zastępuje ogólną zasadę przestrzeni roboczej dotyczącą maksymalnej kwoty wydatku.',
                    daily: 'Suma kategorii',
                    dailySubtitle: 'Oznacz całkowite wydatki kategorii na raport wydatków.',
                },
                requireReceiptsOver: 'Wymagaj paragonów powyżej',
                requireReceiptsOverList: {
                    default: function (_a) {
                        var defaultAmount = _a.defaultAmount;
                        return "".concat(defaultAmount, " ").concat(CONST_1.default.DOT_SEPARATOR, " Domy\u015Blny");
                    },
                    never: 'Nigdy nie wymagaj paragonów',
                    always: 'Zawsze wymagaj paragonów',
                },
                defaultTaxRate: 'Domyślna stawka podatkowa',
                goTo: 'Przejdź do',
                andEnableWorkflows: 'i włącz przepływy pracy, a następnie dodaj zatwierdzenia, aby odblokować tę funkcję.',
            },
            customRules: {
                title: 'Niestandardowe zasady',
                subtitle: 'Opis',
                description: 'Wprowadź niestandardowe zasady dla raportów wydatków',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Zbierz',
                    description: 'Dla zespołów poszukujących automatyzacji swoich procesów.',
                },
                corporate: {
                    label: 'Kontrola',
                    description: 'Dla organizacji z zaawansowanymi wymaganiami.',
                },
            },
            description: 'Wybierz plan, który jest dla Ciebie odpowiedni. Aby uzyskać szczegółową listę funkcji i cen, sprawdź naszą',
            subscriptionLink: 'typy planów i strona pomocy dotycząca cen',
            lockedPlanDescription: function (_a) {
                var count = _a.count, annualSubscriptionEndDate = _a.annualSubscriptionEndDate;
                return ({
                    one: "Zobowi\u0105za\u0142e\u015B si\u0119 do 1 aktywnego cz\u0142onka w planie Control do zako\u0144czenia rocznej subskrypcji w dniu ".concat(annualSubscriptionEndDate, ". Mo\u017Cesz przej\u015B\u0107 na subskrypcj\u0119 p\u0142atn\u0105 za u\u017Cycie i obni\u017Cy\u0107 do planu Collect od ").concat(annualSubscriptionEndDate, ", wy\u0142\u0105czaj\u0105c automatyczne odnawianie w"),
                    other: "Zobowi\u0105za\u0142e\u015B si\u0119 do ".concat(count, " aktywnych cz\u0142onk\u00F3w w planie Control do momentu zako\u0144czenia rocznej subskrypcji w dniu ").concat(annualSubscriptionEndDate, ". Mo\u017Cesz przej\u015B\u0107 na subskrypcj\u0119 p\u0142atn\u0105 za u\u017Cycie i zmieni\u0107 na plan Collect od ").concat(annualSubscriptionEndDate, ", wy\u0142\u0105czaj\u0105c automatyczne odnawianie w"),
                });
            },
            subscriptions: 'Subskrypcje',
        },
    },
    getAssistancePage: {
        title: 'Uzyskaj pomoc',
        subtitle: 'Jesteśmy tutaj, aby oczyścić Twoją drogę do wielkości!',
        description: 'Wybierz jedną z poniższych opcji wsparcia:',
        chatWithConcierge: 'Czat z Concierge',
        scheduleSetupCall: 'Zaplanuj rozmowę wstępną',
        scheduleACall: 'Zaplanuj rozmowę',
        questionMarkButtonTooltip: 'Uzyskaj pomoc od naszego zespołu',
        exploreHelpDocs: 'Przeglądaj dokumenty pomocy',
        registerForWebinar: 'Zarejestruj się na webinar',
        onboardingHelp: 'Pomoc w rozpoczęciu pracy',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Zmień domyślny odcień skóry',
        headers: {
            frequentlyUsed: 'Często używane',
            smileysAndEmotion: 'Smileys i emocje',
            peopleAndBody: 'Ludzie i ciało',
            animalsAndNature: 'Zwierzęta i natura',
            foodAndDrink: 'Jedzenie i napoje',
            travelAndPlaces: 'Podróże i miejsca',
            activities: 'Działania',
            objects: 'Obiekty',
            symbols: 'Symbole',
            flags: 'Flagi',
        },
    },
    newRoomPage: {
        newRoom: 'Nowy pokój',
        groupName: 'Nazwa grupy',
        roomName: 'Nazwa pokoju',
        visibility: 'Widoczność',
        restrictedDescription: 'Osoby w Twojej przestrzeni roboczej mogą znaleźć ten pokój',
        privateDescription: 'Osoby zaproszone do tego pokoju mogą go znaleźć.',
        publicDescription: 'Każdy może znaleźć ten pokój',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Każdy może znaleźć ten pokój',
        createRoom: 'Utwórz pokój',
        roomAlreadyExistsError: 'Pokój o tej nazwie już istnieje',
        roomNameReservedError: function (_a) {
            var reservedName = _a.reservedName;
            return "".concat(reservedName, " jest domy\u015Blnym pokojem we wszystkich przestrzeniach roboczych. Prosz\u0119 wybra\u0107 inn\u0105 nazw\u0119.");
        },
        roomNameInvalidError: 'Nazwy pokoi mogą zawierać tylko małe litery, cyfry i myślniki',
        pleaseEnterRoomName: 'Proszę wprowadzić nazwę pokoju',
        pleaseSelectWorkspace: 'Proszę wybrać przestrzeń roboczą',
        renamedRoomAction: function (_a) {
            var oldName = _a.oldName, newName = _a.newName, actorName = _a.actorName, isExpenseReport = _a.isExpenseReport;
            var actor = actorName ? "".concat(actorName, " ") : '';
            return isExpenseReport ? "".concat(actor, "zmieni\u0142 nazw\u0119 na \"").concat(newName, "\" (wcze\u015Bniej \"").concat(oldName, "\")") : "".concat(actor, "zmieni\u0142 nazw\u0119 tego pokoju na \"").concat(newName, "\" (wcze\u015Bniej \"").concat(oldName, "\")");
        },
        roomRenamedTo: function (_a) {
            var newName = _a.newName;
            return "Pok\u00F3j zosta\u0142 przemianowany na ".concat(newName);
        },
        social: 'społecznościowy',
        selectAWorkspace: 'Wybierz przestrzeń roboczą',
        growlMessageOnRenameError: 'Nie można zmienić nazwy pokoju roboczego. Sprawdź swoje połączenie i spróbuj ponownie.',
        visibilityOptions: {
            restricted: 'Workspace', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: 'Prywatne',
            public: 'Publiczny',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Ogłoszenie publiczne',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: 'Prześlij i Zamknij',
        submitAndApprove: 'Prześlij i zatwierdź',
        advanced: 'ADVANCED',
        dynamicExternal: 'DYNAMIC_EXTERNAL',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: function (_a) {
            var approverEmail = _a.approverEmail, approverName = _a.approverName, field = _a.field, name = _a.name;
            return "dodano ".concat(approverName, " (").concat(approverEmail, ") jako zatwierdzaj\u0105cego dla ").concat(field, " \"").concat(name, "\"");
        },
        deleteApprovalRule: function (_a) {
            var approverEmail = _a.approverEmail, approverName = _a.approverName, field = _a.field, name = _a.name;
            return "usun\u0105\u0142 ".concat(approverName, " (").concat(approverEmail, ") jako zatwierdzaj\u0105cego dla ").concat(field, " \"").concat(name, "\"");
        },
        updateApprovalRule: function (_a) {
            var field = _a.field, name = _a.name, newApproverEmail = _a.newApproverEmail, newApproverName = _a.newApproverName, oldApproverEmail = _a.oldApproverEmail, oldApproverName = _a.oldApproverName;
            var formatApprover = function (displayName, email) { return (displayName ? "".concat(displayName, " (").concat(email, ")") : email); };
            return "zmieniono zatwierdzaj\u0105cego dla ".concat(field, " \"").concat(name, "\" na ").concat(formatApprover(newApproverName, newApproverEmail), " (wcze\u015Bniej ").concat(formatApprover(oldApproverName, oldApproverEmail), ")");
        },
        addCategory: function (_a) {
            var categoryName = _a.categoryName;
            return "doda\u0142 kategori\u0119 \"".concat(categoryName, "\"");
        },
        deleteCategory: function (_a) {
            var categoryName = _a.categoryName;
            return "usuni\u0119to kategori\u0119 \"".concat(categoryName, "\"");
        },
        updateCategory: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName;
            return "".concat(oldValue ? 'wyłączony' : 'włączony', " kategoria \"").concat(categoryName, "\"");
        },
        updateCategoryPayrollCode: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName, newValue = _a.newValue;
            if (!oldValue) {
                return "doda\u0142 kod p\u0142acowy \"".concat(newValue, "\" do kategorii \"").concat(categoryName, "\"");
            }
            if (!newValue && oldValue) {
                return "usuni\u0119to kod p\u0142acowy \"".concat(oldValue, "\" z kategorii \"").concat(categoryName, "\"");
            }
            return "zmieniono kod p\u0142acowy kategorii \"".concat(categoryName, "\" na \u201E").concat(newValue, "\u201D (wcze\u015Bniej \u201E").concat(oldValue, "\u201D)");
        },
        updateCategoryGLCode: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName, newValue = _a.newValue;
            if (!oldValue) {
                return "doda\u0142 kod GL \"".concat(newValue, "\" do kategorii \"").concat(categoryName, "\"");
            }
            if (!newValue && oldValue) {
                return "usuni\u0119to kod GL \"".concat(oldValue, "\" z kategorii \"").concat(categoryName, "\"");
            }
            return "zmieniono kod GL kategorii \u201E".concat(categoryName, "\u201D na \u201E").concat(newValue, "\u201D (wcze\u015Bniej \u201E").concat(oldValue, "\u201D)");
        },
        updateAreCommentsRequired: function (_a) {
            var oldValue = _a.oldValue, categoryName = _a.categoryName;
            return "zmieniono opis kategorii \"".concat(categoryName, "\" na ").concat(!oldValue ? 'wymagane' : 'nie wymagane', " (wcze\u015Bniej ").concat(!oldValue ? 'nie wymagane' : 'wymagane', ")");
        },
        updateCategoryMaxExpenseAmount: function (_a) {
            var categoryName = _a.categoryName, oldAmount = _a.oldAmount, newAmount = _a.newAmount;
            if (newAmount && !oldAmount) {
                return "dodano maksymaln\u0105 kwot\u0119 ".concat(newAmount, " do kategorii \"").concat(categoryName, "\"");
            }
            if (oldAmount && !newAmount) {
                return "usuni\u0119to maksymaln\u0105 kwot\u0119 ".concat(oldAmount, " z kategorii \"").concat(categoryName, "\"");
            }
            return "zmieniono maksymaln\u0105 kwot\u0119 kategorii \"".concat(categoryName, "\" na ").concat(newAmount, " (wcze\u015Bniej ").concat(oldAmount, ")");
        },
        updateCategoryExpenseLimitType: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "doda\u0142 limit typu ".concat(newValue, " do kategorii \"").concat(categoryName, "\"");
            }
            return "zmieniono typ limitu kategorii \u201E".concat(categoryName, "\u201D na ").concat(newValue, " (wcze\u015Bniej ").concat(oldValue, ")");
        },
        updateCategoryMaxAmountNoReceipt: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "zaktualizowano kategori\u0119 \"".concat(categoryName, "\", zmieniaj\u0105c Paragony na ").concat(newValue);
            }
            return "zmieniono kategori\u0119 \"".concat(categoryName, "\" na ").concat(newValue, " (wcze\u015Bniej ").concat(oldValue, ")");
        },
        setCategoryName: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "zmieniono nazw\u0119 kategorii z \"".concat(oldName, "\" na \"").concat(newName, "\"");
        },
        updatedDescriptionHint: function (_a) {
            var categoryName = _a.categoryName, oldValue = _a.oldValue, newValue = _a.newValue;
            if (!newValue) {
                return "usuni\u0119to opis \"".concat(oldValue, "\" z kategorii \"").concat(categoryName, "\"");
            }
            return !oldValue
                ? "doda\u0142 podpowied\u017A opisu \"".concat(newValue, "\" do kategorii \"").concat(categoryName, "\"")
                : "zmieniono podpowied\u017A opisu kategorii \"".concat(categoryName, "\" na \u201E").concat(newValue, "\u201D (wcze\u015Bniej \u201E").concat(oldValue, "\u201D)");
        },
        updateTagListName: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "zmieniono nazw\u0119 listy tag\u00F3w na \"".concat(newName, "\" (wcze\u015Bniej \"").concat(oldName, "\")");
        },
        addTag: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName;
            return "doda\u0142 tag \"".concat(tagName, "\" do listy \"").concat(tagListName, "\"");
        },
        updateTagName: function (_a) {
            var tagListName = _a.tagListName, newName = _a.newName, oldName = _a.oldName;
            return "zaktualizowano list\u0119 tag\u00F3w \"".concat(tagListName, "\", zmieniaj\u0105c tag \"").concat(oldName, "\" na \"").concat(newName, "\"");
        },
        updateTagEnabled: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName, enabled = _a.enabled;
            return "".concat(enabled ? 'włączony' : 'wyłączony', " tag \"").concat(tagName, "\" na li\u015Bcie \"").concat(tagListName, "\"");
        },
        deleteTag: function (_a) {
            var tagListName = _a.tagListName, tagName = _a.tagName;
            return "usuni\u0119to tag \"".concat(tagName, "\" z listy \"").concat(tagListName, "\"");
        },
        deleteMultipleTags: function (_a) {
            var count = _a.count, tagListName = _a.tagListName;
            return "usuni\u0119to \"".concat(count, "\" tag\u00F3w z listy \"").concat(tagListName, "\"");
        },
        updateTag: function (_a) {
            var tagListName = _a.tagListName, newValue = _a.newValue, tagName = _a.tagName, updatedField = _a.updatedField, oldValue = _a.oldValue;
            if (oldValue) {
                return "zaktualizowano tag \"".concat(tagName, "\" na li\u015Bcie \"").concat(tagListName, "\", zmieniaj\u0105c ").concat(updatedField, " na \"").concat(newValue, "\" (wcze\u015Bniej \"").concat(oldValue, "\")");
            }
            return "zaktualizowano tag \"".concat(tagName, "\" na li\u015Bcie \"").concat(tagListName, "\" poprzez dodanie ").concat(updatedField, " o warto\u015Bci \"").concat(newValue, "\"");
        },
        updateCustomUnit: function (_a) {
            var customUnitName = _a.customUnitName, newValue = _a.newValue, oldValue = _a.oldValue, updatedField = _a.updatedField;
            return "zmieniono ".concat(customUnitName, " ").concat(updatedField, " na \"").concat(newValue, "\" (wcze\u015Bniej \"").concat(oldValue, "\")");
        },
        updateCustomUnitTaxEnabled: function (_a) {
            var newValue = _a.newValue;
            return "\u015Aledzenie podatku ".concat(newValue ? 'włączony' : 'wyłączony', " na podstawie stawek odleg\u0142o\u015Bciowych");
        },
        addCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, rateName = _a.rateName;
            return "doda\u0142 now\u0105 stawk\u0119 \"".concat(customUnitName, "\" o nazwie \"").concat(rateName, "\"");
        },
        updatedCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, oldValue = _a.oldValue, updatedField = _a.updatedField;
            return "zmieniono stawk\u0119 ".concat(customUnitName, " ").concat(updatedField, " \"").concat(customUnitRateName, "\" na \"").concat(newValue, "\" (wcze\u015Bniej \"").concat(oldValue, "\")");
        },
        updatedCustomUnitTaxRateExternalID: function (_a) {
            var customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, newTaxPercentage = _a.newTaxPercentage, oldTaxPercentage = _a.oldTaxPercentage, oldValue = _a.oldValue;
            if (oldTaxPercentage && oldValue) {
                return "zmieniono stawk\u0119 podatku na stawce odleg\u0142o\u015Bci \"".concat(customUnitRateName, "\" na \"").concat(newValue, " (").concat(newTaxPercentage, ")\" (wcze\u015Bniej \"").concat(oldValue, " (").concat(oldTaxPercentage, ")\")");
            }
            return "doda\u0142 stawk\u0119 podatkow\u0105 \"".concat(newValue, " (").concat(newTaxPercentage, ")\" do stawki za odleg\u0142o\u015B\u0107 \"").concat(customUnitRateName, "\"");
        },
        updatedCustomUnitTaxClaimablePercentage: function (_a) {
            var customUnitRateName = _a.customUnitRateName, newValue = _a.newValue, oldValue = _a.oldValue;
            if (oldValue) {
                return "zmieniono cz\u0119\u015B\u0107 podlegaj\u0105c\u0105 zwrotowi podatku w stawce za odleg\u0142o\u015B\u0107 \"".concat(customUnitRateName, "\" na \"").concat(newValue, "\" (wcze\u015Bniej \"").concat(oldValue, "\")");
            }
            return "doda\u0142 cz\u0119\u015B\u0107 podatku podlegaj\u0105c\u0105 zwrotowi w wysoko\u015Bci \"".concat(newValue, "\" do stawki za odleg\u0142o\u015B\u0107 \"").concat(customUnitRateName, "\"");
        },
        deleteCustomUnitRate: function (_a) {
            var customUnitName = _a.customUnitName, rateName = _a.rateName;
            return "usuni\u0119to stawk\u0119 \"".concat(rateName, "\" jednostki \"").concat(customUnitName, "\"");
        },
        addedReportField: function (_a) {
            var fieldType = _a.fieldType, fieldName = _a.fieldName;
            return "dodano pole raportu ".concat(fieldType, " \u201E").concat(fieldName, "\u201D");
        },
        updateReportFieldDefaultValue: function (_a) {
            var defaultValue = _a.defaultValue, fieldName = _a.fieldName;
            return "ustaw domy\u015Bln\u0105 warto\u015B\u0107 pola raportu \"".concat(fieldName, "\" na \"").concat(defaultValue, "\"");
        },
        addedReportFieldOption: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName;
            return "doda\u0142 opcj\u0119 \"".concat(optionName, "\" do pola raportu \"").concat(fieldName, "\"");
        },
        removedReportFieldOption: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName;
            return "usuni\u0119to opcj\u0119 \"".concat(optionName, "\" z pola raportu \"").concat(fieldName, "\"");
        },
        updateReportFieldOptionDisabled: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName, optionEnabled = _a.optionEnabled;
            return "".concat(optionEnabled ? 'włączony' : 'wyłączony', " opcja \"").concat(optionName, "\" dla pola raportu \"").concat(fieldName, "\"");
        },
        updateReportFieldAllOptionsDisabled: function (_a) {
            var fieldName = _a.fieldName, optionName = _a.optionName, allEnabled = _a.allEnabled, toggledOptionsCount = _a.toggledOptionsCount;
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return "".concat(allEnabled ? 'włączony' : 'wyłączony', " wszystkie opcje dla pola raportu \"").concat(fieldName, "\"");
            }
            return "".concat(allEnabled ? 'włączony' : 'wyłączony', " opcj\u0119 \"").concat(optionName, "\" dla pola raportu \"").concat(fieldName, "\", czyni\u0105c wszystkie opcje ").concat(allEnabled ? 'włączony' : 'wyłączony');
        },
        deleteReportField: function (_a) {
            var fieldType = _a.fieldType, fieldName = _a.fieldName;
            return "usuni\u0119to pole raportu ".concat(fieldType, " \"").concat(fieldName, "\"");
        },
        preventSelfApproval: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "zaktualizowano \"Zapobiegaj samoakceptacji\" na \"".concat(newValue === 'true' ? 'Włączone' : 'Wyłączony', "\" (wcze\u015Bniej \"").concat(oldValue === 'true' ? 'Włączone' : 'Wyłączony', "\")");
        },
        updateMaxExpenseAmountNoReceipt: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "zmieniono maksymaln\u0105 wymagan\u0105 kwot\u0119 wydatku na paragonie na ".concat(newValue, " (wcze\u015Bniej ").concat(oldValue, ")");
        },
        updateMaxExpenseAmount: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "zmieniono maksymaln\u0105 kwot\u0119 wydatku dla narusze\u0144 na ".concat(newValue, " (wcze\u015Bniej ").concat(oldValue, ")");
        },
        updateMaxExpenseAge: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "zaktualizowano \"Maksymalny wiek wydatku (dni)\" na \"".concat(newValue, "\" (wcze\u015Bniej \"").concat(oldValue === 'false' ? CONST_1.default.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue, "\")");
        },
        updateMonthlyOffset: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            if (!oldValue) {
                return "ustaw dat\u0119 przesy\u0142ania miesi\u0119cznego raportu na \"".concat(newValue, "\"");
            }
            return "zaktualizowano dat\u0119 sk\u0142adania miesi\u0119cznego raportu na \"".concat(newValue, "\" (wcze\u015Bniej \"").concat(oldValue, "\")");
        },
        updateDefaultBillable: function (_a) {
            var oldValue = _a.oldValue, newValue = _a.newValue;
            return "zaktualizowano \"Ponowne obci\u0105\u017Cenie klient\u00F3w kosztami\" na \"".concat(newValue, "\" (wcze\u015Bniej \"").concat(oldValue, "\")");
        },
        updateDefaultTitleEnforced: function (_a) {
            var value = _a.value;
            return "zmieniono \"Wymu\u015B domy\u015Blne tytu\u0142y raport\u00F3w\" ".concat(value ? 'na' : 'wyłączony');
        },
        renamedWorkspaceNameAction: function (_a) {
            var oldName = _a.oldName, newName = _a.newName;
            return "zaktualizowa\u0142 nazw\u0119 tego miejsca pracy na \"".concat(newName, "\" (wcze\u015Bniej \"").concat(oldName, "\")");
        },
        updateWorkspaceDescription: function (_a) {
            var newDescription = _a.newDescription, oldDescription = _a.oldDescription;
            return !oldDescription ? "ustaw opis tego miejsca pracy na \"".concat(newDescription, "\"") : "zaktualizowano opis tego miejsca pracy na \"".concat(newDescription, "\" (wcze\u015Bniej \"").concat(oldDescription, "\")");
        },
        removedFromApprovalWorkflow: function (_a) {
            var _b;
            var submittersNames = _a.submittersNames;
            var joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = (_b = submittersNames.at(0)) !== null && _b !== void 0 ? _b : '';
            }
            else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('i');
            }
            else if (submittersNames.length > 2) {
                joinedNames = "".concat(submittersNames.slice(0, submittersNames.length - 1).join(', '), " and ").concat(submittersNames.at(-1));
            }
            return {
                one: "usun\u0105\u0142 ci\u0119 z procesu zatwierdzania i czatu wydatk\u00F3w ".concat(joinedNames, ". Wcze\u015Bniej przes\u0142ane raporty b\u0119d\u0105 nadal dost\u0119pne do zatwierdzenia w Twojej skrzynce odbiorczej."),
                other: "usuni\u0119to Ci\u0119 z przep\u0142yw\u00F3w zatwierdzania i czat\u00F3w wydatk\u00F3w ".concat(joinedNames, ". Wcze\u015Bniej z\u0142o\u017Cone raporty b\u0119d\u0105 nadal dost\u0119pne do zatwierdzenia w Twojej skrzynce odbiorczej."),
            };
        },
        demotedFromWorkspace: function (_a) {
            var policyName = _a.policyName, oldRole = _a.oldRole;
            return "zaktualizowano Twoj\u0105 rol\u0119 w ".concat(policyName, " z ").concat(oldRole, " na u\u017Cytkownika. Zosta\u0142e\u015B usuni\u0119ty ze wszystkich czat\u00F3w wydatk\u00F3w nadawcy, z wyj\u0105tkiem w\u0142asnych.");
        },
        updatedWorkspaceCurrencyAction: function (_a) {
            var oldCurrency = _a.oldCurrency, newCurrency = _a.newCurrency;
            return "zaktualizowano domy\u015Bln\u0105 walut\u0119 na ".concat(newCurrency, " (wcze\u015Bniej ").concat(oldCurrency, ")");
        },
        updatedWorkspaceFrequencyAction: function (_a) {
            var oldFrequency = _a.oldFrequency, newFrequency = _a.newFrequency;
            return "zaktualizowano cz\u0119stotliwo\u015B\u0107 automatycznego raportowania na \"".concat(newFrequency, "\" (wcze\u015Bniej \"").concat(oldFrequency, "\")");
        },
        updateApprovalMode: function (_a) {
            var newValue = _a.newValue, oldValue = _a.oldValue;
            return "zaktualizowano tryb zatwierdzania na \"".concat(newValue, "\" (wcze\u015Bniej \"").concat(oldValue, "\")");
        },
        upgradedWorkspace: 'zaktualizowano tę przestrzeń roboczą do planu Control',
        downgradedWorkspace: 'obniżono ten przestrzeń roboczą do planu Collect',
        updatedAuditRate: function (_a) {
            var oldAuditRate = _a.oldAuditRate, newAuditRate = _a.newAuditRate;
            return "zmieniono wska\u017Anik raport\u00F3w losowo kierowanych do r\u0119cznej akceptacji na ".concat(Math.round(newAuditRate * 100), "% (wcze\u015Bniej ").concat(Math.round(oldAuditRate * 100), "%)");
        },
        updatedManualApprovalThreshold: function (_a) {
            var oldLimit = _a.oldLimit, newLimit = _a.newLimit;
            return "zmieniono limit r\u0119cznego zatwierdzania dla wszystkich wydatk\u00F3w na ".concat(newLimit, " (wcze\u015Bniej ").concat(oldLimit, ")");
        },
    },
    roomMembersPage: {
        memberNotFound: 'Nie znaleziono członka.',
        useInviteButton: 'Aby zaprosić nowego członka do czatu, użyj przycisku zaproszenia powyżej.',
        notAuthorized: "Nie masz dost\u0119pu do tej strony. Je\u015Bli pr\u00F3bujesz do\u0142\u0105czy\u0107 do tego pokoju, popro\u015B cz\u0142onka pokoju, aby Ci\u0119 doda\u0142. Co\u015B innego? Skontaktuj si\u0119 z ".concat(CONST_1.default.EMAIL.CONCIERGE),
        removeMembersPrompt: function (_a) {
            var memberName = _a.memberName;
            return ({
                one: "Czy na pewno chcesz usun\u0105\u0107 ".concat(memberName, " z pokoju?"),
                other: 'Czy na pewno chcesz usunąć wybranych członków z pokoju?',
            });
        },
        error: {
            genericAdd: 'Wystąpił problem z dodaniem tego członka pokoju',
        },
    },
    newTaskPage: {
        assignTask: 'Przypisz zadanie',
        assignMe: 'Przypisz do mnie',
        confirmTask: 'Potwierdź zadanie',
        confirmError: 'Proszę wprowadzić tytuł i wybrać miejsce udostępnienia',
        descriptionOptional: 'Opis (opcjonalnie)',
        pleaseEnterTaskName: 'Proszę wprowadzić tytuł',
        pleaseEnterTaskDestination: 'Proszę wybrać, gdzie chcesz udostępnić to zadanie',
    },
    task: {
        task: 'Zadanie',
        title: 'Tytuł',
        description: 'Opis',
        assignee: 'Przypisany',
        completed: 'Zakończono',
        action: 'Ukończ',
        messages: {
            created: function (_a) {
                var title = _a.title;
                return "zadanie dla ".concat(title);
            },
            completed: 'oznaczone jako ukończone',
            canceled: 'usunięte zadanie',
            reopened: 'oznaczone jako niekompletne',
            error: 'Nie masz uprawnień do wykonania żądanej akcji.',
        },
        markAsComplete: 'Oznacz jako ukończone',
        markAsIncomplete: 'Oznacz jako niekompletne',
        assigneeError: 'Wystąpił błąd podczas przypisywania tego zadania. Proszę spróbować przypisać je do innej osoby.',
        genericCreateTaskFailureMessage: 'Wystąpił błąd podczas tworzenia tego zadania. Proszę spróbować ponownie później.',
        deleteTask: 'Usuń zadanie',
        deleteConfirmation: 'Czy na pewno chcesz usunąć to zadanie?',
    },
    statementPage: {
        title: function (_a) {
            var year = _a.year, monthName = _a.monthName;
            return "Wyci\u0105g za ".concat(monthName, " ").concat(year);
        },
    },
    keyboardShortcutsPage: {
        title: 'Skróty klawiaturowe',
        subtitle: 'Oszczędzaj czas dzięki tym przydatnym skrótom klawiaturowym:',
        shortcuts: {
            openShortcutDialog: 'Otwiera okno dialogowe skrótów klawiaturowych',
            markAllMessagesAsRead: 'Oznacz wszystkie wiadomości jako przeczytane',
            escape: 'Dialogi ucieczki',
            search: 'Otwórz okno wyszukiwania',
            newChat: 'Nowy ekran czatu',
            copy: 'Skopiuj komentarz',
            openDebug: 'Otwórz okno dialogowe preferencji testowania',
        },
    },
    guides: {
        screenShare: 'Udostępnianie ekranu',
        screenShareRequest: 'Expensify zaprasza Cię do udostępnienia ekranu',
    },
    search: {
        resultsAreLimited: 'Wyniki wyszukiwania są ograniczone.',
        viewResults: 'Wyświetl wyniki',
        resetFilters: 'Zresetuj filtry',
        searchResults: {
            emptyResults: {
                title: 'Brak danych do wyświetlenia',
                subtitle: 'Spróbuj dostosować kryteria wyszukiwania lub utwórz coś za pomocą zielonego przycisku +.',
            },
            emptyExpenseResults: {
                title: 'Nie utworzyłeś jeszcze żadnych wydatków.',
                subtitle: 'Utwórz wydatek lub wypróbuj Expensify, aby dowiedzieć się więcej.',
                subtitleWithOnlyCreateButton: 'Użyj zielonego przycisku poniżej, aby utworzyć wydatek.',
            },
            emptyReportResults: {
                title: 'Nie utworzyłeś jeszcze żadnych raportów.',
                subtitle: 'Utwórz raport lub wypróbuj Expensify, aby dowiedzieć się więcej.',
                subtitleWithOnlyCreateButton: 'Użyj zielonego przycisku poniżej, aby utworzyć raport.',
            },
            emptyInvoiceResults: {
                title: 'Nie utworzyłeś jeszcze żadnych faktur.',
                subtitle: 'Wyślij fakturę lub wypróbuj Expensify, aby dowiedzieć się więcej.',
                subtitleWithOnlyCreateButton: 'Użyj zielonego przycisku poniżej, aby wysłać fakturę.',
            },
            emptyTripResults: {
                title: 'Brak wyświetlanych podróży',
                subtitle: 'Rozpocznij, rezerwując swoją pierwszą podróż poniżej.',
                buttonText: 'Zarezerwuj podróż',
            },
            emptySubmitResults: {
                title: 'Brak wydatków do przesłania',
                subtitle: 'Wszystko w porządku. Zrób rundę zwycięstwa!',
                buttonText: 'Utwórz raport',
            },
            emptyApproveResults: {
                title: 'Brak wydatków do zatwierdzenia',
                subtitle: 'Zero wydatków. Maksymalny relaks. Dobra robota!',
            },
            emptyPayResults: {
                title: 'Brak wydatków do zapłaty',
                subtitle: 'Gratulacje! Przekroczyłeś linię mety.',
            },
            emptyExportResults: {
                title: 'Brak wydatków do eksportu',
                subtitle: 'Czas się zrelaksować, dobra robota.',
            },
            emptyUnapprovedResults: {
                title: 'Brak wydatków do zatwierdzenia',
                subtitle: 'Zero wydatków. Maksymalny relaks. Dobra robota!',
            },
        },
        unapproved: 'Niezatwierdzony',
        unapprovedCash: 'Niezatwierdzone środki pieniężne',
        unapprovedCompanyCards: 'Niezatwierdzone karty firmowe',
        saveSearch: 'Zapisz wyszukiwanie',
        deleteSavedSearch: 'Usuń zapisaną wyszukiwarkę',
        deleteSavedSearchConfirm: 'Czy na pewno chcesz usunąć to wyszukiwanie?',
        searchName: 'Wyszukaj imię',
        savedSearchesMenuItemTitle: 'Zapisano',
        groupedExpenses: 'pogrupowane wydatki',
        bulkActions: {
            approve: 'Zatwierdź',
            pay: 'Zapłać',
            delete: 'Usuń',
            hold: 'Trzymaj',
            unhold: 'Usuń blokadę',
            noOptionsAvailable: 'Brak dostępnych opcji dla wybranej grupy wydatków.',
        },
        filtersHeader: 'Filtry',
        filters: {
            date: {
                before: function (_a) {
                    var _b = _a === void 0 ? {} : _a, date = _b.date;
                    return "Before ".concat(date !== null && date !== void 0 ? date : '');
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
                    _7[CONST_1.default.SEARCH.DATE_PRESETS.NEVER] = 'Nigdy',
                    _7[CONST_1.default.SEARCH.DATE_PRESETS.LAST_MONTH] = 'Ostatni miesiąc',
                    _7),
            },
            status: 'Status',
            keyword: 'Słowo kluczowe',
            hasKeywords: 'Ma słowa kluczowe',
            currency: 'Waluta',
            link: 'Link',
            pinned: 'Przypięte',
            unread: 'Nieprzeczytane',
            completed: 'Zakończono',
            amount: {
                lessThan: function (_a) {
                    var _b = _a === void 0 ? {} : _a, amount = _b.amount;
                    return "Mniej ni\u017C ".concat(amount !== null && amount !== void 0 ? amount : '');
                },
                greaterThan: function (_a) {
                    var _b = _a === void 0 ? {} : _a, amount = _b.amount;
                    return "Wi\u0119ksze ni\u017C ".concat(amount !== null && amount !== void 0 ? amount : '');
                },
                between: function (_a) {
                    var greaterThan = _a.greaterThan, lessThan = _a.lessThan;
                    return "Pomi\u0119dzy ".concat(greaterThan, " a ").concat(lessThan);
                },
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Indywidualne karty',
                closedCards: 'Zamknięte karty',
                cardFeeds: 'Kanały kart',
                cardFeedName: function (_a) {
                    var cardFeedBankName = _a.cardFeedBankName, cardFeedLabel = _a.cardFeedLabel;
                    return "Wszystkie ".concat(cardFeedBankName).concat(cardFeedLabel ? " - ".concat(cardFeedLabel) : '');
                },
                cardFeedNameCSV: function (_a) {
                    var cardFeedLabel = _a.cardFeedLabel;
                    return "Wszystkie zaimportowane karty CSV".concat(cardFeedLabel ? " - ".concat(cardFeedLabel) : '');
                },
            },
            current: 'Obecny',
            past: 'Przeszłość',
            submitted: 'Data złożenia',
            approved: 'Data zatwierdzenia',
            paid: 'Data płatności',
            exported: 'Data eksportu',
            posted: 'Data opublikowania',
            billable: 'Podlegające fakturowaniu',
            reimbursable: 'Podlegające zwrotowi',
            groupBy: {
                reports: 'Raport',
                members: 'Członek',
                cards: 'Karta',
            },
        },
        groupBy: 'Grupa według',
        moneyRequestReport: {
            emptyStateTitle: 'Ten raport nie zawiera wydatków.',
            emptyStateSubtitle: 'Możesz dodać wydatki do tego raportu, używając przycisku powyżej.',
        },
        noCategory: 'Brak kategorii',
        noTag: 'Brak tagu',
        expenseType: 'Typ wydatku',
        recentSearches: 'Ostatnie wyszukiwania',
        recentChats: 'Ostatnie czaty',
        searchIn: 'Szukaj w',
        searchPlaceholder: 'Wyszukaj coś',
        suggestions: 'Sugestie',
        exportSearchResults: {
            title: 'Utwórz eksport',
            description: 'Wow, to dużo przedmiotów! Spakujemy je, a Concierge wkrótce wyśle Ci plik.',
        },
        exportAll: {
            selectAllMatchingItems: 'Wybierz wszystkie pasujące elementy',
            allMatchingItemsSelected: 'Wszystkie pasujące elementy zostały wybrane',
        },
    },
    genericErrorPage: {
        title: 'Ups, coś poszło nie tak!',
        body: {
            helpTextMobile: 'Proszę zamknąć i ponownie otworzyć aplikację lub przełączyć się na',
            helpTextWeb: 'web.',
            helpTextConcierge: 'Jeśli problem będzie się powtarzał, skontaktuj się z',
        },
        refresh: 'Odśwież',
    },
    fileDownload: {
        success: {
            title: 'Pobrano!',
            message: 'Załącznik został pomyślnie pobrany!',
            qrMessage: 'Sprawdź folder ze zdjęciami lub pobranymi plikami, aby znaleźć kopię swojego kodu QR. Porada: Dodaj go do prezentacji, aby Twoja publiczność mogła go zeskanować i bezpośrednio się z Tobą połączyć.',
        },
        generalError: {
            title: 'Błąd załącznika',
            message: 'Załącznik nie może zostać pobrany',
        },
        permissionError: {
            title: 'Dostęp do pamięci masowej',
            message: 'Expensify nie może zapisać załączników bez dostępu do pamięci. Stuknij ustawienia, aby zaktualizować uprawnienia.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Nowy Expensify',
        about: 'O nowym Expensify',
        update: 'Zaktualizuj New Expensify',
        checkForUpdates: 'Sprawdź aktualizacje',
        toggleDevTools: 'Przełącz Narzędzia Deweloperskie',
        viewShortcuts: 'Wyświetl skróty klawiaturowe',
        services: 'Usługi',
        hide: 'Ukryj New Expensify',
        hideOthers: 'Ukryj pozostałe',
        showAll: 'Pokaż wszystkie',
        quit: 'Zrezygnuj z New Expensify',
        fileMenu: 'Plik',
        closeWindow: 'Zamknij okno',
        editMenu: 'Edytuj',
        undo: 'Cofnij',
        redo: 'Ponów',
        cut: 'Wytnij',
        copy: 'Kopiuj',
        paste: 'Wklej',
        pasteAndMatchStyle: 'Wklej i Dopasuj Styl',
        pasteAsPlainText: 'Wklej jako tekst niesformatowany',
        delete: 'Usuń',
        selectAll: 'Zaznacz wszystko',
        speechSubmenu: 'Mowa',
        startSpeaking: 'Zacznij mówić',
        stopSpeaking: 'Przestań mówić',
        viewMenu: 'Widok',
        reload: 'Przeładuj',
        forceReload: 'Wymuś ponowne załadowanie',
        resetZoom: 'Rzeczywisty rozmiar',
        zoomIn: 'Powiększ',
        zoomOut: 'Oddalaj',
        togglefullscreen: 'Przełącz pełny ekran',
        historyMenu: 'Historia',
        back: 'Wstecz',
        forward: 'Prześlij dalej',
        windowMenu: 'Okno',
        minimize: 'Zminimalizuj',
        zoom: 'Zoom',
        front: 'Przenieś wszystko na wierzch',
        helpMenu: 'Pomoc',
        learnMore: 'Dowiedz się więcej',
        documentation: 'Dokumentacja',
        communityDiscussions: 'Dyskusje społecznościowe',
        searchIssues: 'Wyszukaj problemy',
    },
    historyMenu: {
        forward: 'Prześlij dalej',
        back: 'Wstecz',
    },
    checkForUpdatesModal: {
        available: {
            title: 'Aktualizacja dostępna',
            message: function (_a) {
                var isSilentUpdating = _a.isSilentUpdating;
                return "Nowa wersja b\u0119dzie dost\u0119pna wkr\u00F3tce.".concat(!isSilentUpdating ? 'Powiadomimy Cię, gdy będziemy gotowi do aktualizacji.' : '');
            },
            soundsGood: 'Brzmi dobrze',
        },
        notAvailable: {
            title: 'Aktualizacja niedostępna',
            message: 'Obecnie nie ma dostępnych aktualizacji. Proszę sprawdzić ponownie później!',
            okay: 'Okay',
        },
        error: {
            title: 'Aktualizacja nie powiodła się',
            message: 'Nie udało nam się sprawdzić aktualizacji. Spróbuj ponownie za chwilę.',
        },
    },
    report: {
        newReport: {
            createReport: 'Utwórz raport',
            chooseWorkspace: 'Wybierz przestrzeń roboczą dla tego raportu.',
        },
        genericCreateReportFailureMessage: 'Nieoczekiwany błąd podczas tworzenia tego czatu. Proszę spróbować ponownie później.',
        genericAddCommentFailureMessage: 'Nieoczekiwany błąd podczas publikowania komentarza. Spróbuj ponownie później.',
        genericUpdateReportFieldFailureMessage: 'Nieoczekiwany błąd podczas aktualizacji pola. Spróbuj ponownie później.',
        genericUpdateReportNameEditFailureMessage: 'Nieoczekiwany błąd podczas zmiany nazwy raportu. Proszę spróbować ponownie później.',
        noActivityYet: 'Brak aktywności',
        actions: {
            type: {
                changeField: function (_a) {
                    var oldValue = _a.oldValue, newValue = _a.newValue, fieldName = _a.fieldName;
                    return "zmieniono ".concat(fieldName, " z ").concat(oldValue, " na ").concat(newValue);
                },
                changeFieldEmpty: function (_a) {
                    var newValue = _a.newValue, fieldName = _a.fieldName;
                    return "zmieniono ".concat(fieldName, " na ").concat(newValue);
                },
                changeReportPolicy: function (_a) {
                    var fromPolicyName = _a.fromPolicyName, toPolicyName = _a.toPolicyName;
                    return "zmieniono przestrze\u0144 robocz\u0105 na ".concat(toPolicyName).concat(fromPolicyName ? "(uprzednio ".concat(fromPolicyName, ")") : '');
                },
                changeType: function (_a) {
                    var oldType = _a.oldType, newType = _a.newType;
                    return "zmieniono typ z ".concat(oldType, " na ").concat(newType);
                },
                delegateSubmit: function (_a) {
                    var delegateUser = _a.delegateUser, originalManager = _a.originalManager;
                    return "wys\u0142a\u0142 ten raport do ".concat(delegateUser, ", poniewa\u017C ").concat(originalManager, " jest na urlopie");
                },
                exportedToCSV: "wyeksportowano do CSV",
                exportedToIntegration: {
                    automatic: function (_a) {
                        var label = _a.label;
                        return "wyeksportowano do ".concat(label);
                    },
                    automaticActionOne: function (_a) {
                        var label = _a.label;
                        return "wyeksportowano do ".concat(label, " przez");
                    },
                    automaticActionTwo: 'ustawienia księgowe',
                    manual: function (_a) {
                        var label = _a.label;
                        return "oznaczy\u0142 ten raport jako r\u0119cznie wyeksportowany do ".concat(label, ".");
                    },
                    automaticActionThree: 'i pomyślnie utworzono rekord dla',
                    reimburseableLink: 'wydatki z własnej kieszeni',
                    nonReimbursableLink: 'wydatki na firmową kartę',
                    pending: function (_a) {
                        var label = _a.label;
                        return "rozpocz\u0119to eksportowanie tego raportu do ".concat(label, "...");
                    },
                },
                integrationsMessage: function (_a) {
                    var errorMessage = _a.errorMessage, label = _a.label, linkText = _a.linkText, linkURL = _a.linkURL;
                    return "nie uda\u0142o si\u0119 wyeksportowa\u0107 tego raportu do ".concat(label, " (\"").concat(errorMessage, " ").concat(linkText ? "<a href=\"".concat(linkURL, "\">").concat(linkText, "</a>") : '', "\")");
                },
                managerAttachReceipt: "dodano paragon",
                managerDetachReceipt: "usuni\u0119to paragon",
                markedReimbursed: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "zap\u0142acono ".concat(currency).concat(amount, " gdzie indziej");
                },
                markedReimbursedFromIntegration: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "zap\u0142acono ".concat(currency).concat(amount, " przez integracj\u0119");
                },
                outdatedBankAccount: "nie mo\u017Cna by\u0142o przetworzy\u0107 p\u0142atno\u015Bci z powodu problemu z kontem bankowym p\u0142atnika",
                reimbursementACHBounce: "nie mo\u017Cna przetworzy\u0107 p\u0142atno\u015Bci, poniewa\u017C p\u0142atnik nie ma wystarczaj\u0105cych \u015Brodk\u00F3w",
                reimbursementACHCancelled: "anulowa\u0142 p\u0142atno\u015B\u0107",
                reimbursementAccountChanged: "nie mo\u017Cna by\u0142o przetworzy\u0107 p\u0142atno\u015Bci, poniewa\u017C p\u0142atnik zmieni\u0142 konto bankowe",
                reimbursementDelayed: "przetworzono p\u0142atno\u015B\u0107, ale jest op\u00F3\u017Aniona o 1-2 dni robocze wi\u0119cej",
                selectedForRandomAudit: "losowo wybrany do przegl\u0105du",
                selectedForRandomAuditMarkdown: "[losowo wybrany](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) do przegl\u0105du",
                share: function (_a) {
                    var to = _a.to;
                    return "zaproszony cz\u0142onek ".concat(to);
                },
                unshare: function (_a) {
                    var to = _a.to;
                    return "usuni\u0119to cz\u0142onka ".concat(to);
                },
                stripePaid: function (_a) {
                    var amount = _a.amount, currency = _a.currency;
                    return "zap\u0142acono ".concat(currency).concat(amount);
                },
                takeControl: "przej\u0105\u0142 kontrol\u0119",
                integrationSyncFailed: function (_a) {
                    var label = _a.label, errorMessage = _a.errorMessage, workspaceAccountingLink = _a.workspaceAccountingLink;
                    return "Wyst\u0105pi\u0142 problem z synchronizacj\u0105 z ".concat(label).concat(errorMessage ? " (\"".concat(errorMessage, "\")") : '', ". Prosz\u0119 rozwi\u0105za\u0107 problem w <a href=\"").concat(workspaceAccountingLink, "\">ustawieniach przestrzeni roboczej</a>.");
                },
                addEmployee: function (_a) {
                    var email = _a.email, role = _a.role;
                    return "dodano ".concat(email, " jako ").concat(role === 'member' ? 'a' : 'an', " ").concat(role);
                },
                updateRole: function (_a) {
                    var email = _a.email, currentRole = _a.currentRole, newRole = _a.newRole;
                    return "zaktualizowano rol\u0119 ".concat(email, " na ").concat(newRole, " (wcze\u015Bniej ").concat(currentRole, ")");
                },
                updatedCustomField1: function (_a) {
                    var email = _a.email, previousValue = _a.previousValue, newValue = _a.newValue;
                    if (!newValue) {
                        return "usuni\u0119to pole niestandardowe 1 u\u017Cytkownika ".concat(email, " (wcze\u015Bniej \u201E").concat(previousValue, "\u201D)");
                    }
                    return !previousValue
                        ? "dodano \"".concat(newValue, "\" do pola niestandardowego 1 u\u017Cytkownika ").concat(email)
                        : "zmieniono pole niestandardowe 1 u\u017Cytkownika ".concat(email, " na \"").concat(newValue, "\" (wcze\u015Bniej \"").concat(previousValue, "\")");
                },
                updatedCustomField2: function (_a) {
                    var email = _a.email, previousValue = _a.previousValue, newValue = _a.newValue;
                    if (!newValue) {
                        return "usuni\u0119to pole niestandardowe 2 u\u017Cytkownika ".concat(email, " (wcze\u015Bniej \u201E").concat(previousValue, "\u201D)");
                    }
                    return !previousValue
                        ? "dodano \"".concat(newValue, "\" do pola niestandardowego 2 u\u017Cytkownika ").concat(email)
                        : "zmieniono pole niestandardowe 2 u\u017Cytkownika ".concat(email, " na \"").concat(newValue, "\" (wcze\u015Bniej \"").concat(previousValue, "\")");
                },
                leftWorkspace: function (_a) {
                    var nameOrEmail = _a.nameOrEmail;
                    return "".concat(nameOrEmail, " opu\u015Bci\u0142(a) przestrze\u0144 robocz\u0105");
                },
                removeMember: function (_a) {
                    var email = _a.email, role = _a.role;
                    return "usuni\u0119to ".concat(role, " ").concat(email);
                },
                removedConnection: function (_a) {
                    var connectionName = _a.connectionName;
                    return "usuni\u0119to po\u0142\u0105czenie z ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
                },
                addedConnection: function (_a) {
                    var connectionName = _a.connectionName;
                    return "po\u0142\u0105czono z ".concat(CONST_1.default.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]);
                },
                leftTheChat: 'opuścił czat',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: function (_a) {
            var summary = _a.summary, dayCount = _a.dayCount, date = _a.date;
            return "".concat(summary, " dla ").concat(dayCount, " ").concat(dayCount === 1 ? 'dzień' : 'dni', " do ").concat(date);
        },
        oooEventSummaryPartialDay: function (_a) {
            var summary = _a.summary, timePeriod = _a.timePeriod, date = _a.date;
            return "".concat(summary, " z ").concat(timePeriod, " dnia ").concat(date);
        },
    },
    footer: {
        features: 'Funkcje',
        expenseManagement: 'Zarządzanie wydatkami',
        spendManagement: 'Zarządzanie wydatkami',
        expenseReports: 'Raporty wydatków',
        companyCreditCard: 'Karta kredytowa firmy',
        receiptScanningApp: 'Aplikacja do skanowania paragonów',
        billPay: 'Bill Pay',
        invoicing: 'Fakturowanie',
        CPACard: 'Karta CPA',
        payroll: 'Payroll',
        travel: 'Podróżować',
        resources: 'Zasoby',
        expensifyApproved: 'ExpensifyApproved!',
        pressKit: 'Press Kit',
        support: 'Wsparcie',
        expensifyHelp: 'ExpensifyHelp',
        terms: 'Warunki korzystania z usługi',
        privacy: 'Prywatność',
        learnMore: 'Dowiedz się więcej',
        aboutExpensify: 'O Expensify',
        blog: 'Blog',
        jobs: 'Prace',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Relacje Inwestorskie',
        getStarted: 'Rozpocznij',
        createAccount: 'Utwórz nowe konto',
        logIn: 'Zaloguj się',
    },
    allStates: expensify_common_1.CONST.STATES,
    allCountries: CONST_1.default.ALL_COUNTRIES,
    accessibilityHints: {
        navigateToChatsList: 'Przejdź z powrotem do listy czatów',
        chatWelcomeMessage: 'Wiadomość powitalna czatu',
        navigatesToChat: 'Przechodzi do czatu',
        newMessageLineIndicator: 'Wskaźnik nowej wiadomości',
        chatMessage: 'Wiadomość czatu',
        lastChatMessagePreview: 'Podgląd ostatniej wiadomości na czacie',
        workspaceName: 'Nazwa przestrzeni roboczej',
        chatUserDisplayNames: 'Nazwy wyświetlane członków czatu',
        scrollToNewestMessages: 'Przewiń do najnowszych wiadomości',
        preStyledText: 'Wstępnie sformatowany tekst',
        viewAttachment: 'Wyświetl załącznik',
    },
    parentReportAction: {
        deletedReport: 'Usunięty raport',
        deletedMessage: 'Usunięta wiadomość',
        deletedExpense: 'Usunięty wydatek',
        reversedTransaction: 'Cofnięta transakcja',
        deletedTask: 'Usunięte zadanie',
        hiddenMessage: 'Ukryta wiadomość',
    },
    threads: {
        thread: 'Wątek',
        replies: 'Odpowiedzi',
        reply: 'Odpowiedz',
        from: 'Od',
        in: 'w',
        parentNavigationSummary: function (_a) {
            var reportName = _a.reportName, workspaceName = _a.workspaceName;
            return "Od ".concat(reportName).concat(workspaceName ? "w ".concat(workspaceName) : '');
        },
    },
    qrCodes: {
        copy: 'Skopiuj URL',
        copied: 'Skopiowano!',
    },
    moderation: {
        flagDescription: 'Wszystkie oznaczone wiadomości zostaną przesłane do moderatora do weryfikacji.',
        chooseAReason: 'Wybierz powód oznaczenia poniżej:',
        spam: 'Spam',
        spamDescription: 'Niechciana promocja niezwiązana z tematem',
        inconsiderate: 'Nieuprzejmy',
        inconsiderateDescription: 'Obrażające lub lekceważące sformułowania, z wątpliwymi intencjami',
        intimidation: 'Zastraszanie',
        intimidationDescription: 'Agresywne forsowanie programu pomimo uzasadnionych zastrzeżeń',
        bullying: 'Nękanie',
        bullyingDescription: 'Celowanie w jednostkę w celu uzyskania posłuszeństwa',
        harassment: 'Nękanie',
        harassmentDescription: 'Rasistowskie, mizoginistyczne lub inne ogólnie dyskryminujące zachowanie',
        assault: 'Atak',
        assaultDescription: 'Specyficzny atak emocjonalny z zamiarem wyrządzenia krzywdy',
        flaggedContent: 'Ta wiadomość została oznaczona jako naruszająca zasady naszej społeczności, a jej treść została ukryta.',
        hideMessage: 'Ukryj wiadomość',
        revealMessage: 'Pokaż wiadomość',
        levelOneResult: 'Wysyła anonimowe ostrzeżenie i wiadomość jest zgłaszana do przeglądu.',
        levelTwoResult: 'Wiadomość ukryta z kanału, plus anonimowe ostrzeżenie i wiadomość została zgłoszona do przeglądu.',
        levelThreeResult: 'Wiadomość usunięta z kanału, dodano anonimowe ostrzeżenie, a wiadomość została zgłoszona do przeglądu.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Zaproś ich',
        nothing: 'Do nothing',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Akceptuj',
        decline: 'Odrzuć',
    },
    actionableMentionTrackExpense: {
        submit: 'Prześlij to komuś',
        categorize: 'Kategoryzuj to',
        share: 'Udostępnij to mojemu księgowemu',
        nothing: 'Nic na razie',
    },
    teachersUnitePage: {
        teachersUnite: 'Nauczyciele, łączcie się',
        joinExpensifyOrg: 'Dołącz do Expensify.org, aby wyeliminować niesprawiedliwość na całym świecie. Obecna kampania "Teachers Unite" wspiera nauczycieli wszędzie, dzieląc koszty niezbędnych materiałów szkolnych.',
        iKnowATeacher: 'Znam nauczyciela',
        iAmATeacher: 'Jestem nauczycielem',
        getInTouch: 'Świetnie! Proszę podziel się ich informacjami, abyśmy mogli się z nimi skontaktować.',
        introSchoolPrincipal: 'Wprowadzenie do dyrektora szkoły',
        schoolPrincipalVerifyExpense: 'Expensify.org dzieli koszty podstawowych przyborów szkolnych, aby uczniowie z gospodarstw domowych o niskich dochodach mogli mieć lepsze doświadczenia edukacyjne. Twój dyrektor zostanie poproszony o weryfikację Twoich wydatków.',
        principalFirstName: 'Imię główne',
        principalLastName: 'Nazwisko dyrektora',
        principalWorkEmail: 'Główny służbowy adres e-mail',
        updateYourEmail: 'Zaktualizuj swój adres e-mail',
        updateEmail: 'Zaktualizuj adres e-mail',
        schoolMailAsDefault: function (_a) {
            var contactMethodsRoute = _a.contactMethodsRoute;
            return "Zanim przejdziesz dalej, upewnij si\u0119, \u017Ce ustawi\u0142e\u015B sw\u00F3j szkolny e-mail jako domy\u015Bln\u0105 metod\u0119 kontaktu. Mo\u017Cesz to zrobi\u0107 w Ustawieniach > Profil > <a href=\"".concat(contactMethodsRoute, "\">Metody kontaktu</a>.");
        },
        error: {
            enterPhoneEmail: 'Wprowadź prawidłowy adres e-mail lub numer telefonu',
            enterEmail: 'Wprowadź adres e-mail',
            enterValidEmail: 'Wprowadź prawidłowy adres e-mail',
            tryDifferentEmail: 'Proszę spróbować inny adres e-mail',
        },
    },
    cardTransactions: {
        notActivated: 'Nieaktywowany',
        outOfPocket: 'Wydatki z własnej kieszeni',
        companySpend: 'Wydatki firmowe',
    },
    distance: {
        addStop: 'Dodaj przystanek',
        deleteWaypoint: 'Usuń punkt orientacyjny',
        deleteWaypointConfirmation: 'Czy na pewno chcesz usunąć ten punkt nawigacyjny?',
        address: 'Adres',
        waypointDescription: {
            start: 'Start',
            stop: 'Stop',
        },
        mapPending: {
            title: 'Zmapuj oczekujące',
            subtitle: 'Mapa zostanie wygenerowana, gdy ponownie połączysz się z internetem',
            onlineSubtitle: 'Chwileczkę, przygotowujemy mapę.',
            errorTitle: 'Błąd mapy',
            errorSubtitle: 'Wystąpił błąd podczas ładowania mapy. Proszę spróbować ponownie.',
        },
        error: {
            selectSuggestedAddress: 'Proszę wybrać sugerowany adres lub użyć bieżącej lokalizacji',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: 'Karta raportu zgubiona lub uszkodzona',
        nextButtonLabel: 'Następny',
        reasonTitle: 'Dlaczego potrzebujesz nowej karty?',
        cardDamaged: 'Moja karta została uszkodzona',
        cardLostOrStolen: 'Moja karta została zgubiona lub skradziona',
        confirmAddressTitle: 'Proszę potwierdzić adres pocztowy dla nowej karty.',
        cardDamagedInfo: 'Twoja nowa karta dotrze w ciągu 2-3 dni roboczych. Twoja obecna karta będzie działać do momentu aktywacji nowej.',
        cardLostOrStolenInfo: 'Twoja obecna karta zostanie trwale dezaktywowana, gdy tylko złożysz zamówienie. Większość kart dociera w ciągu kilku dni roboczych.',
        address: 'Adres',
        deactivateCardButton: 'Dezaktywuj kartę',
        shipNewCardButton: 'Wyślij nową kartę',
        addressError: 'Adres jest wymagany',
        successTitle: 'Twoja nowa karta jest w drodze!',
        successDescription: 'Po jej otrzymaniu, będziesz musiał(a) ją aktywować. W międzyczasie możesz korzystać z karty wirtualnej.',
        reasonError: 'Powód jest wymagany',
    },
    eReceipt: {
        guaranteed: 'Gwarantowany eParagon',
        transactionDate: 'Data transakcji',
    },
    referralProgram: (_8 = {},
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT] = {
            buttonText1: 'Rozpocznij czat,',
            buttonText2: 'poleć znajomego.',
            header: 'Rozpocznij czat, poleć znajomego',
            body: 'Chcesz, aby Twoi znajomi również korzystali z Expensify? Po prostu rozpocznij z nimi czat, a my zajmiemy się resztą.',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE] = {
            buttonText1: 'Prześlij wydatek,',
            buttonText2: 'poleć swojego szefa.',
            header: 'Złóż wydatek, poleć swojego szefa',
            body: 'Chcesz, aby Twój szef również korzystał z Expensify? Po prostu prześlij mu raport wydatków, a my zajmiemy się resztą.',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND] = {
            header: 'Poleć znajomego',
            body: 'Chcesz, aby Twoi znajomi również korzystali z Expensify? Po prostu czatuj, płać lub dziel się z nimi wydatkami, a my zajmiemy się resztą. Albo po prostu udostępnij swój link zapraszający!',
        },
        _8[CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE] = {
            buttonText: 'Poleć znajomego',
            header: 'Poleć znajomego',
            body: 'Chcesz, aby Twoi znajomi również korzystali z Expensify? Po prostu czatuj, płać lub dziel się z nimi wydatkami, a my zajmiemy się resztą. Albo po prostu udostępnij swój link zapraszający!',
        },
        _8.copyReferralLink = 'Skopiuj link zaproszenia',
        _8),
    systemChatFooterMessage: (_9 = {},
        _9[CONST_1.default.INTRO_CHOICES.MANAGE_TEAM] = {
            phrase1: 'Porozmawiaj ze swoim specjalistą ds. konfiguracji w',
            phrase2: 'po pomoc',
        },
        _9.default = {
            phrase1: 'Wiadomość',
            phrase2: 'w celu uzyskania pomocy przy konfiguracji',
        },
        _9),
    violations: {
        allTagLevelsRequired: 'Wszystkie wymagane tagi',
        autoReportedRejectedExpense: function (_a) {
            var rejectReason = _a.rejectReason, rejectedBy = _a.rejectedBy;
            return "".concat(rejectedBy, " odrzuci\u0142 ten wydatek z komentarzem \u201E").concat(rejectReason, "\u201D");
        },
        billableExpense: 'Opłata nie jest już ważna',
        cashExpenseWithNoReceipt: function (_a) {
            var _b = _a === void 0 ? {} : _a, formattedLimit = _b.formattedLimit;
            return "Receipt required".concat(formattedLimit ? "powy\u017Cej ".concat(formattedLimit) : '');
        },
        categoryOutOfPolicy: 'Kategoria nie jest już ważna',
        conversionSurcharge: function (_a) {
            var surcharge = _a.surcharge;
            return "Zastosowano ".concat(surcharge, "% op\u0142at\u0119 za przeliczenie");
        },
        customUnitOutOfPolicy: 'Stawka nie jest ważna dla tego miejsca pracy',
        duplicatedTransaction: 'Duplikat',
        fieldRequired: 'Pola raportu są wymagane',
        futureDate: 'Przyszła data niedozwolona',
        invoiceMarkup: function (_a) {
            var invoiceMarkup = _a.invoiceMarkup;
            return "Oznaczone o ".concat(invoiceMarkup, "%");
        },
        maxAge: function (_a) {
            var maxAge = _a.maxAge;
            return "Data starsza ni\u017C ".concat(maxAge, " dni");
        },
        missingCategory: 'Brakująca kategoria',
        missingComment: 'Wymagany opis dla wybranej kategorii',
        missingTag: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "Brakuj\u0105cy ".concat(tagName !== null && tagName !== void 0 ? tagName : 'tag');
        },
        modifiedAmount: function (_a) {
            var type = _a.type, displayPercentVariance = _a.displayPercentVariance;
            switch (type) {
                case 'distance':
                    return 'Kwota różni się od obliczonej odległości';
                case 'card':
                    return 'Kwota większa niż transakcja kartą';
                default:
                    if (displayPercentVariance) {
                        return "Kwota ".concat(displayPercentVariance, "% wi\u0119ksza ni\u017C zeskanowany paragon");
                    }
                    return 'Kwota większa niż zeskanowany paragon';
            }
        },
        modifiedDate: 'Data różni się od zeskanowanego paragonu',
        nonExpensiworksExpense: 'Wydatek spoza Expensiworks',
        overAutoApprovalLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Wydatek przekracza limit automatycznej akceptacji wynosz\u0105cy ".concat(formattedLimit);
        },
        overCategoryLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Kwota przekracza limit ".concat(formattedLimit, " na osob\u0119 w kategorii");
        },
        overLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Kwota przekracza limit ".concat(formattedLimit, "/osob\u0119");
        },
        overLimitAttendee: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Kwota przekracza limit ".concat(formattedLimit, "/osob\u0119");
        },
        perDayLimit: function (_a) {
            var formattedLimit = _a.formattedLimit;
            return "Kwota przekracza dzienny limit ".concat(formattedLimit, "/osoba dla kategorii");
        },
        receiptNotSmartScanned: 'Szczegóły wydatków i paragon dodane ręcznie. Proszę zweryfikować szczegóły. <a href="https://help.expensify.com/articles/expensify-classic/reports/Automatic-Receipt-Audit">Dowiedz się więcej</a> o automatycznym audycie wszystkich paragonów.',
        receiptRequired: function (_a) {
            var formattedLimit = _a.formattedLimit, category = _a.category;
            var message = 'Wymagany paragon';
            if (formattedLimit !== null && formattedLimit !== void 0 ? formattedLimit : category) {
                message += 'ponad';
                if (formattedLimit) {
                    message += " ".concat(formattedLimit);
                }
                if (category) {
                    message += 'limit kategorii';
                }
            }
            return message;
        },
        prohibitedExpense: function (_a) {
            var prohibitedExpenseType = _a.prohibitedExpenseType;
            var preMessage = 'Zabroniony wydatek:';
            switch (prohibitedExpenseType) {
                case 'alcohol':
                    return "".concat(preMessage, " alkohol");
                case 'gambling':
                    return "".concat(preMessage, " hazardowanie");
                case 'tobacco':
                    return "".concat(preMessage, " tyto\u0144");
                case 'adultEntertainment':
                    return "".concat(preMessage, " rozrywka dla doros\u0142ych");
                case 'hotelIncidentals':
                    return "".concat(preMessage, " wydatki hotelowe");
                default:
                    return "".concat(preMessage).concat(prohibitedExpenseType);
            }
        },
        customRules: function (_a) {
            var message = _a.message;
            return message;
        },
        reviewRequired: 'Wymagana recenzja',
        rter: function (_a) {
            var brokenBankConnection = _a.brokenBankConnection, email = _a.email, isAdmin = _a.isAdmin, isTransactionOlderThan7Days = _a.isTransactionOlderThan7Days, member = _a.member, rterType = _a.rterType;
            if (rterType === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return 'Nie można automatycznie dopasować paragonu z powodu przerwanego połączenia z bankiem.';
            }
            if (brokenBankConnection || rterType === CONST_1.default.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? "Nie mo\u017Cna automatycznie dopasowa\u0107 paragonu z powodu zerwanego po\u0142\u0105czenia z bankiem, kt\u00F3re ".concat(email, " musi naprawi\u0107.")
                    : 'Nie można automatycznie dopasować paragonu z powodu przerwanego połączenia z bankiem, które musisz naprawić.';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? "Popro\u015B ".concat(member, ", aby oznaczy\u0142 jako got\u00F3wk\u0119 lub poczekaj 7 dni i spr\u00F3buj ponownie.") : 'Oczekiwanie na połączenie z transakcją kartową.';
            }
            return '';
        },
        brokenConnection530Error: 'Paragon oczekuje z powodu zerwanego połączenia z bankiem',
        adminBrokenConnectionError: 'Paragon oczekuje z powodu przerwanego połączenia z bankiem. Proszę rozwiązać w',
        memberBrokenConnectionError: 'Paragon oczekuje z powodu zerwanego połączenia z bankiem. Proszę poprosić administratora przestrzeni roboczej o rozwiązanie problemu.',
        markAsCashToIgnore: 'Oznacz jako gotówkę, aby zignorować i zażądać płatności.',
        smartscanFailed: function (_a) {
            var _b = _a.canEdit, canEdit = _b === void 0 ? true : _b;
            return "Skanowanie paragonu nie powiod\u0142o si\u0119.".concat(canEdit ? 'Wprowadź dane ręcznie.' : '');
        },
        receiptGeneratedWithAI: 'Potencjalny paragon wygenerowany przez AI',
        someTagLevelsRequired: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "Missing ".concat(tagName !== null && tagName !== void 0 ? tagName : 'Tag');
        },
        tagOutOfPolicy: function (_a) {
            var _b = _a === void 0 ? {} : _a, tagName = _b.tagName;
            return "".concat(tagName !== null && tagName !== void 0 ? tagName : 'Tag', " nie jest ju\u017C wa\u017Cny");
        },
        taxAmountChanged: 'Kwota podatku została zmodyfikowana',
        taxOutOfPolicy: function (_a) {
            var _b = _a === void 0 ? {} : _a, taxName = _b.taxName;
            return "".concat(taxName !== null && taxName !== void 0 ? taxName : 'Podatek', " ju\u017C nie jest wa\u017Cny");
        },
        taxRateChanged: 'Stawka podatkowa została zmodyfikowana',
        taxRequired: 'Brakująca stawka podatkowa',
        none: 'None',
        taxCodeToKeep: 'Wybierz, który kod podatkowy zachować',
        tagToKeep: 'Wybierz, który tag zachować',
        isTransactionReimbursable: 'Wybierz, czy transakcja podlega zwrotowi kosztów',
        merchantToKeep: 'Wybierz, którego sprzedawcę zachować',
        descriptionToKeep: 'Wybierz opis do zachowania',
        categoryToKeep: 'Wybierz kategorię do zachowania',
        isTransactionBillable: 'Wybierz, czy transakcja jest rozliczalna',
        keepThisOne: 'Keep this one',
        confirmDetails: "Potwierd\u017A szczeg\u00F3\u0142y, kt\u00F3re zachowujesz",
        confirmDuplicatesInfo: "Duplikaty wniosk\u00F3w, kt\u00F3rych nie zachowasz, zostan\u0105 wstrzymane, aby cz\u0142onek m\u00F3g\u0142 je usun\u0105\u0107.",
        hold: 'Ten wydatek został wstrzymany',
        resolvedDuplicates: 'rozwiązano duplikat',
    },
    reportViolations: (_10 = {},
        _10[CONST_1.default.REPORT_VIOLATIONS.FIELD_REQUIRED] = function (_a) {
            var fieldName = _a.fieldName;
            return "Pole ".concat(fieldName, " jest wymagane");
        },
        _10),
    violationDismissal: {
        rter: {
            manual: 'oznaczył ten paragon jako gotówka',
        },
        duplicatedTransaction: {
            manual: 'rozwiązano duplikat',
        },
    },
    videoPlayer: {
        play: 'Graj',
        pause: 'Pauza',
        fullscreen: 'Pełny ekran',
        playbackSpeed: 'Prędkość odtwarzania',
        expand: 'Rozwiń',
        mute: 'Wycisz',
        unmute: 'Wyłącz wyciszenie',
        normal: 'Normalny',
    },
    exitSurvey: {
        header: 'Zanim pójdziesz',
        reasonPage: {
            title: 'Proszę, powiedz nam, dlaczego odchodzisz',
            subtitle: 'Zanim odejdziesz, prosimy powiedz nam, dlaczego chciałbyś przejść na Expensify Classic.',
        },
        reasons: (_11 = {},
            _11[CONST_1.default.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE] = 'Potrzebuję funkcji, która jest dostępna tylko w Expensify Classic.',
            _11[CONST_1.default.EXIT_SURVEY.REASONS.DONT_UNDERSTAND] = 'Nie rozumiem, jak korzystać z New Expensify.',
            _11[CONST_1.default.EXIT_SURVEY.REASONS.PREFER_CLASSIC] = 'Rozumiem, jak korzystać z New Expensify, ale wolę Expensify Classic.',
            _11),
        prompts: (_12 = {},
            _12[CONST_1.default.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE] = 'Jakiej funkcji potrzebujesz, która nie jest dostępna w Nowym Expensify?',
            _12[CONST_1.default.EXIT_SURVEY.REASONS.DONT_UNDERSTAND] = 'Co próbujesz zrobić?',
            _12[CONST_1.default.EXIT_SURVEY.REASONS.PREFER_CLASSIC] = 'Dlaczego wolisz Expensify Classic?',
            _12),
        responsePlaceholder: 'Twoja odpowiedź',
        thankYou: 'Dzięki za opinię!',
        thankYouSubtitle: 'Twoje odpowiedzi pomogą nam stworzyć lepszy produkt, aby załatwiać sprawy. Dziękujemy bardzo!',
        goToExpensifyClassic: 'Przełącz na Expensify Classic',
        offlineTitle: 'Wygląda na to, że utknąłeś tutaj...',
        offline: 'Wygląda na to, że jesteś offline. Niestety, Expensify Classic nie działa w trybie offline, ale Nowy Expensify działa. Jeśli wolisz używać Expensify Classic, spróbuj ponownie, gdy będziesz mieć połączenie z internetem.',
        quickTip: 'Szybka wskazówka...',
        quickTipSubTitle: 'Możesz przejść bezpośrednio do Expensify Classic, odwiedzając expensify.com. Dodaj do zakładek, aby mieć łatwy skrót!',
        bookACall: 'Zarezerwuj rozmowę',
        noThanks: 'Nie, dziękuję',
        bookACallTitle: 'Czy chciałbyś porozmawiać z menedżerem produktu?',
        benefits: (_13 = {},
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY] = 'Bezpośrednie czatowanie na wydatkach i raportach',
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE] = 'Możliwość robienia wszystkiego na urządzeniu mobilnym',
            _13[CONST_1.default.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE] = 'Podróże i wydatki z prędkością czatu',
            _13),
        bookACallTextTop: 'Przechodząc na Expensify Classic, przegapisz:',
        bookACallTextBottom: 'Bylibyśmy podekscytowani możliwością rozmowy z Tobą, aby zrozumieć dlaczego. Możesz umówić się na rozmowę z jednym z naszych starszych menedżerów produktu, aby omówić swoje potrzeby.',
        takeMeToExpensifyClassic: 'Przenieś mnie do Expensify Classic',
    },
    listBoundary: {
        errorMessage: 'Wystąpił błąd podczas ładowania kolejnych wiadomości',
        tryAgain: 'Spróbuj ponownie',
    },
    systemMessage: {
        mergedWithCashTransaction: 'dopasowano paragon do tej transakcji',
    },
    subscription: {
        authenticatePaymentCard: 'Uwierzytelnij kartę płatniczą',
        mobileReducedFunctionalityMessage: 'Nie możesz wprowadzać zmian w swojej subskrypcji w aplikacji mobilnej.',
        badge: {
            freeTrial: function (_a) {
                var numOfDays = _a.numOfDays;
                return "Darmowa wersja pr\u00F3bna: pozosta\u0142o ".concat(numOfDays, " ").concat(numOfDays === 1 ? 'dzień' : 'dni');
            },
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'Twoje informacje o płatności są nieaktualne',
                subtitle: function (_a) {
                    var date = _a.date;
                    return "Zaktualizuj swoj\u0105 kart\u0119 p\u0142atnicz\u0105 do ".concat(date, ", aby nadal korzysta\u0107 ze wszystkich ulubionych funkcji.");
                },
            },
            policyOwnerAmountOwedOverdue: {
                title: 'Twoja płatność nie mogła zostać przetworzona',
                subtitle: function (_a) {
                    var date = _a.date, purchaseAmountOwed = _a.purchaseAmountOwed;
                    return date && purchaseAmountOwed
                        ? "Twoja op\u0142ata z dnia ".concat(date, " w wysoko\u015Bci ").concat(purchaseAmountOwed, " nie mog\u0142a zosta\u0107 przetworzona. Prosz\u0119 doda\u0107 kart\u0119 p\u0142atnicz\u0105, aby uregulowa\u0107 zaleg\u0142\u0105 kwot\u0119.")
                        : 'Proszę dodać kartę płatniczą, aby uregulować należną kwotę.';
                },
            },
            policyOwnerUnderInvoicing: {
                title: 'Twoje informacje o płatności są nieaktualne',
                subtitle: function (_a) {
                    var date = _a.date;
                    return "Twoja p\u0142atno\u015B\u0107 jest zaleg\u0142a. Prosimy o op\u0142acenie faktury do ".concat(date, ", aby unikn\u0105\u0107 przerwania us\u0142ugi.");
                },
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'Twoje informacje o płatności są nieaktualne',
                subtitle: 'Twoja płatność jest zaległa. Proszę opłać swoją fakturę.',
            },
            billingDisputePending: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed, cardEnding = _a.cardEnding;
                    return "Zakwestionowa\u0142e\u015B op\u0142at\u0119 w wysoko\u015Bci ".concat(amountOwed, " na karcie ko\u0144cz\u0105cej si\u0119 na ").concat(cardEnding, ". Twoje konto zostanie zablokowane do czasu rozwi\u0105zania sporu z bankiem.");
                },
            },
            cardAuthenticationRequired: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle: function (_a) {
                    var cardEnding = _a.cardEnding;
                    return "Twoja karta p\u0142atnicza nie zosta\u0142a w pe\u0142ni uwierzytelniona. Prosz\u0119 uko\u0144czy\u0107 proces uwierzytelniania, aby aktywowa\u0107 kart\u0119 p\u0142atnicz\u0105 ko\u0144cz\u0105c\u0105 si\u0119 na ".concat(cardEnding, ".");
                },
            },
            insufficientFunds: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed;
                    return "Twoja karta p\u0142atnicza zosta\u0142a odrzucona z powodu niewystarczaj\u0105cych \u015Brodk\u00F3w. Spr\u00F3buj ponownie lub dodaj now\u0105 kart\u0119 p\u0142atnicz\u0105, aby uregulowa\u0107 zaleg\u0142e saldo w wysoko\u015Bci ".concat(amountOwed, ".");
                },
            },
            cardExpired: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle: function (_a) {
                    var amountOwed = _a.amountOwed;
                    return "Twoja karta p\u0142atnicza wygas\u0142a. Prosz\u0119 doda\u0107 now\u0105 kart\u0119 p\u0142atnicz\u0105, aby uregulowa\u0107 zaleg\u0142e saldo w wysoko\u015Bci ".concat(amountOwed, ".");
                },
            },
            cardExpireSoon: {
                title: 'Twoja karta wkrótce wygaśnie',
                subtitle: 'Twoja karta płatnicza wygaśnie pod koniec tego miesiąca. Kliknij menu z trzema kropkami poniżej, aby ją zaktualizować i nadal korzystać ze wszystkich ulubionych funkcji.',
            },
            retryBillingSuccess: {
                title: 'Sukces!',
                subtitle: 'Twoja karta została pomyślnie obciążona.',
            },
            retryBillingError: {
                title: 'Nie można było obciążyć Twojej karty',
                subtitle: 'Zanim spróbujesz ponownie, skontaktuj się bezpośrednio ze swoim bankiem, aby autoryzować opłaty Expensify i usunąć wszelkie blokady. W przeciwnym razie spróbuj dodać inną kartę płatniczą.',
            },
            cardOnDispute: function (_a) {
                var amountOwed = _a.amountOwed, cardEnding = _a.cardEnding;
                return "Zakwestionowa\u0142e\u015B op\u0142at\u0119 w wysoko\u015Bci ".concat(amountOwed, " na karcie ko\u0144cz\u0105cej si\u0119 na ").concat(cardEnding, ". Twoje konto zostanie zablokowane do czasu rozwi\u0105zania sporu z bankiem.");
            },
            preTrial: {
                title: 'Rozpocznij darmowy okres próbny',
                subtitleStart: 'Jako kolejny krok,',
                subtitleLink: 'ukończ listę kontrolną konfiguracji',
                subtitleEnd: 'aby Twój zespół mógł zacząć rozliczać wydatki.',
            },
            trialStarted: {
                title: function (_a) {
                    var numOfDays = _a.numOfDays;
                    return "Okres pr\u00F3bny: ".concat(numOfDays, " ").concat(numOfDays === 1 ? 'dzień' : 'dni', " pozosta\u0142o!");
                },
                subtitle: 'Dodaj kartę płatniczą, aby nadal korzystać ze wszystkich ulubionych funkcji.',
            },
            trialEnded: {
                title: 'Twój darmowy okres próbny dobiegł końca',
                subtitle: 'Dodaj kartę płatniczą, aby nadal korzystać ze wszystkich ulubionych funkcji.',
            },
            earlyDiscount: {
                claimOffer: 'Zgłoś ofertę',
                noThanks: 'Nie, dziękuję',
                subscriptionPageTitle: function (_a) {
                    var discountType = _a.discountType;
                    return "<strong>".concat(discountType, "% zni\u017Cki na pierwszy rok!</strong> Wystarczy doda\u0107 kart\u0119 p\u0142atnicz\u0105 i rozpocz\u0105\u0107 roczn\u0105 subskrypcj\u0119.");
                },
                onboardingChatTitle: function (_a) {
                    var discountType = _a.discountType;
                    return "Oferta ograniczona czasowo: ".concat(discountType, "% zni\u017Cki na pierwszy rok!");
                },
                subtitle: function (_a) {
                    var days = _a.days, hours = _a.hours, minutes = _a.minutes, seconds = _a.seconds;
                    return "Zg\u0142o\u015B w ci\u0105gu ".concat(days > 0 ? "".concat(days, "d :") : '').concat(hours, "h : ").concat(minutes, "m : ").concat(seconds, "s");
                },
            },
        },
        cardSection: {
            title: 'Płatność',
            subtitle: 'Dodaj kartę, aby opłacić subskrypcję Expensify.',
            addCardButton: 'Dodaj kartę płatniczą',
            cardNextPayment: function (_a) {
                var nextPaymentDate = _a.nextPaymentDate;
                return "Twoja nast\u0119pna data p\u0142atno\u015Bci to ".concat(nextPaymentDate, ".");
            },
            cardEnding: function (_a) {
                var cardNumber = _a.cardNumber;
                return "Karta ko\u0144cz\u0105ca si\u0119 na ".concat(cardNumber);
            },
            cardInfo: function (_a) {
                var name = _a.name, expiration = _a.expiration, currency = _a.currency;
                return "Nazwa: ".concat(name, ", Wa\u017Cno\u015B\u0107: ").concat(expiration, ", Waluta: ").concat(currency);
            },
            changeCard: 'Zmień kartę płatniczą',
            changeCurrency: 'Zmień walutę płatności',
            cardNotFound: 'Nie dodano karty płatniczej',
            retryPaymentButton: 'Ponów płatność',
            authenticatePayment: 'Uwierzytelnij płatność',
            requestRefund: 'Poproś o zwrot pieniędzy',
            requestRefundModal: {
                full: 'Otrzymanie zwrotu jest proste, wystarczy obniżyć poziom konta przed następną datą rozliczenia, a otrzymasz zwrot. <br /> <br /> Uwaga: Obniżenie poziomu konta oznacza, że Twoje przestrzenie robocze zostaną usunięte. Tej akcji nie można cofnąć, ale zawsze możesz utworzyć nową przestrzeń roboczą, jeśli zmienisz zdanie.',
                confirm: 'Usuń przestrzeń(e) roboczą i obniż plan',
            },
            viewPaymentHistory: 'Wyświetl historię płatności',
        },
        yourPlan: {
            title: 'Twój plan',
            exploreAllPlans: 'Poznaj wszystkie plany',
            customPricing: 'Cennik niestandardowy',
            asLowAs: function (_a) {
                var price = _a.price;
                return "ju\u017C od ".concat(price, " za aktywnego cz\u0142onka/miesi\u0105c");
            },
            pricePerMemberMonth: function (_a) {
                var price = _a.price;
                return "".concat(price, " za cz\u0142onka/miesi\u0105c");
            },
            pricePerMemberPerMonth: function (_a) {
                var price = _a.price;
                return "".concat(price, " za cz\u0142onka miesi\u0119cznie");
            },
            perMemberMonth: 'za członka/miesiąc',
            collect: {
                title: 'Zbierz',
                description: 'Plan dla małych firm, który oferuje zarządzanie wydatkami, podróżami i czatem.',
                priceAnnual: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "Od ".concat(lower, "/aktywny cz\u0142onek z kart\u0105 Expensify, ").concat(upper, "/aktywny cz\u0142onek bez karty Expensify.");
                },
                pricePayPerUse: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "Od ".concat(lower, "/aktywny cz\u0142onek z kart\u0105 Expensify, ").concat(upper, "/aktywny cz\u0142onek bez karty Expensify.");
                },
                benefit1: 'Skanowanie paragonów',
                benefit2: 'Zwroty kosztów',
                benefit3: 'Zarządzanie kartami korporacyjnymi',
                benefit4: 'Zatwierdzenia wydatków i podróży',
                benefit5: 'Rezerwacja podróży i zasady',
                benefit6: 'Integracje QuickBooks/Xero',
                benefit7: 'Czat o wydatkach, raportach i pokojach',
                benefit8: 'Wsparcie AI i ludzkie',
            },
            control: {
                title: 'Kontrola',
                description: 'Wydatki, podróże i czat dla większych firm.',
                priceAnnual: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "Od ".concat(lower, "/aktywny cz\u0142onek z kart\u0105 Expensify, ").concat(upper, "/aktywny cz\u0142onek bez karty Expensify.");
                },
                pricePayPerUse: function (_a) {
                    var lower = _a.lower, upper = _a.upper;
                    return "Od ".concat(lower, "/aktywny cz\u0142onek z kart\u0105 Expensify, ").concat(upper, "/aktywny cz\u0142onek bez karty Expensify.");
                },
                benefit1: 'Wszystko w planie Collect',
                benefit2: 'Wielopoziomowe przepływy zatwierdzania',
                benefit3: 'Niestandardowe zasady wydatków',
                benefit4: 'Integracje ERP (NetSuite, Sage Intacct, Oracle)',
                benefit5: 'Integracje HR (Workday, Certinia)',
                benefit6: 'SAML/SSO',
                benefit7: 'Niestandardowe analizy i raportowanie',
                benefit8: 'Budżetowanie',
            },
            thisIsYourCurrentPlan: 'To jest Twój obecny plan',
            downgrade: 'Obniż do Collect',
            upgrade: 'Uaktualnij do Control',
            addMembers: 'Dodaj członków',
            saveWithExpensifyTitle: 'Oszczędzaj z kartą Expensify',
            saveWithExpensifyDescription: 'Użyj naszego kalkulatora oszczędności, aby zobaczyć, jak zwrot gotówki z karty Expensify może zmniejszyć Twój rachunek w Expensify.',
            saveWithExpensifyButton: 'Dowiedz się więcej',
        },
        compareModal: {
            comparePlans: 'Porównaj plany',
            unlockTheFeatures: 'Odblokuj potrzebne funkcje dzięki planowi, który jest dla Ciebie odpowiedni.',
            viewOurPricing: 'Zobacz naszą stronę z cennikiem',
            forACompleteFeatureBreakdown: 'aby uzyskać pełny podział funkcji każdego z naszych planów.',
        },
        details: {
            title: 'Szczegóły subskrypcji',
            annual: 'Roczna subskrypcja',
            taxExempt: 'Poproś o status zwolnienia z podatku',
            taxExemptEnabled: 'Zwolniony z podatku',
            taxExemptStatus: 'Status zwolnienia z podatku',
            payPerUse: 'Opłata za użycie',
            subscriptionSize: 'Rozmiar subskrypcji',
            headsUp: 'Uwaga: Jeśli teraz nie ustawisz rozmiaru subskrypcji, automatycznie ustawimy go na liczbę aktywnych członków z pierwszego miesiąca. Następnie zobowiążesz się do płacenia za co najmniej tę liczbę członków przez następne 12 miesięcy. Możesz zwiększyć rozmiar subskrypcji w dowolnym momencie, ale nie możesz go zmniejszyć, dopóki subskrypcja się nie zakończy.',
            zeroCommitment: 'Brak zobowiązań przy obniżonej rocznej stawce subskrypcji',
        },
        subscriptionSize: {
            title: 'Rozmiar subskrypcji',
            yourSize: 'Rozmiar Twojej subskrypcji to liczba dostępnych miejsc, które mogą być zajęte przez dowolnego aktywnego członka w danym miesiącu.',
            eachMonth: 'Każdego miesiąca Twoja subskrypcja obejmuje do liczby aktywnych członków określonej powyżej. Za każdym razem, gdy zwiększysz rozmiar subskrypcji, rozpoczniesz nową 12-miesięczną subskrypcję w tym nowym rozmiarze.',
            note: 'Uwaga: Aktywnym członkiem jest każda osoba, która utworzyła, edytowała, przesłała, zatwierdziła, zrefundowała lub wyeksportowała dane wydatków powiązane z przestrzenią roboczą Twojej firmy.',
            confirmDetails: 'Potwierdź szczegóły swojego nowego rocznego abonamentu:',
            subscriptionSize: 'Rozmiar subskrypcji',
            activeMembers: function (_a) {
                var size = _a.size;
                return "".concat(size, " aktywnych cz\u0142onk\u00F3w/miesi\u0105c");
            },
            subscriptionRenews: 'Subskrypcja odnawia się',
            youCantDowngrade: 'Nie możesz obniżyć planu podczas rocznej subskrypcji.',
            youAlreadyCommitted: function (_a) {
                var size = _a.size, date = _a.date;
                return "Ju\u017C zobowi\u0105za\u0142e\u015B si\u0119 do rocznej subskrypcji dla ".concat(size, " aktywnych cz\u0142onk\u00F3w miesi\u0119cznie do ").concat(date, ". Mo\u017Cesz przej\u015B\u0107 na subskrypcj\u0119 p\u0142atn\u0105 za u\u017Cycie w dniu ").concat(date, ", wy\u0142\u0105czaj\u0105c automatyczne odnawianie.");
            },
            error: {
                size: 'Proszę wprowadzić prawidłowy rozmiar subskrypcji',
                sameSize: 'Proszę wprowadzić liczbę inną niż rozmiar Twojej obecnej subskrypcji',
            },
        },
        paymentCard: {
            addPaymentCard: 'Dodaj kartę płatniczą',
            enterPaymentCardDetails: 'Wprowadź dane swojej karty płatniczej',
            security: 'Expensify jest zgodny z PCI-DSS, używa szyfrowania na poziomie bankowym i wykorzystuje redundantną infrastrukturę do ochrony Twoich danych.',
            learnMoreAboutSecurity: 'Dowiedz się więcej o naszym bezpieczeństwie.',
        },
        subscriptionSettings: {
            title: 'Ustawienia subskrypcji',
            summary: function (_a) {
                var subscriptionType = _a.subscriptionType, subscriptionSize = _a.subscriptionSize, autoRenew = _a.autoRenew, autoIncrease = _a.autoIncrease;
                return "Rodzaj subskrypcji: ".concat(subscriptionType, ", Rozmiar subskrypcji: ").concat(subscriptionSize, ", Automatyczne odnawianie: ").concat(autoRenew, ", Automatyczne zwi\u0119kszanie rocznych miejsc: ").concat(autoIncrease);
            },
            none: 'none',
            on: 'na',
            off: 'wyłączony',
            annual: 'Roczny',
            autoRenew: 'Automatyczne odnawianie',
            autoIncrease: 'Automatyczne zwiększanie rocznych miejsc',
            saveUpTo: function (_a) {
                var amountWithCurrency = _a.amountWithCurrency;
                return "Oszcz\u0119dzaj do ".concat(amountWithCurrency, "/miesi\u0105c na aktywnego cz\u0142onka");
            },
            automaticallyIncrease: 'Automatycznie zwiększaj liczbę rocznych miejsc, aby pomieścić aktywnych członków, którzy przekraczają rozmiar Twojej subskrypcji. Uwaga: Spowoduje to przedłużenie daty zakończenia rocznej subskrypcji.',
            disableAutoRenew: 'Wyłącz automatyczne odnawianie',
            helpUsImprove: 'Pomóż nam ulepszyć Expensify',
            whatsMainReason: 'Jaki jest główny powód, dla którego wyłączasz automatyczne odnawianie?',
            renewsOn: function (_a) {
                var date = _a.date;
                return "Odnawia si\u0119 ".concat(date, ".");
            },
            pricingConfiguration: 'Ceny zależą od konfiguracji. Aby uzyskać najniższą cenę, wybierz subskrypcję roczną i zdobądź kartę Expensify.',
            learnMore: {
                part1: 'Dowiedz się więcej na naszej',
                pricingPage: 'strona cenowa',
                part2: 'lub porozmawiaj z naszym zespołem w swoim języku',
                adminsRoom: '#admins room.',
            },
            estimatedPrice: 'Szacowana cena',
            changesBasedOn: 'To zmienia się w zależności od korzystania z Karty Expensify i poniższych opcji subskrypcji.',
        },
        requestEarlyCancellation: {
            title: 'Poproś o wcześniejsze anulowanie',
            subtitle: 'Jaki jest główny powód, dla którego prosisz o wcześniejsze anulowanie?',
            subscriptionCanceled: {
                title: 'Subskrypcja anulowana',
                subtitle: 'Twoja roczna subskrypcja została anulowana.',
                info: 'Jeśli chcesz nadal korzystać ze swojego miejsca pracy na zasadzie płatności za użycie, wszystko jest gotowe.',
                preventFutureActivity: {
                    part1: 'Jeśli chcesz zapobiec przyszłym działaniom i opłatom, musisz',
                    link: 'usuń swoje przestrzenie robocze',
                    part2: '. Zauważ, że gdy usuniesz swoje miejsce pracy, zostaniesz obciążony opłatą za wszelkie zaległe działania, które miały miejsce w bieżącym miesiącu kalendarzowym.',
                },
            },
            requestSubmitted: {
                title: 'Żądanie zostało złożone',
                subtitle: {
                    part1: 'Dziękujemy za poinformowanie nas o chęci anulowania subskrypcji. Przeglądamy Twoją prośbę i wkrótce skontaktujemy się z Tobą za pośrednictwem czatu z',
                    link: 'Concierge',
                    part2: '.',
                },
            },
            acknowledgement: "Poprzez z\u0142o\u017Cenie pro\u015Bby o wcze\u015Bniejsze anulowanie, przyjmuj\u0119 do wiadomo\u015Bci i zgadzam si\u0119, \u017Ce Expensify nie ma obowi\u0105zku spe\u0142nienia takiej pro\u015Bby zgodnie z Expensify.<a href=".concat(CONST_1.default.OLD_DOT_PUBLIC_URLS.TERMS_URL, ">Warunki korzystania z us\u0142ugi</a>lub inna odpowiednia umowa o \u015Bwiadczenie us\u0142ug mi\u0119dzy mn\u0105 a Expensify, a Expensify zachowuje wy\u0142\u0105czn\u0105 swobod\u0119 decyzji w odniesieniu do przyznania takiej pro\u015Bby."),
        },
    },
    feedbackSurvey: {
        tooLimited: 'Funkcjonalność wymaga poprawy',
        tooExpensive: 'Zbyt drogie',
        inadequateSupport: 'Niewystarczające wsparcie klienta',
        businessClosing: 'Zamknięcie firmy, redukcja zatrudnienia lub przejęcie',
        additionalInfoTitle: 'Na jakie oprogramowanie się przenosisz i dlaczego?',
        additionalInfoInputLabel: 'Twoja odpowiedź',
    },
    roomChangeLog: {
        updateRoomDescription: 'ustaw opis pokoju na:',
        clearRoomDescription: 'wyczyszczono opis pokoju',
    },
    delegate: {
        switchAccount: 'Przełącz konta:',
        copilotDelegatedAccess: 'Copilot: Delegowany dostęp',
        copilotDelegatedAccessDescription: 'Zezwól innym członkom na dostęp do Twojego konta.',
        addCopilot: 'Dodaj współpilota',
        membersCanAccessYourAccount: 'Ci członkowie mają dostęp do Twojego konta:',
        youCanAccessTheseAccounts: 'Możesz uzyskać dostęp do tych kont za pomocą przełącznika kont:',
        role: function (_a) {
            var _b = _a === void 0 ? {} : _a, role = _b.role;
            switch (role) {
                case CONST_1.default.DELEGATE_ROLE.ALL:
                    return 'Pełny';
                case CONST_1.default.DELEGATE_ROLE.SUBMITTER:
                    return 'Ograniczony';
                default:
                    return '';
            }
        },
        genericError: 'Ups, coś poszło nie tak. Proszę spróbować ponownie.',
        onBehalfOfMessage: function (_a) {
            var delegator = _a.delegator;
            return "w imieniu ".concat(delegator);
        },
        accessLevel: 'Poziom dostępu',
        confirmCopilot: 'Potwierdź swojego pilota poniżej.',
        accessLevelDescription: 'Wybierz poziom dostępu poniżej. Zarówno pełny, jak i ograniczony dostęp pozwalają współpilotom na przeglądanie wszystkich rozmów i wydatków.',
        roleDescription: function (_a) {
            var _b = _a === void 0 ? {} : _a, role = _b.role;
            switch (role) {
                case CONST_1.default.DELEGATE_ROLE.ALL:
                    return 'Zezwól innemu członkowi na podejmowanie wszystkich działań na Twoim koncie w Twoim imieniu. Obejmuje to czat, zgłoszenia, zatwierdzenia, płatności, aktualizacje ustawień i więcej.';
                case CONST_1.default.DELEGATE_ROLE.SUBMITTER:
                    return 'Zezwól innemu członkowi na podejmowanie większości działań na Twoim koncie w Twoim imieniu. Wyklucza zatwierdzenia, płatności, odrzucenia i wstrzymania.';
                default:
                    return '';
            }
        },
        removeCopilot: 'Usuń copilot',
        removeCopilotConfirmation: 'Czy na pewno chcesz usunąć tego współpilota?',
        changeAccessLevel: 'Zmień poziom dostępu',
        makeSureItIsYou: 'Upewnijmy się, że to Ty',
        enterMagicCode: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Prosz\u0119 wprowadzi\u0107 magiczny kod wys\u0142any na ".concat(contactMethod, ", aby doda\u0107 wsp\u00F3\u0142pilota. Powinien dotrze\u0107 w ci\u0105gu minuty lub dw\u00F3ch.");
        },
        enterMagicCodeUpdate: function (_a) {
            var contactMethod = _a.contactMethod;
            return "Prosz\u0119 wprowadzi\u0107 magiczny kod wys\u0142any na ".concat(contactMethod, ", aby zaktualizowa\u0107 swojego pilota.");
        },
        notAllowed: 'Nie tak szybko...',
        noAccessMessage: 'Jako współpilot nie masz dostępu do tej strony. Przepraszamy!',
        notAllowedMessageStart: "Jako",
        notAllowedMessageHyperLinked: 'copilot',
        notAllowedMessageEnd: function (_a) {
            var accountOwnerEmail = _a.accountOwnerEmail;
            return "dla ".concat(accountOwnerEmail, ", nie masz uprawnie\u0144 do wykonania tej akcji. Przepraszamy!");
        },
        copilotAccess: 'Dostęp do Copilot',
    },
    debug: {
        debug: 'Debugowanie',
        details: 'Szczegóły',
        JSON: 'JSON',
        reportActions: 'Akcje',
        reportActionPreview: 'Podgląd',
        nothingToPreview: 'Brak podglądu',
        editJson: 'Edytuj JSON:',
        preview: 'Podgląd:',
        missingProperty: function (_a) {
            var propertyName = _a.propertyName;
            return "Brakuj\u0105cy ".concat(propertyName);
        },
        invalidProperty: function (_a) {
            var propertyName = _a.propertyName, expectedType = _a.expectedType;
            return "Nieprawid\u0142owa w\u0142a\u015Bciwo\u015B\u0107: ".concat(propertyName, " - Oczekiwano: ").concat(expectedType);
        },
        invalidValue: function (_a) {
            var expectedValues = _a.expectedValues;
            return "Nieprawid\u0142owa warto\u015B\u0107 - Oczekiwano: ".concat(expectedValues);
        },
        missingValue: 'Brakująca wartość',
        createReportAction: 'Utwórz akcję raportu',
        reportAction: 'Zgłoś działanie',
        report: 'Raport',
        transaction: 'Transakcja',
        violations: 'Naruszenia',
        transactionViolation: 'Naruszenie transakcji',
        hint: 'Zmiany danych nie będą wysyłane do backendu',
        textFields: 'Pola tekstowe',
        numberFields: 'Pola liczbowe',
        booleanFields: 'Pola logiczne',
        constantFields: 'Stałe pola',
        dateTimeFields: 'Pola DateTime',
        date: 'Data',
        time: 'Czas',
        none: 'None',
        visibleInLHN: 'Widoczne w LHN',
        GBR: 'GBR',
        RBR: 'RBR',
        true: 'true',
        false: 'false',
        viewReport: 'Zobacz raport',
        viewTransaction: 'Zobacz transakcję',
        createTransactionViolation: 'Utwórz naruszenie transakcji',
        reasonVisibleInLHN: {
            hasDraftComment: 'Ma szkic komentarza',
            hasGBR: 'Has GBR',
            hasRBR: 'Has RBR',
            pinnedByUser: 'Przypięte przez członka',
            hasIOUViolations: 'Ma naruszenia IOU',
            hasAddWorkspaceRoomErrors: 'Wystąpiły błędy podczas dodawania pokoju roboczego',
            isUnread: 'Jest nieprzeczytane (tryb skupienia)',
            isArchived: 'Jest zarchiwizowane (tryb najnowszy)',
            isSelfDM: 'To jest własna wiadomość bezpośrednia (DM)',
            isFocused: 'Jest tymczasowo skupiony',
        },
        reasonGBR: {
            hasJoinRequest: 'Ma prośbę o dołączenie (pokój administratora)',
            isUnreadWithMention: 'Jest nieprzeczytane z wzmianką',
            isWaitingForAssigneeToCompleteAction: 'Czeka na przypisanie do wykonania działania',
            hasChildReportAwaitingAction: 'Raport podrzędny oczekuje na działanie',
            hasMissingInvoiceBankAccount: 'Brakuje konta bankowego na fakturze',
        },
        reasonRBR: {
            hasErrors: 'Ma błędy w danych raportu lub działaniach raportu',
            hasViolations: 'Ma naruszenia',
            hasTransactionThreadViolations: 'Ma naruszenia wątku transakcji',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Raport oczekuje na działanie',
            theresAReportWithErrors: 'W raporcie są błędy',
            theresAWorkspaceWithCustomUnitsErrors: 'Występują błędy w przestrzeni roboczej z niestandardowymi jednostkami',
            theresAProblemWithAWorkspaceMember: 'Wystąpił problem z członkiem przestrzeni roboczej',
            theresAProblemWithAWorkspaceQBOExport: 'Wystąpił problem z ustawieniem eksportu połączenia przestrzeni roboczej.',
            theresAProblemWithAContactMethod: 'Wystąpił problem z metodą kontaktu',
            aContactMethodRequiresVerification: 'Metoda kontaktu wymaga weryfikacji',
            theresAProblemWithAPaymentMethod: 'Wystąpił problem z metodą płatności',
            theresAProblemWithAWorkspace: 'Wystąpił problem z przestrzenią roboczą',
            theresAProblemWithYourReimbursementAccount: 'Wystąpił problem z Twoim kontem do zwrotu kosztów',
            theresABillingProblemWithYourSubscription: 'Wystąpił problem z rozliczeniem Twojej subskrypcji',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Twoja subskrypcja została pomyślnie odnowiona',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Wystąpił problem podczas synchronizacji połączenia przestrzeni roboczej',
            theresAProblemWithYourWallet: 'Wystąpił problem z Twoim portfelem',
            theresAProblemWithYourWalletTerms: 'Wystąpił problem z warunkami Twojego portfela',
        },
    },
    emptySearchView: {
        takeATestDrive: 'Wypróbuj wersję demonstracyjną',
    },
    migratedUserWelcomeModal: {
        title: 'Podróże i wydatki, z prędkością czatu',
        subtitle: 'Nowy Expensify ma tę samą świetną automatyzację, ale teraz z niesamowitą współpracą:',
        confirmText: 'Zaczynajmy!',
        features: {
            chat: '<strong>Czatuj bezpośrednio na dowolnym wydatku</strong>, raporcie lub przestrzeni roboczej',
            scanReceipt: '<strong>Skanuj paragony</strong> i otrzymuj zwrot pieniędzy',
            crossPlatform: 'Rób <strong>wszystko</strong> z telefonu lub przeglądarki',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: {
            part1: 'Zacznij teraz',
            part2: 'tutaj!',
        },
        saveSearchTooltip: {
            part1: 'Zmień nazwę zapisanych wyszukiwań',
            part2: 'tutaj!',
        },
        bottomNavInboxTooltip: {
            part1: 'Sprawdź co',
            part2: 'wymaga Twojej uwagi',
            part3: 'i',
            part4: 'rozmowa o wydatkach.',
        },
        workspaceChatTooltip: {
            part1: 'Czat z',
            part2: 'zatwierdzający',
        },
        globalCreateTooltip: {
            part1: 'Utwórz wydatki',
            part2: ', rozpocznij czat,',
            part3: 'i więcej.',
            part4: 'Wypróbuj to!',
        },
        GBRRBRChat: {
            part1: 'Zobaczysz 🟢 na',
            part2: 'działania do podjęcia',
            part3: ', i 🔴 na',
            part4: 'elementy do przejrzenia.',
        },
        accountSwitcher: {
            part1: 'Uzyskaj dostęp do swojego',
            part2: 'Konta Copilot',
            part3: 'tutaj',
        },
        expenseReportsFilter: {
            part1: 'Witamy! Znajdź wszystkie swoje',
            part2: 'raporty firmy',
            part3: 'here.',
        },
        scanTestTooltip: {
            part1: 'Chcesz zobaczyć, jak działa Skanowanie?',
            part2: 'Wypróbuj paragon testowy!',
            part3: 'Wybierz nasz',
            part4: 'kierownik testów',
            part5: 'aby to wypróbować!',
            part6: 'Teraz,',
            part7: 'prześlij swój wydatek',
            part8: 'i zobacz, jak dzieje się magia!',
            tryItOut: 'Wypróbuj to',
            noThanks: 'Nie, dziękuję',
        },
        outstandingFilter: {
            part1: 'Filtruj wydatki, które',
            part2: 'potrzebna zgoda',
        },
        scanTestDriveTooltip: {
            part1: 'Wyślij ten paragon do',
            part2: 'ukończ jazdę próbną!',
        },
    },
    discardChangesConfirmation: {
        title: 'Odrzucić zmiany?',
        body: 'Czy na pewno chcesz odrzucić wprowadzone zmiany?',
        confirmText: 'Odrzuć zmiany',
    },
    scheduledCall: {
        book: {
            title: 'Zaplanuj rozmowę',
            description: 'Znajdź czas, który Ci odpowiada.',
            slots: 'Dostępne godziny dla',
        },
        confirmation: {
            title: 'Potwierdź połączenie',
            description: 'Upewnij się, że poniższe szczegóły są dla Ciebie w porządku. Po potwierdzeniu rozmowy wyślemy zaproszenie z dodatkowymi informacjami.',
            setupSpecialist: 'Twój specjalista ds. konfiguracji',
            meetingLength: 'Czas trwania spotkania',
            dateTime: 'Data i czas',
            minutes: '30 minut',
        },
        callScheduled: 'Połączenie zaplanowane',
    },
    autoSubmitModal: {
        title: 'Wszystko jasne i przesłane!',
        description: 'Wszystkie ostrzeżenia i naruszenia zostały usunięte, więc:',
        submittedExpensesTitle: 'Te wydatki zostały zgłoszone',
        submittedExpensesDescription: 'Te wydatki zostały wysłane do Twojego zatwierdzającego, ale nadal można je edytować, dopóki nie zostaną zatwierdzone.',
        pendingExpensesTitle: 'Oczekujące wydatki zostały przeniesione',
        pendingExpensesDescription: 'Wszelkie oczekujące wydatki kartowe zostały przeniesione do osobnego raportu, dopóki nie zostaną zaksięgowane.',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: 'Weź udział w 2-minutowej jeździe próbnej',
        },
        modal: {
            title: 'Wypróbuj nas w wersji testowej',
            description: 'Weź szybką wycieczkę po produkcie, aby szybko się zorientować. Żadnych przystanków nie potrzeba!',
            confirmText: 'Rozpocznij jazdę próbną',
            helpText: 'Pomiń',
            employee: {
                description: '<muted-text>Uzyskaj dla swojego zespołu <strong>3 darmowe miesiące Expensify!</strong> Wystarczy, że wpiszesz poniżej adres e-mail swojego szefa i wyślesz mu testowy wydatek.</muted-text>',
                email: 'Wprowadź adres e-mail swojego szefa',
                error: 'Ten członek posiada przestrzeń roboczą, proszę wprowadzić nowego członka do testu.',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: 'Obecnie testujesz Expensify',
            readyForTheRealThing: 'Gotowy na prawdziwą rzecz?',
            getStarted: 'Zacznij teraz',
        },
        employeeInviteMessage: function (_a) {
            var name = _a.name;
            return "# ".concat(name, " zaprosi\u0142 Ci\u0119 do wypr\u00F3bowania Expensify\nHej! W\u0142a\u015Bnie zdoby\u0142em dla nas *3 miesi\u0105ce za darmo*, aby wypr\u00F3bowa\u0107 Expensify, najszybszy spos\u00F3b na rozliczanie wydatk\u00F3w.\n\nOto *przyk\u0142adowy paragon*, aby pokaza\u0107 Ci, jak to dzia\u0142a:");
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
exports.default = translations;
