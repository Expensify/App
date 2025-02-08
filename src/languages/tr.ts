import {CONST as COMMON_CONST} from 'expensify-common';
import startCase from 'lodash/startCase';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import type {
    AccountOwnerParams,
    ActionsAreCurrentlyRestricted,
    AddEmployeeParams,
    AddressLineParams,
    AdminCanceledRequestParams,
    AlreadySignedInParams,
    ApprovalWorkflowErrorParams,
    ApprovedAmountParams,
    AssignCardParams,
    AssignedCardParams,
    AssigneeParams,
    AuthenticationErrorParams,
    AutoPayApprovedReportsLimitErrorParams,
    BadgeFreeTrialParams,
    BeginningOfChatHistoryAdminRoomPartOneParams,
    BeginningOfChatHistoryAnnounceRoomPartOneParams,
    BeginningOfChatHistoryDomainRoomPartOneParams,
    BillingBannerCardAuthenticationRequiredParams,
    BillingBannerCardExpiredParams,
    BillingBannerCardOnDisputeParams,
    BillingBannerDisputePendingParams,
    BillingBannerInsufficientFundsParams,
    BillingBannerSubtitleWithDateParams,
    CanceledRequestParams,
    CardEndingParams,
    CardInfoParams,
    CardNextPaymentParams,
    CategoryNameParams,
    ChangeFieldParams,
    ChangeOwnerDuplicateSubscriptionParams,
    ChangeOwnerHasFailedSettlementsParams,
    ChangeOwnerSubscriptionParams,
    ChangePolicyParams,
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
    CurrencyCodeParams,
    CustomersOrJobsLabelParams,
    CustomUnitRateParams,
    DateParams,
    DateShouldBeAfterParams,
    DateShouldBeBeforeParams,
    DefaultAmountParams,
    DefaultVendorDescriptionParams,
    DelegateRoleParams,
    DelegateSubmitParams,
    DelegatorParams,
    DeleteActionParams,
    DeleteConfirmationParams,
    DeleteTransactionParams,
    DidSplitAmountMessageParams,
    EarlyDiscountSubtitleParams,
    EarlyDiscountTitleParams,
    EditActionParams,
    EditDestinationSubtitleParams,
    ElectronicFundsParams,
    EnterMagicCodeParams,
    ExportAgainModalDescriptionParams,
    ExportedToIntegrationParams,
    ExportIntegrationSelectedParams,
    FeatureNameParams,
    FileLimitParams,
    FiltersAmountBetweenParams,
    FlightLayoverParams,
    FormattedMaxLengthParams,
    ForwardedAmountParams,
    GoBackMessageParams,
    GoToRoomParams,
    ImportedTagsMessageParams,
    ImportedTypesParams,
    ImportFieldParams,
    ImportMembersSuccessfullDescriptionParams,
    ImportPerDiemRatesSuccessfullDescriptionParams,
    ImportTagsSuccessfullDescriptionParams,
    IncorrectZipFormatParams,
    InstantSummaryParams,
    IntacctMappingTitleParams,
    IntegrationExportParams,
    IntegrationSyncFailedParams,
    InvalidPropertyParams,
    InvalidValueParams,
    IssueVirtualCardParams,
    LastFourDigitsParams,
    LastSyncAccountingParams,
    LastSyncDateParams,
    LeftWorkspaceParams,
    LocalTimeParams,
    LoggedInAsParams,
    LogSizeParams,
    ManagerApprovedAmountParams,
    ManagerApprovedParams,
    MarkedReimbursedParams,
    MarkReimbursedFromIntegrationParams,
    MissingPropertyParams,
    MovedFromSelfDMParams,
    NoLongerHaveAccessParams,
    NotAllowedExtensionParams,
    NotYouParams,
    OOOEventSummaryFullDayParams,
    OOOEventSummaryPartialDayParams,
    OptionalParam,
    OurEmailProviderParams,
    OwnerOwesAmountParams,
    PaidElsewhereWithAmountParams,
    PaidWithExpensifyWithAmountParams,
    ParentNavigationSummaryParams,
    PayerOwesAmountParams,
    PayerOwesParams,
    PayerPaidAmountParams,
    PayerPaidParams,
    PayerSettledParams,
    PaySomeoneParams,
    ReconciliationWorksParams,
    RemovedFromApprovalWorkflowParams,
    RemovedTheRequestParams,
    RemoveMemberPromptParams,
    RemoveMembersWarningPrompt,
    RenamedRoomActionParams,
    ReportArchiveReasonsClosedParams,
    ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams,
    ReportArchiveReasonsMergedParams,
    ReportArchiveReasonsRemovedFromPolicyParams,
    ReportPolicyNameParams,
    RequestAmountParams,
    RequestCountParams,
    RequestedAmountMessageParams,
    RequiredFieldParams,
    ResolutionConstraintsParams,
    RoleNamesParams,
    RoomNameReservedErrorParams,
    RoomRenamedToParams,
    SecondaryLoginParams,
    SetTheDistanceMerchantParams,
    SetTheRequestParams,
    SettledAfterAddedBankAccountParams,
    SettleExpensifyCardParams,
    SettlementDateParams,
    ShareParams,
    SignUpNewFaceCodeParams,
    SizeExceededParams,
    SplitAmountParams,
    SpreadCategoriesParams,
    SpreadFieldNameParams,
    SpreadSheetColumnParams,
    StatementTitleParams,
    StepCounterParams,
    StripePaidParams,
    SubmitsToParams,
    SubscriptionCommitmentParams,
    SubscriptionSettingsRenewsOnParams,
    SubscriptionSettingsSaveUpToParams,
    SubscriptionSizeParams,
    SyncStageNameConnectionsParams,
    TaskCreatedActionParams,
    TaxAmountParams,
    TermsParams,
    ThreadRequestReportNameParams,
    ThreadSentMoneyReportNameParams,
    ToValidateLoginParams,
    TransferParams,
    TrialStartedTitleParams,
    UnapprovedParams,
    UnapproveWithIntegrationWarningParams,
    UnshareParams,
    UntilTimeParams,
    UpdatedTheDistanceMerchantParams,
    UpdatedTheRequestParams,
    UpdateRoleParams,
    UsePlusButtonParams,
    UserIsAlreadyMemberParams,
    UserSplitParams,
    ViolationsAutoReportedRejectedExpenseParams,
    ViolationsCashExpenseWithNoReceiptParams,
    ViolationsConversionSurchargeParams,
    ViolationsInvoiceMarkupParams,
    ViolationsMaxAgeParams,
    ViolationsMissingTagParams,
    ViolationsModifiedAmountParams,
    ViolationsOverCategoryLimitParams,
    ViolationsOverLimitParams,
    ViolationsPerDayLimitParams,
    ViolationsReceiptRequiredParams,
    ViolationsRterParams,
    ViolationsTagOutOfPolicyParams,
    ViolationsTaxOutOfPolicyParams,
    WaitingOnBankAccountParams,
    WalletProgramParams,
    WelcomeEnterMagicCodeParams,
    WelcomeToRoomParams,
    WeSentYouMagicSignInLinkParams,
    WorkspaceLockedPlanTypeParams,
    WorkspaceMemberList,
    WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams,
    WorkspaceYouMayJoin,
    YourPlanPriceParams,
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
const translations = {
    common: {
        cancel: '\u0130ptal',
        dismiss: 'Reddet',
        yes: "Sorry, but there's no text provided for translation. Could you please provide the text you want to be translated?",
        no: "Sorry, but you didn't provide any text to translate.",
        ok: "You didn't provide any text to translate. Please provide the text you want translated.",
        notNow: '\u015Eimdi de\u011Fil',
        learnMore: 'Daha fazla \u00F6\u011Fren.',
        buttonConfirm: 'Anlad\u0131m',
        name: '\u0130sim',
        attachment: 'Ekli dosya',
        attachments: 'Ekler',
        center: 'Merkez',
        from: 'The text to be translated is missing. Please provide the text for translation.',
        to: 'translate the text, I would need the actual text to be translated. The instructions provided are for preserving placeholders in TypeScript, but no actual text for translation is provided. Please provide the text you want translated.',
        in: 'Your request seems to be incomplete. Please provide the text you want to translate.',
        optional: '\u0130ste\u011Fe Ba\u011Fl\u0131',
        new: 'Yeni',
        search: 'Arama',
        reports: 'Raporlar',
        find: 'Bul',
        searchWithThreeDots: 'Ara...',
        next: 'Bir sonraki metni g\u00F6nderin.',
        previous: '\u00D6nceki',
        goBack: 'Geri d\u00F6n',
        create: 'Olu\u015Ftur',
        add: 'Ekle',
        resend: 'Yeniden g\u00F6nder',
        save: 'Kaydet',
        select: 'Se\u00E7',
        selectMultiple: '\u00C7oklu se\u00E7im',
        saveChanges: 'De\u011Fi\u015Fiklikleri kaydet',
        submit: 'G\u00F6nder',
        rotate: 'D\u00F6nd\u00FCr',
        zoom: 'Zoom',
        password: '\u015Eifre',
        magicCode: 'Sihirli kod',
        twoFactorCode: '\u0130ki fakt\u00F6rl\u00FC kod',
        workspaces: '\u00C7al\u0131\u015Fma Alanlar\u0131',
        inbox: 'Gelen Kutusu',
        group: 'Grup',
        profile: 'Profil',
        referral: 'Referans',
        payments: '\u00D6demeler',
        approvals: 'Onaylar',
        wallet: 'C\u00FCzdan',
        preferences: 'Tercihler',
        view: 'G\u00F6r\u00FCn\u00FCm',
        review: '\u0130nceleme',
        not: "You haven't provided any text or TypeScript function to translate. Please provide the text or function you want translated.",
        signIn: 'Oturum a\u00E7\u0131n',
        signInWithGoogle: 'Google ile giri\u015F yap',
        signInWithApple: 'Apple ile oturum a\u00E7\u0131n',
        signInWith: '${username} ile oturum a\u00E7\u0131n',
        continue: "You didn't provide any text to translate. Please provide the text you want to be translated.",
        firstName: '\u0130lk isim',
        lastName: 'Soyad\u0131',
        addCardTermsOfService: 'Expensify Kullan\u0131m \u015Eartlar\u0131',
        perPerson: 'ki\u015Fi ba\u015F\u0131',
        phone: 'Telefon',
        phoneNumber: 'Telefon numaras\u0131',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'E-posta',
        and: 've',
        or: "Bu, d\u00FCz bir dize veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeler veya ba\u015Fka TypeScript kodu i\u00E7erebilir.",
        details: 'Detaylar',
        privacy: 'Gizlilik',
        privacyPolicy: 'Gizlilik Politikas\u0131',
        hidden: "Bu bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        visible: 'G\u00F6r\u00FCn\u00FCr',
        delete: 'Sil',
        archived: 'ar\u015Fivlendi',
        contacts: 'Ki\u015Filer',
        recents: 'Son Zamanlar',
        close: 'Kapat',
        download: '\u0130ndir',
        downloading: '\u0130ndiriliyor',
        uploading: 'Y\u00FCkleme',
        pin: 'Raptiye',
        unPin: 'Kald\u0131r',
        back: 'Geri',
        saveAndContinue: 'Kaydet & devam et',
        settings: 'Ayarlar',
        termsOfService: 'Hizmet \u015Eartlar\u0131',
        members: '\u00DCyeler',
        invite: 'Davet et',
        here: 'Your request seems to be incomplete. Please provide the text or TypeScript function that you want to be translated.',
        date: 'Tarih',
        dob: 'Do\u011Fum tarihi',
        currentYear: 'Mevcut y\u0131l',
        currentMonth: 'Mevcut ay',
        ssnLast4: "SSN'nin son 4 hanesi",
        ssnFull9: 'Tam 9 haneli SSN',
        addressLine: ({lineNumber}: AddressLineParams) => `Adres sat\u0131r\u0131 ${lineNumber}`,
        personalAddress: 'Ki\u015Fisel adres',
        companyAddress: '\u015Eirket adresi',
        noPO: 'L\u00FCtfen posta kutusu veya posta b\u0131rakma adresleri kullanmay\u0131n.',
        city: '\u015Eehir',
        state: 'Durum',
        streetAddress: 'Sokak adresi',
        stateOrProvince: 'Eyalet / \u0130l',
        country: '\u00DClke',
        zip: 'Posta kodu',
        zipPostCode: 'Posta Kodu / Posta Kodu',
        whatThis: 'Sorry, there seems to be a misunderstanding. Could you please provide the text or TypeScript function that you want to translate into Turkish?',
        iAcceptThe: 'task, but there is no text provided for translation.',
        remove: 'Kald\u0131r',
        admin: 'Y\u00F6netici',
        owner: 'Sahibi',
        dateFormat: 'YYYY-AA-GG',
        send: 'G\u00F6nder',
        na: "The task doesn't provide a specific text or TypeScript function to translate. Please provide the necessary information for the translation.",
        noResultsFound: 'Sonu\u00E7 bulunamad\u0131',
        recentDestinations: 'Son hedefler',
        timePrefix: 'Bu',
        conjunctionFor: 'The text to be translated is missing. Please provide the text.',
        todayAt: 'Bug\u00FCn saat ${time}',
        tomorrowAt: 'Yar\u0131n saat ${time}',
        yesterdayAt: 'D\u00FCn saat ${time}',
        conjunctionAt: 'Sorry, there is no text provided to translate. Could you please provide the text you want to translate?',
        conjunctionTo:
            "Bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsillerini tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodlar\u0131n\u0131 i\u00E7erebilir.",
        genericErrorMessage: 'Hata... bir \u015Feyler ters gitti ve iste\u011Finiz tamamlanamad\u0131. L\u00FCtfen daha sonra tekrar deneyin.',
        percentage: 'Y\u00FCzde',
        error: {
            invalidAmount: 'Ge\u00E7ersiz miktar.',
            acceptTerms: 'Devam etmek i\u00E7in Hizmet \u015Eartlar\u0131n\u0131 kabul etmelisiniz.',
            phoneNumber: `L\u00FCtfen ge\u00E7erli bir telefon numaras\u0131 girin, \u00FClke koduyla birlikte (\u00F6r. ${CONST.EXAMPLE_PHONE_NUMBER})`,
            fieldRequired: 'Bu alan gereklidir.',
            requestModified: 'Bu istek ba\u015Fka bir \u00FCye taraf\u0131ndan de\u011Fi\u015Ftiriliyor.',
            characterLimit: ({limit}: CharacterLimitParams) => `Maksimum ${limit} karakter s\u0131n\u0131r\u0131n\u0131 a\u015F\u0131yor`,
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `Karakter limiti a\u015F\u0131ld\u0131 (${length}/${limit})`,
            dateInvalid: 'L\u00FCtfen ge\u00E7erli bir tarih se\u00E7in.',
            invalidDateShouldBeFuture: 'L\u00FCtfen bug\u00FCn\u00FC veya gelecekteki bir tarihi se\u00E7in.',
            invalidTimeShouldBeFuture: 'L\u00FCtfen en az bir dakika sonras\u0131 i\u00E7in bir zaman se\u00E7in.',
            invalidCharacter: 'The text to be translated is missing in your request. Please provide the text you want to translate.',
            enterMerchant: 'Bir t\u00FCccar ad\u0131 girin.',
            enterAmount: 'Bir miktar girin.',
            enterDate: 'Bir tarih girin.',
            invalidTimeRange: 'L\u00FCtfen saatini 12 saatlik saat format\u0131n\u0131 kullanarak girin (\u00F6rne\u011Fin, 2:30 PM).',
            pleaseCompleteForm: 'L\u00FCtfen devam etmek i\u00E7in yukar\u0131daki formu tamamlay\u0131n.',
            pleaseSelectOne: 'L\u00FCtfen yukar\u0131daki se\u00E7eneklerden birini se\u00E7in.',
            invalidRateError: 'L\u00FCtfen ge\u00E7erli bir oran girin.',
            lowRateError: "Oran 0'dan b\u00FCy\u00FCk olmal\u0131d\u0131r.",
            email: 'L\u00FCtfen ge\u00E7erli bir e-posta adresi girin.',
        },
        comma: 'virg\u00FCl',
        semicolon: "You didn't provide any text to translate. Please provide the text you want to translate.",
        please: "You didn't provide any text to translate. Please provide the text you want to translate.",
        contactUs: 'bizimle ileti\u015Fime ge\u00E7in',
        pleaseEnterEmailOrPhoneNumber: 'L\u00FCtfen bir e-posta veya telefon numaras\u0131 girin',
        fixTheErrors: 'hatalar\u0131 d\u00FCzeltin',
        inTheFormBeforeContinuing: 'devam etmeden \u00F6nce formu doldurun',
        confirm: 'Onayla',
        reset: 'S\u0131f\u0131rla',
        done: "Your request doesn't include any specific text to translate. Please provide the text you want translated.",
        more: 'Your request is incomplete. Please provide the text or TypeScript function that you need to be translated into Turkish.',
        debitCard: 'Banka kart\u0131',
        bankAccount: 'Banka hesab\u0131',
        personalBankAccount: 'Ki\u015Fisel banka hesab\u0131',
        businessBankAccount: '\u0130\u015F bankas\u0131 hesab\u0131',
        join: 'Kat\u0131l',
        leave: 'Ayr\u0131l',
        decline: 'Reddet',
        transferBalance: 'Bakiye transferi',
        cantFindAddress: 'Adresinizi bulam\u0131yor musunuz?',
        enterManually: 'Manuel olarak girin',
        message: 'Mesaj',
        leaveThread: 'Konuyu terk et',
        you: 'have not provided any text or TypeScript function to translate. Please provide the necessary information.',
        youAfterPreposition: 'sen',
        your: 'translation request is missing. Please provide the text you want to translate.',
        conciergeHelp: "L\u00FCtfen yard\u0131m i\u00E7in Concierge'ye ba\u015Fvurun.",
        youAppearToBeOffline: '\u00C7evrimd\u0131\u015F\u0131 g\u00F6r\u00FCn\u00FCyorsunuz.',
        thisFeatureRequiresInternet: 'Bu \u00F6zellik aktif bir internet ba\u011Flant\u0131s\u0131 gerektirir.',
        attachementWillBeAvailableOnceBackOnline: 'Eklenti, tekrar \u00E7evrimi\u00E7i olundu\u011Funda kullan\u0131labilir hale gelecektir.',
        areYouSure: 'Emin misiniz?',
        verify: 'Do\u011Frula',
        yesContinue: 'Evet, devam et',
        websiteExample: '\u00D6rne\u011Fin, https://www.expensify.com',
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `\u00F6r. ${zipSampleFormat}` : ''),
        description: 'A\u00E7\u0131klama',
        with: 'Sorry, there is no text provided for translation. Please provide the text you want to translate.',
        shareCode: 'Kodu payla\u015F',
        share: 'Payla\u015F',
        per: "You didn't provide any text to translate. Please provide the text you want to translate.",
        mi: "Sorry, but there's no text provided to translate. Could you please provide the text you want to be translated?",
        km: "Bu bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi a\u00E7\u0131klar, ancak ternary ifadeler veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        copied: 'The text for translation is missing. Please provide the text you want to translate.',
        someone: 'Birisi',
        total: 'Toplam',
        edit: "Bu ya d\u00FCz bir dize veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, c\u00FCmlede neyi temsil ettiklerini a\u00E7\u0131klar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        letsDoThis: `Let's do this!`,
        letsStart: `Let's start`,
        showMore: 'Daha fazla g\u00F6ster',
        merchant: 'T\u00FCccar',
        category: 'Kategori',
        billable: 'Faturaland\u0131r\u0131labilir',
        nonBillable: 'Faturaland\u0131r\u0131lamaz',
        tag: "Bu bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki neyi temsil ettiklerini a\u00E7\u0131klar, ancak ternary ifadeler veya di\u011Fer TypeScript kodlar\u0131n\u0131 i\u00E7erebilir.",
        receipt: 'Fi\u015F',
        verified: 'Do\u011Frulanm\u0131\u015F',
        replace: 'The text to be translated is missing. Please provide the text for translation.',
        distance: 'Mesafe',
        mile: "Sorry, but there's no text provided to translate. Could you please provide the text you want to be translated?",
        miles: 'mil',
        kilometer:
            "Bu bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi a\u00E7\u0131klar, ancak ternary ifadeler veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        kilometers: 'kilometreler',
        recent: 'Son zamanlar',
        all: 'T\u00FCm',
        am: "Bu, d\u00FCz bir dize veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. Yer tutucular\u0131 ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} vb. i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki neyi temsil ettiklerini a\u00E7\u0131klar, ancak ternary ifadeleri veya ba\u015Fka TypeScript kodu i\u00E7erebilir.",
        pm: "You didn't provide any text to translate. Please provide the text you want translated.",
        tbd: "Since there is no text provided for translation, I'm unable to provide a Turkish translation. Please provide the text you'd like translated.",
        selectCurrency: 'Bir para birimi se\u00E7in',
        card: 'Kart',
        whyDoWeAskForThis: 'Bunu neden soruyoruz?',
        required:
            "Gerekli olan bir d\u00FCz metin ya da bir TypeScript fonksiyonu ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eren bir \u015Fablon dizesidir. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeleri veya ba\u015Fka TypeScript kodunu i\u00E7erebilir.",
        showing: 'G\u00F6steriliyor',
        of: 'As a language model AI, I need the text to translate. Please provide the text.',
        default: 'Varsay\u0131lan',
        update: 'G\u00FCncelle',
        member: '\u00DCye',
        auditor: 'Denet\u00E7i',
        role: 'Rol',
        currency: 'Para',
        rate: 'Oran',
        emptyLHN: {
            title: 'Woohoo! T\u00FCm\u00FCyle g\u00FCncel.',
            subtitleText1:
                "Bir sohbeti kullanarak bulun ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki neyi temsil ettiklerini tan\u0131mlar, ancak ternary ifadeleri veya ba\u015Fka TypeScript kodu i\u00E7erebilir.",
            subtitleText2: 'yukar\u0131daki d\u00FC\u011Fme, veya ${username} kullanarak bir \u015Feyler olu\u015Fturun',
            subtitleText3: 'a\u015Fa\u011F\u0131daki d\u00FC\u011Fme.',
        },
        businessName: '\u0130\u015Fletme ad\u0131',
        clear: 'Net',
        type: 'Your request is incomplete. Please provide the text or TypeScript function that you want to translate.',
        action: 'Eylem',
        expenses: 'Giderler',
        tax: 'Vergi',
        shared: 'Payla\u015F\u0131lan',
        drafts: 'Taslaklar',
        finished: 'Bitmi\u015F',
        upgrade: 'Y\u00FCkseltme',
        downgradeWorkspace: '\u00C7al\u0131\u015Fma alan\u0131n\u0131 d\u00FC\u015F\u00FCr',
        companyID: '\u015Eirket ID',
        userID: 'Kullan\u0131c\u0131 ID',
        disable: 'Devre D\u0131\u015F\u0131 B\u0131rak',
        export: 'D\u0131\u015Fa Aktar',
        initialValue: '\u0130lk de\u011Fer',
        currentDate: 'Mevcut tarih',
        value: 'De\u011Fer',
        downloadFailedTitle: '\u0130ndirme ba\u015Far\u0131s\u0131z oldu',
        downloadFailedDescription: '\u0130ndirme i\u015Flemi tamamlanamad\u0131. L\u00FCtfen daha sonra tekrar deneyin.',
        filterLogs: 'Kay\u0131t Filtrele',
        network: 'A\u011F',
        reportID: 'Rapor ID',
        bankAccounts: 'Banka hesaplar\u0131',
        chooseFile: 'Dosya se\u00E7',
        dropTitle: 'B\u0131rak gitsin',
        dropMessage: 'Dosyan\u0131z\u0131 buraya b\u0131rak\u0131n',
        ignore: 'As a language model AI developed by OpenAI, I need the text to translate. Please provide the text you want to be translated.',
        enabled: 'Etkin',
        disabled: 'Devre D\u0131\u015F\u0131',
        import: '\u0130\u00E7e Aktar',
        offlinePrompt: '\u015Eu anda bu eylemi ger\u00E7ekle\u015Ftiremezsiniz.',
        outstanding: 'M\u00FCkemmel',
        chats: 'Sohbetler',
        unread: 'Okunmam\u0131\u015F',
        sent: "Sorry, but you didn't provide any text to translate.",
        links: 'Ba\u011Flant\u0131lar',
        days: 'g\u00FCnler',
        rename: 'Yeniden adland\u0131r',
        address: 'Adres',
        hourAbbreviation: "You didn't provide any text to translate. Please provide the text you want to be translated.",
        minuteAbbreviation: "Sorry, but there's no text provided for translation. Could you please provide the text you want to be translated?",
        skip: "Bu ya basit bir metin veya bir \u015Fablon metni d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `Belirli bir \u015Feye mi ihtiyac\u0131n\u0131z var? Hesap y\u00F6neticiniz, ${accountManagerDisplayName}, ile sohbet edin.`,
        chatNow: '\u015Eimdi sohbet et',
        destination: 'Hedef',
        subrate:
            "Bu, d\u00FCz bir metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki neyi temsil ettiklerini tan\u0131mlar, ancak ternary ifadeler veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        perDiem: 'G\u00FCnl\u00FCk',
        validate: 'Do\u011Frula',
    },
    supportalNoAccess: {
        title: '\u00C7ok h\u0131zl\u0131 olma',
        description: 'Destek oturumu a\u00E7\u0131kken bu i\u015Flemi ger\u00E7ekle\u015Ftirme yetkiniz yok.',
    },
    location: {
        useCurrent: 'Mevcut konumu kullan',
        notFound: 'Konumunuzu bulamad\u0131k. L\u00FCtfen tekrar deneyin veya bir adresi manuel olarak girin.',
        permissionDenied: 'Konumunuza eri\u015Fimi reddetti\u011Finiz g\u00F6r\u00FCn\u00FCyor.',
        please: "You didn't provide any text to translate. Please provide the text you want to translate.",
        allowPermission: 'ayarlar\u0131nda konum eri\u015Fimine izin ver',
        tryAgain: 've tekrar deneyin.',
    },
    anonymousReportFooter: {
        logoTagline: 'Tart\u0131\u015Fmaya kat\u0131l\u0131n.',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'Kamera eri\u015Fimi',
        expensifyDoesntHaveAccessToCamera:
            'Expensify, kameran\u0131za eri\u015Fim olmadan foto\u011Fraf \u00E7ekemez. \u0130zinleri g\u00FCncellemek i\u00E7in ayarlar\u0131 t\u0131klay\u0131n.',
        attachmentError: 'Ek dosya hatas\u0131',
        errorWhileSelectingAttachment: 'Bir ek se\u00E7ilirken bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin.',
        errorWhileSelectingCorruptedAttachment: 'Bozuk bir eklenti se\u00E7ilirken bir hata olu\u015Ftu. L\u00FCtfen ba\u015Fka bir dosya deneyin.',
        takePhoto: 'Foto\u011Fraf \u00E7ek',
        chooseFromGallery: 'Galeriden se\u00E7in',
        chooseDocument: 'Dosya se\u00E7',
        attachmentTooLarge: 'Ek dosya \u00E7ok b\u00FCy\u00FCk',
        sizeExceeded: 'Ek dosya boyutu 24 MB s\u0131n\u0131r\u0131ndan daha b\u00FCy\u00FCk',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `Ek dosya boyutu ${maxUploadSizeInMB} MB limitinden daha b\u00FCy\u00FCk`,
        attachmentTooSmall: 'Ek dosya \u00E7ok k\u00FC\u00E7\u00FCk',
        sizeNotMet: "Ek dosya boyutu 240 byte'tan b\u00FCy\u00FCk olmal\u0131d\u0131r.",
        wrongFileType: 'Ge\u00E7ersiz dosya t\u00FCr\u00FC',
        notAllowedExtension: 'Bu dosya t\u00FCr\u00FCne izin verilmiyor. L\u00FCtfen farkl\u0131 bir dosya t\u00FCr\u00FC deneyin.',
        folderNotAllowedMessage: 'Bir klas\u00F6r y\u00FCklemeye izin verilmiyor. L\u00FCtfen farkl\u0131 bir dosya deneyin.',
        protectedPDFNotSupported: 'Parola korumal\u0131 PDF desteklenmiyor',
        attachmentImageResized: 'Bu resim \u00F6nizleme i\u00E7in yeniden boyutland\u0131r\u0131ld\u0131. Tam \u00E7\u00F6z\u00FCn\u00FCrl\u00FCk i\u00E7in indirin.',
        attachmentImageTooLarge: 'Bu resim, y\u00FCklemeden \u00F6nce \u00F6nizlemek i\u00E7in \u00E7ok b\u00FCy\u00FCk.',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `Bir seferde en fazla ${fileLimit} dosya y\u00FCkleyebilirsiniz.`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `Dosyalar ${maxUploadSizeInMB} MB'\u0131 a\u015F\u0131yor. L\u00FCtfen tekrar deneyin.`,
    },
    filePicker: {
        fileError: 'Dosya hatas\u0131',
        errorWhileSelectingFile: 'Bir dosya se\u00E7ilirken bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin.',
    },
    connectionComplete: {
        title: 'Ba\u011Flant\u0131 tamamland\u0131',
        supportingText: 'Bu pencereyi kapatabilir ve Expensify uygulamas\u0131na geri d\u00F6nebilirsiniz.',
    },
    avatarCropModal: {
        title: 'Foto\u011Fraf\u0131 d\u00FCzenle',
        description: 'G\u00F6r\u00FCnt\u00FCn\u00FCz\u00FC istedi\u011Finiz gibi s\u00FCr\u00FCkleyin, yak\u0131nla\u015Ft\u0131r\u0131n ve d\u00F6nd\u00FCr\u00FCn.',
    },
    composer: {
        noExtensionFoundForMimeType: 'Mime t\u00FCr\u00FC i\u00E7in hi\u00E7bir uzant\u0131 bulunamad\u0131',
        problemGettingImageYouPasted: 'Yap\u0131\u015Ft\u0131rd\u0131\u011F\u0131n\u0131z resmi al\u0131rken bir sorun olu\u015Ftu',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Maksimum yorum uzunlu\u011Fu ${formattedMaxLength} karakterdir.`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `Maksimum g\u00F6rev ba\u015Fl\u0131\u011F\u0131 uzunlu\u011Fu ${formattedMaxLength} karakterdir.`,
    },
    baseUpdateAppModal: {
        updateApp: 'Uygulamay\u0131 g\u00FCncelle',
        updatePrompt:
            'Bu uygulaman\u0131n yeni bir s\u00FCr\u00FCm\u00FC mevcut.\n\u015Eimdi g\u00FCncelleyin veya en son de\u011Fi\u015Fiklikleri indirmek i\u00E7in uygulamay\u0131 daha sonra yeniden ba\u015Flat\u0131n.',
    },
    deeplinkWrapper: {
        launching: 'Expensify Ba\u015Flat\u0131l\u0131yor',
        expired: 'Oturumunuz sona erdi.',
        signIn: 'L\u00FCtfen tekrar oturum a\u00E7\u0131n.',
        redirectedToDesktopApp: 'Sizi masa\u00FCst\u00FC uygulamas\u0131na y\u00F6nlendirdik.',
        youCanAlso:
            "Ayr\u0131ca ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyabilirsiniz. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyle ilgili a\u00E7\u0131klay\u0131c\u0131d\u0131r, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        openLinkInBrowser: 'bu ba\u011Flant\u0131y\u0131 taray\u0131c\u0131n\u0131zda a\u00E7\u0131n',
        loggedInAs: ({email}: LoggedInAsParams) => `You're logged in as ${email}. Click "Open link" in the prompt to log into the desktop app with this account.`,
        doNotSeePrompt: "I'm sorry but there is no text provided in the prompt to translate. Could you please provide the text you want to translate?",
        tryAgain: 'Tekrar deneyin',
        or: "You didn't provide any text to be translated. Please provide the text for translation.",
        continueInWeb: 'web uygulamas\u0131na devam et',
    },
    validateCodeModal: {
        successfulSignInTitle: 'Abrakadabra,\noturum a\u00E7t\u0131n\u0131z!',
        successfulSignInDescription: 'Devam etmek i\u00E7in orijinal sekmeye geri d\u00F6n\u00FCn.',
        title: '\u0130\u015Fte sihirli kodunuz',
        description: 'L\u00FCtfen kodu orijinal olarak istendi\u011Fi cihazdan girin',
        doNotShare: 'Kimseyle kodunuzu payla\u015Fmay\u0131n.\nExpensify asla sizden bunu istemeyecektir!',
        or: "You didn't provide any text to be translated. Please provide the text for translation.",
        signInHere: 'burada oturum a\u00E7\u0131n',
        expiredCodeTitle: 'Sihirli kodun s\u00FCresi doldu',
        expiredCodeDescription: 'Orijinal cihaza geri d\u00F6n\u00FCn ve yeni bir kod isteyin',
        successfulNewCodeRequest: 'Kod talep edildi. L\u00FCtfen cihaz\u0131n\u0131z\u0131 kontrol edin.',
        tfaRequiredTitle: '\u0130ki fakt\u00F6rl\u00FC kimlik do\u011Frulama\ngerekli',
        tfaRequiredDescription: 'L\u00FCtfen oturum a\u00E7maya \u00E7al\u0131\u015Ft\u0131\u011F\u0131n\u0131z yerde iki fakt\u00F6rl\u00FC do\u011Frulama kodunu girin.',
        requestOneHere: 'buradan bir tane isteyin.',
    },
    moneyRequestConfirmationList: {
        paidBy: '\u00D6denen taraf\u0131ndan',
        whatsItFor: 'Bunun i\u00E7in ne?',
    },
    selectionList: {
        nameEmailOrPhoneNumber: '\u0130sim, e-posta veya telefon numaras\u0131',
        findMember: 'Bir \u00FCye bulun',
    },
    emptyList: {
        [CONST.IOU.TYPE.SUBMIT]: {
            title: 'Bir gider g\u00F6nderin',
            subtitleText1: 'Birine teslim ol ve',
            subtitleText2: `get $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            subtitleText3: 'm\u00FC\u015Fteri olduklar\u0131nda.',
        },
        [CONST.IOU.TYPE.SPLIT]: {
            title: 'Bir masraf\u0131 b\u00F6l\u00FCn',
            subtitleText1: 'Bir arkada\u015F\u0131nla b\u00F6l',
            subtitleText2: `get $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            subtitleText3: 'm\u00FC\u015Fteri olduklar\u0131nda.',
        },
        [CONST.IOU.TYPE.PAY]: {
            title: 'Birine \u00F6deme yap',
            subtitleText1: 'Herhangi birine \u00F6deme yap\u0131n',
            subtitleText2: `get $${CONST.REFERRAL_PROGRAM.REVENUE}`,
            subtitleText3: 'm\u00FC\u015Fteri olduklar\u0131nda.',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: 'Bir \u00E7a\u011Fr\u0131 ay\u0131rt\u0131n',
    },
    hello: 'Merhaba',
    phoneCountryCode: "Since there's no text provided for translation, I'm unable to provide a translation. Please provide the text you want translated.",
    welcomeText: {
        getStarted: 'A\u015Fa\u011F\u0131dan ba\u015Flay\u0131n.',
        anotherLoginPageIsOpen: 'Ba\u015Fka bir giri\u015F sayfas\u0131 a\u00E7\u0131k.',
        anotherLoginPageIsOpenExplanation: 'Giri\u015F sayfas\u0131n\u0131 ayr\u0131 bir sekmede a\u00E7t\u0131n\u0131z. L\u00FCtfen o sekmeden giri\u015F yap\u0131n.',
        welcome: 'Ho\u015F geldiniz!',
        welcomeWithoutExclamation: 'Ho\u015Fgeldiniz',
        phrase2: 'Para konu\u015Fur. Ve \u015Fimdi sohbet ve \u00F6demeler bir aradaysa, bu ayn\u0131 zamanda kolayd\u0131r.',
        phrase3: '\u00D6demeleriniz, noktan\u0131z\u0131 ne kadar h\u0131zl\u0131 anlatabiliyorsan\u0131z o kadar h\u0131zl\u0131 size ula\u015F\u0131r.',
        enterPassword: 'L\u00FCtfen \u015Fifrenizi girin',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login}, it's always great to see a new face around here!`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) =>
            `L\u00FCtfen ${login} adresine g\u00F6nderilen sihirli kodu girin. Bir veya iki dakika i\u00E7inde gelmesi gerekiyor.`,
    },
    login: {
        hero: {
            header: 'Sohbetin h\u0131z\u0131nda seyahat ve masraf',
            body: "Expensify'nin yeni nesline ho\u015F geldiniz, burada seyahat ve masraflar\u0131n\u0131z, ba\u011Flamsal, ger\u00E7ek zamanl\u0131 sohbetin yard\u0131m\u0131yla daha h\u0131zl\u0131 hareket eder.",
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `Zaten ${email} olarak oturum a\u00E7m\u0131\u015F durumdas\u0131n\u0131z.`,
        goBackMessage: ({provider}: GoBackMessageParams) => `Don't want to sign in with ${provider}?`,
        continueWithMyCurrentSession: 'Mevcut oturumumla devam et',
        redirectToDesktopMessage: 'Oturum a\u00E7may\u0131 tamamlad\u0131ktan sonra sizi masa\u00FCst\u00FC uygulamas\u0131na y\u00F6nlendirece\u011Fiz.',
        signInAgreementMessage:
            "Giri\u015F yaparak, \u015Fu ko\u015Fullar\u0131 kabul etmi\u015F oluyorsunuz: ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} vb. yer tutucular\u0131n i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeler veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        termsOfService: 'Hizmet \u015Eartlar\u0131',
        privacy: 'Gizlilik',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'Tek oturum a\u00E7ma ile giri\u015F yapmaya devam edin:',
        orContinueWithMagicCode: 'Ayr\u0131ca bir sihirli kod ile de giri\u015F yapabilirsiniz',
        useSingleSignOn: 'Tek seferlik oturum a\u00E7ma kullan\u0131n',
        useMagicCode: 'Sihirli kodu kullan\u0131n',
        launching: 'Ba\u015Flat\u0131l\u0131yor...',
        oneMoment: 'Bir anl\u0131k bekleyin, sizi \u015Firketinizin tek oturum a\u00E7ma portal\u0131na y\u00F6nlendiriyoruz.',
    },
    reportActionCompose: {
        dropToUpload: 'Y\u00FCklemek i\u00E7in b\u0131rak\u0131n',
        sendAttachment: 'Ek dosyay\u0131 g\u00F6nder',
        addAttachment: 'Ek dosya ekle',
        writeSomething: "You haven't provided any text to translate. Please provide the text you want translated.",
        blockedFromConcierge: '\u0130leti\u015Fim engellenmi\u015Ftir',
        fileUploadFailed: 'Y\u00FCkleme ba\u015Far\u0131s\u0131z oldu. Dosya desteklenmiyor.',
        localTime: ({user, time}: LocalTimeParams) => `Bu ${user} i\u00E7in ${time} zaman\u0131`,
        edited: 'As a language model AI developed by OpenAI, I need the original text to perform the translation. Could you please provide the text you want to translate?',
        emoji: 'Emoji',
        collapse: '\u00C7\u00F6k\u00FC\u015F',
        expand: 'Your request is a bit unclear. Could you please provide the text or TypeScript function that you want to be translated into Turkish?',
    },
    reportActionContextMenu: {
        copyToClipboard:
            "Metin, ya d\u00FCz bir dize ya da bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeler veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        copied: 'The text for translation is missing. Please provide the text you want to translate.',
        copyLink: 'Ba\u011Flant\u0131y\u0131 kopyala',
        copyURLToClipboard: "URL'yi panoya kopyala",
        copyEmailToClipboard: 'E-postay\u0131 panoya kopyala',
        markAsUnread: 'Okunmam\u0131\u015F olarak i\u015Faretle',
        markAsRead: 'Okundu olarak i\u015Faretle',
        editAction: ({action}: EditActionParams) => `Edit ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'expense' : 'comment'}`,
        deleteAction: ({action}: DeleteActionParams) => `Delete ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'expense' : 'comment'}`,
        deleteConfirmation: ({action}: DeleteConfirmationParams) => `Bu ${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? 'gideri' : 'yorumu'} silmek istedi\u011Finize emin misiniz?`,
        onlyVisible: 'Yaln\u0131zca \u015Fu ki\u015Fiye g\u00F6r\u00FCn\u00FCr: ${username}',
        replyInThread: 'Konuya yan\u0131t ver',
        joinThread: 'Konuya kat\u0131l',
        leaveThread: 'Konuyu terk et',
        copyOnyxData: 'Onyx verilerini kopyala',
        flagAsOffensive: 'Hakaret olarak i\u015Faretle',
        menu: 'Men\u00FC',
    },
    emojiReactions: {
        addReactionTooltip: 'Tepki ekle',
        reactedWith: 'ile tepki verdi',
    },
    reportActionsView: {
        beginningOfArchivedRoomPartOne: "Partiye kat\u0131lamad\u0131n\u0131z ${username}, ${count} ki\u015Fi geldi. ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}",
        beginningOfArchivedRoomPartTwo: ', burada g\u00F6recek bir \u015Fey yok.',
        beginningOfChatHistoryDomainRoomPartOne: ({domainRoom}: BeginningOfChatHistoryDomainRoomPartOneParams) =>
            `Bu sohbet, ${domainRoom} alan\u0131ndaki t\u00FCm Expensify \u00FCyeleriyle ger\u00E7ekle\u015Ftirilmektedir.`,
        beginningOfChatHistoryDomainRoomPartTwo: 'Onu meslekta\u015Flar\u0131n\u0131zla sohbet etmek, ipu\u00E7lar\u0131 payla\u015Fmak ve sorular sormak i\u00E7in kullan\u0131n.',
        beginningOfChatHistoryAdminRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAdminRoomPartOneParams) =>
            `Bu sohbet ${workspaceName} y\u00F6neticileri ile yap\u0131lmaktad\u0131r.`,
        beginningOfChatHistoryAdminRoomPartTwo: '\u00C7al\u0131\u015Fma alan\u0131 kurulumu ve daha fazlas\u0131 hakk\u0131nda sohbet etmek i\u00E7in kullan\u0131n.',
        beginningOfChatHistoryAnnounceRoomPartOne: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomPartOneParams) =>
            `Bu sohbet, ${workspaceName} i\u00E7indeki herkesle yap\u0131lmaktad\u0131r.`,
        beginningOfChatHistoryAnnounceRoomPartTwo: ` Use it for the most important announcements.`,
        beginningOfChatHistoryUserRoomPartOne: 'Bu sohbet odas\u0131 her \u015Fey i\u00E7in ge\u00E7erlidir',
        beginningOfChatHistoryUserRoomPartTwo: "Sorry, but there's no text provided for translation. Could you please provide the text you want to be translated?",
        beginningOfChatHistoryInvoiceRoomPartOne: `This chat is for invoices between `,
        beginningOfChatHistoryInvoiceRoomPartTwo: `. Use the + button to send an invoice.`,
        beginningOfChatHistory: 'Bu sohbet ${username} ile',
        beginningOfChatHistoryPolicyExpenseChatPartOne:
            "Bu, ${username} oldu\u011Fu yerdir. ${count} adet var. ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} durumuna ba\u011Fl\u0131 olarak de\u011Fi\u015Fir.",
        beginningOfChatHistoryPolicyExpenseChatPartTwo: 'masraflar\u0131 g\u00F6nderecektir ${username}',
        beginningOfChatHistoryPolicyExpenseChatPartThree: '. Sadece + d\u00FC\u011Fmesini kullan\u0131n.',
        beginningOfChatHistorySelfDM: 'Bu sizin ki\u015Fisel alan\u0131n\u0131zd\u0131r. Notlar, g\u00F6revler, taslaklar ve hat\u0131rlatmalar i\u00E7in kullan\u0131n.',
        beginningOfChatHistorySystemDM: 'Ho\u015F geldiniz! Sizi ayarlayal\u0131m.',
        chatWithAccountManager: 'Burada hesap y\u00F6neticinizle sohbet edin',
        sayHello: 'Merhaba de!',
        yourSpace: 'Senin alan\u0131n',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `Welcome to ${roomName}!`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `+ d\u00FC\u011Fmesini kullanarak bir gider ${additionalText}.`,
        askConcierge: 'Sorular sorun ve 24/7 ger\u00E7ek zamanl\u0131 destek al\u0131n.',
        conciergeSupport: '24/7 destek',
        create: 'olu\u015Ftur',
        iouTypes: {
            pay: '\u00F6deme',
            split: "Bu bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki neyi temsil ettiklerini tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodlar\u0131n\u0131 i\u00E7erebilir.",
            submit: 'g\u00F6nder',
            track: 'izleme',
            invoice: 'fatura',
        },
    },
    adminOnlyCanPost: 'Bu odada sadece y\u00F6neticiler mesaj g\u00F6nderebilir.',
    reportAction: {
        asCopilot:
            "Bu bir d\u00FCz metin veya bir TypeScript fonksiyonu olan bir \u015Fablondur. Yer tutucular\u0131 ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} vb. i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, c\u00FCmlenin neyi temsil etti\u011Fini a\u00E7\u0131klar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
    },
    mentionSuggestions: {
        hereAlternateText: 'Bu konu\u015Fmadaki herkesi bilgilendirin',
    },
    newMessages: 'Yeni mesajlar',
    youHaveBeenBanned: 'Not: Bu kanalda sohbet etmekten yasakland\u0131n\u0131z.',
    reportTypingIndicator: {
        isTyping: 'The original text is missing. Please provide the text that needs to be translated.',
        areTyping:
            "Bir d\u00FCz metin veya bir TypeScript fonksiyonu olabilir ve bir \u015Fablon dizesi d\u00F6nd\u00FCr\u00FCr. Yer tutucular\u0131 ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} vb. i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeler veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        multipleMembers: '\u00C7oklu \u00FCyeler',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'Bu sohbet odas\u0131 ar\u015Fivlendi.',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `Bu sohbet art\u0131k aktif de\u011Fil \u00E7\u00FCnk\u00FC ${displayName} hesab\u0131n\u0131 kapatt\u0131.`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `Bu sohbet art\u0131k aktif de\u011Fil \u00E7\u00FCnk\u00FC ${oldDisplayName} hesab\u0131n\u0131 ${displayName} ile birle\u015Ftirdi.`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `Bu sohbet art\u0131k aktif de\u011Fil \u00E7\u00FCnk\u00FC <strong>siz</strong> art\u0131k ${policyName} \u00E7al\u0131\u015Fma alan\u0131n\u0131n bir \u00FCyesi de\u011Filsiniz.`
                : `Bu sohbet art\u0131k aktif de\u011Fil \u00E7\u00FCnk\u00FC ${displayName} art\u0131k ${policyName} \u00E7al\u0131\u015Fma alan\u0131n\u0131n bir \u00FCyesi de\u011Fil.`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Bu sohbet art\u0131k aktif de\u011Fil \u00E7\u00FCnk\u00FC ${policyName} art\u0131k aktif bir \u00E7al\u0131\u015Fma alan\u0131 de\u011Fil.`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `Bu sohbet art\u0131k aktif de\u011Fil \u00E7\u00FCnk\u00FC ${policyName} art\u0131k aktif bir \u00E7al\u0131\u015Fma alan\u0131 de\u011Fil.`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'Bu rezervasyon ar\u015Fivlendi.',
    },
    writeCapabilityPage: {
        label: 'Kim g\u00F6nderi yapabilir',
        writeCapability: {
            all: 'T\u00FCm \u00FCyeler',
            admins: 'Yaln\u0131zca y\u00F6neticiler',
        },
    },
    sidebarScreen: {
        buttonFind: 'Bir \u015Feyler bul...',
        buttonMySettings: 'Benim ayarlar\u0131m',
        fabNewChat: 'Sohbeti ba\u015Flat',
        fabNewChatExplained: 'Sohbeti ba\u015Flat (Y\u00FCzen eylem)',
        chatPinned: 'Sohbet sabitlendi',
        draftedMessage: 'Taslak mesaj',
        listOfChatMessages: 'Sohbet mesajlar\u0131 listesi',
        listOfChats: 'Sohbetler listesi',
        saveTheWorld: 'D\u00FCnyay\u0131 kurtar',
        tooltip: 'Buradan ba\u015Flay\u0131n!',
        redirectToExpensifyClassicModal: {
            title: 'Yak\u0131nda geliyor',
            description:
                "New Expensify'nin belirli kurulumunuzu kar\u015F\u0131lamak i\u00E7in birka\u00E7 par\u00E7as\u0131n\u0131 daha ince ayarl\u0131yoruz. Bu arada, Expensify Classic'e gidin.",
        },
    },
    allSettingsScreen: {
        subscription: 'Abonelik',
        domains: 'Alanlar',
    },
    tabSelector: {
        chat: 'Sohbet',
        room: 'Oda',
        distance: 'Mesafe',
        manual: "Bu, d\u00FCz bir metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript i\u015Flevidir. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi a\u00E7\u0131klar, ancak ternary ifadeler veya ba\u015Fka TypeScript kodu i\u00E7erebilir.",
        scan: 'Tarama',
    },
    spreadsheet: {
        upload: 'Bir hesap tablosu y\u00FCkleyin',
        dragAndDrop: 'Buraya hesap tablonuzu s\u00FCr\u00FCkleyip b\u0131rak\u0131n veya a\u015Fa\u011F\u0131dan bir dosya se\u00E7in. Desteklenen formatlar: .csv, .txt, .xls ve .xlsx.',
        chooseSpreadsheet: 'Bir hesap tablosu dosyas\u0131 i\u00E7e aktar\u0131n. Desteklenen formatlar: .csv, .txt, .xls ve .xlsx.',
        fileContainsHeader: 'Dosya s\u00FCtun ba\u015Fl\u0131klar\u0131 i\u00E7erir',
        column: ({name}: SpreadSheetColumnParams) => `S\u00FCtun ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) =>
            `Hata! Gerekli bir alan ("${fieldName}") e\u015Fle\u015Ftirilmemi\u015F. L\u00FCtfen g\u00F6zden ge\u00E7irin ve tekrar deneyin.`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) =>
            `Hata! Tek bir alan\u0131 ("${fieldName}") birden fazla s\u00FCtuna e\u015Flediniz. L\u00FCtfen g\u00F6zden ge\u00E7irin ve tekrar deneyin.`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) =>
            `Hata! "${fieldName}" alan\u0131 bir veya daha fazla bo\u015F de\u011Fer i\u00E7eriyor. L\u00FCtfen kontrol edin ve tekrar deneyin.`,
        importSuccessfullTitle: '\u0130\u00E7e aktarma ba\u015Far\u0131l\u0131',
        importCategoriesSuccessfullDescription: ({categories}: SpreadCategoriesParams) => (categories > 1 ? `${categories} categories have been added.` : '1 kategori eklendi.'),
        importMembersSuccessfullDescription: ({members}: ImportMembersSuccessfullDescriptionParams) => (members > 1 ? `${members} members have been added.` : '1 \u00FCye eklenmi\u015Ftir.'),
        importTagsSuccessfullDescription: ({tags}: ImportTagsSuccessfullDescriptionParams) => (tags > 1 ? `${tags} tags have been added.` : '1 etiket eklendi.'),
        importPerDiemRatesSuccessfullDescription: ({rates}: ImportPerDiemRatesSuccessfullDescriptionParams) =>
            rates > 1 ? `${rates} per diem rates have been added.` : '1 g\u00FCnl\u00FCk \u00FCcret oran\u0131 eklenmi\u015Ftir.',
        importFailedTitle: '\u0130\u00E7e aktarma ba\u015Far\u0131s\u0131z oldu',
        importFailedDescription:
            'L\u00FCtfen t\u00FCm alanlar\u0131n do\u011Fru bir \u015Fekilde dolduruldu\u011Fundan emin olun ve tekrar deneyin. E\u011Fer sorun devam ederse, l\u00FCtfen Concierge ile ileti\u015Fime ge\u00E7in.',
        importDescription: 'A\u015Fa\u011F\u0131daki her bir ithal edilmi\u015F s\u00FCtuna t\u0131klanarak haritalanacak alanlar\u0131 se\u00E7in.',
        sizeNotMet: "Dosya boyutu 0 byte'tan b\u00FCy\u00FCk olmal\u0131d\u0131r.",
        invalidFileMessage:
            'Y\u00FCkledi\u011Finiz dosya ya bo\u015F ya da ge\u00E7ersiz veri i\u00E7eriyor. L\u00FCtfen dosyan\u0131n do\u011Fru bi\u00E7imde formatland\u0131\u011F\u0131ndan ve gerekli bilgileri i\u00E7erdi\u011Finden emin olun ve tekrar y\u00FCkleyin.',
        importSpreadsheet: 'Hesap tablosunu i\u00E7e aktar',
        downloadCSV: 'CSV \u0130ndir',
    },
    receipt: {
        upload: 'Fi\u015F y\u00FCkle',
        dragReceiptBeforeEmail: "Bu sayfaya bir makbuz s\u00FCr\u00FCkleyin, bir makbuzu ${username}'a iletin.",
        dragReceiptAfterEmail: 'veya a\u015Fa\u011F\u0131dan y\u00FCklemek i\u00E7in bir dosya se\u00E7in.',
        chooseReceipt:
            "Bir makbuz y\u00FCklemek i\u00E7in se\u00E7in veya bir makbuzu iletmek i\u00E7in ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeler veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        takePhoto: 'Bir foto\u011Fraf \u00E7ek',
        cameraAccess: 'Makbuzlar\u0131n resimlerini \u00E7ekmek i\u00E7in kamera eri\u015Fimi gereklidir.',
        deniedCameraAccess: 'Kamera eri\u015Fimi hala verilmedi, l\u00FCtfen takip edin',
        deniedCameraAccessInstructions: 'Bu talimatlar',
        cameraErrorTitle: 'Kamera hatas\u0131',
        cameraErrorMessage: 'Bir foto\u011Fraf \u00E7ekilirken hata olu\u015Ftu. L\u00FCtfen tekrar deneyin.',
        locationAccessTitle: 'Konum eri\u015Fimine izin ver',
        locationAccessMessage: 'Konum eri\u015Fimi, nereye giderseniz gidin saat diliminizi ve para biriminizi do\u011Fru tutmam\u0131za yard\u0131mc\u0131 olur.',
        locationErrorTitle: 'Konum eri\u015Fimine izin ver',
        locationErrorMessage: 'Konum eri\u015Fimi, nereye giderseniz gidin saat diliminizi ve para biriminizi do\u011Fru tutmam\u0131za yard\u0131mc\u0131 olur.',
        allowLocationFromSetting: `Location access helps us keep your timezone and currency accurate wherever you go. Please allow location access from your device's permission settings.`,
        dropTitle: 'B\u0131rak gitsin',
        dropMessage: 'Dosyan\u0131z\u0131 buraya b\u0131rak\u0131n',
        flash: "Bu bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeler veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        shutter: 'panjur',
        gallery: 'galeri',
        deleteReceipt: 'Makbuz sil',
        deleteConfirmation: 'Bu makbuzu silmek istedi\u011Finizden emin misiniz?',
        addReceipt: 'Fi\u015F Ekle',
    },
    quickAction: {
        scanReceipt: 'Fi\u015F tarama',
        recordDistance: 'Kay\u0131t mesafesi',
        requestMoney: 'Gider olu\u015Ftur',
        splitBill: 'Gideri b\u00F6l\u00FCn',
        splitScan: 'Fi\u015Fi b\u00F6l',
        splitDistance: 'B\u00F6l\u00FCnm\u00FC\u015F mesafe',
        paySomeone: ({name}: PaySomeoneParams = {}) => `\u00D6de ${name ?? 'birine'}`,
        assignTask: 'G\u00F6rev ata',
        header: 'H\u0131zl\u0131 eylem',
        trackManual: 'Gider olu\u015Ftur',
        trackScan: 'Fi\u015F tarama',
        trackDistance: 'Mesafe izle',
        noLongerHaveReportAccess: 'Art\u0131k \u00F6nceki h\u0131zl\u0131 eylem hedefinize eri\u015Fiminiz yok. A\u015Fa\u011F\u0131dan yeni bir tane se\u00E7in.',
        updateDestination: 'Hedefi g\u00FCncelle',
    },
    iou: {
        amount: 'Miktar',
        taxAmount: 'Vergi miktar\u0131',
        taxRate: 'Vergi oran\u0131',
        approve: 'Onayla',
        approved: 'Onayland\u0131',
        cash: 'Nakit',
        card: 'Kart',
        original: 'Orijinal',
        split: 'B\u00F6l\u00FCnm\u00FC\u015F',
        splitExpense: 'Gideri b\u00F6l\u00FCn',
        paySomeone: ({name}: PaySomeoneParams = {}) => `\u00D6de ${name ?? 'birine'}`,
        expense: 'Gider',
        categorize: 'Kategorize',
        share: 'Payla\u015F',
        participants: 'Kat\u0131l\u0131mc\u0131lar',
        createExpense: 'Gider olu\u015Ftur',
        chooseRecipient: 'Al\u0131c\u0131y\u0131 se\u00E7in',
        createExpenseWithAmount: ({amount}: {amount: string}) => `Create ${amount} expense`,
        confirmDetails: 'Detaylar\u0131 onaylay\u0131n',
        pay: '\u00D6de',
        cancelPayment: '\u00D6deme iptal et',
        cancelPaymentConfirmation: 'Bu \u00F6demeyi iptal etmek istedi\u011Finizden emin misiniz?',
        viewDetails: 'Detaylar\u0131 g\u00F6r',
        pending: 'Beklemede',
        canceled: '\u0130ptal edildi',
        posted: 'Yay\u0131nland\u0131',
        deleteReceipt: 'Makbuz sil',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `bu rapordaki bir gideri sildi, ${merchant} - ${amount}`,
        pendingMatchWithCreditCard: 'Kart i\u015Flemiyle e\u015Fle\u015Fmeyi bekleyen makbuz',
        pendingMatchWithCreditCardDescription: 'Kart i\u015Flemiyle e\u015Fle\u015Fmesi beklenen fi\u015F. \u0130ptal etmek i\u00E7in nakit olarak i\u015Faretle.',
        markAsCash: 'Nakit olarak i\u015Faretle',
        routePending: 'Yol bekleniyor...',
        receiptScanning: () => ({
            one: 'Fi\u015F tarama...',
            other: 'Fi\u015Fler taran\u0131yor...',
        }),
        receiptScanInProgress: 'Fi\u015F taramas\u0131 devam ediyor',
        receiptScanInProgressDescription: 'Fi\u015F taramas\u0131 devam ediyor. Daha sonra kontrol edin veya detaylar\u0131 \u015Fimdi girin.',
        receiptIssuesFound: () => ({
            one: 'Sorun bulundu',
            other: 'Bulunan sorunlar',
        }),
        fieldPending:
            "Bu, d\u00FCz bir dize veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 koruyun ve i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan b\u0131rak\u0131n. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki neyi temsil ettiklerini a\u00E7\u0131klar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        defaultRate: 'Varsay\u0131lan oran',
        receiptMissingDetails: 'Fi\u015F eksik detaylar',
        missingAmount: 'Eksik miktar',
        missingMerchant: 'Eksik t\u00FCccar',
        receiptStatusTitle: 'Sorry, there is no text provided for translation. Please provide the text you want to be translated.',
        receiptStatusText: 'Bu makbuzu sadece siz tararken g\u00F6rebilirsiniz. Daha sonra kontrol edin veya detaylar\u0131 \u015Fimdi girin.',
        receiptScanningFailed: 'Fi\u015F taramas\u0131 ba\u015Far\u0131s\u0131z oldu. L\u00FCtfen detaylar\u0131 manuel olarak girin.',
        transactionPendingDescription: '\u0130\u015Flem bekliyor. G\u00F6nderilmesi birka\u00E7 g\u00FCn s\u00FCrebilir.',
        companyInfo: '\u015Eirket bilgisi',
        companyInfoDescription: '\u0130lk faturan\u0131z\u0131 g\u00F6nderebilmeniz i\u00E7in birka\u00E7 detay daha gerekiyor.',
        yourCompanyName: '\u015Eirket ad\u0131n\u0131z',
        yourCompanyWebsite: '\u015Eirketinizin web sitesi',
        yourCompanyWebsiteNote: 'E\u011Fer bir web siteniz yoksa, \u015Firketinizin LinkedIn veya sosyal medya profilini yerine sa\u011Flayabilirsiniz.',
        invalidDomainError: 'Ge\u00E7ersiz bir alan ad\u0131 girdiniz. Devam etmek i\u00E7in, l\u00FCtfen ge\u00E7erli bir alan ad\u0131 girin.',
        publicDomainError: 'Bir kamu alan\u0131na giri\u015F yapt\u0131n\u0131z. Devam etmek i\u00E7in, l\u00FCtfen bir \u00F6zel alan girin.',
        expenseCount: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} scanning`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`${pendingReceipts} pending`);
            }
            return {
                one: statusText.length > 0 ? `1 gider (${statusText.join(', ')})` : `1 expense`,
                other: (count: number) => (statusText.length > 0 ? `${count} expenses (${statusText.join(', ')})` : `${count} expenses`),
            };
        },
        deleteExpense: () => ({
            one: 'Gideri sil',
            other: 'Giderleri sil',
        }),
        deleteConfirmation: () => ({
            one: 'Bu gideri silmek istedi\u011Finizden emin misiniz?',
            other: 'Bu masraflar\u0131 silmek istedi\u011Finize emin misiniz?',
        }),
        settledExpensify: '\u00D6dendi',
        settledElsewhere: 'Ba\u015Fka bir yerde \u00F6dendi',
        individual: 'Birey',
        business: '\u0130\u015F',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Expensify ile ${formattedAmount} \u00F6de` : `Pay with Expensify`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Bireysel olarak ${formattedAmount} \u00F6de` : `Pay as an individual`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `\u00D6de ${formattedAmount}`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Bir i\u015Fletme olarak ${formattedAmount} \u00F6de` : `Pay as a business`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Ba\u015Fka bir yerde ${formattedAmount} \u00F6de` : `Pay elsewhere`),
        nextStep: 'Sonraki ad\u0131mlar',
        finished: 'Bitmi\u015F',
        sendInvoice: ({amount}: RequestAmountParams) => `Send ${amount} invoice`,
        submitAmount: ({amount}: RequestAmountParams) => `submit ${amount}`,
        submittedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `submitted ${formattedAmount}${comment ? ` for ${comment}` : ''}`,
        automaticallySubmittedAmount: ({formattedAmount}: RequestedAmountMessageParams) =>
            `<a href="${CONST.DELAYED_SUBMISSION_HELP_URL}">gecikmeli g\u00F6nderim</a> \u00FCzerinden otomatik olarak ${formattedAmount} g\u00F6nderildi`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `tracking ${formattedAmount}${comment ? ` for ${comment}` : ''}`,
        splitAmount: ({amount}: SplitAmountParams) => `split ${amount}`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `${comment ? ` için ${comment}` : ''} b\u00F6l`,
        yourSplit: ({amount}: UserSplitParams) => `Your split ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} owes ${amount}${comment ? ` for ${comment}` : ''}`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} owes: `,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${amount} \u00F6dedi`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} paid: `,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} spent ${amount}`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} spent: `,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} approved:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} approved ${amount}`,
        payerSettled: ({amount}: PayerSettledParams) => `paid ${amount}`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `paid ${amount}. Add a bank account to receive your payment.`,
        automaticallyApprovedAmount: ({amount}: ApprovedAmountParams) =>
            `<a href="${CONST.CONFIGURE_REIMBURSEMENT_SETTINGS_HELP_URL}">workspace kurallar\u0131</a> \u00FCzerinden otomatik onaylanan ${amount}`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `onaylanan ${amount}`,
        unapprovedAmount: ({amount}: UnapprovedParams) => `onaylanmam\u0131\u015F ${amount}`,
        automaticallyForwardedAmount: ({amount}: ForwardedAmountParams) =>
            `<a href="${CONST.CONFIGURE_REIMBURSEMENT_SETTINGS_HELP_URL}">workspace kurallar\u0131</a> \u00FCzerinden otomatik onaylanan ${amount}`,
        forwardedAmount: ({amount}: ForwardedAmountParams) => `onaylanan ${amount}`,
        rejectedThisReport: 'bu raporu reddetti',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `\u00D6deme d\u00FCzenlemeye ba\u015Fland\u0131. \u00D6deme, ${submitterDisplayName} bir banka hesab\u0131 ekleyene kadar bekletiliyor.`,
        adminCanceledRequest: ({manager, amount}: AdminCanceledRequestParams) => `${amount} \u00F6demeyi iptal etti`,
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `canceled the ${amount} payment, because ${submitterDisplayName} did not enable their Expensify Wallet within 30 days`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName} added a bank account. The ${amount} payment has been made.`,
        paidElsewhereWithAmount: ({payer, amount}: PaidElsewhereWithAmountParams) => `${payer ? `${payer} ` : ''}paid ${amount} elsewhere`,
        paidWithExpensifyWithAmount: ({payer, amount}: PaidWithExpensifyWithAmountParams) => `${amount} tutar\u0131n\u0131 Expensify ile \u00F6dedi.`,
        automaticallyPaidWithExpensify: ({payer, amount}: PaidWithExpensifyWithAmountParams) =>
            `${payer ? `${payer} ` : ''}automatically paid ${amount} with Expensify via <a href="${CONST.CONFIGURE_REIMBURSEMENT_SETTINGS_HELP_URL}">workspace rules</a>`,
        noReimbursableExpenses: 'Bu rapor ge\u00E7ersiz bir miktar i\u00E7eriyor',
        pendingConversionMessage: 'Toplam, \u00E7evrimi\u00E7i oldu\u011Funuzda g\u00FCncellenecek',
        changedTheExpense: 'masraf\u0131 de\u011Fi\u015Ftirdi',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `the ${valueName} to ${newValueToDisplay}`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `set the ${translatedChangedField} to ${newMerchant}, which set the amount to ${newAmountToDisplay}`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `the ${valueName} (previously ${oldValueToDisplay})`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `the ${valueName} to ${newValueToDisplay} (previously ${oldValueToDisplay})`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `changed the ${translatedChangedField} to ${newMerchant} (previously ${oldMerchant}), which updated the amount to ${newAmountToDisplay} (previously ${oldAmountToDisplay})`,
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `for ${comment}` : 'expense'}`,
        threadTrackReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `Tracking ${formattedAmount} ${comment ? `for ${comment}` : ''}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} sent${comment ? ` for ${comment}` : ''}`,
        movedFromSelfDM: ({workspaceName, reportName}: MovedFromSelfDMParams) => `kendi DM'den masraf\u0131 ${workspaceName ?? `${reportName} ile sohbet`}'e ta\u015F\u0131d\u0131.`,
        movedToSelfDM: 'kendine DM olarak masraf\u0131 ta\u015F\u0131d\u0131',
        tagSelection: 'Harcamalar\u0131n\u0131z\u0131 daha iyi organize etmek i\u00E7in bir etiket se\u00E7in.',
        categorySelection: 'Harcamalar\u0131n\u0131z\u0131 daha iyi d\u00FCzenlemek i\u00E7in bir kategori se\u00E7in.',
        error: {
            invalidCategoryLength: 'Kategori ad\u0131 255 karakteri a\u015F\u0131yor. L\u00FCtfen k\u0131salt\u0131n veya farkl\u0131 bir kategori se\u00E7in.',
            invalidAmount: 'L\u00FCtfen devam etmeden \u00F6nce ge\u00E7erli bir miktar girin.',
            invalidIntegerAmount: 'L\u00FCtfen devam etmeden \u00F6nce tam bir dolar miktar\u0131 girin.',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `Maksimum vergi miktar\u0131 ${amount}`,
            invalidSplit: 'B\u00F6l\u00FCmlerin toplam\u0131, toplam miktarla e\u015Fit olmal\u0131d\u0131r.',
            invalidSplitParticipants: 'L\u00FCtfen en az iki kat\u0131l\u0131mc\u0131 i\u00E7in s\u0131f\u0131rdan b\u00FCy\u00FCk bir miktar girin.',
            invalidSplitYourself: 'L\u00FCtfen b\u00F6l\u00FCnmeniz i\u00E7in s\u0131f\u0131rdan farkl\u0131 bir miktar girin.',
            noParticipantSelected: 'L\u00FCtfen bir kat\u0131l\u0131mc\u0131 se\u00E7in.',
            other: 'Beklenmeyen hata. L\u00FCtfen daha sonra tekrar deneyin.',
            genericCreateFailureMessage: 'Bu masraf\u0131 g\u00F6nderirken beklenmeyen bir hata olu\u015Ftu. L\u00FCtfen daha sonra tekrar deneyin.',
            genericCreateInvoiceFailureMessage: 'Bu faturay\u0131 g\u00F6nderirken beklenmedik bir hata olu\u015Ftu. L\u00FCtfen daha sonra tekrar deneyin.',
            genericHoldExpenseFailureMessage: 'Bu gideri tutarken beklenmedik bir hata olu\u015Ftu. L\u00FCtfen daha sonra tekrar deneyin.',
            genericUnholdExpenseFailureMessage: 'Bu giderin beklemesini kald\u0131r\u0131rken beklenmedik bir hata olu\u015Ftu. L\u00FCtfen daha sonra tekrar deneyin.',
            receiptDeleteFailureError: 'Bu makbuzu silerken beklenmeyen bir hata olu\u015Ftu. L\u00FCtfen daha sonra tekrar deneyin.',
            receiptFailureMessage: 'Fi\u015F y\u00FCklenmedi.',
            // eslint-disable-next-line rulesdir/use-periods-for-error-messages
            saveFileMessage: 'Dosyay\u0131 indirin',
            loseFileMessage: 'veya bu hatay\u0131 g\u00F6rmezden gel ve kaybet.',
            genericDeleteFailureMessage: 'Bu gideri silerken beklenmedik bir hata olu\u015Ftu. L\u00FCtfen daha sonra tekrar deneyin.',
            genericEditFailureMessage: 'Bu gideri d\u00FCzenlerken beklenmeyen bir hata olu\u015Ftu. L\u00FCtfen daha sonra tekrar deneyin.',
            genericSmartscanFailureMessage: '\u0130\u015Flemde eksik alanlar var.',
            duplicateWaypointsErrorMessage: 'L\u00FCtfen yinelenen yol noktalar\u0131n\u0131 kald\u0131r\u0131n.',
            atLeastTwoDifferentWaypoints: 'L\u00FCtfen en az iki farkl\u0131 adres giriniz.',
            splitExpenseMultipleParticipantsErrorMessage:
                'Bir gider, bir \u00E7al\u0131\u015Fma alan\u0131 ve di\u011Fer \u00FCyeler aras\u0131nda b\u00F6l\u00FCnemez. L\u00FCtfen se\u00E7iminizi g\u00FCncelleyin.',
            invalidMerchant: 'L\u00FCtfen do\u011Fru bir sat\u0131c\u0131 girin.',
            atLeastOneAttendee: 'En az bir kat\u0131l\u0131mc\u0131n\u0131n se\u00E7ilmesi gerekmektedir',
            invalidQuantity: 'L\u00FCtfen ge\u00E7erli bir miktar girin.',
            quantityGreaterThanZero: 'Miktar\u0131n s\u0131f\u0131rdan b\u00FCy\u00FCk olmas\u0131 gerekiyor.',
            invalidSubrateLength: 'En az bir alt oran olmal\u0131d\u0131r.',
            invalidRate:
                'Bu \u00E7al\u0131\u015Fma alan\u0131 i\u00E7in ge\u00E7erli bir oran de\u011Fil. L\u00FCtfen \u00E7al\u0131\u015Fma alan\u0131ndan kullan\u0131labilir bir oran se\u00E7in.',
        },
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `\u00D6deme ayarlamaya ba\u015Fland\u0131. \u00D6deme, ${submitterDisplayName} c\u00FCzdan\u0131n\u0131 etkinle\u015Ftirinceye kadar bekletiliyor.`,
        enableWallet: 'C\u00FCzdan\u0131 etkinle\u015Ftir',
        hold: 'Tut',
        unhold: "Bu ya d\u00FCz bir dizedir ya da bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        holdExpense: 'Gideri tut',
        unholdExpense: 'Tutulmayan gider',
        heldExpense: 'bu masraf\u0131 tuttu',
        unheldExpense: 'bu masraf\u0131 tutun',
        explainHold: 'Bu masraf\u0131 neden tuttu\u011Funuzu a\u00E7\u0131klay\u0131n.',
        reason: 'Sebep',
        holdReasonRequired: 'Tutarken bir sebep gereklidir.',
        expenseOnHold: 'Bu gider ask\u0131ya al\u0131nd\u0131. L\u00FCtfen sonraki ad\u0131mlar i\u00E7in yorumlar\u0131 g\u00F6zden ge\u00E7irin.',
        expensesOnHold: 'T\u00FCm harcamalar durduruldu. L\u00FCtfen bir sonraki ad\u0131mlar i\u00E7in yorumlar\u0131 g\u00F6zden ge\u00E7irin.',
        expenseDuplicate: 'Bu gider, ba\u015Fka biriyle ayn\u0131 detaylara sahip. L\u00FCtfen tutar\u0131 kald\u0131rmak i\u00E7in \u00E7iftleri g\u00F6zden ge\u00E7irin.',
        someDuplicatesArePaid: 'Bu yinelenenlerin baz\u0131lar\u0131 zaten onaylanm\u0131\u015F veya \u00F6denmi\u015Ftir.',
        reviewDuplicates: 'Yinelenenleri incele',
        keepAll: 'You have not provided any text or TypeScript function to translate. Please provide the text or TypeScript function that you want to translate into Turkish.',
        confirmApprove: 'Onay miktar\u0131n\u0131 do\u011Frulay\u0131n',
        confirmApprovalAmount: 'Sadece uyumlu giderleri onaylay\u0131n, ya da t\u00FCm raporu onaylay\u0131n.',
        confirmApprovalAllHoldAmount: () => ({
            one: 'Bu gider beklemekte. Yine de onaylamak ister misiniz?',
            other: 'Bu giderler beklemekte. Yine de onaylamak ister misiniz?',
        }),
        confirmPay: '\u00D6deme miktar\u0131n\u0131 onaylay\u0131n',
        confirmPayAmount: 'Beklemede olmayan\u0131 \u00F6de, ya da t\u00FCm raporu \u00F6de.',
        confirmPayAllHoldAmount: () => ({
            one: 'Bu gider beklemekte. Yine de \u00F6demek ister misiniz?',
            other: 'Bu giderler beklemekte. Yine de \u00F6demek ister misiniz?',
        }),
        payOnly: 'Sadece \u00F6de',
        approveOnly: 'Yaln\u0131zca onayla',
        holdEducationalTitle: 'Bu istek \u00FCzerinde',
        holdEducationalText: 'tut',
        whatIsHoldExplain: 'Tutma, onay veya \u00F6deme \u00F6ncesinde daha fazla detay istemek i\u00E7in bir harcamaya "duraklatma" tu\u015Funa basmak gibidir.',
        holdIsLeftBehind: 'Onaylanan t\u00FCm bir rapor bile olsa tutulan masraflar geride b\u0131rak\u0131l\u0131r.',
        unholdWhenReady: 'Onaylamaya veya \u00F6demeye haz\u0131r oldu\u011Funuzda masraflar\u0131 serbest b\u0131rak\u0131n.',
        set: "Bu bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki neyi temsil ettiklerini a\u00E7\u0131klar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        changed: 'de\u011Fi\u015Ftirildi',
        removed: 'kald\u0131r\u0131ld\u0131',
        transactionPending: '\u0130\u015Flem bekliyor.',
        chooseARate: 'Bir i\u015F alan\u0131 kilometre ba\u015F\u0131na geri \u00F6deme oran\u0131 se\u00E7in',
        unapprove: 'Onay\u0131 Kald\u0131r',
        unapproveReport: 'Raporu onaylama',
        headsUp: 'Dikkat!',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `Bu rapor zaten ${accountingIntegration} 'a aktar\u0131ld\u0131. Expensify'deki bu raporda yap\u0131lan de\u011Fi\u015Fiklikler, veri tutars\u0131zl\u0131klar\u0131na ve Expensify Card mutabakat sorunlar\u0131na yol a\u00E7abilir. Bu raporu onay\u0131n\u0131 kald\u0131rmak istedi\u011Finizden emin misiniz?`,
        reimbursable: 'geri \u00F6denebilir',
        nonReimbursable: 'geri \u00F6demesiz',
        bookingPending: 'Bu rezervasyon beklemede',
        bookingPendingDescription: 'Bu rezervasyon, hen\u00FCz \u00F6denmedi\u011Fi i\u00E7in beklemede.',
        bookingArchived: 'Bu rezervasyon ar\u015Fivlendi',
        bookingArchivedDescription: 'Bu rezervasyon, seyahat tarihi ge\u00E7ti\u011Fi i\u00E7in ar\u015Fivlendi. Gerekirse son miktar i\u00E7in bir gider ekleyin.',
        attendees: 'Kat\u0131l\u0131mc\u0131lar',
        paymentComplete: '\u00D6deme tamamland\u0131',
        time: 'Zaman',
        startDate: 'Ba\u015Flang\u0131\u00E7 tarihi',
        endDate: 'Biti\u015F tarihi',
        startTime: 'Ba\u015Flang\u0131\u00E7 zaman\u0131',
        endTime: 'Biti\u015F zaman\u0131',
        deleteSubrate: 'Alt oran\u0131 sil',
        deleteSubrateConfirmation: 'Bu alt oran\u0131 silmek istedi\u011Finizden emin misiniz?',
        quantity: 'Miktar',
        subrateSelection: 'Bir alt oran se\u00E7in ve bir miktar girin.',
        qty: 'Miktar',
        firstDayText: () => ({
            one: `First day: 1 hour`,
            other: (count: number) => `\u0130lk g\u00FCn: ${count.toFixed(2)} saat`,
        }),
        lastDayText: () => ({
            one: `Last day: 1 hour`,
            other: (count: number) => `Son g\u00FCn: ${count.toFixed(2)} saat`,
        }),
        tripLengthText: () => ({
            one: `Trip: 1 full day`,
            other: (count: number) => `Gezi: ${count} tam g\u00FCn`,
        }),
        dates: 'Tarihler',
        rates: 'Oranlar',
        submitsTo: ({name}: SubmitsToParams) => `Submits to ${name}`,
    },
    notificationPreferencesPage: {
        header: 'Bildirim tercihleri',
        label: 'Yeni mesajlar hakk\u0131nda beni bilgilendir',
        notificationPreferences: {
            always: 'Hemen',
            daily: 'G\u00FCnl\u00FCk',
            mute: 'Sessize Al',
            hidden: "Bu bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        },
    },
    loginField: {
        numberHasNotBeenValidated:
            'Numara do\u011Frulanmam\u0131\u015F. Do\u011Frulama ba\u011Flant\u0131s\u0131n\u0131 metin olarak yeniden g\u00F6ndermek i\u00E7in d\u00FC\u011Fmeye t\u0131klay\u0131n.',
        emailHasNotBeenValidated:
            'E-posta do\u011Frulanmam\u0131\u015F. Do\u011Frulama ba\u011Flant\u0131s\u0131n\u0131 metin olarak yeniden g\u00F6ndermek i\u00E7in d\u00FC\u011Fmeye t\u0131klay\u0131n.',
    },
    avatarWithImagePicker: {
        uploadPhoto: 'Foto\u011Fraf y\u00FCkle',
        removePhoto: 'Foto\u011Fraf\u0131 kald\u0131r',
        editImage: 'Foto\u011Fraf\u0131 d\u00FCzenle',
        viewPhoto: 'Foto\u011Fraf\u0131 g\u00F6r\u00FCnt\u00FCle',
        imageUploadFailed: 'G\u00F6rsel y\u00FCkleme ba\u015Far\u0131s\u0131z oldu',
        deleteWorkspaceError: '\u00DCzg\u00FCn\u00FCz, \u00E7al\u0131\u015Fma alan\u0131 avatar\u0131n\u0131z\u0131 silerken beklenmedik bir sorun olu\u015Ftu.',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `Se\u00E7ilen resim, maksimum y\u00FCkleme boyutu olan ${maxUploadSizeInMB} MB'\u0131 a\u015F\u0131yor.`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `L\u00FCtfen ${minHeightInPx}x${minWidthInPx} pikselden daha b\u00FCy\u00FCk ve ${maxHeightInPx}x${maxWidthInPx} pikselden daha k\u00FC\u00E7\u00FCk bir resim y\u00FCkleyin.`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) =>
            `Profil resmi a\u015Fa\u011F\u0131daki t\u00FCrlerden biri olmal\u0131d\u0131r: ${allowedExtensions.join(', ')}.`,
    },
    profilePage: {
        profile: 'Profil',
        preferredPronouns: 'Tercih edilen zamirler',
        selectYourPronouns: 'Pronounlar\u0131n\u0131z\u0131 se\u00E7in',
        selfSelectYourPronoun: 'Kendi zamirinizi se\u00E7in',
        emailAddress: 'E-posta adresi',
        setMyTimezoneAutomatically: 'Otomatik olarak saat dilimimi ayarla',
        timezone: 'Saat dilimi',
        invalidFileMessage: 'Ge\u00E7ersiz dosya. L\u00FCtfen farkl\u0131 bir resim deneyin.',
        avatarUploadFailureMessage: 'Avatar y\u00FCklenirken bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin.',
        online: '\u00C7evrimi\u00E7i',
        offline: '\u00C7evrimd\u0131\u015F\u0131',
        syncing: 'Senkronize ediliyor',
        profileAvatar: 'Profil avatar\u0131',
        publicSection: {
            title: 'Genel',
            subtitle: 'Bu detaylar halka a\u00E7\u0131k profilinizde g\u00F6r\u00FCnt\u00FClenir. Herkes onlar\u0131 g\u00F6rebilir.',
        },
        privateSection: {
            title: '\u00D6zel',
            subtitle: 'Bu detaylar seyahat ve \u00F6demeler i\u00E7in kullan\u0131l\u0131r. Hi\u00E7bir zaman halka a\u00E7\u0131k profilinizde g\u00F6sterilmezler.',
        },
    },
    securityPage: {
        title: 'G\u00FCvenlik se\u00E7enekleri',
        subtitle: 'Hesab\u0131n\u0131z\u0131 g\u00FCvende tutmak i\u00E7in iki fakt\u00F6rl\u00FC kimlik do\u011Frulamay\u0131 etkinle\u015Ftirin.',
    },
    shareCodePage: {
        title: 'Senin kodun',
        subtitle: "Ki\u015Fisel QR kodunuzu veya referans linkinizi payla\u015Farak \u00FCyeleri Expensify'ye davet edin.",
    },
    pronounsPage: {
        pronouns: 'Zamirler',
        isShownOnProfile: 'Zamirleriniz profilinizde g\u00F6sterilir.',
        placeholderText: 'Se\u00E7enekleri g\u00F6rmek i\u00E7in arama yap\u0131n',
    },
    contacts: {
        contactMethod: '\u0130leti\u015Fim y\u00F6ntemi',
        contactMethods: '\u0130leti\u015Fim y\u00F6ntemleri',
        featureRequiresValidate: 'Bu \u00F6zellik, hesab\u0131n\u0131z\u0131 do\u011Frulaman\u0131z\u0131 gerektirir.',
        validateAccount: 'Hesab\u0131n\u0131z\u0131 do\u011Frulay\u0131n',
        helpTextBeforeEmail: '\u0130nsanlar\u0131n sizi bulabilmesi i\u00E7in daha fazla yol ekleyin ve fi\u015Fleri ${username} adresine y\u00F6nlendirin.',
        helpTextAfterEmail: 'birden \u00E7ok e-posta adresinden.',
        pleaseVerify: 'L\u00FCtfen bu ileti\u015Fim y\u00F6ntemini do\u011Frulay\u0131n',
        getInTouch: 'Sizinle ileti\u015Fime ge\u00E7memiz gerekti\u011Finde, bu ileti\u015Fim y\u00F6ntemini kullanaca\u011F\u0131z.',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `L\u00FCtfen ${contactMethod} 'a g\u00F6nderilen sihirli kodu girin. Bir veya iki dakika i\u00E7inde gelmelidir.`,
        setAsDefault: 'Varsay\u0131lan olarak ayarla',
        yourDefaultContactMethod:
            'Bu, mevcut varsay\u0131lan ileti\u015Fim y\u00F6nteminizdir. Silebilmeniz i\u00E7in, ba\u015Fka bir ileti\u015Fim y\u00F6ntemi se\u00E7meniz ve "Varsay\u0131lan olarak ayarla" se\u00E7ene\u011Fine t\u0131klaman\u0131z gerekmektedir.',
        removeContactMethod: '\u0130leti\u015Fim y\u00F6ntemini kald\u0131r',
        removeAreYouSure: 'Bu ileti\u015Fim y\u00F6ntemini kald\u0131rmak istedi\u011Finizden emin misiniz? Bu i\u015Flem geri al\u0131namaz.',
        failedNewContact: 'Bu ileti\u015Fim y\u00F6ntemi eklenemedi.',
        genericFailureMessages: {
            requestContactMethodValidateCode: 'Yeni bir sihirli kod g\u00F6nderme ba\u015Far\u0131s\u0131z oldu. L\u00FCtfen biraz bekleyin ve tekrar deneyin.',
            validateSecondaryLogin: 'Hatal\u0131 veya ge\u00E7ersiz sihirli kod. L\u00FCtfen tekrar deneyin veya yeni bir kod talep edin.',
            deleteContactMethod: '\u0130leti\u015Fim y\u00F6ntemi silinemedi. L\u00FCtfen yard\u0131m i\u00E7in Concierge ile ileti\u015Fime ge\u00E7in.',
            setDefaultContactMethod:
                'Yeni bir varsay\u0131lan ileti\u015Fim y\u00F6ntemi belirleme ba\u015Far\u0131s\u0131z oldu. L\u00FCtfen yard\u0131m i\u00E7in Concierge ile ileti\u015Fime ge\u00E7in.',
            addContactMethod: 'Bu ileti\u015Fim y\u00F6ntemini eklemek ba\u015Far\u0131s\u0131z oldu. L\u00FCtfen yard\u0131m i\u00E7in Concierge ile ileti\u015Fime ge\u00E7in.',
            enteredMethodIsAlreadySubmited: 'Bu ileti\u015Fim y\u00F6ntemi zaten var.',
            passwordRequired: '\u015Fifre gereklidir.',
            contactMethodRequired: '\u0130leti\u015Fim y\u00F6ntemi gereklidir.',
            invalidContactMethod: 'Ge\u00E7ersiz ileti\u015Fim y\u00F6ntemi',
        },
        newContactMethod: 'Yeni ileti\u015Fim y\u00F6ntemi',
        goBackContactMethods: '\u0130leti\u015Fim y\u00F6ntemlerine geri d\u00F6n',
    },
    pronouns: {
        coCos: "Sorry, but you didn't provide any text to translate. Please provide the text you want to translate.",
        eEyEmEir:
            "Bu bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki neyi temsil ettiklerini a\u00E7\u0131klar, ancak ternary ifadeler veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        faeFaer: 'Fae / Faer',
        heHimHis: 'O / Onun / Onunki',
        heHimHisTheyThemTheirs: 'O / Onun / Onun / Onlar / Onlar\u0131 / Onlar\u0131n',
        sheHerHers: 'O / Onun / Onunki',
        sheHerHersTheyThemTheirs: 'O / Onun / Onunki / Onlar / Onlar\u0131 / Onlar\u0131n',
        merMers: "You didn't provide any text to translate. Please provide the text or TypeScript function that you want to be translated.",
        neNirNirs: 'O / Onun / Onunlar',
        neeNerNers: "Sorry, but you didn't provide any text to translate.",
        perPers: "You didn't provide any text to translate. Please provide the text you want to be translated.",
        theyThemTheirs: 'Onlar / Onlar\u0131 / Onlar\u0131n',
        thonThons: 'Sorry, but your request is not clear. Could you please provide a complete sentence or paragraph that needs to be translated?',
        veVerVis: 'Your request is not clear. Could you please provide the text or TypeScript function that you want to be translated?',
        viVir: 'Sorry, there seems to be a misunderstanding. Could you please provide the text that needs to be translated?',
        xeXemXyr:
            "Bu bir d\u00FCz metin veya bir TypeScript fonksiyonu olabilir ve bir \u015Fablon dizesi d\u00F6nd\u00FCr\u00FCr. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 koruyun ve i\u00E7eriklerini de\u011Fi\u015Ftirmeyin veya parantezleri kald\u0131rmay\u0131n. Yer tutucular\u0131n i\u00E7erikleri, ifadede neyi temsil ettiklerini tan\u0131mlar, ancak ternary ifadeler veya ba\u015Fka TypeScript kodu i\u00E7erebilir.",
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: 'Beni ismimle \u00E7a\u011F\u0131r',
    },
    displayNamePage: {
        headerTitle: 'G\u00F6r\u00FCnen isim',
        isShownOnProfile: 'Profilinizde g\u00F6sterilen ad\u0131n\u0131z.',
    },
    timezonePage: {
        timezone: 'Saat dilimi',
        isShownOnProfile: 'Zaman diliminiz profilinizde g\u00F6sterilir.',
        getLocationAutomatically: 'Konumunuzu otomatik olarak belirleyin',
    },
    updateRequiredView: {
        updateRequired: 'G\u00FCncelleme gereklidir',
        pleaseInstall: "L\u00FCtfen New Expensify'nin en son s\u00FCr\u00FCm\u00FCne g\u00FCncelleyin.",
        pleaseInstallExpensifyClassic: "L\u00FCtfen Expensify'nin en son s\u00FCr\u00FCm\u00FCn\u00FC y\u00FCkleyin.",
        toGetLatestChanges: 'Mobil veya masa\u00FCst\u00FC i\u00E7in, en son s\u00FCr\u00FCm\u00FC indirin ve y\u00FCkleyin. Web i\u00E7in, taray\u0131c\u0131n\u0131z\u0131 yenileyin.',
        newAppNotAvailable: 'Yeni Expensify uygulamas\u0131 art\u0131k mevcut de\u011Fil.',
    },
    initialSettingsPage: {
        about: 'Hakk\u0131nda',
        aboutPage: {
            description:
                "Yeni Expensify Uygulamas\u0131, d\u00FCnya \u00E7ap\u0131nda a\u00E7\u0131k kaynakl\u0131 geli\u015Ftiricilerin toplulu\u011Fu taraf\u0131ndan in\u015Fa edilmi\u015Ftir. Expensify'nin gelece\u011Fini in\u015Fa etmemize yard\u0131mc\u0131 olun.",
            appDownloadLinks: 'Uygulama indirme ba\u011Flant\u0131lar\u0131',
            viewKeyboardShortcuts: 'Klavye k\u0131sayollar\u0131n\u0131 g\u00F6r\u00FCnt\u00FCle',
            viewTheCode: 'Kodu g\u00F6r\u00FCnt\u00FCleyin',
            viewOpenJobs: 'A\u00E7\u0131k i\u015F ilanlar\u0131n\u0131 g\u00F6r\u00FCnt\u00FCleyin',
            reportABug: 'Bir hata bildirin',
            troubleshoot: 'Hata Ay\u0131klama',
        },
        appDownloadLinks: {
            android: {
                label: 'Your request is not clear. Please provide the text or TypeScript function that you want to translate into Turkish.',
            },
            ios: {
                label: 'iOS',
            },
            desktop: {
                label: 'macOS',
            },
        },
        troubleshoot: {
            clearCacheAndRestart: '\u00D6nbelle\u011Fi temizle ve yeniden ba\u015Flat',
            viewConsole: 'Hata ay\u0131klama konsolunu g\u00F6r\u00FCnt\u00FCle',
            debugConsole: 'Hata ay\u0131klama konsolu',
            description:
                'A\u015Fa\u011F\u0131daki ara\u00E7lar\u0131, Expensify deneyimini sorun gidermeye yard\u0131mc\u0131 olmak i\u00E7in kullan\u0131n. Herhangi bir sorunla kar\u015F\u0131la\u015F\u0131rsan\u0131z, l\u00FCtfen',
            submitBug: 'bir hata g\u00F6nder',
            confirmResetDescription: 'G\u00F6nderilmemi\u015F t\u00FCm taslak mesajlar kaybolacak, ancak di\u011Fer t\u00FCm verileriniz g\u00FCvende.',
            resetAndRefresh: 'S\u0131f\u0131rla ve yenile',
            clientSideLogging: '\u0130stemci taraf\u0131 g\u00FCnl\u00FC\u011F\u00FC',
            noLogsToShare: 'Payla\u015F\u0131lacak g\u00FCnl\u00FCk kay\u0131t yok',
            useProfiling: 'Profillemeyi kullan\u0131n',
            profileTrace: 'Profil izi',
            releaseOptions: 'Yay\u0131n se\u00E7enekleri',
            testingPreferences: 'Tercihleri test etme',
            useStagingServer: 'Staging Sunucusunu Kullan\u0131n',
            forceOffline: '\u00C7evrimd\u0131\u015F\u0131 yap',
            simulatePoorConnection: 'Zay\u0131f internet ba\u011Flant\u0131s\u0131n\u0131 sim\u00FCle et',
            simulatFailingNetworkRequests: 'A\u011F isteklerinin ba\u015Far\u0131s\u0131z olmas\u0131n\u0131 sim\u00FCle et',
            authenticationStatus: 'Kimlik Do\u011Frulama Durumu',
            deviceCredentials: 'Cihaz kimlik bilgileri',
            invalidate: 'Ge\u00E7ersiz K\u0131l',
            destroy: 'Yok et',
            maskExportOnyxStateData: 'Onyx durumunu d\u0131\u015Fa aktar\u0131rken hassas \u00FCye verilerini maskele',
            exportOnyxState: 'Onyx durumunu d\u0131\u015Fa aktar',
            importOnyxState: 'Onyx durumunu i\u00E7e aktar',
            testCrash: 'Test \u00E7\u00F6kmesi',
            resetToOriginalState: 'Orijinal durumuna s\u0131f\u0131rla',
            usingImportedState: '\u0130\u00E7e aktar\u0131lan durumu kullan\u0131yorsunuz. Temizlemek i\u00E7in buraya bas\u0131n.',
            debugMode: 'Hata ay\u0131klama modu',
            invalidFile: 'Ge\u00E7ersiz dosya',
            invalidFileDescription: '\u0130\u00E7e aktarmaya \u00E7al\u0131\u015Ft\u0131\u011F\u0131n\u0131z dosya ge\u00E7erli de\u011Fil. L\u00FCtfen tekrar deneyin.',
            invalidateWithDelay: 'Gecikmeyle ge\u00E7ersiz k\u0131l',
        },
        debugConsole: {
            saveLog: "Log'u kaydet",
            shareLog: "Log'u payla\u015F",
            enterCommand: 'Komut girin',
            execute: 'Y\u00FCr\u00FCt',
            noLogsAvailable: 'Kullan\u0131labilir g\u00FCnl\u00FCk kay\u0131t yok',
            logSizeTooLarge: ({size}: LogSizeParams) =>
                `Log boyutu ${size} MB limitini a\u015F\u0131yor. L\u00FCtfen log dosyas\u0131n\u0131 indirmek i\u00E7in "Log'u Kaydet" se\u00E7ene\u011Fini kullan\u0131n.`,
            logs: 'Kay\u0131tlar',
            viewConsole: 'Konsolu g\u00F6r\u00FCnt\u00FCle',
        },
        security: 'G\u00FCvenlik',
        signOut: 'Oturumu kapat',
        restoreStashed: 'Saklanan giri\u015Fi geri y\u00FCkle',
        signOutConfirmationText: '\u00C7\u0131k\u0131\u015F yaparsan\u0131z t\u00FCm \u00E7evrimd\u0131\u015F\u0131 de\u011Fi\u015Fikliklerinizi kaybedersiniz.',
        versionLetter: "You didn't provide any text to translate. Please provide the text you want to be translated.",
        readTheTermsAndPrivacy: {
            phrase1: 'Yaz\u0131y\u0131 okuyun',
            phrase2: 'Hizmet \u015Eartlar\u0131',
            phrase3: 've',
            phrase4: 'Gizlilik',
        },
        help: "Sorry, but you haven't provided any text to translate. Please provide the text you want to translate.",
        accountSettings: 'Hesap ayarlar\u0131',
        account: 'Hesap',
        general: 'The provided text does not include any content that needs to be translated. Please provide the text or TypeScript function that you want to be translated.',
    },
    closeAccountPage: {
        closeAccount: 'Hesab\u0131 kapat',
        reasonForLeavingPrompt: 'Gitmenizi g\u00F6rmek istemezdik! Nazik\u00E7e nedenini bize s\u00F6yler misiniz, b\u00F6ylece geli\u015Ftirebiliriz?',
        enterMessageHere: "You didn't provide any text to translate. Please provide the text you want translated.",
        closeAccountWarning: 'Hesab\u0131n\u0131z\u0131 kapatma i\u015Flemi geri al\u0131namaz.',
        closeAccountPermanentlyDeleteData: 'Hesab\u0131n\u0131z\u0131 silmek istedi\u011Finize emin misiniz? Bu, t\u00FCm bekleyen giderlerinizi kal\u0131c\u0131 olarak silecektir.',
        enterDefaultContactToConfirm:
            'Hesab\u0131n\u0131z\u0131 kapatmak istedi\u011Finizi onaylamak i\u00E7in l\u00FCtfen varsay\u0131lan ileti\u015Fim y\u00F6nteminizi girin. Varsay\u0131lan ileti\u015Fim y\u00F6nteminiz:',
        enterDefaultContact: 'Varsay\u0131lan ileti\u015Fim y\u00F6nteminizi girin',
        defaultContact: 'Varsay\u0131lan ileti\u015Fim y\u00F6ntemi:',
        enterYourDefaultContactMethod: 'L\u00FCtfen hesab\u0131n\u0131z\u0131 kapatmak i\u00E7in varsay\u0131lan ileti\u015Fim y\u00F6nteminizi girin.',
    },
    passwordPage: {
        changePassword: '\u015Eifre de\u011Fi\u015Ftir',
        changingYourPasswordPrompt: '\u015Eifrenizi de\u011Fi\u015Ftirmek, hem Expensify.com hem de Yeni Expensify hesaplar\u0131n\u0131z\u0131n \u015Fifresini g\u00FCncelleyecektir.',
        currentPassword: 'Mevcut \u015Fifre',
        newPassword: 'Yeni \u015Fifre',
        newPasswordPrompt:
            'Yeni \u015Fifreniz, eski \u015Fifrenizden farkl\u0131 olmal\u0131 ve en az 8 karakter, 1 b\u00FCy\u00FCk harf, 1 k\u00FC\u00E7\u00FCk harf ve 1 numara i\u00E7ermelidir.',
    },
    twoFactorAuth: {
        headerTitle: '\u0130ki fakt\u00F6rl\u00FC kimlik do\u011Frulama',
        twoFactorAuthEnabled: '\u0130ki fakt\u00F6rl\u00FC kimlik do\u011Frulama etkinle\u015Ftirildi',
        whatIsTwoFactorAuth:
            '\u0130ki fakt\u00F6rl\u00FC kimlik do\u011Frulama (2FA), hesab\u0131n\u0131z\u0131n g\u00FCvende kalmas\u0131na yard\u0131mc\u0131 olur. Oturum a\u00E7arken, tercih etti\u011Finiz kimlik do\u011Frulama uygulamas\u0131 taraf\u0131ndan olu\u015Fturulan bir kodu girmeniz gerekecektir.',
        disableTwoFactorAuth: '\u0130ki fakt\u00F6rl\u00FC kimlik do\u011Frulamay\u0131 devre d\u0131\u015F\u0131 b\u0131rak',
        explainProcessToRemove:
            '\u0130ki fakt\u00F6rl\u00FC kimlik do\u011Frulamay\u0131 (2FA) devre d\u0131\u015F\u0131 b\u0131rakmak i\u00E7in, l\u00FCtfen kimlik do\u011Frulama uygulaman\u0131zdan ge\u00E7erli bir kod girin.',
        disabled: '\u0130ki fakt\u00F6rl\u00FC kimlik do\u011Frulama art\u0131k devre d\u0131\u015F\u0131',
        noAuthenticatorApp: "Art\u0131k Expensify'ye giri\u015F yapmak i\u00E7in bir do\u011Frulay\u0131c\u0131 uygulamaya ihtiyac\u0131n\u0131z olmayacak.",
        stepCodes: 'Kurtarma kodlar\u0131',
        keepCodesSafe: 'Bu kurtarma kodlar\u0131n\u0131 g\u00FCvende tutun!',
        codesLoseAccess:
            'E\u011Fer kimlik do\u011Frulay\u0131c\u0131 uygulaman\u0131za eri\u015Fimi kaybederseniz ve bu kodlara sahip de\u011Filseniz, hesab\u0131n\u0131za eri\u015Fimi kaybedersiniz.\n\nNot: \u0130ki fakt\u00F6rl\u00FC kimlik do\u011Frulamay\u0131 ayarlamak, sizi di\u011Fer t\u00FCm aktif oturumlardan \u00E7\u0131k\u0131\u015F yapar.',
        errorStepCodes: 'L\u00FCtfen devam etmeden \u00F6nce kodlar\u0131 kopyalay\u0131n veya indirin.',
        stepVerify: 'Do\u011Frula',
        scanCode: 'QR kodunu kullanarak taray\u0131n ${username}',
        authenticatorApp: 'do\u011Frulama uygulamas\u0131',
        addKey: 'Veya bu gizli anahtar\u0131 do\u011Frulay\u0131c\u0131 uygulaman\u0131za ekleyin:',
        enterCode: 'Ard\u0131ndan, kimlik do\u011Frulama uygulaman\u0131zdan olu\u015Fturulan alt\u0131 haneli kodu girin.',
        stepSuccess: 'Bitmi\u015F',
        enabled: '\u0130ki fakt\u00F6rl\u00FC kimlik do\u011Frulama etkinle\u015Ftirildi',
        congrats: 'Tebrikler! Art\u0131k ekstra g\u00FCvenli\u011Fe sahipsiniz.',
        copy: 'Kopyala',
        disable: 'Devre D\u0131\u015F\u0131 B\u0131rak',
        enableTwoFactorAuth: '\u0130ki fakt\u00F6rl\u00FC kimlik do\u011Frulamay\u0131 etkinle\u015Ftir',
        pleaseEnableTwoFactorAuth: 'L\u00FCtfen iki fakt\u00F6rl\u00FC kimlik do\u011Frulamay\u0131 etkinle\u015Ftirin.',
        twoFactorAuthIsRequiredDescription:
            "G\u00FCvenlik ama\u00E7lar\u0131 i\u00E7in, Xero'nun entegrasyonu ba\u011Flamak i\u00E7in iki fakt\u00F6rl\u00FC kimlik do\u011Frulamas\u0131 gereklidir.",
        twoFactorAuthIsRequiredForAdminsDescription:
            'Xero \u00E7al\u0131\u015Fma alan\u0131 y\u00F6neticileri i\u00E7in iki fakt\u00F6rl\u00FC kimlik do\u011Frulama gereklidir. L\u00FCtfen devam etmek i\u00E7in iki fakt\u00F6rl\u00FC kimlik do\u011Frulamay\u0131 etkinle\u015Ftirin.',
        twoFactorAuthCannotDisable: '2FA devre d\u0131\u015F\u0131 b\u0131rak\u0131lam\u0131yor',
        twoFactorAuthRequired:
            '\u0130ki fakt\u00F6rl\u00FC kimlik do\u011Frulama (2FA) Xero ba\u011Flant\u0131n\u0131z i\u00E7in gereklidir ve devre d\u0131\u015F\u0131 b\u0131rak\u0131lamaz.',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: 'L\u00FCtfen kurtarma kodunuzu girin.',
            incorrectRecoveryCode: 'Yanl\u0131\u015F kurtarma kodu. L\u00FCtfen tekrar deneyin.',
        },
        useRecoveryCode: 'Kurtarma kodunu kullan',
        recoveryCode: 'Kurtarma kodu',
        use2fa: '\u0130ki fakt\u00F6rl\u00FC kimlik do\u011Frulama kodunu kullan\u0131n',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: 'L\u00FCtfen iki fakt\u00F6rl\u00FC kimlik do\u011Frulama kodunuzu girin.',
            incorrect2fa: 'Yanl\u0131\u015F iki fakt\u00F6rl\u00FC kimlik do\u011Frulama kodu. L\u00FCtfen tekrar deneyin.',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: '\u015Eifre g\u00FCncellendi!',
        allSet: 'Her \u015Fey tamam. Yeni \u015Fifrenizi g\u00FCvende tutun.',
    },
    privateNotes: {
        title: '\u00D6zel notlar',
        personalNoteMessage:
            'Bu sohbet hakk\u0131nda notlar\u0131n\u0131z\u0131 burada tutun. Bu notlar\u0131 ekleyebilen, d\u00FCzenleyebilen veya g\u00F6r\u00FCnt\u00FCleyebilen tek ki\u015Fi sizsiniz.',
        sharedNoteMessage:
            'Bu sohbet hakk\u0131nda notlar\u0131 burada tutun. Expensify \u00E7al\u0131\u015Fanlar\u0131 ve team.expensify.com alan\u0131ndaki di\u011Fer \u00FCyeler bu notlar\u0131 g\u00F6r\u00FCnt\u00FCleyebilir.',
        composerLabel: 'Notlar',
        myNote: 'Benim notum',
        error: {
            genericFailureMessage: '\u00D6zel notlar kaydedilemedi.',
        },
    },
    billingCurrency: {
        error: {
            securityCode: 'L\u00FCtfen ge\u00E7erli bir g\u00FCvenlik kodu girin.',
        },
        securityCode: 'G\u00FCvenlik kodu',
        changeBillingCurrency: 'Fatura para birimini de\u011Fi\u015Ftirin',
        changePaymentCurrency: '\u00D6deme para birimini de\u011Fi\u015Ftir',
        paymentCurrency: '\u00D6deme para birimi',
        note: "Not: \u00D6deme para biriminizi de\u011Fi\u015Ftirmek, Expensify i\u00E7in ne kadar \u00F6deyece\u011Finizi etkileyebilir. L\u00FCtfen referans almak i\u00E7in bizim ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} vb. yer tutucular\u0131n\u0131 i\u00E7eri\u011Fini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7eri\u011Fi, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        noteLink: 'fiyatland\u0131rma sayfas\u0131',
        noteDetails: 'tam detaylar i\u00E7in.',
    },
    addDebitCardPage: {
        addADebitCard: 'Bir banka kart\u0131 ekleyin',
        nameOnCard: 'Kart \u00FCzerindeki isim',
        debitCardNumber: 'Banka kart\u0131 numaras\u0131',
        expiration: 'Son kullanma tarihi',
        expirationDate: "You didn't provide any text to translate. Please provide the text you want to be translated.",
        cvv: 'CVV',
        billingAddress: 'Fatura adresi',
        growlMessageOnSave: 'Debit kart\u0131n\u0131z ba\u015Far\u0131yla eklendi',
        expensifyPassword: 'Expensify \u015Fifresi',
        error: {
            invalidName: '\u0130sim yaln\u0131zca harfleri i\u00E7erebilir.',
            addressZipCode: 'L\u00FCtfen ge\u00E7erli bir posta kodu girin.',
            debitCardNumber: 'L\u00FCtfen ge\u00E7erli bir banka kart\u0131 numaras\u0131 girin.',
            expirationDate: 'L\u00FCtfen ge\u00E7erli bir son kullanma tarihi se\u00E7in.',
            securityCode: 'L\u00FCtfen ge\u00E7erli bir g\u00FCvenlik kodu girin.',
            addressStreet: 'L\u00FCtfen ge\u00E7erli bir fatura adresi girin, bu bir posta kutusu olmamal\u0131.',
            addressState: 'L\u00FCtfen bir eyalet se\u00E7in.',
            addressCity: 'L\u00FCtfen bir \u015Fehir girin.',
            genericFailureMessage: 'Kart\u0131n\u0131z eklenirken bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin.',
            password: 'L\u00FCtfen Expensify \u015Fifrenizi girin.',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '\u00D6deme kart\u0131 ekle',
        nameOnCard: 'Kart \u00FCzerindeki isim',
        paymentCardNumber: 'Kart numaras\u0131',
        expiration: 'Son kullanma tarihi',
        expirationDate: "You didn't provide any text to translate. Please provide the text you want to be translated.",
        cvv: 'CVV',
        billingAddress: 'Fatura adresi',
        growlMessageOnSave: '\u00D6deme kart\u0131n\u0131z ba\u015Far\u0131yla eklendi',
        expensifyPassword: 'Expensify \u015Fifresi',
        error: {
            invalidName: '\u0130sim yaln\u0131zca harfleri i\u00E7erebilir.',
            addressZipCode: 'L\u00FCtfen ge\u00E7erli bir posta kodu girin.',
            paymentCardNumber: 'L\u00FCtfen ge\u00E7erli bir kart numaras\u0131 girin.',
            expirationDate: 'L\u00FCtfen ge\u00E7erli bir son kullanma tarihi se\u00E7in.',
            securityCode: 'L\u00FCtfen ge\u00E7erli bir g\u00FCvenlik kodu girin.',
            addressStreet: 'L\u00FCtfen ge\u00E7erli bir fatura adresi girin, bu bir posta kutusu olmamal\u0131.',
            addressState: 'L\u00FCtfen bir eyalet se\u00E7in.',
            addressCity: 'L\u00FCtfen bir \u015Fehir girin.',
            genericFailureMessage: 'Kart\u0131n\u0131z eklenirken bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin.',
            password: 'L\u00FCtfen Expensify \u015Fifrenizi girin.',
        },
    },
    walletPage: {
        balance: 'Denge',
        paymentMethodsTitle: '\u00D6deme y\u00F6ntemleri',
        setDefaultConfirmation: '\u00D6deme y\u00F6ntemini varsay\u0131lan yap',
        setDefaultSuccess: 'Varsay\u0131lan \u00F6deme y\u00F6ntemi ayarland\u0131!',
        deleteAccount: 'Hesab\u0131 sil',
        deleteConfirmation: 'Bu hesab\u0131 silmek istedi\u011Finizden emin misiniz?',
        error: {
            notOwnerOfBankAccount: 'Bu banka hesab\u0131n\u0131 varsay\u0131lan \u00F6deme y\u00F6nteminiz olarak ayarlarken bir hata olu\u015Ftu.',
            invalidBankAccount: 'Bu banka hesab\u0131 ge\u00E7ici olarak ask\u0131ya al\u0131nm\u0131\u015Ft\u0131r.',
            notOwnerOfFund: 'Bu kart\u0131 varsay\u0131lan \u00F6deme y\u00F6nteminiz olarak ayarlarken bir hata olu\u015Ftu.',
            setDefaultFailure: 'Bir \u015Feyler yanl\u0131\u015F gitti. L\u00FCtfen daha fazla yard\u0131m i\u00E7in Concierge ile sohbet edin.',
        },
        addBankAccountFailure: 'Banka hesab\u0131n\u0131z\u0131 eklemeye \u00E7al\u0131\u015F\u0131rken beklenmedik bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin.',
        getPaidFaster: 'Daha h\u0131zl\u0131 \u00F6deme al\u0131n',
        addPaymentMethod: 'Uygulama i\u00E7inde do\u011Frudan \u00F6demeler g\u00F6ndermek ve almak i\u00E7in bir \u00F6deme y\u00F6ntemi ekleyin.',
        getPaidBackFaster: 'Daha h\u0131zl\u0131 geri \u00F6deme al\u0131n',
        secureAccessToYourMoney: 'Paran\u0131za g\u00FCvenli eri\u015Fim',
        receiveMoney: 'Yerel para biriminizde para al\u0131n',
        expensifyWallet: 'Expensify C\u00FCzdan (Beta)',
        sendAndReceiveMoney: 'Arkada\u015Flar\u0131n\u0131zla para g\u00F6nderin ve al\u0131n. Sadece ABD banka hesaplar\u0131.',
        enableWallet: 'C\u00FCzdan\u0131 etkinle\u015Ftir',
        addBankAccountToSendAndReceive: 'Bir \u00E7al\u0131\u015Fma alan\u0131na g\u00F6nderdi\u011Finiz giderler i\u00E7in geri \u00F6deme al\u0131n.',
        addBankAccount: 'Banka hesab\u0131 ekle',
        assignedCards: 'Atanan kartlar',
        assignedCardsDescription:
            'Bunlar, \u015Firket harcamalar\u0131n\u0131 y\u00F6netmek i\u00E7in bir \u00E7al\u0131\u015Fma alan\u0131 y\u00F6neticisi taraf\u0131ndan atanm\u0131\u015F kartlard\u0131r.',
        expensifyCard: 'Expensify Kart\u0131',
        walletActivationPending: 'Bilgilerinizi inceliyoruz. L\u00FCtfen birka\u00E7 dakika i\u00E7inde tekrar kontrol edin!',
        walletActivationFailed: 'Maalesef, c\u00FCzdan\u0131n\u0131z \u015Fu anda etkinle\u015Ftirilemiyor. L\u00FCtfen daha fazla yard\u0131m i\u00E7in Concierge ile sohbet edin.',
        addYourBankAccount: 'Banka hesab\u0131n\u0131z\u0131 ekleyin',
        addBankAccountBody:
            "Banka hesab\u0131n\u0131z\u0131 Expensify'ye ba\u011Flayal\u0131m, b\u00F6ylece \u00F6demeleri do\u011Frudan uygulama i\u00E7inde g\u00F6ndermek ve almak her zamankinden daha kolay olur.",
        chooseYourBankAccount: 'Banka hesab\u0131n\u0131z\u0131 se\u00E7in',
        chooseAccountBody: 'Do\u011Fru olan\u0131 se\u00E7ti\u011Finizden emin olun.',
        confirmYourBankAccount: 'Banka hesab\u0131n\u0131z\u0131 onaylay\u0131n',
    },
    cardPage: {
        expensifyCard: 'Expensify Kart\u0131',
        availableSpend: 'Kalan limit',
        smartLimit: {
            name: 'Ak\u0131ll\u0131 limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Bu kartta en fazla ${formattedLimit} harcayabilirsiniz ve g\u00F6nderdi\u011Finiz giderler onayland\u0131k\u00E7a limit s\u0131f\u0131rlanacakt\u0131r.`,
        },
        fixedLimit: {
            name: 'Sabit limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Bu kartta en fazla ${formattedLimit} harcayabilirsiniz, ard\u0131ndan kart devre d\u0131\u015F\u0131 b\u0131rak\u0131lacakt\u0131r.`,
        },
        monthlyLimit: {
            name: 'Ayl\u0131k limit',
            title: ({formattedLimit}: ViolationsOverLimitParams) =>
                `Bu kartla ayda en fazla ${formattedLimit} harcama yapabilirsiniz. Limit her ay\u0131n 1. g\u00FCn\u00FC s\u0131f\u0131rlanacakt\u0131r.`,
        },
        virtualCardNumber: 'Sanal kart numaras\u0131',
        physicalCardNumber: 'Fiziksel kart numaras\u0131',
        getPhysicalCard: 'Fiziksel kart al',
        reportFraud: 'Sanal kart doland\u0131r\u0131c\u0131l\u0131\u011F\u0131n\u0131 bildirin',
        reviewTransaction: '\u0130\u015Flemi incele',
        suspiciousBannerTitle: '\u015E\u00FCpheli i\u015Flem',
        suspiciousBannerDescription: 'Kart\u0131n\u0131zda \u015F\u00FCpheli i\u015Flemler fark ettik. \u0130ncelemek i\u00E7in a\u015Fa\u011F\u0131ya t\u0131klay\u0131n.',
        cardLocked: 'Kart\u0131n\u0131z, ekibimiz \u015Firketinizin hesab\u0131n\u0131 inceledi\u011Fi s\u00FCre boyunca ge\u00E7ici olarak kilitlenmi\u015Ftir.',
        cardDetails: {
            cardNumber: 'Sanal kart numaras\u0131',
            expiration: 'S\u00FCre sonu',
            cvv: 'CVV',
            address: 'Adres',
            revealDetails: 'Detaylar\u0131 g\u00F6ster',
            copyCardNumber: 'Kart numaras\u0131n\u0131 kopyala',
            updateAddress: 'Adresi g\u00FCncelle',
        },
        cardDetailsLoadingFailure: 'Kart detaylar\u0131 y\u00FCklenirken bir hata olu\u015Ftu. L\u00FCtfen internet ba\u011Flant\u0131n\u0131z\u0131 kontrol edin ve tekrar deneyin.',
        validateCardTitle: 'Sen oldu\u011Fundan emin olal\u0131m',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `Kart detaylar\u0131n\u0131z\u0131 g\u00F6r\u00FCnt\u00FClemek i\u00E7in ${contactMethod} 'a g\u00F6nderilen sihirli kodu girin. Bir veya iki dakika i\u00E7inde gelmelidir.`,
    },
    workflowsPage: {
        workflowTitle: 'Harcama',
        workflowDescription: 'Harcama ger\u00E7ekle\u015Fti\u011Fi andan itibaren bir i\u015F ak\u0131\u015F\u0131 yap\u0131land\u0131r\u0131n, onay ve \u00F6deme dahil.',
        delaySubmissionTitle: 'G\u00F6nderimleri geciktir',
        delaySubmissionDescription:
            'Giderlerinizi sunmak i\u00E7in \u00F6zel bir program se\u00E7in veya harcamalar \u00FCzerinde ger\u00E7ek zamanl\u0131 g\u00FCncellemeler i\u00E7in bunu kapal\u0131 b\u0131rak\u0131n.',
        submissionFrequency: 'G\u00F6nderim s\u0131kl\u0131\u011F\u0131',
        submissionFrequencyDateOfMonth: 'Ay\u0131n tarihi',
        addApprovalsTitle: 'Onaylar\u0131 ekle',
        addApprovalButton: 'Onay i\u015F ak\u0131\u015F\u0131 ekle',
        addApprovalTip: 'Bu varsay\u0131lan i\u015F ak\u0131\u015F\u0131, daha spesifik bir i\u015F ak\u0131\u015F\u0131 mevcut olmad\u0131k\u00E7a, t\u00FCm \u00FCyelere uygulan\u0131r.',
        approver: 'Onaylayan',
        connectBankAccount: 'Banka hesab\u0131n\u0131 ba\u011Fla',
        addApprovalsDescription: '\u00D6deme yetkilendirmesi \u00F6ncesinde ek onay gereklidir.',
        makeOrTrackPaymentsTitle: '\u00D6demeleri yap\u0131n veya takip edin',
        makeOrTrackPaymentsDescription:
            "Expensify'de yap\u0131lan \u00F6demeler i\u00E7in yetkili bir \u00F6deyici ekleyin veya sadece ba\u015Fka yerlerde yap\u0131lan \u00F6demeleri takip edin.",
        editor: {
            submissionFrequency: "Expensify'nin hata i\u00E7ermeyen harcamalar\u0131 payla\u015Fmadan \u00F6nce ne kadar beklemesi gerekti\u011Fini se\u00E7in.",
        },
        frequencyDescription: 'Giderlerin otomatik olarak ne s\u0131kl\u0131kla g\u00F6nderilmesini istedi\u011Finizi se\u00E7in veya bunu manuel yap\u0131n',
        frequencies: {
            weekly: 'Haftal\u0131k',
            monthly: 'Ayl\u0131k',
            twiceAMonth: 'Ayda iki kez',
            byTrip: 'Seyahatle',
            manually:
                "Bu ya d\u00FCz bir metin ya da bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi a\u00E7\u0131klar, ancak ternary ifadeler veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
            daily: 'G\u00FCnl\u00FCk',
            lastDayOfMonth: 'Ay\u0131n son g\u00FCn\u00FC',
            lastBusinessDayOfMonth: 'Ay\u0131n son i\u015F g\u00FCn\u00FC',
            ordinals: {
                one: "You didn't provide any text to translate. Please provide the text you want to be translated into Turkish.",
                two: "You didn't provide any text to translate. Please provide the text that you want to be translated.",
                few: 'Your request is incomplete. Please provide the text or TypeScript function that you want to be translated.',
                other: "You didn't provide any text to translate. Please provide the text you want to translate.",
                /* eslint-disable @typescript-eslint/naming-convention */
                "Since there's no text provided for translation, I'm unable to provide a translation. Please provide the text you want translated.":
                    '\u00D6ncelikle, belirtmek gerekir ki bu bir \u00E7eviri talebi de\u011Fil, bir y\u00F6nergedir. Ancak, a\u015Fa\u011F\u0131da bir \u00F6rnek \u00E7eviri sunulmu\u015Ftur:\n\n\u00D6rne\u011Fin, "Hello ${username}, you have ${count} new messages." ifadesi T\u00FCrk\u00E7eye "Merhaba ${username}, ${count} yeni mesaj\u0131n\u0131z var." \u015Feklinde \u00E7evrilebilir.\n\nAyr\u0131ca, "${someBoolean ? \'valueIfTrue\' : \'valueIfFalse\'}" ifadesi T\u00FCrk\u00E7eye "${someBoolean ? \'de\u011FerE\u011FerDo\u011Fru\' : \'de\u011FerE\u011FerYanl\u0131\u015F\'}" \u015Feklinde \u00E7evrilebilir. Ancak, bu ifadenin i\u00E7eri\u011Fi de\u011Fi\u015Ftirilmeden veya parantezler \u00E7\u0131kar\u0131lmadan korunmal\u0131d\u0131r. Bu yer tutucular\u0131n i\u00E7erikleri, ifadedeki anlam\u0131 temsil eder, ancak \u00FC\u00E7l\u00FC ifadeler veya ba\u015Fka TypeScript kodu i\u00E7erebilir.',
                'The text to be translated is not provided in the prompt. Please provide the text for translation.': '\u0130kinci',
                'As a language model AI developed by OpenAI, I need the text or TypeScript function that you want me to translate into Turkish. Please provide it so I can assist you.':
                    '\u00DC\u00E7\u00FCnc\u00FC',
                'As a language model AI developed by OpenAI, I need the text or TypeScript function that you want me to translate into Turkish. Please provide the text or TypeScript function.':
                    'D\u00F6rd\u00FCnc\u00FC',
                'Sorry, there is no text provided for translation. Could you please provide the text you want to translate?': 'Be\u015Finci',
                'The text to be translated is not provided in the prompt. Please provide the text for translation.': 'Alt\u0131nc\u0131',
                'Translation task is missing. Please provide the text to be translated.': 'Yedinci',
                'Your request seems to be incomplete. Could you please provide the text or TypeScript function that you would like to be translated?': 'Sekizinci',
                'As a language model AI, I need the text to translate. Please provide the text.': 'Dokuzuncu',
                "You didn't provide any text to translate. Please provide the text or TypeScript function that you want to be translated.": 'Onuncu',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows:
            'Bu \u00FCye zaten ba\u015Fka bir onay i\u015F ak\u0131\u015F\u0131na aittir. Burada yap\u0131lacak herhangi bir g\u00FCncelleme orada da yans\u0131t\u0131lacakt\u0131r.',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> zaten <strong>${name2}</strong>'ye raporlar\u0131 onayl\u0131yor. Dairesel bir i\u015F ak\u0131\u015F\u0131n\u0131 \u00F6nlemek i\u00E7in l\u00FCtfen farkl\u0131 bir onaylay\u0131c\u0131 se\u00E7in.`,
        emptyContent: {
            title: 'G\u00F6sterilecek \u00FCye yok',
            expensesFromSubtitle: 'T\u00FCm \u00E7al\u0131\u015Fma alan\u0131 \u00FCyeleri zaten mevcut bir onay i\u015F ak\u0131\u015F\u0131na aittir.',
            approverSubtitle: 'T\u00FCm onaylay\u0131c\u0131lar mevcut bir i\u015F ak\u0131\u015F\u0131na aittir.',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingErrorMessage: 'Gecikmi\u015F g\u00F6nderim de\u011Fi\u015Ftirilemedi. L\u00FCtfen tekrar deneyin veya destek ile ileti\u015Fime ge\u00E7in.',
        autoReportingFrequencyErrorMessage: 'G\u00F6nderim s\u0131kl\u0131\u011F\u0131 de\u011Fi\u015Ftirilemedi. L\u00FCtfen tekrar deneyin veya destek ile ileti\u015Fime ge\u00E7in.',
        monthlyOffsetErrorMessage: 'Ayl\u0131k frekans de\u011Fi\u015Ftirilemedi. L\u00FCtfen tekrar deneyin veya destek ile ileti\u015Fime ge\u00E7in.',
    },
    workflowsCreateApprovalsPage: {
        title: 'Onayla',
        header: 'Daha fazla onaylay\u0131c\u0131 ekleyin ve onaylay\u0131n.',
        additionalApprover: 'Ek ilave onaylay\u0131c\u0131',
        submitButton: '\u0130\u015F ak\u0131\u015F\u0131 ekle',
    },
    workflowsEditApprovalsPage: {
        title: 'D\u00FCzenleme onay\u0131 i\u015F ak\u0131\u015F\u0131',
        deleteTitle: 'Onay i\u015F ak\u0131\u015F\u0131n\u0131 sil',
        deletePrompt: 'Bu onay ak\u0131\u015F\u0131n\u0131 silmek istedi\u011Finizden emin misiniz? T\u00FCm \u00FCyeler daha sonra varsay\u0131lan ak\u0131\u015F\u0131 takip edecek.',
    },
    workflowsExpensesFromPage: {
        title: 'Harcamalar\u0131ndan',
        header: 'A\u015Fa\u011F\u0131daki \u00FCyeler masraflar\u0131n\u0131 g\u00F6nderdi\u011Finde:',
    },
    workflowsApproverPage: {
        genericErrorMessage: 'Onaylay\u0131c\u0131 de\u011Fi\u015Ftirilemedi. L\u00FCtfen tekrar deneyin veya destek ile ileti\u015Fime ge\u00E7in.',
        header: 'Onay i\u00E7in bu \u00FCyeye g\u00F6nder:',
    },
    workflowsPayerPage: {
        title: 'Yetkili \u00F6deyici',
        genericErrorMessage: 'Yetkili \u00F6deme yapan ki\u015Fi de\u011Fi\u015Ftirilemedi. L\u00FCtfen tekrar deneyin.',
        admins: 'Y\u00F6neticiler',
        payer: '\u00D6der',
        paymentAccount: '\u00D6deme hesab\u0131',
    },
    reportFraudPage: {
        title: 'Sanal kart doland\u0131r\u0131c\u0131l\u0131\u011F\u0131n\u0131 bildirin',
        description:
            'E\u011Fer sanal kart bilgileriniz \u00E7al\u0131nd\u0131ysa veya tehlikeye girdiyse, mevcut kart\u0131n\u0131z\u0131 kal\u0131c\u0131 olarak devre d\u0131\u015F\u0131 b\u0131rak\u0131r ve size yeni bir sanal kart ve numara sa\u011Flar\u0131z.',
        deactivateCard: 'Kart\u0131 devre d\u0131\u015F\u0131 b\u0131rak',
        reportVirtualCardFraud: 'Sanal kart doland\u0131r\u0131c\u0131l\u0131\u011F\u0131n\u0131 bildirin',
    },
    reportFraudConfirmationPage: {
        title: 'Kart doland\u0131r\u0131c\u0131l\u0131\u011F\u0131 bildirildi',
        description:
            'Mevcut kart\u0131n\u0131z\u0131 kal\u0131c\u0131 olarak devre d\u0131\u015F\u0131 b\u0131rakt\u0131k. Kart detaylar\u0131n\u0131za geri d\u00F6nd\u00FC\u011F\u00FCn\u00FCzde, yeni bir sanal kart\u0131n\u0131z olacak.',
        buttonText: "Sorry, but you didn't provide any text to translate.",
    },
    activateCardPage: {
        activateCard: 'Kart\u0131 aktifle\u015Ftir',
        pleaseEnterLastFour: 'L\u00FCtfen kart\u0131n\u0131z\u0131n son d\u00F6rt hanesini giriniz.',
        activatePhysicalCard: 'Fiziksel kart\u0131 aktifle\u015Ftir',
        error: {
            thatDidntMatch: 'Bu, kart\u0131n\u0131zdaki son 4 rakamla e\u015Fle\u015Fmedi. L\u00FCtfen tekrar deneyin.',
            throttled:
                'Expensify Kart\u0131n\u0131z\u0131n son 4 hanesini \u00E7ok fazla kez yanl\u0131\u015F girdiniz. Numaralar\u0131n do\u011Fru oldu\u011Fundan eminseniz, l\u00FCtfen sorunu \u00E7\u00F6zmek i\u00E7in Concierge ile ileti\u015Fime ge\u00E7in. Aksi takdirde, daha sonra tekrar deneyin.',
        },
    },
    getPhysicalCard: {
        header: 'Fiziksel kart al',
        nameMessage: 'Kart\u0131n\u0131zda g\u00F6sterilecek \u015Fekilde ilk ve son ad\u0131n\u0131z\u0131 girin.',
        legalName: 'Yasal isim',
        legalFirstName: 'Yasal ilk isim',
        legalLastName: 'Yasal soyad\u0131',
        phoneMessage: 'Telefon numaran\u0131z\u0131 girin.',
        phoneNumber: 'Telefon numaras\u0131',
        address: 'Adres',
        addressMessage: 'Kargo adresinizi girin.',
        streetAddress: 'Sokak Adresi',
        city: '\u015Eehir',
        state: 'Durum',
        zipPostcode: 'Posta Kodu/Zip Kodu',
        country: '\u00DClke',
        confirmMessage: 'L\u00FCtfen a\u015Fa\u011F\u0131daki detaylar\u0131n\u0131z\u0131 onaylay\u0131n.',
        estimatedDeliveryMessage: 'Fiziksel kart\u0131n\u0131z 2-3 i\u015F g\u00FCn\u00FC i\u00E7inde gelecektir.',
        next: 'Bir sonraki metni g\u00F6nderin.',
        getPhysicalCard: 'Fiziksel kart al',
        shipCard: 'Gemi kart\u0131',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `Transfer${amount ? ` ${amount}` : ''}`,
        instant: 'Anl\u0131k (Banka Kart\u0131)',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% fee (${minAmount} minimum)`,
        ach: '1-3 \u0130\u015F g\u00FCn\u00FC (Banka hesab\u0131)',
        achSummary: '\u00DCcret yok',
        whichAccount: 'Hangi hesap?',
        fee: '\u00DCcret',
        transferSuccess: 'Transfer ba\u015Far\u0131l\u0131!',
        transferDetailBankAccount: 'Paran\u0131z\u0131n gelecek 1-3 i\u015F g\u00FCn\u00FC i\u00E7inde gelmesi gerekiyor.',
        transferDetailDebitCard: 'Paran\u0131z hemen gelmeli.',
        failedTransfer: 'Bakiyeniz tamamen \u00F6denmemi\u015F. L\u00FCtfen bir banka hesab\u0131na aktar\u0131n.',
        notHereSubTitle: 'L\u00FCtfen bakiyenizi c\u00FCzdan sayfas\u0131ndan transfer edin',
        goToWallet: 'C\u00FCzdana Git',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'Hesap Se\u00E7in',
    },
    paymentMethodList: {
        addPaymentMethod: '\u00D6deme y\u00F6ntemi ekle',
        addNewDebitCard: 'Yeni banka kart\u0131 ekle',
        addNewBankAccount: 'Yeni banka hesab\u0131 ekle',
        accountLastFour: 'Sonlan\u0131yor',
        cardLastFour: 'Kart\u0131n son haneleri',
        addFirstPaymentMethod: 'Uygulama i\u00E7inde do\u011Frudan \u00F6demeler g\u00F6ndermek ve almak i\u00E7in bir \u00F6deme y\u00F6ntemi ekleyin.',
        defaultPaymentMethod: 'Varsay\u0131lan',
    },
    preferencesPage: {
        appSection: {
            title: 'Uygulama tercihleri',
        },
        testSection: {
            title: 'Test tercihleri',
            subtitle: 'Uygulaman\u0131n sahneleme \u00FCzerinde hata ay\u0131klama ve test etmeye yard\u0131mc\u0131 olacak ayarlar.',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '\u0130lgili \u00F6zellik g\u00FCncellemelerini ve Expensify haberlerini al\u0131n',
        muteAllSounds: "Expensify'den gelen t\u00FCm sesleri kapat\u0131n",
    },
    priorityModePage: {
        priorityMode: '\u00D6ncelikli mod',
        explainerText:
            'Sadece okunmam\u0131\u015F ve sabitlenmi\u015F sohbetlere odaklanmay\u0131 se\u00E7in ya da en son ve sabitlenmi\u015F sohbetlerin en \u00FCstte oldu\u011Fu her \u015Feyi g\u00F6sterin.',
        priorityModes: {
            default: {
                label: 'En son',
                description: 'En son olanlara g\u00F6re s\u0131ralanm\u0131\u015F t\u00FCm sohbetleri g\u00F6ster',
            },
            gsd: {
                label: "You didn't provide any text to translate. Please provide the text you want to translate.",
                description: 'Yaln\u0131zca okunmam\u0131\u015Flar\u0131 alfabetik s\u0131rayla g\u00F6ster',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `in ${policyName}`,
    },
    reportDescriptionPage: {
        roomDescription: 'Oda a\u00E7\u0131klamas\u0131',
        roomDescriptionOptional: 'Oda a\u00E7\u0131klamas\u0131 (iste\u011Fe ba\u011Fl\u0131)',
        explainerText: 'Odan\u0131z i\u00E7in \u00F6zel bir a\u00E7\u0131klama belirleyin.',
    },
    groupChat: {
        lastMemberTitle: 'Dikkat!',
        lastMemberWarning:
            'Burada kalan son ki\u015Fi siz oldu\u011Funuz i\u00E7in, ayr\u0131lman\u0131z bu sohbeti t\u00FCm \u00FCyelere eri\u015Filemez hale getirecektir. Ger\u00E7ekten ayr\u0131lmak istiyor musunuz?',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `${displayName}'s group chat`,
    },
    languagePage: {
        language: 'Dil',
        languages: {
            en: {
                label: "You didn't provide any text to translate. Please provide the text you want to translate into Turkish.",
            },
            es: {
                label: "You've asked me to translate the text into Turkish, but you've mentioned Spanish in your message. Could you please clarify the language you want the text to be translated into?",
            },
        },
    },
    themePage: {
        theme: 'Tema',
        themes: {
            dark: {
                label: 'Karanl\u0131k',
            },
            light: {
                label: 'I\u015F\u0131k',
            },
            system: {
                label: 'Cihaz ayarlar\u0131n\u0131 kullan',
            },
        },
        chooseThemeBelowOrSync: 'A\u015Fa\u011F\u0131dan bir tema se\u00E7in veya ayg\u0131t ayarlar\u0131n\u0131zla senkronize edin.',
    },
    termsOfUse: {
        phrase1:
            "Giri\u015F yaparak, \u015Fu ko\u015Fullar\u0131 kabul etmi\u015F oluyorsunuz: ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} vb. yer tutucular\u0131n i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeler veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        phrase2: 'Hizmet \u015Eartlar\u0131',
        phrase3: 've',
        phrase4: 'Gizlilik',
        phrase5: `Para aktar\u0131m\u0131, ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} (NMLS ID:2017010) taraf\u0131ndan sa\u011Flanmaktad\u0131r.`,
        phrase6: 'lisanslar',
    },
    validateCodeForm: {
        magicCodeNotReceived: 'Sihirli bir kod almad\u0131n\u0131z m\u0131?',
        enterAuthenticatorCode: 'L\u00FCtfen do\u011Frulay\u0131c\u0131 kodunuzu girin',
        enterRecoveryCode: 'L\u00FCtfen kurtarma kodunuzu girin',
        requiredWhen2FAEnabled: '2FA etkinle\u015Ftirildi\u011Finde gereklidir',
        requestNewCode: 'Yeni bir kod talep et',
        requestNewCodeAfterErrorOccurred: 'Yeni bir kod iste',
        error: {
            pleaseFillMagicCode: 'L\u00FCtfen sihirli kodunuzu girin.',
            incorrectMagicCode: 'Yanl\u0131\u015F sihirli kod.',
            pleaseFillTwoFactorAuth: 'L\u00FCtfen iki fakt\u00F6rl\u00FC kimlik do\u011Frulama kodunuzu girin.',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'L\u00FCtfen t\u00FCm alanlar\u0131 doldurun',
        pleaseFillPassword: 'L\u00FCtfen \u015Fifrenizi girin',
        pleaseFillTwoFactorAuth: 'L\u00FCtfen iki fakt\u00F6rl\u00FC kodunuzu girin',
        enterYourTwoFactorAuthenticationCodeToContinue: 'Devam etmek i\u00E7in iki fakt\u00F6rl\u00FC kimlik do\u011Frulama kodunuzu girin',
        forgot: 'Unuttun mu?',
        requiredWhen2FAEnabled: '2FA etkinle\u015Ftirildi\u011Finde gereklidir',
        error: {
            incorrectPassword: 'Yanl\u0131\u015F \u015Fifre. L\u00FCtfen tekrar deneyin.',
            incorrectLoginOrPassword: 'Yanl\u0131\u015F kullan\u0131c\u0131 ad\u0131 veya \u015Fifre. L\u00FCtfen tekrar deneyin.',
            incorrect2fa: 'Yanl\u0131\u015F iki fakt\u00F6rl\u00FC kimlik do\u011Frulama kodu. L\u00FCtfen tekrar deneyin.',
            twoFactorAuthenticationEnabled: 'Bu hesapta 2FA etkin. L\u00FCtfen e-postan\u0131z\u0131 veya telefon numaran\u0131z\u0131 kullanarak oturum a\u00E7\u0131n.',
            invalidLoginOrPassword: 'Ge\u00E7ersiz giri\u015F veya \u015Fifre. L\u00FCtfen tekrar deneyin veya \u015Fifrenizi s\u0131f\u0131rlay\u0131n.',
            unableToResetPassword:
                '\u015Eifrenizi de\u011Fi\u015Ftiremedik. Bu, muhtemelen eski bir \u015Fifre s\u0131f\u0131rlama e-postas\u0131ndaki s\u00FCresi dolmu\u015F bir \u015Fifre s\u0131f\u0131rlama linkinden kaynaklanmaktad\u0131r. Size yeni bir link g\u00F6nderdik, b\u00F6ylece tekrar deneyebilirsiniz. Gelen Kutunuzu ve Spam klas\u00F6r\u00FCn\u00FCz\u00FC kontrol edin; birka\u00E7 dakika i\u00E7inde gelmesi gerekiyor.',
            noAccess: 'Bu uygulamaya eri\u015Fiminiz yok. Eri\u015Fim i\u00E7in l\u00FCtfen GitHub kullan\u0131c\u0131 ad\u0131n\u0131z\u0131 ekleyin.',
            accountLocked: 'Hesab\u0131n\u0131z \u00E7ok fazla ba\u015Far\u0131s\u0131z deneme sonras\u0131nda kilitlendi. L\u00FCtfen 1 saat sonra tekrar deneyin.',
            fallback: 'Bir \u015Feyler yanl\u0131\u015F gitti. L\u00FCtfen daha sonra tekrar deneyin.',
        },
    },
    loginForm: {
        phoneOrEmail: 'Telefon veya e-posta',
        error: {
            invalidFormatEmailLogin: 'Girilen e-posta ge\u00E7ersiz. L\u00FCtfen format\u0131 d\u00FCzeltin ve tekrar deneyin.',
        },
        cannotGetAccountDetails: 'Hesap detaylar\u0131 al\u0131namad\u0131. L\u00FCtfen tekrar giri\u015F yapmay\u0131 deneyin.',
        loginForm: 'Giri\u015F formu',
        notYou: ({user}: NotYouParams) => `Not ${user}?`,
    },
    onboarding: {
        welcome: 'Ho\u015F geldiniz!',
        welcomeSignOffTitle: 'Seninle tan\u0131\u015Fmak harika!',
        explanationModal: {
            title: "Expensify'ye ho\u015F geldiniz",
            description:
                '\u0130\u015F ve ki\u015Fisel harcamalar\u0131n\u0131z\u0131 sohbet h\u0131z\u0131nda y\u00F6netmek i\u00E7in tek bir uygulama. Deneyin ve ne d\u00FC\u015F\u00FCnd\u00FC\u011F\u00FCn\u00FCz\u00FC bize bildirin. Daha fazlas\u0131 yak\u0131nda!',
            secondaryDescription: "Expensify Classic'a geri d\u00F6nmek i\u00E7in, sadece profil resminize t\u0131klay\u0131n > Expensify Classic'a gidin.",
        },
        welcomeVideo: {
            title: "Expensify'ye ho\u015F geldiniz",
            description:
                'T\u00FCm i\u015F ve ki\u015Fisel harcamalar\u0131n\u0131z\u0131 bir sohbet i\u00E7inde y\u00F6netmek i\u00E7in bir uygulama. \u0130\u015Fletmeniz, ekibiniz ve arkada\u015Flar\u0131n\u0131z i\u00E7in tasarland\u0131.',
        },
        getStarted: 'Ba\u015Fla',
        whatsYourName: 'Ad\u0131n ne?',
        peopleYouMayKnow: 'Tan\u0131yabilece\u011Finiz ki\u015Filer zaten burada! Onlara kat\u0131lmak i\u00E7in e-postan\u0131z\u0131 do\u011Frulay\u0131n.',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `Someone from ${domain} has already created a workspace. Please enter the magic code sent to ${email}.`,
        joinAWorkspace: 'Bir \u00E7al\u0131\u015Fma alan\u0131na kat\u0131l\u0131n',
        listOfWorkspaces:
            '\u0130\u015Fte kat\u0131labilece\u011Finiz \u00E7al\u0131\u015Fma alanlar\u0131n\u0131n listesi. Endi\u015Felenmeyin, isterseniz daha sonra da kat\u0131labilirsiniz.',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} member${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: 'Nerede \u00E7al\u0131\u015F\u0131yorsun?',
        errorSelection: 'L\u00FCtfen devam etmek i\u00E7in bir se\u00E7im yap\u0131n.',
        purpose: {
            title: 'Bug\u00FCn ne yapmak istersin?',
            errorContinue: "L\u00FCtfen kurulumu tamamlamak i\u00E7in devam'a bas\u0131n.",
            errorBackButton: 'L\u00FCtfen uygulamay\u0131 kullanmaya ba\u015Flamak i\u00E7in kurulum sorular\u0131n\u0131 tamamlay\u0131n.',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '\u0130\u015Fverenim taraf\u0131ndan geri \u00F6deme al\u0131n',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'Tak\u0131m\u0131m\u0131n giderlerini y\u00F6net',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: 'Giderleri takip et ve b\u00FCt\u00E7ele',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: 'Arkada\u015Flar\u0131n\u0131zla sohbet edin ve masraflar\u0131 b\u00F6l\u00FC\u015F\u00FCn',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'Bunun d\u0131\u015F\u0131nda bir \u015Fey',
        },
        employees: {
            title: 'Ka\u00E7 \u00E7al\u0131\u015Fan\u0131n\u0131z var?',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '1-10 \u00E7al\u0131\u015Fan',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '11-50 \u00E7al\u0131\u015Fan',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '51-100 \u00E7al\u0131\u015Fan',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101-1,000 \u00E7al\u0131\u015Fan',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: "1.000'den fazla \u00E7al\u0131\u015Fan",
        },
        accounting: {
            title: 'Herhangi bir muhasebe yaz\u0131l\u0131m\u0131 kullan\u0131yor musunuz?',
            noneOfAbove: 'The text to be translated is not provided in the prompt. Please provide the text for translation.',
        },
        error: {
            requiredFirstName: 'Devam etmek i\u00E7in l\u00FCtfen ilk ad\u0131n\u0131z\u0131 girin.',
        },
    },
    featureTraining: {
        doNotShowAgain: 'Bunu bana tekrar g\u00F6sterme',
    },
    personalDetails: {
        error: {
            containsReservedWord: '\u0130sim, Expensify veya Concierge kelimelerini i\u00E7eremez.',
            hasInvalidCharacter: '\u0130sim virg\u00FCl veya noktal\u0131 virg\u00FCl i\u00E7eremez.',
            requiredFirstName: '\u0130sim alan\u0131 bo\u015F b\u0131rak\u0131lamaz.',
        },
    },
    privatePersonalDetails: {
        enterLegalName: 'Yasal ad\u0131n\u0131z nedir?',
        enterDateOfBirth: 'Do\u011Fum tarihiniz nedir?',
        enterAddress: 'Adresiniz nedir?',
        enterPhoneNumber: 'Telefon numaran\u0131z nedir?',
        personalDetails: 'Ki\u015Fisel detaylar',
        privateDataMessage: 'Bu detaylar seyahat ve \u00F6demeler i\u00E7in kullan\u0131l\u0131r. Hi\u00E7bir zaman halka a\u00E7\u0131k profilinizde g\u00F6sterilmezler.',
        legalName: 'Yasal isim',
        legalFirstName: 'Yasal ilk isim',
        legalLastName: 'Yasal soyad\u0131',
        address: 'Adres',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `Tarih ${dateString}'den \u00F6nce olmal\u0131d\u0131r.`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `Tarih ${dateString}'den sonra olmal\u0131d\u0131r.`,
            hasInvalidCharacter: '\u0130sim yaln\u0131zca Latin karakterler i\u00E7erebilir.',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `Yanl\u0131\u015F posta kodu format\u0131.${zipFormat ? ` Kabul edilebilir format: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `L\u00FCtfen telefon numaras\u0131n\u0131n ge\u00E7erli oldu\u011Fundan emin olun (\u00F6r. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'Ba\u011Flant\u0131 tekrar g\u00F6nderildi',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) => `I've sent a magic sign-in link to ${login}. Please check your ${loginType} to sign in.`,
        resendLink: 'Ba\u011Flant\u0131y\u0131 yeniden g\u00F6nder',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `To validate ${secondaryLogin}, please resend the magic code from the Account Settings of ${primaryLogin}.`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) =>
            `E\u011Fer ${primaryLogin} eri\u015Fiminiz kalmad\u0131ysa, l\u00FCtfen hesaplar\u0131n\u0131z\u0131n ba\u011Flant\u0131s\u0131n\u0131 kald\u0131r\u0131n.`,
        unlink: 'Ba\u011Flant\u0131y\u0131 Kald\u0131r',
        linkSent: 'Ba\u011Flant\u0131 g\u00F6nderildi!',
        succesfullyUnlinkedLogin: '\u0130kincil giri\u015F ba\u015Far\u0131yla kald\u0131r\u0131ld\u0131!',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `E-posta sa\u011Flay\u0131c\u0131m\u0131z, teslimat sorunlar\u0131 nedeniyle ${login} 'e ge\u00E7ici olarak e-postalar\u0131 ask\u0131ya ald\u0131. Giri\u015Finizi engellemeyi kald\u0131rmak i\u00E7in l\u00FCtfen bu ad\u0131mlar\u0131 izleyin:`,
        confirmThat: ({login}: ConfirmThatParams) => `Confirm that ${login} is spelled correctly and is a real, deliverable email address. `,
        emailAliases:
            '"expenses@domain.com" gibi e-posta takma adlar\u0131, ge\u00E7erli bir Expensify giri\u015Fi olabilmesi i\u00E7in kendi e-posta gelen kutular\u0131na eri\u015Fim sahibi olmal\u0131d\u0131r.',
        ensureYourEmailClient: 'E-posta istemcinizin expensify.com e-postalar\u0131na izin verdi\u011Finden emin olun.',
        youCanFindDirections: 'Bu ad\u0131m\u0131 nas\u0131l tamamlayaca\u011F\u0131n\u0131za dair y\u00F6nergeleri bulabilirsiniz',
        helpConfigure: 'ancak e-posta ayarlar\u0131n\u0131z\u0131 yap\u0131land\u0131rmak i\u00E7in IT departman\u0131n\u0131za ihtiya\u00E7 duyabilirsiniz.',
        onceTheAbove: 'Yukar\u0131daki ad\u0131mlar tamamland\u0131ktan sonra, l\u00FCtfen ${username} ile ileti\u015Fime ge\u00E7in.',
        toUnblock: 'Giri\u015Finizi engellemeyi kald\u0131rmak.',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) =>
            `We've been unable to deliver SMS messages to ${login}, so we've suspended it for 24 hours. Please try validating your number:`,
        validationFailed: 'Do\u011Frulama ba\u015Far\u0131s\u0131z oldu \u00E7\u00FCnk\u00FC son denemenizden beri 24 saat ge\u00E7medi.',
        validationSuccess: 'Numaran\u0131z do\u011Fruland\u0131! Yeni bir sihirli oturum a\u00E7ma kodu g\u00F6ndermek i\u00E7in a\u015Fa\u011F\u0131ya t\u0131klay\u0131n.',
    },
    welcomeSignUpForm: {
        join: 'Kat\u0131l',
    },
    detailsPage: {
        localTime: 'Yerel saat',
    },
    newChatPage: {
        startGroup: 'Grubu ba\u015Flat',
        addToGroup: 'Gruba ekle',
    },
    yearPickerPage: {
        year: 'Y\u0131l',
        selectYear: 'L\u00FCtfen bir y\u0131l se\u00E7in',
    },
    focusModeUpdateModal: {
        title: '#focus moduna ho\u015F geldiniz!',
        prompt: 'Okunmam\u0131\u015F sohbetleri veya dikkatinizi gerektiren sohbetleri g\u00F6rerek her \u015Feyin \u00FCst\u00FCnde kal\u0131n. Endi\u015Felenmeyin, bunu herhangi bir noktada de\u011Fi\u015Ftirebilirsiniz.',
        settings: 'ayarlar',
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'Arad\u0131\u011F\u0131n\u0131z sohbet bulunam\u0131yor.',
        getMeOutOfHere: 'Beni buradan \u00E7\u0131kar',
        iouReportNotFound: 'Arad\u0131\u011F\u0131n\u0131z \u00F6deme detaylar\u0131 bulunamad\u0131.',
        notHere: 'Hmm... burada de\u011Fil',
        pageNotFound: 'Hata, bu sayfa bulunam\u0131yor',
        noAccess: 'Bu sohbet mevcut de\u011Fil veya eri\u015Fiminiz yok. Bir sohbet bulmak i\u00E7in aramay\u0131 deneyin.',
        goBackHome: 'Ana sayfaya geri d\u00F6n',
    },
    setPasswordPage: {
        enterPassword: 'Bir \u015Fifre girin',
        setPassword: '\u015Eifre belirle',
        newPasswordPrompt: '\u015Eifreniz en az 8 karakter, 1 b\u00FCy\u00FCk harf, 1 k\u00FC\u00E7\u00FCk harf ve 1 numara i\u00E7ermelidir.',
        passwordFormTitle: "Yeni Expensify'ye tekrar ho\u015F geldiniz! L\u00FCtfen \u015Fifrenizi belirleyin.",
        passwordNotSet: 'Yeni \u015Fifrenizi ayarlayamad\u0131k. Tekrar denemeniz i\u00E7in size yeni bir \u015Fifre ba\u011Flant\u0131s\u0131 g\u00F6nderdik.',
        setPasswordLinkInvalid: 'Bu \u015Fifre ayarlama ba\u011Flant\u0131s\u0131 ge\u00E7ersiz veya s\u00FCresi dolmu\u015F. Yeni bir tane e-posta gelen kutunuzda sizi bekliyor!',
        validateAccount: 'Hesab\u0131 do\u011Frula',
    },
    statusPage: {
        status: 'Durum',
        statusExplanation:
            'Meslekta\u015Flar\u0131n\u0131za ve arkada\u015Flar\u0131n\u0131za ne oldu\u011Funu kolayca anlamalar\u0131 i\u00E7in bir emoji ekleyin. \u0130ste\u011Fe ba\u011Fl\u0131 olarak bir mesaj da ekleyebilirsiniz!',
        today: 'Bug\u00FCn',
        clearStatus: 'Durumu temizle',
        save: 'Kaydet',
        message: 'Mesaj',
        timePeriods: {
            never: 'Asla',
            thirtyMinutes: '30 dakika',
            oneHour: '1 saat',
            afterToday: 'Bug\u00FCn',
            afterWeek: 'Bir hafta',
            custom: "Bu, d\u00FCz bir metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki neyi temsil ettiklerini a\u00E7\u0131klar, ancak ternary ifadeler veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        },
        untilTomorrow: 'Yar\u0131na kadar',
        untilTime: ({time}: UntilTimeParams) => `Until ${time}`,
        date: 'Tarih',
        time: 'Zaman',
        clearAfter: 'Sonra temizle',
        whenClearStatus: 'Durumunuzu ne zaman temizlemeliyiz?',
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `Ad\u0131m ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: 'Banka bilgisi',
        confirmBankInfo: 'Banka bilgilerini onaylay\u0131n',
        manuallyAdd: 'Banka hesab\u0131n\u0131z\u0131 manuel olarak ekleyin',
        letsDoubleCheck: 'Her \u015Feyin do\u011Fru g\u00F6r\u00FCnd\u00FC\u011F\u00FCn\u00FC iki kez kontrol edelim.',
        accountEnding: 'Hesap sonu',
        thisBankAccount: 'Bu banka hesab\u0131, \u00E7al\u0131\u015Fma alan\u0131n\u0131zdaki i\u015F \u00F6demeleri i\u00E7in kullan\u0131lacakt\u0131r.',
        accountNumber: 'Hesap numaras\u0131',
        routingNumber: 'Y\u00F6nlendirme numaras\u0131',
        chooseAnAccountBelow: 'A\u015Fa\u011F\u0131daki hesaplardan birini se\u00E7in',
        addBankAccount: 'Banka hesab\u0131 ekle',
        chooseAnAccount: 'Bir hesap se\u00E7in',
        connectOnlineWithPlaid: 'Bankan\u0131za giri\u015F yap\u0131n',
        connectManually: 'Manuel olarak ba\u011Flan',
        desktopConnection:
            'Not: Chase, Wells Fargo, Capital One veya Bank of America ile ba\u011Flant\u0131 kurmak i\u00E7in, l\u00FCtfen bu i\u015Flemi bir taray\u0131c\u0131da tamamlamak \u00FCzere buraya t\u0131klay\u0131n.',
        yourDataIsSecure: 'Verileriniz g\u00FCvendedir',
        toGetStarted:
            'Masraflar\u0131 geri \u00F6demek, Expensify Kartlar\u0131 \u00E7\u0131karmak, fatura \u00F6demeleri toplamak ve faturalar\u0131 tek bir yerden \u00F6demek i\u00E7in bir banka hesab\u0131 ekleyin.',
        plaidBodyCopy:
            '\u00C7al\u0131\u015Fanlar\u0131n\u0131za \u015Firket giderleri i\u00E7in daha kolay bir \u015Fekilde \u00F6deme yapma - ve geri \u00F6deme alma - imkan\u0131 sa\u011Flay\u0131n.',
        checkHelpLine: 'Rota numaran\u0131z ve hesap numaran\u0131z, hesaba ait bir \u00E7ek \u00FCzerinde bulunabilir.',
        validateAccountError: {
            phrase1: 'Durun! \u00D6ncelikle hesab\u0131n\u0131z\u0131 do\u011Frulaman\u0131z gerekiyor. Bunu yapmak i\u00E7in,',
            phrase2: 'bir sihirli kod ile tekrar oturum a\u00E7\u0131n',
            phrase3:
                "Bunlar ya d\u00FCz bir dizi ya da bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
            phrase4: 'Buradan hesab\u0131n\u0131z\u0131 do\u011Frulay\u0131n',
        },
        hasPhoneLoginError:
            'Do\u011Frulanm\u0131\u015F bir banka hesab\u0131 eklemek i\u00E7in l\u00FCtfen birincil giri\u015Finizin ge\u00E7erli bir e-posta oldu\u011Fundan emin olun ve tekrar deneyin. Telefon numaran\u0131z\u0131 ikincil bir giri\u015F olarak ekleyebilirsiniz.',
        hasBeenThrottledError: 'Banka hesab\u0131n\u0131z eklenirken bir hata olu\u015Ftu. L\u00FCtfen birka\u00E7 dakika bekleyin ve tekrar deneyin.',
        hasCurrencyError:
            "Hata! G\u00F6r\u00FCn\u00FC\u015Fe g\u00F6re \u00E7al\u0131\u015Fma alan\u0131n\u0131z\u0131n para birimi USD'den farkl\u0131 bir para birimine ayarlanm\u0131\u015F. Devam etmek i\u00E7in l\u00FCtfen onu USD olarak ayarlay\u0131n ve tekrar deneyin.",
        error: {
            youNeedToSelectAnOption: 'L\u00FCtfen devam etmek i\u00E7in bir se\u00E7enek se\u00E7in.',
            noBankAccountAvailable: '\u00DCzg\u00FCn\u00FCm, kullan\u0131labilir bir banka hesab\u0131 yok.',
            noBankAccountSelected: 'L\u00FCtfen bir hesap se\u00E7in.',
            taxID: 'L\u00FCtfen ge\u00E7erli bir vergi kimlik numaras\u0131 girin.',
            website: 'L\u00FCtfen ge\u00E7erli bir web sitesi girin.',
            zipCode: `L\u00FCtfen \u015Fu format\u0131 kullanarak ge\u00E7erli bir posta kodu girin: ${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}.`,
            phoneNumber: 'L\u00FCtfen ge\u00E7erli bir telefon numaras\u0131 girin.',
            email: 'L\u00FCtfen ge\u00E7erli bir e-posta adresi girin.',
            companyName: 'L\u00FCtfen ge\u00E7erli bir i\u015F ad\u0131 girin.',
            addressCity: 'L\u00FCtfen ge\u00E7erli bir \u015Fehir girin.',
            addressStreet: 'L\u00FCtfen ge\u00E7erli bir sokak adresi girin.',
            addressState: 'L\u00FCtfen ge\u00E7erli bir durum se\u00E7in.',
            incorporationDateFuture: 'Kurulu\u015F tarihi gelecekte olamaz.',
            incorporationState: 'L\u00FCtfen ge\u00E7erli bir durum se\u00E7in.',
            industryCode: 'L\u00FCtfen ge\u00E7erli bir alt\u0131 haneli sekt\u00F6r s\u0131n\u0131fland\u0131rma kodu girin.',
            restrictedBusiness: 'L\u00FCtfen i\u015Fletmenin k\u0131s\u0131tlanm\u0131\u015F i\u015Fletmeler listesinde olmad\u0131\u011F\u0131n\u0131 onaylay\u0131n.',
            routingNumber: 'L\u00FCtfen ge\u00E7erli bir y\u00F6nlendirme numaras\u0131 girin.',
            accountNumber: 'L\u00FCtfen ge\u00E7erli bir hesap numaras\u0131 girin.',
            routingAndAccountNumberCannotBeSame: 'Y\u00F6nlendirme ve hesap numaralar\u0131 e\u015Fle\u015Femez.',
            companyType: 'L\u00FCtfen ge\u00E7erli bir \u015Firket t\u00FCr\u00FC se\u00E7in.',
            tooManyAttempts:
                'Y\u00FCksek say\u0131da giri\u015F denemesi nedeniyle, bu se\u00E7enek 24 saatli\u011Fine devre d\u0131\u015F\u0131 b\u0131rak\u0131ld\u0131. L\u00FCtfen daha sonra tekrar deneyin veya detaylar\u0131 manuel olarak girin.',
            address: 'L\u00FCtfen ge\u00E7erli bir adres girin.',
            dob: 'L\u00FCtfen ge\u00E7erli bir do\u011Fum tarihi se\u00E7in.',
            age: '18 ya\u015F\u0131ndan b\u00FCy\u00FCk olmal\u0131d\u0131r.',
            ssnLast4: "L\u00FCtfen ge\u00E7erli SSN'nin son 4 hanesini girin.",
            firstName: 'L\u00FCtfen ge\u00E7erli bir ilk ad girin.',
            lastName: 'L\u00FCtfen ge\u00E7erli bir soyad\u0131 girin.',
            noDefaultDepositAccountOrDebitCardAvailable: 'L\u00FCtfen varsay\u0131lan bir depozito hesab\u0131 veya banka kart\u0131 ekleyin.',
            validationAmounts: 'Girdi\u011Finiz do\u011Frulama miktarlar\u0131 yanl\u0131\u015F. L\u00FCtfen banka hesap \u00F6zetinizi tekrar kontrol edin ve tekrar deneyin.',
            fullName: 'L\u00FCtfen ge\u00E7erli bir tam ad girin.',
            ownershipPercentage: 'L\u00FCtfen ge\u00E7erli bir y\u00FCzde numaras\u0131 girin.',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: 'Banka hesab\u0131n\u0131z nerede bulunuyor?',
        accountDetailsStepHeader: 'Hesap detaylar\u0131n\u0131z nelerdir?',
        accountTypeStepHeader: 'Bu hesap t\u00FCr\u00FC nedir?',
        bankInformationStepHeader: 'Banka bilgileriniz nelerdir?',
        accountHolderInformationStepHeader: 'Hesap sahibinin detaylar\u0131 nelerdir?',
        howDoWeProtectYourData: 'Verilerinizi nas\u0131l koruruz?',
        currencyHeader: 'Banka hesab\u0131n\u0131z\u0131n para birimi nedir?',
        confirmationStepHeader: 'Bilgilerinizi kontrol edin.',
        confirmationStepSubHeader: 'A\u015Fa\u011F\u0131daki detaylar\u0131 iki kez kontrol edin ve onaylamak i\u00E7in \u015Fartlar kutusunu i\u015Faretleyin.',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Expensify \u015Fifrenizi girin',
        alreadyAdded: 'Bu hesap zaten eklenmi\u015F.',
        chooseAccountLabel: 'Hesap',
        successTitle: 'Ki\u015Fisel banka hesab\u0131 eklendi!',
        successMessage: 'Tebrikler, banka hesab\u0131n\u0131z kuruldu ve geri \u00F6demeleri almaya haz\u0131r.',
    },
    attachmentView: {
        unknownFilename: "The task doesn't provide a specific text to translate. Please provide the text for translation.",
        passwordRequired: 'L\u00FCtfen bir \u015Fifre girin',
        passwordIncorrect: 'Yanl\u0131\u015F \u015Fifre. L\u00FCtfen tekrar deneyin.',
        failedToLoadPDF: 'PDF dosyas\u0131 y\u00FCklenemedi.',
        pdfPasswordForm: {
            title: 'Parola korumal\u0131 PDF',
            infoText: 'Bu PDF \u015Fifre ile korunmaktad\u0131r.',
            beforeLinkText: "You didn't provide any text to translate. Please provide the text you want to translate.",
            linkText: '\u015Fifreyi girin',
            afterLinkText: 'Bunu g\u00F6r\u00FCnt\u00FClemek i\u00E7in.',
            formLabel: "PDF'yi G\u00F6r\u00FCnt\u00FCle",
        },
        attachmentNotFound: 'Ek not bulunamad\u0131',
    },
    messages: {
        errorMessageInvalidPhone: `L\u00FCtfen parantez veya \u00E7izgi olmadan ge\u00E7erli bir telefon numaras\u0131 girin. E\u011Fer ABD d\u0131\u015F\u0131ndaysan\u0131z, l\u00FCtfen \u00FClke kodunuzu ekleyin (\u00F6r. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
        errorMessageInvalidEmail: 'Ge\u00E7ersiz e-posta',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} is already a member of ${name}`,
    },
    onfidoStep: {
        acceptTerms:
            'Expensify C\u00FCzdan\u0131n\u0131z\u0131 etkinle\u015Ftirmek i\u00E7in talepte bulunmay\u0131 s\u00FCrd\u00FCrerek, okudu\u011Funuzu, anlad\u0131\u011F\u0131n\u0131z\u0131 ve kabul etti\u011Finizi onaylars\u0131n\u0131z.',
        facialScan: 'Onfido\u2019nun Y\u00FCz Tarama Politikas\u0131 ve Yay\u0131n\u0131',
        tryAgain: 'Tekrar deneyin',
        verifyIdentity: 'Kimli\u011Fi do\u011Frula',
        letsVerifyIdentity: 'Kimli\u011Finizi do\u011Frulayal\u0131m',
        butFirst: `But first, the boring stuff. Read up on the legalese in the next step and click "Accept" when you're ready.`,
        genericError: 'Bu ad\u0131m i\u015Flenirken bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin.',
        cameraPermissionsNotGranted: 'Kamera eri\u015Fimini etkinle\u015Ftir',
        cameraRequestMessage:
            'Banka hesab\u0131 do\u011Frulamas\u0131n\u0131 tamamlamak i\u00E7in kameran\u0131za eri\u015Fim gereklidir. L\u00FCtfen Ayarlar > Yeni Expensify \u00FCzerinden etkinle\u015Ftirin.',
        microphonePermissionsNotGranted: 'Mikrofon eri\u015Fimini etkinle\u015Ftir',
        microphoneRequestMessage:
            'Banka hesab\u0131 do\u011Frulamas\u0131n\u0131 tamamlamak i\u00E7in mikrofonunuza eri\u015Fim gerekiyoruz. L\u00FCtfen Ayarlar > Yeni Expensify \u00FCzerinden etkinle\u015Ftirin.',
        originalDocumentNeeded: 'L\u00FCtfen kimli\u011Finizin bir ekran g\u00F6r\u00FCnt\u00FCs\u00FC veya taranm\u0131\u015F bir resmi yerine orijinal bir resmini y\u00FCkleyin.',
        documentNeedsBetterQuality:
            'Kimli\u011Finiz hasar g\u00F6rm\u00FC\u015F gibi g\u00F6r\u00FCn\u00FCyor veya g\u00FCvenlik \u00F6zellikleri eksik. L\u00FCtfen hasars\u0131z ve tamamen g\u00F6r\u00FCn\u00FCr bir kimli\u011Fin orijinal resmini y\u00FCkleyin.',
        imageNeedsBetterQuality:
            'Kimli\u011Finizin g\u00F6r\u00FCnt\u00FC kalitesinde bir sorun var. L\u00FCtfen t\u00FCm kimli\u011Finizin net bir \u015Fekilde g\u00F6r\u00FClebildi\u011Fi yeni bir g\u00F6r\u00FCnt\u00FC y\u00FCkleyin.',
        selfieIssue: "Selfie/video'nuzla ilgili bir sorun var. L\u00FCtfen canl\u0131 bir selfie/video y\u00FCkleyin.",
        selfieNotMatching:
            "Selfie/video'nuz kimli\u011Finizle e\u015Fle\u015Fmiyor. L\u00FCtfen y\u00FCz\u00FCn\u00FCz\u00FCn net bir \u015Fekilde g\u00F6r\u00FClebilece\u011Fi yeni bir selfie/video y\u00FCkleyin.",
        selfieNotLive: "Selfie'niz/video'nuz canl\u0131 bir foto\u011Fraf/video gibi g\u00F6r\u00FCnm\u00FCyor. L\u00FCtfen canl\u0131 bir selfie/video y\u00FCkleyin.",
    },
    additionalDetailsStep: {
        headerTitle: 'Ekstra detaylar',
        helpText: 'C\u00FCzdan\u0131n\u0131zdan para g\u00F6nderip alabilmeniz i\u00E7in a\u015Fa\u011F\u0131daki bilgilerin do\u011Frulanmas\u0131 gerekmektedir.',
        helpTextIdologyQuestions: 'Kimli\u011Finizi do\u011Frulamay\u0131 tamamlamak i\u00E7in size birka\u00E7 soru daha sormam\u0131z gerekiyor.',
        helpLink: 'Bunun neden gerekti\u011Fini \u00F6\u011Frenmek i\u00E7in daha fazla bilgi edinin.',
        legalFirstNameLabel: 'Yasal ilk isim',
        legalMiddleNameLabel: 'Yasal ikinci ad',
        legalLastNameLabel: 'Yasal soyad\u0131',
        selectAnswer: 'L\u00FCtfen devam etmek i\u00E7in bir yan\u0131t se\u00E7in.',
        ssnFull9Error: 'L\u00FCtfen ge\u00E7erli bir dokuz haneli SSN girin.',
        needSSNFull9: "SSN'nizi do\u011Frulamada sorun ya\u015F\u0131yoruz. L\u00FCtfen SSN'nizin tam dokuz hanesini girin.",
        weCouldNotVerify: 'Do\u011Frulayamad\u0131k',
        pleaseFixIt: 'L\u00FCtfen devam etmeden \u00F6nce bu bilgiyi d\u00FCzeltin',
        failedKYCTextBefore: 'Kimli\u011Finizi do\u011Frulayamad\u0131k. L\u00FCtfen daha sonra tekrar deneyin veya ileti\u015Fime ge\u00E7in.',
        failedKYCTextAfter: 'E\u011Fer herhangi bir sorunuz varsa.',
    },
    termsStep: {
        headerTitle: '\u015Eartlar ve \u00FCcretler',
        headerTitleRefactor: '\u00DCcretler ve \u015Fartlar',
        haveReadAndAgree: 'Okudum ve almay\u0131 kabul ediyorum',
        electronicDisclosures: 'elektronik a\u00E7\u0131klamalar',
        agreeToThe:
            "Ben, ${username} ile anla\u015F\u0131yorum. Bu ya d\u00FCz bir dize veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript i\u015Flevidir. Yer tutucular\u0131 gibi ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} vb. i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsillerini tan\u0131mlar, ancak \u00FC\u00E7l\u00FC ifadeler veya di\u011Fer TypeScript kodlar\u0131n\u0131 i\u00E7erebilir.",
        walletAgreement: 'C\u00FCzdan s\u00F6zle\u015Fmesi',
        enablePayments: '\u00D6demeleri etkinle\u015Ftir',
        monthlyFee: 'Ayl\u0131k \u00FCcret',
        inactivity: 'Etkin olmama',
        noOverdraftOrCredit: 'Art\u0131 bakiye/kredi \u00F6zelli\u011Fi yok.',
        electronicFundsWithdrawal: 'Elektronik fon \u00E7ekme',
        standard:
            "Bu bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki neyi temsil ettiklerini tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        reviewTheFees: 'L\u00FCtfen a\u015Fa\u011F\u0131daki \u00FCcretleri inceleyin.',
        checkTheBoxes: 'L\u00FCtfen a\u015Fa\u011F\u0131daki kutular\u0131 kontrol edin.',
        agreeToTerms: '\u015Eartlar\u0131 kabul edin ve i\u015Flemeye haz\u0131r olun!',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Expensify C\u00FCzdan\u0131, ${walletProgram} taraf\u0131ndan verilmi\u015Ftir.`,
            perPurchase: 'Sat\u0131n alma ba\u015F\u0131na',
            atmWithdrawal: "ATM'den para \u00E7ekme",
            cashReload: 'Nakit yenileme',
            inNetwork: 'a\u011F i\u00E7i',
            outOfNetwork: 'a\u011F d\u0131\u015F\u0131',
            atmBalanceInquiry: 'ATM bakiye sorgulama',
            inOrOutOfNetwork: '(a\u011F i\u00E7i veya a\u011F d\u0131\u015F\u0131)',
            customerService: 'M\u00FC\u015Fteri hizmetleri',
            automatedOrLive: '(otomatik veya canl\u0131 ajan)',
            afterTwelveMonths: '(12 ay boyunca hi\u00E7 i\u015Flem yap\u0131lmad\u0131ktan sonra)',
            weChargeOneFee: 'Biz bir t\u00FCr \u00FCcret talep ediyoruz.',
            fdicInsurance: 'Fonlar\u0131n\u0131z FDIC sigortas\u0131 i\u00E7in uygun.',
            generalInfo: '\u00D6n \u00F6demeli hesaplar hakk\u0131nda genel bilgi i\u00E7in, ziyaret edin',
            conditionsDetails: 'T\u00FCm \u00FCcretler ve hizmetler hakk\u0131nda detaylar ve ko\u015Fullar i\u00E7in, ziyaret edin',
            conditionsPhone: 'veya +1 833-400-0904 numaras\u0131n\u0131 arayarak.',
            instant: 'Your request is missing the text that needs to be translated. Please provide the text for translation.',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(min ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'T\u00FCm Expensify C\u00FCzdan \u00FCcretlerinin listesi',
            typeOfFeeHeader: '\u00DCcret t\u00FCr\u00FC',
            feeAmountHeader: '\u00DCcret miktar\u0131',
            moreDetailsHeader:
                'Sorry for the confusion, but as an AI model, I need a specific text or TypeScript function to translate. Please provide the text or TypeScript function that you want to translate into Turkish.',
            openingAccountTitle: 'Bir hesap a\u00E7ma',
            openingAccountDetails: 'Bir hesap a\u00E7mak i\u00E7in hi\u00E7bir \u00FCcret yoktur.',
            monthlyFeeDetails: 'Ayl\u0131k \u00FCcret yok.',
            customerServiceTitle: 'M\u00FC\u015Fteri hizmetleri',
            customerServiceDetails: 'M\u00FC\u015Fteri hizmetleri \u00FCcreti yoktur.',
            inactivityDetails: 'Hi\u00E7bir hareketsizlik \u00FCcreti yok.',
            sendingFundsTitle: 'Bir ba\u015Fka hesap sahibine para g\u00F6nderme',
            sendingFundsDetails:
                'Bakiyenizi, banka hesab\u0131n\u0131z\u0131 veya banka kart\u0131n\u0131z\u0131 kullanarak ba\u015Fka bir hesap sahibine para g\u00F6ndermek i\u00E7in herhangi bir \u00FCcret yoktur.',
            electronicFundsStandardDetails:
                'Expensify C\u00FCzdan\u0131n\u0131zdan para transfer etmek i\u00E7in hi\u00E7bir \u00FCcret yoktur' +
                'standart se\u00E7ene\u011Fi kullanarak banka hesab\u0131n\u0131za aktar\u0131m yap\u0131l\u0131r. Bu transfer genellikle 1-3 i\u015F g\u00FCn\u00FC i\u00E7inde tamamlan\u0131r.' +
                'g\u00FCnler.',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                'Expensify C\u00FCzdan\u0131n\u0131zdan para transfer etmek i\u00E7in bir \u00FCcret bulunmaktad\u0131r.' +
                'an\u0131nda transfer se\u00E7ene\u011Fini kullanarak ba\u011Fl\u0131 banka kart\u0131n\u0131za aktar\u0131n. Bu transfer genellikle i\u00E7inde tamamlan\u0131r ${count}' +
                `Birka\u00E7 dakika s\u00FCrer. \u00DCcret, transfer miktar\u0131n\u0131n ${percentage}%'i kadard\u0131r (minimum \u00FCcret ${amount}).`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                'Fonlar\u0131n\u0131z FDIC sigortas\u0131 i\u00E7in uygun. Fonlar\u0131n\u0131z \u015Fu anda veya daha sonra ${bankName} bankas\u0131nda tutulacak.' +
                `transferred to ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}, an FDIC-insured institution. Once there, your funds are insured up ` +
                `FDIC taraf\u0131ndan ${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} ba\u015Far\u0131s\u0131z olmas\u0131 durumunda ${amount} kadar\u0131na kadar. Bak\u0131n\u0131z`,
            fdicInsuranceBancorp2: 'detaylar i\u00E7in.',
            contactExpensifyPayments: `Contact ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} by calling +1 833-400-0904, by email at`,
            contactExpensifyPayments2: 'veya ${username} ile oturum a\u00E7\u0131n',
            generalInformation: '\u00D6n \u00F6demeli hesaplar hakk\u0131nda genel bilgi i\u00E7in, ziyaret edin',
            generalInformation2:
                "E\u011Fer \u00F6n \u00F6demeli bir hesap hakk\u0131nda bir \u015Fikayetiniz varsa, T\u00FCketici Finansal Koruma B\u00FCrosu'nu 1-855-411-2372 numaras\u0131ndan aray\u0131n veya ziyaret edin",
            printerFriendlyView: 'Yaz\u0131c\u0131ya uygun versiyonu g\u00F6r\u00FCnt\u00FCleyin',
            automated: 'Otomatik',
            liveAgent: 'Canl\u0131 temsilci',
            instant: 'Anl\u0131k',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `Benim ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '\u00D6demeleri etkinle\u015Ftir',
        activatedTitle: 'C\u00FCzdan aktif!',
        activatedMessage: 'Tebrikler, c\u00FCzdan\u0131n\u0131z \u00F6demeler yapmak \u00FCzere ayarland\u0131 ve haz\u0131r.',
        checkBackLaterTitle: 'Bir dakika...',
        checkBackLaterMessage: 'Bilgilerinizi hala incelemekteyiz. L\u00FCtfen daha sonra tekrar kontrol edin.',
        continueToPayment: '\u00D6demeye devam et',
        continueToTransfer: 'Devam et aktarmaya',
    },
    companyStep: {
        headerTitle: '\u015Eirket bilgisi',
        subtitle: 'Neredeyse bitti! G\u00FCvenlik ama\u00E7lar\u0131 i\u00E7in baz\u0131 bilgileri do\u011Frulamam\u0131z gerekiyor:',
        legalBusinessName: 'Yasal i\u015Fletme ad\u0131',
        companyWebsite: '\u015Eirket web sitesi',
        taxIDNumber: 'Vergi Kimlik Numaras\u0131',
        taxIDNumberPlaceholder: '9 hane',
        companyType: '\u015Eirket t\u00FCr\u00FC',
        incorporationDate: 'Kurulu\u015F tarihi',
        incorporationState: 'Kurulu\u015F durumu',
        industryClassificationCode: 'End\u00FCstri s\u0131n\u0131fland\u0131rma kodu',
        confirmCompanyIsNot: 'Bu \u015Firketin listede olmad\u0131\u011F\u0131n\u0131 onayl\u0131yorum.',
        listOfRestrictedBusinesses: 'k\u0131s\u0131tl\u0131 i\u015Fletmeler listesi',
        incorporationDatePlaceholder: 'Ba\u015Flang\u0131\u00E7 tarihi (yyyy-aa-gg)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION:
                "Bu, d\u00FCz bir dize ya da bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
            PARTNERSHIP: 'Ortakl\u0131k',
            COOPERATIVE: 'Kooperatif',
            SOLE_PROPRIETORSHIP: 'Tek ki\u015Filik \u015Firket',
            OTHER: "You haven't provided any text to translate. Please provide the text that you want to translate into Turkish.",
        },
    },
    requestorStep: {
        headerTitle: 'Ki\u015Fisel bilgiler',
        learnMore: 'Daha fazla \u00F6\u011Fren',
        isMyDataSafe: 'Verilerim g\u00FCvende mi?',
    },
    personalInfoStep: {
        personalInfo: 'Ki\u015Fisel bilgi',
        enterYourLegalFirstAndLast: 'Yasal ad\u0131n\u0131z nedir?',
        legalFirstName: 'Yasal ilk isim',
        legalLastName: 'Yasal soyad\u0131',
        legalName: 'Yasal isim',
        enterYourDateOfBirth: 'Do\u011Fum tarihiniz nedir?',
        enterTheLast4: 'Sosyal G\u00FCvenlik Numaran\u0131z\u0131n son d\u00F6rt hanesi nedir?',
        dontWorry: 'Endi\u015Felenme, biz hi\u00E7bir ki\u015Fisel kredi kontrol\u00FC yapm\u0131yoruz!',
        last4SSN: "SSN'nin son 4 hanesi",
        enterYourAddress: 'Adresiniz nedir?',
        address: 'Adres',
        letsDoubleCheck: 'Her \u015Feyin do\u011Fru g\u00F6r\u00FCnd\u00FC\u011F\u00FCn\u00FC iki kez kontrol edelim.',
        byAddingThisBankAccount: 'Bu banka hesab\u0131n\u0131 ekleyerek, okudu\u011Funuzu, anlad\u0131\u011F\u0131n\u0131z\u0131 ve kabul etti\u011Finizi onayl\u0131yorsunuz.',
        whatsYourLegalName: 'Yasal ad\u0131n\u0131z nedir?',
        whatsYourDOB: 'Do\u011Fum tarihiniz nedir?',
        whatsYourAddress: 'Adresiniz nedir?',
        whatsYourSSN: 'Sosyal G\u00FCvenlik Numaran\u0131z\u0131n son d\u00F6rt hanesi nedir?',
        noPersonalChecks: 'Endi\u015Felenme, burada ki\u015Fisel kredi kontrol\u00FC yok!',
        whatsYourPhoneNumber: 'Telefon numaran\u0131z nedir?',
        weNeedThisToVerify: 'C\u00FCzdan\u0131n\u0131z\u0131 do\u011Frulamak i\u00E7in buna ihtiyac\u0131m\u0131z var.',
    },
    businessInfoStep: {
        businessInfo: '\u015Eirket bilgisi',
        enterTheNameOfYourBusiness: '\u015Eirketinizin ad\u0131 nedir?',
        businessName: 'Yasal \u015Firket ad\u0131',
        enterYourCompanysTaxIdNumber: '\u015Eirketinizin Vergi Kimlik Numaras\u0131 nedir?',
        taxIDNumber: 'Vergi Kimlik Numaras\u0131',
        taxIDNumberPlaceholder: '9 hane',
        enterYourCompanysWebsite: '\u015Eirketinizin web sitesi nedir?',
        companyWebsite: '\u015Eirket web sitesi',
        enterYourCompanysPhoneNumber: '\u015Eirketinizin telefon numaras\u0131 nedir?',
        enterYourCompanysAddress: '\u015Eirketinizin adresi nedir?',
        selectYourCompanysType: 'Bu ne t\u00FCr bir \u015Firket?',
        companyType: '\u015Eirket t\u00FCr\u00FC',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION:
                "Bu, d\u00FCz bir dize ya da bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
            PARTNERSHIP: 'Ortakl\u0131k',
            COOPERATIVE: 'Kooperatif',
            SOLE_PROPRIETORSHIP: 'Tek ki\u015Filik \u015Firket',
            OTHER: "You haven't provided any text to translate. Please provide the text that you want to translate into Turkish.",
        },
        selectYourCompanysIncorporationDate: '\u015Eirketinizin kurulu\u015F tarihi nedir?',
        incorporationDate: 'Kurulu\u015F tarihi',
        incorporationDatePlaceholder: 'Ba\u015Flang\u0131\u00E7 tarihi (yyyy-aa-gg)',
        incorporationState: 'Kurulu\u015F durumu',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '\u015Eirketiniz hangi eyalette kuruldu?',
        letsDoubleCheck: 'Her \u015Feyin do\u011Fru g\u00F6r\u00FCnd\u00FC\u011F\u00FCn\u00FC iki kez kontrol edelim.',
        companyAddress: '\u015Eirket adresi',
        listOfRestrictedBusinesses: 'k\u0131s\u0131tl\u0131 i\u015Fletmeler listesi',
        confirmCompanyIsNot: 'Bu \u015Firketin listede olmad\u0131\u011F\u0131n\u0131 onayl\u0131yorum.',
        businessInfoTitle: '\u0130\u015F bilgisi',
        legalBusinessName: 'Yasal i\u015Fletme ad\u0131',
        whatsTheBusinessName: '\u0130\u015Fletmenin ad\u0131 nedir?',
        whatsTheBusinessAddress: '\u0130\u015F adresi nedir?',
        whatsTheBusinessContactInformation: '\u0130\u015Fletme ileti\u015Fim bilgileri nedir?',
        whatsTheBusinessRegistrationNumber: '\u0130\u015F kay\u0131t numaras\u0131 nedir?',
        whatsTheBusinessTaxIDEIN: '\u0130\u015Fletme vergi kimlik numaras\u0131/EIN/VAT/GST kay\u0131t numaras\u0131 nedir?',
        whatsThisNumber: 'Bu numara nedir?',
        whereWasTheBusinessIncorporated: '\u0130\u015Fletme nerede kuruldu?',
        whatTypeOfBusinessIsIt: 'Bu ne t\u00FCr bir i\u015Fletme?',
        whatsTheBusinessAnnualPayment: '\u0130\u015Fletmenin y\u0131ll\u0131k \u00F6deme hacmi nedir?',
        whatsYourExpectedAverageReimbursements: 'Beklenen ortalama geri \u00F6deme miktar\u0131n\u0131z nedir?',
        registrationNumber: 'Kay\u0131t numaras\u0131',
        taxIDEIN: 'Vergi Kimlik/EIN numaras\u0131',
        businessAddress: '\u0130\u015F adresi',
        businessType: '\u0130\u015F t\u00FCr\u00FC',
        incorporation: 'Kurulu\u015F',
        incorporationCountry: 'Kurulu\u015F \u00FClkesi',
        incorporationTypeName: 'T\u00FCzel ki\u015Filik t\u00FCr\u00FC',
        businessCategory: '\u0130\u015F kategorisi',
        annualPaymentVolume: 'Y\u0131ll\u0131k \u00F6deme hacmi',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `Y\u0131ll\u0131k \u00F6deme hacmi ${currencyCode} olarak`,
        averageReimbursementAmount: 'Ortalama geri \u00F6deme miktar\u0131',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `Ortalama geri \u00F6deme miktar\u0131 ${currencyCode} olarak`,
        selectIncorporationType: 'T\u00FCzel ki\u015Filik t\u00FCr\u00FCn\u00FC se\u00E7in',
        selectBusinessCategory: '\u0130\u015F kategorisi se\u00E7in',
        selectAnnualPaymentVolume: 'Y\u0131ll\u0131k \u00F6deme hacmini se\u00E7in',
        selectIncorporationCountry: 'T\u00FCzel ki\u015Fili\u011Fin kurulaca\u011F\u0131 \u00FClkeyi se\u00E7in',
        selectIncorporationState: 'T\u00FCzel ki\u015Fili\u011Fi kurma durumunu se\u00E7in',
        selectAverageReimbursement: 'Ortalama geri \u00F6deme miktar\u0131n\u0131 se\u00E7in',
        findIncorporationType: 'Kurulu\u015F tipini bulun',
        findBusinessCategory: '\u0130\u015F kategorisini bul',
        findAnnualPaymentVolume: 'Y\u0131ll\u0131k \u00F6deme hacmini bulun',
        findIncorporationState: 'Kurulu\u015F durumunu bulun',
        findAverageReimbursement: 'Ortalama geri \u00F6deme miktar\u0131n\u0131 bulun',
        error: {
            registrationNumber: 'L\u00FCtfen ge\u00E7erli bir kay\u0131t numaras\u0131 sa\u011Flay\u0131n.',
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: '%25 veya daha fazlas\u0131na sahip misiniz',
        doAnyIndividualOwn25percent: 'Herhangi bir bireyin %25 veya daha fazlas\u0131na sahip olup olmad\u0131\u011F\u0131',
        areThereMoreIndividualsWhoOwn25percent: '%25 veya daha fazla hisseye sahip olan daha fazla birey var m\u0131?',
        regulationRequiresUsToVerifyTheIdentity: "D\u00FCzenlemeler, i\u015Fletmenin %25'inden fazlas\u0131na sahip olan her bireyin kimli\u011Fini do\u011Frulamam\u0131z\u0131 gerektirir.",
        companyOwner: '\u0130\u015F sahibi',
        enterLegalFirstAndLastName: 'Sahibinin yasal ad\u0131 nedir?',
        legalFirstName: 'Yasal ilk isim',
        legalLastName: 'Yasal soyad\u0131',
        enterTheDateOfBirthOfTheOwner: 'Sahibinin do\u011Fum tarihi nedir?',
        enterTheLast4: 'Sahibinin Sosyal G\u00FCvenlik Numaras\u0131n\u0131n son 4 hanesi nedir?',
        last4SSN: "SSN'nin son 4 hanesi",
        dontWorry: 'Endi\u015Felenme, biz hi\u00E7bir ki\u015Fisel kredi kontrol\u00FC yapm\u0131yoruz!',
        enterTheOwnersAddress: 'Sahibinin adresi nedir?',
        letsDoubleCheck: 'Her \u015Feyin do\u011Fru g\u00F6r\u00FCnd\u00FC\u011F\u00FCn\u00FC iki kez kontrol edelim.',
        legalName: 'Yasal isim',
        address: 'Adres',
        byAddingThisBankAccount: 'Bu banka hesab\u0131n\u0131 ekleyerek, okudu\u011Funuzu, anlad\u0131\u011F\u0131n\u0131z\u0131 ve kabul etti\u011Finizi onayl\u0131yorsunuz.',
        owners: 'Sahipler',
    },
    ownershipInfoStep: {
        ownerInfo: 'Sahip bilgisi',
        businessOwner: '\u0130\u015F sahibi',
        signerInfo: '\u0130mza bilgisi',
        doYouOwn: ({companyName}: CompanyNameParams) => `Do you own 25% or more of ${companyName}`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `Herhangi bir bireyin ${companyName} \u015Firketinin %25 veya daha fazlas\u0131na sahip olmas\u0131 durumu var m\u0131?`,
        regulationsRequire: "D\u00FCzenlemeler, i\u015Fletmenin %25'inden fazlas\u0131na sahip olan her bireyin kimli\u011Fini do\u011Frulamam\u0131z\u0131 gerektirir.",
        legalFirstName: 'Yasal ilk isim',
        legalLastName: 'Yasal soyad\u0131',
        whatsTheOwnersName: 'Sahibinin yasal ad\u0131 nedir?',
        whatsYourName: 'Yasal ad\u0131n\u0131z nedir?',
        whatPercentage: '\u0130\u015Fletmenin y\u00FCzde ka\u00E7\u0131 sahibine aittir?',
        whatsYoursPercentage: '\u0130\u015Fletmenin y\u00FCzde ka\u00E7\u0131n\u0131 sahipsiniz?',
        ownership: 'M\u00FClkiyet',
        whatsTheOwnersDOB: 'Sahibinin do\u011Fum tarihi nedir?',
        whatsYourDOB: 'Do\u011Fum tarihiniz nedir?',
        whatsTheOwnersAddress: 'Sahibinin adresi nedir?',
        whatsYourAddress: 'Adresiniz nedir?',
        whatAreTheLast: 'Sahibinin Sosyal G\u00FCvenlik Numaras\u0131n\u0131n son 4 hanesi nedir?',
        whatsYourLast: 'Sosyal G\u00FCvenlik Numaran\u0131z\u0131n son 4 hanesi nedir?',
        dontWorry: 'Endi\u015Felenme, biz hi\u00E7bir ki\u015Fisel kredi kontrol\u00FC yapm\u0131yoruz!',
        last4: "SSN'nin son 4 hanesi",
        whyDoWeAsk: 'Bunu neden soruyoruz?',
        letsDoubleCheck: 'Her \u015Feyin do\u011Fru g\u00F6r\u00FCnd\u00FC\u011F\u00FCn\u00FC iki kez kontrol edelim.',
        legalName: 'Yasal isim',
        ownershipPercentage: 'Sahiplik y\u00FCzdesi',
        areThereOther: ({companyName}: CompanyNameParams) => `Are there other individuals who own 25% or more of ${companyName}`,
        owners: 'Sahipler',
        addCertified: 'Faydal\u0131 sahipleri g\u00F6steren sertifikal\u0131 bir org \u015Femas\u0131 ekleyin',
        regulationRequiresChart:
            'D\u00FCzenlemeler, i\u015Fletmenin %25 veya daha fazlas\u0131na sahip olan her birey veya kurulu\u015Fu g\u00F6steren m\u00FClkiyet \u015Femas\u0131n\u0131n onayl\u0131 bir kopyas\u0131n\u0131 toplamam\u0131z\u0131 gerektirir.',
        uploadEntity: 'Varl\u0131k sahipli\u011Fi \u015Femas\u0131n\u0131 y\u00FCkle',
        noteEntity:
            'Not: Varl\u0131k sahipli\u011Fi tablosu, muhasebeciniz, hukuk dan\u0131\u015Fman\u0131n\u0131z taraf\u0131ndan imzalanmal\u0131d\u0131r veya noter onayl\u0131 olmal\u0131d\u0131r.',
        certified: 'Sertifikal\u0131 varl\u0131k sahipli\u011Fi tablosu',
        selectCountry: '\u00DClke se\u00E7in',
        findCountry: '\u00DClke bul',
        address: 'Adres',
    },
    validationStep: {
        headerTitle: 'Banka hesab\u0131n\u0131 do\u011Frula',
        buttonText: 'Kurulumu tamamla',
        maxAttemptsReached:
            'Bu banka hesab\u0131 i\u00E7in do\u011Frulama, \u00E7ok fazla yanl\u0131\u015F deneme nedeniyle devre d\u0131\u015F\u0131 b\u0131rak\u0131lm\u0131\u015Ft\u0131r.',
        description: `Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: 'L\u00FCtfen her i\u015Flem tutar\u0131n\u0131 a\u015Fa\u011F\u0131daki alanlara girin. \u00D6rnek: 1.51.',
        reviewingInfo:
            'Te\u015Fekk\u00FCrler! Bilgilerinizi inceliyoruz ve k\u0131sa s\u00FCre i\u00E7inde sizinle ileti\u015Fime ge\u00E7ece\u011Fiz. L\u00FCtfen Concierge ile olan sohbetinizi kontrol edin.',
        forNextStep: 'banka hesab\u0131n\u0131z\u0131n kurulumunu tamamlamak i\u00E7in bir sonraki ad\u0131mlar.',
        letsChatCTA: 'Evet, sohbet edelim',
        letsChatText:
            'Neredeyse oraday\u0131z! Sohbet \u00FCzerinden son birka\u00E7 bilgiyi do\u011Frulaman\u0131z i\u00E7in yard\u0131m\u0131n\u0131za ihtiyac\u0131m\u0131z var. Haz\u0131r m\u0131s\u0131n\u0131z?',
        letsChatTitle: 'Hadi sohbet edelim!',
        enable2FATitle: 'Doland\u0131r\u0131c\u0131l\u0131\u011F\u0131 \u00F6nleyin, iki fakt\u00F6rl\u00FC kimlik do\u011Frulamay\u0131 (2FA) etkinle\u015Ftirin',
        enable2FAText: "G\u00FCvenli\u011Finizi ciddiye al\u0131yoruz. L\u00FCtfen hesab\u0131n\u0131za ekstra bir koruma katman\u0131 eklemek i\u00E7in \u015Fimdi 2FA'y\u0131 kurun.",
        secureYourAccount: 'Hesab\u0131n\u0131z\u0131 g\u00FCvenceye al\u0131n',
    },
    beneficialOwnersStep: {
        additionalInformation: 'Ek bilgi',
        checkAllThatApply: 'Uygulanabilir olanlar\u0131n t\u00FCm\u00FCn\u00FC i\u015Faretleyin, aksi takdirde bo\u015F b\u0131rak\u0131n.',
        iOwnMoreThan25Percent: "Benim %25'ten fazlas\u0131na sahibim",
        someoneOwnsMoreThan25Percent: "Ba\u015Fkas\u0131n\u0131n sahip oldu\u011Fu y\u00FCzde 25'ten fazla",
        additionalOwner: 'Ek faydal\u0131 sahip',
        removeOwner: 'Bu faydal\u0131 sahibi kald\u0131r\u0131n',
        addAnotherIndividual: "%25'ten fazla hisseye sahip olan ba\u015Fka bir ki\u015Fi ekleyin",
        agreement: 'Anla\u015Fma:',
        termsAndConditions: '\u015Fartlar ve ko\u015Fullar',
        certifyTrueAndAccurate: 'Sa\u011Flad\u0131\u011F\u0131m bilgilerin do\u011Fru ve kesin oldu\u011Funu onayl\u0131yorum',
        error: {
            certify: 'Bilgilerin do\u011Fru ve kesin oldu\u011Funu onaylamal\u0131s\u0131n\u0131z.',
        },
    },
    completeVerificationStep: {
        completeVerification: 'Do\u011Frulamay\u0131 tamamlay\u0131n',
        confirmAgreements: 'L\u00FCtfen a\u015Fa\u011F\u0131daki anla\u015Fmalar\u0131 onaylay\u0131n.',
        certifyTrueAndAccurate: 'Sa\u011Flad\u0131\u011F\u0131m bilgilerin do\u011Fru ve kesin oldu\u011Funu onayl\u0131yorum',
        certifyTrueAndAccurateError: 'L\u00FCtfen bilgilerin do\u011Fru ve kesin oldu\u011Funu onaylay\u0131n.',
        isAuthorizedToUseBankAccount: 'Bu i\u015Fletme banka hesab\u0131n\u0131 i\u015F harcamalar\u0131 i\u00E7in kullanmaya yetkilendirildim.',
        isAuthorizedToUseBankAccountError: '\u0130\u015Fletme banka hesab\u0131n\u0131 i\u015Fletebilmek i\u00E7in yetkili bir denetim memuru olmal\u0131s\u0131n\u0131z.',
        termsAndConditions: '\u015Fartlar ve ko\u015Fullar',
    },
    connectBankAccountStep: {
        connectBankAccount: 'Banka hesab\u0131n\u0131 ba\u011Fla',
        finishButtonText: 'Kurulumu tamamla',
        validateYourBankAccount: 'Banka hesab\u0131n\u0131z\u0131 do\u011Frulay\u0131n',
        validateButtonText: 'Do\u011Frula',
        validationInputLabel: '\u0130\u015Flem',
        maxAttemptsReached:
            'Bu banka hesab\u0131 i\u00E7in do\u011Frulama, \u00E7ok fazla yanl\u0131\u015F deneme nedeniyle devre d\u0131\u015F\u0131 b\u0131rak\u0131lm\u0131\u015Ft\u0131r.',
        description: `Within 1-2 business days, we'll send three (3) small transactions to your bank account from a name like "Expensify, Inc. Validation".`,
        descriptionCTA: 'L\u00FCtfen her i\u015Flem tutar\u0131n\u0131 a\u015Fa\u011F\u0131daki alanlara girin. \u00D6rnek: 1.51.',
        reviewingInfo:
            'Te\u015Fekk\u00FCrler! Bilgilerinizi inceliyoruz ve k\u0131sa s\u00FCre i\u00E7inde sizinle ileti\u015Fime ge\u00E7ece\u011Fiz. L\u00FCtfen Concierge ile olan sohbetinizi kontrol edin.',
        forNextSteps: 'banka hesab\u0131n\u0131z\u0131n kurulumunu tamamlamak i\u00E7in bir sonraki ad\u0131mlar.',
        letsChatCTA: 'Evet, sohbet edelim',
        letsChatText:
            'Neredeyse oraday\u0131z! Sohbet \u00FCzerinden son birka\u00E7 bilgiyi do\u011Frulaman\u0131z i\u00E7in yard\u0131m\u0131n\u0131za ihtiyac\u0131m\u0131z var. Haz\u0131r m\u0131s\u0131n\u0131z?',
        letsChatTitle: 'Hadi sohbet edelim!',
        enable2FATitle: 'Doland\u0131r\u0131c\u0131l\u0131\u011F\u0131 \u00F6nleyin, iki fakt\u00F6rl\u00FC kimlik do\u011Frulamay\u0131 (2FA) etkinle\u015Ftirin',
        enable2FAText: "G\u00FCvenli\u011Finizi ciddiye al\u0131yoruz. L\u00FCtfen hesab\u0131n\u0131za ekstra bir koruma katman\u0131 eklemek i\u00E7in \u015Fimdi 2FA'y\u0131 kurun.",
        secureYourAccount: 'Hesab\u0131n\u0131z\u0131 g\u00FCvenceye al\u0131n',
    },
    countryStep: {
        confirmBusinessBank: '\u0130\u015F bankas\u0131 hesab\u0131n\u0131n para birimi ve \u00FClkesini onaylay\u0131n',
        confirmCurrency: 'Para birimi ve \u00FClkeyi onaylay\u0131n',
        yourBusiness: '\u0130\u015Fletme banka hesab\u0131n\u0131z\u0131n para birimi, \u00E7al\u0131\u015Fma alan\u0131n\u0131z\u0131n para birimiyle e\u015Fle\u015Fmelidir.',
        youCanChange: "\u00C7al\u0131\u015Fma alan\u0131 para biriminizi ${username} 'de de\u011Fi\u015Ftirebilirsiniz.",
        findCountry: '\u00DClke bul',
        selectCountry: '\u00DClke se\u00E7in',
    },
    bankInfoStep: {
        whatAreYour: '\u0130\u015Fletmenizin banka hesap detaylar\u0131 nedir?',
        letsDoubleCheck: 'Her \u015Feyin do\u011Fru g\u00F6r\u00FCnd\u00FC\u011F\u00FCn\u00FC tekrar kontrol edelim.',
        thisBankAccount: 'Bu banka hesab\u0131, \u00E7al\u0131\u015Fma alan\u0131n\u0131zdaki i\u015F \u00F6demeleri i\u00E7in kullan\u0131lacakt\u0131r.',
        accountNumber: 'Hesap numaras\u0131',
        bankStatement: 'Banka hesap \u00F6zeti',
        chooseFile: 'Dosya se\u00E7',
        uploadYourLatest: 'En son beyan\u0131n\u0131z\u0131 y\u00FCkleyin',
        pleaseUpload: ({lastFourDigits}: LastFourDigitsParams) =>
            `L\u00FCtfen i\u015Fletme banka hesab\u0131n\u0131z\u0131n son ${lastFourDigits} hanesi ile biten en son ayl\u0131k ekstrenizi y\u00FCkleyin.`,
    },
    signerInfoStep: {
        signerInfo: '\u0130mza bilgisi',
        areYouDirector: ({companyName}: CompanyNameParams) => `Are you a director or senior officer at ${companyName}?`,
        regulationRequiresUs:
            'D\u00FCzenleme, imzac\u0131n\u0131n bu i\u015Flemi i\u015Fletme ad\u0131na yapma yetkisine sahip olup olmad\u0131\u011F\u0131n\u0131 do\u011Frulamam\u0131z\u0131 gerektirir.',
        whatsYourName: 'Yasal ad\u0131n\u0131z nedir?',
        fullName: 'Yasal tam isim',
        whatsYourJobTitle: '\u0130\u015F unvan\u0131n\u0131z nedir?',
        jobTitle: '\u0130\u015F unvan\u0131',
        whatsYourDOB: 'Do\u011Fum tarihiniz nedir?',
        uploadID: 'Kimlik ve adres kan\u0131t\u0131n\u0131 y\u00FCkleyin',
        id: 'Kimlik (s\u00FCr\u00FCc\u00FC belgesi veya pasaport)',
        personalAddress: 'Ki\u015Fisel adres kan\u0131t\u0131 (\u00F6r. fatura)',
        letsDoubleCheck: 'Her \u015Feyin do\u011Fru g\u00F6r\u00FCnd\u00FC\u011F\u00FCn\u00FC iki kez kontrol edelim.',
        legalName: 'Yasal isim',
        proofOf: 'Ki\u015Fisel adres kan\u0131t\u0131',
        enterOneEmail: 'Direkt\u00F6r veya k\u0131demli yetkilinin e-postas\u0131n\u0131 girin',
        regulationRequiresOneMoreDirector: 'D\u00FCzenleme, bir imza sahibi olarak bir tane daha y\u00F6netici veya \u00FCst d\u00FCzey yetkili gerektirir.',
        hangTight: 'S\u0131k\u0131 dur...',
        enterTwoEmails: '\u0130ki m\u00FCd\u00FCr veya \u00FCst d\u00FCzey yetkilinin e-postalar\u0131n\u0131 girin',
        sendReminder: 'Bir hat\u0131rlat\u0131c\u0131 g\u00F6nder',
        chooseFile: 'Dosya se\u00E7',
        weAreWaiting: '\u0130\u015Fletmenin y\u00F6neticileri veya k\u0131demli yetkilileri olarak kimliklerini do\u011Frulamalar\u0131 i\u00E7in di\u011Ferlerini bekliyoruz.',
    },
    agreementsStep: {
        agreements: 'Anla\u015Fmalar',
        pleaseConfirm: 'L\u00FCtfen a\u015Fa\u011F\u0131daki anla\u015Fmalar\u0131 onaylay\u0131n',
        regulationRequiresUs: "D\u00FCzenlemeler, i\u015Fletmenin %25'inden fazlas\u0131na sahip olan her bireyin kimli\u011Fini do\u011Frulamam\u0131z\u0131 gerektirir.",
        iAmAuthorized: '\u0130\u015F harcamalar\u0131 i\u00E7in i\u015F banka hesab\u0131n\u0131 kullanmaya yetkilendirildim.',
        iCertify: 'Sa\u011Flad\u0131\u011F\u0131m bilgilerin do\u011Fru ve kesin oldu\u011Funu onaylar\u0131m.',
        termsAndConditions: '\u015Fartlar ve ko\u015Fullar.',
        accept: 'Banka hesab\u0131n\u0131 kabul et ve ekle',
        error: {
            authorized: '\u0130\u015Fletme banka hesab\u0131n\u0131 i\u015Fletebilmek i\u00E7in yetkili bir denetim memuru olmal\u0131s\u0131n\u0131z.',
            certify: 'L\u00FCtfen bilgilerin do\u011Fru ve kesin oldu\u011Funu onaylay\u0131n.',
        },
    },
    finishStep: {
        connect: 'Banka hesab\u0131n\u0131 ba\u011Fla',
        letsFinish: 'Hadi, sohbette bitirelim!',
        thanksFor:
            'Bu detaylar i\u00E7in te\u015Fekk\u00FCr ederiz. \u015Eimdi bir destek temsilcisi bilgilerinizi inceleyecek. E\u011Fer sizden ba\u015Fka bir \u015Feye ihtiyac\u0131m\u0131z olursa size d\u00F6nece\u011Fiz, ancak bu arada herhangi bir sorunuz olursa bize ula\u015Fmaktan \u00E7ekinmeyin.',
        iHaveA: 'Bir sorum var',
        enable2FA: 'Sahtecili\u011Fi \u00F6nlemek i\u00E7in iki fakt\u00F6rl\u00FC kimlik do\u011Frulamay\u0131 (2FA) etkinle\u015Ftirin',
        weTake: "G\u00FCvenli\u011Finizi ciddiye al\u0131yoruz. L\u00FCtfen hesab\u0131n\u0131za ekstra bir koruma katman\u0131 eklemek i\u00E7in \u015Fimdi 2FA'y\u0131 kurun.",
        secure: 'Hesab\u0131n\u0131z\u0131 g\u00FCvenceye al\u0131n',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: 'Bir an',
        explanationLine: 'Bilgilerinizi inceliyoruz. K\u0131sa s\u00FCre i\u00E7inde bir sonraki ad\u0131mlarla devam edebileceksiniz.',
    },
    session: {
        offlineMessageRetry:
            'G\u00F6r\u00FCn\u00FC\u015Fe g\u00F6re \u00E7evrimd\u0131\u015F\u0131s\u0131n\u0131z. L\u00FCtfen ba\u011Flant\u0131n\u0131z\u0131 kontrol edin ve tekrar deneyin.',
    },
    travel: {
        header: 'Seyahat ay\u0131rt',
        title: 'Ak\u0131ll\u0131ca seyahat et',
        subtitle: "Expensify Travel'\u0131 kullanarak en iyi seyahat tekliflerini al\u0131n ve t\u00FCm i\u015F giderlerinizi tek bir yerde y\u00F6netin.",
        features: {
            saveMoney: 'Rezervasyonlar\u0131n\u0131zda para tasarrufu yap\u0131n',
            alerts: 'Ger\u00E7ek zamanl\u0131 g\u00FCncellemeler ve uyar\u0131lar al\u0131n',
        },
        bookTravel: 'Seyahat ay\u0131rt',
        bookDemo: 'Demo kitab\u0131',
        bookADemo: 'Bir demo ay\u0131rt\u0131n',
        toLearnMore: 'daha fazla \u00F6\u011Frenmek i\u00E7in.',
        termsAndConditions: {
            header: 'Devam etmeden \u00F6nce...',
            title: 'L\u00FCtfen seyahat i\u00E7in \u015Eartlar & Ko\u015Fullar\u0131 okuyun',
            subtitle: '\u00C7al\u0131\u015Fma alan\u0131n\u0131zda seyahati etkinle\u015Ftirmek i\u00E7in bizimle anla\u015Fman\u0131z gerekmektedir.',
            termsconditions: '\u015Fartlar & ko\u015Fullar',
            travelTermsAndConditions: '\u015Fartlar & ko\u015Fullar',
            helpDocIntro:
                "Bu g\u00F6z at\u0131n ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki neyi temsil ettiklerini a\u00E7\u0131klar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
            helpDocOutro: 'Daha fazla bilgi i\u00E7in Concierge veya Hesap Y\u00F6neticinize ba\u015Fvurun.',
            helpDoc: 'Yard\u0131m Dok\u00FCman\u0131',
            agree: 'Seyahat etmeyi kabul ediyorum',
            error: 'Devam etmek i\u00E7in Seyahat \u015Eartlar\u0131 ve Ko\u015Fullar\u0131n\u0131 kabul etmelisiniz',
        },
        flight: 'U\u00E7u\u015F',
        flightDetails: {
            passenger: 'Yolcu',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>Bu u\u00E7u\u015Ftan \u00F6nce <strong>${layover} aktarma</strong>\u0131n\u0131z var</muted-text-label>`,
            takeOff: 'Kalk\u0131\u015F',
            landing: '\u0130ni\u015F',
            seat: 'Koltuk',
            class: 'Kabin S\u0131n\u0131f\u0131',
            recordLocator: 'Kay\u0131t konumland\u0131r\u0131c\u0131s\u0131',
        },
        hotel: 'Otel',
        hotelDetails: {
            guest: 'Misafir',
            checkIn: 'Giri\u015F yap',
            checkOut: '\u00C7\u0131k\u0131\u015F',
            roomType: 'Oda tipi',
            cancellation: '\u0130ptal politikas\u0131',
            cancellationUntil: '\u00DCcretsiz iptal hakk\u0131 s\u00FCresi',
            confirmation: 'Onay numaras\u0131',
            cancellationPolicies: {
                unknown: "You haven't provided any text to translate. Please provide the text you want translated.",
                nonRefundable: '\u0130adesi yap\u0131lamaz',
                freeCancellationUntil: '\u00DCcretsiz iptal hakk\u0131 s\u00FCresi',
                partiallyRefundable: 'K\u0131smen iade edilebilir',
            },
        },
        car: 'Araba',
        carDetails: {
            rentalCar: 'Ara\u00E7 kiralama',
            pickUp: 'Al\u0131\u015F',
            dropOff: 'B\u0131rakma',
            driver: 'S\u00FCr\u00FCc\u00FC',
            carType: 'Araba tipi',
            cancellation: '\u0130ptal politikas\u0131',
            cancellationUntil: '\u00DCcretsiz iptal hakk\u0131 s\u00FCresi',
            freeCancellation: '\u00DCcretsiz iptal',
            confirmation: 'Onay numaras\u0131',
        },
        train: 'Ray',
        trainDetails: {
            passenger: 'Yolcu',
            departs: 'Kalk\u0131\u015Flar',
            arrives: 'Var\u0131\u015F',
            coachNumber: 'Vagon numaras\u0131',
            seat: 'Koltuk',
            fareDetails: '\u00DCcret detaylar\u0131',
            confirmation: 'Onay numaras\u0131',
        },
        viewTrip: 'Geziyi g\u00F6r\u00FCnt\u00FCle',
        modifyTrip: 'Gezisi d\u00FCzenle',
        tripSupport: 'Gezi Destek',
        tripDetails: 'Gezi detaylar\u0131',
        viewTripDetails: 'Gezi detaylar\u0131n\u0131 g\u00F6r\u00FCnt\u00FCle',
        trip: 'Gezi',
        trips: 'Geziler',
        tripSummary: 'Gezi \u00F6zeti',
        departs: 'Kalk\u0131\u015Flar',
        errorMessage: 'Bir \u015Feyler yanl\u0131\u015F gitti. L\u00FCtfen daha sonra tekrar deneyin.',
        phoneError: 'Seyahat rezervasyonu yapmak i\u00E7in, varsay\u0131lan ileti\u015Fim y\u00F6nteminiz ge\u00E7erli bir e-posta olmal\u0131d\u0131r.',
        domainSelector: {
            title: 'Alan',
            subtitle: 'Expensify Travel kurulumu i\u00E7in bir alan ad\u0131 se\u00E7in.',
            recommended: '\u00D6nerilen',
        },
        domainPermissionInfo: {
            title: 'Alan',
            restrictionPrefix: `You don't have permission to enable Expensify Travel for the domain`,
            restrictionSuffix: `You'll need to ask someone from that domain to enable travel instead.`,
            accountantInvitationPrefix: `If you're an accountant, consider joining the`,
            accountantInvitationLink: `ExpensifyApproved! accountants program`,
            accountantInvitationSuffix: `to enable travel for this domain.`,
        },
        publicDomainError: {
            title: 'Expensify Travel ile ba\u015Flay\u0131n',
            message: `You'll need to use your work email (e.g., name@company.com) with Expensify Travel, not your personal email (e.g., name@gmail.com).`,
        },
    },
    workspace: {
        common: {
            card: 'Kartlar',
            expensifyCard: 'Expensify Kart\u0131',
            companyCards: '\u015Eirket kartlar\u0131',
            workflows: '\u0130\u015F Ak\u0131\u015Flar\u0131',
            workspace: '\u00C7al\u0131\u015Fma Alan\u0131',
            edit: '\u00C7al\u0131\u015Fma alan\u0131n\u0131 d\u00FCzenle',
            enabled: 'Etkin',
            disabled: 'Devre D\u0131\u015F\u0131',
            everyone: 'Herkes',
            delete: '\u00C7al\u0131\u015Fma alan\u0131n\u0131 sil',
            settings: 'Ayarlar',
            reimburse: 'Geri \u00D6demeler',
            categories: 'Kategoriler',
            tags: 'Etiketler',
            reportFields: 'Rapor alanlar\u0131',
            reportField: 'Rapor alan\u0131',
            taxes: 'Vergiler',
            bills: 'Faturalar',
            invoices: 'Faturalar',
            travel: 'Seyahat',
            members: '\u00DCyeler',
            accounting: 'Muhasebe',
            rules: 'Kurallar',
            displayedAs: 'G\u00F6r\u00FCnt\u00FClenir olarak',
            plan: "D\u00FCz bir dize ya da bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsillerini a\u00E7\u0131klar, ancak ternary ifadeler veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
            profile: 'Genel Bak\u0131\u015F',
            bankAccount: 'Banka hesab\u0131',
            connectBankAccount: 'Banka hesab\u0131n\u0131 ba\u011Fla',
            testTransactions: 'Test i\u015Flemleri',
            issueAndManageCards: 'Kartlar\u0131 d\u00FCzenle ve y\u00F6net',
            reconcileCards: 'Kartlar\u0131 uzla\u015Ft\u0131r\u0131n',
            selected: () => ({
                one: '1 se\u00E7ildi',
                other: (count: number) => `${count} selected`,
            }),
            settlementFrequency: '\u00D6deme s\u0131kl\u0131\u011F\u0131',
            setAsDefault: 'Varsay\u0131lan \u00E7al\u0131\u015Fma alan\u0131 olarak ayarla',
            defaultNote: `Receipts sent to ${CONST.EMAIL.RECEIPTS} will appear in this workspace.`,
            deleteConfirmation: 'Bu \u00E7al\u0131\u015Fma alan\u0131n\u0131 silmek istedi\u011Finizden emin misiniz?',
            deleteWithCardsConfirmation:
                'Bu \u00E7al\u0131\u015Fma alan\u0131n\u0131 silmek istedi\u011Finizden emin misiniz? Bu, t\u00FCm kart beslemelerini ve atanm\u0131\u015F kartlar\u0131 kald\u0131racakt\u0131r.',
            unavailable: 'Kullan\u0131lamayan \u00E7al\u0131\u015Fma alan\u0131',
            memberNotFound:
                '\u00DCye bulunamad\u0131. Yeni bir \u00FCyeyi \u00E7al\u0131\u015Fma alan\u0131na davet etmek i\u00E7in, l\u00FCtfen yukar\u0131daki davet butonunu kullan\u0131n.',
            notAuthorized: `Bu sayfaya eri\u015Fiminiz yok. E\u011Fer bu \u00E7al\u0131\u015Fma alan\u0131na kat\u0131lmaya \u00E7al\u0131\u015F\u0131yorsan\u0131z, sadece \u00E7al\u0131\u015Fma alan\u0131 sahibinden sizi bir \u00FCye olarak eklemesini isteyin. Ba\u015Fka bir \u015Fey mi? ${CONST.EMAIL.CONCIERGE} adresine ula\u015F\u0131n.`,
            goToRoom: ({roomName}: GoToRoomParams) => `Go to ${roomName} room`,
            goToWorkspace: '\u00C7al\u0131\u015Fma alan\u0131na gidin',
            goToWorkspaces: '\u00C7al\u0131\u015Fma alanlar\u0131na gidin',
            clearFilter: 'Filtreyi temizle',
            workspaceName: '\u00C7al\u0131\u015Fma alan\u0131 ad\u0131',
            workspaceOwner: 'Sahibi',
            workspaceType: '\u00C7al\u0131\u015Fma alan\u0131 t\u00FCr\u00FC',
            workspaceAvatar: '\u00C7al\u0131\u015Fma alan\u0131 avatar\u0131',
            mustBeOnlineToViewMembers: 'Bu \u00E7al\u0131\u015Fma alan\u0131ndaki \u00FCyeleri g\u00F6r\u00FCnt\u00FCleyebilmek i\u00E7in \u00E7evrimi\u00E7i olman\u0131z gerekmektedir.',
            moreFeatures: 'Daha fazla \u00F6zellik',
            requested:
                "translation:\n\n\u0130stenilen metin ya d\u00FCz bir dize ya da bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
            distanceRates: 'Mesafe oranlar\u0131',
            defaultDescription: 'T\u00FCm makbuzlar\u0131n\u0131z ve giderleriniz i\u00E7in tek bir yer.',
            welcomeNote: "L\u00FCtfen geri \u00F6deme i\u00E7in makbuzlar\u0131n\u0131z\u0131 Expensify'e g\u00F6nderin, te\u015Fekk\u00FCrler!",
            subscription: 'Abonelik',
            markAsExported: 'El ile girildi olarak i\u015Faretle',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `Export to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            letsDoubleCheck: 'Her \u015Feyin do\u011Fru g\u00F6r\u00FCnd\u00FC\u011F\u00FCn\u00FC iki kez kontrol edelim.',
            lineItemLevel: 'Sat\u0131r \u00F6\u011Fesi d\u00FCzeyi',
            reportLevel: 'Rapor seviyesi',
            topLevel: '\u00DCst seviye',
            appliedOnExport: "Expensify'e i\u00E7e aktar\u0131lmad\u0131, d\u0131\u015Fa aktar\u0131m s\u0131ras\u0131nda uyguland\u0131",
            shareNote: {
                header: '\u00C7al\u0131\u015Fma alan\u0131n\u0131z\u0131 di\u011Fer \u00FCyelerle payla\u015F\u0131n',
                content: {
                    firstPart:
                        'Bu QR kodunu payla\u015F\u0131n veya a\u015Fa\u011F\u0131daki ba\u011Flant\u0131y\u0131 kopyalay\u0131n, b\u00F6ylece \u00FCyelerin \u00E7al\u0131\u015Fma alan\u0131n\u0131za eri\u015Fim talep etmesi kolayla\u015F\u0131r. \u00C7al\u0131\u015Fma alan\u0131na kat\u0131lma taleplerinin t\u00FCm\u00FC',
                    secondPart: '\u0130ncelemeniz i\u00E7in oda.',
                },
            },
            createNewConnection: 'Yeni ba\u011Flant\u0131 olu\u015Ftur',
            reuseExistingConnection: 'Mevcut ba\u011Flant\u0131y\u0131 kullan\u0131n',
            existingConnections: 'Mevcut ba\u011Flant\u0131lar',
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - Last synced ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `Kimlik do\u011Frulama hatas\u0131 nedeniyle ${connectionName} ba\u011Flant\u0131s\u0131 kurulam\u0131yor.`,
            learnMore: 'Daha fazla \u00F6\u011Fren.',
            memberAlternateText: '\u00DCyeler rapor g\u00F6nderebilir ve onaylayabilir.',
            adminAlternateText: 'Y\u00F6neticilerin t\u00FCm raporlara ve \u00E7al\u0131\u015Fma alan\u0131 ayarlar\u0131na tam d\u00FCzenleme eri\u015Fimi vard\u0131r.',
            auditorAlternateText: 'Denet\u00E7iler raporlar\u0131 g\u00F6r\u00FCnt\u00FCleyebilir ve yorum yapabilir.',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return 'Y\u00F6netici';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return 'Denet\u00E7i';
                    case CONST.POLICY.ROLE.USER:
                        return '\u00DCye';
                    default:
                        return '\u00DCye';
                }
            },
            planType: 'Plan t\u00FCr\u00FC',
            submitExpense: 'A\u015Fa\u011F\u0131ya masraflar\u0131n\u0131z\u0131 g\u00F6nderin:',
            defaultCategory: 'Varsay\u0131lan kategori',
            viewTransactions: '\u0130\u015Flemleri g\u00F6r\u00FCnt\u00FCle',
        },
        perDiem: {
            subtitle: 'G\u00FCnl\u00FCk \u00E7al\u0131\u015Fan harcamalar\u0131n\u0131 kontrol etmek i\u00E7in g\u00FCnl\u00FCk \u00FCcret oranlar\u0131n\u0131 belirleyin.',
            amount: 'Miktar',
            deleteRates: () => ({
                one: 'Silme oran\u0131',
                other: 'Silme oranlar\u0131',
            }),
            deletePerDiemRate: 'G\u00FCnl\u00FCk \u00FCcreti sil',
            areYouSureDelete: () => ({
                one: 'Bu oran\u0131 silmek istedi\u011Finizden emin misiniz?',
                other: 'Bu oranlar\u0131 silmek istedi\u011Finizden emin misiniz?',
            }),
            emptyList: {
                title: 'G\u00FCnl\u00FCk',
                subtitle:
                    'G\u00FCnl\u00FCk \u00E7al\u0131\u015Fan harcamalar\u0131n\u0131 kontrol etmek i\u00E7in g\u00FCnl\u00FCk \u00FCcretleri belirleyin. Ba\u015Flamak i\u00E7in bir hesap tablosundan \u00FCcretleri i\u00E7e aktar\u0131n.',
            },
            errors: {
                existingRateError: ({rate}: CustomUnitRateParams) => `De\u011Ferinde bir oran ${rate} zaten var.`,
            },
            importPerDiemRates: 'G\u00FCnl\u00FCk \u00FCcret oranlar\u0131n\u0131 i\u00E7e aktar',
            editPerDiemRate: 'G\u00FCnl\u00FCk \u00FCcreti d\u00FCzenle',
            editPerDiemRates: 'G\u00FCnl\u00FCk \u00FCcretleri d\u00FCzenleyin',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `Bu hedefi g\u00FCncellemek, t\u00FCm ${destination} g\u00FCnl\u00FCk alt oranlar\u0131 i\u00E7in de\u011Fi\u015Ftirecektir.`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) =>
                `Bu para birimini g\u00FCncellemek, t\u00FCm ${destination} g\u00FCnl\u00FCk alt oranlar\u0131 i\u00E7in de\u011Fi\u015Ftirecektir.`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: "Cebinizden yap\u0131lan harcamalar\u0131n QuickBooks Desktop'a nas\u0131l aktar\u0131laca\u011F\u0131n\u0131 ayarlay\u0131n.",
            exportOutOfPocketExpensesCheckToogle: 'Mark\'\u0131 "daha sonra yazd\u0131r" olarak i\u015Faretle',
            exportDescription: "Expensify verilerinin QuickBooks Desktop'a nas\u0131l aktar\u0131ld\u0131\u011F\u0131n\u0131 yap\u0131land\u0131r\u0131n.",
            date: '\u0130hracat tarihi',
            exportInvoices: 'Faturalar\u0131 d\u0131\u015Fa aktar\u0131n',
            exportExpensifyCard: 'Expensify Card i\u015Flemlerini d\u0131\u015Fa aktar\u0131n',
            account: 'Hesap',
            accountDescription: 'G\u00FCnl\u00FCk giri\u015Flerini nereye g\u00F6ndermek istedi\u011Fini se\u00E7.',
            accountsPayable: '\u00D6denecek hesaplar',
            accountsPayableDescription: 'Tedarik\u00E7i faturalar\u0131n\u0131 olu\u015Fturulacak yeri se\u00E7in.',
            bankAccount: 'Banka hesab\u0131',
            notConfigured: 'Yap\u0131land\u0131r\u0131lmam\u0131\u015F',
            bankAccountDescription: '\u00C7eklerin nereye g\u00F6nderilece\u011Fini se\u00E7in.',
            creditCardAccount: 'Kredi kart\u0131 hesab\u0131',
            exportDate: {
                label: '\u0130hracat tarihi',
                description: "Bu tarihi, QuickBooks Desktop'a raporlar\u0131 d\u0131\u015Fa aktar\u0131rken kullan\u0131n.",
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Son harcaman\u0131n tarihi',
                        description: 'Rapor \u00FCzerindeki en son masraf\u0131n tarihi.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '\u0130hracat tarihi',
                        description: "Raporun QuickBooks Desktop'a aktar\u0131ld\u0131\u011F\u0131 tarih.",
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'G\u00F6nderim tarihi',
                        description: 'Raporun onay i\u00E7in sunuldu\u011Fu tarih.',
                    },
                },
            },
            exportCheckDescription:
                'Her bir Expensify raporu i\u00E7in detayl\u0131 bir \u00E7ek olu\u015Fturaca\u011F\u0131z ve bunu a\u015Fa\u011F\u0131daki banka hesab\u0131ndan g\u00F6nderece\u011Fiz.',
            exportJournalEntryDescription:
                'Her bir Expensify raporu i\u00E7in detayl\u0131 bir dergi giri\u015Fi olu\u015Fturaca\u011F\u0131z ve bunu a\u015Fa\u011F\u0131daki hesaba g\u00F6nderece\u011Fiz.',
            exportVendorBillDescription:
                "Her bir Expensify raporu i\u00E7in detayland\u0131r\u0131lm\u0131\u015F bir sat\u0131c\u0131 faturas\u0131 olu\u015Fturaca\u011F\u0131z ve bunu a\u015Fa\u011F\u0131daki hesaba ekleyece\u011Fiz. E\u011Fer bu d\u00F6nem kapal\u0131ysa, bir sonraki a\u00E7\u0131k d\u00F6nemin 1'ine g\u00F6nderece\u011Fiz.",
            deepDiveExpensifyCard: 'Expensify Card i\u015Flemleri, olu\u015Fturulan bir "Expensify Card Liability Account" a otomatik olarak aktar\u0131lacakt\u0131r.',
            deepDiveExpensifyCardIntegration: 'Bizim entegrasyonumuz.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop, dergi giri\u015Fi ihracatlar\u0131nda vergileri desteklememektedir. \u00C7al\u0131\u015Fma alan\u0131n\u0131zda vergileri etkinle\u015Ftirdi\u011Finiz i\u00E7in, bu ihracat se\u00E7ene\u011Fi kullan\u0131lamaz.',
            outOfPocketTaxEnabledError:
                'Vergiler etkinle\u015Ftirildi\u011Finde g\u00FCnl\u00FCk giri\u015Fler kullan\u0131lamaz. L\u00FCtfen farkl\u0131 bir d\u0131\u015Fa aktarma se\u00E7ene\u011Fi se\u00E7in.',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kredi kart\u0131',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Sat\u0131c\u0131 faturas\u0131',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'G\u00FCnl\u00FCk giri\u015Fi',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Kontrol et',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]:
                    'Her bir Expensify raporu i\u00E7in detayl\u0131 bir \u00E7ek olu\u015Fturaca\u011F\u0131z ve bunu a\u015Fa\u011F\u0131daki banka hesab\u0131ndan g\u00F6nderece\u011Fiz.',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Kredi kart\u0131 i\u015Flemi \u00FCzerindeki sat\u0131c\u0131 ad\u0131n\u0131 QuickBooks'taki herhangi bir kar\u015F\u0131l\u0131k gelen sat\u0131c\u0131yla otomatik olarak e\u015Fle\u015Ftirece\u011Fiz. E\u011Fer hi\u00E7 sat\u0131c\u0131 yoksa, ili\u015Fkilendirme i\u00E7in bir 'Kredi Kart\u0131 \u00C7e\u015Fitli' sat\u0131c\u0131 olu\u015Fturaca\u011F\u0131z.",
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "Her bir Expensify raporu i\u00E7in son masraf tarihi olan ayr\u0131nt\u0131l\u0131 bir sat\u0131c\u0131 faturas\u0131 olu\u015Fturaca\u011F\u0131z ve bunu a\u015Fa\u011F\u0131daki hesaba ekleyece\u011Fiz. E\u011Fer bu d\u00F6nem kapal\u0131ysa, bir sonraki a\u00E7\u0131k d\u00F6nemin 1'ine g\u00F6nderece\u011Fiz.",
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]:
                    'Kredi kart\u0131 i\u015Flemlerini nereye aktaraca\u011F\u0131n\u0131z\u0131 se\u00E7in.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]:
                    'T\u00FCm kredi kart\u0131 i\u015Flemlerine uygulanacak bir sat\u0131c\u0131 se\u00E7in.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '\u00C7eklerin nereye g\u00F6nderilece\u011Fini se\u00E7in.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Konumlar etkinle\u015Ftirildi\u011Finde sat\u0131c\u0131 faturalar\u0131 kullan\u0131lamaz. L\u00FCtfen farkl\u0131 bir d\u0131\u015Fa aktarma se\u00E7ene\u011Fi se\u00E7in.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Konumlar etkin oldu\u011Funda kontroller kullan\u0131lamaz. L\u00FCtfen farkl\u0131 bir d\u0131\u015Fa aktarma se\u00E7ene\u011Fi se\u00E7in.',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Vergiler etkinle\u015Ftirildi\u011Finde g\u00FCnl\u00FCk giri\u015Fler kullan\u0131lamaz. L\u00FCtfen farkl\u0131 bir d\u0131\u015Fa aktarma se\u00E7ene\u011Fi se\u00E7in.',
            },
            noAccountsFound: 'Hesap bulunamad\u0131',
            noAccountsFoundDescription: "QuickBooks Desktop'ta hesab\u0131 ekleyin ve ba\u011Flant\u0131y\u0131 tekrar senkronize edin.",
            qbdSetup: 'QuickBooks Masa\u00FCst\u00FC kurulumu',
            requiredSetupDevice: {
                title: 'Bu cihazdan ba\u011Flan\u0131lam\u0131yor',
                body1: 'QuickBooks Desktop \u015Firket dosyan\u0131z\u0131n bar\u0131nd\u0131r\u0131ld\u0131\u011F\u0131 bilgisayardan bu ba\u011Flant\u0131y\u0131 kurman\u0131z gerekecek.',
                body2: 'Bir kere ba\u011Fland\u0131\u011F\u0131n\u0131zda, her yerden senkronize edebilir ve d\u0131\u015Fa aktarabilirsiniz.',
            },
            setupPage: {
                title: 'Bu ba\u011Flant\u0131y\u0131 a\u00E7\u0131n',
                body: "Kurulumu tamamlamak i\u00E7in, QuickBooks Desktop'\u0131n \u00E7al\u0131\u015Ft\u0131\u011F\u0131 bilgisayarda a\u015Fa\u011F\u0131daki ba\u011Flant\u0131y\u0131 a\u00E7\u0131n.",
                setupErrorTitle: 'Bir \u015Feyler yanl\u0131\u015F gitti',
                setupErrorBody1: 'QuickBooks Desktop ba\u011Flant\u0131s\u0131 \u015Fu anda \u00E7al\u0131\u015Fm\u0131yor. L\u00FCtfen daha sonra tekrar deneyin veya',
                setupErrorBody2: 'E\u011Fer problem devam ederse.',
                setupErrorBodyContactConcierge: 'Concierge ile ileti\u015Fime ge\u00E7in',
            },
            importDescription: "QuickBooks Desktop'tan Expensify'ye hangi kodlama yap\u0131land\u0131rmalar\u0131n\u0131 i\u00E7e aktarmak istedi\u011Finizi se\u00E7in.",
            classes: 'S\u0131n\u0131flar',
            items: '\u00D6\u011Feler',
            customers: 'M\u00FC\u015Fteriler/projeler',
            exportCompanyCardsDescription: "QuickBooks Desktop'a \u015Firket kart\u0131 al\u0131mlar\u0131n\u0131n nas\u0131l aktar\u0131laca\u011F\u0131n\u0131 ayarlay\u0131n.",
            defaultVendorDescription: 'T\u00FCm kredi kart\u0131 i\u015Flemlerinde uygulanacak varsay\u0131lan bir sat\u0131c\u0131 belirleyin.',
            accountsDescription: "QuickBooks Desktop hesap tablonuz, Expensify'ye kategoriler olarak i\u00E7e aktar\u0131lacakt\u0131r.",
            accountsSwitchTitle: 'Yeni hesaplar\u0131 etkin veya devre d\u0131\u015F\u0131 kategoriler olarak i\u00E7e aktarmay\u0131 se\u00E7in.',
            accountsSwitchDescription: 'Etkin kategoriler, \u00FCyelerin masraflar\u0131n\u0131 olu\u015Ftururken se\u00E7meleri i\u00E7in kullan\u0131labilir olacak.',
            classesDescription: "Expensify'de QuickBooks Desktop s\u0131n\u0131flar\u0131n\u0131 nas\u0131l y\u00F6netece\u011Finizi se\u00E7in.",
            tagsDisplayedAsDescription: 'Sat\u0131r \u00F6\u011Fesi d\u00FCzeyi',
            reportFieldsDisplayedAsDescription: 'Rapor seviyesi',
            customersDescription: "Expensify'de QuickBooks Desktop m\u00FC\u015Fterileri/projelerini nas\u0131l y\u00F6netece\u011Finizi se\u00E7in.",
            advancedConfig: {
                autoSyncDescription: 'Expensify, her g\u00FCn otomatik olarak QuickBooks Desktop ile senkronize olacakt\u0131r.',
                createEntities: 'Otomatik olu\u015Fturulan varl\u0131klar',
                createEntitiesDescription:
                    "Expensify, e\u011Fer hali haz\u0131rda mevcut de\u011Fillerse QuickBooks Desktop'ta otomatik olarak sat\u0131c\u0131lar olu\u015Fturacakt\u0131r.",
            },
            itemsDescription: "Expensify'de QuickBooks Desktop \u00F6\u011Felerinin nas\u0131l ele al\u0131naca\u011F\u0131n\u0131 se\u00E7in.",
        },
        qbo: {
            importDescription: "QuickBooks Online'dan Expensify'ye hangi kodlama yap\u0131land\u0131rmalar\u0131n\u0131 i\u00E7e aktarmak istedi\u011Finizi se\u00E7in.",
            classes: 'S\u0131n\u0131flar',
            locations: 'Konumlar',
            customers: 'M\u00FC\u015Fteriler/projeler',
            accountsDescription: "QuickBooks Online hesap tablonuz, Expensify'ye kategoriler olarak i\u00E7e aktar\u0131lacakt\u0131r.",
            accountsSwitchTitle: 'Yeni hesaplar\u0131 etkin veya devre d\u0131\u015F\u0131 kategoriler olarak i\u00E7e aktarmay\u0131 se\u00E7in.',
            accountsSwitchDescription: 'Etkin kategoriler, \u00FCyelerin masraflar\u0131n\u0131 olu\u015Ftururken se\u00E7meleri i\u00E7in kullan\u0131labilir olacak.',
            classesDescription: "Expensify'de QuickBooks Online s\u0131n\u0131flar\u0131n\u0131 nas\u0131l y\u00F6netece\u011Finizi se\u00E7in.",
            customersDescription: "Expensify'de QuickBooks Online m\u00FC\u015Fterileri/projeleri nas\u0131l y\u00F6netece\u011Finizi se\u00E7in.",
            locationsDescription: "Expensify'deki QuickBooks Online konumlar\u0131n\u0131 nas\u0131l y\u00F6netece\u011Finizi se\u00E7in.",
            taxesDescription: "Expensify'de QuickBooks Online vergilerini nas\u0131l y\u00F6netece\u011Finizi se\u00E7in.",
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online, \u00C7ekler veya Sat\u0131c\u0131 Faturalar\u0131 i\u00E7in sat\u0131r d\u00FCzeyinde Konumlar\u0131 desteklememektedir. Sat\u0131r d\u00FCzeyinde konumlar\u0131 kullanmak isterseniz, Muhasebe Kay\u0131tlar\u0131n\u0131 ve Kredi/Banka Kart\u0131 giderlerini kulland\u0131\u011F\u0131n\u0131zdan emin olun.',
            taxesJournalEntrySwitchNote:
                'QuickBooks Online, dergi giri\u015Flerinde vergileri desteklememektedir. L\u00FCtfen ihracat se\u00E7ene\u011Finizi sat\u0131c\u0131 faturas\u0131 veya \u00E7ek olarak de\u011Fi\u015Ftirin.',
            exportDescription: "Expensify verilerinin QuickBooks Online'a nas\u0131l aktar\u0131ld\u0131\u011F\u0131n\u0131 yap\u0131land\u0131r\u0131n.",
            date: '\u0130hracat tarihi',
            exportInvoices: 'Faturalar\u0131 d\u0131\u015Fa aktar\u0131n',
            exportExpensifyCard: 'Expensify Card i\u015Flemlerini d\u0131\u015Fa aktar\u0131n',
            deepDiveExpensifyCard: 'Expensify Card i\u015Flemleri, olu\u015Fturulan bir "Expensify Card Liability Account" a otomatik olarak aktar\u0131lacakt\u0131r.',
            deepDiveExpensifyCardIntegration: 'Bizim entegrasyonumuz.',
            exportDate: {
                label: '\u0130hracat tarihi',
                description: "Bu tarihi, QuickBooks Online'a raporlar\u0131 d\u0131\u015Fa aktar\u0131rken kullan\u0131n.",
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Son harcaman\u0131n tarihi',
                        description: 'Rapor \u00FCzerindeki en son masraf\u0131n tarihi.',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '\u0130hracat tarihi',
                        description: "Raporun QuickBooks Online'a aktar\u0131ld\u0131\u011F\u0131 tarih.",
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'G\u00F6nderim tarihi',
                        description: 'Raporun onay i\u00E7in sunuldu\u011Fu tarih.',
                    },
                },
            },
            receivable: 'Alacak hesaplar\u0131', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: 'Alacaklar ar\u015Fivi', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: "Faturalar\u0131 QuickBooks Online'a aktar\u0131rken bu hesab\u0131 kullan\u0131n.",
            exportCompanyCardsDescription: "\u015Eirket kart\u0131 al\u0131mlar\u0131n\u0131n QuickBooks Online'a nas\u0131l aktar\u0131laca\u011F\u0131n\u0131 ayarlay\u0131n.",
            vendor: 'Sat\u0131c\u0131',
            defaultVendorDescription: 'T\u00FCm kredi kart\u0131 i\u015Flemlerinde uygulanacak varsay\u0131lan bir sat\u0131c\u0131 belirleyin.',
            exportOutOfPocketExpensesDescription: "QuickBooks Online'a cebinizden yap\u0131lan harcamalar\u0131n nas\u0131l aktar\u0131laca\u011F\u0131n\u0131 ayarlay\u0131n.",
            exportCheckDescription:
                'Her bir Expensify raporu i\u00E7in detayl\u0131 bir \u00E7ek olu\u015Fturaca\u011F\u0131z ve bunu a\u015Fa\u011F\u0131daki banka hesab\u0131ndan g\u00F6nderece\u011Fiz.',
            exportJournalEntryDescription:
                'Her bir Expensify raporu i\u00E7in detayl\u0131 bir dergi giri\u015Fi olu\u015Fturaca\u011F\u0131z ve bunu a\u015Fa\u011F\u0131daki hesaba g\u00F6nderece\u011Fiz.',
            exportVendorBillDescription:
                "Her bir Expensify raporu i\u00E7in detayland\u0131r\u0131lm\u0131\u015F bir sat\u0131c\u0131 faturas\u0131 olu\u015Fturaca\u011F\u0131z ve bunu a\u015Fa\u011F\u0131daki hesaba ekleyece\u011Fiz. E\u011Fer bu d\u00F6nem kapal\u0131ysa, bir sonraki a\u00E7\u0131k d\u00F6nemin 1'ine g\u00F6nderece\u011Fiz.",
            account: 'Hesap',
            accountDescription: 'G\u00FCnl\u00FCk giri\u015Flerini nereye g\u00F6ndermek istedi\u011Fini se\u00E7.',
            accountsPayable: '\u00D6denecek hesaplar',
            accountsPayableDescription: 'Tedarik\u00E7i faturalar\u0131n\u0131 olu\u015Fturulacak yeri se\u00E7in.',
            bankAccount: 'Banka hesab\u0131',
            notConfigured: 'Yap\u0131land\u0131r\u0131lmam\u0131\u015F',
            bankAccountDescription: '\u00C7eklerin nereye g\u00F6nderilece\u011Fini se\u00E7in.',
            creditCardAccount: 'Kredi kart\u0131 hesab\u0131',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online, tedarik\u00E7i fatura ihracatlar\u0131nda konumlar\u0131 desteklememektedir. \u00C7al\u0131\u015Fma alan\u0131n\u0131zda konumlar etkinle\u015Ftirildi\u011Finden, bu ihracat se\u00E7ene\u011Fi kullan\u0131lamaz.',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online, dergi giri\u015Fi ihracatlar\u0131nda vergileri desteklememektedir. \u00C7al\u0131\u015Fma alan\u0131n\u0131zda vergileri etkinle\u015Ftirdi\u011Finiz i\u00E7in, bu ihracat se\u00E7ene\u011Fi kullan\u0131lamaz.',
            outOfPocketTaxEnabledError:
                'Vergiler etkinle\u015Ftirildi\u011Finde g\u00FCnl\u00FCk giri\u015Fler kullan\u0131lamaz. L\u00FCtfen farkl\u0131 bir d\u0131\u015Fa aktarma se\u00E7ene\u011Fi se\u00E7in.',
            advancedConfig: {
                autoSyncDescription: 'Expensify, her g\u00FCn otomatik olarak QuickBooks Online ile senkronize olacakt\u0131r.',
                inviteEmployees: '\u00C7al\u0131\u015Fanlar\u0131 davet et',
                inviteEmployeesDescription:
                    'QuickBooks Online \u00E7al\u0131\u015Fan kay\u0131tlar\u0131n\u0131 i\u00E7e aktar\u0131n ve \u00E7al\u0131\u015Fanlar\u0131 bu \u00E7al\u0131\u015Fma alan\u0131na davet edin.',
                createEntities: 'Otomatik olu\u015Fturulan varl\u0131klar',
                createEntitiesDescription:
                    "Expensify, QuickBooks Online'da zaten var olmayan sat\u0131c\u0131lar\u0131 otomatik olarak olu\u015Fturacak ve faturalar\u0131 d\u0131\u015Fa aktar\u0131rken m\u00FC\u015Fterileri otomatik olarak olu\u015Fturacakt\u0131r.",
                reimbursedReportsDescription:
                    'Bir rapor Expensify ACH kullan\u0131larak \u00F6dendi\u011Finde, kar\u015F\u0131l\u0131k gelen fatura \u00F6demesi a\u015Fa\u011F\u0131daki QuickBooks Online hesab\u0131nda olu\u015Fturulur.',
                qboBillPaymentAccount: 'QuickBooks fatura \u00F6deme hesab\u0131',
                qboInvoiceCollectionAccount: 'QuickBooks fatura tahsilat hesab\u0131',
                accountSelectDescription: "Faturalar\u0131 \u00F6deyece\u011Finiz yeri se\u00E7in ve biz QuickBooks Online'da \u00F6demeyi olu\u015Fturaca\u011F\u0131z.",
                invoiceAccountSelectorDescription: "Fatura \u00F6demelerini almak istedi\u011Finiz yeri se\u00E7in ve biz QuickBooks Online'da \u00F6demeyi olu\u015Fturaca\u011F\u0131z.",
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'Banka kart\u0131',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'Kredi kart\u0131',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'Sat\u0131c\u0131 faturas\u0131',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: 'G\u00FCnl\u00FCk giri\u015Fi',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'Kontrol et',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    "Biz otomatik olarak banka kart\u0131 i\u015Flemi \u00FCzerindeki sat\u0131c\u0131 ad\u0131n\u0131 QuickBooks'taki herhangi bir kar\u015F\u0131l\u0131k gelen sat\u0131c\u0131yla e\u015Fle\u015Ftirece\u011Fiz. E\u011Fer hi\u00E7 sat\u0131c\u0131 yoksa, ili\u015Fkilendirme i\u00E7in 'Debit Card Misc.' ad\u0131nda bir sat\u0131c\u0131 olu\u015Fturaca\u011F\u0131z.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    "Kredi kart\u0131 i\u015Flemi \u00FCzerindeki sat\u0131c\u0131 ad\u0131n\u0131 QuickBooks'taki herhangi bir kar\u015F\u0131l\u0131k gelen sat\u0131c\u0131yla otomatik olarak e\u015Fle\u015Ftirece\u011Fiz. E\u011Fer hi\u00E7 sat\u0131c\u0131 yoksa, ili\u015Fkilendirme i\u00E7in bir 'Kredi Kart\u0131 \u00C7e\u015Fitli' sat\u0131c\u0131 olu\u015Fturaca\u011F\u0131z.",
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    "Her bir Expensify raporu i\u00E7in son masraf tarihi olan ayr\u0131nt\u0131l\u0131 bir sat\u0131c\u0131 faturas\u0131 olu\u015Fturaca\u011F\u0131z ve bunu a\u015Fa\u011F\u0131daki hesaba ekleyece\u011Fiz. E\u011Fer bu d\u00F6nem kapal\u0131ysa, bir sonraki a\u00E7\u0131k d\u00F6nemin 1'ine g\u00F6nderece\u011Fiz.",
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]:
                    'Debit kart\u0131 i\u015Flemlerinin d\u0131\u015Fa aktar\u0131laca\u011F\u0131 yeri se\u00E7in.',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]:
                    'Kredi kart\u0131 i\u015Flemlerini nereye aktaraca\u011F\u0131n\u0131z\u0131 se\u00E7in.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'T\u00FCm kredi kart\u0131 i\u015Flemlerine uygulanacak bir sat\u0131c\u0131 se\u00E7in.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'Konumlar etkinle\u015Ftirildi\u011Finde sat\u0131c\u0131 faturalar\u0131 kullan\u0131lamaz. L\u00FCtfen farkl\u0131 bir d\u0131\u015Fa aktarma se\u00E7ene\u011Fi se\u00E7in.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'Konumlar etkin oldu\u011Funda kontroller kullan\u0131lamaz. L\u00FCtfen farkl\u0131 bir d\u0131\u015Fa aktarma se\u00E7ene\u011Fi se\u00E7in.',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    'Vergiler etkinle\u015Ftirildi\u011Finde g\u00FCnl\u00FCk giri\u015Fler kullan\u0131lamaz. L\u00FCtfen farkl\u0131 bir d\u0131\u015Fa aktarma se\u00E7ene\u011Fi se\u00E7in.',
            },
            noAccountsFound: 'Hesap bulunamad\u0131',
            noAccountsFoundDescription: "QuickBooks Online'da hesab\u0131 ekleyin ve ba\u011Flant\u0131y\u0131 tekrar senkronize edin.",
        },
        workspaceList: {
            joinNow: '\u015Eimdi kat\u0131l',
            askToJoin: 'Kat\u0131lmak i\u00E7in sor',
        },
        xero: {
            organization: 'Xero organizasyonu',
            organizationDescription: 'Verileri i\u00E7e aktarmak istedi\u011Finiz Xero organizasyonunu se\u00E7in.',
            importDescription: "Xero'dan Expensify'ye hangi kodlama yap\u0131land\u0131rmalar\u0131n\u0131 i\u00E7e aktarmak istedi\u011Finizi se\u00E7in.",
            accountsDescription: "Xero hesap tablonuz, Expensify'ye kategoriler olarak i\u00E7e aktar\u0131lacak.",
            accountsSwitchTitle: 'Yeni hesaplar\u0131 etkin veya devre d\u0131\u015F\u0131 kategoriler olarak i\u00E7e aktarmay\u0131 se\u00E7in.',
            accountsSwitchDescription: 'Etkin kategoriler, \u00FCyelerin masraflar\u0131n\u0131 olu\u015Ftururken se\u00E7meleri i\u00E7in kullan\u0131labilir olacak.',
            trackingCategories: 'Takip kategorileri',
            trackingCategoriesDescription: "Expensify'deki Xero izleme kategorilerini nas\u0131l y\u00F6netece\u011Finizi se\u00E7in.",
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Xero ${categoryName}'i e\u015Fle\u015Ftirin`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Xero'ya d\u0131\u015Fa aktar\u0131rken ${categoryName} 'i nereye e\u015Fleyece\u011Finizi se\u00E7in.`,
            customers: 'M\u00FC\u015Fterileri yeniden faturaland\u0131r\u0131n',
            customersDescription:
                "Expensify'de m\u00FC\u015Fterileri yeniden faturaland\u0131rma se\u00E7ene\u011Fini belirleyin. Xero m\u00FC\u015Fteri ki\u015Fileriniz giderlere etiketlenebilir ve bir sat\u0131\u015F faturas\u0131 olarak Xero'ya aktar\u0131l\u0131r.",
            taxesDescription: "Expensify'de Xero vergilerini nas\u0131l y\u00F6netece\u011Finizi se\u00E7in.",
            notImported: '\u0130\u00E7e aktar\u0131lmad\u0131',
            notConfigured: 'Yap\u0131land\u0131r\u0131lmam\u0131\u015F',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero varsay\u0131lan ileti\u015Fim',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'Etiketler',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'Rapor alanlar\u0131',
            },
            exportDescription: "Expensify verilerinin Xero'ya nas\u0131l aktar\u0131laca\u011F\u0131n\u0131 yap\u0131land\u0131r\u0131n.",
            purchaseBill: 'Sat\u0131n alma faturas\u0131',
            exportDeepDiveCompanyCard:
                'D\u0131\u015Fa aktar\u0131lan giderler, a\u015Fa\u011F\u0131daki Xero banka hesab\u0131na banka i\u015Flemleri olarak kaydedilecek ve i\u015Flem tarihleri banka ekstrenizdeki tarihlerle e\u015Fle\u015Fecektir.',
            bankTransactions: 'Banka i\u015Flemleri',
            xeroBankAccount: 'Xero banka hesab\u0131',
            xeroBankAccountDescription: 'Harcamalar\u0131n banka i\u015Flemleri olarak nerede g\u00F6nderilece\u011Fini se\u00E7in.',
            exportExpensesDescription:
                'Raporlar, a\u015Fa\u011F\u0131da se\u00E7ilen tarih ve durumla birlikte bir sat\u0131n alma faturas\u0131 olarak d\u0131\u015Fa aktar\u0131lacakt\u0131r.',
            purchaseBillDate: 'Sat\u0131n alma fatura tarihi',
            exportInvoices: 'Faturalar\u0131 d\u0131\u015Fa aktar olarak',
            salesInvoice: 'Sat\u0131\u015F faturas\u0131',
            exportInvoicesDescription: 'Sat\u0131\u015F faturalar\u0131 her zaman faturan\u0131n g\u00F6nderildi\u011Fi tarihi g\u00F6sterir.',
            advancedConfig: {
                autoSyncDescription: 'Expensify her g\u00FCn otomatik olarak Xero ile senkronize olacakt\u0131r.',
                purchaseBillStatusTitle: 'Sat\u0131n alma faturas\u0131 durumu',
                reimbursedReportsDescription:
                    'Herhangi bir rapor Expensify ACH kullan\u0131larak \u00F6dendi\u011Finde, kar\u015F\u0131l\u0131k gelen fatura \u00F6demesi a\u015Fa\u011F\u0131daki Xero hesab\u0131nda olu\u015Fturulur.',
                xeroBillPaymentAccount: 'Xero fatura \u00F6deme hesab\u0131',
                xeroInvoiceCollectionAccount: 'Xero fatura tahsilat hesab\u0131',
                xeroBillPaymentAccountDescription: "Faturalar\u0131 \u00F6deyece\u011Finiz yeri se\u00E7in ve biz Xero'da \u00F6demeyi olu\u015Fturaca\u011F\u0131z.",
                invoiceAccountSelectorDescription: "Fatura \u00F6demelerini almak istedi\u011Finiz yeri se\u00E7in ve biz Xero'da \u00F6demeyi olu\u015Fturaca\u011F\u0131z.",
            },
            exportDate: {
                label: 'Sat\u0131n alma fatura tarihi',
                description: "Bu tarihi, raporlar\u0131 Xero'ya aktar\u0131rken kullan\u0131n.",
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Son harcaman\u0131n tarihi',
                        description: 'Rapor \u00FCzerindeki en son masraf\u0131n tarihi.',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: '\u0130hracat tarihi',
                        description: "Raporun Xero'ya aktar\u0131ld\u0131\u011F\u0131 tarih.",
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: 'G\u00F6nderim tarihi',
                        description: 'Raporun onay i\u00E7in sunuldu\u011Fu tarih.',
                    },
                },
            },
            invoiceStatus: {
                label: 'Sat\u0131n alma faturas\u0131 durumu',
                description: "Bu durumu, sat\u0131n alma faturalar\u0131n\u0131 Xero'ya aktar\u0131rken kullan\u0131n.",
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: "You didn't provide any text to translate. Please provide the text you want to translate.",
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: 'Onay bekleniyor',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '\u00D6deme bekleniyor',
                },
            },
            noAccountsFound: 'Hesap bulunamad\u0131',
            noAccountsFoundDescription: "L\u00FCtfen Xero'da hesab\u0131 ekleyin ve ba\u011Flant\u0131y\u0131 tekrar senkronize edin.",
        },
        sageIntacct: {
            preferredExporter: 'Tercih edilen ihracat\u00E7\u0131',
            notConfigured: 'Yap\u0131land\u0131r\u0131lmam\u0131\u015F',
            exportDate: {
                label: '\u0130hracat tarihi',
                description: "Bu tarihi, raporlar\u0131 Sage Intacct'a aktar\u0131rken kullan\u0131n.",
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Son harcaman\u0131n tarihi',
                        description: 'Rapor \u00FCzerindeki en son masraf\u0131n tarihi.',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: '\u0130hracat tarihi',
                        description: "Raporun Sage Intacct'a aktar\u0131ld\u0131\u011F\u0131 tarih.",
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: 'G\u00F6nderim tarihi',
                        description: 'Raporun onay i\u00E7in sunuldu\u011Fu tarih.',
                    },
                },
            },
            reimbursableExpenses: {
                description: "Sage Intacct'a cebri masraflar\u0131n nas\u0131l d\u0131\u015Fa aktar\u0131laca\u011F\u0131n\u0131 ayarlay\u0131n.",
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: 'Gider raporlar\u0131',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Sat\u0131c\u0131 faturalar\u0131',
                },
            },
            nonReimbursableExpenses: {
                description: "Sage Intacct'a \u015Firket kart\u0131 al\u0131mlar\u0131n\u0131n nas\u0131l d\u0131\u015Fa aktar\u0131laca\u011F\u0131n\u0131 ayarlay\u0131n.",
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'Kredi kartlar\u0131',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: 'Sat\u0131c\u0131 faturalar\u0131',
                },
            },
            creditCardAccount: 'Kredi kart\u0131 hesab\u0131',
            defaultVendor: 'Varsay\u0131lan sat\u0131c\u0131',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Sage Intacct'ta e\u015Fle\u015Fen bir sat\u0131c\u0131 olmayan ${
                    isReimbursable ? '' : 'geri ödenmeyen'
                } giderlere uygulanacak varsay\u0131lan bir sat\u0131c\u0131 belirleyin.`,
            exportDescription: "Expensify veri ihracat\u0131n\u0131n Sage Intacct'a nas\u0131l yap\u0131land\u0131r\u0131laca\u011F\u0131n\u0131 ayarlay\u0131n.",
            exportPreferredExporterNote:
                "Tercih edilen ihracat\u00E7\u0131 herhangi bir \u00E7al\u0131\u015Fma alan\u0131 y\u00F6neticisi olabilir, ancak Alan Ayarlar\u0131'nda bireysel \u015Firket kartlar\u0131 i\u00E7in farkl\u0131 ihracat hesaplar\u0131 ayarlarsan\u0131z ayn\u0131 zamanda bir Alan Y\u00F6neticisi de olmal\u0131d\u0131r.",
            exportPreferredExporterSubNote:
                'Bir kere ayarland\u0131\u011F\u0131nda, tercih edilen ihracat\u00E7\u0131 raporlar\u0131 kendi hesaplar\u0131nda ihracat i\u00E7in g\u00F6recektir.',
            noAccountsFound: 'Hesap bulunamad\u0131',
            noAccountsFoundDescription: `Please add the account in Sage Intacct and sync the connection again.`,
            autoSync: 'Oto-senkronizasyon',
            autoSyncDescription: 'Expensify, her g\u00FCn otomatik olarak Sage Intacct ile senkronize olacakt\u0131r.',
            inviteEmployees: '\u00C7al\u0131\u015Fanlar\u0131 davet et',
            inviteEmployeesDescription:
                'Sage Intacct \u00E7al\u0131\u015Fan kay\u0131tlar\u0131n\u0131 i\u00E7e aktar\u0131n ve \u00E7al\u0131\u015Fanlar\u0131 bu \u00E7al\u0131\u015Fma alan\u0131na davet edin. Onay ak\u0131\u015F\u0131n\u0131z varsay\u0131lan olarak y\u00F6netici onay\u0131na ayarlanacak ve \u00DCyeler sayfas\u0131nda daha da yap\u0131land\u0131r\u0131labilir.',
            syncReimbursedReports: 'Senkronize edilmi\u015F raporlar\u0131 geri \u00F6de',
            syncReimbursedReportsDescription:
                'Herhangi bir rapor Expensify ACH kullan\u0131larak \u00F6dendi\u011Finde, kar\u015F\u0131l\u0131k gelen fatura \u00F6demesi a\u015Fa\u011F\u0131daki Sage Intacct hesab\u0131nda olu\u015Fturulacakt\u0131r.',
            paymentAccount: 'Sage Intacct \u00F6deme hesab\u0131',
        },
        netsuite: {
            subsidiary: 'Ba\u011Fl\u0131 Ortakl\u0131k',
            subsidiarySelectDescription: "NetSuite'te veri almak istedi\u011Finiz ba\u011Fl\u0131 \u015Firketi se\u00E7in.",
            exportDescription: "Expensify verilerinin NetSuite'e nas\u0131l aktar\u0131ld\u0131\u011F\u0131n\u0131 yap\u0131land\u0131r\u0131n.",
            exportInvoices: 'Faturalar\u0131 d\u0131\u015Fa aktar\u0131n',
            journalEntriesTaxPostingAccount: 'Dergi giri\u015Fleri vergi kayd\u0131 hesab\u0131',
            journalEntriesProvTaxPostingAccount: 'G\u00FCnl\u00FCk giri\u015Fler il vergisi kay\u0131t hesab\u0131',
            foreignCurrencyAmount: 'Yabanc\u0131 para miktar\u0131n\u0131 d\u0131\u015Fa aktar',
            exportToNextOpenPeriod: 'Sonraki a\u00E7\u0131k d\u00F6neme d\u0131\u015Fa aktar',
            nonReimbursableJournalPostingAccount: 'Geri \u00F6demesiz dergi g\u00F6nderme hesab\u0131',
            reimbursableJournalPostingAccount: 'Geri \u00F6denebilir dergi g\u00F6nderme hesab\u0131',
            journalPostingPreference: {
                label: 'Dergi giri\u015Fleri g\u00F6nderme tercihi',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: 'Her rapor i\u00E7in tekil, detayland\u0131r\u0131lm\u0131\u015F giri\u015F',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: 'Her bir gider i\u00E7in tek bir giri\u015F',
                },
            },
            invoiceItem: {
                label: 'Fatura kalemi',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: 'Benim i\u00E7in bir tane olu\u015Ftur',
                        description: '\u0130hracat s\u0131ras\u0131nda sizin i\u00E7in bir "Expensify fatura kalemi" olu\u015Fturaca\u011F\u0131z (e\u011Fer zaten mevcut de\u011Filse).',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: 'Mevcut olan\u0131 se\u00E7in',
                        description: "A\u015Fa\u011F\u0131da se\u00E7ilen \u00F6\u011Feye Expensify'den faturalar\u0131 ba\u011Flayaca\u011F\u0131z.",
                    },
                },
            },
            exportDate: {
                label: '\u0130hracat tarihi',
                description: "Bu tarihi, raporlar\u0131 NetSuite'e aktar\u0131rken kullan\u0131n.",
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: 'Son harcaman\u0131n tarihi',
                        description: 'Rapor \u00FCzerindeki en son masraf\u0131n tarihi.',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: '\u0130hracat tarihi',
                        description: "Raporun NetSuite'e aktar\u0131ld\u0131\u011F\u0131 tarih.",
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: 'G\u00F6nderim tarihi',
                        description: 'Raporun onay i\u00E7in sunuldu\u011Fu tarih.',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: 'Gider raporlar\u0131',
                        reimbursableDescription: "Cebri masraflar, NetSuite'e masraf raporlar\u0131 olarak d\u0131\u015Fa aktar\u0131lacakt\u0131r.",
                        nonReimbursableDescription: "\u015Eirket kart\u0131 giderleri, NetSuite'e masraf raporlar\u0131 olarak d\u0131\u015Fa aktar\u0131lacak.",
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: 'Sat\u0131c\u0131 faturalar\u0131',
                        reimbursableDescription:
                            'Cebri masraflar, a\u015Fa\u011F\u0131da belirtilen NetSuite sat\u0131c\u0131s\u0131na \u00F6denecek faturalar olarak d\u0131\u015Fa aktar\u0131lacakt\u0131r.' +
                            '\n' +
                            "Her kart i\u00E7in belirli bir sat\u0131c\u0131 ayarlamak isterseniz, *Ayarlar > Alanlar > \u015Eirket Kartlar\u0131*'na gidin.",
                        nonReimbursableDescription:
                            '\u015Eirket kart\u0131 harcamalar\u0131, a\u015Fa\u011F\u0131da belirtilen NetSuite sat\u0131c\u0131s\u0131na \u00F6denecek faturalar olarak d\u0131\u015Fa aktar\u0131lacakt\u0131r.' +
                            '\n' +
                            "Her kart i\u00E7in belirli bir sat\u0131c\u0131 ayarlamak isterseniz, *Ayarlar > Alanlar > \u015Eirket Kartlar\u0131*'na gidin.",
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: 'G\u00FCnl\u00FCk giri\u015Fleri',
                        reimbursableDescription:
                            'Cebri masraflar, a\u015Fa\u011F\u0131da belirtilen NetSuite hesab\u0131na dergi giri\u015Fleri olarak d\u0131\u015Fa aktar\u0131lacakt\u0131r.' +
                            '\n' +
                            "Her kart i\u00E7in belirli bir sat\u0131c\u0131 ayarlamak isterseniz, *Ayarlar > Alanlar > \u015Eirket Kartlar\u0131*'na gidin.",
                        nonReimbursableDescription:
                            '\u015Eirket kart\u0131 giderleri, a\u015Fa\u011F\u0131da belirtilen NetSuite hesab\u0131na dergi giri\u015Fleri olarak d\u0131\u015Fa aktar\u0131lacakt\u0131r.' +
                            '\n' +
                            "Her kart i\u00E7in belirli bir sat\u0131c\u0131 ayarlamak isterseniz, *Ayarlar > Alanlar > \u015Eirket Kartlar\u0131*'na gidin.",
                    },
                },
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify, her g\u00FCn otomatik olarak NetSuite ile senkronize olacakt\u0131r.',
                reimbursedReportsDescription:
                    'Herhangi bir rapor Expensify ACH kullan\u0131larak \u00F6dendi\u011Finde, kar\u015F\u0131l\u0131k gelen fatura \u00F6demesi a\u015Fa\u011F\u0131daki NetSuite hesab\u0131nda olu\u015Fturulacakt\u0131r.',
                reimbursementsAccount: 'Geri \u00F6demeler hesab\u0131',
                reimbursementsAccountDescription:
                    "Geri \u00F6demeler i\u00E7in kullanaca\u011F\u0131n\u0131z banka hesab\u0131n\u0131 se\u00E7in ve biz NetSuite'te ili\u015Fkili \u00F6demeyi olu\u015Fturaca\u011F\u0131z.",
                collectionsAccount: 'Koleksiyonlar hesab\u0131',
                collectionsAccountDescription:
                    "Bir fatura Expensify'de \u00F6denmi\u015F olarak i\u015Faretlendi\u011Finde ve NetSuite'e aktar\u0131ld\u0131\u011F\u0131nda, a\u015Fa\u011F\u0131daki hesaba kar\u015F\u0131 g\u00F6r\u00FCnecektir.",
                approvalAccount: 'A/P onay hesab\u0131',
                approvalAccountDescription:
                    "NetSuite'te i\u015Flemlerin onaylanaca\u011F\u0131 hesab\u0131 se\u00E7in. E\u011Fer geri \u00F6deme raporlar\u0131n\u0131 senkronize ediyorsan\u0131z, bu ayn\u0131 zamanda fatura \u00F6demelerinin olu\u015Fturulaca\u011F\u0131 hesapt\u0131r.",
                defaultApprovalAccount: 'NetSuite varsay\u0131lan',
                inviteEmployees: '\u00C7al\u0131\u015Fanlar\u0131 davet edin ve onaylar\u0131 ayarlay\u0131n',
                inviteEmployeesDescription:
                    'NetSuite \u00E7al\u0131\u015Fan kay\u0131tlar\u0131n\u0131 i\u00E7e aktar\u0131n ve \u00E7al\u0131\u015Fanlar\u0131 bu \u00E7al\u0131\u015Fma alan\u0131na davet edin. Onay ak\u0131\u015F\u0131n\u0131z varsay\u0131lan olarak y\u00F6netici onay\u0131na ayarlanacak ve *\u00DCyeler* sayfas\u0131nda daha da yap\u0131land\u0131r\u0131labilir.',
                autoCreateEntities: 'Otomatik olu\u015Ftur \u00E7al\u0131\u015Fanlar/tedarik\u00E7iler',
                enableCategories: 'Yeni i\u00E7e aktar\u0131lan kategorileri etkinle\u015Ftir',
                customFormID: '\u00D6zel form ID',
                customFormIDDescription:
                    "Varsay\u0131lan olarak, Expensify, NetSuite'te ayarlanan tercih edilen i\u015Flem formunu kullanarak giri\u015Fler olu\u015Fturacakt\u0131r. Alternatif olarak, kullan\u0131lacak belirli bir i\u015Flem formu belirleyebilirsiniz.",
                customFormIDReimbursable: 'Cebinden \u00F6deme',
                customFormIDNonReimbursable: '\u015Eirket kart\u0131 harcamas\u0131',
                exportReportsTo: {
                    label: 'Gider raporu onay seviyesi',
                    description:
                        "Bir gider raporu Expensify'de onayland\u0131\u011F\u0131nda ve NetSuite'e aktar\u0131ld\u0131\u011F\u0131nda, g\u00F6ndermeden \u00F6nce NetSuite'de ek bir onay seviyesi belirleyebilirsiniz.",
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite varsay\u0131lan tercihi',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: 'Yaln\u0131zca y\u00F6netici onaylad\u0131',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: 'Yaln\u0131zca muhasebe onaylad\u0131',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: 'Denet\u00E7i ve muhasebe onaylad\u0131',
                    },
                },
                accountingMethods: {
                    label: 'Ne Zaman D\u0131\u015Fa Aktar\u0131l\u0131r',
                    description: 'Giderleri ne zaman d\u0131\u015Fa aktaraca\u011F\u0131n\u0131z\u0131 se\u00E7in:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Tahakkuk',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Nakit',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: 'Cebri masraflar, son onayland\u0131\u011F\u0131nda d\u0131\u015Fa aktar\u0131lacakt\u0131r',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: 'Cebri masraflar \u00F6dendi\u011Finde d\u0131\u015Fa aktar\u0131lacak',
                    },
                },
                exportVendorBillsTo: {
                    label: 'Sat\u0131c\u0131 fatura onay seviyesi',
                    description:
                        "Bir sat\u0131c\u0131 faturas\u0131 Expensify'de onayland\u0131ktan ve NetSuite'e aktar\u0131ld\u0131ktan sonra, g\u00F6ndermeden \u00F6nce NetSuite'de ek bir onay seviyesi belirleyebilirsiniz.",
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite varsay\u0131lan tercihi',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: 'Onay bekleniyor',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: 'G\u00F6nderi i\u00E7in onayland\u0131',
                    },
                },
                exportJournalsTo: {
                    label: 'Dergi giri\u015Fi onay seviyesi',
                    description:
                        "Bir dergi giri\u015Fi Expensify'de onayland\u0131\u011F\u0131nda ve NetSuite'e aktar\u0131ld\u0131\u011F\u0131nda, g\u00F6ndermeden \u00F6nce NetSuite'de ek bir onay seviyesi belirleyebilirsiniz.",
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite varsay\u0131lan tercihi',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: 'Onay bekleniyor',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: 'G\u00F6nderi i\u00E7in onayland\u0131',
                    },
                },
                error: {
                    customFormID: "L\u00FCtfen ge\u00E7erli bir say\u0131sal \u00F6zel form ID'si girin.",
                },
            },
            noAccountsFound: 'Hesap bulunamad\u0131',
            noAccountsFoundDescription: "L\u00FCtfen NetSuite'e hesab\u0131 ekleyin ve ba\u011Flant\u0131y\u0131 tekrar senkronize edin.",
            noVendorsFound: 'Hi\u00E7 sat\u0131c\u0131 bulunamad\u0131',
            noVendorsFoundDescription: "L\u00FCtfen NetSuite'e sat\u0131c\u0131lar ekleyin ve ba\u011Flant\u0131y\u0131 tekrar senkronize edin.",
            noItemsFound: 'Fatura \u00F6\u011Fesi bulunamad\u0131',
            noItemsFoundDescription: "L\u00FCtfen NetSuite'e fatura \u00F6\u011Feleri ekleyin ve ba\u011Flant\u0131y\u0131 tekrar senkronize edin.",
            noSubsidiariesFound: 'Hi\u00E7 alt \u015Firket bulunamad\u0131',
            noSubsidiariesFoundDescription: "L\u00FCtfen NetSuite'e bir ba\u011Fl\u0131 \u015Firket ekleyin ve ba\u011Flant\u0131y\u0131 tekrar senkronize edin.",
            tokenInput: {
                title: 'NetSuite kurulumu',
                formSteps: {
                    installBundle: {
                        title: 'Expensify paketini y\u00FCkleyin',
                        description:
                            'NetSuite\'de, *\u00D6zelle\u015Ftirme > SuiteBundler > Arama & Y\u00FCkleme Paketleri* > "Expensify" i\u00E7in arama yap\u0131n > paketi y\u00FCkleyin.',
                    },
                    enableTokenAuthentication: {
                        title: 'Token tabanl\u0131 kimlik do\u011Frulamay\u0131 etkinle\u015Ftir',
                        description:
                            "NetSuite'de, *Kurulum > \u015Eirket > \u00D6zellikleri Etkinle\u015Ftir > SuiteCloud* > *token-tabanl\u0131 kimlik do\u011Frulamay\u0131* etkinle\u015Ftir yolunu izleyin.",
                    },
                    enableSoapServices: {
                        title: 'SOAP web hizmetlerini etkinle\u015Ftir',
                        description: "NetSuite'de, *Kurulum > \u015Eirket > \u00D6zellikleri Etkinle\u015Ftir > SuiteCloud* > *SOAP Web Servislerini* etkinle\u015Ftir yolunu izleyin.",
                    },
                    createAccessToken: {
                        title: 'Bir eri\u015Fim belirteci olu\u015Fturun',
                        description:
                            'NetSuite\'de, *Kurulum > Kullan\u0131c\u0131lar/Roller > Eri\u015Fim Tokenlar\u0131*\'na gidin > "Expensify" uygulamas\u0131 i\u00E7in bir eri\u015Fim token\u0131 olu\u015Fturun ve ya "Expensify Entegrasyonu" ya da "Y\u00F6netici" rol\u00FCn\u00FC se\u00E7in.\n\n*\u00D6nemli:* Bu ad\u0131mdan *Token ID* ve *Token Secret*\'i mutlaka kaydedin. Bir sonraki ad\u0131mda bunlara ihtiyac\u0131n\u0131z olacak.',
                    },
                    enterCredentials: {
                        title: 'NetSuite kimlik bilgilerinizi girin',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite Hesap ID',
                            netSuiteTokenID: 'Token ID',
                            netSuiteTokenSecret: 'Gizli Anahtar',
                        },
                        netSuiteAccountIDDescription: "NetSuite'de, *Kurulum > Entegrasyon > SOAP Web Servisleri Tercihleri* yolunu izleyin.",
                    },
                },
            },
            import: {
                expenseCategories: 'Gider kategorileri',
                expenseCategoriesDescription: "NetSuite masraf kategorileriniz, Expensify'ye kategoriler olarak i\u00E7e aktar\u0131lacak.",
                crossSubsidiaryCustomers: '\u015Eirketler aras\u0131 m\u00FC\u015Fteriler/projeler',
                importFields: {
                    departments: {
                        title: 'B\u00F6l\u00FCmler',
                        subtitle: "Expensify'deki NetSuite *b\u00F6l\u00FCmlerini* nas\u0131l y\u00F6netece\u011Finizi se\u00E7in.",
                    },
                    classes: {
                        title: 'S\u0131n\u0131flar',
                        subtitle: "Expensify'deki *s\u0131n\u0131flar\u0131n* nas\u0131l i\u015Flenece\u011Fini se\u00E7in.",
                    },
                    locations: {
                        title: 'Konumlar',
                        subtitle: "Expensify'deki *konumlar\u0131* nas\u0131l y\u00F6netece\u011Finizi se\u00E7in.",
                    },
                },
                customersOrJobs: {
                    title: 'M\u00FC\u015Fteriler/projeler',
                    subtitle: "Expensify'de NetSuite *m\u00FC\u015Fterileri* ve *projeleri* nas\u0131l y\u00F6netece\u011Finizi se\u00E7in.",
                    importCustomers: 'M\u00FC\u015Fterileri i\u00E7e aktar',
                    importJobs: 'Projeleri i\u00E7e aktar',
                    customers: 'm\u00FC\u015Fteriler',
                    jobs: 'projeler',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join(' and ')}, ${importType}`,
                },
                importTaxDescription: "NetSuite'ten vergi gruplar\u0131n\u0131 i\u00E7e aktar\u0131n.",
                importCustomFields: {
                    chooseOptionBelow: 'A\u015Fa\u011F\u0131daki se\u00E7eneklerden birini se\u00E7in:',
                    label: ({importedTypes}: ImportedTypesParams) => `Imported as ${importedTypes.join(' and ')}`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `L\u00FCtfen ${fieldName} giriniz`,
                    customSegments: {
                        title: '\u00D6zel segmentler/kay\u0131tlar',
                        addText: '\u00D6zel segment/kay\u0131t ekle',
                        recordTitle: '\u00D6zel segment/kay\u0131t',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: 'Detayl\u0131 talimatlar\u0131 g\u00F6r\u00FCnt\u00FCleyin',
                        helpText: '\u00D6zel segmentler/kay\u0131tlar\u0131n yap\u0131land\u0131r\u0131lmas\u0131 hakk\u0131nda.',
                        emptyTitle: '\u00D6zel bir segment veya \u00F6zel kay\u0131t ekleyin',
                        fields: {
                            segmentName: '\u0130sim',
                            internalID: '\u0130\u00E7 Kimlik',
                            scriptID: 'Script Kimli\u011Fi',
                            customRecordScriptID: '\u0130\u015Flem s\u00FCtun ID',
                            mapping: 'G\u00F6r\u00FCnt\u00FClenir olarak',
                        },
                        removeTitle: '\u00D6zel segment/kayd\u0131 kald\u0131r',
                        removePrompt: 'Bu \u00F6zel segment/kayd\u0131 kald\u0131rmak istedi\u011Finizden emin misiniz?',
                        addForm: {
                            customSegmentName: '\u00F6zel segment ad\u0131',
                            customRecordName: '\u00F6zel kay\u0131t ad\u0131',
                            segmentTitle: '\u00D6zel segment',
                            customSegmentAddTitle: '\u00D6zel segment ekle',
                            customRecordAddTitle: '\u00D6zel kay\u0131t ekle',
                            recordTitle: '\u00D6zel kay\u0131t',
                            segmentRecordType: '\u00D6zel bir segment mi yoksa \u00F6zel bir kay\u0131t m\u0131 eklemek istersiniz?',
                            customSegmentNameTitle: '\u00D6zel segment ad\u0131 nedir?',
                            customRecordNameTitle: '\u00D6zel kay\u0131t ad\u0131 nedir?',
                            customSegmentNameFooter: `NetSuite'de \u00F6zel segment isimlerini *\u00D6zelle\u015Ftirmeler > Ba\u011Flant\u0131lar, Kay\u0131tlar & Alanlar > \u00D6zel Segmentler* sayfas\u0131nda bulabilirsiniz.\n\n_Daha detayl\u0131 talimatlar i\u00E7in, [yard\u0131m sitemizi ziyaret edin](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customRecordNameFooter: `NetSuite'te \u00F6zel kay\u0131t isimlerini "Transaction Column Field" yazarak k\u00FCresel aramada bulabilirsiniz.\n\n_Daha detayl\u0131 talimatlar i\u00E7in, [yard\u0131m sitemizi ziyaret edin](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentInternalIDTitle: '\u0130\u00E7sel ID nedir?',
                            customSegmentInternalIDFooter: `\u00D6ncelikle, NetSuite'te *Ana Sayfa > Tercihleri Ayarla > Dahili ID'yi G\u00F6ster* alt\u0131nda dahili ID'leri etkinle\u015Ftirdi\u011Finizden emin olun.\n\nNetSuite'te \u00F6zel segment dahili ID'lerini a\u015Fa\u011F\u0131daki yerlerde bulabilirsiniz:\n\n1. *\u00D6zelle\u015Ftirme > Listeler, Kay\u0131tlar ve Alanlar > \u00D6zel Segmentler*.\n2. Bir \u00F6zel segmente t\u0131klay\u0131n.\n3. *\u00D6zel Kay\u0131t T\u00FCr\u00FC* yan\u0131ndaki ba\u011Flant\u0131ya t\u0131klay\u0131n.\n4. Tablonun alt\u0131nda dahili ID'yi bulun.\n\n_Daha detayl\u0131 talimatlar i\u00E7in, [yard\u0131m sitemizi ziyaret edin](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordInternalIDFooter: `NetSuite'te \u00F6zel kay\u0131t i\u00E7sel ID'lerini a\u015Fa\u011F\u0131daki ad\u0131mlar\u0131 izleyerek bulabilirsiniz:\n\n1. K\u00FCresel aramaya "Transaction Line Fields" girin.\n2. \u00D6zel bir kay\u0131ta t\u0131klay\u0131n.\n3. \u0130\u00E7sel ID'yi sol tarafta bulun.\n\n_Daha detayl\u0131 talimatlar i\u00E7in, [yard\u0131m sitemizi ziyaret edin](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentScriptIDTitle: 'Betik kimli\u011Fi nedir?',
                            customSegmentScriptIDFooter: `NetSuite'de \u00F6zel segment script ID'lerini a\u015Fa\u011F\u0131daki yerlerde bulabilirsiniz:\n\n1. *\u00D6zelle\u015Ftirme > Listeler, Kay\u0131tlar, & Alanlar > \u00D6zel Segmentler*.\n2. Bir \u00F6zel segmente t\u0131klay\u0131n.\n3. Alt k\u0131s\u0131mdaki *Uygulama ve Kaynak* sekmesine t\u0131klay\u0131n, ard\u0131ndan:\n    a. E\u011Fer \u00F6zel segmenti Expensify'de bir *etiket* (sat\u0131r \u00F6\u011Fesi d\u00FCzeyinde) olarak g\u00F6stermek istiyorsan\u0131z, *\u0130\u015Flem S\u00FCtunlar\u0131* alt sekmesine t\u0131klay\u0131n ve *Alan ID*'sini kullan\u0131n.\n    b. E\u011Fer \u00F6zel segmenti Expensify'de bir *rapor alan\u0131* (rapor d\u00FCzeyinde) olarak g\u00F6stermek istiyorsan\u0131z, *\u0130\u015Flemler* alt sekmesine t\u0131klay\u0131n ve *Alan ID*'sini kullan\u0131n.\n\n_Daha detayl\u0131 talimatlar i\u00E7in, [yard\u0131m sitemizi ziyaret edin](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            customRecordScriptIDTitle: "\u0130\u015Flem s\u00FCtun ID'si nedir?",
                            customRecordScriptIDFooter: `NetSuite alt\u0131nda \u00F6zel kay\u0131t script ID'lerini a\u015Fa\u011F\u0131daki \u015Fekilde bulabilirsiniz:\n\n1. Global aramaya "Transaction Line Fields" girin.\n2. Bir \u00F6zel kay\u0131ta t\u0131klay\u0131n.\n3. Script ID'yi sol tarafta bulun.\n\n_Daha detayl\u0131 talimatlar i\u00E7in, [yard\u0131m sitemizi ziyaret edin](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_.`,
                            customSegmentMappingTitle: "Bu \u00F6zel segment Expensify'de nas\u0131l g\u00F6r\u00FCnt\u00FClenmelidir?",
                            customRecordMappingTitle: "Bu \u00F6zel kay\u0131t Expensify'de nas\u0131l g\u00F6r\u00FCnt\u00FClenmelidir?",
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `Bu ${fieldName?.toLowerCase()} zaten var olan bir \u00F6zel segment/kay\u0131tla ayn\u0131.`,
                        },
                    },
                    customLists: {
                        title: '\u00D6zel listeler',
                        addText: '\u00D6zel liste ekle',
                        recordTitle: '\u00D6zel liste',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: 'Detayl\u0131 talimatlar\u0131 g\u00F6r\u00FCnt\u00FCleyin',
                        helpText: '\u00D6zel listeleri yap\u0131land\u0131rma \u00FCzerine.',
                        emptyTitle: '\u00D6zel bir liste ekleyin',
                        fields: {
                            listName: '\u0130sim',
                            internalID: '\u0130\u00E7 Kimlik',
                            transactionFieldID: '\u0130\u015Flem alan\u0131 ID',
                            mapping: 'G\u00F6r\u00FCnt\u00FClenir olarak',
                        },
                        removeTitle: '\u00D6zel listeyi kald\u0131r',
                        removePrompt: 'Bu \u00F6zel listeyi kald\u0131rmak istedi\u011Finizden emin misiniz?',
                        addForm: {
                            listNameTitle: '\u00D6zel bir liste se\u00E7in',
                            transactionFieldIDTitle: "\u0130\u015Flem alan\u0131 ID'si nedir?",
                            transactionFieldIDFooter: `NetSuite'de i\u015Flem alan\u0131 ID'lerini a\u015Fa\u011F\u0131daki ad\u0131mlar\u0131 izleyerek bulabilirsiniz:\n\n1. K\u00FCresel aramaya "Transaction Line Fields" yaz\u0131n.\n2. \u00D6zel bir listeye t\u0131klay\u0131n.\n3. \u0130\u015Flem alan\u0131 ID'sini sol tarafta bulun.\n\n_Daha detayl\u0131 talimatlar i\u00E7in, [yard\u0131m sitemizi ziyaret edin](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_.`,
                            mappingTitle: "Bu \u00F6zel liste Expensify'de nas\u0131l g\u00F6r\u00FCnt\u00FClenmelidir?",
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `A custom list with this transaction field ID already exists.`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite \u00E7al\u0131\u015Fan\u0131 varsay\u0131lan',
                        description: "Expensify'e i\u00E7e aktar\u0131lmad\u0131, d\u0131\u015Fa aktar\u0131m s\u0131ras\u0131nda uyguland\u0131",
                        footerContent: ({importField}: ImportFieldParams) =>
                            `E\u011Fer NetSuite'de ${importField} kullan\u0131rsan\u0131z, Expense Report veya Journal Entry'ye aktar\u0131m s\u0131ras\u0131nda \u00E7al\u0131\u015Fan kayd\u0131nda ayarlanan varsay\u0131lan\u0131 uygular\u0131z.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Etiketler',
                        description: 'Sat\u0131r \u00F6\u011Fesi d\u00FCzeyi',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} will be selectable for each individual expense on an employee's report.`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Rapor alanlar\u0131',
                        description: 'Rapor seviyesi',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} selection will apply to all expense on an employee's report.`,
                    },
                },
            },
        },
        nsqs: {
            setup: {
                title: 'NSQS kurulumu',
                description: "NSQS hesap ID'nizi girin",
                formInputs: {
                    netSuiteAccountID: 'NSQS Hesap ID',
                },
            },
            import: {
                expenseCategories: 'Gider kategorileri',
                expenseCategoriesDescription: "NSQS gider kategorileri, Expensify'ye kategoriler olarak i\u00E7e aktar\u0131l\u0131r.",
                importTypes: {
                    [CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'Etiketler',
                        description: 'Sat\u0131r \u00F6\u011Fesi d\u00FCzeyi',
                    },
                    [CONST.NSQS_INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'Rapor alanlar\u0131',
                        description: 'Rapor seviyesi',
                    },
                },
                importFields: {
                    customers: {
                        title: 'M\u00FC\u015Fteriler',
                        subtitle: "Expensify'deki NSQS *m\u00FC\u015Fterileri* nas\u0131l y\u00F6netece\u011Finizi se\u00E7in.",
                    },
                    projects: {
                        title: 'Projeler',
                        subtitle: "Expensify'deki NSQS *projelerini* nas\u0131l y\u00F6netece\u011Finizi se\u00E7in.",
                    },
                },
            },
            export: {
                description: "Expensify verilerinin NSQS'ye nas\u0131l aktar\u0131ld\u0131\u011F\u0131n\u0131 yap\u0131land\u0131r\u0131n.",
                exportDate: {
                    label: '\u0130hracat tarihi',
                    description: "NSQS'ye raporlar\u0131 d\u0131\u015Fa aktar\u0131rken bu tarihi kullan\u0131n.",
                    values: {
                        [CONST.NSQS_EXPORT_DATE.LAST_EXPENSE]: {
                            label: 'Son harcaman\u0131n tarihi',
                            description: 'Rapor \u00FCzerindeki en son masraf\u0131n tarihi.',
                        },
                        [CONST.NSQS_EXPORT_DATE.EXPORTED]: {
                            label: '\u0130hracat tarihi',
                            description: "Raporun NSQS'ye aktar\u0131ld\u0131\u011F\u0131 tarih.",
                        },
                        [CONST.NSQS_EXPORT_DATE.SUBMITTED]: {
                            label: 'G\u00F6nderim tarihi',
                            description: 'Raporun onay i\u00E7in sunuldu\u011Fu tarih.',
                        },
                    },
                },
                expense: 'Gider',
                reimbursableExpenses: 'Geri \u00F6denebilir giderleri d\u0131\u015Fa aktar\u0131n',
                nonReimbursableExpenses: 'Geri \u00F6demesiz giderleri d\u0131\u015Fa aktar\u0131n',
            },
            advanced: {
                autoSyncDescription:
                    "Her g\u00FCn NSQS ve Expensify'yi otomatik olarak senkronize edin. Sonu\u00E7land\u0131r\u0131lan raporu ger\u00E7ek zamanl\u0131 olarak d\u0131\u015Fa aktar\u0131n.",
                defaultApprovalAccount: 'NSQS varsay\u0131lan',
                approvalAccount: 'A/P onay hesab\u0131',
                approvalAccountDescription:
                    "NSQS'de i\u015Flemlerin onaylanaca\u011F\u0131 hesab\u0131 se\u00E7in. E\u011Fer geri \u00F6denen raporlar\u0131 senkronize ediyorsan\u0131z, bu ayn\u0131 zamanda fatura \u00F6demelerinin olu\u015Fturulaca\u011F\u0131 hesap olacakt\u0131r.",
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct kurulumu',
            prerequisitesTitle: 'Ba\u011Flanmadan \u00F6nce...',
            downloadExpensifyPackage: 'Sage Intacct i\u00E7in Expensify paketini indirin',
            followSteps: "Nas\u0131l Yap\u0131l\u0131r: Sage Intacct'a Ba\u011Flanma talimatlar\u0131m\u0131zdaki ad\u0131mlar\u0131 takip edin",
            enterCredentials: 'Sage Intacct kimlik bilgilerinizi girin',
            entity: 'Varl\u0131k',
            employeeDefault: 'Sage Intacct \u00E7al\u0131\u015Fan varsay\u0131lan\u0131',
            employeeDefaultDescription: "\u00C7al\u0131\u015Fan\u0131n varsay\u0131lan departman\u0131, varsa Sage Intacct'taki masraflar\u0131na uygulanacakt\u0131r.",
            displayedAsTagDescription: 'Bir \u00E7al\u0131\u015Fan\u0131n raporundaki her bir masraf i\u00E7in departman se\u00E7ilebilir olacak.',
            displayedAsReportFieldDescription: 'Departman se\u00E7imi, bir \u00E7al\u0131\u015Fan\u0131n raporundaki t\u00FCm masraflara uygulanacakt\u0131r.',
            toggleImportTitleFirstPart: "Sage Intacct'\u0131 nas\u0131l y\u00F6netece\u011Finizi se\u00E7in",
            toggleImportTitleSecondPart: "Expensify'de.",
            expenseTypes: 'Gider t\u00FCrleri',
            expenseTypesDescription: "Sage Intacct harcamalar\u0131n\u0131z, Expensify'ye kategoriler olarak i\u00E7e aktar\u0131lacakt\u0131r.",
            importTaxDescription: "Sage Intacct'tan al\u0131m vergisi oran\u0131n\u0131 i\u00E7e aktar\u0131n.",
            userDefinedDimensions: 'Kullan\u0131c\u0131 tan\u0131ml\u0131 boyutlar',
            addUserDefinedDimension: 'Kullan\u0131c\u0131 tan\u0131ml\u0131 boyut ekle',
            integrationName: 'Entegrasyon ad\u0131',
            dimensionExists: 'Bu isimde bir boyut zaten var.',
            removeDimension: 'Kullan\u0131c\u0131 tan\u0131ml\u0131 boyutu kald\u0131r',
            removeDimensionPrompt: 'Bu kullan\u0131c\u0131 tan\u0131ml\u0131 boyutu kald\u0131rmak istedi\u011Finizden emin misiniz?',
            userDefinedDimension: 'Kullan\u0131c\u0131 tan\u0131ml\u0131 boyut',
            addAUserDefinedDimension: 'Kullan\u0131c\u0131 tan\u0131ml\u0131 bir boyut ekleyin',
            detailedInstructionsLink: 'Detayl\u0131 talimatlar\u0131 g\u00F6r\u00FCnt\u00FCleyin',
            detailedInstructionsRestOfSentence: 'kullan\u0131c\u0131 tan\u0131ml\u0131 boyutlar\u0131n eklenmesi \u00FCzerine.',
            userDimensionsAdded: () => ({
                one: '1 UDD eklendi',
                other: (count: number) => `${count} UDDs added`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return 'b\u00F6l\u00FCmler';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 's\u0131n\u0131flar';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return 'konumlar';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return 'm\u00FC\u015Fteriler';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'projeler (i\u015Fler)';
                    default:
                        return "This prompt doesn't provide any text to translate. Could you please provide the text you want to translate into Turkish?";
                }
            },
        },
        multiConnectionSelector: {
            title: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} setup`,
            description: ({connectionName}: ConnectionNameParams) => `Devam etmek i\u00E7in ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} versiyonunuzu se\u00E7in.`,
        },
        type: {
            free: '\u00DCcretsiz',
            control: 'Kontrol',
            collect: 'Topla',
        },
        companyCards: {
            addCards: 'Kartlar\u0131 ekle',
            selectCards: 'Kartlar\u0131 se\u00E7in',
            addNewCard: {
                other: "You haven't provided any text to translate. Please provide the text that you want to translate into Turkish.",
                cardProviders: {
                    gl1025: 'American Express Kurumsal Kartlar',
                    cdf: 'Mastercard Ticari Kartlar',
                    vcf: 'Visa Ticari Kartlar',
                    stripe: 'Stripe Kartlar\u0131',
                },
                yourCardProvider: `Who's your card provider?`,
                whoIsYourBankAccount: 'Bankan\u0131z kim?',
                howDoYouWantToConnect: 'Bankan\u0131za nas\u0131l ba\u011Flanmak istersiniz?',
                learnMoreAboutOptions: {
                    text: 'Bu konuda daha fazla bilgi edinin',
                    linkText: 'Se\u00E7enekler.',
                },
                commercialFeedDetails:
                    'Bankan\u0131zla kurulum gerektirir. Bu genellikle daha b\u00FCy\u00FCk \u015Firketler taraf\u0131ndan kullan\u0131l\u0131r ve e\u011Fer uygunluk sa\u011Flarsan\u0131z genellikle en iyi se\u00E7enektir.',
                directFeedDetails: 'En basit yakla\u015F\u0131m. Ana kimlik bilgilerinizi kullanarak hemen ba\u011Flan\u0131n. Bu y\u00F6ntem en yayg\u0131n olan\u0131d\u0131r.',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `Enable your ${provider} feed`,
                    heading:
                        "Kart yay\u0131nc\u0131n\u0131zla do\u011Frudan bir entegrasyonumuz var ve i\u015Flem verilerinizi Expensify'ye h\u0131zl\u0131 ve do\u011Fru bir \u015Fekilde i\u00E7e aktarabiliriz.\n\nBa\u015Flamak i\u00E7in, basit\u00E7e:",
                    visa: 'Visa ile global entegrasyonlar\u0131m\u0131z bulunmaktad\u0131r, ancak uygunluk banka ve kart program\u0131na g\u00F6re de\u011Fi\u015Fir.\n\nBa\u015Flamak i\u00E7in, basit\u00E7e:',
                    mastercard:
                        'Mastercard ile global entegrasyonlar\u0131m\u0131z bulunmaktad\u0131r, ancak uygunluk bankaya ve kart program\u0131na g\u00F6re de\u011Fi\u015Fir.\n\nBa\u015Flamak i\u00E7in, sadece:',
                    vcf: `1. Visa Ticari Kartlar\u0131n\u0131z\u0131 nas\u0131l kuraca\u011F\u0131n\u0131za dair ayr\u0131nt\u0131l\u0131 talimatlar i\u00E7in [bu yard\u0131m makalesini](${CONST.COMPANY_CARDS_HELP}) ziyaret edin.\n\n2. Program\u0131n\u0131z i\u00E7in ticari bir besleme desteklediklerini do\u011Frulamak ve bunu etkinle\u015Ftirmelerini istemek i\u00E7in [bankan\u0131zla ileti\u015Fime ge\u00E7in](${CONST.COMPANY_CARDS_HELP}).\n\n3. *Besleme etkinle\u015Ftirildi\u011Finde ve detaylar\u0131na sahip oldu\u011Funuzda, bir sonraki ekrana devam edin.*`,
                    gl1025: `1. American Express'in program\u0131n\u0131z i\u00E7in ticari bir besleme etkinle\u015Ftirebilece\u011Fini \u00F6\u011Frenmek i\u00E7in [bu yard\u0131m makalesini](${CONST.COMPANY_CARDS_HELP}) ziyaret edin.\n\n2. Besleme etkinle\u015Ftirildi\u011Finde, Amex size bir \u00FCretim mektubu g\u00F6nderecektir.\n\n3. *Besleme bilgilerine sahip oldu\u011Funuzda, bir sonraki ekrana devam edin.*`,
                    cdf: `1. Mastercard Ticari Kartlar\u0131n\u0131z\u0131 nas\u0131l kuraca\u011F\u0131n\u0131za dair detayl\u0131 talimatlar i\u00E7in [bu yard\u0131m makalesini](${CONST.COMPANY_CARDS_HELP}) ziyaret edin.\n\n2. Program\u0131n\u0131z i\u00E7in ticari bir beslemeyi destekleyip desteklemediklerini do\u011Frulamak i\u00E7in [bankan\u0131zla ileti\u015Fime ge\u00E7in](${CONST.COMPANY_CARDS_HELP}) ve onlardan bunu etkinle\u015Ftirmelerini isteyin.\n\n3. *Besleme etkinle\u015Ftirildi\u011Finde ve detaylar\u0131na sahip oldu\u011Funuzda, bir sonraki ekrana devam edin.*`,
                    stripe: `1. Stripe\u2019\u0131n G\u00F6sterge Panelini ziyaret edin ve [Ayarlar](${CONST.COMPANY_CARDS_STRIPE_HELP})'a gidin.\n\n2. \u00DCr\u00FCn Entegrasyonlar\u0131 alt\u0131nda, Expensify yan\u0131nda Etkinle\u015Ftir'e t\u0131klay\u0131n.\n\n3. Besleme etkinle\u015Ftirildi\u011Finde, a\u015Fa\u011F\u0131daki G\u00F6nder'e t\u0131klay\u0131n ve biz onu eklemek \u00FCzerinde \u00E7al\u0131\u015Faca\u011F\u0131z.`,
                },
                whatBankIssuesCard: 'Bu kartlar\u0131 hangi banka \u00E7\u0131kar\u0131r?',
                enterNameOfBank: 'Bank\u0131n ad\u0131n\u0131 girin',
                feedDetails: {
                    vcf: {
                        title: 'Visa besleme detaylar\u0131 nelerdir?',
                        processorLabel: '\u0130\u015Flemci ID',
                        bankLabel: 'Finans kurumu (banka) ID',
                        companyLabel: '\u015Eirket ID',
                        helpLabel: 'Bu kimlikleri nerede bulabilirim?',
                    },
                    gl1025: {
                        title: `What's the Amex delivery file name?`,
                        fileNameLabel: 'Teslimat dosya ad\u0131',
                        helpLabel: 'Teslimat dosya ad\u0131n\u0131 nerede bulabilirim?',
                    },
                    cdf: {
                        title: `What's the Mastercard distribution ID?`,
                        distributionLabel: 'Da\u011F\u0131t\u0131m ID',
                        helpLabel: "Da\u011F\u0131t\u0131m ID'sini nerede bulabilirim?",
                    },
                },
                amexCorporate: 'Kartlar\u0131n\u0131z\u0131n \u00F6n y\u00FCz\u00FCnde "Kurumsal" yaz\u0131yorsa bunu se\u00E7in.',
                amexBusiness: 'Kartlar\u0131n\u0131z\u0131n \u00F6n y\u00FCz\u00FCnde "\u0130\u015F" yaz\u0131yorsa bunu se\u00E7in.',
                amexPersonal: 'Bunlar\u0131 kartlar\u0131n\u0131z ki\u015Fisel ise se\u00E7in',
                error: {
                    pleaseSelectProvider: 'L\u00FCtfen devam etmeden \u00F6nce bir kart sa\u011Flay\u0131c\u0131 se\u00E7in.',
                    pleaseSelectBankAccount: 'L\u00FCtfen devam etmeden \u00F6nce bir banka hesab\u0131 se\u00E7in.',
                    pleaseSelectBank: 'L\u00FCtfen devam etmeden \u00F6nce bir banka se\u00E7in.',
                    pleaseSelectFeedType: 'L\u00FCtfen devam etmeden \u00F6nce bir besleme t\u00FCr\u00FC se\u00E7in.',
                },
            },
            assignCard: 'Kart\u0131 ata',
            cardNumber: 'Kart numaras\u0131',
            commercialFeed: 'Ticari yem',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `${feedName} cards`,
            directFeed: 'Do\u011Frudan besleme',
            whoNeedsCardAssigned: 'Kimin bir kart atanmas\u0131na ihtiyac\u0131 var?',
            chooseCard: 'Bir kart se\u00E7in',
            chooseCardFor: ({assignee, feed}: AssignCardParams) => `Choose a card for ${assignee} from the ${feed} cards feed.`,
            noActiveCards: 'Bu beslemede aktif kart yok',
            somethingMightBeBroken: 'Bir \u015Feyler bozuk olabilir. Her neyse, herhangi bir sorunuz varsa, sadece',
            contactConcierge: 'Concierge ile ileti\u015Fime ge\u00E7in',
            chooseTransactionStartDate: 'Bir i\u015Flem ba\u015Flang\u0131\u00E7 tarihi se\u00E7in',
            startDateDescription:
                'Bu tarihten itibaren t\u00FCm i\u015Flemleri i\u00E7e aktaraca\u011F\u0131z. E\u011Fer bir tarih belirtilmemi\u015Fse, bankan\u0131z\u0131n izin verdi\u011Fi kadar geriye gidece\u011Fiz.',
            fromTheBeginning: 'Ba\u015Ftan itibaren',
            customStartDate: '\u00D6zel ba\u015Flang\u0131\u00E7 tarihi',
            letsDoubleCheck: 'Her \u015Feyin do\u011Fru g\u00F6r\u00FCnd\u00FC\u011F\u00FCn\u00FC iki kez kontrol edelim.',
            confirmationDescription: '\u0130\u015Flemleri hemen i\u00E7e aktarmaya ba\u015Flayaca\u011F\u0131z.',
            cardholder: 'Kart Sahibi',
            card: 'Kart',
            cardName: 'Kart ad\u0131',
            brokenConnectionErrorFirstPart: `Card feed connection is broken. Please `,
            brokenConnectionErrorLink: 'Bankan\u0131za giri\u015F yap\u0131n',
            brokenConnectionErrorSecondPart: 'yani ba\u011Flant\u0131y\u0131 tekrar kurabiliriz.',
            assignedCard: ({assignee, link}: AssignedCardParams) => `assigned ${assignee} a ${link}! Imported transactions will appear in this chat.`,
            companyCard: '\u015Firket kart\u0131',
            chooseCardFeed: 'Kart beslemesini se\u00E7in',
        },
        expensifyCard: {
            issueAndManageCards: 'Expensify Kartlar\u0131n\u0131z\u0131 d\u00FCzenleyin ve y\u00F6netin',
            getStartedIssuing: '\u0130lk sanal veya fiziksel kart\u0131n\u0131z\u0131 \u00E7\u0131kararak ba\u015Flay\u0131n.',
            verificationInProgress: 'Do\u011Frulama devam ediyor...',
            verifyingTheDetails:
                "Birka\u00E7 detay\u0131 do\u011Fruluyoruz. Concierge, Expensify Kartlar\u0131'n\u0131n \u00E7\u0131kar\u0131lmaya haz\u0131r oldu\u011Funda sizi bilgilendirecek.",
            disclaimer:
                "Expensify Visa\u00AE Ticari Kart, The Bancorp Bank, N.A. taraf\u0131ndan, FDIC \u00FCyesi, Visa U.S.A. Inc.'den bir lisans do\u011Frultusunda verilmi\u015Ftir ve t\u00FCm Visa kartlar\u0131n\u0131 kabul eden t\u00FCm sat\u0131c\u0131larda kullan\u0131lamayabilir. Apple\u00AE ve Apple logosu\u00AE, ABD ve di\u011Fer \u00FClkelerde kay\u0131tl\u0131 olan Apple Inc.'in ticari markalar\u0131d\u0131r. App Store, Apple Inc.'in hizmet markas\u0131d\u0131r. Google Play ve Google Play logosu, Google LLC'nin ticari markalar\u0131d\u0131r.",
            issueCard: 'Kart \u00E7\u0131kar',
            newCard: 'Yeni kart',
            name: '\u0130sim',
            lastFour: 'Son 4',
            limit: 'S\u0131n\u0131r',
            currentBalance: 'Mevcut bakiye',
            currentBalanceDescription: 'Mevcut bakiye, son \u00F6deme tarihinden bu yana ger\u00E7ekle\u015Fen t\u00FCm Expensify Card i\u015Flemlerinin toplam\u0131d\u0131r.',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `Bakiye, ${settlementDate} tarihinde kapat\u0131lacak.`,
            settleBalance: 'Bakiyeyi \u00F6de',
            cardLimit: 'Kart limiti',
            remainingLimit: 'Kalan limit',
            requestLimitIncrease: '\u0130stek limiti art\u0131r\u0131m\u0131',
            remainingLimitDescription:
                'Kalan limitinizi hesaplarken bir dizi fakt\u00F6r\u00FC g\u00F6z \u00F6n\u00FCnde bulundururuz: m\u00FC\u015Fteri olarak ge\u00E7irdi\u011Finiz s\u00FCre, kay\u0131t s\u0131ras\u0131nda sa\u011Flad\u0131\u011F\u0131n\u0131z i\u015Fle ilgili bilgiler ve i\u015Fletme banka hesab\u0131n\u0131zdaki kullan\u0131labilir nakit. Kalan limitiniz g\u00FCnl\u00FCk olarak dalgalanabilir.',
            earnedCashback: 'Nakit iade',
            earnedCashbackDescription:
                'Geri \u00F6deme bakiyesi, \u00E7al\u0131\u015Fma alan\u0131n\u0131zda ayl\u0131k olarak \u00F6denen Expensify Card harcamalar\u0131na dayanmaktad\u0131r.',
            issueNewCard: 'Yeni kart \u00E7\u0131kar',
            finishSetup: 'Kurulumu tamamla',
            chooseBankAccount: 'Banka hesab\u0131n\u0131 se\u00E7in',
            chooseExistingBank: 'Expensify Card bakiyenizi \u00F6demek i\u00E7in mevcut bir i\u015F banka hesab\u0131 se\u00E7in veya yeni bir banka hesab\u0131 ekleyin.',
            accountEndingIn: 'Hesap sonu',
            addNewBankAccount: 'Yeni bir banka hesab\u0131 ekleyin',
            settlementAccount: 'Tas settlement hesab\u0131',
            settlementAccountDescription: 'Expensify Card bakiyenizi \u00F6demek i\u00E7in bir hesap se\u00E7in.',
            settlementAccountInfoPt1: 'Bu hesab\u0131n sizinkiyle e\u015Fle\u015Fti\u011Finden emin olun',
            settlementAccountInfoPt2: 'b\u00F6ylece Continuous Reconciliation d\u00FCzg\u00FCn \u00E7al\u0131\u015F\u0131r.',
            reconciliationAccount: 'Mutabakat hesab\u0131',
            settlementFrequency: '\u00D6deme s\u0131kl\u0131\u011F\u0131',
            settlementFrequencyDescription: 'Expensify Card bakiyenizi ne s\u0131kl\u0131kla \u00F6deyece\u011Finizi se\u00E7in.',
            settlementFrequencyInfo:
                'Ayl\u0131k \u00F6deme plan\u0131na ge\u00E7mek isterseniz, banka hesab\u0131n\u0131z\u0131 Plaid arac\u0131l\u0131\u011F\u0131yla ba\u011Flaman\u0131z ve pozitif 90 g\u00FCnl\u00FCk bakiye ge\u00E7mi\u015Fine sahip olman\u0131z gerekmektedir.',
            frequency: {
                daily: 'G\u00FCnl\u00FCk',
                monthly: 'Ayl\u0131k',
            },
            cardDetails: 'Kart detaylar\u0131',
            virtual: 'Sanal',
            physical: 'Fiziksel',
            deactivate: 'Kart\u0131 devre d\u0131\u015F\u0131 b\u0131rak',
            changeCardLimit: 'Kart limitini de\u011Fi\u015Ftir',
            changeLimit: 'Limiti de\u011Fi\u015Ftir',
            smartLimitWarning: ({limit}: CharacterLimitParams) =>
                `Bu kart\u0131n limitini ${limit} olarak de\u011Fi\u015Ftirirseniz, kart \u00FCzerinde daha fazla harcamay\u0131 onaylayana kadar yeni i\u015Flemler reddedilir.`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `Bu kart\u0131n limitini ${limit} olarak de\u011Fi\u015Ftirirseniz, yeni i\u015Flemler gelecek aya kadar reddedilir.`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `Bu kart\u0131n limitini ${limit} olarak de\u011Fi\u015Ftirirseniz, yeni i\u015Flemler reddedilecektir.`,
            changeCardLimitType: 'Kart limit t\u00FCr\u00FCn\u00FC de\u011Fi\u015Ftir',
            changeLimitType: 'Limit t\u00FCr\u00FCn\u00FC de\u011Fi\u015Ftir',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Bu kart\u0131n limit t\u00FCr\u00FCn\u00FC Ak\u0131ll\u0131 Limit olarak de\u011Fi\u015Ftirirseniz, ${limit} onaylanmam\u0131\u015F limit zaten ula\u015F\u0131ld\u0131\u011F\u0131 i\u00E7in yeni i\u015Flemler reddedilir.`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `Bu kart\u0131n limit t\u00FCr\u00FCn\u00FC Ayl\u0131k olarak de\u011Fi\u015Ftirirseniz, yeni i\u015Flemler ${limit} ayl\u0131k limiti zaten dolmu\u015F oldu\u011Fu i\u00E7in reddedilecektir.`,
            addShippingDetails: 'Kargo detaylar\u0131 ekleyin',
            issuedCard: ({assignee}: AssigneeParams) => `issued ${assignee} an Expensify Card! The card will arrive in 2-3 business days.`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) => `issued ${assignee} an Expensify Card! The card will be shipped once shipping details are added.`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `issued ${assignee} a virtual ${link}! The card can be used right away.`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} added shipping details. Expensify Card will arrive in 2-3 business days.`,
            verifyingHeader:
                "Bu, d\u00FCz bir dize veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi a\u00E7\u0131klar, ancak ternary ifadeler veya ba\u015Fka TypeScript kodu i\u00E7erebilir.",
            bankAccountVerifiedHeader: 'Banka hesab\u0131 do\u011Fruland\u0131',
            verifyingBankAccount: 'Banka hesab\u0131 do\u011Frulan\u0131yor...',
            verifyingBankAccountDescription: 'L\u00FCtfen bu hesab\u0131n Expensify Kartlar\u0131 \u00E7\u0131karabilme yetene\u011Finin onaylanmas\u0131 beklenirken bekleyin.',
            bankAccountVerified: 'Banka hesab\u0131 do\u011Fruland\u0131!',
            bankAccountVerifiedDescription: "Art\u0131k Expensify Kartlar\u0131'n\u0131 i\u015F alan\u0131 \u00FCyelerinize verebilirsiniz.",
            oneMoreStep: 'Bir ad\u0131m daha...',
            oneMoreStepDescription:
                "Banka hesab\u0131n\u0131z\u0131 manuel olarak do\u011Frulamam\u0131z gerekiyor gibi g\u00F6r\u00FCn\u00FCyor. L\u00FCtfen Concierge'e gidin, talimatlar\u0131n\u0131z sizi orada bekliyor.",
            gotIt: 'Anlad\u0131m',
            goToConcierge: "Concierge'ye gidin",
        },
        categories: {
            deleteCategories: 'Kategorileri sil',
            deleteCategoriesPrompt: 'Bu kategorileri silmek istedi\u011Finizden emin misiniz?',
            deleteCategory: 'Kategoriyi sil',
            deleteCategoryPrompt: 'Bu kategoriyi silmek istedi\u011Finizden emin misiniz?',
            disableCategories: 'Kategorileri devre d\u0131\u015F\u0131 b\u0131rak',
            disableCategory: 'Kategoriyi devre d\u0131\u015F\u0131 b\u0131rak',
            enableCategories: 'Kategorileri etkinle\u015Ftir',
            enableCategory: 'Kategoriyi etkinle\u015Ftir',
            defaultSpendCategories: 'Varsay\u0131lan harcama kategorileri',
            spendCategoriesDescription:
                'Kredi kart\u0131 i\u015Flemleri ve taranan fi\u015Fler i\u00E7in t\u00FCccar harcamalar\u0131n\u0131n nas\u0131l kategorilendirildi\u011Fini \u00F6zelle\u015Ftirin.',
            deleteFailureMessage: 'Kategori silinirken bir hata olu\u015Ftu, l\u00FCtfen tekrar deneyin.',
            categoryName: 'Kategori ad\u0131',
            requiresCategory: '\u00DCyelerin t\u00FCm masraflar\u0131 kategorize etmesi gerekmektedir.',
            needCategoryForExportToIntegration: 'Her bir masraf\u0131 d\u0131\u015Fa aktarmak i\u00E7in her zaman bir kategori gerektirir.',
            subtitle:
                'Paran\u0131n nerede harcand\u0131\u011F\u0131na dair daha iyi bir genel bak\u0131\u015F elde edin. Varsay\u0131lan kategorilerimizi kullan\u0131n veya kendi kategorinizi ekleyin.',
            emptyCategories: {
                title: 'Herhangi bir kategori olu\u015Fturmad\u0131n\u0131z',
                subtitle: 'Harcamalar\u0131n\u0131z\u0131 d\u00FCzenlemek i\u00E7in bir kategori ekleyin.',
            },
            updateFailureMessage: 'Kategori g\u00FCncellenirken bir hata olu\u015Ftu, l\u00FCtfen tekrar deneyin.',
            createFailureMessage: 'Kategori olu\u015Fturulurken bir hata olu\u015Ftu, l\u00FCtfen tekrar deneyin.',
            addCategory: 'Kategori ekle',
            editCategory: 'Kategoriyi d\u00FCzenle',
            editCategories: 'Kategorileri d\u00FCzenle',
            categoryRequiredError: 'Kategori ad\u0131 gereklidir.',
            existingCategoryError: 'Bu isimde bir kategori zaten var.',
            invalidCategoryName: 'Ge\u00E7ersiz kategori ad\u0131.',
            importedFromAccountingSoftware: 'A\u015Fa\u011F\u0131daki kategoriler sizin taraf\u0131n\u0131zdan i\u00E7e aktar\u0131lm\u0131\u015Ft\u0131r',
            payrollCode: 'Maa\u015F bordro kodu',
            updatePayrollCodeFailureMessage: 'Maa\u015F bordrosu kodunu g\u00FCncellerken bir hata olu\u015Ftu, l\u00FCtfen tekrar deneyin.',
            glCode: 'GL kodu',
            updateGLCodeFailureMessage: 'GL kodunu g\u00FCncellerken bir hata olu\u015Ftu, l\u00FCtfen tekrar deneyin.',
            importCategories: 'Kategorileri i\u00E7e aktar',
        },
        moreFeatures: {
            subtitle:
                'A\u015Fa\u011F\u0131daki anahtarlar\u0131 kullanarak b\u00FCy\u00FCd\u00FCk\u00E7e daha fazla \u00F6zelli\u011Fi etkinle\u015Ftirin. Her \u00F6zellik, daha fazla \u00F6zelle\u015Ftirme i\u00E7in navigasyon men\u00FCs\u00FCnde g\u00F6r\u00FCnecektir.',
            spendSection: {
                title: 'Harcama',
                subtitle: 'Ekibinizi \u00F6l\u00E7eklendirmenize yard\u0131mc\u0131 olan i\u015Flevselli\u011Fi etkinle\u015Ftirin.',
            },
            manageSection: {
                title: 'Y\u00F6net',
                subtitle: 'B\u00FCt\u00E7e dahilinde harcamay\u0131 kontrol etmeye yard\u0131mc\u0131 olan kontroller ekleyin.',
            },
            earnSection: {
                title: 'Kazan',
                subtitle: 'Gelirinizi d\u00FCzene sokun ve daha h\u0131zl\u0131 \u00F6deme al\u0131n.',
            },
            organizeSection: {
                title: 'D\u00FCzenle',
                subtitle: 'Harcamalar\u0131 gruplay\u0131n ve analiz edin, \u00F6denen her vergiyi kaydedin.',
            },
            integrateSection: {
                title: 'Entegre et',
                subtitle: "Expensify'yi pop\u00FCler finansal \u00FCr\u00FCnlere ba\u011Flay\u0131n.",
            },
            distanceRates: {
                title: 'Mesafe oranlar\u0131',
                subtitle: 'Oranlar\u0131 ekle, g\u00FCncelle ve uygula.',
            },
            perDiem: {
                title: 'G\u00FCnl\u00FCk',
                subtitle: 'G\u00FCnl\u00FCk \u00E7al\u0131\u015Fan harcamalar\u0131n\u0131 kontrol etmek i\u00E7in g\u00FCnl\u00FCk \u00FCcret oranlar\u0131n\u0131 belirleyin.',
            },
            expensifyCard: {
                title: 'Expensify Kart\u0131',
                subtitle: 'Harcamalar \u00FCzerinde i\u00E7g\u00F6r\u00FC kazan\u0131n ve kontrol edin.',
                disableCardTitle: 'Expensify Kart\u0131n\u0131 Devre D\u0131\u015F\u0131 B\u0131rak',
                disableCardPrompt:
                    "Expensify Card'\u0131 devre d\u0131\u015F\u0131 b\u0131rakamazs\u0131n\u0131z \u00E7\u00FCnk\u00FC zaten kullan\u0131mda. Sonraki ad\u0131mlar i\u00E7in Concierge ile ileti\u015Fime ge\u00E7in.",
                disableCardButton: 'Concierge ile Sohbet Et',
                feed: {
                    title: "Expensify Card'\u0131 Al\u0131n",
                    subTitle: "\u0130\u015Fletme giderlerinizi d\u00FCzenleyin ve Expensify faturan\u0131zda %50'ye kadar tasarruf edin, ayr\u0131ca:",
                    features: {
                        cashBack: 'Her ABD al\u0131\u015Fveri\u015Finde nakit para iadesi',
                        unlimited: 'S\u0131n\u0131rs\u0131z sanal kartlar',
                        spend: 'Harcama kontrolleri ve \u00F6zel limitler',
                    },
                    ctaTitle: 'Yeni kart \u00E7\u0131kar',
                },
            },
            companyCards: {
                title: '\u015Eirket kartlar\u0131',
                subtitle: 'Mevcut \u015Firket kartlar\u0131ndan harcamalar\u0131 i\u00E7e aktar\u0131n.',
                feed: {
                    title: '\u015Eirket kartlar\u0131n\u0131 i\u00E7e aktar',
                    features: {
                        support: 'T\u00FCm b\u00FCy\u00FCk kart sa\u011Flay\u0131c\u0131lar\u0131 i\u00E7in destek',
                        assignCards: 'T\u00FCm tak\u0131ma kartlar\u0131 atay\u0131n',
                        automaticImport: 'Otomatik i\u015Flem i\u00E7e aktarma',
                    },
                },
                disableCardTitle: '\u015Eirket kartlar\u0131n\u0131 devre d\u0131\u015F\u0131 b\u0131rak\u0131n',
                disableCardPrompt:
                    'Bu \u00F6zellik kullan\u0131mda oldu\u011Fu i\u00E7in \u015Firket kartlar\u0131n\u0131 devre d\u0131\u015F\u0131 b\u0131rakamazs\u0131n\u0131z. Sonraki ad\u0131mlar i\u00E7in Concierge ile ileti\u015Fime ge\u00E7in.',
                disableCardButton: 'Concierge ile Sohbet Et',
                cardDetails: 'Kart detaylar\u0131',
                cardNumber: 'Kart numaras\u0131',
                cardholder: 'Kart Sahibi',
                cardName: 'Kart ad\u0131',
                integrationExport: ({integration, type}: IntegrationExportParams) => (integration && type ? `${integration} ${type.toLowerCase()} export` : `${integration} export`),
                integrationExportTitleFirstPart: ({integration}: IntegrationExportParams) =>
                    `\u0130\u015Flemlerin d\u0131\u015Fa aktar\u0131lmas\u0131 gereken ${integration} hesab\u0131n\u0131 se\u00E7in.`,
                integrationExportTitlePart: 'Farkl\u0131 bir tane se\u00E7in',
                integrationExportTitleLinkPart: 'se\u00E7ene\u011Fi d\u0131\u015Fa aktar',
                integrationExportTitleSecondPart: 'Kullan\u0131labilir hesaplar\u0131 de\u011Fi\u015Ftirmek.',
                lastUpdated: 'Son g\u00FCncelleme',
                transactionStartDate: '\u0130\u015Flem ba\u015Flang\u0131\u00E7 tarihi',
                updateCard: 'Kart\u0131 g\u00FCncelle',
                unassignCard: 'Kart\u0131 kald\u0131r',
                unassign: 'Atama \u0130ptal',
                unassignCardDescription:
                    'Bu kart\u0131n atanmas\u0131n\u0131 kald\u0131rmak, kart sahibinin hesab\u0131ndaki taslak raporlardaki t\u00FCm i\u015Flemleri kald\u0131racakt\u0131r.',
                assignCard: 'Kart\u0131 ata',
                cardFeedName: 'Kart besleme ad\u0131',
                cardFeedNameDescription: 'Kart beslemesine benzersiz bir isim verin, b\u00F6ylece di\u011Ferlerinden ay\u0131rt edebilirsiniz.',
                cardFeedTransaction: '\u0130\u015Flemleri sil',
                cardFeedTransactionDescription: 'Kart sahiplerinin kart i\u015Flemlerini silip silemeyece\u011Fini se\u00E7in. Yeni i\u015Flemler bu kurallara uyacakt\u0131r.',
                cardFeedRestrictDeletingTransaction: '\u0130\u015Flemlerin silinmesini k\u0131s\u0131tlay\u0131n',
                cardFeedAllowDeletingTransaction: '\u0130\u015Flemlerin silinmesine izin ver',
                removeCardFeed: 'Kart beslemesini kald\u0131r',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `Remove ${feedName} feed`,
                removeCardFeedDescription:
                    'Bu kart ak\u0131\u015F\u0131n\u0131 kald\u0131rmak istedi\u011Finize emin misiniz? Bu, t\u00FCm kartlar\u0131n atamas\u0131n\u0131 kald\u0131racakt\u0131r.',
                error: {
                    feedNameRequired: 'Kart beslemesi ad\u0131 gereklidir.',
                },
                corporate: '\u0130\u015Flemlerin silinmesini k\u0131s\u0131tlay\u0131n',
                personal: '\u0130\u015Flemlerin silinmesine izin ver',
                setFeedNameDescription: 'Kart beslemesine benzersiz bir isim verin, b\u00F6ylece di\u011Ferlerinden ay\u0131rt edebilirsiniz.',
                setTransactionLiabilityDescription: 'Etkinle\u015Ftirildi\u011Finde, kart sahipleri kart i\u015Flemlerini silebilir. Yeni i\u015Flemler bu kural\u0131 takip edecektir.',
                emptyAddedFeedTitle: '\u015Eirket kartlar\u0131 atay\u0131n',
                emptyAddedFeedDescription: '\u0130lk kart\u0131n\u0131z\u0131 bir \u00FCyeye atayarak ba\u015Flay\u0131n.',
                pendingFeedTitle: `We're reviewing your request...`,
                pendingFeedDescription: `We're currently reviewing your feed details. Once that's done, we'll reach out to you via`,
                pendingBankTitle: 'Taray\u0131c\u0131n\u0131zdaki pencereyi kontrol edin',
                pendingBankDescription: ({bankName}: CompanyCardBankName) =>
                    `L\u00FCtfen yeni a\u00E7\u0131lan taray\u0131c\u0131 pencereniz arac\u0131l\u0131\u011F\u0131yla ${bankName} ile ba\u011Flant\u0131 kurun. E\u011Fer a\u00E7\u0131lmad\u0131ysa,`,
                pendingBankLink: 'l\u00FCtfen buraya t\u0131klay\u0131n.',
                giveItNameInstruction: 'Kart\u0131 di\u011Ferlerinden ay\u0131ran bir isim verin.',
                updating: 'G\u00FCncelleniyor...',
                noAccountsFound: 'Hesap bulunamad\u0131',
                defaultCard: 'Varsay\u0131lan kart',
                noAccountsFoundDescription: ({connection}: ConnectionParams) =>
                    `L\u00FCtfen ${connection} i\u00E7inde hesab\u0131 ekleyin ve ba\u011Flant\u0131y\u0131 tekrar senkronize edin.`,
            },
            workflows: {
                title: '\u0130\u015F Ak\u0131\u015Flar\u0131',
                subtitle: 'Harcaman\u0131n nas\u0131l onayland\u0131\u011F\u0131 ve \u00F6dendi\u011Fi \u015Feklinde yap\u0131land\u0131rma yap\u0131n.',
            },
            invoices: {
                title: 'Faturalar',
                subtitle: 'Faturalar g\u00F6nderin ve al\u0131n.',
            },
            categories: {
                title: 'Kategoriler',
                subtitle: 'Harcamalar\u0131 takip edin ve d\u00FCzenleyin.',
            },
            tags: {
                title: 'Etiketler',
                subtitle: 'Maliyetleri s\u0131n\u0131fland\u0131r\u0131n ve faturaland\u0131r\u0131labilir giderleri takip edin.',
            },
            taxes: {
                title: 'Vergiler',
                subtitle: 'Belgelenmi\u015F ve geri al\u0131nabilir uygun vergileri belgeleyin ve geri al\u0131n.',
            },
            reportFields: {
                title: 'Rapor alanlar\u0131',
                subtitle: 'Harcama i\u00E7in \u00F6zel alanlar ayarlay\u0131n.',
            },
            connections: {
                title: 'Muhasebe',
                subtitle: 'Muhasebe tablonuzu ve daha fazlas\u0131n\u0131 senkronize edin.',
            },
            connectionsWarningModal: {
                featureEnabledTitle: '\u00C7ok h\u0131zl\u0131 de\u011Fil...',
                featureEnabledText:
                    'Bu \u00F6zelli\u011Fi etkinle\u015Ftirmek veya devre d\u0131\u015F\u0131 b\u0131rakmak i\u00E7in, muhasebe i\u00E7e aktarma ayarlar\u0131n\u0131z\u0131 de\u011Fi\u015Ftirmeniz gerekecektir.',
                disconnectText:
                    'Muhasebeyi devre d\u0131\u015F\u0131 b\u0131rakmak i\u00E7in, muhasebe ba\u011Flant\u0131n\u0131z\u0131 \u00E7al\u0131\u015Fma alan\u0131n\u0131zdan ay\u0131rman\u0131z gerekecektir.',
                manageSettings: 'Ayarlar\u0131 y\u00F6net',
            },
            rules: {
                title: 'Kurallar',
                subtitle: 'Fi\u015Fleri talep edin, y\u00FCksek harcamalar\u0131 i\u015Faretleyin ve daha fazlas\u0131.',
            },
        },
        reportFields: {
            addField: 'Alan ekle',
            delete: 'Alan\u0131 sil',
            deleteFields: 'Alanlar\u0131 sil',
            deleteConfirmation: 'Bu rapor alan\u0131n\u0131 silmek istedi\u011Finizden emin misiniz?',
            deleteFieldsConfirmation: 'Bu rapor alanlar\u0131n\u0131 silmek istedi\u011Finizden emin misiniz?',
            emptyReportFields: {
                title: 'Herhangi bir rapor alan\u0131 olu\u015Fturmad\u0131n\u0131z.',
                subtitle: 'Raporlarda g\u00F6r\u00FCnen \u00F6zel bir alan (metin, tarih veya a\u00E7\u0131l\u0131r men\u00FC) ekleyin.',
            },
            subtitle: 'Rapor alanlar\u0131 t\u00FCm harcamalara uygulan\u0131r ve ekstra bilgi istemek istedi\u011Finizde yard\u0131mc\u0131 olabilir.',
            disableReportFields: 'Rapor alanlar\u0131n\u0131 devre d\u0131\u015F\u0131 b\u0131rak',
            disableReportFieldsConfirmation: 'Emin misiniz? Metin ve tarih alanlar\u0131 silinecek ve listeler devre d\u0131\u015F\u0131 b\u0131rak\u0131lacakt\u0131r.',
            importedFromAccountingSoftware: 'A\u015Fa\u011F\u0131daki rapor alanlar\u0131 sizin taraf\u0131n\u0131zdan i\u00E7e aktar\u0131lm\u0131\u015Ft\u0131r',
            textType: 'Metin',
            dateType: 'Tarih',
            dropdownType: 'Liste',
            textAlternateText: '\u00DCcretsiz metin giri\u015Fi i\u00E7in bir alan ekleyin.',
            dateAlternateText: 'Tarih se\u00E7imi i\u00E7in bir takvim ekleyin.',
            dropdownAlternateText: 'Bir dizi se\u00E7enek listesi ekleyin.',
            nameInputSubtitle: 'Rapor alan\u0131 i\u00E7in bir isim se\u00E7in.',
            typeInputSubtitle: 'Hangi t\u00FCr rapor alan\u0131n\u0131 kullanaca\u011F\u0131n\u0131z\u0131 se\u00E7in.',
            initialValueInputSubtitle: 'Rapor alan\u0131nda g\u00F6sterilecek bir ba\u015Flang\u0131\u00E7 de\u011Feri girin.',
            listValuesInputSubtitle:
                'Bu de\u011Ferler rapor alan\u0131 a\u00E7\u0131l\u0131r men\u00FCn\u00FCzde g\u00F6r\u00FCnecektir. Etkin de\u011Ferler \u00FCyeler taraf\u0131ndan se\u00E7ilebilir.',
            listInputSubtitle: 'Bu de\u011Ferler rapor alan\u0131 listesinde g\u00F6r\u00FCnecektir. Etkin de\u011Ferler \u00FCyeler taraf\u0131ndan se\u00E7ilebilir.',
            deleteValue: 'De\u011Fer sil',
            deleteValues: 'De\u011Ferleri sil',
            disableValue: 'De\u011Ferini devre d\u0131\u015F\u0131 b\u0131rak',
            disableValues: 'De\u011Ferleri devre d\u0131\u015F\u0131 b\u0131rak',
            enableValue: 'De\u011Fer etkinle\u015Ftir',
            enableValues: 'De\u011Ferleri etkinle\u015Ftir',
            emptyReportFieldsValues: {
                title: 'Herhangi bir liste de\u011Feri olu\u015Fturmad\u0131n\u0131z',
                subtitle: 'Raporlarda g\u00F6r\u00FCnmesi i\u00E7in \u00F6zel de\u011Ferler ekleyin.',
            },
            deleteValuePrompt: 'Bu liste de\u011Ferini silmek istedi\u011Finizden emin misiniz?',
            deleteValuesPrompt: 'Bu liste de\u011Ferlerini silmek istedi\u011Finizden emin misiniz?',
            listValueRequiredError: 'L\u00FCtfen bir liste de\u011Feri ad\u0131 girin',
            existingListValueError: 'Bu isimde bir liste de\u011Feri zaten var',
            editValue: 'De\u011Fer D\u00FCzenle',
            listValues: 'Liste de\u011Ferleri',
            addValue: 'De\u011Fer ekle',
            existingReportFieldNameError: 'Bu isimde bir rapor alan\u0131 zaten var',
            reportFieldNameRequiredError: 'L\u00FCtfen bir rapor alan ad\u0131 girin',
            reportFieldTypeRequiredError: 'L\u00FCtfen bir rapor alan\u0131 t\u00FCr\u00FC se\u00E7in',
            reportFieldInitialValueRequiredError: 'L\u00FCtfen bir rapor alan\u0131 ba\u015Flang\u0131\u00E7 de\u011Feri se\u00E7in',
            genericFailureMessage: 'Rapor alan\u0131n\u0131 g\u00FCncellerken bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin.',
        },
        tags: {
            tagName: 'Etiket ad\u0131',
            requiresTag: '\u00DCyelerin t\u00FCm masraflar\u0131 etiketlemesi gerekmektedir',
            trackBillable: 'Faturaland\u0131r\u0131labilir giderleri takip edin',
            customTagName: '\u00D6zel etiket ad\u0131',
            enableTag: 'Etiketi etkinle\u015Ftir',
            enableTags: 'Etiketleri etkinle\u015Ftir',
            disableTag: 'Etiketi devre d\u0131\u015F\u0131 b\u0131rak',
            disableTags: 'Etiketleri devre d\u0131\u015F\u0131 b\u0131rak',
            addTag: 'Etiket ekle',
            editTag: 'Etiketi d\u00FCzenle',
            editTags: 'Etiketleri d\u00FCzenle',
            subtitle: 'Etiketler, maliyetleri s\u0131n\u0131fland\u0131rman\u0131n daha detayl\u0131 yollar\u0131n\u0131 ekler.',
            emptyTags: {
                title: 'Herhangi bir etiket olu\u015Fturmad\u0131n\u0131z',
                subtitle: 'Projeleri, konumlar\u0131, departmanlar\u0131 ve daha fazlas\u0131n\u0131 takip etmek i\u00E7in bir etiket ekleyin.',
            },
            deleteTag: 'Etiketi sil',
            deleteTags: 'Etiketleri sil',
            deleteTagConfirmation: 'Bu etiketi silmek istedi\u011Finizden emin misiniz?',
            deleteTagsConfirmation: 'Bu etiketleri silmek istedi\u011Finizden emin misiniz?',
            deleteFailureMessage: 'Etiketi silerken bir hata olu\u015Ftu, l\u00FCtfen tekrar deneyin.',
            tagRequiredError: 'Etiket ad\u0131 gereklidir.',
            existingTagError: 'Bu isimde bir etiket zaten var.',
            invalidTagNameError: 'Etiket ad\u0131 0 olamaz. L\u00FCtfen farkl\u0131 bir de\u011Fer se\u00E7in.',
            genericFailureMessage: 'Etiketi g\u00FCncellerken bir hata olu\u015Ftu, l\u00FCtfen tekrar deneyin.',
            importedFromAccountingSoftware: 'A\u015Fa\u011F\u0131daki etiketler sizin taraf\u0131n\u0131zdan i\u00E7e aktar\u0131lm\u0131\u015Ft\u0131r.',
            glCode: 'GL kodu',
            updateGLCodeFailureMessage: 'GL kodunu g\u00FCncellerken bir hata olu\u015Ftu, l\u00FCtfen tekrar deneyin.',
            tagRules: 'Etiket kurallar\u0131',
            approverDescription: 'Onaylayan',
            importTags: 'Etiketleri i\u00E7e aktar',
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `Spreadsheet'inizde *${columnCounts} s\u00FCtun* bulduk. Etiket isimlerini i\u00E7eren s\u00FCtunun yan\u0131ndaki *\u0130sim* se\u00E7ene\u011Fini se\u00E7ebilirsiniz. Ayr\u0131ca, etiket durumunu belirleyen s\u00FCtunun yan\u0131ndaki *Etkin* se\u00E7ene\u011Fini de se\u00E7ebilirsiniz.`,
        },
        taxes: {
            subtitle: 'Vergi isimleri, oranlar\u0131 ekleyin ve varsay\u0131lanlar\u0131 ayarlay\u0131n.',
            addRate: 'Oran ekle',
            workspaceDefault: '\u00C7al\u0131\u015Fma alan\u0131 para birimi varsay\u0131lan',
            foreignDefault: 'Yabanc\u0131 para birimi varsay\u0131lan\u0131',
            customTaxName: '\u00D6zel vergi ad\u0131',
            value: 'De\u011Fer',
            taxReclaimableOn: 'Vergi geri al\u0131nabilir ${username} \u00FCzerinde',
            taxRate: 'Vergi oran\u0131',
            error: {
                taxRateAlreadyExists: 'Bu vergi ad\u0131 zaten kullan\u0131mda.',
                taxCodeAlreadyExists: 'Bu vergi kodu zaten kullan\u0131mda.',
                valuePercentageRange: 'L\u00FCtfen 0 ile 100 aras\u0131nda ge\u00E7erli bir y\u00FCzde girin.',
                customNameRequired: '\u00D6zel vergi ad\u0131 gereklidir.',
                deleteFailureMessage: "Vergi oran\u0131n\u0131 silerken bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin veya Concierge'den yard\u0131m isteyin.",
                updateFailureMessage: "Vergi oran\u0131n\u0131 g\u00FCncellerken bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin veya yard\u0131m i\u00E7in Concierge'ye ba\u015Fvurun.",
                createFailureMessage: "Vergi oran\u0131 olu\u015Fturulurken bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin veya Concierge'den yard\u0131m isteyin.",
                updateTaxClaimableFailureMessage: 'Geri kazan\u0131labilir k\u0131s\u0131m, mesafe oran\u0131 miktar\u0131ndan daha az olmal\u0131d\u0131r.',
            },
            deleteTaxConfirmation: 'Bu vergiyi silmek istedi\u011Finizden emin misiniz?',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `Are you sure you want to delete ${taxAmount} taxes?`,
            actions: {
                delete: 'Silme oran\u0131',
                deleteMultiple: 'Silme oranlar\u0131',
                enable: 'Oran\u0131 etkinle\u015Ftir',
                disable: 'Oran\u0131 devre d\u0131\u015F\u0131 b\u0131rak',
                enableTaxRates: () => ({
                    one: 'Oran\u0131 etkinle\u015Ftir',
                    other: 'Oranlar\u0131 etkinle\u015Ftir',
                }),
                disableTaxRates: () => ({
                    one: 'Oran\u0131 devre d\u0131\u015F\u0131 b\u0131rak',
                    other: 'Oranlar\u0131 devre d\u0131\u015F\u0131 b\u0131rak',
                }),
            },
            importedFromAccountingSoftware: 'A\u015Fa\u011F\u0131daki vergiler sizin taraf\u0131n\u0131zdan ithal edilmi\u015Ftir',
            taxCode: 'Vergi kodu',
            updateTaxCodeFailureMessage: 'Vergi kodunu g\u00FCncellerken bir hata olu\u015Ftu, l\u00FCtfen tekrar deneyin.',
        },
        emptyWorkspace: {
            title: 'Bir \u00E7al\u0131\u015Fma alan\u0131 olu\u015Fturun',
            subtitle:
                'Fi\u015Fleri takip etmek, masraflar\u0131 geri \u00F6demek, seyahatleri y\u00F6netmek, faturalar g\u00F6ndermek ve daha fazlas\u0131 i\u00E7in bir \u00E7al\u0131\u015Fma alan\u0131 olu\u015Fturun - t\u00FCm bunlar sohbet h\u0131z\u0131nda.',
            createAWorkspaceCTA: 'Ba\u015Fla',
            features: {
                trackAndCollect: 'Fi\u015Fleri takip et ve topla',
                reimbursements: '\u00C7al\u0131\u015Fanlar\u0131na \u00F6deme yap',
                companyCards: '\u015Eirket kartlar\u0131n\u0131 y\u00F6net',
            },
            notFound: 'Hi\u00E7bir \u00E7al\u0131\u015Fma alan\u0131 bulunamad\u0131',
            description:
                'Odalar, birden fazla ki\u015Fiyle tart\u0131\u015Fmak ve \u00E7al\u0131\u015Fmak i\u00E7in harika bir yerdir. \u0130\u015Fbirli\u011Fine ba\u015Flamak i\u00E7in bir \u00E7al\u0131\u015Fma alan\u0131 olu\u015Fturun veya kat\u0131l\u0131n.',
        },
        switcher: {
            headerTitle: '\u00C7al\u0131\u015Fma alan\u0131na g\u00F6re filtrele',
            everythingSection: 'Her \u015Eey',
            placeholder: 'Bir \u00E7al\u0131\u015Fma alan\u0131 bulun',
        },
        new: {
            newWorkspace: 'Yeni \u00E7al\u0131\u015Fma alan\u0131',
            getTheExpensifyCardAndMore: 'Expensify Card ve daha fazlas\u0131n\u0131 al\u0131n',
            confirmWorkspace: '\u00C7al\u0131\u015Fma Alan\u0131n\u0131 Onayla',
        },
        people: {
            genericFailureMessage: '\u00C7al\u0131\u015Fma alan\u0131ndan bir \u00FCye kald\u0131r\u0131l\u0131rken bir hata olu\u015Ftu, l\u00FCtfen tekrar deneyin.',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `Are you sure you want to remove ${memberName}?`,
                other: 'Bu \u00FCyeleri kald\u0131rmak istedi\u011Finizden emin misiniz?',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} is an approver in this workspace. When you unshare this workspace with them, we’ll replace them in the approval workflow with the workspace owner, ${ownerName}`,
            removeMembersTitle: () => ({
                one: '\u00DCye sil',
                other: '\u00DCyeleri kald\u0131r',
            }),
            removeWorkspaceMemberButtonTitle: '\u00C7al\u0131\u015Fma alan\u0131ndan kald\u0131r',
            removeGroupMemberButtonTitle: 'Gruptan \u00E7\u0131kar',
            removeRoomMemberButtonTitle: 'Sohbetten \u00E7\u0131kar',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `Are you sure you want to remove ${memberName}?`,
            removeMemberTitle: '\u00DCye sil',
            transferOwner: 'Transfer sahibi',
            makeMember: '\u00DCye yap',
            makeAdmin: 'Y\u00F6netici yap',
            makeAuditor: 'Denet\u00E7i yap',
            selectAll: 'T\u00FCm\u00FCn\u00FC se\u00E7in',
            error: {
                genericAdd: 'Bu \u00E7al\u0131\u015Fma alan\u0131 \u00FCyesini eklerken bir sorun olu\u015Ftu.',
                cannotRemove: 'Kendinizi veya \u00E7al\u0131\u015Fma alan\u0131 sahibini kald\u0131ramazs\u0131n\u0131z.',
                genericRemove: 'Bu \u00E7al\u0131\u015Fma alan\u0131 \u00FCyesini kald\u0131r\u0131rken bir sorun olu\u015Ftu.',
            },
            addedWithPrimary: 'Baz\u0131 \u00FCyeler, ana giri\u015F bilgileriyle eklendi.',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `\u0130kincil giri\u015F ${secondaryLogin} taraf\u0131ndan eklendi.`,
            membersListTitle: 'T\u00FCm \u00E7al\u0131\u015Fma alan\u0131 \u00FCyelerinin dizini.',
            importMembers: '\u00DCyeleri i\u00E7e aktar',
        },
        card: {
            getStartedIssuing: '\u0130lk sanal veya fiziksel kart\u0131n\u0131z\u0131 \u00E7\u0131kararak ba\u015Flay\u0131n.',
            issueCard: 'Kart \u00E7\u0131kar',
            issueNewCard: {
                whoNeedsCard: 'Kim bir kart ihtiya\u00E7 duyar?',
                findMember: '\u00DCye bul',
                chooseCardType: 'Bir kart t\u00FCr\u00FC se\u00E7in',
                physicalCard: 'Fiziksel kart',
                physicalCardDescription: 'S\u0131k s\u0131k harcama yapanlar i\u00E7in harika',
                virtualCard: 'Sanal kart',
                virtualCardDescription: 'Anl\u0131k ve esnek',
                chooseLimitType: 'Bir limit t\u00FCr\u00FC se\u00E7in',
                smartLimit: 'Ak\u0131ll\u0131 Limit',
                smartLimitDescription: 'Onay gerektirmeden \u00F6nce belirli bir miktar harcay\u0131n',
                monthly: 'Ayl\u0131k',
                monthlyDescription: 'Bir ayda belirli bir miktar harcay\u0131n',
                fixedAmount: 'Sabit miktar',
                fixedAmountDescription: 'Bir kereye mahsus belirli bir miktar harcay\u0131n',
                setLimit: 'Bir limit belirleyin',
                cardLimitError: "L\u00FCtfen $21,474,836'dan daha k\u00FC\u00E7\u00FCk bir miktar girin.",
                giveItName: 'Bir isim verin',
                giveItNameInstruction: 'Di\u011Fer kartlardan ay\u0131rt edilebilecek kadar benzersiz k\u0131l\u0131n. \u00D6zel kullan\u0131m durumlar\u0131 daha bile iyidir!',
                cardName: 'Kart ad\u0131',
                letsDoubleCheck: 'Her \u015Feyin do\u011Fru g\u00F6r\u00FCnd\u00FC\u011F\u00FCn\u00FC iki kez kontrol edelim.',
                willBeReady: 'Bu kart hemen kullan\u0131ma haz\u0131r olacak.',
                cardholder: 'Kart Sahibi',
                cardType: 'Kart tipi',
                limit: 'S\u0131n\u0131r',
                limitType: 'Limit t\u00FCr\u00FC',
                name: '\u0130sim',
            },
            deactivateCardModal: {
                deactivate: 'Devre D\u0131\u015F\u0131 B\u0131rak',
                deactivateCard: 'Kart\u0131 devre d\u0131\u015F\u0131 b\u0131rak',
                deactivateConfirmation: 'Bu kart\u0131 devre d\u0131\u015F\u0131 b\u0131rakmak, t\u00FCm gelecek i\u015Flemleri reddeder ve geri al\u0131namaz.',
            },
        },
        accounting: {
            settings: 'ayarlar',
            title: 'Ba\u011Flant\u0131lar',
            subtitle:
                'Muhasebe sisteminize ba\u011Flan\u0131n, i\u015Flemlerinizi hesap plan\u0131n\u0131zla kodlay\u0131n, \u00F6demeleri otomatik e\u015Fle\u015Ftirin ve finanslar\u0131n\u0131z\u0131 senkronize tutun.',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Masa\u00FCst\u00FC',
            xero: "Bu ya d\u00FCz bir dize ya da bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsillerini tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodlar\u0131n\u0131 i\u00E7erebilir.",
            netsuite: 'NetSuite',
            nsqs: 'Your request is not clear. Could you please provide the text or TypeScript function that you want to be translated?',
            intacct: 'Sage Intacct',
            talkYourOnboardingSpecialist: 'Kurulum uzman\u0131n\u0131zla sohbet edin.',
            talkYourAccountManager: 'Hesap y\u00F6neticinizle sohbet edin.',
            talkToConcierge: 'Concierge ile sohbet edin.',
            needAnotherAccounting: 'Ba\u015Fka bir muhasebe yaz\u0131l\u0131m\u0131na m\u0131 ihtiyac\u0131n\u0131z var?',
            connectionName: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'QuickBooks Online';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return "Bu ya d\u00FCz bir dize ya da bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsillerini tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodlar\u0131n\u0131 i\u00E7erebilir.";
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'NetSuite';
                    case CONST.POLICY.CONNECTIONS.NAME.NSQS:
                        return 'Your request is not clear. Could you please provide the text or TypeScript function that you want to be translated?';
                    case CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT:
                        return 'Sage Intacct';
                    default: {
                        return '';
                    }
                }
            },
            errorODIntegration: "Expensify Classic'ta kurulan bir ba\u011Flant\u0131yla ilgili bir hata var.",
            goToODToFix: "Bu sorunu \u00E7\u00F6zmek i\u00E7in Expensify Classic'e gidin.",
            goToODToSettings: "Ayarlar\u0131n\u0131z\u0131 y\u00F6netmek i\u00E7in Expensify Classic'e gidin.",
            setup: 'Ba\u011Flan',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `Son senkronizasyon ${relativeDate}`,
            import: '\u0130\u00E7e Aktar',
            export: 'D\u0131\u015Fa Aktar',
            advanced:
                "Bu, d\u00FCz bir dize veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeler veya ba\u015Fka TypeScript kodunu i\u00E7erebilir.",
            other: 'Di\u011Fer entegrasyonlar',
            syncNow: '\u015Eimdi senkronize et',
            disconnect: 'Ba\u011Flant\u0131y\u0131 Kes',
            reinstall: 'Ba\u011Flay\u0131c\u0131y\u0131 yeniden y\u00FCkleyin',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'entegrasyon';
                return `Disconnect ${integrationName}`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `Connect ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'accounting integration'}`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return "QuickBooks Online'a ba\u011Flan\u0131lam\u0131yor.";
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return "Xero'ya ba\u011Flan\u0131lam\u0131yor.";
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return "NetSuite'e ba\u011Flan\u0131lam\u0131yor.";
                    case CONST.POLICY.CONNECTIONS.NAME.NSQS:
                        return "NSQS'ye ba\u011Flan\u0131lam\u0131yor.";
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return "QuickBooks Masa\u00FCst\u00FC'ne ba\u011Flan\u0131lam\u0131yor.";
                    default: {
                        return 'Entegrasyona ba\u011Flan\u0131lam\u0131yor.';
                    }
                }
            },
            accounts: 'Hesap plan\u0131',
            taxes: 'Vergiler',
            imported: '\u0130\u00E7e Aktar\u0131ld\u0131',
            notImported: '\u0130\u00E7e aktar\u0131lmad\u0131',
            importAsCategory: 'Kategoriler olarak i\u00E7e aktar\u0131ld\u0131',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: '\u0130\u00E7e Aktar\u0131ld\u0131',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'Etiketler olarak i\u00E7e aktar\u0131ld\u0131',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: '\u0130\u00E7e Aktar\u0131ld\u0131',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '\u0130\u00E7e aktar\u0131lmad\u0131',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '\u0130\u00E7e aktar\u0131lmad\u0131',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'Rapor alanlar\u0131 olarak i\u00E7e aktar\u0131ld\u0131',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite \u00E7al\u0131\u015Fan\u0131 varsay\u0131lan',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'bu entegrasyon';
                return `Are you sure you want to disconnect ${integrationName}?`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `Are you sure you want to connect ${
                    CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'this accounting integration'
                }? This will remove any existing acounting connections.`,
            enterCredentials: 'Kimlik bilgilerinizi girin',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return 'M\u00FC\u015Fterileri i\u00E7e aktarma';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return '\u00C7al\u0131\u015Fanlar\u0131 i\u00E7e aktarma';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'Hesaplar\u0131 i\u00E7e aktarma';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'S\u0131n\u0131flar\u0131 i\u00E7e aktarma';
                        case 'quickbooksOnlineImportLocations':
                            return 'Konumlar\u0131 i\u00E7e aktarma';
                        case 'quickbooksOnlineImportProcessing':
                            return '\u0130\u00E7e aktar\u0131lan verileri i\u015Fleme';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '\u00D6denmi\u015F raporlar\u0131 ve fatura \u00F6demelerini senkronize etme';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return 'Vergi kodlar\u0131n\u0131 i\u00E7e aktarma';
                        case 'quickbooksOnlineCheckConnection':
                            return 'QuickBooks Online ba\u011Flant\u0131s\u0131n\u0131 kontrol etme';
                        case 'quickbooksOnlineImportMain':
                            return 'QuickBooks Online verilerini i\u00E7e aktarma';
                        case 'startingImportXero':
                            return 'Xero verilerini i\u00E7e aktarma';
                        case 'startingImportQBO':
                            return 'QuickBooks Online verilerini i\u00E7e aktarma';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'QuickBooks Masa\u00FCst\u00FC verilerini i\u00E7e aktarma';
                        case 'quickbooksDesktopImportTitle':
                            return 'Ba\u015Fl\u0131k \u0130\u00E7e Aktar\u0131l\u0131yor';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return 'Sertifikay\u0131 onaylama i\u015Flemi';
                        case 'quickbooksDesktopImportDimensions':
                            return 'Boyutlar\u0131 i\u00E7e aktarma';
                        case 'quickbooksDesktopImportSavePolicy':
                            return 'Kaydetme politikas\u0131n\u0131 i\u00E7e aktarma';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return "QuickBooks ile veri senkronizasyonu hala devam ediyor... L\u00FCtfen Web Connector'\u0131n \u00E7al\u0131\u015Ft\u0131\u011F\u0131ndan emin olun";
                        case 'quickbooksOnlineSyncTitle':
                            return 'QuickBooks Online verilerini senkronize etme';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'Veri y\u00FCkleniyor';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'Kategorileri g\u00FCncelleme';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return 'M\u00FC\u015Fteriler/projeler g\u00FCncelleniyor';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'Ki\u015Fi listesi g\u00FCncelleniyor';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'Rapor alanlar\u0131n\u0131 g\u00FCncelleme';
                        case 'jobDone':
                            return '\u0130\u00E7e aktar\u0131lan verilerin y\u00FCklenmesini bekliyor';
                        case 'xeroSyncImportChartOfAccounts':
                            return 'Muhasebe hesaplar\u0131n\u0131 senkronize etme';
                        case 'xeroSyncImportCategories':
                            return 'Kategorileri senkronize etme';
                        case 'xeroSyncImportCustomers':
                            return 'M\u00FC\u015Fterileri senkronize etme';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Expensify raporlar\u0131n\u0131 geri \u00F6dendi olarak i\u015Faretleme';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Xero faturalar\u0131n\u0131 ve faturalar\u0131 \u00F6denmi\u015F olarak i\u015Faretleme';
                        case 'xeroSyncImportTrackingCategories':
                            return 'Takip kategorilerini senkronize etme';
                        case 'xeroSyncImportBankAccounts':
                            return 'Banka hesaplar\u0131n\u0131 senkronize etme';
                        case 'xeroSyncImportTaxRates':
                            return 'Vergi oranlar\u0131n\u0131 senkronize etme';
                        case 'xeroCheckConnection':
                            return 'Xero ba\u011Flant\u0131s\u0131n\u0131 kontrol etme';
                        case 'xeroSyncTitle':
                            return 'Xero verilerini senkronize etme';
                        case 'netSuiteSyncConnection':
                            return "NetSuite'e ba\u011Flant\u0131 ba\u015Flat\u0131l\u0131yor";
                        case 'netSuiteSyncCustomers':
                            return 'M\u00FC\u015Fterileri i\u00E7e aktarma';
                        case 'netSuiteSyncInitData':
                            return "NetSuite'ten veri al\u0131n\u0131yor";
                        case 'netSuiteSyncImportTaxes':
                            return '\u0130thalat vergileri';
                        case 'netSuiteSyncImportItems':
                            return '\u00D6\u011Feleri i\u00E7e aktarma';
                        case 'netSuiteSyncData':
                            return "Expensify'ye veri aktarma";
                        case 'netSuiteSyncAccounts':
                        case 'nsqsSyncAccounts':
                            return 'Hesaplar\u0131 senkronize etme';
                        case 'netSuiteSyncCurrencies':
                            return 'Para birimleri senkronize ediliyor';
                        case 'netSuiteSyncCategories':
                            return 'Kategorileri senkronize etme';
                        case 'netSuiteSyncReportFields':
                            return 'Veri, Expensify rapor alanlar\u0131 olarak i\u00E7e aktar\u0131l\u0131yor';
                        case 'netSuiteSyncTags':
                            return 'Verileri Expensify etiketleri olarak i\u00E7e aktarma';
                        case 'netSuiteSyncUpdateConnectionData':
                            return 'Ba\u011Flant\u0131 bilgisi g\u00FCncelleniyor';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensify raporlar\u0131n\u0131 geri \u00F6dendi olarak i\u015Faretleme';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuite faturalar\u0131n\u0131 ve faturalar\u0131 \u00F6denmi\u015F olarak i\u015Faretleme';
                        case 'netSuiteImportVendorsTitle':
                            return 'Tedarik\u00E7ileri i\u00E7e aktarma';
                        case 'netSuiteImportCustomListsTitle':
                            return '\u00D6zel listeleri i\u00E7e aktarma';
                        case 'netSuiteSyncImportCustomLists':
                            return '\u00D6zel listeleri i\u00E7e aktarma';
                        case 'netSuiteSyncImportSubsidiaries':
                            return 'Ba\u011Fl\u0131 ortakl\u0131klar\u0131 i\u00E7e aktarma';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return 'Tedarik\u00E7ileri i\u00E7e aktarma';
                        case 'nsqsSyncConnection':
                            return "NSQS'ye ba\u011Flant\u0131 ba\u015Flat\u0131l\u0131yor";
                        case 'nsqsSyncEmployees':
                            return '\u00C7al\u0131\u015Fanlar\u0131 senkronize etme';
                        case 'nsqsSyncCustomers':
                            return 'M\u00FC\u015Fterileri senkronize etme';
                        case 'nsqsSyncProjects':
                            return 'Projeleri senkronize etme';
                        case 'nsqsSyncCurrency':
                            return 'Para birimi senkronize ediliyor';
                        case 'intacctCheckConnection':
                            return 'Sage Intacct ba\u011Flant\u0131s\u0131n\u0131 kontrol ediyor';
                        case 'intacctImportDimensions':
                            return 'Sage Intacct boyutlar\u0131n\u0131 i\u00E7e aktarma';
                        case 'intacctImportTitle':
                            return 'Sage Intacct verilerini i\u00E7e aktarma';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `A\u015Fama i\u00E7in \u00E7eviri eksik: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: 'Tercih edilen ihracat\u00E7\u0131',
            exportPreferredExporterNote:
                "Tercih edilen ihracat\u00E7\u0131 herhangi bir \u00E7al\u0131\u015Fma alan\u0131 y\u00F6neticisi olabilir, ancak Alan Ayarlar\u0131'nda bireysel \u015Firket kartlar\u0131 i\u00E7in farkl\u0131 ihracat hesaplar\u0131 ayarlarsan\u0131z ayn\u0131 zamanda bir Alan Y\u00F6neticisi de olmal\u0131d\u0131r.",
            exportPreferredExporterSubNote:
                'Bir kere ayarland\u0131\u011F\u0131nda, tercih edilen ihracat\u00E7\u0131 raporlar\u0131 kendi hesaplar\u0131nda ihracat i\u00E7in g\u00F6recektir.',
            exportAs: 'D\u0131\u015Fa aktar olarak',
            exportOutOfPocket: 'Cebinden \u00F6denen giderleri d\u0131\u015Fa aktar\u0131n',
            exportCompanyCard: '\u015Eirket kart\u0131 giderlerini d\u0131\u015Fa aktar\u0131n olarak',
            exportDate: '\u0130hracat tarihi',
            defaultVendor: 'Varsay\u0131lan sat\u0131c\u0131',
            autoSync: 'Oto-senkronizasyon',
            autoSyncDescription: "Her g\u00FCn NetSuite ve Expensify'yi otomatik olarak senkronize edin. Sonu\u00E7lanan raporu ger\u00E7ek zamanl\u0131 olarak d\u0131\u015Fa aktar\u0131n.",
            reimbursedReports: 'Senkronize edilmi\u015F raporlar\u0131 geri \u00F6de',
            cardReconciliation: 'Kart Mutabakat\u0131',
            reconciliationAccount: 'Mutabakat hesab\u0131',
            continuousReconciliation: 'S\u00FCrekli Uzla\u015Ft\u0131rma',
            saveHoursOnReconciliation:
                "Her muhasebe d\u00F6neminde Expensify'nin s\u00FCrekli olarak sizin ad\u0131n\u0131za Expensify Card ekstrelerini ve \u00F6demelerini uzla\u015Ft\u0131rmas\u0131 sayesinde saatlerce zaman kazan\u0131n.",
            enableContinuousReconciliation: "S\u00FCrekli Uyumla\u015Ft\u0131rma'y\u0131 etkinle\u015Ftirmek i\u00E7in, l\u00FCtfen ${username} etkinle\u015Ftirin.",
            chooseReconciliationAccount: {
                chooseBankAccount: 'Expensify Card \u00F6demelerinizin kar\u015F\u0131la\u015Ft\u0131r\u0131laca\u011F\u0131 banka hesab\u0131n\u0131 se\u00E7in.',
                accountMatches: 'Bu hesab\u0131n sizinkiyle e\u015Fle\u015Fti\u011Finden emin olun',
                settlementAccount: 'Expensify Card hesap \u00F6zeti',
                reconciliationWorks: ({lastFourPAN}: ReconciliationWorksParams) => `(${lastFourPAN} ile biten) b\u00F6ylece S\u00FCrekli Uyum d\u00FCzg\u00FCn \u00E7al\u0131\u015F\u0131r.`,
            },
        },
        export: {
            notReadyHeading: 'D\u0131\u015Fa aktarmaya haz\u0131r de\u011Fil',
            notReadyDescription:
                'Taslak veya bekleyen masraf raporlar\u0131 muhasebe sistemine aktar\u0131lamaz. L\u00FCtfen bu masraflar\u0131 aktarmadan \u00F6nce onaylay\u0131n veya \u00F6deyin.',
        },
        invoices: {
            sendInvoice: 'Fatura g\u00F6nder',
            sendFrom: 'G\u00F6nderen',
            invoicingDetails: 'Faturaland\u0131rma detaylar\u0131',
            invoicingDetailsDescription: 'Bu bilgi faturalar\u0131n\u0131zda g\u00F6r\u00FCnecektir.',
            companyName: '\u015Eirket ismi',
            companyWebsite: '\u015Eirket web sitesi',
            paymentMethods: {
                personal: 'Ki\u015Fisel',
                business: '\u0130\u015F',
                chooseInvoiceMethod: 'A\u015Fa\u011F\u0131dan bir \u00F6deme y\u00F6ntemi se\u00E7in:',
                addBankAccount: 'Banka hesab\u0131 ekle',
                payingAsIndividual: 'Birey olarak \u00F6deme yapma',
                payingAsBusiness: 'Bir i\u015Fletme olarak \u00F6deme yapma',
            },
            invoiceBalance: 'Fatura bakiyesi',
            invoiceBalanceSubtitle:
                'Bu, fatura \u00F6demelerini toplaman\u0131zdan kaynaklanan mevcut bakiyenizdir. E\u011Fer bir banka hesab\u0131 eklediyseniz, otomatik olarak banka hesab\u0131n\u0131za aktar\u0131lacakt\u0131r.',
            bankAccountsSubtitle: 'Fatura \u00F6demeleri yapmak ve almak i\u00E7in bir banka hesab\u0131 ekleyin.',
        },
        invite: {
            member: '\u00DCye davet et',
            members: '\u00DCyeleri davet et',
            invitePeople: 'Yeni \u00FCyeleri davet et',
            genericFailureMessage: '\u00DCye, \u00E7al\u0131\u015Fma alan\u0131na davet edilirken bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin.',
            pleaseEnterValidLogin: `L\u00FCtfen e-posta veya telefon numaras\u0131n\u0131n ge\u00E7erli oldu\u011Fundan emin olun (\u00F6r. ${CONST.EXAMPLE_PHONE_NUMBER}).`,
            user: "Bu bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeler veya ba\u015Fka TypeScript kodu i\u00E7erebilir.",
            users: 'kullan\u0131c\u0131lar',
            invited: 'davet edildi',
            removed: 'kald\u0131r\u0131ld\u0131',
            to: "Bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsillerini tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodlar\u0131n\u0131 i\u00E7erebilir.",
            from: "You didn't provide any text to translate. Please provide the text you want to be translated.",
        },
        inviteMessage: {
            confirmDetails: 'Detaylar\u0131 onaylay\u0131n',
            inviteMessagePrompt: 'Davetinizi a\u015Fa\u011F\u0131ya bir mesaj ekleyerek ekstra \u00F6zel hale getirin!',
            personalMessagePrompt: 'Mesaj',
            genericFailureMessage: '\u00DCye, \u00E7al\u0131\u015Fma alan\u0131na davet edilirken bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin.',
            inviteNoMembersError: 'L\u00FCtfen davet etmek i\u00E7in en az bir \u00FCye se\u00E7in.',
        },
        distanceRates: {
            oopsNotSoFast: 'Hata! Bu kadar h\u0131zl\u0131 olmay\u0131n...',
            workspaceNeeds: 'Bir \u00E7al\u0131\u015Fma alan\u0131n\u0131n en az bir etkin mesafe oran\u0131na ihtiyac\u0131 vard\u0131r.',
            distance: 'Mesafe',
            centrallyManage: 'Merkezi olarak fiyatlar\u0131 y\u00F6netin, mil veya kilometre olarak izleyin ve varsay\u0131lan bir kategori belirleyin.',
            rate: 'Oran',
            addRate: 'Oran ekle',
            trackTax: 'Vergi takibi',
            deleteRates: () => ({
                one: 'Silme oran\u0131',
                other: 'Silme oranlar\u0131',
            }),
            enableRates: () => ({
                one: 'Oran\u0131 etkinle\u015Ftir',
                other: 'Oranlar\u0131 etkinle\u015Ftir',
            }),
            disableRates: () => ({
                one: 'Oran\u0131 devre d\u0131\u015F\u0131 b\u0131rak',
                other: 'Oranlar\u0131 devre d\u0131\u015F\u0131 b\u0131rak',
            }),
            enableRate: 'Oran\u0131 etkinle\u015Ftir',
            status: 'Durum',
            unit: 'Birimi',
            taxFeatureNotEnabledMessage:
                'Bu \u00F6zelli\u011Fi kullanmak i\u00E7in i\u015F alan\u0131nda vergilerin etkinle\u015Ftirilmi\u015F olmas\u0131 gerekmektedir. \u015Euraya gidin:',
            changePromptMessage: 'Bu de\u011Fi\u015Fikli\u011Fi yapmak.',
            deleteDistanceRate: 'Mesafe oran\u0131n\u0131 sil',
            areYouSureDelete: () => ({
                one: 'Bu oran\u0131 silmek istedi\u011Finizden emin misiniz?',
                other: 'Bu oranlar\u0131 silmek istedi\u011Finizden emin misiniz?',
            }),
        },
        editor: {
            descriptionInputLabel: 'A\u00E7\u0131klama',
            nameInputLabel: '\u0130sim',
            typeInputLabel: 'Your request is incomplete. Please provide the text or TypeScript function that you want to translate.',
            initialValueInputLabel: '\u0130lk de\u011Fer',
            nameInputHelpText: 'Bu, \u00E7al\u0131\u015Fma alan\u0131n\u0131zda g\u00F6rece\u011Finiz isimdir.',
            nameIsRequiredError: '\u00C7al\u0131\u015Fma alan\u0131n\u0131za bir isim vermeniz gerekecek.',
            currencyInputLabel: 'Varsay\u0131lan para birimi',
            currencyInputHelpText: 'Bu \u00E7al\u0131\u015Fma alan\u0131ndaki t\u00FCm masraflar bu para birimine d\u00F6n\u00FC\u015Ft\u00FCr\u00FClecektir.',
            currencyInputDisabledText:
                'Varsay\u0131lan para birimi de\u011Fi\u015Ftirilemez \u00E7\u00FCnk\u00FC bu \u00E7al\u0131\u015Fma alan\u0131 bir USD banka hesab\u0131na ba\u011Fl\u0131d\u0131r.',
            save: 'Kaydet',
            genericFailureMessage: '\u00C7al\u0131\u015Fma alan\u0131n\u0131 g\u00FCncellerken bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin.',
            avatarUploadFailureMessage: 'Avatar y\u00FCklenirken bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin.',
            addressContext:
                "Expensify Travel'\u0131 etkinle\u015Ftirmek i\u00E7in bir \u00C7al\u0131\u015Fma Alan\u0131 Adresi gereklidir. L\u00FCtfen i\u015Fletmenizle ili\u015Fkili bir adres girin.",
        },
        bankAccount: {
            continueWithSetup: 'Kurulumu s\u00FCrd\u00FCr',
            youreAlmostDone:
                'Banka hesab\u0131n\u0131z\u0131 kurma i\u015Fleminizi neredeyse tamamlad\u0131n\u0131z, bu size kurumsal kartlar \u00E7\u0131karmak, masraflar\u0131 geri \u00F6demek, faturalar\u0131 toplamak ve faturalar\u0131 \u00F6demek imkan\u0131 sa\u011Flayacak.',
            streamlinePayments: '\u00D6demeleri kolayla\u015Ft\u0131r\u0131n',
            connectBankAccountNote: 'Not: Ki\u015Fisel banka hesaplar\u0131, \u00E7al\u0131\u015Fma alanlar\u0131ndaki \u00F6demeler i\u00E7in kullan\u0131lamaz.',
            oneMoreThing: 'Bir \u015Fey daha!',
            allSet: 'Her \u015Fey haz\u0131r!',
            accountDescriptionWithCards:
                'Bu banka hesab\u0131, kurumsal kartlar \u00E7\u0131karmak, masraflar\u0131 kar\u015F\u0131lamak, faturalar\u0131 toplamak ve faturalar\u0131 \u00F6demek i\u00E7in kullan\u0131lacakt\u0131r.',
            letsFinishInChat: 'Hadi, sohbette bitirelim!',
            almostDone: 'Neredeyse bitti!',
            disconnectBankAccount: 'Banka hesab\u0131n\u0131 ba\u011Flant\u0131s\u0131n\u0131 kes',
            noLetsStartOver: 'Hay\u0131r, ba\u015Ftan ba\u015Flayal\u0131m',
            startOver: 'Ba\u015Ftan ba\u015Fla',
            yesDisconnectMyBankAccount: 'Evet, banka hesab\u0131m\u0131 ba\u011Flant\u0131s\u0131n\u0131 kes',
            yesStartOver: 'Evet, ba\u015Ftan ba\u015Fla',
            disconnectYour: 'Ba\u011Flant\u0131n\u0131z\u0131 kesin',
            bankAccountAnyTransactions: 'banka hesab\u0131. Bu hesap i\u00E7in bekleyen herhangi bir i\u015Flem hala tamamlanacak.',
            clearProgress: 'Ba\u015Ftan ba\u015Flamak \u015Fimdiye kadar yapt\u0131\u011F\u0131n\u0131z ilerlemeyi silecektir.',
            areYouSure: 'Emin misiniz?',
            workspaceCurrency: '\u00C7al\u0131\u015Fma alan\u0131 para birimi',
            updateCurrencyPrompt:
                "G\u00F6r\u00FCn\u00FC\u015Fe g\u00F6re \u00E7al\u0131\u015Fma alan\u0131n\u0131z \u015Fu anda USD'den farkl\u0131 bir para birimine ayarlanm\u0131\u015F. L\u00FCtfen para biriminizi \u015Fimdi USD'ye g\u00FCncellemek i\u00E7in a\u015Fa\u011F\u0131daki d\u00FC\u011Fmeye t\u0131klay\u0131n.",
            updateToUSD: "USD'ye G\u00FCncelle",
        },
        changeOwner: {
            changeOwnerPageTitle: 'Transfer sahibi',
            addPaymentCardTitle: '\u00D6deme kart\u0131n\u0131z\u0131 girin ve m\u00FClkiyeti transfer edin',
            addPaymentCardButtonText: '\u015Eartlar\u0131 kabul et & \u00F6deme kart\u0131 ekle',
            addPaymentCardReadAndAcceptTextPart1: 'Oku ve kabul et',
            addPaymentCardReadAndAcceptTextPart2: 'kart\u0131n\u0131z\u0131 eklemek i\u00E7in politika',
            addPaymentCardTerms: 'The text you want to translate is missing. Please provide the text you want to translate.',
            addPaymentCardPrivacy: 'gizlilik',
            addPaymentCardAnd: 'Your request seems to be incomplete. Please provide the text or TypeScript function that you want to be translated.',
            addPaymentCardPciCompliant: 'PCI-DSS uyumlu',
            addPaymentCardBankLevelEncrypt: 'Banka d\u00FCzeyi \u015Fifreleme',
            addPaymentCardRedundant: 'Fazla altyap\u0131',
            addPaymentCardLearnMore: 'Hakk\u0131m\u0131zda daha fazla bilgi edinin',
            addPaymentCardSecurity: 'g\u00FCvenlik',
            amountOwedTitle: 'Kalan bakiye',
            amountOwedButtonText: "You didn't provide any text to translate. Please provide the text you want translated.",
            amountOwedText:
                'Bu hesab\u0131n \u00F6nceki bir aydan kalan \u00F6denmemi\u015F bir bakiyesi bulunmaktad\u0131r.\n\nBakiyeyi s\u0131f\u0131rlamak ve bu \u00E7al\u0131\u015Fma alan\u0131n\u0131n faturaland\u0131rmas\u0131n\u0131 \u00FCstlenmek istiyor musunuz?',
            ownerOwesAmountTitle: 'Kalan bakiye',
            ownerOwesAmountButtonText: 'Bakiye transferi',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) =>
                `Bu \u00E7al\u0131\u015Fma alan\u0131n\u0131n sahibi olan hesab\u0131n (${email}) \u00F6nceki bir aydan kalan \u00F6denmemi\u015F bir bakiyesi bulunmaktad\u0131r.\n\nBu tutar\u0131 (${amount}) devralmak ve bu \u00E7al\u0131\u015Fma alan\u0131n\u0131n faturaland\u0131rmas\u0131n\u0131 \u00FCstlenmek ister misiniz? \u00D6deme kart\u0131n\u0131z hemen tahsil edilecektir.`,
            subscriptionTitle: 'Y\u0131ll\u0131k aboneli\u011Fi devral',
            subscriptionButtonText: 'Aboneli\u011Fi aktar',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `Bu \u00E7al\u0131\u015Fma alan\u0131n\u0131 devralmak, y\u0131ll\u0131k aboneli\u011Fini mevcut aboneli\u011Finle birle\u015Ftirecektir. Bu, aboneli\u011Finizin boyutunu ${usersCount} \u00FCye art\u0131rarak yeni abonelik boyutunuzu ${finalCount} yapacakt\u0131r. Devam etmek ister misiniz?`,
            duplicateSubscriptionTitle: 'Yinelenen abonelik uyar\u0131s\u0131',
            duplicateSubscriptionButtonText: "You didn't provide any text to translate. Please provide the text you want to be translated.",
            duplicateSubscriptionText: ({email, workspaceName}: ChangeOwnerDuplicateSubscriptionParams) =>
                `G\u00F6r\u00FCn\u00FC\u015Fe g\u00F6re ${email}'in \u00E7al\u0131\u015Fma alanlar\u0131 i\u00E7in faturaland\u0131rmay\u0131 devralmaya \u00E7al\u0131\u015F\u0131yor olabilirsiniz, ancak bunu yapmak i\u00E7in \u00F6ncelikle t\u00FCm \u00E7al\u0131\u015Fma alanlar\u0131nda y\u00F6netici olman\u0131z gerekmektedir.\n\nYaln\u0131zca ${workspaceName} \u00E7al\u0131\u015Fma alan\u0131 i\u00E7in faturaland\u0131rmay\u0131 devralmak istiyorsan\u0131z "Devam Et"i t\u0131klay\u0131n.\n\nT\u00FCm abonelikleri i\u00E7in faturaland\u0131rmay\u0131 devralmak istiyorsan\u0131z, l\u00FCtfen faturaland\u0131rmay\u0131 devralmadan \u00F6nce sizi t\u00FCm \u00E7al\u0131\u015Fma alanlar\u0131na y\u00F6netici olarak eklemelerini isteyin.`,
            hasFailedSettlementsTitle: 'M\u00FClkiyeti transfer edemez',
            hasFailedSettlementsButtonText: 'Anlad\u0131m',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `Faturalamay\u0131 devralamazs\u0131n\u0131z \u00E7\u00FCnk\u00FC ${email} gecikmi\u015F bir Expensify Card hesaplamas\u0131 bulunmaktad\u0131r. L\u00FCtfen sorunu \u00E7\u00F6zmek i\u00E7in concierge@expensify.com'a ba\u015Fvurmalar\u0131n\u0131 isteyin. Daha sonra, bu \u00E7al\u0131\u015Fma alan\u0131 i\u00E7in faturalamay\u0131 devralabilirsiniz.`,
            failedToClearBalanceTitle: 'Bakiye temizleme ba\u015Far\u0131s\u0131z oldu',
            failedToClearBalanceButtonText: "You didn't provide any text to translate. Please provide the text you want translated.",
            failedToClearBalanceText: 'Bakiyeyi s\u0131f\u0131rlayamad\u0131k. L\u00FCtfen daha sonra tekrar deneyin.',
            successTitle: 'Woohoo! Hepsi haz\u0131r.',
            successDescription: 'Art\u0131k bu \u00E7al\u0131\u015Fma alan\u0131n\u0131n sahibisiniz.',
            errorTitle: 'Hata! Bu kadar h\u0131zl\u0131 olmay\u0131n...',
            errorDescriptionPartOne: 'Bu \u00E7al\u0131\u015Fma alan\u0131n\u0131n sahipli\u011Fini aktar\u0131rken bir sorun olu\u015Ftu. Tekrar deneyin, ya da',
            errorDescriptionPartTwo: 'Concierge ile ileti\u015Fime ge\u00E7in',
            errorDescriptionPartThree: 'yard\u0131m i\u00E7in.',
        },
        exportAgainModal: {
            title: 'Dikkat!',
            description: ({reportName, connectionName}: ExportAgainModalDescriptionParams) =>
                `A\u015Fa\u011F\u0131daki raporlar zaten ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}'e aktar\u0131ld\u0131:\n\n${reportName}\n\nOnlar\u0131 tekrar aktarmak istedi\u011Finize emin misiniz?`,
            confirmText: 'Evet, tekrar d\u0131\u015Fa aktar',
            cancelText: '\u0130ptal',
        },
        upgrade: {
            reportFields: {
                title: 'Rapor alanlar\u0131',
                description: `Report fields let you specify header-level details, distinct from tags that pertain to expenses on individual line items. These details can encompass specific project names, business trip information, locations, and more.`,
                onlyAvailableOnPlan: 'Rapor alanlar\u0131 yaln\u0131zca Kontrol plan\u0131nda mevcuttur, ${count} ba\u015Flang\u0131\u00E7l\u0131.',
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Enjoy automated syncing and reduce manual entries with the Expensify + NetSuite integration. Gain in-depth, realtime financial insights with native and custom segment support, including project and customer mapping.`,
                onlyAvailableOnPlan: 'NetSuite entegrasyonumuz yaln\u0131zca Control plan\u0131nda mevcuttur, ${count} ile ba\u015Flar.',
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Enjoy automated syncing and reduce manual entries with the Expensify + Sage Intacct integration. Gain in-depth, real-time financial insights with user-defined dimensions, as well as expense coding by department, class, location, customer, and project (job).`,
                onlyAvailableOnPlan: 'Sage Intacct entegrasyonumuz yaln\u0131zca Control plan\u0131nda mevcuttur, ba\u015Flang\u0131\u00E7 fiyat\u0131yla',
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Masa\u00FCst\u00FC',
                description: `Enjoy automated syncing and reduce manual entries with the Expensify + QuickBooks Desktop integration. Gain ultimate efficiency with a realtime, two-way connection and expense coding by class, item, customer, and project.`,
                onlyAvailableOnPlan: 'QuickBooks Desktop entegrasyonumuz yaln\u0131zca Control plan\u0131nda mevcuttur, ${count} ile ba\u015Flar.',
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: 'Geli\u015Fmi\u015F Onaylar',
                description: `If you want to add more layers of approval to the mix – or just make sure the largest expenses get another set of eyes – we’ve got you covered. Advanced approvals help you put the right checks in place at every level so you keep your team’s spend under control.`,
                onlyAvailableOnPlan: 'Geli\u015Fmi\u015F onaylar yaln\u0131zca Control plan\u0131nda mevcuttur, bu da ${count} ile ba\u015Flar.',
            },
            categories: {
                title: 'Kategoriler',
                description: `Categories help you better organize expenses to keep track of where you're spending your money. Use our suggested categories list or create your own.`,
                onlyAvailableOnPlan: 'Kategoriler, Collect plan\u0131nda mevcuttur, ${count} ba\u015Flang\u0131\u00E7 fiyat\u0131yla.',
            },
            glCodes: {
                title: 'GL kodlar\u0131',
                description: `Add GL codes to your categories and tags for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: 'GL kodlar\u0131 yaln\u0131zca Control plan\u0131nda mevcuttur, ba\u015Flang\u0131\u00E7 olarak',
            },
            glAndPayrollCodes: {
                title: 'GL & Bordro kodlar\u0131',
                description: `Add GL & Payroll codes to your categories for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: 'GL & Bordro kodlar\u0131 yaln\u0131zca Control plan\u0131nda mevcuttur, ${count} ile ba\u015Flar.',
            },
            taxCodes: {
                title: 'Vergi kodlar\u0131',
                description: `Add tax codes to your taxes for easy export of expenses to your accounting and payroll systems.`,
                onlyAvailableOnPlan: 'Vergi kodlar\u0131 yaln\u0131zca Control plan\u0131nda mevcuttur, ${username} ile ba\u015Flar.',
            },
            companyCards: {
                title: '\u015Eirket kartlar\u0131',
                description: `Connect your existing corporate cards to Expensify, assign them to employees, and automatically import transactions.`,
                onlyAvailableOnPlan: '\u015Eirket kartlar\u0131 sadece Control plan\u0131nda mevcuttur, ${count} ile ba\u015Flar.',
            },
            rules: {
                title: 'Kurallar',
                description: `Rules run in the background and keep your spend under control so you don't have to sweat the small stuff.\n\nRequire expense details like receipts and descriptions, set limits and defaults, and automate approvals and payments – all in one place.`,
                onlyAvailableOnPlan: 'Kurallar sadece Kontrol plan\u0131nda mevcuttur, ${username} ile ba\u015Flar.',
            },
            perDiem: {
                title: 'G\u00FCnl\u00FCk',
                description:
                    'G\u00FCnl\u00FCk \u00F6deme, \u00E7al\u0131\u015Fanlar\u0131n\u0131z seyahat etti\u011Finde g\u00FCnl\u00FCk maliyetlerinizi uyumlu ve \u00F6ng\u00F6r\u00FClebilir tutman\u0131n harika bir yoludur. \u00D6zel oranlar, varsay\u0131lan kategoriler ve hedefler ve alt oranlar gibi daha ayr\u0131nt\u0131l\u0131 \u00F6zelliklerin keyfini \u00E7\u0131kar\u0131n.',
                onlyAvailableOnPlan: 'G\u00FCnl\u00FCk \u00F6demeler yaln\u0131zca Control plan\u0131nda mevcuttur, ${count} ile ba\u015Flar.',
            },
            travel: {
                title: 'Seyahat',
                description:
                    'Expensify Travel, konaklamalar, u\u00E7u\u015Flar, ula\u015F\u0131m ve daha fazlas\u0131n\u0131 rezerve etmeye olanak sa\u011Flayan yeni bir kurumsal seyahat rezervasyon ve y\u00F6netim platformudur.',
                onlyAvailableOnPlan: 'Collect plan \u00FCzerinden seyahat mevcuttur, ba\u015Flang\u0131\u00E7 fiyat\u0131yla',
            },
            pricing: {
                perActiveMember: 'ayda her aktif \u00FCye ba\u015F\u0131na.',
            },
            note: {
                upgradeWorkspace: 'Bu \u00F6zelli\u011Fe eri\u015Fmek i\u00E7in \u00E7al\u0131\u015Fma alan\u0131n\u0131z\u0131 y\u00FCkseltin, veya',
                learnMore: 'daha fazla \u00F6\u011Fren',
                aboutOurPlans: 'bizim planlar\u0131m\u0131z ve fiyatland\u0131rmam\u0131z hakk\u0131nda.',
            },
            upgradeToUnlock: 'Bu \u00F6zelli\u011Fi kilidini a\u00E7\u0131n',
            completed: {
                headline: `You've upgraded your workspace!`,
                successMessage: ({policyName}: ReportPolicyNameParams) => `You've successfully upgraded ${policyName} to the Control plan!`,
                categorizeMessage: `You've successfully upgraded to a workspace on the Collect plan. Now you can categorize your expenses!`,
                travelMessage: `You've successfully upgraded to a workspace on the Collect plan. Now you can start booking and managing travel!`,
                viewSubscription: 'Aboneli\u011Finizi g\u00F6r\u00FCnt\u00FCleyin',
                moreDetails: 'daha fazla detay i\u00E7in.',
                gotIt: 'Anlad\u0131m, te\u015Fekk\u00FCrler',
            },
            commonFeatures: {
                title: 'Kontrol plan\u0131na y\u00FCkseltin',
                note: 'En g\u00FC\u00E7l\u00FC \u00F6zelliklerimizin kilidini a\u00E7\u0131n, bunlar aras\u0131nda:',
                benefits: {
                    startsAt: "Kontrol plan\u0131 \u015Fu anda ba\u015Flar ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}",
                    perMember: 'ayda her aktif \u00FCye ba\u015F\u0131na.',
                    learnMore: 'Daha fazla \u00F6\u011Fren',
                    pricing: 'bizim planlar\u0131m\u0131z ve fiyatland\u0131rmam\u0131z hakk\u0131nda.',
                    benefit1: 'Geli\u015Fmi\u015F muhasebe ba\u011Flant\u0131lar\u0131 (NetSuite, Sage Intacct ve daha fazlas\u0131)',
                    benefit2: 'Ak\u0131ll\u0131 gider kurallar\u0131',
                    benefit3: '\u00C7ok seviyeli onay i\u015F ak\u0131\u015Flar\u0131',
                    benefit4: 'Geli\u015Fmi\u015F g\u00FCvenlik kontrolleri',
                    toUpgrade: 'Y\u00FCkseltmek i\u00E7in, t\u0131klay\u0131n',
                    selectWorkspace: 'bir \u00E7al\u0131\u015Fma alan\u0131 se\u00E7in ve plan t\u00FCr\u00FCn\u00FC de\u011Fi\u015Ftirin',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Collect plan\u0131na ge\u00E7i\u015F yap\u0131n',
                note: 'E\u011Fer paketinizi d\u00FC\u015F\u00FCr\u00FCrseniz, bu \u00F6zelliklere ve daha fazlas\u0131na eri\u015Fiminiz sona erecektir:',
                benefits: {
                    note: 'Planlar\u0131m\u0131z\u0131n tam bir kar\u015F\u0131la\u015Ft\u0131rmas\u0131n\u0131 g\u00F6rmek i\u00E7in, sitemizi ziyaret edin.',
                    pricingPage: 'fiyatland\u0131rma sayfas\u0131',
                    confirm: 'Konfig\u00FCrasyonlar\u0131n\u0131z\u0131 kald\u0131rmak ve d\u00FC\u015F\u00FCrmek istedi\u011Finizden emin misiniz?',
                    warning: 'Bu geri al\u0131namaz.',
                    benefit1: 'Muhasebe ba\u011Flant\u0131lar\u0131 (QuickBooks Online ve Xero hari\u00E7)',
                    benefit2: 'Ak\u0131ll\u0131 gider kurallar\u0131',
                    benefit3: '\u00C7ok seviyeli onay i\u015F ak\u0131\u015Flar\u0131',
                    benefit4: 'Geli\u015Fmi\u015F g\u00FCvenlik kontrolleri',
                    headsUp: 'Dikkat!',
                    multiWorkspaceNote:
                        '\u0130lk ayl\u0131k \u00F6demenizi ba\u015Flatmak i\u00E7in t\u00FCm \u00E7al\u0131\u015Fma alanlar\u0131n\u0131z\u0131 Collect oran\u0131nda bir abonelik ba\u015Flatmadan \u00F6nce d\u00FC\u015F\u00FCrmeniz gerekecek. T\u0131klay\u0131n',
                    selectStep: '> her bir \u00E7al\u0131\u015Fma alan\u0131n\u0131 se\u00E7in > plan t\u00FCr\u00FCn\u00FC de\u011Fi\u015Ftirin',
                },
            },
            completed: {
                headline: '\u00C7al\u0131\u015Fma alan\u0131n\u0131z d\u00FC\u015F\u00FCr\u00FCld\u00FC',
                description:
                    'Control plan\u0131nda ba\u015Fka \u00E7al\u0131\u015Fma alanlar\u0131n\u0131z var. Toplama oran\u0131nda faturaland\u0131r\u0131lmak i\u00E7in, t\u00FCm \u00E7al\u0131\u015Fma alanlar\u0131n\u0131z\u0131 d\u00FC\u015F\u00FCrmeniz gerekmektedir.',
                gotIt: 'Anlad\u0131m, te\u015Fekk\u00FCrler',
            },
        },
        restrictedAction: {
            restricted: 'K\u0131s\u0131tl\u0131',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `Actions on the ${workspaceName} workspace are currently restricted`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `\u00C7al\u0131\u015Fma alan\u0131 sahibi, ${workspaceOwnerName}, yeni \u00E7al\u0131\u015Fma alan\u0131 aktivitesinin kilidini a\u00E7mak i\u00E7in dosyadaki \u00F6deme kart\u0131n\u0131 eklemeli veya g\u00FCncellemelidir.`,
            youWillNeedToAddOrUpdatePaymentCard:
                'Yeni i\u015F alan\u0131 aktivitesinin kilidini a\u00E7mak i\u00E7in dosyadaki \u00F6deme kart\u0131n\u0131 eklemeniz veya g\u00FCncellemeniz gerekecek.',
            addPaymentCardToUnlock: 'Kilidi a\u00E7mak i\u00E7in bir \u00F6deme kart\u0131 ekleyin!',
            addPaymentCardToContinueUsingWorkspace: 'Bu \u00E7al\u0131\u015Fma alan\u0131n\u0131 kullanmaya devam etmek i\u00E7in bir \u00F6deme kart\u0131 ekleyin',
            pleaseReachOutToYourWorkspaceAdmin: 'Herhangi bir sorunuz varsa l\u00FCtfen \u00E7al\u0131\u015Fma alan\u0131 y\u00F6neticinize ba\u015Fvurun.',
            chatWithYourAdmin: 'Y\u00F6neticinizle sohbet edin',
            chatInAdmins: "#admins'de sohbet et",
            addPaymentCard: '\u00D6deme kart\u0131 ekle',
        },
        rules: {
            individualExpenseRules: {
                title: 'Giderler',
                subtitle: 'Bireysel harcamalar i\u00E7in harcama kontrolleri ve varsay\u0131lanlar\u0131 belirleyin. Ayr\u0131ca ${username} i\u00E7in kurallar da olu\u015Fturabilirsiniz.',
                receiptRequiredAmount: 'Makbuz gerekli miktar',
                receiptRequiredAmountDescription:
                    'Bu miktar\u0131n harcamalar\u0131 a\u015Ft\u0131\u011F\u0131nda fi\u015F gerektirir, bir kategori kural\u0131 taraf\u0131ndan ge\u00E7ersiz k\u0131l\u0131nmad\u0131k\u00E7a.',
                maxExpenseAmount: 'Maksimum harcama miktar\u0131',
                maxExpenseAmountDescription:
                    'Bu miktar\u0131 a\u015Fan bayrak harcamalar\u0131n\u0131, bir kategori kural\u0131 taraf\u0131ndan ge\u00E7ersiz k\u0131l\u0131nmad\u0131k\u00E7a i\u015Faretleyin.',
                maxAge: 'Maksimum ya\u015F',
                maxExpenseAge: 'Maksimum gider ya\u015F\u0131',
                maxExpenseAgeDescription: 'Belirli bir say\u0131da g\u00FCnden daha eski bayrak harcamalar\u0131.',
                maxExpenseAgeDays: () => ({
                    one: '1 g\u00FCn',
                    other: (count: number) => `${count} days`,
                }),
                billableDefault: 'Faturaland\u0131r\u0131labilir varsay\u0131lan',
                billableDefaultDescription:
                    "Nakit ve kredi kart\u0131 harcamalar\u0131n\u0131n varsay\u0131lan olarak faturaland\u0131r\u0131labilir olup olmad\u0131\u011F\u0131n\u0131 se\u00E7in. Faturaland\u0131r\u0131labilir giderler ${someBoolean ? 'etkinle\u015Ftirilir' : 'devre d\u0131\u015F\u0131 b\u0131rak\u0131l\u0131r'}",
                billable: 'Faturaland\u0131r\u0131labilir',
                billableDescription: 'Giderler genellikle m\u00FC\u015Fterilere yeniden faturaland\u0131r\u0131l\u0131r',
                nonBillable: 'Faturaland\u0131r\u0131lamaz',
                nonBillableDescription: 'Giderler ara s\u0131ra m\u00FC\u015Fterilere yeniden faturaland\u0131r\u0131l\u0131r',
                eReceipts: 'eFaturalar',
                eReceiptsHint: 'eReceipts otomatik olarak olu\u015Fturulur',
                eReceiptsHintLink: '\u00E7o\u011Fu USD kredi i\u015Flemi i\u00E7in',
            },
            expenseReportRules: {
                examples:
                    "1. English: \"Hello, ${username}! You have ${count} new messages.\"\n   Turkish: \"Merhaba, ${username}! ${count} yeni mesaj\u0131n\u0131z var.\"\n\n2. English: \"The operation was ${someBoolean ? 'successful' : 'unsuccessful'}.\"\n   Turkish: \"\u0130\u015Flem ${someBoolean ? 'ba\u015Far\u0131l\u0131' : 'ba\u015Far\u0131s\u0131z'} oldu.\"\n\n3. English: \"You have ${count > 1 ? 'multiple' : 'one'} notifications.\"\n   Turkish: \"${count > 1 ? 'Birden fazla' : 'Bir'} bildiriminiz var.\"\n\n4. English: \"Your order is ${status === 'shipped' ? 'on its way' : 'still processing'}.\"\n   Turkish: \"Sipari\u015Finiz ${status === 'shipped' ? 'yolda' : 'hala i\u015Fleniyor'}.\"\n\n5. English: \"The event will start in ${hours} hours.\"\n   Turkish: \"Etkinlik ${hours} saat i\u00E7inde ba\u015Flayacak.\"\n\n6. English: \"The item is ${inStock ? 'available' : 'out of stock'}.\"\n   Turkish: \"\u00DCr\u00FCn ${inStock ? 'mevcut' : 'stokta yok'}.\"\n\nNote: The placeholders are preserved as they are in the original text. They will be replaced with the appropriate values when the text is displayed.",
                title: 'Gider raporlar\u0131',
                subtitle: 'Masraf raporu uyumlulu\u011Funu, onaylar\u0131n\u0131 ve \u00F6demeyi otomatikle\u015Ftirin.',
                customReportNamesTitle: '\u00D6zel rapor isimleri',
                customReportNamesSubtitle: '\u00D6zelle\u015Ftirilmi\u015F isimler olu\u015Fturun, geni\u015F form\u00FCllerimizi kullanarak.',
                customNameTitle: '\u00D6zel isim',
                customNameDescription: 'Harcama raporlar\u0131 i\u00E7in \u00F6zel bir isim se\u00E7in, bunu bizim ${username} kullanarak yapabilirsiniz.',
                customNameDescriptionLink: 'geni\u015F form\u00FCller',
                customNameInputLabel: '\u0130sim',
                customNameEmailPhoneExample: '\u00DCyenin e-postas\u0131 veya telefonu: {report:submit:from}',
                customNameStartDateExample: 'Rapor ba\u015Flang\u0131\u00E7 tarihi: {report:startdate}',
                customNameWorkspaceNameExample: '\u00C7al\u0131\u015Fma alan\u0131 ad\u0131: {report:policyname}',
                customNameReportIDExample: 'Rapor ID: {report:id}',
                customNameTotalExample: 'Toplam: {report:total}.',
                preventMembersFromChangingCustomNamesTitle: '\u00DCyelerin \u00F6zel rapor isimlerini de\u011Fi\u015Ftirmesini engelle',
                preventSelfApprovalsTitle: 'Kendi onaylar\u0131n\u0131 \u00F6nle',
                preventSelfApprovalsSubtitle: '\u00C7al\u0131\u015Fma alan\u0131 \u00FCyelerinin kendi masraf raporlar\u0131n\u0131 onaylamalar\u0131n\u0131 engelleyin.',
                autoApproveCompliantReportsTitle: 'Uygun raporlar\u0131 otomatik onayla',
                autoApproveCompliantReportsSubtitle: 'Hangi masraf raporlar\u0131n\u0131n otomatik onay i\u00E7in uygun oldu\u011Funu yap\u0131land\u0131r\u0131n.',
                autoApproveReportsUnderTitle: 'Raporlar\u0131 otomatik onayla',
                autoApproveReportsUnderDescription: 'Bu miktar\u0131n alt\u0131ndaki tamamen uyumlu masraf raporlar\u0131 otomatik olarak onaylanacakt\u0131r.',
                randomReportAuditTitle: 'Rastgele rapor denetimi',
                randomReportAuditDescription: 'Baz\u0131 raporlar\u0131n, otomatik onay i\u00E7in uygun olsa bile, manuel olarak onaylanmas\u0131n\u0131 gerektirir.',
                autoPayApprovedReportsTitle: 'Otomatik \u00F6deme onaylanan raporlar',
                autoPayApprovedReportsSubtitle: 'Otomatik \u00F6deme i\u00E7in hangi masraf raporlar\u0131n\u0131n uygun oldu\u011Funu yap\u0131land\u0131r\u0131n.',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `L\u00FCtfen ${currency ?? ''}20,000'den daha az bir miktar girin`,
                autoPayApprovedReportsLockedSubtitle:
                    'Daha fazla \u00F6zelliklere gidin ve i\u015F ak\u0131\u015Flar\u0131n\u0131 etkinle\u015Ftirin, ard\u0131ndan bu \u00F6zelli\u011Fi a\u00E7mak i\u00E7in \u00F6demeler ekleyin.',
                autoPayReportsUnderTitle: 'Otomatik \u00F6deme raporlar\u0131 alt\u0131nda',
                autoPayReportsUnderDescription: 'Bu miktar\u0131n alt\u0131ndaki tamamen uyumlu masraf raporlar\u0131 otomatik olarak \u00F6denecektir.',
                unlockFeatureGoToSubtitle: 'Git',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName}: FeatureNameParams) =>
                    `ve i\u015F ak\u0131\u015Flar\u0131n\u0131 etkinle\u015Ftirin, ard\u0131ndan bu \u00F6zelli\u011Fi kilidini a\u00E7mak i\u00E7in ${featureName} ekleyin.`,
                enableFeatureSubtitle: ({featureName}: FeatureNameParams) => `ve bu \u00F6zelli\u011Fi a\u00E7mak i\u00E7in ${featureName} \u00F6zelli\u011Fini etkinle\u015Ftirin.`,
                preventSelfApprovalsModalText: ({managerEmail}: {managerEmail: string}) =>
                    `Kendi masraflar\u0131n\u0131 onaylayan herhangi bir \u00FCye kald\u0131r\u0131lacak ve bu \u00E7al\u0131\u015Fma alan\u0131 i\u00E7in varsay\u0131lan onaylay\u0131c\u0131yla (${managerEmail}) de\u011Fi\u015Ftirilecektir.`,
                preventSelfApprovalsConfirmButton: 'Kendi onaylar\u0131n\u0131 \u00F6nle',
                preventSelfApprovalsModalTitle: 'Kendine onaylamalar\u0131 \u00F6nlemek mi?',
                preventSelfApprovalsDisabledSubtitle: 'Bu \u00E7al\u0131\u015Fma alan\u0131nda en az iki \u00FCye olana kadar kendili\u011Finden onaylar etkinle\u015Ftirilemez.',
            },
            categoryRules: {
                title: 'Kategori kurallar\u0131',
                approver: 'Onaylayan',
                requireDescription: "The task doesn't provide a specific text to translate. Please provide the text or TypeScript function that needs to be translated.",
                descriptionHint: 'A\u00E7\u0131klama ipucu',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `\u00C7al\u0131\u015Fanlar\u0131 "${categoryName}" harcamas\u0131 i\u00E7in ek bilgi sa\u011Flamalar\u0131 konusunda hat\u0131rlat\u0131n. Bu ipucu, giderlerdeki a\u00E7\u0131klama alan\u0131nda g\u00F6r\u00FCn\u00FCr.`,
                descriptionHintLabel: '\u0130pucu',
                descriptionHintSubtitle: 'Profesyonel ipucu: Ne kadar k\u0131sa olursa o kadar iyidir!',
                maxAmount: 'Maksimum miktar',
                flagAmountsOver: 'Miktarlar\u0131 bayrakla',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `"${categoryName}" kategorisine uygulan\u0131r.`,
                flagAmountsOverSubtitle: 'Bu, t\u00FCm masraflar i\u00E7in maksimum miktar\u0131 ge\u00E7ersiz k\u0131lar.',
                expenseLimitTypes: {
                    expense: 'Bireysel harcama',
                    expenseSubtitle:
                        'Kategoriye g\u00F6re masraf miktarlar\u0131n\u0131 i\u015Faretleyin. Bu kural, maksimum masraf miktar\u0131 i\u00E7in genel \u00E7al\u0131\u015Fma alan\u0131 kural\u0131n\u0131 ge\u00E7ersiz k\u0131lar.',
                    daily: 'Kategori toplam\u0131',
                    dailySubtitle: 'Her masraf raporu ba\u015F\u0131na toplam kategori harcamas\u0131n\u0131 i\u015Faretle.',
                },
                requireReceiptsOver: 'Fi\u015Fler \u00FCzerinde gereklilik',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} Default`,
                    never: 'Asla fi\u015F talep etme',
                    always: 'Her zaman fi\u015Fleri talep edin',
                },
                defaultTaxRate: 'Varsay\u0131lan vergi oran\u0131',
                goTo: 'Git',
                andEnableWorkflows: 've i\u015F ak\u0131\u015Flar\u0131n\u0131 etkinle\u015Ftirin, ard\u0131ndan bu \u00F6zelli\u011Fi kilidini a\u00E7mak i\u00E7in onaylar ekleyin.',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: 'Topla',
                    description: 'S\u00FCre\u00E7lerini otomatikle\u015Ftirmek isteyen tak\u0131mlar i\u00E7in.',
                },
                corporate: {
                    label: 'Kontrol',
                    description: 'Geli\u015Fmi\u015F gereksinimlere sahip organizasyonlar i\u00E7in.',
                },
            },
            description: 'Sizin i\u00E7in do\u011Fru olan bir plan se\u00E7in. Detayl\u0131 \u00F6zellikler ve fiyatland\u0131rma listesi i\u00E7in, sitemizi kontrol edin.',
            subscriptionLink: 'plan t\u00FCrleri ve fiyatland\u0131rma yard\u0131m sayfas\u0131',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `Control plan\u0131 \u00FCzerinde 1 aktif \u00FCyeye ${annualSubscriptionEndDate} tarihine kadar y\u0131ll\u0131k aboneli\u011Finiz sona erene kadar taahh\u00FCt ettiniz. ${annualSubscriptionEndDate} tarihinden itibaren otomatik yenilemeyi devre d\u0131\u015F\u0131 b\u0131rakarak kullan\u0131m ba\u015F\u0131na \u00F6deme aboneli\u011Fine ge\u00E7i\u015F yapabilir ve Collect plan\u0131na d\u00FC\u015Febilirsiniz.`,
                other: `Control plan\u0131 \u00FCzerinde ${count} aktif \u00FCyeye taahh\u00FCt ettiniz ve y\u0131ll\u0131k aboneli\u011Finiz ${annualSubscriptionEndDate} tarihinde sona erecek. Otomatik yenilemeyi devre d\u0131\u015F\u0131 b\u0131rakarak ${annualSubscriptionEndDate} tarihinden itibaren kullan\u0131m ba\u015F\u0131na \u00F6deme aboneli\u011Fine ge\u00E7ebilir ve Collect plan\u0131na d\u00FC\u015Febilirsiniz.`,
            }),
            subscriptions: 'Abonelikler',
        },
    },
    getAssistancePage: {
        title: 'Yard\u0131m al\u0131n',
        subtitle: 'Biz, b\u00FCy\u00FCkl\u00FC\u011Fe giden yolunuzu temizlemek i\u00E7in buraday\u0131z!',
        description: 'A\u015Fa\u011F\u0131daki destek se\u00E7eneklerinden birini se\u00E7in:',
        chatWithConcierge: 'Concierge ile Sohbet Et',
        scheduleSetupCall: 'Bir kurulum \u00E7a\u011Fr\u0131s\u0131 planlay\u0131n',
        scheduleADemo: 'Demo programla',
        questionMarkButtonTooltip: 'Ekibimizden yard\u0131m al\u0131n',
        exploreHelpDocs: 'Yard\u0131m dok\u00FCmanlar\u0131n\u0131 ke\u015Ffedin',
    },
    emojiPicker: {
        skinTonePickerLabel: 'Varsay\u0131lan cilt tonunu de\u011Fi\u015Ftir',
        headers: {
            frequentlyUsed: 'S\u0131k Kullan\u0131lanlar',
            smileysAndEmotion: 'G\u00FCl\u00FCmsemeler & Duygular',
            peopleAndBody: '\u0130nsanlar & V\u00FCcut',
            animalsAndNature: 'Hayvanlar & Do\u011Fa',
            foodAndDrink: 'Yiyecek & \u0130\u00E7ecekler',
            travelAndPlaces: 'Seyahat & Yerler',
            activities: 'Aktiviteler',
            objects: 'Nesneler',
            symbols: 'Semboller',
            flags: 'Bayraklar',
        },
    },
    newRoomPage: {
        newRoom: 'Yeni oda',
        groupName: 'Grup ad\u0131',
        roomName: 'Oda ismi',
        visibility: 'G\u00F6r\u00FCn\u00FCrl\u00FCk',
        restrictedDescription: '\u00C7al\u0131\u015Fma alan\u0131n\u0131zdaki insanlar bu oday\u0131 bulabilir',
        privateDescription: 'Bu odaya davet edilen ki\u015Filer onu bulabilir',
        publicDescription: 'Bu oday\u0131 herkes bulabilir',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: 'Bu oday\u0131 herkes bulabilir',
        createRoom: 'Oda olu\u015Ftur',
        roomAlreadyExistsError: 'Bu isimde bir oda zaten var.',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) => `${reservedName} is a default room on all workspaces. Please choose another name.`,
        roomNameInvalidError: 'Oda isimleri sadece k\u00FC\u00E7\u00FCk harfler, rakamlar ve tireler i\u00E7erebilir.',
        pleaseEnterRoomName: 'L\u00FCtfen bir oda ad\u0131 girin.',
        pleaseSelectWorkspace: 'L\u00FCtfen bir \u00E7al\u0131\u015Fma alan\u0131 se\u00E7in.',
        renamedRoomAction: ({oldName, newName}: RenamedRoomActionParams) => `bu odan\u0131n ad\u0131n\u0131 "${newName}" olarak de\u011Fi\u015Ftirdi (daha \u00F6nceki ismi "${oldName}")`,
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `Oda ad\u0131 ${newName} olarak de\u011Fi\u015Ftirildi`,
        social: 'sosyal',
        selectAWorkspace: 'Bir \u00E7al\u0131\u015Fma alan\u0131 se\u00E7in',
        growlMessageOnRenameError:
            '\u00C7al\u0131\u015Fma alan\u0131 odas\u0131n\u0131 yeniden adland\u0131rmak m\u00FCmk\u00FCn de\u011Fil. L\u00FCtfen ba\u011Flant\u0131n\u0131z\u0131 kontrol edin ve tekrar deneyin.',
        visibilityOptions: {
            restricted: '\u00C7al\u0131\u015Fma Alan\u0131', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: '\u00D6zel',
            public: 'Genel',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: 'Kamu Duyurusu',
        },
    },
    workspaceActions: {
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedRoomActionParams) =>
            `bu \u00E7al\u0131\u015Fma alan\u0131n\u0131n ad\u0131n\u0131 "${newName}" olarak g\u00FCncelledi (\u00F6nceki isim: "${oldName}")`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('The text to be translated is missing. Please provide the text for translation.');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `Sizi ${joinedNames}'\u0131n onay ak\u0131\u015F\u0131ndan ve i\u015F alan\u0131 sohbetinden \u00E7\u0131kard\u0131. Daha \u00F6nce g\u00F6nderilen raporlar onay\u0131n\u0131z i\u00E7in Gelen Kutunuzda kalmaya devam edecektir.`,
                other: `Sizi ${joinedNames}'\u0131n onay ak\u0131\u015Flar\u0131ndan ve \u00E7al\u0131\u015Fma alan\u0131 sohbetlerinden \u00E7\u0131kard\u0131. Daha \u00F6nce g\u00F6nderilen raporlar, Gelen Kutunuzda onay i\u00E7in kullan\u0131labilir olmaya devam edecektir.`,
            };
        },
        upgradedWorkspace: 'Bu \u00E7al\u0131\u015Fma alan\u0131n\u0131 Kontrol plan\u0131na y\u00FCkseltti',
        downgradedWorkspace: 'bu \u00E7al\u0131\u015Fma alan\u0131n\u0131 Collect plan\u0131na d\u00FC\u015F\u00FCrd\u00FC',
    },
    roomMembersPage: {
        memberNotFound: '\u00DCye bulunamad\u0131.',
        useInviteButton: 'Sohbete yeni bir \u00FCye davet etmek i\u00E7in, l\u00FCtfen yukar\u0131daki davet butonunu kullan\u0131n.',
        notAuthorized: `Bu sayfaya eri\u015Fiminiz yok. Bu odaya kat\u0131lmaya \u00E7al\u0131\u015F\u0131yorsan\u0131z, sadece bir oda \u00FCyesine sizi eklemesini isteyin. Ba\u015Fka bir \u015Fey mi? ${CONST.EMAIL.CONCIERGE} ile ileti\u015Fime ge\u00E7in.`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `Are you sure you want to remove ${memberName} from the room?`,
            other: 'Se\u00E7ili \u00FCyeleri odadan \u00E7\u0131karmak istedi\u011Finizden emin misiniz?',
        }),
        error: {
            genericAdd: 'Bu oda \u00FCyesini eklerken bir sorun olu\u015Ftu.',
        },
    },
    newTaskPage: {
        assignTask: 'G\u00F6rev ata',
        assignMe: 'Bana ata',
        confirmTask: 'G\u00F6revi onayla',
        confirmError: 'L\u00FCtfen bir ba\u015Fl\u0131k girin ve payla\u015F\u0131m hedefi se\u00E7in.',
        descriptionOptional: 'The text to be translated is missing. Please provide the text for translation.',
        pleaseEnterTaskName: 'L\u00FCtfen bir ba\u015Fl\u0131k girin',
        pleaseEnterTaskDestination: 'L\u00FCtfen bu g\u00F6revi nerede payla\u015Fmak istedi\u011Finizi se\u00E7in.',
    },
    task: {
        task: 'G\u00F6rev',
        title: 'Ba\u015Fl\u0131k',
        description: 'A\u00E7\u0131klama',
        assignee: 'Atanan',
        completed:
            "Bu, d\u00FCz bir metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsillerini tan\u0131mlar, ancak ternary ifadeler veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        messages: {
            created: ({title}: TaskCreatedActionParams) => `task for ${title}`,
            completed: 'tamamland\u0131 olarak i\u015Faretlendi',
            canceled: 'silinmi\u015F g\u00F6rev',
            reopened: 'eksik olarak i\u015Faretlendi',
            error: '\u0130stedi\u011Finiz eylemi ger\u00E7ekle\u015Ftirme izniniz yok.',
        },
        markAsComplete: 'Tamamland\u0131 olarak i\u015Faretle',
        markAsIncomplete: 'Tamamlanmam\u0131\u015F olarak i\u015Faretle',
        assigneeError: 'Bu g\u00F6revi atarken bir hata olu\u015Ftu. L\u00FCtfen ba\u015Fka bir atanan\u0131 deneyin.',
        genericCreateTaskFailureMessage: 'Bu g\u00F6revi olu\u015Ftururken bir hata olu\u015Ftu. L\u00FCtfen daha sonra tekrar deneyin.',
        deleteTask: 'G\u00F6revi sil',
        deleteConfirmation: 'Bu g\u00F6revi silmek istedi\u011Finizden emin misiniz?',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${monthName} ${year} statement`,
    },
    keyboardShortcutsPage: {
        title: 'Klavye k\u0131sayollar\u0131',
        subtitle: 'Bu kullan\u0131\u015Fl\u0131 klavye k\u0131sayollar\u0131yla zaman kazan\u0131n:',
        shortcuts: {
            openShortcutDialog: 'Klavye k\u0131sayollar\u0131 ileti\u015Fim kutusunu a\u00E7ar',
            escape: 'Ka\u00E7\u0131\u015F diyaloglar\u0131',
            search: 'Arama diyalogunu a\u00E7\u0131n',
            newChat: 'Yeni sohbet ekran\u0131',
            copy: 'The text to be translated is not provided in the prompt. Please provide the text that needs to be translated.',
            openDebug: 'A\u00E7\u0131k test tercihleri ileti\u015Fim kutusunu',
        },
    },
    guides: {
        screenShare: 'Ekran payla\u015F\u0131m\u0131',
        screenShareRequest: 'Expensify, sizleri bir ekran payla\u015F\u0131m\u0131na davet ediyor',
    },
    search: {
        resultsAreLimited: 'Arama sonu\u00E7lar\u0131 s\u0131n\u0131rl\u0131d\u0131r.',
        viewResults: 'Sonu\u00E7lar\u0131 g\u00F6r\u00FCnt\u00FCle',
        resetFilters: 'Filtreleri s\u0131f\u0131rla',
        searchResults: {
            emptyResults: {
                title: 'G\u00F6sterilecek bir \u015Fey yok',
                subtitle: 'Arama kriterlerinizi ayarlamay\u0131 deneyin veya ye\u015Fil + d\u00FC\u011Fmesiyle bir \u015Feyler olu\u015Fturmay\u0131 deneyin.',
            },
            emptyExpenseResults: {
                title: 'Hen\u00FCz herhangi bir gider olu\u015Fturmad\u0131n\u0131z',
                subtitle:
                    "A\u015Fa\u011F\u0131daki ye\u015Fil d\u00FC\u011Fmeyi kullanarak bir gider olu\u015Fturun veya daha fazla bilgi edinmek i\u00E7in Expensify'yi ke\u015Ffetmeye ba\u015Flay\u0131n.",
            },
            emptyInvoiceResults: {
                title: 'Hen\u00FCz herhangi bir fatura olu\u015Fturmad\u0131n\u0131z',
                subtitle:
                    'A\u015Fa\u011F\u0131daki ye\u015Fil d\u00FC\u011Fmeyi kullanarak bir fatura g\u00F6nderin veya Expensify hakk\u0131nda daha fazla bilgi edinmek i\u00E7in bir tur at\u0131n.',
            },
            emptyTripResults: {
                title: 'G\u00F6sterilecek seyahat yok',
                subtitle: 'A\u015Fa\u011F\u0131da ilk yolculu\u011Funuzu rezerve ederek ba\u015Flay\u0131n.',
                buttonText: 'Bir gezi rezervasyonu yap\u0131n',
            },
        },
        saveSearch: 'Aramay\u0131 kaydet',
        deleteSavedSearch: 'Kaydedilmi\u015F aramay\u0131 sil',
        deleteSavedSearchConfirm: 'Bu aramay\u0131 silmek istedi\u011Finizden emin misiniz?',
        searchName: '\u0130sim ara',
        savedSearchesMenuItemTitle: 'Kaydedildi',
        groupedExpenses: 'gruplanm\u0131\u015F giderler',
        bulkActions: {
            approve: 'Onayla',
            pay: '\u00D6de',
            delete: 'Sil',
            hold: 'Tut',
            unhold: "Bu ya d\u00FCz bir dizedir ya da bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
            noOptionsAvailable: 'Se\u00E7ilen gider grubu i\u00E7in mevcut se\u00E7enek yok.',
        },
        filtersHeader: 'Filtreler',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `Before ${date ?? ''}`,
                after: ({date}: OptionalParam<DateParams> = {}) => `After ${date ?? ''}`,
            },
            status: 'Durum',
            keyword: 'Anahtar Kelime',
            hasKeywords: 'Anahtar kelimeleri var',
            currency: 'Para',
            link: 'Ba\u011Flant\u0131',
            pinned: 'Sabitlenmi\u015F',
            unread: 'Okunmam\u0131\u015F',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Less than ${amount ?? ''}`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `Greater than ${amount ?? ''}`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `Between ${greaterThan} and ${lessThan}`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: 'Bireysel kartlar',
                cardFeeds: 'Kart beslemeleri',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `All ${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            current: 'Mevcut',
            past: 'Ge\u00E7mi\u015F',
            submitted: 'G\u00F6nderildi',
            approved: 'Onayland\u0131',
            paid: '\u00D6dendi',
            exported: 'D\u0131\u015Fa Aktar\u0131ld\u0131',
            posted: 'Yay\u0131nland\u0131',
        },
        noCategory: 'Kategori yok',
        noTag: "The task you provided doesn't contain any text or TypeScript function to translate. Please provide the text or function you want translated.",
        expenseType: 'Gider t\u00FCr\u00FC',
        recentSearches: 'Son aramalar',
        recentChats: 'Son sohbetler',
        searchIn: 'Ara i\u00E7inde',
        searchPlaceholder: 'Bir \u015Fey ara',
        suggestions: '\u00D6neriler',
    },
    genericErrorPage: {
        title: 'Uh-oh, bir \u015Feyler ters gitti!',
        body: {
            helpTextMobile: 'L\u00FCtfen uygulamay\u0131 kapat\u0131p yeniden a\u00E7\u0131n veya ba\u015Fka birine ge\u00E7in.',
            helpTextWeb:
                "Bunlar ya d\u00FCz bir dizi ya da bir TypeScript fonksiyonu olan bir \u015Fablon dizisini d\u00F6nd\u00FCren bir metindir. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden ya da parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeler veya ba\u015Fka TypeScript kodu i\u00E7erebilir.",
            helpTextConcierge: 'E\u011Fer sorun devam ederse, ileti\u015Fime ge\u00E7in',
        },
        refresh: 'Yenile',
    },
    fileDownload: {
        success: {
            title: '\u0130ndirildi!',
            message: 'Eklenti ba\u015Far\u0131yla indirildi!',
            qrMessage:
                'QR kodunuzun bir kopyas\u0131n\u0131 foto\u011Fraflar\u0131n\u0131zda veya indirmeler klas\u00F6r\u00FCn\u00FCzde kontrol edin. Profesyonel \u0130pucu: Bir sunumunuza ekleyin, b\u00F6ylece izleyicileriniz do\u011Frudan sizinle ba\u011Flant\u0131 kurmak i\u00E7in tarayabilir.',
        },
        generalError: {
            title: 'Ek dosya hatas\u0131',
            message: 'Ek dosya indirilemiyor.',
        },
        permissionError: {
            title: 'Depolama eri\u015Fimi',
            message: 'Expensify, depolama eri\u015Fimi olmadan ekleri kaydedemez. \u0130zinleri g\u00FCncellemek i\u00E7in ayarlar\u0131 t\u0131klay\u0131n.',
        },
    },
    desktopApplicationMenu: {
        mainMenu: 'Yeni Expensify',
        about: 'Yeni Expensify Hakk\u0131nda',
        update: "Yeni Expensify'yi G\u00FCncelle",
        checkForUpdates: 'G\u00FCncellemeleri kontrol et',
        toggleDevTools: 'Geli\u015Ftirici Ara\u00E7lar\u0131n\u0131 A\u00E7/Kapat',
        viewShortcuts: 'Klavye k\u0131sayollar\u0131n\u0131 g\u00F6r\u00FCnt\u00FCle',
        services: 'Hizmetler',
        hide: "Yeni Expensify'i Gizle",
        hideOthers: 'Di\u011Ferlerini Gizle',
        showAll: 'T\u00FCm\u00FCn\u00FC G\u00F6ster',
        quit: "Yeni Expensify'den \u00C7\u0131k\u0131n",
        fileMenu: 'Dosya',
        closeWindow: 'Pencereyi Kapat',
        editMenu:
            "Bu ya d\u00FCz bir dize veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, c\u00FCmlede neyi temsil ettiklerini a\u00E7\u0131klar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        undo: 'Geri al',
        redo: 'Yeniden Yap',
        cut: 'Kes',
        copy: 'Kopyala',
        paste: 'The text to be translated is missing. Please provide the text for translation.',
        pasteAndMatchStyle: 'Yap\u0131\u015Ft\u0131r ve Stili E\u015Fle\u015Ftir',
        pasteAsPlainText: 'D\u00FCz Metin Olarak Yap\u0131\u015Ft\u0131r',
        delete: 'Sil',
        selectAll:
            "Bu, d\u00FCz bir dize veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        speechSubmenu: 'Konu\u015Fma',
        startSpeaking: 'Konu\u015Fmaya Ba\u015Fla',
        stopSpeaking: 'Konu\u015Fmay\u0131 B\u0131rak',
        viewMenu: 'G\u00F6r\u00FCn\u00FCm',
        reload: 'Yeniden Y\u00FCkle',
        forceReload: 'Zorla Yeniden Y\u00FCkle',
        resetZoom: 'Ger\u00E7ek Boyut',
        zoomIn: 'Yak\u0131nla\u015Ft\u0131r',
        zoomOut: "Zoom Out'u",
        togglefullscreen: 'Tam Ekran\u0131 A\u00E7/Kapat',
        historyMenu: 'Tarih',
        back: 'Geri',
        forward: '\u0130leri',
        windowMenu: 'Pencere',
        minimize: 'K\u00FC\u00E7\u00FClt',
        zoom: 'Zoom',
        front: 'T\u00FCm\u00FCn\u00FC \u00D6ne Getir',
        helpMenu: "Sorry, but you haven't provided any text to translate. Please provide the text you want to translate.",
        learnMore: 'Daha fazla \u00F6\u011Fren',
        documentation: 'Belgeler',
        communityDiscussions: 'Topluluk Tart\u0131\u015Fmalar\u0131',
        searchIssues: 'Sorunlar\u0131 Ara',
    },
    historyMenu: {
        forward: '\u0130leri',
        back: 'Geri',
    },
    checkForUpdatesModal: {
        available: {
            title: 'G\u00FCncelleme mevcut',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) =>
                `Yeni versiyon yak\u0131nda kullan\u0131labilir olacak.${!isSilentUpdating ? ' Güncellemeye hazır olduğumuzda sizi bilgilendireceğiz.' : ''}`,
            soundsGood: 'Kula\u011Fa ho\u015F geliyor',
        },
        notAvailable: {
            title: 'G\u00FCncelleme kullan\u0131lamaz',
            message: '\u015Eu anda bir g\u00FCncelleme mevcut de\u011Fil. L\u00FCtfen daha sonra tekrar kontrol edin!',
            okay: "You didn't provide any text to translate. Please provide the text you want to translate.",
        },
        error: {
            title: 'G\u00FCncelleme kontrol\u00FC ba\u015Far\u0131s\u0131z oldu.',
            message: 'Bir g\u00FCncelleme kontrol edemedik. L\u00FCtfen biraz sonra tekrar deneyin.',
        },
    },
    report: {
        genericCreateReportFailureMessage: 'Bu sohbeti olu\u015Ftururken beklenmeyen bir hata olu\u015Ftu. L\u00FCtfen daha sonra tekrar deneyin.',
        genericAddCommentFailureMessage: 'Yorum g\u00F6nderilirken beklenmedik bir hata olu\u015Ftu. L\u00FCtfen daha sonra tekrar deneyin.',
        genericUpdateReportFieldFailureMessage: 'Alan\u0131 g\u00FCncellerken beklenmedik bir hata olu\u015Ftu. L\u00FCtfen daha sonra tekrar deneyin.',
        genericUpdateReporNameEditFailureMessage: 'Raporu yeniden adland\u0131r\u0131rken beklenmeyen bir hata olu\u015Ftu. L\u00FCtfen daha sonra tekrar deneyin.',
        noActivityYet: 'Hen\u00FCz bir aktivite yok',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `changed ${fieldName} from ${oldValue} to ${newValue}`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `changed ${fieldName} to ${newValue}`,
                changePolicy: ({fromPolicy, toPolicy}: ChangePolicyParams) => `changed workspace from ${fromPolicy} to ${toPolicy}`,
                changeType: ({oldType, newType}: ChangeTypeParams) => `changed type from ${oldType} to ${newType}`,
                delegateSubmit: ({delegateUser, originalManager}: DelegateSubmitParams) => `Bu raporu ${originalManager} tatilde oldu\u011Fu i\u00E7in ${delegateUser}'a g\u00F6nderdim.`,
                exportedToCSV: `exported this report to CSV`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => `Bu raporu ${label} olarak d\u0131\u015Fa aktard\u0131.`,
                    manual: ({label}: ExportedToIntegrationParams) => `Bu raporu ${label} olarak manuel olarak d\u0131\u015Fa aktar\u0131ld\u0131 olarak i\u015Faretledi.`,
                    reimburseableLink: 'Cebinizden \u00E7\u0131kan masraflar\u0131 g\u00F6r\u00FCnt\u00FCleyin.',
                    nonReimbursableLink: '\u015Eirket kart\u0131 harcamalar\u0131n\u0131 g\u00F6r\u00FCnt\u00FCle.',
                    pending: ({label}: ExportedToIntegrationParams) => `bu raporu ${label} olarak d\u0131\u015Fa aktarmaya ba\u015Flad\u0131...`,
                },
                integrationsMessage: ({errorMessage, label}: IntegrationSyncFailedParams) =>
                    `bu raporu ${label} olarak d\u0131\u015Fa aktarmak ba\u015Far\u0131s\u0131z oldu ("${errorMessage}")`,
                managerAttachReceipt: `added a receipt`,
                managerDetachReceipt: `removed a receipt`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `paid ${currency}${amount} elsewhere`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `paid ${currency}${amount} via integration`,
                outdatedBankAccount: `couldn’t process the payment due to a problem with the payer’s bank account`,
                reimbursementACHBounce: `couldn’t process the payment, as the payer doesn’t have sufficient funds`,
                reimbursementACHCancelled: `canceled the payment`,
                reimbursementAccountChanged: `couldn’t process the payment, as the payer changed bank accounts`,
                reimbursementDelayed: `processed the payment but it’s delayed by 1-2 more business days`,
                selectedForRandomAudit: `randomly selected for review`,
                selectedForRandomAuditMarkdown: `[randomly selected](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule) for review`,
                share: ({to}: ShareParams) => `\u00FCye davet edildi ${to}`,
                unshare: ({to}: UnshareParams) => `\u00FCye kald\u0131r\u0131ld\u0131 ${to}`,
                stripePaid: ({amount, currency}: StripePaidParams) => `${amount} \u00F6dendi`,
                takeControl: `took control`,
                integrationSyncFailed: ({label, errorMessage}: IntegrationSyncFailedParams) => `failed to sync with ${label}${errorMessage ? ` ("${errorMessage}")` : ''}`,
                addEmployee: ({email, role}: AddEmployeeParams) => `added ${email} as ${role === 'member' || role === 'user' ? 'a member' : 'an admin'}`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) =>
                    `updated the role of ${email} to ${newRole === 'member' || newRole === 'user' ? 'member' : newRole} (previously ${
                        currentRole === 'member' || currentRole === 'user' ? 'member' : currentRole
                    })`,
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} left the workspace`,
                removeMember: ({email, role}: AddEmployeeParams) => `removed ${role === 'member' || role === 'user' ? 'member' : 'admin'} ${email}`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `removed connection to ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}`,
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary} for ${dayCount} ${dayCount === 1 ? 'day' : 'days'} until ${date}`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${summary} from ${timePeriod} on ${date}`,
    },
    footer: {
        features: '\u00D6zellikler',
        expenseManagement: 'Gider Y\u00F6netimi',
        spendManagement: 'Harcama Y\u00F6netimi',
        expenseReports: 'Gider Raporlar\u0131',
        companyCreditCard: '\u015Eirket Kredi Kart\u0131',
        receiptScanningApp: 'Fi\u015F Tarama Uygulamas\u0131',
        billPay: 'Fatura \u00D6deme',
        invoicing: 'Faturaland\u0131rma',
        CPACard: 'CPA Kart\u0131',
        payroll: 'Maa\u015F Bordrosu',
        travel: 'Seyahat',
        resources: 'Kaynaklar',
        expensifyApproved: 'ExpensifyOnayland\u0131!',
        pressKit: 'Bas\u0131n Kiti',
        support: 'Destek',
        expensifyHelp: 'ExpensifyYard\u0131m',
        terms: 'Hizmet \u015Eartlar\u0131',
        privacy: 'Gizlilik',
        learnMore: 'Daha Fazla \u00D6\u011Fren',
        aboutExpensify: 'Expensify Hakk\u0131nda',
        blog: 'Blog',
        jobs: '\u0130\u015Fler',
        expensifyOrg: 'Expensify.org',
        investorRelations: 'Yat\u0131r\u0131mc\u0131 \u0130li\u015Fkileri',
        getStarted: 'Ba\u015Fla',
        createAccount: 'Yeni Bir Hesap Olu\u015Ftur',
        logIn: 'Giri\u015F Yap',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'Sohbetler listesine geri d\u00F6n\u00FCn',
        chatWelcomeMessage: 'Sohbet ho\u015F geldiniz mesaj\u0131',
        navigatesToChat: 'Bir sohbete y\u00F6nlendirir',
        newMessageLineIndicator: 'Yeni mesaj sat\u0131r\u0131 g\u00F6stergesi',
        chatMessage: 'Sohbet mesaj\u0131',
        lastChatMessagePreview: 'Son sohbet mesaj\u0131 \u00F6nizlemesi',
        workspaceName: '\u00C7al\u0131\u015Fma alan\u0131 ad\u0131',
        chatUserDisplayNames: 'Sohbet \u00FCyesi g\u00F6r\u00FCnen isimler',
        scrollToNewestMessages: 'En yeni mesajlara kayd\u0131r\u0131n',
        prestyledText: '\u00D6nceden stilize edilmi\u015F metin',
        viewAttachment: 'Ekli dosyay\u0131 g\u00F6r\u00FCnt\u00FCle',
    },
    parentReportAction: {
        deletedReport: 'Silinmi\u015F rapor',
        deletedMessage: 'Silinmi\u015F mesaj',
        deletedExpense: 'Silinen gider',
        reversedTransaction: '\u0130\u015Flem geri al\u0131nd\u0131',
        deletedTask: 'Silinen g\u00F6rev',
        hiddenMessage: 'Gizli mesaj',
    },
    threads: {
        thread: 'Konu',
        replies: 'Yan\u0131tlar',
        reply: 'Yan\u0131t',
        from: 'The text to be translated is missing. Please provide the text for translation.',
        in: "Bu bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki neyi temsil ettiklerini a\u00E7\u0131klar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodlar\u0131n\u0131 i\u00E7erebilir.",
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `${workspaceName ? ` ${workspaceName} içinde` : ''}`,
    },
    qrCodes: {
        copy: "URL'yi Kopyala",
        copied: 'The text for translation is missing. Please provide the text you want to translate.',
    },
    moderation: {
        flagDescription: 'T\u00FCm i\u015Faretlenmi\u015F mesajlar bir moderat\u00F6r taraf\u0131ndan inceleme i\u00E7in g\u00F6nderilecektir.',
        chooseAReason: 'A\u015Fa\u011F\u0131da bayraklama i\u00E7in bir sebep se\u00E7in:',
        spam: '\u0130stenmeyen \u0130leti',
        spamDescription: '\u0130stenmeyen konu d\u0131\u015F\u0131 tan\u0131t\u0131m',
        inconsiderate: 'D\u00FC\u015F\u00FCncesiz',
        inconsiderateDescription: 'K\u00FC\u00E7\u00FCmseyici veya sayg\u0131s\u0131z ifadeler, \u015F\u00FCpheli niyetlerle',
        intimidation: 'G\u00F6zda\u011F\u0131',
        intimidationDescription: 'Ge\u00E7erli itirazlar\u0131n \u00FCzerine bir g\u00FCndemi agresif bir \u015Fekilde s\u00FCrd\u00FCrme',
        bullying: 'Zorbal\u0131k',
        bullyingDescription: 'Bir bireyi itaat elde etmek i\u00E7in hedefleme',
        harassment: 'Taciz',
        harassmentDescription: 'Irk\u00E7\u0131, kad\u0131n d\u00FC\u015Fman\u0131 veya di\u011Fer geni\u015F kapsaml\u0131 ayr\u0131mc\u0131 davran\u0131\u015Flar',
        assault: 'Sald\u0131r\u0131',
        assaultDescription: 'Zarar verme niyetiyle \u00F6zellikle hedeflenen duygusal sald\u0131r\u0131',
        flaggedContent: 'Bu mesaj, topluluk kurallar\u0131m\u0131z\u0131 ihlal etti\u011Fi gerek\u00E7esiyle i\u015Faretlenmi\u015F ve i\u00E7erik gizlenmi\u015Ftir.',
        hideMessage: 'Mesaj\u0131 gizle',
        revealMessage: 'Mesaj\u0131 a\u00E7\u0131kla',
        levelOneResult: 'Anonim uyar\u0131 g\u00F6nderir ve mesaj inceleme i\u00E7in bildirilir.',
        levelTwoResult: 'Mesaj kanaldan gizlendi, ek olarak anonim uyar\u0131 verildi ve mesaj inceleme i\u00E7in bildirildi.',
        levelThreeResult: 'Kanaldan mesaj kald\u0131r\u0131ld\u0131 ve anonim uyar\u0131 verildi, ayr\u0131ca mesaj inceleme i\u00E7in bildirildi.',
    },
    actionableMentionWhisperOptions: {
        invite: 'Onlar\u0131 davet et',
        nothing: 'Hi\u00E7bir \u015Fey yapma',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: 'Kabul et',
        decline: 'Reddet',
    },
    actionableMentionTrackExpense: {
        submit: 'Bunu birine g\u00F6nderin',
        categorize: 'Bunu kategorize et',
        share: 'Bunu muhasebecimle payla\u015F\u0131n',
        nothing: '\u015Eimdilik bir \u015Fey yok',
    },
    teachersUnitePage: {
        teachersUnite: '\u00D6\u011Fretmenler Birle\u015Fin',
        joinExpensifyOrg:
            'D\u00FCnya \u00E7ap\u0131nda adaletsizli\u011Fi ortadan kald\u0131rmak i\u00E7in Expensify.org\'a kat\u0131l\u0131n. Mevcut "\u00D6\u011Fretmenler Birle\u015Fiyor" kampanyas\u0131, temel okul malzemelerinin maliyetlerini b\u00F6lerken her yerdeki e\u011Fitimcilere destek oluyor.',
        iKnowATeacher: 'Bir \u00F6\u011Fretmen tan\u0131yorum',
        iAmATeacher: 'Ben bir \u00F6\u011Fretmenim',
        getInTouch: 'Harika! L\u00FCtfen onlar\u0131n bilgilerini payla\u015F\u0131n, b\u00F6ylece onlarla ileti\u015Fime ge\u00E7ebiliriz.',
        introSchoolPrincipal: 'Okul m\u00FCd\u00FCr\u00FCn\u00FCze giri\u015F',
        schoolPrincipalVerfiyExpense:
            'Expensify.org, d\u00FC\u015F\u00FCk gelirli hanelerin \u00F6\u011Frencilerinin daha iyi bir \u00F6\u011Frenme deneyimi ya\u015Fayabilmesi i\u00E7in temel okul malzemelerinin maliyetini b\u00F6ler. M\u00FCd\u00FCr\u00FCn\u00FCzden harcamalar\u0131n\u0131z\u0131 do\u011Frulamas\u0131 istenecektir.',
        principalFirstName: 'M\u00FCd\u00FCr\u00FCn ad\u0131',
        principalLastName: 'M\u00FCd\u00FCr soyad\u0131',
        principalWorkEmail: 'Ana i\u015F e-postas\u0131',
        updateYourEmail: 'E-posta adresinizi g\u00FCncelleyin',
        updateEmail: 'E-posta adresini g\u00FCncelle',
        contactMethods: '\u0130leti\u015Fim y\u00F6ntemleri.',
        schoolMailAsDefault:
            '\u0130lerlemeden \u00F6nce, l\u00FCtfen okul e-postan\u0131z\u0131 varsay\u0131lan ileti\u015Fim y\u00F6nteminiz olarak ayarlad\u0131\u011F\u0131n\u0131zdan emin olun. Bunu Ayarlar > Profil > b\u00F6l\u00FCm\u00FCnden yapabilirsiniz.',
        error: {
            enterPhoneEmail: 'Ge\u00E7erli bir e-posta veya telefon numaras\u0131 girin.',
            enterEmail: 'Bir e-posta girin.',
            enterValidEmail: 'Ge\u00E7erli bir e-posta girin.',
            tryDifferentEmail: 'L\u00FCtfen farkl\u0131 bir e-posta deneyin.',
        },
    },
    cardTransactions: {
        notActivated: 'Aktif de\u011Fil',
        outOfPocket: 'Cebinden harcama',
        companySpend: '\u015Eirket harcamas\u0131',
    },
    distance: {
        addStop: 'Durak ekle',
        deleteWaypoint: 'Yol noktas\u0131n\u0131 sil',
        deleteWaypointConfirmation: 'Bu yol noktas\u0131n\u0131 silmek istedi\u011Finizden emin misiniz?',
        address: 'Adres',
        waypointDescription: {
            start: 'Ba\u015Flat',
            stop: 'Dur',
        },
        mapPending: {
            title: 'Harita bekliyor',
            subtitle: 'Harita, \u00E7evrimi\u00E7i oldu\u011Funuzda olu\u015Fturulacak.',
            onlineSubtitle: 'Bir anl\u0131k haritay\u0131 ayarl\u0131yoruz',
            errorTitle: 'Harita hatas\u0131',
            errorSubtitle: 'Haritay\u0131 y\u00FCklerken bir hata olu\u015Ftu. L\u00FCtfen tekrar deneyin.',
        },
        error: {
            selectSuggestedAddress: 'L\u00FCtfen \u00F6nerilen bir adres se\u00E7in veya mevcut konumu kullan\u0131n.',
        },
    },
    reportCardLostOrDamaged: {
        report: 'Fiziksel kart kayb\u0131 / hasar\u0131 bildirin',
        screenTitle: 'Kay\u0131p veya hasarl\u0131 rapor kart\u0131n\u0131 bildirin',
        nextButtonLabel: 'Bir sonraki metni g\u00F6nderin.',
        reasonTitle: 'Neden yeni bir karta ihtiyac\u0131n\u0131z var?',
        cardDamaged: 'Kart\u0131m hasar g\u00F6rd\u00FC',
        cardLostOrStolen: 'Kart\u0131m kayboldu veya \u00E7al\u0131nd\u0131',
        confirmAddressTitle: 'Yeni kart\u0131n\u0131z i\u00E7in posta adresini onaylay\u0131n l\u00FCtfen.',
        cardDamagedInfo:
            'Yeni kart\u0131n\u0131z 2-3 i\u015F g\u00FCn\u00FC i\u00E7inde gelecektir. Mevcut kart\u0131n\u0131z, yeni olan\u0131n\u0131z\u0131 etkinle\u015Ftirinceye kadar \u00E7al\u0131\u015Fmaya devam edecektir.',
        cardLostOrStolenInfo:
            'Sipari\u015Finiz verildi\u011Fi anda mevcut kart\u0131n\u0131z kal\u0131c\u0131 olarak devre d\u0131\u015F\u0131 b\u0131rak\u0131lacakt\u0131r. \u00C7o\u011Fu kart birka\u00E7 i\u015F g\u00FCn\u00FC i\u00E7inde ula\u015F\u0131r.',
        address: 'Adres',
        deactivateCardButton: 'Kart\u0131 devre d\u0131\u015F\u0131 b\u0131rak',
        shipNewCardButton: 'Yeni kart g\u00F6nder',
        addressError: 'Adres gereklidir',
        reasonError: 'Gerek\u00E7e gereklidir',
    },
    eReceipt: {
        guaranteed: 'Garantili eFatura',
        transactionDate: '\u0130\u015Flem tarihi',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText1: 'Bir sohbet ba\u015Flat,',
            buttonText2: `get $${CONST.REFERRAL_PROGRAM.REVENUE}.`,
            header: `Bir sohbet ba\u015Flat, $${CONST.REFERRAL_PROGRAM.REVENUE} kazan`,
            body: `Arkada\u015Flar\u0131n\u0131zla konu\u015Farak para kazan\u0131n! Yeni bir Expensify hesab\u0131yla sohbet ba\u015Flat\u0131n ve onlar m\u00FC\u015Fteri oldu\u011Funda $${CONST.REFERRAL_PROGRAM.REVENUE} kazan\u0131n.`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText1: 'Bir masraf g\u00F6nderin,',
            buttonText2: `get $${CONST.REFERRAL_PROGRAM.REVENUE}.`,
            header: `Bir gider g\u00F6nderin, $${CONST.REFERRAL_PROGRAM.REVENUE} kazan\u0131n`,
            body: `\u00D6deme almak \u00F6nemlidir! Yeni bir Expensify hesab\u0131na bir gider g\u00F6nderin ve onlar m\u00FC\u015Fteri oldu\u011Funda $${CONST.REFERRAL_PROGRAM.REVENUE} kazan\u0131n.`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.PAY_SOMEONE]: {
            buttonText1: 'Birine \u00F6deme yap,',
            buttonText2: `get $${CONST.REFERRAL_PROGRAM.REVENUE}.`,
            header: `Birine \u00F6deme yap, $${CONST.REFERRAL_PROGRAM.REVENUE} kazan`,
            body: `Para kazanmak i\u00E7in para harcaman\u0131z gerekiyor! Expensify ile birine \u00F6deme yap\u0131n ve m\u00FC\u015Fteri olduklar\u0131nda $${CONST.REFERRAL_PROGRAM.REVENUE} kazan\u0131n.`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            buttonText1: 'Bir arkada\u015F\u0131n\u0131 davet et,',
            buttonText2: `get $${CONST.REFERRAL_PROGRAM.REVENUE}.`,
            header: `$${CONST.REFERRAL_PROGRAM.REVENUE} al\u0131n`,
            body: `Bir arkada\u015F\u0131n\u0131zla sohbet edin, \u00F6deyin, g\u00F6nderin veya bir masraf\u0131 b\u00F6l\u00FC\u015F\u00FCn ve onlar m\u00FC\u015Fteri oldu\u011Funda $${CONST.REFERRAL_PROGRAM.REVENUE} kazan\u0131n. Aksi takdirde, sadece davet ba\u011Flant\u0131n\u0131z\u0131 payla\u015F\u0131n!`,
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText1: `$${CONST.REFERRAL_PROGRAM.REVENUE} al\u0131n`,
            header: `$${CONST.REFERRAL_PROGRAM.REVENUE} al\u0131n`,
            body: `Bir arkada\u015F\u0131n\u0131zla sohbet edin, \u00F6deyin, g\u00F6nderin veya bir masraf\u0131 b\u00F6l\u00FC\u015F\u00FCn ve onlar m\u00FC\u015Fteri oldu\u011Funda $${CONST.REFERRAL_PROGRAM.REVENUE} kazan\u0131n. Aksi takdirde, sadece davet ba\u011Flant\u0131n\u0131z\u0131 payla\u015F\u0131n!`,
        },
        copyReferralLink: 'Davet ba\u011Flant\u0131s\u0131n\u0131 kopyala',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: {
            phrase1: 'Kurulum uzman\u0131n\u0131zla sohbet edin',
            phrase2: 'yard\u0131m i\u00E7in',
        },
        default: {
            phrase1: 'Mesaj',
            phrase2: 'kurulumla ilgili yard\u0131m i\u00E7in',
        },
    },
    violations: {
        allTagLevelsRequired: 'T\u00FCm etiketler gereklidir',
        autoReportedRejectedExpense: ({rejectReason, rejectedBy}: ViolationsAutoReportedRejectedExpenseParams) =>
            `Bu gider, "${rejectReason}" yorumuyla ${rejectedBy} taraf\u0131ndan reddedildi.`,
        billableExpense: 'Faturaland\u0131r\u0131labilir art\u0131k ge\u00E7erli de\u011Fil',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `Fi\u015F gereklidir${formattedLimit ? ` ${formattedLimit} üzeri` : ''}`,
        categoryOutOfPolicy: 'Kategori art\u0131k ge\u00E7erli de\u011Fil',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `Uygulanan ${surcharge}% d\u00F6n\u00FC\u015F\u00FCm ek \u00FCcreti`,
        customUnitOutOfPolicy: 'Bu \u00E7al\u0131\u015Fma alan\u0131 i\u00E7in ge\u00E7erli oran yok',
        duplicatedTransaction: 'Yinelenen',
        fieldRequired: 'Rapor alanlar\u0131 gereklidir',
        futureDate: 'Gelecek tarih izin verilmez',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `Y\u00FCzde ${invoiceMarkup} ile i\u015Faretlendi`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `Date older than ${maxAge} days`,
        missingCategory: 'Eksik kategori',
        missingComment: 'Se\u00E7ilen kategori i\u00E7in a\u00E7\u0131klama gereklidir',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `Eksik ${tagName ?? 'tag'}`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return 'Hesaplanan mesafeden miktar farkl\u0131';
                case 'card':
                    return 'Kart i\u015Fleminden daha b\u00FCy\u00FCk miktar';
                default:
                    if (displayPercentVariance) {
                        return `Taranan fi\u015Fattan ${displayPercentVariance}% daha fazla miktar`;
                    }
                    return 'Taranan fi\u015Fattan daha b\u00FCy\u00FCk miktar';
            }
        },
        modifiedDate: 'Taranan fi\u015Ften farkl\u0131 tarih',
        nonExpensiworksExpense: 'Expensiworks harici gider',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Harcama, otomatik onay limiti olan ${formattedLimit}'i a\u015F\u0131yor.`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `Ki\u015Fi ba\u015F\u0131 kategori limitinin ${formattedLimit} \u00FCzerindeki miktar`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `Ki\u015Fi ba\u015F\u0131 ${formattedLimit} limitinin \u00FCzerindeki miktar`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `Ki\u015Fi ba\u015F\u0131 ${formattedLimit} limitinin \u00FCzerindeki miktar`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `G\u00FCnl\u00FCk ${formattedLimit}/ki\u015Fi kategori limitinin \u00FCzerindeki miktar`,
        receiptNotSmartScanned: 'Fi\u015F taramas\u0131 tamamlanamad\u0131. L\u00FCtfen detaylar\u0131 manuel olarak do\u011Frulay\u0131n.',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            let message = 'Fi\u015F gereklidir';
            if (formattedLimit ?? category) {
                message += "You didn't provide any text to translate. Please provide the text you want to be translated.";
                if (formattedLimit) {
                    message += ` ${formattedLimit}`;
                }
                if (category) {
                    message += ' kategori limiti';
                }
            }
            return message;
        },
        reviewRequired: '\u0130nceleme gereklidir',
        rter: ({brokenBankConnection, email, isAdmin, isTransactionOlderThan7Days, member, rterType}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530 || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return '';
            }
            if (brokenBankConnection) {
                return isAdmin
                    ? `K\u0131r\u0131k banka ba\u011Flant\u0131s\u0131 nedeniyle makbuz otomatik olarak e\u015Fle\u015Ftirilemiyor, bunu ${email} d\u00FCzeltmesi gerekiyor.`
                    : 'Fi\u015Fin otomatik e\u015Fle\u015Ftirilmesi, d\u00FCzeltilmesi gereken bozuk banka ba\u011Flant\u0131s\u0131 nedeniyle yap\u0131lam\u0131yor';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `Ask ${member} to mark as a cash or wait 7 days and try again` : 'Kart i\u015Flemiyle birle\u015Ftirme bekleniyor.';
            }
            return '';
        },
        brokenConnection530Error: 'Banka ba\u011Flant\u0131s\u0131n\u0131n kesilmesi nedeniyle makbuz beklemede.',
        adminBrokenConnectionError:
            "Banka ba\u011Flant\u0131s\u0131n\u0131n kesilmesi nedeniyle makbuz beklemede. L\u00FCtfen ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131n i\u00E7eri\u011Fini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan \u00E7\u00F6z\u00FCn. Yer tutucular\u0131n i\u00E7eri\u011Fi, ifadedeki temsillerini tan\u0131mlar, ancak ternary ifadeler veya di\u011Fer TypeScript kodlar\u0131n\u0131 i\u00E7erebilir.",
        memberBrokenConnectionError:
            'Banka ba\u011Flant\u0131s\u0131n\u0131n kesilmesi nedeniyle makbuz beklemekte. L\u00FCtfen \u00E7\u00F6z\u00FCm i\u00E7in bir \u00E7al\u0131\u015Fma alan\u0131 y\u00F6neticisine ba\u015Fvurun.',
        markAsCashToIgnore: 'Nakite i\u015Faretle, g\u00F6rmezden gel ve \u00F6deme talep et.',
        smartscanFailed: 'Fi\u015F taramas\u0131 ba\u015Far\u0131s\u0131z oldu. Detaylar\u0131 manuel olarak girin.',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `Eksik ${tagName ?? 'Etiket'}`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'Tag'} no longer valid`,
        taxAmountChanged: 'Vergi miktar\u0131 de\u011Fi\u015Ftirildi',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? 'Tax'} no longer valid`,
        taxRateChanged: 'Vergi oran\u0131 de\u011Fi\u015Ftirildi',
        taxRequired: 'Eksik vergi oran\u0131',
        none: 'The request does not provide any text to translate. Please provide the text that needs to be translated.',
        taxCodeToKeep: 'Hangi vergi kodunu saklayaca\u011F\u0131n\u0131z\u0131 se\u00E7in',
        tagToKeep: 'Hangi etiketi tutmak istedi\u011Finizi se\u00E7in',
        isTransactionReimbursable: '\u0130\u015Flemin geri \u00F6denebilir olup olmad\u0131\u011F\u0131n\u0131 se\u00E7in',
        merchantToKeep: 'Hangi t\u00FCccar\u0131 tutaca\u011F\u0131n\u0131z\u0131 se\u00E7in',
        descriptionToKeep: 'Hangi a\u00E7\u0131klaman\u0131n korunaca\u011F\u0131n\u0131 se\u00E7in',
        categoryToKeep: 'Hangi kategoriyi saklamak istedi\u011Finizi se\u00E7in',
        isTransactionBillable: '\u0130\u015Flemin faturaland\u0131r\u0131labilir olup olmad\u0131\u011F\u0131n\u0131 se\u00E7in',
        keepThisOne: 'Bunu sakla',
        confirmDetails: `Confirm the details you're keeping`,
        confirmDuplicatesInfo: `The duplicate requests you don't keep will be held for the member to delete`,
        hold: 'Tut',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} is required`,
    },
    violationDismissal: {
        rter: {
            manual: 'Bu makbuzu nakit olarak i\u015Faretledi',
        },
        duplicatedTransaction: {
            manual: '\u00E7ift olan\u0131 \u00E7\u00F6zd\u00FC',
        },
    },
    videoPlayer: {
        play: 'Oyna',
        pause: 'Duraklat',
        fullscreen: 'Tam Ekran',
        playbackSpeed: 'Oynatma h\u0131z\u0131',
        expand: 'Your request is a bit unclear. Could you please provide the text or TypeScript function that you want to be translated into Turkish?',
        mute: 'Sessize Al',
        unmute: 'Sesi A\u00E7',
        normal: "Bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
    },
    exitSurvey: {
        header: 'Gitmeden \u00F6nce',
        reasonPage: {
            title: 'L\u00FCtfen neden ayr\u0131ld\u0131\u011F\u0131n\u0131z\u0131 bize bildirin',
            subtitle: "Gitmeden \u00F6nce, neden Expensify Classic'a ge\u00E7mek istedi\u011Finizi bize l\u00FCtfen s\u00F6yleyin.",
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "Expensify Classic'ta bulunan bir \u00F6zelli\u011Fe ihtiyac\u0131m var.",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: "Yeni Expensify'yi nas\u0131l kullanaca\u011F\u0131m\u0131 anlam\u0131yorum.",
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: "Yeni Expensify'yi nas\u0131l kullanaca\u011F\u0131m\u0131 anl\u0131yorum, ancak ben Expensify Classic'i tercih ederim.",
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: "New Expensify'de olmayan hangi \u00F6zelli\u011Fe ihtiyac\u0131n\u0131z var?",
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]:
                "I'm sorry for the confusion, but it seems there's no text provided for translation. Could you please provide the text you want translated into Turkish?",
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: "Neden Expensify Classic'i tercih ediyorsunuz?",
        },
        responsePlaceholder: "You didn't provide any text to translate. Please provide the text you want to be translated.",
        thankYou: 'Geri bildirim i\u00E7in te\u015Fekk\u00FCrler!',
        thankYouSubtitle:
            'Verdi\u011Finiz yan\u0131tlar, i\u015Flerinizi halletmek i\u00E7in daha iyi bir \u00FCr\u00FCn olu\u015Fturmam\u0131za yard\u0131mc\u0131 olacak. \u00C7ok te\u015Fekk\u00FCr ederiz!',
        goToExpensifyClassic: "Expensify Classic'a Ge\u00E7in",
        offlineTitle: 'Burada tak\u0131l\u0131 kalm\u0131\u015F gibi g\u00F6r\u00FCn\u00FCyorsun...',
        offline:
            "\u00C7evrimd\u0131\u015F\u0131 g\u00F6r\u00FCn\u00FCyorsunuz. Ne yaz\u0131k ki, Expensify Classic \u00E7evrimd\u0131\u015F\u0131 \u00E7al\u0131\u015Fmaz, ancak New Expensify \u00E7al\u0131\u015F\u0131r. E\u011Fer Expensify Classic'i kullanmay\u0131 tercih ederseniz, internet ba\u011Flant\u0131n\u0131z oldu\u011Funda tekrar deneyin.",
        quickTip: 'H\u0131zl\u0131 ipucu...',
        quickTipSubTitle: "Expensify Classic'a do\u011Frudan expensify.com adresini ziyaret ederek gidebilirsiniz. Kolay bir k\u0131sayol i\u00E7in onu yer imlerinize ekleyin!",
        bookACall: 'Bir \u00E7a\u011Fr\u0131 ay\u0131rt\u0131n',
        noThanks: '\u00D6z\u00FCr dilerim, ancak \u00E7eviri yap\u0131lacak bir metin sa\u011Flanmad\u0131. L\u00FCtfen \u00E7eviri yapmam i\u00E7in bir metin sa\u011Flay\u0131n.',
        bookACallTitle: 'Bir \u00FCr\u00FCn m\u00FCd\u00FCr\u00FCyle konu\u015Fmak ister misiniz?',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: 'Giderler ve raporlar hakk\u0131nda do\u011Frudan sohbet etme',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'Mobil \u00FCzerinde her \u015Feyi yapabilme yetene\u011Fi',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'Sohbet h\u0131z\u0131nda seyahat ve masraf',
        },
        bookACallTextTop: "Expensify Classic'a ge\u00E7i\u015F yaparak, \u015Funlar\u0131 ka\u00E7\u0131racaks\u0131n\u0131z:",
        bookACallTextBottom:
            'Nedenini anlamak i\u00E7in sizinle bir g\u00F6r\u00FC\u015Fme yapmay\u0131 \u00E7ok isteriz. \u0130htiya\u00E7lar\u0131n\u0131z\u0131 tart\u0131\u015Fmak \u00FCzere k\u0131demli \u00FCr\u00FCn y\u00F6neticilerimizden biriyle bir g\u00F6r\u00FC\u015Fme ayarlayabilirsiniz.',
        takeMeToExpensifyClassic: "Beni Expensify Classic'a g\u00F6t\u00FCr",
    },
    listBoundary: {
        errorMessage: 'Daha fazla mesaj y\u00FCklenirken bir hata olu\u015Ftu.',
        tryAgain: 'Tekrar deneyin',
    },
    systemMessage: {
        mergedWithCashTransaction: 'Bu i\u015Flemle e\u015Fle\u015Fen bir makbuz bulundu',
    },
    subscription: {
        authenticatePaymentCard: '\u00D6deme kart\u0131n\u0131 do\u011Frula',
        mobileReducedFunctionalityMessage: 'Mobil uygulamada aboneli\u011Finizde de\u011Fi\u015Fiklik yapamazs\u0131n\u0131z.',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `\u00DCcretsiz deneme: ${numOfDays} ${numOfDays === 1 ? 'gün' : 'gün'} kald\u0131`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: '\u00D6deme bilgileriniz g\u00FCncel de\u011Fil',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `T\u00FCm favori \u00F6zelliklerinizi kullanmaya devam etmek i\u00E7in \u00F6deme kart\u0131n\u0131z\u0131 ${date} tarihine kadar g\u00FCncelleyin.`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '\u00D6deme bilgileriniz g\u00FCncel de\u011Fil',
                subtitle: 'L\u00FCtfen \u00F6deme bilgilerinizi g\u00FCncelleyin.',
            },
            policyOwnerUnderInvoicing: {
                title: '\u00D6deme bilgileriniz g\u00FCncel de\u011Fil',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) =>
                    `\u00D6demeniz gecikmi\u015Ftir. Hizmet kesintisini \u00F6nlemek i\u00E7in l\u00FCtfen faturan\u0131z\u0131 ${date} tarihine kadar \u00F6deyin.`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: '\u00D6deme bilgileriniz g\u00FCncel de\u011Fil',
                subtitle: '\u00D6demeniz gecikmi\u015Ftir. L\u00FCtfen faturan\u0131z\u0131 \u00F6deyin.',
            },
            billingDisputePending: {
                title: 'Kart\u0131n\u0131z tahsil edilemedi',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            },
            cardAuthenticationRequired: {
                title: 'Kart\u0131n\u0131z tahsil edilemedi',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) =>
                    `\u00D6deme kart\u0131n\u0131z tamamen do\u011Frulanmam\u0131\u015Ft\u0131r. L\u00FCtfen ${cardEnding} ile biten \u00F6deme kart\u0131n\u0131z\u0131 etkinle\u015Ftirmek i\u00E7in do\u011Frulama s\u00FCrecini tamamlay\u0131n.`,
            },
            insufficientFunds: {
                title: 'Kart\u0131n\u0131z tahsil edilemedi',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `\u00D6deme kart\u0131n\u0131z yetersiz bakiye nedeniyle reddedildi. L\u00FCtfen tekrar deneyin veya ${amountOwed} tutar\u0131ndaki borcunuzu \u00F6demek i\u00E7in yeni bir \u00F6deme kart\u0131 ekleyin.`,
            },
            cardExpired: {
                title: 'Kart\u0131n\u0131z tahsil edilemedi',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `\u00D6deme kart\u0131n\u0131z\u0131n s\u00FCresi doldu. L\u00FCtfen ${amountOwed} tutar\u0131ndaki borcunuzu \u00F6deyebilmek i\u00E7in yeni bir \u00F6deme kart\u0131 ekleyin.`,
            },
            cardExpireSoon: {
                title: 'Kart\u0131n\u0131z\u0131n s\u00FCresi yak\u0131nda doluyor',
                subtitle:
                    '\u00D6deme kart\u0131n\u0131z bu ay\u0131n sonunda sona erecek. T\u00FCm favori \u00F6zelliklerinizi kullanmaya devam etmek ve kart\u0131n\u0131z\u0131 g\u00FCncellemek i\u00E7in a\u015Fa\u011F\u0131daki \u00FC\u00E7 nokta men\u00FCs\u00FCn\u00FC t\u0131klay\u0131n.',
            },
            retryBillingSuccess: {
                title: 'Ba\u015Far\u0131l\u0131!',
                subtitle: 'Kart\u0131n\u0131z ba\u015Far\u0131yla tahsil edildi.',
            },
            retryBillingError: {
                title: 'Kart\u0131n\u0131z tahsil edilemedi',
                subtitle:
                    'Tekrar denemeden \u00F6nce, l\u00FCtfen bankan\u0131z\u0131 do\u011Frudan aray\u0131n ve Expensify \u00FCcretlerini yetkilendirin ve herhangi bir tutmay\u0131 kald\u0131r\u0131n. Aksi takdirde, farkl\u0131 bir \u00F6deme kart\u0131 eklemeyi deneyin.',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `You disputed the ${amountOwed} charge on the card ending in ${cardEnding}. Your account will be locked until the dispute is resolved with your bank.`,
            preTrial: {
                title: '\u00DCcretsiz deneme ba\u015Flat\u0131n',
                subtitleStart: 'Bir sonraki ad\u0131m olarak,',
                subtitleLink: 'kurulum kontrol listesinizi tamamlay\u0131n',
                subtitleEnd: 'b\u00F6ylece ekibiniz harcamaya ba\u015Flayabilir.',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `Deneme: ${numOfDays} ${numOfDays === 1 ? 'gün' : 'gün'} kald\u0131!`,
                subtitle: 'T\u00FCm favori \u00F6zelliklerinizi kullanmaya devam etmek i\u00E7in bir \u00F6deme kart\u0131 ekleyin.',
            },
            trialEnded: {
                title: '\u00DCcretsiz deneme s\u00FCreniz sona erdi',
                subtitle: 'T\u00FCm favori \u00F6zelliklerinizi kullanmaya devam etmek i\u00E7in bir \u00F6deme kart\u0131 ekleyin.',
            },
            earlyDiscount: {
                claimOffer: 'Teklifi talep et',
                noThanks: '\u00D6z\u00FCr dilerim, ancak \u00E7eviri yap\u0131lacak bir metin sa\u011Flanmad\u0131. L\u00FCtfen \u00E7eviri yapmam i\u00E7in bir metin sa\u011Flay\u0131n.',
                subscriptionPageTitle: {
                    phrase1: ({discountType}: EarlyDiscountTitleParams) => `\u0130lk y\u0131l\u0131n\u0131zda ${discountType}% indirim!`,
                    phrase2: `Just add a payment card and start an annual subscription.`,
                },
                onboardingChatTitle: {
                    phrase1: 'S\u0131n\u0131rl\u0131 zamanl\u0131 teklif:',
                    phrase2: ({discountType}: EarlyDiscountTitleParams) => `\u0130lk y\u0131l\u0131n\u0131zda ${discountType}% indirim!`,
                },
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `${hours}h : ${minutes}m : ${seconds}s i\u00E7inde talep edin`,
            },
        },
        cardSection: {
            title: '\u00D6deme',
            subtitle: 'Expensify aboneli\u011Finizi \u00F6demek i\u00E7in bir kart ekleyin.',
            addCardButton: '\u00D6deme kart\u0131 ekle',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `Sizin sonraki \u00F6deme tarihiniz ${nextPaymentDate}.`,
            cardEnding: ({cardNumber}: CardEndingParams) => `Card ending in ${cardNumber}`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `\u0130sim: ${name}, Son Kullanma Tarihi: ${expiration}, Para Birimi: ${currency}`,
            changeCard: '\u00D6deme kart\u0131n\u0131 de\u011Fi\u015Ftir',
            changeCurrency: '\u00D6deme para birimini de\u011Fi\u015Ftir',
            cardNotFound: '\u00D6deme kart\u0131 eklenmedi',
            retryPaymentButton: '\u00D6demeyi yeniden deneyin',
            authenticatePayment: '\u00D6deme do\u011Frulamas\u0131',
            requestRefund: '\u0130ade talep et',
            requestRefundModal: {
                phrase1:
                    'Geri \u00F6deme almak kolayd\u0131r, sadece bir sonraki fatura tarihinizden \u00F6nce hesab\u0131n\u0131z\u0131 d\u00FC\u015F\u00FCr\u00FCn ve geri \u00F6deme alacaks\u0131n\u0131z.',
                phrase2:
                    'Dikkat: Hesab\u0131n\u0131z\u0131 d\u00FC\u015F\u00FCrmek, \u00E7al\u0131\u015Fma alanlar\u0131n\u0131z\u0131n silinmesi anlam\u0131na gelir. Bu i\u015Flem geri al\u0131namaz, ancak fikrinizi de\u011Fi\u015Ftirirseniz her zaman yeni bir \u00E7al\u0131\u015Fma alan\u0131 olu\u015Fturabilirsiniz.',
                confirm: '\u00C7al\u0131\u015Fma alan(lar)\u0131n\u0131 sil ve d\u00FC\u015F\u00FCr',
            },
            viewPaymentHistory: '\u00D6deme ge\u00E7mi\u015Fini g\u00F6r\u00FCnt\u00FCle',
        },
        yourPlan: {
            title: 'Senin plan\u0131n',
            collect: {
                title: 'Topla',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Expensify Card'\u0131 olan ${lower}/aktif \u00FCye, Expensify Card'\u0131 olmayan ${upper}/aktif \u00FCye.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Expensify Card'\u0131 olan ${lower}/aktif \u00FCye, Expensify Card'\u0131 olmayan ${upper}/aktif \u00FCye.`,
                benefit1: 'S\u0131n\u0131rs\u0131z SmartScan ve mesafe takibi',
                benefit2: 'Ak\u0131ll\u0131 Limitler ile Expensify Kartlar\u0131',
                benefit3: 'Fatura \u00F6deme ve faturaland\u0131rma',
                benefit4: 'Gider onaylar\u0131',
                benefit5: 'ACH geri \u00F6deme',
                benefit6: 'QuickBooks ve Xero entegrasyonlar\u0131',
                benefit7: '\u00D6zel i\u00E7g\u00F6r\u00FCler ve raporlama',
            },
            control: {
                title: 'Kontrol',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) => `Expensify Card'\u0131 olan ${lower}/aktif \u00FCye, Expensify Card'\u0131 olmayan ${upper}/aktif \u00FCye.`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) => `Expensify Card'\u0131 olan ${lower}/aktif \u00FCye, Expensify Card'\u0131 olmayan ${upper}/aktif \u00FCye.`,
                benefit1: "Collect'teki her \u015Feyin yan\u0131 s\u0131ra:",
                benefit2: 'NetSuite ve Sage Intacct entegrasyonlar\u0131',
                benefit3: 'Certinia ve Workday senkronizasyonu',
                benefit4: '\u00C7oklu gider onaylay\u0131c\u0131lar',
                benefit5: 'SAML/SSO',
                benefit6: 'B\u00FCt\u00E7eleme',
            },
            saveWithExpensifyTitle: 'Expensify Card ile Tasarruf Edin',
            saveWithExpensifyDescription:
                "Expensify Card'dan alaca\u011F\u0131n\u0131z nakit iadenin Expensify faturan\u0131z\u0131 nas\u0131l azaltabilece\u011Fini g\u00F6rmek i\u00E7in tasarruf hesaplay\u0131c\u0131m\u0131z\u0131 kullan\u0131n.",
            saveWithExpensifyButton: 'Daha fazla \u00F6\u011Fren',
        },
        details: {
            title: 'Abonelik detaylar\u0131',
            annual: 'Y\u0131ll\u0131k abonelik',
            taxExempt: 'Vergi muafiyeti durumu talep et',
            taxExemptEnabled: 'Vergiden muaf',
            payPerUse: 'Kullan\u0131m ba\u015F\u0131na \u00F6deme',
            subscriptionSize: 'Abonelik boyutu',
            headsUp:
                'Dikkat: E\u011Fer abonelik boyutunuzu \u015Fimdi belirlemezseniz, otomatik olarak ilk ay\u0131n aktif \u00FCye say\u0131n\u0131za ayarlar\u0131z. Sonras\u0131nda en az bu say\u0131da \u00FCye i\u00E7in \u00F6n\u00FCm\u00FCzdeki 12 ay boyunca \u00F6deme yapmay\u0131 taahh\u00FCt etmi\u015F olursunuz. Abonelik boyutunuzu her zaman art\u0131rabilirsiniz, ancak aboneli\u011Finiz bitene kadar azaltamazs\u0131n\u0131z.',
            zeroCommitment: '\u0130ndirimli y\u0131ll\u0131k abonelik oran\u0131nda s\u0131f\u0131r taahh\u00FCt',
        },
        subscriptionSize: {
            title: 'Abonelik boyutu',
            yourSize: 'Abonelik boyutunuz, belirli bir ayda herhangi bir aktif \u00FCye taraf\u0131ndan doldurulabilecek a\u00E7\u0131k koltuk say\u0131s\u0131d\u0131r.',
            eachMonth:
                'Her ay, aboneli\u011Finiz yukar\u0131da belirlenen aktif \u00FCye say\u0131s\u0131n\u0131 kapsar. Abonelik boyutunuzu herhangi bir zaman art\u0131rd\u0131\u011F\u0131n\u0131zda, yeni boyutta yeni bir 12 ayl\u0131k aboneli\u011Fe ba\u015Flars\u0131n\u0131z.',
            note: 'Not: Aktif bir \u00FCye, \u015Firket \u00E7al\u0131\u015Fma alan\u0131n\u0131za ba\u011Fl\u0131 masraf verilerini olu\u015Fturan, d\u00FCzenleyen, g\u00F6nderen, onaylayan, geri \u00F6deyen veya d\u0131\u015Fa aktaran herkesdir.',
            confirmDetails: 'Yeni y\u0131ll\u0131k abonelik detaylar\u0131n\u0131z\u0131 onaylay\u0131n:',
            subscriptionSize: 'Abonelik boyutu',
            activeMembers: ({size}: SubscriptionSizeParams) => `${size} active members/month`,
            subscriptionRenews: 'Abonelik yenilenir',
            youCantDowngrade: 'Y\u0131ll\u0131k aboneli\u011Finiz s\u00FCresince paket d\u00FC\u015F\u00FCrme i\u015Flemi yapamazs\u0131n\u0131z.',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `Zaten ${size} aktif \u00FCye boyutunda bir y\u0131ll\u0131k aboneli\u011Fe taahh\u00FCt ettiniz ayda bir ${date} tarihine kadar. Otomatik yenilemeyi devre d\u0131\u015F\u0131 b\u0131rakarak ${date} tarihinde pay-per-use aboneli\u011Fine ge\u00E7ebilirsiniz.`,
            error: {
                size: 'L\u00FCtfen ge\u00E7erli bir abonelik boyutu girin.',
                sameSize: 'L\u00FCtfen mevcut abonelik boyutunuzdan farkl\u0131 bir numara girin.',
            },
        },
        paymentCard: {
            addPaymentCard: '\u00D6deme kart\u0131 ekle',
            enterPaymentCardDetails: '\u00D6deme kart\u0131 detaylar\u0131n\u0131z\u0131 girin',
            security: 'Expensify, PCI-DSS uyumlu, banka d\u00FCzeyinde \u015Fifreleme kullan\u0131r ve verilerinizi korumak i\u00E7in yedekli altyap\u0131y\u0131 kullan\u0131r.',
            learnMoreAboutSecurity: 'G\u00FCvenli\u011Fimiz hakk\u0131nda daha fazla bilgi edinin.',
        },
        subscriptionSettings: {
            title: 'Abonelik ayarlar\u0131',
            autoRenew: 'Otomatik yenileme',
            autoIncrease: 'Y\u0131ll\u0131k koltuklar\u0131 otomatik art\u0131r',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `Aktif \u00FCye ba\u015F\u0131na ayda ${amountWithCurrency} kadar tasarruf edin`,
            automaticallyIncrease:
                'Aktif \u00FCyelerinizin abonelik boyutunuzu a\u015Ft\u0131\u011F\u0131 durumlar i\u00E7in y\u0131ll\u0131k koltuk say\u0131n\u0131z\u0131 otomatik olarak art\u0131r\u0131n. Not: Bu, y\u0131ll\u0131k abonelik biti\u015F tarihinizi uzatacakt\u0131r.',
            disableAutoRenew: 'Otomatik yenilemeyi devre d\u0131\u015F\u0131 b\u0131rak',
            helpUsImprove: "Expensify'yi geli\u015Ftirmemize yard\u0131mc\u0131 olun",
            whatsMainReason: 'Otomatik yenilemeyi devre d\u0131\u015F\u0131 b\u0131rakman\u0131z\u0131n ana sebebi nedir?',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `Renews on ${date}.`,
        },
        requestEarlyCancellation: {
            title: 'Erken iptal talep et',
            subtitle: 'Erken iptal talebinizin ana sebebi nedir?',
            subscriptionCanceled: {
                title: 'Abonelik iptal edildi',
                subtitle: 'Y\u0131ll\u0131k aboneli\u011Finiz iptal edilmi\u015Ftir.',
                info: 'E\u011Fer \u00E7al\u0131\u015Fma alanlar\u0131n\u0131z\u0131 pay-per-use (kullan\u0131mda \u00F6de) basisinde kullanmaya devam etmek istiyorsan\u0131z, her \u015Fey haz\u0131r.',
                preventFutureActivity: {
                    part1: 'Gelecekteki aktivite ve \u00FCcretleri \u00F6nlemek istiyorsan\u0131z, bunu yapmal\u0131s\u0131n\u0131z',
                    link: 'i\u015F alan\u0131n\u0131z\u0131 silin',
                    part2: '\u00C7al\u0131\u015Fma alan(lar)\u0131n\u0131z\u0131 sildi\u011Finizde, mevcut takvim ay\u0131 boyunca olu\u015Fan herhangi bir bekleyen aktivite i\u00E7in \u00FCcretlendirileceksiniz.',
                },
            },
            requestSubmitted: {
                title: 'Talep g\u00F6nderildi',
                subtitle: {
                    part1: 'Aboneli\u011Finizi iptal etmekle ilgilendi\u011Finizi bize bildirdi\u011Finiz i\u00E7in te\u015Fekk\u00FCr ederiz. \u0130ste\u011Finizi g\u00F6zden ge\u00E7iriyoruz ve yak\u0131nda sohbetiniz arac\u0131l\u0131\u011F\u0131yla sizinle ileti\u015Fime ge\u00E7ece\u011Fiz.',
                    link: 'Kap\u0131c\u0131',
                    part2: 'Your request is missing the text that needs to be translated. Please provide the text for translation.',
                },
            },
            acknowledgement: {
                part1: "Erken iptal talebinde bulunarak, Expensify'nin b\u00F6yle bir talebi kabul etme y\u00FCk\u00FCml\u00FCl\u00FC\u011F\u00FC olmad\u0131\u011F\u0131n\u0131 kabul eder ve onaylar\u0131m.",
                link: 'Hizmet \u015Eartlar\u0131',
                part2: "veya benim ve Expensify aras\u0131ndaki di\u011Fer ge\u00E7erli hizmet anla\u015Fmas\u0131 ve Expensify'nin herhangi bir talebi kabul etme konusunda tek takdir yetkisini sakl\u0131 tuttu\u011Fu.",
            },
        },
    },
    feedbackSurvey: {
        tooLimited: 'Fonksiyonellik iyile\u015Ftirme gerektiriyor',
        tooExpensive: '\u00C7ok pahal\u0131',
        inadequateSupport: 'Yetersiz m\u00FC\u015Fteri deste\u011Fi',
        businessClosing: '\u015Eirket kapan\u0131yor, k\u00FC\u00E7\u00FCl\u00FCyor veya sat\u0131n al\u0131n\u0131yor',
        additionalInfoTitle: 'Hangi yaz\u0131l\u0131ma ge\u00E7iyorsunuz ve neden?',
        additionalInfoInputLabel: "You didn't provide any text to translate. Please provide the text you want to be translated.",
    },
    roomChangeLog: {
        updateRoomDescription: 'oda a\u00E7\u0131klamas\u0131n\u0131 \u015Fu \u015Fekilde ayarla:',
        clearRoomDescription: 'oda a\u00E7\u0131klamas\u0131n\u0131 temizledi',
    },
    delegate: {
        switchAccount: 'Hesaplar\u0131 De\u011Fi\u015Ftir:',
        copilotDelegatedAccess: 'Copilot: Devredilen eri\u015Fim',
        copilotDelegatedAccessDescription: 'Di\u011Fer \u00FCyelerin hesab\u0131n\u0131za eri\u015Fmesine izin verin.',
        addCopilot: 'Copilot ekle',
        membersCanAccessYourAccount: 'Bu \u00FCyeler hesab\u0131n\u0131za eri\u015Febilir:',
        youCanAccessTheseAccounts: 'Bu hesaplara hesap de\u011Fi\u015Ftirici arac\u0131l\u0131\u011F\u0131yla eri\u015Febilirsiniz:',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return "You haven't provided any text to translate. Please provide the text you want translated.";
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'S\u0131n\u0131rl\u0131';
                default:
                    return '';
            }
        },
        genericError: 'Hata olu\u015Ftu, l\u00FCtfen tekrar deneyin.',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `on behalf of ${delegator}`,
        accessLevel: 'Eri\u015Fim seviyesi',
        confirmCopilot: 'A\u015Fa\u011F\u0131daki yard\u0131mc\u0131 pilotunuzu onaylay\u0131n.',
        accessLevelDescription:
            'A\u015Fa\u011F\u0131da bir eri\u015Fim seviyesi se\u00E7in. Hem Tam hem de S\u0131n\u0131rl\u0131 eri\u015Fim, yard\u0131mc\u0131 pilotlar\u0131n t\u00FCm konu\u015Fmalar\u0131 ve giderleri g\u00F6r\u00FCnt\u00FClemesine izin verir.',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'Bir ba\u015Fka \u00FCyenin hesab\u0131n\u0131zdaki t\u00FCm i\u015Flemleri sizin ad\u0131n\u0131za yapmas\u0131na izin verin. Sohbet, g\u00F6nderimler, onaylar, \u00F6demeler, ayar g\u00FCncellemeleri ve daha fazlas\u0131n\u0131 i\u00E7erir.';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return 'Bir ba\u015Fka \u00FCyenin hesab\u0131n\u0131zdaki \u00E7o\u011Fu i\u015Flemi sizin ad\u0131n\u0131za ger\u00E7ekle\u015Ftirmesine izin verin. Onaylar, \u00F6demeler, reddetmeler ve bekletmeler hari\u00E7tir.';
                default:
                    return '';
            }
        },
        removeCopilot: "Copilot'\u0131 kald\u0131r",
        removeCopilotConfirmation: "Bu copilot'i kald\u0131rmak istedi\u011Finizden emin misiniz?",
        changeAccessLevel: 'Eri\u015Fim seviyesini de\u011Fi\u015Ftir',
        makeSureItIsYou: 'Sen oldu\u011Fundan emin olal\u0131m',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) =>
            `L\u00FCtfen bir yard\u0131mc\u0131 pilot eklemek i\u00E7in ${contactMethod} adresine g\u00F6nderilen sihirli kodu girin. Kod bir veya iki dakika i\u00E7inde gelmelidir.`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `L\u00FCtfen copilotunuzu g\u00FCncellemek i\u00E7in ${contactMethod} 'a g\u00F6nderilen sihirli kodu girin.`,
        notAllowed: '\u00C7ok h\u0131zl\u0131 de\u011Fil...',
        noAccessMessage: 'Bir yard\u0131mc\u0131 pilot olarak, bu sayfaya eri\u015Fiminiz yok. \u00DCzg\u00FCn\u00FCz!',
        notAllowedMessageStart: `As a`,
        notAllowedMessageHyperLinked:
            "Bir d\u00FCz metin veya bir TypeScript fonksiyonu olan a\u015Fa\u011F\u0131daki metni \u00E7evirin. Yer tutucular\u0131 ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} vb. i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feye tan\u0131mlay\u0131c\u0131d\u0131r, ancak ternary ifadeler veya di\u011Fer TypeScript kodu i\u00E7erebilir.",
        notAllowedMessageEnd: ({accountOwnerEmail}: AccountOwnerParams) => ` for ${accountOwnerEmail}, you don't have permission to take this action. Sorry!`,
    },
    debug: {
        debug: 'Hata Ay\u0131klama',
        details: 'Detaylar',
        JSON: 'You seem to have made a mistake. There is no text provided for translation. Please provide the text you want translated.',
        reportActions: 'Eylemler',
        reportActionPreview: '\u00D6nizleme',
        nothingToPreview: '\u00D6nizlenecek bir \u015Fey yok',
        editJson: "JSON'\u0131 D\u00FCzenle:",
        preview: '\u00D6nizleme:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `Eksik ${propertyName}`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `Ge\u00E7ersiz \u00F6zellik: ${propertyName} - Beklenen: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `Ge\u00E7ersiz de\u011Fer - Beklenen: ${expectedValues}`,
        missingValue: 'Eksik de\u011Fer',
        createReportAction: 'Rapor Olu\u015Fturma Eylemi',
        reportAction: 'Rapor Eylemi',
        report: 'Rapor',
        transaction: '\u0130\u015Flem',
        violations: '\u0130hlaller',
        transactionViolation: '\u0130\u015Flem \u0130hlali',
        hint: 'Veri de\u011Fi\u015Fiklikleri arka uca g\u00F6nderilmeyecek',
        textFields: 'Metin alanlar\u0131',
        numberFields: 'Numara alanlar\u0131',
        booleanFields: 'Boolean alanlar\u0131',
        constantFields: 'Sabit alanlar',
        dateTimeFields: 'TarihSaat alanlar\u0131',
        date: 'Tarih',
        time: 'Zaman',
        none: 'The request does not provide any text to translate. Please provide the text that needs to be translated.',
        visibleInLHN: "LHN'de g\u00F6r\u00FCn\u00FCr",
        GBR: "Bu bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. Yer tutucular\u0131 ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} vb. i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki temsil ettikleri \u015Feyi tan\u0131mlar, ancak ternary ifadeler veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
        RBR: 'Your request is not clear. Could you please provide the text or TypeScript function that you want to translate into Turkish?',
        true: 'Your request is not clear. Please provide the text or TypeScript function that you want to translate into Turkish.',
        false: "The task doesn't provide any text to translate. Please provide the text you want to translate.",
        viewReport: 'Raporu G\u00F6r\u00FCnt\u00FCle',
        viewTransaction: '\u0130\u015Flemi g\u00F6r\u00FCnt\u00FCle',
        createTransactionViolation: '\u0130\u015Flem ihlali olu\u015Ftur',
        reasonVisibleInLHN: {
            hasDraftComment: 'Taslak yorumu var',
            hasGBR: "Bu bir d\u00FCz metin veya bir \u015Fablon dizesi d\u00F6nd\u00FCren bir TypeScript fonksiyonudur. ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'} gibi yer tutucular\u0131 i\u00E7eriklerini de\u011Fi\u015Ftirmeden veya parantezleri kald\u0131rmadan koruyun. Yer tutucular\u0131n i\u00E7erikleri, ifadedeki neyi temsil ettiklerini a\u00E7\u0131klar, ancak ternary ifadeleri veya di\u011Fer TypeScript kodunu i\u00E7erebilir.",
            hasRBR: 'RBR var m\u0131',
            pinnedByUser: '\u00DCye taraf\u0131ndan sabitlendi',
            hasIOUViolations: 'IOU ihlalleri var',
            hasAddWorkspaceRoomErrors: '\u00C7al\u0131\u015Fma alan\u0131 odas\u0131 eklerken hatalar olu\u015Ftu',
            isUnread: 'Okunmam\u0131\u015F (odak modu)',
            isArchived: 'Ar\u015Fivlendi (en son mod)',
            isSelfDM: 'Kendine DM mi',
            isFocused: 'Ge\u00E7ici olarak odaklanm\u0131\u015F',
        },
        reasonGBR: {
            hasJoinRequest: 'Kat\u0131lma iste\u011Fi var (admin odas\u0131)',
            isUnreadWithMention: 'Bahsetme ile okunmam\u0131\u015F',
            isWaitingForAssigneeToCompleteAction: 'Atanan\u0131n eylemi tamamlamas\u0131n\u0131 bekliyor',
            hasChildReportAwaitingAction: 'Eylem bekleyen \u00E7ocuk raporu var',
            hasMissingInvoiceBankAccount: 'Fatura banka hesab\u0131 eksik',
        },
        reasonRBR: {
            hasErrors: 'Rapor veya rapor eylemleri verilerinde hatalar var',
            hasViolations: '\u0130hlalleri var',
            hasTransactionThreadViolations: '\u0130\u015Flem i\u015F par\u00E7ac\u0131\u011F\u0131 ihlalleri var',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: 'Bir raporun i\u015Flem bekledi\u011Fi var',
            theresAReportWithErrors: 'Hatalarla dolu bir rapor var',
            theresAWorkspaceWithCustomUnitsErrors: '\u00D6zel birim hatalar\u0131 olan bir \u00E7al\u0131\u015Fma alan\u0131 var',
            theresAProblemWithAWorkspaceMember: 'Bir \u00E7al\u0131\u015Fma alan\u0131 \u00FCyesiyle ilgili bir sorun var',
            theresAProblemWithAContactMethod: 'Bir ileti\u015Fim y\u00F6ntemiyle ilgili bir sorun var',
            aContactMethodRequiresVerification: 'Bir ileti\u015Fim y\u00F6ntemi do\u011Frulama gerektirir',
            theresAProblemWithAPaymentMethod: 'Bir \u00F6deme y\u00F6ntemiyle ilgili bir sorun var',
            theresAProblemWithAWorkspace: 'Bir \u00E7al\u0131\u015Fma alan\u0131yla ilgili bir sorun var',
            theresAProblemWithYourReimbursementAccount: 'Geri \u00F6deme hesab\u0131n\u0131zla ilgili bir sorun var',
            theresABillingProblemWithYourSubscription: 'Aboneli\u011Finizle ilgili bir fatura sorunu var',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'Aboneli\u011Finiz ba\u015Far\u0131yla yenilendi',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'Bir \u00E7al\u0131\u015Fma alan\u0131 ba\u011Flant\u0131 senkronizasyonu s\u0131ras\u0131nda bir problem olu\u015Ftu.',
            theresAProblemWithYourWallet: 'C\u00FCzdan\u0131n\u0131zla ilgili bir sorun var',
            theresAProblemWithYourWalletTerms: 'C\u00FCzdan\u0131n\u0131z\u0131n \u015Fartlar\u0131nda bir sorun var',
        },
    },
    emptySearchView: {
        takeATour: 'Bir tur at\u0131n',
    },
    tour: {
        takeATwoMinuteTour: '2 dakikal\u0131k bir tura \u00E7\u0131k\u0131n',
        exploreExpensify: "Expensify'nin sunabilece\u011Fi her \u015Feyi ke\u015Ffedin",
    },
    migratedUserWelcomeModal: {
        title: 'Sohbetin h\u0131z\u0131nda seyahat ve masraf',
        subtitle: 'Yeni Expensify, ayn\u0131 harika otomasyonu sunuyor, ancak \u015Fimdi muhte\u015Fem i\u015Fbirli\u011Fi \u00F6zellikleriyle:',
        confirmText: 'Hadi gidelim!',
        features: {
            chat: '<strong>Herhangi bir gider</strong>, rapor veya \u00E7al\u0131\u015Fma alan\u0131nda do\u011Frudan sohbet edin',
            scanReceipt: '<strong>Faturalar\u0131 taray\u0131n</strong> ve geri \u00F6deme al\u0131n',
            crossPlatform: 'Telefonunuzdan veya taray\u0131c\u0131n\u0131zdan <strong>her \u015Feyi</strong> yap\u0131n',
        },
    },
    productTrainingTooltip: {
        conciergeLHNGBR: {
            part1: 'Ba\u015Fla',
            part2: 'Your request is incomplete. Please provide the text or TypeScript function that you want to be translated.',
        },
        saveSearchTooltip: {
            part1: 'Kaydedilmi\u015F aramalar\u0131n\u0131z\u0131 yeniden adland\u0131r\u0131n',
            part2: 'Your request is incomplete. Please provide the text or TypeScript function that you want to be translated.',
        },
        quickActionButton: {
            part1: 'H\u0131zl\u0131 hareket!',
            part2: 'Sadece bir dokunu\u015F uzakta',
        },
        workspaceChatCreate: {
            part1: "\u00D6nerinizi g\u00F6nderin ${username}, ${count}, ${someBoolean ? 'valueIfTrue' : 'valueIfFalse'}",
            part2: 'giderler',
            part3: 'Your request is incomplete. Please provide the text or TypeScript function that you want to be translated.',
        },
        searchFilterButtonTooltip: {
            part1: 'Araman\u0131z\u0131 \u00F6zelle\u015Ftirin',
            part2: 'Your request is incomplete. Please provide the text or TypeScript function that you want to be translated.',
        },
        bottomNavInboxTooltip: {
            part1: 'Yap\u0131lacaklar listesi',
            part2: '\uD83D\uDFE2 = sizin i\u00E7in haz\u0131r',
            part3: 'As a language model AI developed by OpenAI, I need to clarify that the task is incomplete. Please provide the text or TypeScript function that needs to be translated to Turkish.',
        },
        workspaceChatTooltip: {
            part1: 'Giderleri g\u00F6nderin',
            part2: 've sohbet et',
            part3: 'onaylay\u0131c\u0131lar burada!',
        },
        globalCreateTooltip: {
            part1: 'Gider olu\u015Ftur',
            part2: 'sohbet etmeye ba\u015Fla,',
            part3: 've daha fazlas\u0131!',
        },
        scanTestTooltip: {
            part1: "Scan'\u0131n nas\u0131l \u00E7al\u0131\u015Ft\u0131\u011F\u0131n\u0131 g\u00F6rmek ister misiniz?",
            part2: 'Bir test makbuzu deneyin!',
            part3: 'Bizim se\u00E7in',
            part4: 'test y\u00F6neticisi',
            part5: 'denemek i\u00E7in!',
            part6: '\u015Eimdi,',
            part7: 'masraf\u0131n\u0131z\u0131 g\u00F6nderin',
            part8: 've sihrin ger\u00E7ekle\u015Fmesini izleyin!',
        },
    },
    discardChangesConfirmation: {
        title: 'De\u011Fi\u015Fiklikler at\u0131ls\u0131n m\u0131?',
        body: 'Yapt\u0131\u011F\u0131n\u0131z de\u011Fi\u015Fiklikleri atmak istedi\u011Finize emin misiniz?',
        confirmText: 'De\u011Fi\u015Fiklikleri at',
    },
};
export default translations satisfies TranslationDeepObject<typeof translations>;
