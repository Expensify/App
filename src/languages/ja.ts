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
        count: '件数',
        cancel: 'キャンセル',
        // @context Refers to closing or hiding a notification or message, not rejecting or ignoring something.
        dismiss: '閉じる',
        // @context Used on a button to continue an action or workflow, not the formal or procedural sense of “to proceed.”
        proceed: '続行',
        yes: 'はい',
        no: 'いいえ',
        // @context Universal confirmation button. Keep the UI-standard term “OK” unless the locale strongly prefers an alternative.
        ok: 'OK',
        notNow: '今はしない',
        noThanks: '結構です',
        learnMore: '詳細はこちら',
        buttonConfirm: '了解しました',
        name: '名前',
        attachment: '添付ファイル',
        attachments: '添付ファイル',
        center: '中央',
        from: '差出人',
        to: '宛先',
        in: '内',
        optional: '任意',
        new: '新規',
        search: '検索',
        reports: 'レポート',
        find: '検索',
        searchWithThreeDots: '検索...',
        next: '次へ',
        previous: '前へ',
        // @context Navigation button that returns the user to the previous screen. Should be interpreted as a UI action label.
        goBack: '戻る',
        create: '作成',
        add: '追加',
        resend: '再送信',
        save: '保存',
        select: '選択',
        deselect: '選択解除',
        // @context Menu or label title referring to the ability to select multiple items. Should be interpreted as a noun phrase, not a command.
        selectMultiple: '複数選択',
        saveChanges: '変更を保存',
        submit: '送信',
        // @context Status label meaning an item has already been sent or submitted (e.g., a form or report). Not the action “to submit.”
        submitted: '送信済み',
        rotate: '回転',
        zoom: 'Zoom',
        password: 'パスワード',
        magicCode: 'マジックコード',
        twoFactorCode: '二要素認証コード',
        workspaces: 'ワークスペース',
        inbox: '受信トレイ',
        // @context Used in confirmation or result messages indicating that an action completed successfully, not the abstract noun “success.”
        success: '成功しました',
        group: 'グループ',
        profile: 'プロフィール',
        referral: '紹介',
        payments: '支払い',
        approvals: '承認',
        wallet: 'ウォレット',
        preferences: '設定',
        view: '表示',
        review: (reviewParams?: ReviewParams) => `Review${reviewParams?.amount ? ` ${reviewParams?.amount}` : ''}`,
        not: 'いいえ',
        signIn: 'サインイン',
        signInWithGoogle: 'Google でサインイン',
        signInWithApple: 'Appleでサインイン',
        signInWith: 'でサインイン',
        continue: '続行',
        firstName: '名 (名)',
        lastName: '姓',
        scanning: 'スキャン中',
        addCardTermsOfService: 'Expensify 利用規約',
        perPerson: '1人あたり',
        phone: '電話',
        phoneNumber: '電話番号',
        phoneNumberPlaceholder: '(xxx) xxx-xxxx',
        email: 'メールアドレス',
        and: 'と',
        or: 'または',
        details: '詳細',
        privacy: 'プライバシー',
        privacyPolicy: 'プライバシーポリシー',
        hidden: '非表示',
        visible: '表示',
        delete: '削除',
        // @context UI label indicating that an item is archived. Maintain capitalization consistency across similar status labels.
        archived: 'アーカイブ済み',
        contacts: '連絡先',
        recents: '最近',
        close: '閉じる',
        comment: 'コメント',
        download: 'ダウンロード',
        downloading: 'ダウンロード中',
        // @context Indicates that a file is currently being uploaded (sent to the server), not downloaded.
        uploading: 'アップロード中',
        // @context as a verb, not a noun
        pin: 'ピン留め',
        unPin: 'ピン留めを解除',
        back: '戻る',
        saveAndContinue: '保存して続行',
        settings: '設定',
        termsOfService: '利用規約',
        members: 'メンバー',
        invite: '招待',
        here: 'ここ',
        date: '日付',
        dob: '生年月日',
        currentYear: '今年',
        currentMonth: '今月',
        ssnLast4: 'SSNの下4桁',
        ssnFull9: 'SSN の9桁すべて',
        addressLine: ({lineNumber}: AddressLineParams) => `住所行 ${lineNumber}`,
        personalAddress: '自宅住所',
        companyAddress: '会社住所',
        noPO: '私書箱や私設郵便受けの住所は使用しないでください。',
        city: '市',
        state: '状態',
        streetAddress: '番地・丁目',
        stateOrProvince: '州 / 省',
        country: '国',
        zip: '郵便番号',
        zipPostCode: '郵便番号',
        whatThis: 'これは何ですか？',
        iAcceptThe: '私はこれを承諾します',
        acceptTermsAndPrivacy: `<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify 利用規約</a>および<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>に同意します`,
        acceptTermsAndConditions: `<a href="${CONST.OLD_DOT_PUBLIC_URLS.ACH_TERMS_URL}">利用規約</a>に同意します`,
        acceptTermsOfService: `<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">Expensify 利用規約</a> に同意します`,
        remove: '削除',
        admin: '管理者',
        owner: 'オーナー',
        dateFormat: 'YYYY-MM-DD',
        send: '送信',
        na: '該当なし',
        noResultsFound: '結果が見つかりません',
        noResultsFoundMatching: (searchString: string) => `"${searchString}" に一致する結果が見つかりません`,
        recentDestinations: '最近の宛先',
        timePrefix: 'これは',
        conjunctionFor: '用',
        todayAt: '今日',
        tomorrowAt: '明日の',
        yesterdayAt: '昨日 at',
        conjunctionAt: 'で',
        conjunctionTo: '宛先',
        genericErrorMessage: 'おっと……問題が発生し、リクエストを完了できませんでした。しばらくしてからもう一度お試しください。',
        percentage: '割合',
        error: {
            invalidAmount: '金額が無効です',
            acceptTerms: '続行するには利用規約に同意する必要があります',
            phoneNumber: `完全な電話番号を入力してください
（例：${CONST.FORMATTED_EXAMPLE_PHONE_NUMBER}）`,
            fieldRequired: 'この項目は必須です',
            requestModified: 'このリクエストは別のメンバーによって変更されています',
            characterLimitExceedCounter: ({length, limit}: CharacterLengthLimitParams) => `文字数制限を超えました（${length}/${limit}）`,
            dateInvalid: '有効な日付を選択してください',
            invalidDateShouldBeFuture: '本日または将来の日付を選択してください',
            invalidTimeShouldBeFuture: '少なくとも1分先の時刻を選択してください',
            invalidCharacter: '無効な文字',
            enterMerchant: '店舗名を入力',
            enterAmount: '金額を入力',
            missingMerchantName: '加盟店名が未入力です',
            missingAmount: '金額が未入力',
            missingDate: '日付が未入力',
            enterDate: '日付を入力',
            invalidTimeRange: '12時間表記で時刻を入力してください（例：2:30 PM）',
            pleaseCompleteForm: '続行するには上記のフォームに入力してください',
            pleaseSelectOne: '上からオプションを選択してください',
            invalidRateError: '有効なレートを入力してください',
            lowRateError: 'レートは0より大きい値でなければなりません',
            email: '有効なメールアドレスを入力してください',
            login: 'ログイン中にエラーが発生しました。もう一度お試しください。',
        },
        comma: 'コンマ',
        semicolon: 'セミコロン',
        please: 'お願いします',
        // @context Call-to-action encouraging the user to reach out to support or the team. Should follow UI capitalization conventions.
        contactUs: 'お問い合わせ',
        pleaseEnterEmailOrPhoneNumber: 'メールアドレスまたは電話番号を入力してください',
        // @context Instruction prompting the user to correct multiple issues. Should use imperative form when translated.
        fixTheErrors: 'エラーを修正してください',
        inTheFormBeforeContinuing: '続行する前にフォーム内に入力してください',
        confirm: '確認',
        reset: 'リセット',
        // @context Status or button indicating that an action or process has been completed. Should reflect completion.
        done: '完了',
        more: 'その他',
        debitCard: 'デビットカード',
        bankAccount: '銀行口座',
        personalBankAccount: '個人銀行口座',
        businessBankAccount: 'ビジネス銀行口座',
        join: '参加',
        leave: '退出',
        decline: '拒否',
        reject: '却下',
        transferBalance: '残高を振替',
        // @context Instruction telling the user to input data manually. Refers to entering text or values in a field.
        enterManually: '手動で入力してください',
        message: 'メッセージ',
        leaveThread: 'スレッドを離れる',
        you: 'あなた',
        // @context Refers to the current user in the UI. Should follow capitalization rules for labels/pronouns in the target language.
        me: '自分',
        youAfterPreposition: 'あなた',
        your: 'あなたの',
        conciergeHelp: '助けが必要な場合は、Concierge までお問い合わせください。',
        youAppearToBeOffline: 'オフラインのようです。',
        thisFeatureRequiresInternet: 'この機能を利用するには、インターネットに接続している必要があります。',
        attachmentWillBeAvailableOnceBackOnline: 'オンラインに戻ると、添付ファイルを利用できるようになります。',
        errorOccurredWhileTryingToPlayVideo: 'この動画の再生中にエラーが発生しました。',
        areYouSure: '本当に実行してもよろしいですか？',
        verify: '確認',
        yesContinue: 'はい、続けてください',
        // @context Provides an example format for a website URL.
        websiteExample: '例: https://www.expensify.com',
        // @context Provides an example format for a ZIP/postal code.
        zipCodeExampleFormat: ({zipSampleFormat}: ZipCodeExampleFormatParams) => (zipSampleFormat ? `例: ${zipSampleFormat}` : ''),
        description: '説明',
        title: 'タイトル',
        assignee: '担当者',
        createdBy: '作成者',
        with: 'と',
        shareCode: 'コードを共有',
        share: '共有',
        per: 'あたり',
        // @context Unit label for “mile.” Should be treated as a measurement unit and may require capitalization depending on locale conventions.
        mi: 'マイル',
        km: 'キロメートル',
        copied: 'コピーしました！',
        someone: '誰か',
        total: '合計',
        edit: '編集',
        letsDoThis: `さあ、始めましょう！`,
        letsStart: `始めましょう`,
        showMore: 'さらに表示',
        showLess: '表示を減らす',
        merchant: '加盟店',
        category: 'カテゴリ',
        report: 'レポート',
        billable: '請求可能',
        nonBillable: '請求対象外',
        tag: 'タグ',
        receipt: 'レシート',
        verified: '認証済み',
        replace: '置換',
        distance: '距離',
        mile: 'マイル',
        // @context Plural measurement unit for “mile.” Maintain consistent capitalization with the singular form.
        miles: 'マイル',
        kilometer: 'キロメートル',
        kilometers: 'キロメートル',
        recent: '最近',
        all: 'すべて',
        am: '午前',
        pm: '午後',
        // @context Acronym meaning “To Be Determined.” Should be translated or localized according to the target language's convention.
        tbd: '未定',
        selectCurrency: '通貨を選択',
        selectSymbolOrCurrency: '記号または通貨を選択',
        card: 'カード',
        whyDoWeAskForThis: 'なぜこの情報が必要なのですか？',
        required: '必須',
        showing: '表示中',
        of: 'の',
        default: 'デフォルト',
        update: '更新',
        member: 'メンバー',
        auditor: '監査人',
        role: '役割',
        currency: '通貨',
        groupCurrency: 'グループ通貨',
        rate: 'レート',
        emptyLHN: {
            title: 'やった！すべて完了しました。',
            subtitleText1: '検索を使用してチャットを見つける',
            subtitleText2: '上のボタンを使用するか、次を使って何かを作成してください',
            subtitleText3: '下のボタン',
        },
        businessName: '会社名',
        clear: 'クリア',
        type: 'タイプ',
        reportName: 'レポート名',
        action: 'アクション',
        expenses: '経費',
        totalSpend: '合計支出',
        tax: '税',
        shared: '共有済み',
        drafts: '下書き',
        // @context as a noun, not a verb
        draft: '下書き',
        finished: '完了',
        upgrade: 'アップグレード',
        downgradeWorkspace: 'ワークスペースをダウングレード',
        companyID: '会社ID',
        userID: 'ユーザーID',
        disable: '無効にする',
        export: 'エクスポート',
        initialValue: '初期値',
        // @context UI field indicating the current system date (e.g., “today’s date”). Not a label for selecting a date.
        currentDate: '現在の日付',
        value: '値',
        downloadFailedTitle: 'ダウンロードに失敗しました',
        downloadFailedDescription: 'ダウンロードを完了できませんでした。後でもう一度お試しください。',
        filterLogs: 'ログをフィルター',
        network: 'ネットワーク',
        reportID: 'レポート ID',
        longID: '長いID',
        withdrawalID: '出金ID',
        bankAccounts: '銀行口座',
        chooseFile: 'ファイルを選択',
        chooseFiles: 'ファイルを選択',
        // @context Instruction for drag-and-drop upload area. Refers to dropping a file onto a designated zone, not “dropping” in a casual sense.
        dropTitle: 'ここにドロップ',
        // @context Instruction for dropping one or more files into an upload area.
        dropMessage: 'ここにファイルをドロップしてください',
        ignore: '無視',
        enabled: '有効',
        disabled: '無効',
        // @context Action button for importing a file or data. Should use the verb form, not the noun form.
        import: 'インポート',
        offlinePrompt: '現在、この操作を行うことはできません。',
        // @context meaning "remaining to be paid, done, or dealt with", not "exceptionally good"
        outstanding: '未払い',
        chats: 'チャット',
        tasks: 'タスク',
        unread: '未読',
        sent: '送信済み',
        links: 'リンク',
        // @context Used in date or calendar contexts to refer to a calendar day, not a duration (“daytime”).
        day: '日',
        days: '日',
        rename: '名前を変更',
        address: '住所',
        hourAbbreviation: 'h',
        minuteAbbreviation: 'm',
        skip: 'スキップ',
        chatWithAccountManager: ({accountManagerDisplayName}: ChatWithAccountManagerParams) =>
            `何か特別なご要望がありますか？アカウントマネージャーの ${accountManagerDisplayName} とチャットしましょう。`,
        chatNow: '今すぐチャット',
        workEmail: '勤務先メール',
        destination: '宛先',
        // @context Refers to a secondary or subordinate rate (e.g., mileage reimbursement). Should be localized consistently across accounting contexts.
        subrate: '副レート',
        perDiem: '日当',
        validate: '検証',
        downloadAsPDF: 'PDFとしてダウンロード',
        downloadAsCSV: 'CSVとしてダウンロード',
        help: 'ヘルプ',
        expenseReport: '経費レポート',
        expenseReports: '経費精算書',
        // @context Rate as a noun, not a verb
        rateOutOfPolicy: 'ポリシー外のレート',
        leaveWorkspace: 'ワークスペースを退出',
        leaveWorkspaceConfirmation: 'このワークスペースを離れると、このワークスペースに経費を提出できなくなります。',
        leaveWorkspaceConfirmationAuditor: 'このワークスペースを退出すると、そのレポートや設定を表示できなくなります。',
        leaveWorkspaceConfirmationAdmin: 'このワークスペースを離れると、その設定を管理できなくなります。',
        leaveWorkspaceConfirmationApprover: ({workspaceOwner}: {workspaceOwner: string}) =>
            `このワークスペースを退出すると、承認ワークフローでは、ワークスペースのオーナーである${workspaceOwner}があなたの代わりを務めます。`,
        leaveWorkspaceConfirmationExporter: ({workspaceOwner}: {workspaceOwner: string}) =>
            `このワークスペースを退出すると、あなたに代わって、このワークスペースのオーナーである ${workspaceOwner} が優先エクスポーターとして設定されます。`,
        leaveWorkspaceConfirmationTechContact: ({workspaceOwner}: {workspaceOwner: string}) =>
            `このワークスペースを退出すると、テクニカルコンタクトは、ワークスペースオーナーである${workspaceOwner}に交代します。`,
        leaveWorkspaceReimburser:
            'あなたはこのワークスペースの精算担当者であるため、退出できません。ワークスペース > 支払いの作成または追跡 で新しい精算担当者を設定してから、もう一度お試しください。',
        reimbursable: '払い戻し対象',
        editYourProfile: 'プロフィールを編集',
        comments: 'コメント',
        sharedIn: '共有済み',
        unreported: '未報告',
        explore: '探索',
        todo: 'やること',
        invoice: '請求書',
        expense: '経費',
        chat: 'チャット',
        task: 'タスク',
        trip: '出張',
        apply: '適用',
        status: 'ステータス',
        on: 'オン',
        before: '前',
        after: '後',
        reschedule: '予定を変更',
        general: '一般',
        workspacesTabTitle: 'ワークスペース',
        headsUp: '注意！',
        submitTo: '提出先',
        forwardTo: '転送先',
        merge: '統合',
        none: 'なし',
        unstableInternetConnection: 'インターネット接続が不安定です。ネットワークを確認して、もう一度お試しください。',
        enableGlobalReimbursements: 'グローバル払い戻しを有効にする',
        purchaseAmount: '購入金額',
        frequency: '頻度',
        link: 'リンク',
        pinned: 'ピン留め済み',
        read: '読む',
        copyToClipboard: 'クリップボードにコピー',
        thisIsTakingLongerThanExpected: '予想より時間がかかっています…',
        domains: 'ドメイン',
        actionRequired: '対応が必要',
    },
    supportalNoAccess: {
        title: 'そんなに急がないでください',
        descriptionWithCommand: ({
            command,
        }: {
            command?: string;
        } = {}) =>
            `サポートとしてログインしている間は、この操作を行う権限がありません（コマンド: ${command ?? ''}）。Success がこの操作を実行できるべきだと思われる場合は、Slack で会話を開始してください。`,
    },
    lockedAccount: {
        title: 'ロックされたアカウント',
        description: 'このアカウントはロックされているため、この操作を完了することはできません。次のステップについては concierge@expensify.com までご連絡ください。',
    },
    location: {
        useCurrent: '現在地を使用',
        notFound: '現在地を取得できませんでした。もう一度お試しいただくか、住所を手動で入力してください。',
        permissionDenied: 'お使いの端末で位置情報へのアクセスが拒否されているようです。',
        please: 'お願いします',
        allowPermission: '設定で位置情報へのアクセスを許可してください',
        tryAgain: 'そして、もう一度お試しください。',
    },
    contact: {
        importContacts: '連絡先をインポート',
        importContactsTitle: '連絡先をインポート',
        importContactsText: '携帯電話から連絡先をインポートして、お気に入りの相手にいつでもワンタップで連絡できるようにしましょう。',
        importContactsExplanation: 'あなたのお気に入りの人たちに、いつでもワンタップでアクセスできます。',
        importContactsNativeText: 'あと一歩です！連絡先をインポートする許可をください。',
    },
    anonymousReportFooter: {
        logoTagline: 'ディスカッションに参加する',
    },
    attachmentPicker: {
        cameraPermissionRequired: 'カメラアクセス',
        expensifyDoesNotHaveAccessToCamera: 'Expensify は、カメラへのアクセス権限がないと写真を撮影できません。設定をタップして権限を更新してください。',
        attachmentError: '添付ファイルエラー',
        errorWhileSelectingAttachment: '添付ファイルの選択中にエラーが発生しました。もう一度お試しください。',
        errorWhileSelectingCorruptedAttachment: '破損した添付ファイルを選択中にエラーが発生しました。別のファイルをお試しください。',
        takePhoto: '写真を撮る',
        chooseFromGallery: 'ギャラリーから選択',
        chooseDocument: 'ファイルを選択',
        attachmentTooLarge: '添付ファイルが大きすぎます',
        sizeExceeded: '添付ファイルのサイズが 24 MB の上限を超えています',
        sizeExceededWithLimit: ({maxUploadSizeInMB}: SizeExceededParams) => `添付ファイルのサイズが ${maxUploadSizeInMB}MB の上限を超えています`,
        attachmentTooSmall: '添付ファイルが小さすぎます',
        sizeNotMet: '添付ファイルのサイズは240バイトより大きくする必要があります',
        wrongFileType: '無効なファイル形式',
        notAllowedExtension: 'このファイル形式は使用できません。別のファイル形式をお試しください。',
        folderNotAllowedMessage: 'フォルダーのアップロードは許可されていません。別のファイルをお試しください。',
        protectedPDFNotSupported: 'パスワード保護されたPDFはサポートされていません',
        attachmentImageResized: 'この画像はプレビュー用にサイズが変更されています。フル解像度で表示するにはダウンロードしてください。',
        attachmentImageTooLarge: 'この画像は大きすぎて、アップロード前にプレビューできません。',
        tooManyFiles: ({fileLimit}: FileLimitParams) => `一度にアップロードできるファイルは最大 ${fileLimit} 件までです。`,
        sizeExceededWithValue: ({maxUploadSizeInMB}: SizeExceededParams) => `ファイルが${maxUploadSizeInMB} MBを超えています。もう一度お試しください。`,
        someFilesCantBeUploaded: '一部のファイルはアップロードできません',
        sizeLimitExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `ファイルは ${maxUploadSizeInMB} MB 未満である必要があります。これより大きいファイルはアップロードされません。`,
        maxFileLimitExceeded: '一度に最大30枚のレシートをアップロードできます。それを超える分はアップロードされません。',
        unsupportedFileType: ({fileType}: FileTypeParams) => `${fileType} ファイルはサポートされていません。サポートされているファイルタイプのみアップロードされます。`,
        learnMoreAboutSupportedFiles: 'サポートされている形式の詳細を見る',
        passwordProtected: 'パスワードで保護されたPDFはサポートされていません。サポートされているファイルのみアップロードされます。',
    },
    dropzone: {
        addAttachments: '添付ファイルを追加',
        addReceipt: '領収書を追加',
        scanReceipts: '領収書をスキャン',
        replaceReceipt: '領収書を差し替え',
    },
    filePicker: {
        fileError: 'ファイルエラー',
        errorWhileSelectingFile: 'ファイルを選択中にエラーが発生しました。もう一度お試しください。',
    },
    connectionComplete: {
        title: '接続が完了しました',
        supportingText: 'このウィンドウを閉じて、Expensify アプリに戻ってください。',
    },
    avatarCropModal: {
        title: '写真を編集',
        description: '画像を自由にドラッグ、ズーム、回転できます。',
    },
    composer: {
        noExtensionFoundForMimeType: '指定されたMIMEタイプの拡張子が見つかりません',
        problemGettingImageYouPasted: '貼り付けた画像を取得する際に問題が発生しました',
        commentExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `コメントの最大文字数は${formattedMaxLength}文字です。`,
        taskTitleExceededMaxLength: ({formattedMaxLength}: FormattedMaxLengthParams) => `タスクタイトルの最大文字数は${formattedMaxLength}文字です。`,
    },
    baseUpdateAppModal: {
        updateApp: 'アプリを更新',
        updatePrompt: 'このアプリの新しいバージョンが利用可能です。\n今すぐアップデートするか、後でアプリを再起動して最新の変更をダウンロードしてください。',
    },
    deeplinkWrapper: {
        launching: 'Expensify を起動中',
        expired: 'セッションの有効期限が切れました。',
        signIn: '再度サインインしてください。',
        redirectedToDesktopApp: 'デスクトップアプリにリダイレクトしました。',
        youCanAlso: 'また、行うこともできます',
        openLinkInBrowser: 'このリンクをブラウザで開いてください',
        loggedInAs: ({email}: LoggedInAsParams) =>
            `${email} としてログインしています。このアカウントでデスクトップアプリにログインするには、メッセージ内の「Open link」をクリックしてください。`,
        doNotSeePrompt: 'プロンプトが表示されませんか？',
        tryAgain: '再試行',
        or: '、または',
        continueInWeb: 'Webアプリに進む',
    },
    validateCodeModal: {
        successfulSignInTitle: dedent(`
            アブラカダブラ、
            サインインが完了しました！
        `),
        successfulSignInDescription: '続行するには元のタブに戻ってください。',
        title: 'あなたのマジックコードはこちらです',
        description: dedent(`
            元のデバイスで表示されたコードを
            入力してください
        `),
        doNotShare: dedent(`
            コードを誰とも共有しないでください。
            Expensify がそれを求めることは決してありません！
        `),
        or: '、または',
        signInHere: 'ここからサインインするだけです',
        expiredCodeTitle: 'マジックコードの有効期限が切れました',
        expiredCodeDescription: '元のデバイスに戻って、新しいコードをリクエストしてください',
        successfulNewCodeRequest: 'コードが要求されました。デバイスを確認してください。',
        tfaRequiredTitle: dedent(`
            2 要素認証  
            必須
        `),
        tfaRequiredDescription: dedent(`
            2 要素認証コードを、サインインしようとしている端末で入力してください。
        `),
        requestOneHere: 'ここで1件リクエストしてください。',
    },
    moneyRequestConfirmationList: {
        paidBy: '支払者',
        whatsItFor: 'これは何のためのものですか？',
    },
    selectionList: {
        nameEmailOrPhoneNumber: '名前、メールアドレス、または電話番号',
        findMember: 'メンバーを検索',
        searchForSomeone: 'ユーザーを検索',
    },
    customApprovalWorkflow: {
        title: 'カスタム承認ワークフロー',
        description: 'このワークスペースでは、御社はカスタム承認ワークフローを利用しています。Expensify Classic でこの操作を行ってください',
        goToExpensifyClassic: 'Expensify Classic に切り替える',
    },
    emptyList: {
        [CONST.IOU.TYPE.CREATE]: {
            title: '経費を提出して、チームに紹介しましょう',
            subtitleText: 'あなたのチームにもExpensifyを使ってほしいですか？その人たち宛てに経費を提出するだけで、あとは私たちにお任せください。',
        },
    },
    videoChatButtonAndMenu: {
        tooltip: '通話を予約',
    },
    hello: 'こんにちは',
    phoneCountryCode: '1',
    welcomeText: {
        getStarted: '以下から開始してください。',
        anotherLoginPageIsOpen: '別のログインページが開いています。',
        anotherLoginPageIsOpenExplanation: 'ログインページが別のタブで開かれています。そのタブからログインしてください。',
        welcome: 'ようこそ！',
        welcomeWithoutExclamation: 'ようこそ',
        phrase2: 'お金がすべてを物語ります。チャットと支払いがひとつの場所にまとまった今、操作もかんたんです。',
        phrase3: 'あなたが言いたいことを伝えるのと同じくらいの速さで、支払いもあなたの元に届きます。',
        enterPassword: 'パスワードを入力してください',
        welcomeNewFace: ({login}: SignUpNewFaceCodeParams) => `${login} さん、ここで新しい顔をお見かけできて、とてもうれしいです！`,
        welcomeEnterMagicCode: ({login}: WelcomeEnterMagicCodeParams) => `${login} に送信されたマジックコードを入力してください。1～2分以内に届きます。`,
    },
    login: {
        hero: {
            header: 'チャットのスピードで進む出張と経費管理',
            body: 'コンテキストに応じたリアルタイムチャットの力で、出張と経費処理がよりスピーディーになる次世代の Expensify へようこそ。',
        },
    },
    thirdPartySignIn: {
        alreadySignedIn: ({email}: AlreadySignedInParams) => `すでに ${email} としてサインインしています。`,
        goBackMessage: ({provider}: GoBackMessageParams) => `${provider}でサインインしたくありませんか？`,
        continueWithMyCurrentSession: '現在のセッションを続行',
        redirectToDesktopMessage: 'サインインが完了すると、デスクトップアプリにリダイレクトします。',
    },
    samlSignIn: {
        welcomeSAMLEnabled: 'シングルサインオンでのログインを続行:',
        orContinueWithMagicCode: 'マジックコードを使用してサインインすることもできます',
        useSingleSignOn: 'シングルサインオンを使用',
        useMagicCode: 'マジックコードを使用',
        launching: '起動中...',
        oneMoment: 'お客様の会社のシングルサインオンポータルへリダイレクトしています。しばらくお待ちください。',
    },
    reportActionCompose: {
        dropToUpload: 'アップロードするにはここにドロップ',
        sendAttachment: '添付ファイルを送信',
        addAttachment: '添付ファイルを追加',
        writeSomething: '何か書いてください…',
        blockedFromConcierge: 'コミュニケーションは禁止されています',
        fileUploadFailed: 'アップロードに失敗しました。ファイルはサポートされていません。',
        localTime: ({user, time}: LocalTimeParams) => `${user}の${time}です`,
        edited: '（編集済み）',
        emoji: '絵文字',
        collapse: '折りたたむ',
        expand: '展開',
    },
    reportActionContextMenu: {
        copyMessage: 'メッセージをコピー',
        copied: 'コピーしました！',
        copyLink: 'リンクをコピー',
        copyURLToClipboard: 'URLをクリップボードにコピー',
        copyEmailToClipboard: 'メールをクリップボードにコピー',
        markAsUnread: '未読にする',
        markAsRead: '既読にする',
        editAction: ({action}: EditActionParams) => `${action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU ? '経費' : 'コメント'} を編集`,
        deleteAction: ({action}: DeleteActionParams) => {
            let type = 'コメント';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `${type}を削除`;
        },
        deleteConfirmation: ({action}: DeleteConfirmationParams) => {
            let type = 'コメント';
            if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.IOU) {
                type = 'expense';
            } else if (action?.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
                type = 'report';
            }
            return `この${type}を削除してもよろしいですか？`;
        },
        onlyVisible: '次のユーザーにのみ表示',
        replyInThread: 'スレッドに返信',
        joinThread: 'スレッドに参加',
        leaveThread: 'スレッドを離れる',
        copyOnyxData: 'Onyxデータをコピー',
        flagAsOffensive: '不適切として報告',
        menu: 'メニュー',
    },
    emojiReactions: {
        addReactionTooltip: 'リアクションを追加',
        reactedWith: 'リアクションしました',
    },
    reportActionsView: {
        beginningOfArchivedRoom: ({reportName, reportDetailsLink}: BeginningOfArchivedRoomParams) =>
            `<strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> のパーティーを見逃しました。ここには何もありません。`,
        beginningOfChatHistoryDomainRoom: ({domainRoom}: BeginningOfChatHistoryDomainRoomParams) =>
            `このチャットは、<strong>${domainRoom}</strong> ドメイン上のすべての Expensify メンバーとのチャットです。同僚との会話、コツの共有、質問などに利用してください。`,
        beginningOfChatHistoryAdminRoom: ({workspaceName}: BeginningOfChatHistoryAdminRoomParams) =>
            `このチャットは<strong>${workspaceName}</strong>の管理者とのチャットです。ワークスペースの設定などについて話すために使用してください。`,
        beginningOfChatHistoryAnnounceRoom: ({workspaceName}: BeginningOfChatHistoryAnnounceRoomParams) =>
            `このチャットは<strong>${workspaceName}</strong>内の全員とのチャットです。最も重要な告知に使用してください。`,
        beginningOfChatHistoryUserRoom: ({reportName, reportDetailsLink}: BeginningOfChatHistoryUserRoomParams) =>
            `このチャットルームは、<strong><a class="no-style-link" href="${reportDetailsLink}">${reportName}</a></strong> に関するあらゆることを話し合うための場です。`,
        beginningOfChatHistoryInvoiceRoom: ({invoicePayer, invoiceReceiver}: BeginningOfChatHistoryInvoiceRoomParams) =>
            `このチャットは、<strong>${invoicePayer}</strong> と <strong>${invoiceReceiver}</strong> 間の請求書用です。請求書を送信するには、＋ボタンを使用してください。`,
        beginningOfChatHistory: 'このチャットの相手は',
        beginningOfChatHistoryPolicyExpenseChat: ({workspaceName, submitterDisplayName}: BeginningOfChatHistoryPolicyExpenseChatParams) =>
            `<strong>${submitterDisplayName}</strong> が <strong>${workspaceName}</strong> に経費を提出する場所です。+ ボタンを使用してください。`,
        beginningOfChatHistorySelfDM: 'ここはあなたの個人スペースです。メモ、タスク、下書き、リマインダーに使ってください。',
        beginningOfChatHistorySystemDM: 'ようこそ！設定を始めましょう。',
        chatWithAccountManager: 'ここでアカウントマネージャーとチャットする',
        sayHello: 'あいさつしましょう！',
        yourSpace: 'あなたのスペース',
        welcomeToRoom: ({roomName}: WelcomeToRoomParams) => `${roomName} へようこそ！`,
        usePlusButton: ({additionalText}: UsePlusButtonParams) => `+ ボタンを使用して経費を${additionalText}してください。`,
        askConcierge: '質問をして、24時間365日リアルタイムのサポートを受けましょう。',
        conciergeSupport: '24時間年中無休サポート',
        create: '作成',
        iouTypes: {
            pay: '支払う',
            split: '分割',
            submit: '送信',
            track: '追跡',
            invoice: '請求書',
        },
    },
    adminOnlyCanPost: 'このルームでメッセージを送信できるのは管理者のみです。',
    reportAction: {
        asCopilot: '〜のコパイロットとして',
    },
    mentionSuggestions: {
        hereAlternateText: 'この会話にいる全員に通知',
    },
    newMessages: '新しいメッセージ',
    latestMessages: '最新メッセージ',
    youHaveBeenBanned: '注意: このチャンネルでのチャットは禁止されています。',
    reportTypingIndicator: {
        isTyping: '入力中...',
        areTyping: '入力中…',
        multipleMembers: '複数メンバー',
    },
    reportArchiveReasons: {
        [CONST.REPORT.ARCHIVE_REASON.DEFAULT]: 'このチャットルームはアーカイブされました。',
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED]: ({displayName}: ReportArchiveReasonsClosedParams) =>
            `このチャットは、${displayName} がアカウントを閉鎖したため、これ以上アクティブではありません。`,
        [CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED]: ({displayName, oldDisplayName}: ReportArchiveReasonsMergedParams) =>
            `このチャットは、${oldDisplayName} がアカウントを ${displayName} と統合したため、すでに無効になっています。`,
        [CONST.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY]: ({displayName, policyName, shouldUseYou = false}: ReportArchiveReasonsRemovedFromPolicyParams) =>
            shouldUseYou
                ? `このチャットは、<strong>あなた</strong>がワークスペース「${policyName}」のメンバーではなくなったため、これ以上利用できません。`
                : `このチャットは、${displayName} さんが ${policyName} ワークスペースのメンバーではなくなったため、これ以上利用できません。`,
        [CONST.REPORT.ARCHIVE_REASON.POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `このチャットは、${policyName} がアクティブなワークスペースではなくなったため、もう使用できません。`,
        [CONST.REPORT.ARCHIVE_REASON.INVOICE_RECEIVER_POLICY_DELETED]: ({policyName}: ReportArchiveReasonsInvoiceReceiverPolicyDeletedParams) =>
            `このチャットは、${policyName} がアクティブなワークスペースではなくなったため、もう使用できません。`,
        [CONST.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED]: 'この予約はアーカイブされています。',
    },
    writeCapabilityPage: {
        label: '投稿できる人',
        writeCapability: {
            all: '全メンバー',
            admins: '管理者のみ',
        },
    },
    sidebarScreen: {
        buttonFind: '何かを検索…',
        buttonMySettings: 'マイ設定',
        fabNewChat: 'チャットを開始',
        fabNewChatExplained: 'チャットを開始（フローティングアクション）',
        fabScanReceiptExplained: 'レシートをスキャン',
        chatPinned: 'チャットをピン留めしました',
        draftedMessage: '作成済みメッセージ',
        listOfChatMessages: 'チャットメッセージ一覧',
        listOfChats: 'チャット一覧',
        saveTheWorld: '世界を救う',
        tooltip: 'ここから始めましょう！',
        redirectToExpensifyClassicModal: {
            title: '近日公開',
            description: 'お客様固有の設定に対応するために、New Expensify の細かな部分をもう少し調整しているところです。その間は、Expensify Classic をご利用ください。',
        },
    },
    allSettingsScreen: {
        subscription: 'サブスクリプション',
        domains: 'ドメイン',
    },
    tabSelector: {
        chat: 'チャット',
        room: '部屋',
        distance: '距離',
        manual: '手動',
        scan: 'スキャン',
        map: '地図',
    },
    spreadsheet: {
        upload: 'スプレッドシートをアップロード',
        import: 'スプレッドシートをインポート',
        dragAndDrop: '<muted-link>スプレッドシートをここにドラッグ＆ドロップするか、下からファイルを選択してください。対応形式：.csv、.txt、.xls、.xlsx。</muted-link>',
        dragAndDropMultiLevelTag: `<muted-link>ここにスプレッドシートをドラッグ＆ドロップするか、下からファイルを選択してください。サポートされているファイル形式の詳細は、<a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">こちら</a>をご覧ください。</muted-link>`,
        chooseSpreadsheet: '<muted-link>インポートするスプレッドシートファイルを選択してください。対応形式：.csv、.txt、.xls、.xlsx。</muted-link>',
        chooseSpreadsheetMultiLevelTag: `<muted-link>インポートするスプレッドシートファイルを選択してください。サポートされているファイル形式の<a href="${CONST.IMPORT_SPREADSHEET.MULTI_LEVEL_TAGS_ARTICLE_LINK}">詳細</a>をご確認ください。</muted-link>`,
        fileContainsHeader: 'ファイルには列ヘッダーが含まれています',
        column: ({name}: SpreadSheetColumnParams) => `列 ${name}`,
        fieldNotMapped: ({fieldName}: SpreadFieldNameParams) => `必須フィールド（「${fieldName}」）がマッピングされていません。確認して、もう一度お試しください。`,
        singleFieldMultipleColumns: ({fieldName}: SpreadFieldNameParams) => `おっと！1つのフィールド（「${fieldName}」）を複数の列にマッピングしています。確認して、もう一度お試しください。`,
        emptyMappedField: ({fieldName}: SpreadFieldNameParams) => `おっと！フィールド（「${fieldName}」）に 1 つ以上の空の値が含まれています。確認して、もう一度お試しください。`,
        importSuccessfulTitle: 'インポートが完了しました',
        importCategoriesSuccessfulDescription: ({categories}: SpreadCategoriesParams) =>
            categories > 1 ? `${categories} 個のカテゴリーが追加されました。` : '1 件のカテゴリーが追加されました。',
        importMembersSuccessfulDescription: ({added, updated}: ImportMembersSuccessfulDescriptionParams) => {
            if (!added && !updated) {
                return 'メンバーは追加または更新されていません。';
            }
            if (added && updated) {
                return `${added} 件のメンバー${added > 1 ? 's' : ''}を追加、${updated} 件のメンバー${updated > 1 ? 's' : ''}を更新しました。`;
            }
            if (updated) {
                return updated > 1 ? `${updated}名のメンバーが更新されました。` : '1人のメンバーが更新されました。';
            }
            return added > 1 ? `${added}名のメンバーが追加されました。` : 'メンバーが1人追加されました。';
        },
        importTagsSuccessfulDescription: ({tags}: ImportTagsSuccessfulDescriptionParams) => (tags > 1 ? `${tags} 個のタグが追加されました。` : 'タグが 1 件追加されました。'),
        importMultiLevelTagsSuccessfulDescription: 'マルチレベルタグが追加されました。',
        importPerDiemRatesSuccessfulDescription: ({rates}: ImportPerDiemRatesSuccessfulDescriptionParams) =>
            rates > 1 ? `${rates} 件の日当レートが追加されました。` : '1件の日当レートが追加されました。',
        importFailedTitle: 'インポートに失敗しました',
        importFailedDescription: 'すべての項目が正しく入力されていることを確認して、もう一度お試しください。問題が解決しない場合は、Concierge までお問い合わせください。',
        importDescription: '下のインポートされた各列の横にあるドロップダウンをクリックして、スプレッドシートからマッピングするフィールドを選択してください。',
        sizeNotMet: 'ファイルサイズは 0 バイトより大きくなければなりません',
        invalidFileMessage:
            'アップロードしたファイルは空であるか、無効なデータが含まれています。ファイルが正しい形式で必要な情報を含んでいることを確認してから、再度アップロードしてください。',
        importSpreadsheetLibraryError: 'スプレッドシートモジュールの読み込みに失敗しました。インターネット接続を確認して、もう一度お試しください。',
        importSpreadsheet: 'スプレッドシートをインポート',
        downloadCSV: 'CSV をダウンロード',
        importMemberConfirmation: () => ({
            one: `このアップロードの一部として追加される、新しいワークスペースメンバーの詳細を以下で確認してください。既存のメンバーには、ロール更新や招待メッセージは送信されません。`,
            other: (count: number) =>
                `このアップロードで追加される新しいワークスペースメンバー${count}名の詳細を、以下で確認してください。既存のメンバーには、ロールの更新や招待メッセージは送信されません。`,
        }),
    },
    receipt: {
        upload: '領収書をアップロード',
        uploadMultiple: '領収書をアップロード',
        desktopSubtitleSingle: `またはここにドラッグ＆ドロップしてください`,
        desktopSubtitleMultiple: `または、ここにドラッグ＆ドロップします`,
        alternativeMethodsTitle: '領収書を追加するその他の方法：',
        alternativeMethodsDownloadApp: ({downloadUrl}: {downloadUrl: string}) =>
            `<label-text><a href="${downloadUrl}">アプリをダウンロード</a>して携帯電話からスキャンしてください</label-text>`,
        alternativeMethodsForwardReceipts: ({email}: {email: string}) => `<label-text>領収書を <a href="mailto:${email}">${email}</a> に転送</label-text>`,
        alternativeMethodsAddPhoneNumber: ({phoneNumber, contactMethodsUrl}: {phoneNumber: string; contactMethodsUrl: string}) =>
            `<label-text><a href="${contactMethodsUrl}">番号を追加</a>して、領収書を${phoneNumber}にテキスト送信します</label-text>`,
        alternativeMethodsTextReceipts: ({phoneNumber}: {phoneNumber: string}) => `<label-text>${phoneNumber} にレシートをテキスト送信（米国の番号のみ）</label-text>`,
        takePhoto: '写真を撮る',
        cameraAccess: 'レシートの写真を撮影するには、カメラへのアクセスが必要です。',
        deniedCameraAccess: `カメラへのアクセスはまだ許可されていません。<a href="${CONST.DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL}">こちらの手順</a>に従ってください。`,
        cameraErrorTitle: 'カメラエラー',
        cameraErrorMessage: '写真の撮影中にエラーが発生しました。もう一度お試しください。',
        locationAccessTitle: '位置情報へのアクセスを許可',
        locationAccessMessage: '位置情報へのアクセスを許可すると、どこにいてもタイムゾーンと通貨を正確に保てます。',
        locationErrorTitle: '位置情報へのアクセスを許可',
        locationErrorMessage: '位置情報へのアクセスを許可すると、どこにいてもタイムゾーンと通貨を正確に保てます。',
        allowLocationFromSetting: `位置情報へのアクセスを許可すると、どこにいてもタイムゾーンと通貨を正確に保つことができます。デバイスの権限設定から、位置情報へのアクセスを許可してください。`,
        dropTitle: 'このままにする',
        dropMessage: 'ここにファイルをドロップしてください',
        flash: 'フラッシュ',
        multiScan: 'マルチスキャン',
        shutter: 'シャッター',
        gallery: 'ギャラリー',
        deleteReceipt: '領収書を削除',
        deleteConfirmation: 'このレシートを削除してもよろしいですか？',
        addReceipt: '領収書を追加',
        scanFailed: 'この領収書は、店舗名、日付、または金額のいずれかが欠けているため、スキャンできませんでした。',
    },
    quickAction: {
        scanReceipt: 'レシートをスキャン',
        recordDistance: '距離を追跡',
        requestMoney: '経費を作成',
        perDiem: '日当を作成',
        splitBill: '経費を分割',
        splitScan: 'レシートを分割',
        splitDistance: '距離の分割',
        paySomeone: ({name}: PaySomeoneParams = {}) => `${name ?? '誰か'} を支払う`,
        assignTask: 'タスクを割り当てる',
        header: 'クイックアクション',
        noLongerHaveReportAccess: '以前のクイックアクションの送信先には、もうアクセスできません。下から新しい送信先を選択してください。',
        updateDestination: '宛先を更新',
        createReport: 'レポートを作成',
    },
    iou: {
        amount: '金額',
        taxAmount: '税額',
        taxRate: '税率',
        approve: ({
            formattedAmount,
        }: {
            formattedAmount?: string;
        } = {}) => (formattedAmount ? `${formattedAmount} を承認` : '承認'),
        approved: '承認済み',
        cash: '現金',
        card: 'カード',
        original: 'オリジナル',
        split: '分割',
        splitExpense: '経費を分割',
        splitExpenseSubtitle: ({amount, merchant}: SplitExpenseSubtitleParams) => `${merchant} からの ${amount}`,
        addSplit: '分割を追加',
        makeSplitsEven: '分割を均等にする',
        editSplits: '分割を編集',
        totalAmountGreaterThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `合計金額は元の経費よりも${amount}多くなっています。`,
        totalAmountLessThanOriginal: ({amount}: TotalAmountGreaterOrLessThanOriginalParams) => `合計金額は元の経費より${amount}少なくなっています。`,
        splitExpenseZeroAmount: '続行する前に有効な金額を入力してください。',
        splitExpenseOneMoreSplit: '分割が追加されていません。保存するには少なくとも 1 つ追加してください。',
        splitExpenseEditTitle: ({amount, merchant}: SplitExpenseEditTitleParams) => `${merchant} の ${amount} を編集`,
        removeSplit: '分割を削除',
        splitExpenseCannotBeEditedModalTitle: 'この経費は編集できません',
        splitExpenseCannotBeEditedModalDescription: '承認済みまたは支払い済みの経費は編集できません',
        paySomeone: ({name}: PaySomeoneParams = {}) => `${name ?? '誰か'} を支払う`,
        expense: '経費',
        categorize: '分類',
        share: '共有',
        participants: '参加者',
        createExpense: '経費を作成',
        trackDistance: '距離を追跡',
        createExpenses: ({expensesNumber}: CreateExpensesParams) => `${expensesNumber}件の経費を作成`,
        removeExpense: '経費を削除',
        removeThisExpense: 'この経費を削除',
        removeExpenseConfirmation: 'この領収書を削除してもよろしいですか？この操作は元に戻せません。',
        addExpense: '経費を追加',
        chooseRecipient: '受取人を選択',
        createExpenseWithAmount: ({amount}: {amount: string}) => `${amount} の経費を作成`,
        confirmDetails: '詳細を確認',
        pay: '支払う',
        cancelPayment: '支払いをキャンセル',
        cancelPaymentConfirmation: 'この支払いをキャンセルしてもよろしいですか？',
        viewDetails: '詳細を表示',
        pending: '保留中',
        canceled: 'キャンセル済み',
        posted: '記帳済み',
        deleteReceipt: '領収書を削除',
        findExpense: '経費を検索',
        deletedTransaction: ({amount, merchant}: DeleteTransactionParams) => `経費を削除しました（${merchant} への ${amount}）`,
        movedFromReport: ({reportName}: MovedFromReportParams) => `経費${reportName ? `${reportName} から` : ''}を移動しました`,
        movedTransactionTo: ({reportUrl, reportName}: MovedTransactionParams) => `この経費を移動しました${reportName ? `<a href="${reportUrl}">${reportName}</a> へ` : ''}`,
        movedTransactionFrom: ({reportUrl, reportName}: MovedTransactionParams) => `この経費を移動しました${reportName ? `<a href="${reportUrl}">${reportName}</a> から` : ''}`,
        movedUnreportedTransaction: ({reportUrl}: MovedTransactionParams) => `この経費を<a href="${reportUrl}">個人スペース</a>から移動しました`,
        unreportedTransaction: ({reportUrl}: MovedTransactionParams) => `この経費をあなたの<a href="${reportUrl}">個人スペース</a>に移動しました`,
        movedAction: ({shouldHideMovedReportUrl, movedReportUrl, newParentReportUrl, toPolicyName}: MovedActionParams) => {
            if (shouldHideMovedReportUrl) {
                return `このレポートを<a href="${newParentReportUrl}">${toPolicyName}</a>ワークスペースに移動しました`;
            }
            return `この<a href="${movedReportUrl}">レポート</a>を<a href="${newParentReportUrl}">${toPolicyName}</a>ワークスペースに移動しました`;
        },
        pendingMatchWithCreditCard: 'カード取引との照合待ちの領収書',
        pendingMatch: '保留中の照合',
        pendingMatchWithCreditCardDescription: 'レシートがカード取引との照合待ちです。現金としてマークして取り消してください。',
        markAsCash: '現金としてマーク',
        routePending: 'ルート保留中…',
        receiptScanning: () => ({
            one: 'レシートをスキャンしています…',
            other: 'レシートをスキャン中...',
        }),
        scanMultipleReceipts: '複数のレシートをスキャン',
        scanMultipleReceiptsDescription: 'すべてのレシートを一度に撮影し、詳細を自分で確認するか、私たちにお任せください。',
        receiptScanInProgress: '領収書のスキャンを実行中',
        receiptScanInProgressDescription: 'レシートのスキャンを実行中です。後で確認するか、今すぐ詳細を入力してください。',
        removeFromReport: 'レポートから削除',
        moveToPersonalSpace: '経費をあなたの個人スペースに移動',
        duplicateTransaction: ({isSubmitted}: DuplicateTransactionParams) =>
            !isSubmitted
                ? '重複の可能性がある経費が見つかりました。申請を有効にするには、重複を確認してください。'
                : '重複の可能性がある経費が検出されました。承認を有効にするには重複を確認してください。',
        receiptIssuesFound: () => ({
            one: '問題が見つかりました',
            other: '検出された問題',
        }),
        fieldPending: '保留中…',
        defaultRate: 'デフォルトレート',
        receiptMissingDetails: '領収書の詳細が不足しています',
        missingAmount: '金額が未入力',
        missingMerchant: '支払先が未入力',
        receiptStatusTitle: 'スキャン中…',
        receiptStatusText: 'スキャン中のこのレシートを見られるのはあなただけです。後でまた確認するか、今すぐ詳細を入力してください。',
        receiptScanningFailed: 'レシートのスキャンに失敗しました。詳細を手動で入力してください。',
        transactionPendingDescription: '取引は保留中です。記帳されるまで数日かかる場合があります。',
        companyInfo: '会社情報',
        companyInfoDescription: '初めて請求書を送信する前に、いくつか詳細情報が必要です。',
        yourCompanyName: '貴社名',
        yourCompanyWebsite: '御社の企業サイト',
        yourCompanyWebsiteNote: 'ウェブサイトをお持ちでない場合は、代わりに会社のLinkedInまたはソーシャルメディアのプロフィールを入力できます。',
        invalidDomainError: '無効なドメインが入力されています。続行するには、有効なドメインを入力してください。',
        publicDomainError: 'パブリックドメインが入力されています。続行するには、プライベートドメインを入力してください。',
        // TODO: This key should be deprecated. More details: https://github.com/Expensify/App/pull/59653#discussion_r2028653252
        expenseCountWithStatus: ({scanningReceipts = 0, pendingReceipts = 0}: RequestCountParams) => {
            const statusText: string[] = [];
            if (scanningReceipts > 0) {
                statusText.push(`${scanningReceipts} 件をスキャン中`);
            }
            if (pendingReceipts > 0) {
                statusText.push(`保留中: ${pendingReceipts} 件`);
            }
            return {
                one: statusText.length > 0 ? `1件の経費（${statusText.join(', ')}）` : `1件の経費`,
                other: (count: number) => (statusText.length > 0 ? `${count} 件の経費 (${statusText.join(', ')})` : `${count}件の経費`),
            };
        },
        expenseCount: () => {
            return {
                one: '1件の経費',
                other: (count: number) => `${count}件の経費`,
            };
        },
        deleteExpense: () => ({
            one: '経費を削除',
            other: '経費を削除',
        }),
        deleteConfirmation: () => ({
            one: 'この経費を削除してもよろしいですか？',
            other: 'これらの経費を削除してもよろしいですか？',
        }),
        deleteReport: 'レポートを削除',
        deleteReportConfirmation: 'このレポートを削除してもよろしいですか？',
        settledExpensify: '支払い済み',
        done: '完了',
        settledElsewhere: '他で支払い済み',
        individual: '個人',
        business: 'ビジネス',
        settleExpensify: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `Expensify で ${formattedAmount} を支払う` : `Expensify で支払う`),
        settlePersonal: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `個人として ${formattedAmount} を支払う` : `個人アカウントで支払う`),
        settleWallet: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `ウォレットで${formattedAmount}を支払う` : `ウォレットで支払う`),
        settlePayment: ({formattedAmount}: SettleExpensifyCardParams) => `${formattedAmount} を支払う`,
        settleBusiness: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} をビジネスとして支払う` : `ビジネスアカウントで支払う`),
        payElsewhere: ({formattedAmount}: SettleExpensifyCardParams) => (formattedAmount ? `${formattedAmount} を支払い済みにする` : `支払い済みにする`),
        settleInvoicePersonal: ({amount, last4Digits}: BusinessBankAccountParams) => (amount ? `個人アカウント（末尾${last4Digits}）で${amount}を支払いました` : `個人口座で支払い済み`),
        settleInvoiceBusiness: ({amount, last4Digits}: BusinessBankAccountParams) =>
            amount ? `ビジネスアカウント ${last4Digits} で ${amount} を支払い済み` : `ビジネスアカウントで支払い済み`,
        payWithPolicy: ({
            formattedAmount,
            policyName,
        }: SettleExpensifyCardParams & {
            policyName: string;
        }) => (formattedAmount ? `${policyName}で${formattedAmount}を支払う` : `${policyName} 経由で支払う`),
        businessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            amount ? `銀行口座（末尾${last4Digits}）で${amount}を支払いました` : `銀行口座（末尾${last4Digits}）で支払済み`,
        automaticallyPaidWithBusinessBankAccount: ({amount, last4Digits}: BusinessBankAccountParams) =>
            `<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>経由で、口座番号下${last4Digits}の銀行口座から${amount ? `${amount} ` : ''}を支払いました`,
        invoicePersonalBank: ({lastFour}: BankAccountLastFourParams) => `個人アカウント • ${lastFour}`,
        invoiceBusinessBank: ({lastFour}: BankAccountLastFourParams) => `ビジネスアカウント • ${lastFour}`,
        nextStep: '次のステップ',
        finished: '完了',
        flip: '反転',
        sendInvoice: ({amount}: RequestAmountParams) => `${amount} 請求書を送信`,
        expenseAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `${comment}用` : ''}`,
        submitted: ({memo}: SubmittedWithMemoParams) => `提出済み${memo ? `、メモ「${memo}」と言って` : ''}`,
        automaticallySubmitted: `<a href="${CONST.SELECT_WORKFLOWS_HELP_URL}">提出を遅らせる</a>から送信済み`,
        trackedAmount: ({formattedAmount, comment}: RequestedAmountMessageParams) => `${formattedAmount}${comment ? `${comment}用` : ''} を追跡中`,
        splitAmount: ({amount}: SplitAmountParams) => `${amount} を分割`,
        didSplitAmount: ({formattedAmount, comment}: DidSplitAmountMessageParams) => `分割 ${formattedAmount}${comment ? `${comment}用` : ''}`,
        yourSplit: ({amount}: UserSplitParams) => `あなたの分担額 ${amount}`,
        payerOwesAmount: ({payer, amount, comment}: PayerOwesAmountParams) => `${payer} は ${amount}${comment ? `${comment}用` : ''} を支払う必要があります`,
        payerOwes: ({payer}: PayerOwesParams) => `${payer} の立替額:`,
        payerPaidAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer ? `${payer} ` : ''}が${amount}を支払いました`,
        payerPaid: ({payer}: PayerPaidParams) => `${payer} が支払いました:`,
        payerSpentAmount: ({payer, amount}: PayerPaidAmountParams) => `${payer} が ${amount} を支払いました`,
        payerSpent: ({payer}: PayerPaidParams) => `${payer} の支出:`,
        managerApproved: ({manager}: ManagerApprovedParams) => `${manager} が承認しました:`,
        managerApprovedAmount: ({manager, amount}: ManagerApprovedAmountParams) => `${manager} が ${amount} を承認しました`,
        payerSettled: ({amount}: PayerSettledParams) => `${amount} を支払済み`,
        payerSettledWithMissingBankAccount: ({amount}: PayerSettledParams) => `${amount} を支払いました。支払いを受け取るには銀行口座を追加してください。`,
        automaticallyApproved: `<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>で承認済み`,
        approvedAmount: ({amount}: ApprovedAmountParams) => `${amount} を承認しました`,
        approvedMessage: `承認済み`,
        unapproved: `未承認`,
        automaticallyForwarded: `<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>で承認済み`,
        forwarded: `承認済み`,
        rejectedThisReport: 'このレポートを却下しました',
        waitingOnBankAccount: ({submitterDisplayName}: WaitingOnBankAccountParams) => `支払いを開始しましたが、${submitterDisplayName} が銀行口座を追加するのを待っています。`,
        adminCanceledRequest: '支払いをキャンセルしました',
        canceledRequest: ({amount, submitterDisplayName}: CanceledRequestParams) =>
            `${submitterDisplayName} が30日以内に Expensify Wallet を有効化しなかったため、${amount} の支払いはキャンセルされました`,
        settledAfterAddedBankAccount: ({submitterDisplayName, amount}: SettledAfterAddedBankAccountParams) =>
            `${submitterDisplayName}が銀行口座を追加しました。${amount}の支払いが行われました。`,
        paidElsewhere: ({payer}: PaidElsewhereParams = {}) => `${payer ? `${payer} ` : ''}支払い済みにマークされました`,
        paidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) => `${payer ? `${payer} ` : ''}はウォレットで支払いました`,
        automaticallyPaidWithExpensify: ({payer}: PaidWithExpensifyParams = {}) =>
            `${payer ? `${payer} ` : ''}は、<a href="${CONST.CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL}">ワークスペースルール</a>を通じてExpensifyで支払われました`,
        noReimbursableExpenses: 'このレポートには無効な金額が含まれています',
        pendingConversionMessage: 'オンラインに戻ると合計が更新されます',
        changedTheExpense: '経費を変更しました',
        setTheRequest: ({valueName, newValueToDisplay}: SetTheRequestParams) => `${valueName} を ${newValueToDisplay} に`,
        setTheDistanceMerchant: ({translatedChangedField, newMerchant, newAmountToDisplay}: SetTheDistanceMerchantParams) =>
            `${translatedChangedField} を ${newMerchant} に設定すると、金額が ${newAmountToDisplay} に設定されました`,
        removedTheRequest: ({valueName, oldValueToDisplay}: RemovedTheRequestParams) => `${valueName}（以前は ${oldValueToDisplay}）`,
        updatedTheRequest: ({valueName, newValueToDisplay, oldValueToDisplay}: UpdatedTheRequestParams) => `${valueName} を ${newValueToDisplay} に変更（以前は ${oldValueToDisplay}）`,
        updatedTheDistanceMerchant: ({translatedChangedField, newMerchant, oldMerchant, newAmountToDisplay, oldAmountToDisplay}: UpdatedTheDistanceMerchantParams) =>
            `${translatedChangedField} を ${newMerchant}（以前は ${oldMerchant}）に変更し、金額が ${newAmountToDisplay}（以前は ${oldAmountToDisplay}）に更新されました`,
        basedOnAI: '過去のアクティビティに基づく',
        basedOnMCC: ({rulesLink}: {rulesLink: string}) => (rulesLink ? `<a href="${rulesLink}">ワークスペースルール</a>に基づく` : 'ワークスペースルールに基づく'),
        threadExpenseReportName: ({formattedAmount, comment}: ThreadRequestReportNameParams) => `${formattedAmount} ${comment ? `${comment} 用` : '経費'}`,
        invoiceReportName: ({linkedReportID}: OriginalMessage<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>) => `請求書レポート #${linkedReportID}`,
        threadPaySomeoneReportName: ({formattedAmount, comment}: ThreadSentMoneyReportNameParams) => `${formattedAmount} を送信しました${comment ? `${comment}用` : ''}`,
        movedFromPersonalSpace: ({workspaceName, reportName}: MovedFromPersonalSpaceParams) => `経費をパーソナルスペースから${workspaceName ?? `${reportName} とチャット`}に移動しました`,
        movedToPersonalSpace: '経費を個人スペースに移動しました',
        tagSelection: ({policyTagListName}: TagSelectionParams = {}) => {
            const article = policyTagListName && StringUtils.startsWithVowel(policyTagListName) ? '1つの' : 'a';
            const tag = policyTagListName ?? 'タグ';
            return `支出をより適切に整理するために、${article} ${tag} を選択してください。`;
        },
        categorySelection: '支出をより適切に整理するために、カテゴリを選択してください。',
        error: {
            invalidCategoryLength: 'カテゴリ名が255文字を超えています。短くするか、別のカテゴリを選択してください。',
            invalidTagLength: 'タグ名が255文字を超えています。短くするか、別のタグを選択してください。',
            invalidAmount: '続行する前に有効な金額を入力してください',
            invalidDistance: '続行する前に有効な距離を入力してください',
            invalidIntegerAmount: '続行する前にドルの整数金額を入力してください',
            invalidTaxAmount: ({amount}: RequestAmountParams) => `最大税額は${amount}です`,
            invalidSplit: '分割の合計は合計金額と一致している必要があります',
            invalidSplitParticipants: '少なくとも 2 人の参加者に対して、0 より大きい金額を入力してください',
            invalidSplitYourself: '分割の金額には 0 以外の数値を入力してください',
            noParticipantSelected: '参加者を選択してください',
            other: '予期しないエラーが発生しました。後でもう一度お試しください。',
            genericCreateFailureMessage: 'この経費の送信中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericCreateInvoiceFailureMessage: 'この請求書の送信中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericHoldExpenseFailureMessage: 'この経費を保留中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericUnholdExpenseFailureMessage: 'この経費の保留解除中に予期しないエラーが発生しました。後でもう一度お試しください。',
            receiptDeleteFailureError: 'この領収書の削除中に予期しないエラーが発生しました。後でもう一度お試しください。',
            receiptFailureMessage: '<rbr>レシートのアップロード中にエラーが発生しました。後で<a href="download">レシートを保存</a>して、<a href="retry">再試行</a>してください。</rbr>',
            receiptFailureMessageShort: '領収書のアップロード中にエラーが発生しました。',
            genericDeleteFailureMessage: 'この経費の削除中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericEditFailureMessage: 'この経費の編集中に予期しないエラーが発生しました。後でもう一度お試しください。',
            genericSmartscanFailureMessage: '取引に欠けている項目があります',
            duplicateWaypointsErrorMessage: '重複している経由地を削除してください',
            atLeastTwoDifferentWaypoints: '少なくとも 2 つの異なる住所を入力してください',
            splitExpenseMultipleParticipantsErrorMessage: '経費は、ワークスペースと他のメンバー間で分割することはできません。選択内容を更新してください。',
            invalidMerchant: '有効な支払先名を入力してください',
            atLeastOneAttendee: '少なくとも 1 人の出席者を選択する必要があります',
            invalidQuantity: '有効な数量を入力してください',
            quantityGreaterThanZero: '数量は0より大きくなければなりません',
            invalidSubrateLength: '少なくとも 1 つのサブラテが必要です',
            invalidRate: 'このワークスペースでは無効なレートです。ワークスペースで利用可能なレートを選択してください。',
        },
        dismissReceiptError: 'エラーを閉じる',
        dismissReceiptErrorConfirmation: '注意！このエラーを無視すると、アップロードしたレシートは完全に削除されます。本当に実行してよろしいですか？',
        waitingOnEnabledWallet: ({submitterDisplayName}: WaitingOnBankAccountParams) =>
            `清算を開始しました。${submitterDisplayName} がウォレットを有効にするまで、支払いは保留されています。`,
        enableWallet: 'ウォレットを有効化',
        hold: '保留',
        unhold: '保留を解除',
        holdExpense: () => ({
            one: '経費を保留',
            other: '経費を保留',
        }),
        unholdExpense: 'ホールド解除',
        heldExpense: 'この経費を保留しました',
        unheldExpense: 'この経費の保留を解除しました',
        moveUnreportedExpense: '未報告の経費を移動',
        addUnreportedExpense: '未報告の経費を追加',
        selectUnreportedExpense: 'レポートに追加する経費を少なくとも1件選択してください。',
        emptyStateUnreportedExpenseTitle: '未報告の経費はありません',
        emptyStateUnreportedExpenseSubtitle: '未報告の経費はないようです。下から作成してみてください。',
        addUnreportedExpenseConfirm: 'レポートに追加',
        newReport: '新しいレポート',
        explainHold: () => ({
            one: 'この経費を保留している理由を説明してください。',
            other: 'これらの経費を保留している理由を説明してください。',
        }),
        retracted: '撤回済み',
        retract: '撤回',
        reopened: '再開しました',
        reopenReport: 'レポートを再度開く',
        reopenExportedReportConfirmation: ({connectionName}: {connectionName: string}) =>
            `このレポートはすでに${connectionName}へエクスポートされています。変更するとデータの不整合が発生する可能性があります。このレポートを再度開いてもよろしいですか？`,
        reason: '理由',
        holdReasonRequired: '保留する場合は理由が必要です。',
        expenseWasPutOnHold: '経費が保留されました',
        expenseOnHold: 'この経費は保留になっています。次のステップについてはコメントを確認してください。',
        expensesOnHold: 'すべての経費が保留されました。次のステップについてはコメントを確認してください。',
        expenseDuplicate: 'この経費は、別の経費と詳細がよく似ています。続行するには重複項目を確認してください。',
        someDuplicatesArePaid: 'これらの重複の一部は、すでに承認または支払い済みです。',
        reviewDuplicates: '重複を確認',
        keepAll: 'すべて残す',
        confirmApprove: '承認金額を確認',
        confirmApprovalAmount: '準拠している経費のみを承認するか、レポート全体を承認してください。',
        confirmApprovalAllHoldAmount: () => ({
            one: 'この経費は保留中です。それでも承認しますか？',
            other: 'これらの経費は保留中です。それでも承認しますか？',
        }),
        confirmPay: '支払金額の確認',
        confirmPayAmount: '保留されていない分だけ支払うか、レポート全体を支払ってください。',
        confirmPayAllHoldAmount: () => ({
            one: 'この経費は保留中です。それでも支払いますか？',
            other: 'これらの経費は保留中です。それでも支払いますか？',
        }),
        payOnly: '支払いのみ',
        approveOnly: '承認のみ',
        holdEducationalTitle: 'この経費を保留しますか？',
        whatIsHoldExplain: '保留とは、提出する準備ができるまで経費を「一時停止」するようなものです。',
        holdIsLeftBehind: '保留中の経費は、レポート全体を提出しても残されたままになります。',
        unholdWhenReady: '提出の準備ができたら、保留中の経費を解除しましょう。',
        changePolicyEducational: {
            title: 'このレポートを移動しました！',
            description: 'レポートを新しいワークスペースに移動すると変更されやすい、次の項目を再確認してください。',
            reCategorize: '<strong>ワークスペースのルールに従うように、すべての経費のカテゴリーを再設定してください</strong>',
            workflows: 'このレポートには、現在は別の<strong>承認ワークフロー</strong>が適用される場合があります。',
        },
        changeWorkspace: 'ワークスペースを変更',
        set: '設定',
        changed: '変更済み',
        removed: '削除済み',
        transactionPending: '取引は保留中です。',
        chooseARate: 'ワークスペースの払い戻しレートを、1マイルまたは1キロメートルあたりで選択してください',
        unapprove: '承認を取り消す',
        unapproveReport: 'レポートの承認を取り消す',
        headsUp: '注意！',
        unapproveWithIntegrationWarning: ({accountingIntegration}: UnapproveWithIntegrationWarningParams) =>
            `このレポートは既に ${accountingIntegration} にエクスポートされています。変更するとデータの不整合が発生する可能性があります。本当にこのレポートの承認を取り消しますか？`,
        reimbursable: '精算対象',
        nonReimbursable: '非精算',
        bookingPending: 'この予約は保留中です',
        bookingPendingDescription: 'この予約はまだ支払われていないため、保留中です。',
        bookingArchived: 'この予約はアーカイブされています',
        bookingArchivedDescription: 'この予約は、旅行日が過ぎたためアーカイブされています。必要に応じて、最終金額の経費を追加してください。',
        attendees: '出席者',
        whoIsYourAccountant: 'あなたの会計士は誰ですか？',
        paymentComplete: '支払いが完了しました',
        time: '時間',
        startDate: '開始日',
        endDate: '終了日',
        startTime: '開始時刻',
        endTime: '終了時刻',
        deleteSubrate: 'サブレートを削除',
        deleteSubrateConfirmation: 'このサブラテを削除してもよろしいですか？',
        quantity: '数量',
        subrateSelection: 'サブレートを選択し、数量を入力してください。',
        qty: '数量',
        firstDayText: () => ({
            one: `初日：1時間`,
            other: (count: number) => `初日：${count.toFixed(2)}時間`,
        }),
        lastDayText: () => ({
            one: `最終日：1時間`,
            other: (count: number) => `前日：${count.toFixed(2)}時間`,
        }),
        tripLengthText: () => ({
            one: `旅行: 1日間全日`,
            other: (count: number) => `出張：${count}日間`,
        }),
        dates: '日付',
        rates: 'レート',
        submitsTo: ({name}: SubmitsToParams) => `${name} に提出`,
        reject: {
            educationalTitle: '保留するべきか、却下するべきか？',
            educationalText: '経費を承認または支払う準備ができていない場合は、保留または却下することができます。',
            holdExpenseTitle: '承認や支払いの前に、詳細を確認するため経費を保留します。',
            approveExpenseTitle: '保留中の経費はあなたに割り当てられたままにしつつ、他の経費を承認します。',
            heldExpenseLeftBehindTitle: 'レポート全体を承認しても、保留中の経費はそのまま残ります。',
            rejectExpenseTitle: '承認または支払う予定のない経費を却下します。',
            reasonPageTitle: '経費を却下',
            reasonPageDescription: 'この経費を却下する理由を説明してください。',
            rejectReason: '却下理由',
            markAsResolved: '解決済みにする',
            rejectedStatus: 'この経費は却下されました。問題を修正し、解決済みにマークしてから提出できるようにしてください。',
            reportActions: {
                rejectedExpense: 'この経費を却下しました',
                markedAsResolved: '却下理由を解決済みとしてマークしました',
            },
        },
        moveExpenses: () => ({one: '経費を移動', other: '経費を移動'}),
        changeApprover: {
            title: '承認者を変更',
            subtitle: 'このレポートの承認者を変更する方法を選択してください。',
            description: ({workflowSettingLink}: WorkflowSettingsParam) =>
                `<a href="${workflowSettingLink}">ワークフロー設定</a>で、すべてのレポートの承認者を今後常に変更することもできます。`,
            changedApproverMessage: ({managerID}: ChangedApproverMessageParams) => `承認者を <mention-user accountID="${managerID}"/> に変更しました`,
            actions: {
                addApprover: '承認者を追加',
                addApproverSubtitle: '既存のワークフローに承認者を追加します。',
                bypassApprovers: '承認者をバイパス',
                bypassApproversSubtitle: '自分を最終承認者として割り当て、残りの承認者をすべてスキップする',
            },
            addApprover: {
                subtitle: 'このレポートを残りの承認ワークフローに回す前に、追加の承認者を選択してください。',
            },
        },
        chooseWorkspace: 'ワークスペースを選択',
    },
    transactionMerge: {
        listPage: {
            header: '経費をマージ',
            noEligibleExpenseFound: '対象となる経費が見つかりません',
            noEligibleExpenseFoundSubtitle: `<muted-text><centered-text>この経費と統合できる経費はありません。対象となる経費の詳細は、<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">こちら</a>をご確認ください。</centered-text></muted-text>`,
            selectTransactionToMerge: ({reportName}: {reportName: string}) =>
                `<a href="${CONST.HELP_DOC_LINKS.MERGE_EXPENSES}">対象経費</a>を選択し、<strong>${reportName}</strong>と統合してください。`,
        },
        receiptPage: {
            header: '領収書を選択',
            pageTitle: '保持したい領収書を選択してください：',
        },
        detailsPage: {
            header: '詳細を選択',
            pageTitle: '保持したい詳細を選択してください:',
            noDifferences: '取引間に差異は見つかりませんでした',
            pleaseSelectError: ({field}: {field: string}) => {
                const article = StringUtils.startsWithVowel(field) ? '1つの' : 'a';
                return `${article} ${field} を選択してください`;
            },
            pleaseSelectAttendees: '出席者を選択してください',
            selectAllDetailsError: '続行する前に、すべての詳細を選択してください。',
        },
        confirmationPage: {
            header: '詳細を確認',
            pageTitle: '保持する詳細を確認してください。保持しない詳細は削除されます。',
            confirmButton: '経費をマージ',
        },
    },
    share: {
        shareToExpensify: 'Expensify に共有',
        messageInputLabel: 'メッセージ',
    },
    notificationPreferencesPage: {
        header: '通知設定',
        label: '新しいメッセージについて通知する',
        notificationPreferences: {
            always: '今すぐ',
            daily: '毎日',
            mute: 'ミュート',
            // @context UI label indicating that something is concealed or not visible to the user.
            hidden: '非表示',
        },
    },
    loginField: {
        numberHasNotBeenValidated: 'この番号はまだ確認されていません。ボタンをクリックして、確認用リンクをテキストメッセージで再送信してください。',
        emailHasNotBeenValidated: 'メールはまだ確認されていません。ボタンをクリックして、テキストで確認リンクを再送信してください。',
    },
    avatarWithImagePicker: {
        uploadPhoto: '写真をアップロード',
        removePhoto: '写真を削除',
        editImage: '写真を編集',
        viewPhoto: '写真を表示',
        imageUploadFailed: '画像のアップロードに失敗しました',
        deleteWorkspaceError: '申し訳ありません。ワークスペースのアバターを削除中に予期しない問題が発生しました',
        sizeExceeded: ({maxUploadSizeInMB}: SizeExceededParams) => `選択された画像は、最大アップロードサイズである ${maxUploadSizeInMB} MB を超えています。`,
        resolutionConstraints: ({minHeightInPx, minWidthInPx, maxHeightInPx, maxWidthInPx}: ResolutionConstraintsParams) =>
            `${minHeightInPx}x${minWidthInPx}ピクセルより大きく、${maxHeightInPx}x${maxWidthInPx}ピクセルより小さい画像をアップロードしてください。`,
        notAllowedExtension: ({allowedExtensions}: NotAllowedExtensionParams) => `プロフィール写真は、次のいずれかのタイプである必要があります: ${allowedExtensions.join(', ')}。`,
    },
    avatarPage: {
        title: 'プロフィール写真を編集',
        upload: 'アップロード',
        uploadPhoto: '写真をアップロード',
        selectAvatar: 'アバターを選択',
        choosePresetAvatar: 'またはカスタムアバターを選択',
    },
    modal: {
        backdropLabel: 'モーダル背景',
    },
    nextStep: {
        message: {
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_ADD_TRANSACTIONS]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>が経費を追加するのを待機中。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が経費を追加するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を追加するのを待機中。`;
                }
            },
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            [CONST.NEXT_STEP.MESSAGE_KEY.NO_FURTHER_ACTION]: (_: NextStepParams) => `これ以上の対応は不要です！`,
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_SUBMITTER_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>が銀行口座を追加するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が銀行口座を追加するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が銀行口座を追加するのを待機中です。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_AUTOMATIC_SUBMIT]: ({actor, actorType, eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `${eta} に` : ` ${eta}`;
                }
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>の経費が自動的に提出されるのを待機中${formattedETA}。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> の経費が自動送信されるのを待機中${formattedETA}。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者の経費が自動的に提出されるのを待機中${formattedETA}`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_FIX_ISSUES]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `問題を解決してくれるのを<strong>あなた</strong>が待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が問題を修正するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が問題を解決するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_APPROVE]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `経費の承認を<strong>あなた</strong>が行うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong>が経費を承認するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `経費が管理者の承認待ちです。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_EXPORT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `このレポートをエクスポートするのを<strong>あなた</strong>が待機中です。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> がこのレポートをエクスポートするのを待機しています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `このレポートをエクスポートする管理者を待機中です。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_TO_PAY]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `経費の支払いを<strong>あなた</strong>が行うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> が経費を支払うのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者が経費を支払うのを待機中。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_POLICY_BANK_ACCOUNT]: ({actor, actorType}: NextStepParams) => {
                // Disabling the default-case lint rule here is actually safer as this forces us to make the switch cases exhaustive
                // eslint-disable-next-line default-case
                switch (actorType) {
                    case CONST.NEXT_STEP.ACTOR_TYPE.CURRENT_USER:
                        return `<strong>あなた</strong>がビジネス銀行口座の設定を完了するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.OTHER_USER:
                        return `<strong>${actor}</strong> がビジネス銀行口座の設定を完了するのを待っています。`;
                    case CONST.NEXT_STEP.ACTOR_TYPE.UNSPECIFIED_ADMIN:
                        return `管理者がビジネス用銀行口座の設定を完了するのを待っています。`;
                }
            },
            [CONST.NEXT_STEP.MESSAGE_KEY.WAITING_FOR_PAYMENT]: ({eta, etaType}: NextStepParams) => {
                let formattedETA = '';
                if (eta) {
                    formattedETA = etaType === CONST.NEXT_STEP.ETA_TYPE.DATE_TIME ? `${eta} まで` : ` ${eta}`;
                }
                return `支払いの完了を待機中${formattedETA}。`;
            },
        },
        eta: {
            [CONST.NEXT_STEP.ETA_KEY.SHORTLY]: 'まもなく',
            [CONST.NEXT_STEP.ETA_KEY.TODAY]: '今日の後ほど',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_WEEK]: '日曜日に',
            [CONST.NEXT_STEP.ETA_KEY.SEMI_MONTHLY]: '毎月1日と16日',
            [CONST.NEXT_STEP.ETA_KEY.LAST_BUSINESS_DAY_OF_MONTH]: '月末最終営業日に',
            [CONST.NEXT_STEP.ETA_KEY.LAST_DAY_OF_MONTH]: '月末最終日',
            [CONST.NEXT_STEP.ETA_KEY.END_OF_TRIP]: '旅行の最後に',
        },
    },
    profilePage: {
        profile: 'プロフィール',
        preferredPronouns: '希望する代名詞',
        selectYourPronouns: '代名詞を選択',
        selfSelectYourPronoun: '自分の代名詞を選択してください',
        emailAddress: 'メールアドレス',
        setMyTimezoneAutomatically: 'タイムゾーンを自動的に設定',
        timezone: 'タイムゾーン',
        invalidFileMessage: '無効なファイルです。別の画像をお試しください。',
        avatarUploadFailureMessage: 'アバターのアップロード中にエラーが発生しました。もう一度お試しください。',
        online: 'オンライン',
        offline: 'オフライン',
        syncing: '同期中',
        profileAvatar: 'プロフィールアバター',
        publicSection: {
            title: '公開',
            subtitle: 'これらの詳細はあなたの公開プロフィールに表示されます。誰でも見ることができます。',
        },
        privateSection: {
            title: '非公開',
            subtitle: 'これらの詳細は、旅行および支払いのために使用されます。公開プロフィールに表示されることは決してありません。',
        },
    },
    securityPage: {
        title: 'セキュリティオプション',
        subtitle: '2 要素認証を有効にして、アカウントを安全に保ちましょう。',
        goToSecurity: 'セキュリティページに戻る',
    },
    shareCodePage: {
        title: 'あなたのコード',
        subtitle: '自分専用のQRコードまたは紹介リンクを共有して、Expensifyにメンバーを招待しましょう。',
    },
    pronounsPage: {
        pronouns: '代名詞',
        isShownOnProfile: 'あなたの代名詞はプロフィールに表示されます。',
        placeholderText: '検索してオプションを表示',
    },
    contacts: {
        contactMethods: '連絡方法',
        featureRequiresValidate: 'この機能を利用するには、アカウントの認証が必要です。',
        validateAccount: 'アカウントを認証',
        helpText: ({email}: {email: string}) =>
            `Expensify にログインしたり、領収書を送信したりする方法をさらに追加しましょう。<br/><br/>領収書を転送するメールアドレスを追加して <a href="mailto:${email}">${email}</a> 宛てに転送するか、電話番号を追加して 47777 宛てにテキストメッセージで領収書を送信できます（米国の電話番号のみ）。`,
        pleaseVerify: 'この連絡先を確認してください。',
        getInTouch: '今後のご連絡はこの方法で行います。',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `${contactMethod} に送信されたマジックコードを入力してください。1～2分以内に届くはずです。`,
        setAsDefault: 'デフォルトに設定',
        yourDefaultContactMethod: 'これは現在のデフォルト連絡方法です。削除する前に、別の連絡方法を選択して「デフォルトに設定」をクリックする必要があります。',
        removeContactMethod: '連絡先方法を削除',
        removeAreYouSure: 'この連絡方法を削除してもよろしいですか？この操作は元に戻せません。',
        failedNewContact: 'この連絡方法を追加できませんでした。',
        genericFailureMessages: {
            requestContactMethodValidateCode: '新しいマジックコードの送信に失敗しました。少し待ってから、もう一度お試しください。',
            validateSecondaryLogin: '不正または無効なマジックコードです。もう一度お試しいただくか、新しいコードをリクエストしてください。',
            deleteContactMethod: '連絡先の削除に失敗しました。サポートが必要な場合はConciergeにお問い合わせください。',
            setDefaultContactMethod: '新しいデフォルトの連絡方法の設定に失敗しました。サポートが必要な場合はConciergeにお問い合わせください。',
            addContactMethod: 'この連絡方法を追加できませんでした。サポートが必要な場合はConciergeまでご連絡ください。',
            enteredMethodIsAlreadySubmitted: 'この連絡方法はすでに存在します',
            passwordRequired: 'パスワードが必要です。',
            contactMethodRequired: '連絡方法は必須です',
            invalidContactMethod: '無効な連絡方法',
        },
        newContactMethod: '新しい連絡方法',
        goBackContactMethods: '連絡方法に戻る',
    },
    // cspell:disable
    pronouns: {
        coCos: '会社 / 複数社',
        eEyEmEir: 'E / Ey / Em / Eir',
        faeFaer: 'Fae / Faer',
        heHimHis: '彼／彼／彼の',
        heHimHisTheyThemTheirs: 'He / Him / His / They / Them / Theirs',
        sheHerHers: 'She / Her / Hers',
        sheHerHersTheyThemTheirs: '彼女 / 彼女 / 彼女の / 彼ら / 彼ら / 彼らの',
        merMers: 'Mer / Mers',
        neNirNirs: 'Ne / Nir / Nirs',
        neeNerNers: 'Nee / Ner / Ners',
        perPers: 'Per / Pers',
        theyThemTheirs: 'They / Them / Theirs',
        thonThons: 'Thon / Thons',
        veVerVis: 'Ve / Ver / Vis',
        viVir: 'Vi / Vir',
        xeXemXyr: 'Xe / Xem / Xyr',
        zeZieZirHir: 'Ze / Zie / Zir / Hir',
        zeHirHirs: 'Ze / Hir',
        callMeByMyName: '私の名前で呼んでください',
    },
    // cspell:enable
    displayNamePage: {
        headerTitle: '表示名',
        isShownOnProfile: '表示名はプロフィールに表示されます。',
    },
    timezonePage: {
        timezone: 'タイムゾーン',
        isShownOnProfile: 'あなたのタイムゾーンはプロフィールに表示されています。',
        getLocationAutomatically: '現在地を自動的に特定',
    },
    updateRequiredView: {
        updateRequired: 'アップデートが必要です',
        pleaseInstall: 'New Expensify の最新バージョンにアップデートしてください',
        pleaseInstallExpensifyClassic: '最新バージョンのExpensifyをインストールしてください',
        toGetLatestChanges: 'モバイルまたはデスクトップの場合は、最新バージョンをダウンロードしてインストールしてください。Webの場合は、ブラウザを更新してください。',
        newAppNotAvailable: '新しい Expensify アプリは、すでに利用できません。',
    },
    initialSettingsPage: {
        about: '概要',
        aboutPage: {
            description: '新しい Expensify アプリは、世界中のオープンソース開発者コミュニティによって作られています。私たちと一緒に、Expensify の未来を築きましょう。',
            appDownloadLinks: 'アプリのダウンロードリンク',
            viewKeyboardShortcuts: 'キーボードショートカットを表示',
            viewTheCode: 'コードを表示',
            viewOpenJobs: '公開中の求人を表示',
            reportABug: 'バグを報告',
            troubleshoot: 'トラブルシューティング',
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
            clearCacheAndRestart: 'キャッシュをクリアして再起動',
            viewConsole: 'デバッグコンソールを表示',
            debugConsole: 'デバッグコンソール',
            description:
                '<muted-text>下記のツールを使用して、Expensify のご利用状況のトラブルシューティングを行ってください。問題が発生した場合は、<concierge-link>バグを報告</concierge-link>してください。</muted-text>',
            confirmResetDescription: '未送信の下書きメッセージはすべて失われますが、その他のデータは安全です。',
            resetAndRefresh: 'リセットして再読み込み',
            clientSideLogging: 'クライアント側ログ記録',
            noLogsToShare: '共有できるログはありません',
            useProfiling: 'プロファイリングを使用',
            profileTrace: 'プロファイルトレース',
            results: '結果',
            releaseOptions: 'リリースオプション',
            testingPreferences: 'テスト設定',
            useStagingServer: 'ステージングサーバーを使用',
            forceOffline: 'オフラインを強制',
            simulatePoorConnection: 'インターネット接続不良をシミュレーションする',
            simulateFailingNetworkRequests: '失敗するネットワークリクエストをシミュレート',
            authenticationStatus: '認証ステータス',
            deviceCredentials: 'デバイス認証情報',
            invalidate: '無効にする',
            destroy: '削除',
            maskExportOnyxStateData: 'Onyx ステートをエクスポートする際に、機密性の高いメンバーデータをマスクする',
            exportOnyxState: 'Onyx ステートをエクスポート',
            importOnyxState: 'Onyx ステートをインポート',
            testCrash: 'テストクラッシュ',
            resetToOriginalState: '元の状態にリセット',
            usingImportedState: 'インポートされた状態を使用しています。ここを押してクリアします。',
            debugMode: 'デバッグモード',
            invalidFile: '無効なファイル',
            invalidFileDescription: 'インポートしようとしているファイルは無効です。もう一度お試しください。',
            invalidateWithDelay: '遅延を伴って無効化',
            recordTroubleshootData: 'トラブルシュートデータを記録',
            softKillTheApp: 'アプリをソフト終了する',
            kill: '強制終了',
        },
        debugConsole: {
            saveLog: 'ログを保存',
            shareLog: 'ログを共有',
            enterCommand: 'コマンドを入力',
            execute: '実行',
            noLogsAvailable: '利用可能なログはありません',
            logSizeTooLarge: ({size}: LogSizeParams) => `ログサイズが上限の ${size} MB を超えています。代わりに「ログを保存」を使用してログファイルをダウンロードしてください。`,
            logs: 'ログ',
            viewConsole: 'コンソールを表示',
        },
        security: 'セキュリティ',
        signOut: 'サインアウト',
        restoreStashed: '保存済みログインを復元',
        signOutConfirmationText: 'サインアウトすると、オフラインで行った変更内容は失われます。',
        versionLetter: 'v',
        readTheTermsAndPrivacy: `<muted-text-micro><a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">利用規約</a>と<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>をお読みください。</muted-text-micro>`,
        help: 'ヘルプ',
        whatIsNew: '新着情報',
        accountSettings: 'アカウント設定',
        account: 'アカウント',
        general: '一般',
    },
    closeAccountPage: {
        // @context close as a verb, not an adjective
        closeAccount: 'アカウントを閉じる',
        reasonForLeavingPrompt: 'お別れするのはとても残念です！今後の改善のために、よろしければ退会理由を教えていただけますか？',
        enterMessageHere: 'ここにメッセージを入力',
        closeAccountWarning: 'アカウントを閉鎖すると元に戻すことはできません。',
        closeAccountPermanentlyDeleteData: 'アカウントを本当に削除しますか？未処理の経費はすべて完全に削除されます。',
        enterDefaultContactToConfirm: 'アカウントを閉鎖する意思を確認するため、デフォルトの連絡方法を入力してください。あなたのデフォルトの連絡方法は次のとおりです：',
        enterDefaultContact: 'デフォルトの連絡方法を入力してください',
        defaultContact: 'デフォルトの連絡方法:',
        enterYourDefaultContactMethod: 'アカウントを閉鎖するには、デフォルトの連絡方法を入力してください。',
    },
    mergeAccountsPage: {
        mergeAccount: 'アカウントを統合',
        accountDetails: {
            accountToMergeInto: ({login}: MergeAccountIntoParams) => `<strong>${login}</strong> に統合したいアカウントを入力してください。`,
            notReversibleConsent: 'この操作が元に戻せないことは理解しています',
        },
        accountValidate: {
            confirmMerge: 'アカウントを統合してもよろしいですか？',
            lossOfUnsubmittedData: ({login}: MergeAccountIntoParams) => `アカウントの統合は元に戻せず、<strong>${login}</strong> の未申請経費はすべて失われます。`,
            enterMagicCode: ({login}: MergeAccountIntoParams) => `続行するには、<strong>${login}</strong> に送信されたマジックコードを入力してください。`,
            errors: {
                incorrectMagicCode: '不正または無効なマジックコードです。もう一度お試しいただくか、新しいコードをリクエストしてください。',
                fallback: '問題が発生しました。後でもう一度お試しください。',
            },
        },
        mergeSuccess: {
            accountsMerged: 'アカウントを統合しました！',
            description: ({from, to}: MergeSuccessDescriptionParams) =>
                `<muted-text><centered-text><strong>${from}</strong> から <strong>${to}</strong> へのすべてのデータのマージが完了しました。今後、このアカウントにはどちらのログイン情報も使用できます。</centered-text></muted-text>`,
        },
        mergePendingSAML: {
            weAreWorkingOnIt: '対応中です',
            limitedSupport: 'New Expensify では、まだアカウントの統合をサポートしていません。代わりに Expensify Classic でこの操作を行ってください。',
            reachOutForHelp: '<muted-text><centered-text>ご不明な点があれば、いつでも<concierge-link>Concierge までお問い合わせください</concierge-link>！</centered-text></muted-text>',
            goToExpensifyClassic: 'Expensify Classic に移動',
        },
        mergeFailureSAMLDomainControlDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text><strong>${email.split('@').at(1) ?? ''}</strong> によって管理されているため、<strong>${email}</strong> を統合できません。サポートが必要な場合は、<concierge-link>Concierge までお問い合わせください</concierge-link>。</centered-text></muted-text>`,
        mergeFailureSAMLAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>ドメイン管理者によってこのメールアドレスがプライマリログインとして設定されているため、<strong>${email}</strong> を他のアカウントに統合することはできません。代わりに、他のアカウントをこのアカウントに統合してください。</centered-text></muted-text>`,
        mergeFailure2FA: {
            description: ({email}: MergeFailureDescriptionGenericParams) =>
                `<muted-text><centered-text><strong>${email}</strong> で二要素認証（2FA）が有効になっているため、アカウントを統合できません。<strong>${email}</strong> の2FAを無効にしてから、もう一度お試しください。</centered-text></muted-text>`,
            learnMore: 'アカウントの統合について詳しく見る',
        },
        mergeFailureAccountLockedDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text><strong>${email}</strong> はロックされているため、統合できません。サポートが必要な場合は、<concierge-link>Concierge へお問い合わせください</concierge-link>。</centered-text></muted-text>`,
        mergeFailureUncreatedAccountDescription: ({email, contactMethodLink}: MergeFailureUncreatedAccountDescriptionParams) =>
            `<muted-text><centered-text><strong>${email}</strong> はExpensifyアカウントを持っていないため、アカウントを統合できません。代わりに、<a href="${contactMethodLink}">連絡方法として追加</a>してください。</centered-text></muted-text>`,
        mergeFailureSmartScannerAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text><strong>${email}</strong> を他のアカウントに統合することはできません。代わりに、他のアカウントをこのアカウントに統合してください。</centered-text></muted-text>`,
        mergeFailureInvoicedAccountDescription: ({email}: MergeFailureDescriptionGenericParams) =>
            `<muted-text><centered-text>このアカウントは請求済みの請求関係を所有しているため、<strong>${email}</strong> にアカウントを統合することはできません。</centered-text></muted-text>`,
        mergeFailureTooManyAttempts: {
            heading: '後でもう一度お試しください',
            description: 'アカウントを統合しようとする試行が多すぎました。後でもう一度お試しください。',
        },
        mergeFailureUnvalidatedAccount: {
            description: '検証が完了していないため、他のアカウントに統合できません。アカウントを検証してから、もう一度お試しください。',
        },
        mergeFailureSelfMerge: {
            description: '自分自身のアカウントを統合することはできません。',
        },
        mergeFailureGenericHeading: 'アカウントを統合できません',
    },
    lockAccountPage: {
        reportSuspiciousActivity: '不審なアクティビティを報告',
        lockAccount: 'アカウントをロック',
        unlockAccount: 'アカウントのロック解除',
        compromisedDescription:
            'アカウントに何かおかしな点がありますか？報告すると、アカウントはただちにロックされ、新しい Expensify Card の取引がブロックされ、アカウントの変更もできなくなります。',
        domainAdminsDescription: 'ドメイン管理者向け：これにより、ドメイン全体のすべての Expensify Card のアクティビティと管理者による操作も一時停止されます。',
        areYouSure: 'Expensifyアカウントをロックしてもよろしいですか？',
        onceLocked: '一度ロックされると、アカウントは解除リクエストとセキュリティ審査が完了するまで制限されます',
    },
    failedToLockAccountPage: {
        failedToLockAccount: 'アカウントのロックに失敗しました',
        failedToLockAccountDescription: `お客様のアカウントをロックできませんでした。この問題を解決するには、Concierge にチャットでお問い合わせください。`,
        chatWithConcierge: 'Concierge とチャット',
    },
    unlockAccountPage: {
        accountLocked: 'アカウントがロックされました',
        yourAccountIsLocked: 'あなたのアカウントはロックされています',
        chatToConciergeToUnlock: 'セキュリティに関する懸念を解決し、アカウントのロックを解除するには、Concierge とチャットしてください。',
        chatWithConcierge: 'Concierge とチャット',
    },
    passwordPage: {
        changePassword: 'パスワードを変更',
        changingYourPasswordPrompt: 'パスワードを変更すると、Expensify.com アカウントと New Expensify アカウントの両方のパスワードが更新されます。',
        currentPassword: '現在のパスワード',
        newPassword: '新しいパスワード',
        newPasswordPrompt: '新しいパスワードは、以前のパスワードとは異なり、8文字以上で、少なくとも1つの大文字、1つの小文字、1つの数字を含める必要があります。',
    },
    twoFactorAuth: {
        headerTitle: '2 要素認証',
        twoFactorAuthEnabled: '2要素認証が有効になっています',
        whatIsTwoFactorAuth: '2要素認証（2FA）は、あなたのアカウントを安全に保つのに役立ちます。ログインするときは、お好みの認証アプリで生成されたコードを入力する必要があります。',
        disableTwoFactorAuth: '2 要素認証を無効にする',
        explainProcessToRemove: '2 要素認証（2FA）を無効にするには、認証アプリから有効なコードを入力してください。',
        explainProcessToRemoveWithRecovery: '2要素認証（2FA）を無効にするには、有効なリカバリーコードを入力してください。',
        disabled: '2 要素認証は無効になりました',
        noAuthenticatorApp: '今後、Expensify へのログインに認証アプリは不要になります。',
        stepCodes: 'リカバリーコード',
        keepCodesSafe: 'これらの復旧コードを安全に保管してください！',
        codesLoseAccess: dedent(`
            認証アプリへのアクセスを失い、これらのコードも持っていない場合は、アカウントへのアクセスを失います。

            注：二要素認証を設定すると、他のすべてのアクティブなセッションからログアウトされます。
        `),
        errorStepCodes: '続行する前にコードをコピーまたはダウンロードしてください',
        stepVerify: '確認',
        scanCode: 'QRコードを使用してスキャンしてください',
        authenticatorApp: '認証アプリ',
        addKey: 'または、この秘密鍵を認証アプリに追加してください:',
        enterCode: '次に、認証アプリで生成された6桁のコードを入力してください。',
        stepSuccess: '完了',
        enabled: '2要素認証が有効になっています',
        congrats: 'おめでとうございます！これで追加のセキュリティが有効になりました。',
        copy: 'コピー',
        disable: '無効にする',
        enableTwoFactorAuth: '2 要素認証を有効にする',
        pleaseEnableTwoFactorAuth: '2 要素認証を有効にしてください。',
        twoFactorAuthIsRequiredDescription: 'セキュリティ上の理由から、Xero の連携を接続するには二要素認証が必要です。',
        twoFactorAuthIsRequiredForAdminsHeader: '2 要素認証が必要です',
        twoFactorAuthIsRequiredForAdminsTitle: '2要素認証を有効にしてください',
        twoFactorAuthIsRequiredXero: 'ご利用のXero会計連携には二要素認証が必要です。Expensifyを引き続きご利用いただくには、二要素認証を有効にしてください。',
        twoFactorAuthIsRequiredCompany: 'お客様の会社では二要素認証の利用が必須となっています。Expensify を引き続きご利用いただくには、有効にしてください。',
        twoFactorAuthCannotDisable: '2要素認証を無効にできません',
        twoFactorAuthRequired: 'Xero との接続には 2 要素認証（2FA）が必須であり、無効にすることはできません。',
    },
    recoveryCodeForm: {
        error: {
            pleaseFillRecoveryCode: '復旧コードを入力してください',
            incorrectRecoveryCode: '復旧コードが正しくありません。もう一度お試しください。',
        },
        useRecoveryCode: 'リカバリーコードを使用',
        recoveryCode: '復元コード',
        use2fa: '2 要素認証コードを使用',
    },
    twoFactorAuthForm: {
        error: {
            pleaseFillTwoFactorAuth: '2 要素認証コードを入力してください',
            incorrect2fa: '二要素認証コードが正しくありません。もう一度お試しください。',
        },
    },
    passwordConfirmationScreen: {
        passwordUpdated: 'パスワードを更新しました！',
        allSet: '準備が完了しました。新しいパスワードを安全に保管してください。',
    },
    privateNotes: {
        title: '非公開メモ',
        personalNoteMessage: 'このチャットに関するメモをここに残しましょう。メモを追加、編集、閲覧できるのはあなただけです。',
        sharedNoteMessage: 'このチャットに関するメモをここに残してください。Expensify の従業員および team.expensify.com ドメインの他のメンバーがこれらのメモを閲覧できます。',
        composerLabel: 'メモ',
        myNote: '自分のメモ',
        error: {
            genericFailureMessage: 'プライベートメモを保存できませんでした',
        },
    },
    billingCurrency: {
        error: {
            securityCode: '有効なセキュリティコードを入力してください',
        },
        securityCode: 'セキュリティコード',
        changeBillingCurrency: '請求通貨を変更',
        changePaymentCurrency: '支払い通貨を変更',
        paymentCurrency: '支払い通貨',
        paymentCurrencyDescription: 'すべての個人経費を換算する標準通貨を選択してください',
        note: `注意：支払い通貨を変更すると、Expensify に支払う金額に影響する可能性があります。詳細については、<a href="${CONST.PRICING}">料金ページ</a>をご覧ください。`,
    },
    addDebitCardPage: {
        addADebitCard: 'デビットカードを追加',
        nameOnCard: 'カード名義人',
        debitCardNumber: 'デビットカード番号',
        expiration: '有効期限',
        expirationDate: 'MMYY',
        cvv: 'CVV',
        billingAddress: '請求先住所',
        growlMessageOnSave: 'デビットカードが正常に追加されました',
        expensifyPassword: 'Expensify パスワード',
        error: {
            invalidName: '名前には文字のみ使用できます',
            addressZipCode: '有効な郵便番号を入力してください',
            debitCardNumber: '有効なデビットカード番号を入力してください',
            expirationDate: '有効な有効期限を選択してください',
            securityCode: '有効なセキュリティコードを入力してください',
            addressStreet: '私書箱ではない有効な請求先住所を入力してください',
            addressState: '州を選択してください',
            addressCity: '都市名を入力してください',
            genericFailureMessage: 'カードの追加中にエラーが発生しました。もう一度お試しください。',
            password: 'Expensify のパスワードを入力してください',
        },
    },
    addPaymentCardPage: {
        addAPaymentCard: '支払カードを追加',
        nameOnCard: 'カード名義人',
        paymentCardNumber: 'カード番号',
        expiration: '有効期限',
        expirationDate: 'MM/YY',
        cvv: 'CVV',
        billingAddress: '請求先住所',
        growlMessageOnSave: '支払いカードが正常に追加されました',
        expensifyPassword: 'Expensify パスワード',
        error: {
            invalidName: '名前には文字のみ使用できます',
            addressZipCode: '有効な郵便番号を入力してください',
            paymentCardNumber: '有効なカード番号を入力してください',
            expirationDate: '有効な有効期限を選択してください',
            securityCode: '有効なセキュリティコードを入力してください',
            addressStreet: '私書箱ではない有効な請求先住所を入力してください',
            addressState: '州を選択してください',
            addressCity: '都市名を入力してください',
            genericFailureMessage: 'カードの追加中にエラーが発生しました。もう一度お試しください。',
            password: 'Expensify のパスワードを入力してください',
        },
    },
    walletPage: {
        balance: '残高',
        paymentMethodsTitle: '支払方法',
        setDefaultConfirmation: 'デフォルトの支払い方法に設定',
        setDefaultSuccess: 'デフォルトの支払方法を設定しました！',
        deleteAccount: 'アカウントを削除',
        deleteConfirmation: 'このアカウントを削除してもよろしいですか？',
        error: {
            notOwnerOfBankAccount: 'この銀行口座を既定の支払い方法として設定する際にエラーが発生しました',
            invalidBankAccount: 'この銀行口座は一時的に停止されています',
            notOwnerOfFund: 'このカードを既定の支払い方法として設定中にエラーが発生しました',
            setDefaultFailure: '問題が発生しました。詳しいサポートについてはConciergeにチャットでお問い合わせください。',
        },
        addBankAccountFailure: '銀行口座の追加中に予期しないエラーが発生しました。もう一度お試しください。',
        getPaidFaster: 'より早く支払いを受ける',
        addPaymentMethod: 'アプリ内で直接支払いの送受信を行うために、支払い方法を追加してください。',
        getPaidBackFaster: 'より早く返金を受ける',
        secureAccessToYourMoney: 'あなたのお金への安全なアクセス',
        receiveMoney: '現地通貨で送金を受け取る',
        expensifyWallet: 'Expensifyウォレット (ベータ)',
        sendAndReceiveMoney: '友だちと送金や受け取りができます。米国の銀行口座のみ対応しています。',
        enableWallet: 'ウォレットを有効化',
        addBankAccountToSendAndReceive: '支払いや受け取りを行うために銀行口座を追加してください。',
        addDebitOrCreditCard: 'デビットカードまたはクレジットカードを追加',
        assignedCards: '割り当てられたカード',
        assignedCardsDescription: 'これらは、ワークスペース管理者が会社の支出を管理するために割り当てたカードです。',
        expensifyCard: 'Expensify Card',
        walletActivationPending: 'お客様の情報を確認しています。数分後にもう一度ご確認ください。',
        walletActivationFailed: '残念ながら、現在ウォレットを有効にすることができません。詳細については、Conciergeにチャットでお問い合わせください。',
        addYourBankAccount: '銀行口座を追加',
        addBankAccountBody: 'Expensify に銀行口座を連携して、アプリ内で支払いや入金をこれまで以上に簡単に直接行えるようにしましょう。',
        chooseYourBankAccount: '銀行口座を選択',
        chooseAccountBody: '正しいものを選択していることを確認してください。',
        confirmYourBankAccount: '銀行口座を確認',
        personalBankAccounts: '個人銀行口座',
        businessBankAccounts: 'ビジネス用銀行口座',
    },
    cardPage: {
        expensifyCard: 'Expensify Card',
        expensifyTravelCard: 'Expensify トラベルカード',
        availableSpend: '残りの限度額',
        smartLimit: {
            name: 'スマート上限',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `このカードでは最大 ${formattedLimit} まで利用できます。提出した経費が承認されると、その上限額はリセットされます。`,
        },
        fixedLimit: {
            name: '固定限度',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `このカードでは最大 ${formattedLimit} まで利用でき、その後は無効になります。`,
        },
        monthlyLimit: {
            name: '月間上限',
            title: ({formattedLimit}: ViolationsOverLimitParams) => `このカードでは、1か月あたり最大 ${formattedLimit} まで利用できます。利用限度額は各月の1日になるとリセットされます。`,
        },
        virtualCardNumber: 'バーチャルカード番号',
        travelCardCvv: 'トラベルカードのCVV',
        physicalCardNumber: '物理カード番号',
        physicalCardPin: '暗証番号',
        getPhysicalCard: '物理カードを取得',
        reportFraud: 'バーチャルカードの不正利用を報告',
        reportTravelFraud: 'トラベルカードの不正利用を報告',
        reviewTransaction: '取引を確認',
        suspiciousBannerTitle: '不審な取引',
        suspiciousBannerDescription: 'あなたのカードで不審な取引を検出しました。確認するには、下をタップしてください。',
        cardLocked: '弊社チームが御社のアカウントを確認している間、お客様のカードは一時的にロックされています。',
        cardDetails: {
            cardNumber: 'バーチャルカード番号',
            expiration: '有効期限',
            cvv: 'CVV',
            address: '住所',
            revealDetails: '詳細を表示',
            revealCvv: 'CVV を表示',
            copyCardNumber: 'カード番号をコピー',
            updateAddress: '住所を更新',
        },
        cardAddedToWallet: ({platform}: {platform: 'Google' | 'Apple'}) => `${platform}ウォレットに追加しました`,
        cardDetailsLoadingFailure: 'カードの詳細を読み込む際にエラーが発生しました。インターネット接続を確認して、もう一度お試しください。',
        validateCardTitle: 'あなた本人であることを確認しましょう',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `カード情報を表示するには、${contactMethod} に送信されたマジックコードを入力してください。1～2分以内に届きます。`,
        missingPrivateDetails: ({missingDetailsLink}: {missingDetailsLink: string}) => `<a href="${missingDetailsLink}">個人情報を追加</a>してから、もう一度お試しください。`,
        unexpectedError: 'Expensifyカードの詳細を取得しようとしてエラーが発生しました。もう一度お試しください。',
        cardFraudAlert: {
            confirmButtonText: 'はい、そうです',
            reportFraudButtonText: 'いいえ、私ではありません',
            clearedMessage: ({cardLastFour}: {cardLastFour: string}) => `不審なアクティビティを解消し、カード x${cardLastFour} を再有効化しました。これで引き続き経費精算ができます！`,
            deactivatedMessage: ({cardLastFour}: {cardLastFour: string}) => `末尾が${cardLastFour}のカードを無効化しました`,
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
            }) => `末尾が${cardLastFour}のカードで不審な利用を検出しました。この請求に心当たりはありますか？

${merchant} への ${amount}（${date}）`,
        },
    },
    workflowsPage: {
        workflowTitle: '支出',
        workflowDescription: '支出が発生した瞬間から、承認および支払いまでを含むワークフローを構成します。',
        submissionFrequency: '提出頻度',
        submissionFrequencyDescription: '経費を提出するためのカスタムスケジュールを選択してください。',
        submissionFrequencyDateOfMonth: '月の日付',
        disableApprovalPromptDescription: '承認を無効にすると、既存の承認ワークフローはすべて削除されます。',
        addApprovalsTitle: '承認を追加',
        addApprovalButton: '承認ワークフローを追加',
        addApprovalTip: 'より詳細なワークフローが存在しない限り、このデフォルトのワークフローはすべてのメンバーに適用されます。',
        approver: '承認者',
        addApprovalsDescription: '支払いを承認する前に、追加の承認を要求します。',
        makeOrTrackPaymentsTitle: '支払いを行う／追跡する',
        makeOrTrackPaymentsDescription: 'Expensify で行われた支払いのための承認済み支払担当者を追加するか、他で行われた支払いを追跡します。',
        customApprovalWorkflowEnabled:
            '<muted-text-label>このワークスペースではカスタム承認ワークフローが有効になっています。このワークフローを確認または変更するには、<account-manager-link>アカウントマネージャー</account-manager-link>または<concierge-link>Concierge</concierge-link>にお問い合わせください。</muted-text-label>',
        customApprovalWorkflowEnabledConciergeOnly:
            '<muted-text-label>このワークスペースではカスタム承認ワークフローが有効になっています。このワークフローを確認または変更するには、<concierge-link>Concierge</concierge-link>までご連絡ください。</muted-text-label>',
        editor: {
            submissionFrequency: 'Expensify がエラーのない支出を共有するまでの待機時間を選択してください。',
        },
        frequencyDescription: '経費を自動で提出する頻度を選択するか、手動提出に設定してください',
        frequencies: {
            instant: '即座に',
            weekly: '毎週',
            monthly: '毎月',
            twiceAMonth: '月に2回',
            byTrip: '出張ごと',
            manually: '手動で',
            daily: '毎日',
            lastDayOfMonth: '月末の最終日',
            lastBusinessDayOfMonth: '月末の最終営業日',
            ordinals: {
                one: '番目',
                two: '番目',
                few: '番目',
                other: '番目',
                /* eslint-disable @typescript-eslint/naming-convention */
                '1': '最初',
                '2': '秒',
                '3': '3番目',
                '4': '第4',
                '5': '5番目',
                '6': '6番目',
                '7': '7番目',
                '8': '8番目',
                '9': '9番目',
                '10': '10番目',
                /* eslint-enable @typescript-eslint/naming-convention */
            },
        },
        approverInMultipleWorkflows: 'このメンバーはすでに別の承認ワークフローに属しています。ここでの変更内容は、そちらにも反映されます。',
        approverCircularReference: ({name1, name2}: ApprovalWorkflowErrorParams) =>
            `<strong>${name1}</strong> はすでに <strong>${name2}</strong> にレポートを承認しています。ワークフローの循環を防ぐため、別の承認者を選択してください。`,
        emptyContent: {
            title: '表示するメンバーがいません',
            expensesFromSubtitle: 'すべてのワークスペースメンバーは、すでに既存の承認ワークフローに所属しています。',
            approverSubtitle: 'すべての承認者は、既存のワークフローに属しています。',
        },
    },
    workflowsDelayedSubmissionPage: {
        autoReportingFrequencyErrorMessage: '送信頻度を変更できませんでした。もう一度お試しいただくか、サポートにお問い合わせください。',
        monthlyOffsetErrorMessage: '月次頻度を変更できませんでした。もう一度お試しいただくか、サポートにお問い合わせください。',
    },
    workflowsCreateApprovalsPage: {
        title: '確認',
        header: '承認者を追加して、確認してください。',
        additionalApprover: '追加承認者',
        submitButton: 'ワークフローを追加',
    },
    workflowsEditApprovalsPage: {
        title: '承認ワークフローを編集',
        deleteTitle: '承認ワークフローを削除',
        deletePrompt: 'この承認ワークフローを削除してもよろしいですか？削除すると、すべてのメンバーにデフォルトのワークフローが適用されます。',
    },
    workflowsExpensesFromPage: {
        title: '経費の発生日',
        header: '次のメンバーが経費を提出したとき:',
    },
    workflowsApproverPage: {
        genericErrorMessage: '承認者を変更できませんでした。もう一度お試しいただくか、サポートにお問い合わせください。',
        header: 'このメンバーに承認のため送信:',
    },
    workflowsPayerPage: {
        title: '承認済み支払者',
        genericErrorMessage: '承認された支払者を変更できませんでした。もう一度お試しください。',
        admins: '管理者',
        payer: '支払人',
        paymentAccount: '支払アカウント',
    },
    reportFraudPage: {
        title: 'バーチャルカードの不正利用を報告',
        description: 'バーチャルカードの情報が盗まれたり不正利用された場合、現在のカードは完全に無効化され、新しいバーチャルカードとカード番号が発行されます。',
        deactivateCard: 'カードを無効化',
        reportVirtualCardFraud: 'バーチャルカードの不正利用を報告',
    },
    reportFraudConfirmationPage: {
        title: 'カードの不正利用が報告されました',
        description: '既存のカードは永久に無効化しました。カードの詳細画面に戻ると、新しいバーチャルカードが利用可能になっています。',
        buttonText: '了解しました、ありがとうございます！',
    },
    activateCardPage: {
        activateCard: 'カードを有効化',
        pleaseEnterLastFour: 'カードの下4桁を入力してください。',
        activatePhysicalCard: '物理カードを有効化',
        error: {
            thatDidNotMatch: 'カードの下4桁と一致しませんでした。もう一度お試しください。',
            throttled:
                'Expensify Card の下4桁の入力に複数回連続して誤りがあります。数字が正しいと確信している場合は、問題解決のため Concierge までご連絡ください。そうでない場合は、時間をおいてから再度お試しください。',
        },
    },
    getPhysicalCard: {
        header: '物理カードを取得',
        nameMessage: 'カードに表示されるため、名と姓を入力してください。',
        legalName: '法的氏名',
        legalFirstName: '法的な名',
        legalLastName: '法的な姓',
        phoneMessage: '電話番号を入力してください。',
        phoneNumber: '電話番号',
        address: '住所',
        addressMessage: '配送先住所を入力してください。',
        streetAddress: '番地（ストリート住所）',
        city: '市',
        state: '状態',
        zipPostcode: '郵便番号',
        country: '国',
        confirmMessage: '以下の内容をご確認ください。',
        estimatedDeliveryMessage: 'あなたの物理カードは、2〜3営業日以内に届きます。',
        next: '次へ',
        getPhysicalCard: '物理カードを取得',
        shipCard: 'カードを発送',
    },
    transferAmountPage: {
        transfer: ({amount}: TransferParams) => `振替${amount ? ` ${amount}` : ''}`,
        instant: '即時（デビットカード）',
        instantSummary: ({rate, minAmount}: InstantSummaryParams) => `${rate}% の手数料（最低 ${minAmount}）`,
        ach: '1～3営業日（銀行口座）',
        achSummary: '手数料なし',
        whichAccount: 'どのアカウントですか？',
        fee: '手数料',
        transferSuccess: '送金が完了しました！',
        transferDetailBankAccount: 'お金は今後1～3営業日以内に届くはずです。',
        transferDetailDebitCard: '送金はすぐに反映されるはずです。',
        failedTransfer: '残高がすべて精算されていません。銀行口座へ振込を行ってください。',
        notHereSubTitle: 'ウォレットページから残高を振り替えてください',
        goToWallet: 'ウォレットに移動',
    },
    chooseTransferAccountPage: {
        chooseAccount: 'アカウントを選択',
    },
    paymentMethodList: {
        addPaymentMethod: '支払い方法を追加',
        addNewDebitCard: '新しいデビットカードを追加',
        addNewBankAccount: '新しい銀行口座を追加',
        accountLastFour: '末尾',
        cardLastFour: '末尾が…のカード',
        addFirstPaymentMethod: 'アプリ内で直接支払いの送受信を行うために、支払い方法を追加してください。',
        defaultPaymentMethod: 'デフォルト',
        bankAccountLastFour: ({lastFour}: BankAccountLastFourParams) => `銀行口座・${lastFour}`,
    },
    preferencesPage: {
        appSection: {
            title: 'アプリの設定',
        },
        testSection: {
            title: 'テスト設定',
            subtitle: 'ステージング環境でアプリのデバッグとテストを支援するための設定。',
        },
        receiveRelevantFeatureUpdatesAndExpensifyNews: '関連する機能アップデートやExpensifyのニュースを受け取る',
        muteAllSounds: 'Expensify からのすべてのサウンドをミュート',
    },
    priorityModePage: {
        priorityMode: '優先モード',
        explainerText: '未読とピン留めされたチャットのみに #focus するか、すべてのチャットを表示して、最新とピン留めされたチャットを上部に表示するかを選択してください。',
        priorityModes: {
            default: {
                label: '最新順',
                description: '最新の順にすべてのチャットを表示',
            },
            gsd: {
                label: '#集中',
                description: '未読のみをアルファベット順で表示',
            },
        },
    },
    reportDetailsPage: {
        inWorkspace: ({policyName}: ReportPolicyNameParams) => `${policyName} 内`,
        generatingPDF: 'PDF を生成しています...',
        waitForPDF: 'PDF を生成しています。しばらくお待ちください',
        errorPDF: 'PDF の生成中にエラーが発生しました',
    },
    reportDescriptionPage: {
        roomDescription: '部屋の説明',
        roomDescriptionOptional: '部屋の説明（任意）',
        explainerText: 'ルームのカスタム説明を設定します。',
    },
    groupChat: {
        lastMemberTitle: '注意！',
        lastMemberWarning: 'あなたが最後のメンバーのため、退出するとこのチャットは全メンバーからアクセスできなくなります。本当に退出しますか？',
        defaultReportName: ({displayName}: ReportArchiveReasonsClosedParams) => `${displayName}のグループチャット`,
    },
    languagePage: {
        language: '言語',
        aiGenerated: 'この言語の翻訳は自動生成されており、誤りを含む場合があります。',
    },
    themePage: {
        theme: 'テーマ',
        themes: {
            dark: {
                label: 'ダーク',
            },
            light: {
                label: 'ライト',
            },
            system: {
                label: 'デバイスの設定を使用',
            },
        },
        chooseThemeBelowOrSync: '下からテーマを選択するか、デバイスの設定と同期してください。',
    },
    termsOfUse: {
        terms: `<muted-text-xs>ログインすることで、<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">利用規約</a>および<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシー規約</a>に同意したものとみなされます。</muted-text-xs>`,
        license: `<muted-text-xs>送金サービスは、その<a href="${CONST.OLD_DOT_PUBLIC_URLS.LICENSES_URL}">認可</a>に基づき、${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS}（NMLS ID:2017010）によって提供されています。</muted-text-xs>`,
    },
    validateCodeForm: {
        magicCodeNotReceived: 'マジックコードを受け取っていませんか？',
        enterAuthenticatorCode: '認証コードを入力してください',
        enterRecoveryCode: '復旧コードを入力してください',
        requiredWhen2FAEnabled: '2要素認証が有効な場合は必須',
        requestNewCode: ({timeRemaining}: {timeRemaining: string}) => `<a>${timeRemaining}</a> の新しいコードをリクエスト`,
        requestNewCodeAfterErrorOccurred: '新しいコードをリクエスト',
        error: {
            pleaseFillMagicCode: 'マジックコードを入力してください',
            incorrectMagicCode: '不正または無効なマジックコードです。もう一度お試しいただくか、新しいコードをリクエストしてください。',
            pleaseFillTwoFactorAuth: '2 要素認証コードを入力してください',
        },
    },
    passwordForm: {
        pleaseFillOutAllFields: 'すべての項目を入力してください',
        pleaseFillPassword: 'パスワードを入力してください',
        pleaseFillTwoFactorAuth: '2 要素認証コードを入力してください',
        enterYourTwoFactorAuthenticationCodeToContinue: '続行するには、二要素認証コードを入力してください',
        forgot: 'お忘れですか？',
        requiredWhen2FAEnabled: '2要素認証が有効な場合は必須',
        error: {
            incorrectPassword: 'パスワードが正しくありません。もう一度お試しください。',
            incorrectLoginOrPassword: 'ログインまたはパスワードが正しくありません。もう一度お試しください。',
            incorrect2fa: '二要素認証コードが正しくありません。もう一度お試しください。',
            twoFactorAuthenticationEnabled: 'このアカウントでは2FAが有効になっています。メールアドレスまたは電話番号を使ってサインインしてください。',
            invalidLoginOrPassword: 'ログインまたはパスワードが正しくありません。もう一度お試しいただくか、パスワードをリセットしてください。',
            unableToResetPassword:
                'パスワードを変更できませんでした。古いパスワード再設定メール内のリンクが有効期限切れになっている可能性があります。再度お試しいただけるよう、新しいリンクを記載したメールを送信しました。受信トレイと迷惑メールフォルダをご確認ください。数分以内に届くはずです。',
            noAccess: 'このアプリケーションへのアクセス権がありません。アクセスするには、GitHub のユーザー名を追加してください。',
            accountLocked: '試行回数が多すぎたため、アカウントがロックされました。1時間後にもう一度お試しください。',
            fallback: '問題が発生しました。後でもう一度お試しください。',
        },
    },
    loginForm: {
        phoneOrEmail: '電話番号またはメールアドレス',
        error: {
            invalidFormatEmailLogin: '入力されたメールアドレスが無効です。形式を修正して、もう一度お試しください。',
        },
        cannotGetAccountDetails: 'アカウントの詳細を取得できませんでした。もう一度サインインしてください。',
        loginForm: 'ログインフォーム',
        notYou: ({user}: NotYouParams) => `${user}ではありませんか？`,
    },
    onboarding: {
        welcome: 'ようこそ！',
        welcomeSignOffTitleManageTeam: '上記のタスクが完了したら、承認ワークフローやルールなど、さらに多くの機能を試してみましょう！',
        welcomeSignOffTitle: 'お会いできてうれしいです！',
        explanationModal: {
            title: 'Expensify へようこそ',
            description: 'チャットのスピードで、ビジネスとプライベートの支出をひとつのアプリで管理。ぜひお試しいただき、ご意見をお聞かせください。今後も続々と新機能を追加予定です！',
            secondaryDescription: 'Expensify Classic に戻すには、プロフィール写真をタップして「Expensify Classic に移動」を選択してください。',
        },
        getStarted: 'はじめる',
        whatsYourName: 'あなたの名前は何ですか？',
        peopleYouMayKnow: '知り合いがすでに参加しています！一緒に利用するには、メールアドレスを確認してください。',
        workspaceYouMayJoin: ({domain, email}: WorkspaceYouMayJoin) => `${domain} のメンバーがすでにワークスペースを作成しています。${email} に送信されたマジックコードを入力してください。`,
        joinAWorkspace: 'ワークスペースに参加',
        listOfWorkspaces: '参加できるワークスペースの一覧です。必要であれば、後からいつでも参加できますのでご安心ください。',
        workspaceMemberList: ({employeeCount, policyOwner}: WorkspaceMemberList) => `${employeeCount} 人のメンバー${employeeCount > 1 ? 's' : ''} • ${policyOwner}`,
        whereYouWork: '勤務先はどこですか？',
        errorSelection: '先に進むオプションを選択',
        purpose: {
            title: '今日は何をしたいですか？',
            errorContinue: 'セットアップを続行するには「続行」を押してください',
            errorBackButton: 'アプリの利用を開始するには、セットアップの質問にすべて回答してください',
            [CONST.ONBOARDING_CHOICES.EMPLOYER]: '雇用主から精算してもらう',
            [CONST.ONBOARDING_CHOICES.MANAGE_TEAM]: 'チームの経費を管理する',
            [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND]: '経費の追跡と予算管理',
            [CONST.ONBOARDING_CHOICES.CHAT_SPLIT]: '友だちとチャットして割り勘精算',
            [CONST.ONBOARDING_CHOICES.LOOKING_AROUND]: 'その他',
        },
        employees: {
            title: '従業員は何人いますか？',
            [CONST.ONBOARDING_COMPANY_SIZE.MICRO]: '従業員 1～10 人',
            [CONST.ONBOARDING_COMPANY_SIZE.SMALL]: '従業員数 11～50 人',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM_SMALL]: '従業員数 51～100 人',
            [CONST.ONBOARDING_COMPANY_SIZE.MEDIUM]: '101〜1,000人の従業員',
            [CONST.ONBOARDING_COMPANY_SIZE.LARGE]: '1,000人を超える従業員',
        },
        accounting: {
            title: '会計ソフトウェアを利用していますか？',
            none: 'なし',
        },
        interestedFeatures: {
            title: 'どの機能にご興味がありますか？',
            featuresAlreadyEnabled: 'こちらは当社で最も人気のある機能です。',
            featureYouMayBeInterestedIn: '追加機能を有効にする',
        },
        error: {
            requiredFirstName: '続行するには名（ファーストネーム）を入力してください',
        },
        workEmail: {
            title: 'あなたの勤務先のメールアドレスは何ですか？',
            subtitle: 'Expensify は、勤務先のメールアドレスを連携すると最適にご利用いただけます。',
            explanationModal: {
                descriptionOne: 'receipts@expensify.com に転送してスキャン',
                descriptionTwo: 'すでに Expensify を利用している同僚に参加する',
                descriptionThree: 'より自分好みのエクスペリエンスをお楽しみください',
            },
            addWorkEmail: '勤務用メールアドレスを追加',
        },
        workEmailValidation: {
            title: '勤務先メールアドレスを確認',
            magicCodeSent: ({workEmail}: WorkEmailResendCodeParams) => `${workEmail} に送信されたマジックコードを入力してください。1～2分ほどで届くはずです。`,
        },
        workEmailValidationError: {
            publicEmail: '有効なプライベートドメインの勤務用メールアドレスを入力してください（例：mitch@company.com）',
            offline: 'オフラインのようなので、勤務先メールアドレスを追加できませんでした',
        },
        mergeBlockScreen: {
            title: '勤務用メールアドレスを追加できませんでした',
            subtitle: ({workEmail}: WorkEmailMergingBlockedParams) =>
                `${workEmail} を追加できませんでした。後ほど「設定」から再試行するか、ガイダンスについては Concierge にチャットでお問い合わせください。`,
        },
        tasks: {
            testDriveAdminTask: {
                title: ({testDriveURL}) => `[test drive](${testDriveURL}) を試す`,
                description: ({testDriveURL}) => `[Expensify が経費精算を最速で行える理由を確認するには、こちらからクイック製品ツアーをお試しください](${testDriveURL})`,
            },
            testDriveEmployeeTask: {
                title: ({testDriveURL}) => `[test drive](${testDriveURL}) を試す`,
                description: ({testDriveURL}) => `[お試しドライブ](${testDriveURL})でご体験いただき、チーム全員で*Expensifyを3か月間無料*でご利用ください！`,
            },
            addExpenseApprovalsTask: {
                title: '経費承認を追加',
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        チームの支出を確認して管理するには、*経費承認を追加* しましょう。

                        手順は次のとおりです。

                        1. *ワークスペース* に移動します。
                        2. 対象のワークスペースを選択します。
                        3. *その他の機能* をクリックします。
                        4. *ワークフロー* を有効にします。
                        5. ワークスペースエディタ内の *ワークフロー* に移動します。
                        6. *承認を追加* を有効にします。
                        7. あなたが経費承認者として設定されます。チームを招待した後、任意の管理者に変更できます。

                        [その他の機能に移動](${workspaceMoreFeaturesLink})。`),
            },
            createTestDriveAdminWorkspaceTask: {
                title: ({workspaceConfirmationLink}) => `ワークスペースを[作成](${workspaceConfirmationLink})`,
                description: 'ワークスペースを作成し、セットアップ担当者のサポートを受けながら設定を構成しましょう！',
            },
            createWorkspaceTask: {
                title: ({workspaceSettingsLink}) => `[ワークスペース](${workspaceSettingsLink}) を作成`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        経費を管理し、レシートをスキャンし、チャットなどを行うには、*ワークスペースを作成*しましょう。

                        1. *ワークスペース* をクリックし、*新しいワークスペース* を選択します。

                        *新しいワークスペースの準備ができました！* [こちらを確認](${workspaceSettingsLink})。`),
            },
            setupCategoriesTask: {
                title: ({workspaceCategoriesLink}) => `[カテゴリ](${workspaceCategoriesLink})を設定`,
                description: ({workspaceCategoriesLink}) =>
                    dedent(`
                        *カテゴリを設定* して、チームが経費を簡単にレポートできるようにコードを割り当てましょう。

                        1. *Workspaces* をクリックします。
                        3. 自分のワークスペースを選択します。
                        4. *Categories* をクリックします。
                        5. 不要なカテゴリを無効にします。
                        6. 右上で独自のカテゴリを追加します。

                        [ワークスペースのカテゴリ設定に移動](${workspaceCategoriesLink})。

                        ![カテゴリを設定](${CONST.CLOUDFRONT_URL}/videos/walkthrough-categories-v2.mp4)`),
            },
            combinedTrackSubmitExpenseTask: {
                title: '経費を提出',
                description: dedent(`
                    金額を入力するかレシートをスキャンして、*経費を提出*しましょう。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *経費を作成* を選択します。
                    3. 金額を入力するかレシートをスキャンします。
                    4. 上司のメールアドレスまたは電話番号を追加します。
                    5. *作成* をクリックします。

                    これで完了です！
                `),
            },
            adminSubmitExpenseTask: {
                title: '経費を提出',
                description: dedent(`
                    金額を入力するか、レシートをスキャンして、*経費を提出*しましょう。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *経費を作成* を選択します。
                    3. 金額を入力するか、レシートをスキャンします。
                    4. 詳細を確認します。
                    5. *作成* をクリックします。

                    これで完了です！
                `),
            },
            trackExpenseTask: {
                title: '経費を記録',
                description: dedent(`
                    領収書の有無にかかわらず、どの通貨でも*経費を記録*できます。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *経費を作成*を選択します。
                    3. 金額を入力するか、領収書をスキャンします。
                    4. *個人*スペースを選択します。
                    5. *作成*をクリックします。

                    これで完了です。本当に、これだけでOKです。
                `),
            },
            addAccountingIntegrationTask: {
                title: ({integrationName, workspaceAccountingLink}) =>
                    `接続${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? '' : '宛先'} [${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'あなたの' : ''} ${integrationName}](${workspaceAccountingLink})`,
                description: ({integrationName, workspaceAccountingLink}) =>
                    dedent(`
${integrationName === CONST.ONBOARDING_ACCOUNTING_MAPPING.other ? 'あなたの' : '宛先'} ${integrationName} を接続して、自動経費コード設定と同期を行い、月次決算をスムーズにしましょう。

                        1. *Workspaces* をクリックします。
                        2. ワークスペースを選択します。
                        3. *Accounting* をクリックします。
                        4. ${integrationName} を探します。
                        5. *Connect* をクリックします。

${
    integrationName && CONST.connectionsVideoPaths[integrationName]
        ? dedent(`[会計へ移動](${workspaceAccountingLink}).

                                      ![${integrationName} に接続](${CONST.CLOUDFRONT_URL}/${CONST.connectionsVideoPaths[integrationName]})`)
        : `[経理ページへ移動](${workspaceAccountingLink})`
}`),
            },
            connectCorporateCardTask: {
                title: ({corporateCardLink}) => `[法人カード](${corporateCardLink})を接続`,
                description: ({corporateCardLink}) =>
                    dedent(`
                        自動取引の取り込み、領収書との照合、照合作業のために、すでにお持ちのカードを接続します。

                        1. *Workspaces* をクリックします。
                        2. ワークスペースを選択します。
                        3. *Company cards* をクリックします。
                        4. 画面の指示に従ってカードを接続します。

                        [Company cards 画面に移動](${corporateCardLink})。`),
            },
            inviteTeamTask: {
                title: ({workspaceMembersLink}) => `[チームを招待](${workspaceMembersLink})`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *チームを招待*して、今日からExpensifyで経費の管理を始めましょう。

                        1. *Workspaces* をクリックします。
                        3. ワークスペースを選択します。
                        4. *Members* > *Invite member* をクリックします。
                        5. メールアドレスまたは電話番号を入力します。
                        6. 必要であれば、カスタム招待メッセージを追加します。

                        [ワークスペースのメンバー画面へ移動](${workspaceMembersLink})。

                        ![チームを招待](${CONST.CLOUDFRONT_URL}/videos/walkthrough-invite_members-v2.mp4)`),
            },
            setupCategoriesAndTags: {
                title: ({workspaceCategoriesLink, workspaceTagsLink}) => `[カテゴリ](${workspaceCategoriesLink})と[タグ](${workspaceTagsLink})を設定する`,
                description: ({workspaceCategoriesLink, workspaceAccountingLink}) =>
                    dedent(`
                        *カテゴリとタグを設定* して、チームが経費を仕訳し、レポートを簡単に作成できるようにしましょう。

                        [会計ソフトを接続](${workspaceAccountingLink})して自動でインポートするか、[ワークスペース設定](${workspaceCategoriesLink})で手動設定してください。`),
            },
            setupTagsTask: {
                title: ({workspaceTagsLink}) => `[タグ](${workspaceTagsLink})を設定`,
                description: ({workspaceMoreFeaturesLink}) =>
                    dedent(`
                        プロジェクト、クライアント、所在地、部署などの追加の経費情報を、タグを使って追加できます。複数レベルのタグが必要な場合は、Control プランにアップグレードできます。

                        1. *Workspaces* をクリックします。
                        3. ワークスペースを選択します。
                        4. *More features* をクリックします。
                        5. *Tags* を有効にします。
                        6. ワークスペースエディタで *Tags* に移動します。
                        7. 独自のタグを作成するには *+ Add tag* をクリックします。

                        [詳細機能に移動](${workspaceMoreFeaturesLink})。

                        ![タグの設定](${CONST.CLOUDFRONT_URL}/videos/walkthrough-tags-v2.mp4)`),
            },
            inviteAccountantTask: {
                title: ({workspaceMembersLink}) => `[会計士](${workspaceMembersLink})を招待する`,
                description: ({workspaceMembersLink}) =>
                    dedent(`
                        *あなたの会計士を招待して*、ワークスペースで共同作業し、ビジネス経費を管理しましょう。

                        1. *Workspaces* をクリックします。
                        2. あなたのワークスペースを選択します。
                        3. *Members* をクリックします。
                        4. *Invite member* をクリックします。
                        5. あなたの会計士のメールアドレスを入力します。

                        [今すぐ会計士を招待](${workspaceMembersLink})。`),
            },
            startChatTask: {
                title: 'チャットを開始',
                description: dedent(`
                    メールまたは電話番号を使って、誰とでも*チャットを開始*できます。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *チャットを開始* を選択します。
                    3. メールアドレスまたは電話番号を入力します。

                    相手がまだ Expensify を利用していない場合は、自動的に招待が送信されます。

                    すべてのチャットは、相手が直接返信できるメールまたはテキストメッセージにもなります。
                `),
            },
            splitExpenseTask: {
                title: '経費を分割',
                description: dedent(`
                    1 人または複数の人と*精算*しましょう。

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *チャットを開始* を選択します。
                    3. メールアドレスまたは電話番号を入力します。
                    4. チャット内のグレーの *+* ボタンをクリックし、*経費を分割* を選択します。
                    5. *手入力*、*スキャン*、または *距離* を選んで経費を作成します。

                    必要に応じて詳細を追加してもよいですし、そのまま送信してもかまいません。さあ、立て替えた分を返してもらいましょう！
                `),
            },
            reviewWorkspaceSettingsTask: {
                title: ({workspaceSettingsLink}) => `[ワークスペース設定](${workspaceSettingsLink})を確認する`,
                description: ({workspaceSettingsLink}) =>
                    dedent(`
                        ワークスペース設定を確認および更新する手順は次のとおりです：
                        1. 「Workspaces」をクリックします。
                        2. 自分のワークスペースを選択します。
                        3. 設定内容を確認し、必要に応じて更新します。
                        [自分のワークスペースに移動する](${workspaceSettingsLink})`),
            },
            createReportTask: {
                title: '最初のレポートを作成',
                description: dedent(`
                    レポートの作成手順は次のとおりです：

                    1. ${CONST.CUSTOM_EMOJIS.GLOBAL_CREATE} ボタンをクリックします。
                    2. *レポートを作成* を選択します。
                    3. *経費を追加* をクリックします。
                    4. 最初の経費を追加します。

                    これで完了です！
                `),
            },
        } satisfies Record<string, Pick<OnboardingTask, 'title' | 'description'>>,
        testDrive: {
            name: ({testDriveURL}: {testDriveURL?: string}) => (testDriveURL ? `[test drive](${testDriveURL}) を試す` : '試してみる'),
            embeddedDemoIframeTitle: '試用版',
            employeeFakeReceipt: {
                description: '私の試乗の領収書！',
            },
        },
        messages: {
            onboardingEmployerOrSubmitMessage: 'お金を返してもらうのは、メッセージを送るくらい簡単です。まずは基本を見ていきましょう。',
            onboardingPersonalSpendMessage: '数回のクリックで支出を管理する方法をご紹介します。',
            onboardingManageTeamMessage: ({isOnboardingFlow = false}: {isOnboardingFlow?: boolean}) =>
                isOnboardingFlow
                    ? dedent(`
                        # 無料トライアルが開始されました！設定を進めましょう。
                        👋 こんにちは、私はあなたの Expensify 設定スペシャリストです。すでに、チームの領収書や経費を管理するためのワークスペースを作成済みです。30 日間の無料トライアルを最大限に活用するには、以下の残りの設定手順に従ってください！
                    `)
                    : dedent(`
                        # 無料トライアルが開始されました！さっそく設定を始めましょう。
                        👋 こんにちは、私はあなたの Expensify セットアップ担当です。ワークスペースを作成したので、以下のステップに従って 30 日間の無料トライアルを最大限に活用しましょう！
                    `),
            onboardingTrackWorkspaceMessage:
                '# 準備を始めましょう\n👋 こんにちは、私はあなたの Expensify セットアップ担当です。すでに領収書と経費を管理するためのワークスペースを作成しました。30日間の無料トライアルを最大限に活用するには、以下の残りのセットアップ手順に従ってください！',
            onboardingChatSplitMessage: '友だちとの割り勘は、メッセージを送るくらい簡単です。やり方はこちら。',
            onboardingAdminMessage: '管理者としてチームのワークスペースを管理し、自身の経費を申請する方法を学びましょう。',
            onboardingLookingAroundMessage:
                'Expensify は経費、出張、法人カードの管理でよく知られていますが、それだけではありません。ご興味のある内容を教えていただければ、スムーズに始められるようお手伝いします。',
            onboardingTestDriveReceiverMessage: '3か月間無料でご利用いただけます！以下から始めましょう。',
        },
        workspace: {
            title: 'ワークスペースで整理整頓しましょう',
            subtitle: 'すべてを 1 か所に集約して、経費管理をシンプルにする強力なツールを利用しましょう。ワークスペースを使うと、次のことができます。',
            explanationModal: {
                descriptionOne: 'レシートの追跡と整理',
                descriptionTwo: '経費を分類してタグ付けする',
                descriptionThree: 'レポートを作成して共有',
            },
            price: '30日間無料でお試し、その後は<strong>1ユーザーあたり月額5ドル</strong>でアップグレードできます。',
            createWorkspace: 'ワークスペースを作成',
        },
        confirmWorkspace: {
            title: 'ワークスペースを確認',
            subtitle: '領収書の管理、経費精算、出張の管理、レポート作成などを行うワークスペースを作成しましょう。すべてをチャットのスピードで。',
        },
        inviteMembers: {
            title: 'メンバーを招待',
            subtitle: 'チームを追加するか、会計士を招待しましょう。人数が多いほど、もっと便利になります！',
        },
    },
    featureTraining: {
        doNotShowAgain: '今後このメッセージを表示しない',
    },
    personalDetails: {
        error: {
            containsReservedWord: '名前に「Expensify」または「Concierge」という単語を含めることはできません',
            hasInvalidCharacter: '名前にコンマまたはセミコロンを含めることはできません',
            requiredFirstName: '名は空欄にできません',
        },
    },
    privatePersonalDetails: {
        enterLegalName: '法的な氏名は何ですか？',
        enterDateOfBirth: '生年月日はいつですか？',
        enterAddress: 'あなたの住所は何ですか？',
        enterPhoneNumber: '電話番号は何ですか？',
        personalDetails: '個人情報',
        privateDataMessage: 'これらの詳細は、旅行および支払いのために使用されます。あなたの公開プロフィールに表示されることは決してありません。',
        legalName: '法的氏名',
        legalFirstName: '法的な名',
        legalLastName: '法的な姓',
        address: '住所',
        error: {
            dateShouldBeBefore: ({dateString}: DateShouldBeBeforeParams) => `日付は${dateString}より前である必要があります`,
            dateShouldBeAfter: ({dateString}: DateShouldBeAfterParams) => `日付は${dateString}より後である必要があります`,
            hasInvalidCharacter: '名前にはラテン文字のみ使用できます',
            incorrectZipFormat: ({zipFormat}: IncorrectZipFormatParams = {}) => `郵便番号の形式が正しくありません${zipFormat ? `許容される形式: ${zipFormat}` : ''}`,
            invalidPhoneNumber: `電話番号が有効であることを確認してください（例：${CONST.EXAMPLE_PHONE_NUMBER}）`,
        },
    },
    resendValidationForm: {
        linkHasBeenResent: 'リンクを再送信しました',
        weSentYouMagicSignInLink: ({login, loginType}: WeSentYouMagicSignInLinkParams) =>
            `${login} にマジックサインインリンクを送信しました。サインインするには ${loginType} を確認してください。`,
        resendLink: 'リンクを再送する',
    },
    unlinkLoginForm: {
        toValidateLogin: ({primaryLogin, secondaryLogin}: ToValidateLoginParams) =>
            `${secondaryLogin} を認証するには、${primaryLogin} のアカウント設定からマジックコードを再送してください。`,
        noLongerHaveAccess: ({primaryLogin}: NoLongerHaveAccessParams) => `${primaryLogin} にアクセスできなくなった場合は、アカウントのリンクを解除してください。`,
        unlink: 'リンク解除',
        linkSent: 'リンクを送信しました！',
        successfullyUnlinkedLogin: 'セカンダリログインのリンク解除が完了しました！',
    },
    emailDeliveryFailurePage: {
        ourEmailProvider: ({login}: OurEmailProviderParams) =>
            `配信の問題により、メールプロバイダーが一時的に ${login} 宛てのメール送信を停止しました。ログインを解除するには、次の手順に従ってください。`,
        confirmThat: ({login}: ConfirmThatParams) =>
            `<strong>${login} が正しく綴られており、実在する配信可能なメールアドレスであることを確認してください。</strong> 「expenses@domain.com」のようなメールエイリアスも、有効な Expensify ログインとして使用するには、そのエイリアス専用のメール受信ボックスにアクセスできなければなりません。`,
        ensureYourEmailClient: `<strong>ご利用のメールクライアントで expensify.com からのメールが受信できるように設定してください。</strong> この手順の完了方法は<a href="${CONST.SET_NOTIFICATION_LINK}">こちら</a>で確認できますが、メール設定の構成については IT 部門のサポートが必要な場合があります。`,
        onceTheAbove: `上記の手順が完了したら、ログインのブロック解除のために <a href="mailto:${CONST.EMAIL.CONCIERGE}">${CONST.EMAIL.CONCIERGE}</a> までご連絡ください。`,
    },
    openAppFailureModal: {
        title: '問題が発生しました…',
        subtitle: `すべてのデータを読み込むことができませんでした。問題を確認するよう通知済みで、現在調査しています。問題が解決しない場合は、次へお問い合わせください`,
        refreshAndTryAgain: '更新して、もう一度お試しください',
    },
    smsDeliveryFailurePage: {
        smsDeliveryFailureMessage: ({login}: OurEmailProviderParams) => `${login} へのSMSメッセージを配信できなかったため、一時的に利用を停止しました。番号の認証をお試しください。`,
        validationSuccess: '電話番号が認証されました！下のボタンをクリックして、新しいマジックサインインコードを送信してください。',
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
                return 'もう一度お試しいただく前に、しばらくお待ちください。';
            }
            const timeParts = [];
            if (timeData.days) {
                timeParts.push(`${timeData.days} ${timeData.days === 1 ? '日' : '日'}`);
            }
            if (timeData.hours) {
                timeParts.push(`${timeData.hours} ${timeData.hours === 1 ? '時間' : '時間'}`);
            }
            if (timeData.minutes) {
                timeParts.push(`${timeData.minutes} ${timeData.minutes === 1 ? '分' : '分'}`);
            }
            let timeText = '';
            if (timeParts.length === 1) {
                timeText = timeParts.at(0) ?? '';
            } else if (timeParts.length === 2) {
                timeText = `${timeParts.at(0)} and ${timeParts.at(1)}`;
            } else if (timeParts.length === 3) {
                timeText = `${timeParts.at(0)}, ${timeParts.at(1)}, and ${timeParts.at(2)}`;
            }
            return `少々お待ちください！電話番号を再度認証するには、${timeText} 待つ必要があります。`;
        },
    },
    welcomeSignUpForm: {
        join: '参加',
    },
    detailsPage: {
        localTime: '現地時間',
    },
    newChatPage: {
        startGroup: 'グループを開始',
        addToGroup: 'グループに追加',
    },
    yearPickerPage: {
        year: '年',
        selectYear: '年を選択してください',
    },
    focusModeUpdateModal: {
        title: '#focus モードへようこそ！',
        prompt: ({priorityModePageUrl}: FocusModeUpdateParams) =>
            `未読のチャットや対応が必要なチャットだけを表示して、状況を把握しましょう。心配はいりません。これはいつでも<a href="${priorityModePageUrl}">設定</a>で変更できます。`,
    },
    notFound: {
        chatYouLookingForCannotBeFound: 'お探しのチャットが見つかりません。',
        getMeOutOfHere: 'ここから出して',
        iouReportNotFound: 'お探しの支払い詳細が見つかりません。',
        notHere: 'うーん…ここにはありません',
        pageNotFound: 'おっと、このページは見つかりませんでした',
        noAccess: 'このチャットまたは経費は削除されたか、あなたにはアクセス権がありません。\n\nご不明な点がありましたら concierge@expensify.com までお問い合わせください。',
        goBackHome: 'ホームページに戻る',
        commentYouLookingForCannotBeFound: 'お探しのコメントが見つかりません。',
        goToChatInstead: '代わりにチャットに移動してください。',
        contactConcierge: 'ご不明な点がございましたら、concierge@expensify.com までお問い合わせください',
    },
    errorPage: {
        title: ({isBreakLine}: {isBreakLine: boolean}) => `おっと… ${isBreakLine ? '\n' : ''}問題が発生しました`,
        subtitle: 'リクエストを完了できませんでした。後でもう一度お試しください。',
        wrongTypeSubtitle: 'その検索は無効です。検索条件を調整してもう一度お試しください。',
    },
    setPasswordPage: {
        enterPassword: 'パスワードを入力してください',
        setPassword: 'パスワードを設定',
        newPasswordPrompt: 'パスワードは、8文字以上で、大文字1文字、小文字1文字、数字1文字を含める必要があります。',
        passwordFormTitle: 'New Expensify へおかえりなさい！パスワードを設定してください。',
        passwordNotSet: '新しいパスワードを設定できませんでした。再試行用の新しいパスワードリンクをお送りしました。',
        setPasswordLinkInvalid: 'このパスワード設定リンクは無効か、有効期限が切れています。新しいリンクをメール受信ボックスにお送りしました。',
        validateAccount: 'アカウントを確認',
    },
    statusPage: {
        status: 'ステータス',
        statusExplanation: '同僚や友人に状況を簡単に伝えられるよう、絵文字を追加しましょう。必要であれば、メッセージを追加することもできます！',
        today: '今日',
        clearStatus: 'ステータスをクリア',
        save: '保存',
        message: 'メッセージ',
        timePeriods: {
            never: 'しない',
            thirtyMinutes: '30 分',
            oneHour: '1時間',
            afterToday: '今日',
            afterWeek: '1 週間',
            custom: 'カスタム',
        },
        untilTomorrow: '明日まで',
        untilTime: ({time}: UntilTimeParams) => `${time} まで`,
        date: '日付',
        time: '時間',
        clearAfter: '以降をクリア',
        whenClearStatus: 'ステータスをいつ消去しますか？',
        vacationDelegate: '休暇代理人',
        setVacationDelegate: `休暇中に自分の代わりにレポートを承認してもらえる代理人を設定します。`,
        vacationDelegateError: '休暇代理人の更新中にエラーが発生しました。',
        asVacationDelegate: ({nameOrEmail}: VacationDelegateParams) => `${nameOrEmail} の休暇代理として`,
        toAsVacationDelegate: ({submittedToName, vacationDelegateName}: SubmittedToVacationDelegateParams) => `${vacationDelegateName} の休暇代理として ${submittedToName} へ`,
        vacationDelegateWarning: ({nameOrEmail}: VacationDelegateParams) =>
            `${nameOrEmail} を休暇代理人として割り当てようとしています。このユーザーは、まだすべてのワークスペースに参加していません。続行すると、ワークスペースのすべての管理者に、このユーザーを追加するようメールが送信されます。`,
    },
    stepCounter: ({step, total, text}: StepCounterParams) => {
        let result = `ステップ ${step}`;
        if (total) {
            result = `${result} of ${total}`;
        }
        if (text) {
            result = `${result}: ${text}`;
        }
        return result;
    },
    bankAccount: {
        bankInfo: '銀行情報',
        confirmBankInfo: '銀行口座情報を確認',
        manuallyAdd: '銀行口座を手動で追加',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        accountEnding: 'Account ending in',
        thisBankAccount: 'この銀行口座は、ワークスペースでのビジネス支払いに使用されます',
        accountNumber: '口座番号',
        routingNumber: 'ルーティング番号',
        chooseAnAccountBelow: '下からアカウントを選択してください',
        addBankAccount: '銀行口座を追加',
        chooseAnAccount: 'アカウントを選択',
        connectOnlineWithPlaid: '銀行にログイン',
        connectManually: '手動で接続',
        desktopConnection: '注：Chase、Wells Fargo、Capital One、または Bank of America と接続するには、こちらをクリックしてブラウザでこの手続きを完了してください。',
        yourDataIsSecure: 'お客様のデータは安全です',
        toGetStarted: '1 か所から経費の払い戻し、Expensify Card の発行、請求書の支払い回収、請求書支払を行うために、銀行口座を追加してください。',
        plaidBodyCopy: '従業員が会社の経費を支払うことも、立替分を精算してもらうことも、より簡単にできる方法を提供しましょう。',
        checkHelpLine: '口座の小切手に、ルーティング番号と口座番号が記載されています。',
        hasPhoneLoginError: ({contactMethodRoute}: ContactMethodParams) =>
            `銀行口座を連携するには、まず<a href="${contactMethodRoute}">メールアドレスをプライマリログインとして追加</a>してから、もう一度お試しください。電話番号はセカンダリログインとして追加できます。`,
        hasBeenThrottledError: '銀行口座の追加中にエラーが発生しました。数分待ってから、もう一度お試しください。',
        hasCurrencyError: ({workspaceRoute}: WorkspaceRouteParams) =>
            `おっと！ワークスペースの通貨がUSDとは異なる通貨に設定されているようです。続行するには、<a href="${workspaceRoute}">ワークスペース設定</a>で通貨をUSDに変更してから、もう一度お試しください。`,
        bbaAdded: 'ビジネス銀行口座を追加しました！',
        bbaAddedDescription: '支払いに利用できるようになりました。',
        error: {
            youNeedToSelectAnOption: '続行するオプションを選択してください',
            noBankAccountAvailable: '申し訳ありませんが、利用できる銀行口座がありません',
            noBankAccountSelected: 'アカウントを選択してください',
            taxID: '有効な納税者番号を入力してください',
            website: '有効なウェブサイトを入力してください',
            zipCode: `有効なZIPコードを、次の形式で入力してください：${CONST.COUNTRY_ZIP_REGEX_DATA.US.samples}`,
            phoneNumber: '有効な電話番号を入力してください',
            email: '有効なメールアドレスを入力してください',
            companyName: '有効な会社名を入力してください',
            addressCity: '有効な市区町村名を入力してください',
            addressStreet: '有効な番地・住所を入力してください',
            addressState: '有効な州を選択してください',
            incorporationDateFuture: '設立日は未来の日付にすることはできません',
            incorporationState: '有効な州を選択してください',
            industryCode: '有効な6桁の産業分類コードを入力してください',
            restrictedBusiness: 'そのビジネスが、制限対象ビジネス一覧に含まれていないことを確認してください',
            routingNumber: '有効なルーティング番号を入力してください',
            accountNumber: '有効な口座番号を入力してください',
            routingAndAccountNumberCannotBeSame: '経路番号と口座番号を同じにすることはできません',
            companyType: '有効な会社の種類を選択してください',
            tooManyAttempts: 'ログイン試行回数が多すぎるため、このオプションは24時間無効になっています。後でもう一度お試しいただくか、代わりに詳細を手動で入力してください。',
            address: '有効な住所を入力してください',
            dob: '有効な生年月日を選択してください',
            age: '18歳以上である必要があります',
            ssnLast4: 'SSNの下4桁を正しく入力してください',
            firstName: '有効な名を入力してください',
            lastName: '有効な姓を入力してください',
            noDefaultDepositAccountOrDebitCardAvailable: 'デフォルトの入金口座またはデビットカードを追加してください',
            validationAmounts: '入力された検証用金額が正しくありません。銀行口座の明細書をもう一度確認してから、再度お試しください。',
            fullName: '有効な氏名を入力してください',
            ownershipPercentage: '有効なパーセント値を入力してください',
            deletePaymentBankAccount: 'この銀行口座は、Expensify Card の支払いに使用されているため削除できません。この口座を削除したい場合は、Concierge までお問い合わせください。',
        },
    },
    addPersonalBankAccount: {
        countrySelectionStepHeader: '銀行口座はどこにありますか？',
        accountDetailsStepHeader: 'あなたのアカウントの詳細は何ですか？',
        accountTypeStepHeader: 'これはどの種類のアカウントですか？',
        bankInformationStepHeader: 'あなたの銀行口座の詳細は何ですか？',
        accountHolderInformationStepHeader: '口座名義人の詳細は何ですか？',
        howDoWeProtectYourData: 'お客様のデータをどのように保護していますか？',
        currencyHeader: '銀行口座の通貨は何ですか？',
        confirmationStepHeader: '情報を確認してください。',
        confirmationStepSubHeader: '以下の詳細を再確認し、規約のチェックボックスをオンにして確定してください。',
    },
    addPersonalBankAccountPage: {
        enterPassword: 'Expensifyのパスワードを入力',
        alreadyAdded: 'このアカウントは既に追加されています。',
        chooseAccountLabel: 'アカウント',
        successTitle: '個人銀行口座を追加しました！',
        successMessage: '銀行口座の設定が完了し、精算の受け取り準備が整いました。',
    },
    attachmentView: {
        unknownFilename: '不明なファイル名',
        passwordRequired: 'パスワードを入力してください',
        passwordIncorrect: 'パスワードが正しくありません。もう一度お試しください。',
        failedToLoadPDF: 'PDFファイルを読み込めませんでした',
        pdfPasswordForm: {
            title: 'パスワード保護付きPDF',
            infoText: 'このPDFはパスワードで保護されています。',
            beforeLinkText: 'お願いします',
            linkText: 'パスワードを入力してください',
            afterLinkText: '表示するには',
            formLabel: 'PDF を表示',
        },
        attachmentNotFound: '添付ファイルが見つかりません',
        retry: '再試行',
    },
    messages: {
        errorMessageInvalidPhone: `括弧やハイフンを使わずに有効な電話番号を入力してください。米国外からの場合は、国番号を含めて入力してください（例：${CONST.EXAMPLE_PHONE_NUMBER}）。`,
        errorMessageInvalidEmail: '無効なメールアドレス',
        userIsAlreadyMember: ({login, name}: UserIsAlreadyMemberParams) => `${login} はすでに ${name} のメンバーです`,
    },
    onfidoStep: {
        acceptTerms: 'Expensifyウォレットの有効化リクエストを続行することにより、お客様は以下を読み、理解し、承諾したものとみなされます',
        facialScan: 'Onfido 顔認証ポリシーおよび同意書',
        tryAgain: '再試行',
        verifyIdentity: '本人確認',
        letsVerifyIdentity: '本人確認をしましょう',
        butFirst: `でもまずは、退屈な内容から。次のステップで法律関連の文言をよく読んで、準備ができたら「同意する」をクリックしてください。`,
        genericError: 'このステップの処理中にエラーが発生しました。もう一度お試しください。',
        cameraPermissionsNotGranted: 'カメラへのアクセスを有効にする',
        cameraRequestMessage: '銀行口座の確認を完了するには、カメラへのアクセス許可が必要です。設定 > New Expensify から有効にしてください。',
        microphonePermissionsNotGranted: 'マイクへのアクセスを有効にする',
        microphoneRequestMessage: '銀行口座の認証を完了するには、マイクへのアクセス許可が必要です。設定 > New Expensify から有効にしてください。',
        originalDocumentNeeded: 'スクリーンショットやスキャン画像ではなく、ID の原本を撮影した画像をアップロードしてください。',
        documentNeedsBetterQuality:
            'ご提示いただいた身分証明書は、破損しているか、必要なセキュリティ要素が欠けているようです。損傷がなく、全体がはっきりと写っている身分証明書の原本画像をアップロードしてください。',
        imageNeedsBetterQuality: 'ご本人確認書類の画像品質に問題があります。書類全体がはっきりと確認できる新しい画像をアップロードしてください。',
        selfieIssue: 'あなたのセルフィー／動画に問題があります。ライブのセルフィー／動画をアップロードしてください。',
        selfieNotMatching: '自撮り写真／動画が本人確認書類と一致しません。顔がはっきりと写っている新しい自撮り写真／動画をアップロードしてください。',
        selfieNotLive: 'あなたのセルフィー／動画がライブ写真／動画ではないようです。ライブセルフィー／動画をアップロードしてください。',
    },
    additionalDetailsStep: {
        headerTitle: '追加の詳細',
        helpText: 'ウォレットから送金および受け取りを行う前に、次の情報を確認する必要があります。',
        helpTextIdologyQuestions: 'あなたの本人確認を完了するために、あと数問だけ質問させてください。',
        helpLink: 'なぜこれが必要なのか詳しく見る',
        legalFirstNameLabel: '法的な名',
        legalMiddleNameLabel: '法的なミドルネーム',
        legalLastNameLabel: '法的な姓',
        selectAnswer: '続行するには応答を選択してください',
        ssnFull9Error: '有効な9桁のSSNを入力してください',
        needSSNFull9: 'SSN の確認に問題が発生しています。SSN の 9 桁すべてを入力してください。',
        weCouldNotVerify: '確認できませんでした',
        pleaseFixIt: '続行する前にこの情報を修正してください',
        failedKYCMessage: ({conciergeEmail}: {conciergeEmail: string}) =>
            `お客様の本人確認ができませんでした。時間をおいてもう一度お試しいただくか、ご不明な点がある場合は <a href="mailto:${conciergeEmail}">${conciergeEmail}</a> までお問い合わせください。`,
    },
    termsStep: {
        headerTitle: '利用規約と手数料',
        headerTitleRefactor: '手数料と利用規約',
        haveReadAndAgreePlain: '電子開示の受領に同意し、内容を読みました。',
        haveReadAndAgree: `私は、<a href="${CONST.ELECTRONIC_DISCLOSURES_URL}">電子開示書類</a>を受け取ることを読み、同意しました。`,
        agreeToThePlain: 'プライバシーおよびウォレット利用規約に同意します。',
        agreeToThe: ({walletAgreementUrl}: WalletAgreementParams) =>
            `<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシー</a>および<a href="${walletAgreementUrl}">ウォレット規約</a>に同意します。`,
        enablePayments: '支払いを有効にする',
        monthlyFee: '月額料金',
        inactivity: '非アクティブ',
        noOverdraftOrCredit: '当座貸越／クレジット機能はありません。',
        electronicFundsWithdrawal: '電子資金引き落とし',
        standard: '標準',
        reviewTheFees: 'いくつかの手数料を確認しましょう。',
        checkTheBoxes: '以下のボックスにチェックを入れてください。',
        agreeToTerms: '利用規約に同意すれば、すぐに始められます！',
        shortTermsForm: {
            expensifyPaymentsAccount: ({walletProgram}: WalletProgramParams) => `Expensifyウォレットは${walletProgram}によって発行されています。`,
            perPurchase: '購入ごと',
            atmWithdrawal: 'ATM引き出し',
            cashReload: '現金チャージ',
            inNetwork: 'ネットワーク内',
            outOfNetwork: 'ネットワーク外',
            atmBalanceInquiry: 'ATM残高照会（提携ATM／非提携ATM）',
            customerService: 'カスタマーサービス（自動応答またはオペレーター）',
            inactivityAfterTwelveMonths: '非アクティブ（12か月間取引がない場合）',
            weChargeOneFee: '他に1種類の手数料を請求します。内容は次のとおりです。',
            fdicInsurance: 'あなたの資金はFDIC保険の対象です。',
            generalInfo: `プリペイド口座に関する一般的な情報については、<a href="${CONST.CFPB_PREPAID_URL}">${CONST.TERMS.CFPB_PREPAID}</a>をご覧ください。`,
            conditionsDetails: `すべての手数料およびサービスの詳細と条件については、<a href="${CONST.FEES_URL}">${CONST.FEES_URL}</a> をご覧いただくか、+1 833-400-0904 までお電話ください。`,
            electronicFundsWithdrawalInstant: '電子資金引き落とし（即時）',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `(最小 ${amount})`,
        },
        longTermsForm: {
            listOfAllFees: 'すべての Expensify Wallet 手数料の一覧',
            typeOfFeeHeader: 'すべての手数料',
            feeAmountHeader: '金額',
            moreDetailsHeader: '詳細',
            openingAccountTitle: 'アカウントの開設',
            openingAccountDetails: '口座を開設する際の手数料はかかりません。',
            monthlyFeeDetails: '月額料金はかかりません。',
            customerServiceTitle: 'カスタマーサービス',
            customerServiceDetails: 'カスタマーサービス料金は一切かかりません。',
            inactivityDetails: '非アクティブ料金はかかりません。',
            sendingFundsTitle: '別のアカウント保有者への送金',
            sendingFundsDetails: '残高、銀行口座、またはデビットカードを使用して、別のアカウント保有者に送金しても手数料はかかりません。',
            electronicFundsStandardDetails: '標準オプションを使用してExpensifyウォレットから銀行口座へ資金を振り込む場合、手数料はかかりません。通常、この振込は1～3営業日以内に完了します。',
            electronicFundsInstantDetails: ({percentage, amount}: ElectronicFundsParams) =>
                '即時振込オプションを使用して、Expensify Wallet からリンク済みデビットカードへ資金を振り替える場合、手数料が発生します。この振込は通常、数分以内に完了します。' +
                `手数料は振込金額の${percentage}%（最低手数料は${amount}）です。`,
            fdicInsuranceBancorp: ({amount}: TermsParams) =>
                `あなたの資金はFDIC保険の対象です。あなたの資金は、FDIC保険に加入している金融機関である${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK}に保管されるか、そこへ送金されます。` +
                `その口座に移された資金は、所定の預金保険の要件を満たし、かつカードが登録されている場合に限り、${CONST.WALLET.PROGRAM_ISSUERS.BANCORP_BANK} が破綻したときでも、FDIC により ${amount} まで保険が適用されます。詳しくは ${CONST.TERMS.FDIC_PREPAID} をご覧ください。`,
            contactExpensifyPayments: `+1 833-400-0904 に電話するか、メール（${CONST.EMAIL.CONCIERGE}）で ${CONST.WALLET.PROGRAM_ISSUERS.EXPENSIFY_PAYMENTS} に連絡するか、または ${CONST.NEW_EXPENSIFY_URL} にサインインしてください。`,
            generalInformation: `プリペイド口座に関する一般的な情報については、${CONST.TERMS.CFPB_PREPAID} をご覧ください。プリペイド口座に関する苦情がある場合は、消費者金融保護局（Consumer Financial Protection Bureau）に 1-855-411-2372 までお電話いただくか、${CONST.TERMS.CFPB_COMPLAINT} をご覧ください。`,
            printerFriendlyView: '印刷用バージョンを表示',
            automated: '自動',
            liveAgent: 'ライブ担当エージェント',
            instant: '即時',
            electronicFundsInstantFeeMin: ({amount}: TermsParams) => `最低 ${amount}`,
        },
    },
    activateStep: {
        headerTitle: '支払いを有効にする',
        activatedTitle: 'ウォレットが有効になりました！',
        activatedMessage: 'おめでとうございます。ウォレットの設定が完了し、支払いの準備ができました。',
        checkBackLaterTitle: '少々お待ちください…',
        checkBackLaterMessage: 'お客様の情報は現在確認中です。後ほどもう一度ご確認ください。',
        continueToPayment: '支払いへ進む',
        continueToTransfer: '送金を続行',
    },
    companyStep: {
        headerTitle: '会社情報',
        subtitle: 'もう少しで完了です！セキュリティ保護のため、いくつかの情報を確認する必要があります。',
        legalBusinessName: '法人名',
        companyWebsite: '会社のウェブサイト',
        taxIDNumber: '納税者番号',
        taxIDNumberPlaceholder: '9 桁',
        companyType: '会社の種類',
        incorporationDate: '設立日',
        incorporationState: '法人設立州',
        industryClassificationCode: '業種分類コード',
        confirmCompanyIsNot: 'この会社が次の対象ではないことを確認します',
        listOfRestrictedBusinesses: '制限対象ビジネスの一覧',
        incorporationDatePlaceholder: '開始日 (yyyy-mm-dd)',
        incorporationTypes: {
            LLC: 'LLC',
            CORPORATION: '法人',
            PARTNERSHIP: 'パートナーシップ',
            COOPERATIVE: '協力的',
            SOLE_PROPRIETORSHIP: '個人事業主',
            OTHER: 'その他',
        },
        industryClassification: 'このビジネスはどの業種に分類されますか？',
        industryClassificationCodePlaceholder: '業種分類コードを検索',
    },
    requestorStep: {
        headerTitle: '個人情報',
        learnMore: '詳細はこちら',
        isMyDataSafe: '私のデータは安全ですか？',
    },
    personalInfoStep: {
        personalInfo: '個人情報',
        enterYourLegalFirstAndLast: '法的な氏名は何ですか？',
        legalFirstName: '法的な名',
        legalLastName: '法的な姓',
        legalName: '法的氏名',
        enterYourDateOfBirth: '生年月日はいつですか？',
        enterTheLast4: 'あなたの社会保障番号の下4桁を入力してください。',
        dontWorry: 'ご安心ください、個人の信用調査は一切行いません。',
        last4SSN: 'SSNの下4桁',
        enterYourAddress: 'あなたの住所は何ですか？',
        address: '住所',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        byAddingThisBankAccount: 'この銀行口座を追加することで、お客様は以下を読み、理解し、同意したことを確認します',
        whatsYourLegalName: '法的氏名は何ですか？',
        whatsYourDOB: 'あなたの生年月日はいつですか？',
        whatsYourAddress: 'あなたの住所は何ですか？',
        whatsYourSSN: 'あなたの社会保障番号の下4桁を入力してください。',
        noPersonalChecks: 'ご安心ください。ここでは個人の信用情報の審査は一切行いません！',
        whatsYourPhoneNumber: '電話番号を教えてください。',
        weNeedThisToVerify: 'ウォレットを確認するためにこれが必要です。',
    },
    businessInfoStep: {
        businessInfo: '会社情報',
        enterTheNameOfYourBusiness: 'あなたの会社名は何ですか？',
        businessName: '法人名',
        enterYourCompanyTaxIdNumber: '御社の税務ID番号は何ですか？',
        taxIDNumber: '納税者番号',
        taxIDNumberPlaceholder: '9 桁',
        enterYourCompanyWebsite: 'あなたの会社のウェブサイトは何ですか？',
        companyWebsite: '会社のウェブサイト',
        enterYourCompanyPhoneNumber: '御社の電話番号は何ですか？',
        enterYourCompanyAddress: '御社の住所はどこですか？',
        selectYourCompanyType: 'どのような種類の会社ですか？',
        companyType: '会社の種類',
        incorporationType: {
            LLC: 'LLC',
            CORPORATION: '法人',
            PARTNERSHIP: 'パートナーシップ',
            COOPERATIVE: '協力的',
            SOLE_PROPRIETORSHIP: '個人事業主',
            OTHER: 'その他',
        },
        selectYourCompanyIncorporationDate: '会社の法人設立日はいつですか？',
        incorporationDate: '設立日',
        incorporationDatePlaceholder: '開始日 (yyyy-mm-dd)',
        incorporationState: '法人設立州',
        pleaseSelectTheStateYourCompanyWasIncorporatedIn: '御社はどの州で法人登記されましたか？',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        companyAddress: '会社住所',
        listOfRestrictedBusinesses: '制限対象ビジネスの一覧',
        confirmCompanyIsNot: 'この会社が次の対象ではないことを確認します',
        businessInfoTitle: 'ビジネス情報',
        legalBusinessName: '法人名',
        whatsTheBusinessName: '会社名は何ですか？',
        whatsTheBusinessAddress: '会社の住所は何ですか？',
        whatsTheBusinessContactInformation: 'ビジネスの連絡先情報は何ですか？',
        whatsTheBusinessRegistrationNumber: ({country}: BusinessRegistrationNumberParams) => {
            switch (country) {
                case CONST.COUNTRY.GB:
                    return '会社登録番号（CRN）とは何ですか？';
                default:
                    return '事業登録番号とは何ですか？';
            }
        },
        whatsTheBusinessTaxIDEIN: ({country}: BusinessTaxIDParams) => {
            switch (country) {
                case CONST.COUNTRY.US:
                    return '雇用主識別番号（EIN）とは何ですか？';
                case CONST.COUNTRY.CA:
                    return '事業番号（BN）とは何ですか？';
                case CONST.COUNTRY.GB:
                    return 'VAT登録番号（VRN）とは何ですか？';
                case CONST.COUNTRY.AU:
                    return 'オーストラリア事業番号（ABN）とは何ですか？';
                default:
                    return 'EU VAT番号とは何ですか？';
            }
        },
        whatsThisNumber: 'この番号は何ですか？',
        whereWasTheBusinessIncorporated: 'その事業はどこで法人化されましたか？',
        whatTypeOfBusinessIsIt: 'どのような種類のビジネスですか？',
        whatsTheBusinessAnnualPayment: 'そのビジネスの年間決済額はいくらですか？',
        whatsYourExpectedAverageReimbursements: '想定される平均の精算金額はいくらですか？',
        registrationNumber: '登録番号',
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
                    return 'EU VAT';
            }
        },
        businessAddress: '勤務先住所',
        businessType: '事業種別',
        incorporation: '法人設立',
        incorporationCountry: '法人設立国',
        incorporationTypeName: '法人形態',
        businessCategory: 'ビジネスカテゴリ',
        annualPaymentVolume: '年間支払額',
        annualPaymentVolumeInCurrency: ({currencyCode}: CurrencyCodeParams) => `${currencyCode}での年間支払額`,
        averageReimbursementAmount: '平均精算額',
        averageReimbursementAmountInCurrency: ({currencyCode}: CurrencyCodeParams) => `${currencyCode}での平均払い戻し額`,
        selectIncorporationType: '法人形態を選択',
        selectBusinessCategory: 'ビジネスカテゴリを選択',
        selectAnnualPaymentVolume: '年間支払額を選択',
        selectIncorporationCountry: '設立国を選択',
        selectIncorporationState: '法人設立州を選択',
        selectAverageReimbursement: '平均払い戻し額を選択',
        selectBusinessType: 'ビジネスタイプを選択',
        findIncorporationType: '法人種別を検索',
        findBusinessCategory: 'ビジネスカテゴリを検索',
        findAnnualPaymentVolume: '年間支払額を見つける',
        findIncorporationState: '法人登録州を検索',
        findAverageReimbursement: '平均精算額を表示',
        findBusinessType: '事業形態を検索',
        error: {
            registrationNumber: '有効な登録番号を入力してください',
            taxIDEIN: ({country}: BusinessTaxIDParams) => {
                switch (country) {
                    case CONST.COUNTRY.US:
                        return '有効な雇用者識別番号（EIN）を入力してください';
                    case CONST.COUNTRY.CA:
                        return '有効な事業番号（BN）を入力してください';
                    case CONST.COUNTRY.GB:
                        return '有効な VAT 登録番号（VRN）を入力してください';
                    case CONST.COUNTRY.AU:
                        return '有効なオーストラリア事業番号（ABN）を入力してください';
                    default:
                        return '有効な EU VAT 番号を入力してください';
                }
            },
        },
    },
    beneficialOwnerInfoStep: {
        doYouOwn25percent: ({companyName}: CompanyNameParams) => `${companyName} の25％以上を所有していますか？`,
        doAnyIndividualOwn25percent: ({companyName}: CompanyNameParams) => `${companyName} の25％以上を所有している個人はいますか？`,
        areThereMoreIndividualsWhoOwn25percent: ({companyName}: CompanyNameParams) => `${companyName} の25％以上を所有している個人は、ほかにもいますか？`,
        regulationRequiresUsToVerifyTheIdentity: '規制により、事業の25％を超えて所有している個人の身元を確認することが求められています。',
        companyOwner: '事業主',
        enterLegalFirstAndLastName: '所有者の法的氏名は何ですか？',
        legalFirstName: '法的な名',
        legalLastName: '法的な姓',
        enterTheDateOfBirthOfTheOwner: 'オーナーの生年月日はいつですか？',
        enterTheLast4: '所有者の社会保障番号の下4桁を入力してください。',
        last4SSN: 'SSNの下4桁',
        dontWorry: 'ご安心ください、個人の信用調査は一切行いません。',
        enterTheOwnersAddress: 'オーナーの住所は何ですか？',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        legalName: '法的氏名',
        address: '住所',
        byAddingThisBankAccount: 'この銀行口座を追加することで、お客様は以下を読み、理解し、同意したことを確認します',
        owners: 'オーナー',
    },
    ownershipInfoStep: {
        ownerInfo: 'オーナー情報',
        businessOwner: '事業主',
        signerInfo: '署名者情報',
        doYouOwn: ({companyName}: CompanyNameParams) => `${companyName} の25％以上を所有していますか？`,
        doesAnyoneOwn: ({companyName}: CompanyNameParams) => `${companyName} の25％以上を所有している個人はいますか？`,
        regulationsRequire: '規制により、事業の持分を25％超所有しているすべての個人の本人確認を行うことが求められています。',
        legalFirstName: '法的な名',
        legalLastName: '法的な姓',
        whatsTheOwnersName: '所有者の法的氏名は何ですか？',
        whatsYourName: '法的な氏名は何ですか？',
        whatPercentage: 'ビジネスのうち、オーナーが所有している割合はどのくらいですか？',
        whatsYoursPercentage: 'あなたは事業の何パーセントを所有していますか？',
        ownership: '所有権',
        whatsTheOwnersDOB: 'オーナーの生年月日はいつですか？',
        whatsYourDOB: '生年月日はいつですか？',
        whatsTheOwnersAddress: 'オーナーの住所は何ですか？',
        whatsYourAddress: 'あなたの住所は何ですか？',
        whatAreTheLast: 'オーナーの社会保障番号の下4桁は何ですか？',
        whatsYourLast: 'あなたの社会保障番号の下4桁を入力してください。',
        whatsYourNationality: 'あなたの国籍はどこですか？',
        whatsTheOwnersNationality: '所有者の市民権を持つ国はどこですか？',
        countryOfCitizenship: '市民権のある国',
        dontWorry: 'ご安心ください、個人の信用調査は一切行いません。',
        last4: 'SSNの下4桁',
        whyDoWeAsk: 'なぜこの情報が必要なのですか？',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        legalName: '法的氏名',
        ownershipPercentage: '持分比率',
        areThereOther: ({companyName}: CompanyNameParams) => `${companyName} の25％以上を所有している他の個人はいますか？`,
        owners: 'オーナー',
        addCertified: '実質的支配者を示す認定組織図を追加する',
        regulationRequiresChart: '規制により、事業の25％以上を所有するすべての個人または法人を示した、所有構成図の認証コピーを収集することが求められています。',
        uploadEntity: '事業体の所有構成図をアップロード',
        noteEntity: '注意：法人所有構成図には、会計士、法律顧問の署名、または公証が必要です。',
        certified: '認定済み事業体所有構成図',
        selectCountry: '国を選択',
        findCountry: '国を検索',
        address: '住所',
        chooseFile: 'ファイルを選択',
        uploadDocuments: '追加の書類をアップロード',
        pleaseUpload: 'ビジネス事業体の直接または間接の所有者として25％以上を保有していることを確認するため、下記より追加の書類をアップロードしてください。',
        acceptedFiles: '受け付け可能なファイル形式：PDF、PNG、JPEG。各セクションの合計ファイルサイズは 5 MB を超えることはできません。',
        proofOfBeneficialOwner: '実質的所有者の証明',
        proofOfBeneficialOwnerDescription:
            '過去3か月以内の日付が記載され、署名者の免許番号を含む、事業の25％以上の所有権を証明する、公認会計士、公証人、または弁護士による署名付き宣誓書と組織図を提出してください。',
        copyOfID: '実質的所有者の身分証明書のコピー',
        copyOfIDDescription: '例：パスポート、運転免許証など',
        proofOfAddress: '実質的支配者の住所証明',
        proofOfAddressDescription: '例：公共料金の請求書、賃貸契約書など。',
        codiceFiscale: '税コード/納税者ID',
        codiceFiscaleDescription:
            '署名担当者との現地訪問の様子、または録音された通話の動画をアップロードしてください。担当者は、氏名、生年月日、会社名、登録番号、税コード番号、登記住所、事業内容、口座の目的を提示する必要があります。',
    },
    completeVerificationStep: {
        completeVerification: '認証を完了',
        confirmAgreements: '以下の同意事項を確認してください。',
        certifyTrueAndAccurate: '提供した情報が真実かつ正確であることを証明します',
        certifyTrueAndAccurateError: '情報が真実かつ正確であることを証明してください',
        isAuthorizedToUseBankAccount: '私は、このビジネス銀行口座をビジネス支出のために利用する権限を持っています',
        isAuthorizedToUseBankAccountError: 'ビジネス銀行口座を運用する権限を持つ管理責任者である必要があります',
        termsAndConditions: '利用規約',
    },
    connectBankAccountStep: {
        validateYourBankAccount: '銀行口座を認証する',
        validateButtonText: '検証',
        validationInputLabel: '取引',
        maxAttemptsReached: '誤った試行が多すぎるため、この銀行口座の認証は無効になっています。',
        description: `1～2営業日以内に、「Expensify, Inc. Validation」などの名義から、少額の取引を3件、お客様の銀行口座に送金します。`,
        descriptionCTA: '各取引の金額を下のフィールドに入力してください。例：1.51',
        letsChatText: 'あと少しです！チャットで最後にいくつかの情報を確認するお手伝いをお願いします。準備はいいですか？',
        enable2FATitle: '不正利用を防ぐため、二要素認証（2FA）を有効にする',
        enable2FAText: 'お客様のセキュリティを重要視しています。アカウントをより強力に保護するため、今すぐ2要素認証（2FA）を設定してください。',
        secureYourAccount: 'アカウントを保護する',
    },
    countryStep: {
        confirmBusinessBank: 'ビジネス銀行口座の通貨と国を確認',
        confirmCurrency: '通貨と国を確認',
        yourBusiness: 'ビジネス用銀行口座の通貨は、ワークスペースの通貨と一致している必要があります。',
        youCanChange: 'ワークスペースの通貨は、次の場所で変更できます',
        findCountry: '国を検索',
        selectCountry: '国を選択',
    },
    bankInfoStep: {
        whatAreYour: 'あなたのビジネス用銀行口座の詳細は何ですか？',
        letsDoubleCheck: 'すべて問題なく見えるか、もう一度確認しましょう。',
        thisBankAccount: 'この銀行口座は、ワークスペースでのビジネス支払いに使用されます',
        accountNumber: '口座番号',
        accountHolderNameDescription: '承認署名者の氏名',
    },
    signerInfoStep: {
        signerInfo: '署名者情報',
        areYouDirector: ({companyName}: CompanyNameParams) => `${companyName} のディレクターですか？`,
        regulationRequiresUs: '規制により、署名者が事業者を代表してこの操作を行う権限を有しているかどうかを確認する必要があります。',
        whatsYourName: '法的氏名は何ですか',
        fullName: '法的氏名',
        whatsYourJobTitle: 'あなたの職種（役職）は何ですか？',
        jobTitle: '職種',
        whatsYourDOB: '生年月日はいつですか？',
        uploadID: '本人確認書類と住所証明書をアップロード',
        personalAddress: '住所証明書（例：公共料金の請求書など）',
        letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
        legalName: '法的氏名',
        proofOf: '個人住所の証明',
        enterOneEmail: ({companyName}: CompanyNameParams) => `${companyName} の役員のメールアドレスを入力してください`,
        regulationRequiresOneMoreDirector: '規制により、署名者として最低でももう一人の取締役が必要です。',
        hangTight: '少々お待ちください…',
        enterTwoEmails: ({companyName}: CompanyNameParams) => `${companyName} の取締役2名のメールアドレスを入力してください`,
        sendReminder: 'リマインダーを送信',
        chooseFile: 'ファイルを選択',
        weAreWaiting: '現在、他の取締役としての本人確認が完了するのをお待ちしています。',
        id: '身分証のコピー',
        proofOfDirectors: '取締役の証明書',
        proofOfDirectorsDescription: '例：Oncorp Corporate Profile または Business Registration',
        codiceFiscale: '納税者コード',
        codiceFiscaleDescription: '署名者、権限保有ユーザー、および実質的支配者のための Codice Fiscale。',
        PDSandFSG: 'PDS + FSG 開示書類',
        PDSandFSGDescription: dedent(`
            Expensify でのグローバル払い戻し機能を実現するために、Corpay との提携では API 接続を利用して、同社が有する広範な国際銀行パートナーネットワークを活用しています。オーストラリアの規制に基づき、Corpay の金融サービスガイド（FSG）およびプロダクト開示文書（PDS）をお渡しします。

            FSG および PDS には、Corpay が提供する商品およびサービスの詳細と重要な情報が記載されていますので、よくお読みください。今後の参考のため、これらの文書は保管しておいてください。
        `),
        pleaseUpload: 'あなたが事業の取締役であることを確認するため、追加の書類を下からアップロードしてください。',
        enterSignerInfo: '署名者情報を入力',
        thisStep: 'このステップは完了しました',
        isConnecting: ({bankAccountLastFour, currency}: SignerInfoMessageParams) =>
            `は、${currency}建ての末尾が${bankAccountLastFour}のビジネス銀行口座をExpensifyに接続し、${currency}で従業員へ支払う設定を行っています。次のステップでは、取締役の署名者情報が必要です。`,
        error: {
            emailsMustBeDifferent: 'メールアドレスが同じにならないようにしてください',
        },
    },
    agreementsStep: {
        agreements: '合意事項',
        pleaseConfirm: '以下の契約内容をご確認ください',
        regulationRequiresUs: '規制により、事業の25％を超えて所有している個人の身元を確認することが求められています。',
        iAmAuthorized: '私は、ビジネス支出のためにそのビジネス銀行口座を使用する権限を持っています。',
        iCertify: '提供された情報が真実かつ正確であることを証明します。',
        iAcceptTheTermsAndConditions: `私は<a href="https://cross-border.corpay.com/tc/">利用規約と条件</a>に同意します。`,
        iAcceptTheTermsAndConditionsAccessibility: '利用規約に同意します。',
        accept: '銀行口座を承認して追加',
        iConsentToThePrivacyNotice: '私は<a href="https://payments.corpay.com/compliance">プライバシー通知</a>に同意します。',
        iConsentToThePrivacyNoticeAccessibility: 'プライバシーに関する通知に同意します。',
        error: {
            authorized: 'ビジネス銀行口座を運用する権限を持つ管理責任者である必要があります',
            certify: '情報が真実かつ正確であることを証明してください',
            consent: 'プライバシーに関する通知に同意してください',
        },
    },
    docusignStep: {
        subheader: 'Docusignフォーム',
        pleaseComplete:
            '以下のDocuSignリンクからACH承認フォームにご記入のうえ署名し、その署名済みコピーをこちらにアップロードしてください。これにより、弊社があなたの銀行口座から直接資金を引き出せるようになります。',
        pleaseCompleteTheBusinessAccount: 'ビジネスアカウント申込の口座振替手続きフォームにご記入ください',
        pleaseCompleteTheDirect:
            '下の DocuSign リンクを使用して口座振替契約書を完了し、署名済みのコピーをここにアップロードしてください。これにより、お客様の銀行口座から直接資金を引き落とすことができるようになります。',
        takeMeTo: 'DocuSign へ移動',
        uploadAdditional: '追加の書類をアップロード',
        pleaseUpload: 'DEFTフォームとDocusignの署名ページをアップロードしてください',
        pleaseUploadTheDirect: '口座振替契約書とDocuSignの署名ページをアップロードしてください',
    },
    finishStep: {
        letsFinish: 'チャットで完了しましょう！',
        thanksFor:
            '詳細をご提供いただきありがとうございます。専任のサポート担当者が、ただいまお客様の情報を確認しております。追加で必要な情報がある場合は、あらためてご連絡いたしますが、その前でもご不明な点がありましたらいつでもお気軽にお問い合わせください。',
        iHaveA: '質問があります',
        enable2FA: '不正利用を防ぐために二要素認証（2FA）を有効にする',
        weTake: 'お客様のセキュリティを重要視しています。アカウントをより強力に保護するため、今すぐ2要素認証（2FA）を設定してください。',
        secure: 'アカウントを保護する',
    },
    reimbursementAccountLoadingAnimation: {
        oneMoment: '少々お待ちください',
        explanationLine: 'お客様の情報を確認しています。まもなく次のステップに進めるようになります。',
    },
    session: {
        offlineMessageRetry: 'オフラインのようです。接続を確認して、もう一度お試しください。',
    },
    travel: {
        header: '出張を予約',
        title: 'スマートに旅を',
        subtitle: 'Expensify Travel を利用して、最高のお得な旅行オファーを手に入れ、すべてのビジネス経費を一箇所で管理しましょう。',
        features: {
            saveMoney: '予約で節約しましょう',
            alerts: 'リアルタイムの更新とアラートを受け取る',
        },
        bookTravel: '出張を予約',
        bookDemo: 'デモを予約',
        bookADemo: 'デモを予約',
        toLearnMore: '詳細はこちらをご覧ください。',
        termsAndConditions: {
            header: '続ける前に…',
            title: '利用規約',
            label: '利用規約に同意します',
            subtitle: `Expensify Travel の<a href="${CONST.TRAVEL_TERMS_URL}">利用規約</a>に同意してください。`,
            error: '続行するには、Expensify Travel の利用規約に同意する必要があります',
            defaultWorkspaceError:
                'Expensify Travel を有効にするには、デフォルトのワークスペースを設定する必要があります。［設定］＞［ワークスペース］＞ 対象のワークスペース横の縦三点アイコンをクリック ＞［デフォルトのワークスペースに設定］の順に選択してから、もう一度お試しください。',
        },
        flight: 'フライト',
        flightDetails: {
            passenger: '乗客',
            layover: ({layover}: FlightLayoverParams) => `<muted-text-label>このフライトの前に<strong>${layover}の乗り継ぎ時間</strong>があります</muted-text-label>`,
            takeOff: '離陸',
            landing: 'ランディング',
            seat: '席',
            class: 'キャビンクラス',
            recordLocator: '予約番号',
            cabinClasses: {
                unknown: '不明',
                economy: 'エコノミー',
                premiumEconomy: 'プレミアムエコノミー',
                business: 'ビジネス',
                first: '最初',
            },
        },
        hotel: 'ホテル',
        hotelDetails: {
            guest: 'ゲスト',
            checkIn: 'チェックイン',
            checkOut: 'チェックアウト',
            roomType: '部屋タイプ',
            cancellation: 'キャンセルポリシー',
            cancellationUntil: 'まで無料でキャンセル可能',
            confirmation: '確認番号',
            cancellationPolicies: {
                unknown: '不明',
                nonRefundable: '払い戻し不可',
                freeCancellationUntil: 'まで無料でキャンセル可能',
                partiallyRefundable: '一部払い戻し可能',
            },
        },
        car: '車',
        carDetails: {
            rentalCar: 'レンタカー',
            pickUp: '受け取り',
            dropOff: 'ドロップオフ',
            driver: 'ドライバー',
            carType: '車種',
            cancellation: 'キャンセルポリシー',
            cancellationUntil: 'まで無料でキャンセル可能',
            freeCancellation: '無料キャンセル',
            confirmation: '確認番号',
        },
        train: '鉄道',
        trainDetails: {
            passenger: '乗客',
            departs: '出発',
            arrives: '到着',
            coachNumber: '車両番号',
            seat: '席',
            fareDetails: '運賃の詳細',
            confirmation: '確認番号',
        },
        viewTrip: '出張を表示',
        modifyTrip: '出張を変更',
        tripSupport: '出張サポート',
        tripDetails: '出張の詳細',
        viewTripDetails: '旅行の詳細を表示',
        trip: '出張',
        trips: '出張',
        tripSummary: '出張概要',
        departs: '出発',
        errorMessage: '問題が発生しました。後でもう一度お試しください。',
        phoneError: ({phoneErrorMethodsRoute}: PhoneErrorRouteParams) =>
            `<rbr>出張を予約するには、<a href="${phoneErrorMethodsRoute}">勤務先メールアドレスを主なログインとして追加</a>してください。</rbr>`,
        domainSelector: {
            title: 'ドメイン',
            subtitle: 'Expensify Travel のセットアップ用ドメインを選択してください。',
            recommended: 'おすすめ',
        },
        domainPermissionInfo: {
            title: 'ドメイン',
            restriction: ({domain}: DomainPermissionInfoRestrictionParams) =>
                `ドメイン <strong>${domain}</strong> に対して Expensify Travel を有効にする権限がありません。代わりに、そのドメインのユーザーにトラベル機能を有効にしてもらう必要があります。`,
            accountantInvitation: `会計士の方は、このドメインで出張を有効にするために、<a href="${CONST.OLD_DOT_PUBLIC_URLS.EXPENSIFY_APPROVED_PROGRAM_URL}">ExpensifyApproved! 会計士向けプログラム</a>への参加をご検討ください。`,
        },
        publicDomainError: {
            title: 'Expensify Travel を始める',
            message: `Expensify Travel を利用するには、個人用メール（例：name@gmail.com）ではなく、勤務先のメールアドレス（例：name@company.com）を使用する必要があります。`,
        },
        blockedFeatureModal: {
            title: 'Expensify Travelは無効になっています',
            message: `管理者によって Expensify Travel がオフにされています。出張の手配については、会社の予約ポリシーに従ってください。`,
        },
        verifyCompany: {
            title: 'リクエストを確認しています…',
            message: `Expensify Travel をご利用いただく準備が整っているか確認するため、現在こちらでいくつかのチェックを行っています。まもなくご連絡いたします！`,
            confirmText: '了解しました',
            conciergeMessage: ({domain}: {domain: string}) => `ドメイン ${domain} のトラベル有効化に失敗しました。このドメインのトラベル設定を確認し、有効化してください。`,
        },
        updates: {
            bookingTicketed: ({airlineCode, origin, destination, startDate, confirmationID = ''}: FlightParams) =>
                `${startDate}のフライト ${airlineCode}（${origin} → ${destination}）が予約されました。確認コード：${confirmationID}`,
            ticketVoided: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `${startDate}のフライト ${airlineCode}（${origin} → ${destination}）のチケットは無効になりました。`,
            ticketRefunded: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `${startDate}のフライト ${airlineCode}（${origin} → ${destination}）のチケットは、払い戻しまたは変更されています。`,
            flightCancelled: ({airlineCode, origin, destination, startDate}: FlightParams) =>
                `${startDate}} のフライト ${airlineCode}（${origin} → ${destination}）は、航空会社によりキャンセルされました。`,
            flightScheduleChangePending: ({airlineCode}: AirlineParams) => `航空会社がフライト ${airlineCode} のスケジュール変更を提案しました。現在、確認待ちです。`,
            flightScheduleChangeClosed: ({airlineCode, startDate}: AirlineParams) => `スケジュール変更が確定しました：便名 ${airlineCode} の出発時刻は ${startDate} になりました。`,
            flightUpdated: ({airlineCode, origin, destination, startDate}: FlightParams) => `${startDate} のフライト ${airlineCode}（${origin} → ${destination}）が更新されました。`,
            flightCabinChanged: ({airlineCode, cabinClass}: AirlineParams) => `ご利用の客室クラスは、${airlineCode}便で${cabinClass}に更新されました。`,
            flightSeatConfirmed: ({airlineCode}: AirlineParams) => `フライト ${airlineCode} の座席指定が確定しました。`,
            flightSeatChanged: ({airlineCode}: AirlineParams) => `フライト ${airlineCode} の座席指定が変更されました。`,
            flightSeatCancelled: ({airlineCode}: AirlineParams) => `フライト ${airlineCode} の座席指定は削除されました。`,
            paymentDeclined: '航空券の支払いに失敗しました。もう一度お試しください。',
            bookingCancelledByTraveler: ({type, id = ''}: TravelTypeParams) => `${type}の予約 ${id} をキャンセルしました。`,
            bookingCancelledByVendor: ({type, id = ''}: TravelTypeParams) => `ベンダーがあなたの${type}予約${id}をキャンセルしました。`,
            bookingRebooked: ({type, id = ''}: TravelTypeParams) => `あなたの${type}予約は再予約されました。新しい確認番号：${id}。`,
            bookingUpdated: ({type}: TravelTypeParams) => `あなたの${type}予約が更新されました。旅程内の新しい詳細を確認してください。`,
            railTicketRefund: ({origin, destination, startDate}: RailTicketParams) =>
                `${startDate} の ${origin} → ${destination} 行きの鉄道チケットは払い戻しされました。クレジットが処理されます。`,
            railTicketExchange: ({origin, destination, startDate}: RailTicketParams) => `${startDate}の${origin} → ${destination}行きの鉄道チケットは、変更されました。`,
            railTicketUpdate: ({origin, destination, startDate}: RailTicketParams) => `${startDate} の ${origin} → ${destination} の鉄道チケットが更新されました。`,
            defaultUpdate: ({type}: TravelTypeParams) => `${type}の予約が更新されました。`,
        },
        flightTo: '行きのフライト',
        trainTo: '行きの電車',
        carRental: 'レンタカー',
        nightIn: '夜間',
        nightsIn: 'nights in',
    },
    workspace: {
        common: {
            card: 'カード',
            expensifyCard: 'Expensify Card',
            companyCards: '法人カード',
            workflows: 'ワークフロー',
            workspace: 'ワークスペース',
            findWorkspace: 'ワークスペースを検索',
            edit: 'ワークスペースを編集',
            enabled: '有効',
            disabled: '無効',
            everyone: '全員',
            delete: 'ワークスペースを削除',
            settings: '設定',
            reimburse: '精算',
            categories: 'カテゴリー',
            tags: 'タグ',
            customField1: 'カスタムフィールド 1',
            customField2: 'カスタムフィールド 2',
            customFieldHint: 'このメンバーのすべての支出に適用されるカスタムコーディングを追加します。',
            reports: 'レポート',
            reportFields: 'レポートフィールド',
            reportTitle: 'レポートタイトル',
            reportField: 'レポートフィールド',
            taxes: '税金',
            bills: '請求書',
            invoices: '請求書',
            perDiem: '日当',
            travel: '出張',
            members: 'メンバー',
            accounting: '会計',
            receiptPartners: 'レシートパートナー',
            rules: 'ルール',
            displayedAs: '表示形式',
            plan: 'プラン',
            profile: '概要',
            bankAccount: '銀行口座',
            testTransactions: 'テスト取引',
            issueAndManageCards: 'カードの発行と管理',
            reconcileCards: 'カードの照合作業',
            selectAll: 'すべて選択',
            selected: () => ({
                one: '1件選択済み',
                other: (count: number) => `${count} 件選択済み`,
            }),
            settlementFrequency: '決済頻度',
            setAsDefault: 'デフォルトのワークスペースとして設定',
            defaultNote: `${CONST.EMAIL.RECEIPTS} に送信されたレシートは、このワークスペースに表示されます。`,
            deleteConfirmation: 'このワークスペースを削除してもよろしいですか？',
            deleteWithCardsConfirmation: 'このワークスペースを削除してもよろしいですか？すべてのカードフィードと割り当て済みカードが削除されます。',
            unavailable: '利用できないワークスペース',
            memberNotFound: 'メンバーが見つかりません。ワークスペースに新しいメンバーを招待するには、上の招待ボタンを使用してください。',
            notAuthorized: `このページへのアクセス権がありません。このワークスペースに参加しようとしている場合は、ワークスペースのオーナーに依頼してメンバーとして追加してもらってください。別のご用件ですか？${CONST.EMAIL.CONCIERGE} までお問い合わせください。`,
            goToWorkspace: 'ワークスペースに移動',
            duplicateWorkspace: 'ワークスペースを複製',
            duplicateWorkspacePrefix: '重複',
            goToWorkspaces: 'ワークスペースに移動',
            clearFilter: 'フィルターをクリア',
            workspaceName: 'ワークスペース名',
            workspaceOwner: 'オーナー',
            workspaceType: 'ワークスペースの種類',
            workspaceAvatar: 'ワークスペースのアバター',
            mustBeOnlineToViewMembers: 'このワークスペースのメンバーを表示するには、オンラインである必要があります。',
            moreFeatures: 'その他の機能',
            requested: 'リクエスト済み',
            distanceRates: '距離レート',
            defaultDescription: 'すべてのレシートと経費を一箇所で管理。',
            descriptionHint: 'このワークスペースに関する情報をすべてのメンバーと共有します。',
            welcomeNote: '立替精算のため、領収書の提出にはExpensifyをご利用ください。ありがとうございます。',
            subscription: 'サブスクリプション',
            markAsEntered: '手入力としてマーク',
            markAsExported: 'エクスポート済みにする',
            exportIntegrationSelected: ({connectionName}: ExportIntegrationSelectedParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} にエクスポート`,
            letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
            lineItemLevel: '明細レベル',
            reportLevel: 'レポートレベル',
            topLevel: '最上位',
            appliedOnExport: 'Expensify にインポートされておらず、エクスポート時に適用されます',
            shareNote: {
                header: 'ワークスペースを他のメンバーと共有する',
                content: ({adminsRoomLink}: WorkspaceShareNoteParams) =>
                    `このQRコードを共有するか、以下のリンクをコピーして、メンバーがあなたのワークスペースへのアクセスをリクエストしやすいようにしましょう。ワークスペースへの参加リクエストはすべて、あなたが確認できるように <a href="${adminsRoomLink}">${CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS}</a> ルームに表示されます。`,
            },
            connectTo: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} に接続`,
            createNewConnection: '新しい接続を作成',
            reuseExistingConnection: '既存の接続を再利用',
            existingConnections: '既存の接続',
            existingConnectionsDescription: ({connectionName}: ConnectionNameParams) =>
                `以前に${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]}に接続したことがあるため、既存の接続を再利用するか、新しい接続を作成するかを選択できます。`,
            lastSyncDate: ({connectionName, formattedDate}: LastSyncDateParams) => `${connectionName} - 最終同期日 ${formattedDate}`,
            authenticationError: ({connectionName}: AuthenticationErrorParams) => `認証エラーのため、${connectionName} に接続できません。`,
            learnMore: '詳細はこちら',
            memberAlternateText: 'メンバーはレポートを提出および承認できます。',
            adminAlternateText: '管理者は、すべてのレポートおよびワークスペース設定をフルアクセスで編集できます。',
            auditorAlternateText: '監査担当者はレポートを閲覧し、コメントすることができます。',
            roleName: ({role}: OptionalParam<RoleNamesParams> = {}) => {
                switch (role) {
                    case CONST.POLICY.ROLE.ADMIN:
                        return '管理者';
                    case CONST.POLICY.ROLE.AUDITOR:
                        return '監査人';
                    case CONST.POLICY.ROLE.USER:
                        return 'メンバー';
                    default:
                        return 'メンバー';
                }
            },
            frequency: {
                manual: '手動で',
                instant: '即時',
                immediate: '毎日',
                trip: '出張ごと',
                weekly: '毎週',
                semimonthly: '月に2回',
                monthly: '毎月',
            },
            planType: 'プランタイプ',
            submitExpense: '経費を以下に提出してください。',
            defaultCategory: 'デフォルトのカテゴリ',
            viewTransactions: '取引を表示',
            policyExpenseChatName: ({displayName}: PolicyExpenseChatNameParams) => `${displayName} の経費`,
            deepDiveExpensifyCard: `<muted-text-label>Expensify Card の取引は、<a href="${CONST.DEEP_DIVE_EXPENSIFY_CARD}">当社のインテグレーション</a>によって作成される「Expensify Card Liability Account」に自動的にエクスポートされます。</muted-text-label>`,
        },
        receiptPartners: {
            connect: '今すぐ接続',
            uber: {
                subtitle: ({organizationName}: ReceiptPartnersUberSubtitleParams) =>
                    organizationName ? `${organizationName} に接続済み` : '組織全体の出張費や飲食・デリバリー経費を自動化しましょう。',
                sendInvites: '招待を送信',
                sendInvitesDescription: 'これらのワークスペースメンバーは、まだ Uber for Business アカウントを持っていません。現時点で招待したくないメンバーの選択を解除してください。',
                confirmInvite: '招待を確認',
                manageInvites: '招待を管理',
                confirm: '確認',
                allSet: '準備完了',
                readyToRoll: '準備ができました',
                takeBusinessRideMessage: 'ビジネス利用で乗車すると、Uberの領収書がExpensifyにインポートされます。急いで！',
                all: 'すべて',
                linked: 'リンク済み',
                outstanding: '未処理',
                status: {
                    resend: '再送信',
                    invite: '招待',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED]: 'リンク済み',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.LINKED_PENDING_APPROVAL]: '保留中',
                    [CONST.POLICY.RECEIPT_PARTNERS.UBER_EMPLOYEE_STATUS.SUSPENDED]: '一時停止中',
                },
                centralBillingAccount: '中央請求アカウント',
                centralBillingDescription: 'すべてのUber領収書をインポートする場所を選択してください。',
                invitationFailure: 'Uber for Business へのメンバー招待に失敗しました',
                autoInvite: 'Uber for Business の新しいワークスペースメンバーを招待',
                autoRemove: 'Uber for Business から削除されたワークスペースメンバーを無効化',
                bannerTitle: 'Expensify + Uber for Business',
                bannerDescription: '組織全体の出張および食事配達の経費を自動化するために、Uber for Business を連携しましょう。',
                emptyContent: {
                    title: '保留中の招待はありません',
                    subtitle: 'やった！くまなく探しましたが、保留中の招待は見つかりませんでした。',
                },
            },
        },
        perDiem: {
            subtitle: `<muted-text>日当レートを設定して、従業員の1日あたりの支出を管理します。<a href="${CONST.DEEP_DIVE_PER_DIEM}">詳しくはこちら</a>。</muted-text>`,
            amount: '金額',
            deleteRates: () => ({
                one: 'レートを削除',
                other: 'レートを削除',
            }),
            deletePerDiemRate: '日当レートを削除',
            findPerDiemRate: '日当額を検索',
            areYouSureDelete: () => ({
                one: 'このレートを削除してもよろしいですか？',
                other: 'これらのレートを削除してもよろしいですか？',
            }),
            emptyList: {
                title: '日当',
                subtitle: '出張日当レートを設定して、従業員の1日あたりの支出を管理しましょう。スプレッドシートからレートをインポートして開始します。',
            },
            importPerDiemRates: '日当レートをインポート',
            editPerDiemRate: '日当額を編集',
            editPerDiemRates: '日当レートを編集',
            editDestinationSubtitle: ({destination}: EditDestinationSubtitleParams) => `この宛先を更新すると、すべての ${destination} の日当サブレートが変更されます。`,
            editCurrencySubtitle: ({destination}: EditDestinationSubtitleParams) => `この通貨を更新すると、すべての${destination}の日当サブレートが変更されます。`,
        },
        qbd: {
            exportOutOfPocketExpensesDescription: '自己負担経費を QuickBooks Desktop へどのようにエクスポートするかを設定します。',
            exportOutOfPocketExpensesCheckToggle: 'チェックを「後で印刷」に設定',
            exportDescription: 'Expensify のデータを QuickBooks Desktop へエクスポートする方法を設定します。',
            date: 'エクスポート日',
            exportInvoices: '請求書のエクスポート先',
            exportExpensifyCard: 'Expensify カード取引を次の形式でエクスポート',
            account: 'アカウント',
            accountDescription: '仕訳の記帳先を選択してください。',
            accountsPayable: '買掛金',
            accountsPayableDescription: '仕入先請求書を作成する場所を選択してください。',
            bankAccount: '銀行口座',
            notConfigured: '未設定',
            bankAccountDescription: '小切手の送付元を選択してください。',
            creditCardAccount: 'クレジットカード口座',
            exportDate: {
                label: 'エクスポート日',
                description: 'レポートを QuickBooks Desktop にエクスポートする際に、この日付を使用します。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最終経費の日付',
                        description: 'レポート内で最も最近の日付の経費。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートが QuickBooks Desktop にエクスポートされた日付。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認のために提出された日付。',
                    },
                },
            },
            exportCheckDescription: '以下の銀行口座から各Expensifyレポートごとに内訳付きの小切手を作成して送金します。',
            exportJournalEntryDescription: '各Expensifyレポートごとに明細付きの仕訳を作成し、以下の勘定科目に計上します。',
            exportVendorBillDescription: '各Expensifyレポートごとに明細付きの仕入先請求書を作成し、下記の勘定科目に追加します。この期間が締め済みの場合は、次の未締期間の初日に計上します。',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Desktop は、仕訳エントリのエクスポートにおける税金に対応していません。ワークスペースで税金が有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledError: '税金が有効になっている場合、仕訳は利用できません。別のエクスポートオプションを選択してください。',
            accounts: {
                [CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'クレジットカード',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳',
                [CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '小切手',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CHECK}Description`]: '以下の銀行口座から各Expensifyレポートごとに内訳付きの小切手を作成して送金します。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'クレジットカード取引の加盟店名を、QuickBooks 内の対応するベンダーに自動的に照合します。該当するベンダーが存在しない場合は、関連付けのために「Credit Card Misc.」というベンダーを作成します。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '各Expensifyレポートごとに、最後の経費の日付を使用して明細付きのベンダー請求書を作成し、以下の勘定科目に追加します。この期間が締め済みの場合は、次の未締期間の1日付で計上します。',
                [`${CONST.QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'クレジットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'すべてのクレジットカード取引に適用する仕入先を選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}AccountDescription`]: '小切手の送付元を選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'ロケーションが有効になっている場合、ベンダー請求書は利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]:
                    'ロケーションが有効になっている場合、チェックは利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]:
                    '税金が有効になっている場合、仕訳は利用できません。別のエクスポートオプションを選択してください。',
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'QuickBooks Desktop にアカウントを追加して、接続をもう一度同期してください',
            qbdSetup: 'QuickBooks Desktop のセットアップ',
            requiredSetupDevice: {
                title: 'このデバイスから接続できません',
                body1: 'QuickBooks Desktop の会社ファイルをホストしているコンピューターから、この接続を設定する必要があります。',
                body2: '接続が完了すると、どこからでも同期とエクスポートができるようになります。',
            },
            setupPage: {
                title: '接続するにはこのリンクを開いてください',
                body: 'セットアップを完了するには、QuickBooks Desktop が実行されているコンピューターで次のリンクを開いてください。',
                setupErrorTitle: '問題が発生しました',
                setupErrorBody: ({conciergeLink}: QBDSetupErrorBodyParams) =>
                    `<muted-text><centered-text>現在、QuickBooks Desktop との接続が機能していません。しばらくしてからもう一度お試しいただくか、問題が解決しない場合は <a href="${conciergeLink}">Concierge にお問い合わせください</a>。</centered-text></muted-text>`,
            },
            importDescription: 'QuickBooks Desktop から Expensify へインポートするコーディング設定を選択してください。',
            classes: 'クラス',
            items: '項目',
            customers: '顧客／プロジェクト',
            exportCompanyCardsDescription: '会社カードでの購入を QuickBooks Desktop へどのように書き出すかを設定します。',
            defaultVendorDescription: 'エクスポート時にすべてのクレジットカード取引に適用されるデフォルトの仕入先を設定します。',
            accountsDescription: 'QuickBooks Desktop の勘定科目表は、Expensify ではカテゴリとしてインポートされます。',
            accountsSwitchTitle: '新しい勘定科目を、カテゴリーとして有効または無効の状態で取り込むかを選択します。',
            accountsSwitchDescription: '有効にしたカテゴリは、メンバーが経費を作成する際に選択できるようになります。',
            classesDescription: 'Expensify で QuickBooks Desktop のクラスをどのように処理するかを選択します。',
            tagsDisplayedAsDescription: '明細レベル',
            reportFieldsDisplayedAsDescription: 'レポートレベル',
            customersDescription: 'Expensify で QuickBooks Desktop の顧客/プロジェクトをどのように処理するかを選択してください。',
            advancedConfig: {
                autoSyncDescription: 'Expensifyは毎日自動的にQuickBooks Desktopと同期します。',
                createEntities: 'エンティティを自動作成',
                createEntitiesDescription: 'Expensify は、まだ存在しない場合は QuickBooks Desktop にベンダーを自動的に作成します。',
            },
            itemsDescription: 'Expensify で QuickBooks Desktop のアイテムをどのように処理するかを選択してください。',
            accountingMethods: {
                label: 'エクスポートするタイミング',
                description: '経費のエクスポートタイミングを選択してください:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '実費精算は最終承認後にエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '立替経費は、支払い時にエクスポートされます',
                },
            },
        },
        qbo: {
            connectedTo: '接続済み',
            importDescription: 'QuickBooks Online から Expensify にインポートするコード設定を選択してください。',
            classes: 'クラス',
            locations: '場所',
            customers: '顧客／プロジェクト',
            accountsDescription: 'QuickBooks Online の勘定科目表は、Expensify にはカテゴリとしてインポートされます。',
            accountsSwitchTitle: '新しい勘定科目を、カテゴリーとして有効または無効の状態で取り込むかを選択します。',
            accountsSwitchDescription: '有効にしたカテゴリは、メンバーが経費を作成する際に選択できるようになります。',
            classesDescription: 'Expensify で QuickBooks Online クラスをどのように扱うかを選択してください。',
            customersDescription: 'Expensify で QuickBooks Online の顧客／プロジェクトをどのように処理するかを選択します。',
            locationsDescription: 'Expensify で QuickBooks Online のロケーションをどのように処理するかを選択してください。',
            taxesDescription: 'Expensify で QuickBooks Online の税金をどのように処理するかを選択してください。',
            locationsLineItemsRestrictionDescription:
                'QuickBooks Online は、小切手またはベンダー請求書において、明細行レベルでの「Location」をサポートしていません。明細行レベルで Location を使用したい場合は、仕訳伝票およびクレジット／デビットカード経費を使用していることを確認してください。',
            taxesJournalEntrySwitchNote: 'QuickBooks Online は仕訳への税金の適用をサポートしていません。エクスポートオプションをベンダー請求書または小切手に変更してください。',
            exportDescription: 'Expensify のデータを QuickBooks Online へどのようにエクスポートするかを設定します。',
            date: 'エクスポート日',
            exportInvoices: '請求書のエクスポート先',
            exportExpensifyCard: 'Expensify カード取引を次の形式でエクスポート',
            exportDate: {
                label: 'エクスポート日',
                description: 'レポートを QuickBooks Online にエクスポートするときに、この日付を使用します。',
                values: {
                    [CONST.QUICKBOOKS_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最終経費の日付',
                        description: 'レポート内で最も最近の日付の経費。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートがQuickBooks Onlineにエクスポートされた日付。',
                    },
                    [CONST.QUICKBOOKS_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認のために提出された日付。',
                    },
                },
            },
            receivable: '売掛金', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            archive: '売掛金アーカイブ', // This is an account name that will come directly from QBO, so I don't know why we need a translation for it. It should take whatever the name of the account is in QBO. Leaving this note for CS.
            exportInvoicesDescription: 'QuickBooks Online に請求書をエクスポートする際に、この口座を使用します。',
            exportCompanyCardsDescription: '会社カードの購入を QuickBooks Online へどのようにエクスポートするかを設定します。',
            vendor: '取引先',
            defaultVendorDescription: 'エクスポート時にすべてのクレジットカード取引に適用されるデフォルトの仕入先を設定します。',
            exportOutOfPocketExpensesDescription: '実費経費を QuickBooks Online へどのようにエクスポートするかを設定します。',
            exportCheckDescription: '以下の銀行口座から各Expensifyレポートごとに内訳付きの小切手を作成して送金します。',
            exportJournalEntryDescription: '各Expensifyレポートごとに明細付きの仕訳を作成し、以下の勘定科目に計上します。',
            exportVendorBillDescription: '各Expensifyレポートごとに明細付きの仕入先請求書を作成し、下記の勘定科目に追加します。この期間が締め済みの場合は、次の未締期間の初日に計上します。',
            account: 'アカウント',
            accountDescription: '仕訳の記帳先を選択してください。',
            accountsPayable: '買掛金',
            accountsPayableDescription: '仕入先請求書を作成する場所を選択してください。',
            bankAccount: '銀行口座',
            notConfigured: '未設定',
            bankAccountDescription: '小切手の送付元を選択してください。',
            creditCardAccount: 'クレジットカード口座',
            companyCardsLocationEnabledDescription:
                'QuickBooks Online は仕入先の請求書エクスポートでロケーションに対応していません。ワークスペースでロケーションが有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledDescription:
                'QuickBooks Online は仕訳エクスポートで税金に対応していません。ワークスペースで税金が有効になっているため、このエクスポートオプションは利用できません。',
            outOfPocketTaxEnabledError: '税金が有効になっている場合、仕訳は利用できません。別のエクスポートオプションを選択してください。',
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日自動的に QuickBooks Online と同期します。',
                inviteEmployees: '従業員を招待',
                inviteEmployeesDescription: 'QuickBooks Online の従業員レコードをインポートし、このワークスペースに従業員を招待します。',
                createEntities: 'エンティティを自動作成',
                createEntitiesDescription: 'Expensify は、QuickBooks Online に存在しないベンダーを自動的に作成し、請求書をエクスポートする際に顧客も自動作成します。',
                reimbursedReportsDescription: 'Expensify ACH を使用してレポートが支払われるたびに、対応する支払伝票が下記の QuickBooks Online アカウント内に作成されます。',
                qboBillPaymentAccount: 'QuickBooks 請求書支払口座',
                qboInvoiceCollectionAccount: 'QuickBooks 請求書回収勘定',
                accountSelectDescription: '支払い元となる口座を選択すると、QuickBooks Online 内に支払いが作成されます。',
                invoiceAccountSelectorDescription: '請求書の入金先を選択すると、QuickBooks Online 内に支払いを作成します。',
            },
            accounts: {
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD]: 'デビットカード',
                [CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD]: 'クレジットカード',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: '仕入先請求書',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '小切手',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}Description`]:
                    'デビットカード取引の加盟店名を、自動的に QuickBooks 内の対応する仕入先と照合します。該当する仕入先が存在しない場合は、関連付けのために「Debit Card Misc.」という仕入先を作成します。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}Description`]:
                    'クレジットカード取引の加盟店名を、QuickBooks 内の対応するベンダーに自動的に照合します。該当するベンダーが存在しない場合は、関連付けのために「Credit Card Misc.」というベンダーを作成します。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Description`]:
                    '各Expensifyレポートごとに、最後の経費の日付を使用して明細付きのベンダー請求書を作成し、以下の勘定科目に追加します。この期間が締め済みの場合は、次の未締期間の1日付で計上します。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.DEBIT_CARD}AccountDescription`]: 'デビットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD}AccountDescription`]: 'クレジットカード取引のエクスポート先を選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}AccountDescription`]: 'すべてのクレジットカード取引に適用する仕入先を選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL}Error`]:
                    'ロケーションが有効になっている場合、ベンダー請求書は利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK}Error`]: 'ロケーションが有効になっている場合、チェックは利用できません。別のエクスポートオプションを選択してください。',
                [`${CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY}Error`]: '税金が有効になっている場合、仕訳は利用できません。別のエクスポートオプションを選択してください。',
            },
            exportDestinationAccountsMisconfigurationError: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'ベンダー請求書のエクスポートに有効な口座を選択してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳エクスポート用の有効な勘定科目を選択してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: '小切手のエクスポート用に有効な口座を選択してください',
            },
            exportDestinationSetupAccountsInfo: {
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL]: 'ベンダー請求書のエクスポートを使用するには、QuickBooks Online で買掛金勘定を設定してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.JOURNAL_ENTRY]: '仕訳エクスポートを使用するには、QuickBooks Online で仕訳勘定を設定してください',
                [CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.CHECK]: 'チェックエクスポートを使用するには、QuickBooks Online で銀行口座を設定してください',
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'QuickBooks Online に口座を追加して、もう一度接続を同期してください。',
            accountingMethods: {
                label: 'エクスポートするタイミング',
                description: '経費のエクスポートタイミングを選択してください:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '実費精算は最終承認後にエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '立替経費は、支払い時にエクスポートされます',
                },
            },
        },
        workspaceList: {
            joinNow: '今すぐ参加',
            askToJoin: '参加をリクエスト',
        },
        xero: {
            organization: 'Xero 組織',
            organizationDescription: 'データをインポートしたい Xero の組織を選択してください。',
            importDescription: 'Xero から Expensify へインポートするコード設定を選択してください。',
            accountsDescription: 'Xero の勘定科目表は、Expensify にカテゴリとしてインポートされます。',
            accountsSwitchTitle: '新しい勘定科目を、カテゴリーとして有効または無効の状態で取り込むかを選択します。',
            accountsSwitchDescription: '有効にしたカテゴリは、メンバーが経費を作成する際に選択できるようになります。',
            trackingCategories: 'トラッキングカテゴリー',
            trackingCategoriesDescription: 'Expensify で Xero のトラッキングカテゴリをどのように処理するかを選択します。',
            mapTrackingCategoryTo: ({categoryName}: CategoryNameParams) => `Xero の ${categoryName} をマッピング先に指定`,
            mapTrackingCategoryToDescription: ({categoryName}: CategoryNameParams) => `Xero にエクスポートするとき、${categoryName} をどこにマッピングするかを選択してください。`,
            customers: '顧客への再請求',
            customersDescription: 'Expensify で顧客への再請求を行うかどうかを選択します。Xero の顧客コンタクトは経費にタグ付けでき、Xero へ売上請求書としてエクスポートされます。',
            taxesDescription: 'Expensify で Xero の税金をどのように処理するかを選択してください。',
            notImported: '未インポート',
            notConfigured: '未設定',
            trackingCategoriesOptions: {
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.DEFAULT]: 'Xero連絡先のデフォルト',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.TAG]: 'タグ',
                [CONST.XERO_CONFIG.TRACKING_CATEGORY_OPTIONS.REPORT_FIELD]: 'レポートフィールド',
            },
            exportDescription: 'Expensify のデータを Xero へエクスポートする方法を設定します。',
            purchaseBill: '請求書を購入',
            exportDeepDiveCompanyCard: 'エクスポートされた経費は、下記の Xero 銀行口座に銀行取引として記帳され、取引日付は銀行取引明細書上の日付と一致します。',
            bankTransactions: '銀行取引',
            xeroBankAccount: 'Xero 銀行口座',
            xeroBankAccountDescription: '経費を銀行取引として計上する場所を選択してください。',
            exportExpensesDescription: 'レポートは、以下で選択された日付とステータスで仕入請求書としてエクスポートされます。',
            purchaseBillDate: '購入請求書の日付',
            exportInvoices: '請求書のエクスポート形式',
            salesInvoice: '売上請求書',
            exportInvoicesDescription: '売上請求書には、常に請求書を送信した日付が表示されます。',
            advancedConfig: {
                autoSyncDescription: 'Expensifyは毎日自動的にXeroと同期します。',
                purchaseBillStatusTitle: '購入請求書のステータス',
                reimbursedReportsDescription: 'Expensify ACH を使ってレポートが支払われるたびに、対応する支払伝票が下記の Xero アカウントに作成されます。',
                xeroBillPaymentAccount: 'Xero請求支払アカウント',
                xeroInvoiceCollectionAccount: 'Xero 請求書回収勘定',
                xeroBillPaymentAccountDescription: '支払い元の口座を選択すると、Xero に支払いを作成します。',
                invoiceAccountSelectorDescription: '請求書の入金先を選択すると、Xero 内に支払いを作成します。',
            },
            exportDate: {
                label: '購入請求書の日付',
                description: 'レポートをXeroにエクスポートするときに、この日付を使用します。',
                values: {
                    [CONST.XERO_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最終経費の日付',
                        description: 'レポート内で最も最近の日付の経費。',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートがXeroにエクスポートされた日付。',
                    },
                    [CONST.XERO_EXPORT_DATE.REPORT_SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認のために提出された日付。',
                    },
                },
            },
            invoiceStatus: {
                label: '購入請求書のステータス',
                description: 'Xero に購買請求書をエクスポートする際に、このステータスを使用します。',
                values: {
                    [CONST.XERO_CONFIG.INVOICE_STATUS.DRAFT]: '下書き',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_APPROVAL]: '承認待ち',
                    [CONST.XERO_CONFIG.INVOICE_STATUS.AWAITING_PAYMENT]: '支払い待ち',
                },
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'Xero に口座を追加して、もう一度接続を同期してください',
            accountingMethods: {
                label: 'エクスポートするタイミング',
                description: '経費のエクスポートタイミングを選択してください:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '実費精算は最終承認後にエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '立替経費は、支払い時にエクスポートされます',
                },
            },
        },
        sageIntacct: {
            preferredExporter: '優先エクスポーター',
            taxSolution: '税務ソリューション',
            notConfigured: '未設定',
            exportDate: {
                label: 'エクスポート日',
                description: 'レポートを Sage Intacct にエクスポートする際に、この日付を使用します。',
                values: {
                    [CONST.SAGE_INTACCT_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最終経費の日付',
                        description: 'レポート内で最も最近の日付の経費。',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートが Sage Intacct にエクスポートされた日付。',
                    },
                    [CONST.SAGE_INTACCT_EXPORT_DATE.SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認のために提出された日付。',
                    },
                },
            },
            reimbursableExpenses: {
                description: 'Sage Intacct への立替経費のエクスポート方法を設定します。',
                values: {
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.EXPENSE_REPORT]: '経費精算書',
                    [CONST.SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '仕入先請求書',
                },
            },
            nonReimbursableExpenses: {
                description: '会社カードの購入を Sage Intacct へどのようにエクスポートするかを設定します。',
                values: {
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE]: 'クレジットカード',
                    [CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.VENDOR_BILL]: '仕入先請求書',
                },
            },
            creditCardAccount: 'クレジットカード口座',
            defaultVendor: 'デフォルトのベンダー',
            defaultVendorDescription: ({isReimbursable}: DefaultVendorDescriptionParams) =>
                `Sage Intacct で一致するベンダーがない ${isReimbursable ? '' : '非'}償還対象経費に適用されるデフォルトのベンダーを設定します。`,
            exportDescription: 'Expensify のデータを Sage Intacct へエクスポートする方法を設定します。',
            exportPreferredExporterNote:
                '優先されるエクスポーターは任意のワークスペース管理者にできますが、ドメイン設定で会社カードごとに別々のエクスポートアカウントを設定する場合は、ドメイン管理者でもある必要があります。',
            exportPreferredExporterSubNote: '一度設定すると、優先エクスポーターは自分のアカウントで、エクスポート対象のレポートを表示できるようになります。',
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: `Sage Intacct にアカウントを追加して、もう一度接続を同期してください`,
            autoSync: '自動同期',
            autoSyncDescription: 'Expensify は毎日自動的に Sage Intacct と同期します。',
            inviteEmployees: '従業員を招待',
            inviteEmployeesDescription:
                'Sage Intacct の従業員レコードをインポートし、このワークスペースに従業員を招待します。承認ワークフローはデフォルトでマネージャー承認になり、メンバー ページでさらに設定できます。',
            syncReimbursedReports: '払い済みレポートを同期',
            syncReimbursedReportsDescription: 'Expensify ACH を使用してレポートが支払われるたびに、対応する支払伝票が下記の Sage Intacct アカウントに作成されます。',
            paymentAccount: 'Sage Intacct 支払口座',
            accountingMethods: {
                label: 'エクスポートするタイミング',
                description: '経費のエクスポートタイミングを選択してください:',
                values: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                },
                alternateText: {
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '実費精算は最終承認後にエクスポートされます',
                    [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '立替経費は、支払い時にエクスポートされます',
                },
            },
        },
        netsuite: {
            subsidiary: '子会社',
            subsidiarySelectDescription: 'NetSuite でデータをインポートしたい子会社を選択してください。',
            exportDescription: 'Expensify のデータを NetSuite にエクスポートする方法を設定します。',
            exportInvoices: '請求書のエクスポート先',
            journalEntriesTaxPostingAccount: '仕訳の税金計上勘定',
            journalEntriesProvTaxPostingAccount: '仕訳伝票 地方税計上勘定',
            foreignCurrencyAmount: '外国通貨金額をエクスポート',
            exportToNextOpenPeriod: '次の未締め期間にエクスポート',
            nonReimbursableJournalPostingAccount: '非精算仕訳計上勘定',
            reimbursableJournalPostingAccount: '経費精算対象の仕訳計上勘定',
            journalPostingPreference: {
                label: '仕訳の投稿設定',
                values: {
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_INDIVIDUAL_LINE]: '各レポートごとの単一の明細エントリ',
                    [CONST.NETSUITE_JOURNAL_POSTING_PREFERENCE.JOURNALS_POSTING_TOTAL_LINE]: '各経費につき 1 件の入力',
                },
            },
            invoiceItem: {
                label: '請求書アイテム',
                values: {
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.CREATE]: {
                        label: '私のために1つ作成してください',
                        description: 'エクスポート時に（まだ存在しない場合は）「Expensify invoice line item」を自動的に作成します。',
                    },
                    [CONST.NETSUITE_INVOICE_ITEM_PREFERENCE.SELECT]: {
                        label: '既存のものを選択',
                        description: '以下で選択された項目に、Expensify の請求書を紐づけます。',
                    },
                },
            },
            exportDate: {
                label: 'エクスポート日',
                description: 'レポートをNetSuiteへエクスポートする際に、この日付を使用します。',
                values: {
                    [CONST.NETSUITE_EXPORT_DATE.LAST_EXPENSE]: {
                        label: '最終経費の日付',
                        description: 'レポート内で最も最近の日付の経費。',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.EXPORTED]: {
                        label: 'エクスポート日',
                        description: 'レポートが NetSuite にエクスポートされた日付。',
                    },
                    [CONST.NETSUITE_EXPORT_DATE.SUBMITTED]: {
                        label: '提出日',
                        description: 'レポートが承認のために提出された日付。',
                    },
                },
            },
            exportDestination: {
                values: {
                    [CONST.NETSUITE_EXPORT_DESTINATION.EXPENSE_REPORT]: {
                        label: '経費精算書',
                        reimbursableDescription: '自費経費は、経費レポートとして NetSuite にエクスポートされます。',
                        nonReimbursableDescription: '会社カード経費は、経費レポートとして NetSuite にエクスポートされます。',
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.VENDOR_BILL]: {
                        label: '仕入先請求書',
                        reimbursableDescription: dedent(`
                            立替経費は、以下で指定された NetSuite ベンダー宛て支払の請求書としてエクスポートされます。

                            カードごとに特定のベンダーを設定したい場合は、*設定 > ドメイン > 会社カード* に移動してください。
                        `),
                        nonReimbursableDescription: dedent(`
                            会社カード経費は、以下で指定された NetSuite ベンダーへの支払対象の請求書としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*設定 > ドメイン > 会社カード* に移動してください。
                        `),
                    },
                    [CONST.NETSUITE_EXPORT_DESTINATION.JOURNAL_ENTRY]: {
                        label: '仕訳伝票',
                        reimbursableDescription: dedent(`
                            立替経費は、以下で指定された NetSuite アカウントへ仕訳としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*設定 > ドメイン > 会社カード* に進んでください。
                        `),
                        nonReimbursableDescription: dedent(`
                            会社カードの経費は、以下で指定された NetSuite アカウントに仕訳としてエクスポートされます。

                            各カードごとに特定のベンダーを設定したい場合は、*設定 > ドメイン > 会社カード* に移動してください。
                        `),
                    },
                },
                expenseReportDestinationConfirmDescription:
                    '会社カードのエクスポート設定を経費レポートに切り替えると、個々のカード用の NetSuite のベンダーおよび記帳勘定が無効になります。\n\nご安心ください。後で元に戻したくなった場合に備えて、以前の選択内容は引き続き保存されます。',
            },
            advancedConfig: {
                autoSyncDescription: 'Expensify は毎日自動的に NetSuite と同期します。',
                reimbursedReportsDescription: 'Expensify ACH を使用してレポートが支払われるたびに、対応する支払伝票が以下の NetSuite アカウントに作成されます。',
                reimbursementsAccount: '精算用口座',
                reimbursementsAccountDescription: '払い戻しに使用する銀行口座を選択すると、対応する支払いが NetSuite 内に作成されます。',
                collectionsAccount: '回収用口座',
                collectionsAccountDescription: '請求書がExpensifyで支払済みとしてマークされ、NetSuiteにエクスポートされると、下記の勘定科目に反映されます。',
                approvalAccount: 'A/P承認アカウント',
                approvalAccountDescription: 'NetSuite で取引の承認先となる勘定科目を選択してください。払い戻し済みレポートを同期する場合は、請求書の支払が作成される勘定科目でもあります。',
                defaultApprovalAccount: 'NetSuite デフォルト',
                inviteEmployees: '従業員を招待して承認を設定する',
                inviteEmployeesDescription:
                    'NetSuite の従業員レコードをインポートして、従業員をこのワークスペースに招待します。承認ワークフローはデフォルトでマネージャー承認になり、*メンバー*ページでさらに設定できます。',
                autoCreateEntities: '従業員／ベンダーを自動作成',
                enableCategories: '新しくインポートされたカテゴリを有効にする',
                customFormID: 'カスタムフォームID',
                customFormIDDescription:
                    'デフォルトでは、Expensify は NetSuite で設定されている優先トランザクションフォームを使用して伝票を作成します。別の方法として、使用する特定のトランザクションフォームを指定することもできます。',
                customFormIDReimbursable: '立替経費',
                customFormIDNonReimbursable: '会社カード経費',
                exportReportsTo: {
                    label: '経費レポートの承認レベル',
                    description: 'Expensifyで経費レポートが承認されてNetSuiteにエクスポートされた後、仕訳を記帳する前に、NetSuite側で追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_NONE]: 'NetSuite のデフォルト設定',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_SUPERVISOR_APPROVED]: '上司承認のみ',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_ACCOUNTING_APPROVED]: '経理のみ承認済み',
                        [CONST.NETSUITE_REPORTS_APPROVAL_LEVEL.REPORTS_APPROVED_BOTH]: '上長および経理が承認済み',
                    },
                },
                accountingMethods: {
                    label: 'エクスポートするタイミング',
                    description: '経費のエクスポートタイミングを選択してください:',
                    values: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '発生主義',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '現金',
                    },
                    alternateText: {
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.ACCRUAL]: '実費精算は最終承認後にエクスポートされます',
                        [COMMON_CONST.INTEGRATIONS.ACCOUNTING_METHOD.CASH]: '立替経費は、支払い時にエクスポートされます',
                    },
                },
                exportVendorBillsTo: {
                    label: 'ベンダー請求書の承認レベル',
                    description: 'Expensify でベンダー請求書が承認され NetSuite にエクスポートされると、仕訳を記帳する前に、NetSuite 側で追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED_NONE]: 'NetSuite のデフォルト設定',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVAL_PENDING]: '承認待ち',
                        [CONST.NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL.VENDOR_BILLS_APPROVED]: '投稿承認済み',
                    },
                },
                exportJournalsTo: {
                    label: '仕訳承認レベル',
                    description: 'Expensifyで仕訳が承認されてNetSuiteにエクスポートされた後、仕訳を記帳する前に、NetSuite側で追加の承認レベルを設定できます。',
                    values: {
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED_NONE]: 'NetSuite のデフォルト設定',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVAL_PENDING]: '承認待ち',
                        [CONST.NETSUITE_JOURNALS_APPROVAL_LEVEL.JOURNALS_APPROVED]: '投稿承認済み',
                    },
                },
                error: {
                    customFormID: '有効な数値のカスタムフォームIDを入力してください',
                },
            },
            noAccountsFound: 'アカウントが見つかりません',
            noAccountsFoundDescription: 'NetSuite にアカウントを追加して、もう一度接続を同期してください',
            noVendorsFound: 'ベンダーが見つかりません',
            noVendorsFoundDescription: 'NetSuite にベンダーを追加して、接続をもう一度同期してください',
            noItemsFound: '請求書アイテムが見つかりません',
            noItemsFoundDescription: 'NetSuite に請求書アイテムを追加して、接続をもう一度同期してください',
            noSubsidiariesFound: '子会社が見つかりません',
            noSubsidiariesFoundDescription: 'NetSuite に子会社を追加して、もう一度接続を同期してください',
            tokenInput: {
                title: 'NetSuite のセットアップ',
                formSteps: {
                    installBundle: {
                        title: 'Expensify バンドルをインストール',
                        description: 'NetSuite で、*Customization > SuiteBundler > Search & Install Bundles* に移動し、「Expensify」を検索してバンドルをインストールします。',
                    },
                    enableTokenAuthentication: {
                        title: 'トークンベース認証を有効にする',
                        description: 'NetSuite で、*Setup > Company > Enable Features > SuiteCloud* に進み、*token-based authentication* を有効にします。',
                    },
                    enableSoapServices: {
                        title: 'SOAP Webサービスを有効にする',
                        description: 'NetSuite で、*Setup > Company > Enable Features > SuiteCloud* に移動し、*SOAP Web Services* を有効にしてください。',
                    },
                    createAccessToken: {
                        title: 'アクセストークンを作成',
                        description:
                            'NetSuite で、*Setup > Users/Roles > Access Tokens* に移動し、「Expensify」アプリと「Expensify Integration」または「Administrator」ロールのいずれかに対してアクセストークンを作成します。\n\n*重要:* この手順で表示される *Token ID* と *Token Secret* を必ず保存してください。次の手順で必要になります。',
                    },
                    enterCredentials: {
                        title: 'NetSuite の認証情報を入力',
                        formInputs: {
                            netSuiteAccountID: 'NetSuite アカウント ID',
                            netSuiteTokenID: 'トークンID',
                            netSuiteTokenSecret: 'トークンシークレット',
                        },
                        netSuiteAccountIDDescription: 'NetSuite で、*Setup > Integration > SOAP Web Services Preferences* に移動します。',
                    },
                },
            },
            import: {
                expenseCategories: '経費カテゴリー',
                expenseCategoriesDescription: 'NetSuite の経費カテゴリーは、カテゴリーとして Expensify にインポートされます。',
                crossSubsidiaryCustomers: '複数子会社間の顧客／プロジェクト',
                importFields: {
                    departments: {
                        title: '部門',
                        subtitle: 'Expensify で NetSuite の *departments* をどのように扱うかを選択してください。',
                    },
                    classes: {
                        title: 'クラス',
                        subtitle: 'Expensifyで*クラス*をどのように処理するかを選択してください。',
                    },
                    locations: {
                        title: '場所',
                        subtitle: 'Expensify で「所在地」をどのように扱うかを選択してください。',
                    },
                },
                customersOrJobs: {
                    title: '顧客／プロジェクト',
                    subtitle: 'Expensify で NetSuite の「顧客」と「プロジェクト」をどのように扱うかを選択してください。',
                    importCustomers: '顧客をインポート',
                    importJobs: 'プロジェクトをインポート',
                    customers: '顧客',
                    jobs: 'プロジェクト',
                    label: ({importFields, importType}: CustomersOrJobsLabelParams) => `${importFields.join('と')}, ${importType}`,
                },
                importTaxDescription: 'NetSuite から税グループをインポートします。',
                importCustomFields: {
                    chooseOptionBelow: '以下のオプションから選択してください:',
                    label: ({importedTypes}: ImportedTypesParams) => `${importedTypes.join('と')} としてインポート済み`,
                    requiredFieldError: ({fieldName}: RequiredFieldParams) => `${fieldName}を入力してください`,
                    customSegments: {
                        title: 'カスタムセグメント／レコード',
                        addText: 'カスタムセグメント／レコードを追加',
                        recordTitle: 'カスタムセグメント／レコード',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS,
                        helpLinkText: '詳細な手順を表示',
                        helpText: 'カスタムセグメント／レコードの設定について',
                        emptyTitle: 'カスタムセグメントまたはカスタムレコードを追加',
                        fields: {
                            segmentName: '名前',
                            internalID: '内部ID',
                            scriptID: 'スクリプトID',
                            customRecordScriptID: '取引列 ID',
                            mapping: '表示形式',
                        },
                        removeTitle: 'カスタムセグメント／レコードを削除',
                        removePrompt: 'このカスタムセグメント／レコードを削除してもよろしいですか？',
                        addForm: {
                            customSegmentName: 'カスタムセグメント名',
                            customRecordName: 'カスタムレコード名',
                            segmentTitle: 'カスタムセグメント',
                            customSegmentAddTitle: 'カスタムセグメントを追加',
                            customRecordAddTitle: 'カスタムレコードを追加',
                            recordTitle: 'カスタムレコード',
                            segmentRecordType: 'カスタムセグメントを追加しますか、それともカスタムレコードを追加しますか？',
                            customSegmentNameTitle: 'カスタムセグメント名は何ですか？',
                            customRecordNameTitle: 'カスタムレコード名は何ですか？',
                            customSegmentNameFooter: `NetSuite でカスタムセグメント名を見つけるには、*Customizations > Links, Records & Fields > Custom Segments* ページを開いてください。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_`,
                            customRecordNameFooter: `NetSuite でカスタムレコード名を見つけるには、グローバル検索に「Transaction Column Field」と入力してください。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_`,
                            customSegmentInternalIDTitle: '内部 ID は何ですか？',
                            customSegmentInternalIDFooter: `最初に、NetSuite で内部 ID が有効になっていることを確認してください（*Home > Set Preferences > Show Internal ID*）。

カスタムセグメントの内部 ID は、NetSuite で次の場所から確認できます。

1. *Customization > Lists, Records, & Fields > Custom Segments* に進みます。
2. カスタムセグメントをクリックします。
3. *Custom Record Type* の横にあるハイパーリンクをクリックします。
4. 一番下のテーブルで内部 ID を探します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_`,
                            customRecordInternalIDFooter: `NetSuite でカスタムレコードの内部 ID を確認するには、次の手順に従ってください。

1. グローバル検索で「Transaction Line Fields」と入力します。
2. カスタムレコードをクリックして開きます。
3. 左側に表示されている内部 ID を確認します。

_詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_`,
                            customSegmentScriptIDTitle: 'スクリプト ID は何ですか？',
                            customSegmentScriptIDFooter: `NetSuite でカスタムセグメントのスクリプト ID を見つけるには、次の場所を確認してください：

1. *Customization > Lists, Records, & Fields > Custom Segments* を開きます。
2. 対象のカスタムセグメントをクリックして開きます。
3. 画面下部付近にある *Application and Sourcing* タブをクリックし、次のいずれかを行います。
    a. カスタムセグメントを Expensify 上で（明細レベルの）*タグ*として表示したい場合は、*Transaction Columns* サブタブをクリックし、*Field ID* を使用します。
    b. カスタムセグメントを Expensify 上で（レポートレベルの）*レポートフィールド*として表示したい場合は、*Transactions* サブタブをクリックし、*Field ID* を使用します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})。_`,
                            customRecordScriptIDTitle: '取引列IDは何ですか？',
                            customRecordScriptIDFooter: `カスタムレコードのスクリプト ID は、NetSuite 内の次の場所で確認できます：

1. グローバル検索で「Transaction Line Fields」と入力します。
2. カスタムレコードをクリックして開きます。
3. 左側に表示されるスクリプト ID を確認します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_SEGMENTS})_`,
                            customSegmentMappingTitle: 'このカスタムセグメントは、Expensify でどのように表示されるべきですか？',
                            customRecordMappingTitle: 'このカスタムレコードは Expensify でどのように表示されるべきですか？',
                        },
                        errors: {
                            uniqueFieldError: ({fieldName}: RequiredFieldParams) => `この ${fieldName?.toLowerCase()} を持つカスタムセグメント／レコードはすでに存在します`,
                        },
                    },
                    customLists: {
                        title: 'カスタムリスト',
                        addText: 'カスタムリストを追加',
                        recordTitle: 'カスタムリスト',
                        helpLink: CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS,
                        helpLinkText: '詳細な手順を表示',
                        helpText: 'カスタムリストの設定について',
                        emptyTitle: 'カスタムリストを追加',
                        fields: {
                            listName: '名前',
                            internalID: '内部ID',
                            transactionFieldID: '取引フィールドID',
                            mapping: '表示形式',
                        },
                        removeTitle: 'カスタムリストを削除',
                        removePrompt: 'このカスタムリストを削除してもよろしいですか？',
                        addForm: {
                            listNameTitle: 'カスタムリストを選択',
                            transactionFieldIDTitle: 'トランザクションフィールドIDは何ですか？',
                            transactionFieldIDFooter: `NetSuite でトランザクションフィールド ID を確認するには、次の手順に従ってください。

1. グローバル検索に「Transaction Line Fields」と入力します。
2. カスタムリストをクリックして開きます。
3. 左側でトランザクションフィールド ID を確認します。

_より詳しい手順については、[ヘルプサイトをご覧ください](${CONST.NETSUITE_IMPORT.HELP_LINKS.CUSTOM_LISTS})_`,
                            mappingTitle: 'このカスタムリストは、Expensify でどのように表示されますか？',
                        },
                        errors: {
                            uniqueTransactionFieldIDError: `この取引フィールド ID を使用したカスタムリストはすでに存在します`,
                        },
                    },
                },
                importTypes: {
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: {
                        label: 'NetSuite の従業員デフォルト',
                        description: 'Expensify にインポートされておらず、エクスポート時に適用されます',
                        footerContent: ({importField}: ImportFieldParams) =>
                            `NetSuite で ${importField} を使用する場合、Expense Report または Journal Entry へエクスポートする際に、従業員レコードで設定されているデフォルト値を適用します。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: {
                        label: 'タグ',
                        description: '明細レベル',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} は、従業員のレポート上の各経費ごとに選択できるようになります。`,
                    },
                    [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: {
                        label: 'レポートフィールド',
                        description: 'レポートレベル',
                        footerContent: ({importField}: ImportFieldParams) => `${startCase(importField)} の選択は、従業員のレポート上のすべての経費に適用されます。`,
                    },
                },
            },
        },
        intacct: {
            sageIntacctSetup: 'Sage Intacct の設定',
            prerequisitesTitle: '接続する前に...',
            downloadExpensifyPackage: 'Sage Intacct 用の Expensify パッケージをダウンロード',
            followSteps: '「操作ガイド：Sage Intacct に接続する」の手順に従ってください',
            enterCredentials: 'Sage Intacct の認証情報を入力してください',
            entity: 'エンティティ',
            employeeDefault: 'Sage Intacct 従業員デフォルト',
            employeeDefaultDescription: '従業員にデフォルトの部門が存在する場合、その部門が Sage Intacct 内の経費に適用されます。',
            displayedAsTagDescription: '部門は、従業員のレポート内の各経費ごとに個別に選択できるようになります。',
            displayedAsReportFieldDescription: '部署の選択は、従業員のレポートに含まれるすべての経費に適用されます。',
            toggleImportTitle: ({mappingTitle}: ToggleImportTitleParams) => `Expensify で Sage Intacct の <strong>${mappingTitle}</strong> をどのように処理するか選択してください。`,
            expenseTypes: '経費の種類',
            expenseTypesDescription: 'Sage Intacct の経費タイプは、Expensify ではカテゴリとしてインポートされます。',
            accountTypesDescription: 'Sage Intacct の勘定科目表は、Expensify にカテゴリとしてインポートされます。',
            importTaxDescription: 'Sage Intacct から仕入税率をインポートします。',
            userDefinedDimensions: 'ユーザー定義ディメンション',
            addUserDefinedDimension: 'ユーザー定義ディメンションを追加',
            integrationName: '連携名',
            dimensionExists: 'この名前のディメンションはすでに存在します。',
            removeDimension: 'ユーザー定義ディメンションを削除',
            removeDimensionPrompt: 'このユーザー定義ディメンションを削除してもよろしいですか？',
            userDefinedDimension: 'ユーザー定義ディメンション',
            addAUserDefinedDimension: 'ユーザー定義ディメンションを追加',
            detailedInstructionsLink: '詳細な手順を表示',
            detailedInstructionsRestOfSentence: 'ユーザー定義ディメンションの追加について。',
            userDimensionsAdded: () => ({
                one: '1 UDD が追加されました',
                other: (count: number) => `${count} 件のUDDを追加しました`,
            }),
            mappingTitle: ({mappingName}: IntacctMappingTitleParams) => {
                switch (mappingName) {
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
                        return '部署';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
                        return 'クラス';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
                        return '場所';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
                        return '顧客';
                    case CONST.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
                        return 'プロジェクト（ジョブ）';
                    default:
                        return 'マッピング';
                }
            },
        },
        type: {
            free: '無料',
            control: 'コントロール',
            collect: '回収',
        },
        companyCards: {
            addCards: 'カードを追加',
            selectCards: 'カードを選択',
            addNewCard: {
                other: 'その他',
                cardProviders: {
                    gl1025: 'American Express 法人カード',
                    cdf: 'Mastercard商用カード',
                    vcf: 'Visa コマーシャルカード',
                    stripe: 'Stripeカード',
                },
                yourCardProvider: `カード発行会社はどこですか？`,
                whoIsYourBankAccount: 'あなたの銀行はどこですか？',
                whereIsYourBankLocated: 'あなたの銀行はどこにありますか？',
                howDoYouWantToConnect: '銀行への接続方法を選択してください',
                learnMoreAboutOptions: `<muted-text>これらの<a href="${CONST.COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL}">オプション</a>について詳しく見る。</muted-text>`,
                commercialFeedDetails: '銀行との設定が必要です。これは通常、大企業で使用され、条件を満たしている場合は最適なオプションとなることが多いです。',
                commercialFeedPlaidDetails: `ご利用の銀行での設定が必要ですが、設定方法はご案内します。通常は大企業に限られます。`,
                directFeedDetails: '最もシンプルな方法です。マスター認証情報を使用してすぐに接続します。この方法が最も一般的です。',
                enableFeed: {
                    title: ({provider}: GoBackMessageParams) => `${provider}フィードを有効にする`,
                    heading: 'お使いのカード発行会社と直接連携しており、取引データを迅速かつ正確にExpensifyへ取り込むことができます。\n\n開始するには、次の手順に従ってください。',
                    visa: 'Visa とはグローバルな連携を行っていますが、利用資格は銀行やカードプログラムによって異なります。\n\n始めるには、次の手順に従ってください。',
                    mastercard:
                        '私たちはMastercardとのグローバルな連携を提供していますが、利用資格は銀行やカードプログラムによって異なります。\n\n始めるには、次のステップに従ってください。',
                    vcf: `1. Visaコマーシャルカードの設定方法についての詳しい手順は、[こちらのヘルプ記事](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})をご覧ください。

2. ご利用のプログラムで商用フィードに対応しているか確認し、有効化を依頼するために、[銀行にお問い合わせ](${CONST.COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP})ください。

3. *フィードが有効化され、その詳細がわかったら、次の画面へ進んでください。*`,
                    gl1025: `1. お使いのプログラムで American Express がコマーシャルフィードを有効にできるか確認するには、[このヘルプ記事](${CONST.COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP})をご覧ください。

2. フィードが有効化されると、Amex から本番レターが送付されます。

3. *フィード情報を取得したら、次の画面へ進んでください。*`,
                    cdf: `1. Mastercard Commercial Cards の設定方法についての詳しい手順は、[こちらのヘルプ記事](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})をご覧ください。

2. ご利用のプログラムでコマーシャルフィードがサポートされているか確認し、有効化を依頼するために、[銀行に連絡](${CONST.COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS})してください。

3. *フィードが有効化され、その詳細がわかったら、次の画面に進んでください。*`,
                    stripe: `1. Stripe のダッシュボードにアクセスし、[Settings](${CONST.COMPANY_CARDS_STRIPE_HELP}) に移動します。

2. 「Product Integrations」の下で、Expensify の横にある「Enable」をクリックします。

3. フィードが有効になったら、下の「Submit」をクリックしてください。こちらで追加作業を進めます。`,
                },
                whatBankIssuesCard: 'これらのカードを発行している銀行はどこですか？',
                enterNameOfBank: '銀行名を入力',
                feedDetails: {
                    vcf: {
                        title: 'Visaフィードの詳細とは何ですか？',
                        processorLabel: 'プロセッサーID',
                        bankLabel: '金融機関（銀行）ID',
                        companyLabel: '会社ID',
                        helpLabel: 'これらのIDはどこで見つけられますか？',
                    },
                    gl1025: {
                        title: `Amex配信用ファイル名は何ですか？`,
                        fileNameLabel: '配達ファイル名',
                        helpLabel: '配信用ファイル名はどこで確認できますか？',
                    },
                    cdf: {
                        title: `Mastercard 配布 ID とは何ですか？`,
                        distributionLabel: '配信 ID',
                        helpLabel: '配布 ID はどこで確認できますか？',
                    },
                },
                amexCorporate: 'カードの表面に「Corporate」と記載されている場合は、これを選択してください',
                amexBusiness: 'カードの表面に「Business」と記載されている場合は、これを選択してください',
                amexPersonal: 'カードが個人用の場合はこれを選択',
                error: {
                    pleaseSelectProvider: '続行する前にカードプロバイダーを選択してください',
                    pleaseSelectBankAccount: '続行する前に銀行口座を選択してください',
                    pleaseSelectBank: '続行する前に銀行を選択してください',
                    pleaseSelectCountry: '続行する前に国を選択してください',
                    pleaseSelectFeedType: '続行する前にフィードタイプを選択してください',
                },
                exitModal: {
                    title: '何かうまくいきませんか？',
                    prompt: 'カードの追加が完了していないようです。問題があった場合はお知らせください。解決してスムーズに進められるようお手伝いします。',
                    confirmText: '問題を報告',
                    cancelText: 'スキップ',
                },
            },
            statementCloseDate: {
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_DAY_OF_MONTH]: '月末の最終日',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.LAST_BUSINESS_DAY_OF_MONTH]: '月末の最終営業日',
                [CONST.COMPANY_CARDS.STATEMENT_CLOSE_DATE.CUSTOM_DAY_OF_MONTH]: 'カスタム月日',
            },
            assignCard: 'カードを割り当てる',
            findCard: 'カードを検索',
            cardNumber: 'カード番号',
            commercialFeed: '商用フィード',
            feedName: ({feedName}: CompanyCardFeedNameParams) => `${feedName} カード`,
            directFeed: 'ダイレクトフィード',
            whoNeedsCardAssigned: '誰にカードを割り当てる必要がありますか？',
            chooseCard: 'カードを選択',
            chooseCardFor: ({assignee}: AssigneeParams) =>
                `<strong>${assignee}</strong> に使用するカードを選択してください。お探しのカードが見つかりませんか？<concierge-link>お知らせください。</concierge-link>`,
            noActiveCards: 'このフィードにアクティブなカードはありません',
            somethingMightBeBroken:
                '<muted-text><centered-text>または、何かが壊れている可能性があります。いずれにしても、ご不明な点があれば、<concierge-link>Concierge にお問い合わせください</concierge-link>。</centered-text></muted-text>',
            chooseTransactionStartDate: '取引の開始日を選択',
            startDateDescription: 'この日付以降のすべての取引をインポートします。日付が指定されていない場合は、金融機関が遡及を許可する限りさかのぼってインポートします。',
            fromTheBeginning: '最初から',
            customStartDate: 'カスタム開始日',
            customCloseDate: 'カスタム締め日',
            letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
            confirmationDescription: '取引のインポートをすぐに開始します。',
            cardholder: 'カード保有者',
            card: 'カード',
            cardName: 'カード名',
            brokenConnectionError: '<rbr>カードフィードの接続が切断されています。再度接続できるように、<a href="#">銀行にログイン</a>してください。</rbr>',
            assignedCard: ({assignee, link}: AssignedCardParams) => `${assignee} に ${link} を割り当てました！取り込まれた取引はこのチャットに表示されます。`,
            companyCard: '会社カード',
            chooseCardFeed: 'カードフィードを選択',
            ukRegulation:
                'Expensify Limited は、認可を受けた決済機関であり、Payment Services Regulations 2017 に基づき金融行為監督機構（Financial Conduct Authority）の規制を受ける Plaid Financial Ltd. の代理人です（企業参照番号: 804718）。Plaid は、自社の代理人である Expensify Limited を通じて、規制対象の口座情報サービスをお客様に提供します。',
        },
        expensifyCard: {
            issueAndManageCards: 'Expensify Card の発行と管理',
            getStartedIssuing: '最初のバーチャルカードまたは物理カードを発行して始めましょう。',
            verificationInProgress: '認証を処理中…',
            verifyingTheDetails: 'いくつかの詳細を確認しています。Expensifyカードを発行できるようになったら、Conciergeからお知らせします。',
            disclaimer:
                'Expensify Visa® Commercial Card は、Visa U.S.A. Inc. からのライセンスに基づき、FDIC メンバーである The Bancorp Bank, N.A. によって発行されたものであり、Visa カードを受け付けるすべての加盟店で利用できるとは限りません。Apple® および Apple ロゴ® は、米国およびその他の国において登録された Apple Inc. の商標です。App Store は Apple Inc. のサービスマークです。Google Play および Google Play ロゴは Google LLC の商標です。',
            euUkDisclaimer:
                'EEA 居住者向けに提供されるカードは Transact Payments Malta Limited によって発行され、英国居住者向けに提供されるカードは Visa Europe Limited からのライセンスに基づき Transact Payments Limited によって発行されます。Transact Payments Malta Limited は、1994 年金融機関法に基づき金融機関としてマルタ金融サービス庁に正式に認可・監督されています。登録番号 C 91879。Transact Payments Limited は、ジブラルタル金融サービス委員会によって認可・監督されています。',
            issueCard: 'カードを発行',
            findCard: 'カードを検索',
            newCard: '新しいカード',
            name: '名前',
            lastFour: '下4桁',
            limit: '制限',
            currentBalance: '現在の残高',
            currentBalanceDescription: '現在残高は、前回の清算日以降に発生した、記帳済みのすべての Expensify Card 取引の合計です。',
            balanceWillBeSettledOn: ({settlementDate}: SettlementDateParams) => `残高は${settlementDate}に精算されます`,
            settleBalance: '残高を清算',
            cardLimit: 'カード上限',
            remainingLimit: '残りの限度額',
            requestLimitIncrease: 'リクエスト上限の引き上げ',
            remainingLimitDescription:
                'ご利用可能額を算出する際には、利用期間、ご登録時にご提供いただいた事業関連情報、そして事業用銀行口座の利用可能残高など、複数の要素を考慮します。ご利用可能額は日々変動する場合があります。',
            earnedCashback: 'キャッシュバック',
            earnedCashbackDescription: 'キャッシュバック残高は、ワークスペース全体での月次の清算済み Expensify Card 利用額に基づいて計算されます。',
            issueNewCard: '新しいカードを発行',
            finishSetup: 'セットアップを完了',
            chooseBankAccount: '銀行口座を選択',
            chooseExistingBank: '既存のビジネス銀行口座を選択してExpensify Cardの残高を支払うか、新しい銀行口座を追加してください',
            accountEndingIn: 'Account ending in',
            addNewBankAccount: '新しい銀行口座を追加',
            settlementAccount: '精算口座',
            settlementAccountDescription: 'Expensifyカードの残高を支払う口座を選択してください。',
            settlementAccountInfo: ({reconciliationAccountSettingsLink, accountNumber}: SettlementAccountInfoParams) =>
                `継続的な照合を正しく機能させるために、この口座が<a href="${reconciliationAccountSettingsLink}">照合口座</a>（${accountNumber}）と一致していることを確認してください。`,
            settlementFrequency: '決済頻度',
            settlementFrequencyDescription: 'Expensify Card の残高を支払う頻度を選択してください。',
            settlementFrequencyInfo: '月次決済に切り替える場合は、Plaid を通じて銀行口座を連携し、過去 90 日間の残高履歴がプラスである必要があります。',
            frequency: {
                daily: '毎日',
                monthly: '毎月',
            },
            cardDetails: 'カードの詳細',
            cardPending: ({name}: {name: string}) => `カードは現在保留中で、${name} のアカウントが認証され次第、発行されます。`,
            virtual: 'バーチャル',
            physical: '物理',
            deactivate: 'カードを無効化',
            changeCardLimit: 'カード上限を変更',
            changeLimit: '上限を変更',
            smartLimitWarning: ({limit}: CharacterLimitParams) => `このカードの利用限度額を${limit}に変更すると、カード上のより多くの経費を承認するまで、新しい取引は承認されません。`,
            monthlyLimitWarning: ({limit}: CharacterLimitParams) => `このカードの利用限度額を${limit}に変更すると、来月まで新しい取引は承認されません。`,
            fixedLimitWarning: ({limit}: CharacterLimitParams) => `このカードの限度額を${limit}に変更すると、新しい取引は承認されません。`,
            changeCardLimitType: 'カード制限タイプを変更',
            changeLimitType: '制限タイプを変更',
            changeCardSmartLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `このカードの限度額タイプをスマート制限に変更すると、未承認の限度額 ${limit} にすでに達しているため、新しい取引は拒否されます。`,
            changeCardMonthlyLimitTypeWarning: ({limit}: CharacterLimitParams) =>
                `このカードの限度額タイプを「月次」に変更すると、${limit} の月間限度額はすでに上限に達しているため、新しい取引は承認されません。`,
            addShippingDetails: '配送先情報を追加',
            issuedCard: ({assignee}: AssigneeParams) => `${assignee} にExpensify Cardを発行しました！カードは2～3営業日以内に届きます。`,
            issuedCardNoShippingDetails: ({assignee}: AssigneeParams) => `${assignee} に Expensify Card を発行しました！配送先情報が確認され次第、カードが発送されます。`,
            issuedCardVirtual: ({assignee, link}: IssueVirtualCardParams) => `${assignee} にバーチャル Expensify Card を発行しました！${link} はすぐにお使いいただけます。`,
            addedShippingDetails: ({assignee}: AssigneeParams) => `${assignee} が配送情報を追加しました。Expensify Card は 2～3 営業日で到着します。`,
            replacedCard: ({assignee}: AssigneeParams) => `${assignee} はExpensify Cardを再発行しました。新しいカードは2～3営業日で届きます。`,
            replacedVirtualCard: ({assignee, link}: IssueVirtualCardParams) => `${assignee} はバーチャル Expensify Card を再発行しました！${link} はすぐに利用できます。`,
            card: 'カード',
            replacementCard: '代替カード',
            verifyingHeader: '確認中',
            bankAccountVerifiedHeader: '銀行口座が確認されました',
            verifyingBankAccount: '銀行口座を確認しています...',
            verifyingBankAccountDescription: 'Expensify Card を発行できるアカウントか確認しています。しばらくお待ちください。',
            bankAccountVerified: '銀行口座が認証されました！',
            bankAccountVerifiedDescription: 'ワークスペースメンバーに Expensify カードを発行できるようになりました。',
            oneMoreStep: 'あともう一歩…',
            oneMoreStepDescription: '銀行口座を手動で確認する必要があるようです。手順が用意されていますので、Concierge に移動してください。',
            gotIt: '了解しました',
            goToConcierge: 'Concierge に移動',
        },
        categories: {
            deleteCategories: 'カテゴリを削除',
            deleteCategoriesPrompt: 'これらのカテゴリを削除してもよろしいですか？',
            deleteCategory: 'カテゴリを削除',
            deleteCategoryPrompt: 'このカテゴリを削除してもよろしいですか？',
            disableCategories: 'カテゴリを無効にする',
            disableCategory: 'カテゴリを無効化',
            enableCategories: 'カテゴリを有効にする',
            enableCategory: 'カテゴリを有効にする',
            defaultSpendCategories: 'デフォルトの支出カテゴリ',
            spendCategoriesDescription: 'クレジットカード取引およびスキャンしたレシートについて、加盟店の支出がどのように分類されるかをカスタマイズします。',
            deleteFailureMessage: 'カテゴリの削除中にエラーが発生しました。もう一度お試しください',
            categoryName: 'カテゴリ名',
            requiresCategory: 'メンバーはすべての経費をカテゴリー分けする必要があります',
            needCategoryForExportToIntegration: ({connectionName}: NeedCategoryForExportToIntegrationParams) =>
                `${connectionName} にエクスポートするには、すべての経費をカテゴリ分けする必要があります。`,
            subtitle: 'お金がどこで使われているかを、よりわかりやすく把握しましょう。デフォルトのカテゴリを使うことも、自分でカテゴリを追加することもできます。',
            emptyCategories: {
                title: 'カテゴリがまだ作成されていません',
                subtitle: '支出を整理するためにカテゴリを追加してください。',
                subtitleWithAccounting: ({accountingPageURL}: EmptyCategoriesSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>現在、カテゴリーは会計連携からインポートされています。変更するには、<a href="${accountingPageURL}">会計</a>ページに移動してください。</centered-text></muted-text>`,
            },
            updateFailureMessage: 'カテゴリの更新中にエラーが発生しました。もう一度お試しください。',
            createFailureMessage: 'カテゴリの作成中にエラーが発生しました。もう一度お試しください',
            addCategory: 'カテゴリを追加',
            editCategory: 'カテゴリを編集',
            editCategories: 'カテゴリを編集',
            findCategory: 'カテゴリを検索',
            categoryRequiredError: 'カテゴリー名は必須です',
            existingCategoryError: 'この名前のカテゴリはすでに存在します',
            invalidCategoryName: 'カテゴリ名が無効です',
            importedFromAccountingSoftware: '以下のカテゴリは、あなたの からインポートされています',
            payrollCode: '給与コード',
            updatePayrollCodeFailureMessage: '給与コードの更新中にエラーが発生しました。もう一度お試しください',
            glCode: 'GLコード',
            updateGLCodeFailureMessage: 'GLコードの更新中にエラーが発生しました。もう一度お試しください。',
            importCategories: 'カテゴリをインポート',
            cannotDeleteOrDisableAllCategories: {
                title: 'すべてのカテゴリを削除または無効にはできません',
                description: `ワークスペースでカテゴリが必須のため、少なくとも 1 つのカテゴリは有効のままにする必要があります。`,
            },
        },
        moreFeatures: {
            subtitle: '成長に合わせて、以下のトグルを使用して機能を有効にしましょう。各機能は、さらにカスタマイズできるようナビゲーションメニューに表示されます。',
            spendSection: {
                title: '支出',
                subtitle: 'チームを拡大するのに役立つ機能を有効にしましょう。',
            },
            manageSection: {
                title: '管理',
                subtitle: '予算内に支出を抑えるのに役立つコントロールを追加します。',
            },
            earnSection: {
                title: '獲得',
                subtitle: '収益を効率化し、より早く入金を受け取りましょう。',
            },
            organizeSection: {
                title: '整理',
                subtitle: '支出をグループ化して分析し、支払った税金をすべて記録しましょう。',
            },
            integrateSection: {
                title: '連携',
                subtitle: 'Expensify を人気の金融サービスに接続しましょう。',
            },
            distanceRates: {
                title: '距離レート',
                subtitle: 'レートを追加、更新し、適用します。',
            },
            perDiem: {
                title: '日当',
                subtitle: '従業員の1日あたりの支出を管理するために、日当レートを設定します。',
            },
            expensifyCard: {
                title: 'Expensify Card',
                subtitle: '支出を把握し、コントロールしましょう。',
                disableCardTitle: 'Expensify Card を無効化',
                disableCardPrompt: 'Expensify Cardはすでに使用中のため、無効にすることはできません。次のステップについてはConciergeにお問い合わせください。',
                disableCardButton: 'Concierge とチャット',
                feed: {
                    title: 'Expensifyカードを取得',
                    subTitle: 'ビジネス経費を効率化し、Expensifyの料金を最大50%節約しましょう。さらに：',
                    features: {
                        cashBack: '米国内でのすべての購入にキャッシュバック',
                        unlimited: '無制限のバーチャルカード',
                        spend: '支出管理とカスタム上限',
                    },
                    ctaTitle: '新しいカードを発行',
                },
            },
            companyCards: {
                title: '法人カード',
                subtitle: '既存の会社カードから経費をインポートします。',
                feed: {
                    title: '会社カードをインポート',
                    features: {
                        support: '主要なすべてのカードプロバイダーに対応',
                        assignCards: 'チーム全員にカードを割り当てる',
                        automaticImport: '自動取引インポート',
                    },
                },
                bankConnectionError: '銀行接続の問題',
                connectWithPlaid: 'Plaid 経由で接続',
                connectWithExpensifyCard: 'Expensify Card をお試しください。',
                bankConnectionDescription: `もう一度カードの追加をお試しください。それでもうまくいかない場合は、`,
                disableCardTitle: '会社カードを無効にする',
                disableCardPrompt: 'この機能が使用されているため、会社カードを無効にすることはできません。次のステップについてはConciergeにお問い合わせください。',
                disableCardButton: 'Concierge とチャット',
                cardDetails: 'カードの詳細',
                cardNumber: 'カード番号',
                cardholder: 'カード保有者',
                cardName: 'カード名',
                integrationExport: ({integration, type}: IntegrationExportParams) =>
                    integration && type ? `${integration} ${type.toLowerCase()} エクスポート` : `${integration} エクスポート`,
                integrationExportTitleXero: ({integration}: IntegrationExportParams) => `取引をエクスポートする${integration}アカウントを選択してください。`,
                integrationExportTitle: ({integration, exportPageLink}: IntegrationExportParams) =>
                    `取引をエクスポートする${integration}アカウントを選択してください。利用可能なアカウントを変更するには、別の<a href="${exportPageLink}">エクスポートオプション</a>を選択してください。`,
                lastUpdated: '最終更新',
                transactionStartDate: '取引開始日',
                updateCard: 'カードを更新',
                unassignCard: 'カードの割り当てを解除',
                unassign: '割り当て解除',
                unassignCardDescription: 'このカードの割り当てを解除すると、ドラフトレポート上のすべての取引がカード保有者のアカウントから削除されます。',
                assignCard: 'カードを割り当てる',
                cardFeedName: 'カードフィード名',
                cardFeedNameDescription: 'カードフィードを他と区別できるように、一意の名前を付けてください。',
                cardFeedTransaction: '取引を削除',
                cardFeedTransactionDescription: 'カード保有者がカード取引を削除できるかどうかを選択します。新しい取引には、このルールが適用されます。',
                cardFeedRestrictDeletingTransaction: '取引の削除を制限する',
                cardFeedAllowDeletingTransaction: '取引の削除を許可',
                removeCardFeed: 'カードフィードを削除',
                removeCardFeedTitle: ({feedName}: CompanyCardFeedNameParams) => `${feedName} フィードを削除`,
                removeCardFeedDescription: 'このカードフィードを削除してもよろしいですか？すべてのカードの割り当てが解除されます。',
                error: {
                    feedNameRequired: 'カードフィード名は必須です',
                    statementCloseDateRequired: 'ステートメントの締め日を選択してください。',
                },
                corporate: '取引の削除を制限する',
                personal: '取引の削除を許可',
                setFeedNameDescription: 'ほかのカードフィードと区別できるように、一意の名前を付けてください',
                setTransactionLiabilityDescription: '有効にすると、カード保有者はカード取引を削除できるようになります。新しい取引はこのルールに従います。',
                emptyAddedFeedTitle: '会社カードの割り当て',
                emptyAddedFeedDescription: 'まず、最初のカードをメンバーに割り当てて開始しましょう。',
                pendingFeedTitle: `リクエストを確認しています…`,
                pendingFeedDescription: `現在、お客様のフィードの詳細を確認しています。確認が完了しましたら、次の方法でご連絡いたします`,
                pendingBankTitle: 'ブラウザーウィンドウを確認してください',
                pendingBankDescription: ({bankName}: CompanyCardBankName) => `先ほど開いたブラウザーウィンドウで ${bankName} に接続してください。ウィンドウが開かなかった場合は、`,
                pendingBankLink: 'ここをクリックしてください',
                giveItNameInstruction: '他のカードと区別できるような名前を付けてください。',
                updating: '更新中...',
                noAccountsFound: 'アカウントが見つかりません',
                defaultCard: 'デフォルトカード',
                downgradeTitle: `ワークスペースをダウングレードできません`,
                downgradeSubTitle: `このワークスペースは、複数のカードフィード（Expensify Card を除く）が接続されているため、ダウングレードできません。続行するには、<a href="#">カードフィードを 1 つのみにしてください</a>。`,
                noAccountsFoundDescription: ({connection}: ConnectionParams) => `${connection} にアカウントを追加して、もう一度接続を同期してください`,
                expensifyCardBannerTitle: 'Expensifyカードを取得',
                expensifyCardBannerSubtitle:
                    '米国内でのすべての購入でキャッシュバックを獲得し、Expensifyの請求額を最大50%オフ、無制限のバーチャルカードなど、さらに多くの特典をお楽しみいただけます。',
                expensifyCardBannerLearnMoreButton: '詳細はこちら',
                statementCloseDateTitle: '明細書締め日',
                statementCloseDateDescription: 'カードの利用明細の締め日をお知らせいただければ、Expensify 内に対応する明細書を作成します。',
            },
            workflows: {
                title: 'ワークフロー',
                subtitle: '支出の承認と支払い方法を設定します。',
                disableApprovalPrompt:
                    'このワークスペースの Expensify Card は現在、承認によって Smart Limit が設定されています。承認を無効にする前に、Smart Limit を使用している Expensify Card の制限タイプを変更してください。',
            },
            invoices: {
                title: '請求書',
                subtitle: '請求書を送受信します。',
            },
            categories: {
                title: 'カテゴリー',
                subtitle: '支出を追跡して整理しましょう。',
            },
            tags: {
                title: 'タグ',
                subtitle: 'コストを分類し、請求対象経費を追跡します。',
            },
            taxes: {
                title: '税金',
                subtitle: '対象となる税金を記録して申請しましょう。',
            },
            reportFields: {
                title: 'レポートフィールド',
                subtitle: '支出用のカスタムフィールドを設定する。',
            },
            connections: {
                title: '会計',
                subtitle: '勘定科目表などを同期します。',
            },
            receiptPartners: {
                title: 'レシートパートナー',
                subtitle: '領収書を自動で取り込む',
            },
            connectionsWarningModal: {
                featureEnabledTitle: 'そんなに急がないでください…',
                featureEnabledText: 'この機能を有効または無効にするには、会計インポート設定を変更する必要があります。',
                disconnectText: '経理機能を無効にするには、ワークスペースから会計連携を切断する必要があります。',
                manageSettings: '設定を管理',
            },
            receiptPartnersWarningModal: {
                featureEnabledTitle: 'Uber の連携を解除',
                disconnectText: 'この機能を無効にするには、先に Uber for Business 連携を解除してください。',
                description: 'この連携を本当に解除しますか？',
                confirmText: '了解しました',
            },
            workflowWarningModal: {
                featureEnabledTitle: 'そんなに急がないでください…',
                featureEnabledText:
                    'このワークスペースの Expensify Card は、Smart Limits を設定するために承認ワークフローに依存しています。\n\nワークフローを無効にする前に、Smart Limits が設定されているカードの制限タイプを変更してください。',
                confirmText: 'Expensifyカードに移動',
            },
            rules: {
                title: 'ルール',
                subtitle: 'レシートの必須化、高額支出のフラグ付けなどを設定します。',
            },
        },
        reports: {
            reportsCustomTitleExamples: '例:',
            customReportNamesSubtitle: `<muted-text>レポートのタイトルは、<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">豊富な数式</a>を使ってカスタマイズできます。</muted-text>`,
            customNameTitle: 'デフォルトレポートタイトル',
            customNameDescription: `<a href="${CONST.CUSTOM_REPORT_NAME_HELP_URL}">豊富な数式</a>を使って、経費レポートにカスタム名を付けましょう。`,
            customNameInputLabel: '名前',
            customNameEmailPhoneExample: 'メンバーのメールまたは電話番号: {report:submit:from}',
            customNameStartDateExample: 'レポート開始日: {report:startdate}',
            customNameWorkspaceNameExample: 'ワークスペース名：{report:workspacename}',
            customNameReportIDExample: 'レポートID：{report:id}',
            customNameTotalExample: '合計: {report:total}',
            preventMembersFromChangingCustomNamesTitle: 'メンバーがカスタムレポートのタイトルを変更できないようにする',
        },
        reportFields: {
            addField: 'フィールドを追加',
            delete: 'フィールドを削除',
            deleteFields: 'フィールドを削除',
            findReportField: 'レポート項目を検索',
            deleteConfirmation: 'このレポートフィールドを削除してもよろしいですか？',
            deleteFieldsConfirmation: 'これらのレポートフィールドを削除してもよろしいですか？',
            emptyReportFields: {
                title: 'レポートフィールドがまだ作成されていません',
                subtitle: 'レポートに表示されるカスタムフィールド（テキスト、日付、またはドロップダウン）を追加します。',
            },
            subtitle: 'レポートフィールドはすべての支出に適用され、追加情報の入力を促したい場合に役立ちます。',
            disableReportFields: 'レポート項目を無効にする',
            disableReportFieldsConfirmation: '本当に実行しますか？テキストフィールドと日付フィールドは削除され、リストは無効になります。',
            importedFromAccountingSoftware: '以下のレポートフィールドは、次のソースからインポートされます',
            textType: 'テキスト',
            dateType: '日付',
            dropdownType: 'リスト',
            formulaType: '数式',
            textAlternateText: 'フリーテキスト入力用のフィールドを追加してください。',
            dateAlternateText: '日付選択用のカレンダーを追加します。',
            dropdownAlternateText: '選択できるオプションのリストを追加してください。',
            formulaAlternateText: '数式フィールドを追加',
            nameInputSubtitle: 'レポートフィールドの名前を選択してください。',
            typeInputSubtitle: '使用するレポートフィールドの種類を選択してください。',
            initialValueInputSubtitle: 'レポートフィールドに表示する開始値を入力してください。',
            listValuesInputSubtitle: 'これらの値はレポートフィールドのドロップダウンに表示されます。有効化された値はメンバーが選択できます。',
            listInputSubtitle: 'これらの値はレポートのフィールド一覧に表示されます。有効にした値はメンバーが選択できます。',
            deleteValue: '値を削除',
            deleteValues: '値を削除',
            disableValue: '値を無効にする',
            disableValues: '値を無効にする',
            enableValue: '値を有効化',
            enableValues: '値を有効にする',
            emptyReportFieldsValues: {
                title: 'リスト値がまだ作成されていません',
                subtitle: 'レポートに表示するカスタム値を追加します。',
            },
            deleteValuePrompt: 'このリスト値を削除してもよろしいですか？',
            deleteValuesPrompt: 'これらのリスト値を削除してもよろしいですか？',
            listValueRequiredError: 'リスト値名を入力してください',
            existingListValueError: 'この名前のリスト値はすでに存在します',
            editValue: '値を編集',
            listValues: '値の一覧',
            addValue: '値を追加',
            existingReportFieldNameError: 'この名前のレポート項目はすでに存在します',
            reportFieldNameRequiredError: 'レポートフィールド名を入力してください',
            reportFieldTypeRequiredError: 'レポートフィールドの種類を選択してください',
            circularReferenceError: 'このフィールドを自分自身に参照することはできません。更新してください。',
            reportFieldInitialValueRequiredError: 'レポートフィールドの初期値を選択してください',
            genericFailureMessage: 'レポート項目の更新中にエラーが発生しました。もう一度お試しください。',
        },
        tags: {
            tagName: 'タグ名',
            requiresTag: 'メンバーはすべての経費にタグを付ける必要があります',
            trackBillable: '請求可能な経費を追跡',
            customTagName: 'カスタムタグ名',
            enableTag: 'タグを有効にする',
            enableTags: 'タグを有効にする',
            requireTag: 'タグを必須にする',
            requireTags: 'タグを必須にする',
            notRequireTags: '必須にしない',
            disableTag: 'タグを無効にする',
            disableTags: 'タグを無効にする',
            addTag: 'タグを追加',
            editTag: 'タグを編集',
            editTags: 'タグを編集',
            findTag: 'タグを検索',
            subtitle: 'タグは、コストをより詳細な方法で分類するために使用します。',
            // TODO: Add a actual link to the help article https://github.com/Expensify/App/issues/63612
            dependentMultiLevelTagsSubtitle: ({importSpreadsheetLink}: DependentMultiLevelTagsSubtitleParams) =>
                `<muted-text>現在、<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS}">従属タグ</a>を使用しています。タグを更新するには、<a href="${importSpreadsheetLink}">スプレッドシートを再インポート</a>できます。</muted-text>`,
            emptyTags: {
                title: 'タグがまだ作成されていません',
                //  We need to remove the subtitle and use the below one when we remove the canUseMultiLevelTags beta
                subtitle: 'タグを追加して、プロジェクト、所在地、部門などを追跡しましょう。',
                subtitleHTML: `<muted-text><centered-text>スプレッドシートをインポートして、プロジェクト、所在地、部門などを追跡するタグを追加しましょう。タグファイルの書式設定については、<a href="${CONST.IMPORT_TAGS_EXPENSIFY_URL}">詳細はこちら</a>をご覧ください。</centered-text></muted-text>`,
                subtitleWithAccounting: ({accountingPageURL}: EmptyTagsSubtitleWithAccountingParams) =>
                    `<muted-text><centered-text>現在、タグは会計連携からインポートされています。変更するには、<a href="${accountingPageURL}">会計</a>に移動してください。</centered-text></muted-text>`,
            },
            deleteTag: 'タグを削除',
            deleteTags: 'タグを削除',
            deleteTagConfirmation: 'このタグを削除してもよろしいですか？',
            deleteTagsConfirmation: 'これらのタグを削除してもよろしいですか？',
            deleteFailureMessage: 'タグの削除中にエラーが発生しました。もう一度お試しください',
            tagRequiredError: 'タグ名は必須です',
            existingTagError: 'この名前のタグはすでに存在します',
            invalidTagNameError: 'タグ名を 0 にすることはできません。別の値を選択してください。',
            genericFailureMessage: 'タグの更新中にエラーが発生しました。もう一度お試しください',
            importedFromAccountingSoftware: '以下のタグは、あなたの～からインポートされています',
            glCode: 'GLコード',
            updateGLCodeFailureMessage: 'GLコードの更新中にエラーが発生しました。もう一度お試しください。',
            tagRules: 'タグルール',
            approverDescription: '承認者',
            importTags: 'タグをインポート',
            importTagsSupportingText: '経費を 1 種類のタグ、または複数のタグでコード化しましょう。',
            configureMultiLevelTags: 'マルチレベルタグ付け用にタグの一覧を設定します。',
            importMultiLevelTagsSupportingText: `タグのプレビューです。問題なければ、下のボタンをクリックしてインポートしてください。`,
            importMultiLevelTags: {
                firstRowTitle: '最初の行は、各タグリストのタイトルです',
                independentTags: 'これらは独立したタグです',
                glAdjacentColumn: '隣の列に総勘定元帳コードがあります',
            },
            tagLevel: {
                singleLevel: 'タグの単一レベル',
                multiLevel: '多階層タグ',
            },
            switchSingleToMultiLevelTagWarning: {
                title: 'タグレベルを切り替え',
                prompt1: 'タグレベルを切り替えると、現在のすべてのタグが消去されます。',
                prompt2: 'まずは～することをおすすめします',
                prompt3: 'バックアップをダウンロード',
                prompt4: 'タグをエクスポートすることで。',
                prompt5: '詳細はこちら',
                prompt6: 'タグレベルについて。',
            },
            overrideMultiTagWarning: {
                title: 'タグをインポート',
                prompt1: '本当に実行してもよろしいですか？',
                prompt2: '既存のタグは上書きされますが、あなたは',
                prompt3: 'バックアップをダウンロード',
                prompt4: '最初。',
            },
            importedTagsMessage: ({columnCounts}: ImportedTagsMessageParams) =>
                `スプレッドシート内に *${columnCounts} 列* 見つかりました。タグ名が含まれている列の横にある *Name* を選択してください。タグのステータスを設定する列の横にある *Enabled* も選択できます。`,
            cannotDeleteOrDisableAllTags: {
                title: 'すべてのタグを削除または無効にすることはできません',
                description: `ワークスペースでタグが必須のため、少なくとも 1 つのタグは有効のままにする必要があります。`,
            },
            cannotMakeAllTagsOptional: {
                title: 'すべてのタグを任意にはできません',
                description: `ワークスペースの設定でタグが必須となっているため、少なくとも 1 つのタグは必須のままにする必要があります。`,
            },
            cannotMakeTagListRequired: {
                title: 'タグリストを必須にできません',
                description: 'ポリシーで複数のタグレベルが設定されている場合にのみ、タグリストを必須にすることができます。',
            },
            tagCount: () => ({
                one: '1 日',
                other: (count: number) => `${count}件のタグ`,
            }),
        },
        taxes: {
            subtitle: '税名と税率を追加し、デフォルトを設定します。',
            addRate: 'レートを追加',
            workspaceDefault: 'ワークスペースの通貨のデフォルト',
            foreignDefault: '外貨のデフォルト',
            customTaxName: 'カスタム税名',
            value: '値',
            taxReclaimableOn: '還付対象税額',
            taxRate: '税率',
            findTaxRate: '税率を検索',
            error: {
                taxRateAlreadyExists: 'この税名はすでに使用されています',
                taxCodeAlreadyExists: 'この税コードはすでに使用されています',
                valuePercentageRange: '0～100 の間の有効なパーセンテージを入力してください',
                customNameRequired: 'カスタム税名は必須です',
                deleteFailureMessage: '税率の削除中にエラーが発生しました。もう一度お試しいただくか、Conciergeにサポートを依頼してください。',
                updateFailureMessage: '税率の更新中にエラーが発生しました。もう一度お試しいただくか、Concierge にサポートを依頼してください。',
                createFailureMessage: '税率の作成中にエラーが発生しました。もう一度お試しいただくか、Concierge に問い合わせてサポートを受けてください。',
                updateTaxClaimableFailureMessage: '返金可能な金額は、距離レートの金額より小さくなければなりません',
            },
            deleteTaxConfirmation: 'この税金を削除してもよろしいですか？',
            deleteMultipleTaxConfirmation: ({taxAmount}: TaxAmountParams) => `${taxAmount} 件の税金を削除してもよろしいですか？`,
            actions: {
                delete: 'レートを削除',
                deleteMultiple: 'レートを削除',
                enable: 'レートを有効にする',
                disable: 'レートを無効にする',
                enableTaxRates: () => ({
                    one: 'レートを有効にする',
                    other: 'レートを有効にする',
                }),
                disableTaxRates: () => ({
                    one: 'レートを無効にする',
                    other: 'レートを無効にする',
                }),
            },
            importedFromAccountingSoftware: '以下の税金は、お使いの',
            taxCode: '税コード',
            updateTaxCodeFailureMessage: '税コードの更新中にエラーが発生しました。もう一度お試しください。',
        },
        duplicateWorkspace: {
            title: '新しいワークスペースに名前を付ける',
            selectFeatures: 'コピーする機能を選択',
            whichFeatures: '新しいワークスペースへどの機能をコピーしますか？',
            confirmDuplicate: '続行しますか？',
            categories: 'カテゴリと自動カテゴリ設定ルール',
            reimbursementAccount: '払い戻し口座',
            welcomeNote: '新しいワークスペースを使い始めてください',
            delayedSubmission: '提出の遅延',
            confirmTitle: ({newWorkspaceName, totalMembers}: {newWorkspaceName?: string; totalMembers?: number}) =>
                `元のワークスペースから ${totalMembers ?? 0} 人のメンバーと一緒に ${newWorkspaceName ?? ''} を作成して共有しようとしています。`,
            error: '新しいワークスペースの複製中にエラーが発生しました。もう一度お試しください。',
        },
        emptyWorkspace: {
            title: 'ワークスペースがありません',
            subtitle: '領収書の管理、経費の精算、出張の管理、請求書の送付など、さまざまなことができます。',
            createAWorkspaceCTA: 'はじめに',
            features: {
                trackAndCollect: '領収書の追跡と回収',
                reimbursements: '従業員に精算する',
                companyCards: '法人カードを管理',
            },
            notFound: 'ワークスペースが見つかりません',
            description: 'ルームは複数人で議論したり作業したりするのに最適な場所です。共同作業を始めるには、ワークスペースを作成するか参加してください',
        },
        new: {
            newWorkspace: '新しいワークスペース',
            getTheExpensifyCardAndMore: 'Expensify Card などを入手',
            confirmWorkspace: 'ワークスペースを確認',
            myGroupWorkspace: ({workspaceNumber}: {workspaceNumber?: number}) => `マイグループワークスペース${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
            workspaceName: ({userName, workspaceNumber}: NewWorkspaceNameParams) => `${userName} のワークスペース${workspaceNumber ? ` ${workspaceNumber}` : ''}`,
        },
        people: {
            genericFailureMessage: 'ワークスペースからメンバーを削除する際にエラーが発生しました。もう一度お試しください。',
            removeMembersPrompt: ({memberName}: {memberName: string}) => ({
                one: `${memberName} を削除してもよろしいですか？`,
                other: 'これらのメンバーを削除してもよろしいですか？',
            }),
            removeMembersWarningPrompt: ({memberName, ownerName}: RemoveMembersWarningPrompt) =>
                `${memberName} はこのワークスペースの承認者です。このワークスペースの共有を解除すると、承認ワークフロー内の承認者はワークスペースのオーナーである ${ownerName} に置き換えられます`,
            removeMembersTitle: () => ({
                one: 'メンバーを削除',
                other: 'メンバーを削除',
            }),
            findMember: 'メンバーを検索',
            removeWorkspaceMemberButtonTitle: 'ワークスペースから削除',
            removeGroupMemberButtonTitle: 'グループから削除',
            removeRoomMemberButtonTitle: 'チャットから削除',
            removeMemberPrompt: ({memberName}: RemoveMemberPromptParams) => `${memberName} を削除してもよろしいですか？`,
            removeMemberTitle: 'メンバーを削除',
            transferOwner: 'オーナーを移管',
            makeMember: 'メンバーにする',
            makeAdmin: '管理者にする',
            makeAuditor: '監査人にする',
            selectAll: 'すべて選択',
            error: {
                genericAdd: 'このワークスペースメンバーの追加中に問題が発生しました',
                cannotRemove: '自分自身やワークスペースのオーナーは削除できません',
                genericRemove: 'そのワークスペースメンバーの削除中に問題が発生しました',
            },
            addedWithPrimary: '一部のメンバーは、プライマリログインで追加されました。',
            invitedBySecondaryLogin: ({secondaryLogin}: SecondaryLoginParams) => `セカンダリログイン ${secondaryLogin} によって追加されました。`,
            workspaceMembersCount: ({count}: WorkspaceMembersCountParams) => `ワークスペースメンバー数合計：${count}`,
            importMembers: 'メンバーをインポート',
            removeMemberPromptApprover: ({approver, workspaceOwner}: {approver: string; workspaceOwner: string}) =>
                `このワークスペースから${approver}を削除すると、承認ワークフロー内ではワークスペースのオーナーである${workspaceOwner}に置き換えます。`,
            removeMemberPromptPendingApproval: ({memberName}: {memberName: string}) =>
                `${memberName} には、承認が必要な未処理の経費精算書があります。ワークスペースから削除する前に、承認してもらうか、その精算書の管理権限を引き継いでください。`,
            removeMemberPromptReimburser: ({memberName}: {memberName: string}) =>
                `このワークスペースから${memberName}を削除することはできません。Workflows > Make or track payments で新しい精算担当者を設定してから、もう一度お試しください。`,
            removeMemberPromptExporter: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `このワークスペースから${memberName}を削除すると、優先エクスポーターはワークスペースのオーナーである${workspaceOwner}に置き換えられます。`,
            removeMemberPromptTechContact: ({memberName, workspaceOwner}: {memberName: string; workspaceOwner: string}) =>
                `このワークスペースから${memberName}を削除すると、技術担当者はワークスペースのオーナーである${workspaceOwner}に変更されます。`,
            cannotRemoveUserDueToReport: ({memberName}: {memberName: string}) =>
                `${memberName} は、対応が必要な未処理のレポートがあります。ワークスペースから削除する前に、必要な対応を完了するよう依頼してください。`,
        },
        card: {
            getStartedIssuing: '最初のバーチャルカードまたは物理カードを発行して始めましょう。',
            issueCard: 'カードを発行',
            issueNewCard: {
                whoNeedsCard: '誰がカードを必要としていますか？',
                inviteNewMember: '新しいメンバーを招待',
                findMember: 'メンバーを検索',
                chooseCardType: 'カードの種類を選択',
                physicalCard: '物理カード',
                physicalCardDescription: '頻繁に支出する方に最適',
                virtualCard: 'バーチャルカード',
                virtualCardDescription: '即時かつ柔軟',
                chooseLimitType: '制限タイプを選択',
                smartLimit: 'スマート上限',
                smartLimitDescription: '承認が必要になる前に、一定額まで支出できるようにする',
                monthly: '毎月',
                monthlyDescription: '月ごとに一定額まで使用する',
                fixedAmount: '固定金額',
                fixedAmountDescription: '一度だけ特定の金額まで支出する',
                setLimit: '制限を設定',
                cardLimitError: '$21,474,836 未満の金額を入力してください',
                giveItName: '名前を付けてください',
                giveItNameInstruction: '他のカードと見分けがつくように、十分ユニークな名前を付けてください。具体的な利用シーンが含まれているとなお良いです！',
                cardName: 'カード名',
                letsDoubleCheck: 'すべて正しく表示されているか、もう一度確認しましょう。',
                willBeReady: 'このカードはすぐに利用できるようになります。',
                cardholder: 'カード保有者',
                cardType: 'カードの種類',
                limit: '制限',
                limitType: '制限タイプ',
                name: '名前',
                disabledApprovalForSmartLimitError: 'スマートリミットを設定する前に、<strong>Workflows > Add approvals</strong> で承認を有効にしてください',
            },
            deactivateCardModal: {
                deactivate: '無効化',
                deactivateCard: 'カードを無効化',
                deactivateConfirmation: 'このカードを無効化すると、今後のすべての取引は拒否され、元に戻すことはできません。',
            },
        },
        accounting: {
            settings: '設定',
            title: '接続',
            subtitle: '会計システムに接続して勘定科目表で取引にコードを割り当て、自動で支払いを照合し、財務データを常に同期させましょう。',
            qbo: 'QuickBooks Online',
            qbd: 'QuickBooks Desktop',
            xero: 'Xero',
            netsuite: 'NetSuite',
            intacct: 'Sage Intacct',
            sap: 'SAP',
            oracle: 'Oracle',
            microsoftDynamics: 'Microsoft Dynamics',
            talkYourOnboardingSpecialist: '設定スペシャリストとチャットする',
            talkYourAccountManager: 'アカウントマネージャーとチャットする',
            talkToConcierge: 'Concierge とチャット',
            needAnotherAccounting: '別の会計ソフトが必要ですか？',
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
                `Expensify Classic で設定された接続にエラーがあります。[この問題を解決するには Expensify Classic に移動してください。](${oldDotPolicyConnectionsURL})`,
            goToODToSettings: '設定を管理するには、Expensify Classic に移動してください。',
            setup: '接続',
            lastSync: ({relativeDate}: LastSyncAccountingParams) => `最終同期：${relativeDate}`,
            notSync: '未同期',
            import: 'インポート',
            export: 'エクスポート',
            advanced: '詳細設定',
            other: 'その他',
            syncNow: '今すぐ同期',
            disconnect: '切断',
            reinstall: 'コネクタを再インストール',
            disconnectTitle: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName = connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : '連携';
                return `${integrationName} を切断`;
            },
            connectTitle: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? '会計連携'} を接続`,
            syncError: ({connectionName}: ConnectionNameParams) => {
                switch (connectionName) {
                    case CONST.POLICY.CONNECTIONS.NAME.QBO:
                        return 'QuickBooks Online に接続できません';
                    case CONST.POLICY.CONNECTIONS.NAME.XERO:
                        return 'Xero に接続できません';
                    case CONST.POLICY.CONNECTIONS.NAME.NETSUITE:
                        return 'NetSuite に接続できません';
                    case CONST.POLICY.CONNECTIONS.NAME.QBD:
                        return 'QuickBooks Desktop に接続できません';
                    default: {
                        return '連携に接続できません';
                    }
                }
            },
            accounts: '勘定科目表',
            taxes: '税金',
            imported: 'インポート済み',
            notImported: '未インポート',
            importAsCategory: 'カテゴリとしてインポート済み',
            importTypes: {
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.IMPORTED]: 'インポート済み',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.TAG]: 'タグとしてインポート済み',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT]: 'インポート済み',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NOT_IMPORTED]: '未インポート',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NONE]: '未インポート',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.REPORT_FIELD]: 'レポートフィールドとしてインポート済み',
                [CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT]: 'NetSuite の従業員デフォルト',
            },
            disconnectPrompt: ({connectionName}: OptionalParam<ConnectionNameParams> = {}) => {
                const integrationName =
                    connectionName && CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] : 'この連携';
                return `${integrationName} の接続を本当に解除しますか？`;
            },
            connectPrompt: ({connectionName}: ConnectionNameParams) =>
                `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName] ?? 'この会計連携'} を接続してもよろしいですか？これにより、既存の会計接続はすべて削除されます。`,
            enterCredentials: '認証情報を入力',
            connections: {
                syncStageName: ({stage}: SyncStageNameConnectionsParams) => {
                    switch (stage) {
                        case 'quickbooksOnlineImportCustomers':
                        case 'quickbooksDesktopImportCustomers':
                            return '顧客をインポートしています';
                        case 'quickbooksOnlineImportEmployees':
                        case 'netSuiteSyncImportEmployees':
                        case 'intacctImportEmployees':
                        case 'quickbooksDesktopImportEmployees':
                            return '従業員のインポート';
                        case 'quickbooksOnlineImportAccounts':
                        case 'quickbooksDesktopImportAccounts':
                            return 'アカウントのインポート';
                        case 'quickbooksOnlineImportClasses':
                        case 'quickbooksDesktopImportClasses':
                            return 'クラスのインポート';
                        case 'quickbooksOnlineImportLocations':
                            return '場所をインポートしています';
                        case 'quickbooksOnlineImportProcessing':
                            return 'インポートしたデータを処理中';
                        case 'quickbooksOnlineSyncBillPayments':
                        case 'intacctImportSyncBillPayments':
                            return '精算済みレポートと支払い済み請求書を同期中';
                        case 'quickbooksOnlineSyncTaxCodes':
                            return '税コードのインポート';
                        case 'quickbooksOnlineCheckConnection':
                            return 'QuickBooks Online 接続を確認しています';
                        case 'quickbooksOnlineImportMain':
                            return 'QuickBooks Online データのインポート';
                        case 'startingImportXero':
                            return 'Xero データのインポート';
                        case 'startingImportQBO':
                            return 'QuickBooks Online データのインポート';
                        case 'startingImportQBD':
                        case 'quickbooksDesktopImportMore':
                            return 'QuickBooks Desktop データのインポート';
                        case 'quickbooksDesktopImportTitle':
                            return 'インポート中のタイトル';
                        case 'quickbooksDesktopImportApproveCertificate':
                            return '承認証明書をインポートしています';
                        case 'quickbooksDesktopImportDimensions':
                            return 'ディメンションのインポート';
                        case 'quickbooksDesktopImportSavePolicy':
                            return '保存ポリシーをインポート中';
                        case 'quickbooksDesktopWebConnectorReminder':
                            return 'QuickBooks とデータを同期しています... Web Connector が実行中であることを確認してください';
                        case 'quickbooksOnlineSyncTitle':
                            return 'QuickBooks Online データを同期中';
                        case 'quickbooksOnlineSyncLoadData':
                        case 'xeroSyncStep':
                        case 'intacctImportData':
                            return 'データを読み込んでいます';
                        case 'quickbooksOnlineSyncApplyCategories':
                            return 'カテゴリを更新中';
                        case 'quickbooksOnlineSyncApplyCustomers':
                            return '顧客／プロジェクトを更新中';
                        case 'quickbooksOnlineSyncApplyEmployees':
                            return 'メンバーリストを更新中';
                        case 'quickbooksOnlineSyncApplyClassesLocations':
                            return 'レポートフィールドを更新しています';
                        case 'jobDone':
                            return 'インポートしたデータの読み込みを待機しています';
                        case 'xeroSyncImportChartOfAccounts':
                            return '勘定科目表を同期中';
                        case 'xeroSyncImportCategories':
                            return 'カテゴリを同期中';
                        case 'xeroSyncImportCustomers':
                            return '顧客を同期中';
                        case 'xeroSyncXeroReimbursedReports':
                            return 'Expensify レポートを精算済みとしてマークする';
                        case 'xeroSyncExpensifyReimbursedReports':
                            return 'Xero の請求書とインボイスを支払済みとしてマークする';
                        case 'xeroSyncImportTrackingCategories':
                            return 'トラッキングカテゴリを同期中';
                        case 'xeroSyncImportBankAccounts':
                            return '銀行口座の同期';
                        case 'xeroSyncImportTaxRates':
                            return '税率を同期しています';
                        case 'xeroCheckConnection':
                            return 'Xero 接続を確認中';
                        case 'xeroSyncTitle':
                            return 'Xero データを同期しています';
                        case 'netSuiteSyncConnection':
                            return 'NetSuite への接続を初期化しています';
                        case 'netSuiteSyncCustomers':
                            return '顧客をインポートしています';
                        case 'netSuiteSyncInitData':
                            return 'NetSuite からデータを取得しています';
                        case 'netSuiteSyncImportTaxes':
                            return '税金のインポート';
                        case 'netSuiteSyncImportItems':
                            return 'アイテムのインポート';
                        case 'netSuiteSyncData':
                            return 'Expensify へのデータのインポート';
                        case 'netSuiteSyncAccounts':
                            return 'アカウントを同期しています';
                        case 'netSuiteSyncCurrencies':
                            return '通貨を同期中';
                        case 'netSuiteSyncCategories':
                            return 'カテゴリを同期中';
                        case 'netSuiteSyncReportFields':
                            return 'Expensify レポートフィールドとしてデータをインポート中';
                        case 'netSuiteSyncTags':
                            return 'Expensifyタグとしてデータをインポート中';
                        case 'netSuiteSyncUpdateConnectionData':
                            return '接続情報を更新しています';
                        case 'netSuiteSyncNetSuiteReimbursedReports':
                            return 'Expensify レポートを精算済みとしてマークする';
                        case 'netSuiteSyncExpensifyReimbursedReports':
                            return 'NetSuite の請求書とインボイスを支払済みにマークする';
                        case 'netSuiteImportVendorsTitle':
                            return '取引先のインポート';
                        case 'netSuiteImportCustomListsTitle':
                            return 'カスタムリストのインポート';
                        case 'netSuiteSyncImportCustomLists':
                            return 'カスタムリストのインポート';
                        case 'netSuiteSyncImportSubsidiaries':
                            return '子会社のインポート';
                        case 'netSuiteSyncImportVendors':
                        case 'quickbooksDesktopImportVendors':
                            return '取引先のインポート';
                        case 'intacctCheckConnection':
                            return 'Sage Intacct 接続を確認しています';
                        case 'intacctImportDimensions':
                            return 'Sage Intacct ディメンションをインポート中';
                        case 'intacctImportTitle':
                            return 'Sage Intacct データのインポート';
                        default: {
                            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                            return `ステージの翻訳が見つかりません: ${stage}`;
                        }
                    }
                },
            },
            preferredExporter: '優先エクスポーター',
            exportPreferredExporterNote:
                '優先されるエクスポーターは任意のワークスペース管理者にできますが、ドメイン設定で会社カードごとに別々のエクスポートアカウントを設定する場合は、ドメイン管理者でもある必要があります。',
            exportPreferredExporterSubNote: '一度設定すると、優先エクスポーターは自分のアカウントで、エクスポート対象のレポートを表示できるようになります。',
            exportAs: 'エクスポート形式',
            exportOutOfPocket: '実費経費をエクスポートする形式',
            exportCompanyCard: '会社カード経費のエクスポート形式',
            exportDate: 'エクスポート日',
            defaultVendor: 'デフォルトのベンダー',
            autoSync: '自動同期',
            autoSyncDescription: '毎日、自動的に NetSuite と Expensify を同期します。確定したレポートをリアルタイムでエクスポートします',
            reimbursedReports: '払い済みレポートを同期',
            cardReconciliation: 'カード照合作業',
            reconciliationAccount: '調整勘定',
            continuousReconciliation: '継続的な照合',
            saveHoursOnReconciliation: '各会計期間の照合にかかる時間を何時間も節約できます。Expensify が継続的に Expensify Card の明細と精算を自動で照合します。',
            enableContinuousReconciliation: ({accountingAdvancedSettingsLink, connectionName}: EnableContinuousReconciliationParams) =>
                `<muted-text-label>継続照合を有効にするには、${connectionName} の<a href="${accountingAdvancedSettingsLink}">自動同期</a>を有効にしてください。</muted-text-label>`,
            chooseReconciliationAccount: {
                chooseBankAccount: 'Expensify Card の支払いを消し込む銀行口座を選択してください。',
                settlementAccountReconciliation: ({settlementAccountUrl, lastFourPAN}: SettlementAccountReconciliationParams) =>
                    `Continuous Reconciliation が正しく機能するように、このアカウントが、${lastFourPAN} で終わる<a href="${settlementAccountUrl}">Expensify Card の決済口座</a>と一致していることを確認してください。`,
            },
        },
        export: {
            notReadyHeading: 'エクスポートの準備ができていません',
            notReadyDescription: 'ドラフトまたは承認待ちの経費精算書は会計システムへエクスポートできません。エクスポートする前に、これらの経費を承認または精算してください。',
        },
        invoices: {
            sendInvoice: '請求書を送信',
            sendFrom: '送信元',
            invoicingDetails: '請求書の詳細',
            invoicingDetailsDescription: 'この情報は請求書に表示されます。',
            companyName: '会社名',
            companyWebsite: '会社のウェブサイト',
            paymentMethods: {
                personal: '個人',
                business: 'ビジネス',
                chooseInvoiceMethod: '下から支払い方法を選択してください:',
                payingAsIndividual: '個人として支払う',
                payingAsBusiness: 'ビジネスとして支払う',
            },
            invoiceBalance: '請求書残高',
            invoiceBalanceSubtitle: 'これは、請求書の支払いを回収して得た現在の残高です。銀行口座を追加済みであれば、自動的にその口座へ振り込まれます。',
            bankAccountsSubtitle: '請求書の支払いの送金と受け取りを行うために、銀行口座を追加してください。',
        },
        invite: {
            member: 'メンバーを招待',
            members: 'メンバーを招待',
            invitePeople: '新しいメンバーを招待',
            genericFailureMessage: 'ワークスペースへのメンバー招待中にエラーが発生しました。もう一度お試しください。',
            pleaseEnterValidLogin: `メールアドレスまたは電話番号が有効であることを確認してください（例：${CONST.EXAMPLE_PHONE_NUMBER}）。`,
            user: 'ユーザー',
            users: 'ユーザー',
            invited: '招待済み',
            removed: '削除済み',
            to: '宛先',
            from: 'から',
        },
        inviteMessage: {
            confirmDetails: '詳細を確認',
            inviteMessagePrompt: '下の欄にメッセージを追加して、招待をさらに特別なものにしましょう！',
            personalMessagePrompt: 'メッセージ',
            genericFailureMessage: 'ワークスペースへのメンバー招待中にエラーが発生しました。もう一度お試しください。',
            inviteNoMembersError: '招待するメンバーを少なくとも1人選択してください',
            joinRequest: ({user, workspaceName}: {user: string; workspaceName: string}) => `${user} が ${workspaceName} への参加をリクエストしました`,
        },
        distanceRates: {
            oopsNotSoFast: 'おっと！ ちょっと待ってください…',
            workspaceNeeds: 'ワークスペースには、少なくとも 1 つの有効な距離レートが必要です。',
            distance: '距離',
            centrallyManage: 'レートを一元管理し、走行距離をマイルまたはキロメートルで記録し、デフォルトのカテゴリを設定します。',
            rate: 'レート',
            addRate: 'レートを追加',
            findRate: 'レートを検索',
            trackTax: '税金を追跡',
            deleteRates: () => ({
                one: 'レートを削除',
                other: 'レートを削除',
            }),
            enableRates: () => ({
                one: 'レートを有効にする',
                other: 'レートを有効にする',
            }),
            disableRates: () => ({
                one: 'レートを無効にする',
                other: 'レートを無効にする',
            }),
            enableRate: 'レートを有効にする',
            status: 'ステータス',
            unit: '単位',
            taxFeatureNotEnabledMessage:
                '<muted-text>この機能を利用するには、ワークスペースで税金を有効にする必要があります。その変更を行うには、<a href="#">その他の機能</a>に移動してください。</muted-text>',
            deleteDistanceRate: '距離レートを削除',
            areYouSureDelete: () => ({
                one: 'このレートを削除してもよろしいですか？',
                other: 'これらのレートを削除してもよろしいですか？',
            }),
            errors: {
                rateNameRequired: '料金名は必須です',
                existingRateName: 'この名前の距離レートはすでに存在します',
            },
        },
        editor: {
            descriptionInputLabel: '説明',
            nameInputLabel: '名前',
            typeInputLabel: 'タイプ',
            initialValueInputLabel: '初期値',
            nameInputHelpText: 'これはワークスペース上で表示される名前です。',
            nameIsRequiredError: 'ワークスペースに名前を付けてください',
            currencyInputLabel: 'デフォルト通貨',
            currencyInputHelpText: 'このワークスペースのすべての経費は、この通貨に変換されます。',
            currencyInputDisabledText: ({currency}: CurrencyInputDisabledTextParams) => `このワークスペースは ${currency} の銀行口座にリンクされているため、デフォルト通貨は変更できません。`,
            save: '保存',
            genericFailureMessage: 'ワークスペースの更新中にエラーが発生しました。もう一度お試しください。',
            avatarUploadFailureMessage: 'アバターのアップロード中にエラーが発生しました。もう一度お試しください。',
            addressContext: 'Expensify Travel を有効にするにはワークスペースの住所が必要です。お客様のビジネスに関連する住所を入力してください。',
            policy: '経費ポリシー',
        },
        bankAccount: {
            continueWithSetup: 'セットアップを続行',
            youAreAlmostDone: '銀行口座の設定はほぼ完了しています。設定が完了すると、コーポレートカードの発行、経費精算、請求書の回収、支払いができるようになります。',
            streamlinePayments: '支払いを効率化',
            connectBankAccountNote: '注意：ワークスペースでの支払いには、個人の銀行口座は使用できません。',
            oneMoreThing: 'もう一つだけ！',
            allSet: 'これで準備完了です！',
            accountDescriptionWithCards: 'この銀行口座は、コーポレートカードの発行、経費の精算、請求書の回収、および支払いに使用されます。',
            letsFinishInChat: 'チャットで完了しましょう！',
            finishInChat: 'チャットで完了',
            almostDone: 'ほとんど完了しました！',
            disconnectBankAccount: '銀行口座の接続を解除',
            startOver: '最初からやり直す',
            updateDetails: '詳細を更新',
            yesDisconnectMyBankAccount: 'はい、銀行口座との接続を解除します',
            yesStartOver: 'はい、最初からやり直します',
            disconnectYourBankAccount: ({bankName}: DisconnectYourBankAccountParams) => `<strong>${bankName}</strong> 銀行口座の接続を解除します。この口座の未処理取引は引き続き完了します。`,
            clearProgress: '最初からやり直すと、これまでの進行状況がすべて消去されます。',
            areYouSure: '本当に実行してもよろしいですか？',
            workspaceCurrency: 'ワークスペース通貨',
            updateCurrencyPrompt: '現在ご利用のワークスペースは、USD とは異なる通貨に設定されているようです。下のボタンをクリックして、通貨を USD に更新してください。',
            updateToUSD: 'USD に更新',
            updateWorkspaceCurrency: 'ワークスペース通貨を更新',
            workspaceCurrencyNotSupported: 'ワークスペースの通貨はサポートされていません',
            yourWorkspace: `あなたのワークスペースはサポートされていない通貨に設定されています。<a href="${CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}">サポートされている通貨の一覧</a>を表示してください。`,
            chooseAnExisting: '既存の銀行口座を選択して経費を支払うか、新しい口座を追加してください。',
        },
        changeOwner: {
            changeOwnerPageTitle: 'オーナーを移管',
            addPaymentCardTitle: '所有権を移転するために支払いカードを入力してください',
            addPaymentCardButtonText: '利用規約に同意して支払いカードを追加',
            addPaymentCardReadAndAcceptText: `<muted-text-micro>カードを追加するには、<a href="${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}">利用規約</a>と<a href="${CONST.OLD_DOT_PUBLIC_URLS.PRIVACY_URL}">プライバシーポリシー</a>をお読みのうえ、同意してください。</muted-text-micro>`,
            addPaymentCardPciCompliant: 'PCI-DSS 準拠',
            addPaymentCardBankLevelEncrypt: '銀行レベルの暗号化',
            addPaymentCardRedundant: '冗長インフラストラクチャ',
            addPaymentCardLearnMore: `<muted-text>当社の<a href="${CONST.PERSONAL_DATA_PROTECTION_INFO_URL}">セキュリティ</a>について詳しく見る。</muted-text>`,
            amountOwedTitle: '未払残高',
            amountOwedButtonText: 'OK',
            amountOwedText: 'このアカウントには前月からの未払い残高があります。\n\n残高を清算して、このワークスペースの請求管理を引き継ぎますか？',
            ownerOwesAmountTitle: '未払残高',
            ownerOwesAmountButtonText: '残高を振替',
            ownerOwesAmountText: ({email, amount}: OwnerOwesAmountParams) => `このワークスペース（${email}）の所有アカウントには、前月からの未払残高があります。

このワークスペースの請求を引き継ぐために、この金額（${amount}）を振り替えますか？お支払いカードには直ちに請求が行われます。`,
            subscriptionTitle: '年額サブスクリプションを引き継ぐ',
            subscriptionButtonText: 'サブスクリプションを移行',
            subscriptionText: ({usersCount, finalCount}: ChangeOwnerSubscriptionParams) =>
                `このワークスペースを引き継ぐと、その年間サブスクリプションは現在のサブスクリプションと統合されます。これにより、サブスクリプションの人数が${usersCount}人増え、新しいサブスクリプションの合計人数は${finalCount}人になります。続行しますか？`,
            duplicateSubscriptionTitle: '重複サブスクリプションの警告',
            duplicateSubscriptionButtonText: '続行',
            duplicateSubscriptionText: ({
                email,
                workspaceName,
            }: ChangeOwnerDuplicateSubscriptionParams) => `${email} さんのワークスペースの請求管理を引き継ごうとしているようですが、そのためには、まずその方のすべてのワークスペースで管理者である必要があります。

ワークスペース ${workspaceName} の請求管理だけを引き継ぎたい場合は、「Continue」をクリックしてください。

サブスクリプション全体の請求管理を引き継ぎたい場合は、請求管理を引き継ぐ前に、その方のすべてのワークスペースであなたを管理者として追加してもらってください。`,
            hasFailedSettlementsTitle: '所有権を移譲できません',
            hasFailedSettlementsButtonText: '了解しました',
            hasFailedSettlementsText: ({email}: ChangeOwnerHasFailedSettlementsParams) =>
                `${email} に未払いの Expensify Card 精算があるため、請求の引き継ぎはできません。問題を解決するために、concierge@expensify.com まで連絡するよう依頼してください。その後、このワークスペースの請求を引き継ぐことができます。`,
            failedToClearBalanceTitle: '残高をクリアできませんでした',
            failedToClearBalanceButtonText: 'OK',
            failedToClearBalanceText: '残高を精算できませんでした。後でもう一度お試しください。',
            successTitle: 'やった！すべて完了しました。',
            successDescription: 'あなたはこのワークスペースのオーナーになりました。',
            errorTitle: 'おっと！ ちょっと待ってください…',
            errorDescription: `<muted-text><centered-text>このワークスペースの所有権を移行する際に問題が発生しました。もう一度お試しいただくか、サポートが必要な場合は<concierge-link>Concierge にお問い合わせください</concierge-link>。</centered-text></muted-text>`,
        },
        exportAgainModal: {
            title: '注意！',
            description: ({
                reportName,
                connectionName,
            }: ExportAgainModalDescriptionParams) => `次のレポートはすでに ${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} にエクスポートされています。

${reportName}

本当にもう一度エクスポートしますか？`,
            confirmText: 'はい、再度エクスポートします',
            cancelText: 'キャンセル',
        },
        upgrade: {
            reportFields: {
                title: 'レポートフィールド',
                description: `レポートフィールドを使用すると、明細ごとの経費に関連するタグとは異なり、レポートのヘッダーレベルの詳細を指定できます。これらの詳細には、特定のプロジェクト名、出張情報、場所などを含めることができます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>レポートフィールドは Control プランでのみご利用いただけます。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`}からご利用可能です。</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                title: 'NetSuite',
                description: `Expensify + NetSuite の連携で自動同期を活用し、手動入力を削減しましょう。プロジェクトや顧客マッピングを含むネイティブおよびカスタムセグメントに対応し、詳細かつリアルタイムな財務インサイトを得ることができます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>NetSuite との連携機能は Control プランでのみご利用いただけます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`} からです。</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                title: 'Sage Intacct',
                description: `Expensify と Sage Intacct の連携で、自動同期を利用して手入力を削減しましょう。ユーザー定義ディメンションに加え、部門、クラス、拠点、顧客、プロジェクト（ジョブ）別の経費コード設定により、詳細かつリアルタイムな財務インサイトを得ることができます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Sage Intacct 連携機能は Control プランでのみご利用いただけます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`} からとなります</muted-text>`,
            },
            [CONST.POLICY.CONNECTIONS.NAME.QBD]: {
                title: 'QuickBooks Desktop',
                description: `Expensify + QuickBooks Desktop の連携により、自動同期を利用して手入力を削減しましょう。クラス、品目、顧客、プロジェクトごとの経費コード設定に対応した、リアルタイムの双方向接続で、究極の効率性を実現できます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>QuickBooks Desktop 連携は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`} からの Control プランでのみご利用いただけます</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.id]: {
                title: '高度な承認',
                description: `承認フローにさらに多くのレイヤーを追加したい場合や、高額な経費に別の確認の目を入れたいだけの場合でも、心配はいりません。高度な承認機能を使えば、あらゆるレベルで適切なチェック体制を整え、チームの支出をしっかり管理できます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>高度な承認機能は Control プランでのみご利用いただけます。このプランは <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`} からご利用いただけます</muted-text>`,
            },
            categories: {
                title: 'カテゴリー',
                description: 'カテゴリを使用すると、支出を追跡して整理できます。デフォルトのカテゴリを使用するか、自分でカテゴリを追加してください。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>カテゴリーは Collect プランでご利用いただけます。料金は <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`} からです。</muted-text>`,
            },
            glCodes: {
                title: 'GLコード',
                description: `勘定コードをカテゴリやタグに追加して、経費を会計および給与システムへ簡単にエクスポートできるようにしましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GLコードはControlプランでのみ利用可能です。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`}からご利用いただけます</muted-text>`,
            },
            glAndPayrollCodes: {
                title: 'GL & 給与コード',
                description: `会計および給与システムへの経費の簡単なエクスポートのために、カテゴリに GL コードと給与コードを追加しましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>GL & Payroll コードは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`} からの Control プランでのみご利用いただけます</muted-text>`,
            },
            taxCodes: {
                title: '税コード',
                description: `経費を会計システムや給与システムへ簡単にエクスポートできるように、税金に税コードを追加しましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>税コードは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`} からの Control プランでのみ利用できます</muted-text>`,
            },
            companyCards: {
                title: '無制限の法人カード',
                description: `カードフィードをさらに追加する必要がありますか？すべての主要なカード発行会社から取引を同期できる、無制限の法人カードを有効にしましょう。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>これはControlプランでのみ利用可能です。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`} からご利用いただけます</muted-text>`,
            },
            rules: {
                title: 'ルール',
                description: `ルールはバックグラウンドで動作し、細かなことを気にしなくても支出を管理できるようにします。

領収書や説明などの経費詳細の入力を必須にし、上限やデフォルトを設定して、承認と支払いを自動化 — すべてを 1 か所で行えます。`,
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>ルールはコントロールプランでのみご利用いただけます。料金は<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`}からです。</muted-text>`,
            },
            perDiem: {
                title: '日当',
                description:
                    '日当は、従業員が出張するときの毎日の費用を、コンプライアンスに則り予測しやすく管理する優れた方法です。カスタムレート、デフォルトカテゴリ、目的地やサブレートといった、より細かな設定などの機能をご利用いただけます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>日当は Control プランでのみご利用いただけます。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`} からご利用可能です</muted-text>`,
            },
            travel: {
                title: '出張',
                description: 'Expensify Travel は、メンバーが宿泊施設、航空券、交通手段などを予約できる、新しい法人向け出張予約・管理プラットフォームです。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>Travel は Collect プランでご利用いただけます。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`} から</muted-text>`,
            },
            reports: {
                title: 'レポート',
                description: 'レポートを使用すると、経費をまとめて管理および整理しやすくなります。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>レポートは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`} からの Collect プランで利用可能です</muted-text>`,
            },
            multiLevelTags: {
                title: '多階層タグ',
                description:
                    'マルチレベルタグを使用すると、経費をより高い精度で追跡できます。部門、クライアント、コストセンターなど、各明細行に複数のタグを割り当てて、あらゆる経費の背景情報を完全に記録しましょう。これにより、より詳細なレポート作成、承認ワークフロー、および会計エクスポートが可能になります。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>マルチレベルタグは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`}からご利用いただけるControlプランでのみ利用可能です</muted-text>`,
            },
            distanceRates: {
                title: '距離レート',
                description: '自分専用のレートを作成・管理し、マイルまたはキロメートルで距離を記録し、距離経費のデフォルトカテゴリを設定できます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>距離レートは Collect プランでご利用いただけます。<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`} からご利用可能です</muted-text>`,
            },
            auditor: {
                title: '監査人',
                description: '監査担当者は、可視性の確保とコンプライアンス監視のため、すべてのレポートへの閲覧専用アクセス権を付与されます。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>監査者機能は、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`} からの Control プランでのみ利用できます</muted-text>`,
            },
            [CONST.UPGRADE_FEATURE_INTRO_MAPPING.multiApprovalLevels.id]: {
                title: '複数の承認レベル',
                description: '複数承認レベルは、精算前にレポートの承認者が1人以上必要な会社向けのワークフロー ツールです。',
                onlyAvailableOnPlan: ({formattedPrice, hasTeam2025Pricing}: {formattedPrice: string; hasTeam2025Pricing: boolean}) =>
                    `<muted-text>複数の承認レベルは、<strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`} からご利用いただける Control プランでのみ利用可能です</muted-text>`,
            },
            pricing: {
                perActiveMember: 'アクティブメンバー1人あたり1か月ごと。',
                perMember: 'メンバー1人あたり月額。',
            },
            note: ({subscriptionLink}: WorkspaceUpgradeNoteParams) =>
                `<muted-text>この機能を利用するにはアップグレードしてください。または、<a href="${subscriptionLink}">詳細</a> からプランと料金についてご確認ください。</muted-text>`,
            upgradeToUnlock: 'この機能を有効にする',
            completed: {
                headline: `ワークスペースをアップグレードしました！`,
                successMessage: ({policyName, subscriptionLink}: UpgradeSuccessMessageParams) =>
                    `<centered-text>${policyName} を Control プランに正常にアップグレードしました！ 詳細については、<a href="${subscriptionLink}">サブスクリプションを表示</a>してください。</centered-text>`,
                categorizeMessage: `Collectプランへのアップグレードが完了しました。これで経費をカテゴリ分けできるようになりました！`,
                travelMessage: `Collect プランへのアップグレードが完了しました。これで、出張の予約や管理を開始できます！`,
                distanceRateMessage: `Collectプランへのアップグレードが完了しました。これで距離レートを変更できるようになりました！`,
                gotIt: '承知しました、ありがとうございます',
                createdWorkspace: `ワークスペースを作成しました！`,
            },
            commonFeatures: {
                title: 'Control プランにアップグレード',
                note: '以下を含む、最も強力な機能をアンロック:',
                benefits: {
                    startsAtFull: ({learnMoreMethodsRoute, formattedPrice, hasTeam2025Pricing}: LearnMoreRouteParams) =>
                        `<muted-text>Control プランは <strong>${formattedPrice}</strong> ${hasTeam2025Pricing ? `メンバー1人あたり月額。` : `アクティブメンバー1人あたり1か月ごと。`} からご利用いただけます。プランと料金の詳細は <a href="${learnMoreMethodsRoute}">こちら</a> をご覧ください。</muted-text>`,
                    benefit1: '高度な会計連携（NetSuite、Sage Intacct など）',
                    benefit2: 'スマート経費ルール',
                    benefit3: '多段階承認ワークフロー',
                    benefit4: '強化されたセキュリティ制御',
                    toUpgrade: 'アップグレードするには、クリックしてください',
                    selectWorkspace: 'ワークスペースを選択し、プランの種類を に変更してください',
                },
            },
        },
        downgrade: {
            commonFeatures: {
                title: 'Collect プランにダウングレード',
                note: 'ダウングレードすると、これらの機能などへのアクセスを失います。',
                benefits: {
                    note: '各プランの詳細な比較については、こちらをご覧ください',
                    pricingPage: '料金ページ',
                    confirm: '設定を削除してダウングレードしてもよろしいですか？',
                    warning: 'これは元に戻せません。',
                    benefit1: '会計連携（QuickBooks Online と Xero を除く）',
                    benefit2: 'スマート経費ルール',
                    benefit3: '多段階承認ワークフロー',
                    benefit4: '強化されたセキュリティ制御',
                    headsUp: '注意！',
                    multiWorkspaceNote: 'Collectレートでのサブスクリプションを開始するには、初回の月額支払い前にすべてのワークスペースをダウングレードする必要があります。クリック',
                    selectStep: '> 各ワークスペースを選択 > プランの種類を に変更',
                },
            },
            completed: {
                headline: 'ワークスペースはダウングレードされました',
                description: 'Controlプランのほかのワークスペースがあります。Collect料金で請求を受けるには、すべてのワークスペースをダウングレードする必要があります。',
                gotIt: '承知しました、ありがとうございます',
            },
        },
        payAndDowngrade: {
            title: '支払いとダウングレード',
            headline: 'あなたの最終支払い',
            description1: ({formattedAmount}: PayAndDowngradeDescriptionParams) => `このサブスクリプションの最終請求額は<strong>${formattedAmount}</strong>です`,
            description2: ({date}: DateParams) => `${date} の内訳は以下のとおりです:`,
            subscription:
                'ご注意ください！この操作を行うと、Expensify のサブスクリプションが終了し、このワークスペースが削除され、すべてのワークスペースメンバーが削除されます。このワークスペースを残したまま自分だけを削除したい場合は、先に別の管理者に請求管理を引き継いでもらってください。',
            genericFailureMessage: '請求書の支払い中にエラーが発生しました。もう一度お試しください。',
        },
        restrictedAction: {
            restricted: '制限中',
            actionsAreCurrentlyRestricted: ({workspaceName}: ActionsAreCurrentlyRestricted) => `現在、${workspaceName} ワークスペースでの操作は制限されています`,
            workspaceOwnerWillNeedToAddOrUpdatePaymentCard: ({workspaceOwnerName}: WorkspaceOwnerWillNeedToAddOrUpdatePaymentCardParams) =>
                `ワークスペースのオーナーである ${workspaceOwnerName} が、ワークスペースでの新しいアクティビティを有効にするために、登録済みの支払いカードを追加または更新する必要があります。`,
            youWillNeedToAddOrUpdatePaymentCard: '新しいワークスペースのアクティビティを有効にするには、登録済みの支払いカードを追加または更新する必要があります。',
            addPaymentCardToUnlock: 'ロック解除するには支払いカードを追加してください！',
            addPaymentCardToContinueUsingWorkspace: 'このワークスペースを引き続き利用するには支払いカードを追加してください',
            pleaseReachOutToYourWorkspaceAdmin: 'ご不明な点がある場合は、ワークスペース管理者にお問い合わせください。',
            chatWithYourAdmin: '管理者とチャット',
            chatInAdmins: '#admins でチャット',
            addPaymentCard: '支払カードを追加',
            goToSubscription: 'サブスクリプションに移動',
        },
        rules: {
            individualExpenseRules: {
                title: '経費',
                subtitle: ({categoriesPageLink, tagsPageLink}: IndividualExpenseRulesSubtitleParams) =>
                    `<muted-text>個々の経費に対する支出コントロールとデフォルトを設定します。<a href="${categoriesPageLink}">カテゴリー</a>や<a href="${tagsPageLink}">タグ</a>のルールを作成することもできます。</muted-text>`,
                receiptRequiredAmount: '領収書が必要な金額',
                receiptRequiredAmountDescription: '支出がこの金額を超えた場合、カテゴリールールで上書きされない限り、領収書を必須にする。',
                maxExpenseAmount: '最大経費額',
                maxExpenseAmountDescription: 'カテゴリルールで上書きされない限り、この金額を超える支出にフラグを付けます。',
                maxAge: '最大年齢',
                maxExpenseAge: '最大経費期間',
                maxExpenseAgeDescription: '特定の日数より前の支出にフラグを付ける',
                maxExpenseAgeDays: () => ({
                    one: '1日',
                    other: (count: number) => `${count}日`,
                }),
                cashExpenseDefault: '現金経費のデフォルト',
                cashExpenseDefaultDescription:
                    '現金経費をどのように作成するかを選択してください。会社カードの取引としてインポートされていない経費は、現金経費と見なされます。これには、手動で作成された経費、領収書、日当、距離、時間に基づく経費が含まれます。',
                reimbursableDefault: '払い戻し対象',
                reimbursableDefaultDescription: '経費は多くの場合、従業員に払い戻されます',
                nonReimbursableDefault: '非精算',
                nonReimbursableDefaultDescription: '経費は時折、従業員に払い戻されます',
                alwaysReimbursable: '常に精算対象',
                alwaysReimbursableDescription: '経費は常に従業員に払い戻されます',
                alwaysNonReimbursable: '常に個人精算対象外',
                alwaysNonReimbursableDescription: '経費は従業員に一切精算されません',
                billableDefault: '請求可能デフォルト',
                billableDefaultDescription: ({tagsPageLink}: BillableDefaultDescriptionParams) =>
                    `<muted-text>現金およびクレジットカードの経費を、デフォルトで請求可能にするかどうかを選択します。請求可能な経費は<a href="${tagsPageLink}">タグ</a>で有効または無効にできます。</muted-text>`,
                billable: '請求可能',
                billableDescription: '経費は、ほとんどの場合クライアントに再請求されます',
                nonBillable: '請求対象外',
                nonBillableDescription: '経費は時折クライアントに再請求されます',
                eReceipts: 'eReceipts',
                eReceiptsHint: `eReceipt は[ほとんどの米ドル建てのクレジット取引に対して自動作成されます](${CONST.DEEP_DIVE_ERECEIPTS})。`,
                attendeeTracking: '出席者の追跡',
                attendeeTrackingHint: '各経費の一人あたりの金額を追跡します。',
                prohibitedDefaultDescription:
                    'アルコール、ギャンブル、その他の制限対象品目が含まれているレシートにフラグを付けてください。これらの明細項目が含まれるレシートを伴う経費は、手動での確認が必要になります。',
                prohibitedExpenses: '禁止経費',
                alcohol: 'アルコール',
                hotelIncidentals: 'ホテル雑費',
                gambling: 'ギャンブル',
                tobacco: 'タバコ',
                adultEntertainment: 'アダルトエンターテインメント',
            },
            expenseReportRules: {
                title: '経費精算書',
                subtitle: '経費精算レポートのコンプライアンス、承認、および支払いを自動化します。',
                preventSelfApprovalsTitle: '自己承認を防止',
                preventSelfApprovalsSubtitle: 'ワークスペースメンバーが自分の経費レポートを承認できないようにする。',
                autoApproveCompliantReportsTitle: '準拠したレポートを自動承認',
                autoApproveCompliantReportsSubtitle: '自動承認の対象となる経費レポートを設定します。',
                autoApproveReportsUnderTitle: '以下の条件でレポートを自動承認',
                autoApproveReportsUnderDescription: 'この金額以下で完全にコンプライアンスに準拠している経費精算書は、自動的に承認されます。',
                randomReportAuditTitle: 'ランダムレポート監査',
                randomReportAuditDescription: '一部のレポートについては、たとえ自動承認の条件を満たしていても、手動承認を必須にする。',
                autoPayApprovedReportsTitle: '自動支払いが承認されたレポート',
                autoPayApprovedReportsSubtitle: '自動支払いの対象となる経費レポートを設定します。',
                autoPayApprovedReportsLimitError: ({currency}: AutoPayApprovedReportsLimitErrorParams = {}) => `${currency ?? ''}20,000未満の金額を入力してください`,
                autoPayApprovedReportsLockedSubtitle: '[詳細機能] に移動してワークフローを有効にし、その後 [支払い] を追加してこの機能を有効化してください。',
                autoPayReportsUnderTitle: '次の金額未満のレポートを自動支払い',
                autoPayReportsUnderDescription: 'この金額以下で完全準拠の経費精算書は、自動的に支払われます。',
                unlockFeatureEnableWorkflowsSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `[その他の機能](${moreFeaturesLink})に移動してワークフローを有効にし、その後${featureName}を追加してこの機能を有効化してください。`,
                enableFeatureSubtitle: ({featureName, moreFeaturesLink}: FeatureNameParams) =>
                    `[その他の機能](${moreFeaturesLink})に移動し、${featureName} を有効にしてこの機能を利用できるようにしてください。`,
            },
            categoryRules: {
                title: 'カテゴリルール',
                approver: '承認者',
                requireDescription: '説明を必須にする',
                descriptionHint: '説明のヒント',
                descriptionHintDescription: ({categoryName}: CategoryNameParams) =>
                    `従業員に「${categoryName}」の支出について追加情報を入力するよう促します。このヒントは経費の説明フィールドに表示されます。`,
                descriptionHintLabel: 'ヒント',
                descriptionHintSubtitle: 'プロ向けヒント：短いほど良いです！',
                maxAmount: '最大金額',
                flagAmountsOver: '次の金額を超えるものにフラグを付ける',
                flagAmountsOverDescription: ({categoryName}: CategoryNameParams) => `カテゴリ「${categoryName}」に適用されます。`,
                flagAmountsOverSubtitle: 'これは、すべての経費の上限額を上書きします。',
                expenseLimitTypes: {
                    expense: '個別経費',
                    expenseSubtitle: 'カテゴリーごとに経費金額にフラグを設定します。このルールは、経費金額の上限に関するワークスペース全体の一般ルールを上書きします。',
                    daily: 'カテゴリ合計',
                    dailySubtitle: '経費レポートごとにカテゴリ合計支出にフラグを立てる。',
                },
                requireReceiptsOver: '領収書の必須条件（上限額）',
                requireReceiptsOverList: {
                    default: ({defaultAmount}: DefaultAmountParams) => `${defaultAmount} ${CONST.DOT_SEPARATOR} デフォルト`,
                    never: 'レシートを常に不要にする',
                    always: '常にレシートを必須にする',
                },
                defaultTaxRate: 'デフォルト税率',
                enableWorkflows: ({moreFeaturesLink}: RulesEnableWorkflowsParams) =>
                    `[その他の機能](${moreFeaturesLink}) に移動してワークフローを有効にし、承認を追加してこの機能を有効化してください。`,
            },
            customRules: {
                title: '経費ポリシー',
                cardSubtitle: 'ここにあなたのチームの経費ポリシーが保存されます。これにより、何が対象になるかについて、全員が共通認識を持てます。',
            },
        },
        planTypePage: {
            planTypes: {
                team: {
                    label: '回収',
                    description: 'プロセスを自動化したいチーム向け。',
                },
                corporate: {
                    label: 'コントロール',
                    description: '高度な要件を持つ組織向け。',
                },
            },
            description: 'あなたに最適なプランをお選びください。機能と料金の詳細な一覧については、こちらをご覧ください',
            subscriptionLink: 'プランの種類と料金に関するヘルプページ',
            lockedPlanDescription: ({count, annualSubscriptionEndDate}: WorkspaceLockedPlanTypeParams) => ({
                one: `あなたは、年額サブスクリプションが${annualSubscriptionEndDate}に終了するまで、Controlプランでアクティブメンバー1名を利用することに同意しています。${annualSubscriptionEndDate}以降は、自動更新をオフにすることで、従量課金サブスクリプションに切り替え、Collectプランへダウングレードできます`,
                other: `あなたは${annualSubscriptionEndDate}までControlプランで${count}名のアクティブメンバーを契約しています。自動更新を無効にすると、${annualSubscriptionEndDate}以降に従量課金制サブスクリプションへ切り替え、Collectプランへダウングレードできます。`,
            }),
            subscriptions: 'サブスクリプション',
        },
    },
    getAssistancePage: {
        title: 'サポートを受ける',
        subtitle: '私たちは、あなたが偉業へと進む道を切り開くお手伝いをします！',
        description: '以下のサポートオプションから選択してください：',
        chatWithConcierge: 'Concierge とチャット',
        scheduleSetupCall: 'セットアップ通話を予約',
        scheduleACall: '通話を予約',
        questionMarkButtonTooltip: '弊社チームにサポートを依頼',
        exploreHelpDocs: 'ヘルプドキュメントを表示',
        registerForWebinar: 'ウェビナーに登録',
        onboardingHelp: 'オンボーディングのヘルプ',
    },
    emojiPicker: {
        skinTonePickerLabel: 'デフォルトの肌の色を変更',
        headers: {
            frequentlyUsed: 'よく使う',
            smileysAndEmotion: 'スマイリーと感情',
            peopleAndBody: '人と体',
            animalsAndNature: '動物と自然',
            foodAndDrink: '飲食',
            travelAndPlaces: '旅行 & 場所',
            activities: 'アクティビティ',
            objects: 'オブジェクト',
            symbols: '記号',
            flags: 'フラグ',
        },
    },
    newRoomPage: {
        newRoom: '新しいルーム',
        groupName: 'グループ名',
        roomName: 'ルーム名',
        visibility: '表示設定',
        restrictedDescription: 'あなたのワークスペースのメンバーはこのルームを見つけることができます',
        privateDescription: 'このルームに招待された人は、このルームを見つけることができます',
        publicDescription: '誰でもこのルームを見つけることができます',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        public_announceDescription: '誰でもこのルームを見つけることができます',
        createRoom: 'ルームを作成',
        roomAlreadyExistsError: 'この名前のルームはすでに存在します',
        roomNameReservedError: ({reservedName}: RoomNameReservedErrorParams) =>
            `${reservedName} は、すべてのワークスペースで使用されるデフォルトのルーム名です。別の名前を選択してください。`,
        roomNameInvalidError: 'ルーム名には、小文字の英字、数字、ハイフンのみ使用できます',
        pleaseEnterRoomName: '部屋名を入力してください',
        pleaseSelectWorkspace: 'ワークスペースを選択してください',
        renamedRoomAction: ({oldName, newName, actorName, isExpenseReport}: RenamedRoomActionParams) => {
            const actor = actorName ? `${actorName} ` : '';
            return isExpenseReport
                ? `${actor}は「${newName}」に名称変更しました（以前の名称：「${oldName}」）`
                : `${actor}がこのルーム名を「${newName}」（以前は「${oldName}」）に変更しました`;
        },
        roomRenamedTo: ({newName}: RoomRenamedToParams) => `ルーム名が${newName}に変更されました`,
        social: 'ソーシャル',
        selectAWorkspace: 'ワークスペースを選択',
        growlMessageOnRenameError: 'ワークスペースルームの名前を変更できません。接続を確認して、もう一度お試しください。',
        visibilityOptions: {
            restricted: 'ワークスペース', // the translation for "restricted" visibility is actually workspace. This is so we can display restricted visibility rooms as "workspace" without having to change what's stored.
            private: '非公開',
            public: '公開',
            // eslint-disable-next-line @typescript-eslint/naming-convention
            public_announce: '公開発表',
        },
    },
    workspaceApprovalModes: {
        submitAndClose: '送信して閉じる',
        submitAndApprove: '提出して承認',
        advanced: '詳細',
        dynamicExternal: '動的外部',
        smartReport: 'SMARTREPORT',
        billcom: 'BILLCOM',
    },
    workspaceActions: {
        addApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) =>
            `${approverName}（${approverEmail}）を、${field}「${name}」の承認者として追加しました`,
        deleteApprovalRule: ({approverEmail, approverName, field, name}: AddedPolicyApprovalRuleParams) => `${approverName}（${approverEmail}）を${field}「${name}」の承認者から削除しました`,
        updateApprovalRule: ({field, name, newApproverEmail, newApproverName, oldApproverEmail, oldApproverName}: UpdatedPolicyApprovalRuleParams) => {
            const formatApprover = (displayName?: string, email?: string) => (displayName ? `${displayName} (${email})` : email);
            return `${field}「${name}」の承認者を${formatApprover(newApproverName, newApproverEmail)}（以前は${formatApprover(oldApproverName, oldApproverEmail)}）に変更しました`;
        },
        addCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `カテゴリ「${categoryName}」を追加しました`,
        deleteCategory: ({categoryName}: UpdatedPolicyCategoryParams) => `カテゴリ「${categoryName}」を削除しました`,
        updateCategory: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => `${oldValue ? '無効' : '有効'} カテゴリ「${categoryName}」`,
        updateCategoryPayrollCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `給与コード「${newValue}」をカテゴリ「${categoryName}」に追加しました`;
            }
            if (!newValue && oldValue) {
                return `カテゴリ「${categoryName}」から給与コード「${oldValue}」を削除しました`;
            }
            return `カテゴリ「${categoryName}」の給与コードを「${newValue}」（以前は「${oldValue}」）に変更しました`;
        },
        updateCategoryGLCode: ({oldValue, categoryName, newValue}: UpdatedPolicyCategoryGLCodeParams) => {
            if (!oldValue) {
                return `カテゴリー「${categoryName}」にGLコード「${newValue}」を追加しました`;
            }
            if (!newValue && oldValue) {
                return `カテゴリ「${categoryName}」からGLコード「${oldValue}」を削除しました`;
            }
            return `「${categoryName}」カテゴリのGLコードを「${newValue}」（以前は「${oldValue}」）に変更しました`;
        },
        updateAreCommentsRequired: ({oldValue, categoryName}: UpdatedPolicyCategoryParams) => {
            return `「${categoryName}」カテゴリの説明を${!oldValue ? '必須' : '必須ではありません'}（以前は${!oldValue ? '必須ではありません' : '必須'}）に変更しました`;
        },
        updateCategoryMaxExpenseAmount: ({categoryName, oldAmount, newAmount}: UpdatedPolicyCategoryMaxExpenseAmountParams) => {
            if (newAmount && !oldAmount) {
                return `カテゴリ「${categoryName}」に上限額 ${newAmount} を追加しました`;
            }
            if (oldAmount && !newAmount) {
                return `カテゴリ「${categoryName}」から ${oldAmount} の上限額を削除しました`;
            }
            return `「${categoryName}」カテゴリの上限金額を${newAmount}に変更しました（以前は${oldAmount}）`;
        },
        updateCategoryExpenseLimitType: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryExpenseLimitTypeParams) => {
            if (!oldValue) {
                return `カテゴリ「${categoryName}」に制限タイプ「${newValue}」を追加しました`;
            }
            return `「${categoryName}」カテゴリの上限タイプを${newValue}に変更しました（以前は${oldValue}）`;
        },
        updateCategoryMaxAmountNoReceipt: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryMaxAmountNoReceiptParams) => {
            if (!oldValue) {
                return `レシートを${newValue}に変更してカテゴリ「${categoryName}」を更新しました`;
            }
            return `「${categoryName}」カテゴリを${newValue}に変更しました（以前は${oldValue}）`;
        },
        setCategoryName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `カテゴリ名を「${oldName}」から「${newName}」に変更しました`,
        updatedDescriptionHint: ({categoryName, oldValue, newValue}: UpdatedPolicyCategoryDescriptionHintTypeParams) => {
            if (!newValue) {
                return `カテゴリ「${categoryName}」から説明のヒント「${oldValue}」を削除しました`;
            }
            return !oldValue
                ? `カテゴリ「${categoryName}」に説明用のヒント「${newValue}」を追加しました`
                : `「${categoryName}」カテゴリの説明のヒントを「${newValue}」（以前は「${oldValue}」）に変更しました`;
        },
        updateTagListName: ({oldName, newName}: UpdatedPolicyCategoryNameParams) => `タグリスト名を「${newName}」（以前は「${oldName}」）に変更しました`,
        addTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `タグ「${tagName}」をリスト「${tagListName}」に追加しました`,
        updateTagName: ({tagListName, newName, oldName}: UpdatedPolicyTagNameParams) => `タグリスト「${tagListName}」で、タグ「${oldName}」を「${newName}」に変更して更新しました`,
        updateTagEnabled: ({tagListName, tagName, enabled}: UpdatedPolicyTagParams) => `${enabled ? '有効' : '無効'} リスト「${tagListName}」のタグ「${tagName}」`,
        deleteTag: ({tagListName, tagName}: UpdatedPolicyTagParams) => `タグ「${tagName}」をリスト「${tagListName}」から削除しました`,
        deleteMultipleTags: ({count, tagListName}: UpdatedPolicyTagParams) => `リスト「${tagListName}」から「${count}」個のタグを削除しました`,
        updateTag: ({tagListName, newValue, tagName, updatedField, oldValue}: UpdatedPolicyTagFieldParams) => {
            if (oldValue) {
                return `リスト「${tagListName}」内のタグ「${tagName}」の${updatedField}を「${oldValue}」から「${newValue}」に変更して更新しました`;
            }
            return `リスト「${tagListName}」のタグ「${tagName}」に「${newValue}」という${updatedField}を追加して更新しました`;
        },
        updateCustomUnit: ({customUnitName, newValue, oldValue, updatedField}: UpdatePolicyCustomUnitParams) =>
            `${customUnitName} の${updatedField}を「${newValue}」（以前は「${oldValue}」）に変更しました`,
        updateCustomUnitTaxEnabled: ({newValue}: UpdatePolicyCustomUnitTaxEnabledParams) => `${newValue ? '有効' : '無効'} 走行距離レートでの税金追跡`,
        addCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `新しい「${customUnitName}」レート「${rateName}」を追加しました`,
        updatedCustomUnitRate: ({customUnitName, customUnitRateName, newValue, oldValue, updatedField}: UpdatedPolicyCustomUnitRateParams) =>
            `${customUnitName}の${updatedField}「${customUnitRateName}」のレートを「${oldValue}」から「${newValue}」に変更しました`,
        updatedCustomUnitTaxRateExternalID: ({customUnitRateName, newValue, newTaxPercentage, oldTaxPercentage, oldValue}: UpdatedPolicyCustomUnitTaxRateExternalIDParams) => {
            if (oldTaxPercentage && oldValue) {
                return `距離料金「${customUnitRateName}」の税率を「${oldValue} (${oldTaxPercentage})」から「${newValue} (${newTaxPercentage})」に変更しました`;
            }
            return `距離単価「${customUnitRateName}」に税率「${newValue}（${newTaxPercentage}）」を追加しました`;
        },
        updatedCustomUnitTaxClaimablePercentage: ({customUnitRateName, newValue, oldValue}: UpdatedPolicyCustomUnitTaxClaimablePercentageParams) => {
            if (oldValue) {
                return `距離レート「${customUnitRateName}」の、還付対象の税額部分を「${oldValue}」から「${newValue}」に変更しました`;
            }
            return `距離レート「${customUnitRateName}」に税還付可能な金額「${newValue}」を追加しました`;
        },
        deleteCustomUnitRate: ({customUnitName, rateName}: AddOrDeletePolicyCustomUnitRateParams) => `「${customUnitName}」のレート「${rateName}」を削除しました`,
        addedReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `${fieldType} レポート項目「${fieldName}」を追加しました`,
        updateReportFieldDefaultValue: ({defaultValue, fieldName}: UpdatedPolicyReportFieldDefaultValueParams) =>
            `レポートフィールド「${fieldName}」のデフォルト値を「${defaultValue}」に設定する`,
        addedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `レポートフィールド「${fieldName}」にオプション「${optionName}」を追加しました`,
        removedReportFieldOption: ({fieldName, optionName}: PolicyAddedReportFieldOptionParams) => `レポートフィールド「${fieldName}」からオプション「${optionName}」を削除しました`,
        updateReportFieldOptionDisabled: ({fieldName, optionName, optionEnabled}: PolicyDisabledReportFieldOptionParams) =>
            `レポートフィールド「${fieldName}」のオプション「${optionName}」の ${optionEnabled ? '有効' : '無効'}`,
        updateReportFieldAllOptionsDisabled: ({fieldName, optionName, allEnabled, toggledOptionsCount}: PolicyDisabledReportFieldAllOptionsParams) => {
            if (toggledOptionsCount && toggledOptionsCount > 1) {
                return `${allEnabled ? '有効' : '無効'} レポートフィールド「${fieldName}」のすべてのオプション`;
            }
            return `レポートフィールド「${fieldName}」のオプション「${optionName}」を${allEnabled ? '有効' : '無効'}にし、すべてのオプションを${allEnabled ? '有効' : '無効'}にします`;
        },
        deleteReportField: ({fieldType, fieldName}: AddedOrDeletedPolicyReportFieldParams) => `${fieldType}レポートフィールド「${fieldName}」を削除しました`,
        preventSelfApproval: ({oldValue, newValue}: UpdatedPolicyPreventSelfApprovalParams) =>
            `「自己承認を防ぐ」を「${newValue === 'true' ? '有効' : '無効'}」（以前は「${oldValue === 'true' ? '有効' : '無効'}」）に更新しました`,
        updateMaxExpenseAmountNoReceipt: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `必須となる領収書の最大経費金額を${newValue}に変更しました（以前は${oldValue}）。`,
        updateMaxExpenseAmount: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `違反に対する最大経費額を${newValue}に変更しました（以前は${oldValue}）`,
        updateMaxExpenseAge: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `「最大経費日数（日）」を「${newValue}」に更新しました（以前は「${oldValue === 'false' ? CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE : oldValue}」でした）`,
        updateMonthlyOffset: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => {
            if (!oldValue) {
                return `月次レポートの提出日を「${newValue}」に設定する`;
            }
            return `月次レポートの提出日を「${newValue}」（以前は「${oldValue}」）に更新しました`;
        },
        updateDefaultBillable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) =>
            `「クライアントへの経費の再請求」を「${newValue}」（以前は「${oldValue}」）に更新しました`,
        updateDefaultReimbursable: ({oldValue, newValue}: UpdatedPolicyFieldWithNewAndOldValueParams) => `「現金経費のデフォルト」を「${newValue}」（以前は「${oldValue}」）に更新しました`,
        updateDefaultTitleEnforced: ({value}: UpdatedPolicyFieldWithValueParam) => `「Enforce default report titles」をオンにしました ${value ? 'オン' : 'オフ'}`,
        renamedWorkspaceNameAction: ({oldName, newName}: RenamedWorkspaceNameActionParams) => `このワークスペースの名前を「${newName}」（以前は「${oldName}」）に更新しました`,
        updateWorkspaceDescription: ({newDescription, oldDescription}: UpdatedPolicyDescriptionParams) =>
            !oldDescription ? `このワークスペースの説明を「${newDescription}」に設定する` : `このワークスペースの説明を「${newDescription}」（以前は「${oldDescription}」）に更新しました`,
        removedFromApprovalWorkflow: ({submittersNames}: RemovedFromApprovalWorkflowParams) => {
            let joinedNames = '';
            if (submittersNames.length === 1) {
                joinedNames = submittersNames.at(0) ?? '';
            } else if (submittersNames.length === 2) {
                joinedNames = submittersNames.join('と');
            } else if (submittersNames.length > 2) {
                joinedNames = `${submittersNames.slice(0, submittersNames.length - 1).join(', ')} and ${submittersNames.at(-1)}`;
            }
            return {
                one: `${joinedNames} の承認ワークフローと経費チャットからあなたを削除しました。以前に提出されたレポートは、受信トレイで引き続き承認可能です。`,
                other: `${joinedNames} の承認ワークフローと経費チャットからあなたを削除しました。以前に提出されたレポートは、引き続きあなたの受信トレイで承認可能な状態のまま残ります。`,
            };
        },
        demotedFromWorkspace: ({policyName, oldRole}: DemotedFromWorkspaceParams) =>
            `${policyName} でのあなたのロールが ${oldRole} からユーザーに更新されました。自分自身のものを除き、すべての申請者の経費チャットから削除されました。`,
        updatedWorkspaceCurrencyAction: ({oldCurrency, newCurrency}: UpdatedPolicyCurrencyParams) => `デフォルト通貨を${newCurrency}（以前は${oldCurrency}）に更新しました`,
        updatedWorkspaceFrequencyAction: ({oldFrequency, newFrequency}: UpdatedPolicyFrequencyParams) => `自動レポート頻度を「${newFrequency}」（以前は「${oldFrequency}」）に更新しました`,
        updateApprovalMode: ({newValue, oldValue}: ChangeFieldParams) => `承認モードを「${newValue}」に更新しました（以前は「${oldValue}」でした）`,
        upgradedWorkspace: 'このワークスペースを Control プランにアップグレードしました',
        forcedCorporateUpgrade: `このワークスペースは Control プランにアップグレードされました。詳しくは<a href="${CONST.COLLECT_UPGRADE_HELP_URL}">こちら</a>をクリックしてください。`,
        downgradedWorkspace: 'このワークスペースを Collect プランにダウングレードしました',
        updatedAuditRate: ({oldAuditRate, newAuditRate}: UpdatedPolicyAuditRateParams) =>
            `レポートを手動承認にランダムに回付する割合を${Math.round(newAuditRate * 100)}%（以前は${Math.round(oldAuditRate * 100)}%）に変更しました`,
        updatedManualApprovalThreshold: ({oldLimit, newLimit}: UpdatedPolicyManualApprovalThresholdParams) =>
            `すべての経費に対する手動承認限度額を${newLimit}（以前は${oldLimit}）に変更しました`,
        updatedFeatureEnabled: ({enabled, featureName}: {enabled: boolean; featureName: string}) => {
            switch (featureName) {
                case 'categories':
                    return `${enabled ? '有効' : '無効'} 個のカテゴリ`;
                case 'tags':
                    return `${enabled ? '有効' : '無効'} 個のタグ`;
                case 'workflows':
                    return `${enabled ? '有効' : '無効'} 件のワークフロー`;
                case 'distance rates':
                    return `${enabled ? '有効' : '無効'} 距離レート`;
                case 'accounting':
                    return `${enabled ? '有効' : '無効'} 会計`;
                case 'Expensify Cards':
                    return `${enabled ? '有効' : '無効'} Expensify カード`;
                case 'company cards':
                    return `${enabled ? '有効' : '無効'} 社用カード`;
                case 'invoicing':
                    return `${enabled ? '有効' : '無効'} 請求書発行`;
                case 'per diem':
                    return `日当 ${enabled ? '有効' : '無効'}`;
                case 'receipt partners':
                    return `${enabled ? '有効' : '無効'} 領収書パートナー`;
                case 'rules':
                    return `${enabled ? '有効' : '無効'} のルール`;
                case 'tax tracking':
                    return `${enabled ? '有効' : '無効'} 税金の追跡`;
                default:
                    return `${enabled ? '有効' : '無効'} ${featureName}`;
            }
        },
        updatedAttendeeTracking: ({enabled}: {enabled: boolean}) => `${enabled ? '有効' : '無効'} 出席者の追跡`,
        updateReimbursementEnabled: ({enabled}: UpdatedPolicyReimbursementEnabledParams) => `このワークスペースの${enabled ? '有効' : '無効'}件の精算`,
        addTax: ({taxName}: UpdatedPolicyTaxParams) => `税金「${taxName}」を追加しました`,
        deleteTax: ({taxName}: UpdatedPolicyTaxParams) => `税「${taxName}」を削除しました`,
        updateTax: ({oldValue, taxName, updatedField, newValue}: UpdatedPolicyTaxParams) => {
            if (!updatedField) {
                return '';
            }
            switch (updatedField) {
                case 'name': {
                    return `税"${oldValue}"の名前を"${newValue}"に変更しました`;
                }
                case 'code': {
                    return `税コードを「${oldValue}」から「${newValue}」に「${taxName}」として変更しました`;
                }
                case 'rate': {
                    return `「${taxName}」の税率を「${oldValue}」から「${newValue}」に変更しました`;
                }
                case 'enabled': {
                    return `${oldValue ? '無効' : '有効'} 税金「${taxName}」`;
                }
                default: {
                    return '';
                }
            }
        },
    },
    roomMembersPage: {
        memberNotFound: 'メンバーが見つかりません。',
        useInviteButton: '新しいメンバーをチャットに招待するには、上の招待ボタンを使用してください。',
        notAuthorized: `このページへのアクセス権がありません。このルームに参加しようとしている場合は、ルームのメンバーに追加してもらってください。その他のお問い合わせは、${CONST.EMAIL.CONCIERGE} までご連絡ください。`,
        roomArchived: `このルームはアーカイブされたようです。ご不明な点があれば、${CONST.EMAIL.CONCIERGE} までご連絡ください。`,
        removeMembersPrompt: ({memberName}: {memberName: string}) => ({
            one: `ルームから${memberName}を削除してもよろしいですか？`,
            other: '選択したメンバーをルームから削除してもよろしいですか？',
        }),
        error: {
            genericAdd: 'このルームメンバーの追加中に問題が発生しました',
        },
    },
    newTaskPage: {
        assignTask: 'タスクを割り当てる',
        assignMe: '自分に割り当てる',
        confirmTask: 'タスクを確認',
        confirmError: 'タイトルを入力し、共有先を選択してください',
        descriptionOptional: '説明（任意）',
        pleaseEnterTaskName: 'タイトルを入力してください',
        pleaseEnterTaskDestination: 'このタスクを共有したい場所を選択してください',
    },
    task: {
        task: 'タスク',
        title: 'タイトル',
        description: '説明',
        assignee: '担当者',
        completed: '完了',
        action: '完了',
        messages: {
            created: ({title}: TaskCreatedActionParams) => `${title} のタスク`,
            completed: '完了としてマーク済み',
            canceled: '削除されたタスク',
            reopened: '未完了としてマークされました',
            error: '要求された操作を行う権限がありません',
        },
        markAsComplete: '完了としてマーク',
        markAsIncomplete: '未完了としてマーク',
        assigneeError: 'このタスクの割り当て中にエラーが発生しました。別の担当者をお試しください。',
        genericCreateTaskFailureMessage: 'このタスクの作成中にエラーが発生しました。後でもう一度お試しください。',
        deleteTask: 'タスクを削除',
        deleteConfirmation: 'このタスクを削除してもよろしいですか？',
    },
    statementPage: {
        title: ({year, monthName}: StatementTitleParams) => `${monthName} ${year}の明細`,
    },
    keyboardShortcutsPage: {
        title: 'キーボードショートカット',
        subtitle: 'これらの便利なキーボードショートカットで時間を節約しましょう。',
        shortcuts: {
            openShortcutDialog: 'キーボードショートカットダイアログを開きます',
            markAllMessagesAsRead: 'すべてのメッセージを既読にする',
            escape: 'ダイアログをEscキーで閉じる',
            search: '検索ダイアログを開く',
            newChat: '新しいチャット画面',
            copy: 'コメントをコピー',
            openDebug: 'テスト設定ダイアログを開く',
        },
    },
    guides: {
        screenShare: '画面共有',
        screenShareRequest: 'Expensify が画面共有への参加を招待しています',
    },
    search: {
        resultsAreLimited: '検索結果は制限されています。',
        viewResults: '結果を表示',
        resetFilters: 'フィルターをリセット',
        searchResults: {
            emptyResults: {
                title: '表示するものはありません',
                subtitle: `検索条件を調整するか、「+」ボタンで新しく作成してみてください。`,
            },
            emptyExpenseResults: {
                title: 'まだ経費が作成されていません',
                subtitle: '経費を作成するか、Expensify を試乗して詳しく学びましょう。',
                subtitleWithOnlyCreateButton: '経費を作成するには、下の緑色のボタンを使用してください。',
            },
            emptyReportResults: {
                title: 'レポートはまだ作成されていません',
                subtitle: 'Expensify をさらに詳しく知るには、レポートを作成するか、テストドライブをお試しください。',
                subtitleWithOnlyCreateButton: '下の緑色のボタンを使ってレポートを作成してください。',
            },
            emptyInvoiceResults: {
                title: dedent(`
                    まだ請求書を作成していません
                `),
                subtitle: '請求書を送信するか、Expensify を試用して詳細をご確認ください。',
                subtitleWithOnlyCreateButton: '請求書を送信するには、下の緑色のボタンを使用してください。',
            },
            emptyTripResults: {
                title: '表示する出張はありません',
                subtitle: 'まずは、下で最初の出張を予約しましょう。',
                buttonText: '出張を予約',
            },
            emptySubmitResults: {
                title: '申請する経費はありません',
                subtitle: 'すべて問題ありません。勝利の周回をしてきましょう！',
                buttonText: 'レポートを作成',
            },
            emptyApproveResults: {
                title: '承認する経費はありません',
                subtitle: '経費はゼロ。くつろぎ度はマックス。お見事です！',
            },
            emptyPayResults: {
                title: '支払う経費はありません',
                subtitle: 'おめでとうございます！ゴールしました。',
            },
            emptyExportResults: {
                title: 'エクスポートする経費はありません',
                subtitle: 'ゆっくり一息つく時間です。よくやりました。',
            },
            emptyStatementsResults: {
                title: '表示する経費がありません',
                subtitle: '結果がありません。フィルターを調整して再度お試しください。',
            },
            emptyUnapprovedResults: {
                title: '承認する経費はありません',
                subtitle: '経費はゼロ。くつろぎ度はマックス。お見事です！',
            },
        },
        statements: '明細書',
        unapprovedCash: '未承認の現金',
        unapprovedCard: '未承認のカード',
        reconciliation: '照合',
        saveSearch: '検索を保存',
        deleteSavedSearch: '保存済み検索を削除',
        deleteSavedSearchConfirm: 'この検索を削除してもよろしいですか？',
        searchName: '名前を検索',
        savedSearchesMenuItemTitle: '保存済み',
        groupedExpenses: 'グループ化された経費',
        bulkActions: {
            approve: '承認',
            pay: '支払う',
            delete: '削除',
            hold: '保留',
            unhold: '保留を解除',
            reject: '却下',
            noOptionsAvailable: '選択した経費グループには利用できるオプションがありません。',
        },
        filtersHeader: 'フィルター',
        filters: {
            date: {
                before: ({date}: OptionalParam<DateParams> = {}) => `${date ?? ''} より前`,
                after: ({date}: OptionalParam<DateParams> = {}) => `${date ?? ''} の後`,
                on: ({date}: OptionalParam<DateParams> = {}) => `${date ?? ''} に発生`,
                presets: {
                    [CONST.SEARCH.DATE_PRESETS.NEVER]: 'しない',
                    [CONST.SEARCH.DATE_PRESETS.LAST_MONTH]: '先月',
                    [CONST.SEARCH.DATE_PRESETS.THIS_MONTH]: '今月',
                    [CONST.SEARCH.DATE_PRESETS.LAST_STATEMENT]: '最新の明細書',
                },
            },
            status: 'ステータス',
            keyword: 'キーワード',
            keywords: 'キーワード',
            currency: '通貨',
            completed: '完了',
            amount: {
                lessThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `${amount ?? ''} 未満`,
                greaterThan: ({amount}: OptionalParam<RequestAmountParams> = {}) => `${amount ?? ''} より大きい`,
                between: ({greaterThan, lessThan}: FiltersAmountBetweenParams) => `${greaterThan} と ${lessThan} の間`,
                equalTo: ({amount}: OptionalParam<RequestAmountParams> = {}) => `${amount ?? ''} と等しい`,
            },
            card: {
                expensify: 'Expensify',
                individualCards: '個別カード',
                closedCards: '利用終了したカード',
                cardFeeds: 'カードフィード',
                cardFeedName: ({cardFeedBankName, cardFeedLabel}: {cardFeedBankName: string; cardFeedLabel?: string}) =>
                    `すべての${cardFeedBankName}${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
                cardFeedNameCSV: ({cardFeedLabel}: {cardFeedLabel?: string}) => `すべてのCSVインポート済みカード${cardFeedLabel ? ` - ${cardFeedLabel}` : ''}`,
            },
            reportField: ({name, value}: OptionalParam<ReportFieldParams>) => `${name} は ${value} です`,
            current: '現在',
            past: '過去',
            submitted: '送信済み',
            approved: '承認済み',
            paid: '支払い済み',
            exported: 'エクスポート済み',
            posted: '記帳済み',
            withdrawn: '取り下げ済み',
            billable: '請求可能',
            reimbursable: '払い戻し対象',
            purchaseCurrency: '購入通貨',
            groupBy: {
                [CONST.SEARCH.GROUP_BY.FROM]: '差出人',
                [CONST.SEARCH.GROUP_BY.CARD]: 'カード',
                [CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID]: '出金ID',
            },
            feed: 'フィード',
            withdrawalType: {
                [CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD]: 'Expensify Card',
                [CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT]: '払い戻し',
            },
            is: 'は',
            action: {
                [CONST.SEARCH.ACTION_FILTERS.SUBMIT]: '送信',
                [CONST.SEARCH.ACTION_FILTERS.APPROVE]: '承認',
                [CONST.SEARCH.ACTION_FILTERS.PAY]: '支払う',
                [CONST.SEARCH.ACTION_FILTERS.EXPORT]: 'エクスポート',
            },
        },
        has: 'あり',
        groupBy: 'グループ化',
        moneyRequestReport: {
            emptyStateTitle: 'このレポートには経費がありません。',
        },
        noCategory: 'カテゴリなし',
        noTag: 'タグなし',
        expenseType: '経費タイプ',
        withdrawalType: '出金タイプ',
        recentSearches: '最近の検索',
        recentChats: '最近のチャット',
        searchIn: '検索条件',
        searchPlaceholder: '何かを検索',
        suggestions: '提案',
        exportSearchResults: {
            title: 'エクスポートを作成',
            description: 'おっと、たくさんのアイテムがありますね！まとめておきますので、まもなくConciergeからファイルが送信されます。',
        },
        exportAll: {
            selectAllMatchingItems: '一致する項目をすべて選択',
            allMatchingItemsSelected: 'すべての一致する項目が選択されました',
        },
    },
    genericErrorPage: {
        title: 'おっと、問題が発生しました！',
        body: {
            helpTextMobile: 'アプリを一度閉じて再度開くか、または切り替えてください',
            helpTextWeb: 'ウェブ。',
            helpTextConcierge: '問題が解決しない場合は、次に連絡してください',
        },
        refresh: '更新',
    },
    fileDownload: {
        success: {
            title: 'ダウンロード完了！',
            message: '添付ファイルを正常にダウンロードしました！',
            qrMessage:
                'QRコードのコピーは、写真フォルダまたはダウンロードフォルダを確認してください。プロのヒント：プレゼンテーションにQRコードを追加して、聴衆がスキャンしてあなたと直接つながれるようにしましょう。',
        },
        generalError: {
            title: '添付ファイルエラー',
            message: '添付ファイルをダウンロードできません',
        },
        permissionError: {
            title: 'ストレージへのアクセス',
            message: 'ストレージへのアクセス権限がないため、Expensify は添付ファイルを保存できません。権限を更新するには、「設定」をタップしてください。',
        },
    },
    desktopApplicationMenu: {
        mainMenu: '新しい Expensify',
        about: '新しい Expensify について',
        update: 'New Expensify を更新',
        checkForUpdates: 'アップデートを確認',
        toggleDevTools: 'デベロッパーツールを切り替え',
        viewShortcuts: 'キーボードショートカットを表示',
        services: 'サービス',
        hide: '新しい Expensify を非表示',
        hideOthers: '他を非表示',
        showAll: 'すべて表示',
        quit: 'New Expensify を終了',
        fileMenu: 'ファイル',
        closeWindow: 'ウィンドウを閉じる',
        editMenu: '編集',
        undo: '元に戻す',
        redo: 'やり直す',
        cut: '切り取り',
        copy: 'コピー',
        paste: '貼り付け',
        pasteAndMatchStyle: 'ペーストしてスタイルを合わせる',
        pasteAsPlainText: 'プレーンテキストとして貼り付け',
        delete: '削除',
        selectAll: 'すべて選択',
        speechSubmenu: '音声',
        startSpeaking: '話し始める',
        stopSpeaking: '発言を停止',
        viewMenu: '表示',
        reload: '再読み込み',
        forceReload: '強制再読み込み',
        resetZoom: '実際のサイズ',
        zoomIn: 'ズームイン',
        zoomOut: 'ズームアウト',
        togglefullscreen: 'フルスクリーンを切り替え',
        historyMenu: '履歴',
        back: '戻る',
        forward: '転送',
        windowMenu: 'ウィンドウ',
        minimize: '最小化',
        zoom: 'Zoom',
        front: 'すべてを前面に移動',
        helpMenu: 'ヘルプ',
        learnMore: '詳細はこちら',
        documentation: 'ドキュメント',
        communityDiscussions: 'コミュニティディスカッション',
        searchIssues: '問題を検索',
    },
    historyMenu: {
        forward: '転送',
        back: '戻る',
    },
    checkForUpdatesModal: {
        available: {
            title: 'アップデートが利用可能です',
            message: ({isSilentUpdating}: {isSilentUpdating: boolean}) => `新しいバージョンはまもなく利用可能になります。${!isSilentUpdating ? '更新の準備ができたらお知らせします。' : ''}`,
            soundsGood: 'いいですね',
        },
        notAvailable: {
            title: 'アップデートを利用できません',
            message: '現在利用できるアップデートはありません。後ほどもう一度確認してください。',
            okay: '了解',
        },
        error: {
            title: '更新の確認に失敗しました',
            message: 'アップデートを確認できませんでした。しばらくしてからもう一度お試しください。',
        },
    },
    settlement: {
        status: {
            pending: '保留中',
            cleared: '消込済み',
            failed: '失敗',
        },
        failedError: ({link}: {link: string}) => `<a href="${link}">アカウントのロックを解除</a>すると、この精算を再試行します。`,
        withdrawalInfo: ({date, withdrawalID}: {date: string; withdrawalID: number}) => `${date}・出金ID：${withdrawalID}`,
    },
    reportLayout: {
        reportLayout: 'レポートレイアウト',
        groupByLabel: 'グループ化基準:',
        selectGroupByOption: 'レポート経費のグループ化方法を選択',
        uncategorized: '未分類',
        noTag: 'タグなし',
        selectGroup: ({groupName}: {groupName: string}) => `${groupName} のすべての経費を選択`,
        groupBy: {
            category: 'カテゴリ',
            tag: 'タグ',
        },
    },
    report: {
        newReport: {
            createReport: 'レポートを作成',
            chooseWorkspace: 'このレポートのワークスペースを選択してください。',
            emptyReportConfirmationTitle: 'すでに空のレポートがあります',
            emptyReportConfirmationPrompt: ({workspaceName}: {workspaceName: string}) =>
                `${workspaceName} で別のレポートを作成してもよろしいですか？空のレポートには、次の場所からアクセスできます`,
            emptyReportConfirmationPromptLink: 'レポート',
            genericWorkspaceName: 'このワークスペース',
        },
        genericCreateReportFailureMessage: 'このチャットの作成中に予期しないエラーが発生しました。後でもう一度お試しください。',
        genericAddCommentFailureMessage: 'コメントの投稿中に予期しないエラーが発生しました。後でもう一度お試しください。',
        genericUpdateReportFieldFailureMessage: '項目の更新中に予期しないエラーが発生しました。後でもう一度お試しください。',
        genericUpdateReportNameEditFailureMessage: 'レポート名の変更中に予期しないエラーが発生しました。後でもう一度お試しください。',
        noActivityYet: 'まだアクティビティがありません',
        connectionSettings: '接続設定',
        actions: {
            type: {
                changeField: ({oldValue, newValue, fieldName}: ChangeFieldParams) => `${fieldName} を「${newValue}」（以前は「${oldValue}」）に変更しました`,
                changeFieldEmpty: ({newValue, fieldName}: ChangeFieldParams) => `${fieldName} を「${newValue}」に設定`,
                changeReportPolicy: ({fromPolicyName, toPolicyName}: ChangeReportPolicyParams) => {
                    if (!toPolicyName) {
                        return `ワークスペース${fromPolicyName ? `（以前は ${fromPolicyName}）` : ''}を変更しました`;
                    }
                    return `ワークスペースを${toPolicyName}${fromPolicyName ? `（以前は ${fromPolicyName}）` : ''}に変更しました`;
                },
                changeType: ({oldType, newType}: ChangeTypeParams) => `種類を ${oldType} から ${newType} に変更しました`,
                exportedToCSV: `CSV にエクスポート済み`,
                exportedToIntegration: {
                    automatic: ({label}: ExportedToIntegrationParams) => {
                        const labelTranslations: Record<string, string> = {
                            [CONST.REPORT.EXPORT_OPTION_LABELS.EXPENSE_LEVEL_EXPORT]: translations.export.expenseLevelExport,
                            [CONST.REPORT.EXPORT_OPTION_LABELS.REPORT_LEVEL_EXPORT]: translations.export.reportLevelExport,
                        };
                        const translatedLabel = labelTranslations[label] || label;
                        return `${translatedLabel} にエクスポート済み`;
                    },
                    automaticActionOne: ({label}: ExportedToIntegrationParams) => `${label}へのエクスポート元:`,
                    automaticActionTwo: '会計設定',
                    manual: ({label}: ExportedToIntegrationParams) => `このレポートを${label}へ手動でエクスポート済みにしました。`,
                    automaticActionThree: 'として、レコードを正常に作成しました',
                    reimburseableLink: '立替経費',
                    nonReimbursableLink: '法人カード経費',
                    pending: ({label}: ExportedToIntegrationParams) => `このレポートの${label}へのエクスポートを開始しました…`,
                },
                integrationsMessage: ({errorMessage, label, linkText, linkURL}: IntegrationSyncFailedParams) =>
                    `このレポートを${label}にエクスポートできませんでした（"${errorMessage}${linkText ? `<a href="${linkURL}">${linkText}</a>` : ''}"）`,
                managerAttachReceipt: `領収書を追加しました`,
                managerDetachReceipt: `領収書を削除しました`,
                markedReimbursed: ({amount, currency}: MarkedReimbursedParams) => `他の場所で${currency}${amount}を支払いました`,
                markedReimbursedFromIntegration: ({amount, currency}: MarkReimbursedFromIntegrationParams) => `連携機能を通じて${currency}${amount}を支払いました`,
                outdatedBankAccount: `支払者の銀行口座に問題があるため、支払いを処理できませんでした`,
                reimbursementACHBounce: `銀行口座の問題により支払いを処理できませんでした`,
                reimbursementACHCancelled: `支払いをキャンセルしました`,
                reimbursementAccountChanged: `支払者が銀行口座を変更したため、支払いを処理できませんでした`,
                reimbursementDelayed: `支払いは処理済みですが、さらに1～2営業日遅れています`,
                selectedForRandomAudit: `ランダムに選択されてレビュー対象になりました`,
                selectedForRandomAuditMarkdown: `レビューのために[ランダムに選択](https://help.expensify.com/articles/expensify-classic/reports/Set-a-random-report-audit-schedule)されました`,
                share: ({to}: ShareParams) => `招待されたメンバー ${to}`,
                unshare: ({to}: UnshareParams) => `メンバー ${to} を削除しました`,
                stripePaid: ({amount, currency}: StripePaidParams) => `${currency}${amount} を支払いました`,
                takeControl: `操作を引き継ぎました`,
                integrationSyncFailed: ({label, errorMessage, workspaceAccountingLink}: IntegrationSyncFailedParams) =>
                    `${label}${errorMessage ? ` ("${errorMessage}")` : ''} との同期中に問題が発生しました。問題を解決するには、<a href="${workspaceAccountingLink}">ワークスペース設定</a>で修正してください。`,
                addEmployee: ({email, role}: AddEmployeeParams) => `${email} を ${role === 'member' ? 'a' : '1つの'} ${role} として追加しました`,
                updateRole: ({email, currentRole, newRole}: UpdateRoleParams) => `${email} のロールを ${currentRole} から ${newRole} に更新しました`,
                updatedCustomField1: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `${email} のカスタムフィールド 1 を削除しました（以前の値：「${previousValue}」）`;
                    }
                    return !previousValue
                        ? `${email} のカスタムフィールド1に「${newValue}」を追加しました`
                        : `${email} のカスタムフィールド1を「${newValue}」（以前は「${previousValue}」）に変更しました`;
                },
                updatedCustomField2: ({email, previousValue, newValue}: UpdatedCustomFieldParams) => {
                    if (!newValue) {
                        return `${email} のカスタムフィールド 2 を削除しました（以前の値：「${previousValue}」）`;
                    }
                    return !previousValue
                        ? `${email} のカスタムフィールド2に「${newValue}」を追加しました`
                        : `${email} のカスタムフィールド2を「${newValue}」（以前は「${previousValue}」）に変更しました`;
                },
                leftWorkspace: ({nameOrEmail}: LeftWorkspaceParams) => `${nameOrEmail} がワークスペースを退出しました`,
                removeMember: ({email, role}: AddEmployeeParams) => `${role} ${email} を削除しました`,
                removedConnection: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} への接続を削除しました`,
                addedConnection: ({connectionName}: ConnectionNameParams) => `${CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionName]} に接続済み`,
                leftTheChat: 'チャットを退出しました',
            },
            error: {
                invalidCredentials: '認証情報が無効です。接続の設定を確認してください。',
            },
        },
    },
    chronos: {
        oooEventSummaryFullDay: ({summary, dayCount, date}: OOOEventSummaryFullDayParams) => `${summary}（${date}までの${dayCount} ${dayCount === 1 ? '日' : '日'}）`,
        oooEventSummaryPartialDay: ({summary, timePeriod, date}: OOOEventSummaryPartialDayParams) => `${date}の${timePeriod}の${summary}`,
    },
    footer: {
        features: '機能',
        expenseManagement: '経費管理',
        spendManagement: '支出管理',
        expenseReports: '経費精算書',
        companyCreditCard: '会社のクレジットカード',
        receiptScanningApp: 'レシートスキャンアプリ',
        billPay: '請求書支払い',
        invoicing: '請求書発行',
        CPACard: 'CPAカード',
        payroll: '給与計算',
        travel: '出張',
        resources: 'リソース',
        expensifyApproved: 'Expensify承認済み！',
        pressKit: 'プレスキット',
        support: 'サポート',
        expensifyHelp: 'Expensifyヘルプ',
        terms: '利用規約',
        privacy: 'プライバシー',
        learnMore: '詳細はこちら',
        aboutExpensify: 'Expensify について',
        blog: 'ブログ',
        jobs: '求人',
        expensifyOrg: 'Expensify.org',
        investorRelations: '投資家向け情報',
        getStarted: 'はじめに',
        createAccount: '新しいアカウントを作成',
        logIn: 'ログイン',
    },
    allStates: COMMON_CONST.STATES as States,
    allCountries: CONST.ALL_COUNTRIES as AllCountries,
    accessibilityHints: {
        navigateToChatsList: 'チャット一覧に戻る',
        chatWelcomeMessage: 'チャットのウェルカムメッセージ',
        navigatesToChat: 'チャットへ移動',
        newMessageLineIndicator: '新しいメッセージ行インジケーター',
        chatMessage: 'チャットメッセージ',
        lastChatMessagePreview: '最新のチャットメッセージのプレビュー',
        workspaceName: 'ワークスペース名',
        chatUserDisplayNames: 'チャットメンバーの表示名',
        scrollToNewestMessages: '最新メッセージまでスクロール',
        preStyledText: '事前にスタイル設定されたテキスト',
        viewAttachment: '添付ファイルを表示',
    },
    parentReportAction: {
        deletedReport: '削除されたレポート',
        deletedMessage: '削除されたメッセージ',
        deletedExpense: '削除された経費',
        reversedTransaction: '反転取引',
        deletedTask: '削除されたタスク',
        hiddenMessage: '非表示のメッセージ',
    },
    threads: {
        thread: 'スレッド',
        replies: '返信',
        reply: '返信',
        from: '差出人',
        in: '内',
        parentNavigationSummary: ({reportName, workspaceName}: ParentNavigationSummaryParams) => `${reportName}${workspaceName ? `${workspaceName} 内` : ''} から`,
    },
    qrCodes: {
        copy: 'URLをコピー',
        copied: 'コピーしました！',
    },
    moderation: {
        flagDescription: 'フラグが付けられたすべてのメッセージは、モデレーターによる確認のために送信されます。',
        chooseAReason: '通報する理由を以下から選択してください:',
        spam: 'スパム',
        spamDescription: '求められていない無関係な宣伝',
        inconsiderate: '配慮に欠ける',
        inconsiderateDescription: '侮辱的または無礼な表現で、意図に問題があるもの',
        intimidation: '脅し',
        intimidationDescription: '正当な異議があるにもかかわらず、強引に自分の主張を押し通すこと',
        bullying: 'いじめ',
        bullyingDescription: '服従を得るために個人を標的にすること',
        harassment: 'ハラスメント',
        harassmentDescription: '人種差別的、女性差別的、またはその他の広範な差別的行為',
        assault: '暴行',
        assaultDescription: '害意を持って行われる、特定の相手を標的とした感情的な攻撃',
        flaggedContent: 'このメッセージはコミュニティルール違反として報告されたため、内容は非表示になっています。',
        hideMessage: 'メッセージを非表示',
        revealMessage: 'メッセージを表示',
        levelOneResult: '匿名の警告が送信され、メッセージは審査対象として報告されます。',
        levelTwoResult: 'チャンネルからメッセージを非表示にし、匿名の警告を追加し、このメッセージをレビュー用に報告しました。',
        levelThreeResult: 'チャンネルからメッセージを削除し、匿名の警告を送信するとともに、そのメッセージはレビュー用に報告されます。',
    },
    actionableMentionWhisperOptions: {
        inviteToSubmitExpense: '経費の提出を依頼',
        inviteToChat: 'チャットにのみ招待',
        nothing: '何もしない',
    },
    actionableMentionJoinWorkspaceOptions: {
        accept: '承認',
        decline: '拒否',
    },
    actionableMentionTrackExpense: {
        submit: '誰かに送信する',
        categorize: 'カテゴリ分けする',
        share: '私の会計士と共有する',
        nothing: '今のところ何もありません',
    },
    teachersUnitePage: {
        teachersUnite: '教師団結',
        joinExpensifyOrg:
            '世界中の不公平をなくすために、Expensify.org に参加しましょう。現在実施中の「Teachers Unite」キャンペーンでは、必需の学用品にかかる費用を分担することで、あらゆる地域の教育者を支援しています。',
        iKnowATeacher: '私は教師を知っています',
        iAmATeacher: '私は教師です',
        getInTouch: '素晴らしいですね！連絡が取れるように、その方の情報を共有してください。',
        introSchoolPrincipal: '学校長からの紹介',
        schoolPrincipalVerifyExpense:
            'Expensify.org は、生活費に余裕のない世帯の生徒がより良い学習体験を得られるように、必需の学用品の費用を分担します。あなたの経費は、校長により確認されます。',
        principalFirstName: '主たる名義人の名',
        principalLastName: '代表者の姓',
        principalWorkEmail: '主な勤務用メールアドレス',
        updateYourEmail: 'メールアドレスを更新する',
        updateEmail: 'メールアドレスを更新',
        schoolMailAsDefault: ({contactMethodsRoute}: ContactMethodsRouteParams) =>
            `先に進む前に、学校のメールアドレスを既定の連絡方法として設定してください。設定 > プロフィール > <a href="${contactMethodsRoute}">連絡方法</a> から設定できます。`,
        error: {
            enterPhoneEmail: '有効なメールアドレスまたは電話番号を入力してください',
            enterEmail: 'メールアドレスを入力',
            enterValidEmail: '有効なメールアドレスを入力してください',
            tryDifferentEmail: '別のメールアドレスをお試しください',
        },
    },
    cardTransactions: {
        notActivated: '未有効化',
        outOfPocket: '自己負担支出',
        companySpend: '会社の支出',
    },
    distance: {
        addStop: '経由地を追加',
        deleteWaypoint: '経路ポイントを削除',
        deleteWaypointConfirmation: 'このウェイポイントを削除してもよろしいですか？',
        address: '住所',
        waypointDescription: {
            start: '開始',
            stop: '停止',
        },
        mapPending: {
            title: 'マッピング保留中',
            subtitle: 'オンラインに戻るとマップが生成されます',
            onlineSubtitle: 'マップを設定しています。しばらくお待ちください',
            errorTitle: 'マップエラー',
            errorSubtitle: '地図の読み込み中にエラーが発生しました。もう一度お試しください。',
        },
        error: {
            selectSuggestedAddress: '候補の住所を選択するか、現在地を使用してください',
        },
    },
    reportCardLostOrDamaged: {
        screenTitle: '通知書の紛失または破損',
        nextButtonLabel: '次へ',
        reasonTitle: 'なぜ新しいカードが必要ですか？',
        cardDamaged: 'カードが破損しました',
        cardLostOrStolen: 'カードを紛失した／盗まれた',
        confirmAddressTitle: '新しいカードの郵送先住所を確認してください。',
        cardDamagedInfo: '新しいカードは2～3営業日以内に届きます。現在お使いのカードは、新しいカードを有効化するまで引き続きご利用いただけます。',
        cardLostOrStolenInfo: 'ご注文が確定すると、現在お使いのカードは直ちに恒久的に無効化されます。新しいカードは通常、数営業日以内に到着します。',
        address: '住所',
        deactivateCardButton: 'カードを無効化',
        shipNewCardButton: '新しいカードを発送',
        addressError: '住所は必須です',
        reasonError: '理由は必須です',
        successTitle: '新しいカードを発送しました！',
        successDescription: '数営業日後に届いたら、カードを有効化する必要があります。その間はバーチャルカードをご利用いただけます。',
    },
    eReceipt: {
        guaranteed: '保証付きeReceipt',
        transactionDate: '取引日',
    },
    referralProgram: {
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT]: {
            buttonText: 'チャットを開始し、<success><strong>友達を紹介する</strong></success>。',
            header: 'チャットを開始、友達を紹介',
            body: '友達にもExpensifyを使ってほしいですか？その人とのチャットを開始するだけで、あとはお任せください。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SUBMIT_EXPENSE]: {
            buttonText: '経費を申請し、<success><strong>チームを紹介</strong></success>しましょう。',
            header: '経費を提出して、チームに紹介しましょう',
            body: 'あなたのチームにもExpensifyを使ってほしいですか？その人たち宛てに経費を提出するだけで、あとは私たちにお任せください。',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.REFER_FRIEND]: {
            header: '友達を紹介する',
            body: '友達にもExpensifyを使ってほしいですか？ 友達とチャットしたり、支払ったり、経費を割り勘したりするだけで、あとはすべてこちらにお任せください。招待リンクを共有するだけでもOKです！',
        },
        [CONST.REFERRAL_PROGRAM.CONTENT_TYPES.SHARE_CODE]: {
            buttonText: '友達を紹介する',
            header: '友達を紹介する',
            body: '友達にもExpensifyを使ってほしいですか？ 友達とチャットしたり、支払ったり、経費を割り勘したりするだけで、あとはすべてこちらにお任せください。招待リンクを共有するだけでもOKです！',
        },
        copyReferralLink: '招待リンクをコピー',
    },
    systemChatFooterMessage: {
        [CONST.INTRO_CHOICES.MANAGE_TEAM]: ({adminReportName, href}: {adminReportName: string; href: string}) =>
            `ヘルプが必要な場合は、<a href="${href}">${adminReportName}</a> でセットアップ担当者とチャットしてください`,
        default: `セットアップについては、<concierge-link>${CONST.CONCIERGE_CHAT_NAME}</concierge-link> にメッセージを送信してください`,
    },
    violations: {
        allTagLevelsRequired: 'すべてのタグが必要です',
        autoReportedRejectedExpense: 'この経費は却下されました。',
        billableExpense: '請求可能ステータスは無効になりました',
        cashExpenseWithNoReceipt: ({formattedLimit}: ViolationsCashExpenseWithNoReceiptParams = {}) => `領収書が必要です${formattedLimit ? `${formattedLimit} を超過` : ''}`,
        categoryOutOfPolicy: 'カテゴリは有効ではありません',
        conversionSurcharge: ({surcharge}: ViolationsConversionSurchargeParams) => `${surcharge}% の換算サーチャージを適用`,
        customUnitOutOfPolicy: 'このワークスペースでは有効なレートではありません',
        duplicatedTransaction: '重複の可能性',
        fieldRequired: 'レポート項目は必須です',
        futureDate: '未来の日付は使用できません',
        invoiceMarkup: ({invoiceMarkup}: ViolationsInvoiceMarkupParams) => `マークアップ率：${invoiceMarkup}%`,
        maxAge: ({maxAge}: ViolationsMaxAgeParams) => `${maxAge}日より前の日付`,
        missingCategory: 'カテゴリがありません',
        missingComment: '選択したカテゴリには説明が必要です',
        missingTag: ({tagName}: ViolationsMissingTagParams = {}) => `${tagName ?? 'タグ'} が見つかりません`,
        modifiedAmount: ({type, displayPercentVariance}: ViolationsModifiedAmountParams) => {
            switch (type) {
                case 'distance':
                    return '計算された距離と金額が一致しません';
                case 'card':
                    return 'カード取引額を超えています';
                default:
                    if (displayPercentVariance) {
                        return `スキャンした領収書より金額が${displayPercentVariance}%多くなっています`;
                    }
                    return 'スキャンした領収書の金額を超えています';
            }
        },
        modifiedDate: 'スキャンされたレシートの日付が異なります',
        nonExpensiworksExpense: 'Expensiworks 以外の経費',
        overAutoApprovalLimit: ({formattedLimit}: ViolationsOverLimitParams) => `経費が自動承認上限額（${formattedLimit}）を超えています`,
        overCategoryLimit: ({formattedLimit}: ViolationsOverCategoryLimitParams) => `1人あたりのカテゴリ上限額 ${formattedLimit} を超えた金額`,
        overLimit: ({formattedLimit}: ViolationsOverLimitParams) => `1人あたりの上限 ${formattedLimit} を超えた金額`,
        overTripLimit: ({formattedLimit}: ViolationsOverLimitParams) => `1 回の出張あたりの上限 ${formattedLimit} を超えた金額`,
        overLimitAttendee: ({formattedLimit}: ViolationsOverLimitParams) => `1人あたりの上限 ${formattedLimit} を超えた金額`,
        perDayLimit: ({formattedLimit}: ViolationsPerDayLimitParams) => `1人あたりの1日あたりのカテゴリ上限 ${formattedLimit} を超過した金額`,
        receiptNotSmartScanned: '領収書と経費の詳細が手動で追加されました。',
        receiptRequired: ({formattedLimit, category}: ViolationsReceiptRequiredParams) => {
            if (formattedLimit && category) {
                return `${formattedLimit} のカテゴリ上限を超えるため、領収書が必要です`;
            }
            if (formattedLimit) {
                return `${formattedLimit}を超える場合はレシートが必要です`;
            }
            if (category) {
                return `カテゴリ上限を超えたため領収書が必要です`;
            }
            return 'レシートが必要';
        },
        prohibitedExpense: ({prohibitedExpenseTypes}: ViolationsProhibitedExpenseParams) => {
            const preMessage = '禁止経費:';
            const getProhibitedExpenseTypeText = (prohibitedExpenseType: string) => {
                switch (prohibitedExpenseType) {
                    case 'alcohol':
                        return `アルコール`;
                    case 'gambling':
                        return `ギャンブル`;
                    case 'tobacco':
                        return `タバコ`;
                    case 'adultEntertainment':
                        return `アダルトエンターテインメント`;
                    case 'hotelIncidentals':
                        return `ホテル付帯費用`;
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
        reviewRequired: '要レビュー',
        rter: ({brokenBankConnection, isAdmin, isTransactionOlderThan7Days, member, rterType, companyCardPageURL}: ViolationsRterParams) => {
            if (rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530) {
                return '銀行連携の不具合により領収書を自動照合できません';
            }
            if (brokenBankConnection || rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION) {
                return isAdmin
                    ? `銀行接続が切断されました。<a href="${companyCardPageURL}">領収書を照合するために再接続</a>`
                    : '銀行連携が切断されています。管理者に依頼して再接続し、領収書と照合してください。';
            }
            if (!isTransactionOlderThan7Days) {
                return isAdmin ? `${member} に現金としてマークするよう依頼するか、7日待ってから再試行してください` : 'カード取引との照合待ち。';
            }
            return '';
        },
        brokenConnection530Error: '銀行連携の不具合により領収書が保留されています',
        adminBrokenConnectionError: ({workspaceCompanyCardRoute}: {workspaceCompanyCardRoute: string}) =>
            `<muted-text-label>銀行接続の不具合により領収書が保留されています。<a href="${workspaceCompanyCardRoute}">会社カード</a>で解決してください。</muted-text-label>`,
        memberBrokenConnectionError: '銀行接続の不具合により領収書が保留されています。ワークスペース管理者に解決を依頼してください。',
        markAsCashToIgnore: '現金としてマークして無視し、支払いをリクエストします。',
        smartscanFailed: ({canEdit = true}) => `レシートのスキャンに失敗しました。${canEdit ? '詳細を手動で入力' : ''}`,
        receiptGeneratedWithAI: 'AI生成の可能性がある領収書',
        someTagLevelsRequired: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'タグ'} が見つかりません`,
        tagOutOfPolicy: ({tagName}: ViolationsTagOutOfPolicyParams = {}) => `${tagName ?? 'タグ'} は無効になりました`,
        taxAmountChanged: '税額が変更されました',
        taxOutOfPolicy: ({taxName}: ViolationsTaxOutOfPolicyParams = {}) => `${taxName ?? '税'} は無効になりました`,
        taxRateChanged: '税率が変更されました',
        taxRequired: '税率が未設定',
        none: 'なし',
        taxCodeToKeep: '保持する税コードを選択',
        tagToKeep: '保持するタグを選択',
        isTransactionReimbursable: '取引を精算対象にするか選択',
        merchantToKeep: '維持する支払先を選択',
        descriptionToKeep: '保持する説明を選択',
        categoryToKeep: '保持するカテゴリを選択',
        isTransactionBillable: '取引が請求可能かどうかを選択',
        keepThisOne: 'これを残す',
        confirmDetails: `保持する詳細を確認`,
        confirmDuplicatesInfo: `保持しない重複分は、提出者が削除できるように保留されます。`,
        hold: 'この経費は保留中です',
        resolvedDuplicates: '重複を解決しました',
    },
    reportViolations: {
        [CONST.REPORT_VIOLATIONS.FIELD_REQUIRED]: ({fieldName}: RequiredFieldParams) => `${fieldName} は必須です`,
        reportContainsExpensesWithViolations: 'レポートに違反のある経費が含まれています。',
    },
    violationDismissal: {
        rter: {
            manual: 'このレシートを現金としてマークしました',
        },
        duplicatedTransaction: {
            manual: '重複を解決しました',
        },
    },
    videoPlayer: {
        play: '再生',
        pause: '一時停止',
        fullscreen: 'フルスクリーン',
        playbackSpeed: '再生速度',
        expand: '展開',
        mute: 'ミュート',
        unmute: 'ミュート解除',
        normal: '標準',
    },
    exitSurvey: {
        header: '終了する前に',
        reasonPage: {
            title: '退会理由をお聞かせください',
            subtitle: '移行する前に、Expensify Classic を利用したい理由を教えてください。',
        },
        reasons: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'Expensify Classic でのみ利用可能な機能が必要です。',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '私は New Expensify の使い方がわかりません。',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'New Expensify の使い方は理解していますが、Expensify Classic の方が好みです。',
        },
        prompts: {
            [CONST.EXIT_SURVEY.REASONS.FEATURE_NOT_AVAILABLE]: 'New Expensify にまだない、必要としている機能は何ですか？',
            [CONST.EXIT_SURVEY.REASONS.DONT_UNDERSTAND]: '何をしようとしていますか？',
            [CONST.EXIT_SURVEY.REASONS.PREFER_CLASSIC]: 'なぜExpensify Classicを好んでお使いですか？',
        },
        responsePlaceholder: 'あなたの回答',
        thankYou: 'フィードバックをありがとうございます！',
        thankYouSubtitle: 'ご回答は、より多くのことを達成できるより良い製品づくりに役立ちます。ご協力ありがとうございます！',
        goToExpensifyClassic: 'Expensify Classic に切り替える',
        offlineTitle: 'ここで行き詰まってしまったようです…',
        offline:
            'オフラインのようです。残念ながら、Expensify Classic はオフラインでは動作しませんが、新しい Expensify はオフラインでも動作します。Expensify Classic を利用したい場合は、インターネットに接続してからもう一度お試しください。',
        quickTip: 'ちょっとしたヒント…',
        quickTipSubTitle: 'expensify.com にアクセスすると、すぐに Expensify Classic を利用できます。ブックマークしておけば、簡単にショートカットとして開けます！',
        bookACall: '通話を予約',
        bookACallTitle: 'プロダクトマネージャーと話しますか？',
        benefits: {
            [CONST.EXIT_SURVEY.BENEFIT.CHATTING_DIRECTLY]: '経費明細やレポートでの直接チャット',
            [CONST.EXIT_SURVEY.BENEFIT.EVERYTHING_MOBILE]: 'モバイルであらゆる操作が可能',
            [CONST.EXIT_SURVEY.BENEFIT.TRAVEL_EXPENSE]: 'チャットのスピードで進む出張と経費管理',
        },
        bookACallTextTop: 'Expensify Classic に切り替えると、次の機能を利用できなくなります：',
        bookACallTextBottom: 'ぜひお電話でその理由をお伺いしたいと考えています。お客様のニーズについて話し合うために、上級プロダクトマネージャーとの通話を予約していただけます。',
        takeMeToExpensifyClassic: 'Expensify Classic に移動',
    },
    listBoundary: {
        errorMessage: 'さらにメッセージを読み込む際にエラーが発生しました',
        tryAgain: '再試行',
    },
    systemMessage: {
        mergedWithCashTransaction: 'この取引に領収書を照合しました',
    },
    subscription: {
        authenticatePaymentCard: '支払いカードを認証',
        mobileReducedFunctionalityMessage: 'モバイルアプリではサブスクリプションの変更はできません。',
        badge: {
            freeTrial: ({numOfDays}: BadgeFreeTrialParams) => `無料トライアル：残り ${numOfDays} ${numOfDays === 1 ? '日' : '日'} 日`,
        },
        billingBanner: {
            policyOwnerAmountOwed: {
                title: 'お支払い情報が古くなっています',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `${date}までにお支払いカードを更新して、すべてのお気に入りの機能を引き続きご利用ください。`,
            },
            policyOwnerAmountOwedOverdue: {
                title: '支払いを処理できませんでした',
                subtitle: ({date, purchaseAmountOwed}: BillingBannerOwnerAmountOwedOverdueParams) =>
                    date && purchaseAmountOwed
                        ? `${date} の ${purchaseAmountOwed} の請求を処理できませんでした。未払い額を清算するために、支払いカードを追加してください。`
                        : '支払うべき金額を清算するために、支払いカードを追加してください。',
            },
            policyOwnerUnderInvoicing: {
                title: 'お支払い情報が古くなっています',
                subtitle: ({date}: BillingBannerSubtitleWithDateParams) => `お支払いの期限が過ぎています。サービスの中断を防ぐため、${date}までに請求書をお支払いください。`,
            },
            policyOwnerUnderInvoicingOverdue: {
                title: 'お支払い情報が古くなっています',
                subtitle: 'お支払い期限を過ぎています。請求書のお支払いを行ってください。',
            },
            billingDisputePending: {
                title: 'カードに請求できませんでした',
                subtitle: ({amountOwed, cardEnding}: BillingBannerDisputePendingParams) =>
                    `あなたは、末尾が${cardEnding}のカードに対する${amountOwed}の請求に異議を申し立てました。銀行との異議申し立てが解決するまで、あなたのアカウントはロックされます。`,
            },
            cardAuthenticationRequired: {
                title: 'お客様の支払いカードは完全に認証されていません。',
                subtitle: ({cardEnding}: BillingBannerCardAuthenticationRequiredParams) => `支払いカード（末尾が${cardEnding}のカード）を有効化するには、認証プロセスを完了してください。`,
            },
            insufficientFunds: {
                title: 'カードに請求できませんでした',
                subtitle: ({amountOwed}: BillingBannerInsufficientFundsParams) =>
                    `ご利用の支払カードは、残高不足のため承認されませんでした。${amountOwed} の未払残高を精算するには、再試行するか新しい支払カードを追加してください。`,
            },
            cardExpired: {
                title: 'カードに請求できませんでした',
                subtitle: ({amountOwed}: BillingBannerCardExpiredParams) =>
                    `お支払いカードの有効期限が切れています。未払い残高 ${amountOwed} を清算するために、新しいお支払いカードを追加してください。`,
            },
            cardExpireSoon: {
                title: 'ご利用のカードの有効期限がまもなく切れます',
                subtitle: 'ご利用のお支払いカードは今月末で有効期限が切れます。以下の三点リーダーメニューをクリックしてカード情報を更新し、これまでどおりお好きな機能をご利用ください。',
            },
            retryBillingSuccess: {
                title: '成功しました！',
                subtitle: 'カードの請求が正常に完了しました。',
            },
            retryBillingError: {
                title: 'カードに請求できませんでした',
                subtitle:
                    '再試行する前に、Expensify の請求を承認し、保留を解除してもらうために、お使いの銀行に直接ご連絡ください。  \nそれ以外の場合は、別の支払カードを追加してみてください。',
            },
            cardOnDispute: ({amountOwed, cardEnding}: BillingBannerCardOnDisputeParams) =>
                `あなたは、末尾が${cardEnding}のカードに対する${amountOwed}の請求に異議を申し立てました。銀行との異議申し立てが解決するまで、あなたのアカウントはロックされます。`,
            preTrial: {
                title: '無料トライアルを開始',
                subtitle: '次のステップとして、チームが経費精算を開始できるように、<a href="#">セットアップチェックリストを完了</a>してください。',
            },
            trialStarted: {
                title: ({numOfDays}: TrialStartedTitleParams) => `トライアル：残り ${numOfDays} ${numOfDays === 1 ? '日' : '日'} 日！`,
                subtitle: 'すべてのお気に入りの機能を引き続き利用するには、支払いカードを追加してください。',
            },
            trialEnded: {
                title: '無料トライアルは終了しました',
                subtitle: 'すべてのお気に入りの機能を引き続き利用するには、支払いカードを追加してください。',
            },
            earlyDiscount: {
                claimOffer: '特典を利用',
                subscriptionPageTitle: ({discountType}: EarlyDiscountTitleParams) =>
                    `<strong>初年度が ${discountType}% オフ！</strong> 支払いカードを追加して、年間サブスクリプションを開始しましょう。`,
                onboardingChatTitle: ({discountType}: EarlyDiscountTitleParams) => `期間限定オファー：初年度が${discountType}%オフ！`,
                subtitle: ({days, hours, minutes, seconds}: EarlyDiscountSubtitleParams) => `${days > 0 ? `${days}日 :` : ''}${hours}時間 : ${minutes}分 : ${seconds}秒以内に申請`,
            },
        },
        cardSection: {
            title: '支払い',
            subtitle: 'Expensify サブスクリプションの支払い用カードを追加してください。',
            addCardButton: '支払カードを追加',
            cardNextPayment: ({nextPaymentDate}: CardNextPaymentParams) => `次回のお支払い日は ${nextPaymentDate} です。`,
            cardEnding: ({cardNumber}: CardEndingParams) => `末尾が${cardNumber}のカード`,
            cardInfo: ({name, expiration, currency}: CardInfoParams) => `名前：${name}、有効期限：${expiration}、通貨：${currency}`,
            changeCard: '支払いカードを変更',
            changeCurrency: '支払い通貨を変更',
            cardNotFound: '支払いカードが追加されていません',
            retryPaymentButton: '支払いを再試行',
            authenticatePayment: '支払いを認証する',
            requestRefund: '払い戻しをリクエスト',
            requestRefundModal: {
                full: '払い戻しは簡単です。次回の請求日より前にアカウントをダウングレードするだけで、払い戻しを受け取ることができます。<br /> <br /> ご注意：アカウントをダウングレードすると、ワークスペースが削除されます。この操作は元に戻せませんが、気が変わった場合はいつでも新しいワークスペースを作成できます。',
                confirm: 'ワークスペースを削除してダウングレード',
            },
            viewPaymentHistory: '支払い履歴を表示',
        },
        yourPlan: {
            title: 'ご利用のプラン',
            exploreAllPlans: 'すべてのプランを表示',
            customPricing: 'カスタム価格',
            asLowAs: ({price}: YourPlanPriceValueParams) => `アクティブメンバー1人あたり月額${price}から`,
            pricePerMemberMonth: ({price}: YourPlanPriceValueParams) => `メンバー1人あたり月額 ${price}`,
            pricePerMemberPerMonth: ({price}: YourPlanPriceValueParams) => `メンバー1人あたり月額${price}`,
            perMemberMonth: 'メンバーあたり／月',
            collect: {
                title: '回収',
                description: '経費、出張、チャット機能をすべて備えた小規模ビジネス向けプランです。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) =>
                    `Expensify Card を利用している場合は ${lower}/有効メンバー、Expensify Card を利用していない場合は ${upper}/有効メンバー。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) =>
                    `Expensify Card を利用している場合は ${lower}/有効メンバー、Expensify Card を利用していない場合は ${upper}/有効メンバー。`,
                benefit1: 'レシートスキャン',
                benefit2: '精算',
                benefit3: '法人カード管理',
                benefit4: '経費および出張の承認',
                benefit5: '出張予約とルール',
                benefit6: 'QuickBooks/Xero 連携',
                benefit7: '経費、レポート、ルームでチャット',
                benefit8: 'AI と人によるサポート',
            },
            control: {
                title: 'コントロール',
                description: '大企業向けの経費管理、出張管理、チャット。',
                priceAnnual: ({lower, upper}: YourPlanPriceParams) =>
                    `Expensify Card を利用している場合は ${lower}/有効メンバー、Expensify Card を利用していない場合は ${upper}/有効メンバー。`,
                pricePayPerUse: ({lower, upper}: YourPlanPriceParams) =>
                    `Expensify Card を利用している場合は ${lower}/有効メンバー、Expensify Card を利用していない場合は ${upper}/有効メンバー。`,
                benefit1: 'Collect プランのすべて',
                benefit2: '多段階承認ワークフロー',
                benefit3: 'カスタム経費ルール',
                benefit4: 'ERP 統合（NetSuite、Sage Intacct、Oracle）',
                benefit5: '人事システム連携（Workday、Certinia）',
                benefit6: 'SAML/SSO',
                benefit7: 'カスタム分析とレポート',
                benefit8: '予算管理',
            },
            thisIsYourCurrentPlan: '現在ご利用中のプランです',
            downgrade: 'Collect へダウングレード',
            upgrade: 'Control にアップグレード',
            addMembers: 'メンバーを追加',
            saveWithExpensifyTitle: 'Expensify カードで節約',
            saveWithExpensifyDescription: 'Expensify Card のキャッシュバックが Expensify の請求額をどれだけ削減できるか、当社の節約額計算ツールで確認しましょう。',
            saveWithExpensifyButton: '詳細はこちら',
        },
        compareModal: {
            comparePlans: 'プランを比較',
            subtitle: `<muted-text>あなたに最適なプランで、必要な機能をすべてご利用いただけます。各プランの機能を詳しく知るには、<a href="${CONST.PRICING}">料金ページをご覧ください</a>。</muted-text>`,
        },
        details: {
            title: 'サブスクリプションの詳細',
            annual: '年間サブスクリプション',
            taxExempt: '非課税ステータスを申請',
            taxExemptEnabled: '非課税',
            taxExemptStatus: '非課税ステータス',
            payPerUse: '従量課金',
            subscriptionSize: 'サブスクリプションのサイズ',
            headsUp:
                'お知らせ：今サブスクリプションの人数を設定しない場合、最初の1か月目の有効メンバー数に自動的に設定されます。その後、今後12か月間は少なくともこの人数分のメンバー料金をお支払いいただくことになります。サブスクリプションの人数はいつでも増やせますが、サブスクリプションが終了するまでは減らすことができません。',
            zeroCommitment: '割引された年間サブスクリプション料金でコミットメントはゼロ',
        },
        subscriptionSize: {
            title: 'サブスクリプションのサイズ',
            yourSize: 'ご利用中のサブスクリプションサイズとは、特定の月にアクティブメンバーが利用できる空席数の合計を指します。',
            eachMonth:
                '毎月、お客様のサブスクリプションでは、上記で設定した人数分までのアクティブメンバーが対象となります。サブスクリプション人数を増やすと、その時点の新しい人数で新たに12か月間のサブスクリプションが開始されます。',
            note: '注：アクティブメンバーとは、あなたの会社ワークスペースに紐づいた経費データを作成、編集、提出、承認、払い戻し、またはエクスポートしたことがあるユーザーを指します。',
            confirmDetails: '新しい年額サブスクリプションの詳細を確認してください：',
            subscriptionSize: 'サブスクリプションのサイズ',
            activeMembers: ({size}: SubscriptionSizeParams) => `月あたりアクティブメンバー数：${size}`,
            subscriptionRenews: 'サブスクリプションの更新',
            youCantDowngrade: '年間サブスクリプション期間中はダウングレードできません。',
            youAlreadyCommitted: ({size, date}: SubscriptionCommitmentParams) =>
                `すでに、${date} まで毎月 ${size} 人のアクティブメンバー分の年間サブスクリプションにコミット済みです。自動更新を無効にすると、${date} から従量課金サブスクリプションに切り替えることができます。`,
            error: {
                size: '有効なサブスクリプションのサイズを入力してください',
                sameSize: '現在のサブスクリプションの人数とは異なる数字を入力してください',
            },
        },
        paymentCard: {
            addPaymentCard: '支払カードを追加',
            enterPaymentCardDetails: '支払いカードの詳細を入力してください',
            security: 'Expensify は PCI-DSS に準拠し、銀行レベルの暗号化を使用し、冗長化されたインフラストラクチャを活用してお客様のデータを保護します。',
            learnMoreAboutSecurity: 'セキュリティの詳細はこちらをご覧ください。',
        },
        subscriptionSettings: {
            title: 'サブスクリプション設定',
            summary: ({subscriptionType, subscriptionSize, autoRenew, autoIncrease}: SubscriptionSettingsSummaryParams) =>
                `サブスクリプションの種類: ${subscriptionType}、サブスクリプションの規模: ${subscriptionSize}、自動更新: ${autoRenew}、年間シート数の自動増加: ${autoIncrease}`,
            none: 'なし',
            on: 'オン',
            off: 'オフ',
            annual: '年間',
            autoRenew: '自動更新',
            autoIncrease: '年次シート数を自動増加',
            saveUpTo: ({amountWithCurrency}: SubscriptionSettingsSaveUpToParams) => `アクティブメンバー1人あたり毎月最大${amountWithCurrency}を節約`,
            automaticallyIncrease:
                'アクティブメンバー数がご契約の席数を超えた場合に対応できるよう、年間席数を自動的に増やします。注記：これにより、年間サブスクリプションの終了日が延長されます。',
            disableAutoRenew: '自動更新を無効にする',
            helpUsImprove: 'Expensify の改善にご協力ください',
            whatsMainReason: '自動更新を無効にする主な理由を教えてください。',
            renewsOn: ({date}: SubscriptionSettingsRenewsOnParams) => `更新日：${date}`,
            pricingConfiguration: '料金は構成内容によって異なります。最もお得にご利用いただくには、年額サブスクリプションを選択し、Expensify Card をご利用ください。',
            learnMore: {
                part1: '詳しくは当社のサイトをご覧ください',
                pricingPage: '料金ページ',
                part2: 'または、お使いの言語で当社チームとチャットする',
                adminsRoom: '#admins ルーム。',
            },
            estimatedPrice: '見積価格',
            changesBasedOn: 'これは、お客様のExpensify Cardの利用状況と、以下のサブスクリプションオプションに基づいて変動します。',
        },
        requestEarlyCancellation: {
            title: '早期解約をリクエスト',
            subtitle: '早期解約をリクエストしている主な理由は何ですか？',
            subscriptionCanceled: {
                title: 'サブスクリプションをキャンセルしました',
                subtitle: '年間サブスクリプションは解約されました。',
                info: 'ワークスペースを従量課金制で使い続けたい場合は、これで準備完了です。',
                preventFutureActivity: ({workspacesListRoute}: WorkspacesListRouteParams) =>
                    `今後のアクティビティや料金を防ぎたい場合は、<a href="${workspacesListRoute}">ワークスペースを削除</a>する必要があります。なお、ワークスペースを削除すると、当月中に発生した未精算のアクティビティについては料金が発生します。`,
            },
            requestSubmitted: {
                title: 'リクエストを送信しました',
                subtitle:
                    'サブスクリプションの解約をご希望とのことをお知らせいただきありがとうございます。現在ご依頼の内容を確認しており、まもなく<concierge-link>Concierge</concierge-link>とのチャットを通じてご連絡いたします。',
            },
            acknowledgement: `早期解約を申請することにより、私は、Expensify は Expensify の<a href=${CONST.OLD_DOT_PUBLIC_URLS.TERMS_URL}>利用規約</a>または私と Expensify 間のその他の適用されるサービス契約の下で、かかる申請を認める義務を負わないこと、そして Expensify がそのような申請を認めるかどうかについて単独の裁量権を有することを理解し、これに同意します。`,
        },
    },
    feedbackSurvey: {
        tooLimited: '機能の改善が必要',
        tooExpensive: '高すぎる',
        inadequateSupport: '不十分なカスタマーサポート',
        businessClosing: '会社の閉鎖、規模縮小、または買収',
        additionalInfoTitle: 'どのソフトウェアへ移行しますか？その理由も教えてください。',
        additionalInfoInputLabel: 'あなたの回答',
    },
    roomChangeLog: {
        updateRoomDescription: '部屋の説明を次の内容に設定:',
        clearRoomDescription: 'ルームの説明をクリアしました',
        changedRoomAvatar: 'ルームのアバターを変更しました',
        removedRoomAvatar: 'ルームアバターを削除しました',
    },
    delegate: {
        switchAccount: 'アカウントを切り替える',
        copilotDelegatedAccess: 'Copilot：代理アクセス',
        copilotDelegatedAccessDescription: '他のメンバーがあなたのアカウントにアクセスできるようにします。',
        addCopilot: 'Copilot を追加',
        membersCanAccessYourAccount: '次のメンバーはあなたのアカウントにアクセスできます:',
        youCanAccessTheseAccounts: 'これらのアカウントには、アカウントスイッチャーからアクセスできます。',
        role: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'フル';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '制限付き';
                default:
                    return '';
            }
        },
        genericError: 'おっと、問題が発生しました。もう一度お試しください。',
        onBehalfOfMessage: ({delegator}: DelegatorParams) => `${delegator} の代理として`,
        accessLevel: 'アクセスレベル',
        confirmCopilot: '以下でコパイロットを確認してください。',
        accessLevelDescription: '以下からアクセスレベルを選択してください。Full と Limited の両方のアクセスレベルで、コパイロットはすべての会話と経費を表示できます。',
        roleDescription: ({role}: OptionalParam<DelegateRoleParams> = {}) => {
            switch (role) {
                case CONST.DELEGATE_ROLE.ALL:
                    return 'あなたの代わりに、アカウント内のすべての操作を他のメンバーに許可します。チャット、申請、承認、支払い、設定の更新などが含まれます。';
                case CONST.DELEGATE_ROLE.SUBMITTER:
                    return '別のメンバーがあなたに代わって、あなたのアカウントでほとんどの操作を行えるようにします。ただし、承認、支払い、却下、および保留は含まれません。';
                default:
                    return '';
            }
        },
        removeCopilot: 'Copilot を削除',
        removeCopilotConfirmation: 'このコパイロットを削除してもよろしいですか？',
        changeAccessLevel: 'アクセスレベルを変更',
        makeSureItIsYou: 'あなた本人であることを確認しましょう',
        enterMagicCode: ({contactMethod}: EnterMagicCodeParams) => `${contactMethod} に送信されたマジックコードを入力して、コパイロットを追加してください。1～2分以内に届くはずです。`,
        enterMagicCodeUpdate: ({contactMethod}: EnterMagicCodeParams) => `${contactMethod} に送信されたマジックコードを入力して、コパイロットを更新してください。`,
        notAllowed: 'そんなに急がないでください…',
        noAccessMessage: dedent(`
            コパイロットとして、このページにアクセスすることはできません。申し訳ありません。
        `),
        notAllowedMessage: ({accountOwnerEmail}: AccountOwnerParams) =>
            `${accountOwnerEmail} の<a href="${CONST.DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK}">コパイロット</a>として、この操作を行う権限がありません。申し訳ありません。`,
        copilotAccess: 'Copilotアクセス',
    },
    debug: {
        debug: 'デバッグ',
        details: '詳細',
        JSON: 'JSON',
        reportActions: 'アクション',
        reportActionPreview: 'プレビュー',
        nothingToPreview: 'プレビューするものはありません',
        editJson: 'JSONを編集:',
        preview: 'プレビュー:',
        missingProperty: ({propertyName}: MissingPropertyParams) => `${propertyName} がありません`,
        invalidProperty: ({propertyName, expectedType}: InvalidPropertyParams) => `無効なプロパティ: ${propertyName} - 期待される型: ${expectedType}`,
        invalidValue: ({expectedValues}: InvalidValueParams) => `無効な値 - 期待される値: ${expectedValues}`,
        missingValue: '値がありません',
        createReportAction: 'レポート作成アクション',
        reportAction: 'レポートアクション',
        report: 'レポート',
        transaction: '取引',
        violations: '違反',
        transactionViolation: '取引違反',
        hint: 'データの変更はバックエンドに送信されません',
        textFields: 'テキストフィールド',
        numberFields: '数値フィールド',
        booleanFields: 'ブール型フィールド',
        constantFields: '定数フィールド',
        dateTimeFields: '日時フィールド',
        date: '日付',
        time: '時間',
        none: 'なし',
        visibleInLHN: 'LHN に表示',
        GBR: 'GBR',
        RBR: 'RBR',
        true: '有効',
        false: '偽',
        viewReport: 'レポートを表示',
        viewTransaction: '取引を表示',
        createTransactionViolation: '取引違反を作成',
        reasonVisibleInLHN: {
            hasDraftComment: '下書きコメントあり',
            hasGBR: 'GBR を保有',
            hasRBR: 'RBR あり',
            pinnedByUser: 'メンバーによるピン留め',
            hasIOUViolations: 'IOU 違反があります',
            hasAddWorkspaceRoomErrors: 'ワークスペースルームの追加エラーがあります',
            isUnread: '未読（フォーカスモード）',
            isArchived: 'アーカイブ済み（最新モード）',
            isSelfDM: '自分へのDMです',
            isFocused: '一時的にフォーカスされています',
        },
        reasonGBR: {
            hasJoinRequest: '参加リクエストあり（管理者ルーム）',
            isUnreadWithMention: '未読（メンションあり）',
            isWaitingForAssigneeToCompleteAction: '担当者がアクションを完了するのを待機中',
            hasChildReportAwaitingAction: '対応待ちの子レポートがあります',
            hasMissingInvoiceBankAccount: '請求書の銀行口座が不足しています',
            hasUnresolvedCardFraudAlert: '未解決のカード不正利用アラートがあります',
        },
        reasonRBR: {
            hasErrors: 'レポートまたはレポートアクションのデータにエラーがあります',
            hasViolations: '違反あり',
            hasTransactionThreadViolations: 'トランザクションスレッド違反があります',
        },
        indicatorStatus: {
            theresAReportAwaitingAction: '対応待ちのレポートがあります',
            theresAReportWithErrors: 'エラーのあるレポートがあります',
            theresAWorkspaceWithCustomUnitsErrors: 'カスタム単位のエラーがあるワークスペースがあります',
            theresAProblemWithAWorkspaceMember: 'ワークスペースメンバーに問題があります',
            theresAProblemWithAWorkspaceQBOExport: 'ワークスペース接続のエクスポート設定に問題がありました。',
            theresAProblemWithAContactMethod: '連絡方法に問題があります',
            aContactMethodRequiresVerification: '連絡方法には認証が必要です',
            theresAProblemWithAPaymentMethod: '支払い方法に問題があります',
            theresAProblemWithAWorkspace: 'ワークスペースに問題があります',
            theresAProblemWithYourReimbursementAccount: '払い戻し口座に問題があります',
            theresABillingProblemWithYourSubscription: 'ご利用中のサブスクリプションに請求上の問題があります',
            yourSubscriptionHasBeenSuccessfullyRenewed: 'サブスクリプションは正常に更新されました',
            theresWasAProblemDuringAWorkspaceConnectionSync: 'ワークスペース接続の同期中に問題が発生しました',
            theresAProblemWithYourWallet: 'あなたのウォレットに問題が発生しています',
            theresAProblemWithYourWalletTerms: 'ウォレットの利用規約に問題があります',
        },
    },
    emptySearchView: {
        takeATestDrive: '試してみる',
    },
    migratedUserWelcomeModal: {
        title: 'New Expensify へようこそ！',
        subtitle: '従来のエクスペリエンスで気に入っていただいていたすべての要素はそのままに、生活をさらに便利にする数多くのアップグレードを加えました。',
        confirmText: 'さあ、行こう！',
        helpText: '2分デモを試す',
        features: {
            search: 'モバイル、Web、デスクトップでより強力な検索',
            concierge: '経費精算を自動化するための内蔵Concierge AI',
            chat: '経費ごとにチャットして、疑問をすばやく解決しましょう',
        },
    },
    productTrainingTooltip: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        conciergeLHNGBR: '<tooltip>始めるなら<strong>こちら！</strong></tooltip>',
        saveSearchTooltip: '<tooltip><strong>保存した検索の名前を変更</strong>できます！</tooltip>',
        accountSwitcher: '<tooltip>ここから<strong>Copilot アカウント</strong>にアクセスできます</tooltip>',
        scanTestTooltip: {
            main: '<tooltip><strong>テストレシートをスキャン</strong>して、どのように動作するか見てみましょう！</tooltip>',
            manager: '<tooltip>お試しには<strong>テストマネージャー</strong>を選択してください！</tooltip>',
            confirmation: '<tooltip>さあ、<strong>経費を提出</strong>して、どんな魔法が起こるか見てみましょう！</tooltip>',
            tryItOut: '試してみる',
        },
        outstandingFilter: '<tooltip><strong>承認が必要</strong>な経費を\n絞り込みます</tooltip>',
        scanTestDriveTooltip: '<tooltip>このレシートを送信して\n<strong>試用を完了しましょう！</strong></tooltip>',
    },
    discardChangesConfirmation: {
        title: '変更を破棄しますか？',
        body: '行った変更を破棄してもよろしいですか？',
        confirmText: '変更を破棄',
    },
    scheduledCall: {
        book: {
            title: '通話を予約',
            description: 'ご都合のよい時間をお選びください。',
            slots: ({date}: {date: string}) => `<muted-text><strong>${date}</strong> の空き時間</muted-text>`,
        },
        confirmation: {
            title: '通話を確認',
            description: '以下の内容をご確認ください。通話を確定すると、詳細情報を記載した招待状をお送りします。',
            setupSpecialist: 'セットアップ専任担当',
            meetingLength: 'ミーティングの長さ',
            dateTime: '日時',
            minutes: '30 分',
        },
        callScheduled: '通話を予約しました',
    },
    autoSubmitModal: {
        title: 'すべて問題なく送信されました！',
        description: 'すべての警告と違反がクリアされたので：',
        submittedExpensesTitle: 'これらの経費は提出済みです',
        submittedExpensesDescription: 'これらの経費は承認者に送信されていますが、承認されるまでは引き続き編集できます。',
        pendingExpensesTitle: '保留中の経費は移動されました',
        pendingExpensesDescription: '未処理のカード経費は、計上されるまで別のレポートに移動されました。',
    },
    testDrive: {
        quickAction: {
            takeATwoMinuteTestDrive: '2分間のテストドライブを試す',
        },
        modal: {
            title: 'お試し利用する',
            description: '短いプロダクトツアーで、すばやく使い方を理解しましょう。',
            confirmText: 'テストドライブを開始',
            helpText: 'スキップ',
            employee: {
                description:
                    '<muted-text>あなたのチームに<strong>Expensify を3か月間無料</strong>でお試しいただけます！以下に上司のメールアドレスを入力して、テスト経費を送信してください。</muted-text>',
                email: '上司のメールアドレスを入力してください',
                error: 'そのメンバーはワークスペースのオーナーです。テストするために新しいメンバーを入力してください。',
            },
        },
        banner: {
            currentlyTestDrivingExpensify: '現在、Expensify をお試し中です',
            readyForTheRealThing: '本番の準備はできましたか？',
            getStarted: 'はじめる',
        },
        employeeInviteMessage: ({name}: EmployeeInviteMessageParams) => `# ${name} さんがあなたを Expensify のお試しに招待しました
やあ！最速で経費精算ができる Expensify を *3か月間無料* でお試しできるようにしました。

Expensify の使い方をお見せするための *テスト領収書* をお送りします。`,
    },
    export: {
        basicExport: '基本エクスポート',
        reportLevelExport: '全データ - レポートレベル',
        expenseLevelExport: '全データ - 経費レベル',
        exportInProgress: 'エクスポートを実行中',
        conciergeWillSend: 'まもなくConciergeがファイルを送信します。',
    },
    domain: {
        notVerified: '未確認',
        retry: '再試行',
        verifyDomain: {
            title: 'ドメインを確認',
            beforeProceeding: ({domainName}: {domainName: string}) => `続行する前に、<strong>${domainName}</strong> の DNS 設定を更新して、あなたが所有者であることを確認してください。`,
            accessYourDNS: ({domainName}: {domainName: string}) => `DNS プロバイダーにアクセスし、<strong>${domainName}</strong> の DNS 設定を開いてください。`,
            addTXTRecord: '次のTXTレコードを追加してください:',
            saveChanges: '変更を保存し、こちらに戻ってドメインを確認してください。',
            youMayNeedToConsult: `検証を完了するには、組織の IT 部門に相談する必要がある場合があります。<a href="${CONST.DOMAIN_VERIFICATION_HELP_URL}">詳細はこちら</a>。`,
            warning: '確認後、お客様のドメイン上のすべての Expensify メンバーに、そのアカウントがお客様のドメインで管理されることを知らせるメールが送信されます。',
            codeFetchError: '認証コードを取得できませんでした',
            genericError: 'ドメインを確認できませんでした。もう一度お試しのうえ、問題が解決しない場合はConciergeまでお問い合わせください。',
        },
        domainVerified: {
            title: 'ドメインが確認されました',
            header: 'おおっ！ドメインが認証されました',
            description: ({domainName}: {domainName: string}) =>
                `<muted-text><centered-text>ドメイン <strong>${domainName}</strong> は正常に認証されました。これで、SAML やその他のセキュリティ機能を設定できるようになりました。</centered-text></muted-text>`,
        },
        saml: 'SAML',
        samlFeatureList: {
            title: 'SAML シングルサインオン (SSO)',
            subtitle: ({domainName}: {domainName: string}) =>
                `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML SSO</a> は、<strong>${domainName}</strong> のメールアドレスを持つメンバーが Expensify にログインする方法を、より細かく管理できるセキュリティ機能です。有効化するには、自分が権限を持つ会社管理者であることを確認する必要があります。</muted-text>`,
            fasterAndEasierLogin: 'より速く、簡単にログイン',
            moreSecurityAndControl: 'さらに高いセキュリティと管理権限',
            onePasswordForAnything: 'すべてをひとつのパスワードで',
        },
        goToDomain: 'ドメインへ移動',
        samlLogin: {
            title: 'SAML ログイン',
            subtitle: `<muted-text><a href="${CONST.SAML_HELP_URL}">SAML シングルサインオン (SSO)</a> でメンバーのサインインを設定します。</muted-text>`,
            enableSamlLogin: 'SAML ログインを有効にする',
            allowMembers: 'メンバーが SAML を使用してログインできるようにします。',
            requireSamlLogin: 'SAML ログインを必須にする',
            anyMemberWillBeRequired: '別の方法でサインインしているメンバーは、SAML を使用して再認証する必要があります。',
            enableError: 'SAML 有効化設定を更新できませんでした',
            requireError: 'SAML 必須設定を更新できませんでした',
        },
        samlConfigurationDetails: {
            title: 'SAML 構成の詳細',
            subtitle: 'これらの詳細を使用して SAML を設定してください。',
            identityProviderMetaData: 'IDプロバイダーのメタデータ',
            entityID: 'エンティティ ID',
            nameIDFormat: '名前 ID 形式',
            loginUrl: 'ログインURL',
            acsUrl: 'ACS（Assertion Consumer Service）URL',
            logoutUrl: 'ログアウトURL',
            sloUrl: 'SLO（シングルログアウト）URL',
            serviceProviderMetaData: 'サービスプロバイダーメタデータ',
            oktaScimToken: 'Okta SCIM トークン',
            revealToken: 'トークンを表示',
            fetchError: 'SAML 設定の詳細を取得できませんでした',
            setMetadataGenericError: 'SAMLメタデータを設定できませんでした',
        },
    },
};
// IMPORTANT: This line is manually replaced in generate translation files by scripts/generateTranslations.ts,
// so if you change it here, please update it there as well.
export default translations;
